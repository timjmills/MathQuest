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
import { HEADER_PARTS_MM } from '../layout.js';
import { interleave, dealCounts } from '../interleave.js';
import { SIZES, FACT_LADDER, FACT_AUTO_COLS, factCellHMm, factTab } from '../index.js';
import { factWidthMm, factDigitTracks, factPadTop } from '../cells/fact.js';
import { classify, withinShare, H13_FILL, NAT_MM, orderOf, runsIn } from '../mixed-pack.js';

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
/**
 * A KIT long procedure (2-digit x on the kit stack with its partial-product rows, MB-5): its work
 * zone is drawn - the rows under the rule - and the room under its second rule is its answer row,
 * so the spare height a page gives it is working space, as on its own single-skill page ('long').
 */
export const kitWork = (it) => !!(it && it.q && it.q.cell && it.q.cell.template === 'stack' && it.q.cell.payload && it.q.cell.payload.partials);
function markWork(it, size) {
    const mm = kitWork(it) ? (SIZES[size] || SIZES.L).answerMm : workRowsOf(it) * WORK_ROW_MM;
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
        // (owner 2026-11-03, layout A: a page of ONE size class is rows of one kind - 'fact' where every box is a fact
        // drawing, else 'large' - written on each cell)
        const kindM1 = sh.items.every((x) => x.template === 'fact') ? 'fact' : 'large';
        const cells = sh.items.map((it) => Object.assign(planItem(pick ? atColumns(it, k) : it, { cols: k }), mixLayoutOf(input) === 'rows' ? { kind: kindM1 } : {}));
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
    // (critic r3 P2: every count across up to 6, not only the lattice's divisors - the shelves are
    // laid by width (m2Layout), so a 2-digit stack that fits 3 across is 3 across, never a half-page
    // cell 23 % filled because the lattice is 4)
    const ks = [...new Set([...divisorsDesc(N).filter((d) => d > 6 && d === N), 6, 5, 4, 3, 2, 1])].sort((a, b) => b - a);
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
            cls[id] = { k, s: N / k, h: Number.isFinite(h) && h > 0 ? h : 60, full: full || k === 1, work: its.length > 0 && its.every(kitWork) };
        }
        // (§1.7: a page with a kit stack - 2-digit x, a regrouping column - draws its facts at the
        // stack's digits with their answer rule on the stack's line: one baseline, one digit size)
        if (ids.some((id) => poolsIn[id].some((it) => it.template === 'stack'))) {
            const f = stackPageFact(ctx);
            const lab = labelStyleOf(ctx.look, input.labels);
            for (const id of ids) {
                if (!poolsIn[id].every((it) => it.template === 'fact')) continue;
                const h = hAtK(poolsIn[id], f.kd, ctx);
                const padDelta = f.padTop - factPadTop(lab, f.kd);
                Object.assign(cls[id], { kd: f.kd, pt: f.pt, padTop: f.padTop, padDelta, h: (Number.isFinite(h) && h > 0 ? h : cls[id].h) + padDelta });
            }
        }
    }
    // (H13 on a shared row: facts beside cells up to 1.45 x their height - one row, not two - are
    // drawn a count across bigger (the fact ladder's larger digits, never smaller) until their
    // drawing fills >= 70 % of the row the taller cells set; content grows, never shrinks)
    if (!(one.ok && one.pick)) {
        for (const id of ids) {
            const c0 = cls[id];
            if (c0.kd || !poolsIn[id].every((it) => it.template === 'fact')) continue;
            const others = ids.filter((x) => x !== id && !cls[x].full);
            if (!others.length) continue;
            // (the tallest cell of the others that would share a ROW with the facts: all of them when
            // none stands two rows tall; else the others' cells short enough to stand as small boxes)
            const hAll = others.flatMap((x) => poolsIn[x].map((it) => hAtK([it], Math.min(cls[x].k, 10), ctx))).filter((v) => Number.isFinite(v) && v > 0);
            const hO = () => Math.max(0, ...hAll.filter((v) => v < 1.45 * c0.h));
            if (!hO()) continue;
            for (let k2 = c0.k - 1; k2 >= Math.max(1, c0.k - 4) && (c0.h - NAT_MM) < H13_FILL * hO(); k2--) {
                const h2 = hAtK(poolsIn[id], k2, ctx);
                if (!Number.isFinite(h2) || h2 <= c0.h) continue;
                Object.assign(c0, { k: k2, s: N / k2, h: h2, grown: true });
            }
        }
    }
    // (critic r3 P2: a fact column is as wide as its widest drawn fact over 0.6 of the band - so widened
    // by up to WIDEN_MAX it still holds its drawing >= 45 % of its width - never the wider 1 / k share
    // the size's digits leave it at a large size)
    for (const id of ids) {
        if (!poolsIn[id].every((it) => it.template === 'fact')) continue;
        const wMm = widestFactMm(poolsIn[id], cls[id].kd || cls[id].k);
        if (wMm > 0) cls[id].wFrac = Math.min(1, wMm / (0.6 * 186));
    }
    // (the SHORTEST cell of each pool too: a page dealt short cells has more height left over, so
    // the counts are chosen for the blank band of the short deal - mixed-m3 spare)
    for (const id of ids) {
        const k = Math.min(cls[id].kd || cls[id].k, 10);
        const hs = poolsIn[id].map((it) => hAtK([it], k, ctx)).filter((x) => Number.isFinite(x) && x > 0);
        cls[id].hLo = hs.length ? Math.min(cls[id].h, Math.min(...hs) + (cls[id].padDelta || 0)) : cls[id].h;
        // (each probe cell's own height: the counts lay the page out with the cells the deal gives)
        cls[id].hs = hs.length ? hs.map((x) => x + (cls[id].padDelta || 0)) : [cls[id].h];
    }
    return { ctx, N, ids, cls, groups: classify(ids, cls, N), one };
}

/** The page budgets of a mixed page: page 1 and a continued page, less the one band strip. */
function m2Budgets(input, ctx) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: 1 });
    const m0 = bandMetrics(ctx, layoutHeader(frame.header));
    const mc = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    // r3 D1: a continued page carries the sheet's title too (every page titled), so its body is less the title's lines
    const tMm = contTitleMm(frame);
    return { m0, first: m0.budget - stripMmOf(input) - m0.strip, cont: mc.budget - mc.strip - tMm, maxRows: MAX_SHELVES[ctx.size] || 5 };
}
const contTitleMm = (frame) => (frame.header && frame.header.title ? HEADER_PARTS_MM.title + HEADER_PARTS_MM.titleWrap * (Math.max(1, Number(frame.header.titleLines) || 1) - 1) : 0);
/** The continued pages' header: the sheet's title on every page (as practice.js flowLayout's sheets). */
function titledCont(frame) {
    if (frame.header && frame.header.title) frame.contHeader = Object.assign({}, frame.contHeader, { title: frame.header.title, titleLines: frame.header.titleLines });
    return frame;
}

const m2Weights = (input, ids) => {
    const w = Object.fromEntries((input.pools || []).filter((p) => ids.includes(p.id)).map((p) => [p.id, p.weight || 1]));
    for (const id of ids) if (!(id in w)) w[id] = 1;
    // (no weights set: every skill Equal - the notes read "Equal : Equal", never "Less : Less")
    if (ids.every((id) => w[id] === 1)) for (const id of ids) w[id] = 2;
    return w;
};

/* ============================================== §1.7 re-brief (critic r2): problems first, then rows */

/**
 * The digits a fact prints at on a page that also holds a kit stack (2-digit x, a regrouping
 * column sum): the SIZE's working digits, as the stack's - one digit size on the page (the fact
 * ladder never goes under them, TY-30) - and its top pad so its answer rule sits on the stack's:
 * a stack starts at the cell pad (3 mm) with its regroup row and the operand row gap above the
 * rule; a fact starts at its own pad. -> {kd, pt, padTop} (kd: the ladder count whose digits the
 * size's are, for the fact's measured height).
 */
/** Each shelf is its own grid: its top border (1.5 pt) stands above its rows. */
const GRID_EDGE_MM = 0.55;
/** A filled page may leave this much of its budget the shelves cannot take as answer room (the
 * budget keeps 4 mm and the body estimate a few more: mixed-m3 spare holds the printed band <= 25 mm). */
const SPARE_OK = 12;
/** A cell widens to at most this many times the width it fits at (its count across): a drawing fills
 * about 60 % or more of that width, so at 1.25 x it still fills >= 45 % (mixed-m3 width, critic r3 P2). */
const WIDEN_MAX = 1.25;
function stackPageFact(ctx) {
    const s = SIZES[ctx.size] || SIZES.L;
    const pt = s.digitPt;
    const ks = Object.keys(FACT_LADDER).map(Number).sort((a, b) => b - a);
    const kd = ks.find((k) => FACT_LADDER[k] >= pt && FACT_LADDER[k] <= pt * 1.1) || ks.find((k) => FACT_LADDER[k] >= pt) || 5;
    const rowGap = ctx.look === 'ican' ? 0 : 2;
    // (the stack: cell pad 3 mm, its tab clearance (tab side - 1 mm), the regroup row, two operand
    // rows of 1.15 em at the size's digits with the look's row gap; the fact: its pad and two rows
    // of 1.15 em at the ladder's digits - the pad takes the difference)
    const em = (x) => (x / 72) * 25.4;
    const fpt = FACT_LADDER[kd];
    const padTop = 3 + (s.tabMm - 1) + s.regroupMm + rowGap + 2.3 * (em(pt) - em(fpt));
    return { kd, pt: fpt, padTop: Math.round(padTop * 100) / 100 };
}

/* ============================================== THE MIXED GRID (lane mixed M2, r4 rebuild) */
//
// ONE full-width grid a page (critic r2 / r3 and the owner, 2026-11-03: "fill the paper", problems of different
// sizes interleaved one by one in rows and columns). The shelf / column block packer is gone from mixed pages:
//   - ONE count across C for the whole print: the dialog's Columns (`input.mixColumns`), else Auto - the C that puts
//     the most problems on a page (the facts at the size's working digits, so S > M > L);
//   - C equal tracks; the order over the whole print first (mixed-pack orderOf, the interleave), then the problems
//     flow into rows of C in that order. A problem whose drawing cannot fit one track spans 2 (or the row); a tall
//     problem (a long procedure beside small boxes) spans 2 rows;
//   - a row is as tall as the tallest problem in it; pages take whole rows; the spare height of a page is shared
//     into its rows as far as every drawing still fills >= 70 % of its box (H13); only the print's last row may be
//     short, its remainder ONE unruled trailing area at the right;
//   - every rule is the grid's ink gap / border, so every box is closed and every rule runs frame to frame.

/** A long-procedure / tall cell stands two rows tall beside small boxes at this height ratio (mixed-pack). */
const TALL_AT = 1.45;
/** A page's spare height the rows' H13 ceilings leave as blank under the grid before it is shared anyway (mm;
 *  mixed-m3 spare holds the blank to <= 25 mm). */
const BLANK_OK = 18;
/** The H13 fill a grown row keeps (a hair over 70 % for the measure's rounding). */
const GROW_FILL = 0.72;
/** The widest Auto count across tried. */
const C_MAX = 10;
/** The most across a page with a larger cell than a fast fact may print (owner, 2026-11-03). */
const LARGE_MAX = 6;
/** The grid's own frame (1.5 pt) and a row rule (the look's cell line), mm. */
const rowGapMm = (look) => cellGapMm(look);
const spanMm = (C, w, look) => w * factPitchMm(C, look) - cellGapMm(look);
const isStackLegacy = (it) => !!(it && it.template === 'legacy' && it.fclass === 'standard');

/** The facts' digits at C across: the fact ladder's for C (a legacy stack draws by the same ladder), never under
 *  the size's working digits (TY-30); on a page with a kit stack, the stack's digits (cls[id].kd). */
const factKAt = (C, ctx) => { const floor = (SIZES[ctx.size] || SIZES.L).digitPt; let k = Math.min(10, C); while (k > 1 && (FACT_LADDER[k] || 28) < floor) k--; return k; };

/**
 * One problem's box at C across: {need (mm, the narrowest box its drawing fits), k (the count across its drawing is
 * drawn at), h (mm, its natural height there), fact, full, work, ink (mm, a computation's drawn width)}. A fact keeps
 * the ladder's digits for C (never under the size's working digits); a computation drawn by a legacy stack draws at
 * the same digits where its measurement fits there; anything else at the narrowest count across it was measured to
 * fit, no narrower than C's track.
 */
function boxOf(x, C, c, hAt) {
    const { cls, ctx } = c;
    const id = x.pool;
    const it = x.it;
    const kd = cls[id].kd || Math.min(factKAt(C, ctx), cls[id].grown ? cls[id].k : 10);
    const work = kitWork(it) || workRowsOf(it) > 0;
    const base = spanMm(C, 1, ctx.look);
    if (cls[id].full) return { need: Infinity, k: 1, h: hAt(it, 1), fact: false, full: true, work };
    if (it.template === 'fact') {
        const fw = factWidthMm(kd, factTracksOf(it), payloadOf(it).b);
        return { need: fw + 4, k: kd, h: hAt(it, kd) + (cls[id].padDelta || 0), fact: true, ink: fw, work: false };
    }
    // (the narrowest box it was measured to fit: its need; drawn at C's count across, or the count it needs)
    let kMax = 0;
    for (let k = 10; k >= 1 && !kMax; k--) if (fitsMeasured([it], k, ctx)) kMax = k;
    if (!kMax) kMax = 1;
    const kFit = Math.min(kMax, Math.min(10, C));
    const need = factCellWMm(kMax, ctx.look);
    const kk = isStackLegacy(it) && kd > kFit && fitsMeasured([it], kd, ctx) ? kd : kFit;
    return { need, k: kk, h: hAt(it, kk), fact: false, work };
}

/** The lattice of a page at C across: U equal units, so a box of any width shares one grid. */
const UNITS_PER = 12;

/**
 * The grid of a print: the sequence (print order) at C across. Every row holds C problems (a box two rows tall counts
 * in both of its rows), each box as wide as its drawing needs, the row's rest shared equally: one grid of U = 12 C
 * units, every rule its ink gap. A tall box (a long procedure beside small boxes) and, on an exact count that does not
 * fill the last row, the last boxes of the row before it stand two rows tall at the row's right end, so no row is
 * short. -> {C, U, placed: [{x, d, row, u0, u, rs}], rows, H, pages, short}
 */
