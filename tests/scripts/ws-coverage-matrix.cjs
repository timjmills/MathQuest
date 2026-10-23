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
//                            night until a run lists it OK. --slice / --seventh imply --red-from design/audit/matrix
//                            (--no-red-from turns that off). A re-selected red row ignores the cache
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
//                            serves the whole batch (`ws-print-lint --jobs`)
//   --baseline f.json        RED = any (row, size, lint rule) count above the per-row baseline, or a render error
//                            (shards' baseline.shard-*.json files beside it are merged in); without it any
//                            finding is red
//   --write-baseline         write this run's counts as the per-row baseline (into --baseline, default
//                            design/audit/matrix/baseline.json; merged with the rows already there; with --slice,
//                            baseline.slice-i-of-n.json; with --shard, baseline.shard-i-of-n.json). Every reader merges
//                            baseline.json with every baseline.<part>.json beside it. Each pinned size holds the counts
//                            per lint rule AND (N1) the finding keys `<lint> <rule>|p<page>|<print-lint key, digits
//                            as #>`: a new finding that replaces a fixed one of the same rule is a rise. Entries pinned
//                            before N1 (counts only) are compared by counts
//   --pin-new                pin only the rows that printed and have NO entry yet (skills appended after the first
//                            baseline) into baseline.added[.shard-i-of-n].json; never re-pins a row
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
//                            --report-only says). The caller (ws-deploy-gates.sh) then reads the newest nightly
//   --out f.json|auto        write the run (auto = design/audit/matrix/<UTC date>.json)
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
//     selection {skills, affected {from, to, files}, seventh, shard, kinds, rows}, replay, timing {...},
//     totals {OK, CACHED, RED, PENDING, N/A, ERROR}, red: [ids of RED and ERROR rows], liveSkills,
//     rows: [{ id, skill, kind, row, skills, args, pairs, depHash, status, cached?, step?, reason?, rises?,
//              errors?, sizes {S, M, L: {pages, keyPages, counts, error} | {pending, reason} | {na}} }] }
//   A row's `status` is one of OK / RED / PENDING / N/A / ERROR (a cached row is OK with `cached: <date>`).
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
 * run of print-lint's own short key (`f.key`, else the message) normalised to `#`. A new finding that replaces a
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
    const out = { rows: {} };
    const dir = path.dirname(path.resolve(file));
    const files = [path.resolve(file)];
    try { for (const f of fs.readdirSync(dir).sort()) if (/^baseline\.[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)?\.json$/.test(f) && path.join(dir, f) !== path.resolve(file)) files.push(path.join(dir, f)); } catch (e) { /* none */ }
    for (const f of files) { try { Object.assign(out.rows, JSON.parse(fs.readFileSync(f, 'utf8')).rows || {}); } catch (e) { /* missing */ } }
    return out;
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
function pinRows(cur, rows, { onlyNew = false } = {}) {
    const refused = [];
    let pinned = 0;
    for (const r of rows) {
        if (!r.sizes) continue;
        // a row that printed: OK, RED, or PENDING(no-baseline) (it printed, it only had no entry to compare with)
        if (r.status !== 'OK' && r.status !== 'RED' && !r.noBaseline) { refused.push({ id: r.id, why: r.status === 'ERROR' ? (r.errors || []).join('; ') : r.status }); continue; }
        if (onlyNew && cur.rows[r.id]) continue;
        const entry = Object.fromEntries(SIZES.map((sz) => [sz, Object.fromEntries(Object.entries((r.sizes[sz] && r.sizes[sz].counts) || {}).filter(([k]) => !RENDER_KEYS.has(k)))]));
        // N1: the finding keys too, so a swapped finding of one rule is caught (an entry without keys compares counts)
        entry.keys = Object.fromEntries(SIZES.map((sz) => [sz, (r.sizes[sz] && r.sizes[sz].keys) || {}]));
        cur.rows[r.id] = entry;
        pinned++;
    }
    return { pinned, refused };
}

/** The cache key's baseline part (N10): the row's own merged baseline entry, or 'none' without --baseline. */
const baselineKey = (base, id) => (base ? sha(JSON.stringify((base.rows && base.rows[id]) || {})).slice(0, 16) : 'none');

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

/**
 * Fold every run file in `dir`, oldest stamp first, then the `extra` run files (the deploy's own inline run), into
 * each row's last-known state: a row's state is its status in the MOST RECENT run that ran it (listed it in `rows`,
 * or in `red`). A RED / ERROR row therefore stays red across runs that did not select it, until a later run lists
 * it with another status (OK, or PENDING / N/A when the row can no longer be checked). An id in a file's `red` list
 * is RED in that run even when its row says otherwise.
 * Returns { files: [{file, stamp, shard, j}], bad: [{file, error}], rows: Map(id -> {status, stamp, file, commit}),
 *           red: [ids RED / ERROR in the fold] }.
 */
