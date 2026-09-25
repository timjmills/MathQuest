// js/modules/sheet/cells/base10.js
// The `base10` template: "draw the number with tens and ones" (base10_build).
//
// The number prints at the working digit size, and under it a two-zone mat, Tens | Ones, each
// zone big enough to draw the HARDEST item in it — nine sticks, nine dots — with room to spare
// (RUBRIC H12: a drawing zone is at least 30 mm tall and 60% empty). Every zone is the same size
// whatever the number, so the zone never tells the pupil how many to draw (RP-1). The heads are
// words (RP-40: columns 14 mm or wider), the quick-draw symbols are named once under the mat
// (RP-31: stick = ten, open dot = one), and an empty zone stays empty to show zero (RP-32).
//
// Key (AK-1): the same mat with the sticks and dots DRAWN, 1.5 pt, in the zones — each symbol its
// own small drawing, so the key's zones stay as open as the pupil's. Error analysis draws the
// wrong number's model instead (state `wrong`).
//
// The screen twin names its model for the host (`data-mq-model="base10"`, `data-mq-target`,
// `data-mq-places`): a host that mounts a tap-to-add mat there lets the pupil BUILD the number
// instead of retyping it (RUBRIC H3).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, zonePt, sizeOf, inkOf, isTwin, answered, n2, SW } from './k2kit.js';

const ZONE = { S: { w: 38, h: 32 }, M: { w: 39, h: 33 }, L: { w: 40, h: 34 } };
const WORD = { 100: 'Hundreds', 10: 'Tens', 1: 'Ones' };

/** {place: count} for a value on these places, largest place first (no regrouping). */
export function base10Counts(value, places = [10, 1]) {
    const out = {};
    let rest = Math.max(0, Math.floor(Number(value) || 0));
    for (const p of places.slice().sort((a, b) => b - a)) { out[p] = Math.min(9, Math.floor(rest / p)); rest -= out[p] * p; }
    return out;
}

