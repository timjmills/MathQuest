// js/modules/sheet/anchors.js
// STEP-BY-STEP ANCHOR PROBLEMS (design/SUPPORTS.md S5-S6; owner rulings 2026-09-25).
//
// An anchor is a WORKED EXAMPLE printed on a practice page: a sibling of the pupil's problems
// (same skill, same structure, different and easier numbers - never one of the pupil's items),
// drawn as a strip of 2-4 small step states (P-LC-9: the newest marks grey, earlier marks black),
// each with its numbered short steps (the provider's own `workedSteps(q)` text, P-5), and closed
// by the `Say:` line filled with the example's numbers (`strings.sayFill`). It is UNSCORED and
// UNLABELLED and carries the outlined `Model` tab (PT-LBL-6). It draws the same on the pupil
// page and on the key (`drawsAnswer: true`, no graded slots), so the key is a facsimile (AK-1).
//
// Two layouts, the teacher's pick (request field `anchors`):
//   'side'      rows of [worked twin | pupil problem] pairs - example first, then the problem
//   'sections'  an anchor band, then 3-4 problems, then the next anchor band ... (a BLOCK is an
//               anchor plus its problems and is never split across pages, PG-21 / PG-23)
// Mixed practice defaults to sections, one anchor per skill, on the skill's shelf band.
//
// Only skills whose provider really implements `workedSteps` (`p.real`, compose.js) get anchors;
// the others print no anchor and the dialog says so (`ineligibleNote`).
//
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { esc, getProvider, hasCell, getCell, resolveCtx, SIZES, cellFootprint } from './index.js';
import { cellWidthMm, LIVE_W_MM, measuredH, SAFETY_H_MM } from './layout.js';

export const ANCHOR_MODES = Object.freeze(['off', 'sections']);

/** 'off' | 'side' | 'sections'. 'on' (and true) mean the role's default: sections (S6). */
export function normaliseAnchors(v, { role = '' } = {}) {
    const s = String(v === true ? 'on' : v === undefined || v === null ? 'off' : v).toLowerCase().replace(/[^a-z]/g, '');
    // Owner ruling 2026-09-26 (LESSON_LIBRARY_PLAN.md 8f): ONE form only, a worked example on top
    // of each block. The side-by-side pair form is dropped; an old saved 'side' request prints as
    // sections, so saved sets still print.
    if (s === 'side' || s === 'sidebyside' || s === 'beside') return 'sections';
    if (s === 'sections' || s === 'section' || s === 'on') return 'sections';
    return 'off';
}

/** The roles that take anchors (S6). */
export const ANCHOR_ROLES = Object.freeze(['independent', 'more-practice', 'mixed-practice']);

/* ============================================================= the example's steps */

const WORD_RE = /[A-Za-z0-9]/;
/** Words of a step line (P-5 counts words; "+", "=" and "−" are not words). */
export const wordCount = (t) => String(t || '').split(/\s+/).filter((w) => WORD_RE.test(w)).length;

/** The provider's authored workedSteps for a host item ([] when the skill has none). */
export function workedStepsOf(it) {
    const q = (it && it.q) || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        if (!p || !Array.isArray(p.real) || !p.real.includes('workedSteps') || typeof p.workedSteps !== 'function') return [];
        const st = p.workedSteps(q);
        return (Array.isArray(st) ? st : [])
            .map((s) => ({ text: String((s && s.text) || '').trim(), marks: Array.isArray(s && s.marks) ? s.marks : [] }))
            .filter((s) => s.text).slice(0, 6);
    } catch (e) { return []; }
}

/** A choice / sort / multi-select item: never a worked example (critic anchor-r1: "Answer: opt3"). */
export function isChoiceItem(q = {}) {
    const at = String(q.answerType || '').toLowerCase();
    if (/multi|choice|select|sort|drag|match/.test(at)) return true;
    const ans = typeof q.ans === 'object' && q.ans !== null ? JSON.stringify(q.ans) : String(q.ans ?? '');
    return /\bopt\d/.test(ans);
}

/**
 * Can THIS item be a worked example? A real provider with at least 2 worked steps (review note 3),
 * and never a choice item. Decided per candidate: a skill whose first dealt item is a choice
 * variant still gets an example from its next written one (critic anchor-r1).
 */
export const anchorEligible = (it) => !isChoiceItem((it && it.q) || {}) && workedStepsOf(it).length >= 2;

/** The dialog's note for a skill that has no anchor. */
export const ineligibleNote = (label) => `No worked example for ${label || 'this skill'}: it has no step-by-step steps yet.`;

/** A step's text as short lines: one sentence a line, so every printed line stays within P-5's 10 words. */
export function stepLines(text) {
    // A sentence ends at . ? ! before a capital or a digit ("Write 1. Regroup 1 ten.", "= 9. 9 × 13"),
    // never inside a number sentence ("5 + ? = 11.").
    // A line still over 10 words breaks after its colon ("Count by 3, 7 times:" / "3, 6, 9 ... 21.").
    return String(text || '').split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean)
        .flatMap((t) => (wordCount(t) > 10 && /:\s/.test(t) ? t.split(/(?<=:)\s+/) : [t]));
}

/**
 * The step states of the strip: 2-4 groups of steps, each group ending on a step that makes a mark
 * (a step with no mark changes nothing on the cell, so it rides with the next marked one). The
 * steps before the first mark get a state of their own - the problem, not yet worked - while
 * there is room; beyond 4 the shortest adjacent pair is merged.
 *
 * @returns {{steps: number[], marks: Object[]}[]}
 */
export function anchorGroups(steps) {
    const marked = (i) => ((steps[i] && steps[i].marks) || []).length > 0;
    let groups = [];
    let cur = [];
    steps.forEach((_, i) => { cur.push(i); if (marked(i)) { groups.push(cur); cur = []; } });
    if (cur.length) { if (groups.length) groups[groups.length - 1].push(...cur); else groups.push(cur); }
    const g0 = groups[0] || [];
    const lead = g0.findIndex(marked);
    if (lead > 0 && groups.length < 4) groups.splice(0, 1, g0.slice(0, lead), g0.slice(lead));
    while (groups.length > 4) {
        let best = 1;
        for (let i = 1; i < groups.length - 1; i++) {
            if (groups[i].length + groups[i + 1].length < groups[best].length + groups[best + 1].length) best = i;
        }
        groups.splice(best, 2, groups[best].concat(groups[best + 1]));
    }
    groups = groups.filter((g) => g.length);
    return groups.map((g) => ({ steps: g, marks: g.flatMap((i) => (steps[i] && steps[i].marks) || []) }));
}

