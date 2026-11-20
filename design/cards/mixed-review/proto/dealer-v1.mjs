// design/cards/mixed-review/proto/dealer-v1.mjs
// MIXED REVIEW, DEALER V1: the card's executable specification (design/cards/mixed-review/mixed-review.md §2, §3, §7a).
//
// Pure ES module: no DOM, no window, no Math.random, no clock, no app state. Node and the browser read it alike.
// The product dealer is THIS FILE moved, unchanged, to js/modules/mixed-review.js (card §9b step 2); the V1 share code
// freezes it by its sha256 (fixtures/frozen.json). Any change to what it deals ships as V2, and this file stays for V1 codes.
//
// What it decides, and what it never does:
//   - the pool (filters), the skills dealt, each skill's count, the page split, the shelves, the item order and numbering,
//     each item's seed, the N = 5 2-up sheet and the Mon-Fri week;
//   - it NEVER measures a page. The page split comes from the FROZEN table CAP (size x footprint class) below, so the
//     same code gives the same pages, shelves and numbers on every device and in every release of V1. The layout engine
//     draws the plan; when a drawn page cannot hold its dealt cells it spills whole shelves to a continuation page and
//     KEEPS the numbering, never re-deals (card §3, MIX-REVIEW-COUNT).
//   - item content: item i's try r is generateQuestionFor({category, skill, opts, seed: deriveSeed('mixed-review', S, day,
//     i, r)}); this file gives the r = 0 seed. The duplicate ladder (RETRIES, rungs) runs in the product's
//     dealReviewItems(req) around this plan (card §7a "Identical").
//
// Reuses the real kit logic by import (both pure, SCC-01): dealCounts / interleave (js/modules/sheet/interleave.js) and
// rng / shuffle / deriveSeed (js/modules/sheet/rng.js).
//
// Input  {pool: [{id, code, grade, area, fc: 'compact'|'typical'|'wide', placement?: [grades], passed?: bool}],
//         filters?: {grades?, areas?, onlyPassed?, untick?}, N, seed, order?: 'mixed'|'easyhard'|'area',
//         size?: 'm'|'l' ('s' reads as m), week?: Y (a Mon-Fri set), day?: K (1-5, one day of the week),
//         adapt?: {id: w} (screen only; samples the `listed` skills), listed?: [code] (the code's skills),
//         replay?: bool (the pool is the code's list in code order: no shuffle)}
// Output deal(): {v, N, size, order, seed, day, pages: [{n, cap, cls, arrangement, skills, shelves: [{skill, items}],
//         rows}], items: [{n, skill, code, seed, page}], twoUp, halves?} or {v, error}
//        week(): {v, Y, seed, days: [deal() of each day, with .day = 1..5]}
//        encode(input, out) -> '?c=<skills>|<tokens>'; decode(code) -> tokens; replayInput(decoded, registry) -> input
//
// `_mutate` (the second argument) is a TEST SEAM for check-v1.mjs's FAIL fixtures only: each flag breaks one rule on
// purpose. No host passes it.

import { dealCounts, interleave } from '../../../../js/modules/sheet/interleave.js';
import { rng, shuffle, deriveSeed } from '../../../../js/modules/sheet/rng.js';

export const VERSION = 1;
export const COUNTS = Object.freeze([5, 10, 15, 20, 25, 30]);
/** Problems a page by size and footprint class (WORKSHEET_DESIGN_STANDARD 12.1: Review 12 / 8-12, wide-visual rows 4 / 3). */
export const CAP = Object.freeze({ m: Object.freeze({ compact: 12, typical: 12, wide: 4 }), l: Object.freeze({ compact: 10, typical: 8, wide: 3 }) });
/** Cells a shelf by size and class (a divisor of the Auto lattice: 6 at M, 4 at L). A skill's last shelf may be short. */
export const SHELF = Object.freeze({ m: Object.freeze({ compact: 3, typical: 3, wide: 1 }), l: Object.freeze({ compact: 4, typical: 2, wide: 1 }) });
/** Shelves a page at most (12.1 Mixed practice: 7 at M, 5 at L). */
export const SHELF_MAX = Object.freeze({ m: 7, l: 5 });
/** Distinct skills a page at most (12.1 Review: 2-3 instruction-led sections). */
export const MAX_SKILLS_PAGE = 3;
export const AREA_ORDER = Object.freeze(['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS', 'MIXED', 'WORDS', 'NOSTD']);
const GRADE_RANK = { K: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, M: 7 };
const groupOf = (s) => (s.fc === 'wide' ? 'wide' : 'flat');
const clampS = (n, max = MAX_SKILLS_PAGE) => Math.max(1, Math.min(max, Math.floor(n / 2)));

