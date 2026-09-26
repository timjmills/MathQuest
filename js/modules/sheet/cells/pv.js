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
import { SIZES } from '../tokens.js';

export const DISK_SIZES = {
    S: { d: 8, head: 4, pt: 9 },
    M: { d: 9, head: 5, pt: 10 },
    L: { d: 10, head: 6, pt: 12 },
};

const PT_MM = 25.4 / 72;
const HAIR_PT = 0.75;
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M',
    // vis_pv_decimal_places (build lane placevalue): the places below the ones
    0.1: 'Tth', 0.01: 'Hth', 0.001: 'Thth' };
export const PV_LETTER = LETTER;
/** The decimal places, largest first (vis_pv_decimal_places). */
export const DECIMAL_PLACES = Object.freeze([0.1, 0.01, 0.001]);
/** Two places are the same place (a decimal place is a float). */
export const samePlace = (a, b) => Number(a) === Number(b) || Math.abs(Number(a) - Number(b)) < 1e-12;

/**
 * The columns of a numeral, left to right: `{place, digit}` for each digit, `{comma}` after the
 * thousands (millions …) digit and `{point}` after the ones when the number has decimal places.
 * `n` is a number or a numeric string; a string keeps its trailing zeros ("3.40" has a hundredths
 * column), so a page of two-place decimals prints two places on every item.
 */
export function numberCols(n) {
    const raw = typeof n === 'string' ? n.replace(/,/g, '').replace(/^-/, '') : String(Math.abs(Number(n) || 0));
    const [ip0, fp = ''] = raw.split('.');
    const ip = String(Number(ip0) || 0);
    const cols = [];
    for (let i = 0; i < ip.length; i++) {
        const place = 10 ** (ip.length - 1 - i);
        cols.push({ place, digit: ip[i] });
        if (place >= 1000 && Math.round(Math.log10(place)) % 3 === 0) cols.push({ comma: true });
    }
    if (fp) {
        cols.push({ point: true });
        for (let j = 0; j < fp.length; j++) cols.push({ place: DECIMAL_PLACES[j] || 10 ** -(j + 1), digit: fp[j] });
    }
    return cols;
}

/** The disk diameter for a place at a size: thousands and up are 2 mm wider ("1,000"). */
export function diskDiameter(place, size = 'L', fraction = false) {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    // "1,000" and "0.001" need 2 mm more to keep their label at 8 pt or more (TY-11); so does a
    // fraction-named 1/100 (its "100" under the bar, R61).
    return place < 0.01 ? g.d + 3 : place >= 1000 || (fraction && place < 0.1) ? g.d + 2 : g.d;
}

/** The side of one square zone: 3 x (d + 2) + 2 mm (§13.4). */
export function zoneSide(place, size = 'L', fraction = false) {
    return 3 * (diskDiameter(place, size, fraction) + 2) + 2;
}

/** How many disks one zone holds at its pitch — nine, by construction; checked by the audit. */
export function zoneCapacity(place, size = 'L') {
    const d = diskDiameter(place, size);
    const inner = zoneSide(place, size) - 2;
    return Math.floor(inner / (d + 2)) ** 2;
}

const fmt = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });

/** The label point size that fits a disk: zone-label size, shrunk for "1,000", never below 8 pt (TY-11). */
function labelPt(place, size) {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    const d = diskDiameter(place, size);
    const chars = fmt(place).length;
    const fit = (d - 1.6) / (Math.max(1, chars) * 0.56 * PT_MM);
    return Math.max(8, Math.min(g.pt, fit));
}

/**
 * A PLAIN DOT counter (vis_pv_dot_disks): a solid 6 mm dot with no value inside - it takes its
 * value from the column it stands in (WRM's "counters on a place-value chart"). Solid fill within
 * INK-5's 7 mm.
 */
function dotCounter(cx, cy, place) {
    return `<circle data-pv-disk="${place}" data-pv-dot-counter="1" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="3" fill="#000"/>`;
}
/** One diagonal stroke across a counter, on a white halo so it reads over a solid dot: taken away. */
function crossOut(cx, cy, d) {
    const r = d / 2 + 0.6;
    const a = `x1="${(cx - r * 0.72).toFixed(2)}" y1="${(cy + r * 0.72).toFixed(2)}" x2="${(cx + r * 0.72).toFixed(2)}" y2="${(cy - r * 0.72).toFixed(2)}"`;
    return `<line data-pv-crossed="1" ${a} stroke="#fff" stroke-width="${(2.25 * 1.9 * PT_MM).toFixed(3)}" stroke-linecap="round"/>`
        + `<line ${a} stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}" stroke-linecap="round"/>`;
}

/** One disk, centred at (cx, cy) mm. `data-pv-disk` names its place for the audit's recount. */
function disk(cx, cy, place, size, strokePt = HAIR_PT, fraction = false, halo = false) {
    const d = diskDiameter(place, size, fraction);
    const pt = labelPt(place, size);
    const ring = `<circle data-pv-disk="${place}" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(d / 2).toFixed(2)}" `
        + `fill="none" stroke="#000" stroke-width="${(strokePt * PT_MM).toFixed(3)}"/>`;
    if (fraction && place < 1) {
        // R61: the counter named as a fraction - 1 over 10 / 100 / 1000, stacked, 8 pt, a hairline bar.
        const den = String(Math.round(1 / place));
        const fp = 8, h = fp * PT_MM;
        const bw = den.length * 0.56 * h + 0.6;
        return ring
            + `<text x="${cx.toFixed(2)}" y="${(cy - 0.5).toFixed(2)}" text-anchor="middle" font-size="${h.toFixed(3)}" font-weight="700" fill="#000">1</text>`
            + `<line x1="${(cx - bw / 2).toFixed(2)}" x2="${(cx + bw / 2).toFixed(2)}" y1="${(cy + 0.2).toFixed(2)}" y2="${(cy + 0.2).toFixed(2)}" stroke="#000" stroke-width="${(HAIR_PT * PT_MM).toFixed(3)}"/>`
            + `<text x="${cx.toFixed(2)}" y="${(cy + 0.9 + h * 0.72).toFixed(2)}" text-anchor="middle" font-size="${h.toFixed(3)}" font-weight="700" fill="#000">${den}</text>`;
    }
    // `halo`: the label again over a cross-out stroke, ringed in white, so the stroke never runs
    // through the value (critic pv-r1).
    const h = halo ? ` stroke="#fff" stroke-width="${(1.6 * PT_MM).toFixed(3)}" paint-order="stroke"` : '';
    return (halo ? '' : ring)
        + `<text x="${cx.toFixed(2)}" y="${(cy + pt * PT_MM * 0.36).toFixed(2)}" text-anchor="middle" `
        + `font-size="${(pt * PT_MM).toFixed(3)}" font-weight="700" fill="#000"${h}>${fmt(place)}</text>`;
}

/**
 * The mat as a cell draws it. On paper, and on a screen for up to three zones, it is the one
 * drawing. A SCREEN mat of four or more zones (O . Tth Hth Thth, Th H T O) is too wide for a
 * phone card at full disk size, so the screen gets two drawings and a width rule shows one: three
 * disks across per zone on a wide card, two across (five down) under 600 px (additive CSS).
 */
function screenMat(ctx, p, opts) {
    const wide = diskMatSVG(opts).svg;
    if (!((ctx && ctx.mode === 'screen') || p.onScreen) || (p.places || []).length < 4) return wide;
    // the narrow twin may shrink a little to the card's width (never the paper drawing)
    const narrow = diskMatSVG({ ...opts, across: 2 }).svg.replace('max-width:none;', 'max-width:100%;height:auto;');
    return `<style>.pv-mat-narrow{display:none}@media (max-width:600px){.pv-mat-wide{display:none}.pv-mat-narrow{display:block}}</style>`
        + `<div class="pv-mat-wide">${wide}</div><div class="pv-mat-narrow">${narrow}</div>`;
}

/**
 * The mat. `counts` null draws an EMPTY mat (a build item); otherwise each zone holds its place's
 * count of disks in the 3 x 3 reading order (left to right, top to bottom).
 *
 * @param {{places: number[], counts?: Object<number, number>|null, size?: 'S'|'M'|'L', pxPerMm?: number}} o
 * @returns {{svg: string, widthMm: number, heightMm: number}}
 */