/** The Say line: the provider's frame filled with THIS example's numbers (SCC 3.8 sayFill). */
export function sayLineOf(it) {
    const q = (it && it.q) || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const str = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel, q }) : p.strings;
        if (str && typeof str.sayFill === 'function') { const v = str.sayFill(q); if (v) return String(v); }
    } catch (e) { /* no frame */ }
    return '';
}

/* ================================================================== the drawing */

/** The value an item answers with, as plain text ('' when not one value). */
function answerText(it) {
    const q = (it && it.q) || {};
    if (q.ans !== undefined && q.ans !== null && typeof q.ans !== 'object') return String(q.ans);
    if (Array.isArray(q.ans) && q.ans.every((v) => v !== null && typeof v !== 'object')) return q.ans.map(String).join(', ');
    const k = (it && it.key) || {};
    return k.value !== undefined && k.value !== null && typeof k.value !== 'object' ? String(k.value) : '';
}

/** A template that draws its own step states (S5; the review's constraint 1). */
export function stepTemplateOf(it) {
    const q = (it && it.q) || {};
    const id = q.cell && q.cell.template;
    if (!id || id === 'legacy' || !hasCell(id)) return null;
    const t = getCell(id);
    return typeof t.stepState === 'function' ? t : null;
}

/**
 * An anchor never offers a slot to anything that scores or fills slots: its writing places keep
 * their drawing but lose `data-ws-slot` (the key's fillSlots, the lints and the screen twin read
 * that attribute), so the key cannot re-fill them and nothing counts them (review note 2).
 */
export const unslot = (html) => String(html)
    .replace(/ data-ws-slot="([^"]*)"/g, ' data-ws-aslot="$1"')
    .replace(/ data-ws-graded="[^"]*"/g, '')
    .replace(/ data-mq-(?:cell|blank)="[^"]*"/g, '');

/**
 * One step state of the example: the template's own `stepState`, else (the fallback) the whole
 * cell with its answer traced grey.
 */
function stateHtml(it, merged, k, c, twinCols, whole, size) {
    const t = stepTemplateOf(it);
    // The state is drawn at the anchor's own (smaller) preset: the templates read ctx.metrics and
    // the kit's size custom properties, which the wrapper's `ws-<size>` class sets (anchorHtml).
    // Drawn like the pupil's problems (owner ruling 8f): the page's own scaffold level (1), so a
    // no-regroup skill gets no regroup frame and no head row or box the problems lack.
    const ctx = resolveCtx(Object.assign({}, c, { size, metrics: undefined, state: 'blank', scaffoldLevel: 1, options: Object.assign({}, c.options || {}, { factColumns: twinCols }) }));
    if (t && !whole) {
        const payload = Object.assign({}, it.q.cell.payload || {});
        // A fact's digit size follows the fact ladder, not the preset: pin it to the anchor's size.
        if (it.q.cell.template === 'fact' && !payload.pt) payload.pt = ctx.metrics.digitPt;
        return unslot(t.stepState(payload, merged, k, Object.assign({}, ctx, { step: k })));
    }
    const ans = answerText(it);
    let html;
    try {
        html = ans ? it.render(ctx, { cols: twinCols, shown: ans, ink: 'trace' })
            : it.render(Object.assign({}, ctx, { state: 'answered' }), { cols: twinCols });
    } catch (e) { html = ''; }
    return unslot(html);
}

/**
 * The preset a state is drawn at: a size SMALLER than the page's, so 2-4 states share a row and
 * the example reads as the teacher's worked example beside the pupil's full-size problems.
 * Page L: a side twin (one state) at M, a band's 2-4 states at S; pages M and S: S. The band
 * stays short, so a page holds two blocks where it can.
 */
export function stateSize(pageSize, n) {
    if (pageSize === 'L') return n <= 1 ? 'M' : 'S';
    return 'S';
}

/** The inner width of a full-width anchor cell at one column (mm). */
const BAND_W_MM = 178;

/* ------------------------------------------------ where the steps go (owner report 2026-09-25) */
//
// "The Model cell's step list is squeezed into a narrow column on the right": a count-by row drawn
// across the cell left its steps a column one word wide, which ran past the cell's border and down
// beside the next cell. The steps go BESIDE the drawing only when the cell leaves them a real
// column; otherwise they go UNDER it, across the cell's full width. Measured, never assumed (and
// the stylesheet wraps them under the drawing if a drawing turns out wider than estimated).

/** Every steps column - beside a drawing or under it - holds at least this many characters a line
 *  at the page's step type (`stepsMinMm`: 41 / 35 / 33 mm at L / M / S). */
export const STEPS_MIN_CHARS = 24;
/** Step text is never under 11 pt, at any size (critic anchor-r1: 8.3 pt at S). */
export const STEP_MIN_PT = 11;
const stepPt = (pageSize) => Math.max(STEP_MIN_PT, (SIZES[pageSize] || SIZES.L).zonePt * 0.92);
/** Under a wide drawing the steps take two text columns (read 1 2 / 3 4) when each is this wide. */
const STEPS_UNDER_COL_MM = 80;
const STEPS_GAP_MM = 4;               // between a drawing and its steps (.mq-anchor-beside gap)
const CELL_PAD_MM = 3;                // .ws-cell padding (css/sheet-kit.css)
const TAB_CLEAR_MM = 13;              // a band's (compact's) drawing moves right of the Model tab
const BULLET_MM = 6.2;                // a step's number circle and its gap (.mq-anchor-steps li>em)
const PT_MM = 25.4 / 72;
/** Andika's mean advance for step text (em; measured 0.475 at 11 pt): 18 characters of 11 pt are about 35 mm. */
const CHAR_EM = 0.5;

/** The width (mm) a steps column needs for STEPS_MIN_CHARS characters at the page's step type. */
export function stepsMinMm(pageSize = 'L') {
    const s = SIZES[pageSize] || SIZES.L;
    return Math.round((STEPS_MIN_CHARS * CHAR_EM * stepPt(s.id) * PT_MM + BULLET_MM) * 10) / 10;
}

/** The content width (mm) of an anchor cell in a grid of `cols` columns. */
export function anchorInnerMm(c = {}, cols = 1, variant = 'band') {
    const avail = Number(c.availableWidthMm) > 0 ? Number(c.availableWidthMm) : LIVE_W_MM;
    const inner = cellWidthMm(Math.max(1, cols), avail, c.look).inner - 2 * CELL_PAD_MM;
    return Math.round((inner - (variant === 'side' ? 0 : TAB_CLEAR_MM)) * 10) / 10;
}

