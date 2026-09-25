// js/modules/sheet/index.js
// The public surface of the sheet kit.
//
// This is the ONLY import path the rest of the app should use. Importing it also registers
// every cell template exactly once (SCC-T2), because `cells/*.js` register on module load.
//
// The kit is pure (SCC-01): it writes nothing to `window`, imports no app module, touches no
// DOM and never calls `Math.random`. Anything it needs from a higher layer is injected.
//
// Nothing in the app imports this yet. The only consumer today is the dev gallery at
// `tests/dev-pages/ws-gallery.html`.

/* -------------------------------------------------------------------------- tokens */
export {
    INK, LESSON_ACCENT, STROKE, STROKE_WIDTHS, DASH, HATCH,
    PAPER, DEFAULT_PAPER, PAGE_CHROME,
    SIZES, SIZE_IDS, DEFAULT_SIZE,
    LOOKS, LOOK_IDS, DEFAULT_LOOK,
    FACT_TRACK_EM, FACT_TRACKS,
    MINUS, TIMES, DIV, opGlyph,
    EM_MM, trackMm, trackEmFor, trackFloorMm, SEPARATOR_EM,
    FACT_LADDER, FACT_AUTO_COLS, FACT_PROBE_COLS, FACT_PROBE_XL_PT, FACT_CELL_H_MM,
    factDigitPt, factCellHMm,
    TAB_LADDER, factTab, tabWidthFactor, MODEL_TAB_W_MM, DAY_TAB_H_MM, LABEL_STYLES,
    blankWidth, MIN_BLANK_MM, SLOT, SHAPES,
    PERMITTED_GRIDS, STRETCH_CAP, MIN_FREE_CELL_AREA,
    resolveCtx, metricsFor,
} from './tokens.js';

/* ---------------------------------------------------------------------------- cell */
export {
    esc, label, defaultLabelStyle, tabStepFor, tabSideMm,
    cell, cutLine, blank, line, box, circle, check, unknownBox,
    renderCellBox, gradeSlots,
} from './cell.js';

/* --------------------------------------------------------------------------- frame */
export {
    headerFields, strandTab, pageTitle, pageFooter, page, doc,
    instruction, BAND_LABELS, band, sayBand, steps, story, sideStrip, withStrip,
} from './frame.js';

/* ---------------------------------------------------------------------------- grid */
export {
    grid, blankRun, dayBand, rowsForSection, stretchCapFor, spanFor, widthWithStrip, isPermittedGrid,
} from './grid.js';

/* ------------------------------------------------------------------------ registry */
export {
    register, registerCell, getCell, hasCell, listCells, resolveTemplate,
    renderCell, cellAnswerKey, cellFootprint, cellInputs, cellGridItem, coverage, FALLBACK,
} from './registry.js';

/* ----------------------------------------------------------------------------- rng */
export { rng, int, pick, shuffle, deriveSeed } from './rng.js';

/* ------------------------------------------------------------------------ contract */
// The Skill Cell Contract: the provider registry, the controlled instruction library and the
// coverage judgement. Importing this barrel also loads `adapters.js`, which installs the six
// default adapters and registers the `legacy` cell template.
export {
    CONTRACT_MEMBERS, OPTIONAL_MEMBERS,
    INSTRUCTION_LIBRARY, JUDGE_LABELS, PRINT_VERBS, BANNED_INSTRUCTION_WORDS,
    instructionFor, instructionKeyOf, isLibraryInstruction, toScreenInstruction, lintInstruction,
    registerSkill, getProvider, hasProvider, listProviders,
    installDefaultAdapters, defaultAdapters, adaptersInstalled,
    QUALITY, coverageFor, summariseCoverage, worstOffenders,
} from './contract.js';

/* ------------------------------------------------------------------------ adapters */
export {
    installLegacyAdapters, installedLegacy, resetLegacyAdapters, legacyDeps,
    defaultRenderCell, defaultWorkedSteps, defaultWrongAnswer,
    defaultStrings, defaultFootprint, defaultOptions, ownOptionCount,
} from './adapters.js';

/* ------------------------------------------------- cell templates (register on load) */
export { stack, stackTabStep, stackAnswerSlot } from './cells/stack.js';
export { fact, factPadTop, factWidthMm, factFillOfColumn, factWriteMm, FACT_GEOMETRY, factCue } from './cells/fact.js';
export { equation, equationParts, equationColumns, frac, mixed } from './cells/equation.js';
// S1 touch dots: the engine only (design/SUPPORTS.md §S1). No skill or option uses it yet.
export {
    TOUCH_DOTS, TOUCH_DOTS_BOLD, TOUCH_DOT_BASELINE_EM, TOUCH_DOT_SIZES, TOUCH_DOT_DEFAULT, TOUCH_DOT_MIN,
    touchDots, touchDotCount, touchDotOrder, touchDotsFits, touchDotGeometry, touchDotsMarks, touchDotsSVG,
    touchDotsDigitHTML, touchDotNearest, touchTallySVG,
} from './touchdots.js';
// S2 the supports model: the allocator and the drawing (design/SUPPORTS.md §S2).
export {
    allocateSupports, supportsForItem, alternativesOf, supportCompat, fadeTo, fadeLevel, fadeRung,
    SUPPORT_IDS, TOUCH_IDS, CUE_IDS, TOUCH_MIN_PT, normCoverage, normMix,
} from './supports.js';
export {
    withSupports, supportsOf, touchMode, touchNumbers, touchColumns, touchNumberHTML, touchDigit, touchOpts,
    canDraw, needs as supportNeeds, panePayloadOf, supportFootprint, opKey as supportOpKey, COUNT_STEPS,
} from './support-draw.js';
// P9 place value + rounding: the `pv` template and the drawings the screen card shares with it.
export {
    DISK_SIZES, diskDiameter, zoneSide, zoneCapacity, diskMatSVG, numeralTracksHTML, roundingLineSVG, scaleLineSVG,
} from './cells/pv.js';

