#!/usr/bin/env bash
# The ONE deploy-gate list (IMPROVEMENT_PLAN §1.4 S5; closes STATUS §7 "One deploy-gate list"), in three sessions
# that can run in three cloud sessions at once, or one after another here.
#
#   bash tests/scripts/ws-deploy-gates.sh --list            # print the gate list (session, kind, command, present?)
#   bash tests/scripts/ws-deploy-gates.sh --session 1       # node gates + the browser gates that are not screen sweeps
#   bash tests/scripts/ws-deploy-gates.sh --session 2       # ws-screen-slots + ws-chromebook-fit, sharded over the two
#                                                           # browser slots, + the big-board and dark-mode sweeps
#   bash tests/scripts/ws-deploy-gates.sh --session 3       # coverage matrix (affected rows), digests hook, owner go
#   bash tests/scripts/ws-deploy-gates.sh --all             # sessions 1, 2, 3 in sequence
#   bash tests/scripts/ws-deploy-gates.sh --deploy-check [--lanes-dir design/lanes] [--status-dir design/status]
#                                                           # refuse a deploy that makes a family live with no
#                                                           # "Owner go: <family>, <date>" line (§1.6.3 step 6)
#   bash tests/scripts/ws-deploy-gates.sh --self-test       # the owner-go check on its fixtures (must refuse / pass)
#                                                           # and the flake rule on a synthetic gate (FLAKE, BLOCKED)
#
# Session 1  every node gate (in parallel with the browser gates; 4 cores = 2 browsers + 2 node workers):
#            ws-code-snapshot, ws-codec-registry, ws-standards, ws-search-terms, ws-providers-unit, ws-layout-unit,
#            ws-panes-unit, ws-supports-unit, ws-ink-unit, ws-plain-words --check, ws-node-lint and
#            ws-envelope --self-test (SKIPPED (tool not built) until they exist); and the browser gates, two at a
#            time: ws-presets-unit, ws-anchors-unit, ws-boot-smoke, ws-content-audit, ws-print-lint --source kit
#            (--baseline design/audit/baselines/print-lint.json when it exists; else the accepted limit
#            MQ_PRINT_LINT_LIMIT, default 461 findings / 33 documents), ws-screen-answer, ws-share-options,
#            ws-teacher-shell, -library, -preview, -quiz, ws-teacher-wrm and ws-teacher-wrm --fallback.
# Session 2  ws-screen-slots in MQ_SLOTS_SHARDS parts (default 4) with --baseline design/audit/baselines/screen-slots.json,
#            ws-chromebook-fit in MQ_FIT_SHARDS parts (default 2), and the sweeps on the pinned sample
#            (tests/fixtures/precritic/sweep-sample.json): ws-screen-slots --dark / --bigboard, ws-chromebook-fit
#            --dark / --bigboard (chromebook-fit's standing sweep failures are pinned in the sample file).
# Session 3  ws-coverage-matrix (MQ_COVERAGE_ARGS, default `--all --affected <MQ_DEPLOY_BASE>..HEAD --baseline
#            design/audit/matrix/baseline.json --slots 2 --batch 9`: the matrix runs two print-lint processes, one per
#            slot, batching rows to amortise the browser start; measured 0.31-0.38 documents/s on two slots) when the tool exists, else SKIPPED (tool not built) - never OK; the digests
#            hook (M4 record/replay) prints NOT YET; the owner-go check.
# Prerequisites, checked before any session runs: PyMuPDF (python3 -c "import fitz"; fix: pip install pymupdf),
# puppeteer, flock. A missing one fails at once with its fix.
#
# Every browser gate runs through /tmp/mq-browser-run.sh (the two-slot runner, MQ_BROWSER_WAIT_LOG=1, so the slot
# wait is logged and reported in its own column). Each gate is timed; the runner prints a table (session, gate,
# result, seconds, slot wait), then per-session and total wall clock, and appends one JSON line per session to
# design/audit/baselines/deploy-gate-timings.jsonl (commit, session, wall seconds, per-gate seconds).
#
# Flakes (§1.3): a FAIL is re-run once, alone, after its session. If it then passes, it is still a defect: a line
# goes to design/audit/baselines/flakes.jsonl (gate, item when the log names one, commit, date) and the gate
# shows FLAKE; if the same gate + item already had a flake line, the gate shows BLOCKED and the deploy fails.
#
# Results: OK, FAIL, FLAKE (passed alone, logged), BLOCKED (second flake), SKIPPED (tool not built), NOT YET.
# Exit 1 on any FAIL or BLOCKED; 0 otherwise. Logs: $MQ_GATES_LOGDIR (default /tmp/mq-deploy-gates/<stamp>).
# Last line: `ws-deploy-gates: OK` or `ws-deploy-gates: FAIL`.
set -u

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT" || exit 2
RUNNER=/tmp/mq-browser-run.sh
TIMINGS=design/audit/baselines/deploy-gate-timings.jsonl
FLAKES=design/audit/baselines/flakes.jsonl
declare -A SES_WALL
SLOTS_BASE=design/audit/baselines/screen-slots.json
PRINT_BASE=design/audit/baselines/print-lint.json
SAMPLE=tests/fixtures/precritic/sweep-sample.json
SLOTS_SHARDS=${MQ_SLOTS_SHARDS:-4}
FIT_SHARDS=${MQ_FIT_SHARDS:-2}
MATRIX_SHARDS=${MQ_MATRIX_SHARDS:-2}
NODE_WORKERS=${MQ_NODE_WORKERS:-2}
BROWSER_WORKERS=${MQ_BROWSER_WORKERS:-2}
PRINT_LINT_LIMIT=${MQ_PRINT_LINT_LIMIT:-461/33}
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
[ -n "$(git status --porcelain 2>/dev/null | grep -v '^??' | head -n 1)" ] && COMMIT="$COMMIT+dirty"

