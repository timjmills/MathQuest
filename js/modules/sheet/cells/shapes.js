// js/modules/sheet/cells/shapes.js
// The tile SHAPES a number track can be drawn in: box, circle or hexagon (owner, 2026-09-25:
// "the younger ones use shapes which I like for the younger years"). Outlines only, black on
// white, no fill and no colour (INK-1); the digits sit inside at the track's writing size and the
// key writes inside the same outline.
//
// A tile is two layers: an OUTLINE (a CSS border for the box and the circle, an SVG polygon for
// the hexagon, laid absolutely OVER the slot, unfilled and click-through, so the screen's white
// input never hides it) and the SLOT span that holds the number. The slot never
// holds the outline, because the screen host (screen-cell.js wireCellSlots) empties a
// `data-mq-cell` slot before it puts its <input> in: an outline inside the slot would vanish on
// screen. So on screen the input sits inside the shape, and the shape stays drawn.
//
// `shape` is 'box' | 'circle' | 'hex', or 'mixed' (circles and hexagons in turn, as in the
// owner's K-1 example). Every shape is at least 14 mm across at L (RUBRIC H9).
//
// Pure module (SCC-01).

import { esc } from '../cell.js';
import { L, P, B, INK, GREY, isTwin, KEY_FEATURES } from './k2kit.js';

export const TILE_SHAPES = Object.freeze(['box', 'circle', 'hex']);

/** The shape of tile `i` for a track drawn in `shape` ('mixed' alternates circle / hexagon). */
export const shapeAt = (shape, i) => (shape === 'mixed' ? (i % 2 ? 'hex' : 'circle') : TILE_SHAPES.includes(shape) ? shape : 'box');

/** The outline size (mm) of a tile of this shape: a hexagon is a little wider than it is tall. */
export function tileSize(shape, baseW, baseH) {
    if (shape === 'circle') { const d = Math.max(baseW, baseH, 14.5); return { w: d, h: d }; }
    if (shape === 'hex') return { w: Math.max(baseW, 14) * 1.12, h: Math.max(baseH, 14) };
    return { w: baseW, h: baseH };
}

/**
 * One tile. `slot` is null for a printed (given) number, or {id, mark} for a writing place:
 * `mark` 'cell' puts the screen hook on it in the twin. `value` is what the tile shows (a given
 * number, or the key's / the pupil's written value); `ink` is 'trace' | 'solid' | null.
 */
export function tile(ctx, { shape = 'box', w, h, pt, value = '', slot = null, ink = null, heavy = false, shown = false } = {}) {
    const color = ink === 'trace' ? GREY : INK;
    const bw = B(ctx, heavy ? 1.5 : 0.75);
    const outline = shape === 'hex'
        ? `<svg aria-hidden="true" viewBox="0 0 112 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;">`
            + `<polygon points="28,2 84,2 110,50 84,98 28,98 2,50" fill="none" stroke="${INK}" stroke-width="${heavy ? 3.2 : 1.8}" `
            + `vector-effect="non-scaling-stroke" stroke-linejoin="round" style="stroke-width:${bw}"/></svg>`
        : '';
    const border = shape === 'hex' ? 'border:0;' : `border:${bw} solid ${INK};border-radius:${shape === 'circle' ? '50%' : L(ctx, 1.25)};`;
    const hook = slot && isTwin(ctx) && slot.mark === 'cell' ? ' data-mq-cell="1"' : '';
    const slotAttrs = slot
        ? ` data-ws-slot="${esc(slot.id)}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook}${shown ? ' data-ws-shown="1"' : ''}`
        : (shown ? ' data-ws-shown="1"' : '');
    // A hexagon's writing place is the rectangle inside its outline (72% x 76%), so the screen's
    // input (a white box) never covers the outline; a circle clips its input to the circle.
    const size = shape === 'hex' ? 'width:72%;height:76%;margin:auto;' : 'width:100%;height:100%;';
    const inner = `<span class="k2-tile${slot ? ' k2-tile-slot' : ''}"${slotAttrs} style="position:relative;box-sizing:border-box;display:flex;`
        + `align-items:center;justify-content:center;overflow:hidden;${size}${border}background:${shape === 'hex' ? 'transparent' : '#fff'};`
        + `font-size:${P(ctx, pt)};font-weight:700;line-height:1;color:${slot ? color : INK};${slot ? KEY_FEATURES : ''}">${esc(value)}</span>`;
    return `<span class="k2-shape k2-shape-${shape}" style="position:relative;display:inline-flex;flex:none;box-sizing:border-box;`
        + `width:${L(ctx, w)};height:${L(ctx, h)};vertical-align:middle;">${inner}${outline}</span>`;
}
