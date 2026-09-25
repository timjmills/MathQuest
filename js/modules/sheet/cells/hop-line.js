// js/modules/sheet/cells/hop-line.js
// Multiplication and division on a number line, template id `hop-line` (nl_mult, nl_div).
//
//          1      2      3      4              <- hop numbers (support: "Number each hop")
//        ⌒⌒⌒⌒   ⌒⌒⌒⌒   ⌒⌒⌒⌒   ⌒⌒⌒⌒
//   ●──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──→
//   0        3        6        9       12       <- labels every step (or every 1 on a short line)
//             4 × 3 = [   ]
//
// Three tasks, one drawing (response option):
//   draw      the sentence is printed with its answer box; the line is EMPTY (only 0 is marked).
//             The pupil draws equal hops and writes the product (÷: the number of hops). The
//             key draws the hops.
//   sentence  the hops are drawn; the pupil writes the whole sentence: [ ] × [ ] = [ ].
//   missing   the hops are drawn; one number of the sentence is a box.
//
// The line spans the full width of a one-column cell (176 mm at every size) and ticks are never
// closer than 4 mm: a line labelled every 1 is never longer than 0-36, so its 10 pt labels do not
// touch; a line labelled every step keeps an unlabelled tick at every whole number while the
// units are 1.2 mm or more apart. Labels are at least 10 pt (the zone size, never shrunk).
//
// Screen. A `draw` item's twin is a `.ws-ops-number-line` drawing, which screen-cell.js
// (wireNumberLines) turns into the tap-to-jump line: the labelled ticks become tap targets, the
// pupil's hops are drawn as he taps, and the answer box takes the host's input. A `sentence` or
// `missing` item keeps its drawn hops (the root is `.ws-ops-hop-line`, which the jump wiring
// leaves alone) and its boxes carry `data-mq-cell` / `data-mq-blank`.
//
// payload: {
//   op: 'x' | '/', hops: g, step: s, max: M (line end, a multiple of s when ticks are 'step'),
//   ticks: 'step' | 'one', response: 'draw' | 'sentence' | 'missing',
//   unknown?: 'a' | 'b' | 'c'   which number of the sentence is missing (missing task)
//   numbered?: bool             number each drawn hop 1, 2, 3 ...
// }
// × reads  hops × step = hops·step      ÷ reads  hops·step ÷ step = hops
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc } from './ops-common.js';
import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
const LINE_MM = 176;
const PAD_MM = 5;
const LABEL_PT_MIN = 10;
/** The longest line that may be labelled at every whole number (ticks >= 4.4 mm apart). */
export const ONE_TICK_MAX = 36;

/** The three numbers of the sentence, in writing order. */
export function sentenceOf(p) {
    const g = Number(p.hops), s = Number(p.step);
    return p.op === '/' ? { a: g * s, b: s, c: g, glyph: '÷' } : { a: g, b: s, c: g * s, glyph: '×' };
}

/** The slots of the sentence, in writing order, with their key values. */
export function hopSlots(p) {
    const t = sentenceOf(p);
    if (p.response === 'sentence') return [['a', t.a], ['b', t.b], ['c', t.c]];
    if (p.response === 'missing') { const u = ['a', 'b', 'c'].includes(p.unknown) ? p.unknown : 'c'; return [[u, t[u]]]; }
    return [['c', t.c]];
}