function gridOf(seq, C, c, b, hAt, { exact = false } = {}) {
    const look = c.ctx.look;
    const U = C * UNITS_PER;
    const pitch = factPitchMm(U, look);
    const unitsOf = (mm) => Math.max(1, Math.ceil((mm + cellGapMm(look)) / pitch - 1e-6));
    const ds = seq.map((x) => ({ x, d: boxOf(x, C, c, hAt) }));
    // (the small boxes' height: the lowest of the skills' own middle heights)
    const byP = {};
    for (const e of ds) if (!e.d.full) (byP[e.x.pool] = byP[e.x.pool] || []).push(e.d.h);
    const meds = Object.values(byP).map((hs) => hs.sort((p, q) => p - q)[Math.floor(hs.length / 2)]);
    const base = meds.length ? Math.min(...meds) : 0;
    // (a long procedure at TALL_AT x the small boxes, anything else at 1.8 x: a box that would leave its row's small
    // drawings under 70 % of their boxes)
    // (a long procedure at TALL_AT x the small boxes, any other box at 1.6 x - beside it a small drawing would fill
    // under 70 % of its row, H13)
    const wordy = (e) => /^(word-work|words)$/.test(String(e.x.it.template || ''));
    const tallOf = (e) => !e.d.full && base > 0 && (e.d.work || wordy(e)) && e.d.h >= (e.d.work ? TALL_AT : 1.6) * base && (e.d.work || e.d.h <= 2.4 * base + 2) && ds.some((o) => !o.d.full && o.d.h < TALL_AT * base);
    // rows: C problems each, in order (a box two rows tall stands where it falls and counts in both rows)
    const rows = [];          // [{items: [e], carry: [cell], tall: [e], broke, cells}]
    const placed = [];
    let overfull = 0;
    const needOf = (e) => unitsOf(e.d.need);
    // the free gaps of a row under the boxes carried from the row above
    const gapsOf = (carry) => {
        const cs = carry.map((e) => e.cell).sort((p, q) => p.u0 - q.u0);
        const out = [];
        let x = 0;
        for (const cl of cs) { if (cl.u0 > x) out.push([x, cl.u0]); x = Math.max(x, cl.u0 + cl.u); }
        if (x < U) out.push([x, U]);
        return out;
    };
    // a gap's boxes: as wide as they need, the rest shared equally (not facts first for the odd unit)
    const share = (items, A) => {
        const n = items.length;
        const need = items.map((e) => Math.min(A, needOf(e)));
        const us = need.map(() => 0);
        let left = A;
        const fixed = new Set();
        for (let round = 0; round <= n; round++) {
            const open = items.map((_, j) => j).filter((j) => !fixed.has(j));
            if (!open.length) break;
            const sh = Math.floor(left / open.length);
            const over = open.filter((j) => need[j] > sh);
            if (!over.length) {
                let rem = left - sh * open.length;
                for (const j of open) us[j] = sh;
                const o2 = open.slice().sort((p, q) => (items[p].d.fact - items[q].d.fact) || p - q);
                for (let k = 0; rem > 0; k = (k + 1) % o2.length) { us[o2[k]]++; rem--; }
                break;
            }
            for (const j of over) { us[j] = need[j]; left -= need[j]; fixed.add(j); }
        }
        // (a fact never wider than its drawing / 0.5 while a box that is not a fact can take the rest - mixed-m3 width)
        const capF = (j) => (items[j].d.fact ? Math.max(need[j], unitsOf(items[j].d.ink / 0.5)) : Infinity);
        const others = items.map((_, j) => j).filter((j) => !items[j].d.fact);
        if (others.length) {
            let extra = 0;
            items.forEach((e, j) => { if (e.d.fact && us[j] > capF(j)) { extra += us[j] - capF(j); us[j] = capF(j); } });
            for (let k = 0; extra > 0; k = (k + 1) % others.length) { us[others[k]]++; extra--; }
        }
        return us;
    };
    // lay one row's boxes into its gaps, in order: each gap as many boxes as its width's share
    const layRow = (r, ri, A0 = null) => {
        const gaps = gapsOf(r.carry);
        const n = r.items.length;
        const A = gaps.reduce((a, [x0, x1]) => a + (x1 - x0), 0);
        const per = n ? A / n : A;
        let k = 0;
        r.cells = [];
        gaps.forEach(([x0, x1], gi) => {
            const last = gi === gaps.length - 1;
            let m = r.quota ? (last ? n - k : r.quota[gi] || 0) : (last ? n - k : Math.max(1, Math.round((x1 - x0) / per)));
            if (!r.quota) m = Math.min(m, n - k - (gaps.length - 1 - gi));
            const its = r.items.slice(k, k + Math.max(0, m));
            k += its.length;
            const W = last && A0 !== null ? Math.max(1, A0 - (A - (x1 - x0))) : x1 - x0;
            const us = share(its, W);
            let u0 = x0;
            its.forEach((e, j) => {
                const cell = { x: e.x, d: e.d, row: ri, u0, u: us[j], rs: r.tall && r.tall.includes(e) ? 2 : 1 };
                e.cell = cell;
                u0 += us[j];
                r.cells.push(cell);
            });
        });
        for (const e of r.carry) r.cells.push(e.cell);
    };
    let i = 0;
    let carry = [];
    while (i < ds.length) {
        if (ds[i].d.full) {
            // a full-width problem (a word problem) is its own row; boxes carried from above end first
            if (carry.length) { const r = { items: [], carry, broke: false }; rows.push(r); layRow(r, rows.length - 1); carry = []; continue; }
            const r = { items: [ds[i]], carry: [], broke: false };
            rows.push(r);
            const cell = { x: ds[i].x, d: ds[i].d, row: rows.length - 1, u0: 0, u: U, rs: 1 };
            ds[i].cell = cell;
            r.cells = [cell];
            i++;
            continue;
        }
        const room = C - carry.length;
        const gaps = gapsOf(carry);
        const freeU = gaps.reduce((a, [x0, x1]) => a + (x1 - x0), 0);
        const per = freeU / Math.max(1, room);
        const items = [];
        const quota = [];
        let broke = false;
        // gap by gap (the free stretches between boxes carried from above): each its share of the row's problems,
        // as far as their boxes fit it; a box that does not fit starts the next row (the row holds fewer - counted)
        const i0 = i;
        gaps.forEach(([x0, x1], gi) => {
            if (broke) return;
            const last = gi === gaps.length - 1;
            const q = last ? room - items.length : Math.max(1, Math.round((x1 - x0) / per));
            let needU = 0;
            let got = 0;
            while (got < q && items.length < room && i < ds.length && !ds[i].d.full) {
                const nu = needOf(ds[i]);
                // (a box that does not fit this gap goes on in the next one; at the last, the next row - counted)
                if (needU + nu > x1 - x0) { if (last && got) { overfull++; broke = true; } break; }
                needU += nu;
                items.push(ds[i++]);
                got++;
            }
            quota.push(got);
        });
        // (a gap left empty beside a carried box: the box stands one row and this row is laid again without it)
        if (carry.length && quota.some((q) => !q) && i < ds.length) {
            const prev = rows[rows.length - 1];
            delete prev.tall;
            layRow(prev, rows.length - 1);
            i = i0;
            carry = [];
            continue;
        }
        if (!items.length && i < ds.length && !ds[i].d.full) { items.push(ds[i++]); quota[quota.length - 1] = (quota[quota.length - 1] || 0) + 1; }
        const r = { items, carry, broke, quota };
        // a tall box starts here (none carried in): it stands two rows where it falls
        if (!carry.length) {
            const talls = items.filter(tallOf);
            if (talls.length && talls.length < items.length) r.tall = talls;
        }
        rows.push(r);
        layRow(r, rows.length - 1);
        carry = r.tall || [];
    }
    // (the print ends on a row of tall boxes: they stand one row tall - no row of carried boxes alone)
    if (carry.length) { const r0 = rows[rows.length - 1]; delete r0.tall; layRow(r0, rows.length - 1); }
    // the last row short of C on an exact count: the boxes at the end of the row before it stand two rows tall
    let short = false;
    const lastR = rows[rows.length - 1];
    const nIn = (r) => r.items.length + r.carry.length;
    if (rows.length && !lastR.items.some((e) => e.d.full) && !lastR.broke && (nIn(lastR) < C || (lastR.quota && lastR.quota.some((q) => !q)))) {
        const prev = rows[rows.length - 2];
        const t = C - nIn(lastR);
        // (only a print of more pages than one: one page ends in a short row, its trailing area)
        const oneH = rows.reduce((a, r) => a + Math.max(0, ...r.items.map((e) => e.d.h)), 0) + rows.length * (rowGapMm(look) + 0.2);
        const onePage = oneH <= b.first && rows.length <= b.maxRows;
        if (exact && !onePage && prev && !prev.tall && !lastR.carry.length && !prev.items.some((e) => e.d.full) && prev.items.length === C && t < C) {
            prev.tall = prev.items.slice(C - t);
            layRow(prev, rows.length - 2);
            lastR.carry = prev.tall;
            layRow(lastR, rows.length - 1);
        } else if (lastR.carry.length && (!lastR.quota || lastR.quota.every((q) => q > 0)) && (layRow(lastR, rows.length - 1), lastR.cells.every((cl) => !cl.d.fact || cl.d.ink / (cl.u * pitch - cellGapMm(look)) >= 0.47))) {
            // (a row under a two-row box keeps the full width: its boxes share what the carried box leaves, while
            // every fact still fills its box)
        } else if (lastR.carry.length) {
            // (else the two-row box stands one row and the row is short)
            const prev = rows[rows.length - 2];
            delete prev.tall;
            layRow(prev, rows.length - 2);
            lastR.carry = [];
            short = true;
            layRow(lastR, rows.length - 1, Math.round((U * nIn(lastR)) / C));
        } else {
            short = true;
            // (the short row keeps C's share for each box; the rest of the row is its trailing area)
            layRow(lastR, rows.length - 1, Math.round((U * nIn(lastR)) / C));
        }
    }
    for (const r of rows) for (const cl of r.cells) if (!placed.includes(cl)) placed.push(cl);
    const nRows = rows.length;
    // the rows' heights: the tallest one-row box; a two-row box shares its height over its two rows
    const H = rows.map((r, ri) => Math.max(0, ...placed.filter((p) => p.row === ri && p.rs === 1).map((p) => p.d.h)));
    const g = rowGapMm(look);
    for (const p of placed.filter((p2) => p2.rs > 1)) {
        const have = H[p.row] + (H[p.row + 1] || 0) + g;
        if (have < p.d.h) { const add = (p.d.h - have) / 2; H[p.row] += add; H[p.row + 1] = (H[p.row + 1] || 0) + add; }
    }
    for (let k = 0; k < nRows; k++) if (!H[k]) H[k] = base || 20;
    const capOf = (row) => {
        const hs = placed.filter((p) => p.row === row && p.rs === 1 && !p.d.work).map((p) => p.d.h);
        // (a drawing's measured height carries the measure's own allowance - NAT_MM - over what it draws)
        return hs.length ? (Math.min(...hs) - NAT_MM) / GROW_FILL : Infinity;
    };
    // pages: whole rows (a two-row box keeps its rows together), within the budget and the size's rows
    const pages = [];
    let pg = null;
    const budgetOf = (pi) => (pi ? b.cont : b.first);
    const heightOf = (rs) => rs.reduce((a, row) => a + H[row], 0) + Math.max(0, rs.length - 1) * g + GRID_EDGE_MM * 2;
    for (let row = 0; row < nRows; row++) {
        const block = [row];
        while (rows[block[block.length - 1]].tall && block[block.length - 1] + 1 < nRows) block.push(block[block.length - 1] + 1);
        const pi = pages.length - (pg ? 1 : 0);
        if (!pg || heightOf(pg.rows.concat(block)) > budgetOf(pi) + 1e-6 || pg.rows.length + block.length > b.maxRows) {
            pg = { rows: [] };
            pages.push(pg);
        }
        pg.rows.push(...block);
        row = block[block.length - 1];
    }
    // (r5, owner 2026-11-03: a print is full pages and then the remainder, or EVEN pages that each meet the floor -
    // never a full page 1 and two thin pages after it. Where the last page holds under half the fullest, the same
    // number of pages takes the rows' blocks evenly, by problems, as far as every page still fits its budget.)
    let evened = false;
    if (pages.length > 2) {
        const nOf = (rs) => placed.filter((x) => rs.includes(x.row)).length;
        const ns0 = pages.map((p) => nOf(p.rows));
        if (ns0[ns0.length - 1] * 2 < Math.max(...ns0)) {
            const blocks = [];
            for (let row = 0; row < nRows; row++) {
                const bl = [row];
                while (rows[bl[bl.length - 1]].tall && bl[bl.length - 1] + 1 < nRows) bl.push(bl[bl.length - 1] + 1);
                blocks.push(bl);
                row = bl[bl.length - 1];
            }
            const P = pages.length;
            const total = nOf(blocks.flat());
            const out = [];
            let bi = 0;
            let left = total;
            for (let pi = 0; pi < P; pi++) {
                // (rounded up: the earlier pages take the extra row, so every page but the last is as full as it can be)
                const target = Math.ceil(left / (P - pi));
                const rs = [];
                let got = 0;
                while (bi < blocks.length) {
                    const nb = nOf(blocks[bi]);
                    const more = rs.concat(blocks[bi]);
                    if (pi < P - 1 && got >= target) break;
                    if (pi < P - 1 && (heightOf(more) > budgetOf(pi) + 1e-6 || more.length > b.maxRows)) break;
                    rs.push(...blocks[bi]);
                    got += nb;
                    bi++;
                }
                out.push({ rows: rs });
                left -= got;
            }
            const ns = out.map((p) => nOf(p.rows));
            const ok = bi === blocks.length && out.every((p, i) => p.rows.length && heightOf(p.rows) <= budgetOf(i) + 1e-6 && p.rows.length <= b.maxRows)
                && ns[ns.length - 1] * 2 >= Math.max(...ns);
            if (ok) { pages.length = 0; pages.push(...out); evened = true; }
        }
    }
    // (PT-MIX-9: a split print's pages within half of each other - whole blocks of rows move from the pages
    // before the last to it, the latest first; page 1 keeps its rows: it is the page the dialog counts)
    // (PT-MIX-9: a split print's pages within half of each other - whole blocks of rows move from the pages
    // before the last to it, the latest first; page 1 keeps its rows: it is the page the dialog counts)
    if (pages.length > 2 && !evened) {
        const nOf = (rs) => placed.filter((x) => rs.includes(x.row)).length;
        const given = new Set();
        for (let guard = 0; guard < 20; guard++) {
            const ns = pages.map((p) => nOf(p.rows));
            const L = pages.length - 1;
            if (ns[L] * 2 >= Math.max(...ns)) break;
            // the last page before it with a row to spare that keeps it no lower than the last page will be
            let moved = false;
            for (let pi = L - 1; pi >= 1 && !moved; pi--) {
                const from = pages[pi];
                let k = from.rows.length - 1;
                while (k > 0 && rows[from.rows[k - 1]].tall) k--;
                const bl = from.rows.slice(k);
                const nb = nOf(bl);
                // (each page gives one block at most: it stays within a row of full - mixed-m3 fill)
                if (given.has(pi) || from.rows.length - bl.length < 1 || ns[pi] - nb < ns[L] + nb - 1e-9) continue;
                given.add(pi);
                const snap = pages.map((p) => p.rows.slice());
                const target = pages.slice(pi + 1);
                // the block passes down the pages after it, one block each, to the last
                let carryB = bl;
                from.rows = from.rows.slice(0, k);
                let ok = true;
                for (const t of target) {
                    const all = carryB.concat(t.rows);
                    if (t === pages[L]) { t.rows = all; break; }
                    let k2 = t.rows.length - 1;
                    while (k2 > 0 && rows[t.rows[k2 - 1]].tall) k2--;
                    const out = t.rows.slice(k2);
                    t.rows = carryB.concat(t.rows.slice(0, k2));
                    carryB = out;
                }
                if (pages.some((p, i) => heightOf(p.rows) > budgetOf(i) + 1e-6 || p.rows.length > b.maxRows)) { ok = false; pages.forEach((p, i) => { p.rows = snap[i]; }); }
                moved = ok;
                if (!ok) break;
            }
            if (!moved) break;
        }
    }
    pages.forEach((p, pi) => {
        p.H = p.rows.map((row) => H[row]);
        let spare = Math.max(0, budgetOf(pi) - heightOf(p.rows));
        const caps = p.rows.map((row) => Math.max(H[row], capOf(row)));
        for (let it = 0; it < 10 && spare > 0.05; it++) {
            const open = p.H.map((h, k) => k).filter((k) => caps[k] - p.H[k] > 0.05);
            if (!open.length) break;
            const each = spare / open.length;
            for (const k of open) { const add = Math.min(each, caps[k] - p.H[k]); p.H[k] += add; spare -= add; }
        }
        // (still over SPARE_OK - the rows' ceilings reached: the rest shared equally, never a blank band under the
        // grid; mixed-m3 spare) - the print's last page of an exact count keeps its rows' own heights
        const lastExact = exact && pi === pages.length - 1;
        p.spareCapped = spare;
        if (spare > BLANK_OK && !lastExact) { const each = spare / p.H.length; p.H = p.H.map((h) => h + each); spare = 0; }
        p.spare = spare;
        p.n = placed.filter((x) => p.rows.includes(x.row)).length;
    });
    placed.sort((p, q) => p.row - q.row || p.u0 - q.u0);
    const usedU = (row) => rows[row] ? rows[row].cells.reduce((a, cl) => a + cl.u, 0) : 0;
    return { C, U, placed, rows: nRows, rowList: rows, H, pages, short, usedU, overfull };
}

