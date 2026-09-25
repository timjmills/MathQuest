// pv-support-cell.js — the SUPPORT drawings of the P9 place-value options, and the `pv-support`
// cell template that prints them (owner, 2026-09-25: "The options should let a teacher go easier or
// harder and give more or less support").
//
// The `pv` template (sheet/cells/pv.js) draws each P9 item with ONE fixed scaffold: place letters
// over the digits. The support options add the other rungs of the ladder:
//
//   identify / value     `support`  chart (place names in a ruled chart) · labels (pv) · none
//   more_less_10 / _100  `support`  chart (the hundreds-chart rows around the number) · line · none
//   round_sort_*         `support`  line (a number line from one bin to the other) · none
//
// This module draws those pictures ONCE, in millimetres, so the screen card (q.visual, scaled with
// `pxPerMm`) and the printed cell (this template) show the same drawing. The template draws its
// picture and hands everything else — the ring row, the frame line and its slot, the sort bins, the
// answer key, the slots — to the `pv` template, so a support value changes the picture and nothing
// the pupil writes.
//
// Pure module (SCC-01): no window, no state, no DOM, no Math.random. Ink only (INK-1): black lines
// on white, no fill, no colour. Lines are solid (a dash means "cut", LS-3).

import { register, renderCell, cellAnswerKey, cellFootprint, cellInputs, esc } from './sheet/index.js';

const PT_MM = 25.4 / 72;
const HAIR_PT = 0.75;
const AXIS_PT = 1.5;
const fmt = (v) => Number(v).toLocaleString('en-US');
const PLACE_NAME = { 1: 'Ones', 10: 'Tens', 100: 'Hundreds', 1000: 'Thousands', 10000: 'Ten thousands',
    100000: 'Hundred thousands', 1000000: 'Millions' };

/* --------------------------------------------------------------------------- the numeral */

/**
 * A numeral with one digit underlined and NO place letters — the "None" rung, where the pupil reads
 * the place off the digit's position alone.
 */
export function plainNumeralHTML(n, { underline = 0, size = '1.9em' } = {}) {
    const s = String(Math.floor(Math.abs(Number(n) || 0)));
    let out = '';
    for (let i = 0; i < s.length; i++) {
        const place = 10 ** (s.length - 1 - i);
        const d = place === underline
            ? `<span style="display:inline-block;line-height:1;border-bottom:0.08em solid #000;padding:0 0.04em 0.04em;">${s[i]}</span>`
            : s[i];
        out += d;
        if (place >= 1000 && Math.round(Math.log10(place)) % 3 === 0) out += ',';
    }
    return `<span class="pv-plain" style="display:inline-block;font-size:${size};font-weight:700;color:#000;white-space:nowrap;">${out}</span>`;
}

/**
 * The place-value chart — the MOST support: a ruled table, the place NAME in words over each digit,
 * one digit per box. The asked digit is underlined, as on the other two rungs.
 */
export function placeChartHTML(n, { underline = 0, size = '1.9em' } = {}) {
    const s = String(Math.floor(Math.abs(Number(n) || 0)));
    const places = Array.from({ length: s.length }, (_, i) => 10 ** (s.length - 1 - i));
    const bd = `border:${HAIR_PT}pt solid #000;`;
    const heads = places.map(p => `<td style="${bd}padding:0.15em 0.3em;font-size:0.36em;font-weight:700;text-align:center;`
        + `line-height:1.2;white-space:normal;width:3.2em;">${PLACE_NAME[p] || fmt(p)}</td>`).join('');
    const digits = places.map((p, i) => `<td style="${bd}padding:0.05em 0.2em;text-align:center;line-height:1.15;">`
        + (p === underline
            ? `<span style="display:inline-block;line-height:1;border-bottom:0.08em solid #000;padding:0 0.04em 0.04em;">${s[i]}</span>`
            : s[i]) + '</td>').join('');
    return `<span class="pv-chart" style="display:inline-block;font-size:${size};font-weight:700;color:#000;">`
        + `<table style="border-collapse:collapse;display:inline-table;color:#000;"><tr>${heads}</tr><tr>${digits}</tr></table></span>`;
}

