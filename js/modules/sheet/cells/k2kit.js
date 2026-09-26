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
import { stepMarks, singleSlotState, slotInks } from '../steps.js';

/* ----------------------------------------------------------- the scripted model's states (PT-MOD-1)
 * A K picture template draws the problem as it looks after step k of the provider's worked steps:
 * the answer slot from the steps' slot marks, and the WORKING from `work` marks - a step mark
 * `{slot: 'work', value: 'count ring'}` names what that step adds (count numerals on the objects,
 * a ring round the chosen picture, the start mark, the letters in a sorting ring ...). The newest
 * step's marks are grey (trace), earlier ones black (PAGE_TYPES 2.2).
 *   ctx.work       {token: 'trace' | 'solid'}
 *   ctx.stepSlots  {slotId: {value, ink}} for multi-box cells (the order boxes, a sort's counts)
 */
export function k2StepCtx(steps, k, ctx) {
    const marks = stepMarks(steps, k);
    const work = {};
    for (const m of marks) if (m.slot === 'work') for (const t of String(m.value).split(/\s+/)) if (t) work[t] = m.ink;
    const stepSlots = slotInks(marks, (s) => (s === 'work' ? null : s));
    return Object.assign({}, ctx, { state: singleSlotState(marks), work, stepSlots });
}
/** The ink of a work token in this state: 'trace' (newest), 'solid' (earlier) or '' (not yet). */
export const workInk = (ctx, token) => (ctx && ctx.work && ctx.work[token]) || '';
/** A ring round a drawing (a model's "this one" mark): grey and dashed when it is the newest mark. A
 *  negative margin the size of its padding and border keeps the drawing's box (a state row never grows). */
