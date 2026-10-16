// js/modules/sheet/cells/fos.js
// The `fos` template: a fraction of a set (fraction_of_set, fraction_of_set_hard; 3.NF.1 / 4.NF.4
// readiness). Critic fractions-key r4, R4-2 / R4-3: the legacy picture filled a whole page (its
// SVG scaled to the cell's width), shaded the answer of a missing-numerator item, printed slashed
// fractions, faded labels, dashed separators and colour words. This cell is sized to its content
// from ctx.metrics and draws in black and white:
//
//   payload {task, num, den, mult, total, part, ans, story?, noun?}
//     task 'of'       n/d of T = [ ]          (ans = n x mult)
//     task 'missing'  [ ]/d of T = part       (ans = n, the numerator)
//     task 'word'     a short story with the fraction stacked in it, ending in [ ] noun (on screen the
//                     story is the prompt line and the cell draws the picture, then [ ] noun)
//
// The picture is the structural scaffold on EVERY item and never shows the answer (LESSONS L3):
// d equal groups, each a ring holding `mult` outline counters, nothing shaded on the pupil page.
// The key (state answered) shades the n groups the answer counts, in the single grey tagged
// `data-ws-key-fill`, which the key page paints in key ink (sheet-kit.css INK-31); the answer box
// is the slot.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, svg, root, box, slotValue, digitPt, textPt, inlineBoxMm, INK, GREY, SW, n2, sizeOf, isTwin, PT_MM, KEY_FEATURES, k2Twin } from './k2kit.js';

/** Counter diameter by size (mm): big enough to shade with a pencil, smaller at S (L1). */
const DIAM = { S: 4, M: 4.2, L: 5.2 };
/** The widest the groups picture is drawn (mm), and the gap between two rings side by side. */
const MAX_W = 84;
const RING_GAP_X = 4;
/** The least height a small set's picture is given (mm) by arranging its rings, never by scaling. */
const MIN_H = { S: 13, M: 15, L: 18 };

/** The groups picture: one ring per group, `mult` counters in it, the key's groups shaded. */
function geom(p, ctx) {
    const d = DIAM[sizeOf(ctx)] || DIAM.L;
    const pitch = d + 1.4;
    const pad = 1;
    const ringGap = 1.2;
    const mult = Math.max(1, Number(p.mult) || 1);
    const den = Math.max(1, Number(p.den) || 1);
    // R4-2: the rings sit side by side, in rows of an equal count (6 groups: 3 + 3, never 4 + 2),
    // and a long group folds onto equal lines inside its ring (10: 5 + 5). Of the arrangements
    // within MAX_W, a big set takes the shortest, so the cell is as short as its content allows;
    // a small set takes the shortest that is at least MIN_H tall (two rings one above the other,
    // not a 7 mm strip), so a short item does not leave most of its row empty (RUBRIC H13). One
    // arrangement at every column count, so the picture is the same size wherever it is drawn
    // (DN-10: it is never redrawn narrower for a narrower column).
    const ringOf = (per) => per * pitch - 1.4 + 2 * pad;
    const all = [];
    for (let c = 1; c <= den; c++) {
        const rows = Math.ceil(den / c);
        const cols = Math.ceil(den / rows);
        if (all.some((a) => a.cols === cols)) continue;
        const avail = (MAX_W - (cols - 1) * RING_GAP_X);
        const fit = Math.min(12, Math.floor((avail / cols - 2 * pad + 1.4) / pitch));
        if (fit < 1) continue;
        for (let lines = Math.ceil(mult / fit); lines <= Math.min(mult, Math.ceil(mult / fit) + 2); lines++) {
            const perLine = Math.ceil(mult / lines);
            if (Math.ceil(mult / perLine) !== lines) continue;
            const ringW = ringOf(perLine);
            const ringH = lines * pitch - 1.4 + 2 * pad;
            const h = rows * ringH + (rows - 1) * ringGap + 1;
            all.push({ cols, rows, perLine, ringW, ringH, h, w: cols * ringW + (cols - 1) * RING_GAP_X + 1 });
        }
    }
    all.sort((a, b) => a.h - b.h || a.cols - b.cols);
    const minH = MIN_H[sizeOf(ctx)] || MIN_H.L;
    const best = all[0].h >= minH ? all[0] : (all.find((a) => a.h >= minH) || all[all.length - 1]);
    const { cols, rows, perLine, ringW, ringH, h, w } = best;
    return { d, pitch, pad, ringGap, mult, den, perLine, ringW, ringH, cols, rows, w, h };
}

function picture(p, ctx) {
    const g = geom(p, ctx);
    const shadeKey = ctx.state === 'answered' || ctx.state === 'traced';
    const shadeN = shadeKey ? Math.min(g.den, Math.max(0, Number(p.num) || 0)) : 0;
    let body = '';
    for (let k = 0; k < g.den; k++) {
        const oy = 0.5 + Math.floor(k / g.cols) * (g.ringH + g.ringGap);
        const ox = 0.5 + (k % g.cols) * (g.ringW + RING_GAP_X);
        body += `<rect x="${n2(ox)}" y="${n2(oy)}" width="${n2(g.ringW)}" height="${n2(g.ringH)}" rx="${n2(Math.min(3, g.ringH / 2))}" fill="none" stroke="${INK}" stroke-width="${n2(SW.one)}"/>`;
        const on = k < shadeN;
        // the key's shading: the single grey, tagged so the key page paints it in key ink
        const fill = on ? `fill="${GREY}"${ctx.state === 'answered' ? ' data-ws-key-fill="1"' : ''}` : 'fill="#fff"';
        for (let i = 0; i < g.mult; i++) {
            const cx = ox + g.pad + (i % g.perLine) * g.pitch + g.d / 2;
            const cy = oy + g.pad + Math.floor(i / g.perLine) * g.pitch + g.d / 2;
            body += `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(g.d / 2)}" ${fill} stroke="${INK}" stroke-width="${n2(SW.one)}"/>`;
        }
    }
    return svg(ctx, g.w, g.h, body, { cls: 'fos-groups', label: `${g.den} equal groups of ${g.mult}` });
}