export function diskMatSVG({ places, counts = null, size = 'L', pxPerMm = 0, diskPt = HAIR_PT, dots = false, crossed = null, arrows = null, fraction = false, across = 3 } = {}) {
    const g = DISK_SIZES[size] || DISK_SIZES.L;
    const cols = (places || []).slice().sort((a, b) => b - a);
    // `across` 2 (a phone screen, four or more zones): each zone is two disks wide and five tall,
    // so the mat keeps its disks at full size in a narrow card instead of shrinking them.
    const per = across === 2 ? 2 : 3;
    const sides = cols.map(p => (per === 3 ? zoneSide(p, size, fraction) : per * (diskDiameter(p, size, fraction) + 2) + 2));
    const zoneH = per === 3 ? Math.max(...sides) : Math.max(...cols.map((p) => Math.ceil(9 / per) * (diskDiameter(p, size, fraction) + 2) + 2));
    const widthMm = sides.reduce((a, b) => a + b, 0);
    // `arrows` 'left' (× 10) or 'right' (÷ 10): one arrow under each zone that holds counters, to
    // the next zone - every counter moves one place (vis_pv_dot_disks).
    const arrowH = arrows ? 8 : 0;
    const heightMm = g.head + zoneH + arrowH;
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
        const pitch = diskDiameter(p, size, fraction) + 2;
        // The LAST `crossed[p]` counters of a zone are crossed out (taken away).
        const xk = crossed ? Math.max(0, Math.min(c, Math.floor(Number(crossed[p]) || 0))) : 0;
        for (let k = 0; k < c; k++) {
            const cx = x + 1 + pitch * (k % per) + pitch / 2;
            const cy = g.head + 1 + pitch * Math.floor(k / per) + pitch / 2;
            body += dots ? dotCounter(cx, cy, p) : disk(cx, cy, p, size, diskPt, fraction);
            if (k >= c - xk) {
                body += crossOut(cx, cy, dots ? 6 : diskDiameter(p, size, fraction));
                if (!dots && !fraction) body += disk(cx, cy, p, size, diskPt, false, true);
            }
        }
        if (arrows && c > 0) {
            const i2 = arrows === 'left' ? i - 1 : i + 1;
            if (i2 >= 0 && i2 < cols.length) {
                const x2 = arrows === 'left' ? x - sides[i2] / 2 : x + w + sides[i2] / 2;
                const x1 = x + w / 2, y = g.head + zoneH + arrowH / 2 + 0.5;
                const dir = arrows === 'left' ? -1 : 1;
                body += `<line data-pv-move="${arrows}" x1="${x1.toFixed(2)}" y1="${y.toFixed(2)}" x2="${(x2 - dir * 2.6).toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`
                    + `<path d="M${x2.toFixed(2)} ${y.toFixed(2)}L${(x2 - dir * 2.8).toFixed(2)} ${(y - 1.5).toFixed(2)}L${(x2 - dir * 2.8).toFixed(2)} ${(y + 1.5).toFixed(2)}Z" fill="#000"/>`;
            }
        }
        // The decimal point stands ON the line between the ones and the tenths: a heavy dot at
        // the foot of that line (vis_pv_decimal_places).
        if (samePlace(p, 1) && cols[i + 1] !== undefined && samePlace(cols[i + 1], 0.1)) {
            body += `<circle data-pv-point="1" cx="${(x + w).toFixed(2)}" cy="${(g.head + zoneH - 2.2).toFixed(2)}" r="1.3" fill="#000"/>`;
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
export function numeralTracksHTML(n, { underline = 0, cut = 0, arrow = false, size = '1.9em', heads: showHeads = true } = {}) {
    // A whole number is its integer part (as before); a decimal (vis_pv_decimal_places) keeps its
    // places, the point on its own narrow track after the ones.
    const cols = typeof n === 'string' && n.includes('.') ? numberCols(n)
        : numberCols(Number.isInteger(Number(n)) ? Math.floor(Math.abs(Number(n) || 0)) : Number(n));
    const cutPt = 1.5;
    // The cut line stands after the cut place's digit - and after its comma when one follows
    // ("7,|712", never "7|,712", critic pv-r1).
    const cutIdx = cut ? cols.findIndex((c) => !c.comma && !c.point && samePlace(c.place, cut)) : -1;
    const barIdx = cutIdx >= 0 && cols[cutIdx + 1] && cols[cutIdx + 1].comma ? cutIdx + 1 : cutIdx;
    const cutAt = (c) => cutIdx >= 0 && cols.indexOf(c) === cutIdx;
    const barAt = (c) => barIdx >= 0 && cols.indexOf(c) === barIdx;
    const td = (inner, style = '') => `<td style="padding:0;text-align:center;${style}">${inner}</td>`;
    const bar = `border-right:${cutPt}pt solid #000;`;
    const heads = cols.map(c => c.comma || c.point ? td('', 'width:0.3em;' + (barAt(c) ? bar : ''))
        : td(LETTER[c.place] || '', `width:2.2em;font-size:max(0.42em, 8pt);line-height:1.6;font-weight:${cutAt(c) ? 700 : 400};`
            + (barAt(c) ? bar : ''))).join('');
    const digits = cols.map(c => c.comma ? td(',', 'width:0.3em;' + (barAt(c) ? bar : '')) : c.point ? td('.', 'width:0.3em;')
        : td(underline && samePlace(c.place, underline)
            ? `<span style="display:inline-block;line-height:1;border-bottom:0.08em solid #000;padding:0 0.04em 0.04em;">${c.digit}</span>` : c.digit,
            'width:0.95em;line-height:1.15;' + (barAt(c) ? bar : ''))).join('');
    const table = `<table class="pv-tracks" style="border-collapse:collapse;display:inline-table;vertical-align:bottom;`
        + `color:#000;font-weight:700;">`
        + `${showHeads ? `<tr>${heads}</tr>` : ''}<tr>${digits}</tr></table>`;
    return `<span class="pv-numeral" style="display:inline-block;font-size:${size};white-space:nowrap;color:#000;">${table}`
        + `${arrow ? '<span style="font-size:0.7em;margin:0 0.3em;">→</span>' : ''}</span>`;
}

/* ------------------------------------------------------------------ the rounding line (RL-13) */

/**
 * The rounding line (§13.7): a 1.5 pt axis, 11 tall ticks, ONLY the two end values labelled below
 * it, and the number to round printed above at the left. No midpoint label and no plotted dot by
 * default: the midpoint is a hint (H2, `mid`) and the dot is the pupil's to draw (RN-4) — `dot`
 * plots it only where the step gives it (RN-3, H3), and the answer key draws it with `keyDot`.
 * Printing them unasked is what made "which end is it closer to?" readable off the old picture.
 *
 * @param {{lo: number, hi: number, n: number, lengthMm?: number, pxPerMm?: number, labelPt?: number,
 *          dot?: boolean, keyDot?: boolean, mid?: boolean, showNumber?: boolean}} o
 */
export function roundingLineSVG({ lo, hi, n, lengthMm = 140, pxPerMm = 0, labelPt = 12, dot = false, keyDot = false, mid = false, showNumber = true, tapDot = false } = {}) {
    // The side margin holds half an end label: "600,000" at 12 pt is ~16 mm wide, and a fixed
    // 9 mm margin cut its first digits off (round-on-a-number-line skills, 2026-09-25).
    const labelMm = Math.max(fmt(lo).length, fmt(hi).length) * 0.56 * Math.max(12, labelPt) * PT_MM;
    const pad = Math.max(9, labelMm / 2 + 1);
    const w = lengthMm + pad * 2;
    const numPt = labelPt * 1.6;
    const top = showNumber ? numPt * PT_MM + 3 : 3;
    const axisY = top + 8;
    const h = axisY + 6 + Math.max(12, labelPt) * PT_MM + 2;
    let body = showNumber ? `<text x="${pad.toFixed(2)}" y="${(numPt * PT_MM).toFixed(2)}" font-size="${(numPt * PT_MM).toFixed(3)}" `
        + `font-weight="700" fill="#000">${fmt(n)}</text>` : '';
    body += `<line x1="${pad}" y1="${axisY.toFixed(2)}" x2="${(pad + lengthMm).toFixed(2)}" y2="${axisY.toFixed(2)}" `
        + `stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
    // The halfway tick is MARKED (round-3): taller and heavier than the others, unlabelled — it
    // shows where "halfway rounds up" happens without printing the halfway number (that stays the
    // `mid` hint).
    for (let i = 0; i <= 10; i++) {
        const x = pad + (lengthMm * i) / 10;
        const half = i === 5;
        body += `<line${half ? ' data-pv-halfway="1"' : ''} x1="${x.toFixed(2)}" y1="${(axisY - (half ? 5 : 3)).toFixed(2)}" x2="${x.toFixed(2)}" y2="${(axisY + (half ? 5 : 3)).toFixed(2)}" `
            + `stroke="#000" stroke-width="${((half ? 1.5 : 0.75) * PT_MM).toFixed(3)}"/>`;
    }
    // End labels at no less than 12 pt (the type minimum for a number the pupil reads).
    const endPt = Math.max(12, labelPt);
    const ly = axisY + 6 + endPt * PT_MM * 0.8;
    const ends = [[pad, lo], [pad + lengthMm, hi]];
    for (const [x, v] of ends) {
        body += `<text data-pv-end="${v}" x="${x.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" `
            + `font-size="${(endPt * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${fmt(v)}</text>`;
    }
    if (mid) {
        // The halfway label is read, so it keeps the type minimum and the labels' weight; it sits
        // under the marked (taller) halfway tick.
        body += `<text data-pv-mid="${(lo + hi) / 2}" x="${(pad + lengthMm / 2).toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" `
            + `font-size="${(endPt * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${fmt((lo + hi) / 2)}</text>`;
    }
    if ((dot || keyDot) && hi > lo) {
        const x = pad + (lengthMm * (n - lo)) / (hi - lo);
        body += `<circle data-pv-dot="${n}" cx="${x.toFixed(2)}" cy="${axisY.toFixed(2)}" r="1.5" fill="#000"/>`;
    }
    // The screen's tap-to-place dot (screen-cell.js): hidden until the pupil taps the line.
    // (data-ws-feedback: its colour is the live-green feedback, so the screen's ink pass leaves it.)
    if (tapDot) body += `<circle class="mq-rl-dot" data-ws-feedback="dot" cx="-20" cy="${axisY.toFixed(2)}" r="2" fill="#000" visibility="hidden"/>`;
    const geo = tapDot ? ` data-rl-w="${w.toFixed(3)}" data-rl-h="${h.toFixed(3)}" data-rl-pad="${pad.toFixed(3)}" data-rl-len="${lengthMm}" data-rl-axis="${axisY.toFixed(3)}"` : '';
    const dims = pxPerMm > 0 ? `width="${Math.round(w * pxPerMm)}" height="${Math.round(h * pxPerMm)}"`
        : `width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm"`;
    return `<svg class="pv-round-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" ${dims}${geo} `
        + `role="img" aria-label="Number line" style="display:block;margin:0 auto;max-width:100%;font-family:'Andika',sans-serif;">${body}</svg>`;
}

/* ------------------------------------------------------------------ the scale line (nl_20) */

/**
 * A number line of equal steps (number_sense:number_line_scales, BUILD_LIST nl_20): 10 or 20
 * intervals from `lo` to `hi`, a tick at every step, SOME ticks labelled (`labels`: 'step' every
 * tick but the asked ones, 'some' the ends and the middle — every fifth tick on a line of 20 —,
 * 'ends' the ends only). The asked number is NEVER labelled (RP-1): `arrow` draws a solid arrow
 * down to its tick (read it), `letters` put A, B, C over theirs (write them), `dot` is the key's
 * dot (mark it). `ticks: false` draws only the two end ticks (estimate where a number goes).
 * Labelled ticks are 5 mm at 1.5 pt, the others 3 mm at 0.75 pt (RP-50); labels at 12 pt or more,
 * Andika 700; the line grows (to 172 mm) so that no two labels touch.
 */
export function scaleLineSVG({ lo, hi, step, labels = 'some', arrow = null, letters = [], dot = null, ticks = true,
    lengthMm = 140, labelPt = 12, pxPerMm = 0, tapDot = false } = {}) {
    const n = Math.max(1, Math.round((hi - lo) / step));
    const LP = Math.max(12, labelPt);
    const val = (i) => Math.round((lo + i * step) * 1e6) / 1e6;
    const asked = new Set([arrow, ...letters.map((l) => l.v)].filter((v) => v !== null && v !== undefined).map(Number));
    const labelled = (i) => {
        if (i === 0 || i === n) return true;
        if (!ticks) return labels === 'some' && i === n / 2;      // an estimate line: ends, or ends and halfway
        if (labels === 'step') return !asked.has(val(i));
        if (labels === 'some') return n % 10 === 0 && n > 10 ? i % 5 === 0 : i === n / 2;
        return false;
    };
    const chars = Math.max(...[lo, hi].map((v) => fmt(v).length));
    const lw = chars * 0.56 * LP * PT_MM;
    const need = labels === 'step' ? (lw + 1.5) * n : 0;
    const len = Math.min(172, Math.max(lengthMm, need));
    const pad = Math.max(5, lw / 2 + 1);
    const top = arrow !== null || letters.length ? 11 : 3;
    const axisY = top + 3;
    const w = len + 2 * pad;
    // Every tick numbered and the numbers wider than a jump: every other number drops to a second
    // row, so no two numbers touch (a staggered scale, as on a ruler).
    const stagger = labels === 'step' && lw > 0.75 * (len / n);
    const h = axisY + 3 + LP * PT_MM * (stagger ? 2.3 : 1.2) + 1;
    const X = (v) => pad + (len * (v - lo)) / (hi - lo);
    const sw = (p) => (p * PT_MM).toFixed(3);
    let body = `<line x1="${pad.toFixed(2)}" y1="${axisY}" x2="${(pad + len).toFixed(2)}" y2="${axisY}" stroke="#000" stroke-width="${sw(1.5)}"/>`;
    for (let i = 0; i <= n; i++) {
        if (!ticks && !labelled(i)) continue;
        const x = X(val(i)).toFixed(2);
        const big = labelled(i);
        const t = big ? 2.5 : 1.5;
        body += `<line data-pv-tick="${val(i)}" x1="${x}" y1="${(axisY - t).toFixed(2)}" x2="${x}" y2="${(axisY + t).toFixed(2)}" stroke="#000" stroke-width="${sw(big ? 1.5 : 0.75)}"/>`;
        if (big) {
            const row = stagger && i % 2 === 1 ? LP * PT_MM * 1.1 : 0;
            body += `<text data-ws-ref="1" data-pv-label="${val(i)}" x="${x}" y="${(axisY + 3 + LP * PT_MM * 0.85 + row).toFixed(2)}" text-anchor="middle" `
                + `font-size="${(LP * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${fmt(val(i))}</text>`;
        }
    }
    // The arrow: a 1.5 pt stem and a solid head (well under 7 mm, INK-5) ending just over the tick.
    const downArrow = (x, y0) => `<line x1="${x.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x.toFixed(2)}" y2="${(axisY - 4.4).toFixed(2)}" stroke="#000" stroke-width="${sw(1.5)}"/>`
        + `<path d="M${(x - 1.4).toFixed(2)} ${(axisY - 4.6).toFixed(2)}L${(x + 1.4).toFixed(2)} ${(axisY - 4.6).toFixed(2)}L${x.toFixed(2)} ${(axisY - 2.6).toFixed(2)}Z" fill="#000"/>`;
    if (arrow !== null && arrow !== undefined) body += `<g data-pv-arrow="1">${downArrow(X(arrow), 0.5)}</g>`;
    for (const l of letters) {
        const x = X(l.v);
        body += `<text data-pv-letter="${esc(l.l)}" x="${x.toFixed(2)}" y="${(LP * PT_MM * 0.8).toFixed(2)}" text-anchor="middle" `
            + `font-size="${(LP * PT_MM).toFixed(3)}" font-weight="700" fill="#000">${esc(l.l)}</text>`;
        body += downArrow(x, LP * PT_MM + 0.8);
    }
    if (dot !== null && dot !== undefined) body += `<circle data-pv-dot="${dot}" cx="${X(dot).toFixed(2)}" cy="${axisY}" r="1.6" fill="#000"/>`;
    // The screen's tap-to-place dot (screen-cell.js, the round-line tap machinery): hidden until tapped.
    if (tapDot) body += `<circle class="mq-rl-dot" data-ws-feedback="dot" cx="-20" cy="${axisY}" r="2" fill="#000" visibility="hidden"/>`;
    const geo = tapDot ? ` data-rl-w="${w.toFixed(3)}" data-rl-h="${h.toFixed(3)}" data-rl-pad="${pad.toFixed(3)}" data-rl-len="${len}" data-rl-axis="${axisY}"` : '';
    const dims = pxPerMm > 0 ? `width="${Math.round(w * pxPerMm)}" height="${Math.round(h * pxPerMm)}"` : `width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm"`;
    return `<svg class="pv-scale-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" ${dims}${geo} `
        + `role="img" aria-label="Number line from ${fmt(lo)} to ${fmt(hi)}" style="display:block;margin:0 auto;max-width:100%;height:auto;font-family:'Andika',sans-serif;">${body}</svg>`;
}

/* =========================================================================== the `pv` template */

// One template for the family's cells, switched on `payload.kind` (the payload is plain data,
// SCC-Q3). It draws ONE item: no border, no label, no skill name (SCC-T5). A cell whose item is
// only readable with its own words (the number a "circle every number" set rounds to, the zone a
// "count one place" item asks about) carries them in its payload; the rest is the instruction's.
//
// The answer key is a facsimile (AK-1): state `answered` draws the SAME cell with the answer in
// the pupil's slot — the ring on the right word, the value on the line, every box of an expanded
// form filled (zeros included), the disks drawn in their zones, each number written in its column,
// the dot on its tick, the check in the right box.
//
// P9 step 8 kinds: `place-bank` (the word written from a bank), `blanks` (a frame with several
// slots: unit form, expanded notation, between two tens), `expand-line` (the unframed fade),
// `compare`, `order`, `chart` (the chart-fill cell, §13.3), `round-notate` / `decide` / `judge`
// (the response scopes of §2.6), `line-mark` (RN-2), `closest`, `estimate` (the two-line rewrite,
// §13.10) and `table` (the rounding table, §13.8).

const pt = (v) => `${Number(v).toFixed(1)}pt`;
const answered = (ctx) => ctx.state === 'answered' || ctx.state === 'traced';
/**
 * What a slot shows: '' on the pupil page, the key in `answered` / `traced`, and in state `wrong`
 * (the finished work of Error analysis, a True or False? statement) the provider's value for
 * that slot. The drawings below that are not `blank()` slots — rings, ticks, chart cells, the
 * dot — read their value here, so finished work shows in them exactly as a pupil would write it.
 */
function shownVal(ctx, id, key) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const v = w.slots && w.slots[id] !== undefined ? w.slots[id] : w.value;
        return v === undefined || v === null ? '' : String(v);
    }
    return answered(ctx) ? (key === undefined || key === null ? '' : String(key)) : '';
}
const showing = (ctx) => answered(ctx) || ctx.state === 'wrong';
const RING = 'border:1.5pt solid #000;border-radius:999px;';
const PLACE_WORD_KIT = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

