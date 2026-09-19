// js/modules/sheet/tokens.js
// The single source of the printed numbers for the sheet kit.
//
// Every value here is READ FROM `WORKSHEET_DESIGN_STANDARD.md`; the rule id that owns it is in
// the comment beside it. Nothing in this file is invented, and no other module in the kit may
// hard-code a millimetre, a point size, a stroke width or a grey.
//
// Pure module (SCC-01): no `window`, no `state`, no `Math.random`, no DOM, no imports.

/* ------------------------------------------------------------------ ink (section 4.1) */

// INK-1: exactly three paint values exist inside a sheet.
export const INK = Object.freeze({
    ink: '#000000',     // all text, all lines, solid counters, tabs
    paper: '#FFFFFF',   // page and cell background, always, including dark theme
    grey: '#949494',    // the only grey (INK-3): shaded parts, trace digits, faded scaffolds
});

/* ---------------------------------------------------- line weights (section 4.2, INK-10) */

// The closed set of allowed stroke widths, in pt. Names match the CSS custom properties in
// the approved kit stylesheet (`--ws-rule`, `--ws-heavy`, `--ws-hair`, `--ws-fine`).
export const STROKE = Object.freeze({
    rule: 2.25,    // header rule under the title; top rule of a band or section strip
    heavy: 1.5,    // outer frame; Daily cell borders; sum rule; fraction bars; story box
    hair: 0.75,    // I Can cell borders; anything bounding a writing place; fact-grid interiors
    fine: 0.5,     // inside a visual only: minute ticks, grid lines, hidden edges
    special: 1,    // INK-4 grey strokes and LS-1 dotted lines only
});
export const STROKE_WIDTHS = Object.freeze([0.5, 0.75, 1, 1.5, 2.25]);

// Line-style semantics (section 5). LS-1 dotted, LS-3 cut, LS-8 missing-digit box.
export const DASH = Object.freeze({
    dotted: Object.freeze({ pt: 1, pitchMm: 1.2, meaning: 'model: trace or copy' }),      // LS-1
    cut: Object.freeze({ pt: 0.75, onMm: 3, offMm: 2, meaning: 'cut here' }),             // LS-3
    unknown: Object.freeze({ pt: 0.75, onMm: 1.5, offMm: 1, meaning: 'unknown digit' }),  // LS-8
});

// INK-20..22: the photocopy-safe replacement for grey.
export const HATCH = Object.freeze({
    pt: 0.75, pitchMm: 1.6, degreesA: 45, degreesB: 135, minSideMm: 6,
    idA: 'ws-hatch-45', idB: 'ws-hatch-135',
});

/* -------------------------------------------------------- paper (section 2.1, PG-1..PG-3) */

// PG-1: live width is 186 mm on every paper; Letter keeps it by widening its side margins,
// so every width formula in the kit is paper-independent.
export const PAPER = Object.freeze({
    A4: Object.freeze({
        id: 'A4', label: 'A4',
        wMm: 210, hMm: 297,
        marginTopMm: 12, marginSideMm: 12, marginBottomMm: 14,
        liveWMm: 186, liveHMm: 271,
        bodyHMm: 236,          // PG-2, with the full 26 mm header
        gridHMm: { S: 228, M: 228, L: 227 },
    }),
    letter: Object.freeze({
        id: 'letter', label: 'US Letter',
        wMm: 215.9, hMm: 279.4,
        marginTopMm: 12, marginSideMm: 14.95, marginBottomMm: 14,
        liveWMm: 186, liveHMm: 253.4,
        bodyHMm: 218,
        gridHMm: { S: 210, M: 210, L: 209 },
    }),
});
export const DEFAULT_PAPER = 'A4';

export const PAGE_CHROME = Object.freeze({
    headerMaxMm: 26,        // PG-3
    headerContMm: 12,       // HD-20, pages 2+
    footerMm: 6,            // HD-30
    bodyFooterGapMm: 3,     // section 2.1
    titleWrapCostMm: 6,     // HD-14
});

