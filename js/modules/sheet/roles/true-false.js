// js/modules/sheet/roles/true-false.js
// TRUE OR FALSE? (design/PAGE_TYPES.md 6.1): judge a finished statement, then complete a frame
// that says what is true.
//
//   Cell       the statement is the skill's own cell with an answer in its slot (state
//              `answered` or `wrong`); the check-box row "[ ] True  [ ] False" and the frame
//              "The answer is ____." sit under it at the same y in every cell of a row
//              (PT-TOF-3: the cell is a column whose rows are aligned by the fixed cell height)
//   False      40 to 60% of statements are false (PT-TOF-1), each from `wrongAnswer(q)`
//   Grid       2 columns; ceiling 8 / 6 / 4 (S / M / L); rows while they fit
//   Title      "True or False?" (HD-13); tab "True or False"; letters from a.; Score /N
//   Key        the right box checked; the frame holds the true answer (PT-TOF-2)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, wrongPattern,
    checkLine, writeLine, slotKey,
} from './compose.js';

export const ROLE_ID = 'true-false';
const CEILING = { S: 8, M: 6, L: 4 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2];

export function prepare(it, info = {}) {
    const correct = answerOf(it);
    if (!correct) return null;
    const wrong = wrongOf(it);
    const isFalse = !!(wrong && info.wrong);
    const shown = isFalse ? wrong.value : correct;
    const digits = Math.max(2, Math.min(6, correct.replace(/[^0-9]/g, '').length || 2));
    const key = slotKey({ 'tf-true': isFalse ? '' : '✓', 'tf-false': isFalse ? '✓' : '', 'tf-ans': correct }, correct);
    const render = (c, o = {}) => {
        const work = it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { shown }));
        return `<div class="mq-judge mq-tf">`
            + `<div class="mq-judge-work">${work}</div>`
            + `<div class="mq-judge-row">${checkLine('tf-true', 'True', c, key)}${checkLine('tf-false', 'False', c, key)}</div>`
            + `<div class="mq-frame">The answer is ${writeLine('tf-ans', c, key, digits)}.</div>`
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true,
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 2 }),
        fclass: 'standard', thinking: { shown, correct, isWrong: isFalse },
        cellCls: [it.cellCls || '', 'mq-thinkcell'].join(' ').trim(),
    });
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'True or False', title: 'True or False?', score: 1 });
    return resolveSectionLayout({
        role: ROLE_ID, columns: 'auto', count: items.length,
        target: { cols: 2, rows: { S: 4, M: 3, L: 2 }, rowsByCols: { 1: 4 } }, ceiling: CEILING, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'True or False', title: 'True or False?', score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows) { grid.cls = ''; grid.height = ''; }
    const falseShare = items.length ? items.filter((it) => it.thinking && it.thinking.isWrong).length / items.length : 0;
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('true-false'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, falseShare, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, wrongFlags };
