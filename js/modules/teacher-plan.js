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
//     lockPct  a held percentage for that skill (0–100) of the TOTAL
//     count    an exact number of problems for that skill ("6 problems"; owner 2026-10-24)
//
// Order (owner 2026-10-24): fixed counts come off the total first; then the % locks take their share of the
// total; the rest is shared by weight. Counts plus % over the total are refused ({error}, with `needTotal`).
//
// How much (owner 2026-10-24): planPages takes opts.amount = {mode, n}:
//   'pages' N pages (the default, N = opts.pages) · 'total' N problems in all (pages = ceil(N / perPage), the last
//   page holds the rest) · 'each' N of each skill (total = N × the skills without a count + their counts).
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

const countOf = (it) => { const c = Math.round(Number(it && it.count)); return c > 0 && !(it && it.leftOut) ? c : 0; };

/* ---------------------------------------------------------------- group totals (owner 2026-10-24, level b)
   A chosen group of skills shares ONE total, split among its members by How often: {skills: ['cat:skill', …], total}
   or {skills, pct} (a % of the whole set's total).
   The tray's bulk bar writes them with setCountGroups (T3a); the sheets read them with countGroups(). In memory and
   in localStorage (mq_teacher_count_groups), so they travel with the set on this device. */
const GROUPS_KEY = 'mq_teacher_count_groups';
let groupsMem = null;
export function countGroups() {
    if (groupsMem) return groupsMem;
    try { const g = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(GROUPS_KEY)) || '[]'); groupsMem = Array.isArray(g) ? g : []; } catch (e) { groupsMem = []; }
    return groupsMem;
}
export function setCountGroups(list) {
    groupsMem = (Array.isArray(list) ? list : []).filter((g) => g && Array.isArray(g.skills) && g.skills.length && (Number(g.total) > 0 || Number(g.pct) > 0))
        .map((g) => (Number(g.pct) > 0 ? { skills: g.skills.map(String), pct: Math.min(100, Number(g.pct)), name: g.name ? String(g.name) : undefined }
            : { skills: g.skills.map(String), total: Math.round(Number(g.total)), name: g.name ? String(g.name) : undefined }));
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(GROUPS_KEY, JSON.stringify(groupsMem)); } catch (e) { /* this device only */ }
    return groupsMem;
}

/**
 * The more specific level wins (owner 2026-10-24): (a) a skill's own count is fixed; (b) a group total covers the
 * rest of its group, split by weight; (c) the overall total covers what is left. A % (lockPct) is level (a) too,
 * a share of the overall total, for a skill outside any group.
 */
