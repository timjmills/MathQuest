// js/modules/print-sheet.js
// THE APP BRIDGE to the sheet engine: generate the items, measure the cells the kit cannot size
// on its own, hand everything to a page role, render the pupil sheet and its facsimile key.
//
//   buildSheet(req)            -> {pupilHtml, keyHtml, pageCount, keyPageCount, fits, items, plan}
//   sheetDocument(html, title) -> a standalone printable HTML document (A4, margins 0, Andika)
//
// WHY THIS LAYER EXISTS. The kit (`js/modules/sheet/`) is pure: it cannot call the generators,
// read `data.js` or touch the DOM. Three things need the app, and all three live here:
//   1. GENERATION through `generateQuestionFor` - seeded, the skill's own options honoured - never
//      bare `generateQuestion`. Duplicates are retried under a new seed.
//   2. MEASUREMENT (SKILL_CELL_CONTRACT.md SCC-A6). A skill that has no registered cell template
//      prints through the kit's `legacy` template, which wraps the app's existing per-item print
//      HTML; its height cannot be known statically, so every cell is rendered once off-screen at
//      each column count the layout may choose, in the real stylesheets, and its height and
//      whether it fits (no overflow, no clipping, no picture shrunk to fit - DN-10) go into the
//      layout. The layout itself stays measure-free (`sheet/layout.js`).
//   3. The skill METADATA the frame prints: label, level, strand, instruction key.
//
// Layer 6 (print-*): imports generate-question.js, data.js, print-generate.js and the kit.
// Importing print-generate.js also installs the kit's legacy adapters (it calls
// `installLegacyAdapters` at module load), which is what lets the `legacy` template reach the
// app's print branches.

import { generateQuestionFor as _generateQuestionFor, configuredItem } from './generate-question.js';
// Print keeps a review item's asked-for pair (critic nl-r5 D1: live items carry their real category).
const generateQuestionFor = (req) => configuredItem(_generateQuestionFor(req), req && req.category);
import { factSetTitle, optionsFor, normalizeOptions, numberLineFits } from './skill-options.js';
import { mergedLine } from './refline-screen.js';
import { opsRoutedSkill } from './gen-operations.js';
import { getSkillGrade, getSkillPrintSize, SKILL_FULL_LABELS, SKILLS, isMixedMetaSkill, getMixedPoolSkills, DOMAINS } from './data.js';
import { kitCellSpec } from './print-generate.js';
import { renderCell, cellAnswerKey, cellFootprint, resolveCtx, SIZES, INSTRUCTION_LIBRARY, getProvider, cellMinSize, sizeFloor, nlResolveLine, nlLineNumbers, nlStepName as stepName, refLineHTML } from './sheet/index.js';
import { plan as independentPlan } from './sheet/roles/independent.js';
import { plan as morePracticePlan, letterSeed } from './sheet/roles/more-practice.js';
import { normKeyOptions, shortKeyRows, renderShortKey, tagKeyAnswers, answerText } from './sheet/roles/key-short.js';
import { renderPlan, SHEET_ENGINE_CSS, skillWords, splitCellH, splitPairH } from './sheet/roles/practice.js';
import { onePageRows, setOnePagePaper, ONE_PAGE_ITEMS } from './count-rows.js';
import { resolveSectionLayout, cellWidthMm, LIVE_W_MM, bodyHeightMm, instructionMm, autoFitsAt, itemInfo, itemCap, DENSE_MAX_COLS_AT, DENSE_MAX_COLS } from './sheet/layout.js';
import { paginate } from './sheet/paginate.js';
import { ROLE_MODULES, ROLE_ALIASES } from './sheet/roles/index.js';
import { tagLine as lessonTagLine, CASE_TESTS as LESSON_CASE_TESTS } from './sheet/roles/lesson.js';
import { lessonFor, skillRef } from './lessons/prereqs.js';
import { detailedLessonFor, validateDescription, fillPlaceholders } from './lessons/detailed/index.js';
import { teacherBands, paginateTeacher, renderTeacherPage, measureShell, wordProblemPlan, exitSlipPlan, numberSensePlan, DETAILED_PUPIL_CSS, LIFT_MAX_CHARS, TEACHER_BODY_MM } from './sheet/roles/detailed-lesson.js';
import { TEACHER_CSS, RCDWS_CSS, teacherParts, numberWords } from './sheet/index.js';
const { tBand } = teacherParts;
import { planItem as composePlanItem, operandsOf as composeOperandsOf, opOf as composeOpOf, opGlyphOf as composeGlyphOf, oralFrameOf as composeOralFrameOf, answerOf as composeAnswerOf, instructionKeyOf as composeInstrKeyOf, instructionText as composeInstrText } from './sheet/roles/compose.js';
import {
    normaliseAnchors, ANCHOR_ROLES, anchorEligible, anchorItem, anchorHeightMm, easeScore, ineligibleNote,
    blockPlan, sideItems, pickDistinct,
} from './sheet/anchors.js';
import {
    allocateSupports, alternativesOf, TOUCH_IDS, normCoverage, normMix, TOUCH_MIN_PT,
    canDraw, supportNeeds, supportOpKey as opKey,
} from './sheet/index.js';

/* ======================================================================== constants */

const PX_PER_MM = 96 / 25.4;
const PRACTICE_ROLES = new Set(['independent', 'more-practice']);
/** Every role buildSheet composes: the two practice roles plus the P7.2b role modules. */
export const SHEET_ROLES = Object.freeze(['independent', 'more-practice', ...Object.keys(ROLE_MODULES)]);
const ROLES = new Set(SHEET_ROLES);
const LETTERS = 'ABCDEFGHIJ';
const MAX_ITEMS = 160;            // ten More Practice pages of 16 one-symbol items
const RETRIES = 12;               // duplicate retries per item before a duplicate is accepted

/** The stylesheets a sheet document renders with, in the app's cascade order. */
const SHEET_STYLESHEETS = Object.freeze([
    'css/brand.css', 'css/variables.css', 'css/base.css', 'css/ui-components.css', 'css/word-problem-visuals.css',
    'css/print-worksheet.css', 'css/fonts/andika.css', 'css/sheet-kit.css',
]);

/* ================================================================ request normalising */

const clampInt = (v, lo, hi, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

function normaliseRequest(req = {}) {
    const asked = ROLE_ALIASES[req.role] || req.role;
    const role = ROLES.has(asked) ? asked : 'independent';
    const size = ['S', 'M', 'L'].includes(req.size) ? req.size : 'L';
    // PT-LOOK-1 / PAGE_TYPES appendix 4: 'auto' takes the role's own default look - I Can on the
    // lesson roles, Daily on the fact layouts and Mixed practice; the dialog may choose either.
    const mod = ROLE_MODULES[role];
    const look = req.look === 'daily' || req.look === 'ican' ? req.look : ((mod && mod.DEFAULT_LOOK) || 'ican');
    const paper = /letter/i.test(String(req.paper || '')) ? 'Letter' : 'A4';
    const seed = Number.isFinite(Number(req.seed)) && req.seed !== null && req.seed !== ''
        ? (Number(req.seed) >>> 0) : (Math.floor(Math.random() * 900000) + 100000);
    const sections = (Array.isArray(req.sections) ? req.sections : [])
        .map((s) => ({
            skills: (s && Array.isArray(s.skills) ? s.skills : []).filter((k) => k && k.categoryId && k.skillId),
            count: s && s.count !== undefined && s.count !== null && s.count !== 'auto' ? clampInt(s.count, 1, MAX_ITEMS, null) : null,
            pages: s && s.pages ? clampInt(s.pages, 1, 10, 1) : null,
            columns: s && s.columns && s.columns !== 'auto' ? clampInt(s.columns, 1, 10, 'auto') : 'auto',
            instructionKey: s && s.instructionKey,
            // Cells sized to their content (layout.js dense packing); `dense: false` keeps the
            // plain 12.1 grid.
            // (An object {S, M, L} is the section's own dense ceiling: a lesson practice page asks
            // for whole rows of three within 12.1's 16, lessons r1.)
            dense: s && s.dense && typeof s.dense === 'object' ? Object.assign({}, s.dense) : req.dense !== false && !(s && s.dense === false),
            // A grid height the caller caps (the lesson's practice page); the page's body otherwise.
            gridH: s && Number(s.gridH) > 0 ? Number(s.gridH) : undefined,
            capH: !!(s && Number(s.gridH) > 0),
            // A lesson practice page (lessons r1): the rows share the whole grid (no FILL_CAP row
            // gaps) - the caller has chosen a count whose cells stay under H13's band.
            noCap: !!(s && s.noCap),
        }))
        .filter((s) => s.skills.length);
    // Owner 2026-10-02: a count-by section with "All 12 tables on one page" is exactly twelve rows on ONE
    // page in one column, drawn at the smallest print size (the page holds twelve rows only at S).
    let onePage = false;
    for (const sec of sections) {
        let rowCount = ONE_PAGE_ITEMS;
        const on = sec.skills.some((k) => {
            try {
                if (k.skillId !== 'count_by_tables') return false;
                const o = normalizeOptions(k.categoryId, k.skillId, k.opts || {});
                // wave 1 C2: with rows chosen the sheet prints THOSE rows once each, in order, as many as the paper holds, else x 1 to x 12
                if (o.onePage && o.rows && o.rows.length) rowCount = onePageRows(o.rows).length;
                return !!o.onePage;
            } catch (e) { return false; }
        });
        if (on) {
            sec.count = rowCount; sec.pages = 1; sec.columns = 1; onePage = true;
        }
    }
    return {
        role, size: onePage ? 'S' : size, look, paper, seed, sections,
        form: req.role === 'test-b' || String(req.form || 'A').toUpperCase() === 'B' ? 'B' : 'A',
        key: req.key !== false,
        header: Object.assign({}, req.header || {}),
        labels: req.labels,
        lesson: req.lesson || (req.header && req.header.lesson),
        letters: Array.isArray(req.letters) ? req.letters.map((l) => String(l).toUpperCase()).filter((l) => LETTERS.includes(l)) : null,
        photocopySafe: !!req.photocopySafe,
        // S6: step-by-step anchor problems - 'off' | 'side' | 'sections' (only the practice roles
        // and Mixed practice take them; 'on' means the role's default, sections).
        anchors: ANCHOR_ROLES.includes(role) ? normaliseAnchors(req.anchors) : 'off',
        // S2: how the supports each skill carries are spread over the sheet. null = each skill's
        // own `cover` / `mix` option (the default: every problem, clashing supports by section).
        coverage: req.coverage ? normCoverage(req.coverage) : null,
        mix: req.mix ? normMix(req.mix) : null,
        testHints: req.testHints === true,
        // The lesson packet (role 'lesson'): Independent pages after the teaching sheet, and the
        // optional Mixed practice page.
        practicePages: req.practicePages !== undefined && req.practicePages !== null ? clampInt(req.practicePages, 0, 10, 1) : 1,
        mixed: !!req.mixed,
        // The look the request asked for ('auto' when none): a lesson's Mixed practice page keeps
        // the lesson's I Can look unless the teacher chose Daily.
        lookAsked: req.look === 'daily' || req.look === 'ican' ? req.look : 'auto',
        // A practice page's step reminder (the lesson's anchor chart in one strip): {html, hMm}.
        stepStrip: req.stepStrip && req.stepStrip.html && Number(req.stepStrip.hMm) > 0 ? { html: String(req.stepStrip.html), hMm: Number(req.stepStrip.hMm) } : null,
        // The strand tab's last line, when a packet names its part ("Practice 1", lessons r1).
        tabId: typeof req.tabId === 'string' && req.tabId.trim() ? req.tabId.trim().slice(0, 16) : '',
        // Mixed practice's unit lattice, when a packet fixes it (lessons r1).
        latticeN: [4, 6, 8, 10].includes(Number(req.latticeN)) ? Number(req.latticeN) : 0,
        // A lesson's Mixed page (lessons r3): its first skill holds at least half the placed items.
        leadHalf: !!req.leadHalf,
        // (the detailed lesson maker, lesson 2 r4: `leadHalf` may drop a partner's only shelf or narrow it)
        leadDrop: !!req.leadDrop,
        // The detailed lesson maker: no Steps strip on the lesson's Mixed page (critic D18).
        mixedStrip: req.mixedStrip === false ? false : undefined,
        // The detailed lesson maker (lessons/detailed/*): a lesson's chart / sheet data in the
        // prereqs.js LESSONS shape, used INSTEAD of lessonFor() when given (null otherwise, so
        // every standard lesson renders exactly as before).
        lessonData: req.lessonData && typeof req.lessonData === 'object' ? req.lessonData : null,
        perQuestion: Array.isArray(req.perQuestion) ? req.perQuestion.map(Number) : Number(req.perQuestion) >= 1 ? Math.floor(Number(req.perQuestion)) : undefined,
        // The detailed lesson: the Mixed page's partners and the Practice last-row rule (absent otherwise).
        mixedSkills: Array.isArray(req.mixedSkills) && req.mixedSkills.length ? req.mixedSkills : null,
        mixedLattice: [4, 6, 8, 10].includes(Number(req.mixedLattice)) ? Number(req.mixedLattice) : 0,
        // (`mixed.leadDrop` on a description - lesson 2 r4: the lesson skill reaches half the Mixed page by
        // dropping or narrowing a partner's only shelf; absent elsewhere)
        mixedLeadDrop: !!req.mixedLeadDrop,
        growLast: !!req.growLast,
        practiceSheets: Array.isArray(req.practiceSheets) && req.practiceSheets.length ? req.practiceSheets : null,
        tagLine: typeof req.tagLine === 'string' && req.tagLine ? req.tagLine : '',
        packTab: Array.isArray(req.packTab) ? req.packTab.map(String) : null,
        edgeLast: req.edgeLast && Number(req.edgeLast.per) > 0 ? { per: Number(req.edgeLast.per), cols: Number(req.edgeLast.cols) || 1 } : null,
    };
}

/* ======================================================================= generation */

/** A question's identity for de-duplication: what the pupil would see as "the same problem". */
function signature(q) {
    const payload = q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : '';
    const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
    return `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${ans}|${payload}`;
}

/**
 * The skills of a section, dealt into `count` slots by weight (largest remainder), grouped in
 * the order the teacher listed them (DN-34: one type per run, never silently mixed).
 */
function dealSkills(skills, count) {
    const w = skills.map((s) => Math.max(0, Number(s.weight || s.percent) || 0));
    const total = w.reduce((a, b) => a + b, 0);
    const shares = total > 0 ? w.map((x) => (x / total) * count) : skills.map(() => count / skills.length);
    const base = shares.map(Math.floor);
    let left = count - base.reduce((a, b) => a + b, 0);
    const order = shares.map((s, i) => [s - Math.floor(s), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of order) { if (left <= 0) break; base[i]++; left--; }
    const out = [];
    skills.forEach((s, i) => { for (let k = 0; k < base[i]; k++) out.push(s); });
    return out;
}

/**
 * Generate `count` items for one run. Item i is generated under `baseSeed + i` (the same seed
 * reprints the same page); a duplicate retries under `baseSeed + i + 7919 * k`. `itemIndex`
 * counts only the items of that skill that were KEPT (generateQuestionFor's contract).
 */
/** The numeric operands of a generated item (its cell payload's, else its own a / b). */
function refOperands(q) {
    const p = (q && q.cell && q.cell.payload) || {};
    // (an array and its turn, lesson 3a: its rows and its row length)
    if (q && q.cell && q.cell.template === 'arrays-turn') return [Number(p.rows), Number(p.cols)].filter(Number.isFinite);
    const raw = Array.isArray(p.operands) ? p.operands : p.a !== undefined ? [p.a, p.b] : [q.a, q.b];
    return raw.filter((v) => v !== undefined && v !== null && v !== '').map((v) => Number(String(v).replace(/,/g, ''))).filter(Number.isFinite);
}

/**
 * A lesson skill ref's floors (lessons r2-r3), each a promise the packet makes:
 *   minOperand     every operand at least this (no + 0 in "add 1-3"; 2-place partner addition)
 *   minTop         the first operand at least this (no 11 - 6 in 2-place regrouping)
 *   maxTop         the first operand at most this (no 100 - 47 in a 2-place lesson)
 *   maxBottom      the second operand at most this (a one-place take-away example)
 *   zeroOnes       the first operand ends in 0 (a 0 in the ones)
 *   distinctFirst  no two items share a first operand (36 - 29, 36 - 18)
 *   distinctAnswer no two items share an answer (21 - 4, 22 - 5)
 *   noTurnaround   no two items are the same numbers turned round (1 + 9, 9 + 1)
 *   maxSmall       at most this many items with a one-place second operand
 *   avoidTexts     never an item another page of the packet printed
 */
function refAccepts(sk, cand, key, seen, kept, pg = '', row = '', words = true) {
    const ops = refOperands(cand);
    if (sk.minOperand !== undefined && ops.some((v) => v < Number(sk.minOperand))) return false;
    if (sk.minTop !== undefined && !(ops[0] >= Number(sk.minTop))) return false;
    if (sk.maxTop !== undefined && !(ops[0] <= Number(sk.maxTop))) return false;
    if (sk.maxBottom !== undefined && !(ops[1] <= Number(sk.maxBottom))) return false;
    if (sk.zeroOnes && !(ops[0] % 10 === 0)) return false;
    // `minN`: a rounding item's number at least this (the 90s -> 100 example).
    if (sk.minN !== undefined && !(Number(cand.cell && cand.cell.payload && cand.cell.payload.n) >= Number(sk.minN))) return false;
    if (sk.distinctFirst && seen.has(`first:${key}:${ops[0]}`)) return false;
    if (sk.distinctAnswer && seen.has(`ans:${key}:${refAnswer(cand)}`)) return false;
    // (`avoidKeys` refs - the detailed lesson maker: no two answers alike on the page across its skills, LR-6)
    if (sk.avoidKeys && seen.has(`ansAll${pg}:${dlAns(cand).replace(/[^0-9a-z<>=]/gi, '')}`)) return false;
    // (LR-6 near twins, critic r3 N1: no two one-number items of a skill on a page within 2 - 405 and 406)
    if (sk.avoidKeys && nearKeyOf(cand) !== null) { const v = nearKeyOf(cand); for (let dv = -2; dv <= 2; dv++) if (dv && seen.has(`near:${key}:${v + dv}`)) return false; }
    // (LR-6 for + and − items and stories - lesson 2 r4, critic r2 D2: E24b now reads them too)
    if (sk.lr6 && !lr6Ok(cand, key, seen, pg, row, words)) return false;
    if (sk.noTurnaround && ops.length >= 2 && seen.has(`pair:${key}:${ops.slice().sort((x, y) => x - y).join(',')}`)) return false;
    if (sk.maxSmall !== undefined && ops.length >= 2 && ops[1] < 10 && (kept.get(`small:${key}`) || 0) >= Number(sk.maxSmall)) return false;
    if (Array.isArray(sk.avoidTexts) && sk.avoidTexts.includes(refText(cand))) return false;
    // The detailed lesson maker (LR-5, V22 §9.5): `avoidKeys` - never an item (its fact key) another
    // page of the pack dealt; `minNum` / `maxNum` - the item's number (or answer) in range; `edge`
    // with `edgeTest` - only the lesson's edge cases (roles/lesson.js CASE_TESTS). Absent on every
    // other request.
    if (sk.avoidKeys || sk.minNum !== undefined || sk.maxNum !== undefined || sk.edge || sk.boardOnly) {
        const k = factKeyOf(cand);
        if (k === null) return false;
        if (sk.avoidKeys && sk.avoidKeys.includes(k)) return false;
        // (`allTest`, the detailed lesson maker - lesson 3a: a case test EVERY place of the ref passes)
        if (sk.allTest && LESSON_CASE_TESTS[sk.allTest] && !LESSON_CASE_TESTS[sk.allTest]({ q: cand })) return false;
        // (an array's turned pair, lesson 3a: 4 x 3 after 3 x 4 draws the same two arrays - never on another page either)
        if (sk.avoidKeys && turnedKeyOf(cand) !== null && sk.avoidKeys.includes(turnedKeyOf(cand))) return false;
        if (!refHardOk(sk, cand)) return false;
        if (sk.edge) { const t = LESSON_CASE_TESTS[sk.edgeTest || 'pvEdge']; if (t && !t({ q: cand })) return false; }
        if (seen.has(`key:${k}`)) return false;
        const tk = turnedKeyOf(cand);
        if (tk !== null && seen.has(`key:${tk}`)) return false;
    }
    return true;
}

/**
 * A lesson ref's HARD bounds (the detailed lesson maker): `minNum` / `maxNum` on the item's number
 * and `boardOnly` (numbers shown on the board only: never an item's number or its answer). Unlike
 * the soft floors these are never relaxed, not even on a ref's last try (critic r3 S1: the last try
 * "took what it got" and printed 1,000 on a pupil page past `maxNum: 999`).
 */
export const refHasHard = (sk) => !!sk && (sk.minNum !== undefined || sk.maxNum !== undefined || (Array.isArray(sk.boardOnly) && sk.boardOnly.length > 0) || sk.partMin !== undefined || Array.isArray(sk.noPart) || !!sk.crossTen);
export function refHardOk(sk, cand) {
    if (!refHasHard(sk)) return true;
    const v = itemNumberOf(cand);
    if (sk.minNum !== undefined && !(v !== null && v >= Number(sk.minNum))) return false;
    if (sk.maxNum !== undefined && !(v !== null && v <= Number(sk.maxNum))) return false;
    // (`partMin` / `noPart`: a two-operand item's parts - the detailed lesson maker, lesson 2: no part of 1 or 10)
    if (sk.partMin !== undefined || Array.isArray(sk.noPart) || sk.crossTen) {
        const o = composeOperandsOf(cand).map(Number);
        if (o.length < 2 || !o.every(Number.isFinite)) return false;
        if (sk.partMin !== undefined && o.some((x) => x < Number(sk.partMin))) return false;
        if (Array.isArray(sk.noPart) && o.some((x) => sk.noPart.map(Number).includes(x))) return false;
        // (`crossTen`: both parts 9 or less and the whole past 10 - counting on across ten -, unless the
        // whole is one of `crossTenExcept` (lesson 2: a whole of exactly 20, its edge case))
        if (sk.crossTen && !(o[0] <= 9 && o[1] <= 9 && o[0] + o[1] >= 11) && !(Array.isArray(sk.crossTenExcept) && sk.crossTenExcept.map(Number).includes(o[0] + o[1]))) return false;
    }
    if (Array.isArray(sk.boardOnly) && sk.boardOnly.length) {
        const bo = sk.boardOnly.map(Number);
        const a = String(dlAns(cand)).replace(/,(?=\d{3})/g, '');
        if (v !== null && bo.includes(v)) return false;
        if ((a.match(/\d+/g) || []).some((x) => bo.includes(Number(x)))) return false;
    }
    return true;
}

/**
 * The one whole number a place-value / number-name item is about (305 for "three hundred five",
 * "Write 305 in expanded form.", "300 + 5 = ?"), or null. Used by the detailed lesson maker's
 * pool (LR-5) and by its self-check.
 */
export function itemNumberOf(q) {
    if (!q) return null;
    const p = (q.cell && q.cell.payload) || {};
    if (q.pv && Number.isFinite(Number(q.pv.n))) return Number(q.pv.n);
    if (Number.isFinite(Number(p.n))) return Number(p.n);
    // (an array and its turn, lesson 3a: its product - the ref floors minNum / maxNum read it)
    if (q.cell && q.cell.template === 'arrays-turn' && Number.isFinite(Number(p.rows) * Number(p.cols))) return Number(p.rows) * Number(p.cols);
    const a = typeof q.ans === 'object' ? null : String(q.ans).replace(/,/g, '').trim();
    if (a !== null && /^\d+$/.test(a)) return Number(a);
    const t = refText(q).replace(/,(?=\d{3})/g, '');
    const m = t.match(/\b\d{2,4}\b/);
    return m ? Number(m[0]) : null;
}

/** An arrays-turn item's turned fact key (4 x 3 for 3 x 4), else null: a page never prints both (LR-6 twins). */
export const turnedKeyOf = (q) => (q && q.cell && q.cell.template === 'arrays-turn' && q.cell.payload ? `${Number(q.cell.payload.cols)}x${Number(q.cell.payload.rows)}` : null);

/**
 * An item's FACT key for the pack's pool (LR-5): an operation item is its operands and sign
 * ("7+6"); anything else is its number (305). null when neither can be read.
 */
export function factKeyOf(q) {
    if (!q) return null;
    // An array (arrays-turn, lesson 3a): keyed rows x cols, so 3 x 4, 4 x 3 and 2 x 6 are three facts. The
    // pictured arrays stop at 5 x 5 (RP-21): one key per turned pair would leave a pack ten arrays, and it
    // needs about fourteen. The turned pair is kept off ONE page instead (turnedKeyOf, refAccepts).
    if (q.cell && q.cell.template === 'arrays-turn' && q.cell.payload) return `${Number(q.cell.payload.rows)}x${Number(q.cell.payload.cols)}`;
    const op = composeOpOf(q);
    const ops = op ? composeOperandsOf(q) : [];
    if (op && ops.length >= 2) return ops.join(composeGlyphOf(op) || op);
    const v = itemNumberOf(q);
    return v === null ? null : String(v);
}

/** An edge case of a numbers-to-1000 lesson: a 0 in the tens or ones, a teen ending, or 1000 (not
 *  when the lesson declares it `boardOnly`: then it is never dealt, so never an edge case). */
export const isEdgeNumber = (v, boardOnly = []) => !boardOnly.map(Number).includes(v) && (v === 1000 || (v >= 100 && (Math.floor(v / 10) % 10 === 0 || v % 10 === 0 || Math.floor(v / 10) % 10 === 1)));

/**
 * LR-6 near twins (V22 2983): − both numbers within 2 of the other's (51 − 44, 53 − 45); + one number
 * the same and the other within 2 (5 + 7 and 5 + 6, 8 + 5 and 8 + 6 - critic r2 D2; sums within 20 leave
 * no page without two sums of close parts, so a + twin shares a number, as V22's own + rules do).
 */
export const nearPair = (op, da, db) => (op === '−' ? Math.abs(da) <= 2 && Math.abs(db) <= 2 : (da === 0 && Math.abs(db) <= 2) || (db === 0 && Math.abs(da) <= 2));
/**
 * LR-6 (V22 2981) for a + / − item and a story, the detailed lesson maker only (refs with
 * `avoidKeys`; lesson 2 r4, critic r2 D2): its sign and two numbers from its fact key ("7+6"), and a
 * story's first name and unit word. On one page: no first addend twice (of one skill), no number
 * taken away twice, no near twins (the same sign, both numbers within 2 of the other's: 5 + 7 and
 * 5 + 6), and no story name or unit word twice. `seen` is the page's own set.
 */
export function lr6Of(q) {
    const k = factKeyOf(q);
    const m = k === null ? null : String(k).match(/^(\d+)([+−])(\d+)$/);
    const p = (q && q.cell && q.cell.payload) || {};
    // (every person of the story: the first word of each sentence but the question - "Leo has 9.", "Mia has 11.")
    const ls = Array.isArray(p.lines) ? p.lines.slice(0, -1).map(String) : [];
    const names = [...new Set(ls.map((l) => (l.match(/^([A-Z][a-z]+)\b/) || [])[1]).filter((w) => w && !/^(There|The|A|An|Each|Now|Then)$/.test(w)))];
    return {
        op: m ? m[2] : null, a: m ? Number(m[1]) : null, b: m ? Number(m[3]) : null,
        name: names[0] || '', names, unit: Array.isArray(p.lines) ? String(p.unit || '') : '',
    };
}
function lr6Ok(q, key, seen, pg = '', row = '', words = true) {
    const x = lr6Of(q);
    if (x.op === '+' && seen.has(`lr6f${pg}${row}:${key}:${x.a}`)) return false;
    if (x.op === '−' && seen.has(`lr6s${pg}:${x.b}`)) return false;
    if (x.op) for (let da = -2; da <= 2; da++) for (let db = -2; db <= 2; db++) if (nearPair(x.op, da, db) && seen.has(`lr6p${pg}:${x.op}:${x.a + da}:${x.b + db}`)) return false;
    // (a story's name and unit word: kept apart while the deal can - `words` false on a ref's last strict pass)
    if (words && x.name && seen.has(`lr6n${pg}:${x.name}`)) return false;
    if (words && x.unit && seen.has(`lr6u${pg}:${x.unit}`)) return false;
    return true;
}
function lr6Record(q, key, seen, pg = '', row = '') {
    const x = lr6Of(q);
    if (x.op === '+') seen.add(`lr6f${pg}${row}:${key}:${x.a}`);
    if (x.op === '−') seen.add(`lr6s${pg}:${x.b}`);
    if (x.op) seen.add(`lr6p${pg}:${x.op}:${x.a}:${x.b}`);
    for (const nm of x.names) seen.add(`lr6n${pg}:${nm}`);
    if (x.unit) seen.add(`lr6u${pg}:${x.unit}`);
}

/**
 * `shortQuestion` on a lesson's story ref (the detailed lesson maker, lesson 2 r4 - critic r2 D4,
 * AX-3 / SF-50): the question sentence in its short library form, so every sentence of the story
 * fits ONE line of its cell ("How many books does Mia have now?" -> "How many books now?",
 * "How many books do they have in all?" -> "How many books in all?"). The story's own text and its
 * cell's lines change together; the numbers never do. Absent on every other ref.
 */
const SHORT_Q = [[/How many (\w+) does [A-Z][a-z]+ have now\?/, 'How many $1 now?'], [/How many (\w+) do they have in all\?/, 'How many $1 in all?']];
const shortQ = (t) => SHORT_Q.reduce((a, [re, to]) => a.replace(re, to), String(t));
function shortStoryQ(q) {
    if (!q) return q;
    const out = Object.assign({}, q, { text: shortQ(q.text || '') });
    const p = q.cell && q.cell.payload;
    if (p && Array.isArray(p.lines)) out.cell = Object.assign({}, q.cell, { payload: Object.assign({}, p, { lines: p.lines.map(shortQ) }) });
    return out;
}

/** A one-number item's number for LR-6's near-twin rule (an operation item: null). */
const nearKeyOf = (q) => (composeOpOf(q) ? null : itemNumberOf(q));

/** Records what `refAccepts` checks the next items against. */
function refRecord(sk, q, key, seen, kept, pg = '', row = '') {
    const ops = refOperands(q);
    if (sk.distinctFirst) seen.add(`first:${key}:${ops[0]}`);
    if (sk.distinctAnswer) seen.add(`ans:${key}:${refAnswer(q)}`);
    if (sk.avoidKeys) seen.add(`ansAll${pg}:${dlAns(q).replace(/[^0-9a-z<>=]/gi, '')}`);
    if (sk.avoidKeys && nearKeyOf(q) !== null) seen.add(`near:${key}:${nearKeyOf(q)}`);
    if (sk.lr6) lr6Record(q, key, seen, pg, row);
    if (sk.noTurnaround && ops.length >= 2) seen.add(`pair:${key}:${ops.slice().sort((x, y) => x - y).join(',')}`);
    if (sk.maxSmall !== undefined && ops.length >= 2 && ops[1] < 10) kept.set(`small:${key}`, (kept.get(`small:${key}`) || 0) + 1);
    if (sk.avoidKeys || sk.minNum !== undefined || sk.maxNum !== undefined || sk.edge || sk.boardOnly) { const k = factKeyOf(q); if (k !== null) seen.add(`key:${k}`); }
}

const refAnswer = (q) => String(q && q.ans !== undefined ? (typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans) : '');
/** An item's text as a packet compares it ("67 − 9 = ?"), tags and spaces removed. */
export const refText = (q) => String((q && q.text) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function generateRun(skills, count, baseSeed, { startIndex = 0, seen = new Set(), kept = new Map(), itemCount = null } = {}) {
    const slots = dealSkills(skills, startIndex + count).slice(startIndex);
    // S2: a ticked support LEVEL fades down the page. With the section's count known it is dealt
    // in equal blocks of that count; otherwise two items a level (supports.js fadeRung). The same
    // count for the probe and the final run, so an item is the same item in both.
    const perSkill = itemCount ? new Map(dealSkills(skills, itemCount).map((s) => [`${s.categoryId}:${s.skillId}`, 0])) : null;
    if (perSkill) for (const s of dealSkills(skills, itemCount)) { const k = `${s.categoryId}:${s.skillId}`; perSkill.set(k, perSkill.get(k) + 1); }
    const out = [];
    // `edgeLast.first` (the detailed lesson maker, lesson 2 r4): the ★★★ places are dealt FIRST, so the
    // page's other items keep LR-6 against them (every equal-parts story is a near twin of 7 + 8, so a
    // 7 + 8 dealt first left the last row no equal parts it could take - critic r2 D2). Each item still
    // prints at its own place. Absent on every other ref (the order is the places' own, as before).
    const isEdgeAt = (sk, i) => !!sk.edgeLast && (i % sk.edgeLast.per) >= sk.edgeLast.per - sk.edgeLast.cols;
    const order = slots.map((_, j) => j);
    if (slots.some((sk) => sk.edgeLast && sk.edgeLast.first)) order.sort((x, y) => (isEdgeAt(slots[x], startIndex + x) ? 0 : 1) - (isEdgeAt(slots[y], startIndex + y) ? 0 : 1) || x - y);
    const placed = new Array(slots.length);
    order.forEach((j) => {
        const sk = slots[j];
        const i = startIndex + j;
        const key = `${sk.categoryId}:${sk.skillId}`;
        const itemIndex = kept.get(key) || 0;
        let q = null;
        // A lesson ref's floors can need many tries to meet (a 0 in the ones AND a one-place
        // bottom number): `tries` raises the budget for that ref only.
        const tries = Math.max(RETRIES, Math.min(600, Number(sk.tries) || 0));
        // The detailed lesson (V22 §9.5, ★★★): `edgeLast` {per, cols} makes the last `cols` places
        // of every `per` places edge cases only (the last row of each Practice page).
        // `wants` [case per edge place] names the case test of each place of that row (1,000 first);
        // such a place tries the item rotations in turn (a generator deals its cases off itemIndex).
        const edgeAt = sk.edgeLast ? (i % sk.edgeLast.per) - (sk.edgeLast.per - sk.edgeLast.cols) : -1;
        // (`lr6` refs, the detailed lesson maker: LR-6 holds per PAGE - a Practice page is `edgeLast.per` places)
        const pg = sk.lr6 && sk.edgeLast ? `@${Math.floor(i / sk.edgeLast.per)}` : '';
        // (and the first-addend rule per ROW of the grid, as V22 states it)
        const rowK = sk.lr6 && sk.edgeLast ? `r${Math.floor((i % sk.edgeLast.per) / Math.max(1, sk.edgeLast.cols))}` : '';
        const edgeWant = edgeAt >= 0 && Array.isArray(sk.edgeLast.wants) ? sk.edgeLast.wants[edgeAt] : '';
        // A ref with HARD bounds (refHasHard: the detailed lesson maker) never relaxes them: its last
        // try is strict too; failing that, a second pass rotates the generator's case (itemIndex - a
        // case-dealing generator gives every seed the same case at one index, so seeds alone cannot
        // escape it), and only then are the SOFT floors relaxed, the hard bounds still held. A ref
        // without them deals exactly as before (the standard lesson maker is unchanged).
        const hard = refHasHard(sk);
        const pass = (rotate, relaxLast, soft, words = true) => {
            let got = null;
            for (let k = 0; k <= tries; k++) {
                const seed = (baseSeed + i + 7919 * k) >>> 0;
                let cand = null;
                try { cand = generateQuestionFor(Object.assign({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed, itemIndex: edgeWant || rotate ? itemIndex + k : itemIndex, itemCount: perSkill ? perSkill.get(key) : undefined }, sk.range ? { range: sk.range } : {})); } catch (e) { cand = null; }
                if (!cand) continue;
                // A lesson's skill ref (lessons r2-r3): floors on what the packet deals. Not skill
                // options - the packet's; the last try takes what it gets (a hard bound excepted).
                const skR = edgeAt >= 0 ? Object.assign({}, sk, { edge: true }, edgeWant ? { edgeTest: edgeWant } : {}) : sk;
                const strict = soft && !(relaxLast && k === tries);
                if (hard && !refHardOk(sk, cand)) continue;
                if (strict && !refAccepts(skR, cand, key, seen, kept, pg, rowK, words)) continue;
                // (a case the last row WANTS is kept for it: no other place of the page deals it)
                if (strict && edgeAt < 0 && sk.edgeLast && Array.isArray(sk.edgeLast.wants) && sk.edgeLast.wants.some((w) => w && LESSON_CASE_TESTS[w] && LESSON_CASE_TESTS[w]({ q: cand }))) continue;
                got = cand;
                if (!seen.has(signature(cand))) break;
            }
            return got;
        };
        // (a detailed lesson's ref - `avoidKeys` - rotates the generator's case before it relaxes: a
        // case-dealing generator can give every seed one sum at an index, and LR-6 then rejects them
        // all - lesson 2 r4, critic r2 D2: the relaxed last try printed a repeat and a twin answer)
        // (an `lr6` ref then drops only the story-words rule before it relaxes the soft floors)
        const wordsOff = (relaxLast) => (sk.lr6 ? pass(true, relaxLast, true, false) : null);
        q = hard ? (pass(false, false, true) || pass(true, false, true) || wordsOff(false) || pass(true, false, false))
            : sk.avoidKeys ? (pass(false, false, true) || pass(true, false, true) || wordsOff(false) || pass(true, true, true)) : pass(false, true, true);
        if (!q) return;
        // A lesson's practice page (lessons r1): `check` on the skill ref puts the Check line
        // ("Check: add back") under every subtraction stack. Not a skill option - the page's.
        // `cellPayload` on a lesson's ref (the detailed lesson maker): fields merged into the item's
        // kit payload (lesson 2: the word-work cell's compact `layout: 'bar'`). Absent elsewhere.
        if (sk.cellPayload && q.cell && q.cell.payload) q = Object.assign({}, q, { cell: Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, sk.cellPayload) }) });
        if (sk.instructionKey && q) q = Object.assign({}, q, { instructionKey: sk.instructionKey });
        if (sk.shortQuestion) q = shortStoryQ(q);
        if (sk.check && q.cell && q.cell.template === 'stack') q.cell = Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, { check: true }) });
        // (`sectionLabel` on the ref: the Mixed page names the item's band by it - the detailed lesson maker)
        if (sk.sectionLabel) q = Object.assign({}, q, { sectionLabel: String(sk.sectionLabel) });
        seen.add(signature(q));
        refRecord(sk, q, key, seen, kept, pg, rowK);
        kept.set(key, itemIndex + 1);
        placed[j] = { q, skill: sk };
    });
    for (const x of placed) if (x) out.push(x);
    return out;
}

