// ws-drawing-key — is ws-copy-light's DRAWING KEY complete? (critic lf-tools r1 B1 + r2 D1, the round-cap machine check)
//
// The copy-light route lets a later skill skip the full critic when a passed skill drew the SAME drawing. r1 keyed the
// drawing on the template id, r2 on a hand-kept list of payload fields (kind / task / layout / mode / type / form); both times a
// template that picks its picture from another field slipped through (r2: stack op, unknown, regroup, row count). This check
// asks the question for EVERY registered sheet template, from real payloads:
//
//   1. the corpus: every live skill, 4 seeded items at its defaults (generateQuestionFor + print-generate's kitCellSpec);
//   2. per template, up to 4 base payloads with different skeletons, from different skills;
//   3. each payload field mutated, one at a time, to every other value the corpus holds for it (up to 8, and "absent");
//   4. render base and mutation (js/modules/sheet renderCell, print and screen) and compare the normalised skeleton
//      (tests/lib/ws-drawing-skeleton.mjs: tags, class tokens, slot count and shape, SVG primitive kinds, operator glyphs;
//      digits and words masked; a run of identical siblings is one or many);
//   5. FAIL when the skeleton changes but the tree's drawing key (ws-copy-light's drawingOf) does not, naming the template
//      and the field.
//
//   node tests/scripts/ws-drawing-key.mjs [--root <tree>] [--template a,b] [--verbose]
//   node tests/scripts/ws-drawing-key.mjs --self-test          # the skeleton and the verdict on a stub kit, no app
// --root is the app tree whose generators, kit and ws-copy-light.mjs drawingOf are judged (default MQ_ROOT, else this
// repository); the skeleton is always this tree's. Last line `ws-drawing-key: OK ...` / `ws-drawing-key: FAIL ...`.

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { skeletonOfHtml, cellSkeleton, glyphsOf } from '../lib/ws-drawing-skeleton.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL = 'ws-drawing-key';
const BASES = 4, VALUES = 8, SEEDS = 4;
const ABSENT = Symbol('absent');
const show = (v) => (v === ABSENT ? '(absent)' : JSON.stringify(v).slice(0, 40));

/**
 * The verdict for one template. `bases` = [{payload, q, skill}], `values` = {field: [value | ABSENT]}, `skel(payload, q)` the
 * skeleton (null = does not draw), `key(payload, q)` the drawing key under test. -> {mutations, findings: [{field, from, to,
 * key, skill}]} (one finding per field). Pure given its functions.
 */
export function judgeTemplate(bases, values, skel, key) {
    const findings = new Map();
    let mutations = 0;
    for (const b of bases) {
        const s0 = skel(b.payload, b.q);
        if (s0 === null) continue;
        const k0 = key(b.payload, b.q);
        for (const [field, vals] of Object.entries(values)) {
            if (findings.has(field)) continue;
            const cur = Object.prototype.hasOwnProperty.call(b.payload, field) ? JSON.stringify(b.payload[field]) : null;
            for (const v of vals) {
                if (v === ABSENT ? cur === null : JSON.stringify(v) === cur) continue;
                const m = Object.assign({}, b.payload);
                if (v === ABSENT) delete m[field]; else m[field] = v;
                mutations++;
                const s1 = skel(m, b.q);
                if (s1 === null || s1 === s0) continue;
                if (key(m, b.q) === k0) { findings.set(field, { field, from: cur === null ? '(absent)' : cur.slice(0, 40), to: show(v), key: k0, skill: b.skill }); break; }
            }
        }
    }
    return { mutations, findings: [...findings.values()] };
}

