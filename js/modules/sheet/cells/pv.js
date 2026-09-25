// js/modules/sheet/cells/pv.js
// The P9 place-value cell template `pv` (design/research/place-value-rounding.md §13), and the
// three drawings it and the screen card share: the disk mat, the numeral tracks and the rounding
// line.
//
// The owner's printout of 2026-09-24 had "Build 169 with disks" in three dashed, coloured zones of
// about 40 x 22 mm, each holding a rule and a "____ disks" blank: room for two rows of three 8 mm
// disks at best, so 1 + 6 + 9 disks could not be drawn. This module is the one geometry both the
// screen card and the printed sheet draw, so the two can never disagree about what fits.
//
// THE DISK. A circle, 0.75 pt outline, NO fill, its value printed inside in Andika 700 at the
// zone-label size. A disk is told from a counter by the value inside it and one place from
// another by the zone it sits in — never by colour (INK-1). Diameter 8 / 9 / 10 mm at S / M / L
// (it must hold "100" and be >= 8 mm, rubric H12); a "1,000" disk is 2 mm wider.
//
// THE ZONE (one per place). Nine disks in a 3 x 3 grid at a pitch of d + 2 mm, plus 2 mm of pad:
// S 32 x 32, M 35 x 35, L 38 x 38 mm (thousands 38 / 41 / 44). EVERY zone is sized to the hardest
// item — nine of a place — so the zone never tells the pupil how many to draw (RP-1, L-LEAK).
// Zones share their borders, 0.75 pt, square corners, SOLID (a dash means "cut", LS-3), with the
// place letter above each (VA-30). No blank, no caption, no rule inside a zone: the drawing is
// the answer. An empty zone stays empty (RP-32).
//
// Pure module (SCC-01): no window, no state, no DOM, no Math.random. Units are millimetres; a
// screen caller passes `pxPerMm` and gets the same drawing scaled.

import { esc, blank } from '../cell.js';
import { register } from '../registry.js';

export const DISK_SIZES = {
    S: { d: 8, head: 4, pt: 9 },
    M: { d: 9, head: 5, pt: 10 },
    L: { d: 10, head: 6, pt: 12 },
};

const PT_MM = 25.4 / 72;
const HAIR_PT = 0.75;
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M' };

/** The disk diameter for a place at a size: thousands and up are 2 mm wider ("1,000"). */
export function diskDiameter(place, size = 'L') {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    return place >= 1000 ? g.d + 2 : g.d;
}

/** The side of one square zone: 3 x (d + 2) + 2 mm (§13.4). */
export function zoneSide(place, size = 'L') {
    return 3 * (diskDiameter(place, size) + 2) + 2;
}

/** How many disks one zone holds at its pitch — nine, by construction; checked by the audit. */
export function zoneCapacity(place, size = 'L') {
    const d = diskDiameter(place, size);
    const inner = zoneSide(place, size) - 2;
    return Math.floor(inner / (d + 2)) ** 2;
}

const fmt = (v) => Number(v).toLocaleString('en-US');

/** The label point size that fits a disk: zone-label size, shrunk for "1,000", never below 8 pt (TY-11). */
function labelPt(place, size) {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    const d = diskDiameter(place, size);
    const chars = fmt(place).length;
    const fit = (d - 1.6) / (Math.max(1, chars) * 0.56 * PT_MM);
    return Math.max(8, Math.min(g.pt, fit));
}

/** One disk, centred at (cx, cy) mm. `data-pv-disk` names its place for the audit's recount. */
function disk(cx, cy, place, size, strokePt = HAIR_PT) {
    const d = diskDiameter(place, size);
    const pt = labelPt(place, size);
    return `<circle data-pv-disk="${place}" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(d / 2).toFixed(2)}" `
        + `fill="none" stroke="#000" stroke-width="${(strokePt * PT_MM).toFixed(3)}"/>`
        + `<text x="${cx.toFixed(2)}" y="${(cy + pt * PT_MM * 0.36).toFixed(2)}" text-anchor="middle" `
        + `font-size="${(pt * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${fmt(place)}</text>`;
}

/**
 * The mat. `counts` null draws an EMPTY mat (a build item); otherwise each zone holds its place's
 * count of disks in the 3 x 3 reading order (left to right, top to bottom).
 *
 * @param {{places: number[], counts?: Object<number, number>|null, size?: 'S'|'M'|'L', pxPerMm?: number}} o
 * @returns {{svg: string, widthMm: number, heightMm: number}}
 */
