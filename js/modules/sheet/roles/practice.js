// js/modules/sheet/roles/practice.js
// The shared composer of the two "you do" roles: the Independent page (PAGE_TYPES 2.4) and More
// Practice A to J (2.5). `independent.js` and `more-practice.js` are thin wrappers over it.
//
// A role composer turns configured skills and ALREADY-GENERATED items into a PagePlan (plain
// data plus per-item draw functions). `renderPageAndKey(plan)` then renders the pupil page and
// its facsimile key from that ONE plan, so cell N is at the same x / y on both (AK-1, PT-KEY-1).
// The composer never generates: generation needs the app (`generateQuestionFor`), and this
// module is pure. The host (`js/modules/print-sheet.js`) generates, measures legacy cells, and
// hands the items in.
//
// Rules this file implements
//   PT-FRM-1..9   frame: paper, header, Score /N, strand tab, "I Can" title, footer, sheet ids
//   PT-LOOK-1     both roles default to the I Can look; the dialog may choose Daily
//   PT-LBL-1..7   quiet letters (I Can) or black tabs (Daily); run-on and restart rules
//   PT-IND-1..4, PT-MPR-1..3   the two roles
//   HD-5 / HD-6   "Level N", never "Grade"; grade and CCSS only in the teacher footer (HD-30)
//   HD-10 / HD-13 title grammar and the fixed "Mixed practice" title
//   HD-20         the 12 mm continuation header (drawn by SHEET_ENGINE_CSS, below)
//   BD-10..BD-14  one library instruction per section, repeated on every page (PG-22)
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import {
    esc, instructionFor, INSTRUCTION_LIBRARY, getProvider, defaultStrings,
    SIZES, DEFAULT_SIZE, LOOKS, DEFAULT_LOOK,
} from '../index.js';
import {
    resolveSectionLayout, paperOf, bodyHeightMm, instructionMm, fitsLine, LIVE_W_MM, itemInfo, itemCap, groupByHeight, rowShape, packByHeight, rowGapFor,
} from '../layout.js';
import { paginate, labelStarts, scoreDenominator, placeSections } from '../paginate.js';
import { renderSource, renderAnswerKey } from './answer-key.js';
import { deriveSeed } from '../rng.js';
import { ANCHOR_CSS, anchorPlanItem, sideItems, pupilCount, blockPlan, blockPages } from '../anchors.js';

/* ======================================================================= engine stylesheet */

/**
 * The few rules the engine needs that the kit stylesheet does not carry yet. They are ADDITIVE
 * and scoped to the sheet roots, and they travel INSIDE the plan (an `html` part on the first
 * page of every sheet, identical in both states), so a plan renders correctly wherever it is
 * dropped - the print dialog's preview, a standalone document, the test harness.
 * They belong in `css/sheet-kit.css`; that file is owned by the ink wave, so they live here
 * until they are moved.
 */