/** The page split of R items at capacity C: ceil(R / ceil(R / C)), largest page first (the rebalanced last page). */
export function pageSize(R, C) { const P = Math.ceil(R / C); return Math.ceil(R / P); }

/** The size table: pages (their n_p) for every N, size and class of a one-class pool (card §3 is generated from it). */
export function capacityTable(cap = CAP) {
    const out = {};
    for (const size of ['m', 'l']) for (const cls of ['compact', 'typical', 'wide']) for (const N of COUNTS) {
        const pages = []; let R = N;
        while (R > 0) { const n = pageSize(R, cap[size][cls]); pages.push(n); R -= n; }
        out[`${size}:${cls}:${N}`] = { pages, twoUp: N === 5 && pages.length === 1 && cap[size][cls] / 2 >= 5 };
    }
    return out;
}

/** The pool after the teacher's filters. MIXED and NOSTD areas never enter it (card §7a). */
export function filterPool(pool, f = {}) {
    const grades = f.grades && f.grades.length ? new Set(f.grades.map(String)) : null;
    const areas = f.areas && f.areas.length ? new Set(f.areas) : null;
    const untick = new Set(f.untick || []);
    return (pool || []).filter((s) => {
        if (s.area === 'MIXED' || s.area === 'NOSTD') return false;
        const pl = (s.placement && s.placement.length ? s.placement : [s.grade]).map(String);
        if (grades && !(pl.some((g) => grades.has(g)) || (s.grade === 'M' && !(s.placement && s.placement.length)))) return false;
        if (areas && !areas.has(s.area)) return false;
        if (f.onlyPassed && !s.passed) return false;
        return !untick.has(s.id);
    });
}

const normSize = (z) => (String(z || 'l').toLowerCase() === 'l' ? 'l' : 'm');
const sortKeyCmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

/** Weighted seeded permutation (Efraimidis-Spirakis keys u^(1/w)); w only orders the sample, it never reaches a count. */
function weightedOrder(list, weights, seed) {
    const r = rng(seed);
    return list.map((s, i) => ({ s, i, k: Math.pow(r() || 1e-9, 1 / Math.max(1, Number(weights[s.id]) || 1)) }))
        .sort((a, b) => b.k - a.k || a.i - b.i).map((x) => x.s);
}

/** The preference cycle: the seeded order of the eligible pool (replay: the code's order; adapt: weighted by w). */
function cycleOf(input, eligible, mut) {
    if (input.replay) return eligible.slice();
    const cseed = deriveSeed('mixed-review-cycle', input.seed);
    if (input.adapt) return weightedOrder(eligible, input.adapt, cseed);
    return shuffle(rng(cseed), eligible);
}

