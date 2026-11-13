// ws-two-step — node checks of the two-step story family against its signed card (design/cards/two-step/two-step.md;
// lane lf-algebra, two-step build 2026-11-13; owner rule: each finding is a check before its fix lands). No browser.
//
//   node tests/scripts/ws-two-step.mjs [--skill cat:a,...] [--root DIR] [--n 120]
//
//   WITHIN-N   (card decision 2) every computed number - the Step 1 result AND the answer - is at most the band
//              (30 / 50 / 100) or, with no band, the Max Number 100; sampled with generateQuestionFor, every band
//   ANS-STORY  (card §3 guards) the answer is no story number and not the Step 1 answer
//   BAR-DRAWN  (decisions 4 / 5) with wpBar on - and by default on multi_step_word (Visual) - a two-step story draws BOTH
//              bars (data-ts-bar 1 and 2) on paper and on the screen twin, and the Step 2 bar carries the Step 1 answer
//              (on the key, a ts2-* box holds the Step 1 result)
//   VISUAL     (decision 5) multi_step_word (Visual) differs from multi_step_word_plain: the item streams differ, or the
//              bar is drawn on the Visual twin and not on the plain one
//   HINT-L0    (decision 6) the hidden middle question prints on the teaching cells (scaffold level >= 2: Model, Guided)
//              and never at level 0 or 1 or on the screen twin
// Skills outside the card print OK (n/a).
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-two-step';
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(HERE, '..', '..')));
const N = Math.max(10, Number(arg('--n', 120)) || 120);
const SCOPE = ['algebra:multi_step_word', 'algebra:multi_step_word_plain', 'algebra:two_step_mult_div_first', 'algebra:two_step_add_then_mult',
    'algebra:two_step_add_then_div', 'algebra:two_step_letter_equation', 'algebra:two_step_estimate_check'];
const only = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter(Boolean);
const mine = only.length ? SCOPE.filter((k) => only.includes(k) || only.includes(k.split(':')[1])) : SCOPE;
if (!mine.length) { console.log(`${TOOL}: OK (n/a: no two-step skill in scope)`); process.exit(0); }

