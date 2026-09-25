// js/modules/sheet/cells/k2kit.js
// The drawing pieces the K-2 picture templates share (counters, tenframe, base10, bond,
// chartwindow, seqstrip, compare, wordpic). Nothing here registers a template.
//
// ONE DRAWING, TWO HOSTS (RP-2, SP-1). Every template draws in paper millimetres. On paper a
// length is written in `mm`; in the SCREEN TWIN (ctx.options.twin, see `k2Twin`) the same length
// is written as `calc(var(--mq-k2, 3.4px) * n)`, so the practice card, the online worksheet and
// the quiz draw the very same picture at a scale their stylesheet can set per breakpoint
// (`--mq-k2`: CSS px per paper millimetre). SVGs carry a viewBox in mm and `max-width:100%`, so
// a twin never pushes the page sideways at 390 px.
//
// THE SLOTS. A writing box carries `data-ws-slot` / `data-ws-shape` (the key and the lints read
// them). In the twin, a box the pupil writes in also carries the screen hook screen-cell.js
// already understands: `data-mq-blank="box"` (one answer: the host input takes the box's place)
// or `data-mq-cell="1"` (several answers: one input per box, joined ", " in reading order).
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { esc } from '../cell.js';
import { SIZES, DEFAULT_SIZE, blankWidth } from '../tokens.js';
import { renderCell } from '../registry.js';

export const PT_MM = 25.4 / 72;
/** Stroke widths of the closed set (INK-10), in mm. */
export const SW = Object.freeze({ fine: 0.5 * PT_MM, hair: 0.75 * PT_MM, one: PT_MM, heavy: 1.5 * PT_MM, rule: 2.25 * PT_MM });
export const INK = '#000';
export const GREY = '#949494';
export const n2 = (v) => +Number(v).toFixed(2);
/** TY-4 on written digits (the key's ink): the open-top 4 and tabular lining figures. */
export const KEY_FEATURES = "font-feature-settings:'cv04' 1;font-variant-numeric:lining-nums tabular-nums;";

export const isTwin = (ctx) => !!(ctx && ctx.options && ctx.options.twin);
export const sizeOf = (ctx) => (SIZES[ctx && ctx.size] ? ctx.size : DEFAULT_SIZE);
export const S = (ctx) => SIZES[sizeOf(ctx)];

/** A paper length (mm) in the host's unit. */
export const L = (ctx, mm) => (isTwin(ctx) ? `calc(var(--mq-k2, 3.4px) * ${n2(mm)})` : `${n2(mm)}mm`);
/** A point size in the host's unit. */
export const P = (ctx, pt) => (isTwin(ctx) ? L(ctx, pt * PT_MM) : `${n2(pt)}pt`);
/** A border width: the pt value on paper, never under 1 CSS px on screen (RP-2). */
export const B = (ctx, pt) => (isTwin(ctx) ? `${Math.max(1, Math.round(pt * 1.33))}px` : `${pt}pt`);

/** The ink a written value takes in the current state (INK-3: a trace is the single grey). */
export const inkOf = (ctx) => (ctx.state === 'traced' ? 'trace' : (ctx.state === 'answered' || ctx.state === 'wrong') ? 'solid' : null);
export const answered = (ctx) => ctx.state === 'answered' || ctx.state === 'traced';

/**
 * What a slot shows: nothing on the pupil page, the key's value on the key and in a trace, and
 * the finished-but-wrong work of Error analysis (`ctx.wrong`).
 */
export function slotValue(ctx, id, keyValue) {
    if (ctx.state === 'blank') return '';
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const v = w.slots && w.slots[id] !== undefined ? w.slots[id] : w.value;
        return v === undefined || v === null ? '' : String(v);
    }
    return keyValue === undefined || keyValue === null ? '' : String(keyValue);
}

