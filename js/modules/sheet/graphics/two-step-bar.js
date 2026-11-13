// js/modules/sheet/graphics/two-step-bar.js
// Library entry `twoStepBar` (design/GRAPHIC_LIBRARY.md; two-step card 2026-11-13, decision 4): the
// SCHEMATIC two-step bar model, WDS 18.1 / RP-70 / RP-71 / RP-72. A Step 1 bar (equal groups when the
// first step is × / ÷, part-whole when it is + / −) sits over a Step 2 bar whose whole or first part is
// the Step 1 answer; a 0.75 pt arrow labelled "Step 1 answer" runs from Step 1 to the cell that carries
// it. The bars stand side by side, the arrow between; in a narrower cell (a lesson's Guided cell, a phone)
// the arrow and the Step 2 bar wrap under the Step 1 bar together (one flex row; never shrunk). Each bar
// has exactly ONE unknown (card §3, LS-3 / RP-70): a solid cell with the zone-label `?` in its top-left
// corner, never dashed.
//
// Schematic and fixed (RP-72: a bar length never draws which number is bigger): equal groups are `n`
// equal segments (at most 6 drawn), a part-whole bar is split 60 / 40 (first part 60), whatever the
// numbers. Bars 10 / 12 / 14 mm tall (S / M / L, card decision 9), 1.5 pt outline (RP-70); one writing
// box a cell, 0.75 pt (VQ-6, lighter than the answer place), digits at the working size (ctx.metrics).
// Equal groups carry ONE box, in the first segment (the size of every group). The boxes are WORKING
// (`data-ws-graded="0"`): blank on the pupil page (RP-71: the pupil fills the numbers), every number
// written on the key and on a worked cell. Screen twin: the boxes are typed inputs (mq-wwork, scratch,
// `data-mq-expect` for the live mark); the drawing scrolls inside the cell when a phone is narrower.
//
// Content never shrinks to fit: the bar grows to hold its boxes (a segment is the box + the `?` room).
//
// Pure module (SCC-01).

import { INK, GREY, L, P, B, isTwin, sizeOf, digitPt, zonePt, esc, blankWidth, NUM_FEATURES } from './units.js';

export const TS_BAR_H = Object.freeze({ S: 10, M: 12, L: 14 });
/** The writing box height inside a bar (as the part-whole bar's). */
const BOX_H = Object.freeze({ S: 8, M: 9, L: 10 });
/** The room the zone-label `?` takes at the left of a cell (mm). */
const Q_ROOM = 3.5;
/** The caption column ("Step 1" / "Step 2") at the bars' left (mm). */
const CAP_W = Object.freeze({ S: 13, M: 15, L: 17 });
/** The arrow block between two bars standing side by side: "Step 1 / answer" over a → (mm). */
const ARROW_W = Object.freeze({ S: 12, M: 13, L: 15 });

const fmt = (n) => Number(n).toLocaleString('en-US');

/**
 * The two bars of a two-step story, as the descriptors the drawing uses. Each bar is
 * {kind: 'groups'|'whole', whole: cell, parts: [cell], n} where a cell is {v, unknown, carry}; a groups
 * bar draws `n` equal segments and ONE box (its parts[0]) in the first. Exactly one cell a bar is
 * `unknown`; the Step 1 answer is `carry` on bar 1 (where it is found) and on bar 2 (where it is used).
 * Null when `steps` is not two steps whose second uses the first's answer as its first number.
 */
export function twoStepBars(steps) {
    if (!Array.isArray(steps) || steps.length !== 2) return null;
    const [s1, s2] = steps;
    const r1 = s1.op === '/' ? s1.q : s1.ans;
    if (s1.op === '/' && s1.r) return null;
    // the Step 2 bar carries the Step 1 answer as its first number (the generator writes it so; checked here)
    const c2 = s2.op === '*' ? (s2.a === r1 ? s2.a : s2.b === r1 ? s2.b : null) : (s2.top === r1 ? s2.top : null);
    if (c2 === null || (s2.op === '/' && s2.r)) return null;
    const cap = (n) => Math.max(2, Math.min(6, Number(n) || 2));
    let bar1;
    if (s1.op === '*') bar1 = { kind: 'groups', n: cap(s1.a), whole: { v: s1.ans, unknown: true, carry: true }, parts: [{ v: s1.b }] };
    else if (s1.op === '/') bar1 = { kind: 'groups', n: cap(s1.bottom), whole: { v: s1.top }, parts: [{ v: s1.q, unknown: true, carry: true }] };
    else if (s1.op === '+') bar1 = { kind: 'whole', whole: { v: s1.ans, unknown: true, carry: true }, parts: [{ v: s1.top }, { v: s1.bottom }] };
    else bar1 = { kind: 'whole', whole: { v: s1.top }, parts: [{ v: s1.bottom }, { v: s1.ans, unknown: true, carry: true }] };
    let bar2;
    if (s2.op === '*') {
        const n = s2.a === r1 ? s2.b : s2.a;
        bar2 = { kind: 'groups', n: cap(n), whole: { v: s2.ans, unknown: true }, parts: [{ v: r1, carry: true }] };
    } else if (s2.op === '/') bar2 = { kind: 'groups', n: cap(s2.bottom), whole: { v: s2.top, carry: true }, parts: [{ v: s2.q, unknown: true }] };
    else if (s2.op === '+') bar2 = { kind: 'whole', whole: { v: s2.ans, unknown: true }, parts: [{ v: r1, carry: true }, { v: s2.bottom }] };
    else bar2 = { kind: 'whole', whole: { v: s2.top, carry: true }, parts: [{ v: s2.bottom }, { v: s2.ans, unknown: true }] };
    return [bar1, bar2];
}