/** One quick-draw symbol as its own small drawing (RP-31, 1.5 pt). */
function symbol(ctx, place, color) {
    const sw = n2(SW.heavy);
    if (place === 10) {
        return `<svg viewBox="0 0 2 22" aria-hidden="true" data-k2-sym="10" style="display:block;width:${L(ctx, 2)};height:${L(ctx, 22)};">`
            + `<line x1="1" y1="${sw}" x2="1" y2="${n2(22 - SW.heavy)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
    }
    if (place === 100) {
        return `<svg viewBox="0 0 9 9" aria-hidden="true" data-k2-sym="100" style="display:block;width:${L(ctx, 9)};height:${L(ctx, 9)};">`
            + `<rect x="${sw / 2}" y="${sw / 2}" width="${n2(9 - SW.heavy)}" height="${n2(9 - SW.heavy)}" fill="none" stroke="${color}" stroke-width="${sw}"/></svg>`;
    }
    return `<svg viewBox="0 0 4 4" aria-hidden="true" data-k2-sym="1" style="display:block;width:${L(ctx, 4)};height:${L(ctx, 4)};">`
        + `<circle cx="2" cy="2" r="${n2(2 - SW.heavy / 2)}" fill="none" stroke="${color}" stroke-width="${sw}"/></svg>`;
}

/** The small symbol of the legend line (RP-31: the symbols are named once). */
function legendSym(ctx, place) {
    const sw = n2(SW.heavy);
    if (place === 10) return `<svg viewBox="0 0 2 7" aria-hidden="true" style="display:block;width:${L(ctx, 2)};height:${L(ctx, 7)};"><line x1="1" y1="${sw}" x2="1" y2="${n2(7 - SW.heavy)}" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
    if (place === 100) return `<svg viewBox="0 0 5 5" aria-hidden="true" style="display:block;width:${L(ctx, 5)};height:${L(ctx, 5)};"><rect x="${sw / 2}" y="${sw / 2}" width="${n2(5 - SW.heavy)}" height="${n2(5 - SW.heavy)}" fill="none" stroke="${INK}" stroke-width="${sw}"/></svg>`;
    return `<svg viewBox="0 0 3 3" aria-hidden="true" style="display:block;width:${L(ctx, 3)};height:${L(ctx, 3)};"><circle cx="1.5" cy="1.5" r="${n2(1.5 - SW.heavy / 2)}" fill="none" stroke="${INK}" stroke-width="${sw}"/></svg>`;
}

function zoneContent(ctx, place, n, color) {
    if (!n) return '';
    const syms = Array.from({ length: n }, () => symbol(ctx, place, color)).join('');
    // Sticks stand in one row; dots sit in rows of five (ten-frame order).
    const wrap = place === 1 ? `display:grid;grid-template-columns:repeat(5, ${L(ctx, 4)});gap:${L(ctx, 2.5)};`
        : `display:flex;flex-wrap:wrap;gap:${L(ctx, 2)};`;
    return `<div style="${wrap}justify-content:center;align-content:center;padding:${L(ctx, 3)};">${syms}</div>`;
}

register('base10', {
    render(p, ctx) {
        const places = (Array.isArray(p.places) && p.places.length ? p.places : [10, 1]).slice().sort((a, b) => b - a);
        const z = ZONE[sizeOf(ctx)] || ZONE.L;
        let counts = null;
        if (ctx.state === 'wrong') counts = base10Counts(ctx.wrong && ctx.wrong.value, places);
        else if (answered(ctx)) counts = p.counts || base10Counts(p.target, places);
        const ink = counts ? inkOf(ctx) : null;
        const color = ink === 'trace' ? GREY : INK;
        const heads = places.map((pl) => `<div style="width:${L(ctx, z.w)};font-size:${P(ctx, zonePt(ctx))};font-weight:700;line-height:1.5;">${WORD[pl] || pl}</div>`).join('');
        const zones = places.map((pl, i) => `<div data-ws-zone="${(WORD[pl] || String(pl)).toLowerCase()}" style="box-sizing:border-box;`
            + `width:${L(ctx, z.w)};height:${L(ctx, z.h)};border:${B(ctx, 0.75)} solid ${INK};${i ? `margin-left:-${B(ctx, 0.75)};` : ''}`
            + `display:flex;align-items:center;justify-content:center;background:#fff;">`
            + `${counts ? zoneContent(ctx, pl, counts[pl] || 0, color) : ''}</div>`).join('');
        const legend = places.map((pl) => `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 1.2)};">`
            + legendSym(ctx, pl)
            + `= 1 ${pl === 100 ? 'hundred' : pl === 10 ? 'ten' : 'one'}</span>`).join(`<span style="display:inline-block;width:${L(ctx, 6)};"></span>`);
        const model = isTwin(ctx) ? ` data-mq-model="base10" data-mq-target="${esc(p.target)}" data-mq-places="${places.join(',')}"` : '';
        return root(ctx, 'k2-base10', `<div style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;margin-bottom:${L(ctx, 3)};">${esc(p.target)}</div>`
            + `<div data-ws-slot="answer" data-ws-shape="draw"${ink ? ` data-ws-ink="${ink}"` : ''}${model} style="display:inline-block;">`
            + `<div style="display:flex;justify-content:center;">${heads}</div>`
            + `<div style="display:flex;justify-content:center;">${zones}</div></div>`
            + `<div style="display:flex;align-items:center;justify-content:center;font-size:${P(ctx, zonePt(ctx))};margin-top:${L(ctx, 1.5)};">${legend}</div>`);
    },
    answerKey(p) {
        return { value: p.target, display: String(p.target), slots: { answer: { value: String(p.target), graded: true } } };
    },
    footprint(p) {
        const wide = Array.isArray(p.places) && p.places.length >= 3;
        return { wMm: wide ? 186 : 93, hMm: null, measure: true, factLike: false, maxCols: wide ? 1 : 2 };
    },
    inputs() { return [{ id: 'answer', kind: 'drag', shape: 'draw', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});
