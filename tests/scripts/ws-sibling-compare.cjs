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
//   that takes its own browser slots through /tmp/mq-browser-run.sh). EVERY ROW THAT PRINTED AND HAS FINDINGS is
//   compared: RED, OK and PENDING(no-baseline) alike (critic r6 D1: a skill without a matrix pin has no RED rows, only
//   PENDING(no-baseline) ones, and those are exactly a new skill's rows; an OK row may sit on a pin the lane wrote
//   itself). --red-only restores the old RED-only comparison (--all-rows is accepted and is now the default).
//   PENDING(step) and N/A rows did not print: nothing to compare. An ERROR row is never engine debt: FAIL.
// SIBLINGS: tests/fixtures/precritic/siblings.json (--siblings-file): per kit template the APPROVED skills, and
//   optionally `pairs` (a lane skill -> the siblings of its own size band). N1 (lead decision, critic r6): the PAIRED
//   siblings are the default, as the lead's own pilot comparison (design/audit/runs/pilot-su-c/sibling-compare.txt)
//   used; a skill with no pair is compared with every approved sibling of its template; --all-siblings compares every
//   skill with every approved sibling (the lenient max over all of them; --paired is accepted, the default). The lane
//   skill's template is read from its generator in node (the kit cell of 8 seeded items, as ws-precritic --template
//   does). --siblings a:b,c:d overrides both. A sibling's counts come from, newest first:
//     --sibling-run <file>   ws-coverage-matrix run files of the siblings (repeatable)
//     --run-siblings         run the matrix on the siblings now (no baseline; cached by the print-input hash in
//                            $MQ_SIBLING_CACHE, default <os tmp>/mq-sibling-cache, so a second run on the same tree
//                            is free)
//     the pins               the merged matrix baseline of the tree (design/audit/matrix/baseline.json and every
//                            baseline.*.json beside it; --matrix-baseline <file> for another)
// THE RULE, per (compared row, size, lint rule): ours n; for each sibling with that row id suffix (kind/row) measured at
//   that size, its count (0 when the rule is absent). n > the siblings' max: ABOVE (FAIL). n <= max: ENGINE (non-
//   blocking, listed). No sibling measured that row at that size: NO-SIBLING (FAIL: unproven; run --run-siblings or
//   pin a sibling). Rows of other kinds of finding keys (the per-finding `<lint> <rule>|p<page>|...` keys) are ignored:
//   counts are compared, as the pilot's comparison did.
//
// Other options: --sizes S,M (compare only these sizes; default all three), --rules H13,TY-11 (compare only these lint
// rules: a rule id or the full "L-DENSITY H13" key; a backtest scoped to the one defect it was built for), --root <tree> (default MQ_ROOT, else this repository), --slots N (default 2), --json <out>,
// --report-only, --verbose (every ENGINE line too).
// Last line `ws-sibling-compare: OK (...)` or `ws-sibling-compare: FAIL - ...`; exit 1 on FAIL, 2 on a usage or setup
// error. No printed row with findings is OK ("nothing to compare"); the summary counts the compared rows by status.
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
/**
 * A row that printed: RED, OK, or PENDING(no-baseline) (it printed and only had no pin to compare with; critic r6 D1:
 * those are exactly a NEW skill's rows, so they are compared too). PENDING(step) / N/A rows did not print.
 */
const printed = (r) => r.status === 'RED' || r.status === 'OK' || r.status === 'CACHED' || (r.status === 'PENDING' && (r.noBaseline || /no-baseline/.test(`${r.step || ''} ${r.reason || ''}`)));
/** --rules H13,TY-11 (or the full key "L-DENSITY H13"): compare only these rules. */
const ruleOn = (rules, key) => !rules || rules.some((x) => key === x || key.endsWith(` ${x}`) || key.startsWith(`${x} `));
const hasFindings = (r, sizes, rules) => Object.entries(r.sizes || {}).some(([z, v]) => (!sizes || sizes.includes(z)) && v && ruleKeys(v.counts).some(([k, n]) => n > 0 && ruleOn(rules, k)));
/**
 * D1 (W0-A critic r7): on a multi-skill row (sections / mixed: the lane skill plus the matrix's partners) the counts
 * that judge the lane are its OWN share: the findings its cells carry (`bySkill[skill]`, from print-lint's `skill`)
 * plus those no cell names (`bySkill['']`, page-level, kept with the lane: conservative). A partner skill's findings
 * never block the lane: they are listed as PARTNER (non-blocking). A row without `bySkill` (a run or pin written
 * before D1) is judged on its totals, as before.
 */
