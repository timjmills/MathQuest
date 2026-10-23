#!/usr/bin/env bash
# The ONE deploy-gate list (IMPROVEMENT_PLAN §1.4 S5; closes STATUS §7 "One deploy-gate list"), in three sessions
# that can run in three cloud sessions at once, or one after another here.
#
#   bash tests/scripts/ws-deploy-gates.sh --list            # print the gate list (session, kind, command, present?)
#   bash tests/scripts/ws-deploy-gates.sh --session 1       # node gates + the browser gates that are not screen sweeps
#   bash tests/scripts/ws-deploy-gates.sh --session 2       # ws-screen-slots + ws-chromebook-fit, sharded over the two
#                                                           # browser slots, + viewport, S9 and the board / dark sweeps
#   bash tests/scripts/ws-deploy-gates.sh --session 3       # coverage matrix (budgeted), digests hook, owner go
#   bash tests/scripts/ws-deploy-gates.sh --all             # sessions 1, 2, 3 in sequence
#   bash tests/scripts/ws-deploy-gates.sh --session 3 --accept-notyet digests
#                                                           # the lead accepts a named NOT YET gate (logged)
#   bash tests/scripts/ws-deploy-gates.sh --deploy-check [--lanes-dir design/lanes] [--status-dir design/status]
#                                                           # refuse a deploy that makes a family live with no
#                                                           # "Owner go: <family>, <date>" line (§1.6.3 step 6)
#   bash tests/scripts/ws-deploy-gates.sh --self-test       # owner go, the flake rule, the final verdict
#                                                           # (INCOMPLETE / accepted / FAIL) and the matrix budget +
#                                                           # nightly rule, on fixtures (no browser)
#
# THE VERDICT (critic r1 D2: "same gates, nothing skipped"). The last line is one of
#   ws-deploy-gates: OK           every gate ran and passed (OK; FLAKE = passed alone, logged; ACCEPTED = a NOT YET
#                                 gate the lead accepted by name with --accept-notyet) - exit 0
#   ws-deploy-gates: INCOMPLETE   nothing failed, but a gate did not run: SKIPPED (its tool is not in the tree),
#                                 NOT YET (needs a later M-step) or NEEDS-SHARDED-RUN (the matrix is over its budget,
#                                 see session 3); each is listed with what to do - exit 2. A deploy waits.
#   ws-deploy-gates: FAIL         a gate failed (FAIL, or BLOCKED = a second flake) - exit 1
# BEFORE M4 (record / replay) the digests hook is NOT YET, so every run of session 3 is INCOMPLETE until the lead
# accepts that one item by name: `--accept-notyet digests`. The acceptance is per run, never a blanket flag: it is
# printed in the table (ACCEPTED), in the verdict, and in the session's line of deploy-gate-timings.jsonl
# ("acceptedNotYet"). Only NOT YET gates can be accepted; an unknown name is an error. SKIPPED is never acceptable.
#
# Session 1  every node gate (in parallel with the browser gates; 4 cores = 2 browsers + 2 node workers):
#            ws-code-snapshot, ws-codec-registry, ws-standards, ws-search-terms, ws-providers-unit, ws-layout-unit,
#            ws-panes-unit, ws-supports-unit, ws-ink-unit, ws-plain-words --check, ws-node-lint, ws-envelope
#            --self-test, ws-text-vs-gen (claims vs the generator), ws-backtest --kind fixture (the S2 checks still
#            catch their fixtures) and ws-options-pin --check when tests/scripts/ws-options-pin.cjs is in the tree;
#            and the browser gates, two at a time: ws-presets-unit, ws-anchors-unit, ws-boot-smoke, ws-content-audit,
#            ws-print-lint --source kit (--baseline design/audit/baselines/print-lint.json when it exists; else the
#            accepted limit MQ_PRINT_LINT_LIMIT, default 461 findings / 33 documents), ws-screen-answer,
#            ws-share-options, ws-teacher-shell, -library, -preview, -quiz, ws-teacher-wrm, ws-teacher-wrm --fallback,
#            and ws-detailed-lesson --lesson <id> --repeats for every lesson in js/modules/lessons/detailed/.
# Session 2  ws-screen-slots in MQ_SLOTS_SHARDS parts (default 4) with --baseline design/audit/baselines/screen-slots.json,
#            ws-chromebook-fit in MQ_FIT_SHARDS parts (default 2), ws-viewport-check --baseline
#            design/audit/baselines/viewport-check.json (a real session's scroll: the R7-D1 class chromebook-fit
#            cannot see), the S9 regression (ws-screen-slots on measurement:reading_ruler_hard, card host, seeds 1-40,
#            --need-ans 1/4,1/2,3/4: readings under an inch show one answer area), and the sweeps on the pinned sample
#            (tests/fixtures/precritic/sweep-sample.json): ws-screen-slots --dark / --bigboard, ws-chromebook-fit
#            --dark / --bigboard (chromebook-fit's standing failures are pinned per skill and host in the sample file).
# Session 3  ws-coverage-matrix on the affected rows with a DOCUMENT BUDGET (§1.6.2): MQ_COVERAGE_ARGS, default
#            `--all --affected <base>..HEAD --baseline design/audit/matrix/baseline.json --slots 2 --batch 9`, plus
#            `--max-docs MQ_MATRIX_BUDGET` (default 500). <base> is MQ_DEPLOY_BASE, else the merge base with
#            origin/master; when origin/master is not fetched the gate FAILS and says so (never a silent HEAD~1).
#            Within the budget the rows run inline (OK / FAIL). Over it (the matrix exits 3, `OVER-BUDGET`; a tree
#            whose matrix lacks --max-docs is measured with --list instead) the gate reads the newest nightly,
#            design/audit/matrix/<date>[.shard-i-of-n].json (all shards of the newest date):
#              FAIL               there is none; or it finished more than 24 h ago (its `finished`, else the file's
#                                 git commit time, else its date at 00:00 UTC); or a row of a live skill
#                                 (data.js SKILLS, tombstones out) is RED or ERROR in any shard
#              OK                 it is complete (every shard i of n) and ran on a commit the tip differs from only
#                                 in design/audit/matrix/ (the nightly's own commit): the sharded run has covered HEAD
#              NEEDS-SHARDED-RUN  otherwise: fresh and green but not on this tip. The deploy waits; the gate prints
#                                 the sharded run to fire (design/audit/matrix/NIGHTLY.md) and to re-run session 3.
#            Then the digests hook (M4 record/replay) prints NOT YET, and the owner-go check.
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
# Results: OK, FAIL, FLAKE (passed alone, logged), BLOCKED (second flake), SKIPPED (tool not built), NOT YET,
# ACCEPTED (a NOT YET the lead accepted by name), NEEDS-SHARDED-RUN. Logs: $MQ_GATES_LOGDIR (default
# /tmp/mq-deploy-gates/<stamp>). Last line: `ws-deploy-gates: OK`, `INCOMPLETE` (exit 2) or `FAIL` (exit 1).
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
VIEWPORT_BASE=design/audit/baselines/viewport-check.json
SLOTS_SHARDS=${MQ_SLOTS_SHARDS:-4}
FIT_SHARDS=${MQ_FIT_SHARDS:-2}
MATRIX_SHARDS=${MQ_MATRIX_SHARDS:-2}
NODE_WORKERS=${MQ_NODE_WORKERS:-2}
BROWSER_WORKERS=${MQ_BROWSER_WORKERS:-2}
PRINT_LINT_LIMIT=${MQ_PRINT_LINT_LIMIT:-461/33}
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
[ -n "$(git status --porcelain 2>/dev/null | grep -v '^??' | head -n 1)" ] && COMMIT="$COMMIT+dirty"

