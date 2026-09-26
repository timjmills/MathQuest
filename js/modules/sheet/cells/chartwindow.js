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
// Owner, 2026-09-25 (hundreds_chart_fill "Numbers to" 10-100, and number_chart_fill, the chart of
// the hundreds and thousands): `rows` may run past 9 (row 10 is 101-110, row 999 is 9,991-10,000)
// and hold one to three rows, and `cols` may be the whole row of ten (the chart to 10). A window
// of the chart past 100 (three to five digits) widens its cells to hold them at the working digit size
// (the digits never shrink, TY-10): 18 / 26 / 30 mm at L for three, four and five digits. A row of ten is one table on paper; in the
// screen twin it is two halves of five side by side, which the host wraps one under the other
// when a phone is too narrow for ten (fitTwinRows) instead of clipping them.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, sizeOf, inkOf, isTwin, shownParts } from './k2kit.js';

const CELL = { S: { w: 15, h: 15 }, M: { w: 16, h: 16 }, L: { w: 17, h: 17 } };
/** The widest number in the window. */
const topOf = (p) => Math.max(0, ...(p.rows || []).map((r) => r * 10 + Math.max(0, ...(p.cols || [0])) + 1));
/**
 * The cell width for this window: the size's own width, or - for a chart past 100 - the width
 * that holds its numbers at the working digit size (Andika figures are about 0.56 em, the
 * thousands comma about 0.28 em) with 2 to 3 mm either side: 18 / 26 / 30 mm at L for three,
 * four and five digits. A window of the 1-100 chart keeps the size's width.
 */
function cellW(p, size, pt) {
    const base = (CELL[size] || CELL.L).w;
    const top = topOf(p);
    const digits = String(top).length;
    // The 1-100 chart (its one three-digit number is 100) keeps the size's width.
    if (top <= 100) return base;
    return Math.max(base, Math.ceil((digits * 0.56 + (digits >= 4 ? 0.28 : 0)) * pt * (25.4 / 72) + (digits >= 4 ? 5.5 : 4)));
}
/** A chart number as the page writes it: the thousands comma from 1,000 up (SC-4). */
const fmt = (v) => (/^\d{4,}$/.test(String(v)) ? Number(v).toLocaleString('en-US') : String(v));
/** The band above the window that the cell's item letter sits in (mm). */
const LETTER_CLEAR_MM = 4.5;

register('chartwindow', {
    render(p, ctx) {
        const pt = digitPt(ctx) * 0.8;
        const c = { w: cellW(p, sizeOf(ctx), pt), h: (CELL[sizeOf(ctx)] || CELL.L).h };
        const blanks = (p.blanks || []).map(Number);
        const shown = shownParts(ctx, blanks);
        // A row of ten in the screen twin: two halves of five (see the header).
        const halves = isTwin(ctx) && (p.cols || []).length === 10 ? [p.cols.slice(0, 5), p.cols.slice(5)] : [p.cols || []];
        const tables = halves.map((part, h) => {
            let rows = '';
            for (const r of p.rows || []) {
                let tds = '';
                for (const col of part) {
                    const n = r * 10 + col + 1;
                    const k = blanks.indexOf(n);
                    const base = `box-sizing:border-box;width:${L(ctx, c.w)};height:${L(ctx, c.h)};padding:0;text-align:center;vertical-align:middle;`
                        + `font-size:${P(ctx, pt)};font-weight:400;line-height:1;`;
                    if (k < 0) {
                        // Every number sits in the same fixed line box as a written answer (a full-cell
                        // flex span), so no number rides lower than its row-mates (2026-09-25 regrade:
                        // baselines jumped about 1 mm beside a heavy-bordered empty cell).
                        tds += `<td style="${base}border:${B(ctx, 0.75)} solid ${INK};"><span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${fmt(n)}</span></td>`;
                    } else {
                        const v = shown[k];
                        const ink = v !== '' ? inkOf(ctx) : null;
                        const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
                        tds += `<td style="${base}border:${B(ctx, 1.5)} solid ${INK};">`
                            + `<span data-ws-slot="b${k}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:flex;`
                            + `align-items:center;justify-content:center;width:100%;height:100%;font-weight:700;color:${ink === 'trace' ? GREY : INK};">${esc(fmt(v))}</span></td>`;
                    }
                }
                rows += `<tr>${tds}</tr>`;
            }
            // The window stands clear of the item letter in the cell's top-left corner (it printed on
            // the window's corner line): a keep-out band above it, as in the mock-ups.
            // Every window but the classic 3 x 5 of the 1-100 chart (a row of ten, a chart of one or
            // two rows, four- and five-digit cells) states its width, so a narrow cell overflows (and
            // the page measures it into fewer columns) instead of the table squeezing its boxes below
            // the size a pupil writes in. The 3 x 5 keeps its markup (old pages are unchanged).
            const wide = !((p.rows || []).length === 3 && (p.cols || []).length === 5 && c.w === (CELL[sizeOf(ctx)] || CELL.L).w);
            const width = wide ? `width:${L(ctx, part.length * c.w)};` : '';
            if (halves.length === 1) {
                return `<table class="k2-chart" data-mq-join=", " style="border-collapse:collapse;margin:${isTwin(ctx) ? '0' : L(ctx, LETTER_CLEAR_MM)} auto 0;`
                    + `table-layout:fixed;${width}background:#fff;">${rows}</table>`;
            }
            // The second half overlaps the first by its border, so the join reads as one line.
            return `<table class="k2-chart" style="border-collapse:collapse;margin:0${h ? ' 0 0 -1px' : ''};table-layout:fixed;${width}background:#fff;flex:none;">${rows}</table>`;
        });
        if (tables.length === 1) return root(ctx, 'k2-chartwindow', tables[0]);
        return root(ctx, 'k2-chartwindow', `<div data-mq-join=", " style="display:flex;justify-content:center;">${tables.join('')}</div>`);
    },
    answerKey(p) {
        const parts = (p.blanks || []).map(String);
        const slots = {};
        parts.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        return { value: parts.join(', '), display: parts.join(', '), slots };
    },
    footprint(p) {
        // The window's width at L: a 1-100 window (85 mm) shares a row; a row of ten or a window
        // of four- and five-digit numbers takes the whole row (the host's measurement decides at S).
        const w = (p && p.cols ? p.cols.length : 5) * cellW(p || {}, 'L', 28 * 0.8);
        // `hardCap`: the chart's tracks have a 12 mm floor its measurement cannot see (the table
        // squeezes rather than overflowing), so its 2 columns hold at every size (critic guided-r1).
        return w <= 90 ? { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2, hardCap: true }
            : { wMm: Math.ceil(w + 4), hMm: null, measure: true, factLike: false, maxCols: 1 };
    },
    inputs(p) {
        return (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list' }; },
});
