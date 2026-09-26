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
    instructionText, assemble, poolItems, topicOf, oneSkill, labelStyleOf, fitsAt, stripExtraMm,
} from './compose.js';
import { FILL_CAP, rowShape, groupByHeight, fillLimit } from '../layout.js';
import { itemInstructionKey, neutralForKinds, itemKindSig } from './practice.js';

/** A row grows at most CONTENT_FILL x its content plus its pads (layout.fillLimit, one rule). */
const rowLimit = (m) => fillLimit(m);

export const ROLE_ID = 'review';
const CEILING = { S: 16, M: 12, L: 12 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills, { earlier }) => {
    const out = [{ id: 'main', skills }];
    // The earlier step, or (critic guided-r1) the host's fallback when the skill is the first of
    // its category: a Review always rehearses something before this skill.
    const prev = skills.length === 1 ? earlier(skills[0], 1, { fallback: true }) : [];
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

/**
 * The skill's own problems a Review prints: a mixed pool whose few full-width problems (an elapsed
 * time line among clocks) would pull the whole band to one column prints the problems that fit
 * columns, when those are most of the pool (critic guided-r1: ONE clock beside a ruled empty
 * area, H5). The full-width kinds are for the Independent page's bottom group.
 */
export function mainSet(main, ctx) {
    const opts = [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]);
    if (bestCols(main, opts, ctx) > 1) return main;
    const keep = main.filter((it) => fitsAt([it], 2, ctx));
    return keep.length >= 2 && keep.length * 2 >= main.length ? keep : main;
}

/**
 * The main section's bands: one per item kind, each with its own instruction (critic guided-r1:
 * "Circle the answer." over write-in items), every band WHOLE rows. The kinds with the most
 * problems get the rows first; a kind with fewer problems than one row is left for another page.
 * One kind (or kinds that share a line) is one band.
 */
function allocate(main, cols, mRows, skills) {
    const kinds = [];
    for (const it of main) {
        const k = itemInstructionKey(it) || '';
        let grp = kinds.find((x) => x.k === k);
        if (!grp) { grp = { k, items: [], at: kinds.length }; kinds.push(grp); }
        grp.items.push(it);
    }
    // A problem whose kind names no line of its own rides with a kind that does and draws the
    // same (a clock to read beside clocks to read); the rest keep a band of their own under the
    // neutral line (critic guided-r1: "Write the numbers in order." printed over a place-value
    // mat, a compare pair and a tens-and-ones frame).
    const blank = kinds.find((x) => !x.k);
    const named = kinds.filter((x) => x.k);
    if (blank && named.length) {
        const keep = [];
        for (const it of blank.items) {
            const home = named.find((g) => g.items.some((o) => itemKindSig(o) === itemKindSig(it)));
            if (home) home.items.push(it); else keep.push(it);
        }
        blank.items = keep;
        if (!keep.length) kinds.splice(kinds.indexOf(blank), 1);
    }
    const split = kinds.length > 1 && (/^default-/.test(instructionKeyOf(main, skills)) || kinds.some((x) => !x.k));
    if (!split) return [main.slice(0, mRows * cols)];
    let left = mRows;
    const out = [];
    for (const g of kinds.slice().sort((a, b) => b.items.length - a.items.length || a.at - b.at)) {
        const r = Math.min(left, Math.floor(g.items.length / cols));
        if (r > 0) { out.push({ at: g.at, k: g.k, items: g.items.slice(0, r * cols) }); left -= r; }
    }
    if (!out.length) return [main.slice(0, mRows * cols)];
    // Each band carries its kind's own line (the host stamps a mixed pool's items with one); the
    // band of problems with no line of their own the neutral one.
    return out.sort((a, b) => a.at - b.at).map((g) => Object.assign(g.items, { kindKey: g.k || neutralForKinds('default-write', g.items) }));
}