/** The pool items as a sequence for counts {id: n}: each pool's items in turn (cycled where it has fewer). */
function seqOf(c, byPool, counts, seed) {
    const order = orderOf(counts, c.ids, { seed });
    const at = {};
    return order.map((id) => {
        const its = byPool[id] || [];
        const i = at[id] = (at[id] === undefined ? 0 : at[id] + 1);
        return { pool: id, it: its[i % Math.max(1, its.length)] };
    }).filter((x) => x.it);
}

/** A height cache over (item, k). */
function hCacheOf(c) {
    const cache = new Map();
    return (it, k) => {
        let m = cache.get(it);
        if (!m) { m = new Map(); cache.set(it, m); }
        if (!m.has(k)) { const v = hAtK([it], Math.min(k, 10), c.ctx); m.set(k, Number.isFinite(v) && v > 0 ? v : 40); }
        return m.get(k);
    };
}

/** May C be a page's count across for these boxes? Every fact's drawing fills >= 47 % of its track (mixed-m3 width). */
function acrossOk(C, c, byPool) {
    const look = c.ctx.look;
    const tw = spanMm(C, 1, look);
    for (const id of c.ids) {
        for (const it of byPool[id] || []) {
            if (c.cls[id].full) continue;
            const kd = c.cls[id].kd || Math.min(factKAt(C, c.ctx), c.cls[id].grown ? c.cls[id].k : 10);
            if (it.template === 'fact') {
                const fw = factWidthMm(kd, factTracksOf(it), payloadOf(it).b);
                if (fw + 4 <= tw && fw / tw < 0.47) return false;
            } else if (isStackLegacy(it) && it.q) {
                // (a legacy stack: its tracks are the operands' digits and the operator, 0.72 em each, at the ladder's digits)
                const nums = String(it.q.text || '').match(/\d+/g) || [];
                const T = Math.max(String(it.q.a ?? '').length, String(it.q.b ?? '').length, ...nums.slice(0, 2).map((x) => x.length), 2) + 1;
                const em = ((FACT_LADDER[kd] || 28) / 72) * 25.4;
                if (T * 0.72 * em / tw < 0.46) return false;
            }
        }
    }
    return true;
}

/**
 * The count across of a print: the dialog's Columns, else Auto - the C whose page holds the most problems of THIS mix
 * (its weights; a long run of problems laid out), the fewer across on a tie (bigger boxes). -> {C, cap}
 */
function acrossOf(c, byPool, input, b, hAt) {
    const w0 = m2Weights(input, c.ids);
    const exact = input.exactCounts || null;
    const shape = exact ? Object.fromEntries(c.ids.map((id) => [id, Math.max(0, Number(exact[id]) || 0)])) : w0;
    const big = dealCounts(shape, 150, { min: 0 }).counts;
    const seq = seqOf(c, byPool, big, 1);
    // (a fill print may give the skill of smaller boxes more than its share - m2Counts: its capacity is the best of
    // those deals too)
    const seqs = exact ? [seq] : [seq, ...c.ids.flatMap((id) => [2, 4, 8].map((f) => seqOf(c, byPool, dealCounts(Object.assign({}, shape, { [id]: (shape[id] || 1) * f }), 150, { min: 0 }).counts, 1)))];
    // (an exact count keeps C in every row where it can - one count across for the sheet, PT-MIX-3; a fill page
    // takes the count across that holds the most, a row of wide boxes holding fewer)
    const capAt = (C) => Math.max(...seqs.map((sq) => { const G = gridOf(sq, C, c, b, hAt, { exact: !!exact }); return G.overfull && exact ? -1 : (G.pages.length ? G.pages[0].n : 0); }));
    // (owner 2026-11-03: 7-10 across is for small problems / fast facts only - a page with any larger cell (a missing
    // number, a word problem, a stack with regrouping, a 2-digit x) is never 7 or more across, under any mode)
    const large = c.ids.some((id) => (byPool[id] || []).some((it) => it.template !== 'fact'));
    const hiC = Math.min(C_MAX, FACT_AUTO_COLS[c.ctx.size] || C_MAX, large ? LARGE_MAX : C_MAX);
    const asked = Number(input.mixColumns) || 0;
    const mode = asked ? (input.mixColumnsMode === 'aim' ? 'aim' : 'exact') : 'auto';
    if (mode === 'exact') {
        const C = large ? Math.min(asked, LARGE_MAX) : asked;
        return { C, cap: capAt(C), auto: false, mode, asked, clamped: C !== asked };
    }
    if (mode === 'aim') {
        // ('aim': the largest count <= the one asked that every problem type on the page fits at this size)
        const top = large ? Math.min(asked, LARGE_MAX) : asked;
        const tw = (C) => spanMm(C, 1, c.ctx.look);
        const fitsAll = (C) => c.ids.every((id) => c.cls[id].full || (byPool[id] || []).every((it) => boxOf({ pool: id, it }, C, c, hAt).need <= tw(C) + 0.5));
        let C = top;
        while (C > 2 && !(fitsAll(C) && acrossOk(C, c, byPool))) C--;
        return { C, cap: capAt(C), auto: false, mode, asked, clamped: C !== asked };
    }
    let best = null;
    // (Auto runs up to the fact layouts' own count across for the size - 10 / 6 / 5 at S / M / L, TY-30 - so a
    // large print stays large and S > M > L)
    for (let C = 2; C <= hiC; C++) {
        if (!acrossOk(C, c, byPool)) continue;
        const cap = capAt(C);
        if (cap > 0 && (!best || cap > best.cap)) best = { C, cap };
    }
    // (no count across where every row holds C: the one whose rows hold the most, some fewer where a box is wide)
    if (!best) {
        for (let C = 2; C <= hiC; C++) {
            if (!acrossOk(C, c, byPool)) continue;
            const G = gridOf(seq, C, c, b, hAt, { exact: !!exact });
            const cap = G.pages.length ? G.pages[0].n : 0;
            if (cap > 0 && (!best || cap > best.cap)) best = { C, cap };
        }
    }
    if (!best) best = { C: 4, cap: capAt(4) };
    return Object.assign(best, { auto: true, mode: 'auto' });
}

/** The count across a print keeps, remembered on the input between its counts and its plan (one sheet, one C). */
function acrossFor(c, byPool, input, b, hAt) {
    const key = `${c.ctx.size}|${c.ctx.look}|${Number(input.mixColumns) || 0}|${input.mixColumnsMode || ''}|${c.ids.join(',')}`;
    if (input.mixAcross && input.mixAcross.key === key) return input.mixAcross;
    const a = Object.assign(acrossOf(c, byPool, input, b, hAt), { key });
    try { input.mixAcross = a; } catch (e) { /* a frozen input re-chooses */ }
    return a;
}

