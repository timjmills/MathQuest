// js/modules/sheet/graphics/two-step-bar.js
// Library entry `twoStepBar` (design/GRAPHIC_LIBRARY.md; two-step card 2026-11-13): the SCHEMATIC
// two-step bar model, WDS 18.1 / RP-70 / RP-72. A Step 1 bar (equal groups when the first step is
// × / ÷, part-whole when it is + / −) sits over a Step 2 bar; the Step 1 answer box is joined to
// the Step 2 carried box by a 0.75 pt arrow labelled "Step 1 answer". Each bar carries exactly one
// `?` writing place - its step's unknown.
//
// Schematic and fixed (RP-72: a bar length must never draw which number is bigger): equal groups
// are `n` equal segments (at most 6 drawn), a part-whole bar is split 60 / 40, nothing is dashed.
// Bars 10 / 12 / 14 mm tall (S / M / L), 1.5 pt outline; writing boxes slot-size, 0.75 pt. The
// boxes are WORKING (`data-ws-graded="0"`): the pupil's scratch, the key writes them all when
// `show`. Screen twin: the boxes are typed inputs (scratch, mq-wwork) carrying their value.
//
// Pure module (SCC-01).

import { INK, GREY, L, P, B, isTwin, sizeOf, digitPt, esc, blankWidth, NUM_FEATURES } from './units.js';

export const TS_BAR_H = Object.freeze({ S: 10, M: 12, L: 14 });

const fmt = (n) => Number(n).toLocaleString('en-US');

/**
 * The two bars of a two-step story, as the descriptors the drawing uses. Each bar is
 * {whole: {v, unknown, carry}, parts: [{v, unknown, carry, count}]} where `count` draws a run of
 * equal segments (equal groups) and a plain part is one box. Exactly one box per bar has
 * `unknown: true`; the Step 1 answer box has `carry: true` on both bars (the arrow joins them).
 */
export function twoStepBars(steps) {
    if (!Array.isArray(steps) || steps.length !== 2) return null;
    const [s1, s2] = steps;
    const cap = (n) => Math.max(2, Math.min(6, Number(n) || 2));
    let bar1, bar2;
    // Step 1 bar: the unknown is the Step 1 answer (the carry).
    if (s1.op === '*') {
        // a1 groups of b1 each; the whole (= Step 1 answer) is unknown, each segment labelled b1
        bar1 = { whole: { v: s1.ans, unknown: true, carry: true }, parts: [{ v: s1.b, count: cap(s1.a) }] };
    } else if (s1.op === '/') {
        // s1.top shared among s1.bottom; the whole is known, one share (= Step 1 answer) is unknown
        bar1 = { whole: { v: s1.top }, parts: [{ v: s1.ans, count: cap(s1.bottom), unknown: true, carry: true }] };
    } else if (s1.op === '+') {
        // part-whole: the whole (= Step 1 answer) is unknown, two known parts
        bar1 = { whole: { v: s1.ans, unknown: true, carry: true }, parts: [{ v: s1.top }, { v: s1.bottom }] };
    } else { // '-'
        // part-whole: the whole is known, one known part and the unknown (= Step 1 answer)
        bar1 = { whole: { v: s1.top }, parts: [{ v: s1.bottom }, { v: s1.ans, unknown: true, carry: true }] };
    }
    // Step 2 bar: it carries the Step 1 answer; the unknown is the final answer.
    const carry = s1.ans;
    if (s2.op === '*') {
        bar2 = { whole: { v: s2.ans, unknown: true }, parts: [{ v: carry, count: cap(s2.b), carry: true }] };
    } else if (s2.op === '/') {
        bar2 = { whole: { v: s2.top, carry: true }, parts: [{ v: s2.ans, count: cap(s2.bottom), unknown: true }] };
    } else if (s2.op === '+') {
        bar2 = { whole: { v: s2.ans, unknown: true }, parts: [{ v: carry, carry: true }, { v: s2.bottom }] };
    } else { // '-'
        bar2 = { whole: { v: s2.top, carry: true }, parts: [{ v: s2.bottom }, { v: s2.ans, unknown: true }] };
    }
    return [bar1, bar2];
}

