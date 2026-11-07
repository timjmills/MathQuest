// js/modules/sheet/cells/vocab-pick3.js
// The `vocab-pick3` template: 1 PICTURE, 3 WORDS (owner design 2026-10-25; design/cards/vocabulary/
// vocabulary.md §2-3). One boxed cell:
//
//   the picture    one library picture (graphics/vocab-pictures.js), centred
//   the bank       three words in a thin (0.75 pt) box under it - the right word and two from the
//                  same lesson whose pictures cannot be read as this one (vocab-words.js notWith);
//                  one line when they fit the cell, else one word a line (never cut, TY-12)
//   the line       a writing line under the bank: the pupil COPIES the right word onto it
//
// Larger for lower grades (owner): the picture is 80 / 40 / 34 mm wide at L for grades K-1 / 2-3 /
// 4-5 (x 0.88 at S, x 0.94 at M), and the cell's height is a half, a third or a quarter of the page
// body: 4, 6 or 8 a page in two columns.
//
// Key (AK-1): the right word written on the line. Screen twin (SP-3, P-29: a copied word on paper is
// a tapped word on screen): the bank words are buttons `data-mq-choice` (screen-cell.js
// wireTickBoxes: one tap, one graded answer) and the tapped word DROPS ONTO THE LINE (the cell's own
// :has() rule shows it there), so the screen shows what the paper shows.
//
// payload: {word, bank: [three words, the right one among them], grade}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, isTwin, sizeOf, textPt } from './k2kit.js';
import { vocabPictureSVG } from '../graphics/vocab-pictures.js';

export const PICK3_TEMPLATE = 'vocab-pick3';
const FONT = "font-family:'Andika','Open Sans',sans-serif;letter-spacing:0;";
/** The grade class of a grade (K = 0): 0 = K-1, 1 = 2-3, 2 = 4-5. */
export const gradeClass = (g) => (Number(g) <= 1 ? 0 : Number(g) <= 3 ? 1 : 2);
/** Per page (owner): K-1 4, grades 2-3 6, grades 4-6 8. */
export const PICK3_PER_PAGE = Object.freeze([4, 6, 8]);
const PIC_W = [80, 40, 34];
const SIZE_K = { S: 0.88, M: 0.94, L: 1 };
/** The cell's minimum body height (mm): with the cell's own 6 mm it shares the grid (A4 227 mm, Letter 209 mm) by 2 / 3 / 4 rows. */
export const PICK3_MIN_H = Object.freeze([96, 61, 45]);

export const pick3PicW = (p, ctx) => Math.round(PIC_W[gradeClass(p.grade)] * (SIZE_K[sizeOf(ctx)] || 1));

register(PICK3_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const gc = gradeClass(p.grade);
        const tp = textPt(ctx) + (gc === 0 ? 5 : gc === 1 ? 2 : 1);
        const bank = (p.bank || []).slice(0, 3);
        const show = !twin && (ctx.state === 'answered' || ctx.state === 'traced' || ctx.state === 'wrong');
        const ink = ctx.state === 'traced' ? 'trace' : 'solid';
        const longest = Math.max(...bank.map((w) => String(w).length), 4);
        // one line when the three words fit the cell (an Andika letter is about 0.55 em), else one word a line
        const rowMm = bank.reduce((a, w) => a + String(w).length * tp * 0.3528 * 0.58, 0) + 2 * 3 + 2 * 2.5 + 2;
        const stack = !twin && rowMm > 74;
        const lineW = Math.min(80, Math.max(34, longest * tp * 0.36 + 10));
        const words = bank.map((w) => (twin
            ? `<button type="button" class="mq-choicebtn mq-vp-btn" data-mq-choice="${esc(w)}" aria-pressed="false" style="min-height:max(48px, ${L(ctx, 11)});min-width:max(64px, ${L(ctx, 18)});padding:0 ${L(ctx, 2.5)};`
                + `border:${B(ctx, 1)} solid ${INK};border-radius:999px;background:#fff;color:${INK};${FONT}font-size:${P(ctx, tp)};font-weight:700;line-height:1;cursor:pointer;"><span>${esc(w)}</span></button>`
            : `<span class="mq-vp-w" style="font-size:${P(ctx, tp)};font-weight:700;line-height:1.2;white-space:nowrap;">${esc(w)}</span>`)).join('');
        // the line: the key's word on paper; on screen the tapped word appears there (CSS :has, no script)
        const onLine = twin
            ? bank.map((w) => `<span class="mq-vp-fill" data-w="${esc(w)}" style="display:none;">${esc(w)}</span>`).join('')
            : show ? esc(p.word) : '';
        const line = `<span class="mq-vp-line" data-ws-slot="answer" data-ws-shape="line"${show ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;`
            + `width:${L(ctx, lineW)};height:${L(ctx, tp * 0.3528 * 1.4 + 1.5)};border-bottom:${B(ctx, 1.5)} solid ${INK};font-size:${P(ctx, tp + 1)};font-weight:700;line-height:1.1;`
            + `color:${ink === 'trace' && show ? GREY : INK};padding-bottom:${L(ctx, 0.8)};">${onLine}</span>`;
        const style = twin
            ? `<style>${bank.map((w) => `.mq-vp:has(button[data-mq-choice="${esc(w)}"][aria-pressed="true"]) .mq-vp-fill[data-w="${esc(w)}"]{display:inline!important}`).join('')}</style>`
            : '';
        const minH = twin ? '' : `min-height:${PICK3_MIN_H[gc]}mm;`;
        return `<div class="mq-vp k2-cell" data-ws-vocab="pick3" data-ws-inplace${twin ? ' data-mq-k2="1"' : ''} style="color:${INK};${FONT}width:100%;box-sizing:border-box;${minH}`
            + `display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:${L(ctx, 2.5)};padding:${L(ctx, 1)} ${L(ctx, 1)} ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};">`
            + `${style}${vocabPictureSVG(ctx, p.word, { wMm: pick3PicW(p, ctx) })}`
            + `<div class="mq-vp-bank" role="group" aria-label="word bank" style="display:flex;flex-direction:${stack ? 'column' : 'row'};align-items:center;justify-content:space-evenly;flex-wrap:${twin ? 'wrap' : 'nowrap'};gap:${L(ctx, stack ? 1.2 : 3)};box-sizing:border-box;max-width:100%;`
            + `${twin ? '' : `border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1)} ${L(ctx, 2.5)};`}">${words}</div>${line}</div>`;
    },
    answerKey(p) {
        const w = String(p.word);
        return { value: w, display: w, slots: { answer: { value: w, graded: true, accept: [w, w.toLowerCase()] } } };
    },
    // two across at every grade; the height is the grade's share of the page body (4 / 6 / 8 a page)
    footprint(p) { return { wMm: 88, hMm: null, measure: true, factLike: false, maxCols: 2, inPlace: true }; },
    inputs() { return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export default { PICK3_TEMPLATE, PICK3_PER_PAGE, PICK3_MIN_H, gradeClass, pick3PicW };
