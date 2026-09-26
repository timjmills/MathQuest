// js/modules/sheet/layout.js
// THE LAYOUT ENGINE: one pure function that decides columns, rows, cell size and page count for
// a section, so the dialog's "Fits:" line, the preview and the printer can never disagree.
//
// Rules this file implements (WORKSHEET_DESIGN_STANDARD.md unless marked PT-, which is
// design/PAGE_TYPES.md):
//   PG-1   live width 186 mm on every paper          PG-2   body height from the live height
//   PG-10  fixed-height grid, never content-sized     PG-11  rows = min(target, floor((G-1)/hMin))
//   PG-12  1 mm safety; widths fit cellW - 0.6        PG-13  available width is an input
//   HD-12 / HD-14 / HD-20  header heights             CL-2   permitted grid shapes
//   DN-10  content never shrinks with columns         DN-12/13  explicit N honoured or clamped
//   DN-14  clamp notes go to the dialog, never the sheet
//   DN-15  Auto = the largest N up to the role's cap that fits; never 1 when 2 fit
//   DN-20  resolveSectionLayout returns {cols, clamped, reason, digitPt, trackMm, cellW, cellH,
//          rows, perPage, pages}
//   12.1   ceilings by page role (never exceeded)    12.3   capacity tables (the unit tests hold them)
//   PT-IND-1  Independent targets {1:4, 2:3, 3:3, 4:4, 5:5, 6:6}; PT-COL-6 Auto caps by role
//
// MEASURE-FREE. Every decision is taken from footprints (SKILL_CELL_CONTRACT.md 2.8). A legacy
// cell has no static height (`measure: true`, SCC-A6), so the HOST measures it once and hands
// the result in as `item.measured[cols] = {hMm, fits}`; this module never touches the DOM.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import {
    PAPER, DEFAULT_PAPER, SIZES, DEFAULT_SIZE, LOOKS, DEFAULT_LOOK, EM_MM, STROKE,
    FACT_LADDER, factCellHMm, factDigitPt, trackMm as tokenTrackMm, blankWidth,
} from './tokens.js';
import { cellFootprint } from './registry.js';

/* ============================================================================ constants */

export const PT_MM = 25.4 / 72;
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

/** PG-1: the live width is 186 mm on every paper. */
export const LIVE_W_MM = 186;

/** Section 2.1: the footer block under the body (6 mm footer + 3 mm gap). */
export const FOOTER_BLOCK_MM = 9;

/** HD-20 / PT-FRM-2: every continuation page carries a 12 mm header. */
export const CONT_HEADER_MM = 12;

/**
 * HD-8.3 as the kit's `page()` actually draws it. Row A is always drawn (14 mm with the strand
 * tab, 11 mm without), the title block is 1 + 8 mm, and the rule block is 1.2 + 0.8 + 1 mm.
 * All five parts on gives the standard's 26 mm. The two rows of HD-8.3 the kit does not draw
 * yet (the lifted title, and row A dropped when every field and the tab are off) are not
 * modelled: the engine lays out what PRINTS, never what the table would like to print.
 */
export const HEADER_PARTS_MM = Object.freeze({ rowTab: 14, rowNoTab: 11, title: 9, titleWrap: 6, rule: 3 });

/** PG-12: fixed heights on a page total no more than gridH - 1 mm; widths fit cellW - 0.6 mm. */
export const SAFETY_H_MM = 1;
export const SAFETY_W_MM = 0.6;

/** DN-15: Auto keeps column fill at or under 92% and at least 6 mm slack on stacked work. */
export const AUTO_FILL = 0.92;
export const AUTO_SLACK_MM = 6;

/**
 * DN-15 / PT-COL-6: the Auto column count and the hard cap, by page role.
 * A value keyed by size is S / M / L; one keyed by look is I Can / Daily.
 */
export const ROLE_COLUMNS = Object.freeze({
    'independent': Object.freeze({ auto: 2, cap: 6, capVisual: 4 }),
    'more-practice': Object.freeze({ auto: 2, cap: 6, capVisual: 4 }),
    'lesson': Object.freeze({ auto: Object.freeze({ S: 4, M: 3, L: 3 }), cap: 6, capVisual: 4 }),
    'computation-grid': Object.freeze({ auto: Object.freeze({ ican: 2, daily: 3 }), cap: 6, capVisual: 6 }),
    'fact-rows': Object.freeze({ auto: Object.freeze({ S: 10, M: 6, L: 5 }), cap: 10, capVisual: 10 }),
    'fact-probe': Object.freeze({ auto: 5, cap: 10, capVisual: 10 }),
    'visual-grid': Object.freeze({ auto: 5, cap: 5, capVisual: 5 }),
    'word-problems': Object.freeze({ auto: 1, cap: 1, capVisual: 1 }),
});

/**
 * 12.1: items-per-page CEILINGS for the two roles this engine composes today. A ceiling is
 * never exceeded; a smaller count is always allowed.
 *   standard   stack, short computation, medium visual            6 at every size
 *   long       long procedures (long division, multi-row multiply) 4 (PT 2.4: the 2 x 2 grid)
 *   short      one-symbol answers, on the 2 x 4 / 2 x 5 / 2 x 8 grids   16 at every size
 *   wide       wide-visual rows                                   5 / 4 / 3
 *   word       word problems, plain rows                          4 / 3 / 3
 */
export const PRACTICE_CEILING = Object.freeze({
    standard: Object.freeze({ S: 6, M: 6, L: 6 }),
    long: Object.freeze({ S: 4, M: 4, L: 4 }),
    short: Object.freeze({ S: 16, M: 16, L: 16 }),
    wide: Object.freeze({ S: 5, M: 4, L: 3 }),
    word: Object.freeze({ S: 4, M: 3, L: 3 }),
});

/**
 * The grid each footprint class asks for on an Independent / More Practice page (PT 2.4).
 * `rows` is the TARGET; PG-11 lowers it when the class's tallest cell does not fit.
 * One-symbol answers target 2 x 8 at S, 2 x 5 at M and 2 x 4 at L: the approved size-L
 * mock-up (05 Practice A) is 2 x 4, and the ceiling allows up to 16 at every size.
 */