function textLine(ctx, html) {
    return html ? `<div class="pv-prompt" style="font-size:${pt(ctx.metrics.textPt)};margin:0 0 2mm;">${html}</div>` : '';
}

/** Numbers and signs at the working size, words at the cell-text size (RM-27). */
function piece(ctx, seg) {
    return String(seg).trim().split(/\s+/).filter(Boolean).map(tok => (/^\d[\d,.]*$|^[+−×÷=≈→<>-]$/.test(tok)
        ? `<span class="${/^\d/.test(tok) ? '' : 'o'}">${esc(tok)}</span>`
        : `<span style="font-size:${pt(ctx.metrics.textPt + 3)};font-weight:400;padding-bottom:0.12em;">${esc(tok)}</span>`)).join('');
}

/** A frame line with the slot where the text has "____". */
function frameHTML(ctx, text, key, digits) {
    const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: true, order: 0,
        scopes: ['full', 'answer-only'] }, ctx, key);
    // A frame is words and numbers on one line (RM-27): numbers and signs at the working digit
    // size, words at the cell-text size, all bottom-aligned in the kit's equation row (`.ws-eq`)
    // so the writing line sits on the digits' baseline.
    const parts = String(text || '____').split('____');
    // A long frame ("100 more than 900 is ____.") may wrap between its words so it stands in a
    // 2-column cell (owner 2026-09-25: two columns for almost every problem); the word before the
    // slot, the slot and what follows it stay together on the last line.
    if (parts.length === 2) {
        const pre = parts[0].trim().split(/\s+/).filter(Boolean);
        const last = pre.pop() || '';
        const grp = `<span class="pv-slotgroup" style="display:inline-flex;align-items:flex-end;flex-wrap:nowrap;white-space:nowrap;column-gap:0.2em;">${piece(ctx, last)}${slot}${piece(ctx, parts[1])}</span>`;
        return `<div class="ws-eq pv-frame" style="font-weight:700;flex-wrap:wrap;justify-content:center;row-gap:2mm;">${piece(ctx, pre.join(' '))}${grp}</div>`;
    }
    const body = parts.length > 1 ? parts.map(s => piece(ctx, s)).join(slot) : `${piece(ctx, text)}${slot}`;
    return `<div class="ws-eq pv-frame" style="font-weight:700;">${body}</div>`;
}

