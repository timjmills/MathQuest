// ws-coverage-matrix (E1): every skill on every kind of worksheet, every content-bearing option,
// at S / M / L with its keys - IMPROVEMENT_PLAN §1.6.2 "The coverage matrix", §1.6.7 E1, §4.1 row 1.
//
// A ROW is one skill, one kind of worksheet and one setting of the content-bearing options. Each row
// is one `ws-print-lint --source kit` document per size (pupil pages + key in one document), so a row
// is 3 documents. The two kinds that need several skills deal the skill with fixed partners (one 1 x 1,
// one 2 x 1, one 2 x 2 skill: tests/fixtures/precritic/role-sample.json `partners`, or while that has
// none, tests/fixtures/precritic/matrix-partners.json).
//
//   node tests/scripts/ws-coverage-matrix.cjs --skills addition:add_missing_digit --list
//   node tests/scripts/ws-coverage-matrix.cjs --skills cat:skill,cat:skill            # the builder's own check
//   node tests/scripts/ws-coverage-matrix.cjs --skills cat:skill --baseline design/audit/matrix/baseline.json
//   node tests/scripts/ws-coverage-matrix.cjs --skills cat:skill --write-baseline     # pin today's findings
//   node tests/scripts/ws-coverage-matrix.cjs --all --affected <commitA>..<commitB> --list
//   node tests/scripts/ws-coverage-matrix.cjs --all --slice 5/28 --write-baseline --out auto  # the first baseline, night 5 of 28
//   node tests/scripts/ws-coverage-matrix.cjs --all --affected A..B --slice 5/28 --red-from design/audit/matrix --pin-new --out auto
//                                                                                     # a later night (ws-matrix-nightly.sh)
//   node tests/scripts/ws-coverage-matrix.cjs --all --affected A..B --max-docs 500 --baseline design/audit/matrix/baseline.json --slots 2
//                                                                                     # the deploy (S5 session 3)
//   node tests/scripts/ws-coverage-matrix.cjs --repin 'cat:skill|single/defaults' --reason "the fix changed the page on purpose"
//                                                                                     # the lead's explicit re-pin (I1)
//   node tests/scripts/ws-coverage-matrix.cjs --retire 'cat:skill|single/more-old' --reason "option nline removed"
//                                                                                     # a red row that no longer exists (N1)
//   node tests/scripts/ws-coverage-matrix.cjs --self-test                             # node only, no browser
//
// SELECTING ROWS
//   --skills cat:skill,...   these skills' rows        --all   every live skill's rows (data.js SKILLS)
//   --kind single|sections|mixed|quiz                  --rows single/defaults,sections/pages-2,... (row names or full ids)
//   --shard i/n              shard i of n: the rows whose id hashes (salted FNV-1a) to i-1 mod n, so a row's shard never
//                            depends on what else is selected
//   --slice i/n              slice i of n (owner 2026-10-23: n = 28, one slice a night): rows whose id hashes (FNV-1a)
//                            to i-1 mod n. Stable as skills are appended (a hash of the id, not a position). Added to
//                            --affected's rows and the --red-from rows
//   --seventh d              KEPT AS AN ALIAS of --slice <d+1>/7 (the same hash, so the same rows as before)
//   --red-from dir           (critic r2 D1.2) add every row RED / ERROR in the FOLDED state of dir's run files: a row's
//                            state is its status in the most recent run that ran it, so a red row is re-run every
//                            night until a run lists it OK (I5). --slice / --seventh imply --red-from design/audit/matrix
//                            (--no-red-from turns that off). A re-selected red row ignores the cache and is never
//                            pinned (I2). N5: the fold reads EVERY .json in dir that carries commit + finished + rows,
//                            whatever its name, and lists each .json it skipped and why. Critic r4 D2: EVERY run file
//                            is ordered by `finished` (a nightly-named file without one by its name's time), ties by
//                            name, never by the name alone. N1: a red id that is no longer a row of its live skill is
//                            MAPPED to the current row of the same kind and flags (re-run under the new id, judged
//                            against the old id's entry), else reported RETIRED-ROW (a warning; clear it with --retire).
//                            Critic r4 N6: with --kind / --rows / --shard, only the red rows they keep are run; the log
//                            and `selection.redFrom.reselected` name exactly those, and the log names the others
//                            (NOT run, they stay red)
//   --affected-cap N         (the nightly) when --affected's rows are over N documents, drop them tonight (the slice
//                            and the red rows still run); the run file records `affected.droppedOverCap`
//   --affected A..B          the rows a commit range reaches (below); with --list, prints the reach and stops
//   --list                   print the rows (RUN / PENDING(step) / N/A) without running anything; ends with
//                            `ws-coverage-matrix: LIST (...)`, never with a verdict
//   A --kind or --rows value that names no row, a --skills key that is not a live skill, a malformed --shard /
//   --seventh, or a selection of 0 rows (without --affected / --seventh, whose reach may be empty) is a FAIL that
//   names it. LIVE = a SKILLS entry with a value and no `retired: true` (data.js keeps retired entries in place
//   for the share codes): 715 on 2026-10-23, the same definition as ws-node-lint.
// RUNNING
//   --slots N                print-lint processes at once (default 1), each through /tmp/mq-browser-run.sh
//   --batch N                documents per print-lint process (default 9 = 3 rows x S/M/L): one browser start
//                            serves the whole batch (`ws-print-lint --jobs`). Critic r4 N1: the documents of a batch
//                            that crashed (no result: print-lint or the runner died; a buildSheet throw is a result)
//                            are run ONCE more before any row is judged, so one transient crash makes no row ERROR
//   --baseline f.json        RED = any (row, size, lint rule) count above the per-row baseline, or a render error
//                            (shards' baseline.shard-*.json files beside it are merged in); without it any
//                            finding is red
//   --write-baseline         pin the rows that printed and have NO entry in the merged baseline (I1, below) into
//                            --baseline (default design/audit/matrix/baseline.json), or with --slice into
//                            baseline.slice-i-of-n.json (written even when it pins nothing: the slice night is done;
//                            critic r4 N4: a --slice run narrowed by --skills / --kind / --rows / --shard writes
//                            baseline.slice-i-of-n.partial.json instead, merged by readers but never counted as the
//                            slice done), with --shard into baseline.shard-i-of-n.json. Critic r4 N5: the pins are
//                            written AFTER the run file, each file atomically (temp + rename), so a crash never leaves a
//                            slice file without the run that judged its rows. Every reader merges baseline.json with every
//                            baseline.<part>.json beside it. Each pinned size holds the counts per lint rule AND (N1)
//                            the finding keys `<lint> <rule>|p<page>|<print-lint key, digits as #>`: a new finding that
//                            replaces a fixed one of the same rule is a rise. Entries pinned before N1 (counts only: the
//                            127 pilot rows of 2026-10-23) are compared by counts until they are re-pinned with --repin
//   --pin-new                the same pin-new-only rule, into baseline.added[.shard-i-of-n].json (the steady nights)
//   --repin <ids> --reason "<why>"   the ONLY way to change an existing entry (I1): re-runs exactly those rows (full ids,
//                            comma-separated; they are the --rows selection, their skills the --skills) and rewrites
//                            each entry IN THE FILE THAT OWNS IT, appending {date, commit, reason, before, status,
//                            rises} to the entry's `repinned` log. A row that did not print is refused (FAIL). Never with
//                            --slice / --seventh / --shard / --affected / --red-from / --write-baseline / --pin-new /
//                            --max-docs: it is a lead's named action, never part of a nightly or a deploy. Writes a run
//                            file (--out, default auto) whose rows keep the status judged BEFORE the re-pin (I3) and
//                            carry `repinned` (with `key`, the entry it wrote); the fold reads that as REPINNED (not red)
//                            while that entry is the row's current one (N2). Critic r4 N2: refused when --baseline is not
//                            in the --out directory (a re-pin of another directory's entry would clear a red row here
//                            whose entry never changed). Commit the baseline file and the run file with a STATUS note
//   --retire <ids> --reason "<why>"   N1: a red row id that is no longer a row (an option renamed or removed) and maps to
//                            no current row: writes a run file (--out, default auto) listing it RETIRED, which clears it
//                            from the fold. Refused for an id that is a row today or maps to one (same kind and flags),
//                            except (critic r4 N9) a row that is red and was last seen N/A or PENDING(step): nothing
//                            else clears it. Refused on a dirty tree (N3)
// BASELINE INVARIANTS (critic r3 D1; each has self-test cases (#15) AND is a property checked after every night of
// 300 generated sequences of runs, pins, regressions, swaps, crashes and re-pins on synthetic rows (#16); the backtest
// row baseline-night-keeps-red runs the critic's two reproduce cases on the real tool):
//   I1  A pin is written only for a row with NO entry in the MERGED baseline (--write-baseline and --pin-new are both
//       pin-new-only; they differ only in the file written). Re-pinning an existing row is --repin <ids> --reason,
//       logged in the entry with the date and the reason; no nightly passes it (ws-matrix-nightly.sh cannot).
//   I2  A row selected by --red-from is never pinned (not even when it has no entry).
//   I3  The run file records the verdict judged BEFORE any pin: every row is judged against the merged baseline as it
//       was loaded, then the pins are written (judgeAndPin), and no row is judged again. A newly pinned row keeps
//       PENDING(no-baseline) (or OK) with `pinned: true`; a re-pinned one keeps its RED with `repinned`.
//   I4  The merged baseline refuses (FAIL, naming both files) a row pinned in two files with different contents; an
//       identical duplicate is a WARNING. Never resolved by file-name order. A re-pin writes the owner file only.
//   I5  Nothing a nightly does turns a RED / ERROR row non-red: in the fold (foldRuns, ordered by `finished`, D2) a
//       red row leaves the red set only through a later run that lists it OK (judged against its existing entry), a
//       --repin (REPINNED), or a --retire (RETIRED). Printed with no entry (PENDING(no-baseline)) does NOT clear it;
//       --repin does. Critic r4: PENDING(step) / N/A do NOT clear it either (N9: "not re-run (now N/A)", until a real
//       OK or --retire); a run with `dirty: true` never clears (N3); an OK / REPINNED clears only when it was judged
//       against the folded directory's own baseline and the row's current entry there (N2: the run file's `baseline`
//       record and the row's `baselineKey`; a stale key clears only when the row's recorded findings, re-judged against
//       the current entry, do not rise). An OK that may not clear is listed (a WARNING at deploy). A row with a
//       baseline entry whose newest state is N/A is flagged (N9). Run files written before N2 (no `baseline` field)
//       clear as before and are listed.
//   NO BASELINE ENTRY (owner 2026-10-23): with --baseline, a printed row with findings and no entry of its own is
//   PENDING(no-baseline), never RED (nothing to rise above yet); it counts as printed for the verdict. A render
//   error is ERROR all the same. Without --baseline (a builder's check) every finding is red.
//   THE FIRST FULL BASELINE: complete when baseline.json says `complete: true` or every baseline.slice-i-of-n.json
//   (i = 1..n) is present (`baselineComplete`, read by ws-deploy-gates.sh)
//   --cache f.json           skip a row already OK for the same dependency hash AND the same baseline entry
//                            (the row's pinned counts under --baseline, or "none": a row cached OK under one
//                            baseline is re-run under another); record OK rows after the run
//   --max-docs N             the deploy's budget (§1.6.2: 500): count the documents the selected, non-cached
//                            rows would print (3 a row); above N run nothing, print
//                            `ws-coverage-matrix: OVER-BUDGET <n> documents (budget N)` and exit 3 (whatever
//                            --report-only says). The caller (ws-deploy-gates.sh) then reads the newest nightly. N4: it
//                            says how many of those rows have a baseline entry (NOT checked by this run) and how many
//                            have none, and with --out writes the two lists to <out>.over-budget.json
//   --out f.json|auto        write the run (auto = design/audit/matrix/<UTC date>.json, or <date>T<HHMM>.json when
//                            that exists: a run file is never overwritten)
//   --report-only            exit 0 even with red rows (never prints OK when a row is red)
//
// VERDICTS AND EXIT CODES (last line)
//   OK (...)                      exit 0: every checked row OK or CACHED (rows PENDING / N/A beside them are listed)
//   FAIL - ...                    exit 1: a RED or ERROR row, or a bad argument / selection (always named)
//   INCOMPLETE (all n rows ...)   exit 2: rows were selected but none could be checked (every one PENDING or N/A)
//   OVER-BUDGET <n> documents     exit 3: --max-docs exceeded, nothing run
//   LIST (...)                    exit 0: --list, nothing run
//   A row is RED when a lint count is above its per-row baseline; it is ERROR when it could not print: a size
//   whose document did not render (`L-SPLIT RENDER`: a buildSheet throw, a crashed batch) or a row whose flags
//   print-lint refuses. ERROR ignores the baseline, and --write-baseline never pins it (D4: a row that cannot
//   print stays red until it prints); a size that needs a later step makes the row PENDING, never pinned.
//
// THE RUN FILE (--out; the nightly's design/audit/matrix/<YYYY-MM-DD>[.shard-i-of-n].json, read by the deploy):
//   { tool, date, started, finished (ISO times), commit (full sha), dirty (bool), partners, printInputsHash,
//     baseline (N2): {file, dir (relative to the repo root), files, entries, hash} of the merged baseline the rows were
//       judged against, or null (no --baseline: any finding was red),
//     selection {skills, affected {from, to, files}, seventh, shard, kinds, rows, redFrom {dir, reselected}}, replay, timing {...},
//     totals {OK, CACHED, RED, PENDING, N/A, ERROR}, red: [ids of RED and ERROR rows, re-pinned ones out], liveSkills,
//     baselineWrite? {mode, target, pinned: [ids], kept, redNotPinned: [ids], reason?}, repinned?: [ids],
//     mapped?: [{from, to}],
//     rows: [{ id, skill, kind, row, skills, args, pairs, depHash, status, cached?, step?, reason?, rises?,
//              errors?, pinned?, repinned? {date, reason, file, key}, baselineKey (N2: the key of the entry it was
//              judged against), judgedAgainst? (a renamed row: the old id whose entry judged it),
//              sizes {S, M, L: {pages, keyPages, counts, error} | {pending, reason} | {na}} }] }
//   A row's `status` is one of OK / RED / PENDING / N/A / ERROR (a cached row is OK with `cached: <date>`), judged
//   before any pin of the run (I3). A --retire run file lists rows with status RETIRED.
//   --verbose                every row and every finding group
//
// THE ROWS (§1.6.2 table; flag mapping §1.6.2 bullets; what each flag needs from buildSheet is decided by
// `ws-print-lint --check-jobs`, so this tool and print-lint never disagree on what can print today)
//   Single skill   defaults · ex-top (--anchors top, M4) · ex-group (--anchors sections) · ex-each (--anchors side) ·
//                  fade-problems (--fade problems: no engine field yet) · fade-page (--fade page = --supports all
//                  --cover fade) · fade-packet (--fade packet --pages 3) · layout-fact-rows / layout-timed /
//                  layout-todays-number (--roles fact-rows | fact-probe | todays-number; a skill without that
//                  layout is N/A at run time) · pages-3 · more-* (an all-pairs set of the More options with the
//                  defaults row: --columns 2, number line at the top --opts {"nlOn":true} when the skill offers
//                  it, --key-style short, --key-place after-page: one row a factor, each with every OTHER factor
//                  on, so with the defaults row every pair of values is covered) · more-prereq (Mix in
//                  prerequisite skills: no buildSheet field) - 15 or 16 listed, 12-14 printable today
//   Sections       defaults · ex-top / ex-first (M4) · ex-group · ex-each · fade-problems · bring-back · pages-2 ·
//                  grouped / parts (--sections grouped|parts, M4) - 10
//   Mixed practice defaults · ex-first / ex-top (M4) · bring-back · pages-3 (rotation across pages, M2) - 5
//   Quiz layer     quiz-single / quiz-sections / quiz-mixed: PENDING(T3) - 3
//   Fade rows are N/A for a skill that offers no supports (no `support` option with supportsModel).
//
// DEPENDENCY HASH (before M4). A row's hash = ws-print-lint.cjs + ws-harness.cjs (the checker) + the print-input files (the whole-file import closure of
// print-sheet.js, print-generate.js and generate-question.js, every css/ file, index.html with its ?v= stamps
// removed) + the structural fingerprints of the row's (template, kind) pairs (ws-envelope --engine) + the
// row itself (skills, flags). Before M4 there is no replay, so the print inputs are hashed whole: a change to
// any of them changes every row's hash, as §1.6.2 says ("before M4 ... every row counts as changed").
//
// --affected A..B (before M4), by file, §1.6.2:
//   none     design/, tests/, *.md, .claude/, .github/, CNAME, data/ (source records: the app reads their
//            generated js), js/modules/search-terms.js, index.html when only its ?v= stamps change
//   pairs    an engine module (ws-envelope --voids A..B) that no generator imports: the rows of the voided pairs
//   all      print-generate.js, any css/ file (until M4 measures in the SHEET_STYLESHEETS frame), index.html beyond
//            its stamps, any other file the print inputs import (instance data: providers, generators, data.js ...)
//   screen   js outside every print input (screen hosts, teacher screens): 0 print rows; the screen checks run
//            in full at deploy (S5)
//   HOOK M4: "M4 replay: not built" is printed - once buildSheet has record / replay, --affected replays the tip
//            (`--digest`) and an instance-data file reaches only the rows whose PagePlan digests change.
//   HOOK ws-packer-proof (E1, node): the mixed packer's proof is its own tool; Mixed practice rows here print
//            today's grouped packing only.
//
// Prints `ws-coverage-matrix: OK` / `FAIL` last; exits non-zero on FAIL (red or errored rows) unless --report-only.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawn } = require('child_process');
const { pathToFileURL } = require('url');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const TOOL = 'ws-coverage-matrix';
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(__dirname, '..', '..');
const PRINT_LINT = path.join(__dirname, 'ws-print-lint.cjs');
const ENVELOPE = path.join(__dirname, 'ws-envelope.mjs');
const RUNNER = '/tmp/mq-browser-run.sh';
const SIZES = ['S', 'M', 'L'];
const MATRIX_DIR = path.join(ROOT, 'design', 'audit', 'matrix');
const PARTNERS_FALLBACK = path.join(ROOT, 'tests', 'fixtures', 'precritic', 'matrix-partners.json');
const ROLE_SAMPLE = path.join(ROOT, 'tests', 'fixtures', 'precritic', 'role-sample.json');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const fnv = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }).toString();

/* ============================================================================ the app, in node */

async function loadApp() {
    globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
    if (!globalThis.window) globalThis.window = globalThis;
    const quiet = [console.log, console.warn, console.error];
    console.log = console.warn = console.error = () => {};
    process.removeAllListeners('warning');
    try {
        const url = (p) => pathToFileURL(path.join(ROOT, 'js', 'modules', p)).href;
        const [gq, data, so] = await Promise.all([import(url('generate-question.js')), import(url('data.js')), import(url('skill-options.js'))]);
        return { gq, data, so };
    } finally { [console.log, console.warn, console.error] = quiet; }
}

/**
 * Live skills: a SKILLS entry with a value and no `retired: true` (N11). data.js keeps retired entries IN
 * PLACE for the positional share codes (CLAUDE.md), so counting array entries gives 723 on 2026-10-23 and the
 * live count is 715 - the same definition as ws-node-lint. The id / label patterns are a belt for older trees.
 */
function liveSkills(app) {
    const out = [];
    for (const [cat, list] of Object.entries(app.data.SKILLS)) {
        if (!Array.isArray(list)) continue;
        for (const s of list) {
            if (!s || !s.v || s.retired || /^_?tomb|retired/i.test(s.v) || /\(retired\)/i.test(s.l || '')) continue;
            out.push({ key: `${cat}:${s.v}`, categoryId: cat, skillId: s.v, label: s.l || s.v });
        }
    }
    return out;
}

/** What the row table needs to know of a skill: its templates, supports, the number line option. */
function skillInfo(app, sk) {
    const quiet = [console.log, console.warn, console.error];
    console.log = console.warn = console.error = () => {};
    try {
        const templates = new Set();
        for (let i = 0; i < 6; i++) {
            let q = null;
            try { q = app.gq.generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, seed: 7000 + i * 13, itemIndex: i }); } catch (e) { q = null; }
            if (q) templates.add((q.cell && q.cell.template) || q.cellTemplate || 'legacy');
        }
        let offered = [], all = [];
        try { offered = app.so.offeredOptionsFor(sk.categoryId, sk.skillId) || []; } catch (e) { offered = []; }
        try { all = app.so.optionsFor(sk.categoryId, sk.skillId) || []; } catch (e) { all = []; }
        const sup = offered.find((d) => d.id === 'support' && d.supportsModel);
        return { ...sk, templates: [...templates].sort(), supports: !!(sup && (sup.render || []).length), nline: all.some((d) => d.id === 'nlOn') };
    } finally { [console.log, console.warn, console.error] = quiet; }
}

/* ============================================================================ partners */