export const PRACTICE_TARGET = Object.freeze({
    standard: Object.freeze({ cols: 2, rows: Object.freeze({ S: 3, M: 3, L: 3 }) }),
    long: Object.freeze({ cols: 2, rows: Object.freeze({ S: 2, M: 2, L: 2 }) }),
    // A one-column short cell (a number line with its equation) holds 5 to a page (owner, 2026-09-25).
    short: Object.freeze({ cols: 2, rows: Object.freeze({ S: 8, M: 5, L: 4 }), rowsByCols: Object.freeze({ 1: 5 }) }),
    wide: Object.freeze({ cols: 1, rows: Object.freeze({ S: 5, M: 4, L: 3 }) }),
    word: Object.freeze({ cols: 1, rows: Object.freeze({ S: 4, M: 3, L: 3 }) }),
});

/**
 * Dense packing (`section.dense`): the most columns tried, the room a cell keeps over its
 * tallest measured content (1.2 x: the measurement already holds the pads and the open answer
 * zone, so a fifth again of breathing room is what CL-5 needs), and the per-class ceilings from 12.3's capacity tables - one-symbol
 * answers and facts up to 16 (12.1's one-symbol ceiling; 20 at S and M on a Test), stacked work
 * up to 12 (3 x 4), long procedures up to 6.
 */
export const DENSE_MAX_COLS = 4;
/** RUBRIC H13: a cell is never stretched past this multiple of its tallest measured content. */
export const FILL_CAP = 1.8;
/** Page fill: the practice roles take more rows when less than this share of the grid is used. */
export const PAGE_FILL = 0.85;
/** DN-1: outside fact layouts no page holds more than 20 scored problems. */
export const DN1_MAX = 20;
const FILL_ROLES = new Set(['independent', 'more-practice']);
export const DENSE_ROOM = 1.2;
export const DENSE_CEILING = Object.freeze({
    short: Object.freeze({ S: 16, M: 16, L: 16 }),
    standard: Object.freeze({ S: 12, M: 12, L: 12 }),
    long: Object.freeze({ S: 6, M: 6, L: 4 }),
});

/** PT-IND-1: target rows when the teacher sets the column count explicitly. */
export const EXPLICIT_TARGET_ROWS = Object.freeze({ 1: 4, 2: 3, 3: 3, 4: 4, 5: 5, 6: 6 });

/** CL-2: the row counts a two-column grid may take (2 x 2 / 2 x 3 / 2 x 4 / 2 x 5 / 2 x 8). */
export const TWO_COL_ROWS = Object.freeze([8, 5, 4, 3, 2]);

/** CL-2: full-width rows are 3 to 7; word problems print 1 or 2 per page (PT 3.7 v1 / v2). */
export const ONE_COL_ROWS = Object.freeze({ min: 3, max: 7 });

/* ================================================================ paper and header geometry */

/** 'A4' | 'Letter' | 'letter' | a PAPER entry -> the PAPER entry. */
export function paperOf(paper) {
    if (paper && typeof paper === 'object' && paper.liveHMm) return paper;
    const id = /letter/i.test(String(paper || '')) ? 'letter' : DEFAULT_PAPER;
    return PAPER[id] || PAPER[DEFAULT_PAPER];
}

/**
 * The header height the kit prints (HD-8.3 / HD-14 / HD-20).
 * @param {Object} [header]  {name, date, score, tab, title, titleLines}
 * @param {{cont?: boolean}} [opts]  `cont`: a continuation page (HD-20), always 12 mm
 */
export function headerHeightMm(header = {}, { cont = false } = {}) {
    if (cont) return CONT_HEADER_MM;
    const h = HEADER_PARTS_MM;
    const hasTab = Array.isArray(header.tab) ? header.tab.length > 0 : !!header.tab;
    const hasTitle = !!header.title;
    const lines = Math.max(1, Number(header.titleLines) || 1);
    return (hasTab ? h.rowTab : h.rowNoTab) + (hasTitle ? h.title + h.titleWrap * (lines - 1) : 0) + h.rule;
}

/** PG-2 / HD-12: body = live height - header - footer block. */
export function bodyHeightMm(paper, header = {}, opts = {}) {
    return r3(paperOf(paper).liveHMm - headerHeightMm(header, opts) - FOOTER_BLOCK_MM);
}

/** The instruction block, 8 / 8 / 9 mm (section 2.1). */
export const instructionMm = (size = DEFAULT_SIZE) => (SIZES[size] || SIZES[DEFAULT_SIZE]).instrMm;

/** gridH: the body under one instruction line. A4, full header: 228 / 228 / 227 mm. */
export function gridHeightMm(paper, size = DEFAULT_SIZE, header = {}, opts = {}) {
    const withInstr = opts.instruction !== false;
    return r3(bodyHeightMm(paper, header, opts) - (withInstr ? instructionMm(size) : 0));
}

/** The full header every standard table assumes: Name, Date, Score, strand tab and title. */
export const FULL_HEADER = Object.freeze({ name: true, date: true, score: 1, tab: ['Level', 'Strand', 'Id'], title: 'I Can' });

/* ================================================================= cell widths and borders */

/** The border between two cells: the look's cell rule (0.75 pt I Can, 1.5 pt Daily). */
export const cellBorderMm = (look = DEFAULT_LOOK) => r3((LOOKS[look] || LOOKS[DEFAULT_LOOK]).cellBorderPt * PT_MM);
/** The outer frame of a grid: 1.5 pt in both looks (CL-1). */
export const FRAME_MM = r3(STROKE.heavy * PT_MM);

/**
 * The nominal cell width the standard quotes (186 / cols) and the inner width a cell's content
 * really has once the outer frame and the shared borders are taken out. Hosts measure legacy
 * content at `innerW` so the measurement matches the printed box.
 */
export function cellWidthMm(cols, availableWidthMm = LIVE_W_MM, look = DEFAULT_LOOK) {
    const c = Math.max(1, cols);
    const nominal = availableWidthMm / c;
    const inner = (availableWidthMm - 2 * FRAME_MM - (c - 1) * cellBorderMm(look)) / c;
    return { nominal: r3(nominal), inner: r3(inner) };
}

/* ================================================================ capacity-table formulas */

