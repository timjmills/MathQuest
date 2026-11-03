// js/modules/sheet/cells/area-model-div.js
// The area model for division, template id `area-model-div` (owner requests 2026-10-16).
//
//          [  ]    [  ]        <- the quotient's parts: the missing side lengths, always boxes
//       ┌───────┬───────┐
//     4 │  80   │   4   │      <- the divisor on the side (a box on "Pupil writes them"),
//       └───────┴───────┘         the dividend's parts inside, given
//       84 ÷ 4 = [    ]        <- the problem in the form asked: division sign, long division
//                                 (the kit's bracket: arc + vinculum, the quotient box over the
//                                 dividend) or fraction (84 over 4 on a bar)
//
// Black line art, no colour (INK-1). The model has a minimum width and never wraps; the cell is
// measured, so the page takes fewer columns instead of squeezing it (PG-20).
// The key writes every box: the quotient parts, the divisor when it is a box, the quotient (AK-1).
//
// Payload: { dividend, divisor, parts: number[] (the dividend's parts), form?: 'sign'|'long'|'fraction',
//            edges?: 'given'|'blank', uid? }
// Slots: q-<i> (quotient part i), side (the divisor, blank edges only), total.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, HAIR, HEAVY } from './ops-common.js';
import { INK } from '../tokens.js';
import { stepMarks, slotInks, WHOLE_SLOTS } from '../steps.js';

const NOWRAP = 'area-model-total-row';   // the online worksheet's no-wrap opt-out (see area-model.js)

const quotOf = (p) => Number(p.dividend) / Number(p.divisor);
const qParts = (p) => p.parts.map((v) => Number(v) / Number(p.divisor));
const formOf = (p) => (['long', 'fraction'].includes(p.form) ? p.form : 'sign');

function keySlots(p) {
    const k = {};
    qParts(p).forEach((v, i) => { k[`q-${i}`] = String(v); });
    if (p.edges === 'blank') k.side = String(p.divisor);
    k.total = String(quotOf(p));
    return k;
}

/** Width of a box that holds `n` digits at the digit size, never under Hw x 2 (as area-model.js). */
const boxMm = (g, n) => Math.max(g.writeMm * 2, (n * 0.62 + 0.7) * g.E);

function geom(p, g) {
    const parts = p.parts.map(Number);
    const qs = qParts(p);
    const qw = boxMm(g, Math.max(...qs.map((v) => String(v).length)));
    const colMm = Math.max(qw + 6, ...parts.map((v) => String(v).length * 0.62 * g.E + 8));
    const blank = p.edges === 'blank';
    const sw = boxMm(g, String(p.divisor).length);
    const sideMm = blank ? sw + 3 : String(p.divisor).length * 0.62 * g.E + 5;
    const hMm = g.stripMm + 6;
    const tw = boxMm(g, String(quotOf(p)).length + 1);
    return { parts, qs, qw, colMm, blank, sw, sideMm, hMm, tw };
}

