// js/modules/sheet/graphics/part-whole-bar.js
// Library entry `partWholeBar` (design/GRAPHIC_LIBRARY.md): the SCHEMATIC part-whole bar, WDS RP-70 /
// RP-72 (V22 XP-G-15) - the whole bar on top, the two part bars under it, each with a writing box
// for its number. Never proportional (RP-72: a bar length must not draw the answer): equal parts are
// drawn equal, else the bigger part takes the longer stock length (60 / 40). Bars 11 / 12.5 / 14 mm
// tall (S / M / L), 1 pt outline; writing boxes slot-size, digits at working size.
//
// Moved here from word-work.js barLayout (detailed lesson 2), which now draws it from the library, so
// the bar is drawn the same way wherever it is used. The boxes are WORKING (`data-ws-graded="0"`);
// `gradeParts` grades them (lesson 2's exit slip reads the bar). Screen twin: the boxes are typed
// inputs (scratch, mq-wwork) carrying the value expected.
//
// Pure module (SCC-01).

import { INK, GREY, L, P, B, isTwin, sizeOf, digitPt, esc, blankWidth, KEY_FEATURES } from './units.js';

export const BAR_SEG_H = Object.freeze({ S: 11, M: 12.5, L: 14 });

/**
 * @param {Object} ctx
 * @param {Object} o {whole, a, b, wMm (the whole bar's length, >= 42), show (write the numbers),
 *                    ink, gradeParts}
 */
export function partWholeBar(ctx, o = {}) {
    const { whole, a: pa, b: pb, show = false, ink = null, gradeParts = false } = o;
    const size = sizeOf(ctx);
    const twin = isTwin(ctx);
    const segH = BAR_SEG_H[size] || 14;
    const hw = { S: 8, M: 9, L: 10 }[size] || 10;
    const lw = Math.max(14, blankWidth(2, size));
    const W = Math.max(42, Number(o.wMm) || 70);
    // (the short stock length always holds its writing box: at least the box + 5 mm)
    const small = Math.min(W / 2, Math.max(0.4 * W, lw + 5));
    const wa = pa === pb ? W / 2 : (pa > pb ? W - small : small);
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const lab = (v) => (twin
        ? `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(String(v))}" data-ws-graded="0" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="bar number" style="box-sizing:border-box;width:max(44px, ${L(ctx, lw)});height:max(44px, ${L(ctx, hw)});border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, digitPt(ctx))};font-weight:700;text-align:center;padding:0;margin:0;">`
        : `<span${gradeParts ? '' : ' data-ws-graded="0"'} data-ws-slot="bar" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, lw)};height:${L(ctx, hw)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;padding:0 ${L(ctx, 1)};color:${ink === 'trace' ? GREY : INK};${KEY_FEATURES}"${show && ink ? ` data-ws-ink="${ink}"` : ''}>${show ? esc(fmt(v)) : ''}</span>`);
    const seg = (w, v, left) => `<span style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${twin ? `max(52px, ${L(ctx, segH)})` : L(ctx, segH)};border:${B(ctx, 1)} solid ${INK};${left ? '' : 'border-left:none;'}background:#fff;">${lab(v)}</span>`;
    return `<div class="mq-wwbar" aria-label="bar model" style="flex:none;display:flex;flex-direction:column;gap:${L(ctx, 1.5)};">`
        + `<div style="display:flex;">${seg(W, whole, true)}</div><div style="display:flex;">${seg(wa, pa, true)}${seg(W - wa, pb, false)}</div></div>`;
}