/* =================================================================== the cell of one item */

const FACT_FORMAT_RE = /-facts-(vertical|horizontal|fraction|long)$/;

/**
 * The instruction a skill's section prints (BD-13), while the skill's provider still has only
 * the default strings: computation formats take "Add." / "Subtract." / "Multiply." / "Divide.",
 * counting takes "Count. Write the number.", a ten frame to fill takes "Draw counters to show
 * the number.". Every key is from the controlled library; nothing is composed here.
 */
/** The library key of a K-2 skill whose provider has not named one yet (never "Solve."). */
const SKILL_INSTRUCTION_FALLBACK = Object.freeze({
    count_objects: 'count-write', ten_frame_build: 'draw-count', base10_build: 'draw-blocks',
    compare_groups: 'check-groups', share_into_groups: 'ring-groups', number_bonds: 'missing',
});

function instructionKeyFor(q, words) {
    // An item that names its own library key (a skill whose task turns on a dealt option:
    // number_word_form, words to numeral or numeral to words) wins.
    if (q && typeof q.instructionKey === 'string' && INSTRUCTION_LIBRARY[q.instructionKey]) return q.instructionKey;
    if (words && words.instructionKey && !/^default-/.test(words.instructionKey)) return words.instructionKey;
    if (SKILL_INSTRUCTION_FALLBACK[q.skillId]) return SKILL_INSTRUCTION_FALLBACK[q.skillId];
    const f = String(q.printFormat || '');
    const cat = String(q.categoryId || '');
    if (/^column-add|add-facts/.test(f)) return 'add';
    if (/^column-sub|sub-facts/.test(f)) return 'subtract';
    if (/^column-mult|mult-facts/.test(f)) return 'multiply';
    if (/long-div|div-facts|bracket/.test(f)) return 'divide';
    if (q.answerType === 'ten-frame-build' || /ten-frame-build/.test(f)) return 'draw-count';
    if (cat === 'counting' && /^count_/.test(String(q.skillId || '')) && q.answerType === 'number') return 'count-write';
    // An item that prints its own "Check one box" is answered with a check mark, so a "Write the
    // answer." line above it would contradict it. The library has no bare "Check one box.", so
    // the neutral default holds the place until the skill's provider names its own key.
    if (/check one box/i.test(`${q.text || ''} ${q.printText || ''} ${q.visual || ''}`)) return 'default-solve';
    return (words && words.instructionKey) || 'default-write';
}

/**
 * Some legacy print branches leave a `<div>` open (the add word-problem visuals do). Inside a
 * sheet that swallows every following cell into this one, and the grid breaks. The legacy
 * markup cannot be fixed here (print-generate.js is frozen until its family migrates), so the
 * cell closes what it opened: the missing closers go at the end of the cell's own markup.
 */
function balanceDivs(html) {
    const open = (html.match(/<div\b/g) || []).length;
    const close = (html.match(/<\/div>/g) || []).length;
    return open > close ? html + '</div>'.repeat(open - close) : html;
}

/**
 * The legacy fact branch draws its own black number tab ("1" in every cell, because it is handed
 * one item at a time). The kit's grid already labels the cell (CL-10 / CL-30), so a second tab
 * inside the cell is dropped: one label per cell, in the kit's own place.
 */
const LEGACY_TAB_RE = /<span class="ws-tab" data-ws-label="tab" style="position:absolute;[^"]*">[^<]*<\/span>/g;
const legacyClean = (html) => balanceDivs(String(html).replace(LEGACY_TAB_RE, ''));

/** Registered K-2 templates that pack as one-symbol answers (a ten frame, a number track, a chart window). */
const SHORT_TEMPLATES = new Set(['tenframe', 'seqstrip', 'chartwindow']);

/** A fact drawn across ("a ÷ b = ___"): the fact template in its horizontal notation. */
function isAcrossFact(q, template) {
    const p = (q.cell && q.cell.payload) || {};
    return template === 'fact' && (p.notation === 'horiz' || p.notation === 'horizontal');
}

/** PT 2.4 footprint classes: long procedures, one-symbol answers, word problems. */
function footprintClass(q, template, size) {
    const f = String(q.printFormat || '');
    // The word-work cell (every whole-number story) is MEASURED: small numbers stand in 2 columns,
    // wider work goes to the full-width group (practice.js splitWide), never a forced one column.
    if (template === 'word-work') return 'standard';
    if (size === 'spacious' || /word/.test(f)) return 'word';
    // The K-2 picture templates hold one small picture and one short answer: they pack like
    // one-symbol answers (2 x 4 and up), not like 6-per-page stacks.
    if (SHORT_TEMPLATES.has(template) || q.answerType === 'ten-frame-build') return 'short';
    // A horizontal fact ("24 ÷ 6 = ___") is one line with one short answer (critic round 2, H5:
    // six division facts filled a page, every cell 80% empty).
    if (isAcrossFact(q, template)) return 'short';
    // div_facts' Long-division and Fraction forms (payload `fact`): a recalled fact with one
    // short answer, no work rows - packed with the page's other fact forms, never as long work.
    if ((template === 'division' || template === 'equation') && q.cell && q.cell.payload && q.cell.payload.fact) return 'short';
    const operands = (q.cell && q.cell.payload && q.cell.payload.operands) || [q.a, q.b];
    if (/long-div|long_div/.test(f) || template === 'division') return 'long';
    if (/^column-mult/.test(f) && Number(operands[1]) >= 10) return 'long';
    const stacked = template === 'stack' || template === 'fact' || /column|stack|facts|division/.test(f) || FACT_FORMAT_RE.test(f);
    const ans = String(typeof q.ans === 'object' ? '' : q.ans).trim();
    const oneSymbol = /^(?:\d{1,2}|[<>=]|[A-Za-z]|yes|no|true|false)$/i.test(ans);
    const written = ['number', 'text', 'multiple-choice', ''].includes(String(q.answerType || ''));
    if (!stacked && oneSymbol && written) return 'short';
    return 'standard';
}

/* ------------------------------------------------------------- the legacy cell's key */

const STAMP_RE = /<div class="ws-legacy-answer" data-ws-stamp="1"[^>]*>[\s\S]*?<\/span><\/div>/;
const SOLID_STYLE = 'font-weight:700;color:#000;';

/**
 * P8: the base-10 model a build item's key draws, {place: count}. `base10_regroup` shows the
 * mat AFTER the trade its prompt asks for (one ten fewer, ten ones more).
 */
function drawModelFor(q) {
    if (!q) return null;
    const target = Math.floor(Number(q && (q.target !== undefined ? q.target : q.ans)));
    if (!Number.isFinite(target) || target < 0) return null;
    const places = Array.isArray(q.places) && q.places.length ? q.places : (target >= 100 ? [100, 10, 1] : [10, 1]);
    const out = {};
    let rest = target;
    for (const p of places.slice().sort((a, b) => b - a)) { out[p] = Math.floor(rest / p); rest -= out[p] * p; }
    if (q.skillId === 'base10_regroup' && out[10] > 0 && out[1] !== undefined) { out[10] -= 1; out[1] += 10; }
    return out;
}

/** P8: `n` quick-draw symbols for one place (RP-31): a square, a stick or a circle. */
function quickDraw(place, n) {
    const sym = place === 100
        ? '<svg width="8mm" height="8mm" viewBox="0 0 10 10" style="display:block"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/></svg>'
        : place === 10
            ? '<svg width="2.4mm" height="14mm" viewBox="0 0 4 24" style="display:block"><line x1="2" y1="1" x2="2" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
            : '<svg width="4mm" height="4mm" viewBox="0 0 6 6" style="display:block"><circle cx="3" cy="3" r="2.2" fill="none" stroke="currentColor" stroke-width="0.9"/></svg>';
    return Array.from({ length: Math.max(0, n) }, () => sym).join('');
}

/**
 * AK-1 / AK-2 for a LEGACY cell: write the answer into the slot the pupil writes in, the way a
 * pupil would, instead of the stamp under the cell. The legacy markup has a handful of slot
 * shapes shared by many print branches; each is filled only when the cell holds EXACTLY ONE of
 * them and the answer has the matching shape, and nothing about any box, rule or width changes.
 * Anything else keeps the adapter's stamp (answer-key.js reports it as a gap), which is honest.
 * This is a bridge until the family's registered template draws its own key (P8).
 *
 * @returns {string|null} the filled html, or null when no slot could be filled with certainty
 */
export function legacyKeyFill(html, q, key, { ink = 'solid', shown = false } = {}) {
    // `ink: 'trace'` writes the value in the single grey (a Model or first Guided cell, INK-3);
    // the default is the pupil's solid ink of a key or of shown work (Error analysis).
    const INK_STYLE = ink === 'trace' ? 'font-weight:700;color:#949494;' : SOLID_STYLE;
    const inkAttr = ink === 'trace' ? 'trace' : 'solid';
    const raw = key && key.value !== undefined && key.value !== null && typeof key.value !== 'object' ? String(key.value) : '';
    const display = key && key.display !== undefined ? String(key.display) : raw;
    if (!raw && !display) return null;
    const digits = raw.replace(/,/g, '').trim();

    // P8 0a. Boxed slots, one per blank (a fact family's four facts, the empty cells of a
    // number strip, a hundred-chart window's one gap): each box gets its own answer (AK-2). The
    // answers come from `q.keyParts` when the generator names them (its `q.ans` has to stay one
    // number for the single-answer checkers), else from an array key, else from the key itself
    // (one box) or its comma list (several).
    const boxSlots = html.match(/<span class="blank-box" data-ws-slot="[^"]*" data-ws-shape="box"[^>]*><\/span>/g) || [];
    if (boxSlots.length >= 1) {
        const parts = (Array.isArray(q && q.keyParts) ? q.keyParts.map(String)
            : key && Array.isArray(key.value) ? key.value.map(String)
                : boxSlots.length === 1 ? [display || raw] : raw.split(','))
            .map((t) => String(t).trim()).filter((t) => t !== '');
        if (parts.length === boxSlots.length) {
            let k = 0;
            return html.replace(/(<span class="blank-box" data-ws-slot="[^"]*" data-ws-shape="box"[^>]*>)(<\/span>)/g,
                (m, open, close) => `${open.replace(/>$/, ` data-ws-ink="${inkAttr}">`)}<b style="${INK_STYLE}">${escText(parts[k++])}</b>${close}`);
        }
    }

    // P8 0b. A stacked answer row drawn by the operations generator (`_wsStack`): one box per
    // digit track, marked `data-ws-shape="boxes"`, filled right-aligned (VA-3).
    const boxRows = html.match(/<div data-ws-slot="answer" data-ws-shape="boxes"[^>]*>[\s\S]*?<\/div>/g) || [];
    if (boxRows.length === 1 && /^\d+$/.test(digits)) {
        const row = boxRows[0];
        const boxes = row.match(/<span data-ws-box="1"[^>]*><\/span>/g) || [];
        if (boxes.length >= digits.length) {
            let k = 0;
            const skip = boxes.length - digits.length;
            const filled = row
                .replace(/^<div data-ws-slot="answer" data-ws-shape="boxes"/, `<div data-ws-slot="answer" data-ws-shape="boxes" data-ws-ink="${inkAttr}"`)
                .replace(/<span data-ws-box="1"([^>]*)><\/span>/g, (m, attrs) => {
                    const d = k >= skip ? digits[k - skip] : '';
                    k++;
                    return d ? `<span data-ws-box="1"${attrs.replace(/height:1\.15em;/, 'height:1.15em;line-height:1.15em;')}><b style="${INK_STYLE}font-size:0.8em;">${d}</b></span>` : m;
                });
            return html.replace(row, filled);
        }
    }

    // P8 0c. A place-value quick-draw mat (base-10 build): the key DRAWS the model the pupil
    // draws — sticks for tens, small squares for hundreds, circles for ones — in the same zones,
    // instead of restating the target number under it (AK-1, AK-4).
    if (/class="ws-draw-mat" data-ws-slot="answer" data-ws-shape="draw"/.test(html)) {
        const model = drawModelFor(q);
        if (model) {
            let out = html.replace('class="ws-draw-mat" data-ws-slot="answer" data-ws-shape="draw"',
                `class="ws-draw-mat" data-ws-slot="answer" data-ws-shape="draw" data-ws-ink="${inkAttr}"`);
            for (const place of Object.keys(model)) {
                const zoneRe = new RegExp(`(<div data-ws-zone="${place}" style="[^"]*")(><\\/div>)`);
                out = out.replace(zoneRe, (m, open, close) => `${open.replace(/"$/, ';display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:1.2mm;padding:2mm;box-sizing:border-box;"')}>${quickDraw(Number(place), model[place])}</div>`);
            }
            return out;
        }
    }

    // P8 0d. An empty ten frame to draw in: the key fills it with solid counters, left to
    // right, top row first, the first frame full before the second is started (RP-11).
    const frames = html.match(/<svg class="ws-tenframe"[^>]*>[\s\S]*?<\/svg>/g) || [];
    if (frames.length && /^\d+$/.test(digits) && /data-ws-shape="draw"/.test(html)) {
        let left = Math.min(Number(digits), frames.length * 10);
        let out = html.replace(/(data-ws-slot="answer" data-ws-shape="draw")/, `$1 data-ws-ink="${inkAttr}"`);
        for (const fr of frames) {
            const n = Math.min(10, left);
            left -= n;
            let dots = '';
            for (let i = 0; i < n; i++) {
                const cx = 5 + (i % 5) * 10, cy = 5 + Math.floor(i / 5) * 10;
                dots += `<circle cx="${cx}" cy="${cy}" r="3.4" fill="currentColor"/>`;
            }
            out = out.replace(fr, fr.replace(/<\/svg>$/, `${dots}</svg>`));
        }
        return out;
    }

    // 1. A stacked answer row: one `.blank` per digit track, filled right-aligned (VA-3).
    const stacks = html.match(/<div class="stack-answer"[^>]*>[\s\S]*?<\/div>/g) || [];
    if (stacks.length === 1 && /^\d+$/.test(digits)) {
        const row = stacks[0];
        const blanks = row.match(/<span class="blank"[^>]*><\/span>/g) || [];
        if (blanks.length >= digits.length) {
            let k = 0;
            const skip = blanks.length - digits.length;
            const filled = row.replace(/<span class="blank"([^>]*)><\/span>/g, (m, attrs) => {
                const d = k >= skip ? digits[k - skip] : '';
                k++;
                return d ? `<span class="blank"${attrs} data-ws-ink="${inkAttr}" style="${INK_STYLE}">${d}</span>` : m;
            });
            return html.replace(row, filled);
        }
    }

    // 2. A vertical fact's open write row: three tracks under the rule, digits right-aligned.
    const factRows = html.match(/<span class="ws-fact-write" style="([^"]*)"><\/span>/g) || [];
    if (factRows.length === 1 && /^\d+$/.test(digits)) {
        const style = /style="([^"]*)"/.exec(factRows[0])[1];
        const h = (/height:\s*([\d.]+mm)/.exec(style) || [])[1] || '8mm';
        // The write row spans the stack's own tracks: one digit per track, right-aligned, so a
        // two-digit sum of one-digit addends puts its tens digit in the operator's track instead
        // of wrapping to a new row (the pupil page has no other place for it, AK-1).
        const at = html.indexOf(factRows[0]);
        const tracks = [...html.slice(0, at).matchAll(/grid-template-columns:\s*repeat\((\d+),/g)].map((m) => Number(m[1])).pop() || 3;
        if (digits.length > tracks) return null;
        const cells = digits.padStart(tracks, ' ').split('').map((d) => `<span data-ws-ink="${inkAttr}" style="height:${h};line-height:${h};display:flex;align-items:center;justify-content:center;${INK_STYLE}">${d.trim()}</span>`).join('');
        return html.replace(factRows[0], cells);
    }

    // 2b. A horizontal equation's own write slot ("36 ÷ 4 = ____"): one empty `.ws-slot` line or
    // box, the value written on it.
    const eqSlots = html.match(/<span class="ws-slot" data-ws-shape="(?:line|box)"[^>]*><\/span>/g) || [];
    if (eqSlots.length === 1 && display && /style="[^"]*"><\/span>$/.test(eqSlots[0])) {
        return html.replace(eqSlots[0], eqSlots[0].replace(/"><\/span>$/, `;display:inline-flex;align-items:flex-end;justify-content:center;" data-ws-ink="${inkAttr}"><b style="${INK_STYLE}line-height:1;">${escText(display)}</b></span>`));
    }

    // 3. One "Answer:" line: a label, then a ruled blank that stretches (28+ print branches).
    const lineRe = /(Answer:\s*<\/span>\s*<span style="[^"]*border-bottom:[^"]*">)(?:&nbsp;|\s)*(<\/span>)/g;
    const lines = html.match(lineRe) || [];
    if (lines.length === 1 && display) {
        const fl = /^(\d+)\s*\/\s*(\d+)$/.exec(display.trim());
        const v = fl ? `<span class="mq-frac" style="font-size:1em;"><span>${fl[1]}</span><span>${fl[2]}</span></span>` : escText(display);
        return html.replace(lineRe, (m, open, close) => `${open}<b data-ws-ink="${inkAttr}" style="${INK_STYLE}">${v}</b>${close}`);
    }

    // 3b. ONE empty inline write place with no "Answer:" label - a ruled underline ("Perimeter =
    // ____ units", a question's own answer rule, a bar-graph answer rule) or the empty box between
    // two fractions: the value is written ON it (AK-1), so the key is a facsimile and Error
    // analysis can show the pupil's work in the pupil's own slot (critic round 4: these skills
    // had no Check it page at all).
    const openRe = /(<(span|div) style="([^"]*(?:border-bottom:\s*2px solid #000|border:\s*2px solid #000)[^"]*)">)(?:&nbsp;|\s)*(<\/\2>)/g;
    const opens = html.match(openRe) || [];
    // Shown work only (`shown`): a key keeps its answer stamp until the cell names its slot, so
    // the pupil page and the key count the same answer places (AK-4).
    if (shown && opens.length === 1 && display && !/Answer:/.test(html) && display.length <= 24) {
        // a fraction is written stacked over its bar, never with a slash (TY-7); the place is at
        // least 14 mm wide (SL-1)
        const fm = /^(\d+)\s*\/\s*(\d+)$/.exec(display.trim());
        const val = fm ? `<span class="mq-frac" style="font-size:1em;"><span>${fm[1]}</span><span>${fm[2]}</span></span>` : escText(display);
        return html.replace(openRe, (m, open, tag, style, close) => `<${tag} style="${style};text-align:center;min-width:14mm;" data-ws-ink="${inkAttr}"><b style="${INK_STYLE}">${val}</b>${close}`);
    }

    // 4. The K-2 check-box list: the box beside the answer's label gets a check mark (AK-2).
    const want = [q && q.printAnswer, raw, `Group ${raw}`].filter(Boolean).map((s) => String(s).trim().toLowerCase());
    const tickRe = /(<span style="min-width:6\.5em;">)([^<]+)(<\/span><span style="display:inline-block;width:1\.15em;height:1\.15em;[^"]*")(><\/span>)/g;
    const ticks = [...html.matchAll(tickRe)];
    const hits = ticks.filter((m) => want.includes(m[2].trim().toLowerCase()));
    if (ticks.length >= 2 && hits.length === 1) {
        const target = hits[0][0];
        const checked = target.replace(tickRe, (m, a, label, b, c) =>
            `${a}${label}${b.replace(/"$/, `;display:inline-flex;align-items:center;justify-content:center;line-height:1;${INK_STYLE}"`)} data-ws-ink="${inkAttr}">✓</span>`);
        return html.replace(target, checked);
    }
    return null;
}

/**
 * The number sentence a skill's provider asks for under its picture (`strings.sentence(q)` ->
 * {parts: ['20', '÷', '5', '=', '4'], blanks: [0, 2, 4]}), or null.
 */
function sentenceOf(q) {
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const str = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, q }) : p.strings;
        const s = str && typeof str.sentence === 'function' ? str.sentence(q) : null;
        return s && Array.isArray(s.parts) && s.parts.length ? s : null;
    } catch (e) { return null; }
}

/** The sentence as write lines: every blank an ungraded line the key fills (the picture's answer is the scored slot). */
function sentenceHtml(sf, c, ink) {
    const blanks = new Set(sf.blanks || []);
    // The key writes the sentence; a traced (Model / worked) cell writes it in trace grey.
    const mode = ink === 'trace' ? 'trace' : c.state === 'answered' ? 'solid' : '';
    return `<div class="mq-sframe">${sf.parts.map((p, i) => {
        if (!blanks.has(i)) return `<span>${escText(String(p))}</span>`;
        const v = mode ? escText(String(p)) : '';
        return `<span class="ws-line${mode === 'trace' ? ' ws-trace' : ''}" data-ws-slot="sf-${i}" data-ws-shape="line" data-ws-graded="0"${v ? ` data-ws-ink="${mode}"` : ''} style="--w:${Math.max(14, String(p).length * 6 + 8)}mm">${v}</span>`;
    }).join('')}</div>`;
}

/* ============================================================= S2 · the supports model */

/**
 * The supports one item COULD carry (design/SUPPORTS.md §S2): the render-time values of its
 * skill's unified `support` set that this item's cell can draw. null when there are none. The item
 * is measured with all of them (the worst case); the allocator later says which it draws, and the
 * rest are drawn invisibly, so the geometry never changes between measurement and print.
 */
