// js/modules/sheet/cells/solid-kit.js
// The `solid-kit` template (build lane geometry, vis_migrate_area_volume): rectangular solids drawn
// in black and white. It serves area_perimeter:volume (one prism) and area_perimeter:volume_composite
// (two prisms joined), on paper, on the key and on screen.
//
//   the solid   one or more boxes of unit cubes, drawn in an oblique view (the front face flat, the
//               depth going back up and to the right at 30 degrees, drawn at 0.6). The solid is
//               built of unit cubes and drawn as one: only its real edges are ink (1.5 pt), so two
//               joined prisms show no seam unless the hint asks for it
//   the labels  every labelled edge carries its length at the working digit size, the unit after
//               it at the text size, outside the solid, clear of the other labels
//   the answer  "Volume = [ ] cubic cm" (one box), or "? = [ ] cm" for a missing edge
//   hints       Support level 2 (or a Model / Guided page): the unit-cube lines on the visible faces
//               (dotted grey, when the solid is drawn to scale) or the split between two prisms
//               (dotted grey), and a grey formula line. Level 3: the answer in grey to trace
//   a story     one sentence a line; its solid is a sketch drawn only when the hints show
//
// payload (plain data, SCC-Q3):
//   boxes    [{x, y, z, l, w, h}]      the prisms in DRAWN units (x right, y back, z up)
//   toScale  bool                      drawn units are real units (the unit-cube hint may show)
//   labels   [{a: [x,y,z], b: [x,y,z], v}]   an edge from a to b labelled v (a number or '?')
//   split    [[a, b], ...]             HINT: the seam segments between the prisms (3-D points)
//   unit     'cm' | 'm' | 'in' | 'ft'
//   ask      [{id, label, unit, ans}]  given [...], story [...], sketch, formula, hint, traced
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, digitPt, textPt, box, svg } from './k2kit.js';
import { labelsClear, boxGap, glyphGap, UNIT_NAME } from './shape-figure.js';

const FONT = `font-family="Andika, 'Open Sans', sans-serif"`;
const textW = (s, pt) => String(s).length * pt * PT_MM * 0.58;
// The oblique view: depth drawn at 0.6 of its length, 30 degrees up to the right.
const DEPTH = 0.6, CX = DEPTH * Math.cos(Math.PI / 6), CY = DEPTH * Math.sin(Math.PI / 6);
const FIG = { S: { w: 40, h: 32 }, M: { w: 50, h: 38 }, L: { w: 56, h: 44 } };
export const SOLID_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
const FIT_W = { S: 54, M: 80, L: 80 };

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);
const hintsOn = (p, ctx) => !!p.hint || !!p.traced || levelOf(ctx) >= 2;
const labelPt = (ctx) => Math.max(textPt(ctx) + 1, digitPt(ctx) * 0.7);
/** The unit rides on each label when the solid has three labels or fewer; else it is written once
 *  under the drawing ("All lengths are in cm."), so a pair of labels never reads "2 m 2 m". */
export const unitOnLabels = (p) => !!p.unit && (p.labels || []).filter((l) => l.v !== '?').length <= 3;

/** The unit cubes of the solid, as a Set of "x,y,z" keys, and their list. */
function cubesOf(p) {
    const set = new Set(), list = [];
    for (const bx of p.boxes || []) {
        for (let x = bx.x; x < bx.x + bx.l; x++) for (let y = bx.y; y < bx.y + bx.w; y++) for (let z = bx.z; z < bx.z + bx.h; z++) {
            const k = `${x},${y},${z}`;
            if (!set.has(k)) { set.add(k); list.push([x, y, z]); }
        }
    }
    return { set, list };
}

/**
 * The visible faces of every unit cube, back to front (a cube can only hide a cube behind it, to
 * its left or below it, so y descending, x ascending, z ascending paints in order). Each face has
 * four corners (3-D) and, for each edge, whether it is a real edge of the solid (the face beside it
 * in the same plane is not there) or a unit line inside a face.
 */
