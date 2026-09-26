// Unit tests for the page engine: js/modules/sheet/layout.js, paginate.js, the two practice
// roles (roles/independent.js, roles/more-practice.js) and the P7.2b roles of roles/index.js
// (opener, scripted model, guided, error analysis, review, test, pre-skill check, word problems,
// fact rows, fact probe, mixed practice, True or False?, Reason It, Stretch), each driven through
// the host protocol of roles/compose.js exactly as print-sheet.js drives it. Pure node.
//
//   node tests/scripts/ws-layout-unit.mjs
//
// What is held here (DN-20: "its unit tests assert every figure in 12.3"):
//   - page geometry: body and gridH per paper and header (PG-2, HD-8.3, HD-12, HD-14, HD-20)
//   - WORKSHEET_DESIGN_STANDARD.md 12.3: fact rows, stacked-arithmetic maximum columns, stacked
//     rows and items, the visual-grid rows the formula reproduces (PAGE_TYPES 3.4)
//   - PAGE_TYPES 2.4: the Independent grids for every footprint class, and the 12.1 ceilings
//   - DN-13 / DN-15: Auto and explicit columns, clamps, "never 1 when 2 fit"
//   - PG-23: the short-last-page rebalance (20 at 6 a page is 6 / 6 / 4 / 4, never 6 / 6 / 6 / 2)
//   - CL-12 / CL-13 / PT-LBL-7: label run-on, the z. restart, the More Practice restart
//   - PT-FRM-4: Score denominators; AK-1: the key has the pupil page's cells, page for page
//
// Prints `ws-layout-unit: OK` or `ws-layout-unit: FAIL (n)` and exits non-zero on failure,
// in the convention of ws-boot-smoke / ws-content-audit.

import {
    gridHeightMm, bodyHeightMm, headerHeightMm, FULL_HEADER, factRowsCapacity, stackMaxColumns,
    stackCapacity, visualGridCapacity, resolveSectionLayout, cellWidthMm, paperOf, autoFitsAt,
} from '../../js/modules/sheet/layout.js';
import { groupRuns } from '../../js/modules/sheet/cells/k2kit.js';
import { paginate, labelStarts, scoreDenominator, placeSections } from '../../js/modules/sheet/paginate.js';
import { plan as independentPlan } from '../../js/modules/sheet/roles/independent.js';
import { plan as morePracticePlan, letterSeed } from '../../js/modules/sheet/roles/more-practice.js';
import {
    renderPlan, sectionInstructionKey, instructionHtml, levelLine, estimateTitleLines,
} from '../../js/modules/sheet/roles/practice.js';
import { ROLE_IDS, ROLE_MODULES, ROLE_ALIASES } from '../../js/modules/sheet/roles/index.js';
import { renderCell, cellAnswerKey, cellFootprint, resolveCtx, getProvider } from '../../js/modules/sheet/index.js';
import { stack, regroupWorking } from '../../js/modules/sheet/cells/stack.js';
import * as LR from '../../js/modules/sheet/lesson-rules.js';
import { SLOT, SIZES as KIT_SIZES, slotRadiusMm, stripSegStyle, stripPos, atLeastSize } from '../../js/modules/sheet/tokens.js';

let pass = 0;
const fails = [];
const eq = (got, want, what) => {
    const g = JSON.stringify(got);
    const w = JSON.stringify(want);
    if (g === w) pass++;
    else fails.push(`${what}: expected ${w}, got ${g}`);
};
const ok = (cond, what) => { if (cond) pass++; else fails.push(what); };
const near = (got, want, what, tol = 0.05) => ok(Math.abs(got - want) <= tol, `${what}: expected ${want}, got ${got}`);
const SIZES = ['S', 'M', 'L'];

/* ======================================================================= page geometry */

eq(SIZES.map((s) => gridHeightMm('A4', s, FULL_HEADER)), [228, 228, 227], 'PG-2: gridH A4, full header, S/M/L');
near(bodyHeightMm('A4', FULL_HEADER), 236, 'PG-2: body A4 full header');
near(bodyHeightMm('A4', FULL_HEADER, { cont: true }), 250, 'PT-FRM-2: body on a continuation page');
near(bodyHeightMm('Letter', FULL_HEADER), 218.4, 'PG-2: body Letter, full header');
eq(paperOf('Letter').id, 'letter', 'paper id');
// HD-8.3 as the kit draws it: tab/title on-off.
eq([
    headerHeightMm({ tab: ['a'], title: 't' }),
    headerHeightMm({ tab: ['a'], title: '' }),
    headerHeightMm({ tab: false, title: 't' }),
    headerHeightMm({ tab: false, title: '' }),
    headerHeightMm({}, { cont: true }),
], [26, 17, 23, 14, 12], 'HD-8.3 / HD-20: header heights');
// HD-14: a wrapped title takes 6 mm from the body.
near(gridHeightMm('A4', 'L', { tab: ['a'], title: 't', titleLines: 2 }), 221, 'HD-14: a two-line title');
// HD-12: freed header height goes to the body.
near(gridHeightMm('A4', 'L', { tab: false, title: 't' }), 230, 'HD-12: tab off gives 3 mm to the body');
eq(estimateTitleLines('I Can subtract three-digit numbers with regrouping', 'L'), 1, 'HD-14 estimate: a 50-character title is one line at L');
eq(estimateTitleLines('I Can add and subtract fractions with unlike denominators using models', 'L'), 2, 'HD-14 estimate: a 70-character title wraps at L');
// PG-1: widths.
eq(cellWidthMm(2).nominal, 93, 'PG-1: 2 columns are 93 mm');
near(cellWidthMm(3).nominal, 62, 'PG-1: 3 columns are 62 mm');

/* =============================================================== 12.3 fact rows (vertical) */

const FACT_ROWS = { 5: [6, 6, 5], 6: [6, 6, 6], 7: [7, 7, 6], 8: [8, 8, 7], 9: [9, 8, 8], 10: [9, 8, 8] };
const FACT_PER_PAGE = { 5: [30, 30, 25], 6: [36, 36, 36], 7: [49, 49, 42], 8: [64, 64, 56], 9: [81, 72, 72], 10: [90, 80, 80] };
for (const cols of [5, 6, 7, 8, 9, 10]) {
    eq(SIZES.map((s) => factRowsCapacity(cols, s).rows), FACT_ROWS[cols], `12.3 fact rows, ${cols} columns, rows S/M/L`);
    eq(SIZES.map((s) => factRowsCapacity(cols, s).perPage), FACT_PER_PAGE[cols], `12.3 fact rows, ${cols} columns, facts per page S/M/L`);
}
eq([5, 6, 7, 8, 9, 10].map((c) => factRowsCapacity(c, 'L').digitPt), [28, 24, 20, 18, 16, 16], 'TY-30: the fact ladder');

/* ===================================================== 12.3 stacked arithmetic: max columns */

const STACK_MAX = {
    //   I Can S/M/L    Daily S/M/L
    3: [[6, 6, 5], [6, 5, 4]],
    4: [[6, 5, 4], [6, 4, 3]],
    5: [[6, 4, 3], [5, 3, 3]],
    6: [[5, 4, 3], [4, 3, 2]],
    7: [[5, 3, 2], [4, 2, 2]],
    8: [[4, 3, 2], [3, 2, 2]],
};
for (const [T, [ican, daily]] of Object.entries(STACK_MAX)) {
    eq(SIZES.map((s) => stackMaxColumns(Number(T), s, 'ican')), ican, `12.3 stacked max columns, T=${T}, I Can S/M/L`);
    eq(SIZES.map((s) => stackMaxColumns(Number(T), s, 'daily')), daily, `12.3 stacked max columns, T=${T}, Daily S/M/L`);
    // "With any regroup scaffold, use the Daily columns of this table for both looks (TY-21)."
    eq(SIZES.map((s) => stackMaxColumns(Number(T), s, 'ican', { regroup: true })), daily, `TY-21: regroup uses the Daily columns, T=${T}`);
}

/* ================================================ 12.3 stacked arithmetic: rows and items */

const STACK_ROWS = {
    1: { rows: [4, 4, 4], h: 57, items: [4, 4, 4] },
    2: { rows: [3, 3, 3], h: 76, items: [6, 6, 6] },
    3: { rows: [3, 3, 3], h: 76, items: [9, 9, 9] },
    4: { rows: [4, 4, 4], h: 57, items: [16, 16, 16] },
    5: { rows: [5, 5, 4], items: [25, 25, 20] },
    6: { rows: [6, 5, null], items: [36, 30, null] },
};
for (const [cols, want] of Object.entries(STACK_ROWS)) {
    const got = SIZES.map((s) => stackCapacity(Number(cols), s, 'ican'));
    eq(got.map((g) => (g ? g.rows : null)), want.rows, `12.3 stacked rows, ${cols} columns, S/M/L`);
    eq(got.map((g) => (g ? g.items : null)), want.items, `12.3 stacked items, ${cols} columns, S/M/L`);
    if (want.h) near(got[0].cellH, want.h, `12.3 stacked cell height, ${cols} columns, S`, 0.01);
}
near(stackCapacity(5, 'S', 'ican').cellH, 45.6, '12.3 stacked cell height, 5 columns, S', 0.01);
near(stackCapacity(5, 'L', 'ican').cellH, 56.75, '12.3 stacked cell height, 5 columns, L (57)', 0.01);
near(stackCapacity(6, 'S', 'ican').cellH, 38, '12.3 stacked cell height, 6 columns, S', 0.01);

/* =========================================================== PAGE_TYPES 3.4 visual grids */

const VISUAL = {
    'clock-read': [16, 9, 9], 'clock-draw': [9, 9, 9], 'ten-frame': [16, 12, 12],
    'array-5': [16, 12, 9], 'base10-99': [16, 12, 9], 'shape-name': [20, 12, 9],
};
for (const [v, want] of Object.entries(VISUAL)) eq(SIZES.map((s) => visualGridCapacity(v, s).perPage), want, `12.3 / PT 3.4 visual grid ${v}, per page S/M/L`);

/* ============================================== PAGE_TYPES 2.4: the Independent page grids */

const stackItem = (T = 3, extra = {}) => ({ footprint: Object.assign({ wMm: Math.ceil(T * 7.11 + 6), hMm: 37, measure: false, factLike: false, maxCols: 3, tracks: T }, extra) });
const plainItem = (hMm, extra = {}) => ({ footprint: Object.assign({ wMm: 60, hMm, measure: false, factLike: false, maxCols: 6 }, extra) });
const run = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const L = (items, columns = 'auto', size = 'L', extra = {}) => resolveSectionLayout(Object.assign({ role: 'independent', columns, count: items.length }, extra), items, 'A4', 186, { size, look: 'ican', header: FULL_HEADER });

// Stack, short computation, medium visual: 2 x 3, cells 93 x 76 (S, M) / 93 x 75.67 (L).
for (const s of SIZES) {
    const lay = L(run(6, () => stackItem(3)), 'auto', s);
    eq([lay.cols, lay.rows, lay.perPage], [2, 3, 6], `PT 2.4 standard grid at ${s}`);
    near(lay.cellH, s === 'L' ? 75.667 : 76, `PT 2.4 standard cell height at ${s}`, 0.01);
    eq(lay.cellW, 93, `PT 2.4 standard cell width at ${s}`);
}
// RUBRIC H13: a row held back by a ceiling is never stretched past FILL_CAP x its content, and
// the grid then does not fill by flex (the spare height stays under the grid).
{
    const lay = L(run(12, () => plainItem(12)), 'auto', 'L', { role: 'test', ceiling: 12, target: { cols: 3, rows: 4 } });
    ok(lay.cellH <= lay.hMin * 1.8 + 0.01 && lay.fill === false, `H13: 12 short items capped at 1.8 x hMin (cellH ${lay.cellH}, hMin ${lay.hMin}, fill ${lay.fill})`);
}
// RUBRIC H13: mixed heights - tall problems grouped first, rows sized to what they hold.
{
    const { groupByHeight, rowShape } = await import('../../js/modules/sheet/layout.js');
    const mk = (h, id) => ({ id, measured: { 2: { hMm: h, fits: true } } });
    const its = [mk(18, 'a'), mk(78, 'b'), mk(18, 'c'), mk(78, 'd'), mk(18, 'e'), mk(18, 'f')];
    const g = groupByHeight(its, 2);
    eq(g.map((x) => x.id).join(''), 'bdacef', 'H13: tallest first, order kept within each height');
    const sh = rowShape(g, 2, 3, 75);
    ok(sh && (() => { const f = sh.rowsTpl.split(' ').map(parseFloat); return f.length === 3 && f[0] >= 79 && f[1] >= 19 && f[1] <= 19 * 1.8 + 0.1 && f[0] > 2 * f[1]; })() && sh.heightMm <= 3 * 75 + 0.01, `H13: rows weighted by what they hold (${sh && sh.rowsTpl}, ${sh && sh.heightMm} mm)`);
    eq(rowShape([mk(40), mk(40), mk(40), mk(40)], 2, 2, 60), null, 'H13: equal rows are left as they were');
}
// Page fill (owner 2026-09-25): an Independent page of SHORT problems takes more rows instead of
// leaving an empty strip, up to DN-1's 20; a column stack keeps 12.1's grid.
{
    const lay = L(run(20, () => plainItem(14)), 'auto', 'L');
    ok(lay.perPage > 6 && lay.perPage <= 20 && lay.rows * Math.min(lay.cellH, lay.hMin * 1.8) >= 0.6 * lay.gridH, `page fill: short problems fill the page (${lay.cols} x ${lay.rows}, cellH ${lay.cellH}, hMin ${lay.hMin})`);
    const st = L(run(9, () => stackItem(3)), 'auto', 'L');
    ok(st.perPage <= 6, `page fill: column stacks keep the 12.1 grid (${st.perPage})`);
}
// Long algorithm: 2 x 2, 93 x 114 / 113.5.
{
    const lay = L(run(4, () => plainItem(40, {})).map((it) => Object.assign(it, { fclass: 'long' })));
    eq([lay.cols, lay.rows, lay.perPage], [2, 2, 4], 'PT 2.4 long procedures: 2 x 2');
    near(lay.cellH, 113.5, 'PT 2.4 long procedures: cell 113.5 at L', 0.01);
}
// One-symbol answers: 2 x 8 at S (28.5), 2 x 5 at M (45.6), 2 x 4 at L (the approved mock-up).
{
    const short = (h) => run(16, () => Object.assign(plainItem(h), { fclass: 'short' }));
    const s = L(short(20), 'auto', 'S');
    const m = L(short(20), 'auto', 'M');
    const l = L(short(20), 'auto', 'L');
    eq([s.cols, s.rows, s.perPage], [2, 8, 16], 'PT 2.4 one-symbol answers at S: 2 x 8');
    near(s.cellH, 28.5, 'PT 2.4 one-symbol cell at S', 0.01);
    eq([m.cols, m.rows, m.perPage], [2, 5, 10], 'PT 2.4 one-symbol answers at M: 2 x 5');
    near(m.cellH, 45.6, 'PT 2.4 one-symbol cell at M', 0.01);
    eq([l.cols, l.rows, l.perPage], [2, 4, 8], 'PT 2.4 one-symbol answers at L: 2 x 4 (05 Practice A)');
    // A taller one-symbol cell drops to the next permitted shape, never to 2 x 7 (CL-2).
    const tall = L(short(35), 'auto', 'S');
    eq([tall.rows, tall.perPage], [5, 10], 'CL-2: one-symbol rows snap to a permitted grid');
}
// Wide visual rows: 1 column x 5 / 4 / 3 (12.1 ceilings).
eq(SIZES.map((s) => { const lay = L(run(5, () => Object.assign(plainItem(30), { fclass: 'wide' })), 'auto', s); return [lay.cols, lay.rows]; }),
    [[1, 5], [1, 4], [1, 3]], 'PT 2.4 / 12.1 wide-visual rows S/M/L');