export function diskMatSVG({ places, counts = null, size = 'L', pxPerMm = 0, diskPt = HAIR_PT } = {}) {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    const cols = (places || []).slice().sort((a, b) => b - a);
    const sides = cols.map(p => zoneSide(p, size));
    const zoneH = Math.max(...sides);
    const widthMm = sides.reduce((a, b) => a + b, 0);
    const heightMm = g.head + zoneH;
    const sw = (HAIR_PT * PT_MM).toFixed(3);
    let body = '';
    let x = 0;
    cols.forEach((p, i) => {
        const w = sides[i];
        // The place letter over its zone, bold, at the zone-label size.
        body += `<text x="${(x + w / 2).toFixed(2)}" y="${(g.head * 0.78).toFixed(2)}" text-anchor="middle" `
            + `font-size="${(g.pt * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${LETTER[p] || fmt(p)}</text>`;
        body += `<rect x="${x.toFixed(2)}" y="${g.head.toFixed(2)}" width="${w.toFixed(2)}" height="${zoneH.toFixed(2)}" `
            + `fill="none" stroke="#000" stroke-width="${sw}" data-pv-zone="${p}"/>`;
        const c = counts ? Math.max(0, Math.min(9, Math.floor(Number(counts[p]) || 0))) : 0;
        const pitch = diskDiameter(p, size) + 2;
        for (let k = 0; k < c; k++) {
            const cx = x + 1 + pitch * (k % 3) + pitch / 2;
            const cy = g.head + 1 + pitch * Math.floor(k / 3) + pitch / 2;
            body += disk(cx, cy, p, size, diskPt);
        }
        x += w;
    });
    // Half a millimetre of margin all round, so the outline's stroke (centred on the zone's edge)
    // is never clipped by the drawing's own box.
    const M = 0.5;
    const vw = widthMm + 2 * M, vh = heightMm + 2 * M;
    const dims = pxPerMm > 0
        ? `width="${Math.round(vw * pxPerMm)}" height="${Math.round(vh * pxPerMm)}"`
        : `width="${vw.toFixed(2)}mm" height="${vh.toFixed(2)}mm"`;
    const svg = `<svg class="pv-disk-mat" xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${vw.toFixed(2)} ${vh.toFixed(2)}" ${dims} `
        + `role="img" aria-label="Place-value mat" `
        + `style="display:block;margin:0 auto;max-width:none;font-family:'Andika',sans-serif;">${body}</svg>`;
    return { svg, widthMm, heightMm };
}

/* ------------------------------------------------------------------ numeral tracks (VA-30) */

/**
 * A numeral in 0.95 em tracks under a heads row of bold place letters (§13.1, §13.6), with the
 * comma on its own narrow track at the thousands boundary. Sizes are in em, so the screen card
 * and the printed cell scale it from their own working size.
 *
 *   underline  the place whose digit is underlined (P-26: underline = the part to work)
 *   cut        the place AFTER which the 1.5 pt cut line runs (the rounding strip, RP-41);
 *              that place's letter is bold and the others are regular
 *   arrow      true adds "→" after the numeral (the strip's answer follows it)
 *
 * Ink only: black on white, no fill, no colour (INK-1).
 * @param {number} n  a whole number >= 0
 */
export function numeralTracksHTML(n, { underline = 0, cut = 0, arrow = false, size = '1.9em' } = {}) {
    const s = String(Math.floor(Math.abs(Number(n) || 0)));
    const cols = [];
    for (let i = 0; i < s.length; i++) {
        const place = 10 ** (s.length - 1 - i);
        cols.push({ place, digit: s[i] });
        // The comma track sits after the thousands, millions ... digit.
        if (place >= 1000 && Math.round(Math.log10(place)) % 3 === 0) cols.push({ comma: true });
    }
    const cutPt = 1.5;
    const cutAt = (c) => cut && c.place === cut;
    const td = (inner, style = '') => `<td style="padding:0;text-align:center;${style}">${inner}</td>`;
    const heads = cols.map(c => c.comma ? td('', 'width:0.3em;')
        : td(LETTER[c.place] || '', `width:2.2em;font-size:0.42em;line-height:1.6;font-weight:${cutAt(c) ? 700 : 400};`
            + (cutAt(c) ? `border-right:${cutPt}pt solid #000;` : ''))).join('');
    const digits = cols.map(c => c.comma ? td(',', 'width:0.3em;')
        : td(c.place === underline
            ? `<span style="display:inline-block;line-height:1;border-bottom:0.08em solid #000;padding:0 0.04em 0.04em;">${c.digit}</span>` : c.digit,
            'width:0.95em;line-height:1.15;' + (cutAt(c) ? `border-right:${cutPt}pt solid #000;` : ''))).join('');
    const table = `<table class="pv-tracks" style="border-collapse:collapse;display:inline-table;vertical-align:bottom;`
        + `color:#000;font-weight:700;">`
        + `<tr>${heads}</tr><tr>${digits}</tr></table>`;
    return `<span class="pv-numeral" style="display:inline-block;font-size:${size};white-space:nowrap;color:#000;">${table}`
        + `${arrow ? '<span style="font-size:0.7em;margin:0 0.3em;">→</span>' : ''}</span>`;
}