/**
 * 12.3 "Stacked arithmetic: maximum columns":
 *   largest c <= 6 with  c x (T x track + separators x 0.3 em + 2 x sidePad) + (c + 1) x border <= W
 *
 * `track` is the look's em fraction of the preset digit size (TY-20; 0.95 em for Daily or with
 * any regroup scaffold, TY-21). The table in 12.3 is computed WITHOUT TY-23's 0.7 x Hw floor:
 * with the floor, T = 7 in the I Can look at size S gives 4, and the table - which is law for
 * capacity - prints 5. The floor still governs how a stack DRAWS its tracks (tokens.trackMm);
 * this function only reproduces the capacity the standard publishes.
 *
 * @param {number} T  track count including the operator track
 * @param {'S'|'M'|'L'} size
 * @param {'ican'|'daily'} look
 * @param {{regroup?: boolean, separators?: number, W?: number, cap?: number}} [opts]
 */
export function stackMaxColumns(T, size = DEFAULT_SIZE, look = DEFAULT_LOOK, { regroup = false, separators = 0, W = LIVE_W_MM, cap = 6 } = {}) {
    const s = SIZES[size] || SIZES[DEFAULT_SIZE];
    const em = EM_MM[s.digitPt] || (s.digitPt * PT_MM);
    const trackEm = regroup ? 0.95 : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).trackEm;
    const sidePad = STACK_SIDE_PAD_MM[s.id];
    const border = cellBorderMm(look);
    const cellMin = T * em * trackEm + separators * 0.3 * em + 2 * sidePad;
    let best = 1;
    for (let c = 1; c <= cap; c++) if (c * cellMin + (c + 1) * border <= W + 1e-9) best = c;
    return best;
}

/** CL-8: the side pad of a stacked multi-digit cell, 4 / 6 / 6 mm. */
export const STACK_SIDE_PAD_MM = Object.freeze({ S: 4, M: 6, L: 6 });

/**
 * PT 1.9: the minimum height of a plain stacked tableau (two operand rows, sum rule, answer
 * row, pads). I Can 33 / 41 / 49, Daily 35 / 43 / 51. Regroup boxes add their row (8 at L).
 */
export const STACK_HMIN_MM = Object.freeze({
    ican: Object.freeze({ S: 33, M: 41, L: 49 }),
    daily: Object.freeze({ S: 35, M: 43, L: 51 }),
});

/**
 * 12.3 "Fact rows (vertical)": rows = floor((G - 1) / factCellH(cols, size)).
 * @returns {{cols, rows, perPage, cellH, digitPt, gridH}}
 */
export function factRowsCapacity(cols, size = DEFAULT_SIZE, paper = DEFAULT_PAPER, header = FULL_HEADER) {
    const G = gridHeightMm(paper, size, header);
    const cellH = factCellHMm(cols, size);
    const rows = Math.max(1, Math.floor((G - SAFETY_H_MM) / cellH));
    return { cols, rows, perPage: rows * cols, cellH, digitPt: factDigitPt(cols), gridH: G };
}

/**
 * 12.3 "Stacked arithmetic: rows and items" (plain add / subtract). Target rows by columns
 * {1: 4, 2: 3, 3: 3, 4: 4, 5: 5, 6: 6}; rows = min(target, floor((G - 1) / hMin)); the cells
 * fill the grid (PG-11: stacked cells have no stretch cap). A column count the digits do not
 * allow (12.3 maximum-columns table) returns null - the "-" of the table.
 */
export function stackCapacity(cols, size = DEFAULT_SIZE, look = DEFAULT_LOOK, { T = 3, paper = DEFAULT_PAPER, header = FULL_HEADER } = {}) {
    if (cols > stackMaxColumns(T, size, look)) return null;
    const G = gridHeightMm(paper, size, header);
    const hMin = (STACK_HMIN_MM[look] || STACK_HMIN_MM.ican)[size];
    const target = EXPLICIT_TARGET_ROWS[cols] || cols;
    const rows = Math.max(1, Math.min(target, Math.floor((G - SAFETY_H_MM) / hMin)));
    return { cols, rows, cellW: r2(LIVE_W_MM / cols), cellH: r2(G / rows), items: rows * cols, hMin, gridH: G };
}

/**
 * PT 3.4 "Visual grid": max columns = floor(186 / (max(visual, answer) + 6)), never more than 5;
 * required height = visual + name label + inset 3 + gap 2 + AZ (Hw + 4) + 3; rows = min(4, ...).
 * Only the visuals whose table rows this formula reproduces are listed; the rest are owed.
 */
export const VISUAL_MIN = Object.freeze({
    // key: {w, h} per size in mm; `label` = a name label under the visual (shapes)
    'clock-read': Object.freeze({ S: [36, 36], M: [42, 42], L: [50, 50] }),
    'clock-draw': Object.freeze({ S: [46, 46], M: [50, 50], L: [52, 52] }),
    'ten-frame': Object.freeze({ S: [40, 16], M: [45, 18], L: [50, 20] }),
    'array-5': Object.freeze({ S: [35, 35], M: [40, 40], L: [45, 45] }),
    'base10-99': Object.freeze({ S: [39.5, 25], M: [45, 30], L: [50.5, 35] }),
    'shape-name': Object.freeze({ S: [30, 30], M: [36, 36], L: [42, 42], label: true }),
});

export function visualGridCapacity(visual, size = DEFAULT_SIZE, paper = DEFAULT_PAPER) {
    const v = VISUAL_MIN[visual];
    if (!v) return null;
    const s = SIZES[size] || SIZES[DEFAULT_SIZE];
    const [w, h] = v[s.id];
    const az = s.writeMm + 4;
    const labelMm = v.label ? s.writeMm : 0;
    const required = h + labelMm + 3 + 2 + az + 3;
    const cols = Math.min(5, Math.floor(LIVE_W_MM / (Math.max(w, blankWidth(2, s.id)) + 6)));
    const G = gridHeightMm(paper, s.id, FULL_HEADER);
    const rows = Math.max(1, Math.min(4, Math.floor((G - SAFETY_H_MM) / required)));
    return { cols, rows, perPage: cols * rows, required, gridH: G };
}

/* ====================================================================== item metrics */

