// js/modules/sheet/roles/compose.js
// The shared vocabulary of the P7.2b page roles: the frame words of a role (title, tab, footer),
// the height budget of a banded page, the plan items, the strips and frames a thinking cell is
// built from, and the few skill-derived strings (oral frames, general steps) the default
// adapters leave empty.
//
// A role module (guided.js, review.js, test.js, ...) exports
//   ROLE_ID
//   sources(skills, helpers)   -> [{id, skills}]      which item pools the host generates
//   measureCols(ctx)           -> number[]            the column counts the host measures cells at
//   prepare(item, info)        -> item | null         the role's own cell around the skill's cell
//                                                     (the host measures THIS, so the layout sees
//                                                     the real composite height); null = unusable
//   counts(pools, ctx)         -> {poolId: n}         how many items a page needs, from the probe
//   plan(input)                -> PagePlan            one plan renders the pupil page AND the key
//
// The host (`js/modules/print-sheet.js`) generates and measures; this module and the roles are
// pure (SCC-01): no `window`, no DOM, no `Math.random`, no app import.
//
// A host item draws the skill's cell through `render(ctx, {cols, shown, ink})`:
//   shown  a value written INTO the cell's own answer slot in both states - the shown work of
//          Error analysis, a True or False? statement, the A and B of Reason It
//   ink    'trace' writes it in trace grey (a Model or first Guided cell, scaffold level 3)

import {
    esc, blank, getProvider, instructionFor, INSTRUCTION_LIBRARY, JUDGE_LABELS,
    SIZES, DEFAULT_SIZE, LOOKS, DEFAULT_LOOK, deriveSeed, rng, shuffle,
} from '../index.js';
import { paperOf, bodyHeightMm, instructionMm, resolveSectionLayout, fitsLine, LIVE_W_MM } from '../layout.js';
import {
    skillWords, levelLine, gradeWords, instructionHtml, estimateTitleLines, styleBlock, hookClasses,
    STRAND_BY_CATEGORY, sectionInstructionKey,
} from './practice.js';

export { esc, blank, instructionHtml, styleBlock, deriveSeed, rng, shuffle, resolveSectionLayout, fitsLine, LIVE_W_MM };

/* ======================================================================= the context */

/** Size, look and paper of a plan input, with the role's default look (PAGE_TYPES appendix 4). */
export function ctxOf(input = {}, defaultLook = 'ican') {
    const c = input.ctx || {};
    const size = SIZES[c.size] ? c.size : DEFAULT_SIZE;
    const look = LOOKS[c.look] ? c.look : (LOOKS[defaultLook] ? defaultLook : DEFAULT_LOOK);
    const paper = paperOf(c.paper).id;
    return { size, look, paper, photocopySafe: !!c.photocopySafe, s: SIZES[size] };
}

/** The label style of a look (CL-10 / CL-30), or the dialog's override (CL-20). */
export const labelStyleOf = (look, labels) =>
    (labels === 'none' || labels === 'tab' || labels === 'letter' ? labels : (LOOKS[look] || LOOKS[DEFAULT_LOOK]).label);

/* ==================================================================== the frame words */

const GERUND_SKIP = new Set(['i', 'can']);

/** "I Can subtract two-digit numbers" -> "subtracting two-digit numbers" (HD-13 fixed titles). */
export function topicOf(iCan) {
    let t = String(iCan || '').replace(/^I Can\s+/i, '').trim();
    t = t.replace(/^work on\s+/i, '');
    const m = /^([a-z]+)\b(.*)$/i.exec(t);
    if (!m) return t;
    const v = m[1].toLowerCase();
    const verbs = new Set(['add', 'subtract', 'multiply', 'divide', 'count', 'compare', 'order', 'round', 'estimate',
        'read', 'write', 'tell', 'measure', 'find', 'make', 'build', 'show', 'solve', 'name', 'use', 'draw', 'skip', 'identify', 'sort']);
    if (!verbs.has(v) || GERUND_SKIP.has(v)) return t;
    const ing = /e$/.test(v) && !/ee$/.test(v) ? `${v.slice(0, -1)}ing` : /^(?:[^aeiou]*[aeiou])[^aeiouwxy]$/.test(v) && v.length <= 3 ? `${v}${v.slice(-1)}ing` : `${v}ing`;
    return `${ing}${m[2]}`;
}

