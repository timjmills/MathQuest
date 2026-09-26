// js/modules/sheet/cells/coord-grid.js
// The `coord-grid` template (build lane geometry, vis_migrate_coordinates): a coordinate grid in
// black and white, on paper, on the key and on screen.
//
//   the grid     unit squares of 5 / 5.5 / 6.5 mm at S / M / L (grey 0.5 pt lines, the single grey),
//                the axes in ink (1.5 pt) with x and y at their ends, every numbered line's numeral
//                at the TEXT size (never under 11 pt: options-r3 printed 5-8 pt), every other line
//                numbered by default (Figure labels "some"), every line with "all"
//   points       an ink dot (2.2 mm) and its letter, bold, up and to the right, on a white halo
//   kinds
//     read       the points drawn; one answer row per point: "A ( [ ] , [ ] )" (slots px0, py0 ...:
//                an error-analysis page reads every slot as a part; "x0" is a reserved id there)
//     plot       the grid empty; the points to plot are printed as a list; the pupil draws the dots
//                and the key does
//     transform  a shape on a grid and three grids A-C, one showing the shape moved as asked (a
//                translation, a reflection over an axis, a turn about the origin); the pupil checks
//                the grid that shows it (the skill is a choice on screen and on paper). geometry-r1:
//                the four grids stand in one row across the page at S and M, two to a row at L
//                (or when a long slide widens them), every one numbered,
//                squares 5 / 5 / 5.5 mm;
//                Support level 2 draws the mirror line, the turn arrow or the slide arrow
//   screen       the plot twin carries data-mq-model="coord-plot": a tap on the grid puts a dot on
//                the nearest crossing (screen-cell.js mountModel), the same grid as the paper
//   numerals     at the text size + 1 (12 pt at S: the 11 pt floor is never met by a 10 pt read)
//
// payload (plain data, SCC-Q3):
//   kind 'read' | 'plot' | 'transform'; x0, x1, y0, y1 the grid's range; labels 'all' | 'some'
//   points [{x, y, label}] (read, plot); shape [[x, y], ...] and choices [[[x, y], ...] x 4] and
//   correct (transform); noAsk (the screen twin of a typed item: the host supplies the boxes)
//   hint (Support level 2: grey guide lines from each point to both axes), traced (level 3)
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, textPt, box, checkBox, svg } from './k2kit.js';

const FONT = `font-family="Andika, 'Open Sans', sans-serif"`;
const UNIT = { S: 4.5, M: 4.8, L: 4.8 };
const SMALL = { S: 2.6, M: 3, L: 3.4 };      // the four choice grids of a transform
export const COORD_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
export const LETTERS = ['A', 'B', 'C', 'D'];

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);
const hintsOn = (p, ctx) => !!p.hint || !!p.traced || levelOf(ctx) >= 2;
const minus = (v) => (v < 0 ? `−${-v}` : String(v));

/**
 * A grid from (x0, y0) to (x1, y1) at `u` mm a square. `opts`: numerals (bool), step (label every
 * n lines), points [{x, y, label, grey}], shapes [{pts, grey}], guides (grey lines to the axes).
 */
