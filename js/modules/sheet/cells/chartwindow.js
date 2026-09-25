// js/modules/sheet/cells/chartwindow.js
// The `chartwindow` template: a window of the 1-100 chart with one to three empty cells
// (hundreds_chart_fill).
//
// Three rows by five columns cut from the chart, row-major, so across is one more and down is
// ten more (the two patterns the chart exists to teach). The window can sit anywhere on the chart
// (the first row, the last row, either side), and a blank can sit anywhere in the window — a
// corner, an edge or the middle — as long as it has a printed number beside it in its row or its
// column, so the pupil always has somewhere to count from. The EMPTY CELLS ARE THE WRITING
// PLACES: each is a whole chart cell, 17 x 17 mm at L (never under the 14 mm of RUBRIC H9), with
// a 1.5 pt border so the pupil can see where to write. No caption, no colour, no "?". The chart's
// own numbers print in regular weight and a WRITTEN number (the key, Error analysis's finished
// work) in bold, so the work being checked is never mistaken for the chart.
//
// Key (AK-1, AK-2): the same window with each answer written in its own cell. In the screen twin
// every empty cell carries `data-mq-cell`, so each becomes its own input and the values travel
// to the host input joined ", " in reading order — which is what `q.ans` holds.
//
// payload: {rows: [r, r+1, r+2] (0-based chart rows), cols: [c .. c+4], blanks: [n, ...] (reading order)}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, sizeOf, inkOf, isTwin, shownParts } from './k2kit.js';

const CELL = { S: { w: 15, h: 15 }, M: { w: 16, h: 16 }, L: { w: 17, h: 17 } };
/** The band above the window that the cell's item letter sits in (mm). */
const LETTER_CLEAR_MM = 4.5;

register('chartwindow', {
    render(p, ctx) {
        const c = CELL[sizeOf(ctx)] || CELL.L;
        const blanks = (p.blanks || []).map(Number);
        const shown = shownParts(ctx, blanks);
        const pt = digitPt(ctx) * 0.8;
        let rows = '';
        for (const r of p.rows || []) {
            let tds = '';
            for (const col of p.cols || []) {
                const n = r * 10 + col + 1;
                const k = blanks.indexOf(n);
                const base = `box-sizing:border-box;width:${L(ctx, c.w)};height:${L(ctx, c.h)};padding:0;text-align:center;vertical-align:middle;`
                    + `font-size:${P(ctx, pt)};font-weight:400;line-height:1;`;
                if (k < 0) {
                    // Every number sits in the same fixed line box as a written answer (a full-cell
                    // flex span), so no number rides lower than its row-mates (2026-09-25 regrade:
                    // baselines jumped about 1 mm beside a heavy-bordered empty cell).
                    tds += `<td style="${base}border:${B(ctx, 0.75)} solid ${INK};"><span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${n}</span></td>`;
                } else {
                    const v = shown[k];
                    const ink = v !== '' ? inkOf(ctx) : null;
                    const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
                    tds += `<td style="${base}border:${B(ctx, 1.5)} solid ${INK};">`
                        + `<span data-ws-slot="b${k}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:flex;`
                        + `align-items:center;justify-content:center;width:100%;height:100%;font-weight:700;color:${ink === 'trace' ? GREY : INK};">${esc(v)}</span></td>`;
                }
            }
            rows += `<tr>${tds}</tr>`;
        }
        // The window stands clear of the item letter in the cell's top-left corner (it printed on
        // the window's corner line): a keep-out band above it, as in the mock-ups.
        return root(ctx, 'k2-chartwindow', `<table class="k2-chart" data-mq-join=", " style="border-collapse:collapse;margin:${isTwin(ctx) ? '0' : L(ctx, LETTER_CLEAR_MM)} auto 0;`
            + `table-layout:fixed;background:#fff;">${rows}</table>`);
    },
    answerKey(p) {
        const parts = (p.blanks || []).map(String);
        const slots = {};
        parts.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        return { value: parts.join(', '), display: parts.join(', '), slots };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs(p) {
        return (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list' }; },
});