/** One sheet. `ws` is the week state (seen, prevDay, uses, appear, comeback) or null for a single sheet. */
function dealSheet(input, cycle, day, ws, mut) {
    const N = input.N;
    const CAPT = mut.cap || CAP;
    const size = normSize(input.size);
    const order = input.order || 'mixed';
    const half = Math.ceil(input.N / 2);
    const pos = new Map(cycle.map((s, i) => [s.id, i]));
    const total = new Map(); const pagesUsed = new Map();
    const appear = ws ? ws.appear : new Map();
    const seen = ws ? ws.seen : new Set();
    const prev = ws ? ws.prevDay : new Set();
    const uses = ws ? ws.uses : new Map();
    const room = (s) => (mut.noCeil ? Infinity : half - (total.get(s.id) || 0));
    const fresh = (s) => !(mut.noFresh && ws) && !pagesUsed.has(s.id) && !seen.has(s.id);
    const p0 = (s) => (appear.has(s.id) ? appear.get(s.id) : 1e6 + pos.get(s.id));
    // The choice order: fresh first, then not on yesterday's sheet, then least used on this sheet, then least used this
    // week, then first appearance (a dealt skill) or cycle position (a fresh one). Mutations: noFresh = take the cycle from
    // the top every day; allowConsecutive = ignore yesterday and the week's uses.
    const key = (s) => (mut.noFresh && ws ? [pagesUsed.get(s.id) || 0, p0(s)]
        : [fresh(s) ? 0 : 1, (prev.has(s.id) && !mut.allowConsecutive) ? 1 : 0, pagesUsed.get(s.id) || 0, mut.allowConsecutive ? 0 : (uses.get(s.id) || 0), p0(s)]);
    const maxS = mut.maxSkills4 ? 4 : MAX_SKILLS_PAGE;
    let forced = ws && ws.comeback ? cycle.find((s) => s.id === ws.comeback) || null : null;
    // fill: each item is 1 / CAP[size][its class] of a page, so wide and flat items can share a page while the sum is <= 1.
    const fillOf = (pg) => pg.chosen.reduce((a, s) => a + pg.counts[s.id] / CAPT[size][s.fc], 0);
    const shelvesOf = (pg) => pg.chosen.reduce((a, s) => a + Math.ceil(pg.counts[s.id] / SHELF[size][s.fc]), 0);
    const pages = []; let R = mut.ignoreN ? Infinity : N;
    for (let guard = 0; R > 0 && guard < 200; guard++) {
        let cands = cycle.filter((s) => room(s) > 0).sort((a, b) => sortKeyCmp(key(a), key(b)));
        if (forced) cands = [forced, ...cands.filter((s) => s !== forced)];
        if (!cands.length) break;
        const first = cands[0]; const G = groupOf(first);
        const anyFresh = cands.some(fresh);
        const allowed = cands.filter((s) => groupOf(s) === G && (s === forced || !anyFresh || fresh(s)));
        let C = CAPT[size][first.fc];
        const Rr = mut.ignoreN ? C : R;
        let n = mut.ignoreN ? C : pageSize(Rr, C);
        let chosen = allowed.slice(0, Math.min(clampS(n, maxS), allowed.length));
        const C2 = Math.min(...chosen.map((s) => CAPT[size][s.fc]));
        if (C2 < C) { C = C2; n = mut.ignoreN ? C : pageSize(Rr, C); chosen = chosen.slice(0, Math.min(chosen.length, clampS(n, maxS))); }
        for (let k = 0; k < 4; k++) {
            const rs = chosen.reduce((a, s) => a + room(s), 0);
            if (n > rs) n = rs;
            const s2 = Math.min(chosen.length, clampS(n, maxS));
            if (s2 < chosen.length) chosen = chosen.slice(0, s2); else break;
        }
        // The even split: dealCounts (equal weights, min 2) over the page's skills, the lowest sheet totals first.
        const bySplit = chosen.map((s, i) => ({ s, i })).sort((a, b) => (total.get(a.s.id) || 0) - (total.get(b.s.id) || 0) || a.i - b.i).map((x) => x.s);
        const w = Object.fromEntries(bySplit.map((s) => [s.id, mut.adaptCounts && input.adapt ? (Number(input.adapt[s.id]) || 1) : 1]));
        const counts = dealCounts(w, n, { min: 2 }).counts;
        for (const s of bySplit) {                       // a count over its skill's room moves to the skill with most room
            let over = counts[s.id] - room(s);
            while (over > 0) {
                const to = bySplit.filter((t) => t !== s && room(t) - counts[t.id] > 0).sort((a, b) => (room(b) - counts[b.id]) - (room(a) - counts[a.id]))[0];
                if (!to) break;
                counts[s.id]--; counts[to.id]++; over--;
            }
        }
        // THE FILL TOP-UP (lead ruling 2026-11-20): a page that would be under half full while items remain beyond it takes
        // more skills of EITHER class (wide or flat) by fill, in the choice order (fresh first), each up to its room, the
        // page's free fill and the shelf ceiling, until the page is at least half full or nothing fits. At most 3 skills.
        const topUp = [];
        if (!mut.separatePages && !mut.ignoreN) {
            const pg = { chosen: chosen.slice(), counts };
            for (let k = 0; k < 6 && fillOf(pg) * 2 < 1 && R - n > 0 && pg.chosen.length < maxS; k++) {
                let more = cycle.filter((t) => !pg.chosen.includes(t) && room(t) > 0).sort((a, b) => sortKeyCmp(key(a), key(b)));
                if (more.some(fresh)) more = more.filter(fresh);
                const t = more[0];
                if (!t) break;
                let c = Math.min(room(t), R - n, Math.floor((1 - fillOf(pg)) * CAPT[size][t.fc] + 1e-9));
                while (c > 0) { pg.counts[t.id] = c; pg.chosen.push(t); if (shelvesOf(pg) <= SHELF_MAX[size]) break; pg.chosen.pop(); delete pg.counts[t.id]; c--; }
                if (c < 1) break;
                if (c < 2 && SHELF[size][t.fc] > 1 && R - n - c > 0) { pg.chosen.pop(); delete pg.counts[t.id]; break; }   // one item of a skill only as a wide shelf of 1
                topUp.push(t.id); n += c;
            }
            chosen = pg.chosen;
            if (topUp.length) C = Math.min(...chosen.filter((s) => s.fc !== 'wide').map((s) => CAPT[size][s.fc]), C);
        }
        for (const s of chosen) {
            total.set(s.id, (total.get(s.id) || 0) + counts[s.id]);
            pagesUsed.set(s.id, (pagesUsed.get(s.id) || 0) + 1);
            if (!appear.has(s.id)) appear.set(s.id, appear.size);
        }
        pages.push({ n, cap: C, cls: [...new Set(chosen.map((s) => s.fc))], skills: chosen.map((s) => s.id), counts, chosen, topUp });
        forced = null;
        R -= n;
        if (mut.ignoreN && pages.length >= Math.ceil(input.N / C)) break;
    }
    // THE TAIL MERGE: a last page under half full joins the latest earlier page it fits beside: the two pages' fill (each item
    // 1 / CAP[size][its class], so a wide item at M is a quarter page) is at most one page, with at most 3 skills and the
    // shelf ceiling kept. Counts never change; only the page split does. A page may then hold wide and flat skills together.
    while (!mut.noTailMerge && pages.length > 1) {
        const L = pages[pages.length - 1];
        if (fillOf(L) * 2 >= 1) break;
        let e = -1;
        for (let i = pages.length - 2; i >= 0; i--) {
            const E = pages[i];
            const ids = new Set([...E.skills, ...L.skills]);
            const both = { chosen: [...E.chosen, ...L.chosen.filter((s) => !E.skills.includes(s.id))], counts: { ...E.counts } };
            for (const s of L.chosen) both.counts[s.id] = (both.counts[s.id] || 0) + L.counts[s.id];
            if (ids.size <= MAX_SKILLS_PAGE && fillOf(both) <= 1 + 1e-9 && shelvesOf(both) <= SHELF_MAX[size]) { e = i; break; }
        }
        if (e < 0) break;
        const E = pages[e];
        for (const s of L.chosen) {
            if (E.counts[s.id] === undefined) { E.chosen.push(s); E.skills.push(s.id); E.counts[s.id] = 0; }
            E.counts[s.id] += L.counts[s.id];
        }
        E.n += L.n; E.cls = [...new Set([...E.cls, ...L.cls])];
        E.cap = Math.min(...E.cls.map((c) => CAPT[size][c]).filter((c, _, arr) => E.cls.length === 1 || c > CAPT[size].wide)) || E.cap;
        pages.pop();
    }
    for (const pg of pages) pg.fill = fillOf(pg);
    // Shelves, order and numbering. Item seeds: deriveSeed('mixed-review', S, day, i) (try r = 0).
    const items = []; let num = 0;
    const out = pages.map((pg, p) => {
        const kOf = (s) => SHELF[size][s.fc];
        const sortBy = order === 'easyhard' ? (s) => [GRADE_RANK[s.grade] ?? 9, p0(s)]
            : order === 'area' ? (s) => [AREA_ORDER.indexOf(s.area), GRADE_RANK[s.grade] ?? 9, p0(s)] : null;
        const sk = sortBy ? pg.chosen.slice().sort((a, b) => sortKeyCmp(sortBy(a), sortBy(b))) : pg.chosen;
        const oneClass = pg.cls.length === 1 && sk.length > 1;
        const pseed = deriveSeed('mixed-review-page', input.seed, day, p);
        let arrangement; let seq;            // seq: the page's turns in print order, each {key, size, skill}
        if (order === 'mixed' && oneClass && !mut.noShelfOrder) {
            arrangement = 'm1';               // the M1 mixed arrangement: items interleaved, rows of k cells
            const its = sk.flatMap((s) => Array.from({ length: pg.counts[s.id] }, () => ({ key: s.id })));
            seq = interleave(its, null, pseed, { maxRun: 1, firstThird: false }).order.map((t) => ({ key: t.key, size: 1 }));
        } else {
            arrangement = 'grouped';          // GROUPED shelves of one skill; a skill's last shelf may be short (H13)
            const shelves = sk.flatMap((s) => { const k = kOf(s); const c = pg.counts[s.id]; const out2 = []; for (let i = 0; i < c; i += k) out2.push({ key: s.id, size: Math.min(k, c - i) }); return mut.shortFirst ? out2.reverse() : out2; });
            seq = order === 'mixed' && !mut.noShelfOrder ? interleave(shelves, null, pseed, { maxRun: 1, firstThird: false }).order : shelves;
        }
        const cellsOf = (t) => Array.from({ length: t.size }, () => { const i = num++; const s = pg.chosen.find((c) => c.id === t.key); const it = { n: i + 1, skill: s.id, code: s.code, seed: deriveSeed('mixed-review', input.seed, day, i), page: p + 1 }; items.push(it); return it.n; });
        const shelves = seq.map((t) => ({ skill: t.key, items: cellsOf(t) }));
        const k1 = arrangement === 'm1' ? SHELF[size][pg.cls[0]] : null;
        const rows = arrangement === 'm1' ? Math.ceil(pg.n / k1) : shelves.length;
        return { n: pg.n, cap: pg.cap, topUp: pg.topUp || [], fill: Math.round(pg.fill * 1e4) / 1e4, cls: pg.cls, arrangement, skills: sk.map((s) => s.id), shelves, rows };
    });
    const twoUp = !mut.noTwoUp && input.N === 5 && out.length === 1 && pages[0].fill <= 0.5 + 1e-9;   // the 5 fit a half page
    // `dealt`: the skills in the order the deal first PICKED them (not print order). The code lists them in this order, so a
    // replay's cycle is the pick order and re-deals the same pages.
    const dealt = [...appear.keys()];
    const res = { v: VERSION, N: input.N, size, order, seed: input.seed, day, dealt, pages: out, items, twoUp };
    if (twoUp) res.halves = [items.map((it) => it.n), items.map((it) => it.n)];
    return res;
}

