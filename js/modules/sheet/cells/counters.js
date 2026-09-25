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
//   join / tens / sort / teen    add_5_pictures, tens_foundation_visual, classify_count and
//                                teen_compose (O6 AP1 round 2, see "AP1 migrations" below).
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
    L, P, B, svg, root, box, slotValue, shapeOf, dot, cross, digitPt, textPt, squareMm, inlineBoxMm, INK, GREY, SW, n2, groupRuns, isTwin, looseArray,
    pscale, checkedChoice, choiceRow, LETTERS, numberTrack,
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
    const under = p.countMarks && rows === 1;   // R3: a one-row Model counts in numerals UNDER its objects
    const h = (rows - 1) * pitch + d + 1 + (!line && rows > 2 ? gap : 0) + (under ? 5.5 : 0);
    let body = '';
    for (let i = 0; i < n; i++) {
        const r = Math.floor(i / per);
        const cx = 0.5 + d / 2 + (i % per) * pitch, cy = 0.5 + d / 2 + r * pitch + (!line && r >= 2 ? gap : 0);
        body += shapeOf(shape).draw(cx, cy, d);
        // R3 (critic round 3): the worked Model counts in grey, one number on each object in
        // touch order, so Steps 1-3 (touch, count, the last number is how many) are shown.
        if (p.countMarks) body += `<text x="${n2(cx)}" y="${n2(under ? cy + d / 2 + 5 : cy + 1.4)}" text-anchor="middle" font-size="${under ? 4.6 : 3.8}" font-weight="700" font-family="Andika, sans-serif" fill="${GREY}" data-ws-ink="trace">${i + 1}</text>`;
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
export function dicePicture(ctx, n) {
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

/**
 * O6 AP1 "Objects: Counters in a five frame" (sub_5_pictures): the take-away in a FIVE frame
 * (1 x 5, 12 mm cells, border 1.5 pt, interior 0.75 pt), n HOLLOW counters filled from the left
 * (RP-11 set B, so the bold X of a taken counter reads on it), the first m crossed out.
 */
function takeawayFrame(ctx, n, m) {
    const c = 12, w = 5 * c, h = c, o = SW.heavy / 2;
    let body = `<path d="M${n2(o)} ${n2(o)}h${w}v${h}h${-w}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    let grid = '';
    for (let k = 1; k < 5; k++) grid += `M${n2(o + k * c)} ${n2(o)}v${h}`;
    body += `<path d="${grid}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let i = 0; i < n; i++) {
        const cx = o + (i + 0.5) * c, cy = o + c / 2;
        body += shapeOf('circle').draw(cx, cy, 8);
        if (i < m) body += cross(cx, cy, 8);
    }
    return svg(ctx, w + 2 * o, h + 2 * o, body, { label: `${n} counters in a five frame, ${m} crossed out` });
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
    // R3 (critic round 3): runs of the group size WERE the groups, so the answer showed without a
    // ring drawn. A neutral array (k2kit looseArray) leaves the grouping to the pupil.
    const lay = looseArray(n, size, { d, gap: 5, rowGap: 8, pad: 1 });
    const body = lay.pts.map((c) => dot(c.cx, c.cy, d)).join('');
    return svg(ctx, lay.w, lay.h, body, { label: `${n} counters` });
}

const eqSpan = (ctx, s) => `<span style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">${esc(s)}</span>`;
const eqRowOf = (ctx, parts) => `<div class="ws-eq" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};margin-top:${L(ctx, 5)};white-space:nowrap;">${parts.join('')}</div>`;
const opSpan = (ctx, s) => `<span style="display:inline-block;width:1em;text-align:center;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">${s}</span>`;

/* ---------------------------------------------------- O6 AP1 migrations (2026-09-25, round 2)
 * Four K-2 skills that were drawn by gen-counting.js HTML (printed by the legacy path) are drawn
 * here, so paper, key and screen are one drawing and the picture-kind choice reaches all three:
 *   join   add_5_pictures          two groups joined by +, then `n + m = [ ]`
 *   tens   tens_foundation_visual  n rods of ten (or n full ten frames), then `[ ] tens`
 *   sort   classify_count          a key box with the kind to count, a mixed bag, the answer square
 *   teen   teen_compose            a full ten and loose ones, then `10 + n = [ ]` / `10 + [ ] = t`
 * Every object is outline or a solid counter under 7 mm (INK-5); nothing prints the answer (RP-1).
 */

/** `k` objects of one kind in one row (10 mm, 3 mm apart, RP-21). */
function objectRow(ctx, k, shape) {
    const d = 10, pitch = 13;
    let body = '';
    for (let i = 0; i < k; i++) body += shapeOf(shape).draw(1 + d / 2 + i * pitch, 1 + d / 2, d);
    return svg(ctx, Math.max(1, k) * pitch - 3 + 2, d + 2, body, { label: `${k} ${shapeOf(shape).plural}` });
}

/** A five frame (12 mm cells) holding `a` solid counters then `b` hollow ones (RP-11 set A / set B). */
function partFrame(ctx, a, b) {
    const c = 12, o = SW.heavy / 2;
    let body = `<path d="M${n2(o)} ${n2(o)}h${5 * c}v${c}h${-5 * c}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    let grid = '';
    for (let k = 1; k < 5; k++) grid += `M${n2(o + k * c)} ${n2(o)}v${c}`;
    body += `<path d="${grid}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let i = 0; i < a + b; i++) {
        const cx = o + (i + 0.5) * c, cy = o + c / 2;
        body += i < a ? dot(cx, cy, 6.5) : shapeOf('circle').draw(cx, cy, 7);
    }
    return svg(ctx, 5 * c + 2 * o, c + 2 * o, body, { label: `${a} and ${b} counters in a five frame` });
}

