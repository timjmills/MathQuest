// js/modules/sheet/cells/counters.js
// The `counters` template: a picture of objects the pupil counts, takes away from, or rings into
// groups. One template, switched on `payload.kind` (plain data, SCC-Q3):
//
//   count     count_objects      n outline objects (9 mm, RP-21 pitch item + 3 mm) in rows of
//                                five, a ten as two rows then the ones below a 3 mm gap, beside the
//                                K answer square (16 / 20 / 24 mm; mock-up 05-B). Outline, never a
//                                solid fill over 7 mm (INK-5). No count label (RP-1).
//   takeaway  sub_5_pictures     n outline objects in one row, the first m crossed out with a bold
//                                X, and the sentence `n − m = [ ]` under them.
//   share     share_into_groups  n solid 5 mm counters in RUNS of the group size (4 mm between
//                                two counters of a run, 9 mm between runs, 7 mm between lines),
//                                so a pupil rings each run as one loop without two rings meeting
//                                (RUBRIC H12). Under it `[ ] groups of d`.
//
// Key (AK-1): the same cell with the answer written in its box; Error analysis writes the wrong
// value there instead (state `wrong`).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import {
    L, P, svg, root, box, slotValue, shapeOf, dot, cross, digitPt, textPt, squareMm, inlineBoxMm, INK, SW, n2, groupRuns,
} from './k2kit.js';

const MINUS = '−';

/**
 * Geometry of the count picture: rows of five, a ten then the ones.
 * P11 (skill-options.js count_objects) adds, from plain payload data:
 *   p.layout 'line'       ten to a row (one line up to ten)
 *   p.layout 'scattered'  the objects at p.pos ([x, y] mm centres, drawn by the generator)
 *   p.objects 'frame'     solid counters in ten frames;  'dice'  dice faces of up to six pips
 */
function countPicture(ctx, n, shape, p = {}) {
    if (p.objects === 'frame') return framePicture(ctx, n);
    if (p.objects === 'dice') return dicePicture(ctx, n);
    if (p.layout === 'scattered' && Array.isArray(p.pos) && p.pos.length === n) {
        const d = 9;
        const w = Math.max(...p.pos.map((q) => q[0])) + d / 2 + 1, h = Math.max(...p.pos.map((q) => q[1])) + d / 2 + 1;
        const body = p.pos.map(([x, y]) => shapeOf(shape).draw(x, y, d)).join('');
        return svg(ctx, w, h, body, { label: `${n} ${shapeOf(shape).plural}` });
    }
    const line = p.layout === 'line';
    const per = line ? 10 : 5;
    const d = line ? 7 : 9, pitch = line ? 8.8 : 11.6, gap = 3;   // the K mock-up's pitch (05-B): five in a row beside the square
    const cols = Math.min(per, Math.max(1, n));
    const rows = Math.ceil(n / per);
    const w = (cols - 1) * pitch + d + 1;
    const h = (rows - 1) * pitch + d + 1 + (!line && rows > 2 ? gap : 0);
    let body = '';
    for (let i = 0; i < n; i++) {
        const r = Math.floor(i / per);
        body += shapeOf(shape).draw(0.5 + d / 2 + (i % per) * pitch, 0.5 + d / 2 + r * pitch + (!line && r >= 2 ? gap : 0), d);
    }
    return svg(ctx, w, h, body, { label: `${n} ${shapeOf(shape).plural}` });
}

/** P11: n solid counters in ten frames (5 x 2, 9 mm cells), a second frame under the first. */
function framePicture(ctx, n) {
    const c = 9, frames = Math.max(1, Math.ceil(n / 10)), gapY = 3;
    const w = 5 * c + 1, h = frames * 2 * c + (frames - 1) * gapY + 1;
    let body = '';
    for (let f = 0; f < frames; f++) {
        const oy = 0.5 + f * (2 * c + gapY);
        body += `<path d="M0.5 ${n2(oy)}h${5 * c}v${2 * c}h${-5 * c}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        let grid = '';
        for (let k = 1; k < 5; k++) grid += `M${n2(0.5 + k * c)} ${n2(oy)}v${2 * c}`;
        grid += `M0.5 ${n2(oy + c)}h${5 * c}`;
        body += `<path d="${grid}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
        for (let i = 0; i < Math.min(10, n - f * 10); i++) body += dot(0.5 + (i % 5 + 0.5) * c, oy + (Math.floor(i / 5) + 0.5) * c, 6);
    }
    return svg(ctx, w, h, body, { label: `${n} counters in ten frames` });
}

