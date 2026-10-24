// teacher-plan.js — the worksheet arithmetic of the Teacher site 2.0 (lane S2, T3b).
//
// ONE place for "How often" and "How many pages", read by the Worksheet / Quiz sheets (teacher-sheet.js),
// the tray (T3a) and the summary line, so the counts the summary states are the counts the preview and
// the printed page carry. A port of plan() / alloc() / roundTree() in the signed mock-up
// design/mockups/teacher-2/app.js (fix round r6), on the app's own items:
//
//   item = { categoryId, skillId, weight?, lockPct?, leftOut? }   (the UnifiedSkills entries carry these)
//     weight   a positive number; missing, 0 or 1 = the default 1 (share codes write 0 for "no weight given",
//              skill-codes.js, so 0 is NEVER "left out")
//     leftOut  true = left out for now (still in the set, gets no problem)
//     lockPct  a held percentage for that skill (0–100); the unheld skills share what is left by weight
//
// Area and grade locks ('a:OA', 'g:OA|3') can be passed as opts.locks; skill locks may also be passed
// there as 'k:<categoryId>:<skillId>'. Locks over 100 % are refused ({error}).
//
// Counts are whole numbers by largest remainder, rounded area → grade → skill, so an area or skill held at
// 40 % gets its 40 % (± 1) and not the sum of rounded-down shares. Ties are broken by the seed, so
// "New numbers" can re-deal a sample. Every non-zero-weight item gets at least 1 when the total allows.
//
// Pure: no DOM, no window state; the area comes from areaOf (teacher-areas.js) and the grade from
// getSkillGrade (data.js) unless the item carries `area` / `grade` itself.

import { areaOf, AREA_ORDER } from './teacher-areas.js';
import { getSkillGrade } from './data.js';

/** Problems per page at each size (the mock-up's PER_PAGE; the kit's capacity tables agree at 12 / 8 / 6). */
export const PER_PAGE = { S: 12, M: 8, L: 6 };
const GRADE_ORDER = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const MAX_PAGES = 30;

export const keyOf = (it) => `${it.categoryId}:${it.skillId}`;
export const weightOf = (it) => {
    if (!it || it.leftOut === true) return 0;
    const w = Number(it.weight);
    return w > 0 ? w : 1;
};
function areaKey(it) {
    if (it.area) return it.area;
    try { return areaOf(it.categoryId, it.skillId) || 'NOSTD'; } catch (e) { return 'NOSTD'; }
}
function gradeKey(it) {
    if (it.grade !== undefined && it.grade !== null) return String(it.grade);
    try { const g = getSkillGrade(it.skillId, it.categoryId); return g === null || g === undefined ? 'M' : String(g); } catch (e) { return 'M'; }
}
function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(seed) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }

/** The locks in force: opts.locks plus each item's lockPct, keyed 'a:AREA' | 'g:AREA|GRADE' | 'k:cat:skill'. */
function collectLocks(items, opts) {
    const locks = Object.assign({}, (opts && opts.locks) || {});
    for (const it of items) {
        if (typeof it.lockPct === 'number' && isFinite(it.lockPct) && weightOf(it) > 0) locks['k:' + keyOf(it)] = Math.max(0, Math.min(100, it.lockPct));
    }
    return locks;
}

