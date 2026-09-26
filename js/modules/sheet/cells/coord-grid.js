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
//     read       the points drawn; one answer row per point: "A ( [ ] , [ ] )"
//     plot       the grid empty; the points to plot are printed as a list; the pupil draws the dots
//                and the key does
//     transform  a shape on a grid and three grids A-C, one showing the shape moved as asked (a
//                translation, a reflection over an axis, a turn about the origin); the pupil checks
//                the grid that shows it (the skill is a choice on screen and on paper)
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
export function gridSVG(ctx, { x0, x1, y0, y1, u, numerals = true, step = 2, points = [], shapes = [], guides = false, label = '' }) {
    const nPt = textPt(ctx), nMm = nPt * PT_MM;
    // room for the numerals (left, bottom) and the axis names (the y over the top, the x at the right)
    const padL = numerals ? nMm * 1.9 + 1.5 : 1.5, padB = numerals ? nMm + 2 : 1.5, padT = 3.2 + nMm + 0.5, padR = 3.2 + nMm * 0.7 + 0.8;
    const W = (x1 - x0) * u + padL + padR, H = (y1 - y0) * u + padT + padB;
    const X = (x) => padL + (x - x0) * u, Y = (y) => padT + (y1 - y) * u;
    let body = `<rect x="${n2(X(x0))}" y="${n2(Y(y1))}" width="${n2((x1 - x0) * u)}" height="${n2((y1 - y0) * u)}" fill="#fff"/>`;
    for (let x = x0; x <= x1; x++) body += `<line x1="${n2(X(x))}" y1="${n2(Y(y0))}" x2="${n2(X(x))}" y2="${n2(Y(y1))}" stroke="${GREY}" stroke-width="${n2(SW.fine)}"/>`;
    for (let y = y0; y <= y1; y++) body += `<line x1="${n2(X(x0))}" y1="${n2(Y(y))}" x2="${n2(X(x1))}" y2="${n2(Y(y))}" stroke="${GREY}" stroke-width="${n2(SW.fine)}"/>`;
    // the axes: x = 0 and y = 0, ink, with their names at the ends
    const ax = Math.min(Math.max(0, x0), x1), ay = Math.min(Math.max(0, y0), y1);
    body += `<line x1="${n2(X(x0))}" y1="${n2(Y(ay))}" x2="${n2(X(x1) + 2.5)}" y2="${n2(Y(ay))}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-ws-axis="x"/>`;
    body += `<line x1="${n2(X(ax))}" y1="${n2(Y(y0))}" x2="${n2(X(ax))}" y2="${n2(Y(y1) - 2.5)}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-ws-axis="y"/>`;
    const nm = (x, y, t, anchor = 'middle', italic = false) => `<text x="${n2(x)}" y="${n2(y)}" text-anchor="${anchor}" ${FONT} font-size="${n2(nMm)}"${italic ? ' font-weight="700"' : ''} fill="${INK}">${t}</text>`;
    body += nm(X(x1) + 3.2, Y(ay) + nMm * 0.35, 'x', 'start', true) + nm(X(ax), Y(y1) - 3.2, 'y', 'middle', true);
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
    const hit = (r) => taken.some((t) => r[0] < t[2] && t[0] < r[2] && r[1] < t[3] && t[1] < r[3])
        || points.some((q) => { const cx = X(q.x), cy = Y(q.y); return cx > r[0] - 1.1 && cx < r[2] + 1.1 && cy > r[1] - 1.1 && cy < r[3] + 1.1; })
        || (X(ax) > r[0] && X(ax) < r[2]) || (Y(ay) > r[1] && Y(ay) < r[3]);
    const place = (p) => {
        const w = String(p.label).length * 0.62 * lMm;
        for (const [sx, sy] of [[1, -1], [-1, -1], [1, 1], [-1, 1]]) {
            const x = sx > 0 ? X(p.x) + 1.4 : X(p.x) - 1.4 - w, y = sy < 0 ? Y(p.y) - 1.2 : Y(p.y) + 1.2 + lMm * 0.75;
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
    return { html: svg(ctx, W, H, body, { cls: 'cg-grid', label: label || 'a coordinate grid' }), W, H };
}

const stepOf = (p) => (p.labels === 'all' ? 1 : 2);
/** The square size of a read / plot grid: its size's unit, smaller when the grid is wide. */
/** The room (mm between line centres) numerals every `s` lines need on a grid from lo to hi:
 *  half of each neighbour's width at the text size, and a gap. */
function roomFor(lo, hi, s, ctx) {
    const w = (v) => minus(v).length * 0.58 * textPt(ctx) * PT_MM;
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
/** The square size of a transform's four choice grids (one row across the page) and the shape's grid. */
function smallOf(p, ctx) {
    // one row across the cell (about 176 mm): the shape's grid (its numerals take about 14 mm),
    // the choices (about 9 mm of edge each) and the gaps between them
    const k = (p.choices || []).length || 3;
    const room = 176 - 14 - 6 - 9 * k - 4 * (k - 1);
    return Math.min(SMALL[sizeOf(ctx)], room / ((1.25 + k) * ((p.x1 - p.x0) || 1)));
}

/** The value a slot shows in this state. */
function valueOf(p, ctx, id, right) {
    if (ctx.state === 'wrong') { const w = ctx.wrong || {}; return w.slots && w.slots[id] !== undefined ? String(w.slots[id]) : ''; }
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
        + box(bctx, { id: `x${i}`, value: valueOf(p, ctx, `x${i}`, minus(pt.x)), w, h, mark: 'cell' })
        + t(',') + box(bctx, { id: `y${i}`, value: valueOf(p, ctx, `y${i}`, minus(pt.y)), w, h, mark: 'cell' }) + t(')')
        + `</div>`).join('');
}

function renderRead(p, ctx) {
    const u = unitOf(p, ctx);
    const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step: stepFor(stepOf(p), u, ctx, Math.min(p.x0, p.y0), Math.max(p.x1, p.y1)),
        points: p.points, guides: hintsOn(p, ctx), label: `points ${(p.points || []).map((q) => q.label).join(', ')} on a grid` });
    const rows = p.noAsk ? '' : `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};" data-mq-join=", ">${readRows(p, ctx)}</div>`;
    return `<div style="line-height:0;">${g.html}</div>${rows}`;
}