/* ------------------------------------------------------------------ the rounding line (RL-13) */

/**
 * The rounding line (§13.7): a 1.5 pt axis, 11 tall ticks, ONLY the two end values labelled below
 * it, and the number to round printed above at the left. No midpoint label and no plotted dot:
 * the midpoint is a hint (H2) and the dot is the pupil's to draw (RN-4), so neither is printed
 * here — printing them is what made "which end is it closer to?" readable off today's picture.
 *
 * @param {{lo: number, hi: number, n: number, lengthMm?: number, pxPerMm?: number, labelPt?: number}} o
 */
export function roundingLineSVG({ lo, hi, n, lengthMm = 140, pxPerMm = 0, labelPt = 12 } = {}) {
    const pad = 9;
    const w = lengthMm + pad * 2;
    const numPt = labelPt * 1.6;
    const top = numPt * PT_MM + 3;
    const axisY = top + 8;
    const h = axisY + 5 + labelPt * PT_MM + 2;
    let body = `<text x="${pad.toFixed(2)}" y="${(numPt * PT_MM).toFixed(2)}" font-size="${(numPt * PT_MM).toFixed(3)}" `
        + `font-weight="700" fill="#000">${fmt(n)}</text>`;
    body += `<line x1="${pad}" y1="${axisY.toFixed(2)}" x2="${(pad + lengthMm).toFixed(2)}" y2="${axisY.toFixed(2)}" `
        + `stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
    for (let i = 0; i <= 10; i++) {
        const x = pad + (lengthMm * i) / 10;
        body += `<line x1="${x.toFixed(2)}" y1="${(axisY - 3).toFixed(2)}" x2="${x.toFixed(2)}" y2="${(axisY + 3).toFixed(2)}" `
            + `stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}"/>`;
    }
    const ly = axisY + 5 + labelPt * PT_MM * 0.8;
    for (const [x, v] of [[pad, lo], [pad + lengthMm, hi]]) {
        body += `<text data-pv-end="${v}" x="${x.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" `
            + `font-size="${(labelPt * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${fmt(v)}</text>`;
    }
    const dims = pxPerMm > 0 ? `width="${Math.round(w * pxPerMm)}" height="${Math.round(h * pxPerMm)}"`
        : `width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm"`;
    return `<svg class="pv-round-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" ${dims} `
        + `role="img" aria-label="Number line" style="display:block;margin:0 auto;max-width:100%;font-family:'Andika',sans-serif;">${body}</svg>`;
}

/* =========================================================================== the `pv` template */

// One template for the family's cells, switched on `payload.kind` (the payload is plain data,
// SCC-Q3). It draws ONE item: no border, no label, no skill name (SCC-T5). A cell whose item is
// only readable with its own words (the number a "circle every number" set rounds to, the zone a
// "count one place" item asks about) carries them in its payload; the rest is the instruction's.
//
// The answer key is a facsimile (AK-1): state `answered` draws the SAME cell with the answer in
// the pupil's slot — the ring on the right word, the value on the line, every box of an expanded
// form filled (zeros included), the disks drawn in their zones, each number written in its column.

const pt = (v) => `${Number(v).toFixed(1)}pt`;
const answered = (ctx) => ctx.state === 'answered' || ctx.state === 'traced';
const RING = 'border:1.5pt solid #000;border-radius:999px;';
const PLACE_WORD_KIT = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands' };

function textLine(ctx, html) {
    return html ? `<div class="pv-prompt" style="font-size:${pt(ctx.metrics.textPt)};margin:0 0 2mm;">${html}</div>` : '';
}