export function gridSVG(ctx, { x0, x1, y0, y1, u, numerals = true, step = 2, points = [], shapes = [], guides = false, label = '', extra = '', names = true, pt = null, axisNames = null }) {
    const nPt = pt || textPt(ctx) + 1, nMm = nPt * PT_MM;
    // room for the numerals (left, bottom) and the axis names (the y over the top, the x at the right)
    const wide = Math.max(...[x0, y0].map((v) => minus(v).length), ...[x1, y1].map((v) => minus(v).length));
    const padL = numerals ? nMm * 0.6 * wide + 2.2 : 1.5, padB = numerals ? nMm + 2 : 1.5;
    let padT = names ? 3.2 + nMm + 0.5 : 1.5, padR = names ? 3.2 + nMm * 0.7 + 0.8 : 1.5;
    // a situation's axes (coordinate_graph, 5.G.2): the x-axis name under its numerals, the y-axis
    // name over the y-axis, both at the text size
    const padB2 = axisNames ? padB + nMm + 1.5 : padB;
    if (axisNames) { padT = 3.2 + nMm + 0.5; padR = 1.5 + nMm * 0.6; }
    const W = Math.max((x1 - x0) * u + padL + padR, axisNames ? padL + String(axisNames.y).length * nMm * 0.55 : 0), H = (y1 - y0) * u + padT + padB2;
    const X = (x) => padL + (x - x0) * u, Y = (y) => padT + (y1 - y) * u;
    let body = `<rect x="${n2(X(x0))}" y="${n2(Y(y1))}" width="${n2((x1 - x0) * u)}" height="${n2((y1 - y0) * u)}" fill="#fff"/>`;
    for (let x = x0; x <= x1; x++) body += `<line x1="${n2(X(x))}" y1="${n2(Y(y0))}" x2="${n2(X(x))}" y2="${n2(Y(y1))}" stroke="${GREY}" stroke-width="${n2(SW.fine)}"/>`;
    for (let y = y0; y <= y1; y++) body += `<line x1="${n2(X(x0))}" y1="${n2(Y(y))}" x2="${n2(X(x1))}" y2="${n2(Y(y))}" stroke="${GREY}" stroke-width="${n2(SW.fine)}"/>`;
    // the axes: x = 0 and y = 0, ink, with their names at the ends
    const ax = Math.min(Math.max(0, x0), x1), ay = Math.min(Math.max(0, y0), y1);
    body += `<line x1="${n2(X(x0))}" y1="${n2(Y(ay))}" x2="${n2(X(x1) + 2.5)}" y2="${n2(Y(ay))}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-ws-axis="x"/>`;
    body += `<line x1="${n2(X(ax))}" y1="${n2(Y(y0))}" x2="${n2(X(ax))}" y2="${n2(Y(y1) - 2.5)}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-ws-axis="y"/>`;
    const nm = (x, y, t, anchor = 'middle', italic = false) => `<text x="${n2(x)}" y="${n2(y)}" text-anchor="${anchor}" ${FONT} font-size="${n2(nMm)}"${italic ? ' font-weight="700"' : ''} fill="${INK}">${t}</text>`;
    if (axisNames) {
        body += nm(X((x0 + x1) / 2), Y(y0) + nMm + 0.6 + nMm + 1.2, esc(axisNames.x), 'middle', true)
            + nm(X(ax), Y(y1) - 3.2, esc(axisNames.y), 'start', true);
    } else if (names) body += nm(X(x1) + 3.2, Y(ay) + nMm * 0.35, 'x', 'start', true) + nm(X(ax), Y(y1) - 3.2, 'y', 'middle', true);
    if (numerals) {
        // A first-quadrant grid numbers its axes (they are its edges; 0 once, at the corner). A grid
        // with negatives numbers its bottom and left EDGES, so a shape or a point on an axis never
        // sits on a numeral and the two -1s do not meet at the origin.
        const out = x0 < 0 || y0 < 0;
        for (let x = x0; x <= x1; x++) {
            if (x % step) continue;
            body += nm(X(x), (out ? Y(y0) : Y(ay)) + nMm + 0.6, minus(x));
        }
        for (let y = y0; y <= y1; y++) {
            if (y % step) continue;
            if (y === 0 && !out) continue;
            body += nm((out ? X(x0) : X(ax)) - 1.2, Y(y) + nMm * 0.35, minus(y), 'end');
        }
    }
    for (const s of shapes) {
        const pts = s.pts.map(([x, y]) => `${n2(X(x))},${n2(Y(y))}`).join(' ');
        body += `<polygon points="${pts}" fill="none" stroke="${s.grey ? GREY : INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"${s.grey ? ' data-ws-ink="trace"' : ''}/>`;
    }
    // each letter takes the first corner of its dot (up-right, up-left, down-right, down-left) that
    // meets no other dot, letter or axis
    const lMm = (nPt + 1) * PT_MM, taken = [];
    const G = 0.9;   // a letter keeps this gap from another letter
    const hit = (r) => taken.some((t) => r[0] - G < t[2] && t[0] - G < r[2] && r[1] - G < t[3] && t[1] - G < r[3])
        || points.some((q) => { const cx = X(q.x), cy = Y(q.y); return cx > r[0] - 1.1 && cx < r[2] + 1.1 && cy > r[1] - 1.1 && cy < r[3] + 1.1; })
        || (X(ax) > r[0] && X(ax) < r[2]) || (Y(ay) > r[1] && Y(ay) < r[3]);
    const place = (p) => {
        const w = String(p.label).length * 0.62 * lMm;
        for (const [sx, sy, d] of [[1, -1, 1.4], [-1, -1, 1.4], [1, 1, 1.4], [-1, 1, 1.4], [1, -1, 2.8], [-1, -1, 2.8], [1, 1, 2.8], [-1, 1, 2.8]]) {
            const x = sx > 0 ? X(p.x) + d : X(p.x) - d - w, y = sy < 0 ? Y(p.y) - d + 0.2 : Y(p.y) + d - 0.2 + lMm * 0.75;
            const r = [x, y - lMm * 0.75, x + w, y];
            if (!hit(r)) { taken.push(r); return [x, y]; }
        }
        const x = X(p.x) + 1.4, y = Y(p.y) - 1.2;
        taken.push([x, y - lMm * 0.75, x + w, y]);
        return [x, y];
    };
    for (const p of points) {
        const col = p.grey ? GREY : INK;
        if (guides) {
            body += `<line x1="${n2(X(p.x))}" y1="${n2(Y(p.y))}" x2="${n2(X(p.x))}" y2="${n2(Y(ay))}" stroke="${GREY}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-hint="guide"/>`;
            body += `<line x1="${n2(X(p.x))}" y1="${n2(Y(p.y))}" x2="${n2(X(ax))}" y2="${n2(Y(p.y))}" stroke="${GREY}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-hint="guide"/>`;
        }
        body += `<circle cx="${n2(X(p.x))}" cy="${n2(Y(p.y))}" r="1.1" fill="${col}"${p.grey ? ' data-ws-ink="trace"' : ''}/>`;
        if (p.label) {
            const [lx, ly] = place(p);
            body += `<text x="${n2(lx)}" y="${n2(ly)}" ${FONT} font-size="${n2((nPt + 1) * PT_MM)}" font-weight="700" fill="${col}" stroke="#fff" stroke-width="0.9" paint-order="stroke">${esc(p.label)}</text>`;
        }
    }
    body += typeof extra === 'function' ? extra(X, Y) : extra;
    return { html: svg(ctx, W, H, body, { cls: 'cg-grid', label: label || 'a coordinate grid' }), W, H, padL, padT };
}