usage() { sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; }

# ---------------------------------------------------------------------------------------------- the owner-go check
# A lane manifest (design/lanes/<lane>/manifest.json, §1.6.6) lists what the deploy makes live:
#   {"lane": "<lane>", "families": ["<family>", ...], "skills": [{"category": "...", "skill": "...", "family": "..."}],
#    "makesLive": true}
# Every family in "families", and every skill's "family" (its category when it has none), needs the line
#   Owner go: <family>, <YYYY-MM-DD>
# in the lane's status file (<status-dir>/<lane>.md). "makesLive": false (a manifest kept for a lane that is not
# in this deploy) is skipped. No manifests: nothing is made live by a lane, OK.
deploy_check() {
  local lanes=$1 status=$2
  node - "$lanes" "$status" <<'EOF'
const fs = require('fs'); const path = require('path');
const [lanes, status] = process.argv.slice(2);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let manifests = [];
try { manifests = fs.readdirSync(lanes).map((d) => path.join(lanes, d, 'manifest.json')).filter((f) => fs.existsSync(f)); } catch (e) { /* no lanes dir */ }
if (!manifests.length) { console.log(`owner go: no lane manifests under ${lanes}; no family is made live by a lane`); console.log('owner-go: OK'); process.exit(0); }
let refused = 0, checked = 0;
for (const f of manifests) {
  let m;
  try { m = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`REFUSED ${f}: not valid JSON (${e.message})`); refused++; continue; }
  const lane = m.lane || path.basename(path.dirname(f));
  if (m.makesLive === false) { console.log(`${lane}: makesLive false, not in this deploy`); continue; }
  const fams = new Set([...(m.families || []), ...(m.skills || []).map((s) => s.family || s.category).filter(Boolean)]);
  const sf = path.join(status, `${lane}.md`);
  const text = fs.existsSync(sf) ? fs.readFileSync(sf, 'utf8') : '';
  for (const fam of fams) {
    checked++;
    const hit = new RegExp(`^[\\s>*-]*Owner go: ${esc(fam)}, (\\d{4}-\\d{2}-\\d{2})\\b`, 'm').exec(text);
    if (hit) console.log(`${lane}: ${fam} - Owner go ${hit[1]}`);
    else { refused++; console.log(`REFUSED ${lane}: the deploy makes "${fam}" live and ${fs.existsSync(sf) ? sf : sf + ' (missing)'} has no "Owner go: ${fam}, <date>" line`); }
  }
}
console.log(`owner go: ${manifests.length} manifest(s), ${checked} famil${checked === 1 ? 'y' : 'ies'}, ${refused} refused`);
console.log(refused ? 'owner-go: FAIL' : 'owner-go: OK');
process.exit(refused ? 1 : 0);
EOF
}