register('area-model-div', {
    render(p, ctx) {
        const g = geo(ctx);
        const G = geom(p, g);
        const ink = inkOf(ctx);
        const key = keySlots(p);
        const order = Object.keys(key);
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            const o = {};
            if (l.length === 1) o.total = l[0];
            else order.forEach((id, i) => { if (l[i] !== undefined) o[id] = l[i]; });
            return o;
        });
        const twin = g.twin;
        const uid = esc(p.uid || 'amd');
        const sv = ctx.stepVals || null;
        const vAt = (id) => (sv ? ((sv[id] && sv[id].value) || '') : vals[id] || '');
        const iAt = (id) => (sv ? ((sv[id] && sv[id].ink) || null) : ink);
        const slot = (id, cls, ans, w, aria) => (twin
            ? `<input type="text" class="${cls}" inputmode="numeric" autocomplete="off" data-area-idx="${uid}-${id}" data-answer="${ans}" data-ws-slot="${id}" data-ws-shape="box" aria-label="${aria}" `
                + `style="box-sizing:border-box;width:${g.em(w)};height:${g.em(g.stripMm)};border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm)};background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`
            : box(g, id, { wMm: w, hMm: g.stripMm, value: vAt(id), ink: iAt(id), mark: null }));
        const top = G.qs.map((v, i) => `<span class="${NOWRAP}" style="flex:0 0 ${g.em(G.colMm)};display:flex;justify-content:center">`
            + `${slot(`q-${i}`, 'area-model-input', v, G.qw, `side length ${i + 1}`)}</span>`).join('');
        const rects = G.parts.map((v, i) => `<span class="${NOWRAP}" style="flex:0 0 ${g.em(G.colMm)};height:${g.em(G.hMm)};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-weight:700;`
            + `${i ? `border-left:${HAIR} solid ${INK.ink};` : ''}">${esc(v)}</span>`).join('');
        const side = G.blank ? slot('side', 'area-model-input', p.divisor, G.sw, 'the divisor') : esc(p.divisor);
        const totalSlot = slot('total', 'area-model-total', quotOf(p), G.tw, 'quotient');
        const D = esc(p.dividend), V = esc(p.divisor);
        const op = (c) => `<span style="font-weight:700;width:1em;text-align:center">${c}</span>`;
        let problem;
        const form = formOf(p);
        if (form === 'fraction') {
            problem = `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.1">`
                + `<span style="padding:0 0.15em">${D}</span><span aria-hidden="true" style="align-self:stretch;border-top:${HEAVY} solid ${INK.ink}"></span>`
                + `<span style="padding:0 0.15em">${V}</span></span>${op('=')}${totalSlot}`;
        } else if (form === 'long') {
            // The kit's long-division bracket (long-division.js): the arc and the vinculum in one
            // 1.5 pt line, the divisor before it, the quotient box over the dividend.
            const gut = g.E * 0.9;
            const arc = `<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible">`
                + `<path d="M1.5 0 H10 M1.5 0 Q9 20 1.5 40" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}" vector-effect="non-scaling-stroke"/></svg>`;
            problem = `<span role="group" aria-label="${D} divided by ${V}" style="display:inline-grid;grid-template-columns:auto ${g.em(gut)} auto;grid-template-rows:auto ${g.em(g.E * 1.25)};align-items:center">`
                + `<span style="grid-column:3;grid-row:1;align-self:end;display:flex;justify-content:center;padding-bottom:0.1em">${totalSlot}</span>`
                + `<span style="grid-column:1;grid-row:2;padding-right:0.05em">${V}</span>`
                + `<span style="grid-column:2;grid-row:2;align-self:stretch;display:block;position:relative;top:calc(${HEAVY} / 2)">${arc}</span>`
                + `<span style="grid-column:3;grid-row:2;padding:0 0.2em">${D}</span>`
                + `<span aria-hidden="true" style="grid-column:2 / span 2;grid-row:2;align-self:start;height:0;margin-left:calc(${g.em(gut)} * 0.15);border-top:${HEAVY} solid ${INK.ink}"></span></span>`;
        } else {
            problem = `<span>${D}</span>${op('÷')}<span>${V}</span>${op('=')}${totalSlot}`;
        }
        const model = `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;white-space:nowrap${twin ? '' : `;padding-top:${g.em(3)}`}">`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:flex-end;margin-left:${g.em(G.sideMm)};margin-bottom:0.15em">${top}</div>`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center">`
            + `<span class="${NOWRAP}" style="flex:0 0 ${g.em(G.sideMm)};display:flex;justify-content:center;font-weight:700">${side}</span>`
            + `<span class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;border:${HAIR} solid ${INK.ink}">${rects}</span></div>`
            + `<div class="${NOWRAP}" style="display:flex;flex-wrap:nowrap;align-items:center;gap:0.28em;margin-top:0.45em;white-space:nowrap">${problem}</div></div>`;
        return root(g, 'area-model-div', model, 'text-align:center;white-space:nowrap;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = keySlots(p);
        const slots = {};
        for (const [id, v] of Object.entries(k)) slots[id] = { value: v, graded: true };
        const q = quotOf(p);
        return { value: q, display: String(q), slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const G = geom(p, g);
        const probW = formOf(p) === 'long' ? String(p.dividend).length * 0.62 * g.E + g.E * 2 + String(p.divisor).length * 0.62 * g.E
            : String(p.dividend).length * 0.62 * g.E * 2 + g.E * 3 + G.tw;
        const probH = formOf(p) === 'sign' ? g.stripMm : g.stripMm + g.E * 1.3;
        return {
            wMm: Math.ceil(Math.max(G.parts.length * G.colMm + G.sideMm, probW) + 12),
            hMm: Math.ceil(g.stripMm + 2 + G.hMm + probH + 0.45 * g.E + (g.twin ? 0 : 3) + 14),
            measure: true, factLike: false, maxCols: 2,
        };
    },
    inputs(p) {
        const out = [];
        let o = 0;
        qParts(p).forEach((_, i) => out.push({ id: `q-${i}`, kind: 'number', shape: 'box', graded: true, order: o++, inputmode: 'numeric', scopes: ['full'] }));
        if (p.edges === 'blank') out.push({ id: 'side', kind: 'number', shape: 'box', graded: true, order: o++, inputmode: 'numeric', scopes: ['full'] });
        out.push({ id: 'total', kind: 'number', shape: 'box', graded: true, order: o, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        return out;
    },
    layout() { return { card: 'card-wide-visual', checker: 'area-model', requiresVisual: true }; },
    stepState(p, steps, k, ctx) {
        const sv = slotInks(stepMarks(steps, k), (slot) => {
            const m = /^q(\d+)$/.exec(slot);
            if (m) return `q-${m[1]}`;
            if (slot === 'side') return 'side';
            return WHOLE_SLOTS.has(slot) ? 'total' : null;
        });
        return this.render(p, Object.assign({}, ctx, { state: 'blank', stepVals: sv }));
    },
});