function joinPicture(ctx, p) {
    const plus = opSpan(ctx, '+');
    if (p.objects === 'frame') return partFrame(ctx, p.n, p.m);
    const part = (k) => (p.objects === 'dice' ? dicePicture(ctx, k) : objectRow(ctx, k, p.shape));
    return `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 3)};white-space:nowrap;">`
        + `<div style="flex:none;">${part(p.n)}</div>${plus}<div style="flex:none;">${part(p.m)}</div></div>`;
}

/** n rods of ten, gridded (RP-30: u x 10u at u = 3.5 mm, the L unit; 0.5 pt unit lines), 4 mm apart. */
function rodsPicture(ctx, n) {
    const u = 3.5, gap = 4, o = SW.heavy / 2;
    let body = '';
    for (let i = 0; i < n; i++) {
        const x = o + i * (u + gap);
        body += `<rect x="${n2(x)}" y="${n2(o)}" width="${n2(u)}" height="${n2(10 * u)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        let d = '';
        for (let j = 1; j < 10; j++) d += `M${n2(x)} ${n2(o + j * u)}h${n2(u)}`;
        body += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`;
    }
    return svg(ctx, n * (u + gap) - gap + 2 * o, 10 * u + 2 * o, body, { label: `${n} rods of ten` });
}

/** n FULL ten frames (5 mm cells, 3.6 mm solid counters), three to a row. */
function fullFrames(ctx, n) {
    const c = 5, o = SW.heavy / 2, gapX = 4, gapY = 2.5, per = 3;
    const fw = 5 * c, fh = 2 * c;
    let body = '';
    for (let f = 0; f < n; f++) {
        const ox = o + (f % per) * (fw + gapX), oy = o + Math.floor(f / per) * (fh + gapY);
        body += `<path d="M${n2(ox)} ${n2(oy)}h${fw}v${fh}h${-fw}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        let g = '';
        for (let k = 1; k < 5; k++) g += `M${n2(ox + k * c)} ${n2(oy)}v${fh}`;
        g += `M${n2(ox)} ${n2(oy + c)}h${fw}`;
        body += `<path d="${g}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
        for (let i = 0; i < 10; i++) body += dot(ox + (i % 5 + 0.5) * c, oy + (Math.floor(i / 5) + 0.5) * c, 3.6);
    }
    const cols = Math.min(per, Math.max(1, n)), rows = Math.ceil(n / per);
    return svg(ctx, cols * (fw + gapX) - gapX + 2 * o, rows * (fh + gapY) - gapY + 2 * o, body, { label: `${n} full ten frames` });
}

/** The rule a tens cell carries (BD-10: a rule reminder, never the instruction). */
const ruleBox = (ctx, text) => `<div style="display:inline-block;border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 2.5)};`
    + `padding:${L(ctx, 1)} ${L(ctx, 3)};font-size:${P(ctx, textPt(ctx))};line-height:1.3;">${esc(text)}</div>`;

