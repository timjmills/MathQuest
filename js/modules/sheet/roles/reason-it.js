// js/modules/sheet/roles/reason-it.js
// REASON IT (design/PAGE_TYPES.md 6.2), format "Which is correct" - the format the default
// adapters cover for every skill (section 10): two finished solutions labelled "A" and "B"
// (never named characters, P-TH-14), side by side at the same size; one shows the right answer,
// the other the misconception behind `wrongAnswer(q)`. The pupil circles A or B and completes
// "__ is correct. The answer is __ ." (PT-RSN-4).
//
//   Grid       1 column x 4 / 3 / 2 rows (S / M / L), the ceiling of PT-RSN-1
//   Title      "Reason It" (HD-13); tab "Reason It A"; letters from a.; Score /N
//   Key        the right letter ringed (AK-2), both frame blanks written in
//
// An item whose answer has no wrong answer cannot make an A / B pair: `prepare` returns null
// and the host deals another item. Spot the mistake, odd one out and always / sometimes / never
// need provider members (`workedSteps` with marks, property tags, `claims[]`) and are not built
// here yet.
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, blank, writeLine, slotKey, rng, deriveSeed, wrongPattern,
} from './compose.js';

import { hasCell, getCell, cellFootprint } from '../registry.js';

export const ROLE_ID = 'reason-it';

/** A template that splits its item into the question and the answer (frac-model `views`). */
function viewsOf(it) {
    const q = it.q || {};
    if (!q.cell || !hasCell(q.cell.template)) return null;
    const t = getCell(q.cell.template);
    try { return typeof t.views === 'function' ? t.views(q.cell.payload || {}) : null; } catch (e) { return null; }
}
const ROWS = { S: 4, M: 3, L: 2 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

export function prepare(it, info = {}) {
    const correct = answerOf(it);
    const wrong = correct ? wrongOf(it) : null;
    if (!wrong) return null;
    // Which letter holds the right answer is a seeded half-and-half pattern over the page
    // (`wrongFlags`, handed in as `info.wrong`), so there is no A / B tell to learn.
    const aRight = info.wrong !== undefined ? !!info.wrong : rng(deriveSeed(info.seed === undefined ? 0 : info.seed, ROLE_ID, info.index || 0))() < 0.5;
    const right = aRight ? 'A' : 'B';
    const digits = Math.max(2, Math.min(6, correct.replace(/[^0-9]/g, '').length || 2));
    const key = slotKey({ 'ri-a': aRight ? 'A' : '', 'ri-b': aRight ? '' : 'B', 'ri-who': right, 'ri-ans': correct }, `${right}: ${correct}`);
    // A template with VIEWS draws its question once (pictures, story) and only the answer in A and
    // B (critic fractions-r1: every picture drawn twice made one item a page at L).
    const views = viewsOf(it);
    const vp = views ? { payload: { view: 'answer' } } : {};
    // the wrong solution carries the provider's slot values (a whole box holding "4/4")
    const work = (c, o, v) => it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { cols: 3, shown: v, prompt: false },
        v === wrong.value && wrong.slots ? { shownSlots: wrong.slots } : {}, vp));
    const question = (c, o) => (views && views.question
        ? `<div class="mq-abq">${it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { cols: 3, prompt: false, payload: { view: 'question' } }))}</div>` : '');
    // A cell wider than one of the two side-by-side boxes (a row of fraction models, a long
    // sentence) stacks A over B instead, so neither finished solution sticks out of its box (PG-12).
    let wMm = Number((it.footprint || {}).wMm);
    if (views) {
        try {
            const qa = Object.assign({}, it.q, { cell: Object.assign({}, it.q.cell, { payload: Object.assign({}, it.q.cell.payload, { view: 'answer' }) }) });
            const f = cellFootprint(qa, { mode: 'print', size: info.size || 'L', look: 'ican' });
            wMm = Number(f && f.wMm) || wMm;
        } catch (e) { /* the item's own width */ }
    }
    const wide = wMm > 56;
    // wider than the A box beside the answers (a count of six tiles): A, B and the answers one under another
    const xwide = wMm > 120;
    const render = (c, o = {}) => `<div class="mq-ab${wide ? ' mq-ab--wide' : ''}${xwide ? ' mq-ab--xwide' : ''}${views && views.question ? ' mq-ab--q' : ''}">`
        + question(c, o)
        + `<div class="mq-abbox"><span class="mq-abtag">A</span>${work(c, o, aRight ? correct : wrong.value)}</div>`
        + `<div class="mq-abbox"><span class="mq-abtag">B</span>${work(c, o, aRight ? wrong.value : correct)}</div>`
        + `<div class="mq-abresp">`
        + `<div class="mq-abchoice">${blank({ id: 'ri-a', kind: 'choice', shape: 'choice', text: 'A' }, c, key)}${blank({ id: 'ri-b', kind: 'choice', shape: 'choice', text: 'B' }, c, key)}</div>`
        + `<div class="mq-frame">${writeLine('ri-who', c, key, 1)} is correct.</div>`
        + `<div class="mq-frame">The answer is ${writeLine('ri-ans', c, key, digits)}.</div>`
        + `</div></div>`;
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true,
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 1 }),
        // a stacked (wide) pair is twice as tall as a side-by-side one: the section keeps one row
        // height for all (no packing by height), so the tall pair is never squeezed (PG-12)
        fclass: wide && !views ? 'wide' : 'standard', thinking: { correct, wrong: wrong.value, right },
        cellCls: [it.cellCls || '', 'mq-thinkcell'].join(' ').trim(),
    });
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Reason It A', title: 'Reason It', score: 1 });
    return resolveSectionLayout({
        role: ROLE_ID, columns: 1, count: items.length,
        target: { cols: 1, rows: ROWS }, ceiling: ROWS, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Reason It A', title: 'Reason It', score: items.length });
    const rows = Math.max(1, items.length);
    const grid = gridPart(items.map((it) => planItem(it, { cols: 1 })), { cols: 1, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('which'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, format: 'which-is-correct', fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

/** Items whose right answer is A: a seeded 40-60% pattern over the page. */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, wrongFlags };