let _calls = 0;
/** One sheet (or, with `day`, that day of the week `week`). */
export function deal(input, _mutate = {}) {
    if (input.week && input.day) { const w = week(input, _mutate); return w.error ? w : w.days[input.day - 1]; }
    const eligible = eligibleOf(input, _mutate);
    if (eligible.error) return { v: VERSION, error: eligible.error };
    const seed = _mutate.clockSeed ? input.seed + (++_calls) : input.seed;
    return dealSheet({ ...input, seed }, cycleOf({ ...input, seed }, eligible, _mutate), 0, null, _mutate);
}

function eligibleOf(input, mut) {
    let el = input.replay ? (input.pool || []).slice() : filterPool(input.pool, input.filters);
    if (input.adapt && input.listed && !mut.adaptFullPool) { const L = new Set(input.listed); el = el.filter((s) => L.has(s.code)); }
    if (el.length < 2) return { error: el.length ? 'The pool holds one skill: a mixed review needs at least 2.' : 'No skill matches these filters.' };
    if (!COUNTS.includes(input.N)) return { error: `N must be one of ${COUNTS.join(', ')}.` };
    return el;
}

/** The Mon-Fri week: five sheets of N; day d seed deriveSeed('mixed-review-week', S, d); fresh skills before any repeat
 *  but the comeback; from Wednesday the comeback is the first skill of day d-2 that is not on day d-1. */
