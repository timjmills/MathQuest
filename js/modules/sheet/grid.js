// js/modules/sheet/grid.js
// The cell grid, the Day band, and the blank-run filler.
//
// PG-10: the grid is a fixed-height box with `repeat(rows, 1fr)` and `repeat(cols, 1fr)`. It is
// never content-sized; columns always total the live width and rows always total gridH.
// CL-1: one outer frame containing cells that share borders like a table - the stylesheet uses
// gap-as-border so a shared line is never doubled (INK-13).
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

import { PAPER, DEFAULT_PAPER, PERMITTED_GRIDS, FULL_WIDTH_ROWS, FACT_GRID_COLS, STRETCH_CAP } from './tokens.js';
import { cell, label, esc } from './cell.js';

/**
 * PG-15 - trailing empty positions. The generator rounds item counts to full rows; any
 * remainder is ONE unruled blank area inside the closed outer frame, with no interior borders
 * and no labels, so a pupil cannot mistake it for unanswered work.
 */
export const blankRun = (fromColumn) => `<div class="ws-cell blankrun" style="--from:${fromColumn}"></div>`;

/**
 * A grid of cells.
 *
 * @param {Array<string|{html: string, cls?: string, style?: string, nolabel?: boolean, model?: boolean}>} cells
 * @param {Object} opts
 * @param {number} opts.cols
 * @param {number} [opts.rows]              defaults to the rows the cells need
 * @param {'letter'|'tab'|'none'} [opts.labels]   CL-10 / CL-30 / CL-20 "none"
 * @param {number} [opts.start]             first label number, so a run continues across pages (CL-12)
 * @param {string} [opts.cls]               'facts' (hairline interiors), 'open' (tests), 'fixed'
 * @param {string} [opts.height]            an explicit grid height, e.g. '99mm'
 * @param {number[]} [opts.unlabelled]      indexes that carry no label (Model / Guided cells, CL-14)
 * @param {string} [opts.rowsTpl]           a grid-template-rows value other than equal rows (the
 *                                          Guided page's model row, which carries its worked trace)
 */
