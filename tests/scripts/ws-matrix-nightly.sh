#!/usr/bin/env bash
# ws-matrix-nightly.sh - what the nightly scheduled session runs (IMPROVEMENT_PLAN §1.6.2 "the nightly job",
# §1.6.7 E1). The exact prompt of the scheduled task is in design/audit/matrix/NIGHTLY.md.
#
#   tests/scripts/ws-matrix-nightly.sh                 # one session, the container's two browser slots
#   SHARD=3/8 tests/scripts/ws-matrix-nightly.sh       # one of eight sharded sessions (16 slots: the full matrix)
#   DRY=1 tests/scripts/ws-matrix-nightly.sh           # print the selection (ws-coverage-matrix --list), run nothing
#
# What it does, on the checked-out tip of the integration branch (claude/sweet-newton-c8wrv1):
#   1. refuses unless HEAD is the fetched tip of origin/claude/sweet-newton-c8wrv1 (the matrix records that commit);
#   2. FIRST RUN (no nightly run file <date>.json in design/audit/matrix/ yet): every row of every live skill
#      (--all), and writes the per-row baseline (with SHARD: baseline.shard-i-of-n.json, merged by every reader);
#   3. otherwise: the rows the commits since the last nightly reach (--affected <last nightly's commit>..HEAD; before
#      M4 that is every print row whenever a print input changed, and none when only planning files, tests, generated
#      documents, search-terms.js or the index.html stamp changed) PLUS the rotating seventh of all rows (--seventh
#      <UTC day of week mod 7>), so every row runs at least weekly; rows already OK in design/audit/matrix/cache.json
#      for the same dependency hash are skipped; red = above the per-row baseline;
#   4. writes design/audit/matrix/<UTC date>.json (with SHARD: <date>.shard-i-of-n.json) and the cache;
#   5. the options pin: tests/scripts/ws-options-pin.cjs --check (every live skill's ws-options-verify run against
#      design/audit/baselines/options-verify.json; with SHARD its share of the batches) into
#      design/audit/matrix/options-pin-<date>.json; on the FIRST RUN, unsharded, --write re-pins every live skill
#      instead (OPTIONS_PIN=0 skips it);
#   6. prints the commit message for the session to commit with (the session adds its own attribution lines).
# It never edits anything outside design/audit/matrix/, except the options pin file on a first-run --write. Exit 0
# with red rows (--report-only): the deploy gate reads the red rows from the JSON; a crash exits non-zero.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
BRANCH=claude/sweet-newton-c8wrv1
DIR=design/audit/matrix
DATE=$(date -u +%F)
DOW=$(( $(date -u +%u) % 7 ))
SLOTS=${SLOTS:-2}
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

# the last nightly: the newest dated run file's recorded commit (shards of one night share it)
LAST=$(node -e '
const fs = require("fs"), d = process.argv[1];
const runs = (fs.existsSync(d) ? fs.readdirSync(d) : []).filter((f) => /^\d{4}-\d{2}-\d{2}(\.shard-\d+-of-\d+)?\.json$/.test(f)).sort();
for (const f of runs.reverse()) { try { const j = JSON.parse(fs.readFileSync(d + "/" + f, "utf8")); if (j.commit && !j.dirty) { console.log(j.commit); break; } } catch (e) {} }
' "$DIR")

ARGS=(--all --slots "$SLOTS" --out "$DIR/$DATE$SUFFIX.json" --cache "$DIR/cache$SUFFIX.json" --report-only "${SHARD_ARGS[@]}")
if [ -z "$LAST" ]; then
  # no nightly has run yet: every row, and its counts become the per-row baseline (merged with the rows a
  # builder's own check pinned before, e.g. the E1 check of two skills)
  MODE="first run: every row, writes the per-row baseline"
  ARGS+=(--baseline "$DIR/baseline.json" --write-baseline)
else
  MODE="affected ${LAST:0:8}..${HEAD:0:8} + seventh $DOW"
  ARGS+=(--affected "$LAST..$HEAD" --seventh "$DOW" --baseline "$DIR/baseline.json")
fi
echo "ws-matrix-nightly: $DATE on ${HEAD:0:10} ($MODE)${SHARD:+, shard $SHARD}"

if [ -n "${DRY:-}" ]; then
  node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" --list
  exit 0
fi
node tests/scripts/ws-coverage-matrix.cjs "${ARGS[@]}" | tee "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log"

TALLY=$(grep -E '^ws-coverage-matrix: OK [0-9]' "/tmp/ws-matrix-nightly-$DATE$SUFFIX.log" | tail -1 | sed 's/^ws-coverage-matrix: //')

# Options pin (ws-options-pin.cjs): ws-options-verify on every live skill against design/audit/baselines/options-verify.json.
# First night (no nightly run file yet, as for the matrix) and not sharded: --write re-pins every live skill. Otherwise
# --check (with SHARD, this shard's batches): new failing pairs are listed in $DIR/options-pin-<date>.json and do not
# stop the night. A crash keeps the per-batch JSON in /tmp/mq-options-pin/<date>; running this script again the same
# day continues it (--resume). OPTIONS_PIN=0 skips the step.
OPIN_FILES=""
OPIN_TALLY="skipped"
if [ "${OPTIONS_PIN:-1}" != 0 ]; then
  OPIN_ARGS=(--resume --slots "$SLOTS" --out "$DIR/options-pin-$DATE$SUFFIX.json" --report-only "${SHARD_ARGS[@]}")
  if [ -z "$LAST" ] && [ -z "${SHARD:-}" ]; then OPIN_ARGS+=(--write); OPIN_MODE="write"; else OPIN_ARGS+=(--check); OPIN_MODE="check"; fi
  if node tests/scripts/ws-options-pin.cjs "${OPIN_ARGS[@]}" | tee "/tmp/ws-options-pin-$DATE$SUFFIX.log"; then
    OPIN_TALLY="$OPIN_MODE, $(grep -E '^against ' "/tmp/ws-options-pin-$DATE$SUFFIX.log" | tail -1 | sed -E 's/^against [^:]*: //')"
  else
    OPIN_TALLY="$OPIN_MODE CRASHED (run the script again today to resume)"
  fi
  OPIN_FILES=$(git status --porcelain -- design/audit/baselines/options-verify.json | awk '{print $2}')
fi

echo
echo "ws-matrix-nightly: commit message:"
echo "Matrix nightly $DATE${SHARD:+ shard $SHARD} on ${HEAD:0:8}: $TALLY ($MODE); options pin: $OPIN_TALLY"
echo "ws-matrix-nightly: files to commit: $(git status --porcelain -- "$DIR" | awk '{print $2}' | tr '\n' ' ')$OPIN_FILES"