function supportPlanFor(sk, q, template, size, mix = null) {
    if (!sk || !q || !q.cell || template === 'legacy') return null;
    let def = null;
    try { def = optionsFor(sk.categoryId, sk.skillId).find((d) => d.id === 'support' && d.supportsModel) || null; } catch (e) { def = null; }
    if (!def) return null;
    const o = normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {});
    const chosen = (Array.isArray(o.support) ? o.support : []).filter((v) => def.render.includes(v));
    if (!chosen.length) return null;
    const p = q.cell.payload || {};
    let worst = chosen.filter((id) => canDraw(id, p, template));
    if (!worst.length) return null;
    // Section by section across a page of several sections, a section only ever carries ITS
    // alternative (supports.js deals mixKey % alternatives), so that is all it keeps room for.
    const mixMode = n_mix(mix) || o.mix || 'section';
    if (mix && mix.count >= 2 && mixMode === 'section') {
        const alts = alternativesOf(chosen);
        if (alts.length > 1) {
            const alt = alts[(Number.isFinite(mix.alt) ? mix.alt : mix.key) % alts.length];
            worst = worst.filter((x) => alt.includes(x));
            if (!worst.length) return null;
        }
    }
    const need = Object.fromEntries(worst.map((id) => [id, supportNeeds(id, p, template)]));
    const touch = worst.some((x) => TOUCH_IDS.includes(x));
    // Touch dots need 24 pt digits: a stack or a sentence at M / S is drawn at L (owner ruling); a
    // fact takes the fact ladder, capped at 6 columns (24 pt) by its footprint.
    const forceL = touch && template !== 'fact' && (SIZES[size] || SIZES.L).digitPt < TOUCH_MIN_PT;
    const extra = {};
    const op = opKey(p.op);
    if (op === '*' && Array.isArray(o.constant)) {
        const a = Number(p.a), b = Number(p.b), cs = o.constant;
        if (cs.includes(a) !== cs.includes(b)) extra.table = cs.includes(a) ? a : b;
    }
    // ÷: the tally row is the same length for every item of the section: 12 on a 12s set.
    if (op === '/') extra.tally = Number(o.band) >= 144 ? 12 : 10;
    return {
        chosen, worst, need, forceL, extra,
        cover: o.cover || 'whole', mix: o.mix || 'section',
    };
}

/**
 * S2: one section of one skill whose ticked supports clash, mixed by section, split into one
 * sub-section per alternative (dealt like a grouped section: counts by share, or a page shared).
 */
function splitBySupports(sec, gi, n) {
    if (sec.group || !sec.skills || sec.skills.length !== 1) return [sec];
    const sk = sec.skills[0];
    let def = null;
    try { def = optionsFor(sk.categoryId, sk.skillId).find((d) => d.id === 'support' && d.supportsModel) || null; } catch (e) { def = null; }
    if (!def) return [sec];
    const o = normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {});
    if ((n.mix || o.mix || 'section') !== 'section') return [sec];
    const chosen = (Array.isArray(o.support) ? o.support : []).filter((v) => def.render.includes(v));
    const alts = alternativesOf(chosen);
    // Up to four alternatives. A page-driven split is checked once its parts are measured (buildSheet
    // undoes it when one row of each does not fit a page, or when it holds fewer problems than the
    // one section). Beyond four the alternatives are dealt in blocks inside the one section.
    if (alts.length < 2 || alts.length > 4) return [sec];
    const k = alts.length;
    const counts = sec.count ? alts.map((_, i) => Math.floor(sec.count / k) + (i < sec.count % k ? 1 : 0)) : null;
    return alts.map((_, i) => Object.assign({}, sec, {
        count: counts ? counts[i] || null : null,
        group: { id: `sup${gi}`, share: 1 / k },
        supportAlt: i,
    })).filter((x) => !counts || x.count);
}

/** The sheet-level mix, when the request sets one. */
const n_mix = (mix) => (mix && mix.sheet) || null;

/** A fact cell spec for a two-number fact the legacy path draws, when its skill ticks a support. */
const KIT_OP = { '+': '+', '-': '-', '−': '-', '×': '*', 'x': '*', '*': '*', '÷': '/', '/': '/' };
function supportFactSpec(sk, q) {
    if (!sk || !q || !Number.isInteger(Number(q.a)) || !Number.isInteger(Number(q.b)) || !KIT_OP[q.op]) return null;
    if (q.notation === 'fraction' || String(q.a).length > 2 || String(q.b).length > 2 || (q.answerType && q.answerType !== 'number')) return null;
    let def = null;
    try { def = optionsFor(sk.categoryId, sk.skillId).find((d) => d.id === 'support' && d.supportsModel) || null; } catch (e) { def = null; }
    if (!def) return null;
    const o = normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {});
    if (!(Array.isArray(o.support) ? o.support : []).some((v) => def.render.includes(v))) return null;
    const op = KIT_OP[q.op];
    return { template: 'fact', payload: { a: Number(q.a), b: Number(q.b), op, notation: q.notation === 'across' ? 'horiz' : 'vertical', digits: 2 } };
}

/**
 * Deal the supports over a sheet's items (supports.js allocateSupports), in page order, grouped
 * by section (a Mixed practice shelf is its pool). Writes each item's box, which its draw reads.
 */
function allocateHostSupports(items, n) {
    const list = items.filter((it) => it && it.supportsBox && it.supportsBox.plan);
    if (!list.length) return;
    // A More Practice set's letters are ONE sheet (coordinator, 2026-09-25): a skill fades down the
    // whole set, and its section is dealt across the letters, A before B.
    const skillKey = (it) => it.skill;
    const chosen = {}, cover = {}, mix = {};
    for (const it of list) {
        const pl = it.supportsBox.plan;
        chosen[skillKey(it)] = pl.chosen;
        cover[skillKey(it)] = n.coverage || pl.cover;
        mix[skillKey(it)] = n.mix || pl.mix;
    }
    // A section is a section of the sheet (every More Practice letter of it), or a Mixed practice
    // pool.
    const keys = new Map();
    const keyOf = (it) => {
        const k = it.pool !== undefined && it.pool !== null ? `p${it.pool}` : `s${it.section || 0}`;
        if (!keys.has(k)) keys.set(k, keys.size);
        return keys.get(k);
    };
    const alloc = allocateSupports(list.map((it) => ({
        section: keyOf(it), skill: skillKey(it), can: it.supportsBox.plan.worst, need: it.supportsBox.plan.need, mixKey: it.supportsBox.mixKey,
    })), chosen, { coverage: cover, mix });
    list.forEach((it, i) => {
        const b = it.supportsBox;
        const r = alloc[i];
        // Everything the item could carry that it does not draw is reserved (drawn invisibly).
        const reserve = b.plan.worst.filter((x) => !r.on.includes(x));
        b.cur = Object.assign({}, b.plan.extra, { on: r.on, reserve });
        b.level = r.level;
    });
}

/**
 * Turn one generated question into a host item: the question carrying its cell spec, a draw
 * function (the SAME one for the pupil page, the key and the measurement), the key, and the
 * class tokens the role writes onto the cell.
 */
function hostItem(g, sectionIndex, size, { supports: withSupports = true, mix = null } = {}) {
    const q0 = g.q;
    // S2: a legacy-drawn fact (sub_facts' vertical fact) that carries supports is drawn by the kit's
    // fact template, which can draw them - the same upgrade the old fact cue made in the generator.
    const resolved = kitCellSpec(q0) || (withSupports ? supportFactSpec(g.skill, q0) : null);
    const q = Object.assign({}, q0);
    let template;
    if (resolved) {
        template = resolved.template;
        q.cell = { template, payload: resolved.payload, v: 1 };
    } else {
        template = 'legacy';
        const cls = getSkillPrintSize(q0.skillId || '', q0.printFormat || '');
        q.cell = { template: 'legacy', v: 1 };
        q.__sizeCategory = cls;
        q.__factLike = FACT_FORMAT_RE.test(String(q0.printFormat || '')) || /^(add|sub|mult|div)_facts$/.test(String(q0.skillId || ''));
    }
    const legacy = template === 'legacy';
    const printSize = getSkillPrintSize(q0.skillId || '', q0.printFormat || '');
    // S2: the supports this item may carry. Until the sheet is allocated it draws the worst case
    // (every support it could carry), which is what it is measured at; the allocation then swaps
    // what it does not draw for invisible reserve, so the geometry is the one measured.
    const supportsBox = { plan: withSupports ? supportPlanFor(g.skill, q, template, size, mix) : null, cur: null, level: 3, mixKey: mix ? mix.key : undefined };
    if (supportsBox.plan) supportsBox.cur = Object.assign({}, supportsBox.plan.extra, { on: supportsBox.plan.worst.slice(), reserve: [] });
    const forceL = !!(supportsBox.plan && supportsBox.plan.forceL);
    // The item's floor size (owner ruling 2026-09-26, LESSON_LIBRARY_PLAN.md 8a): the page's size
    // wherever the item can be drawn at it, else the size its template declares as its floor
    // (`minSize`) - the item keeps its floor and the rest of the page keeps the chosen size. S2
    // touch dots force L the same way.
    const floor = forceL ? 'L' : (sizeFloor(size, cellMinSize(q)) || size);
    const up = floor !== size;
    const atL = (c) => (up && sizeFloor(c.size, floor) !== c.size ? Object.assign({}, c, { size: floor, metrics: resolveCtx({ size: floor, look: c.look }).metrics }) : c);
    // The draw function. `cols` is the section's final column count, handed in by the role:
    // the legacy template picks its size class from it, the fact ladder its digit size.
    const key = cellAnswerKey(q);
    const scalar = (v) => (v === undefined || v === null || typeof v === 'object' ? '' : String(v));
    // A several-part answer (a cloze's parts) is written one part per box, comma separated - the
    // same form as the roles' answerOf (compose.js).
    const parts = (v) => (Array.isArray(v) && v.length && v.every((x) => x !== null && typeof x !== 'object') ? v.map(String).join(', ') : '');
    const answer = scalar(q0.ans) || parts(q0.ans) || scalar(key && key.value);
    /**
     * The draw function. `cols` is the section's final column count; `shown` is a value written
     * INTO the cell's own answer slot in both states (the finished work of Error analysis, a
     * True or False? statement, Reason It's A and B), and `ink: 'trace'` writes it in trace grey
     * (a Model or first Guided cell, scaffold level 3). A registered template draws `shown`
     * through its own `traced` / `wrong` states; a legacy cell through `legacyKeyFill`. When no
     * slot can hold it, the value prints on an answer line under the cell - in both states, so
     * the geometry is still identical (AK-1).
     */
    const render = (c, { cols = 2, shown, ink, prompt, shownSlots, payload } = {}) => {
        let html0 = draw(c, { cols, shown, ink, shownSlots, payload });
        // SCC 3.8 `strings.sentence(q)`: a picture skill that asks for its number sentence
        // ("20 ÷ 5 = 4" under the rings of share-into-groups) gets it as one line of write lines
        // under the picture - never on finished work (a thinking page shows the work only).
        const sf = sentenceOf(q0);
        const hasShown = shown !== undefined && shown !== null && shown !== '';
        if (sf && (!hasShown || ink === 'trace')) html0 += sentenceHtml(sf, c, hasShown ? ink : undefined);
        // The cell's own instruction line goes when the page's instruction line already says it
        // (BD-10: one instruction per section), or when the role asks (`prompt: false`: Error
        // analysis and the thinking roles print their own instruction over finished work).
        return (prompt === false || item.stripPrompt) && cellPrompt ? stripPrompt(html0) : html0;
    };
    const draw = (c, { cols = 2, shown, ink, shownSlots, payload } = {}) => {
        const hasShown = shown !== undefined && shown !== null && shown !== '';
        let st = c.state;
        let wrong = c.wrong;
        if (hasShown) {
            const v = String(shown);
            if (ink === 'trace' && v === answer) st = 'traced';
            else { st = 'wrong'; wrong = { value: v, slots: Object.assign({}, shownSlots || {}) }; }
        }
        const ctx = Object.assign({}, atL(c), { state: legacy && hasShown ? 'blank' : st, wrong, columns: cols, wrapToCell: !!item.wrapToCell, tightRows: !!item.tightRows, options: Object.assign({}, c.options || {}, { factColumns: cols }) });
        // `payload`: a role asks the template for a variant of this cell (Error analysis asks a drawn
        // model for its redraw zone, `fix: 'draw'`); the item itself is never changed. S2: the
        // item's supports ride in the payload the same way (`supports`), so the pupil page, the key
        // and the measurement all draw what the allocator dealt.
        const sp = !legacy && supportsBox.cur ? { supports: supportsBox.cur } : null;
        const pl = sp ? Object.assign({}, sp, payload || {}) : payload;
        const qd = pl && !legacy && q.cell && q.cell.payload ? Object.assign({}, q, { cell: Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, pl) }) }) : q;
        // S2: touch dots need 24 pt digits, so a forced section draws its problems at L inside a
        // smaller page (the preset's custom properties re-set on a wrapper; the page stays M / S).
        const html0 = legacy ? legacyClean(renderCell(q, ctx)) : renderCell(qd, ctx);
        const html = up && sizeFloor(c.size, floor) !== c.size ? `<div class="ws-${floor}" data-ws-force-size="${floor}">${html0}</div>` : html0;
        if (legacy && hasShown) {
            const v = String(shown);
            // A wrong value is written as a pupil would have written it: a place-value mat draws
            // the WRONG model, boxed slots take the wrong value, never the right parts.
            const asQ = v === answer ? q0 : Object.assign({}, q0, { ans: v, target: v, keyParts: undefined, printAnswer: undefined });
            const filled = legacyKeyFill(html.replace(STAMP_RE, ''), asQ, { value: v, display: v }, { ink: ink === 'trace' ? 'trace' : 'solid', shown: true });
            if (filled !== null) return filled;
            return html + shownLine(v, ink);
        }
        if (!legacy || ctx.state !== 'answered') return html;
        // The legacy key: the answer in the pupil's own slot when there is one, else the stamp.
        const filled = legacyKeyFill(html.replace(STAMP_RE, ''), q0, key);
        return filled === null ? html : filled;
    };
    /** Can a value be written into this cell's own slot? (A legacy cell may have no single slot.) */
    let showable = null;
    const canShow = () => {
        if (!answer) return false;
        if (!legacy) return true;
        if (showable === null) {
            try {
                const blankHtml = legacyClean(renderCell(q, resolveCtx({ mode: 'print', size, look: 'ican', state: 'blank' }))).replace(STAMP_RE, '');
                showable = legacyKeyFill(blankHtml, null, { value: answer, display: answer }, { shown: true }) !== null;
            } catch (e) { showable = false; }
        }
        return showable;
    };
    let fp;
    const qFoot = supportsBox.cur ? Object.assign({}, q, { cell: Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, { supports: supportsBox.cur }) }) }) : q;
    try { fp = cellFootprint(qFoot, resolveCtx({ mode: 'print', size: floor, look: 'ican' })); } catch (e) { fp = { wMm: 93, hMm: null, measure: true, maxCols: 2 }; }
    if (legacy) {
        // SCC-A6: a legacy cell is sized by measurement. Its size class caps the columns only for
        // word problems (PT-WPR-1); everything else is decided by what the measurement shows.
        // A long procedure (long division, multi-row multiplication) is at most two columns on
        // every page (PT 2.4's 2 x 2): its legacy markup reflows rather than overflowing when it is
        // squeezed, so the measurement alone would let a divisor wrap above its bracket.
        const long = footprintClass(q, template, printSize) === 'long';
        fp = Object.assign({}, fp, { measure: true, hMm: null, maxCols: printSize === 'spacious' ? 1 : long ? 2 : 6, size: printSize });
    }
    // The cell's own leading instruction line (legacy markup prints the question's stem first:
    // "Write the missing number.", "Add.", "Count. Write how many."). Only an item-independent
    // imperative is a candidate - no digits, no question - so "Draw 9 counters ..." stays.
    let cellPrompt = null;
    if (legacy) {
        try {
            const blankHtml = legacyClean(renderCell(q, resolveCtx({ mode: 'print', size, look: 'ican', state: 'blank' })));
            const m = PROMPT_RE.exec(blankHtml);
            if (m && isGenericPrompt(m[2])) cellPrompt = m[2].trim();
        } catch (e) { cellPrompt = null; }
    }
    // div_facts' fact forms (Long division and Fraction, and Mix's across form, payload `fact`)
    // are measured exactly like the across fact, so a Mix page packs all three in one grid.
    if (isAcrossFact(q, template) || ((template === 'division' || template === 'equation') && q.cell && q.cell.payload && q.cell.payload.fact)) {
        // Its static footprint is the VERTICAL fact's cell height plus a stack's pads (50 mm at
        // L), for one line about 17 mm tall: the measurement is the truth for this one.
        fp = Object.assign({}, fp, { measure: true, hMm: null, tracks: undefined, factLike: false });
    }
    const item = {
        q, render, template, legacy,
        cellPrompt,
        promptKey: cellPrompt ? libraryKeyOf(cellPrompt) : '',
        stripPrompt: false,
        section: sectionIndex,
        skill: `${q.categoryId || ''}:${q.skillId || ''}`,
        answerType: q.answerType || '',
        visual: !!q.visual,
        footprint: fp,
        fclass: footprintClass(q, template, printSize),
        cellCls: (legacy ? 'mq-legacy' : '') + (q.cell && q.cell.payload && q.cell.payload.compact ? ' ws-cell-compact' : ''),
        key,
        canShow,
        // S2: the supports box (shared by every clone a role makes of this item) and what it holds.
        supportsBox,
    };
    return item;
}

/* ------------------------------------------------------ the cell's own instruction line */

/** The first stem line of a legacy cell: a plain `<div>` straight after `.problem-content`. */
const PROMPT_RE = /(<div class="problem-content"[^>]*>\s*)<div (?:class="p-prompt"[^>]*|style="font-size:1rem;margin-bottom:8px;")>([^<]*)<\/div>/;
const stripPrompt = (html) => html.replace(PROMPT_RE, '$1');
const normText = (t) => String(t || '').replace(/_/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/** An instruction that is the same for every item: an imperative, no digits, not a question. */
function isGenericPrompt(text) {
    const t = String(text || '').trim();
    if (!t || /\d|\?/.test(t) || t.split(/\s+/).length > 12) return false;
    return /^(Add|Subtract|Multiply|Divide|Write|Count|Circle|Draw|Check|Fill in|Find|Solve|Use|Read|Look|Trace|Shade|Mark|Match|Measure|Complete|Finish|Show|Make|Say)\b/.test(t);
}

/**
 * The library key whose string the stem says (P-14: page code never composes an instruction; it
 * can only ask for a key). A few legacy stems say a library instruction in other words.
 */
const PROMPT_SYNONYMS = Object.freeze({
    'count. write how many.': 'count-write',
    'count. write the number.': 'count-write',
    'complete the fact family.': '',
});
function libraryKeyOf(text) {
    const n = normText(text);
    if (Object.prototype.hasOwnProperty.call(PROMPT_SYNONYMS, n)) return PROMPT_SYNONYMS[n];
    for (const [k, v] of Object.entries(INSTRUCTION_LIBRARY)) if (!/\{/.test(v) && normText(v) === n) return k;
    return '';
}

/**
 * BD-10 for the items of one section: when the cell's stem IS a library instruction, the
 * section's instruction line prints it (the item's `instructionKey`) and the cell drops it; when
 * the section already prints the skill's own (non-default) instruction, the stem repeats it and
 * is dropped too. A stem the page line does not cover stays in the cell.
 */
function settlePrompts(items, sectionKey) {
    for (const it of items) {
        if (!it.cellPrompt) continue;
        if (it.promptKey) { it.instructionKey = it.promptKey; it.stripPrompt = true; }
        else if (sectionKey && !/^default-/.test(sectionKey)) it.stripPrompt = true;
    }
    return items;
}

/**
 * The fallback place for a shown value when the cell has no single slot to hold it: the legacy
 * answer line at the foot of the cell, drawn exactly where the key's answer stamp sits (it costs
 * no layout, and the measurement already reserves its line, SCC-A6), in both states.
 */
function shownLine(value, ink) {
    const style = ink === 'trace' ? 'color:#949494;' : 'color:#000;';
    return `<div class="ws-legacy-answer mq-shown" data-ws-shown="1"><span class="ws-zone">Answer: </span><b data-ws-ink="${ink === 'trace' ? 'trace' : 'solid'}" style="${style}">${escText(value)}</b></div>`;
}

/* ======================================================================= measurement */

function ensureEngineStyle(doc) {
    if (!doc || doc.querySelector('style[data-mq-sheet-engine-host]')) return;
    const st = doc.createElement('style');
    st.setAttribute('data-mq-sheet-engine-host', '');
    st.textContent = SHEET_ENGINE_CSS;
    (doc.head || doc.documentElement).appendChild(st);
}

/**
 * SCC-A6: measure every item at every column count the layout may choose. The cell is drawn in
 * a hidden `.ws-sheet` root at the exact inner width it will have in the printed grid, with its
 * label, in both states (the key's answer stamp costs no layout, but its height is reserved so
 * it never covers the problem). Records, per column count:
 *   hMm   the whole cell's height (pads, label and stamp reserve included)
 *   fits  false when anything overflows the cell's content box, is clipped by an ancestor,
 *         or is a picture drawn narrower than it is at one column (DN-10: content never shrinks
 *         with columns)
 */
/** Why a column count did not fit, kept on the item (the dialog note and the tests read it). */
function why(it, c, reason) {
    it.measureWhy = it.measureWhy || {};
    if (!it.measureWhy[c]) it.measureWhy[c] = String(reason).slice(0, 80);
}

function measureItems(items, { size, look, colsList }) {
    if (typeof document === 'undefined' || !document.body || !items.length) return;
    ensureEngineStyle(document);
    const s = SIZES[size] || SIZES.L;
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;left:-10000px;top:0;width:220mm;visibility:hidden;pointer-events:none;contain:layout;';
    host.innerHTML = `<div class="ws-sheet ws-${size} ws-${look} ws-tab${s.tabMm}" style="display:block;max-width:none;width:220mm;overflow:visible"></div>`;
    document.body.appendChild(host);
    const root = host.firstChild;
    const cols = [...new Set([1, ...colsList])].sort((a, b) => a - b);
    const baseW = new Map();          // item -> Map(svg index -> width at 1 column)
    const baseLeaves = new Map();     // item -> widths of its grid / table leaves at 1 column
    try {
        for (const c of cols) {
            const { inner } = cellWidthMm(c, LIVE_W_MM, look);
            for (const it of items) {
                let best = { hMm: 0, fits: true };
                for (const state of ['blank', 'answered']) {
                    const ctx = Object.assign(resolveCtx({ mode: 'print', look, size, paper: 'A4', scaffoldLevel: it.measureLevel || 1, state }), it.wrapToCell ? { wrapToCell: true } : {}, it.tightRows ? { tightRows: true } : {});
                    let body = '';
                    try { body = it.render(ctx, { cols: c }); } catch (e) { body = ''; }
                    root.innerHTML = `<div class="ws-cell ${it.cellCls || ''}" style="width:${inner}mm;height:auto;min-height:0;">`
                        + `<span class="ws-letter">m.</span>${body}</div>`;
                    const cell = root.firstChild;
                    const r = cell.getBoundingClientRect();
                    const cs = getComputedStyle(cell);
                    const padL = parseFloat(cs.paddingLeft) || 0;
                    const padR = parseFloat(cs.paddingRight) || 0;
                    let hPx = r.height;
                    let fits = true;
                    let slackPx = Infinity;
                    let contentBottom = r.top;
                    let stampH = 0;
                    const pics = [];
                    const leaves = [];
                    for (const el of cell.querySelectorAll('*')) {
                        const er = el.getBoundingClientRect();
                        if (!er.width && !er.height) continue;
                        const ecs = getComputedStyle(el);
                        if (ecs.position === 'absolute') {
                            if (el.classList.contains('ws-legacy-answer')) stampH = Math.max(stampH, er.height);
                            continue;
                        }
                        if (el.closest('.ws-legacy-answer')) continue;
                        contentBottom = Math.max(contentBottom, er.bottom);
                        // CL-8: how near the drawing comes to the cell's side borders (its leaves,
                        // the label aside) - a role choosing columns keeps 3 mm (critic R4 R-4)
                        if ((!el.children.length || el.tagName === 'svg') && !el.closest('.ws-letter') && !(el.parentElement && el.parentElement.closest('svg'))) {
                            slackPx = Math.min(slackPx, er.left - r.left, r.right - er.right);
                        }
                        if (er.right > r.right - padR + 1 || er.left < r.left + padL - 1) { fits = false; why(it, c, `x ${el.tagName}.${el.className} +${((er.right - (r.right - padR)) / PX_PER_MM).toFixed(1)}mm w${(er.width / PX_PER_MM).toFixed(1)} of ${((r.width - padL - padR) / PX_PER_MM).toFixed(1)}`); }
                        // A clip under 1 mm is a stroke or a line box, not hidden content.
                        if ((ecs.overflowX === 'hidden' || ecs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + PX_PER_MM) { fits = false; why(it, c, `ox ${el.tagName}.${el.className}`); }
                        if ((ecs.overflowY === 'hidden' || ecs.overflowY === 'clip') && el.scrollHeight > el.clientHeight + PX_PER_MM) { fits = false; why(it, c, `oy ${el.tagName}.${el.className}`); }
                        if (el.tagName === 'svg' || el.tagName === 'IMG' || el.tagName === 'CANVAS') pics.push(er.width);
                        // A chart or table squeezed into a narrow column: its numbers touch the
                        // cell walls and run together ("100110"). A leaf of a grid or table is
                        // cramped when it is narrower than it is at one column AND its text now
                        // fills it (a box drawn exactly two digits wide at every width is not).
                        if (state === 'blank' && !el.children.length && el.textContent.trim().length >= 2) {
                            const pd = el.parentElement ? getComputedStyle(el.parentElement).display : '';
                            if (/grid|table/.test(pd) || /table-cell/.test(ecs.display)) {
                                const k = leaves.length;
                                leaves.push(er.width);
                                const w1 = (baseLeaves.get(it) || [])[k];
                                if (c !== cols[0] && w1 && er.width < w1 * 0.9) {
                                    const rg = document.createRange();
                                    rg.selectNodeContents(el);
                                    const tw = rg.getBoundingClientRect().width;
                                    if (tw > er.width - 0.8 * PX_PER_MM) { fits = false; why(it, c, `cramp ${el.tagName} ${el.textContent.trim()}`); }
                                }
                            }
                        }
                    }
                    // The key's answer stamp sits at the foot of the cell and costs no layout
                    // (AK-1); its line is reserved under the content so it never covers it.
                    if (stampH) hPx = Math.max(hPx, contentBottom - r.top + 1 * PX_PER_MM + stampH + 1.5 * PX_PER_MM);
                    if (state === 'blank') {
                        if (c === cols[0]) { baseW.set(it, pics); baseLeaves.set(it, leaves); }
                        else {
                            // DN-10: a picture never shrinks to fit a narrower column. A registered
                            // visual is held to that exactly; a legacy picture declares no minimum
                            // size (RP-3's minimums belong to the templates that replace it), so a
                            // scale-down of up to 10% is read as the same picture.
                            const tol = it.legacy ? 0.9 : 0.98;
                            const b = baseW.get(it) || [];
                            // (A lesson chart's other example draws its number line to the
                            // column on purpose, `scalesWithCols`: not a shrunk picture.)
                            if (!it.scalesWithCols && pics.some((w, k) => b[k] && w < b[k] * tol - 0.5)) { fits = false; why(it, c, 'shrunk picture'); }
                        }
                    }
                    // A role that places part of the cell in one of several ways (error analysis,
                    // AX-4: the Correct / Fix-it block in ONE place on every cell of a page) names
                    // them in `judgeModes`; each is drawn and measured here, and the role picks the
                    // one the whole page can use. null: that way does not fit (or does not apply).
                    const vary = {};
                    const inkW = best.inkW || {};
                    if (fits && Array.isArray(it.judgeModes)) {
                        const grow = (Math.max(hPx, r.height) - r.height) / PX_PER_MM;
                        for (const mode of it.judgeModes) {
                            let mb = '';
                            try { mb = it.render(ctx, { cols: c, judge: mode }); } catch (e) { mb = ''; }
                            if (!mb || !String(mb).includes(`data-judge-mode="${mode}"`)) { vary[mode] = null; continue; }
                            root.innerHTML = `<div class="ws-cell ${it.cellCls || ''}" style="width:${inner}mm;height:auto;min-height:0;">`
                                + `<span class="ws-letter">m.</span>${mb}</div>`;
                            const mc = root.firstChild;
                            const cr = mc.getBoundingClientRect();
                            let over = false;
                            // the ink's width: the leftmost to the rightmost drawn thing (a text run, a
                            // box, a picture), so the role can tell a one-line item in a full-width
                            // cell (half of it empty) from one that fills it (critic EA r5, H13 W)
                            let lo = Infinity, hi = -Infinity;
                            for (const el of mc.querySelectorAll('*')) {
                                const er = el.getBoundingClientRect();
                                if ((!er.width && !er.height) || getComputedStyle(el).position === 'absolute') continue;
                                if (er.right > cr.right - padR + 1 || er.left < cr.left + padL - 1) { over = true; break; }
                                const leaf = !el.children.length || el.tagName.toLowerCase() === 'svg';
                                if (leaf && !el.closest('.ws-letter') && !(el.parentElement && el.parentElement.closest('svg'))) { lo = Math.min(lo, er.left); hi = Math.max(hi, er.right); }
                            }
                            vary[mode] = over ? null : cr.height / PX_PER_MM + grow;
                            if (!over && hi > lo) inkW[mode] = Math.max(inkW[mode] || 0, (hi - lo) / PX_PER_MM);
                        }
                    }
                    const modes = Object.assign({}, best.modes || {});
                    for (const mode of Object.keys(vary)) modes[mode] = vary[mode] === null || modes[mode] === null ? null : Math.max(modes[mode] || 0, vary[mode]);
                    best = { hMm: Math.max(best.hMm, hPx / PX_PER_MM), fits: best.fits && fits, modes, inkW,
                        slackMm: Math.min(best.slackMm === undefined ? Infinity : best.slackMm, slackPx / PX_PER_MM) };
                }
                it.measured = it.measured || {};
                it.measured[c] = { hMm: Math.ceil(best.hMm * 10) / 10, fits: best.fits };
                if (Number.isFinite(best.slackMm)) it.measured[c].slackMm = Math.floor(best.slackMm * 10) / 10;
                if (best.modes && Object.keys(best.modes).length) {
                    it.measured[c].modes = {};
                    for (const [mode, h] of Object.entries(best.modes)) it.measured[c].modes[mode] = h === null ? null : Math.ceil(h * 10) / 10;
                    it.measured[c].inkW = {};
                    for (const [mode, w] of Object.entries(best.inkW || {})) it.measured[c].inkW[mode] = Math.ceil(w * 10) / 10;
                    it.measured[c].innerMm = inner;
                }
            }
        }
        // A MINIMUM COLUMN WIDTH for legacy markup that reflows instead of overflowing (an area
        // model whose part boxes wrap into a pile, a chart window whose rows break): when a
        // narrower column makes the cell much taller than it is at one column, the content has
        // collapsed, and that column count does not fit (DN-10: content never shrinks or
        // re-arranges to fit). A wrapped line of text costs a few mm and is not a collapse.
        for (const it of items) {
            // S2: a support stands BESIDE its problem where the cell is wide enough and under it
            // where it is not, so a wide cell is shorter by design, not a collapse.
            if (it.supportsBox && it.supportsBox.plan) continue;
            if (it.colsLayout) continue;   // a role that lays the cell out per column count on purpose (Error analysis)
            // A template that re-stacks its zones by width on purpose (the word-work cell puts
            // its answer beside the columns at full width, under them in a column) is not a collapse.
            if (it.footprint && it.footprint.restacks) continue;
            const m = it.measured || {};
            const base = m[cols[0]] && m[cols[0]].hMm;
            if (!base) continue;
            for (const c of cols.slice(1)) {
                if (m[c] && m[c].hMm > base * 1.3 && m[c].hMm - base > 12) { m[c].fits = false; why(it, c, 'reflow'); }
            }
        }
    } finally {
        host.remove();
    }
}

/** HD-14: how many lines the title takes at the preset size, measured in Andika 700. */
function measureTitleLines(text, size) {
    if (!text || typeof document === 'undefined' || !document.body) return 1;
    const s = SIZES[size] || SIZES.L;
    const span = document.createElement('span');
    span.style.cssText = `position:absolute;left:-10000px;top:0;visibility:hidden;white-space:nowrap;font-family:'Andika',sans-serif;font-weight:700;font-size:${s.titlePt}pt;font-feature-settings:"cv04" 1;`;
    span.textContent = text;
    document.body.appendChild(span);
    const wMm = span.getBoundingClientRect().width / PX_PER_MM;
    span.remove();
    return wMm <= LIVE_W_MM - 0.6 ? 1 : 2;
}

/* ==================================================================== the one entry point */

async function fontsReady() {
    try { if (typeof document !== 'undefined' && document.fonts) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]); } catch (e) { /* print anyway */ }
}

/** The column counts a section's layout may choose, so each gets measured. */
function candidateCols(columns, size) {
    // Dense packing (layout.js) may take an Auto section up to DENSE_MAX_COLS_AT[size] columns, so
    // every count it may choose is measured (an unmeasured count would be read as fitting: facts
    // at S in 5 columns stuck out of their 36.8 mm cells by 0.5 mm, critic guided-r1 lint).
    if (columns === 'auto') return Array.from({ length: Math.max(4, DENSE_MAX_COLS_AT[size] || DENSE_MAX_COLS) }, (_, i) => i + 1);
    return Array.from({ length: Math.max(1, columns) }, (_, i) => i + 1);
}

// The teacher footer prints each skill's primary CCSS code (HD-6: codes appear only there). The
// map lives in standards.js, which is loaded on the first print rather than at boot.
let standardsMod = null;
async function loadStandards() {
    if (standardsMod) return standardsMod;
    try { standardsMod = await import('./standards.js'); } catch (e) { standardsMod = null; }
    return standardsMod;
}
function primaryCcss(sk) {
    try {
        if (!standardsMod) return '';
        const code = standardsMod.primaryStandard(sk.categoryId, sk.skillId, { short: true });
        if (code) return code;
        // A skill tagged to its CLOSEST standard (temperature: CCSS names no thermometer) still
        // prints that code, marked as the closest - never a footer with no standard at all
        // (critic EA r5, D).
        const e = standardsMod.standardsEntry(sk.categoryId, sk.skillId);
        if (e && e.approx && e.ccss && e.ccss.length) {
            const short = String(e.ccss[0]).replace(/\.([A-Z])\.(\d+)$/, '.$2');
            return `≈ ${short}`;
        }
    } catch (e) { return ''; }
    return '';
}

/**
 * The levels a skill printed as "M" (every level) really spans: the grades of its CCSS codes, or
 * of the skills its review pool deals. A page is never tabbed "All levels" / "Grade mixed" when its
 * content has a level (critic EA r5, D: number_chart_fill, mixed_placevalue).
 */
function spanGrades(sk) {
    const G = ['K', '1', '2', '3', '4', '5', '6'];
    const gradeOfCode = (c) => { const m = /^(K|\d)\./i.exec(String(c)); return m ? m[1].toUpperCase() : ''; };
    const out = new Set();
    try {
        const e = standardsMod && standardsMod.standardsEntry(sk.categoryId, sk.skillId);
        (e && e.ccss ? e.ccss : []).map(gradeOfCode).filter((g) => G.includes(g)).forEach((g) => out.add(g));
        if (!out.size && isMixedMetaSkill(sk.skillId)) {
            for (const id of getMixedPoolSkills(sk.categoryId, sk.skillId) || []) {
                const g = String(getSkillGrade(id, sk.categoryId) || '').toUpperCase();
                if (G.includes(g)) out.add(g);
            }
        }
    } catch (e) { /* keep none */ }
    return [...out].sort((a, b) => G.indexOf(a) - G.indexOf(b));
}

/**
 * The "I Can" title a fact drill's OPTIONS give it (P-31, OPTIONS-CRITIC-R2 §5 #15), or '' to
 * keep the skill's own. A ticked fact set names the page ("I Can add 6"), and a fact band other
 * than the default is said too ("I Can add 6 (facts to 10)", "I Can add facts to 10").
 * factSetTitle() owns the set's name, so the header, the cell label and the key agree.
 */
function optionTitleBase(sk, baseICan) {
    let set = '', bandDef = null, band;
    try {
        set = factSetTitle(sk.categoryId, sk.skillId, sk.opts || {});
        if (set || optionsFor(sk.categoryId, sk.skillId).some((d) => d.id === 'constant')) {
            bandDef = optionsFor(sk.categoryId, sk.skillId).find((d) => d.id === 'band') || null;
            band = bandDef ? normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {}).band : undefined;
        }
    } catch (e) { return ''; }
    const bandMoved = bandDef && band !== undefined && band !== null && band !== bandDef.default;
    const hit = bandMoved ? (bandDef.values || []).find((x) => x.v === band) : null;
    const bandPhrase = hit ? `${String(bandDef.label).toLowerCase()} ${hit.l}` : '';
    if (set) return `I Can ${set.charAt(0).toLowerCase()}${set.slice(1)}${bandPhrase ? ` (${bandPhrase})` : ''}`;
    if (!bandPhrase) return '';
    // A mixed page: the skill's own title with its default bound swapped for the chosen one
    // ("I Can add facts to 20" -> "to 10"; the ×/÷ tables name their largest factor).
    const tok = (v) => (v === 144 ? '12' : v === 100 && bandDef.default === 144 ? '10' : String(v));
    const re = new RegExp(`\\bto ${tok(bandDef.default)}\\b`);
    return re.test(baseICan) ? baseICan.replace(re, `to ${tok(band)}`) : `${baseICan} (${bandPhrase})`;
}