/**
 * The frame of one role's sheet.
 * @param {Object} o
 * @param {Object[]} o.skills        skill metadata rows {categoryId, skillId, label, grade, ccss, iCan}
 * @param {Object} o.input           the role input (header options)
 * @param {string} o.tabId           the tab's last line (PT-FRM-9)
 * @param {string} [o.title]         a fixed title (HD-13) - else the skills' "I Can" line
 * @param {boolean} [o.twoLine]      the two-line tab of a sheet with no single strand
 * @param {number} [o.score]         scored cells on the whole sheet; 0 = no Score (PT-FRM-4)
 * @param {string} [o.footerRight]   the footer's right part (form, seed, source note)
 * @param {string} [o.footerLeft]    replaces the skill-id / grade / CCSS line
 */
export function frameOf({ skills = [], input = {}, tabId, title, twoLine = false, score = 0, footerRight, footerLeft }) {
    const h = input.header || {};
    const words = skills.map(skillWords);
    const titles = [...new Set(words.map((w) => w.iCan).filter(Boolean))];
    const derived = title || (titles.length === 1 ? titles[0] : titles.length ? 'Mixed practice' : 'I Can practise');
    const finalTitle = typeof h.title === 'string' && h.title.trim() ? h.title.trim() : derived;
    const strands = [...new Set(words.map((w) => w.strand).filter(Boolean))];
    const level = levelLine(skills.map((s) => s.grade));
    const tabLines = Array.isArray(h.tab) && h.tab.length ? h.tab.map(String)
        : !twoLine && strands.length === 1 ? [level, strands[0], tabId] : [level, tabId];
    const ids = [...new Set(skills.map((s) => s.skillId).filter(Boolean))];
    const idText = ids.length > 4 ? `${ids.slice(0, 4).join(', ')} +${ids.length - 4}` : ids.join(', ');
    const codes = [...new Set(skills.flatMap((s) => String(s.ccss || '').split(/[,;]\s*/)).map((c) => c.trim()).filter(Boolean))];
    const ccss = codes.length > 9 ? `${codes.slice(0, 9).join(', ')} +${codes.length - 9}` : codes.join(', ');
    const left = footerLeft || [idText, gradeWords(skills.map((s) => s.grade)), ccss].filter(Boolean).join(' · ');
    const on = (k) => h[k] !== false;
    const tab = h.tab === false ? false : tabLines;
    const size = (input.ctx && SIZES[input.ctx.size]) ? input.ctx.size : DEFAULT_SIZE;
    const titleText = h.title === false ? '' : finalTitle;
    const titleLines = titleText ? ((h.titleLines && Number(h.titleLines)) || estimateTitleLines(titleText, size)) : 0;
    const header = {
        name: on('name'), date: on('date'),
        score: on('score') && score > 0 ? score : false,
        tab, title: titleText, titleNote: h.titleNote || '', titleLines,
    };
    const contTab = tab ? (tab.length > 1 ? [tab.slice(0, -1).join(' · '), tab[tab.length - 1]] : tab.slice()) : false;
    const contHeader = { name: on('name'), date: false, score: false, title: '', tab: contTab };
    const seed = input.seed;
    const form = input.form || 'A';
    const right = footerRight !== undefined ? footerRight
        : [form ? `Form ${form}` : '', seed !== undefined && seed !== null && seed !== '' ? `seed ${seed}` : ''].filter(Boolean).join(' · ');
    return { header, contHeader, footer: { left, right }, words, title: titleText, tabLines, level, strands };
}

/** The header the layout sees (only what changes its height). */
export const layoutHeader = (header) => ({ tab: header.tab, title: header.title, titleLines: header.titleLines });

/* ================================================================= banded-page budget */

/**
 * Heights of the parts of a banded page (PT-ENG-3), in mm. The strip is BD-3's; every band adds
 * its 2.25 pt top rule, the Say band is Hw + 3 (PT-OPN-9). `body` is the body under the header;
 * `budget` keeps the standard's 4 mm (bodyH - 4 = 232 on A4 with a full header).
 */
export function bandMetrics(ctx, header, { cont = false } = {}) {
    const s = SIZES[ctx.size] || SIZES[DEFAULT_SIZE];
    const body = bodyHeightMm(ctx.paper, header, { cont });
    return {
        body,
        budget: body - 4,
        strip: s.stripMm + 1.5,          // strip + its rule + the band's own border
        instr: instructionMm(ctx.size),
        say: s.writeMm + 3 + 1.5,
        gap: 3,
        writeMm: s.writeMm,
        checkMm: s.checkMm,
        textPt: s.textPt,
        pitch: { S: 5, M: 6, L: 6.9 }[ctx.size] || 6.9,
    };
}

/* ======================================================================== plan items */