/**
 * THE DRAWING-FIX SLOT (Error analysis of a build-the-number item, SKILL_CELL_CONTRACT.md).
 * With payload `fix: 'draw'` (or `ctx.options.fix === 'draw'`) a picture template that the pupil
 * DRAWS in (`base10`, `tenframe`) prints its finished work as usual and, under it, a second EMPTY
 * mat or frame captioned "Fix it:", the place to draw the number correctly (slot `fix`, shape
 * `draw`). The fix zone is filled with the right model on the key: when the cell is drawn in
 * the `answered` / `traced` state, or when the role marks its key render with
 * `ctx.options.fixKey` (Error analysis draws its work in state `wrong` on BOTH pages, so the state
 * alone cannot tell the key from the pupil page).
 */
export const fixDraw = (p, ctx) => (p && p.fix === 'draw') || !!(ctx && ctx.options && ctx.options.fix === 'draw');
export const fixFilled = (ctx) => !!(ctx && ctx.options && ctx.options.fixKey) || answered(ctx);
/** The "Fix it:" caption over a fix zone, at zone-label size. */
export const fixCaption = (ctx) => `<div style="font-size:${P(ctx, zonePt(ctx))};font-weight:700;line-height:1.5;text-align:left;">Fix it:</div>`;

/** The parts of a list-valued shown answer ("78, 84"), in reading order. */
export function shownParts(ctx, keyParts) {
    if (ctx.state === 'blank') return keyParts.map(() => '');
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value);
        const parts = raw.split(/\s*,\s*|\s+/).filter(Boolean);
        return keyParts.map((_, i) => (w.slots && w.slots[`b${i}`] !== undefined ? String(w.slots[`b${i}`]) : (parts[i] || '')));
    }
    return keyParts.map(String);
}

/** The digit a written value is drawn in: the working digit size (TY-10). */
export const digitPt = (ctx) => (ctx.metrics && ctx.metrics.digitPt) || S(ctx).digitPt;
export const textPt = (ctx) => (ctx.metrics && ctx.metrics.textPt) || S(ctx).textPt;
export const zonePt = (ctx) => (ctx.metrics && ctx.metrics.zonePt) || S(ctx).zonePt;

/** The K answer square (section 6: 16 / 20 / 24 mm) and the in-sentence box (B(n) x Hw + 4). */
export const squareMm = (ctx) => S(ctx).answerSquareMm;
export const inlineBoxMm = (ctx, digits = 2) => ({ w: blankWidth(digits, sizeOf(ctx)), h: S(ctx).writeMm + 4 });

/**
 * One writing box (SL-11: square outline, 1.25 mm corner). `mark` names the screen hook of the
 * twin: 'blank' (the one answer) or 'cell' (one of several). `pt` is the digit size written in it.
 */
export function box(ctx, { id = 'answer', value = '', w, h, mark = null, pt = null, graded = true, heavy = false, cls = '' } = {}) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const hook = isTwin(ctx) && mark ? (mark === 'cell' ? ' data-mq-cell="1"' : ' data-mq-blank="box"') : '';
    const size = pt || digitPt(ctx);
    return `<span class="k2-box${cls ? ` ${cls}` : ''}" data-ws-slot="${esc(id)}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}`
        + `${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:inline-flex;align-items:center;justify-content:center;`
        + `box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, h)};border:${B(ctx, heavy ? 1.5 : 0.75)} solid ${INK};`
        + `border-radius:${L(ctx, 1.25)};background:#fff;vertical-align:middle;font-size:${P(ctx, size)};font-weight:700;`
        + `line-height:1;color:${color};flex:none;${KEY_FEATURES}">${esc(value)}</span>`;
}

/** A check box (section 6: 5 / 6 / 7 mm); `on` draws the check mark in it. */
export function checkBox(ctx, { id = 'check', on = false, slot = true } = {}) {
    const side = S(ctx).checkMm;
    const ink = on ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const mark = on
        ? `<svg viewBox="0 0 20 20" style="display:block;width:100%;height:100%;" aria-hidden="true"><path d="M3.5 10.5l4.2 4.2L16.5 5.5" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : '';
    const a = slot ? ` data-ws-slot="${esc(id)}" data-ws-shape="check"` : ' data-k2-check="1"';
    return `<span${a}${ink ? ` data-ws-ink="${ink}"` : ''} style="display:inline-block;`
        + `box-sizing:border-box;width:${L(ctx, side)};height:${L(ctx, side)};border:${B(ctx, 0.75)} solid ${INK};`
        + `border-radius:${L(ctx, 1.25)};background:#fff;flex:none;">${mark}</span>`;
}

