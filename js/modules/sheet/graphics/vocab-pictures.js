// js/modules/sheet/graphics/vocab-pictures.js
// Library entries: THE VOCABULARY PICTURES (design/GRAPHIC_LIBRARY.md "Vocabulary pictures";
// design/cards/vocabulary/vocabulary.md §3; owner design 2026-10-25, IMPROVEMENT_PLAN "Vocabulary
// redesign and the graphic library").
//
// ONE shared set: the same drawing of a word serves the vocabulary page that opens a lesson AND the
// vocabulary practice skills (Match 3 pictures, 1 picture 3 words), on paper and in the screen twin.
//
// Every picture is drawn ONCE on a 60 x 40 canvas (3 : 2) and scaled to the width the cell gives it
// (`wMm`); strokes are written in CSS px with `vector-effect: non-scaling-stroke`, so a stroke is
// the same weight at every width (structure 1.5 pt = 2 px, parts 1 pt = 1.333 px, fine 0.75 pt =
// 1 px: the closed ladder, INK-10). Black ink on white, no fill colour, no grey (INK-1); numbers and
// words in Andika with proportional digits (VQ-5). A picture NEVER prints its own word (a picture
// that showed "step" would give the answer away, L-LEAK): it shows the idea.
//
// The rules a picture keeps (card §3): one idea a picture, the part the word names is the ONE heavy
// (1.5 pt) mark (a ring, a box, an outline); everything else is 1 pt or 0.75 pt; at least 3 mm
// between marks at the smallest approved width (34 mm); text at least 5.8 canvas units (about 9.5 pt at the smallest
// width, 34 mm; 11 pt at 40 mm, 15 pt at 56 mm). Two words whose pictures could be read the same way list each other in
// `notWith` (vocab-words.js), so they are never offered together.
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { L, esc, isTwin } from './units.js';

/** The canvas every picture is drawn on (units), and the approved widths (mm). */
export const PIC_CANVAS = Object.freeze({ w: 60, h: 40 });
export const PIC_WIDTHS = Object.freeze({ min: 34, max: 82 });

/* ------------------------------------------------------------------ drawing helpers (canvas units) */

