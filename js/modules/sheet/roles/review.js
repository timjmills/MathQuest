// js/modules/sheet/roles/review.js
// REVIEW (design/PAGE_TYPES.md 2.8): rehearse the test - the lesson cells again, in teaching
// order, with 25 to 35% earlier items.
//
//   Title      "Review: <topic>" (HD-13), tab "Review n", Score in the header
//   Sections   the skill's band (strip = its instruction), then "Mixed Review:" with the earlier
//              step's items (the skill before it in its category, when there is one). Both bands
//              use ONE cell height and column count, so the page reads as one set.
//   Counts     whole rows; earlier rows about a third (PT-REV-3); ceiling 16 / 12 / 12 per page
//   Supports   level 1 (PT-REV-2): no steps, no models, no traces; letters from a. (PT-LBL-7)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, topicOf, labelStyleOf,
} from './compose.js';

export const ROLE_ID = 'review';
const CEILING = { S: 16, M: 12, L: 12 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills, { earlier }) => {
    const out = [{ id: 'main', skills }];
    const prev = skills.length === 1 ? earlier(skills[0], 1) : [];
    if (prev.length) out.push({ id: 'earlier', skills: prev });
    return out;
};
export const measureCols = () => [1, 2, 3, 4];

function geometry(pools, input) {
    const ctx = ctxOf(input);
    const main = pools.main || [];
    const earlier = pools.earlier || [];
    const all = main.concat(earlier);
    const cols = bestCols(all, [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]), ctx);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Review 1', title: 'Review', score: 1 });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const bands = earlier.length ? 2 : 1;
    const avail = m.body - 2 - bands * m.strip;
    const h = hMinAt(all, cols, ctx);
    let rows = Math.max(1, Math.min(Math.floor(CEILING[ctx.size] / cols), Math.floor(avail / Math.max(1, h))));
    let eRows = bands === 2 && rows >= 2 ? Math.max(1, Math.round(rows / 3)) : 0;
    if (bands === 2 && rows < 2) eRows = 0;
    return { cols, rows, eRows, mRows: rows - eRows, avail, h, ctx };
}

export function counts(pools, input) {
    const g = geometry(pools, input);
    return { main: g.mRows * g.cols, earlier: g.eRows * g.cols };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const main = poolItems(input, 'main');
    const earlier = poolItems(input, 'earlier');
    const g = geometry({ main, earlier }, input);
    const mainSkills = (input.skills || []).filter((s) => main.some((it) => it.q && it.q.skillId === s.skillId));
    const topic = topicOf(((mainSkills[0] || (input.skills || [])[0]) || {}).iCan || '');
    const useM = main.slice(0, g.mRows * g.cols);
    const useE = g.eRows ? earlier.slice(0, g.eRows * g.cols) : [];
    const n = useM.length + useE.length;
    const n0 = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: mainSkills.length ? mainSkills : input.skills || [], input, tabId: `Review ${n0}`, title: `Review: ${topic}`, score: n });
    const rowsM = Math.ceil(useM.length / g.cols);
    const rowsE = Math.ceil(useE.length / g.cols);
    const cellH = g.avail / Math.max(1, rowsM + rowsE);
    const labels = labelStyleOf(ctx.look, input.labels);
    const sections = [{ kind: 'band', label: '', instr: instructionText(instructionKeyOf(useM, input.skills)),
        content: gridPart(useM.map((it) => planItem(it, { cols: g.cols })), { cols: g.cols, rows: rowsM, cellH, labels, start: 1 }) }];
    if (useE.length) {
        sections.push({ kind: 'band', label: 'Mixed Review:', instr: instructionText(instructionKeyOf(useE, input.skills)),
            content: gridPart(useE.map((it) => planItem(it, { cols: g.cols })), { cols: g.cols, rows: rowsE, cellH, labels, start: useM.length + 1 }) });
    }
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: n, scoreOutOf: n, earlierShare: n ? useE.length / n : 0,
            fits: [{ cols: g.cols, rows: rowsM + rowsE, cellH, line: `Fits: ${g.cols} columns x ${rowsM + rowsE} rows, ${n} per page.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