function renderPlot(p, ctx) {
    const shows = ctx.state === 'answered' || ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const grey = ctx.state !== 'answered';
    const u = unitOf(p, ctx);
    const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u, step: stepFor(stepOf(p), u, ctx, Math.min(p.x0, p.y0), Math.max(p.x1, p.y1)),
        points: shows ? (p.points || []).map((q) => ({ ...q, grey })) : [], label: 'an empty coordinate grid' });
    const list = (p.points || []).map((q) => `<b>${esc(q.label)}</b>&nbsp;(${minus(q.x)},&nbsp;${minus(q.y)})`).join('&nbsp;&nbsp; ');
    const task = p.noAsk ? '' : `<div class="cg-list" style="font-size:${P(ctx, textPt(ctx) + 2)};line-height:1.3;max-width:${L(ctx, COORD_COL[sizeOf(ctx)].wMm - 8)};">Plot ${list}</div>`;
    return `${task}<div style="line-height:0;" data-ws-slot="plot" data-ws-shape="open">${g.html}</div>`;
}

function renderTransform(p, ctx) {
    const us = smallOf(p, ctx);
    const big = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u: us * 1.25, step: stepFor(2, us * 1.25, ctx, p.x0, p.x1), shapes: [{ pts: p.shape }], label: 'the shape' });
    let on = -1;
    if (ctx.state === 'answered' || ctx.state === 'traced' || (ctx.state === 'blank' && p.traced)) on = p.correct;
    else if (ctx.state === 'wrong') { const w = ctx.wrong || {}; on = LETTERS.indexOf(String(w.slots && w.slots.choice !== undefined ? w.slots.choice : w.value)); }
    const tctx = ctx.state === 'blank' && p.traced ? { ...ctx, state: 'traced' } : ctx;
    const opts = (p.choices || []).map((pts, i) => {
        const g = gridSVG(ctx, { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, u: us, numerals: false, shapes: [{ pts }], label: `grid ${LETTERS[i]}` });
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};">`
            + `<div style="line-height:0;">${g.html}</div>`
            + `<div style="display:flex;align-items:center;gap:${L(ctx, 2)};"><span style="font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;">${LETTERS[i]}</span>`
            + checkBox(tctx, { id: `choice${i}`, on: i === on, slot: false }) + `</div></div>`;
    }).join('');
    const ink = on >= 0 ? ` data-ws-ink="${tctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    const choices = p.noAsk ? '' : `<div data-ws-slot="choice" data-ws-shape="check"${ink} style="display:flex;flex-wrap:nowrap;justify-content:center;align-items:flex-end;gap:${L(ctx, 4)};">${opts}</div>`;
    const task = `<div class="cg-task" style="font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.3;">${esc(p.task || '')}</div>`;
    return `${p.noAsk ? '' : task}<div style="display:flex;align-items:flex-end;justify-content:center;gap:${L(ctx, 6)};flex-wrap:nowrap;">`
        + `<div style="line-height:0;">${big.html}</div>${choices}</div>`;
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
        const disp = pts.map((q) => `${q.label} (${minus(q.x)}, ${minus(q.y)})`).join(', ');
        if (p.kind === 'plot') return { value: disp, display: disp, slots: {} };
        const slots = {};
        pts.forEach((q, i) => { slots[`x${i}`] = { value: String(q.x), graded: true }; slots[`y${i}`] = { value: String(q.y), graded: true }; });
        return { value: pts.map((q) => `${q.x}, ${q.y}`).join(', '), display: disp, slots };
    },
    footprint(p, ctx) {
        if (p.kind === 'transform') return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 };
        const col = COORD_COL[sizeOf(ctx)];
        return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
    },
    inputs(p) {
        if (p.kind === 'transform') return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'answer-only', 'decision'] }];
        if (p.kind === 'plot') return [];
        const out = [];
        (p.points || []).forEach((q, i) => {
            out.push({ id: `x${i}`, kind: 'number', shape: 'box', graded: true, order: 2 * i, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
            out.push({ id: `y${i}`, kind: 'number', shape: 'box', graded: true, order: 2 * i + 1, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        });
        return out;
    },
    layout(p) { return { card: p && p.kind === 'transform' ? 'card-wide-visual' : 'card-medium-visual', checker: 'value' }; },
});

export const COORD_TEMPLATE_IDS = Object.freeze(['coord-grid']);