const { loadApp, fnv } = await import(pathToFileURL(join(HERE, 'ws-card-rulings.mjs')).href);
const app = await loadApp(ROOT);
const kit = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'index.js')).href);
const fails = [];
const fail = (rule, msg) => fails.push(`${rule} ${msg}`);
const gen = (skill, opts, i, seedKey = skill) => {
    try { return app.gq.generateQuestionFor({ category: 'algebra', skill, opts, seed: (fnv(`algebra:${seedKey}`) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i % 6 }); } catch (e) { return { __error: e.message }; }
};
/** The two steps of an item from its word-work payload: {a, b (Step 1 numbers), r1 (Step 1 result), c (Step 2 number), ans}. */
const stepsOf = (q) => {
    const st = q && q.cell && q.cell.payload && q.cell.payload.steps;
    if (!Array.isArray(st) || st.length !== 2) return null;
    const [s1, s2] = st;
    const r1 = s1.op === '/' ? s1.q : s1.ans;
    const c = s2.a === r1 ? s2.b : s2.b === r1 ? s2.a : s2.bottom;
    return { a: s1.a, b: s1.b, r1, c, ans: Number(String(q.ans).replace(/,/g, '')) };
};
const short = (k) => k.split(':')[1];

// WITHIN-N and ANS-STORY: every offered band (the + / − skills: the default and 30 / 50 / 100; the x / ÷ presets: 30 / 50)
for (const key of mine) {
    const sk = short(key);
    const addsub = /^multi_step_word|estimate/.test(sk);
    const bands = addsub ? [null, 30, 50, 100] : [30, 50];
    for (const band of bands) {
        const cap = band || 100;
        const bad = [], story = [];
        let read = 0;
        for (let i = 0; i < N; i++) {
            const q = gen(sk, band ? { band } : undefined, i);
            if (!q || q.__error) { bad.push(`threw ${q && q.__error}`); continue; }
            const s = stepsOf(q);
            if (!s) continue;
            read++;
            if (s.r1 > cap || s.ans > cap || s.r1 < 0 || s.ans < 1) bad.push(`Step 1 ${s.r1}, answer ${s.ans}`);
            if ([s.a, s.b, s.c].includes(s.ans) || s.ans === s.r1) story.push(`${s.a}, ${s.b}, ${s.c} -> ${s.r1} -> ${s.ans}`);
        }
        const tag = `${sk} ${band ? `band ${band}` : 'no band (Max Number 100)'}`;
        if (!read) fail('WITHIN-N', `${tag}: no item read as two steps`);
        if (bad.length) fail('WITHIN-N', `${tag}: ${bad.length} of ${N} items over ${cap} (e.g. ${bad.slice(0, 3).join('; ')})`);
        if (story.length) fail('ANS-STORY', `${tag}: ${story.length} of ${N} answers are a story number or the Step 1 answer (e.g. ${story.slice(0, 2).join('; ')})`);
    }
}

// BAR-DRAWN, VISUAL, HINT-L0: render the kit cell
const render = (q, extra) => { try { return kit.renderCell({ cell: q.cell }, Object.assign({ mode: 'print', size: 'M', look: 'ican', state: 'blank', scaffoldLevel: 1 }, extra)); } catch (e) { return ''; } };
const barCases = [];
if (mine.includes('algebra:multi_step_word')) barCases.push(['multi_step_word', undefined, 'by default (Visual)']);
for (const key of mine) barCases.push([short(key), { wpBar: true }, 'wpBar on']);
for (const [sk, opts, why] of barCases) {
    let checked = 0;
    for (let i = 0; i < 12; i++) {
        const q = gen(sk, opts, i);
        if (!q || !q.cell || q.cell.template !== 'word-work') continue;
        const s = stepsOf(q);
        if (!s) continue;
        const p = q.cell.payload || {};
        if (p.layout === 'choose') continue;
        checked++;
        const paper = render(q, {});
        const twin = String(q.visual || '');
        for (const [host, html] of [['paper', paper], ['screen', twin]]) {
            if (!/data-ts-bar="1"/.test(html) || !/data-ts-bar="2"/.test(html)) { fail('BAR-DRAWN', `${sk} ${why} item ${i} (${host}): the two-step bar model is not drawn (Step 1 bar ${/data-ts-bar="1"/.test(html) ? 'yes' : 'no'}, Step 2 bar ${/data-ts-bar="2"/.test(html) ? 'yes' : 'no'})`); break; }
        }
        const key = render(q, { state: 'answered' });
        const vals = (pre) => [...key.matchAll(new RegExp(`data-ws-slot="${pre}-[a-z0-9]+"[^>]*>([^<]*)<`, 'g'))].map((m) => Number(String(m[1]).replace(/,/g, '')));
        if (/data-ts-bar="2"/.test(key) && !(vals('ts1').includes(s.r1) && vals('ts2').includes(s.r1))) fail('BAR-DRAWN', `${sk} ${why} item ${i}: the Step 2 bar does not carry the Step 1 answer ${s.r1} (ts1 ${vals('ts1').join(',')}; ts2 ${vals('ts2').join(',')})`);
        if (fails.length > 40) break;
    }
    if (!checked) fail('BAR-DRAWN', `${sk} ${why}: no two-step item to draw`);
}
if (mine.includes('algebra:multi_step_word') && mine.includes('algebra:multi_step_word_plain')) {
    let sameStream = true, barV = 0, barP = 0;
    for (let i = 0; i < 12; i++) {
        const v = gen('multi_step_word', undefined, i, 'multi_step_word'), pl = gen('multi_step_word_plain', undefined, i, 'multi_step_word');   // (one seed: the twins' own streams)
        if (!v || !pl) continue;
        if (v.text !== pl.text) sameStream = false;
        if (/data-ts-bar="1"/.test(render(v, {}))) barV++;
        if (/data-ts-bar="1"/.test(render(pl, {}))) barP++;
    }
    if (sameStream && !(barV > 0 && barP === 0)) fail('VISUAL', `multi_step_word (Visual) deals and draws the same as multi_step_word_plain (bar on ${barV} / ${barP} of 12 items)`);
}
for (const key of mine) {
    const sk = short(key);
    let seen = 0;
    for (let i = 0; i < 6; i++) {
        const q = gen(sk, undefined, i);
        if (!q || !q.cell || !q.cell.payload || (q.cell.payload.steps || []).length !== 2 || q.cell.payload.letter || q.cell.payload.layout === 'choose') continue;
        for (const lv of [0, 1]) if (/mq-wwmid/.test(render(q, { scaffoldLevel: lv }))) fail('HINT-L0', `${sk} item ${i}: the middle question prints at scaffold level ${lv}`);
        if (/mq-wwmid/.test(String(q.visual || ''))) fail('HINT-L0', `${sk} item ${i}: the middle question prints on the screen`);
        if (/mq-wwmid/.test(render(q, { scaffoldLevel: 3, state: 'answered' }))) seen++;
        else fail('HINT-L0', `${sk} item ${i}: the Model (scaffold level 3) does not print the hidden middle question (decision 6)`);
        if (fails.length > 60) break;
    }
}

const byRule = {};
for (const f of fails) { const r = f.split(' ')[0]; byRule[r] = (byRule[r] || 0) + 1; }
for (const r of ['WITHIN-N', 'ANS-STORY', 'BAR-DRAWN', 'VISUAL', 'HINT-L0']) console.log(`${r.padEnd(10)} ${byRule[r] ? `FAIL ${byRule[r]}` : 'PASS'}`);
for (const f of fails.slice(0, 40)) console.log(`  ${f}`);
if (fails.length > 40) console.log(`  ... and ${fails.length - 40} more`);
console.log(fails.length ? `${TOOL}: FAIL (${fails.length} finding(s), ${mine.length} skill(s))` : `${TOOL}: OK (${mine.length} skill(s): WITHIN-N, ANS-STORY, BAR-DRAWN, VISUAL, HINT-L0)`);
process.exit(fails.length ? 1 : 0);