/** The values the corpus holds per field (distinct, first seen across skills in turn; ABSENT when a payload lacks it). Pure. */
export function fieldValues(payloads, cap = VALUES) {
    const fields = new Set(payloads.flatMap((p) => Object.keys(p)));
    const out = {};
    for (const f of fields) {
        const seen = new Map();
        for (const p of payloads) {
            if (seen.size >= cap) break;
            if (!Object.prototype.hasOwnProperty.call(p, f)) { if (!seen.has('absent')) seen.set('absent', ABSENT); continue; }
            const j = JSON.stringify(p[f]);
            if (j !== undefined && j.length <= 400 && !seen.has(j)) seen.set(j, p[f]);
        }
        out[f] = [...seen.values()];
    }
    return out;
}

/* ============================================================== self-test */
function selfTest() {
    const bad = [];
    const eq = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    // a stub "stack": op glyph, operand rows, a missing-digit box, a carry row; digits per row as a run of spans
    const row = (n, d) => `<span class="op">${d || ''}</span>${Array.from({ length: String(n).length }, (_, i) => `<span>${String(n)[i]}</span>`).join('')}`;
    const render = (p, ctx) => `<div class="ws-stack" style="--t:${p.t || 3}">${p.regroup ? '<span class="rg"></span><span class="rg"></span>' : ''}${(p.rows || [36]).map((n) => row(n)).join('<span class="gap"></span>')}<span class="gap"></span>${row(p.b || 21, p.op === '*' ? '×' : p.op === '+' ? '+' : '−')}${p.unknown ? `<input data-ws-shape="box-unknown" data-ws-slot="d-0-${p.unknown}">` : ''}${ctx.mode === 'screen' ? '<input type="text" data-ws-shape="box" data-ws-slot="ans-1">' : '<span class="ab"></span>'}</div>`;
    const kit = { renderCell: (q, ctx) => render(q.cell.payload, ctx) };
    const sk = (p) => cellSkeleton(kit, 'stack', p);
    eq('digits masked (36 - 21 vs 48 - 13)', sk({ rows: [36], b: 21, op: '-' }) === sk({ rows: [48], b: 13, op: '-' }), true);
    eq('a run is one or many (36 vs 365)', sk({ rows: [36], b: 21, op: '-' }) === sk({ rows: [365], b: 210, op: '-' }), true);
    eq('one digit is not many (3 vs 36)', sk({ rows: [3], b: 21, op: '-' }) === sk({ rows: [36], b: 21, op: '-' }), false);
    eq('op - vs op * (D4)', sk({ op: '-' }) === sk({ op: '*' }), false);
    eq('op - vs op + ', sk({ op: '-' }) === sk({ op: '+' }), false);
    eq('a second operand row', sk({ rows: [36], op: '+' }) === sk({ rows: [36, 12, 40], op: '+' }), false);
    eq('a missing-digit box', sk({ op: '-' }) === sk({ op: '-', unknown: 1 }), false);
    eq('a carry row', sk({ op: '+' }) === sk({ op: '+', regroup: 'add' }), false);
    eq('style geometry ignored', sk({ op: '-', t: 3 }) === sk({ op: '-', t: 5 }), true);
    eq('slot names ignored', skeletonOfHtml('<input data-ws-slot="ans-1" data-ws-shape="box">') === skeletonOfHtml('<input data-ws-slot="ans-7" data-ws-shape="box">'), true);
    eq('slot shape kept', skeletonOfHtml('<input data-ws-shape="box">') === skeletonOfHtml('<input data-ws-shape="line">'), false);
    eq('svg primitive kinds kept, coordinates dropped', [skeletonOfHtml('<svg><line x1="1"/></svg>') === skeletonOfHtml('<svg><line x1="9"/></svg>'), skeletonOfHtml('<svg><line/></svg>') === skeletonOfHtml('<svg><circle/></svg>')], [true, false]);
    eq('an icon (unclassed g in svg) is one glyph: a ball and an apple are one drawing', skeletonOfHtml('<svg class="k1-svg"><g><circle/><path/></g><g><circle/><path/></g></svg>') === skeletonOfHtml('<svg class="k1-svg"><g><path/></g><g><path/></g></svg>'), true);
    eq('a classed group inside svg keeps its primitives', skeletonOfHtml('<svg><g class="hands"><line/></g></svg>') === skeletonOfHtml('<svg><g class="hands"><circle/></g></svg>'), false);
    eq('glyphs: words and digits masked, operators kept', [glyphsOf('Tom has 5 apples.'), glyphsOf('34 + 25 = '), glyphsOf('12 &minus; 3'), glyphsOf('Ninety-two'), glyphsOf('3 x 4')], ['', '+=', '−', '', '×']);
    // the verdict: a hand-kept key (kind only, the r2 shape) FAILS on op / unknown / regroup / rows; the skeleton key passes
    const corpus = [{ rows: [36], b: 21, op: '-' }, { rows: [36], b: 21, op: '*' }, { rows: [12, 40, 33], b: 21, op: '+', regroup: 'add' }, { rows: [36], b: 21, op: '+', unknown: 2 }];
    const vals = fieldValues(corpus);
    const bases = [{ payload: corpus[0], q: null, skill: 'subtraction:sub_50_no_regroup' }];
    const hand = (p) => ['stack', ...['kind', 'task', 'layout', 'mode', 'type', 'form'].filter((k) => p[k] !== undefined).map((k) => `${k}=${p[k]}`)].join('/');
    const r1 = judgeTemplate(bases, vals, (p) => sk(p), (p) => hand(p));
    eq('hand-kept key FAILS on op, rows, regroup, unknown (r2 D1)', r1.findings.map((f) => f.field).sort(), ['op', 'regroup', 'rows', 'unknown']);
    const r2 = judgeTemplate(bases, vals, (p) => sk(p), (p) => `stack@${sk(p)}`);
    eq('skeleton key passes', r2.findings, []);
    eq('fieldValues: absent is a value', vals.unknown.includes(ABSENT), true);
    for (const b of bad) console.log(`  self-test FAIL: ${b}`);
    const n = 19;
    console.log(`${TOOL} --self-test: ${bad.length ? `FAIL (${bad.length} of ${n})` : `OK (${n} cases: skeleton 15, verdict 3, corpus 1)`}`);
    return bad.length ? 1 : 0;
}