function planMixedM2(input, pools) {
    if (mixLayoutOf(input) === 'rows') return planRowsA(input, pools);
    if (mixLayoutOf(input) === 'even') return planEvenC(input, pools);
    const c = m2Classes(pools, input);
    const { ctx, N, ids, cls } = c;
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
    const asked = input.exactCounts ? 1 : Math.max(1, Number(input.mixPages) || 1);
    const seed0 = deriveSeed('mixed-practice', input.seed || 0);
    const hAt = hCacheOf(c);
    const A = acrossFor(c, pools, input, b, hAt);
    const counts0 = Object.fromEntries(ids.map((id) => [id, (pools[id] || []).length]));
    let seq = seqOf(c, pools, counts0, seed0);
    let G = gridOf(seq, A.C, c, b, hAt, { exact: !!input.exactCounts });
    // (a fill print ends in a whole row: the dealt boxes - their own heights and widths, not the probe's - may leave
    // the last row short; its problems are left off, the counts are the page's own)
    const G0 = G;
    const counts00 = Object.assign({}, counts0);
    for (let guard = 0; guard < 1 && G.short && !input.exactCounts && G.rows > 1; guard++) {
        const lastN = G.placed.filter((p) => p.row === G.rows - 1).length;
        if (!lastN || seq.length - lastN < 2 * ids.length) break;
        // (taken from the skills with the most problems, then interleaved again)
        for (let k = 0; k < lastN; k++) { const id = ids.slice().sort((p, q) => counts0[q] - counts0[p])[0]; if (counts0[id] > 2) counts0[id]--; }
        seq = seqOf(c, pools, counts0, seed0);
        G = gridOf(seq, A.C, c, b, hAt, { exact: false });
    }
    // (still short: the dealt page as it is - its last row short, ONE trailing area)
    if (G.short && G !== G0) { G = G0; Object.assign(counts0, counts00); seq = seqOf(c, pools, counts0, seed0); }
    const n = G.placed.length;
    const labels = labels0 === 'letter' && n > 26 ? 'tab' : labels0;
    const frame = titledCont(frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: n }));
    const instr = instructionText('default-solve');
    const notes = [];
    const pages = [];
    const pageOrders = [];
    const achieved = {};
    let start = 1;
    // a fact at the page's digits (kd) - its top pad on a page with a kit stack (cls[id].pt)
    const drawAt = (it, id, k) => {
        let x = it.template === 'fact' ? atColumns(it, k) : it;
        const cq = x.q && x.q.cell;
        if (cls[id].pt && cq && cq.template === 'fact') {
            x = Object.assign({}, x, { q: Object.assign({}, x.q, { cell: Object.assign({}, cq, { payload: Object.assign({}, cq.payload, { pt: cls[id].pt, padTop: cls[id].padTop }) }) }) });
        }
        return x;
    };
    for (const [pi, pg] of G.pages.entries()) {
        const sections = [];
        if (pi === 0 && input.stepStrip) sections.push({ kind: 'html', html: input.stepStrip });
        const band = { kind: 'band', label: '', instr, contents: [] };
        sections.push(band);
        const order = [];
        const r0 = pg.rows[0];
        let num = start;
        const mine = G.placed.filter((p) => pg.rows.includes(p.row));
        const itemOf = (p) => {
            let it = drawAt(p.x.it, p.x.pool, p.d.k);
            // (the row's answer rules on one line: the pad the laid-out page asked for, print-sheet mixedRulePads)
            const pad = input.rulePads && input.rulePads[num];
            num++;
            if (pad && pad.mm > 0) {
                const cq = it.q && it.q.cell;
                if (it.template === 'fact' && cq && cq.payload) {
                    const pt0 = cq.payload.padTop !== undefined ? cq.payload.padTop : factPadTop(labels, p.d.k);
                    it = Object.assign({}, it, { q: Object.assign({}, it.q, { cell: Object.assign({}, cq, { payload: Object.assign({}, cq.payload, { padTop: Math.round((pt0 + pad.mm) * 100) / 100 }) }) }) });
                } else it = Object.assign({}, it, { cellStyle: `${it.cellStyle || ''}padding-top:${Math.round((pad.padMm + pad.mm) * 100) / 100}mm;` });
            }
            order.push(p.x.pool);
            achieved[p.x.pool] = (achieved[p.x.pool] || 0) + 1;
            return Object.assign(planItem(markWork(it, ctx.size), { cols: p.d.k }), { place: { col: p.u0 + 1, row: p.row - r0 + 1, span: p.u, rows: Math.min(p.rs, pg.rows.length - (p.row - r0)) } });
        };
        // the print's last row short (a fill of whole rows never is; an exact count only where its row before cannot
        // stand two rows tall): its own grid from the frame's left edge, as wide as its boxes on the same lattice,
        // closed on its right; the rest of the row is ONE unruled trailing area (no empty ruled box)
        const lastRow = pg.rows[pg.rows.length - 1];
        const short = G.short && pi === G.pages.length - 1 && pg.rows.length > 0 && lastRow === G.rows - 1;
        const mainRows = short ? pg.rows.slice(0, -1) : pg.rows;
        const items = mine.filter((p) => mainRows.includes(p.row)).map(itemOf);
        const gap = rowGapMm(ctx.look);
        if (mainRows.length) {
            const H = pg.H.slice(0, mainRows.length);
            const part = gridPart(items, { cols: G.U, rows: mainRows.length, labels, start });
            part.height = `${Math.round((H.reduce((a, h) => a + h, 0) + (H.length - 1) * gap + 2 * GRID_EDGE_MM) * 100) / 100}mm`;
            part.rowsTpl = H.map((h) => `${Math.round(h * 100) / 100}fr`).join(' ');
            if (short) part.bottom = true;
            band.contents.push(part);
            start += items.length;
        }
        if (short) {
            const usedU = G.usedU(lastRow);
            const lastItems = mine.filter((p) => p.row === lastRow).map(itemOf);
            for (const li of lastItems) li.place = Object.assign({}, li.place, { row: 1 });
            const part = gridPart(lastItems, { cols: usedU, rows: 1, labels, start });
            const h = pg.H[pg.H.length - 1];
            part.height = `${Math.round((h + (mainRows.length ? 1 : 2) * GRID_EDGE_MM) * 100) / 100}mm`;
            part.widthPct = ((usedU * factPitchMm(G.U, ctx.look) - gap + BAND_SIDE_MM) / (186 - 2 * BAND_SIDE_MM)) * 100;
            part.left = true;
            band.contents.push(part);
            start += lastItems.length;
        }
        pageOrders.push(order);
        pages.push({ sections });
    }
    // the notes, from the PRINTED order across the page breaks (IMPROVEMENT_PLAN 3.3: the weights win)
    const printAll = pageOrders.flat();
    const runs = runsIn(printAll);
    const total = Object.fromEntries(ids.map((id) => [id, printAll.filter((x) => x === id).length]));
    const runNotes = {};
    for (const id of ids) {
        if ((runs[id] || 0) > 2 && ids.filter((x) => total[x]).length > 1) {
            runNotes[id] = runs[id];
            notes.push(`${names[id].name} takes most of the page, so up to ${runs[id]} ${names[id].noun} come in a row`);
        }
    }
    if (!input.exactCounts && !withinShare(total, weights, ids)) {
        const over = ids.slice().sort((a, c2) => total[c2] / (weights[c2] || 1) - total[a] / (weights[a] || 1))[0];
        notes.push(`${names[over].name} fills the rest of the page: ${ids.map((id) => `${total[id]} ${names[id].noun}`).join(', ')}.`);
    }
    if (input.ladderNote) notes.push(input.ladderNote);
    if (pages.length > asked) notes.push(`Mixed practice: the ${n} problems need ${pages.length} pages, so ${pages.length - asked === 1 ? 'a page was' : `${pages.length - asked} pages were`} added.`);
    const lone = [];
    for (const order of pageOrders) for (const id of ids) if (order.filter((x) => x === id).length === 1) lone.push(names[id].name);
    if (lone.length) notes.push(`Mixed practice: ${[...new Set(lone)].join(' and ')} has only one problem on a page.`);
    const loads = pageOrders.map((o) => o.length);
    // (r5: an exact count over several pages - a page of THIS print holds what its fullest page holds; the probe's
    // capacity (a long run of the same shape) may start on a luckier row and promise a problem more than any page of
    // the print can take - ws-teacher-plan-match "filled")
    const perPage = input.exactCounts && loads.length > 1 ? Math.max(...loads) : Math.max(A.cap || 0, ...(loads.length ? loads : [0]));
    const forced = (id) => Math.max(2, Math.ceil(total[id] / (n - total[id] + 1)));
    const runsByPage = pageOrders.map((o) => Object.fromEntries(ids.map((id) => [id, { run: runsIn(o)[id] || 0, turns: o.filter((x) => x === id).length, cap: forced(id) }])));
    const longest = Math.max(0, ...Object.values(runs));
    const tall = ids.filter((id) => G.placed.some((p) => p.x.pool === id && p.rs > 1));
    return assemble(ROLE_ID, input, frame, pages, {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: N, achieved, arrangement: 'mixed', notes: [...new Set(notes)],
            m2: {
                groups: [{ pools: ids.slice(), R: tall.length ? 2 : 1, tall }],
                classes: Object.fromEntries(ids.map((id) => [id, { k: A.C, s: 1, h: Math.round(cls[id].h * 10) / 10, full: !!cls[id].full, tall: tall.includes(id) }])),
                budgets: { first: Math.round(b.first * 10) / 10, cont: Math.round(b.cont * 10) / 10 }, turns: pageOrders, longest, pages: pageOrders, asked, capNote: '', mustBeat: Number(input.mustBeat) || 0, perPage, runs: runsByPage, runNotes, turnsAll: printAll,
                across: A.C, auto: !!A.auto, columnsMode: A.mode || (A.auto ? 'auto' : 'exact'), ...(A.clamped ? { clamped: true, asked: A.asked } : {}),
            },
            interleave: { keys: printAll, longest, notes: [] },
            fits: [{ cols: A.C, across: A.C, mixLayout: 'grid', auto: !!A.auto, columnsMode: A.mode || (A.auto ? 'auto' : 'exact'), ...(A.clamped ? { clamped: true, asked: A.asked } : {}), rows: G.rows, perPage, line: `Fits: ${n} problems mixed, ${A.C} across, ${pages.length} page${pages.length > 1 ? 's' : ''} (${perPage} a page).` }],
        },
    });
}

/* ============================================== LAYOUT A: ROWS BY TYPE (owner ruling 2026-11-03, the default) */
//
// `input.mixLayout`: 'rows' (A, the default when absent), 'grid' (B, the one grid above, r5 unchanged), 'even' (C, one
// count across and every box one height). A:
//   - each row holds ONE kind of problem: 'fact' = the fast facts (skills *_facts and multiplication:multiply), and the
//     other skills in a few size kinds by their measured boxes (one kind per skill);
//   - each kind its OWN count across, the same for every full row of that kind over the whole print (facts 6-10 across
//     at S, the larger kinds 2-4 and never 7 or more); boxes full size, a long procedure its full height in a row of
//     its own kind (no two-row boxes);
//   - kinds alternate row by row, a kind repeating rows only where the counts force it; within a kind the skills
//     interleave one by one (runs and spread are judged within the kind);
//   - pages take whole rows; a kind's last row may be short (never under half full: the last two rows share), and the
//     short rows go to the last page, each closing its own grid with one unruled trailing area;
//   - every page but the last of an exact count filled (the rows grow within H13, then evenly); limited problems print
//     from the top, never stretched.

const MIX_LAYOUTS = Object.freeze(['rows', 'grid', 'even']);
/** The Mixed up layout a request asks for: 'rows' (A) when absent or unknown. */
export const mixLayoutOf = (input) => (MIX_LAYOUTS.includes(input && input.mixLayout) ? input.mixLayout : 'rows');
/** A fast-fact skill (owner 2026-11-03): its kind is 'fact'. */
export const isFactSkill = (sk) => /_facts$/.test(String(sk || '').split(':')[1] || '') || sk === 'multiplication:multiply';
/** Auto's widest count across for a kind that is not fast facts (owner: 2-4), and the hard cap (never 7). */
const LARGE_AUTO = 4;
/** The skill the teacher chose for an item: a preset's own id (q.presetId), not its host's (a 2-digit x preset of
 *  multiplication:multiply is not a table fact). */
const skillOfItem = (it) => {
    const q = (it && it.q) || {};
    if (q.presetId && q.categoryId) return `${q.categoryId}:${q.presetId}`;
    return String((it && it.skill) || (q.categoryId && q.skillId ? `${q.categoryId}:${q.skillId}` : ''));
};
const skillOfPool = (its) => skillOfItem((its || [])[0] || {});
/** The finest lattice a page grid takes (units): a unit stays wider than the grid's rule. */
const U_MAX = 144;
const lcm2 = (a, b) => { const g = (x, y) => (y ? g(y, x % y) : x); return (a / g(a, b)) * b; };

/** The kinds, the boxes and the counts across of a print in layout A. */
function rowsSetup(pools, input) {
    const c = m2Classes(pools, input);
    const { ctx, ids, cls } = c;
    const look = ctx.look;
    const b = m2Budgets(input, ctx);
    const hAt = hCacheOf(c);
    const kmax = new Map();
    const kMaxOf = (it) => {
        if (!kmax.has(it)) { let k = 0; for (let d = 10; d >= 1 && !k; d--) if (fitsMeasured([it], d, ctx)) k = d; kmax.set(it, k || 1); }
        return kmax.get(it);
    };
    const track = (C) => spanMm(C, 1, look);
    // (the facts' digits: the ladder's for the facts' Auto count across, kept when a print takes fewer across)
    let kdF = 0;
    // one problem's box in a row of C across; kdP the ladder count the page's facts are drawn at (a legacy stack keeps it)
    const boxA = (x, C, kdP) => {
        const id = x.pool;
        const it = x.it;
        if (it.template === 'fact') {
            const kd = cls[id].kd || kdF || factKAt(C, ctx);
            const fw = factWidthMm(kd, factTracksOf(it), payloadOf(it).b);
            return { need: fw + 4, k: kd, h: hAt(it, kd) + (cls[id].padDelta || 0), fact: true, ink: fw, work: false };
        }
        const kM = kMaxOf(it);
        const kFit = Math.min(kM, Math.min(10, C));
        const kk = isStackLegacy(it) && kdP > kFit && fitsMeasured([it], kdP, ctx) ? kdP : kFit;
        return { need: C === 1 ? 0 : factCellWMm(kM, look), k: kk, h: hAt(it, kk), fact: false, work: kitWork(it) || workRowsOf(it) > 0 };
    };
    // the kinds: fast facts by the skill's name; the others by their measured boxes (the count across they fit, up to
    // LARGE_AUTO, and their height - within TALL_AT of the kind's shortest)
    const kindOf = {};
    for (const id of ids) if (isFactSkill(skillOfPool(pools[id]))) kindOf[id] = 'fact';
    const prof = ids.filter((id) => !kindOf[id]).map((id) => {
        const its = pools[id];
        const k = Math.min(LARGE_AUTO, ...its.map(kMaxOf));
        const hs = its.map((it) => hAt(it, k)).sort((p, q) => p - q);
        return { id, k, h: hs[Math.floor(hs.length / 2)] || 40 };
    }).sort((p, q) => p.h - q.h || q.k - p.k);
    const groups = [];
    for (const p of prof) {
        const g = groups[groups.length - 1];
        if (g && g.k === p.k && p.h <= g.h0 * TALL_AT) g.ids.push(p.id);
        else groups.push({ ids: [p.id], k: p.k, h0: p.h });
    }
    const NAMES = ['mid', 'large', 'long', 'tall', 'big', 'wide'];
    groups.forEach((g, i) => { for (const id of g.ids) kindOf[id] = groups.length === 1 ? 'large' : (NAMES[i] || `large${i}`); });
    // (one sheet, one set of kinds and counts across: the probe's, remembered on the input for the dealt problems)
    const cacheKey = `${ctx.size}|${look}|${Number(input.mixColumns) || 0}|${input.mixColumnsMode || ''}|${ids.join(',')}`;
    const hit = input.mixRowsC && input.mixRowsC.key === cacheKey ? input.mixRowsC : null;
    if (hit) Object.assign(kindOf, hit.kindOf);
    const kinds = [...new Set(ids.map((id) => kindOf[id]))].sort((p, q) => (p === 'fact' ? -1 : q === 'fact' ? 1 : 0));
    const idsOf = (k) => ids.filter((id) => kindOf[id] === k);
    // the counts across: facts first (their digits are the page's), then every larger kind
    const asked = Number(input.mixColumns) || 0;
    const mode = asked ? (input.mixColumnsMode === 'aim' ? 'aim' : 'exact') : 'auto';
    const items = (k) => idsOf(k).flatMap((id) => (pools[id] || []).map((it) => ({ pool: id, it })));
    const why = [];
    // (each box as wide as its drawing needs, the row's rest shared: a count fits where every row of the kind's
    // problems, in their print order, holds its boxes' needs - and no box needs more than the whole row)
    const seed0 = deriveSeed('mixed-practice', (input && input.seed) || 0);
    const kindSeq = {};
    const seqKind = (k) => {
        if (!kindSeq[k]) kindSeq[k] = seqOf({ ids: idsOf(k) }, pools, Object.fromEntries(idsOf(k).map((id) => [id, (pools[id] || []).length])), seed0);
        return kindSeq[k];
    };
    const fitsKind = (k, C, kdP) => {
        if (C === 1) return true;
        const bad = items(k).find((x) => fitsWhy(k, C, kdP, x));
        if (bad) { why.push(`${k} ${C}: ${bad.it.skill} ${bad.it.template} ${fitsWhy(k, C, kdP, bad)}`); return false; }
        const sq = seqKind(k);
        const W = spanMm(C, C, look);
        for (let i = 0; i < sq.length; i += C) {
            const row = sq.slice(i, i + C).map((x) => boxA(x, C, kdP).need);
            const sum = row.reduce((a, v) => a + v, 0) + (row.length - 1) * cellGapMm(look);
            if (sum > W * (row.length / C) + 0.5 && row.length === C) { why.push(`${k} ${C}: row ${i / C + 1} needs ${sum.toFixed(1)} > ${W.toFixed(1)}`); return false; }
        }
        return true;
    };
    const fitsWhy = (k, C, kdP, x) => {
        if (k !== 'fact' && (x.it.fclass === 'word' || x.it.fclass === 'wide')) return 'word';
        const d = boxA(x, C, kdP);
        if (d.need > spanMm(C, C, look) + 0.5) return `need ${d.need.toFixed(1)} > ${track(C).toFixed(1)} (kMax ${kMaxOf(x.it)})`;
        // (a box no wider than its drawing / 0.47 - mixed-m3 width)
        if (d.fact && d.ink / track(C) < 0.47) return `ink ${d.ink.toFixed(1)}`;
        // (a larger box no wider than twice the narrowest box its drawing fits - mixed-m3 width)
        if (!d.fact && !isStackLegacy(x.it) && C > 1 && d.need > 0 && d.need / track(C) < 0.5 && kMaxOf(x.it) > C) return `wide ${d.need.toFixed(1)}`;
        if (isStackLegacy(x.it) && x.it.q) {
            const nums = String(x.it.q.text || '').match(/\d+/g) || [];
            const T = Math.max(String(x.it.q.a ?? '').length, String(x.it.q.b ?? '').length, ...nums.slice(0, 2).map((s) => s.length), 2) + 1;
            const em = ((FACT_LADDER[d.k] || 28) / 72) * 25.4;
            if (d.k >= C && T * 0.72 * em / track(C) < 0.46) return 'stack fill';
        }
        return '';
    };
    const defCols = input.mixDefaultCols || {};
    const defOf = (k) => {
        const xs = idsOf(k).map((id) => { const d = defCols[id]; return d && Number(d[ctx.size]) > 0 ? Math.round(Number(d[ctx.size])) : 0; }).filter(Boolean);
        return xs.length ? Math.min(...xs) : 0;
    };
    const C = {};
    let clamped = false;
    let kdP = 0;
    for (const k of (hit ? [] : kinds)) {
        const cap = k === 'fact' ? C_MAX : LARGE_MAX;
        let n;
        if (mode === 'exact') { n = Math.min(asked, cap); if (n !== asked) clamped = true; }
        else if (mode === 'aim') {
            n = Math.min(asked, cap);
            while (n > 1 && !fitsKind(k, n, kdP || factKAt(n, ctx))) n--;
            if (n !== asked) clamped = true;
        } else {
            const def = defOf(k);
            const hi = Math.min(cap, def || (k === 'fact' ? Math.min(C_MAX, FACT_AUTO_COLS[ctx.size] || C_MAX) : LARGE_AUTO));
            n = hi;
            while (n > 1 && !fitsKind(k, n, kdP || factKAt(n, ctx))) n--;
            // (a larger kind whose widest box fills under half of its track at LARGE_AUTO: more across, never 7)
            if (!def && k !== 'fact' && n > 1) {
                const wide = (m) => Math.max(...items(k).map((x) => boxA(x, m, kdP || factKAt(m, ctx)).need));
                while (n < LARGE_MAX && wide(n) / track(n) < 0.5 && fitsKind(k, n + 1, kdP || factKAt(n + 1, ctx))) n++;
            }
        }
        C[k] = Math.max(1, n);
        if (k === 'fact') {
            kdP = Object.values(cls).find((x) => x.kd) ? Object.values(cls).find((x) => x.kd).kd : factKAt(C[k], ctx);
            kdF = factKAt(C[k], ctx);
        }
    }
    if (hit) { Object.assign(C, hit.C); kdP = hit.kdP; kdF = hit.kdF; }
    else try { input.mixRowsC = { key: cacheKey, kindOf: Object.assign({}, kindOf), C: Object.assign({}, C), kdP, kdF }; } catch (e) { /* a frozen input re-chooses */ }
    if (!kdP) kdP = factKAt(Math.max(...Object.values(C)), ctx);
    // the counts across each kind may take below its own (its digits kept): an exact count of problems fills whole rows
    // of every kind but the one whose short row ends the print (mixed-m3 boxes / shelfw: one short row, the last)
    const okC = {};
    for (const k of kinds) {
        okC[k] = [C[k]];
        // (within a third of its own count across, and never under 2: the page keeps its density)
        if (mode !== 'exact') for (let m = C[k] - 1; m >= Math.max(2, Math.ceil((2 * C[k]) / 3)); m--) if (fitsKind(k, m, kdP)) okC[k].push(m);
    }
    const hK = Object.fromEntries(kinds.map((k) => [k, Math.max(8, ...items(k).map((x) => boxA(x, C[k], kdP).h))]));
    /** The counts across for these problems {kind: n} -> {C: {kind: n}, last: the kind whose short row ends the print}. */
    const chooseC = (nK) => {
        let best = null;
        const walk = (i, pick) => {
            if (i === kinds.length) {
                const rem = kinds.filter((k) => (nK[k] || 0) % pick[k]);
                // (first: the kinds' rows can alternate - a kind's two short rows need another kind's row between them)
                const sz = Object.fromEntries(kinds.map((k) => [k, rowSizes(nK[k] || 0, pick[k])]));
                const ok = orderKinds(Object.fromEntries(kinds.map((k) => [k, sz[k].length])), Object.fromEntries(kinds.map((k) => [k, sz[k].filter((n) => n < pick[k]).length])), kinds).excess > 0 ? 1 : 0;
                const cost = [ok, rem.length, kinds.reduce((a, k) => a + Math.ceil((nK[k] || 0) / pick[k]) * hK[k], 0), kinds.reduce((a, k) => a + (C[k] - pick[k]), 0)];
                const lt = (a, q) => { for (let j = 0; j < a.length; j++) { if (a[j] < q[j] - 1e-9) return true; if (a[j] > q[j] + 1e-9) return false; } return false; };
                if (!best || lt(cost, best.cost)) best = { cost, C: Object.assign({}, pick), last: rem[0] || null, rem };
                return;
            }
            for (const m of okC[kinds[i]]) { pick[kinds[i]] = m; walk(i + 1, pick); }
        };
        walk(0, {});
        return best;
    };
    const Cauto = Object.assign({}, C);
    const box = (x) => boxA(x, C[kindOf[x.pool]], kdP);
    /** Set the print's counts across for these problems (an exact count); -> the kind whose short row ends it. */
    const fix = (nK) => { const ch = chooseC(nK); Object.assign(C, ch.C); return ch; };
    return { c, b, hAt, kindOf, kinds, idsOf, C, Cauto, kdP, box, mode, asked, clamped, fix };
}