const stepOf = (p) => (p.labels === 'all' ? 1 : 2);
/** The square size of a read / plot grid: its size's unit, smaller when the grid is wide. */
/** The room (mm between line centres) numerals every `s` lines need on a grid from lo to hi:
 *  half of each neighbour's width at the text size, and a gap. */
function roomFor(lo, hi, s, ctx) {
    const w = (v) => minus(v).length * 0.58 * (textPt(ctx) + 1) * PT_MM;
    let need = 0;
    const vals = [];
    for (let v = lo; v <= hi; v++) if (v % s === 0) vals.push(v);
    for (let i = 1; i < vals.length; i++) need = Math.max(need, (w(vals[i - 1]) + w(vals[i])) / 2 + 0.8);
    return need / s;
}
/** The square size of a read / plot grid: its size's unit, smaller when the grid is wide; with
 *  "Figure labels: all" the squares grow (while the grid fits its column) so every line is numbered. */
function unitOf(p, ctx) {
    const cap = (COORD_COL[sizeOf(ctx)].wMm - 26) / ((p.x1 - p.x0) || 1);
    let u = Math.min(UNIT[sizeOf(ctx)], cap);
    if (p.labels === 'all') u = Math.min(cap, Math.max(u, roomFor(p.x0, p.x1, 1, ctx), roomFor(p.y0, p.y1, 1, ctx)));
    return u;
}
/** Every how many lines a numeral stands: the option's step, or more when the squares are small. */
function stepFor(want, u, ctx, lo = -10, hi = 10) {
    return [1, 2, 4, 5, 10].find((s) => s >= want && u >= roomFor(lo, hi, s, ctx) - 1e-9) || 10;
}
/** A transform's grids (geometry-r1: 2.9 mm squares could not be counted): squares 5 / 5 / 5.5 mm
 *  at S / M / L. At S the shape and its three choices stand in ONE row across the page (so S prints
 *  more items than L); at M and L two to a row. A long slide's wide grid takes smaller squares. */
