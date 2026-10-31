// js/modules/sheet/roles/mixed-practice.js
// MIXED SKILL PRACTICE (design/PAGE_TYPES.md 5.2), GROUPED arrangement (the default): one shelf
// per skill, each opening with a band strip (bold skill title plus the skill's own instruction),
// every vertical rule on a shared unit lattice.
//
//   Lattice    the page is N units wide (Auto N: I Can 10 / 8 / 6, Daily 8 / 6 / 4 at S / M / L);
//              a shelf holds k cells, k the largest divisor of N whose cell width the skill's cell
//              fits (measured, DN-10) - PT-MIX-1
//   Packing    each skill gets one shelf first; further shelves go to the skill with the largest
//              gap between its share and its weight, while they fit (PT-MIX-4); a shelf uses its
//              own measured height and the spare height is shared equally into the shelves
//   Numbering  row-major 1 to N across shelves; no in-cell skill letter (PT-MIX-7); the key carries
//              the same numbers, so the skill-to-item map is the key's order
//   Look       Daily by default; two-line tab "Level N | Mixed 1"; title "Mixed practice" (HD-13)
//   Overflow   a shelf never splits; shelves that do not fit spill to page 2 (PT-MIX-9)
//   Anchors    S6 (input.anchors, built by the host): SECTIONS (the default when on) puts ONE
//              worked example - an anchor band - on each skill's first shelf band, above its
//              problems; SIDE BY SIDE makes each shelf rows of [twin | problem] pairs (a skill whose
//              problems cannot sit two to a shelf takes the band instead). Anchors are unscored,
//              unlabelled and carry the Model tab; the numbering counts pupil problems only.
//
// MIXED arrangement (`input.arrangement === 'mixed'`, IMPROVEMENT_PLAN 3.3, phase M1): for skills
// of ONE SIZE CLASS (`mixedClass`: the same cells across k on the lattice, cell heights within
// MIX_H_RATIO of each other, and every skill's cells say their own task - the sign of a
// computation, or an instruction kept in the cell), the page is shelves of k cells filled from
// the interleaved queue (sheet/interleave.js: counts by `dealCounts`, two of each; order by
// `interleave`, no run over 2). One band strip heads the page with the sheet instruction "Solve."
// and no band title; each cell keeps its own instruction (the host does not strip it, B3). A
// shelf is as tall as the tallest cell it holds; content never shrinks; whole shelves paginate;
// numbering row-major. Skills of different size classes fall back to GROUPED, with the reason in
// the notes. The 2 x 2 block packer for mixed size classes is M2's (PT-MIX-5).
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, labelStyleOf, STRAND_BY_CATEGORY, deriveSeed,
} from './compose.js';
import { skillWords } from './practice.js';
import { anchorPlanItem, anchorHeightMm } from '../anchors.js';
import { interleave, dealCounts } from '../interleave.js';
import { SIZES, FACT_LADDER, factCellHMm, factTab } from '../index.js';
import { factWidthMm, factDigitTracks } from '../cells/fact.js';
import { classify, fillPage, packPage, splitPages, withinShare, H13_FILL, NAT_MM } from '../mixed-pack.js';

export const ROLE_ID = 'mixed-practice';
export const DEFAULT_LOOK = 'daily';
const AUTO_N = { ican: { S: 10, M: 8, L: 6 }, daily: { S: 8, M: 6, L: 4 } };

export const sources = (skills) => skills.map((s, i) => ({ id: `s${i}`, skills: [s], weight: Number(s.weight) > 0 ? Number(s.weight) : 1 }));
// 5: a shelf of an I Can page at S (N = 10) holds 5 cells, so they are measured at 5 too.
// (and the lattice itself above 6 - 8 Daily / 10 I Can at S - where a shelf may run it, R1-7)
export const measureCols = (ctx) => {
    const n = ctx && AUTO_N[ctx.look] ? AUTO_N[ctx.look][ctx.size] : 0;
    return n > 6 ? [1, 2, 3, 4, 5, 6, n] : [1, 2, 3, 4, 5, 6];
};

const divisorsDesc = (n) => Array.from({ length: n }, (_, i) => n - i).filter((d) => n % d === 0);

/**
 * A lesson packet's Mixed page (lessons r1): the lesson's step strip heads page 1
 * (`input.stepStrip`, `input.stepStripMm`), and `input.fill` shares the page's spare height into
 * the shelves up to 0.35 x a shelf's own height (a drawing centred in its cell keeps each empty band
 * under 30 %, H13) instead of a tenth - no blank band above the footer.
 */
const stripMmOf = (input) => (input.stepStrip && Number(input.stepStripMm) > 0 ? Number(input.stepStripMm) : 0);

/**
 * The counts across a GROUPED shelf may take, widest first: the lattice N itself above 6 (8 Daily /
 * 10 I Can at S; R1-7), then its divisors up to 6. A fact cell keeps TY-30's working digits for the
 * size above 6 across (the fact ladder sets them by the count across).
 */
function sectionKs(its, N, ctx, single = false, lesson = false) {
    const floor = (SIZES[ctx.size] || SIZES.L).digitPt;
    const allFact = its.length && its.every((it) => it.template === 'fact');
    // a page of ONE skill is its own lattice (PT-MIX-1 holds trivially): any count up to N, so a
    // lattice of 8 does not hold S to 4 across where M prints 6 (R1-7)
    // (a fact or a kit stack only: a legacy cell, a clock wraps or crowds its label at a count the measurement passes - print-lint WRAP-OP, CL-40)
    const ks = single && its.length && its.every((it) => it.template === 'fact' || it.template === 'stack') ? Array.from({ length: N }, (_, i) => N - i).filter((d) => d <= 6 || d === N)
        : [...(N > 6 ? [N] : []), ...divisorsDesc(N).filter((d) => d <= 6)];
    // TY-30: a fact cell never prints under the size's working digits (the ladder sets them by k) -
    // at L a fact 6 across (24 pt) printed more than M's 4 (R1-7, sub_facts I Can)
    // (a lesson packet's Mixed page keeps its own fixed lattice and digits: lessons r1, another lane's pages)
    return ks.filter((d) => !allFact || (lesson && d <= 6) || (FACT_LADDER[d] || 28) >= floor);
}