export const SHEET_ENGINE_CSS = `
/* HD-14: a title that does not fit one line wraps to two and takes 6 mm from the body. */
:is(.ws-page,.ws-sheet) .ws-title{white-space:normal;height:auto;min-height:8mm;line-height:7mm;text-align:center}
/* HD-20: pages 2+ carry a 12 mm header - Name line, a one-line outlined tab 8 mm tall, the rule. */
.ws-page:has(.mq-cont) .ws-rowA{height:9mm}
.ws-page:has(.mq-cont) .ws-rowA .ws-field{height:9mm}
.ws-page:has(.mq-cont) .ws-rowA .ws-field i{height:8mm}
.ws-page:has(.mq-cont) .ws-tabbox{width:auto;height:8mm;flex-direction:row;align-items:center;align-self:flex-end;padding:0 3mm;font-size:9pt;line-height:1;white-space:nowrap}
.ws-page:has(.mq-cont) .ws-tabbox span{font-weight:700}
.ws-page:has(.mq-cont) .ws-tabbox span:last-child{font-weight:400}
.ws-page:has(.mq-cont) .ws-tabbox span+span::before{content:"\\00a0\\00b7\\00a0";font-weight:400}
/* BD-14: an underlined word inside a library instruction. */
:is(.ws-page,.ws-sheet) .ws-instrline u{text-decoration-thickness:.75pt;text-underline-offset:1.2mm}
/* SCC-A5: a legacy cell. The legacy markup was written for a full-width column, so it spans the
   cell; its content starts below the label box (CL-40); the legacy shell's own border, padding
   and clipping are dropped because the kit cell is the one box (CL-1, CL-7), and nothing may be
   clipped silently. The key's answer stamp costs no layout, so the problem sits where it sits on
   the pupil page (AK-1). */
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy{align-items:stretch;padding-top:calc(var(--ws-tab,6mm) + 1mm)}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy>.ws-legacy{width:100%;min-width:0}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .worksheet-problem{border:0!important;border-radius:0!important;padding:0!important;margin:0!important;overflow:visible!important;background:transparent!important;box-shadow:none!important}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .problem-content,:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .problem-content>div{overflow:visible}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .stack{margin-left:auto;margin-right:auto}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .ws-legacy-answer{position:absolute;left:3mm;right:3mm;bottom:1.5mm;display:block;text-align:center;font-size:var(--ws-zone);font-weight:700;line-height:1.2}
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy .ws-legacy-answer .ws-zone{font-size:inherit}
/* ---- P7.2b roles (roles/compose.js). Scoped to the sheet roots; additive. ---- */
/* INK-3: a traced value stays grey in print. css/print-worksheet.css forces every legacy
   .worksheet-problem descendant to black under @media print; the trace is the one exception. */
:is(.ws-page,.ws-sheet) [data-ws-ink="trace"],:is(.ws-page,.ws-sheet) .worksheet-problem .ws-trace{color:#949494!important}
/* TY-2: Andika has 400 and 700 only. Legacy markup asks for 600 in places (visual labels, the
   "Answer:" caption); inside a sheet it takes the 700 the face really has, never a synthetic bold. */
:is(.ws-page,.ws-sheet) .ws-cell.mq-legacy :is([style*="font-weight:600"],[style*="font-weight: 600"],.visual-label){font-weight:700!important}
/* The engine's style block (and page 2's continuation marker) sit before the first band, so the
   kit's :first-child band rule is restated for them (BD-3: the header rule closes the header). */
.ws-body>:is(style,.mq-cont):first-child+:is(.ws-band,.mq-row),.ws-body>style:first-child+.mq-cont+:is(.ws-band,.mq-row){margin-top:1.5mm}
.ws-body>:is(style,.mq-cont):first-child+.ws-band,.ws-body>style:first-child+.mq-cont+.ws-band{border-top-width:var(--ws-heavy)}
:is(.ws-page,.ws-sheet) .ws-band>.ws-grid.fixed{flex:none}
/* a value written into a line slot sits on the rule (a key, shown work) */
:is(.ws-page,.ws-sheet) .ws-line[data-ws-ink]{display:inline-flex;align-items:flex-end;justify-content:center;font-weight:700;line-height:1.1;padding-bottom:.6mm;font-size:var(--ws-text)}
:is(.ws-page,.ws-sheet) .ws-line.ws-trace[data-ws-ink]{font-weight:400}
/* PT-OPN-2: parts side by side in one band row (Model | Steps, quadrants, a probe and its strip) */
:is(.ws-page,.ws-sheet) .mq-row{flex:none;display:grid;column-gap:0;margin-top:-1.5pt;min-height:0}
:is(.ws-page,.ws-sheet) .mq-rowcol{min-width:0;min-height:0;display:flex;flex-direction:column}
:is(.ws-page,.ws-sheet) .mq-rowcol>.ws-band{flex:1 1 auto;margin-top:0;min-height:0}
:is(.ws-page,.ws-sheet) .mq-rowcol+.mq-rowcol>.ws-band{border-left:0}
:is(.ws-page,.ws-sheet) .mq-rowcol>.ws-band>.ws-grid{flex:1 1 auto}
:is(.ws-page,.ws-sheet) .mq-row.mq-proberow{margin-top:0;column-gap:4mm}
:is(.ws-page,.ws-sheet) .mq-col{display:flex;flex-direction:column;min-height:0}
:is(.ws-page,.ws-sheet) .mq-quadrow+.mq-quadrow{margin-top:3mm}
:is(.ws-page,.ws-sheet) .mq-quadrow .ws-band{margin-top:0}
:is(.ws-page,.ws-sheet) .mq-quadscore{margin-left:auto;font-weight:700;white-space:nowrap}
/* BD-4: the Steps list. Two text columns on the Guided page (PT-GDP-2). */
:is(.ws-page,.ws-sheet) .mq-stepsband{padding:1mm 3mm 3mm 4mm}
:is(.ws-page,.ws-sheet) .ws-steps.mq-steps2{display:block;columns:2;column-gap:8mm}
:is(.ws-page,.ws-sheet) .ws-steps.mq-steps2 li{break-inside:avoid;margin-bottom:2.2mm}
:is(.ws-page,.ws-sheet) .mq-stepszone{padding:1.5mm 3mm 0 4mm;overflow:hidden}
:is(.ws-page,.ws-sheet) .mq-steptext{width:100%;height:100%;display:flex;gap:2.5mm;align-items:flex-start;padding-top:2mm;font-size:var(--ws-text);line-height:1.3;text-align:left}
:is(.ws-page,.ws-sheet) .mq-steptext>em{flex:none;font-style:normal;width:7mm;height:7mm;border:var(--ws-hair) solid var(--ws-ink);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--ws-zone);font-weight:700}
:is(.ws-page,.ws-sheet) .ws-cell.mq-stepcell{align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-steptop{width:100%;height:calc(2 * (1.3em) + 4mm);flex:none}
/* check-box lines and one-line sentence frames (section 6, P-TH-3) */
:is(.ws-page,.ws-sheet) .mq-checkline{display:inline-flex;align-items:center;gap:2.5mm;white-space:nowrap;font-size:var(--ws-text);line-height:1}
:is(.ws-page,.ws-sheet) .mq-checkline .ws-check{margin:0;vertical-align:0;flex:none}
:is(.ws-page,.ws-sheet) .mq-frame{display:flex;align-items:flex-end;gap:1.5mm;white-space:nowrap;font-size:var(--ws-text);line-height:1.1}
/* Error analysis and True or False?: the finished work beside the judgement (04-E mock-up) */
:is(.ws-page,.ws-sheet) .ws-cell.mq-thinkcell{align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-judge{width:100%;flex:1 1 auto;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:3mm;row-gap:3mm;align-items:end}
:is(.ws-page,.ws-sheet) .mq-judge-work{min-width:0;align-self:start;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-judge-row{display:flex;flex-direction:column;align-items:flex-start;gap:4mm;padding-bottom:1mm}
:is(.ws-page,.ws-sheet) .mq-fixline{display:flex;flex-direction:column;align-items:flex-start;gap:1mm}
:is(.ws-page,.ws-sheet) .mq-fixline .ws-line{margin-left:9mm}
:is(.ws-page,.ws-sheet) .mq-judge.mq-tf{grid-template-columns:minmax(0,1fr);align-content:space-between;row-gap:5mm}
:is(.ws-page,.ws-sheet) .mq-tf>.mq-judge-row{flex-direction:row;gap:12mm;padding:0 0 0 4mm}
:is(.ws-page,.ws-sheet) .mq-tf>.mq-frame{justify-self:start;padding:0 0 1mm 4mm}
/* A thinking cell draws its shown answer in the flow (it is measured with it), never over the picture. */
:is(.ws-page,.ws-sheet) .ws-cell :is(.mq-judge-work,.mq-abbox,.mq-wpcell) .ws-legacy-answer.mq-shown{position:static;margin-top:2mm;left:auto;right:auto;bottom:auto}
:is(.ws-page,.ws-sheet) .mq-shownline{display:flex;align-items:flex-end;gap:2mm;margin-top:2mm;font-size:var(--ws-text);line-height:1.1}
:is(.ws-page,.ws-sheet) .mq-shownline b{font-weight:700;border-bottom:var(--ws-hair) solid var(--ws-ink);min-width:14mm;text-align:center}
/* Reason It, "Which is correct" (09-B mock-up): two finished answers A and B, then the frames */
:is(.ws-page,.ws-sheet) .mq-ab{width:100%;display:grid;grid-template-columns:1fr 1fr minmax(52mm,auto);column-gap:5mm;align-items:start;padding-top:2mm}
:is(.ws-page,.ws-sheet) .mq-abbox{position:relative;min-width:0;border:var(--ws-hair) solid var(--ws-ink);padding:10mm 2mm 3mm 2mm;display:flex;flex-direction:column;align-items:center;justify-content:center}
:is(.ws-page,.ws-sheet) .mq-abtag{position:absolute;left:0;top:0;width:8mm;height:8mm;border-right:var(--ws-hair) solid var(--ws-ink);border-bottom:var(--ws-hair) solid var(--ws-ink);display:flex;align-items:center;justify-content:center;font-size:var(--ws-text);font-weight:700;line-height:1}
:is(.ws-page,.ws-sheet) .mq-abresp{align-self:stretch;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;gap:6mm;padding:1mm 0 1mm}
:is(.ws-page,.ws-sheet) .mq-abchoice{display:flex;gap:10mm;padding-left:2mm}
:is(.ws-page,.ws-sheet) .ws-choice{display:inline-flex;align-items:center;justify-content:center;min-width:12mm;height:12mm;padding:0 1.5mm;font-size:var(--ws-digit);font-weight:700;line-height:1}
/* Stretch (09-D mock-up): the prompt box, the results table, the closing frames */
:is(.ws-page,.ws-sheet) .ws-cell.mq-stretchcell{align-items:stretch;padding:4mm 5mm 4mm 9mm}
:is(.ws-page,.ws-sheet) .mq-stretch{width:100%;display:flex;flex-direction:column;gap:5mm}
:is(.ws-page,.ws-sheet) .mq-prompt{padding:2.5mm 5mm}
:is(.ws-page,.ws-sheet) .mq-stretch-main{display:flex;align-items:flex-end;gap:7mm}
:is(.ws-page,.ws-sheet) .mq-table{flex:none;border-collapse:collapse;border:var(--ws-heavy) solid var(--ws-ink)}
:is(.ws-page,.ws-sheet) .mq-table th,:is(.ws-page,.ws-sheet) .mq-table td{border:var(--ws-hair) solid var(--ws-ink);padding:0 2mm;text-align:center;vertical-align:middle}
:is(.ws-page,.ws-sheet) .mq-table th{height:10mm;font-size:var(--ws-zone);font-weight:700;line-height:1.1}
:is(.ws-page,.ws-sheet) .mq-table td{height:calc(var(--ws-hw) + 3mm);min-width:28mm;font-size:var(--ws-text);line-height:1}
:is(.ws-page,.ws-sheet) .mq-table.mq-cols3 td{width:30mm}
:is(.ws-page,.ws-sheet) .mq-table.mq-cols2 td:first-child{width:60mm}
:is(.ws-page,.ws-sheet) .mq-table td b{font-weight:700}
:is(.ws-page,.ws-sheet) .mq-closing{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:6mm;padding-bottom:1mm}
/* Word problems v2 (07-D mock-up): story box with the answer row, then the equation frame */
:is(.ws-page,.ws-sheet) .ws-cell.mq-wpcellbox{align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-wp{width:100%;flex:1 1 auto;display:flex;flex-direction:column;padding-left:6mm}
:is(.ws-page,.ws-sheet) .mq-wpstory>div{white-space:normal}
:is(.ws-page,.ws-sheet) .mq-wpcell{border:var(--ws-heavy) solid var(--ws-ink);border-radius:3mm;padding:3mm 4mm;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-wpanswer{display:flex;align-items:flex-end;justify-content:flex-end;gap:4mm;margin-top:2mm;padding-right:4mm}
:is(.ws-page,.ws-sheet) .mq-ansslot{display:inline-flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-ansslot small{font-size:var(--ws-zone);line-height:1.2;margin-top:.8mm}
:is(.ws-page,.ws-sheet) .mq-wpwork{flex:1 1 auto;display:flex;align-items:flex-start;padding:8mm 0 0 4mm;font-size:var(--ws-text)}
:is(.ws-page,.ws-sheet) .mq-wpwork .ws-circle{margin:0 1mm}
/* Fact probe: horizontal facts and the skip-count strip (PT-FPR-3) */
:is(.ws-page,.ws-sheet) .mq-hfact{width:100%;display:flex;align-items:flex-end;gap:2mm;padding-top:2mm;font-size:var(--ws-digit);line-height:1}
:is(.ws-page,.ws-sheet) .mq-hfact .ws-line{font-size:var(--ws-digit)}
:is(.ws-page,.ws-sheet) .mq-skipstrip{border:var(--ws-heavy) solid var(--ws-ink);border-radius:3mm;display:flex;flex-direction:column;justify-content:space-around;align-items:center;font-size:var(--ws-text);font-weight:700;line-height:1}
/* ---- 2026-09-25 re-grade fixes (additive) ---- */
/* Guided Steps band: row-major, so the steps read 1 2 / 3 4 left to right (never 1 3 / 2). */
:is(.ws-page,.ws-sheet) .ws-steps.mq-steps-rows{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;row-gap:2.2mm;columns:auto}
:is(.ws-page,.ws-sheet) .ws-steps.mq-steps-rows.mq-steps-one{grid-template-columns:1fr}
:is(.ws-page,.ws-sheet) .ws-steps.mq-steps-rows li{margin-bottom:0}
/* Error analysis: the judgement beside the work, in the top of the cell (no dead band), and one
   square write box the pupil writes the fix in. */
:is(.ws-page,.ws-sheet) .mq-judge.mq-judge2{align-items:start;column-gap:6mm}
:is(.ws-page,.ws-sheet) .mq-judge2>.mq-judge-row{align-self:start;gap:4mm;padding:1mm 1mm 1mm 0}
:is(.ws-page,.ws-sheet) .mq-fixrow{display:flex;flex-direction:column;align-items:flex-start;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-fixslot{margin-left:9mm}
:is(.ws-page,.ws-sheet) .mq-judge.mq-judge2.mq-judge-stack{grid-template-columns:minmax(0,1fr);row-gap:2mm}
:is(.ws-page,.ws-sheet) .mq-judge-stack>.mq-judge-row{flex-direction:row;align-items:flex-start;gap:10mm;padding-left:4mm}
:is(.ws-page,.ws-sheet) .mq-judge-stack .mq-fixrow{flex-direction:row;align-items:flex-start;gap:4mm}
:is(.ws-page,.ws-sheet) .mq-judge-stack .mq-fixslot{margin-left:0}
:is(.ws-page,.ws-sheet) .mq-fixslot .ws-box,:is(.ws-page,.ws-sheet) .mq-wp2 .mq-wpanswer .ws-box{height:calc(var(--ws-hw) + 4mm);min-height:calc(var(--ws-hw) + 4mm);display:inline-flex;align-items:center;justify-content:center;font-size:var(--ws-digit);font-weight:700;line-height:1}
/* Word problems v2: story, work space, answer row - square corners on paper. */
:is(.ws-page,.ws-sheet) .mq-wp.mq-wp2{padding-left:6mm;gap:3mm}
:is(.ws-page,.ws-sheet) .mq-wp2 .mq-wpstory{border-radius:0}
:is(.ws-page,.ws-sheet) .mq-wpspace{position:relative;flex:1 1 auto;min-height:30mm;border:var(--ws-hair) solid var(--ws-ink);display:flex;align-items:center;justify-content:center}
:is(.ws-page,.ws-sheet) .mq-wpspace>small{position:absolute;left:2mm;top:1mm;font-size:var(--ws-zone);line-height:1.2}
:is(.ws-page,.ws-sheet) .mq-wpsentence{font-size:calc(var(--ws-text) * 1.35);font-weight:700;line-height:1.15;text-align:center;padding:0 2mm}
:is(.ws-page,.ws-sheet) .mq-wp2 .mq-wpanswer{margin-top:0;padding-right:0;justify-content:flex-end;gap:6mm}
/* INK-3: everything inside a traced slot is trace grey, the legacy key's inline-black <b> and a
   drawn model's currentColor strokes included (print-worksheet.css forces legacy text black). */
:is(.ws-page,.ws-sheet) [data-ws-ink="trace"] *{color:#949494!important}
/* Guided fade: a partially traced value keeps its geometry; the untraced part is not printed. */
:is(.ws-page,.ws-sheet) .mq-untraced{visibility:hidden}
/* ---- critic round 2 (2026-09-25) ---- */
/* AK-1 facsimile: a key answer is Andika 700 and keeps the sheet's open 4 (cv04, TY-4) however deep
   it sits (a legacy key style or an inline font shorthand reset it, and the 4 closed). cv01 is NOT
   set: TY-4 (owner ruling 2026-09-19) rejects it, so the bold face keeps its own flagged 1. */
:is(.ws-page,.ws-sheet) :is(b,strong,th,.ws-tab,[data-ws-ink="solid"],[data-ws-ink="solid"] *,.ws-legacy-answer,.ws-legacy-answer *){font-feature-settings:"cv04" 1}
.ws-key [data-ws-ink="solid"]:not(.mq-pupil):not(:is(.mq-pupil,.mq-judge-work,.mq-abbox,.mq-tf) *){font-weight:700}
/* Guided cells: the count cue of a level-2 cell (H3), grey, beside the fact. */
:is(.ws-page,.ws-sheet) .mq-cuewrap{display:flex;align-items:flex-start;justify-content:center;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-cue{display:flex;flex-direction:column;gap:1mm;padding-top:1mm}
:is(.ws-page,.ws-sheet) .mq-cue svg{display:block}
/* R3: a K story's label word stands in one fixed width, so the number box is in the same place in every cell. */
:is(.ws-page,.ws-sheet) .mq-wp2.mq-wpk .mq-klabel{min-width:30mm;justify-content:flex-start}
:is(.ws-page,.ws-sheet) .mq-cue.mq-cue-b{padding-top:calc(var(--fd,var(--ws-digit)) * 1.15 + .5mm)}
:is(.ws-page,.ws-sheet) .mq-cuecol{width:100%;display:flex;flex-direction:column;align-items:center;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-thinkcue{font-size:var(--ws-text);line-height:1.2;white-space:nowrap;border:1pt solid #949494;border-radius:2mm;padding:1mm 3mm}
:is(.ws-page,.ws-sheet) .ws-cell.mq-modelcell{padding-top:calc(var(--ws-tab,6mm) + 1.5mm)}
/* Error analysis: what the pupil wrote is shown in "pupil writing" (trace grey, tagged), so it is
   never confused with the printed numbers (critic round 2, C1). */
:is(.ws-page,.ws-sheet) .mq-pupiltag{position:absolute;left:8mm;top:1mm;font-size:var(--ws-zone);line-height:1.2;font-style:normal;white-space:nowrap}
/* the "<name> wrote:" tag sits on the letter's line; the work starts under it */
:is(.ws-page,.ws-sheet) .ws-cell.mq-eacell{padding-top:calc(var(--ws-zone) * 1.2 + 2.5mm)}
:is(.ws-page,.ws-sheet) .mq-pupil,:is(.ws-page,.ws-sheet) .mq-pupil *{color:#949494!important}
:is(.ws-page,.ws-sheet) .mq-klabel{display:inline-flex;align-items:center;min-height:calc(var(--ws-hw) + 4mm);font-size:var(--ws-text)}
:is(.ws-page,.ws-sheet) .mq-pupilwork{font-size:var(--ws-digit);line-height:1.1;white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-fixes{display:flex;gap:3mm;flex-wrap:wrap}
:is(.ws-page,.ws-sheet) .mq-redraw{display:flex;flex-direction:column;align-items:flex-start;gap:1mm}
:is(.ws-page,.ws-sheet) .mq-redraw>small{font-size:var(--ws-zone);line-height:1.2}
:is(.ws-page,.ws-sheet) .mq-fixchoice{display:flex;flex-direction:column;gap:2mm}
/* VA-2: the operator keeps to the left of its own track, clear of a two-digit bottom number. */
:is(.ws-page,.ws-sheet) .ws-fact>.op{justify-content:flex-start}
/* Fact rows across form (PT-FRW-7) and the division sentence frame under a picture. */
:is(.ws-page,.ws-sheet) .mq-hfact.mq-across{justify-content:flex-start;padding-top:1mm}
:is(.ws-page,.ws-sheet) .mq-hfact.mq-across>span{white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-sframe{display:flex;align-items:flex-end;justify-content:center;gap:1.5mm;margin-top:1mm;font-size:var(--ws-text);line-height:1.1;white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-sframe .ws-line{height:7mm}
/* Word problems: the skill's named model in the work space, a picture row for K. */
/* The answer column sits BESIDE the work space, at its foot, so a story with its model fits three
   (or two) to a page instead of one: story across the top, work space left, number and label right. */
:is(.ws-page,.ws-sheet) .mq-wp.mq-wp2{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 1fr;column-gap:4mm;row-gap:2mm}
:is(.ws-page,.ws-sheet) .mq-wp2>.mq-wpstory{grid-column:1 / -1;padding-top:2mm;padding-bottom:2mm}
:is(.ws-page,.ws-sheet) .mq-wp2>.mq-wpspace{grid-column:1;grid-row:2;min-height:20mm}
:is(.ws-page,.ws-sheet) .mq-wp2>.mq-wpanswer{grid-column:2;grid-row:2;flex-direction:column;align-items:flex-end;justify-content:flex-end;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-wp2.mq-wpk>.mq-wpanswer{flex-direction:row;align-items:flex-start;gap:3mm}
:is(.ws-page,.ws-sheet) .mq-wp2.mq-wpk>.mq-wpanswer .mq-ansslot small:empty{display:none}
:is(.ws-page,.ws-sheet) .mq-wp2.mq-wpunder{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto}
:is(.ws-page,.ws-sheet) .mq-wp2.mq-wpunder>.mq-wpanswer{grid-column:1;grid-row:3;flex-direction:row;align-items:flex-end}
:is(.ws-page,.ws-sheet) .mq-wpspace.mq-wpmodel{align-items:stretch;justify-content:center;padding:6mm 2mm 2mm}
:is(.ws-page,.ws-sheet) .mq-wpspace.mq-wpmodel>div{width:100%;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-wppics{display:flex;flex-wrap:wrap;gap:3mm;justify-content:center;align-items:center;padding:2mm}
/* ---- Error analysis, critic round 3 (2026-09-25): the fix copies the item's own answer shape ---- */
:is(.ws-page,.ws-sheet) .mq-fixpat{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-fixglue{font-size:var(--ws-text);font-weight:400;line-height:1;white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-fixchoice.mq-fixletters{flex-direction:row;gap:5mm}
:is(.ws-page,.ws-sheet) .mq-fixglue.mq-fixsym{font-size:var(--ws-digit);font-weight:700}
:is(.ws-page,.ws-sheet) .mq-fixes>.mq-ansslot small{white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-fixtext .ws-line{font-size:var(--ws-text);font-weight:700;max-width:100%}
:is(.ws-page,.ws-sheet) .mq-eacell .mq-fixslot small{font-size:max(var(--ws-zone),11pt)}
:is(.ws-page,.ws-sheet) .mq-fixcols{gap:0}
:is(.ws-page,.ws-sheet) .mq-eatask{font-size:var(--ws-text);line-height:1.2;margin:0 0 1mm;align-self:flex-start}
:is(.ws-page,.ws-sheet) .mq-fixcols>.ws-box+.ws-box{margin-left:-.75pt}
/* the flow judgement: beside the work when --mq-jw fits, under it when not */
:is(.ws-page,.ws-sheet) .mq-judge.mq-judge3{display:flex;flex-wrap:wrap;align-items:flex-start;align-content:flex-start;justify-content:center;column-gap:6mm;row-gap:2mm;width:100%}
:is(.ws-page,.ws-sheet) .mq-judge3>.mq-judge-work{flex:0 1 auto;min-width:0;max-width:100%;align-self:flex-start}
:is(.ws-page,.ws-sheet) .mq-judge3>.mq-judge-row{flex:1 1 var(--mq-jw,44mm);min-width:min(var(--mq-jw,44mm),100%);max-width:100%;display:flex;flex-direction:row;flex-wrap:wrap;align-items:flex-start;column-gap:6mm;row-gap:2mm;padding:1mm 0 0 2mm}
:is(.ws-page,.ws-sheet) .mq-judge3 .mq-fixrow{display:flex;flex-direction:row;flex-wrap:wrap;align-items:flex-start;column-gap:4mm;row-gap:2mm}
:is(.ws-page,.ws-sheet) .mq-judge3 .mq-fixslot{margin-left:0}
:is(.ws-page,.ws-sheet) .mq-judge3>.mq-redraw{flex:1 1 100%}
:is(.ws-page,.ws-sheet) .mq-judge-drawn .mq-fixrow{display:contents}
:is(.ws-page,.ws-sheet) .mq-judge-drawn .mq-fixzone{flex:0 0 100%}
/* the key's correction is black Andika 700, even inside the pupil's grey work (a fix box per fact) */
:is(.ws-page,.ws-sheet) .mq-judge-work :is([data-ws-slot^="x"],[data-ws-slot^="fix"]):is([data-ws-ink="solid"],[data-ws-ink="solid"] *),:is(.ws-page,.ws-sheet) .mq-judge-work :is([data-ws-slot^="x"],[data-ws-slot^="fix"]) :is([data-ws-ink="solid"],[data-ws-ink="solid"] *){color:#000!important;font-weight:700}
${ANCHOR_CSS}
`.trim();