/** P11: n pips as dice faces of up to six (17 = 6 + 6 + 5), each face the standard pattern. */
function dicePicture(ctx, n) {
    const s = 14, gap = 3;
    const faces = [];
    for (let left = n; left > 0; left -= 6) faces.push(Math.min(6, left));
    const P = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
        5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
    let body = '';
    faces.forEach((k, i) => {
        const ox = 0.5 + i * (s + gap);
        body += `<path d="M${n2(ox + 2)} 0.5h${s - 4}q2 0 2 2v${s - 4}q0 2 -2 2h${-(s - 4)}q-2 0 -2 -2v${-(s - 4)}q0 -2 2 -2Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        for (const [x, y] of P[k]) body += dot(ox + 3.2 + x * 3.8, 0.5 + 3.2 + y * 3.8, 2.6);
    });
    return svg(ctx, faces.length * (s + gap) - gap + 1, s + 1, body, { label: `${n} pips on ${faces.length} dice` });
}

/** P11 hint: a number track 1..top (≤ 20) under the picture, drawn as one path so no box is counted. */
function trackStrip(ctx, top) {
    const t = Math.max(5, Math.min(20, Number(top) || 20));
    const cw = Math.min(6.5, 90 / t), h = 6.5;
    let d = `M0.5 0.5h${n2(t * cw)}v${h}h${n2(-t * cw)}Z`;
    for (let k = 1; k < t; k++) d += `M${n2(0.5 + k * cw)} 0.5v${h}`;
    let body = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let k = 1; k <= t; k++) {
        body += `<text x="${n2(0.5 + (k - 0.5) * cw)}" y="${n2(0.5 + h * 0.7)}" text-anchor="middle" font-size="${n2(Math.min(3.4, cw * 0.62))}" `
            + `font-family="Andika, sans-serif" fill="${INK}">${k}</text>`;
    }
    return svg(ctx, t * cw + 1, h + 1, body, { label: `number track 1 to ${t}` });
}

function takeawayPicture(ctx, n, m, shape) {
    const d = 10, pitch = d + 3;
    const w = (n - 1) * pitch + d + 2, h = d + 2;
    let body = '';
    for (let i = 0; i < n; i++) {
        const cx = 1 + d / 2 + i * pitch, cy = 1 + d / 2;
        body += shapeOf(shape).draw(cx, cy, d);
        if (i < m) body += cross(cx, cy, d);
    }
    return svg(ctx, w, h, body, { label: `${n} ${shapeOf(shape).plural}, ${m} crossed out` });
}

/** The loose array: columns chosen so a row never equals a group (the pupil must ring). */
export function shareColumns(n, size) {
    const options = [7, 6, 5].filter((c) => c % size !== 0 && size % c !== 0);
    const pick = options.find((c) => Math.ceil(n / c) <= 4) || options[0] || 7;
    return pick;
}
/**
 * The counters in RUNS of the group size (k2kit `groupRuns`, RUBRIC H12): one run is one group
 * to ring, 4 mm between two counters of a run, 9 mm between two runs, 7 mm between lines. The
 * 2026-09-25 regrade: in rows of 7, groups of 3 / 4 / 6 / 8 straddled two rows and could not be
 * ringed as one loop.
 */
function sharePicture(ctx, n, size) {
    const d = 5;
    const lay = groupRuns(n, size, { d, gap: 4, runGap: 9, rowGap: 7, pad: 1 });
    const body = lay.pts.map((c) => dot(c.cx, c.cy, d)).join('');
    return svg(ctx, lay.w, lay.h, body, { label: `${n} counters` });
}

const eqSpan = (ctx, s) => `<span style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">${esc(s)}</span>`;
const opSpan = (ctx, s) => `<span style="display:inline-block;width:1em;text-align:center;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">${s}</span>`;

register('counters', {
    render(p, ctx) {
        const kv = p.ans;
        if (p.kind === 'takeaway') {
            const b = inlineBoxMm(ctx, 1);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            return root(ctx, 'k2-takeaway', `<div style="display:flex;justify-content:center;">${takeawayPicture(ctx, p.n, p.m, p.shape)}</div>`
                + `<div class="ws-eq" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};margin-top:${L(ctx, 5)};white-space:nowrap;">`
                + `${eqSpan(ctx, p.n)}${opSpan(ctx, MINUS)}${eqSpan(ctx, p.m)}${opSpan(ctx, '=')}${slot}</div>`);
        }
        if (p.kind === 'share') {
            const b = inlineBoxMm(ctx, 2);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            return root(ctx, 'k2-share', `<div style="display:flex;justify-content:center;">${sharePicture(ctx, p.n, p.size)}</div>`
                + `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2.5)};margin-top:${L(ctx, 4)};`
                + `font-size:${P(ctx, textPt(ctx) + 3)};white-space:nowrap;">${slot}<span>groups of</span>`
                + `<span style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;">${esc(p.size)}</span></div>`);
        }
        // count
        const sq = squareMm(ctx);
        // P11 Support level 3: the answer written in grey to trace (the traced state of the slot).
        const tctx = p.traced && ctx.state === 'blank' ? Object.assign({}, ctx, { state: 'traced' }) : ctx;
        const slot = box(tctx, { value: slotValue(tctx, 'answer', kv), w: sq, h: sq, mark: 'blank' });
        return root(ctx, 'k2-count', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 4)};">`
            + `<div style="flex:none;">${countPicture(ctx, p.n, p.shape, p)}</div>${slot}</div>`
            // P11 Support level 2: a number track under the picture to point along.
            + (p.track ? `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};">${trackStrip(ctx, p.track)}</div>` : ''));
    },
    answerKey(p) {
        const v = p.ans;
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint(p) {
        return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});

export const COUNTERS_TEMPLATE = 'counters';
