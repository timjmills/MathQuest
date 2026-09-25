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
import { paperOf, bodyHeightMm, instructionMm, resolveSectionLayout, fitsLine, LIVE_W_MM, itemCap } from '../layout.js';
import {
    skillWords, levelLine, gradeWords, instructionHtml, estimateTitleLines, styleBlock, hookClasses,
    STRAND_BY_CATEGORY, sectionInstructionKey, resolveInstruction, varsOfItems,
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
    const idText = ids.length > 3 ? `${ids.slice(0, 3).join(', ')} +${ids.length - 3}` : ids.join(', ');
    const codes = [...new Set(skills.flatMap((s) => String(s.ccss || '').split(/[,;]\s*/)).map((c) => c.trim()).filter(Boolean))];
    const ccss = codes.length > 9 ? `${codes.slice(0, 9).join(', ')} +${codes.length - 9}` : codes.join(', ');
    // A lesson packet prints its own tags on every sheet (header.footerLeft, roles/lesson.js).
    const left = footerLeft || (typeof h.footerLeft === 'string' && h.footerLeft) || [idText, gradeWords(skills.map((s) => s.grade)), ccss].filter(Boolean).join(' · ');
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
    // + 1 mm: a grid's 1.5 pt frame and 0.75 pt interior rules come out of its height, so a row
    // of cellH holds a cell about 0.5 mm shorter than cellH (PG-12's safety, per cell).
    return L.cols === cols ? L.hMin + 1 : Infinity;
}

