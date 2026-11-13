// js/modules/sheet/lesson-arch/story.js
// ARCHETYPE PLUG-IN "story" (the detailed lesson maker, lesson 2: put together / add to within 20): a one-step story with
// its part-whole bar - the bar's step states, the lesson's own chart steps, and the cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { operandsOf } from '../roles/compose.js';
import { resolveCtx, getCell } from '../index.js';
import { twoStepPart } from '../cells/word-work.js';

/** A two-part story's parts [a, b] as numbers, or null. */
export function wpParts(it) {
    const o = operandsOf((it && it.q) || {}).map(Number);
    return o.length >= 2 && o.every(Number.isFinite) ? o : null;
}

/** The named cases of a story lesson. */
export const CASES = Object.freeze({
    // The detailed lesson maker, lesson 2 (put together / add to within 20, RESEARCH.md): two parts.
    wpBridge: (it) => { const o = wpParts(it); return !!o && o[0] >= 2 && o[1] >= 2 && o[0] <= 9 && o[1] <= 9 && o[0] + o[1] >= 11; },
    wpBridgeBigFirst: (it) => { const o = wpParts(it); return !!o && CASES.wpBridge(it) && o[0] > o[1]; },
    wpBridgeSmallFirst: (it) => { const o = wpParts(it); return !!o && CASES.wpBridge(it) && o[0] < o[1]; },
    // (a bridge whose whole is 14+: counting on past 10 by 4 or more - where the count slip shows)
    wpBridgeHigh: (it) => { const o = wpParts(it); return !!o && CASES.wpBridge(it) && o[0] + o[1] >= 14 && o[0] !== o[1]; },
    wpEqual: (it) => { const o = wpParts(it); return !!o && o[0] === o[1] && o[0] >= 2; },
    wpWhole20: (it) => { const o = wpParts(it); return !!o && o[0] + o[1] === 20 && o[0] >= 2 && o[1] >= 2 && o[0] !== o[1] && o[0] !== 10; },
    wpEdge: (it) => CASES.wpEqual(it) || CASES.wpWhole20(it),
    wpSixSeven: (it) => { const o = wpParts(it); return !!o && o[0] === 6 && o[1] === 7; },
    wpNineFour: (it) => { const o = wpParts(it); return !!o && o[0] === 9 && o[1] === 4; },
    wpAddTo: (it) => { const o = wpParts(it); return !!o && /\bmore\b/i.test(String((it && it.q && it.q.text) || '')) && o[0] > o[1]; },
    // (lesson 2 r4, critic r2 D1/D4: the story's SITUATION, read from its own words - add to: one
    // person "gets ... more", "now"; put together: two people, "in all", nothing more)
    wpAddToAny: (it) => { const t = String((it && it.q && it.q.text) || ''); return !!wpParts(it) && /\bmore\b/i.test(t) && /\bnow\b/i.test(t); },
    wpPutTogether: (it) => { const t = String((it && it.q && it.q.text) || ''); return !!wpParts(it) && /\bin all\b/i.test(t) && !/\bmore\b/i.test(t); },
    // (exit slip, critic r3 D3: no part is the difference of the parts - 4 + 8 written 8 − 4 = 4 copies a story number)
    wpClean: (it) => { const o = wpParts(it); return !!o && o[0] !== 2 * o[1] && o[1] !== 2 * o[0]; },
    wpBridgePT: (it) => CASES.wpBridge(it) && CASES.wpPutTogether(it) && !CASES.wpEqual(it),
    wpBridgeSmallFirstAT: (it) => CASES.wpBridgeSmallFirst(it) && CASES.wpAddToAny(it),
    wpBridgeBigFirstPT: (it) => CASES.wpBridgeBigFirst(it) && CASES.wpPutTogether(it),
    // The detailed lesson maker, lesson 7 (two-step stories, 3.OA.D.8; multi_step_word msOps): a × or ÷ step that
    // feeds a + or − step, read from the word-work payload's two steps. (Ported from master, 2026-11-07.)
    msAny: (it) => !!msOf(it),
    msMult: (it) => { const s = msOf(it); return !!s && s[0].op === '*'; },
    msDiv: (it) => { const s = msOf(it); return !!s && s[0].op === '/'; },
    msAdd: (it) => { const s = msOf(it); return !!s && s[1].op === '+'; },
    msSub: (it) => { const s = msOf(it); return !!s && s[1].op === '-'; },
    // (★★★, the M3 trap: the Step 2 number is bigger than both small Step 1 numbers - groups and each, or friends and
    // each share - so "Step 2 with a story number" gives a believable answer)
    msEdge: (it) => { const s = msOf(it); if (!s) return false; const sm = s[0].op === '*' ? [s[0].a, s[0].b] : [s[0].b, s[0].ans]; return s[1].bottom > Math.max(...sm); },
    msMid: (it) => !!msOf(it) && !CASES.msEdge(it),
    // (the three two-step errors give three different numbers, none the answer: a Check Question / exit item)
    msClean: (it) => { const s = msOf(it); if (!s) return false; const [s1, s2] = s; const c = s2.bottom;
        const f = (x) => (s2.op === '+' ? x + c : x - c); const m3 = s2.op === '+' ? s1.b + c : Math.abs(s1.b - c);
        const m2 = s1.op === '*' ? f(s1.a + s1.b) : f(s1.a - s1.b); const v = [s1.ans, m3, m2, s2.ans];
        return v.every((x) => x >= 0) && new Set(v).size === 4; },
    msMultAdd: (it) => CASES.msMult(it) && CASES.msAdd(it),
    msMultSub: (it) => CASES.msMult(it) && CASES.msSub(it),
    msDivAdd: (it) => CASES.msDiv(it) && CASES.msAdd(it),
    msDivSub: (it) => CASES.msDiv(it) && CASES.msSub(it),
    msMultMid: (it) => CASES.msMult(it) && CASES.msMid(it),
    msDivMid: (it) => CASES.msDiv(it) && CASES.msMid(it),
});

