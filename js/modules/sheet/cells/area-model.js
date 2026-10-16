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
import { stepMarks, slotInks, WHOLE_SLOTS } from '../steps.js';

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

/* ---------------------------------------------------------------------------------------------
 * r12 (owner 2026-10-16): the EXTENDED model. Two payload fields switch it on; a payload with
 * neither renders exactly as before (the branches above), so saved sheets and share codes keep
 * today's output byte for byte.
 *   rows: number[]     the side's expanded parts (a 2 x 2 or 2 x 3 grid: area_model_mult_hard)
 *   edges: 'blank'     "Numbers around the box: Pupil writes them" - every edge number (the
 *                      top parts AND the side parts) is a box the pupil fills first, then the
 *                      areas, then the total. The key writes them all (AK-1).
 * Slots: top-<c>, side-<r>, part-<r * cols + c> (row-major: a one-row model keeps part-<i>), total.
 * ------------------------------------------------------------------------------------------- */
const isExt = (p) => Array.isArray(p.rows) || p.edges === 'blank';
const rowsOf = (p) => (Array.isArray(p.rows) && p.rows.length ? p.rows.map(Number) : [Number(p.multiplier)]);
const extPartials = (p) => { const R = rowsOf(p), C = p.parts.map(Number); return R.flatMap((r) => C.map((c) => r * c)); };
const extTotal = (p) => (p.product !== undefined ? Number(p.product) : extPartials(p).reduce((s, n) => s + n, 0));
function extKey(p) {
    const k = {};
    const blank = p.edges === 'blank';
    if (blank) p.parts.forEach((v, c) => { k[`top-${c}`] = String(v); });
    if (blank) rowsOf(p).forEach((v, r) => { k[`side-${r}`] = String(v); });
    extPartials(p).forEach((v, i) => { k[`part-${i}`] = String(v); });
    k.total = String(extTotal(p));
    return k;
}
function extGeom(p, g) {
    const R = rowsOf(p), C = p.parts.map(Number);
    const blank = p.edges === 'blank';
    const partials = extPartials(p);
    const bw = boxMm(g, Math.max(...partials.map((v) => String(v).length)));
    // One edge-box width for every edge of the item, so no box tells the length of its part (L-LEAK).
    const ew = boxMm(g, Math.max(...R.concat(C).map((v) => String(v).length)));
    const colMm = Math.max(bw + 6, blank ? ew + 4 : 0, ...C.map((v) => String(v).length * 0.62 * g.E + 4));
    const sideMm = blank ? ew + 3 : Math.max(...R.map((v) => String(v).length)) * 0.62 * g.E + 5;
    const hMm = g.stripMm + 8;
    const work = !g.twin && partials.length >= 2;
    return { R, C, blank, partials, bw, ew, colMm, sideMm, hMm, work };
}
function extFootprint(p, ctx) {
    const g = geo(ctx);
    const G = extGeom(p, g);
    const labelH = G.blank ? g.stripMm + 1 : g.E * 1.2;
    const workH = G.work ? G.R.length * (g.stripMm + 0.45 * g.E) + 3 : 0;
    const workW = G.work ? G.C.length * G.bw + (G.C.length) * g.E : 0;
    return {
        wMm: Math.ceil(Math.max(G.C.length * G.colMm, workW) + G.sideMm + 12),
        hMm: Math.ceil(labelH + G.R.length * G.hMm + workH + g.stripMm + 10 + (g.twin ? 0 : 3)),
        measure: true, factLike: false, maxCols: 2,
    };
}
function extInputs(p) {
    const out = [];
    let o = 0;
    if (p.edges === 'blank') {
        p.parts.forEach((_, c) => out.push({ id: `top-${c}`, kind: 'number', shape: 'box', graded: true, order: o++, inputmode: 'numeric', scopes: ['full'] }));
        rowsOf(p).forEach((_, r) => out.push({ id: `side-${r}`, kind: 'number', shape: 'box', graded: true, order: o++, inputmode: 'numeric', scopes: ['full'] }));
    }
    extPartials(p).forEach((_, i) => out.push({ id: `part-${i}`, kind: 'number', shape: 'box', graded: true, order: o++, inputmode: 'numeric', scopes: ['full'] }));
    out.push({ id: 'total', kind: 'number', shape: 'box', graded: true, order: o, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
    return out;
}
function renderExt(p, ctx, wMm) {
    const g = geo(ctx);
    const G = extGeom(p, g);
    const { R, C, blank, partials, bw, ew, colMm, sideMm, hMm } = G;
    const total = extTotal(p);
    const ink = inkOf(ctx);
    const key = extKey(p);
    const order = Object.keys(key);
    const vals = slotValues(ctx, key, (w) => {
        const l = splitList(w);
        const o = {};
        if (l.length === 1) o.total = l[0];
        else order.forEach((id, i) => { if (l[i] !== undefined) o[id] = l[i]; });
        return o;
    });
    const twin = g.twin;
    const uid = esc(p.uid || 'am');
    const sv = ctx.stepVals || null;
    const vAt = (id) => (sv ? ((sv[id] && sv[id].value) || '') : vals[id] || '');
    const iAt = (id) => (sv ? ((sv[id] && sv[id].ink) || null) : ink);
    const slot = (id, cls, ans, w, aria) => (twin
        ? `<input type="text" class="${cls}" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-${id}" data-answer="${ans}" data-ws-slot="${id}" data-ws-shape="box" aria-label="${aria}" `
            + `style="box-sizing:border-box;width:${g.em(w)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
        : box(g, id, { wMm: w, hMm: g.stripMm, value: vAt(id), ink: iAt(id), mark: null }));
    const top = C.map((v, c) => `<span class="${NOWRAP}" style="flex:0 0 ${g.em(colMm)};display:flex;justify-content:center;text-align:center;font-weight:700">`
        + `${blank ? slot(`top-${c}`, 'area-model-input', v, ew, `top part ${c + 1}`) : esc(v)}</span>`).join('');
    const rowHtml = R.map((rv, r) => {
        const side = blank ? slot(`side-${r}`, 'area-model-input', rv, ew, `side part ${r + 1}`) : esc(rv);
        const rects = C.map((_, c) => {
            const i = r * C.length + c;
            return `<span class="${NOWRAP}" style="flex:0 0 ${g.em(colMm)};height:${g.em(hMm)};box-sizing:border-box;display:flex;align-items:center;justify-content:center;`
                + `${c ? `border-left:${HAIR} solid ${INK.ink};` : ''}${r ? `border-top:${HAIR} solid ${INK.ink};` : ''}">${slot(`part-${i}`, 'area-model-input', partials[i], bw, `area of part ${i + 1}`)}</span>`;
        }).join('');
        return `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center">`
            + `<span class="${NOWRAP}" style="flex:0 0 ${g.em(sideMm)};display:flex;justify-content:center;text-align:center;font-weight:700">${side}</span>`
            + `<span class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;border:${HAIR} solid ${INK.ink};${r ? 'border-top:0;' : ''}">${rects}</span></div>`;
    }).join('');
    // The work row (R3): one line per grid row, every area on its own line to add.
    const workRow = !G.work ? '' : R.map((_, r) => `<div class="${NOWRAP}" data-mq-amwork="1" style="display:flex;flex-wrap:nowrap;align-items:flex-end;gap:0.28em;margin-top:0.45em;margin-left:${g.em(sideMm - (r ? g.E * 1.28 : 0))}">`
        + C.map((_, c) => {
            const i = r * C.length + c;
            const v = sv ? '' : vAt(`part-${i}`);
            const wink = iAt(`part-${i}`);
            const fill = v && wink ? `<span data-ws-ink="${wink}" style="font-weight:${wink === 'trace' ? 400 : 700};color:${wink === 'trace' ? INK.grey : INK.ink}">${esc(v)}</span>` : '';
            return `${i ? '<span style="font-weight:700;width:1em;text-align:center">+</span>' : ''}`
                + `<span style="display:inline-flex;justify-content:center;align-items:flex-end;width:${g.em(bw)};height:${g.em(g.stripMm)};border-bottom:${HAIR} solid ${INK.ink};line-height:1.1">${fill}</span>`;
        }).join('') + '</div>').join('');
    const A = R.reduce((s, n) => s + n, 0), B = C.reduce((s, n) => s + n, 0);
    const totalSlot = slot('total', 'area-model-total', total, boxMm(g, String(total).length + 1), 'total');
    const model = `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;white-space:nowrap${twin ? '' : `;padding-top:${g.em(3)}`}">`
        + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:flex-end;margin-left:${g.em(sideMm)};margin-bottom:0.1em">${top}</div>`
        + rowHtml + workRow
        + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center;gap:0.28em;margin-top:0.45em;white-space:nowrap">`
        + `<span>${esc(A)}</span><span style="font-weight:700;width:1em;text-align:center">×</span><span>${esc(B)}</span>`
        + `<span style="font-weight:700;width:1em;text-align:center">=</span>${totalSlot}</div></div>`;
    return root(g, 'area-model', model, 'text-align:center;white-space:nowrap;', wMm);
}