/** The page title for the chosen options; a count-by row of 15 jumps says so; the tables stay 1 to 12 (wave 1 lane C). */
function optionTitle(sk, baseICan) {
    const t = optionTitleBase(sk, baseICan);
    try {
        if (sk.skillId === 'count_by_tables' && Number(normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {}).jumps) === 15) {
            const base = t || baseICan || '';
            return /\(15 jumps\)/.test(base) ? base : `${base} (15 jumps)`;   // the tables stay 1 to 12; the row is 15 jumps long
        }
    } catch (e) { /* keep the base title */ }
    return t;
}

/** Skill metadata the frame prints: label, level, and the strings the role reads. */
function skillMeta(sk, q) {
    // A ranged + / − id whose band (or regrouping, on a _mixed id) is set below its own name
    // deals a lower rung: the page is titled and labelled by that rung, never by a band it is not
    // printing (OPTIONS-CRITIC-R2 §5 #15). Every other skill names itself.
    let nameId = sk.skillId;
    try { nameId = opsRoutedSkill(sk.categoryId, sk.skillId, sk.opts || {}) || sk.skillId; } catch (e) { nameId = sk.skillId; }
    if (nameId !== sk.skillId && !SKILL_FULL_LABELS[nameId]) nameId = sk.skillId;
    const label = SKILL_FULL_LABELS[nameId] || (q && q.skillLabel) || sk.skillId;
    let grade = null;
    try { grade = getSkillGrade(sk.skillId, sk.categoryId); } catch (e) { grade = null; }
    const meta = { categoryId: sk.categoryId, skillId: sk.skillId, label, grade: grade === null || grade === undefined ? '' : String(grade), ccss: sk.ccss || primaryCcss(sk) };
    if (!/^(K|[1-6])$/i.test(meta.grade)) {
        const span = spanGrades(sk);
        if (span.length) { meta.grades = span; meta.grade = span[0]; }
    }
    // Wave 1 lane C2: count_by_tables titles itself from its options (a typed step, counting back, a typed start).
    let titleOpts = {};
    if (sk.skillId === 'count_by_tables') {
        try {
            const no = normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {});
            // the one-page sheet prints only the rows that fit: the title names those, in the order they print
            if (no.onePage && no.rows && no.rows.length) no.rows = onePageRows(no.rows);
            titleOpts = { opts: no };
        } catch (e) { titleOpts = {}; }
    }
    const words = skillWords(Object.assign({ answerType: q && q.answerType, printFormat: q && q.printFormat }, meta, titleOpts, { skillId: nameId }));
    meta.iCan = sk.iCan || optionTitle(sk, words.iCan) || words.iCan;
    meta.instructionKey = q ? instructionKeyFor(q, words) : words.instructionKey;
    // (a lesson ref's own library key - the detailed lesson maker, lesson 2 - wins on every band)
    if (typeof sk.instructionKey === 'string' && INSTRUCTION_LIBRARY[sk.instructionKey]) meta.instructionKey = sk.instructionKey;
    return meta;
}

/**
 * A problem that only ever prints one column (a word problem, a wide picture, a three-clock row,
 * a time line). practice.js `splitWide` puts such problems in a full-width group at the bottom
 * of a section whose other problems keep their columns (owner ruling 2026-09-25).
 */
function oneColumnOnly(it, n) {
    try { return it.fclass === 'word' || it.fclass === 'wide' || itemCap(itemInfo(it, { size: n.size, look: n.look, paper: n.paper, mode: 'print' })) < 2; } catch (e) { return false; }
}

/**
 * One-section layout for a set of host items, exactly as the role will compute it. A practice
 * section that mixes problems of both kinds (a review pool: Mixed Time deals clock faces and time
 * lines) is split by the role, so its capacity is the split page's: the narrow problems in their
 * columns, the full-width ones under them, one row each (2026-09-25, AP4: Mixed Time printed three
 * clocks a page in one column because two of its nine skills are full width).
 */
function layoutOf(role, section, items, n, ctx) {
    const base = { role, columns: section.columns, count: items.length, floor: section.floor, gridH: section.gridH, dense: section.dense, maxCols: section.maxCols, noCap: section.noCap };
    const opts = { size: n.size, look: n.look, header: ctx.header };
    const whole = resolveSectionLayout(base, items, ctx.paper, LIVE_W_MM, opts);
    if (!(role === 'independent' || role === 'more-practice') || (n.anchors && n.anchors !== 'off') || section.gridH || items.length < 2) return whole;
    const wide = items.filter((it) => oneColumnOnly(it, n));
    const narrow = items.filter((it) => !oneColumnOnly(it, n));
    if (!wide.length || !narrow.length) return whole;
    const Ln = resolveSectionLayout(Object.assign({}, base, { count: narrow.length, floor: floorOf(narrow) }), narrow, ctx.paper, LIVE_W_MM, opts);
    if (Ln.cols <= whole.cols) return whole;
    const Lw = resolveSectionLayout(Object.assign({}, base, { columns: 1, count: wide.length, floor: null }), wide, ctx.paper, LIVE_W_MM, opts);
    // How many of the run a page holds: the items come in the order they are dealt (the probe is
    // the start of the run), so the first N are counted exactly; past the probe, the probe's share
    // of full-width problems is assumed.
    // The narrow group's rows and the wide group's rows are drawn at their layouts' cell heights;
    // the wide group shares the section's instruction line (paginate.js placeSections).
    const G = Ln.gridH;
    const hN = splitCellH(Ln), hW = splitCellH(Lw);
    const isWide = items.map((it) => oneColumnOnly(it, n));
    const f = wide.length / items.length;
    const count = (Gm, a, b, Lna, Lwa, squeeze) => {
        let n = 1;
        for (let N = 2; N <= 40; N++) {
            const nw = N <= items.length ? isWide.slice(0, N).filter(Boolean).length : Math.round(N * f);
            const nn = N - nw;
            const rowsN = Math.ceil(nn / Lna.cols);
            if (rowsN * a + nw * b > Gm - 0.99 && !(squeeze && splitPairH(a, Lna.hMin, rowsN, b, Lwa.hMin, nw, Gm - 1.01))) break;
            n = N;
        }
        return n;
    };
    let best = count(G, hN, hW, Ln, Lw, false);
    // Wave 5.2 (critic nl-r4 D1 / D2): with the number-line band the two parts' rows give up their
    // slack (practice.js splitPairH, as the role lays them out), up to the count the page holds
    // without the band - never more, so the band never packs a page tighter than its absence.
    if (Number(ctx.header && ctx.header.refBandMm) > 0) {
        const opts0 = Object.assign({}, opts, { header: Object.assign({}, ctx.header, { refBandMm: 0 }) });
        const Ln0 = resolveSectionLayout(Object.assign({}, base, { count: narrow.length, floor: floorOf(narrow) }), narrow, ctx.paper, LIVE_W_MM, opts0);
        const Lw0 = resolveSectionLayout(Object.assign({}, base, { columns: 1, count: wide.length, floor: null }), wide, ctx.paper, LIVE_W_MM, opts0);
        if (Ln0.cols === Ln.cols) {
            const off = count(Ln0.gridH, splitCellH(Ln0), splitCellH(Lw0), Ln0, Lw0, false);
            best = Math.max(best, Math.min(off, count(G, hN, hW, Ln, Lw, true)));
        }
    }
    return Object.assign({}, Ln, { perPage: best, splitWide: true });
}

/**
 * The measured worst case of a set of items, per column count: the tallest cell, and whether all
 * fit. With `ctx` ({size, look, paper}) it also records whether all fit with the AUTO margins
 * (`autoFits`, DN-15). Without it, an Auto section sized from its probe (say 3 columns, because
 * one probed stacked item is too wide for 4 under the Auto slack) could be laid out again from
 * the few items finally kept (all narrow facts, so 4 columns): the count was dealt for 3 columns,
 * the grid drew 4, and a blank run appeared after the last item (PT-ENG-9, PG-15).
 */
function floorOf(items, ctx = null) {
    const out = {};
    // A mixed section's full-width problems are split off into a group of their own (practice.js
    // splitWide), so they do not set the floor of the problems that keep their columns.
    if (ctx && items.length > 1) {
        const narrow = items.filter((it) => !oneColumnOnly(it, ctx));
        if (narrow.length && narrow.length < items.length) items = narrow;
    }
    for (const it of items) {
        for (const [c, m] of Object.entries(it.measured || {})) {
            const f = out[c] || (out[c] = { hMm: 0, fits: true });
            f.hMm = Math.max(f.hMm, m.hMm || 0);
            f.fits = f.fits && m.fits !== false;
            if (ctx) f.autoFits = f.autoFits !== false && autoFitsAt(it, Number(c), { size: ctx.size, look: ctx.look, paper: ctx.paper, availableWidthMm: LIVE_W_MM });
        }
    }
    return out;
}

/* ================================================================ S5 / S6 anchor problems */

const ANCHOR_FIRST = 6;           // candidates generated before the page capacity is known
const ANCHOR_MAX = 48;            // candidates per skill at most (side by side on a long run)

/**
 * The worked examples of ONE skill (design/SUPPORTS.md S5-S6). Candidates are generated under
 * their OWN seeds (never a pupil item's seed), sorted easy-first (research: easy numbers first),
 * drawn as anchors and measured, so the page reserves a band that holds any of them.
 * `take(pupilItems, count)` then picks examples that are none of the pupil's problems (review
 * note 5: an anchor is a sibling item, never the same item).
 */
function anchorSet(sk, si, n, { variant, colsList, twinCols }) {
    const cands = [];
    const seen = new Set();
    let next = 0;
    let eligible = null;
    const base = ((n.seed ^ 0x2545F491) + si * 65537) >>> 0;
    const grow = (want) => {
        const fresh = [];
        while (cands.length < Math.min(want, ANCHOR_MAX) && next < ANCHOR_MAX * 3) {
            const seed = (base + next * 7919) >>> 0;
            next++;
            let q = null;
            try { q = generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed, itemIndex: 0 }); } catch (e) { q = null; }
            if (!q || seen.has(signature(q))) continue;
            seen.add(signature(q));
            const it = hostItem({ q, skill: sk }, si, n.size, { supports: false });
            if (eligible === null) eligible = anchorEligible(it);
            if (!eligible) return;
            const a = anchorItem(it, { variant, twinCols });
            cands.push(a);
            fresh.push(a);
        }
        if (fresh.length) measureItems(fresh, { size: n.size, look: n.look, colsList });
        // Easy numbers first; a stable order, so the same seed reprints the same examples.
        cands.sort((x, y) => easeScore(x.source.q) - easeScore(y.source.q) || signature(x.source.q).localeCompare(signature(y.source.q)));
    };
    grow(ANCHOR_FIRST);
    return {
        get eligible() { return !!eligible; },
        get items() { return cands; },
        grow,
        /** The band height every candidate fits in (mm). */
        // The easiest few are the ones a page uses; a later, taller one is never picked into a
        // band that cannot hold it (see `take` callers).
        heightMm: (cols = 1) => Math.max(0, ...cands.slice(0, 3).map((a) => anchorHeightMm(a, cols))),
        /** `count` examples that are none of the pupil items (cycled if the skill runs out). */
        take(pupil, count) {
            const sigs = new Set(pupil.filter((it) => it && it.q).map((it) => signature(it.q)));
            const sigOf = (a) => signature(a.source.q);
            const free = () => cands.filter((a) => !sigs.has(sigOf(a))).length;
            if (free() < count) grow(cands.length + count - free() + 2);
            return pickDistinct(cands, sigs, count, sigOf);
        },
    };
}

/** What a build did with anchors, for the dialog and the tests: the mode, each example, the notes. */
function anchorSummary(mode, list, notes) {
    const seen = new Set();
    const examples = [];
    for (const a of list) {
        if (!a || !a.source || seen.has(a)) continue;
        seen.add(a);
        examples.push({ section: a.section, pool: a.pool, variant: a.anchor, skill: a.skill, text: String(a.source.q.text || ''), ans: a.source.q.ans, sig: signature(a.source.q), measured: a.measured });
    }
    return { mode, examples, notes: notes.slice() };
}

/**
 * Build a sheet.
 *
 * @param {Object} req
 * @param {string} req.role                 any of SHEET_ROLES: 'independent', 'more-practice', and the
 *        P7.2b roles 'opener', 'scripted-model', 'guided', 'error-analysis', 'review', 'test'
 *        ('test-b' = Form B), 'pre-skill-check', 'word-problems', 'fact-rows', 'fact-probe',
 *        'mixed-practice', 'true-false', 'reason-it', 'stretch' (the print screen's names in
 *        ROLE_ALIASES are accepted too). A fact layout asked of a non-fact skill throws an
 *        Error with `unsupported: true` and the reason, which the print screen shows.
 * @param {{skills: {categoryId, skillId, opts?, weight?}[], count?: number|'auto', pages?: number,
 *          columns?: 'auto'|number, instructionKey?: string}[]} req.sections
 * @param {'S'|'M'|'L'} [req.size]           default 'L'
 * @param {'auto'|'ican'|'daily'} [req.look] default 'auto' (= I Can on these roles)
 * @param {'A4'|'Letter'} [req.paper]        default 'A4'
 * @param {Object} [req.header]              {name, date, score, tab, title, lesson}; false hides a part
 * @param {number} [req.seed]                the same seed reprints the same sheet
 * @param {string} [req.form]                'A'
 * @param {boolean} [req.key]                default true
 * @param {string[]} [req.letters]           More Practice: which letters (default from the count)
 * @returns {Promise<{pupilHtml, keyHtml, pageCount, keyPageCount, fits, items, plan, seed, notes}>}
 */
/**
 * Wave 5.2: the number line a sheet asks for - the first skill on it that offers the line
 * (skill-options.js numberLineFits) with it ticked on. null when none does. `sections` = the
 * sections whose numbers the line must cover (every section of a skill that asked for it).
 */
// Wave 5.2: the check pages that carry no hint scaffold by default (P-SC-5: hints on tests are
// the teacher's option, `req.testHints`).
const NO_HINT_ROLES = new Set(['test', 'pre-skill-check', 'fact-probe']);
/**
 * Draw the line from the page's own items into the band reserved for it (`nline.hMm`) and put it
 * on `header`. ONE line per page, shared by every section that asked for it (a mixed page draws
 * one line covering all their numbers): one reference in one place, one reserved height, so the
 * capacity of every section is decided once and a pupil never meets two different scales.
 */
function drawNumberLine(nline, items, size, header) {
    // The skill's own line (one per skill and options, every role alike: critic nl-r1 D6), widened
    // only by the page's items; several skills share one merged line (D8).
    let spec = mergedLine(nline.reqs, items.map((it) => it.q));
    let band = refLineHTML(spec, { size, widthMm: LIVE_W_MM, hMm: nline.hMm });
    if (band.natural > nline.hMm + 0.05) {
        spec = mergedLine(nline.reqs.map((r) => Object.assign({}, r, { opts: Object.assign({}, r.opts, { nlStep: stepName(nline.spec0.step) }) })), items.map((it) => it.q));
        band = refLineHTML(spec, { size, widthMm: LIVE_W_MM, hMm: nline.hMm });
    }
    header.refBand = band.html;
    return { from: spec.from, to: spec.to, step: stepName(spec.step), covers: spec.covers, missing: spec.missing, hMm: nline.hMm, notes: band.notes.concat(spec.notes || []), warn: spec.warn };
}

/**
 * Wave 5.2 (critic nl-r4 D1, nl-r5 D2): the page-count rule's last resort. While the plan runs
 * past the `wanted` pages, the section with the most items gives up its last one and the page is
 * planned again (`replan(items)` -> plan). `items` is changed in place. Returns {plan, trimmed}.
 */
export function trimToPages(plan, items, wanted, replan) {
    let trimmed = 0;
    for (let guard = 0; plan.pages.length > wanted && guard < 24; guard++) {
        const bySec = new Map();
        items.forEach((it, i) => { const si = Number(it.section) || 0; if (!bySec.has(si)) bySec.set(si, []); bySec.get(si).push(i); });
        const donor = [...bySec.entries()].filter(([, ix]) => ix.length > 1).sort((x, y) => y[1].length - x[1].length)[0];
        if (!donor) break;
        items.splice(donor[1][donor[1].length - 1], 1);
        trimmed++;
        plan = replan(items);
    }
    return { plan, trimmed };
}

/**
 * Wave 5.2: the skills of a sheet that ask for the number line (skill-options.js numberLineFits,
 * ticked on), the sections they hold, and the band reserved for their ONE merged line before any
 * capacity is worked out. null when none asks.
 */
function numberLineRequest(n) {
    const reqs = [];
    const sections = new Set();
    const keys = new Set();
    n.sections.forEach((sec, si) => {
        for (const sk of sec.skills) {
            if (!numberLineFits(sk.categoryId, sk.skillId)) continue;
            const o = normalizeOptions(sk.categoryId, sk.skillId, sk.opts || {});
            if (!o.nlOn) continue;
            sections.add(si);
            const k = `${sk.categoryId}:${sk.skillId}`;
            if (!keys.has(k)) reqs.push({ categoryId: sk.categoryId, skillId: sk.skillId, opts: sk.opts || {} });
            keys.add(k);
        }
    });
    if (!reqs.length) return null;
    const spec0 = mergedLine(reqs, []);
    if (!spec0) return null;
    const band0 = refLineHTML(spec0, { size: n.size, widthMm: LIVE_W_MM });
    return { reqs, sections, keys, spec0, hMm: band0.hMm, html: band0.html };
}

/**
 * SF-34: touch numerals never print under 24 pt, so on an S / M page the touch cells are raised
 * (stacks and sentences to L, 28 pt; facts to 24 pt or more). The fit line says so instead of
 * naming the page's own digit size alone.
 */
function touchFitLine(line, html, size) {
    if (size === 'L' || !/ws-tn/.test(html || '')) return line;
    const stack = /class="ws-stack/.test(html), fact = /class="ws-fact/.test(html);
    const what = stack && fact ? 'touch-dot cells 24-28 pt' : stack ? 'touch-dot cells 28 pt' : 'touch-dot facts 24 pt or more';
    return line.replace(/Digits (\d+) pt\./, (m, pt) => `Digits ${pt} pt; ${what}.`);
}

