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

export const ROLE_ID = 'mixed-practice';
export const DEFAULT_LOOK = 'daily';
const AUTO_N = { ican: { S: 10, M: 8, L: 6 }, daily: { S: 8, M: 6, L: 4 } };

export const sources = (skills) => skills.map((s, i) => ({ id: `s${i}`, skills: [s], weight: Number(s.weight) > 0 ? Number(s.weight) : 1 }));
// 5: a shelf of an I Can page at S (N = 10) holds 5 cells, so they are measured at 5 too.
export const measureCols = () => [1, 2, 3, 4, 5, 6];

const divisorsDesc = (n) => Array.from({ length: n }, (_, i) => n - i).filter((d) => n % d === 0);

/**
 * A lesson packet's Mixed page (lessons r1): the lesson's step strip heads page 1
 * (`input.stepStrip`, `input.stepStripMm`), and `input.fill` shares the page's spare height into
 * the shelves up to 0.35 x a shelf's own height (a drawing centred in its cell keeps each empty band
 * under 30 %, H13) instead of a tenth - no blank band above the footer.
 */
const stripMmOf = (input) => (input.stepStrip && Number(input.stepStripMm) > 0 ? Number(input.stepStripMm) : 0);

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
    for (const id of ids) {
        const its = poolsIn[id];
        const a = A && A.byPool[id];
        const twins = a && A.mode === 'side' ? (a.side || []) : [];
        // SIDE: a shelf of [twin | problem] pairs needs an even count of cells the twins fit too.
        const pairK = twins.length ? divisorsDesc(N).find((d) => d <= 6 && d % 2 === 0 && fitsAt(its, d, ctx) && fitsAt(twins, d, ctx)) : 0;
        const k = pairK || divisorsDesc(N).find((d) => d <= 6 && fitsAt(its, Math.min(d, 6), ctx)) || 1;
        const h = Math.max(hMinAt(its, Math.min(k, 6), ctx), pairK ? hMinAt(twins, k, ctx) : 0);
        // The skill's anchor band (SECTIONS, or SIDE when no pair fits): measured by the host.
        const band = a && (A.mode === 'sections' || !pairK) && (a.band || []).length ? Math.max(0, ...a.band.map((x) => anchorHeightMm(x, 1))) : 0;
        shelf[id] = { k, h: Number.isFinite(h) ? h : 60, n: 0, pairs: !!pairK, band, per: pairK ? k / 2 : k };
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
    return { ctx, m, mCont, N, ids, shelf, used, pages: basePages };
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

/** The tallest cell at k: the layout's own minimum up to 6, the measured height above it. */
function hAtK(its, k, ctx) {
    if (k <= 6) return hMinAt(its, k, ctx);
    const hs = its.map((it) => it.measured && it.measured[k] && it.measured[k].hMm);
    return hs.every((h) => Number.isFinite(h)) ? Math.max(...hs) + 1 : Infinity;
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
/** The gap (mm) between the rules of neighbouring facts at k across: the cell less the widest fact. */
export function factRuleGapAt(items, k, tracks = 0) {
    const n = tracks || Math.max(2, ...items.map(factTracksOf));
    return 186 / k - Math.max(0, ...items.map((it) => factWidthMm(k, n, payloadOf(it).b)));
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
export function factFillAt(items, k, tracks = 0) {
    const n = tracks || Math.max(2, ...items.map(factTracksOf));
    return Math.max(0, ...items.map((it) => factWidthMm(k, n, payloadOf(it).b))) / (186 / k);
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
        const fill = (k) => factFillAt(all, k, n);
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
            const gapOk = cands.filter((x) => factRuleGapAt(all, x, n) >= FACT_RULE_GAP_MM - 1e-9);
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
    const f = factFillAt(all, k);
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
            cls = Object.assign({}, cls, { k: kHost, h, N: kHost, pick: Object.assign({}, cls.pick, { k: kHost, fill: factFillAt(all, kHost), digitPt: FACT_LADDER[kHost], note: fillNote(cls.pick.tracks, kHost, factFillAt(all, kHost), cls.pick.ladder, cls.pick.wide) }) });
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
        if (sh.items.length < k) {
            // A last shelf of fewer than k problems: its cells keep the width of k across, and the
            // places it does not use are plain paper - never an empty box (critic M1 r4, PT-ENG-7).
            // It sits under the band, outside its frame, so the frame ends with the last full shelf and
            // the open places are plain paper.
            const m2 = sh.items.length;
            cur.sections.push({ kind: 'row', widths: [`${m2}fr`, `${k - m2}fr`], parts: [
                gridPart(cells, { cols: m2, rows: 1, cellH: h, labels, start, cls: tabCls }),
                { kind: 'html', html: '' },
            ] });
        } else cur.band.contents.push(gridPart(cells, { cols: k, rows: 1, cellH: h, labels, start, cls: tabCls }));
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
            fits: [{ cols: k, rows: shelves.length, line: `Fits: ${shelves.length} shelves of ${k} on a ${p.N}-unit lattice, ${n} problems mixed, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }],
        },
    });
}

export function counts(pools, input) {
    if (input.arrangement === 'mixed') return Object.assign({}, mixedPacking(pools, input).deal.counts);
    const p = packing(pools, input);
    const out = {};
    for (const id of p.ids) out[id] = p.shelf[id].n * p.shelf[id].per;
    return out;
}

export function plan(input = {}) {
    const poolIds = [...new Set((input.items || []).map((it) => it.pool))];
    const pools = Object.fromEntries(poolIds.map((id) => [id, poolItems(input, id)]));
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
            const own = chunk.length ? hMinAt(chunk.filter((it) => !it.anchor), Math.min(sh.k, 6), ctx) : sh.h;
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
        let joins = !firstOfSkill && !!cur && cur.sections.some((x) => x.kind === 'band') && cur.used + bandH - m.strip <= budget;
        if (joins) bandH -= m.strip;
        if (!cur || cur.used + bandH > budget) {
            cur = { sections: pages.length === 0 && input.stepStrip ? [{ kind: 'html', html: input.stepStrip }] : [], used: 0 };
            pages.push(cur);
            joins = false;
            bandH = m.strip + sh.h + grow + (sh.anchor ? sh.bandMm : 0);
        }
        const first = sh.items.find((it) => !it.anchor);
        const skill = (input.skills || []).find((s) => first && first.q && s.skillId === first.q.skillId) || {};
        // `sectionLabel` on the skill ref (the detailed lesson maker, critic D17): the band's own name.
        const title = (first && first.q && first.q.sectionLabel) || STRAND_BY_CATEGORY[skill.categoryId] || skillWords(skill).strand || 'Practice';
        const pupil = sh.items.filter((it) => !it.anchor);
        const grid = gridPart(sh.items.map((it) => (it.anchor ? anchorPlanItem(it, Math.min(sh.k, 6)) : planItem(it, { cols: Math.min(sh.k, 6) }))), { cols: sh.k, rows: 1, cellH: sh.h + grow, labels, start });
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
        meta: { items: n, scoreOutOf: n, units: p.N, achieved, arrangement: 'sections',
            fits: [{ cols: p.N, rows: shelves.length, line: `Fits: ${shelves.length} shelves on a ${p.N}-unit lattice, ${n} problems, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, counts, plan, mixedClass, MIX_H_RATIO, factPick, factFillAt, FACT_FILL };
