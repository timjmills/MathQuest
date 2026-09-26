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

import { generateQuestionFor } from './generate-question.js';
import { factSetTitle, optionsFor, normalizeOptions } from './skill-options.js';
import { opsRoutedSkill } from './gen-operations.js';
import { getSkillGrade, getSkillPrintSize, SKILL_FULL_LABELS, SKILLS, isMixedMetaSkill, getMixedPoolSkills, DOMAINS } from './data.js';
import { kitCellSpec } from './print-generate.js';
import { renderCell, cellAnswerKey, cellFootprint, resolveCtx, SIZES, INSTRUCTION_LIBRARY, getProvider, cellMinSize, sizeFloor } from './sheet/index.js';
import { plan as independentPlan } from './sheet/roles/independent.js';
import { plan as morePracticePlan, letterSeed } from './sheet/roles/more-practice.js';
import { renderPlan, SHEET_ENGINE_CSS, skillWords, splitCellH } from './sheet/roles/practice.js';
import { resolveSectionLayout, cellWidthMm, LIVE_W_MM, bodyHeightMm, instructionMm, autoFitsAt, itemInfo, itemCap, DENSE_MAX_COLS_AT, DENSE_MAX_COLS } from './sheet/layout.js';
import { paginate } from './sheet/paginate.js';
import { ROLE_MODULES, ROLE_ALIASES } from './sheet/roles/index.js';
import { tagLine as lessonTagLine } from './sheet/roles/lesson.js';
import { lessonFor, skillRef } from './lessons/prereqs.js';
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
    return {
        role, size, look, paper, seed, sections,
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
function refAccepts(sk, cand, key, seen, kept) {
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
    if (sk.noTurnaround && ops.length >= 2 && seen.has(`pair:${key}:${ops.slice().sort((x, y) => x - y).join(',')}`)) return false;
    if (sk.maxSmall !== undefined && ops.length >= 2 && ops[1] < 10 && (kept.get(`small:${key}`) || 0) >= Number(sk.maxSmall)) return false;
    if (Array.isArray(sk.avoidTexts) && sk.avoidTexts.includes(refText(cand))) return false;
    return true;
}

/** Records what `refAccepts` checks the next items against. */
function refRecord(sk, q, key, seen, kept) {
    const ops = refOperands(q);
    if (sk.distinctFirst) seen.add(`first:${key}:${ops[0]}`);
    if (sk.distinctAnswer) seen.add(`ans:${key}:${refAnswer(q)}`);
    if (sk.noTurnaround && ops.length >= 2) seen.add(`pair:${key}:${ops.slice().sort((x, y) => x - y).join(',')}`);
    if (sk.maxSmall !== undefined && ops.length >= 2 && ops[1] < 10) kept.set(`small:${key}`, (kept.get(`small:${key}`) || 0) + 1);
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
    slots.forEach((sk, j) => {
        const i = startIndex + j;
        const key = `${sk.categoryId}:${sk.skillId}`;
        const itemIndex = kept.get(key) || 0;
        let q = null;
        // A lesson ref's floors can need many tries to meet (a 0 in the ones AND a one-place
        // bottom number): `tries` raises the budget for that ref only.
        const tries = Math.max(RETRIES, Math.min(600, Number(sk.tries) || 0));
        for (let k = 0; k <= tries; k++) {
            const seed = (baseSeed + i + 7919 * k) >>> 0;
            let cand = null;
            try { cand = generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed, itemIndex, itemCount: perSkill ? perSkill.get(key) : undefined }); } catch (e) { cand = null; }
            if (!cand) continue;
            // A lesson's skill ref (lessons r2-r3): floors on what the packet deals. Not skill
            // options - the packet's; the last try takes what it gets.
            if (k < tries && !refAccepts(sk, cand, key, seen, kept)) continue;
            q = cand;
            if (!seen.has(signature(cand))) break;
        }
        if (!q) return;
        // A lesson's practice page (lessons r1): `check` on the skill ref puts the Check line
        // ("Check: add back") under every subtraction stack. Not a skill option - the page's.
        if (sk.check && q.cell && q.cell.template === 'stack') q.cell = Object.assign({}, q.cell, { payload: Object.assign({}, q.cell.payload, { check: true }) });
        seen.add(signature(q));
        refRecord(sk, q, key, seen, kept);
        kept.set(key, itemIndex + 1);
        out.push({ q, skill: sk });
    });
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
        const ctx = Object.assign({}, atL(c), { state: legacy && hasShown ? 'blank' : st, wrong, columns: cols, options: Object.assign({}, c.options || {}, { factColumns: cols }) });
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
    if (isAcrossFact(q, template)) {
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
        cellCls: legacy ? 'mq-legacy' : '',
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
                    const ctx = resolveCtx({ mode: 'print', look, size, paper: 'A4', scaffoldLevel: it.measureLevel || 1, state });
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
                    best = { hMm: Math.max(best.hMm, hPx / PX_PER_MM), fits: best.fits && fits, modes, inkW };
                }
                it.measured = it.measured || {};
                it.measured[c] = { hMm: Math.ceil(best.hMm * 10) / 10, fits: best.fits };
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
function optionTitle(sk, baseICan) {
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
    const words = skillWords(Object.assign({ answerType: q && q.answerType, printFormat: q && q.printFormat }, meta, { skillId: nameId }));
    meta.iCan = sk.iCan || optionTitle(sk, words.iCan) || words.iCan;
    meta.instructionKey = q ? instructionKeyFor(q, words) : words.instructionKey;
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
    let best = 1;
    for (let N = 2; N <= 40; N++) {
        const nw = N <= items.length ? isWide.slice(0, N).filter(Boolean).length : Math.round(N * f);
        const nn = N - nw;
        if (Math.ceil(nn / Ln.cols) * hN + nw * hW > G - 0.99) break;
        best = N;
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
export async function buildSheet(req = {}) {
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
    };
    const plan = n.role === 'more-practice' ? morePracticePlan(input) : independentPlan(input);
    const out = renderPlan(plan, { key: n.key });
    const fitsList = (plan.meta && plan.meta.fits) || [];
    const f0 = fitsList[0] || {};
    const pageCount = out.pupilPages.length;
    notes.push(...new Set((plan.meta && plan.meta.notes) || []), ...anchorNotes);
    // DN-21: the dialog's "Fits:" line (it already carries the layout's own clamp note, DN-14),
    // then any note the layout line does not already say.
    const line = f0.line || '';
    const fits = {
        cols: f0.cols, rows: f0.rows, perPage: f0.perPage, pages: pageCount,
        note: [line, ...notes.filter((t) => !line.includes(t))].filter(Boolean).join(' '),
        sections: fitsList,
    };
    return {
        pupilHtml: out.pupilHtml,
        keyHtml: n.key ? out.keyHtml : '',
        pageCount,
        keyPageCount: n.key ? out.keyPages.length : 0,
        fits,
        items: hostItems.map((it) => ({
            skill: it.skill, section: it.section, letter: it.letter, template: it.template,
            text: String(it.q.text || ''), ans: it.q.ans, fclass: it.fclass, measured: it.measured, measureWhy: it.measureWhy,
        })),
        gaps: out.gaps,
        anchors: anchorSummary(anchorMode, anchorsIn ? anchorsIn.bySection.flat().concat(hostItems.map((it) => it.twin).filter(Boolean)) : [], anchorNotes),
        floors: n.sections.map((s) => s.floor || null),
        seed: n.seed,
        role: n.role,
        title: plan.meta && plan.meta.title,
        notes,
        plan,
    };
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
    };

    /**
     * `want` usable items for one pool. A pool of one skill is deterministic item by item (seed
     * + i), so the probe and the final run deal the same questions. Items the role cannot use
     * (`prepare` returns null, or the finished answer cannot be written into the cell) are
     * skipped and the run is extended; a last pass accepts an unshowable item, which then shows
     * its value on an answer line under the cell.
     */
    const flagsFor = (count) => (typeof mod.wrongFlags === 'function' ? mod.wrongFlags(count, n.seed) : []);
    const dealPool = (pool, pi, want) => {
        const base = (n.seed + pi * 100003) >>> 0;
        const st = { seen: new Set(), kept: new Map() };
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
    pools.forEach((p, pi) => {
        const w = Math.max(0, Math.min(MAX_ITEMS, Math.floor(Number(want[p.id]) || 0)));
        let its = w <= probe[p.id].length && !mod.wrongFlags ? coverSlice(p, probe[p.id], w) : null;
        if (!its) { its = dealPool(p, pi, w); measure(its); }
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

    const plan = mod.plan(input);
    const out = renderPlan(plan, { key: n.key });
    const fitsList = (plan.meta && plan.meta.fits) || [];
    const f0 = fitsList[0] || {};
    const notes = [...new Set((plan.meta && plan.meta.notes) || []), ...anchorNotes];
    const line = f0.line || '';
    return {
        pupilHtml: out.pupilHtml,
        keyHtml: n.key ? out.keyHtml : '',
        pageCount: out.pupilPages.length,
        keyPageCount: n.key ? out.keyPages.length : 0,
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
    const data0 = lessonFor(sk0.categoryId, sk0.skillId);
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
    const data = lessonFor(sk.categoryId, sk.skillId);
    const warmSkills = data ? data.skills.map(skillRef) : earlierSkills(sk, 2);
    let st = { ccss: [], ee: [], approx: false };
    try { if (standardsMod) st = standardsMod.standardsFor(sk.categoryId, sk.skillId); } catch (e) { /* no tags */ }
    // The lesson's tags: the PRIMARY CCSS code (an approximate mapping is no tag) and its EEs.
    const ccss = !st.approx && st.ccss && st.ccss[0] ? [st.ccss[0].short || st.ccss[0].code] : [];
    const ee = (st.ee || []).map((r) => r.code).slice(0, 2);
    const tagLine = lessonTagLine({ skillId: sk.skillId, grade: meta.grade, ccss, ee });
    const header = Object.assign({}, n.header, { footerLeft: tagLine });
    const lessonNo = Math.max(1, Number(n.lesson) || 1);

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
    const oneLine = (it) => it.template === 'fact' || (it.template === 'pv' && it.kind === 'round');
    const facts = (teach.items || []).filter((it) => it.pool === 'main').every(oneLine);
    // The skill ref of the practice pages: a subtraction lesson gives step 5 ("Check: add back")
    // its room, a Check line under every problem.
    const practiceSk = data && data.checkRow ? Object.assign({}, sk, { check: true }) : sk;
    // One-line answers: the engine fills the page (PAGE FILL, DN-1) - one frame, no row gaps,
    // because the count is the page's own. Taller problems: 12.1's six a page, 2 x 3, each cell
    // with its working space and Check line.
    // Lessons r2-r3: a rounding cell ("27 -> ___") is short and narrow: M prints three across like
    // L, and the lesson's own 15 at every size (never 12.1's 16 ceiling passed).
    const rounding = (teach.items || []).some((it) => it.pool === 'main' && it.template === 'pv');
    const section = facts ? { skills: [practiceSk], pages: 0, noCap: true, dense: rounding ? { S: 15, M: 15, L: 15 } : { S: 16, M: 16, L: 15 } } : { skills: [practiceSk], count: 0, columns: 2, noCap: true };
    // Taller problems: 12.1's six a page (2 x 3) at every size - an Independent page holds 6 at
    // most, so M is the same six cells in smaller type (lessons r2: by design, not a missed gain).
    const stackShapes = [[6, 2]];
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
    if (n.practicePages > 0) {
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
    }

    // 3. Mixed practice (optional): the lesson skill with EARLIER skills only (lessons r1), each
    // skill its own section, the page filled in one frame per section.
    if (n.mixed) {
        const withSkills = data && data.mixWith ? data.mixWith.map(skillRef) : earlierSkills(sk, 2);
        const res = await buildSheet(Object.assign({}, common, {
            // The lesson's own look (I Can) unless the teacher chose Daily for the packet.
            // Lessons r2: the lesson's own skill fills at least half the page (its weight is the
            // partners' together), the earlier skills the rest.
            role: 'mixed-practice', look: n.lookAsked === 'daily' ? 'daily' : 'ican',
            // Lessons r3: never a problem the Practice page printed; the lesson skill at least
            // half the placed items (`leadHalf`, enforced after packing).
            sections: [{ skills: [Object.assign({}, practiceSk, { weight: Math.max(1, withSkills.length) + 0.5, avoidTexts: practiceTexts }), ...withSkills] }], latticeN: 6, leadHalf: true,
            seed: (n.seed + 15838) >>> 0,
            stepStrip: stripHtml ? { html: stripHtml, hMm: stripH } : undefined,
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
    return {
        pupilHtml, keyHtml, pageCount, keyPageCount,
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
            chart: chart.plan && chart.plan.meta ? { zoom: chart.plan.meta.chartZoom, example2: chart.plan.meta.example2, example2Found: chart.plan.meta.example2Found, sizing: chart.plan.meta.chartSizing, example3: chart.plan.meta.example3, example4: chart.plan.meta.example4 } : null,
            practiceTried,
            teach: teach.plan && teach.plan.meta ? { bands: teach.plan.meta.bandSizes, guided: teach.plan.meta.guided, independent: teach.plan.meta.independent } : null,
            size,
        },
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