const TSQ = { S: 5, M: 5, L: 5.5 };
// A full-width cell: at S and M the shape and its three choices in ONE row when their squares can
// stay 5 mm, else two to a row (a long slide's wide grid); at L, the big print, always two to a row,
// the letters beside the grids (two items a page: S prints three).
export const TRANSFORM_COL = { S: { wMm: 186, maxCols: 1 }, M: { wMm: 186, maxCols: 1 }, L: { wMm: 186, maxCols: 1 } };
const TGAP = 4;
/** The square size for `per` grids to a row: every grid's numerals, the shape's axis names, the gaps. */
function fitOf(p, ctx, per) {
    const span = (p.x1 - p.x0) || 1;
    const nMm = textPt(ctx) * PT_MM;
    const wide = Math.max(...[p.x0, p.y0, p.x1, p.y1].map((v) => minus(v).length));
    const padL = nMm * 0.6 * wide + 2.2, names = 3.2 + nMm * 0.7 + 0.8 - 1.5;
    const room = TRANSFORM_COL[sizeOf(ctx)].wMm - 8 - per * (padL + 1.5) - names - (per - 1) * TGAP;
    return room / (per * span);
}
const oneRow = (p, ctx) => sizeOf(ctx) !== 'L' && fitOf(p, ctx, 4) >= 4.9;
function smallOf(p, ctx) {
    return Math.min(TSQ[sizeOf(ctx)], Math.max(3.4, fitOf(p, ctx, oneRow(p, ctx) ? 4 : 2)));
}

/** The value a slot shows in this state. */
function valueOf(p, ctx, id, right) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        if (w.slots && w.slots[id] !== undefined) return String(w.slots[id]);
        // one box (a situation's value): the pupil's whole answer is its value
        return id === 'value' && w.value !== undefined && w.value !== null ? String(w.value) : '';
    }
    if (ctx.state === 'answered' || ctx.state === 'traced' || p.traced) return String(right);
    return '';
}

/** "A ( [ ] , [ ] )": one row per point. */
function readRows(p, ctx) {
    const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const t = (s, bold = false) => `<span style="font-size:${P(ctx, textPt(ctx) + 2)};line-height:1;${bold ? 'font-weight:700;' : ''}">${s}</span>`;
    const w = blankWidth(2, sizeOf(ctx)), h = S(ctx).writeMm;
    return (p.points || []).map((pt, i) => `<div class="cg-ask" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.2)};">`
        + t(esc(pt.label), true) + t('(')
        + box(bctx, { id: `px${i}`, value: valueOf(p, ctx, `px${i}`, minus(pt.x)), w, h, mark: 'cell' })
        + t(',') + box(bctx, { id: `py${i}`, value: valueOf(p, ctx, `py${i}`, minus(pt.y)), w, h, mark: 'cell' }) + t(')')
        + `</div>`).join('');
}

const isValue = (p) => !!(p.ask && p.ask.kind === 'value');
function renderRead(p, ctx) {
    const u = unitOf(p, ctx);
    const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step: stepFor(stepOf(p), u, ctx, Math.min(p.x0, p.y0), Math.max(p.x1, p.y1)),
        points: p.points, guides: hintsOn(p, ctx), axisNames: p.axisNames || null, label: `points ${(p.points || []).map((q) => q.label).join(', ')} on a grid` });
    if (isValue(p)) {
        // "How many miles after 3 hours? [ ]": the situation's question and one box (5.G.2)
        const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
        const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
        const pt = (p.points || [])[0] || { y: '' };
        const ask = `<div class="cg-ask" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};">`
            + `<span style="font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.25;">${esc(p.ask.text)}</span>`
            + box(bctx, { id: 'value', value: valueOf(p, ctx, 'value', pt.y), w: blankWidth(2, sizeOf(ctx)), h: S(ctx).writeMm + 2, mark: 'blank' }) + `</div>`;
        return `<div style="line-height:0;">${g.html}</div>${ask}`;
    }
    const rows = p.noAsk ? '' : `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};" data-mq-join=", ">${readRows(p, ctx)}</div>`;
    return `<div style="line-height:0;">${g.html}</div>${rows}`;
}

