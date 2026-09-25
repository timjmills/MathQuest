// js/modules/sheet/cells/number-line.js
// Addition and subtraction on a number line, template id `number-line`
// (number_line_add, number_line_sub, nl_add, nl_sub).
//
//        ⌒  ⌒  ⌒  ⌒                <- ONE HOP PER NUMBER: drawn by the PUPIL; the key draws them
//   ├──┼──●──┼──┼──┼──┼──┼──┼──┤→
//   0  1  2  3  4  5  6  7  8  9 10  <- EVERY whole number ticked and labelled, at the zone size
//        3 + 4 = [  ]               <- the answer box IN the equation (any of its three numbers)
//
// Only the given point is marked (a solid dot on the start, or an open ring on the landing point
// when the start is the missing number): the line never shows the jumps or the answer on the
// pupil page (RP-1). The hops are a hint scaffold: a Guided cell (scaffold level 2-3) shows them
// in trace grey, and they fade after it. The line spans the full width of a one-column cell
// (LINE_MM): the unit pitch is the width over the units, at most 16 mm, so the window is only as
// long as the item needs (0-10, 0-20, or a window of about 15 numbers around a bigger jump) and
// every numeral fits at 12 pt or more (never shrunk to fit). The line is one drawing at every
// column count (DN-10), so the cell is one column wide.
//
// Owner request (2026-09-25): unit hops the pupil counts, every number labelled, the answer slot
// in the equation (14 − [ ] = 11) instead of a separate Answer line, and the cell sized to its
// content, so five problems fit a page.
//
// The key draws the hops, one arc per unit from the start, and writes the answer in the pupil's
// box; a wrong piece of work (Error analysis) draws the hops to where that wrong answer landed.
//
// Payload: { max, start, add, op?: '+'|'-', unknown?: 'result'|'a'|'b', min?: 0,
//            ticks?: 'one'|'some'|'ends' }
//
// `ticks` (O6 appearance, lane AP3, "Numbers on the line"): which ticks carry a numeral. Every
// tick is always drawn and the hops stay one per number; only the numerals thin out
// (line-labels.js): 'one' (absent, the default the owner asked for) every number, 'some' every
// 2nd number, 'ends' the two ends. The given point (the dot or the ring) is always labelled -
// it is information the pupil is given. Every tick carries `data-nl-v` (its value) and a
// labelled one `data-nl-lab`, so the screen's tap-to-jump line keeps a target on every tick
// and shows the same numerals as the paper.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc } from './ops-common.js';
import { INK } from '../tokens.js';
import { tickLabelSet } from './line-labels.js';

const PT_MM = 25.4 / 72;
/** The drawn width of every line: a one-column cell's content width (186 mm less pads). */
const LINE_MM = 176;
const PAD_MM = 5;
/** Unit pitch (mm): the line's width over its units, never more than 16 mm. */
const pitchOf = (units) => Math.min(16, (LINE_MM - 2 * PAD_MM - 4) / Math.max(1, units));
/** A number as printed: the true minus (TY-3). */
const neg = (v) => (Number(v) < 0 ? `\u2212${-Number(v)}` : String(v));
/** Label size (pt): the zone-label token, never under 12 pt. */
const LABEL_PT_MIN = 12;

/** The item's numbers: start, how many (the unit hops), the operation, the missing number. */
function partsOf(p) {
    const start = Number(p.start), add = Number(p.add);
    const op = p.op === '-' || p.op === '−' ? '-' : '+';
    const end = op === '+' ? start + add : start - add;
    const unknown = ['a', 'b'].includes(p.unknown) ? p.unknown : 'result';
    const min = Number.isFinite(Number(p.min)) ? Number(p.min) : 0;
    const max = Number(p.max) || 20;
    const ticks = ['some', 'ends'].includes(p.ticks) ? p.ticks : 'one';
    return { start, add, op, end, unknown, min, max, ticks, ans: unknown === 'a' ? start : unknown === 'b' ? add : end };
}

/**
 * The line. `from` is where drawn hops start (the given start, or a written start), `hopsTo`
 * where they end (null: none drawn), in `ink`.
 */
