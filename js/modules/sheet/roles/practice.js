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
    resolveSectionLayout, paperOf, bodyHeightMm, instructionMm, fitsLine, LIVE_W_MM,
} from '../layout.js';
import { paginate, labelStarts, scoreDenominator, placeSections } from '../paginate.js';
import { renderSource, renderAnswerKey } from './answer-key.js';
import { deriveSeed } from '../rng.js';

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
 * The strings a skill contributes, from its provider (or the default adapter), with the host's
 * own values first. `iCan` falls back to the label, never to a generic sheet name (PT-FRM-6).
 */
export function skillWords(skill = {}) {
    let str = {};
    try {
        const p = getProvider(skill.categoryId || '', skill.skillId || '');
        const raw = typeof p.strings === 'function'
            ? p.strings({ categoryId: skill.categoryId, skillId: skill.skillId, label: skill.label, answerType: skill.answerType, printFormat: skill.printFormat })
            : p.strings;
        str = raw || {};
    } catch (e) { str = {}; }
    if (!str.iCan) {
        try { str = Object.assign(defaultStrings({ categoryId: skill.categoryId, skillId: skill.skillId, label: skill.label }), str); } catch (e) { /* keep */ }
    }
    let iCan = skill.iCan || str.iCan || '';
    if (!iCan || /work on this skill$/i.test(iCan)) iCan = titleFromLabel(skill.label || String(skill.skillId || '').replace(/_/g, ' '));
    const instructionKey = skill.instructionKey || str.instructionKey || 'default-write';
    return { iCan, instructionKey, strand: skill.strand || STRAND_BY_CATEGORY[skill.categoryId] || '' };
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
function layoutSheet(role, sectionsIn, itemsBySection, { size, look, paper, headerFirst, availableWidthMm }) {
    const layouts = sectionsIn.map((sec, si) => resolveSectionLayout(
        { role, columns: sec.columns, count: itemsBySection[si].length, floor: sec.floor },
        itemsBySection[si], paper, availableWidthMm, { size, look, header: headerFirst },
    ));
    const chunksBySection = layouts.map((L, si) => paginate(itemsBySection[si].length, L));
    const instr = instructionMm(size);
    const pages = placeSections(
        layouts.map((L, si) => ({ layout: L, chunks: chunksBySection[si], instrMm: instr })),
        { bodyFirstMm: bodyHeightMm(paper, headerFirst), bodyContMm: bodyHeightMm(paper, headerFirst, { cont: true }) },
    );
    return { layouts, chunksBySection, pages };
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
    const laid = layoutSheet(role, norm.sections, sheetItems, { size, look, paper, headerFirst: headerForLayout, availableWidthMm: W });
    return Object.assign({ skills, words, titleLines }, laid);
}

/**
 * Compose ONE sheet (Independent: the whole run; More Practice: one letter) into PagePlan pages.
 * Labels run on across the sheet (CL-12); a More Practice letter is a sheet of its own, so its
 * labels start at a. again by construction.
 */
function composeSheet(role, input, norm, sheetItems, { tabId, seed, form }) {
    const { size, look } = norm;
    const level = 1;                                        // PT 1.7: Independent and More Practice
    const labelStyle = input.labels === 'none' ? 'none' : input.labels === 'tab' || input.labels === 'letter' ? input.labels
        : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).label;       // CL-10 / CL-30, dialog override CL-20
    const { skills, words, titleLines, layouts, pages } = sheetLayout(role, input, norm, sheetItems, tabId);

    // Instruction per section (BD-10, BD-13): the section's own key, else the skills' keys.
    const instr = norm.sections.map((sec, si) => {
        const keys = sec.instructionKey ? [sec.instructionKey]
            : sheetItems[si].map((it) => {
                const q = it.q || {};
                const s = skills.find((k) => k.skillId === q.skillId && (!q.categoryId || k.categoryId === q.categoryId));
                return (it.instructionKey) || (s ? skillWords(s).instructionKey : '');
            });
        let key = sectionInstructionKey(keys);
        let text;
        try { text = instructionFor(key, sec.instructionVars || {}); } catch (e) { key = 'default-write'; text = INSTRUCTION_LIBRARY[key]; }
        return { key, text };
    });

    // Labels and Score across the sheet (CL-12, CL-33, PT-FRM-4).
    const partsInOrder = pages.flatMap((pg) => pg.parts);
    const counts = partsInOrder.map((p) => p.chunk.count);
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
            const fillByFlex = !pg.cont && lone && part.chunk.rows === L.rows;
            sections.push({ kind: 'html', html: instructionHtml(instr[part.section].key, instr[part.section].text) });
            sections.push({
                kind: 'grid',
                cols: L.cols,
                rows: part.chunk.rows,
                labels: labelStyle,
                start,
                cls: fillByFlex ? '' : 'fixed',
                height: fillByFlex ? '' : `${Math.round(part.chunk.rows * L.cellH * 1000) / 1000}mm`,
                items: its.map((it) => planItem(it, level, L.cols)),
            });
        }
        return { header: pg.cont ? cont : first, sections };
    });

    const fits = layouts.map((L) => ({
        cols: L.cols, rows: L.rows, perPage: L.perPage, pages: L.pages, cellW: L.cellW, cellH: L.cellH,
        requested: L.requested, clamped: L.clamped, note: L.note, line: fitsLine(L), cls: L.cls, digitPt: L.digitPt,
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
        const { pages } = sheetLayout(role, input, norm, bySection, 'Practice A');
        groups = pages.map((pg, i) => {
            const secs = norm.sections.map(() => []);
            for (const part of pg.parts) secs[part.section].push(...bySection[part.section].slice(part.chunk.from, part.chunk.from + part.chunk.count));
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
