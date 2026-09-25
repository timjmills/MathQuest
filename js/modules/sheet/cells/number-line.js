// js/modules/sheet/cells/number-line.js
// Addition on a number line, template id `number-line`.
//
//        ⌒  ⌒  ⌒  ⌒                <- the jumps: drawn by the PUPIL; the key draws them
//   ├──┼──●──┼──┼──┼──┼──┼──┼──┤→
//   0  1  2  3  4  5  6  7  8  9 10  <- every whole number labelled, at the zone-label size
//        3 + 4 = [  ]               <- the answer, in the pupil's own box
//
// Only the start is marked (a solid dot on the first addend): the line never shows the jumps or
// the landing point on the pupil page (RP-1). The unit pitch has a floor (6.5 mm on a 0-20 line,
// 11 mm on 0-10) and the labels stay at the preset's zone-label size (TY-11: never under 8 pt,
// never shrunk to fit), so the cell has a minimum width and is measured: a narrow page column
// gets fewer cells per row, never a shrunken line (PG-20, the critic's 5 pt labels, H2).
//
// The key draws the jumps, one arc per unit from the start, and writes the sum in the pupil's
// box; a wrong piece of work (Error analysis) draws the jumps to where that wrong answer landed.
//
// Payload: { max: 10|20, start, add }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc } from './ops-common.js';
import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
const pitchOf = (max) => (max <= 10 ? 11 : 6.5);

function lineSVG(g, p, jumpsTo, ink) {
    const max = Number(p.max) || 20, start = Number(p.start);
    const pitch = pitchOf(max);
    const pad = 5, x0 = pad;
    const W = max * pitch + pad * 2 + 4;
    const labelMm = Math.max(8, g.zoneEm * g.pt) * PT_MM;       // zone size, >= 8 pt
    const arcH = Math.min(8, pitch * 0.75);
    const yLine = arcH + 3;
    const H = yLine + 3 + labelMm * 1.25 + 1;
    const X = (v) => x0 + v * pitch;
    let body = `<line x1="${(x0 - 2).toFixed(2)}" y1="${yLine}" x2="${(X(max) + 3).toFixed(2)}" y2="${yLine}" stroke="${INK.ink}" stroke-width="0.53"/>`;
    body += `<path d="M${(X(max) + 4.5).toFixed(2)} ${yLine} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
    for (let v = 0; v <= max; v++) {
        const t = v % 5 === 0 ? 2.4 : 1.6;
        body += `<line x1="${X(v).toFixed(2)}" y1="${(yLine - t).toFixed(2)}" x2="${X(v).toFixed(2)}" y2="${(yLine + t).toFixed(2)}" stroke="${INK.ink}" stroke-width="0.265"/>`;
        body += `<text x="${X(v).toFixed(2)}" y="${(yLine + 3 + labelMm).toFixed(2)}" text-anchor="middle" font-size="${labelMm.toFixed(2)}" font-family="Andika, sans-serif" fill="${INK.ink}">${v}</text>`;
    }
    body += `<circle cx="${X(start).toFixed(2)}" cy="${yLine}" r="1.4" fill="${INK.ink}" data-nl-start="${start}"/>`;
    if (jumpsTo !== null && ink) {
        const colour = ink === 'trace' ? INK.grey : INK.ink;
        const end = Math.max(0, Math.min(max, jumpsTo));
        const dir = end >= start ? 1 : -1;
        for (let v = start; v !== end; v += dir) {
            const a = X(v), b = X(v + dir);
            body += `<path d="M${a.toFixed(2)} ${(yLine - 0.6).toFixed(2)} Q${((a + b) / 2).toFixed(2)} ${(yLine - arcH * 1.3).toFixed(2)} ${b.toFixed(2)} ${(yLine - 0.6).toFixed(2)}" fill="none" stroke="${colour}" stroke-width="0.4" data-ws-ink="${ink}"/>`;
        }
        body += `<circle cx="${X(end).toFixed(2)}" cy="${yLine}" r="1.1" fill="none" stroke="${colour}" stroke-width="0.4"/>`;
    }
    const svg = `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" role="img" aria-label="number line from 0 to ${max}, start at ${start}" `
        + `style="display:block;margin:0 auto;width:${g.em(W)};height:${g.screen ? 'auto' : g.em(H)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;
    return { svg, wMm: W, hMm: H };
}

register('number-line', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const sum = Number(p.start) + Number(p.add);
        const vals = slotValues(ctx, { answer: String(sum) }, (w) => ({ answer: String(w).trim() }));
        const shown = vals.answer !== undefined && vals.answer !== '' ? Number(vals.answer) : null;
        const line = lineSVG(g, p, Number.isFinite(shown) ? shown : null, ink);
        const bw = Math.max(g.writeMm * 2, 2 * 0.62 * g.E + 4);
        const eq = `<div style="display:inline-flex;align-items:center;gap:0.28em;white-space:nowrap;margin-top:0.3em">`
            + `<span>${esc(p.start)}</span><span style="font-weight:700;width:1em;text-align:center">+</span><span>${esc(p.add)}</span>`
            + `<span style="font-weight:700;width:1em;text-align:center">=</span>`
            + box(g, 'answer', { wMm: bw, hMm: g.stripMm, value: vals.answer || '', ink, mark: 'blank' }) + '</div>';
        return root(g, 'number-line', `${line.svg}${eq}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const sum = Number(p.start) + Number(p.add);
        return { value: sum, display: String(sum), slots: { answer: { value: String(sum), graded: true } } };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const line = lineSVG(g, p, null, null);
        return { wMm: Math.ceil(line.wMm + 6), hMm: Math.ceil(line.hMm + g.stripMm + 6), measure: true, factLike: false, maxCols: 2 };
    },
    inputs() {
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});
