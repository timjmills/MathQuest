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
/**
 * The box each picture is fitted to (mm, w x h), by size: as tall as a 38 / 40 mm picture (so the cell is still a quarter
 * of the page) and wider, so a flat picture (the ten rod, a number track, one line of digits) is drawn larger (r3, rule 5:
 * grade 1 strips at 11 pt, the ten rod's 3.5 mm units - critic r1 #13 / #17, r2 #2 / #10; ws-vocab-unit V9).
 */
export const MATCH3_PIC_BOX = Object.freeze({ S: [43, 25.4], M: [45, 26.7], L: [45, 26.7] });   // (46 / 48 stuck out of the cell by 2.4-2.6 mm: precritic r4 slot-clip)

/** The height a cell draws (mm) by size: the picture box, the letter-box row, the gaps and padding. */
export const MATCH3_H = Object.freeze({ S: 47, M: 46, L: 46 });

/** The letters, in word-row order: the key. */
export const match3Letters = (p) => (p.order || [0, 1, 2]).map((i) => LET[i]);

register(MATCH3_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const words = (p.words || []).slice(0, 3);
        const order = Array.isArray(p.order) && p.order.length === words.length ? p.order : words.map((_, i) => i);
        const tp = textPt(ctx);
        const [picW, picH0] = MATCH3_PIC_BOX[sizeOf(ctx)] || MATCH3_PIC_BOX.L;
        // (Error analysis shows the work at 2 mm less, and its letter boxes at the writing square, so 3 a page fit at L with
        // the Correct / Fix-it row under it: lf-vocab r5, critic r3 #3 - 2 a page left 35-40 % of each cell empty)
        const ea = ctx.state === 'wrong';
        const picH = ea ? picH0 - 2 : picH0;
        const show = ctx.state === 'answered' || ctx.state === 'traced' || ctx.state === 'wrong';
        const ink = ctx.state === 'traced' ? GREY : INK;
        // the letter at the picture's top left, beside it (not above: the cell stays a quarter of the page)
        const pics = words.map((w, i) => `<div class="mq-vm-pic" style="display:flex;flex-direction:row;align-items:flex-start;justify-content:center;gap:${L(ctx, 1.5)};flex:${twin ? '1 1 190px' : '1 1 0'};min-width:0;">`
            + `<span class="mq-vm-let" style="font-size:${P(ctx, tp + 5)};font-weight:700;line-height:1;flex:none;">${LET[i]}</span>`
            + `<span style="display:block;flex:0 1 auto;min-width:0;">${vocabPictureSVG(ctx, w, { wMm: picW, hMm: picH, minPx: twin ? 160 : 0 })}</span></div>`).join('');
        const side = (S(ctx).writeMm || 10) + (ea ? 0 : 2);
        const letters = match3Letters({ order });
        const row = order.map((wi, n) => {
            // (Error analysis: the wrong work's letter in this box - ctx.wrong.slots - never the key's; critic r1 D1)
            // (a shown work given as one value - Reason It's "A, C, B" - is split into its letters, one a box: lf-vocab r5)
            const w = ctx.state === 'wrong' && ctx.wrong && !(ctx.wrong.slots && ctx.wrong.slots[`letter-${n}`] !== undefined) ? String(ctx.wrong.value || '').split(/\s*,\s*|\s+/) : null;
            const val = show ? (w && w.length === words.length ? w[n] : slotValue(ctx, `letter-${n}`, letters[n])) : '';
            // (data-mq-kind="word": the screen slot keeps a letter; a plain slot keeps digits only - precritic ws-screen-answer r1)
            const hook = twin ? ' data-mq-cell="1" data-mq-w="1" data-mq-kind="word"' : '';
            const boxHtml = `<span class="mq-vm-box" data-ws-slot="letter-${n}" data-ws-shape="box"${show ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : ''}${hook}`
                + ` style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${twin ? `max(48px, ${L(ctx, side)})` : L(ctx, side)};height:${twin ? `max(48px, ${L(ctx, side)})` : L(ctx, side)};`
                + `border:${B(ctx, 1.5)} solid ${INK};background:#fff;font-size:${P(ctx, tp + 6)};font-weight:700;line-height:1;color:${ink};flex:none;${KEY_FEATURES}">${esc(val)}</span>`;
            // (screen: a word and its box never part - critic r1 D10: the box jumped under its word)
            return `<span class="mq-vm-word" style="display:inline-flex;align-items:center;gap:${L(ctx, 2.5)};flex:${twin ? '0 0 auto' : '1 1 auto'};white-space:nowrap;justify-content:center;min-width:0;">`
                + `<b style="font-size:${P(ctx, tp + 3)};line-height:1.15;text-align:right;">${esc(words[wi])}</b>${boxHtml}</span>`;
        }).join('');
        // (a practice page's cell keeps a quarter page's height, so a set of flat pictures - the growing-patterns set - still
        // fills the page, 4 a page on A4 and on Letter: precritic r4 L-DENSITY, 37-41 % empty strip; a chart panel or a lesson
        // band sets its own height)
        // (lf-vocab r5, critic r3 #1 / #3: the footprint is the height the cell DRAWS in each role. A practice page's cell
        // holds a quarter page; a Guided cell (scaffold 2-3, not a chart panel) fills its row and spreads its pictures and
        // words over it, so the row the Guided page gives it is never an empty band under the letters (EB-BAND); an Error
        // analysis work (state `wrong`, error-analysis.js) draws at its natural height, so three fit a page)
        const chart = ctx.chartZoom !== undefined && ctx.chartZoom !== null;
        const inChart = chart || Number(ctx.scaffoldLevel) >= 2;
        const guidedRow = !twin && !chart && Number(ctx.scaffoldLevel) >= 2;
        // (a practice page's cell: at least 44 mm and at most 48 mm, so a row a page stretches (mixed practice, review) keeps the
        // drawing within 10 % of its footprint and leaves under 30 % below it - ws-empty-band EB-FOOT / EB-BAND, r5; 48 mm
        // as a minimum pushed the lesson Warm-up 3.4 mm off its page)
        const fill = twin || chart || ctx.state === 'wrong' ? '' : guidedRow ? 'height:100%;' : inChart ? '' : 'min-height:44mm;height:100%;max-height:48mm;';
        // (the online worksheet's tile: ONE fixed layout in every tile - each picture in a slot of one height, scaled to it; the
        // words one a row, right-aligned in one column, so every letter box stands at the same x - critic r1 #10, r2 #7,
        // r3 #4: tiles mixed 2 + 1 and one-a-row words; ws-vocab-unit V19. Scoped to the worksheet paper, the card unchanged)
        const tileCss = twin ? '<style>.mq-wspaper .mq-vm .mq-vm-pics{flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:10px!important}'
            + '.mq-wspaper .mq-vm .mq-vm-pic{flex:none!important;height:96px;align-items:center!important;justify-content:flex-start!important;min-width:0}'
            + '.mq-wspaper .mq-vm .mq-vm-pic > span:last-child{flex:1 1 0!important;min-width:0}'
            + '.mq-wspaper .mq-vm .mq-vm-pic svg{max-height:96px;max-width:100%;margin:0 auto}'
            + '.mq-wspaper .mq-vm .mq-vm-words{flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:6px!important}'
            + '.mq-wspaper .mq-vm .mq-vm-word{flex:none!important;justify-content:flex-end!important;padding-right:14%}'
            + '.mq-wspaper .mq-vm{justify-content:flex-start!important;gap:12px!important}.mq-wspaper .k2-twin:has(> .mq-vm){align-self:stretch;width:100%}</style>' : '';
        const wrapCss = tileCss + (guidedRow ? '<style>:is(.ws-page,.ws-sheet) .mq-workwrap:has(> .mq-vm){flex:1 1 auto;justify-content:center}:is(.ws-page,.ws-sheet) .mq-workwrap > .mq-vm{flex:1 1 auto;height:auto!important}</style>' : '');
        return `<div class="mq-vm k2-cell" data-ws-vocab="match3"${twin ? ' data-mq-k2="1" data-mq-join=", "' : ''} style="color:${INK};${FONT}width:100%;box-sizing:border-box;`
            + `display:flex;flex-direction:column;justify-content:${fill.includes('max-height') ? 'space-between' : 'space-evenly'};${fill}gap:${L(ctx, ctx.state === 'wrong' ? 0.8 : 2)};padding:${L(ctx, 1)} ${L(ctx, 2)} ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};">${wrapCss}`
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
    // (`points`: one point a word - owner ruling Q-C, 2026-11-07: a page of 4 cells scores /12; paginate.js scorePoints)
    // (`hMm`: the height the cell really draws - picture box + letter-box row + gaps - not a measurement: the Guided role planned
    // 4 rows at S from a 40.4 mm measurement while the cells drew ~45 mm, so rows 3-4 overflowed; lf-vocab r4, gate vocab-roles-render)
    footprint(p, ctx) { return { wMm: 186, hMm: MATCH3_H[sizeOf(ctx)] || MATCH3_H.L, measure: false, factLike: false, maxCols: 1, points: 3 }; },
    inputs(p) {
        return (p && p.words ? p.words : [0, 1, 2]).map((_, n) => ({ id: `letter-${n}`, kind: 'text', shape: 'box', graded: true, order: n, maxLength: 1, scopes: ['full'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export default { MATCH3_TEMPLATE, MATCH3_PIC_W, MATCH3_PIC_BOX, match3Letters };