/**
 * How wide the example's drawing is at the anchor's own preset (mm): the template's footprint at
 * THAT size (a count-by row of twelve is one row at M but two at L, so a page-size footprint
 * scaled down would be wrong), else a legacy cell's page-size footprint scaled by the digit size.
 */
export function drawingWidthMm(it, c = {}, size = 'M') {
    const q = (it && it.q) || {};
    const pageSize = SIZES[c.size] ? c.size : 'L';
    const tpl = q.cell && q.cell.template;
    if (tpl && tpl !== 'legacy' && hasCell(tpl)) {
        try {
            const fp = cellFootprint(q, resolveCtx({ mode: 'print', size, look: c.look, state: 'answered' }));
            if (fp && Number(fp.wMm) > 0) return Number(fp.wMm);
        } catch (e) { /* the host's footprint below */ }
    }
    const fp = (it && it.footprint) || {};
    const w = Number(fp.wMm) > 0 ? Number(fp.wMm) : 60;
    return w * (SIZES[size] || SIZES.M).digitPt / SIZES[pageSize].digitPt;
}

/**
 * Where the steps of a one-state anchor go: BESIDE the drawing when the column left beside it
 * holds STEPS_MIN_CHARS characters a line (`stepsMinMm`), else UNDER it. A drawing
 * that takes most of the cell (a count-by row, a number line, a long table, a bar model) always
 * puts its steps under it. Under a full-width drawing the steps take two text columns.
 *
 * @returns {{beside: boolean, innerMm: number, drawMm: number, colMm: number, underCols: number}}
 */
export function stepsPlacement(it, c = {}, { variant = 'side', cols = 1, size = 'M' } = {}) {
    const innerMm = anchorInnerMm(c, cols, variant);
    const drawMm = drawingWidthMm(it, c, size);
    const colMm = Math.round((innerMm - drawMm - STEPS_GAP_MM) * 10) / 10;
    // A footprint is an upper bound (a stack's is its widest answer plus pads), so only a drawing
    // that is clearly wide is decided here; for the rest the steps are offered beside it and the
    // stylesheet measures: `.mq-anchor-beside` wraps them UNDER the drawing whenever less than
    // `stepsMinMm` is left beside it (flex-basis and min-width), so the real drawing decides,
    // never the estimate.
    const need = stepsMinMm(c.size);
    const wide = drawMm > innerMm * 0.6 || innerMm - STEPS_GAP_MM < need + Math.min(drawMm, 20);
    const beside = !wide;
    const underCols = innerMm >= 2 * STEPS_UNDER_COL_MM + STEPS_GAP_MM ? 2 : 1;
    return { beside, innerMm, drawMm: Math.round(drawMm * 10) / 10, colMm, underCols, needMm: need };
}

/**
 * Step and Say text with its fractions STACKED (TY-7, critic anchor-r1: "1/2 + 1/2 = 2/2" printed
 * with slashes): "a/b" becomes the kit's stacked fraction, at the text's own size.
 */
export const stepText = (t) => esc(t)
    // A number sentence never breaks inside ("2 + / 2 = 4", critic anchor-r1): it wraps as a whole.
    .replace(/\d[\d,/.:]*(?:\s*[+\-\u2212\u00d7\u00f7=]\s*\d[\d,/.:]*)+/g, (m) => `<span class="mq-anchor-eq">${m}</span>`)
    .replace(/(\d+)\/(\d+)/g, (_, n, d) => `<span class="ws-frac mq-anchor-frac"><span>${n}</span><span>${d}</span></span>`);

const lineHtml = (text, n) => `<li${n ? '' : ' class="mq-anchor-cont"'}>${n ? `<em>${n}</em>` : '<em></em>'}<span>${stepText(text)}</span></li>`;
const stepsList = (steps, idx, style = '') => `<ol class="mq-anchor-steps"${style ? ` style="${style}"` : ''}>${idx.map((i) => stepLines(steps[i].text).map((t, j) => lineHtml(t, j === 0 ? i + 1 : 0)).join('')).join('')}</ol>`;
/**
 * The steps UNDER a drawing in `k` text columns read row by row (1 2 / 3 4), as the Guided page's
 * Steps band reads: each step keeps its lines together in one grid cell (a span a line, so every
 * printed line stays within P-5's 10 words).
 */
const stepsGrid = (steps, idx, k, maxChars = 0) => (k < 2 ? stepsList(steps, idx)
    : `<ol class="mq-anchor-steps mq-anchor-stepgrid" style="grid-template-columns:repeat(${k},minmax(0,1fr))">`
        + `${idx.map((i) => `<li class="mq-anchor-step"><em>${i + 1}</em><div class="mq-anchor-lines">`
            + `${joinLines(stepLines(steps[i].text), maxChars).map((t) => `<span>${stepText(t)}</span>`).join('')}</div></li>`).join('')}</ol>`);

/**
 * Short sentences of one step share a printed line when the column holds them both and the line
 * stays within P-5's 10 words ("12 + 12 = 24. Write 24." is one line in a half-width column).
 */
export function joinLines(lines, maxChars) {
    if (!(maxChars > 0)) return lines;
    const out = [];
    for (const t of lines) {
        const prev = out[out.length - 1];
        const both = prev ? `${prev} ${t}` : '';
        if (prev && both.length <= maxChars && wordCount(both) <= 10) out[out.length - 1] = both;
        else out.push(t);
    }
    return out;
}

/** Characters a line of a steps column `colMm` wide holds at the page's step type (Andika, mean advance). */
export const charsPerLine = (colMm, pageSize = 'L') => Math.floor((colMm - BULLET_MM) / (CHAR_EM * stepPt(pageSize) * PT_MM));

/**
 * The anchor's drawing.
 * @param {Object} it           the example: a host item (q with its cell, render, footprint)
 * @param {Object} c            the page ctx (size, look, metrics)
 * @param {Object} o
 * @param {'band'|'side'|'compact'} o.variant   the full-width strip of 2-4 states; the half-width
 *        twin (one state); or the compact full-width band of Mixed practice (one state, its steps
 *        beside or under it), which keeps a skill's shelf band short
 * @param {number} o.twinCols   the column count the pupil's cells are drawn at (fact ladder, stacks)
 * @param {number} [o.cols]     the column count of the grid the anchor cell itself sits in (a side
 *        twin: 2, or 1 when its problem is too wide for half the page); decides where its steps go
 */