// Word problems: 1 column; 4 / 3 / 3 rows; fewer when a problem is taller (v2: two a page).
eq(SIZES.map((s) => L(run(4, () => plainItem(40, { size: 'spacious' })), 'auto', s).rows), [4, 3, 3], 'PT 3.7 word-problem rows S/M/L');
eq(L(run(4, () => plainItem(100, { size: 'spacious' }))).rows, 2, 'PT 3.7: tall word problems print two a page');
// PG-11 with a tall stack: hMin = 57 still gives 3 rows at L (PT 2.4 check).
eq(L(run(6, () => stackItem(3, { hMm: 45 }))).rows, 3, 'PT 2.4: a regrouping stack (hMin 57) keeps 2 x 3 at L');

/* ================================================================ 12.1 ceilings, DN-13/15 */

// Explicit 3 columns: the PT-IND-1 target is 3 x 3 = 9, the ceiling is 6 -> 3 x 2.
{
    const lay = L(run(9, () => stackItem(3)), 3, 'S');
    eq([lay.cols, lay.rows, lay.perPage], [3, 2, 6], '12.1: an explicit 3 columns never exceeds the ceiling of 6');
}
// DN-15: Auto returns 2 when 2 fit (never 1).
eq(L(run(6, () => plainItem(30))).cols, 2, 'DN-15: Auto is 2 on an Independent page when 2 fit');
// DN-15: Auto is 1 when an item cannot go in two columns (measured overflow, or its own cap).
eq(L(run(6, () => Object.assign(plainItem(30), { measured: { 1: { hMm: 40, fits: true }, 2: { hMm: 40, fits: false } } }))).cols, 1, 'DN-15: Auto is 1 when 2 columns overflow');
eq(L(run(6, () => plainItem(30, { maxCols: 1 }))).cols, 1, 'DN-15: Auto honours an item cap of 1');
// DN-15: Auto keeps 92% fill and 6 mm slack on stacked work.
{
    const wide = stackItem(12, { wMm: 90, maxCols: 6 });
    eq(L([wide]).cols, 1, 'DN-15: a stack filling more than 92% of a 93 mm column is not put in 2 by Auto');
}
// DN-13: an explicit N that fits is honoured; one that does not clamps, and the request is kept.
{
    const a = L(run(8, () => stackItem(3, { maxCols: 6 })), 4, 'S');
    eq([a.cols, a.clamped], [4, false], 'DN-13: explicit 4 columns honoured for 2-digit stacks at S');
    const b = L(run(8, () => stackItem(8, { wMm: 70, maxCols: 6 })), 4, 'L');
    eq([b.cols, b.clamped, b.requested], [2, true, 4], 'DN-13: explicit 4 clamps to 2 for T=8 at L; the request is kept');
    ok(/max 2 columns/.test(b.reason), 'DN-14: the clamp says why');
}
// PT-ENG-9: a measured floor keeps the capacity a property of the skill.
{
    const items = run(6, () => Object.assign(plainItem(30), { measured: { 1: { hMm: 40, fits: true }, 2: { hMm: 40, fits: true } } }));
    const lay = L(items, 'auto', 'L', { floor: { 1: { hMm: 80, fits: true }, 2: { hMm: 80, fits: true } } });
    eq([lay.rows, lay.perPage], [2, 4], 'PT-ENG-9: the section floor decides the rows');
    // The floor's AUTO fit (autoFitsAt, folded in by print-sheet.js): items that would take 2
    // columns under Auto stay in 1 when a probed item of the skill failed Auto at 2, so the kept
    // items are laid out exactly as the count was dealt (no blank run after the last item).
    const two = L(items, 'auto', 'L', { floor: { 1: { hMm: 40, fits: true, autoFits: true }, 2: { hMm: 40, fits: true, autoFits: false } } });
    eq(two.cols, 1, 'PT-ENG-9: Auto honours the floor\'s Auto fit');
    const expl = L(items, 2, 'L', { floor: { 1: { hMm: 40, fits: true, autoFits: true }, 2: { hMm: 40, fits: true, autoFits: false } } });
    eq(expl.cols, 2, 'DN-13: an explicit column count ignores the Auto margins of the floor');
    eq(autoFitsAt(stackItem(12, { wMm: 90, maxCols: 6 }), 2, { size: 'L', look: 'ican' }), false, 'autoFitsAt: a 90 mm stack is not Auto at 2');
    eq(autoFitsAt(plainItem(30), 2, { size: 'L', look: 'ican' }), true, 'autoFitsAt: a 60 mm plain item is Auto at 2');
}

/* ============================================================== PG-23: rebalancing */

const counts = (n, lay = { cols: 2, rows: 3 }) => paginate(n, lay).map((p) => p.count);
eq(counts(20), [6, 6, 4, 4], 'PG-23: 20 at 6 a page is 6 / 6 / 4 / 4, never 6 / 6 / 6 / 2');
eq(counts(7), [4, 3], 'PG-23: 7 at 6 a page is 4 / 3, never 6 / 1');
eq(counts(13), [6, 4, 3], 'PG-23: 13 at 6 a page is 6 / 4 / 3');
eq(counts(12), [6, 6], 'PG-23: full pages are left alone');
eq(counts(10), [6, 4], 'PG-23: a last page with two thirds is left alone');
eq(counts(5), [5], 'a short single page keeps its rows (PG-15 blank area)');
eq(paginate(20, { cols: 2, rows: 3 }).map((p) => p.rows), [3, 3, 2, 2], 'PG-23: rows, not items, are spread');
eq(counts(9, { cols: 1, rows: 4 }), [3, 3, 3], 'PG-23: 1 column, 9 at 4 a page spreads to 3 / 3 / 3');
eq(counts(11, { cols: 2, rows: 5 }), [6, 5], 'PG-23: 11 at 10 a page is 6 / 5, never 10 / 1');
eq(counts(22, { cols: 2, rows: 5 }), [8, 8, 6], 'PG-23: 22 at 10 a page is 8 / 8 / 6, never 10 / 10 / 2');
ok(paginate(20, { cols: 2, rows: 3 }).every((p, i, a) => i === 0 || p.from === a[i - 1].from + a[i - 1].count), 'PG-21: no item is lost or repeated');

/* ============================================================ labels, Score, placement */

eq(labelStarts([6, 6, 4, 4]).starts, [1, 7, 13, 17], 'CL-12: letters run on across the pages of a sheet');
{
    const r = labelStarts([6, 6, 6, 6, 6]);
    eq(r.starts, [1, 7, 13, 19, 1], 'CL-13: a run never passes z. - it restarts at a. at the page boundary');
    ok(r.notes.length === 1, 'CL-13: the restart is reported to the dialog');
}
eq(labelStarts([6, 6, 6, 6, 6], { style: 'tab' }).starts, [1, 7, 13, 19, 25], 'CL-33: Daily tabs number 1 to N across the sheet');
eq(labelStarts([6, 6], { restartEachPage: true }).starts, [1, 1], 'PT-LBL-7: pages handed out alone restart at a.');
eq(scoreDenominator([6, 6, 4, 4]), 20, 'PT-FRM-4: Score = every scored cell on the sheet');
{
    // Two sections: the second joins the first page only when its instruction and rows fit.
    const lay = { cellH: 75.667, rows: 3 };
    const pages = placeSections([
        { layout: lay, chunks: [{ from: 0, count: 2, rows: 1 }], instrMm: 9 },
        { layout: lay, chunks: [{ from: 0, count: 2, rows: 1 }], instrMm: 9 },
    ], { bodyFirstMm: 236, bodyContMm: 250 });
    eq(pages.map((p) => p.parts.map((x) => x.section)), [[0, 1]], 'PG-21: a short section and the next share a page when both fit');
    const pages3 = placeSections([
        { layout: lay, chunks: [{ from: 0, count: 2, rows: 1 }], instrMm: 9 },
        { layout: lay, chunks: [{ from: 0, count: 4, rows: 2 }], instrMm: 9 },
    ], { bodyFirstMm: 236, bodyContMm: 250 });
    eq(pages3.map((p) => p.parts.map((x) => x.section)), [[0], [1]], 'PG-12: 84.7 + 160.3 mm does not fit 236 - 1 mm, so the second section moves on');
    const pages2 = placeSections([
        { layout: lay, chunks: [{ from: 0, count: 6, rows: 3 }], instrMm: 9 },
        { layout: lay, chunks: [{ from: 0, count: 2, rows: 1 }], instrMm: 9 },
    ], { bodyFirstMm: 236, bodyContMm: 250 });
    eq(pages2.map((p) => [p.cont, p.parts.length]), [[false, 1], [true, 1]], 'PG-21: a section that does not fit starts the next page (a continuation page)');
}

/* ===================================================================== the two roles */

const stackQ = (a, b, op = '+') => ({
    categoryId: 'addition', skillId: 'add_1k_regroup', skillLabel: 'Add within 1,000', answerType: 'number',
    text: `${a} ${op} ${b} = ?`, ans: op === '+' ? a + b : a - b, a, b, op,
    cell: { template: 'stack', v: 1, payload: { operands: [a, b], op } },
});
const stackRun = (n) => run(n, (i) => ({ q: stackQ(111 + i * 7, 222 + i * 3) }));
const SKILL = [{ categoryId: 'addition', skillId: 'add_1k_regroup', label: 'Add within 1,000 (With Regrouping)', grade: 3, instructionKey: 'add', ccss: '3.NBT.A.2' }];

eq(ROLE_IDS.includes('independent') && ROLE_IDS.includes('more-practice'), true, 'roles/index.js registers both roles');