export const styleBlock = () => `<style data-mq-sheet-engine>${SHEET_ENGINE_CSS}</style>`;
/** The marker the continuation-header rules key on. Identical on the pupil page and the key. */
export const CONT_MARK = '<i class="mq-cont" hidden></i>';

/* ============================================================================ skill words */

/**
 * HD-5: the strand, at most 12 characters, per category. A sheet whose skills span strands
 * prints the two-line tab (Level and page id only).
 */
export const STRAND_BY_CATEGORY = Object.freeze({
    addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplying', division: 'Division',
    integers: 'Integers', number_ops_mixed: 'Operations',
    counting: 'Counting', comparing: 'Comparing', composing: 'Number Sense', counting_mixed: 'Counting',
    fractions: 'Fractions', fraction_operations: 'Fractions', decimals: 'Decimals', conversions: 'Conversions',
    frac_dec_mixed: 'Fractions',
    shapes_early: 'Geometry', area_perimeter: 'Geometry', angles_lines: 'Geometry', shapes_classify: 'Geometry',
    coordinates: 'Geometry', measurement: 'Measurement', geo_mixed: 'Geometry',
    graphs: 'Data', data_analysis: 'Data', probability: 'Data', data_mixed: 'Data',
    patterns: 'Patterns', algebra: 'Algebra', order_of_operations: 'Algebra', placevalue: 'Place Value',
    number_sense: 'Number Sense', number_theory: 'Factors', algebra_mixed: 'Algebra', vocabulary: 'Vocabulary',
});

