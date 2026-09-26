// js/modules/sheet/cells/shape-fill.js
// The `shape-grid` kind `fill` (build lane geometry, vis_migrate_shapes): fill a shape with pattern
// blocks. It serves compose_hexagon (a hexagon filled with triangles, rhombuses or trapezoids, or a
// mix of them) and compose_rect_from_squares (a rectangle filled with unit squares). The pupil
// draws the lines that split the shape into the blocks, then writes how many blocks of the asked
// kind it took. The screen draws the same cell (geometry-r1: the drag widget showed the answer as
// "0 of N slots" and asked a different task).
//
//   the blocks  one of each block kind in the fill, drawn at the shape's scale, its name under it:
//               what the pupil fills with (the count is the answer, so it is never printed)
//   the shape   the outline to fill, heavy (1.5 pt), white inside - never a block drawn in it
//   the answer  "1 trapezoid and [ ] triangles": the given blocks, then one box and the asked name
//   paper       `paper: 'dots'` (appearance): grey dot paper behind the shape, a dot at every
//               lattice point the blocks' corners can sit on (triangle dots, or square dots)
//   hints       Support level 2 (or a Model / Guided page): a grey dot at every corner of every
//               block place, where the pupil's lines meet. Level 3: the block lines dotted grey
//               to trace, and the count in grey
//   the key     the block lines drawn in ink (1 pt) inside the outline, and the count
//
// payload (plain data, SCC-Q3):
//   target       [[x, y], ...]          the outline in block units (a block side is 2 units), y down
//   block        'triangle' | 'rhombus' | 'trapezoid' | 'square'   the kind the pupil counts
//   places       [[[x, y], ...], ...]   every block's corners in the same units (the key's fill)
//   placeBlocks  ['trapezoid', ...]     the kind of each place (absent: every place is `block`)
//   given        [{block, n}]           the blocks the item names ("1 trapezoid and ...")
//   count        number                 how many places are `block`, the answer
//   paper        'plain' | 'dots'
//   hint, traced                        the Support flags
//
// The drawing scales with the Size (ctx metrics): a hexagon is about 33 / 37 / 40 mm across at
// S / M / L, a unit square 10 / 12 / 14 mm, one scale for every cell of a page.
//
// Pure module (SCC-01).

import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, INK, GREY, SW, n2, sizeOf, S, textPt, box, svg } from './k2kit.js';

export const FILL_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
const PLURAL = { triangle: 'triangles', rhombus: 'rhombuses', trapezoid: 'trapezoids', square: 'squares' };
const nameOf = (b, n) => (n === 1 ? b : PLURAL[b] || b);
const PAD = 1.5;
const R3 = Math.sqrt(3);
// one block of each kind in block units (a side is 2), flat on the page
const SAMPLE = {
    triangle: [[0, R3], [2, R3], [1, 0]],
    trapezoid: [[0, R3], [4, R3], [3, 0], [1, 0]],
    rhombus: [[0, R3], [2, R3], [3, 0], [1, 0]],
    square: [[0, 0], [2, 0], [2, 2], [0, 2]],
};

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);
const hintsOn = (p, ctx) => !!p.hint || !!p.traced || levelOf(ctx) >= 2;
const tracing = (p, ctx) => ctx.state === 'traced' || (ctx.state === 'blank' && !!p.traced);
const showsFill = (p, ctx) => ctx.state === 'answered' || tracing(p, ctx);
const kindsOf = (p) => (Array.isArray(p.placeBlocks) && p.placeBlocks.length === (p.places || []).length ? p.placeBlocks : (p.places || []).map(() => p.block));

function bboxOf(polys) {
    const pts = polys.flat();
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
const ptsOf = (poly, k, ox, oy) => poly.map(([x, y]) => `${n2(ox + x * k)},${n2(oy + y * k)}`).join(' ');

/** mm per block unit: from the Size's writing height, so S is smaller than L (OC14 / L1). */
function scaleOf(p, ctx) {
    const w = S(ctx).writeMm;
    return p.block === 'square' ? 2 + 0.5 * w : 5.5 + 0.45 * w;
}

/** One block of each kind in the fill (given kinds first), at the shape's scale, its name under it. */
function blockSamples(p, ctx, k) {
    const kinds = kindsOf(p);
    const order = [...(p.given || []).map((g) => g.block), p.block].filter((b, i, a) => a.indexOf(b) === i);
    const cells = order.map((b) => {
        // the block standing on its long side, as a pupil holds it (never the turn of a place in
        // the fill: that would show where it goes)
        const pl = SAMPLE[b] || (p.places || [])[kinds.indexOf(b)];
        if (!pl) return '';
        const bb = bboxOf([pl]);
        const w = (bb.x1 - bb.x0) * k + 2 * PAD, h = (bb.y1 - bb.y0) * k + 2 * PAD;
        const body = `<polygon points="${ptsOf(pl, k, PAD - bb.x0 * k, PAD - bb.y0 * k)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.one)}" stroke-linejoin="round"/>`;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};">`
            + `<div style="line-height:0;">${svg(ctx, w, h, body, { cls: 'sg-block', label: `one ${b}` })}</div>`
            + `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;">${esc(b)}</span></div>`;
    }).join('');
    // the blocks wrap onto a second line in a narrow column (a mixed fill shows two or three)
    return `<div class="sg-blocks" style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center;gap:${L(ctx, 2)} ${L(ctx, 4)};max-width:${L(ctx, FILL_COL[sizeOf(ctx)].wMm - 8)};">${cells}</div>`;
}

