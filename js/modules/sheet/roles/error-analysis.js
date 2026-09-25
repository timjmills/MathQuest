// js/modules/sheet/roles/error-analysis.js
// ERROR ANALYSIS, "Check it" (design/PAGE_TYPES.md 2.7): judge finished work, then fix only
// what is wrong.
//
//   Cell       the skill's own cell with an answer written in its slot (state `answered` or
//              `wrong`) and WITHOUT the cell's own stem ("Add." over finished work contradicts
//              "Check the work"), then beside it the decision "[ ] Correct  [ ] Fix it" (library
//              `check-fix`, labels JUDGE_LABELS) and ONE square write box captioned "correct
//              answer": the only place on the item the pupil writes
//   Wrong      40 to 60% of the shown answers are wrong (PT-ERR-1), each a REAL misconception
//              from the skill's `wrongAnswer(q)`. An item flagged wrong that has none is skipped
//              (the host deals another); a skill with no real wrong answer at all is
//              `unsupported`, never a page on which every answer is right
//   Grid       full-width rows when the ceiling's worth fits (work left, judgement right, no
//              dead band), else 2 columns; ceiling 6 / 4 / 4 (WORKSHEET_DESIGN_STANDARD 12.1)
//   Labels     letters from a. (PT-LBL-7); Score in the header, one point per item (PT-ERR-2)
//   Key        the right box checked; the write box holds the correct answer on wrong items
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, wrongPattern,
    checkLine, slotKey, slotOnly, JUDGE_LABELS, esc, blank, judgeGroup,
} from './compose.js';

export const ROLE_ID = 'error-analysis';
// WORKSHEET_DESIGN_STANDARD 12.1: Error analysis 6 / 4 / 2-4 (the 04-E mock-up's 2 x 3 at L
// predates the ceiling; the standard is law for capacity).
const CEILING = { S: 6, M: 4, L: 4 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2];

/**
 * A wrong answer a pupil could really have written: the provider's `wrongAnswer(q)`, but never
 * the default adapter's "nudge" (a near miss with no named error). PT-ERR-1: "a real
 * misconception, never a random number".
 */
export function realWrongOf(it) {
    const w = wrongOf(it);
    if (!w) return null;
    if (w.basis === 'nudge') return null;
    return w;
}

/**
 * The role's cell around the skill's cell. `info.index` / `info.seed` choose wrong or right, so
 * the choice is part of the item and survives measurement, pagination and the key.
 */
export function prepare(it, info = {}) {
    const correct = answerOf(it);
    if (!correct) return null;                               // nothing to show in the slot
    const wrong = realWrongOf(it);
    // PT-ERR-1: an item flagged wrong without a real wrong answer is skipped, never shown
    // correct instead (that is how a page ended up with every answer right).
    if (info.wrong && !wrong) return null;
    const isWrong = !!(wrong && info.wrong);
    // A wide picture (a number line, a chart) leaves no room beside it: the judgement goes under it.
    const stack = it.fclass === 'wide' || Number((it.footprint || {}).wMm) > 110;
    const shown = isWrong ? wrong.value : correct;
    const digits = Math.max(2, Math.min(6, correct.replace(/[^0-9]/g, '').length || 2));
    const key = slotKey({ 'ea-ok': isWrong ? '' : '✓', 'ea-fix': isWrong ? '✓' : '', 'ea-ans': isWrong ? correct : '' }, correct);
    const render = (c, o = {}) => {
        const work = it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { shown, prompt: false, shownSlots: isWrong && wrong.slots ? wrong.slots : undefined }));
        // The pupil's writing place: a square box at the size's writing height, as wide as the
        // answer needs (and never less than a comfortable 2-digit box), captioned so it cannot
        // be confused with the finished work's own slot.
        const fixW = Math.max({ S: 26, M: 30, L: 34 }[c.size] || 34, digits * ({ S: 6, M: 7, L: 8 }[c.size] || 8) + 6);
        return `<div class="mq-judge mq-judge2${stack ? ' mq-judge-stack' : ''}">`
            + `<div class="mq-judge-work">${work}</div>`
            + judgeGroup('ea-judge', `${checkLine('ea-ok', JUDGE_LABELS.correct, c, key, { graded: false })}`
                + `<span class="mq-fixrow">${checkLine('ea-fix', JUDGE_LABELS.fixIt, c, key, { graded: false })}`
                + `<span class="mq-ansslot mq-fixslot">${blank({ id: 'ea-ans', kind: 'number', shape: 'box', widthMm: fixW, graded: false }, c, slotOnly(key, 'ea-ans'))}<small>correct answer</small></span></span>`)
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, answerWords: isWrong ? `Fix it: ${correct}` : 'Correct',
        // The judgement column sits beside the work; a word problem or a wide picture keeps its
        // own single column (PT-WPR-1).
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: Math.min(2, (it.footprint && it.footprint.maxCols) || 2) }),
        fclass: it.fclass === 'word' || it.fclass === 'wide' ? it.fclass : 'standard', thinking: { shown, correct, isWrong, basis: wrong ? wrong.basis : '' },
        cellCls: [it.cellCls || '', 'mq-thinkcell'].join(' ').trim(),
    });
}

/**
 * PT-ERR-1 needs something to find: a page with no real wrong answer on it is not an Error
 * analysis page, so the role says why instead of printing a page of correct work (or nothing).
 */
export function supports(items) {
    if (!items.length) {
        return 'This skill has no misconception-based wrong answer (wrongAnswer), or no single answer that can be written in as finished work, so it cannot print as Error analysis yet.';
    }
    if (!items.some((it) => it.thinking && it.thinking.isWrong)) {
        return 'This skill has no misconception-based wrong answer (wrongAnswer) yet, so an Error analysis page would have no mistake to find.';
    }
    return null;
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: 1 });
    const opts = { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) };
    const floor = (input.floors || {}).main;
    // Full-width rows first: the ceiling's worth of rows, each the work and its judgement side by
    // side. When they do not fit, the 2-column grid of the mock-up.
    const one = resolveSectionLayout({
        role: ROLE_ID, columns: 1, count: items.length,
        target: { cols: 1, rows: CEILING }, ceiling: CEILING, floor,
    }, items, ctx.paper, LIVE_W_MM, opts);
    if (one.cols === 1 && one.rows >= CEILING[ctx.size] && !one.clamped) return one;
    return resolveSectionLayout({
        role: ROLE_ID, columns: 'auto', count: items.length,
        target: { cols: 2, rows: { S: 3, M: 2, L: 2 }, rowsByCols: { 1: 4 } }, ceiling: CEILING, floor,
    }, items, ctx.paper, LIVE_W_MM, opts);
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

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, wrongFlags, realWrongOf };
export { esc };
