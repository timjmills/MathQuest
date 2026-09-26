// js/modules/sheet/cells/shape-figure.js
// The `shape-grid` kind `figure` (build lane geometry, design/BUILD_LIST.md vis_migrate_area_volume):
// a flat figure in grid units with its measures to find. It serves the area and perimeter family:
//
//   area_unit_squares  a rectangle or rectilinear shape drawn IN unit squares; "Area = [ ] square units"
//   perimeter_grid     the same on squares ("Perimeter = [ ] units"), or a labelled rectangle / L-shape
//   perimeter, area, area_perimeter, composite_shapes   a labelled rectangle, square or L / T / U shape
//   area_triangle      a triangle with its base and its height (a dotted height, a right-angle mark)
//
// payload (plain data, SCC-Q3):
//   poly     [[x, y], ...] the outline in grid units, y down
//   grid     'squares' | 'none'                the unit squares drawn inside the figure (structural)
//   edges    [{i, v, show}]                    a label on edge i (poly[i] -> poly[i + 1]); v is a number
//                                              or '?' (the side to find); show false = not written
//   unit     'cm' | 'm' | 'in' | 'ft' | ''     written after every side length
//   height   {from, to, v, show}               the triangle's height: a dotted guide (LS-1) and its label
//   split    [[x, y], [x, y]]                  HINT: a dotted line that splits the figure into rectangles
//   given    ['Area = 24 square units', ...]   a line the pupil reads before the answer
//   ask      [{id, label, unit, ans}]          one answer line each: "Area = [ ] square units"
//   dots     'squares' | 'edges' | null         HINT: a grey dot in every unit square, or on every unit
//                                              of the outline, to touch and count
//   formula  string                            HINT: the grey formula line
//   hint     bool                               the hints show (Support level 2, or a Model / Guided
//                                              page: ctx.scaffoldLevel >= 2); structure always shows
//   traced   bool                               Support level 3: the answers in grey to trace
//
// Sizes (L1): the unit square is 6 / 6.5 / 7 mm at S / M / L (RP-5: a square a pupil counts is 6 mm
// or more); a labelled figure fits 38 x 26 / 44 x 30 / 50 x 34 mm. Side lengths are printed at the
// working digit size (a number the pupil computes with, RP-6), the unit at the text size.
// A cell is a third of the page at S (three across), a half at M and L.
//
// Pure module (SCC-01).

import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, digitPt, textPt, box, svg } from './k2kit.js';

const FONT = `font-family="Andika, 'Open Sans', sans-serif"`;
const textW = (s, pt) => String(s).length * pt * PT_MM * 0.58;
const SQUARE = { S: 6, M: 6.5, L: 7 };
const FIG = { S: { w: 40, h: 28 }, M: { w: 50, h: 34 }, L: { w: 56, h: 38 } };
export const FIGURE_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);

function signedArea(pts) {
    let a = 0;
    pts.forEach(([x, y], i) => { const [X, Y] = pts[(i + 1) % pts.length]; a += x * Y - X * y; });
    return a / 2;
}

/** Does segment a-b cross the box [x1, y1, x2, y2]? (an end inside, or an edge crossing) */
function segHitsBox([ax, ay], [bx, by], [x1, y1, x2, y2]) {
    const inside = (x, y) => x > x1 && x < x2 && y > y1 && y < y2;
    if (inside(ax, ay) || inside(bx, by)) return true;
    const cross = (p, q, r, t) => {
        const d = (q[0] - p[0]) * (t[1] - r[1]) - (q[1] - p[1]) * (t[0] - r[0]);
        if (Math.abs(d) < 1e-9) return false;
        const u = ((r[0] - p[0]) * (t[1] - r[1]) - (r[1] - p[1]) * (t[0] - r[0])) / d;
        const v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
        return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    };
    const A = [ax, ay], B = [bx, by];
    return cross(A, B, [x1, y1], [x2, y1]) || cross(A, B, [x2, y1], [x2, y2]) || cross(A, B, [x2, y2], [x1, y2]) || cross(A, B, [x1, y2], [x1, y1]);
}
const boxesMeet = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/**
 * The labels' places at scale k: each label tries the middle of its edge, then along it, at growing
 * distances out from it, and takes the first place that meets no other label, no side of the figure
 * and no guide line (the inner corners of an L or a T used to stack their labels on each other).
 */