/** The exact percentage share of each active key (the mock-up's alloc), plus any refusals. */
function shares(act, info, locks) {
    const out = {}, errs = [];
    const alloc = (keys, pct, depth) => {
        const fixed = []; let rest = keys.slice();
        const take = (pred) => { const t = rest.filter(pred); rest = rest.filter((k) => !pred(k)); return t; };
        if (depth < 1) for (const a of [...new Set(rest.map((k) => info[k].a))]) if (locks['a:' + a] !== undefined) fixed.push({ sk: take((k) => info[k].a === a), pct: locks['a:' + a], d: 1, key: 'a:' + a });
        if (depth < 2) for (const g of [...new Set(rest.map((k) => info[k].a + '|' + info[k].g))]) if (locks['g:' + g] !== undefined) fixed.push({ sk: take((k) => info[k].a + '|' + info[k].g === g), pct: locks['g:' + g], d: 2, key: 'g:' + g });
        for (const k of rest.slice()) if (locks['k:' + k] !== undefined) fixed.push({ sk: take((x) => x === k), pct: locks['k:' + k], d: 3, key: 'k:' + k });
        const used = fixed.reduce((t, f) => t + f.pct, 0);
        if (used > pct + 0.01) errs.push({ keys: fixed.map((f) => f.key), used: Math.round(used), room: Math.round(pct) });
        const rem = Math.max(0, pct - used);
        for (const f of fixed) { if (f.d === 3) out[f.sk[0]] = f.pct; else alloc(f.sk, f.pct, f.d); }
        const ws = rest.reduce((t, k) => t + info[k].w, 0);
        if (rest.length) rest.forEach((k) => { out[k] = ws ? rem * info[k].w / ws : 0; });
        else if (rem > 0.01 && fixed.length) {
            const tot = fixed.reduce((t, f) => t + f.pct, 0) || 1;
            fixed.forEach((f) => f.sk.forEach((k) => { out[k] += rem * (out[k] || 0) / tot; }));
        }
    };
    if (act.length) alloc(act, 100, 0);
    return { pct: out, errs };
}

function roundLR(exact, total, seed) {
    const ks = Object.keys(exact); const fl = {}; let used = 0;
    ks.forEach((k) => { fl[k] = Math.floor(exact[k] + 1e-9); used += fl[k]; });
    ks.slice().sort((x, y) => (exact[y] - fl[y]) - (exact[x] - fl[x]) || hash(seed + x) - hash(seed + y))
        .slice(0, Math.max(0, total - used)).forEach((k) => { fl[k]++; });
    return fl;
}
/** Rounded area by area, then grade by grade, then skill by skill. */
function roundTree(exact, total, seed, info) {
    const out = {}; const sum = (ks) => ks.reduce((t, k) => t + exact[k], 0);
    const areas = {}; Object.keys(exact).forEach((k) => (areas[info[k].a] = areas[info[k].a] || []).push(k));
    const aN = roundLR(Object.fromEntries(Object.entries(areas).map(([a, ks]) => [a, sum(ks)])), total, seed + 'a');
    for (const [a, ks] of Object.entries(areas)) {
        const gs = {}; ks.forEach((k) => (gs[info[k].g] = gs[info[k].g] || []).push(k)); const as = sum(ks) || 1;
        const gN = roundLR(Object.fromEntries(Object.entries(gs).map(([g, gk]) => [g, aN[a] * sum(gk) / as])), aN[a], seed + a);
        for (const [g, gk] of Object.entries(gs)) {
            const s2 = sum(gk) || 1;
            Object.assign(out, roundLR(Object.fromEntries(gk.map((k) => [k, gN[g] * exact[k] / s2])), gN[g], seed + a + g));
        }
    }
    return out;
}

function prepare(items, opts) {
    const list = (items || []).filter((it) => it && it.categoryId && it.skillId);
    const info = {};
    list.forEach((it) => { info[keyOf(it)] = { a: areaKey(it), g: gradeKey(it), w: weightOf(it) }; });
    const act = list.filter((it) => weightOf(it) > 0).map(keyOf);
    const locks = collectLocks(list, opts);
    return { list, info, act, locks };
}

function lockError(errs) {
    const e = errs[0];
    const names = e.keys.map((k) => k.replace(/^[akg]:/, '')).join(' + ');
    return `The held amounts (${names}) come to ${e.used} %, more than the ${e.room} % there is.`;
}

/**
 * Counts per item for `total` problems.
 * @returns {{counts:number[], byKey:Object<string,number>, pct:Object<string,number>, total:number, locked:boolean} | {error:string}}
 */