{
    const p = independentPlan({ items: stackRun(20), skills: SKILL, seed: 42, form: 'A', lesson: 5 });
    eq(p.meta.scoreOutOf, 20, 'PT-FRM-4: Independent Score /20 across four pages');
    eq(p.pages.length, 4, 'Independent: 20 items on 4 pages');
    eq(p.header.score, 20, 'HD-2: the header Score carries its denominator');
    eq(p.header.tab, ['Level 3', 'Addition', 'Lesson 5'], 'PT-FRM-5 / PT-FRM-9: the strand tab of an Independent page');
    eq(p.header.title, 'I Can add within 1,000 (with regrouping)', 'PT-FRM-6: the title is the skill\'s I Can line');
    ok(!/Grade/.test(JSON.stringify(p.header)), 'HD-6: no Grade in the tab or title');
    ok(/Grade 3/.test(p.footer.left) && /3\.NBT\.A\.2/.test(p.footer.left), 'HD-30: grade and CCSS in the teacher footer');
    eq(p.footer.right, 'Form A · seed 42', 'HD-30: footer right is form and seed');
    const r = renderPlan(p);
    eq(r.pupilPages.length, r.keyPages.length, 'PT-KEY-1: the key has as many pages as the pupil sheet');
    const cellsOf = (html) => (html.match(/data-ws-cell="/g) || []).length;
    eq(r.pupilPages.map(cellsOf), r.keyPages.map(cellsOf), 'AK-1: the key has the pupil page\'s cells, page for page');
    eq(r.pupilPages.map(cellsOf), [6, 6, 4, 4], 'PG-23 through the role: 6 / 6 / 4 / 4');
    const gridStyles = (html) => (html.match(/<div class="ws-grid[^"]*" style="[^"]*"/g) || []);
    eq(r.pupilPages.map(gridStyles), r.keyPages.map(gridStyles), 'AK-1: every grid has the same geometry on the key');
    ok(/data-ws-label="letter">g\.<\/span>/.test(r.pupilPages[1]) && !/>a\.<\/span>/.test(r.pupilPages[1]), 'CL-12: page 2 of an Independent run starts at g.');
    ok(r.pupilPages[1].includes('class="mq-cont"'), 'HD-20: pages 2+ carry the continuation header');
    ok(!/ws-field date/.test(r.pupilPages[1]) && !/ws-title/.test(r.pupilPages[1]), 'HD-20: no Date and no title on a continuation page');
    ok(/data-ws-instruction="add">Add\.<\/div>/.test(r.pupilPages[3]), 'PG-22: the instruction repeats on every page');
    ok(r.keyPages[0].includes('data-ws-key="name">Answer Key') && r.keyPages[0].includes('<span>Answer Key</span>'), 'AK-3: the key is marked on the Name rule and in the tab');
    ok(/Key · Form A · seed 42/.test(r.keyPages[0]), 'AK-3: the key footer');
    // (a short page spends its spare height as row gaps, each row keeping the cell height)
    ok(/height:151\.33\dmm/.test(r.pupilPages[2]) || (r.pupilPages[2].match(/ws-gridrow" style="[^"]*height:75\.6[67]\d*mm/g) || []).length === 2, 'PT-ENG-6: a rebalanced page keeps the section\'s cell height (2 x 75.67 mm)');
    ok(!/height:/.test((r.pupilPages[0].match(/<div class="ws-grid[^"]*" style="[^"]*"/) || [''])[0]), 'PG-10: page 1 fills the body by flex');
    ok(/data-ws-page="1" data-ws-paper="a4" data-ws-role="independent" data-ws-mode="print"/.test(r.pupilPages[0]), '17.1: page hooks');
    ok(/data-ws-cell="stack" data-ws-state="blank" data-ws-level="1" data-ws-answer-type="number"/.test(r.pupilPages[0]), '17.1: cell hooks');
    ok(/data-ws-cell="stack" data-ws-state="answered"/.test(r.keyPages[0]), '17.1: key cells are answered');
    ok(/<footer class="ws-foot" data-ws-teacher>/.test(r.pupilPages[0]), '17.1: the teacher footer hook');
    ok(!/Math Practice Worksheet/.test(r.pupilHtml), 'PT-FRM-6: never "Math Practice Worksheet"');
    ok((r.pupilHtml.match(/data-mq-sheet-engine/g) || []).length === 1, 'the engine stylesheet travels once, on page 1');
}
{
    // One page of six: the whole sheet is one page, Score /6, footer 1/1.
    const p = independentPlan({ items: stackRun(6), skills: SKILL, seed: 7 });
    const r = renderPlan(p);
    eq([p.pages.length, p.meta.scoreOutOf], [1, 6], 'one Independent page of 6');
    ok(/<b>1\/1<\/b>/.test(r.pupilPages[0]), 'HD-30: page 1/1');
    eq(p.header.tab[2], 'Lesson 1', 'PT-FRM-9: Lesson n defaults to 1');
}
{
    // Mixed skills: the fixed title (HD-13) and the two-line tab when strands differ.
    const items = [...stackRun(3), ...run(3, (i) => ({ q: Object.assign(stackQ(900 - i, 100 + i, '-'), { categoryId: 'subtraction', skillId: 'sub_1k_regroup' }) }))];
    const skills = [SKILL[0], { categoryId: 'subtraction', skillId: 'sub_1k_regroup', label: 'Subtract within 1,000', grade: 3, instructionKey: 'subtract' }];
    const p = independentPlan({ items, skills });
    eq(p.header.title, 'Mixed practice', 'HD-13: two skills take the fixed "Mixed practice" title');
    eq(p.header.tab, ['Level 3', 'Lesson 1'], 'HD-5: a sheet with no single strand prints a two-line tab');
    eq(p.meta.instructions[0].key, 'mixed-sign', 'BD-13: an add + subtract section says "Look at the sign"');
}
{
    // More Practice: every letter its own sheet.
    const p = morePracticePlan({ items: stackRun(20), skills: SKILL, seed: 42 });
    eq(p.sheets.map((s) => s.header.tab[2]), ['Practice A', 'Practice B', 'Practice C', 'Practice D'], 'PT-MPR-1: Practice A to D');
    eq(p.meta.scoreOutOf, [6, 6, 4, 4], 'PT-MPR-1: each letter has its own Score');
    eq(p.sheets.map((s) => s.seed), ['A', 'B', 'C', 'D'].map((L) => letterSeed(42, L)), 'PT-MPR-2: each letter has its own seed');
    const r = renderPlan(p);
    ok(r.pupilPages.every((pg) => /data-ws-label="letter">a\.<\/span>/.test(pg)), 'PT-MPR-1: every letter starts at a.');
    ok(r.pupilPages.every((pg) => /<b>1\/1<\/b>/.test(pg)), 'PT-MPR-1: each letter is a one-page sheet (1/1)');
    ok(r.pupilPages.every((pg) => !pg.includes('class="mq-cont"')), 'PT-MPR-1: no letter carries a continuation header');
    ok(r.keyPages.length === 4 && r.keyPages.every((pg) => /Key · Form A · seed \d+/.test(pg)), 'AK-3: one key per letter, with its seed');
    // Items tagged with a letter are grouped by it (the host generates each letter's own items).
    const tagged = stackRun(4).map((it, i) => Object.assign(it, { letter: i < 2 ? 'C' : 'D' }));
    const p2 = morePracticePlan({ items: tagged, skills: SKILL, seed: 1 });
    eq(p2.sheets.map((s) => s.header.tab[2]), ['Practice C', 'Practice D'], 'PT-MPR-2: tagged items print under their own letter');
}

/* ============================================================ the P7.2b roles (host protocol) */

/**
 * A host item as print-sheet.js hostItem() makes it: the SAME draw function for the pupil page,
 * the key and the measurement, with `shown` / `ink` written into the cell's own slot through the
 * template's `traced` / `wrong` states. `h` is the measured height at every column count.
 */
const hostLike = (q, h = 50) => {
    const key = cellAnswerKey(q);
    const ans = String(q.ans);
    const measured = Object.fromEntries([1, 2, 3, 4, 5, 6, 8, 10].map((c) => [c, { hMm: h, fits: true }]));
    let fp;
    try { fp = cellFootprint(q, resolveCtx({ mode: 'print', size: 'L', look: 'ican' })); } catch (e) { fp = { wMm: 40, hMm: h }; }
    return {
        q, key, template: q.cell.template, legacy: false, skill: `${q.categoryId}:${q.skillId}`, answerType: 'number',
        footprint: Object.assign({}, fp, { measure: false, maxCols: 6 }), measured, fclass: 'standard', cellCls: '',
        canShow: () => true,
        render: (c, { shown, ink } = {}) => {
            let state = c.state;
            let wrong = c.wrong;
            if (shown !== undefined && shown !== null && shown !== '') {
                if (ink === 'trace' && String(shown) === ans) state = 'traced';
                else { state = 'wrong'; wrong = { value: String(shown) }; }
            }
            return renderCell(q, Object.assign({}, c, { state, wrong }));
        },
    };
};
const factQ = (a, b, op = '×') => ({
    categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: 'Multiplication facts', answerType: 'number',
    text: `${a} ${op} ${b} = ?`, ans: op === '×' ? a * b : a + b, printFormat: 'mult-facts-vertical',
    cell: { template: 'fact', v: 1, payload: { a, b, op } },
});
const subQ = (a, b) => Object.assign(stackQ(a, b, '-'), { categoryId: 'subtraction', skillId: 'sub_1k_regroup', skillLabel: 'Subtract within 1,000' });
const SUB_SKILL = { categoryId: 'subtraction', skillId: 'sub_1k_regroup', label: 'Subtract within 1,000', grade: 3, instructionKey: 'subtract', iCan: 'I Can subtract within 1,000' };
const FACT_SKILL = { categoryId: 'multiplication', skillId: 'mult_facts', label: 'Multiplication facts', grade: 3, instructionKey: 'multiply', iCan: 'I Can multiply' };
const ADD_SKILL = Object.assign({}, SKILL[0], { iCan: 'I Can add within 1,000' });

/**
 * Drive one role through the host protocol: sources -> prepare -> counts -> plan -> render.
 * `make(poolId, skill, i)` returns the i-th question of a pool.
 */
function hostPlan(roleId, skills, make, extra = {}) {
    const mod = ROLE_MODULES[roleId];
    const earlier = (sk, n) => (sk.skillId === 'add_1k_regroup' ? ['add_100_regroup', 'add_100_no_regroup', 'add_20_regroup', 'add_10'].map((skillId) => ({ categoryId: 'addition', skillId })).slice(0, n) : []);
    const pools = mod.sources(skills.map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, weight: s.weight })), { earlier });
    const input = Object.assign({ items: [], skills, pools: pools.map((p) => ({ id: p.id, weight: p.weight || 1 })), ctx: { size: 'L', paper: 'A4' }, seed: 42, form: 'A', floors: {} }, extra);
    const deal = (pool, n) => {
        const flags = typeof mod.wrongFlags === 'function' ? mod.wrongFlags(n, 42) : [];
        const out = [];
        for (let i = 0; out.length < n && i < n * 3; i++) {
            const it = hostLike(make(pool.id, pool.skills[0], i), extra.h || 50);
            const pr = typeof mod.prepare === 'function' ? mod.prepare(it, { index: out.length, seed: 42, wrong: !!flags[out.length], size: 'L' }) : it;
            if (!pr) continue;
            pr.pool = pool.id;
            pr.measured = pr.measured || it.measured;
            out.push(pr);
        }
        return out;
    };
    const probe = Object.fromEntries(pools.map((p) => [p.id, deal(p, 8)]));
    const want = mod.counts(probe, input);
    input.items = pools.flatMap((p) => deal(p, want[p.id] || 0));
    const why = typeof mod.supports === 'function' ? mod.supports(input.items) : null;
    if (why) return { unsupported: why, input };
    const plan = mod.plan(input);
    return { plan, r: renderPlan(plan), input, want };
}
const cellsOf = (html) => (html.match(/data-ws-cell/g) || []).length;
const addMake = (pool, sk, i) => stackQ(111 + i * 7, 222 + i * 3);
// A skill with a real provider (sheet/providers/addition.js): its own steps, Say frame and stories.
const PROV_SKILL = { categoryId: 'addition', skillId: 'add', label: 'Addition', grade: 1, instructionKey: 'add' };
const provMake = (pool, sk, i) => Object.assign(stackQ(12 + i, 25 + i), { skillId: 'add', skillLabel: 'Addition', printFormat: 'column-add' });
const bigAMake = (pool, sk, i) => stackQ(333 + i * 7, 111 + i * 3);
const storyMake = (pool, sk, i) => Object.assign(stackQ(3 + i, 4), { skillId: 'add_wp_10', printFormat: 'word-problem', text: `Sam has ${3 + i} apples. He gets 4 more. How many apples does Sam have now?` });

eq(Object.keys(ROLE_MODULES).length, 15, 'roles/index.js carries the fourteen P7.2b role modules and the lesson');
ok(Object.keys(ROLE_MODULES).every((id) => ROLE_IDS.includes(id)), 'ROLE_IDS lists every P7.2b role');
eq(ROLE_ALIASES.model, 'scripted-model', 'the print screen\'s "model" names the Scripted Model role');

// AK-1 / PT-KEY-7 for every role: the key is the pupil page, cell for cell and page for page.
for (const id of ['opener', 'scripted-model', 'guided', 'error-analysis', 'review', 'test', 'pre-skill-check', 'word-problems', 'true-false', 'reason-it', 'stretch']) {
    const res = id === 'scripted-model' || id === 'opener' ? hostPlan(id, [PROV_SKILL], provMake)
        : hostPlan(id, [ADD_SKILL], id === 'word-problems' ? storyMake : id === 'error-analysis' ? bigAMake : addMake);
    if (res.unsupported) { fails.push(`${id}: unsupported (${res.unsupported})`); continue; }
    ok(res.plan && res.r.pupilPages.length >= 1, `${id}: composes at least one page`);
    eq(res.r.keyPages.length, res.r.pupilPages.length, `AK-1 ${id}: as many key pages as pupil pages`);
    eq(res.r.keyPages.map(cellsOf), res.r.pupilPages.map(cellsOf), `AK-1 ${id}: the key has the pupil page's cells, page for page`);
    // PT-KEY-7: a page with nothing to answer (the Scripted Model) is its own key.
    ok(res.plan.nothingToAnswer || res.r.keyPages.every((pg) => pg.includes('Answer Key')), `AK-3 ${id}: every key page says Answer Key`);
    ok(!res.r.pupilPages.some((pg) => /undefined|NaN|\[object Object\]/.test(pg.replace(/<style[\s\S]*?<\/style>/g, ''))), `${id}: no undefined / NaN / [object Object] printed`);
}

// PT-GDP-1: Guided - unlabelled, unscored, the fade across items, the page filled.
{
    const { plan, r } = hostPlan('guided', [ADD_SKILL], addMake);
    ok(plan.meta.items >= 6 && plan.meta.items <= 12, `PT 2.3 (re-grade 2026-09-25): Guided at L fills the page, 6 to 12 cells (${plan.meta.items})`);
    // Critic round 2 (C4): the Guided page is lettered and scored like every other role; the
    // worked example carries the Model tab and is not scored.
    eq(plan.header.score, plan.meta.items - 1, 'Guided: Score counts every cell but the worked example');
    ok(/data-ws-label="letter"/.test(r.pupilHtml), 'Guided: quiet letter labels');
    ok(/data-ws-label="model"/.test(r.pupilPages[0]), 'Guided: the worked example carries the Model tab');
    ok(/data-ws-ink="trace"/.test(r.pupilPages[0]), 'PT-GDP-1: cell 1 carries its answer in trace grey');
    ok(/Guided Practice:/.test(r.pupilHtml), 'PT 2.3: the Guided Practice band');
    // No provider steps -> no Steps band, never the generic operation steps.
    ok(!/Steps:/.test(r.pupilHtml) && plan.meta.steps === 0, 'Guided: no Steps band when the skill supplies no steps of its own');
    ok(!/Regroup 10 ones as 1 ten/.test(r.pupilHtml), 'Guided: no generic operation steps');
    // H5: the rest of row 1 carries a PARTIAL trace (one digit shown, the rest hidden, geometry kept).
    const cells = r.pupilPages[0].split('data-ws-cell=').slice(1);
    ok(cells.length >= 3 && /class="mq-untraced"/.test(cells[1]) && /data-ws-ink="trace"|ws-trace/.test(cells[1]), 'PEDAGOGY 4.2 H5: cell 2 is partially traced');
    ok(!/ws-trace|data-ws-ink="trace"/.test(cells[cells.length - 1]), 'PT-GDP-1: the last row is solid (no trace)');
    const grid = plan.pages[0].sections.find((s) => s.kind === 'band' && s.label === 'Guided Practice:').content;
    ok(parseFloat(grid.height) >= 170, `Guided: the grid fills the page under the bands (${grid.height})`);
}
// Critic round 2: the fade traces the WORKING (carries), never a lone digit, and cues facts.
{
    const { traceCarries, countCueOf, thinkCueOf } = ROLE_MODULES.guided;
    const it = { q: stackQ(47, 35), template: 'stack' };
    const html = '<div class="ws-stack wide" style="--t:3"><span class="rg"></span><span class="rg" data-ws-seg="only"><i style="font-style:normal"></i></span><span class="rg"></span></div>';
    ok(/data-ws-ink="trace"[^>]*>1<\/i>/.test(traceCarries(html, it)), 'Guided: 47 + 35 traces the carried ten in its regroup box');
    ok(!/data-ws-ink="trace"/.test(traceCarries(html, { q: stackQ(41, 35), template: 'stack' })), 'Guided: no carry, nothing traced in the regroup box');
    eq(countCueOf({ q: { categoryId: 'addition', a: 8, b: 3, op: '+', cell: { template: 'fact', payload: { a: 8, b: 3, op: '+' } } }, template: 'fact' }), 3, 'H3: an addition fact cues the smaller addend');
    ok(/6 × __ = 24/.test(thinkCueOf({ q: { categoryId: 'division', a: 24, b: 6, op: '÷', cell: { template: 'fact', payload: { a: 24, b: 6, op: '÷', notation: 'horiz' } } }, template: 'fact' })), 'Guided: a division fact carries the missing-factor think line');
    // A count / a fact is never partly traced: no orphan grey digit on cells 2..n.
    const g = hostPlan('guided', [FACT_SKILL], (pool, sk, i) => factQ(2 + i, 7), { h: 40 });
    const gcells = g.r.pupilPages[0].split('data-ws-cell=').slice(2);
    ok(gcells.length >= 3 && gcells.every((c) => !/ws-factans ws-trace|mq-untraced/.test(c)), 'Guided: facts after the worked example carry no partial trace');
}
// Round-3 re-grade: a Guided sheet of tall cells gives the Model AND at least three tries, on a
// continuation page when page 1 holds only two (never "a model and ONE practice item").
{
    const g = hostPlan('guided', [FACT_SKILL], (pool, sk, i) => factQ(2 + i, 7), { h: 110 });
    const cells = g.r.pupilPages.reduce((a, p) => a + (p.split('data-ws-cell=').length - 1), 0);
    ok(g.plan.meta.items >= 4 && cells >= 4, `Guided, 110 mm cells: model + >= 3 tries (${g.plan.meta.items} items, ${cells} cells)`);
    ok(g.r.pupilPages.length >= 2 && g.r.keyPages.length === g.r.pupilPages.length, `Guided, 110 mm cells: continues on page 2, key a facsimile (${g.r.pupilPages.length} / ${g.r.keyPages.length})`);
    ok(/data-ws-label="model"/.test(g.r.pupilPages[0]) && g.plan.meta.scoreOutOf === g.plan.meta.items - 1, 'Guided: the Model is on page 1 and unscored');
}
// Owner 2026-09-25: a problem that only fits one column keeps one and goes at the bottom of the
// section - it never pulls the whole section down to one column, and is never interleaved.
{
    const items = Array.from({ length: 8 }, (_, i) => {
        const it = hostLike(stackQ(11 + i, 22 + i), 40);
        if (i % 4 === 1) it.fclass = 'word';
        return it;
    });
    const plan = independentPlan({ items, skills: SKILL, sections: [{ columns: 2 }], seed: 3 });
    const r = renderPlan(plan);
    const grids = r.pupilPages.join('').match(/grid-template-columns:repeat\((\d+),1fr\)/g) || [];
    ok(grids.length >= 2 && /repeat\(2,/.test(grids[0]) && /repeat\(1,/.test(grids[grids.length - 1]), `Columns 2 with two one-column problems: a 2-column grid, then a 1-column group at the bottom (${grids.join(' | ')})`);
    const fitLines = (plan.meta.fits || []).map((f) => f.line || '').join(' / ');
    ok(/full-width problem/.test(fitLines), `the fits line says where the full-width problems went (${fitLines})`);
}
// Critic round 2: the instruction fits the slots and the section.
{
    const { resolveInstruction } = await import('../../js/modules/sheet/roles/practice.js');
    eq(resolveInstruction('ring-groups', [], {}).text, 'Circle groups of the number shown. Write how many groups.', 'no single group size: never "Write how many in each group"');
    eq(resolveInstruction('ring-remainder', [], {}).key, 'ring-remainder-each', 'div_remainders with mixed divisors keeps its task');
    eq(resolveInstruction('missing', [{ q: { ans: '35, 56' } }, { q: { ans: '7' } }]).text, 'Write the missing numbers.', 'two blanks: the plural instruction');
    eq(resolveInstruction('missing', [{ q: { ans: '7' } }]).text, 'Write the missing number.', 'one blank: the singular instruction');
}
// Critic round 2 (C3): a test of one-line facts is a dense grid.
{
    const t = hostPlan('test', [FACT_SKILL], (pool, sk, i) => factQ(2 + (i % 9), 7), { h: 40 });
    // 12.1: Test A / B at L holds 12 (a ceiling is never exceeded); dense packing fills it.
    // Round-3 re-grade: the page printed 20 under an "At most 12 problems" note.
    ok(t.plan.meta.items === 12, `Test of facts at L: the 12.1 ceiling, 12 items (${t.plan.meta.items})`);
    const fl = ((t.plan.meta.fits || [])[0] || {}).note || '';
    const said = /At most (\d+) problems/.exec(fl);
    ok(!said || Number(said[1]) >= t.plan.meta.items, `Test of facts: the fits note agrees with the page (${fl})`);
}
// Critic round 2: Error analysis - pupil ink, and a fix slot of the skill's own kind.
{
    const { pupilInk, prepare } = ROLE_MODULES['error-analysis'];
    ok(/class="x mq-pupil"/.test(pupilInk('<span class="x" data-ws-ink="solid">7</span>')) && /class="mq-pupil"/.test(pupilInk('<b data-ws-ink="solid">7</b>')), 'Error analysis: the shown work is marked as pupil ink');
    const chartQ = { categoryId: 'multiplication', skillId: 'mult_chart', ans: '30, 35, 42', text: 'chart', cell: { template: 'equation', v: 1, payload: {} } };
    const fake = { q: chartQ, template: 'mult-chart', fclass: 'standard', footprint: { wMm: 80 }, render: () => '<div>chart</div>', key: {} };
    const p = prepare(fake, { index: 0, wrong: false });
    const ctx = resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank' });
    const html = p && p.render(ctx, { cols: 1 });
    ok(html && (html.match(/data-ws-slot="ea-ans-\d"/g) || []).length === 3, 'Error analysis: a three-value answer gets one fix box per value');
}
// Guided Steps band: the provider's own steps, read row by row (1 2 / 3 4), never 1 3 / 2.
{
    const { partialTrace, stepsOf } = ROLE_MODULES.guided;
    eq(stepsOf([]), [], 'Guided: no items, no steps');
    const pg = hostPlan('guided', [PROV_SKILL], provMake);
    ok(pg.plan.meta.steps >= 2 && /<b>Steps:<\/b>/.test(pg.r.pupilHtml) && /mq-steps-rows/.test(pg.r.pupilHtml), 'SCC 3.8: Guided prints the provider\'s own steps, row by row');
    const wp = hostPlan('word-problems', [PROV_SKILL], provMake);
    ok(wp.plan && wp.plan.meta.items >= 2 && wp.plan.meta.items <= 3, 'SCC-P19: a skill with provider stories prints Word problems (2 or 3 a page)');
    ok(wp.r && /data-ws-slot="wp-label"[^>]*>[a-z]+</.test(wp.r.keyHtml), 'SCC-P19: the key writes the story\'s label word');
    eq(partialTrace('<span class="ws-trace">1</span><span class="ws-trace">4</span>'), '<span class="ws-trace"><span class="mq-untraced">1</span></span><span class="ws-trace">4</span>', 'H5: a column answer keeps its ones digit');
    eq(partialTrace('<b data-ws-ink="trace" style="x">25</b>'), '<b data-ws-ink="trace" style="x">2<span class="mq-untraced">5</span></b>', 'H5: a one-slot answer keeps its first digit');
    eq(partialTrace('<b data-ws-ink="trace">7</b>'), null, 'H5: a one-digit answer has no partial trace');
    ok(/mq-steps-rows\{display:grid;grid-template-columns:1fr 1fr/.test(renderPlan(hostPlan('guided', [ADD_SKILL], addMake).plan).pupilHtml), 'PT-GDP-2: the Steps list is a row-major 2-column grid');
}
// Test: every item in its own ruled cell, packed to its content.
{
    const { plan, r } = hostPlan('test', [ADD_SKILL], addMake, { h: 30 });
    const grid = plan.pages[0].sections.find((s) => s.kind === 'grid');
    ok(!/\bopen\b/.test(grid.cls || ''), 'PT 2.9 (re-grade): the Test grid draws its cell rules (no open array)');
    ok(plan.meta.items >= 9 && plan.meta.items <= 16, `Test at L: cells pack to their content, 9-16 items (${plan.meta.items})`);
    ok(!/class="ws-grid[^"]*\bopen\b/.test(r.pupilHtml), 'Test: no open grid in the rendered page');
}
// Dense packing (layout.js): short cells get more columns and rows; the default grid otherwise.
{
    const short = run(20, (i) => ({ q: stackQ(11 + i, 22 + i), measured: Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: 30, fits: true }])), footprint: { measure: true, hMm: null, maxCols: 6 } }));
    const plain = L(short, 'auto', 'L');
    const dense = L(short, 'auto', 'L', { dense: true });
    ok(dense.perPage > plain.perPage && dense.perPage <= 12, `dense: more items than the 2 x 3 default, within the 12 ceiling (${plain.perPage} -> ${dense.perPage})`);
    ok(dense.cellH >= 30 * 1.2 - 0.01, 'dense: every cell keeps 1.2 x its measured content');
    const tall = run(6, (i) => ({ q: stackQ(11 + i, 22 + i), measured: Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: 70, fits: true }])), footprint: { measure: true, hMm: null, maxCols: 6 } }));
    ok(L(tall, 'auto', 'L', { dense: true }).perPage >= L(tall, 'auto', 'L').perPage, 'dense: never fewer items than the default grid');
    ok(L(tall, 'auto', 'L', { dense: true }).cellH >= 70 * 1.2 - 0.01, 'dense: tall cells keep their room');
    const narrow = run(20, (i) => ({ q: stackQ(11 + i, 22 + i), measured: { 1: { hMm: 30, fits: true }, 2: { hMm: 30, fits: true }, 3: { hMm: 30, fits: false }, 4: { hMm: 30, fits: false } }, footprint: { measure: true, hMm: null, maxCols: 6 } }));
    ok(L(narrow, 'auto', 'L', { dense: true }).cols <= 2, 'dense: never more columns than the measurement fits (minimum column width)');
    eq(L(short, 2, 'L', { dense: true }).cols, 2, 'dense: an explicit column count is honoured (DN-12)');
}
// Error analysis: a real wrong answer or nothing; the cell's stem suppressed; a real fix slot.
{
    const { plan, r } = hostPlan('error-analysis', [ADD_SKILL], bigAMake);
    ok(plan.meta.wrongShare > 0, 'PT-ERR-1: at least one real wrong answer');
    ok(/data-ws-slot="ea-ans" data-ws-shape="box"/.test(r.pupilHtml), 'Error analysis: the fix is a square write box');
    ok(/correct answer<\/small>/.test(r.pupilHtml), 'Error analysis: the write box is captioned');
    const none = hostPlan('error-analysis', [ADD_SKILL], addMake);
    ok(typeof none.unsupported === 'string' && /wrong/.test(none.unsupported), `PT-ERR-1: no real wrong answer -> unsupported, never an all-correct page (${none.unsupported || none.plan.meta.wrongShare})`);
}
// Word problems: stories only; story, work space, number + label.
{
    ok(typeof hostPlan('word-problems', [ADD_SKILL], addMake).unsupported === 'string', 'PT 3.7: a non-story skill is unsupported on Word problems');
    const { r } = hostPlan('word-problems', [ADD_SKILL], storyMake);
    ok(/class="mq-wpspace"/.test(r.pupilHtml) && /data-ws-slot="wp-num"/.test(r.pupilHtml) && /data-ws-slot="wp-label"/.test(r.pupilHtml), 'PT 3.7 v2: story, work space, number and label');
    ok(!/class="mq-wpcell"/.test(r.pupilHtml), 'PT 3.7: no bare cell pasted into the band');
    ok(/mq-wp2 \.mq-wpstory\{border-radius:0\}/.test(r.pupilHtml), 'Word problems: no rounded card on paper');
}
// Titles: "I Can work on ..." is never printed; the category verb builds the fallback.
{
    const { skillWords, iCanFromCategory } = await import('../../js/modules/sheet/roles/practice.js');
    const { resolveInstruction } = await import('../../js/modules/sheet/roles/practice.js');
    eq(resolveInstruction('skip-count', [], { n: 5 }).text, 'Count by 5. Write the missing numbers.', 'SCC-P17: {n} filled from the items');
    eq(resolveInstruction('skip-count', [], {}).key, 'missing', 'SCC-P17: no single {n} -> the plain "Write the missing number.", never "Solve."');
    eq(iCanFromCategory({ categoryId: 'addition' }, 'addition facts within 20'), 'I Can add facts within 20', 'HD-10: I Can from the category verb');
    eq(iCanFromCategory({ categoryId: 'addition' }, 'pick the missing addends'), 'I Can pick the missing addends', 'HD-10: a label that starts with a verb');
    eq(iCanFromCategory({ categoryId: 'multiplication' }, 'multiplication chart'), 'I Can multiply with a chart', 'HD-10: a chart');
    ok(!/work on/i.test(skillWords({ categoryId: 'addition', skillId: 'no_such_skill', label: 'Addition Facts (within 20)' }).iCan), 'HD-10: skillWords never returns "I Can work on"');
}
// PT-OPN-1: the Opener bands in their fixed order; Say band on by default.
{
    const { plan, r } = hostPlan('opener', [PROV_SKILL], provMake);
    const order = ['Model:', 'Steps:', 'Say:', 'Guided Practice:'].map((w) => r.pupilHtml.indexOf(`<b>${w}</b>`));
    ok(order.every((i) => i > 0) && order.every((v, i) => !i || v > order[i - 1]), 'PT-OPN-1: Model, Steps, Say, Guided in that order');
    eq(plan.header.score === false ? 0 : plan.header.score, plan.meta.independent, 'PT-OPN-7: Score counts the Independent rows only');
}
// PT-MOD-1 / PT-MOD-4: one state per step, the Say band filled in, nothing to answer.
{
    const { plan, r } = hostPlan('scripted-model', [PROV_SKILL], provMake);
    ok(plan.nothingToAnswer === true, 'PT-KEY-7: the Scripted Model page is its own key');
    ok(plan.meta.states >= 3, 'PT-MOD-1: at least three states');
    ok(!/__/.test(r.pupilHtml.replace(/<style[\s\S]*?<\/style>/g, '').split('Say:')[1] || '__'), 'PT-MOD-4: the Say band is filled for this problem (provider sayFill)');
    ok(typeof hostPlan('scripted-model', [ADD_SKILL], addMake).unsupported === 'string', 'SCC 3.8: no provider steps -> no Scripted Model page (never generic steps)');
    const op = hostPlan('opener', [ADD_SKILL], addMake);
    ok(op.plan && !/<b>Steps:<\/b>/.test(op.r.pupilHtml), 'SCC 3.8: the Opener prints no Steps box for a skill with no steps');
}
// PT-ERR-1 / PT-TOF-1: 40 to 60% wrong; the key checks the right box on every item.
for (const id of ['error-analysis', 'true-false']) {
    // a > b: the default adapter's real misconception (the other operation) exists for every item.
    const { plan, r } = hostPlan(id, [ADD_SKILL], (pool, sk, i) => stackQ(333 + i * 7, 111 + i * 3));
    const share = id === 'true-false' ? plan.meta.falseShare : plan.meta.wrongShare;
    ok(share >= 0.4 && share <= 0.6, `${id}: 40-60% of the shown answers are wrong (${share})`);
    eq((r.keyHtml.match(/>✓</g) || []).length, plan.meta.items, `${id}: the key checks exactly one box per item`);
    eq((r.pupilHtml.match(/>✓</g) || []).length, 0, `${id}: the pupil page checks nothing`);
}
eq(hostPlan('true-false', [ADD_SKILL], addMake).plan.header.title, 'True or False?', 'HD-13: True or False? title');
// PT-RSN-4: Reason It - A and B side by side, the key rings the right one.
{
    const { plan, r } = hostPlan('reason-it', [ADD_SKILL], addMake);
    eq(plan.header.title, 'Reason It', 'HD-13: Reason It title');
    eq((r.keyHtml.match(/outline:1\.5pt solid #000/g) || []).length, plan.meta.items, 'AK-2: the key rings one choice per item');
    ok(plan.meta.items >= 1 && plan.meta.items <= 2, 'PT-RSN-1: at most 2 at L');
}
// PT-REV-3: Review mixes about a third earlier items, whole rows, one cell height.
{
    const { plan, r } = hostPlan('review', [ADD_SKILL], (pool, sk, i) => (pool === 'earlier' ? stackQ(12 + i, 30 + i) : stackQ(111 + i * 7, 222 + i * 3)));
    ok(/^Review: adding/.test(plan.header.title), 'HD-13: "Review: <topic>"');
    ok(plan.meta.earlierShare >= 0.2 && plan.meta.earlierShare <= 0.4, `PT-REV-3: earlier items are 25-35% (${plan.meta.earlierShare})`);
    ok(/Mixed Review:/.test(r.pupilHtml), 'PT 2.8: the earlier items print under Mixed Review');
}
// PT-TST-1: Test B is Test A's items, re-ordered.
{
    const a = hostPlan('test', [ADD_SKILL], addMake);
    const b = hostPlan('test', [ADD_SKILL], addMake, { form: 'B' });
    const ansOf = (res) => res.plan.pages[0].sections.filter((s) => s.kind === 'grid').flatMap((g) => g.items.map((it) => it.q.ans));
    eq(ansOf(b).slice().sort(), ansOf(a).slice().sort(), 'PT-TST-1: Form B holds the same items');
    ok(JSON.stringify(ansOf(a)) !== JSON.stringify(ansOf(b)), 'PT-TST-1: in another order');
    ok(/^Test B: /.test(b.plan.header.title) && b.plan.header.tab.includes('Test B'), 'HD-13 / PT-FRM-9: "Test B" title and tab');
}
// PT-PRE-1: four quadrants with their own small score.
{
    const { plan, r } = hostPlan('pre-skill-check', [ADD_SKILL], addMake);
    eq((r.pupilHtml.match(/class="mq-quadscore"/g) || []).length, 4, 'PT-PRE-1: four quadrants, each with its own __/4');
    eq(plan.meta.scoreOutOf, 16, 'PT-PRE-1: Score /16');
    // A skill with one earlier skill checks one quadrant, never the same skill four times.
    const one = hostPlan('pre-skill-check', [SUB_SKILL], (pool, sk, i) => subQ(500 + i * 11, 123 + i));
    eq(one.plan.meta.scoreOutOf, 4, 'PT-PRE-3: a first skill checks itself once (4 items)');
}
// PT-STC-1..3: Stretch - no Score, a traced worked row, key rows that satisfy the check rule.
{
    const { plan, r } = hostPlan('stretch', [ADD_SKILL], addMake);
    eq(plan.header.score, false, 'Stretch prints no Score (answers vary)');
    ok(/class="mq-ex"/.test(r.pupilHtml), 'PT-STC-1: one worked row traced in grey');
    const rows = [...r.keyHtml.matchAll(/<tr>((?:<td[^>]*><b[^>]*>\d+<\/b><\/td>){3})<\/tr>/g)].map((m) => [...m[1].matchAll(/>(\d+)<\/b>/g)].map((x) => Number(x[1])));
    ok(rows.length >= 3 && rows.every(([x, y, z]) => x + y === z), 'PT-STC-2: every key row passes its own check');
    ok(!/answers shown/.test(r.keyHtml.replace(/<footer[\s\S]*?<\/footer>/g, '')), 'Stretch key: no display text leaks into a check box');
}
// PT-WPR-1: word problems print in one column, 2 per page at L.
{
    const story = (pool, sk, i) => Object.assign(stackQ(3 + i, 4), { skillId: 'add_wp_10', printFormat: 'word-problem', text: `Sam has ${3 + i} apples. He gets 4 more. How many apples does Sam have now?` });
    const { plan, r } = hostPlan('word-problems', [ADD_SKILL], story);
    eq(plan.meta.items, 3, 'Critic round 2 (C3): three short stories per page at L when they fit');
    ok(/data-ws-instruction="story-v2"/.test(r.pupilHtml), 'PT 3.7: the story-v2 instruction');
    ok(/data-ws-slot="wp-label"[^>]*>[a-z]+</.test(r.keyHtml), 'PT-WPR-8: the key writes the label word');
    // Critic round 2: the stories on one page never share a template and noun.
    const stories = [...r.pupilHtml.matchAll(/<div class="ws-story mq-wpstory">([\s\S]*?)<\/div><\/div>/g)].map((m) => m[1].replace(/<[^>]*>/g, ' ').replace(/\d+/g, '#').replace(/\s+/g, ' '));
    ok(stories.length >= 2 && new Set(stories).size === stories.length, 'word problems: no two stories on a page are the same template');
}
// PT-CMP-2: the fact layouts take fact skills only, and say why otherwise.
{
    // CLAUDE.md: fact AND operations skills get the fact layouts; pictures / stories do not.
    ok(!hostPlan('fact-rows', [ADD_SKILL], addMake).unsupported, 'CLAUDE.md: Fact rows take a one-step operations skill (column addition)');
    ok(!hostPlan('fact-probe', [ADD_SKILL], addMake).unsupported, 'CLAUDE.md: the Fact probe takes a one-step operations skill');
    // Critic round 2: a sum of three or four addends is a procedure, not a fact row.
    const multi = (pool, sk, i) => Object.assign(stackQ(10 + i, 20 + i), { skillId: 'add_column_multi', printFormat: 'column-add-multi', text: `${10 + i} + ${20 + i} + ${30 + i} = ?`, ans: 60 + 3 * i, a: undefined, b: undefined, op: undefined,
        cell: { template: 'stack', v: 1, payload: { operands: [10 + i, 20 + i, 30 + i], op: '+' } } });
    ok(typeof hostPlan('fact-rows', [ADD_SKILL], multi).unsupported === 'string', 'Fact rows refuse column addition of three or more addends, with a reason');
    const pic = (pool, sk, i) => Object.assign(stackQ(3 + i, 2), { skillId: 'number_line_add', printFormat: 'number-line-visual' });
    ok(typeof hostPlan('fact-rows', [ADD_SKILL], pic).unsupported === 'string', 'PT-CMP-2: Fact rows refuse a number-line skill, with a reason');
    ok(typeof hostPlan('fact-probe', [ADD_SKILL], storyMake).unsupported === 'string', 'PT-CMP-2: the Fact probe refuses a story skill');
    const fr = hostPlan('fact-rows', [FACT_SKILL], (pool, sk, i) => factQ(2 + (i % 11), 3), { h: 30 });
    eq(fr.plan.pages[0].sections.find((s) => s.kind === 'grid').cols, 5, 'PT-FRW-2: Fact rows Auto 5 columns at L');
    eq(fr.plan.header.title, 'Multiply by 3', 'HD-13: the fact stub title');
    eq(fr.plan.ctx.look, 'daily', 'PAGE_TYPES appendix 4: Fact rows default to the Daily look');
    // Critic round 2: a TRUE fact-row page - every cell the fact template, filled to table 4.1.
    ok(fr.plan.meta.items >= 25, `PT 4.1: Fact rows at L hold 25 facts (${fr.plan.meta.items})`);
    ok(/class="ws-fact"/.test(fr.r.pupilHtml) && !/class="ws-stack/.test(fr.r.pupilHtml), 'PT 4.1: fact rows draw the fact template, not the Independent cell');
    const big = hostPlan('fact-rows', [FACT_SKILL], (pool, sk, i) => factQ(12, 3 + (i % 10)), { h: 30 });
    eq(big.plan.pages[0].sections.find((s) => s.kind === 'grid').cols, 5, 'VA-2: x12 facts keep 5 columns (the digits step down the ladder instead)');
    const divQ = (a, b) => ({ categoryId: 'division', skillId: 'div_facts', skillLabel: 'Division facts', answerType: 'number', text: `${a * b} ÷ ${b} = ?`, ans: a, a: a * b, b, op: '÷',
        printFormat: 'div-facts-horizontal', cell: { template: 'fact', v: 1, payload: { a: a * b, b, op: '÷', notation: 'horiz' } } });
    const DIV_SKILL = { categoryId: 'division', skillId: 'div_facts', label: 'Division facts', grade: 3, instructionKey: 'divide', iCan: 'I Can divide' };
    const dv = hostPlan('fact-rows', [DIV_SKILL], (pool, sk, i) => divQ(2 + (i % 9), 2 + (i % 7)), { h: 20 });
    ok(dv.plan.meta.fits[0].across && dv.plan.meta.fits[0].cols >= 2 && dv.plan.meta.items >= 16, `PT-FRW-6/7: division facts print across, ${dv.plan.meta.items} a page`);
    ok(/class="mq-hfact mq-across"/.test(dv.r.pupilHtml) && /data-ws-slot="answer"[^>]*>\d+</.test(dv.r.keyHtml), 'PT-FRW-7: an across fact with its answer line, filled on the key');
    const twoDigit = hostPlan('fact-rows', [PROV_SKILL], (pool, sk, i) => Object.assign(stackQ(12 + i, 25 + i), { skillId: 'add', skillLabel: 'Addition', printFormat: 'column-add' }), { h: 30 });
    ok(!twoDigit.unsupported && twoDigit.plan.header.title !== 'Addition facts', `HD-13: two-digit work keeps the skill's own title (${twoDigit.plan && twoDigit.plan.header.title})`);
    const fp = hostPlan('fact-probe', [FACT_SKILL], (pool, sk, i) => factQ(1 + (i % 12), 3), { h: 30 });
    eq(fp.plan.meta.items, 20, 'PT 4.2: the probe holds 20 facts');
    ok(Array.isArray(fp.plan.meta.strip) && fp.plan.meta.strip[0] === 3, 'PT-FPR-3: a skip-count strip for a x3 set');
}
// PT-MIX-1..7: Mixed practice - a shelf per skill, each with its own instruction, numbered 1..N.
{
    const skills4 = [ADD_SKILL, SUB_SKILL, FACT_SKILL, Object.assign({}, ADD_SKILL, { skillId: 'add_100_regroup', label: 'Add within 100' })];
    const make = (pool, sk, i) => (sk.skillId === 'sub_1k_regroup' ? subQ(500 + i * 11, 123 + i) : sk.skillId === 'mult_facts' ? factQ(2 + i, 7)
        : sk.skillId === 'add_100_regroup' ? Object.assign(stackQ(20 + i, 35 + i), { skillId: 'add_100_regroup' }) : stackQ(111 + i * 7, 222 + i * 3));
    const { plan, r } = hostPlan('mixed-practice', skills4, make);
    eq(Object.keys(plan.meta.achieved).length, 4, 'PT-MIX-4: every skill gets at least one shelf');
    eq(plan.header.title, 'Mixed practice', 'HD-13: "Mixed practice"');
    eq(plan.header.tab.length, 2, 'PT 5.2: the two-line tab');
    const instr = [...r.pupilHtml.matchAll(/<b>[^<]*<\/b><span>(Add\.|Subtract\.|Multiply\.)<\/span>/g)].map((m) => m[1]);
    ok(instr.includes('Add.') && instr.includes('Subtract.') && instr.includes('Multiply.'), 'DN-34: each skill\'s shelf carries its own instruction');
    eq(plan.meta.scoreOutOf, plan.meta.items, 'PT-FRM-4: Score counts every problem');
}

/* ============================================= slot radius and the digit strip (SL-11, SL-12) */

// Owner ruling 2026-09-25: writing boxes are slightly rounded, scaled with size; frames stay square.
eq([slotRadiusMm('S'), slotRadiusMm('M'), slotRadiusMm('L')], [1, 1.25, 1.5], 'SL-11: slot radius 1 / 1.25 / 1.5 mm');
ok(SLOT.cornerRadiusMm === 3, 'SL-11: the 3 mm container radius is unchanged (frames, story box)');
// The strip heights are 15-25% up on the old boxes and still inside their rows (no capacity change).
for (const sz of ['S', 'M', 'L']) {
    const s = KIT_SIZES[sz];
    const up = SLOT.digitStripMm[sz] / s.writeMm;
    ok(up >= 1.15 && up <= 1.25, `SL-12: ${sz} answer strip ${SLOT.digitStripMm[sz]} mm is 15-25% over Hw ${s.writeMm}`);
    ok(SLOT.digitStripMm[sz] <= s.answerMm, `SL-12: ${sz} answer strip fits the ${s.answerMm} mm answer row`);
    ok(SLOT.carryStripMm[sz] > s.carryMm && SLOT.carryStripMm[sz] <= s.regroupMm, `SL-12: ${sz} regroup strip is taller than the old carry box and fits the regroup row`);
    ok(SLOT.carryStripMm[sz] < SLOT.digitStripMm[sz], `SL-12: ${sz} regroup strip stays smaller than the answer strip`);
}
eq([stripPos(0, 1), stripPos(0, 3), stripPos(1, 3), stripPos(2, 3)], ['only', 'first', 'mid', 'last'], 'SL-12: segment positions');
{
    // Only the ends are rounded and only the last segment draws a right edge, so no divider doubles.
    const first = stripSegStyle('first', { r: 1.5 }), mid = stripSegStyle('mid', { r: 1.5 }), last = stripSegStyle('last', { r: 1.5 });
    ok(/border-radius:1\.5mm 0 0 1\.5mm/.test(first) && /border-right-width:0;/.test(first), 'SL-12: first segment: left radii, no right edge');
    ok(/border-radius:0 0 0 0/.test(mid) && /border-right-width:0;/.test(mid) && /border-left-width:0\.75pt/.test(mid), 'SL-12: middle segment: square, its left edge is the divider');
    ok(/border-radius:0 1\.5mm 1\.5mm 0/.test(last) && /border-right-width:0\.75pt/.test(last), 'SL-12: last segment closes the strip');
    ok(/border-left-width:1px/.test(stripSegStyle('mid', { r: 1, w: '1.5px', dw: '1px' })), 'SL-12: a divider may be thinner than the outline');
}
{
    // The kit stack: one strip per row, one segment per track, so each divider sits on a track
    // boundary and place value lines up. Addition: regroup strip over every column but the ones.
    const add = stack(468, 357, '+', { T: 4, regroup: 'add', answer: 'boxes' });
    const segs = (html, cls) => [...html.matchAll(new RegExp(`<span class="${cls}[^"]*"(?: data-ws-seg="(\\w+)")?>`, 'g'))].map((m) => m[1] || '-');
    eq(segs(add, 'rg'), ['-', 'first', 'last', '-'], 'SL-12: addition regroup strip over tens and hundreds only');
    eq(segs(add, 'ab'), ['first', 'mid', 'mid', 'last'], 'SL-12: the answer strip spans every track (VA-4)');
    const sub = stack(302, 45, '-', { T: 4, regroup: 'sub', answer: 'open' });
    eq(segs(sub, 'rg'), ['-', 'first', 'mid', 'last'], 'SL-12: subtraction regroup strip over the top number (VA-22)');
    const one = stack(16, 9, '+', { T: 3, regroup: 'add', answer: 'open' });
    eq(segs(one, 'rg'), ['-', 'only', '-'], 'SL-12: a one-box regroup row is a strip of one, rounded all round');
    // The key fills the same strip: the digit sits INSIDE its segment (SCC-T10).
    const key = stack(468, 357, '+', { T: 4, regroup: 'add', answer: 'boxes', ans: 825, boxInk: 'solid' });
    ok(/data-ws-seg="last"><i[^>]*data-ws-ink="solid"[^>]*>5<\/i>/.test(key), 'SL-12: the key writes the ones digit into the last segment');
}

/* ================================================ operations templates (P8c) */
{
    const ctxL = (state = 'blank', extra = {}) => Object.assign({ mode: 'print', size: 'L', look: 'ican', state }, extra);
    const T = (template, payload) => ({ cell: { template, v: 1, payload } });
    const slotIds = (html) => [...html.matchAll(/data-ws-slot="([^"]+)"/g)].map((m) => m[1]);
    // VA-2: a vertical fact's operator has its own track - never written over a digit track.
    const f = renderCell(T('fact', { a: 7, b: 12, op: '*', digits: 3 }), ctxL());
    ok(/<span class="op">×<\/span><span><\/span><span>1<\/span><span>2<\/span>/.test(f), 'VA-2: ×12 keeps an operator track and a blank hundreds track');
    // A 3-track band whose second operand leaves the first track empty takes the tight 0.72 em
    // operator track (the empty track keeps it clear); a full-width operand keeps 1.2 em.
    ok(/grid-template-columns:0\.72em repeat\(3, 0\.72em\)/.test(f), 'TY-22: fact digit tracks stay 0.72 em, the operator track is its own (tight over an empty track)');
    ok(/grid-template-columns:1\.2em repeat\(2, 0\.72em\)/.test(renderCell(T('fact', { a: 7, b: 12, op: '+', digits: 2 }), ctxL())), 'VA-2: a 2-track fact keeps the 1.2 em operator track');
    {
        // Capacity: a 2-digit + 2-digit fact with a 3-digit answer band fits 5 columns at L and
        // 6 at M (content width = 186 / cols - 6.6 mm); the answer zone keeps all 3 tracks.
        const fa = T('fact', { a: 78, b: 96, op: '+', notation: 'vertical', digits: 3 });
        const w5 = cellFootprint(fa, resolveCtx(ctxL('blank', { options: { factColumns: 5 } }))).wMm;
        ok(w5 <= 186 / 5 - 0.6, `DN-16: a 3-track addition fact fits 5 columns at L (${w5} mm)`);
        ok(/grid-template-columns:repeat\(3, 0\.72em\)/.test(renderCell(fa, ctxL('answered'))), 'SL-12: the answer zone keeps 3 tracks with the tight operator');
        // Division across: vertical on a fact-rows page of 5+ columns (VA-65), the answer below
        // on a 3-4 column page, beside it where it fits.
        const dv = T('fact', { a: 60, b: 12, op: '/', notation: 'horiz', digits: 2 });
        const at = (c, st = 'blank') => renderCell(dv, ctxL(st, { options: { factColumns: c } }));
        ok(/class="ws-fact"/.test(at(5)) && /<span class="op">÷<\/span>/.test(at(5)), 'VA-65: a division fact on a 5-column fact-rows page is drawn vertical');
        ok(/ws-eq-below/.test(at(3)) && !/class="ws-fact"/.test(at(3)), 'DN-22: a 3-column across fact stacks its answer below');
        ok(!/ws-eq-below/.test(at(2)) && /class="ws-eq"/.test(at(2)), 'the answer stays beside the fact at 2 columns');
        eq(slotIds(at(3)), slotIds(at(3, 'answered')), 'AK-4: the below form carries the same slot blank and keyed');
        const fpAuto = cellFootprint(dv, resolveCtx(ctxL()));
        ok(fpAuto.wMm <= 186 / 5 - 0.6 && !fpAuto.tracks, `the across footprint without a column count is its narrowest drawing (${fpAuto.wMm} mm) and not a stack`);
        ok(/class="ws-eq"/.test(renderCell(dv, { mode: 'screen', static: true, size: 'L', state: 'blank', options: { factColumns: 6 } })), 'the screen twin keeps the across notation');
    }
    const fs = renderCell(T('fact', { a: 15, b: 13, op: '-' }), ctxL());
    ok(fs.includes('<span class="op">−</span>') && !/>-</.test(fs), 'TY-6: subtraction draws the true minus sign');
    eq(slotIds(f), slotIds(renderCell(T('fact', { a: 7, b: 12, op: '*', digits: 3 }), ctxL('answered'))), 'AK-4: a fact carries the same slot blank and keyed');
    ok(/data-ws-ink="solid"[^>]*>(?:<span[^>]*><\/span>)?<span[^>]*>8<\/span><span[^>]*>4<\/span>/.test(renderCell(T('fact', { a: 7, b: 12, op: '*', digits: 3 }), ctxL('answered'))), 'AK-1: the fact key writes 84 on the digit tracks');
    // SL-12: the answer strip spans the answer's tracks only, never the operator track.
    const st = renderCell(T('stack', { operands: [14, 17], op: '+', regroup: false, ansDigits: 2 }), ctxL('blank', { scaffoldLevel: 2 }));
    eq((st.match(/class="ab[^"]*" data-ws-seg=/g) || []).length, 2, 'SL-12: a 2-digit answer strip has 2 segments, none under the +');
    ok(!/class="rg/.test(st), 'no regroup boxes on a basic fact stack when regroup is off');
    // CM-5/6: a stack of four addends, regroup strip over the tens and hundreds.
    const four = renderCell(T('stack', { operands: [24, 66, 92, 57], op: '+', regroup: 'add', ansDigits: 3 }), ctxL());
    ok(['24', '66', '92'].every((n) => four.includes(`<span>${n[0]}</span><span>${n[1]}</span>`)) && four.includes('<span class="op">+</span><span></span><span>5</span><span>7</span>'), 'CM-5: every addend on the tracks, the + only on the last row');
    eq((four.match(/class="rg[^"]*" data-ws-seg=/g) || []).length, 2, 'SL-12: the regroup strip covers tens and hundreds');
    eq(cellAnswerKey(T('stack', { operands: [24, 66, 92, 57], op: '+' })).value, 239, 'the stack sums every addend');
    // Long division: quotient boxes over every dividend track, four work rows, key fills both.
    const ld = T('division', { dividend: 715, divisor: 13, quotient: 55, workRows: 4 });
    const ldB = renderCell(ld, ctxL());
    eq(slotIds(ldB), ['q-0', 'q-1', 'q-2'], 'VA-61: one quotient box over every dividend track');
    ok(/Andika/.test(ldB) && !/Arial/.test(ldB), 'TY-1: the bracket is Andika');
    const ldK = renderCell(ld, ctxL('answered'));
    ok(/data-ws-slot="q-1"[^>]*>(<span[^>]*>)5/.test(ldK) && /data-ws-slot="q-2"[^>]*>(<span[^>]*>)5/.test(ldK), 'AK-1: the key fills the quotient boxes');
    ok((ldK.match(/data-ws-ink="solid"/g) || []).length >= 2 + 6, 'AK-1: the key writes the work rows too');
    eq((ldB.match(/border-bottom:0\.75pt solid #000000/g) || []).length, 2 * 3, 'VA-63: a black rule under each of the two subtract rows');
    ok(/border-left:0\.75pt solid #949494/.test(ldB), 'long division: the work rows are a grey digit grid on the dividend tracks');
    {
        // Two work rows per step: 152 ÷ 19 is one step, 715 ÷ 13 two (no spare "−" row on the key).
        const rowsOfLd = (h) => (h.match(/border-bottom:0\.75pt solid #000000/g) || []).length;
        eq(rowsOfLd(renderCell(T('division', { dividend: 152, divisor: 19 }), ctxL())), 3, 'long division: 152 ÷ 19 draws one subtract row (3 tracks)');
        eq(rowsOfLd(renderCell(T('division', { dividend: 715, divisor: 13 }), ctxL())), 2 * 3, 'long division: 715 ÷ 13 draws two subtract rows');
    }
    eq(cellFootprint(ld, resolveCtx(ctxL())).measure, true, 'long division is measured');
    // Area model: minimum width (never wraps), every partial and the total keyed.
    const am = T('area-model', { multiplier: 4, parts: [300, 40, 5] });
    const amB = renderCell(am, ctxL());
    ok(/flex-wrap:nowrap/.test(amB) && /white-space:nowrap/.test(amB), 'the area model never wraps');
    eq(slotIds(amB), ['part-0', 'part-1', 'part-2', 'total'], 'one box per part and the total');
    const amK = cellAnswerKey(am).slots;
    eq([amK['part-0'].value, amK['part-1'].value, amK['part-2'].value, amK.total.value], ['1200', '160', '20', '1380'], 'the key has every partial product and the total');
    // Multiplication chart: 3-digit cells never merge (nowrap + a minimum width).
    const mc = renderCell(T('mult-chart', { r0: 9, c0: 8, blanks: [{ i: 0, j: 0 }, { i: 1, j: 3 }, { i: 3, j: 4 }] }), ctxL('answered'));
    ok(/min-width:[\d.]+em/.test(mc) && /white-space:nowrap/.test(mc), 'chart cells have a minimum width and never wrap');
    ok(mc.includes('>72<') && mc.includes('>110<') && mc.includes('>144<'), 'the chart key fills 3-digit products');
    // Arrays: dots at least 4 mm, every blank a box, keyed.
    const ar = T('arrays', { kind: 'equal_groups', rows: 3, cols: 4 });
    const arB = renderCell(ar, ctxL());
    const r = Math.min(...[...arB.matchAll(/<circle [^>]*r="([\d.]+)"/g)].map((m) => Number(m[1])));
    ok(r * 2 >= 4, `RP-3: counters are at least 4 mm (${r * 2} mm)`);
    eq(slotIds(arB), ['first', 'second', 'total'], 'three boxes, one per blank');
    {
        // Every range-100 picture fits a 2-column cell's width (86 mm) at the RP-3 minimum pitch.
        const widest = Math.max(...[['equal_groups', 6, 8], ['equal_groups', 6, 4], ['write_mult', 6, 8], ['count_all', 5, 7]]
            .map(([kind, rows, cols]) => Number(renderCell(T('arrays', { kind, rows, cols }), ctxL()).match(/viewBox="0 0 ([\d.]+)/)[1])));
        ok(widest <= 84, `arrays: the widest picture fits a 2-column cell (${widest} mm)`);
        ok(!/There are/.test(arB) && (arB.match(/white-space:nowrap/g) || []).length === 2, 'arrays: two sentence lines, "[ ] groups of [ ]" then "[ ] in all."');
    }
    // Remainder: two slots "[q] R [r]"; rows of counters at least 6 mm apart.
    const rm = T('remainder', { dividend: 19, divisor: 3 });
    const rmB = renderCell(rm, ctxL());
    eq(slotIds(rmB), ['q', 'r'], 'VA-62: quotient and remainder boxes');
    const ys = [...new Set([...rmB.matchAll(/<circle [^>]*cy="([\d.]+)"/g)].map((m) => Number(m[1])))].sort((a, b) => a - b);
    ok(ys.length > 1 && ys[1] - ys[0] - 2 * Number(rmB.match(/r="([\d.]+)"/)[1]) >= 6, 'H12: counter rows at least 6 mm apart');
    ok(renderCell(rm, ctxL('wrong', { wrong: { value: '5 R 4' } })).includes('>5<') && renderCell(rm, ctxL('wrong', { wrong: { value: '5 R 4' } })).includes('>4<'), 'a wrong "q R r" is split into its two boxes');
    // Number line: labels never under 8 pt, start marked, jumps only on the key, answer in the box.
    const nl = T('number-line', { max: 20, start: 7, add: 9 });
    const nlB = renderCell(nl, ctxL());
    const fsz = Math.min(...[...nlB.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1])));
    ok(fsz >= 8 * 25.4 / 72, `TY-11: number-line labels at least 8 pt (${(fsz * 72 / 25.4).toFixed(1)} pt)`);
    ok(nlB.includes('data-nl-start="7"') && !/<path d="M[\d.]+ [\d.]+ Q/.test(nlB), 'RP-1: the pupil line marks the start and draws no jumps');
    const nlK = renderCell(nl, ctxL('answered'));
    eq((nlK.match(/<path d="M[\d.]+ [\d.]+ Q/g) || []).length, 9, 'the key draws nine jumps');
    ok(/data-ws-slot="answer"[^>]*>(<span[^>]*>)16/.test(nlK) && !/Answer:/.test(nlK), 'AK-1: the key writes 16 in the pupil\'s own box');
    // Fact family and cloze: one box per fact / per addend, nothing wraps, the bank is in the cell.
    const ff = renderCell(T('fact-family', { a: 8, b: 3 }), ctxL());
    // The pupil writes each fact: one number printed to fix the order, the other two boxes.
    eq(slotIds(ff), ['f0b', 'f0', 'f1b', 'f1', 'f2a', 'f2', 'f3a', 'f3'], 'fact family: two boxes per fact, the anchor number printed');
    eq(slotIds(renderCell(T('fact-family', { a: 8, b: 3, given: 'none' }), ctxL())).length, 12, 'fact family given none: every number a box');
    eq(slotIds(renderCell(T('fact-family', { a: 8, b: 3, given: 'answer' }), ctxL())), ['f0', 'f1', 'f2', 'f3'], 'fact family given answer: one box per fact');
    eq(Object.keys(cellAnswerKey(T('fact-family', { a: 8, b: 3 })).slots).length, 8, 'fact family: every box keyed');
    eq(cellAnswerKey(T('fact-family', { a: 8, b: 3 })).value, '11, 11, 3, 8', 'fact family: the value is the four answers (q.ans)');
    {
        const wrong = { value: '11, 11, 4, 8' };
        const pupil = renderCell(T('fact-family', { a: 8, b: 3, fix: 'line' }), ctxL('wrong', { wrong }));
        const keyed = renderCell(T('fact-family', { a: 8, b: 3, fix: 'line' }), ctxL('wrong', { wrong, options: { fixKey: true } }));
        eq(slotIds(pupil).filter((id) => /^x/.test(id)), ['x0', 'x1', 'x2', 'x3'], 'fact family fix: one fix box per fact (H9)');
        ok(/data-ws-slot="x2"[^>]*>(<[^>]*>)*3</.test(keyed) && /data-ws-slot="x0"[^>]*><\/span>/.test(keyed), 'fact family fix: the key fills only the wrong fact\'s fix box');
    }
    ok(/grid-template-columns:auto 1em auto 1em auto;[^"]*white-space:nowrap/.test(ff), 'every fact is one unbreakable grid row');
    const cz = renderCell(T('cloze-bank', { sum: 12, a: 5, b: 7, banks: [[3, 5, 8], [2, 6, 7]] }), ctxL());
    eq(slotIds(cz), ['a', 'b'], 'exactly one blank per addend');
    ok(cz.includes('<span>8</span>') && cz.includes('<span>6</span>'), 'both banks print inside the cell');
    // Screen twins carry the markers screen-cell.js wires.
    const tw = (q) => renderCell(q, { mode: 'screen', static: true, size: 'L', state: 'blank' });
    ok((tw(ld).match(/data-mq-cell/g) || []).length === 3, 'division twin: three typed quotient boxes');
    ok(/data-mq-blank="box"/.test(tw(nl)), 'number-line twin: the answer box takes the input');
    ok(/data-mq-join=" R "/.test(tw(rm)) && (tw(rm).match(/data-mq-cell/g) || []).length === 2, 'remainder twin: two boxes joined " R "');
    ok(/area-model-input/.test(tw(am)) && /area-model-total/.test(tw(am)), 'area-model twin keeps the checker classes');
    // Number track: a long track wraps to two rows; `shown` prints a value in every state.
    const sq = T('seqstrip', { values: [10, 20, 30, 40, 50], blanks: [1, 3] });
    ok(/flex-wrap:nowrap/.test(renderCell(sq, ctxL())), 'seqstrip: five tiles stay one row');
    ok(cellFootprint(sq, resolveCtx(ctxL())).wMm <= 93 && cellFootprint(sq, resolveCtx(ctxL())).maxCols === 2, 'seqstrip: five tiles fit a 2-column cell');
    ok(/flex-wrap:wrap;[^"]*max-width:/.test(renderCell(T('seqstrip', { values: [2, 4, 6, 8, 10, 12, 14, 16], blanks: [2] }), ctxL())), 'seqstrip: eight tiles wrap to two rows');
    const sqShown = renderCell(T('seqstrip', { values: [10, 20, 30, 40, 50], blanks: [1, 3], shown: { 2: 35, 3: 41 } }), ctxL());
    ok(/data-ws-shown="1"[^>]*>35</.test(sqShown) && !/>30</.test(sqShown), 'seqstrip shown: a given tile prints the shown (wrong) value');
    ok(/data-ws-slot="b0"[^>]*><\/span>/.test(sqShown), 'seqstrip shown: an unshown blank stays empty on the pupil page');
    ok(/data-ws-slot="b1" data-ws-shape="box" data-ws-ink="solid" data-ws-shown="1"[^>]*>41</.test(sqShown), 'seqstrip shown: a blank holds the finished work in solid ink');
    // Drawing-fix slot: an empty mat / frame under the work; the key fills it with the right model.
    for (const [tpl, pay] of [['base10', { target: 34, fix: 'draw' }], ['tenframe', { target: 7, fix: 'draw' }]]) {
        const q = T(tpl, pay);
        const wrongPupil = renderCell(q, ctxL('wrong', { wrong: { value: tpl === 'base10' ? 43 : 6 } }));
        const wrongKey = renderCell(q, ctxL('wrong', { wrong: { value: tpl === 'base10' ? 43 : 6 }, options: { fixKey: true } }));
        eq(slotIds(wrongPupil), ['answer', 'fix'], `${tpl} fix: the work slot and the fix slot`);
        ok(/Fix it:/.test(wrongPupil), `${tpl} fix: the fix zone is captioned`);
        const fixPart = (h) => h.slice(h.indexOf('data-ws-slot="fix"'));
        ok(!/data-k2-sym|<circle/.test(fixPart(wrongPupil)), `${tpl} fix: the fix zone is empty on the pupil page`);
        ok(/data-k2-sym|<circle/.test(fixPart(wrongKey)), `${tpl} fix: the key draws the right model in the fix zone`);
        eq(cellAnswerKey(q).slots.fix.value, String(pay.target), `${tpl} fix: the fix slot is keyed`);
        ok(!/Fix it:/.test(renderCell(T(tpl, { target: pay.target }), ctxL())), `${tpl}: no fix zone without the flag`);
    }
    /* ---- 2026-09-25 regrade 2: template defects ---- */
    {
        // Ringable counters: runs of the group size, >= 4 mm between counters in a run.
        const pts = (h) => [...h.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) => ({ x: +m[1], y: +m[2], r: +m[3] }));
        const runsOk = (h, size) => {
            const p = pts(h);
            const rows = [...new Set(p.map((c) => c.y))];
            // Within a line, gaps are either the in-run gap (>= 4 mm) or the run gap (wider).
            return rows.every((y) => {
                const xs = p.filter((c) => c.y === y).map((c) => c.x).sort((a, b) => a - b);
                return xs.slice(1).every((x, k) => x - xs[k] - 2 * p[0].r >= 4 - 0.01);
            }) && p.length > 0 && size > 0;
        };
        const rmPic = renderCell(T('remainder', { dividend: 23, divisor: 5 }), ctxL());
        ok(runsOk(rmPic, 5), 'H12: remainder counters sit >= 4 mm apart in runs');
        const lay = groupRuns(23, 5, { d: 5.5, gap: 4, runGap: 9 });
        eq(lay.runs, 5, 'groupRuns: 23 in runs of 5 is five runs (the last the remainder)');
        ok(lay.pts[5].cx - lay.pts[4].cx >= 9 + 5.5 - 0.01 || lay.pts[5].cy > lay.pts[4].cy, 'groupRuns: a wider gap (or a new line) between two runs');
        ok(runsOk(renderCell(T('counters', { kind: 'share', n: 12, size: 4, ans: 3 }), ctxL()), 4), 'H12: share counters in runs of the group size');
        // Number line: full width, labels >= 12 pt.
        const nl10 = renderCell(T('number-line', { max: 10, start: 3, add: 4 }), ctxL());
        const nlW = Number(nl10.match(/viewBox="0 0 ([\d.]+)/)[1]);
        ok(nlW >= 170, `number line spans a one-column cell (${nlW} mm)`);
        const lab = Math.min(...[...nl10.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1])));
        ok(lab * 72 / 25.4 >= 12 - 0.01, `number line labels >= 12 pt (${(lab * 72 / 25.4).toFixed(1)} pt)`);
        const ticks = [...nl10.matchAll(/<text x="([\d.]+)"/g)].map((m) => Number(m[1]));
        ok(ticks[1] - ticks[0] >= 10, `a 0-10 line has ticks >= 10 mm apart (${(ticks[1] - ticks[0]).toFixed(1)} mm)`);
        // Multiplication chart: a writing box >= 14 mm at L, and the key's 3-digit product fits it.
        const mcB = renderCell(T('mult-chart', { r0: 9, c0: 8, blanks: [{ i: 3, j: 4 }] }), ctxL());
        const boxEm = Number(mcB.match(/data-ws-slot="mc0"[^>]*width:([\d.]+)em/)[1]);
        ok(boxEm * 0.68 * 28 * 25.4 / 72 >= 14 - 0.05, `mult chart: the writing box is >= 14 mm at L (${(boxEm * 0.68 * 28 * 25.4 / 72).toFixed(1)} mm)`);
        // Area model: every flex row carries the no-wrap class the worksheet CSS exempts.
        ok((renderCell(am, ctxL()).match(/class="area-model-total-row"/g) || []).length >= 4, 'area model: its flex rows are exempt from the worksheet wrap rule');
        // Chart window: numbers in a fixed line box; the window clears the item letter.
        const cw = renderCell(T('chartwindow', { rows: [3, 4, 5], cols: [2, 3, 4, 5, 6], blanks: [45, 57] }), ctxL());
        ok(/<td[^>]*><span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">44<\/span>/.test(cw), 'chart window: a printed number sits in a fixed line box');
        ok(/k2-chart[^>]*margin:4\.5mm auto 0/.test(cw), 'chart window: the window clears the item letter');
        // Word picture: the work box is named.
        ok(/Draw or work here/.test(renderCell(T('wordpic', { lines: ['Ann has 2.', 'Ben has 3.', 'How many?'], a: 2, b: 3, shape: 'ball', unit: 'balls', ans: 5 }), ctxL())), 'word picture: the work box is labelled');
        // Basic addition with regrouping: a practice page draws the stack with its carry strip,
        // a fact-rows page keeps the fact.
        const ad = T('fact', { a: 19, b: 19, op: '+', notation: 'vertical', digits: 3 });
        ok(/class="rg/.test(renderCell(ad, ctxL('blank', { options: { factColumns: 3 } }))), 'VA-10: add within 100 on a 3-column page has a carry strip');
        ok(/class="ws-fact"/.test(renderCell(ad, ctxL('blank', { options: { factColumns: 5 } }))), 'a fact-rows page keeps the fact');
        ok(/class="ws-fact"/.test(renderCell(T('fact', { a: 7, b: 9, op: '+', digits: 2 }), ctxL('blank', { options: { factColumns: 3 } }))), 'an addition fact within 20 stays a fact');
        // Cloze: the same tracks in every item; banks >= 16 pt, regular weight.
        const czA = renderCell(T('cloze-bank', { sum: 12, a: 5, b: 7, banks: [[3, 5, 8], [2, 6, 7]] }), ctxL());
        const czB = renderCell(T('cloze-bank', { sum: 9, a: 4, b: 5, banks: [[1, 4, 6], [2, 5, 8]] }), ctxL());
        const widths = (h) => [...h.matchAll(/width:([\d.]+)em;flex:none/g)].map((m) => m[1]).join(',');
        eq(widths(czA), widths(czB), 'cloze: the box, +, box, = and sum tracks are the same in every item');
        const bankEm = Number(czA.match(/class="cz-bank"[^>]*font-size:([\d.]+)em/)[1]);
        ok(bankEm * 28 >= 16 - 0.05 && /class="cz-bank"[^>]*font-weight:400/.test(czA), `cloze: bank numbers >= 16 pt, regular weight (${(bankEm * 28).toFixed(1)} pt)`);
        // TY-4 on key ink.
        ok(/data-ws-ink="solid" style="[^"]*font-feature-settings:'cv04' 1/.test(renderCell(T('remainder', { dividend: 19, divisor: 3 }), ctxL('answered'))), 'TY-4: key ink keeps "cv04"');
    }
}

/* ===================================================================== small words */

eq(levelLine(['K']), 'Level K', 'HD-5: Level K');
eq(levelLine([2, '3']), 'Level 2-3', 'HD-5: a level range');
eq(levelLine(['M']), 'All levels', 'HD-5: a multi-level skill');
eq(sectionInstructionKey(['add', 'add']), 'add', 'BD-13: one key');
eq(sectionInstructionKey(['multiply', 'divide']), 'mixed-ops', 'BD-13: x and / mixed');
eq(instructionHtml('mixed-sign', 'Add or subtract. Look at the _sign_.'), '<div class="ws-instrline" data-ws-instruction="mixed-sign">Add or subtract. Look at the <u>sign</u>.</div>', 'BD-14: the underlined word of a library string');

/* ================================================ the lesson (roles/lesson.js, 2026-09-25) */
{
    const L = ROLE_MODULES.lesson;
    ok(!!L && typeof L.plan === 'function' && typeof L.extras === 'function', 'lesson: a role module with plan and extras');
    // Worked steps: one state each, a closing check rides with the state before it, at most 4.
    const st = (m) => ({ text: 't', marks: m ? [{ slot: 'ones', value: '1' }] : [] });
    eq(L.stateGroups([st(1), st(1), st(1), st(1), st(0)]).length, 4, 'lesson: a closing check joins the last state');
    eq(L.stateGroups([st(0), st(0), st(1)]).length, 3, 'lesson: every step before the last mark is a state');
    eq(L.stateGroups([st(1), st(1), st(1), st(1), st(1), st(1)]).length, 4, 'lesson: at most 4 states');
    eq(JSON.stringify(L.chartLayout(4)), JSON.stringify({ cols: 2, rows: 2, variant: 'col' }), 'lesson: 4 steps make a 2 x 2 chart');
    eq(L.chartLayout(3).variant, 'row', 'lesson: 3 steps make full-width rows');
    eq(L.tagLine({ skillId: 'nearest_10', grade: '3', ccss: ['3.NBT.1'], ee: ['M.EE.3.NBT.1'] }), 'nearest_10 · Grade 3 · 3.NBT.1 · EE M.EE.3.NBT.1', 'lesson: the footer tag line');
    eq(L.tagLine({ skillId: 'x', grade: 'PK', ccss: [], ee: [] }), 'x · Grade PK', 'lesson: no CCSS code is invented');
    eq(L.packetParts({ practicePages: 2, mixed: true }).map((p) => p.part).join(), 'teach,practice,mixed', 'lesson: the packet parts in order');
    eq(L.packetParts({ practicePages: 0 }).map((p) => p.part).join(), 'teach', 'lesson: no practice pages when none are asked');
    // The vocabulary words never sit under their own picture.
    for (const seed of [0, 1, 7, 42]) ok(L.vocabOrder(3, seed).every((v, i) => v !== i), `lesson: vocabulary order is a derangement (seed ${seed})`);
    // The column-subtraction provider: its marks write the example's answer.
    const p = getProvider('subtraction', 'sub_100_regroup');
    const ws = p.workedSteps({ a: 67, b: 18, ans: 49, text: '67 − 18 = ?' });
    ok(ws.some((s) => s.marks.some((m) => m.slot === 'strike:tens')) && ws.some((s) => s.marks.some((m) => m.slot === 'regroup:ones' && m.value === '17')), 'provider sub_100_regroup: the regroup step crosses out and writes 5 tens 17 ones');
    eq(ws.flatMap((s) => s.marks).filter((m) => m.slot === 'tens' || m.slot === 'ones').map((m) => m.value).join(''), '94', 'provider sub_100_regroup: the ones 9 then the tens 4');
    eq(p.wrongAnswer({ a: 67, b: 18, ans: 49, text: '67 − 18 = ?' }) !== null, true, 'provider sub_100_regroup: a misconception answer');
    // Lessons r1 / AK-2 over VA-13: the key's regroup working.
    const w1 = regroupWorking({ op: '-', a: 67, b: 18 }, 3);
    eq(`${w1.vals[1]}|${w1.vals[2]}|${!!w1.strikes[1]}|${!!w1.strikes[2]}`, '5|17|true|true', 'key working: 67 - 18 writes 5 over the crossed 6 and 17 over the crossed 7');
    const w2 = regroupWorking({ op: '-', a: 500, b: 238 }, 4);
    eq(`${w2.vals[1]}|${w2.vals[2]}|${w2.vals[3]}`, '4|9|10', 'key working: 500 - 238 regroups through the 0 (4, 9, 10)');
    eq(regroupWorking({ op: '-', a: 58, b: 23 }, 3).vals.filter(Boolean).length, 0, 'key working: no regroup, nothing written');
    const w3 = regroupWorking({ op: '+', operands: [58, 37, 45, 65] }, 4);
    eq(`${w3.vals[1] || ''}|${w3.vals[2] || ''}`, '2|2', 'key working: 58 + 37 + 45 + 65 carries 2 and 2');
    const k = cellAnswerKey({ cell: { template: 'stack', payload: { a: 67, b: 18, op: '-', check: true } } });
    eq(`${k.slots['check-ans'].value}|${k.slots['check-sum'].value}|${k.slots['regroup-2'].value}`, '49|67|17', 'stack key: the Check line and the regroup box are filled');
    // The lesson's second example: never the example's own numbers turned round.
    const fq = (a, b) => ({ q: { a, b, op: '+', text: `${a} + ${b} = ?`, cell: { template: 'fact', payload: { a, b, op: '+' } } }, template: 'fact' });
    ok(L.CASE_TESTS.bigSecond(fq(2, 5)) && !L.CASE_TESTS.bigSecond(fq(5, 2)), 'lesson: the big-number-second case');
    // Lessons r2: the three rounding cases (up, down, ends in 5), for the chart and the Guided set.
    const rq = (n) => ({ q: { text: `Round ${n} to the nearest 10.`, cell: { template: 'pv', payload: { kind: 'round', n, place: 10 } } }, template: 'pv' });
    eq([77, 42, 35, 71, 50].map((n) => ['roundUp', 'roundDown', 'endsFive'].filter((t) => L.CASE_TESTS[t](rq(n))).join('+') || '-').join(' '),
        'roundUp roundDown endsFive - -', 'lesson: 77 rounds up, 42 down, 35 ends in 5; 71 and 50 are none of the three');
    const pool = [77, 42, 35, 86, 23, 65].map(rq);
    const data = { second: { test: 'roundDown' }, third: { test: 'endsFive' }, guided: ['roundUp', 'roundDown', 'endsFive'] };
    const ex2 = L.pickSecond(pool, pool[0], data);
    const ex3 = L.pickSecond(pool, pool[0], data, 'third', [ex2]);
    ok(L.CASE_TESTS.roundDown(ex2) && L.CASE_TESTS.endsFive(ex3) && ex2 !== ex3, 'lesson: the chart\'s second and third examples are the other two cases');
    const gd = L.pickWeDo(pool.filter((x) => x !== ex2 && x !== ex3), pool[0], data, 3);
    eq(gd.map((x) => ['roundUp', 'roundDown', 'endsFive'].find((t) => L.CASE_TESTS[t](x))).join(','), 'roundUp,roundDown,endsFive', 'lesson: the rounding Guided set is up, down, ends in 5');
    // The Guided tens boxes are writing places: as tall as the answer strip (12 mm at L).
    const box = /<rect[^>]*height="([\d.]+)"/.exec(L.roundLineSvg({ lo: 40, hi: 50, n: 47, r: 50, lineMm: 34, boxHmm: 12, boxDigits: 3, emptyTens: true }));
    eq(box && Number(box[1]), 12, 'lesson: a Guided tens box is 12 mm tall at L');
    // VA-4 / AK-1: the open answer zone is a real row, so the pupil page and the key share one layout.
    ok(/class="ansrow"/.test(stack('67', '18', '-', { answer: 'open' })) && /class="an"/.test(stack('67', '18', '-', { answer: 'solid', ans: 49 })),
        'stack: the open answer row is reserved on the pupil page; the key writes into a row of the same height');
    const chk = renderCell({ cell: { template: 'stack', payload: { a: 67, b: 18, op: '-', check: true } } }, resolveCtx({ mode: 'print', size: 'L', state: 'blank' }));
    ok(/ws-checkrow"><b>Check:<\/b><span class="ws-checkeq">/.test(chk), 'stack: the Check sum is one group (it wraps under "Check:" in a narrow cell)');
    // Lessons r3: the subtract chart's one-place take-away from a 0 in the ones, the 90s -> 100.
    const sq = (a, b) => ({ q: { a, b, op: '-', text: `${a} − ${b} = ?`, cell: { template: 'stack', payload: { a, b, op: '-' } } }, template: 'stack' });
    eq([sq(70, 8), sq(70, 23), sq(67, 9)].map((x) => L.CASE_TESTS.takeAwayZero(x)).join(','), 'true,false,false', 'lesson: 70 - 8 is the take-away-from-0-ones case; 70 - 23 and 67 - 9 are not');
    eq([98, 95, 94, 77].map((n) => L.CASE_TESTS.toHundred(rq(n))).join(','), 'true,true,false,false', 'lesson: 98 and 95 round to 100; 94 and 77 do not');
    // The count-on hops: the start number and one arc and number for each number counted on.
    const hops = L.hopsSvg(7, 2, 'trace');
    eq((hops.match(/<text/g) || []).length, 3, 'lesson: count on 2 from 7 draws 7, 8, 9');
    ok(/>7<\/text>/.test(hops) && />9<\/text>/.test(hops) && (hops.match(/data-ws-ink="trace"/g) || []).length === 2, 'lesson: the counted numbers are grey on their step, the start number black');
    // THE LESSON RULES (design/LESSON_RULES.md, sheet/lesson-rules.js).
    eq(LR.itemKey('9 + 1 = ?', '10'), LR.itemKey('1 + 9 = ?', '10'), 'LR-5: a turnaround is the same item');
    ok(LR.itemKey('Which place?', 'tens', 78) !== LR.itemKey('Which place?', 'tens', 42), 'LR-5: a place-value item is keyed by its number');
    ok(LR.nearTwins([51, 44], [53, 45]) && LR.nearTwins([27, 19], [77, 19]) && !LR.nearTwins([52, 39], [70, 23]), 'LR-6: near twins');
    eq(LR.casesOf({ text: '36 − 29 = ?', ops: [36, 29] }).join(','), 'twoPlace,underTen', 'LR-1: 36 - 29 is a two-place take-away with an answer under 10');
    eq(LR.casesOf({ text: '60 − 3 = ?', ops: [60, 3] }).join(','), 'onePlace,zeroOnes', 'LR-1: 60 - 3 is one-place, 0 in the ones');
    eq(LR.casesOf({ kind: 'round', n: 98, place: 10, text: 'Round 98' }).join(','), 'roundUp,toHundred', 'LR-1: 98 rounds up to 100');
    const pk = (part, text, ops, ans) => ({ part, skill: 'subtraction:sub_100_regroup', text, ops, ans });
    const V = LR.packetViolations({
        lesson: { skill: 'subtraction:sub_100_regroup', cases: ['twoPlace', 'onePlace', 'zeroOnes', 'underTen'], caps: { onePlace: 1, underTen: 2 } },
        placed: [pk('chart', '52 − 39 = ?', [52, 39], '13'), pk('practice', '52 − 39 = ?', [52, 39], '13'), pk('practice', '62 − 59 = ?', [62, 59], '3'),
            pk('practice', '64 − 59 = ?', [64, 59], '5'), pk('practice', '31 − 25 = ?', [31, 25], '6'), pk('practice', '100 − 47 = ?', [100, 47], '53')],
        chartCases: ['twoPlace'],
    }).map((v) => v.rule);
    ok(['LR-1', 'LR-2', 'LR-5', 'LR-6', 'LR-7'].every((r) => V.includes(r)), `LR: a packet breaking five rules is caught (${[...new Set(V)].join(', ')})`);
    // LR-10: the packet prints at its one size, whatever was asked.
    eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'M', packetSize: 'L' }).map((v) => v.rule).join(','), 'LR-10', 'LR-10: a packet printed off its one size fails');
    eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'L', packetSize: 'L' }).length, 0, 'LR-10: a packet at its size passes');
    // LR-16 (owner ruling 2026-09-26): an item keeps its template's floor; the page keeps its size.
    eq([atLeastSize('S', 'M'), atLeastSize('M', 'M'), atLeastSize('L', 'M'), atLeastSize('S', null)].join(','), 'M,M,L,S', 'LR-16: atLeastSize lifts only below the floor');
    const rg = { cell: { template: 'stack', payload: { a: 67, b: 18, op: '-' } } };
    const plain = { cell: { template: 'stack', payload: { a: 67, b: 18, op: '-', regroup: false } } };
    const at = (q, size, mode = 'print') => resolveCtx({ mode, size, state: 'blank' });
    ok(/data-ws-floor="M"/.test(renderCell(rg, at(rg, 'S'))), 'LR-16: a regroup stack at S is drawn at its M floor');
    ok(!/data-ws-floor/.test(renderCell(rg, at(rg, 'L'))) && !/data-ws-floor/.test(renderCell(rg, at(rg, 'M'))), 'LR-16: at M and L the regroup stack is drawn at the page size');
    ok(!/data-ws-floor/.test(renderCell(plain, at(plain, 'S'))), 'LR-16: a stack with no regroup boxes follows S');
    ok(!/data-ws-floor/.test(renderCell(rg, at(rg, 'S', 'screen'))), 'LR-16: the floor is a print rule (screen cells size themselves)');
    const fS = cellFootprint(rg, at(rg, 'S')), fM = cellFootprint(rg, at(rg, 'M')), fP = cellFootprint(plain, at(plain, 'S'));
    eq(fS.minSize, 'M', 'LR-16: the regroup stack declares minSize M in its footprint');
    ok(Math.abs(fS.hMm - fM.hMm) < 0.01 && fP.hMm < fS.hMm, `LR-16: the floored item takes its M footprint (${fS.hMm.toFixed(1)} = ${fM.hMm.toFixed(1)} mm; plain S ${fP.hMm.toFixed(1)} mm)`);
}

/* ======================================================================= report */

if (fails.length) {
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(`ws-layout-unit: FAIL (${fails.length} of ${pass + fails.length})`);
    process.exit(1);
}
console.log(`ws-layout-unit: OK (${pass} assertions)`);