function layoutLabels(cands, segs) {
    const placed = [];
    // the shortest edges choose first: they have the fewest places, a long side can slide along
    const order = cands.map((c, i) => [c, i]).sort((a, b) => a[0].len - b[0].len || a[1] - b[1]).map(([c]) => c);
    for (const c of order) {
        let best = null;
        const ts = c.along ? [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9] : [0.5];
        search:
        for (const d of [1.8, 3.5, 5.5, 8, 11]) {
            for (const t of ts) {
                const cx = c.mx + c.ex * (t - 0.5) * c.len + c.nx * (d + Math.abs(c.nx) * c.w / 2 + Math.abs(c.ny) * c.h * 0.55);
                const cy = c.my + c.ey * (t - 0.5) * c.len + c.ny * (d + Math.abs(c.nx) * c.w / 2 + Math.abs(c.ny) * c.h * 0.55);
                const bx = [cx - c.w / 2 - 0.4, cy - c.h / 2 - 0.2, cx + c.w / 2 + 0.4, cy + c.h / 2 + 0.2];
                if (placed.some((q) => boxesMeet(q.box, bx))) continue;
                if (segs.some(([A, B]) => segHitsBox(A, B, bx))) continue;
                best = { ...c, x: cx, y: cy, box: bx };
                break search;
            }
        }
        if (!best) {
            const d = 11, cx = c.mx + c.nx * (d + c.w / 2), cy = c.my + c.ny * (d + c.h / 2);
            best = { ...c, x: cx, y: cy, box: [cx - c.w / 2, cy - c.h / 2, cx + c.w / 2, cy + c.h / 2], forced: true };
        }
        placed.push(best);
    }
    return placed;
}

/** Each side label carries its unit on a figure with four labelled sides or fewer; on an L, T or U
 *  the unit is written once, under the figure ("All lengths are in cm."). */
const shownLabels = (p) => (p.edges || []).filter((e) => e.show !== false).length + (p.height && p.height.show !== false ? 1 : 0);
const unitOnLabels = (p) => !!p.unit && shownLabels(p) <= 4;

/** The labels' font: the working digit size, eased on a figure with many sides (RP-6). */
const labelPt = (ctx) => Math.max(textPt(ctx) + 3, digitPt(ctx) * 0.7);
/** The width a cell leaves its figure (a third of the page at S, a half at M and L). */
const FIT_W = { S: 54, M: 80, L: 80 };

