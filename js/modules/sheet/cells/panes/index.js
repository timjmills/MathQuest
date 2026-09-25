// js/modules/sheet/cells/panes/index.js
// THE SUPPORT-PANE REGISTRY (design/SUPPORTS.md §S4).
//
//   PANES[id] = {
//     label, grades, ops, kind, scaffold, answerFree: true, placements,
//     accepts(payload)          -> can this pane draw this problem?
//     draw(payload, ctx)        -> the pane's HTML (paper in mm; ctx.twin = the screen twin in px)
//     footprint(payload, ctx)   -> {wMm, hMm, placements}
//   }
//
// A payload is plain data read off the problem: `{op, a, b}` for a calculation ('+', '-', '*',
// '/' or the glyphs), `{n}` for a single number, `{n, place, kind: 'round'}` for rounding, plus a
// pane's own choices (`object` for outline objects, `bottomUp` / `chart` for the hundreds chart,
// `model: 'compare'` for the bar model, `steps` for the checklist). ctx: `{size: 'S'|'M'|'L',
// twin, ink: 'black'|'grey', sentence}`.
//
// This lane builds the templates only: nothing here is wired into a skill or an option. The
// allocator lane reads `accepts`, `footprint`, `placePane` and `compat` to decide what goes where.
//
// Pure module (SCC-01).

import { pc, wrap, foot, esc } from './kit.js';
import { K2_PANES, OBJECTS, OBJECT_IDS } from './k2.js';
import { PLACE_PANES } from './place.js';
import { MODEL_PANES } from './models.js';
import { EXTRA_PANES, DEFAULT_STEPS } from './extras.js';

export { OBJECTS, OBJECT_IDS, DEFAULT_STEPS };

/** The compatibility GROUP of each pane (§S4.7): panes in one group never stack. */
export const PANE_GROUP = Object.freeze({
    objects: 'count', tenframe: 'count', dice: 'count', fingers: 'count', rekenrek: 'count',
    base10: 'place', 'base10-quick': 'place', disks: 'place',
    numberline: 'line', openline: 'line', hundreds: 'line', 'round-line': 'line', 'round-chart': 'line',
    array: 'array', area: 'array',
    pvgrid: 'grid', gridpaper: 'grid',
    bar: 'bar',
    boxsign: 'extra', startarrow: 'extra', steps: 'extra',
});

const KIND = { count: 'picture', place: 'picture', line: 'model', array: 'picture', grid: 'structure', bar: 'model', extra: 'extra' };

function entry(id, def) {
    const group = PANE_GROUP[id];
    const ctxOf = (ctx) => {
        const c = pc(ctx);
        if (def.sentenceOff) c.sentence = false;
        return c;
    };
    const payloadOf = (p) => (def.sentence && !p.sentence ? { ...p, sentence: def.sentence(p) } : p);
    return Object.freeze({
        id,
        label: def.label,
        grades: Object.freeze(def.grades.slice()),
        ops: Object.freeze(def.ops.slice()),
        group,
        kind: def.kind || KIND[group],
        scaffold: def.scaffold || 'hint',
        placements: Object.freeze((def.placements || ['beside', 'under']).slice()),
        answerFree: true,
        accepts: (p) => { try { return !!def.accepts(p || {}); } catch (e) { return false; } },
        draw(payload, ctx = {}) {
            const p = payloadOf(payload || {});
            const c = ctxOf(ctx);
            return wrap(c, id, p, def.geom(p, c), { scaffold: def.scaffold || 'hint' });
        },
        footprint(payload, ctx = {}) {
            const p = payloadOf(payload || {});
            const c = ctxOf(ctx);
            return { ...foot(c, p, def.geom(p, c)), placements: (def.placements || ['beside', 'under']).slice() };
        },
    });
}

const ALL = { ...K2_PANES, ...PLACE_PANES, ...MODEL_PANES, ...EXTRA_PANES };
export const PANES = Object.freeze(Object.fromEntries(Object.entries(ALL).map(([id, def]) => [id, entry(id, def)])));
export const PANE_IDS = Object.freeze(Object.keys(PANES));

/** Draw pane `id` for a payload; '' when the pane cannot draw it. */
export function renderPane(id, payload, ctx = {}) {
    const P = PANES[id];
    return P && P.accepts(payload) ? P.draw(payload, ctx) : '';
}

/** The panes that can draw a payload, optionally for one grade. */
export function panesFor(payload, { grade = null } = {}) {
    return PANE_IDS.filter((id) => PANES[id].accepts(payload) && (!grade || PANES[id].grades.includes(String(grade))));
}

/* ------------------------------------------------------------------ placement (§S4.6) */

/** Gap between a problem and its pane (mm): the column gap of a fact grid. */
export const PANE_GAP_MM = 4;

/**
 * Where a pane goes on a problem: 'before' (left of the problem, the boxed sign: it is read first
 * and never sits by the answer, SF-4), 'beside' when the cell is wide enough for problem + gap + pane
 * (and the pane is no taller than 1.5 x the problem's cell zone), otherwise 'under' when the pane
 * fits the cell width, otherwise null (the allocator gives the item a wider cell or a whole row).
 * A pane whose only placement is 'over-ones' (the start arrow) always returns that.
 */
export function placePane(foot, { problemWMm, cellWMm, problemHMm = Infinity, gapMm = PANE_GAP_MM } = {}) {
    const pl = foot.placements || ['beside', 'under'];
    if (pl.length === 1 && pl[0] === 'over-ones') return 'over-ones';
    if (pl.includes('before') && problemWMm + gapMm + foot.wMm <= cellWMm) return 'before';
    if (pl.includes('beside') && problemWMm + gapMm + foot.wMm <= cellWMm && foot.hMm <= Math.max(problemHMm * 1.5, 40)) return 'beside';
    if (pl.includes('under') && foot.wMm <= cellWMm) return 'under';
    if (pl.includes('beside') && problemWMm + gapMm + foot.wMm <= cellWMm) return 'beside';
    return null;
}