function geometry(pools, input) {
    const ctx = ctxOf(input);
    const main = mainSet(pools.main || [], ctx);
    const earlier = pools.earlier || [];
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Review 1', title: 'Review', score: 1 });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const bands = earlier.length ? 2 : 1;
    // A wrapped instruction takes its extra line off the page too.
    const wrap = stripExtraMm(ctx, '', instructionText(instructionKeyOf(main, input.skills), main))
        + (earlier.length ? stripExtraMm(ctx, 'Mixed Review:', instructionText(instructionKeyOf(earlier, input.skills), earlier)) : 0);
    const M = sectionFit(main, ctx);
    const E = sectionFit(earlier, ctx);
    const ceil = CEILING[ctx.size];
    // The earlier band may print fewer columns than it could, so a WHOLE row of it keeps the share
    // under 45% (a disks Review of three full-width charts takes a mixed row of 2, not 3).
    const eOpts = [];
    for (let c = E.cols; c >= 1; c--) eOpts.push({ c, h: c === E.cols ? E.h : hMinAt(earlier, c, ctx) });
    const availOf = (kindBands) => m.body - 2 - (bands + kindBands - 1) * m.strip - wrap;
    // What mr rows of the skill's own problems ARE: the bands allocate() prints (one per item
    // kind, whole rows), each row grouped by height and as tall as what it holds (H13). Heights
    // are the printed problems' own, so a pool of mixed heights (a place-value mat among one-line
    // frames) fills its page (critic guided-r1: 8 problems in the top half of a Review) and a
    // tall deal never runs over.
    const cache = new Map();
    const mainAt = (mr) => {
        if (!cache.has(mr)) {
            const gs = allocate(main, M.cols, mr, input.skills);
            let h = 0, n = 0;
            for (const gr of gs) {
                const g2 = groupByHeight(gr, M.cols);
                n += g2.length;
                for (let i = 0; i < g2.length; i += M.cols) {
                    const x = hMinAt(g2.slice(i, i + M.cols), M.cols, ctx);
                    h += Number.isFinite(x) && x > 0 ? x : M.h;
                }
            }
            cache.set(mr, { h, n, bands: Math.max(1, gs.length) });
        }
        return cache.get(mr);
    };
    const maxMr = Math.max(1, Math.ceil(main.length / Math.max(1, M.cols)));
    // Whole rows of each section, filling the page by each section's OWN row heights, up to the
    // ceiling. The earlier share never passes 45% (critic guided-r1: 86-89% on a disks Review, 67%
    // on mixed time): 20-45% when whole rows allow it, else any share up to 45% with one mixed
    // row, else no mixed row. The most items win; then the share nearest a third; then the
    // skill's own rows (main rows rank first).
    const search = (lo, needE) => {
        let best = { mRows: 1, eRows: 0, eCols: E.cols, eh: E.h, n: -1, d: 9 };
        for (const eo of (bands === 2 ? eOpts : [{ c: E.cols, h: E.h }])) {
            for (let mr = 1; mr <= Math.min(20, maxMr); mr++) {
                const a = mainAt(mr);
                for (let er = 0; er <= (bands === 2 ? 10 : 0); er++) {
                    const n = a.n + er * eo.c;
                    if (n > ceil || a.h + er * eo.h > availOf(a.bands)) continue;
                    const share = n ? (er * eo.c) / n : 0;
                    if (share > 0.45 || (needE && (er < 1 || share < lo))) continue;
                    const d = Math.abs(share - 1 / 3);
                    const better = n > best.n || (n === best.n && (d < best.d - 1e-9 || (Math.abs(d - best.d) < 1e-9 && mr > best.mRows)));
                    if (better) best = { mRows: mr, eRows: er, eCols: eo.c, eh: eo.h, n, d };
                }
            }
        }
        return best;
    };
    let best = bands === 2 ? search(0.2, true) : search(0, false);
    if (best.n < 0 && bands === 2) best = search(0, true);
    if (best.n < 0) best = search(0, false);
    if (best.n < 0) best = { mRows: 1, eRows: 0, eCols: E.cols, eh: E.h, n: M.cols };
    const kb = mainAt(best.mRows).bands;
    const avail = availOf(kb);
    return { cols: M.cols, eCols: best.eCols, mRows: best.mRows, eRows: best.eRows, rows: best.mRows + best.eRows, avail, h: M.h, eh: best.eh, ctx, strip: m.strip, kindBands: kb };
}

/** Enough of each pool that the plan can fill its bands with whole rows of each kind. */
export const PROBE = 24;

