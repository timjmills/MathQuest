#!/usr/bin/env bash
# The ONE deploy-gate list (IMPROVEMENT_PLAN §1.4 S5; closes STATUS §7 "One deploy-gate list"), in three sessions
# that can run in three cloud sessions at once, or one after another here.
#
#   bash tests/scripts/ws-deploy-gates.sh --list            # print the gate list (session, kind, command, present?),
#                                                           # then the time budget check (A8; exits with it)
#   bash tests/scripts/ws-deploy-gates.sh --budget [--session N] [--timings f.jsonl]
#                                                           # A8: each session's predicted wall clock from the gates'
#                                                           # last measured seconds; FAIL over MQ_SESSION_BUDGET_MIN
#                                                           # (default 30); UNTIMED gates are a WARNING
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
#                                 NOT YET (needs a later M-step), NEEDS-SHARDED-RUN (the matrix is over its budget,
#                                 see session 3) or NOTHING RUN (the matrix found no checkable row); each is listed
#                                 with what to do - exit 2. A deploy waits.
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
#            catch their fixtures), ws-lessonfit (every year's WRM site-lesson gate) and ws-options-pin --gate design/audit/matrix (critic r4 D1: READ-ONLY, node only,
#            no browser slot, seconds: it folds the nightly's options-pin-*.json by `finished`, newest result per skill;
#            FAIL on a NEW failing pair of a live skill that no later check fixed, WARNING while fewer than 28 slices
#            are checked or the newest is over 24 h old, FAIL on that age once all 28 are; it never runs the pin);
#            and the browser gates, two at a time: ws-presets-unit, ws-anchors-unit, ws-boot-smoke, ws-content-audit,
#            ws-print-lint --source kit (--baseline design/audit/baselines/print-lint.json when it exists; else the
#            accepted limit MQ_PRINT_LINT_LIMIT, default 461 findings / 33 documents), ws-screen-answer,
#            ws-share-options, ws-teacher-shell, -library, -preview, -quiz, ws-teacher-wrm, ws-teacher-wrm --fallback,
#            and ws-detailed-lesson --lesson <id> --repeats for every lesson in js/modules/lessons/detailed/.
# Session 2  ws-screen-slots in MQ_SLOTS_SHARDS parts (default 4) with --baseline design/audit/baselines/screen-slots.json,
#            ws-chromebook-fit in MQ_FIT_SHARDS parts (default 2), the S9 regression (ws-screen-slots on measurement:reading_ruler_hard, card host, seeds 1-40,
#            --need-ans 1/4,1/2,3/4: readings under an inch show one answer area), and the sweeps on the pinned sample
#            (tests/fixtures/precritic/sweep-sample.json): ws-screen-slots --dark / --bigboard, ws-chromebook-fit
#            --dark / --bigboard (chromebook-fit's standing failures are pinned per skill and host in the sample file).
# Session 3  ws-viewport-check --baseline design/audit/baselines/viewport-check.json (a real session's scroll: the
#            R7-D1 class chromebook-fit cannot see; moved here from session 2 for time, MQ_VIEWPORT_SESSION=2 moves it
#            back), and ws-coverage-matrix on the affected rows with a DOCUMENT BUDGET (§1.6.2): MQ_COVERAGE_ARGS, default
#            `--all --affected <base>..HEAD --baseline design/audit/matrix/baseline.json --slots 2 --batch 9`, plus
#            `--max-docs MQ_MATRIX_BUDGET` (default 500). <base> is MQ_DEPLOY_BASE, else the merge base with
#            origin/master; when origin/master is not fetched the gate FAILS and says so (never a silent HEAD~1).
#            With the default args it adds `--red-from design/audit/matrix` (the rows red in the folded run state
#            run inline too) and `--out <logdir>/matrix-inline.json`. THEN, ON EVERY RUN (critic r2 D1.3), the nightly
#            rule reads EVERY run file in design/audit/matrix/, in the order they FINISHED (critic r4 D2), plus the
#            inline run, into each row's last-known state (a row's state = its status in the most recent run that ran
#            it; RED / ERROR persists across runs that did not select it, until a later run lists it OK):
#              FAIL               a row of a live skill (data.js SKILLS, tombstones out) is RED or ERROR in the folded
#                                 state (a row with no baseline entry is PENDING(no-baseline), never RED); or the
#                                 inline run FAILS; or, ONCE THE FIRST FULL BASELINE EXISTS (baseline.json
#                                 `complete: true`, or all 28 baseline.slice-i-of-28.json), there is no run file or the
#                                 newest run finished more than 24 h ago (`finished`, else its commit time, else date)
#              WARNING            (passes; owner 2026-10-23) the same age / no-run conditions BEFORE the first full
#                                 baseline exists; and, before it, affected rows over the budget (they are
#                                 PENDING(no-baseline), covered by the lanes' precritic; the deploy is not held)
#              OK                 within the budget: the inline run passed and the rule above found nothing. Over the
#                                 budget, with the full baseline: the newest run is complete (every shard i of n, each
#                                 with `finished`), on one clean commit the tip differs from only in design/audit/matrix/
#              NEEDS-SHARDED-RUN  over the budget, with the full baseline, otherwise. The deploy waits; the gate prints
#                                 the sharded run to fire (design/audit/matrix/NIGHTLY.md) and to re-run session 3.
#            The matrix's exit 2 within the budget (rows selected, none checkable) is NOTHING RUN.
#            Flake re-run (N7): only the rows the first inline run found red (--rows), never the whole budget.
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
# ACCEPTED (a NOT YET the lead accepted by name), NEEDS-SHARDED-RUN, NOTHING RUN, WARNING (the matrix gate passed with
# a warning the lead reads: listed above the verdict, counted in it, never a failure). Logs: $MQ_GATES_LOGDIR (default
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