/** A two-step story's steps whose first step is × or ÷ (msOps, lesson 7), or null. */
export function msOf(it) {
    const c = it && it.q && it.q.cell;
    const st = c && c.template === 'word-work' && c.payload && c.payload.steps;
    return Array.isArray(st) && st.length === 2 && (st[0].op === '*' || st[0].op === '/') ? st : null;
}

/* ---------------------------------------------- a one-step story with its part-whole bar */

/** A word-work story cell drawn with its part-whole bar (add_wp_* with support 'bar'). */
export const isWordBar = (it) => { const cl = it && it.q && it.q.cell; return !!(cl && cl.template === 'word-work' && cl.payload && cl.payload.bar && cl.payload.barKind === 'whole' && (cl.payload.steps || []).length === 1); };
export const barNums = (it) => { const st = it.q.cell.payload.steps[0]; return { a: st.a, b: st.b, ans: st.ans, unit: it.q.cell.payload.unit || '' }; };

/**
 * `chartSteps` (lesson data; the detailed lesson maker): the chart's steps of a bar story are the
 * LESSON's steps (find the parts - write them in the bar - add for the whole - write the answer and
 * label), each panel's words the lesson's line with the story's numbers ({a} {b} {ans} {unit}).
 */
export function chartStepsOf(it, data) {
    const v = barNums(it);
    const fill = (t) => String(t).replace(/\{(a|b|ans|unit)\}/g, (m, k) => String(v[k]));
    return data.chartSteps.map((t, i) => ({ text: fill(t), marks: [{ slot: `bar-step-${i}`, value: '1' }] }));
}

