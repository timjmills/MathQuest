// js/modules/sheet/roles/review.js
// REVIEW (design/PAGE_TYPES.md 2.8): rehearse the test - the lesson cells again, in teaching
// order, with 25 to 35% earlier items.
//
//   Title      "Review: <topic>" (HD-13), tab "Review n", Score in the header
//   Sections   the skill's band (strip = its instruction), then "Mixed Review:" with the earlier
//              step's items (the skill before it in its category, when there is one). Each band
//              takes the columns and the row height of ITS OWN items (k2-r1 critic: the skill's
//              one-row pictures sat in rows sized for the mixed review's plates, 30%+ empty, and
//              a tall earlier item held a whole page to 2 items).
//   Counts     whole rows; earlier rows about a third (PT-REV-3); ceiling 16 / 12 / 12 per page
//   Supports   level 1 (PT-REV-2): no steps, no models, no traces; letters from a. (PT-LBL-7)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, topicOf, labelStyleOf,
} from './compose.js';
import { FILL_CAP, rowGapFor, rowShape, groupByHeight } from '../layout.js';

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

/** A section's columns and the height one of its rows needs (its own items, measured). */
function sectionFit(items, ctx) {
    if (!items.length) return { cols: 1, h: 0 };
    const opts = [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]);
    const cols = bestCols(items, opts, ctx);
    const h = hMinAt(items, cols, ctx);
    return { cols, h: Number.isFinite(h) ? h : 0 };
}

function geometry(pools, input) {
    const ctx = ctxOf(input);
    const main = pools.main || [];
    const earlier = pools.earlier || [];
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Review 1', title: 'Review', score: 1 });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const bands = earlier.length ? 2 : 1;
    const avail = m.body - 2 - bands * m.strip;
    const M = sectionFit(main, ctx);
    const E = sectionFit(earlier, ctx);
    const ceil = CEILING[ctx.size];
    // Whole rows of each section, filling the page by each section's OWN row height, up to the
    // ceiling; the earlier rows about a third of the items (PT-REV-3: 25 to 35%, 20-45 allowed
    // when whole rows cannot hit it), the most items winning, then the share nearest a third.
    const search = (strict) => {
        let best = { mRows: 1, eRows: bands === 2 ? 1 : 0, n: -1, d: 9 };
        for (let mr = 1; mr <= 20; mr++) {
            for (let er = 0; er <= (bands === 2 ? 10 : 0); er++) {
                const n = mr * M.cols + er * E.cols;
                if (n > ceil || mr * M.h + er * E.h > avail) continue;
                const share = n ? (er * E.cols) / n : 0;
                if (bands === 2 && (er < 1 || (strict && (share < 0.2 || share > 0.45)))) continue;
                const d = Math.abs(share - 1 / 3);
                // The most items; then the share nearest a third; then more of the skill's own rows.
                if (n > best.n || (n === best.n && d < best.d - 1e-9)) best = { mRows: mr, eRows: er, n, d };
            }
        }
        return best;
    };
    // Whole rows cannot always make a third (a 3-column mixed row beside a 2-item skill row):
    // then the most items with at least one mixed row.
    let best = search(true);
    if (best.n < 0) best = search(false);
    return { cols: M.cols, eCols: E.cols, mRows: best.mRows, eRows: best.eRows, rows: best.mRows + best.eRows, avail, h: M.h, eh: E.h, ctx };
}

export function counts(pools, input) {
    const g = geometry(pools, input);
    return { main: g.mRows * g.cols, earlier: g.eRows * g.eCols };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const main = poolItems(input, 'main');
    const earlier = poolItems(input, 'earlier');
    const g = geometry({ main, earlier }, input);
    const mainSkills = (input.skills || []).filter((s) => main.some((it) => it.q && it.q.skillId === s.skillId));
    const topic = topicOf(((mainSkills[0] || (input.skills || [])[0]) || {}).iCan || '');
    // Problems of like height share a row (H13: a 3-object count beside a 20-object count).
    const useM = groupByHeight(main.slice(0, g.mRows * g.cols), g.cols);
    const useE = g.eRows ? groupByHeight(earlier.slice(0, g.eRows * g.eCols), g.eCols) : [];
    const n = useM.length + useE.length;
    const n0 = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: mainSkills.length ? mainSkills : input.skills || [], input, tabId: `Review ${n0}`, title: `Review: ${topic}`, score: n });
    const rowsM = Math.ceil(useM.length / g.cols);
    const rowsE = Math.ceil(useE.length / g.eCols);
    // Each section's rows as tall as its own problems, the page's spare height shared out in
    // proportion but never past FILL_CAP x the content (RUBRIC H13); what is left goes between
    // the rows (grid.js rowGap), not inside the cells.
    const hM = g.h || g.avail / Math.max(1, rowsM + rowsE);
    const hE = g.eh || hM;
    const used = rowsM * hM + rowsE * hE;
    const k = Math.max(1, Math.min(FILL_CAP, g.avail / Math.max(1, used)));
    const cellM = hM * k;
    const cellE = hE * k;
    const spare = g.avail - (rowsM * cellM + rowsE * cellE);
    const labels = labelStyleOf(ctx.look, input.labels);
    const withGap = (part, items, cols, rows, cellH, share) => {
        // Each row as tall as what IT holds (layout.rowShape), then the section's spare height
        // between its rows.
        let gridMm = rows * cellH;
        const shape = rows > 1 ? rowShape(items, cols, rows, cellH) : null;
        if (shape) { part.rowsTpl = shape.rowsTpl; part.height = `${shape.heightMm}mm`; gridMm = shape.heightMm; }
        if (rows > 1) {
            const g2 = rowGapFor(rows, gridMm, rows * cellH + Math.max(0, spare) * share);
            if (g2.gap) { part.rowGap = g2.gap; part.height = `${g2.heightMm}mm`; }
        }
        return part;
    };
    const shareM = rowsE ? (rowsM - 1) / Math.max(1, rowsM + rowsE - 2) : 1;
    const sections = [{ kind: 'band', label: '', instr: instructionText(instructionKeyOf(useM, input.skills), useM),
        content: withGap(gridPart(useM.map((it) => planItem(it, { cols: g.cols })), { cols: g.cols, rows: rowsM, cellH: cellM, labels, start: 1 }), useM, g.cols, rowsM, cellM, shareM) }];
    if (useE.length) {
        sections.push({ kind: 'band', label: 'Mixed Review:', instr: instructionText(instructionKeyOf(useE, input.skills), useE),
            content: withGap(gridPart(useE.map((it) => planItem(it, { cols: g.eCols })), { cols: g.eCols, rows: rowsE, cellH: cellE, labels, start: useM.length + 1 }), useE, g.eCols, rowsE, cellE, 1 - shareM) });
    }
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: n, scoreOutOf: n, earlierShare: n ? useE.length / n : 0,
            fits: [{ cols: g.cols, rows: rowsM + rowsE, cellH: cellM, line: `Fits: ${g.cols} columns x ${rowsM} rows${rowsE ? ` + ${g.eCols} x ${rowsE} mixed` : ''}, ${n} per page.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
