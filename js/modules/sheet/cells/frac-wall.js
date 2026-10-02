// js/modules/sheet/cells/frac-wall.js
// The `frac-wall` template (3.NF.A.1): composing:compose_whole on paper, moved off its legacy cell
// (2026-09-26: the kit lint found slash fractions "1/2" in the tiles, italic text, and an answer
// key one page longer than the pupil sheet).
//
//   the whole   a bar labelled "1 whole", the length every row below is measured against
//   the wall    one row per piece size the item offers (halves, quarters ...), each row the whole
//               cut into its pieces, every piece labelled with its stacked unit fraction (TY-7)
//   the answer  one unit-fraction slot per piece the key uses: a printed 1 over a bar over a box,
//               so the pupil writes only the denominator (low writing load), joined by + and "= 1"
//
// Nothing prints the answer (RP-1): the wall offers every piece of each size, not the ones to use.
//
// payload: {dens: [2, 4], combo: [2, 4, 4]}   (combo = the key's denominators, in order)
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, n2, root, textPt, digitPt, pscale, sizeOf, inkOf, shownParts, KEY_FEATURES, isTwin } from './k2kit.js';

/** The whole's length (mm) at this size. */
const wholeMm = (ctx) => 76 * pscale(ctx);

/** A unit fraction stacked over its bar (TY-7), at `pt`. */
function stacked(ctx, n, d, pt) {
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.05;font-size:${P(ctx, pt)};font-weight:700;${KEY_FEATURES}">`
        + `<span>${esc(n)}</span><span style="display:block;align-self:stretch;min-width:0.8em;border-top:${B(ctx, 1)} solid ${INK};margin:0.05em 0;"></span><span>${esc(d)}</span></span>`;
}

/** One row of the wall: the whole cut into d pieces, each labelled 1/d. */
function wallRow(ctx, d, h, pt) {
    const w = wholeMm(ctx);
    const pieces = Array.from({ length: d }, () => `<div style="box-sizing:border-box;flex:none;width:${L(ctx, n2(w / d))};height:${L(ctx, h)};`
        + `border:${B(ctx, 0.75)} solid ${INK};margin-left:${B(ctx, -0.75)};display:flex;align-items:center;justify-content:center;background:#fff;">`
        + `${stacked(ctx, 1, d, pt)}</div>`).join('');
    return `<div style="display:flex;justify-content:center;padding-left:${B(ctx, 0.75)};">${pieces}</div>`;
}

/** The answer slot of one piece: a printed 1 over a bar over the box the denominator is written in. */
function unitSlot(ctx, i, value, pt) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const bw = 8 * pscale(ctx), bh = 8.5 * pscale(ctx);
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;flex:none;font-size:${P(ctx, pt)};font-weight:700;line-height:1.05;">`
        + `<span>1</span><span style="display:block;align-self:stretch;border-top:${B(ctx, 1.5)} solid ${INK};margin:${L(ctx, 0.6)} 0;"></span>`
        + `<span data-ws-slot="b${i}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${isTwin(ctx) ? ' data-mq-cell="1"' : ''} style="display:inline-flex;align-items:center;justify-content:center;`
        + `box-sizing:border-box;width:${L(ctx, bw)};height:${L(ctx, bh)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;`
        + `color:${ink === 'trace' ? GREY : INK};${KEY_FEATURES}">${esc(value)}</span></span>`;
}

register('frac-wall', {
    render(p, ctx) {
        const k = pscale(ctx);
        const w = wholeMm(ctx);
        const pt = Math.max(textPt(ctx), 10);
        const dp = Math.min(digitPt(ctx), 22);
        const dens = (p.dens || []).map(Number).filter((d) => d > 0);
        const combo = (p.combo || []).map(Number);
        const shown = shownParts(ctx, combo.map(String));
        const whole = `<div style="box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, 9 * k)};margin:0 auto;border:${B(ctx, 1.5)} solid ${INK};`
            + `display:flex;align-items:center;justify-content:center;font-size:${P(ctx, pt + 1)};font-weight:700;background:#fff;">1 whole</div>`;
        const wall = dens.map((d) => wallRow(ctx, d, 11 * k, Math.min(pt, d > 6 ? pt - 1 : pt))).join('');
        const parts = [];
        combo.forEach((_, i) => {
            if (i) parts.push(`<span style="flex:none;font-size:${P(ctx, dp)};font-weight:700;">+</span>`);
            parts.push(unitSlot(ctx, i, shown[i] || '', dp));
        });
        parts.push(`<span style="flex:none;font-size:${P(ctx, dp)};font-weight:700;">=</span><span style="flex:none;font-size:${P(ctx, dp)};font-weight:700;">1</span>`);
        const answer = `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:${L(ctx, 1.6 * k)};max-width:${L(ctx, w + 12)};margin:${L(ctx, 5 * k)} auto 0;">${parts.join('')}</div>`;
        return root(ctx, 'k2-fracwall', `<div style="display:inline-block;">${whole}<div style="margin-top:${L(ctx, 2 * k)};display:flex;flex-direction:column;gap:${L(ctx, 1.2 * k)};">${wall}</div>${answer}</div>`);
    },
    answerKey(p) {
        const combo = (p.combo || []).map(Number);
        const v = combo.map((d) => `1/${d}`).join(' + ');
        const slots = {};
        combo.forEach((d, i) => { slots[`b${i}`] = { value: String(d), graded: true }; });
        return { value: v, display: v, slots };
    },
    footprint(p, ctx) {
        const w = wholeMm(ctx || {}) + 8;
        return { wMm: Math.ceil(w), hMm: null, measure: true, factLike: false, maxCols: sizeOf(ctx || {}) === 'S' && w <= 62 ? 3 : w <= 93 ? 2 : 1 };
    },
    inputs(p) {
        return (p.combo || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export const FRAC_WALL_TEMPLATE = 'frac-wall';
