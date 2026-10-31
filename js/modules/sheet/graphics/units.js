// js/modules/sheet/graphics/units.js
// The one set of unit helpers every graphic-library drawing uses (design/GRAPHIC_LIBRARY.md).
//
// A drawing is written ONCE in paper millimetres and points. On paper `L(ctx, mm)` is `mm`,
// `P(ctx, pt)` is `pt` and `B(ctx, pt)` a stroke in pt; in the screen twin (`ctx.options.twin`)
// the same numbers become `calc(var(--mq-k2) * mm)` and px, so paper and screen are the same
// drawing at two scales (WDS SP-1, VQ-8). Ink and the single grey come from tokens.js (INK-1);
// strokes from the closed ladder STROKE_WIDTHS (INK-10). Sizes S / M / L from ctx.size and
// ctx.metrics (L1: never a fixed size).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { INK as TOKENS_INK, STROKE_WIDTHS, blankWidth } from '../tokens.js';
import { L, P, B, isTwin, sizeOf, digitPt, textPt, zonePt, KEY_FEATURES, n2, PT_MM } from '../cells/k2kit.js';
import { esc } from '../cell.js';

export { L, P, B, isTwin, sizeOf, digitPt, textPt, zonePt, KEY_FEATURES, n2, PT_MM, esc, blankWidth };

/** All text and lines. */
export const INK = TOKENS_INK.ink;
/** The only grey (INK-3): trace digits, faded scaffolds. */
export const GREY = TOKENS_INK.grey;
/** The page. */
export const PAPER = TOKENS_INK.paper;

/** A stroke from the closed ladder (INK-10): the nearest allowed width, never a hairline. */
export function stroke(pt) {
    let best = STROKE_WIDTHS[0];
    for (const w of STROKE_WIDTHS) if (Math.abs(w - pt) < Math.abs(best - pt)) best = w;
    return best;
}

/** The ink a written value takes in this cell state: grey trace, solid, or none (blank). */
export const inkOf = (ctx) => (ctx && ctx.state === 'traced' ? 'trace' : ctx && (ctx.state === 'answered' || ctx.state === 'wrong') ? 'solid' : null);
/** Is anything written in this state (the key, a trace, finished work)? */
export const filled = (ctx) => !!ctx && ctx.state !== 'blank' && ctx.state !== undefined;
/** The colour of a written value. */
export const colorOf = (ink) => (ink === 'trace' ? GREY : INK);
/** A twin target is never under 44 px (RUBRIC C1 touch targets); paper keeps its mm. */
export const tw = (ctx, mm) => (isTwin(ctx) ? `max(44px, ${L(ctx, mm)})` : L(ctx, mm));
/** Andika, the kit's only face (TY-1), proportional digits, never letter-spaced (VQ-5). */
export const FONT = "font-family:'Andika','Open Sans',sans-serif;letter-spacing:0;";
/** Numbers in a library drawing: Andika's open 4 (cv04), lining, PROPORTIONAL digits (VQ-5).
 *  Column work keeps KEY_FEATURES (tabular) because its digits must line up in tracks. */
export const NUM_FEATURES = "font-feature-settings:'cv04' 1;font-variant-numeric:lining-nums proportional-nums;";
