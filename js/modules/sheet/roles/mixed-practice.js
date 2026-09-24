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
//
// SHUFFLED packing (2 x 2 blocks) is not built yet. Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, labelStyleOf, STRAND_BY_CATEGORY,
} from './compose.js';
import { skillWords } from './practice.js';

export const ROLE_ID = 'mixed-practice';
export const DEFAULT_LOOK = 'daily';
const AUTO_N = { ican: { S: 10, M: 8, L: 6 }, daily: { S: 8, M: 6, L: 4 } };

export const sources = (skills) => skills.map((s, i) => ({ id: `s${i}`, skills: [s], weight: Number(s.weight) > 0 ? Number(s.weight) : 1 }));
export const measureCols = () => [1, 2, 3, 4, 6];

const divisorsDesc = (n) => Array.from({ length: n }, (_, i) => n - i).filter((d) => n % d === 0);

/** Shelves: for each pool {id, k, h}, then how many shelves each gets. */
function packing(poolsIn, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: 1 });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const N = AUTO_N[ctx.look][ctx.size];
    const ids = Object.keys(poolsIn).filter((id) => (poolsIn[id] || []).length);
    const shelf = {};
    for (const id of ids) {
        const its = poolsIn[id];
        const k = divisorsDesc(N).find((d) => d <= 6 && fitsAt(its, Math.min(d, 6), ctx)) || 1;
        const h = hMinAt(its, Math.min(k, 6), ctx);
        shelf[id] = { k, h: Number.isFinite(h) ? h : 60, n: 0 };
    }
    const weights = Object.fromEntries((input.pools || []).map((p) => [p.id, p.weight || 1]));
    const bandH = (id) => m.strip + shelf[id].h;
    // Page 1: one shelf per skill first, then extra shelves by weight gap, while they fit.
    let used = 0;
    const order = [];
    for (const id of ids) { order.push(id); used += bandH(id); shelf[id].n = 1; }
    const total = () => ids.reduce((a, id) => a + shelf[id].n * shelf[id].k, 0);
    for (let guard = 0; guard < 40; guard++) {
        const tw = ids.reduce((a, id) => a + (weights[id] || 1), 0);
        const gaps = ids.map((id) => ({ id, gap: (weights[id] || 1) / tw - (shelf[id].n * shelf[id].k) / Math.max(1, total()) }))
            .sort((a, b) => b.gap - a.gap);
        const next = gaps.find((g) => used + bandH(g.id) <= m.budget);
        if (!next) break;
        shelf[next.id].n++;
        used += bandH(next.id);
    }
    return { ctx, m, mCont, N, ids, shelf, used };
}

export function counts(pools, input) {
    const p = packing(pools, input);
    const out = {};
    for (const id of p.ids) out[id] = p.shelf[id].n * p.shelf[id].k;
    return out;
}

export function plan(input = {}) {
    const poolIds = [...new Set((input.items || []).map((it) => it.pool))];
    const pools = Object.fromEntries(poolIds.map((id) => [id, poolItems(input, id)]));
    const p = packing(pools, input);
    const { ctx, m } = p;
    const labels = labelStyleOf(ctx.look, input.labels);
    // Lay the shelves out skill by skill (GROUPED), paginating whole shelves.
    const shelves = [];
    for (const id of p.ids) {
        const its = pools[id].slice(0, p.shelf[id].n * p.shelf[id].k);
        for (let s = 0; s < p.shelf[id].n; s++) {
            const chunk = its.slice(s * p.shelf[id].k, (s + 1) * p.shelf[id].k);
            if (chunk.length) shelves.push({ id, items: chunk, k: p.shelf[id].k, h: p.shelf[id].h });
        }
    }
    const n = shelves.reduce((a, s) => a + s.items.length, 0);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Mixed 1', title: 'Mixed practice', twoLine: true, score: n });
    const pages = [];
    let cur = null;
    let start = 1;
    const spare = Math.max(0, m.budget - p.used);
    const grow = shelves.length ? Math.min(12, spare / shelves.length) : 0;
    for (const [i, sh] of shelves.entries()) {
        const bandH = m.strip + sh.h + grow;
        const budget = pages.length ? p.mCont.budget : m.budget;
        if (!cur || cur.used + bandH > budget) { cur = { sections: [], used: 0 }; pages.push(cur); }
        const skill = (input.skills || []).find((s) => sh.items[0] && sh.items[0].q && s.skillId === sh.items[0].q.skillId) || {};
        const firstOfSkill = i === 0 || shelves[i - 1].id !== sh.id;
        const title = STRAND_BY_CATEGORY[skill.categoryId] || skillWords(skill).strand || 'Practice';
        cur.sections.push({
            kind: 'band', label: firstOfSkill ? title : '', instr: firstOfSkill ? instructionText(instructionKeyOf(sh.items, input.skills)) : '',
            content: gridPart(sh.items.map((it) => planItem(it, { cols: Math.min(sh.k, 6) })), { cols: sh.k, rows: 1, cellH: sh.h + grow, labels, start }),
        });
        start += sh.items.length;
        cur.used += bandH;
    }
    const achieved = {};
    for (const sh of shelves) achieved[sh.id] = (achieved[sh.id] || 0) + sh.items.length;
    return assemble(ROLE_ID, input, frame, pages.map((pg) => ({ sections: pg.sections })), {
        defaultLook: DEFAULT_LOOK,
        meta: { items: n, scoreOutOf: n, units: p.N, achieved,
            fits: [{ cols: p.N, rows: shelves.length, line: `Fits: ${shelves.length} shelves on a ${p.N}-unit lattice, ${n} problems, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, counts, plan };