async function buildSheetCore(req = {}) {
    setOnePagePaper(req.paper);      // before the request is read: it counts the one-page rows the paper holds
    const n = normaliseRequest(req);
    if (!n.sections.length) throw new Error('buildSheet: no section has a skill');
    await fontsReady();
    await loadStandards();
    const paper = n.paper;

    // The frame words decide the header height, which decides gridH (HD-12 / HD-14): resolve the
    // title first, from the first item of each skill.
    const firstQ = new Map();
    const metaOf = (sk) => {
        const key = `${sk.categoryId}:${sk.skillId}`;
        if (!firstQ.has(key)) {
            let q = null;
            try { q = generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed: n.seed, itemIndex: 0 }); } catch (e) { q = null; }
            firstQ.set(key, skillMeta(sk, q));
        }
        return firstQ.get(key);
    };
    if (n.role === 'lesson') return buildLesson(n, metaOf);
    if (!PRACTICE_ROLES.has(n.role)) return buildRoleSheet(n, metaOf);

    // DN-31 / DN-34: a section of several skills is GROUPED, never silently mixed - one
    // sub-section per skill, in the order the teacher listed them, each with its own library
    // instruction. A counted section is dealt into the sub-sections by weight; a page-driven one
    // shares its page(s) between them (see `shareRows` below).
    n.sections = n.sections.flatMap((sec, gi) => {
        if (sec.skills.length < 2) return [Object.assign({}, sec, { group: null })];
        const dealt = sec.count ? dealSkills(sec.skills, sec.count) : null;
        const w = sec.skills.map((k) => Math.max(0, Number(k.weight || k.percent) || 0));
        const tw = w.reduce((a, b) => a + b, 0);
        return sec.skills.map((k, i) => Object.assign({}, sec, {
            skills: [k],
            count: dealt ? dealt.filter((x) => x === k).length || null : null,
            instructionKey: undefined,
            group: { id: gi, share: tw > 0 ? w[i] / tw : 1 / sec.skills.length },
        })).filter((x) => !dealt || x.count);
    });
    // S2: a sheet of ONE section whose skill ticks supports that clash, mixed section by section,
    // becomes one sub-section per alternative (section A touch dots, section B dot tiles). Each
    // sub-section lays out and reserves room for its OWN support only, so a page is as full as it
    // is without supports, less that support's own size.
    const unsplit = n.sections;
    if (n.sections.length === 1 && n.role === 'independent' && n.anchors === 'off') n.sections = n.sections.flatMap((sec, gi) => splitBySupports(sec, gi, n));

    const skills = n.sections.flatMap((s) => s.skills.map(metaOf));
    const titles = [...new Set(skills.map((s) => s.iCan))];
    const title = typeof n.header.title === 'string' && n.header.title.trim() ? n.header.title.trim()
        : titles.length === 1 ? titles[0] : 'Mixed practice';
    const header = Object.assign({}, n.header, { titleLines: n.header.title === false ? 0 : measureTitleLines(title, n.size) });
    const layoutHeader = { tab: n.header.tab === false ? false : ['Level', 'Strand', 'Id'], title: n.header.title === false ? '' : title, titleLines: header.titleLines };
    const lctx = { paper, header: layoutHeader };
    // Wave 5.2: the number line at the top of the page. Its band is reserved NOW, from a seeded
    // sample of the skill, so the capacity below is decided with it (no split cell, rebalanced
    // last page); the line itself is drawn from the page's real items once they exist.
    const nline = numberLineRequest(n);
    if (nline) {
        header.refBandMm = layoutHeader.refBandMm = nline.hMm;
        header.refBand = nline.html;
    }
    // A lesson's step reminder strip sits above the grid on every page: the grid is that much
    // shorter (the strip's height comes off the body, never off a cell).
    if (n.stepStrip) {
        for (const sec of n.sections) if (!sec.gridH) sec.gridH = Math.floor((bodyHeightMm(paper, layoutHeader) - instructionMm(n.size) - n.stepStrip.hMm) * 1000) / 1000;
    }

    // S5 / S6: the worked examples of each section's skill, generated and measured BEFORE the
    // page capacity is decided, so the capacity reserves their band (sections) or their half of
    // every row (side by side). A skill with no real worked steps gets none, and the dialog says so.
    const anchorMode = n.anchors;
    const anchorNotes = [];
    const instrMm = instructionMm(n.size);
    const anchorSets = anchorMode === 'off' ? [] : n.sections.map((sec, si) => {
        const sk = sec.skills[0];
        const set = anchorSet(sk, si, n, anchorMode === 'side'
            ? { variant: 'side', colsList: [1, 2], twinCols: 2 } : { variant: 'band', colsList: [1], twinCols: 4 });
        if (!set.eligible) { anchorNotes.push(ineligibleNote(metaOf(sk).label)); return null; }
        if (anchorMode === 'side') sec.columns = 2;
        else { sec.maxCols = 4; sec.anchorMm = set.heightMm(1); }
        return set;
    });
    /** A section's items as the layout sees them: side by side puts a twin before each. */
    const withTwins = (si, items) => {
        const set = anchorMode === 'side' ? anchorSets[si] : null;
        if (!set || !set.items.length) return items;
        return sideItems(items, items.map((_, i) => set.items[i % set.items.length]));
    };
    /** Pupil problems a page of this section holds, from its layout (anchors taken off). */
    const capFromL = (sec, si, L) => {
        if (anchorMode === 'sections' && anchorSets[si]) {
            const body = sec.gridH ? sec.gridH + instrMm : bodyHeightMm(paper, layoutHeader);
            return blockPlan({ cols: L.cols, hMin: L.hMin, cellH: L.cellH, bodyMm: body, instrMm, anchorMm: sec.anchorMm }).perPage;
        }
        if (anchorMode === 'side' && anchorSets[si] && anchorSets[si].items.length) return Math.max(1, Math.floor((L.cols === 1 ? Math.max(2, L.rows - (L.rows % 2)) : L.perPage) / 2));
        return L.perPage;
    };
    const floorWith = (si, items) => floorOf(anchorMode === 'side' && anchorSets[si] ? items.concat(anchorSets[si].items) : items, n);

    const build = (sectionIdx, sec, count, baseSeed, extra = {}) => {
        const gen = generateRun(sec.skills, count, baseSeed, Object.assign({ itemCount: sec.count || null }, extra));
        const mix = { key: sectionIdx, count: n.sections.length, sheet: n.mix, alt: sec.supportAlt };
        return gen.map((g) => settlePrompts([hostItem(g, sectionIdx, n.size, { mix })], sec.instructionKey || metaOf(g.skill).instructionKey)[0]);
    };

    const notes = [];
    let hostItems = [];
    const measure = (items, sec) => measureItems(items, { size: n.size, look: n.look, colsList: candidateCols(sec.columns, n.size) });
    const PROBE = 16;

    /**
     * A page of a skill is sized by the SKILL, not by the handful of items that end up on it
     * (PT-ENG-9): PROBE items are measured first and their worst case becomes the section's
     * floor. Items are then generated for the FINAL count, because a section of several skills
     * is dealt by weight for the count it prints - a slice of a larger deal would drop the last
     * skill. A single-skill run is deterministic item by item (seed + i), so its probe is simply
     * the start of the run and is reused.
     */
    const probeRun = (sec, si, base) => {
        const seen = new Set();
        const kept = new Map();
        const items = build(si, sec, PROBE, base, { seen, kept });
        measure(items, sec);
        return { items, seen, kept };
    };
    const finalRun = (sec, si, base, count, probe) => {
        if (sec.skills.length === 1) {
            if (count <= probe.items.length) return probe.items.slice(0, count);
            const more = build(si, sec, count - probe.items.length, base, { startIndex: probe.items.length, seen: probe.seen, kept: probe.kept });
            measure(more, sec);
            probe.items = probe.items.concat(more);
            return probe.items.slice(0, count);
        }
        const items = build(si, sec, count, base);
        measure(items, sec);
        return items;
    };

    /**
     * Sub-sections of one grouped section that print "a page" share it: the body under their
     * instruction lines is split by weight, every sub-section keeps at least one row of its own
     * tallest cell, and each then lays out in its own share (`section.gridH`), so the rows come
     * from the skill's own cell height and never from a whole-page stretch (PG-11). The shares
     * sum to one body, so nothing splits and nothing shrinks (PG-20, PG-21). Returns the item
     * count of each sub-section per page, or null for a section that is not grouped.
     */
    const shareRows = (layouts) => {
        const out = n.sections.map(() => null);
        const groups = new Map();
        n.sections.forEach((sec, si) => { if (sec.group && !sec.count) { if (!groups.has(sec.group.id)) groups.set(sec.group.id, []); groups.get(sec.group.id).push(si); } });
        const body = bodyHeightMm(paper, layoutHeader) - 1;
        const instr = instructionMm(n.size);
        for (const members of groups.values()) {
            // S6 sections: every member keeps room for its anchor band too.
            const band = (si) => (anchorMode === 'sections' && anchorSets[si] ? n.sections[si].anchorMm || 0 : 0);
            const avail = body - members.length * instr;
            // S6 side by side in ONE column: a twin sits above its problem, so a member's least is a
            // PAIR of rows (practice.js layoutSheet pages whole pairs), not one row.
            const pairOf = (si) => (anchorMode === 'side' && anchorSets[si] && anchorSets[si].items.length && layouts[si].cols === 1 ? 2 : 1);
            const needOf = (si) => layouts[si].hMin * pairOf(si) + 1 + band(si);
            let need = members.map(needOf);
            // S6 sections: when the members' bands and one row each do not fit one page, every
            // member takes the COMPACT band (one state, steps beside; Mixed practice's), so a page of
            // several skills stays one page instead of spilling a section overleaf.
            if (anchorMode === 'sections' && need.reduce((a, v) => a + v, 0) > avail) {
                for (const si of members) {
                    if (!anchorSets[si]) continue;
                    const compact = anchorSet(n.sections[si].skills[0], si, n, { variant: 'compact', colsList: [1], twinCols: 4 });
                    if (!compact.eligible || !compact.items.length) continue;
                    anchorSets[si] = compact;
                    n.sections[si].anchorMm = compact.heightMm(1);
                }
                need = members.map(needOf);
            }
            const tw = members.reduce((a, si) => a + n.sections[si].group.share, 0) || 1;
            let h = members.map((si) => avail * n.sections[si].group.share / tw);
            // Every member gets at least one row; the others give up the height it lacks.
            for (let k = 0; k < members.length; k++) {
                if (h[k] >= need[k]) continue;
                const lack = need[k] - h[k];
                h[k] = need[k];
                // The lack is taken from the others' spare room, largest spare first, several donors
                // if need be (one donor alone often cannot give a whole row).
                let left = lack;
                const donors = members.map((_, j) => j).filter((j) => j !== k && h[j] > need[j]).sort((x, y) => (h[y] - need[y]) - (h[x] - need[x]));
                for (const j of donors) {
                    if (left <= 0) break;
                    const give = Math.min(left, h[j] - need[j]);
                    h[j] -= give;
                    left -= give;
                }
            }
            members.forEach((si, k) => {
                const sec = n.sections[si];
                sec.gridH = Math.max(need[k], Math.floor(h[k] * 1000) / 1000);
                const L = resolveSectionLayout({ role: n.role, columns: sec.columns, count: 0, floor: sec.floor, gridH: sec.gridH, dense: sec.dense, maxCols: sec.maxCols, noCap: sec.noCap },
                    withTwins(si, probesOf(si)), paper, LIVE_W_MM, { size: n.size, look: n.look, header: layoutHeader });
                out[si] = capFromL(sec, si, L);
            });
        }
        return out;
    };
    let probesOf = () => [];

    if (n.role === 'independent') {
        const makeProbes = () => n.sections.map((sec, si) => {
            const base = (n.seed + si * 100003) >>> 0;
            const probe = probeRun(sec, si, base);
            sec.floor = floorWith(si, probe.items);
            return { base, probe };
        });
        let probes = makeProbes();
        // S2: the sub-sections of a support split share the page. When one row of each does not
        // fit one page, the split is undone: the alternatives are dealt in blocks in one section.
        if (n.sections !== unsplit && n.sections.some((sec) => !sec.count)) {
            const body = bodyHeightMm(paper, layoutHeader) - 1;
            // One row of each at its TALLEST column count: a supported cell is shorter where its
            // support stands beside it, and the shared page may pick a narrower column.
            const tallest = (sec) => Math.max(0, ...Object.values(sec.floor || {}).filter((f) => f && f.fits !== false).map((f) => f.hMm || 0));
            const need = n.sections.reduce((a, sec, si) => a + instrMm + Math.max(tallest(sec), layoutOf(n.role, sec, probes[si].probe.items, n, lctx).hMin) + 1, 0);
            let undo = need > body;
            if (!undo) {
                // Keep the split only when it holds at least as many problems as the one section
                // (two instruction lines and two part-rows can cost more than the reserve saves).
                const splitSecs = n.sections;
                const splitProbes = probes;
                probesOf = (si) => splitProbes[si].probe.items;
                const splitCap = shareRows(splitSecs.map((sec, si) => layoutOf(n.role, sec, splitProbes[si].probe.items, n, lctx)))
                    .reduce((a, v) => a + (v || 0), 0);
                n.sections = unsplit.map((sec) => Object.assign({}, sec));
                const one = makeProbes();
                const oneCap = capFromL(n.sections[0], 0, layoutOf(n.role, n.sections[0], one[0].probe.items, n, lctx));
                if (oneCap >= splitCap) probes = one;
                else { n.sections = splitSecs; probes = splitProbes; }
            }
            if (undo) { n.sections = unsplit.map((sec) => Object.assign({}, sec)); probes = makeProbes(); }
        }
        probesOf = (si) => probes[si].probe.items;
        const shared = shareRows(n.sections.map((sec, si) => layoutOf(n.role, sec, withTwins(si, probes[si].probe.items), n, lctx)));
        n.sections.forEach((sec, si) => {
            const { base, probe } = probes[si];
            const pagesWanted = sec.pages || 1;
            // "A page" (or N pages) when no count is given: the page decides the count. The floor
            // only grows as items are added, so the capacity can only fall; the loop settles.
            const pageCount = () => (shared[si] !== null ? shared[si] : capFromL(sec, si, layoutOf(n.role, sec, withTwins(si, probe.items), n, lctx)));
            let want = sec.count || Math.min(MAX_ITEMS, pageCount() * pagesWanted);
            let items = [];
            for (let pass = 0; pass < 3; pass++) {
                items = finalRun(sec, si, base, want, probe);
                if (anchorMode === 'side' && anchorSets[si]) anchorSets[si].grow(items.length + 2);
                sec.floor = floorWith(si, probe.items.concat(items));
                if (sec.count) break;
                const again = shared[si] !== null ? want : Math.min(MAX_ITEMS, capFromL(sec, si, layoutOf(n.role, sec, withTwins(si, items), n, lctx)) * pagesWanted);
                if (again >= want) break;
                want = again;
            }
            hostItems = hostItems.concat(items);
        });
    } else {
        // MORE PRACTICE: each letter under its own seed (PT-MPR-2). The first letter's probe fixes
        // the page capacity; the requested count is spread over the letters like a paginated run
        // (PG-23), and each letter is generated under `letterSeed(seed, letter)`. Once every
        // letter is measured, the floor covers them all and a letter the capacity no longer
        // holds is regenerated for the smaller count, so no letter spills onto a second side.
        const firstL = (n.letters && n.letters[0]) || 'A';
        const letterBaseOf = (si) => (L) => ((letterSeed(n.seed, L) + si * 100003) >>> 0);
        const firstProbes = n.sections.map((sec, si) => {
            const pr = probeRun(sec, si, letterBaseOf(si)(firstL));
            sec.floor = floorWith(si, pr.items);
            return pr;
        });
        probesOf = (si) => firstProbes[si].items;
        const shared = shareRows(n.sections.map((sec, si) => layoutOf(n.role, sec, withTwins(si, firstProbes[si].items), n, lctx)));
        const firstLayouts = n.sections.map((sec, si) => {
            const L = layoutOf(n.role, sec, withTwins(si, firstProbes[si].items), n, lctx);
            return Object.assign({}, L, { perPage: capFromL(sec, si, L) });
        });
        n.sections.forEach((sec, si) => {
            const letterBase = letterBaseOf(si);
            const probes = new Map([[firstL, firstProbes[si]]]);
            const probeOf = (L) => { if (!probes.has(L)) probes.set(L, { items: [], seen: new Set(), kept: new Map() }); return probes.get(L); };
            const L0 = shared[si] !== null ? Object.assign({}, firstLayouts[si], { perPage: shared[si] }) : firstLayouts[si];
            let letters;
            let perLetter;
            if (n.letters && n.letters.length) {
                letters = n.letters;
                perLetter = letters.map(() => (sec.count ? Math.min(sec.count, L0.perPage) : L0.perPage));
            } else if (sec.count) {
                const chunks = paginate(sec.count, L0).slice(0, LETTERS.length);
                letters = chunks.map((_, i) => LETTERS[i]);
                perLetter = chunks.map((c) => c.count);
            } else {
                const pages = Math.min(LETTERS.length, sec.pages || 1);
                letters = LETTERS.slice(0, pages).split('');
                perLetter = letters.map(() => L0.perPage);
            }
            let byLetter = letters.map((L, k) => finalRun(sec, si, letterBase(L), perLetter[k], probeOf(L)));
            if (anchorMode === 'side' && anchorSets[si]) anchorSets[si].grow(byLetter.flat().length + 2);
            sec.floor = floorWith(si, [...probes.values()].flatMap((p) => p.items).concat(...byLetter));
            const cap = shared[si] !== null ? shared[si] : capFromL(sec, si, layoutOf(n.role, sec, withTwins(si, byLetter.flat()), n, lctx));
            if (perLetter.some((c) => c > cap)) {
                byLetter = letters.map((L, k) => (perLetter[k] > cap ? finalRun(sec, si, letterBase(L), cap, probeOf(L)) : byLetter[k]));
            }
            byLetter.forEach((items, k) => items.forEach((it) => { it.letter = letters[k]; }));
            for (const items of byLetter) hostItems = hostItems.concat(items);
        });
    }

    // S6: attach the worked examples - never one of the pupil's problems (signatures differ).
    let anchorsIn = null;
    if (anchorMode !== 'off') {
        const bySection = n.sections.map(() => []);
        const bandMm = n.sections.map(() => 0);
        n.sections.forEach((sec, si) => {
            const set = anchorSets[si];
            if (!set) return;
            const mine = hostItems.filter((it) => it.section === si);
            if (anchorMode === 'side') {
                const tw = set.take(hostItems, mine.length);
                mine.forEach((it, i) => { it.twin = tw[i] || null; });
            } else {
                // One example per block: enough for a sheet's blocks (a block holds 1-4 problems).
                const perLetter = new Map();
                for (const it of mine) perLetter.set(it.letter || '', (perLetter.get(it.letter || '') || 0) + 1);
                const need = Math.min(24, Math.max(1, ...perLetter.values()));
                bySection[si] = set.take(hostItems, need).filter((a) => anchorHeightMm(a, 1) <= sec.anchorMm + 0.05);
                bandMm[si] = bySection[si].length ? sec.anchorMm : 0;
            }
        });
        anchorsIn = { mode: anchorMode, bySection, bandMm };
    }

    // S2: deal the supports over the finished sheet (page order), before it is drawn.
    allocateHostSupports(hostItems, n);

    settleMixedGrades(skills, hostItems);
    // Wave 5.2: draw the line from the page's own numbers, in the band reserved above.
    let numberLine = null;
    if (nline) {
        numberLine = drawNumberLine(nline, hostItems.filter((it) => nline.sections.has(Number(it.section) || 0)), n.size, header);
        if (numberLine.warn) notes.push(numberLine.warn);
    }
    const input = {
        items: hostItems,
        skills,
        anchors: anchorsIn,
        sections: n.sections.map((s) => ({ columns: s.columns, instructionKey: s.instructionKey, floor: s.floor, gridH: s.gridH, dense: s.dense, maxCols: s.maxCols, capH: s.capH, noCap: s.noCap })),
        ctx: { size: n.size, look: n.look, paper, photocopySafe: n.photocopySafe },
        header,
        form: n.form,
        seed: n.seed,
        labels: n.labels,
        lesson: n.lesson,
        tabId: n.tabId || '',
        stepStrip: n.stepStrip ? n.stepStrip.html : '',
        // Wave 5.2: only the pages holding a section that asked for the line print it (D8).
        refSections: nline ? [...nline.sections] : null,
    };
    let plan = n.role === 'more-practice' ? morePracticePlan(input) : independentPlan(input);
    // Wave 5.2 (critic nl-r4 D1): the number line never adds a page. A page-driven Independent
    // sheet ("a page", no count) whose band pushes a part overleaf (a split section's full-width
    // group under its grid) gives up its last problems, one at a time, until it is the pages it
    // was asked for. The capacity above counts each section's grid; this counts the whole page.
    let trimmed = 0;
    if (nline && n.role === 'independent' && n.sections.every((sec) => !sec.count)) {
        const wanted = n.sections.reduce((a, sec) => a + (sec.pages || 1), 0);
        const t = trimToPages(plan, hostItems, wanted, (items) => { input.items = items; return independentPlan(input); });
        plan = t.plan; trimmed = t.trimmed;
    }
    const out = renderPlan(plan, { key: n.key });
    const fitsList = (plan.meta && plan.meta.fits) || [];
    const f0 = fitsList[0] || {};
    const pageCount = out.pupilPages.length;
    notes.push(...new Set((plan.meta && plan.meta.notes) || []), ...anchorNotes);
    // DN-21: the dialog's "Fits:" line (it already carries the layout's own clamp note, DN-14),
    // then any note the layout line does not already say.
    const line = touchFitLine(f0.line || '', out.pupilHtml, n.size);
    const fits = {
        cols: f0.cols, rows: f0.rows, perPage: f0.perPage, pages: pageCount, trimmed,
        note: [line, ...notes.filter((t) => !line.includes(t))].filter(Boolean).join(' '),
        sections: fitsList,
    };
    return {
        pupilHtml: out.pupilHtml,
        keyHtml: n.key ? out.keyHtml : '',
        pupilPages: out.pupilPages, keyPages: n.key ? out.keyPages : [],
        pageCount,
        keyPageCount: n.key ? out.keyPages.length : 0,
        fits,
        items: hostItems.map((it) => ({
            skill: it.skill, section: it.section, letter: it.letter, template: it.template,
            text: String(it.q.text || ''), ans: it.q.ans, fclass: it.fclass, measured: it.measured, measureWhy: it.measureWhy,
        })),
        gaps: out.gaps,
        numberLine,
        anchors: anchorSummary(anchorMode, anchorsIn ? anchorsIn.bySection.flat().concat(hostItems.map((it) => it.twin).filter(Boolean)) : [], anchorNotes),
        floors: n.sections.map((s) => s.floor || null),
        seed: n.seed,
        role: n.role,
        title: plan.meta && plan.meta.title,
        notes,
        plan,
    };
}

/**
 * Wave 4.4 (owner 2026-10-03): the answer key options. `req.key` is `true` / `false` (today's
 * facsimile key at the end, unchanged) or `{on, placement: 'end'|'after-page', style: 'copy'|'short'}`.
 * The sheet is built exactly as before; the key pages are then restyled (short) and ordered.
 * Adds `docHtml` (pupil and key pages in print order) and `keyOptions` to the result.
 */
export async function buildSheet(req = {}) {
    // The DETAILED lesson maker (V22, 2026-10-16): a whole teacher + pupil pack of its own.
    if (req && req.role === 'detailed-lesson') return buildDetailedLesson(req);
    const ko = normKeyOptions(req.key);
    const res = await buildSheetCore(Object.assign({}, req, { key: ko.on }));
    return arrangeKey(res, ko, req);
}

/**
 * The blank back of a sheet ("Start each key on a new sheet", owner 2026-10-09): no header, tab or
 * border, and one very small line in the kit's own footer band, centre cell (regular, black, no
 * copyright line), so a pupil never takes it for a worksheet.
 */
export function blankBack(paperAttr = 'a4') {
    const letter = paperAttr === 'letter' ? ' mq-paper-letter' : '';
    return `<section class="ws-page ws-blank-back${letter}" data-ws-paper="${paperAttr}" data-ws-mode="blank" aria-label="Blank back of the sheet"><main class="ws-body"></main>`
        + '<footer class="ws-foot ws-blank-foot"><span></span><span class="ws-blank-note">This page is intentionally blank</span><span></span></footer></section>';
}

/** Restyle and order the key pages of a built sheet (exported for the lane test). */
export function arrangeKey(res, ko, req = {}) {
    res.keyOptions = ko;
    const pupil = res.pupilPages || [res.pupilHtml];
    if (!ko.on) { res.docHtml = res.pupilHtml; return res; }
    const plan0 = (res.keyPlans && res.keyPlans[0]) || res.plan || {};
    const paper = (plan0.ctx && plan0.ctx.paper) || req.paper || 'A4';
    const paperAttr = /letter/i.test(paper) ? 'letter' : 'a4';
    const decorateKey = (html, i, role) => html
        .replace(/<section ([^>]*?)class="ws-page ([^"]*)"/, (m, pre, c) => `<section ${pre}class="ws-page ${c}" data-ws-page="${i}" data-ws-paper="${paperAttr}" data-ws-role="${role}" data-ws-mode="key"`)
        .replace('<footer class="ws-foot">', '<footer class="ws-foot" data-ws-teacher>');
    let keyPages = res.keyPages || (res.keyHtml ? [res.keyHtml] : []);
    // INK-31 (critic r1, B1): only the answers take the key ink; a given claim, the made-up
    // pupil's work and every printed number keep their ink. Each key page is matched to its twin.
    keyPages = keyPages.map((k, i) => tagKeyAnswers(pupil.length === keyPages.length ? pupil[i] : '', k));
    let groupsByPage = null;
    if (ko.style === 'short') {
        const plans = res.keyPlans || (res.plan ? [res.plan] : []);
        const rows = shortKeyRows(plans);
        const head = plan0.header || {};
        const opts = {
            size: (plan0.ctx && plan0.ctx.size) || req.size || 'L', look: (plan0.ctx && plan0.ctx.look) || 'ican', paper,
            header: { tab: head.tab }, footer: { left: (plan0.footer && plan0.footer.left) || '', right: ['Key', res.seed !== undefined ? `seed ${res.seed}` : ''].filter(Boolean).join(' · ') },
        };
        const role = `${res.role || 'sheet'}`;
        // B3 / B4 (critic r1): a group is headed with the name its pupil page prints - the tab's
        // own label ("Practice A") and its page number when the sheet runs to several - and, in a
        // printout of several sections, the section ("Section 2 · Add within 20").
        const nameOf = (h) => {
            const tabBox = /<div class="ws-tabbox">([\s\S]*?)<\/div>/.exec(h || '');
            const spans = tabBox ? [...tabBox[1].matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1].trim()).filter(Boolean) : [];
            const foot = /<footer class="ws-foot"[^>]*>[\s\S]*?<b>([^<]*)<\/b>/.exec(h || '');
            const nn = foot && /^(\d+)\/(\d+)$/.exec(foot[1].trim());
            const name = spans.length ? spans[spans.length - 1] : '';
            return { name, n: nn ? +nn[1] : 0, of: nn ? +nn[2] : 0 };
        };
        const title0 = /<div class="ws-title">([\s\S]*?)<\/div>/.exec(pupil[0] || '');
        const titleText = title0 ? title0[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '';
        const section = req.keySection ? [String(req.keySection), titleText].filter(Boolean).join(': ') : '';
        let labels = rows.length === pupil.length ? pupil.map((h, i) => {
            const { name, n, of } = nameOf(h);
            const pageBit = of > 1 ? `page ${n} of ${of}` : '';
            return [name, pageBit].filter(Boolean).join(', ') || `Page ${i + 1}`;
        }) : null;
        // two pages that print the same name (a lesson's two "Lesson 1" pages) are told apart
        if (labels) {
            const seen = {};
            const total = labels.reduce((m, l) => Object.assign(m, { [l]: (m[l] || 0) + 1 }), {});
            labels = labels.map((l) => (total[l] > 1 ? `${l}, page ${(seen[l] = (seen[l] || 0) + 1)} of ${total[l]}` : l));
            if (section) labels = labels.map((l) => `${section} · ${l}`);
        }
        opts.pageLabel = (p) => (labels && labels[p - 1]) || (section ? `${section} · Page ${p}` : `Page ${p}`);
        if (section) opts.footer.left = [String(req.keySection), opts.footer.left].filter(Boolean).join(' · ');
        if (rows.length === pupil.length) groupsByPage = rows.map((r) => renderShortKey([r], opts).map((h, j) => decorateKey(h, j + 1, role)));
        keyPages = renderShortKey(rows, opts).map((h, j) => decorateKey(h, j + 1, role));
        res.shortRows = rows.map((r) => ({
            page: r.page, heading: opts.pageLabel(r.page),
            items: r.items.map((it) => ({ label: it.label, cell: it.cell, skill: it.skill, text: answerText(it), slots: (it.key && typeof it.key === 'object' && it.key.slots) || null })),
        }));
    }
    let doc;
    if (ko.placement === 'after-page') {
        const perPage = groupsByPage || (keyPages.length === pupil.length ? keyPages.map((k) => [k]) : null);
        if (perPage) {
            // "Key n/N" on the page that follows pupil page n/N, so the dialog's run stays readable.
            const N = pupil.length;
            const keyed = perPage.map((list, i) => list.map((h, j) => h.replace(/(<footer class="ws-foot"[^>]*><span>[\s\S]*?<\/span><b>)([^<]*)(<\/b>)/,
                (m, a, c, b) => `${a}${ko.style === 'short' ? `Key ${i + 1}/${N}${list.length > 1 ? ` (${j + 1})` : ''}` : `Key ${c}`}${b}`)));
            if (ko.newSheet) {
                // "Start each key on a new sheet" (owner 2026-10-09, double-sided printing): a blank
                // back pads the run so every key starts on the front of a sheet, and the key keeps its
                // sheet whole, so the next pupil page starts on a fresh sheet too.
                const blank = blankBack(paperAttr);
                const out = [];
                const pad = () => { if (out.length % 2) out.push(blank); };
                pupil.forEach((p, i) => { pad(); out.push(p); pad(); out.push(...keyed[i]); });
                pad();
                doc = out.join('\n');
                res.blankBacks = out.filter((h) => h === blank).length;
            } else doc = pupil.map((p, i) => [p, ...keyed[i]].join('\n')).join('\n');
            keyPages = keyed.flat();
        } else {
            res.notes = (res.notes || []).concat('The key prints at the end: its pages do not match the pupil pages one to one.');
            if (ko.newSheet) {
                // critic r3 (N-3): a part that falls back to the end still keeps the sheets whole, so
                // its key starts on a front and the next section never starts on a back
                const blank = blankBack(paperAttr);
                const nPages = (list) => list.reduce((n, h) => n + (String(h).match(/<section\b[^>]*\bclass="ws-page[ "]/g) || []).length, 0);
                const out = [...pupil];
                if (nPages(out) % 2) out.push(blank);
                out.push(...keyPages);
                if (nPages(out) % 2) out.push(blank);
                doc = out.join('\n');
                res.blankBacks = out.filter((h) => h === blank).length;
            }
        }
    }
    res.keyPages = keyPages;
    res.keyHtml = keyPages.join('\n');
    res.keyPageCount = keyPages.length;
    res.docHtml = doc || [res.pupilHtml, res.keyHtml].filter(Boolean).join('\n');
    return res;
}

/* ====================================================== the P7.2b roles (roles/index.js) */

/**
 * The skills listed before `sk` in its category, nearest first: the earlier steps a Review
 * mixes in (PT-REV-3) and the prerequisites a Pre-skill check tests while the ladder's own
 * pre-skill list is not modelled (P-AT-1). Tombstones and the mixed pools are skipped.
 */
const GRADE_RANK = (g) => { const i = ['K', '1', '2', '3', '4', '5', '6'].indexOf(String(g === undefined || g === null ? '' : g).toUpperCase()); return i < 0 ? null : i; };
/**
 * A mixed pool's page is at the level of what it deals (critic guided-r1: "All levels" in the tab
 * and "Grade mixed" in the footer over a page of o'clock times, Grade 1). A skill whose own grade
 * is mixed or unknown takes the highest grade among the page's items drawn from it.
 */
function settleMixedGrades(metas, items) {
    const LEVELS = ['K', '1', '2', '3', '4', '5', '6'];
    const named = new Set(metas.map((m) => `${m.categoryId}:${m.skillId}`));
    for (const m of metas) {
        if (GRADE_RANK(m.grade) !== null) continue;
        const ranks = (items || []).map((it) => it && it.q).filter((q) => q && q.categoryId === m.categoryId
            && (q.skillId === m.skillId || !named.has(`${q.categoryId}:${q.skillId}`)))
            .map((q) => { try { return GRADE_RANK(getSkillGrade(q.skillId, q.categoryId)); } catch (e) { return null; } })
            .filter((r) => r !== null);
        if (ranks.length) m.grade = LEVELS[Math.max(...ranks)];
    }
}

function earlierSkills(sk, count = 1, { fallback = false } = {}) {
    // An earlier step is never a HARDER one: a category lists its skills in groups (facts, then
    // columns, then word problems), so the skill just above a Level K word problem can be a
    // 5-digit sum. Only skills at the same level or below count.
    let own = null;
    try { own = GRADE_RANK(getSkillGrade(sk.skillId, sk.categoryId)); } catch (e) { own = null; }
    const out = [];
    const ok = (s, cat) => {
        if (!s || s.v === sk.skillId || s.retired || s.tombstone || s.hidden || /^mixed_/.test(s.v)) return false;
        try { if (isMixedMetaSkill(s.v)) return false; } catch (e) { /* keep */ }
        let g = null;
        try { g = GRADE_RANK(getSkillGrade(s.v, cat)); } catch (e) { g = null; }
        return !(own !== null && (g === null || g > own));
    };
    const take = (cat, idxs) => {
        const list = Array.isArray(SKILLS[cat]) ? SKILLS[cat] : [];
        for (const i of idxs) {
            if (out.length >= count) return;
            const s = list[i];
            if (ok(s, cat) && !out.some((o) => o.categoryId === cat && o.skillId === s.v)) out.push({ categoryId: cat, skillId: s.v });
        }
    };
    const range = (a, b, step) => { const r = []; for (let i = a; step > 0 ? i < b : i > b; i += step) r.push(i); return r; };
    const list = Array.isArray(SKILLS[sk.categoryId]) ? SKILLS[sk.categoryId] : [];
    const at = list.findIndex((s) => s.v === sk.skillId);
    // 1. The skills listed before it in its category, nearest first.
    take(sk.categoryId, range(at - 1, -1, -1));
    // Critic guided-r1: a skill with no earlier step (the first of its category: compare_groups,
    // count_objects, mult_facts, perimeter_intro, bar_graph) printed a Review with no Mixed Review
    // at all. The fallback, in order: 2. the categories before it in its domain, their last
    // (hardest allowed) skills first; 3. the skills after it in its own category at its level or
    // below; 4. the categories after it in its domain.
    if (!fallback || out.length >= count) return out;
    const cats = (() => {
        for (const d of Object.values(DOMAINS || {})) {
            const ids = (d.categories || []).map((c) => c.id).filter((id) => !/mixed/.test(id));
            if (ids.includes(sk.categoryId)) return ids;
        }
        return [sk.categoryId];
    })();
    const ci = cats.indexOf(sk.categoryId);
    const lenOf = (cat) => (Array.isArray(SKILLS[cat]) ? SKILLS[cat].length : 0);
    for (let c = ci - 1; c >= 0 && out.length < count; c--) take(cats[c], range(lenOf(cats[c]) - 1, -1, -1));
    if (out.length < count) take(sk.categoryId, range(at + 1, list.length, 1));
    for (let c = ci + 1; c < cats.length && out.length < count; c++) take(cats[c], range(0, lenOf(cats[c]), 1));
    return out;
}

