// js/modules/sheet/graphics/sentence-frame.js
// Library entry `sentenceFrame` (design/GRAPHIC_LIBRARY.md): the number sentence `[ ] ◯ [ ] = [ ]`.
// The pupil writes the two numbers in the boxes and the sign IN THE CIRCLE (c-research §2: the K-2
// story's answer area); the last box is the `answerArea` - the one scored place, the unit word
// printed beside it. The first two boxes and the circle are working (`data-ws-graded="0"`); the key
// fills every place (AK-1). Box widths come from the band's widest number (`digits`), the same on
// every item of a page (L-LEAK).
//
// Screen twin: the number boxes and the circle are typed inputs (scratch, `class` mq-wwork, which
// js/modules/word-work-screen.js restricts to digits / to + − × ÷ and marks green); the answer is the
// host's graded box (answerArea twinHook).
//
// Pure module (SCC-01).

import { INK, L, P, B, isTwin, sizeOf, digitPt, textPt, esc, tw, colorOf, NUM_FEATURES, FONT, PT_MM } from './units.js';
import { answerArea, boxW, boxH } from './answer-area.js';

/** The sign circle's diameter: 9 / 11 / 13 mm (c-research §2 suggests 9 / 10 / 12). */
export const CIRCLE_D = Object.freeze({ S: 9, M: 11, L: 13 });

/**
 * @param {Object} ctx
 * @param {Object} o {a, b, op (the glyph: + − × ÷), ans, unit, digits = 2, show = false (write the
 *                    values: the key / a trace / finished work), ink, ids = {a, op, b, answer},
 *                    twinHook}
 */
export function sentenceFrame(ctx, o = {}) {
    const { a = '', b = '', op = '', ans = '', unit = '', digits = 2, show = false, ink = null, twinHook = 'cell', unitChars = 0, under = false } = o;
    const ids = Object.assign({ a: 'fr0-a', op: 'op0', b: 'fr0-b', answer: 'answer' }, o.ids || {});
    const twin = isTwin(ctx);
    const h = boxH(ctx);
    const w = boxW(ctx, digits);
    const col = colorOf(ink);
    const face = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;width:${tw(ctx, w)};height:${tw(ctx, h)};`
        + `border:${B(ctx, 1)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;${FONT}font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;`
        + `color:${col};text-align:center;${NUM_FEATURES}`;
    const numBox = (id, v) => (twin
        ? `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(v)}" data-ws-graded="0" maxlength="${Math.max(1, digits)}" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="number" style="${face}padding:0;margin:0;">`
        : `<span data-ws-slot="${esc(id)}" data-ws-shape="box" data-ws-graded="0"${show && ink ? ` data-ws-ink="${ink}"` : ''} style="${face}">${show ? esc(v) : ''}</span>`);
    const d = twin ? 11 : (CIRCLE_D[sizeOf(ctx)] || 13);
    const ring = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;width:${tw(ctx, d)};height:${tw(ctx, d)};`
        + `border:${B(ctx, 1)} solid ${INK};border-radius:50%;background:#fff;${FONT}font-size:${P(ctx, digitPt(ctx) * 0.85)};font-weight:700;line-height:1;color:${col};text-align:center;`;
    const circle = twin
        ? `<input type="text" class="mq-wwork mq-gl-sign" data-mq-kind="sign" data-mq-expect="${esc(op)}" data-ws-graded="0" maxlength="1" autocomplete="off" spellcheck="false" aria-label="sign: plus or minus" style="${ring}padding:0;margin:0;">`
        : `<span data-ws-slot="${esc(ids.op)}" data-ws-shape="circle" data-ws-graded="0"${show && ink ? ` data-ws-ink="${ink}"` : ''} style="${ring}">${show ? esc(op) : ''}</span>`;
    const eq = `<span aria-hidden="true" style="flex:none;${FONT}font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${INK};">=</span>`;
    const answer = answerArea(ctx, { id: ids.answer, shown: show ? String(ans) : '', expect: String(ans), digits, unit, ink: show ? ink : null, twinHook, unitChars, under });
    return `<div class="mq-gl-sentence" role="group" aria-label="number sentence" style="display:flex;align-items:center;flex-wrap:nowrap;gap:${twin ? '6px' : L(ctx, 1.6)};${(twin || under) && unit ? `padding-bottom:${P(ctx, twin ? 18 : 20)};` : ''}">`
        + `${numBox(ids.a, a)}${circle}${numBox(ids.b, b)}${eq}${answer}</div>`;
}

/** The frame's width in mm (paper), for a cell that decides whether it fits a column. */
export function sentenceFrameWidthMm(ctx, { digits = 2, unitChars = 0 } = {}) {
    const w = boxW(ctx, digits), d = CIRCLE_D[sizeOf(ctx)] || 13;
    const eqW = digitPt(ctx) * 0.6 * PT_MM;
    const unitW = unitChars ? unitChars * (textPt(ctx) + 2) * 0.55 * PT_MM + 2 : 0;
    return 3 * w + d + eqW + 4 * 1.6 + unitW;
}
