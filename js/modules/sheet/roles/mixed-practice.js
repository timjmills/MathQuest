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
// SHUFFLED packing (2 x 2 blocks) is not built yet. Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, labelStyleOf, STRAND_BY_CATEGORY,
} from './compose.js';
import { skillWords } from './practice.js';
import { anchorPlanItem, anchorHeightMm } from '../anchors.js';

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
    return { ctx, m, mCont, N, ids, shelf, used, pages: basePages };
}

export function counts(pools, input) {
    const p = packing(pools, input);
    const out = {};
    for (const id of p.ids) out[id] = p.shelf[id].n * p.shelf[id].per;
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
    const spare = p.pages > 1 ? 0 : Math.max(0, m.budget - used);
    // The spare height is shared into the shelves only as far as a cell keeps its drawing filling
    // it (H13: never an empty band of 30% of a cell): a tenth of a shelf's own height at most.
    const growOf = (sh) => (shelves.length ? Math.min(12, sh.h * 0.1, spare / shelves.length) : 0);
    for (const [i, sh] of shelves.entries()) {
        const grow = growOf(sh);
        const firstOfSkill = i === 0 || shelves[i - 1].id !== sh.id;
        const budget = pages.length > 1 ? p.mCont.budget : m.budget;   // the page `cur` is on
        let bandH = m.strip + sh.h + grow + (sh.anchor ? sh.bandMm : 0);
        let joins = !firstOfSkill && !!cur && cur.sections.length > 0 && cur.used + bandH - m.strip <= budget;
        if (joins) bandH -= m.strip;
        if (!cur || cur.used + bandH > budget) { cur = { sections: [], used: 0 }; pages.push(cur); joins = false; bandH = m.strip + sh.h + grow + (sh.anchor ? sh.bandMm : 0); }
        const first = sh.items.find((it) => !it.anchor);
        const skill = (input.skills || []).find((s) => first && first.q && s.skillId === first.q.skillId) || {};
        const title = STRAND_BY_CATEGORY[skill.categoryId] || skillWords(skill).strand || 'Practice';
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
    const achieved = {};
    for (const sh of shelves) achieved[sh.id] = (achieved[sh.id] || 0) + sh.items.filter((it) => !it.anchor).length;
    return assemble(ROLE_ID, input, frame, pages.map((pg) => ({ sections: pg.sections })), {
        defaultLook: DEFAULT_LOOK,
        meta: { items: n, scoreOutOf: n, units: p.N, achieved,
            fits: [{ cols: p.N, rows: shelves.length, line: `Fits: ${shelves.length} shelves on a ${p.N}-unit lattice, ${n} problems, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, counts, plan };