/** Roles whose cells show a finished answer in the skill's own slot (they need `canShow`). */
const SHOWS_WORK = new Set(['error-analysis', 'true-false', 'reason-it']);

/**
 * Build a sheet of one of the P7.2b roles. The role module decides everything about the page;
 * this host only generates, prepares (the role's own cell around the skill's cell), measures and
 * renders, through the module's small protocol (roles/compose.js):
 *   sources(skills, {earlier})  -> [{id, skills, weight?}]   the item pools
 *   prepare(item, info)         -> item | null               optional
 *   measureCols(ctx)            -> number[]                  the column counts to measure
 *   counts(pools, input)        -> {poolId: n}               from the measured probe
 *   supports(items)             -> null | reason              optional (the fact layouts)
 *   plan(input)                 -> PagePlan
 */
async function buildRoleSheet(n, metaOf) {
    const mod = ROLE_MODULES[n.role];
    const reqSkills = n.sections.flatMap((s) => s.skills);
    const pools = (mod.sources(reqSkills, { earlier: earlierSkills, lesson: n.lessonInput }) || []).filter((p) => p && p.skills && p.skills.length);
    if (!pools.length) throw new Error(`buildSheet: ${n.role} has no skill to print`);
    const allSkills = [];
    const seenSkill = new Set();
    for (const p of pools) for (const sk of p.skills) {
        const k = `${sk.categoryId}:${sk.skillId}`;
        if (!seenSkill.has(k)) { seenSkill.add(k); allSkills.push(metaOf(sk)); }
    }
    const header = Object.assign({}, n.header);
    delete header.titleLines;
    // Wave 5.2: the number line, reserved before any capacity is worked out (see buildSheet).
    // A test / check page carries no hint scaffold unless the teacher allows hints on tests
    // (PEDAGOGY P-SC-5: a teacher option, `req.testHints`); every other role carries it.
    const nline = NO_HINT_ROLES.has(n.role) && !n.testHints ? null : numberLineRequest(n);
    if (nline) {
        header.refBandMm = nline.hMm;
        header.refBand = nline.html;
    }
    const ctx = { size: n.size, look: n.look, paper: n.paper, photocopySafe: n.photocopySafe };
    const colsList = (typeof mod.measureCols === 'function' ? mod.measureCols(ctx) : [1, 2]) || [1, 2];
    const needsShow = SHOWS_WORK.has(n.role);
    const strictShow = n.role === 'error-analysis';
    const input = {
        items: [], skills: allSkills, pools: pools.map((p) => ({ id: p.id, weight: p.weight || 1 })),
        ctx, header, form: n.form, seed: n.seed, labels: n.labels, lesson: n.lesson,
        columns: (n.sections[0] && n.sections[0].columns) || 'auto',
        count: n.sections[0] && n.sections[0].count ? n.sections[0].count : undefined,
        targetSkill: metaOf(reqSkills[0]),
        floors: {},
        lesson: n.lessonInput,
        // A lesson packet's step strip (Mixed page) and page fill (lessons r1).
        stepStrip: n.stepStrip ? n.stepStrip.html : '',
        stepStripMm: n.stepStrip ? n.stepStrip.hMm : 0,
        fill: !!n.stepStrip,
        latticeN: n.latticeN || 0,
        leadHalf: !!n.leadHalf,
        leadDrop: !!n.leadDrop || undefined,
        // The detailed lesson's Prerequisite Check: items per question (absent otherwise).
        perQuestion: n.perQuestion || undefined,
        growLast: !!n.growLast || undefined,
    };

    /**
     * `want` usable items for one pool. A pool of one skill is deterministic item by item (seed
     * + i), so the probe and the final run deal the same questions. Items the role cannot use
     * (`prepare` returns null, or the finished answer cannot be written into the cell) are
     * skipped and the run is extended; a last pass accepts an unshowable item, which then shows
     * its value on an answer line under the cell.
     */
    const flagsFor = (count) => (typeof mod.wrongFlags === 'function' ? mod.wrongFlags(count, n.seed) : []);
    const dealPool = (pool, pi, want, seen0 = null) => {
        const base = (n.seed + pi * 100003) >>> 0;
        const st = { seen: new Set(seen0 || []), kept: new Map() };
        const flags = flagsFor(want);
        const out = [];
        let next = 0;
        for (let pass = 0; pass < 4 && out.length < want; pass++) {
            const need = want - out.length;
            const batch = pass === 0 ? need : need * 2 + 2;
            const gen = generateRun(pool.skills, batch, base, { startIndex: next, seen: st.seen, kept: st.kept });
            next += batch;
            for (const g of gen) {
                if (out.length >= want) break;
                const it = settlePrompts([hostItem(g, 0, n.size, { mix: { key: pi, count: pools.length, sheet: n.mix } })], metaOf(g.skill).instructionKey)[0];
                // Error analysis never falls back to an "Answer:" line under the cell: the shown work
                // must sit in the cell's own slot, or the pupil sees two answer places (C1).
                if (needsShow && (pass < 3 || strictShow) && !it.canShow()) continue;
                const k = out.length;
                const prepared = typeof mod.prepare === 'function'
                    ? mod.prepare(it, { index: k, seed: n.seed, wrong: !!flags[k], size: n.size, look: n.look })
                    : it;
                if (!prepared) continue;
                prepared.pool = pool.id;
                // A role that draws Model / Guided cells measures them at their tallest level.
                if (mod.MEASURE_LEVEL) prepared.measureLevel = typeof mod.MEASURE_LEVEL === 'function' ? mod.MEASURE_LEVEL(pool.id) : mod.MEASURE_LEVEL;
                // Item 7: a role whose Model cell is narrower than the line (Opener, Scripted Model) marks the item it draws there,
                // so a template that can wrap (count-row) wraps to that cell, measured and drawn alike; every other item is untouched.
                if (typeof mod.WRAP_TO_CELL === 'function' && mod.WRAP_TO_CELL(k, pool.id)) {
                    prepared.wrapToCell = true;
                    // a wrapped count row redraws its arrows to the narrower pitch and takes more lines on purpose (digits keep their size)
                    if (prepared.template === 'count-row') { prepared.scalesWithCols = true; prepared.colsLayout = true; }
                }
                // critic r2 N4: a role whose cells are sized to their content (the Opener) drops the one-page sheet's air round a row
                if (mod.TIGHT_ROWS && prepared.template === 'count-row') prepared.tightRows = true;
                prepared.section = 0;
                out.push(prepared);
            }
        }
        return out;
    };
    const measure = (items) => measureItems(items, { size: n.size, look: n.look, colsList });

    // 1. The probe: enough items to measure the skill (PT-ENG-9), per pool.
    const PROBE = mod.PROBE || { 'scripted-model': 1, stretch: 2, 'word-problems': 4, 'reason-it': 4, 'fact-probe': 20 }[n.role] || 8;
    const probe = {};
    pools.forEach((p, pi) => {
        probe[p.id] = dealPool(p, pi, PROBE);
        measure(probe[p.id]);
        input.floors[p.id] = floorOf(probe[p.id]);
    });

    // S6: Mixed practice's worked examples, one skill per pool, generated and measured before the
    // shelves are packed (sections: one anchor band per skill; side: a twin per problem).
    const anchorNotes = [];
    let anchorsIn = null;
    if (n.anchors !== 'off' && n.role === 'mixed-practice') {
        const byPool = {};
        pools.forEach((p, pi) => {
            const sk = p.skills[0];
            // The compact band (one state, steps beside): a skill's shelf band stays short.
            const band = anchorSet(sk, pi, n, { variant: 'compact', colsList: [1], twinCols: 4 });
            if (!band.eligible) { anchorNotes.push(ineligibleNote(metaOf(sk).label)); return; }
            const entry = { band: band.items.slice(), bandSet: band };
            if (n.anchors === 'side') {
                const side = anchorSet(sk, pi + 4099, n, { variant: 'side', colsList, twinCols: 2 });
                entry.side = side.items.slice();
                entry.sideSet = side;
            }
            byPool[p.id] = entry;
        });
        anchorsIn = { mode: n.anchors, byPool };
        input.anchors = anchorsIn;
    }

    // 2. How many items the page needs, from the measured probe.
    const want = mod.counts(probe, input) || {};

    // 3. The final items: the probe again when it already holds them (same seeds, same items),
    //    else a fresh deal for the final count (the role's wrong/right pattern depends on it).
    //    A pool of several skills is dealt skill by skill, so the FIRST w probe items can all be
    //    one skill's: take each skill's share of w (dealSkills) from its own probe items instead,
    //    so every skill the page has room for is on it.
    const coverSlice = (p, list, w) => {
        if (!p.skills || p.skills.length < 2) return list.slice(0, w);
        const need = new Map();
        for (const s of dealSkills(p.skills, w)) { const k = `${s.categoryId}:${s.skillId}`; need.set(k, (need.get(k) || 0) + 1); }
        const used = new Map();
        const out = list.filter((it) => { const u = used.get(it.skill) || 0; if (u >= (need.get(it.skill) || 0)) return false; used.set(it.skill, u + 1); return true; });
        return out.length === w ? out : null;
    };
    let items = [];
    // (LR-6 across the skills of ONE page - the detailed lesson maker's Mixed page, refs with
    // `avoidKeys`; lesson 2 r4, critic r2 D2: no answer twice, no near twins, no story name or unit
    // word twice on the page. Each later skill is dealt against the items already placed.)
    const pageLr6 = n.role === 'mixed-practice' && pools.some((p) => p.skills.some((s) => s.lr6)) ? new Set() : null;
    pools.forEach((p, pi) => {
        const w = Math.max(0, Math.min(MAX_ITEMS, Math.floor(Number(want[p.id]) || 0)));
        let its = w <= probe[p.id].length && !mod.wrongFlags && !(pageLr6 && pi > 0) ? coverSlice(p, probe[p.id], w) : null;
        if (!its) { its = dealPool(p, pi, w, pageLr6 && pi > 0 ? pageLr6 : null); measure(its); }
        if (pageLr6) for (const it of its) { lr6Record(it.q, `pool:${pi}`, pageLr6); pageLr6.add(`ansAll:${dlAns(it.q).replace(/[^0-9a-z<>=]/gi, '')}`); }
        items = items.concat(its);
    });
    input.items = items;
    settleMixedGrades(allSkills, items);
    // S2: deal the supports over the page's items (a pool of Mixed practice is its own section).
    allocateHostSupports(items, n);
    if (anchorsIn) {
        // Never one of the pupil's problems; a band never taller than the one the packing reserved.
        for (const [id, e] of Object.entries(anchorsIn.byPool)) {
            const pupil = items.filter((it) => it.pool === id);
            const maxBand = Math.max(0, ...e.band.map((a) => anchorHeightMm(a, 1)));
            e.band = e.bandSet.take(items, 4).filter((a) => anchorHeightMm(a, 1) <= maxBand + 0.05).slice(0, 1);
            if (e.sideSet) {
                const tw = e.sideSet.take(items, pupil.length);
                pupil.forEach((it, i) => { it.twin = tw[i] || null; });
            }
        }
    }

    if (typeof mod.supports === 'function') {
        const why = mod.supports(items, { skills: reqSkills });
        if (why) {
            const err = new Error(why);
            err.unsupported = true;
            throw err;
        }
    }

    // A role that draws blocks of its own around the skill's cells (the lesson's anchor chart
    // panels, its vocabulary match and Steps zone) hands them over here to be measured, exactly as
    // the cells were: `extras(input)` -> host-shaped items, measured at every column count.
    if (typeof mod.extras === 'function') {
        const ex = (mod.extras(input) || []).filter(Boolean);
        if (ex.length) measureItems(ex, { size: n.size, look: n.look, colsList: [1, 2, 3, 4] });
        input.extras = ex;
    }

    const numberLine = nline ? drawNumberLine(nline, items.some((it) => nline.keys.has(String(it.skill))) ? items.filter((it) => nline.keys.has(String(it.skill))) : items, n.size, header) : null;
    const plan = mod.plan(input);
    const out = renderPlan(plan, { key: n.key });
    const fitsList = (plan.meta && plan.meta.fits) || [];
    const f0 = fitsList[0] || {};
    const notes = [...new Set((plan.meta && plan.meta.notes) || []), ...anchorNotes];
    if (numberLine && numberLine.warn) notes.push(numberLine.warn);
    // SF-34: touch numerals never print under 24 pt, so on an S / M page the stacked touch cells
    // are raised to L; the fit line says so instead of the page's own digit size alone.
    const line = touchFitLine(f0.line || '', out.pupilHtml, n.size);
    return {
        pupilHtml: out.pupilHtml,
        keyHtml: n.key ? out.keyHtml : '',
        pupilPages: out.pupilPages, keyPages: n.key ? out.keyPages : [],
        pageCount: out.pupilPages.length,
        keyPageCount: n.key ? out.keyPages.length : 0,
        numberLine,
        fits: { cols: f0.cols, rows: f0.rows, perPage: f0.perPage, pages: out.pupilPages.length, note: [line, ...notes.filter((t) => !line.includes(t))].filter(Boolean).join(' '), sections: fitsList },
        items: items.map((it) => ({
            skill: it.skill, section: 0, pool: it.pool, template: it.template,
            kind: (it.q && it.q.cell && it.q.cell.payload && it.q.cell.payload.kind) || undefined,
            text: String((it.q && it.q.text) || ''), ans: it.q && it.q.ans, fclass: it.fclass, measured: it.measured, measureWhy: it.measureWhy,
            thinking: it.thinking ? { isWrong: !!it.thinking.isWrong, shown: it.thinking.shown } : undefined,
        })),
        gaps: out.gaps,
        anchors: anchorSummary(n.anchors, anchorsIn ? Object.values(anchorsIn.byPool).flatMap((e) => e.band).concat(items.map((it) => it.twin).filter(Boolean)) : [], anchorNotes),
        floors: pools.map((p) => input.floors[p.id]),
        seed: n.seed,
        role: n.role,
        title: plan.meta && plan.meta.title,
        notes,
        plan,
        extras: input.extras || [],
    };
}

/* ======================================================================= the lesson packet */

/**
 * THE LESSON PACKET (design/LESSONS_VISION.md, roles/lesson.js): the teaching sheet - the anchor
 * chart, then Vocabulary, Warm-up, Guided ("we do") and the first Independent rows - then
 * `practicePages` Independent pages (each with the chart's step strip above its grid) and, when
 * asked, a Mixed practice page with the lesson's earlier skills. Every sheet carries the lesson's
 * tags (skill, grade, CCSS, EE from standards.js) in its teacher footer. The pupil pages print
 * first, part by part, then the keys in the same order (PT-KEY-6).
 */
/** The note a lesson asked for at S carries (the print panel shows it as a warning). */
export const LESSON_SIZE_NOTE = 'A lesson prints at Medium or Large: Small is printed at Medium, because its regroup boxes, place-value letters and step words are too small to write in at Small.';

async function buildLesson(n, metaOf) {
    const sk0 = n.sections[0].skills[0];
    const data0 = n.lessonData || lessonFor(sk0.categoryId, sk0.skillId);
    // The lesson's floor on its own operands (lessons r2: "add 1-3" never deals + 0), on every part.
    const flags = {};
    if (data0 && data0.minOperand !== undefined && sk0.minOperand === undefined) flags.minOperand = data0.minOperand;
    if (data0 && data0.distinctFirst) flags.distinctFirst = true;
    if (data0 && data0.minTop !== undefined) flags.minTop = data0.minTop;
    if (data0 && data0.maxTop !== undefined) flags.maxTop = data0.maxTop;
    // Lessons r3: no two answers alike and at most N one-place take-aways a page, where the
    // lesson asks; never the same numbers turned round on one page (1 + 9, 9 + 1).
    if (data0 && data0.distinctAnswer) flags.distinctAnswer = true;
    if (data0 && data0.maxSmall !== undefined) flags.maxSmall = data0.maxSmall;
    if (data0) flags.noTurnaround = true;
    const sk = Object.keys(flags).length ? Object.assign({}, sk0, flags) : sk0;
    if (sk !== sk0) n = Object.assign({}, n, { sections: [Object.assign({}, n.sections[0], { skills: [sk] }), ...n.sections.slice(1)] });
    const meta = metaOf(sk);
    const data = n.lessonData || lessonFor(sk.categoryId, sk.skillId);
    const warmSkills = data ? data.skills.map(skillRef) : earlierSkills(sk, 2);
    let st = { ccss: [], ee: [], approx: false };
    try { if (standardsMod) st = standardsMod.standardsFor(sk.categoryId, sk.skillId); } catch (e) { /* no tags */ }
    // The lesson's tags: the PRIMARY CCSS code (an approximate mapping is no tag) and its EEs.
    const ccss = !st.approx && st.ccss && st.ccss[0] ? [st.ccss[0].short || st.ccss[0].code] : [];
    const ee = (st.ee || []).map((r) => r.code).slice(0, 2);
    // `tagLine` (the detailed lesson maker): the LESSON's tags, validated against standards.js by
    // the caller, printed on every sheet instead of the skill's own.
    const tagLine = n.tagLine || lessonTagLine({ skillId: sk.skillId, grade: meta.grade, ccss, ee });
    const header = Object.assign({}, n.header, { footerLeft: tagLine }, Array.isArray(n.packTab) ? { tabStrand: n.packTab[1] } : {});
    // (A chunked detailed lesson numbers its sheets '1a', '1b': V22 Chunked Flow.)
    const lessonNo = /^\d+[a-z]$/.test(String(n.lesson || '')) ? String(n.lesson) : Math.max(1, Number(n.lesson) || 1);

    // Lessons r1: a lesson packet never prints below M (the regroup scaffold, the place-value
    // letters and the step words are unreadable at S), and its ANCHOR CHART is a wall chart: L type
    // at every size. S is printed as M and says so in the notes.
    const size = n.size === 'S' ? 'M' : n.size;
    // (Shown in the print panel beside the Size control, not only under "Why?": lessons r2.)
    const sizeNote = size !== n.size ? [LESSON_SIZE_NOTE] : [];
    const nz = Object.assign({}, n, { size });
    const lessonInput = { data, warmSkills, tagLine, number: lessonNo };

    // 1. The anchor chart (always L) and the teaching sheet: Vocabulary, Warm-up, Guided, Independent.
    const chart = await buildRoleSheet(Object.assign({}, nz, {
        size: 'L', role: 'lesson', header, look: 'ican', lessonInput: Object.assign({}, lessonInput, { part: 'chart' }),
    }), metaOf);
    const teach = await buildRoleSheet(Object.assign({}, nz, {
        role: 'lesson', header, look: 'ican', lessonInput: Object.assign({}, lessonInput, { part: 'sheet' }),
    }), metaOf);
    const parts = [{ part: 'chart', role: 'lesson', res: chart }, { part: 'teach', role: 'lesson', res: teach }];

    // 2. Massed practice: Independent pages with the chart's step strip, the grid filling the page
    // body in ONE frame (CL-1; lessons r1: no blank band above the footer, no gutters).
    const common = {
        size, look: 'ican', paper: n.paper, key: n.key, labels: n.labels, lesson: lessonNo,
        photocopySafe: n.photocopySafe, header,
    };
    const strip = (teach.extras || []).find((x) => x.lessonStrip);
    const stripH = strip && strip.measured && strip.measured[1] ? strip.measured[1].hMm + 0.5 : 0;
    const stripHtml = strip && stripH ? strip.render(resolveCtx({ size, look: 'ican', mode: 'print' })) : '';
    // A rounding item ("27 -> ___") is a one-number answer on one line, like a fact.
    // A div_facts fact in any written form (across or fraction on the equation cell, the bracket)
    // is a one-number answer too (critic R1 D8: Long / Fraction practice pages printed 2 x 3).
    const oneLine = (it) => it.template === 'fact' || (it.template === 'pv' && it.kind === 'round')
        || ((it.template === 'equation' || it.template === 'division') && /div_facts/.test(String(it.skill || '')));
    const facts = (teach.items || []).filter((it) => it.pool === 'main').every(oneLine);
    // The skill ref of the practice pages: a subtraction lesson gives step 5 ("Check: add back")
    // its room, a Check line under every problem.
    let practiceSk = data && data.checkRow ? Object.assign({}, sk, { check: true }) : sk;
    // The detailed lesson maker (LR-5): a ref that carries `avoidNums` never deals, on Practice or
    // Mixed, a number the chart or the lesson sheet dealt. (Standard lessons carry no avoidNums.)
    const planKeys = (res) => { const out = []; for (const pl of res.keyPlans || [res.plan]) for (const pg of (pl && pl.pages) || []) { const walk = (part) => { if (!part) return; if (part.kind === 'grid') (part.items || []).forEach((it) => { const k = it && it.q ? factKeyOf(it.q) : null; if (k !== null) out.push(k); }); if (part.content) walk(part.content); (part.contents || []).forEach(walk); (part.parts || []).forEach(walk); }; (pg.sections || []).forEach(walk); } return out; };
    const chartQs = (chart.plan && chart.plan.meta && chart.plan.meta.exampleQs) || [];
    const packNums = Array.isArray(sk.avoidKeys) ? [...sk.avoidKeys, ...planKeys(chart), ...chartQs.map(factKeyOf).filter((k) => k !== null), ...planKeys(teach)] : null;
    // (`lr6`: the detailed lesson maker's printed pages hold LR-6 for + / − items and stories - lesson 2 r4)
    if (packNums) practiceSk = Object.assign({}, practiceSk, { avoidKeys: packNums, lr6: true }, n.edgeLast ? { edgeLast: n.edgeLast } : {});
    // One-line answers: the engine fills the page (PAGE FILL, DN-1) - one frame, no row gaps,
    // because the count is the page's own. Taller problems: 12.1's six a page, 2 x 3, each cell
    // with its working space and Check line.
    // Lessons r2-r3: a rounding cell ("27 -> ___") is short and narrow: M prints three across like
    // L, and the lesson's own 15 at every size (never 12.1's 16 ceiling passed).
    const rounding = (teach.items || []).some((it) => it.pool === 'main' && it.template === 'pv');
    // div_facts: a practice page of one-number facts holds what its stand-alone Independent page
    // does at L (16, 2 x 8 for the across facts - critic R3 N-2: 15 printed 2 x 5 of tall cells)
    const divFactsOnly = (teach.items || []).filter((it) => it.pool === 'main').every((it) => /div_facts/.test(String(it.skill || '')));
    // ... and keeps the lesson's one across look (critic R3 N-2): no column count at which a
    // division fact's line would go under its sentence (a cell markedly taller there than in one column).
    const mainIts = (teach.items || []).filter((it) => it.pool === 'main');
    const reflow = (c) => mainIts.some((it) => it.template === 'equation' && it.measured && it.measured[1] && it.measured[c]
        && Number.isFinite(it.measured[1].hMm) && Number.isFinite(it.measured[c].hMm) && it.measured[c].hMm > it.measured[1].hMm * 1.25);
    const besideCap = [4, 3, 2].find((c) => !reflow(c)) || 1;
    const section = facts ? { skills: [practiceSk], pages: 0, noCap: true, dense: rounding ? { S: 15, M: 15, L: 15 } : { S: 16, M: 16, L: divFactsOnly ? 16 : 15 }, ...(besideCap < 4 ? { maxCols: besideCap } : {}) } : { skills: [practiceSk], count: 0, columns: 2, noCap: true, ...(practiceSk.instructionKey ? { instructionKey: practiceSk.instructionKey } : {}) };
    // (a ref's `instructionKey` - the detailed lesson maker, lesson 2 - heads its Practice section too)
    // Taller problems: 12.1's six a page (2 x 3) at every size - an Independent page holds 6 at
    // most, so M is the same six cells in smaller type (lessons r2: by design, not a missed gain).
    // `practiceShape` (lesson data; the detailed lesson maker): a one-line item too wide for two
    // columns prints [count, cols] a page instead (expanded form: 8 x 1).
    const stackShapes = data && Array.isArray(data.practiceShape) ? [data.practiceShape] : [[6, 2]];
    // Lessons r3: fifteen rounding cells fill an M page with cells three times their content (a
    // 33 % empty band); the same fifteen print at L type, which fills them - the page holds the
    // same count either way, so the pupil gets the bigger digits.
    const practiceSize = rounding ? 'L' : size;
    const practiceReq = (pages, withStrip, shape = stackShapes[stackShapes.length - 1]) => Object.assign({}, common, {
        size: practiceSize,
        role: 'independent', tabId: `Practice ${lessonNo}`,
        sections: [facts ? Object.assign({}, section, { pages }) : Object.assign({}, section, { count: shape[0] * pages, columns: shape[1] })],
        seed: (n.seed + 7919) >>> 0,
        // (At L type the strip's words are a point bigger: 2 mm more for it.)
        stepStrip: withStrip && stripHtml ? (practiceSize === size ? { html: stripHtml, hMm: stripH }
            : { html: strip.render(resolveCtx({ size: practiceSize, look: 'ican', mode: 'print' })), hMm: stripH + 2 }) : undefined,
    });
    const practiceTried = [];
    const practiceTexts = [];
    // `practiceSheets` (the detailed lesson maker, V22 §9.5): each Practice page its OWN sheet -
    // tab "Practice k", letters from a, its own Score - with its own skill ref and grid shape
    // [count, cols]; the step strip on the lesson skill's sheets only. Absent: the pages below.
    if (Array.isArray(n.practiceSheets) && n.practiceSheets.length) {
        let k = 0;
        for (const ps of n.practiceSheets) {
            k++;
            const own = ps.skill ? Object.assign({}, ps.skill, packNums ? { avoidKeys: packNums.slice(), tries: Math.max(300, Number(ps.skill.tries) || 0), lr6: true } : {}) : practiceSk;
            const shape = Array.isArray(ps.shape) ? ps.shape : stackShapes[stackShapes.length - 1];
            const sk1 = Object.assign({}, own, n.edgeLast || ps.edgeLast ? { edgeLast: ps.edgeLast || { per: shape[0], cols: shape[1] } } : {});
            const withStrip = !ps.skill && stripHtml;
            const res = await buildSheet(Object.assign({}, common, {
                size: practiceSize, role: 'independent', tabId: `Practice ${k}`,
                // (the pack's own tab: every Practice sheet names the lesson's strand)
                header: Object.assign({}, common.header, Array.isArray(n.packTab) ? { tab: [...n.packTab, `Practice ${k}`] } : {}),
                sections: [{ skills: [sk1], count: shape[0], columns: shape[1], noCap: true }],
                seed: (n.seed + 7919 * k) >>> 0,
                // (`strip`: another chunk's step strip - the words sheet carries the words steps.)
                stepStrip: ps.strip && ps.strip.html ? ps.strip : withStrip ? { html: stripHtml, hMm: stripH } : undefined,
            }));
            parts.push({ part: 'practice', role: 'independent', res, strip: /data-mq-lesson-strip/.test(res.pupilHtml), sheet: k });
            for (const it of res.items || []) practiceTexts.push(refText(it));
            if (packNums) packNums.push(...planKeys(res));
        }
    } else if (n.practicePages > 0) {
        let res = null;
        for (const shape of facts ? [null] : stackShapes) {
            const r = await buildSheet(practiceReq(n.practicePages, true, shape || undefined));
            const f0 = r.fits && r.fits.sections && r.fits.sections[0];
            const whole = f0 ? f0.clamped !== true : true;
            practiceTried.push({ shape, pages: r.pageCount, clamped: !whole, hMin: f0 && f0.hMin, cellH: f0 && f0.cellH, stripH: +stripH.toFixed(1) });
            if (r.pageCount <= n.practicePages && whole) { res = r; break; }
        }
        // The strip never pushes a page overleaf: without room for it the page prints without it.
        if (!res) res = await buildSheet(practiceReq(n.practicePages, false));
        parts.push({ part: 'practice', role: 'independent', res, strip: /data-mq-lesson-strip/.test(res.pupilHtml) });
        for (const it of res.items || []) practiceTexts.push(refText(it));
        if (packNums) packNums.push(...planKeys(res));
    }

    // 3. Mixed practice (optional): the lesson skill with EARLIER skills only (lessons r1), each
    // skill its own section, the page filled in one frame per section.
    if (n.mixed) {
        const withSkills0 = n.mixedSkills || (data && data.mixWith ? data.mixWith.map(skillRef) : earlierSkills(sk, 2));
        const withSkills = packNums ? withSkills0.map((w) => Object.assign({}, w, { avoidKeys: packNums.slice(), tries: Math.max(200, Number(w.tries) || 0), lr6: true })) : withSkills0;
        const res = await buildSheet(Object.assign({}, common, {
            // The lesson's own look (I Can) unless the teacher chose Daily for the packet.
            // Lessons r2: the lesson's own skill fills at least half the page (its weight is the
            // partners' together), the earlier skills the rest.
            role: 'mixed-practice', look: n.lookAsked === 'daily' ? 'daily' : 'ican',
            // Lessons r3: never a problem the Practice page printed; the lesson skill at least
            // half the placed items (`leadHalf`, enforced after packing).
            sections: [{ skills: [Object.assign({}, practiceSk, { weight: Math.max(1, withSkills.length) + 0.5, avoidTexts: practiceTexts }, packNums ? { avoidKeys: packNums.slice(), edgeLast: undefined } : {}), ...withSkills] }], latticeN: n.mixedLattice || 6, leadHalf: true, leadDrop: !!(packNums && n.mixedLeadDrop), growLast: !!packNums,
            seed: (n.seed + 15838) >>> 0,
            // (`mixedStrip: false`, the detailed lesson maker - critic D18: one routine's Steps do not head a mixed page)
            stepStrip: stripHtml && n.mixedStrip !== false ? { html: stripHtml, hMm: stripH } : undefined,
            ...(Array.isArray(n.packTab) ? { header: Object.assign({}, common.header, { tab: [...n.packTab, 'Mixed 1'] }) } : {}),
        }));
        parts.push({ part: 'mixed', role: 'mixed-practice', res });
    }

    // Each part is a sheet of its own (its own header, Score and page count), and the anchor chart
    // is a sheet apart from the lesson pages: `data-ws-sheet` says so on every page, so a page is
    // only ever compared with the pages of its own sheet.
    const tagSheets = (html, first, rest) => {
        let k = 0;
        return String(html || '').replace(/<section class="ws-page/g, (m) => `<section data-ws-sheet="${k++ === 0 ? first : rest}" class="ws-page`);
    };
    const sheetIds = (p) => (p.part === 'teach' ? ['lesson-sheet', 'lesson-sheet'] : [`lesson-${p.part}`, `lesson-${p.part}`]);
    const pupilHtml = parts.map((p) => tagSheets(p.res.pupilHtml, ...sheetIds(p))).join('\n');
    const keyHtml = n.key ? parts.map((p) => tagSheets(p.res.keyHtml || '', ...sheetIds(p))).join('\n') : '';
    const pageCount = parts.reduce((a, p) => a + (p.res.pageCount || 0), 0);
    const keyPageCount = n.key ? parts.reduce((a, p) => a + (p.res.keyPageCount || 0), 0) : 0;
    const notes = [...new Set(sizeNote.concat(parts.flatMap((p) => p.res.notes || [])))];
    const PART_NAME = { chart: 'Anchor chart', teach: 'Lesson', practice: 'Practice', mixed: 'Mixed' };
    const line = parts.map((p) => `${PART_NAME[p.part]}: ${p.res.pageCount} page${p.res.pageCount === 1 ? '' : 's'}`).join(' · ');
    const tagPages = (list, p) => { const ids = sheetIds(p); return (list || []).map((h, i) => tagSheets(h, i === 0 ? ids[0] : ids[1], ids[1])); };
    return {
        pupilHtml, keyHtml, pageCount, keyPageCount,
        pupilPages: parts.flatMap((p) => tagPages(p.res.pupilPages, p)),
        keyPages: n.key ? parts.flatMap((p) => tagPages(p.res.keyPages, p)) : [],
        keyPlans: parts.flatMap((p) => p.res.keyPlans || [p.res.plan]),
        // Each part's plans (the detailed lesson maker reads the printed items from them).
        partPlans: parts.map((p) => ({ part: p.part, plans: p.res.keyPlans || [p.res.plan] })),
        fits: { cols: teach.fits.cols, rows: teach.fits.rows, pages: pageCount, note: [`${line}.`, teach.fits.note].filter(Boolean).join(' '), sections: teach.fits.sections },
        items: parts.flatMap((p) => (p.res.items || []).map((it) => Object.assign({ part: p.part }, it))),
        // The problems the pupil does (lessons r3: the print panel counted every dealt pool item,
        // "46 problems" for 13): the teaching sheet's lettered items, then each page's own.
        problemCount: parts.reduce((a, p) => a + (p.part === 'chart' ? 0
            : p.part === 'teach' ? Number((p.res.plan && p.res.plan.meta && p.res.plan.meta.items) || 0)
                : (p.res.items || []).length), 0),
        gaps: parts.flatMap((p) => p.res.gaps || []),
        anchors: teach.anchors,
        floors: teach.floors,
        // The practice step strip (a chunked detailed lesson hands chunk 2's to its words sheet).
        strip: stripHtml ? { html: stripHtml, hMm: stripH } : null,
        seed: n.seed,
        role: 'lesson',
        title: teach.title,
        notes,
        plan: teach.plan,
        lesson: {
            skill: `${sk.categoryId}:${sk.skillId}`, tags: { ccss, ee, line: tagLine },
            prerequisites: data
                ? { skills: data.skills.map((s) => s.key), concepts: data.concepts.map((c) => c.text), vocab: data.vocab.map((v) => v.word) }
                : { skills: warmSkills.map((s) => `${s.categoryId}:${s.skillId}`), concepts: [], vocab: [] },
            steps: data ? data.steps.map((s) => s.text) : [], chant: data ? data.chant : '', format: data ? data.format : null,
            parts: parts.map((p) => ({ part: p.part, role: p.role, pages: p.res.pageCount, keyPages: p.res.keyPageCount, strip: p.strip })),
            example: chart.plan && chart.plan.meta ? chart.plan.meta.example : '',
            chart: chart.plan && chart.plan.meta ? { zoom: chart.plan.meta.chartZoom, example2: chart.plan.meta.example2, example2Found: chart.plan.meta.example2Found, sizing: chart.plan.meta.chartSizing, example3: chart.plan.meta.example3, example4: chart.plan.meta.example4, exampleQs: chart.plan.meta.exampleQs || [] } : null,
            practiceTried,
            teach: teach.plan && teach.plan.meta ? { bands: teach.plan.meta.bandSizes, guided: teach.plan.meta.guided, independent: teach.plan.meta.independent } : null,
            size,
        },
    };
}

/* ================================================================== the detailed lesson */

/**
 * THE DETAILED LESSON MAKER (Atomisation Lesson Planner V22, Appendix I;
 * design/lesson-planner/DETAILED_MAKER.md): the whole teacher + pupil pack of one lesson of
 * js/modules/lessons/detailed/, in V22 pack order -
 *
 *   T1 · T2 (+ continuation) · T2b · T3 · T4 · T5 · P0 · P1 · P2 · P3 · P4 x n (+ Mixed) · P5 · P6 (2-up)
 *   · the keys of every pupil page in packet order (anchor chart included) · T6 routing
 *
 * The pupil pages REUSE the site's roles (Owner default Q1): P0 `pre-skill-check`, P2 + P3 + P4 + Mixed
 * the standard lesson packet (`buildLesson`, fed the description's chart data as `lessonData`), P1 an
 * `independent` Daily-look page of two five-item bands. P5 and P6 and the teacher pages are drawn by
 * sheet/roles/detailed-lesson.js. ONE seed drives every page; every item is dealt by
 * generateQuestionFor through the skill refs, with the pack's avoid set (LR-5: a number dealt on one
 * page is never dealt again) and the last-row rule (★★★ edge cases).
 *
 * req = {role: 'detailed-lesson', lessonId, seed, paper: 'A4'|'Letter', year?}
 * -> {pages: [{id, kind: 'teacher'|'pupil'|'key', html}], html (one document), pool, notes, title, seed, items}
 */
const DL_FADE0 = { P0: '★★', P1: '★★', P5: '★', P6: '★★★' };
/** Every cell a plan prints, with its page, grid and row: [{page, grid, row, q}] (plan order). */
function planCells(plan) {
    const out = [];
    const plans = plan && plan.sheets && plan.sheets.length ? plan.sheets : (plan ? [plan] : []);
    let pageNo = 0;
    for (const p of plans) for (const pg of (p.pages && p.pages.length ? p.pages : [{ sections: p.sections || [] }])) {
        pageNo++;
        let gridNo = 0;
        const walk = (part) => {
            if (!part) return;
            if (part.kind === 'grid') {
                const cols = part.cols || 2;
                (part.items || []).forEach((it, i) => { if (it && it.q) out.push({ page: pageNo, grid: gridNo, row: Math.floor(i / cols), q: it.q }); });
                gridNo++;
                return;
            }
            if (part.content) walk(part.content);
            (part.contents || []).forEach(walk);
            (part.parts || []).forEach(walk);
        };
        (pg.sections || []).forEach(walk);
    }
    return out;
}
/** An item's representation for the pool (LR-5): its skill id. */
// (an arrays-turn item adds its task, lesson 3a: an array and its turn, a known fact, facts only are three
// forms of one skill - three Practice sheets' cells are compared each among their own, PG-11)
const dlRep = (q) => String((q && q.skillId) || '') + (q && q.cell && q.cell.template === 'arrays-turn' && q.cell.payload && q.cell.payload.type ? `:${q.cell.payload.type}` : '');
const dlTag = (html, id, kind) => String(html).replace(/<section (data-ws-sheet="[^"]*" )?class="ws-page/, (m, sh) => `<section data-dl-page="${id}" data-dl-kind="${kind}" ${sh || ''}class="ws-page`);
const dlAns = (q) => (q && typeof q.ans === 'object' ? (Array.isArray(q.ans) ? q.ans.join(', ') : JSON.stringify(q.ans)) : String(q && q.ans !== undefined ? q.ans : ''));
/** A `want`: a case test of roles/lesson.js (bigFirst, pvZeroTens, ...); '' or unknown = any item. */
// (a list of names: every test must pass - lesson 2 r4, the exit slip's situation AND its case)
const dlWant = (want) => (Array.isArray(want) ? (want.every((w) => LESSON_CASE_TESTS[w]) && want.length ? (it) => want.every((w) => LESSON_CASE_TESTS[w](it)) : null) : (want && LESSON_CASE_TESTS[want]) || null);

/** One question of `ref` that passes `want`, never a fact key in `used`; seeded, so reproducible. */
function dealOne(ref, seed, used, want, avoidAns = null, near = null, names = null) {
    const ok = dlWant(want);
    for (let k = 0; k < 600; k++) {
        let q = null;
        try { q = generateQuestionFor(Object.assign({ category: ref.categoryId, skill: ref.skillId, opts: ref.opts, seed: (seed + 7919 * k) >>> 0, itemIndex: k % 6 }, ref.range ? { range: ref.range } : {})); } catch (e) { q = null; }
        if (!q) continue;
        if (ref.cellPayload && q.cell && q.cell.payload) q = Object.assign({}, q, { cell: Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, ref.cellPayload) }) });
        if (ref.instructionKey && q) q = Object.assign({}, q, { instructionKey: ref.instructionKey });
        if (ref.shortQuestion) q = shortStoryQ(q);
        const key = factKeyOf(q), v = itemNumberOf(q);
        if (key === null || used.has(key) || (ok && !ok({ q }))) continue;
        // (an array's turned pair is the same two pictures: not dealt again unless the ref allows it - the Check
        // Question on the board may turn a Guided array, lesson 3a `turnedOk`)
        if (!ref.turnedOk && turnedKeyOf(q) !== null && used.has(turnedKeyOf(q))) continue;
        if (avoidAns && avoidAns.has(dlAns(q))) continue;
        if (!refHardOk(ref, q)) continue;
        // (`near`: the page's one-number items by skill - LR-6 no near twins, critic r3 N1)
        const nv = near ? nearKeyOf(q) : null;
        if (nv !== null && [-2, -1, 1, 2].some((dv) => near.has(`${ref.skillId}:${nv + dv}`))) continue;
        // (`near` is the page's LR-6 set: + / − items and stories too - lesson 2 r4, critic r2 D2;
        // `names`: story names already used by the pack's other dealt stories - critic r2 n6)
        if (near && !lr6Ok(q, ref.skillId, near)) continue;
        const nms = names ? lr6Of(q).names : [];
        if (nms.some((x) => names.has(x))) continue;
        if (nv !== null) near.add(`${ref.skillId}:${nv}`);
        if (near) lr6Record(q, ref.skillId, near);
        for (const x of nms) names.add(x);
        used.add(key);
        return { q, v, key };
    }
    throw new Error(`detailed lesson: no ${ref.skillId} item for "${want || 'any'}"`);
}