export function anchorHtml(it, c, { variant = 'band', twinCols = 2, cols } = {}) {
    const steps = workedStepsOf(it);
    const say = sayLineOf(it);
    let whole = !stepTemplateOf(it);
    let groups = whole ? [{ steps: steps.map((_, i) => i), marks: [] }] : anchorGroups(steps);
    const pageSize = SIZES[c.size] ? c.size : 'L';
    if (!whole && variant === 'band' && groups.length > 1) {
        // A state whose drawing is the one before it (a "The sum is 101." step that re-inks the
        // digits already written) folds into its neighbour, never repeats it (critic anchor-r2);
        // a skill with ONE real state (a fact's one mark) is drawn once, finished, with its steps
        // beside it.
        const size2 = stateSize(pageSize, 2);
        const drawOf = (gs, k) => String(stateHtml(it, gs.map((g) => ({ marks: g.marks })), k, c, twinCols, false, size2))
            .replace(/ data-ws-ink="[^"]*"/g, '').replace(/ws-trace/g, '').replace(/#949494/gi, '#000');
        const kept = [groups[0]];
        for (let i = 1; i < groups.length; i++) {
            const trial = kept.concat([groups[i]]);
            if (drawOf(trial, trial.length - 1) === drawOf(trial, trial.length - 2)) {
                const prev = kept[kept.length - 1];
                kept[kept.length - 1] = { steps: prev.steps.concat(groups[i].steps), marks: prev.marks.concat(groups[i].marks) };
            } else kept.push(groups[i]);
        }
        groups = kept;
        if (groups.filter((g) => g.marks.length).length <= 1) {
            groups = [{ steps: steps.map((_, i) => i), marks: groups.flatMap((g) => g.marks) }];
            variant = 'compact';
        }
    }
    if (!whole && variant === 'band') {
        // Every state must fit its column, and so must its steps under it (STEPS_MIN_CHARS a line
        // at the page's step type: at L four states leave 36 mm, 15 characters, so three stand):
        // a wide model (an area model of three parts) takes fewer states, and one that cannot
        // stand two abreast is drawn whole with its steps beside or under it.
        const estW = drawingWidthMm(it, c, stateSize(pageSize, 2));
        const colW = (n) => (BAND_W_MM - 13) / n - 5;
        const textMin = stepsMinMm(pageSize);
        const tooNarrow = (n) => estW > colW(n) || colW(n) < textMin;
        while (groups.length > 2 && tooNarrow(groups.length)) {
            let best = 0;
            for (let i = 1; i < groups.length - 1; i++) if (groups[i].steps.length + groups[i + 1].steps.length < groups[best].steps.length + groups[best + 1].steps.length) best = i;
            groups.splice(best, 2, { steps: groups[best].steps.concat(groups[best + 1].steps), marks: groups[best].marks.concat(groups[best + 1].marks) });
        }
        if (tooNarrow(groups.length)) variant = 'compact';
    }
    const merged = groups.map((g) => ({ marks: g.marks }));
    const sayHtml = say ? `<div class="mq-anchor-say"><b>Say:</b> <span>${stepText(say)}</span></div>` : '';
    if (variant === 'side' || variant === 'compact' || whole) {
        // One state: the worked example whole (the newest step grey), and its numbered steps
        // BESIDE it when the cell leaves them a real column (the twin keeps its height close to
        // the pupil's problem beside it), else UNDER it across the cell. The Say line closes it.
        const k = merged.length - 1;
        const size = stateSize(c.size, variant === 'band' ? 2 : 1);
        const st = `<div class="mq-anchor-cell ws-${size}">${stateHtml(it, merged, k, c, twinCols, whole, size)}</div>`;
        const idx = steps.map((_, i) => i);
        const inCols = Number(cols) > 0 ? Number(cols) : variant === 'side' ? 2 : 1;
        const pl = stepsPlacement(it, c, { variant, cols: inCols, size });
        const body = pl.beside
            // The column's floor is 18 characters of the page's step type: narrower, the list wraps
            // under the drawing (flex-wrap), so it can never print a word a line.
            // The steps and the Say line stand together beside the drawing, the pair centred in the
            // band (critic anchor-r1: a clock band left 33-45% of its width empty).
            ? `<div class="mq-anchor-one mq-anchor-beside"><div class="mq-anchor-cell-wrap">${st}</div><div class="mq-anchor-text" style="flex-basis:${pl.needMm}mm;min-width:min(${pl.needMm}mm,100%)">${stepsList(steps, idx)}${sayHtml}</div></div>`
            : `<div class="mq-anchor-one mq-anchor-under">${st}${stepsGrid(steps, idx, pl.underCols,
                charsPerLine((pl.innerMm - (pl.underCols - 1) * 6) / pl.underCols, pageSize))}</div>`;
        return `<div class="mq-anchor mq-anchor-${variant}" data-ws-anchor="${variant}" data-ws-states="1" data-ws-steps="${pl.beside ? 'beside' : 'under'}">${body}${pl.beside ? '' : sayHtml}</div>`;
    }
    const n = groups.length;
    const size = stateSize(c.size, n);
    const states = groups.map((g, k) => `<div class="mq-anchor-state">`
        + `<div class="mq-anchor-cell ws-${size}">${stateHtml(it, merged, k, c, twinCols, false, size)}</div>`
        + `${stepsList(steps, g.steps)}</div>`).join('');
    return `<div class="mq-anchor mq-anchor-band" data-ws-anchor="band" data-ws-states="${n}" data-ws-steps="under">`
        + `<div class="mq-anchor-states" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${states}</div>${sayHtml}</div>`;
}

/**
 * The anchor as a HOST-SHAPED item (what `measureItems` and the roles' planItem read): it draws
 * the same in every state, so the key shows it exactly as the pupil page (AK-1), and it carries no
 * key and no graded slot (unscored, PT-LBL-6).
 */