/* --------------------------------------------------------------------------- the hundreds chart */

/**
 * The rows of a hundreds chart (1-10, 11-20, ...) from `firstRow` to `lastRow`, every number
 * printed. It is the whole chart the pupil would use in class, cut down to the rows that matter,
 * so it gives no answer away: the pupil still finds the number and moves along or down.
 */
export function hundredsRowsHTML(firstRow, lastRow, { size = '1em' } = {}) {
    const bd = `border:${HAIR_PT}pt solid #000;`;
    let rows = '';
    for (let r = firstRow; r <= lastRow; r++) {
        let cells = '';
        for (let c = 1; c <= 10; c++) {
            cells += `<td style="${bd}width:2.1em;height:1.6em;text-align:center;padding:0;">${r * 10 + c}</td>`;
        }
        rows += `<tr>${cells}</tr>`;
    }
    return `<span class="pv-hchart" style="display:inline-block;font-size:${size};font-weight:700;color:#000;">`
        + `<table style="border-collapse:collapse;display:inline-table;color:#000;">${rows}</table></span>`;
}

/** The chart rows a more/less item needs: its number's row and the answer's, with a row either side. */
export function hundredsWindow(n, ans, cap) {
    const rowOf = (v) => Math.floor((v - 1) / 10);
    const maxRow = Math.max(0, Math.ceil(cap / 10) - 1);
    const lo = Math.max(0, Math.min(rowOf(n), rowOf(ans)) - 1);
    const hi = Math.min(maxRow, Math.max(rowOf(n), rowOf(ans)) + 1);
    return [lo, hi];
}

/* --------------------------------------------------------------------------- the number line */

/**
 * A plain number line: a 1.5 pt axis, `ticks` evenly spaced ticks from `lo` to `hi`, and a label
 * under only the ticks listed in `labels` (index -> text). The answer is never labelled: the pupil
 * finds it by jumping along the ticks.
 */
export function pvLineSVG({ ticks = 11, labels = {}, lengthMm = 130, labelPt = 12, pxPerMm = 0 } = {}) {
    const pad = 9;
    const w = lengthMm + pad * 2;
    const axisY = 6;
    const h = axisY + 5 + labelPt * PT_MM + 2;
    let body = `<line x1="${pad}" y1="${axisY}" x2="${(pad + lengthMm).toFixed(2)}" y2="${axisY}" `
        + `stroke="#000" stroke-width="${(AXIS_PT * PT_MM).toFixed(3)}"/>`;
    const ly = axisY + 5 + labelPt * PT_MM * 0.8;
    for (let i = 0; i < ticks; i++) {
        const x = pad + (lengthMm * i) / (ticks - 1);
        body += `<line x1="${x.toFixed(2)}" y1="${axisY - 3}" x2="${x.toFixed(2)}" y2="${axisY + 3}" `
            + `stroke="#000" stroke-width="${(HAIR_PT * PT_MM).toFixed(3)}"/>`;
        if (labels[i] !== undefined) {
            body += `<text x="${x.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" font-size="${(labelPt * PT_MM).toFixed(3)}" `
                + `font-weight="700" fill="#000">${esc(String(labels[i]))}</text>`;
        }
    }
    const dims = pxPerMm > 0 ? `width="${Math.round(w * pxPerMm)}" height="${Math.round(h * pxPerMm)}"`
        : `width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm"`;
    return `<svg class="pv-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" ${dims} `
        + `role="img" aria-label="Number line" style="display:block;margin:0 auto;max-width:100%;font-family:'Andika',sans-serif;">${body}</svg>`;
}

/**
 * The more/less number line: seven ticks a step apart with the given number in the middle (or as
 * near it as zero allows), and ONLY the given number labelled.
 */