export function ringWrap(ctx, html, ink) {
    if (!ink) return html;
    const grey = ink === 'trace';
    return `<span data-ws-ink="${grey ? 'trace' : 'solid'}" style="display:inline-block;border:${B(ctx, 1.5)} ${grey ? 'dashed' : 'solid'} ${grey ? GREY : INK};`
        + `border-radius:${L(ctx, 6)};padding:${L(ctx, 1)};margin:${L(ctx, -1.53)};line-height:0;">${html}</span>`;
}
/** A multi-box cell's slot value in a model state (its ink as a state), else the normal shown value. */
export function stepSlot(ctx, id, fallback) {
    const s = ctx && ctx.stepSlots && ctx.stepSlots[id];
    if (!ctx || !ctx.stepSlots) return { value: fallback, ctx };
    return s ? { value: s.value, ctx: Object.assign({}, ctx, { state: s.ink === 'trace' ? 'traced' : 'answered' }) } : { value: '', ctx: Object.assign({}, ctx, { state: 'blank' }) };
}

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
    // O6 AP1 (2026-09-25): the fifth plain shape add_5_pictures has always dealt (its old ◆ glyph).
    diamond: {
        plural: 'diamonds', one: 'diamond',
        draw: (cx, cy, d) => { const r = d / 2 - SW.heavy / 2; return `<path d="M${n2(cx)} ${n2(cy - r)}L${n2(cx + r * 0.8)} ${n2(cy)}L${n2(cx)} ${n2(cy + r)}L${n2(cx - r * 0.8)} ${n2(cy)}Z" ${OUT()}/>`; },
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
    // O6 AP1 (2026-09-25): a fourth picture, so "Sort & Count" can deal four kinds of picture.
    // Five round petals round a centre on a short stem with one leaf; one outline path per part.
    flower: {
        plural: 'flowers', one: 'flower',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => {
            let petals = '';
            for (let k = 0; k < 5; k++) {
                const a = -Math.PI / 2 + k * 2 * Math.PI / 5;
                petals += `<circle cx="${n2(12 + 4.6 * Math.cos(a))}" cy="${n2(9.2 + 4.6 * Math.sin(a))}" r="3.3" ${o}/>`;
            }
            return `<path d="M12 14.4V23.2" ${o}/><path d="M12 20.2C13.4 17.6 16.4 16.8 18.6 17.4C17.6 19.8 14.6 20.8 12 20.2Z" ${i}/>`
                + `${petals}<circle cx="12" cy="9.2" r="2.4" ${o}/>`;
        }),
    },
    // Build lane k2 (2026-09-25): the pictures the match / sort / odd-one-out / size / heavy-light
    // skills need, on the same 24-unit grid (1.5 pt outline, 0.75 pt interior detail, no fill but
    // paper, no faces, no text). `h` is a 1.5 pt stroke with no fill (a handle, a stem, a string).
    car: {
        plural: 'cars', one: 'car',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M1.8 16V12.4Q1.8 10.6 3.6 10.6H6.6L9.4 6.2H15.6L18.6 10.6H20.4Q22.2 10.6 22.2 12.4V16Z" ${o}/>`
            + `<path d="M12.3 6.6V10.6M3.2 10.6H21" ${i}/><circle cx="7" cy="16.6" r="2.7" ${o}/><circle cx="17" cy="16.6" r="2.7" ${o}/>`),
    },
    house: {
        plural: 'houses', one: 'house',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M5.4 10.2H18.6V22H5.4Z" ${o}/><path d="M2.6 11.2L12 2.6L21.4 11.2Z" ${o}/>`
            + `<path d="M10.2 22V16.2H13.8V22M15.4 13.2H17.4V15.2H15.4Z" ${i}/>`),
    },
    tree: {
        plural: 'trees', one: 'tree',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M10.4 15H13.6V22.6H10.4Z" ${o}/><circle cx="12" cy="9.6" r="7.4" ${o}/>`
            + `<path d="M12 15.4V11.4M12 12.6L9.6 10.4M12 13.4L14.6 11" ${i}/>`),
    },
    boat: {
        plural: 'boats', one: 'boat',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i, h) => `<path d="M12 15V2.4" ${h}/><path d="M12.9 3.6L19.4 13.4H12.9Z" ${o}/>`
            + `<path d="M2 15H22L18.6 21H5.4Z" ${o}/><path d="M4.2 18H19.8" ${i}/>`),
    },
    cup: {
        plural: 'cups', one: 'cup',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i, h) => `<path d="M16 9.2Q21 9.2 21 12.6Q21 16 16 16" ${h}/>`
            + `<path d="M4.4 6.4H16.2V16.4Q16.2 20.4 12.2 20.4H8.4Q4.4 20.4 4.4 16.4Z" ${o}/><path d="M3 22.2H17.6" ${h}/>`),
    },
    hat: {
        plural: 'hats', one: 'hat',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M6.4 16.6V9Q6.4 5.6 9.8 5.6H14.2Q17.6 5.6 17.6 9V16.6Z" ${o}/>`
            + `<path d="M1.8 17.2Q12 21.8 22.2 17.2Q12 13.6 1.8 17.2Z" ${o}/><path d="M6.4 12.8H17.6" ${i}/>`),
    },
    leaf: {
        plural: 'leaves', one: 'leaf',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i, h) => `<path d="M11.4 20.6L8.6 23.4" ${h}/>`
            + `<path d="M11.4 20.6Q2.6 16.4 4.8 8.8Q8 2.4 20.2 2Q21.4 13.4 11.4 20.6Z" ${o}/>`
            + `<path d="M11.4 20.6Q12.6 11.8 18.2 4.6M9.6 14.2L13.8 13.4M8.8 10L14.6 9.6" ${i}/>`),
    },
    feather: {
        plural: 'feathers', one: 'feather',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i, h) => `<path d="M6.2 19.6Q3.6 10.8 10.6 5Q15.8 1.2 20.4 1.8Q20.6 7.4 16.4 12.8Q11.8 18.6 6.2 19.6Z" ${o}/>`
            + `<path d="M3 22.8L17.6 5" ${h}/><path d="M9.6 14.6L7.4 12.6M12.2 11.4L10.6 8.6M14.6 8.6L13.8 5.8M11 13L15.4 14.2M13.6 9.8L17.8 10.4" ${i}/>`),
    },
    rock: {
        plural: 'rocks', one: 'rock',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M2.6 18.2Q2 12.2 6.6 9Q8.8 5.2 13.8 6.2Q19.6 6.6 21.2 12.2Q22.6 18.6 17.6 19.8H5.8Q2.8 19.8 2.6 18.2Z" ${o}/>`
            + `<path d="M8.6 12.4Q10.6 11 12.2 13.2M15 10.2Q16.6 10.6 17.2 12.4" ${i}/>`),
    },
    balloon: {
        plural: 'balloons', one: 'balloon',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i, h) => `<path d="M12 18.8Q9.8 21 12.2 23.4" ${h}/>`
            + `<path d="M12 1.8Q19.2 1.8 19.2 9.4Q19.2 15.6 12 17.4Q4.8 15.6 4.8 9.4Q4.8 1.8 12 1.8Z" ${o}/>`
            + `<path d="M10.8 17.2H13.2L12 18.8Z" ${o}/><path d="M8.2 6.6Q9 4.6 11 4.2" ${i}/>`),
    },
    heart: {
        plural: 'hearts', one: 'heart',
        draw: (cx, cy, d) => art(cx, cy, d, (o) => `<path d="M12 21Q2.4 14.4 2.4 8.4Q2.4 3.4 7.4 3.4Q10.4 3.4 12 6.6Q13.6 3.4 16.6 3.4Q21.6 3.4 21.6 8.4Q21.6 14.4 12 21Z" ${o}/>`),
    },
    moon: {
        plural: 'moons', one: 'moon',
        draw: (cx, cy, d) => art(cx, cy, d, (o) => `<path d="M14.6 1.8C5.6 2.8 2 8.6 2 12C2 16 5.4 21.6 14.6 22.2C9.8 19.4 8 15.8 8 12C8 8.2 9.8 4.4 14.6 1.8Z" ${o}/>`),
    },
    brick: {
        plural: 'bricks', one: 'brick',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M1.6 8.4H22.4V17.6H1.6Z" ${o}/>`
            + `<path d="M1.6 13H22.4M8.6 8.4V13M16 8.4V13M5 13V17.6M12.2 13V17.6M19.4 13V17.6" ${i}/>`),
    },
    pencil: {
        plural: 'pencils', one: 'pencil',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M1.4 10.4H18.4L22.8 12L18.4 13.6H1.4Z" ${o}/>`
            + `<path d="M18.4 10.4V13.6M5.2 10.4V13.6M21.2 11.4V12.6" ${i}/>`),
    },
    sock: {
        plural: 'socks', one: 'sock',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M7.6 1.8H15.6V13.2L19.4 16.8Q21.4 19 19.8 21Q18 22.8 15.6 21.2L8.8 15.6Q7.6 14.6 7.6 13Z" ${o}/>`
            + `<path d="M7.6 5.2H15.6" ${i}/>`),
    },
});

