#!/usr/bin/env bash
# ws-matrix-nightly.sh - what the "Repeated check" scheduled session runs each night (IMPROVEMENT_PLAN §1.6.2 "the
# nightly job", §1.6.7 E1; owner decision 2026-10-23: one session a night, 1/28 of the rows). The exact prompt of the
# scheduled task is in design/audit/matrix/NIGHTLY.md.
#
#   tests/scripts/ws-matrix-nightly.sh                   # tonight's run (the phase is picked from the files, below)
#   tests/scripts/ws-matrix-nightly.sh --slice 5/28      # run that slice instead of tonight's (a re-run of one night)
#   SHARD=3/8 tests/scripts/ws-matrix-nightly.sh --full  # one of eight sessions of the sharded full run a deploy fires
#                                                        # (NIGHTLY.md "The full run when a deploy needs it")
#   DRY=1 tests/scripts/ws-matrix-nightly.sh             # print the selection (ws-coverage-matrix --list), run nothing
#   tests/scripts/ws-matrix-nightly.sh --self-test       # the missed-night rule on fixtures (no browser, seconds)
#
# On the checked-out tip of the integration branch (claude/sweet-newton-c8wrv1) it:
#   1. refuses unless HEAD is the fetched tip of origin/claude/sweet-newton-c8wrv1 (the run file records that commit);
#   2. FIRST BASELINE PHASE (the first full baseline is not complete: ws-coverage-matrix baselineComplete, i.e. not
#      every design/audit/matrix/baseline.slice-i-of-28.json is there and baseline.json does not say complete: true):
#      slice i/28 of every row (--all --slice i/28, i = the lowest slice with no baseline file yet, so a failed night
#      is retried the next night) with --write-baseline, which writes baseline.slice-i-of-28.json. It pins ONLY rows
#      that printed and have NO entry in the merged baseline (ws-coverage-matrix BASELINE INVARIANTS I1): a pilot row
#      already in baseline.json, or a row pinned by an earlier slice, is judged against its entry and never re-pinned,
#      so a regression on it is RED in the run file, not absorbed. A render error stays ERROR and is listed as NOT
#      pinned. The rows RED / ERROR in the folded state of the run files run too (--slice implies --red-from) and are
#      never pinned (I2); every status is judged before the pins are written (I3). About 816-883 rows = 1,134-1,272
#      documents a night, about 1 h on two slots at 0.31 documents/s; 28 nights pin every row;
#   3. STEADY PHASE (the first full baseline is complete): the rows the commits since the last affected run reach
#      (--affected <LAST>..HEAD, capped at MQ_NIGHTLY_AFFECTED_CAP documents, default 1200: above the cap they are
#      dropped tonight and the run file says so) + the folded RED / ERROR rows (--red-from, critic r2 D1.2) + the
#      rotating slice: the one AFTER the slice of the newest COMPLETED run file (`finished`, not dirty, the same notion
#      the fold uses; its `selection.slice` i/28; 28 wraps to 1; none yet: slice 1). Owner rule 2026-10-23: "if there
#      is no credit when it runs, save that day for the next possible time" - a missed night is not skipped, the next
#      night runs the slice it would have run, so every row is re-checked within 28 COMPLETED nights;
#      rows with no baseline entry yet (skills appended since) are pinned with --pin-new. LAST = the commit of the
#      newest run file (of this shard, or unsharded) that ran its affected rows (not dirty, not dropped over the cap);
#      when there is none, the commit of the oldest slice baseline (every change since the baseline began);
#   4. --full (with SHARD=i/n, fired by the lead when a deploy is over its budget after the full baseline exists):
#      --affected <LAST>..HEAD with no cap + the folded red rows + --pin-new, for shard i of n (shards split by a
#      hash of the row id, so the eight sessions partition the rows whatever each one selects);
#   5. writes design/audit/matrix/<UTC date>[.shard-i-of-n].json (a second run on one date gets <date>T<HHMM>: no run
#      file is overwritten) and the cache, and prints the commit message and the files to commit. Every run file
#      carries `commit`, `finished`, `selection` and each row's `status` (ws-coverage-matrix header, THE RUN FILE).
#   6. the options pin (ws-options-pin.cjs --check, report-only) on tonight's slice i/28 of the live skills (a hash of
#      the skill id, critic r4 N8; with SHARD on a --full run: that shard), into
#      design/audit/matrix/options-pin-<date>[T<HHMM>].json (never overwritten), so every live skill's options are
#      re-checked against design/audit/baselines/options-verify.json within 28 nights (≈ 25 skills, one or two batches,
#      ≈ 7 min a night; the whole pin is ≈ 1.9 h on two slots). The deploy never runs the pin: its options gate
#      (ws-options-pin --gate) folds these files (critic r4 D1). DRY=1 prints this step's command. OPTIONS_PIN=0 skips it.
# It never edits anything outside design/audit/matrix/. Exit 0 with red rows (--report-only): the deploy gate reads
# the red rows from the run files (folded); a crash exits non-zero.
# It NEVER re-pins an existing entry and never retires a row: it takes no --repin / --retire (unknown arguments are
# refused below), and ws-coverage-matrix refuses those two with --slice / --affected / --red-from. A re-pin or a
# retirement is the lead's named, per-row action (NIGHTLY.md "Clearing a red row").
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
BRANCH=claude/sweet-newton-c8wrv1
DIR=${MQ_MATRIX_DIR:-design/audit/matrix}   # MQ_MATRIX_DIR: testing only (DRY=1 on a fixture directory)
# MQ_NOW (testing only): a fake "now" (any `date -d` string) for the run-file name
NOW_S=$(date -u ${MQ_NOW:+-d "$MQ_NOW"} +%s)
DATE=$(date -u -d "@$NOW_S" +%F)
SLOTS=${SLOTS:-2}
SLICES=28
CAP=${MQ_NIGHTLY_AFFECTED_CAP:-1200}
FULL=""; FORCE_SLICE=""; SELFTEST=""
while [ $# -gt 0 ]; do
  case "$1" in
    --full) FULL=1 ;;
    --slice) FORCE_SLICE=$2; shift ;;
    --self-test) SELFTEST=1 ;;
    *) echo "ws-matrix-nightly: FAIL - unknown argument $1 (--full, --slice i/28)" >&2; exit 64 ;;
  esac
  shift
