// js/modules/sheet/cells/hundred-square.js
// The HUNDRED SQUARE as one whole (fractions lane, build list `vis_hundred_square`, RP-94): a
// 10 x 10 square whose columns are tenths and whose cells are hundredths. It reads 7/10 and
// 70/100 at once (7 columns shaded = 70 cells), 0.45 and 45 % (4 whole columns and 5 cells of
// the next), and it is the picture of tenths-as-hundredths (4.NF.C.5, 4.NF.C.6).
//
// Drawing (RP-94, INK-1..3): outline 1.5 pt, interior lines 0.5 pt with every 5th line 0.75 pt
// so the pupil can count in fives and tens; shaded cells flat grey, filled COLUMN BY COLUMN from
// the left, top to bottom (a tenth is a whole column), hatched with the Photocopy-safe switch
// (INK-20..22). A cell is 4 mm at S, 4.4 at M, 5 at L (RP-94's floor is 4 mm), so the square is
// 40 / 44 / 50 mm: the size of one fraction model (section 11.2).
//
// `hundredGeom({n, d, size, hatch, blank})` returns {body, wMm, hMm, aria}: the SVG body (mm,
// origin 0,0) that the frac-model cell draws as a term's model (`kind: 'hundred'`), n/d with d
// 10 or 100. A value past 1 (1 23/100) is two squares, 3 mm apart (RP-92).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { INK, HATCH } from '../tokens.js';

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);
const MID = (0.75 * PT_MM).toFixed(3);
const FINE = (0.5 * PT_MM).toFixed(3);
const GAP_MM = 3;
/** One cell's side (mm) at each size preset. */
export const HUNDRED_CELL = Object.freeze({ S: 4, M: 4.4, L: 5 });

const f2 = (v) => Number(v).toFixed(2);
let SEQ = 0;

/** How many hundredths n/d is (d 10 or 100; any other d is read as hundredths of its value). */
export function hundredthsOf(n, d) {
    const N = Number(n) || 0, D = Number(d) || 100;
    return Math.max(0, Math.round((N * 100) / D));
}

/**
 * The SVG body of one value as hundred squares.
 * @param {{n: number, d: number, w?: number, size?: string, hatch?: boolean, blank?: boolean, cellMm?: number}} p
 */
export function hundredGeom(p) {
    const size = HUNDRED_CELL[p.size] ? p.size : 'L';
    const c = Number(p.cellMm) > 0 ? Number(p.cellMm) : HUNDRED_CELL[size];
    const side = 10 * c;
    const total = hundredthsOf((Number(p.w) || 0) * (Number(p.d) || 100) + (Number(p.n) || 0), p.d);
    const squares = Math.max(1, Number(p.squares) || Math.ceil(total / 100) || 1);
    const shade = p.blank ? 0 : total;
    let body = '';
    for (let s = 0; s < squares; s++) {
        const ox = 0.5 + s * (side + GAP_MM), oy = 0.5;
        const here = Math.max(0, Math.min(100, shade - s * 100));
        // shaded cells: whole columns first, then the part-column from the top (column-major)
        const full = Math.floor(here / 10), rest = here % 10;
        let grey = '';
        if (full) grey += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(full * c)}" height="${f2(side)}"/>`;
        if (rest) grey += `<rect x="${f2(ox + full * c)}" y="${f2(oy)}" width="${f2(c)}" height="${f2(rest * c)}"/>`;
        if (grey) {
            if (p.hatch) {
                const id = `hsq${++SEQ}`;
                const w = (HATCH.pt * PT_MM).toFixed(3);
                let lines = '';
                for (let t = -side; t < side; t += HATCH.pitchMm) {
                    lines += `<line x1="${f2(ox + t)}" y1="${f2(oy + side)}" x2="${f2(ox + t + side)}" y2="${f2(oy)}" stroke="${INK.ink}" stroke-width="${w}"/>`;
                }
                body += `<clipPath id="${id}">${grey}</clipPath><g clip-path="url(#${id})" data-ws-hatch="1">${lines}</g>`;
            } else {
                body += `<g fill="${INK.grey}" stroke="none">${grey}</g>`;
            }
        }
        // the grid: fine lines, every 5th a little heavier, the outline heavy
        for (let k = 1; k < 10; k++) {
            const sw = k === 5 ? MID : FINE;
            body += `<line x1="${f2(ox + k * c)}" y1="${f2(oy)}" x2="${f2(ox + k * c)}" y2="${f2(oy + side)}" stroke="${INK.ink}" stroke-width="${sw}"/>`;
            body += `<line x1="${f2(ox)}" y1="${f2(oy + k * c)}" x2="${f2(ox + side)}" y2="${f2(oy + k * c)}" stroke="${INK.ink}" stroke-width="${sw}"/>`;
        }
        body += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(side)}" height="${f2(side)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    }
    const wMm = squares * side + (squares - 1) * GAP_MM + 1, hMm = side + 1;
    // the picture is the question: the label names it and never counts it (RUBRIC C2)
    const aria = squares > 1 ? `${squares} hundred squares` : 'hundred square';
    return { body, wMm, hMm, aria };
}