/** Every value a bar box can hold (the widest sets the box width, so the boxes of a drawing are one width). */
const valuesOf = (bars) => bars.flatMap((b) => [b.whole.v, ...(b.kind === 'groups' ? [] : b.parts.map((c) => c.v))]);
/** The digits of a value. */
const nd = (v) => String(Math.abs(Number(v) || 0)).length;

/**
 * The drawing's geometry (mm), exported for the cell. Every box but an equal group's is one width (the widest number
 * of the drawing, never the answer's own length - L3); an equal group's box is as wide as the group's number (2-10).
 * `maxW` (the room the cell gives it): the two bars stand SIDE BY SIDE, the arrow between them, when they fit it
 * (half the height - the page keeps its stories, card decision 9); else one over the other, the arrow down.
 */
export function twoStepBarSize(ctx, steps, maxW = 0) {
    const bars = twoStepBars(steps);
    if (!bars) return null;
    const size = sizeOf(ctx);
    const lw = Math.max(14, blankWidth(Math.max(2, ...valuesOf(bars).map(nd)), size));
    const gw = (b) => Math.max(14, blankWidth(Math.max(1, nd(b.parts[0].v)), size));
    // a cell: its box, the `?` room when it is the unknown, and air
    // (a part-whole bar: each part holds its box - and the `?` room when it is the unknown - at 60 / 40 of the bar)
    const AIR = 1.5;
    const need = (b) => (b.kind === 'groups'
        ? b.n * (gw(b) + AIR + (b.parts[0].unknown ? Q_ROOM : 0))
        : Math.max((lw + AIR + Q_ROOM) * 1.05, (lw + AIR + (b.parts[0].unknown ? Q_ROOM : 0)) / 0.6, (lw + AIR + (b.parts[1].unknown ? Q_ROOM : 0)) / 0.4));
    const Ws = bars.map((b) => Math.max(48, need(b)));
    const segH = TS_BAR_H[size] || 14;
    const capW = CAP_W[size] || 17;
    const arrowW = ARROW_W[size] || 16;
    const twin = isTwin(ctx);
    const wide = Ws[0] + arrowW + Ws[1] + 3;
    // (side by side when the room given holds them; else the Step 2 bar wraps under - the drawing is one flex row)
    const across = Number(maxW) > 0 ? wide <= Number(maxW) : !twin;
    const capH = zonePt(ctx) * 0.3528 * 1.3;
    const hMm = across ? capH + 2 * segH + 1.2 : 2 * (capH + 2 * segH + 1.2) + 2;
    return { bars, lw, gw, Ws, segH, capW, arrowW, across, wMm: across ? wide : arrowW + 1.5 + Math.max(...Ws), hMm };
}

/**
 * @param {Object} ctx
 * @param {Object} o {steps (the word-work payload's two steps), show (write every number), ink, maxW (mm the cell gives)}
 */