/**
 * A row's boxes on a lattice of U units: each as wide as its drawing needs, the rest of the row (A units) shared
 * equally; a fast fact never wider than its drawing / 0.5 while a box beside it can take the rest (mixed-m3 width).
 */
function shareRow(ds, A, U, look) {
    const pitch = factPitchMm(U, look);
    const unitsOf = (mm) => Math.max(1, Math.ceil((mm + cellGapMm(look)) / pitch - 1e-6));
    const n = ds.length;
    let need = ds.map((d) => Math.min(A, d.need > 0 ? unitsOf(d.need) : 1));
    // (the needs, rounded up to whole units, over the row: the row was measured to hold them - equal shares)
    if (need.reduce((a, v) => a + v, 0) > A) need = need.map(() => 1);
    const us = need.map(() => 0);
    let left = A;
    const fixed = new Set();
    for (let round = 0; round <= n; round++) {
        const open = ds.map((_, j) => j).filter((j) => !fixed.has(j));
        if (!open.length) break;
        const sh = Math.floor(left / open.length);
        const over = open.filter((j) => need[j] > sh);
        if (!over.length) {
            let rem = left - sh * open.length;
            for (const j of open) us[j] = sh;
            const o2 = open.slice().sort((p, q) => (ds[p].fact - ds[q].fact) || p - q);
            for (let k = 0; rem > 0; k = (k + 1) % o2.length) { us[o2[k]]++; rem--; }
            break;
        }
        for (const j of over) { us[j] = need[j]; left -= need[j]; fixed.add(j); }
    }
    const capF = (j) => (ds[j].fact ? Math.max(need[j], unitsOf(ds[j].ink / 0.5)) : Infinity);
    const others = ds.map((_, j) => j).filter((j) => !ds[j].fact);
    if (others.length) {
        let extra = 0;
        ds.forEach((d, j) => { if (d.fact && us[j] > capF(j)) { extra += us[j] - capF(j); us[j] = capF(j); } });
        for (let k = 0; extra > 0; k = (k + 1) % others.length) { us[others[k]]++; extra--; }
    }
    return us;
}

/** The row sizes of a kind's n problems at C across: full rows, then the rest (the print's short last row). */
function rowSizes(n, C) {
    if (n <= 0) return [];
    const out = Array(Math.floor(n / C)).fill(C);
    const r = n % C;
    // (owner 2026-11-03: no row under half full - a remainder under half its count across takes the last full row with
    // it into two rows of at least half each: 4 + 1 -> 3 + 2, 6 + 1 -> 4 + 3)
    if (r && out.length && r < Math.ceil(C / 2)) { out.pop(); out.push(Math.ceil((C + r) / 2), Math.floor((C + r) / 2)); }
    else if (r) out.push(r);
    return out;
}

/** The kinds' rows in print order when the short rows close it: {order, excess} - the full rows scheduled, the short
 *  rows (each kind's last ones) as the tail; the order whose longest same-kind run is least over the forced minimum. */
function orderKinds(R, shortsK, kinds) {
    const excess = (o) => {
        const tot = {}; for (const k of o) tot[k] = (tot[k] || 0) + 1;
        let worst = 0; let i = 0;
        while (i < o.length) { let j = i; while (j + 1 < o.length && o[j + 1] === o[i]) j++; worst = Math.max(worst, j - i + 1 - Math.max(1, Math.ceil(tot[o[i]] / (o.length - tot[o[i]] + 1)))); i = j + 1; }
        return worst;
    };
    const nS = kinds.reduce((a, k) => a + (shortsK[k] || 0), 0);
    const shortKs = kinds.filter((k) => shortsK[k]);
    if (nS <= 1) { const o = scheduleKinds(R, kinds, shortKs[0] || null); return { order: o, excess: excess(o) }; }
    const Rf = Object.fromEntries(kinds.map((k) => [k, R[k] - (shortsK[k] || 0)]));
    // (the tails: every distinct order of the short rows - at most a few)
    const tails = [];
    const perm = (left, acc) => {
        if (acc.length === nS) { tails.push(acc.slice()); return; }
        for (const k of shortKs) if (left[k]) { left[k]--; acc.push(k); perm(left, acc); acc.pop(); left[k]++; }
    };
    perm(Object.assign({}, shortsK), []);
    let best = null;
    for (const endF of [null, ...kinds.filter((k) => Rf[k] > 0)]) {
        for (const tail of tails) {
            const o = scheduleKinds(Rf, kinds, endF).concat(tail);
            const e = excess(o);
            if (!best || e < best.excess) best = { order: o, excess: e };
        }
    }
    return best;
}

/** The kinds' rows in print order: each kind's rows spread as evenly as the counts allow (runs <= the forced
 *  minimum); `end`: the kind whose row ends the print (its short row is the print's last). */
function scheduleKinds(R, kinds, end = null) {
    const live = kinds.filter((k) => (R[k] || 0) > 0);
    if (live.length <= 1) return live.length ? Array(R[live[0]]).fill(live[0]) : [];
    const split = (M, g) => Array.from({ length: g }, (_, i) => Math.floor(((i + 1) * M) / g) - Math.floor((i * M) / g));
    if (live.length === 2) {
        const [X, Y] = R[live[0]] >= R[live[1]] ? live : [live[1], live[0]];
        const M = R[X];
        const m = R[Y];
        const out = [];
        if (M === m) { for (let i = 0; i < M; i++) out.push(...(end === Y ? [X, Y] : [Y, X])); return out; }
        if (end === Y) {
            // (the minor kind ends the print: the major's rows in m groups, each before a minor row)
            split(M, m).forEach((nx) => { for (let j = 0; j < nx; j++) out.push(X); out.push(Y); });
            return out;
        }
        split(M, m + 1).forEach((nx, i) => { for (let j = 0; j < nx; j++) out.push(X); if (i < m) out.push(Y); });
        return out;
    }
    // (three kinds or more: the most rows left first, never the kind just placed; built from the END when a kind
    // must end the print)
    const left = Object.assign({}, R);
    const out = [];
    const total = live.reduce((a, k) => a + R[k], 0);
    for (let i = 0; i < total; i++) {
        const last = out[out.length - 1];
        const cand = live.filter((k) => left[k] > 0 && k !== last).sort((p, q) => left[q] - left[p] || kinds.indexOf(p) - kinds.indexOf(q));
        const k = i === 0 && end && left[end] > 0 ? end : (cand[0] || last);
        out.push(k);
        left[k]--;
    }
    return end ? out.reverse() : out;
}

/**
 * Lay a print out in rows by type: counts {id: n} -> {rows: [{kind, C, cells: [{x, d}], short}], pages: [{rows, H, n,
 * spare}], ...}. Each kind's problems in their own interleave (the skills one by one), the kinds' rows alternating.
 */