export function week(input, _mutate = {}) {
    const eligible = eligibleOf(input, _mutate);
    if (eligible.error) return { v: VERSION, error: eligible.error };
    const cycle = cycleOf(input, eligible, _mutate);
    const ws = { seen: new Set(), prevDay: new Set(), uses: new Map(), appear: new Map(), comeback: null };
    const days = []; const sets = [];
    for (let d = 1; d <= 5; d++) {
        ws.comeback = null;
        if (d >= 3 && !_mutate.noComeback) ws.comeback = sets[d - 3].find((id) => !sets[d - 2].includes(id)) || null;
        const dseed = _mutate.oneSeed ? input.seed : deriveSeed('mixed-review-week', input.seed, d);
        const sh = dealSheet({ ...input, seed: dseed }, cycle, d, ws, _mutate);
        sh.day = d; sh.daySeed = dseed; sh.comeback = ws.comeback;
        const set = [...new Set(sh.items.map((it) => it.skill))];
        set.forEach((id) => { ws.seen.add(id); ws.uses.set(id, (ws.uses.get(id) || 0) + 1); });
        ws.prevDay = new Set(set);
        sets.push(set); days.push(sh);
    }
    return { v: VERSION, Y: input.week, seed: input.seed, dealt: [...ws.appear.keys()], days };
}