function loadPartners() {
    try {
        const rs = JSON.parse(fs.readFileSync(ROLE_SAMPLE, 'utf8'));
        if (Array.isArray(rs.partners) && rs.partners.length) {
            const norm = rs.partners.map((p) => (typeof p === 'string' ? { skill: p } : p));
            return { source: path.relative(ROOT, ROLE_SAMPLE), partners: norm, spare: (rs.spare || []).map((p) => (typeof p === 'string' ? { skill: p } : p)) };
        }
    } catch (e) { /* absent: the fallback */ }
    const fb = JSON.parse(fs.readFileSync(PARTNERS_FALLBACK, 'utf8'));
    return { source: path.relative(ROOT, PARTNERS_FALLBACK), partners: fb.partners, spare: fb.spare || [] };
}
function partnersFor(key, P) {
    const used = new Set([key]);
    return P.partners.map((p) => {
        let pick = p.skill;
        if (used.has(pick)) {
            const alt = P.spare.find((s) => s.sizeClass === p.sizeClass && !used.has(s.skill)) || P.spare.find((s) => !used.has(s.skill));
            pick = alt ? alt.skill : null;
        }
        if (pick) used.add(pick);
        return pick;
    }).filter(Boolean);
}

/* ============================================================================ the rows */

/** The More options' all-pairs rows: one row per factor, every OTHER factor on (the defaults row is all off). */
function moreRows(factors) {
    return factors.map((f, i) => ({ name: 'more-' + factors.filter((_, j) => j !== i).map((x) => x.tag).join('+'), on: factors.filter((_, j) => j !== i) }));
}
const PENDING_STATIC = {
    prereq: { step: 'a req field', reason: 'Mix in prerequisite skills (§2.5 More options) has no buildSheet field; the Review role\'s earlierSkills is a role, not an option' },
    quiz: { step: 'T3', reason: 'the Quiz layer (scoring, versions 1-6) on the three kinds lands with T3 / T6; buildSheet has no quiz request yet' },
};

function rowsFor(info, partners) {
    const rows = [];
    const add = (kind, name, args, extra = {}) => {
        const skills = kind === 'single' ? [info.key] : [info.key, ...partners];
        rows.push({ id: `${info.key}|${kind}/${name}`, skill: info.key, kind, name, skills, args: kind === 'single' || kind === 'quiz' ? args : ['--kind', kind, ...args], templates: info.templates, ...extra });
    };
    const noSup = info.supports ? {} : { na: 'the skill offers no supports (no support option with supportsModel)' };
    // Single skill
    add('single', 'defaults', []);
    add('single', 'ex-top', ['--anchors', 'top']);
    add('single', 'ex-group', ['--anchors', 'sections']);
    add('single', 'ex-each', ['--anchors', 'side']);
    add('single', 'fade-problems', ['--fade', 'problems'], noSup);
    add('single', 'fade-page', ['--fade', 'page'], noSup);
    add('single', 'fade-packet', ['--fade', 'packet', '--pages', '3'], noSup);
    add('single', 'layout-fact-rows', ['--roles', 'fact-rows']);
    add('single', 'layout-timed', ['--roles', 'fact-probe']);
    add('single', 'layout-todays-number', ['--roles', 'todays-number']);
    add('single', 'pages-3', ['--pages', '3']);
    const factors = [{ tag: 'cols2', args: ['--columns', '2'] }];
    if (info.nline) factors.push({ tag: 'nline', opts: { nlOn: true } });
    factors.push({ tag: 'short', args: ['--key-style', 'short'] }, { tag: 'afterpage', args: ['--key-place', 'after-page'] });
    for (const r of moreRows(factors)) {
        const opts = Object.assign({}, ...r.on.map((f) => f.opts || {}));
        add('single', r.name, [...r.on.flatMap((f) => f.args || []), ...(Object.keys(opts).length ? ['--opts', JSON.stringify(opts)] : [])]);
    }
    add('single', 'more-prereq', [], { pending: PENDING_STATIC.prereq });
    // Sections
    add('sections', 'defaults', []);
    add('sections', 'ex-top', ['--anchors', 'top']);
    add('sections', 'ex-first', ['--anchors', 'first']);
    add('sections', 'ex-group', ['--anchors', 'sections']);
    add('sections', 'ex-each', ['--anchors', 'side']);
    add('sections', 'fade-problems', ['--fade', 'problems'], noSup);
    add('sections', 'bring-back', ['--bring-back']);
    add('sections', 'pages-2', ['--pages', '2']);
    add('sections', 'grouped', ['--sections', 'grouped']);
    add('sections', 'parts', ['--sections', 'parts']);
    // Mixed practice
    add('mixed', 'defaults', []);
    add('mixed', 'ex-first', ['--anchors', 'first']);
    add('mixed', 'ex-top', ['--anchors', 'top']);
    add('mixed', 'bring-back', ['--bring-back']);
    add('mixed', 'pages-3', ['--pages', '3']);
    // Quiz layer
    for (const k of ['single', 'sections', 'mixed']) add('quiz', `quiz-${k}`, [], { pending: PENDING_STATIC.quiz });
    return rows;
}

/** PENDING / N/A from the static table, then from ws-print-lint --check-jobs (one call for every row). */
function settleStatic(rows) {
    for (const r of rows) {
        if (r.na) r.status = 'N/A', r.reason = r.na;
        else if (r.pending) r.status = 'PENDING', r.step = r.pending.step, r.reason = r.pending.reason;
    }
    const ask = rows.filter((r) => !r.status);
    if (!ask.length) return;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-matrix-check-'));
    const f = path.join(tmp, 'jobs.json');
    fs.writeFileSync(f, JSON.stringify(ask.map((r) => ({ id: r.id, args: ['--skills', r.skills.join(','), ...r.args] }))));
    const out = JSON.parse(execFileSync('node', [PRINT_LINT, '--check-jobs', f], { env: { ...process.env, MQ_ROOT: ROOT }, maxBuffer: 1 << 28 }).toString());
    fs.rmSync(tmp, { recursive: true, force: true });
    const byId = new Map(out.map((o) => [o.id, o]));
    for (const r of ask) {
        const o = byId.get(r.id);
        if (o && o.pending) { r.status = 'PENDING'; r.step = o.pending; r.reason = o.reason; }
        else if (o && o.error) { r.status = 'ERROR'; r.reason = o.error; }
        else r.status = 'RUN';
    }
}

/* ============================================================================ print inputs and hashes */