function lineSVG(g, p, hopsTo, ink, from = null) {
    const t = partsOf(p);
    const units = t.max - t.min;
    const pitch = pitchOf(units);
    const pad = PAD_MM, x0 = pad;
    const W = units * pitch + pad * 2 + 4;
    const labelMm = Math.max(LABEL_PT_MIN, g.zoneEm * g.pt) * PT_MM;   // zone size, >= 12 pt
    const arcH = Math.min(8, pitch * 0.75);
    const yLine = arcH + 3;
    const H = yLine + 3 + labelMm * 1.25 + 1;
    const X = (v) => x0 + (v - t.min) * pitch;
    let body = `<line x1="${(x0 - 2).toFixed(2)}" y1="${yLine}" x2="${(X(t.max) + 3).toFixed(2)}" y2="${yLine}" stroke="${INK.ink}" stroke-width="0.53"/>`;
    body += `<path d="M${(X(t.max) + 4.5).toFixed(2)} ${yLine} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
    // The given point is always labelled (the start, or the landing point when the start is missing).
    const given = (t.unknown === 'a' ? t.end : t.start) - t.min;
    const lab = t.ticks === 'one' ? null : new Set(tickLabelSet(units, t.ticks, {
        period: 2, zero: t.min <= 0 && t.max >= 0 ? -t.min : null, origin: ((-t.min % 2) + 2) % 2, keep: [given],
    }));
    for (let v = t.min; v <= t.max; v++) {
        const tk = v % 5 === 0 ? 2.4 : 1.6;
        const on = !lab || lab.has(v - t.min);
        // a line through 0 (add_int, sub_int) writes its numerals with the true minus, so every
        // tick carries its value for the screen's tap-to-jump line (which reads -5, not −5)
        const tag = lab || t.min < 0 ? ` data-nl-v="${v}"${on ? ' data-nl-lab="1"' : ''}` : '';
        body += `<line x1="${X(v).toFixed(2)}" y1="${(yLine - tk).toFixed(2)}" x2="${X(v).toFixed(2)}" y2="${(yLine + tk).toFixed(2)}" stroke="${INK.ink}" stroke-width="0.265"${tag}/>`;
        if (on) body += `<text x="${X(v).toFixed(2)}" y="${(yLine + 3 + labelMm).toFixed(2)}" text-anchor="middle" font-size="${labelMm.toFixed(2)}" font-family="Andika, sans-serif" fill="${INK.ink}">${neg(v)}</text>`;
    }
    // The given point: the start, or (start missing) where the hops land. `data-nl-start` is
    // where the screen's tap-to-jump line begins.
    if (t.unknown === 'a') body += `<circle cx="${X(t.end).toFixed(2)}" cy="${yLine}" r="1.4" fill="#fff" stroke="${INK.ink}" stroke-width="0.4" data-nl-start="${t.end}"/>`;
    else body += `<circle cx="${X(t.start).toFixed(2)}" cy="${yLine}" r="1.4" fill="${INK.ink}" data-nl-start="${t.start}"/>`;
    if (hopsTo !== null && ink) {
        const colour = ink === 'trace' ? INK.grey : INK.ink;
        const s0 = from === null ? t.start : from;
        const end = Math.max(t.min, Math.min(t.max, hopsTo));
        const dir = end >= s0 ? 1 : -1;
        for (let v = Math.max(t.min, Math.min(t.max, s0)); v !== end; v += dir) {
            const a = X(v), b = X(v + dir);
            body += `<path d="M${a.toFixed(2)} ${(yLine - 0.6).toFixed(2)} Q${((a + b) / 2).toFixed(2)} ${(yLine - arcH * 1.3).toFixed(2)} ${b.toFixed(2)} ${(yLine - 0.6).toFixed(2)}" fill="none" stroke="${colour}" stroke-width="0.4" data-ws-ink="${ink}"/>`;
        }
        body += `<circle cx="${X(end).toFixed(2)}" cy="${yLine}" r="1.1" fill="none" stroke="${colour}" stroke-width="0.4"/>`;
    }
    const svg = `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" role="img" aria-label="number line from ${t.min} to ${t.max}${t.unknown === 'a' ? '' : `, start at ${t.start}`}" `
        + `style="display:block;margin:0 auto;width:${g.em(W)};height:${g.screen ? 'auto' : g.em(H)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;
    return { svg, wMm: W, hMm: H };
}

register('number-line', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const t = partsOf(p);
        const vals = slotValues(ctx, { answer: String(t.ans) }, (w) => ({ answer: String(w).trim() }));
        const shown = vals.answer !== undefined && vals.answer !== '' ? Number(vals.answer) : null;
        // The drawn hops follow the WRITTEN answer (a wrong one lands where it says): the landing
        // point, the jump from the start, or the hops from a written start to the given end.
        let to = null, from = null, hopInk = ink;
        if (Number.isFinite(shown)) {
            if (t.unknown === 'result') to = shown;
            else if (t.unknown === 'b') to = t.op === '+' ? t.start + shown : t.start - shown;
            else { from = shown; to = t.end; }
        } else if (!g.twin && ctx && Number(ctx.scaffoldLevel) >= 2) {
            // The hint: a Guided cell shows the unit hops in grey before anything is written.
            to = t.end; hopInk = 'trace';
            if (t.unknown === 'a') from = t.start;
        }
        const line = lineSVG(g, p, to, hopInk, from);
        // a negative answer is three characters wide (−12)
        const bw = Math.max(g.writeMm * 2, (t.min < 0 ? 3 : 2) * 0.62 * g.E + 4);
        const slot = box(g, 'answer', { wMm: bw, hMm: g.stripMm, value: vals.answer || '', ink, mark: 'blank' });
        // a negative second number stands in brackets: 3 + (−5)
        const part = (which, v) => (t.unknown === which ? slot
            : `<span>${esc(which === 'b' && Number(v) < 0 ? `(${neg(v)})` : neg(v))}</span>`);
        const op = (c) => `<span style="font-weight:700;width:1em;text-align:center">${c}</span>`;
        // The answer box is IN the equation (no separate full-width Answer line).
        const eq = `<div style="display:inline-flex;align-items:center;gap:0.28em;white-space:nowrap;margin-top:0.3em">`
            + part('a', t.start) + op(t.op === '+' ? '+' : '−') + part('b', t.add) + op('=') + part('result', t.end) + '</div>';
        return root(g, 'number-line', `${line.svg}${eq}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const t = partsOf(p);
        return { value: t.ans, display: String(t.ans), slots: { answer: { value: String(t.ans), graded: true } } };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const line = lineSVG(g, p, null, null);
        return { wMm: Math.ceil(line.wMm + 6), hMm: Math.ceil(line.hMm + g.stripMm + 6), measure: true, factLike: false, maxCols: 1 };
    },
    inputs() {
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});