/**
 * What the engine needs to know about one item, normalised from whatever the host passes:
 *
 *   {footprint}            a footprint (SKILL_CELL_CONTRACT.md 2.8) - taken as is
 *   {q}                    a question: its footprint comes from the registry (`cellFootprint`)
 *   {measured: {[cols]: {hMm, fits}}}   the host's measurement of a `measure: true` cell at
 *                          each column count it tried: the whole cell's height in mm, padding
 *                          and label reserve included, and whether it fitted the width without
 *                          overflow, clipping or shrinking (DN-10)
 *   {fclass: 'short'|'long'|'word'|'wide'|'standard'}   the footprint class, when the host knows it
 *
 * @returns {{fp: Object, fclass: string, measured: Object|null}}
 */
export function itemInfo(item, ctx = {}) {
    const it = item || {};
    let fp = it.footprint || null;
    if (!fp && it.q) {
        try { fp = cellFootprint(it.q, ctx); } catch (e) { fp = null; }
    }
    return { fp: fp || { wMm: 93, hMm: null, measure: true, maxCols: 2 }, fclass: it.fclass || '', measured: it.measured || null };
}

/**
 * The column cap of one item. A footprint's `maxCols` is its author's guess at L; a MEASURED cell
 * (`measure: true`, measured by the host at every column count the layout may choose) is capped
 * by the measurement instead - the widest count at which nothing overflowed, clipped, shrank or
 * reflowed (DN-10). Owner 2026-09-25: "when on two columns it goes smaller and moves to two
 * columns" - a rounding table at S was held to one column by a guess made for L.
 */
export function itemCap(info) {
    const { fp, measured } = info;
    const cap = fp.maxCols || 6;
    if (!fp.measure || !measured) return cap;
    const ok = Object.entries(measured).filter(([, m]) => m && m.fits !== false && Number.isFinite(m.hMm)).map(([c]) => Number(c));
    return ok.length ? Math.max(...ok) : cap;
}

/** The tallest cell a column count needs, from the static footprint (PG-11's hMin). */
function staticHMin(fp, size) {
    const s = SIZES[size] || SIZES[DEFAULT_SIZE];
    const tab = s.tabMm;
    if (fp.hMm === null || fp.hMm === undefined) {
        // An unmeasured legacy cell: the size class is the only thing known. These are the
        // standard's footprint minimums at L (PT 1.9), scaled by the writing height.
        const byClass = { compact: 30, standard: 57, medium: 70, wide: 60, spacious: 110 };
        const k = s.writeMm / SIZES.L.writeMm;
        return Math.round((byClass[fp.size] || 57) * (0.6 + 0.4 * k));
    }
    if (fp.factLike) return fp.hMm;                          // VA-70 heights include the pads
    if (fp.tracks) return fp.hMm + tab + 2 + 4;              // CL-8: stack top pad label + 2, bottom 4
    return fp.hMm + tab + 1 + 3;                             // CL-8 / CL-40: label keep-out + pads
}

/** Does this item fit `cols` columns?  {fits, why, hMin} */
function fitAt(info, cols, { size, look, availableWidthMm, auto }) {
    const { fp, measured } = info;
    const { nominal, inner } = cellWidthMm(cols, availableWidthMm, look);
    const m = measured && measured[cols];
    let hMin = staticHMin(fp, size);
    if (m && Number.isFinite(m.hMm)) hMin = fp.measure || fp.hMm == null ? m.hMm : Math.max(hMin, m.hMm);
    const maxCols = m && fp.measure ? Math.max(cols, itemCap(info)) : fp.maxCols || 6;
    if (cols > maxCols) return { fits: false, why: 'cap', hMin };
    // The host's measurement is the truth about overflow, clipping and shrinking (DN-10).
    if (m && m.fits === false) return { fits: false, why: 'width', hMin };
    if (!m && fp.measure && fp.hMm == null && cols > (fp.maxCols || 2)) return { fits: false, why: 'unmeasured', hMin };
    // A static footprint is checked as well, measured or not: the measurement proves nothing
    // overflows, the footprint carries the standard's margins.
    const staticW = !fp.measure && Number.isFinite(fp.wMm);
    if (staticW && fp.tracks && !fp.factLike) {
        // 12.3's digit-aware clamp for stacked work (VA-6).
        if (cols > stackMaxColumns(fp.tracks, size, look, { regroup: !!fp.regroup, W: availableWidthMm })) return { fits: false, why: 'digits', hMin };
    }
    if (staticW) {
        if (fp.wMm > inner - SAFETY_W_MM) return { fits: false, why: 'width', hMin };
        // DN-15: Auto keeps the column fill at 92% or less and 6 mm of slack on stacked work.
        if (auto && fp.tracks && !fp.factLike && (fp.wMm > AUTO_FILL * nominal || nominal - fp.wMm < AUTO_SLACK_MM)) {
            return { fits: false, why: 'fill', hMin };
        }
    }
    return { fits: true, why: '', hMin };
}

/**
 * Does `item` fit `cols` columns with the Auto margins (DN-15)? The host folds this into a
 * section's floor (`floor[cols].autoFits`), so an Auto layout is chosen from the whole measured
 * sample of the skill, not from the handful of items finally kept (PT-ENG-9).
 */
export function autoFitsAt(item, cols, { size, look, paper, availableWidthMm } = {}) {
    const sz = SIZES[size] ? size : DEFAULT_SIZE;
    const lk = LOOKS[look] ? look : DEFAULT_LOOK;
    const info = itemInfo(item, { size: sz, look: lk, paper: paperOf(paper || DEFAULT_PAPER).id, mode: 'print' });
    return fitAt(info, cols, { size: sz, look: lk, availableWidthMm: Number(availableWidthMm) || LIVE_W_MM, auto: true }).fits;
}

/* ======================================================================== classification */

/**
 * Which footprint class a section belongs to (PT 2.4). The tallest-demanding class wins:
 * one word problem makes the section a word-problem section.
 */
export function sectionClass(infos) {
    const classes = infos.map((i) => i.fclass || (i.fp.size === 'spacious' ? 'word' : 'standard'));
    if (classes.includes('word')) return 'word';
    if (classes.includes('wide')) return 'wide';
    if (classes.includes('long')) return 'long';
    if (classes.length && classes.every((c) => c === 'short')) return 'short';
    return 'standard';
}

/* ================================================================== the one function (DN-20) */