export function counts(pools, input) {
    const g = geometry(pools, input);
    const all = pools.main || [];
    // The main band is filled from a wider deal (the kinds are shared out in whole rows), the
    // plan printing only what it places.
    return { main: Math.min(all.length, Math.max(g.mRows * g.cols, 3 * g.mRows * g.cols)), earlier: g.eRows * g.eCols };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const main = mainSet(poolItems(input, 'main'), ctx);
    const earlier = poolItems(input, 'earlier');
    const g = geometry({ main, earlier }, input);
    // The skill under review is the first listed (sources: the main pool first); a mixed pool's
    // items carry their sub-skills' ids, one of which can be the earlier step's (critic guided-r1:
    // a mixed place-value Review titled and footed by its Mixed Review skill).
    const mainSkills = (input.skills || []).slice(0, 1);
    // PT-TTL-1 (owner ruling 2026-09-26): only a review of ONE skill names a topic. A set of
    // several skills has no earlier pool (sources) and every skill is under review: "Review".
    const reviewed = (input.pools || []).some((p) => p.id === 'earlier') ? mainSkills : (input.skills || []);
    const single = oneSkill(reviewed);
    const topic = single ? topicOf(single.iCan || '') : '';
    // Problems of like height share a row (H13: a 3-object count beside a 20-object count).
    const groups = allocate(main, g.cols, g.mRows, input.skills).map((gr) => Object.assign(groupByHeight(gr, g.cols), { kindKey: gr.kindKey }));
    const useM = groups.flat();
    // The mixed band's columns never exceed what it was dealt (one earlier problem is one full
    // row, never a problem beside a ruled empty cell, PT-ENG-7).
    const eCols = Math.max(1, Math.min(g.eCols, g.eRows ? Math.min(earlier.length, g.eRows * g.eCols) : g.eCols));
    const eRowsN = g.eRows ? Math.floor(Math.min(earlier.length, g.eRows * g.eCols) / eCols) : 0;
    const useE = eRowsN ? groupByHeight(earlier.slice(0, eRowsN * eCols), eCols) : [];
    const n = useM.length + useE.length;
    const n0 = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: mainSkills.length ? mainSkills : input.skills || [], input, tabId: `Review ${n0}`, title: topic ? `Review: ${topic}` : 'Review', score: n });
    const rowsOf = groups.map((gr) => Math.ceil(gr.length / g.cols));
    const rowsM = rowsOf.reduce((a, b) => a + b, 0);
    const rowsE = Math.ceil(useE.length / eCols);
    // Each section's rows as tall as its own problems, the page's spare height shared out in
    // proportion but never past CONTENT_FILL x the content (RUBRIC H13, one spare-height rule:
    // layout.rowGapFor); the rest stays under the grid. Extra bands (one per item kind) take
    // their strips out of the page first.
    const avail = g.avail + (g.kindBands - groups.length) * g.strip;
    const hM = g.h || avail / Math.max(1, rowsM + rowsE);
    const hE = g.eh || hM;
    // Every row as tall as what IT holds (H13): each band's rows measured, the page's spare
    // height shared out in proportion up to the fill limit of each row's content.
    const rowHs = (items, cols, fb) => {
        const out = [];
        for (let i = 0; i < items.length; i += cols) {
            const x = hMinAt(items.slice(i, i + cols), cols, ctx);
            out.push(Number.isFinite(x) && x > 0 ? x : fb);
        }
        return out;
    };
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const hsM = groups.map((gr) => rowHs(gr, g.cols, hM));
    const hsE = useE.length ? rowHs(useE, eCols, hE) : [];
    const used = hsM.reduce((t, a) => t + sum(a), 0) + sum(hsE);
    const k = Math.max(1, Math.min(FILL_CAP, avail / Math.max(1, used)));
    // The band's cell: its rows' mean height, grown by the page's share, never past its shortest
    // row's fill limit when the rows are one height (rowShape shares it out when they are not).
    const cellOf = (hs, fb) => {
        if (!hs.length) return fb;
        const x = sum(hs) / hs.length;
        return Math.max(x, Math.min(x * k, rowLimit(Math.min(...hs))));
    };
    const cellsM = hsM.map((hs) => cellOf(hs, hM));
    const cellM = cellsM[0] || hM;
    const cellE = cellOf(hsE, hE);
    const labels = labelStyleOf(ctx.look, input.labels);
    const shaped = (part, items, cols, rows, cellH) => {
        // Each row as tall as what IT holds (layout.rowShape).
        const shape = rows > 1 ? rowShape(items, cols, rows, cellH) : null;
        if (shape) { part.rowsTpl = shape.rowsTpl; part.height = `${shape.heightMm}mm`; }
        return part;
    };
    const sections = [];
    let start = 1;
    groups.forEach((gr, gi) => {
        sections.push({ kind: 'band', label: '', instr: instructionText(gr.kindKey || neutralForKinds(instructionKeyOf(gr, input.skills), gr), gr),
            content: shaped(gridPart(gr.map((it) => planItem(it, { cols: g.cols })), { cols: g.cols, rows: rowsOf[gi], cellH: cellsM[gi], labels, start }), gr, g.cols, rowsOf[gi], cellsM[gi]) });
        start += gr.length;
    });
    if (useE.length) {
        sections.push({ kind: 'band', label: 'Mixed Review:', instr: instructionText(instructionKeyOf(useE, input.skills), useE),
            content: shaped(gridPart(useE.map((it) => planItem(it, { cols: eCols })), { cols: eCols, rows: rowsE, cellH: cellE, labels, start: useM.length + 1 }), useE, eCols, rowsE, cellE) });
    }
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: n, scoreOutOf: n, earlierShare: n ? useE.length / n : 0,
            fits: [{ cols: g.cols, rows: rowsM + rowsE, cellH: cellM, line: `Fits: ${g.cols} columns x ${rowsM} rows${rowsE ? ` + ${eCols} x ${rowsE} mixed` : ''}, ${n} per page.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
