// js/modules/sheet/supports.js
// THE SUPPORTS MODEL (design/SUPPORTS.md §S2): which support each problem of a page carries.
//
// A teacher ticks the supports a skill should carry (the unified `support` set, skill-options.js)
// and, for the page, how they are spread (`coverage`) and how two supports that cannot stand on
// one problem are shared out (`mix`). `allocateSupports` turns that into a per-item list. It runs
// ONCE per sheet, after generation and before measurement (print-sheet.js), so the pupil page, the
// key and the measured footprint all draw the same thing; the screen hosts call it per session.
//
//   coverage  'whole'   every item that can draw the support carries it
//             'needed'  only items whose numbers qualify (the host says which: `need`)
//             'fade'    by page position: first third all of it, middle third the light part
//                       (touch dots count on instead of count all, marks and structure kept,
//                       pictures gone), last third none. It never increases down the page.
//   mix       'section' clashing supports are dealt section by section across the page (section A
//                       touch dots, section B dot tiles); a page of one section, in equal blocks
//             'problem' problem by problem (touch dots, dot tiles, touch dots, ...)
//
// Deterministic (no randomness: the same page allocates the same way) and balanced (the
// alternatives of a clash are dealt in equal shares, ±1).
//
// Pure module (SCC-01).

import { compat as paneCompat, PANES } from './cells/panes/index.js';

/* ------------------------------------------------------------------ the support ids */

/** Touch dots on the numerals: count on / back / by (the lighter rung) and count all. */
export const TOUCH_IDS = Object.freeze(['touch', 'touchall']);
/** The P11 fact cues (fact.js factCue), drawn under the problem. */
export const CUE_IDS = Object.freeze(['tile', 'frame', 'line', 'skip', 'array', 'think']);
/** Every render-time support id: touch dots, the cues and every registered pane. */
export const SUPPORT_IDS = Object.freeze([...TOUCH_IDS, ...CUE_IDS, ...Object.keys(PANES)]);
export const isSupportId = (id) => SUPPORT_IDS.includes(id);

// A cue is the same KIND of picture as one of the panes, so it clashes and stacks like it.
const AS_PANE = Object.freeze({ tile: 'dice', frame: 'tenframe', line: 'numberline', skip: 'numberline', array: 'array', think: 'bar' });
const paneOf = (id) => (TOUCH_IDS.includes(id) ? 'touchdots' : AS_PANE[id] || id);

/**
 * Can supports x and y stand on one problem? 'ok' | 'wide' (only in a one-column cell) | 'clash'.
 * Symmetric. The two touch-dot rungs clash with each other (they are two steps of one ladder).
 */
export function supportCompat(x, y) {
    if (x === y) return 'ok';
    if (TOUCH_IDS.includes(x) && TOUCH_IDS.includes(y)) return 'clash';
    const px = paneOf(x), py = paneOf(y);
    if (px === py && px !== 'touchdots') return 'clash';          // two cues drawn as the same pane
    return paneCompat(px, py);
}

/**
 * Split a chosen list into ALTERNATIVES: sets that stack on one problem. The supports that clash
 * with nothing ride on every alternative; the clashing ones are coloured greedily, in the order
 * chosen, into as few groups as possible.  [touch, tile, boxsign] -> [[touch, boxsign], [tile, boxsign]].
 */
export function alternativesOf(chosen, compat = supportCompat) {
    const list = [...new Set(chosen || [])];
    if (!list.length) return [];
    const clashes = (x, y) => compat(x, y) === 'clash';
    const free = list.filter((x) => !list.some((y) => y !== x && clashes(x, y)));
    const groups = [];
    for (const x of list) {
        if (free.includes(x)) continue;
        const g = groups.find((gr) => gr.every((y) => !clashes(x, y)));
        if (g) g.push(x); else groups.push([x]);
    }
    if (!groups.length) return [list.slice()];
    return groups.map((g) => list.filter((x) => g.includes(x) || free.includes(x)));
}

/* ------------------------------------------------------------------ fading */