usage() { sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; }
MATRIX_DIR=${MQ_MATRIX_DIR:-design/audit/matrix}
MATRIX_BUDGET=${MQ_MATRIX_BUDGET:-500}
ACCEPT_NOTYET=()

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

# ---------------------------------------------------------------------------------------------- the matrix budget
# The newest nightly (§1.6.2): nightly_check <matrix dir> <check-dirty 1|0>. Exit 1 = refuse (none, older than 24 h,
# a RED / ERROR row of a live skill), 0 = covered (complete, on a commit the tip differs from only in the matrix
# dir), 3 = NEEDS-SHARDED-RUN. MQ_NOW (ISO time) replaces the clock (fixtures).
nightly_check() {
  node - "$1" "$2" "$ROOT" <<'EOF'
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const [dir, checkDirty, root] = process.argv.slice(2);
const git = (...a) => execFileSync('git', ['-C', root, ...a], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
const now = process.env.MQ_NOW ? Date.parse(process.env.MQ_NOW) : Date.now();
const H24 = 24 * 3600 * 1000;
const RE = /^(\d{4}-\d{2}-\d{2})(?:\.shard-(\d+)-of-(\d+))?\.json$/;
const files = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => RE.test(f)).sort();
const refuse = (why) => { console.log(`nightly: REFUSED - ${why}`); console.log('nightly: FAIL'); process.exit(1); };
if (!files.length) refuse(`no nightly run file (${dir}/<YYYY-MM-DD>[.shard-i-of-n].json): the affected rows are over the budget and nothing has run them`);
const date = RE.exec(files[files.length - 1])[1];
const night = files.filter((f) => RE.exec(f)[1] === date);
const runs = [];
for (const f of night) {
  const full = path.join(dir, f);
  let j; try { j = JSON.parse(fs.readFileSync(full, 'utf8')); } catch (e) { refuse(`${full} is not valid JSON (${e.message})`); }
  let when = j.finished ? Date.parse(j.finished) : NaN, src = 'finished';
  if (!Number.isFinite(when)) { try { const c = git('log', '-1', '--format=%cI', '--', full); if (c) { when = Date.parse(c); src = 'git commit time'; } } catch (e) { /* not committed */ } }
  if (!Number.isFinite(when)) { when = Date.parse(`${j.date || date}T00:00:00Z`); src = 'date 00:00 UTC'; }
  const m = RE.exec(f);
  runs.push({ f: full, j, when, src, shard: m[2] ? { i: +m[2], n: +m[3] } : null });
}
// live skills: data.js SKILLS, tombstones and retired labels out (as ws-coverage-matrix / ws-print-lint select them)
(async () => {
  globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
  if (!globalThis.window) globalThis.window = globalThis;
  const q = console.log; console.log = console.warn = () => {};
  let SKILLS;
  try { ({ SKILLS } = await import(require('url').pathToFileURL(path.join(root, 'js', 'modules', 'data.js')).href)); } finally { console.log = q; }
  const live = new Set();
  for (const [cat, list] of Object.entries(SKILLS)) if (Array.isArray(list)) for (const s of list) {
    if (!s || !s.v || s.retired || /^_?tomb|retired/i.test(s.v) || /\(retired\)/i.test(s.l || '')) continue;
    live.add(`${cat}:${s.v}`);
  }
  const oldest = Math.min(...runs.map((r) => r.when));
  const age = (now - oldest) / 3600000;
  for (const r of runs) console.log(`nightly: ${r.f} commit ${String(r.j.commit || '?').slice(0, 10)}${r.j.dirty ? ' (dirty)' : ''}, finished ${new Date(r.when).toISOString()} (${r.src}), ${(r.j.rows || []).length} row(s)`);
  if (now - oldest > H24) refuse(`the newest nightly (${date}) finished ${age.toFixed(1)} h ago, more than 24 h`);
  const red = [];
  for (const r of runs) for (const row of r.j.rows || []) {
    if (!/^(RED|ERROR)$/.test(String(row.status))) continue;
    const key = String(row.id || '').split('|')[0] || (row.skills || [])[0];
    if (live.has(key)) red.push(`${row.id} ${row.status}${row.rises && row.rises.length ? ` (${JSON.stringify(row.rises[0]).slice(0, 80)})` : ''}`);
    else console.log(`nightly: ${row.id} is ${row.status} but ${key} is not a live skill (ignored)`);
  }
  if (red.length) refuse(`the newest nightly (${date}) has ${red.length} RED row(s) of live skills: ${red.slice(0, 10).join('; ')}${red.length > 10 ? ' ...' : ''}`);
  console.log(`nightly: ${date} is ${age.toFixed(1)} h old and has no RED row of a live skill`);
  // does it cover this tip? every shard of the night present, one commit, the tip differing from it only in the matrix dir
  const why = [];
  const sh = runs.filter((r) => r.shard);
  if (sh.length) { const n = sh[0].shard.n; const have = new Set(sh.map((r) => r.shard.i)); const miss = []; for (let i = 1; i <= n; i++) if (!have.has(i)) miss.push(`${i}/${n}`); if (miss.length) why.push(`shard(s) ${miss.join(', ')} of ${date} are missing`); }
  const commits = [...new Set(runs.map((r) => r.j.commit))];
  if (commits.length !== 1) why.push(`its shards ran on ${commits.length} commits`);
  if (runs.some((r) => r.j.dirty)) why.push('it ran on a dirty tree');
  let head = '?';
  try { head = git('rev-parse', 'HEAD'); } catch (e) { why.push('no HEAD'); }
  if (!why.length) {
    let c = null; try { c = git('rev-parse', '--verify', `${commits[0]}^{commit}`); } catch (e) { why.push(`its commit ${commits[0]} is not in this repository`); }
    if (c) {
      let anc = true; try { execFileSync('git', ['-C', root, 'merge-base', '--is-ancestor', c, 'HEAD'], { stdio: 'ignore' }); } catch (e) { anc = false; }
      if (!anc) why.push(`its commit ${c.slice(0, 10)} is not an ancestor of HEAD ${head.slice(0, 10)}`);
      else {
        const diff = git('diff', '--name-only', c, 'HEAD').split('\n').filter(Boolean).filter((f) => !f.startsWith('design/audit/matrix/'));
        if (diff.length) why.push(`HEAD ${head.slice(0, 10)} changes ${diff.length} file(s) since it (${diff.slice(0, 3).join(', ')}${diff.length > 3 ? ' ...' : ''})`);
      }
    }
    if (checkDirty === '1') {
      const dirty = git('status', '--porcelain', '--untracked-files=no').split('\n').filter(Boolean).map((l) => l.slice(3)).filter((f) => !/^design\/audit\/(matrix|baselines)\//.test(f));
      if (dirty.length) why.push(`the working tree has ${dirty.length} uncommitted change(s) (${dirty.slice(0, 3).join(', ')})`);
    }
  }
  if (!why.length) { console.log(`nightly: the sharded run of ${date} covers HEAD ${head.slice(0, 10)} (it differs only in ${dir}/)`); console.log('nightly: OK'); process.exit(0); }
  console.log(`nightly: it does not cover this tip: ${why.join('; ')}`);
  console.log('nightly: NEEDS-SHARDED-RUN');
  process.exit(3);
})().catch((e) => { console.log(`nightly: FAIL - ${e.message}`); process.exit(1); });
EOF
}

# What the lead fires when the affected rows are over the budget (design/audit/matrix/NIGHTLY.md).
sharded_run_help() {
  cat <<EOF
NEEDS-SHARDED-RUN: the affected rows are over the ${MATRIX_BUDGET}-document budget, the newest nightly is fresh and has no
RED row of a live skill, but no complete nightly has run on this tip ($(git rev-parse --short HEAD 2>/dev/null)). The deploy waits.
To finish this gate:
  1. Push this tip to the integration branch claude/sweet-newton-c8wrv1 (the nightly runs only on its fetched tip).
  2. Fire the sharded nightly on it: the eight scheduled tasks "MathQuest matrix nightly SHARD=i/8" (i = 1..8) with
     the prompt in design/audit/matrix/NIGHTLY.md, each running
         SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh
     (about 3.7 h each before M4). Each commits design/audit/matrix/<date>.shard-<i>-of-8.json to the branch.
  3. When all eight are pushed: git pull, then  bash tests/scripts/ws-deploy-gates.sh --session 3
     The gate is OK when that night is complete, on a commit this tip differs from only in design/audit/matrix/,
     and has no RED row of a live skill.
EOF
}

# Session 3's matrix gate: the affected rows within the document budget, else the nightly rule.
# MQ_MATRIX_CMD replaces `node <ws-coverage-matrix>` (self-test stubs).
matrix_gate() {
  local cm=$1 cargs base rc out n
  local cmd=${MQ_MATRIX_CMD:-node $cm}
  if [ -n "${MQ_COVERAGE_ARGS:-}" ]; then cargs=$MQ_COVERAGE_ARGS
  else
    base=$(deploy_base) || return 1
    cargs="--all --affected $base..HEAD --baseline design/audit/matrix/baseline.json --slots 2 --batch 9"
  fi
  echo "matrix: budget $MATRIX_BUDGET documents; $cmd $cargs"
  if [ -z "${MQ_MATRIX_CMD:-}" ] && ! grep -q 'max-docs' "$cm"; then
    # this tree's matrix has no --max-docs: measure the selection with --list and apply the budget here
    # shellcheck disable=SC2086
    out=$($cmd $cargs --list 2>&1); rc=$?
    printf '%s\n' "$out" | tail -n 5
    [ $rc = 0 ] || { echo "matrix: --list failed (exit $rc)"; return 1; }
    n=$(printf '%s\n' "$out" | grep -oE 'documents to run [0-9]+' | tail -n 1 | grep -oE '[0-9]+$')
    [ -n "$n" ] || { echo 'matrix: --list printed no "documents to run" count'; return 1; }
    if [ "$n" -gt "$MATRIX_BUDGET" ]; then echo "ws-coverage-matrix: OVER-BUDGET $n documents (budget $MATRIX_BUDGET) [measured with --list: this tree's matrix has no --max-docs]"; rc=3
    else
      # shellcheck disable=SC2086
      $cmd $cargs; rc=$?
    fi
  else
    # shellcheck disable=SC2086
    case " $cargs " in *" --max-docs "*) $cmd $cargs ;; *) $cmd $cargs --max-docs "$MATRIX_BUDGET" ;; esac; rc=$?
  fi
  [ $rc = 3 ] || return $rc
  echo "matrix: over the budget; the newest nightly decides (§1.6.2)"
  nightly_check "$MATRIX_DIR" "${MQ_NIGHTLY_DIRTY_CHECK:-1}"; rc=$?
  [ $rc = 3 ] && sharded_run_help
  return $rc
}

