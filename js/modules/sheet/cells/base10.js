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
// wrong number's model instead (state `wrong`), and with payload `fix: 'draw'` an empty
// "Fix it:" mat under it for the pupil to draw the number correctly (k2kit `fixDraw`).
//
// The screen twin names its model for the host (`data-mq-model="base10"`, `data-mq-target`,
// `data-mq-places`): a host that mounts a tap-to-add mat there lets the pupil BUILD the number
// instead of retyping it (RUBRIC H3).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, zonePt, sizeOf, inkOf, isTwin, answered, n2, SW, fixDraw, fixFilled, fixCaption } from './k2kit.js';

const ZONE = { S: { w: 38, h: 32 }, M: { w: 39, h: 33 }, L: { w: 40, h: 34 } };
const WORD = { 100: 'Hundreds', 10: 'Tens', 1: 'Ones' };
/** A drawn ten-stick (mm): clearly longer than a one (4 mm), short enough to leave the zone open. */
const STICK_MM = 18;

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
        // An 18 mm stick in a 1 mm box: nine of them still leave the 40 x 34 mm Tens zone more
        // than 60% open on the key (RUBRIC H12; the 22 mm stick in a 2 mm box left it 57%).
        return `<svg viewBox="0 0 1 ${STICK_MM}" aria-hidden="true" data-k2-sym="10" style="display:block;width:${L(ctx, 1)};height:${L(ctx, STICK_MM)};overflow:visible;">`
            + `<line x1="0.5" y1="${sw}" x2="0.5" y2="${n2(STICK_MM - SW.heavy)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
    }
    if (place === 100) {
        return `<svg viewBox="0 0 9 9" aria-hidden="true" data-k2-sym="100" style="display:block;overflow:visible;width:${L(ctx, 9)};height:${L(ctx, 9)};">`
            + `<rect x="${sw / 2}" y="${sw / 2}" width="${n2(9 - SW.heavy)}" height="${n2(9 - SW.heavy)}" fill="none" stroke="${color}" stroke-width="${sw}"/></svg>`;
    }
    return `<svg viewBox="0 0 4 4" aria-hidden="true" data-k2-sym="1" style="display:block;overflow:visible;width:${L(ctx, 4)};height:${L(ctx, 4)};">`
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
    // Sticks stand in ONE row inside the zone (nine 1 mm sticks and their gaps are 25 mm of the
    // 38-40 mm zone: never wrapped into a second row that pokes over the heads, 2026-09-25
    // regrade); dots sit in rows of five (ten-frame order); hundreds wrap in rows of three.
    const wrap = place === 1 ? `display:grid;grid-template-columns:repeat(5, ${L(ctx, 4)});gap:${L(ctx, 2.5)};`
        : place === 10 ? `display:flex;flex-wrap:nowrap;gap:${L(ctx, 2)};`
            : `display:grid;grid-template-columns:repeat(3, ${L(ctx, 9)});gap:${L(ctx, 1.5)};`;
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
        const heads = places.map((pl) => `<div style="width:${L(ctx, z.w)};font-size:${P(ctx, zonePt(ctx))};font-weight:700;line-height:1.5;">${WORD[pl] || pl}</div>`).join('');
        /** One Tens | Ones mat: the heads, then a zone per place with `cnt` drawn in it (or empty). */
        const mat = (cnt, inkOfMat, zonePrefix = '') => {
            const color = inkOfMat === 'trace' ? GREY : INK;
            const zones = places.map((pl, i) => `<div data-ws-zone="${zonePrefix}${(WORD[pl] || String(pl)).toLowerCase()}" style="box-sizing:border-box;`
                + `width:${L(ctx, z.w)};height:${L(ctx, z.h)};border:${B(ctx, 0.75)} solid ${INK};${i ? `margin-left:-${B(ctx, 0.75)};` : ''}`
                + `display:flex;align-items:center;justify-content:center;background:#fff;">`
                + `${cnt ? zoneContent(ctx, pl, cnt[pl] || 0, color) : ''}</div>`).join('');
            return `<div style="display:flex;justify-content:center;">${heads}</div>`
                + `<div style="display:flex;justify-content:center;">${zones}</div>`;
        };
        const legend = places.map((pl) => `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 1.2)};">`
            + legendSym(ctx, pl)
            + `= 1 ${pl === 100 ? 'hundred' : pl === 10 ? 'ten' : 'one'}</span>`).join(`<span style="display:inline-block;width:${L(ctx, 6)};"></span>`);
        const model = isTwin(ctx) ? ` data-mq-model="base10" data-mq-target="${esc(p.target)}" data-mq-places="${places.join(',')}"` : '';
        // The drawing-fix slot (k2kit `fixDraw`): an empty mat under the finished work, the
        // pupil's place to draw the number again correctly; the key draws the right model there.
        let fix = '';
        if (fixDraw(p, ctx)) {
            const fc = fixFilled(ctx) ? (p.counts || base10Counts(p.target, places)) : null;
            const fInk = fc ? (ctx.state === 'traced' ? 'trace' : 'solid') : null;   // the key's own ink
            fix = `<div style="margin-top:${L(ctx, 3)};display:inline-block;">${fixCaption(ctx)}`
                + `<div data-ws-slot="fix" data-ws-shape="draw"${fInk ? ` data-ws-ink="${fInk}"` : ''}>${mat(fc, fInk, 'fix ')}</div></div>`;
        }
        return root(ctx, 'k2-base10', `<div style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;margin-bottom:${L(ctx, 3)};">${esc(p.target)}</div>`
            + `<div data-ws-slot="answer" data-ws-shape="draw"${ink ? ` data-ws-ink="${ink}"` : ''}${model} style="display:inline-block;">`
            + `${mat(counts, ink)}</div>`
            + `<div style="display:flex;align-items:center;justify-content:center;font-size:${P(ctx, zonePt(ctx))};margin-top:${L(ctx, 1.5)};">${legend}</div>`
            + (fix ? `<div>${fix}</div>` : ''));
    },
    answerKey(p) {
        const slots = { answer: { value: String(p.target), graded: true } };
        if (p.fix === 'draw') slots.fix = { value: String(p.target), graded: true };
        return { value: p.target, display: String(p.target), slots };
    },
    footprint(p) {
        const wide = Array.isArray(p.places) && p.places.length >= 3;
        return { wMm: wide ? 186 : 93, hMm: null, measure: true, factLike: false, maxCols: wide ? 1 : 2 };
    },
    inputs(p) {
        const out = [{ id: 'answer', kind: 'drag', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        if (p && p.fix === 'draw') out.push({ id: 'fix', kind: 'drag', shape: 'draw', graded: true, order: 1, scopes: ['full'] });
        return out;
    },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});
