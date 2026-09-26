// js/modules/sheet/cells/shape-fill.js
// The `shape-grid` kind `fill` (build lane geometry, vis_migrate_shapes): fill a shape with pattern
// blocks. It serves compose_hexagon (a hexagon filled with triangles, rhombi or trapezoids) and
// compose_rect_from_squares (a rectangle filled with unit squares). On screen the same items are
// the drag-and-drop widget (widgets/compose-shape-blocks.js); on paper the pupil draws the lines
// that split the shape into the blocks, then writes how many blocks it took.
//
//   the block   one pattern block, drawn at the scale of the shape, with its name under it:
//               what the pupil fills with (the count is the answer, so it is never printed)
//   the shape   the outline to fill, heavy (1.5 pt), white inside - never a block drawn in it
//   the answer  "[ ] trapezoids": one box, the block's name after it
//   hints       Support level 2 (or a Model / Guided page): a grey dot at every corner of every
//               block place, where the pupil's lines meet. Level 3: the block lines dotted grey
//               to trace, and the count in grey
//   the key     the block lines drawn in ink (1 pt) inside the outline, and the count
//
// payload (plain data, SCC-Q3):
//   target   [[x, y], ...]            the outline in block units (a block side is 2 units), y down
//   block    'triangle' | 'rhombus' | 'trapezoid' | 'square'
//   places   [[[x, y], ...], ...]     every block's corners in the same units (the key's fill)
//   count    number                   places.length, the answer
//   hint, traced                      the Support flags
//
// Pure module (SCC-01).

import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, INK, GREY, SW, n2, sizeOf, S, textPt, box, svg } from './k2kit.js';

// The shape's largest box (mm) at S / M / L (RP 11.2: a 2-D shape is 30 / 36 / 42 mm or more).
const SHAPE = { S: { w: 40, h: 32 }, M: { w: 50, h: 40 }, L: { w: 56, h: 46 } };
// The room inside a cell (a third of the page at S, a half at M and L) and the gap between the
// block and the shape. At S the block stands over the shape; at M and L beside it, at the same
// scale, so the pupil sees how big a block is next to the shape it fills.
const INSIDE = { S: 56, M: 84, L: 84 };
const GAP = 5;
const besideOf = (ctx) => sizeOf(ctx) !== 'S';
export const FILL_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
const PLURAL = { triangle: 'triangles', rhombus: 'rhombuses', trapezoid: 'trapezoids', square: 'squares' };
const PAD = 1.5;

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);
const hintsOn = (p, ctx) => !!p.hint || !!p.traced || levelOf(ctx) >= 2;
const tracing = (p, ctx) => ctx.state === 'traced' || (ctx.state === 'blank' && !!p.traced);
const showsFill = (p, ctx) => ctx.state === 'answered' || tracing(p, ctx);

function bboxOf(polys) {
    const pts = polys.flat();
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
const ptsOf = (poly, k, ox, oy) => poly.map(([x, y]) => `${n2(ox + x * k)},${n2(oy + y * k)}`).join(' ');

/** The unit scale (mm per block unit) of this cell's shape. */
function scaleOf(p, ctx) {
    const b = bboxOf([p.target]);
    const box0 = SHAPE[sizeOf(ctx)];
    let k = Math.min(box0.w / (b.x1 - b.x0 || 1), box0.h / (b.y1 - b.y0 || 1));
    // beside: the widest block the skill deals and the shape share the row (`fitW`, in units), so
    // every cell of a page draws its shape at one scale
    if (besideOf(ctx)) k = Math.min(k, (INSIDE[sizeOf(ctx)] - GAP - 4 * PAD) / (Number(p.fitW) || (b.x1 - b.x0) * 2));
    return k;
}

/** The one block the shape is filled with, at the shape's scale, and its name under it. */
function blockSample(p, ctx, k) {
    const pl = (p.places || [])[0];
    if (!pl) return '';
    const b = bboxOf([pl]);
    const w = (b.x1 - b.x0) * k + 2 * PAD, h = (b.y1 - b.y0) * k + 2 * PAD;
    const body = `<polygon points="${ptsOf(pl, k, PAD - b.x0 * k, PAD - b.y0 * k)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.one)}" stroke-linejoin="round"/>`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};">`
        + `<div style="line-height:0;">${svg(ctx, w, h, body, { cls: 'sg-block', label: `one ${p.block}` })}</div>`
        + `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;">${esc(p.block)}</span></div>`;
}

/** The shape to fill; the key's (or the trace's) block lines inside it; the corner-dot hint. */
function shapeSVG(p, ctx, k) {
    const b = bboxOf([p.target]);
    const ox = PAD - b.x0 * k, oy = PAD - b.y0 * k;
    const w = (b.x1 - b.x0) * k + 2 * PAD, h = (b.y1 - b.y0) * k + 2 * PAD;
    let body = `<polygon points="${ptsOf(p.target, k, ox, oy)}" fill="#fff" stroke="none"/>`;
    if (showsFill(p, ctx)) {
        const trace = tracing(p, ctx);
        body += (p.places || []).map((pl) => `<polygon points="${ptsOf(pl, k, ox, oy)}" fill="none" stroke="${trace ? GREY : INK}" stroke-width="${n2(SW.one)}"`
            + `${trace ? ' stroke-dasharray="0.01 1.2" stroke-linecap="round" data-ws-guide="trace"' : ' data-ws-ink="solid"'} stroke-linejoin="round"/>`).join('');
    } else if (hintsOn(p, ctx)) {
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
    return svg(ctx, w, h, body, { cls: 'sg-fill', label: `a ${p.shapeName || 'shape'} to fill with ${PLURAL[p.block] || p.block}` });
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
    const ask = `<div class="sg-ask" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};">${count}${t(PLURAL[p.block] || p.block)}</div>`;
    return root(ctx, 'sg-fill-cell', `<div style="display:flex;flex-direction:${besideOf(ctx) ? 'row' : 'column'};align-items:${besideOf(ctx) ? 'flex-end' : 'center'};justify-content:center;gap:${L(ctx, besideOf(ctx) ? GAP : 2)};">`
        + `${blockSample(p, ctx, k)}<div style="line-height:0;">${shapeSVG(p, ctx, k)}</div></div>${ask}`);
}

export function fillKey(p) {
    return { value: Number(p.count), display: `${p.count} ${PLURAL[p.block] || p.block}`, slots: { count: { value: String(p.count), graded: true } } };
}

export function fillInputs() {
    return [{ id: 'count', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
}

export function fillFootprint(p, ctx) {
    const col = FILL_COL[sizeOf(ctx)];
    return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
}