/* ------------------------------------------------- size presets (section 3.2 and 6, PG-11) */

// Three numbers separated by slashes in the standard always mean S / M / L.
// pt values: section 3.2 size table. mm values: sections 6, 9 and 11 geometry.
export const SIZES = Object.freeze({
    S: Object.freeze({
        id: 'S',
        digitPt: 16, textPt: 11, zonePt: 9, letterPt: 8, titlePt: 14, tabTextPt: 9,
        fracPt: 12, clockPt: 24, footerPt: 7,
        writeMm: 6,        // Hw, the writing height
        answerMm: 8,       // answer row height in a stack
        instrMm: 8,        // instruction block (section 2.1)
        stripMm: 6,        // band strip height (BD-3)
        headsMm: 4,        // H T O head row
        regroupMm: 6,      // regroup row (VA-10)
        carryMm: 5,        // carry box height (VA-10)
        headroomMm: 8,     // subtraction headroom row (VA-20)
        tabMm: 4,          // CL-31 default; see TAB_LADDER
        checkMm: 5,        // check box (section 6)
        answerSquareMm: 16,
        stripPitchMm: 8,   // skip-count strip pitch (section 3.2)
    }),
    M: Object.freeze({
        id: 'M',
        digitPt: 22, textPt: 13, zonePt: 10, letterPt: 9, titlePt: 16, tabTextPt: 10,
        fracPt: 16, clockPt: 33, footerPt: 7,
        writeMm: 8, answerMm: 10, instrMm: 8, stripMm: 6,
        headsMm: 5, regroupMm: 7, carryMm: 6, headroomMm: 10,
        tabMm: 5, checkMm: 6, answerSquareMm: 20, stripPitchMm: 9,
    }),
    L: Object.freeze({
        id: 'L',
        digitPt: 28, textPt: 15, zonePt: 12, letterPt: 10, titlePt: 18, tabTextPt: 10,
        fracPt: 20, clockPt: 42, footerPt: 7,
        writeMm: 10, answerMm: 12, instrMm: 9, stripMm: 8,
        headsMm: 6, regroupMm: 8, carryMm: 7, headroomMm: 12,
        tabMm: 6, checkMm: 7, answerSquareMm: 24, stripPitchMm: 10.5,
    }),
});
export const SIZE_IDS = Object.freeze(['S', 'M', 'L']);
export const DEFAULT_SIZE = 'L';

/* --------------------------------------------------------- the two looks (section 1.2) */

// `label` is the DEFAULT ITEM-LABEL STYLE of the look (CL-10 / CL-30), which is what
// `defaultLabelStyle()` and the grid read. The look's human-readable name is `name`: it must not
// be called `label` as well, or one key silently overwrites the other in this literal.
export const LOOKS = Object.freeze({
    ican: Object.freeze({
        id: 'ican', name: 'I Can',
        cellBorderPt: STROKE.hair,   // 0.75 pt, shared
        trackEm: 0.72,               // TY-20
        rowGapMm: 0,                 // gap between operand rows
        label: 'letter',             // CL-10 quiet lowercase letter
        autoColsStacked: 2,
    }),
    daily: Object.freeze({
        id: 'daily', name: 'Daily',
        cellBorderPt: STROKE.heavy,  // 1.5 pt, shared
        trackEm: 0.95,               // TY-20
        rowGapMm: 2,
        label: 'tab',                // CL-30 black number tab
        autoColsStacked: 3,
    }),
});
export const LOOK_IDS = Object.freeze(['ican', 'daily']);
export const DEFAULT_LOOK = 'ican';

// TY-22: vertical facts always use 0.72 em tracks and T = 3 in both looks.
export const FACT_TRACK_EM = 0.72;
export const FACT_TRACKS = 3;

/* ------------------------------------------------------ operator glyphs (TY-6) */

