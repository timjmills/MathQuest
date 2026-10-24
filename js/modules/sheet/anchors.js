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
// Mixed practice pages default to no examples ('on' means none on a page arranged 'mixed',
// IMPROVEMENT_PLAN 3.3 Q-M1); grouped (Sections) pages keep sections, one anchor per skill, on
// the skill's shelf band. (A Mixed practice page asked for 'sections' or 'side' prints in
// sections until the mixed examples modes come, M4 - print-sheet.js's request normaliser.)
//
// Only skills whose provider really implements `workedSteps` (`p.real`, compose.js) get anchors;
// the others print no anchor and the dialog says so (`ineligibleNote`).
//
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { esc, getProvider, hasCell, getCell, resolveCtx, SIZES } from './index.js';
import { FRAME_MM, cellBorderMm } from './layout.js';

export const ANCHOR_MODES = Object.freeze(['off', 'side', 'sections']);

/**
 * 'off' | 'side' | 'sections'. 'on' (and true) mean the role's default: sections (S6), except on
 * a Mixed practice page arranged 'mixed', where the default is no examples.
 */
export function normaliseAnchors(v, { role = '', arrangement = '' } = {}) {
    const s = String(v === true ? 'on' : v === undefined || v === null ? 'off' : v).toLowerCase().replace(/[^a-z]/g, '');
    if (s === 'on' && role === 'mixed-practice' && arrangement === 'mixed') return 'off';
    if (s === 'side' || s === 'sidebyside') return 'side';
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

/** Does this skill get an anchor? Only a real provider with at least 2 worked steps (review note 3). */
export const anchorEligible = (it) => workedStepsOf(it).length >= 2;

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
function stateHtml(it, merged, k, c, twinCols, whole, size, level = 3) {
    const t = stepTemplateOf(it);
    // The state is drawn at the anchor's own (smaller) preset: the templates read ctx.metrics and
    // the kit's size custom properties, which the wrapper's `ws-<size>` class sets (anchorHtml).
    const ctx = resolveCtx(Object.assign({}, c, { size, metrics: undefined, state: 'blank', scaffoldLevel: level, options: Object.assign({}, c.options || {}, { factColumns: twinCols }) }));
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

/** The narrowest column a step list keeps beside its state (mm): about five words at the zone size. */
const BESIDE_MIN_MM = 30;

/** The inner width of a full-width anchor cell at one column (mm). */
const BAND_W_MM = 178;

/**
 * TY-11: a step number is pupil-facing type, never under the minimum (the quiet letter at S, the
 * size table's smallest pupil type). The list's 0.85 em ran 7.0 pt at S and 7.8 pt at M (lead
 * pilot E1); the floor rides on the number itself, so pages without anchors are untouched.
 */
const TY11_MIN_PT = Math.min(...Object.values(SIZES).map((s) => s.letterPt));
const NUM_STYLE = ` style="font-size:max(0.85em,${TY11_MIN_PT}pt)"`;
// Critic anchors-r1 (5): a line never wraps before its "=": the word before it, "=" and the value
// after it are held together (no-break spaces), so "regrouped = 13." stays on one line.
const keepEquals = (html) => html.replace(/ +(=) +/g, '&nbsp;$1&nbsp;');
const lineHtml = (text, n) => `<li${n ? '' : ' class="mq-anchor-cont"'}>${n ? `<em${NUM_STYLE}>${n}</em>` : '<em></em>'}<span>${keepEquals(esc(text))}</span></li>`;
const stepsList = (steps, idx, style = '') => `<ol class="mq-anchor-steps"${style}>${idx.map((i) => stepLines(steps[i].text).map((t, j) => lineHtml(t, j === 0 ? i + 1 : 0)).join('')).join('')}</ol>`;

/**
 * The anchor's drawing.
 * @param {Object} it           the example: a host item (q with its cell, render, footprint)
 * @param {Object} c            the page ctx (size, look, metrics)
 * @param {Object} o
 * @param {'band'|'side'|'compact'} o.variant   the full-width strip of 2-4 states; the half-width
 *        twin (one state); or the compact full-width band of Mixed practice (one state, its steps
 *        beside it), which keeps a skill's shelf band short enough for two skills a page
 * @param {number} o.twinCols   the column count the pupil's cells are drawn at (fact ladder, stacks)
 * @param {number} [o.level]   the scaffold level the example is drawn at (3, a Model cell's; a
 *        practice page's side twin passes the pupil's own level, so the twin is the same drawing
 *        with the same scaffolds as the problem beside it - owner ruling B, critic anchors-r1)
 * @param {boolean} [o.greyNewest]  the one state's newest marks are grey even when the last step
 *        only restates the answer (S5 side twin, owner ruling C)
 */
export function anchorHtml(it, c, { variant = 'band', twinCols = 2, level = 3, greyNewest = false } = {}) {
    const steps = workedStepsOf(it);
    const say = sayLineOf(it);
    let whole = !stepTemplateOf(it);
    let groups = whole ? [{ steps: steps.map((_, i) => i), marks: [] }] : anchorGroups(steps);
    if (!whole && variant === 'band') {
        // Every state must fit its column: a wide model (an area model of three parts) takes fewer
        // states, and one that cannot stand two abreast is drawn whole with its steps beside it.
        const fp = (it && it.footprint) || {};
        const pageSize = SIZES[c.size] ? c.size : 'L';
        const scale = SIZES[stateSize(pageSize, 2)].digitPt / SIZES[pageSize].digitPt;
        const estW = (Number(fp.wMm) > 0 ? Number(fp.wMm) : 60) * scale;
        const colW = (n) => (BAND_W_MM - 13) / n - 5;
        while (groups.length > 2 && estW > colW(groups.length)) {
            let best = 0;
            for (let i = 1; i < groups.length - 1; i++) if (groups[i].steps.length + groups[i + 1].steps.length < groups[best].steps.length + groups[best + 1].steps.length) best = i;
            groups.splice(best, 2, { steps: groups[best].steps.concat(groups[best + 1].steps), marks: groups[best].marks.concat(groups[best + 1].marks) });
        }
        if (estW > colW(groups.length)) variant = 'compact';
    }
    const merged = groups.map((g) => ({ marks: g.marks }));
    const sayHtml = say ? `<div class="mq-anchor-say"><b>Say:</b> <span>${esc(say)}</span></div>` : '';
    if (variant === 'side' || variant === 'compact' || whole) {
        // One state: the worked example whole (the newest step grey), its steps under it
        // (side) or beside it (a band whose template draws no step states).
        const size = stateSize(c.size, variant === 'band' ? 2 : 1);
        let m = merged;
        let one = stateHtml(it, m, m.length - 1, c, twinCols, whole, size, level);
        // S5 / P-LC-9 (owner ruling C): the twin's LAST marks are grey. A last step that only
        // restates what is written ("The sum is 224.") turns nothing grey, so it shares its state
        // with the step before it until the newest marks show grey.
        if (greyNewest && !whole) {
            while (m.length > 1 && !/data-ws-ink="trace"/.test(one)) {
                m = m.slice(0, -2).concat([{ marks: m[m.length - 2].marks.concat(m[m.length - 1].marks) }]);
                one = stateHtml(it, m, m.length - 1, c, twinCols, whole, size, level);
            }
        }
        // (the whole-trace fallback, S5: its answer traced grey - a template that ignores the
        // trace ink keeps its answer slot, and the slot takes the grey: INK-3's trace rule)
        // (S3 task 6, E10: every writing place the example fills - a sort's bins, a table's cells -
        // not only one named "answer": the pupil writes all of them, so all are the newest marks)
        if (greyNewest && whole && !/data-ws-ink="trace"/.test(one)) one = one.replace(/ data-ws-aslot="([^"]*)"(?![^>]*data-ws-ink)/g, ' data-ws-aslot="$1" data-ws-ink="trace"');
        const st = `<div class="mq-anchor-cell ws-${size}">${one}</div>`;
        // The steps keep a readable column (BESIDE_MIN_MM): beside a state too wide to leave it,
        // they wrap UNDER the state and the cell grows (DN-10; lead pilot E2: a list squeezed to
        // no width beside a wide bar graph ran its lines out of the cell).
        // (the min-width as well: a shrink-to-fit twin sums its items' max-content widths, and a list
        // whose lines are narrower than its basis wrapped under the state 0.6 mm short - S3 rebuild)
        const list = stepsList(steps, steps.map((_, i) => i), ` style="flex:1 1 ${BESIDE_MIN_MM}mm;min-width:${BESIDE_MIN_MM}mm"`);
        // The state and its numbered steps side by side (the twin keeps its height close to the
        // pupil's problem beside it); the Say line closes it.
        const body = `<div class="mq-anchor-one mq-anchor-beside" style="flex-wrap:wrap">${st}${list}</div>`;
        // A side twin is centred in its cell at its own width (lead pilot E3, H13: never pinned to
        // one side of the pair's cell with an empty band beside it); a band keeps the full width.
        const centre = variant === 'side' ? ' style="width:auto;max-width:100%;align-self:center"' : '';
        // A one-state band has no state column right of the tab: its content starts under the
        // Model tab + 1 mm (critic s3-stack r1 A1; anchors.check E15).
        const below = variant === 'band' ? ' mq-anchor-belowtab' : '';
        return `<div class="mq-anchor mq-anchor-${variant}${below}" data-ws-anchor="${variant}" data-ws-states="1"${centre}>${body}${sayHtml}</div>`;
    }
    const n = groups.length;
    const size = stateSize(c.size, n);
    const states = groups.map((g, k) => `<div class="mq-anchor-state">`
        + `<div class="mq-anchor-cell ws-${size}">${stateHtml(it, merged, k, c, twinCols, false, size, level)}</div>`
        + `${stepsList(steps, g.steps)}</div>`).join('');
    return `<div class="mq-anchor mq-anchor-band" data-ws-anchor="band" data-ws-states="${n}">`
        + `<div class="mq-anchor-states" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${states}</div>${sayHtml}</div>`;
}

/**
 * The anchor as a HOST-SHAPED item (what `measureItems` and the roles' planItem read): it draws
 * the same in every state, so the key shows it exactly as the pupil page (AK-1), and it carries no
 * key and no graded slot (unscored, PT-LBL-6).
 */
export function anchorItem(it, { variant = 'band', twinCols = 2, level = 3, greyNewest = false } = {}) {
    return {
        q: null,
        anchor: variant,
        source: it,
        skill: it.skill || '',
        render: (c) => anchorHtml(it, c, { variant, twinCols, level, greyNewest }),
        key: { value: '', display: '', slots: {} },
        drawsAnswer: true,
        visual: false,
        // A twin clears the Model tab with the Guided model cell's top pad; a band keeps its
        // height for the problems and moves its first state right of the tab instead.
        cellCls: `mq-anchorcell mq-anchor-${variant}cell${variant === 'side' ? ' mq-modelcell' : ''}`,
        // (a side twin's width is not an equal half column: print-sheet measureSide2 sizes the pupil's
        // column to its problem and gives the twin the rest - S3 task 1)
        footprint: { wMm: variant === 'side' ? null : 180, hMm: null, measure: true, maxCols: variant === 'side' ? 2 : 1 },
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
    // A side twin measured in its printed pair (print-sheet measurePairs: the real grid at its
    // real column width, so no wrap margin is needed; anchors.check.cjs E2 holds it to the print).
    if (cols === 2 && a && Number.isFinite(a.pairMm) && a.pairMm > 0) return a.pairMm;
    const m = a && a.measured && a.measured[cols];
    // + 6 mm: the anchor's step text wraps in narrow state columns, and a wrap measured in the
    // app page can fall one line short of the printed document's (a line is ~5 mm at L).
    return m && Number.isFinite(m.hMm) ? m.hMm + 6 : 0;
}

/**
 * SIDE BY SIDE: the rows a page holds so every cell is at least as tall as what it holds (lead
 * pilot E2). A twin's step text is part of its measured height; a layout that kept the practice
 * ceiling's rows printed cells shorter than the twin, and its steps ran out of the cell (DN-10:
 * content never overflows; the cell grows, and a page holds fewer pairs). A twin carries the same
 * +6 mm print margin as a band (anchorHeightMm).
 *
 * Two columns ([twin | problem] rows): the most rows that hold the tallest pair (once the pairs
 * are measured as they print, print-sheet measurePairs). One column (a twin above
 * its problem): whole pairs, each pair's twin row and problem row as tall as each needs
 * (`pairMm`, the grid's row template), so a twin taller than half a pair still fits.
 *
 * @param {Object} L       the section layout (cols, rows, cellH, hMin, gridH)
 * @param {Object[]} items the section's items: twins (`anchor`) and, when known, the problems
 * @returns {Object} L, or a copy with fewer rows (and `pairMm: [twin, problem]` at one column)
 */
export function sideFit(L, items) {
    const twins = (items || []).filter((it) => it && it.anchor);
    // The rows of `need` mm a grid of G mm holds: its outer frame and the rules between its rows
    // take their share (S3: a row planned at G / rows was its pitch, not its height - a twin's Say
    // line ran 0.3-0.6 mm into the 2 mm pad, E11).
    const RULE = Math.max(cellBorderMm('daily'), cellBorderMm('ican'));
    const fitRows = (g, need) => Math.max(1, Math.floor((g - 2 * FRAME_MM + RULE) / (need + RULE)));
    if (!L || (L.cols !== 1 && L.cols !== 2) || !twins.length) return L;
    const G = Number(L.gridH) > 0 ? Number(L.gridH) : L.rows * L.cellH;
    const tw = Math.max(0, ...twins.map((a) => anchorHeightMm(a, L.cols)));
    const hs = (items || []).filter((it) => it && !it.anchor && it.measured && it.measured[L.cols] && Number.isFinite(it.measured[L.cols].hMm)).map((it) => it.measured[L.cols].hMm + 1);
    const pr = hs.length ? Math.max(...hs) : Number(L.hMin) || 0;
    if (L.cols === 2 && twins.every((a) => a.side4 && a.cols4 && Number.isFinite(a.pair4Mm) && a.pair4Mm > 0)) {
        // Owner ruling A: [twin | problem | twin | problem] rows, the most that hold the tallest
        // row of two pairs as it prints (print-sheet measureSide4), taken when a page holds at
        // least as many pairs as two columns would. Each cell is still drawn at the two-column
        // width (`drawCols`), so nothing shrinks (DN-10).
        const need4 = Math.max(...twins.map((a) => a.pair4Mm));
        // (two columns as they would print: the content-sized pair, `pairMm`, when it is measured)
        const need2 = Math.max(...twins.map((a) => Number(a.cols2 ? a.pairMm : a.pair2Mm) || 0), hs.length ? pr : 0, tw);
        // (no tolerance: a row shorter than its pair ran the twin's Say line into the 2 mm pad, E11)
        const rows = fitRows(G, need4);
        // (only a four-column row that fits the grid: on a shared page a 60 mm share took a 100 mm
        // four-column row because two columns did not fit either - S3)
        if (2 * rows >= fitRows(G, need2) && (need4 <= G || need4 <= need2)) {
            return Object.assign({}, L, { cols: 4, drawCols: 2, side4: true, colsTpl4: twins[0].cols4, rows, perPage: rows * 4, cellW: Math.round((L.cellW || 93) / 2 * 10) / 10, cellH: Math.floor((G / rows) * 1000) / 1000 });
        }
    }
    if (L.cols === 2) {
        // S3 task 1: the pair's columns are sized to their content (print-sheet measureSide2: the
        // pupil's column is its widest problem + its pads + the label box, the twin takes the
        // rest), and the rows to the pairs' heights MEASURED in those columns (`pairMm`).
        const tpl2 = twins.every((a) => a.cols2) ? twins[0].cols2 : '';
        const T = tpl2 ? { colsTpl2: tpl2 } : {};
        // (L.hMin holds the twins at an equal half column; with the problems known, they decide)
        const need = Math.max(hs.length ? pr : Number(L.hMin) || 0, tw);
        // The densest rows that hold every pair: fewer when a twin is taller than its row, more
        // when the practice ceiling left rows a third empty (E4, L-class wasted space).
        const fit = fitRows(G, need);
        // (pairs measured as they print - `pairMm` holds the problem beside the twin too - decide the
        // rows before the problems are dealt as well: the page's capacity on Auto, S3)
        const rows = need > L.cellH + 0.05 ? Math.min(L.rows, fit) : twins.every((a) => Number.isFinite(a.pairMm) && a.pairMm > 0) ? fit : L.rows;
        if (rows === L.rows) return Object.assign({}, L, T);
        return Object.assign({}, L, T, { rows, perPage: rows * 2, cellH: Math.floor((G / rows) * 1000) / 1000 });
    }
    // (A one-row layout made a PAIR of rows keeps a cell too tall for two: rows x cellH ran past
    // the page - critic anchors-r1, a 456 mm grid. Those rows are re-planned from the grid.)
    if (!(tw > L.cellH + 0.05) && !(L.rows * L.cellH > G + 0.05)) return L;
    const pairs = Math.max(1, Math.min(L.rows / 2, Math.floor(G / (tw + pr))));
    const rows = pairs * 2;
    // The spare height shared by the pair's two rows in proportion (never under what each holds).
    const k = G / pairs / (tw + pr);
    const pairMm = [Math.round(tw * k * 10) / 10, Math.round(pr * k * 10) / 10];
    return Object.assign({}, L, { rows, perPage: rows, cellH: Math.floor((G / rows) * 1000) / 1000, pairMm });
}

/** The columns of a two-column side-by-side grid (lead pilot E3, H13): sized to their content. */
export const SIDE_COLS = 'auto auto';

/** The four-column side grid, [twin | problem | twin | problem] (owner ruling A): each problem
 *  column at least `problemMm` wide (print-sheet measureSide4: the widest problem's ink + its
 *  margins); the spare width shared by all four (a twin's steps wrap under its state when they must). */
export const side4Cols = (problemMm) => `auto minmax(${problemMm}mm,auto) auto minmax(${problemMm}mm,auto)`;

/** A two-column side pair with an empty band this wide (H13's 30 %) beside a cell's content fills
 *  under about half of its row: it is a candidate for the four-column grid (print-sheet measureSide4). */
export const SIDE4_BAND = 0.30;

/** Owner ruling (2026-10-24): these skills' worked examples print in a band ABOVE the problems on
 *  a side-anchor page, never beside them (print-sheet buildSheetCore; anchors.check E14). Any other
 *  skill whose pair fills under half its row and does not stand four abreast does the same. */
export const SIDE_BAND_ONLY = Object.freeze(['fractions:shade_fraction', 'measurement:money_count', 'placevalue:place_value_10x']);

/* ============================================================ easy numbers first */

/**
 * How hard an example looks: the size of its numbers (the research: easy numbers first). Lower
 * is easier. The operands and the answer count; text numbers stand in when there are none.
 */
export function easeScore(q = {}) {
    const p = (q.cell && q.cell.payload) || {};
    const nums = [];
    const add = (v) => { const n = Number(String(v).replace(/,/g, '')); if (Number.isFinite(n)) nums.push(Math.abs(n)); };
    for (const v of [].concat(p.operands || [], p.a, p.b, p.dividend, p.divisor, p.multiplier, p.parts || [], q.a, q.b)) if (v !== undefined && v !== null && v !== '') add(v);
    if (!nums.length) for (const m of String(q.text || '').replace(/<[^>]*>/g, ' ').matchAll(/\d[\d,]*/g)) add(m[0]);
    if (q.ans !== undefined && typeof q.ans !== 'object') add(q.ans);
    return nums.reduce((s, n) => s + n, 0);
}

/**
 * `count` examples from `cands` (easy-first) whose signature is none of `exclude` (the pupil's
 * problems): an anchor is a sibling item, never one of the pupil's (review note 5). When the
 * skill has fewer distinct examples than asked, the list cycles; with none, it is empty.
 */
export function pickDistinct(cands, exclude, count, sigOf, digitsOf = null) {
    const ok = cands.filter((a) => !exclude.has(sigOf(a)));
    if (!ok.length) return [];
    if (!digitsOf) return Array.from({ length: Math.max(0, count) }, (_, i) => ok[i % ok.length]);
    // (critic s3-stack r1 M1: 23 − 11 beside 23 − 12) two examples whose digits differ in one
    // place or none are near twins: the easiest examples that differ by more come first, the
    // near ones only when the skill runs out.
    const near = (x, y) => { const a = digitsOf(x), b = digitsOf(y); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d <= 1; };
    const order = [];
    for (const a of ok) if (!order.some((b) => near(a, b))) order.push(a);
    for (const a of ok) if (!order.includes(a)) order.push(a);
    return Array.from({ length: Math.max(0, count) }, (_, i) => order[i % order.length]);
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
 * @param {number} [o.count]     the section's problem count (default 6): a lone block takes them all
 * @returns {{blockRows, perBlock, blocksPerPage, cellH, perPage, blockMm}}
 */
export function blockPlan({ cols, hMin, cellH, bodyMm, instrMm, anchorMm, count = 6 }) {
    const c = Math.max(1, cols || 1);
    const want = c >= 3 ? 1 : c === 2 ? 2 : 3;          // 3-4 problems a block (PT: owner ruling S6)
    const avail = Math.max(1, bodyMm - instrMm - 1);
    const h = Math.max(1, hMin || cellH || 30);
    let blockRows = want;
    while (blockRows > 1 && anchorMm + blockRows * h > avail) blockRows--;
    const blocksPerPage = Math.max(1, Math.floor(avail / (anchorMm + blockRows * h)));
    // A page that holds ONE block and a lot of empty paper (tall problems) gives the block the
    // rows that fit, rather than printing a half-empty page (PT-ENG-3). S6 one-block rule (S3
    // task 2): rows = min(what fits, ceil(n / cols)) - the lone block holds the section's n
    // problems when they fit (critic anchors-r2: 1 row of 4 at S, and 2 of 6 spilled overleaf).
    if (blocksPerPage === 1) {
        const more = Math.floor((avail - anchorMm) / h);
        const n = Math.max(1, Math.floor(Number(count) || 6), want * c);
        blockRows = Math.max(blockRows, Math.min(more, Math.ceil(n / c)));
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

/**
 * Printed on anchor pages only (practice.js composeSheet), so every other page keeps its bytes.
 * Critic anchors-r1 (4), S5 / L-ANCHOR: the key's answer weight (700 on solid ink) does not reach
 * a worked example - the example is a facsimile of the pupil page's. Additive: a later, more
 * specific rule; the key's own rule is untouched.
 */
export const ANCHOR_PAGE_CSS = '<style data-mq-anchor-page>.ws-page.ws-key .mq-anchor [data-ws-ink="solid"]:not(.mq-pupil){font-weight:inherit}</style>';

/** Drawn by the engine stylesheet (practice.js SHEET_ENGINE_CSS). Black and white, calm. */
export const ANCHOR_CSS = `
:is(.ws-page,.ws-sheet) .ws-cell.mq-anchorcell{justify-content:flex-start;align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-anchor{width:100%;display:flex;flex-direction:column;gap:1mm;text-align:left}
:is(.ws-page,.ws-sheet) .mq-anchor-band .mq-anchor-state:first-child .mq-anchor-cell{padding-left:13mm}
:is(.ws-page,.ws-sheet) .ws-cell:is(.mq-anchor-bandcell,.mq-anchor-compactcell){padding-top:2mm;padding-bottom:2mm}
:is(.ws-page,.ws-sheet) .ws-cell.mq-anchor-sidecell{padding-bottom:2mm}
:is(.ws-page,.ws-sheet) .mq-anchor-band.mq-anchor-belowtab{padding-top:calc(var(--ws-tab, 4.5mm) - 1mm)}
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
:is(.ws-page,.ws-sheet) .mq-anchor-say{font-size:var(--ws-zone);line-height:1.2;padding-top:1mm;border-top:var(--ws-hair) solid var(--ws-ink)}
:is(.ws-page,.ws-sheet) .mq-anchor-say>b{font-weight:700}
`;

export default {
    ANCHOR_MODES, ANCHOR_ROLES, normaliseAnchors, wordCount, workedStepsOf, anchorEligible, ineligibleNote,
    stepLines, anchorGroups, sayLineOf, stepTemplateOf, unslot, stateSize, anchorHtml, anchorItem,
    anchorPlanItem, anchorHeightMm, sideFit, SIDE_COLS, side4Cols, SIDE4_BAND, SIDE_BAND_ONLY, ANCHOR_PAGE_CSS, easeScore, pickDistinct, sideItems, pupilCount, blockPlan, blockPages, ANCHOR_CSS,
};