/** A frame with several slots: each "____" is slot b0, b1 … keyed by `keys[i]`. */
function blanksHTML(ctx, text, keys, words, floor = 0) {
    const parts = String(text || '').split('____');
    // Round-3 re-grade (H-slot): every number slot of a frame is as wide as the widest answer the
    // SECTION can need (`floor`, from the numbers printed), never its own answer - a longer slot
    // told the pupil which answers have three digits.
    const numKeys = (keys || []).map((k) => String(k === undefined ? '' : k)).filter((k) => /^\d/.test(k));
    const width = Math.max(floor, ...numKeys.map((k) => k.replace(/[^0-9]/g, '').length), 1);
    const slots = [];
    parts.forEach((seg, i) => {
        if (i < parts.length - 1) {
            const k = keys && keys[i] !== undefined ? String(keys[i]) : '';
            const digits = /^\d/.test(k) ? width : Math.max(1, k.length || 1);
            const shape = words && !/^\d/.test(k) ? 'line' : 'box';
            slots.push(blank({ id: `b${i}`, kind: /^\d/.test(k) ? 'number' : 'text', shape, digits: Math.max(digits, shape === 'line' ? 6 : 1),
                graded: true, order: i, scopes: ['full', 'answer-only'] }, ctx, k));
        }
    });
    // The slots and the words between them ("____ and ____") stay on ONE line: a wrap that left
    // "and" at a line end and the second slot alone on the next read as two separate answers.
    let out = piece(ctx, parts[0]);
    const NOWRAP = 'display:inline-flex;align-items:flex-end;flex-wrap:nowrap;white-space:nowrap;column-gap:0.2em;';
    if (slots.length > 1 && parts.slice(1, slots.length).some((seg) => /\+/.test(seg))) {
        // An expanded form (3.47 = ____ × 1 + ____ × 0.1 + ____ × 0.01) is a SUM of terms: each
        // slot keeps its "× place" beside it, and the frame may wrap only before a "+" - one
        // unbroken group ran off a narrow card (the quiz), clipping the first and last boxes.
        parts.slice(1).forEach((seg, i) => {
            const [head, ...rest] = seg.split('+');
            out += `<span class="pv-slotgroup" style="${NOWRAP}">${slots[i]}${head.trim() ? piece(ctx, head) : ''}</span>`;
            if (rest.length) out += piece(ctx, '+' + rest.join('+'));
        });
        return `<div class="ws-eq pv-frame pv-blanks" style="font-weight:700;flex-wrap:wrap;row-gap:2mm;">${out}</div>`;
    }
    if (slots.length) {
        let grp = '';
        parts.slice(1).forEach((seg, i) => {
            grp += slots[i];
            if (i < slots.length - 1) grp += piece(ctx, seg);
        });
        out += `<span class="pv-slotgroup" style="display:inline-flex;align-items:flex-end;flex-wrap:nowrap;white-space:nowrap;column-gap:0.2em;">${grp}</span>`;
        out += piece(ctx, parts[parts.length - 1]);
    }
    return `<div class="ws-eq pv-frame pv-blanks" style="font-weight:700;flex-wrap:wrap;row-gap:2mm;">${out}</div>`;
}

/**
 * The digits a number slot of this item is drawn for: the longest number the item prints (its
 * number, its bounds, the numbers of its frame), plus one when the answer can gain a digit
 * (rounding 95 gives 100, a sum of two 2-digit numbers can reach 3). Items of one section print
 * numbers of one size, so their slots come out the same width whatever each answer is.
 */
function slotFloor(p, grow) {
    // (a decimal arrives as its string, "4.567": its digits count, the point does not - so a value
    // line is as wide as the number's digits, never as its own answer, critic pv-r1 L3)
    const lens = [p.n, p.a, p.b, p.lo, p.hi].map((v) => (typeof v === 'string' && /^\d[\d,]*(\.\d+)?$/.test(v) ? v : v))
        .filter((v) => (typeof v === 'number' && Number.isFinite(v)) || typeof v === 'string')
        .map((v) => (typeof v === 'string' ? v.replace(/[^0-9]/g, '').length : String(Math.abs(Math.round(v))).length))
        .filter((k) => k > 0);
    for (const t of String(p.frame || '').match(/\d[\d,]*/g) || []) lens.push(t.replace(/,/g, '').length);
    for (const v of p.nums || []) lens.push(String(v).replace(/[^0-9]/g, '').length);
    const m = lens.length ? Math.max(...lens) : 0;
    // A section mixes 1- and 2-digit numbers ("1 more than 9" beside "1 more than 95"): the slot
    // of an answer that can gain a digit is never drawn under three digits.
    return m ? Math.max(m + (grow ? 1 : 0), grow ? 3 : 0) : 0;
}

