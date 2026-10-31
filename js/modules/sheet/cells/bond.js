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
import { root, inkOf, slotValue } from './k2kit.js';
import { numberBond, BOND_SIDE } from '../graphics/number-bond.js';

// (the geometry is the graphic library's `numberBond`, design/GRAPHIC_LIBRARY.md)
export const SIDE = BOND_SIDE;

register('bond', {
    render(p, ctx) {
        const answer = p.unknown === 'whole' ? p.whole : p.unknown === 'A' ? p.a : p.b;
        const shown = slotValue(ctx, 'answer', answer);
        const ink = shown !== '' ? inkOf(ctx) : null;
        // O6 AP1 (2026-09-25): "Whole at the side" (RP-60 lets the orientation change per section).
        const bond = numberBond(ctx, { whole: p.whole, a: p.a, b: p.b, unknown: p.unknown, shown, ink, orientation: p.orientation === 'horizontal' ? 'horizontal' : 'vertical' });
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