const NONE_RULES = [
    [/^design\//, 'generated / planning documents'], [/^tests\//, 'tests'], [/\.md$/i, 'planning files'],
    [/^\.claude\//, 'agent settings'], [/^\.github\//, 'repository settings'], [/^CNAME$/, 'domain'],
    [/^data\//, 'source records (the app reads their generated js)'], [/^js\/modules\/search-terms\.js$/, 'search terms'],
    [/^math-quest-unified\.html$/, 'the monolithic backup'], [/^\.gitignore$|\/\.gitignore$/, 'git settings'],
];
const noneReason = (f) => { const r = NONE_RULES.find(([re]) => re.test(f)); return r ? r[1] : null; };
const ROOT_INPUTS = ['js/modules/print-sheet.js', 'js/modules/print-generate.js', 'js/modules/generate-question.js'];
const STAMP_RE = /([?&])v=[^"'&\s>)]*/g;

function fsTree() {
    return {
        id: 'fs',
        exists: (p) => { try { return fs.statSync(path.join(ROOT, p)).isFile(); } catch (e) { return false; } },
        read: (p) => fs.readFileSync(path.join(ROOT, p)),
        list: (dir) => { const out = []; const walk = (d) => { let ents = []; try { ents = fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }); } catch (e) { return; } for (const e of ents) { const p = path.posix.join(d, e.name); if (e.isDirectory()) walk(p); else out.push(p); } }; walk(dir); return out.sort(); },
    };
}
function gitTree(commit) {
    const shaC = git('rev-parse', '--verify', commit + '^{commit}').trim();
    const tree = new Map();
    for (const line of git('ls-tree', '-r', shaC, '--', 'js', 'css', 'index.html').split('\n')) {
        const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(line);
        if (m) tree.set(m[2], m[1]);
    }
    const blobs = new Map();
    const want = [...tree.entries()].filter(([p]) => /\.js$/.test(p));
    if (want.length) {
        const out = execFileSync('git', ['-C', ROOT, 'cat-file', '--batch'], { input: want.map(([, b]) => b).join('\n') + '\n', maxBuffer: 1 << 30 });
        let off = 0;
        for (const [p] of want) { const nl = out.indexOf(10, off); const size = Number(out.slice(off, nl).toString().split(' ')[2]); blobs.set(p, out.slice(nl + 1, nl + 1 + size)); off = nl + 1 + size + 1; }
    }
    return {
        id: 'git:' + shaC, sha: shaC,
        exists: (p) => tree.has(p),
        read: (p) => (blobs.has(p) ? blobs.get(p) : execFileSync('git', ['-C', ROOT, 'cat-file', 'blob', tree.get(p)], { maxBuffer: 1 << 30 })),
        list: (dir) => [...tree.keys()].filter((p) => p.startsWith(dir + '/')).sort(),
    };
}

/** Whole-file static + dynamic import closure (relative specifiers) from the given roots. */
function importClosure(tree, roots) {
    const seen = new Set();
    const stack = roots.filter((r) => tree.exists(r));
    const RE = /(?:\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?|\bexport\s*[\w*{}\s,$]*\s*from\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\1/g;
    while (stack.length) {
        const f = stack.pop();
        if (seen.has(f)) continue;
        seen.add(f);
        const src = tree.read(f).toString('utf8');
        for (const m of src.matchAll(RE)) {
            const dep = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[2]));
            if (!seen.has(dep) && tree.exists(dep)) stack.push(dep);
        }
    }
    return seen;
}

/** The print inputs of a tree: closure files (minus none-rules), css/, index.html (stamps removed). */
function printInputs(tree) {
    const closure = importClosure(tree, ROOT_INPUTS);
    const files = [...closure].filter((f) => !noneReason(f)).concat(tree.list('css')).sort();
    return { closure, generators: importClosure(tree, ['js/modules/generate-question.js']), files };
}
function printInputsHash(tree, inputs) {
    const h = crypto.createHash('sha256');
    for (const f of inputs.files) { const b = tree.read(f); h.update(f + '\0' + b.length + '\0'); h.update(b); }
    if (tree.exists('index.html')) h.update('index.html\0' + tree.read('index.html').toString('utf8').replace(STAMP_RE, '$1v='));
    return h.digest('hex');
}

function engineFingerprints() {
    const out = JSON.parse(execFileSync('node', [ENVELOPE, '--engine', '--json', '--root', ROOT], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString());
    return Object.fromEntries(Object.entries(out.pairs).map(([k, v]) => [k, v.fingerprint]));
}
function pairsOfRow(row, infoByKey) {
    if (row.kind === 'quiz') return [];
    const set = new Set();
    for (const k of row.skills) for (const t of (infoByKey.get(k) || {}).templates || []) set.add(`${t}--${row.kind}`);
    return [...set].sort();
}
function depHash(row, printHash, fps) {
    return sha(JSON.stringify({ printHash, skills: row.skills, args: row.args, pairs: row.pairs.map((p) => [p, fps[p] || 'unknown-pair']) }));
}

/* ============================================================================ --affected (before M4) */

function stampOnly(diffText) {
    const minus = [], plus = [];
    for (const l of diffText.split('\n')) {
        if (/^(---|\+\+\+) /.test(l)) continue;
        if (l.startsWith('-')) minus.push(l.slice(1).replace(STAMP_RE, '$1v='));
        else if (l.startsWith('+')) plus.push(l.slice(1).replace(STAMP_RE, '$1v='));
    }
    return minus.sort().join('\n') === plus.sort().join('\n');
}

/**
 * Classify one changed file. `ctx` = {indexStampOnly, engineFiles: Map(file -> [pairs]), closure, generators}.
 * Returns {file, class: none|pairs|all|screen, why, pairs?}.
 */
function classify(file, ctx) {
    const none = noneReason(file);
    if (none) return { file, class: 'none', why: none };
    if (file === 'index.html') return ctx.indexStampOnly ? { file, class: 'none', why: 'index.html: only the ?v= stamps changed' } : { file, class: 'all', why: 'index.html beyond its stamps (it loads the stylesheets cells are measured under, until M4)' };
    if (/^css\//.test(file)) return { file, class: 'all', why: 'css/: cells are measured under every app stylesheet until M4 measures in the SHEET_STYLESHEETS frame' };
    if (file === 'js/modules/print-generate.js') return { file, class: 'all', why: 'print-generate.js draws every legacy cell' };
    if (ctx.engineFiles.has(file) && !ctx.generators.has(file) && file !== 'js/modules/print-sheet.js') return { file, class: 'pairs', why: 'engine module of the voided pairs', pairs: ctx.engineFiles.get(file) };
    if (ctx.closure.has(file)) return { file, class: 'all', why: file === 'js/modules/print-sheet.js' ? 'print-sheet.js: the bridge, every pair' : 'instance input (M4 replay would narrow it to the rows whose pages change)' };
    if (/^js\//.test(file)) return { file, class: 'screen', why: 'outside every print input (screen hosts / teacher screens): screen checks at deploy' };
    return { file, class: 'all', why: 'not classified: counted as reaching every print row' };
}

function affected(range) {
    const m = /^(.+?)\.\.(.+)$/.exec(range);
    if (!m) throw new Error(`--affected <commitA>..<commitB> (got ${range})`);
    const [, A, B] = m;
    const files = git('diff', '--name-only', A, B).split('\n').filter(Boolean);
    const indexStampOnly = files.includes('index.html') ? stampOnly(git('diff', '-U0', A, B, '--', 'index.html')) : true;
    const voids = JSON.parse(execFileSync('node', [ENVELOPE, '--voids', `${A}..${B}`, '--json', '--root', ROOT], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString());
    const engineFiles = new Map();
    for (const v of voids.voided || []) for (const f of [...(v.changed || []), ...(v.added || []), ...(v.removed || [])]) {
        const full = 'js/modules/' + f;
        if (!engineFiles.has(full)) engineFiles.set(full, []);
        engineFiles.get(full).push(v.pair);
    }
    const ta = gitTree(A), tb = gitTree(B);
    const ia = printInputs(ta), ib = printInputs(tb);
    const ctx = { indexStampOnly, engineFiles, closure: new Set([...ia.closure, ...ib.closure]), generators: new Set([...ia.generators, ...ib.generators]) };
    return { A: ta.sha, B: tb.sha, files: files.map((f) => classify(f, ctx)), voided: (voids.voided || []).map((v) => v.pair) };
}

/* ============================================================================ baseline and verdicts */

/** Lint keys that mean the document did not print: never pinned, never forgiven by a baseline (D4). */
const RENDER_KEYS = new Set(['L-SPLIT RENDER']);
const renderError = (s) => !!(s && !s.na && !s.pending && (s.error || Object.keys(s.counts || {}).some((k) => RENDER_KEYS.has(k))));
const countsOf = (doc) => { const m = {}; for (const f of doc.findings || []) if (!f.waived) { const k = `${f.lint} ${f.rule}`; m[k] = (m[k] || 0) + 1; } return m; };
/**
 * N1 (critic r2): the finding-level key of one print-lint finding, `<lint> <rule>|p<page>|<key>` with every digit
 * run of print-lint's short key (`f.key`; its --json drops that field today, so in practice the MESSAGE) normalised
 * to `#`, cut to 120 characters. The message names what is wrong (the colour, the shape, the cell), so a new finding
 * that replaces a
 * fixed one of the same rule on the same row is a different key, so it is caught even when the count stays the
 * same (the D5 class of ws-node-lint, at the matrix's grain). Numbers are normalised so a measurement that moves
 * by a millimetre is not a new finding; the page is kept, so the same defect moving to another page is new.
 */
const findingKey = (f) => `${f.lint} ${f.rule}|p${f.page != null ? f.page : ''}|${String(f.key || f.msg || '').replace(/\d+(?:\.\d+)?/g, '#').slice(0, 120)}`;
const keysOf = (doc) => { const m = {}; for (const f of doc.findings || []) if (!f.waived && !RENDER_KEYS.has(`${f.lint} ${f.rule}`)) { const k = findingKey(f); m[k] = (m[k] || 0) + 1; } return m; };

/**
 * The per-row baseline: `file` merged with every other `baseline.<part>.json` beside it (the shard files
 * baseline.shard-i-of-n.json, the slice files baseline.slice-i-of-n.json of the 28-night first baseline, and
 * baseline.added[.shard-i-of-n].json, the rows --pin-new pinned after it).
 */
function loadBaseline(file) {
    if (!file) return null;
    const out = { rows: {}, owner: new Map(), conflicts: [], duplicates: [], files: [] };
    const dir = path.dirname(path.resolve(file));
    const files = [path.resolve(file)];
    try { for (const f of fs.readdirSync(dir).sort()) if (/^baseline\.[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)?\.json$/.test(f) && path.join(dir, f) !== path.resolve(file)) files.push(path.join(dir, f)); } catch (e) { /* none */ }
    for (const f of files) {
        let rows;
        try { rows = JSON.parse(fs.readFileSync(f, 'utf8')).rows || {}; } catch (e) { continue; /* missing */ }
        out.files.push(f);
        for (const [id, entry] of Object.entries(rows)) {
            // I4: a row pinned in two files is never resolved by file-name order
            if (out.owner.has(id)) {
                const other = out.owner.get(id);
                if (canon(pinOf(entry)) !== canon(pinOf(out.rows[id]))) out.conflicts.push({ id, files: [other, f] });
                else out.duplicates.push({ id, files: [other, f] });
                continue;
            }
            out.rows[id] = entry;
            out.owner.set(id, f);
        }
    }
    return out;
}
/** The pinned content of an entry (counts per size + keys), without its re-pin log: what I4 compares. */
const pinOf = (e) => { const o = {}; for (const [k, v] of Object.entries(e || {})) if (k !== 'repinned') o[k] = v; return o; };
/** Canonical JSON (sorted keys), so two files holding the same pin compare equal whatever their key order. */
function canon(v) {
    if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
    if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
    return JSON.stringify(v);
}
/** I4 as a refusal: the text naming each conflicting row and both files, or null. */
function baselineConflictError(base) {
    if (!base || !base.conflicts || !base.conflicts.length) return null;
    return `the merged baseline pins ${base.conflicts.length} row(s) in two files with different contents (I4; never resolved by file order): ${base.conflicts.slice(0, 5).map((c) => `${c.id} in ${path.basename(c.files[0])} and ${path.basename(c.files[1])}`).join('; ')}${base.conflicts.length > 5 ? ' ...' : ''}. Keep the entry that is right in one file and delete it from the other (with a STATUS note)`;
}

/**
 * Is the first full baseline there (owner 2026-10-23)? It is when `baseline.json` says `complete: true`, or when
 * the slice files baseline.slice-i-of-n.json of one n are all present (i = 1 … n), each written by a --write-baseline
 * run of its slice. Until then the deploy WARNS on an old nightly instead of refusing.
 */
function baselineComplete(dir) {
    let names = [];
    try { names = fs.readdirSync(dir); } catch (e) { return { complete: false, how: `no ${dir}` }; }
    try { const b = JSON.parse(fs.readFileSync(path.join(dir, 'baseline.json'), 'utf8')); if (b && b.complete === true) return { complete: true, how: 'baseline.json says complete: true' }; } catch (e) { /* none */ }
    const by = new Map();
    for (const f of names) { const m = /^baseline\.slice-(\d+)-of-(\d+)\.json$/.exec(f); if (m) { const n = +m[2]; if (!by.has(n)) by.set(n, new Set()); by.get(n).add(+m[1]); } }
    let best = null;
    for (const [n, have] of by) {
        const missing = []; for (let i = 1; i <= n; i++) if (!have.has(i)) missing.push(i);
        if (!missing.length) return { complete: true, how: `all ${n} slice baselines (baseline.slice-1..${n}-of-${n}.json)`, n, have: n };
        if (!best || have.size > best.have) best = { n, have: have.size, missing };
    }
    return best ? { complete: false, how: `${best.have} of ${best.n} slice baselines pinned (missing ${best.missing.slice(0, 8).join(', ')}${best.missing.length > 8 ? ' ...' : ''})`, n: best.n, have: best.have, missing: best.missing }
        : { complete: false, how: 'no slice baseline pinned yet and baseline.json does not say complete: true', have: 0 };
}

/**
 * The rises of one row against its baseline entry (absent entry = zero everywhere). A size whose pinned entry
 * carries finding keys (`keys`, N1) is compared key by key: a finding whose key is not pinned (or is pinned fewer
 * times) is a rise even when its rule's count did not grow. An entry with counts only (pinned before N1) is compared
 * by counts.
 */
function risesOf(row, base) {
    const b = (base && base.rows[row.id]) || {};
    const out = [];
    for (const sz of SIZES) {
        const s = row.sizes[sz];
        if (!s || s.na || s.pending) continue;
        for (const [k, n] of Object.entries(s.counts || {})) {
            const pinned = RENDER_KEYS.has(k) ? 0 : ((b[sz] || {})[k] || 0);
            if (n > pinned) out.push(`${sz} ${k}: ${pinned} -> ${n}`);
        }
        const pk = b.keys && b.keys[sz];
        if (pk && s.keys) {
            for (const [k, n] of Object.entries(s.keys)) {
                const pinned = pk[k] || 0;
                const rule = k.split('|')[0];
                if (n > pinned && !out.some((x) => x.startsWith(`${sz} ${rule}:`))) out.push(`${sz} ${rule}: new finding "${k.split('|').slice(1).join(' ')}" (${pinned} -> ${n}; the rule's count did not rise: it replaced a fixed one)`);
            }
        }
    }
    return out;
}
/** Does the row have a baseline entry to be judged against? (owner 2026-10-23: no entry = PENDING(no-baseline)) */
const hasBaselineEntry = (row, base) => !!(base && base.rows && base.rows[row.id]);

/* ============================================================================ running */

function ensureRunner() {
    if (!fs.existsSync(RUNNER)) fs.copyFileSync(path.join(__dirname, 'mq-browser-run.sh'), RUNNER);
    fs.chmodSync(RUNNER, 0o755);
}

async function runRows(rows, { slots, batch, verbose }) {
    ensureRunner();
    const jobs = rows.flatMap((r) => SIZES.map((sz) => ({ id: `${r.id}@${sz}`, args: ['--skills', r.skills.join(','), ...r.args, '--size', sz] })));
    const chunks = [];
    for (let i = 0; i < jobs.length; i += batch) chunks.push(jobs.slice(i, i + batch));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-matrix-'));
    const docs = new Map(); const pend = new Map(); const na = new Map(); const crashed = new Map();
    let next = 0; let done = 0;
    const t0 = Date.now();
    const chunkTimes = [];
    const worker = async () => {
        while (next < chunks.length) {
            const ci = next++;
            const jf = path.join(tmp, `jobs-${ci}.json`), of = path.join(tmp, `out-${ci}.json`), lf = path.join(tmp, `log-${ci}.txt`);
            fs.writeFileSync(jf, JSON.stringify(chunks[ci]));
            const c0 = Date.now();
            const rc = await new Promise((resolve) => {
                const log = fs.openSync(lf, 'w');
                const p = spawn(RUNNER, ['node', PRINT_LINT, '--source', 'kit', '--jobs', jf, '--json', of, '--report-only'], { env: { ...process.env, MQ_ROOT: ROOT, MQ_BROWSER_WAIT_LOG: '1' }, stdio: ['ignore', log, log] });
                p.on('close', (code) => { fs.closeSync(log); resolve(code); });
            });
            const ms = Date.now() - c0;
            // time spent waiting for a browser slot another session held (mq-browser-run.sh's wait log)
            const wait = /mq-browser-run: slot \d+ after (\d+)s/.exec(fs.readFileSync(lf, 'utf8'));
            const waitMs = wait ? Number(wait[1]) * 1000 : 0;
            chunkTimes.push({ chunk: ci, jobs: chunks[ci].length, ms, waitMs });
            let out = null;
            try { out = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { out = null; }
            if (out) {
                for (const d of out.documents || []) docs.set(d.id, d);
                for (const p of out.pending || []) pend.set(p.id, p);
                for (const x of out.na || []) na.set(x.id, x);
            }
            const tail = fs.readFileSync(lf, 'utf8').trim().split('\n').slice(-3).join(' | ');
            for (const j of chunks[ci]) if (!docs.has(j.id) && !pend.has(j.id) && !na.has(j.id)) crashed.set(j.id, `print-lint exit ${rc}: ${tail}`);
            done++;
            process.stdout.write(`  batch ${done}/${chunks.length}: ${chunks[ci].length} document(s) in ${(ms / 1000).toFixed(1)} s${waitMs ? ` (${(waitMs / 1000).toFixed(0)} s of it waiting for a slot)` : ''}${rc ? ` (exit ${rc})` : ''}\n`);
            if (verbose) process.stdout.write(fs.readFileSync(lf, 'utf8').split('\n').filter((l) => /^ {2}\S/.test(l)).join('\n') + '\n');
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, slots) }, worker));
    // critic r4 N1: a batch that crashed (print-lint exited without a result for some documents: a browser or runner
    // failure, not a buildSheet throw, which print-lint reports as a document) is run ONCE more, those documents only,
    // so one transient crash does not make its rows ERROR (and hold every deploy until the lead re-pins them)
    if (crashed.size) {
        const again = jobs.filter((j) => crashed.has(j.id));
        process.stdout.write(`  ${again.length} document(s) had no result (print-lint crashed); running them once more\n`);
        for (const j of again) crashed.delete(j.id);
        for (let i = 0; i < again.length; i += batch) chunks.push(again.slice(i, i + batch));
        await Promise.all(Array.from({ length: Math.max(1, slots) }, worker));
    }
    const wallMs = Date.now() - t0;
    if (!has('keep-tmp')) fs.rmSync(tmp, { recursive: true, force: true });
    for (const r of rows) {
        r.sizes = {};
        for (const sz of SIZES) {
            const id = `${r.id}@${sz}`;
            const d = docs.get(id);
            if (d) r.sizes[sz] = { pages: d.pages, keyPages: d.keyPages, counts: countsOf(d), keys: keysOf(d), error: d.error || null, groups: verbose ? [...new Set((d.findings || []).map((f) => `${f.lint} ${f.rule}: ${f.msg}`))].slice(0, 12) : undefined };
            else if (pend.has(id)) r.sizes[sz] = { pending: pend.get(id).step, reason: pend.get(id).reason };
            else if (na.has(id)) r.sizes[sz] = { na: na.get(id).reason };
            else r.sizes[sz] = { error: crashed.get(id) || 'no result', counts: { 'L-SPLIT RENDER': 1 } };
        }
    }
    const linted = [...docs.keys()].length;
    const waitMs = chunkTimes.reduce((a, c) => a + c.waitMs, 0);
    return { wallMs, waitMs, linted, jobs: jobs.length, chunks: chunks.length, chunkTimes, docsPerSec: linted / (wallMs / 1000) };
}

function verdict(row, base) {
    const s = Object.values(row.sizes);
    if (s.every((x) => x.na)) { row.status = 'N/A'; row.reason = s[0].na; return; }
    if (s.some((x) => x.pending)) { row.status = 'PENDING'; row.step = s.find((x) => x.pending).pending; row.reason = s.find((x) => x.pending).reason; return; }
    row.rises = risesOf(row, base);
    const bad = SIZES.filter((sz) => renderError(row.sizes[sz]));
    if (bad.length) {
        // it did not print: ERROR whatever the baseline holds (D4)
        row.status = 'ERROR';
        row.errors = bad.map((sz) => `${sz}: ${row.sizes[sz].error || 'L-SPLIT RENDER (the sheet did not render)'}`);
        row.reason = `could not print at ${bad.join(', ')}`;
        return;
    }
    // owner 2026-10-23: a row with findings but no baseline entry of its own is PENDING(no-baseline), never RED:
    // there is nothing to rise above yet (the 28-night first baseline, or --pin-new, pins it). Without --baseline
    // at all (a builder's own check) every finding is still red.
    if (row.rises.length && base && !hasBaselineEntry(row, base)) {
        row.status = 'PENDING'; row.step = 'no-baseline'; row.noBaseline = true;
        row.reason = `no per-row baseline entry yet (${row.rises.length} finding group(s) not judged; pinned by the first full baseline or --pin-new)`;
        return;
    }
    row.noBaseline = false;
    row.status = row.rises.length ? 'RED' : 'OK';
}

/**
 * --write-baseline (D4): pin the lint counts of the rows that PRINTED (status OK or RED after verdict()).
 * A row that could not print (ERROR: a render error at any size), a PENDING or N/A row is never pinned; render
 * keys are stripped even from a pinned row. Returns the ids refused, with why. `onlyNew` (--pin-new) never re-pins a
 * row that already has an entry in `cur`.
 */
function pinRows(cur, rows, { merged = null, redIds = null } = {}) {
    const refused = [], kept = [], redSkipped = [], pinnedIds = [];
    for (const r of rows) {
        if (!r.sizes) continue;
        // a row that printed: OK, RED, or PENDING(no-baseline) (it printed, it only had no entry to compare with)
        if (r.status !== 'OK' && r.status !== 'RED' && !r.noBaseline) { refused.push({ id: r.id, why: r.status === 'ERROR' ? (r.errors || []).join('; ') : r.status }); continue; }
        // I2: a row re-selected by --red-from is never pinned (it is red until a run lists it OK against its entry)
        if (redIds && redIds.has(r.id)) { redSkipped.push(r.id); continue; }
        // I1: pin-new-only - a row with an entry in the target OR anywhere in the merged baseline is never re-pinned
        const has = cur.rows[r.id] ? 'the target file' : merged && merged.rows && merged.rows[r.id] ? path.basename((merged.owner && merged.owner.get(r.id)) || 'the merged baseline') : null;
        if (has) { kept.push({ id: r.id, why: `has an entry in ${has}` }); continue; }
        cur.rows[r.id] = entryOf(r);
        pinnedIds.push(r.id);
    }
    return { pinned: pinnedIds.length, pinnedIds, refused, kept, redSkipped };
}
/** A baseline entry from a printed row: counts per size (render keys stripped, D4) and (N1) the finding keys. */
function entryOf(r) {
    const entry = Object.fromEntries(SIZES.map((sz) => [sz, Object.fromEntries(Object.entries((r.sizes[sz] && r.sizes[sz].counts) || {}).filter(([k]) => !RENDER_KEYS.has(k)))]));
    // N1: the finding keys too, so a swapped finding of one rule is caught (an entry without keys compares counts)
    entry.keys = Object.fromEntries(SIZES.map((sz) => [sz, (r.sizes[sz] && r.sizes[sz].keys) || {}]));
    return entry;
}
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const sortRows = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/**
 * The one judge-then-pin step of every run (main and the self-test's simulated nights): every printed row is judged
 * against the merged baseline as loaded BEFORE the run (`base`), THEN the pins are written, and no row is judged
 * again (I3: a pin never changes a row's status in the run that wrote it). `pin` = writePins' arguments, or null.
 */
function judgeAndPin(rows, base, pin) {
    for (const r of rows) if (r.sizes) verdict(r, base);
    return pin ? writePins(pin) : null;
}

/**
 * Every baseline write of a run (BASELINE INVARIANTS). `rows` are the rows the run printed, ALREADY judged against
 * the merged baseline (I3: nothing here changes a row's status; a pinned row gets `pinned: true`, a re-pinned one
 * `repinned: {date, reason}`). `mode`:
 *   'write-baseline'  pin-new-only (I1) into baseline.slice-i-of-n.json (with `slice`) / baseline.shard-i-of-n.json /
 *                     `bf`; the file is written even when it pins nothing (the slice night is done)
 *   'pin-new'         pin-new-only (I1) into baseline.added[.shard-i-of-n].json, written when it pins a row
 *   'repin'           the explicit per-row re-pin (I1): exactly `repinIds`, each rewritten IN THE FILE THAT OWNS ITS
 *                     ENTRY (so no row is ever pinned in two files, I4), the old pin and the reason logged in the
 *                     entry's `repinned` list; a row that did not print is refused
 * `redIds` (I2): never pinned. A merged baseline with conflicting duplicates (I4) refuses the whole write.
 * N4 (critic r4): `partial` (a --slice --write-baseline run narrowed by --skills / --kind / --rows / --shard) writes
 * baseline.slice-i-of-n.partial.json, which every reader merges but which never counts as the slice done
 * (baselineComplete reads baseline.slice-i-of-n.json only), so the slice's full night still runs.
 * N5 (critic r4): NOTHING is written here. The writes are returned in `writes` and done by `flush()` (each file atomic:
 * temp + rename), which the caller calls AFTER it wrote the run file: a crash in between leaves the run file and no
 * pin (the slice is not done, the night is retried), never a slice file without the run that judged its rows.
 * Returns { target, pinned, pinnedIds, refused, kept, redSkipped, repinned, writes, flush }.
 */
function writePins({ rows, mode, bf, slice = null, shard = null, redIds = null, repinIds = null, reason = '', commit = '?', dirty = false, now = new Date(), partial = null }) {
    const merged = loadBaseline(bf);
    const conflict = baselineConflictError(merged);
    if (conflict) throw new UsageError(conflict);
    const dir = path.dirname(path.resolve(bf));
    const date = now.toISOString().slice(0, 10);
    const stampCommit = commit + (dirty ? ' (dirty)' : '');
    if (mode === 'repin') {
        const refused = [], repinned = [];
        const byFile = new Map();
        for (const id of repinIds || []) {
            const r = rows.find((x) => x.id === id);
            if (!r || !r.sizes) { refused.push({ id, why: 'not run by this run' }); continue; }
            if (r.status !== 'OK' && r.status !== 'RED' && !r.noBaseline) { refused.push({ id, why: r.status === 'ERROR' ? `it did not print (${(r.errors || []).join('; ')}): a render error is never pinned` : r.status }); continue; }
            const owner = (merged.owner && merged.owner.get(id)) || path.resolve(bf);
            if (!byFile.has(owner)) byFile.set(owner, readJson(owner, { rows: {} }));
            const cur = byFile.get(owner);
            cur.rows = cur.rows || {};
            const old = cur.rows[id];
            const entry = entryOf(r);
            const before = old ? Object.fromEntries(SIZES.map((sz) => [sz, old[sz] || {}])) : null;
            entry.repinned = [...((old && old.repinned) || []), { date, commit: stampCommit, reason, before, status: r.status === 'PENDING' ? `PENDING(${r.step})` : r.status, rises: (r.rises || []).slice(0, 6) }];
            cur.rows[id] = entry;
            // N2: the key of the entry this re-pin writes; the fold reads REPINNED only while it is the row's current entry
            r.repinned = { date, reason, file: path.basename(owner), key: sha(canon(entry)).slice(0, 16) };
            repinned.push(id);
        }
        const writes = [...byFile].map(([f, cur]) => { cur.rows = sortRows(cur.rows); return { file: f, text: JSON.stringify(cur, null, 1) + '\n' }; });
        return { target: [...byFile.keys()], pinned: repinned.length, pinnedIds: repinned, refused, kept: [], redSkipped: [], repinned, writes, flush: () => writes.forEach((w) => writeAtomic(w.file, w.text)) };
    }
    const target = mode === 'pin-new'
        ? path.join(dir, `baseline.added${shard ? `.shard-${shard.i}-of-${shard.n}` : ''}.json`)
        : slice ? path.join(dir, `baseline.slice-${slice.i}-of-${slice.n}${partial ? '.partial' : ''}.json`) : shard ? path.join(dir, `baseline.shard-${shard.i}-of-${shard.n}.json`) : path.resolve(bf);
    const cur = readJson(target, { rows: {} });
    cur.rows = cur.rows || {};
    const res = pinRows(cur, rows, { merged, redIds });
    for (const id of res.pinnedIds) { const r = rows.find((x) => x.id === id); if (r) r.pinned = true; }
    if (mode === 'write-baseline' || res.pinned) {
        cur.tool = TOOL;
        cur.note = mode === 'pin-new'
            ? 'Rows pinned by --pin-new: rows that printed and had no per-row baseline entry (skills appended after the first full baseline). Merged by every reader of baseline.json.'
            : 'Per-row baseline (IMPROVEMENT_PLAN §1.6.2): every finding count per (row, size, lint rule) at the commit below, for rows that printed and had NO entry in the merged baseline (I1: pin-new-only; a row re-selected as red is never pinned, I2). A red row is any count above it; a row that cannot print (L-SPLIT RENDER) is never pinned. Re-pinned only with --repin <ids> --reason, logged in the entry.';
        cur.commit = stampCommit; cur.date = date;
        if (slice && mode === 'write-baseline') { cur.slice = `${slice.i}/${slice.n}`; cur.finished = now.toISOString(); }
        if (partial) cur.partial = { ...partial, note: 'a --slice run narrowed by --skills / --kind / --rows / --shard: merged by every reader, never counted as the slice done (N4)' };
        cur.rows = sortRows(cur.rows);
        const writes = [{ file: target, text: JSON.stringify(cur, null, 1) + '\n' }];
        return { target, ...res, repinned: [], writes, flush: () => writes.forEach((w) => writeAtomic(w.file, w.text)) };
    }
    return { target, ...res, repinned: [], writes: [], flush: () => {} };
}

/**
 * The row's baseline key (N10, critic r4 N2): a hash of the row's own merged baseline entry (canonical JSON, so key order
 * never matters), or 'none' without --baseline. The cache keys on it, every run file records it per row, and the fold
 * accepts an OK only when it matches the folded directory's current entry (or the row's findings, re-judged against
 * that entry, do not rise).
 */
const baselineKey = (base, id) => (base ? sha(canon((base.rows && base.rows[id]) || {})).slice(0, 16) : 'none');
/** The run file's `baseline` record (N2): which merged baseline the rows were judged against. */
function baselineRecord(bf, base) {
    if (!bf || !base) return null;
    const relR = (p) => path.relative(ROOT, p) || '.';
    return { file: relR(path.resolve(bf)), dir: relR(path.dirname(path.resolve(bf))), files: (base.files || []).map((f) => path.basename(f)), entries: Object.keys(base.rows || {}).length, hash: sha(canon(base.rows || {})).slice(0, 16) };
}
/** N5: write a file whole or not at all (temp file + rename), so a crash never leaves half a JSON file. */
function writeAtomic(file, text) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, file);
}

/* ============================================================================ selection */

/**
 * The slice of a row (owner 2026-10-23): slice i of n holds the rows whose id hashes to i - 1 mod n. It depends on
 * the row's id only, so appending a skill never moves an existing row to another slice (a position-based split
 * would). The hash is SHA-256 (32 bits of it): FNV-1a's low bits are poorly mixed, so FNV mod 28 and a salted FNV
 * mod 2 were correlated (slice 2/28 x shard 1/2 held 0 rows). `--seventh d` is kept as an alias of `--slice <d+1>/7`
 * (no nightly ran with the old FNV seventh, so no run file depends on its rows).
 */
const h32 = (s) => parseInt(sha(s).slice(0, 8), 16);
const inSlice = (id, sl) => h32('slice:' + id) % sl.n === sl.i - 1;
/** Shards split by an independently salted hash of the id, for the same reason: a shard's rows never depend on what else is selected. */
const inShard = (id, sh) => h32('shard:' + id) % sh.n === sh.i - 1;

/**
 * Rows: the --kind / --rows filters, then the REACH (the union of --affected's rows, the --slice / --seventh rows
 * and `extraIds`, the RED / ERROR rows of the folded run state that --red-from re-selects), then the shard.
 */
function selectRows(all, { kinds, names, shard, seventh, slice, affectedIds, extraIds }) {
    let rows = all;
    if (kinds) rows = rows.filter((r) => kinds.includes(r.kind));
    if (names) rows = rows.filter((r) => names.includes(r.id) || names.includes(`${r.kind}/${r.name}`));
    const sl = slice || (seventh !== null && seventh !== undefined ? { i: seventh + 1, n: 7 } : null);
    if (affectedIds || sl || extraIds) rows = rows.filter((r) => (affectedIds && affectedIds.has(r.id)) || (sl && inSlice(r.id, sl)) || (extraIds && extraIds.has(r.id)));
    rows = rows.slice().sort((a, b) => a.id.localeCompare(b.id));
    if (shard) rows = rows.filter((r) => inShard(r.id, shard));
    return rows;
}

/* ============================================================================ the folded run state (critic r2 D1) */

/** A run file: <date>[T<HHMM>][.shard-i-of-n].json; one run = one stamp (<date>, or <date>T<HHMM> for a fired run). */
const RUN_RE = /^(\d{4}-\d{2}-\d{2}(?:T\d{4})?)(?:\.shard-(\d+)-of-(\d+))?\.json$/;
const RED_STATES = new Set(['RED', 'ERROR']);

/** When a file name's stamp says the run happened: <date> = 00:00 UTC, <date>T<HHMM> = that time (the START, autoOut). */
const stampTime = (stamp) => { const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2})(\d{2}))?$/.exec(String(stamp)); return m ? Date.parse(`${m[1]}T${m[2] || '00'}:${m[3] || '00'}:00Z`) : NaN; };

/**
 * Fold every run file in `dir`, ordered by when it FINISHED (critic r4 D2), then the `extra` run files (the deploy's own
 * inline run), into each row's last-known state: a row's state is its status in the MOST RECENT run that ran it (listed
 * it in `rows`, or in `red`). A RED / ERROR row therefore stays red across runs that did not select it, until a later
 * run clears it (I5, below). An id in a file's `red` list is RED in that run even when its row says otherwise.
 * ORDER (D2): every run file, whatever its name, by `finished` (ISO time); a file with no valid `finished` (only a
 * nightly-named one can be folded without it) by its name's stamp (<date> = 00:00 UTC, <date>T<HHMM> = that time);
 * ties by file name. Never by the name alone: a lane's run that finished at 00:30 is OLDER than the nightly that
 * finished at 02:10 the same day, whatever their names.
 * CLEARING A RED ROW (I5, critic r4 N2 / N3 / N9). A later run's non-red status clears a red row only when:
 *   - the run is not dirty (N3: a run on a tree with local edits can make a row red, never clear one);
 *   - OK / REPINNED was judged against THIS directory's baseline (N2): the run file's `baseline` record names this
 *     dir, and the row's recorded `baselineKey` (for REPINNED: `repinned.key`, the entry it wrote) is the key of the row's
 *     CURRENT entry in this dir's merged baseline (`opts.base`, default loadBaseline(<dir>/baseline.json)); an OK row
 *     whose key differs still clears when its recorded findings, re-judged against the current entry, do not rise.
 *     `baseline: null` (a run with no --baseline: any finding was red, so OK = no findings at all) clears. A run file
 *     with no `baseline` field at all was written before N2: it clears as before, and the fold lists it (`legacyClears`);
 *   - RETIRED (--retire) clears;
 *   - PENDING(no-baseline), PENDING(step) and N/A never clear (N9): the row stays red with `lastSeenAs` ("not re-run
 *     (now N/A)") until a run lists it OK, or the lead retires it (--retire takes a red row last seen N/A / PENDING).
 * An OK / REPINNED that does not clear is listed in `ignored` with why (a warning at deploy).
 * Returns { files: [{file, stamp, order, shard, named, j}], bad, skipped, rows: Map(id -> {status, stamp, file, commit,
 *           valid?, ...}), red: [ids RED / ERROR in the fold], ignored: [{id, file, status, why}], legacyClears:
 *           [{id, file}], pinnedNA: [ids with a baseline entry whose newest state is N/A] }.
 */