/**
 * The paint of one picture. `o` outlines a part (paper inside), `i` draws interior detail, `h` a
 * heavy stroke with no fill (a handle, a stem, a string). With `sil` the whole picture is a
 * SILHOUETTE: every part filled in the single grey with no stroke (INK-3 (a): a shaded shape; no
 * grey stroke is drawn, so INK-4 does not arise), interior detail dropped.
 */
let _sil = false;
function art(cx, cy, d, fn) {
    const s = d / 24;
    const sil = _sil;
    const o = sil ? `fill="${GREY}" stroke="none"`
        : `fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy / s)}" stroke-linejoin="round" stroke-linecap="round"`;
    const i = sil ? 'fill="none" stroke="none"'
        : `fill="none" stroke="${INK}" stroke-width="${n2(SW.hair / s)}" stroke-linecap="round" stroke-linejoin="round"`;
    // A silhouette keeps its heavy strokes (a handle, a string) as 1 pt grey lines (INK-4).
    const h = sil ? `fill="none" stroke="${GREY}" stroke-width="${n2(SW.one / s)}" stroke-linecap="round"`
        : `fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy / s)}" stroke-linecap="round" stroke-linejoin="round"`;
    return `<g transform="translate(${n2(cx - d / 2)} ${n2(cy - d / 2)}) scale(${n2(s)})">${fn(o, i, h)}</g>`;
}