/** A frame line with the slot where the text has "____". */
function frameHTML(ctx, text, key, digits) {
    const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: true, order: 0,
        scopes: ['full', 'answer-only'] }, ctx, key);
    // A frame is words and numbers on one line (RM-27): numbers and signs at the working digit
    // size, words at the cell-text size, all bottom-aligned in the kit's equation row (`.ws-eq`)
    // so the writing line sits on the digits' baseline.
    const piece = (seg) => String(seg).trim().split(/\s+/).filter(Boolean).map(tok => (/^\d[\d,.]*$|^[+\u2212\u00d7\u00f7=\u2192-]$/.test(tok)
        ? `<span class="${/^\d/.test(tok) ? '' : 'o'}">${esc(tok)}</span>`
        : `<span style="font-size:${pt(ctx.metrics.textPt + 3)};font-weight:400;padding-bottom:0.12em;">${esc(tok)}</span>`)).join('');
    const parts = String(text || '____').split('____');
    const body = parts.length > 1 ? parts.map(piece).join(slot) : `${piece(text)}${slot}`;
    return `<div class="ws-eq pv-frame" style="font-weight:700;">${body}</div>`;
}

/** Words or numbers printed for the pupil to ring; the key rings the right ones. */
function ringRow(ctx, items, correct, sizePt) {
    const on = answered(ctx) ? new Set((correct || []).map(String)) : new Set();
    const cells = items.map(w => `<span class="pv-choice" data-ws-slot="choice" data-ws-shape="ring" style="display:inline-block;`
        + `padding:0.8mm 2.2mm;margin:1mm 2mm;${on.has(String(w)) ? RING : 'border:1.5pt solid transparent;'}">${esc(w)}</span>`).join('');
    return `<div class="pv-ring-row" style="font-size:${pt(sizePt || ctx.metrics.digitPt * 0.75)};font-weight:700;text-align:center;`
        + `line-height:1.6;">${cells}</div>`;
}

function expandHTML(p, ctx) {
    const parts = p.parts || [];
    const digits = String(p.n).length;
    const boxes = parts.map((v, i) => blank({ id: `part${i}`, kind: 'number', shape: 'box', digits, graded: true, order: i,
        scopes: ['full', 'answer-only'] }, ctx, fmt(v)));
    // The kit's equation row: boxes bottom-aligned with the digits, `+` and `=` in 1 em slots (TY-25).
    return `<div class="ws-eq pv-expand" style="font-weight:700;">`
        + `<span>${esc(fmt(p.n))}</span><span class="o">=</span>`
        + boxes.join('<span class="o">+</span>') + `</div>`;
}

function sortHTML(p, ctx) {
    const z = ctx.metrics.digitPt * 0.75;
    const bank = (p.bank || []).map(v => `<span style="display:inline-block;min-width:14mm;margin:0 2mm;">${esc(v)}</span>`).join('');
    const rows = Math.max(3, Number(p.rows) || 4);
    const bins = p.bins || [];
    const filled = answered(ctx) ? (p.sorted || []) : [];
    const hw = (ctx.metrics.writeMm || 8) + 4;
    const cols = bins.map((b, i) => {
        const list = filled[i] || [];
        // One row per number the column really takes, plus a spare row that is scratch space
        // (SCC-T17: not graded), so a pupil who sorts one number wrongly still has a line to
        // write it on — and the key still fills every graded row.
        const takes = ((p.sorted || [])[i] || []).length || rows;
        const cellsHtml = Array.from({ length: rows }, (_, r) => `<div data-ws-slot="bin${i}-${r}" data-ws-shape="line"${r >= takes ? ' data-ws-graded="0"' : ''} `
            + `style="height:${hw}mm;border-bottom:0.75pt solid #000;display:flex;align-items:flex-end;justify-content:center;">`
            + `${list[r] !== undefined ? esc(list[r]) : ''}</div>`).join('');
        return `<div style="flex:1;${i ? 'border-left:0.75pt solid #000;' : ''}padding:0 3mm;">`
            + `<div style="font-size:${pt(ctx.metrics.zonePt)};font-weight:700;text-align:center;border-bottom:0.75pt solid #000;padding:1mm 0;">${esc(b)}</div>`
            + `${cellsHtml}</div>`;
    }).join('');
    return `<div class="pv-sort">`
        + `<div class="pv-bank" style="border:1.5pt solid #000;border-radius:3mm;padding:2mm;text-align:center;`
        + `font-size:${pt(z)};font-weight:700;margin-bottom:3mm;">${bank}</div>`
        + `<div style="display:flex;border:0.75pt solid #000;font-size:${pt(z)};font-weight:700;">${cols}</div></div>`;
}