/** Do all these items fit `cols` columns of the live width (measured, DN-10)? */
export function fitsAt(items, cols, ctx) {
    return items.every((it) => {
        // The item's own column cap first (a word problem is one column, PT-WPR-1, however
        // narrow its wrapped text measures), then the host's measurement (DN-10).
        const fp = it.footprint || {};
        // The item's cap at THIS size (LESSONS_LEARNED L1: S printed the grid of L). Below L a
        // static-width cell's computed width decides, and a measured cell its measurement (the
        // widest count at which nothing overflowed, clipped or shrank, DN-10) - layout.itemCap,
        // as the practice roles already do. L, and a full-width template (maxCols 1: a number
        // line, a story), keep the author's cap.
        const size = (ctx && ctx.size) || '';
        const staticW = !fp.measure && !fp.factLike && Number.isFinite(fp.wMm);
        const below = size && size !== 'L' && fp.maxCols > 1;
        const cap = fp.maxCols && below && (staticW || (fp.measure && it.measured))
            ? itemCap({ fp, measured: staticW ? null : it.measured, size }) : fp.maxCols;
        if (cap && cols > cap) return false;
        if (cols > 1 && (it.fclass === 'word' || it.fclass === 'wide')) return false;
        const m = it.measured && it.measured[cols];
        return m ? m.fits !== false : true;
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
    // A Model or Guided cell draws at its own scaffold level (PT-GDP-1: grey supports at level 2,
    // the traced answer at 3). Levels 0 and 1 draw at 1: structural supports never drop (PT-TST-2).
    const lift = level >= 2 ? (c) => Object.assign({}, c, { scaffoldLevel: level }) : (c) => c;
    return {
        q: it.q || null,
        render: typeof draw === 'function' ? (c) => draw(lift(c), { cols }) : undefined,
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
    // `vars` may be the section's items: their {n}, when they all agree (SCC-P17); a key whose
    // placeholder cannot be filled takes its plain fallback ("Write the missing number.").
    const r = Array.isArray(vars) ? resolveInstruction(key, vars) : resolveInstruction(key, [], vars);
    return { kind: 'html', html: instructionHtml(r.key, r.text), key: r.key, text: r.text };
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
export function instructionText(key, items) {
    return resolveInstruction(key, items || [], items ? undefined : {}).text;
}

/* =================================================================== answer handling */

/** A plain, printable answer of a host item ('' when the answer is not one value). */
export function answerOf(it) {
    const k = it.key || {};
    const q = it.q || {};
    if (q.ans !== undefined && q.ans !== null && typeof q.ans !== 'object') return String(q.ans);
    // A several-part answer (a cloze's two parts): its parts in order, comma separated - the
    // form the host writes into a cell's boxes one part per box.
    if (Array.isArray(q.ans) && q.ans.length && q.ans.every((v) => v !== null && typeof v !== 'object')) return q.ans.map(String).join(', ');
    if (k.value !== undefined && k.value !== null && typeof k.value !== 'object') return String(k.value);
    return '';
}

/**
 * The misconception-based wrong answer of a question, through its provider (SCC 3.8):
 * `{value, display, misconception, slot, slots, explain}`. The value keeps the answer's shape
 * (a number, "8 R 5", ["14", "3"] -> "14, 3", "20, 20, 15, 5"); null when there is none or it
 * equals the answer.
 */
export function wrongOf(it) {
    const q = it.q || {};
    let w = null;
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        w = typeof p.wrongAnswer === 'function' ? p.wrongAnswer(q) : null;
    } catch (e) { w = null; }
    if (!w || w.value === undefined || w.value === null) return null;
    let v;
    if (Array.isArray(w.value)) {
        if (!w.value.length || w.value.some((x) => x === null || typeof x === 'object')) return null;
        v = w.value.map(String).join(', ');
    } else if (typeof w.value === 'object') return null;
    else v = String(w.value);
    const norm = (t) => String(t).replace(/\s+/g, '').toLowerCase();
    if (!v.trim() || norm(v) === norm(answerOf(it))) return null;
    return Object.assign({}, w, { value: v, display: w.display !== undefined ? String(w.display) : v });
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
        const raw = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel, q }) : p.strings;
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
    const pop = q.cell && q.cell.payload && q.cell.payload.op;
    if (pop && OPS[pop]) return OPS[pop];
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
    const p = (q.cell && q.cell.payload) || {};
    const num = (v) => (v === undefined || v === null || v === '' ? NaN : Number(String(v).replace(/,/g, '')));
    const tries = [p.operands, [p.a, p.b], q.operands, [q.a, q.b], [q.num1, q.num2]];
    for (const raw of tries) {
        if (!Array.isArray(raw)) continue;
        const out = raw.map(num);
        if (out.length >= 2 && out.every(Number.isFinite)) return out;
    }
    // Last resort: the question's own text, "7 × 3 = ?" / "46 − 18".
    // A chain of one operator ("13 + 72 + 8 = ?", column addition of several addends) keeps
    // every operand.
    const plain = String(q.text || '').replace(/<[^>]*>/g, ' ');
    const chain = /(-?[\d,]+)((?:\s*([+\-−×x*÷/])\s*-?[\d,]+)+)/.exec(plain);
    if (chain) {
        const rest = [...chain[2].matchAll(/\s*([+\-−×x*÷/])\s*(-?[\d,]+)/g)];
        if (rest.every((r) => r[1] === rest[0][1])) return [num(chain[1]), ...rest.map((r) => num(r[2]))];
        return [num(chain[1]), num(rest[0][2])];
    }
    return [];
}

const isWhole = (v) => /^-?\d+$/.test(String(v).replace(/,/g, '').trim());

/**
 * PEDAGOGY_STANDARD.md 10.5: the oral frame of the `Say:` band, by operation or category.
 * `fill` writes this problem's numbers into it (the Scripted Model closes with the frame filled).
 */
export function oralFrameOf(it, { fill = false } = {}) {
    const str = stringsOf(it);
    const q = it.q || {};
    // SCC 3.8: a real provider fills its own frame ("__ tens and __ ones is __." does not take
    // the operands in order, so the role never fills a provider's frame itself).
    if (fill && typeof str.sayFill === 'function') {
        try { const v = str.sayFill(q); if (v) return String(v); } catch (e) { /* fall through */ }
    }
    let frame = str.say || str.oralFrame || '';
    const own = !!frame;
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
    // A provider's frame without sayFill keeps its blanks (it may not take the operands in
    // order); only the role's own operation frames are filled here.
    if (own) return frame;
    const vals = op && ops.length >= 2 ? [ops[0], ops[1], ans] : [ans];
    let k = 0;
    return frame.replace(/__/g, () => { const v = vals[k++]; return v === undefined ? '__' : String(v); });
}

/** A provider's steps as a list of short strings (an array, or one string of lines). */
function stepList(raw) {
    if (Array.isArray(raw)) return raw.map((s) => String(s && typeof s === 'object' ? s.text || '' : s || '').trim()).filter(Boolean);
    if (typeof raw !== 'string' || !raw.trim()) return [];
    return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * The Steps band's steps (PT-OPN-3), from the SKILL only (SCC 3.8): the provider's
 * `strings.steps` (general steps right for this skill), else its own authored `workedSteps(q)`.
 * A skill with no provider steps gets [] - no Steps box - never generic operation steps, which
 * were wrong for half the skills (regrouping steps on a basic-facts sheet, "Write the sum" on a
 * missing-part item).
 */
export function generalSteps(it) {
    const own = stepList(stringsOf(it).steps);
    if (own.length) return own.slice(0, 6);
    return providerWorkedSteps(it, 6).map((s) => s.text);
}

/** The provider's authored `workedSteps(q)`; [] when the skill has none (the default adapter's are not used). */
export function providerWorkedSteps(it, max = 6) {
    const q = it.q || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        if (!p || !Array.isArray(p.real) || !p.real.includes('workedSteps') || typeof p.workedSteps !== 'function') return [];
        const st = p.workedSteps(q);
        return (Array.isArray(st) ? st : []).map((s) => ({ text: String((s && s.text) || '').trim(), marks: (s && s.marks) || [] })).filter((s) => s.text).slice(0, max);
    } catch (e) { return []; }
}

/**
 * The values of an instruction's placeholders (`{n}`) for a set of items, from the provider's
 * `strings.instructionVars(q)` (SCC-P17): "Circle groups of {n}." takes the first item's n.
 */
export function instructionVarsOf(items) {
    return varsOfItems(items);
}

/* ===================================================================== small drawings */

/** A check box with its label, on one line (section 6: box 5 / 6 / 7 mm). */
export function checkLine(id, text, ctx, key, { graded = true } = {}) {
    return `<span class="mq-checkline">${blank({ id, kind: 'check', shape: 'check', graded }, ctx, slotOnly(key, id))}<span>${esc(text)}</span></span>`;
}

/** A write line of `digits` width (B(n)). */
export function writeLine(id, ctx, key, digits = 3, { graded = true } = {}) {
    return blank({ id, kind: 'number', shape: 'line', digits, graded }, ctx, slotOnly(key, id));
}

/**
 * ONE judgement made of several marks: Correct / Fix it, True / False, "There are more" /
 * "I found them all". The pupil checks one box, so the group - not each box - is the scored
 * slot (`data-ws-slot` on the wrapper; the boxes inside are ungraded parts of it). On the key the
 * group carries its check mark, and the box that stays empty is the answer too (AK-2).
 */
export const judgeGroup = (id, inner, cls = '') =>
    `<div class="mq-judge-row ${cls}" data-ws-slot="${id}" data-ws-shape="open">${inner}</div>`;

/**
 * The key of ONE slot. `blank()` falls back to the key's `display` for a slot the key does not
 * list, which would print "6 answers shown" inside an empty check box; a role's own slots are
 * therefore always drawn from their own entry, or left empty.
 */
export function slotOnly(key, id) {
    if (!key || typeof key !== 'object') return key;
    const e = key.slots && key.slots[id];
    return { value: e ? e.value : '', display: e ? e.value : '', slots: { [id]: e || { value: '', graded: true } } };
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
    wrongPattern, opOf, opGlyphOf, operandsOf, oralFrameOf, generalSteps, providerWorkedSteps, instructionVarsOf, checkLine, writeLine, stepsHtml,
    slotKey, assemble, poolItems, isWhole, JUDGE_LABELS, STRAND_BY_CATEGORY,
};
export { isWhole, JUDGE_LABELS, STRAND_BY_CATEGORY };