function foldRuns(dir, extra = [], opts = {}) {
    const all = (dir && fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => /\.json$/i.test(f)).sort();
    const files = [], bad = [], skipped = [];
    const list = [];
    for (const f of all) {
        const file = path.join(dir, f);
        const m = RUN_RE.exec(f);
        let j = null, err = null;
        try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { err = e.message; }
        const fin = j && Date.parse(j.finished);
        if (m) {   // the nightly's own names: always folded (an unreadable one is reported, never skipped)
            if (err) { bad.push({ file, error: err }); continue; }
            list.push({ file, stamp: m[1], order: Number.isFinite(fin) ? fin : stampTime(m[1]), shard: m[2] ? { i: +m[2], n: +m[3] } : null, named: true, j });
            continue;
        }
        // N5: any other .json that IS a run (commit + finished + rows) is folded whatever its name; the rest is listed
        if (err) { skipped.push({ file, why: `not JSON (${err.slice(0, 60)})` }); continue; }
        const run = j && j.commit && j.finished && Array.isArray(j.rows);
        if (run && Number.isFinite(fin)) {
            const iso = new Date(fin).toISOString();
            list.push({ file, stamp: `${iso.slice(0, 10)}T${iso.slice(11, 13)}${iso.slice(14, 16)}`, order: fin, shard: null, named: false, j });
            continue;
        }
        const known = /^baseline(\.|$)/.test(f) ? 'a baseline file' : /^cache/.test(f) ? 'the cache' : /^options-pin-/.test(f) ? 'an options-pin report' : null;
        const missing = ['commit', 'finished', 'rows'].filter((k) => !(j && (k === 'rows' ? Array.isArray(j.rows) : j[k] && (k !== 'finished' || Number.isFinite(Date.parse(j[k]))))));
        skipped.push({ file, known: !!known, why: `${known ? `${known}, ` : ''}not a run file: no ${missing.join(', ')}${j && j.tool ? ` (tool ${j.tool})` : ''}` });
    }
    // D2: by finish time, whatever the name; ties by file name
    list.sort((a, b) => ((a.order - b.order) || (path.basename(a.file) < path.basename(b.file) ? -1 : path.basename(a.file) > path.basename(b.file) ? 1 : 0)));
    for (const f of extra.filter((x) => x && fs.existsSync(x))) {
        try { list.push({ file: f, stamp: 'inline', order: Infinity, shard: null, extra: true, j: JSON.parse(fs.readFileSync(f, 'utf8')) }); } catch (e) { bad.push({ file: f, error: e.message }); }
    }
    // N2: the baseline every clearing OK must have been judged against: this directory's merged baseline
    let base = opts.base;
    if (base === undefined) { try { base = dir && fs.existsSync(dir) ? loadBaseline(path.join(dir, 'baseline.json')) : null; } catch (e) { base = null; } }
    const here = dir ? path.resolve(dir) : null;
    const ignored = [], legacyClears = [];
    /** Would this run's non-red record clear a red row? {ok, why?, legacy?} */
    const clears = (e, r, id, status) => {
        const j = e.j;
        if (j.dirty) return { ok: false, why: 'the run was on a tree with local edits (dirty: true); a dirty run never clears a red row (N3)' };
        if (status === 'RETIRED') return { ok: true };
        if (!('baseline' in j)) return { ok: true, legacy: true };
        const rec = j.baseline;
        if (rec === null) return status === 'OK' ? { ok: true } : { ok: false, why: 'REPINNED by a run that records no baseline' };
        if (!rec || typeof rec !== 'object' || rec.dir == null || path.resolve(ROOT, rec.dir) !== here) return { ok: false, why: `judged against ${rec && (rec.file || rec.dir) || 'an unnamed baseline'}, not this directory's baseline (N2)` };
        const entryId = r.judgedAgainst || id;
        const cur = baselineKey(base || { rows: {} }, entryId);
        if (status === 'REPINNED') return r.repinned && r.repinned.key === cur ? { ok: true } : { ok: false, why: `the entry this re-pin wrote (${(r.repinned && r.repinned.key) || 'no key recorded'}) is not the row's current entry (${cur}) (N2)` };
        if (r.baselineKey && r.baselineKey === cur) return { ok: true };
        if (r.sizes && SIZES.every((sz) => r.sizes[sz] && !renderError(r.sizes[sz])) && !risesOf({ id: entryId, sizes: r.sizes }, base || { rows: {} }).length) return { ok: true, rejudged: true };
        return { ok: false, why: `judged against another entry of the row (${r.baselineKey || 'no key recorded'}; current ${cur}), and its findings rise above the current entry (N2)` };
    };
    const rows = new Map();
    let seq = 0;
    for (const e of list) {
        const j = e.j;
        seq++;
        files.push(e);
        const redList = new Set((Array.isArray(j.red) ? j.red : []).map(String));
        const seen = new Set();
        const put = (id, rec, r) => {
            const prev = rows.get(id);
            const wasRed = prev && RED_STATES.has(prev.status);
            if (rec.status === 'OK' || rec.status === 'REPINNED') {
                const c = clears(e, r || {}, id, rec.status);
                rec.valid = c.ok;
                if (!c.ok && wasRed) { ignored.push({ id, file: e.file, status: rec.status, why: c.why }); rows.set(id, { ...prev, lastSeen: e.stamp, lastSeenAs: `${rec.status} (ignored: ${c.why})`, lastFile: e.file, seq }); return; }
                if (c.ok && c.legacy && wasRed) legacyClears.push({ id, file: e.file });
            } else if (rec.status === 'RETIRED' && wasRed && j.dirty) {
                ignored.push({ id, file: e.file, status: rec.status, why: 'retired by a run on a dirty tree (N3)' });
                rows.set(id, { ...prev, lastSeen: e.stamp, lastSeenAs: 'RETIRED (ignored: dirty)', lastFile: e.file, seq }); return;
            }
            // I5 / N9: printed with no entry, PENDING(step) and N/A never clear a red row: it was not judged OK
            if (wasRed && rec.status === 'PENDING' && rec.step === 'no-baseline') { rows.set(id, { ...prev, lastSeen: e.stamp, lastSeenAs: 'PENDING(no-baseline)', lastFile: e.file, seq }); return; }
            if (wasRed && (rec.status === 'N/A' || rec.status === 'PENDING')) { rows.set(id, { ...prev, lastSeen: e.stamp, lastSeenAs: rec.status === 'N/A' ? 'N/A' : `PENDING(${rec.step || '?'})`, notRerun: true, lastFile: e.file, seq }); return; }
            if (wasRed && !RED_STATES.has(rec.status)) rec.cleared = { from: prev.status, since: prev.stamp, by: rec.status };
            rows.set(id, rec);
        };
        for (const r of Array.isArray(j.rows) ? j.rows : []) {
            if (!r || !r.id) continue;
            const id = String(r.id);
            seen.add(id);
            let status = redList.has(id) && !RED_STATES.has(String(r.status)) ? 'RED' : String(r.status);
            if (r.repinned && status !== 'ERROR') status = 'REPINNED';
            put(id, { status, step: r.step, stamp: e.stamp, file: e.file, commit: j.commit, seq, rises: r.rises, errors: r.errors, reason: r.reason, repinned: r.repinned, skill: r.skill || (r.skills || [])[0], kind: r.kind, row: r.row, args: r.args }, r);
        }
        for (const id of redList) if (!seen.has(id)) put(id, { status: 'RED', stamp: e.stamp, file: e.file, commit: j.commit, seq, listOnly: true });
    }
    const red = [...rows.entries()].filter(([, v]) => RED_STATES.has(v.status)).map(([id]) => id).sort();
    // N9: a row pinned as printable whose newest state is N/A (or red, last seen N/A): its entry checks nothing now
    const pinnedNA = [...rows.entries()].filter(([id, v]) => (v.status === 'N/A' || v.lastSeenAs === 'N/A') && base && base.rows && base.rows[id]).map(([id]) => id).sort();
    return { files, bad, skipped, rows, red, ignored, legacyClears, pinnedNA };
}

/** The fold's warnings (critic r4 N2 / N3 / N9), one line each: printed by --red-from and WARNINGs at deploy. */
function foldWarnings(fold) {
    const out = [];
    const byFile = new Map();
    for (const x of fold.ignored || []) { if (!byFile.has(x.file)) byFile.set(x.file, []); byFile.get(x.file).push(x); }
    for (const [f, xs] of byFile) out.push(`${path.basename(f)} lists ${xs.length} red row(s) ${[...new Set(xs.map((x) => x.status))].join(' / ')} that it may not clear, so they stay red: ${xs[0].why}; ${xs.slice(0, 4).map((x) => x.id).join(', ')}${xs.length > 4 ? ' ...' : ''}`);
    const legacy = new Map();
    for (const x of fold.legacyClears || []) { if (!legacy.has(x.file)) legacy.set(x.file, []); legacy.get(x.file).push(x.id); }
    for (const [f, ids] of legacy) out.push(`${path.basename(f)} records no baseline (written before N2): its OK cleared ${ids.length} red row(s) unchecked (${ids.slice(0, 4).join(', ')}${ids.length > 4 ? ' ...' : ''})`);
    if ((fold.pinnedNA || []).length) out.push(`${fold.pinnedNA.length} row(s) with a baseline entry are N/A now, so their entry checks nothing (N9): ${fold.pinnedNA.slice(0, 5).join(', ')}${fold.pinnedNA.length > 5 ? ' ...' : ''}; if the row is gone for good, --retire it`);
    return out;
}

/**
 * N1: sort the fold's red ids against the CURRENT row table. `index` = { live: Set(skill keys), rows: Map(id -> {kind,
 * args}) } for (at least) the skills of the red ids. Returns
 *   current  ids that are rows today (re-run / judged as they are)
 *   mapped   [{from, to}]: the id is gone, but its skill is live and a row of the same kind and the same flags (args)
 *            exists under a new name: the red state carries to that row (it is re-run, judged against the old entry)
 *   retired  [{id, why}]: the skill is live, the id is gone and no row has its kind and flags: RETIRED-ROW, a warning
 *            (never a refusal); cleared by `--retire <id> --reason` (a run file listing it RETIRED)
 *   dead     ids of skills that are not live (retired skills: ignored)
 *   outside  ids of skills not in `index` (not selected)
 */
function resolveRed(redIds, fold, index) {
    const out = { current: [], mapped: [], retired: [], dead: [], outside: [] };
    for (const id of redIds) {
        const skill = id.split('|')[0];
        if (index.rows.has(id)) { out.current.push(id); continue; }
        if (!index.live.has(skill)) { out.dead.push(id); continue; }
        if (!index.skills || !index.skills.has(skill)) { out.outside.push(id); continue; }
        const st = fold.rows.get(id) || {};
        const kind = st.kind || (id.split('|')[1] || '').split('/')[0];
        const match = st.args ? [...index.rows.entries()].find(([rid, r]) => rid.split('|')[0] === skill && r.kind === kind && canon(r.args) === canon(st.args)) : null;
        if (match) out.mapped.push({ from: id, to: match[0] });
        else out.retired.push({ id, why: st.args ? `no current row of ${skill} has kind ${kind} and the flags ${JSON.stringify(st.args).slice(0, 80)}` : `the run file recorded no flags for it, so it cannot be matched to a current row` });
    }
    return out;
}

/** The current row table of some skills, for N1 (no browser): {live: Set, skills: Set, rows: Map(id -> {kind, args})}. */
async function rowIndexFor(keys) {
    const app = await loadApp();
    const live = liveSkills(app);
    const liveKeys = new Set(live.map((s) => s.key));
    const want = [...new Set(keys)].filter((k) => liveKeys.has(k));
    const P = loadPartners();
    const rows = new Map();
    for (const k of want) {
        const info = skillInfo(app, live.find((s) => s.key === k));
        for (const r of rowsFor(info, partnersFor(k, P))) rows.set(r.id, { kind: r.kind, args: r.args, name: r.name });
    }
    return { live: liveKeys, skills: new Set(want), rows };
}

/* ============================================================================ self-test (node only) */

