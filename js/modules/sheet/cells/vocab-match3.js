// js/modules/sheet/cells/vocab-match3.js
// The `vocab-match3` template: MATCH 3 PICTURES (owner design 2026-10-25; design/cards/vocabulary/
// vocabulary.md §2-3). One boxed cell:
//
//   the pictures   three library pictures (graphics/vocab-pictures.js) in a row, each with its
//                  bold letter A, B, C at its top left
//   the words      three words in another order (no word under its own picture), each with ONE
//                  letter box beside it: the pupil WRITES THE LETTER of its picture
//
// Black and white, Andika, the kit's sizes (ctx.metrics): words at text size + 3 pt, letters at text
// size + 5 pt, the letter box a writing square of Hw + 2 mm. The pictures are 38 / 40 / 40 mm wide
// (S / M / L), so the cell is about a quarter of the page body at every size: 4 a page.
//
// Key (AK-1, AK-2): the same cell with each word's letter written in its box. Screen twin (SP-3:
// the same response, never multiple choice): each letter box is a one-character input
// (`data-mq-cell`, in reading order), so the pupil writes the letter on screen too.
//
// payload: {words: [w0, w1, w2] (picture A, B, C), order: [i, j, k] (the word row: words[order[n]]),
//           grade}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, isTwin, sizeOf, textPt, KEY_FEATURES, S, slotValue } from './k2kit.js';
import { vocabPictureSVG } from '../graphics/vocab-pictures.js';

export const MATCH3_TEMPLATE = 'vocab-match3';
const LET = ['A', 'B', 'C'];
const FONT = "font-family:'Andika','Open Sans',sans-serif;letter-spacing:0;";
export const MATCH3_PIC_W = Object.freeze({ S: 38, M: 40, L: 40 });

/** The letters, in word-row order: the key. */
export const match3Letters = (p) => (p.order || [0, 1, 2]).map((i) => LET[i]);

register(MATCH3_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const words = (p.words || []).slice(0, 3);
        const order = Array.isArray(p.order) && p.order.length === words.length ? p.order : words.map((_, i) => i);
        const tp = textPt(ctx);
        const picW = MATCH3_PIC_W[sizeOf(ctx)] || 48;
        const show = ctx.state === 'answered' || ctx.state === 'traced' || ctx.state === 'wrong';
        const ink = ctx.state === 'traced' ? GREY : INK;
        // the letter at the picture's top left, beside it (not above: the cell stays a quarter of the page)
        const pics = words.map((w, i) => `<div class="mq-vm-pic" style="display:flex;flex-direction:row;align-items:flex-start;justify-content:center;gap:${L(ctx, 1.5)};flex:${twin ? '1 1 190px' : '1 1 0'};min-width:0;">`
            + `<span class="mq-vm-let" style="font-size:${P(ctx, tp + 5)};font-weight:700;line-height:1;flex:none;">${LET[i]}</span>`
            + `<span style="display:block;flex:0 1 auto;min-width:0;">${vocabPictureSVG(ctx, w, { wMm: picW, minPx: twin ? 160 : 0 })}</span></div>`).join('');
        const side = (S(ctx).writeMm || 10) + 2;
        const letters = match3Letters({ order });
        const row = order.map((wi, n) => {
            // (Error analysis: the wrong work's letter in this box - ctx.wrong.slots - never the key's; critic r1 D1)
            const val = show ? slotValue(ctx, `letter-${n}`, letters[n]) : '';
            // (data-mq-kind="word": the screen slot keeps a letter; a plain slot keeps digits only - precritic ws-screen-answer r1)
            const hook = twin ? ' data-mq-cell="1" data-mq-w="1" data-mq-kind="word"' : '';
            const boxHtml = `<span class="mq-vm-box" data-ws-slot="letter-${n}" data-ws-shape="box"${show ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : ''}${hook}`
                + ` style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${twin ? `max(48px, ${L(ctx, side)})` : L(ctx, side)};height:${twin ? `max(48px, ${L(ctx, side)})` : L(ctx, side)};`
                + `border:${B(ctx, 1.5)} solid ${INK};background:#fff;font-size:${P(ctx, tp + 6)};font-weight:700;line-height:1;color:${ink};flex:none;${KEY_FEATURES}">${esc(val)}</span>`;
            // (screen: a word and its box never part - critic r1 D10: the box jumped under its word)
            return `<span class="mq-vm-word" style="display:inline-flex;align-items:center;gap:${L(ctx, 2.5)};flex:${twin ? '0 0 auto' : '1 1 0'};white-space:nowrap;justify-content:center;min-width:0;">`
                + `<b style="font-size:${P(ctx, tp + 3)};line-height:1.15;text-align:right;">${esc(words[wi])}</b>${boxHtml}</span>`;
        }).join('');
        return `<div class="mq-vm k2-cell" data-ws-vocab="match3"${twin ? ' data-mq-k2="1" data-mq-join=", "' : ''} style="color:${INK};${FONT}width:100%;box-sizing:border-box;`
            + `display:flex;flex-direction:column;gap:${L(ctx, 2)};padding:${L(ctx, 1)} ${L(ctx, 2)} ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};">`
            + `<div class="mq-vm-pics" style="display:flex;flex-wrap:${twin ? 'wrap' : 'nowrap'};justify-content:space-around;align-items:flex-end;gap:${L(ctx, 4)};">${pics}</div>`
            + `<div class="mq-vm-words" style="display:flex;justify-content:space-around;align-items:center;gap:${L(ctx, 4)};flex-wrap:${twin ? 'wrap' : 'nowrap'};">${row}</div></div>`;
    },
    answerKey(p) {
        const letters = match3Letters(p);
        const slots = {};
        letters.forEach((l, n) => { slots[`letter-${n}`] = { value: l, graded: true, accept: [l, l.toLowerCase()] }; });
        return { value: letters.join(', '), display: letters.join(', '), slots };
    },
    // one full-width row (three pictures across); its height is measured (about 48 / 53 / 58 mm)
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
    inputs(p) {
        return (p && p.words ? p.words : [0, 1, 2]).map((_, n) => ({ id: `letter-${n}`, kind: 'text', shape: 'box', graded: true, order: n, maxLength: 1, scopes: ['full'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export default { MATCH3_TEMPLATE, MATCH3_PIC_W, match3Letters };