/* ------------------------------------------------------------------------------------------------ the share code */
// ?c=<skills>|<tokens>. Skills: the DEALT list in pick order (`dealt`), each `<2-char code><count>` (a week: the week
// totals). Tokens (appended to the enhanced skill code's settings segment; taken letters T N G R D A Q H W F X stay as
// they are): V1 · N<n> · S<base36 seed> · O<e|a> (absent = mixed) · Y<week> · K<1-5> · P1 (adapt) · Z<m|l> (size).

export function encode(input, out, _mutate = {}) {
    const its = out.days ? out.days.flatMap((d) => d.items) : out.items;
    const codeOf = new Map(its.map((it) => [it.skill, it.code]));
    const cnt = new Map(); for (const it of its) cnt.set(it.code, (cnt.get(it.code) || 0) + 1);
    const skills = out.dealt.map((id) => `${codeOf.get(id)}${cnt.get(codeOf.get(id))}`).join('-');
    const t = ['V1', `N${input.N}`];
    if (!_mutate.dropSeedToken) t.push(`S${(input.seed >>> 0).toString(36).toUpperCase()}`);
    if (input.order === 'easyhard') t.push('Oe'); else if (input.order === 'area') t.push('Oa');
    if (input.week) t.push(`Y${input.week}`);
    if (input.day) t.push(`K${input.day}`);
    if (input.adapt) t.push('P1');
    if (!_mutate.dropSizeToken) t.push(`Z${normSize(input.size)}`);
    return `?c=${skills}|${t.join('-')}`;
}

export function decode(code) {
    const m = /^\?c=([^|]*)\|(.*)$/.exec(String(code));
    if (!m) return { error: 'not a skill code' };
    const skills = m[1].split('-').filter(Boolean).map((p) => ({ code: p.slice(0, 2), count: Number(p.slice(2) || 1) }));
    const d = { skills, N: null, seed: 1, order: 'mixed', week: null, day: null, adapt: false, size: null, v: null };
    for (const tok of m[2].split('-')) {
        const k = tok[0]; const v = tok.slice(1);
        if (k === 'V') d.v = Number(v);
        else if (k === 'N') d.N = Number(v);
        else if (k === 'S') d.seed = parseInt(v, 36);
        else if (k === 'O') d.order = v === 'e' ? 'easyhard' : v === 'a' ? 'area' : 'mixed';
        else if (k === 'Y') d.week = Number(v);
        else if (k === 'K') d.day = Number(v);
        else if (k === 'P') d.adapt = v === '1';
        else if (k === 'Z') d.size = normSize(v);
    }
    if (d.v === 1 && !d.size) d.error = 'a V1 code has no Z size token';
    return d;
}

/** The input a decoded code replays: the listed skills, in code order, from the app's skill registry. */
export function replayInput(dec, registry) {
    const byCode = new Map(registry.map((s) => [s.code, s]));
    return { pool: dec.skills.map((x) => byCode.get(x.code)).filter(Boolean), N: dec.N, seed: dec.seed, order: dec.order, size: dec.size, week: dec.week, day: dec.day, replay: true };
}