export function planCounts(items, total, opts = {}) {
    const { list, info, act, locks } = prepare(items, opts);
    const sh = shares(act, info, locks);
    if (sh.errs.length) return { error: lockError(sh.errs) };
    const T = Math.max(0, Math.round(total || 0));
    const seed = 's' + (opts.seed === undefined ? 0 : opts.seed);
    const byKey = act.length ? roundTree(Object.fromEntries(act.map((k) => [k, T * (sh.pct[k] || 0) / 100])), T, seed, info) : {};
    const anyLock = Object.keys(locks).length > 0;
    const floor = opts.minEach !== undefined ? opts.minEach : (!anyLock && act.length <= 8 && T >= act.length * 2 ? 2 : 1);
    // every active item at least `floor` when the total allows; donors are the largest unheld counts
    if (T >= act.length * floor) {
        const held = (k) => locks['k:' + k] !== undefined;
        for (const k of act) {
            while ((byKey[k] || 0) < floor) {
                const donor = act.filter((y) => byKey[y] > floor && !held(y)).sort((a, b) => byKey[b] - byKey[a])[0]
                    || act.filter((y) => byKey[y] > floor).sort((a, b) => byKey[b] - byKey[a])[0];
                if (!donor) break;
                byKey[donor]--; byKey[k] = (byKey[k] || 0) + 1;
            }
        }
    }
    list.forEach((it) => { const k = keyOf(it); if (!(k in byKey)) byKey[k] = 0; });
    return { counts: list.map((it) => byKey[keyOf(it)] || 0), byKey, pct: sh.pct, total: T, locked: anyLock };
}

/**
 * The page plan for one of the three kinds.
 * @param {'single'|'sections'|'mixed'} kind
 * @param {object[]} items
 * @param {{pages?:number, size?:'S'|'M'|'L', perPage?:number, total?:number, quiz?:boolean, seed?:any,
 *          each?:'new'|'same'|'copy', locks?:object}} opts
 * @returns {{kind, pages, perPage:number, total, counts:number[], byKey, pagesBy:Object<string,number>|null,
 *            pageItems:string[][], added:false|'single'|true, warn:string[], big:boolean, shown:number,
 *            active:number, left:number, pct, error?:string}}
 */
