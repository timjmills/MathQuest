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
    INK, STROKE, STROKE_WIDTHS, DASH, HATCH,
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
    DISK_SIZES, diskDiameter, zoneSide, zoneCapacity, diskMatSVG, numeralTracksHTML, roundingLineSVG,
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

/** Which cell templates this build carries. `legacy` is registered by `adapters.js`. */
export const TEMPLATE_IDS = ['legacy', 'stack', 'fact', 'equation', 'pv',
    'counters', 'tenframe', 'base10', 'bond', 'chartwindow', 'seqstrip', 'compare', 'wordpic',
    ...OPS_TEMPLATE_IDS];

/* ------------------------------------------------- skill providers (register on load) */
// The real per-skill providers (strings, workedSteps, wrongAnswer, stories). Importing the
// barrel registers them once; a skill without one keeps the default adapters.
export {
    REGRADED_SKILLS, storiesFor, STORY_NOUNS, STORY_NAMES, STORY_TEMPLATES, nounFor,
    columnAdd, lineSteps, longDivision,
} from './providers/index.js';