self_test() {
  local fx=tests/fixtures/precritic/deploy bad=0
  echo "-- fixture with every go line (must pass)"
  if deploy_check "$fx/with-go/lanes" "$fx/with-go/status"; then echo "  ok   passes"; else echo "  FAIL refused a deploy with every go line"; bad=1; fi
  echo "-- fixture missing one go line (must be refused)"
  if deploy_check "$fx/no-go/lanes" "$fx/no-go/status"; then echo "  FAIL let a family go live with no go line"; bad=1; else echo "  ok   refused"; fi
  echo "-- no manifests (must pass: nothing made live by a lane)"
  if deploy_check "$fx/none/lanes" "$fx/none/status"; then echo "  ok   passes"; else echo "  FAIL"; bad=1; fi
  # the flake rule (§1.3) on a synthetic gate that fails once, then passes alone; flakes and timings go to temp files
  echo "-- flake rule: a gate that fails, then passes alone (FLAKE, logged); the same again (BLOCKED)"
  local tmp; tmp=$(mktemp -d)
  FLAKES="$tmp/flakes.jsonl"; TIMINGS="$tmp/timings.jsonl"
  G_SES=(T); G_KIND=(node); G_NAME=("synthetic flaky gate")
  G_CMD=("if [ -f $tmp/m ]; then rm $tmp/m; echo 'addition:add_facts ok'; else touch $tmp/m; echo 'addition:add_facts card doubled'; exit 1; fi")
  local r1 r2
  : > "$RES"; run_session T 2>/dev/null; r1=$(cut -f3 "$RES")
  : > "$RES"; run_session T 2>/dev/null; r2=$(cut -f3 "$RES")
  local lines; lines=$(wc -l < "$FLAKES")
  if [ "$r1" = FLAKE ] && [ "$r2" = BLOCKED ] && [ "$lines" = 2 ] && grep -q '"item":"addition:add_facts"' "$FLAKES"; then echo "  ok   FLAKE then BLOCKED, 2 flake lines with the item"
  else echo "  FAIL first $r1, second $r2, $lines flake line(s)"; bad=1; fi
  rm -rf "$tmp"
  [ $bad = 0 ] && echo 'ws-deploy-gates --self-test: OK' || echo 'ws-deploy-gates --self-test: FAIL'
  return $bad
}

# ---------------------------------------------------------------------------------------------- the gate list
# G_SES / G_KIND / G_NAME / G_CMD: kind node (plain), browser (through the runner), fn (a function here),
# skip (SKIPPED (tool not built)), notyet (NOT YET).
G_SES=(); G_KIND=(); G_NAME=(); G_CMD=()
add() { G_SES+=("$1"); G_KIND+=("$2"); G_NAME+=("$3"); G_CMD+=("$4"); }
node_gate() {   # session name file [args]: a node gate, or SKIPPED when the file is not there
  local s=$1 n=$2 f=$3; shift 3
  if [ -f "tests/scripts/$f" ]; then add "$s" node "$n" "node tests/scripts/$f $*"; else add "$s" skip "$n" "tests/scripts/$f"; fi
}
browser_gate() {
  local s=$1 n=$2 f=$3; shift 3
  if [ -f "tests/scripts/$f" ]; then add "$s" browser "$n" "node tests/scripts/$f $*"; else add "$s" skip "$n" "tests/scripts/$f"; fi
}
first_of() { local f; for f in "$@"; do [ -f "tests/scripts/$f" ] && { echo "$f"; return 0; }; done; echo "$1"; }

