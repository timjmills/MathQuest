// js/modules/sheet/graphics/number-bond.js
// Library entry `numberBond` (design/GRAPHIC_LIBRARY.md): a number bond, WDS RP-60.
//
// The whole above, the two parts below, joined by 1 pt spokes. Boxes (default) are square-cornered
// writing places of side 14 / 16 / 20 mm (S / M / L); `shape: 'circle'` draws the same places as
// circles (the WRM part-whole model). The whole has a 1.5 pt border, the parts 0.75 pt. The unknown
// is the EMPTY place - solid, never dashed (LS-3) - and it is the item's ONE answer place: the key
// writes the answer into it, and in the screen twin it carries `data-mq-blank="box"` so the host's
// input takes its place (SL-7). The twin sizes the bond by `--mq-bond` (screen-cell.css).
// `orientation: 'horizontal'` puts the whole at the left, the parts stacked at the right.
//
// The `bond` template (cells/bond.js) is this drawing; the geometry lives here only.
//
// Pure module (SCC-01).

import { INK, GREY, B, isTwin, sizeOf, esc } from './units.js';

export const BOND_SIDE = Object.freeze({ S: 14, M: 16, L: 20 });

/**
 * @param {Object} ctx   the cell context (size, state, options.twin)
 * @param {Object} o     {whole, a, b, unknown: 'A'|'B'|'whole'|null, shown: the value written in the
 *                        unknown place ('' when blank), ink: 'trace'|'solid'|null, orientation, shape,
 *                        slotId (default 'answer'), label}
 * @returns {string} the bond's HTML (an inline-block, absolutely placed boxes over an SVG of spokes)
 */
export function numberBond(ctx, o = {}) {
    const { whole, a, b, unknown = null, shown = '', ink = null, orientation = 'vertical', shape = 'box', slotId = 'answer' } = o;
    const unit = isTwin(ctx) ? 'var(--mq-bond, 18mm)' : `${BOND_SIDE[sizeOf(ctx)] || 20}mm`;
    const at = (k) => `calc(${unit} * ${k})`;
    const radius = shape === 'circle' ? '50%' : '0';
    const place = (xy, value, heavy, isSlot) => {
        const pos = `position:absolute;left:${at(xy[0])};top:${at(xy[1])};`;
        const look = `width:${unit};height:${unit};box-sizing:border-box;border:${B(ctx, heavy ? 1.5 : 0.75)} solid ${INK};`
            + `border-radius:${radius};background:#fff;display:inline-flex;align-items:center;justify-content:center;`
            + `font-weight:700;font-size:${at(0.52)};line-height:1;`;
        if (!isSlot) return `<span class="k2-bond-box" style="${pos}${look}color:${INK};">${esc(value)}</span>`;
        const hook = isTwin(ctx) ? ' data-mq-blank="box"' : '';
        return `<span class="k2-bond-box k2-bond-slot" data-ws-slot="${esc(slotId)}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
            + `style="${pos}${look}color:${ink === 'trace' ? GREY : INK};">${esc(shown)}</span>`;
    };
    const label = esc(o.label || 'number bond');
    if (orientation === 'horizontal') {
        const hl = (y2) => `<line x1="1" y1="1.45" x2="2.3" y2="${y2}" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
        return `<div class="k2-bond mq-bond" role="img" aria-label="${label}" style="position:relative;display:inline-block;`
            + `width:${at(3.3)};height:${at(2.9)};vertical-align:top;">`
            + `<svg viewBox="0 0 3.3 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${hl(0.5)}${hl(2.4)}</svg>`
            + place([0, 0.95], whole, true, unknown === 'whole')
            + place([2.3, 0], a, false, unknown === 'A')
            + place([2.3, 1.9], b, false, unknown === 'B')
            + `</div>`;
    }
    const line = (x2) => `<line x1="2.1" y1="1" x2="${x2}" y2="1.9" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
    return `<div class="k2-bond mq-bond" role="img" aria-label="${label}" style="position:relative;display:inline-block;`
        + `width:${at(4.2)};height:${at(2.9)};vertical-align:top;">`
        + `<svg viewBox="0 0 4.2 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${line(0.5)}${line(3.7)}</svg>`
        + place([1.6, 0], whole, true, unknown === 'whole')
        + place([0, 1.9], a, false, unknown === 'A')
        + place([3.2, 1.9], b, false, unknown === 'B')
        + `</div>`;
}