// Level 2 of a fade: the light part of a support. Touch dots step from count all to count on,
// a rounding chart to the marks on the numeral; marks and structure stay; pictures go.
const LIGHT = Object.freeze({
    touchall: 'touch', touch: 'touch',
    'round-pv': 'round-mark', 'round-mark': 'round-mark',
    boxsign: 'boxsign', startarrow: 'startarrow', steps: 'steps',
    gridpaper: 'gridpaper', pvgrid: 'pvgrid',
});
/** The supports kept at a fade level (3 all, 2 the light part, 1 none). */
export function fadeTo(list, level) {
    if (level >= 3) return list.slice();
    if (level <= 1) return [];
    return [...new Set(list.map((x) => LIGHT[x]).filter(Boolean))];
}
/** The fade level of item j of n: first third 3, middle third 2, last third 1. */
export const fadeLevel = (j, n) => (n <= 0 ? 3 : 3 - Math.min(2, Math.floor((3 * j) / n)));

/**
 * S2 (owner ruling 2026-09-25): which of `k` ticked rungs (most support first) item `at` of a page
 * takes. A FADE DOWN THE PAGE, never a cycle: with the page's count known (`total`, buildSheet's
 * section count) the rungs are dealt in equal blocks ({3, 2, 1} on six cells: 3, 3, 2, 2, 1, 1);
 * without it, two items a rung and the last rung for the rest, so a rung never comes back further
 * down whatever the page holds. Live play (no page index) cycles, as before.
 */
export function fadeRung(at, k, total, onPage = true) {
    if (k <= 1) return 0;
    if (!onPage || !(at >= 0)) return ((at % k) + k) % k;
    if (Number.isFinite(total) && total > 0) return Math.min(k - 1, Math.floor((at * k) / total));
    return Math.min(k - 1, Math.floor(at / 2));
}

/* ------------------------------------------------------------------ the allocator */

const COVERAGES = ['whole', 'needed', 'fade'];
const MIXES = ['section', 'problem'];
export const normCoverage = (c) => (COVERAGES.includes(c) ? c : 'whole');
export const normMix = (m) => (MIXES.includes(m) ? m : 'section');

/** The digit size below which touch dots are too small to touch (24 pt, SUPPORTS.md §S1.6). */
export const TOUCH_MIN_PT = 24;

/**
 * @param {Array<{section?:number, skill?:string, can?:string[], need?:Object<string,boolean>, touchPt?:number}>} items
 *        in PAGE ORDER. `can` = the supports this item can draw (omitted: any); `need[id]` false =
 *        the item's numbers do not qualify for `id` (coverage 'needed'); `touchPt` = the digit size
 *        its numerals print at (for the 24 pt rule).
 * @param {string[]|Object<string,string[]>} chosen  the supports ticked, for every item or per skill key
 * @param {{coverage?: string|Object, mix?: string|Object, compat?: Function}} [opts]
 *        coverage / mix may be one value or a per-skill map.
 * @returns {Array<{on: string[], reserve: string[], level: number, alt: number, forceL: boolean}>}
 *        `on` = what the item draws; `reserve` = what it keeps room for, drawn invisibly: every
 *        support the section's cells could carry (the worst case), so every cell of a section has
 *        the same geometry and the answer zone never moves. `forceL` = a touch-dot section whose
 *        digits would print under 24 pt, drawn at size L (owner ruling).
 */