build_list() {
  # session 1: browser gates first in rough longest-first order (the two browser workers take them in this order)
  browser_gate 1 ws-content-audit ws-content-audit.cjs
  if [ -f "$PRINT_BASE" ]; then browser_gate 1 "ws-print-lint --source kit --baseline" ws-print-lint.cjs --source kit --baseline "$PRINT_BASE"
  else add 1 fn "ws-print-lint --source kit (limit $PRINT_LINT_LIMIT)" "print_lint_limit"; fi
  browser_gate 1 ws-teacher-wrm ws-teacher-wrm.cjs
  browser_gate 1 "ws-teacher-wrm --fallback" ws-teacher-wrm.cjs --fallback
  browser_gate 1 ws-screen-answer ws-screen-answer.cjs
  browser_gate 1 ws-teacher-shell ws-teacher-shell.cjs
  browser_gate 1 ws-teacher-library ws-teacher-library.cjs
  browser_gate 1 ws-teacher-preview ws-teacher-preview.cjs
  browser_gate 1 ws-teacher-quiz ws-teacher-quiz.cjs
  browser_gate 1 ws-share-options ws-share-options.cjs
  browser_gate 1 ws-presets-unit ws-presets-unit.mjs
  browser_gate 1 ws-anchors-unit ws-anchors-unit.mjs
  browser_gate 1 ws-boot-smoke ws-boot-smoke.cjs
  node_gate 1 ws-code-snapshot ws-code-snapshot.mjs
  node_gate 1 ws-codec-registry ws-codec-registry.mjs
  node_gate 1 ws-standards ws-standards.cjs
  node_gate 1 ws-search-terms ws-search-terms.cjs
  node_gate 1 ws-providers-unit ws-providers-unit.mjs
  node_gate 1 ws-layout-unit ws-layout-unit.mjs
  node_gate 1 ws-panes-unit ws-panes-unit.mjs
  node_gate 1 ws-supports-unit ws-supports-unit.mjs
  node_gate 1 ws-ink-unit ws-ink-unit.mjs
  node_gate 1 "ws-plain-words --check" ws-plain-words.mjs --check
  node_gate 1 ws-node-lint "$(first_of ws-node-lint.mjs ws-node-lint.cjs)"
  node_gate 1 "ws-envelope --self-test" "$(first_of ws-envelope.mjs ws-envelope.cjs)" --self-test
  # session 2: the long screen sweeps, sharded, then the two sweep modes on the pinned sample
  local i
  for i in $(seq 1 "$SLOTS_SHARDS"); do browser_gate 2 "ws-screen-slots --shard $i/$SLOTS_SHARDS" ws-screen-slots.cjs --shard "$i/$SLOTS_SHARDS" --baseline "$SLOTS_BASE"; done
  for i in $(seq 1 "$FIT_SHARDS"); do browser_gate 2 "ws-chromebook-fit --shard $i/$FIT_SHARDS" ws-chromebook-fit.cjs --shard "$i/$FIT_SHARDS" --baseline "$SAMPLE"; done
  browser_gate 2 "ws-chromebook-fit --dark" ws-chromebook-fit.cjs --dark --baseline "$SAMPLE"
  browser_gate 2 "ws-chromebook-fit --bigboard" ws-chromebook-fit.cjs --bigboard --baseline "$SAMPLE"
  browser_gate 2 "ws-screen-slots --dark" ws-screen-slots.cjs --dark --baseline "$SLOTS_BASE"
  browser_gate 2 "ws-screen-slots --bigboard" ws-screen-slots.cjs --bigboard --baseline "$SLOTS_BASE"
  # session 3
  local cm; cm=$(first_of ws-coverage-matrix.cjs ws-coverage-matrix.mjs)
  # the matrix rows are print-lint kit documents (≈ 5.4 s each, lead speed audit 2026-10-23): split over both slots
  # The matrix takes its own browser slots (--slots 2: one print-lint process per slot through mq-browser-run.sh), so it
  # runs as a node gate: wrapping it in browser_gate would hold a slot while its children wait for one. Affected rows are
  # those a change since the deployed tip reaches (MQ_DEPLOY_BASE, default the merge base with origin/master).
  local base; base=${MQ_DEPLOY_BASE:-$(git merge-base origin/master HEAD 2>/dev/null || echo HEAD~1)}
  local cargs=${MQ_COVERAGE_ARGS:-"--all --affected $base..HEAD --baseline design/audit/matrix/baseline.json --slots 2 --batch 9"}
  # shellcheck disable=SC2086
  node_gate 3 "ws-coverage-matrix $cargs" "$cm" $cargs
  add 3 notyet "digests hook (M4 record/replay)" "the tip's digests (§1.6.2, ≈ 8 min) need M4 record/replay, which is not built"
  add 3 fn "owner go (lane manifests)" "deploy_check design/lanes design/status"
}

