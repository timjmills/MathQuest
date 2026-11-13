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
    hMinAt, splitByWidth,
} from './compose.js';
import { groupByHeight, rowShape, rowGapFor, SAFETY_H_MM, FILL_CAP, fillLimit, tightRows, IN_PLACE_FILL, measuredH } from '../layout.js';
import { GRID_BORDERS_MM } from './practice.js';

export const ROLE_ID = 'test';
const CEILING = { S: 20, M: 16, L: 12 };
const DENSE = CEILING;          // 12.1 is law: 20 / 16 / 12 (L-DENSITY holds it)

// (lane lf-ops critic r1 D-CB-3: a Test draws at scaffold level 0 - hints dropped, P-7 - but its cells were measured at
// level 1, so a count row's times labels kept their room: a 39-45 % empty band in every row. Measured as drawn.)
export const MEASURE_LEVEL = 0;
export const sources = (skills) => [{ id: 'main', skills }];
// (critic r7 R7-1: a supported div_facts Test takes its Independent page's grid, up to 5 columns of drawn arrays at S)
export const measureCols = (ctx) => (ctx && ctx.divSupported ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]);

/**
 * 12.1: a Test of one-line items holds its ceiling (20 / 16 / 12) when that many rows of them fit
 * the grid (critic R2 D-B: div_facts Standard printed 18 of 20 at S - 3 x 6 - and 10 of 12 at L,
 * the two-column row step-down, leaving 32-41 % of the page blank). The last row may be short
 * (PG-15's unruled blank run closes it). The rows then take the grid's height up to the point
 * where the page strip under them is under a fifth (PG-14), each cell at least its measured
 * height; an explicit column count from the teacher is left alone (DN-12).
 */
/** div_facts Test rows: the measured height (pads and tab keep-out included) plus this room (critic r5 R5-1; 1.15 -> 1.1, the
 *  Independent bare-fact rows, lead / owner 2026-11-09 on critic r7 R7-1). */
