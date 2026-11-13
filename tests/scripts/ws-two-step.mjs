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
//   BAND-ALIAS (lead ruling R2 2026-11-13) band 100 is no longer offered on the seven skills (the G2 lesson takes "no band",
//              which at Max Number 100 deals the same), and a share code written with band 100 before the change (pinned
//              below, encoded on 8438ca59d) still decodes to its skill at "no band" (band null) - a round trip, never lost
//   PART-FRAMES (lf-algebra R4) the lesson chart's two-step panel drawing (cells/word-work.js twoStepPart, panels 0-3) of a
//              letter story draws ITS response - the equation (data-ws-slot="equation") on panels 1-3, n = the answer on
//              panel 3 - and of an estimate story the estimate row ("Estimate:") on 2-3 and the Yes / No ring on 3; the
//              four panels differ (the chart drew the whole cell four times). lf-engine routes those panels to it.
//   CAP-BAND   (--print, browser; lead ruling R1 2026-11-13, card decision 9 re-signed) multi_step_word (Visual) - the bar
//              ABOVE the column work - holds its ruled capacity on the practice pages (independent / more-practice / test):
//              at least S 2 / M 1 / L 1 stories a page (CAP), and no cell keeps an empty band of 30 % or more of its height
//              under its lowest ink (BAND, RUBRIC H13; a one-story page at M / L stretched its cell to the page: 41 % / 32 %).
//              Also (lf-algebra R4) two_step_letter_equation with wpBar at L, five seeds: at least 1 a page (card: bar model L 1)
//              and no 30 % band (the options-render "letter + wpBar L PAGEFILL": the one story stretched 1.8x to 172 mm).
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
    const bands = addsub ? [null, 30, 50] : [30, 50];
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

// PART-FRAMES: the chart panels of the letter / estimate stories draw their own response
{
    const ww = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'cells', 'word-work.js')).href).catch(() => null);
    const cases = [['two_step_letter_equation', 'letter'], ['two_step_estimate_check', 'check']].filter(([sk]) => mine.includes(`algebra:${sk}`));
    for (const [sk, kind] of cases) {
        if (!ww || typeof ww.twoStepPart !== 'function') { fail('PART-FRAMES', `${sk}: no twoStepPart in cells/word-work.js`); continue; }
        let seen = 0;
        for (let i = 0; i < 6; i++) {
            const q = gen(sk, undefined, i);
            const p = q && q.cell && q.cell.payload;
            if (!p || (p.steps || []).length !== 2) continue;
            seen++;
            const ctx = kit.resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank', scaffoldLevel: 1 });
            const parts = [0, 1, 2, 3].map((k) => { try { return ww.twoStepPart(p, k, ctx); } catch (e) { return `ERR ${e.message}`; } });
            const need = kind === 'letter'
                ? [[1, /data-ws-slot="equation"/, 'the equation'], [2, /data-ws-slot="equation"/, 'the equation'], [3, /data-ws-slot="equation"/, 'the equation'], [3, /data-ws-slot="answer"/, 'n = the answer']]
                : [[2, /Estimate:/, 'the estimate row'], [3, /Estimate:/, 'the estimate row'], [3, /data-ws-slot="ok-yes"/, 'the Yes / No ring']];
            for (const [k, re, what] of need) if (!re.test(parts[k])) fail('PART-FRAMES', `${sk} item ${i}: chart panel ${k} does not draw ${what}`);
            for (let k = 0; k + 1 < parts.length; k++) if (parts[k] === parts[k + 1]) fail('PART-FRAMES', `${sk} item ${i}: chart panels ${k} and ${k + 1} draw the same`);
            if (fails.length > 60) break;
        }
        if (!seen) fail('PART-FRAMES', `${sk}: no two-step item`);
    }
}

// BAND-ALIAS: band 100 is not offered; the codes written with it before R2 decode to "no band"
{
    const BAND100_CODES = { multi_step_word: 'M7~B100', multi_step_word_plain: 'M8~B100', two_step_mult_div_first: 'ZA~B100', two_step_add_then_mult: 'ZB~B100',
        two_step_add_then_div: 'ZC~B100', two_step_letter_equation: 'ZD~B100', two_step_estimate_check: 'ZE~B100' };   // generateSkillCode on 8438ca59d
    let sc = null;
    try { sc = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'skill-codes.js')).href); } catch (e) { fail('BAND-ALIAS', `skill-codes.js did not load: ${e.message}`); }
    for (const key of mine) {
        const sk = short(key);
        const band = (app.so.offeredOptionsFor('algebra', sk) || []).find((d) => d.id === 'band');
        if (band && (band.values || []).some((x) => x.v === 100)) fail('BAND-ALIAS', `${sk}: band 100 is still offered (R2: the G2 lesson takes "no band")`);
        if (!sc || !BAND100_CODES[sk]) continue;
        const got = sc.parseSkillCodeParts(BAND100_CODES[sk]);
        const one = got.length === 1 ? got[0] : null;
        const norm = one ? app.so.normalizeOptions('algebra', one.skillId, one.opts) : null;
        if (!one || one.skillId !== sk) fail('BAND-ALIAS', `${BAND100_CODES[sk]} decodes to ${one ? one.skillId : 'nothing'}, not ${sk}`);
        else if (norm.band !== null && norm.band !== undefined) fail('BAND-ALIAS', `${BAND100_CODES[sk]} (${sk}, band 100) decodes to band ${norm.band}, not "no band"`);
        else if (sc.generateSkillCode([{ categoryId: 'algebra', skillId: sk, opts: one.opts }]) !== BAND100_CODES[sk].split('~')[0]) fail('BAND-ALIAS', `${BAND100_CODES[sk]} re-encodes as ${sc.generateSkillCode([{ categoryId: 'algebra', skillId: sk, opts: one.opts }])}, not the no-band code ${BAND100_CODES[sk].split('~')[0]}`);
    }
}

