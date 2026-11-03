// js/modules/sheet/graphics/family-chart.js
// Library entry `familyChart` (design/GRAPHIC_LIBRARY.md): a BLANK number-family chart, the four
// related sentences of a family as empty boxes with their signs printed, one sentence a row:
//
//     [ ] + [ ] = [ ]
//     [ ] + [ ] = [ ]
//     [ ] − [ ] = [ ]
//     [ ] − [ ] = [ ]          (× × ÷ ÷ for a multiplication family: `op: '*'`)
//
// WORKING SPACE ONLY (owner, 2026-10-31: "show blank number family chart so students can fill it
// in to answer"): every box is `data-ws-graded="0"`, never an answer place (VQ-2: the cell's one
// graded response stays where it was). The key (`facts` given and `show`) writes the four facts;
// a cell that has no true family to write leaves the chart blank on the key too.
//
// Geometry: the boxes are the library's answer-area boxes (`boxW` / `boxH`: 14 x 11 mm at S,
// 14.3 x 13 at M, 17 x 15 at L for 2 digits), signs at the working digit size, a 0.75 pt box outline
// (VQ-6: working boxes are parts, lighter than the cell's answer place), rows 1.6 mm apart. Same width on every item of a page (digits).
//
// Screen twin: the boxes are typed inputs (`input.mq-wwork`, digits only through
// js/modules/word-work-screen.js), `data-ws-graded="0"` and NO `data-mq-expect`, so nothing is
// marked right or wrong while the pupil works (a green box would give the Yes / No away) and no
// host grades them.
//
// Pure module (SCC-01).

import { INK, L, P, B, isTwin, digitPt, esc, tw, colorOf, NUM_FEATURES, FONT, PT_MM } from './units.js';
import { boxW, boxH } from './answer-area.js';

const GLYPH = { '+': '+', '-': '−', '*': '×', '/': '÷' };
export const FAMILY_CHART_ROW_GAP = 1.6;   // mm between rows and between boxes

/** The four facts of the family whole = a + b (or a × b): the order the chart is keyed in. */
export function familyFacts(a, b, whole, op = '+') {
    const inv = op === '*' ? '/' : '-';
    return [
        { a, op, b, c: whole },
        { a: b, op, b: a, c: whole },
        { a: whole, op: inv, b: a, c: b },
        { a: whole, op: inv, b, c: a },
    ];
}

/** The chart's drawn size in mm (paper), for a cell that lays it out. */
export function familyChartSize(ctx, { digits = 2 } = {}) {
    const w = boxW(ctx, digits), h = boxH(ctx);
    const signW = digitPt(ctx) * 0.62 * PT_MM;
    return { wMm: 3 * w + 2 * signW + 4 * FAMILY_CHART_ROW_GAP, hMm: 4 * h + 3 * FAMILY_CHART_ROW_GAP };
}

/**
 * @param {Object} ctx  the cell context
 * @param {Object} o    {op: '+' | '*' (the family's operation), facts: familyFacts(...) or null,
 *                      show = false (write the facts: the key / a trace), ink, digits = 2, id = 'fc'}
 */
export function familyChart(ctx, o = {}) {
    const { op = '+', facts = null, show = false, ink = null, digits = 2, id = 'fc' } = o;
    const twin = isTwin(ctx);
    const w = boxW(ctx, digits), h = boxH(ctx);
    const col = colorOf(ink);
    const put = !!(show && Array.isArray(facts) && facts.length === 4);
    const inv = op === '*' ? '/' : '-';
    const ops = [op, op, inv, inv];
    const face = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;width:${tw(ctx, w)};height:${tw(ctx, h)};`
        + `border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;${FONT}font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;`
        + `color:${col};text-align:center;${NUM_FEATURES}`;
    const sign = (g) => `<span aria-hidden="true" style="flex:none;min-width:${L(ctx, digitPt(ctx) * 0.62 * PT_MM)};text-align:center;${FONT}font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${INK};">${g}</span>`;
    const box = (slot, v) => (twin
        ? `<input type="text" class="mq-wwork mq-fchart-box" data-mq-kind="number" data-ws-graded="0" maxlength="${Math.max(1, digits)}" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="number family chart, working space" style="${face}padding:0;margin:0;">`
        : `<span data-ws-slot="${esc(slot)}" data-ws-shape="box" data-ws-graded="0"${put && ink ? ` data-ws-ink="${ink}"` : ''} style="${face}">${put ? esc(v) : ''}</span>`);
    const rows = ops.map((g, i) => {
        const f = put ? facts[i] : {};
        return `<div class="mq-fchart-row" style="display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;gap:${twin ? '6px' : L(ctx, FAMILY_CHART_ROW_GAP)};">`
            + `${box(`${id}${i}-a`, f.a)}${sign(GLYPH[g])}${box(`${id}${i}-b`, f.b)}${sign('=')}${box(`${id}${i}-c`, f.c)}</div>`;
    }).join('');
    return `<div class="mq-fchart" role="group" aria-label="number family chart (working space)" data-ws-work="1" style="display:flex;flex-direction:column;align-items:center;gap:${twin ? '6px' : L(ctx, FAMILY_CHART_ROW_GAP)};">${rows}</div>`;
}