function prepare(items, opts) {
    const list = (items || []).filter((it) => it && it.categoryId && it.skillId);
    const info = {};
    list.forEach((it) => { info[keyOf(it)] = { a: areaKey(it), g: gradeKey(it), w: weightOf(it), c: countOf(it) }; });
    const act = list.filter((it) => weightOf(it) > 0).map(keyOf);
    const fixed = {}; act.forEach((k) => { if (info[k].c) fixed[k] = info[k].c; });
    const label = (k) => (opts && opts.labelOf ? opts.labelOf(k) : k);
    const groups = (opts && Array.isArray(opts.groups) ? opts.groups : countGroups()) || [];
    const inGroup = new Set(); let groupError = null;
    groups.forEach((g, gi) => {
        const members = (g.skills || []).map(String).filter((k) => act.includes(k) && !inGroup.has(k));
        if (!members.length) return;
        members.forEach((k) => inGroup.add(k));
        // a group total is a count, or a % of the whole set's total (largest remainder: Math.round of the share)
        const overall = Math.max(0, Math.round(Number(opts && opts.overall) || 0));
        const T = Number(g.pct) > 0 ? Math.round(overall * Math.min(100, Number(g.pct)) / 100) : Math.max(0, Math.round(Number(g.total) || 0));
        const own = members.filter((k) => fixed[k]);
        const ownSum = own.reduce((t, k) => t + fixed[k], 0);
        const name = g.name || `the group of ${members.length}`;
        if (ownSum > T && !groupError) {
            const big = own.slice().sort((x, y) => fixed[y] - fixed[x])[0];
            const lower = Math.max(0, fixed[big] - (ownSum - T));
            groupError = { error: `The counts in ${name} come to ${ownSum}, more than its total of ${T}.`, fix: `Raise ${name} to ${ownSum}, or lower ${label(big)} to ${lower}.`, needGroup: { index: gi, total: ownSum }, lower: { key: big, count: lower } };
            return;
        }
        const rest = members.filter((k) => !fixed[k]);
        const ws = rest.reduce((t, k) => t + info[k].w, 0);
        const room = T - ownSum;
        const share = rest.length ? roundLR(Object.fromEntries(rest.map((k) => [k, ws ? room * info[k].w / ws : room / rest.length])), room, 'g' + gi + (opts && opts.seed !== undefined ? opts.seed : 0)) : {};
        rest.forEach((k) => { fixed[k] = share[k] || 0; info[k].grp = true; });
    });
    const gPct = groups.reduce((t, g) => t + (Number(g.pct) > 0 ? Number(g.pct) : 0), 0);
    if (gPct > 100 + 1e-6 && !groupError) groupError = { error: `The groups' percentages come to ${Math.round(gPct)} %, more than 100 %.`, fix: 'Lower one of the groups.' };
    const locks = collectLocks(list.filter((it) => !countOf(it) && !inGroup.has(keyOf(it))), opts);
    const fixedSum = Object.values(fixed).reduce((a, b) => a + b, 0);
    return { list, info, act, locks, fixed, fixedSum, groupError };
}

function lockError(errs) {
    const e = errs[0];
    const names = e.keys.map((k) => k.replace(/^[akg]:/, '')).join(' + ');
    return `The held amounts (${names}) come to ${e.used} %, more than the ${e.room} % there is.`;
}
const pctSum = (locks) => Object.values(locks).reduce((a, b) => a + b, 0);

/**
 * Counts per item for `total` problems: the fixed counts first, then the held % of the total, then the rest by
 * weight (largest remainder, area → grade → skill).
 * @returns {{counts:number[], byKey, pct, total, locked:boolean, warn:string[]} | {error:string, needTotal?:number}}
 */