register('area-model', {
    render(p, ctx) {
        if (isExt(p)) return renderExt(p, ctx, this.footprint(p, ctx).wMm);
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
        // S5 step state (stepState below): {slot: {value, ink}} replaces the state's one ink.
        const sv = ctx.stepVals || null;
        const vAt = (id) => (sv ? ((sv[id] && sv[id].value) || '') : vals[id] || '');
        const iAt = (id) => (sv ? ((sv[id] && sv[id].ink) || null) : ink);
        const partSlot = (i) => (twin
            ? `<input type="text" class="area-model-input" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-part-${i}" data-answer="${partials[i]}" data-ws-slot="part-${i}" data-ws-shape="box" aria-label="area of part ${i + 1}" `
                + `style="box-sizing:border-box;width:${g.em(bw)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
            : box(g, `part-${i}`, { wMm: bw, hMm: g.stripMm, value: vAt(`part-${i}`), ink: iAt(`part-${i}`), mark: null }));
        const labels = parts.map((v) => `<span style="flex:0 0 ${g.em(colMm)};text-align:center;font-weight:700">${esc(v)}</span>`).join('');
        const rects = parts.map((v, i) => `<span class="${NOWRAP}" style="flex:0 0 ${g.em(colMm)};height:${g.em(hMm)};box-sizing:border-box;display:flex;align-items:center;justify-content:center;`
            + `${i ? `border-left:${HAIR} solid ${INK.ink};` : ''}">${partSlot(i)}</span>`).join('');
        const mulMm = String(p.multiplier).length * 0.62 * g.E + 5;
        const totalW = boxMm(g, String(total).length + 1);
        const totalSlot = twin
            ? `<input type="text" class="area-model-total" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-total" data-answer="${total}" data-ws-slot="total" data-ws-shape="box" aria-label="total" `
                + `style="box-sizing:border-box;width:${g.em(totalW)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
            : box(g, 'total', { wMm: totalW, hMm: g.stripMm, value: vAt('total'), ink: iAt('total'), mark: null });
        // R3 (critic round 3): on paper the parts are ADDED on a work row under the model -
        // "___ + ___ + ___" with one line per part - so the pupil has somewhere to add the
        // partial products before writing the total (the key writes them in). The screen twin
        // keeps its own total input and no work row.
        const workRow = twin || parts.length < 2 ? '' : `<div class="${NOWRAP}" data-mq-amwork="1" style="display:flex;flex-wrap:nowrap;align-items:flex-end;gap:0.28em;margin-top:0.45em;margin-left:${g.em(mulMm)}">`
            + parts.map((_, i) => {
                // A step-by-step anchor (stepVals) fills the part boxes one step at a time; its
                // work row stays empty so each step shows one new value.
                const v = sv ? '' : vAt(`part-${i}`);
                const wink = iAt(`part-${i}`);
                const fill = v && wink ? `<span data-ws-ink="${wink}" style="font-weight:${wink === 'trace' ? 400 : 700};color:${wink === 'trace' ? INK.grey : INK.ink}">${esc(v)}</span>` : '';
                return `${i ? '<span style="font-weight:700;width:1em;text-align:center">+</span>' : ''}`
                    + `<span style="display:inline-flex;justify-content:center;align-items:flex-end;width:${g.em(bw)};height:${g.em(g.stripMm)};border-bottom:${HAIR} solid ${INK.ink};line-height:1.1">${fill}</span>`;
            }).join('') + '</div>';
        const model = `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;white-space:nowrap${twin ? '' : `;padding-top:${g.em(3)}`}">`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;margin-left:${g.em(mulMm)};margin-bottom:0.1em">${labels}</div>`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center">`
            + `<span style="flex:0 0 ${g.em(mulMm)};text-align:center;font-weight:700">${esc(p.multiplier)}</span>`
            + `<span class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;border:${HAIR} solid ${INK.ink}">${rects}</span></div>`
            + workRow
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center;gap:0.28em;margin-top:0.45em;white-space:nowrap">`
            + `<span>${esc(p.multiplier)}</span><span style="font-weight:700;width:1em;text-align:center">×</span><span>${esc(multiplicandOf(p))}</span>`
            + `<span style="font-weight:700;width:1em;text-align:center">=</span>${totalSlot}</div></div>`;
        return root(g, 'area-model', model, 'text-align:center;white-space:nowrap;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = isExt(p) ? extKey(p) : keySlots(p);
        const slots = {};
        for (const [id, v] of Object.entries(k)) slots[id] = { value: v, graded: true };
        const total = productOf(p);
        return { value: total, display: total.toLocaleString('en-US'), slots };
    },
    footprint(p, ctx) {
        if (isExt(p)) return extFootprint(p, ctx);
        const g = geo(ctx);
        const partials = partialsOf(p);
        const bw = boxMm(g, Math.max(...partials.map((v) => String(v).length)));
        const colMm = bw + 6;
        const work = !g.twin && p.parts.length >= 2 ? g.stripMm + 0.45 * g.E + 3 : 0;   // R3: the work row + top pad
        return {
            wMm: Math.ceil(Math.max(p.parts.length * colMm, p.parts.length * (bw + g.E)) + String(p.multiplier).length * 0.62 * g.E + 12),
            hMm: Math.ceil(g.E * 1.2 + g.stripMm + 8 + g.stripMm + 10 + work),
            measure: true, factLike: false, maxCols: 2,
        };
    },
    inputs(p) {
        if (isExt(p)) return extInputs(p);
        return p.parts.map((_, i) => ({ id: `part-${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }))
            .concat([{ id: 'total', kind: 'number', shape: 'box', graded: true, order: p.parts.length, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]);
    },
    layout() { return { card: 'card-wide-visual', checker: 'area-model', requiresVisual: true }; },
    /** S5 / P-LC-9: `part<i>` fills part box i, `total` the total box; newest grey, earlier black. */
    stepState(p, steps, k, ctx) {
        const sv = slotInks(stepMarks(steps, k), (slot) => {
            const m = /^part(\d+)$/.exec(slot);
            if (m) return `part-${m[1]}`;
            const e = /^(top|side)(\d+)$/.exec(slot);
            if (e && isExt(p)) return `${e[1]}-${e[2]}`;
            return WHOLE_SLOTS.has(slot) ? 'total' : null;
        });
        return this.render(p, Object.assign({}, ctx, { state: 'blank', stepVals: sv }));
    },
});