done
if [ -n "$FORCE_SLICE" ] && ! [[ "$FORCE_SLICE" =~ ^[0-9]+/[0-9]+$ ]]; then echo "ws-matrix-nightly: FAIL - --slice $FORCE_SLICE: i/28" >&2; exit 64; fi
if [ -n "$FULL" ] && [ -z "${SHARD:-}" ]; then echo "ws-matrix-nightly: FAIL - --full is the sharded full run: give SHARD=i/n" >&2; exit 64; fi
if [ -n "$SELFTEST" ]; then
  # the missed-night rule on fixture run files in a temp directory: PLAN=1 prints the matrix arguments, runs nothing
  T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; bad=0
  A=$(git rev-parse HEAD~2); B=$(git rev-parse HEAD~1); H=$(git rev-parse HEAD)
  echo '{"complete": true}' > "$T/baseline.json"
  run() { printf '{"commit":"%s","finished":"%s","dirty":%s,"rows":[],"selection":{"slice":"%s","affected":{"from":"x","to":"%s"}}}\n' "$2" "$3" "${5:-false}" "$4" "$2" > "$T/$1"; }
  plan() { MQ_MATRIX_DIR=$T MQ_NOW=$1 PLAN=1 ALLOW_NOT_TIP=1 MQ_NO_FETCH=1 bash "$0"; }
  check() { if grep -qE -- "$2" <<<"$3"; then echo "  ok   $1"; else echo "  FAIL $1"; echo "$3" | sed 's/^/       /'; bad=1; fi; }
  # night N (2026-11-01) ran slice 5 at commit A; night N+1 (2026-11-02) was missed; night N+2 is 2026-11-03
  run 2026-11-01.json "$A" 2026-11-01T02:00:00Z 5/28
  out=$(plan 2026-11-03T01:00:00Z)
  ROTD=$(( ( $(date -u -d 2026-11-03T01:00:00Z +%s) / 86400 ) % 28 + 1 ))
  check "missed night: --affected A..HEAD (both nights' changes)" "--affected $A\.\.$H" "$out"
  check "missed night: slice 6/28, not the date's slice $ROTD/28" "--slice 6/28 " "$out"
  check "missed night: the options pin follows slice 6/28" "options-pin: .*--shard 6/28" "$out"
  out=$(plan 2026-11-04T01:00:00Z)
  check "two missed nights: slice 6/28, not 7" "--slice 6/28 " "$out"
  check "two missed nights: still --affected A..HEAD" "--affected $A\.\.$H" "$out"
  # a dirty newer run and an unfinished one are not completed
  run 2026-11-04.json "$B" 2026-11-04T02:00:00Z 6/28 true
  printf '{"commit":"%s","rows":[],"selection":{"slice":"6/28"}}\n' "$B" > "$T/2026-11-05.json"
  check "a dirty / unfinished run is not completed: slice 6/28" "--slice 6/28 " "$(plan 2026-11-06T01:00:00Z)"
  run 2026-11-06.json "$B" 2026-11-06T02:00:00Z 6/28
  out=$(plan 2026-11-07T01:00:00Z)
  check "after slice 6 completes: slice 7/28" "--slice 7/28 " "$out"
  check "after slice 6 completes: --affected B..HEAD" "--affected $B\.\.$H" "$out"
  run 2026-11-08.json "$B" 2026-11-08T02:00:00Z 28/28
  check "slice 28 wraps to 1" "--slice 1/28 " "$(plan 2026-11-09T01:00:00Z)"
  rm -f "$T"/2026-*.json
  check "no completed run yet: slice 1/28" "--slice 1/28 " "$(plan 2026-11-09T01:00:00Z)"
  [ $bad = 0 ] && echo 'ws-matrix-nightly --self-test: OK' || { echo 'ws-matrix-nightly --self-test: FAIL'; exit 1; }
  exit 0