/**
 * The placeholder values of ONE dealt item, from the kit's own readers (compose.js): its number,
 * answer, operands and sign, the filled oral frame, the number's name; then the description's own
 * `vars(q, base)` hook adds the lesson's names (place-value parts, story roles ...). No family
 * code lives here.
 */
function dlItemVars(q, d) {
    if (!q) return null;
    const n = itemNumberOf(q);
    const ops = composeOperandsOf(q);
    const base = {
        n: n === null ? '' : n, ans: dlAns(q), text: refText(q), a: ops[0], b: ops[1], op: composeGlyphOf(composeOpOf(q)),
        say: composeOralFrameOf({ q }, { fill: true }) || '', words: n !== null && n >= 0 && n <= 1000 ? numberWords(n) : '',
        Words: n !== null && n >= 0 && n <= 1000 ? numberWords(n).replace(/^./, (c) => c.toUpperCase()) : '',
    };
    // `wrong`: the item's own wrong answers, from its provider, by misconception id without dashes
    // ({x.wrong.MV9} = 83039 for 839): a script or mistake row quotes an error form of a DEALT item,
    // never a typed one (critic r3 S3: "300407 for three hundred seven" was typed and wrong).
    base.wrong = dlWrongs(q);
    let extra = {};
    try { extra = typeof d.vars === 'function' ? d.vars(q, base) || {} : {}; } catch (e) { extra = {}; }
    return Object.assign(base, extra);
}

/** {misconceptionId (dashes removed): display} of one item, from its provider (wrongAnswers, else wrongAnswer rotated). */
function dlWrongs(q) {
    const out = {};
    let p = null;
    try { p = getProvider(q.categoryId || '', q.skillId || ''); } catch (e) { p = null; }
    if (!p) return out;
    const right = dlAns(q);
    const put = (w) => { if (!w || w.display === undefined || !w.misconception || w.correct) return; const k = String(w.misconception).replace(/[^A-Za-z0-9]/g, ''); if (!(k in out) && String(w.display) !== right) out[k] = String(w.display); };
    let all = null;
    try { all = typeof p.wrongAnswers === 'function' ? p.wrongAnswers(q) : null; } catch (e) { all = null; }
    if (Array.isArray(all)) all.forEach(put);
    for (let s = 0; typeof p.wrongAnswer === 'function' && s < 24; s++) { let w = null; try { w = p.wrongAnswer(Object.assign({}, q, { seed: s })); } catch (e) { w = null; } put(w); }
    return out;
}

/**
 * The Check Question's options (V22 Appendix I): the main skill provider's wrong answers. The
 * provider names each by its misconception; the description's mistakes claim an option letter by
 * that name (`option`, `misconception`). Distinct wrong answers are collected by asking the
 * provider on copies of the item that differ only in their seed (its rotation start).
 */
function dlCheckQuestion(q, d) {
    let right = dlAns(q);
    const wrongs = [];
    let p = null;
    try { p = getProvider(q.categoryId || '', q.skillId || ''); } catch (e) { p = null; }
    // A provider that lists EVERY misconception (`wrongAnswers`, with the right answer written the
    // same way as `correct: true`) gives the options directly; else the one `wrongAnswer`, rotated.
    let all = null;
    try { all = p && typeof p.wrongAnswers === 'function' ? p.wrongAnswers(q) : null; } catch (e) { all = null; }
    if (Array.isArray(all) && all.length) {
        const r = all.find((w) => w.correct);
        if (r) right = String(r.display);
        for (const w of all) if (!w.correct && w.display !== undefined && !wrongs.some((x) => x.display === String(w.display))) wrongs.push({ display: String(w.display), misconception: w.misconception || '' });
    }
    const fromAll = wrongs.length > 0;
    for (let s = 0; p && !fromAll && typeof p.wrongAnswer === 'function' && s < 40 && wrongs.length < 6; s++) {
        let w = null;
        try { w = p.wrongAnswer(Object.assign({}, q, { seed: s })); } catch (e) { w = null; }
        if (!w || w.display === undefined) continue;
        const disp = String(w.display);
        if (disp === right || wrongs.some((x) => x.display === disp)) continue;
        wrongs.push({ display: disp, misconception: w.misconception || '' });
    }
    const cq = d.checkQuestion || {};
    const correct = cq.correct || 'D';
    const letters = ['A', 'B', 'C', 'D'];
    const out = {}, why = [];
    const claimed = (d.mistakes || []).filter((m) => m.option && m.misconception);
    for (const m of claimed) {
        const w = wrongs.find((x) => x.misconception === m.misconception && !Object.values(out).includes(x.display));
        if (w && m.option !== correct) { out[m.option] = w.display; why.push(`${m.option}: ${m.name}`); }
    }
    out[correct] = right;
    for (const L of letters) if (!out[L]) { const w = wrongs.find((x) => !Object.values(out).includes(x.display)); if (w) out[L] = w.display; }
    for (const L of letters) if (!out[L]) out[L] = '—';
    // (`checkQuestion.show(value, q)`, lesson 3a: each option written as the fact a pupil reads, not a bare value)
    if (typeof cq.show === 'function') { for (const L of letters) if (out[L] !== '—') out[L] = cq.show(out[L], q); right = cq.show(right, q); }
    return Object.assign({ right: `${correct} ${right}`, why: why.join(' · ') || 'each wrong option is a mistake from T2.' }, out);
}

/**
 * Measure teacher blocks (mm) at the teacher body width, in an off-screen frame that loads EXACTLY
 * the printed document's stylesheets (sheetDocument): the app page's own CSS (tables, lists) would
 * measure them taller than they print.
 */
async function measureTeacherBlocks(bandsList) {
    if (typeof document === 'undefined' || !document.body) return bandsList.map((bands) => bands.map((b) => b.blocks.map(() => 20)));
    const css = `<style data-dl-css>${TEACHER_CSS}${RCDWS_CSS}${DETAILED_PUPIL_CSS}</style>`;
    const shell = '<section class="ws-page ws-L ws-ican dl-page dl-teacher" style="height:auto;overflow:visible"><main class="ws-body dl-body" style="flex:none"></main></section>';
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:absolute;left:-12000px;top:0;width:900px;height:1200px;visibility:hidden;border:0;';
    document.body.appendChild(frame);
    try {
        await new Promise((res) => { frame.onload = res; frame.srcdoc = sheetDocument(css + shell, 'measure'); setTimeout(res, 8000); });
        const fd = frame.contentDocument;
        try { if (fd.fonts) await Promise.race([fd.fonts.ready, new Promise((r) => setTimeout(r, 3000))]); } catch (e) { /* measure anyway */ }
        const body = fd.querySelector('main');
        const mm = (el) => (el ? el.getBoundingClientRect().height : 0) / PX_PER_MM;
        body.innerHTML = tBand('Lesson flow:', '');
        const over = mm(body.firstElementChild);
        return bandsList.map((bands) => bands.map((b) => b.blocks.map((html) => {
            if (!html) return 0;
            body.innerHTML = measureShell(html);
            // (every element of the block, first top to last bottom: a block may be a table AND its foot line)
            const bi = body.firstElementChild.firstElementChild;
            const kids = bi ? [...bi.children] : [];
            if (!kids.length) return mm(body.firstElementChild);
            const top = Math.min(...kids.map((k) => k.getBoundingClientRect().top)), bot = Math.max(...kids.map((k) => k.getBoundingClientRect().bottom));
            return (bot - top) / PX_PER_MM;
        })).map((hs) => Object.assign(hs, { over })));
    } finally { frame.remove(); }
}