/** An SVG in paper millimetres, never wider than its host (RP-2). */
export function svg(ctx, w, h, body, { cls = '', label = '', attrs = '' } = {}) {
    const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
    return `<svg class="k2-svg${cls ? ` ${cls}` : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}"${a11y}${attrs} `
        + `style="display:block;width:${L(ctx, w)};height:auto;max-width:100%;overflow:visible;">${body}</svg>`;
}

/** The root of a K-2 cell: Andika, ink, centred. The twin also names itself for the host. */
export function root(ctx, cls, inner, { attrs = '', style = '' } = {}) {
    const twin = isTwin(ctx) ? ' data-mq-k2="1"' : '';
    return `<div class="k2-cell ${cls}"${twin}${attrs} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;`
        + `text-align:center;${style}">${inner}</div>`;
}

/* ------------------------------------------------------------------ objects (RP-20, RP-21) */

// One SVG primitive per plain counter kind, so the drawing can be recounted from its own
// elements (ws-content-audit's picture check): circle, square, triangle, star.
const OUT = (sw = SW.heavy) => `fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round"`;
export const SHAPES = Object.freeze({
    circle: { plural: 'circles', one: 'circle', draw: (cx, cy, d) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2 - SW.heavy / 2)}" ${OUT()}/>` },
    square: { plural: 'squares', one: 'square', draw: (cx, cy, d) => { const s = d * 0.86; return `<rect x="${n2(cx - s / 2)}" y="${n2(cy - s / 2)}" width="${n2(s)}" height="${n2(s)}" ${OUT()}/>`; } },
    triangle: {
        plural: 'triangles', one: 'triangle',
        draw: (cx, cy, d) => { const r = d / 2 - SW.heavy / 2; return `<polygon points="${n2(cx)},${n2(cy - r)} ${n2(cx + r)},${n2(cy + r * 0.8)} ${n2(cx - r)},${n2(cy + r * 0.8)}" ${OUT()}/>`; },
    },
    star: {
        plural: 'stars', one: 'star',
        draw: (cx, cy, d) => {
            const R = d / 2 - SW.heavy / 2, r = R * 0.44, pts = [];
            for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? r : R; pts.push(`${n2(cx + rr * Math.cos(a))},${n2(cy + 0.06 * d + rr * Math.sin(a))}`); }
            return `<path d="M${pts.join('L')}Z" ${OUT()}/>`;
        },
    },
    // The in-house line art of the K mock-up (design/mockups/pages/05), on a 24-unit grid:
    // 1.5 pt outline, 0.75 pt interior detail, no fill, no faces (RP-20).
    ball: {
        plural: 'balls', one: 'ball',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<circle cx="12" cy="12" r="10.6" ${o}/><path d="M5 4.05C9.4 8.4 9.4 15.6 5 19.95" ${i}/><path d="M19 4.05C14.6 8.4 14.6 15.6 19 19.95" ${i}/>`),
    },
    apple: {
        plural: 'apples', one: 'apple',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M12 8.2C10.2 5.8 3.2 5.6 3.2 12.6C3.2 18.2 7 22.4 9.6 22.4C10.8 22.4 11.2 21.7 12 21.7C12.8 21.7 13.2 22.4 14.4 22.4C17 22.4 20.8 18.2 20.8 12.6C20.8 5.6 13.8 5.8 12 8.2Z" ${o}/><path d="M12 8.2C12 5.8 12.5 3.6 13.6 1.8" ${o}/><path d="M13.2 5.3C14.8 3.1 17.8 2.9 19.2 3.7C18.2 5.9 15.2 6.7 13.2 5.3Z" ${i}/>`),
    },
    fish: {
        plural: 'fish', one: 'fish',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M1.6 12C5 2.6 13.5 2.4 17.6 10.4L22.4 5.2L22.4 18.8L17.6 13.6C13.5 21.6 5 21.4 1.6 12Z" ${o}/><path d="M8.8 6.4C10.6 9.8 10.6 14.2 8.8 17.6" ${i}/><circle cx="5.6" cy="10.2" r="0.9" fill="${INK}"/>`),
    },
});
function art(cx, cy, d, fn) {
    const s = d / 24;
    const o = `fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy / s)}" stroke-linejoin="round" stroke-linecap="round"`;
    const i = `fill="none" stroke="${INK}" stroke-width="${n2(SW.hair / s)}" stroke-linecap="round" stroke-linejoin="round"`;
    return `<g transform="translate(${n2(cx - d / 2)} ${n2(cy - d / 2)}) scale(${n2(s)})">${fn(o, i)}</g>`;
}
export const shapeOf = (id) => SHAPES[id] || SHAPES.circle;