# The deployed tip to diff against: MQ_DEPLOY_BASE, else the merge base with origin/master; never a guess.
deploy_base() {
  local b
  if [ -n "${MQ_DEPLOY_BASE:-}" ]; then
    b=$(git rev-parse --verify -q "${MQ_DEPLOY_BASE}^{commit}") || { echo "matrix: MQ_DEPLOY_BASE=$MQ_DEPLOY_BASE is not a commit here" >&2; return 1; }
    echo "$b"; return 0
  fi
  git rev-parse --verify -q origin/master >/dev/null || {
    echo 'matrix: origin/master is not fetched, so the deployed tip is unknown and the affected rows cannot be computed.' >&2
    echo 'matrix: fix: git fetch origin master   (or set MQ_DEPLOY_BASE=<the deployed commit>)' >&2
    return 1; }
  b=$(git merge-base origin/master HEAD) || { echo 'matrix: no merge base between origin/master and HEAD; set MQ_DEPLOY_BASE' >&2; return 1; }
  echo "$b"
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

  # the final verdict (critic r1 D2): only all-OK prints OK; a gate that did not run is INCOMPLETE (exit 2)
  echo "-- the final verdict"
  local v rc last
  vcase() {   # name, want rc, want last line, then result rows "res[:name]"...
    local name=$1 want=$2 wantl=$3 r i=0; shift 3
    : > "$tmp/res"
    for r in "$@"; do printf 'T\t%s\t%s\t1.0\t0\t/dev/null\t%s\n' "${r#*:}" "${r%%:*}" "$i" >> "$tmp/res"; i=$((i + 1)); done
    v=$(verdict "$tmp/res"); rc=$?; last=$(printf '%s\n' "$v" | tail -n 1)
    if [ "$rc" = "$want" ] && [ "${last%% (*}" = "$wantl" ]; then echo "  ok   $name: exit $rc, \"$last\""
    else echo "  FAIL $name: exit $rc (want $want), last line \"$last\" (want \"$wantl\")"; printf '%s\n' "$v" | sed 's/^/       /'; bad=1; fi
  }
  vcase "all OK" 0 'ws-deploy-gates: OK' "OK:a" "OK:b"
  vcase "OK + FLAKE (logged)" 0 'ws-deploy-gates: OK' "OK:a" "FLAKE:b"
  vcase "OK + SKIPPED (a renamed tool)" 2 'ws-deploy-gates: INCOMPLETE' "OK:a" "SKIPPED:ws-node-lint"
  vcase "OK + NOT YET (digests, not accepted)" 2 'ws-deploy-gates: INCOMPLETE' "OK:a" "NOT YET:digests hook (M4 record/replay)"
  vcase "OK + ACCEPTED (digests, --accept-notyet)" 0 'ws-deploy-gates: OK' "OK:a" "ACCEPTED:digests hook (M4 record/replay)"
  vcase "OK + NEEDS-SHARDED-RUN" 2 'ws-deploy-gates: INCOMPLETE' "OK:a" "NEEDS-SHARDED-RUN:ws-coverage-matrix"
  vcase "FAIL + NOT YET" 1 'ws-deploy-gates: FAIL' "FAIL:a" "NOT YET:digests"
  vcase "BLOCKED" 1 'ws-deploy-gates: FAIL' "OK:a" "BLOCKED:b"
  vcase "no gate ran at all" 2 'ws-deploy-gates: INCOMPLETE'
  # the acceptance: only a NOT YET gate, by its name; logged in the timings line
  G_SES=(T T); G_KIND=(node notyet); G_NAME=("ok gate" "digests hook (M4 record/replay)"); G_CMD=("true" "the tip's digests need M4"); G_KEY=("" digests)
  ACCEPT_NOTYET=(digests); : > "$RES"; run_session T 2>/dev/null
  if cut -f3 "$RES" | grep -qx ACCEPTED && grep -q '"acceptedNotYet":\["digests"\]' "$TIMINGS"; then echo "  ok   --accept-notyet digests: the gate shows ACCEPTED and the timings line logs it"
  else echo "  FAIL --accept-notyet digests: $(cut -f3 "$RES" | tr '\n' ' ')"; bad=1; fi
  ACCEPT_NOTYET=(nosuch)
  if check_accept 2>/dev/null; then echo "  FAIL --accept-notyet nosuch was taken"; bad=1; else echo "  ok   --accept-notyet nosuch is refused (no NOT YET gate of that name)"; fi
  ACCEPT_NOTYET=(); G_KEY=()

  # session 3: the matrix budget and the newest nightly (critic r1 D1), on fixture nightly dirs and a stub matrix
  echo "-- the matrix budget and the nightly rule (MQ_NOW=2026-10-23T12:00:00Z)"
  local nx=$fx/nightly
  ncase() {   # name, nightly dir, want rc (0 OK, 1 FAIL, 3 NEEDS-SHARDED-RUN), stub exit
    local name=$1 d=$2 want=$3 got
    MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$d MQ_MATRIX_CMD="bash $fx/matrix-stub.sh ${4:-3}" MQ_COVERAGE_ARGS="--all --affected X..HEAD" MQ_NIGHTLY_DIRTY_CHECK=0 \
      bash -c 'source "$0" --source-only; matrix_gate tests/scripts/ws-coverage-matrix.cjs' "$0" > "$tmp/m.log" 2>&1; got=$?
    if [ "$got" = "$want" ]; then echo "  ok   $name: exit $got ($(grep -E '^nightly: (REFUSED|OK|NEEDS)|^ws-coverage-matrix: (OK|FAIL)' "$tmp/m.log" | head -n 1 | cut -c1-150))"
    else echo "  FAIL $name: exit $got, want $want"; sed 's/^/       /' "$tmp/m.log" | tail -n 12; bad=1; fi
  }
  ncase "within the budget: the rows run inline (stub OK)" "$nx/fresh" 0 0
  ncase "within the budget: a red row fails inline (stub FAIL)" "$nx/fresh" 1 1
  ncase "over the budget, no nightly at all: refused" "$nx/none" 1
  ncase "over the budget, newest nightly 31 h old: refused" "$nx/stale" 1
  ncase "over the budget, a RED row of a live skill (shard 2 of 2): refused" "$nx/red" 1
  ncase "over the budget, RED only on a skill that is not live: not refused, NEEDS-SHARDED-RUN" "$nx/red-dead" 3
  ncase "over the budget, fresh and green on another commit: NEEDS-SHARDED-RUN" "$nx/fresh" 3
  ncase "over the budget, a shard of the night missing: NEEDS-SHARDED-RUN" "$nx/missing-shard" 3
  ncase "over the budget, a complete green night on HEAD: OK" "$nx/covered" 0
  if grep -q 'SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh' < <(MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$nx/fresh MQ_MATRIX_CMD="bash $fx/matrix-stub.sh 3" MQ_COVERAGE_ARGS=x MQ_NIGHTLY_DIRTY_CHECK=0 bash -c 'source "$0" --source-only; matrix_gate x' "$0" 2>&1); then
    echo "  ok   NEEDS-SHARDED-RUN prints the sharded run to fire"; else echo "  FAIL NEEDS-SHARDED-RUN does not print the sharded run"; bad=1; fi
  # a tree whose matrix has no --max-docs: the budget is measured with --list (32766 documents > 500)
  local got
  MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$nx/stale MQ_COVERAGE_ARGS="--all" MQ_NIGHTLY_DIRTY_CHECK=0 \
    bash -c 'source "$0" --source-only; matrix_gate "$1"' "$0" "$fx/matrix-stub-old.cjs" > "$tmp/m.log" 2>&1; got=$?
  if [ "$got" = 1 ] && grep -q 'OVER-BUDGET 32766 documents (budget 500) \[measured with --list' "$tmp/m.log"; then echo "  ok   no --max-docs in the tree: measured with --list, over budget, then the nightly rule (stale: refused)"
  else echo "  FAIL no --max-docs fallback: exit $got"; tail -n 8 "$tmp/m.log" | sed 's/^/       /'; bad=1; fi
  # N6: no origin/master, no MQ_DEPLOY_BASE: the gate fails and says to fetch (never a silent HEAD~1)
  local repo=$tmp/repo
  git init -q "$repo" && git -C "$repo" -c user.email=t@t -c user.name=t commit -q --allow-empty -m one
  if ( cd "$repo" && unset MQ_DEPLOY_BASE && deploy_base ) > "$tmp/b.log" 2>&1; then echo "  FAIL deploy_base without origin/master returned $(cat "$tmp/b.log")"; bad=1
  elif grep -q 'origin/master is not fetched' "$tmp/b.log"; then echo "  ok   no origin/master: FAIL with \"$(head -n 1 "$tmp/b.log" | cut -c1-70)...\""
  else echo "  FAIL no origin/master: wrong message $(cat "$tmp/b.log")"; bad=1; fi
  if ( MQ_DEPLOY_BASE=nosuchref deploy_base ) > "$tmp/b.log" 2>&1; then echo "  FAIL MQ_DEPLOY_BASE=nosuchref was taken"; bad=1; else echo "  ok   MQ_DEPLOY_BASE=nosuchref: FAIL ($(cat "$tmp/b.log"))"; fi
  rm -rf "$tmp"
  [ $bad = 0 ] && echo 'ws-deploy-gates --self-test: OK' || echo 'ws-deploy-gates --self-test: FAIL'
  return $bad
}