/* ============================================================== the app */
async function main() {
    const a = process.argv.slice(2);
    const get = (k) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : null; };
    if (a.includes('--self-test')) process.exit(selfTest());
    const root = resolve(get('--root') || process.env.MQ_ROOT || join(HERE, '..', '..'));
    const only = (get('--template') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const verbose = a.includes('--verbose');
    const M = (p) => pathToFileURL(join(root, 'js', 'modules', p)).href;
    const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    const store = {};
    globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
    globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
    const quiet = { log: console.log, warn: console.warn, error: console.error, info: console.info, debug: console.debug };
    const mute = () => { console.log = console.warn = console.error = console.info = console.debug = () => {}; };
    const clPath = join(root, 'tests', 'scripts', 'ws-copy-light.mjs');
    if (!existsSync(clPath)) { console.log(`${TOOL}: ${clPath} is missing`); console.log(`${TOOL}: FAIL (no ws-copy-light in the tree)`); process.exit(1); }
    let gq, data, pg, kit, cl;
    mute();
    try {
        gq = await import(M('generate-question.js'));
        data = await import(M('data.js'));
        pg = await import(M('print-generate.js'));
        kit = await import(M('sheet/index.js'));
        cl = await import(pathToFileURL(clPath).href);
    } finally { Object.assign(console, quiet); }
    if (typeof cl.drawingOf !== 'function') { console.log(`${TOOL}: FAIL (ws-copy-light exports no drawingOf)`); process.exit(1); }
    // the tree's key: drawingOf(template, payload[, kit, question]) (the r2 tool took two arguments and ignores the rest)
    const keyOf = (tpl) => (p, q) => { try { return String(cl.drawingOf(tpl, p, kit, q)); } catch (e) { return `error:${e && e.message}`; } };
    // 1. the corpus
    const live = [];
    for (const [cat, list] of Object.entries(data.SKILLS)) for (const s of list || []) if (s && s.v && !s.retired && !s.tombstone && !s.hidden) live.push([cat, s.v]);
    const byTpl = new Map();
    mute();
    try {
        for (const [cat, id] of live) {
            for (let i = 0; i < SEEDS; i++) {
                let q, c;
                try { q = gq.generateQuestionFor({ category: cat, skill: id, seed: 7000 + i, itemIndex: i }); c = q && pg.kitCellSpec(Object.assign({ skillId: id, categoryId: cat }, q)); } catch (e) { continue; }
                if (!c || !c.payload || typeof c.payload !== 'object' || Array.isArray(c.payload) || c.template === 'legacy') continue;
                if (!byTpl.has(c.template)) byTpl.set(c.template, []);
                byTpl.get(c.template).push({ payload: JSON.parse(JSON.stringify(c.payload)), q: Object.assign({ skillId: id, categoryId: cat }, q), skill: `${cat}:${id}` });
            }
        }
    } finally { Object.assign(console, quiet); }
    const registered = typeof kit.listCells === 'function' ? kit.listCells() : [...byTpl.keys()];
    const tpls = registered.filter((t) => t !== 'legacy' && (!only.length || only.includes(t)));
    const findings = [];
    const unjudged = [];
    let judged = 0, muts = 0;
    for (const t of tpls) {
        const items = byTpl.get(t) || [];
        if (!items.length) { unjudged.push(t); continue; }
        // round-robin across skills so the values and bases are not all one skill's
        const bySkill = new Map();
        for (const it of items) { if (!bySkill.has(it.skill)) bySkill.set(it.skill, []); bySkill.get(it.skill).push(it); }
        const rr = [];
        for (let k = 0; k < SEEDS; k++) for (const list of bySkill.values()) if (list[k]) rr.push(list[k]);
        const values = fieldValues(rr.map((x) => x.payload));
        const skel = (p, q) => cellSkeleton(kit, t, p, q);
        const bases = [];
        const seenSk = new Set(), seenSkill = new Set();
        mute();
        try {
            for (const it of rr) {
                if (bases.length >= BASES) break;
                if (seenSkill.has(it.skill)) continue;
                const s = skel(it.payload, it.q);
                if (s === null || seenSk.has(s)) continue;
                seenSk.add(s); seenSkill.add(it.skill); bases.push(it);
            }
            const r = judgeTemplate(bases, values, skel, keyOf(t));
            muts += r.mutations;
            judged++;
            for (const f of r.findings) findings.push({ template: t, ...f });
            if (verbose) quiet.log(`  ${t}: ${bases.length} base(s) from ${bySkill.size} skill(s), ${Object.keys(values).length} field(s), ${r.mutations} mutation(s), ${r.findings.length} finding(s)`);
        } finally { Object.assign(console, quiet); }
    }
    for (const f of findings) console.log(`  DRAWING-KEY ${f.template}.${f.field}: the skeleton changes (${f.from} -> ${f.to}, base from ${f.skill}) but the drawing key stays ${f.key}`);
    if (unjudged.length) console.log(`  not judged (no live skill draws them at its defaults): ${unjudged.join(', ')}`);
    const tplN = new Set(findings.map((f) => f.template)).size;
    console.log(`${TOOL}: ${findings.length ? `FAIL (${findings.length} field(s) on ${tplN} template(s) change the drawing but not its key; ${judged} templates judged, ${muts} mutations)` : `OK (${judged} templates judged from ${live.length} skills, ${muts} mutations: every skeleton change changes the drawing key; ${unjudged.length} registered template(s) unused)`}`);
    process.exit(findings.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.log(`${TOOL}: ${e && e.stack || e}`); console.log(`${TOOL}: FAIL (error)`); process.exit(1); });