/**
 * resolveSectionLayout(section, items, paper, availableWidthMm, ctx)
 *
 * @param {Object} section
 * @param {string} [section.role]              'independent' | 'more-practice' | ...
 * @param {'auto'|number} [section.columns]    the teacher's choice, never overwritten (DN-12)
 * @param {number} [section.count]             items asked for
 * @param {Object} [section.floor]             {[cols]: {hMm, fits}} - a measured worst case to honour
 * @param {Object[]} items                     see `itemInfo`
 * @param {string|Object} [paper]              'A4' | 'Letter'
 * @param {number} [availableWidthMm]          186, or less beside a page-side strip (PG-13)
 * @param {Object} [ctx]                       {look, size, header, titleLines}
 * @returns {{
 *   cols: number, rows: number, cellW: number, cellH: number, innerW: number,
 *   perPage: number, pages: number, clamped: boolean, reason: string, note: string,
 *   digitPt: number, trackMm: number|null, cls: string, gridH: number, gridHCont: number,
 *   hMin: number, requested: 'auto'|number, ceiling: number, fill: boolean, count: number,
 * }}
 */
export function resolveSectionLayout(section = {}, items = [], paper = DEFAULT_PAPER, availableWidthMm = LIVE_W_MM, ctx = {}) {
    const size = SIZES[ctx.size] ? ctx.size : DEFAULT_SIZE;
    const look = LOOKS[ctx.look] ? ctx.look : DEFAULT_LOOK;
    const role = section.role || 'independent';
    const W = Number(availableWidthMm) || LIVE_W_MM;
    const header = ctx.header || FULL_HEADER;
    // A banded role (Guided, Review, the thinking pages ...) hands in the height its grid really
    // has once its strips and bands are taken off; a grid role leaves it to the header formula.
    const gridOverride = Number(section.gridH) > 0 ? Number(section.gridH) : 0;
    const G = gridOverride || gridHeightMm(paper, size, header);
    const Gc = gridOverride || gridHeightMm(paper, size, header, { cont: true });
    const infos = (items || []).map((it) => itemInfo(it, { size, look, paper: paperOf(paper).id, mode: 'print' }));
    const cls = sectionClass(infos);
    // A role's own grid (PT 2.3, 2.7, 2.9, 6.1 ...) overrides the Independent targets and ceiling:
    //   section.target  = {cols, rows: N | {S, M, L}, rowsByCols?: {[cols]: N}}
    //   section.ceiling = N | {S, M, L}        section.autoCap / section.maxCols = N
    const bySize = (v) => (v && typeof v === 'object' ? v : { S: v, M: v, L: v });
    const target = section.target && section.target.cols
        ? { cols: section.target.cols, rows: bySize(section.target.rows || 3), rowsByCols: section.target.rowsByCols || null }
        : PRACTICE_TARGET[cls];
    const ceiling = section.ceiling !== undefined && section.ceiling !== null
        ? (bySize(section.ceiling)[size] || PRACTICE_CEILING[cls][size]) : PRACTICE_CEILING[cls][size];
    const roleCols = ROLE_COLUMNS[role] || ROLE_COLUMNS.independent;
    const requested = section.columns === undefined || section.columns === null || section.columns === 'auto' || section.columns === 0
        ? 'auto' : Math.max(1, Math.min(10, Math.floor(Number(section.columns)) || 1));
    const notes = [];

    // The section's column cap: the role's, then every item's own (`maxCols`, a hard cap
    // before the digit-aware clamp). Word problems and wide rows are one column (PT-WPR-1).
    const hardCap = cls === 'word' || cls === 'wide' ? 1
        : Math.min(roleCols.cap, Number(section.maxCols) || 10, ...infos.map(itemCap));
    const autoCap = Number(section.autoCap) > 0 ? Number(section.autoCap)
        : section.target && section.target.cols ? section.target.cols
        : typeof roleCols.auto === 'object' ? (roleCols.auto[size] || roleCols.auto[look] || 2) : roleCols.auto;

    // `section.floor[cols] = {hMm, fits}`: the worst case the host measured over a wider sample of
    // the section's skills than the items finally kept. Folding it in keeps the page capacity a
    // property of the SKILL, so trimming a run to a page can never change the layout it was
    // trimmed for, and the grid never reveals which item happened to be biggest (PT-ENG-9).
    const floor = section.floor || null;
    const probe = (c, auto) => {
        const res = infos.map((i) => fitAt(i, c, { size, look, availableWidthMm: W, auto }));
        const f = floor && floor[c];
        return {
            // An Auto probe also honours the floor's Auto fit: a column count one of the skill's
            // measured items fails under the Auto margins is not chosen for the few items kept.
            fits: res.every((r) => r.fits) && !(f && f.fits === false) && !(auto && f && f.autoFits === false),
            why: (res.find((r) => !r.fits) || {}).why || (f && f.fits === false ? 'width' : f && auto && f.autoFits === false ? 'fill' : ''),
            hMin: Math.max(0, f && Number.isFinite(f.hMm) ? f.hMm : 0, ...res.map((r) => r.hMin)),
        };
    };

    let cols;
    let clamped = false;
    let reason = '';
    if (requested === 'auto') {
        // DN-15: the largest N up to the Auto cap that fits with the Auto margins. It never
        // returns 1 when 2 fit, because it counts DOWN from the cap and stops at the first fit.
        // A footprint may raise Auto's column target (`fp.autoCols`) when EVERY item of the section
        // asks for it - a narrow picture cell, a thermometer (critic figures-r6: 2 columns on the
        // independent S page where the Test holds 3). Width is still measured (probe below).
        const fpAuto = infos.length && infos.every((i) => Number(i.fp && i.fp.autoCols) > 0)
            ? Math.min(...infos.map((i) => Number(i.fp.autoCols))) : 0;
        const top = Math.min(cls === 'word' || cls === 'wide' ? 1 : Math.max(target ? target.cols : 2, fpAuto), Math.max(autoCap, fpAuto), hardCap);
        cols = 1;
        for (let c = Math.max(1, top); c >= 1; c--) { if (probe(c, true).fits) { cols = c; break; } }
        // A cell that restacks by width (`fp.byCapacity`: a graph with its question beside it in
        // one column, under it in two) takes the column count that holds the MOST problems, not
        // simply the most columns: two half-width graphs a page can be fewer than three full ones.
        if (cols > 1 && infos.length && infos.every((i) => i.fp && i.fp.byCapacity)) {
            const perAt = (c) => {
                const pr = probe(c, c > 1);
                return pr.fits ? c * Math.max(1, Math.floor((G - SAFETY_H_MM) / Math.max(1, pr.hMin))) : 0;
            };
            let best = cols, bestN = perAt(cols);
            for (let c = cols - 1; c >= 1; c--) { const k = perAt(c); if (k > bestN) { best = c; bestN = k; } }
            cols = best;
        }
        if (cls === 'word') reason = 'Word problems print in 1 column.';
        else if (cls === 'wide') reason = 'Wide pictures use the full width.';
    } else {
        // DN-13: an explicit N is honoured when the widest problem fits; otherwise it clamps to
        // the largest count that does, and the stored choice is left alone (DN-12).
        const want = Math.min(requested, hardCap);
        cols = 1;
        for (let c = want; c >= 1; c--) { if (probe(c, false).fits) { cols = c; break; } }
        if (cols !== requested) {
            clamped = true;
            reason = cls === 'word' ? 'Word problems print in 1 column.'
                : cls === 'wide' ? 'Wide pictures use the full width.'
                    : `${requested} columns do not fit these problems at size ${size}: max ${cols} column${cols === 1 ? '' : 's'}. Showing ${cols}.`;
        }
    }

    // PG-11: rows = min(target, floor((G - 1) / hMin)).
    const atCols = probe(cols, false);
    const hMin = atCols.hMin;
    if (!atCols.fits) {
        clamped = true;
        notes.push('A problem is wider than its cell even in 1 column.');
    }
    const hard = Math.max(1, Math.floor((G - SAFETY_H_MM) / Math.max(1, hMin)));
    const targetRows = cols === (target && target.cols) ? target.rows[size]
        : (target && target.rowsByCols && target.rowsByCols[cols]) || (EXPLICIT_TARGET_ROWS[cols] || cols);
    let rows = Math.min(targetRows, hard);
    // CL-2: a two-column grid takes one of the permitted shapes.
    if (cols === 2) rows = TWO_COL_ROWS.find((r) => r <= rows) || 1;
    // 12.1: a ceiling is never exceeded.
    const ceilRows = Math.max(1, Math.floor(ceiling / cols));
    if (rows > ceilRows) {
        rows = ceilRows;
        notes.push(`At most ${ceiling} problems on this page.`);
    }
    if (cols === 2 && rows > 1) rows = TWO_COL_ROWS.find((r) => r <= rows) || rows;
    // RUBRIC H13 (owner 2026-09-25): a section of problems of different heights (a place-value
    // mat among one-line frames) is not paged as if every problem were the tallest. Its rows are
    // sized to what they hold (groupByHeight + packByHeight), so the page holds as many rows as
    // the AVERAGE row of the measured sample fits (never above the ceiling). Explicit column
    // counts, word problems, wide rows and long procedures keep the grid.
    let packed = false;
    if (cls !== 'word' && cls !== 'wide' && cls !== 'long' && !gridOverride) {
        const hs = (items || []).map((it) => measuredH(it, cols));
        if (hs.length >= 2 && hs.every((h) => h > 0) && Math.max(...hs) > Math.min(...hs) * 1.6) {
            const sorted = hs.slice().sort((a, b) => b - a);
            const rowH = [];
            for (let i = 0; i < sorted.length; i += cols) rowH.push(sorted[i]);
            const avg = rowH.reduce((a, b) => a + b, 0) / rowH.length;
            let fit = Math.min(ceilRows, Math.floor((G - SAFETY_H_MM) / Math.max(1, avg)));
            if (cols === 2 && fit > 1) fit = TWO_COL_ROWS.find((r) => r <= fit) || fit;
            if (fit > rows) {
                rows = fit;
                packed = true;
                notes.push('Rows sized to the problems they hold.');
            }
        }
    }
    if (rows < targetRows && hard < targetRows && !packed) notes.push(`Tall problems: ${rows} row${rows === 1 ? '' : 's'} per page.`);
    if (cols === 1 && cls !== 'word' && cls !== 'wide' && rows < ONE_COL_ROWS.min) notes.push('Very tall problems: fewer than 3 rows fit.');
    if (hMin > G - SAFETY_H_MM) {
        clamped = true;
        notes.push('A problem is taller than the page at this size.');
    }

    // DENSE PACKING (2026-09-25 re-grade, C3: "cells ~70% empty"). With `section.dense`, a
    // section whose cells are much shorter or narrower than the default grid gives them is packed
    // tighter: more columns while every item still fits (measured, DN-10), and as many rows as
    // keep each cell at least DENSE_ROOM x its tallest content, up to the section's dense ceiling
    // (12.3's capacity tables; never above DN-1's 20 scored responses at L). The teacher's
    // explicit column count is never overridden (DN-12), and it only ever ADDS items.
    if (section.dense && !clamped && !packed && cls !== 'word' && cls !== 'wide' && hMin > 0) {
        // 12.1: a role that states its own ceiling (a Test: 20 / 16 / 12) is never packed past it,
        // however dense it asks to be (round-3 re-grade: a Test printed 20 facts at L under a
        // "At most 12 problems" note).
        const dCeil0 = bySize(section.dense === true ? DENSE_CEILING[cls] || DENSE_CEILING.standard : section.dense)[size] || ceiling;
        const dCeil = section.ceiling !== undefined && section.ceiling !== null ? Math.min(dCeil0, ceiling) : dCeil0;
        const colOpts = requested === 'auto'
            ? Array.from({ length: Math.max(0, Math.min(Number(section.denseMaxCols) > 0 ? Number(section.denseMaxCols) : DENSE_MAX_COLS, hardCap) - cols + 1) }, (_, k) => cols + k)
            : [cols];
        let best = { perPage: rows * cols, cols, rows };
        // The room each cell keeps over its content: the section's own (a Test), else the
        // LOOSEST any item's footprint asks for (`fp.denseRoom`, e.g. a count-by row, whose
        // measured height already holds its arcs and pads), else DENSE_ROOM. A page that mixes
        // such an item with ordinary ones therefore keeps the ordinary 1.2.
        const room = Number(section.denseRoom) > 1 ? Number(section.denseRoom)
            : Math.max(...infos.map((i) => (Number(i.fp.denseRoom) >= 1 ? Number(i.fp.denseRoom) : DENSE_ROOM)));
        for (const c of colOpts) {
            const pc = probe(c, c > cols);
            if (!pc.fits) continue;
            let rr = Math.max(1, Math.min(Math.floor((G - SAFETY_H_MM) / (pc.hMin * room)), Math.floor(dCeil / c)));
            if (c === 2) rr = TWO_COL_ROWS.find((x) => x <= rr) || rr;
            if (rr * c > best.perPage) best = { perPage: rr * c, cols: c, rows: rr, hMin: pc.hMin };
        }
        if (best.perPage > rows * cols) {
            cols = best.cols;
            rows = best.rows;
            // The note says what the page prints: a practice ceiling the dense tables go past
            // (one-symbol answers up to 16, 12.1) is not reported as the page's limit.
            if (rows * cols > ceiling) {
                for (let k = notes.length - 1; k >= 0; k--) if (/^At most \d+ problems/.test(notes[k])) notes.splice(k, 1);
            }
            notes.push(`Dense: ${cols} x ${rows}, cells sized to the problems.`);
        }
    }

    // PAGE FILL (owner 2026-09-25: "a lot of wasted space ... 5 problems could fit on one paper").
    // On the practice roles, where the rows chosen so far (the class target, the 12.1 ceiling)
    // would leave more than PAGE_FILL of the grid empty once every cell is capped at FILL_CAP x its
    // content, the page takes more rows: as many as keep each cell at least DENSE_ROOM x its
    // content, up to DN-1's 20 scored problems a page. This raises 12.1's per-class ceilings for
    // SHORT problems only (a problem is short when five or more of its rows fit the page, and it
// is not a column stack); the
    // teacher's explicit count still sets how many are printed (the page is then filled with
    // row gaps, grid.js). Word problems and long procedures keep their working space.
    let filled = false;
    // Column stacks keep 12.1's grid too: their cell height is the pupil's regrouping space.
    const stacked = infos.some((i) => i.fp.tracks && !i.fp.factLike);
    if (FILL_ROLES.has(role) && !clamped && !packed && !stacked && !gridOverride && hMin > 0 && cls !== 'word' && cls !== 'long') {
        const used = rows * Math.min(G / rows, hMin * FILL_CAP);
        const fit = Math.floor((G - SAFETY_H_MM) / (hMin * DENSE_ROOM));
        if (used < PAGE_FILL * G && fit >= 5 / cols) {
            let want = Math.min(fit, Math.floor(DN1_MAX / cols));
            if (cols === 2 && want > 1) want = TWO_COL_ROWS.find((r) => r <= want) || want;
            if (want > rows) {
                rows = want;
                filled = true;
                notes.push(`Page filled: ${rows * cols} short problems (at most ${DN1_MAX}, DN-1).`);
            }
        }
    }

    // Stacked, visual and word-problem cells fill the grid (PG-11) - but never past FILL_CAP x the
    // tallest measured cell (RUBRIC H13, owner 2026-09-25): a row far taller than what it holds
    // leaves an empty band of a third of every cell, even centred. When the ceiling (12.1) stops
    // more rows, the spare height stays under the grid instead of inside every cell.
    const even = G / rows;
    // Long procedures and word problems are exempt: their cell's spare height IS the pupil's
    // working space (PT 2.4's 93 x 114 long-division cell).
    const capped = hMin > 0 && cls !== 'long' && cls !== 'word';
    const cellH = r3(capped ? Math.min(even, hMin * FILL_CAP) : even);
    const fillsGrid = cellH >= even - 0.01;
    const perPage = rows * cols;
    const count = Math.max(0, Math.floor(Number(section.count) || 0));
    const pages = count ? Math.ceil(count / perPage) : 1;
    const widths = cellWidthMm(cols, W, look);

    // DN-11: on these roles the size alone sets the digits; columns never move them.
    const s = SIZES[size];
    const anyFact = infos.some((i) => i.fp.factLike);
    const anyStack = infos.some((i) => i.fp.tracks && !i.fp.factLike);
    const digitPt = anyFact && !anyStack ? Math.min(s.digitPt, FACT_LADDER[cols] || s.digitPt) : s.digitPt;
    const regroup = infos.some((i) => !!i.fp.regroup);
    const trackMm = anyStack ? tokenTrackMm(digitPt, size, look, regroup) : null;

    const note = [reason, ...notes].filter(Boolean).join(' ');
    return {
        role, cls, requested, cols, rows, perPage, pages, count,
        cellW: widths.nominal, innerW: widths.inner, cellH, hMin: r2(hMin), gridH: G, gridHCont: Gc,
        fill: fillsGrid && !packed, packed, filled, ceiling, clamped, reason, note, notes,
        digitPt, trackMm, size, look, availableWidthMm: W,
    };
}

