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
//   CAP-BAND   (--print, browser; lead ruling R1 2026-11-13, card decision 9 re-signed) multi_step_word (Visual) - the bar
//              ABOVE the column work - holds its ruled capacity on the practice pages (independent / more-practice / test):
//              at least S 2 / M 1 / L 1 stories a page (CAP), and no cell keeps an empty band of 30 % or more of its height
//              under its lowest ink (BAND, RUBRIC H13; a one-story page at M / L stretched its cell to the page: 41 % / 32 %).
//              `--html F --size M` measures one saved pupil page instead (the backtest's PASS fixture).
// Skills outside the card print OK (n/a).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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

if (args.includes('--print')) await printMode();

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

/** CAP-BAND (browser): the ruled capacity of the (Visual) practice pages and the band under each cell's ink. Exits. */
async function printMode() {
    if (!arg('--html', null) && !mine.includes('algebra:multi_step_word')) { console.log(`${TOOL}: OK (--print n/a: multi_step_word (Visual) not in scope)`); process.exit(0); }
    if (ROOT !== resolve(join(HERE, '..', '..')) && !process.env.MQ_ROOT) process.env.MQ_ROOT = ROOT;
    const H = createRequire(import.meta.url)(join(HERE, '..', 'lib', 'ws-harness.cjs'));
    // card decision 9 (re-signed 2026-11-13, lead ruling R1 (a)): the bar above the column work, S 2 / M 1 / L 1
    const PIN = { S: 2, M: 1, L: 1 };
    const ROLES = ['independent', 'more-practice', 'test'];
    const SIZES = String(arg('--sizes', 'S,M,L')).split(',').map((x) => x.trim()).filter(Boolean);
    const html = arg('--html', null);
    const out = [];
    const bad = (rule, msg) => out.push(`${rule} ${msg}`);
    const measure = (pageHtml) => {
        const d = document.createElement('div'); d.id = '__ts2'; d.innerHTML = pageHtml; document.body.appendChild(d);
        const mm = (px) => px / 96 * 25.4;
        const cells = [...d.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
        const res = cells.map((c) => {
            const r = c.getBoundingClientRect();
            const cs = getComputedStyle(c);
            const inner = r.bottom - parseFloat(cs.paddingBottom || 0) - parseFloat(cs.borderBottomWidth || 0);
            let low = r.top + parseFloat(cs.paddingTop || 0);
            for (const e of c.querySelectorAll('*')) {
                if (e.closest('[data-ws-label]') || e.children.length && !(e instanceof SVGSVGElement) && !e.textContent.trim() && !/border/.test(e.getAttribute('style') || '')) continue;
                if (e.closest('svg') && !(e instanceof SVGSVGElement)) continue;
                const b = e.getBoundingClientRect();
                if (b.width < 0.5 || b.height < 0.5) continue;
                const st = getComputedStyle(e);
                if (st.visibility === 'hidden' || st.display === 'none') continue;
                const inked = (e.children.length === 0 && e.textContent.trim()) || e instanceof SVGSVGElement || parseFloat(st.borderBottomWidth) > 0 || parseFloat(st.borderTopWidth) > 0;
                if (inked) low = Math.max(low, b.bottom);
            }
            return { h: mm(r.height), band: mm(Math.max(0, inner - low)) };
        });
        d.remove();
        return res;
    };
    const app = await H.open({});
    try {
        if (html) {
            const size = arg('--size', 'M');
            const r = await app.page.evaluate(async (h, f) => { await document.fonts.ready; return (0, eval)(`(${f})`)(h); }, readFileSync(resolve(html), 'utf8'), measure.toString());
            r.forEach((c, i) => { if (c.band / c.h >= 0.3) bad('BAND', `${html} ${size} cell ${i + 1}: ${c.band.toFixed(1)} mm empty under the work in a ${c.h.toFixed(1)} mm cell (${Math.round(100 * c.band / c.h)} %, H13 >= 30 %)`); });
            if (!r.length) bad('BAND', `${html}: no kit cell`);
        } else {
            for (const role of ROLES) for (const size of SIZES) {
                const r = await app.page.evaluate(async (a, f) => {
                    const s = await window.buildSheet({ role: a.role, sections: [{ skills: [{ categoryId: 'algebra', skillId: 'multi_step_word' }], columns: 'auto' }], size: a.size, look: 'auto', paper: 'A4', seed: 7, form: 'A', key: true, anchors: 'off' });
                    await document.fonts.ready;
                    const m = s.plan && s.plan.meta;
                    return { items: m && Number.isFinite(Number(m.items)) ? Number(m.items) : (s.items || []).length, cells: (0, eval)(`(${f})`)(s.pupilHtml) };
                }, { role, size }, measure.toString());
                if (r.items < PIN[size]) bad('CAP', `multi_step_word (Visual) ${role} ${size}: ${r.items} stories a page, the card rules ${PIN[size]} (decision 9)`);
                r.cells.forEach((c, i) => { if (c.band / c.h >= 0.3) bad('BAND', `multi_step_word (Visual) ${role} ${size} cell ${i + 1}: ${c.band.toFixed(1)} mm empty under the work in a ${c.h.toFixed(1)} mm cell (${Math.round(100 * c.band / c.h)} %, H13 >= 30 %)`); });
                if (!r.cells.length) bad('BAND', `multi_step_word (Visual) ${role} ${size}: no kit cell on the page`);
            }
        }
    } finally { await app.close(); }
    for (const r of ['CAP', 'BAND']) { const n = out.filter((x) => x.startsWith(r + ' ')).length; console.log(`CAP-BAND ${r.padEnd(5)} ${n ? `FAIL ${n}` : 'PASS'}`); }
    for (const f of out.slice(0, 30)) console.log(`  ${f}`);
    console.log(out.length ? `${TOOL}: FAIL (--print: ${out.length} finding(s))` : `${TOOL}: OK (--print: CAP-BAND, multi_step_word (Visual) ${html ? 'fixture' : `${ROLES.length} roles x ${SIZES.join('/')}`})`);
    process.exit(out.length ? 1 : 0);
}
