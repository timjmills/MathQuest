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
    L, P, svg, root, box, slotValue, shapeOf, dot, cross, digitPt, textPt, squareMm, inlineBoxMm, groupRuns,
} from './k2kit.js';

const MINUS = '−';

/** Geometry of the count picture: rows of five, a ten then the ones. */
function countPicture(ctx, n, shape) {
    const d = 9, pitch = 11.6, gap = 3;   // the K mock-up's pitch (05-B): five in a row beside the square
    const cols = Math.min(5, Math.max(1, n));
    const rows = Math.ceil(n / 5);
    const w = (cols - 1) * pitch + d + 1;
    const h = (rows - 1) * pitch + d + 1 + (rows > 2 ? gap : 0);
    let body = '';
    for (let i = 0; i < n; i++) {
        const r = Math.floor(i / 5);
        body += shapeOf(shape).draw(0.5 + d / 2 + (i % 5) * pitch, 0.5 + d / 2 + r * pitch + (r >= 2 ? gap : 0), d);
    }
    return svg(ctx, w, h, body, { label: `${n} ${shapeOf(shape).plural}` });
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
        const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: sq, h: sq, mark: 'blank' });
        return root(ctx, 'k2-count', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 4)};">`
            + `<div style="flex:none;">${countPicture(ctx, p.n, p.shape)}</div>${slot}</div>`);
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