export function planCounts(items, total, opts = {}) {
    const { list, info, act, locks, fixed, fixedSum, groupError } = prepare(items, Object.assign({}, opts, { overall: total }));
    if (groupError) return Object.assign({}, groupError, { error: `${groupError.error} ${groupError.fix}` });
    const T = Math.max(0, Math.round(total || 0));
    const free = act.filter((k) => !(k in fixed));
    const held = pctSum(locks);
    // the % locks are shares of the TOTAL; what the fixed counts leave is the room they come out of
    const room = T - fixedSum;
    const heldN = T * held / 100;
    if (fixedSum + heldN > T + 1e-6) {
        // the fix leaves no skill at 0: room for one of each uncounted skill too
        const need = held < 100 ? Math.ceil((fixedSum + free.length) / (1 - held / 100) - 1e-9) : Infinity;
        // never rescaled silently: say so and offer the fix
        const fix = isFinite(need) ? ` Raise the total to ${need}.` : ' Lower the held %.';
        return { error: (fixedSum && held ? `The counts (${fixedSum}) and the held ${Math.round(held)} % come to more than the ${T} problems there are.`
            : fixedSum ? `The counts come to ${fixedSum}, more than the ${T} problems there are.` : lockError([{ keys: Object.keys(locks), used: Math.round(held), room: 100 }])) + fix, fix: fix.trim(), needTotal: need };
    }
    // rescale the % locks to the room the counts leave
    const scale = room > 0 ? T / room : 0;
    const rl = {}; for (const [k, v] of Object.entries(locks)) rl[k] = v * scale;
    const sh = shares(free, info, rl);
    if (sh.errs.length && room > 0) return { error: lockError(sh.errs) };
    const seed = 's' + (opts.seed === undefined ? 0 : opts.seed);
    const byKey = free.length && room > 0 ? roundTree(Object.fromEntries(free.map((k) => [k, room * (sh.pct[k] || 0) / 100])), room, seed, info) : {};
    Object.assign(byKey, fixed);
    const anyLock = Object.keys(locks).length > 0 || fixedSum > 0;
    const floor = opts.minEach !== undefined ? opts.minEach : (!anyLock && act.length <= 8 && T >= act.length * 2 ? 2 : 1);
    // every active item at least `floor` when the total allows; donors are the largest unheld, uncounted counts
    if (room >= free.length * floor) {
        const isHeld = (k) => locks['k:' + k] !== undefined;
        for (const k of free) {
            while ((byKey[k] || 0) < floor) {
                const donor = free.filter((y) => byKey[y] > floor && !isHeld(y)).sort((a, b) => byKey[b] - byKey[a])[0]
                    || free.filter((y) => byKey[y] > floor).sort((a, b) => byKey[b] - byKey[a])[0];
                if (!donor) break;
                byKey[donor]--; byKey[k] = (byKey[k] || 0) + 1;
            }
        }
    }
    list.forEach((it) => { const k = keyOf(it); if (!(k in byKey)) byKey[k] = 0; });
    const pct = {}; act.forEach((k) => { pct[k] = T ? 100 * byKey[k] / T : 0; });
    const label = (k) => (opts.labelOf ? opts.labelOf(k) : k);
    const warn = act.filter((k) => !(byKey[k] > 0)).map((k) => `${label(k)} gets no problem: add problems${anyLock ? ' or lower the counts / held %' : ''}.`);
    return { counts: list.map((it) => byKey[keyOf(it)] || 0), byKey, pct, total: T, locked: anyLock, warn };
}

/**
 * The page plan for one of the three kinds.
 * @param {'single'|'sections'|'mixed'} kind
 * @param {object[]} items
 * @param {{pages?:number, amount?:{mode:'pages'|'total'|'each', n:number}, size?:'S'|'M'|'L', perPage?:number,
 *          quiz?:boolean, total?:number, seed?:any, each?:'new'|'same'|'copy', locks?:object, labelOf?:Function}} opts
 *   (`quiz` + `total` = the old spelling of amount {mode:'total', n: total})
 * @returns {{kind, mode, pages, perPage, total, about, counts:number[], byKey, pagesBy:Object|null, pageItems:string[][],
 *            added:false|'single'|true, warn:string[], big, shown, active, left, pct, each, needPages?:number, error?:string}}
 */
