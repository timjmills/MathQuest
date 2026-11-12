// THE LESSON COMPILER UNIT GATE (E4 proof, design/lessons/proof/DIFF.md). Node only, no browser.
//
//   node tests/scripts/ws-lesson-compile-unit.mjs [--report]
//
// For every card of the proof set (a card whose id is a hand-written long lesson, lessons/detailed/index.js):
//   1. the card compiles (lessons/compile.js compileLesson);
//   2. the library output passes lessons/schema.js (validateRoutine, validateLesson: live skills, drawn icons,
//      LR-3, LR-17, LR-18) and the detailed output passes detailed/index.js validateDescription;
//   3. the compiled description has every field the hand-written one has (top level, lessonData, each section),
//      and every difference of content is listed (the report, --report: design/lessons/proof/STRUCTURE.md);
//   4. the compiled hooks (vars from the shape's readers, checkQuestion.show, lastName, answerShow, chartSay)
//      return what the hand-written ones return on sample items of every template the lesson reads;
//   5. `ws-lesson-card --check` passes on the proof cards (placeholders, script vs page, options, ranges, ids);
//   6. the generated units/<unit>.js files are not stale and export the compiled descriptions.
// Prints `ws-lesson-compile-unit: OK (n checks)` / `FAIL`.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const mem = {};
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const log = console.log;
console.log = () => {};
const data = await imp('js/modules/data.js').finally(() => { console.log = log; });
const COMPILE = await imp('js/modules/lessons/compile.js');
const SCHEMA = await imp('js/modules/lessons/schema.js');
const DET = await imp('js/modules/lessons/detailed/index.js');
const ICONS = await imp('js/modules/sheet/lesson-icons.js');
const LR = await imp('js/modules/sheet/lesson-rules.js');

let pass = 0;
const fails = [];
const report = [];
const ok = (cond, what) => { if (cond) pass++; else fails.push(what); };
const skillExists = (key) => { const [c, s] = String(key).split(':'); return !!(data.SKILLS[c] && data.SKILLS[c].some((x) => x && x.v === s)); };
const caseNames = Object.values(LR.CASE_FAMILIES).flatMap((f) => Object.keys(f));
const known = { stepIcons: ICONS.ICON_IDS, caseNames, skillExists };
const BLOCK_RE = /```json lesson-card\n([\s\S]*?)\n```/;
const CARDS = path.join(ROOT, 'design/lessons/cards');
const cards = fs.readdirSync(CARDS).filter((d) => fs.statSync(path.join(CARDS, d)).isDirectory())
    .flatMap((d) => fs.readdirSync(path.join(CARDS, d)).filter((f) => f.endsWith('.md')).map((f) => path.join(CARDS, d, f)))
    .map((f) => ({ file: f, card: JSON.parse(fs.readFileSync(f, 'utf8').match(BLOCK_RE)[1]) }))
    .filter((x) => DET.DETAILED_LESSONS[x.card.id]);
ok(cards.length >= 5, `the proof set has ${cards.length} cards (want lessons 1, 2, 3a, 4, 5 at least)`);

const BASE = ['n', 'ans', 'text', 'a', 'b', 'op', 'say', 'words', 'Words', 'wrong'];
const plain = (v) => JSON.stringify(v, (k, x) => (typeof x === 'function' ? `fn:${k}` : x));
const IGNORE_TOP = new Set(['compiled', 'repeatKey']);