/** DN-21: the dialog's "Fits:" line, from the layout alone. */
export function fitsLine(layout) {
    if (!layout) return '';
    const per = `${layout.perPage} per page`;
    const pg = `${layout.pages} page${layout.pages === 1 ? '' : 's'}`;
    return `Fits: ${layout.cols} column${layout.cols === 1 ? '' : 's'} x ${layout.rows} rows, ${per}, ${pg}. Digits ${layout.digitPt} pt.`
        + (layout.note ? ` ${layout.note}` : '');
}

export default {
    PT_MM, LIVE_W_MM, FOOTER_BLOCK_MM, CONT_HEADER_MM, HEADER_PARTS_MM, SAFETY_H_MM, SAFETY_W_MM,
    AUTO_FILL, AUTO_SLACK_MM, ROLE_COLUMNS, PRACTICE_CEILING, PRACTICE_TARGET, EXPLICIT_TARGET_ROWS,
    TWO_COL_ROWS, ONE_COL_ROWS, FULL_HEADER, STACK_SIDE_PAD_MM, STACK_HMIN_MM, VISUAL_MIN, FRAME_MM,
    paperOf, headerHeightMm, bodyHeightMm, instructionMm, gridHeightMm, cellBorderMm, cellWidthMm,
    stackMaxColumns, factRowsCapacity, stackCapacity, visualGridCapacity,
    itemInfo, sectionClass, resolveSectionLayout, fitsLine,
};