function selfTest() {
    const bad = []; let n = 0;
    const ok = (c, m) => { n++; if (!c) bad.push(m); };
    // 1. the More rows with the defaults row cover every pair of two-valued factors
    for (const k of [3, 4]) {
        const factors = Array.from({ length: k }, (_, i) => ({ tag: 'f' + i }));
        const table = [Array(k).fill(0), ...moreRows(factors).map((r) => factors.map((f) => (r.on.includes(f) ? 1 : 0)))];
        for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) for (const x of [0, 1]) for (const y of [0, 1]) ok(table.some((row) => row[a] === x && row[b] === y), `all-pairs: ${k} factors, f${a}=${x} f${b}=${y} not covered`);
        ok(table.length === k + 1, `all-pairs: ${k} factors need ${k + 1} rows with the defaults row`);
    }
    // 2. the row table per kind (§1.6.2: Sections 10, Mixed 5, Quiz 3; Single 12-15 printable + the prereq row)
    const info = { key: 'a:b', templates: ['stack'], supports: true, nline: true };
    const rows = rowsFor(info, ['c:d', 'e:f', 'g:h']);
    const per = (k) => rows.filter((r) => r.kind === k).length;
    ok(per('sections') === 10, `Sections rows ${per('sections')} != 10`);
    ok(per('mixed') === 5, `Mixed rows ${per('mixed')} != 5`);
    ok(per('quiz') === 3, `Quiz rows ${per('quiz')} != 3`);
    ok(per('single') === 16, `Single rows (supports, number line) ${per('single')} != 16`);
    ok(rowsFor({ ...info, nline: false, supports: false }, []).filter((r) => r.kind === 'single').length === 15, 'Single rows without the number line != 15');
    ok(new Set(rows.map((r) => r.id)).size === rows.length, 'row ids are unique');
    ok(rows.filter((r) => r.kind === 'sections').every((r) => r.skills.length === 4 && r.args[0] === '--kind'), 'Sections rows carry the skill + 3 partners and --kind sections');
    // 3. partners: a partner that IS the skill is replaced from the spare list, same size class first
    const P = { partners: [{ skill: 'x:1', sizeClass: '1x1' }, { skill: 'x:2', sizeClass: '2x1' }], spare: [{ skill: 'y:2', sizeClass: '2x1' }, { skill: 'y:1', sizeClass: '1x1' }] };
    ok(JSON.stringify(partnersFor('x:1', P)) === JSON.stringify(['y:1', 'x:2']), 'partners: the skill itself is swapped for a spare of its size class');
    // 4. index.html stamp-only detection
    ok(stampOnly('--- a/index.html\n+++ b/index.html\n-<link href="css/a.css?v=111">\n+<link href="css/a.css?v=222">'), 'stamp-only: a ?v= change is a stamp');
    ok(!stampOnly('-<link href="css/a.css?v=111">\n+<link href="css/b.css?v=222">'), 'stamp-only: a new stylesheet is not a stamp');
    // 5. classification
    const ctx = { indexStampOnly: true, engineFiles: new Map([['js/modules/sheet/layout.js', ['stack--single']], ['js/modules/print-sheet.js', ['stack--single']]]), closure: new Set(['js/modules/print-sheet.js', 'js/modules/sheet/layout.js', 'js/modules/gen-operations.js', 'js/modules/search-terms.js']), generators: new Set(['js/modules/gen-operations.js']) };
    const cls = (f) => classify(f, ctx).class;
    ok(cls('js/modules/search-terms.js') === 'none', 'search-terms.js reaches no row');
    ok(cls('design/IMPROVEMENT_PLAN.md') === 'none' && cls('tests/scripts/x.cjs') === 'none', 'planning files and tests reach no row');
    ok(cls('index.html') === 'none', 'the index.html stamp reaches no row');
    ok(classify('index.html', { ...ctx, indexStampOnly: false }).class === 'all', 'index.html beyond its stamps reaches every row');
    ok(cls('js/modules/print-generate.js') === 'all', 'print-generate.js reaches every print row');
    ok(cls('css/teacher.css') === 'all', 'any css/ file reaches every print row before M4');
    ok(cls('js/modules/sheet/layout.js') === 'pairs', 'an engine module reaches the rows of its pairs');
    ok(cls('js/modules/print-sheet.js') === 'all', 'print-sheet.js reaches every row');
    ok(cls('js/modules/gen-operations.js') === 'all', 'a generator reaches every row before M4 replay');
    ok(cls('js/modules/worksheet.js') === 'screen', 'a screen host reaches no print row');
    // 6. red: above the baseline or not in it
    const row = { id: 'r', sizes: { S: { counts: { 'L-KEY AK-2': 2 } }, M: { counts: {} }, L: { counts: { 'L-INK INK-1': 1 } } } };
    ok(risesOf(row, { rows: { r: { S: { 'L-KEY AK-2': 2 }, L: { 'L-INK INK-1': 1 } } } }).length === 0, 'red: equal to the baseline is not red');
    ok(risesOf(row, { rows: { r: { S: { 'L-KEY AK-2': 1 }, L: { 'L-INK INK-1': 1 } } } }).length === 1, 'red: one count above the baseline is red');
    ok(risesOf(row, { rows: {} }).length === 2, 'red: a row with no baseline holds every finding against it');
    ok(risesOf(row, null).length === 2, 'red: without --baseline any finding is red');
    // 7. shards and sevenths partition the rows
    const many = Array.from({ length: 50 }, (_, i) => ({ id: 'row' + i, kind: 'single', name: 'x' }));
    const seen = new Map();
    for (let i = 1; i <= 4; i++) for (const r of selectRows(many, { shard: { i, n: 4 }, seventh: null })) seen.set(r.id, (seen.get(r.id) || 0) + 1);
    ok(seen.size === 50 && [...seen.values()].every((v) => v === 1), 'shards: every row in exactly one shard');
    let total = 0;
    for (let d = 0; d < 7; d++) total += selectRows(many, { seventh: d }).length;
    ok(total === 50, 'sevenths: every row in exactly one seventh');
    // 8. D4: a row that could not print is ERROR whatever the baseline says, and --write-baseline never pins it
    const printed = { id: 'p', sizes: { S: { counts: { 'L-KEY AK-2': 1 } }, M: { counts: {} }, L: { counts: {} } } };
    const split = { id: 'e', sizes: { S: { counts: { 'L-SPLIT RENDER': 1 }, error: 'buildSheet threw' }, M: { counts: {} }, L: { counts: {} } } };
    const crashed = { id: 'c', sizes: { S: { error: 'print-lint exit 1: crash', counts: { 'L-SPLIT RENDER': 1 } }, M: { counts: {} }, L: { counts: {} } } };
    const pend = { id: 'q', sizes: { S: { pending: 'M4', reason: 'needs M4' }, M: { counts: {} }, L: { counts: {} } } };
    const forgiving = { rows: { e: { S: { 'L-SPLIT RENDER': 1 } }, c: { S: { 'L-SPLIT RENDER': 1 } } } };
    for (const r of [printed, split, crashed, pend]) verdict(r, forgiving);
    ok(printed.status === 'PENDING' && printed.step === 'no-baseline', `owner 2026-10-23: a finding on a printed row with no baseline entry is PENDING(no-baseline), not RED (${printed.status})`);
    const printedNoBase = { id: 'p', sizes: printed.sizes };
    verdict(printedNoBase, null);
    ok(printedNoBase.status === 'RED', 'without --baseline at all (a builder check) a finding is still RED');
    ok(split.status === 'ERROR' && crashed.status === 'ERROR', `D4: a render error is ERROR even when a baseline pins L-SPLIT RENDER (${split.status}, ${crashed.status})`);
    ok(pend.status === 'PENDING', 'D4: a size that needs a later step makes the row PENDING');
    const cur = { rows: {} };
    const pinRes = pinRows(cur, [printed, split, crashed, pend]);
    ok(pinRes.pinned === 1 && Object.keys(cur.rows).join() === 'p', `D4: only the row that printed is pinned (${Object.keys(cur.rows).join()})`);
    ok(pinRes.refused.map((x) => x.id).sort().join() === 'c,e,q', `D4: the rows that cannot print are listed as not pinned (${pinRes.refused.map((x) => x.id).join()})`);
    for (const r of [printed, split, crashed]) verdict(r, cur);
    ok(printed.status === 'OK' && split.status === 'ERROR' && crashed.status === 'ERROR', 'D4: after pinning the printed row is OK and the render errors stay ERROR');
    const pinned2 = { rows: {} };
    pinRows(pinned2, [{ id: 'm', status: 'RED', sizes: { S: { counts: { 'L-SPLIT RENDER': 1, 'L-INK INK-1': 2 } }, M: { counts: {} }, L: { counts: {} } } }]);
    ok(!('L-SPLIT RENDER' in pinned2.rows.m.S) && pinned2.rows.m.S['L-INK INK-1'] === 2, 'D4: render keys are stripped even from a pinned row');
    // 9. D3: names that name nothing, empty selections, all-pending runs
    const allRows = rowsFor(info, ['c:d', 'e:f', 'g:h']);
    ok(/unknown --rows single\/defualts/.test(selectionError({ all: allRows, names: ['single/defualts'], rows: [], reach: false }) || ''), 'D3: an unknown --rows name is an error naming it');
    ok(/unknown --kind quizz/.test(selectionError({ all: allRows, kinds: ['quizz'], rows: [], reach: false }) || ''), 'D3: an unknown --kind is an error naming it');
    ok(/0 rows/.test(selectionError({ all: allRows, kinds: ['mixed'], names: ['single/defaults'], rows: [], reach: false }) || ''), 'D3: a selection of 0 rows is an error');
    ok(selectionError({ all: allRows, rows: [], reach: true }) === null, 'D3: an --affected / --seventh reach of 0 rows is not an error');
    ok(selectionError({ all: allRows, names: ['single/defaults', 'a:b|sections/pages-2'], rows: allRows.slice(0, 2), reach: false }) === null, 'D3: row names and full ids are accepted');
    const quizOnly = allRows.filter((r) => r.kind === 'quiz').map((r) => ({ ...r, status: 'PENDING', step: 'T3' }));
    const fv = finalVerdict(quizOnly, { summary: 's' });
    ok(fv.code === 2 && /^ws-coverage-matrix: INCOMPLETE \(all 3 rows pending: PENDING\(T3\) x3/.test(fv.line), `D3: all rows pending is INCOMPLETE, exit 2 (${fv.line})`);
    ok(finalVerdict([{ status: 'N/A' }, { status: 'PENDING', step: 'M4' }], {}).code === 2, 'D3: all rows pending or n/a is INCOMPLETE');
    ok(finalVerdict([{ status: 'OK' }, { status: 'PENDING', step: 'M4' }], {}).code === 0, 'D3: one checked row and pending rows is OK');
    ok(finalVerdict([{ status: 'CACHED' }], {}).code === 0, 'D3: a cached row counts as checked');
    ok(finalVerdict([{ id: 'x', status: 'ERROR' }, { status: 'OK' }], {}).code === 1, 'an ERROR row fails');
    ok(finalVerdict([{ id: 'x', status: 'RED' }], { reportOnly: true }).code === 0 && /WOULD FAIL/.test(finalVerdict([{ id: 'x', status: 'RED' }], { reportOnly: true }).line), '--report-only: a red row exits 0 and never prints OK');
    ok(finalVerdict([], { reach: true }).code === 0, 'an --affected reach of 0 rows is OK (nothing reached)');
    // 10. N10: the cache key changes with the row's baseline entry
    // 11. the slice (owner 2026-10-23): a partition, stable as rows are appended; --seventh d = --slice <d+1>/7
    const sl = (list, i, n) => selectRows(list, { slice: { i, n } }).map((r) => r.id);
    let sliced = 0; const where = new Map();
    for (let i = 1; i <= 28; i++) for (const id of sl(many, i, 28)) { sliced++; where.set(id, i); }
    ok(sliced === 50 && where.size === 50, 'slices: every row in exactly one of 28 slices');
    const grown = [...many, ...Array.from({ length: 30 }, (_, i) => ({ id: 'new' + i, kind: 'single', name: 'x' }))];
    ok(many.every((r) => sl(grown, where.get(r.id), 28).includes(r.id)), 'slices: appending rows never moves an existing row to another slice');
    // slices x shards are independent: every (slice, shard) cell of a large set holds rows (FNV's low bits were not)
    const big = Array.from({ length: 4000 }, (_, i) => ({ id: `cat:skill${i}|single/row${i % 16}`, kind: 'single', name: 'x' }));
    let emptyCells = 0;
    for (let i = 1; i <= 28; i++) for (let j = 1; j <= 2; j++) if (!selectRows(big, { slice: { i, n: 28 }, shard: { i: j, n: 2 } }).length) emptyCells++;
    ok(emptyCells === 0, `slices x shards: no empty (slice, shard) cell over 4000 rows (${emptyCells} empty)`);
    ok(JSON.stringify(selectRows(many, { seventh: 2 })) === JSON.stringify(selectRows(many, { slice: { i: 3, n: 7 } })), '--seventh 2 is --slice 3/7');
    const shardOf = new Map(); for (let i = 1; i <= 4; i++) for (const r of selectRows(many, { shard: { i, n: 4 } })) shardOf.set(r.id, i);
    ok([1, 2, 3, 4].every((i) => selectRows(grown, { shard: { i, n: 4 } }).filter((r) => shardOf.has(r.id)).every((r) => shardOf.get(r.id) === i)), 'shards: a row\'s shard does not depend on the other rows selected');
    ok(JSON.stringify(selectRows(many, { slice: { i: 1, n: 28 }, extraIds: new Set(['row7']) }).map((r) => r.id)) === JSON.stringify([...new Set([...sl(many, 1, 28), 'row7'])].sort()), 'D1.2: --red-from ids are added to the slice selection');
    ok(selectRows(many, { extraIds: new Set(['row3', 'nosuch']) }).map((r) => r.id).join() === 'row3', 'D1.2: red ids alone select only those rows');
    // 12. D1.1: the folded state - a row stays red until a later run lists it OK
    const fdir = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-fold-'));
    const wr = (f, rowsList, red) => fs.writeFileSync(path.join(fdir, f), JSON.stringify({ commit: 'c', finished: '2026-10-23T00:00:00Z', rows: rowsList.map(([id, status]) => ({ id, status })), red: red || rowsList.filter(([, st]) => RED_STATES.has(st)).map(([id]) => id) }));
    wr('2026-10-21.json', [['a', 'RED'], ['b', 'OK'], ['c', 'ERROR']]);
    wr('2026-10-22.json', [['b', 'OK']]);
    wr('2026-10-22T0900.shard-1-of-2.json', [['c', 'OK']]);
    wr('2026-10-22T0900.shard-2-of-2.json', [['d', 'OK']], ['e']);
    let fo = foldRuns(fdir);
    ok(fo.red.join() === 'a,e', `D1.1: RED persists across runs that did not select it; ERROR cleared by a later OK; a red-list-only id is red (${fo.red.join()})`);
    ok(fo.rows.get('a').stamp === '2026-10-21', 'D1.1: a row\'s state names the run it went red in');
    wr('2026-10-23.json', [['a', 'OK'], ['e', 'OK']]);
    fo = foldRuns(fdir);
    ok(fo.red.length === 0, `D1.1: a later run that lists the row OK clears it (${fo.red.join()})`);
    const extraF = path.join(fdir, 'inline.json');
    fs.writeFileSync(extraF, JSON.stringify({ rows: [{ id: 'b', status: 'RED' }], red: ['b'] }));
    ok(foldRuns(fdir, [extraF]).red.join() === 'b', 'D1.1: an extra (inline) run file is folded last');
    fs.writeFileSync(path.join(fdir, '2026-10-24.json'), '{not json');
    ok(foldRuns(fdir).bad.length === 1, 'D1.1: an unreadable run file is reported, not skipped silently');
    fs.rmSync(fdir, { recursive: true, force: true });
    // 13. the first-baseline marker (owner 2026-10-23)
    const bdir = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-bc-'));
    ok(!baselineComplete(bdir).complete, 'baseline: an empty directory is not complete');
    for (let i = 1; i <= 27; i++) fs.writeFileSync(path.join(bdir, `baseline.slice-${i}-of-28.json`), '{"rows":{}}');
    ok(!baselineComplete(bdir).complete && /27 of 28/.test(baselineComplete(bdir).how), `baseline: 27 of 28 slices is not complete (${baselineComplete(bdir).how})`);
    fs.writeFileSync(path.join(bdir, 'baseline.slice-28-of-28.json'), '{"rows":{"x":{"S":{}}}}');
    ok(baselineComplete(bdir).complete, 'baseline: all 28 slices is complete');
    ok(loadBaseline(path.join(bdir, 'baseline.json')).rows.x, 'baseline: slice files are merged by readers');
    fs.rmSync(bdir, { recursive: true, force: true });
    const cdir = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-bc-'));
    fs.writeFileSync(path.join(cdir, 'baseline.json'), '{"complete":true,"rows":{}}');
    ok(baselineComplete(cdir).complete, 'baseline: baseline.json complete: true is complete');
    fs.rmSync(cdir, { recursive: true, force: true });
    // 14. N1: finding keys - a new finding of the same rule on the same row replacing a fixed one is caught
    const fA = { lint: 'L-INK', rule: 'INK-1', page: 2, key: 'pdf text #ff0000', msg: 'x' };
    const fB = { lint: 'L-INK', rule: 'INK-1', page: 2, key: 'pdf fill #00ff00', msg: 'y' };
    const kOf = (fs_) => { const m = {}; for (const f of fs_) { const k = findingKey(f); m[k] = (m[k] || 0) + 1; } return m; };
    const pinnedRow = { id: 's', status: 'OK', noBaseline: false, sizes: { S: { counts: { 'L-INK INK-1': 1 }, keys: kOf([fA]) }, M: { counts: {}, keys: {} }, L: { counts: {}, keys: {} } } };
    const nb = { rows: {} }; pinRows(nb, [pinnedRow]);
    const swapped = { id: 's', sizes: { S: { counts: { 'L-INK INK-1': 1 }, keys: kOf([fB]) }, M: { counts: {}, keys: {} }, L: { counts: {}, keys: {} } } };
    verdict(swapped, nb);
    ok(swapped.status === 'RED' && /new finding/.test(swapped.rises.join()), `N1: a swapped finding of the same rule on the same row is RED (${swapped.status} ${swapped.rises})`);
    const same = { id: 's', sizes: { S: { counts: { 'L-INK INK-1': 1 }, keys: kOf([{ ...fA, msg: 'moved 3 mm' }]) }, M: { counts: {}, keys: {} }, L: { counts: {}, keys: {} } } };
    verdict(same, nb);
    ok(same.status === 'OK', 'N1: the same finding (its message changed) stays OK');
    const legacy = { rows: { s: { S: { 'L-INK INK-1': 1 } } } };
    const swapped2 = { id: 's', sizes: swapped.sizes }; verdict(swapped2, legacy);
    ok(swapped2.status === 'OK', 'N1: an entry pinned before N1 (counts only) is still compared by counts');
    ok(findingKey({ lint: 'L-INK', rule: 'INK-5', page: 1, key: 'solid 12.5 mm' }) === findingKey({ lint: 'L-INK', rule: 'INK-5', page: 1, key: 'solid 13 mm' }), 'N1: numbers in a key are normalised');
    ok(baselineKey(null, 'r') === 'none' && baselineKey({ rows: {} }, 'r') !== 'none' && baselineKey({ rows: { r: { S: { a: 1 } } } }, 'r') !== baselineKey({ rows: {} }, 'r'), 'N10: the cache key differs with and without --baseline and with the row\'s pinned counts');
    // 15. BASELINE INVARIANTS, case by case (critic r3 D1 and its two reproduce cases, at the code the main path runs)
    const inv = invariantCases();
    n += inv.n; bad.push(...inv.bad);
    // 16. BASELINE INVARIANTS as properties over generated sequences of nights (runs / pins / regressions / re-pins)
    const prop = propertyTest({ sequences: 300, nights: 12, seed: 20261023 });
    n += prop.n; bad.push(...prop.bad);
    console.log(`  property test: ${prop.sequences} sequences, ${prop.nights} nights, ${prop.rowChecks} row-night checks (${prop.modes}); I1 ${prop.c.I1} / I2 ${prop.c.I2} / I3 ${prop.c.I3} / I4 ${prop.c.I4} / I5 ${prop.c.I5} / truth ${prop.c.truth} / D2 ${prop.c.D2} (a run under another name, then a nightly-named run the same date) / N2 ${prop.c.N2} / N3 ${prop.c.N3} cases checked, ${prop.violations} violation(s)`);
    if (bad.length) { console.error(`${TOOL}: FAIL - ${bad.length} self-test(s)`); bad.forEach((b) => console.error('  - ' + b)); process.exit(1); }
    console.log(`${TOOL}: OK (self-test, ${n} assertions)`);
}

/* ============================================================================ the baseline invariants, tested */

const RULE = 'L-DENSITY PG-23';
/** A synthetic printed row's sizes from its true state {n findings at S of one rule, under key k; err = a render error}. */
function simSizes(t) {
    if (t.err) return { S: { error: 'buildSheet threw (simulated)', counts: { 'L-SPLIT RENDER': 1 } }, M: { counts: {}, keys: {} }, L: { counts: {}, keys: {} } };
    return { S: { pages: 1, keyPages: 1, counts: t.n ? { [RULE]: t.n } : {}, keys: t.n ? { [`${RULE}|p1|${t.k}`]: t.n } : {} }, M: { pages: 1, keyPages: 1, counts: {}, keys: {} }, L: { pages: 1, keyPages: 1, counts: {}, keys: {} } };
}
const simRow = (id) => ({ id, skill: id.split('|')[0], kind: id.split('|')[1].split('/')[0], name: id.split('/')[1], args: [], skills: [id.split('|')[0]], pairs: [], status: 'RUN' });
const deep = (o) => JSON.parse(JSON.stringify(o));
/**
 * One simulated night, through the SAME functions the main path runs (selectRows, foldRuns, loadBaseline, verdict,
 * writePins, runFile): `mode` write-baseline (a first-baseline slice night) | pin-new (a steady night) | plain (a
 * deploy / builder run with --baseline, no pin) | repin (the lead's --repin ids --reason). Every mode but repin
 * re-selects the fold's red rows (--red-from). Writes <dir>/<file> (default <stamp>.json; critic r4 D2: any name, with
 * `finished` = `finished` or the stamp's time), the run file BEFORE the pins (N5). `dirty` marks the run file dirty (N3);
 * `foreignBf` judges a plain run against another directory's baseline (N2). Returns what the properties need.
 */
function simNight(dir, { ids, truth, mode, slice, repinIds = null, stamp, rowsOnly = null, file = null, finished = null, dirty = false, foreignBf = null }) {
    const bf = path.join(dir, 'baseline.json');
    const all = ids.map(simRow);
    const fold = foldRuns(dir);
    let redIds = null, sel;
    if (mode === 'repin') sel = all.filter((r) => repinIds.includes(r.id));
    else {
        redIds = new Set(fold.red.filter((id) => ids.includes(id)));
        sel = rowsOnly ? all.filter((r) => rowsOnly.includes(r.id) || redIds.has(r.id)) : selectRows(all, { slice, extraIds: redIds });
    }
    for (const r of sel) r.sizes = simSizes(truth[r.id]);
    const judgeBf = foreignBf && mode === 'plain' ? foreignBf : bf;
    const base = loadBaseline(judgeBf);
    const pinMode = mode === 'plain' ? null : mode;
    const reason = 'simulated re-pin, named per row';
    const pinRes = judgeAndPin(sel, base, pinMode ? { rows: sel, mode: pinMode, bf, slice: mode === 'write-baseline' ? slice : null, redIds, repinIds, reason, commit: 'sim' } : null);
    const now = finished ? new Date(finished) : new Date(`${stamp.slice(0, 10)}T${stamp.length > 10 ? `${stamp.slice(11, 13)}:${stamp.slice(13, 15)}` : '01:13'}:00Z`);
    const rf = runFile(sel, { started: now.toISOString(), commit: 'sim', dirty, P: { source: 'sim' }, printHash: 'sim', ONLY: ['sim'], aff: null, slice: mode === 'write-baseline' || mode === 'pin-new' ? slice : null, shard: null, kinds: null, names: null, timing: null, live: [], refused: pinRes ? pinRes.refused : [], redFrom: redIds ? dir : null, redIds, affReached: null, pinMode, pinRes, reason, now, base, baseRecord: baselineRecord(judgeBf, base) });
    writeAtomic(path.join(dir, file || `${stamp}.json`), JSON.stringify(rf));
    if (pinRes) pinRes.flush();   // N5: the pins after the run file
    return { sel, redIds, rf };
}