export function planPages(kind, items, opts = {}) {
    const { list, info, act, locks } = prepare(items, opts);
    const per = Math.max(1, opts.perPage || PER_PAGE[opts.size] || PER_PAGE.M);
    const n = list.length, big = n > 8, anyLock = Object.keys(locks).length > 0;
    const seed = opts.seed === undefined ? 0 : opts.seed;
    const label = (k) => (opts.labelOf ? opts.labelOf(k) : k);
    const sh = shares(act, info, locks);
    if (sh.errs.length) return { kind, error: lockError(sh.errs), pages: 0, perPage: per, total: 0, counts: list.map(() => 0), byKey: {}, pagesBy: null, pageItems: [], added: false, warn: [], big, shown: 0, active: act.length, left: n - act.length, pct: sh.pct };
    let pages = Math.max(1, Math.min(MAX_PAGES, Math.round(opts.pages || (kind === 'single' ? Math.max(1, act.length) : 1))));
    let added = false, total, byKey = {}, warn = [], pagesBy = null;
    const lockMet = (pg, P) => Object.keys(locks).every((sc) => {
        const ks = act.filter((k) => (sc === 'k:' + k) || (sc === 'a:' + info[k].a) || (sc === 'g:' + info[k].a + '|' + info[k].g));
        if (!ks.length) return true;
        return Math.abs(ks.reduce((t, x) => t + pg[x], 0) / P * 100 - locks[sc]) <= 2;
    });
    if (kind === 'single') {
        // each skill its own pages, shared by weight; with a held %, pages rise until every skill keeps a page
        // AND each held % is met (5 skills, one at 50 % → 8 pages: 4 · 1 · 1 · 1 · 1)
        const deal = (P) => roundLR(Object.fromEntries(act.map((x) => [x, P * (sh.pct[x] || 0) / 100])), P, 'p' + seed);
        let pg = deal(pages);
        if (anyLock && (act.some((x) => pg[x] < 1) || !lockMet(pg, pages))) {
            for (let P = pages + 1; P <= MAX_PAGES; P++) { const t = deal(P); if (act.every((x) => t[x] >= 1) && lockMet(t, P)) { pg = t; pages = P; added = 'single'; break; } }
        }
        // no lock: a skill left without a page borrows one from the skill with the most
        if (!anyLock && pages >= act.length) for (const x of act) while (pg[x] < 1) { const d = act.slice().sort((a, b) => pg[b] - pg[a])[0]; if (!d || pg[d] <= 1) break; pg[d]--; pg[x]++; }
        pagesBy = pg;
        act.forEach((x) => { byKey[x] = pg[x] * per; }); total = pages * per;
        warn = act.filter((x) => pg[x] < 1).map((x) => `${label(x)} gets no page: add pages${anyLock ? ' or lower the held %' : ''}.`);
    } else {
        total = opts.quiz && opts.total ? Math.round(opts.total) : per * pages;
        if (!opts.quiz && !big && !anyLock && kind === 'mixed' && act.length * 2 > total) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
        if (!opts.quiz && !big && kind === 'sections' && act.length > total / 2) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
        const pc = planCounts(list, total, { locks: opts.locks, seed, minEach: (!big && !anyLock && total >= act.length * 2) ? 2 : 1 });
        byKey = pc.byKey;
        if (opts.quiz) pages = Math.max(1, Math.ceil(total / per));
        if (!big) warn = act.filter((x) => !(byKey[x] > 0)).map((x) => `${label(x)} gets no problem: add pages${anyLock ? ' or lower the held %' : ''}.`);
    }
    // deal onto pages: Mixed shuffles (seeded); Sections and Single keep each skill together (Sections by area → grade)
    let order = list.map(keyOf);
    if (kind === 'sections' && big) {
        const ai = (k) => AREA_ORDER.indexOf(info[k].a), gi = (k) => GRADE_ORDER.indexOf(info[k].g);
        order = order.slice().sort((x, y) => ai(x) - ai(y) || gi(x) - gi(y));
    }
    const flat = []; order.forEach((k) => { for (let i = 0; i < (byKey[k] || 0); i++) flat.push(k); });
    if (kind === 'mixed') { const r = rng('deal' + seed); for (let i = flat.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [flat[i], flat[j]] = [flat[j], flat[i]]; } }
    let pageItems = []; for (let i = 0; i < flat.length; i += per) pageItems.push(flat.slice(i, i + per));
    // Each page: "same" (same problems, new numbers) / "copy" (same page again) repeat page 1's plan on every page;
    // Single skill repeats each skill's first page through its pages. A quiz never prints identical copies.
    let each = opts.each || 'new'; if (pages <= 1) each = 'new'; if (opts.quiz && each === 'copy') each = 'same';
    if (each !== 'new' && pages > 1 && !(opts.quiz && big)) {
        if (kind === 'single') pageItems = pageItems.map((pg) => pageItems.find((q) => q[0] === pg[0]).slice());
        else {
            const unit = planPages(kind, items, Object.assign({}, opts, { pages: 1, each: 'new' })).pageItems;
            pageItems = []; for (let i = 0; i < pages; i++) pageItems.push((unit[i % unit.length] || []).slice());
        }
        byKey = {}; pageItems.flat().forEach((x) => { byKey[x] = (byKey[x] || 0) + 1; }); total = pageItems.flat().length;
    }
    list.forEach((it) => { const k = keyOf(it); if (!(k in byKey)) byKey[k] = 0; });
    return {
        kind, pages: Math.max(pages, pageItems.length), perPage: per, total, each,
        counts: list.map((it) => byKey[keyOf(it)] || 0), byKey, pagesBy, pageItems, added, warn, big,
        shown: act.filter((x) => byKey[x] > 0).length, active: act.length, left: n - act.length, pct: sh.pct,
    };
}