/** Every structural and content difference of a compiled description against the hand-written one. */
function diff(hand, comp) {
    const out = [];
    const hk = Object.keys(hand), ck = Object.keys(comp).filter((k) => !IGNORE_TOP.has(k));
    for (const k of hk) if (!(k in comp)) out.push({ kind: 'missing', at: k, text: 'field missing in the compiled description' });
    for (const k of ck) if (!(k in hand)) out.push({ kind: 'extra', at: k, text: `extra field ${plain(comp[k]).slice(0, 100)}` });
    for (const k of hk.filter((x) => x in comp)) {
        if (k === 'sections') {
            const hs = hand.sections, cs = comp.sections;
            const hn = hs.map((s) => String(s.n)), cn = cs.map((s) => String(s.n));
            if (hn.join() !== cn.join()) out.push({ kind: 'structure', at: 'sections', text: `order ${hn.join(' ')} → ${cn.join(' ')}` });
            for (const s of hs) {
                const c = cs.find((x) => String(x.n) === String(s.n));
                if (!c) { out.push({ kind: 'missing', at: `sections ${s.n}`, text: 'section missing' }); continue; }
                for (const f of ['name', 'min', 'page']) if (s[f] !== c[f]) out.push({ kind: 'content', at: `sections ${s.n}.${f}`, text: `${plain(s[f])} → ${plain(c[f])}` });
                if (plain(s.boxes) !== plain(c.boxes)) out.push({ kind: 'content', at: `sections ${s.n}.boxes`, text: `${plain(s.boxes)} → ${plain(c.boxes)}` });
                if (plain(s.loop) !== plain(c.loop)) out.push({ kind: 'content', at: `sections ${s.n}.loop`, text: `${plain(s.loop)} → ${plain(c.loop)}` });
                const hr = s.rows.map(plain), cr = c.rows.map(plain);
                const gone = hr.filter((r) => !cr.includes(r)), added = cr.filter((r) => !hr.includes(r));
                if (gone.length || added.length) out.push({ kind: 'content', at: `sections ${s.n}.rows`, text: `${hr.length} → ${cr.length} rows; hand only: ${gone.join(' | ') || '-'}; compiled only: ${added.join(' | ') || '-'}` });
                else if (hr.join() !== cr.join()) out.push({ kind: 'content', at: `sections ${s.n}.rows`, text: 'same rows, another order' });
            }
            continue;
        }
        if (k === 'lessonData' || k === 'checkQuestion' || k === 'wordProblem') {
            const h = hand[k], c = comp[k];
            for (const f of Object.keys(h)) if (!(f in c)) out.push({ kind: 'missing', at: `${k}.${f}`, text: 'missing' });
            for (const f of Object.keys(c)) if (!(f in h)) out.push({ kind: 'extra', at: `${k}.${f}`, text: plain(c[f]).slice(0, 100) });
            for (const f of Object.keys(h).filter((x) => x in c)) if (plain(h[f]) !== plain(c[f])) out.push({ kind: 'content', at: `${k}.${f}`, text: `${plain(h[f]).slice(0, 140)} → ${plain(c[f]).slice(0, 140)}` });
            continue;
        }
        if (typeof hand[k] === 'function') { if (typeof comp[k] !== 'function') out.push({ kind: 'missing', at: k, text: 'hook missing' }); continue; }
        if (plain(hand[k]) === plain(comp[k])) continue;
        if (Array.isArray(hand[k]) && Array.isArray(comp[k])) {
            const h = hand[k].map(plain), c = comp[k].map(plain);
            const gone = h.filter((r) => !c.includes(r)), added = c.filter((r) => !h.includes(r));
            out.push({ kind: 'content', at: k, text: gone.length || added.length ? `${h.length} → ${c.length}; hand only: ${gone.join(' | ').slice(0, 400) || '-'}; compiled only: ${added.join(' | ').slice(0, 400) || '-'}` : 'same entries, another order' });
        } else out.push({ kind: 'content', at: k, text: `${plain(hand[k]).slice(0, 160)} → ${plain(comp[k]).slice(0, 160)}` });
    }
    return out;
}

