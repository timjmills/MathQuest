// js/modules/sheet/roles/test.js
// TEST A / B (design/PAGE_TYPES.md 2.9): an end-of-step check that mirrors practice, in parallel
// seeded forms.
//
//   Title      "Test A: <topic>" (HD-13), tab "Test A" / "Test B", Score in the header
//   Grid       one instruction over a ruled grid of the skill's cell: 4 x 4 for facts, equations
//              and 2- or 3-digit stacks, 3 columns when 4 do not fit, 2 x 2 for long algorithms;
//              ceiling 20 / 16 / 12 (S / M / L); a teacher count is honoured up to the page
//   Forms      Form B holds Form A's items in a seeded re-order (PT-TST-1), so both forms are
//              generated under the same seed and only the order changes
//   Supports   level 0 (PT-TST-2): no hints; structural supports stay (the cell's own)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, instructionKeyOf, assemble,
    poolItems, topicOf, labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, rng, shuffle, deriveSeed,
} from './compose.js';

export const ROLE_ID = 'test';
const CEILING = { S: 20, M: 16, L: 12 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

function layout(items, input, count) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Test A', title: 'Test A', score: 1 });
    return resolveSectionLayout({
        role: 'test', columns: input.columns || 'auto', count: count || items.length,
        target: { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } },
        ceiling: CEILING, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export function counts(pools, input) {
    const L = layout(pools.main || [], input);
    return { main: input.count ? Math.min(input.count, L.perPage) : L.perPage };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    let items = poolItems(input, 'main');
    const L = layout(items, input);
    items = items.slice(0, L.perPage);
    // PT-TST-1: Form B is Form A re-ordered under (seed, form).
    if (form === 'B') items = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, 'test', 'B')), items);
    const topic = topicOf(((input.skills || [])[0] || {}).iCan || '');
    const frame = frameOf({ skills: input.skills || [], input: Object.assign({}, input, { form }), tabId: `Test ${form}`, title: `Test ${form}: ${topic}`, score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const instr = instructionPart(instructionKeyOf(items, input.skills));
    const sections = [
        instr,
        gridPart(items.map((it) => planItem(it, { cols: L.cols, level: 0 })), {
            cols: L.cols, rows, cellH: rows === L.rows ? L.cellH : L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1,
        }),
    ];
    // The layout's grid height is the page's (one instruction); a lone full grid fills by flex.
    if (rows === L.rows) { sections[1].cls = ''; sections[1].height = ''; }
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }], {
        scaffoldLevel: 0,
        meta: { items: items.length, scoreOutOf: items.length, form, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
