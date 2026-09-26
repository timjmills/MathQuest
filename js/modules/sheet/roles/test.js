// js/modules/sheet/roles/test.js
// TEST A / B (design/PAGE_TYPES.md 2.9): an end-of-step check that mirrors practice, in parallel
// seeded forms.
//
//   Title      "Test A: <topic>" (HD-13), tab "Test A" / "Test B", Score in the header
//   Grid       one instruction over a ruled grid of the skill's cell, every item boxed: 4 x 4 for facts, equations
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
import { groupByHeight, rowShape, rowGapFor, instructionMm } from '../layout.js';
import { isCheckAnswer } from '../registry.js';
import { INSTRUCTION_LIBRARY } from '../contract.js';

export const ROLE_ID = 'test';
const CEILING = { S: 20, M: 16, L: 12 };
const DENSE = CEILING;          // 12.1 is law: 20 / 16 / 12 (L-DENSITY holds it)

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

function layout(items, input, count) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Test A', title: 'Test A', score: 1 });
    // 12.1: "12; procedures 4" - a long algorithm tests on the 2 x 2 grid of its practice page.
    const long = items.some((it) => it.fclass === 'long');
    // Critic round 2 (C3): a test of one-line facts or equations gets a dense grid of small cells
    // (PT 2.9: 4 x 4 at 57, 4 x 5 at 45.6), its rows chosen from the MEASURED height with a
    // little room (1.05 x the tallest cell, which already holds the pads and the answer zone), up to 20 items and 5 columns. A 4 x 3 grid of 75 mm
    // cells left two thirds of every cell empty.
    const oneLine = items.length && items.every((it) => it.fclass === 'short' || it.template === 'fact' || it.template === 'equation'
        || (it.footprint && it.footprint.factLike));
    if (oneLine && !long) {
        return resolveSectionLayout({
            role: 'test', columns: input.columns || 'auto', count: count || items.length,
            target: { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } },
            ceiling: CEILING, floor: (input.floors || {}).main,
            dense: { S: 20, M: 20, L: 20 }, denseRoom: 1.05, denseMaxCols: 5,
        }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
    }
    return resolveSectionLayout({
        role: 'test', columns: input.columns || 'auto', count: count || items.length,
        target: long ? { cols: 2, rows: { S: 3, M: 2, L: 2 } } : { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } },
        ceiling: long ? { S: 6, M: 4, L: 4 } : CEILING, floor: (input.floors || {}).main,
        // Cells sized to the problems (layout.js dense packing): a test of one-line facts in
        // 57 mm cells left ~70% of every cell empty. Never above 12.1's 20 / 16 / 12.
        dense: long ? false : DENSE,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export function counts(pools, input) {
    const L = layout(pools.main || [], input);
    return { main: input.count ? Math.min(input.count, L.perPage) : L.perPage };
}

/** The check-box twin of an instruction key ("graph" -> "graph-check"), or '' when there is none. */
function checkKeyOf(key) {
    const k = `${String(key || '').replace(/-check$/, '')}-check`;
    return Object.prototype.hasOwnProperty.call(INSTRUCTION_LIBRARY, k) ? k : '';
}
const isChk = (it) => isCheckAnswer((it && it.q) || it);

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    let items = poolItems(input, 'main');
    const L = layout(items, input);
    items = items.slice(0, L.perPage);
    // One answer shape a part (AP2 round 7, critic figures-r8 L10 / RUBRIC C1): a test whose
    // questions mix number boxes with check-box items ("which has the most?") prints the check-box
    // items as their own part, under their own instruction, after the number items. The second
    // instruction line comes off the grid: items are dropped (the larger part first) until both
    // parts fit the page.
    const baseKey = instructionKeyOf(items, input.skills);
    const chkKey = checkKeyOf(baseKey);
    let groups = [items];
    if (chkKey && items.some(isChk) && !items.every(isChk)) {
        const box = items.filter((it) => !isChk(it));
        const chk = items.filter(isChk);
        const avail = (L.gridH || 0) - instructionMm(ctx.size);
        // rows at the problems' own height (the grid's cells are stretched to fill one part)
        const rowMm = L.hMin || L.cellH || 0;
        const need = () => (Math.ceil(box.length / L.cols) + Math.ceil(chk.length / L.cols)) * rowMm;
        while (L.gridH && rowMm && need() > avail + 0.01 && box.length + chk.length > 2) {
            if (box.length >= chk.length && box.length > 1) box.pop();
            else if (chk.length > 1) chk.pop();
            else box.pop();
        }
        groups = [box, chk];
    }
    // PT-TST-1: Form B is Form A re-ordered under (seed, form), within each part.
    if (form === 'B') {
        const r = rng(deriveSeed(input.seed === undefined ? 0 : input.seed, 'test', 'B'));
        groups = groups.map((g) => shuffle(r, g));
    }
    // RUBRIC H13: problems of one height together, so each row is sized for what it holds.
    groups = groups.map((g) => groupByHeight(g, L.cols));
    items = groups.flat();
    const topic = topicOf(((input.skills || [])[0] || {}).iCan || '');
    const frame = frameOf({ skills: input.skills || [], input: Object.assign({}, input, { form }), tabId: `Test ${form}`, title: `Test ${form}: ${topic}`, score: items.length });
    const split = groups.length > 1;
    const totalRows = groups.reduce((a, g) => a + Math.max(1, Math.ceil(g.length / L.cols)), 0);
    // two parts share the grid height under two instruction lines: each row that much shorter
    const cellH = split && L.gridH ? Math.min(L.cellH, Math.floor(((L.gridH - instructionMm(ctx.size)) / totalRows) * 100) / 100) : L.cellH;
    const sections = [];
    let start = 1;
    groups.forEach((g, gi) => {
        const rows = Math.max(1, Math.ceil(g.length / L.cols));
        sections.push(instructionPart(split && gi === 1 ? chkKey : baseKey, g));
        const grid = gridPart(g.map((it) => planItem(it, { cols: L.cols, level: 0 })), {
            // Every item in its own boxed cell (the 04-G "open array" drew the outer frame only,
            // and the items floated in one big box: 2026-09-25 re-grade, C3/C4).
            cols: L.cols, rows, cellH, labels: labelStyleOf(ctx.look, input.labels), start,
        });
        start += g.length;
        // Rows sized to what they hold (H13); else the layout's grid height is the page's (one
        // instruction) and a lone full grid fills by flex.
        const shape = rowShape(g, L.cols, rows, cellH);
        if (shape) { grid.rowsTpl = shape.rowsTpl; grid.height = `${shape.heightMm}mm`; }
        else if (!split && rows === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
        // A Test's count is fixed (12.1): spare page height goes between the rows, not into them.
        // Two parts share the page's grid height by their rows.
        if (grid.height) {
            const availMm = split ? ((L.gridH || 0) - instructionMm(ctx.size)) * rows / totalRows : L.gridH;
            const gp = rowGapFor(rows, parseFloat(grid.height), availMm);
            if (gp.gap) { grid.rowGap = gp.gap; grid.height = `${gp.heightMm}mm`; }
        }
        sections.push(grid);
    });
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }], {
        scaffoldLevel: 0,
        meta: { items: items.length, scoreOutOf: items.length, form, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
