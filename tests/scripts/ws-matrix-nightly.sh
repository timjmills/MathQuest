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
#
# On the checked-out tip of the integration branch (claude/sweet-newton-c8wrv1) it:
#   1. refuses unless HEAD is the fetched tip of origin/claude/sweet-newton-c8wrv1 (the run file records that commit);
#   2. FIRST BASELINE PHASE (the first full baseline is not complete: ws-coverage-matrix baselineComplete, i.e. not
#      every design/audit/matrix/baseline.slice-i-of-28.json is there and baseline.json does not say complete: true):
#      slice i/28 of every row (--all --slice i/28, i = the lowest slice with no baseline file yet, so a failed night
#      is retried the next night) with --write-baseline, which writes baseline.slice-i-of-28.json. Only rows that
#      PRINTED are pinned (a render error stays ERROR and is listed as NOT pinned). The rows RED / ERROR in the
#      folded state of the run files run too (--slice implies --red-from). About 390 rows = 1,170 documents a night,
#      about 1 h on two slots at 0.31 documents/s; 28 nights pin every row;
#   3. STEADY PHASE (the first full baseline is complete): the rows the commits since the last affected run reach
#      (--affected <LAST>..HEAD, capped at MQ_NIGHTLY_AFFECTED_CAP documents, default 1200: above the cap they are
#      dropped tonight and the run file says so) + the folded RED / ERROR rows (--red-from, critic r2 D1.2) + the
#      rotating slice (--slice <days since 1970-01-01 mod 28, + 1>/28), so every row is re-checked within 28 nights;
#      rows with no baseline entry yet (skills appended since) are pinned with --pin-new. LAST = the commit of the
#      newest run file (of this shard, or unsharded) that ran its affected rows (not dirty, not dropped over the cap);
#      when there is none, the commit of the oldest slice baseline (every change since the baseline began);
#   4. --full (with SHARD=i/n, fired by the lead when a deploy is over its budget after the full baseline exists):
#      --affected <LAST>..HEAD with no cap + the folded red rows + --pin-new, for shard i of n (shards split by a
#      hash of the row id, so the eight sessions partition the rows whatever each one selects);
#   5. writes design/audit/matrix/<UTC date>[.shard-i-of-n].json (a second run on one date gets <date>T<HHMM>: no run
#      file is overwritten) and the cache, and prints the commit message and the files to commit. Every run file
#      carries `commit`, `finished`, `selection` and each row's `status` (ws-coverage-matrix header, THE RUN FILE).
#   6. the options pin (ws-options-pin.cjs --check, report-only) on the same 1/28 share of its batches as tonight's
#      slice (with SHARD on a --full run: that shard's batches), into design/audit/matrix/options-pin-<date>.json, so
#      every live skill's options are re-checked against design/audit/baselines/options-verify.json within 28 nights
#      (one batch of ≈ 25 skills, ≈ 7 min a night; the whole pin is ≈ 1.9 h on two slots); OPTIONS_PIN=0 skips it.
# It never edits anything outside design/audit/matrix/. Exit 0 with red rows (--report-only): the deploy gate reads
# the red rows from the run files (folded); a crash exits non-zero.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
BRANCH=claude/sweet-newton-c8wrv1
DIR=${MQ_MATRIX_DIR:-design/audit/matrix}   # MQ_MATRIX_DIR: testing only (DRY=1 on a fixture directory)
DATE=$(date -u +%F)
SLOTS=${SLOTS:-2}
SLICES=28
CAP=${MQ_NIGHTLY_AFFECTED_CAP:-1200}
FULL=""; FORCE_SLICE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --full) FULL=1 ;;
    --slice) FORCE_SLICE=$2; shift ;;
    *) echo "ws-matrix-nightly: FAIL - unknown argument $1 (--full, --slice i/28)" >&2; exit 64 ;;
  esac
  shift