/** 15. The invariants case by case, on temporary directories. Returns {n, bad}. */
function invariantCases() {
    const bad = []; let n = 0;
    const ok = (c, m) => { n++; if (!c) bad.push(m); };
    const R = 'subtraction:sub_50_no_regroup|single/layout-timed';
    const others = ['a:x|single/defaults', 'a:x|single/pages-3', 'b:y|single/defaults', 'b:y|single/ex-top', 'c:z|single/defaults'];
    const ids = [R, ...others];
    const sliceOf = (id, nn) => (h32('slice:' + id) % nn) + 1;
    const zero = { S: {}, M: {}, L: {} };
    const mk = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mq-inv-'));
    const truth0 = () => Object.fromEntries(ids.map((id) => [id, { n: 0, k: 'a', err: false }]));
    // critic r3 reproduce 1: a row pinned in baseline.json regresses before its slice's night
    let d = mk();
    fs.writeFileSync(path.join(d, 'baseline.json'), JSON.stringify({ rows: { [R]: zero } }));
    let truth = truth0(); truth[R] = { n: 2, k: 'dense', err: false };
    const s3 = { i: sliceOf(R, 28), n: 28 };
    let night = simNight(d, { ids, truth, mode: 'write-baseline', slice: s3, stamp: '2026-10-23' });
    const rrow = night.rf.rows.find((r) => r.id === R);
    ok(rrow && rrow.status === 'RED' && night.rf.red.includes(R), `I1/I3 reproduce 1: a pinned row that regressed is RED in the slice night's run file (${rrow && rrow.status}, red ${night.rf.red})`);
    const slFile = readJson(path.join(d, `baseline.slice-${s3.i}-of-28.json`), { rows: {} });
    ok(!slFile.rows[R], 'I1 reproduce 1: the regressed row is NOT pinned into the slice file');
    ok(fs.existsSync(path.join(d, `baseline.slice-${s3.i}-of-28.json`)), 'the slice file is written even when it pins nothing new (the night is done)');
    ok(foldRuns(d).red.includes(R), 'I5 reproduce 1: the fold keeps the row red');
    ok(canon(loadBaseline(path.join(d, 'baseline.json')).rows[R]) === canon(zero), 'I1 reproduce 1: the merged entry is the pilot pin, unchanged');
    fs.rmSync(d, { recursive: true, force: true });
    // critic r3 reproduce 2: a red row re-selected by a later baseline night (its entry in a file that sorts first)
    d = mk();
    fs.writeFileSync(path.join(d, 'baseline.added.json'), JSON.stringify({ rows: { [R]: zero } }));
    fs.writeFileSync(path.join(d, '2026-10-22.json'), JSON.stringify({ commit: 'c', finished: '2026-10-22T02:00:00Z', rows: [{ id: R, status: 'RED', kind: 'single', args: [] }], red: [R] }));
    truth = truth0(); truth[R] = { n: 2, k: 'dense', err: false };
    const s4 = { i: (sliceOf(R, 28) % 28) + 1, n: 28 };
    night = simNight(d, { ids, truth, mode: 'write-baseline', slice: s4, stamp: '2026-10-23' });
    ok(night.redIds.has(R) && night.rf.rows.find((r) => r.id === R).status === 'RED', 'I2 reproduce 2: the re-selected red row stays RED on the baseline night');
    ok(!readJson(path.join(d, `baseline.slice-${s4.i}-of-28.json`), { rows: {} }).rows[R], 'I2 reproduce 2: the re-selected red row is not pinned into the later slice file');
    night = simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-24' });
    ok(night.rf.rows.find((r) => r.id === R).status === 'RED' && foldRuns(d).red.includes(R), 'I5 reproduce 2: the next re-run of the red row is still RED, and the fold keeps it');
    // the fix clears it: a later run OK against the existing entry
    truth[R] = { n: 0, k: 'dense', err: false };
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-25' });
    ok(!foldRuns(d).red.includes(R), 'I5: a later run OK against the existing entry clears the row');
    // I1 --repin: the explicit per-row re-pin rewrites the OWNER file, logs date + reason + the old pin; the run says RED (I3), the fold says REPINNED
    truth[R] = { n: 3, k: 'dense', err: false };
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-26' });
    ok(foldRuns(d).red.includes(R), 'a new regression is red again');
    night = simNight(d, { ids, truth, mode: 'repin', repinIds: [R], stamp: '2026-10-26T1200' });
    const owner = readJson(path.join(d, 'baseline.added.json'), { rows: {} }).rows[R];
    ok(owner && owner.S[RULE] === 3 && owner.repinned && owner.repinned.length === 1 && owner.repinned[0].reason === 'simulated re-pin, named per row' && canon(owner.repinned[0].before) === canon(zero) && /^\d{4}-\d{2}-\d{2}$/.test(owner.repinned[0].date), `I1 --repin: the entry is rewritten in the file that owns it, with date, reason and the pin it replaced (${JSON.stringify(owner && owner.repinned)})`);
    const rp = night.rf.rows.find((r) => r.id === R);
    ok(rp.status === 'RED' && rp.repinned && !night.rf.red.includes(R), 'I3 --repin: the run file keeps the RED judged before the re-pin, marks it repinned, and leaves it out of `red`');
    ok(!foldRuns(d).red.includes(R) && foldRuns(d).rows.get(R).status === 'REPINNED', 'I5 --repin: the fold clears a re-pinned row (REPINNED)');
    ok(loadBaseline(path.join(d, 'baseline.json')).conflicts.length === 0 && loadBaseline(path.join(d, 'baseline.json')).duplicates.length === 0, 'I4 --repin: the re-pin never creates a second copy of the row');
    fs.rmSync(d, { recursive: true, force: true });
    // --repin of a row that did not print is refused
    d = mk();
    truth = truth0(); truth[R] = { n: 0, k: 'a', err: true };
    night = simNight(d, { ids, truth, mode: 'repin', repinIds: [R], stamp: '2026-10-23' });
    ok(night.rf.baselineWrite && night.rf.baselineWrite.pinned.length === 0 && night.rf.red.includes(R) && !fs.existsSync(path.join(d, 'baseline.json')), '--repin of an ERROR row is refused and the row stays red');
    fs.rmSync(d, { recursive: true, force: true });
    // I4: two files, different contents -> refused naming both; identical -> a warning only
    d = mk();
    fs.writeFileSync(path.join(d, 'baseline.json'), JSON.stringify({ rows: { [R]: zero } }));
    fs.writeFileSync(path.join(d, 'baseline.slice-3-of-28.json'), JSON.stringify({ rows: { [R]: { S: { [RULE]: 2 }, M: {}, L: {} } } }));
    let lb = loadBaseline(path.join(d, 'baseline.json'));
    const ce = baselineConflictError(lb) || '';
    ok(lb.conflicts.length === 1 && /baseline\.json and baseline\.slice-3-of-28\.json/.test(ce), `I4: a row pinned in two files with different contents is a conflict naming both files (${ce.slice(0, 160)})`);
    let threw = '';
    try { writePins({ rows: [], mode: 'pin-new', bf: path.join(d, 'baseline.json') }); } catch (e) { threw = e.message; }
    ok(/I4/.test(threw), 'I4: a baseline write refuses a conflicting merged baseline');
    fs.writeFileSync(path.join(d, 'baseline.slice-3-of-28.json'), JSON.stringify({ rows: { [R]: { L: {}, M: {}, S: {} } } }));
    lb = loadBaseline(path.join(d, 'baseline.json'));
    ok(lb.conflicts.length === 0 && lb.duplicates.length === 1 && !baselineConflictError(lb), 'I4: an identical duplicate (any key order) is a warning, not a conflict');
    fs.rmSync(d, { recursive: true, force: true });
    // fold: RED then printed with no entry (PENDING(no-baseline)) is not a fix; ERROR stays ERROR; PENDING(step) / N/A clear
    d = mk();
    const wrf = (f, list) => fs.writeFileSync(path.join(d, f), JSON.stringify({ commit: 'c', finished: `${f.slice(0, 10)}T02:00:00Z`, rows: list.map(([id, status, step]) => ({ id, status, step })), red: list.filter(([, s]) => RED_STATES.has(s)).map(([id]) => id) }));
    wrf('2026-10-20.json', [['p', 'RED'], ['q', 'ERROR'], ['s', 'RED']]);
    wrf('2026-10-21.json', [['p', 'PENDING', 'no-baseline'], ['q', 'PENDING', 'no-baseline'], ['s', 'N/A']]);
    let fo = foldRuns(d);
    ok(fo.red.join() === 'p,q,s' && fo.rows.get('p').lastSeenAs === 'PENDING(no-baseline)', `I5: a red row printed later with no entry stays red (${fo.red.join()})`);
    ok(fo.rows.get('s').status === 'RED' && fo.rows.get('s').lastSeenAs === 'N/A' && fo.rows.get('s').notRerun, `N9 (critic r4): a red row that turns N/A stays red, "not re-run (now N/A)" (${JSON.stringify(fo.rows.get('s'))})`);
    // N1: retire (and N9: a red row last seen N/A is retired the same way)
    fs.writeFileSync(path.join(d, 'retire.json'), JSON.stringify({ tool: TOOL, kind: 'retire', commit: 'c', finished: '2026-10-22T03:00:00Z', rows: [{ id: 'p', status: 'RETIRED', reason: 'option removed' }, { id: 's', status: 'RETIRED', reason: 'layout gone' }], red: [] }));
    fo = foldRuns(d);
    ok(fo.red.join() === 'q' && fo.rows.get('p').status === 'RETIRED' && fo.rows.get('s').status === 'RETIRED', `N1: a RETIRED record (a run file under any name, N5) clears the gone row (${fo.red.join()})`);
    // N5: what is folded and what is skipped, by content not name
    fs.writeFileSync(path.join(d, 'e1-check.json'), JSON.stringify({ tool: TOOL, commit: 'c', rows: [{ id: 'q', status: 'OK' }] }));
    fs.writeFileSync(path.join(d, 'baseline.json'), JSON.stringify({ rows: {} }));
    fs.writeFileSync(path.join(d, 'notes.json'), '{oops');
    fo = foldRuns(d);
    const sk = Object.fromEntries(fo.skipped.map((x) => [path.basename(x.file), x]));
    ok(fo.files.some((f) => path.basename(f.file) === 'retire.json' && f.named === false), 'N5: a run file under another name is folded (commit + finished + rows)');
    ok(sk['e1-check.json'] && /no finished/.test(sk['e1-check.json'].why) && !sk['e1-check.json'].known && sk['baseline.json'] && sk['baseline.json'].known && sk['notes.json'] && /not JSON/.test(sk['notes.json'].why), `N5: skipped files are listed with why (${fo.skipped.map((x) => `${path.basename(x.file)}: ${x.why}`).join('; ')})`);
    ok(foldSkipNote(fo).some((l) => /WARNING skipped e1-check\.json/.test(l)) && foldSkipNote(fo).some((l) => /folded 1 run file\(s\) not named/.test(l)), 'N5: the note warns of each unknown skipped file and names the run files folded under other names');
    ok(fo.red.join() === 'q', 'N5: a file without finished cannot clear a red row');
    fs.rmSync(d, { recursive: true, force: true });
    // critic r4 D2: EVERY run file is ordered by `finished`, whatever its name (the critic's reproduce, node only)
    d = mk();
    const wrun = (f, fin, list, extra = {}) => fs.writeFileSync(path.join(d, f), JSON.stringify({ commit: 'c', ...(fin ? { finished: fin } : {}), baseline: null, rows: list.map(([id, status]) => ({ id, status })), red: list.filter(([, s]) => RED_STATES.has(s)).map(([id]) => id), ...extra }));
    wrun('2026-10-22.json', '2026-10-22T02:00:00Z', [[R, 'OK']]);
    wrun('lane-check.json', '2026-10-23T00:30:00Z', [[R, 'OK']]);
    wrun('2026-10-23.json', '2026-10-23T02:10:00Z', [[R, 'RED']]);
    fo = foldRuns(d);
    ok(fo.red.includes(R) && fo.files.map((f) => path.basename(f.file)).join() === '2026-10-22.json,lane-check.json,2026-10-23.json', `D2: lane-check.json (finished 00:30, OK) is older than 2026-10-23.json (02:10, RED): the row stays RED (order ${fo.files.map((f) => path.basename(f.file)).join(' -> ')}, red ${fo.red.join()})`);
    wrun('2026-10-24.json', null, [[R, 'OK']]);
    ok(!foldRuns(d).red.includes(R) && path.basename(foldRuns(d).files.slice(-1)[0].file) === '2026-10-24.json', 'D2: a nightly-named file with no finished is ordered by its name (00:00 UTC of its date)');
    fs.rmSync(d, { recursive: true, force: true });
    d = mk();
    wrun('lane-check.json', '2026-10-23T00:30:00Z', [[R, 'RED']]);
    wrun('2026-10-23.json', '2026-10-23T02:10:00Z', [[R, 'OK']]);
    wrun('2026-10-23T0100.json', '2026-10-23T03:00:00Z', [['other', 'OK']]);
    ok(!foldRuns(d).red.includes(R), 'D2 (reverse): an earlier lane RED and a later nightly OK is cleared (no false refusal)');
    fs.rmSync(d, { recursive: true, force: true });
    // critic r4 N2: an OK judged against ANOTHER baseline does not clear a red row (scenario B, through simNight)
    d = mk();
    const other = mk();
    fs.writeFileSync(path.join(d, 'baseline.json'), JSON.stringify({ rows: { [R]: zero } }));
    fs.writeFileSync(path.join(other, 'baseline.json'), JSON.stringify({ rows: { [R]: { S: { [RULE]: 9 }, M: {}, L: {} } } }));
    truth = truth0(); truth[R] = { n: 2, k: 'dense', err: false };
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-23' });
    ok(foldRuns(d).red.includes(R), 'N2: the row is RED against its entry of 0');
    night = simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-24', foreignBf: path.join(other, 'baseline.json') });
    fo = foldRuns(d);
    ok(night.rf.rows.find((x) => x.id === R).status === 'OK' && night.rf.baseline && night.rf.baseline.dir === path.relative(ROOT, other), `N2: the run judged against the other baseline (9) lists it OK and records that baseline (${JSON.stringify(night.rf.baseline)})`);
    ok(fo.red.includes(R) && fo.ignored.some((x) => x.id === R && /not this directory's baseline/.test(x.why)) && foldWarnings(fo).some((l) => /2026-10-24\.json lists 1 red row/.test(l)), `N2: that OK does not clear the red row; the fold warns and ignores it (${fo.red.join()}; ${foldWarnings(fo).join(' | ')})`);
    // the same directory, the row's entry key matches: clears
    truth[R] = { n: 0, k: 'dense', err: false };
    night = simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-10-25' });
    ok(!foldRuns(d).red.includes(R) && night.rf.rows.find((x) => x.id === R).baselineKey === baselineKey(loadBaseline(path.join(d, 'baseline.json')), R), 'N2: an OK judged against this directory\'s current entry (recorded key = current key) clears');
    // a hand-made OK in this dir whose key is stale: clears only when its findings, re-judged, do not rise
    const recHere = { file: path.relative(ROOT, path.join(d, 'baseline.json')), dir: path.relative(ROOT, d) };
    wrun('2026-10-26.json', '2026-10-26T02:00:00Z', [[R, 'RED']], { baseline: recHere });
    fs.writeFileSync(path.join(d, '2026-10-27.json'), JSON.stringify({ commit: 'c', finished: '2026-10-27T02:00:00Z', baseline: recHere, red: [], rows: [{ id: R, status: 'OK', baselineKey: 'stale0000000000', sizes: simSizes({ n: 2, k: 'dense' }) }] }));
    ok(foldRuns(d).red.includes(R), 'N2: a stale key whose findings rise above the current entry does not clear');
    fs.writeFileSync(path.join(d, '2026-10-28.json'), JSON.stringify({ commit: 'c', finished: '2026-10-28T02:00:00Z', baseline: recHere, red: [], rows: [{ id: R, status: 'OK', baselineKey: 'stale0000000000', sizes: simSizes({ n: 0, k: 'dense' }) }] }));
    ok(!foldRuns(d).red.includes(R), 'N2: a stale key whose findings do not rise (re-judged against the current entry) clears');
    // REPINNED with a key that is not the current entry's does not clear; legacy (no baseline field) clears and is listed
    wrun('2026-10-29.json', '2026-10-29T02:00:00Z', [[R, 'RED']], { baseline: recHere });
    fs.writeFileSync(path.join(d, '2026-10-30.json'), JSON.stringify({ commit: 'c', finished: '2026-10-30T02:00:00Z', baseline: recHere, red: [], rows: [{ id: R, status: 'RED', repinned: { date: '2026-10-30', reason: 'x', key: 'notthecurrent00' } }] }));
    fo = foldRuns(d);
    ok(fo.red.includes(R) && fo.ignored.some((x) => x.status === 'REPINNED'), 'N2: a REPINNED record whose entry is not the current one does not clear (scenario C)');
    fs.writeFileSync(path.join(d, '2026-10-31.json'), JSON.stringify({ commit: 'c', finished: '2026-10-31T02:00:00Z', red: [], rows: [{ id: R, status: 'OK' }] }));
    fo = foldRuns(d);
    ok(!fo.red.includes(R) && fo.legacyClears.some((x) => x.id === R) && foldWarnings(fo).some((l) => /records no baseline \(written before N2\)/.test(l)), 'N2: a run file written before N2 (no baseline field) clears as before, and the fold lists it');
    fs.rmSync(other, { recursive: true, force: true });
    // critic r4 N3: a dirty run file never clears a red row (it can still make one red)
    truth[R] = { n: 3, k: 'dense', err: false };
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-11-01' });
    truth[R] = { n: 0, k: 'dense', err: false };
    night = simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-11-02', dirty: true });
    fo = foldRuns(d);
    ok(night.rf.dirty && fo.red.includes(R) && fo.ignored.some((x) => /dirty/.test(x.why)), 'N3: a dirty run listing the row OK does not clear it');
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-11-03' });
    ok(!foldRuns(d).red.includes(R), 'N3: the next clean run OK clears it');
    truth[R] = { n: 4, k: 'dense', err: false };
    simNight(d, { ids, truth, mode: 'plain', rowsOnly: [R], stamp: '2026-11-04', dirty: true });
    ok(foldRuns(d).red.includes(R), 'N3: a dirty run can make a row red');
    // critic r4 N9: a row with a baseline entry whose newest state is N/A is flagged
    fs.writeFileSync(path.join(d, '2026-11-05.json'), JSON.stringify({ commit: 'c', finished: '2026-11-05T02:00:00Z', baseline: recHere, red: [], rows: [{ id: R, status: 'N/A', reason: 'no layout' }] }));
    fo = foldRuns(d);
    ok(fo.red.includes(R) && fo.rows.get(R).lastSeenAs === 'N/A' && fo.pinnedNA.includes(R) && foldWarnings(fo).some((l) => /with a baseline entry are N\/A now/.test(l)), `N9: a red pinned row that turns N/A stays red and is flagged (${foldWarnings(fo).join(' | ')})`);
    fs.rmSync(d, { recursive: true, force: true });
    // critic r4 N4: a narrowed --slice --write-baseline writes the .partial file, which never marks the slice done
    d = mk();
    const bfN = path.join(d, 'baseline.json');
    for (let i = 1; i <= 28; i++) if (i !== 3) fs.writeFileSync(path.join(d, `baseline.slice-${i}-of-28.json`), '{"rows":{}}');
    const prow = { id: R, status: 'OK', noBaseline: false, sizes: simSizes({ n: 0, k: 'a' }) };
    let wp = writePins({ rows: [prow], mode: 'write-baseline', bf: bfN, slice: { i: 3, n: 28 }, partial: { skills: [R.split('|')[0]], kinds: null, rows: [R], shard: null } });
    // critic r4 N5: nothing is written before flush() (the caller writes the run file first)
    ok(!fs.existsSync(path.join(d, 'baseline.slice-3-of-28.partial.json')) && wp.writes.length === 1, 'N5: writePins writes nothing until flush() (the run file goes first)');
    wp.flush();
    ok(fs.existsSync(path.join(d, 'baseline.slice-3-of-28.partial.json')) && !fs.existsSync(path.join(d, 'baseline.slice-3-of-28.json')) && !baselineComplete(d).complete && loadBaseline(bfN).rows[R], `N4: the narrowed slice run writes baseline.slice-3-of-28.partial.json (merged by readers, slice 3 still missing: ${baselineComplete(d).how})`);
    wp = writePins({ rows: [{ ...prow, id: 'a:x|single/defaults' }], mode: 'write-baseline', bf: bfN, slice: { i: 3, n: 28 } });
    wp.flush();
    ok(baselineComplete(d).complete && !readJson(path.join(d, 'baseline.slice-3-of-28.json'), {}).partial, 'N4: the full slice night then writes baseline.slice-3-of-28.json and completes the baseline');
    ok(fs.readdirSync(d).every((f) => !/\.tmp-/.test(f)), 'N5: the writes are atomic (no temp file left)');
    fs.rmSync(d, { recursive: true, force: true });
    // N1: resolveRed - current, mapped (same kind + flags), retired, dead, outside
    const idx = { live: new Set(['a:x', 'b:y']), skills: new Set(['a:x']), rows: new Map([['a:x|single/more-cols2+short', { kind: 'single', args: ['--columns', '2', '--key-style', 'short'] }], ['a:x|single/defaults', { kind: 'single', args: [] }]]) };
    const fakeFold = { rows: new Map([['a:x|single/more-cols2+brief', { kind: 'single', args: ['--columns', '2', '--key-style', 'short'] }], ['a:x|single/more-oldname', { kind: 'single', args: ['--old-flag'] }]]) };
    const rr = resolveRed(['a:x|single/defaults', 'a:x|single/more-cols2+brief', 'a:x|single/more-oldname', 'z:gone|single/defaults', 'b:y|single/defaults'], fakeFold, idx);
    ok(rr.current.join() === 'a:x|single/defaults' && rr.mapped.length === 1 && rr.mapped[0].to === 'a:x|single/more-cols2+short' && rr.retired.map((x) => x.id).join() === 'a:x|single/more-oldname' && rr.dead.join() === 'z:gone|single/defaults' && rr.outside.join() === 'b:y|single/defaults', `N1: resolveRed sorts red ids (${JSON.stringify(rr)})`);
    return { n, bad };
}

/** mulberry32: a small seeded generator, so a failing sequence is reproducible from its seed. */
function rng32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/**
 * 16. The invariants as properties: random sequences of nights over a few synthetic rows, each row's truth drifting
 * (regressions, fixes, a finding swapped for another of the same rule, render crashes), a random pilot baseline at
 * the start, then the 28-night shape in miniature (write-baseline slice nights, with plain and re-pin nights mixed in,
 * then pin-new nights). After every night each invariant is checked against copies taken BEFORE it.
 */
function propertyTest({ sequences, nights, seed }) {
    const bad = []; let n = 0;
    const c = { I1: 0, I2: 0, I3: 0, I4: 0, I5: 0, truth: 0, D2: 0, N2: 0, N3: 0 };
    const modes = {};
    let rowChecks = 0, totalNights = 0, violations = 0;
    const fail = (m) => { violations++; if (bad.length < 12) bad.push(m); };
    const ids = ['p:a|single/defaults', 'p:a|single/ex-top', 'p:b|single/defaults', 'p:b|sections/pages-2', 'p:c|single/defaults', 'p:c|mixed/defaults', 'p:d|single/layout-timed'];
    const NS = 3;
    for (let q = 0; q < sequences; q++) {
        const rnd = rng32(seed + q * 7919);
        const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
        const d = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-prop-'));
        const bf = path.join(d, 'baseline.json');
        const truth = Object.fromEntries(ids.map((id) => [id, { n: Math.floor(rnd() * 3), k: 'a', err: rnd() < 0.1 }]));
        if (rnd() < 0.6) {   // a pilot baseline.json pinned before the nights (the 127 rows of 2026-10-23), some with keys
            const rows = {};
            for (const id of ids) if (rnd() < 0.5) { const e = { S: truth[id].n ? { [RULE]: truth[id].n } : {}, M: {}, L: {} }; if (rnd() < 0.5) e.keys = { S: truth[id].n ? { [`${RULE}|p1|a`]: truth[id].n } : {}, M: {}, L: {} }; rows[id] = e; }
            fs.writeFileSync(bf, JSON.stringify({ rows }));
        }
        let nextSlice = 1;
        const firstEntry = {};   // the entry each row was pinned with (changed only by --repin): the ground truth
        for (const [id, e] of Object.entries(loadBaseline(bf).rows)) firstEntry[id] = deep(e);
        // critic r4 N2: another directory's baseline, which some plain runs are judged against (scenario B)
        const fd = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-prop-other-'));
        fs.writeFileSync(path.join(fd, 'baseline.json'), JSON.stringify({ rows: Object.fromEntries(ids.filter(() => rnd() < 0.7).map((id) => [id, { S: { [RULE]: Math.floor(rnd() * 5) }, M: {}, L: {} }])) }));
        // critic r4 D2: run files under many names, finishing at times that interleave with the nightly's own names
        let clock = Date.parse('2026-11-01T00:10:00Z');
        let prevName = null;
        for (let t = 0; t < nights; t++) {
            // the day's changes
            for (const id of ids) {
                const x = truth[id];
                const r = rnd();
                if (r < 0.2) x.n++; else if (r < 0.35) x.n = Math.max(0, x.n - 1); else if (r < 0.42 && x.n) x.k = x.k === 'a' ? 'b' : 'a';
                if (rnd() < 0.08) x.err = !x.err;
            }
            let mode;
            const roll = rnd();
            if (roll < 0.12) mode = 'plain'; else if (roll < 0.22) mode = 'repin'; else mode = nextSlice <= NS ? 'write-baseline' : 'pin-new';
            const slice = mode === 'write-baseline' ? { i: nextSlice++, n: NS } : { i: 1 + Math.floor(rnd() * NS), n: NS };
            const repinIds = mode === 'repin' ? ids.filter(() => rnd() < 0.3) : null;
            if (mode === 'repin' && !repinIds.length) repinIds.push(pick(ids));
            modes[mode] = (modes[mode] || 0) + 1;
            const before = deep({ rows: loadBaseline(bf).rows });
            const foldBefore = foldRuns(d);
            // when this run finishes (always after the last one: files are written as runs finish) and its file name:
            // a nightly name (<date>.json, or <date>T<HHMM>.json with the START time when that exists) or another name
            clock += (rnd() < 0.6 ? 20 + rnd() * 460 : 480 + rnd() * 1320) * 60000;
            const fin = new Date(clock).toISOString();
            const date = fin.slice(0, 10);
            let file;
            if (rnd() < 0.55) {
                file = `${date}.json`;
                let start = Math.max(clock - Math.floor(rnd() * 90) * 60000, Date.parse(`${date}T00:00:00Z`));
                while (fs.existsSync(path.join(d, file)) && start >= Date.parse(`${date}T00:00:00Z`)) {
                    const s = new Date(start).toISOString();
                    file = `${date}T${s.slice(11, 13)}${s.slice(14, 16)}.json`;
                    start -= 60000;
                }
                if (fs.existsSync(path.join(d, file))) file = `zz-${t}.json`;
            } else file = pick([`lane-check-${t}.json`, `e1-check-${date}-${t}.json`, `pilot-baseline-${t}.json`, `aa-${t}.json`, `zz-${t}.json`]);
            const named = RUN_RE.test(file);
            if (named && prevName && !RUN_RE.test(prevName.file) && prevName.date === date) c.D2++;   // a lane file then a nightly the same day
            prevName = { file, date };
            const stamp = date;
            // N3 / N2: some plain runs are on a dirty tree, some judged against the other directory's baseline
            const r2 = mode === 'plain' ? rnd() : 1;
            const dirty = r2 < 0.3, foreign = r2 >= 0.3 && r2 < 0.6;
            let res;
            try { res = simNight(d, { ids, truth, mode, slice, repinIds, stamp, file, finished: fin, dirty, foreignBf: foreign ? path.join(fd, 'baseline.json') : null }); } catch (e) { fail(`seq ${q} night ${t} (${mode}): threw ${e.message}`); break; }
            totalNights++;
            const after = loadBaseline(bf);
            const foldAfter = foldRuns(d);
            const runRow = new Map(res.rf.rows.map((r) => [r.id, r]));
            const repinned = new Set(res.rf.repinned || []);
            for (const id of repinned) firstEntry[id] = deep(after.rows[id]);
            for (const id of ids) {
                rowChecks++;
                const was = before.rows[id], now = after.rows[id];
                const rr = runRow.get(id);
                // I1: an existing entry changes only by an explicit re-pin of that row; a new entry only for a row
                // this run pinned (a pinning mode, the row had no entry)
                c.I1++;
                if (was && !repinned.has(id) && canon(was) !== canon(now)) fail(`I1 seq ${q} night ${t} (${mode}): ${id} had an entry and it changed without --repin`);
                if (!was && now && !(rr && mode !== 'plain' && (rr.pinned || repinned.has(id)))) fail(`I1 seq ${q} night ${t} (${mode}): ${id} gained an entry it was not pinned by this run`);
                if (was && rr && rr.pinned) fail(`I1 seq ${q} night ${t} (${mode}): ${id} had an entry and the run says it pinned it`);
                if (!was && now && !firstEntry[id]) firstEntry[id] = deep(now);
                // I2: a red-from row gets no pin
                if (res.redIds && res.redIds.has(id)) { c.I2++; if (canon(was || null) !== canon(now || null) || (rr && rr.pinned)) fail(`I2 seq ${q} night ${t} (${mode}): ${id} was re-selected as red and was pinned`); }
                // the verdict against THIS directory's merged baseline as it was before the night
                const probe = { id, sizes: simSizes(truth[id]) };
                verdict(probe, before);
                if (rr && !foreign) {
                    // I3: the run file's status is the verdict against the merged baseline BEFORE the night
                    c.I3++;
                    if (probe.status !== rr.status) fail(`I3 seq ${q} night ${t} (${mode}): ${id} recorded ${rr.status}, judged before the pin ${probe.status}`);
                }
                // I5: red -> not red only by OK against THIS directory's existing entry (or no findings at all), or a
                // re-pin; N3: never by a dirty run; N2: never by an OK judged against another baseline that is not OK
                // against this one
                const wasRed = foldBefore.red.includes(id), nowRed = foldAfter.red.includes(id);
                if (wasRed) {
                    c.I5++;
                    if (!rr && !nowRed) fail(`I5 seq ${q} night ${t} (${mode}): ${id} was red, did not run, and is no longer red`);
                    if (rr && !nowRed && !(rr.repinned || (probe.status === 'OK' && (was || !truth[id].n)))) fail(`I5 seq ${q} night ${t} (${mode}${foreign ? ', judged against another baseline' : ''}): ${id} left the red set as ${rr.status} (OK against this directory's entry: ${probe.status})`);
                    if (dirty) { c.N3++; if (!nowRed) fail(`N3 seq ${q} night ${t}: ${id} was red and a DIRTY run cleared it`); }
                    if (foreign && rr) c.N2++;
                }
                // ground truth: a row that ran tonight, printed, and has more findings (or another finding) than the
                // entry it was pinned with is red in the fold, unless it was re-pinned tonight; a row that did not
                // print is red. (A run judged against another directory's baseline is outside this: it judged nothing
                // here, and its OK clears nothing, checked above.)
                const fe = firstEntry[id];
                if (rr && was && fe && !truth[id].err && !repinned.has(id) && !foreign) {
                    const pinnedN = (fe.S || {})[RULE] || 0;
                    const keyed = fe.keys && fe.keys.S;
                    const rise = truth[id].n > pinnedN || (keyed && truth[id].n > (keyed[`${RULE}|p1|${truth[id].k}`] || 0));
                    if (rise) { c.truth++; if (!nowRed) fail(`truth seq ${q} night ${t} (${mode}): ${id} has ${truth[id].n} ${truth[id].k} against its pin ${JSON.stringify(fe.S)} and is not red in the fold`); }
                }
                if (rr && truth[id].err) { c.truth++; if (!nowRed) fail(`truth seq ${q} night ${t}: ${id} did not print and is not red`); }
            }
            // I4: the merged baseline never holds a row in two files
            c.I4++;
            if (after.conflicts.length || after.duplicates.length) fail(`I4 seq ${q} night ${t} (${mode}): ${after.conflicts.length} conflict(s), ${after.duplicates.length} duplicate(s)`);
        }
        fs.rmSync(d, { recursive: true, force: true });
        fs.rmSync(fd, { recursive: true, force: true });
    }
    for (const k of Object.keys(c)) { n++; if (!c[k]) bad.push(`property test: no ${k} case was generated`); }
    n++;
    if (violations) bad.push(`property test: ${violations} violation(s) in total (first ones above)`);
    return { n, bad, c, sequences, nights: totalNights, rowChecks, violations, modes: Object.entries(modes).map(([k, v]) => `${k} ${v}`).join(', ') };
}

/* ============================================================================ main */

const KINDS = ['single', 'sections', 'mixed', 'quiz'];
/**
 * D3: every name the caller gave must name something. Returns the error text, or null.
 * `all` = every row of the selected skills; `rows` = the rows selected; `reach` = --affected / --seventh given.
 */
function selectionError({ all, kinds, names, rows, reach }) {
    const badKinds = (kinds || []).filter((k) => !KINDS.includes(k));
    if (badKinds.length) return `unknown --kind ${badKinds.join(', ')} (${KINDS.join(', ')})`;
    const badNames = (names || []).filter((n) => !all.some((r) => r.id === n || `${r.kind}/${r.name}` === n));
    if (badNames.length) {
        const known = [...new Set(all.map((r) => `${r.kind}/${r.name}`))];
        return `unknown --rows ${badNames.join(', ')}: no row of the selected skill(s) has that name (rows: ${known.join(', ')})`;
    }
    if (!rows.length && !reach) return `the selection matched 0 rows (${[kinds && `--kind ${kinds.join(',')}`, names && `--rows ${names.join(',')}`].filter(Boolean).join(' ') || 'no filter'}): nothing would be checked`;
    return null;
}
/**
 * The last line (D3, N3): {line, code}. OK only when at least one row was checked (run or cached) and none is
 * RED / ERROR; rows selected but none checkable is INCOMPLETE (exit 2), never OK.
 */
function finalVerdict(rows, { reportOnly = false, summary = '', reach = false } = {}) {
    // a row re-pinned by --repin keeps the status it was judged with (I3), but it is not red: the lead re-pinned it
    const repinned = rows.filter((r) => r.repinned).length;
    if (repinned) summary = `${summary}; ${repinned} row(s) re-pinned by --repin (judged before the re-pin; logged in the entry)`;
    const st = (s) => rows.filter((r) => r.status === s && !r.repinned);
    const red = st('RED').length + st('ERROR').length;
    if (red) {
        const ids = [...st('ERROR'), ...st('RED')].slice(0, 5).map((r) => `${r.id} ${r.status}`).join('; ');
        return reportOnly ? { line: `${TOOL}: WOULD FAIL - ${red} red row(s) (${ids}) [report-only, exit 0]; ${summary}`, code: 0 } : { line: `${TOOL}: FAIL - ${red} red row(s) (${ids}); ${summary}`, code: 1 };
    }
    if (!rows.length) return { line: `${TOOL}: OK (nothing reached: ${reach ? 'the --affected / --slice / --red-from selection reaches no row' : 'no rows'}; ${summary})`, code: 0 };
    // a PENDING(no-baseline) row printed (no render error) and only lacks an entry to compare with: it counts as
    // checked for the verdict (owner 2026-10-23: rows with no baseline never hold the deploy), and is named
    const noBase = rows.filter((r) => r.status === 'PENDING' && r.step === 'no-baseline').length;
    const checked = st('OK').length + st('CACHED').length + noBase + repinned;
    if (noBase) summary = `${summary}; ${noBase} row(s) PENDING(no-baseline): printed, not judged`;
    if (!checked) {
        const why = {};
        for (const r of rows) { const k = r.status === 'PENDING' ? `PENDING(${r.step})` : r.status; why[k] = (why[k] || 0) + 1; }
        const what = Object.keys(why).every((k) => k.startsWith('PENDING')) ? 'pending' : 'pending or n/a';
        return { line: `${TOOL}: INCOMPLETE (all ${rows.length} rows ${what}: ${Object.entries(why).map(([k, n]) => `${k} x${n}`).join(', ')}; nothing checked)`, code: 2 };
    }
    return { line: `${TOOL}: OK (${summary})`, code: 0 };
}

const pad = (s, w) => String(s).padEnd(w);
function sizeCell(s) {
    if (!s) return '-';
    if (s.na) return 'n/a';
    if (s.pending) return 'pend';
    if (s.error) return 'ERR';
    const f = Object.values(s.counts || {}).reduce((a, b) => a + b, 0);
    return `${s.pages ?? '?'}+${s.keyPages ?? '?'}k ${f || '.'}`;
}
class UsageError extends Error {}

module.exports = { foldRuns, foldWarnings, baselineComplete, loadBaseline, baselineConflictError, baselineKey, resolveRed, rowIndexFor, foldSkipNote, RUN_RE, RED_STATES, inSlice, inShard, findingKey };
if (require.main === module) (async () => {
    if (has('self-test')) return selfTest();
    const t0 = Date.now();
    const started = new Date().toISOString();
    let commit = '?', dirty = false;
    try { commit = git('rev-parse', 'HEAD').trim(); dirty = git('status', '--porcelain', '--untracked-files=no').trim().length > 0; } catch (e) { /* not a git tree */ }
    // arguments first: a malformed one fails before anything loads (D3)
    const seventhArg = arg('seventh', null);
    if (seventhArg !== null && !/^\d+$/.test(seventhArg)) throw new UsageError(`--seventh ${seventhArg}: a whole number 0-6`);
    const seventh = seventhArg === null ? null : Number(seventhArg) % 7;
    const shardArg = arg('shard', null);
    const shardM = shardArg === null ? null : /^(\d+)\/(\d+)$/.exec(shardArg);
    if (shardArg !== null && !shardM) throw new UsageError(`--shard ${shardArg}: i/n, e.g. 3/8`);
    const shard = shardM ? { i: Number(shardM[1]), n: Number(shardM[2]) } : null;
    if (shard && !(shard.i >= 1 && shard.i <= shard.n)) throw new UsageError('--shard i/n with 1 <= i <= n');
    const sliceArg = arg('slice', null);
    const sliceM = sliceArg === null ? null : /^(\d+)\/(\d+)$/.exec(sliceArg);
    if (sliceArg !== null && !sliceM) throw new UsageError(`--slice ${sliceArg}: i/n, e.g. 3/28`);
    const slice = sliceM ? { i: Number(sliceM[1]), n: Number(sliceM[2]) } : null;
    if (slice && !(slice.i >= 1 && slice.i <= slice.n)) throw new UsageError('--slice i/n with 1 <= i <= n');
    if (slice && seventh !== null) throw new UsageError('--slice and --seventh together: --seventh d is --slice <d+1>/7; give one');
    const capArg = arg('affected-cap', null);
    if (capArg !== null && !/^\d+$/.test(capArg)) throw new UsageError(`--affected-cap ${capArg}: a whole number of documents`);
    const affectedCap = capArg === null ? null : Number(capArg);
    // D1.2: the rows RED / ERROR in the folded state of the run files are re-selected; --seventh / --slice (the
    // nightly's rotation) imply --red-from design/audit/matrix unless --red-from names another directory
    const redFrom = arg('red-from', null) || ((seventh !== null || slice) && !has('no-red-from') ? MATRIX_DIR : null);
    if (redFrom && !fs.existsSync(redFrom) && arg('red-from', null)) throw new UsageError(`--red-from ${redFrom}: no such directory`);
    if (has('pin-new') && has('write-baseline')) throw new UsageError('--pin-new and --write-baseline together: both pin only rows with no entry (I1); give one (they differ only in the file they write)');
    // I1: the explicit, named, per-row re-pin, and N1: the explicit retirement of a red row that no longer exists
    const listArg = (k) => (arg(k, null) ? arg(k, null).split(',').map((s) => s.trim()).filter(Boolean) : null);
    const repinIds = listArg('repin'), retireIds = listArg('retire');
    const reasonArg = arg('reason', null);
    for (const [flag, ids] of [['repin', repinIds], ['retire', retireIds]]) {
        if (!has(flag)) continue;
        if (!ids || !ids.length) throw new UsageError(`--${flag} <row ids>: give the full row ids (cat:skill|kind/row), comma-separated`);
        const badId = ids.filter((id) => !/^[^|:\s]+:[^|\s]+\|[a-z]+\/\S+$/.test(id));
        if (badId.length) throw new UsageError(`--${flag} ${badId.join(', ')}: not a full row id (cat:skill|kind/row)`);
        if (!reasonArg || reasonArg.trim().length < 8) throw new UsageError(`--${flag} needs --reason "<why>" (at least 8 characters): it is logged with the date${flag === 'repin' ? ' in each re-pinned entry' : ' in the run file'}`);
        const clash = ['slice', 'seventh', 'shard', 'affected', 'red-from', 'write-baseline', 'pin-new', 'max-docs', flag === 'repin' ? 'retire' : 'repin'].filter((k) => has(k));
        if (clash.length) throw new UsageError(`--${flag} is a lead's explicit per-row action, never part of a nightly or a deploy run: not with --${clash.join(', --')}`);
    }
    if (reasonArg !== null && !repinIds && !retireIds) throw new UsageError('--reason goes with --repin or --retire');
    const maxDocsArg = arg('max-docs', null);
    if (maxDocsArg !== null && !/^\d+$/.test(maxDocsArg)) throw new UsageError(`--max-docs ${maxDocsArg}: a whole number of documents`);
    const maxDocs = maxDocsArg === null ? null : Number(maxDocsArg);
    const kinds = arg('kind', null) ? arg('kind', null).split(',') : null;
    let names = arg('rows', null) ? arg('rows', null).split(',') : null;
    if (repinIds) {
        const outside = names ? repinIds.filter((id) => !names.includes(id)) : [];
        if (outside.length) throw new UsageError(`--repin ${outside.join(', ')}: not in --rows (give the full ids in both, or --repin alone)`);
        names = names || repinIds.slice();
    }

    const app = await loadApp();
    const live = liveSkills(app);
    let ONLY = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
    // --repin / --retire name full row ids: their skills are the selection when --skills is not given
    if (!ONLY.length && !has('all') && (repinIds || retireIds)) ONLY = [...new Set((repinIds || retireIds).map((id) => id.split('|')[0]))];
    if (retireIds) {
        const deadSkills = ONLY.filter((k) => !live.some((s) => s.key === k));
        if (deadSkills.length) throw new UsageError(`--retire: ${deadSkills.join(', ')} is not a live skill; the red rows of a skill that is not live are already ignored, nothing to retire`);
    }
    if (!ONLY.length && !has('all')) throw new UsageError('give --skills cat:skill,... or --all');
    const missing = ONLY.filter((k) => !live.some((s) => s.key === k));
    if (missing.length) throw new UsageError(`no such live skill: ${missing.join(', ')} (retired and unknown skills have no rows)`);
    const universe = ONLY.length ? ONLY.map((k) => live.find((s) => s.key === k)) : live;
    const P = loadPartners();
    const infoByKey = new Map();
    const need = new Set(universe.map((s) => s.key));
    for (const s of universe) for (const p of partnersFor(s.key, P)) need.add(p);
    for (const k of need) { const s = live.find((x) => x.key === k); if (!s) throw new Error(`partner ${k} (${P.source}) is not a live skill`); infoByKey.set(k, skillInfo(app, s)); }
    let all = universe.flatMap((s) => rowsFor(infoByKey.get(s.key), partnersFor(s.key, P)));
    for (const r of all) r.pairs = pairsOfRow(r, infoByKey);

    // --affected (by file, before M4)
    let affectedIds = null, aff = null;
    if (arg('affected', null)) {
        aff = affected(arg('affected', null));
        const reachAll = aff.files.some((f) => f.class === 'all');
        const pairSet = new Set(aff.files.filter((f) => f.class === 'pairs').flatMap((f) => f.pairs));
        affectedIds = new Set(all.filter((r) => r.kind !== 'quiz' && (reachAll || r.pairs.some((p) => pairSet.has(p)))).map((r) => r.id));
        console.log(`${TOOL}: --affected ${aff.A.slice(0, 8)}..${aff.B.slice(0, 8)}: ${aff.files.length} file(s)`);
        for (const f of aff.files) console.log(`  ${pad(f.class, 7)}${f.file}  (${f.why}${f.pairs ? `: ${f.pairs.length} pair(s)` : ''})`);
        console.log(`  rows reached: ${affectedIds.size} of ${all.filter((r) => r.kind !== 'quiz').length} print rows (${universe.length} skill(s))`);
        console.log('  M4 replay: not built (instance-data files reach every row until buildSheet record / replay narrows them by output)');
    }
    const affReached = affectedIds ? affectedIds.size : null;
    const index = { live: new Set(live.map((s) => s.key)), skills: new Set(universe.map((s) => s.key)), rows: new Map(all.map((r) => [r.id, { kind: r.kind, args: r.args }])) };
    const OUT0 = arg('out', null) || (repinIds || retireIds ? 'auto' : null);
    const outFile = OUT0 === 'auto' ? autoOut(shard) : OUT0 ? path.resolve(OUT0) : null;

    // N1: --retire <ids> --reason: a run file that lists each gone row RETIRED, so the fold stops holding it red
    if (retireIds) {
        const rdir = path.dirname(outFile);
        const rfold = foldRuns(rdir);
        const res = resolveRed(retireIds, rfold, index);
        // N9: a row of today that is red in the fold but was last seen N/A or PENDING(step) (a code change made it
        // uncheckable) can be retired: nothing else clears it, since it never runs OK again
        const stuck = (id) => { const st = rfold.rows.get(id); return st && RED_STATES.has(st.status) && st.notRerun ? st : null; };
        const live_ = res.current.filter((id) => !stuck(id)).map((id) => `${id} is a row today (fix it, or --repin it)`);
        const mapped = res.mapped.map((m) => `${m.from} maps to the current row ${m.to} (same kind and flags): its red state carries there, nothing to retire`);
        if (live_.length || mapped.length) throw new UsageError(`--retire refused: ${[...live_, ...mapped].join('; ')}`);
        if (dirty) throw new UsageError('--retire on a tree with local edits: a dirty run never clears a red row (N3); commit or stash first');
        const date = new Date().toISOString();
        const gone = [...res.retired, ...res.current.map((id) => ({ id, why: `red since run ${stuck(id).stamp}, last seen ${stuck(id).lastSeenAs} (not re-run, N9)` }))];
        const recs = gone.map((x) => ({ id: x.id, skill: x.id.split('|')[0], status: 'RETIRED', reason: reasonArg, retired: { date: date.slice(0, 10), reason: reasonArg, why: x.why, wasRed: (rfold.rows.get(x.id) || {}).status || 'not red in the fold' } }));
        writeAtomic(outFile, JSON.stringify({ tool: TOOL, kind: 'retire', date: date.slice(0, 10), started, finished: new Date().toISOString(), commit, dirty, baseline: null, selection: { retire: retireIds }, totals: { RETIRED: recs.length }, red: [], rows: recs }, null, 1) + '\n');
        for (const r of recs) console.log(`  RETIRED ${r.id} (${r.retired.wasRed}): ${r.retired.why}`);
        console.log(`wrote ${path.relative(process.cwd(), outFile)}`);
        console.log(`${TOOL}: OK (retired ${recs.length} row(s) that no longer exist: "${reasonArg}")`);
        return;
    }
    let redIds = null, fold = null;
    const aliases = new Map();
    if (redFrom) {
        fold = foldRuns(redFrom);
        const res = resolveRed(fold.red, fold, index);
        redIds = new Set(res.current);
        // N1: a renamed row (same skill, kind and flags) carries the red state: re-run under its new id, judged against
        // the old id's entry (aliased below once the baseline is loaded)
        for (const m of res.mapped) { redIds.add(m.to); aliases.set(m.to, m.from); }
        console.log(`${TOOL}: --red-from ${path.relative(process.cwd(), path.resolve(redFrom)) || '.'}: ${fold.red.length} RED / ERROR row(s) in the folded state of ${fold.files.length} run file(s); ${redIds.size} of them are rows of the selected skills${res.mapped.length ? ` (${res.mapped.length} under a new name)` : ''}${res.outside.length ? `, ${res.outside.length} outside the selected skills` : ''}${res.dead.length ? `, ${res.dead.length} of skills that are not live (ignored)` : ''}${res.retired.length ? `, ${res.retired.length} RETIRED-ROW` : ''}`);
        for (const m of res.mapped) console.log(`  MAPPED ${m.from} -> ${m.to} (the same kind and flags under a new name)`);
        for (const x of res.retired) console.log(`  RETIRED-ROW (warning) ${x.id}: ${x.why}. It holds nothing at deploy; clear it with: node tests/scripts/ws-coverage-matrix.cjs --retire '${x.id}' --reason "<why it is gone>"`);
        for (const b of fold.bad) console.log(`  unreadable run file ${b.file}: ${b.error}`);
        foldSkipNote(fold).forEach((l) => console.log(l));
        foldWarnings(fold).forEach((l) => console.log(`  WARNING ${l}`));
    }
    // --affected-cap (the nightly): affected rows above the cap are dropped from tonight's selection (the slice and the
    // red rows still run); the run file records it, and the deploy still decides from its own budget
    let affectedDropped = null;
    if (affectedIds && affectedCap !== null && affectedIds.size * 3 > affectedCap) {
        affectedDropped = affectedIds.size;
        console.log(`  --affected-cap ${affectedCap}: the ${affectedIds.size} affected row(s) (${affectedIds.size * 3} documents) are over the cap and are NOT run tonight; the slice${redIds ? ' and the red rows' : ''} run`);
        affectedIds = null;
    }
    const reach = affectedIds !== null || seventh !== null || !!slice || redIds !== null || affectedDropped !== null;
    const rows = selectRows(all, { kinds, names, shard, seventh, slice, affectedIds, extraIds: redIds });
    const selErr = selectionError({ all, kinds, names, rows, reach });
    if (selErr) throw new UsageError(selErr);
    settleStatic(rows);
    // N6: the red rows actually re-run are those --kind / --rows / --shard kept; the others are NOT run (they stay red)
    const redRun = redIds ? new Set([...redIds].filter((id) => rows.some((r) => r.id === id))) : null;
    if (redIds) console.log(`  --red-from: ${redRun.size} red row(s) re-selected and run${redIds.size > redRun.size ? `; ${redIds.size - redRun.size} outside --kind / --rows / --shard are NOT run by this run (they stay red): ${[...redIds].filter((id) => !redRun.has(id)).slice(0, 4).join(', ')}${redIds.size - redRun.size > 4 ? ' ...' : ''}` : ''}`);

    // dependency hash (before M4: the print inputs whole + pair fingerprints + the row)
    const tree = fsTree();
    const inputs = printInputs(tree);
    // the checker is an input too: a new lint rule must re-run the rows it was green for
    const printHash = sha(printInputsHash(tree, inputs) + [PRINT_LINT, path.join(__dirname, '..', 'lib', 'ws-harness.cjs')].map((f) => sha(fs.readFileSync(f))).join(''));
    const fps = engineFingerprints();
    for (const r of rows) r.depHash = depHash(r, printHash, fps);

    const byStatus = (st) => rows.filter((r) => r.status === st);
    const kindLine = (list) => KINDS.map((k) => `${k} ${list.filter((r) => r.kind === k).length}`).join(', ');
    console.log(`${TOOL}: ${rows.length} row(s) (${kindLine(rows)}) for ${universe.length} skill(s) of ${live.length} live; partners from ${P.source}; ${inputs.files.length} print-input files hashed (${printHash.slice(0, 12)})`);
    console.log(`  RUN ${byStatus('RUN').length} · PENDING ${byStatus('PENDING').length} · N/A ${byStatus('N/A').length}${byStatus('ERROR').length ? ` · ERROR ${byStatus('ERROR').length}` : ''} · documents to run ${byStatus('RUN').length * 3}`);

    // cache (N10): rows already OK for the same dependency hash AND the same baseline entry are skipped
    // I3: every row is judged against the MERGED baseline as it was BEFORE this run pins anything. A run that writes
    // pins (--write-baseline, --pin-new, --repin) judges against that same merged baseline (default
    // design/audit/matrix/baseline.json + its parts), never against "no baseline" (which would make every finding red)
    const pinMode = has('write-baseline') ? 'write-baseline' : has('pin-new') ? 'pin-new' : repinIds ? 'repin' : null;
    const BASE = arg('baseline', null) || (pinMode ? path.join(MATRIX_DIR, 'baseline.json') : null);
    const base = loadBaseline(BASE);
    // I4: a row pinned in two files with different contents refuses every run that reads the baseline
    const conflictErr = baselineConflictError(base);
    if (conflictErr) throw new UsageError(conflictErr);
    for (const d of (base && base.duplicates) || []) console.log(`  WARNING (I4) ${d.id} is pinned in both ${path.basename(d.files[0])} and ${path.basename(d.files[1])} with the same contents; delete one copy`);
    // N2: a re-pin rewrites the entries of --baseline's directory; its run file must go to that same directory, whose fold
    // reads it (a REPINNED record in another directory would clear a red row whose entry never changed)
    if (repinIds && outFile && path.dirname(path.resolve(BASE)) !== path.dirname(outFile)) throw new UsageError(`--repin rewrites the baseline in ${path.relative(process.cwd(), path.dirname(path.resolve(BASE))) || '.'} but --out writes the run file to ${path.relative(process.cwd(), path.dirname(outFile)) || '.'}: give a --baseline and an --out in the same directory (the matrix folder's baseline set, default design/audit/matrix)`);
    // N2: which merged baseline the rows are judged against (recorded in the run file; the fold checks it)
    const baseRecord = baselineRecord(BASE, base);
    // N1: a renamed row is judged against the entry of the id it replaced (in memory only; never written under the new id)
    for (const [to, from] of aliases) if (base && !base.rows[to] && base.rows[from]) { base.rows[to] = base.rows[from]; console.log(`  ${to} is judged against the baseline entry of ${from} (renamed row)`); }
    const CACHE = arg('cache', null);
    const cache = CACHE && fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : { rows: {} };
    const toRun = [];
    for (const r of byStatus('RUN')) {
        const c = cache.rows[r.id];
        // a re-selected red row always runs: it is red until a run lists it OK; a row to (re-)pin always runs too
        const mustRun = (redIds && redIds.has(r.id)) || (repinIds && repinIds.includes(r.id)) || (pinMode && !hasBaselineEntry(r, base));
        if (CACHE && c && c.status === 'OK' && c.depHash === r.depHash && c.baseline === baselineKey(base, r.id) && !mustRun) { r.status = 'CACHED'; r.cachedAt = c.date; } else toRun.push(r);
    }
    if (repinIds) {
        const notRun = repinIds.filter((id) => !toRun.some((r) => r.id === id));
        if (notRun.length) throw new UsageError(`--repin ${notRun.join(', ')}: not a printable row of the selection (${notRun.map((id) => { const r = rows.find((x) => x.id === id); return r ? `${r.status}${r.step ? `(${r.step})` : ''}` : 'no such row'; }).join(', ')})`);
    }
    if (CACHE) console.log(`  cache ${path.relative(process.cwd(), path.resolve(CACHE))}: ${byStatus('CACHED').length} row(s) already OK for this dependency hash and baseline entry`);

    if (has('list')) {
        const show = rows.length > 200 && !has('verbose') ? rows.slice(0, 200) : rows;
        for (const r of show) console.log(`  ${pad(r.status === 'PENDING' ? `PENDING(${r.step})` : r.status, 31)} ${pad(r.id, 62)} ${r.args.join(' ')}${r.reason && r.status !== 'RUN' ? `  - ${r.reason.slice(0, 140)}` : ''}`);
        if (show.length < rows.length) console.log(`  ... ${rows.length - show.length} more (--verbose)`);
        if (maxDocs !== null) console.log(`  budget: ${toRun.length * 3} document(s) to run against --max-docs ${maxDocs}: ${toRun.length * 3 > maxDocs ? 'OVER (a real run would exit 3)' : 'within'}`);
        console.log(`${TOOL}: LIST (${rows.length} row(s), ${toRun.length * 3} document(s) to run; nothing run)`);
        return;
    }
    // D1: the deploy's budget - above it nothing runs; the caller reads the nightly instead
    if (maxDocs !== null && toRun.length * 3 > maxDocs) {
        console.log(`  ${toRun.length} affected, non-cached row(s) x 3 sizes = ${toRun.length * 3} document(s); budget ${maxDocs}; nothing run`);
        // N4: which of them have a baseline entry (so they go UNCHECKED at this deploy) and which have none
        const withB = toRun.filter((r) => hasBaselineEntry(r, base)).map((r) => r.id), noB = toRun.filter((r) => !hasBaselineEntry(r, base)).map((r) => r.id);
        console.log(`  of them ${withB.length} row(s) have a baseline entry and are NOT checked by this run${withB.length ? ` (${withB.slice(0, 3).join(', ')}${withB.length > 3 ? ' ...' : ''})` : ''}; ${noB.length} have none (PENDING(no-baseline))`);
        if (outFile) {
            const lf = outFile.replace(/\.json$/, '') + '.over-budget.json';
            fs.mkdirSync(path.dirname(lf), { recursive: true });
            fs.writeFileSync(lf, JSON.stringify({ tool: TOOL, kind: 'over-budget', commit, budget: maxDocs, documents: toRun.length * 3, baseline: BASE ? path.relative(ROOT, path.resolve(BASE)) : null, withBaseline: withB, noBaseline: noB }, null, 1) + '\n');
            console.log(`  wrote ${path.relative(process.cwd(), lf)}`);
        }
        console.log(`${TOOL}: OVER-BUDGET ${toRun.length * 3} documents (budget ${maxDocs})`);
        process.exitCode = 3;
        return;
    }

    const slots = Math.max(1, parseInt(arg('slots', '1'), 10) || 1);
    const batch = Math.max(1, parseInt(arg('batch', '9'), 10) || 9);
    let timing = null;
    let refused = [];
    if (toRun.length) {
        console.log(`${TOOL}: running ${toRun.length} row(s) = ${toRun.length * 3} document(s) on ${slots} slot(s), ${batch} document(s) a browser start`);
        timing = await runRows(toRun, { slots, batch, verbose: has('verbose') });
        console.log(`  ${timing.linted} document(s) linted in ${(timing.wallMs / 1000).toFixed(1)} s: ${timing.docsPerSec.toFixed(3)} documents/s (${(timing.wallMs / 1000 / Math.max(1, timing.linted)).toFixed(2)} s a document, browser starts included; ${(timing.waitMs / 1000).toFixed(0)} s of batch time spent waiting for a slot another session held)`);
    }
    // the baseline writes (BASELINE INVARIANTS): AFTER every row was judged (I3: no row is judged again), only rows with
    // no entry in the merged baseline (I1), never a row re-selected as red (I2); --repin is the only re-pin
    // N4: a slice night narrowed by --skills / --kind / --rows / --shard pins into baseline.slice-i-of-n.partial.json,
    // never into the slice file that marks the slice done for every skill
    const partial = slice && pinMode === 'write-baseline' && (ONLY.length || kinds || names || shard) ? { skills: ONLY.length ? ONLY : 'all', kinds, rows: names, shard: shard ? `${shard.i}/${shard.n}` : null } : null;
    const pinRes = judgeAndPin(toRun, base, pinMode ? { rows: toRun, mode: pinMode, bf: BASE, slice, shard, redIds, repinIds, reason: reasonArg || '', commit, dirty, partial } : null);
    if (pinMode) {
        refused = pinRes.refused;
        const tgt = [].concat(pinRes.target).map((t) => path.relative(process.cwd(), t)).join(', ');
        if (pinMode === 'repin') console.log(`--repin: ${pinRes.repinned.length} row(s) re-pinned in ${tgt || 'no file'} ("${reasonArg}"); each entry logs the date, the reason and the pin it replaced`);
        else console.log(`${pinMode === 'pin-new' ? '--pin-new' : 'the per-row baseline'} ${path.relative(process.cwd(), pinRes.target)}: ${pinRes.pinned} new row(s) pinned (I1: only rows with no entry); ${pinRes.kept.length} already had an entry and were judged against it, not re-pinned; ${pinRes.redSkipped.length} re-selected as red, never pinned (I2)${partial ? `; N4: this --slice run is narrowed (${[ONLY.length && '--skills', kinds && '--kind', names && '--rows', shard && '--shard'].filter(Boolean).join(', ')}), so it writes the .partial file, which never marks slice ${slice.i}/${slice.n} done` : ''}`);
        if (refused.length) {
            console.log(`  NOT pinned (cannot print or not checked; they stay red): ${refused.length} row(s)`);
            for (const x of refused.slice(0, 40)) console.log(`    ${x.id}: ${String(x.why).slice(0, 160)}`);
        }
        console.log(`  status of this run (judged before the pin, I3): ${toRun.filter((r) => r.status === 'RED').length} RED, ${toRun.filter((r) => r.status === 'ERROR').length} ERROR, ${toRun.filter((r) => r.pinned).length} newly pinned (PENDING(no-baseline) or OK in this run)`);
    }

    // report
    const shown = rows.filter((r) => r.sizes || has('verbose'));
    if (shown.length) {
        console.log('\n' + pad('row', 64) + SIZES.map((s) => pad(s, 11)).join('') + 'status');
        for (const r of shown) {
            console.log(pad(r.id, 64) + SIZES.map((s) => pad(sizeCell(r.sizes && r.sizes[s]), 11)).join('') + (r.status === 'PENDING' ? `PENDING(${r.step})` : r.status));
            if ((r.status === 'RED' || has('verbose')) && r.rises && r.rises.length) for (const x of r.rises.slice(0, has('verbose') ? 99 : 6)) console.log(`      + ${x}`);
            if (r.errors) for (const e of r.errors) console.log(`      ! ${String(e).slice(0, 200)}`);
            if (has('verbose')) for (const sz of SIZES) for (const g of (r.sizes && r.sizes[sz] && r.sizes[sz].groups) || []) console.log(`      ${sz} ${g.slice(0, 180)}`);
        }
    }
    for (const r of byStatus('ERROR').filter((x) => !x.sizes)) console.log(`  ERROR ${r.id}: ${String(r.reason).slice(0, 200)}`);
    const TALLY = ['OK', 'CACHED', 'RED', 'PENDING', 'N/A', 'ERROR'];
    // the tally line keeps its old shape (`<tool>: OK <n> · CACHED ...`): ws-matrix-nightly.sh reads it for the commit message;
    // it is never the last line, which is always the verdict (finalVerdict)
    console.log(`\n${TOOL}: ${TALLY.map((s) => `${s} ${byStatus(s).length}`).join(" · ")}`);

    // write (N5): the run file FIRST (atomic), then the pins (each atomic), then the cache. A crash after the run file
    // leaves no pin: the slice is not done and the night is retried; never a slice file without its run's verdicts
    if (outFile) {
        writeAtomic(outFile, JSON.stringify(runFile(rows, { started, commit, dirty, P, printHash, ONLY, aff, seventh, slice, shard, kinds, names, timing, slots, batch, live, refused, redFrom, redIds: redRun, affectedDropped, affectedCap, affReached, pinMode, pinRes, reason: reasonArg, aliases, base, baseRecord }), null, 1) + '\n');
        console.log(`wrote ${path.relative(process.cwd(), outFile)}`);
    }
    if (pinRes) {
        pinRes.flush();
        for (const w of pinRes.writes) console.log(`wrote ${path.relative(process.cwd(), w.file)}`);
    }
    if (CACHE) {
        // a row is cached under the entry it was JUDGED against (I3): a row pinned by this run is not cached as OK
        for (const r of toRun) if (r.status === 'OK' && !r.pinned && !r.repinned) cache.rows[r.id] = { depHash: r.depHash, baseline: baselineKey(base, r.id), status: 'OK', date: new Date().toISOString().slice(0, 10) };
        writeAtomic(CACHE, JSON.stringify(cache, null, 1) + '\n');
    }
    const summary = `${rows.length} row(s), ${toRun.length} run, ${byStatus('CACHED').length} cached, ${(((Date.now() - t0) / 1000)).toFixed(0)} s`;
    if (pinMode === 'repin' && refused.length) {
        console.error(`${TOOL}: FAIL - --repin refused ${refused.length} row(s): ${refused.map((x) => `${x.id} (${String(x.why).slice(0, 100)})`).join('; ')}`);
        process.exitCode = 1;
        return;
    }
    const v = finalVerdict(rows, { reportOnly: has('report-only'), summary, reach });
    (v.code ? console.error : console.log)(v.line);
    process.exitCode = v.code;
})().catch((e) => { console.error(`${TOOL}: FAIL - ${has('verbose') ? (e && e.stack) || e : (e && e.message) || e}`); process.exit(1); });

/** The run file (header "THE RUN FILE"): per-row status OK / RED / PENDING / N/A / ERROR; cached rows are OK + cached. */
function runFile(rows, { started, commit, dirty, P, printHash, ONLY, aff, seventh = null, slice, shard, kinds, names, timing, slots, batch, live, refused, redFrom, redIds, affectedDropped = null, affectedCap, affReached, pinMode = null, pinRes = null, reason = null, aliases = null, now = new Date(), base = null, baseRecord = null }) {
    const st = (s) => rows.filter((r) => r.status === s).length;
    // N2: per row, the key of the entry it was judged against (a renamed row: the old id's entry, `judgedAgainst`)
    const keyOf = (r) => (r.sizes || r.status === 'CACHED' ? baselineKey(base, (aliases && aliases.get(r.id)) || r.id) : undefined);
    return {
        tool: TOOL, date: now.toISOString().slice(0, 10), started, finished: now.toISOString(), commit, dirty, partners: P.source, printInputsHash: printHash,
        // N2: the merged baseline the rows were judged against (null: no --baseline, so any finding was red)
        baseline: baseRecord,
        selection: { skills: ONLY.length ? ONLY : 'all', affected: aff ? { from: aff.A, to: aff.B, files: aff.files, reached: affReached, run: affectedDropped !== null ? 0 : affReached, droppedOverCap: affectedDropped !== null ? { rows: affectedDropped, cap: affectedCap } : undefined } : null,
            seventh, slice: slice ? `${slice.i}/${slice.n}` : (seventh !== null ? `${seventh + 1}/7` : null), shard: shard ? `${shard.i}/${shard.n}` : null, kinds, rows: names,
            redFrom: redFrom ? { dir: path.relative(ROOT, path.resolve(redFrom)), reselected: redIds ? [...redIds].sort() : [] } : null },
        replay: 'M4 replay: not built',
        liveSkills: live.length,
        // BASELINE INVARIANTS: what this run wrote. The rows' statuses above were judged BEFORE it (I3)
        baselineWrite: pinMode ? { mode: pinMode, target: [].concat(pinRes.target).map((t) => path.relative(ROOT, t)), pinned: pinRes.pinnedIds, kept: pinRes.kept.length, redNotPinned: pinRes.redSkipped, reason: pinMode === 'repin' ? reason : undefined } : undefined,
        mapped: aliases && aliases.size ? [...aliases].map(([to, from]) => ({ from, to })) : undefined,
        timing: timing ? { slots, batch, documents: timing.linted, seconds: +(timing.wallMs / 1000).toFixed(1), slotWaitSeconds: +(timing.waitMs / 1000).toFixed(0), docsPerSec: +timing.docsPerSec.toFixed(4), batches: timing.chunkTimes } : null,
        totals: Object.fromEntries(['OK', 'CACHED', 'RED', 'PENDING', 'N/A', 'ERROR'].map((s) => [s, st(s)])),
        red: rows.filter((r) => (r.status === 'RED' || r.status === 'ERROR') && !r.repinned).map((r) => r.id),
        repinned: rows.some((r) => r.repinned) ? rows.filter((r) => r.repinned).map((r) => r.id) : undefined,
        notPinned: refused && refused.length ? refused : undefined,
        rows: rows.map((r) => ({
            id: r.id, skill: r.skill, kind: r.kind, row: r.name, skills: r.skills, args: r.args, pairs: r.pairs, depHash: r.depHash,
            status: r.status === 'CACHED' ? 'OK' : r.status, cached: r.status === 'CACHED' ? (r.cachedAt || true) : undefined,
            step: r.step || undefined, reason: r.status === 'OK' || r.status === 'CACHED' ? undefined : r.reason,
            rises: r.rises && r.rises.length ? r.rises : undefined, errors: r.errors || undefined,
            pinned: r.pinned || undefined, repinned: r.repinned || undefined,
            baselineKey: keyOf(r), judgedAgainst: (aliases && aliases.get(r.id)) || undefined,
            sizes: r.sizes ? Object.fromEntries(SIZES.map((s) => [s, { ...r.sizes[s], groups: undefined }])) : undefined,
        })),
    };
}

/** --out auto: design/audit/matrix/<UTC date>[.shard-i-of-n].json, or <date>T<HHMM> when that file exists (never overwritten). */
function autoOut(shard) {
    const d = new Date().toISOString();
    const sfx = shard ? `.shard-${shard.i}-of-${shard.n}` : '';
    const f = path.join(MATRIX_DIR, `${d.slice(0, 10)}${sfx}.json`);
    return fs.existsSync(f) ? path.join(MATRIX_DIR, `${d.slice(0, 10)}T${d.slice(11, 13)}${d.slice(14, 16)}${sfx}.json`) : f;
}

/** N5: the lines that say which .json files the fold took under another name, and which it skipped and why. */
function foldSkipNote(fold) {
    const out = [];
    const other = fold.files.filter((f) => !f.extra && f.named === false);
    if (other.length) out.push(`  folded ${other.length} run file(s) not named <date>[T<HHMM>][.shard-i-of-n].json (they carry commit + finished + rows): ${other.map((f) => path.basename(f.file)).join(', ')}`);
    const known = fold.skipped.filter((x) => x.known);
    if (known.length) out.push(`  skipped ${known.length} .json file(s) that are not run files (baseline / cache / options-pin): ${known.map((x) => path.basename(x.file)).join(', ')}`);
    for (const x of fold.skipped.filter((y) => !y.known)) out.push(`  WARNING skipped ${path.basename(x.file)}: ${x.why}; it is NOT folded (a run file needs commit, finished and rows)`);
    return out;
}