const W = { heavy: 2, part: 1.333, fine: 1 };          // px, non-scaling (1.5 / 1 / 0.75 pt)
const NS = 'vector-effect="non-scaling-stroke"';
const r2 = (v) => Math.round(v * 100) / 100;
const ln = (x1, y1, x2, y2, w = W.part, extra = '') => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="#000" stroke-width="${w}" ${NS} stroke-linecap="round"${extra}/>`;
const rect = (x, y, w, h, sw = W.part, rx = 0) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"${rx ? ` rx="${rx}"` : ''} fill="none" stroke="#000" stroke-width="${sw}" ${NS}/>`;
const dot = (x, y, r = 1.7) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="#000"/>`;
const ring = (x, y, r, sw = W.part) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="none" stroke="#000" stroke-width="${sw}" ${NS}/>`;
const oval = (x, y, w, h, sw = W.part) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(Math.min(w, h) / 2)}" fill="none" stroke="#000" stroke-width="${sw}" ${NS}/>`;
const tx = (x, y, s, t, { size = 6, weight = 700, anchor = 'middle' } = {}) => `<text x="${r2(x)}" y="${r2(y)}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="central">${esc(t)}</text>`;
/** An arrow from (x1, y1) to (x2, y2), its head a small filled triangle. */
function arrow(x1, y1, x2, y2, w = W.part) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 2.4, s = 1.4;
    const bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a);
    const p1 = [bx + s * Math.sin(a), by - s * Math.cos(a)], p2 = [bx - s * Math.sin(a), by + s * Math.cos(a)];
    return ln(x1, y1, bx, by, w) + `<path d="M${r2(x2)} ${r2(y2)} L${r2(p1[0])} ${r2(p1[1])} L${r2(p2[0])} ${r2(p2[1])} Z" fill="#000"/>`;
}
/** A hop arc over a line, from x1 to x2 at baseline y, with an arrow head at x2. */
function hop(x1, x2, y, hgt = 5) {
    const mx = (x1 + x2) / 2;
    return `<path d="M${r2(x1)} ${r2(y)} Q${r2(mx)} ${r2(y - hgt * 2)} ${r2(x2)} ${r2(y)}" fill="none" stroke="#000" stroke-width="${W.part}" ${NS}/>`
        + `<path d="M${r2(x2)} ${r2(y)} l-2.2 -1.6 l0.5 2.6 Z" fill="#000"/>`;
}
/** A hop arc going BACK (right to left), its head at x2. */
function hopBack(x1, x2, y, hgt = 5) {
    const mx = (x1 + x2) / 2;
    return `<path d="M${r2(x1)} ${r2(y)} Q${r2(mx)} ${r2(y - hgt * 2)} ${r2(x2)} ${r2(y)}" fill="none" stroke="#000" stroke-width="${W.part}" ${NS}/>`
        + `<path d="M${r2(x2)} ${r2(y)} l2.2 -1.6 l-0.5 2.6 Z" fill="#000"/>`;
}
/** A cross through a drawn object (taken away). */
const cross = (x, y, r) => ln(x - r, y - r, x + r, y + r, W.heavy) + ln(x - r, y + r, x + r, y - r, W.heavy);
/** A row of number cells (a track): values; `mark` = index of the heavy cell. */
function track(values, { x0 = 3, y = 15, cw = 13.5, ch = 11, mark = -1, size = 6 } = {}) {
    let b = '';
    values.forEach((v, i) => {
        b += rect(x0 + i * cw, y, cw, ch, i === mark ? W.heavy : W.part);
        if (v !== '' && v !== null) b += tx(x0 + i * cw + cw / 2, y + ch / 2, 0, String(v), { size });
    });
    return b;
}
/** A small table grid (rows of values); `outline` {row} | {col} drawn heavy. */
function table(rows, { x0, y0, cw, ch, size = 5, outline = null, head = false }) {
    let b = '';
    rows.forEach((r, i) => r.forEach((v, j) => {
        b += rect(x0 + j * cw, y0 + i * ch, cw, ch, W.fine);
        b += tx(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2, 0, String(v), { size, weight: head && i === 0 ? 700 : 400 });
    }));
    if (outline && outline.row !== undefined) b += rect(x0 - 0.6, y0 + outline.row * ch - 0.6, rows[0].length * cw + 1.2, ch + 1.2, W.heavy, 1);
    if (outline && outline.col !== undefined) b += rect(x0 + outline.col * cw - 0.6, y0 - 0.6, cw + 1.2, rows.length * ch + 1.2, W.heavy, 1);
    return b;
}
/** A dot array rows x cols at pitch p, top-left (x0, y0). */
function dots(rows, cols, x0, y0, p = 5.5, r = 1.6) {
    let b = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) b += dot(x0 + j * p, y0 + i * p, r);
    return b;
}
/** A unit cube outline (side u) at (x, y). */
const cube = (x, y, u) => rect(x, y, u, u, W.part);
/** A ten rod: 10 unit cells, vertical. */
function rod(x, y, u) {
    let b = rect(x, y, u, u * 10, W.part);
    for (let j = 1; j < 10; j++) b += ln(x, y + u * j, x + u, y + u * j, W.fine);
    return b;
}
/** Number-line axis from x1 to x2 with ticks at the given positions. */
function axis(x1, x2, y, ticks) {
    let b = ln(x1, y, x2, y, W.heavy);
    for (const t of ticks) b += ln(t, y - 1.8, t, y + 1.8, W.part);
    return b;
}

/* ------------------------------------------------------------------------------ the pictures
 * Each entry: (o) => svg body on the 60 x 40 canvas. `alt` is the screen reader's description
 * (it never names the word either). Grouped by the BUILD lesson that first needs them.
 */