fi
[ -x /tmp/mq-browser-run.sh ] || { cp tests/scripts/mq-browser-run.sh /tmp/mq-browser-run.sh; chmod +x /tmp/mq-browser-run.sh; }

[ -n "${MQ_NO_FETCH:-}" ] || git fetch -q origin "$BRANCH"   # MQ_NO_FETCH: testing only
TIP=$(git rev-parse "origin/$BRANCH")
HEAD=$(git rev-parse HEAD)
if [ "$HEAD" != "$TIP" ] && [ -z "${ALLOW_NOT_TIP:-}" ]; then
  echo "ws-matrix-nightly: FAIL - HEAD $HEAD is not the tip of origin/$BRANCH ($TIP); check it out first" >&2
  exit 2
fi

SHARD_ARGS=()
SUFFIX=""
if [ -n "${SHARD:-}" ]; then
  SHARD_ARGS=(--shard "$SHARD")
  SUFFIX=".shard-${SHARD%/*}-of-${SHARD#*/}"
fi

# The phase, the slice to pin next, and LAST (see 3. above), from the files in design/audit/matrix/
read -r COMPLETE NEXT_SLICE LAST ROT < <(node -e '
const fs = require("fs"), path = require("path");
const [dir, suffix, slices] = process.argv.slice(1);
const { baselineComplete, RUN_RE } = require(path.resolve("tests/scripts/ws-coverage-matrix.cjs"));
const bc = baselineComplete(dir);
const missing = bc.complete ? [] : (bc.n === Number(slices) && bc.missing ? bc.missing : Array.from({ length: Number(slices) }, (_, i) => i + 1));
const mine = (f) => (suffix ? f.endsWith(suffix + ".json") : !/\.shard-/.test(f));
// critic r4 D2: the newest run is the one that FINISHED last (`finished`), whatever its name; ties by name
const runs = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => RUN_RE.test(f) && mine(f))
  .map((f) => { let j = null; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { /* unreadable: the deploy reports it */ } return { f, j, t: j && Number.isFinite(Date.parse(j.finished)) ? Date.parse(j.finished) : 0 }; })
  .sort((a, b) => (a.t - b.t) || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0));
let last = "", rot = 0;
for (const { j } of runs.slice().reverse()) {   // the rotating slice: after the newest COMPLETED run (finished, not dirty)
  const m = j && j.finished && Number.isFinite(Date.parse(j.finished)) && !j.dirty && j.selection && /^(\d+)\/(\d+)$/.exec(String(j.selection.slice || ""));
  if (m && Number(m[2]) === Number(slices)) { rot = (Number(m[1]) % Number(slices)) + 1; break; }
}
for (const { j } of runs.reverse()) {
  const a = j && j.selection && j.selection.affected;
  if (j && j.commit && !j.dirty && a && !a.droppedOverCap) { last = j.commit; break; }
}
if (!last) {   // no affected run yet: every change since the oldest slice baseline
  const sl = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => /^baseline\.slice-\d+-of-\d+\.json$/.test(f))
    .map((f) => { try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); return { c: String(j.commit || "").split(" ")[0], d: j.finished || j.date || "" }; } catch (e) { return null; } })
    .filter((x) => x && x.c).sort((a, b) => (a.d < b.d ? -1 : 1));
  if (sl.length) last = sl[0].c;
}
console.log(`${bc.complete ? 1 : 0} ${missing[0] || 1} ${last || "-"} ${rot || 1}`);
' "$DIR" "$SUFFIX" "$SLICES")
[ "$LAST" = "-" ] && LAST=""

# a second run on one date (a fired run) gets the time in its name, so the night's file is kept
RUNFILE="$DIR/$DATE$SUFFIX.json"
[ -e "$RUNFILE" ] && RUNFILE="$DIR/${DATE}T$(date -u -d "@$NOW_S" +%H%M)$SUFFIX.json"
ARGS=(--all --slots "$SLOTS" --out "$RUNFILE" --cache "$DIR/cache$SUFFIX.json" --baseline "$DIR/baseline.json" --report-only "${SHARD_ARGS[@]}")
if [ -n "$FULL" ]; then
  [ -n "$LAST" ] || { echo "ws-matrix-nightly: FAIL - --full needs an earlier affected run or slice baseline to diff from (none in $DIR)" >&2; exit 2; }
  MODE="full run: affected ${LAST:0:8}..${HEAD:0:8} (no cap) + the folded red rows + pin new rows"
  ARGS+=(--affected "$LAST..$HEAD" --red-from "$DIR" --pin-new)