export function allocateSupports(items, chosen, opts = {}) {
    const list = Array.isArray(items) ? items : [];
    const compat = opts.compat || supportCompat;
    const pick = (v, skill, norm) => norm(v && typeof v === 'object' ? v[skill] : v);
    const chosenFor = (skill) => {
        const c = Array.isArray(chosen) ? chosen : (chosen && chosen[skill]) || [];
        return c.filter((x) => typeof x === 'string');
    };
    const out = list.map(() => ({ on: [], reserve: [], level: 3, alt: -1, forceL: false }));
    // The page's sections in order: with two or more, 'section' mixing deals the alternatives
    // section by section ACROSS the page (section A touch dots, section B dot tiles), whichever
    // skill each section holds.
    const pageSections = [...new Set(list.map((it) => Number(it && it.section) || 0))];
    // A host may name each item's place in the page's section order itself (`mixKey`: the sheet's
    // section, or the Mixed practice pool), so the dealing is known before the page is complete.
    const keyed = list.length && list.every((it) => it && Number.isFinite(it.mixKey));
    const keyCount = keyed ? new Set(list.map((it) => it.mixKey)).size : 0;

    // Per skill: its items in page order, its sections in order of first appearance.
    const bySkill = new Map();
    list.forEach((it, i) => {
        const k = String((it && it.skill) || '');
        if (!bySkill.has(k)) bySkill.set(k, []);
        bySkill.get(k).push(i);
    });
    for (const [skill, idx] of bySkill) {
        const alts = alternativesOf(chosenFor(skill), compat);
        if (!alts.length) continue;
        const coverage = pick(opts.coverage, skill, normCoverage);
        const mix = pick(opts.mix, skill, normMix);
        const n = idx.length, k = alts.length;
        idx.forEach((i, j) => {
            const it = list[i] || {};
            const can = Array.isArray(it.can) ? it.can : null;
            const drawable = (alt) => (can ? alt.filter((x) => can.includes(x)) : alt.slice());
            let a;
            if (k === 1) a = 0;
            else if (mix === 'problem') a = j % k;
            else if (keyed && keyCount >= 2) a = it.mixKey % k;
            else if (!keyed && pageSections.length >= 2) a = pageSections.indexOf(Number(it.section) || 0) % k;
            else a = Math.min(k - 1, Math.floor((j * k) / n));
            // An item that cannot draw its alternative takes the next one it can.
            let on = drawable(alts[a]);
            for (let t = 1; t < k && !on.length; t++) { const b = (a + t) % k; const d = drawable(alts[b]); if (d.length) { on = d; a = b; } }
            let level = 3;
            if (coverage === 'fade') { level = fadeLevel(j, n); on = fadeTo(on, level); }
            if (coverage === 'needed' && it.need) on = on.filter((x) => it.need[x] !== false);
            out[i] = { on, reserve: [], level, alt: on.length ? a : -1, forceL: false };
        });
    }

    // The worst case per section: every cell keeps room for every support the section's cells
    // COULD carry (what they can draw of what was chosen, whatever the coverage and the mix dealt),
    // so the host measures one geometry and the answer zone stands in the same place in each.
    const bySection = new Map();
    list.forEach((it, i) => {
        const s = Number(it && it.section) || 0;
        if (!bySection.has(s)) bySection.set(s, []);
        bySection.get(s).push(i);
    });
    const possible = (i) => {
        const it = list[i] || {};
        const c = chosenFor(String(it.skill || ''));
        return Array.isArray(it.can) ? c.filter((x) => it.can.includes(x)) : c;
    };
    for (const idx of bySection.values()) {
        const union = [...new Set(idx.flatMap((i) => possible(i).concat(out[i].on)))];
        const touchSmall = idx.some((i) => possible(i).some((x) => TOUCH_IDS.includes(x))
            && Number.isFinite(list[i].touchPt) && list[i].touchPt < TOUCH_MIN_PT);
        for (const i of idx) {
            const can = Array.isArray(list[i].can) ? list[i].can : null;
            out[i].reserve = union.filter((x) => !out[i].on.includes(x) && (!can || can.includes(x)));
            out[i].forceL = touchSmall;
        }
    }
    return out;
}

/**
 * One item on its own (a screen host: live practice, the online worksheet). `index` / `total`
 * place it in the session so a fade and a problem-by-problem mix still work; a session has one
 * section, so 'section' mixing deals equal blocks.
 */
export function supportsForItem(chosen, { index = 0, total = 1, coverage = 'whole', mix = 'section', can = null, need = null } = {}) {
    const n = Math.max(1, Math.floor(total) || 1), j = Math.max(0, Math.min(n - 1, Math.floor(index) || 0));
    const items = Array.from({ length: n }, (_, i) => ({ section: 0, skill: 's', can: i === j ? can : null, need: i === j ? need : null }));
    const r = allocateSupports(items, { s: chosen || [] }, { coverage, mix })[j];
    return { on: r.on, reserve: [], level: r.level };
}
