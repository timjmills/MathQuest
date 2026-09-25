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
    stackCapacity, visualGridCapacity, resolveSectionLayout, cellWidthMm, paperOf,
} from '../../js/modules/sheet/layout.js';
import { paginate, labelStarts, scoreDenominator, placeSections } from '../../js/modules/sheet/paginate.js';
import { plan as independentPlan } from '../../js/modules/sheet/roles/independent.js';
import { plan as morePracticePlan, letterSeed } from '../../js/modules/sheet/roles/more-practice.js';
import {
    renderPlan, sectionInstructionKey, instructionHtml, levelLine, estimateTitleLines,
} from '../../js/modules/sheet/roles/practice.js';
import { ROLE_IDS, ROLE_MODULES, ROLE_ALIASES } from '../../js/modules/sheet/roles/index.js';
import { renderCell, cellAnswerKey, cellFootprint, resolveCtx } from '../../js/modules/sheet/index.js';

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
    text: `${a} ${op} ${b} = ?`, ans: op === '+' ? a + b : a - b,
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
    ok(/height:151\.33\dmm/.test(r.pupilPages[2]), 'PT-ENG-6: a rebalanced page keeps the section\'s cell height (2 x 75.67 mm)');
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

eq(Object.keys(ROLE_MODULES).length, 14, 'roles/index.js carries the fourteen P7.2b role modules');
ok(Object.keys(ROLE_MODULES).every((id) => ROLE_IDS.includes(id)), 'ROLE_IDS lists every P7.2b role');
eq(ROLE_ALIASES.model, 'scripted-model', 'the print screen\'s "model" names the Scripted Model role');

// AK-1 / PT-KEY-7 for every role: the key is the pupil page, cell for cell and page for page.
for (const id of ['opener', 'scripted-model', 'guided', 'error-analysis', 'review', 'test', 'pre-skill-check', 'word-problems', 'true-false', 'reason-it', 'stretch']) {
    const res = hostPlan(id, [ADD_SKILL], addMake);
    ok(res.plan && res.r.pupilPages.length >= 1, `${id}: composes at least one page`);
    eq(res.r.keyPages.length, res.r.pupilPages.length, `AK-1 ${id}: as many key pages as pupil pages`);
    eq(res.r.keyPages.map(cellsOf), res.r.pupilPages.map(cellsOf), `AK-1 ${id}: the key has the pupil page's cells, page for page`);
    // PT-KEY-7: a page with nothing to answer (the Scripted Model) is its own key.
    ok(res.plan.nothingToAnswer || res.r.keyPages.every((pg) => pg.includes('Answer Key')), `AK-3 ${id}: every key page says Answer Key`);
    ok(!res.r.pupilPages.some((pg) => /undefined|NaN|\[object Object\]/.test(pg.replace(/<style[\s\S]*?<\/style>/g, ''))), `${id}: no undefined / NaN / [object Object] printed`);
}

// PT-GDP-1: Guided - unlabelled, unscored, cell 1 traced in grey, at most 6 cells at L.
{
    const { plan, r } = hostPlan('guided', [ADD_SKILL], addMake);
    ok(plan.meta.items <= 6 && plan.meta.items >= 3, 'PT 2.3: Guided at L holds 3 to 6 cells (ceiling 6)');
    eq(plan.header.score, false, 'PT-FRM-4: Guided prints no Score');
    ok(!/data-ws-label="letter"/.test(r.pupilHtml), 'PT-LBL-6: Guided cells are unlabelled');
    ok(/data-ws-ink="trace"/.test(r.pupilPages[0]), 'PT-GDP-1: cell 1 carries its answer in trace grey');
    ok(/Steps:/.test(r.pupilHtml) && /Guided Practice:/.test(r.pupilHtml), 'PT 2.3: a Steps band over the Guided Practice band');
}
// PT-OPN-1: the Opener bands in their fixed order; Say band on by default.
{
    const { plan, r } = hostPlan('opener', [ADD_SKILL], addMake);
    const order = ['Model:', 'Steps:', 'Say:', 'Guided Practice:'].map((w) => r.pupilHtml.indexOf(`<b>${w}</b>`));
    ok(order.every((i) => i > 0) && order.every((v, i) => !i || v > order[i - 1]), 'PT-OPN-1: Model, Steps, Say, Guided in that order');
    eq(plan.header.score === false ? 0 : plan.header.score, plan.meta.independent, 'PT-OPN-7: Score counts the Independent rows only');
}
// PT-MOD-1 / PT-MOD-4: one state per step, the Say band filled in, nothing to answer.
{
    const { plan, r } = hostPlan('scripted-model', [ADD_SKILL], addMake);
    ok(plan.nothingToAnswer === true, 'PT-KEY-7: the Scripted Model page is its own key');
    ok(plan.meta.states >= 3, 'PT-MOD-1: at least three states');
    ok(/plus/.test(r.pupilHtml) && /equals/.test(r.pupilHtml), 'PT-MOD-4: the Say band is filled for this problem');
}
// PT-ERR-1 / PT-TOF-1: 40 to 60% wrong; the key checks the right box on every item.
for (const id of ['error-analysis', 'true-false']) {
    const { plan, r } = hostPlan(id, [ADD_SKILL], addMake);
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
    eq(plan.meta.items, 2, 'PT 3.7 v2: two word problems per page at L');
    ok(/data-ws-instruction="story-v2"/.test(r.pupilHtml), 'PT 3.7: the story-v2 instruction');
    ok(/>apples</.test(r.keyHtml), 'PT-WPR-8: the key writes the label word');
}
// PT-CMP-2: the fact layouts take fact skills only, and say why otherwise.
{
    ok(typeof hostPlan('fact-rows', [ADD_SKILL], addMake).unsupported === 'string', 'PT-CMP-2: Fact rows refuse a non-fact skill, with a reason');
    ok(typeof hostPlan('fact-probe', [ADD_SKILL], addMake).unsupported === 'string', 'PT-CMP-2: the Fact probe refuses a non-fact skill');
    const fr = hostPlan('fact-rows', [FACT_SKILL], (pool, sk, i) => factQ(2 + (i % 11), 3), { h: 30 });
    eq(fr.plan.pages[0].sections.find((s) => s.kind === 'grid').cols, 5, 'PT-FRW-2: Fact rows Auto 5 columns at L');
    eq(fr.plan.header.title, 'Multiply by 3', 'HD-13: the fact stub title');
    eq(fr.plan.ctx.look, 'daily', 'PAGE_TYPES appendix 4: Fact rows default to the Daily look');
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

/* ===================================================================== small words */

eq(levelLine(['K']), 'Level K', 'HD-5: Level K');
eq(levelLine([2, '3']), 'Level 2-3', 'HD-5: a level range');
eq(levelLine(['M']), 'All levels', 'HD-5: a multi-level skill');
eq(sectionInstructionKey(['add', 'add']), 'add', 'BD-13: one key');
eq(sectionInstructionKey(['multiply', 'divide']), 'mixed-ops', 'BD-13: x and / mixed');
eq(instructionHtml('mixed-sign', 'Add or subtract. Look at the _sign_.'), '<div class="ws-instrline" data-ws-instruction="mixed-sign">Add or subtract. Look at the <u>sign</u>.</div>', 'BD-14: the underlined word of a library string');

/* ======================================================================= report */

if (fails.length) {
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(`ws-layout-unit: FAIL (${fails.length} of ${pass + fails.length})`);
    process.exit(1);
}
console.log(`ws-layout-unit: OK (${pass} assertions)`);