usage() { sed -n '2,37p' "$0" | sed 's/^# \{0,1\}//'; }
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
# The nightly rule (§1.6.2, critic r2 D1, owner 2026-10-23):
#   nightly_check <matrix dir> <check-dirty 1|0> [fresh|full] [inline run file (fresh) | over-budget list (full)]
# It reads EVERY run file in <matrix dir> (ws-coverage-matrix foldRuns), oldest first, then the inline run file, into
# each row's last-known state: a row's state is its status in the most recent run that ran it, so a RED / ERROR row
# stays red until a later run lists it OK. Then, on every session-3 run:
#   - any row of a live skill RED or ERROR in the folded state: REFUSED (exit 1). A row with no baseline entry is
#     PENDING(no-baseline) in its run file, never RED, so it never refuses;
#   - no run file, or the newest run finished more than 24 h ago: REFUSED once the first full baseline exists
#     (ws-coverage-matrix baselineComplete: baseline.json `complete: true`, or every baseline.slice-i-of-n.json);
#     until then a WARNING (exit 4), never a refusal;
#   - mode full (over the budget): with the full baseline, OK (0) only when the newest run is complete, on one clean
#     commit the tip differs from only in the matrix dir, else NEEDS-SHARDED-RUN (3); before it, WARNING (4): the
#     affected rows are PENDING(no-baseline) or covered by the lanes' precritic, and the deploy is not held (owner).
#   - mode fresh (within the budget, the inline run stands in for "covers HEAD"): OK (0) or WARNING (4).
#   - (I4) the merged baseline pins a row in two files with different contents: REFUSED, naming both files;
#   - (N1) a red id that is no longer a row of its live skill: MAPPED to the row of the same kind and flags (refused
#     until that row runs OK later), else RETIRED-ROW: a WARNING that says how to clear it (--retire), never a refusal;
#   - (N5) every .json in the dir with commit + finished + rows is folded whatever its name, the rest is listed;
#     the age / cover rules read the nightly's own names (<date>[T<HHMM>][.shard-i-of-n].json) only;
#   - (N4) over the budget before the full baseline, the WARNING names how many affected rows HAVE a baseline entry
#     (unchecked at this deploy) and how many have none, from the matrix's <inline>.over-budget.json.
#   - (critic r4 D2) every run file is folded in the order it FINISHED (`finished`), whatever its name, ties by name;
#   - (A10, ws-coverage-matrix foldRuns) a run file whose `finished` is more than 10 min after now (MQ_NOW) is a WARNING:
#     its rows clear nothing, and it is never "the newest nightly" for the age / cover rules; (A11) a run file with no
#     `baseline` field that finished after the N2 cut-off (2026-10-23T19:46Z) clears nothing (before it: the WARNING);
#   - (critic r4 N2 / N3 / N9, ws-coverage-matrix foldRuns) an OK judged against another directory's baseline or a stale
#     entry, an OK from a dirty run, and PENDING(step) / N/A never clear a red row; each such OK is a WARNING, as is a
#     run file written before N2 that cleared a row unchecked, and a row with a baseline entry that turned N/A.
# MQ_NOW (ISO time) replaces the clock (fixtures).
nightly_check() {
  node - "$1" "$2" "$ROOT" "${3:-full}" "${4:-}" <<'EOF'
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const [dir, checkDirty, root, mode, extra] = process.argv.slice(2);
const git = (...a) => execFileSync('git', ['-C', root, ...a], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
const now = process.env.MQ_NOW ? Date.parse(process.env.MQ_NOW) : Date.now();
const H24 = 24 * 3600 * 1000;
const { foldRuns, baselineComplete, loadBaseline, baselineConflictError, resolveRed, rowIndexFor, foldSkipNote, foldWarnings } = require(path.join(root, 'tests', 'scripts', 'ws-coverage-matrix.cjs'));
const refuse = (why) => { console.log(`nightly: REFUSED - ${why}`); console.log('nightly: FAIL'); process.exit(1); };
const warnings = [];
const warn = (w) => { warnings.push(w); console.log(`nightly: WARNING - ${w}`); };
const full = baselineComplete(dir);
console.log(`nightly: first full baseline: ${full.complete ? 'COMPLETE' : 'NOT complete'} (${full.how})`);
// I4: the merged baseline must not pin one row in two files with different contents
const merged = loadBaseline(path.join(dir, 'baseline.json'));
const conflict = baselineConflictError(merged);
if (conflict) refuse(conflict);
for (const d of merged.duplicates) warn(`(I4) ${d.id} is pinned in both ${path.basename(d.files[0])} and ${path.basename(d.files[1])} with the same contents; delete one copy`);
// mode full: the 4th argument is the matrix's over-budget list (N4), never a run file
let overList = null;
if (mode === 'full' && extra) { try { overList = JSON.parse(fs.readFileSync(extra, 'utf8')); } catch (e) { overList = null; } }
let extras = [];
if (mode !== 'full' && extra && fs.existsSync(extra)) {
  let ej = {}; try { ej = JSON.parse(fs.readFileSync(extra, 'utf8')); } catch (e) { /* reported by the fold */ }
  if (ej.dirty && checkDirty === '1') console.log(`nightly: the inline run ${extra} ran on a dirty tree: not folded (it cannot clear a red row)`);
  else extras = [extra];
}
const fold = foldRuns(dir, extras);
if (fold.bad.length) refuse(`unreadable run file(s): ${fold.bad.map((b) => `${b.file} (${b.error})`).join('; ')}`);
// N5: every .json that is a run is folded whatever its name; the rest is listed with why
for (const l of foldSkipNote(fold)) console.log(`nightly:${l.replace(/^ +/, ' ')}`);
// critic r4 N2 / N3 / N9: OK rows that may not clear (another baseline, a stale entry, a dirty run), pre-N2 run files
// that cleared rows unchecked, and pinned rows that turned N/A: each a WARNING (the rows stay red where they were red)
for (const w of foldWarnings(fold)) warn(w);
// the AGE and the COVER of the newest nightly are judged on the nightly's own names only (a lane's run under another
// name is folded for its rows, but it is not "the newest nightly")
const nightFiles = fold.files.filter((f) => !f.extra && f.named !== false && !f.future);   // A10: never a future-dated file
const run = (f) => {   // when one run file finished: `finished`, else its git commit time, else its date at 00:00 UTC
  let when = f.j.finished ? Date.parse(f.j.finished) : NaN, src = 'finished';
  if (!Number.isFinite(when)) { try { const c = git('log', '-1', '--format=%cI', '--', f.file); if (c) { when = Date.parse(c); src = 'git commit time'; } } catch (e) { /* not committed */ } }
  if (!Number.isFinite(when)) { when = Date.parse(`${String(f.j.date || f.stamp).slice(0, 10)}T00:00:00Z`); src = 'date 00:00 UTC'; }
  return { ...f, when, src };
};
let stamp = null, runs = [];
if (!nightFiles.length) {
  const why = `no nightly run file (${dir}/<YYYY-MM-DD>[T<HHMM>][.shard-i-of-n].json)`;
  if (full.complete) refuse(`${why}, and the first full baseline is complete`);
  warn(`${why}; not refused until the first full baseline is complete (owner 2026-10-23)`);
} else {
  stamp = nightFiles[nightFiles.length - 1].stamp;
  runs = nightFiles.filter((f) => f.stamp === stamp).map(run);
  for (const r of runs) console.log(`nightly: ${r.file} commit ${String(r.j.commit || '?').slice(0, 10)}${r.j.dirty ? ' (dirty)' : ''}, finished ${new Date(r.when).toISOString()} (${r.src}), ${(r.j.rows || []).length} row(s)`);
  const oldest = Math.min(...runs.map((r) => r.when));
  const age = (now - oldest) / 3600000;
  if (now - oldest > H24) {
    const why = `the newest nightly (${stamp}) finished ${age.toFixed(1)} h ago, more than 24 h`;
    if (full.complete) refuse(why);
    warn(`${why}; not refused until the first full baseline is complete (owner 2026-10-23)`);
  } else console.log(`nightly: the newest nightly (${stamp}) is ${age.toFixed(1)} h old`);
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
  // D1.1: every RED / ERROR row of the FOLDED state (not only the newest run's own rows)
  const red = [];
  const descOf = (id) => {
    const st = fold.rows.get(id);
    const tail = !st.lastSeenAs ? ''
      : st.lastSeenAs === 'PENDING(no-baseline)' ? `; printed since in run ${st.lastSeen} with no baseline entry, which does not clear it (I5): pin it with ws-coverage-matrix --repin '${id}' --reason "<why>"`
      : st.notRerun ? `; not re-run (now ${st.lastSeenAs}) in run ${st.lastSeen}, which does not clear it (N9): it stays red until a run lists it OK; if the row is gone for good: ws-coverage-matrix --retire '${id}' --reason "<why>"`
      : `; listed ${st.lastSeenAs} in run ${st.lastSeen}, which does not clear it`;
    return `${id} ${st.status} since run ${st.stamp === 'inline' ? 'inline (this deploy)' : st.stamp}${st.rises && st.rises.length ? ` (${String(st.rises[0]).slice(0, 80)})` : ''}${tail}`;
  };
  const liveRed = [];
  for (const id of fold.red) {
    const key = id.split('|')[0] || fold.rows.get(id).skill;
    if (live.has(key)) liveRed.push(id);
    else console.log(`nightly: ${descOf(id)}, but ${key} is not a live skill (ignored)`);
  }
  // N1: a red id that is no longer a row of its (live) skill: MAPPED to the row of the same kind and flags (its red
  // state carries there, cleared only when that row runs OK later), else RETIRED-ROW (a warning, never a refusal)
  if (liveRed.length) {
    const index = await rowIndexFor([...new Set(liveRed.map((id) => id.split('|')[0]))]);
    const res = resolveRed(liveRed, fold, index);
    for (const id of res.current) red.push(descOf(id));
    for (const m of res.mapped) {
      const from = fold.rows.get(m.from), to = fold.rows.get(m.to);
      if (to && to.seq > from.seq && to.status === 'OK' && to.valid !== false) console.log(`nightly: ${m.from} (RED since run ${from.stamp}) is now the row ${m.to} (same kind and flags), which run ${to.stamp} lists OK: cleared`);
      else red.push(`${descOf(m.from)}; the row is now ${m.to} (same kind and flags)${to ? `, ${to.status} in run ${to.stamp}` : ', not run since'}`);
    }
    for (const x of res.retired) warn(`RETIRED-ROW ${descOf(x.id)}: ${x.why}. It no longer exists, so it does not hold the deploy. Clear it: node tests/scripts/ws-coverage-matrix.cjs --retire '${x.id}' --reason "<why it is gone>" (writes a run file listing it RETIRED; commit it)`);
  }
  const foldedN = fold.files.filter((f) => !f.extra).length;
  const folded = `the folded state of ${foldedN} run file(s)${foldedN !== nightFiles.length ? ` (${foldedN - nightFiles.length} under another name)` : ''}${extras.length ? ' + the inline run' : ''} (${fold.rows.size} row(s) known)`;
  if (red.length) refuse(`${red.length} row(s) of live skills are RED / ERROR in ${folded}, and no later run lists them OK: ${red.slice(0, 10).join('; ')}${red.length > 10 ? ' ...' : ''}`);
  console.log(`nightly: no RED / ERROR row of a live skill in ${folded}`);
  // N10: what the newest run actually ran
  const what = (j) => {
    const s = j.selection;
    if (!s) return 'selection not recorded';
    const p = [];
    if (s.affected) p.push(`affected ${String(s.affected.from).slice(0, 8)}..${String(s.affected.to).slice(0, 8)}${s.affected.droppedOverCap ? ` (${s.affected.droppedOverCap.rows} rows reached, DROPPED over the ${s.affected.droppedOverCap.cap}-document cap)` : s.affected.reached != null ? ` (${s.affected.reached} rows reached)` : ''}`);
    if (s.slice) p.push(`slice ${s.slice}`); else if (s.seventh != null) p.push(`seventh ${s.seventh}`);
    if (s.redFrom) p.push(`${(s.redFrom.reselected || []).length} re-selected red row(s)`);
    if (!p.length) p.push(s.skills === 'all' ? 'every row of every live skill' : `rows of ${[].concat(s.skills).length} skill(s)`);
    return p.join(' + ') + (s.shard ? ` [shard ${s.shard}]` : '');
  };
  const tally = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.j.totals || {})) tally[k] = (tally[k] || 0) + v;
  const ran = runs.length ? `run ${stamp} (${runs.length} file(s): ${[...new Set(runs.map((r) => what(r.j)))].join('; ')}; ${Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ') || 'no totals'})` : 'no run';
  const done = (code, line) => { console.log(line); console.log(code === 4 ? 'nightly: WARNING' : 'nightly: OK'); process.exit(code); };
  if (mode === 'fresh') done(warnings.length ? 4 : 0, `nightly: ${ran}; the inline run covers this deploy's affected rows${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
  if (!full.complete) {
    // N4: say exactly which affected rows have a baseline entry (they go UNCHECKED at this deploy) and which have none
    let detail;
    if (overList && Array.isArray(overList.withBaseline) && Array.isArray(overList.noBaseline)) {
      const w = overList.withBaseline, nb = overList.noBaseline;
      detail = `${w.length + nb.length} affected row(s): ${w.length} HAVE a baseline entry and are NOT checked at this deploy${w.length ? ` (${w.slice(0, 4).join(', ')}${w.length > 4 ? ` and ${w.length - 4} more` : ''})` : ''}; ${nb.length} have no entry (PENDING(no-baseline), nothing to compare yet). The full list: ${extra}`;
    } else detail = `the matrix wrote no list of them${extra ? ` (${extra} missing)` : ''}, so it is unknown which are baselined: any affected row that has a baseline entry is NOT checked at this deploy`;
    warn(`the affected rows are over the budget and the first full baseline is not complete (${full.how}): ${detail}. The deploy is not held (owner 2026-10-23); the lanes' precritic covers their own skills`);
    done(4, `nightly: ${ran}; not a cover of this tip`);
  }
  // does the newest run cover this tip? every shard present, one commit, the tip differing from it only in the matrix dir
  const why = [];
  const sh = runs.filter((r) => r.shard);
  if (sh.length) { const n = sh[0].shard.n; const have = new Set(sh.map((r) => r.shard.i)); const miss = []; for (let i = 1; i <= n; i++) if (!have.has(i)) miss.push(`${i}/${n}`); if (miss.length) why.push(`shard(s) ${miss.join(', ')} of ${stamp} are missing`); }
  const commits = [...new Set(runs.map((r) => r.j.commit))];
  if (commits.length !== 1) why.push(`its files ran on ${commits.length} commits`);
  if (runs.some((r) => r.j.dirty)) why.push('it ran on a dirty tree');
  const unfinished = runs.filter((r) => !r.j.finished);
  if (unfinished.length) why.push(`${unfinished.length} run file(s) carry no "finished" (${unfinished.map((r) => path.basename(r.file)).join(', ')})`);
  if (runs.some((r) => r.j.selection && r.j.selection.affected && r.j.selection.affected.droppedOverCap)) why.push('it dropped the affected rows over its cap, so they did not run');
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
  if (!why.length) done(warnings.length ? 4 : 0, `nightly: ${ran} ran on ${String(commits[0]).slice(0, 10)}, and HEAD ${head.slice(0, 10)} differs from it only in ${dir}/: it covers HEAD`);
  console.log(`nightly: ${ran}; it does not cover this tip: ${why.join('; ')}`);
  console.log('nightly: NEEDS-SHARDED-RUN');
  process.exit(3);
})().catch((e) => { console.log(`nightly: FAIL - ${e.message}`); process.exit(1); });
EOF
}