# The print-lint gate before its per-skill baseline is pinned: the accepted standing limit (STATUS: 458-461 / 33).
print_lint_limit() {
  local out lim_f=${PRINT_LINT_LIMIT%/*} lim_d=${PRINT_LINT_LIMIT#*/} line f d
  out=$(MQ_BROWSER_WAIT_LOG=1 "$RUNNER" node tests/scripts/ws-print-lint.cjs --source kit --report-only 2>&1); echo "$out"
  line=$(printf '%s\n' "$out" | grep -E '[0-9]+ finding\(s\) in [0-9]+ document\(s\)' | tail -n 1)
  [ -n "$line" ] || { echo "print-lint: no summary line"; return 1; }
  f=$(printf '%s' "$line" | sed -E 's/.* ([0-9]+) finding\(s\) in ([0-9]+) document\(s\).*/\1/')
  d=$(printf '%s' "$line" | sed -E 's/.* ([0-9]+) finding\(s\) in ([0-9]+) document\(s\).*/\2/')
  echo "print-lint against the accepted limit (no $PRINT_BASE yet): $f findings / $d documents, limit $lim_f / $lim_d"
  [ "$f" -le "$lim_f" ] && [ "$d" -le "$lim_d" ]
}

# ---------------------------------------------------------------------------------------------- running
LOGDIR=${MQ_GATES_LOGDIR:-/tmp/mq-deploy-gates/$(date +%Y%m%d-%H%M%S)-$$}
mkdir -p "$LOGDIR"
RES="$LOGDIR/results.tsv"; : > "$RES"
slug() { printf '%s' "$1" | tr -c 'A-Za-z0-9._-' '_'; }
now_ms() { date +%s%3N; }

run_gate() {   # index [retry]
  local i=$1 tag=${2:-} kind=${G_KIND[$1]} name=${G_NAME[$1]} cmd=${G_CMD[$1]} log t0 t1 rc res wait
  log="$LOGDIR/s${G_SES[$i]}-$(slug "$name")${tag}.log"
  t0=$(now_ms)
  case "$kind" in
    skip)   echo "SKIPPED (tool not built): $cmd" > "$log"; res="SKIPPED"; rc=0 ;;
    notyet) echo "NOT YET: $cmd" > "$log"; res="NOT YET"; rc=0 ;;
    node)   ( eval "$cmd" ) > "$log" 2>&1; rc=$? ;;
    browser) eval "MQ_BROWSER_WAIT_LOG=1 \"\$RUNNER\" $cmd" > "$log" 2>&1; rc=$? ;;
    fn)     ( eval "$cmd" ) > "$log" 2>&1; rc=$? ;;
  esac
  t1=$(now_ms)
  [ "$kind" = skip ] || [ "$kind" = notyet ] || { [ $rc = 0 ] && res=OK || res=FAIL; }
  wait=$(grep -oE 'mq-browser-run: slot [0-9]+ after [0-9]+s' "$log" | grep -oE '[0-9]+s$' | tr -d s | awk '{s+=$1} END {print s+0}')
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "${G_SES[$i]}" "$name" "$res" "$(awk -v a="$t0" -v b="$t1" 'BEGIN{printf "%.1f", (b-a)/1000}')" "$wait" "$log" "$i" >> "$RES$tag"
  echo "  [s${G_SES[$i]}] $res  $name  ($(awk -v a="$t0" -v b="$t1" 'BEGIN{printf "%.0f", (b-a)/1000}') s${wait:+, slot wait ${wait} s})" >&2
}

pop() {   # queue file: print and remove its first line; fail when empty
  ( flock 9; l=$(head -n 1 "$1"); [ -n "$l" ] || exit 1; sed -i '1d' "$1"; printf '%s\n' "$l" ) 9>"$1.lock"
}
# The slot runner polls once a second and is not first-come-first-served: a worker that took its next gate at
# once would win the slot it just freed every time and starve the other worker's waiting gate (seen 2026-10-23:
# a shard waited 90 min). So a worker pauses 3 s between gates, letting a waiting runner take the slot.
worker() { local q=$1 i; while i=$(pop "$q"); do run_gate "$i"; sleep 3; done; }

# The item a FAIL names, when its log names one (the first "category:skill" on a finding line).
item_of() {
  grep -E '^(NEW )?[a-z0-9_]+:[a-z0-9_]+[ ]' "$1" | grep -viE '^(ws-|owner)' | head -n 1 | sed -E 's/^(NEW )?([a-z0-9_]+:[a-z0-9_]+).*/\2/'
}