const GRADE_ORDER = ['K', '1', '2', '3', '4', '5', '6'];

/** HD-5 line 1: "Level N". Never "Grade" (SC-5). A range when the skills span levels. */
export function levelLine(grades) {
    const known = [...new Set((grades || []).map((g) => String(g).toUpperCase()).filter((g) => GRADE_ORDER.includes(g)))]
        .sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));
    if (!known.length) return 'All levels';
    return known.length === 1 ? `Level ${known[0]}` : `Level ${known[0]}-${known[known.length - 1]}`;
}

/** HD-30: the grade words for the teacher footer. */
export function gradeWords(grades) {
    const known = [...new Set((grades || []).map((g) => String(g).toUpperCase()).filter((g) => GRADE_ORDER.includes(g)))]
        .sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));
    if (!known.length) return 'Grade mixed';
    return known.length === 1 ? `Grade ${known[0]}` : `Grade ${known[0]}-${known[known.length - 1]}`;
}

/** Sentence case for a title derived from a label: "I Can" + the label, lower-cased Title Case words. */
function titleFromLabel(label) {
    const clean = String(label || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
        .replace(/\s*\((?:visual|no visuals?|mc|drag|interactive)\)\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const s = clean.replace(/\b[A-Z][a-z]+\b/g, (w) => w.toLowerCase());
    return `I Can ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
}

/**
 * The verb a category's skills are practised with, and the words of a label that only restate
 * it ("Addition", "Adding" ...). An I Can line reads "I Can <verb> <what is left>".
 */
const CATEGORY_VERB = Object.freeze({
    addition: ['add', /\b(?:addition|adding|add|sums?)\b/g],
    subtraction: ['subtract', /\b(?:subtraction|subtracting|subtract|differences?)\b/g],
    multiplication: ['multiply', /\b(?:multiplication|multiplying|multiply|times)\b/g],
    division: ['divide', /\b(?:division|dividing|divide)\b/g],
    counting: ['count', /\b(?:counting|count)\b/g],
    comparing: ['compare', /\b(?:comparing|compare|comparison)\b/g],
    composing: ['make', /\b(?:composing|compose|making|make)\b/g],
    fractions: ['work with fractions', /\b(?:fractions?)\b/g],
    decimals: ['work with decimals', /\b(?:decimals?)\b/g],
});
/** Leading words that are already a verb: the label then reads "I Can <label>". */
const LEAD_VERB_RE = /^(?:add|subtract|multiply|divide|count|compare|order|round|estimate|read|write|tell|measure|find|make|build|show|solve|name|use|draw|skip|identify|sort|pick|fill|complete|match|share|split|fix|check|place)\b/;

/**
 * "I Can work on addition facts (within 20)" -> "I Can add facts within 20";
 * "pick the missing addends" -> "I Can pick the missing addends"; "multiplication chart" ->
 * "I Can multiply with a chart". '' when the category has no verb (the caller keeps its line).
 */
export function iCanFromCategory(skill = {}, rest = '') {
    const cv = CATEGORY_VERB[skill.categoryId];
    let r = String(rest || skill.label || '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (LEAD_VERB_RE.test(r)) return `I Can ${r}`;
    if (!cv) return '';
    const [verb, restate] = cv;
    r = r.replace(restate, ' ').replace(/\s+/g, ' ').replace(/^(?:basic|simple)\s+/, '').trim();
    if (!r) return `I Can ${verb} numbers`;
    if (/^(?:chart|table|grid)\b/.test(r)) return `I Can ${verb} with a ${r}`;
    if (/^(?:word problems?|stories)\b/.test(r)) {
        const ing = { add: 'adding', subtract: 'subtracting', multiply: 'multiplying', divide: 'dividing' }[verb];
        return ing ? `I Can solve ${ing} ${r}` : `I Can solve ${r}`;
    }
    if (/^(?:with|on|in|using|to|within|up to|by)\b/.test(r)) return `I Can ${verb} ${r}`;
    if (/^(?:number line|pictures?|objects?|counters|models?|arrays?|groups?|columns?)\b/.test(r)) return `I Can ${verb} with ${r}`;
    return `I Can ${verb} ${r}`;
}

/**
 * The strings a skill contributes, from its provider (or the default adapter), with the host's
 * own values first. `iCan` falls back to the label, never to a generic sheet name (PT-FRM-6).
 */
export function skillWords(skill = {}) {
    let str = {};
    try {
        const p = getProvider(skill.categoryId || '', skill.skillId || '');
        const raw = typeof p.strings === 'function'
            ? p.strings({ categoryId: skill.categoryId, skillId: skill.skillId, label: skill.label, answerType: skill.answerType, printFormat: skill.printFormat, opts: skill.opts })
            : p.strings;
        str = raw || {};
    } catch (e) { str = {}; }
    if (!str.iCan) {
        try { str = Object.assign(defaultStrings({ categoryId: skill.categoryId, skillId: skill.skillId, label: skill.label }), str); } catch (e) { /* keep */ }
    }
    let iCan = skill.iCan || str.iCan || '';
    if (!iCan || /work on this skill$/i.test(iCan)) iCan = titleFromLabel(skill.label || String(skill.skillId || '').replace(/_/g, ' '));
    // "I Can work on <label>" is the default adapter's placeholder, not an I Can statement
    // (2026-09-25 re-grade, C4). Until the skill's provider writes its own `strings.iCan`, the
    // title is built from the category's verb: "I Can add facts within 20".
    if (/^I Can work on\b/i.test(iCan)) iCan = iCanFromCategory(skill, iCan.replace(/^I Can work on\s*/i, '')) || iCan;
    const instructionKey = skill.instructionKey || str.instructionKey || 'default-write';
    return { iCan, instructionKey, strand: skill.strand || STRAND_BY_CATEGORY[skill.categoryId] || '' };
}

/**
 * SCC-P17: the values of an instruction's placeholders ("Circle groups of {n}.") for a section,
 * from the first item whose provider has `strings.instructionVars(q)`; {} when none has.
 */
export function varsOfItems(items) {
    // The section prints ONE instruction, so its {n} must hold for every item: a set whose items
    // disagree ("Count by 10" beside "Count by 5") has no single value, and {} is returned.
    const all = (items || []).map((it) => varsOfItems1(it));
    const known = all.filter((v) => v && Object.keys(v).length);
    if (!known.length) return {};
    const k0 = JSON.stringify(known[0]);
    return known.length === all.length && known.every((v) => JSON.stringify(v) === k0) ? known[0] : {};
}

/** A key with a placeholder, when the section has no single value for it: the nearest plain key. */
export const PLACEHOLDER_FALLBACK = Object.freeze({
    'skip-count': 'missing', 'ring-groups': 'ring-groups-each', 'ring-remainder': 'ring-remainder-each',
});

/** The printed instruction of a section: its key with the items' {n}, or the plain fallback. */
export function resolveInstruction(key, items, vars) {
    const v = vars || varsOfItems(items);
    key = pluralKey(key, items);
    try { return { key, text: instructionFor(key, v) }; } catch (e) { /* placeholder left */ }
    const fb = pluralKey(PLACEHOLDER_FALLBACK[key], items);
    if (fb) { try { return { key: fb, text: instructionFor(fb, {}) }; } catch (e) { /* fall through */ } }
    return { key: 'default-write', text: INSTRUCTION_LIBRARY['default-write'] };
}

/** How many blanks an item asks for: the parts of its answer ("35, 56" is two). */
function blanksOf(it) {
    const q = (it && it.q) || {};
    if (Array.isArray(q.ans)) return q.ans.length;
    const a = typeof q.ans === 'string' ? q.ans : '';
    return /,\s/.test(a) ? a.split(/,\s*/).length : 1;
}

/**
 * Critic round 2: "Write the missing number." over windows and tracks with two or three blanks.
 * A section in which any item has more than one blank takes the plural string.
 */
function pluralKey(key, items) {
    if (key !== 'missing') return key;
    return (items || []).some((it) => blanksOf(it) > 1) ? 'missing-all' : key;
}

/** One item's placeholder values, from its provider's `strings.instructionVars(q)`; {} when none. */
function varsOfItems1(it) {
    const q = (it && it.q) || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const str = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel, q }) : p.strings;
        if (str && typeof str.instructionVars === 'function') {
            const v = str.instructionVars(q);
            if (v && typeof v === 'object') return v;
        }
    } catch (e) { /* none */ }
    return {};
}

/** BD-13: one section, one instruction; a mixed-operation section takes mixed-sign or mixed-ops. */
export function sectionInstructionKey(keys) {
    const set = [...new Set((keys || []).filter(Boolean))];
    if (!set.length) return 'default-write';
    if (set.length === 1) return set[0];
    const ops = new Set(['add', 'subtract', 'multiply', 'divide']);
    if (set.every((k) => ops.has(k))) return set.every((k) => k === 'add' || k === 'subtract') ? 'mixed-sign' : 'mixed-ops';
    return 'default-solve';
}

/** A library instruction as printed: `_word_` is an underlined word (library convention). */
export function instructionHtml(key, text) {
    const body = esc(text).replace(/_([^_]+)_/g, '<u>$1</u>');
    return `<div class="ws-instrline" data-ws-instruction="${esc(key)}">${body}</div>`;
}

/** HD-14: how many lines the title takes at the preset size (a width estimate, 0.55 em a character). */
export function estimateTitleLines(text, size = DEFAULT_SIZE, widthMm = LIVE_W_MM) {
    if (!text) return 0;
    const pt = (SIZES[size] || SIZES[DEFAULT_SIZE]).titlePt;
    const wMm = String(text).length * 0.55 * pt * (25.4 / 72);
    return wMm <= widthMm ? 1 : 2;
}

/* ============================================================================ the composer */

const LETTERS = 'ABCDEFGHIJ';

/**
 * Normalise what a host passes. Items may be `{q}` questions, or the richer host form:
 *   {q, section, letter, skill, fclass, measured, footprint, render, key, template, answerType,
 *    visual, legacy}
 */
function normaliseInput(input = {}) {
    const ctxIn = input.ctx || {};
    const size = SIZES[ctxIn.size] ? ctxIn.size : DEFAULT_SIZE;
    const look = LOOKS[ctxIn.look] ? ctxIn.look : DEFAULT_LOOK;      // PT-LOOK-1: 'auto' -> I Can
    const paper = paperOf(ctxIn.paper).id;
    const items = (input.items || []).map((it) => (it && (it.q || it.footprint || it.render) ? it : { q: it }));
    const sections = Array.isArray(input.sections) && input.sections.length ? input.sections : [{ columns: 'auto' }];
    return { size, look, paper, items, sections, ctxIn };
}

/** Which skills a set of items came from, as the metadata rows the frame needs. */
export function skillRows(input, items) {
    const rows = [];
    const seen = new Set();
    const add = (s) => {
        if (!s) return;
        const key = `${s.categoryId}:${s.skillId}`;
        if (seen.has(key)) return;
        seen.add(key);
        rows.push(s);
    };
    for (const s of input.skills || []) add(s);
    if (!rows.length) {
        for (const it of items) {
            const q = it.q || {};
            if (q.skillId) add({ categoryId: q.categoryId || '', skillId: q.skillId, label: q.skillLabel || '', answerType: q.answerType, printFormat: q.printFormat });
        }
    }
    return rows;
}

/** The frame words for one sheet: title, tab lines, footer left. */
export function frameWords(role, input, skills, { tabId }) {
    const header = input.header || {};
    const words = skills.map(skillWords);
    const titles = [...new Set(words.map((w) => w.iCan).filter(Boolean))];
    const derived = titles.length === 1 ? titles[0] : titles.length ? 'Mixed practice' : 'I Can practise';
    const title = typeof header.title === 'string' && header.title.trim() ? header.title.trim() : derived;
    const strands = [...new Set(words.map((w) => w.strand).filter(Boolean))];
    const level = levelLine(skills.map((s) => s.grade));
    const tabLines = Array.isArray(header.tab) && header.tab.length ? header.tab.map(String)
        : strands.length === 1 ? [level, strands[0], tabId] : [level, tabId];
    const ids = [...new Set(skills.map((s) => s.skillId).filter(Boolean))];
    const idText = ids.length > 3 ? `${ids.slice(0, 3).join(', ')} +${ids.length - 3}` : ids.join(', ');
    const codes = [...new Set(skills.flatMap((s) => String(s.ccss || '').split(/[,;]\s*/)).map((c) => c.trim()).filter(Boolean))];
    const ccss = codes.length > 9 ? `${codes.slice(0, 9).join(', ')} +${codes.length - 9}` : codes.join(', ');
    const left = [idText, gradeWords(skills.map((s) => s.grade)), ccss].filter(Boolean).join(' · ');
    return { title, tabLines, left, words };
}

/**
 * The header each page of one sheet carries. Page 1: the full header (HD-1); pages 2+: the
 * 12 mm continuation header (HD-20) - Name and the one-line tab, no Date, no Score, no title.
 * Checked-off parts stay off (HD-1, PT-FRM-3).
 */
export function sheetHeaders(input, words, score) {
    const h = input.header || {};
    const on = (k) => h[k] !== false;
    const tab = h.tab === false ? false : words.tabLines;
    const first = {
        name: on('name'), date: on('date'),
        score: on('score') && score > 0 ? score : false,   // HD-2: no scored cell, no Score
        tab,
        title: h.title === false ? '' : words.title,
        titleNote: h.titleNote || '',
    };
    const contTab = tab ? (tab.length > 1 ? [tab.slice(0, -1).join(' · '), tab[tab.length - 1]] : tab.slice()) : false;
    const cont = { name: on('name'), date: false, score: false, title: '', tab: contTab };
    return { first, cont };
}

/** The class tokens a cell carries so `decorate()` can write its data-ws-* hooks (17.1). */
export function hookClasses(it, level) {
    const q = it.q || {};
    const template = it.template || (q.cell && q.cell.template) || 'legacy';
    const at = String(it.answerType || q.answerType || '').replace(/[^a-z0-9-]/gi, '') || 'none';
    return [`mqt--${template}`, `mqa--${at}`, `mql--${level}`, it.legacy || template === 'legacy' ? 'mq-legacy' : ''].filter(Boolean).join(' ');
}

/**
 * One plan item from one host item (answer-key.js PlanItem). A host draw function receives the
 * section's final column count as its second argument: the legacy template picks its size class
 * from it and the fact ladder its digit size, and the key calls the SAME function (AK-1).
 */
function planItem(it, level, cols) {
    // S6: a worked twin (side by side) is an anchor - unscored, unlabelled, Model tab.
    if (it.anchor) return anchorPlanItem(it, cols);
    const q = it.q || null;
    return {
        q,
        render: typeof it.render === 'function' ? (c) => it.render(c, { cols }) : undefined,
        key: it.key,
        skill: it.skill || (q && q.skillId ? `${q.categoryId || ''}:${q.skillId}` : ''),
        visual: it.visual !== undefined ? !!it.visual : !!(q && q.visual),
        drawsAnswer: it.drawsAnswer,
        answerWords: it.answerWords,
        cls: [it.cellCls || '', hookClasses(it, level)].filter(Boolean).join(' '),
        style: it.cellStyle || '',
    };
}

/**
 * Lay out every section of ONE sheet and place it on pages.
 * @returns {{layouts, chunksBySection, pages}}
 */
function layoutSheet(role, sectionsIn, itemsBySection, { size, look, paper, headerFirst, availableWidthMm, anchors }) {
    const instr = instructionMm(size);
    const body = bodyHeightMm(paper, headerFirst);
    const layouts = sectionsIn.map((sec, si) => {
        const L = resolveSectionLayout(
            { role, columns: sec.columns, count: itemsBySection[si].length, floor: sec.floor, gridH: sec.gridH, dense: sec.dense, maxCols: sec.maxCols },
            itemsBySection[si], paper, availableWidthMm, { size, look, header: headerFirst },
        );
        // S6 SECTIONS: anchor band + 3-4 problems per block; the band's height comes off the page
        // (anchors.js blockPlan) and a block is never split.
        const aMm = anchorBandOf(anchors, si);
        // SIDE BY SIDE in ONE column (a problem too wide for two): each twin sits above its
        // problem, so a page holds whole pairs - an even number of rows (PG-21: never an example
        // at the foot of a page with its problem overleaf).
        if (anchors && anchors.mode === 'side' && L.cols === 1 && itemsBySection[si].some((it) => it.anchor)) {
            const rows = Math.max(2, L.rows - (L.rows % 2));
            return Object.assign({}, L, { rows, perPage: rows, pairs: true });
        }
        if (!aMm) return L;
        const bp = blockPlan({ cols: L.cols, hMin: L.hMin, cellH: L.cellH, bodyMm: sec.gridH ? sec.gridH + instr : body, instrMm: instr, anchorMm: aMm });
        return Object.assign({}, L, { cellH: bp.cellH, perPage: bp.perPage, rows: bp.blocksPerPage * bp.blockRows, blocks: bp, anchorMm: aMm });
    });
    const chunksBySection = layouts.map((L, si) => (L.blocks
        ? blockPages(itemsBySection[si].length, L.blocks, L.cols, L.anchorMm)
        : L.pairs
            // Paginate PAIRS, then count them back as rows: a page break never falls inside one.
            ? paginate(Math.ceil(itemsBySection[si].length / 2), { cols: 1, rows: L.rows / 2 })
                .map((c) => Object.assign({}, c, { from: c.from * 2, count: Math.min(c.count * 2, itemsBySection[si].length - c.from * 2), rows: c.rows * 2 }))
            : (!anchors && packByHeight(itemsBySection[si], L.cols, {
                gridFirstMm: L.gridH, gridContMm: L.gridHCont, maxRows: Math.max(1, Math.floor(L.ceiling / L.cols)), cellH: L.cellH, force: !!L.packed,
            })) || paginate(itemsBySection[si].length, L)));
    const pages = placeSections(
        layouts.map((L, si) => ({ layout: L, chunks: chunksBySection[si], instrMm: instr })),
        { bodyFirstMm: body, bodyContMm: bodyHeightMm(paper, headerFirst, { cont: true }) },
    );
    return { layouts, chunksBySection, pages };
}

/** The anchor band height (mm) of section `si` in SECTIONS mode, else 0. */
const anchorBandOf = (anchors, si) => (anchors && anchors.mode === 'sections' && anchors.bandMm && Number(anchors.bandMm[si]) > 0
    && anchors.bySection && (anchors.bySection[si] || []).length ? Number(anchors.bandMm[si]) : 0);

/**
 * S6 SIDE BY SIDE: each pupil item that carries a worked twin (`it.twin`, anchors.js anchorItem
 * 'side') is preceded by it, and the section is two columns: rows of [twin | problem].
 */
export function withAnchors(norm, sheetItems, anchors) {
    if (!anchors || anchors.mode !== 'side') return { sections: norm.sections, items: sheetItems };
    const items = sheetItems.map((list) => sideItems(list, list.map((it) => it.twin || null)));
    const sections = norm.sections.map((sec, si) => (items[si].some((it) => it.anchor) ? Object.assign({}, sec, { columns: 2 }) : sec));
    return { sections, items };
}

/** PT-MPR-2: every More Practice letter is its own seed, so Practice C reprints identically. */
export const letterSeed = (seed, letter) =>
    (seed === undefined || seed === null || seed === '' ? undefined : deriveSeed(seed, 'more-practice', String(letter).toUpperCase()));

/** The frame words and the layout of ONE sheet - everything that decides where a cell sits. */
function sheetLayout(role, input, norm, sheetItems, tabId) {
    const { size, look, paper } = norm;
    const skills = skillRows(input, sheetItems.flat());
    const words = frameWords(role, input, skills, { tabId });
    const titleLines = (input.header && input.header.titleLines) || estimateTitleLines(words.title, size);
    const headerForLayout = {
        tab: input.header && input.header.tab === false ? false : words.tabLines,
        title: input.header && input.header.title === false ? '' : words.title,
        titleLines,
    };
    const W = Number(norm.ctxIn.availableWidthMm) || LIVE_W_MM;
    const anchors = input.anchors || null;
    const aw = withAnchors(norm, sheetItems, anchors);
    const laid = layoutSheet(role, aw.sections, aw.items, { size, look, paper, headerFirst: headerForLayout, availableWidthMm: W, anchors });
    return Object.assign({ skills, words, titleLines, sheetItems: aw.items, anchors }, laid);
}

/**
 * Compose ONE sheet (Independent: the whole run; More Practice: one letter) into PagePlan pages.
 * Labels run on across the sheet (CL-12); a More Practice letter is a sheet of its own, so its
 * labels start at a. again by construction.
 */
/**
 * Owner ruling 2026-09-25: "some problems will need to be one column - those keep one and go at
 * the top or the bottom of the 2- or 3-column page". A section whose problems mostly fit N
 * columns but hold a few that only fit one (a word problem, a wide picture, a table too wide at
 * this size) is split: the section keeps its columns for the problems that fit them, and the
 * full-width ones follow as one group at the bottom - never interleaved, and never pulling the
 * whole section down to one column. The group shares the section's instruction (it is not
 * printed again on the same page). Not with step-by-step anchors (their bands are keyed by
 * section).
 */
export function splitWide(role, norm, sheetItems, { availableWidthMm = LIVE_W_MM } = {}) {
    const { size, look, paper } = norm;
    const sections = [];
    const items = [];
    norm.sections.forEach((sec, si) => {
        const its = sheetItems[si] || [];
        const keep = () => { sections.push(sec); items.push(its); };
        if (its.length < 2 || its.some((it) => it.anchor)) return keep();
        const base = { role, columns: sec.columns, count: its.length, gridH: sec.gridH, dense: sec.dense, maxCols: sec.maxCols };
        const whole = resolveSectionLayout(Object.assign({ floor: sec.floor }, base), its, paper, availableWidthMm, { size, look });
        const one = (it) => it.fclass === 'word' || it.fclass === 'wide'
            || itemCap(itemInfo(it, { size, look, paper, mode: 'print' })) < 2;
        const wide = its.filter(one);
        const narrow = its.filter((it) => !one(it));
        if (!wide.length || !narrow.length) return keep();
        // (narrow keeps its order here; composeSheet groups by height once the columns are known)
        const L = resolveSectionLayout(Object.assign({}, base, { count: narrow.length }), narrow, paper, availableWidthMm, { size, look });
        if (L.cols <= whole.cols) return keep();
        sections.push(Object.assign({}, sec, { floor: null }));
        items.push(narrow);
        sections.push(Object.assign({}, sec, { columns: 1, floor: null, splitOf: sections.length - 1 }));
        items.push(wide);
    });
    return { norm: Object.assign({}, norm, { sections }), items };
}

function composeSheet(role, input, norm0, sheetItems0, { tabId, seed, form }) {
    const split = input.anchors ? { norm: norm0, items: sheetItems0 } : splitWide(role, norm0, sheetItems0, { availableWidthMm: Number(norm0.ctxIn.availableWidthMm) || LIVE_W_MM });
    const norm = split.norm;
    let sheetItems = split.items;
    const { size, look } = norm;
    const level = 1;                                        // PT 1.7: Independent and More Practice
    const labelStyle = input.labels === 'none' ? 'none' : input.labels === 'tab' || input.labels === 'letter' ? input.labels
        : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).label;       // CL-10 / CL-30, dialog override CL-20
    // RUBRIC H13: within a section, problems of one height sit together (tall first), so rows
    // can be sized to what they hold. The column count is the one the layout would choose.
    if (!input.anchors) {
        sheetItems = sheetItems.map((its, si) => {
            const sec = norm.sections[si] || {};
            const Lp = resolveSectionLayout({ role, columns: sec.columns, count: its.length, floor: sec.floor, gridH: sec.gridH, dense: sec.dense, maxCols: sec.maxCols },
                its, norm.paper, Number(norm.ctxIn.availableWidthMm) || LIVE_W_MM, { size, look });
            return groupByHeight(its, Lp.cols);
        });
    }
    const laidOut = sheetLayout(role, input, norm, sheetItems, tabId);
    const { skills, words, titleLines, layouts, pages, anchors } = laidOut;
    // S6: with side-by-side anchors the sections' items carry their twins (unscored, unlabelled).
    sheetItems = laidOut.sheetItems;

    // Instruction per section (BD-10, BD-13): the section's own key, else the skills' keys.
    const instr = norm.sections.map((sec, si) => {
        const pupil = sheetItems[si].filter((it) => !it.anchor);
        const keys = sec.instructionKey ? [sec.instructionKey]
            : pupil.map((it) => {
                const q = it.q || {};
                const s = skills.find((k) => k.skillId === q.skillId && (!q.categoryId || k.categoryId === q.categoryId));
                return (it.instructionKey) || (s ? skillWords(s).instructionKey : '');
            });
        let key = sectionInstructionKey(keys);
        let text;
        ({ key, text } = resolveInstruction(key, pupil, sec.instructionVars));
        return { key, text };
    });

    // Labels and Score across the sheet (CL-12, CL-33, PT-FRM-4).
    const partsInOrder = pages.flatMap((pg) => pg.parts);
    // Only pupil problems are labelled and scored: a worked twin or an anchor band is neither.
    const counts = partsInOrder.map((p) => pupilCount(sheetItems[p.section].slice(p.chunk.from, p.chunk.from + p.chunk.count)));
    const { starts, notes: labelNotes } = labelStarts(counts, { style: labelStyle, restartEachPage: false });
    // Every cell on these roles is scored (none is a Model or a Guided cell, CL-14).
    const score = scoreDenominator(counts);
    const { first, cont } = sheetHeaders(input, { ...words }, score);
    first.titleLines = titleLines;

    let partNo = 0;
    const planPages = pages.map((pg, pi) => {
        const sections = [];
        if (pi === 0) sections.push({ kind: 'html', html: styleBlock() });
        if (pg.cont) sections.push({ kind: 'html', html: CONT_MARK });
        const lone = pg.parts.length === 1;
        for (const part of pg.parts) {
            const L = layouts[part.section];
            const its = sheetItems[part.section].slice(part.chunk.from, part.chunk.from + part.chunk.count);
            const start = starts[partNo++];
            // PG-10 / PT-ENG-6: page 1 lets a lone full section fill the body by flex (exactly
            // gridH); every other grid carries the section's fixed height, rows x cellH, so a
            // cell is the same size on every page of the section.
            const fillByFlex = !pg.cont && lone && part.chunk.rows === L.rows && !L.blocks && L.fill !== false;
            // A split-off full-width group under its own section on the same page shares its
            // instruction (splitWide): the line is not printed twice.
            const sec = norm.sections[part.section] || {};
            const prevPart = pg.parts[pg.parts.indexOf(part) - 1];
            const shares = sec.splitOf !== undefined && prevPart && prevPart.section === sec.splitOf;
            if (!shares) sections.push({ kind: 'html', html: instructionHtml(instr[part.section].key, instr[part.section].text) });
            if (L.blocks && part.chunk.blocks) {
                // S6 SECTIONS: each block is its anchor band (its own Model tab, no label, no
                // score) and then its 3-4 problems; the labels run on across the blocks.
                const list = (anchors.bySection[part.section] || []);
                let at = start;
                for (const b of part.chunk.blocks) {
                    const bi = Math.floor(b.from / Math.max(1, L.blocks.perBlock));
                    const a = list[bi % list.length];
                    sections.push({
                        kind: 'grid', cols: 1, rows: 1, labels: 'none', start: at, cls: 'fixed mq-anchorgrid',
                        height: `${Math.round(L.anchorMm * 1000) / 1000}mm`, items: [anchorPlanItem(a, 1)],
                    });
                    sections.push({
                        kind: 'grid', cols: L.cols, rows: b.rows, labels: labelStyle, start: at, cls: 'fixed',
                        height: `${Math.round(b.rows * L.cellH * 1000) / 1000}mm`,
                        items: sheetItems[part.section].slice(b.from, b.from + b.count).map((it) => planItem(it, level, L.cols)),
                    });
                    at += b.count;
                }
                continue;
            }
            // RUBRIC H13: each row as tall as what it holds (rowShape), when the rows differ.
            const shape = part.chunk.gridMm ? { heightMm: part.chunk.gridMm, rowsTpl: part.chunk.rowsTpl || '' }
                : its.some((it) => it.anchor) ? null : rowShape(its, L.cols, part.chunk.rows, L.cellH);
            // A lone grid shorter than its page (the teacher's count, a capped row) spends the
            // spare height as whitespace between its rows (grid.js rowGap), never inside cells.
            const avail = pg.cont ? L.gridHCont : L.gridH;
            const baseMm = shape ? shape.heightMm : fillByFlex ? 0 : part.chunk.rows * L.cellH;
            const gap = lone && baseMm && !its.some((it) => it.anchor) ? rowGapFor(part.chunk.rows, baseMm, avail) : { gap: 0 };
            sections.push({
                kind: 'grid',
                cols: L.cols,
                rows: part.chunk.rows,
                labels: labelStyle,
                start,
                cls: fillByFlex && !shape ? '' : 'fixed',
                height: gap.gap ? `${gap.heightMm}mm` : shape ? `${shape.heightMm}mm` : fillByFlex ? '' : `${Math.round(part.chunk.rows * L.cellH * 1000) / 1000}mm`,
                rowsTpl: shape ? shape.rowsTpl : '',
                rowGap: gap.gap || 0,
                items: its.map((it) => planItem(it, level, L.cols)),
            });
        }
        return { header: pg.cont ? cont : first, sections };
    });

    const fits = layouts.map((L, si) => ({
        cols: L.cols, rows: L.rows, perPage: L.perPage, pages: L.pages, cellW: L.cellW, cellH: L.cellH,
        requested: L.requested, clamped: L.clamped,
        // The dialog's line tells the truth about a split-off group (splitWide).
        note: norm.sections[si].splitOf !== undefined
            ? [`${sheetItems[si].length} problem${sheetItems[si].length === 1 ? ' is' : 's are'} too wide for ${layouts[norm.sections[si].splitOf].cols} columns: full width, at the bottom.`, L.note].filter(Boolean).join(' ')
            : L.note,
        line: norm.sections[si].splitOf !== undefined
            ? `${fitsLine(L)} ${sheetItems[si].length} full-width problem${sheetItems[si].length === 1 ? '' : 's'} at the bottom.` : fitsLine(L),
        cls: L.cls, digitPt: L.digitPt,
        hMin: L.hMin, anchorMm: L.anchorMm || 0, blocks: L.blocks || null,
    }));
    return {
        pages: planPages,
        header: first,
        contHeader: cont,
        footer: { left: words.left, right: [form ? `Form ${form}` : '', seed !== undefined && seed !== null && seed !== '' ? `seed ${seed}` : ''].filter(Boolean).join(' · ') },
        score, layouts, fits, words, instr, labelNotes, skills,
    };
}

/**
 * Compose a role.
 *
 * @param {'independent'|'more-practice'} role
 * @param {Object} input  {items, skills, sections, ctx, header, form, seed, labels, lesson, letters}
 * @returns {PagePlan & {meta: Object, sheets?: PagePlan[]}}
 */
export function composePractice(role, input = {}) {
    const norm = normaliseInput(input);
    const { size, look, paper } = norm;
    const form = input.form || 'A';
    const seed = input.seed;
    const ctx = {
        look, size, paper, mode: 'print', scaffoldLevel: 1,
        photocopySafe: !!(norm.ctxIn.photocopySafe),
    };
    const cls = paper === 'letter' ? 'mq-paper-letter' : '';

    // Group the items by section.
    const bySection = norm.sections.map(() => []);
    for (const it of norm.items) {
        const si = Math.max(0, Math.min(norm.sections.length - 1, Number(it.section) || 0));
        bySection[si].push(it);
    }

    const base = (sheet, extra = {}) => Object.assign({
        role, ctx, cls, form, seed,
        header: sheet.header, contHeader: sheet.contHeader, footer: sheet.footer, pages: sheet.pages,
    }, extra);

    if (role !== 'more-practice') {
        const lesson = Math.max(1, Number(input.lesson) || 1);
        const sheet = composeSheet(role, input, norm, bySection, { tabId: `Lesson ${lesson}`, seed, form });
        return base(sheet, {
            meta: {
                role, items: norm.items.length, scoreOutOf: sheet.score, pages: sheet.pages.length,
                fits: sheet.fits, notes: [...sheet.fits.map((f) => f.note).filter(Boolean), ...sheet.labelNotes],
                title: sheet.header.title, tab: sheet.header.tab, instructions: sheet.instr,
            },
        });
    }

    // MORE PRACTICE (PT-MPR-1..2): every letter is its own sheet - its own full header, its own
    // Score, labels from a. again, tab "Practice A".."Practice J", and its own seed.
    // Items that carry `letter` (0-based, or 'A'..'J') are grouped by it; otherwise the run is
    // paginated and each page becomes the next letter.
    const letterOf = (v) => (typeof v === 'string' ? Math.max(0, LETTERS.indexOf(v.toUpperCase())) : Math.max(0, Number(v) || 0));
    const firstLetter = letterOf(input.startLetter || 0);
    let groups;
    if (norm.items.some((it) => it.letter !== undefined)) {
        const byLetter = new Map();
        for (const it of norm.items) {
            const L = letterOf(it.letter);
            if (!byLetter.has(L)) byLetter.set(L, norm.sections.map(() => []));
            const si = Math.max(0, Math.min(norm.sections.length - 1, Number(it.section) || 0));
            byLetter.get(L)[si].push(it);
        }
        groups = [...byLetter.entries()].sort((a, b) => a[0] - b[0]).map(([letter, secs]) => ({ letter, secs }));
    } else {
        // Paginate the whole run once, exactly as an Independent run would be (PG-23 included),
        // then each page becomes the next letter.
        const laid = sheetLayout(role, input, norm, bySection, 'Practice A');
        groups = laid.pages.map((pg, i) => {
            const secs = norm.sections.map(() => []);
            for (const part of pg.parts) secs[part.section].push(...laid.sheetItems[part.section].slice(part.chunk.from, part.chunk.from + part.chunk.count).filter((it) => !it.anchor));
            return { letter: firstLetter + i, secs };
        });
    }

    const sheets = groups.slice(0, LETTERS.length).map(({ letter, secs }) => {
        const L = LETTERS[Math.min(letter, LETTERS.length - 1)];
        const seedL = letterSeed(seed, L);
        const sheet = composeSheet(role, input, norm, secs, { tabId: `Practice ${L}`, seed: seedL, form });
        return base(sheet, {
            seed: seedL,
            meta: {
                role, letter: L, items: secs.flat().length, scoreOutOf: sheet.score, pages: sheet.pages.length,
                fits: sheet.fits, notes: sheet.fits.map((f) => f.note).filter(Boolean),
                title: sheet.header.title, tab: sheet.header.tab, instructions: sheet.instr,
            },
        });
    });
    if (groups.length > LETTERS.length) {
        // PT 2.5: ten parallel pages at most. Say so rather than print "Practice K".
        sheets.forEach((s) => s.meta.notes.push('More Practice stops at J (ten pages).'));
    }
    // The combined plan still renders every letter through `renderPageAndKey`: each page keeps
    // its own header, so only the footer's page counter reads across the job.
    const first = sheets[0] || base({ header: {}, contHeader: {}, footer: {}, pages: [] });
    return Object.assign({}, first, {
        pages: sheets.flatMap((s) => s.pages),
        sheets,
        meta: {
            role, letters: sheets.map((s) => s.meta.letter), items: norm.items.length,
            scoreOutOf: sheets.map((s) => s.meta.scoreOutOf), pages: sheets.reduce((a, s) => a + s.pages.length, 0),
            fits: sheets.length ? sheets[0].meta.fits : [], notes: sheets.flatMap((s) => s.meta.notes),
            title: first.header && first.header.title, tab: first.header && first.header.tab,
        },
    });
}

/* ====================================================================== render + DOM hooks */

/**
 * WORKSHEET_DESIGN_STANDARD.md 17.1: the data-ws-* hooks the lints key on, written onto a
 * rendered page string. The kit's `page()` and `grid()` carry only some of them, so the rest
 * are added here, from class tokens the composer put on each cell. Pure string work.
 */
export function decorate(pageHtml, { index, paper = 'A4', role = '', mode = 'print', state = 'blank' } = {}) {
    let html = String(pageHtml);
    html = html.replace(/<section class="ws-page ([^"]*)"/, (m, c) =>
        `<section class="ws-page ${c}" data-ws-page="${index}" data-ws-paper="${/letter/i.test(paper) ? 'letter' : 'a4'}" data-ws-role="${esc(role)}" data-ws-mode="${mode}"`);
    html = html.replace('<footer class="ws-foot">', '<footer class="ws-foot" data-ws-teacher>');
    html = html.replace(/<div class="ws-cell ([^"]*)" data-ws-cell style="/g, (m, c) => {
        const tok = (p) => ((c.match(new RegExp(`(?:^|\\s)${p}--([^\\s]+)`)) || [])[1] || '');
        const t = tok('mqt');
        if (!t) return m;
        const a = tok('mqa');
        const l = tok('mql');
        const legacy = /(?:^|\s)mq-legacy(?:\s|$)/.test(c) ? ' data-ws-legacy="1"' : '';
        return `<div class="ws-cell ${c}" data-ws-cell="${t}" data-ws-state="${state}" data-ws-level="${l}" data-ws-answer-type="${a}"${legacy} style="`;
    });
    return html;
}