function rowsLay(S, pools, counts, seed, { exact = false, stretchLast = false } = {}) {
    const { c, b, kindOf, kinds, idsOf, C, box } = S;
    const look = c.ctx.look;
    const g = rowGapMm(look);
    // each kind's problems in order (its skills interleaved), then its rows
    const seqK = {};
    const sizesK = {};
    for (const k of kinds) {
        const kc = Object.fromEntries(idsOf(k).map((id) => [id, counts[id] || 0]));
        seqK[k] = seqOf({ ids: idsOf(k) }, pools, kc, seed).map((x) => ({ x, d: box(x) }));
        sizesK[k] = rowSizes(seqK[k].length, C[k]);
    }
    const R = Object.fromEntries(kinds.map((k) => [k, sizesK[k].length]));
    // (the short rows end the print: each its own grid on the last page - mixed-m3 shelfw / boxes; a kind's remainder
    // under half its count across is two short rows - rowSizes)
    const shortsK = Object.fromEntries(kinds.map((k) => [k, sizesK[k].filter((n) => n < C[k]).length]));
    const { order } = orderKinds(R, shortsK, kinds);
    // rows: each kind's sizes in its order; the short sizes are its last rows (they go to the last page)
    const at = Object.fromEntries(kinds.map((k) => [k, { row: 0, item: 0 }]));
    const rows = order.map((k) => {
        const p = at[k];
        const n = sizesK[k][p.row++];
        const cells = seqK[k].slice(p.item, p.item + n);
        p.item += n;
        return { kind: k, C: C[k], cells, short: n < C[k] };
    });
    const natH = (r) => Math.max(0, ...r.cells.map((e) => e.d.h));
    const H = rows.map(natH);
    // a short row closes its own grid (one trailing area a grid): the rows of a page split after each short row
    const heightOf = (rs) => rs.reduce((a, ri) => a + H[ri], 0) + Math.max(0, rs.length - 1) * g
        + 2 * GRID_EDGE_MM * (1 + rs.filter((ri) => rows[ri].short).length);
    const budgetOf = (pi) => (pi ? b.cont : b.first);
    const pages = [];
    let pg = null;
    for (let ri = 0; ri < rows.length; ri++) {
        const pi = pages.length - (pg ? 1 : 0);
        if (!pg || heightOf(pg.rows.concat(ri)) > budgetOf(pi) + 1e-6) { pg = { rows: [] }; pages.push(pg); }
        pg.rows.push(ri);
    }
    // (the last page under half the fullest: the pages share the rows evenly, as far as each page but the last can
    // still be filled within its rows' H13 ceilings - mixed-m2 fill, mixed-m3 fill)
    const nOf = (rs) => rs.reduce((a, ri) => a + rows[ri].cells.length, 0);
    const capOf = (ri) => {
        const hs = rows[ri].cells.filter((e) => !e.d.work).map((e) => e.d.h);
        return hs.length ? Math.max(H[ri], (Math.min(...hs) - NAT_MM) / GROW_FILL) : Infinity;
    };
    const growTo = (rs) => rs.reduce((a, ri) => a + Math.min(capOf(ri), 1e4), 0) + Math.max(0, rs.length - 1) * g + 2 * GRID_EDGE_MM;
    if (pages.length > 1) {
        const ns0 = pages.map((p) => nOf(p.rows));
        if (ns0[ns0.length - 1] * 2 < Math.max(...ns0)) {
            const P = pages.length;
            const out = [];
            let ri = 0;
            let left = rows.length ? nOf(rows.map((_, i) => i)) : 0;
            for (let pi = 0; pi < P; pi++) {
                const target = Math.ceil(left / (P - pi));
                const rs = [];
                let got = 0;
                while (ri < rows.length) {
                    // (a page before the last takes its share, and as many rows more as it needs to be filled within
                    // its rows' H13 ceilings)
                    if (pi < P - 1 && got >= target && rs.length && growTo(rs) >= budgetOf(pi) - BLANK_OK) break;
                    if (heightOf(rs.concat(ri)) > budgetOf(pi) + 1e-6) break;
                    rs.push(ri); got += rows[ri].cells.length; ri++;
                }
                out.push({ rows: rs });
                left -= got;
            }
            const ns = out.map((p) => nOf(p.rows));
            const ok = ri === rows.length && out.every((p) => p.rows.length) && ns[ns.length - 1] * 2 >= Math.max(...ns)
                && out.slice(0, -1).every((p, i) => growTo(p.rows) >= budgetOf(i) - BLANK_OK);
            if (ok) { pages.length = 0; pages.push(...out); }
        }
    }
    // (owner 2026-11-03: the short rows that end the print all stand on the LAST page, and the last page is never one
    // short row alone - whole rows carried from the page before, as long as it is still filled within H13)
    if (pages.length > 1) {
        let t0 = rows.length;
        while (t0 > 0 && rows[t0 - 1].short) t0--;
        const lastP = pages[pages.length - 1];
        const prevP = pages[pages.length - 2];
        const P1 = pages.length - 1;
        const fitsLast = (rs) => heightOf(rs) <= budgetOf(P1) + 1e-6;
        while (t0 < rows.length && lastP.rows[0] > t0 && prevP.rows.length > 1 && fitsLast([prevP.rows[prevP.rows.length - 1]].concat(lastP.rows))) {
            lastP.rows.unshift(prevP.rows.pop());
        }
        if (lastP.rows.length === 1 && rows[lastP.rows[0]].short && prevP.rows.length > 1) {
            const rest = prevP.rows.slice(0, -1);
            const moved = [prevP.rows[prevP.rows.length - 1]].concat(lastP.rows);
            if (fitsLast(moved) && growTo(rest) >= budgetOf(P1 - 1) - BLANK_OK) { prevP.rows = rest; lastP.rows = moved; }
        }
    }
    // the short rows of the last page close its grids: they go to its end, kinds still alternating where they can
    // (a short row in the middle of a page is the last row of its own grid - heightOf counts its border)
    pages.forEach((p, pi) => {
        p.H = p.rows.map((ri) => H[ri]);
        const last = pi === pages.length - 1;
        let spare = Math.max(0, budgetOf(pi) - heightOf(p.rows));
        if (!(exact && last) || stretchLast) {
            const caps = p.rows.map(capOf);
            for (let it = 0; it < 10 && spare > 0.05; it++) {
                const open = p.H.map((h, k) => k).filter((k) => caps[k] - p.H[k] > 0.05);
                if (!open.length) break;
                const each = spare / open.length;
                for (const k of open) { const add = Math.min(each, caps[k] - p.H[k]); p.H[k] += add; spare -= add; }
            }
            p.spareCapped = spare;
            if (spare > BLANK_OK) { const each = spare / p.H.length; p.H = p.H.map((h) => h + each); spare = 0; }
        } else p.spareCapped = 0;
        p.spare = spare;
        p.n = nOf(p.rows);
    });
    return { rows, pages, order, R, sizesK, seqK, heightOf, budgetOf };
}

/** The kinds' problems by the weights: {kind: n} -> {id: n} (each skill two at least where the kind holds them). */
function rowsDeal(S, w, nK) {
    const out = {};
    for (const k of S.kinds) {
        const ids = S.idsOf(k);
        const n = nK[k] || 0;
        const ws = Object.fromEntries(ids.map((id) => [id, w[id] || 1]));
        const d = dealCounts(ws, n, { min: Math.min(2, Math.floor(n / Math.max(1, ids.length))) }).counts;
        for (const id of ids) out[id] = d[id] || 0;
    }
    return out;
}

/**
 * Fill P pages with whole rows of every kind: the rows of each kind as near its weighted share as whole rows allow,
 * every page filled within its rows' H13 ceilings, the most problems. -> {counts, L (the laid print)} or null.
 */
function rowsFill(S, pools, w, P, seed) {
    const { kinds, idsOf, C, b } = S;
    const W = kinds.reduce((a, k) => a + idsOf(k).reduce((x, id) => x + (w[id] || 1), 0), 0);
    const wK = Object.fromEntries(kinds.map((k) => [k, idsOf(k).reduce((x, id) => x + (w[id] || 1), 0)]));
    // each kind's row height (its tallest probe box): how many rows a page could take
    const hK = Object.fromEntries(kinds.map((k) => [k, Math.max(8, ...idsOf(k).flatMap((id) => (pools[id] || []).map((it) => S.box({ pool: id, it }).h)))]));
    const rMax = Object.fromEntries(kinds.map((k) => [k, Math.max(1, Math.ceil(((b.first + (P - 1) * b.cont) / hK[k])) + 1)]));
    let best = null;
    const all = [];
    const saveC = Object.assign({}, C);
    Object.assign(C, S.Cauto);
    const combo = (i, R) => {
        if (i === kinds.length) {
            const nK = Object.fromEntries(kinds.map((k) => [k, R[k] * C[k]]));
            if (kinds.some((k) => R[k] < 1 || nK[k] < Math.min(2 * idsOf(k).length, 2 * C[k]))) return;
            const counts = rowsDeal(S, w, nK);
            const L = rowsLay(S, pools, counts, seed, { exact: false });
            if (L.pages.length > P) return;
            const tight = L.pages.every((pg) => (pg.spareCapped || 0) <= BLANK_OK);
            const N = kinds.reduce((a, k) => a + nK[k], 0);
            const dev = Math.max(...kinds.map((k) => Math.abs(nK[k] - (wK[k] / W) * N) / C[k]));
            all.push({ tight, full: L.pages.length === P, N, dev, counts, L });
            return;
        }
        const k = kinds[i];
        for (let r = 1; r <= rMax[k]; r++) { R[k] = r; combo(i + 1, R); }
    };
    combo(0, {});
    Object.assign(C, saveC);
    // (filled first, on the pages asked; then the weights as closely as a page within a tenth of the fullest allows -
    // "fill the paper", owner 2026-11-03; the notes say which skill fills the rest)
    const pool = all.filter((x) => x.tight && x.full).length ? all.filter((x) => x.tight && x.full) : all.filter((x) => x.tight).length ? all.filter((x) => x.tight) : all;
    const top = Math.max(0, ...pool.map((x) => x.N));
    for (const x of pool.filter((y) => y.N >= 0.9 * top - 1e-9)) if (!best || x.dev < best.dev - 1e-9 || (Math.abs(x.dev - best.dev) < 1e-9 && x.N > best.N)) best = x;
    return best;
}

/** Counts for layout A: the exact counts, else the pages filled (rowsFill). Same shape as m2Counts. */
const nKOf = (S, counts) => Object.fromEntries(S.kinds.map((k) => [k, S.idsOf(k).reduce((a, id) => a + (counts[id] || 0), 0)]));
function rowsCounts(poolsIn, input) {
    const S = rowsSetup(poolsIn, input);
    const w0 = m2Weights(input, S.c.ids);
    const seed = deriveSeed('mixed-practice', (input && input.seed) || 0);
    const exact = input.exactCounts || null;
    const sum = (x) => S.c.ids.reduce((a, id) => a + (x[id] || 0), 0);
    // a full page of this mix (the dialog's figure): one page filled by the weights (an exact count's shape)
    const shape = exact ? Object.fromEntries(S.c.ids.map((id) => [id, Math.max(1, Number(exact[id]) || 1)])) : w0;
    if (exact) {
        const counts = Object.fromEntries(S.c.ids.map((id) => [id, Math.max(0, Math.floor(Number(exact[id]) || 0))]));
        S.fix(nKOf(S, counts));
        const L = rowsLay(S, poolsIn, counts, seed, { exact: true });
        const one = rowsFill(S, poolsIn, shape, 1, seed);
        const spare = Math.max(0, ...L.pages.slice(0, -1).map((p) => p.spare || 0));
        const perPage = L.pages.length > 1 ? Math.ceil(sum(counts) / L.pages.length) : Math.max(sum(counts), one ? sum(one.counts) : 0);
        return { counts, perPage, across: Math.max(...Object.values(S.C)), acrossByKind: S.C, classes: S.c, fill: { counts, rest: false }, ladderNote: '', spare, S };
    }
    const P = Math.max(1, Number(input.mixPages) || 1);
    const best = rowsFill(S, poolsIn, w0, P, seed);
    const cells = best ? best.counts : Object.fromEntries(S.c.ids.map((id) => [id, 2]));
    const rest = !withinShare(cells, w0, S.c.ids);
    const must = Number(input.mustBeat) || 0;
    const ladderNote = must && sum(cells) / P <= must
        ? `Mixed practice: with the skills in the proportions asked, this size holds ${Math.round(sum(cells) / P)} problems a page, no more than the next size up (${must}).` : '';
    const spare = best ? Math.max(0, ...best.L.pages.map((p) => p.spare || 0)) : 0;
    return { counts: cells, perPage: Math.round(sum(cells) / P), across: Math.max(...Object.values(S.C)), acrossByKind: S.C, classes: S.c, fill: { counts: cells, rest }, ladderNote, spare, S };
}