const attrJson = (o) => JSON.stringify(o).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
/** The points a written answer names: "A (5, −3), B (2, 1)" or "(5, -3)". */
export function pointsIn(v) {
    const out = [];
    const re = /([A-Z])?\s*\(\s*([−-]?\d+)\s*,\s*([−-]?\d+)\s*\)/g;
    let m;
    while ((m = re.exec(String(v || '')))) out.push({ label: m[1] || '', x: Number(m[2].replace('−', '-')), y: Number(m[3].replace('−', '-')) });
    return out;
}

function renderPlot(p, ctx) {
    const shows = ctx.state === 'answered' || ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const grey = ctx.state !== 'answered';
    // an error-analysis page: the pupil's own (wrong) dots, in ink
    let pts = shows ? (p.points || []).map((q) => ({ ...q, grey })) : [];
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        pts = pointsIn(w.slots && w.slots.plot !== undefined ? w.slots.plot : w.value);
    }
    const u = unitOf(p, ctx);
    const step = stepFor(stepOf(p), u, ctx, Math.min(p.x0, p.y0), Math.max(p.x1, p.y1));
    const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step, points: pts, guides: false, axisNames: p.axisNames || null, label: 'a coordinate grid to plot on' });
    const list = (p.points || []).map((q) => `<b>${esc(q.label)}</b>&nbsp;(${minus(q.x)},&nbsp;${minus(q.y)})`).join('&nbsp;&nbsp; ');
    // a situation's pairs are a table (5.G.2): its two columns are the axes' names
    const td = `border:${L(ctx, 0.25)} solid ${INK};padding:${L(ctx, 0.6)} ${L(ctx, 2)};text-align:center;`;
    const table = p.ask && p.ask.kind === 'table' && p.axisNames
        ? `<table class="cg-table" style="border-collapse:collapse;font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.2;">`
            + `<tr><th style="${td}">${esc(p.axisNames.x)}</th><th style="${td}">${esc(p.axisNames.y)}</th></tr>`
            + p.ask.rows.map(([x, y]) => `<tr><td style="${td}">${x}</td><td style="${td}">${y}</td></tr>`).join('') + `</table>` : '';
    const task = table || (p.noAsk || isTwin(ctx) ? '' : `<div class="cg-list" style="font-size:${P(ctx, textPt(ctx) + 2)};line-height:1.3;max-width:${L(ctx, COORD_COL[sizeOf(ctx)].wMm - 8)};">Plot ${list}</div>`);
    // the screen: a tap puts a dot on the nearest crossing (screen-cell.js mountModel 'coord-plot')
    const model = isTwin(ctx) ? ` data-mq-model="coord-plot" data-cg="${attrJson({ x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u: +u.toFixed(3),
        padL: +g.padL.toFixed(3), padT: +g.padT.toFixed(3), W: +g.W.toFixed(3), H: +g.H.toFixed(3), n: (p.points || []).length })}"` : '';
    return `${task}<div style="line-height:0;" data-ws-slot="plot" data-ws-shape="open"${model}>${g.html}</div>`;
}

