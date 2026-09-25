// js/modules/sheet/cells/bond.js
// The `bond` template: a number bond (RP-60), number_bonds.
//
// The whole box above, two part boxes below, joined by 0.75 pt lines. Square-cornered boxes of
// side 14 / 16 / 20 mm (S / M / L); the whole box has a 1.5 pt border, the parts 0.75 pt. The
// unknown is the EMPTY box — solid, never dashed (LS-3) — and it is the item's ONE answer place:
// the key writes the answer into it (AK-1), Error analysis writes the finished-but-wrong number
// into it, and in the screen twin it carries `data-mq-blank="box"`, so the host's input takes its
// place and the pupil types INTO the bond (SL-7). The twin sizes the bond by `--mq-bond`, which
// screen-cell.css already sets per breakpoint.
//
// payload: {whole, a, b, unknown: 'A'|'B'|'whole', orientation?: 'horizontal' (the whole at the side)}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { B, INK, GREY, root, sizeOf, inkOf, isTwin, slotValue } from './k2kit.js';

const SIDE = { S: 14, M: 16, L: 20 };

register('bond', {
    render(p, ctx) {
        const unit = isTwin(ctx) ? 'var(--mq-bond, 18mm)' : `${SIDE[sizeOf(ctx)] || 20}mm`;
        const at = (k) => `calc(${unit} * ${k})`;
        const answer = p.unknown === 'whole' ? p.whole : p.unknown === 'A' ? p.a : p.b;
        const shown = slotValue(ctx, 'answer', answer);
        const ink = shown !== '' ? inkOf(ctx) : null;
        const boxAt = (col, row, value, heavy, isSlot, xy = null) => {
            const pos = xy ? `position:absolute;left:${at(xy[0])};top:${at(xy[1])};`
                : `position:absolute;left:${at(col * 1.6)};top:${at(row * 1.9)};`;
            const shape = `width:${unit};height:${unit};box-sizing:border-box;border:${B(ctx, heavy ? 1.5 : 0.75)} solid ${INK};`
                + `border-radius:0;background:#fff;display:inline-flex;align-items:center;justify-content:center;`
                + `font-weight:700;font-size:${at(0.52)};line-height:1;`;
            if (!isSlot) return `<span class="k2-bond-box" style="${pos}${shape}color:${INK};">${esc(value)}</span>`;
            const hook = isTwin(ctx) ? ' data-mq-blank="box"' : '';
            return `<span class="k2-bond-box k2-bond-slot" data-ws-slot="answer" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
                + `style="${pos}${shape}color:${ink === 'trace' ? GREY : INK};">${esc(shown)}</span>`;
        };
        // O6 AP1 (2026-09-25): "Whole at the side" (RP-60 lets the orientation change per section):
        // the whole box at the left, halfway down, the two parts stacked at the right, the same
        // boxes, borders and slot. The default (whole above) is drawn exactly as before.
        if (p.orientation === 'horizontal') {
            const hl = (y2) => `<line x1="1" y1="1.45" x2="2.3" y2="${y2}" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
            const side = `<div class="k2-bond mq-bond" role="img" aria-label="number bond" style="position:relative;display:inline-block;`
                + `width:${at(3.3)};height:${at(2.9)};vertical-align:top;">`
                + `<svg viewBox="0 0 3.3 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${hl(0.5)}${hl(2.4)}</svg>`
                + boxAt(0, 0, p.whole, true, p.unknown === 'whole', [0, 0.95])
                + boxAt(0, 0, p.a, false, p.unknown === 'A', [2.3, 0])
                + boxAt(0, 0, p.b, false, p.unknown === 'B', [2.3, 1.9])
                + `</div>`;
            return root(ctx, 'k2-bond-cell', side);
        }
        const line = (x2) => `<line x1="2.1" y1="1" x2="${x2}" y2="1.9" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
        const bond = `<div class="k2-bond mq-bond" role="img" aria-label="number bond" style="position:relative;display:inline-block;`
            + `width:${at(4.2)};height:${at(2.9)};vertical-align:top;">`
            + `<svg viewBox="0 0 4.2 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${line(0.5)}${line(3.7)}</svg>`
            + boxAt(1, 0, p.whole, true, p.unknown === 'whole')
            + boxAt(0, 1, p.a, false, p.unknown === 'A')
            + boxAt(2, 1, p.b, false, p.unknown === 'B')
            + `</div>`;
        return root(ctx, 'k2-bond-cell', bond);
    },
    answerKey(p) {
        const v = p.unknown === 'whole' ? p.whole : p.unknown === 'A' ? p.a : p.b;
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});