function foldRuns(dir, extra = []) {
    const names = (dir && fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => RUN_RE.test(f));
    const stampOf = (f) => RUN_RE.exec(f)[1];
    names.sort((a, b) => (stampOf(a) < stampOf(b) ? -1 : stampOf(a) > stampOf(b) ? 1 : a < b ? -1 : a > b ? 1 : 0));
    const list = names.map((f) => ({ file: path.join(dir, f), stamp: stampOf(f), shard: RUN_RE.exec(f)[2] ? { i: +RUN_RE.exec(f)[2], n: +RUN_RE.exec(f)[3] } : null }))
        .concat(extra.filter((f) => f && fs.existsSync(f)).map((f) => ({ file: f, stamp: 'inline', shard: null, extra: true })));
    const files = [], bad = [];
    const rows = new Map();
    for (const e of list) {
        let j;
        try { j = JSON.parse(fs.readFileSync(e.file, 'utf8')); } catch (err) { bad.push({ file: e.file, error: err.message }); continue; }
        files.push({ ...e, j });
        const redList = new Set((Array.isArray(j.red) ? j.red : []).map(String));
        const seen = new Set();
        for (const r of Array.isArray(j.rows) ? j.rows : []) {
            if (!r || !r.id) continue;
            const id = String(r.id);
            seen.add(id);
            rows.set(id, { status: redList.has(id) && !RED_STATES.has(String(r.status)) ? 'RED' : String(r.status), stamp: e.stamp, file: e.file, commit: j.commit, rises: r.rises, errors: r.errors, skill: r.skill || (r.skills || [])[0] });
        }
        for (const id of redList) if (!seen.has(id)) rows.set(id, { status: 'RED', stamp: e.stamp, file: e.file, commit: j.commit, listOnly: true });
    }
    const red = [...rows.entries()].filter(([, v]) => RED_STATES.has(v.status)).map(([id]) => id).sort();
    return { files, bad, rows, red };
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
    if (bad.length) { console.error(`${TOOL}: FAIL - ${bad.length} self-test(s)`); bad.forEach((b) => console.error('  - ' + b)); process.exit(1); }
    console.log(`${TOOL}: OK (self-test, ${n} assertions)`);
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
    const st = (s) => rows.filter((r) => r.status === s);
    const red = st('RED').length + st('ERROR').length;
    if (red) {
        const ids = [...st('ERROR'), ...st('RED')].slice(0, 5).map((r) => `${r.id} ${r.status}`).join('; ');
        return reportOnly ? { line: `${TOOL}: WOULD FAIL - ${red} red row(s) (${ids}) [report-only, exit 0]; ${summary}`, code: 0 } : { line: `${TOOL}: FAIL - ${red} red row(s) (${ids}); ${summary}`, code: 1 };
    }
    if (!rows.length) return { line: `${TOOL}: OK (nothing reached: ${reach ? 'the --affected / --slice / --red-from selection reaches no row' : 'no rows'}; ${summary})`, code: 0 };
    // a PENDING(no-baseline) row printed (no render error) and only lacks an entry to compare with: it counts as
    // checked for the verdict (owner 2026-10-23: rows with no baseline never hold the deploy), and is named
    const noBase = rows.filter((r) => r.status === 'PENDING' && r.step === 'no-baseline').length;
    const checked = st('OK').length + st('CACHED').length + noBase;
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

module.exports = { foldRuns, baselineComplete, RUN_RE, inSlice, inShard, findingKey };
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
    if (has('pin-new') && has('write-baseline')) throw new UsageError('--pin-new and --write-baseline together: --write-baseline pins every printed row; --pin-new only rows with no entry');
    const maxDocsArg = arg('max-docs', null);
    if (maxDocsArg !== null && !/^\d+$/.test(maxDocsArg)) throw new UsageError(`--max-docs ${maxDocsArg}: a whole number of documents`);
    const maxDocs = maxDocsArg === null ? null : Number(maxDocsArg);
    const kinds = arg('kind', null) ? arg('kind', null).split(',') : null;
    const names = arg('rows', null) ? arg('rows', null).split(',') : null;

    const app = await loadApp();
    const live = liveSkills(app);
    const ONLY = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
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
    let redIds = null, fold = null;
    if (redFrom) {
        fold = foldRuns(redFrom);
        const known = new Set(all.map((r) => r.id));
        redIds = new Set(fold.red.filter((id) => known.has(id)));
        const other = fold.red.filter((id) => !known.has(id));
        console.log(`${TOOL}: --red-from ${path.relative(process.cwd(), path.resolve(redFrom)) || '.'}: ${fold.red.length} RED / ERROR row(s) in the folded state of ${fold.files.length} run file(s); ${redIds.size} re-selected${other.length ? `, ${other.length} outside the selected skills or no longer a row (${other.slice(0, 3).join(', ')}${other.length > 3 ? ' ...' : ''})` : ''}`);
        for (const b of fold.bad) console.log(`  unreadable run file ${b.file}: ${b.error}`);
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
    const BASE = arg('baseline', null);
    const base = loadBaseline(BASE);
    const CACHE = arg('cache', null);
    const cache = CACHE && fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : { rows: {} };
    const toRun = [];
    for (const r of byStatus('RUN')) {
        const c = cache.rows[r.id];
        // a re-selected red row always runs: it is red until a run lists it OK
        if (CACHE && c && c.status === 'OK' && c.depHash === r.depHash && c.baseline === baselineKey(base, r.id) && !(redIds && redIds.has(r.id))) { r.status = 'CACHED'; r.cachedAt = c.date; } else toRun.push(r);
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
        for (const r of toRun) verdict(r, base);
        console.log(`  ${timing.linted} document(s) linted in ${(timing.wallMs / 1000).toFixed(1)} s: ${timing.docsPerSec.toFixed(3)} documents/s (${(timing.wallMs / 1000 / Math.max(1, timing.linted)).toFixed(2)} s a document, browser starts included; ${(timing.waitMs / 1000).toFixed(0)} s of batch time spent waiting for a slot another session held)`);
        // --write-baseline: pin the counts of the rows that printed (D4), then judge every row against it
        if (has('write-baseline')) {
            const bf = BASE || path.join(MATRIX_DIR, 'baseline.json');
            const target = slice ? path.join(path.dirname(bf), `baseline.slice-${slice.i}-of-${slice.n}.json`) : shard ? path.join(path.dirname(bf), `baseline.shard-${shard.i}-of-${shard.n}.json`) : bf;
            let cur = { rows: {} };
            try { cur = JSON.parse(fs.readFileSync(target, 'utf8')); } catch (e) { /* new */ }
            const res = pinRows(cur, toRun);
            refused = res.refused;
            cur.tool = TOOL; cur.note = 'Per-row baseline (IMPROVEMENT_PLAN §1.6.2): every finding count per (row, size, lint rule) at the commit below, for rows that printed. A red row is any count above it; a row that cannot print (L-SPLIT RENDER) is never pinned. Changed only with a STATUS note.';
            cur.commit = commit + (dirty ? ' (dirty)' : ''); cur.date = new Date().toISOString().slice(0, 10);
            if (slice) { cur.slice = `${slice.i}/${slice.n}`; cur.finished = new Date().toISOString(); }
            cur.rows = Object.fromEntries(Object.entries(cur.rows).sort(([a], [b]) => a.localeCompare(b)));
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, JSON.stringify(cur, null, 1) + '\n');
            console.log(`wrote the per-row baseline ${path.relative(process.cwd(), target)} (${Object.keys(cur.rows).length} row(s); ${res.pinned} pinned by this run)`);
            const after = loadBaseline(target);
            for (const r of toRun) if (r.status === 'OK' || r.status === 'RED') verdict(r, after);
            if (refused.length) {
                console.log(`  NOT pinned (cannot print or not checked; they stay red): ${refused.length} row(s)`);
                for (const x of refused.slice(0, 40)) console.log(`    ${x.id}: ${String(x.why).slice(0, 160)}`);
            }
            console.log(`  red now: ${toRun.filter((r) => r.status === 'RED').length} RED, ${toRun.filter((r) => r.status === 'ERROR').length} ERROR`);
        }
        // --pin-new (the nightly after the first full baseline): pin the rows that printed and have NO entry yet (a
        // skill appended since); a row that already has an entry is never re-pinned
        if (has('pin-new')) {
            const bf = BASE || path.join(MATRIX_DIR, 'baseline.json');
            const target = path.join(path.dirname(bf), `baseline.added${shard ? `.shard-${shard.i}-of-${shard.n}` : ''}.json`);
            let cur = { rows: {} };
            try { cur = JSON.parse(fs.readFileSync(target, 'utf8')); } catch (e) { /* new */ }
            const fresh = toRun.filter((r) => !hasBaselineEntry(r, base));
            const res = pinRows(cur, fresh, { onlyNew: true });
            refused = res.refused;
            if (res.pinned) {
                cur.tool = TOOL; cur.note = 'Rows pinned by --pin-new: rows that printed and had no per-row baseline entry (skills appended after the first full baseline). Merged by every reader of baseline.json.';
                cur.commit = commit + (dirty ? ' (dirty)' : ''); cur.date = new Date().toISOString().slice(0, 10);
                cur.rows = Object.fromEntries(Object.entries(cur.rows).sort(([a], [b]) => a.localeCompare(b)));
                fs.writeFileSync(target, JSON.stringify(cur, null, 1) + '\n');
                const after = loadBaseline(bf);
                for (const r of fresh) if (r.noBaseline || r.status === 'OK' || r.status === 'RED') verdict(r, after);
            }
            console.log(`  --pin-new: ${res.pinned} row(s) with no baseline entry pinned into ${path.relative(process.cwd(), target)}${res.refused.length ? `; ${res.refused.length} not pinned (cannot print)` : ''}`);
        }
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

    // write: cache, run file
    if (CACHE) {
        const baseNow = has('write-baseline') ? loadBaseline(BASE || path.join(MATRIX_DIR, 'baseline.json')) : base;
        for (const r of toRun) if (r.status === 'OK') cache.rows[r.id] = { depHash: r.depHash, baseline: baselineKey(baseNow, r.id), status: 'OK', date: new Date().toISOString().slice(0, 10) };
        fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1) + '\n');
    }
    const OUT = arg('out', null);
    if (OUT) {
        const file = OUT === 'auto' ? path.join(MATRIX_DIR, `${new Date().toISOString().slice(0, 10)}${shard ? `.shard-${shard.i}-of-${shard.n}` : ''}.json`) : path.resolve(OUT);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(runFile(rows, { started, commit, dirty, P, printHash, ONLY, aff, seventh, slice, shard, kinds, names, timing, slots, batch, live, refused, redFrom, redIds, affectedDropped, affectedCap, affReached }), null, 1) + '\n');
        console.log(`wrote ${path.relative(process.cwd(), file)}`);
    }
    const summary = `${rows.length} row(s), ${toRun.length} run, ${byStatus('CACHED').length} cached, ${(((Date.now() - t0) / 1000)).toFixed(0)} s`;
    const v = finalVerdict(rows, { reportOnly: has('report-only'), summary, reach });
    (v.code ? console.error : console.log)(v.line);
    process.exitCode = v.code;
})().catch((e) => { console.error(`${TOOL}: FAIL - ${has('verbose') ? (e && e.stack) || e : (e && e.message) || e}`); process.exit(1); });