function lineSVG(g, p, { hops, ink }) {
    const max = Math.max(1, Number(p.max) || 20);
    const s = Number(p.step) || 1;
    const one = p.ticks === 'one';
    const pitch = (LINE_MM - 2 * PAD_MM - 4) / max;
    const X = (v) => PAD_MM + v * pitch;
    const labelMm = Math.max(LABEL_PT_MIN, g.zoneEm * g.pt) * PT_MM;
    const numMm = Math.max(LABEL_PT_MIN, g.zoneEm * g.pt * 0.9) * PT_MM;
    const hopPx = s * pitch;
    const arcH = Math.min(9, Math.max(4, hopPx * 0.28));
    const top = (p.numbered ? numMm + 1.5 : 1) + (g.screen ? 0 : 2.5);   // paper: clear of the item letter
    const yLine = top + arcH + 1.5;
    const H = yLine + 3 + labelMm * 1.25 + 1;
    const W = max * pitch + PAD_MM * 2 + 4;
    let body = `<line x1="${(PAD_MM - 2).toFixed(2)}" y1="${yLine.toFixed(2)}" x2="${(X(max) + 3).toFixed(2)}" y2="${yLine.toFixed(2)}" stroke="${INK.ink}" stroke-width="0.53"/>`;
    body += `<path d="M${(X(max) + 4.5).toFixed(2)} ${yLine.toFixed(2)} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
    // R3 (critic round 3): a tick at every whole number gave 60-77 ticks 2 mm apart on a line to
    // 72, and the pupil hunted the labelled multiples. The whole-number ticks are drawn only when
    // they are countable - a small step (up to 5) and at least 3 mm apart - otherwise the line
    // is ticked by the step alone.
    const minor = !one && s <= 5 && pitch >= 3;
    // Labels never touch: when two neighbouring step labels would be closer than their own width
    // (3-digit labels at a pitch of 8 mm; the screen draws the line smaller still), every other
    // step is labelled (every third ...). Every step keeps its long tick.
    const widest = String(max).length * 0.56 * labelMm + (g.screen ? 3 : 1.5);
    const every = one ? 1 : Math.max(1, Math.ceil(widest / (s * pitch * (g.screen ? 0.8 : 1))));
    for (let v = 0; v <= max; v++) {
        const major = one || v % s === 0;
        if (!major && !minor) continue;
        const t = major ? 2.4 : 1.3;
        body += `<line x1="${X(v).toFixed(2)}" y1="${(yLine - t).toFixed(2)}" x2="${X(v).toFixed(2)}" y2="${(yLine + t).toFixed(2)}" stroke="${INK.ink}" stroke-width="${major ? 0.35 : 0.2}"/>`;
        if (major && (one || (v / s) % every === 0 || v === max)) body += `<text x="${X(v).toFixed(2)}" y="${(yLine + 3 + labelMm).toFixed(2)}" text-anchor="middle" font-size="${labelMm.toFixed(2)}" font-family="Andika, sans-serif" fill="${INK.ink}">${v}</text>`;
    }
    body += `<circle cx="${X(0).toFixed(2)}" cy="${yLine.toFixed(2)}" r="1.3" fill="${INK.ink}" data-nl-start="0"/>`;
    if (hops > 0 && ink) {
        const colour = ink === 'trace' ? INK.grey : INK.ink;
        for (let k = 0; k < hops && (k + 1) * s <= max; k++) {
            const a = X(k * s), b = X((k + 1) * s);
            body += `<path data-ws-hop="${k + 1}" d="M${(a + 0.4).toFixed(2)} ${(yLine - 0.6).toFixed(2)} Q${((a + b) / 2).toFixed(2)} ${(yLine - arcH * 2).toFixed(2)} ${(b - 0.4).toFixed(2)} ${(yLine - 0.6).toFixed(2)}" `
                + `fill="none" stroke="${colour}" stroke-width="0.45" data-ws-ink="${ink}"/>`;
            body += `<path d="M${(b - 1.6).toFixed(2)} ${(yLine - 2.2).toFixed(2)} L${(b - 0.4).toFixed(2)} ${(yLine - 0.6).toFixed(2)} L${(b - 2.2).toFixed(2)} ${(yLine - 0.9).toFixed(2)}" fill="none" stroke="${colour}" stroke-width="0.45"/>`;
            if (p.numbered) body += `<text data-ws-hopnum="${k + 1}" x="${((a + b) / 2).toFixed(2)}" y="${(top - 0.8).toFixed(2)}" text-anchor="middle" font-size="${numMm.toFixed(2)}" font-weight="700" font-family="Andika, sans-serif" fill="${colour}">${k + 1}</text>`;
        }
    }
    const svg = `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" role="img" aria-label="number line from 0 to ${max}" `
        + `style="display:block;margin:0 auto;width:${g.em(W)};height:${g.screen ? 'auto' : g.em(H)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;
    return { svg, wMm: W, hMm: H };
}

register('hop-line', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const slots = hopSlots(p);
        const key = Object.fromEntries(slots.map(([id, v]) => [id, String(v)]));
        const vals = slotValues(ctx, key, (w) => {
            const parts = String(w).split(/\s*,\s*/);
            const o = {};
            slots.forEach(([id], i) => { if (parts[i] !== undefined) o[id] = parts[i]; });
            return o;
        });
        const t = sentenceOf(p);
        // The hops drawn: always on a sentence / missing item; on a draw item only once written
        // (the key, a trace), and then as far as the written answer says.
        let hops = 0, hopInk = null;
        if (p.response === 'sentence' || p.response === 'missing') { hops = Number(p.hops); hopInk = 'solid'; }
        else if (ink) {
            const w = Number(vals.c);
            hops = Number.isFinite(w) ? (p.op === '/' ? w : Math.round(w / (Number(p.step) || 1))) : 0;
            hopInk = ink;
        }
        const line = lineSVG(g, p, { hops, ink: hopInk });
        const one = slots.length === 1;
        const bw = (v) => Math.max(g.writeMm * 2, String(v).length * 0.62 * g.E + 4);
        const part = (id, v) => (key[id] !== undefined
            ? box(g, id, { wMm: bw(v), hMm: g.stripMm, value: vals[id] || '', ink, mark: one ? 'blank' : 'cell' })
            : `<span>${esc(v)}</span>`);
        const op = (c) => `<span style="font-weight:700;width:1em;text-align:center">${c}</span>`;
        const eq = `<div data-mq-join=", " style="display:inline-flex;align-items:center;gap:0.28em;white-space:nowrap;margin-top:0.3em">`
            + part('a', t.a) + op(t.glyph) + part('b', t.b) + op('=') + part('c', t.c) + '</div>';
        // `number-line` only for the draw task: that root is what the screen's jump line adopts.
        const name = p.response === 'draw' ? 'number-line' : 'hop-line';
        return root(g, name, `${line.svg}${eq}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const slots = hopSlots(p);
        const out = {};
        slots.forEach(([id, v]) => { out[id] = { value: String(v), graded: true }; });
        const list = slots.map(([, v]) => String(v));
        const t = sentenceOf(p);
        return { value: list.length === 1 ? Number(list[0]) : list.join(', '), display: `${t.a} ${t.glyph} ${t.b} = ${t.c}`, slots: out };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const line = lineSVG(g, p, { hops: 0, ink: null });
        return { wMm: Math.ceil(line.wMm + 6), hMm: Math.ceil(line.hMm + g.stripMm + 6), measure: true, factLike: false, maxCols: 1 };
    },
    inputs(p) {
        return hopSlots(p).map(([id], n) => ({ id, kind: 'number', shape: 'box', graded: true, order: n, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});