const num = (ctx, v) => `<span style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1.05;${KEY_FEATURES}">${esc(v)}</span>`;
const word = (ctx, s) => `<span style="font-size:${P(ctx, textPt(ctx) + 3)};line-height:1;">${esc(s)}</span>`;
const op = (ctx, s) => `<span style="display:inline-block;min-width:0.9em;text-align:center;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">${s}</span>`;

/** A fraction stacked over its bar (TY-7), at the digit size. */
function stacked(ctx, top, bottom) {
    return `<span class="fos-frac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;flex:none;">`
        + `${top}<span aria-hidden="true" style="display:block;align-self:stretch;min-width:${L(ctx, 6)};border-top:${B(ctx, 1.5)} solid ${INK};margin:${L(ctx, 0.7)} 0;"></span>${bottom}</span>`;
}

/** A small stacked fraction inside a line of text (the story). */
function inlineFrac(ctx, n, d) {
    return `<span class="fos-frac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;font-weight:700;margin:0 ${L(ctx, 0.6)};">`
        + `<span>${esc(n)}</span><span aria-hidden="true" style="display:block;align-self:stretch;min-width:0.8em;border-top:${B(ctx, 1)} solid ${INK};margin:${L(ctx, 0.4)} 0;"></span><span>${esc(d)}</span></span>`;
}

function slot(p, ctx) {
    const b = inlineBoxMm(ctx, 2);
    return box(ctx, { value: slotValue(ctx, 'answer', p.ans), w: b.w, h: b.h, mark: 'blank' });
}

function sentence(p, ctx) {
    const row = (parts) => `<div class="ws-eq fos-eq" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.8)};white-space:nowrap;">${parts.join('')}</div>`;
    if (p.task === 'missing') return row([stacked(ctx, slot(p, ctx), num(ctx, p.den)), word(ctx, 'of'), num(ctx, p.total), op(ctx, '='), num(ctx, p.part)]);
    return row([stacked(ctx, num(ctx, p.num), num(ctx, p.den)), word(ctx, 'of'), num(ctx, p.total), op(ctx, '='), slot(p, ctx)]);
}

/** The story with its fraction stacked: "{f}" in `story` marks where the fraction goes. */
function story(p, ctx) {
    const parts = String(p.story || '').split('{f}');
    // The answer stands at the end of the question it answers ("How many are in the box? [ ] beads"),
    // so the cell has no answer row of its own under the picture.
    const ans = `<span class="fos-ans" style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};white-space:nowrap;vertical-align:middle;margin-left:${L(ctx, 1.5)};">${slot(p, ctx)}${word(ctx, p.noun || '')}</span>`;
    const html = parts.map(esc).join(inlineFrac(ctx, p.num, p.den)) + ans;
    // The story wraps at the picture's measure in every column count, so a one-column cell is
    // the same cell as a two-column one (no reflow between them).
    return `<div class="fos-story" style="font-size:${P(ctx, textPt(ctx))};line-height:1.5;text-align:left;max-width:${L(ctx, MAX_W)};margin:0 auto;">${html}</div>`;
}

function size(p, ctx) {
    const g = geom(p, ctx);
    const dig = digitPt(ctx) * PT_MM;
    const box2 = inlineBoxMm(ctx, 2);
    const fracH = (p.task === 'missing' ? box2.h + dig * 1.05 : 2 * dig * 1.05) + 2;
    const eqH = p.task === 'word' ? 0 : Math.max(fracH, box2.h);
    const storyH = p.task === 'word' ? 2 * textPt(ctx) * PT_MM * 1.5 + box2.h : 0;
    const eqW = p.task === 'word' ? box2.w + 30 : 7 + 8 + String(p.total).length * dig * 0.62 + 6 + Math.max(box2.w, String(p.total).length * dig * 0.62) + 8;
    return { w: Math.max(g.w, eqW, p.task === 'word' ? 70 : 0), h: storyH + eqH + 4 + g.h };
}

register('fos', {
    render(p, ctx) {
        const pic = `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 2)};">${picture(p, ctx)}</div>`;
        // The screen twin of a story item: the story is the host's prompt line above the cell, so
        // the cell draws the picture and the answer under it ("[ ] beads"), never the story twice.
        const answerRow = `<div class="ws-eq fos-eq" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.8)};margin-top:${L(ctx, 3)};white-space:nowrap;">${slot(p, ctx)}${word(ctx, p.noun || '')}</div>`;
        const inner = p.task === 'word' ? (isTwin(ctx) ? pic + answerRow : story(p, ctx) + pic) : sentence(p, ctx) + pic;
        return root(ctx, 'fos-cell', inner, { attrs: ` data-fos-task="${esc(p.task || 'of')}"` });
    },
    answerKey(p) {
        const v = Number(p.ans);
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint(p, ctx) {
        const { w, h } = size(p, ctx);
        const wMm = Math.ceil(w + 8), hMm = Math.ceil(h + 8);
        return { wMm, hMm, measure: true, factLike: false, maxCols: wMm <= 56 ? 3 : wMm <= 88 ? 2 : 1 };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

export const FOS_TEMPLATE = 'fos';
/** The screen twin of a fraction-of-a-set cell: the same drawing on the card, worksheet and quiz. */
export const fosTwin = (payload) => k2Twin('fos', payload);