/** Shelves: for each pool {id, k, h}, then how many shelves each gets. */
function packing(poolsIn, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: 1 });
    const m0 = bandMetrics(ctx, layoutHeader(frame.header));
    const m = Object.assign({}, m0, { budget: m0.budget - stripMmOf(input) });
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    // A lesson packet's Mixed page keeps the L lattice (6) at M: a 3-across shelf of stacks, never
    // 2 half-empty cells (lessons r1, H13 width).
    const N = [4, 6, 8, 10].includes(Number(input.latticeN)) ? Number(input.latticeN) : AUTO_N[ctx.look][ctx.size];
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    const shelf = {};
    const A = input.anchors && input.anchors.byPool ? input.anchors : null;
    const exact = input.exactCounts || null;
    for (const id of ids) {
        const its = poolsIn[id];
        const a = A && A.byPool[id];
        const twins = a && A.mode === 'side' ? (a.side || []) : [];
        // SIDE: a shelf of [twin | problem] pairs needs an even count of cells the twins fit too.
        const pairK = twins.length ? divisorsDesc(N).find((d) => d <= 6 && d % 2 === 0 && fitsAt(its, d, ctx) && fitsAt(twins, d, ctx)) : 0;
        // R1-7 (LESSONS L1): the shelf may run the whole lattice (8 Daily / 10 I Can at S) where the
        // cells were measured to fit it - a lattice of 8 has no 6, so S printed fewer than M
        let k = pairK || sectionKs(its, N, ctx, ids.length === 1, !!(input.leadHalf || input.latticeN)).find((d) => (d <= 6 ? fitsAt(its, d, ctx) : fitsMeasured(its, d, ctx))) || 1;
        // exact counts (the owner's "mix by section, with specified amount"): a count that does not
        // fill whole shelves takes the next count across (at least half) that does; else the last
        // shelf ends in one unruled trailing area (PG-15) - never an empty box
        const want = exact ? Math.max(0, Math.floor(Number(exact[id]) || 0)) : 0;
        if (exact && !pairK && want % k) {
            const whole = sectionKs(its, N, ctx, ids.length === 1, !!(input.leadHalf || input.latticeN)).find((d) => d < k && d >= Math.max(2, k / 2) && want % d === 0 && fitsAt(its, d, ctx));
            if (whole) k = whole;
        }
        const h = Math.max(hAtK(its, k, ctx), pairK ? hMinAt(twins, k, ctx) : 0);
        // The skill's anchor band (SECTIONS, or SIDE when no pair fits): measured by the host.
        const band = a && (A.mode === 'sections' || !pairK) && (a.band || []).length ? Math.max(0, ...a.band.map((x) => anchorHeightMm(x, 1))) : 0;
        shelf[id] = { k, h: Number.isFinite(h) ? h : 60, n: 0, pairs: !!pairK, band, per: pairK ? k / 2 : k };
        if (exact) shelf[id].want = want;
    }
    if (exact) {
        // every skill its own count: whole shelves of k, the last one short when it must be
        for (const id of ids) shelf[id].n = Math.ceil(shelf[id].want / shelf[id].per);
        return { ctx, m, mCont, N, ids, shelf, used: 0, pages: 1, exact: true };
    }
    const weights = Object.fromEntries((input.pools || []).map((p) => [p.id, p.weight || 1]));
    // A skill's strip opens its first shelf only: its further shelves join the same band (an
    // empty strip between two shelves of one skill read as a blank row, H13).
    const bandH = (id, first = true) => (first ? m.strip : 0) + shelf[id].h;
    // Page 1: one shelf per skill first (with its anchor band), then extra shelves by weight gap.
    let used = 0;
    const order = [];
    for (const id of ids) { order.push(id); used += bandH(id) + shelf[id].band; shelf[id].n = 1; }
    const total = () => ids.reduce((a, id) => a + shelf[id].n * shelf[id].per, 0);
    // WORKSHEET_DESIGN_STANDARD 12.1: Mixed practice holds at most 9 / 7 / 5 rows (shelves).
    const maxShelves = { S: 9, M: 7, L: 5 }[ctx.size] || 5;
    // With anchor bands a set may need more than one page (whole shelves spill, PT-MIX-9): the
    // extra shelves then fill the pages the anchors already take, never adding a page.
    const pagesOf = () => {
        let pages = 1;
        let cur = 0;
        for (const id of ids) {
            for (let k = 0; k < shelf[id].n; k++) {
                const hh = bandH(id, k === 0) + (k === 0 ? shelf[id].band : 0);
                const budget = pages === 1 ? m.budget : mCont.budget;
                if (cur && cur + hh > budget) { pages++; cur = 0; }
                cur += hh;
            }
        }
        return pages;
    };
    const basePages = A ? pagesOf() : 1;
    for (let guard = 0; guard < 40; guard++) {
        if (ids.reduce((a, id) => a + shelf[id].n, 0) >= maxShelves * basePages) break;
        const tw = ids.reduce((a, id) => a + (weights[id] || 1), 0);
        const gaps = ids.map((id) => ({ id, gap: (weights[id] || 1) / tw - (shelf[id].n * shelf[id].per) / Math.max(1, total()) }))
            .sort((a, b) => b.gap - a.gap);
        const fits = (id) => {
            if (!A) return used + bandH(id, false) <= m.budget;
            shelf[id].n++;
            const ok = pagesOf() <= basePages;
            shelf[id].n--;
            return ok;
        };
        const next = gaps.find((g) => fits(g.id));
        if (!next) break;
        shelf[next.id].n++;
        used += bandH(next.id, false);
    }
    // R1-7 (LESSONS L1): this size prints more problems than the next size up (`input.mustBeat`, from
    // the host): the skill with the most problems per mm of shelf takes shelves - first spare room,
    // then a shelf of the least compact skill (each keeps one) - until it does; the notes say so.
    let ladderNote = '';
    const must = Number(input.mustBeat) || 0;
    if (must && !A && !input.leadHalf && ids.length > 1 && total() <= must) {
        const rate = (id) => shelf[id].per / shelf[id].h;
        const best = ids.slice().sort((a, b) => rate(b) - rate(a))[0];
        const before = total();
        const snap = Object.fromEntries(ids.map((id) => [id, shelf[id].n]));
        const used0 = used;
        for (let g = 0; g < 40 && total() <= must; g++) {
            const shelves = ids.reduce((a, id) => a + shelf[id].n, 0);
            if (shelves < maxShelves * basePages && used + bandH(best, false) <= m.budget + 1e-6) { shelf[best].n++; used += bandH(best, false); continue; }
            const drop = ids.filter((id) => id !== best && shelf[id].n > 1).sort((a, b) => rate(a) - rate(b))[0];
            if (!drop) break;
            shelf[drop].n--;
            used -= bandH(drop, false);
            if (!(used + bandH(best, false) <= m.budget + 1e-6)) { shelf[drop].n++; used += bandH(drop, false); break; }
        }
        const it0 = (poolsIn[best] || [])[0] || {};
        const nm = STRAND_BY_CATEGORY[String(it0.skill || '').split(':')[0]] || poolName(input, poolsIn[best]);
        // (nothing gained: the page stays as the weights made it - the next size's figure is a forecast)
        if (total() <= must) { for (const id of ids) shelf[id].n = snap[id]; used = used0; }
        ladderNote = total() > must && total() > before
            ? `Mixed practice: more ${nm.toLowerCase()} problems than the weights ask, so this size prints more problems than the next size up (${total()}, not ${must}).` : '';
    }
    // Lessons r3: a lesson's Mixed page (`leadHalf`) gives its first skill - the lesson's own - at
    // least half the placed items AFTER packing (weights alone lost to a taller lesson shelf):
    // a partner gives up an extra shelf, and the lesson takes a shelf where one fits.
    if (input.leadHalf && ids.length > 1 && !A) {
        const lead = ids[0];
        const cnt = (id) => shelf[id].n * shelf[id].per;
        const rest = () => ids.slice(1).reduce((a, id) => a + cnt(id), 0);
        for (let g = 0; g < 24 && cnt(lead) < rest(); g++) {
            const shelves = ids.reduce((a, id) => a + shelf[id].n, 0);
            if (shelves < maxShelves * basePages && used + bandH(lead, false) <= m.budget) { shelf[lead].n++; used += bandH(lead, false); continue; }
            const drop = ids.slice(1).filter((id) => shelf[id].n > 1).sort((a, b) => cnt(b) - cnt(a))[0];
            if (drop) { shelf[drop].n--; used -= bandH(drop, false); continue; }
            // `leadDrop` (the detailed lesson maker, lesson 2 r4 - critic r2 D3: 2 stories of 14 items):
            // every partner is down to one shelf, so the LAST partner with the most items gives its
            // whole band up (one partner always stays); the last partner left narrows its shelf to
            // the next lattice divisor (6 facts -> 3, wider cells, never an empty cell).
            if (!input.leadDrop) break;
            const live = ids.slice(1).filter((id) => shelf[id].n > 0);
            if (live.length > 1) {
                const most = Math.max(...live.map(cnt));
                const gone = live.filter((id) => cnt(id) === most).pop();
                shelf[gone].n = 0;
                used -= bandH(gone, true);
                continue;
            }
            const last = live[0];
            const k2 = last ? divisorsDesc(N).find((dv) => dv < shelf[last].k && fitsAt(poolsIn[last], dv, ctx)) : 0;
            if (!k2) break;
            const h2 = hMinAt(poolsIn[last], k2, ctx);
            used += (Number.isFinite(h2) ? h2 : shelf[last].h) - shelf[last].h;
            Object.assign(shelf[last], { k: k2, per: k2, h: Number.isFinite(h2) ? h2 : shelf[last].h });
        }
    }
    return { ctx, m, mCont, N, ids, shelf, used, pages: basePages, ladderNote };
}

/* ============================================================ the MIXED arrangement (M1) */

/** A shelf's shorter cell keeps at least this share of the tallest's height (H13: < 30 % empty). */
export const MIX_H_RATIO = 0.75;
/** Instructions a computation cell's own sign already says: such a cell needs no cue on "Solve.". */
const SIGN_KEYS = new Set(['add', 'subtract', 'multiply', 'divide', 'mixed-sign', 'mixed-ops', 'default-solve', 'default-write']);

/**
 * The shelf widths a mixed page may try, widest first. Grouped shelves (and any page with a cell
 * other than the 1 x 1 fact cell) keep the divisors of the lattice up to 6. A page whose cells are
 * ALL fact cells may also run 7 to N across (N = 8 Daily / 10 I Can at S): the TY-30 fact ladder
 * sets the digits by the count across (20 / 18 / 16 pt at 7 / 8 / 10), so S prints more problems
 * than M (critic M1 r1 D1). Every shelf of a page takes the same k, so its vertical rules still
 * line up; the page's lattice is then k itself.
 */
function kCandidates(poolsIn, ids, N, ctx) {
    const allFact = ids.every((id) => poolsIn[id].every((it) => it.template === 'fact'));
    // (M1 r4, D2: an all-fact page runs any count across up to N whose ladder digits are at
    // least the size's working digits - factPick chooses among them; this list is its fallback)
    if (allFact && ctx) {
        const floor = (SIZES[ctx.size] || SIZES.L).digitPt;
        const ks = Array.from({ length: Math.min(10, N) }, (_, i) => Math.min(10, N) - i).filter((d) => FACT_LADDER[d] >= floor);
        if (ks.length) return ks;
    }
    const wide = allFact ? Array.from({ length: Math.max(0, N - 6) }, (_, i) => N - i).filter((d) => d >= 7 && d <= 10) : [];
    return [...wide, ...divisorsDesc(N).filter((d) => d <= 6)];
}

/** fitsAt, and above 6 across only where the cell was really measured there (no measure, no fit). */
const fitsMeasured = (its, d, ctx) => fitsAt(its, d, ctx) && (d <= 6 || its.every((it) => it.measured && it.measured[d] && it.measured[d].fits !== false))
    // (and a grid the layout really builds at this size: hMinAt is Infinity where it will not)
    && Number.isFinite(hAtK(its, d, ctx));

/**
 * THE WORK ZONE of a long procedure drawn by a legacy cell (critic M2 r1 D2, H9): a 2-digit x
 * 2-digit column multiplication needs its partial products, their sum and a carry row under the
 * double rule - its single-skill page gives it the whole cell for them (layout.js keeps a 'long'
 * cell's spare height as its working space). The legacy drawing ends at the rule, so its measured
 * height holds none of that room: a mixed or Sections shelf adds it, WORK_ROW_MM a written row.
 */