# What the lead fires when the affected rows are over the budget and the first full baseline exists (NIGHTLY.md).
sharded_run_help() {
  cat <<EOF
NEEDS-SHARDED-RUN: the affected rows are over the ${MATRIX_BUDGET}-document budget, the first full baseline exists, the
newest nightly is fresh and no row of a live skill is red in the folded state, but no complete run has covered this
tip ($(git rev-parse --short HEAD 2>/dev/null)). The deploy waits. To finish this gate:
  1. Push this tip to the integration branch claude/sweet-newton-c8wrv1 (the run checks out its fetched tip).
  2. Fire the sharded full run on it (design/audit/matrix/NIGHTLY.md, "The full run when a deploy needs it"):
         SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh --full     for i = 1 ... 8, one session each
     Each pushes design/audit/matrix/<date>[T<HHMM>].shard-<i>-of-8.json.
  3. When all eight are pushed with "finished": git pull, then
         bash tests/scripts/ws-deploy-gates.sh --session 3 --accept-notyet digests
     The gate is OK when that run is complete, on a commit this tip differs from only in design/audit/matrix/,
     and no row of a live skill is RED or ERROR in the folded state of every run file.
EOF
}

# Session 3's matrix gate (§1.6.2, critic r2 D1, owner 2026-10-23). On EVERY run:
#   1. the affected rows (plus the rows red in the folded nightly state, --red-from) within the document budget run
#      inline, writing $LOGDIR/matrix-inline.json; over the budget the matrix exits 3 and runs nothing;
#   2. the nightly rule (nightly_check) reads every run file + the inline run: a red row of a live skill refuses; an old
#      or missing nightly refuses once the first full baseline exists, and is a WARNING before it.
# Exit 0 OK, 1 FAIL, 2 NOTHING RUN, 3 NEEDS-SHARDED-RUN, 4 WARNING (passed, with warnings to read).
# N7: on the flake re-run (MQ_GATE_RETRY=1) only the rows the first run found red are re-run (--rows <ids>), never the
# whole budget; a failure that was the nightly rule is deterministic, so only the rule is re-read.
# MQ_MATRIX_CMD replaces `node <ws-coverage-matrix>` (self-test stubs).
matrix_gate() {
  local cm=$1 cargs base rc out n nrc ids prev
  local cmd=${MQ_MATRIX_CMD:-node $cm}
  local inline="$LOGDIR/matrix-inline.json" state="$LOGDIR/matrix-gate.state"
  if [ -n "${MQ_COVERAGE_ARGS:-}" ]; then cargs=$MQ_COVERAGE_ARGS
  else
    base=$(deploy_base) || return 1
    cargs="--all --affected $base..HEAD --baseline design/audit/matrix/baseline.json --slots 2 --batch 9"
    # D1.2: the rows red in the folded state run inline too, when this tree's matrix knows --red-from
    if [ -n "${MQ_MATRIX_CMD:-}" ] || grep -q "'red-from'" "$cm"; then cargs="$cargs --red-from $MATRIX_DIR"; fi
  fi
  if [ -n "${MQ_GATE_RETRY:-}" ] && [ -f "$state" ]; then
    prev=$(cat "$state")
    if [ "$prev" = inline-red ]; then
      ids=$(node -e 'try { const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); console.log((j.red || []).join(",")); } catch (e) { console.log(""); }' "$inline")
      if [ -z "$ids" ]; then echo "matrix: flake re-run: the first run left no red row ids in $inline; the matrix is not re-run blind (N7)"; return 1; fi
      echo "matrix: flake re-run (N7): only the $(printf '%s\n' "$ids" | tr ',' '\n' | wc -l) row(s) the first run found red: $ids"
      rm -f "$inline"
      $cmd --all --rows "$ids" --baseline design/audit/matrix/baseline.json --slots 2 --batch 9 --out "$inline"; rc=$?
    else
      echo "matrix: flake re-run (N7): the first run's failure was the nightly rule ($prev), which is deterministic: only the rule is re-read, no row is re-run"
      case "$prev" in nightly-*) rc=3 ;; freshnightly-[0-9]) rc=${prev#freshnightly-} ;; inline-[0-9]) rc=${prev#inline-} ;; *) rc=0 ;; esac
    fi
  else
    rm -f "$inline" "${inline%.json}.over-budget.json"
    case " $cargs " in *" --out "*) ;; *) cargs="$cargs --out $inline" ;; esac
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
  fi
  if [ "$rc" = 3 ]; then
    echo "matrix: over the budget; the nightly rule decides (§1.6.2)"
    nightly_check "$MATRIX_DIR" "${MQ_NIGHTLY_DIRTY_CHECK:-1}" full "${inline%.json}.over-budget.json"; nrc=$?
    [ $nrc = 3 ] && sharded_run_help
    echo "nightly-$nrc" > "$state"
    return $nrc
  fi
  echo "matrix: within the budget (inline exit $rc); the nightly rule is checked on every deploy (age and red rows, D1.3)"
  nightly_check "$MATRIX_DIR" "${MQ_NIGHTLY_DIRTY_CHECK:-1}" fresh "$inline"; nrc=$?
  if [ "$rc" = 1 ]; then echo inline-red > "$state"; return 1; fi
  if [ $nrc = 1 ]; then echo "freshnightly-$rc" > "$state"; return 1; fi
  echo "inline-$rc" > "$state"
  if [ "$rc" = 0 ] && [ $nrc = 4 ]; then return 4; fi
  return "$rc"
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

  # session 3: the matrix budget and the nightly rule (critic r1 D1, critic r2 D1, owner 2026-10-23), on fixture
  # nightly dirs and a stub matrix. Dirs with baseline.json `complete: true` are AFTER the first full baseline.
  echo "-- the matrix budget and the nightly rule (MQ_NOW=2026-10-23T12:00:00Z)"
  local nx=$fx/nightly
  ncase() {   # name, nightly dir, want rc (0 OK, 1 FAIL, 2 NOTHING RUN, 3 NEEDS-SHARDED-RUN, 4 WARNING), stub exit
    local name=$1 d=$2 want=$3 got
    MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=${NC_NOW:-2026-10-23T12:00:00Z} MQ_MATRIX_DIR=$d MQ_MATRIX_CMD="bash $fx/matrix-stub.sh ${4:-3}" MQ_COVERAGE_ARGS="--all --affected X..HEAD" MQ_NIGHTLY_DIRTY_CHECK=0 \
      bash -c 'source "$0" --source-only; matrix_gate tests/scripts/ws-coverage-matrix.cjs' "$0" > "$tmp/m.log" 2>&1; got=$?
    if [ "$got" = "$want" ]; then echo "  ok   $name: exit $got ($(grep -E '^nightly: (REFUSED|WARNING|NEEDS|run )|^nightly: no RED|^ws-coverage-matrix: (FAIL)' "$tmp/m.log" | head -n 1 | cut -c1-160))"
    else echo "  FAIL $name: exit $got, want $want"; sed 's/^/       /' "$tmp/m.log" | tail -n 14; bad=1; fi
  }
  echo "   within the budget (the rows run inline; the nightly rule is read on EVERY deploy, D1.3)"
  ncase "within, fresh green nightly (its 10-20 red row cleared by 10-23's OK): OK" "$nx/fresh" 0 0
  ncase "within, a red row fails inline" "$nx/fresh" 1 1
  ncase "within, a RED row of a live skill in the nightly: refused although the inline run is OK" "$nx/red" 1 0
  MQ_STUB_OK_ROWS='addition:add_20_regroup|sections/ex-each' ncase "within, the inline run re-ran the nightly's red row OK: OK" "$nx/red" 0 0
  ncase "within, the critic r2 status-only deploy (0 rows) with no nightly, before the full baseline: WARNING" "$nx/none" 4 0
  ncase "within, no nightly, AFTER the full baseline: refused" "$nx/none-complete" 1 0
  ncase "within, stale nightly (31 h) before the full baseline: WARNING, passes" "$nx/stale" 4 0
  ncase "within, stale nightly (31 h) after the full baseline: refused" "$nx/stale-complete" 1 0
  ncase "within, a row with no baseline entry (PENDING(no-baseline)) is not red: OK" "$nx/no-baseline" 0 0
  ncase "within, A10: a lane re-check dated 20 h in the future lists the red row OK: refused (it clears nothing)" "$nx/future" 1 0
  if grep -q 'nightly: WARNING - lane-recheck.json finished 2026-10-24T08:00:00Z, 20.0 h after now' "$tmp/m.log"; then echo "  ok   A10: the future-dated file is named in a WARNING"; else echo "  FAIL A10: no WARNING names the future-dated file"; bad=1; fi
  ncase "within, A10: the only nightly file is dated in the future: not the newest nightly (no nightly: WARNING)" "$nx/future-only" 4 0
  if grep -q 'no nightly run file' "$tmp/m.log" && grep -q '2026-10-23T0900.json finished 2026-10-25T09:00:00Z' "$tmp/m.log"; then echo "  ok   A10: a future-dated nightly is never the newest nightly (age / cover)"; else echo "  FAIL A10: the future-dated nightly counted as the newest"; sed 's/^/       /' "$tmp/m.log" | tail -n 6; bad=1; fi
  NC_NOW=2026-10-23T21:00:00Z ncase "within, A11: a run file with no baseline field, finished 19:58 (after the 19:46 cut-off), lists the red row OK: refused" "$nx/legacy-after" 1 0
  if grep -q 'after the N2 cut-off 2026-10-23T19:46:00Z.*(A11)' "$tmp/m.log"; then echo "  ok   A11: the refusal's WARNING says why the file clears nothing"; else echo "  FAIL A11: no A11 reason"; sed 's/^/       /' "$tmp/m.log" | tail -n 6; bad=1; fi
  NC_NOW=2026-10-23T21:00:00Z ncase "within, A11: the same file finished 06:30 (before the cut-off): it clears, with the pre-N2 WARNING" "$nx/legacy-before" 4 0
  ncase "within, every row PENDING (matrix exit 2): passed through as 2" "$nx/fresh" 2 2
  echo "   over the budget"
  ncase "over, no nightly before the full baseline: WARNING (owner: not held)" "$nx/none" 4
  ncase "over, no nightly after the full baseline: refused" "$nx/none-complete" 1
  ncase "over, stale nightly before the full baseline: WARNING" "$nx/stale" 4
  ncase "over, stale nightly after the full baseline: refused" "$nx/stale-complete" 1
  ncase "over, a RED row of a live skill (shard 2 of 2): refused" "$nx/red" 1
  ncase "over, RED only on a skill that is not live: NEEDS-SHARDED-RUN" "$nx/red-dead" 3
  ncase "over, fresh and green on another commit: NEEDS-SHARDED-RUN" "$nx/fresh" 3
  ncase "over, a shard of the run missing: NEEDS-SHARDED-RUN" "$nx/missing-shard" 3
  ncase "over, a complete green run on HEAD: OK" "$nx/covered" 0
  ncase "over, a fired run (T0900) on HEAD that did NOT re-run that date's red row: refused (D1.4)" "$nx/fired-not-rerun" 1
  ncase "over, a later fired run lists the red row OK: OK (D1.4)" "$nx/fired-rerun" 0
  ncase "over, critic r2 reproduce (10-22 RED on HEAD, 10-23 green without it): refused" "$nx/reproduce" 1
  ncase "over, an ERROR id only in the run file's red list: refused" "$nx/red-list" 1
  ncase "over, a shard without finished: NEEDS-SHARDED-RUN" "$nx/unfinished" 3
  ncase "over, a row PENDING(no-baseline) before the full baseline: WARNING, not refused" "$nx/no-baseline" 4
  # the critic's own command, verbatim in shape: nightly_check <dir> 0 on the reproduce fixture
  local got
  MQ_NOW=2026-10-23T12:00:00Z bash -c 'source "$0" --source-only; nightly_check "$1" 0' "$0" "$nx/reproduce" > "$tmp/m.log" 2>&1; got=$?
  if [ "$got" = 1 ] && grep -q 'addition:add_20_regroup|single/ex-each RED since run 2026-10-22' "$tmp/m.log"; then echo "  ok   critic r2 command: nightly_check reproduce 0 refuses, naming the row and the run it went red in"
  else echo "  FAIL critic r2 command: exit $got"; sed 's/^/       /' "$tmp/m.log" | tail -n 8; bad=1; fi
  # fix round 3 (critic r3): the BASELINE INVARIANTS at deploy (I4, I5) and the nits N1, N4, N5
  echo "   critic r3: baseline invariants and nits at deploy"
  gcase() {   # name, nightly dir, want rc, stub exit, a pattern the log must hold [, a pattern it must NOT hold]
    local name=$1 d=$2 want=$3 st=$4 pat=$5 nopat=${6:-} got
    MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$d MQ_MATRIX_CMD="bash $fx/matrix-stub.sh $st" MQ_COVERAGE_ARGS="--all --affected X..HEAD" MQ_NIGHTLY_DIRTY_CHECK=0 \
      bash -c 'source "$0" --source-only; matrix_gate tests/scripts/ws-coverage-matrix.cjs' "$0" > "$tmp/m.log" 2>&1; got=$?
    if [ "$got" = "$want" ] && grep -qE -- "$pat" "$tmp/m.log" && { [ -z "$nopat" ] || ! grep -qE -- "$nopat" "$tmp/m.log"; }; then echo "  ok   $name: exit $got ($(grep -oE -- "$pat" "$tmp/m.log" | head -n 1 | cut -c1-170))"
    else echo "  FAIL $name: exit $got, want $want, pattern /$pat/${nopat:+, not /$nopat/}"; sed 's/^/       /' "$tmp/m.log" | tail -n 14; bad=1; fi
  }
  gcase "I4: a row pinned in two baseline files with different contents: refused naming both" "$nx/conflict" 1 0 'REFUSED - the merged baseline pins 1 row\(s\) in two files .*addition:add_20_regroup\|single/ex-each in baseline\.json and baseline\.slice-3-of-28\.json'
  gcase "I5: RED on 10-22, printed with no baseline entry on 10-23: still refused (not a fix)" "$nx/red-then-no-baseline" 1 0 'addition:add_20_regroup\|single/ex-each RED since run 2026-10-22 .*printed since in run 2026-10-23 with no baseline entry, which does not clear it'
  gcase "N1: red ids that are no longer rows and match no current row: RETIRED-ROW warnings, not refused" "$nx/retired-row" 4 0 'WARNING - RETIRED-ROW addition:add_20_regroup\|single/more-oldname RED .*--retire' 'REFUSED'
  gcase "N1: the critic's ghost row (red-list only, no flags recorded): RETIRED-ROW, not refused" "$nx/retired-row" 4 0 'RETIRED-ROW addition:add_20_regroup\|single/more-gone RED .*cannot be matched' 'REFUSED'
  gcase "N1: a red id renamed (same kind and flags as ex-each): mapped, refused until that row runs OK" "$nx/mapped-row" 1 0 'single/ex-beside RED since run 2026-10-23 .*the row is now addition:add_20_regroup\|single/ex-each'
  gcase "N1: the mapped row ran OK later: cleared" "$nx/mapped-cleared" 0 0 'ex-beside \(RED since run 2026-10-23\) is now the row addition:add_20_regroup\|single/ex-each \(same kind and flags\), which run 2026-10-23T0900 lists OK: cleared'
  gcase "N5: a .json without finished is listed as skipped, with why" "$nx/other-name" 1 0 'WARNING skipped e1-check-2026-10-23\.json: not a run file: no finished'
  gcase "N5: a run file under another name is folded, and its red row is the refusal" "$nx/other-name" 1 0 'REFUSED - 1 row\(s\) of live skills are RED .*addition:add_20_regroup\|single/ex-each RED since run 2026-10-23T0600'
  MQ_STUB_OVER_LIST='addition:add_100_regroup|single/defaults,addition:add_20_regroup|single/ex-each;addition:add_20_regroup|single/ex-top' \
    gcase "N4: over the budget before the full baseline: the WARNING names the baselined rows as NOT checked" "$nx/none" 4 3 '3 affected row\(s\): 2 HAVE a baseline entry and are NOT checked at this deploy \(addition:add_100_regroup\|single/defaults, addition:add_20_regroup\|single/ex-each\); 1 have no entry' 'they are PENDING\(no-baseline\), covered'
  gcase "N4: without the matrix's list the WARNING says it is unknown which are baselined (never claims coverage)" "$nx/none" 4 3 'unknown which are baselined: any affected row that has a baseline entry is NOT checked'
  echo "   critic r4: fold order (D2), the baseline a clearing run was judged against (N2), dirty runs (N3), N/A (N9)"
  gcase "D2: lane-check.json (finished 00:30, OK) is older than 2026-10-23.json (02:10, RED): refused" "$nx/fold-order" 1 0 'addition:add_20_regroup\|single/ex-each RED since run 2026-10-23 '
  gcase "D2 reverse: an earlier lane RED (00:30), a later nightly OK (02:10): OK, no false refusal" "$nx/fold-order-reverse" 0 0 'no RED / ERROR row of a live skill'
  MQ_NOW=2026-10-23T03:00:00Z bash -c 'source "$0" --source-only; nightly_check "$1" 0 fresh' "$0" "$nx/fold-order" > "$tmp/m.log" 2>&1; got=$?
  if [ "$got" = 1 ] && grep -q 'REFUSED - 1 row(s) of live skills are RED' "$tmp/m.log"; then echo "  ok   critic r4 D2 command: MQ_NOW=2026-10-23T03:00:00Z nightly_check <fold-order> 0 fresh refuses"
  else echo "  FAIL critic r4 D2 command: exit $got"; sed 's/^/       /' "$tmp/m.log" | tail -n 8; bad=1; fi
  gcase "N2: RED, then OK judged against another directory's baseline: refused, the OK warned and ignored" "$nx/foreign-ok" 1 0 "WARNING - 2026-10-23\.json lists 1 red row\(s\) OK that it may not clear, so they stay red: judged against design/elsewhere/baseline\.json, not this directory's baseline"
  gcase "N3: RED, then a DIRTY run lists it OK: refused, the OK warned and ignored" "$nx/dirty-ok" 1 0 'WARNING - 2026-10-23\.json lists 1 red row\(s\) OK .*dirty: true.*never clears'
  gcase "N9: RED, then N/A: stays red (not re-run), refused" "$nx/turned-na" 1 0 'single/ex-each RED since run 2026-10-22 .*; not re-run \(now N/A\) in run 2026-10-23'
  gcase "N9: a pinned row that turned N/A is a WARNING" "$nx/pinned-na" 4 0 'WARNING - 1 row\(s\) with a baseline entry are N/A now'
  vcase "OK + NOTHING RUN" 2 'ws-deploy-gates: INCOMPLETE' "OK:a" "NOTHING RUN:ws-coverage-matrix"
  vcase "OK + WARNING (the matrix gate passed with a warning)" 0 'ws-deploy-gates: OK' "OK:a" "WARNING:ws-coverage-matrix"
  if grep -q 'SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh' < <(MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$nx/fresh MQ_MATRIX_CMD="bash $fx/matrix-stub.sh 3" MQ_COVERAGE_ARGS=x MQ_NIGHTLY_DIRTY_CHECK=0 bash -c 'source "$0" --source-only; matrix_gate x' "$0" 2>&1); then
    echo "  ok   NEEDS-SHARDED-RUN prints the sharded run to fire"; else echo "  FAIL NEEDS-SHARDED-RUN does not print the sharded run"; bad=1; fi
  # N10: the OK line says what the run ran
  MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$nx/covered MQ_MATRIX_CMD="bash $fx/matrix-stub.sh 3" MQ_COVERAGE_ARGS=x MQ_NIGHTLY_DIRTY_CHECK=0 bash -c 'source "$0" --source-only; matrix_gate x' "$0" > "$tmp/m.log" 2>&1
  if grep -qE '^nightly: run 2026-10-23 \(2 file\(s\): .*\) ran on .* it covers HEAD' "$tmp/m.log" && ! grep -q 'the sharded run of' "$tmp/m.log"; then echo "  ok   N10: the OK line names the run and what it ran ($(grep -E '^nightly: run ' "$tmp/m.log" | cut -c1-110)...)"
  else echo "  FAIL N10: OK line"; tail -n 4 "$tmp/m.log" | sed 's/^/       /'; bad=1; fi
  # N7: the flake re-run of the matrix gate re-runs only the red rows of the first run (--rows), never the budget
  echo "-- N7: the matrix gate's flake re-run"
  G_SES=(T); G_KIND=(nfn); G_NAME=("matrix gate (stub)"); G_KEY=("")
  G_CMD=("MATRIX_DIR=$nx/fresh MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_CMD='bash $fx/matrix-stub.sh 1' MQ_STUB_RETRY_RC=0 MQ_COVERAGE_ARGS='--all --affected X..HEAD' MQ_NIGHTLY_DIRTY_CHECK=0 matrix_gate x")
  : > "$FLAKES"; : > "$RES"; run_session T 2>/dev/null
  local rl="$LOGDIR/sT-$(slug "matrix gate (stub)").retry.log"
  if [ "$(cut -f3 "$RES")" = FLAKE ] && grep -q 'matrix-stub: args --all --rows addition:add_100_regroup|single/defaults ' "$rl" && ! grep -q -- '--affected' "$rl"; then
    echo "  ok   a red inline row that passes alone: FLAKE, and the re-run ran only --rows addition:add_100_regroup|single/defaults"
  else echo "  FAIL N7: result $(cut -f3 "$RES")"; sed 's/^/       /' "$rl" 2>/dev/null | head -n 6; bad=1; fi
  G_CMD=("MATRIX_DIR=$nx/red MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_CMD='bash $fx/matrix-stub.sh 0' MQ_COVERAGE_ARGS='--all --affected X..HEAD' MQ_NIGHTLY_DIRTY_CHECK=0 matrix_gate x")
  : > "$FLAKES"; : > "$RES"; run_session T 2>/dev/null
  if [ "$(cut -f3 "$RES")" = FAIL ] && grep -q 'only the rule is re-read, no row is re-run' "$rl" && ! grep -q 'matrix-stub: args' "$rl"; then echo "  ok   a nightly-rule refusal: the re-run re-reads the rule only (no matrix run), still FAIL"
  else echo "  FAIL N7 nightly-rule retry: result $(cut -f3 "$RES")"; sed 's/^/       /' "$rl" 2>/dev/null | head -n 6; bad=1; fi
  G_SES=(); G_KIND=(); G_NAME=(); G_CMD=(); G_KEY=()
  # critic r4 D1: the options gate reads the nightly's options-pin results (node only, no browser, no pin run)
  echo "-- critic r4 D1: the options gate (ws-options-pin --gate) on fixture dirs (MQ_NOW=2026-10-23T12:00:00Z)"
  local ox=$fx/options-pin
  ocase() {   # name, fixture case, want rc (0 OK, 1 FAIL, 4 WARNING), a pattern the output must hold
    local name=$1 c=$2 want=$3 pat=$4 got
    MQ_NOW=2026-10-23T12:00:00Z node tests/scripts/ws-options-pin.cjs --gate "$ox/$c" --baseline "$ox/$c/pin.json" > "$tmp/o.log" 2>&1; got=$?
    if [ "$got" = "$want" ] && grep -qE -- "$pat" "$tmp/o.log"; then echo "  ok   $name: exit $got ($(grep -oE -- "$pat" "$tmp/o.log" | head -n 1 | cut -c1-150))"
    else echo "  FAIL $name: exit $got, want $want, pattern /$pat/"; sed 's/^/       /' "$tmp/o.log" | tail -n 8; bad=1; fi
  }
  ocase "no options-pin file: WARNING" none 4 'WARNING - no options-pin run file'
  ocase "a NEW pair of a live skill: refused" new-pair 1 'REFUSED - 1 live skill\(s\) .*composing:number_word_form: zeroPlace="always"'
  ocase "NEW on 10-22, fixed by the 10-23 check: OK" new-then-fixed 0 '^ws-options-pin --gate: OK'
  ocase "stale (57.9 h), fewer than 28 slices checked: WARNING" stale 4 'WARNING - the newest options-pin file finished 57\.9 h ago'
  ocase "stale (57.9 h) after a complete full run (all 28 slices): refused" stale-covered 1 'REFUSED - the newest options-pin file finished 57\.9 h ago'
  ocase "NEW on 10-22, a DIRTY clean check on 10-23 does not clear it: refused" dirty-clear 1 'dirty tree and lists no new pair; it does not clear'
  ocase "D2 class: a lane file (00:30, clean) does not override the later nightly (02:10, NEW): refused" order 1 'newest result: options-pin-2026-10-23\.json'
  # the gate as the deploy lists it: an nfn gate whose exit 4 shows as WARNING (passes), with no browser slot
  G_SES=(T); G_KIND=(nfn); G_NAME=("ws-options-pin --gate (read-only: nightly results)"); G_KEY=("")
  G_CMD=("MQ_NOW=2026-10-23T12:00:00Z node tests/scripts/ws-options-pin.cjs --gate $ox/stale --baseline $ox/stale/pin.json")
  : > "$RES"; run_session T 2>/dev/null
  if [ "$(cut -f3 "$RES")" = WARNING ] && [ "$(cut -f5 "$RES")" = 0 ]; then echo "  ok   on the gate list (nfn): exit 4 shows as WARNING, slot wait 0 s, $(cut -f4 "$RES") s"
  else echo "  FAIL the options gate on the list: $(cut -f3-5 "$RES" | tr '\t' ' ')"; bad=1; fi
  if build_list && for i in "${!G_NAME[@]}"; do [ "${G_SES[$i]}" = 1 ] && [ "${G_KIND[$i]}" = nfn ] && [[ "${G_CMD[$i]}" == *"ws-options-pin.cjs --gate"* ]] && echo yes; done | grep -q yes \
     && ! printf '%s\n' "${G_CMD[@]}" | grep -q 'ws-options-pin.cjs --check'; then echo "  ok   session 1 lists the read-only options gate (nfn, --gate) and never ws-options-pin --check"
  else echo "  FAIL session 1's options gate is not the read-only --gate"; bad=1; fi
  G_SES=(); G_KIND=(); G_NAME=(); G_CMD=(); G_KEY=()
  # A8: the deploy-list time budget, on the timings of the 2026-10-23 timed runs (tests/fixtures/precritic/deploy/budget)
  echo "-- A8: the deploy-list time budget (timings of the 2026-10-23 timed runs, 30-min budget)"
  local bx=$fx/budget
  bcase() {   # name, want rc (0 OK, 1 FAIL, 4 WARNING), timings file, pattern the output must hold, then env assignments
    local name=$1 want=$2 tf=$3 pat=$4 got; shift 4
    ( for a in "$@"; do export "$a"; done; G_SES=(); G_KIND=(); G_NAME=(); G_CMD=(); G_KEY=(); build_list; [ -n "${BCASE_ADD:-}" ] && add 1 node "ws-options-pin --check" "node tests/scripts/ws-options-pin.cjs --check"; budget_check "$tf" all ) > "$tmp/bu.log" 2>&1; got=$?
    if [ "$got" = "$want" ] && grep -qE -- "$pat" "$tmp/bu.log"; then echo "  ok   $name: exit $got ($(grep -oE -- "$pat" "$tmp/bu.log" | head -n 1 | cut -c1-150))"
    else echo "  FAIL $name: exit $got, want $want, pattern /$pat/"; grep '^budget' "$tmp/bu.log" | sed 's/^/       /' | head -n 12; bad=1; fi
  }
  bcase "the old list (ws-viewport-check in session 2): FAIL" 1 "$bx/timings-2026-10-23.jsonl" 'FAIL - session 2 is predicted at 3[3-4]\.[0-9] min' MQ_VIEWPORT_SESSION=2
  bcase "today's list (viewport in session 3): passes (the options gate is UNTIMED: WARNING)" 4 "$bx/timings-2026-10-23.jsonl" 'session 2: predicted 2[0-9]\.[0-9] min'
  grep -E '^budget: session [123]: predicted' "$tmp/bu.log" | sed 's/^/       /'
  if grep -q 'UNTIMED ws-options-pin --gate' "$tmp/bu.log" && ! grep -q 'budget: FAIL' "$tmp/bu.log"; then echo "  ok   today's list: no session over 30 min; the gate with no measure is listed UNTIMED"; else echo "  FAIL today's list: $(grep -E '^budget: (FAIL|WARNING)' "$tmp/bu.log" | head -n 3)"; bad=1; fi
  cat "$bx/timings-2026-10-23.jsonl" "$bx/timings-pin-check.jsonl" > "$tmp/pin.jsonl"
  bcase "critic r4 D1: ws-options-pin --check added to session 1: FAIL" 1 "$tmp/pin.jsonl" 'FAIL - session 1 is predicted at [0-9]+\.[0-9] min, over the 30-min budget \(the longest: ws-options-pin --check 13440 s' BCASE_ADD=1
  bcase "a gate with no measure (no timings file at all) is UNTIMED, never a FAIL" 4 "$tmp/none.jsonl" 'WARNING - UNTIMED ws-content-audit'
  bcase "the matrix budget is modelled from MQ_MATRIX_BUDGET (900 documents x 5.26 slot-s): session 3 over 30 min" 1 "$bx/timings-2026-10-23.jsonl" 'FAIL - session 3 is predicted' MATRIX_BUDGET=900
  # the budget is the first result row of every session run
  G_SES=(T); G_KIND=(node); G_NAME=("ws-content-audit"); G_CMD=("true"); G_KEY=("")
  BUDGET_AT_START=1 TIMINGS_READ="$bx/timings-2026-10-23.jsonl"; : > "$RES"; run_session T 2>/dev/null; BUDGET_AT_START=0
  if [ "$(head -n 1 "$RES" | cut -f2,3)" = "$(printf 'deploy-list time budget\tOK')" ] && [ "$(wc -l < "$RES")" = 2 ]; then echo "  ok   a session run starts with the budget row (deploy-list time budget OK, then the gate)"
  else echo "  FAIL the budget row: $(cut -f2,3 "$RES" | tr '\n\t' '; ')"; bad=1; fi
  G_SES=(T); G_KIND=(node); G_NAME=("ws-options-pin --check"); G_CMD=("true"); G_KEY=("")
  BUDGET_AT_START=1 TIMINGS_READ="$tmp/pin.jsonl"; : > "$RES"; run_session T 2>/dev/null; BUDGET_AT_START=0
  if [ "$(head -n 1 "$RES" | cut -f3)" = FAIL ] && [ "$(verdict "$RES" | tail -n 1 | cut -c1-21)" = 'ws-deploy-gates: FAIL' ]; then echo "  ok   a session over its budget FAILs the deploy (the budget row is FAIL; it is not re-run as a flake)"
  else echo "  FAIL over-budget session row: $(cut -f2,3 "$RES" | tr '\n\t' '; ')"; bad=1; fi
  G_SES=(); G_KIND=(); G_NAME=(); G_CMD=(); G_KEY=()
  # a tree whose matrix has no --max-docs: the budget is measured with --list (32766 documents > 500)
  MQ_GATES_LOGDIR=$tmp/lg MQ_NOW=2026-10-23T12:00:00Z MQ_MATRIX_DIR=$nx/stale-complete MQ_COVERAGE_ARGS="--all" MQ_NIGHTLY_DIRTY_CHECK=0 \
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

