// js/modules/sheet/roles/fact-rows.js
// FACT ROWS, 5 TO 10 COLUMNS (design/PAGE_TYPES.md 4.1): dense daily fact practice in vertical
// form, 25 to 90 facts a page.
//
//   Who        fact-like skills only (`footprint.factLike`, PT-CMP-2). Any other skill gets
//              `unsupported` with the reason, and the dialog routes it to the Computation grid.
//   Columns    Auto 10 / 6 / 5 (S / M / L, PT-FRW-2); columns drive the digit size along the
//              fact ladder (PT-FRW-1) - the host's fact cell reads the column count
//   Rows       floor((G - 1) / h) with h from table 4.1 (`factRowsCapacity`), never shorter than
//              the measured cell; answers over 99 clamp to 8 columns (PT-FRW-5)
//   Look       Daily by default (PAGE_TYPES appendix 4): hairline interiors, black number tabs
//              ("every fact numbered", PT-FRW-4); tab "Facts"; title the fact stub (HD-13)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, instructionKeyOf, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, opOf, operandsOf, answerOf,
} from './compose.js';
import { factRowsCapacity } from '../layout.js';

export const ROLE_ID = 'fact-rows';
export const DEFAULT_LOOK = 'daily';
const AUTO = { S: 10, M: 6, L: 5 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = (ctx) => [...new Set([5, 6, 8, 10, AUTO[(ctx && ctx.size) || 'L']])];

const FACT_SKILL_RE = /^(add|sub|mult|div)_facts$/;
/** Is this item a vertical fact (PT-CMP-2)? */
export function isFact(it) {
    const q = it.q || {};
    if (it.template === 'fact') return true;
    if (q.__factLike || (it.footprint && it.footprint.factLike)) return true;
    if (FACT_SKILL_RE.test(String(q.skillId || ''))) return true;
    return /-facts-(vertical|horizontal)$/.test(String(q.printFormat || ''));
}

export function supports(items) {
    if (!items.length) return 'no items were generated';
    return items.every(isFact) ? null
        : 'Fact rows need a fact skill (a single-step fact up to 12 x 12). Use the Independent page or the Test for this skill.';
}

/** The fact stub title (HD-13): "Multiply by 3" for one constant, else "Multiplication facts". */
export function factTitle(items) {
    const q0 = (items[0] || {}).q || {};
    const op = opOf(q0);
    const seconds = [...new Set(items.map((it) => operandsOf(it.q || {})[1]).filter((v) => v !== undefined))];
    const one = seconds.length === 1 ? seconds[0] : null;
    if (op === 'add') return one !== null ? `Add ${one}` : 'Addition facts';
    if (op === 'subtract') return one !== null ? `Subtract ${one}` : 'Subtraction facts';
    if (op === 'multiply') return one !== null ? `Multiply by ${one}` : 'Multiplication facts';
    if (op === 'divide') return one !== null ? `Divide by ${one}` : 'Division facts';
    return 'Facts';
}

function layout(items, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Facts', title: factTitle(items), score: 1 });
    const big = items.some((it) => Number(answerOf(it)) > 99);
    let cols = input.columns && input.columns !== 'auto' ? Math.max(5, Math.min(10, Number(input.columns))) : AUTO[ctx.size];
    if (big) cols = Math.min(cols, 8);
    const cap = factRowsCapacity(cols, ctx.size, ctx.paper, layoutHeader(frame.header));
    return resolveSectionLayout({
        role: ROLE_ID, columns: cols, count: items.length,
        target: { cols, rows: cap.rows }, ceiling: 200, maxCols: 10, floor: (input.floors || {}).main,
    }, items.map((it) => Object.assign({}, it, { fclass: 'standard', footprint: Object.assign({}, it.footprint || {}, { maxCols: 10 }) })), ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Facts', title: factTitle(items), score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    // Stretch cap 1.3 (PT-ENG-2): rows do not balloon; the spare height stays at the foot.
    const cellH = Math.min(L.gridH / rows, L.hMin * 1.3);
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1, cls: 'facts' });
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart(instructionKeyOf(items, input.skills)), grid] }], {
        defaultLook: DEFAULT_LOOK,
        meta: { items: items.length, scoreOutOf: items.length, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, supports, counts, plan, isFact, factTitle };