export function anchorItem(it, { variant = 'band', twinCols = 2 } = {}) {
    return {
        q: null,
        anchor: variant,
        source: it,
        skill: it.skill || '',
        // The grid's column count (measureItems and the plan pass `{cols}`) decides where the
        // steps go: beside the drawing only when the cell leaves them a real column.
        render: (c, o) => anchorHtml(it, c, { variant, twinCols, cols: o && o.cols }),
        key: { value: '', display: '', slots: {} },
        drawsAnswer: true,
        visual: false,
        // A twin clears the Model tab with the Guided model cell's top pad; a band keeps its
        // height for the problems and moves its first state right of the tab instead.
        cellCls: `mq-anchorcell mq-anchor-${variant}cell${variant === 'side' ? ' mq-modelcell' : ''}`,
        // `restacks`: its steps stand beside the drawing in a wide cell and under it in a narrow one
        // on purpose, so a taller twin at 2 columns is not a collapse (print-sheet.js measureItems).
        footprint: { wMm: variant === 'side' ? 88 : 180, hMm: null, measure: true, maxCols: variant === 'side' ? 2 : 1, restacks: true },
        fclass: variant === 'side' ? 'standard' : 'wide',
        measureLevel: 3,
        section: it.section,
        pool: it.pool,
        template: 'anchor',
        answerType: 'model',
    };
}

/** The plan item of an anchor: unlabelled, Model tab, no key (grid.js draws `label('model')`). */
export function anchorPlanItem(a, cols = 1) {
    return {
        q: null,
        render: (c) => a.render(c, { cols }),
        key: a.key,
        skill: a.skill || '',
        visual: false,
        drawsAnswer: true,
        cls: `${a.cellCls} mqt--anchor mqa--model mql--3`,
        style: '',
        model: true,
        nolabel: true,
        anchor: true,
    };
}

/** The measured height of an anchor item (mm) at `cols`, with a floor. */
export function anchorHeightMm(a, cols = 1) {
    const m = a && a.measured && a.measured[cols];
    // + 6 mm: the anchor's step text wraps in narrow state columns, and a wrap measured in the
    // app page can fall one line short of the printed document's (a line is ~5 mm at L).
    return m && Number.isFinite(m.hMm) ? m.hMm + 6 : 0;
}

/* ============================================================ easy numbers first */

/**
 * How hard an example looks: the size of its numbers (the research: easy numbers first). Lower
 * is easier. The operands and the answer count; text numbers stand in when there are none.
 */
export function easeScore(q = {}) {
    const p = (q.cell && q.cell.payload) || {};
    const tpl = q.cell && q.cell.template;
    // Per template (critic anchor-r2: every clock and coin scored 0, so the generation order -
    // 10:58, 11:57 - decided). A clock: fewer fives to count, and not near the next hour (the
    // hour hand almost on the next number, the hands overlapping at 10-12). Coins: the total.
    if (tpl === 'clock' && p.m !== undefined) {
        const m = Number(p.m), h = Number(p.h);
        return m + (m >= 45 ? 60 : 0) + (h >= 10 || h === 12 ? 25 : 0);
    }
    if (tpl === 'coins') {
        if (p.kind === 'tally') return Number(p.target) || 0;
        return (p.coins || []).concat(p.notes || []).reduce((a, v) => a + (Number(v) || 0), 0);
    }
    const nums = [];
    const add = (v) => { const n = Number(String(v).replace(/,/g, '')); if (Number.isFinite(n)) nums.push(Math.abs(n)); };
    for (const v of [].concat(p.operands || [], p.a, p.b, p.dividend, p.divisor, p.multiplier, p.parts || [], q.a, q.b, p.tab)) if (v !== undefined && v !== null && v !== '') add(v);
    if (!nums.length) for (const m of String(q.text || '').replace(/<[^>]*>/g, ' ').matchAll(/\d[\d,]*/g)) add(m[0]);
    if (q.ans !== undefined && typeof q.ans !== 'object') add(q.ans);
    return nums.reduce((s, n) => s + n, 0);
}

/* ======================================================= distinct from the page (owner 8f) */

const numsIn = (v) => [...String(v ?? '').replace(/<[^>]*>/g, ' ').matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,/g, ''));

/**
 * The KEY numbers of an item (owner ruling 2026-09-26, 8f: "the example uses different numbers
 * from every problem on the page - never a problem's own numbers or its answers"): the count-by
 * table, the clock time, the coins' total or the change target, a function table's rule, else the
 * operands (sorted), else the numbers of its sentence. Two items with one `id` teach the same
 * numbers; `ans` is the answer as written.
 * @returns {{id: string, ans: string}}
 */
export function anchorKey(q = {}) {
    const c = q.cell || {};
    const p = c.payload || {};
    const ans = typeof q.ans === 'object' && q.ans !== null ? JSON.stringify(q.ans) : String(q.ans ?? '').trim();
    let id = '';
    // A choice item teaches every option it prints: its key holds each option's numbers (critic
    // anchor-r2: a Model 1 1/2 + 2 1/2 above a "Check ALL" item listing 1 1/2 + 2 1/2).
    const opts = Array.isArray(q.options) ? q.options.map((o) => (o && typeof o === 'object' ? o.label : o)).filter((x) => x !== undefined && x !== null) : [];
    if (opts.length) return { id: '', ans, ids: opts.map((o) => `n:${numsIn(o).sort().join('|')}`) };
    if (c.template === 'count-row' && p.tab !== undefined) id = `step:${p.tab}`;
    else if (c.template === 'clock' && p.h !== undefined) id = `time:${p.h}:${p.m}`;
    else if (c.template === 'coins') id = p.kind === 'tally' ? `make:${p.target}` : `coins:${p.total ?? ans}`;
    else if (c.template === 'function-table' && Array.isArray(p.rule)) id = `rule:${p.rule.map((r) => `${r.op}${r.n}`).join(',')}`;
    else {
        const ops = [].concat(p.operands || [], p.a !== undefined ? [p.a] : [], p.b !== undefined ? [p.b] : [], p.dividend !== undefined ? [p.dividend, p.divisor] : []);
        const nums = (ops.length ? ops.map(String) : numsIn(q.text)).map((n) => String(n).replace(/,/g, '')).sort();
        id = nums.length ? `n:${nums.join('|')}` : '';
    }
    return { id, ans };
}

/** Does example `a` share its key numbers or its answer with problem `b`? */
export function keysClash(a, b) {
    if ((b.ids || []).includes(a.id) || (a.ids || []).includes(b.id)) return true;
    return (!!a.id && a.id === b.id) || (!!a.ans && a.ans === b.ans);
}

/**
 * The SHAPE of an item's move (critic anchor-r2: "the example's answer form = the block's"): a
 * stack's operand lengths and whether it regroups; whether a fraction sum passes a whole; a
 * fact's operation. The example is taken from the block's most common shape first.
 */