// The operations templates that are not a plain stack or fact (long division, area model,
// chart window, arrays, remainder, number line, fact family, cloze bank).
export { divisionSteps } from './cells/long-division.js';
import './cells/area-model.js';
import './cells/mult-chart.js';
import './cells/ops-counters.js';
import './cells/number-line.js';
import './cells/family.js';
export { factDigitTracks, factGridStyle, FACT_OP_TRACK_EM } from './cells/fact.js';
export const OPS_TEMPLATE_IDS = ['division', 'area-model', 'mult-chart', 'arrays', 'remainder', 'number-line', 'fact-family', 'cloze-bank'];


// K-2 picture cells: counters, ten frame, base-10 mat, number bond, chart window, number track,
// compare two groups, picture word problem. `k2Twin` draws a template's screen twin.
export { k2Twin, SHAPES as K2_SHAPES } from './cells/k2kit.js';
export { shareColumns } from './cells/counters.js';
export { base10Counts } from './cells/base10.js';
import './cells/tenframe.js';
import './cells/bond.js';
import './cells/chartwindow.js';
import './cells/seqstrip.js';
import './cells/compare.js';
import './cells/wordpic.js';
// Every whole-number word problem (owner ruling 2026-09-25): story, sign row, column boxes, answer + unit bank.
export { wordWorkPayload, wordWorkTwin, solveStory, parseTwoStep, storyLines, unitOf, cueRanges, columnRows, KEYWORD_BANK, WW_TEMPLATE } from './cells/word-work.js';
// Count-by rows, number patterns, the chart to complete, and × / ÷ on a number line (2026-09-25).
import './cells/count-row.js';
import './cells/mult-grid.js';
import './cells/hop-line.js';
export { tile as shapeTile, shapeAt, tileSize, TILE_SHAPES } from './cells/shapes.js';
export { gridSlots, shadeList } from './cells/mult-grid.js';
export { hopSlots, sentenceOf, ONE_TICK_MAX } from './cells/hop-line.js';
// O6 appearance (lane AP3): the fraction model drawn on paper and screen, and the tick-label rule
// every number line shares.
export { fracModelSVG, fracModelSize, fracModelSizedHTML, fracStackHTML, FRAC_MODELS, areaGrid } from './cells/frac-model.js';
export { tickLabelSet, TICK_LABEL_VALUES } from './cells/line-labels.js';
export { valueLineSVG, valueLineSizedHTML, valueLineWindow } from './cells/value-line.js';

// Function tables (function_table_easy / _hard): the In / Out table, its rule helpers and the
// screen checker every host uses (a 'make your own' table is right when every row follows the rule).
export {
    applyRule, undoRule, ruleText, ruleOn, ruleFits, parseRule, signOf, ftSlots, ftAnswerMatches, FT_GLYPH,
} from './cells/function-table.js';

// P10 time + money (design/research/time-money.md §13): the clock face, the elapsed-time line,
// coins and notes, money in columns. The drawing helpers are shared with the generator's twins.
import './cells/clock.js';
import './cells/timeline.js';
import './cells/coins.js';
import './cells/money-columns.js';
export {
    COIN_D, CURRENCIES, currencyOf, unitWord, fmtMoney, fmtTime, fmtDuration, toMin, fromMin, ampmOf,
} from './cells/tmkit.js';
export { amountText } from './cells/coins.js';
export const TM_TEMPLATE_IDS = ['clock', 'timeline', 'coins', 'money-columns'];

/** Which cell templates this build carries. `legacy` is registered by `adapters.js`. */
export const TEMPLATE_IDS = ['legacy', 'stack', 'fact', 'equation', 'pv',
    'counters', 'tenframe', 'base10', 'bond', 'chartwindow', 'seqstrip', 'compare', 'wordpic', 'word-work',
    ...OPS_TEMPLATE_IDS, ...TM_TEMPLATE_IDS, 'function-table'];

/* ------------------------------------------------- skill providers (register on load) */
// The real per-skill providers (strings, workedSteps, wrongAnswer, stories). Importing the
// barrel registers them once; a skill without one keeps the default adapters.
export {
    REGRADED_SKILLS, storiesFor, STORY_NOUNS, STORY_NAMES, STORY_TEMPLATES, nounFor,
    columnAdd, lineSteps, longDivision,
} from './providers/index.js';