/**
 * A picture drawn as a grey SILHOUETTE (match the picture to its shadow). Works for every entry of
 * SHAPES: the plain shapes and the line art alike are recoloured, never redrawn, so the shadow is
 * exactly the outline of the picture it matches.
 */
export function silhouette(id, cx, cy, d) {
    _sil = true;
    let out;
    try { out = shapeOf(id).draw(cx, cy, d); } finally { _sil = false; }
    // the plain shapes (circle, square, ...) do not go through art(): recolour their outline
    return out.replace(/fill="#fff" stroke="#000" stroke-width="[\d.]+"/g, `fill="${GREY}" stroke="none"`)
        .replace(/fill="#000"/g, `fill="${GREY}"`);
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

/**
 * R3 (critic round 3): counters in a NEUTRAL array, so the picture never makes the groups for the
 * pupil. Rows are `cols` long where `cols` is chosen so a row is never a whole number of groups
 * and a group is never a whole number of rows (7, 6, 5 or 8 across); the pitch is wide enough
 * (d + gap across, d + rowGap down) for a pencil ring to pass between two counters, including a
 * ring that turns a row end. Same return shape as groupRuns.
 */
export function looseArray(n, size, { d = 5, gap = 5, rowGap = 8, pad = 0.5, maxCols = 8, order = [7, 6, 5, 8], maxRows = 4 } = {}) {
    const k = Math.max(1, Math.floor(Number(size)) || 1);
    const total = Math.max(0, Math.floor(Number(n)) || 0);
    const ok = order.filter((c) => c <= maxCols && c % k !== 0 && k % c !== 0);
    let cols = ok.find((c) => Math.ceil(total / c) <= maxRows) || ok[0] || 7;
    cols = Math.min(cols, Math.max(1, total));
    const pitch = d + gap, rowPitch = d + rowGap;
    const rows = Math.max(1, Math.ceil(total / cols));
    const pts = [];
    for (let i = 0; i < total; i++) pts.push({ cx: pad + d / 2 + (i % cols) * pitch, cy: pad + d / 2 + Math.floor(i / cols) * rowPitch });
    return { pts, w: 2 * pad + (cols - 1) * pitch + d, h: 2 * pad + (rows - 1) * rowPitch + d, cols, rows };
}

/** A solid counter (INK-5: a solid fill is at most 7 mm across). */
export const dot = (cx, cy, d) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(Math.min(7, d) / 2)}" fill="${INK}"/>`;

/** A bold X through an object: the take-away mark. */
export const cross = (cx, cy, d) => {
    const r = d * 0.52;
    return `<path d="M${n2(cx - r)} ${n2(cy - r)}L${n2(cx + r)} ${n2(cy + r)}M${n2(cx + r)} ${n2(cy - r)}L${n2(cx - r)} ${n2(cy + r)}" `
        + `stroke="${INK}" stroke-width="${n2(SW.rule)}" stroke-linecap="round" fill="none"/>`;
};

/* ------------------------------------------------------------------ build lane k2 (2026-09-25) */

/** Picture scale per size (O6: the drawings scale with S / M / L, the text and slots already do). */
export const pscale = (ctx) => ({ S: 0.8, M: 0.9, L: 1 })[sizeOf(ctx)] || 1;

/** The letters that tag the choices of a picture row (A, B, C ...). */
export const LETTERS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);

/**
 * Which choice a state checks: the key's (`p.correct`), the wrong work's (ctx.wrong.value names a
 * letter or a label), or none on the pupil page.
 */
export function checkedChoice(p, ctx, labels) {
    if (ctx.state === 'blank') return -1;
    if (ctx.state === 'wrong') {
        const w = String((ctx.wrong && ctx.wrong.value) || '').trim().toLowerCase();
        const i = (labels || []).findIndex((v) => String(v).toLowerCase() === w);
        return i >= 0 ? i : ((p.correct || 0) + 1) % Math.max(2, (labels || []).length);
    }
    return p.correct || 0;
}