// Sample items of every template the proof set reads: the hooks must agree on each.
const SAMPLES = [
    { q: { cell: { payload: { rows: 3, cols: 4 } } }, b: { n: '', a: 3, b: 4, wrong: {} } },
    { q: { cell: { payload: {} } }, b: { n: '', a: 6, b: 7, wrong: {} } },
    { q: { cell: { payload: { rows: [2, 3, 4], cols: [5, 6, 7] } } }, b: { n: '', wrong: {} }, only: 'chartWindow' },
    { q: { cell: { template: 'function-table', payload: { rows: [{ x: 2, y: 6 }, { x: 3, y: 9 }, { x: 4, y: 12 }], rule: [{ op: 'x', n: 3 }] } } }, b: { wrong: { addfortimes: '+, 4' } } },
    { q: { cell: { template: 'function-table', payload: { rows: [{ x: 9, y: 5 }, { x: 7, y: 3 }, { x: 6, y: 2 }], rule: [{ op: '-', n: 4 }] } } }, b: { wrong: {} } },
    { q: { cell: { payload: { steps: [{ a: 8, b: 5, op: '+', ans: 13 }], unit: 'apples', lines: ['Sam has 8 apples.', 'He gets 5 more.', 'How many apples now?'] } } }, b: { ans: '13', wrong: {} } },
    { q: { cell: { payload: {} } }, b: { n: 305, wrong: {} } },
    { q: { cell: { payload: { kind: 'compare', a: 41, b: 39 } } }, b: { n: '', wrong: {} } },
    { q: { cell: { payload: {} }, pv: { kind: 'times', n: 3078, m: 307, digit: 3, v0: 3000, v1: 300, rel: '10 times', place: 1000, placeM: 100, dir: 'times' } }, b: { n: 3078, wrong: {} }, only: 'pvTimes', onlyFor: ['g4-nbt1-ten-times-value'] },
    { q: { cell: { payload: { unit: 'beads', lines: ['Ann has 4 bags of 6 beads.', 'She gives away 5 beads.', 'How many beads does Ann have left?'], steps: [{ a: 4, b: 6, op: '*', ans: 24 }, { bottom: 5, op: '-', ans: 19 }] } } }, b: { wrong: {} }, only: 'twoStep', onlyFor: ['g3-oa8-two-step-wp'] },
];
const sameOut = (f, g, args) => { let a, b; try { a = plain(f(...args)); } catch (e) { a = `throws ${e.message}`; } try { b = plain(g(...args)); } catch (e) { b = `throws ${e.message}`; } return a === b ? null : `${a.slice(0, 120)} vs ${b.slice(0, 120)}`; };

const rows = [];
for (const { file, card } of cards) {
    const rel = path.relative(ROOT, file);
    let out;
    try { out = COMPILE.compileLesson(card); } catch (e) { fails.push(`${rel}: does not compile: ${e.message}`); continue; }
    pass++;
    const lib = [];
    for (const [id, r] of Object.entries(out.library.routines)) lib.push(...SCHEMA.validateRoutine(id, r, known));
    for (const [id, l] of Object.entries(out.library.lessons)) lib.push(...SCHEMA.validateLesson(id, l, Object.assign({ routines: out.library.routines }, known)));
    ok(!lib.length, `${rel}: library entry fails the schema: ${lib.join('; ')}`);
    const dv = DET.validateDescription(out.detailed);
    ok(!dv.length, `${rel}: description fails validateDescription: ${dv.join('; ')}`);
    const hand = DET.DETAILED_LESSONS[card.id];
    const ds = diff(hand, out.detailed);
    const missing = ds.filter((d) => d.kind === 'missing');
    ok(!missing.length, `${rel}: the compiled description lacks ${missing.map((d) => d.at).join(', ')}`);
    // the hooks agree on the sample items
    const hookDiffs = [];
    // (a sample of another lesson's template is skipped: a hand hook was only ever written for its own items)
    for (const s of SAMPLES.filter((x) => (!x.only || out.detailed.compiled.readers.includes(x.only)) && (!x.onlyFor || x.onlyFor.includes(card.id)))) {
        if (typeof hand.vars === 'function') {
            // the compiled hook may name MORE (a shape reads several templates); it must agree on every name the hand hook
            // gives, and never shadow a base name (n, ans, say ...) the hand hook left to the kit
            let h = {}, c = {};
            try { h = hand.vars(s.q, s.b) || {}; } catch (e) { h = { throws: e.message }; }
            try { c = out.detailed.vars(s.q, s.b) || {}; } catch (e) { c = { throws: e.message }; }
            const bad = Object.keys(h).filter((k) => plain(h[k]) !== plain(c[k])).concat(Object.keys(c).filter((k) => !(k in h) && BASE.includes(k)).map((k) => `${k} (shadows the base name)`));
            if (bad.length) hookDiffs.push(`vars: ${bad.join(', ')}`);
        }
        if (hand.checkQuestion && typeof hand.checkQuestion.show === 'function') { const d = sameOut(hand.checkQuestion.show, out.detailed.checkQuestion.show || ((v) => v), ['+, 3', s.q]); if (d) hookDiffs.push(`checkQuestion.show: ${d}`); }
        if (typeof hand.lastName === 'function') { const d = sameOut(hand.lastName, out.detailed.lastName || (() => ''), [s.q]); if (d) hookDiffs.push(`lastName: ${d}`); }
        if (typeof hand.answerShow === 'function') { const d = sameOut(hand.answerShow, out.detailed.answerShow || ((t) => t), ['+, 3 · 4000']); if (d) hookDiffs.push(`answerShow: ${d}`); }
        if (hand.lessonData && typeof hand.lessonData.chartSay === 'function') { const d = sameOut(hand.lessonData.chartSay, out.detailed.lessonData.chartSay || (() => ''), [s.q]); if (d) hookDiffs.push(`chartSay: ${d}`); }
    }
    const holdout = ['g4-nbt1-ten-times-value', 'g3-oa8-two-step-wp'].includes(card.id);
    // (a hold-out's hand hook reads items no sample above is: its own template's reader is compared in its DIFF.md section)
    ok(!hookDiffs.length, `${rel}: the compiled hooks differ from the hand-written ones: ${[...new Set(hookDiffs)].join('; ')}`);
    const content = ds.filter((d) => d.kind !== 'missing');
    rows.push({ id: card.id, unit: card.unit, holdout, diffs: ds, notes: out.notes });
    log(`  ${card.id}: compiles; library ${lib.length ? 'FAIL' : 'ok'}; description ${dv.length ? 'FAIL' : 'ok'}; missing fields ${missing.length}; content differences ${content.length}; hooks ${hookDiffs.length ? 'DIFFER' : 'agree'}`);
}