/**
 * @param {Object} ctx
 * @param {Object} o {steps (the word-work payload's two steps), show (write the numbers), ink}
 */
export function twoStepBar(ctx, o = {}) {
    const bars = twoStepBars(o.steps);
    if (!bars) return '';
    const { show = false, ink = null } = o;
    const size = sizeOf(ctx);
    const twin = isTwin(ctx);
    const segH = TS_BAR_H[size] || 14;
    const hw = { S: 8, M: 9, L: 10 }[size] || 10;
    const lw = Math.max(14, blankWidth(2, size));
    const W = Math.max(42, twin ? 56 : 68);
    // a writing box: `?` when the step's unknown (filled with its value on the key), else the number
    const box = (cell) => {
        const q = cell.unknown && !show;
        const v = q ? '?' : fmt(cell.v);
        const col = ink === 'trace' ? GREY : INK;
        if (twin) {
            return `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(String(cell.v))}" data-ws-graded="0" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="bar number" style="box-sizing:border-box;width:max(40px, ${L(ctx, lw)});height:max(40px, ${L(ctx, hw)});border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, digitPt(ctx))};font-weight:700;text-align:center;padding:0;margin:0;">`;
        }
        return `<span data-ws-graded="0" data-ws-slot="bar" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, lw)};height:${L(ctx, hw)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;padding:0 ${L(ctx, 1)};color:${col};${NUM_FEATURES}"${show && ink ? ` data-ws-ink="${ink}"` : ''}>${show || !q ? esc(v) : '?'}</span>`;
    };
    // one outlined segment (1.5 pt) holding its writing box
    const seg = (w, cell, left) => `<span style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${twin ? `max(48px, ${L(ctx, segH)})` : L(ctx, segH)};border:${B(ctx, 1.5)} solid ${INK};${left ? '' : 'border-left:none;'}background:#fff;">${box(cell)}</span>`;
    // a bar: the whole row over the parts row; equal groups draw `count` equal segments (cap 6)
    const drawBar = (bar) => {
        const whole = `<div style="display:flex;">${seg(W, bar.whole, true)}</div>`;
        const groups = bar.parts.find((p) => p.count);
        let parts;
        if (groups) {
            const n = groups.count;
            const w = W / n;
            parts = Array.from({ length: n }, (_, i) => seg(w, i === 0 ? groups : { v: groups.v }, true)).join('');
        } else {
            const [pa, pb] = bar.parts;
            // never proportional: 60 / 40, the unknown part no longer than the other (RP-72)
            const wa = pa.unknown ? 0.4 * W : (pb && pb.unknown ? 0.6 * W : 0.5 * W);
            parts = pb ? seg(wa, pa, true) + seg(W - wa, pb, false) : seg(W, pa, true);
        }
        return `<div class="mq-ts2bar-row" style="display:flex;flex-direction:column;gap:${L(ctx, 1.2)};">${whole}<div style="display:flex;">${parts}</div></div>`;
    };
    // the arrow between the bars, labelled "Step 1 answer" (0.75 pt down-arrow)
    const arrow = `<div class="mq-ts2bar-arrow" aria-hidden="true" style="display:flex;align-items:center;gap:${L(ctx, 1.5)};padding:${L(ctx, 0.5)} 0;">`
        + `<svg width="${twin ? '14' : L(ctx, 4)}" height="${twin ? '18' : L(ctx, 6)}" viewBox="0 0 4 6" style="flex:none;">`
        + `<path d="M2 0.4 L2 4.4 M0.8 3.4 L2 4.8 L3.2 3.4" fill="none" stroke="${INK}" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        + `<span style="font-size:${P(ctx, digitPt(ctx) * 0.6)};font-weight:700;color:${INK};line-height:1;">Step 1 answer</span></div>`;
    return `<div class="mq-ts2bar" aria-label="two-step bar model" style="flex:none;display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 1)};margin-top:${L(ctx, 1.5)};">`
        + `${drawBar(bars[0])}${arrow}${drawBar(bars[1])}</div>`;
}
