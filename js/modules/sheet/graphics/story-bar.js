// js/modules/sheet/graphics/story-bar.js
// Library entry `storyBar` (design/GRAPHIC_LIBRARY.md; word-stories card §3, 2026-11-12): the labelled bars of a one-step
// change or compare story, WDS RP-70 / RP-71 / RP-72.
//
//   change, join      'Now' the whole on top; under it 'First' (known) and 'Then ?' (the change, unknown)
//   change, separate  'First' the whole on top; under it 'Then ?' (what went, unknown) and 'Now' (what is left)
//   compare           two bars, left edges aligned, each named on its left (printed): the bigger amount's bar is the
//                     long one; the smaller amount's bar is 60 % of it, marked ?, with a SOLID difference box beside it
//
// Schematic and fixed per schema (RP-72): the parts of a change bar are drawn EQUAL whatever the numbers, the compare bars
// are 100 % / 60 % + 40 % on every item, so no length draws the answer. Nothing is dashed and nothing is shaded (RP-70;
// card Q6): the unknown is the box with the zone-label ? in its top-left corner and the 1.5 pt outline, the only one.
// The part labels are printed (RP-71: the pupil writes numbers, never words), at zone-label size in each box's top-left
// corner; the writing box sits UNDER the label line (CL-40 keep-out: a label never shares a line with the box).
//
// The writing boxes are WORKING space (`data-ws-graded="0"`): the one answer place is the number sentence's result box
// (VQ-2). The unknown box carries no writing box. The key writes the known numbers in (AK-1); a guided page traces them
// in the single grey (the hint that fades). Screen twin: the boxes are typed scratch inputs (mq-wwork).
//
// Pure module (SCC-01).

import { INK, GREY, L, P, B, isTwin, sizeOf, digitPt, zonePt, esc, blankWidth, NUM_FEATURES, FONT, PT_MM } from './units.js';
import { BAR_SEG_H } from './part-whole-bar.js';

/** The kinds of story this drawing carries, by the word-work schema of the story. */
export const STORY_BAR_KIND = Object.freeze({
    'add-some': 'join-change', 'take-some': 'separate-change',
    'compare-fewer': 'compare-smaller', 'compare-more-smaller': 'compare-smaller',
});

/** The share of the long bar the shorter compare bar takes (the rest is the difference box). */
export const COMPARE_SHORT = 0.6;

/**
 * @param {Object} ctx
 * @param {Object} o {kind ('join-change' | 'separate-change' | 'compare-smaller'), top, bottom, ans (the solving step:
 *                    top − bottom = ans), who: [bigger, smaller] (compare names), wMm (the whole / long bar, mm), digits,
 *                    show (write the known numbers), ink ('trace' | 'solid' | null)}
 */