export const WORK_ROW_MM = 9;
export function workRowsOf(it) {
    if (!it || !it.legacy || it.fclass !== 'long') return 0;
    const q = it.q || {};
    const b = String(Math.abs(Number(q.b)) || '');
    // the partial products (one a digit of the multiplier) and their sum (the carries have their
    // boxes above the number)
    if (/column-mult/.test(String(q.printFormat || '')) && b.length >= 2) return b.length + 1;
    return 4;
}
const workMmOf = (its) => Math.max(0, ...its.map((it) => workRowsOf(it) * WORK_ROW_MM));
/** A work-zone cell says so (class and its zone in mm) - the mixed check measures it under the rule. */
function markWork(it) {
    const mm = workRowsOf(it) * WORK_ROW_MM;
    if (!mm) return it;
    return Object.assign({}, it, { cellCls: [it.cellCls || '', 'ws-mixwork'].filter(Boolean).join(' '), cellStyle: `${it.cellStyle || ''}--mq-work:${mm}mm;` });
}

/** The tallest cell at k: the layout's own minimum up to 6, the measured height above it (and a long procedure's work zone). */
function hAtK(its, k, ctx) {
    const work = workMmOf(its);
    if (k <= 6) return hMinAt(its, k, ctx) + work;
    const hs = its.map((it) => it.measured && it.measured[k] && it.measured[k].hMm);
    return hs.every((h) => Number.isFinite(h)) ? Math.max(...hs) + 1 + work : Infinity;
}

const latticeOf = (input, ctx) => ([4, 6, 8, 10].includes(Number(input.latticeN)) ? Number(input.latticeN) : AUTO_N[ctx.look][ctx.size]);

/* ------------------------------------------- the across count of an all-fact page (M1 r4) */

/** TY-31: the fill of the column a fact section keeps (the fact's drawn width / the cell's). */
export const FACT_FILL = Object.freeze({ lo: 0.55, hi: 0.75 });
/** WORKSHEET_DESIGN_STANDARD 12.1: Mixed practice holds at most 9 / 7 / 5 rows (shelves). */
const MAX_SHELVES = Object.freeze({ S: 9, M: 7, L: 5 });
const SIZE_UP = Object.freeze({ S: 'M', M: 'L', L: null });

const isAllFact = (poolsIn, ids) => ids.length > 0 && ids.every((id) => poolsIn[id].every((it) => it.template === 'fact'));
const payloadOf = (it) => (it && it.q && it.q.cell && it.q.cell.payload) || {};
/** A fact cell's digit tracks as it prints (the host gives every fact of a mixed page one count). */
export const factTracksOf = (it) => { const p = payloadOf(it); return factDigitTracks(p.a, p.b, p.digits); };
/** TY-31: the fill of the column of these facts at k across (the widest of them). */
/** TY-31: the gap between neighbouring facts' rules is never below 6 mm. */
export const FACT_RULE_GAP_MM = 6;
/**
 * The drawn grid of a fact band (critic M1 r5: ONE source for the fill and the rule gap, measured
 * against the drawn rule). The band's 186 mm loses its two heavy sides (1.5 pt); its k cells share
 * the rest with k - 1 gaps of the look's cell line (Daily 1.5 pt, I Can 0.75 pt). The pitch is
 * cell + gap; the drawn rule is the fact's grid (factWidthMm), within 0.05 mm of the printed one.
 */
const PT_MM = 25.4 / 72;
const BAND_SIDE_MM = 1.5 * PT_MM;
const cellGapMm = (look) => (look === 'ican' ? 0.75 : 1.5) * PT_MM;
export const factPitchMm = (k, look = 'daily') => (186 - 2 * BAND_SIDE_MM + cellGapMm(look)) / k;
export const factCellWMm = (k, look = 'daily') => factPitchMm(k, look) - cellGapMm(look);
const widestFactMm = (items, k, tracks) => {
    const n = tracks || Math.max(2, ...items.map(factTracksOf));
    return Math.max(0, ...items.map((it) => factWidthMm(k, n, payloadOf(it).b)));
};
/** The gap (mm) between the drawn rules of neighbouring facts at k across: the pitch less the widest rule. */
export function factRuleGapAt(items, k, tracks = 0, look = 'daily') {
    return factPitchMm(k, look) - widestFactMm(items, k, tracks);
}
/** What makes a page's facts 3 digits wide, in words ("a 3-digit answer", "2 3-digit dividends"). */
function wideWords(items) {
    let ans = 0;
    let div = 0;
    let other = 0;
    for (const it of items) {
        const p = payloadOf(it);
        const q = (it && it.q) || {};
        const a = String(p.a ?? '');
        const b = String(p.b ?? '');
        const v = String(p.ans !== undefined ? p.ans : (q.ans ?? ''));
        if (/^(\/|\u00f7)$/.test(String(p.op)) && a.length >= 3) div++;
        else if (v.length >= 3) ans++;
        else if (a.length >= 3 || b.length >= 3) other++;
    }
    const NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const w = (c, one, many) => (c ? (c === 1 ? `a 3-digit ${one}` : `${NUM[c] || c} 3-digit ${many}`) : '');
    return [w(ans, 'answer', 'answers'), w(div, 'dividend', 'dividends'), w(other, 'number', 'numbers')].filter(Boolean).join(' and ');
}
export function factFillAt(items, k, tracks = 0, look = 'daily') {
    return widestFactMm(items, k, tracks) / factCellWMm(k, look);
}

/**
 * THE ACROSS COUNT OF AN ALL-FACT MIXED PAGE (critic M1 r3 D2, D3, D5). The fact ladder (TY-30)
 * sets the digits by the count across, so k is chosen with three rules, in this order:
 *   1. the digit floor: a k is allowed only when its ladder digits are at least the size's
 *      working digits (16 / 22 / 28 pt at S / M / L), up to the look's lattice (I Can 10 / 8 / 6,
 *      Daily 8 / 6 / 4), at every count across that the cells were measured to fit;
 *   2. the size ladder (L1): the page prints more problems than the next size up would (S > M > L),
 *      the next size's count worked out the same way from the same cells;
 *   3. the fill (TY-31): the widest k whose fill of the column is within 55-75 %; when none is,
 *      the k least above 75 % (a wider one on a tie), and the notes say so.
 * Rows are the shelves the page's height holds (at most 9 / 7 / 5): this size's from its measured
 * cells, another size's from the same cells moved to that size's VA-70 fact height.
 * -> {k, fill, tracks, digitPt, problems, note, ladder}
 */
export function factPick(poolsIn, ids, input, ctx) {
    const all = ids.flatMap((id) => poolsIn[id]);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: 1 });
    const head = layoutHeader(frame.header);
    const lattice = (sz) => ([4, 6, 8, 10].includes(Number(input.latticeN)) ? Number(input.latticeN) : AUTO_N[ctx.look][sz]);
    const fitK = new Map();
    const fits = (k) => { if (!fitK.has(k)) fitK.set(k, fitsMeasured(all, k, ctx)); return fitK.get(k); };
    const hHere = (k) => hAtK(all, k, ctx);
    const rowsAt = (sz, k) => {
        const m = bandMetrics(Object.assign({}, ctx, { size: sz }), head);
        const h = sz === ctx.size ? hHere(k) : hHere(k) - factCellHMm(k, ctx.size) + factCellHMm(k, sz);
        if (!Number.isFinite(h) || h <= 0) return 0;
        return Math.max(1, Math.min(MAX_SHELVES[sz] || 5, Math.floor((m.budget - stripMmOf(input) - m.strip) / h)));
    };
    const tracks = Math.max(2, ...all.map(factTracksOf));
    const allowed = (sz) => Array.from({ length: lattice(sz) }, (_, i) => lattice(sz) - i)
        .filter((k) => FACT_LADDER[k] >= SIZES[sz].digitPt && fits(k));
    const choose = (sz, must, n) => {
        const fill = (k) => factFillAt(all, k, n, ctx.look);
        const ok = allowed(sz);
        if (!ok.length) return null;
        const beat = ok.filter((k) => k * rowsAt(sz, k) > must);
        const cands = beat.length ? beat : ok;
        const inRange = cands.filter((k) => fill(k) >= FACT_FILL.lo - 1e-9 && fill(k) <= FACT_FILL.hi + 1e-9);
        let k;
        if (inRange.length) k = inRange[0];
        else {
            // TY-31's hard limit (critic M1 r4): the widest k whose neighbouring rules stay at least
            // 6 mm apart; only when none does, the least overfilled.
            const gapOk = cands.filter((x) => factRuleGapAt(all, x, n, ctx.look) >= FACT_RULE_GAP_MM - 1e-9);
            const over = cands.filter((x) => fill(x) > FACT_FILL.hi);
            k = gapOk.length ? gapOk[0] : over.length ? over.slice().sort((a, b) => fill(a) - fill(b) || b - a)[0] : cands[0];
        }
        return { k, problems: k * rowsAt(sz, k), ladder: !!beat.length || must === 0 };
    };
    // L first, then M, then S: each size must beat the one above it. The page of a bigger size is
    // dealt again, so its facts may be narrower than these (no 3-digit number): it is taken at the
    // most problems it could print, over 2 tracks and these (critic M1 r4 check, weighted 1 : 3).
    const chain = [];
    for (let sz = ctx.size; sz; sz = SIZE_UP[sz]) chain.unshift(sz);
    let must = 0;
    let got = null;
    for (const sz of chain) {
        if (sz !== ctx.size) {
            const opts = [...new Set([2, tracks])].map((n) => choose(sz, must, n)).filter(Boolean);
            if (!opts.length) return null;
            must = Math.max(...opts.map((o) => o.problems));
            continue;
        }
        got = choose(sz, must, tracks);
        if (!got) return null;
    }
    const k = got.k;
    const f = factFillAt(all, k, 0, ctx.look);
    return { k, fill: f, tracks, digitPt: FACT_LADDER[k], problems: got.problems, note: fillNote(tracks, k, f, got.ladder, wideWords(all)), ladder: got.ladder, wide: wideWords(all) };
}

