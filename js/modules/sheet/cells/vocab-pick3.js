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
// Larger for lower grades (owner): the picture is 70 / 38 / 36 mm wide for grades K-1 / 2-3 / 4-5 at
// every size, and the cell's height is a half, a third or a quarter of the page body: 4, 6 or 8 a page in
// two columns. Grades 4-5 draw the bank BESIDE the picture (the words one a line, the writing line under); K-3
// the bank under the picture, one word a line too.
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
import { L, P, B, INK, GREY, isTwin, textPt, slotValue } from './k2kit.js';
import { vocabPictureSVG } from '../graphics/vocab-pictures.js';

export const PICK3_TEMPLATE = 'vocab-pick3';
const FONT = "font-family:'Andika','Open Sans',sans-serif;letter-spacing:0;";
/** The grade class of a grade (K = 0): 0 = K-1, 1 = 2-3, 2 = 4-5. */
export const gradeClass = (g) => (Number(g) <= 1 ? 0 : Number(g) <= 3 ? 1 : 2);
/** Per page (owner): K-1 4, grades 2-3 6, grades 4-6 8. */
export const PICK3_PER_PAGE = Object.freeze([4, 6, 8]);
/** The picture's width (mm) by grade class, the same at S, M and L (the page count is the owner's: 4 / 6 / 8). */
const PIC_W = [70, 38, 36];
/**
 * The cell's minimum body height (mm) by grade class: with the cell's own 6 mm it shares the grid (A4 227 mm, Letter
 * 209 mm) by exactly 2 / 3 / 4 rows; the content is drawn to about this height (no empty band, RUBRIC H13).
 */
// (r5: the heights a page's rows really get - A4 227 mm / Letter 209 mm by 2 / 3 / 4 rows, less the cell's 6 mm - so the
// footprint is the height the cell draws within 10 % on every practice role, ws-empty-band EB-FOOT: 90 / 58 / 41 were
// stretched 13-34 % by the page)
export const PICK3_MIN_H = Object.freeze([98, 63.5, 44]);

export const pick3PicW = (p) => PIC_W[gradeClass(p.grade)];