function shareOf(v, skill, multi) {
    if (!multi || !v || !v.bySkill) return { own: v && v.counts ? v.counts : v || {}, partner: {} };
    const own = {}, partner = {};
    for (const [sk, m] of Object.entries(v.bySkill)) {
        const into = sk === skill || sk === '' || sk === '?' ? own : partner;
        for (const [k, n] of Object.entries(m)) into[k] = (into[k] || 0) + n;
    }
    return { own, partner };
}
/**
 * D1 fix r1: attribution missing must never pass silently. On a multi-skill row, the findings that carry no skill:
 * `bySkill['?']` (on a cell that names none) of the cell findings, in the format that has the '?' key; in the format
 * before it (every unnamed finding under ''), every '' finding. More than half of them unnamed: FAIL.
 */
function attributionGap(v, multi) {
    if (!multi || !v || !v.bySkill) return null;
    const sum = (m) => Object.values(m || {}).reduce((a, b) => a + b, 0);
    const total = sum(v.counts);
    if (!total) return null;
    const fresh = Object.prototype.hasOwnProperty.call(v.bySkill, '?');
    const unnamed = fresh ? sum(v.bySkill['?']) : sum(v.bySkill['']);
    const base = fresh ? total - sum(v.bySkill['']) : total;
    return base > 0 && unnamed * 2 > base ? { unnamed, of: base, fresh } : null;
}
function compare(oursRows, sibsOf, table, { redOnly = false, sizes = null, rules = null } = {}) {
    const out = { above: [], engine: [], noSibling: [], errors: [], partner: [], rowsCompared: 0, rowsAbove: new Set(), byStatus: {} };
    for (const r of oursRows) {
        if (r.status === 'ERROR') { out.errors.push({ id: r.id, msg: (r.errors || []).join('; ') || 'did not print' }); continue; }
        if (!r.sizes || !(redOnly ? r.status === 'RED' : printed(r)) || !hasFindings(r, sizes, rules)) continue;
        out.rowsCompared++;
        const st = r.status === 'PENDING' ? 'PENDING(no-baseline)' : r.status;
        out.byStatus[st] = (out.byStatus[st] || 0) + 1;
        const suf = `${r.kind}/${r.row}`;
        const sibs = sibsOf(r.skill);
        const multi = (r.skills || []).length > 1;
        for (const [size, v] of Object.entries(r.sizes)) {
            if (!v || !v.counts || (sizes && !sizes.includes(size))) continue;
            const gap = attributionGap(v, multi);
            if (gap) out.errors.push({ id: r.id, msg: `${size}: attribution missing - ${gap.unnamed} of ${gap.of} ${gap.fresh ? 'cell ' : ''}finding(s) name no skill on a multi-skill row (D1: print-lint could not tell the lane's cells from the partners')` });
            const sh = shareOf(v, r.skill, multi);
            for (const [rule, n] of ruleKeys(sh.partner)) if (n > 0 && ruleOn(rules, rule)) out.partner.push({ id: r.id, size, rule, n, skills: Object.keys(v.bySkill || {}).filter((k) => k && k !== '?' && k !== r.skill && Object.keys(v.bySkill[k]).includes(rule)) });
            for (const [rule, n] of ruleKeys(sh.own)) {
                if (!(n > 0) || !ruleOn(rules, rule)) continue;
                const seen = [];
                for (const s of sibs) {
                    const e = table.get(`${s}|${suf}`);
                    if (!e || !e.sizes || !e.sizes[size] || e.sizes[size].na || e.sizes[size].pending) continue;
                    const c = shareOf(e.sizes[size], s, multi).own;
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
    t(c.noSibling.length === 2 && c.noSibling[0].id.endsWith('single/defaults') && c.noSibling[1].id.endsWith('single/pages-3'), 'no sibling row -> unproven (the OK row with findings too)');
    t(c.errors.length === 1, 'ERROR row is never engine');
    t(c.rowsCompared === 3, 'every printed row with findings is compared (RED and OK alike)');
    t(compare(ours, () => ['addition:add_100_regroup'], table, { redOnly: true }).rowsCompared === 2, '--red-only: only RED rows');
    // critic r6 D1: a run file whose rows are all PENDING(no-baseline) (a new skill, no pin) is still compared
    const fresh = [
        { id: 'subtraction:n|single/ex-group', skill: 'subtraction:n', kind: 'single', row: 'ex-group', status: 'PENDING', step: 'no-baseline', noBaseline: true, sizes: { S: { counts: { 'L-DENSITY H13': 16 } } } },
        { id: 'subtraction:n|single/pages-3', skill: 'subtraction:n', kind: 'single', row: 'pages-3', status: 'PENDING', step: 'M2', sizes: { S: { counts: { 'L-DENSITY H13': 9 } } } },
        { id: 'subtraction:n|single/defaults', skill: 'subtraction:n', kind: 'single', row: 'defaults', status: 'PENDING', step: 'no-baseline', noBaseline: true, sizes: { S: { counts: {} } } },
    ];
    const cf = compare(fresh, () => ['addition:add_100_regroup'], sibTable([{ name: 'pin', rows: { 'addition:add_100_regroup|single/ex-group': { S: { 'L-DENSITY H13': 0 } } } }]));
    t(cf.rowsCompared === 1 && cf.above.length === 1 && cf.above[0].n === 16 && cf.byStatus['PENDING(no-baseline)'] === 1, `PENDING(no-baseline) rows only: compared, H13 16 above 0 (${JSON.stringify({ n: cf.rowsCompared, above: cf.above.length })})`);
    t(!cf.above.some((x) => /pages-3/.test(x.id)), 'a PENDING(step) row did not print: not compared');
    // N1: the paired siblings are the default; --all-siblings takes every approved sibling (the lenient max)
    const cfg = { templates: { stack: { approved: ['a:p', 'a:q', 'a:far'], pairs: { 's:x': ['a:p', 'a:q'] } } } };
    const so = siblingsOf(cfg, { 's:x': 'stack', 's:y': 'stack' }, ['s:x', 's:y'], {});
    t(so['s:x'].join() === 'a:p,a:q' && so['s:y'].join() === 'a:p,a:q,a:far', `paired by default, all approved without a pair (${JSON.stringify(so)})`);
    t(siblingsOf(cfg, { 's:x': 'stack' }, ['s:x'], { allSiblings: true })['s:x'].length === 3, '--all-siblings: every approved sibling');
    const cr = compare([ours[0]], () => ['addition:add_100_regroup'], table, { rules: ['H13'] });
    t(cr.above.length === 1 && cr.engine.length === 0 && cr.above[0].rule === 'L-DENSITY H13', '--rules H13 compares H13 only');
    const t2 = sibTable([{ name: 'pin', rows: { 'a:b|single/ex-group': { S: { 'L-DENSITY H13': 20 } } } }, { name: 'run', rows: { 'a:b|single/ex-group': { S: { counts: { 'L-DENSITY H13': 0 } } } } }]);
    t(compare([ours[0]], () => ['a:b'], t2).above.length === 2, 'a fresher sibling run replaces its pin');
    t(suffixOf('a:b|sections/ex-each') === 'sections/ex-each', 'suffix');
    // D1 (W0-A critic r7): a multi-skill row judges the lane skill's own share; a partner's findings never block
    const sibT = sibTable([{ name: 'pin', rows: { 'a:sib|sections/ex-each': { S: { counts: { 'L-SIZE TY-11': 0 } } } } }]);
    const partnerOnly = { id: 'a:lane|sections/ex-each', skill: 'a:lane', skills: ['a:lane', 'b:partner'], kind: 'sections', row: 'ex-each', status: 'RED', sizes: { S: { counts: { 'L-SIZE TY-11': 6 }, bySkill: { 'b:partner': { 'L-SIZE TY-11': 6 } } } } };
    const cp = compare([partnerOnly], () => ['a:sib'], sibT);
    t(cp.above.length === 0 && cp.noSibling.length === 0 && cp.partner.length === 1 && cp.partner[0].n === 6, `D1: findings only on the partner's cells do not block (${JSON.stringify({ above: cp.above.length, partner: cp.partner.length })})`);
    const laneOwn = { ...partnerOnly, sizes: { S: { counts: { 'L-SIZE TY-11': 9 }, bySkill: { 'a:lane': { 'L-SIZE TY-11': 3 }, 'b:partner': { 'L-SIZE TY-11': 6 } } } } };
    const cl = compare([laneOwn], () => ['a:sib'], sibT);
    t(cl.above.length === 1 && cl.above[0].n === 3 && cl.partner.length === 1, `D1: the lane skill's own 3 block, the partner's 6 are reported (${JSON.stringify(cl.above)})`);
    const pageLevel = { ...partnerOnly, sizes: { S: { counts: { 'L-DENSITY PAGEFILL': 1 }, bySkill: { '': { 'L-DENSITY PAGEFILL': 1 } } } } };
    t(compare([pageLevel], () => ['a:sib'], sibT).above.length === 1, 'D1: a page-level finding (no cell names a skill) stays with the lane');
    // D1 fix r1: a multi-skill row whose findings mostly name no skill is an ERROR, never a pass
    const unnamedOld = { ...partnerOnly, sizes: { S: { counts: { 'L-OVERFLOW PG-12': 8, 'L-DENSITY PG-23': 2 }, bySkill: { '': { 'L-OVERFLOW PG-12': 8, 'L-DENSITY PG-23': 2 } } } } };
    t(compare([unnamedOld], () => ['a:sib'], sibT).errors.length === 1, 'D1 r1: every finding unnamed (the format before fix r1) -> attribution missing');
    const unnamedNew = { ...partnerOnly, sizes: { S: { counts: { 'L-OVERFLOW PG-12': 8, 'L-DENSITY PG-23': 2 }, bySkill: { '?': { 'L-OVERFLOW PG-12': 5 }, 'b:partner': { 'L-OVERFLOW PG-12': 3 }, '': { 'L-DENSITY PG-23': 2 } } } } };
    t(compare([unnamedNew], () => ['a:sib'], sibT).errors.length === 1, 'D1 r1: 5 of 8 cell findings on unnamed cells -> attribution missing');
    const pageOnly = { ...partnerOnly, sizes: { S: { counts: { 'L-DENSITY PG-23': 2 }, bySkill: { '?': {}, '': { 'L-DENSITY PG-23': 2 } } } } };
    t(compare([pageOnly], () => ['a:sib'], sibT).errors.length === 0, 'D1 r1: page-level findings only (fresh format) are not an attribution gap');
    const oldRow = { ...partnerOnly, sizes: { S: { counts: { 'L-SIZE TY-11': 6 } } } };
    t(compare([oldRow], () => ['a:sib'], sibT).above.length === 1, 'D1: a row written before D1 (no bySkill) is judged on its totals');
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 20 cases)`);
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
/**
 * The siblings of each lane skill (pure; self-tested). N1 (lead, 2026-10-23): the PAIRED siblings of the skill's own
 * size band (the template's `pairs`) by default, as the lead's own sibling-compare.txt compared; a skill with no pair
 * gets every approved sibling of its template; allSiblings (--all-siblings) takes every approved sibling (the lenient
 * max over all of them).
 */
function siblingsOf(cfg, tpl, keys, { allSiblings = false } = {}) {
    const sibOf = {};
    for (const k of keys) {
        const t = cfg.templates && cfg.templates[tpl[k]];
        const pairs = !allSiblings && t && t.pairs && t.pairs[k];
        sibOf[k] = (pairs || (t && t.approved) || []).filter((s) => s !== k && !keys.includes(s));
    }
    return sibOf;
}
function loadSiblings({ keys, onlyRows = [], pinFile, tmp, explicit = [], allSiblings = false, runSiblings = false, siblingRuns = [], siblingsFile }) {
    const sf = path.resolve(HERE, siblingsFile || 'tests/fixtures/precritic/siblings.json');
    const cfg = fs.existsSync(sf) ? JSON.parse(fs.readFileSync(sf, 'utf8')) : { templates: {} };
    let tpl = {};
    let sibOf = {};
    if (explicit.length) for (const k of keys) sibOf[k] = explicit.filter((s) => s !== k);
    else {
        tpl = templatesOf(keys);
        sibOf = siblingsOf(cfg, tpl, keys, { allSiblings });
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
    const VALUE = new Set(['skills', 'run', 'rows', 'siblings', 'siblings-file', 'sibling-run', 'matrix-baseline', 'root', 'slots', 'json', 'sizes', 'rules']);
    const BOOL = new Set(['run-siblings', 'all-rows', 'red-only', 'report-only', 'verbose', 'self-test', 'paired', 'all-siblings']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const T0 = Date.now();
    const pinFile = path.resolve(ROOT, arg('matrix-baseline', 'design/audit/matrix/baseline.json'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-sibling-'));
    process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* gone */ } });
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
    const sizes = argAll('sizes');
    if (sizes.some((z) => !['S', 'M', 'L'].includes(z))) { say(`${TOOL}: --sizes takes S,M,L`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const cmpOpts = { redOnly: has('red-only'), sizes: sizes.length ? sizes : null, rules: argAll('rules').length ? argAll('rules') : null };
    const toCompare = oursRows.filter((r) => r.status !== 'ERROR' && compare([r], () => [], new Map(), cmpOpts).rowsCompared);
    const S = loadSiblings({ keys, onlyRows, pinFile, tmp, explicit: argAll('siblings'), allSiblings: has('all-siblings'), runSiblings: has('run-siblings') && toCompare.length > 0, siblingRuns: argAll('sibling-run'), siblingsFile: arg('siblings-file', 'tests/fixtures/precritic/siblings.json') });
    const { sibOf, tpl, sources, allSibs, noTpl, sf } = S;
    const sibSecs = S.sibSecs;
    const table = sibTable(sources);
    const c = compare(oursRows, (k) => sibOf[k] || [], table, cmpOpts);
    // ---- report
    const red = oursRows.filter((r) => r.status === 'RED').length;
    const noBase = oursRows.filter((r) => r.status === 'PENDING' && printed(r)).length;
    const fmtSibs = (x) => x.sibs.map((s) => `${s.s.split(':')[1]} ${s.n}`).join(', ');
    say(`${TOOL}: ${keys.length} lane skill(s) on ${ROOT === HERE ? 'this tree' : ROOT}; ${oursRows.length} row(s), ${red} RED, ${noBase} PENDING(no-baseline), ${c.errors.length} ERROR; comparing ${has('red-only') ? 'RED rows only (--red-only)' : 'every printed row with findings (RED, OK, PENDING(no-baseline))'} with ${argAll('siblings').length ? 'the given siblings' : has('all-siblings') ? 'every approved sibling (--all-siblings)' : 'the paired siblings (all approved where the skill has no pair)'}`);
    for (const k of keys) say(`  ${k}: template ${tpl[k] || '(given)'}; siblings ${sibOf[k].length ? sibOf[k].join(', ') : 'NONE (no approved sibling on this template in ' + path.relative(HERE, sf) + ')'}`);
    say(`  sibling counts from: ${sources.map((s) => `${s.name}: ${Object.keys(s.rows).filter((id) => allSibs.includes(id.split('|')[0])).length} sibling row(s)`).join('; ')}`);
    for (const e of c.errors) say(`ERROR      ${e.id}: ${e.msg}${/attribution missing/.test(e.msg) ? '' : ' (a row that cannot print is never engine debt)'}`);
    for (const x of c.above) say(`ABOVE      ${x.id} ${x.size} ${x.rule}: ours ${x.n}, siblings max ${x.max} (${fmtSibs(x)})`);
    for (const x of c.noSibling) say(`NO-SIBLING ${x.id} ${x.size} ${x.rule}: ours ${x.n}, no approved sibling measured ${suffixOf(x.id)} at ${x.size}`);
    if (has('verbose')) for (const x of c.engine) say(`engine     ${x.id} ${x.size} ${x.rule}: ours ${x.n} <= siblings max ${x.max} (${fmtSibs(x)})`);
    for (const x of c.partner) say(`partner    ${x.id} ${x.size} ${x.rule}: ${x.n} on the partner skill(s)' cells (${x.skills.join(', ') || '?'}): reported, never blocks the lane (D1)`);
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    const summary = `${c.rowsCompared} row(s) with findings compared (${Object.entries(c.byStatus).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}); ${c.engine.length} count(s) at or below the siblings (engine red, non-blocking), ${c.above.length} above, ${c.noSibling.length} with no sibling measured, ${c.errors.length} ERROR row(s), ${c.partner.length} partner-skill count(s) (non-blocking); ${secs} s (lane matrix ${oursSecs} s, sibling matrix ${sibSecs} s)`;
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills: keys, siblings: sibOf, templates: tpl, sources: sources.map((s) => s.name), rowsCompared: c.rowsCompared, byStatus: c.byStatus, red, noBaseline: noBase, above: c.above, noSibling: c.noSibling, engine: c.engine, errors: c.errors, partner: c.partner, rowsAboveSiblings: [...c.rowsAbove], seconds: +secs }, null, 1) + '\n');
    const bad = c.above.length + c.noSibling.length + c.errors.length;
    if (noTpl.length && c.rowsCompared) say(`  no approved siblings for ${noTpl.join(', ')}: every red count of theirs is unproven`);
    say(bad ? `${TOOL}: FAIL - worse than siblings: ${c.above.length} count(s) above the approved siblings in ${new Set(c.above.map((x) => x.id)).size} row(s), ${c.noSibling.length} unproven (no sibling), ${c.errors.length} ERROR (${summary})` : `${TOOL}: OK (${summary})`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}
module.exports = { compare, shareOf, attributionGap, printed, sibTable, suffixOf, siblingsOf, loadSiblings, runMatrix, runRows, readPins };
if (require.main === module) { try { main(); } catch (e) { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); } }
