// js/modules/sheet/cells/vocab-pick3.js
// The `vocab-pick3` template: 1 PICTURE, 3 WORDS (owner design 2026-10-25; design/cards/vocabulary/
// vocabulary.md §2-3). One boxed cell:
//
//   the picture    one library picture (graphics/vocab-pictures.js), centred
//   the bank       three words in a thin (0.75 pt) box under it - the right word and two from the
//                  same lesson whose pictures cannot be read as this one (vocab-words.js notWith);
//                  one line when they fit the cell, else wrapped to two (never cut, TY-12)
//   the line       a writing line under the bank: the pupil COPIES the right word onto it
//
// Larger for lower grades (owner): the picture is 74 / 40 / 38 mm wide for grades K-1 / 2-3 / 4-5 at
// every size, and the cell's height is a half, a third or a quarter of the page body: 4, 6 or 8 a page in
// two columns. Grades 4-5 draw the bank BESIDE the picture (the words one a line, the writing line under).
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
/** The picture's width (mm) by grade class, the same at S, M and L (the page count is the owner's: 4 / 6 / 8). */
const PIC_W = [74, 40, 38];
/**
 * The cell's minimum body height (mm) by grade class: with the cell's own 6 mm it shares the grid (A4 227 mm, Letter
 * 209 mm) by exactly 2 / 3 / 4 rows; the content is drawn to about this height (no empty band, RUBRIC H13).
 */
export const PICK3_MIN_H = Object.freeze([90, 58, 41]);

export const pick3PicW = (p) => PIC_W[gradeClass(p.grade)];

register(PICK3_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const gc = gradeClass(p.grade);
        const tp = textPt(ctx) + (gc === 0 ? 5 : gc === 1 ? 2 : 1);
        const bank = (p.bank || []).slice(0, 3);
        const show = !twin && (ctx.state === 'answered' || ctx.state === 'traced' || ctx.state === 'wrong');
        const ink = ctx.state === 'traced' ? 'trace' : 'solid';
        const longest = Math.max(...bank.map((w) => String(w).length), 4);
        // grades 4-5: the picture beside the bank (eight a page); else the bank under it, on one line or wrapped to two
        const beside = !twin && gc === 2;
        const lineW = beside ? Math.max(30, longest * tp * 0.3528 * 0.56 + 6) : Math.min(80, Math.max(34, longest * tp * 0.36 + 10));
        const words = bank.map((w) => (twin
            ? `<button type="button" class="mq-choicebtn mq-vp-btn" data-mq-choice="${esc(w)}" aria-pressed="false" style="min-height:max(48px, ${L(ctx, 11)});min-width:max(64px, ${L(ctx, 18)});padding:0 ${L(ctx, 2.5)};`
                + `border:${B(ctx, 1)} solid ${INK};border-radius:999px;background:#fff;color:${INK};${FONT}font-size:${P(ctx, tp)};font-weight:700;line-height:1;cursor:pointer;"><span>${esc(w)}</span></button>`
            : `<span class="mq-vp-w" style="font-size:${P(ctx, tp)};font-weight:700;line-height:1.2;white-space:nowrap;">${esc(w)}</span>`)).join('');
        // the line: the key's word on paper; on screen the tapped word appears there (CSS :has, no script)
        const onLine = twin
            ? bank.map((w) => `<span class="mq-vp-fill" data-w="${esc(w)}" style="display:none;">${esc(w)}</span>`).join('')
            : show ? esc(p.word) : '';
        const line = `<span class="mq-vp-line" data-ws-slot="answer" data-ws-shape="line"${show ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;`
            + `width:${L(ctx, lineW)};max-width:100%;height:${L(ctx, tp * 0.3528 * 1.4 + 1.5)};border-bottom:${B(ctx, 1.5)} solid ${INK};font-size:${P(ctx, tp + 1)};font-weight:700;line-height:1.1;white-space:nowrap;`
            + `color:${ink === 'trace' && show ? GREY : INK};padding-bottom:${L(ctx, 0.8)};">${onLine}</span>`;
        const style = twin
            ? `<style>${bank.map((w) => `.mq-vp:has(button[data-mq-choice="${esc(w)}"][aria-pressed="true"]) .mq-vp-fill[data-w="${esc(w)}"]{display:inline!important}`).join('')}</style>`
            : '';
        // (the page-fill height is a practice page's; an anchor-chart panel draws the cell at its own height - r2 lint:
        // 7.7 mm over the panel)
        // (a teaching state - the anchor chart's panels and guided cells draw at scaffold level 2-3 - has no page share)
        const inChart = (ctx.chartZoom !== undefined && ctx.chartZoom !== null) || Number(ctx.scaffoldLevel) >= 2;
        const minH = twin || inChart ? '' : `min-height:${PICK3_MIN_H[gc]}mm;`;
        const pic = vocabPictureSVG(ctx, p.word, { wMm: pick3PicW(p) });
        const pad = `padding:${L(ctx, 1)} ${L(ctx, 1)} ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};`;
        const root = `class="mq-vp k2-cell" data-ws-vocab="pick3" data-ws-inplace${twin ? ' data-mq-k2="1"' : ''}`;
        if (beside) {
            // the words one a line in the thin box, the writing line under the box
            const bankHtml = `<div class="mq-vp-bank" role="group" aria-label="word bank" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 0.8)};box-sizing:border-box;`
                + `border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1)} ${L(ctx, 2.5)};">${words}</div>`;
            return `<div ${root} style="color:${INK};${FONT}width:100%;box-sizing:border-box;${minH}display:flex;flex-direction:row;align-items:center;justify-content:space-evenly;gap:${L(ctx, 3)};${pad}">`
                + `<span style="display:block;flex:0 1 auto;min-width:0;">${pic}</span>`
                + `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 2.5)};flex:none;">${bankHtml}${line}</div></div>`;
        }
        return `<div ${root} style="color:${INK};${FONT}width:100%;box-sizing:border-box;${minH}`
            + `display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:${L(ctx, 2.5)};${pad}">`
            + `${style}${pic}`
            // (a bank too long for one line wraps to two balanced-looking lines, never one word a line: critic-ready r2)
            + `<div class="mq-vp-bank" role="group" aria-label="word bank" style="display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:center;column-gap:${L(ctx, 4)};row-gap:${L(ctx, 1)};box-sizing:border-box;max-width:100%;`
            + `${twin ? '' : `border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1)} ${L(ctx, 2.5)};`}">${words}</div>${line}</div>`;
    },
    answerKey(p) {
        const w = String(p.word);
        return { value: w, display: w, slots: { answer: { value: w, graded: true, accept: [w, w.toLowerCase()] } } };
    },
    // two across at every grade; the height is the grade's share of the page body (4 / 6 / 8 a page)
    // (hardCap: two across even where a narrow grade-3 cell measures as fitting three at S - r2 render, 9 a page)
    footprint(p) { return { wMm: 88, hMm: null, measure: true, factLike: false, maxCols: 2, hardCap: true, inPlace: true }; },
    inputs() { return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export default { PICK3_TEMPLATE, PICK3_PER_PAGE, PICK3_MIN_H, gradeClass, pick3PicW };