export function anchorShape(q = {}) {
    const c = q.cell || {};
    const p = c.payload || {};
    if (c.template === 'stack' && Array.isArray(p.operands)) {
        const ops = p.operands.map((n) => Math.abs(Number(n)));
        const op = String(p.op || '+');
        let regroup = false;
        if (/-|−/.test(op) && ops.length === 2) {
            const [a, b] = ops.map((n) => String(n).split('').reverse().map(Number));
            regroup = b.some((d, i) => d > (a[i] || 0));
        } else {
            const cols = Math.max(...ops.map((n) => String(n).length));
            let carry = 0;
            for (let i = 0; i < cols; i++) { const s = ops.reduce((t, n) => t + (Math.floor(n / 10 ** i) % 10), carry); if (s >= 10) regroup = true; carry = Math.floor(s / 10); }
        }
        return `stack:${op}:${ops.map((n) => String(n).length).join(',')}:${regroup ? 'r' : 'n'}`;
    }
    if (c.template === 'frac-model') return `frac:${/^\s*\d+(\s|$)/.test(String(q.ans ?? '')) ? 'whole' : 'part'}`;
    return c.template ? `t:${c.template}` : '';
}

/**
 * Does the example show the skill's REAL move (critic anchor-r1)? Not a single coin (count at
 * least 3 coins of 2 kinds), not a minute that skips the move (to the minute: a minute past a
 * five, beyond the first five; to five minutes: past :05), not a count by 1.
 */
export function anchorRich(q = {}) {
    const c = q.cell || {};
    const p = c.payload || {};
    if (c.template === 'coins' && p.kind !== 'tally' && Array.isArray(p.coins)) {
        // At least 3 coins and a coin above 1 (never counting pennies by ones, critic anchor-r2).
        const all = p.coins.concat(p.notes || []).map(Number);
        return all.length >= 3 && all.some((v) => v > 1);
    }
    if (c.template === 'coins' && p.kind === 'tally' && Array.isArray(p.counts)) {
        // The fewest-coins move shows only when the biggest coin fits and a smaller one follows.
        return Number(p.counts[0]) > 0 && p.counts.filter((n) => Number(n) > 0).length >= 2;
    }
    const ops = (p.operands || (p.a !== undefined && p.b !== undefined ? [p.a, p.b] : [])).map(Number);
    if ((c.template === 'fact' || c.template === 'equation') && ops.length >= 2 && ops.every(Number.isFinite)) {
        // No 0 or 1 facts (the zero / identity rules are edge cases, not the groups move).
        const op = String(p.op || '');
        if (/[*x×]/.test(op)) return ops.every((n) => n >= 2);
        if (/[/÷]/.test(op)) return ops[1] >= 2 && ops[0] / ops[1] >= 2;
        return ops.every((n) => n >= 1);
    }
    if (c.template === 'stack' && ops.length >= 2 && ops.every(Number.isFinite)) {
        // No zero ones digit (12 - 10, 20 - 10) and no one-digit operand under a longer one.
        // ...and no zero digit in the answer (21 - 11 = 10 works "1 - 1 = 0"; 39 - 36 = 3 leaves
        // an unprinted tens), so every column of the example shows the real move.
        const res = /-|\u2212/.test(String(p.op || '')) ? ops[0] - ops[1] : ops.reduce((a, n) => a + n, 0);
        const rs = String(Math.abs(res));
        return ops.every((n) => n % 10 !== 0) && res > 0 && !rs.includes('0')
            && rs.length >= String(Math.abs(ops[0])).length
            && new Set(ops.map((n) => String(Math.abs(n)).length)).size === 1;
    }
    if (c.template === 'clock' && p.m !== undefined) {
        const m = Number(p.m);
        if (Number(p.precision) === 1) return m % 5 !== 0 && m > 10 && m < 45;
        if (Number(p.precision) === 5) return m >= 10 && m < 45;
        return true;
    }
    if (c.template === 'count-row' && p.tab !== undefined) return Number(p.tab) >= 2;
    return true;
}

/**
 * `count` worked examples for a page (owner ruling 8f): candidates already sorted easy-first;
 * never one whose key numbers or answer match any problem on the page (`pupilQs`); the skill's
 * real move first (`anchorRich`), trivial ones only when nothing else is left; and the examples of
 * one page distinct from each other while the skill has enough. Cycles when it runs out.
 */
export function pickExamples(cands, pupilQs, count, qOf = (a) => a.source.q) {
    const keys = (pupilQs || []).map(anchorKey);
    const free = cands.filter((a) => { const k = anchorKey(qOf(a)); return !keys.some((pk) => keysClash(k, pk)); });
    if (!free.length || count <= 0) return [];
    // The block's most common shape first (its answer form, its regrouping), then the real move.
    const tally = new Map();
    for (const q of pupilQs || []) { const sh = anchorShape(q); if (sh) tally.set(sh, (tally.get(sh) || 0) + 1); }
    const top = [...tally.entries()].sort((x, y) => y[1] - x[1])[0];
    const rank = (a) => (top && anchorShape(qOf(a)) === top[0] ? 0 : 2) + (anchorRich(qOf(a)) ? 0 : 1);
    const pool = free.map((a, i) => ({ a, i, r: rank(a) })).sort((x, y) => x.r - y.r || x.i - y.i).map((x) => x.a);
    const out = [];
    const used = new Set();
    for (const a of pool) {
        if (out.length >= count) break;
        const k = anchorKey(qOf(a)).id;
        if (k && used.has(k)) continue;
        used.add(k);
        out.push(a);
    }
    const base = out.length ? out.slice() : pool.slice(0, 1);
    while (out.length < count) out.push(base[out.length % base.length]);
    return out;
}

/**
 * `count` examples from `cands` (easy-first) whose signature is none of `exclude` (the pupil's
 * problems): an anchor is a sibling item, never one of the pupil's (review note 5). When the
 * skill has fewer distinct examples than asked, the list cycles; with none, it is empty.
 */
export function pickDistinct(cands, exclude, count, sigOf) {
    const ok = cands.filter((a) => !exclude.has(sigOf(a)));
    if (!ok.length) return [];
    return Array.from({ length: Math.max(0, count) }, (_, i) => ok[i % ok.length]);
}

/* ================================================================ SIDE BY SIDE */

/**
 * Rows of [twin | problem]: the pupil items with a twin before each (example first, never
 * after). `twins[i]` is the anchor item (variant 'side') of pupil item i.
 */
export function sideItems(pupil, twins) {
    const out = [];
    pupil.forEach((it, i) => { if (twins[i]) out.push(twins[i]); out.push(it); });
    return out;
}