/**
 * RINGABLE COUNTERS (RUBRIC H12, 2026-09-25 regrade): `n` counters of diameter `d` laid out in
 * RUNS of `size` - one run is one group to ring - with at least `gap` mm between two counters of
 * a run, a wider `runGap` between two runs on one line, and `rowGap` between lines, so a pencil
 * ring round one run never touches another counter. The last run holds what is left over (a
 * remainder). As many runs stand on a line as fit `maxW` mm (a 2-column cell), at least one;
 * when that makes more than `maxLines` lines, the runs use `wideW` (a one-column cell).
 * Returns the centres (mm, from 0,0) and the drawing's size.
 */
export function groupRuns(n, size, { d = 5, gap = 4, runGap = 9, rowGap = 7, maxW = 84, wideW = 176, maxLines = 4, pad = 0.5 } = {}) {
    const k = Math.max(1, Math.floor(Number(size)) || 1);
    const total = Math.max(0, Math.floor(Number(n)) || 0);
    const pitch = d + gap;
    const runW = (k - 1) * pitch + d;
    const fit = (w) => Math.max(1, Math.floor((w - 2 * pad + runGap) / (runW + runGap)));
    // Runs so long that the 2-column width would stack them into a tall column of more than
    // `maxLines` lines (six runs of 6) take the full one-column width instead (`wideW`),
    // several runs to a line; the page gives such an item a whole row (it is measured).
    const runsAll = Math.ceil(total / k);
    const perLine = Math.ceil(runsAll / fit(maxW)) > maxLines ? fit(wideW) : fit(maxW);
    const runs = runsAll;
    const lines = Math.max(1, Math.ceil(runs / perLine));
    const pts = [];
    for (let i = 0; i < total; i++) {
        const run = Math.floor(i / k), inRun = i % k;
        const line = Math.floor(run / perLine), slot = run % perLine;
        pts.push({ cx: pad + d / 2 + slot * (runW + runGap) + inRun * pitch, cy: pad + d / 2 + line * (d + rowGap) });
    }
    const across = Math.min(perLine, runs || 1);
    return { pts, w: 2 * pad + across * runW + (across - 1) * runGap, h: 2 * pad + lines * d + (lines - 1) * rowGap, runs, perLine };
}

/** A solid counter (INK-5: a solid fill is at most 7 mm across). */
export const dot = (cx, cy, d) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(Math.min(7, d) / 2)}" fill="${INK}"/>`;

/** A bold X through an object: the take-away mark. */
export const cross = (cx, cy, d) => {
    const r = d * 0.52;
    return `<path d="M${n2(cx - r)} ${n2(cy - r)}L${n2(cx + r)} ${n2(cy + r)}M${n2(cx + r)} ${n2(cy - r)}L${n2(cx - r)} ${n2(cy + r)}" `
        + `stroke="${INK}" stroke-width="${n2(SW.rule)}" stroke-linecap="round" fill="none"/>`;
};

/* ------------------------------------------------------------------ the screen twin */

/**
 * The screen twin of a kit cell: the same template drawn for the practice card, the online
 * worksheet and the quiz (`q.visual`). Paper millimetres become `--mq-k2` px, and each writing
 * box carries the screen hook screen-cell.js wires the host's input to.
 */
export function k2Twin(template, payload) {
    const html = renderCell({ cell: { template, payload, v: 1 } }, { mode: 'print', size: 'L', look: 'ican', state: 'blank', options: { twin: true } });
    return `<div class="k2-twin" data-mq-template="${esc(template)}" style="text-align:center;color:${INK};">${html}</div>`;
}