/* ============================================================ rows sized to what they hold */

/** The measured height (mm) of a host item at `cols`, or 0 when unknown. */
export const measuredH = (it, cols) => {
    // A legacy cell's measurement is not trusted to size a row to (its markup reflows); rows of
    // legacy cells keep the uniform grid.
    if (!it || it.legacy || it.template === 'legacy') return 0;
    const m = it.measured && it.measured[cols];
    // + 1 mm: a grid's 1.5 pt frame and 0.75 pt rules come out of its height (as compose.js hMinAt)
    return m && Number.isFinite(m.hMm) ? m.hMm + 1 : 0;
};

/**
 * RUBRIC H13 (owner 2026-09-25): a section that mixes tall and short problems (a place-value mat
 * beside "30 + 3 = __") orders its problems by height, tallest first, so a row is never sized
 * for a problem it does not hold. Only when the heights really differ (tallest over 1.6 x the
 * shortest); problems of one height keep their order (a stable sort).
 */
export function groupByHeight(items, cols) {
    const hs = items.map((it) => measuredH(it, cols));
    if (hs.some((h) => !h)) return items;
    const lo = Math.min(...hs), hi = Math.max(...hs);
    if (!(hi > lo * 1.6)) return items;
    // Tallest first, so every row's neighbours are the closest in height; equal heights (within
    // 2 mm) keep their order.
    const q = (h) => Math.round(h / 2);
    return items.map((it, i) => ({ it, i, b: -q(hs[i]) })).sort((a, b) => a.b - b.b || a.i - b.i).map((x) => x.it);
}