/** Support level 2: the mirror line, the turn arrow or the slide arrow (grey, dotted), drawn on the shape's grid. */
function transformHint(p) {
    const h = p.hintKind || {};
    return (X, Y) => {
        // a hint is dotted grey (LS-4: a dash is only a cut line or a missing-digit box)
        const dash = `stroke="${GREY}" stroke-width="${n2(SW.one)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" fill="none" data-ws-hint="move"`;
        if (h.kind === 'mirror') {
            return h.axis === 'y' ? `<line x1="${n2(X(0))}" y1="${n2(Y(p.y0))}" x2="${n2(X(0))}" y2="${n2(Y(p.y1))}" ${dash}/>`
                : `<line x1="${n2(X(p.x0))}" y1="${n2(Y(0))}" x2="${n2(X(p.x1))}" y2="${n2(Y(0))}" ${dash}/>`;
        }
        if (h.kind === 'slide') {
            const [ax, ay] = h.from, [bx, by] = h.to;
            const tx = X(bx), ty = Y(by), fx = X(ax), fy = Y(ay);
            const len = Math.hypot(tx - fx, ty - fy) || 1, ux = (tx - fx) / len, uy = (ty - fy) / len;
            return `<line x1="${n2(fx)}" y1="${n2(fy)}" x2="${n2(tx)}" y2="${n2(ty)}" ${dash}/>`
                + `<path d="M${n2(tx - ux * 2 - uy * 1.2)},${n2(ty - uy * 2 + ux * 1.2)} L${n2(tx)},${n2(ty)} L${n2(tx - ux * 2 + uy * 1.2)},${n2(ty - uy * 2 - ux * 1.2)}" stroke="${GREY}" stroke-width="${n2(SW.one)}" fill="none" data-ws-hint="move"/>`;
        }
        if (h.kind === 'turn') {
            // an arc round the origin, clockwise, from the shape's first corner through the turn
            const r = Math.hypot(h.from[0], h.from[1]) * Math.abs(X(1) - X(0));
            const a0 = Math.atan2(-(h.from[1]), h.from[0]);      // page angle (y down)
            const a1 = a0 + (h.deg * Math.PI) / 180;
            const cx = X(0), cy = Y(0);
            const P0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], P1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
            const large = h.deg > 180 ? 1 : 0;
            const tang = [-Math.sin(a1), Math.cos(a1)];
            return `<path d="M${n2(P0[0])},${n2(P0[1])} A${n2(r)},${n2(r)} 0 ${large} 1 ${n2(P1[0])},${n2(P1[1])}" ${dash}/>`
                + `<path d="M${n2(P1[0] - tang[0] * 2 - tang[1] * 1.2)},${n2(P1[1] - tang[1] * 2 + tang[0] * 1.2)} L${n2(P1[0])},${n2(P1[1])} L${n2(P1[0] - tang[0] * 2 + tang[1] * 1.2)},${n2(P1[1] - tang[1] * 2 - tang[0] * 1.2)}" stroke="${GREY}" stroke-width="${n2(SW.one)}" fill="none" data-ws-hint="move"/>`;
        }
        return '';
    };
}

function renderTransform(p, ctx) {
    const u = smallOf(p, ctx);
    const step = stepFor(p.x1 - p.x0 > 8 ? 2 : 1, u, ctx, p.x0, p.x1);
    // "Figure labels": every grid numbered (the default), or the shape's grid alone (the pupil
    // counts squares on the choices)
    const numbered = p.labels !== 'some';
    const hints = hintsOn(p, ctx);
    const pt = textPt(ctx);
    const big = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step, shapes: [{ pts: p.shape }], pt,
        extra: hints ? transformHint(p) : '', label: 'the shape' });
    let on = -1;
    if (ctx.state === 'answered' || ctx.state === 'traced' || (ctx.state === 'blank' && p.traced)) on = p.correct;
    else if (ctx.state === 'wrong') { const w = ctx.wrong || {}; on = LETTERS.indexOf(String(w.slots && w.slots.choice !== undefined ? w.slots.choice : w.value).trim().toUpperCase()); }
    const tctx = ctx.state === 'blank' && p.traced ? { ...ctx, state: 'traced' } : ctx;
    // in one row the letter and its box stand under each grid; two to a row, beside it (the item
    // stays short enough for two on an L page)
    const row1 = oneRow(p, ctx);
    const cellOf = (inner, foot) => `<div style="display:flex;flex-direction:${row1 ? 'column' : 'row'};align-items:center;gap:${L(ctx, row1 ? 1.5 : 3)};">`
        + `<div style="line-height:0;">${inner}</div>${foot}</div>`;
    const opts = (p.choices || []).map((pts, i) => {
        const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step, shapes: [{ pts }], pt, names: false, numerals: numbered, label: `grid ${LETTERS[i]}` });
        return cellOf(g.html, `<div style="display:flex;align-items:center;gap:${L(ctx, 2)};"><span style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;">${LETTERS[i]}</span>`
            + checkBox(tctx, { id: `choice${i}`, on: i === on, slot: false }) + `</div>`);
    });
    const given = cellOf(big.html, `<div style="font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.2;font-weight:700;">The shape</div>`);
    const ink = on >= 0 ? ` data-ws-ink="${tctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    const grid2 = (a, b) => `<div style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, TGAP)};">${a}${b || ''}</div>`;
    const task = p.noAsk || isTwin(ctx) ? '' : `<div class="cg-task" style="font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.3;">${esc(p.task || '')}</div>`;
    if (p.noAsk) return `<div style="line-height:0;">${big.html}</div>`;
    const body = oneRow(p, ctx)
        ? `<div style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, TGAP)};">${given}${opts.join('')}</div>`
        : grid2(given, opts[0]) + grid2(opts[1], opts[2]);
    return `${task}<div data-ws-slot="choice" data-ws-shape="check"${ink} style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">`
        + body + `</div>`;
}