/** Dot paper behind the shape (appearance `paper: 'dots'`): the lattice the block corners sit on. */
function dotPaper(p, k, ox, oy, b) {
    const out = [];
    const r = 0.45;
    if (p.block === 'square') {
        for (let x = Math.floor(b.x0) - 2; x <= b.x1 + 2.001; x += 2) for (let y = Math.floor(b.y0) - 2; y <= b.y1 + 2.001; y += 2) out.push([x, y]);
    } else {
        // triangle lattice: rows sqrt(3) apart, every other row shifted by a unit
        const h = Math.sqrt(3);
        const cy = (b.y0 + b.y1) / 2, cx = (b.x0 + b.x1) / 2;
        for (let j = -3; j <= 3; j++) {
            const y = cy + j * h;
            if (y < b.y0 - h - 0.01 || y > b.y1 + h + 0.01) continue;
            for (let i = -4; i <= 4; i++) {
                const x = cx + 2 * i + (Math.abs(j) % 2 ? 1 : 0);
                if (x < b.x0 - 2.01 || x > b.x1 + 2.01) continue;
                out.push([x, y]);
            }
        }
    }
    return out.map(([x, y]) => `<circle cx="${n2(ox + x * k)}" cy="${n2(oy + y * k)}" r="${r}" fill="${GREY}" data-ws-paper="dot"/>`).join('');
}

/** The shape to fill; the key's (or the trace's) block lines inside it; the corner-dot hint. */
function shapeSVG(p, ctx, k) {
    const dots = p.paper === 'dots';
    const b = bboxOf([p.target]);
    const m = dots ? 2 * k : 0;   // dot paper runs one block side beyond the outline
    const ox = PAD + m - b.x0 * k, oy = PAD + m - b.y0 * k;
    const w = (b.x1 - b.x0) * k + 2 * (PAD + m), h = (b.y1 - b.y0) * k + 2 * (PAD + m);
    let body = dots ? dotPaper(p, k, ox, oy, b) : '';
    body += `<polygon points="${ptsOf(p.target, k, ox, oy)}" fill="${dots ? 'none' : '#fff'}" stroke="none"/>`;
    if (showsFill(p, ctx)) {
        const trace = tracing(p, ctx);
        body += (p.places || []).map((pl) => `<polygon points="${ptsOf(pl, k, ox, oy)}" fill="none" stroke="${trace ? GREY : INK}" stroke-width="${n2(SW.one)}"`
            + `${trace ? ' stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-guide="trace"' : ' data-ws-ink="solid"'} stroke-linejoin="round"/>`).join('');
    } else if (hintsOn(p, ctx) && !dots) {
        const seen = new Set();
        for (const pl of p.places || []) {
            for (const [x, y] of pl) {
                const key = `${Math.round(x * 100)},${Math.round(y * 100)}`;
                if (seen.has(key)) continue;
                seen.add(key);
                body += `<circle cx="${n2(ox + x * k)}" cy="${n2(oy + y * k)}" r="1.1" fill="${GREY}" data-ws-hint="corner"/>`;
            }
        }
    }
    body += `<polygon points="${ptsOf(p.target, k, ox, oy)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round" data-ws-figure="1"/>`;
    return svg(ctx, w, h, body, { cls: 'sg-fill', label: `a ${p.shapeName || 'shape'} to fill with blocks` });
}

/** What the count box shows in this state. */
function shownCount(p, ctx) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        return String(w.slots && w.slots.count !== undefined ? w.slots.count : w.value === undefined ? '' : w.value);
    }
    return ctx.state === 'answered' || tracing(p, ctx) ? String(p.count) : '';
}

export function renderFill(p, ctx, root) {
    const k = scaleOf(p, ctx);
    const trace = tracing(p, ctx);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const count = box(bctx, { id: 'count', value: shownCount(p, ctx), w: blankWidth(2, sizeOf(ctx)), h: S(ctx).writeMm + 2, mark: 'blank' });
    const t = (s) => `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;white-space:nowrap;">${esc(s)}</span>`;
    const given = (p.given || []).map((g) => t(`${g.n} ${nameOf(g.block, g.n)}`)).join(t('and'));
    // the given blocks on their own line ("1 rhombus and"), then the box with its name: the box
    // never parts from the word it counts
    const row = (inner) => `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};">${inner}</div>`;
    const ask = `<div class="sg-ask" style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};">`
        + `${given ? row(`${given}${t('and')}`) : ''}${row(`${count}${t(PLURAL[p.block] || p.block)}`)}</div>`;
    return root(ctx, 'sg-fill-cell', `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${L(ctx, 3)};">`
        + `${blockSamples(p, ctx, k)}<div style="line-height:0;">${shapeSVG(p, ctx, k)}</div></div>${ask}`);
}

export function fillKey(p) {
    return { value: Number(p.count), display: `${p.count} ${nameOf(p.block, Number(p.count))}`, slots: { count: { value: String(p.count), graded: true } } };
}

export function fillInputs() {
    return [{ id: 'count', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
}

export function fillFootprint(p, ctx) {
    const col = FILL_COL[sizeOf(ctx)];
    return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
}