const PICS = {
    /* ---- Grade 3: multiplication table patterns (3.OA.D.9, 3.OA.C.7) */
    even: {
        alt: 'six dots in three pairs, none left over',
        draw: () => [0, 1, 2].map((i) => { const x = 14 + i * 16; return oval(x - 4.5, 8, 9, 24, W.part) + dot(x, 14) + dot(x, 26); }).join(''),
    },
    odd: {
        alt: 'seven dots: three pairs and one dot on its own',
        draw: () => [0, 1, 2].map((i) => { const x = 9 + i * 13; return oval(x - 4.5, 8, 9, 24, W.part) + dot(x, 14) + dot(x, 26); }).join('') + dot(50, 20, 1.9) + ring(50, 20, 4.2, W.heavy),
    },
    product: {
        alt: 'four times three equals twelve, the twelve in a box',
        draw: () => tx(8, 20, 0, '4', { size: 8 }) + tx(16, 20, 0, '×', { size: 8 }) + tx(24, 20, 0, '3', { size: 8 }) + tx(32, 20, 0, '=', { size: 8 })
            + rect(37.5, 12, 15, 16, W.heavy) + tx(45, 20, 0, '12', { size: 8 }),
    },
    factor: {
        alt: 'four times three equals twelve, the four and the three in boxes',
        draw: () => rect(3, 12, 11, 16, W.heavy) + tx(8.5, 20, 0, '4', { size: 8 }) + tx(18.5, 20, 0, '×', { size: 8 })
            + rect(23, 12, 11, 16, W.heavy) + tx(28.5, 20, 0, '3', { size: 8 }) + tx(38, 20, 0, '=', { size: 8 }) + tx(48, 20, 0, '12', { size: 8 }),
    },
    row: {
        alt: 'a times table, one line across it drawn round',
        draw: () => table([[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [3, 6, 9, 12, 15]], { x0: 4, y0: 5, cw: 10.4, ch: 10, size: 6.2, outline: { row: 1 } }),
    },
    column: {
        alt: 'a times table, one line down it drawn round',
        draw: () => table([[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [3, 6, 9, 12, 15]], { x0: 4, y0: 5, cw: 10.4, ch: 10, size: 6.2, outline: { col: 2 } }),
    },
    multiple: {
        alt: 'a number line from 0 to 12, hops of three landing on 3, 6, 9 and 12',
        draw: () => {
            const X = (v) => 6 + v * 4;
            let b = axis(X(0), X(12), 26, Array.from({ length: 13 }, (_, i) => X(i)));
            for (const v of [3, 6, 9, 12]) b += hop(X(v - 3), X(v), 24, 5) + dot(X(v), 26, 1.5) + tx(X(v), 33.5, 0, String(v), { size: 6.4 });
            return b + tx(X(0), 33.5, 0, '0', { size: 6.4, weight: 400 });
        },
    },
    /* ---- Grade 3: input-output tables (3.OA.D.9) */
    input: {
        alt: 'an In and Out table, the In side drawn round',
        draw: () => table([['In', 'Out'], [2, 5], [4, 7], [6, 9]], { x0: 14, y0: 2, cw: 16, ch: 9, size: 6.6, head: true, outline: { col: 0 } }),
    },
    output: {
        alt: 'an In and Out table, the Out side drawn round',
        draw: () => table([['In', 'Out'], [2, 5], [4, 7], [6, 9]], { x0: 14, y0: 2, cw: 16, ch: 9, size: 6.6, head: true, outline: { col: 1 } }),
    },
    rule: {
        alt: 'two goes in, add three, five comes out; the add three in a box',
        draw: () => tx(6, 20, 0, '2', { size: 8 }) + arrow(10, 20, 18, 20) + rect(19, 12.5, 20, 15, W.heavy) + tx(29, 20, 0, '+ 3', { size: 7 })
            + arrow(40, 20, 48, 20) + tx(53, 20, 0, '5', { size: 8 }),
    },
    pattern: {
        alt: 'two, four, six, eight, each one two more, with a hop of plus two between',
        draw: () => {
            let b = '';
            [2, 4, 6, 8].forEach((v, i) => { b += tx(8 + i * 13, 28, 0, String(v), { size: 7.5 }); if (i) b += hop(8 + (i - 1) * 13 + 2, 8 + i * 13 - 2, 22, 4) + tx(8 + (i - 0.5) * 13, 10, 0, '+2', { size: 6, weight: 400 }); });
            return b + tx(55, 28, 0, '…', { size: 7 });
        },
    },
    /* ---- Grade 3: properties of multiplication (3.OA.B.5) */
    array: {
        alt: 'three rows of four dots in a rectangle',
        draw: () => dots(3, 4, 17.5, 9, 8.3, 2),
    },
    commutative: {
        alt: 'two rows of three dots turned to make three rows of two dots; two times three, three times two',
        draw: () => dots(2, 3, 6, 9, 5.5) + arrow(23, 13, 33, 13) + dots(3, 2, 38, 6.5, 5.5)
            + tx(30, 33.5, 0, '2 × 3 = 3 × 2', { size: 6.8 }),
    },
    identity: {
        alt: 'five rings with one dot in each: five times one is five',
        draw: () => [0, 1, 2, 3, 4].map((i) => ring(8 + i * 11, 14, 4.2, W.part) + dot(8 + i * 11, 14)).join('') + tx(30, 32.5, 0, '5 × 1 = 5', { size: 7 }),
    },
    distributive: {
        alt: 'three rows of seven dots split by a line into three by five and three by two',
        draw: () => dots(3, 7, 7, 7, 5.6) + ln(7 + 4.5 * 5.6 - 0.1, 3, 7 + 4.5 * 5.6 - 0.1, 22.5, W.heavy)
            + tx(30, 33.5, 0, '3 × 5 + 3 × 2', { size: 6.8 }),
    },
    /* ---- Grade 3: two-step word problems (3.OA.D.8) */
    step: {
        alt: 'a box marked 1 with an arrow to a box marked 2',
        draw: () => {
            const boxAt = (x, n) => rect(x, 9, 20, 22, W.part) + ring(x + 5, 14, 4, W.heavy) + tx(x + 5, 14, 0, String(n), { size: 6 })
                + ln(x + 3.5, 21, x + 16.5, 21, W.fine) + ln(x + 3.5, 26, x + 16.5, 26, W.fine);
            return boxAt(5, 1) + arrow(26.5, 20, 33.5, 20) + boxAt(35, 2);
        },
    },
    total: {
        alt: 'a bar of 5 and 3 with a longer bar over both marked with a question mark',
        draw: () => rect(6, 6, 48, 11, W.heavy) + tx(30, 11.5, 0, '?', { size: 7 })
            + rect(6, 21, 30, 11, W.part) + tx(21, 26.5, 0, '5', { size: 6.5 }) + rect(36, 21, 18, 11, W.part) + tx(45, 26.5, 0, '3', { size: 6.5 }),
    },
    left: {
        alt: 'seven circles, three of them crossed out',
        draw: () => {
            let b = '';
            for (let i = 0; i < 7; i++) { const x = 6 + i * 8; b += ring(x, 20, 2.6, W.part); if (i >= 4) b += cross(x, 20, 2.7); }
            return b;
        },
    },
    'equal groups': {
        alt: 'three circles, each with four dots',
        draw: () => [0, 1, 2].map((i) => { const x = 11 + i * 19; return ring(x, 20, 8, W.part) + dots(2, 2, x - 2.8, 17.2, 5.6, 1.6); }).join(''),
    },
    unknown: {
        alt: 'eight plus a box with a question mark equals thirteen',
        draw: () => tx(7, 20, 0, '8', { size: 8 }) + tx(15, 20, 0, '+', { size: 8 }) + rect(20, 12, 13, 16, W.heavy) + tx(26.5, 20, 0, '?', { size: 8 })
            + tx(39, 20, 0, '=', { size: 8 }) + tx(50, 20, 0, '13', { size: 8 }),
    },
    /* ---- Grade 1: count on to 120 (1.NBT.A.1) */
    'count on': {
        alt: 'a number track 112, 113, 114, 115 with hops going forward',
        draw: () => track([112, 113, 114, 115], { x0: 3, y: 18, cw: 13.5, ch: 12, size: 6.2 }) + hop(9.75, 23.25, 16, 4) + hop(23.25, 36.75, 16, 4) + hop(36.75, 50.25, 16, 4),
    },
    'one more': {
        alt: 'four dots, an arrow, then five dots with the new dot in a ring',
        draw: () => dots(1, 4, 5, 20, 5.2, 1.7) + arrow(23.5, 20, 31.5, 20) + dots(1, 5, 35.5, 20, 5.2, 1.7) + ring(35.5 + 4 * 5.2, 20, 3.4, W.heavy),
    },
    'one less': {
        alt: 'six dots, one of them crossed out',
        draw: () => { let b = ''; for (let i = 0; i < 6; i++) { b += dot(8 + i * 8.8, 20, 2); } return b + cross(8 + 5 * 8.8, 20, 3.4); },
    },
    before: {
        alt: 'a number track 104, 105, 106: an arrow from 105 back to 104, the 104 in a heavy box',
        draw: () => track([104, 105, 106], { x0: 7, y: 18, cw: 15.3, ch: 12, mark: 0, size: 7 }) + hopBack(29.95, 14.65, 16, 4.5),
    },
    after: {
        alt: 'a number track 104, 105, 106: an arrow from 105 on to 106, the 106 in a heavy box',
        draw: () => track([104, 105, 106], { x0: 7, y: 18, cw: 15.3, ch: 12, mark: 2, size: 7 }) + hop(29.95, 45.25, 16, 4.5),
    },
    'hundred chart': {
        alt: 'two rows of a number chart: 101 to 104 and 111 to 114, each number ten more than the one above',
        draw: () => table([[101, 102, 103, 104], [111, 112, 113, 114]], { x0: 3, y0: 8, cw: 13.5, ch: 12, size: 6.2 }),
    },
    /* ---- Grade 2: read and write numbers to 1,000 (2.NBT.A.3) */
    hundred: {
        alt: 'a flat square of ten by ten small squares',
        draw: () => { const u = 3.3, x = 13.5, y = 3.5; let b = rect(x, y, u * 10, u * 10, W.part); for (let j = 1; j < 10; j++) b += ln(x, y + u * j, x + u * 10, y + u * j, W.fine) + ln(x + u * j, y, x + u * j, y + u * 10, W.fine); return b; },
    },
    ten: {
        alt: 'a rod of 10 small squares in a line',
        draw: () => rod(28, 3.5, 3.3),
    },
    one: {
        alt: 'a single small square',
        draw: () => cube(24, 14, 12),
    },
    digit: {
        alt: 'one large figure seven',
        draw: () => tx(30, 21, 0, '7', { size: 26 }),
    },
    'expanded form': {
        alt: '300 plus 40 plus 7',
        draw: () => tx(30, 20, 0, '300 + 40 + 7', { size: 7.6 }),
    },
    'number name': {
        alt: 'three hundred forty-seven written in words',
        draw: () => tx(30, 14, 0, 'three hundred', { size: 6.4, weight: 400 }) + tx(30, 26, 0, 'forty-seven', { size: 6.4, weight: 400 }),
    },
    /* ---- Grade 4: number and shape patterns (4.OA.C.5) */
    'ones digit': {
        alt: 'the number 473 with the 3 in a heavy box',
        draw: () => tx(16, 20, 0, '4', { size: 13 }) + tx(26, 20, 0, '7', { size: 13 }) + rect(31, 9, 13, 22, W.heavy) + tx(37.5, 20, 0, '3', { size: 13 }),
    },
    repeat: {
        alt: '2, 4, 8, 6 then 2, 4, 8, 6 again, each set of four bracketed underneath',
        draw: () => {
            let b = '';
            [2, 4, 8, 6, 2, 4, 8, 6].forEach((v, i) => { b += tx(5 + i * 6.8, 15, 0, String(v), { size: 7 }); });
            const br = (x1, x2) => `<path d="M${x1} 21 V25 H${x2} V21" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/>`;
            return b + br(2.5, 28) + br(29.7, 55.2);
        },
    },
    sequence: {
        alt: '5, 10, 15, 20 and so on, numbers in order with commas',
        draw: () => tx(30, 20, 0, '5, 10, 15, 20, …', { size: 7 }),
    },
    cycle: {
        alt: 'four numbers 2, 4, 8, 6 in a ring of arrows going round and back to the start',
        draw: () => {
            const c = [30, 20], R = 12.5, pts = [[30, 7.5], [43.5, 20], [30, 32.5], [16.5, 20]];
            let b = [2, 4, 8, 6].map((v, i) => tx(pts[i][0], pts[i][1], 0, String(v), { size: 6.4 })).join('');
            for (let i = 0; i < 4; i++) {
                const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.42, a1 = a0 + Math.PI / 2 - 0.84;
                const p0 = [c[0] + R * Math.cos(a0), c[1] + R * Math.sin(a0)], p1 = [c[0] + R * Math.cos(a1), c[1] + R * Math.sin(a1)];
                b += `<path d="M${r2(p0[0])} ${r2(p0[1])} A${R} ${R} 0 0 1 ${r2(p1[0])} ${r2(p1[1])}" fill="none" stroke="#000" stroke-width="${W.part}" ${NS}/>`;
                const t = a1 + Math.PI / 2, hx = p1[0], hy = p1[1];
                b += `<path d="M${r2(hx + 2.2 * Math.cos(t))} ${r2(hy + 2.2 * Math.sin(t))} L${r2(hx - 1.3 * Math.cos(a1))} ${r2(hy - 1.3 * Math.sin(a1))} L${r2(hx + 1.3 * Math.cos(a1))} ${r2(hy + 1.3 * Math.sin(a1))} Z" fill="#000"/>`;
            }
            return b;
        },
    },
    grow: {
        alt: 'three shapes made of squares: one square, then three, then five, each one bigger',
        draw: () => {
            const u = 5.6; let b = '';
            const fig = (x0, n) => { let s = ''; for (let i = 0; i < n; i++) s += cube(x0 + i * u, 30 - u, u); for (let i = 1; i < n; i++) s += cube(x0 + (n - 1) * u, 30 - u * (i + 1), u); return s; };
            b += fig(4, 1) + fig(15, 2) + fig(33, 3);
            return b + ln(3, 30.8, 57, 30.8, W.fine);
        },
    },
    term: {
        alt: 'three numbers in order, 4, 7, 10; the 7 in a heavy box',
        draw: () => tx(10, 20, 0, '4,', { size: 8 }) + rect(19.5, 11.5, 15, 17, W.heavy) + tx(27, 20, 0, '7', { size: 8 }) + tx(37, 20, 0, ',', { size: 8 }) + tx(47, 20, 0, '10', { size: 8 }),
    },
    'first term': {
        alt: '3, 7, 11, 15: the 3 at the start in a heavy box',
        draw: () => rect(3, 11.5, 12, 17, W.heavy) + tx(9, 20, 0, '3', { size: 7.5 }) + tx(16, 20, 0, ', 7, 11, 15', { size: 7.5, anchor: 'start' }),
    },
    /* ---- Grade 4: multiplicative comparison (4.OA.A.1) */
    'times as many': {
        alt: 'a short bar of one part and a bar three times as long, of three equal parts',
        draw: () => rect(6, 7, 14, 10, W.part) + [0, 1, 2].map((i) => rect(6 + i * 14, 23, 14, 10, W.part)).join('')
            + `<path d="M6 36 V37.5 H48 V36" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/>` + tx(54.5, 28, 0, '×3', { size: 6.4 }),
    },
    compare: {
        alt: 'a long bar over a short bar, a double arrow from the end of the short bar to the end of the long one',
        draw: () => rect(6, 6, 44, 10, W.part) + rect(6, 22, 26, 10, W.part) + ln(50, 16, 50, 34, W.fine)
            + `<path d="M34.6 27 H47.4" stroke="#000" stroke-width="${W.heavy}" ${NS}/><path d="M50 27 l-2.8 -1.7 v3.4 Z M32 27 l2.8 -1.7 v3.4 Z" fill="#000"/>`,
    },
    equation: {
        alt: 'twelve equals three times four',
        draw: () => tx(30, 20, 0, '12 = 3 × 4', { size: 8.5 }),
    },
    /* ---- Grade 4: division and the remainder (4.OA.A.3) */
    remainder: {
        alt: 'thirteen dots: three rings of four and one dot left over, in a heavy ring',
        draw: () => [0, 1, 2].map((i) => { const x = 10 + i * 15; return ring(x, 20, 6.3, W.part) + dots(2, 2, x - 2.4, 17.6, 4.8, 1.4); }).join('') + dot(52, 20, 1.5) + ring(52, 20, 3.6, W.heavy),
    },
    quotient: {
        alt: 'thirteen divided by four equals three remainder one, the three in a heavy box',
        draw: () => tx(15, 20, 0, '13 ÷ 4 =', { size: 6.6 }) + rect(31.5, 12.5, 10, 15, W.heavy) + tx(36.5, 20, 0, '3', { size: 6.6 }) + tx(49, 20, 0, 'R 1', { size: 6.6 }),
    },
    divisor: {
        alt: 'thirteen divided by four, the four in a heavy box',
        draw: () => tx(16, 20, 0, '13', { size: 8 }) + tx(27, 20, 0, '÷', { size: 8 }) + rect(33, 12, 12, 16, W.heavy) + tx(39, 20, 0, '4', { size: 8 }),
    },
    dividend: {
        alt: 'thirteen divided by four, the thirteen in a heavy box',
        draw: () => rect(7, 12, 18, 16, W.heavy) + tx(16, 20, 0, '13', { size: 8 }) + tx(31, 20, 0, '÷', { size: 8 }) + tx(41, 20, 0, '4', { size: 8 }),
    },
    'round up': {
        alt: 'four boxes: three full with four dots each, the last with one dot',
        draw: () => {
            let b = '';
            for (let i = 0; i < 4; i++) { const x = 4 + i * 13.5; b += rect(x, 12, 11, 16, i === 3 ? W.heavy : W.part); if (i < 3) b += dots(2, 2, x + 3.2, 16.8, 4.6, 1.4); else b += dot(x + 5.5, 20, 1.4); }
            return b;
        },
    },
};

/** The ids (words) the library draws. */
export const VOCAB_PICTURE_IDS = Object.freeze(Object.keys(PICS));
/** Does the library have a picture of this word? */
export const hasVocabPicture = (id) => Object.prototype.hasOwnProperty.call(PICS, String(id));
/** A picture's screen-reader description (never its word). */
export const vocabPictureAlt = (id) => (hasVocabPicture(id) ? PICS[id].alt : '');

/**
 * The picture of a word, `wMm` wide (34-82 mm), 2 : 3 tall. In the screen twin the same drawing at
 * the host's --mq-k2 scale (one drawing, two scales, SP-1).
 * @returns {string} an inline SVG ('' for a word the library has no picture of)
 */
export function vocabPictureSVG(ctx, id, { wMm = 46 } = {}) {
    if (!hasVocabPicture(id)) return '';
    const w = Math.max(PIC_WIDTHS.min, Math.min(PIC_WIDTHS.max, Number(wMm) || 46));
    const body = PICS[id].draw();
    const size = isTwin(ctx) ? `width:${L(ctx, w)};max-width:100%;height:auto;` : `width:${r2(w)}mm;height:${r2((w * PIC_CANVAS.h) / PIC_CANVAS.w)}mm;`;
    return `<svg class="mq-vpic" data-vpic="${esc(id)}" viewBox="0 0 ${PIC_CANVAS.w} ${PIC_CANVAS.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(PICS[id].alt)}"`
        + ` style="display:block;${size}overflow:visible;font-family:'Andika','Open Sans',sans-serif;font-feature-settings:'cv04' 1;font-variant-numeric:lining-nums proportional-nums;" fill="#000">${body}</svg>`;
}

export default { PIC_CANVAS, PIC_WIDTHS, VOCAB_PICTURE_IDS, hasVocabPicture, vocabPictureAlt, vocabPictureSVG };