/** The height a pane adds to a cell at a placement (mm). */
export function addedHeight(foot, placement, problemHMm = 0, gapMm = PANE_GAP_MM) {
    if (placement === 'under') return foot.hMm + gapMm;
    if (placement === 'over-ones') return foot.hMm + 1;
    if (placement === 'beside' || placement === 'before') return Math.max(0, foot.hMm - problemHMm);
    return 0;
}

/**
 * Join a problem's HTML and a pane at a placement. The pane never sits in the answer zone
 * (SF-4): beside = to the right of the problem, top-aligned; under = below it, centred; over-ones
 * = above it, right-aligned over the ones column (half a digit track in from the right);
 * before = to the LEFT of the problem.
 */
export function attachPane(problemHtml, paneHtml, placement = 'under', { gapMm = PANE_GAP_MM, twin = false } = {}) {
    const gap = twin ? `calc(var(--mq-k2, 3.4px) * ${gapMm})` : `${gapMm}mm`;
    if (placement === 'beside') {
        return `<div class="ws-with-pane" data-ws-pane-place="beside" style="display:flex;flex-wrap:${twin ? 'wrap' : 'nowrap'};align-items:flex-start;justify-content:center;gap:${gap};">`
            + `<div class="ws-pane-problem" style="flex:none;">${problemHtml}</div>${paneHtml}</div>`;
    }
    if (placement === 'before') {
        return `<div class="ws-with-pane" data-ws-pane-place="before" style="display:flex;align-items:flex-start;justify-content:center;gap:${gap};">`
            + `${paneHtml}<div class="ws-pane-problem" style="flex:none;">${problemHtml}</div></div>`;
    }
    if (placement === 'over-ones') {
        return `<div class="ws-with-pane" data-ws-pane-place="over-ones" style="display:flex;justify-content:center;">`
            + `<div style="display:inline-flex;flex-direction:column;align-items:flex-end;">`
            + `<div style="margin-right:calc(var(--ws-track, 9.4mm) / 2 - 4.5mm);margin-bottom:1mm;">${paneHtml}</div>`
            + `<div class="ws-pane-problem">${problemHtml}</div></div></div>`;
    }
    return `<div class="ws-with-pane" data-ws-pane-place="under" style="display:flex;flex-direction:column;align-items:center;gap:${gap};">`
        + `<div class="ws-pane-problem">${problemHtml}</div>${paneHtml}</div>`;
}

/* ------------------------------------------------------------------ compatibility (§S4.7) */

// Rules, most specific first. 'ok' = stack on one problem; 'wide' = stack only in a full-width
// (one-column) cell; 'clash' = never on one problem — mix them by section or problem by problem
// (owner ruling 2026-09-25). 'touchdots' stands for the S1 touch-dot glyphs.
const PAIR = {
    'startarrow|gridpaper': 'clash',    // grid paper already carries its own start arrow
    'pvgrid|gridpaper': 'clash',        // two place grids for one number
    'round-line|round-chart': 'clash',
    'steps|startarrow': 'ok',
};
const GROUPS = {
    count: { count: 'clash', place: 'clash', line: 'clash', array: 'clash', grid: 'clash', bar: 'clash', extra: 'ok', touchdots: 'clash' },
    place: { place: 'clash', line: 'clash', array: 'clash', grid: 'wide', bar: 'clash', extra: 'ok', touchdots: 'clash' },
    line: { line: 'clash', array: 'clash', grid: 'wide', bar: 'wide', extra: 'ok', touchdots: 'clash' },
    array: { array: 'clash', grid: 'clash', bar: 'clash', extra: 'ok', touchdots: 'clash' },
    grid: { grid: 'clash', bar: 'wide', extra: 'ok', touchdots: 'ok' },
    bar: { bar: 'clash', extra: 'ok', touchdots: 'ok' },
    extra: { extra: 'ok', touchdots: 'ok' },
    touchdots: {},
};
const groupOf = (id) => (id === 'touchdots' ? 'touchdots' : PANE_GROUP[id]);

/** Can supports x and y stand on the same problem? 'ok' | 'wide' | 'clash'. */
export function compat(x, y) {
    if (x === y) return x === 'touchdots' ? 'ok' : 'clash';
    const k1 = `${x}|${y}`, k2 = `${y}|${x}`;
    if (PAIR[k1]) return PAIR[k1];
    if (PAIR[k2]) return PAIR[k2];
    const gx = groupOf(x), gy = groupOf(y);
    if (!gx || !gy) return 'clash';
    return (GROUPS[gx] && GROUPS[gx][gy]) || (GROUPS[gy] && GROUPS[gy][gx]) || 'clash';
}

/** Can a whole set stack? Returns {ok, wide, clashes: [[x, y], ...]}. */
export function compatSet(ids) {
    const clashes = [];
    let wide = false;
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const r = compat(ids[i], ids[j]);
        if (r === 'clash') clashes.push([ids[i], ids[j]]);
        if (r === 'wide') wide = true;
    }
    return { ok: clashes.length === 0, wide, clashes };
}

/** A short label + id list, for a teacher panel or the catalogue. */
export const paneMenu = () => PANE_IDS.map((id) => ({ id, label: esc(PANES[id].label), grades: PANES[id].grades, ops: PANES[id].ops }));