function planRowsA(input, pools) {
    const S = rowsSetup(pools, input);
    const { c, b, kindOf, kinds, C } = S;
    const { ctx, ids, cls } = c;
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
    const asked = input.exactCounts ? 1 : Math.max(1, Number(input.mixPages) || 1);
    const seed0 = deriveSeed('mixed-practice', input.seed || 0);
    const counts0 = Object.fromEntries(ids.map((id) => [id, (pools[id] || []).length]));
    S.fix(nKOf(S, counts0));
    let L = rowsLay(S, pools, counts0, seed0, { exact: !!input.exactCounts });
    // (a fill print ends in whole rows: a short row the dealt problems leave is left off)
    if (!input.exactCounts && L.rows.some((r) => r.short)) {
        const cut = Object.assign({}, counts0);
        for (const r of L.rows.filter((x) => x.short)) for (const e of r.cells) if (cut[e.x.pool] > 2) cut[e.x.pool]--;
        const L2 = rowsLay(S, pools, cut, seed0, { exact: false });
        if (!L2.rows.some((r) => r.short) && L2.pages.length <= L.pages.length) L = L2;
    }
    // (a fill print never takes a page more than asked: the dealt boxes, taller than the probe's, give up whole rows
    // from the end - the kind of the last row, its skills from the most problems)
    for (let guard = 0; guard < 40 && !input.exactCounts && L.pages.length > asked; guard++) {
        const lastR = L.rows[L.rows.length - 1];
        const cut = Object.fromEntries(ids.map((id) => [id, L.rows.reduce((a, r) => a + r.cells.filter((e) => e.x.pool === id).length, 0)]));
        for (const e of lastR.cells) cut[e.x.pool]--;
        if (ids.some((id) => cut[id] < 0) || ids.reduce((a, id) => a + cut[id], 0) < 2) break;
        L = rowsLay(S, pools, cut, seed0, { exact: false });
    }
    const n = L.pages.reduce((a, p) => a + p.n, 0);
    const labels = labels0 === 'letter' && n > 26 ? 'tab' : labels0;
    const frame = titledCont(frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: n }));
    const instr = instructionText('default-solve');
    const notes = [];
    const pages = [];
    const pageOrders = [];
    const turnsPages = [];
    const achieved = {};
    let start = 1;
    let num = 1;
    const drawAt = (it, id, k) => {
        let x = it.template === 'fact' ? atColumns(it, k) : it;
        const cq = x.q && x.q.cell;
        if (cls[id].pt && cq && cq.template === 'fact') {
            x = Object.assign({}, x, { q: Object.assign({}, x.q, { cell: Object.assign({}, cq, { payload: Object.assign({}, cq.payload, { pt: cls[id].pt, padTop: cls[id].padTop }) }) }) });
        }
        return x;
    };
    const gap = rowGapMm(ctx.look);
    // (the short rows that end the print: each its own grid from the frame's left edge)
    const tailShort = (ri) => { for (let j = ri; j < L.rows.length; j++) if (!L.rows[j].short) return false; return true; };
    for (const [pi, pg] of L.pages.entries()) {
        const sections = [];
        if (pi === 0 && input.stepStrip) sections.push({ kind: 'html', html: input.stepStrip });
        const band = { kind: 'band', label: '', instr, contents: [] };
        sections.push(band);
        const order = [];
        const turns = [];
        // the page's grids: a short row closes the grid it ends
        const grids = [];
        let cur = [];
        pg.rows.forEach((ri, j) => {
            // (rows whose counts across share no lattice of <= U_MAX units start a grid of their own)
            if (cur.length && cur.reduce((a, jj) => lcm2(a, L.rows[pg.rows[jj]].C), L.rows[ri].C) > U_MAX) { grids.push(cur); cur = []; }
            // (the print's last row, short: its own grid from the frame's left edge, closed on its right - r4)
            const final = tailShort(ri);
            if (final && cur.length) { grids.push(cur); cur = []; }
            cur.push(j);
            if (L.rows[ri].short || j === pg.rows.length - 1) { grids.push(cur); cur = []; }
        });
        for (const gj of grids) {
            const finalShort = gj.length === 1 && tailShort(pg.rows[gj[0]]);
            // (one lattice for the grid's rows: the counts across' common multiple, as fine as a unit wider than the
            // grid's rule allows - <= U_MAX units)
            const l0 = gj.reduce((a, j) => lcm2(a, L.rows[pg.rows[j]].C), 1);
            const U = l0 * Math.max(1, Math.floor(U_MAX / l0));
            const items = [];
            let trail = null;
            gj.forEach((j, rj) => {
                const r = L.rows[pg.rows[j]];
                // (a short row of half its count across or more stands clear of half the frame - its gaps taken back)
                const A0 = r.short ? Math.max(Math.round((U * r.cells.length) / r.C), 2 * r.cells.length >= r.C ? Math.ceil(U * 0.52) : 0) : U;
                const us = shareRow(r.cells.map((e) => e.d), A0, U, ctx.look);
                let u0 = 0;
                let prev = null;
                r.cells.forEach((e, ci) => {
                    const span = us[ci];
                    const col = u0 + 1;
                    u0 += span;
                    let it = drawAt(e.x.it, e.x.pool, e.d.k);
                    const pad = input.rulePads && input.rulePads[num];
                    num++;
                    if (pad && pad.mm > 0) {
                        const cq = it.q && it.q.cell;
                        if (it.template === 'fact' && cq && cq.payload) {
                            const pt0 = cq.payload.padTop !== undefined ? cq.payload.padTop : factPadTop(labels, e.d.k);
                            it = Object.assign({}, it, { q: Object.assign({}, it.q, { cell: Object.assign({}, cq, { payload: Object.assign({}, cq.payload, { padTop: Math.round((pt0 + pad.mm) * 100) / 100 }) }) }) });
                        } else it = Object.assign({}, it, { cellStyle: `${it.cellStyle || ''}padding-top:${Math.round((pad.padMm + pad.mm) * 100) / 100}mm;` });
                    }
                    order.push(e.x.pool);
                    if (prev !== e.x.pool) turns.push(e.x.pool);
                    prev = e.x.pool;
                    achieved[e.x.pool] = (achieved[e.x.pool] || 0) + 1;
                    items.push(Object.assign(planItem(markWork(it, ctx.size), { cols: e.d.k }), {
                        kind: kindOf[e.x.pool], skill: skillOfItem(e.x.it),
                        place: { col, row: rj + 1, span, rows: 1 },
                    }));
                });
                if (r.short) trail = { col: u0 + 1, row: rj + 1, rows: 1 };
            });
            const H = gj.map((j) => pg.H[j]);
            let cols = U;
            if (finalShort) { cols = items.reduce((a, it) => a + it.place.span, 0); trail = null; }
            const part = gridPart(items, { cols, rows: gj.length, labels, start });
            part.height = `${Math.round((H.reduce((a, h) => a + h, 0) + (H.length - 1) * gap + 2 * GRID_EDGE_MM) * 100) / 100}mm`;
            part.rowsTpl = H.map((h) => `${Math.round(h * 100) / 100}fr`).join(' ');
            if (trail) part.trail = trail;
            if (finalShort) {
                part.widthPct = ((cols * factPitchMm(U, ctx.look) - gap + BAND_SIDE_MM) / (186 - 2 * BAND_SIDE_MM)) * 100;
                part.left = true;
                const prevPart = band.contents[band.contents.length - 1];
                if (prevPart) prevPart.bottom = true;
            }
            band.contents.push(part);
            start += items.length;
        }
        pageOrders.push(order);
        turnsPages.push(turns);
        pages.push({ sections });
    }
    // the notes, from the printed order WITHIN each kind (a row holds one kind; runs are judged within it)
    const printAll = pageOrders.flat();
    const total = Object.fromEntries(ids.map((id) => [id, printAll.filter((x) => x === id).length]));
    const runNotes = {};
    for (const k of kinds) {
        const seqk = printAll.filter((id) => kindOf[id] === k);
        const rk = runsIn(seqk);
        const live = S.idsOf(k).filter((id) => total[id]);
        for (const id of live) {
            if ((rk[id] || 0) > 2 && live.length > 1) {
                runNotes[id] = rk[id];
                notes.push(`${names[id].name} takes most of its rows, so up to ${rk[id]} ${names[id].noun} come in a row`);
            }
        }
    }
    // (and across the whole print: a skill alone in its kind fills its rows, so its problems come in a row)
    const runsAll = runsIn(printAll);
    for (const id of ids) {
        if ((runsAll[id] || 0) > 2 && ids.filter((x) => total[x]).length > 1 && runNotes[id] !== runsAll[id]) {
            notes.push(`${names[id].name} has rows of its own, so up to ${runsAll[id]} ${names[id].noun} come in a row`);
        }
    }
    if (!input.exactCounts && !withinShare(total, weights, ids)) {
        const over = ids.slice().sort((a, c2) => total[c2] / (weights[c2] || 1) - total[a] / (weights[a] || 1))[0];
        notes.push(`${names[over].name} fills the rest of the page: ${ids.map((id) => `${total[id]} ${names[id].noun}`).join(', ')}.`);
    }
    if (input.ladderNote) notes.push(input.ladderNote);
    if (L.pages.length > asked) notes.push(`Mixed practice: the ${n} problems need ${L.pages.length} pages, so ${L.pages.length - asked === 1 ? 'a page was' : `${L.pages.length - asked} pages were`} added.`);
    // (a kind's rows are whole rows of its own: a skill left off a page is said)
    const off = ids.filter((id) => total[id] >= pageOrders.length && pageOrders.some((o) => !o.includes(id)));
    if (off.length && pageOrders.length > 1) notes.push(`Mixed practice: each row holds one kind of problem, so ${off.map((id) => names[id].name).join(' and ')} ${off.length > 1 ? 'are' : 'is'} not on every page (one on every page would need another page of rows).`);
    const lone = [];
    for (const order of pageOrders) for (const id of ids) if (order.filter((x) => x === id).length === 1) lone.push(names[id].name);
    if (lone.length) notes.push(`Mixed practice: ${[...new Set(lone)].join(' and ')} has only one problem on a page.`);
    const loads = pageOrders.map((o) => o.length);
    // (an exact count over several pages: the problems a page of THIS print holds, page by page - n over its pages,
    // rounded up; rows of one kind make pages of different loads)
    let perPage = input.exactCounts && loads.length > 1 ? Math.ceil(n / loads.length) : Math.max(0, ...loads);
    if (!(input.exactCounts && loads.length > 1)) {
        const one = rowsFill(S, pools, input.exactCounts ? Object.fromEntries(ids.map((id) => [id, Math.max(1, Number(input.exactCounts[id]) || 1)])) : weights, 1, seed0);
        if (one) perPage = Math.max(perPage, one.L.pages[0] ? one.L.pages[0].n : 0);
    }
    const turnsAll = printAll;
    const forcedOf = (id) => Math.max(2, Math.ceil(total[id] / Math.max(1, n - total[id] + 1)));
    const runsByPage = pageOrders.map((o) => Object.fromEntries(ids.map((id) => [id, { run: runsIn(o)[id] || 0, turns: o.filter((x) => x === id).length, cap: forcedOf(id) }])));
    const longest = Math.max(0, ...Object.values(runsAll));
    const acrossTop = Math.max(...Object.values(C));
    const columnsMode = S.mode;
    const acrossByKind = Object.assign({}, C);
    return assemble(ROLE_ID, input, frame, pages, {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: acrossTop, achieved, arrangement: 'mixed', notes: [...new Set(notes)],
            m2: {
                groups: [{ pools: ids.slice(), R: 1, tall: [] }],
                classes: Object.fromEntries(ids.map((id) => [id, { k: C[kindOf[id]], s: 1, h: Math.round(cls[id].h * 10) / 10, full: C[kindOf[id]] === 1, tall: false, kind: kindOf[id] }])),
                budgets: { first: Math.round(b.first * 10) / 10, cont: Math.round(b.cont * 10) / 10 }, turns: pageOrders, longest, pages: pageOrders, asked, capNote: '', mustBeat: Number(input.mustBeat) || 0, perPage, runs: runsByPage, runNotes, turnsAll,
                across: acrossTop, acrossByKind, mixLayout: 'rows', rowKinds: L.rows.map((r) => r.kind), auto: columnsMode === 'auto', columnsMode, ...(S.clamped ? { clamped: true, asked: S.asked } : {}),
            },
            interleave: { keys: printAll, longest, notes: [] },
            fits: [{ cols: acrossTop, across: acrossTop, acrossByKind, mixLayout: 'rows', auto: columnsMode === 'auto', columnsMode, ...(S.clamped ? { clamped: true, asked: S.asked } : {}), rows: L.rows.length, perPage,
                line: `Fits: ${n} problems mixed in rows by type (${kinds.map((k) => `${k} ${C[k]} across`).join(', ')}), ${pages.length} page${pages.length > 1 ? 's' : ''} (${perPage} a page).` }],
        },
    });
}


/* ============================================== LAYOUT C: EVEN GRID (owner ruling 2026-11-03) */
// One count across for the print (B's choice, acrossFor), the problems in their interleaved order in rows of that count,
// every box ONE height - the tallest drawing's (a long procedure keeps its drawing and gives up working room); digits
// never shrink. Pages take whole rows; the print's short last row is its own grid from the left; every page but the
// last of an exact count shares its spare height equally (one height a page).

function evenSetup(pools, input) {
    const c = m2Classes(pools, input);
    const b = m2Budgets(input, c.ctx);
    const hAt = hCacheOf(c);
    const A = acrossFor(c, pools, input, b, hAt);
    const C = A.C;
    const box = (x) => {
        const d = boxOf(x, C, c, hAt);
        // (a long procedure's drawing without its working room: the even height takes the rest away)
        const h = d.work ? Math.max(8, d.h - workRowsOf(x.it) * WORK_ROW_MM) : d.h;
        return Object.assign({}, d, { need: d.full ? 0 : d.need, hDraw: h });
    };
    return { c, b, hAt, A, C, box };
}
/** Layout C's row sizes: rows of C; a remainder under half of C takes full rows with it into equal rows of at least
 *  half (5 + 1 -> 3 + 3, 4 + 4 + 1 -> 3 + 3 + 3), one left grid at the end; else two rows of at least half each. */