export function moreLessLine(n, step) {
    const startK = Math.min(3, Math.floor(n / step));
    const lo = n - startK * step;
    return { ticks: 7, labels: { [startK]: fmt(n) }, lo };
}

/* =========================================================================== the template */

const pt = (v) => `${Number(v).toFixed(1)}pt`;
const answered = (ctx) => ctx.state === 'answered' || ctx.state === 'traced';
const RING = 'border:1.5pt solid #000;border-radius:999px;';

/** The place words to ring, the right one ringed on the key (the same row `pv` draws). */
function ringRow(ctx, items, correct) {
    const on = answered(ctx) ? new Set([String(correct)]) : new Set();
    const cells = items.map(w => `<span class="pv-choice" data-ws-slot="choice" data-ws-shape="ring" style="display:inline-block;`
        + `padding:0.8mm 2.2mm;margin:1mm 2mm;${on.has(String(w)) ? RING : 'border:1.5pt solid transparent;'}">${esc(w)}</span>`).join('');
    return `<div class="pv-ring-row" style="font-size:${pt(ctx.metrics.textPt + 2)};font-weight:700;text-align:center;line-height:1.6;">${cells}</div>`;
}

/** The support picture a payload asks for, at the cell's own working size. */
function picture(p, ctx) {
    const m = ctx.metrics;
    const center = (h) => `<div style="text-align:center;margin:1mm 0 2mm;">${h}</div>`;
    if (p.picture === 'chart') return center(placeChartHTML(p.n, { underline: p.place, size: pt(m.digitPt) }));
    if (p.picture === 'plain') return center(plainNumeralHTML(p.n, { underline: p.place, size: pt(m.digitPt) }));
    if (p.picture === 'hchart') return center(hundredsRowsHTML(p.rows[0], p.rows[1], { size: pt(m.zonePt) }));
    if (p.picture === 'line') {
        const len = { S: 120, M: 140, L: 150 }[ctx.size] || 140;
        return center(pvLineSVG({ ticks: p.ticks, labels: p.labels || {}, lengthMm: len, labelPt: m.zonePt }));
    }
    return '';
}

const baseOf = (p) => ({ template: 'pv', v: 1, payload: p.base || {} });

register('pv-support', {
    render(p, ctx) {
        const pic = picture(p, ctx);
        // identify: the ring row of place words under the picture (the `pv` place row, re-drawn
        // because `pv` only draws it under its own lettered numeral).
        if (p.picture === 'chart' || p.picture === 'plain') {
            if (p.base && p.base.kind === 'place') {
                return `<div class="pv-cell">${pic}${ringRow(ctx, p.base.words || [], p.base.keyValue)}</div>`;
            }
            // value: the frame line and its slot, from `pv` itself.
            const frame = renderCell({ template: 'pv', v: 1, payload: { ...p.base, kind: 'frame', showNumeral: false } }, ctx);
            return `<div class="pv-cell">${pic}${frame}</div>`;
        }
        // more / less and the sort: the picture above the `pv` cell, unchanged.
        return `<div class="pv-cell">${pic}${renderCell(baseOf(p), ctx)}</div>`;
    },
    answerKey(p) {
        return cellAnswerKey(baseOf(p));
    },
    footprint(p, ctx) {
        const f = cellFootprint(baseOf(p), ctx) || {};
        const wide = p.picture === 'line' || p.picture === 'hchart' || f.maxCols === 1;
        return { ...f, wMm: wide ? 186 : (f.wMm || 93), maxCols: wide ? 1 : (f.maxCols || 2), measure: true };
    },
    inputs(p, ctx) {
        return cellInputs(baseOf(p), ctx);
    },
    layout(p) {
        const wide = p && (p.picture === 'line' || p.picture === 'hchart' || (p.base && p.base.kind === 'sort'));
        return { card: wide ? 'card-wide-visual' : 'card-simple', checker: 'value' };
    },
});