export function storyBar(ctx, o = {}) {
    const { kind, top, bottom, show = false, ink = null } = o;
    const twin = isTwin(ctx);
    const size = sizeOf(ctx);
    const segH = BAR_SEG_H[size] || 14;
    const zp = zonePt(ctx);
    const labH = zp * PT_MM * 1.1;
    // the writing box fills the segment under its label line (segment = label line + box + 1.2 mm of keep)
    const hw = Math.max(6, segH - labH - 1.8);
    const lw = Math.max(14, blankWidth(Math.max(2, Number(o.digits) || 2), size));
    // (the digits are set to fit the writing box under the label line: working space, never smaller than 16 pt)
    const dpt = Math.max(16, Math.min(digitPt(ctx), (hw - 1.2) / PT_MM));
    const W = Math.max(42, Number(o.wMm) || 64);
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const box = (v, id) => (twin
        ? `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(String(v))}" data-ws-graded="0" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="bar number" style="box-sizing:border-box;width:max(44px, ${L(ctx, lw)});height:max(44px, ${L(ctx, hw)});border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};${FONT}font-size:${P(ctx, dpt)};font-weight:700;text-align:center;padding:0;margin:0;${NUM_FEATURES}">`
        : `<span data-ws-graded="0" data-ws-slot="${esc(id)}" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, lw)};height:${L(ctx, hw)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;${FONT}font-size:${P(ctx, dpt)};font-weight:700;line-height:1;padding:0 ${L(ctx, 1)};color:${ink === 'trace' ? GREY : INK};${NUM_FEATURES}"${show && ink ? ` data-ws-ink="${ink}"` : ''}>${show ? esc(fmt(v)) : ''}</span>`);
    const label = (t) => `<span class="mq-sbzone" style="display:block;align-self:flex-start;${FONT}font-size:${P(ctx, zp)};font-weight:700;line-height:1.1;white-space:nowrap;color:${INK};">${esc(t)}</span>`;
    // one box of a bar: its label line on top (top-left corner), the writing box under it, right of centre
    const seg = (w, { lab = '', v = null, id = 'bar', unknown = false, left = true } = {}) => {
        // (the twin: a 44 px input under its label line; a row stretches its boxes to one height)
        const h = twin ? `max(72px, ${L(ctx, segH)})` : L(ctx, segH);
        const line = unknown ? 1.5 : 1;
        return `<span${unknown ? ' data-sb-unknown="1"' : ''} style="display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;width:${L(ctx, w)};min-height:${h};`
            + `border:${B(ctx, line)} solid ${INK};${left ? '' : 'border-left:none;'}background:#fff;padding:${L(ctx, 0.5)} ${L(ctx, 0.8)} ${L(ctx, 0.6)};">`
            + (lab ? label(lab) : '')
            + (v === null ? '' : `<span style="display:flex;justify-content:center;margin-top:${L(ctx, 0.6)};">${box(v, id)}</span>`) + '</span>';
    };
    const row = (inner, extra = '') => `<div style="display:flex;align-items:stretch;${extra}">${inner}</div>`;
    const gap = L(ctx, 1.5);
    if (kind === 'join-change' || kind === 'separate-change') {
        const half = W / 2;
        const join = kind === 'join-change';
        // join: top − bottom = ans is Now − First = Then; separate: First − Now = Then
        const body = join
            ? row(seg(W, { lab: 'Now', v: top, id: 'bar-w' })) + row(seg(half, { lab: 'First', v: bottom, id: 'bar-a' }) + seg(half, { lab: 'Then ?', unknown: true, left: false }))
            : row(seg(W, { lab: 'First', v: top, id: 'bar-w' })) + row(seg(half, { lab: 'Then ?', unknown: true }) + seg(half, { lab: 'Now', v: bottom, id: 'bar-b', left: false }));
        return `<div class="mq-wwbar mq-storybar" data-sb-kind="${kind}" aria-label="bar model: first, then, now" style="flex:none;display:flex;flex-direction:column;gap:${gap};">${body}</div>`;
    }
    if (kind === 'compare-smaller') {
        const [big = '', small = ''] = Array.isArray(o.who) ? o.who.map((x) => String(x || '').replace(/^The /, '')) : [];
        const nameW = nameWidthMm(zp, Math.max(big.length, small.length));
        const nm = (t) => `<span style="flex:none;display:flex;align-items:center;width:${L(ctx, nameW)};${FONT}font-size:${P(ctx, zp + 1)};font-weight:700;line-height:1.1;color:${INK};">${esc(t)}</span>`;
        const ws = W * COMPARE_SHORT;
        // the long bar: the bigger amount (top); the short bar: the smaller amount (?) and the solid difference box (bottom)
        const body = row(nm(big) + seg(W, { v: top, id: 'bar-big' }))
            + row(nm(small) + seg(ws, { lab: '?', unknown: true }) + seg(W - ws, { v: bottom, id: 'bar-diff', left: false }));
        return `<div class="mq-wwbar mq-storybar" data-sb-kind="${kind}" aria-label="bar model: compare" style="flex:none;display:flex;flex-direction:column;gap:${gap};">${body}</div>`;
    }
    return '';
}

/** The drawing's width in mm (paper): the long bar plus the name column of a compare. */
export function storyBarWidthMm(ctx, o = {}) {
    const W = Math.max(42, Number(o.wMm) || 64);
    if (o.kind !== 'compare-smaller') return W;
    const n = Array.isArray(o.who) ? Math.max(...o.who.map((x) => String(x || '').replace(/^The /, '').length)) : 4;
    return W + nameWidthMm(zonePt(ctx), n);
}

/** The name column of a compare drawing: the longest name at zone size + 1 pt (bold Andika ~0.66 em a letter) + 3 mm. */
function nameWidthMm(zp, chars) {
    return Math.max(14, chars * (zp + 1) * 0.66 * PT_MM + 3);
}