# ---------------------------------------------------------------------------------------------- the time budget (A8)
# Critic r4 (A8): the gate list is held to its time budget BEFORE anyone runs it. For every session it sums each gate's
# LAST MEASURED seconds from the timings file (design/audit/baselines/deploy-gate-timings.jsonl, or --timings <file>:
# one JSON line per session run, {date, session, gates: [{gate, result, seconds, slotWait}]}), schedules them, and
# FAILS when a session's predicted wall clock is over MQ_SESSION_BUDGET_MIN (default 30) minutes.
#   - a gate's time is its newest measure by `date` (results SKIPPED / NOT YET / ACCEPTED and 0 s are not measures),
#     minus its slot wait (the wait is other sessions' work, not the gate's); names match after dropping a trailing
#     "(...)" and a trailing " --baseline" (the same documents are checked; only the verdict differs);
#   - browser and fn gates are scheduled onto the MQ_BROWSER_WORKERS (2) browser slots IN LIST ORDER, each to the first
#     free slot (what run_session's workers do), node / nfn gates onto the MQ_NODE_WORKERS (2) node workers, each gate
#     plus the worker's 3 s pause; the session's prediction is the longer of the two (the longest-first order is printed
#     beside it: when it is shorter, reordering the list helps);
#   - a gate that drives the slots itself is divisible work spread over the slots after the fixed gates (water-filling):
#     the coverage matrix = MQ_MATRIX_BUDGET documents x MQ_MATRIX_DOC_SLOT_S (default 5.26 slot-s a document, the
#     measured 0.38 documents/s on two slots), whatever its last run took; ws-options-pin --check / --write = its
#     measured seconds x its `slots` (default 2);
#   - a gate with no measure is UNTIMED: counted as 0 s and listed as a WARNING (time it once, then the list is judged);
#     SKIPPED and NOT YET gates do not run and count 0 s.
# Prints one block per session; the last line is `ws-deploy-gates --budget: OK`, `WARNING` (UNTIMED gates; exit 0)
# or `FAIL` (exit 1). `--list` prints the same check under the list and exits with it; every session run starts with it
# (a result row "deploy-list time budget", so an over-budget list FAILs the deploy before an hour is spent finding out).
budget_check() {   # budget_check <timings file> <sessions, space-separated, or "all">
  local tf=$1 ses=$2 gl rc
  gl=$(mktemp)
  for i in "${!G_SES[@]}"; do printf '%s\t%s\t%s\n' "${G_SES[$i]}" "${G_KIND[$i]}" "${G_NAME[$i]}" >> "$gl"; done
  node - "$tf" "$gl" "$ses" "${MQ_SESSION_BUDGET_MIN:-30}" "$BROWSER_WORKERS" "$NODE_WORKERS" "$MATRIX_BUDGET" "${MQ_MATRIX_DOC_SLOT_S:-5.26}" <<'EOF'
const fs = require('fs');
const [tf, gl, sesArg, budgetMin, bw, nw, matrixDocs, docSlotS] = process.argv.slice(2);
const PAUSE = 3;   // run_session's worker sleeps 3 s after each gate
const norm = (n) => String(n).replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+--baseline$/, '').trim();
// the newest measure of every gate
const meas = new Map();
let lines = [];
try { lines = fs.readFileSync(tf, 'utf8').split('\n').filter(Boolean); } catch (e) { console.log(`budget: no timings file ${tf} (${e.code || e.message}): every gate is UNTIMED`); }
const runs = [];
lines.forEach((l, k) => { try { const j = JSON.parse(l); runs.push({ j, t: Date.parse(j.date), k }); } catch (e) { console.log(`budget: ${tf} line ${k + 1} is not JSON (ignored)`); } });
runs.sort((a, b) => ((Number.isFinite(a.t) ? a.t : 0) - (Number.isFinite(b.t) ? b.t : 0)) || a.k - b.k);
for (const { j } of runs) for (const g of j.gates || []) {
  if (!g || !g.gate || ['SKIPPED', 'NOT YET', 'ACCEPTED'].includes(g.result) || !(Number(g.seconds) > 0)) continue;
  meas.set(norm(g.gate), { s: Math.max(0, Number(g.seconds) - (Number(g.slotWait) || 0)), slots: Number(g.slots) || null, from: `${String(j.date).slice(0, 16)} ${String(j.commit || '?').slice(0, 14)}` });
}
const gates = fs.readFileSync(gl, 'utf8').split('\n').filter(Boolean).map((l) => { const [s, kind, name] = l.split('\t'); return { s, kind, name }; });
const want = sesArg === 'all' ? [...new Set(gates.map((g) => g.s))] : sesArg.split(/[ ,]+/).filter(Boolean);
// list scheduling: each job to the slot that frees first; in list order (the runner), or longest first (for comparison)
const sched = (jobs, k, longestFirst) => { const load = Array(k).fill(0); for (const x of longestFirst ? [...jobs].sort((a, b) => b - a) : jobs) { let m = 0; for (let i = 1; i < k; i++) if (load[i] < load[m]) m = i; load[m] += x; } return load; };
const fill = (load, d) => {   // water-filling: divisible work d over the slots; returns the makespan
  const max = Math.max(0, ...load);
  const sorted = [...load].sort((a, b) => a - b);
  let rest = d;
  for (let i = 0; i < sorted.length; i++) {
    const next = i + 1 < sorted.length ? sorted[i + 1] : Infinity, w = i + 1, need = (next - sorted[i]) * w;
    if (rest <= need || next === Infinity) return Math.max(max, sorted[i] + rest / w);
    rest -= need;
    for (let q = 0; q <= i; q++) sorted[q] = next;
  }
  return max;
};
const fmt = (s) => `${(s / 60).toFixed(1)} min`;
let fail = 0, untimedAll = 0;
for (const s of want) {
  const mine = gates.filter((g) => g.s === s);
  const rigidB = [], rigidN = [], rows = [], untimed = [];
  let div = 0;
  for (const g of mine) {
    const key = norm(g.name), m = meas.get(key);
    if (g.kind === 'skip' || g.kind === 'notyet') { rows.push([g.name, g.kind, '0', g.kind === 'skip' ? 'SKIPPED: does not run' : 'NOT YET: does not run']); continue; }
    if (/^ws-coverage-matrix\b/.test(key)) {
      const w = Number(matrixDocs) * Number(docSlotS);
      div += w; rows.push([g.name, `${g.kind}, slots`, w.toFixed(0), `budget model: ${matrixDocs} documents x ${docSlotS} slot-s, spread over the ${bw} slots`]); continue;
    }
    if (!m) { untimed.push(g.name); rows.push([g.name, g.kind, '?', 'UNTIMED: no measure in the timings file (counted 0 s)']); continue; }
    if (/^ws-options-pin --(check|write)\b/.test(key)) {
      const w = m.s * (m.slots || 2);
      div += w; rows.push([g.name, `${g.kind}, slots`, w.toFixed(0), `${m.s.toFixed(1)} s x ${m.slots || 2} slots it drives itself (${m.from}), spread over the ${bw} slots`]); continue;
    }
    ((g.kind === 'browser' || g.kind === 'fn') ? rigidB : rigidN).push(m.s + PAUSE);
    rows.push([g.name, g.kind, m.s.toFixed(1), m.from]);
  }
  const loadB = sched(rigidB, Number(bw), false), loadN = sched(rigidN, Number(nw), false);
  const spanB = fill(loadB, div), spanN = Math.max(0, ...loadN), spanLpt = fill(sched(rigidB, Number(bw), true), div);
  const pred = Math.max(spanB, spanN);
  const over = pred > Number(budgetMin) * 60;
  const workB = rigidB.reduce((a, x) => a + x, 0) + div;
  console.log(`budget: session ${s}: predicted ${fmt(pred)} (${pred.toFixed(0)} s) - browser ${bw} slots ${fmt(spanB)} (${workB.toFixed(0)} slot-s of work incl. ${PAUSE} s pauses; floor ${fmt(workB / Number(bw))}; longest-first order ${fmt(spanLpt)}), node ${nw} workers ${fmt(spanN)}; budget ${budgetMin} min: ${over ? 'OVER' : 'within'}${untimed.length ? `; ${untimed.length} UNTIMED` : ''}`);
  for (const r of rows.sort((a, b) => (Number(b[2]) || 0) - (Number(a[2]) || 0))) console.log(`  ${r[0].padEnd(52)} ${r[1].padEnd(13)} ${String(r[2]).padStart(7)} s  ${r[3]}`);
  if (over) {
    fail++;
    const big = rows.filter((r) => Number(r[2]) > 0).sort((a, b) => Number(b[2]) - Number(a[2])).slice(0, 3).map((r) => `${r[0]} ${Number(r[2]).toFixed(0)} s`).join(', ');
    console.log(`budget: FAIL - session ${s} is predicted at ${fmt(pred)}, over the ${budgetMin}-min budget (the longest: ${big}); move a gate to another session (MQ_VIEWPORT_SESSION is one), shard it, or take a whole-run tool off the deploy list`);
  }
  for (const u of untimed) console.log(`budget: WARNING - UNTIMED ${u} (session ${s}): no measured time in ${tf}; it counts 0 s until a session run times it`);
  untimedAll += untimed.length;
}
const v = fail ? 'FAIL' : untimedAll ? 'WARNING' : 'OK';
console.log(`ws-deploy-gates --budget: ${v}${fail ? ` (${fail} session(s) over ${budgetMin} min)` : ''}${untimedAll ? ` (${untimedAll} UNTIMED gate(s))` : ''}`);
process.exit(fail ? 1 : untimedAll ? 4 : 0);
EOF
  rc=$?; rm -f "$gl"; return $rc
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
  node_gate 1 ws-lessonfit ws-lessonfit.mjs   # WRM site lessons, every year (critic 2026-10-30 Y4 F1)
  # the options-verify pin (critic r4 D1): the deploy READS the nightly's options-pin results (read-only, node only, no
  # browser slot, seconds); it never runs the pin itself (the whole pin is ≈ 1 h 52 min on the two slots). On a node
  # worker as nfn, so its exit 4 shows as WARNING.
  if [ -f tests/scripts/ws-options-pin.cjs ]; then add 1 nfn "ws-options-pin --gate (read-only: nightly results)" "node tests/scripts/ws-options-pin.cjs --gate $MATRIX_DIR"
  else add 1 skip "ws-options-pin --gate" "tests/scripts/ws-options-pin.cjs"; fi
  # session 2: the long screen sweeps, sharded, then the viewport and S9 checks and the two sweep modes on the sample
  local i
  for i in $(seq 1 "$SLOTS_SHARDS"); do browser_gate 2 "ws-screen-slots --shard $i/$SLOTS_SHARDS" ws-screen-slots.cjs --shard "$i/$SLOTS_SHARDS" --baseline "$SLOTS_BASE"; done
  for i in $(seq 1 "$FIT_SHARDS"); do browser_gate 2 "ws-chromebook-fit --shard $i/$FIT_SHARDS" ws-chromebook-fit.cjs --shard "$i/$FIT_SHARDS" --baseline "$SAMPLE"; done
  # ws-viewport-check (≈ 690 s) runs in session 3 (MQ_VIEWPORT_SESSION, default 3): with it, session 2's browser work was
  # 4,027 s = 33.6 min on its two slots in all three timed runs (2026-10-23); without it ≈ 27.8 min. Session 3's matrix
  # renders ≤ MQ_MATRIX_BUDGET documents (≈ 22 min at the measured 0.38 documents/s on two slots), so the two together
  # stay ≈ 28 min.
  browser_gate "${MQ_VIEWPORT_SESSION:-3}" "ws-viewport-check --baseline" ws-viewport-check.cjs --baseline "$VIEWPORT_BASE"
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
    fn|nfn) ( [ -n "$tag" ] && export MQ_GATE_RETRY=1; eval "$cmd" ) > "$log" 2>&1; rc=$? ;;
  esac
  t1=$(now_ms)
  # exit 3 from the matrix gate: over the budget, fresh green nightly, not yet run on this tip
  # exit 2 from the matrix: rows selected, none checkable (every one PENDING / N/A): the gate did not run
  # exit 4 from the matrix gate: passed with a WARNING to read (owner 2026-10-23: an old nightly before the first full
  # baseline, or over the budget before it)
  if [ "$kind" = nfn ] && [ "$rc" = 3 ]; then res=NEEDS-SHARDED-RUN
  elif [ "$kind" = nfn ] && [ "$rc" = 4 ]; then res=WARNING
  elif [ "$kind" = nfn ] && [ "$rc" = 2 ]; then res="NOTHING RUN"
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
  # A8: every session run starts with its time budget (a row of its own: FAIL over budget, WARNING for UNTIMED gates)
  if [ "${BUDGET_AT_START:-0}" = 1 ]; then
    local blog="$LOGDIR/s$s-deploy-list-time-budget.log" brc bres bt0
    bt0=$(now_ms)
    budget_check "${TIMINGS_READ:-$TIMINGS}" "$s" > "$blog" 2>&1; brc=$?
    case $brc in 0) bres=OK ;; 4) bres=WARNING ;; *) bres=FAIL ;; esac
    printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$s" "deploy-list time budget" "$bres" "$(awk -v a="$bt0" -v b="$(now_ms)" 'BEGIN{printf "%.1f", (b-a)/1000}')" 0 "$blog" budget >> "$RES"
    echo "  [s$s] $bres  deploy-list time budget ($(grep -E '^budget: session' "$blog" | head -n 1 | sed 's/^budget: //'))" >&2
  fi
  for w in $(seq 1 "$BROWSER_WORKERS"); do worker "$qb" & pids+=($!); done
  for w in $(seq 1 "$NODE_WORKERS"); do worker "$qn" & pids+=($!); done
  for w in "${pids[@]}"; do wait "$w"; done
  # flakes: every FAIL once more, alone
  local line ses name res secs wt log idx item rres
  while IFS=$'\t' read -r ses name res secs wt log idx; do
    [ "$ses" = "$s" ] && [ "$res" = FAIL ] || continue
    [ "$idx" = budget ] && continue   # the time budget is arithmetic on the list: re-running it cannot pass
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
  local res=$1 bad inc acc fl wn
  bad=$(awk -F'\t' '$3=="FAIL"||$3=="BLOCKED"' "$res" | wc -l)
  inc=$(awk -F'\t' '$3=="SKIPPED"||$3=="NOT YET"||$3=="NEEDS-SHARDED-RUN"||$3=="NOTHING RUN"' "$res" | wc -l)
  acc=$(awk -F'\t' '$3=="ACCEPTED" {printf "%s%s", (n++ ? "; " : ""), $2}' "$res")
  fl=$(awk -F'\t' '$3=="FLAKE"' "$res" | wc -l)
  wn=$(awk -F'\t' '$3=="WARNING"' "$res" | wc -l)
  awk -F'\t' '$3=="WARNING" {print "  WARNING (passed; read it): " $2 " (log " $6 ")"}' "$res"
  awk -F'\t' '$3=="FAIL"||$3=="BLOCKED" {print "  " $3 ": " $2 " (log " $6 ")"}' "$res"
  awk -F'\t' '$3=="SKIPPED" {print "  DID NOT RUN, SKIPPED: " $2 " (its tool is not in this tree; a gate is never skipped: restore it or take it off the list with a STATUS note)"}
              $3=="NOT YET" {print "  DID NOT RUN, NOT YET: " $2 " (needs a later M-step; the lead may accept it by name, see the header)"}
              $3=="NOTHING RUN" {print "  DID NOT RUN, NOTHING RUN: " $2 " (every affected row is PENDING or N/A; see its log " $6 ")"}
              $3=="NEEDS-SHARDED-RUN" {print "  DID NOT RUN, NEEDS-SHARDED-RUN: " $2 " (fire the sharded matrix run printed in " $6 ", then re-run session 3)"}' "$res"
  [ -n "$acc" ] && echo "  ACCEPTED NOT YET (logged in $TIMINGS): $acc"
  local extra=""
  [ "$fl" -gt 0 ] && extra="$fl FLAKE logged"
  [ "$wn" -gt 0 ] && extra="${extra:+$extra; }$wn WARNING"
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
    --budget) MODE=budget ;;
    --timings) TIMINGS_READ=$2; shift ;;
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
  echo
  budget_check "${TIMINGS_READ:-$TIMINGS}" "${SESSIONS[*]:-all}"; rc=$?
  [ $rc = 1 ] && exit 1; exit 0
fi
if [ "$MODE" = budget ]; then
  budget_check "${TIMINGS_READ:-$TIMINGS}" "${SESSIONS[*]:-all}"; rc=$?
  [ $rc = 1 ] && exit 1; exit 0
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
BUDGET_AT_START=1
for s in "${SESSIONS[@]}"; do run_session "$s"; done
print_table
echo
verdict "$RES"; exit $?