/** The run file (header "THE RUN FILE"): per-row status OK / RED / PENDING / N/A / ERROR; cached rows are OK + cached. */
function runFile(rows, { started, commit, dirty, P, printHash, ONLY, aff, seventh, slice, shard, kinds, names, timing, slots, batch, live, refused, redFrom, redIds, affectedDropped, affectedCap, affReached }) {
    const st = (s) => rows.filter((r) => r.status === s).length;
    return {
        tool: TOOL, date: new Date().toISOString().slice(0, 10), started, finished: new Date().toISOString(), commit, dirty, partners: P.source, printInputsHash: printHash,
        selection: { skills: ONLY.length ? ONLY : 'all', affected: aff ? { from: aff.A, to: aff.B, files: aff.files, reached: affReached, run: affectedDropped !== null ? 0 : affReached, droppedOverCap: affectedDropped !== null ? { rows: affectedDropped, cap: affectedCap } : undefined } : null,
            seventh, slice: slice ? `${slice.i}/${slice.n}` : (seventh !== null ? `${seventh + 1}/7` : null), shard: shard ? `${shard.i}/${shard.n}` : null, kinds, rows: names,
            redFrom: redFrom ? { dir: path.relative(ROOT, path.resolve(redFrom)), reselected: redIds ? [...redIds].sort() : [] } : null },
        replay: 'M4 replay: not built',
        liveSkills: live.length,
        timing: timing ? { slots, batch, documents: timing.linted, seconds: +(timing.wallMs / 1000).toFixed(1), slotWaitSeconds: +(timing.waitMs / 1000).toFixed(0), docsPerSec: +timing.docsPerSec.toFixed(4), batches: timing.chunkTimes } : null,
        totals: Object.fromEntries(['OK', 'CACHED', 'RED', 'PENDING', 'N/A', 'ERROR'].map((s) => [s, st(s)])),
        red: rows.filter((r) => r.status === 'RED' || r.status === 'ERROR').map((r) => r.id),
        notPinned: refused && refused.length ? refused : undefined,
        rows: rows.map((r) => ({
            id: r.id, skill: r.skill, kind: r.kind, row: r.name, skills: r.skills, args: r.args, pairs: r.pairs, depHash: r.depHash,
            status: r.status === 'CACHED' ? 'OK' : r.status, cached: r.status === 'CACHED' ? (r.cachedAt || true) : undefined,
            step: r.step || undefined, reason: r.status === 'OK' || r.status === 'CACHED' ? undefined : r.reason,
            rises: r.rises && r.rises.length ? r.rises : undefined, errors: r.errors || undefined,
            sizes: r.sizes ? Object.fromEntries(SIZES.map((s) => [s, { ...r.sizes[s], groups: undefined }])) : undefined,
        })),
    };
}