export function twoStepBar(ctx, o = {}) {
    const g = twoStepBarSize(ctx, o.steps, o.maxW);
    if (!g) return '';
    const { show = false, ink = null } = o;
    const { bars, lw, gw, Ws, segH, arrowW } = g;
    const size = sizeOf(ctx);
    const twin = isTwin(ctx);
    const hw = BOX_H[size] || 10;
    const col = ink === 'trace' ? GREY : INK;
    const zp = zonePt(ctx);
    // a writing box (0.75 pt, working): blank for the pupil, its number on the key / a worked cell
    const box = (cell, id, w) => (twin
        ? `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(String(cell.v))}" data-ws-graded="0" inputmode="numeric" maxlength="4" autocomplete="off" spellcheck="false" aria-label="${cell.unknown ? 'bar number to find' : 'bar number'}" style="box-sizing:border-box;width:max(44px, ${L(ctx, w)});height:max(44px, ${L(ctx, hw)});border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, digitPt(ctx))};font-weight:700;text-align:center;padding:0;margin:0;">`
        : `<span data-ws-graded="0" data-ws-slot="${esc(id)}" data-ws-shape="box" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, w)};height:${L(ctx, hw)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;padding:0 ${L(ctx, 1)};color:${col};${NUM_FEATURES}"${show && ink ? ` data-ws-ink="${ink}"` : ''}>${show ? esc(fmt(cell.v)) : ''}</span>`);
    // the zone-label `?` in the unknown cell's top-left corner (RP-70 / LS-3)
    const qMark = `<span aria-hidden="true" data-ws-zone="unknown" style="position:absolute;left:${L(ctx, 0.8)};top:${L(ctx, 0.3)};font-size:${P(ctx, zp)};font-weight:700;line-height:1;color:${INK};">?</span>`;
    const segHcss = twin ? `max(50px, ${L(ctx, segH)})` : L(ctx, segH);
    // one outlined cell (1.5 pt, RP-70) w mm wide, holding its box (none: an equal group's other segments)
    const seg = (w, cell, id, first, bw) => `<span${cell && cell.unknown ? ' data-ws-unknown="1"' : ''} style="position:relative;flex:none;display:flex;align-items:center;justify-content:${cell && cell.unknown ? 'flex-end' : 'center'};box-sizing:border-box;width:${twin ? `max(${cell ? 56 : 14}px, ${L(ctx, w)})` : L(ctx, w)};height:${segHcss};border:${B(ctx, 1.5)} solid ${INK};${first ? '' : 'border-left:none;'}background:#fff;padding:0 ${L(ctx, 0.8)};">${cell && cell.unknown ? qMark : ''}${cell ? box(cell, id, bw) : ''}</span>`;
    const capt = (k) => `<span class="mq-ts2bar-cap" style="flex:none;font-size:${P(ctx, zp)};font-weight:700;line-height:1.3;">Step ${k}</span>`;
    const drawBar = (bar, k) => {
        const W = Ws[k - 1];
        const id = (x) => `ts${k}-${x}`;
        const whole = `<div style="display:flex;">${seg(W, bar.whole, id('w'), true, lw)}</div>`;
        const parts = bar.kind === 'groups'
            ? Array.from({ length: bar.n }, (_, i) => seg(W / bar.n, i === 0 ? bar.parts[0] : null, id('p0'), i === 0, gw(bar))).join('')
            : seg(0.6 * W, bar.parts[0], id('p0'), true, lw) + seg(0.4 * W, bar.parts[1], id('p1'), false, lw);
        const body = `<div style="flex:none;display:flex;flex-direction:column;gap:${L(ctx, 1.2)};">${whole}<div style="display:flex;">${parts}</div></div>`;
        return `<div class="mq-ts2bar-row" data-ts-bar="${k}" data-ts-kind="${bar.kind}" style="flex:none;display:flex;flex-direction:column;gap:${L(ctx, 0.4)};">${capt(k)}${body}</div>`;
    };
    const lab = (t) => `<span style="font-size:${P(ctx, zp)};font-weight:700;color:${INK};line-height:1.1;white-space:nowrap;">${t}</span>`;
    const b2 = bars[1];
    // → "Step 1 answer" into the Step 2 cell that carries it: level with the whole row, or with the parts row (its first part)
    const svg = `<svg aria-hidden="true" width="${L(ctx, arrowW - 2)}" height="${L(ctx, 3)}" viewBox="0 0 ${arrowW - 2} 3" style="flex:none;overflow:visible;">`
        + `<path d="M0.3 1.5 L${(arrowW - 2.4).toFixed(2)} 1.5 M${(arrowW - 3.6).toFixed(2)} 0.3 L${(arrowW - 2.3).toFixed(2)} 1.5 L${(arrowW - 3.6).toFixed(2)} 2.7" fill="none" stroke="${INK}" stroke-width="0.26" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const segHc = twin ? `max(50px, ${L(ctx, segH)})` : L(ctx, segH);
    const blk = `<div style="height:${segHc};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${L(ctx, 0.3)};">${lab('Step 1')}${lab('answer')}${svg}</div>`;
    const row = b2.whole.carry ? 0 : 1;
    const arrow = `<div class="mq-ts2bar-arrow" style="flex:none;width:${L(ctx, arrowW)};display:flex;flex-direction:column;gap:${L(ctx, 1.2)};padding-top:${L(ctx, zp * 0.3528 * 1.3 + 0.4)};">`
        + (row === 0 ? blk + `<div style="height:${segHc};"></div>` : `<div style="height:${segHc};"></div>` + blk) + '</div>';
    // The two bars stand side by side, the arrow between; where the cell is narrower (a lesson's Guided cell beside its
    // Steps, a phone card) the arrow and the Step 2 bar wrap UNDER the Step 1 bar together - the drawing never shrinks,
    // and the arrow still points into the bar that carries the Step 1 answer. The page measures the drawn height.
    return `<div class="mq-ts2bar-wrap" style="margin-top:${L(ctx, 1.5)};${twin ? 'text-align:left;max-width:100%;overflow-x:auto;' : ''}"><div class="mq-ts2bar" role="group" aria-label="two-step bar model" style="display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:${L(ctx, 1.5)};row-gap:${L(ctx, 2)};">`
        + `${drawBar(bars[0], 1)}<div style="flex:none;display:flex;align-items:flex-start;gap:${L(ctx, 1.5)};">${arrow}${drawBar(bars[1], 2)}</div></div></div>`;
}