/** Pupil (scored) items in a list that may hold anchors. */
export const pupilCount = (items) => items.filter((it) => !it.anchor).length;

/**
 * A row's measured height at one column (mm). A legacy cell's measurement is trusted here: the
 * pairs are only ever laid out at one column, the width it was measured at, so it cannot reflow.
 */
const pairH = (it) => measuredH(it, 1)
    || (it && it.measured && it.measured[1] && Number.isFinite(it.measured[1].hMm) ? it.measured[1].hMm + 1 : 0);

/**
 * Side by side in ONE column: the measured heights (mm) of each [twin, problem] pair, each row as
 * tall as what it holds. Null when a height is unknown, or the list is not pairs.
 * @returns {{rows: number[], pairs: number[][]} | null}   pairs = [[rowStart, rowCount], ...]
 */
export function pairRows(items) {
    const hs = items.map(pairH);
    if (!items.length || hs.some((h) => !h)) return null;
    const pairs = [];
    for (let i = 0; i < items.length;) {
        const n = items[i].anchor && i + 1 < items.length && !items[i + 1].anchor ? 2 : 1;
        pairs.push([i, n]);
        i += n;
    }
    return { rows: hs, pairs };
}

/**
 * Side by side in ONE column, paged by the rows' OWN heights (owner report 2026-09-25: one tall
 * twin sized every row of the page, and the page held one pair). Whole pairs only (PG-21: never a
 * twin at the foot of a page with its problem overleaf); each chunk carries its grid height and
 * its row template, so a twin and its problem are each as tall as what they hold (RUBRIC H13).
 * Null when a height is unknown (the uniform grid applies).
 */
export function packPairs(items, { gridFirstMm, gridContMm }) {
    const pr = pairRows(items);
    if (!pr) return null;
    const hOf = ([from, n]) => pr.rows.slice(from, from + n).reduce((a, b) => a + b, 0);
    const chunks = [];
    let p = 0;
    while (p < pr.pairs.length) {
        const G = (chunks.length ? gridContMm : gridFirstMm) - SAFETY_H_MM;
        let k = 0, sum = 0;
        while (p + k < pr.pairs.length && (k === 0 || sum + hOf(pr.pairs[p + k]) <= G)) { sum += hOf(pr.pairs[p + k]); k++; }
        const from = pr.pairs[p][0];
        const last = pr.pairs[p + k - 1];
        const count = last[0] + last[1] - from;
        const hs = pr.rows.slice(from, from + count);
        chunks.push({
            index: chunks.length, from, count, rows: count, rebalanced: false,
            gridMm: Math.round(sum * 100) / 100, rowsTpl: hs.map((h) => `${Math.round(h * 10) / 10}fr`).join(' '),
        });
        p += k;
    }
    return chunks;
}

/**
 * How many [twin, problem] pairs one page of `gridMm` holds, sized by the tallest twin and the
 * tallest problem measured (the page count is decided before the examples are picked).
 */
export function pairsPerPage(items, gridMm) {
    const tw = items.filter((it) => it.anchor).map(pairH);
    const pb = items.filter((it) => !it.anchor).map(pairH);
    if (!tw.length || !pb.length || tw.concat(pb).some((h) => !h)) return 0;
    return Math.max(1, Math.floor((gridMm - SAFETY_H_MM) / (Math.max(...tw) + Math.max(...pb))));
}

/* ==================================================================== SECTIONS */

/**
 * The block plan of one section (a block = one anchor band + its 3-4 problems). A block is never
 * split and never leaves its anchor at the foot of a page without its problems (PG-21, PG-23).
 *
 * @param {Object} o
 * @param {number} o.cols        the section's column count (sections mode caps it at 4)
 * @param {number} o.hMin        the tallest problem cell (mm)
 * @param {number} o.cellH       the layout's own cell height (mm) - never exceeded
 * @param {number} o.bodyMm      the height the section may use on a page, instruction included
 * @param {number} o.instrMm     the instruction line (PG-22: repeated on every page)
 * @param {number} o.anchorMm    the anchor band's measured height
 * @returns {{blockRows, perBlock, blocksPerPage, cellH, perPage, blockMm}}
 */
export function blockPlan({ cols, hMin, cellH, bodyMm, instrMm, anchorMm }) {
    const c = Math.max(1, cols || 1);
    const want = c >= 3 ? 1 : c === 2 ? 2 : 3;          // 3-4 problems a block (PT: owner ruling S6)
    const avail = Math.max(1, bodyMm - instrMm - 1);
    const h = Math.max(1, hMin || cellH || 30);
    let blockRows = want;
    while (blockRows > 1 && anchorMm + blockRows * h > avail) blockRows--;
    const blocksPerPage = Math.max(1, Math.floor(avail / (anchorMm + blockRows * h)));
    // A page that holds ONE block and a lot of empty paper (tall problems) gives the block the
    // rows that fit, up to 6 problems, rather than printing a half-empty page (PT-ENG-3).
    if (blocksPerPage === 1) {
        const more = Math.floor((avail - anchorMm) / h);
        // Critic anchor-r1: a lone block of one row left 68-83 mm of page empty; it takes every row
        // that fits (at S, with 4 columns, a second and third row), up to 6 problems or 3 rows.
        while (blockRows < more && (blockRows + 1) * c <= Math.max(6, 3 * c)) blockRows++;
    }
    const fill = (avail - blocksPerPage * anchorMm) / (blocksPerPage * blockRows);
    const ch = Math.max(h, Math.min(fill, Math.max(cellH || h, h)));
    return {
        blockRows, perBlock: blockRows * c, blocksPerPage, cellH: Math.floor(ch * 1000) / 1000,
        perPage: blocksPerPage * blockRows * c, blockMm: anchorMm + blockRows * ch,
    };
}

/**
 * Split `count` problems into pages of whole blocks. PG-23: a last page holding a third of a page
 * of blocks or less is rebalanced (blocks spread evenly). Each chunk lists its blocks, and its
 * `anchorMm` is what `placeSections` adds to the section's height on that page.
 *
 * @returns {{index, from, count, rows, anchorMm, blocks: {from, count, rows}[]}[]}
 */