/** A host item's measured (or static) height at `cols`, the tallest of a set. */
export function hMinAt(items, cols, ctx) {
    if (!items.length) return 0;
    const L = resolveSectionLayout({ role: 'independent', columns: cols, count: items.length, gridH: 400, target: { cols, rows: 1 }, ceiling: 1000 },
        items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look });
    return L.cols === cols ? L.hMin : Infinity;
}

/** Do all these items fit `cols` columns of the live width (measured, DN-10)? */
export function fitsAt(items, cols, ctx) {
    return items.every((it) => {
        const m = it.measured && it.measured[cols];
        if (m) return m.fits !== false;
        const fp = it.footprint || {};
        return !(fp.maxCols && cols > fp.maxCols);
    });
}

/** The largest column count in `options` (descending) at which every item fits. */
export function bestCols(items, options, ctx) {
    for (const c of options) if (fitsAt(items, c, ctx)) return c;
    return options[options.length - 1] || 1;
}

/**
 * One plan item from one role item. `render` is the role's draw function `(ctx, {cols}) => html`
 * (the SAME function draws the pupil page and the key, AK-1); `key` the answer key the slots are
 * filled from.
 */
export function planItem(it, { cols, level = 1, render, key, model = false, nolabel = false, visual } = {}) {
    const draw = render || it.render;
    return {
        q: it.q || null,
        render: typeof draw === 'function' ? (c) => draw(c, { cols }) : undefined,
        key: key !== undefined ? key : it.key,
        skill: it.skill || '',
        visual: visual !== undefined ? visual : !!it.visual,
        drawsAnswer: it.drawsAnswer !== undefined ? it.drawsAnswer : true,
        answerWords: it.answerWords,
        cls: [it.cellCls || '', hookClasses(it, level)].filter(Boolean).join(' '),
        style: it.cellStyle || '',
        model, nolabel,
    };
}

/** A grid part with fixed height (PT-ENG-6: one cell height for the section). */
export function gridPart(items, { cols, rows, cellH, labels = 'none', start = 1, cls = '', unlabelled } = {}) {
    const r = rows || Math.max(1, Math.ceil(items.length / cols));
    return {
        kind: 'grid', cols, rows: r, labels, start,
        cls: ['fixed', cls].filter(Boolean).join(' '),
        height: cellH ? `${Math.round(r * cellH * 100) / 100}mm` : '',
        items, unlabelled,
    };
}

/** A library instruction line (BD-10). Unknown keys fall back to the neutral default. */
export function instructionPart(key, vars = {}) {
    let k = key;
    let text;
    try { text = instructionFor(k, vars); } catch (e) { k = 'default-write'; text = INSTRUCTION_LIBRARY[k]; }
    return { kind: 'html', html: instructionHtml(k, text), key: k, text };
}

/** The instruction key of a set of items (BD-13), from the skills' own keys. */
export function instructionKeyOf(items, skills) {
    const keys = items.map((it) => {
        if (it.instructionKey) return it.instructionKey;
        const q = it.q || {};
        const s = (skills || []).find((k) => k.skillId === q.skillId && (!q.categoryId || k.categoryId === q.categoryId));
        return s ? (s.instructionKey || skillWords(s).instructionKey) : '';
    });
    return sectionInstructionKey(keys);
}

/** The library text of an instruction key, for a band strip. */
export function instructionText(key) {
    try { return instructionFor(key); } catch (e) { return INSTRUCTION_LIBRARY['default-write']; }
}

/* =================================================================== answer handling */

/** A plain, printable answer of a host item ('' when the answer is not one value). */
export function answerOf(it) {
    const k = it.key || {};
    const q = it.q || {};
    if (q.ans !== undefined && q.ans !== null && typeof q.ans !== 'object') return String(q.ans);
    if (k.value !== undefined && k.value !== null && typeof k.value !== 'object') return String(k.value);
    return '';
}

/** The misconception-based wrong answer of a question, through its provider (SCC). Scalar only. */
export function wrongOf(it) {
    const q = it.q || {};
    let w = null;
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        w = typeof p.wrongAnswer === 'function' ? p.wrongAnswer(q) : null;
    } catch (e) { w = null; }
    if (!w || w.value === undefined || w.value === null || typeof w.value === 'object') return null;
    const v = String(w.value);
    if (!v.trim() || v === answerOf(it)) return null;
    return Object.assign({}, w, { value: v });
}