/** The figure's picture: outline, squares, labels, height; returns {html, W, H}. */
export function figureSVG(p, ctx) {
    const poly = p.poly || [];
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys), wU = Math.max(...xs) - x0, hU = Math.max(...ys) - y0;
    const size = sizeOf(ctx);
    const onGrid = p.grid === 'squares';
    const dPt = labelPt(ctx), uPt = textPt(ctx), dMm = dPt * PT_MM;
    const unit = unitOnLabels(p) ? String(p.unit || '') : '';
    const labW = (v) => textW(v, dPt) + (unit && v !== '?' ? textW(` ${unit}`, uPt) : 0);
    // a labelled figure shrinks (never below 60 %) until it and its labels fit the cell (L1: the
    // cell is narrower at S); a figure on unit squares keeps its squares (RP-5: 6 mm or more)
    // a story's sketch is smaller (the story is the item; the sketch is a picture of it)
    let k = onGrid ? SQUARE[size] : Math.min(FIG[size].w / (wU || 1), FIG[size].h / (hU || 1)) * (p.sketch ? 0.6 : 1);
    const k0 = k;
    let P2, labels, hF, hT, hSide, bx1, by1, bx2, by2;
    let grown = 0;
    for (let tries = 0; tries < 10; tries++) {
        P2 = poly.map(([x, y]) => [(x - x0) * k, (y - y0) * k]);
        const cw = signedArea(P2) > 0;      // y down: positive = clockwise on the page
        const segs = P2.map((A, i) => [A, P2[(i + 1) % P2.length]]);
        const cands = [];
        for (const e of p.edges || []) {
            if (e.show === false) continue;
            const A = P2[e.i], B = P2[(e.i + 1) % P2.length];
            const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
            let nx = (B[1] - A[1]) / len, ny = -(B[0] - A[0]) / len;   // the outward normal of a clockwise outline
            if (!cw) { nx = -nx; ny = -ny; }
            cands.push({ mx: (A[0] + B[0]) / 2, my: (A[1] + B[1]) / 2, nx, ny, ex: (B[0] - A[0]) / len, ey: (B[1] - A[1]) / len,
                len, along: true, v: e.v, w: labW(e.v), h: dMm, unknown: e.v === '?' });
        }
        // the triangle's height: apex F to foot T (the foot may lie on the base's extension)
        hF = null; hT = null; hSide = 1;
        if (p.height) {
            hF = [(p.height.from[0] - x0) * k, (p.height.from[1] - y0) * k];
            hT = [(p.height.to[0] - x0) * k, (p.height.to[1] - y0) * k];
            const baseXs = P2.filter((q) => Math.abs(q[1] - hT[1]) < 1e-6).map((q) => q[0]);
            hSide = baseXs.some((x) => x > hT[0] + 1e-6) ? 1 : -1;     // the right-angle mark's side
            segs.push([hF, hT]);
            if (p.height.show !== false) {
                const len = Math.hypot(hT[0] - hF[0], hT[1] - hF[1]) || 1;
                // beside the dotted height, on the side away from the right-angle mark
                cands.push({ mx: (hF[0] + hT[0]) / 2, my: (hF[1] + hT[1]) / 2, nx: -hSide, ny: 0, ex: 0, ey: 1, len, along: true,
                    v: p.height.v, w: labW(p.height.v), h: dMm, unknown: p.height.v === '?' });
            }
        }
        labels = layoutLabels(cands, segs);
        bx1 = 0; by1 = 0; bx2 = wU * k; by2 = hU * k;
        if (hT) { bx1 = Math.min(bx1, hT[0] - 3); bx2 = Math.max(bx2, hT[0] + 3); }
        for (const lb of labels) {
            bx1 = Math.min(bx1, lb.x - lb.w / 2); bx2 = Math.max(bx2, lb.x + lb.w / 2);
            by1 = Math.min(by1, lb.y - lb.h / 2); by2 = Math.max(by2, lb.y + lb.h / 2);
        }
        if (onGrid) break;
        // a label with no clear place (a narrow notch): the figure grows, while it still fits the
        // cell, so its inner corners have room (never past 1.6 x)
        if (labels.some((lb) => lb.forced) && grown < 4 && (bx2 - bx1) * 1.12 + 3 <= FIT_W[size]) { k *= 1.12; grown++; continue; }
        if (bx2 - bx1 + 3 <= FIT_W[size] || k <= k0 * 0.6) break;
        k = Math.max(k0 * 0.6, k * Math.min(0.92, (FIT_W[size] - 3 - (bx2 - bx1 - wU * k)) / (wU * k)));
    }
    const pad = 1.5, ox = -bx1 + pad, oy = -by1 + pad;
    const W = bx2 - bx1 + 2 * pad, H = by2 - by1 + 2 * pad;
    const pts = P2.map(([x, y]) => `${n2(x + ox)},${n2(y + oy)}`).join(' ');
    let body = `<polygon points="${pts}" fill="#fff" stroke="none"/>`;
    if (onGrid) {
        // interior unit lines, clipped to the outline by testing each unit square's centre
        for (let gx = 0; gx < wU; gx++) {
            for (let gy = 0; gy < hU; gy++) {
                if (!inPoly(poly, [x0 + gx + 0.5, y0 + gy + 0.5])) continue;
                body += `<rect x="${n2(gx * k + ox)}" y="${n2(gy * k + oy)}" width="${n2(k)}" height="${n2(k)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}" data-ws-unit="1"/>`;
            }
        }
    }
    if (p.split && hintsOn(p, ctx)) {
        const [a, b] = p.split;
        body += `<line x1="${n2((a[0] - x0) * k + ox)}" y1="${n2((a[1] - y0) * k + oy)}" x2="${n2((b[0] - x0) * k + ox)}" y2="${n2((b[1] - y0) * k + oy)}" stroke="${GREY}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-hint="split"/>`;
    }
    body += `<polygon points="${pts}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round" data-ws-figure="1"/>`;
    if (hF) {
        const X = (v) => n2(v + ox), Y = (v) => n2(v + oy);
        body += `<line x1="${X(hF[0])}" y1="${Y(hF[1])}" x2="${X(hT[0])}" y2="${Y(hT[1])}" stroke="${INK}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-guide="height"/>`;
        const up = Math.sign(hF[1] - hT[1]) || -1, m = 3;
        body += `<path d="M${X(hT[0] + m * hSide)},${Y(hT[1])} L${X(hT[0] + m * hSide)},${Y(hT[1] + m * up)} L${X(hT[0])},${Y(hT[1] + m * up)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}" data-ws-guide="right-angle"/>`;
        // a foot beyond the base: the base's extension is drawn dotted to the foot
        const baseXs = P2.filter((q) => Math.abs(q[1] - hT[1]) < 1e-6).map((q) => q[0]);
        if (baseXs.length && (hT[0] < Math.min(...baseXs) - 1e-6 || hT[0] > Math.max(...baseXs) + 1e-6)) {
            const near = hT[0] < Math.min(...baseXs) ? Math.min(...baseXs) : Math.max(...baseXs);
            body += `<line x1="${X(near)}" y1="${Y(hT[1])}" x2="${X(hT[0])}" y2="${Y(hT[1])}" stroke="${INK}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-guide="base-extension"/>`;
        }
    }
    if (p.dots && onGrid && hintsOn(p, ctx)) {
        if (p.dots === 'squares') {
            for (let gx = 0; gx < wU; gx++) for (let gy = 0; gy < hU; gy++) {
                if (inPoly(poly, [x0 + gx + 0.5, y0 + gy + 0.5])) body += `<circle cx="${n2((gx + 0.5) * k + ox)}" cy="${n2((gy + 0.5) * k + oy)}" r="1" fill="${GREY}" data-ws-hint="dot"/>`;
            }
        } else {
            poly.forEach((A, i) => {
                const B = poly[(i + 1) % poly.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
                for (let t = 0; t < len; t++) {
                    const f = (t + 0.5) / len;
                    body += `<circle cx="${n2((A[0] + (B[0] - A[0]) * f - x0) * k + ox)}" cy="${n2((A[1] + (B[1] - A[1]) * f - y0) * k + oy)}" r="1" fill="${GREY}" data-ws-hint="dot"/>`;
                }
            });
        }
    }
    for (const lb of labels) {
        const y = lb.y + oy + dMm * 0.35;
        body += `<text x="${n2(lb.x + ox)}" y="${n2(y)}" text-anchor="middle" ${FONT} font-weight="700" fill="${INK}"${lb.unknown ? ' data-ws-unknown="1"' : ''}>`
            + `<tspan font-size="${n2(dMm)}">${esc(lb.v)}</tspan>${unit && !lb.unknown ? `<tspan font-size="${n2(uPt * PT_MM)}"> ${esc(unit)}</tspan>` : ''}</text>`;
    }
    const aria = onGrid ? 'a shape made of unit squares' : `a figure with sides ${(p.edges || []).filter((e) => e.show !== false).map((e) => e.v).join(', ')}`;
    return { html: svg(ctx, W, H, body, { cls: 'sg-figure', label: aria }), W, H };
}