/** Grey (the newest mark) or black on a span that carries an inline colour. */
export const inkSpan = (html, grey) => html.replace(/color:#000(000)?;?/g, '').replace(/^<span /, `<span data-ws-ink="${grey ? 'trace' : 'solid'}" `).replace(/ style="/, ` style="color:${grey ? '#949494' : '#000'};`);

/**
 * The state of a bar story after step k (P-LC-9: the newest mark grey, earlier ones black):
 *   0  the two story numbers ringed     1  the parts written in the part boxes
 *   2  the whole written in the top box  3  the answer and its label written
 * The cell is the word-work template's own drawing, answered, with later marks emptied.
 */
export function barState(it, k, c, { keepSlots = false } = {}) {
    const v = barNums(it);
    const ctx = resolveCtx(Object.assign({}, c, { state: 'answered', scaffoldLevel: 1, metrics: undefined }));
    // (a compact `layout: 'bar'` cell - the detailed lesson maker - sits in a half-width chart panel)
    const half = ((it.q && it.q.cell && it.q.cell.payload) || {}).layout === 'bar';
    let html = it.render(ctx, { cols: half ? 2 : 1 });
    // the bar labels in drawing order: whole, part a, part b
    let i = 0;
    html = html.replace(/<span data-ws-graded="0" data-ws-slot="bar"([^>]*)>([^<]*)<\/span>/g, (m, attrs, val) => {
        const idx = i++;
        const at = idx === 0 ? 2 : 1;
        const shown = k >= at;
        const span = `<span data-ws-graded="0" data-ws-slot="bar"${attrs.replace(/ data-ws-ink="[a-z]+"/, '')}>${shown ? val : ''}</span>`;
        return shown ? inkSpan(span, k === at) : span;
    });
    // the answer box and its label word: written at step 3
    html = html.replace(/(<span[^>]*data-ws-slot="(answer|answer-label)"[^>]*>)([^<]*)(<\/span>)/g, (m, open, id, val, close) => {
        if (k < 3) return open.replace(/ data-ws-ink="[a-z]+"/, '') + close;
        return k === 3 ? inkSpan(open + val + close, true) : open + val + close;
    });
    // step 0: the two story numbers ringed in grey (later: black) - text only, never inside a tag
    let ringed = 0;
    html = html.replace(/>([^<>]*)</g, (m, text) => (ringed >= 2 ? m : `>${text.replace(new RegExp(`\\b(${v.a}|${v.b})\\b`, 'g'), (n) => (ringed < 2 ? (ringed++, `<span class="mq-lring${k === 0 ? ' mq-lring-t' : ''}">${n}</span>`) : n))}<`));
    return keepSlots ? html : html;
}

/**
 * A two-step story whose first step is x or / (msOps, the detailed lesson maker, lesson 7): panel k draws only its own
 * part (sheet/cells/word-work.js twoStepPart) - 0 the story with the Step 1 numbers ringed grey, 1 Step 1, 2 Step 2 and
 * its unit word - so three panels and the closing line fit one chart. (Ported from master's roles/lesson.js, 2026-11-07.)
 */
export function twoState(it, k, c) {
    const p = it.q.cell.payload;
    const ctx = resolveCtx(Object.assign({}, c, { state: 'blank', scaffoldLevel: 1, metrics: undefined }));
    let html = twoStepPart(p, k, ctx);
    if (k === 0) {
        const s1 = p.steps[0];
        let ringed = 0;
        html = html.replace(/>([^<>]*)</g, (m, text) => (ringed >= 2 ? m : `>${text.replace(new RegExp(`\\b(${s1.a}|${s1.b})\\b`, 'g'), (n) => (ringed < 2 ? (ringed++, `<span class="mq-lring mq-lring-t">${n}</span>`) : n))}<`));
    }
    return html;
}

/**
 * A one-step story in the word-work SENTENCE layout (`[ ] ◯ [ ] = [ ] unit`, visual-quality lane 2026-10-31):
 * panel k draws the story and its sentence with the places of panels 0..k written (the newest grey, P-LC-9),
 * the two story numbers ringed on panel 0 - and no picture row or word bank, so each panel fits half the
 * chart (the full cell in a half panel stuck out of it by 26 mm). The marks name the places (fr0-a, fr0-b,
 * op0, answer), so the panel that writes each one is read from the worked steps, not assumed. (Ported from master.)
 */
export const isWordSentence = (it) => { const cl = it && it.q && it.q.cell; return !!(cl && cl.template === 'word-work' && cl.payload && cl.payload.layout === 'sentence' && (cl.payload.steps || []).length === 1); };
export function sentenceState(it, groups, k, c) {
    // (the part-whole bar is drawn on every panel - WDS 18.1, critic r1 F13 - its boxes written as their step comes; the
    // compare story bar's boxes bar-big / bar-diff too, word-stories fix r2: never written before the step that finds them)
    const p = Object.assign({}, it.q.cell.payload, { pic: null, kb: false, bar: true });
    // (the story is printed in the chart's first row of panels only: the second row draws the bar and the sentence, so
    // the chart and its Say and Rule bands fit the page with the bar drawn - critic r1 F4, content never shrinks)
    // (and the panels draw what their step uses: the story and the bar on the first row - read, then find the parts and
    // the whole - the bar and the number sentence on the second; a 2 x 2 chart with the bar fits under the Rule band)
    if (groups.length >= 4 && k >= 2) p.lines = [];
    if (groups.length >= 4 && k < 2) p.noFrame = true;
    const st = p.steps[0];
    // (a half panel: the cell's column form - the story, then the sentence under it)
    const ctx = Object.assign(resolveCtx(Object.assign({}, c, { state: 'answered', scaffoldLevel: 1, metrics: undefined })), { columns: 2 });
    const t = getCell('word-work');
    let html = '';
    try { html = t.render(p, ctx); } catch (e) { html = ''; }
    const at = new Map();
    groups.forEach((g, gi) => (g.marks || []).forEach((m) => { if (m && m.slot && !at.has(m.slot)) at.set(m.slot, gi); }));
    html = html.replace(/(<span[^>]*data-ws-slot="(fr0-a|fr0-b|op0|answer|bar-w|bar-a|bar-b|bar-big|bar-diff)"[^>]*>)([^<]*)(<\/span>)/g, (m, open, id, val, close) => {
        const g = at.has(id) ? at.get(id) : groups.length - 1;
        const bare = open.replace(/ data-ws-ink="[a-z]+"/, '');
        if (k < g) return bare + close;
        return inkSpan(bare + val + close, k === g);
    });
    let ringed = p.lines.length ? 0 : 2;   // (the story's numbers are ringed where the story is printed, never the bar's)
    html = html.replace(/>([^<>]*)</g, (m, text) => (ringed >= 2 ? m : `>${text.replace(new RegExp(`\\b(${st.a}|${st.b})\\b`, 'g'), (n) => (ringed < 2 ? (ringed++, `<span class="mq-lring${k === 0 ? ' mq-lring-t' : ''}">${n}</span>`) : n))}<`));
    return html;
}

/**
 * A one-step story in COLUMN work on a 2 x 2 chart (word-stories fix r2, 2026-11-13): the whole cell - story, story bar,
 * sign row, columns and answer - is taller than a half panel (the 92 x 114 mm panel overflowed by 24 mm with no bar and
 * 60 mm with the change / compare story bar the card draws on teaching pages). As the sentence form does (sentenceState),
 * each panel draws the zones its step uses: panel 1 the story (read, find what it knows), panel 2 the story bar with what
 * was found written grey over the sign row and the columns, the second row the work (write, solve). Nothing shrinks. Null (the whole cell) for any
 * other item or chart: a payload override for the host item's render (print-sheet.js `payload`), never a new item.
 */
export function columnPanel(it, groups, k) {
    const cl = it && it.q && it.q.cell;
    const p = cl && cl.template === 'word-work' ? cl.payload : null;
    if (!p || !Array.isArray(p.steps) || p.steps.length !== 1 || p.neutral || (p.layout && p.layout !== 'column') || groups.length < 4) return null;
    // panel 1 the story (read, find what it knows); panel 2 the story bar with the numbers found written grey, over the
    // sign row and the columns; panels 3+ the work (write, solve)
    if (k === 0) return { pic: null, kb: false, noWork: true, noBar: true };
    // (the bar is not repeated on the second row: with it a panel of two merged steps overflowed its 114 mm row by a few mm)
    // (`bankBeside: false`: a half panel keeps the bank over the label line - beside it, the answer row ran 11.6 mm off the panel)
    return k === 1 ? { pic: null, kb: false, lines: [], barInk: 'trace', bankBeside: false } : { pic: null, kb: false, lines: [], noBar: true, bankBeside: false };
}

export default { CASES, wpParts, msOf, twoState, isWordSentence, sentenceState, isWordBar, barNums, chartStepsOf, inkSpan, barState, columnPanel };