function facesOf(p) {
    const { set, list } = cubesOf(p);
    const has = (x, y, z) => set.has(`${x},${y},${z}`);
    list.sort((a, b) => b[1] - a[1] || a[0] - b[0] || a[2] - b[2]);
    const faces = [];
    for (const [x, y, z] of list) {
        // front (y = y): exposed when no cube in front
        if (!has(x, y - 1, z)) {
            const same = (dx, dz) => has(x + dx, y, z + dz) && !has(x + dx, y - 1, z + dz);
            faces.push({ pts: [[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]],
                real: [!same(0, -1), !same(1, 0), !same(0, 1), !same(-1, 0)] });
        }
        // top (z + 1)
        if (!has(x, y, z + 1)) {
            const same = (dx, dy) => has(x + dx, y + dy, z) && !has(x + dx, y + dy, z + 1);
            faces.push({ pts: [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]],
                real: [!same(0, -1), !same(1, 0), !same(0, 1), !same(-1, 0)] });
        }
        // right (x + 1)
        if (!has(x + 1, y, z)) {
            const same = (dy, dz) => has(x, y + dy, z + dz) && !has(x + 1, y + dy, z + dz);
            faces.push({ pts: [[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]],
                real: [!same(0, -1), !same(1, 0), !same(0, 1), !same(-1, 0)] });
        }
    }
    return faces;
}

/** The projection of a 3-D point at k mm per unit (y down on the page). */
const proj = ([x, y, z], k) => [(x + y * CX) * k, -(z + y * CY) * k];