export function planPages(kind, items, opts = {}) {
    const per0 = Math.max(1, opts.perPage || PER_PAGE[opts.size] || PER_PAGE.M);
    const amt0 = opts.amount && opts.amount.mode ? opts.amount : opts.quiz && opts.total ? { mode: 'total', n: opts.total } : { mode: 'pages', n: opts.pages };
    const overall = amt0.mode === 'total' ? Number(amt0.n) || 0 : amt0.mode === 'pages' ? per0 * Math.max(1, Number(amt0.n) || 1) : 0;
    const { list, info, act, locks, fixed, fixedSum, groupError } = prepare(items, Object.assign({}, opts, { overall }));
    const per = Math.max(1, opts.perPage || PER_PAGE[opts.size] || PER_PAGE.M);
    const n = list.length, big = n > 8, anyLock = Object.keys(locks).length > 0 || fixedSum > 0;
    const seed = opts.seed === undefined ? 0 : opts.seed;
    const label = (k) => (opts.labelOf ? opts.labelOf(k) : k);
    const amount = opts.amount && ['pages', 'total', 'each'].includes(opts.amount.mode) ? opts.amount
        : opts.quiz && opts.total ? { mode: 'total', n: opts.total } : { mode: 'pages', n: opts.pages };
    const mode = amount.mode;
    const free = act.filter((k) => !(k in fixed));
    const fail = (error, extra = {}) => Object.assign({ kind, mode, error, pages: 0, perPage: per, total: 0, about: 0, counts: list.map(() => 0), byKey: {}, pagesBy: null, pageItems: [], added: false, warn: [], big, shown: 0, active: act.length, left: n - act.length, pct: {}, each: 'new' }, extra);
    let pages, total, added = false, byKey = {}, warn = [], pagesBy = null, needPages;
    if (groupError) return fail(`${groupError.error} ${groupError.fix}`, { fix: groupError.fix, lower: groupError.lower, needGroup: groupError.needGroup });

    if (mode === 'total' || mode === 'each') {
        const N = Math.max(1, Math.round(amount.n || 1));
        total = mode === 'total' ? N : N * free.length + fixedSum;
        const pc = planCounts(list, total, { groups: opts.groups, locks: opts.locks, seed, labelOf: opts.labelOf });
        if (pc.error) return fail(pc.error, { needTotal: pc.needTotal, fix: pc.fix, lower: pc.lower });
        byKey = pc.byKey;
        if (mode === 'each') free.forEach((k) => { if (!Object.keys(locks).length) byKey[k] = N; });
        total = act.reduce((t, k) => t + (byKey[k] || 0), 0);
        warn = pc.warn;
        if (kind === 'single') { pagesBy = {}; act.forEach((k) => { pagesBy[k] = byKey[k] > 0 ? Math.ceil(byKey[k] / per) : 0; }); pages = Object.values(pagesBy).reduce((a, b) => a + b, 0); }
        else pages = Math.max(1, Math.ceil(total / per));
    } else {
        pages = Math.max(1, Math.min(MAX_PAGES, Math.round(amount.n || (kind === 'single' ? Math.max(1, act.length) : 1))));
        const lockMet = (pg, P, keys) => Object.keys(locks).every((sc) => {
            const ks = keys.filter((k) => (sc === 'k:' + k) || (sc === 'a:' + info[k].a) || (sc === 'g:' + info[k].a + '|' + info[k].g));
            if (!ks.length) return true;
            return Math.abs(ks.reduce((t, x) => t + pg[x], 0) / P * 100 - locks[sc]) <= 2;
        });
        if (kind === 'single') {
            // a counted skill takes the pages its count needs; the others share the rest by weight. With a held %,
            // pages rise until every skill keeps a page AND each held % is met (5 skills, one at 50 % → 8: 4·1·1·1·1)
            const fixedPages = {}; Object.entries(fixed).forEach(([k, c]) => { fixedPages[k] = Math.ceil(c / per); });
            const fp = Object.values(fixedPages).reduce((a, b) => a + b, 0);
            const sh = shares(free, info, locks);
            if (sh.errs.length) return fail(lockError(sh.errs));
            const deal = (P) => Object.assign(roundLR(Object.fromEntries(free.map((x) => [x, Math.max(0, P - fp) * (sh.pct[x] || 0) / 100])), Math.max(0, P - fp), 'p' + seed), fixedPages);
            let pg = deal(pages);
            const ok = (t, P) => P >= fp && free.every((x) => t[x] >= 1) && lockMet(t, P - fp, free);
            if (anyLock && !ok(pg, pages)) {
                for (let P = pages + 1; P <= MAX_PAGES; P++) { const t = deal(P); if (ok(t, P)) { pg = t; pages = P; added = 'single'; break; } }
            }
            if (!anyLock && pages - fp >= free.length) for (const x of free) while (pg[x] < 1) { const d = free.slice().sort((a, b) => pg[b] - pg[a])[0]; if (!d || pg[d] <= 1) break; pg[d]--; pg[x]++; }
            if (fp > pages) { pages = fp; added = 'single'; }
            pagesBy = pg;
            act.forEach((x) => { byKey[x] = fixed[x] || pg[x] * per; });
            total = act.reduce((t, k) => t + byKey[k], 0);
            warn = act.filter((x) => !(pg[x] >= 1)).map((x) => `${label(x)} gets no page: add pages${anyLock ? ' or lower the counts / held %' : ''}.`);
        } else {
            total = per * pages;
            if (!big && !anyLock && kind === 'mixed' && act.length * 2 > total) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
            if (!big && kind === 'sections' && act.length > total / 2 && !fixedSum) { pages = Math.ceil(act.length * 2 / per); total = per * pages; added = true; }
            const pc = planCounts(list, total, { groups: opts.groups, locks: opts.locks, seed, labelOf: opts.labelOf, minEach: (!big && !anyLock && total >= act.length * 2) ? 2 : 1 });
            if (pc.error) {
                // the counts (and held %) do not fit these pages: say how many would
                needPages = isFinite(pc.needTotal) ? Math.ceil(pc.needTotal / per) : undefined;
                return fail(`${pc.error}${needPages ? ` Raise to ${needPages} page${needPages > 1 ? 's' : ''}?` : ''}`, { needPages });
            }
            byKey = pc.byKey;
            if (!big) warn = pc.warn;
        }
    }
    // deal onto pages: Mixed shuffles (seeded); Sections and Single keep each skill together (Sections by area → grade)
    let order = list.map(keyOf);
    if (kind === 'sections' && big) {
        const ai = (k) => AREA_ORDER.indexOf(info[k].a), gi = (k) => GRADE_ORDER.indexOf(info[k].g);
        order = order.slice().sort((x, y) => ai(x) - ai(y) || gi(x) - gi(y));
    }
    let pageItems = [];
    if (kind === 'single') {
        // each skill on its own pages: a page holds `per`, the skill's last page the rest
        for (const k of order) { let c = byKey[k] || 0; while (c > 0) { const t = Math.min(per, c); pageItems.push(Array(t).fill(k)); c -= t; } }
    } else {
        const flat = []; order.forEach((k) => { for (let i = 0; i < (byKey[k] || 0); i++) flat.push(k); });
        if (kind === 'mixed') { const r = rng('deal' + seed); for (let i = flat.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [flat[i], flat[j]] = [flat[j], flat[i]]; } }
        for (let i = 0; i < flat.length; i += per) pageItems.push(flat.slice(i, i + per));
    }
    // Each page: "same" (same problems, new numbers) / "copy" (same page again) repeat page 1's plan on every page
    // (Pages mode only); Single skill repeats each skill's first page through its pages. A quiz never prints copies.
    let each = opts.each || 'new'; if (pages <= 1 || mode !== 'pages') each = 'new'; if (opts.quiz && each === 'copy') each = 'same';
    if (each !== 'new' && pages > 1 && !(opts.quiz && big)) {
        if (kind === 'single') pageItems = pageItems.map((pg) => pageItems.find((q) => q[0] === pg[0]).slice());
        else {
            const unit = planPages(kind, items, Object.assign({}, opts, { pages: 1, amount: undefined, each: 'new' })).pageItems;
            pageItems = []; for (let i = 0; i < pages; i++) pageItems.push((unit[i % unit.length] || []).slice());
        }
        byKey = {}; pageItems.flat().forEach((x) => { byKey[x] = (byKey[x] || 0) + 1; }); total = pageItems.flat().length;
    }
    list.forEach((it) => { const k = keyOf(it); if (!(k in byKey)) byKey[k] = 0; });
    const shown = act.filter((x) => byKey[x] > 0).length;
    const pct = {}; act.forEach((k) => { pct[k] = total ? 100 * byKey[k] / total : 0; });
    return {
        kind, mode, pages: Math.max(pages, kind === 'single' ? 0 : pageItems.length), perPage: per, total, each,
        about: shown ? Math.round(total / shown) : 0,
        counts: list.map((it) => byKey[keyOf(it)] || 0), byKey, pagesBy, pageItems, added, warn, big,
        shown, active: act.length, left: n - act.length, pct,
    };
}