function inPoly(pts, [x, y]) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
}

const hintsOn = (p, ctx) => !!p.hint || !!p.traced || levelOf(ctx) >= 2;

/** What the answer box of `id` shows in this state. */
function shown(p, ctx, a) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        if (w.slots && w.slots[a.id] !== undefined) return String(w.slots[a.id]);
        return (p.ask || []).length === 1 ? String(w.value === undefined ? '' : w.value) : '';
    }
    if (ctx.state === 'answered' || ctx.state === 'traced' || p.traced) return String(a.ans);
    return '';
}

/** One answer line: "Area = [ ] square units". */
function answerLine(p, ctx, a, several) {
    const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const b = box(bctx, { id: a.id, value: shown(p, ctx, a), w: blankWidth(Math.max(2, String(a.ans).length), sizeOf(ctx)),
        h: S(ctx).writeMm + 2, mark: several ? 'cell' : 'blank' });
    const t = (s) => `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;white-space:nowrap;">${esc(s)}</span>`;
    return `<div class="sg-ask" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};">${t(`${a.label} =`)}${b}${a.unit ? t(a.unit) : ''}</div>`;
}

export function renderFigure(p, ctx, root) {
    // a word problem's sketch is a hint (Support level 2, a Model or Guided page); its story is
    // one sentence a line at the text size + 2 (P-WP-17)
    // a story's figure is drawn on every item, the same size; its side lengths are written on it
    // only as the Support-level-2 hint (the pupil reads them from the story)
    const bare = p.sketch && !hintsOn(p, ctx);
    const drawn = !bare;
    const f = figureSVG(bare ? { ...p, edges: [] } : p, ctx);
    const story = (p.story || []).length
        ? `<div class="sg-story" style="font-size:${P(ctx, textPt(ctx) + 2)};line-height:1.3;text-align:left;max-width:${L(ctx, FIGURE_COL[sizeOf(ctx)].wMm - 8)};white-space:normal;">${p.story.map((t) => `<div>${esc(t)}</div>`).join('')}</div>` : '';
    const unitLine = drawn && p.unit && !unitOnLabels(p) && shownLabels(p)
        ? `<div class="sg-units" style="font-size:${P(ctx, textPt(ctx))};line-height:1.25;">All lengths are in ${esc(p.unit)}.</div>` : '';
    const given = (p.given || []).map((g) => `<div class="sg-given" style="font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1.25;">${esc(g)}</div>`).join('');
    // HINT: the grey formula line, or an addition frame of grey ruled lines, one for each side
    // (`frame`: the number of sides; scratch space, never a scored slot)
    const rule = `<span style="display:inline-block;width:${L(ctx, 8)};height:${L(ctx, S(ctx).writeMm - 2)};border-bottom:${B(ctx, 0.75)} solid ${GREY};"></span>`;
    const formula = !hintsOn(p, ctx) ? ''
        : p.frame ? `<div class="sg-formula" data-ws-hint="frame" style="display:flex;align-items:flex-end;gap:${L(ctx, 1.2)};font-size:${P(ctx, textPt(ctx))};line-height:1;color:${GREY};">`
            + Array.from({ length: p.frame }, () => rule).join('<span>+</span>') + '<span>=</span></div>'
        : p.formula ? `<div class="sg-formula" data-ws-hint="formula" style="font-size:${P(ctx, textPt(ctx))};line-height:1.25;color:${GREY};">${esc(p.formula)}</div>` : '';
    const several = (p.ask || []).length > 1;
    const asks = (p.ask || []).map((a) => answerLine(p, ctx, a, several)).join('');
    const join = several ? ' data-mq-join=", "' : '';
    return root(ctx, 'sg-figure-cell', `${story}${f.html ? `<div style="line-height:0;">${f.html}</div>` : ''}${unitLine}${given}${formula}`
        + `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};"${join}>${asks}</div>`);
}

export function figureKey(p) {
    const ask = p.ask || [];
    const value = ask.length === 1 ? Number(ask[0].ans) : ask.map((a) => String(a.ans)).join(', ');
    return { value, display: ask.map((a) => `${a.label} ${a.ans}`).join(', '),
        slots: Object.fromEntries(ask.map((a) => [a.id, { value: String(a.ans), graded: true }])) };
}

export function figureInputs(p) {
    return (p.ask || []).map((a, i) => ({ id: a.id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
}

export function figureFootprint(p, ctx) {
    const col = FIGURE_COL[sizeOf(ctx)];
    return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
}