// ws-lesson-card --check on the proof cards, and the generated unit files
const runNode = (argv) => { try { return { code: 0, out: execFileSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; } catch (e) { return { code: e.status || 1, out: String(e.stdout || '') }; } };
const chk = runNode(['tests/scripts/ws-lesson-card.mjs', '--check', ...cards.map((c) => path.relative(ROOT, c.file))]);
ok(chk.code === 0, `ws-lesson-card --check on the proof cards: ${chk.out.split('\n').filter((l) => /: (?!resolves)|FAIL/.test(l) && !/NEEDS/.test(l)).join(' / ')}`);
for (const unit of [...new Set(cards.map((c) => c.card.unit))]) {
    const st = runNode(['tests/scripts/ws-lesson-card.mjs', '--compile', '--unit', unit, '--check']);
    ok(st.code === 0, `units/${unit}.js is stale (run ws-lesson-card --compile --unit ${unit})`);
    const mod = await imp(`js/modules/lessons/units/${unit}.js`).catch((e) => ({ err: e }));
    ok(!mod.err && mod.DETAILED && cards.filter((c) => c.card.unit === unit).every((c) => mod.DETAILED[c.card.id]), `units/${unit}.js exports every compiled description${mod.err ? ` (${mod.err.message})` : ''}`);
}

if (process.argv.includes('--report')) {
    const L = ['# Compiled vs hand-written: the structural report', '',
        'GENERATED by `node tests/scripts/ws-lesson-compile-unit.mjs --report`. Every difference between a compiled description', '(cards → `lessons/compile.js`) and the passed hand-written one (`lessons/detailed/<id>.js`). `DIFF.md` explains each class.', ''];
    for (const r of rows) {
        L.push(`## ${r.id} (${r.unit})${r.holdout ? ' — hold-out' : ''}`, '');
        L.push(`Compiler notes: ${r.notes.join('; ') || 'none'}.`, '');
        L.push('| Kind | Where | Difference |', '|---|---|---|');
        for (const d of r.diffs) L.push(`| ${d.kind} | ${d.at} | ${String(d.text).replace(/\|/g, '/').replace(/\n/g, ' ')} |`);
        if (!r.diffs.length) L.push('| - | - | none |');
        L.push('');
    }
    fs.mkdirSync(path.join(ROOT, 'design/lessons/proof'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'design/lessons/proof/STRUCTURE.md'), L.join('\n'));
    log('  wrote design/lessons/proof/STRUCTURE.md');
}

for (const f of fails) log(`  FAIL ${f}`);
log(fails.length ? `ws-lesson-compile-unit: FAIL (${fails.length} of ${pass + fails.length} checks)` : `ws-lesson-compile-unit: OK (${pass} checks)`);
process.exit(fails.length ? 1 : 0);