function bounds(p) {
    const xs = [], ys = [];
    for (const bx of p.boxes || []) {
        for (const X of [bx.x, bx.x + bx.l]) for (const Y of [bx.y, bx.y + bx.w]) for (const Z of [bx.z, bx.z + bx.h]) {
            const [u, v] = proj([X, Y, Z], 1);
            xs.push(u); ys.push(v);
        }
    }
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const boxesMeet = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/** Does segment A-B cross or enter the rectangle r = [x1, y1, x2, y2]? */
function segHitsBox(A, Bp, [x1, y1, x2, y2]) {
    const inside = ([x, y]) => x > x1 && x < x2 && y > y1 && y < y2;
    if (inside(A) || inside(Bp)) return true;
    const cross = (p, q, r, t) => {
        const d = (q[0] - p[0]) * (t[1] - r[1]) - (q[1] - p[1]) * (t[0] - r[0]);
        if (Math.abs(d) < 1e-9) return false;
        const u = ((r[0] - p[0]) * (t[1] - r[1]) - (r[1] - p[1]) * (t[0] - r[0])) / d;
        const v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
        return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    };
    return cross(A, Bp, [x1, y1], [x2, y1]) || cross(A, Bp, [x2, y1], [x2, y2]) || cross(A, Bp, [x2, y2], [x1, y2]) || cross(A, Bp, [x1, y2], [x1, y1]);
}
function inPolys(polys, [px, py]) {
    for (const q of polys) {
        let c = false;
        for (let i = 0, j = q.length - 1; i < q.length; j = i++) {
            const [xi, yi] = q[i], [xj, yj] = q[j];
            if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
        }
        if (c) return true;
    }
    return false;
}

/** The solid's picture with its labels: {html, W, H}. */
export function solidSVG(p, ctx) {
    const size = sizeOf(ctx);
    const bb = bounds(p);
    const dPt = labelPt(ctx), uPt = textPt(ctx), dMm = dPt * PT_MM;
    const unit = unitOnLabels(p) ? String(p.unit || '') : '';
    const labW = (v) => textW(v, dPt) + (unit && v !== '?' ? textW(` ${unit}`, uPt) : 0);
    // a story's sketch is smaller (the story is the item; the sketch is a picture of it)
    let k = Math.min(FIG[size].w / (bb.x1 - bb.x0 || 1), FIG[size].h / (bb.y1 - bb.y0 || 1)) * (p.sketch ? 0.6 : 1);
    const faces = facesOf(p);
    let placed, X0, X1, Y0, Y1;
    for (let tries = 0; tries < 9; tries++) {
        // the drawing at this scale: its faces (a label never sits on them) and its real edges
        const polys = faces.map((f) => f.pts.map((pt) => proj(pt, k)));
        const edges = [];
        faces.forEach((f, fi) => f.real.forEach((real, i) => { if (real) edges.push([polys[fi][i], polys[fi][(i + 1) % 4]]); }));
        const clear = (r) => !edges.some(([a, b]) => segHitsBox(a, b, r))
            && ![[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].some((pt) => inPolys(polys, pt));
        const cx = ((bb.x0 + bb.x1) / 2) * k, cy = ((bb.y0 + bb.y1) / 2) * k;
        placed = [];
        X0 = bb.x0 * k; X1 = bb.x1 * k; Y0 = bb.y0 * k; Y1 = bb.y1 * k;
        for (const lb of p.labels || []) {
            const A = proj(lb.a, k), Bp = proj(lb.b, k);
            const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2;
            const len = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) || 1;
            let nx = -(Bp[1] - A[1]) / len, ny = (Bp[0] - A[0]) / len;
            if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }     // away from the solid first
            const w = labW(lb.v), h = dMm;
            let best = null;
            // THE ONE LABEL RULE (as shape-figure.js): beside the middle of its own edge, on the outer
            // side first, then the other; a little along the edge; never further from its own edge
            // than from another edge; LABEL_GAP from every other label
            const own = [A, Bp];
            const along = (e) => Math.abs(((e[1][0] - e[0][0]) * (Bp[1] - A[1]) - (e[1][1] - e[0][1]) * (Bp[0] - A[0]))) < 1e-6
                && Math.abs(((e[0][0] - A[0]) * (Bp[1] - A[1]) - (e[0][1] - A[1]) * (Bp[0] - A[0]))) < 1e-6;
            const others = edges.filter((e) => !along(e));
            search:
            for (const d of [1.4, 2.4, 3.4]) {
                for (const side of [1, -1]) {
                    for (const t of [0, -0.2, 0.2, -0.35, 0.35]) {
                        const sx = nx * side, sy = ny * side;
                        const px = mx + (Bp[0] - A[0]) * t + sx * (d + Math.abs(sx) * w / 2 + Math.abs(sy) * h * 0.55);
                        const py = my + (Bp[1] - A[1]) * t + sy * (d + Math.abs(sx) * w / 2 + Math.abs(sy) * h * 0.55);
                        const r = [px - w / 2 - 0.4, py - h / 2 - 0.2, px + w / 2 + 0.4, py + h / 2 + 0.2];
                        if (placed.some((q) => !labelsClear(q.r, r, glyphGap(dPt))) || !clear(r)) continue;
                        const dOwn = boxGap(r, own);
                        if (others.some((e) => boxGap(r, e) < dOwn - 0.05)) continue;
                        best = { v: lb.v, x: px, y: py, r, unknown: lb.v === '?' };
                        break search;
                    }
                }
            }
            if (!best) {
                const px = mx + nx * (1.4 + Math.abs(nx) * w / 2 + Math.abs(ny) * h * 0.55), py = my + ny * (1.4 + Math.abs(nx) * w / 2 + Math.abs(ny) * h * 0.55);
                best = { v: lb.v, x: px, y: py, r: [px - w / 2, py - h / 2, px + w / 2, py + h / 2], unknown: lb.v === '?', forced: true };
            }
            placed.push(best);
            X0 = Math.min(X0, best.r[0]); X1 = Math.max(X1, best.r[2]); Y0 = Math.min(Y0, best.r[1]); Y1 = Math.max(Y1, best.r[3]);
        }
        // a label with no clear place: the drawing grows while it still fits the cell
        if (placed.some((q) => q.forced) && tries < 8 && (X1 - X0) * 1.12 + 3 <= FIT_W[size]) { k *= 1.12; continue; }
        if (X1 - X0 + 3 <= FIT_W[size] || tries === 8) break;
        k *= Math.max(0.6, (FIT_W[size] - 3 - (X1 - X0 - (bb.x1 - bb.x0) * k)) / ((bb.x1 - bb.x0) * k));
    }
    const pad = 1.5, ox = -X0 + pad, oy = -Y0 + pad;
    const W = X1 - X0 + 2 * pad, H = Y1 - Y0 + 2 * pad;
    const P2 = (pt) => { const [u, v] = proj(pt, k); return [u + ox, v + oy]; };
    // the unit cubes: every cube in ink when the look is "built of unit cubes" (structure), else
    // the grey dotted Support-level-2 hint
    const allCubes = p.cubes === 'all' && p.toScale;
    const cubes = allCubes || (hintsOn(p, ctx) && p.toScale && p.cubes !== false);
    let body = '';
    for (const f of faces) {
        const q = f.pts.map(P2);
        // a thin white rim seals the seams between unit faces (the lines behind them showed through)
        body += `<polygon points="${q.map(([u, v]) => `${n2(u)},${n2(v)}`).join(' ')}" fill="#fff" stroke="#fff" stroke-width="0.2" stroke-linejoin="round" data-ws-face="1"/>`;
        f.real.forEach((real, i) => {
            const [a, b] = [q[i], q[(i + 1) % 4]];
            if (real) body += `<line x1="${n2(a[0])}" y1="${n2(a[1])}" x2="${n2(b[0])}" y2="${n2(b[1])}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linecap="round" data-ws-figure="1"/>`;
            else if (allCubes) body += `<line x1="${n2(a[0])}" y1="${n2(a[1])}" x2="${n2(b[0])}" y2="${n2(b[1])}" stroke="${INK}" stroke-width="${n2(SW.hair)}" data-ws-cube="1"/>`;
            else if (cubes) body += `<line x1="${n2(a[0])}" y1="${n2(a[1])}" x2="${n2(b[0])}" y2="${n2(b[1])}" stroke="${GREY}" stroke-width="${n2(PT_MM)}" stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-hint="cube"/>`;
        });
    }
    if (hintsOn(p, ctx)) {
        for (const [a, b] of p.split || []) {
            const A = P2(a), Bp = P2(b);
            body += `<line x1="${n2(A[0])}" y1="${n2(A[1])}" x2="${n2(Bp[0])}" y2="${n2(Bp[1])}" stroke="${GREY}" stroke-width="${n2(SW.one)}" stroke-dasharray="0.01 1.4" stroke-linecap="round" data-ws-hint="split"/>`;
        }
    }
    // ticks: where a labelled length that shares its line with another one starts and ends
    for (const lb of p.labels || []) {
        if (!lb.ticks) continue;
        const A = P2(lb.a), Bp = P2(lb.b);
        const len = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) || 1;
        const tx = (-(Bp[1] - A[1]) / len) * 1.4, ty = ((Bp[0] - A[0]) / len) * 1.4;
        for (const E of [A, Bp]) body += `<line x1="${n2(E[0] - tx)}" y1="${n2(E[1] - ty)}" x2="${n2(E[0] + tx)}" y2="${n2(E[1] + ty)}" stroke="${INK}" stroke-width="${n2(SW.one)}" data-ws-tick="1"/>`;
    }
    for (const lb of placed) {
        body += `<text x="${n2(lb.x + ox)}" y="${n2(lb.y + oy + dMm * 0.35)}" text-anchor="middle" ${FONT} font-weight="700" fill="${INK}"${lb.unknown ? ' data-ws-unknown="1"' : ''}>`
            + `<tspan font-size="${n2(dMm)}">${esc(lb.v)}</tspan>${unit && !lb.unknown ? `<tspan font-size="${n2(uPt * PT_MM)}"> ${esc(unit)}</tspan>` : ''}</text>`;
    }
    const aria = `a solid with edges ${(p.labels || []).map((l) => l.v).join(', ')}`;
    return { html: svg(ctx, W, H, body, { cls: 'sk-solid', label: aria }), W, H, gap: glyphGap(dPt),
        labels: placed.map((lb) => ({ v: lb.v, r: lb.r.map((v, i) => v + (i % 2 ? oy : ox)), forced: !!lb.forced })) };
}