function evenSizes(n, C) {
    if (n <= 0) return [];
    const r = n % C;
    const f = Math.floor(n / C);
    if (!r || r >= Math.ceil(C / 2) || !f) return rowSizes(n, C);
    for (let j = 1; j <= Math.min(3, f); j++) {
        for (let m = C - 1; m >= Math.ceil(C / 2); m--) {
            const t = j * C + r;
            if (t % m === 0) return Array(f - j).fill(C).concat(Array(t / m).fill(m));
        }
    }
    return rowSizes(n, C);
}
function evenLay(E, pools, counts, seed, { exact = false } = {}) {
    const { c, b, C, box } = E;
    const g = rowGapMm(c.ctx.look);
    const seq = seqOf(c, pools, counts, seed).map((x) => ({ x, d: box(x) }));
    const H0 = Math.max(8, ...seq.map((e) => e.d.hDraw));
    const rows = [];
    let i0 = 0;
    for (const n of evenSizes(seq.length, C)) { rows.push({ cells: seq.slice(i0, i0 + n), short: n < C, C }); i0 += n; }
    const fit = (budget, extra) => Math.max(1, Math.floor((budget - 2 * GRID_EDGE_MM * (1 + extra) + g) / (H0 + g) + 1e-9));
    const pages = [];
    let ri = 0;
    let nT = 0;
    while (nT < rows.length && rows[rows.length - 1 - nT].short) nT++;
    while (ri < rows.length) {
        const pi = pages.length;
        const budget = pi ? b.cont : b.first;
        let k = Math.min(rows.length - ri, fit(budget, 0));
        if (ri + k === rows.length && rows[rows.length - 1].short) k = Math.min(k, fit(budget, 1));
        pages.push({ rows: Array.from({ length: k }, (_, j) => ri + j) });
        ri += k;
    }
    // (owner 2026-11-03: the rebalanced short rows all stand on the LAST page, and the last page is never one short row
    // alone - the full rows shared out evenly over the pages, the short rows with the last)
    if (pages.length > 1 && nT && (nT > 1 || pages[pages.length - 1].rows.length === 1)) {
        const P = pages.length;
        const nF = rows.length - nT;
        const capOf = (pi, last) => fit(pi ? b.cont : b.first, last ? 1 : 0);
        const per = Math.ceil(rows.length / P);
        const takes = [];
        let left = nF;
        for (let pi = 0; pi < P - 1; pi++) { const t = Math.min(capOf(pi, false), per, left); takes.push(t); left -= t; }
        // (the last page: what is left of the full rows and the short rows; earlier pages take more where it overflows)
        for (let pi = P - 2; pi >= 0 && left + nT > capOf(P - 1, true); pi--) { const more = Math.min(capOf(pi, false) - takes[pi], left + nT - capOf(P - 1, true), left); takes[pi] += more; left -= more; }
        if (left + nT <= capOf(P - 1, true) && takes.every((t) => t > 0)) {
            pages.length = 0;
            let at = 0;
            for (const t of takes) { pages.push({ rows: Array.from({ length: t }, (_, j) => at + j) }); at += t; }
            pages.push({ rows: Array.from({ length: rows.length - at }, (_, j) => at + j) });
        }
    }
    pages.forEach((p, pi) => {
        const budget = pi ? b.cont : b.first;
        const last = pi === pages.length - 1;
        const nSh = new Set(p.rows.filter((r) => rows[r].short).map((r) => rows[r].cells.length)).size;
        const used = p.rows.length * H0 + (p.rows.length - 1) * g + 2 * GRID_EDGE_MM * (1 + (rows[p.rows[p.rows.length - 1]].short ? nSh : 0));
        const spare = Math.max(0, budget - used);
        const each = exact && last ? 0 : spare / p.rows.length;
        p.H = p.rows.map(() => H0 + each);
        p.spare = exact && last ? spare : 0;
        p.spareCapped = p.spare;
        p.n = p.rows.reduce((a, r) => a + rows[r].cells.length, 0);
    });
    return { rows, pages, H0 };
}
function evenCounts(poolsIn, input) {
    const E = evenSetup(poolsIn, input);
    const ids = E.c.ids;
    const w0 = m2Weights(input, ids);
    const seed = deriveSeed('mixed-practice', (input && input.seed) || 0);
    const sum = (x) => ids.reduce((a, id) => a + (x[id] || 0), 0);
    const exact = input.exactCounts || null;
    if (exact) {
        const counts = Object.fromEntries(ids.map((id) => [id, Math.max(0, Math.floor(Number(exact[id]) || 0))]));
        const L = evenLay(E, poolsIn, counts, seed, { exact: true });
        return { counts, perPage: L.pages.length > 1 ? Math.ceil(sum(counts) / L.pages.length) : sum(counts), across: E.C, classes: E.c, fill: { counts, rest: false }, ladderNote: '', spare: 0 };
    }
    const P = Math.max(1, Number(input.mixPages) || 1);
    // (the pages filled with whole rows: as many rows as P pages hold at the even height, the weights' deal)
    let best = null;
    for (let n = 2 * ids.length; n <= 400; n += 1) {
        if (n % E.C) continue;
        const x = dealCounts(w0, n, { min: 2 }).counts;
        const L = evenLay(E, poolsIn, x, seed);
        if (L.pages.length > P) break;
        best = x;
    }
    const cells = best || Object.fromEntries(ids.map((id) => [id, 2]));
    return { counts: cells, perPage: Math.round(sum(cells) / P), across: E.C, classes: E.c, fill: { counts: cells, rest: false }, ladderNote: '', spare: 0 };
}
function planEvenC(input, pools) {
    const E = evenSetup(pools, input);
    const { c, C, A } = E;
    const { ctx, ids, cls } = c;
    const labels0 = labelStyleOf(ctx.look, input.labels);
    const seed0 = deriveSeed('mixed-practice', input.seed || 0);
    const counts0 = Object.fromEntries(ids.map((id) => [id, (pools[id] || []).length]));
    const L = evenLay(E, pools, counts0, seed0, { exact: !!input.exactCounts });
    const n = L.pages.reduce((a, p) => a + p.n, 0);
    const labels = labels0 === 'letter' && n > 26 ? 'tab' : labels0;
    const frame = titledCont(frameOf({ skills: input.skills || [], input, tabId: input.mixTabId || 'Mixed 1', title: input.mixTitle || 'Mixed practice', twoLine: true, score: n }));
    const instr = instructionText('default-solve');
    const gap = rowGapMm(ctx.look);
    const U = UNITS_PER * C;
    const pages = [];
    const pageOrders = [];
    const achieved = {};
    let start = 1;
    let num = 1;
    for (const [pi, pg] of L.pages.entries()) {
        const sections = [];
        if (pi === 0 && input.stepStrip) sections.push({ kind: 'html', html: input.stepStrip });
        const band = { kind: 'band', label: '', instr, contents: [] };
        sections.push(band);
        const order = [];
        const lastShort = L.rows[pg.rows[pg.rows.length - 1]].short;
        // (the full rows one grid; the short rows that end the print a left grid each count across - equal rows share one)
        const groups = [];
        for (const ri of pg.rows) {
            const gr = groups[groups.length - 1];
            const r = L.rows[ri];
            if (gr && (r.short ? L.rows[gr[0]].short && L.rows[gr[0]].cells.length === r.cells.length : !L.rows[gr[0]].short)) gr.push(ri);
            else groups.push([ri]);
        }
        groups.forEach((gr, gi) => {
            const items = [];
            const short = lastShort && L.rows[gr[0]].short;
            let cols = U;
            gr.forEach((ri, rj) => {
                const r = L.rows[ri];
                const A0 = r.short ? Math.max(Math.round((U * r.cells.length) / C), 2 * r.cells.length >= C ? Math.ceil(U * 0.52) : 0) : U;
                const us = shareRow(r.cells.map((e) => e.d), A0, U, ctx.look);
                let u0 = 0;
                r.cells.forEach((e, ci) => {
                    let it = e.x.it.template === 'fact' ? atColumns(e.x.it, e.d.k) : e.x.it;
                    const cq = it.q && it.q.cell;
                    if (cls[e.x.pool].pt && cq && cq.template === 'fact') it = Object.assign({}, it, { q: Object.assign({}, it.q, { cell: Object.assign({}, cq, { payload: Object.assign({}, cq.payload, { pt: cls[e.x.pool].pt, padTop: cls[e.x.pool].padTop }) }) }) });
                    const pad = input.rulePads && input.rulePads[num];
                    num++;
                    if (pad && pad.mm > 0) {
                        if (it.template === 'fact' && it.q && it.q.cell && it.q.cell.payload) {
                            const cq2 = it.q.cell;
                            const pt0 = cq2.payload.padTop !== undefined ? cq2.payload.padTop : factPadTop(labels, e.d.k);
                            it = Object.assign({}, it, { q: Object.assign({}, it.q, { cell: Object.assign({}, cq2, { payload: Object.assign({}, cq2.payload, { padTop: Math.round((pt0 + pad.mm) * 100) / 100 }) }) }) });
                        } else it = Object.assign({}, it, { cellStyle: `${it.cellStyle || ''}padding-top:${Math.round((pad.padMm + pad.mm) * 100) / 100}mm;` });
                    }
                    order.push(e.x.pool);
                    achieved[e.x.pool] = (achieved[e.x.pool] || 0) + 1;
                    items.push(Object.assign(planItem(markWork(it, ctx.size), { cols: e.d.k }), { skill: skillOfItem(e.x.it), place: { col: u0 + 1, row: rj + 1, span: us[ci], rows: 1 } }));
                    u0 += us[ci];
                });
                if (short) cols = u0;
            });
            const H = gr.map((ri) => pg.H[pg.rows.indexOf(ri)]);
            const part = gridPart(items, { cols, rows: gr.length, labels, start });
            part.height = `${Math.round((H.reduce((a, h) => a + h, 0) + (H.length - 1) * gap + 2 * GRID_EDGE_MM) * 100) / 100}mm`;
            part.rowsTpl = H.map((h) => `${Math.round(h * 100) / 100}fr`).join(' ');
            if (short) {
                part.widthPct = ((cols * factPitchMm(U, ctx.look) - gap + BAND_SIDE_MM) / (186 - 2 * BAND_SIDE_MM)) * 100;
                part.left = true;
                const prev = band.contents[band.contents.length - 1];
                if (prev) prev.bottom = true;
            }
            band.contents.push(part);
            start += items.length;
        });
        pageOrders.push(order);
        pages.push({ sections });
    }
    const printAll = pageOrders.flat();
    const runs = runsIn(printAll);
    const total = Object.fromEntries(ids.map((id) => [id, printAll.filter((x) => x === id).length]));
    const notes = [];
    const names = Object.fromEntries(ids.map((id) => [id, poolName(input, pools[id])]));
    for (const id of ids) if ((runs[id] || 0) > 2 && ids.filter((x) => total[x]).length > 1) notes.push(`${names[id]} takes most of the page, so up to ${runs[id]} ${names[id].toLowerCase()} problems come in a row`);
    const asked = input.exactCounts ? 1 : Math.max(1, Number(input.mixPages) || 1);
    if (L.pages.length > asked) notes.push(`Mixed practice: the ${n} problems need ${L.pages.length} pages, so ${L.pages.length - asked === 1 ? 'a page was' : `${L.pages.length - asked} pages were`} added.`);
    notes.push('Mixed practice (Even grid): every box is one height, so long problems have less working room.');
    const loads = pageOrders.map((o) => o.length);
    const perPage = input.exactCounts && loads.length > 1 ? Math.ceil(n / loads.length) : Math.max(0, ...loads);
    const forced = (id) => Math.max(2, Math.ceil(total[id] / (n - total[id] + 1)));
    const runsByPage = pageOrders.map((o) => Object.fromEntries(ids.map((id) => [id, { run: runsIn(o)[id] || 0, turns: o.filter((x) => x === id).length, cap: forced(id) }])));
    const longest = Math.max(0, ...Object.values(runs));
    const mode = A.mode || (A.auto ? 'auto' : 'exact');
    return assemble(ROLE_ID, input, frame, pages, {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: C, achieved, arrangement: 'mixed', notes: [...new Set(notes)],
            m2: { groups: [{ pools: ids.slice(), R: 1, tall: [] }], classes: Object.fromEntries(ids.map((id) => [id, { k: C, s: 1, h: Math.round(L.H0 * 10) / 10, full: false, tall: false }])),
                budgets: { first: Math.round(E.b.first * 10) / 10, cont: Math.round(E.b.cont * 10) / 10 }, turns: pageOrders, longest, pages: pageOrders, asked, capNote: '', mustBeat: Number(input.mustBeat) || 0, perPage, runs: runsByPage, runNotes: {}, turnsAll: printAll,
                across: C, mixLayout: 'even', auto: !!A.auto, columnsMode: mode, ...(A.clamped ? { clamped: true, asked: A.asked } : {}) },
            interleave: { keys: printAll, longest, notes: [] },
            fits: [{ cols: C, across: C, mixLayout: 'even', auto: !!A.auto, columnsMode: mode, ...(A.clamped ? { clamped: true, asked: A.asked } : {}), rows: L.rows.length, perPage,
                line: `Fits: ${n} problems mixed in an even grid, ${C} across, every box ${Math.round(L.H0)} mm, ${pages.length} page${pages.length > 1 ? 's' : ''} (${perPage} a page).` }],
        },
    });
}

/**
 * The problems each pool gets: the exact counts asked, else the pages asked filled - the most problems the weights
 * hold on that many pages of THIS grid (every count within its share, two of each), the notes say where the rest
 * went. `perPage` is a full page of this mix at this size (the dialog's figure), `across` the count across.
 */
export function m2Counts(poolsIn, input) {
    if (mixLayoutOf(input) === 'rows') return rowsCounts(poolsIn, input);
    if (mixLayoutOf(input) === 'even') return evenCounts(poolsIn, input);
    const c = m2Classes(poolsIn, input);
    const b = m2Budgets(input, c.ctx);
    const w0 = m2Weights(input, c.ids);
    const hAt = hCacheOf(c);
    const A = acrossFor(c, poolsIn, input, b, hAt);
    const seed = deriveSeed('mixed-practice', (input && input.seed) || 0);
    const lay = (x, ex = false) => gridOf(seqOf(c, poolsIn, x, seed), A.C, c, b, hAt, { exact: ex });
    const sum = (x) => c.ids.reduce((a, id) => a + (x[id] || 0), 0);
    const exact = input.exactCounts || null;
    if (exact) {
        const counts = Object.fromEntries(c.ids.map((id) => [id, Math.max(0, Math.floor(Number(exact[id]) || 0))]));
        const G = lay(counts, true);
        const spare = Math.max(0, ...G.pages.slice(0, -1).map((p) => p.spare || 0));
        return { counts, perPage: Math.max(1, A.cap || 0), across: A.C, classes: c, fill: { counts, rest: false }, ladderNote: '', spare };
    }
    const P = Math.max(1, Number(input.mixPages) || 1);
    // (a fill print ends in a whole row: no short row, no trailing area)
    const fits = (x) => { const G = lay(x); return G.pages.length <= P && !G.short ? G : null; };
    // the most problems that fill the pages in whole rows: for each total, the weights' deal and its neighbours (one
    // problem moved between two skills); a deal that ends in a short row only where none fills its rows
    const W = c.ids.reduce((a, id) => a + (w0[id] || 1), 0);
    const dev = (x) => c.ids.reduce((a, id) => a + Math.abs(x[id] / Math.max(1, sum(x)) - (w0[id] || 1) / W), 0);
    let best = null;
    let bestShort = null;
    let bestLoose = null;
    let miss = 0;
    const hi = Math.max(2 * c.ids.length + 2, 3 * (A.cap || 4) * P + 2 * A.C);
    for (let n = 2 * c.ids.length; n <= hi && miss < 3 * A.C + 4; n++) {
        const x0 = dealCounts(w0, n, { min: 2 }).counts;
        const cands = [x0];
        for (const a1 of c.ids) for (const b1 of c.ids) if (a1 !== b1 && x0[b1] > 2) cands.push(Object.assign({}, x0, { [a1]: x0[a1] + 1, [b1]: x0[b1] - 1 }));
        // (FILL THE PAGE, owner 2026-11-03: a skill of smaller boxes may take more than its share where the weights'
        // deal leaves the page under-filled - the notes say so)
        for (const a1 of c.ids) for (const f of [2, 4, 8]) cands.push(dealCounts(Object.assign({}, w0, { [a1]: (w0[a1] || 1) * f }), n, { min: 2 }).counts);
        let any = false;
        for (const x of cands) {
            const G = lay(x);
            if (G.pages.length > P) continue;
            any = true;
            // (whole rows that fill the page within the rows' H13 ceilings first - no box stretched past its drawing)
            const tight = G.pages.every((pg) => (pg.spareCapped || 0) <= BLANK_OK);
            if (!G.short && tight) { if (!best || sum(x) > sum(best.x) || (sum(x) === sum(best.x) && dev(x) < dev(best.x))) best = { x, G }; }
            else if (!G.short) { if (!bestLoose || sum(x) > sum(bestLoose.x)) bestLoose = { x, G }; }
            else if (!bestShort || sum(x) > sum(bestShort.x)) bestShort = { x, G };
        }
        miss = any ? 0 : miss + 1;
    }
    if (!best) best = bestLoose;
    // (a short last row only where it holds more than the whole rows by a row or more)
    if (bestShort && (!best || sum(bestShort.x) >= sum(best.x) + A.C)) best = bestShort;
    const cells = best ? best.x : Object.fromEntries(c.ids.map((id) => [id, 2]));
    const rest = !withinShare(cells, w0, c.ids);
    const must = Number(input.mustBeat) || 0;
    const ladderNote = must && sum(cells) / P <= must
        ? `Mixed practice: with the skills in the proportions asked, this size holds ${Math.round(sum(cells) / P)} problems a page, no more than the next size up (${must}).` : '';
    const spare = best ? Math.max(0, ...best.G.pages.map((p) => p.spare || 0)) : 0;
    return { counts: cells, perPage: Math.round(sum(cells) / P), across: A.C, classes: c, fill: { counts: cells, rest }, ladderNote, spare };
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
    // (§1.7: a shelf of long procedures drawn by the kit - 2-digit x with its partial products -
    // takes what the other shelves leave: its room is working space, as on its own page)
    const workSh = shelves.filter((sh) => sh.items.length && sh.items.every((it) => it.anchor || kitWork(it)));
    const workExtra = !fillShares && workSh.length ? Math.max(0, spare - shelves.reduce((a, sh) => a + growOf(sh), 0)) / workSh.length : 0;
    for (const [i, sh] of shelves.entries()) {
        const grow = fillShares ? fillShares[i] : growOf(sh) + (workSh.includes(sh) ? workExtra : 0);
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
        const grid = gridPart(sh.items.map((it) => (it.anchor ? anchorPlanItem(it, Math.min(sh.k, 6)) : planItem(markWork(sh.k > 6 ? atColumns(it, sh.k) : it, ctx.size), { cols: sh.k }))), { cols: sh.k, rows: 1, cellH: sh.h + grow, labels, start });
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
