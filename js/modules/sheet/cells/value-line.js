// js/modules/sheet/cells/value-line.js
// ONE drawing of a "read the marked number" line, for paper and screen (RP-2): number_line_int
// when the teacher chooses "Numbers on the line" (O6 appearance, lane AP3, 2026-09-25).
//
//              ●                       <- the marked number: a solid 2.5 mm dot (RP-51)
//   ←──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──→
//     −10          0             10     <- the numerals line-labels.js chose; never the dot's (RP-1)
//
// A tick at every whole number, heavier and taller every 5th (RP-50: labelled / whole ticks 5 mm
// at 1.5 pt, part ticks 3 mm at 0.75 pt), arrowheads at both ends (the line runs through 0),
// numerals below at the zone-label size. The line is 150 mm at every size, so a 20-unit window
// has a 7.5 mm pitch (RP-51 wants 6 / 7 / 8 mm where a pupil works on the line; the pupil reads
// this one). Drawn in millimetres, sized in mm: print is exact, the screen keeps proportions.
//
// Pure module (SCC-01).

import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);
const HAIR = (0.75 * PT_MM).toFixed(3);
const LABEL_PT = { S: 9, M: 10, L: 12 };
const LINE_MM = 150;
const f2 = (v) => Number(v).toFixed(2);
const neg = (v) => (v < 0 ? `−${-v}` : String(v));

/**
 * @param {{min: number, max: number, labels: number[], mark: number, size?: 'S'|'M'|'L'}} p
 *   labels  the VALUES that carry a numeral (the mark's value is never written)
 * @returns {{svg: string, wMm: number, hMm: number}}
 */
export function valueLineSVG(p) {
    const min = Math.round(Number(p.min)), max = Math.round(Number(p.max));
    const units = Math.max(1, max - min);
    const pitch = LINE_MM / units;
    const lab = (LABEL_PT[p.size] || LABEL_PT.M) * PT_MM;
    const x0 = 7, y = 7;
    const X = (v) => x0 + (v - min) * pitch;
    const W = LINE_MM + 14, H = y + 3 + lab * 1.3 + 1.5;
    const mark = Math.round(Number(p.mark));
    const shown = new Set((p.labels || []).map((v) => Math.round(Number(v))));
    shown.delete(mark);
    let body = `<line x1="${f2(x0 - 4)}" y1="${y}" x2="${f2(X(max) + 4)}" y2="${y}" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    body += `<path d="M${f2(X(max) + 6)} ${y} l-2.6 -1.4 v2.8 z" fill="${INK.ink}"/>`;
    body += `<path d="M${f2(x0 - 6)} ${y} l2.6 -1.4 v2.8 z" fill="${INK.ink}"/>`;
    for (let v = min; v <= max; v++) {
        const major = v % 5 === 0;
        const t = major ? 2.5 : 1.5;
        body += `<line x1="${f2(X(v))}" y1="${f2(y - t)}" x2="${f2(X(v))}" y2="${f2(y + t)}" stroke="${INK.ink}" stroke-width="${major ? HEAVY : HAIR}" data-vl-v="${v}"/>`;
        if (shown.has(v)) {
            body += `<text x="${f2(X(v))}" y="${f2(y + 3 + lab)}" text-anchor="middle" font-size="${f2(lab)}" `
                + `font-family="Andika, sans-serif" fill="${INK.ink}">${neg(v)}</text>`;
        }
    }
    body += `<circle cx="${f2(X(mark))}" cy="${y}" r="1.25" fill="${INK.ink}" data-vl-mark="1"/>`;
    const svg = `<svg class="mq-value-line" viewBox="0 0 ${f2(W)} ${f2(H)}" width="${f2(W)}mm" height="${f2(H)}mm" role="img" `
        + `aria-label="number line from ${neg(min)} to ${neg(max)} with one number marked" `
        + `style="display:block;margin:0 auto;max-width:100%;height:auto;overflow:visible">${body}</svg>`;
    return { svg, wMm: W, hMm: H };
}

/**
 * The line at every size preset, for a legacy printed cell: its S, M and L drawings (numerals at
 * 9 / 10 / 12 pt) in one `.mq-fm` span; the sheet's preset shows its own (css/sheet-kit.css).
 */
export function valueLineSizedHTML(p) {
    const one = (sz) => valueLineSVG(Object.assign({}, p, { size: sz })).svg
        .replace('<svg class="mq-value-line"', `<svg class="mq-value-line" data-fm-size="${sz}"`);
    return `<span class="mq-fm" style="display:block;max-width:100%">${one('S')}${one('M')}${one('L')}</span>`;
}

/**
 * The 20-unit window of a read-the-line item: 0 in the middle while the mark is within 7 of it,
 * else a window on the mark's side, its ends on multiples of 5, the mark at least 3 from each end.
 */
export function valueLineWindow(mark) {
    const t = Math.round(Number(mark));
    if (Math.abs(t) <= 7) return { min: -10, max: 10 };
    if (t > 0) { const lo = 5 * Math.ceil((t + 3 - 20) / 5); return { min: lo, max: lo + 20 }; }
    const hi = 5 * Math.floor((t - 3 + 20) / 5);
    return { min: hi - 20, max: hi };
}