/** The worked steps of a question, through its provider (SCC-P4); at most `max`. */
export function workedStepsOf(it, max = 6) {
    const q = it.q || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const st = typeof p.workedSteps === 'function' ? p.workedSteps(q) : [];
        return (Array.isArray(st) ? st : []).map((s) => ({ text: String(s.text || '').trim(), marks: s.marks || [] })).filter((s) => s.text).slice(0, max);
    } catch (e) { return []; }
}

/** The skill's strings (whatsNew, oralFrame, vocabulary) through its provider. */
export function stringsOf(it) {
    const q = it.q || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const raw = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel }) : p.strings;
        return raw || {};
    } catch (e) { return {}; }
}

/** A deterministic 40-60% "wrong" pattern over n items (PT-ERR-1, PT-TOF-1). */
export function wrongPattern(n, seed, tag) {
    const r = rng(deriveSeed(seed === undefined ? 0 : seed, tag || 'wrong', n));
    const want = Math.max(1, Math.round(n / 2));
    const idx = shuffle(r, Array.from({ length: n }, (_, i) => i)).slice(0, want);
    return Array.from({ length: n }, (_, i) => idx.includes(i));
}

/* ========================================================== operation-aware strings */

const OPS = {
    '+': 'add', '-': 'subtract', '−': 'subtract', '×': 'multiply', 'x': 'multiply', '*': 'multiply', '÷': 'divide', '/': 'divide',
};

/** add | subtract | multiply | divide | '' - from the question's operator or its category. */
export function opOf(q = {}) {
    if (q.op && OPS[q.op]) return OPS[q.op];
    const c = String(q.categoryId || '');
    if (c === 'addition') return 'add';
    if (c === 'subtraction') return 'subtract';
    if (c === 'multiplication') return 'multiply';
    if (c === 'division') return 'divide';
    return '';
}

const GLYPH = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
export const opGlyphOf = (op) => GLYPH[op] || '';

/** The operands of an operation question, as numbers ([] when it has none). */
export function operandsOf(q = {}) {
    const p = q.cell && q.cell.payload;
    const raw = p && Array.isArray(p.operands) ? p.operands : Array.isArray(q.operands) ? q.operands : [q.a, q.b];
    const out = raw.map((v) => (v === undefined || v === null || v === '' ? NaN : Number(String(v).replace(/,/g, ''))));
    return out.length >= 2 && out.every(Number.isFinite) ? out : [];
}

const isWhole = (v) => /^-?\d+$/.test(String(v).replace(/,/g, '').trim());

/**
 * PEDAGOGY_STANDARD.md 10.5: the oral frame of the `Say:` band, by operation or category.
 * `fill` writes this problem's numbers into it (the Scripted Model closes with the frame filled).
 */
export function oralFrameOf(it, { fill = false } = {}) {
    const str = stringsOf(it);
    const q = it.q || {};
    let frame = str.oralFrame || '';
    const op = opOf(q);
    const ops = operandsOf(q);
    const ans = answerOf(it);
    if (!frame) {
        if (op === 'add') frame = '__ plus __ equals __.';
        else if (op === 'subtract') frame = '__ minus __ equals __.';
        else if (op === 'multiply') frame = '__ times __ equals __.';
        else if (op === 'divide') frame = '__ divided by __ equals __.';
        else if (/^count/.test(String(q.skillId || '')) || q.categoryId === 'counting') frame = 'I count __.';
        else if (/:/.test(ans) && /time|clock/i.test(`${q.skillId} ${q.categoryId}`)) frame = 'The time is __.';
        else frame = 'The answer is __.';
    }
    if (!fill) return frame;
    const vals = op && ops.length >= 2 ? [ops[0], ops[1], ans] : [ans];
    let k = 0;
    return frame.replace(/__/g, () => { const v = vals[k++]; return v === undefined ? '__' : String(v); });
}

/**
 * The general steps of the Steps band (PT-OPN-3: 3 to 6 imperatives, 10 words or fewer), for the
 * four operations and counting; any other skill takes its worked steps (the default adapter's
 * worked-solution text). The last step is always a check or the answer (P-LG).
 */
