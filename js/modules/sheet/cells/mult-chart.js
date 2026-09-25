// js/modules/sheet/cells/mult-chart.js
// A window of the multiplication chart, template id `mult-chart`: a × corner, one header row
// and one header column (1.5 pt rule after each), R x C products, some cells left empty for the
// pupil to fill.
//
// Every column is wide enough for a THREE-digit product at the chart's number size plus a
// writing margin, and the cells never wrap, so "100 110" can no longer run together as
// "100110" (the critic's merged columns, H-grade 4). The table has that minimum width and the
// cell is measured, so a narrow page column gets fewer chart columns per row, never squeezed
// ones (PG-20). An empty cell holds a writing box (SL-11) of the same size in every blank,
// so the box never tells the pupil how many digits the product has (L-LEAK).
//
// Payload: { r0, c0, rows?: 4, cols?: 5, blanks: [{i, j}] }  (i, j zero-based inside the window)
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, HAIR, HEAVY } from './ops-common.js';
import { INK } from '../tokens.js';

/** The chart's number size relative to the digit size: 3 digits must fit a 1-column window. */
const NUM_EM = 0.68;

const sortedBlanks = (p) => (p.blanks || []).slice().sort((a, b) => a.i - b.i || a.j - b.j);
const productAt = (p, i, j) => (Number(p.r0) + i) * (Number(p.c0) + j);

function keySlots(p) {
    const k = {};
    sortedBlanks(p).forEach((b, n) => { k[`mc${n}`] = String(productAt(p, b.i, b.j)); });
    return k;
}

register('mult-chart', {
    render(p, ctx) {
        const g = geo(ctx);
        const R = p.rows || 4, C = p.cols || 5;
        const ink = inkOf(ctx);
        const key = keySlots(p);
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            const o = {};
            Object.keys(key).forEach((id, n) => { if (l[n] !== undefined) o[id] = l[n]; });
            return o;
        });
        const blanks = sortedBlanks(p);
        const idOf = (i, j) => { const n = blanks.findIndex((b) => b.i === i && b.j === j); return n < 0 ? null : `mc${n}`; };
        // Column width: three digits at the chart size, plus 3 mm of air (never under 1.5 Hw).
        const cellMm = Math.max(3 * 0.55 * NUM_EM * g.E + 2.5, g.writeMm * 1.3);
        const cellH = Math.max(g.writeMm + 4, NUM_EM * g.E * 1.4);
        const td = (content, extra = '') => `<td style="box-sizing:border-box;width:${g.em(cellMm)};min-width:${g.em(cellMm)};height:${g.em(cellH)};`
            + `padding:0;text-align:center;vertical-align:middle;border:${HAIR} solid ${INK.ink};white-space:nowrap;${extra}">${content}</td>`;
        const num = (v, bold = false) => `<span style="font-size:${NUM_EM}em;${bold ? 'font-weight:700;' : ''}">${esc(v)}</span>`;
        let rows = `<tr>${td(num('×', true), `border-right-width:${HEAVY};border-bottom-width:${HEAVY};`)}`;
        for (let j = 0; j < C; j++) rows += td(num(Number(p.c0) + j, true), `border-bottom-width:${HEAVY};`);
        rows += '</tr>';
        for (let i = 0; i < R; i++) {
            rows += `<tr>${td(num(Number(p.r0) + i, true), `border-right-width:${HEAVY};`)}`;
            for (let j = 0; j < C; j++) {
                const id = idOf(i, j);
                if (id) {
                    rows += td(box(g, id, { wMm: cellMm - 2.5, hMm: cellH - 2.5, value: vals[id] || '', ink, mark: 'cell', scale: NUM_EM }));
                } else {
                    rows += td(num(productAt(p, i, j)));
                }
            }
            rows += '</tr>';
        }
        const table = `<table role="grid" aria-label="multiplication chart" style="border-collapse:collapse;table-layout:fixed;margin:0 auto;background:#fff">${rows}</table>`;
        return root(g, 'mult-chart', table, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = keySlots(p);
        const slots = {};
        for (const [id, v] of Object.entries(k)) slots[id] = { value: v, graded: true };
        const list = Object.values(k);
        return { value: list.join(', '), display: list.join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const cellMm = Math.max(3 * 0.55 * NUM_EM * g.E + 2.5, g.writeMm * 1.3);
        const cellH = Math.max(g.writeMm + 4, NUM_EM * g.E * 1.4);
        return {
            wMm: Math.ceil(((p.cols || 5) + 1) * cellMm + 6),
            hMm: Math.ceil(((p.rows || 4) + 1) * cellH + 6),
            measure: true, factLike: false, maxCols: 2,
        };
    },
    inputs(p) {
        return sortedBlanks(p).map((_, n) => ({ id: `mc${n}`, kind: 'number', shape: 'box', graded: true, order: n, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list', requiresVisual: true }; },
});