done
if [ -n "$FORCE_SLICE" ] && ! [[ "$FORCE_SLICE" =~ ^[0-9]+/[0-9]+$ ]]; then echo "ws-matrix-nightly: FAIL - --slice $FORCE_SLICE: i/28" >&2; exit 64; fi
if [ -n "$FULL" ] && [ -z "${SHARD:-}" ]; then echo "ws-matrix-nightly: FAIL - --full is the sharded full run: give SHARD=i/n" >&2; exit 64; fi
[ -x /tmp/mq-browser-run.sh ] || { cp tests/scripts/mq-browser-run.sh /tmp/mq-browser-run.sh; chmod +x /tmp/mq-browser-run.sh; }

git fetch -q origin "$BRANCH"
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
read -r COMPLETE NEXT_SLICE LAST < <(node -e '
const fs = require("fs"), path = require("path");
const [dir, suffix, slices] = process.argv.slice(1);
const { baselineComplete, RUN_RE } = require(path.resolve("tests/scripts/ws-coverage-matrix.cjs"));
const bc = baselineComplete(dir);
const missing = bc.complete ? [] : (bc.n === Number(slices) && bc.missing ? bc.missing : Array.from({ length: Number(slices) }, (_, i) => i + 1));
const mine = (f) => (suffix ? f.endsWith(suffix + ".json") : !/\.shard-/.test(f));
const runs = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => RUN_RE.test(f) && mine(f)).sort();
let last = "";
for (const f of runs.reverse()) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const a = j.selection && j.selection.affected;
    if (j.commit && !j.dirty && a && !a.droppedOverCap) { last = j.commit; break; }
  } catch (e) { /* unreadable: the deploy reports it */ }
}
if (!last) {   // no affected run yet: every change since the oldest slice baseline
  const sl = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => /^baseline\.slice-\d+-of-\d+\.json$/.test(f))
    .map((f) => { try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); return { c: String(j.commit || "").split(" ")[0], d: j.finished || j.date || "" }; } catch (e) { return null; } })
    .filter((x) => x && x.c).sort((a, b) => (a.d < b.d ? -1 : 1));
  if (sl.length) last = sl[0].c;
}
console.log(`${bc.complete ? 1 : 0} ${missing[0] || 1} ${last || "-"}`);
' "$DIR" "$SUFFIX" "$SLICES")
[ "$LAST" = "-" ] && LAST=""

# a second run on one date (a fired run) gets the time in its name, so the night's file is kept
RUNFILE="$DIR/$DATE$SUFFIX.json"
[ -e "$RUNFILE" ] && RUNFILE="$DIR/${DATE}T$(date -u +%H%M)$SUFFIX.json"
ARGS=(--all --slots "$SLOTS" --out "$RUNFILE" --cache "$DIR/cache$SUFFIX.json" --baseline "$DIR/baseline.json" --report-only "${SHARD_ARGS[@]}")
ROT=$(( ( $(date -u +%s) / 86400 ) % SLICES + 1 ))
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

if [ -n "${DRY:-}" ]; then
  node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" --list
  exit 0
fi
node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" | tee "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log"

TALLY=$(grep -E '^ws-coverage-matrix: OK [0-9]' "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log" | tail -1 | sed 's/^ws-coverage-matrix: //')

# Options pin (ws-options-pin.cjs): ws-options-verify against design/audit/baselines/options-verify.json (pinned for every
# live skill 2026-10-23). Each night checks the same 1/28 share of its batches as the matrix slice (owner: small jobs that
# never hold up current work); with SHARD (a --full run) that shard's batches. New failing pairs are listed in
# $DIR/options-pin-<date>.json and do not stop the night; a crash keeps the per-batch JSON (re-run today: --resume).
OPIN_TALLY="skipped"
if [ "${OPTIONS_PIN:-1}" != 0 ]; then
  if [ -n "${SHARD:-}" ]; then OPIN_SHARD=("${SHARD_ARGS[@]}"); else OPIN_SHARD=(--shard "${S:-$ROT/$SLICES}"); fi
  OPIN_ARGS=(--check --resume --slots "$SLOTS" --out "$DIR/options-pin-$DATE$SUFFIX.json" --report-only "${OPIN_SHARD[@]}")
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