function shown(p, ctx, a) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        if (w.slots && w.slots[a.id] !== undefined) return String(w.slots[a.id]);
        return (p.ask || []).length === 1 ? String(w.value === undefined ? '' : w.value) : '';
    }
    if (ctx.state === 'answered' || ctx.state === 'traced' || p.traced) return String(a.ans);
    return '';
}

function answerLine(p, ctx, a) {
    const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const b = box(bctx, { id: a.id, value: shown(p, ctx, a), w: blankWidth(Math.max(2, String(a.ans).length), sizeOf(ctx)), h: S(ctx).writeMm + 2, mark: 'blank' });
    const t = (s) => `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;white-space:nowrap;">${esc(s)}</span>`;
    return `<div class="sk-ask" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};">${t(`${a.label} =`)}${b}${a.unit ? t(a.unit) : ''}</div>`;
}

const root = (ctx, inner) => `<div class="sk-cell"${isTwin(ctx) ? ' data-mq-sk="1"' : ''} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;`
    + `text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${inner}</div>`;

register('solid-kit', {
    render(p, ctx) {
        // a story's solid is drawn on every item, the same size; its numbers are written on it
        // only as the Support-level-2 hint (the pupil reads them from the story)
        const bare = p.sketch && !hintsOn(p, ctx);
        const f = solidSVG(bare ? { ...p, labels: [] } : p, ctx);
        const story = (p.story || []).length
            ? `<div class="sk-story" style="font-size:${P(ctx, textPt(ctx) + 2)};line-height:1.3;text-align:left;max-width:${L(ctx, SOLID_COL[sizeOf(ctx)].wMm - 8)};">${p.story.map((t) => `<div>${esc(t)}</div>`).join('')}</div>` : '';
        const unitLine = !bare && p.unit && !unitOnLabels(p) && (p.labels || []).length
            ? `<div class="sk-units" style="font-size:${P(ctx, textPt(ctx))};line-height:1.25;">All lengths are in ${esc(UNIT_NAME[p.unit] || p.unit)}.</div>` : '';
        const given = (p.given || []).map((g) => `<div class="sk-given" style="font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1.25;">${esc(g)}</div>`).join('');
        const formula = p.formula && hintsOn(p, ctx)
            ? `<div class="sk-formula" data-ws-hint="formula" style="font-size:${P(ctx, textPt(ctx))};line-height:1.25;color:${GREY};">${esc(p.formula)}</div>` : '';
        const asks = (p.ask || []).map((a) => answerLine(p, ctx, a)).join('');
        return root(ctx, `${story}${f.html ? `<div style="line-height:0;">${f.html}</div>` : ''}${unitLine}${given}${formula}${asks}`);
    },
    answerKey(p) {
        const a = (p.ask || [])[0] || {};
        return { value: Number(a.ans), display: `${a.label} ${a.ans}`, slots: { [a.id]: { value: String(a.ans), graded: true } } };
    },
    footprint(p, ctx) {
        const col = SOLID_COL[sizeOf(ctx)];
        return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
    },
    inputs(p) {
        return (p.ask || []).map((a, i) => ({ id: a.id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});

export const SOLID_TEMPLATE_IDS = Object.freeze(['solid-kit']);