/** The teacher's note when a pick leaves TY-31's fill or the size ladder (factPick). */
function fillNote(tracks, k, f, ladder = true, wide = '') {
    const pct = Math.round(f * 100);
    let note = '';
    if (f > FACT_FILL.hi + 1e-9) {
        const what = wide ? `${wide.charAt(0).toUpperCase()}${wide.slice(1)} on the page ${/^a /.test(wide) && !/ and /.test(wide) ? 'needs' : 'need'} a third digit place, so the facts` : `The ${tracks}-digit facts`;
        note = `Mixed practice: ${what} fill ${pct}% of each box at ${k} across (the aim is 55-75%): the most across that keeps the answer lines 6 mm apart, so this size still prints more problems than the next size up.`;
    } else if (f < FACT_FILL.lo - 1e-9) {
        note = `Mixed practice: the facts fill ${pct}% of each box at ${k} across (the aim is 55-75%); more across would print the digits smaller than this size's.`;
    }
    if (!ladder) note = [note, 'Mixed practice: this size prints no more problems than the next size up.'].filter(Boolean).join(' ');
    return note;
}

/** The plain words for a pool's skill (the notes): its strand or label. */
function poolName(input, its) {
    const it0 = its[0] || {};
    const q = it0.q || {};
    const skill = (input.skills || []).find((s) => `${s.categoryId}:${s.skillId}` === it0.skill)
        || (input.skills || []).find((s) => s.skillId === q.skillId && (!q.categoryId || s.categoryId === q.categoryId)) || {};
    return skill.label || STRAND_BY_CATEGORY[skill.categoryId] || skillWords(skill).strand || q.skillId || 'This skill';
}

/**
 * Do the page's skills share one size class (M1's test)? Each pool's k is the largest divisor of
 * the lattice N (at most 6) whose cell width every one of its measured cells fits (DN-10), and its
 * h the tallest of its cells at k. They share a class when every pool has the same k, the
 * shortest h is at least MIX_H_RATIO of the tallest, and each pool's cells say their own task.
 * -> {ok, k, h, N, why}
 */
export function mixedClass(poolsIn, input = {}) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const N = latticeOf(input, ctx);
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    if (ids.length < 2) return { ok: false, N, why: '' };
    // M1 mixes kit cells only: a legacy cell (old print HTML) draws its own rule, column and sign
    // spacing, so it would not line up with the kit cells it shares a shelf with (critic r1 D2).
    const legacy = ids.filter((id) => poolsIn[id].some((it) => !it.template || it.template === 'legacy'));
    if (legacy.length) {
        return { ok: false, N, why: `Mixed practice: ${legacy.map((id) => poolName(input, poolsIn[id])).join(', ')} still uses the old drawing, so the page prints in sections for now.` };
    }
    const cands = kCandidates(poolsIn, ids, N, ctx);
    // All fact cells: one drawing, so the page takes ONE k for every skill, chosen by the size's
    // digit floor, the fill of the column and the size ladder (factPick, critic M1 r3 D2 / D3).
    // Otherwise each skill's own k.
    const allFact = isAllFact(poolsIn, ids);
    const pick = allFact ? factPick(poolsIn, ids, input, ctx) : null;
    const kAll = pick ? pick.k : 0;
    const per = ids.map((id) => {
        const its = poolsIn[id];
        const k = kAll || cands.find((d) => fitsMeasured(its, d, ctx)) || 1;
        const h = hAtK(its, k, ctx);
        const key = instructionKeyOf(its, input.skills);
        const own = SIGN_KEYS.has(key) || its.every((it) => !!it.cellPrompt);
        return { id, k, h: Number.isFinite(h) ? h : Infinity, own, name: poolName(input, its) };
    });
    const ks = [...new Set(per.map((x) => x.k))];
    if (ks.length > 1) {
        return { ok: false, N, per, why: `Mixed practice: ${per.map((x) => `${x.name} fits ${x.k} across`).join(', ')}, so the page prints in sections until boxes of different sizes can share a page.` };
    }
    const hs = per.map((x) => x.h);
    const hMax = Math.max(...hs);
    const hMin = Math.min(...hs);
    if (!Number.isFinite(hMax) || hMin / hMax < MIX_H_RATIO) {
        const tall = per.find((x) => x.h === hMax);
        return { ok: false, N, per, why: `Mixed practice: ${tall.name} needs much taller boxes than the other skills, so the page prints in sections until boxes of different sizes can share a page.` };
    }
    const silent = per.filter((x) => !x.own);
    if (silent.length) {
        return { ok: false, N, per, why: `Mixed practice: ${silent.map((x) => x.name).join(', ')} needs its own short instruction in each box, so the page prints in sections for now.` };
    }
    return { ok: true, k: ks[0], h: hMax, N: pick ? ks[0] : N, per, why: '', pick };
}

/** The mixed page's capacity: shelves of k under one "Solve." strip, counts dealt by weight. */
function mixedPacking(poolsIn, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: 1 });
    const m0 = bandMetrics(ctx, layoutHeader(frame.header));
    const m = Object.assign({}, m0, { budget: m0.budget - stripMmOf(input) });
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    let cls = mixedClass(poolsIn, input);
    if (!cls.ok) {
        // The host checked the probe; should the final items differ (a taller item dealt), the
        // page stays mixed on the narrowest k every skill fits, as tall as its tallest cell.
        const N = cls.N || latticeOf(input, ctx);
        const cands = kCandidates(poolsIn, ids, N, ctx);
        const kOf = (its) => cands.find((d) => fitsMeasured(its, d, ctx)) || 1;
        const k = Math.min(...ids.map((id) => kOf(poolsIn[id])));
        const h = Math.max(...ids.map((id) => hAtK(poolsIn[id], k, ctx)).map((x) => (Number.isFinite(x) ? x : 60)));
        cls = { ok: false, k, h: h > 0 ? h : 60, N, why: cls.why };
    }
    // The host's k (`input.mixK`, picked from the probe it dealt the counts for, critic M1 r3 D4):
    // the final items keep it when they fit it, so the shelves hold exactly the counts dealt.
    const kHost = Number(input.mixK) || 0;
    if (cls.ok && cls.pick && kHost && kHost !== cls.k && ids.every((id) => fitsMeasured(poolsIn[id], kHost, ctx))) {
        const h = Math.max(...ids.map((id) => hAtK(poolsIn[id], kHost, ctx)));
        if (Number.isFinite(h) && h > 0) {
            const all = ids.flatMap((id) => poolsIn[id]);
            cls = Object.assign({}, cls, { k: kHost, h, N: kHost, pick: Object.assign({}, cls.pick, { k: kHost, fill: factFillAt(all, kHost, 0, ctx.look), digitPt: FACT_LADDER[kHost], note: fillNote(cls.pick.tracks, kHost, factFillAt(all, kHost, 0, ctx.look), cls.pick.ladder, cls.pick.wide) }) });
        }
    }
    const maxShelves = { S: 9, M: 7, L: 5 }[ctx.size] || 5;
    const shelves = Math.max(1, Math.min(maxShelves, Math.floor((m.budget - m.strip) / cls.h)));
    const total = shelves * cls.k;
    const weights = Object.fromEntries((input.pools || []).filter((p) => ids.includes(p.id)).map((p) => [p.id, p.weight || 1]));
    for (const id of ids) if (!(id in weights)) weights[id] = 1;
    const deal = dealCounts(weights, total, { min: 2 });
    // (a shelf wider than 6 - or any all-fact page - is the page's own lattice: every shelf takes the same k)
    return { ctx, m, cls, ids, shelves, total, weights, deal, N: cls.k > 6 || cls.pick ? cls.k : cls.N };
}

/**
 * A fact item whose CELL says the count across it is drawn at (its payload's `columns`): the
 * cell's --fd and --fp then carry the ladder's digits for k, as its fact drawing already does,
 * instead of the preset's Auto count (critic M1 r3: a 20 pt fact in a cell marked 16 pt). The
 * drawing itself is the item's own render, unchanged.
 */
function atColumns(it, k) {
    const c = it.q && it.q.cell;
    if (!c || c.template !== 'fact' || !c.payload) return it;
    return Object.assign({}, it, { q: Object.assign({}, it.q, { cell: Object.assign({}, c, { payload: Object.assign({}, c.payload, { columns: k }) }) }) });
}

/** The fact of an item as one key, a fact and its turnaround together (4 + 2 / 2 + 4). */
function pairKeyOf(it) {
    const p = payloadOf(it);
    const op = { '+': '+', '*': 'x', x: 'x', '\u00d7': 'x', '-': '-', '\u2212': '-', '/': '/', '\u00f7': '/' }[String(p.op)] || '';
    if (!op || p.a === undefined || p.b === undefined) return '';
    const ab = [Number(p.a), Number(p.b)];
    return `${op}:${op === '+' || op === 'x' ? ab.sort((x, y) => x - y).join(',') : ab.join(',')}`;
}