/** classify_count: the mixed bag in rows of five (RP-21; 9 mm objects, 12 mm pitch). */
function bagPicture(ctx, bag) {
    const d = 9, pitch = 12, cols = Math.min(5, bag.length), rows = Math.ceil(bag.length / cols);
    let body = '';
    bag.forEach((s, i) => { body += shapeOf(s).draw(0.5 + d / 2 + (i % cols) * pitch, 0.5 + d / 2 + Math.floor(i / cols) * pitch, d); });
    return svg(ctx, (cols - 1) * pitch + d + 1, (rows - 1) * pitch + d + 1, body, { label: `${bag.length} mixed objects` });
}
/** The key: one specimen of the kind to count in a box (the referent of "Count only the stars"). */
function keySpecimen(ctx, s) {
    const w = 14, o = SW.heavy / 2;
    const body = `<rect x="${n2(o)}" y="${n2(o)}" width="${n2(w - 2 * o)}" height="${n2(w - 2 * o)}" rx="2" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
        + shapeOf(s).draw(w / 2, w / 2, 9);
    return svg(ctx, w, w, body, { label: `count the ${shapeOf(s).plural}` });
}

/** teen_compose: a full ten frame over the loose ones, on the frame's own 9 mm columns. */
function teenFrame(ctx, ones) {
    const c = 9, o = SW.heavy / 2, gap = 4;
    const rows = Math.ceil(ones / 5);
    let body = `<path d="M${n2(o)} ${n2(o)}h${5 * c}v${2 * c}h${-5 * c}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    let g = '';
    for (let k = 1; k < 5; k++) g += `M${n2(o + k * c)} ${n2(o)}v${2 * c}`;
    g += `M${n2(o)} ${n2(o + c)}h${5 * c}`;
    body += `<path d="${g}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let i = 0; i < 10; i++) body += dot(o + (i % 5 + 0.5) * c, o + (Math.floor(i / 5) + 0.5) * c, 6);
    const top = o + 2 * c + gap;
    for (let i = 0; i < ones; i++) body += dot(o + (i % 5 + 0.5) * c, top + (Math.floor(i / 5) + 0.5) * c, 6);
    return svg(ctx, 5 * c + 2 * o, 2 * c + gap + rows * c + 2 * o, body, { label: `a full ten frame and ${ones} counters` });
}
/**
 * teen_compose "blocks": one rod of ten (4 mm units, upright: 40 mm, the height of the ten frame
 * and two rows of ones, so the page keeps its density) and the ones as cubes the size of one unit
 * of the rod, 2 wide, standing on the rod's baseline.
 */
function teenBlocks(ctx, ones) {
    const u = 4, o = SW.heavy / 2, gapX = 7, pitch = u + 1.5;
    const cubeRows = Math.ceil(ones / 2);
    const w = u + gapX + Math.min(2, ones) * pitch - 1.5 + 2 * o, h = 10 * u + 2 * o;
    let body = `<rect x="${n2(o)}" y="${n2(o)}" width="${u}" height="${10 * u}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    let d = '';
    for (let j = 1; j < 10; j++) d += `M${n2(o)} ${n2(o + j * u)}h${u}`;
    body += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    // the cubes stand on the rod's baseline
    const y0 = o + 10 * u - (cubeRows * pitch - 1.5);
    for (let i = 0; i < ones; i++) {
        body += `<rect x="${n2(o + u + gapX + (i % 2) * pitch)}" y="${n2(y0 + Math.floor(i / 2) * pitch)}" width="${u}" height="${u}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    }
    return svg(ctx, w, h, body, { label: `a rod of ten and ${ones} cubes` });
}

/* ---------------------------------------------------- build lane k2 (2026-09-25): zero means none
 * zero_none: a PLATE (a round plate seen from above: a 1.5 pt rim and a 0.75 pt inner ring), a BOX
 * (an open box seen from above: a 1.5 pt wall and a 0.75 pt inner edge) or a TEN FRAME, holding 0
 * to 10 objects in centred rows of at most four (rows of 2-4 at a 9 mm pitch, never touching the
 * rim). An empty plate is a real item: the pupil writes 0 (R.B7.S1). Nothing labels the count.
 */
const PLATE_ROWS = { 0: [], 1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [2, 3, 2], 8: [3, 2, 3], 9: [3, 3, 3], 10: [3, 4, 3] };
function holderPicture(ctx, n, shape, p, { scale = 1, crossed = false } = {}) {
    const s = scale;
    if (p.objects === 'frame') {
        const c = 9 * s, o = SW.heavy / 2;
        let body = `<path d="M${n2(o)} ${n2(o)}h${n2(5 * c)}v${n2(2 * c)}h${n2(-5 * c)}Z" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        let g = '';
        for (let k = 1; k < 5; k++) g += `M${n2(o + k * c)} ${n2(o)}v${n2(2 * c)}`;
        g += `M${n2(o)} ${n2(o + c)}h${n2(5 * c)}`;
        body += `<path d="${g}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
        for (let i = 0; i < Math.min(10, n); i++) {
            const cx = o + (i % 5 + 0.5) * c, cy = o + (Math.floor(i / 5) + 0.5) * c;
            body += dot(cx, cy, 6 * s);
            if (crossed) body += cross(cx, cy, 6 * s);
        }
        return svg(ctx, 5 * c + 2 * o, 2 * c + 2 * o, body, { label: 'a ten frame' });
    }
    const R = 22 * s, inner = 18.6 * s, pitch = 9 * s, d = 7.2 * s, pad = 1;
    const box = p.objects === 'boxes';
    const W = 2 * R + 2 * pad, H = box ? 1.64 * R + 2 * pad : W;
    const cx0 = W / 2, cy0 = H / 2;
    let body = box
        ? `<rect x="${n2(pad)}" y="${n2(pad)}" width="${n2(2 * R)}" height="${n2(1.64 * R)}" rx="${n2(1.5 * s)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
            + `<rect x="${n2(pad + 3.2 * s)}" y="${n2(pad + 3.2 * s)}" width="${n2(2 * R - 6.4 * s)}" height="${n2(1.64 * R - 6.4 * s)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`
        : `<circle cx="${n2(cx0)}" cy="${n2(cy0)}" r="${n2(R)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
            + `<circle cx="${n2(cx0)}" cy="${n2(cy0)}" r="${n2(inner)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    const rows = PLATE_ROWS[Math.max(0, Math.min(10, n))] || [];
    rows.forEach((k, r) => {
        const y = cy0 + (r - (rows.length - 1) / 2) * pitch;
        for (let j = 0; j < k; j++) {
            const x = cx0 + (j - (k - 1) / 2) * pitch;
            body += shapeOf(shape).draw(x, y, d);
            if (crossed) body += cross(x, y, d);
        }
    });
    return svg(ctx, W, H, body, { label: box ? 'a box' : 'a plate' });
}

register('counters', {
    render(p, ctx) {
        const kv = p.ans;
        if (p.kind === 'zero') {
            const k = pscale(ctx);
            if (p.task === 'which') {
                // Three holders tagged A, B, C, one of them empty: check the one with none.
                const on = checkedChoice(p, ctx, LETTERS.slice(0, (p.counts || []).length));
                const choices = (p.counts || []).map((n, i) => ({ pic: holderPicture(ctx, n, p.shape, p, { scale: 0.62 * k }), label: LETTERS[i] }));
                return root(ctx, 'k2-zero', choiceRow(ctx, choices, { on, gapMm: 5 }));
            }
            if (p.task === 'takeaway') {
                const b = inlineBoxMm(ctx, 1);
                const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
                return root(ctx, 'k2-zero', `<div style="display:flex;justify-content:center;">${holderPicture(ctx, p.n, p.shape, p, { scale: k, crossed: true })}</div>`
                    + eqRowOf(ctx, [eqSpan(ctx, p.n), opSpan(ctx, MINUS), eqSpan(ctx, p.n), opSpan(ctx, '='), slot]));
            }
            const sq = squareMm(ctx);
            const tctx = p.traced && ctx.state === 'blank' ? Object.assign({}, ctx, { state: 'traced' }) : ctx;
            const slot = box(tctx, { value: slotValue(tctx, 'answer', kv), w: sq, h: sq, mark: 'blank' });
            return root(ctx, 'k2-zero', `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:${L(ctx, 4)};">`
                + `<div style="display:flex;justify-content:center;"><div style="flex:none;">${holderPicture(ctx, p.n, p.shape, p, { scale: k })}</div></div>${slot}</div>`
                + (p.track ? `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};">${numberTrack(ctx, 0, p.track)}</div>` : ''),
            isTwin(ctx) ? {} : { style: 'width:100%;box-sizing:border-box;' });
        }
        if (p.kind === 'takeaway') {
            const b = inlineBoxMm(ctx, 1);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            // R3: `crossOnKey` (a story's work space) draws the objects uncrossed for the pupil, who
            // does the take-away; the key shows the crosses.
            const crossed = p.crossOnKey && ctx.state === 'blank' ? 0 : p.m;
            return root(ctx, 'k2-takeaway', `<div style="display:flex;justify-content:center;">${p.objects === 'frame' ? takeawayFrame(ctx, p.n, crossed) : takeawayPicture(ctx, p.n, crossed, p.shape)}</div>`
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
        const eqRow = (parts) => `<div class="ws-eq" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};margin-top:${L(ctx, 5)};white-space:nowrap;">${parts.join('')}</div>`;
        if (p.kind === 'join') {
            const b = inlineBoxMm(ctx, 1);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            return root(ctx, 'k2-join', `<div style="display:flex;justify-content:center;">${joinPicture(ctx, p)}</div>`
                + eqRow([eqSpan(ctx, p.n), opSpan(ctx, '+'), eqSpan(ctx, p.m), opSpan(ctx, '='), slot]));
        }
        if (p.kind === 'tens') {
            const b = inlineBoxMm(ctx, 1);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            const frames = p.objects === 'frame';
            return root(ctx, 'k2-tens', `<div>${ruleBox(ctx, frames ? 'One full frame is one ten.' : 'One rod is one ten.')}</div>`
                + `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 2)};">${frames ? fullFrames(ctx, p.n) : rodsPicture(ctx, p.n)}</div>`
                + `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2.5)};margin-top:${L(ctx, 3)};`
                + `font-size:${P(ctx, textPt(ctx) + 3)};white-space:nowrap;">${slot}<span>tens</span></div>`);
        }
        if (p.kind === 'sort') {
            const sq = squareMm(ctx);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: sq, h: sq, mark: 'blank' });
            return root(ctx, 'k2-sort', `<div style="display:flex;justify-content:center;margin-bottom:${L(ctx, 3)};">${keySpecimen(ctx, p.asked)}</div>`
                + `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:${L(ctx, 4)};">`
                + `<div style="display:flex;justify-content:center;"><div style="flex:none;">${bagPicture(ctx, p.bag || [])}</div></div>${slot}</div>`,
            isTwin(ctx) ? {} : { style: 'width:100%;box-sizing:border-box;' });
        }
        if (p.kind === 'teen') {
            const b = inlineBoxMm(ctx, 2);
            const slot = box(ctx, { value: slotValue(ctx, 'answer', kv), w: b.w, h: b.h, mark: 'blank' });
            const sentence = p.askTotal ? [eqSpan(ctx, 10), opSpan(ctx, '+'), eqSpan(ctx, p.ones), opSpan(ctx, '='), slot]
                : [eqSpan(ctx, 10), opSpan(ctx, '+'), slot, opSpan(ctx, '='), eqSpan(ctx, 10 + p.ones)];
            return root(ctx, 'k2-teen', `<div style="display:flex;justify-content:center;">${p.objects === 'blocks' ? teenBlocks(ctx, p.ones) : teenFrame(ctx, p.ones)}</div>`
                + eqRow(sentence));
        }
        // count
        const sq = squareMm(ctx);
        // P11 Support level 3: the answer written in grey to trace (the traced state of the slot).
        const tctx = p.traced && ctx.state === 'blank' ? Object.assign({}, ctx, { state: 'traced' }) : ctx;
        const slot = box(tctx, { value: slotValue(tctx, 'answer', kv), w: sq, h: sq, mark: 'blank' });
        // Round-3 re-grade: the answer box stands at ONE place in every cell (the cell's right),
        // the objects centred in the room left of it - a box that followed each picture's width
        // jumped about from cell to cell.
        const pp = ctx.state === 'traced' && !p.objects && p.layout !== 'scattered' ? Object.assign({}, p, { countMarks: true }) : p;
        return root(ctx, 'k2-count', `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:${L(ctx, 4)};">`
            + `<div style="display:flex;justify-content:center;"><div style="flex:none;">${countPicture(ctx, p.n, p.shape, pp)}</div></div>${slot}</div>`
            // P11 Support level 2: a number track under the picture to point along.
            + (p.track ? `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};">${trackStrip(ctx, p.track)}</div>` : ''),
        isTwin(ctx) ? {} : { style: 'width:100%;box-sizing:border-box;' });
    },
    answerKey(p) {
        const v = p.ans;
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint(p) {
        return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs(p) {
        if (p && p.kind === 'zero' && p.task === 'which') return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});

export const COUNTERS_TEMPLATE = 'counters';