export const MINUS = '−';   // U+2212 true minus, never a hyphen
export const TIMES = '×';   // U+00D7 multiplication, never the letter x
export const DIV = '÷';

const OPS = Object.freeze({ '+': '+', '-': MINUS, '−': MINUS, '*': TIMES, x: TIMES, '×': TIMES, '/': DIV, '÷': DIV });
export const opGlyph = (o) => OPS[o] || o;

/* ------------------------------------------- em and track tables (section 3.3, TY-20..23) */

// 1 em in mm at each digit size.
export const EM_MM = Object.freeze({ 16: 5.64, 18: 6.35, 20: 7.06, 22: 7.76, 24: 8.47, 28: 9.88 });

const round2 = (n) => Math.round(n * 100) / 100;

// TY-23: a stacked-arithmetic track is never narrower than 0.7 x Hw (4.2 / 5.6 / 7.0 mm).
export const trackFloorMm = (size) => round2(0.7 * SIZES[size].writeMm);

/**
 * Track width in mm for multi-digit stacked arithmetic (TY-20, TY-21, TY-23).
 * @param {number} digitPt  effective digit size
 * @param {'S'|'M'|'L'} size
 * @param {'ican'|'daily'} look
 * @param {boolean} regroup TY-21: any regroup scaffold forces 0.95 em in both looks
 * @param {boolean} [floor] TY-23: the 0.7 x Hw floor is for MULTI-DIGIT STACKED arithmetic only.
 *        It explicitly does not apply to fact sections, whose answer row is open and whose digit
 *        size follows the column ladder - pass false there.
 */
export function trackMm(digitPt, size, look, regroup = false, floor = true) {
    const em = EM_MM[digitPt] || (digitPt / 72) * 25.4;
    const factor = regroup ? 0.95 : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).trackEm;
    return round2(floor ? Math.max(em * factor, trackFloorMm(size)) : em * factor);
}
export const trackEmFor = (look, regroup = false) => (regroup ? 0.95 : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).trackEm);

// TY-24: a decimal point or thousands comma takes its own 0.3 em separator track.
export const SEPARATOR_EM = 0.3;

/* --------------------------------------------- the fact column ladder (section 3.4, TY-30) */

// The chosen column count drives the digit size; S / M / L still fixes everything else.
export const FACT_LADDER = Object.freeze({ 1: 28, 2: 28, 3: 28, 4: 28, 5: 28, 6: 24, 7: 20, 8: 18, 9: 16, 10: 16 });

// TY-30: Auto columns per preset for fact rows (the fact probe's Auto is always 5).
export const FACT_AUTO_COLS = Object.freeze({ S: 10, M: 6, L: 5 });
export const FACT_PROBE_COLS = 5;
export const FACT_PROBE_XL_PT = 32;   // TY-33

// VA-70: fact cell height by column count, S / M / L, in mm.
export const FACT_CELL_H_MM = Object.freeze({
    1: Object.freeze({ S: 37, M: 37, L: 38 }),
    2: Object.freeze({ S: 37, M: 37, L: 38 }),
    3: Object.freeze({ S: 37, M: 37, L: 38 }),
    4: Object.freeze({ S: 37, M: 37, L: 38 }),
    5: Object.freeze({ S: 37, M: 37, L: 38 }),
    6: Object.freeze({ S: 34, M: 34, L: 36 }),
    7: Object.freeze({ S: 29, M: 31, L: 33 }),
    8: Object.freeze({ S: 26, M: 28, L: 30 }),
    9: Object.freeze({ S: 24, M: 26, L: 28 }),
    10: Object.freeze({ S: 24, M: 26, L: 28 }),
});
export const factDigitPt = (cols) => FACT_LADDER[cols] || 28;
export const factCellHMm = (cols, size) => (FACT_CELL_H_MM[cols] || FACT_CELL_H_MM[5])[size] || FACT_CELL_H_MM[5].L;