const byRule = {};
for (const f of fails) { const r = f.split(' ')[0]; byRule[r] = (byRule[r] || 0) + 1; }
for (const r of ['WITHIN-N', 'ANS-STORY', 'BAR-DRAWN', 'VISUAL', 'HINT-L0', 'BAND-ALIAS', 'PART-FRAMES']) console.log(`${r.padEnd(10)} ${byRule[r] ? `FAIL ${byRule[r]}` : 'PASS'}`);
for (const f of fails.slice(0, 40)) console.log(`  ${f}`);
if (fails.length > 40) console.log(`  ... and ${fails.length - 40} more`);
console.log(fails.length ? `${TOOL}: FAIL (${fails.length} finding(s), ${mine.length} skill(s))` : `${TOOL}: OK (${mine.length} skill(s): WITHIN-N, ANS-STORY, BAR-DRAWN, VISUAL, HINT-L0, BAND-ALIAS, PART-FRAMES)`);
process.exit(fails.length ? 1 : 0);

/** CAP-BAND (browser): the ruled capacity of the (Visual) practice pages and the band under each cell's ink. Exits. */
async function printMode() {
    if (!arg('--html', null) && !mine.includes('algebra:multi_step_word') && !mine.includes('algebra:two_step_letter_equation')) { console.log(`${TOOL}: OK (--print n/a: neither multi_step_word (Visual) nor two_step_letter_equation in scope)`); process.exit(0); }
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
            // the cases: multi_step_word (Visual) on the three practice roles at S / M / L (R1), and - lf-algebra R4, precritic
            // two-step options-render "letter + wpBar L PAGEFILL" - two_step_letter_equation with wpBar at L on the Independent
            // page over five seeds (its bar stands one over the other on ~13 % of items, so a page holds 1 at L: the card's
            // bar-model L 1; the one story must not be stretched to the page either)
            const cases = [];
            if (mine.includes('algebra:multi_step_word')) for (const role of ROLES) for (const size of SIZES) cases.push({ sk: 'multi_step_word', tag: 'multi_step_word (Visual)', opts: null, role, size, seed: 7, pin: PIN[size] });
            if (mine.includes('algebra:two_step_letter_equation') && SIZES.includes('L')) for (const seed of [1, 2, 7, 11, 26]) cases.push({ sk: 'two_step_letter_equation', tag: `two_step_letter_equation wpBar (seed ${seed})`, opts: { wpBar: true }, role: 'independent', size: 'L', seed, pin: 1 });
            for (const c of cases) {
                const { role, size } = c;
                const r = await app.page.evaluate(async (a, f) => {
                    const s = await window.buildSheet({ role: a.role, sections: [{ skills: [{ categoryId: 'algebra', skillId: a.sk, ...(a.opts ? { opts: a.opts } : {}) }], columns: 'auto' }], size: a.size, look: 'auto', paper: 'A4', seed: a.seed, form: 'A', key: true, anchors: 'off' });
                    await document.fonts.ready;
                    const m = s.plan && s.plan.meta;
                    return { items: m && Number.isFinite(Number(m.items)) ? Number(m.items) : (s.items || []).length, cells: (0, eval)(`(${f})`)(s.pupilHtml) };
                }, c, measure.toString());
                if (r.items < c.pin) bad('CAP', `${c.tag} ${role} ${size}: ${r.items} stories a page, the card rules ${c.pin} (decision 9)`);
                r.cells.forEach((x, i) => { if (x.band / x.h >= 0.3) bad('BAND', `${c.tag} ${role} ${size} cell ${i + 1}: ${x.band.toFixed(1)} mm empty under the work in a ${x.h.toFixed(1)} mm cell (${Math.round(100 * x.band / x.h)} %, H13 >= 30 %)`); });
                if (!r.cells.length) bad('BAND', `${c.tag} ${role} ${size}: no kit cell on the page`);
            }
        }
    } finally { await app.close(); }
    for (const r of ['CAP', 'BAND']) { const n = out.filter((x) => x.startsWith(r + ' ')).length; console.log(`CAP-BAND ${r.padEnd(5)} ${n ? `FAIL ${n}` : 'PASS'}`); }
    for (const f of out.slice(0, 30)) console.log(`  ${f}`);
    console.log(out.length ? `${TOOL}: FAIL (--print: ${out.length} finding(s))` : `${TOOL}: OK (--print: CAP-BAND, ${html ? 'fixture' : 'multi_step_word (Visual) / two_step_letter_equation wpBar L'})`);
    process.exit(out.length ? 1 : 0);
}