/**
 * Render a plan: the pupil pages and the facsimile key, from ONE plan (AK-1), with the 17.1
 * hooks written in. A More Practice plan renders letter by letter, so every letter keeps its
 * own page counter ("1/1") and its own seed on the key footer.
 *
 * @returns {{pupilHtml: string, keyHtml: string, pupilPages: string[], keyPages: string[], gaps: Object[]}}
 */
export function renderPlan(plan, { key = true } = {}) {
    const plans = plan.sheets && plan.sheets.length ? plan.sheets : [plan];
    const paper = (plan.ctx && plan.ctx.paper) || 'A4';
    const pupilPages = [];
    const keyPages = [];
    const gaps = [];
    for (const p of plans) {
        const src = renderSource(p);
        src.pages.forEach((html) => pupilPages.push(decorate(html, { index: pupilPages.length + 1, paper, role: p.role, mode: 'print', state: 'blank' })));
        if (key) {
            const k = renderAnswerKey(p);
            k.pages.forEach((html) => keyPages.push(decorate(html, { index: keyPages.length + 1, paper, role: p.role, mode: 'key', state: 'answered' })));
            gaps.push(...(k.gaps || []));
        }
    }
    return { pupilHtml: pupilPages.join('\n'), keyHtml: keyPages.join('\n'), pupilPages, keyPages, gaps };
}

export default {
    SHEET_ENGINE_CSS, STRAND_BY_CATEGORY, levelLine, skillWords, sectionInstructionKey, instructionHtml,
    estimateTitleLines, letterSeed, composePractice, decorate, renderPlan,
};