const FACT_TEST_ROOM = 1.1;
/** div_facts Test ceiling: the Independent page's capacity (DN-1's 36 / 24 / 20; owner 2026-11-08 on critic r6 R6-1). */
const FACT_TEST_PAGE = { S: 36, M: 24, L: 20 };
/** div_facts Test rows under the 2026-11-09 ruling (every support's Test = its Independent count): 1.1 x the measured height. */
const FACT_TEST_ROOM_EQ = FACT_TEST_ROOM;
/** Does a planned item draw a support (print-sheet hostItem's supportsBox: a support pane, row or cue in its cell)? */
const itemSupported = (it) => !!(it && it.supportsBox && it.supportsBox.plan);
function fillToCeiling(L, size, columns, opts = {}) {
    const ceil = CEILING[size] || CEILING.L;
    if (!L || (columns && columns !== 'auto') || !(L.hMin > 0) || L.cols < 2) return L;
    const G = L.gridH;
    let rows = L.rows, perPage = L.perPage, note = '';
    // Lane D R4 prep (GRID-EVEN / HOLE, div_facts Test at S / M with the skip support: 20 facts in 3 columns re-laid
    // the 2-cell last row at 1.5 cell widths and moved its answer zone, SCC-T10): the Test fills WHOLE rows - the
    // most rows of `cols` up to the ceiling (3 columns: 18), never a short last row.
    const whole = Math.floor(ceil / L.cols) * L.cols;
    if (perPage < whole && (whole / L.cols) * L.hMin * 1.05 <= G - SAFETY_H_MM) {
        rows = whole / L.cols;
        perPage = whole;
        note = `Test: ${whole} problems, ${L.cols} x ${rows} (12.1).`;
    }
    // PG-14: the rows take the grid down to a strip of under a fifth of it - never past the even
    // share, and never shorter than the layout made them.
    const even = (G - SAFETY_H_MM) / rows;
    // (an in-place cell - layout.js IN_PLACE_FILL - keeps its capped height: it holds no working space)
    // div_facts critic r5 R5-1 (facts card F1: H13 wins over the PT-TST fixed cells): a Test of div_facts facts sizes its
    // rows to the problems' footprint (FACT_TEST_ROOM x the measured height), never to the grid; the rest of the page stays
    // under the rows. Only div_facts (`opts.footprintRows`): the passed + - x fact Tests keep their geometry.
    if (opts.footprintRows) {
        // Owner ruling 2026-11-08 (critic r6 R6-1, option a): a div_facts fact Test's count follows the Independent page's
        // capacity, so the Test page is full - whole rows of the facts' footprint down the grid, up to the Independent
        // ceiling (FACT_TEST_PAGE), lifting 12.1's 20 / 16 / 12 for these pages only. Rows stay sized to the problems (F1).
        const rowH = L.hMin * FACT_TEST_ROOM;
        const fitRows = Math.floor((G - SAFETY_H_MM - GRID_BORDERS_MM) / rowH + 1e-9);
        const cap = Math.floor((FACT_TEST_PAGE[size] || FACT_TEST_PAGE.L) / L.cols) * L.cols;
        const fitAll = Math.min(cap, fitRows * L.cols);
        if (opts.fullPage && fitAll > perPage) {
            rows = fitAll / L.cols;
            perPage = fitAll;
            note = `Test: ${fitAll} problems, ${L.cols} x ${rows} (the Independent capacity, owner 2026-11-08).`;
        }
        const capH = Math.round(Math.min(even, Math.max(L.hMin, Math.min(L.cellH, L.hMin * FACT_TEST_ROOM))) * 1000) / 1000;
        return Object.assign({}, L, { rows, perPage, cellH: capH, fill: capH >= even - 0.01, note: [L.note, note].filter(Boolean).join(' '), filledTest: true });
    }
    const cellH = Math.round(Math.min(even, L.inPlace ? Math.max(L.cellH, L.hMin) : Math.max(L.cellH, L.hMin * FILL_CAP, 0.85 * G / rows)) * 1000) / 1000;
    if (rows === L.rows && cellH <= L.cellH + 0.01) return L;
    return Object.assign({}, L, { rows, perPage, cellH, fill: cellH >= even - 0.01, note: [L.note, note].filter(Boolean).join(' '), filledTest: true });
}

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
        const divFact = items.every((it) => (it.skillRef ? it.skillRef.skillId === 'div_facts' : /div_facts(?!_)/.test(String(it.skill || ''))));
        const acrossFact = items.every((it) => { const pl = it.q && it.q.cell && it.q.cell.payload; return !!(pl && pl.fact && it.q.cell.template === 'equation' && !pl.notation); });
        // Lead / owner ruling 2026-11-09 (critic r7 R7-1, ws-empty-band EB-TESTEQ): every support's div_facts Test prints the SAME
        // count as its Independent page at each size - the Independent page's grid (its columns, rows and count: the
        // practice layout of these facts) with rows of the facts' footprint and FACT_TEST_ROOM_EQ room (1.1, the Independent
        // bare-fact rows), never past the even share. div_facts across facts only, Auto columns only.
        const Lt = fillToCeiling(resolveSectionLayout({
            role: 'test', columns: input.columns || 'auto', count: count || items.length,
            target: { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } },
            ceiling: CEILING, floor: (input.floors || {}).main,
            dense: { S: 20, M: 20, L: 20 }, denseRoom: 1.05, denseMaxCols: 5,
        }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) }), ctx.size, input.columns,
        { footprintRows: divFact,
            // (R6-1's full page: the one-line across fact only - div_facts' Long division and Fraction forms keep 12.1's ceiling)
            fullPage: acrossFact });
        if (divFact && acrossFact && (!input.columns || input.columns === 'auto')) {
            const Li = resolveSectionLayout({ role: 'independent', columns: 'auto', count: FACT_TEST_PAGE[ctx.size] || FACT_TEST_PAGE.L, floor: (input.floors || {}).main,
                dense: items.some((it) => itemSupported(it)) ? true : FACT_TEST_PAGE },
            items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
            if (Li && Li.cols >= 1 && Li.perPage > 0 && Li.hMin > 0) {
                const n = Math.min(Li.perPage, count || Li.perPage);
                // (the Test's own grid already holds that count: it keeps its grid - the critic-passed off S 4 x 9, L 3 x 6)
                if (Lt.perPage === n) return Lt;
                const rows = Math.max(1, Math.ceil(n / Li.cols));
                const even = (Li.gridH - SAFETY_H_MM - GRID_BORDERS_MM) / rows;
                const cellH = Math.round(Math.min(even, Li.hMin * FACT_TEST_ROOM_EQ) * 1000) / 1000;
                const note = `Test: ${n} problems, ${Li.cols} x ${rows} (the Independent page's count, owner 2026-11-09).`;
                return Object.assign({}, Li, { role: 'test', rows, perPage: n, cellH, fill: cellH >= even - 0.01, note: [Li.note, note].filter(Boolean).join(' '), filledTest: true });
            }
        }
        return Lt;
    }
    const sec = (columns) => ({
        role: 'test', columns, count: count || items.length,
        target: long ? { cols: 2, rows: { S: 3, M: 2, L: 2 } } : { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } },
        ceiling: long ? { S: 6, M: 4, L: 4 } : CEILING, floor: (input.floors || {}).main,
        // Cells sized to the problems (layout.js dense packing): a test of one-line facts in
        // 57 mm cells left ~70% of every cell empty. Never above 12.1's 20 / 16 / 12.
        dense: long ? false : DENSE,
    });
    const L = resolveSectionLayout(sec(input.columns || 'auto'), items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
    // L1 (size S ignored; visual-quality critic r1 F2): an in-place story the Auto margins held to one full-width column
    // (the story beside its sentence, 4 at S against 6 at M) takes two columns when every item's own measurement fits
    // them and they hold more - S never prints fewer than M.
    // (and the other way: a K picture story is far shorter beside its story at full width than stacked in a column, so
    // one column may hold more - 5 at S against 4 in two columns)
    if (L.inPlace && L.cols <= 2 && (!input.columns || input.columns === 'auto')) {
        const other = resolveSectionLayout(sec(L.cols === 1 ? 2 : 1), items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
        const [best, alt] = !other.clamped && other.perPage > L.perPage ? [other, L] : [L, other.clamped ? null : other];
        // P-23: a one-column test's total is 4, 8, 10, 12, 16 or 20 where that still holds more than the other grid
        // (11 rows -> 10; a page under 8 keeps what it holds: 5 stays 5 when two columns hold 4)
        const ok = [20, 16, 12, 10, 8, 4].find((t) => t <= best.perPage);
        const rows = best.cols === 1 && ok >= 8 && ok >= (alt ? alt.perPage : 0) ? ok : best.rows;
        // (lf-placevalue pv debt: fewer rows than the layout filled the grid with are no longer the grid's height - unit form's
        // Test at S, 15 -> 12 rows, kept fill and flexed every row from 15 to 19 mm, 38 % empty under the one line of boxes. A
        // `tightRows` section keeps its rows; the others keep their passed pages.)
        if (rows !== best.rows && tightRows(items)) return Object.assign({}, best, { requested: 'auto', rows, perPage: rows * best.cols, fill: false });
        return Object.assign({}, best, { requested: 'auto', rows, perPage: rows * best.cols });
    }
    return L;
}

const TARGET = { cols: 4, rows: { S: 5, M: 4, L: 4 }, rowsByCols: { 3: 4, 2: 4, 1: 4 } };

/**
 * Wave 1 lane D r12c (RUBRIC H13): a Test whose problems come in two widths - an area model of
 * 1 x 2 parts fits a half column, one of 1 x 3 parts at M and L (or 2 x 3 at S) only a full one -
 * prints them in two groups under its one instruction, as the practice pages do (practice.js
 * splitWide / fineSplit): the narrow problems in their columns, whole rows, and the full-width ones
 * under them, one a row. Before, one full-width problem pulled the whole Test to one column and every
 * narrow model sat in a 185 mm cell more than 30 % empty (area_model_mult Test at M and L).
 * The page keeps the dealt mix: the share of full-width problems is the deal's (at least one), so
 * "Both grids, dealt" stays both grids. Returns null when the Test is one width (or the teacher
 * fixed the columns). {cols, nn, w, hN, hW, narrow, wide, G, perPage, Ln}
 */
function widthSplit(items, input, count) {
    if ((input.columns && input.columns !== 'auto') || items.some((it) => it.fclass === 'long')) return null;
    const ctx = ctxOf(input);
    const sp = splitByWidth(items, ctx);
    if (!sp) return null;
    const { narrow, wide } = sp;
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Test A', title: 'Test A', score: 1 });
    const Ln = resolveSectionLayout({
        role: 'test', columns: 'auto', count: narrow.length, target: TARGET, ceiling: CEILING, dense: DENSE,
    }, narrow, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
    const cols = Ln.cols;
    if (cols < 2) return null;
    const hN = hMinAt(narrow, cols, ctx);
    const hW = hMinAt(wide, 1, ctx);
    if (!Number.isFinite(hN) || !Number.isFinite(hW)) return null;
    const G = Ln.gridH - SAFETY_H_MM;
    const share = wide.length / items.length;
    const ceil = Math.min(CEILING[ctx.size] || CEILING.L, count ? Number(count) : Infinity);
    let best = null;
    for (let N = cols + 1; N <= ceil; N++) {
        const ideal = share * N;
        for (let w = 1; w <= Math.min(wide.length, N - cols); w++) {
            const nn = N - w;
            if (nn % cols || nn > narrow.length) continue;
            const h = (nn / cols) * hN + w * hW + GRID_BORDERS_MM;
            if (h > G) continue;
            const d = Math.abs(w - ideal);
            if (!best || N > best.perPage || (N === best.perPage && d < best.d - 1e-9)) best = { perPage: N, nn, w, d };
        }
    }
    if (!best) return null;
    return { cols, nn: best.nn, w: best.w, hN, hW, narrow, wide, G, perPage: best.perPage, Ln };
}

export function counts(pools, input) {
    const all = pools.main || [];
    const sp = widthSplit(all, input, input.count);
    // A Test of two widths takes its narrow and its full-width problems from a wider deal (the
    // plan prints only what it places), so each group can be filled to whole rows.
    if (sp) return { main: Math.min(40, Math.max(all.length, 3 * sp.perPage)) };
    const L = layout(all, input);
    return { main: input.count ? Math.min(input.count, L.perPage) : L.perPage };
}

/** The two-width Test page (widthSplit): the narrow group's rows, then the full-width rows. */
function planSplit(input, sp, items) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    let nar = sp.narrow.slice(0, sp.nn);
    let wid = sp.wide.slice(0, sp.w);
    // PT-TST-1: Form B is Form A re-ordered under (seed, form), each group in itself.
    if (form === 'B') {
        const r = rng(deriveSeed(input.seed === undefined ? 0 : input.seed, 'test', 'B'));
        nar = shuffle(r, nar);
        wid = shuffle(r, wid);
    }
    nar = groupByHeight(nar, sp.cols);
    const all = nar.concat(wid);
    const rowsN = nar.length / sp.cols;
    const rowHs = [];
    for (let i = 0; i < nar.length; i += sp.cols) rowHs.push(hMinAt(nar.slice(i, i + sp.cols), sp.cols, ctx));
    const wideHs = wid.map((it) => hMinAt([it], 1, ctx));
    const used = rowHs.concat(wideHs).reduce((a, b) => a + b, 0);
    // The page's spare height goes INTO the rows, each up to its fill limit (layout.rowGapFor's one
    // rule: never between rows); what is left stays under the grids.
    const k = Math.max(1, Math.min(FILL_CAP, (sp.G - GRID_BORDERS_MM) / Math.max(1, used)));
    const grow = (h) => Math.round(Math.max(h, Math.min(k * h, fillLimit(h))) * 10) / 10;
    const hsN = rowHs.map(grow);
    const hsW = wideHs.map(grow);
    const sum = (a) => Math.round(a.reduce((x, y) => x + y, 0) * 100) / 100;
    const topic = topicOf(((input.skills || [])[0] || {}).iCan || '');
    const frame = frameOf({ skills: input.skills || [], input: Object.assign({}, input, { form }), tabId: `Test ${form}`, title: `Test ${form}: ${topic}`, score: all.length });
    const labels = labelStyleOf(ctx.look, input.labels);
    const gN = gridPart(nar.map((it) => planItem(it, { cols: sp.cols, level: 0 })), { cols: sp.cols, rows: rowsN, labels, start: 1 });
    gN.rowsTpl = hsN.map((x) => `${x}fr`).join(' ');
    gN.height = `${sum(hsN)}mm`;
    const gW = gridPart(wid.map((it) => planItem(it, { cols: 1, level: 0 })), { cols: 1, rows: wid.length, labels, start: nar.length + 1 });
    gW.rowsTpl = hsW.map((x) => `${x}fr`).join(' ');
    gW.height = `${sum(hsW)}mm`;
    const sections = [instructionPart(instructionKeyOf(all, input.skills), all), gN, gW];
    const line = `Fits: ${sp.cols} columns x ${rowsN} rows + 1 column x ${wid.length} rows (full width), ${all.length} per page.`;
    const fits = Object.assign({}, sp.Ln, { cols: sp.cols, rows: rowsN + wid.length, perPage: all.length, count: all.length, split: true, line });
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }], {
        scaffoldLevel: 0,
        meta: { items: all.length, scoreOutOf: all.length, form, fits: [fits], notes: [`${nar.length} problems in ${sp.cols} columns, ${wid.length} full width.`] },
    });
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    let items = poolItems(input, 'main');
    const sp = widthSplit(items, input, input.count);
    if (sp) return planSplit(input, sp, items);
    const L = layout(items, input);
    items = items.slice(0, L.perPage);
    // PT-TST-1: Form B is Form A re-ordered under (seed, form).
    if (form === 'B') items = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, 'test', 'B')), items);
    // RUBRIC H13: problems of one height together, so each row is sized for what it holds.
    items = groupByHeight(items, L.cols);
    // (lf-ops-props r4b: the rows' own heights - each row its tallest problem - must fit the grid the count was chosen for;
    // an order that pairs short problems with tall ones can sum past it - arrays_groups Test M ran 2.6 mm off its body - so
    // the problems are then set short to tall, which gives the smallest sum of row heights. Same problems, same count.)
    {
        const hs = items.map((it) => measuredH(it, L.cols));
        const rowSum = (ord) => { let t = 0; for (let r = 0; r < ord.length; r += L.cols) t += Math.max(...ord.slice(r, r + L.cols).map((i) => hs[i])); return t; };
        const idx = items.map((_, i) => i);
        if (L.cols > 1 && hs.every((h) => h > 0) && Number(L.gridH) > 0 && rowSum(idx) > L.gridH - SAFETY_H_MM) {
            const byH = idx.slice().sort((a, b) => hs[a] - hs[b] || a - b);
            if (rowSum(byH) < rowSum(idx)) items = byH.map((i) => items[i]);
        }
    }
    const topic = topicOf(((input.skills || [])[0] || {}).iCan || '');
    const frame = frameOf({ skills: input.skills || [], input: Object.assign({}, input, { form }), tabId: `Test ${form}`, title: `Test ${form}: ${topic}`, score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const instr = instructionPart(instructionKeyOf(items, input.skills), items);
    const sections = [
        instr,
        gridPart(items.map((it) => planItem(it, { cols: L.cols, level: 0 })), {
            // Every item in its own boxed cell (the 04-G "open array" drew the outer frame only,
            // and the items floated in one big box: 2026-09-25 re-grade, C3/C4).
            cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1,
        }),
    ];
    // Rows sized to what they hold (H13); else the layout's grid height is the page's (one
    // instruction) and a lone full grid fills by flex.
    // (a Test filled to its ceiling keeps one cell height, its rows taking the grid: fillToCeiling)
    const shape = L.filledTest ? null : rowShape(items, L.cols, rows, L.cellH);
    if (shape) { sections[1].rowsTpl = shape.rowsTpl; sections[1].height = `${shape.heightMm}mm`; }
    else if (rows === L.rows && L.fill !== false) { sections[1].cls = ''; sections[1].height = ''; }
    // A Test's count is fixed (12.1): spare page height goes between the rows, not into them.
    if (sections[1].height) {
        const g = rowGapFor(rows, parseFloat(sections[1].height), L.gridH);
        if (g.gap) { sections[1].rowGap = g.gap; sections[1].height = `${g.heightMm}mm`; }
    }
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }], {
        scaffoldLevel: 0,
        meta: { items: items.length, scoreOutOf: items.length, form, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

// A Test plans every item at level 0 (PT-TST-2: no hints; planItem level 0), so the bridge measures it there too - measured at
// level 1, a hint scaffold the page never draws sized its rows (lf-algebra r8 via the lead). A function: a bare 0 reads as unset.
export const MEASURE_LEVEL = () => 0;

export default { ROLE_ID, sources, measureCols, counts, plan };