# ---------------------------------------------------------------------------------------------- the gate list
# G_SES / G_KIND / G_NAME / G_CMD / G_KEY: kind node (plain), browser (through the runner), fn (a function here, on a
# browser worker), nfn (a function here, on a node worker), skip (SKIPPED (tool not built)), notyet (NOT YET; G_KEY is
# the name --accept-notyet takes).
G_SES=(); G_KIND=(); G_NAME=(); G_CMD=(); G_KEY=()
add() { G_SES+=("$1"); G_KIND+=("$2"); G_NAME+=("$3"); G_CMD+=("$4"); G_KEY+=("${5:-}"); }
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
  # the S2 repeats check, per detailed lesson (each lesson file in js/modules/lessons/detailed/, index.js out)
  local lf lid
  for lf in js/modules/lessons/detailed/*.js; do
    lid=$(basename "$lf" .js); [ "$lid" = index ] && continue
    browser_gate 1 "ws-detailed-lesson --repeats $lid" ws-detailed-lesson.cjs --lesson "$lid" --repeats
  done
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
  node_gate 1 ws-text-vs-gen ws-text-vs-gen.mjs
  node_gate 1 "ws-backtest --kind fixture" ws-backtest.mjs --kind fixture
  # the options-verify pin (another builder's tool): on the list as soon as it is in the tree
  if [ -f tests/scripts/ws-options-pin.cjs ]; then node_gate 1 "ws-options-pin --check" ws-options-pin.cjs --check; fi
  # session 2: the long screen sweeps, sharded, then the viewport and S9 checks and the two sweep modes on the sample
  local i
  for i in $(seq 1 "$SLOTS_SHARDS"); do browser_gate 2 "ws-screen-slots --shard $i/$SLOTS_SHARDS" ws-screen-slots.cjs --shard "$i/$SLOTS_SHARDS" --baseline "$SLOTS_BASE"; done
  for i in $(seq 1 "$FIT_SHARDS"); do browser_gate 2 "ws-chromebook-fit --shard $i/$FIT_SHARDS" ws-chromebook-fit.cjs --shard "$i/$FIT_SHARDS" --baseline "$SAMPLE"; done
  browser_gate 2 "ws-viewport-check --baseline" ws-viewport-check.cjs --baseline "$VIEWPORT_BASE"
  # S9 (critic N8): a quarter-inch ruler read under an inch ("3/4") draws its own boxes; the card must not add a typed field
  browser_gate 2 "ws-screen-slots S9 ruler seeds 1-40" ws-screen-slots.cjs --skills measurement:reading_ruler_hard --hosts card --seeds 1-40 --need-ans 1/4,1/2,3/4
  browser_gate 2 "ws-chromebook-fit --dark" ws-chromebook-fit.cjs --dark --baseline "$SAMPLE"
  browser_gate 2 "ws-chromebook-fit --bigboard" ws-chromebook-fit.cjs --bigboard --baseline "$SAMPLE"
  browser_gate 2 "ws-screen-slots --dark" ws-screen-slots.cjs --dark --baseline "$SLOTS_BASE"
  browser_gate 2 "ws-screen-slots --bigboard" ws-screen-slots.cjs --bigboard --baseline "$SLOTS_BASE"
  # session 3
  local cm; cm=$(first_of ws-coverage-matrix.cjs ws-coverage-matrix.mjs)
  # The matrix rows are print-lint kit documents (≈ 5.4 s each, lead speed audit 2026-10-23). The matrix takes its own
  # browser slots (--slots 2: one print-lint process per slot through mq-browser-run.sh), so it runs on a node worker:
  # wrapping it in the runner would hold a slot while its children wait for one. The rows are those a change since the
  # deployed tip reaches, capped at MQ_MATRIX_BUDGET documents; over it the newest nightly decides (matrix_gate).
  if [ -f "tests/scripts/$cm" ]; then add 3 nfn "ws-coverage-matrix --affected (budget $MATRIX_BUDGET)" "matrix_gate tests/scripts/$cm"
  else add 3 skip "ws-coverage-matrix --affected" "tests/scripts/$cm"; fi
  add 3 notyet "digests hook (M4 record/replay)" "the tip's digests (§1.6.2, ≈ 8 min) need M4 record/replay, which is not built; before M4 the lead accepts this one item by name: --accept-notyet digests" digests
  add 3 fn "owner go (lane manifests)" "deploy_check design/lanes design/status"
}

# --accept-notyet: every name must be the key of a NOT YET gate on the list
check_accept() {
  local a i ok names=""
  for i in "${!G_KEY[@]}"; do [ "${G_KIND[$i]}" = notyet ] && names="$names ${G_KEY[$i]}"; done
  for a in "${ACCEPT_NOTYET[@]}"; do
    ok=0
    for i in "${!G_KEY[@]}"; do [ "${G_KIND[$i]}" = notyet ] && [ "${G_KEY[$i]}" = "$a" ] && ok=1; done
    [ $ok = 1 ] || { echo "ws-deploy-gates: --accept-notyet $a: no NOT YET gate has that name (NOT YET gates:${names:- none})" >&2; return 1; }
  done
}
accepted() { local a; for a in "${ACCEPT_NOTYET[@]}"; do [ "$a" = "$1" ] && return 0; done; return 1; }

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
    notyet) if accepted "${G_KEY[$i]}"; then echo "ACCEPTED NOT YET (--accept-notyet ${G_KEY[$i]}, $(date -u +%FT%TZ)): $cmd" > "$log"; res="ACCEPTED"
            else echo "NOT YET: $cmd" > "$log"; res="NOT YET"; fi; rc=0 ;;
    node)   ( eval "$cmd" ) > "$log" 2>&1; rc=$? ;;
    browser) eval "MQ_BROWSER_WAIT_LOG=1 \"\$RUNNER\" $cmd" > "$log" 2>&1; rc=$? ;;
    fn|nfn) ( eval "$cmd" ) > "$log" 2>&1; rc=$? ;;
  esac
  t1=$(now_ms)
  # exit 3 from the matrix gate: over the budget, fresh green nightly, not yet run on this tip
  if [ "$kind" = nfn ] && [ "$rc" = 3 ]; then res=NEEDS-SHARDED-RUN
  else [ "$kind" = skip ] || [ "$kind" = notyet ] || { [ $rc = 0 ] && res=OK || res=FAIL; }; fi
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
    case "${G_KIND[$i]}" in browser|fn) echo "$i" >> "$qb" ;; *) echo "$i" >> "$qn" ;; esac   # nfn, node, skip, notyet
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
  # one JSON line per session run (with the NOT YET items the lead accepted by name, if any)
  ACC="${ACCEPT_NOTYET[*]}" node -e '
    const fs = require("fs"); const [res, s, commit, wall, out] = process.argv.slice(1);
    const gates = fs.readFileSync(res, "utf8").split("\n").filter(Boolean).map((l) => l.split("\t")).filter((r) => r[0] === s)
      .map((r) => ({ gate: r[1], result: r[2], seconds: Number(r[3]), slotWait: Number(r[4]) }));
    fs.mkdirSync(require("path").dirname(out), { recursive: true });
    const acc = gates.filter((g) => g.result === "ACCEPTED").map((g) => g.gate);
    fs.appendFileSync(out, JSON.stringify({ date: new Date().toISOString(), commit, session: Number(s), wallSeconds: Number(wall),
      browserWorkers: Number(process.env.BW), nodeWorkers: Number(process.env.NW), gates,
      ...(acc.length ? { acceptedNotYet: (process.env.ACC || "").split(" ").filter(Boolean), acceptedGates: acc } : {}) }) + "\n");
  ' "$RES" "$s" "$COMMIT" "${SES_WALL[$s]}" "$TIMINGS"
}

# The final verdict over a results file (critic r1 D2): OK only when every gate passed; INCOMPLETE (2) when nothing
# failed but a gate did not run; FAIL (1) otherwise. Prints the gates that need action, then the verdict line.
verdict() {
  local res=$1 bad inc acc fl
  bad=$(awk -F'\t' '$3=="FAIL"||$3=="BLOCKED"' "$res" | wc -l)
  inc=$(awk -F'\t' '$3=="SKIPPED"||$3=="NOT YET"||$3=="NEEDS-SHARDED-RUN"' "$res" | wc -l)
  acc=$(awk -F'\t' '$3=="ACCEPTED" {printf "%s%s", (n++ ? "; " : ""), $2}' "$res")
  fl=$(awk -F'\t' '$3=="FLAKE"' "$res" | wc -l)
  awk -F'\t' '$3=="FAIL"||$3=="BLOCKED" {print "  " $3 ": " $2 " (log " $6 ")"}' "$res"
  awk -F'\t' '$3=="SKIPPED" {print "  DID NOT RUN, SKIPPED: " $2 " (its tool is not in this tree; a gate is never skipped: restore it or take it off the list with a STATUS note)"}
              $3=="NOT YET" {print "  DID NOT RUN, NOT YET: " $2 " (needs a later M-step; the lead may accept it by name, see the header)"}
              $3=="NEEDS-SHARDED-RUN" {print "  DID NOT RUN, NEEDS-SHARDED-RUN: " $2 " (fire the sharded matrix run printed in " $6 ", then re-run session 3)"}' "$res"
  [ -n "$acc" ] && echo "  ACCEPTED NOT YET (logged in $TIMINGS): $acc"
  local extra=""
  [ "$fl" -gt 0 ] && extra="$fl FLAKE logged"
  [ -n "$acc" ] && extra="${extra:+$extra; }accepted not yet: $acc"
  if [ "$bad" -gt 0 ]; then echo "ws-deploy-gates: FAIL ($bad failed$([ "$inc" -gt 0 ] && echo ", $inc did not run"))"; return 1; fi
  if [ ! -s "$res" ]; then echo "ws-deploy-gates: INCOMPLETE (no gate ran)"; return 2; fi
  if [ "$inc" -gt 0 ]; then echo "ws-deploy-gates: INCOMPLETE ($inc gate(s) did not run; nothing failed)"; return 2; fi
  echo "ws-deploy-gates: OK${extra:+ ($extra)}"; return 0
}

print_table() {
  local s total=0
  printf '\n%-8s %-50s %-17s %9s %10s\n' session gate result seconds "slot wait"
  printf '%-8s %-50s %-17s %9s %10s\n' ------- -------------------------------------------------- ----------------- --------- ----------
  sort -t$'\t' -k1,1n -s "$RES" | while IFS=$'\t' read -r ses name res secs wt log idx; do
    printf '%-8s %-50s %-17s %9s %10s\n' "$ses" "$name" "$res" "$secs" "$wt"
  done
  echo
  for s in "${!SES_WALL[@]}"; do
    printf 'session %s wall clock: %s s (%s min)\n' "$s" "${SES_WALL[$s]}" "$(awk -v x="${SES_WALL[$s]}" 'BEGIN{printf "%.1f", x/60}')"
    total=$(awk -v a="$total" -v b="${SES_WALL[$s]}" 'BEGIN{print a+b}')
  done
  printf 'total wall clock: %s s (%s min); commit %s; timings appended to %s\n' "$total" "$(awk -v x="$total" 'BEGIN{printf "%.1f", x/60}')" "$COMMIT" "$TIMINGS"
}

# ---------------------------------------------------------------------------------------------- main
# `source ws-deploy-gates.sh --source-only` defines the functions and stops here (the self-test's sub-shells)
[ "${1:-}" = --source-only ] && return 0
SESSIONS=(); MODE=run; LANES_DIR=design/lanes; STATUS_DIR=
while [ $# -gt 0 ]; do
  case "$1" in
    --session) SESSIONS+=("$2"); shift ;;
    --accept-notyet) IFS=', ' read -r -a _acc <<< "$2"; ACCEPT_NOTYET+=("${_acc[@]}"); shift ;;
    --all) SESSIONS=(1 2 3) ;;
    --list) MODE=list ;;
    --deploy-check) MODE=deploy ;;
    --lanes-dir) LANES_DIR=$2; shift ;;
    --status-dir) STATUS_DIR=$2; shift ;;
    --self-test) MODE=selftest ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1"; usage; exit 64 ;;
  esac
  shift
done
[ -n "$STATUS_DIR" ] || STATUS_DIR="$(dirname "$LANES_DIR")/status"

case "$MODE" in
  selftest) self_test; exit $? ;;
  deploy) deploy_check "$LANES_DIR" "$STATUS_DIR"; rc=$?; [ $rc = 0 ] && echo 'ws-deploy-gates --deploy-check: OK' || echo 'ws-deploy-gates --deploy-check: REFUSED'; exit $rc ;;
esac

build_list
check_accept || exit 64
if [ "$MODE" = list ]; then
  printf '%-8s %-8s %-50s %s\n' session kind gate command
  for i in "${!G_SES[@]}"; do
    k=${G_KIND[$i]}; c=${G_CMD[$i]}
    [ "$k" = skip ] && c="SKIPPED (tool not built; the run is INCOMPLETE): $c"; [ "$k" = notyet ] && c="NOT YET [--accept-notyet ${G_KEY[$i]}]: $c"
    [ "$k" = browser ] && c="$RUNNER $c"
    printf '%-8s %-8s %-50s %s\n' "${G_SES[$i]}" "$k" "${G_NAME[$i]}" "$c"
  done
  echo "(matrix: budget $MATRIX_BUDGET documents; base MQ_DEPLOY_BASE, else merge-base origin/master: $(deploy_base 2>&1 | tail -n 1))"
  exit 0
fi
[ ${#SESSIONS[@]} -gt 0 ] || { usage; exit 64; }
if [ ! -x "$RUNNER" ]; then
  if [ -f tests/scripts/mq-browser-run.sh ]; then cp tests/scripts/mq-browser-run.sh "$RUNNER" && chmod +x "$RUNNER"
  else echo "ws-deploy-gates: $RUNNER is missing and tests/scripts/mq-browser-run.sh is not in this tree"; echo 'ws-deploy-gates: FAIL'; exit 1; fi
fi
# Prerequisites, checked before every session (a missing one would show as gate FAILs much later)
prereq_bad=0
if ! python3 -c 'import pymupdf' >/dev/null 2>&1 && ! python3 -c 'import fitz' >/dev/null 2>&1; then
  echo 'ws-deploy-gates: prerequisite missing: PyMuPDF (python3 -c "import fitz" fails; ws-print-lint and the coverage matrix need it). Fix: pip install pymupdf'; prereq_bad=1
fi
node -e 'require("puppeteer")' >/dev/null 2>&1 || { echo 'ws-deploy-gates: prerequisite missing: puppeteer (node -e "require(\"puppeteer\")" fails). Fix: npm install'; prereq_bad=1; }
command -v flock >/dev/null 2>&1 || { echo 'ws-deploy-gates: prerequisite missing: flock (util-linux), needed by the browser runner'; prereq_bad=1; }
[ $prereq_bad = 0 ] || { echo 'ws-deploy-gates: FAIL'; exit 1; }
export BW=$BROWSER_WORKERS NW=$NODE_WORKERS
for s in "${SESSIONS[@]}"; do run_session "$s"; done
print_table
echo
verdict "$RES"; exit $?