export function grid(cells, { cols, rows, labels = 'none', start = 1, cls = '', height = '', unlabelled = [], rowsTpl = '', spanFirst = false, rowGap = 0 } = {}) {
    const n = cols * (rows || Math.ceil(cells.length / cols));
    let k = start;
    const out = cells.map((c, i) => {
        const item = typeof c === 'string' ? { html: c } : c;
        const lab = unlabelled.includes(i) || item.nolabel ? (item.model ? label('model') : '') : label(labels, k++);
        return cell(item.html, { label: lab, cls: item.cls || '', style: item.style || '' });
    });
    // `spanFirst`: the first cell spans the whole first row (the Guided model with its lines).
    const used = cells.length + (spanFirst ? cols - 1 : 0);
    if (used < n) out.push(blankRun((used % cols) + 1));
    const r = rows || Math.ceil(cells.length / cols);
    // `rowGap` (mm, RUBRIC H13 page fill): a sheet whose problem count is fixed (a Test, the
    // teacher's count) spends the page's spare height as WHITESPACE BETWEEN rows - each row its
    // own framed strip - never as empty space inside the cells. Only with a fixed height.
    const Hmm = parseFloat(height);
    if (rowGap > 0 && r > 1 && Number.isFinite(Hmm) && !spanFirst) {
        const fr = /repeat\(/.test(rowsTpl || 'repeat(') ? Array(r).fill(1) : String(rowsTpl).split(/\s+/).map((t) => parseFloat(t) || 1);
        const sum = fr.reduce((a, b) => a + b, 0);
        const inner = Hmm - rowGap * (r - 1);
        const rowsHtml = [];
        for (let i = 0; i < r; i++) {
            const h = Math.round((inner * fr[i] / sum) * 100) / 100;
            const part = out.slice(i * cols, (i + 1) * cols).join('') + (i === r - 1 ? out.slice(r * cols).join('') : '');
            rowsHtml.push(`<div class="ws-grid ${cls} ws-gridrow" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:1fr;height:${h}mm;${i ? `margin-top:${rowGap}mm;` : ''}">${part}</div>`);
        }
        return `<div class="ws-gridrows" data-ws-rowgap="${rowGap}" style="flex:none;">${rowsHtml.join('')}</div>`;
    }
    return `<div class="ws-grid ${cls}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:${rowsTpl || `repeat(${r},1fr)`};${height ? `height:${height};` : ''}">${out.join('')}</div>`;
}

/**
 * BD-5 - a Day band. Black "Day N" tab flush left in the strip, "Score ___/n" at the right end.
 * HD-3: when Day bands are on, the header Score is suppressed and each band carries its own.
 * Day bands are separated by a 3 mm gap and are never split across pages (PG-21).
 */
export const dayBand = (day, scoreOutOf, content) =>
    `<div class="ws-band" style="margin-top:3mm"><div class="ws-strip" style="min-height:10mm"><span class="ws-daytab">Day ${esc(day)}</span><div class="ws-field score">Score<i></i><b>/${scoreOutOf}</b></div></div>${content}</div>`;

/* ------------------------------------------------------------------ geometry helpers */

/**
 * PG-11 - rows per page, and the cell height that follows.
 *   rows   = min(targetRows, floor((gridH - 1) / hMin))
 *   cellH  = min(gridH / rows, hMin x k)
 * `k` is the stretch cap: 1.3 for fact rows, probes and K counting rows; 2.0 for horizontal
 * equation rows; stacked, visual, word-problem, mixed and spiral cells fill the grid.
 *
 * @returns {{rows: number, cellH: number, fills: boolean}}
 */
export function rowsForSection({ gridHMm, hMinMm, targetRows = Infinity, stretchCap = Infinity }) {
    const hard = Math.max(1, Math.floor((gridHMm - 1) / hMinMm));
    const rows = Math.max(1, Math.min(targetRows, hard));
    const even = gridHMm / rows;
    const capped = stretchCap === Infinity ? even : Math.min(even, hMinMm * stretchCap);
    return { rows, cellH: capped, fills: capped >= even - 0.001 };
}

export const stretchCapFor = (kind) => STRETCH_CAP[kind] || Infinity;

/**
 * SCC-T19 - the span a cell takes on a mixed sheet: ceil(wMm / unitWidth), where unitWidth is
 * the live width divided by the chosen column count. PG-13: a page-side strip reduces the
 * available width, so the width is an input and no formula assumes 186 mm.
 */
export function spanFor(wMm, cols, availableWMm = PAPER[DEFAULT_PAPER].liveWMm) {
    const unit = availableWMm / cols;
    return Math.max(1, Math.min(cols, Math.ceil(wMm / unit - 0.001)));
}

/** PG-13: the grid width left after a page-side strip (strip width + a 4 mm gap). */
export const widthWithStrip = (stripWMm, availableWMm = PAPER[DEFAULT_PAPER].liveWMm) => availableWMm - (stripWMm + 4);

/**
 * CL-2: is this a permitted grid shape?
 *
 * Three families, all of which the rule allows:
 *   - the named pairs 2x2 / 2x3 / 2x4 / 2x5 / 2x8 / 3x3 and the open test arrays 4x4 / 4x5;
 *   - full-width rows for wide visuals: 1 column, 3 to 7 rows;
 *   - fact grids at 5 to 10 columns, any row count.
 *
 * @param {number} cols
 * @param {number} rows
 * @param {{fact?: boolean}} [opts]  `fact: true` for a fact section (5-10 columns)
 */
export function isPermittedGrid(cols, rows, { fact = false } = {}) {
    if (fact) return cols >= FACT_GRID_COLS.min && cols <= FACT_GRID_COLS.max && rows >= 1;
    if (cols === FULL_WIDTH_ROWS.cols) return rows >= FULL_WIDTH_ROWS.minRows && rows <= FULL_WIDTH_ROWS.maxRows;
    if (cols >= FACT_GRID_COLS.min && cols <= FACT_GRID_COLS.max) return true;   // a fact grid, unflagged
    return PERMITTED_GRIDS.includes(`${cols}x${rows}`);
}