run_session() {
  local s=$1 i qb="$LOGDIR/q.s$1.browser" qn="$LOGDIR/q.s$1.node" t0 t1 pids=() w
  : > "$qb"; : > "$qn"
  for i in "${!G_SES[@]}"; do
    [ "${G_SES[$i]}" = "$s" ] || continue
    case "${G_KIND[$i]}" in browser|fn) echo "$i" >> "$qb" ;; *) echo "$i" >> "$qn" ;; esac
  done
  echo "== session $s ($(wc -l < "$qb") browser / fn, $(wc -l < "$qn") node / other; logs $LOGDIR)" >&2
  t0=$(now_ms)
  for w in $(seq 1 "$BROWSER_WORKERS"); do worker "$qb" & pids+=($!); done
  for w in $(seq 1 "$NODE_WORKERS"); do worker "$qn" & pids+=($!); done
  for w in "${pids[@]}"; do wait "$w"; done
  # flakes: every FAIL once more, alone
  local line ses name res secs wt log idx item rres
  while IFS=$'\t' read -r ses name res secs wt log idx; do
    [ "$ses" = "$s" ] && [ "$res" = FAIL ] || continue
    echo "  [s$s] re-running $name alone (flake check)" >&2
    : > "$RES.retry"
    run_gate "$idx" ".retry"
    rres=$(cut -f3 "$RES.retry")
    if [ "$rres" = OK ]; then
      item=$(item_of "$log")
      local prior=0
      [ -f "$FLAKES" ] && prior=$(node -e 'const [f,g,it]=process.argv.slice(1);const L=require("fs").readFileSync(f,"utf8").split("\n").filter(Boolean).map(l=>{try{return JSON.parse(l)}catch(e){return {}}});console.log(L.filter(x=>x.gate===g&&(x.item||"")===it).length)' "$FLAKES" "$name" "$item")
      node -e 'const [f,g,it,c,s,log]=process.argv.slice(1);require("fs").appendFileSync(f,JSON.stringify({gate:g,item:it||null,commit:c,date:new Date().toISOString().slice(0,10),session:Number(s),log})+"\n")' "$FLAKES" "$name" "$item" "$COMMIT" "$s" "$log"
      if [ "$prior" -gt 0 ]; then res=BLOCKED; else res=FLAKE; fi
      echo "  [s$s] $name passed alone: $res (gate ${name}, item ${item:-none}, ${prior} earlier flake line(s)); logged to $FLAKES" >&2
      awk -F'\t' -v OFS='\t' -v idx="$idx" -v r="$res" '$7==idx && $3=="FAIL" {$3=r} {print}' "$RES" > "$RES.tmp" && mv "$RES.tmp" "$RES"
    fi
  done < "$RES"
  t1=$(now_ms)
  SES_WALL[$s]=$(awk -v a="$t0" -v b="$t1" 'BEGIN{printf "%.1f", (b-a)/1000}')
  # one JSON line per session run
  node -e '
    const fs = require("fs"); const [res, s, commit, wall, out] = process.argv.slice(1);
    const gates = fs.readFileSync(res, "utf8").split("\n").filter(Boolean).map((l) => l.split("\t")).filter((r) => r[0] === s)
      .map((r) => ({ gate: r[1], result: r[2], seconds: Number(r[3]), slotWait: Number(r[4]) }));
    fs.mkdirSync(require("path").dirname(out), { recursive: true });
    fs.appendFileSync(out, JSON.stringify({ date: new Date().toISOString(), commit, session: Number(s), wallSeconds: Number(wall),
      browserWorkers: Number(process.env.BW), nodeWorkers: Number(process.env.NW), gates }) + "\n");
  ' "$RES" "$s" "$COMMIT" "${SES_WALL[$s]}" "$TIMINGS"
}

print_table() {
  local s total=0
  printf '\n%-8s %-46s %-8s %9s %10s\n' session gate result seconds "slot wait"
  printf '%-8s %-46s %-8s %9s %10s\n' ------- ---------------------------------------------- -------- --------- ----------
  sort -t$'\t' -k1,1n -s "$RES" | while IFS=$'\t' read -r ses name res secs wt log idx; do
    printf '%-8s %-46s %-8s %9s %10s\n' "$ses" "$name" "$res" "$secs" "$wt"
  done
  echo
  for s in "${!SES_WALL[@]}"; do
    printf 'session %s wall clock: %s s (%s min)\n' "$s" "${SES_WALL[$s]}" "$(awk -v x="${SES_WALL[$s]}" 'BEGIN{printf "%.1f", x/60}')"
    total=$(awk -v a="$total" -v b="${SES_WALL[$s]}" 'BEGIN{print a+b}')
  done
  printf 'total wall clock: %s s (%s min); commit %s; timings appended to %s\n' "$total" "$(awk -v x="$total" 'BEGIN{printf "%.1f", x/60}')" "$COMMIT" "$TIMINGS"
}

