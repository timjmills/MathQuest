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

const latticeOf = (input, ctx) => ([4, 6, 8, 10].includes(Number(input.latticeN)) ? Number(input.latticeN) : AUTO_N[ctx.look][ctx.size]);

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
    const per = ids.map((id) => {
        const its = poolsIn[id];
        const k = divisorsDesc(N).find((d) => d <= 6 && fitsAt(its, d, ctx)) || 1;
        const h = hMinAt(its, k, ctx);
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
    return { ok: true, k: ks[0], h: hMax, N, per, why: '' };
}

/** The mixed page's capacity: shelves of k under one "Solve." strip, counts dealt by weight. */
function mixedPacking(poolsIn, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: 1 });
    const m0 = bandMetrics(ctx, layoutHeader(frame.header));
    const m = Object.assign({}, m0, { budget: m0.budget - stripMmOf(input) });
    const cls = mixedClass(poolsIn, input);
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    const maxShelves = { S: 9, M: 7, L: 5 }[ctx.size] || 5;
    const shelves = Math.max(1, Math.min(maxShelves, Math.floor((m.budget - m.strip) / cls.h)));
    const total = shelves * cls.k;
    const weights = Object.fromEntries((input.pools || []).filter((p) => ids.includes(p.id)).map((p) => [p.id, p.weight || 1]));
    for (const id of ids) if (!(id in weights)) weights[id] = 1;
    const deal = dealCounts(weights, total, { min: 2 });
    return { ctx, m, cls, ids, shelves, total, weights, deal, N: cls.N };
}

function planMixed(input, pools) {
    const p = mixedPacking(pools, input);
    const { ctx, m, cls } = p;
    const k = cls.k;
    const labels = labelStyleOf(ctx.look, input.labels);
    const names = Object.fromEntries(p.ids.map((id) => [id, { name: poolName(input, pools[id]) }]));
    const items = p.ids.flatMap((id) => pools[id].map((it) => ({ key: id, it })));
    const mix = interleave(items, p.weights, deriveSeed('mixed-practice', input.seed || 0), { labels: names });
    const queue = mix.order.map((e) => e.it);
    const shelves = [];
    for (let s = 0; s < queue.length; s += k) {
        const chunk = queue.slice(s, s + k);
        const own = hMinAt(chunk, k, ctx);
        const h = Number.isFinite(own) && own > 0 ? Math.min(cls.h, own) : cls.h;
        // H13: the shortest skill's cells on the shelf keep its drawing at least 70 % of the
        // shelf's height, so the spare height shared in below never opens a 30 % empty band.
        const short = Math.min(...[...new Set(chunk.map((it) => it.pool))].map((id) => hMinAt(chunk.filter((it) => it.pool === id), k, ctx)).filter((x) => Number.isFinite(x) && x > 0), h);
        shelves.push({ items: chunk, h, room: Math.max(0, short / 0.7 - h) });
    }
    const n = queue.length;
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: n });
    const instr = instructionText('default-solve');
    const pages = [];
    let cur = null;
    let start = 1;
    const used = m.strip + shelves.reduce((a, sh) => a + sh.h, 0);
    const spare = Math.max(0, m.budget - used);
    const grow = (sh) => (shelves.length ? Math.max(0, Math.min(12, sh.h * 0.1, sh.room, spare / shelves.length)) : 0);
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
        cur.band.contents.push(gridPart(sh.items.map((it) => planItem(it, { cols: Math.min(k, 6) })), { cols: k, rows: 1, cellH: h, labels, start }));
        start += sh.items.length;
        cur.used += h;
    }
    const achieved = {};
    for (const it of queue) achieved[it.pool] = (achieved[it.pool] || 0) + 1;
    const notes = [...new Set([...p.deal.notes, ...mix.notes])];
    return assemble(ROLE_ID, input, frame, pages.map((pg) => ({ sections: pg.sections })), {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: n, scoreOutOf: n, units: p.N, achieved, arrangement: 'mixed', notes,
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

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, counts, plan, mixedClass, MIX_H_RATIO };