/**
 * NO FACT TWICE ON ONE SHELF (critic M1 r4): a shelf holding the same fact twice, or a fact and
 * its turnaround, swaps the later one with a problem OF THE SAME SKILL on another shelf where
 * neither shelf then holds a pair twice (the skills' order - the interleave's runs - is kept).
 * Only a page that deals a fact more than once (fill on, a short supply) has any to move.
 */
function spreadShelves(queue, k) {
    const q = queue.slice();
    const keys = q.map(pairKeyOf);
    const shelfOf = (i) => Math.floor(i / k);
    const onShelf = (s, key, except) => keys.some((x, i) => i !== except && shelfOf(i) === s && x === key);
    for (let guard = 0; guard < q.length * 2; guard++) {
        const j = keys.findIndex((x, i) => x && keys.some((y, h) => h < i && y === x && shelfOf(h) === shelfOf(i)));
        if (j < 0) break;
        let best = -1;
        for (let d = 1; d < q.length && best < 0; d++) {
            for (const t of [j + d, j - d]) {
                if (t < 0 || t >= q.length || shelfOf(t) === shelfOf(j) || q[t].pool !== q[j].pool) continue;
                if (onShelf(shelfOf(j), keys[t], j) || onShelf(shelfOf(t), keys[j], t)) continue;
                best = t;
                break;
            }
        }
        if (best < 0) break;
        [q[j], q[best]] = [q[best], q[j]];
        [keys[j], keys[best]] = [keys[best], keys[j]];
    }
    return q;
}