register('pv', {
    render(p, ctx) {
        const m = ctx.metrics;
        const numeral = (opt) => numeralTracksHTML(p.n, { ...opt, size: pt(m.digitPt) });
        const center = (h) => `<div style="text-align:center;margin:1mm 0 2mm;">${h}</div>`;
        const kv = p.keyValue;
        const digits = Math.max(2, String(kv === undefined ? '' : kv).replace(/[^0-9]/g, '').length);
        switch (p.kind) {
            case 'place':
                return `<div class="pv-cell">${center(numeral({ underline: p.place }))}${ringRow(ctx, p.words || [], [kv], ctx.metrics.textPt + 2)}</div>`;
            case 'value':
                return `<div class="pv-cell">${center(numeral({ underline: p.place }))}${frameHTML(ctx, p.frame, kv, digits)}</div>`;
            case 'expand':
                return `<div class="pv-cell">${expandHTML(p, ctx)}</div>`;
            case 'frame':
                return `<div class="pv-cell">${p.showNumeral ? center(numeral({})) : ''}${frameHTML(ctx, p.frame, kv, digits)}</div>`;
            case 'round': {
                const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: true, order: 0,
                    scopes: ['full', 'answer-only'] }, ctx, kv);
                const big = (h) => `<span style="font-size:${pt(m.digitPt)};font-weight:700;">${h}</span>`;
                if (p.support === 'line') {
                    const len = { S: 120, M: 140, L: 150 }[ctx.size] || 140;
                    return `<div class="pv-cell">${center(roundingLineSVG({ lo: p.lo, hi: p.hi, n: p.n, lengthMm: len, labelPt: m.zonePt }))}`
                        + `${frameHTML(ctx, `Round to the nearest ${fmt(p.place)}: ____`, kv, digits)}</div>`;
                }
                const pic = p.support === 'none' ? big(`${esc(fmt(p.n))} →`) : numeral({ cut: p.place, arrow: true });
                return `<div class="pv-cell" style="text-align:center;white-space:nowrap;">${pic}${big(slot)}</div>`;
            }
            case 'circle':
                return `<div class="pv-cell">${textLine(ctx, `Rounds to <b>${esc(fmt(p.target))}</b>:`)}${ringRow(ctx, p.tiles || [], p.correct || [])}</div>`;
            case 'disks': {
                const mat = diskMatSVG({ places: p.places, counts: p.counts, size: ctx.size }).svg;
                const q = p.task === 'count' ? `${PLACE_WORD_KIT[p.place] || ''} disks: ____` : '____';
                return `<div class="pv-cell">${center(mat)}${frameHTML(ctx, q, kv, digits)}</div>`;
            }
            case 'build': {
                const mat = diskMatSVG({ places: p.places, counts: answered(ctx) ? p.counts : null, size: ctx.size, diskPt: 1.5 }).svg;
                return `<div class="pv-cell">${center(`<span style="font-size:${pt(m.digitPt)};font-weight:700;">${esc(fmt(p.n))}</span>`)}`
                    + `<div data-ws-slot="answer" data-ws-shape="draw">${mat}</div></div>`;
            }
            case 'sort':
                return `<div class="pv-cell">${sortHTML(p, ctx)}</div>`;
            case 'notice':
                // A refused skill (Max Number cannot host its place, §2.1): the reason, no slot.
                return `<div class="pv-cell pv-notice" data-ws-refused="1">${textLine(ctx, esc(p.frame || ''))}</div>`;
            default:
                return `<div class="pv-cell">${esc(p.frame || '')}</div>`;
        }
    },
    answerKey(p) {
        const value = p.keyValue !== undefined ? p.keyValue : '';
        const display = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
        const slots = { answer: { value: display, graded: true, accept: [String(value)] } };
        if (p.kind === 'expand') (p.parts || []).forEach((v, i) => { slots[`part${i}`] = { value: fmt(v), graded: true }; });
        return { value, display, slots };
    },
    footprint(p, ctx) {
        const nd = String(p.n === undefined ? '' : p.n).length;
        const wide = p.kind === 'sort' || (p.kind === 'round' && p.support === 'line')
            || ((p.kind === 'disks' || p.kind === 'build') && (p.places || []).length >= 3)
            || (p.kind === 'expand' && (nd >= 4 || (nd === 3 && ctx.size === 'L')));
        return { wMm: wide ? 186 : 93, hMm: null, measure: true, factLike: false, maxCols: wide ? 1 : 2 };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'line', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout(p) {
        const wide = p && (p.kind === 'sort' || p.kind === 'disks' || p.kind === 'build' || p.support === 'line');
        return { card: wide ? 'card-wide-visual' : 'card-simple', checker: 'value' };
    },
});