/* --------------------------------------------------------- label geometry (CL-31, CL-32) */

// CL-31: tab side and numeral size follow the EFFECTIVE digit size of the section, not the
// preset. The kit's stylesheet carries these as the `.ws-tab6 / .ws-tab5 / .ws-tab4` classes.
export const TAB_LADDER = Object.freeze({
    6: Object.freeze({ sideMm: 6, numeralPt: 11 }),
    5: Object.freeze({ sideMm: 5, numeralPt: 10 }),
    4: Object.freeze({ sideMm: 4, numeralPt: 8 }),
});
/** The tab step (6 / 5 / 4) for an effective digit size. */
export const factTab = (digitPt) => (digitPt >= 26 ? 6 : digitPt >= 20 ? 5 : 4);
// CL-32: tab width multiplier by label digit count.
export const tabWidthFactor = (digits) => (digits >= 3 ? 1.5 : digits === 2 ? 1.4 : 1);
export const MODEL_TAB_W_MM = Object.freeze({ S: 13, M: 15, L: 17 });   // CL-34
export const DAY_TAB_H_MM = Object.freeze({ S: 5, M: 6, L: 7 });        // BD-5
export const LABEL_STYLES = Object.freeze(['letter', 'tab', 'model', 'none']);

/* ------------------------------------------------------ blank widths (section 6.1, SL-6) */

/**
 * B(n, size) = max(14, ceil(n x 0.75 x Hw + 2 + s)) mm.
 * @param {number} n           digits in the longest expected answer in the section
 * @param {'S'|'M'|'L'} size
 * @param {number} separators  1 mm for each comma or decimal point in that answer
 */
export function blankWidth(n, size = DEFAULT_SIZE, separators = 0) {
    const hw = (SIZES[size] || SIZES[DEFAULT_SIZE]).writeMm;
    return Math.max(14, Math.ceil(n * 0.75 * hw + 2 + separators));
}
export const MIN_BLANK_MM = 14;

// Section 6 slot geometry that is not a simple width function.
export const SLOT = Object.freeze({
    circlePadMm: 2,        // circle diameter = Hw + 2 mm
    digitBoxMinMm: 4.4,    // digit box: track - 1 mm, minimum 4.4
    digitBoxInsetMm: 1,
    timeBoxMm: Object.freeze({ S: 16, M: 18, L: 20 }),
    timeGapMm: 5,
    unitGapMm: 2,
    unitOpenLineMm: Object.freeze({ S: 40, M: 46, L: 52 }),
    choiceGapMm: 8,
    cornerRadiusMm: 3,     // LS: rounded = something to read or think with
    smallCornerRadiusMm: 1,
});

// Section 6 shape keys, printed as `data-ws-shape`.
export const SHAPES = Object.freeze([
    'line', 'box', 'box-unknown', 'circle', 'fraction', 'mixed', 'time',
    'unit', 'unit-open', 'check', 'choice', 'open', 'none',
]);

/* --------------------------------------------------------------- density (section 13) */

// CL-2, the named `cols x rows` shapes. The rule also permits two FAMILIES that are not a fixed
// pair, so they cannot live in this list and are tested by `isPermittedGrid()` instead:
// full-width rows for wide visuals (1 column, 3 to 7 rows) and fact grids (5 to 10 columns).
export const PERMITTED_GRIDS = Object.freeze(['2x2', '2x3', '2x4', '2x5', '2x8', '3x3', '4x4', '4x5']);
export const FULL_WIDTH_ROWS = Object.freeze({ cols: 1, minRows: 3, maxRows: 7 });   // CL-2
export const FACT_GRID_COLS = Object.freeze({ min: 5, max: 10 });                    // CL-2, TY-30
export const STRETCH_CAP = Object.freeze({ fact: 1.3, probe: 1.3, counting: 1.3, equation: 2.0 });        // PG-11
export const MIN_FREE_CELL_AREA = 0.40;   // CL: at least 40% of a cell stays empty