function planMixed(input, pools) {
    const p = mixedPacking(pools, input);
    const { ctx, m, cls } = p;
    const k = cls.k;
    const labels0 = labelStyleOf(ctx.look, input.labels);
    // The notes name a skill by its strand ("Time", "Multiplying"), or by its label when two skills share one.
    const strandOf = (id) => {
        const it0 = pools[id][0] || {};
        const cat = String(it0.skill || '').split(':')[0] || (it0.q && it0.q.categoryId) || '';
        return STRAND_BY_CATEGORY[cat] || '';
    };
    const strands = p.ids.map(strandOf);
    const names = Object.fromEntries(p.ids.map((id, i) => {
        const name = strands[i] && strands.filter((x) => x === strands[i]).length === 1 ? strands[i] : poolName(input, pools[id]);
        return [id, { name, noun: `${name.toLowerCase()} problems` }];
    }));
    const items = p.ids.flatMap((id) => pools[id].map((it) => ({ key: id, it })));
    const mix = interleave(items, p.weights, deriveSeed('mixed-practice', input.seed || 0), { labels: names });
    const queue = spreadShelves(mix.order.map((e) => e.it), k);
    // A short page (`fill` off, a share that ran out): its shelves keep the full page's height and
    // the remainder stays plain paper (critic M1 r4: rows stretched to 43 mm floated the facts).
    const shortPage = queue.length < p.total;
    const shelves = [];
    for (let s = 0; s < queue.length; s += k) {
        const chunk = queue.slice(s, s + k);
        const own = hAtK(chunk, k, ctx);
        const h = Number.isFinite(own) && own > 0 ? Math.min(cls.h, own) : cls.h;
        // H13: the shortest skill's cells on the shelf keep its drawing at least 70 % of the
        // shelf's height, so the spare height shared in below never opens a 30 % empty band.
        const short = Math.min(...[...new Set(chunk.map((it) => it.pool))].map((id) => hAtK(chunk.filter((it) => it.pool === id), k, ctx)).filter((x) => Number.isFinite(x) && x > 0), h);
        shelves.push({ items: chunk, h, room: Math.max(0, short / 0.7 - h) });
    }
    const n = queue.length;
    // CL-13: quiet letters never double (aa.). An I Can mixed page of more than 26 problems numbers
    // every problem with the standard black tab instead (CL-21 "every fact numbered"; critic M1 r2).
    const labels = labels0 === 'letter' && n > 26 ? 'tab' : labels0;
    // CL-31 (critic M1 r3 D6): the tab follows the EFFECTIVE digit size - on an all-fact page the
    // ladder's for k (20 pt at 7 across: a 5 mm tab with a 10 pt numeral), not the preset's.
    const pick = cls.pick || null;
    const tabStep = pick ? factTab(FACT_LADDER[k]) : 0;
    const tabCls = tabStep && tabStep !== factTab(SIZES[ctx.size].digitPt) ? `ws-tab${tabStep}` : '';
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: n });
    const instr = instructionText('default-solve');
    const pages = [];
    let cur = null;
    let start = 1;
    const used = shortPage ? m.strip + p.shelves * cls.h : m.strip + shelves.reduce((a, sh) => a + sh.h, 0);
    // (1.5 mm kept back: shares that sum to the whole budget must not spill a shelf on rounding)
    const spare = Math.max(0, m.budget - used - 1.5);
    // (critic M1 r2: the whole spare is shared, within 12 mm a shelf and the H13 room of its shortest skill)
    const grow = (sh) => (shelves.length ? Math.max(0, Math.min(12, sh.room, spare / (shortPage ? p.shelves : shelves.length))) : 0);
    for (const sh of shelves) {
        const budget = pages.length > 1 ? bandMetrics(ctx, layoutHeader(frame.header), { cont: true }).budget : m.budget;
        const h = sh.h + grow(sh);
        if (!cur || cur.used + h > budget) {
            // PG-22: a page the mix continues on repeats the band's instruction.
            cur = { sections: [], used: m.strip };
            if (pages.length === 0 && input.stepStrip) cur.sections.push({ kind: 'html', html: input.stepStrip });
            cur.band = { kind: 'band', label: '', instr, contents: [] };
            cur.sections.push(cur.band);
            pages.push(cur);
        }
        const cells = sh.items.map((it) => planItem(pick ? atColumns(it, k) : it, { cols: k }));
        // A last shelf of fewer than k problems keeps the full grid (PG-15 / PT-ENG-7, owner
        // 2026-10-23): the frame stays a closed rectangle at the full width, and the places it does
        // not use are ONE unruled blank area inside it (grid.js blankRun) - no cell borders, no
        // labels, never an empty box - at the full shelf height.
        cur.band.contents.push(gridPart(cells, { cols: k, rows: 1, cellH: h, labels, start, cls: tabCls }));
        start += sh.items.length;
        cur.used += h;
    }
    const achieved = {};
    for (const it of queue) achieved[it.pool] = (achieved[it.pool] || 0) + 1;
    // (a page short of its places: the counts follow the supply, not the weights - no weights note)
    const weightNote = (t) => /on a \d+-problem page gives/.test(t);
    const notes = [...new Set([...p.deal.notes, ...mix.notes].filter((t) => !(shortPage && weightNote(t))).concat(pick && pick.note ? [pick.note] : []))];
    return assemble(ROLE_ID, input, frame, pages.map((pg) => ({ sections: pg.sections })), {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: p.N, achieved, arrangement: 'mixed', notes,
            // (the across pick of an all-fact page: digits, fill, tracks - the mixed-page check reads it)
            factPick: pick ? { k, digitPt: FACT_LADDER[k], fill: Math.round(pick.fill * 1000) / 1000, tracks: pick.tracks, tabStep, ladder: pick.ladder } : null,
            interleave: { keys: mix.order.map((e) => e.key), counts: mix.counts, cap: mix.cap, maxRun: mix.maxRun, longest: mix.longest, firstThird: mix.firstThird, relaxed: mix.relaxed, notes: mix.notes, deal: p.deal.counts },
            fits: [{ cols: k, rows: shelves.length, perPage: p.total, line: `Fits: ${shelves.length} shelves of ${k} on a ${p.N}-unit lattice, ${n} problems mixed, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }],
        },
    });
}

/* ============================================================ the MIXED arrangement, M2 */

/**
 * M2 (IMPROVEMENT_PLAN 3.3, PT-MIX-5): any 2+ skills mix, whatever their size class. Each pool's
 * class is its count across k on the page lattice N (span N / k units) and its tallest cell at k;
 * sheet/mixed-pack.js groups the pools that can share shelves (H13), packs blocks of small boxes
 * beside bigger ones, and splits exact counts over pages. A page of one fact class (M1's
 * factPick) keeps its across count: the lattice is then k itself.
 */
const isWordLike = (its) => its.some((it) => it.fclass === 'word' || it.fclass === 'wide');
/** The counts across a pool may take at this size: the lattice's divisors up to 6, and N itself. */
function m2Ks(its, N, ctx) {
    const floor = (SIZES[ctx.size] || SIZES.L).digitPt;
    const allFact = its.every((it) => it.template === 'fact');
    const ks = divisorsDesc(N).filter((d) => d <= 6 || d === N);
    // TY-30: a fact never prints under the size's working digits (the ladder sets them by k)
    return ks.filter((d) => !allFact || (FACT_LADDER[d] || 28) >= floor);
}
export function m2Classes(poolsIn, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    const one = mixedClass(poolsIn, input);
    let N = latticeOf(input, ctx);
    const cls = {};
    if (one.ok && one.pick) {
        // one fact class (M1): every pool k across, the page's lattice k
        N = Number(input.mixK) && ids.every((id) => fitsMeasured(poolsIn[id], Number(input.mixK), ctx)) ? Number(input.mixK) : one.k;
        for (const id of ids) {
            const h = hAtK(poolsIn[id], N, ctx);
            cls[id] = { k: N, s: 1, h: Number.isFinite(h) && h > 0 ? h : one.h, full: false, fact: true };
        }
    } else {
        for (const id of ids) {
            const its = poolsIn[id];
            const full = isWordLike(its);
            const k = full ? 1 : (m2Ks(its, N, ctx).find((d) => fitsMeasured(its, d, ctx)) || 1);
            const h = hAtK(its, k, ctx);
            cls[id] = { k, s: N / k, h: Number.isFinite(h) && h > 0 ? h : 60, full: full || k === 1 };
        }
    }
    return { ctx, N, ids, cls, groups: classify(ids, cls, N), one };
}

/** The page budgets of a mixed page: page 1 and a continued page, less the one band strip. */
function m2Budgets(input, ctx) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: 1 });
    const m0 = bandMetrics(ctx, layoutHeader(frame.header));
    const mc = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    return { m0, first: m0.budget - stripMmOf(input) - m0.strip - 1.5, cont: mc.budget - mc.strip - 1.5, maxRows: MAX_SHELVES[ctx.size] || 5 };
}

const m2Weights = (input, ids) => {
    const w = Object.fromEntries((input.pools || []).filter((p) => ids.includes(p.id)).map((p) => [p.id, p.weight || 1]));
    for (const id of ids) if (!(id in w)) w[id] = 1;
    // (no weights set: every skill Equal - the notes read "Equal : Equal", never "Less : Less")
    if (ids.every((id) => w[id] === 1)) for (const id of ids) w[id] = 2;
    return w;
};

/**
 * The problems each pool gets: the exact counts asked, else one page filled by weight x pages.
 * The teacher's distribution is held FIRST (critic M2 r1 D1): every count within 1 of its weighted
 * share (two of each the one exception, mixed-pack withinShare). The size ladder (R1-7 / LESSONS
 * L1, `input.mustBeat` from the host) is met only with the weights held: when this size cannot
 * print more problems than the next size up without changing the mix, the notes say so and the
 * mix stands. `perPage` is what one page holds for THIS mix at this size (exact counts: their own
 * proportions), the figure the dialog reads (critic M2 r1 D7).
 */
export function m2Counts(poolsIn, input) {
    const c = m2Classes(poolsIn, input);
    const b = m2Budgets(input, c.ctx);
    const w0 = m2Weights(input, c.ids);
    const exact = input.exactCounts || null;
    const counts0 = exact ? Object.fromEntries(c.ids.map((id) => [id, Math.max(0, Math.floor(Number(exact[id]) || 0))])) : null;
    // (exact counts: a page holds them in their own proportions)
    const wPage = counts0 && c.ids.every((id) => counts0[id] > 0) ? counts0 : w0;
    // (exact counts: no fill-the-rest - the capacity is the page at THEIR proportions)
    let fill = fillPage(c.groups, wPage, b.first, b.maxRows, { fillRest: !counts0 });
    const sum = (f) => c.ids.reduce((a, id) => a + f.counts[id], 0);
    let ladderNote = '';
    const must = Number(input.mustBeat) || 0;
    // (the size ladder: where the page at the weights holds no more than the next size up, the most
    // compact skill fills more of it - as "fill the rest" does - and the notes say so in plain words)
    if (must && !exact && sum(fill) <= must) {
        const area = (id) => { const g = c.groups.find((x) => x.pools.includes(id)); const sh = g.shape[id]; return sh.s * sh.r * g.U; };
        const small = c.ids.slice().sort((a, b2) => area(a) - area(b2))[0];
        for (const f of [1.5, 2, 3, 4, 6]) {
            const f2 = fillPage(c.groups, Object.assign({}, w0, { [small]: w0[small] * f }), b.first, b.maxRows);
            if (sum(f2) > must) { fill = f2; break; }
        }
    }
    if (must && !exact && sum(fill) <= must) {
        ladderNote = `Mixed practice: with the skills in the proportions asked, this size holds ${sum(fill)} problems a page, no more than the next size up (${must}).`;
    }
    const P = Math.max(1, Number(input.mixPages) || 1);
    const counts = counts0 || Object.fromEntries(c.ids.map((id) => [id, fill.counts[id] * P]));
    return { counts, perPage: sum(fill), classes: c, fill, ladderNote };
}

/** The longest run of one skill in print order, counted in turns (a block of small boxes is one). */
function runsInTurns(turnKeys) {
    let best = 0;
    let run = 0;
    let last = null;
    for (const k of turnKeys) {
        if (k !== null && k === last) run++; else run = k === null ? 0 : 1;
        best = Math.max(best, run);
        last = k;
    }
    return best;
}

function planMixedM2(input, pools) {
    const c = m2Classes(pools, input);
    const { ctx, N, ids, groups, cls } = c;
    const b = m2Budgets(input, ctx);
    const weights = m2Weights(input, ids);
    const labels0 = labelStyleOf(ctx.look, input.labels);
    const strandOf = (id) => {
        const it0 = pools[id][0] || {};
        const cat = String(it0.skill || '').split(':')[0] || (it0.q && it0.q.categoryId) || '';
        return STRAND_BY_CATEGORY[cat] || '';
    };
    const strands = ids.map(strandOf);
    const names = Object.fromEntries(ids.map((id, i) => {
        const name = strands[i] && strands.filter((x) => x === strands[i]).length === 1 ? strands[i] : poolName(input, pools[id]);
        return [id, { name, noun: /problems?$/i.test(name) ? name.toLowerCase() : `${name.toLowerCase()} problems` }];
    }));
    // (exact counts: as many pages as they need, from one; fill: the pages asked)
    const asked = input.exactCounts ? 1 : Math.max(1, Number(input.mixPages) || 1);
    const total = ids.reduce((a, id) => a + pools[id].length, 0);
    const seed0 = deriveSeed('mixed-practice', input.seed || 0);
    // each cell's own height at its count across (cached: the packer asks per page)
    const hCache = new Map();
    const cellH = (it, k) => {
        const key = it;
        if (!hCache.has(key)) { const v = hAtK([it], Math.min(k, 10), ctx); hCache.set(key, Number.isFinite(v) && v > 0 ? v : (cls[it.pool] || {}).h || 40); }
        return hCache.get(key);
    };
    // Pages: the fewest (from those asked) whose every page holds its share.
    let packed = null;
    // (critic M2 r1 D5: every page carries every skill where the skill has a problem a page to give
    // - a lone problem rather than a page of one skill; where that spread would cost a page, two of
    // each on fewer pages)
    let found = false;
    for (let P = asked; P <= 12 && !found; P++) {
        for (const spread of [true, false]) {
            const split = splitPages(groups, pools, P, { spread });
            const pages = split.map((byPool, i) => packPage(groups, byPool, N, (seed0 + i * 104729) >>> 0, { weights, labels: names, hOf: cellH }));
            const fits = pages.every((pg, i) => {
                const h = pg.shelves.reduce((a, s) => a + s.H, 0);
                const rows = pg.shelves.reduce((a, s) => a + s.R, 0);
                return h <= (i ? b.cont : b.first) + 1e-6 && rows <= b.maxRows;
            });
            packed = pages;
            packed.spread = spread;
            packed.split = split;
            if (fits) { found = true; break; }
        }
    }
    // REBALANCE (coordinator r2, C2): a page before the last that is under 85 % full takes a problem
    // from the page with the most of a skill, when both pages still fit (and the giver stays 85 %
    // full, or is the last page). The counts stay the teacher's; only their pages change.
    if (found && packed.split.length > 1) {
        const split = packed.split.map((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, v.slice()])));
        const pack = (byPool, i) => packPage(groups, byPool, N, (seed0 + i * 104729) >>> 0, { weights, labels: names, hOf: cellH });
        const budgetOf = (i) => (i ? b.cont : b.first);
        const hOfPg = (pg) => pg.shelves.reduce((a, s2) => a + s2.H, 0);
        const fitsPg = (pg, i) => hOfPg(pg) <= budgetOf(i) + 1e-6 && pg.shelves.reduce((a, s2) => a + s2.R, 0) <= b.maxRows;
        const pages = split.map(pack);
        const last = pages.length - 1;
        for (let guard = 0; guard < 24; guard++) {
            const i = pages.findIndex((pg, x) => x < last && hOfPg(pg) < 0.85 * budgetOf(x));
            if (i < 0) break;
            let moved = false;
            for (const id of ids) {
                const donors = pages.map((_, j) => j).filter((j) => j !== i && (split[j][id] || []).length > 0)
                    .sort((a, c2) => (split[c2][id] || []).length - (split[a][id] || []).length);
                for (const j of donors) {
                    const a2 = Object.assign({}, split[i], { [id]: [...(split[i][id] || []), split[j][id][split[j][id].length - 1]] });
                    const b2 = Object.assign({}, split[j], { [id]: split[j][id].slice(0, -1) });
                    if (!b2[id].length) delete b2[id];
                    const pa = pack(a2, i);
                    const pb = pack(b2, j);
                    if (!fitsPg(pa, i) || !fitsPg(pb, j) || hOfPg(pa) <= hOfPg(pages[i]) + 1e-6) continue;
                    if (j < last && hOfPg(pb) < 0.85 * budgetOf(j)) continue;
                    // (never a trailing slot made on a page before the last - D7 - but by a skill spread one a page)
                    const trails = (pg) => pg.shelves.filter((s2) => s2.trail).length;
                    if (pools[id].length >= 2 * pages.length && (trails(pa) > trails(pages[i]) || (j < last && trails(pb) > trails(pages[j])))) continue;
                    split[i] = a2; split[j] = b2; pages[i] = pa; pages[j] = pb;
                    moved = true;
                    break;
                }
                if (moved) break;
            }
            if (!moved) break;
        }
        // (the items keep their pool's order across the pages: re-slice each pool page by page)
        const ordered = split.map(() => ({}));
        for (const id of ids) {
            let at = 0;
            split.forEach((x, pi) => { const k = (x[id] || []).length; if (k) ordered[pi][id] = pools[id].slice(at, at + k); at += k; });
        }
        const repacked = ordered.map(pack);
        if (repacked.every(fitsPg)) { const sp = packed.spread; packed = repacked; packed.spread = sp; packed.split = ordered; }
    }
    const used = packed.filter((pg) => pg.shelves.length);
    const n = used.reduce((a, pg) => a + pg.order.length, 0);
    const labels = labels0 === 'letter' && n > 26 ? 'tab' : labels0;
    const frame = frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: n });
    const instr = instructionText('default-solve');
    const pages = [];
    let start = 1;
    const notes = [];
    const allTurns = [];
    const runMax = {};
    const runsByPage = [];
    let longest = 0;
    const achieved = {};
    for (const [pi, pg] of used.entries()) {
        const budget = pi ? b.cont : b.first;
        const sections = [];
        if (pi === 0 && input.stepStrip) sections.push({ kind: 'html', html: input.stepStrip });
        const band = { kind: 'band', label: '', instr, contents: [] };
        sections.push(band);
        // the spare height shared into the shelves, within 12 mm a shelf and each cell's H13 room
        const hSum = pg.shelves.reduce((a, s) => a + s.H, 0);
        const spare = Math.max(0, budget - hSum);
        const turnKeys = [];
        // H13 room: a cell r rows tall in a shelf of R rows keeps its drawing >= 70 % of its box
        const roomOf = (sh) => Math.min(...sh.cells.map((x) => {
            const own = hAtK([x.it], Math.min(x.k, 10), ctx);
            const h = Number.isFinite(own) && own > 0 ? own : cls[x.pool].h;
            return ((h - NAT_MM) * sh.R) / (H13_FILL * x.rows) - sh.H;
        }));
        // (a shelf of long procedures only takes what the others leave: its spare height is the
        // pupil's working space, as on its own single-skill page - layout.js 'long')
        const workOnly = (sh) => sh.cells.every((x) => workRowsOf(x.it) > 0);
        const grows = pg.shelves.map((sh) => (workOnly(sh) ? 0 : Math.max(0, Math.min(12, roomOf(sh), spare / pg.shelves.length))));
        const nWork = pg.shelves.filter(workOnly).length;
        const left = spare - grows.reduce((a, x) => a + x, 0);
        pg.shelves.forEach((sh, i) => { if (workOnly(sh)) grows[i] = Math.max(0, left / nWork); });
        // (D1: the weights held, a fill page may end short of the frame - the notes say why)
        const openMm = budget - hSum - grows.reduce((a, x) => a + x, 0);
        if (!input.exactCounts && used.length === 1 && pi === 0) {
            const got = Object.fromEntries(ids.map((id) => [id, pg.order.filter((x) => x === id).length]));
            if (!withinShare(got, weights, ids)) {
                const over = ids.slice().sort((a, c2) => got[c2] / (weights[c2] || 1) - got[a] / (weights[a] || 1))[0];
                notes.push(`${names[over].name} fills the rest of the page: ${ids.map((id) => `${got[id]} ${names[id].noun}`).join(', ')}.`);
            }
        }
        if (!input.exactCounts && used.length === 1 && openMm > 0.2 * budget) {
            notes.push(`Mixed practice: with the skills in the proportions asked, the page holds ${pg.order.length} problems; one more of any skill would need another shelf, so the foot of the page is left open.`);
        }
        for (const [si, sh] of pg.shelves.entries()) {
            const grow = grows[si];
            const H = sh.H + grow;
            const items = sh.cells.map((x) => {
                const it = cls[x.pool].fact || x.it.template === 'fact' ? atColumns(x.it, x.k) : x.it;
                return Object.assign(planItem(markWork(it), { cols: x.k }), { place: { col: x.col, row: x.row, span: x.span, rows: x.rows } });
            });
            band.contents.push(Object.assign(gridPart(items, { cols: N, rows: sh.R, cellH: H / sh.R, labels, start }), { trail: sh.trail }));
            start += items.length;
            // the turns in print order: a cell of 2 x 1 or more is one; a block of small boxes is one
            let lastBlock = null;
            for (const x of sh.cells) {
                const g = groups[sh.g];
                const small = g.shape[x.pool].m > 1;
                const blk = !small ? null : sh.row ? `row:${sh.g}:${start}` : sh.tail ? `tail:${start}` : `${sh.g}:${Math.floor((x.col - 1) / g.sB)}:${start}`;
                if (small && blk === lastBlock) {
                    if (turnKeys[turnKeys.length - 1] !== x.pool) turnKeys[turnKeys.length - 1] = null;
                    continue;
                }
                turnKeys.push(x.pool);
                lastBlock = blk;
            }
            for (const x of sh.cells) achieved[x.pool] = (achieved[x.pool] || 0) + 1;
        }
        longest = Math.max(longest, runsInTurns(turnKeys));
        allTurns.push(turnKeys);
        // the run notes from the PRINTED order (the weights win, IMPROVEMENT_PLAN 3.3): a skill that
        // comes more than twice in a row says so; the order's own run and first-third notes are not
        // the page's once shelves are built
        const pageRuns = {};
        for (const id of ids) {
            let r = 0;
            let run = 0;
            for (const k of turnKeys) { run = k === id ? run + 1 : 0; r = Math.max(r, run); }
            if (r > 2 && new Set(turnKeys.filter((k) => k !== null)).size > 1) runMax[id] = Math.max(runMax[id] || 0, r);
            // the weights-win cap (IMPROVEMENT_PLAN 3.3): max(2, ceil(major / (minor + 1))) turns
            const t = turnKeys.filter((k) => k === id).length;
            pageRuns[id] = { run: r, turns: t, cap: Math.max(2, Math.ceil(t / (turnKeys.length - t + 1))) };
        }
        runsByPage.push(pageRuns);
        // (exact counts are the teacher's own: no note that they differ from the weights)
        for (const t of pg.mix.notes) if (!/come in a row|first comes after| on a \d+-problem page gives /.test(t)) notes.push(t);
        pages.push({ sections });
    }
    // The run note (critic M2 r1 D5): runs counted in PRINT order across the page breaks - in turns
    // for the rule (a block of small boxes is one turn), in problems for the figure the teacher reads.
    const turnsAll = allTurns.flat();
    const printAll = used.flatMap((pg) => pg.order);
    const runIn = (seq, id) => { let r = 0; let run = 0; for (const k of seq) { run = k === id ? run + 1 : 0; r = Math.max(r, run); } return r; };
    const runNotes = {};
    for (const id of ids) {
        const rt = runIn(turnsAll, id);
        if (rt > 2 && new Set(turnsAll.filter((k) => k !== null)).size > 1) {
            runNotes[id] = runIn(printAll, id);
            notes.push(`${names[id].name} takes most of the page, so up to ${runNotes[id]} ${names[id].noun} come in a row`);
        }
    }
    longest = Math.max(longest, runsInTurns(turnsAll));
    if (input.ladderNote) notes.push(input.ladderNote);
    // Q-M2: a page added for the problems asked, never a problem dropped
    if (used.length > asked) notes.push(`Mixed practice: the ${n} problems need ${used.length} pages, so ${used.length - asked === 1 ? 'a page was' : `${used.length - asked} pages were`} added.`);
    // a skill left off a page because one a page would have needed another page (D5)
    if (packed.spread === false && used.length > 1) {
        const off = ids.filter((id) => used.some((pg) => !pg.order.includes(id)) && pools[id].length >= used.length);
        for (const id of off) notes.push(`Mixed practice: ${names[id].name} is on ${used.filter((pg) => pg.order.includes(id)).length} of the ${used.length} pages: one on every page would need another page.`);
    }
    // two of each per page
    const lone = [];
    for (const pg of used) for (const id of ids) { const k = pg.order.filter((x) => x === id).length; if (k === 1) lone.push(names[id].name); }
    if (lone.length) notes.push(`Mixed practice: ${[...new Set(lone)].join(' and ')} has only one problem on a page.`);
    if (total > n) notes.push(`Mixed practice: ${total - n} problems did not fit.`);
    // (what a page holds for THIS mix at this size - exact counts in their own proportions, D7)
    // (exact counts: and never less than a printed page holds - the dialog sizes the counts by it)
    const perPage = Math.max(m2Counts(pools, input).perPage, ...(input.exactCounts ? used.map((pg) => pg.order.length) : []));
    const capNote = ids.some((id) => cls[id].k !== cls[ids[0]].k)
        ? `Mixed practice: ${ids.map((id) => `${names[id].name} ${cls[id].k} across`).join(', ')}.` : '';
    return assemble(ROLE_ID, input, frame, pages, {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: N, achieved, arrangement: 'mixed', notes: [...new Set(notes)],
            m2: {
                groups: groups.map((g) => ({ pools: g.pools, R: g.R, U: Math.round(g.U * 10) / 10, sB: g.sB, T: g.T, shape: g.shape })),
                classes: Object.fromEntries(ids.map((id) => [id, { k: cls[id].k, s: cls[id].s, h: Math.round(cls[id].h * 10) / 10, full: !!cls[id].full }])),
                turns: allTurns, longest, pages: used.map((pg) => pg.order), asked, capNote, mustBeat: Number(input.mustBeat) || 0, perPage, runs: runsByPage, runNotes, turnsAll: allTurns.flat(),
            },
            interleave: { keys: used.flatMap((pg) => pg.order), longest, notes: used.flatMap((pg) => pg.mix.notes) },
            fits: [{ cols: N, rows: used.reduce((a, pg) => a + pg.shelves.length, 0), perPage, line: `Fits: ${n} problems mixed on a ${N}-unit lattice, ${used.length} page${used.length > 1 ? 's' : ''} (${perPage} a page).` }],
        },
    });
}

export function counts(pools, input) {
    if (input.arrangement === 'mixed' && input.mixM2) return Object.assign({}, m2Counts(pools, input).counts);
    if (input.arrangement === 'mixed') return Object.assign({}, mixedPacking(pools, input).deal.counts);
    const p = packing(pools, input);
    const out = {};
    for (const id of p.ids) out[id] = p.exact ? p.shelf[id].want : p.shelf[id].n * p.shelf[id].per;
    return out;
}

export function plan(input = {}) {
    const poolIds = [...new Set((input.items || []).map((it) => it.pool))];
    const pools = Object.fromEntries(poolIds.map((id) => [id, poolItems(input, id)]));
    if (input.arrangement === 'mixed' && input.mixM2) return planMixedM2(input, pools);
    if (input.arrangement === 'mixed') return planMixed(input, pools);
    const p = packing(pools, input);
    const { ctx, m } = p;
    const labels = labelStyleOf(ctx.look, input.labels);
    // Lay the shelves out skill by skill (GROUPED), paginating whole shelves.
    const shelves = [];
    const A = input.anchors && input.anchors.byPool ? input.anchors : null;
    for (const id of p.ids) {
        const sh = p.shelf[id];
        const its = pools[id].slice(0, sh.n * sh.per);
        for (let s = 0; s < sh.n; s++) {
            let chunk = its.slice(s * sh.per, (s + 1) * sh.per);
            // SIDE: [twin | problem] pairs, the twin first (example, then problem).
            if (sh.pairs) chunk = chunk.flatMap((it) => (it.twin ? [it.twin, it] : [it]));
            const anchor = s === 0 && sh.band && A ? ((A.byPool[id] || {}).band || [])[0] : null;
            // H13 (owner 2026-09-25): a shelf is as tall as the tallest item IT holds, not the
            // tallest its skill could deal - a 3 x 5 chart window's row was sized for a bigger one.
            const own = chunk.length ? hAtK(chunk.filter((it) => !it.anchor), sh.k, ctx) : sh.h;
            const h = Number.isFinite(own) && own > 0 ? Math.min(sh.h, own) : sh.h;
            if (chunk.length) shelves.push({ id, items: chunk, k: sh.k, h, anchor, bandMm: sh.band });
        }
    }
    const n = shelves.reduce((a, s) => a + s.items.filter((it) => !it.anchor).length, 0);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: n });
    const pages = [];
    let cur = null;
    let start = 1;
    const used = shelves.reduce((a, sh, i) => a + (i === 0 || shelves[i - 1].id !== sh.id ? m.strip : 0) + sh.h + (sh.anchor ? sh.bandMm : 0), 0);
    // (1 mm kept back: shares that sum to the whole budget must not spill a shelf on rounding.)
    const spare = p.pages > 1 ? 0 : Math.max(0, m.budget - used - (input.fill ? 1 : 0));
    // The spare height is shared into the shelves only as far as a cell keeps its drawing filling
    // it (H13: never an empty band of 30% of a cell): a tenth of a shelf's own height at most.
    const growOf = (sh) => (shelves.length ? ((input.fill || input.growLast) ? Math.min(sh.h * 0.35, spare / shelves.length) : Math.min(12, sh.h * 0.1, spare / shelves.length)) : 0);
    // `growLast` (the detailed lesson maker): the spare is water-filled - a shelf that reaches its
    // 35 % cap passes the rest to the others - so no bordered empty strip is left under the
    // last row (critic r3 nit, P4m-1). Absent on every other Mixed page (equal shares, as before).
    const fillShares = (() => {
        if (!input.growLast || !shelves.length) return null;
        const g = shelves.map(() => 0);
        let left = spare, open = shelves.map((_, i) => i);
        for (let it = 0; it < 8 && left > 0.05 && open.length; it++) {
            const each = left / open.length;
            const next = [];
            for (const i of open) { const room = shelves[i].h * 0.35 - g[i]; const add = Math.min(room, each); g[i] += add; left -= add; if (room - add > 0.05) next.push(i); }
            open = next;
        }
        return g;
    })();
    for (const [i, sh] of shelves.entries()) {
        const grow = fillShares ? fillShares[i] : growOf(sh);
        const firstOfSkill = i === 0 || shelves[i - 1].id !== sh.id;
        const budget = pages.length > 1 ? p.mCont.budget : m.budget;   // the page `cur` is on
        let bandH = m.strip + sh.h + grow + (sh.anchor ? sh.bandMm : 0);
        let joins = !firstOfSkill && !!cur && cur.sections.some((x) => x.kind === 'band') && cur.used + bandH - m.strip <= budget + 1e-6;
        if (joins) bandH -= m.strip;
        // (+ 1e-6: shares that sum to the whole budget spilled a shelf to page 2 on rounding, R1-7)
        if (!cur || cur.used + bandH > budget + 1e-6) {
            cur = { sections: pages.length === 0 && input.stepStrip ? [{ kind: 'html', html: input.stepStrip }] : [], used: 0 };
            pages.push(cur);
            joins = false;
            bandH = m.strip + sh.h + grow + (sh.anchor ? sh.bandMm : 0);
        }
        const first = sh.items.find((it) => !it.anchor);
        // A preset skill's items carry the host's id in q.skillId and the preset's in q.presetId
        // (generate-question.js): the band is the skill the teacher chose (pilot D8).
        const fq = (first && first.q) || null;
        const skill = (fq && ((input.skills || []).find((s) => s.skillId === (fq.presetId || fq.skillId) && (!fq.categoryId || s.categoryId === fq.categoryId))
            || (input.skills || []).find((s) => s.skillId === fq.skillId))) || {};
        // `sectionLabel` on the skill ref (the detailed lesson maker, critic D17): the band's own name.
        const title = (first && first.q && first.q.sectionLabel) || STRAND_BY_CATEGORY[skill.categoryId] || skillWords(skill).strand || 'Practice';
        const pupil = sh.items.filter((it) => !it.anchor);
        // (above 6 across a fact draws at the ladder's digits for k, as on a mixed page: atColumns)
        const grid = gridPart(sh.items.map((it) => (it.anchor ? anchorPlanItem(it, Math.min(sh.k, 6)) : planItem(markWork(sh.k > 6 ? atColumns(it, sh.k) : it), { cols: sh.k }))), { cols: sh.k, rows: 1, cellH: sh.h + grow, labels, start });
        if (joins) {
            // A further shelf of the same skill on the same page: its grid under the last one.
            const prev = cur.sections[cur.sections.length - 1];
            prev.contents = (prev.contents || [prev.content]).concat([grid]);
            delete prev.content;
            start += pupil.length;
            cur.used += bandH;
            continue;
        }
        // PG-22: a skill continued on a new page repeats its title and instruction.
        const band = {
            kind: 'band', label: title, instr: instructionText(instructionKeyOf(pupil, input.skills), pupil),
        };
        // SECTIONS: the skill's worked example sits in its band, above its problems.
        if (sh.anchor) band.contents = [gridPart([anchorPlanItem(sh.anchor, 1)], { cols: 1, rows: 1, cellH: sh.bandMm, labels: 'none', start, cls: 'mq-anchorgrid' }), grid];
        else band.content = grid;
        cur.sections.push(band);
        start += pupil.length;
        cur.used += bandH;
    }
    // `growLast` (the detailed lesson maker's Mixed page): the last band of each page takes the spare
    // height - one unruled trailing area inside the frame (V22 §8.12.4) - so the body never ends
    // blank. Absent on every other Mixed page.
    if (input.growLast) for (const pg of pages) { const bands = pg.sections.filter((x) => x.kind === 'band'); if (bands.length) bands[bands.length - 1].grow = true; }
    const achieved = {};
    for (const sh of shelves) achieved[sh.id] = (achieved[sh.id] || 0) + sh.items.filter((it) => !it.anchor).length;
    return assemble(ROLE_ID, input, frame, pages.map((pg) => ({ sections: pg.sections })), {
        defaultLook: DEFAULT_LOOK,
        meta: { items: n, scoreOutOf: n, units: p.N, achieved, arrangement: 'sections', ...(p.ladderNote ? { notes: [p.ladderNote] } : {}),
            // (cols: the count across the page prints - its widest shelf - not the lattice; R1-7)
            fits: [{ cols: shelves.length ? Math.max(...shelves.map((x) => x.k)) : p.N, rows: shelves.length, line: `Fits: ${shelves.length} shelves on a ${p.N}-unit lattice, ${n} problems, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, counts, plan, mixedClass, MIX_H_RATIO, factPick, factFillAt, FACT_FILL, m2Classes, m2Counts };
