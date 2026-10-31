// js/modules/sheet/graphics/answer-area.js
// Library entry `answerArea` (design/GRAPHIC_LIBRARY.md): the ONE scored place of an item (VQ-2) -
// a heavy 1.5 pt box with the unit word PRINTED beside it (c-research §4: units are printed beside
// the box, not written by the pupil; no bank, no distractors). The box width comes from the widest
// answer the skill can deal (`digits`), never from this item's answer (L-LEAK).
//
// Paper: a `data-ws-slot` box (graded) the key writes into. Screen twin: the host's own graded box -
//   twinHook 'cell'   `data-mq-cell` (the host puts its digit input in it; word-work convention)
//   twinHook 'blank'  `data-mq-blank="box"` (the host's answer input moves into it, SL-7)
//
// Pure module (SCC-01).

import { INK, L, P, B, isTwin, sizeOf, digitPt, textPt, esc, blankWidth, tw, colorOf, NUM_FEATURES, FONT, PT_MM } from './units.js';

/** The writing height of a library box (a 2-digit number at the working digit size fits it). */
export const BOX_H = Object.freeze({ S: 11, M: 13, L: 15 });
/** A number box's width for `digits` digits (never narrower than 1.2 x its height). */
export const boxW = (ctx, digits = 2) => (isTwin(ctx) ? TWIN_BOX : Math.max((BOX_H[sizeOf(ctx)] || 15) * 1.1, blankWidth(Math.max(1, digits), sizeOf(ctx))));
/** The screen twin's box (paper mm at --mq-k2): 12 mm, never under 44 px (a phone card holds the whole sentence). */
export const TWIN_BOX = 12;
/** A box's height: the size's writing height, the twin's square box. */
export const boxH = (ctx) => (isTwin(ctx) ? TWIN_BOX : (BOX_H[sizeOf(ctx)] || 15));

/**
 * @param {Object} ctx
 * @param {Object} o  {id = 'answer', shown = '', expect = '', digits = 2, unit = '', ink = null,
 *                     twinHook = 'cell', graded = true, unitChars: reserve room for a unit word this long, so
 *                     every answer box of a page stands in the same place (VQ-7); under: the word hangs under
 *                     the box - a narrow column, and always on screen}
 */
export function answerArea(ctx, o = {}) {
    const { id = 'answer', shown = '', expect = '', digits = 2, unit = '', ink = null, twinHook = 'cell', graded = true, unitChars = 0, under = false } = o;
    const h = boxH(ctx);
    const w = boxW(ctx, digits);
    const face = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;width:${tw(ctx, w)};height:${tw(ctx, h)};`
        + `border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;${FONT}font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;`
        + `color:${colorOf(ink)};text-align:center;${NUM_FEATURES}`;
    let box;
    if (isTwin(ctx)) {
        box = twinHook === 'blank'
            ? `<span class="mq-gl-answer" data-ws-slot="${esc(id)}" data-ws-shape="box" data-mq-blank="box" data-mq-expect="${esc(expect)}" style="${face}"></span>`
            : `<span class="mq-wwans mq-gl-answer" data-ws-slot="${esc(id)}" data-ws-shape="box" data-mq-cell="1" data-mq-w="${Math.max(1, digits)}" data-mq-label="answer" data-mq-expect="${esc(expect)}" style="${face}"></span>`;
    } else {
        box = `<span class="mq-gl-answer" data-ws-slot="${esc(id)}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}${ink ? ` data-ws-ink="${ink}"` : ''} style="${face}">${esc(shown)}</span>`;
    }
    const word = unit
        ? `<span class="mq-gl-unit" style="flex:none;${unitChars && !isTwin(ctx) && !under ? `min-width:${L(ctx, unitChars * (textPt(ctx) + 2) * 0.62 * PT_MM)};text-align:left;` : ''}${FONT}font-size:${P(ctx, textPt(ctx) + (isTwin(ctx) ? 0 : 2))};font-weight:700;line-height:1.1;color:${INK};white-space:nowrap;">${esc(unit)}</span>`
        : '';
    // (on screen the unit word sits UNDER the box, so a 390 px card holds the whole sentence on one line)
    // (the word hangs under the box, out of the row's flow, so the box stays level with the sentence's boxes)
    if (isTwin(ctx) || o.under) {
        const hung = word.replace('style="flex:none;', 'style="position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;flex:none;');
        return `<span class="mq-gl-answerarea" style="position:relative;display:inline-flex;align-items:center;flex:none;">${box}${hung}</span>`;
    }
    return `<span class="mq-gl-answerarea" style="display:inline-flex;align-items:center;gap:${L(ctx, 2)};flex:none;">${box}${word}</span>`;
}