async function buildDetailedLesson(req = {}) {
    const d = detailedLessonFor(req.lessonId);
    if (!d) throw new Error(`buildSheet: no detailed lesson "${req.lessonId}"`);
    const errs = validateDescription(d);
    if (errs.length) throw new Error(`detailed lesson ${d.id}: ${errs.join('; ')}`);
    const seed = Number.isFinite(Number(req.seed)) && req.seed !== null && req.seed !== '' ? (Number(req.seed) >>> 0) : 4242;
    const paper = /letter/i.test(String(req.paper || '')) ? 'Letter' : 'A4';
    const notes = [];

    // ---------------------------------------------------------------- tags
    // The LESSON's tags (the description), each validated against standards.js: a CCSS code must be
    // a SKILL_STANDARDS tag (either form, 2.NBT.A.3 / 2.NBT.3) of one of the lesson's skills, an EE
    // one of their EEs. A tag that fails is dropped and named in the notes.
    const st0 = await loadStandards();
    const lessonSkills = [d.skill, ...(d.mixed ? d.mixed.skills : []), ...((d.practiceSheets || []).map((x) => x.skill).filter(Boolean))];
    const recs = { ccss: [], ee: [] };
    for (const sk of lessonSkills) { try { const st = st0 ? st0.standardsFor(sk.categoryId, sk.skillId) : null; if (st) { recs.ccss.push(...(st.ccss || [])); recs.ee.push(...(st.ee || [])); } } catch (e) { /* none */ } }
    const ccssOf = (c) => { const r = recs.ccss.find((x) => x.code === c || x.short === c); return r ? (r.code || r.short) : null; };
    const tags = { ccss: d.ccss.map(ccssOf).filter(Boolean), ee: d.ee.filter((c) => recs.ee.some((r) => r.code === c)) };
    for (const c of d.ccss) if (!ccssOf(c)) notes.push(`Tag check: ${c} is not a SKILL_STANDARDS tag of the lesson's skills: dropped.`);
    for (const c of d.ee) if (!tags.ee.includes(c)) notes.push(`Tag check: ${c} is not an EE of the lesson's skills: dropped.`);
    // V22 §8.7: the full code on every page (owner Q5, 2026-10-16).
    // (the pack is named by its lesson id, not one of its skills - critic N2)
    const tagLine = lessonTagLine({ skillId: d.id, grade: d.grade, ccss: tags.ccss, ee: tags.ee });
    const year = req.year || new Date().getFullYear();
    const tab = (id) => [`Level ${d.level}`, d.strand, id];
    const header = (id, extra = {}) => Object.assign({ title: d.title, footerLeft: tagLine, tab: tab(id), year }, extra);
    const used = new Set();
    // `boardOnly` (critic r3 S1): numbers the lesson shows on the board only - every ref of the pack
    // carries them as a HARD bound (refHardOk), so no pupil page or key ever deals one.
    const boardOnly = Array.isArray(d.boardOnly) ? d.boardOnly.map(Number).filter(Number.isFinite) : [];
    const bo = (r) => (r && boardOnly.length ? Object.assign({}, r, { boardOnly }) : r);
    const withAvoid = (r) => Object.assign({}, bo(r), { avoidKeys: [...used], tries: 300 });
    const recordPlan = (plan) => { for (const c of planCells(plan)) { const k = factKeyOf(c.q); if (k !== null) used.add(k); } };
    const partPlan = (part) => ((lesson && lesson.partPlans) || []).filter((x) => x.part === part).flatMap((x) => x.plans);
    const record = (res) => { for (const pp of res.partPlans || []) for (const pl of pp.plans) recordPlan(pl); if (res.plan) recordPlan(res.plan); };
    const shape = (d.lessonData && d.lessonData.practiceShape) || [6, 2];

    // ---------------------------------------------------------------- Chunked Flow (V22): chunks 2..n
    // A description with `chunks` teaches its routine in paired I Do / We Do cycles. Chunk 1 is the
    // description's own skill and chart data (the packet below); every further chunk is its own
    // anchor chart and lesson sheet (no practice of its own), built first so its step strip can head
    // the Practice sheet that names it (`practiceSheets[k].chunk`).
    const chunks = Array.isArray(d.chunks) && d.chunks.length > 1 ? d.chunks : null;
    const chunkRes = [];
    for (const [ci, ch] of (chunks ? chunks.slice(1) : []).entries()) {
        const r = await buildSheet({
            role: 'lesson', sections: [{ skills: [withAvoid(Object.assign({ edgeTest: d.edgeTest }, ch.skill))] }], lessonData: ch.lessonData, size: 'L', paper, seed: (seed + 53 * (ci + 1)) >>> 0, key: true,
            practicePages: 0, mixed: false, header: { title: d.title, year }, tagLine, packTab: [`Level ${d.level}`, d.strand], lesson: `1${ch.id}`,
        });
        record(r);
        chunkRes.push({ ch, r });
    }
    const chunkStrip = (id) => { const c = chunkRes.find((x) => x.ch.id === id); return c && c.r.strip ? c.r.strip : null; };

    // ---------------------------------------------------------------- P2 · P3 · P4 · Mixed
    // The standard lesson packet, fed the description's chart data (prereqs.js untouched).
    const lesson = await buildSheet({
        role: 'lesson', sections: [{ skills: [withAvoid(Object.assign({ edgeTest: d.edgeTest }, d.skill))] }], lessonData: d.lessonData, size: 'L', paper, seed, key: true,
        practicePages: d.practicePages || 1, practiceSheets: d.practiceSheets ? d.practiceSheets.map((ps) => Object.assign({}, ps, ps.skill ? { skill: bo(ps.skill) } : {}, ps.chunk ? { strip: chunkStrip(ps.chunk) } : {})) : null,
        mixed: !!d.mixed, mixedSkills: d.mixed ? d.mixed.skills.map(bo) : null, mixedLattice: d.mixed && d.mixed.lattice, mixedLeadDrop: !!(d.mixed && d.mixed.leadDrop), mixedStrip: d.mixed && d.mixed.strip === false ? false : undefined,
        ...(chunks ? { lesson: `1${chunks[0].id}` } : {}),
        header: { title: d.title, year }, tagLine, packTab: [`Level ${d.level}`, d.strand], edgeLast: req.edgeLast || { per: shape[0], cols: shape[1] },
    });
    record(lesson);
    // (the chart's board examples too - lesson 2's add-to story is written on the board, not printed - so no
    // later page deals one: LR-5, E24 "chart examples never return")
    for (const q of ((lesson.lesson && lesson.lesson.chart && lesson.lesson.chart.exampleQs) || []).filter(Boolean)) { const k = factKeyOf(q); if (k !== null) used.add(k); }

    // ---------------------------------------------------------------- P0 Prerequisite Check
    const p0 = await buildSheet({
        role: 'pre-skill-check', sections: [{ skills: d.prerequisites.map((p) => Object.assign(withAvoid(p.ref), { lr6: true })) }], perQuestion: d.prerequisites.map((p) => p.items || 2),
        size: 'L', paper, seed: (seed + 101) >>> 0, key: true, header: header('Prerequisite'),
    });
    record(p0);
    // (the chart's examples are step panels, not plan cells: no later dealt item repeats one - V22 LR-5, lesson
    // 3a; arrays only, the one kind whose few facts the pack can run out of - every other pack deals as before)
    for (const q of ((lesson.lesson && lesson.lesson.chart && lesson.lesson.chart.exampleQs) || []).filter(Boolean)) { const k = turnedKeyOf(q) !== null ? factKeyOf(q) : null; if (k !== null) used.add(k); }

    // ---------------------------------------------------------------- P1 Number sense (Daily look)
    const frameP = (id, score) => ({
        header: { name: true, date: true, score, tab: tab(id), title: d.title },
        footer: { left: tagLine, right: `Form A · seed ${seed}`, year }, seed, form: 'A',
    });
    const nsAns = new Set(), nsNear = new Set();
    const nsBands = ['A', 'B'].map((k, bi) => {
        const ns = d.numberSense[k];
        // `items` (V22 §9.2, critic D11): five bank TYPES, one a row, the same order in A and B, each
        // row its item's own library instruction; else one ref five times (`ref`, `wants`).
        const refs = Array.isArray(ns.items) ? ns.items : Array.from({ length: 5 }, () => ns.ref);
        // (LR-6: no two answers alike on the page - critic r2, 29 and 29)
        const dealt = refs.map((r, i) => { const x = dealOne(bo(r), (seed + 211 + 1009 * bi + 131 * i) >>> 0, used, r.want || (ns.wants || [])[i] || ns.want || '', nsAns, nsNear); nsAns.add(dlAns(x.q)); return x; });
        const its = dealt.map((x, i) => hostItem({ q: x.q, skill: Object.assign({}, refs[i]) }, 0, 'L'));
        for (const it of its) if (Array.isArray(ns.items)) it.nsInstr = composeInstrText(composeInstrKeyOf([it], refs), [it]);
        return { label: `Number sense: ${k}`, instr: ns.instruction, its };
    });
    const nsAll = nsBands.flatMap((b) => b.its);
    measureItems(nsAll, { size: 'L', look: 'daily', colsList: [1] });
    const nsOwn = Math.max(14, ...nsAll.map((it) => (it.measured && it.measured[1] && Number.isFinite(it.measured[1].hMm) ? it.measured[1].hMm : 18)));
    // Ten rows share the body (V22 §9.2: about 22 mm each): a cell measured taller (a fact cell's
    // working room) still prints at the share - P1 rows are one-line items.
    const nsShare = (236 - 2 * 11 - 4) / 10;
    const nsCellH = Math.min(nsShare, Math.max(nsOwn, Math.min(nsOwn * 1.3, nsShare)));
    const p1Plan = numberSensePlan({ bands: nsBands.map((b) => ({ label: b.label, instr: b.instr, items: b.its.map((it) => Object.assign(composePlanItem(it, { cols: 1, level: 1 }), it.nsInstr ? { instr: it.nsInstr } : {})) })), cellH: nsCellH }, frameP('Number sense', 10));
    const p1r = renderPlan(p1Plan, { key: true });
    const p1 = { pupilPages: p1r.pupilPages, keyPages: p1r.keyPages, plan: p1Plan };

    // ---------------------------------------------------------------- dealt items for P5, P6, scripts
    // (lesson 2 r4, critic r2 D2 / n6: the exit slip is ONE page for LR-6 - no answer twice, no near
    // twins, no first addend twice; P5, the slip and the Check Question tell stories of different people)
    const storyNames = new Set(), exAns = new Set(), exNear = new Set();
    const wpD = dealOne(bo(d.wordProblem.ref), (seed + 307) >>> 0, used, d.wordProblem.want, null, null, storyNames);
    const exitD = d.exit.map((e, i) => { const x = dealOne(bo(e.ref), (seed + 401 + 97 * i) >>> 0, used, e.want, exAns, exNear, storyNames); exAns.add(dlAns(x.q)); return x; });
    const retD = (d.retrieval || []).map((r, i) => dealOne(bo(r.ref), (seed + 503 + 89 * i) >>> 0, used));
    // (`checkQuestion.ref`, lesson 3a: the Check Question's own form of the skill; absent = the lesson skill)
    const cqD = dealOne(bo((d.checkQuestion || {}).ref || d.skill), (seed + 601) >>> 0, used, (d.checkQuestion || {}).want || '', null, null, storyNames);
    // The exit slip's Say line reads a FRESH item of the slip's kind, never one of its four (V22 §9.7).
    // (`exitSayItem` k - the detailed lesson maker, lesson 2: a story slip's Say reads ITS OWN item k, whose
    // story the pupil can see; a fresh item would be one the pupil never sees)
    const sayK = Number.isInteger(d.exitSayItem) && d.exitSayItem >= 0 && d.exitSayItem < exitD.length ? d.exitSayItem : null;
    const sayD = d.exitSay ? (sayK !== null ? exitD[sayK] : dealOne(bo(d.exit[0].ref), (seed + 701) >>> 0, used, '')) : null;

    // ---------------------------------------------------------------- P5 Word problem
    const wpV = dlItemVars(wpD.q, d);
    const storyText = String(wpD.q.text || '').replace(/<[^>]+>/g, ' ');
    const lines = Array.isArray(d.wordProblem.lines) && d.wordProblem.lines.length
        ? d.wordProblem.lines.map((l) => fillPlaceholders(l, { wp: wpV }))
        : storyText.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter(Boolean);
    // The equation frame: the lesson's own parts (`vars` hook `eqParts`), else the item's operands.
    const eqParts = Array.isArray(wpV.eqParts) && wpV.eqParts.length ? wpV.eqParts : [wpV.a, wpV.b].filter((x) => x !== undefined);
    const eqOp = wpV.eqOp || wpV.op || '+';
    wpV.eq = `${eqParts.join(` ${eqOp} `)} = ${wpV.ans}`;
    const wpPlan = wordProblemPlan({
        lines, answerLine: fillPlaceholders(d.wordProblem.answerLine, { wp: wpV }), wordsLine: d.wordProblem.wordsLine ? fillPlaceholders(d.wordProblem.wordsLine, { wp: wpV }) : '', words: wpV.words, say: fillPlaceholders(d.wordProblem.say, { wp: wpV }), n: wpV.ans, parts: eqParts, op: eqOp, signSlot: !!d.wordProblem.signSlot, item: String(wpD.key),
        instruction: d.wordProblem.instruction || INSTRUCTION_LIBRARY['story-rcdws'] || INSTRUCTION_LIBRARY.story,
    }, frameP('Word problem', 1));
    const p5 = renderPlan(wpPlan, { key: true });

    // ---------------------------------------------------------------- P6 Exit slip (2-up)
    const exitGen = exitD.map((x, i) => ({ q: x.q, skill: Object.assign({}, d.exit[i].ref) }));
    const exitItems = exitGen.map((g) => hostItem(g, 0, 'L'));
    measureItems(exitItems, { size: 'L', look: 'ican', colsList: [1, 2] });
    // GROUPS (critic D14: one slip, both chunks): a run of items of one skill and one instruction.
    // Each group takes two across when all its items fit a 66 mm column, else one; the groups share
    // the half's body by their own heights (up to 1.65x, H13). A group repeats the instruction
    // strip only when its instruction differs from the group above.
    const exGroups = [];
    exitItems.forEach((it, i) => {
        const e = d.exit[i], last = exGroups[exGroups.length - 1];
        const k = `${e.ref.categoryId}:${e.ref.skillId}|${e.instr || d.exitInstruction}`;
        if (last && last.k === k) last.idx.push(i); else exGroups.push({ k, instr: e.instr || d.exitInstruction, idx: [i] });
    });
    for (const g of exGroups) {
        const its = g.idx.map((i) => exitItems[i]);
        // (`exitCols` 1 - the detailed lesson maker, lesson 2: full-size bar items print one across a half)
        // (an exit item's own `cols` 1 | 2 - lesson 3a: the array and its turn one across, the facts two)
        const own = g.idx.map((i) => Number(d.exit[i].cols)).find((c) => c === 1 || c === 2);
        g.cols = own || (Number(d.exitCols) === 1 ? 1 : its.every((it) => !it.measured || !it.measured[2] || it.measured[2].fits !== false) ? 2 : 1);
        g.rows = Math.ceil(its.length / g.cols);
        g.own = Math.max(...its.map((it) => (it.measured && it.measured[g.cols] && Number.isFinite(it.measured[g.cols].hMm) ? it.measured[g.cols].hMm : 40)));
        if (g.cols === 1 && its.length > 1) notes.push('Exit slip: a group of items does not fit two across a 132.5 mm half; printed one across.');
    }
    exGroups.forEach((g, j) => { g.strip = j === 0 || g.instr !== exGroups[j - 1].instr; });
    // The half's body: 186 mm live - its header (26) - instructions (9 each) - Say (13) - self row (12) - footer (9).
    const exAvailAll = 186 - 26 - 9 * exGroups.filter((g) => g.strip).length - (d.exitSay ? 13 : 0) - 12 - 9;
    const exOwnAll = exGroups.reduce((a, g) => a + g.rows * g.own, 0);
    // (a one-across group of short sums grows least: its wide cells read empty soonest, H13)
    const capOf = (g) => (g.cols === 1 ? 1.12 : 1.65);
    let spare = Math.max(0, exAvailAll - exOwnAll);
    for (const g of exGroups) g.cellH = g.own;
    for (let pass = 0; pass < 3 && spare > 0.5; pass++) {
        const open = exGroups.filter((g) => g.cellH < g.own * capOf(g) - 0.01);
        const w = open.reduce((a, g) => a + g.rows * g.own, 0);
        if (!w) break;
        let used = 0;
        for (const g of open) { const add = Math.min(g.own * capOf(g) - g.cellH, spare * (g.rows * g.own / w) / g.rows); g.cellH += add; used += add * g.rows; }
        spare -= used;
    }
    const exCols = Math.max(...exGroups.map((g) => g.cols));
    const exitPlanItems = exitItems.map((it, i) => {
        const g = exGroups.find((x) => x.idx.includes(i));
        return composePlanItem(it, { cols: g.cols, level: 0 });
    });
    const exVars = exitD.map((x) => dlItemVars(x.q, d));
    const sayV = sayD ? dlItemVars(sayD.q, d) : null;
    const p6Plan = exitSlipPlan({
        items: exitPlanItems, instr: d.exitInstruction,
        groups: exGroups.map((g) => ({ instr: g.strip ? g.instr : '', items: g.idx.map((i) => exitPlanItems[i]), start: g.idx[0] + 1, cols: g.cols, cellH: g.cellH })),
        say: d.exitSay ? fillPlaceholders(d.exitSay, { say: sayV, exit: exVars }) : '', tab: tab('Exit slip'), title: d.title, cellH: exGroups[0].cellH, cols: exCols,
    }, { header: { name: false, date: false, score: false, tab: false, title: '' }, footer: { left: tagLine, right: `Form A · seed ${seed}`, year }, seed, form: 'A' });
    const p6 = renderPlan(p6Plan, { key: true });
    // INK-31 (critic D20): the keys the detailed role draws itself mark their answers the way every
    // other key does (key-short.js tagKeyAnswers: what differs from the pupil page takes the key ink);
    // the exit slip key's second half reads "Answer Key" too (critic D21).
    for (const r of [p1, p5, p6]) r.keyPages = (r.keyPages || []).map((k, i) => tagKeyAnswers(r.pupilPages[i] || '', k));
    // The Say blank of a key reads its answer (the item the frame names), in the key ink (critic r2 R10).
    const sayFill = (html, v) => String(html).replace(/(<span class="ws-line"[^>]*data-ws-slot="say-1"[^>]*)><\/span>/g, `$1 data-ws-key-ans>${String(v).replace(/</g, '&lt;')}</span>`);
    p5.keyPages = p5.keyPages.map((k) => sayFill(k, wpV.ans));
    // (`wordProblem.keyBar` - the detailed lesson maker, lesson 2: the pupil DRAWS the bar, so the key's Workspace
    // shows the bar a pupil should draw (schematic), its numbers in the key ink; V22 E17: a key drawing in a Workspace is not a slot)
    if (d.wordProblem.keyBar && eqParts.length === 2) {
        const W = 110, A = Number(eqParts[0]), B = Number(eqParts[1]);
        const wa = A === B ? W / 2 : (A > B ? 0.6 * W : 0.4 * W);   // schematic (RP-72): stock lengths, never to scale
        const bx = (w, v, l) => `<span data-ws-key-ans style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${w.toFixed(2)}mm;height:12mm;border:0.75pt solid #000;${l ? 'border-left:none;' : ''}font-size:22pt;font-weight:700;color:var(--ws-key-ink)">${escText(String(v))}</span>`;
        const bar = `<div role="img" aria-label="bar model" style="display:flex;flex-direction:column;gap:1.5mm">${bx(W, wpV.ans)}<div style="display:flex">${bx(wa, A)}${bx(W - wa, B, true)}</div></div>`;
        p5.keyPages = p5.keyPages.map((k) => String(k).replace('<div class="dl-work" data-work data-draw></div>', `<div class="dl-work" data-work data-draw style="display:flex;align-items:center;justify-content:center">${bar}</div>`));
    }
    if (sayD) p6.keyPages = p6.keyPages.map((k) => sayFill(k, dlAns(sayD.q)));
    p6.keyPages = p6.keyPages.map((k) => String(k).split('<div class="ws-field name">Name<i></i></div>').join(`<div class="ws-field name"><span data-ws-key="name">Answer Key</span><i></i></div>`));

    // ---------------------------------------------------------------- the pupil packet and its keys
    const sheetOf = (html) => (String(html).match(/data-ws-sheet="([^"]+)"/) || [])[1] || '';
    const lp = lesson.pupilPages || [], lk = lesson.keyPages || [];
    const P = [];
    const push = (id, html, key) => P.push({ id, html, key });
    p0.pupilPages.forEach((h, i) => push(i ? `P0-${i + 1}` : 'P0', h, (p0.keyPages || [])[i]));
    p1.pupilPages.forEach((h, i) => push(i ? `P1-${i + 1}` : 'P1', h, (p1.keyPages || [])[i]));
    let practiceNo = 0, mixedNo = 0, sheetNo = 0;
    lp.forEach((h, i) => {
        const s = sheetOf(h);
        const id = s === 'lesson-chart' ? 'P2' : s === 'lesson-sheet' ? (sheetNo++ ? `P3-${sheetNo}` : 'P3') : s === 'lesson-practice' ? `P4-${++practiceNo}` : `P4m-${++mixedNo}`;
        push(id, h, lk[i]);
    });
    // A chunk's chart follows the first chart, its lesson sheet the first sheet (P2b, P3b).
    for (const { ch, r } of chunkRes) {
        (r.pupilPages || []).forEach((h, i) => {
            const s = sheetOf(h);
            const id = s === 'lesson-chart' ? `P2${ch.id}` : `P3${ch.id}${i > 1 ? `-${i}` : ''}`;
            const pre = s === 'lesson-chart' ? /^P2/ : /^P3/;
            const at = P.reduce((a, x, j) => (pre.test(x.id) ? j : a), P.length - 1);
            P.splice(at + 1, 0, { id, html: h, key: (r.keyPages || [])[i] });
        });
    }
    p5.pupilPages.forEach((h, i) => push(i ? `P5-${i + 1}` : 'P5', h, p5.keyPages[i]));
    push('P6', p6.pupilPages[0], p6.keyPages[0]);

    // ---------------------------------------------------------------- placeholder vars
    const cellsOf = (plans) => plans.flatMap((pl) => planCells(pl));
    const uniqQ = (cs) => { const seen = new Set(); return cs.filter((c) => { const k = `${c.page}|${factKeyOf(c.q)}|${c.q && c.q.skillId}`; if (seen.has(k)) return false; seen.add(k); return true; }); };
    const chartQ = ((lesson.lesson && lesson.lesson.chart && lesson.lesson.chart.exampleQs) || []).filter(Boolean);
    const teachCells = uniqQ(cellsOf(partPlan('teach')));
    // (the Guided cells the lesson sheet PRINTS: its first dealt grid - lesson 2's sheet fits one, not guidedRows)
    const g0 = teachCells[0];
    const nPrinted = g0 ? teachCells.filter((c) => c.page === g0.page && c.grid === g0.grid).length : 0;
    const nGuided = nPrinted > 0 && nPrinted < 2 ? nPrinted : Math.max(2, Math.min(4, Number(d.lessonData && d.lessonData.guidedRows) || 2));
    const p0Cells = cellsOf([p0.plan]);
    const V = {
        chart: dlItemVars(chartQ[0], d), chart2: dlItemVars(chartQ[1] || chartQ[0], d), chart3: dlItemVars(chartQ[2] || chartQ[1] || chartQ[0], d),
        we: teachCells.slice(0, nGuided).map((c) => dlItemVars(c.q, d)),
        // (the lesson sheet's Independent cells, as a chunk's {b.indep} / {b.indepList} - T4 §6a's walk)
        indep: teachCells.slice(nGuided).map((c) => dlItemVars(c.q, d)),
        // Each question's items by the LETTERS P0 prints (critic D10): {pre.i.letters} 'a–d',
        // {pre.i.list} 'a. 61 · b. 80 ...'; {p0.list} every item. Read from the P0 plan, never typed.
        pre: d.prerequisites.map((p, i) => {
            const mine = p0Cells.map((c, j) => Object.assign({ letter: 'abcdefghijklmnop'[j] }, c)).filter((c) => c.grid === i);
            const c = mine[0] || p0Cells[i];
            const v = c ? dlItemVars(c.q, d) : { ans: '' };
            const L = mine.map((x) => x.letter);
            return Object.assign(v, { letters: L.length > 1 ? `${L[0]}–${L[L.length - 1]}` : (L[0] || ''), list: mine.map((x) => `${x.letter}. ${dlAns(x.q)}`).join(' · ') });
        }),
        p0: { list: p0Cells.map((c, j) => `${'abcdefghijklmnop'[j]}. ${dlAns(c.q)}`).join(' · ') },
        ns: { A: nsBands[0].its.map((it) => dlItemVars(it.q, d)), B: nsBands[1].its.map((it) => dlItemVars(it.q, d)) },
        ret: retD.map((r) => dlItemVars(r.q, d)), cq: Object.assign(dlItemVars(cqD.q, d), dlCheckQuestion(cqD.q, d)),
        wp: wpV, exit: exVars, say: sayV,
    };
    // {p4.last} (T5 Watch, critic D13): what each Practice page's LAST row holds, read from the plans,
    // each number with its case (`caseNames`: a CASE_TESTS name -> words).
    {
        const named = (q) => { for (const [t, w] of Object.entries(d.caseNames || {})) { const f = LESSON_CASE_TESTS[t]; if (f && f({ q })) return w; } return ''; };
        const parts = [];
        let k = 0;
        for (const pl of partPlan('practice')) {
            const cs = planCells(pl);
            for (const pg of [...new Set(cs.map((c) => c.page))]) {
                k++;
                const its = cs.filter((c) => c.page === pg);
                const last = Math.max(...its.map((c) => c.row));
                parts.push(`Practice ${k}: ${its.filter((c) => c.row === last).map((c) => { const w = named(c.q); return `${itemNumberOf(c.q) !== null ? itemNumberOf(c.q) : dlAns(c.q)}${w ? ` (${w})` : ''}`; }).join(', ')}`);
            }
        }
        V.p4 = { last: parts.join('; ') };
    }
    // A chunk's own chart and Guided items: {b.chart.n}, {b.we.0.n} ...
    for (const { ch, r } of chunkRes) {
        const qs = ((r.lesson && r.lesson.chart && r.lesson.chart.exampleQs) || []).filter(Boolean);
        const tc = uniqQ(cellsOf(((r.partPlans || []).filter((x) => x.part === 'teach')).flatMap((x) => x.plans)));
        const ng = Math.max(2, Math.min(4, Number(ch.lessonData && ch.lessonData.guidedRows) || 2));
        V[ch.id] = { chart: dlItemVars(qs[0], d), chart2: dlItemVars(qs[1] || qs[0], d), chart3: dlItemVars(qs[2] || qs[1] || qs[0], d), we: tc.slice(0, ng).map((c) => dlItemVars(c.q, d)), indep: tc.slice(ng).map((c) => dlItemVars(c.q, d)) };
        while (V[ch.id].we.length < 2) V[ch.id].we.push(V[ch.id].chart);
        V[ch.id].indepList = V[ch.id].indep.map((x) => x.ans).join(' · ');
    }
    V.ret.forEach((r, i) => { r.ask = fillPlaceholders((d.retrieval[i] || {}).ask || '', { ret: V.ret }); });
    while (V.we.length < 2) V.we.push(V.chart);
    V.indepList = V.indep.map((x) => x.ans).join(' · ');

    // ---------------------------------------------------------------- T6 data
    // (`fade`, the description's own fade labels for P5 / P6 - lesson 2 r4, critic r2 n7)
    const DL_FADE = Object.assign({}, DL_FADE0, d.fade || {});
    const glance = [
        { page: 'P0 Prerequisite', answers: p0Cells.map((c) => dlAns(c.q)).join(' · '), fade: DL_FADE.P0 },
        { page: 'P1 Number sense', answers: cellsOf([p1.plan]).map((c) => dlAns(c.q)).join(' · '), fade: DL_FADE.P1 },
        { page: 'P3 Guided', answers: teachCells.slice(0, nGuided).map((c) => dlAns(c.q)).join(' · '), fade: '★' },
        // (no row for a part the sheet does not print - lesson 2's P3 has no Independent cells, critic r1 D4)
        ...(teachCells.length > nGuided ? [{ page: 'P3 Independent', answers: teachCells.slice(nGuided).map((c) => dlAns(c.q)).join(' · '), fade: '★★' }] : []),
    ];
    for (const { ch } of chunkRes) {
        glance.push({ page: `P3${ch.id} Guided`, answers: V[ch.id].we.map((x) => x.ans).join(' · '), fade: '★' });
        glance.push({ page: `P3${ch.id} Independent`, answers: V[ch.id].indep.map((x) => x.ans).join(' · '), fade: '★★' });
    }
    let pNo = 0;
    for (const pl of partPlan('practice')) {
        const cs = planCells(pl);
        for (const pg of [...new Set(cs.map((c) => c.page))]) {
            pNo++;
            const its = cs.filter((c) => c.page === pg);
            const last = Math.max(...its.map((c) => c.row));
            glance.push({ page: `P4-${pNo} Practice, rows 1–${last}`, answers: its.filter((c) => c.row < last).map((c) => dlAns(c.q)).join(' · '), fade: '★★' });
            glance.push({ page: `P4-${pNo} Practice, last row`, answers: its.filter((c) => c.row === last).map((c) => dlAns(c.q)).join(' · '), fade: '★★★' });
        }
    }
    if (mixedNo) glance.push({ page: 'P4 Mixed', answers: cellsOf(partPlan('mixed')).map((c) => dlAns(c.q)).join(' · '), fade: '★★' });
    glance.push({ page: 'P5 Word problem', answers: wpV.eq, fade: DL_FADE.P5 });
    glance.push({ page: 'P6 Exit slip', answers: exVars.map((x, i) => `${'abcd'[i]}. ${x.ans}`).join(' · '), fade: DL_FADE.P6 });
    const prereqAtoms = d.atoms.filter((x) => x.prereq);
    const routing = d.prerequisites.map((p, i) => {
        const a = prereqAtoms[Math.max(0, p.atom - 1)] || d.atoms[0];
        // (the item letters P0 prints, critic D10; the route the description names - a site lesson
        // or skill, or Appendix H's CCSS-code form - critic D22)
        return { q: `${V.pre[i].letters}. ${(String(a.skill).split(':')[0])}`, atom: `${a.type}, atom ${p.atom}`, lesson: p.lesson.id ? `${p.lesson.id} ${p.lesson.title}` : p.lesson.title };
    });

    // ---------------------------------------------------------------- teacher pages
    const blankPupil = (id) => { const x = P.find((p) => p.id === id); return x ? x.html : ''; };
    const thumbs = { P0: blankPupil('P0'), P2: blankPupil('P2'), P3: blankPupil('P3'), P4: blankPupil('P4-1') };
    for (const { ch } of chunkRes) { thumbs[`P2${ch.id}`] = blankPupil(`P2${ch.id}`); thumbs[`P3${ch.id}`] = blankPupil(`P3${ch.id}`); }
    const { bands, flow } = teacherBands(d, V, { thumbs, glance, routing, tags });
    const order = ['T1', 'T2', 'T2b', 'T3', 'T4', 'T5'];
    const groups = [...order, 'T6'];
    const lifted = String(d.title).length <= LIFT_MAX_CHARS;
    const body = lifted ? TEACHER_BODY_MM : { lifted: TEACHER_BODY_MM.full, cont: TEACHER_BODY_MM.cont };
    const measured = await measureTeacherBlocks(groups.map((g) => bands[g]));
    const groupPages = {};
    groups.forEach((g, i) => { groupPages[g] = paginateTeacher(bands[g], measured[i], { body, fillFirst: g === 'T1', greedy: g === 'T2' }); });
    const teacherTotal = groups.reduce((a, g) => a + groupPages[g].length, 0);
    let tNo = 0;
    const tabIdOf = { T1: 'Teacher 1', T2: 'Teacher 2', T2b: 'Reference', T3: 'Teacher 3', T4: 'Teacher 4', T5: 'Teacher 5', T6: 'Answer Key' };
    const tPages = (g) => groupPages[g].map((pg, i) => ({
        id: i ? `${g}-${i + 1}` : g, kind: 'teacher',
        html: renderTeacherPage(Object.assign({}, pg, { head: pg.head === 'lifted' && !lifted ? 'full' : pg.head }), {
            tabId: tabIdOf[g], level: d.level, strand: d.strand, title: d.title, id: i ? `${g}-${i + 1}` : g,
            footer: { left: tagLine, center: `${++tNo}/${teacherTotal}`, right: g === 'T2b' ? 'Teacher · Print once per unit' : `Teacher · Form A · seed ${seed}`, year },
        }),
    }));

    // ---------------------------------------------------------------- the pack, in V22 order
    const pages = [
        ...order.flatMap(tPages),
        ...P.map((p) => ({ id: p.id, kind: 'pupil', html: dlTag(p.html, p.id, 'pupil') })),
        ...P.filter((p) => p.key).map((p) => ({ id: `${p.id}-key`, kind: 'key', html: dlTag(p.key, `${p.id}-key`, 'key') })),
        ...tPages('T6'),
    ];

    // ---------------------------------------------------------------- the pool (LR-5, E24)
    // Every PRINTED cell, read from the plans the pages were rendered from (not the dealt candidates).
    const places = [];
    const fromPlans = (plans, idOf, { dedupe = false } = {}) => {
        const seen = new Set();
        let base = 0;
        for (const pl of plans) {
            let maxPage = 0;
            for (const c of planCells(pl)) {
                const k = factKeyOf(c.q);
                if (k === null) continue;
                maxPage = Math.max(maxPage, c.page);
                const page = idOf(base + c.page), rep = dlRep(c.q), sig = `${page}|${k}|${rep}`;
                if (dedupe && seen.has(sig)) continue;
                seen.add(sig);
                places.push({ page, item: k, rep, row: c.row, grid: c.grid, q: c.q });
            }
            base += maxPage;
        }
    };
    fromPlans([p0.plan], (i) => (i > 1 ? `P0-${i}` : 'P0'));
    fromPlans([p1.plan], (i) => (i > 1 ? `P1-${i}` : 'P1'));
    // The chart draws its worked example once per step panel: one place per item on the poster.
    fromPlans(partPlan('chart'), () => 'P2', { dedupe: true });
    for (const q of chartQ) { const k = factKeyOf(q); if (k !== null && !places.some((x) => x.page === 'P2' && x.item === k)) places.push({ page: 'P2', item: k, rep: dlRep(q), row: 0, q }); }
    fromPlans(partPlan('teach'), (i) => (i > 1 ? `P3-${i}` : 'P3'));
    for (const { ch, r } of chunkRes) {
        const pp = (part) => (r.partPlans || []).filter((x) => x.part === part).flatMap((x) => x.plans);
        fromPlans(pp('chart'), () => `P2${ch.id}`, { dedupe: true });
        for (const q of ((r.lesson && r.lesson.chart && r.lesson.chart.exampleQs) || []).filter(Boolean)) { const k = factKeyOf(q); if (k !== null && !places.some((x) => x.page === `P2${ch.id}` && x.item === k)) places.push({ page: `P2${ch.id}`, item: k, rep: dlRep(q), row: 0, q }); }
        fromPlans(pp('teach'), (i) => (i > 1 ? `P3${ch.id}-${i}` : `P3${ch.id}`));
    }
    fromPlans(partPlan('practice'), (i) => `P4-${i}`);
    fromPlans(partPlan('mixed'), (i) => `P4m-${i}`);
    places.push({ page: 'P5', item: String(wpD.key), rep: 'story', row: 0, q: wpD.q });
    exitD.forEach((x, i) => places.push({ page: 'P6', item: String(x.key), rep: dlRep(x.q), row: Math.floor(i / exCols), q: x.q }));
    // The pool rule (V22 §9.5, data): the description's `pool` - {kind: 'range', lo, hi} (every number,
    // listed) or a list - else the list of every place (a pack whose rule is its own deal).
    const pd = d.pool || {};
    const poolKeys = pd.kind === 'range' ? Array.from({ length: pd.hi - pd.lo + 1 }, (_, i) => String(pd.lo + i))
        : pd.kind === 'list' ? pd.items.map(String) : [...new Set(places.map((x) => x.item))];
    const edgeTest = LESSON_CASE_TESTS[d.edgeTest || ''];
    // `situations` (lesson 2: put together, add to): each a CASE_TESTS name; a story's situation is the first that passes.
    const sits = Array.isArray(d.situations) ? d.situations.filter((x) => x && LESSON_CASE_TESTS[x.test]) : [];
    const sitOf = (q) => { const x = sits.find((t) => LESSON_CASE_TESTS[t.test]({ q })); return x ? x.id : ''; };
    const pool = {
        op: 'list', decl: { kind: 'list', items: poolKeys }, pool: poolKeys, forbidden: [],
        // (board-only numbers and their names: the self-check's E30 finds none on a pupil page or key)
        boardOnly: boardOnly.map((v) => ({ n: v, words: v >= 0 && v <= 1000 ? numberWords(v) : '' })),
        edge: [...new Set(places.filter((x) => edgeTest && edgeTest({ q: x.q })).map((x) => x.item))],
        // (each place's answer too: LR-6 'no two answers alike on a page' is checked on every pupil page)
        // (a + / − item's grid too, so E24b reads LR-6's "a row of the grid" on a Mixed page, whose
        // shelves are grids of one row; and, when the description declares its `situations`, each
        // story's situation - lesson 2 r4, critic r2 D1 / D2 / D4)
        places: places.map(({ q, grid, ...x }) => Object.assign(x, { ans: dlAns(q) }, lr6Of(q).op ? { grid: grid || 0 } : {}, sitOf(q) ? { sit: sitOf(q) } : {})),
        ...(sits.length ? { situations: sits.map((x) => x.id) } : {}),
        note: 'Places are written here by the bridge (the kit equivalent of V22 data-item / data-rep / data-row).',
    };
    const css = `<style data-dl-css>${TEACHER_CSS}${RCDWS_CSS}${DETAILED_PUPIL_CSS}</style>`;
    const poolScript = `<script type="application/json" id="v21-pool">${JSON.stringify(pool).replace(/</g, '\\u003c')}</script>`;
    const bodyHtml = css + pages.map((p) => p.html).join('\n') + poolScript;
    return {
        role: 'detailed-lesson', lessonId: d.id, title: d.title, seed, paper, flow, tags, notes: [...new Set([...notes, ...(lesson.notes || [])])],
        pages: pages.map((p) => ({ id: p.id, kind: p.kind, html: p.html })), pageCount: pages.length,
        bodyHtml, html: sheetDocument(bodyHtml, `${d.title} - detailed lesson`, { paper }), pool,
        // The print screen's shape (teacher-print.js buildAll): the pack is one run of pages, the keys
        // already inside it in V22 order, so it has no separate key run.
        pupilHtml: bodyHtml, keyHtml: '', docHtml: bodyHtml, keyPageCount: 0,
        fits: { cols: 1, rows: 1, pages: pages.length, note: `Detailed lesson: ${pages.filter((p) => p.kind === 'teacher').length} teacher pages, ${pages.filter((p) => p.kind === 'pupil').length} pupil pages, ${pages.filter((p) => p.kind === 'key').length} keys.`, sections: [] },
        items: [{ skill: `${d.skill.categoryId}:${d.skill.skillId}` }], problemCount: places.length, gaps: [],
        vars: V, debug: { glance, est: Object.fromEntries(groups.map((g, i) => [g, groupPages[g].map((pg) => pg.bands.map((b) => b.blocks.length))])), heights: Object.fromEntries(groups.map((g, i) => [g, { over: measured[i][0] && measured[i][0].over, hs: measured[i].map((a) => a.map((x) => Math.round(x))) }])) },
    };
}

/* ===================================================================== standalone document */

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * A standalone printable document for sheet HTML: the app's stylesheets (the legacy cells are
 * drawn against them), Andika self-hosted, the kit's stylesheet, the engine rules, and a page
 * box of the chosen paper with no margins (the sheet carries its own margins, PG-1). The
 * universal `@page` of css/print-worksheet.css adds a running "Maths Quest Pro" footer and
 * 12 mm margins for the legacy worksheets; both are switched off here, because a kit sheet has
 * its own teacher footer (HD-30).
 *
 * `<html data-ws-fonts="ready">` is set once the web fonts have loaded, so a printer (or the
 * test harness) waits for Andika instead of rasterising the fallback face.
 *
 * @param {string} html
 * @param {string} [title]
 * @param {{paper?: 'A4'|'Letter', base?: string}} [opts]  `base`: where relative hrefs resolve
 */
export function sheetDocument(html, title = 'Worksheet', opts = {}) {
    const letter = /letter/i.test(String(opts.paper || '')) || /mq-paper-letter/.test(String(html));
    const base = opts.base || (typeof document !== 'undefined' ? document.baseURI : '');
    const abs = (p) => { try { return base ? new URL(p, base).href : p; } catch (e) { return p; } };
    const links = SHEET_STYLESHEETS.map((h) => `<link rel="stylesheet" href="${abs(h)}">`).join('\n');
    return `<!doctype html>
<html lang="en"${letter ? ' class="mq-paper-letter"' : ''}>
<head>
<meta charset="utf-8">
<title>${escText(title)}</title>
<meta name="copyright" content="&copy; ${new Date().getFullYear()} Cultivating the Digital. All rights reserved.">
<meta name="author" content="Cultivating the Digital">
${links}
<style data-mq-sheet-engine>${SHEET_ENGINE_CSS}</style>
<style>
@page { size: ${letter ? 'Letter' : 'A4'}; margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } @bottom-center { content: none; } }
@page mqsheet { size: A4; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
@page mqsheetletter { size: Letter; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
html { color-scheme: light; }
html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: 'Andika', sans-serif; }
body.mq-sheet { min-height: 0; overflow: visible; }
.mq-sheet > .ws-page:last-child { break-after: auto; }
@media screen { body.mq-sheet { background: #d9d9d9; padding: 6mm 0; } }
@media print { body.mq-sheet { background: #fff; padding: 0; } }
</style>
</head>
<body class="mq-sheet">
${html}
<script>(function(){var d=document;function done(){d.documentElement.setAttribute('data-ws-fonts','ready');}
try{if(d.fonts&&d.fonts.ready){d.fonts.ready.then(done,done);}else{done();}}catch(e){done();}})();</script>
</body>
</html>`;
}

export default { buildSheet, sheetDocument };