/** The grid alone (no answer rows), for a screen host that supplies its own boxes. */
export function coordPicture(p) {
    const ctx = { mode: 'print', size: 'M', look: 'ican', state: 'blank', options: { twin: true } };
    return `<div class="cg-picture" style="text-align:center;color:${INK};line-height:0;">${renderRead({ ...p, noAsk: true }, ctx)}</div>`;
}

const root = (ctx, inner) => `<div class="cg-cell"${isTwin(ctx) ? ' data-mq-cg="1"' : ''} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;`
    + `text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${inner}</div>`;

register('coord-grid', {
    render(p, ctx) {
        if (p.kind === 'transform') return root(ctx, renderTransform(p, ctx));
        if (p.kind === 'plot') return root(ctx, renderPlot(p, ctx));
        return root(ctx, renderRead(p, ctx));
    },
    answerKey(p) {
        if (p.kind === 'transform') { const v = LETTERS[p.correct]; return { value: v, display: v, slots: { choice: { value: v, graded: true } } }; }
        const pts = p.points || [];
        if (isValue(p)) { const v = String((pts[0] || {}).y); return { value: Number(v), display: v, slots: { value: { value: v, graded: true } } }; }
        const disp = pts.map((q) => `${q.label} (${minus(q.x)}, ${minus(q.y)})`).join(', ');
        if (p.kind === 'plot') return { value: disp, display: disp, slots: { plot: { value: disp, graded: false } } };
        const slots = {};
        pts.forEach((q, i) => { slots[`px${i}`] = { value: String(q.x), graded: true }; slots[`py${i}`] = { value: String(q.y), graded: true }; });
        return { value: pts.map((q) => `${q.x}, ${q.y}`).join(', '), display: disp, slots };
    },
    footprint(p, ctx) {
        if (p.kind === 'transform') { const col = TRANSFORM_COL[sizeOf(ctx)]; return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols }; }
        const col = COORD_COL[sizeOf(ctx)];
        return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
    },
    inputs(p) {
        if (p.kind === 'transform') return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'answer-only', 'decision'] }];
        if (p.kind === 'plot') return [];
        if (isValue(p)) return [{ id: 'value', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        const out = [];
        (p.points || []).forEach((q, i) => {
            out.push({ id: `px${i}`, kind: 'number', shape: 'box', graded: true, order: 2 * i, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
            out.push({ id: `py${i}`, kind: 'number', shape: 'box', graded: true, order: 2 * i + 1, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        });
        return out;
    },
    layout(p) { return { card: p && p.kind === 'transform' ? 'card-wide-visual' : 'card-medium-visual', checker: 'value' }; },
});

export const COORD_TEMPLATE_IDS = Object.freeze(['coord-grid']);
