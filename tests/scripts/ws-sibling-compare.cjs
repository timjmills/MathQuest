#!/usr/bin/env node
// ws-sibling-compare — process rule 0b "clean before the critic": a red coverage-matrix row of the lane's skills is
// ENGINE debt only when the APPROVED siblings (skills on the same kit template that already passed) show the same
// finding at least as often on the same row and size. A count above every sibling's is the lane's own: FAIL "worse
// than siblings", never "engine red". (pilot-su-c: 60 red rows were triaged as engine; the lead's comparison found
// 236 class × size counts above the paired siblings, and critic r1 failed with min score 4. This generalises
// design/audit/runs/pilot-su-c/sibling-compare.cjs.)
//
//   node tests/scripts/ws-sibling-compare.cjs --skills subtraction:sub_100_no_regroup          # runs the matrix itself
//   node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/x/coverage-matrix.json   # a matrix run file
//   node tests/scripts/ws-sibling-compare.cjs --skills a:b --rows single/ex-group,single/ex-each
//   node tests/scripts/ws-sibling-compare.cjs --skills a:b --run-siblings                      # measure the siblings now
//   node tests/scripts/ws-sibling-compare.cjs --self-test                                       # no app, no browser
//
// OURS (the lane's rows): --run <file> (a ws-coverage-matrix --out run file; repeatable), else this tool runs
//   `ws-coverage-matrix --skills <skills> [--rows ...] --baseline <matrix pin> --slots N --out <tmp>` (a node process
//   that takes its own browser slots through /tmp/mq-browser-run.sh). Only RED rows are compared (a row above its own
//   pin; --all-rows compares every printed row). An ERROR row is never engine debt: FAIL.
// SIBLINGS: tests/fixtures/precritic/siblings.json (--siblings-file): per kit template the APPROVED skills, and
//   optionally `pairs` (a lane skill -> the siblings of its own size band, used with --paired). By default every
//   approved sibling of the template counts (the max over all of them, as critic r1's engine rulings compared). The lane skill's template is read from its generator in node (the kit cell of 8 seeded items,
//   as ws-precritic --template does). --siblings a:b,c:d overrides both. A sibling's counts come from, newest first:
//     --sibling-run <file>   ws-coverage-matrix run files of the siblings (repeatable)
//     --run-siblings         run the matrix on the siblings now (no baseline; cached by the print-input hash in
//                            $MQ_SIBLING_CACHE, default <os tmp>/mq-sibling-cache, so a second run on the same tree
//                            is free)
//     the pins               the merged matrix baseline of the tree (design/audit/matrix/baseline.json and every
//                            baseline.*.json beside it; --matrix-baseline <file> for another)
// THE RULE, per (red row, size, lint rule): ours n; for each sibling with that row id suffix (kind/row) measured at
//   that size, its count (0 when the rule is absent). n > the siblings' max: ABOVE (FAIL). n <= max: ENGINE (non-
//   blocking, listed). No sibling measured that row at that size: NO-SIBLING (FAIL: unproven; run --run-siblings or
//   pin a sibling). Rows of other kinds of finding keys (the per-finding `<lint> <rule>|p<page>|...` keys) are ignored:
//   counts are compared, as the pilot's comparison did.
//
// Other options: --sizes S,M (compare only these sizes; default all three), --root <tree> (default MQ_ROOT, else this repository), --slots N (default 2), --json <out>,
// --report-only, --verbose (every ENGINE line too).
// Last line `ws-sibling-compare: OK (...)` or `ws-sibling-compare: FAIL - ...`; exit 1 on FAIL, 2 on a usage or setup
// error, 4 `NO-RED` never: zero red rows is OK ("nothing red to compare").
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TOOL = 'ws-sibling-compare';
const HERE = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const argAll = (k) => argv.flatMap((a, i) => (a === '--' + k && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const ROOT = path.resolve(arg('root', process.env.MQ_ROOT || HERE));
const say = (...a) => console.log(...a);
const MATRIX = path.join(__dirname, 'ws-coverage-matrix.cjs');

/* ---------------------------------------------------------------- pure parts (self-tested) */
const ruleKeys = (counts) => Object.entries(counts || {}).filter(([k]) => !k.includes('|'));
/** Row id suffix "kind/row" of a full id "cat:skill|kind/row". */
const suffixOf = (id) => String(id).slice(String(id).indexOf('|') + 1);

/**
 * Sibling measurements: Map "cat:skill|kind/row" -> {size: {rule: n}, src}. Later sources win (newest first is the
 * caller's order reversed: pins, then run files).
 */
function sibTable(sources) {
    const t = new Map();
    for (const s of sources) for (const [id, sizes] of Object.entries(s.rows)) t.set(id, { sizes, src: s.name });
    return t;
}
function compare(oursRows, sibsOf, table, { allRows = false, sizes = null } = {}) {
    const out = { above: [], engine: [], noSibling: [], errors: [], rowsCompared: 0, rowsAbove: new Set() };
    for (const r of oursRows) {
        if (r.status === 'ERROR') { out.errors.push({ id: r.id, msg: (r.errors || []).join('; ') || 'did not print' }); continue; }
        if (!(r.status === 'RED' || (allRows && r.status === 'OK')) || !r.sizes) continue;
        out.rowsCompared++;
        const suf = `${r.kind}/${r.row}`;
        const sibs = sibsOf(r.skill);
        for (const [size, v] of Object.entries(r.sizes)) {
            if (!v || !v.counts || (sizes && !sizes.includes(size))) continue;
            for (const [rule, n] of ruleKeys(v.counts)) {
                if (!(n > 0)) continue;
                const seen = [];
                for (const s of sibs) {
                    const e = table.get(`${s}|${suf}`);
                    if (!e || !e.sizes || !e.sizes[size] || e.sizes[size].na || e.sizes[size].pending) continue;
                    const c = e.sizes[size].counts ? e.sizes[size].counts : e.sizes[size];
                    seen.push({ s, n: +(c[rule] || 0), src: e.src });
                }
                const rec = { id: r.id, size, rule, n, sibs: seen };
                if (!seen.length) { out.noSibling.push(rec); out.rowsAbove.add(r.id); continue; }
                rec.max = Math.max(...seen.map((x) => x.n));
                if (n > rec.max) { out.above.push(rec); out.rowsAbove.add(r.id); } else out.engine.push(rec);
            }
        }
    }
    return out;
}

function selfTest() {
    const fails = [];
    const t = (c, m) => { if (!c) fails.push(m); };
    const table = sibTable([{ name: 'pin', rows: { 'addition:add_100_regroup|single/ex-group': { S: { 'L-SIZE TY-11': 8, 'L-SIZE TY-11|p1|x': 8 }, M: {}, L: {} } } }]);
    const ours = [
        { id: 'subtraction:s|single/ex-group', skill: 'subtraction:s', kind: 'single', row: 'ex-group', status: 'RED', sizes: { S: { counts: { 'L-SIZE TY-11': 8, 'L-DENSITY H13': 16 } }, M: { counts: {} } } },
        { id: 'subtraction:s|single/defaults', skill: 'subtraction:s', kind: 'single', row: 'defaults', status: 'RED', sizes: { S: { counts: { 'L-DENSITY H13': 2 } } } },
        { id: 'subtraction:s|single/pages-3', skill: 'subtraction:s', kind: 'single', row: 'pages-3', status: 'OK', sizes: { S: { counts: { 'L-DENSITY H13': 2 } } } },
        { id: 'subtraction:s|single/x', skill: 'subtraction:s', kind: 'single', row: 'x', status: 'ERROR', errors: ['boom'] },
    ];
    const c = compare(ours, () => ['addition:add_100_regroup'], table);
    t(c.above.length === 1 && c.above[0].rule === 'L-DENSITY H13' && c.above[0].max === 0, 'H13 16 above sibling 0');
    t(c.engine.length === 1 && c.engine[0].rule === 'L-SIZE TY-11', 'TY-11 8 at sibling 8 is engine');
    t(c.noSibling.length === 1 && c.noSibling[0].id.endsWith('single/defaults'), 'no sibling row -> unproven');
    t(c.errors.length === 1, 'ERROR row is never engine');
    t(c.rowsCompared === 2, 'OK rows skipped without --all-rows');
    t(compare(ours, () => ['addition:add_100_regroup'], table, { allRows: true }).rowsCompared === 3, '--all-rows');
    const t2 = sibTable([{ name: 'pin', rows: { 'a:b|single/ex-group': { S: { 'L-DENSITY H13': 20 } } } }, { name: 'run', rows: { 'a:b|single/ex-group': { S: { counts: { 'L-DENSITY H13': 0 } } } } }]);
    t(compare([ours[0]], () => ['a:b'], t2).above.length === 2, 'a fresher sibling run replaces its pin');
    t(suffixOf('a:b|sections/ex-each') === 'sections/ex-each', 'suffix');
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 8 cases)`);
    process.exit(fails.length ? 1 : 0);
}

/* ---------------------------------------------------------------- inputs */
function readPins(file) {
    const rows = {};
    const dir = path.dirname(file);
    const files = [file, ...(fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^baseline\..+\.json$/.test(n)).map((n) => path.join(dir, n)) : [])];
    const used = [];
    for (const f of files) {
        if (!fs.existsSync(f)) continue;
        try { Object.assign(rows, JSON.parse(fs.readFileSync(f, 'utf8')).rows || {}); used.push(f); } catch (e) { /* not a pin file */ }
    }
    return { name: `pins (${used.map((f) => path.relative(ROOT, f)).join(', ') || 'none'})`, rows };
}
function runRows(file) {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(j.rows)) throw new Error(`${file}: not a ws-coverage-matrix run file (no rows)`);
    return j;
}
function runFileAsSource(j, name) {
    const rows = {};
    for (const r of j.rows) if (r.sizes && (r.status === 'OK' || r.status === 'RED' || (r.status === 'PENDING' && r.reason && /no-baseline/.test(r.reason)) || /no-baseline/.test(String(r.step || '')))) rows[r.id] = r.sizes;
    return { name, rows };
}
/** Run the matrix; returns the run file's JSON. */
function runMatrix(keys, { rows, baseline, out, label }) {
    const a = [MATRIX, '--skills', keys.join(','), '--slots', arg('slots', '2'), '--out', out];
    if (rows && rows.length) a.push('--rows', rows.join(','));
    if (baseline) a.push('--baseline', baseline);
    process.stderr.write(`${TOOL}: running the matrix for ${label} (${keys.length} skill(s)${rows && rows.length ? `, rows ${rows.join(',')}` : ''})\n`);
    const t0 = Date.now();
    const r = spawnSync(process.execPath, a, { cwd: HERE, env: Object.assign({}, process.env, { MQ_ROOT: ROOT }), encoding: 'utf8', maxBuffer: 256 << 20 });
    const secs = Math.round((Date.now() - t0) / 1000);
    if (!fs.existsSync(out)) throw new Error(`the matrix wrote no run file for ${label} (exit ${r.status}): ${String(r.stdout || '').trim().split('\n').slice(-3).join(' | ')} ${String(r.stderr || '').trim().split('\n').slice(-2).join(' | ')}`);
    process.stderr.write(`${TOOL}: matrix for ${label}: ${secs} s\n`);
    const j = runRows(out);
    j._seconds = secs;
    return j;
}
/** The kit template each skill draws most (8 seeded items), in node. */
function templatesOf(keys) {
    const code = `
import { pathToFileURL } from 'node:url'; import { join } from 'node:path';
const ROOT = process.env.SC_ROOT; const M = (p) => pathToFileURL(join(ROOT, 'js', 'modules', p)).href;
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
const store = {}; globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
const out = process.stdout.write.bind(process.stdout); console.log = console.warn = console.error = console.info = console.debug = () => {};
const gq = await import(M('generate-question.js')); const pg = await import(M('print-generate.js'));
const res = {};
for (const key of JSON.parse(process.env.SC_KEYS)) { const [cat, id] = key.split(':'); const seen = {};
  for (let i = 0; i < 8; i++) { let t = 'error'; try { const q = gq.generateQuestionFor({ category: cat, skill: id, seed: 1000 + i, itemIndex: i }); const r = q && pg.kitCellSpec(Object.assign({ skillId: id, categoryId: cat }, q)); t = r ? r.template : 'legacy'; } catch (e) {} seen[t] = (seen[t] || 0) + 1; }
  res[key] = Object.entries(seen).sort((a, b) => b[1] - a[1])[0][0]; }
out('\\n' + JSON.stringify(res) + '\\n'); process.exit(0);`;
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: HERE, env: Object.assign({}, process.env, { SC_ROOT: ROOT, SC_KEYS: JSON.stringify(keys) }), encoding: 'utf8', maxBuffer: 64 << 20 });
    try { return JSON.parse(String(r.stdout || '').trim().split('\n').pop()); } catch (e) { throw new Error(`cannot read the skills' templates in node: ${String(r.stderr || '').slice(0, 400)}`); }
}

/**
 * The siblings of each lane skill and the sources of their counts (pins, a fresh or cached sibling matrix run, given
 * run files). Shared with ws-slot-clip, which uses the same cache.
 */
function loadSiblings({ keys, onlyRows = [], pinFile, tmp, explicit = [], paired = false, runSiblings = false, siblingRuns = [], siblingsFile }) {
    const sf = path.resolve(HERE, siblingsFile || 'tests/fixtures/precritic/siblings.json');
    const cfg = fs.existsSync(sf) ? JSON.parse(fs.readFileSync(sf, 'utf8')) : { templates: {} };
    let tpl = {};
    const sibOf = {};
    if (explicit.length) for (const k of keys) sibOf[k] = explicit.filter((s) => s !== k);
    else {
        tpl = templatesOf(keys);
        for (const k of keys) {
            const t = cfg.templates && cfg.templates[tpl[k]];
            const pairs = paired && t && t.pairs && t.pairs[k];
            sibOf[k] = (pairs || (t && t.approved) || []).filter((s) => s !== k && !keys.includes(s));
        }
    }
    const noTpl = keys.filter((k) => !sibOf[k].length);
    const allSibs = [...new Set(Object.values(sibOf).flat())];
    const sources = [readPins(pinFile)];
    let sibSecs = 0, sibCache = '', sibRunFile = null;
    if (runSiblings && allSibs.length) {
        // the cache key: the tree's print inputs (the matrix's own hash, from --list), the siblings and the rows
        const l = spawnSync(process.execPath, [MATRIX, '--skills', allSibs.join(','), '--list'], { cwd: HERE, env: Object.assign({}, process.env, { MQ_ROOT: ROOT }), encoding: 'utf8', maxBuffer: 64 << 20 });
        const h = /print-input files hashed \(([0-9a-f]+)\)/.exec(l.stdout || '');
        const cacheDir = path.resolve(process.env.MQ_SIBLING_CACHE || path.join(os.tmpdir(), 'mq-sibling-cache'));
        const key = h ? require('crypto').createHash('sha256').update(`${ROOT}|${h[1]}|${allSibs.slice().sort().join(',')}|${onlyRows.join(',')}`).digest('hex').slice(0, 16) : null;
        const cached = key ? path.join(cacheDir, `${key}.json`) : null;
        let j;
        if (cached && fs.existsSync(cached)) { j = runRows(cached); sibCache = `cached ${path.basename(cached)}`; sibRunFile = cached; }
        else {
            sibRunFile = path.join(tmp, 'siblings.json');
            j = runMatrix(allSibs, { rows: onlyRows, baseline: null, out: sibRunFile, label: 'the siblings' });
            sibSecs = j._seconds;
            if (cached && !j.dirty) { fs.mkdirSync(cacheDir, { recursive: true }); fs.copyFileSync(sibRunFile, cached); sibRunFile = cached; sibCache = `measured now, cached as ${path.basename(cached)}`; }
            else sibCache = 'measured now';
        }
        sources.push(runFileAsSource(j, `sibling run (${sibCache})`));
    }
    for (const f of siblingRuns) sources.push(runFileAsSource(runRows(path.resolve(f)), `sibling run ${path.basename(f)}`));
    return { sibOf, tpl, sources, allSibs, noTpl, sf, sibSecs, sibRunFile };
}

/* ---------------------------------------------------------------- main */
function main() {
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'run', 'rows', 'siblings', 'siblings-file', 'sibling-run', 'matrix-baseline', 'root', 'slots', 'json', 'sizes']);
    const BOOL = new Set(['run-siblings', 'all-rows', 'report-only', 'verbose', 'self-test', 'paired']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const T0 = Date.now();
    const pinFile = path.resolve(ROOT, arg('matrix-baseline', 'design/audit/matrix/baseline.json'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-sibling-'));
    // ---- ours
    let runs = argAll('run').map((f) => runRows(path.resolve(f)));
    let keys = argAll('skills');
    const onlyRows = argAll('rows');
    let oursSecs = 0;
    if (!runs.length) {
        if (!keys.length) { say(`${TOOL}: give --skills or --run`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        const j = runMatrix(keys, { rows: onlyRows, baseline: fs.existsSync(pinFile) ? pinFile : null, out: path.join(tmp, 'ours.json'), label: 'the lane' });
        oursSecs = j._seconds;
        runs = [j];
    }
    let oursRows = runs.flatMap((j) => j.rows);
    if (keys.length) oursRows = oursRows.filter((r) => keys.includes(r.skill));
    else keys = [...new Set(oursRows.map((r) => r.skill))];
    if (onlyRows.length) oursRows = oursRows.filter((r) => onlyRows.includes(`${r.kind}/${r.row}`) || onlyRows.includes(r.id));
    // ---- siblings
    const S = loadSiblings({ keys, onlyRows, pinFile, tmp, explicit: argAll('siblings'), paired: has('paired'), runSiblings: has('run-siblings'), siblingRuns: argAll('sibling-run'), siblingsFile: arg('siblings-file', 'tests/fixtures/precritic/siblings.json') });
    const { sibOf, tpl, sources, allSibs, noTpl, sf } = S;
    const sibSecs = S.sibSecs;
    const table = sibTable(sources);
    const sizes = argAll('sizes');
    if (sizes.some((z) => !['S', 'M', 'L'].includes(z))) { say(`${TOOL}: --sizes takes S,M,L`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const c = compare(oursRows, (k) => sibOf[k] || [], table, { allRows: has('all-rows'), sizes: sizes.length ? sizes : null });
    // ---- report
    const red = oursRows.filter((r) => r.status === 'RED').length;
    const fmtSibs = (x) => x.sibs.map((s) => `${s.s.split(':')[1]} ${s.n}`).join(', ');
    say(`${TOOL}: ${keys.length} lane skill(s) on ${ROOT === HERE ? 'this tree' : ROOT}; ${oursRows.length} row(s), ${red} RED, ${c.errors.length} ERROR`);
    for (const k of keys) say(`  ${k}: template ${tpl[k] || '(given)'}; siblings ${sibOf[k].length ? sibOf[k].join(', ') : 'NONE (no approved sibling on this template in ' + path.relative(HERE, sf) + ')'}`);
    say(`  sibling counts from: ${sources.map((s) => `${s.name}: ${Object.keys(s.rows).filter((id) => allSibs.includes(id.split('|')[0])).length} sibling row(s)`).join('; ')}`);
    for (const e of c.errors) say(`ERROR      ${e.id}: ${e.msg} (a row that cannot print is never engine debt)`);
    for (const x of c.above) say(`ABOVE      ${x.id} ${x.size} ${x.rule}: ours ${x.n}, siblings max ${x.max} (${fmtSibs(x)})`);
    for (const x of c.noSibling) say(`NO-SIBLING ${x.id} ${x.size} ${x.rule}: ours ${x.n}, no approved sibling measured ${suffixOf(x.id)} at ${x.size}`);
    if (has('verbose')) for (const x of c.engine) say(`engine     ${x.id} ${x.size} ${x.rule}: ours ${x.n} <= siblings max ${x.max} (${fmtSibs(x)})`);
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    const summary = `${c.rowsCompared} red row(s) compared; ${c.engine.length} count(s) at or below the siblings (engine red, non-blocking), ${c.above.length} above, ${c.noSibling.length} with no sibling measured, ${c.errors.length} ERROR row(s); ${secs} s (lane matrix ${oursSecs} s, sibling matrix ${sibSecs} s)`;
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills: keys, siblings: sibOf, templates: tpl, sources: sources.map((s) => s.name), rowsCompared: c.rowsCompared, red, above: c.above, noSibling: c.noSibling, engine: c.engine, errors: c.errors, rowsAboveSiblings: [...c.rowsAbove], seconds: +secs }, null, 1) + '\n');
    fs.rmSync(tmp, { recursive: true, force: true });
    const bad = c.above.length + c.noSibling.length + c.errors.length;
    if (noTpl.length && red) say(`  no approved siblings for ${noTpl.join(', ')}: every red count of theirs is unproven`);
    say(bad ? `${TOOL}: FAIL - worse than siblings: ${c.above.length} count(s) above the approved siblings in ${new Set(c.above.map((x) => x.id)).size} row(s), ${c.noSibling.length} unproven (no sibling), ${c.errors.length} ERROR (${summary})` : `${TOOL}: OK (${summary})`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}
module.exports = { compare, sibTable, suffixOf, loadSiblings, runMatrix, runRows, readPins };
if (require.main === module) { try { main(); } catch (e) { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); } }