# ---------------------------------------------------------------------------------------------- main
SESSIONS=(); MODE=run; LANES_DIR=design/lanes; STATUS_DIR=
while [ $# -gt 0 ]; do
  case "$1" in
    --session) SESSIONS+=("$2"); shift ;;
    --all) SESSIONS=(1 2 3) ;;
    --list) MODE=list ;;
    --deploy-check) MODE=deploy ;;
    --lanes-dir) LANES_DIR=$2; shift ;;
    --status-dir) STATUS_DIR=$2; shift ;;
    --self-test) MODE=selftest ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1"; usage; exit 2 ;;
  esac
  shift
done
[ -n "$STATUS_DIR" ] || STATUS_DIR="$(dirname "$LANES_DIR")/status"

case "$MODE" in
  selftest) self_test; exit $? ;;
  deploy) deploy_check "$LANES_DIR" "$STATUS_DIR"; rc=$?; [ $rc = 0 ] && echo 'ws-deploy-gates --deploy-check: OK' || echo 'ws-deploy-gates --deploy-check: REFUSED'; exit $rc ;;
esac

build_list
if [ "$MODE" = list ]; then
  printf '%-8s %-8s %-46s %s\n' session kind gate command
  for i in "${!G_SES[@]}"; do
    k=${G_KIND[$i]}; c=${G_CMD[$i]}
    [ "$k" = skip ] && c="SKIPPED (tool not built): $c"; [ "$k" = notyet ] && c="NOT YET: $c"
    [ "$k" = browser ] && c="$RUNNER $c"
    printf '%-8s %-8s %-46s %s\n' "${G_SES[$i]}" "$k" "${G_NAME[$i]}" "$c"
  done
  exit 0
fi
[ ${#SESSIONS[@]} -gt 0 ] || { usage; exit 2; }
if [ ! -x "$RUNNER" ]; then
  if [ -f tests/scripts/mq-browser-run.sh ]; then cp tests/scripts/mq-browser-run.sh "$RUNNER" && chmod +x "$RUNNER"
  else echo "ws-deploy-gates: $RUNNER is missing and tests/scripts/mq-browser-run.sh is not in this tree"; echo 'ws-deploy-gates: FAIL'; exit 2; fi
fi
# Prerequisites, checked before every session (a missing one would show as gate FAILs much later)
prereq_bad=0
if ! python3 -c 'import pymupdf' >/dev/null 2>&1 && ! python3 -c 'import fitz' >/dev/null 2>&1; then
  echo 'ws-deploy-gates: prerequisite missing: PyMuPDF (python3 -c "import fitz" fails; ws-print-lint and the coverage matrix need it). Fix: pip install pymupdf'; prereq_bad=1
fi
node -e 'require("puppeteer")' >/dev/null 2>&1 || { echo 'ws-deploy-gates: prerequisite missing: puppeteer (node -e "require(\"puppeteer\")" fails). Fix: npm install'; prereq_bad=1; }
command -v flock >/dev/null 2>&1 || { echo 'ws-deploy-gates: prerequisite missing: flock (util-linux), needed by the browser runner'; prereq_bad=1; }
[ $prereq_bad = 0 ] || { echo 'ws-deploy-gates: FAIL'; exit 2; }
export BW=$BROWSER_WORKERS NW=$NODE_WORKERS
for s in "${SESSIONS[@]}"; do run_session "$s"; done
print_table
if cut -f3 "$RES" | grep -qxE 'FAIL|BLOCKED'; then
  echo; cut -f2,3,6 "$RES" | awk -F'\t' '$2=="FAIL"||$2=="BLOCKED" {print "  " $2 ": " $1 " (log " $3 ")"}'
  echo 'ws-deploy-gates: FAIL'; exit 1
fi
echo 'ws-deploy-gates: OK'
