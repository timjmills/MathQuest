// js/modules/sheet/roles/guided.js
// THE GUIDED PAGE (design/PAGE_TYPES.md 2.3): "we do" with many repetitions while the steps stay
// in view.
//
//   Steps band     the step list in two text columns (PT-GDP-2), outlined circle markers (BD-4)
//   Guided band    "Guided Practice:" + the skill's instruction, then rows of the skill's cell
//   Fade           cell 1 is level 3 (answer traced in grey), the rest of row 1 level 2, every
//                  later row level 1 (PT-GDP-1). Structural supports never drop.
//   Labels, Score  none: Guided cells are unlabelled and unscored (PT-LBL-6, PT-FRM-4)
//   Capacity       columns Auto 4 / 3 / 3 (S / M / L, clamped by fit), rows while they fit, never
//                  above the ceiling 8 / 6 / 6 cells (WORKSHEET_DESIGN_STANDARD 12.1)
//
// The key renders from the same plan: every cell answered, the traced first cell included.
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, generalSteps, stepsHtml, assemble, poolItems, answerOf,
} from './compose.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'guided';
const CEILING = { S: 8, M: 6, L: 6 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

export function counts(pools, input) {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    const cols = bestCols(items, [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]), ctx);
    const { rows } = fitRows(items, cols, ctx, input);
    return { main: Math.min(CEILING[ctx.size], rows * cols) };
}

function stepsBlock(items) {
    const list = items.length ? generalSteps(items[0]).slice(0, 6) : [];
    return list;
}

/** Rows that fit under the Steps band (PT-GDP-3 teacher strip off). */
function fitRows(items, cols, ctx, input) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const steps = stepsBlock(items);
    const stepsH = m.strip + Math.ceil(steps.length / 2) * (m.pitch + 2.2) + 4;
    const avail = m.budget - stepsH - m.strip;
    const h = hMinAt(items, cols, ctx);
    const rows = Math.max(1, Math.min(Math.floor(CEILING[ctx.size] / cols), Math.floor(avail / Math.max(1, h))));
    return { rows, h, avail, stepsH, steps };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const items = poolItems(input, 'main');
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: 0 });
    const colsWanted = AUTO_COLS[ctx.size];
    const cols = bestCols(items, [colsWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= colsWanted), ctx);
    const fit = fitRows(items, cols, ctx, input);
    const use = items.slice(0, Math.min(items.length, fit.rows * cols));
    const rows = Math.max(1, Math.ceil(use.length / cols));
    // Spare height goes to the answer zones, but a Guided row gains at most 8 mm (PT-ENG-3).
    const cellH = Math.min(fit.avail / rows, fit.h + 8);
    const key = instructionKeyOf(use, input.skills);
    const planItems = use.map((it, i) => {
        // PT-GDP-1: cell 1 is level 3 - the answer written in trace grey, in both states.
        if (i === 0 && answerOf(it)) {
            return planItem(it, { cols, level: 3, nolabel: true, render: (c, o) => it.render(c, Object.assign({}, o, c.state === 'blank' ? { shown: answerOf(it), ink: 'trace' } : {})) });
        }
        return planItem(it, { cols, level: i < cols ? 2 : 1, nolabel: true });
    });
    const sections = [
        { kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepsband">${stepsHtml(fit.steps, { cls: 'mq-steps2' })}</div>` },
        { kind: 'band', label: 'Guided Practice:', instr: instructionText(key), content: gridPart(planItems, { cols, rows, cellH, labels: 'none' }) },
    ];
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: use.length, scoreOutOf: 0, fits: [{ cols, rows, cellH, line: `Fits: ${cols} columns x ${rows} rows, ${use.length} guided cells.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