export function generalSteps(it) {
    const q = it.q || {};
    const op = opOf(q);
    const ops = operandsOf(q);
    const big = ops.some((n) => Math.abs(n) >= 10);
    const f = String(q.printFormat || '');
    if (op === 'add') return big ? ['Add the ones.', 'Regroup 10 ones as 1 ten.', 'Add the tens.', 'Read the sum.']
        : ['Start with the bigger number.', 'Count on.', 'Write the sum.'];
    if (op === 'subtract') return big ? ['Look at the ones. Is the top digit smaller?', 'Regroup 1 ten as 10 ones.', 'Subtract the ones.', 'Subtract the tens.', 'Read the difference.']
        : ['Start with the bigger number.', 'Count back.', 'Write the difference.'];
    if (op === 'multiply') return /facts|fact/.test(f) || ops.every((n) => Math.abs(n) <= 12)
        ? ['Read the fact.', 'Count by the second number.', 'Write the product.']
        : ['Multiply the ones.', 'Regroup the tens.', 'Multiply the tens.', 'Add the regrouped tens.', 'Read the product.'];
    if (op === 'divide') return /long/.test(f) || ops.some((n) => n >= 100)
        ? ['Divide.', 'Multiply.', 'Subtract.', 'Bring down.', 'Write the remainder.']
        : ['Think of the times fact.', 'Find the missing factor.', 'Write the quotient.'];
    if (q.categoryId === 'counting' || /count/.test(String(q.skillId || ''))) return ['Touch each one.', 'Count.', 'Write the number.'];
    const worked = workedStepsOf(it, 5).map((s) => s.text);
    return worked.length ? worked : ['Read the problem.', 'Solve.', 'Write the answer.'];
}

/* ===================================================================== small drawings */

/** A check box with its label, on one line (section 6: box 5 / 6 / 7 mm). */
export function checkLine(id, text, ctx, key) {
    return `<span class="mq-checkline">${blank({ id, kind: 'check', shape: 'check', graded: true }, ctx, key)}<span>${esc(text)}</span></span>`;
}

/** A write line of `digits` width (B(n)). */
export function writeLine(id, ctx, key, digits = 3) {
    return blank({ id, kind: 'number', shape: 'line', digits, graded: true }, ctx, key);
}

/** The Steps list with outlined circle markers (BD-4). */
export const stepsHtml = (list, { cls = '' } = {}) =>
    `<ol class="ws-steps ${cls}">${list.map((s, i) => `<li><em>${i + 1}</em><span>${esc(s)}</span></li>`).join('')}</ol>`;

/** Slot-key helper: {slots: {id: {value}}} with an overall display. */
export function slotKey(slots, display = '') {
    const out = { value: display, display, slots: {} };
    for (const [id, v] of Object.entries(slots)) out.slots[id] = { value: v === undefined || v === null ? '' : String(v), graded: true };
    return out;
}

/* ======================================================================== the plan */

/**
 * Assemble a PagePlan from pages of parts. The engine stylesheet travels on page 1 of every
 * sheet (identical in both states), and pages 2+ carry the continuation marker (HD-20).
 */
export function assemble(role, input, frame, pages, extra = {}) {
    const ctx = ctxOf(input, extra.defaultLook);
    const withStyle = pages.map((pg, i) => {
        const sections = (pg.sections || []).slice();
        if (i === 0) sections.unshift({ kind: 'html', html: styleBlock() });
        if (i > 0 && !pg.header) sections.unshift({ kind: 'html', html: '<i class="mq-cont" hidden></i>' });
        return { header: pg.header || (i === 0 ? frame.header : frame.contHeader), sections, note: pg.note || '' };
    });
    const out = {
        role,
        ctx: { look: ctx.look, size: ctx.size, paper: ctx.paper, mode: 'print', scaffoldLevel: extra.scaffoldLevel !== undefined ? extra.scaffoldLevel : 1, photocopySafe: ctx.photocopySafe },
        cls: ctx.paper === 'letter' ? 'mq-paper-letter' : '',
        form: input.form || 'A',
        seed: input.seed,
        header: frame.header,
        contHeader: frame.contHeader,
        footer: frame.footer,
        pages: withStyle,
        meta: Object.assign({ role, pages: withStyle.length, title: frame.title, tab: frame.header.tab, notes: [] }, extra.meta || {}),
    };
    if (extra.nothingToAnswer) out.nothingToAnswer = true;
    return out;
}

/** Items of one pool, in order. */
export const poolItems = (input, id) => (input.items || []).filter((it) => (it.pool || 'main') === id);

export default {
    ctxOf, labelStyleOf, topicOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, bestCols, planItem,
    gridPart, instructionPart, instructionKeyOf, instructionText, answerOf, wrongOf, workedStepsOf, stringsOf,
    wrongPattern, opOf, opGlyphOf, operandsOf, oralFrameOf, generalSteps, checkLine, writeLine, stepsHtml,
    slotKey, assemble, poolItems, isWhole, JUDGE_LABELS, STRAND_BY_CATEGORY,
};
export { isWhole, JUDGE_LABELS, STRAND_BY_CATEGORY };
