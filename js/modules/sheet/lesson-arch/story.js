// js/modules/sheet/lesson-arch/story.js
// ARCHETYPE PLUG-IN "story" (the detailed lesson maker, lesson 2: put together / add to within 20): a one-step story with
// its part-whole bar - the bar's step states, the lesson's own chart steps, and the cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { operandsOf } from '../roles/compose.js';
import { resolveCtx } from '../index.js';

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
});

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

export default { CASES, wpParts, isWordBar, barNums, chartStepsOf, inkSpan, barState };