register(PICK3_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const gc = gradeClass(p.grade);
        const bank = (p.bank || []).slice(0, 3);
        // grades 4-5 beside: a phrase over 10 letters ("times as many") one point smaller, so the bank and a 34 mm picture share
        // a half-width cell (r2: one column at L)
        const longW = Math.max(...bank.map((w) => String(w).length), 0) > 10;
        const tp = textPt(ctx) + (gc === 0 ? 5 : gc === 1 ? 1 : longW && !twin ? -1 : 0);
        const show = !twin && (ctx.state === 'answered' || ctx.state === 'traced' || ctx.state === 'wrong');
        const ink = ctx.state === 'traced' ? 'trace' : 'solid';
        const longest = Math.max(...bank.map((w) => String(w).length), 4);
        // grades 4-5: the picture beside the bank (eight a page); else the bank under it, on one line or wrapped to two
        // grades 4-5: the picture beside the bank; K-3 the bank under the picture. The bank is ALWAYS one word a line
        // (critic r1 D4: "equal groups step odd" on one line - a pupil cannot tell three words from five)
        // (and a full-width teaching state - the Scripted Model's states, payload.wideState - lays its picture beside the bank too)
        // (and an Error analysis work at S - state `wrong`: the bank beside the picture, so the work and its judgement fit
        // 6 a page in 2 x 3 with no empty band; critic r4 #1: the stacked work printed 4 a page at S, 30.1 % empty)
        const eaS = !twin && ctx.state === 'wrong' && ctx.size === 'S';
        const beside = !twin && (gc === 2 || !!p.wideState || eaS);
        // one line width a grade band, so the answer place stands in the same place in every cell (critic r1 D5, VQ-7)
        // (and at least 1.2 x the widest bank word at the answer font, grades 4-5 at least 55 mm: the line runs under the
        // picture and the bank - critic r3 #7, ~36 mm for "times as many"; ws-vocab-unit V15)
        const lineW = Math.min(76, Math.max(beside ? 55 : 64, Math.ceil(longest * (tp + 1) * 0.3528 * 0.6 * 1.2)));
        const words = bank.map((w) => (twin
            ? `<button type="button" class="mq-choicebtn mq-vp-btn" data-mq-choice="${esc(w)}" aria-pressed="false" style="min-height:max(48px, ${L(ctx, 11)});min-width:max(64px, ${L(ctx, 18)});padding:0 ${L(ctx, 2.5)};`
                + `border:${B(ctx, 1)} solid ${INK};border-radius:999px;background:#fff;color:${INK};${FONT}font-size:max(20px, ${P(ctx, tp)});font-weight:700;line-height:1;cursor:pointer;"><span>${esc(w)}</span></button>`
            : `<span class="mq-vp-w" style="font-size:${P(ctx, tp)};font-weight:700;line-height:1.2;white-space:nowrap;">${esc(w)}</span>`)).join('');
        // the line: the key's word on paper; on screen the tapped word appears there (CSS :has, no script)
        const onLine = twin
            ? bank.map((w) => `<span class="mq-vp-fill" data-w="${esc(w)}" style="display:none;">${esc(w)}</span>`).join('')
            : show ? esc(ctx.state === 'wrong' ? slotValue(ctx, 'answer', p.word) : p.word) : '';
        const line = `<span class="mq-vp-line" data-ws-slot="answer" data-ws-shape="line"${show ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;`
            + `width:${L(ctx, lineW)};max-width:100%;height:${L(ctx, tp * 0.3528 * 1.4 + 1.5)};border-bottom:${B(ctx, 1.5)} solid ${INK};font-size:${P(ctx, tp + 1)};font-weight:700;line-height:1.1;white-space:nowrap;`
            + `color:${ink === 'trace' && show ? GREY : INK};padding-bottom:${L(ctx, 0.8)};">${onLine}</span>`;
        const style = twin
            ? `<style>${bank.map((w) => `.mq-vp:has(button[data-mq-choice="${esc(w)}"][aria-pressed="true"]) .mq-vp-fill[data-w="${esc(w)}"]{display:inline!important}`).join('')}`
                // (the online worksheet's tile: ONE fixed layout - the picture in a slot of one height, scaled to it; the three
                // pills one a row, as the paper bank, never 2 + 1; so the answer line stands at one y in every tile: critic r1
                // #10, r2 #7, r3 #4; ws-vocab-unit V19. Scoped to the worksheet paper, the card unchanged)
                + '.mq-wspaper .mq-vp{justify-content:flex-start!important}'
                + '.mq-wspaper .mq-vp > svg.mq-vpic{flex:none!important;height:150px!important;width:100%!important;max-width:100%}'
                + '.mq-wspaper .mq-vp .mq-vp-bank{flex-direction:column!important;flex-wrap:nowrap!important;align-items:center}'
                + '.mq-wspaper .mq-vp .mq-vp-btn{min-width:min(100%, 200px)}.mq-wspaper .k2-twin:has(> .mq-vp){align-self:stretch;width:100%}</style>'
            // (a Guided try wrapped with its grey hint line - guided.js fadeRender: the wrap and the cell take the row's
            // height, so the hinted cell is spread like the others, never top-heavy: critic r2 #4)
            : Number(ctx.scaffoldLevel) >= 2 ? '<style>:is(.ws-page,.ws-sheet) .mq-workwrap:has(> .mq-vp){flex:1 1 auto;justify-content:center}:is(.ws-page,.ws-sheet) .mq-workwrap > .mq-vp{flex:1 1 auto;height:auto!important}</style>'
            : '';
        // (the page-fill height is a practice page's; an anchor-chart panel draws the cell at its own height - r2 lint:
        // 7.7 mm over the panel)
        // (a teaching state - the anchor chart's panels and guided cells draw at scaffold level 2-3 - has no page share)
        const inChart = (ctx.chartZoom !== undefined && ctx.chartZoom !== null) || Number(ctx.scaffoldLevel) >= 2;
        // (and fills its row: a row taller than the cell - a rebalanced last page - shares the spare above and below, H13)
        // (a Guided page cell - scaffold 2-3, not a chart panel - fills its row too, so the Model and the hinted try leave no
        // empty band under their line: critic r2 #4, 38 % empty)
        // (an Error analysis work - state `wrong`, error-analysis.js - draws at its natural height: lf-vocab r5, critic r3 #3)
        const just = 'space-evenly';
        const minH = twin || ctx.state === 'wrong' ? '' : inChart ? (ctx.chartZoom !== undefined && ctx.chartZoom !== null ? '' : 'height:100%;') : `min-height:${PICK3_MIN_H[gc]}mm;height:100%;`;
        // beside: the picture takes the room the bank leaves in a half-width cell (80 mm inside), so it is drawn at its own
        // width and never shrunk by the browser (DN-10 counts a shrunk drawing as not fitting - r2: one column at L)
        const bankMm = longest * tp * 0.3528 * 0.56 + 6.5;
        const picW = beside ? Math.max(34, Math.min(pick3PicW(p), 76 - 3 - bankMm)) : pick3PicW(p);
        // the picture fills a box as tall as before and as wide as the cell allows, so a flat picture (the ten rod, a line of
        // digits) prints large (r3, rule 5: critic r2 #2 - the ten rod 3.4 mm tall in a 90 mm cell; ws-vocab-unit V9)
        // (lf-vocab r14, ws-screen-ink-size SIZE-INK: the screen twin drew every picture 38 mm wide - 220 px - while paper fits a
        // flat picture to its 72 x 25 mm box, so "equal groups" showed its rings and dots at 81 % of their print size. The twin
        // now fits the box the SAME item has on paper - the beside box for grades 4-5, the 72 mm box below them - and is never
        // drawn narrower than that paper width: printFloor)
        const paperBox = gc === 2 ? { wMm: Math.max(pick3PicW(p), 76 - 3 - bankMm), hMm: 24 } : { wMm: 72, hMm: pick3PicW(p) * 2 / 3 };
        const box = twin ? paperBox : beside ? { wMm: Math.max(picW, 76 - 3 - bankMm), hMm: eaS ? 28 : 24 } : { wMm: 72, hMm: picW * 2 / 3 - (ctx.state === 'wrong' ? 3.5 : 0) };   // (Error analysis: 3 a page at L, critic r3 #3)   // (76 stuck out 0.4 mm at S: precritic r4)
        // (the item is its one picture: a "one" or a "ten" alone prints at the ten rod's unit, owner ruling OQ-1)
        const pic = vocabPictureSVG(ctx, p.word, Object.assign(box, { minPx: twin ? 220 : 0, printFloor: twin, set: [p.word] }));
        // (lf-vocab r16, critic r5 nit 2: on a Guided page the write line is anchored to the cell's bottom in EVERY cell - the
        // free height shared above the picture, the bank and the line - and the try's hint (payload.hintHtml, guided.js
        // hintInside) prints between the bank and the line, so the lines of a row stand at one y; ws-vocab-unit V-GLINE)
        const guidedCell = !twin && !(ctx.chartZoom !== undefined && ctx.chartZoom !== null) && (Number(ctx.scaffoldLevel) >= 2 || !!p.guidedRow);
        const hint = guidedCell && p.hintHtml ? `<div class="mq-hintline ws-trace" data-ws-ink="trace" style="margin-top:0">${p.hintHtml}</div>` : '';
        const gl = guidedCell ? '<style>:is(.ws-page,.ws-sheet) .mq-vp[data-ws-guided] > :not(style):not(.mq-hintline){margin-top:auto}</style>' : '';
        const pad = `padding:${L(ctx, 1)} ${L(ctx, 1)} ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};`;
        const root = `class="mq-vp k2-cell" data-ws-vocab="pick3" data-ws-inplace${twin ? ' data-mq-k2="1"' : ''}${guidedCell ? ' data-ws-guided' : ''}`;
        if (beside) {
            // the words one a line in the thin box, the writing line under the box
            const bankHtml = `<div class="mq-vp-bank" role="group" aria-label="word bank" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 0.8)};box-sizing:border-box;flex:none;`
                + `border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1)} ${L(ctx, 2.5)};">${words}</div>`;
            // (the picture and the bank side by side, the writing line under both, as long as the longest word needs)
            return `<div ${root} style="color:${INK};${FONT}width:100%;box-sizing:border-box;${minH}display:flex;flex-direction:column;align-items:center;justify-content:${guidedCell ? 'flex-start' : just};gap:${L(ctx, ctx.state === 'wrong' ? 1 : 2)};${pad}">`
                + `${style}${gl}<div style="display:flex;flex-direction:row;align-items:center;justify-content:space-evenly;gap:${L(ctx, 3)};width:100%;">`
                + `<span style="display:block;flex:0 1 auto;min-width:0;">${pic}</span>${bankHtml}</div>${hint}${line}</div>`;
        }
        return `<div ${root} style="color:${INK};${FONT}width:100%;box-sizing:border-box;${minH}`
            + `display:flex;flex-direction:column;align-items:center;justify-content:${guidedCell ? 'flex-start' : just};gap:${L(ctx, ctx.state === 'wrong' ? 1 : 2.5)};${pad}">`
            + `${style}${gl}${pic}`
            // (a bank too long for one line wraps to two balanced-looking lines, never one word a line: critic-ready r2)
            + `<div class="mq-vp-bank" role="group" aria-label="word bank" style="display:flex;flex-direction:${twin ? 'row' : 'column'};flex-wrap:${twin ? 'wrap' : 'nowrap'};align-items:center;justify-content:center;column-gap:${L(ctx, 4)};row-gap:${L(ctx, 1)};box-sizing:border-box;max-width:100%;`
            + `${twin ? '' : `border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1)} ${L(ctx, 2.5)};`}">${words}</div>${hint}${line}</div>`;
    },
    answerKey(p) {
        const w = String(p.word);
        return { value: w, display: w, slots: { answer: { value: w, graded: true, accept: [w, w.toLowerCase()] } } };
    },
    // two across at every grade; the height is the grade's share of the page body (4 / 6 / 8 a page)
    // (hardCap: two across even where a narrow grade-3 cell measures as fitting three at S - r2 render, 9 a page)
    // (`evenRows`: on the Guided page every row takes the same share - the cell spreads its picture, bank and line over its
    // height, so the Model row and the hinted row need no extra height of their own; critic r2 #4, guided.js)
    // (`hintInside`: the Guided try's hint is drawn inside the cell, above the anchored line - lf-vocab r16, guided.js fadeRender)
    footprint(p) { return { wMm: 88, hMm: null, measure: true, factLike: false, maxCols: 2, hardCap: true, inPlace: true, evenRows: true, hintInside: true }; },
    // the paper response is a WORD WRITTEN ON A LINE (the screen taps a bank word into it): a text slot, so Error analysis
    // can write a wrong word in as finished work (critic r1 D3: the role declined a 'choice' slot)
    inputs() { return [{ id: 'answer', kind: 'text', shape: 'line', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export default { PICK3_TEMPLATE, PICK3_PER_PAGE, PICK3_MIN_H, gradeClass, pick3PicW };
