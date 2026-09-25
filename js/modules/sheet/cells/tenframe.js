// js/modules/sheet/cells/tenframe.js
// The `tenframe` template: "draw the number in the ten frame" (ten_frame_build).
//
// RP-10 / table 11.2 "Ten frame, pupil draws counters": a 2 x 5 frame of 10 / 10 / 11 mm square
// cells (50 x 20 / 50 x 20 / 55 x 22 mm), border 1.5 pt, interior 0.75 pt, horizontal. The
// target prints at the working digit size beside the frame and the frame IS the answer place:
// the pupil draws one counter in each of the first N cells. Nothing else is printed (no
// sentence, no count label: RP-1), so the cell is exactly as big as the frame and the number,
// and never a frame at the top of a half-empty cell.
//
// Key (AK-1): the same frame with the counters drawn, solid, 0.6 of the cell (6.6 mm at L, under
// the INK-5 7 mm limit), top row first, left to right (RP-11). Error analysis draws the wrong
// count there instead, and with payload `fix: 'draw'` an empty "Fix it:" frame under it for the
// pupil to draw the number correctly (k2kit `fixDraw`).
//
// The screen twin names its model for the host (`data-mq-model="ten-frame"`, `data-mq-target`):
// a host that mounts a tap-to-fill frame there lets the pupil BUILD the number rather than retype
// it (RUBRIC H3).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, sizeOf, inkOf, isTwin, answered, fixDraw, fixFilled, fixCaption } from './k2kit.js';

const CELL = { S: 10, M: 10, L: 11 };

/** How many counters the frame shows in this state. */
function shownCount(p, ctx) {
    if (ctx.state === 'wrong') {
        const v = Math.floor(Number(ctx.wrong && ctx.wrong.value));
        return Number.isFinite(v) ? Math.max(0, Math.min(10 * (p.frames || 1), v)) : 0;
    }
    return answered(ctx) ? p.target : 0;
}

export function frameHTML(ctx, { frames = 1, filled = 0 } = {}) {
    const c = CELL[sizeOf(ctx)] || 11;
    const ink = filled ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const td = (on) => `<td style="box-sizing:border-box;width:${L(ctx, c)};height:${L(ctx, c)};padding:0;`
        + `border:${B(ctx, 0.75)} solid ${INK};text-align:center;vertical-align:middle;">`
        + (on ? `<svg viewBox="0 0 10 10" aria-hidden="true" style="display:block;margin:auto;width:${L(ctx, c * 0.6)};height:${L(ctx, c * 0.6)};">`
            + `<circle cx="5" cy="5" r="5" fill="${color}"/></svg>` : '')
        + `</td>`;
    let out = '';
    for (let f = 0; f < frames; f++) {
        let rows = '';
        for (let r = 0; r < 2; r++) {
            let tds = '';
            for (let k = 0; k < 5; k++) tds += td(f * 10 + r * 5 + k < filled);
            rows += `<tr>${tds}</tr>`;
        }
        out += `<table class="k2-tenframe" data-ws-zone="ten frame"${ink ? ` data-ws-ink="${ink}"` : ''} style="border-collapse:collapse;`
            + `border:${B(ctx, 1.5)} solid ${INK};background:#fff;margin:0 auto;table-layout:fixed;">${rows}</table>`;
    }
    return `<div style="display:flex;flex-direction:column;gap:${L(ctx, 3)};">${out}</div>`;
}

register('tenframe', {
    render(p, ctx) {
        const frames = p.frames || 1;
        const model = isTwin(ctx) ? ` data-mq-model="ten-frame" data-mq-target="${esc(p.target)}" data-mq-max="${10 * frames}"` : '';
        const num = `<span style="font-size:${P(ctx, digitPt(ctx) * 1.15)};font-weight:700;line-height:1;min-width:1.2em;">${esc(p.target)}</span>`;
        const work = `<div data-ws-slot="answer" data-ws-shape="draw"${model}>${frameHTML(ctx, { frames, filled: shownCount(p, ctx) })}</div>`;
        if (!fixDraw(p, ctx)) {
            return root(ctx, 'k2-tenframe-cell', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 7)};">${num}${work}</div>`);
        }
        // The drawing-fix slot (k2kit `fixDraw`): the finished frame, and under it an EMPTY frame
        // captioned "Fix it:" in the same column, where the pupil draws the number correctly. The
        // key fills it with the right count; the number is printed once, beside the work.
        const fixed = fixFilled(ctx) ? p.target : 0;
        const fixCtx = fixed && !answered(ctx) ? Object.assign({}, ctx, { state: 'answered' }) : ctx;
        const hole = `<span style="min-width:1.2em;visibility:hidden;font-size:${P(ctx, digitPt(ctx) * 1.15)};">${esc(p.target)}</span>`;
        return root(ctx, 'k2-tenframe-cell', `<div style="display:grid;grid-template-columns:auto auto;align-items:center;justify-content:center;column-gap:${L(ctx, 7)};row-gap:${L(ctx, 1)};">`
            + `${num}${work}${hole}<div style="text-align:left;">${fixCaption(ctx)}`
            + `<div data-ws-slot="fix" data-ws-shape="draw">${frameHTML(fixCtx, { frames, filled: fixed })}</div></div></div>`);
    },
    answerKey(p) {
        const slots = { answer: { value: String(p.target), graded: true } };
        if (p.fix === 'draw') slots.fix = { value: String(p.target), graded: true };
        return { value: p.target, display: String(p.target), slots };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs(p) {
        const out = [{ id: 'answer', kind: 'drag', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        if (p && p.fix === 'draw') out.push({ id: 'fix', kind: 'drag', shape: 'draw', graded: true, order: 1, scopes: ['full'] });
        return out;
    },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});
