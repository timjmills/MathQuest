// js/modules/sheet/cells/wordpic.js
// The `wordpic` template: a K picture word problem (add_wp_10; SF-52, the K sample).
//
//   the story    one sentence per line at cell-text size + 2, question last (SF-50/SF-54: at most
//                four lines, each at most 60 characters)
//   the picture  the two groups the story names, as in-house line-art objects (RP-20) of 10 mm
//                (never under 8 mm) at an item + 3 mm pitch, a clear gap between the groups — no
//                rounded pill round a group and no count caption under it (RP-1: the pupil counts)
//   the work     an empty square-cornered box to draw or write in, named "Draw or work here" in
//                its corner (scratch, not graded, SCC-T17)
//   the answer   ONE number box with the label word printed after it (SL-9: a word-problem blank
//                carries its unit), so the item has exactly one answer place (SL-7)
//
// `pictures: false` (the plain variant) drops the picture row and keeps the rest.
//
// Key (AK-1): the same cell with the answer in the number box. Error analysis writes the wrong
// value there instead. In the screen twin the number box carries `data-mq-blank="box"`.
//
// payload: {lines: [..], a, b, shape, unit, ans, pictures}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, svg, root, box, slotValue, shapeOf, textPt, zonePt, inlineBoxMm, isTwin } from './k2kit.js';

function groups(ctx, a, b, shape) {
    const d = 10, pitch = d + 3, gap = 14;
    const n = a + b;
    const w = (n - 1) * pitch + gap + d + 2, h = d + 2;
    let body = '';
    for (let i = 0; i < n; i++) body += shapeOf(shape).draw(1 + d / 2 + i * pitch + (i >= a ? gap : 0), 1 + d / 2, d);
    return svg(ctx, w, h, body, { label: `${a} and ${b} ${shapeOf(shape).plural}` });
}

register('wordpic', {
    render(p, ctx) {
        const tp = textPt(ctx) + 2;
        const story = (p.lines || []).map((l) => `<div>${esc(l)}</div>`).join('');
        const pic = p.pictures === false ? '' : `<div style="display:flex;justify-content:center;margin:${L(ctx, 4)} 0 ${L(ctx, 2)};">${groups(ctx, p.a, p.b, p.shape)}</div>`;
        const b = inlineBoxMm(ctx, 2);
        const slot = box(ctx, { value: slotValue(ctx, 'answer', p.ans), w: b.w + 2, h: b.h + 2, mark: 'blank' });
        // The work box is NAMED, so it is never taken for a second answer place (2026-09-25
        // regrade: an unlabelled rectangle beside the answer box): a zone label in its corner.
        const work = `<span data-ws-slot="work" data-ws-shape="open" data-ws-graded="0" aria-label="work space" style="display:inline-block;box-sizing:border-box;position:relative;`
            + `flex:1 1 auto;max-width:${L(ctx, 96)};min-width:${L(ctx, 50)};height:${L(ctx, 24)};border:${B(ctx, 0.75)} solid ${INK};background:#fff;">`
            + `<span class="ws-zone" style="position:absolute;left:${L(ctx, 1.5)};top:${L(ctx, 1)};font-size:${P(ctx, zonePt(ctx))};line-height:1.2;white-space:nowrap;">Draw or work here</span></span>`;
        // The story starts at one fixed indent in every cell (the root spans the cell; the indent
        // clears the item letter), so the stories of a page line up instead of each block being
        // centred on its own width.
        return root(ctx, 'k2-wordpic', `<div class="k2-story" style="text-align:left;padding-left:${isTwin(ctx) ? '0' : L(ctx, 5)};font-size:${P(ctx, tp)};line-height:1.45;">${story}</div>`
            + pic
            + `<div style="display:flex;align-items:center;justify-content:space-between;gap:${L(ctx, 8)};margin-top:${L(ctx, 3)};">`
            + `${work}<span style="display:inline-flex;align-items:center;gap:${L(ctx, 2.5)};white-space:nowrap;font-size:${P(ctx, tp)};">`
            + `${slot}<span>${esc(p.unit || '')}</span></span></div>`, { style: 'width:100%;box-sizing:border-box;' });
    },
    answerKey(p) {
        return { value: p.ans, display: String(p.ans), slots: { answer: { value: String(p.ans), graded: true } } };
    },
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});