elif [ "$COMPLETE" = 0 ]; then
  S=${FORCE_SLICE:-$NEXT_SLICE/$SLICES}
  MODE="first baseline: slice $S of every row, writes baseline.slice-${S%/*}-of-${S#*/}.json (+ the folded red rows)"
  ARGS+=(--slice "$S" --red-from "$DIR" --write-baseline)
else
  S=${FORCE_SLICE:-$ROT/$SLICES}
  if [ -n "$LAST" ]; then
    MODE="affected ${LAST:0:8}..${HEAD:0:8} (cap $CAP documents) + the folded red rows + slice $S + pin new rows"
    ARGS+=(--affected "$LAST..$HEAD" --affected-cap "$CAP")
  else
    MODE="slice $S + the folded red rows + pin new rows (no earlier affected run or slice baseline commit to diff from)"
  fi
  ARGS+=(--slice "$S" --red-from "$DIR" --pin-new)
fi
echo "ws-matrix-nightly: $DATE on ${HEAD:0:10} ($MODE)${SHARD:+, shard $SHARD}"

# Options pin (ws-options-pin.cjs): ws-options-verify against design/audit/baselines/options-verify.json (pinned for every
# live skill 2026-10-23). Each night checks the same slice i/28 as the matrix (owner: small jobs that never hold up
# current work): the skills whose id hashes to slice i (critic r4 N8: by hash, so appending skills never moves one),
# ≈ 25 skills, one or two batches; with SHARD (a --full run) that shard. New failing pairs are listed in
# $DIR/options-pin-<date>[T<HHMM>].json (never overwritten) and do not stop the night; the deploy's options gate
# (ws-options-pin --gate) folds those files. A crash keeps the per-batch JSON (re-run today: --resume).
if [ -n "${SHARD:-}" ]; then OPIN_SHARD=("${SHARD_ARGS[@]}"); else OPIN_SHARD=(--shard "${S:-$ROT/$SLICES}"); fi
OPIN_OUT="$DIR/options-pin-$DATE$SUFFIX.json"
[ -e "$OPIN_OUT" ] && OPIN_OUT="$DIR/options-pin-${DATE}T$(date -u -d "@$NOW_S" +%H%M)$SUFFIX.json"
OPIN_ARGS=(--check --resume --slots "$SLOTS" --out "$OPIN_OUT" --report-only "${OPIN_SHARD[@]}")

if [ -n "${PLAN:-}" ]; then   # testing only: the arguments, nothing run
  echo "ws-matrix-nightly: matrix: ${ARGS[*]}"; echo "ws-matrix-nightly: options-pin: ${OPIN_ARGS[*]}"; exit 0
fi
if [ -n "${DRY:-}" ]; then
  node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" --list
  # N8: the dry run shows the options-pin step too (its command; --list would start a browser, so it is not run)
  if [ "${OPTIONS_PIN:-1}" != 0 ]; then echo "ws-matrix-nightly: then the options pin: node tests/scripts/ws-options-pin.cjs ${OPIN_ARGS[*]}"
  else echo "ws-matrix-nightly: then the options pin: skipped (OPTIONS_PIN=0)"; fi
  exit 0
fi
node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" | tee "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log"

TALLY=$(grep -E '^ws-coverage-matrix: OK [0-9]' "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log" | tail -1 | sed 's/^ws-coverage-matrix: //')

OPIN_TALLY="skipped"
if [ "${OPTIONS_PIN:-1}" != 0 ]; then
  if node tests/scripts/ws-options-pin.cjs "${OPIN_ARGS[@]}" | tee "/tmp/ws-options-pin-$DATE$SUFFIX.log"; then
    OPIN_TALLY="check ${OPIN_SHARD[*]}, $(grep -E '^against ' "/tmp/ws-options-pin-$DATE$SUFFIX.log" | tail -1 | sed -E 's/^against [^:]*: //')"
  else
    OPIN_TALLY="check CRASHED (run the script again today to resume)"
  fi
fi

echo
echo "ws-matrix-nightly: commit message:"
echo "Repeated check $DATE${SHARD:+ shard $SHARD} on ${HEAD:0:8}: $TALLY ($MODE); options pin: $OPIN_TALLY"
echo "ws-matrix-nightly: files to commit: $(git status --porcelain --untracked-files=all -- "$DIR" | awk '{print $2}' | tr '\n' ' ')"