/** Words or numbers printed for the pupil to ring; the key rings the right ones. */
function ringRow(ctx, items, correct, sizePt) {
    const on = ctx.state === 'wrong' ? new Set([shownVal(ctx, 'answer', '')]) : answered(ctx) ? new Set((correct || []).map(String)) : new Set();
    const cells = items.map(w => `<span class="pv-choice" data-ws-slot="choice" data-ws-shape="ring" style="display:inline-block;`
        + `padding:0.8mm 2.2mm;margin:1mm 2mm;${on.has(String(w)) ? RING : 'border:1.5pt solid transparent;'}">${esc(w)}</span>`).join('');
    return `<div class="pv-ring-row" style="font-size:${pt(sizePt || ctx.metrics.digitPt * 0.75)};font-weight:700;text-align:center;`
        + `line-height:1.6;">${cells}</div>`;
}

/** Check-box choices ("Round up / Round down", "Correct / Fix it"): the key ticks the right one. */
function checkRow(ctx, labels, correct) {
    // The tick goes in the box of the chosen label: the key's, or the finished work's.
    const chosen = shownVal(ctx, 'answer', correct);
    const cw = (SIZES[ctx.size] || SIZES.M || { checkMm: 6 }).checkMm || 6;
    const boxes = labels.map((l, i) => `<span style="display:inline-flex;align-items:center;gap:2mm;margin:0 4mm;">`
        + `<span class="ws-check" data-ws-slot="c${i}" data-ws-shape="check" style="width:${cw}mm;height:${cw}mm">${chosen === l ? '✓' : ''}</span>`
        + `<span style="font-size:${pt(ctx.metrics.textPt + 2)};font-weight:700;">${esc(l)}</span></span>`).join('');
    return `<div class="pv-checks" style="text-align:center;margin-top:2mm;">${boxes}</div>`;
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

/** The chart-fill cell (§13.3): the place letters over a row of empty boxes, the source above. */
function chartHTML(p, ctx) {
    const places = p.places || [];
    const keys = p.keys || [];
    const colW = { S: 14, M: 14, L: 17 }[ctx.size] || 14;
    const rowH = { S: 12, M: 12, L: 14 }[ctx.size] || 12;
    const heads = places.map(pl => `<td style="border:0.75pt solid #000;width:${colW}mm;text-align:center;font-size:${pt(ctx.metrics.zonePt)};`
        + `font-weight:700;padding:1mm 0;">${LETTER[pl] || ''}</td>`).join('');
    // Finished work given as a whole number (462) is written ONE DIGIT PER COLUMN, right-aligned
    // to the ones, never the whole number in every column.
    const w = ctx.state === 'wrong' ? (ctx.wrong || {}) : null;
    const wDigits = w && !(w.slots && Object.keys(w.slots).some(k => /^d\d+$/.test(k)))
        ? String(w.value === undefined || w.value === null ? '' : w.value).replace(/[^0-9]/g, '') : null;
    const cellVal = (i) => {
        if (wDigits === null) return shownVal(ctx, `d${i}`, keys[i]);
        const j = wDigits.length - (places.length - i);
        return j >= 0 ? wDigits[j] : '';
    };
    const cells = places.map((pl, i) => `<td style="border:0.75pt solid #000;width:${colW}mm;height:${rowH}mm;text-align:center;`
        + `font-size:${pt(ctx.metrics.digitPt)};font-weight:700;"><span data-ws-slot="d${i}" data-ws-shape="cell">${esc(cellVal(i))}</span></td>`).join('');
    // The source at the working digit size when it is numbers (40,000 + 6,000 + 300), at a large
    // text size when it is words.
    const srcPt = /[a-z]/i.test(String(p.source || '')) ? ctx.metrics.textPt + 3 : ctx.metrics.digitPt * 0.8;
    return `<div style="text-align:center;margin:0 0 3mm;"><span style="font-size:${pt(srcPt)};font-weight:700;">${esc(p.source || '')}</span></div>`
        + `<table class="pv-chartfill" style="border-collapse:collapse;margin:0 auto;"><tr>${heads}</tr><tr>${cells}</tr></table>`;
}

/** A wrong table answer "a; b; c" gives cell k its k-th value. */
function tableWrong(ctx, k) {
    const w = ctx.wrong || {};
    if (w.slots && w.slots[`t${k}`] !== undefined) return String(w.slots[`t${k}`]);
    const parts = String(w.value === undefined ? '' : w.value).split(/;\s*/);
    return parts[k] !== undefined ? parts[k] : '';
}

/** The rounding table (§13.8): given cells printed, blank cells are empty boxes (keyed on the key). */
function tableHTML(p, ctx) {
    const places = p.places || [];
    const rowH = (ctx.metrics.writeMm || 8) + 5;
    const bd = 'border:0.75pt solid #000;';
    const head = `<tr><td style="${bd}padding:1mm 3mm;font-size:${pt(ctx.metrics.zonePt)};">Number</td>`
        + places.map(pl => `<td style="${bd}padding:1mm 3mm;font-size:${pt(ctx.metrics.zonePt)};">Nearest ${fmt(pl)}</td>`).join('') + '</tr>';
    let k = 0;
    const body = (p.rows || []).map((n, r) => `<tr><td style="${bd}height:${rowH}mm;padding:0 3mm;text-align:center;">${esc(n)}</td>`
        + places.map((_, c) => {
            const v = p.view && p.view[r] ? p.view[r][c] : null;
            if (v !== null && v !== undefined) return `<td style="${bd}padding:0 3mm;text-align:center;">${esc(v)}</td>`;
            const key = p.keys && p.keys[r] ? p.keys[r][c] : '';
            const id = `t${k++}`;
            return `<td style="${bd}min-width:22mm;padding:0 3mm;text-align:center;" data-ws-slot="${id}" data-ws-shape="cell">${esc(ctx.state === 'wrong' ? tableWrong(ctx, k - 1) : shownVal(ctx, id, key))}</td>`;
        }).join('') + '</tr>').join('');
    return `<table class="pv-rtable" style="border-collapse:collapse;margin:0 auto;font-size:${pt(ctx.metrics.digitPt * 0.7)};font-weight:700;">${head}${body}</table>`;
}

/** The order cell: the number cards, then one box per number (P6 §9). */
function orderHTML(p, ctx) {
    const cards = (p.nums || []).map(v => `<span style="display:inline-block;border:0.75pt solid #000;border-radius:2mm;padding:1mm 3mm;margin:0 2mm;">${esc(v)}</span>`).join('');
    const digits = Math.max(...(p.sorted || ['00']).map(v => String(v).replace(/[^0-9]/g, '').length), 2);
    const boxes = (p.sorted || []).map((v, i) => blank({ id: `o${i}`, kind: 'number', shape: 'box', digits, graded: true, order: i,
        scopes: ['full', 'answer-only'] }, ctx, v)).join('<span class="o">,</span>');
    // The answer boxes are one row, read left to right: never wrapped (a third box alone on a
    // second line behind a dangling comma had no reading order). A row too wide for the column
    // is measured as not fitting, and the layout takes fewer columns (DN-10).
    return `<div style="text-align:center;font-size:${pt(ctx.metrics.digitPt * 0.8)};font-weight:700;margin-bottom:3mm;">${cards}</div>`
        + `<div class="ws-eq pv-order" style="font-weight:700;flex-wrap:nowrap;white-space:nowrap;justify-content:center;">${boxes}</div>`;
}

/**
 * Size S buys more problems a page (LESSONS L1, critic pv-r1): a number line of ten jumps or fewer
 * is drawn 70 mm long there, so two stand side by side; a mat of three zones stands its disks two
 * across (and five down), so two mats stand side by side.
 */
const scaleHalf = (p, size) => size === 'S' && Math.round((p.hi - p.lo) / p.step) <= 10
    && (p.labels !== 'step' || String(Math.round(Math.abs(p.hi))).length <= 3);
const matAcross = (p, size) => (size === 'S' && (p.places || []).length === 3 ? 2 : 3);

const keyDigits = (kv) => Math.max(2, String(kv === undefined ? '' : kv).replace(/[^0-9]/g, '').length);

register('pv', {
    render(p, ctx0) {
        // Finished work that is RIGHT arrives as state `wrong` with the whole answer and no
        // per-slot values: draw it as the key does, so a multi-slot cell never writes the whole
        // answer into each of its boxes.
        let ctx = ctx0;
        if (ctx0.state === 'wrong') {
            const w = ctx0.wrong || {};
            const kvs = typeof p.keyValue === 'number' ? fmt(p.keyValue) : String(p.keyValue === undefined ? '' : p.keyValue);
            const noSlots = !w.slots || !Object.keys(w.slots).length;
            // The estimate's finished work may arrive as the estimate alone (40, not "10 + 30 = 40"):
            // right work is drawn as the key, never with 40 written in every box.
            const est = p.kind === 'estimate' ? String((p.keys || [])[2] === undefined ? '' : p.keys[2]).replace(/,/g, '') : null;
            if (noSlots && (String(w.value).replace(/,/g, '') === kvs.replace(/,/g, '') || (est !== null && String(w.value).replace(/,/g, '') === est))) {
                ctx = Object.assign({}, ctx0, { state: 'answered' });
            }
        }
        const m = ctx.metrics;
        const numeral = (opt) => numeralTracksHTML(p.n, { ...opt, size: pt(m.digitPt) });
        const center = (h) => `<div style="text-align:center;margin:1mm 0 2mm;">${h}</div>`;
        const big = (h) => `<span style="font-size:${pt(m.digitPt)};font-weight:700;">${h}</span>`;
        const kv = typeof p.keyValue === 'number' ? fmt(p.keyValue) : p.keyValue;
        // A slot's width never tells the answer (round-3 re-grade): at least the longest number the
        // item prints, plus one where the answer can gain a digit (rounding, estimating).
        const digits = Math.max(keyDigits(kv), slotFloor(p, p.kind !== 'value'));
        const top = p.hideNumeral ? '' : undefined;
        // "Name the place": the letter over the underlined digit IS the answer, so the letters are
        // a hint here and fade by page role — Model and Guided keep them, Independent, More
        // practice and Test print the bare numeral (P-7). The key is the pupil page's facsimile.
        const nameHeads = (Number(ctx.scaffoldLevel) || 0) >= 2;
        switch (p.kind) {
            case 'place':
                return `<div class="pv-cell">${top ?? center(numeral({ underline: p.place, heads: nameHeads }))}${ringRow(ctx, p.words || [], [kv], ctx.metrics.textPt + 2)}</div>`;
            case 'place-bank': {
                const bank = `<div class="pv-bank" style="display:table;margin:0 auto 2mm;border:1.5pt solid #000;border-radius:3mm;padding:1mm 3mm;`
                    + `font-size:${pt(m.textPt + 1)};font-weight:700;">${(p.words || []).map(esc).join('&nbsp;&nbsp;&nbsp;')}</div>`;
                const slot = blank({ id: 'answer', kind: 'text', shape: 'line', digits: 9, graded: true, order: 0, scopes: ['full', 'answer-only'] }, ctx, kv);
                return `<div class="pv-cell">${top ?? center(numeral({ underline: p.place, heads: nameHeads }))}${bank}<div style="text-align:center;">${slot}</div></div>`;
            }
            case 'value':
                return `<div class="pv-cell">${top ?? center(numeral({ underline: p.place }))}${frameHTML(ctx, p.frame, kv, digits)}</div>`;
            case 'blanks': {
                const pic = p.place && !p.hideNumeral ? center(numeral({ underline: p.place })) : '';
                return `<div class="pv-cell">${pic}${blanksHTML(ctx, p.frame, p.keys, p.words, slotFloor(p, false))}</div>`;
            }
            case 'expand':
                return `<div class="pv-cell">${expandHTML(p, ctx)}</div>`;
            case 'expand-line': {
                const slot = blank({ id: 'answer', kind: 'text', shape: 'line', digits: 15, graded: true, order: 0, scopes: ['full', 'answer-only'] }, ctx, kv);
                return `<div class="pv-cell"><div class="ws-eq pv-frame" style="font-weight:700;"><span>${esc(fmt(p.n))}</span><span class="o">=</span>${slot}</div></div>`;
            }
            case 'frame':
                // `slotDigits` fixes the slot's width for the whole skill, so a 3-digit answer (100)
                // never gets a longer line than its neighbours.
                return `<div class="pv-cell">${p.showNumeral ? center(numeral({})) : ''}${frameHTML(ctx, p.frame, kv, Math.max(digits, Number(p.slotDigits) || 0))}</div>`;
            case 'compare': {
                const slot = blank({ id: 'answer', kind: 'sign', shape: 'circle', graded: true, order: 0, scopes: ['full', 'answer-only'] }, ctx, kv);
                return `<div class="pv-cell" style="text-align:center;"><div class="ws-eq pv-compare" style="font-weight:700;display:inline-flex;gap:4mm;">`
                    // (a decimal arrives as its string, so 0.50 keeps its zero)
                    + `<span>${esc(typeof p.a === 'string' ? p.a : fmt(p.a))}</span>${slot}<span>${esc(typeof p.b === 'string' ? p.b : fmt(p.b))}</span></div></div>`;
            }
            case 'order':
                return `<div class="pv-cell">${orderHTML(p, ctx)}</div>`;
            case 'chart':
                return `<div class="pv-cell">${chartHTML(p, ctx)}</div>`;
            case 'round': {
                // One slot width for every item with numbers this long (a rounded number has at most
                // one more digit), so the line never tells which items round up into a new place.
                // (On a line the widest bound is the line's top end, which only some items reach
                // - 1,000,000 - so the number's own length sets it there.)
                const nLen = String(Math.trunc(Math.abs(Number(p.n) || 0))).length + 1;
                const rDigits = p.support === 'line' ? nLen : Math.max(digits, nLen);
                const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits: rDigits, graded: true, order: 0,
                    scopes: ['full', 'answer-only'] }, ctx, kv);
                if (p.support === 'line') {
                    const len = { S: 120, M: 140, L: 150 }[ctx.size] || 140;
                    // Finished work (Error analysis) shows the pupil's own dot: where the provider
                    // says it went (a misplaced dot), else on the number.
                    const w = ctx.state === 'wrong' ? (ctx.wrong || {}) : null;
                    const wMark = w && w.slots && w.slots.mark !== undefined ? Number(String(w.slots.mark).replace(/,/g, '')) : NaN;
                    const dotAt = Number.isFinite(wMark) ? wMark : p.n;
                    const line = roundingLineSVG({ lo: p.lo, hi: p.hi, n: dotAt, lengthMm: len, labelPt: m.zonePt, dot: !!p.dot,
                        keyDot: !!p.mark && (answered(ctx) || ctx.state === 'wrong'), mid: !!p.mid, showNumber: !p.markWord });
                    // "Mark 6,480": the number to place, in big digits over the line (the page's
                    // instruction line is shared by every item, so each cell names its own number).
                    const head = p.markWord ? center(`<span style="font-size:${pt(m.textPt + 3)};font-weight:400;">Mark</span> ${big(esc(fmt(p.n)))}`) : '';
                    return `<div class="pv-cell">${head}${center(p.mark ? `<div data-ws-slot="mark" data-ws-shape="draw">${line}</div>` : line)}`
                        + `${frameHTML(ctx, `Round to the nearest ${fmt(p.place)}: ____`, kv, rDigits)}</div>`;
                }
                if (p.support === 'none') {
                    // Plain (no drawing): "4,683 →" and the line. The two halves may stack when the
                    // number is long (a 6-digit number at size L), so a plain page keeps two columns
                    // instead of one (LESSONS L1/L2); the number never splits from its arrow.
                    const keep = 'display:inline-block;white-space:nowrap;';
                    const long = String(Math.trunc(Math.abs(Number(p.n) || 0))).length >= 5;
                    return `<div class="pv-cell pv-round1 pv-round-plain" style="text-align:center;${long ? '' : 'white-space:nowrap;'}">`
                        + `<span style="${keep}">${big(`${esc(fmt(p.n))} →`)}</span> <span style="${keep}">${big(slot)}</span></div>`;
                }
                const pic = numeral({ cut: p.place, arrow: true });
                // On a screen (the kit twin) a narrow card stacks the answer UNDER the cut-line
                // number instead of clipping it (critic pv-r1, 390 px); paper keeps one line.
                if (p.onScreen) {
                    const keep = 'display:inline-block;white-space:nowrap;vertical-align:bottom;';
                    return `<div class="pv-cell pv-round1" style="text-align:center;"><span style="${keep}">${pic}</span> <span style="${keep}">${big(slot)}</span></div>`;
                }
                return `<div class="pv-cell pv-round1" style="text-align:center;white-space:nowrap;">${pic}${big(slot)}</div>`;
            }
            case 'round-notate': {
                // RN-7a: the strip without an answer slot; the key underlines the place's digit and
                // rings the one after it (1.5 pt, §13.6).
                const strip = numeralTracksHTML(p.n, { underline: showing(ctx) ? p.place : 0, size: pt(m.digitPt) });
                const ringDigit = showing(ctx) ? `<div style="font-size:${pt(m.textPt)};margin-top:1mm;">${esc(shownVal(ctx, 'answer', kv))}</div>` : '';
                return `<div class="pv-cell" data-ws-slot="answer" data-ws-shape="mark">${center(strip)}${ringDigit}</div>`;
            }
            case 'decide': {
                const pic = p.expr ? center(big(esc(p.expr))) : center(numeral({ cut: p.place }));
                return `<div class="pv-cell">${pic}${checkRow(ctx, p.labels || [], kv)}</div>`;
            }
            case 'judge': {
                const fixed = String(kv).startsWith('Fix');
                const work = `${numeral({ cut: p.place, arrow: true })}${big(esc(fmt(p.shown)))}`;
                const fix = blank({ id: 'fix', kind: 'number', shape: 'box', digits: keyDigits(p.correct), graded: false, order: 2 }, ctx, fixed ? fmt(p.correct) : '');
                return `<div class="pv-cell">${center(work)}${checkRow(ctx, ['Correct', 'Fix it'], fixed ? 'Fix it' : 'Correct')}`
                    + `<div style="text-align:center;margin-top:1mm;">${fix}</div></div>`;
            }
            case 'line-mark': {
                const len = { S: 120, M: 140, L: 150 }[ctx.size] || 140;
                // The dot on the tick: the key's, or (finished work) the one a pupil marked wrongly.
                const at = ctx.state === 'wrong' ? Number(String(shownVal(ctx, 'answer', '')).replace(/,/g, '')) : p.n;
                const line = roundingLineSVG({ lo: p.lo, hi: p.hi, n: Number.isFinite(at) ? at : p.n, lengthMm: len, labelPt: m.zonePt,
                    keyDot: showing(ctx) && Number.isFinite(at), showNumber: false });
                // The number to mark, in big digits over the line: the instruction line is shared by
                // the page ("Mark the number on the line."), so each cell names its own number.
                const target = `<span style="font-size:${pt(m.textPt + 3)};font-weight:400;">Mark</span> ${big(esc(fmt(p.n)))}`;
                return `<div class="pv-cell">${center(target)}${center(`<div data-ws-slot="answer" data-ws-shape="draw">${line}</div>`)}</div>`;
            }
            case 'circle':
                return `<div class="pv-cell">${textLine(ctx, `Rounds to <b>${esc(fmt(p.target))}</b>:`)}${ringRow(ctx, p.tiles || [], p.correct || [])}</div>`;
            case 'closest':
                return `<div class="pv-cell">${center(big(esc(p.expr)))}${ringRow(ctx, p.choices || [], [kv])}</div>`;
            case 'estimate': {
                // The two-line rewrite (RD-07, §13.10): the exact problem, then a box under each
                // number for its rounded value, the sign printed, then "≈ ____".
                const keys = p.keys || [];
                // Both number boxes one width (the wider key's), so a 100 never gets a box of its own size.
                const dg = (i) => String(keys[i] === undefined ? '' : keys[i]).replace(/[^0-9]/g, '').length;
                const bx = (i) => blank({ id: `b${i}`, kind: 'number', shape: 'box', digits: Math.max(2, dg(0), dg(1)),
                    graded: true, order: i, scopes: ['full', 'answer-only'] }, ctx, keys[i]);
                const line2 = `<div style="text-align:center;"><div class="ws-eq pv-rewrite" style="font-weight:700;display:inline-flex;">${bx(0)}<span class="o">${esc(p.op)}</span>${bx(1)}`
                    + `<span class="o">=</span>${blank({ id: 'b2', kind: 'number', shape: 'box', digits: Math.max(2, String(keys[2] || '').replace(/[^0-9]/g, '').length),
                        graded: true, order: 2, scopes: ['full', 'answer-only'] }, ctx, keys[2])}</div></div>`;
                return `<div class="pv-cell">${center(big(esc(p.expr)))}${line2}</div>`;
            }
            case 'table':
                return `<div class="pv-cell">${tableHTML(p, ctx)}</div>`;
            case 'round-multi': {
                // One number rounded to every chosen place (owner 2026-09-26): the number, then one
                // row per place - "Nearest 100 →" and a line. Every line is as wide as the longest
                // answer the number can have (one digit more), so no line tells which rounds up.
                // The number stands BESIDE its lines where the column is wide enough, over them
                // where it is not (footprint `restacks`), so a cell is only as tall as its lines.
                // The page instruction names the places; each line is labelled with its place.
                // Four or more places (a 7-digit number): the line is as wide as the number, and the
                // label is the place alone, so a problem still fits half the page (critic pv-r1).
                const many = (p.places || []).length > 3;
                const w = String(Math.trunc(Math.abs(Number(p.n) || 0))).length + (many ? 0 : 1);
                const rows = (p.places || []).map((P, i) => `<div style="display:table-row;">`
                    + `<span style="display:table-cell;text-align:right;padding:0 2mm 0 0;font-size:${pt(m.textPt + (many ? 0 : 2))};white-space:nowrap;vertical-align:bottom;">${esc(fmt(P))}${many ? ':' : ' →'}</span>`
                    + `<span style="display:table-cell;padding:0.5mm 0;vertical-align:bottom;">${blank({ id: `b${i}`, kind: 'number', shape: 'line', digits: w, graded: true, order: i,
                        scopes: ['full', 'answer-only'] }, ctx, (p.keys || [])[i])}</span></div>`).join('');
                // `labels`: the place letters over the number's digits (the support); plain is the fade.
                return `<div class="pv-cell pv-rmulti" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:6mm;row-gap:1mm;">`
                    + `<div style="white-space:nowrap;">${p.labels ? numeral({}) : big(esc(fmt(p.n)))}</div>`
                    + `<div class="ws-eq" style="display:table;font-weight:700;">${rows}</div></div>`;
            }
            case 'scale': {
                // nl_20 (number_sense:number_line_scales): read the arrow, write the lettered
                // numbers, mark a number, or estimate where it goes on a line with only its ends.
                const len = scaleHalf(p, ctx.size) ? 70 : ({ S: 120, M: 140, L: 150 }[ctx.size] || 140);
                const task = p.task || 'read';
                const base = { lo: p.lo, hi: p.hi, step: p.step, labels: p.labels, lengthMm: len, labelPt: m.zonePt };
                if (task === 'mark' || task === 'estimate') {
                    const w = ctx.state === 'wrong' ? Number(String(shownVal(ctx, 'answer', '')).replace(/,/g, '')) : p.n;
                    const line = scaleLineSVG({ ...base, ticks: task !== 'estimate', dot: showing(ctx) && Number.isFinite(w) ? w : null });
                    const head = `<span style="font-size:${pt(m.textPt + 3)};font-weight:400;">Mark</span> ${big(esc(fmt(p.n)))}`;
                    return `<div class="pv-cell">${center(head)}${center(`<div data-ws-slot="answer" data-ws-shape="draw">${line}</div>`)}</div>`;
                }
                if (task === 'fill') {
                    const letters = (p.targets || []).map((v, i) => ({ v, l: 'ABC'[i] }));
                    const frame = letters.map((l) => `${l.l} ____`).join('   ');
                    const floor = Math.max(...[p.lo, p.hi].map((v) => String(Math.abs(Math.round(v))).length));
                    return `<div class="pv-cell">${center(scaleLineSVG({ ...base, letters }))}${blanksHTML(ctx, frame, (p.targets || []).map(fmt), false, floor)}</div>`;
                }
                const floor = Math.max(...[p.lo, p.hi].map((v) => String(Math.abs(Math.round(v))).length));
                return `<div class="pv-cell">${center(scaleLineSVG({ ...base, arrow: p.n }))}${frameHTML(ctx, '____', kv, Math.max(2, floor))}</div>`;
            }
            case 'disks': {
                // vis_pv_dot_disks: plain dots (`dots`), crossed counters (task take), the move
                // arrows of × / ÷ 10 (task x10 / d10), and every number from n counters (task all).
                const moving = p.task === 'x10' ? 'left' : p.task === 'd10' ? 'right' : null;
                if (p.task === 'all') {
                    const mat = diskMatSVG({ places: p.places, counts: null, size: ctx.size, across: matAcross(p, ctx.size) }).svg;
                    const head = `<span style="font-size:${pt(m.textPt + 3)};font-weight:400;">Use</span> ${big(esc(String(p.counters)))} `
                        + `<span style="font-size:${pt(m.textPt + 3)};font-weight:400;">counters.</span>`;
                    const list = (p.sorted || []).map(String);
                    const w = Math.max(2, ...list.map((v) => v.replace(/[^0-9]/g, '').length));
                    // The numbers in a grid of boxes, three to a row, read left to right (no comma
                    // ever starts a line).
                    const boxes = list.map((v, i) => blank({ id: `o${i}`, kind: 'number', shape: 'box', digits: w, graded: true, order: i,
                        scopes: ['full', 'answer-only'] }, ctx, v)).join('');
                    return `<div class="pv-cell">${center(head)}${center(mat)}<div class="ws-eq pv-allnums" style="font-weight:700;display:grid;`
                        + `grid-template-columns:repeat(${Math.min(3, list.length)},auto);justify-content:center;gap:2mm 5mm;">${boxes}</div></div>`;
                }
                const mat = screenMat(ctx, p, { places: p.places, counts: p.counts, size: ctx.size, dots: !!p.dots, crossed: p.crossed || null, arrows: moving, fraction: !!p.fraction, across: matAcross(p, ctx.size) });
                const frame = p.task === 'count' ? `${PLACE_WORD_KIT[p.place] || ''}${p.dots ? '' : ' disks'}: ____`
                    : p.task === 'x10' ? `${fmt(p.n)} × 10 = ____` : p.task === 'd10' ? `${fmt(p.n)} ÷ 10 = ____` : '____';
                return `<div class="pv-cell">${center(mat)}${frameHTML(ctx, frame, kv, digits)}</div>`;
            }
            case 'build': {
                // The key draws the disks; finished work draws the disks of the value written.
                let counts = answered(ctx) ? p.counts : null;
                if (ctx.state === 'wrong') {
                    // decimal places kept: 5.4 draws 5 ones and 4 tenths (worked in thousandths)
                    const v = Number(String(shownVal(ctx, 'answer', '')).replace(/[^0-9.]/g, ''));
                    if (Number.isFinite(v)) counts = Object.fromEntries((p.places || []).map((pl) => [pl, Math.floor(Math.round(v * 1000) / Math.round(pl * 1000)) % 10]));
                }
                const mat = screenMat(ctx, p, { places: p.places, counts, size: ctx.size, diskPt: 1.5, dots: !!p.dots, fraction: !!p.fraction, across: matAcross(p, ctx.size) });
                const numeralSpan = `<span style="font-size:${pt(m.digitPt)};font-weight:700;">${esc(fmt(p.n))}</span>`;
                // A mat of three or more zones fills a full-width cell: the number stands BESIDE it
                // (not over it), so the row is one mat tall and a page holds more rows (L2).
                if ((p.places || []).length >= 3) {
                    return `<div class="pv-cell" style="display:flex;align-items:center;justify-content:center;gap:10mm;">`
                        + `<div style="min-width:24mm;text-align:right;">${numeralSpan}</div>`
                        + `<div data-ws-slot="answer" data-ws-shape="draw">${mat}</div></div>`;
                }
                return `<div class="pv-cell">${center(numeralSpan)}`
                    + `<div data-ws-slot="answer" data-ws-shape="draw">${mat}</div></div>`;
            }
            case 'word-choice': {
                // Choose the word name: the numeral (letters over its places), then the choices one
                // per line at the cell-text size, lettered A-D in capitals (the item's own letter is a
                // lower-case "a."), a hyphenated word never split at its hyphen. One response: ring the right
                // name (the key rings it).
                const on = shownVal(ctx, 'answer', kv);
                const rows = (p.choices || []).map((c, i) => `<div class="pv-choice" data-ws-slot="choice" data-ws-shape="ring" `
                    + `style="display:table;padding:1mm 3mm;margin:1.5mm 0;border-radius:4mm;`
                    + `${on && String(c) === on ? 'border:1.5pt solid #000;' : 'border:1.5pt solid transparent;'}">`
                    + `<span style="display:table-cell;width:7mm;">${esc((p.labels || [])[i] || '')}</span><span style="display:table-cell;">${esc(c).split(' ').map(w => (w.includes('-') ? `<span style="white-space:nowrap;">${w}</span>` : w)).join(' ')}</span></div>`).join('');
                return `<div class="pv-cell">${center(numeral({}))}<div class="pv-word-choices" style="display:table;margin:0 auto;font-size:${pt(m.textPt + 2)};`
                    + `font-weight:700;line-height:1.3;text-align:left;">${rows}</div></div>`;
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
        if (p.kind === 'blanks' || p.kind === 'estimate' || p.kind === 'round-multi') (p.keys || []).forEach((v, i) => { slots[`b${i}`] = { value: String(v), graded: true }; });
        if (p.kind === 'order' || (p.kind === 'disks' && p.task === 'all')) (p.sorted || []).forEach((v, i) => { slots[`o${i}`] = { value: String(v), graded: true }; });
        if (p.kind === 'chart') (p.keys || []).forEach((v, i) => { slots[`d${i}`] = { value: String(v), graded: true }; });
        if (p.kind === 'scale' && p.task === 'fill') (p.targets || []).forEach((v, i) => { slots[`b${i}`] = { value: fmt(v), graded: true }; });
        if (p.kind === 'expand-line' && p.also) slots.answer.accept.push(String(p.also));
        return { value, display, slots };
    },
    footprint(p, ctx) {
        const nd = String(p.n === undefined ? '' : p.n).length;
        const wide = p.kind === 'sort' || p.kind === 'table' || p.kind === 'line-mark' || p.kind === 'chart' || (p.kind === 'scale' && !scaleHalf(p, ctx.size))
            || (p.kind === 'word-choice' && Math.max(0, ...(p.choices || []).map(c => String(c).length)) > 30)
            || (p.kind === 'round' && (p.support === 'line' || (nd >= 6 && p.support !== 'none'))) || (p.kind === 'judge' && nd >= 6)
            || ((p.kind === 'disks' || p.kind === 'build') && (p.places || []).length >= 3 && matAcross(p, ctx.size) === 3)
            || (p.kind === 'expand' && (nd >= 4 || (nd === 3 && ctx.size === 'L')))
            || ((p.kind === 'blanks' || p.kind === 'expand-line') && String(p.frame || p.n || '').length > 34)
            || (p.kind === 'order' && (p.nums || []).length >= 5)
            || (p.kind === 'estimate' && ctx.size === 'L' && String(p.expr || '').length > 11);
        // A long word-name list is ONE column, never measured into two: squeezed, every name wraps
        // to three lines and a page holds one item beside an empty column. Its height is the
        // numeral plus four one-line names.
        if (p.kind === 'word-choice' && wide) {
            return { wMm: 186, hMm: { S: 62, M: 70, L: 80 }[ctx.size] || 80, measure: false, factLike: false, maxCols: 1 };
        }
        // A full-width mat (three or more zones) or scale line takes one row more at size S than at
        // M and L (5 against 4: the smaller drawing buys a row, LESSONS L1). At S it is the 'wide'
        // class (5 rows); at M and L the one-column grid (4 rows) - 'wide' there would drop L to 3
        // rows and leave a third of every cell empty (L2).
        const fclass = ctx.size === 'S' && wide && (p.kind === 'scale' || ((p.kind === 'disks' || p.kind === 'build') && (p.places || []).length >= 3)) ? 'wide'
            : undefined;
        // A plain rounding cell stacks its line under the number on purpose when the column is
        // narrow (the render keeps "4,683 →" whole): that is not a collapse (measureItems' reflow).
        const restacks = (p.kind === 'round' && p.support === 'none' && nd >= 5) || p.kind === 'round-multi';
        return { wMm: wide ? 186 : 93, hMm: null, measure: true, factLike: false, maxCols: wide ? 1 : 2, ...(fclass ? { fclass } : {}), ...(restacks ? { restacks } : {}) };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'line', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout(p) {
        const wide = p && (p.kind === 'sort' || p.kind === 'disks' || p.kind === 'build' || p.kind === 'table' || p.kind === 'line-mark' || p.kind === 'scale'
            || p.kind === 'chart' || p.support === 'line');
        return { card: wide ? 'card-wide-visual' : 'card-simple', checker: 'value' };
    },
});
