// js/modules/sheet/roles/error-analysis.js
// ERROR ANALYSIS, "Check it" (design/PAGE_TYPES.md 2.7): judge finished work, then fix only
// what is wrong.
//
//   Cell       the skill's own cell with an answer written in its slot (state `answered` or
//              `wrong`), then the decision row "[ ] Correct  [ ] Fix it" (library `check-fix`,
//              labels JUDGE_LABELS) and a fix line in the answer's shape
//   Wrong      40 to 60% of the shown answers are wrong (PT-ERR-1), each from the skill's
//              `wrongAnswer(q)` (the default adapter where the skill has none). An item with no
//              wrong answer is shown correct - "Correct" is then its right judgement.
//   Grid       2 columns, rows while they fit, ceiling 6 (the approved mock-up's 2 x 3 at L)
//   Labels     letters from a. (PT-LBL-7); Score in the header, one point per item (PT-ERR-2)
//   Key        the right box checked; the fix line holds the correct answer on wrong items
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, wrongPattern,
    checkLine, writeLine, slotKey, JUDGE_LABELS, esc,
} from './compose.js';

export const ROLE_ID = 'error-analysis';
const CEILING = { S: 6, M: 6, L: 6 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2];

/**
 * The role's cell around the skill's cell. `info.index` / `info.seed` choose wrong or right, so
 * the choice is part of the item and survives measurement, pagination and the key.
 */
export function prepare(it, info = {}) {
    const correct = answerOf(it);
    if (!correct) return null;                               // nothing to show in the slot
    const wrong = wrongOf(it);
    const isWrong = !!(wrong && info.wrong);
    const shown = isWrong ? wrong.value : correct;
    const digits = Math.max(2, Math.min(6, correct.replace(/[^0-9]/g, '').length || 2));
    const key = slotKey({ 'ea-ok': isWrong ? '' : '✓', 'ea-fix': isWrong ? '✓' : '', 'ea-ans': isWrong ? correct : '' }, correct);
    const render = (c, o = {}) => {
        const work = it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { shown }));
        return `<div class="mq-judge">`
            + `<div class="mq-judge-work">${work}</div>`
            + `<div class="mq-judge-row">${checkLine('ea-ok', JUDGE_LABELS.correct, c, key)}`
            + `<span class="mq-fixline">${checkLine('ea-fix', `${JUDGE_LABELS.fixIt}:`, c, key)}${writeLine('ea-ans', c, key, digits)}</span></div>`
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, answerWords: isWrong ? `Fix it: ${correct}` : 'Correct',
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 2 }),
        fclass: 'standard', thinking: { shown, correct, isWrong, basis: wrong ? wrong.basis : '' },
        cellCls: [it.cellCls || '', 'mq-thinkcell'].join(' ').trim(),
    });
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: 1 });
    return resolveSectionLayout({
        role: ROLE_ID, columns: 'auto', count: items.length,
        target: { cols: 2, rows: { S: 3, M: 3, L: 3 }, rowsByCols: { 1: 4 } }, ceiling: CEILING, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows) { grid.cls = ''; grid.height = ''; }
    const wrongShare = items.length ? items.filter((it) => it.thinking && it.thinking.isWrong).length / items.length : 0;
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('check-fix'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, wrongShare, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

/** Which items show a wrong answer: a seeded 40-60% pattern over the run (PT-ERR-1). */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, wrongFlags };
export { esc };