/**
 * THE CHECK-BOX CHOICE ROW (P-TH-11, a check box is the response; never multiple choice on
 * screen only, SP-3): each choice is a picture (or a word) with its label, and a check box UNDER
 * it. The whole row is ONE answer slot (`data-ws-slot="answer"`, shape check), so the key checks
 * one box (AK-2) and Error analysis checks the wrong one.
 *
 * THE SCREEN TWIN needs nothing new: each choice is a div of exactly two spans - [the picture and
 * its label] then [the empty bordered box] - which is the shape screen-cell.js `wireTickBoxes`
 * turns into one tap target per choice (the picture is part of the target). The host's answer is
 * the choice's label (`q.printAnswer`).
 *
 * choices: [{pic: html, label: 'A'}], on: the checked index (-1 none), vertical: a list of word
 * choices (a bank), each box on the right of its word (the compare cell's form).
 */
export function choiceRow(ctx, choices, { on = -1, gapMm = 7, vertical = false, labelPt = null, labelW = null, ring = null } = {}) {
    const lp = labelPt || textPt(ctx) + 2;
    // a model state's ring round the chosen one (ring = {index, ink}, from ctx.work)
    const ringed = (i, html) => (ring && ring.ink && ring.index === i ? ringWrap(ctx, html, ring.ink) : html);
    const cols = choices.map((c, i) => {
        const box = checkBox(ctx, { id: `c${i}`, on: on === i, slot: false });
        if (vertical) {
            return `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, 1.5)} 0;">`
                + `<span style="flex:none;${labelW ? `width:${L(ctx, labelW)};` : ''}display:inline-flex;align-items:center;gap:${L(ctx, 2)};white-space:nowrap;text-align:left;font-size:${P(ctx, lp)};">`
                + `${ringed(i, `${c.pic || ''}${esc(c.label)}`)}</span>${box}</div>`;
        }
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">`
            + `<span style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};font-size:${P(ctx, lp)};font-weight:700;line-height:1;">`
            + `${c.pic ? ringed(i, c.pic) : ''}${c.pic ? esc(c.label) : ringed(i, esc(c.label))}</span>${box}</div>`;
    }).join('');
    // A traced Model marks only the check in grey (the box carries its own trace ink): a trace ink
    // on the whole row would grey the pictures and their labels too (practice.js INK-3 rule).
    // Error analysis draws the finished work in pupil-writing grey through the slot's ink, so a
    // wrong row carries none either: only its check mark is the pupil's (the labels stay black).
    const ink = on >= 0 && ctx.state === 'answered' ? ' data-ws-ink="solid"' : '';
    // a row of choices is ONE line on paper and on screen (critic k2-r1: a row that wraps 2 + 1 on
    // a worksheet card breaks the comparison); data-mq-nowrap tells the screen fit to shrink the
    // drawing instead of wrapping it
    return `<div class="k2-choices" data-ws-slot="answer" data-ws-shape="check"${ink}${vertical ? '' : ' data-mq-nowrap="1"'} style="display:${vertical ? 'inline-block' : 'flex'};`
        + `${vertical ? 'text-align:left;' : `justify-content:center;align-items:flex-end;gap:${L(ctx, gapMm)};flex-wrap:nowrap;`}font-weight:700;">${cols}</div>`;
}

/**
 * A number track `from`..`to` (at most 21 boxes) drawn as ONE path, so no box is counted as an
 * object (the count_objects hint strip, starting at 0 for "zero means none").
 */
export function numberTrack(ctx, from, to, { maxW = 90 } = {}) {
    const t = Math.max(1, to - from + 1);
    const cw = Math.min(6.5, maxW / t), h = 6.5;
    let d = `M0.5 0.5h${n2(t * cw)}v${h}h${n2(-t * cw)}Z`;
    for (let k = 1; k < t; k++) d += `M${n2(0.5 + k * cw)} 0.5v${h}`;
    let body = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let k = 0; k < t; k++) {
        body += `<text x="${n2(0.5 + (k + 0.5) * cw)}" y="${n2(0.5 + h * 0.7)}" text-anchor="middle" font-size="${n2(Math.min(3.4, cw * 0.62))}" `
            + `font-family="Andika, sans-serif" fill="${INK}">${from + k}</text>`;
    }
    return svg(ctx, t * cw + 1, h + 1, body, { label: `number track ${from} to ${to}` });
}

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