/**
 * Row heights for one grid: each row as tall as the tallest problem IT holds (fr weights), the
 * grid no taller than the rows' share of `rows x cellH` and never past FILL_CAP x its content.
 * Returns null when every row holds the same height (the grid is left as it was).
 *
 * @returns {{rowsTpl: string, heightMm: number} | null}
 */
export function rowShape(items, cols, rows, cellH) {
    if (!items.length || rows < 1) return null;
    const w = [];
    const mins = [];
    for (let r = 0; r < rows; r++) {
        const hs = items.slice(r * cols, (r + 1) * cols).map((it) => measuredH(it, cols));
        if (!hs.length || hs.some((h) => !h)) return null;
        w.push(Math.max(...hs));
        mins.push(Math.min(...hs));
    }
    const hi = Math.max(...w), lo = Math.min(...mins);
    const S = w.reduce((a, b) => a + b, 0);
    // Uniform rows keep the layout's grid, unless that grid stretches them past what they allow
    // (a short last page of a section whose first page held taller problems).
    if (hi - lo < 2 && rows * cellH <= S * Math.min(FILL_CAP, FILL_CAP * lo / hi) + 0.5) return null;
    // A row is stretched no further than its SHORTEST problem allows (FILL_CAP x keeps a centred
    // problem's bands under 30%), and never below its tallest (k >= 1).
    // Each row stretches by the page's share (k) but no further than its own shortest problem
    // allows, and never below its tallest (1).
    const k = Math.max(1, Math.min((rows * cellH) / S, FILL_CAP));
    const H = w.map((x, r) => x * Math.max(1, Math.min(k, (FILL_CAP * mins[r]) / x)));
    const total = H.reduce((a, b) => a + b, 0);
    return { rowsTpl: H.map((x) => `${Math.round(x * 10) / 10}fr`).join(' '), heightMm: Math.round(total * 100) / 100 };
}

/**
 * H13 pagination for a section whose problems differ in height (after `groupByHeight`): rows go
 * onto a page while the sum of their OWN heights fits the grid (never more rows than the ceiling
 * allows), so short problems are not paged as if each were the tallest. Each chunk carries the
 * grid height it prints at (`gridMm`, from `rowShape`). Returns null when the heights are uniform
 * (the ordinary `paginate` applies).
 */
export function packByHeight(items, cols, { gridFirstMm, gridContMm, maxRows, cellH, force = false }) {
    const hs = items.map((it) => measuredH(it, cols));
    if (!items.length || hs.some((h) => !h)) return null;
    const lo = Math.min(...hs), hi = Math.max(...hs);
    if (!force && !(hi > lo * 1.6)) return null;
    const rowsAll = [];
    for (let i = 0; i < items.length; i += cols) rowsAll.push(Math.max(...hs.slice(i, i + cols)));
    const chunks = [];
    let r = 0;
    while (r < rowsAll.length) {
        const G = (chunks.length ? gridContMm : gridFirstMm) - SAFETY_H_MM;
        let n = 0, sum = 0;
        while (r + n < rowsAll.length && n < maxRows && (n === 0 || sum + rowsAll[r + n] <= G)) { sum += rowsAll[r + n]; n++; }
        const from = r * cols;
        const count = Math.min(n * cols, items.length - from);
        const shape = rowShape(items.slice(from, from + count), cols, n, (G + SAFETY_H_MM) / n);
        chunks.push({ index: chunks.length, from, count, rows: n, rebalanced: false, gridMm: shape ? shape.heightMm : Math.min(G, n * cellH), rowsTpl: shape ? shape.rowsTpl : '' });
        r += n;
    }
    return chunks;
}

/** Row gaps: the most whitespace between two rows of a fixed-count sheet (mm). */
export const ROW_GAP_MAX = 24;

/**
 * The row gap that spends a fixed-count grid's spare height between its rows (RUBRIC H13 page
 * fill): 0 when the grid already fills its area (within 5%) or has one row.
 * @returns {{gap: number, heightMm: number}}
 */
export function rowGapFor(rows, gridMm, availMm) {
    const spare = availMm - gridMm - SAFETY_H_MM;
    if (rows < 2 || !(spare > 0.05 * availMm)) return { gap: 0, heightMm: gridMm };
    const gap = Math.round(Math.min(ROW_GAP_MAX, spare / (rows - 1)) * 100) / 100;
    return { gap, heightMm: Math.round((gridMm + gap * (rows - 1)) * 100) / 100 };
}