/* ------------------------------------------------------------------- ctx resolution */

/**
 * Resolve a partial ctx into the full CellCtx of SKILL_CELL_CONTRACT.md section 2.2.
 * Every template may assume the result is complete.
 */
export function resolveCtx(ctx = {}) {
    const size = SIZES[ctx.size] ? ctx.size : DEFAULT_SIZE;
    const look = LOOKS[ctx.look] ? ctx.look : DEFAULT_LOOK;
    const mode = ctx.mode === 'screen' ? 'screen' : 'print';
    const out = {
        mode,
        look,
        size,
        scaffoldLevel: [0, 1, 2, 3].includes(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1,
        state: ['blank', 'traced', 'answered', 'wrong'].includes(ctx.state) ? ctx.state : 'blank',
        label: ctx.label === undefined ? null : ctx.label,
        mono: ctx.mono !== false,
        photocopySafe: ctx.photocopySafe === true,
        paper: PAPER[ctx.paper] ? ctx.paper : DEFAULT_PAPER,
        metrics: ctx.metrics || metricsFor(size, look, ctx),
    };
    // Optional extensions are copied through untouched so a template may read them.
    for (const k of ['wrong', 'step', 'compact', 'template', 'feedback', 'static', 'idPrefix', 'options']) {
        if (ctx[k] !== undefined) out[k] = ctx[k];
    }
    return out;
}

/**
 * The resolved metric bag a template reads instead of choosing type sizes itself (SCC-T3).
 * `factColumns` applies the fact ladder; `regroup` applies TY-21.
 */
export function metricsFor(size = DEFAULT_SIZE, look = DEFAULT_LOOK, { factColumns = 0, regroup = false } = {}) {
    const s = SIZES[size] || SIZES[DEFAULT_SIZE];
    const digitPt = factColumns ? factDigitPt(factColumns) : s.digitPt;
    return Object.freeze({
        digitPt,
        writeMm: s.writeMm,
        // TY-22: a fact always uses 0.72 em tracks; TY-23: the track floor does not apply to it.
        trackMm: factColumns
            ? round2((EM_MM[digitPt] || (digitPt / 72) * 25.4) * FACT_TRACK_EM)
            : trackMm(digitPt, size, look, regroup),
        trackEm: factColumns ? FACT_TRACK_EM : trackEmFor(look, regroup),
        textPt: s.textPt,
        zonePt: s.zonePt,
        titlePt: s.titlePt,
        letterPt: s.letterPt,
        tabStep: factTab(digitPt),
        tabMm: TAB_LADDER[factTab(digitPt)].sideMm,
        fracPt: s.fracPt,
    });
}

export default {
    INK, STROKE, STROKE_WIDTHS, DASH, HATCH, PAPER, DEFAULT_PAPER, PAGE_CHROME,
    SIZES, SIZE_IDS, DEFAULT_SIZE, LOOKS, LOOK_IDS, DEFAULT_LOOK,
    FACT_TRACK_EM, FACT_TRACKS, MINUS, TIMES, DIV, opGlyph,
    EM_MM, trackMm, trackEmFor, trackFloorMm, SEPARATOR_EM,
    FACT_LADDER, FACT_AUTO_COLS, FACT_PROBE_COLS, FACT_PROBE_XL_PT, FACT_CELL_H_MM, factDigitPt, factCellHMm,
    TAB_LADDER, factTab, tabWidthFactor, MODEL_TAB_W_MM, DAY_TAB_H_MM, LABEL_STYLES,
    blankWidth, MIN_BLANK_MM, SLOT, SHAPES,
    PERMITTED_GRIDS, FULL_WIDTH_ROWS, FACT_GRID_COLS, STRETCH_CAP, MIN_FREE_CELL_AREA,
    resolveCtx, metricsFor,
};