export function blockPages(count, bp, cols, anchorMm) {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    if (!n) return [];
    const c = Math.max(1, cols || 1);
    const blocks = [];
    for (let from = 0; from < n; from += bp.perBlock) {
        const k = Math.min(bp.perBlock, n - from);
        blocks.push({ from, count: k, rows: Math.ceil(k / c) });
    }
    const per = Math.max(1, bp.blocksPerPage);
    const pageCount = Math.ceil(blocks.length / per);
    let sizes = Array.from({ length: pageCount }, (_, i) => (i < pageCount - 1 ? per : blocks.length - per * (pageCount - 1)));
    if (pageCount > 1 && sizes[pageCount - 1] * 3 <= per) {
        const base = Math.floor(blocks.length / pageCount);
        const extra = blocks.length % pageCount;
        sizes = sizes.map((_, i) => base + (i < extra ? 1 : 0));
    }
    const out = [];
    let b = 0;
    sizes.forEach((s, i) => {
        const bl = blocks.slice(b, b + s);
        b += s;
        out.push({
            index: i, from: bl[0].from, count: bl.reduce((a, x) => a + x.count, 0),
            rows: bl.reduce((a, x) => a + x.rows, 0), anchorMm: bl.length * anchorMm, blocks: bl,
        });
    });
    return out;
}

/* ====================================================================== the CSS */

/** Drawn by the engine stylesheet (practice.js SHEET_ENGINE_CSS). Black and white, calm. */
export const ANCHOR_CSS = `
:is(.ws-page,.ws-sheet) .ws-cell.mq-anchorcell{justify-content:flex-start;align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-anchor{width:100%;display:flex;flex-direction:column;gap:1mm;text-align:left}
:is(.ws-page,.ws-sheet) .mq-anchor-band .mq-anchor-state:first-child .mq-anchor-cell{padding-left:13mm}
:is(.ws-page,.ws-sheet) .ws-cell:is(.mq-anchor-bandcell,.mq-anchor-compactcell){padding-top:2mm;padding-bottom:2mm}
:is(.ws-page,.ws-sheet) .mq-anchor-compact .mq-anchor-cell{padding-left:13mm}
:is(.ws-page,.ws-sheet) .mq-anchor-states{display:grid;column-gap:0;width:100%}
:is(.ws-page,.ws-sheet) .mq-anchor-state{display:flex;flex-direction:column;align-items:stretch;gap:1.5mm;padding:0 2.5mm;min-width:0}
:is(.ws-page,.ws-sheet) .mq-anchor-state+.mq-anchor-state{border-left:var(--ws-hair) solid var(--ws-grey,#949494)}
:is(.ws-page,.ws-sheet) .mq-anchor-cell{display:flex;justify-content:center;align-items:flex-start;min-height:0}
:is(.ws-page,.ws-sheet) .mq-anchor-steps{list-style:none;margin:0;padding:0;font-size:calc(var(--ws-zone) * 0.92);line-height:1.2}
:is(.ws-page,.ws-sheet) .mq-anchor-steps li{display:flex;gap:1.6mm;align-items:flex-start;margin:0 0 0.5mm}
:is(.ws-page,.ws-sheet) .mq-anchor-steps li>em{flex:none;font-style:normal;width:4.6mm;height:4.6mm;border:var(--ws-hair) solid var(--ws-ink);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85em;line-height:1}
:is(.ws-page,.ws-sheet) .mq-anchor-steps li.mq-anchor-cont{margin-top:-0.4mm}
:is(.ws-page,.ws-sheet) .mq-anchor-steps li.mq-anchor-cont>em{border-color:transparent}
:is(.ws-page,.ws-sheet) .mq-anchor-one{display:flex;flex-direction:column;align-items:stretch;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside{flex-direction:row;align-items:flex-start;gap:4mm}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside>.mq-anchor-cell{flex:none}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside>.mq-anchor-steps{flex:1;min-width:0;padding-top:1mm}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside{flex-wrap:wrap;row-gap:2mm;justify-content:center}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside>.mq-anchor-steps{flex:1 1 41mm;min-width:min(41mm,100%)}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-under{flex-direction:column;align-items:stretch;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-under>.mq-anchor-cell{justify-content:center}
:is(.ws-page,.ws-sheet) .mq-anchor-steps.mq-anchor-stepgrid{display:grid;column-gap:6mm;row-gap:1mm}
:is(.ws-page,.ws-sheet) .mq-anchor-stepgrid>li.mq-anchor-step{margin:0}
:is(.ws-page,.ws-sheet) .mq-anchor-lines{flex:1;min-width:0;display:flex;flex-direction:column;gap:0.5mm}
:is(.ws-page,.ws-sheet) .mq-anchor-lines>span{display:block}
:is(.ws-page,.ws-sheet) .mq-anchor-steps{font-size:max(${STEP_MIN_PT}pt,calc(var(--ws-zone) * 0.92))}
:is(.ws-page,.ws-sheet) .mq-anchor .ws-frac.mq-anchor-frac{font-size:1em;margin:0 .1em}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside>.mq-anchor-cell-wrap{flex:none;display:flex;width:max-content}
:is(.ws-page,.ws-sheet) :is(.mq-anchor-band,.mq-anchor-compact)>.mq-anchor-one{padding-left:${TAB_CLEAR_MM}mm}
:is(.ws-page,.ws-sheet) .mq-anchor-compact>.mq-anchor-one .mq-anchor-cell{padding-left:0}
:is(.ws-page,.ws-sheet) .mq-anchor-eq{white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-anchor-one.mq-anchor-beside>.mq-anchor-text{flex-grow:1;flex-shrink:1;max-width:105mm;display:flex;flex-direction:column;gap:1.5mm;padding-top:1mm}
:is(.ws-page,.ws-sheet) .mq-anchor-say{font-size:max(${STEP_MIN_PT}pt,var(--ws-zone));line-height:1.2;padding-top:1mm;border-top:var(--ws-hair) solid var(--ws-ink)}
:is(.ws-page,.ws-sheet) .mq-anchor-say>b{font-weight:700}
`;

export default {
    ANCHOR_MODES, ANCHOR_ROLES, normaliseAnchors, wordCount, workedStepsOf, anchorEligible, ineligibleNote,
    stepLines, anchorGroups, sayLineOf, stepTemplateOf, unslot, stateSize, anchorHtml, anchorItem,
    anchorPlanItem, anchorHeightMm, easeScore, pickDistinct, pickExamples, anchorKey, keysClash, anchorRich, anchorShape, isChoiceItem, sideItems, pupilCount, blockPlan, blockPages, ANCHOR_CSS,
    STEPS_MIN_CHARS, stepsMinMm, anchorInnerMm, drawingWidthMm, stepsPlacement, pairRows, packPairs, pairsPerPage,
};
