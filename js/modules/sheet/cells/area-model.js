// js/modules/sheet/cells/area-model.js
// The area model for 1-digit x multi-digit multiplication, template id `area-model`.
//
//          300     40      5        <- the expanded parts of the multiplicand, digit size
//       ┌───────┬───────┬───────┐
//     4 │ [   ] │ [   ] │ [   ] │   <- one partial-product box inside each part (SL-11)
//       └───────┴───────┴───────┘
//       4 × 345 = [      ]           <- the total, on one line that never wraps
//
// The model has a MINIMUM WIDTH: every part column is as wide as its label and its box need,
// and the row never wraps (white-space and flex-wrap off), so a narrow column can no longer
// stack the labels or pile the part boxes 2 + 1 (the critic's collapsed model, H-grade 4). The
// cell is measured (footprint.measure), so the page chooses fewer columns instead of squeezing
// it (PG-20: content never shrinks to fit). No colour: the parts are told apart by their
// dividing lines and labels (INK-1).
//
// The key writes every partial product in its box and the total in its box (AK-1).
//
// Payload: { multiplier, parts: number[], product?, uid? }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, HAIR } from './ops-common.js';
import { INK } from '../tokens.js';

/**
 * The online worksheet's card CSS forces `flex-wrap: wrap !important` on every inline
 * `display:flex` inside a problem card, except elements carrying this class (ui-components.css,
 * "exclude area model grids which must not wrap"). Every flex row of the model carries it, so a
 * 3-part model never wraps its label row or pushes the multiplier above the model on screen
 * (2026-09-25 regrade, worksheet-1280), and the labels stay over their columns.
 */
const NOWRAP = 'area-model-total-row';

const partialsOf = (p) => p.parts.map((v) => Number(p.multiplier) * Number(v));
const productOf = (p) => (p.product !== undefined ? Number(p.product) : partialsOf(p).reduce((s, n) => s + n, 0));
const multiplicandOf = (p) => p.parts.reduce((s, n) => s + Number(n), 0);

function keySlots(p) {
    const k = {};
    partialsOf(p).forEach((v, i) => { k[`part-${i}`] = String(v); });
    k.total = String(productOf(p));
    return k;
}

/** Width of a box that holds `n` digits at the digit size (em -> mm), never under Hw x 2. */
const boxMm = (g, n) => Math.max(g.writeMm * 2, (n * 0.62 + 0.7) * g.E);

register('area-model', {
    render(p, ctx) {
        const g = geo(ctx);
        const parts = p.parts.map(Number);
        const partials = partialsOf(p);
        const total = productOf(p);
        const ink = inkOf(ctx);
        const key = keySlots(p);
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            const o = {};
            // A single shown value is a total; a list is the parts, then the total.
            if (l.length === 1) o.total = l[0];
            else { parts.forEach((_, i) => { if (l[i] !== undefined) o[`part-${i}`] = l[i]; }); if (l[parts.length] !== undefined) o.total = l[parts.length]; }
            return o;
        });
        // Every part column is sized for the WIDEST partial product of the item, so the boxes
        // are one size and none of them tells the pupil how long its answer is (L-LEAK).
        const partDigits = Math.max(...partials.map((v) => String(v).length));
        const bw = boxMm(g, partDigits);
        const colMm = Math.max(bw + 6, ...parts.map((v) => String(v).length * 0.62 * g.E + 4));
        const hMm = g.stripMm + 8;
        const twin = g.twin;
        const uid = esc(p.uid || 'am');
        const partSlot = (i) => (twin
            ? `<input type="text" class="area-model-input" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-part-${i}" data-answer="${partials[i]}" data-ws-slot="part-${i}" data-ws-shape="box" aria-label="area of part ${i + 1}" `
                + `style="box-sizing:border-box;width:${g.em(bw)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
            : box(g, `part-${i}`, { wMm: bw, hMm: g.stripMm, value: vals[`part-${i}`] || '', ink, mark: null }));
        const labels = parts.map((v) => `<span style="flex:0 0 ${g.em(colMm)};text-align:center;font-weight:700">${esc(v)}</span>`).join('');
        const rects = parts.map((v, i) => `<span class="${NOWRAP}" style="flex:0 0 ${g.em(colMm)};height:${g.em(hMm)};box-sizing:border-box;display:flex;align-items:center;justify-content:center;`
            + `${i ? `border-left:${HAIR} solid ${INK.ink};` : ''}">${partSlot(i)}</span>`).join('');
        const mulMm = String(p.multiplier).length * 0.62 * g.E + 5;
        const totalW = boxMm(g, String(total).length + 1);
        const totalSlot = twin
            ? `<input type="text" class="area-model-total" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-total" data-answer="${total}" data-ws-slot="total" data-ws-shape="box" aria-label="total" `
                + `style="box-sizing:border-box;width:${g.em(totalW)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
            : box(g, 'total', { wMm: totalW, hMm: g.stripMm, value: vals.total || '', ink, mark: null });
        const model = `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;white-space:nowrap">`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;margin-left:${g.em(mulMm)};margin-bottom:0.1em">${labels}</div>`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center">`
            + `<span style="flex:0 0 ${g.em(mulMm)};text-align:center;font-weight:700">${esc(p.multiplier)}</span>`
            + `<span class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;border:${HAIR} solid ${INK.ink}">${rects}</span></div>`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center;gap:0.28em;margin-top:0.45em;white-space:nowrap">`
            + `<span>${esc(p.multiplier)}</span><span style="font-weight:700;width:1em;text-align:center">×</span><span>${esc(multiplicandOf(p))}</span>`
            + `<span style="font-weight:700;width:1em;text-align:center">=</span>${totalSlot}</div></div>`;
        return root(g, 'area-model', model, 'text-align:center;white-space:nowrap;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = keySlots(p);
        const slots = {};
        for (const [id, v] of Object.entries(k)) slots[id] = { value: v, graded: true };
        const total = productOf(p);
        return { value: total, display: total.toLocaleString('en-US'), slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const partials = partialsOf(p);
        const bw = boxMm(g, Math.max(...partials.map((v) => String(v).length)));
        const colMm = bw + 6;
        return {
            wMm: Math.ceil(p.parts.length * colMm + String(p.multiplier).length * 0.62 * g.E + 12),
            hMm: Math.ceil(g.E * 1.2 + g.stripMm + 8 + g.stripMm + 10),
            measure: true, factLike: false, maxCols: 2,
        };
    },
    inputs(p) {
        return p.parts.map((_, i) => ({ id: `part-${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }))
            .concat([{ id: 'total', kind: 'number', shape: 'box', graded: true, order: p.parts.length, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]);
    },
    layout() { return { card: 'card-wide-visual', checker: 'area-model', requiresVisual: true }; },
});
