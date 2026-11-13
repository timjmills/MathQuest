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

import { L, esc, isTwin, GREY } from './units.js';
import { vocabWordsReading as readingsOf } from '../lesson-pages/vocab-words.js';

/** The canvas every picture is drawn on (units), and the approved widths (mm). */
export const PIC_CANVAS = Object.freeze({ w: 60, h: 40 });
export const PIC_WIDTHS = Object.freeze({ min: 34, max: 82 });

/* ------------------------------------------------------------------ drawing helpers (canvas units) */

const W = { heavy: 2, part: 1.333, fine: 1 };          // px, non-scaling (1.5 / 1 / 0.75 pt)
const NS = 'vector-effect="non-scaling-stroke"';
/** The base-ten unit square (canvas units) and the pictures drawn on it, scaled as one set (critic r3 #8). */
const BASE10_U = 5;
export const BASE10_IDS = Object.freeze(['one', 'ten', 'hundred']);
const r2 = (v) => Math.round(v * 100) / 100;
const ln = (x1, y1, x2, y2, w = W.part, extra = '') => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="#000" stroke-width="${w}" ${NS} stroke-linecap="round"${extra}/>`;
const rect = (x, y, w, h, sw = W.part, rx = 0) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"${rx ? ` rx="${rx}"` : ''} fill="none" stroke="#000" stroke-width="${sw}" ${NS}/>`;
const dot = (x, y, r = 2) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="#000"/>`;
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
/**
 * The FOCAL part (owner ruling R-1, 2026-11-09): the mark that shows the word. A picture marks it with F() in its drawing
 * (sentinels, stripped from the printed pupil page, so that page is byte-identical); a picture with no F() mark takes its
 * heavy (1.5 pt) marks, or the whole drawing when it says `focal: 'all'` (a picture that IS its idea: a digit, a flat).
 */
const F = (s) => `\u0001${s}\u0002`;
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
function dots(rows, cols, x0, y0, p = 5.5, r = 1.9) {
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
        ccss: ['2.OA.C.3', '3.OA.D.9', '4.OA.C.5'], op: 'parity',
        focal: 'all',
        alt: 'six dots in three pairs, none left over',
        draw: () => [0, 1, 2].map((i) => { const x = 14 + i * 16; return oval(x - 4.5, 8, 9, 24, W.part) + dot(x, 14) + dot(x, 26); }).join(''),
    },
    odd: {
        ccss: ['2.OA.C.3', '3.OA.D.9', '4.OA.C.5'], op: 'parity',
        alt: 'seven dots: three pairs and one dot on its own',
        draw: () => [0, 1, 2].map((i) => { const x = 9 + i * 13; return oval(x - 4.5, 8, 9, 24, W.part) + dot(x, 14) + dot(x, 26); }).join('') + dot(50, 20, 1.9) + ring(50, 20, 4.2, W.heavy),
    },
    product: {
        ccss: ['3.OA.A.1', '3.OA.B.5', '3.OA.C.7', '3.OA.D.9', '4.OA.A.1', '4.OA.A.2'], op: 'multiply',
        alt: 'four times three equals twelve, the twelve in a box',
        draw: () => tx(8, 20, 0, '4', { size: 8 }) + tx(16, 20, 0, '×', { size: 8 }) + tx(24, 20, 0, '3', { size: 8 }) + tx(32, 20, 0, '=', { size: 8 })
            + rect(37.5, 12, 15, 16, W.heavy) + tx(45, 20, 0, '12', { size: 8 }),
    },
    factor: {
        ccss: ['3.OA.A.1', '3.OA.A.4', '3.OA.B.5', '3.OA.C.7', '4.OA.A.1', '4.OA.A.2', '4.OA.B.4'], op: 'multiply',
        alt: 'four times three equals twelve, the four and the three in boxes',
        draw: () => rect(3, 12, 11, 16, W.heavy) + tx(8.5, 20, 0, '4', { size: 8 }) + tx(18.5, 20, 0, '×', { size: 8 })
            + rect(23, 12, 11, 16, W.heavy) + tx(28.5, 20, 0, '3', { size: 8 }) + tx(38, 20, 0, '=', { size: 8 }) + tx(48, 20, 0, '12', { size: 8 }),
    },
    row: {
        ccss: ['3.OA.C.7', '3.OA.D.9'], op: 'table',
        alt: 'a times table, one line across it drawn round',
        // (r13 V-NUM, critic r12 #1: the ringed row was 2, 4, 6, 8 - all even, so it read as "even"; now 3, 6, 9, 12, odd and even)
        draw: () => table([[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]], { x0: 6, y0: 3.5, cw: 12, ch: 11, size: 8, outline: { row: 2 } }),
    },
    column: {
        ccss: ['3.OA.C.7', '3.OA.D.9'], op: 'table',
        alt: 'a times table, one line down it drawn round',
        draw: () => table([[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]], { x0: 6, y0: 3.5, cw: 12, ch: 11, size: 8, outline: { col: 2 } }),
    },
    multiple: {
        ccss: ['3.OA.C.7', '3.OA.D.9', '4.OA.B.4', '4.OA.C.5'], op: 'multiply',
        alt: 'a number line from 0 to 12, hops of three landing on 3, 6, 9 and 12',
        draw: () => {
            const X = (v) => 5 + v * 4.2;
            let b = axis(X(0), X(12), 26, Array.from({ length: 13 }, (_, i) => X(i)));
            // (hops end just above the line, the landing dot on it: the arrow heads never sit on the dots - critic r1)
            for (const v of [3, 6, 9, 12]) b += hop(X(v - 3) + 0.6, X(v) - 0.6, 22.5, 6) + F(dot(X(v), 26, 2) + tx(X(v), 34, 0, String(v), { size: 8 }));
            return b + tx(X(0), 34, 0, '0', { size: 8, weight: 400 });
        },
    },
    /* ---- Grade 3: input-output tables (3.OA.D.9) */
    // (r13 V-NUM: In 2, 4 / Out 5, 7 ringed read as all even / all odd - now In 2, 3 and Out 5, 6, the rule still add 3)
    input: {
        ccss: ['3.OA.D.9', '5.OA.B.3'], op: 'io-table',
        alt: 'an In and Out table, the In side drawn round',
        draw: () => table([['In', 'Out'], [2, 5], [3, 6]], { x0: 12, y0: 3.5, cw: 18, ch: 11, size: 8.5, head: true, outline: { col: 0 } }),
    },
    output: {
        ccss: ['3.OA.D.9', '5.OA.B.3'], op: 'io-table',
        alt: 'an In and Out table, the Out side drawn round',
        draw: () => table([['In', 'Out'], [2, 5], [3, 6]], { x0: 12, y0: 3.5, cw: 18, ch: 11, size: 8.5, head: true, outline: { col: 1 } }),
    },
    rule: {
        ccss: ['3.OA.D.9', '4.OA.C.5', '5.OA.B.3'], op: 'rule',
        // (r10, critic r9 #2: the 2 -> [+3] -> 5 machine's ends ARE an input and an output; the picture now shows only what is
        // done - an arrow in, the "+3" box, an arrow out, no number at either end; V-AMBIG+ derives input / output from ends)
        alt: 'an arrow going into a box that says add three, and an arrow coming out of it; the box drawn heavy',
        draw: () => arrow(3, 20, 17, 20) + rect(18, 11, 24, 18, W.heavy) + tx(30, 20, 0, '+3', { size: 10 })
            + arrow(43, 20, 57, 20),
    },
    pattern: {
        ccss: ['3.OA.D.9', '4.OA.C.5', '5.OA.B.3'], op: 'pattern',
        alt: 'two, four, six, eight, each one two more, with a hop of plus two between',
        draw: () => {
            let b = '';
            [2, 4, 6, 8].forEach((v, i) => { b += tx(6 + i * 14, 30, 0, String(v), { size: 9 }); if (i) b += F(hop(6 + (i - 1) * 14 + 2.5, 6 + i * 14 - 2.5, 24, 4) + tx(6 + (i - 0.5) * 14, 11, 0, '+2', { size: 8, weight: 400 })); });
            // (the ellipsis starts just after the 8, inside the cropped drawing: its third dot was cut off - critic r3 "8..")
            return b + tx(51.5, 30, 0, '…', { size: 9, anchor: 'start' });
        },
    },
    /* ---- Grade 3: properties of multiplication (3.OA.B.5) */
    array: {
        ccss: ['2.OA.C.4', '3.OA.A.1', '3.OA.A.3', '3.OA.B.5'], op: 'multiply',
        focal: 'all',
        alt: 'three rows of four dots in a rectangle',
        draw: () => dots(3, 4, 17.5, 9, 8.3, 2),
    },
    commutative: {
        ccss: ['3.OA.B.5'], op: 'property',
        alt: 'two rows of three dots turned to make three rows of two dots; two times three, three times two',
        draw: () => dots(2, 3, 7, 7, 6, 2) + F(arrow(24, 11, 33, 11)) + dots(3, 2, 39, 4, 6, 2)
            + tx(30, 33, 0, '2 × 3 = 3 × 2', { size: 8 }),
    },
    identity: {
        ccss: ['3.OA.B.5'], op: 'property',
        // (r3: no ringed dot - odd, one more and remainder used it too, critic r2; a number that comes out the same)
        alt: 'five times one equals five, a heavy arrow from the first five over to the last five',
        draw: () => tx(8, 28, 0, '5', { size: 10 }) + tx(18, 28, 0, '×', { size: 10 }) + tx(28, 28, 0, '1', { size: 10 }) + tx(38, 28, 0, '=', { size: 10 })
            + tx(50, 28, 0, '5', { size: 10 })
            // (the heavy mark is the arc - the same number comes out; no box, so it never reads as product or factor)
            + `<path d="M8 21 Q29 3 49 20" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/><path d="M50 21.5 l-3.3 -0.3 l1.8 -2.6 Z" fill="#000"/>`,
    },
    distributive: {
        ccss: ['3.OA.B.5'], op: 'property',
        alt: 'three rows of seven dots split by a line into three by five and three by two',
        // (a dot's width of clear paper each side of the split line, so the two arrays read as two - critic r3)
        draw: () => dots(3, 5, 5, 5, 6, 1.9) + ln(34.7, 1.5, 34.7, 21.5, W.heavy) + dots(3, 2, 40.4, 5, 6, 1.9)
            + tx(26, 32, 0, '3 × 5 + 3 × 2', { size: 8 }),
    },
    /* ---- Grade 3: two-step word problems (3.OA.D.8) */
    step: {
        ccss: ['3.OA.D.8', '4.OA.A.3'], op: 'two-step',
        // (owner O-3, lf-vocab r8: the 1-2-3 staircase read as 'column' - now a short worked problem in two labelled steps; the
        // Step labels, each underlined heavy, are the focal part)
        alt: 'a sum worked in two parts, in order: the first line labelled 1, five plus three is eight, the second labelled 2, eight take away two is six',
        draw: () => F(tx(1, 10, 0, 'Step 1', { size: 7.8, anchor: 'start' }) + ln(1, 16, 23.5, 16, W.heavy)) + tx(59, 10, 0, '5 + 3 = 8', { size: 7.8, weight: 400, anchor: 'end' })
            + F(tx(1, 29, 0, 'Step 2', { size: 7.8, anchor: 'start' }) + ln(1, 35, 23.5, 35, W.heavy)) + tx(59, 29, 0, '8 − 2 = 6', { size: 7.8, weight: 400, anchor: 'end' }),
    },
    total: {
        ccss: ['1.OA.A.1', '2.OA.A.1', '3.OA.D.8'], op: 'add',
        alt: 'a bar of 5 and 3 with a longer bar over both marked with a question mark',
        draw: () => rect(6, 5, 48, 12, W.heavy) + tx(30, 11, 0, '?', { size: 9 })
            + rect(6, 21, 30, 12, W.part) + tx(21, 27, 0, '5', { size: 9 }) + rect(36, 21, 18, 12, W.part) + tx(45, 27, 0, '3', { size: 9 }),
    },
    left: {
        ccss: ['1.OA.A.1', '2.OA.A.1', '3.OA.D.8'], op: 'subtract',
        // (r3: circles of 7 units, about 5 mm at 40 mm - critic r2: about 3 mm)
        // (r6, critic r4 #5: the word names what STAYS, so the heavy mark is the bracket under the four circles left, in the
        // "repeat" bracket's style; the two that go are crossed out at the part weight - V21 referent)
        alt: 'six circles, two of them crossed out, the other four bracketed underneath',
        referent: [[2.2, 38.6]],
        draw: () => {
            let b = '';
            for (let i = 0; i < 6; i++) {
                const x = 6 + i * 9.6; b += ring(x, 20, 3.8, W.part);
                if (i >= 4) b += ln(x - 3.8, 16.2, x + 3.8, 23.8, W.part) + ln(x - 3.8, 23.8, x + 3.8, 16.2, W.part);
            }
            return b + `<path d="M2.2 26 V30 H38.6 V26" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/>`;
        },
    },
    'equal groups': {
        ccss: ['2.OA.C.4', '3.OA.A.1', '3.OA.A.2', '3.OA.A.3'], op: 'multiply',
        focal: 'all',
        alt: 'three circles, each with four dots',
        draw: () => [0, 1, 2].map((i) => { const x = 11 + i * 19; return ring(x, 20, 8.5, W.part) + dots(2, 2, x - 3, 17, 6, 1.9); }).join(''),
    },
    unknown: {
        ccss: ['1.OA.D.8', '3.OA.A.4', '3.OA.D.8', '4.OA.A.3'], op: 'unknown',
        alt: 'eight plus a box with a question mark equals thirteen',
        draw: () => tx(6, 20, 0, '8', { size: 9 }) + tx(14.5, 20, 0, '+', { size: 9 }) + rect(20, 12, 13, 16, W.heavy) + tx(26.5, 20, 0, '?', { size: 9 })
            + tx(39, 20, 0, '=', { size: 9 }) + tx(50, 20, 0, '13', { size: 9 }),
    },
    /* ---- Grade 1: count on to 120 (1.NBT.A.1) */
    'count on': {
        ccss: ['K.CC.A.2', '1.NBT.A.1', '1.OA.C.5'], op: 'count',
        // (r3: three cells, digits 8 units - grade 1 strips printed at 11 pt, critic r1 #17 / r2 #10)
        alt: 'a number track 113, 114, 115 with hops going forward',
        draw: () => track([113, 114, 115], { x0: 4, y: 16, cw: 17, ch: 13, size: 8.5 }) + F(hop(12.5, 29.5, 14, 4) + hop(29.5, 46.5, 14, 4)),
    },
    'one more': {
        ccss: ['K.CC.A.2', '1.NBT.A.1'], op: 'count',
        alt: 'four dots, an arrow, then five dots with the new dot in a ring',
        draw: () => dots(1, 4, 5, 20, 5.2, 1.7) + arrow(23.5, 20, 31.5, 20) + dots(1, 5, 35.5, 20, 5.2, 1.7) + ring(35.5 + 4 * 5.2, 20, 3.4, W.heavy),
    },
    'one less': {
        ccss: ['K.CC.A.2', '1.NBT.A.1'], op: 'count',
        alt: 'six dots, one of them crossed out',
        draw: () => { let b = ''; for (let i = 0; i < 6; i++) { b += dot(8 + i * 8.8, 20, 2); } return b + cross(8 + 5 * 8.8, 20, 3.4); },
    },
    before: {
        ccss: ['K.CC.A.2', '1.NBT.A.1'], op: 'count',
        alt: 'a number track 104, 105, 106: an arrow from 105 back to 104, the 104 in a heavy box',
        draw: () => track([104, 105, 106], { x0: 4, y: 16, cw: 17, ch: 13, mark: 0, size: 8.5 }) + hopBack(29.5, 12.5, 14, 4.5),
    },
    after: {
        ccss: ['K.CC.A.2', '1.NBT.A.1'], op: 'count',
        alt: 'a number track 104, 105, 106: an arrow from 105 on to 106, the 106 in a heavy box',
        draw: () => track([104, 105, 106], { x0: 4, y: 16, cw: 17, ch: 13, mark: 2, size: 8.5 }) + hop(29.5, 46.5, 14, 4.5),
    },
    'hundred chart': {
        ccss: ['1.NBT.A.1', '1.NBT.C.5', '2.NBT.A.2'], op: 'count',
        // (three rows, so it reads as a chart of rows of ten, not a two-row table - critic r1; three columns, digits 8.5 units - r3)
        // (r15, critic r14 #2: `focal: 'all'` greyed the whole chart on the key - its focal part is ONE row, the middle one, drawn
        // row by row so the pupil page is byte for byte the r14 table)
        alt: 'three rows of a number chart: 94 to 96, 104 to 106, 114 to 116, each number ten more than the one above',
        draw: () => {
            const o = { x0: 7, cw: 15.5, ch: 11, size: 8.5 };
            return table([[94, 95, 96]], { ...o, y0: 3.5 }) + F(table([[104, 105, 106]], { ...o, y0: 14.5 })) + table([[114, 115, 116]], { ...o, y0: 25.5 });
        },
    },
    /* ---- Grade 2: read and write numbers to 1,000 (2.NBT.A.3) */
    // (one, ten and hundred share ONE unit square, U canvas units, and are scaled together - BASE10_IDS, vocabPictureFit:
    // the "one" is one unit, the ten 10 units long, the hundred 10 x 10, so a pupil never sees a "one" bigger than a unit of
    // the ten - critic r3 #8 / VQ-1; ws-vocab-unit V16)
    hundred: {
        ccss: ['1.NBT.B.2', '2.NBT.A.1', '2.NBT.A.3'], op: 'place',
        focal: 'all',
        alt: 'a flat square of ten by ten small squares',
        draw: () => { const u = BASE10_U, x = 5, y = 0; let b = rect(x, y, u * 10, u * 10, W.part); for (let j = 1; j < 10; j++) b += ln(x, y + u * j, x + u * 10, y + u * j, W.fine) + ln(x + u * j, y, x + u * j, y + u * 10, W.fine); return b; },
    },
    ten: {
        ccss: ['1.NBT.B.2', '2.NBT.A.1', '2.NBT.A.3'], op: 'place',
        focal: 'all',
        alt: 'a rod of 10 small squares in a line',
        draw: () => { const u = BASE10_U, x = 5, y = 17.5; let b = rect(x, y, u * 10, u, W.part); for (let j = 1; j < 10; j++) b += ln(x + u * j, y, x + u * j, y + u, W.fine); return b; },
    },
    one: {
        ccss: ['1.NBT.B.2', '2.NBT.A.1', '2.NBT.A.3'], op: 'place',
        focal: 'all',
        alt: 'a single small square',
        draw: () => rect(27.5, 17.5, BASE10_U, BASE10_U, W.part),
    },
    digit: {
        ccss: ['1.NBT.A.1', '1.NBT.B.2', '2.NBT.A.1', '2.NBT.A.3', '4.NBT.A.2'], op: 'place',
        // (owner O-2, lf-vocab r8: one large 7 alone did not say "a digit is one figure OF a number" - 472 with ONE digit (the
        // 7, not the ones digit: 'ones digit' is its own word) in a heavy ring, an arrow pointing at it; ring and arrow are focal)
        alt: 'the number 472 with the middle seven in a heavy ring and an arrow pointing at it',
        draw: () => tx(15, 25, 0, '4', { size: 16 }) + tx(30, 25, 0, '7', { size: 16 }) + tx(45, 25, 0, '2', { size: 16 })
            + F(ring(30, 25, 9, W.heavy) + arrow(30, 1.5, 30, 14.5, W.heavy)),
    },
    'expanded form': {
        ccss: ['2.NBT.A.3', '4.NBT.A.2'], op: 'place',
        focal: 'all',
        alt: '300 plus 40 plus 7',
        draw: () => tx(30, 20, 0, '300 + 40 + 7', { size: 7.6 }),
    },
    'number name': {
        ccss: ['2.NBT.A.3', '4.NBT.A.2'], op: 'place',
        focal: 'all',
        // (r3: bold, as large as the expanded form's digits - critic r2: the lightest, smallest text on any page)
        alt: 'three hundred forty-seven written in words',
        draw: () => tx(30, 13, 0, 'three hundred', { size: 8 }) + tx(30, 26, 0, 'forty-seven', { size: 8 }),
    },
    /* ---- Grade 4: number and shape patterns (4.OA.C.5) */
    'ones digit': {
        ccss: ['1.NBT.B.2', '2.NBT.A.1', '4.OA.C.5'], op: 'place',
        // (r14, critic r13 #1: 47[3] read as odd - one boxed odd number, and the ones digit decides odd / even - so the boxed ones
        // digit is EVEN, 47[6]; no set deals ones digit with even, ws-vocab-unit V-NUM)
        alt: 'the number 476 with the 6 in a heavy box',
        draw: () => tx(16, 20, 0, '4', { size: 13 }) + tx(26, 20, 0, '7', { size: 13 }) + rect(31, 9, 13, 22, W.heavy) + tx(37.5, 20, 0, '6', { size: 13 }),
    },
    repeat: {
        ccss: ['4.OA.C.5'], op: 'pattern',
        alt: '2, 4, 8 then 2, 4, 8 again, each set of three bracketed underneath',
        referent: [[1.5, 27.5], [30.3, 56.3]],
        draw: () => {
            let b = '';
            [2, 4, 8, 2, 4, 8].forEach((v, i) => { b += tx(5 + i * 9.6, 15, 0, String(v), { size: 9 }); });
            const br = (x1, x2) => `<path d="M${x1} 22 V26 H${x2} V22" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/>`;
            return b + br(1.5, 27.5) + br(30.3, 56.3);
        },
    },
    sequence: {
        ccss: ['4.OA.C.5', '5.OA.B.3'], op: 'pattern',
        focal: 'all',
        // (r15, critic r14 #1: 5, 10, 15 showed the ones digits 5, 0, 5 - a ones-digit cycle, so it read as cycle in the units-digit
        // cycle lesson; 4, 7, 10 steps by 3, and its ones digits 4, 7, 0 never come back - V-ONES)
        alt: '4, 7, 10 and so on, numbers in order with commas',
        draw: () => tx(30, 20, 0, '4, 7, 10…', { size: 9 }),
    },
    cycle: {
        ccss: ['4.OA.C.5'], op: 'pattern',
        // (r10, critic r9 #3: the 2, 4, 8, 6 ring also read as a sequence - now a loop of four SHAPES, no run of numbers; the
        // ones-digit link stays in the explanation; V-AMBIG+ derives sequence / pattern from a loop of numbers)
        alt: 'a circle, a square, a triangle and a diamond in a ring of arrows going round and back to the start',
        draw: () => {
            const c = [30, 20], R = 12.5, pts = [[30, 7.5], [43.5, 20], [30, 32.5], [16.5, 20]], s = 3.4;
            const shape = [
                (x, y) => ring(x, y, s, W.part),
                (x, y) => rect(x - s, y - s, 2 * s, 2 * s, W.part),
                (x, y) => `<path d="M${r2(x)} ${r2(y - s - 0.4)} L${r2(x + s + 0.5)} ${r2(y + s)} L${r2(x - s - 0.5)} ${r2(y + s)} Z" fill="none" stroke="#000" stroke-width="${W.part}" ${NS} stroke-linejoin="round"/>`,
                (x, y) => `<path d="M${r2(x)} ${r2(y - s - 0.6)} L${r2(x + s + 0.6)} ${r2(y)} L${r2(x)} ${r2(y + s + 0.6)} L${r2(x - s - 0.6)} ${r2(y)} Z" fill="none" stroke="#000" stroke-width="${W.part}" ${NS} stroke-linejoin="round"/>`,
            ];
            let b = pts.map((p, i) => shape[i](p[0], p[1])).join('');
            for (let i = 0; i < 4; i++) {
                const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.42, a1 = a0 + Math.PI / 2 - 0.84;
                const p0 = [c[0] + R * Math.cos(a0), c[1] + R * Math.sin(a0)], p1 = [c[0] + R * Math.cos(a1), c[1] + R * Math.sin(a1)];
                b += F(`<path d="M${r2(p0[0])} ${r2(p0[1])} A${R} ${R} 0 0 1 ${r2(p1[0])} ${r2(p1[1])}" fill="none" stroke="#000" stroke-width="${W.part}" ${NS}/>`);
                const t = a1 + Math.PI / 2, hx = p1[0], hy = p1[1];
                b += `<path d="M${r2(hx + 2.2 * Math.cos(t))} ${r2(hy + 2.2 * Math.sin(t))} L${r2(hx - 1.3 * Math.cos(a1))} ${r2(hy - 1.3 * Math.sin(a1))} L${r2(hx + 1.3 * Math.cos(a1))} ${r2(hy + 1.3 * Math.sin(a1))} Z" fill="#000"/>`;
            }
            return b;
        },
    },
    grow: {
        ccss: ['4.OA.C.5', '5.OA.B.3'], op: 'pattern',
        focal: 'all',
        alt: 'three shapes made of squares: one square, then three, then five, each one bigger',
        draw: () => {
            const u = 7; let b = '';
            const fig = (x0, n) => { let s = ''; for (let i = 0; i < n; i++) s += cube(x0 + i * u, 34 - u, u); for (let i = 1; i < n; i++) s += cube(x0 + (n - 1) * u, 34 - u * (i + 1), u); return s; };
            b += fig(3, 1) + fig(14, 2) + fig(33, 3);
            return b + ln(2, 34.8, 57, 34.8, W.fine);
        },
    },
    term: {
        ccss: ['4.OA.C.5', '5.OA.B.3'], op: 'pattern',
        // (r11, critic r10 #1: 4, [7], 10 rose by the rule picture's +3, so it read as grow and as rule - now a FALLING run with
        // another step; V-FEAT reads its features from the markup)
        alt: 'three numbers in order, 18, 14, 10; the 14 in a heavy box',
        draw: () => tx(9, 20, 0, '18,', { size: 9 }) + rect(19, 11, 15, 18, W.heavy) + tx(26.5, 20, 0, '14', { size: 9 }) + tx(37, 20, 0, ',', { size: 9 }) + tx(47, 20, 0, '10', { size: 9 }),
    },
    'first term': {
        ccss: ['4.OA.C.5', '5.OA.B.3'], op: 'pattern',
        // (r11, critic r10 #1: [3], 7, 11 rose, so it read as grow - now a FALLING run: [30], 25, 20)
        // (r15 V-ONES, critic r14 #1's class: 30, 25, 20 showed the ones digits 0, 5, 0, so it read as cycle in the grade 4 pool;
        // [30], 26, 22 steps by 4, as its twin term does, and its ones digits 0, 6, 2 never come back)
        alt: '30, 26, 22: the 30 at the start in a heavy box',
        draw: () => rect(3, 11, 15, 18, W.heavy) + tx(10.5, 20, 0, '30', { size: 9 }) + tx(19, 20, 0, ', 26, 22', { size: 9, anchor: 'start' }),
    },
    /* ---- Grade 4: multiplicative comparison (4.OA.A.1) */
    'times as many': {
        ccss: ['4.OA.A.1', '4.OA.A.2'], op: 'compare-times',
        alt: 'a short bar of one part and a bar three times as long, of three equal parts',
        draw: () => rect(6, 7, 14, 10, W.part) + [0, 1, 2].map((i) => rect(6 + i * 14, 23, 14, 10, W.part)).join('')
            + `<path d="M6 36 V37.5 H48 V36" fill="none" stroke="#000" stroke-width="${W.heavy}" ${NS}/>` + tx(54.5, 28, 0, '×3', { size: 8.5 }),
    },
    compare: {
        ccss: ['1.OA.A.1', '2.OA.A.1', '4.OA.A.2'], op: 'compare',
        alt: 'a long bar over a short bar, a double arrow from the end of the short bar to the end of the long one',
        draw: () => rect(6, 6, 44, 10, W.part) + rect(6, 22, 26, 10, W.part) + ln(50, 16, 50, 34, W.fine)
            + `<path d="M34.6 27 H47.4" stroke="#000" stroke-width="${W.heavy}" ${NS}/><path d="M50 27 l-2.8 -1.7 v3.4 Z M32 27 l2.8 -1.7 v3.4 Z" fill="#000"/>`,
    },
    equation: {
        ccss: ['1.OA.D.7', '3.OA.A.4', '4.OA.A.1', '4.OA.A.2', '4.OA.A.3'], op: 'equation',
        focal: 'all',
        alt: 'twelve equals three times four',
        draw: () => tx(30, 20, 0, '12 = 3 × 4', { size: 8.5 }),
    },
    /* ---- Grade 4: division and the remainder (4.OA.A.3) */
    remainder: {
        ccss: ['4.OA.A.3', '4.NBT.B.6'], op: 'divide',
        alt: 'thirteen dots: three rings of four and one dot left over, in a heavy ring',
        draw: () => [0, 1, 2].map((i) => { const x = 9 + i * 16; return ring(x, 20, 7, W.part) + dots(2, 2, x - 2.7, 17.3, 5.4, 2.1); }).join('') + dot(54, 20, 2.1) + ring(54, 20, 4, W.heavy),
    },
    quotient: {
        ccss: ['3.OA.A.2', '4.OA.A.3', '4.NBT.B.6', '5.NBT.B.6'], op: 'divide',
        // (no "R 1": with it, the picture also showed the remainder - critic r1 D12)
        alt: 'twelve divided by four equals three, the three in a heavy box',
        draw: () => tx(10, 20, 0, '12', { size: 8 }) + tx(20, 20, 0, '÷', { size: 8 }) + tx(28, 20, 0, '4', { size: 8 }) + tx(36, 20, 0, '=', { size: 8 })
            + rect(41.5, 12, 13, 16, W.heavy) + tx(48, 20, 0, '3', { size: 8 }),
    },
    divisor: {
        ccss: ['3.OA.A.2', '4.OA.A.3', '4.NBT.B.6', '5.NBT.B.6'], op: 'divide',
        alt: 'thirteen divided by four, the four in a heavy box',
        draw: () => tx(16, 20, 0, '13', { size: 8 }) + tx(27, 20, 0, '÷', { size: 8 }) + rect(33, 12, 12, 16, W.heavy) + tx(39, 20, 0, '4', { size: 8 }),
    },
    dividend: {
        ccss: ['3.OA.A.2', '4.OA.A.3', '4.NBT.B.6', '5.NBT.B.6'], op: 'divide',
        alt: 'thirteen divided by four, the thirteen in a heavy box',
        draw: () => rect(7, 12, 18, 16, W.heavy) + tx(16, 20, 0, '13', { size: 8 }) + tx(31, 20, 0, '÷', { size: 8 }) + tx(41, 20, 0, '4', { size: 8 }),
    },
    'round up': {
        ccss: ['4.OA.A.3'], op: 'divide',
        // (r3: no brace and no "4" - with them the picture also read as the quotient, critic r2; the extra car is the idea)
        alt: 'four boxes: three full with four dots each, the last, drawn heavy, with the one dot left over',
        draw: () => {
            let b = '';
            for (let i = 0; i < 4; i++) { const x = 3 + i * 14.5; b += rect(x, 10, 12.5, 20, i === 3 ? W.heavy : W.part); if (i < 3) b += dots(2, 2, x + 3.3, 15.5, 5.9, 2.1); else b += dot(x + 6.25, 15.5, 2.1); }
            return b;
        },
    },
};

/**
 * V-FEAT (lf-vocab r11): the features each picture DECLARES it draws (VOCAB_FEATURES). ws-vocab-unit V-FEAT fails a picture
 * whose markup shows a feature (vocabReadFeatures) it does not declare, and every co-dealt picture whose features satisfy
 * another dealt word's definition (vocab-words.js VOCAB_DEFS) unless the two are notWith.
 */
const PIC_FEAT = Object.freeze({
    even: ['dots', 'pairs-ringed', 'groups-of:2'],
    odd: ['dots', 'lone-mark', 'pairs-ringed', 'groups-of:2'],
    product: ['boxed-answer', 'boxed-number', 'equals', 'times-sign', 'number-sentence', 'marked-even'],
    factor: ['boxed-number', 'boxed-operand', 'equals', 'times-sign', 'number-sentence'],
    row: ['table', 'rising-run', 'row-ringed', 'skip-count', 'step:1', 'step:2', 'step:3', 'step:4', 'ones-cycle'],
    column: ['table', 'column-ringed', 'rising-run', 'skip-count', 'step:1', 'step:2', 'step:3', 'step:4', 'ones-cycle'],
    multiple: ['dots', 'rising-run', 'skip-count', 'step:3', 'number-line', 'hops', 'forward-hop'],
    input: ['table', 'column-ringed', 'in-ringed'],
    output: ['table', 'column-ringed', 'out-ringed'],
    rule: ['arrow-into-box', 'arrow-out-of-box', 'op-box', 'plus-sign'],
    pattern: ['ellipsis', 'plus-sign', 'rising-run', 'skip-count', 'step:2', 'hops', 'forward-hop', 'ones-cycle'],
    array: ['dots', 'array'],
    commutative: ['dots', 'equals', 'times-sign', 'array', 'turn-arrow', 'number-sentence'],
    identity: ['equals', 'times-sign', 'same-number-arc', 'number-sentence'],
    distributive: ['dots', 'plus-sign', 'times-sign', 'array', 'split-line'],
    step: ['equals', 'minus-sign', 'plus-sign', 'step-labels', 'number-sentence'],
    total: ['boxed-question', 'question-mark', 'bar-whole', 'bar-parts'],
    left: ['crossed-mark', 'bracket'],
    'equal groups': ['dots', 'groups-of:4'],
    unknown: ['boxed-question', 'equals', 'plus-sign', 'question-mark', 'number-sentence'],
    'count on': ['rising-run', 'step:1', 'number-track', 'forward-hop', 'hops'],
    'one more': ['dots', 'lone-mark', 'ringed-new'],
    'one less': ['crossed-mark', 'dots'],
    before: ['boxed-first-of-run', 'boxed-number', 'rising-run', 'step:1', 'number-track', 'back-hop', 'marked-even'],
    after: ['boxed-in-run', 'boxed-number', 'rising-run', 'step:1', 'number-track', 'forward-hop', 'marked-even'],
    'hundred chart': ['table', 'rising-run', 'step:1', 'step:10', 'ones-cycle'],
    hundred: ['base10-flat'],
    ten: ['base10-rod'],
    one: ['base10-unit'],
    digit: ['digit-ringed', 'marked-odd', 'place:tens'],
    'expanded form': ['plus-sign', 'expanded-sum'],
    'number name': ['number-words'],
    'ones digit': ['boxed-number', 'last-digit-boxed', 'marked-even', 'place:ones'],
    repeat: ['repeated-block', 'bracket'],
    sequence: ['ellipsis', 'rising-run', 'step:3'],
    cycle: ['loop-arrows', 'loop-shapes'],
    grow: ['shapes-growing', 'rising-run', 'step:2'],
    term: ['boxed-in-run', 'boxed-number', 'falling-run', 'step:4', 'marked-even'],
    'first term': ['boxed-first-of-run', 'boxed-number', 'falling-run', 'step:4', 'marked-even'],
    'times as many': ['times-sign', 'times-bar', 'bar-pair', 'bracket'],
    compare: ['bar-pair', 'double-arrow'],
    equation: ['equals', 'times-sign', 'number-sentence'],
    remainder: ['dots', 'lone-mark', 'groups-of:4'],
    quotient: ['boxed-answer', 'boxed-number', 'divide-sign', 'equals', 'number-sentence', 'marked-odd'],
    divisor: ['boxed-number', 'divide-sign', 'boxed-divisor', 'marked-even'],
    dividend: ['boxed-number', 'divide-sign', 'boxed-dividend', 'marked-odd'],
    'round up': ['dots', 'grouped-boxes', 'groups-of:4'],
});
/**
 * V-FIT (r10, critic r9 #4 / #5, rule 5): what each picture TEACHES - the CCSS codes its drawing shows (`ccss`) and its operation
 * (`op`). A lesson set's core words (its first three, the vocabulary page's Match 3 cell) must have pictures that teach the
 * set's standard: a code in common, or an operation the standard names (vocab-words.js VOCAB_STANDARD_OPS). The 5 + 3 bar
 * of "total" is additive part-whole and fails a 4.OA.A.1 core trio (ws-vocab-unit V-FIT).
 */
export const vocabPictureTeaches = (id) => (hasVocabPicture(id) ? { ccss: (PICS[id].ccss || []).slice(), op: PICS[id].op || '' } : null);
/** The ids (words) the library draws. */
/**
 * V-AMBIG (owner O-2 / O-3, lf-vocab r8): the OTHER words each picture could be read as - what a pupil could defend for it,
 * its marks included (the step staircase read as 'column'). Plain readings (e.g. 'number') are listed too. An item, a lesson
 * set or a lesson band whose other words include one of them fails ws-vocab-unit V-AMBIG; the dealer keeps them apart through
 * the words' notWith lists (vocab-words.js). Every picture declares a list (empty when nothing else fits).
 */
export const VOCAB_ALSO_SHOWS = Object.freeze({
    even: ['pairs', 'equal groups', 'array'],
    odd: ['pairs', 'remainder', 'left over'],
    product: ['answer', 'multiply'],
    factor: ['multiply', 'times'],
    row: ['times table', 'line'],
    column: ['times table', 'line'],
    multiple: ['number line', 'count on', 'pattern', 'sequence', 'skip count'],
    input: ['table', 'in'],
    output: ['table', 'out'],
    rule: ['add', 'machine', 'pattern'],
    pattern: ['sequence', 'rule', 'multiple', 'count on', 'repeat'],
    array: ['equal groups', 'rows', 'dots', 'rectangle', 'row', 'column'],
    commutative: ['array', 'turn'],
    identity: ['times one', 'same'],
    distributive: ['array', 'split'],
    step: ['total', 'left', 'add', 'take away', 'sum'],
    total: ['unknown', 'whole', 'bar model'],
    left: ['one less', 'take away', 'cross out'],
    'equal groups': ['array', 'even', 'remainder', 'multiply'],
    unknown: ['total', 'missing number', 'question'],
    'count on': ['after', 'one more', 'sequence', 'number track'],
    'one more': ['add', 'after', 'count on'],
    'one less': ['left', 'before', 'take away'],
    before: ['one less', 'number track', 'count back'],
    after: ['one more', 'count on', 'number track'],
    'hundred chart': ['ten more', 'number chart'],
    hundred: ['flat', 'square', 'array'],
    ten: ['rod', 'tens'],
    one: ['cube', 'square'],
    digit: ['number', 'tens digit'],
    'expanded form': ['add', 'parts'],
    'number name': ['words'],
    'ones digit': ['digit', 'number'],
    repeat: ['pattern', 'cycle', 'sequence'],
    sequence: ['pattern', 'multiple', 'count on', 'skip count'],
    cycle: ['repeat', 'circle'],
    grow: ['pattern', 'sequence', 'step'],
    term: ['first term', 'sequence', 'number', 'rule'],  // (r12, critic r11 #3: 18, [14], 10 reads as the rule "take 4")
    'first term': ['term', 'sequence', 'rule'],  // (r13 V-TWIN, critic r12 #3: the twin of term - [30], 26, 22 reads as "take 4")
    'times as many': ['compare', 'bar', 'equal parts'],
    compare: ['times as many', 'difference'],
    equation: ['number sentence', 'multiply', 'equal'],
    remainder: ['odd', 'equal groups', 'left over', 'round up'],
    quotient: ['answer', 'divide'],
    divisor: ['divide'],
    dividend: ['divide'],
    'round up': ['remainder', 'equal groups', 'quotient'],
});
/*
 * V-FEAT (lf-vocab r11, rule 5 root cause: the look-alike class failed r6, r7, r9 and r10, each time closed by one more
 * derived rule). Every picture DECLARES the features it draws (`feat`, a closed vocabulary: VOCAB_FEATURES), and every word
 * declares its defining features (vocab-words.js VOCAB_WORDS `def`: alternatives, each a set of features). A picture of A
 * whose features satisfy B's definition, dealt with B, is a clash (ws-vocab-unit V-FEAT). The declarations are CHECKED
 * against the drawing: vocabReadFeatures reads every feature the markup shows, and a picture that draws a feature it does
 * not declare fails V-FEAT. Parameterised features: step:<d> (a run's step), groups-of:<n>.
 */
export const VOCAB_FEATURES = Object.freeze([
    // read from the markup (vocabReadFeatures)
    'equals', 'times-sign', 'plus-sign', 'minus-sign', 'divide-sign', 'question-mark', 'ellipsis', 'dots',
    'rising-run', 'falling-run', 'step:<d>', 'skip-count', 'boxed-number', 'boxed-question', 'op-box', 'boxed-answer',
    'boxed-operand', 'boxed-divisor', 'boxed-dividend', 'boxed-first-of-run', 'boxed-in-run', 'row-ringed', 'column-ringed', 'in-ringed', 'out-ringed',
    'crossed-mark', 'lone-mark', 'loop-arrows', 'loop-numbers', 'arrow-into-box', 'arrow-out-of-box', 'numbers-at-ends',
    // (r13 V-NUM: two or more numbers ringed or boxed, all even / all odd; r14: exactly one, marked-even / marked-odd)
    'all-even', 'all-odd', 'marked-even', 'marked-odd',
    // (r14 V-PLACE: the place of a ringed or boxed digit inside a number)
    'place:ones', 'place:tens', 'place:hundreds',
    // (r15 V-ONES: a run whose ones digits repeat, or whose step divides 10 - 5, 10, 15 - reads as a ones-digit cycle)
    'ones-cycle',
    // declared only (not read from the markup)
    'pairs-ringed', 'groups-of:<n>', 'array', 'split-line', 'turn-arrow', 'same-number-arc', 'table', 'number-line', 'hops',
    'forward-hop', 'back-hop', 'number-track', 'step-labels', 'bar-whole', 'bar-parts', 'bar-pair', 'bracket', 'double-arrow',
    'ringed-new', 'base10-unit', 'base10-rod', 'base10-flat', 'digit-ringed', 'last-digit-boxed', 'expanded-sum',
    'number-words', 'repeated-block', 'loop-shapes', 'shapes-growing', 'times-bar', 'number-sentence', 'grouped-boxes',
]);
const num_ = (s) => Number(s);
/** Every feature a drawn picture body (svg markup, canvas units) shows, read from its marks. */
export function vocabReadFeatures(body) {
    body = String(body || '');
    const f = new Set();
    const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const texts = [...body.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => { const a = attrs(m[1]); return { x: num_(a.x), y: num_(a.y), t: m[2].replace(/&amp;/g, '&') }; });
    const all = texts.map((t) => t.t).join(' ');
    if (all.includes('=')) f.add('equals');
    if (all.includes('×')) f.add('times-sign');
    if (/\+/.test(all)) f.add('plus-sign');
    if (/[−-]/.test(all.replace(/\b[a-z]+-[a-z]+\b/g, ''))) f.add('minus-sign');
    if (all.includes('÷')) f.add('divide-sign');
    if (all.includes('?')) f.add('question-mark');
    if (all.includes('…')) f.add('ellipsis');
    const circles = [...body.matchAll(/<circle([^>]*)\/>/g)].map((m) => attrs(m[1])).map((a) => ({ x: num_(a.cx), y: num_(a.cy), r: num_(a.r), fill: a.fill }));
    const dotsC = circles.filter((c) => c.fill !== 'none');
    if (dotsC.length >= 2) f.add('dots');
    const rects = [...body.matchAll(/<rect([^>]*)\/>/g)].map((m) => attrs(m[1])).map((a) => ({ x: num_(a.x), y: num_(a.y), w: num_(a.width), h: num_(a.height), sw: num_(a['stroke-width']), fill: a.fill }));
    const inR = (t, r) => t.x > r.x && t.x < r.x + r.w && t.y > r.y && t.y < r.y + r.h;
    // number runs: 3+ numbers one step apart, along a line or down a column (a line of text tokens, in reading order)
    const toks = texts.flatMap((t) => (t.t.match(/\d+/g) || []).map((n, i, a) => ({ n: Number(n), x: t.x + (a.length > 1 ? i : 0) * 0.01, y: t.y, src: t })));
    const group = (key) => { const m = new Map(); for (const k of toks) { const g = key(k); if (!m.has(g)) m.set(g, []); m.get(g).push(k); } return [...m.values()]; };
    const lines = [...group((k) => Math.round(k.y / 2)).map((l) => l.sort((a, b) => a.x - b.x)), ...group((k) => Math.round(k.x / 2)).map((l) => l.sort((a, b) => a.y - b.y))];
    const runs = [];
    for (const l of lines) for (let i = 0; i + 2 < l.length; i++) {
        const d = l[i + 1].n - l[i].n;
        if (d === 0 || l[i + 2].n - l[i + 1].n !== d) continue;
        let j = i + 2; while (j + 1 < l.length && l[j + 1].n - l[j].n === d) j++;
        runs.push({ items: l.slice(i, j + 1), d });
        f.add(d > 0 ? 'rising-run' : 'falling-run'); f.add(`step:${Math.abs(d)}`);
        // V-ONES (r15, critic r14 #1: 5, 10, 15 read as cycle in the units-digit-cycle lesson - its ones digits go 5, 0, 5): a run
        // whose visible ones digits repeat, or whose step (2, 5 or 10) divides 10, shows a ones-digit cycle. (Step 1 does not:
        // ten numbers pass before a ones digit comes back, so a drawn run of 1s is a count, never a cycle.)
        const ones = l.slice(i, j + 1).map((it) => Math.abs(it.n) % 10);
        if ((Math.abs(d) > 1 && 10 % Math.abs(d) === 0) || new Set(ones).size < ones.length) f.add('ones-cycle');
        if (Math.abs(d) > 1 && (l[i].n === Math.abs(d) || l[i].n === 0 || l[i].n % Math.abs(d) === 0)) f.add('skip-count');
        i = j - 1;
    }
    const heavy = rects.filter((r) => r.sw >= 2 && r.fill === 'none');
    // V-NUM (r13, critic r12 #1): the numbers the picture rings or boxes; two or more, all even or all odd, read as even / odd
    // (r14, critic r13 #1: the boundary - ONE ringed or boxed number is a parity feature too, marked-even / marked-odd; a ring is
    // a circle with no fill round one text, as a box is a heavy rect)
    const ringsT = circles.filter((c) => c.fill === 'none').map((c) => ({ c, inside: texts.filter((t) => Math.hypot(t.x - c.x, t.y - c.y) < c.r) }));
    const markedT = [...heavy.flatMap((r) => texts.filter((t) => inR(t, r))), ...ringsT.filter((q) => q.inside.length === 1).map((q) => q.inside[0])];
    const marked = markedT.map((t) => t.t.trim()).filter((t) => /^\d+$/.test(t)).map(Number);
    if (marked.length >= 2 && marked.every((n) => n % 2 === 0)) f.add('all-even');
    if (marked.length >= 2 && marked.every((n) => n % 2 === 1)) f.add('all-odd');
    if (marked.length === 1) f.add(marked[0] % 2 === 0 ? 'marked-even' : 'marked-odd');
    // V-PLACE (r14, critic r13 #2): a ringed or boxed DIGIT inside a number (one-digit texts side by side on one line, nothing
    // between them) has a place - place:ones / tens / hundreds - which satisfies one / ten / hundred
    const PLACES = ['ones', 'tens', 'hundreds', 'thousands'];
    const singles = [...heavy.map((r) => texts.filter((t) => inR(t, r))), ...ringsT.map((q) => q.inside)].filter((x) => x.length === 1).map((x) => x[0]);
    for (const m of singles) {
        if (!/^\d$/.test(m.t.trim())) continue;
        const line = texts.filter((t) => Math.abs(t.y - m.y) < 2).sort((a, b) => a.x - b.x);
        let k = line.indexOf(m), lo = k, hi = k;
        const dig = (t) => t && /^\d$/.test(t.t.trim());
        while (dig(line[lo - 1]) && line[lo].x - line[lo - 1].x < 18) lo--;
        while (dig(line[hi + 1]) && line[hi + 1].x - line[hi].x < 18) hi++;
        if (hi > lo) f.add(`place:${PLACES[hi - k] || 'big'}`);
    }
    const eqX = texts.filter((t) => t.t.trim() === '=' || /\s=\s/.test(t.t)).map((t) => t);
    for (const r of heavy) {
        const inside = texts.filter((t) => inR(t, r));
        if (inside.length >= 2) {
            if (r.h > 1.5 * r.w) f.add('column-ringed');
            if (r.w > 1.5 * r.h) f.add('row-ringed');
            if (inside.some((t) => t.t === 'In')) f.add('in-ringed');
            if (inside.some((t) => t.t === 'Out')) f.add('out-ringed');
            continue;
        }
        if (inside.length !== 1) continue;
        const t = inside[0].t.trim();
        if (t === '?') f.add('boxed-question');
        else if (/^[+−×÷]\d+$/.test(t)) f.add('op-box');
        else if (/^\d+$/.test(t)) {
            f.add('boxed-number');
            const eq = eqX.find((e) => Math.abs(e.y - inside[0].y) < r.h / 2);
            if (eq) f.add(inside[0].x > eq.x ? 'boxed-answer' : 'boxed-operand');
            const dv = texts.find((e) => e.t.trim() === '÷' && Math.abs(e.y - inside[0].y) < r.h / 2);
            if (dv && !(eq && inside[0].x > eq.x)) f.add(inside[0].x > dv.x ? 'boxed-divisor' : 'boxed-dividend');
            for (const run of runs) {
                const k = run.items.findIndex((it) => it.src === inside[0]);
                if (k === 0) f.add('boxed-first-of-run'); else if (k > 0) f.add('boxed-in-run');
            }
        }
    }
    // (r14, critic r13 #3: a growing shape pattern is a run too) figures of equal squares that touch, counted left to right:
    // three or more figures whose counts change by one constant step read as a run with that step
    {
        const sq = rects.filter((r) => r.fill === 'none' && !(r.sw >= 2) && r.w > 2 && Math.abs(r.w - r.h) < 0.05 && texts.every((t) => !inR(t, r)));
        const u = sq.length ? sq[0].w : 0;
        if (sq.length >= 3 && sq.every((r) => Math.abs(r.w - u) < 0.05)) {
            const figs = [];
            const touch = (a, b) => Math.abs(a.x - b.x) <= u + 0.05 && Math.abs(a.y - b.y) <= u + 0.05;
            for (const r of sq) {
                const hit = figs.filter((g) => g.some((q) => touch(q, r)));
                const merged = [r, ...hit.flat()];
                for (const g of hit) figs.splice(figs.indexOf(g), 1);
                figs.push(merged);
            }
            if (figs.length >= 3 && figs.some((g) => g.length > 1)) {
                const counts = figs.map((g) => ({ n: g.length, x: Math.min(...g.map((q) => q.x)) })).sort((a, b) => a.x - b.x).map((g) => g.n);
                const d = counts[1] - counts[0];
                if (d !== 0 && counts.every((n, i) => i === 0 || n - counts[i - 1] === d)) {
                    f.add(d > 0 ? 'rising-run' : 'falling-run'); f.add(`step:${Math.abs(d)}`);
                    if (Math.abs(d) > 1 && counts[0] % Math.abs(d) === 0) f.add('skip-count');
                }
            }
        }
    }
    // a crossed mark (two strokes across each other); a ring round one lone dot
    const lns = [...body.matchAll(/<line([^>]*)\/>/g)].map((m) => attrs(m[1])).map((a) => ({ x1: num_(a.x1), y1: num_(a.y1), x2: num_(a.x2), y2: num_(a.y2) }));
    const crosses = (p, q) => { const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x); const A = { x: p.x1, y: p.y1 }, B = { x: p.x2, y: p.y2 }, C = { x: q.x1, y: q.y1 }, D = { x: q.x2, y: q.y2 }; return d(A, B, C) * d(A, B, D) < 0 && d(C, D, A) * d(C, D, B) < 0; };
    const diag = lns.filter((l) => Math.abs(l.x2 - l.x1) > 0.5 && Math.abs(l.y2 - l.y1) > 0.5);
    if (diag.some((p, i) => diag.slice(i + 1).some((q) => crosses(p, q)))) f.add('crossed-mark');
    for (const ring of circles.filter((c) => c.fill === 'none')) {
        const inn = dotsC.filter((d) => Math.hypot(d.x - ring.x, d.y - ring.y) < ring.r);
        if (inn.length === 1 && texts.every((t) => Math.hypot(t.x - ring.x, t.y - ring.y) >= ring.r)) f.add('lone-mark');
    }
    // a loop of arrows: three or more arrow heads round a centre, not along one line
    const heads = [...body.matchAll(/<path d="M([\d.-]+) ([\d.-]+) [Ll][^"]*Z" fill="#000"\/>/g)].map((m) => ({ x: num_(m[1]), y: num_(m[2]) }));
    if (heads.length >= 3) {
        const xs = heads.map((h) => h.x), ys = heads.map((h) => h.y);
        const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
        if (w > 4 && h > 4 && Math.min(w, h) / Math.max(w, h) > 0.5) f.add('loop-arrows');
    }
    // a machine: a line arriving at a box's left side / leaving its right side, on the box's height; numbers at both ends
    const numT = texts.filter((t) => /\d/.test(t.t));
    for (const r of rects) {
        if (r.fill !== 'none') continue;
        const onBox = (y) => y > r.y && y < r.y + r.h;
        const ins = lns.filter((l) => Math.abs(l.y1 - l.y2) < 0.5 && onBox(l.y1) && Math.max(l.x1, l.x2) <= r.x + 0.5 && Math.max(l.x1, l.x2) >= r.x - 5);
        const outs = lns.filter((l) => Math.abs(l.y1 - l.y2) < 0.5 && onBox(l.y1) && Math.min(l.x1, l.x2) >= r.x + r.w - 0.5 && Math.min(l.x1, l.x2) <= r.x + r.w + 5);
        if (ins.length) f.add('arrow-into-box');
        if (outs.length) f.add('arrow-out-of-box');
        for (const a of ins) for (const b of outs) {
            const x0 = Math.min(a.x1, a.x2), x1 = Math.max(b.x1, b.x2);
            if (numT.some((t) => t.x < x0 && Math.abs(t.y - a.y1) < r.h / 2) && numT.some((t) => t.x > x1 && Math.abs(t.y - b.y1) < r.h / 2)) f.add('numbers-at-ends');
        }
    }
    // a loop of numbers: three or more numbers outside any box, spread round a centre
    const free = numT.filter((t) => !rects.some((r) => inR(t, r)));
    if (free.length >= 3) {
        const cx = free.reduce((a, t) => a + t.x, 0) / free.length, cy = free.reduce((a, t) => a + t.y, 0) / free.length;
        const ds = free.map((t) => Math.hypot(t.x - cx, t.y - cy)), md = ds.reduce((a, d) => a + d, 0) / ds.length;
        const xs = free.map((t) => t.x), ys = free.map((t) => t.y);
        const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
        if (md > 3 && ds.every((d) => Math.abs(d - md) < 0.3 * md) && Math.min(w, h) / Math.max(w, h) > 0.5) f.add('loop-numbers');
    }
    return [...f].sort();
}
/**
 * V-REF (lf-vocab r11): the marks an explanation can POINT at, read from a drawn picture body: every text, the texts inside a
 * heavy box, the kinds of line drawn round (row / column), and each line's text run together ("4", "7", "2" -> "472").
 */
export function vocabReadMarks(body) {
    body = String(body || '');
    const attrs = (x) => Object.fromEntries([...x.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const texts = [...body.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => { const a = attrs(m[1]); return { x: num_(a.x), y: num_(a.y), t: m[2].replace(/&amp;/g, '&').trim() }; });
    const rects = [...body.matchAll(/<rect([^>]*)\/>/g)].map((m) => attrs(m[1])).map((a) => ({ x: num_(a.x), y: num_(a.y), w: num_(a.width), h: num_(a.height), sw: num_(a['stroke-width']), fill: a.fill }));
    const inR = (t, r) => t.x > r.x && t.x < r.x + r.w && t.y > r.y && t.y < r.y + r.h;
    const boxed = [], ringed = [];
    for (const r of rects.filter((q) => q.sw >= 2 && q.fill === 'none')) {
        const inside = texts.filter((t) => inR(t, r));
        if (inside.length === 1) boxed.push(inside[0].t);
        if (inside.length >= 2) { if (r.w > 1.5 * r.h) ringed.push('row'); if (r.h > 1.5 * r.w) ringed.push('column'); }
    }
    const byLine = new Map();
    for (const t of texts) { const k = Math.round(t.y / 2); if (!byLine.has(k)) byLine.set(k, []); byLine.get(k).push(t); }
    const lines = [...byLine.values()].map((l) => l.sort((a, b) => a.x - b.x).map((t) => t.t).join(''));
    return { texts: texts.map((t) => t.t), tokens: texts.flatMap((t) => t.t.match(/\d+|\?/g) || []), boxed, ringed, lines };
}
/** The features a library picture's drawing shows, read from its markup ([] for no picture). */
export const vocabPictureReadFeatures = (id) => (Object.prototype.hasOwnProperty.call(PICS, String(id)) ? vocabReadFeatures(bodyFor(String(id), '')) : []);
/** The features a library picture DECLARES it draws (its `feat`; null when it declares none). */
export const vocabPictureFeatures = (id) => (Object.prototype.hasOwnProperty.call(PIC_FEAT, String(id)) ? PIC_FEAT[id].slice() : null);
/** The other words a library picture could be read as: the words its declared features satisfy, plus the hand list. */
export const vocabPictureAlsoShows = (id) => (Object.prototype.hasOwnProperty.call(VOCAB_ALSO_SHOWS, id)
    ? [...new Set([...readingsOf(vocabPictureFeatures(id) || vocabPictureReadFeatures(id)).filter((w) => w !== id), ...VOCAB_ALSO_SHOWS[id]])] : null);
export const VOCAB_PICTURE_IDS = Object.freeze(Object.keys(PICS));
/** Does the library have a picture of this word? */
export const hasVocabPicture = (id) => Object.prototype.hasOwnProperty.call(PICS, String(id));
/** A picture's screen-reader description (never its word). */
export const vocabPictureAlt = (id) => (hasVocabPicture(id) ? PICS[id].alt : '');
/**
 * The part of a picture its word NAMES, as canvas x ranges [[x0, x1], ...], for a picture that shows more than its referent
 * ("left": the circles that stay, not the ones crossed out; "repeat": each repeated group). The heavy mark (W.heavy) is on
 * these ranges and nowhere else (critic r4 #5, ws-vocab-unit V21). null for a picture with no declared referent.
 */
export const vocabPictureReferent = (id) => (hasVocabPicture(id) && PICS[id].referent ? PICS[id].referent.map((r) => r.slice()) : null);
/** The heavy stroke width the referent carries (px, non-scaling). */
export const VOCAB_HEAVY = W.heavy;

/**
 * The extent of a picture's marks on the canvas, {x, y, w, h} in canvas units (strokes, dot radii and text boxes
 * included; text at 0.62 em a character). The picture is drawn CROPPED to it (r3, rule 5: a flat picture - the ten
 * rod, one line of digits - used 13-20 % of the 60 x 40 canvas height, so it printed 3.4 mm tall: critic r1 #13, r2 #2).
 */
const EXTENT = new Map();
export function vocabPictureExtent(id) {
    if (!hasVocabPicture(id)) return null;
    if (EXTENT.has(id)) return EXTENT.get(id);
    const body = PICS[id].draw();
    const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const add = (x, y) => { b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x); b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y); };
    const num = (t, k) => Number((new RegExp(`\\b${k}="([-\\d.]+)"`).exec(t) || [])[1] || 0);
    for (const [t] of body.matchAll(/<rect [^>]*>/g)) { add(num(t, 'x'), num(t, 'y')); add(num(t, 'x') + num(t, 'width'), num(t, 'y') + num(t, 'height')); }
    for (const [t] of body.matchAll(/<line [^>]*>/g)) { add(num(t, 'x1'), num(t, 'y1')); add(num(t, 'x2'), num(t, 'y2')); }
    for (const [t] of body.matchAll(/<circle [^>]*>/g)) { const r = num(t, 'r'); add(num(t, 'cx') - r, num(t, 'cy') - r); add(num(t, 'cx') + r, num(t, 'cy') + r); }
    for (const [, d] of body.matchAll(/<path d="([^"]+)"/g)) {
        let x = 0, y = 0;
        for (const [, c, args] of d.matchAll(/([MLQHVAZmlhvz])([^MLQHVAZmlhvz]*)/g)) {
            const a = (args.match(/-?[\d.]+/g) || []).map(Number);
            if (c === 'M' || c === 'L') { x = a[0]; y = a[1]; } else if (c === 'Q') { add(a[0], a[1]); x = a[2]; y = a[3]; } else if (c === 'A') { x = a[5]; y = a[6]; }
            else if (c === 'H') x = a[0]; else if (c === 'V') y = a[0]; else if (c === 'h') x += a[0]; else if (c === 'v') y += a[0]; else if (c === 'l' || c === 'm') { x += a[0]; y += a[1]; }
            if (c !== 'Z' && c !== 'z') add(x, y);
        }
    }
    for (const [, t, txt] of body.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)) {
        const sz = num(t, 'font-size'), w = (txt.replace(/&[a-z#0-9]+;/g, 'x').length + (txt.match(/…/g) || []).length * 0.7) * 0.62 * sz;   // (… is a wide glyph: its third dot was cut off - critic r3 "8..")   // (0.62 em: Andika bold, so a text never runs past its box - precritic r4 PG-12)
        const k = /text-anchor="start"/.test(t) ? 0 : /text-anchor="end"/.test(t) ? 1 : 0.5;
        // (the text's line box, 1.25 em tall, as a browser measures it - a 26-unit "7" ran 1.7 mm out of its cell: precritic r4)
        add(num(t, 'x') - k * w, num(t, 'y') - sz * 0.625); add(num(t, 'x') + (1 - k) * w, num(t, 'y') + sz * 0.625);
    }
    const pad = 1;   // the stroke's half-width and the arc bulge
    const e = Number.isFinite(b.x0) ? { x: b.x0 - pad, y: b.y0 - pad, w: b.x1 - b.x0 + 2 * pad, h: b.y1 - b.y0 + 2 * pad } : { x: 0, y: 0, w: PIC_CANVAS.w, h: PIC_CANVAS.h };
    EXTENT.set(id, e);
    return e;
}

/* ------------------------------------------------------------------------------ the focal part (owner R-1)
 * After the pupil answers on screen the focal part gets a thick highlight; the printed KEY shows it in the single grey.
 * The highlight is a HALO: a copy of the focal marks under the drawing, stroked thick in `currentColor` (the key: GREY;
 * the screen: hidden until the cell is answered, then the host's highlight colour, css/screen-cell.css; the key writes GREY
 * into each mark, since a key page paints the marks it adds in its key ink through `color`, sheet-kit.css). The pupil page
 * draws no halo and no focal group, byte for byte as before.
 */
const SENT = /[\u0001\u0002]/g;
const HEAVY_EL = /<(rect|line|circle|path)\b[^>]*stroke-width="2"[^>]*\/>/g;
/** The class a focal group and the halo carry (screen-cell.js and the CSS target them). */
export const VOCAB_FOCAL_CLASS = 'mq-vfocal';
export const VOCAB_HALO_CLASS = 'mq-vhalo';
/** The halo's stroke (px, non-scaling): about 4.5 pt, three times the heavy mark. */
export const VOCAB_HALO_W = 6;
/** A picture's drawing with its focal part between sentinels (\u0001 ... \u0002). */
function focalBody(id) {
    const raw = PICS[id].draw();
    if (/\u0001/.test(raw)) return raw;
    if (PICS[id].focal === 'all') return F(raw);
    return raw.replace(HEAVY_EL, (m) => F(m));
}
/** The focal segments of a picture (svg strings); every picture has at least one (ws-vocab-unit V22). */
export const vocabPictureFocal = (id) => (hasVocabPicture(id) ? [...focalBody(id).matchAll(/\u0001([^\u0001\u0002]*)\u0002/g)].map((m) => m[1]).filter((x) => /<(rect|line|circle|path|text)\b/.test(x)) : []);
/** The halo copy of a focal segment: each mark stroked thick in currentColor; a filled mark (dot, text, arrow head) filled too. */
// (key, r8 / critic r6 #6: a highlight never strokes glyphs or dots - stroked round a label or a small dot it blurred them at
// print scale. On the KEY a label gets a grey box BEHIND it, sized from its font, and a filled dot a grey disc a little
// wider than the dot, neither stroked; ws-vocab-unit V22+)
const num = (attrs, k, d = 0) => { const v = new RegExp(`\\s${k}="([^"]*)"`).exec(attrs); return v ? parseFloat(v[1]) : d; };
function keyUnderlay(tag, attrs, inner, ink) {
    if (tag === 'text') {
        const fs = num(attrs, 'font-size', 8), n = Math.max(1, String(inner || '').replace(/<[^>]*>/g, '').trim().length);
        const w = n * 0.62 * fs + 0.5 * fs, h = 1.25 * fs;
        const anchor = (/\stext-anchor="([^"]*)"/.exec(attrs) || [])[1] || 'start';
        const x0 = num(attrs, 'x') - (anchor === 'middle' ? w / 2 : anchor === 'end' ? w - 0.25 * fs : 0.25 * fs);
        const cy = /dominant-baseline="(central|middle)"/.test(attrs) ? num(attrs, 'y') : num(attrs, 'y') - 0.35 * fs;
        const r2 = (v) => Math.round(v * 100) / 100;
        return `<rect x="${r2(x0)}" y="${r2(cy - h / 2)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(0.2 * fs)}" fill="${ink}" stroke="none"/>`;
    }
    const r = num(attrs, 'r');
    return `<circle cx="${num(attrs, 'cx')}" cy="${num(attrs, 'cy')}" r="${Math.round((r + Math.min(0.7 * r, 2.5)) * 100) / 100}" fill="${ink}" stroke="none"/>`;
}
/**
 * critic r7 #3 (lf-vocab r9): dot underlays that would overlap (the four dots of one equal group) become ONE underlay per
 * group - a rounded box round the group's dots - so the key's grey never fuses into a blob of rings; a lone dot keeps its own.
 */
function mergeDotUnderlays(seg, ink) {
    const re = /<circle data-vu="1" cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"[^>]*\/>/g;
    const us = [...seg.matchAll(re)].map((m) => ({ src: m[0], x: +m[1], y: +m[2], r: +m[3] }));
    if (us.length < 2) return seg;
    const grp = us.map((_, i) => i);
    const root = (i) => (grp[i] === i ? i : (grp[i] = root(grp[i])));
    for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) {
        if (Math.hypot(us[i].x - us[j].x, us[i].y - us[j].y) < us[i].r + us[j].r) grp[root(j)] = root(i);
    }
    const groups = new Map();
    us.forEach((u, i) => { const k = root(i); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(u); });
    const r2 = (v) => Math.round(v * 100) / 100;
    for (const g of groups.values()) {
        if (g.length < 2) continue;
        const x0 = Math.min(...g.map((u) => u.x - u.r)), x1 = Math.max(...g.map((u) => u.x + u.r));
        const y0 = Math.min(...g.map((u) => u.y - u.r)), y1 = Math.max(...g.map((u) => u.y + u.r));
        const rx = Math.max(...g.map((u) => u.r));
        const box = `<rect data-vu="1" x="${r2(x0)}" y="${r2(y0)}" width="${r2(x1 - x0)}" height="${r2(y1 - y0)}" rx="${r2(rx)}" fill="${ink}" stroke="none"/>`;
        seg = seg.replace(g[0].src, box);
        for (const u of g.slice(1)) seg = seg.replace(u.src, '');
    }
    return seg;
}
/**
 * The CELLS of a drawing (r15, critic r14 #2): unfilled rects that hold exactly one text. On the key a text in a cell is
 * underlaid by its cell - the rect itself, filled grey - never by a font-sized box: the hundred chart's 3-digit boxes were wider
 * than their cells, so grey lobes grew outside the grid and white specks showed in the cell corners (ws-vocab-unit V-KEY).
 */
function cellsOf(body) {
    const rects = [...String(body).matchAll(/<rect\b([^>]*?)\/?>/g)].filter((m) => /\sfill="none"/.test(m[1]))
        .map((m) => ({ src: m[0], x: num(m[1], 'x'), y: num(m[1], 'y'), w: num(m[1], 'width'), h: num(m[1], 'height') }));
    const texts = [...String(body).matchAll(/<text\b([^>]*)>/g)].map((m) => ({ x: num(m[1], 'x'), y: num(m[1], 'y') }));
    const inR = (t, r) => t.x > r.x && t.x < r.x + r.w && t.y > r.y && t.y < r.y + r.h;
    return rects.filter((r) => texts.filter((t) => inR(t, r)).length === 1);
}
const cellAt = (cells, x, y) => cells.filter((r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h).sort((a, b) => a.w * a.h - b.w * b.h)[0] || null;
function haloOf(seg, ink = 'currentColor', key = false, cells = []) {
    if (key) {
        // (r15: a text in a cell takes its cell as its underlay, and the cell's own halo stroke goes - the fill covers it, and a
        // 6 px stroke would spill over the neighbouring rows)
        const used = new Set();
        seg = seg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (m, attrs, inner) => {
            const c = cellAt(cells, num(attrs, 'x'), num(attrs, 'y'));
            if (!c) return keyUnderlay('text', attrs, inner, ink);
            used.add(c.src);
            return `<rect data-vu-cell="1" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${ink}" stroke="none"/>`;
        });
        for (const src of used) seg = seg.split(src).join('');
        seg = seg
            .replace(/<circle\b([^>]*?)\/?>/g, (m, attrs) => {
                const f = (/\sfill="([^"]*)"/.exec(attrs) || [])[1];
                return f !== undefined && f !== 'none' ? keyUnderlay('circle', attrs, '', ink).replace('<circle', '<circle data-vu="1"') : m;
            });
        seg = mergeDotUnderlays(seg, ink);
    }
    return seg.replace(/<(rect|line|circle|path|text)\b([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
        if (key && (/\sstroke="none"/.test(attrs))) return m;     // an underlay (above): no stroke
        const fillAttr = (/\sfill="([^"]*)"/.exec(attrs) || [])[1];
        const filledMark = tag === 'text' || (tag !== 'line' && fillAttr !== undefined && fillAttr !== 'none');
        const rest = attrs.replace(/\s(stroke|stroke-width|fill|stroke-linecap|stroke-linejoin|vector-effect)="[^"]*"/g, '');
        return `<${tag}${rest} fill="${filledMark ? ink : 'none'}" stroke="${ink}" stroke-width="${VOCAB_HALO_W}" stroke-linejoin="round" stroke-linecap="round" ${NS}${close}>`;
    });
}
/**
 * Where the focal part is drawn: 'screen' in the twin (halo hidden until answered), 'key' on a printed answer key (ctx.keyPage,
 * answered), else none - the printed pupil page, a model on a pupil page, the error-analysis work.
 */
const focalMode = (ctx) => (isTwin(ctx) ? 'screen' : ctx && ctx.keyPage && ctx.state === 'answered' ? 'key' : '');
function bodyFor(id, mode) {
    const fb = focalBody(id);
    if (!mode) return fb.replace(SENT, '');
    const segs = [...fb.matchAll(/\u0001([^\u0001\u0002]*)\u0002/g)].map((m) => m[1]);
    // (screen: the class mq-v-feedback keeps the screen cell's black-and-white ink pass, screen-cell.js monoCell, off the
    // halo - it is feedback chrome, as the host's green and red are; the r7 render drew the yellow halo grey)
    const halo = `<g class="${VOCAB_HALO_CLASS}${mode === 'screen' ? ' mq-v-feedback' : ''}" aria-hidden="true"${mode === 'screen' ? ' visibility="hidden"' : ''} style="color:${GREY}">${segs.map((x) => haloOf(x, mode === 'key' ? GREY : 'currentColor', mode === 'key', mode === 'key' ? cellsOf(fb) : [])).join('')}</g>`;
    // (the key leaves the drawing itself exactly as the pupil page draws it: a key page paints every mark it does not share
    // with the pupil page in its key ink, so a wrapped focal part printed orange - r7 render. Its halo is the targeted mark.)
    if (mode === 'key') return halo + fb.replace(SENT, '');
    return halo + fb.replace(/\u0001([^\u0001\u0002]*)\u0002/g, (m, x) => `<g class="${VOCAB_FOCAL_CLASS}" data-vfocal="1">${x}</g>`);
}

/**
 * The printed size (mm) of a picture fitted to a `wMm` x `hMm` box (default 3 : 2), and its scale (mm a canvas unit).
 * The box is the cell's room: the picture is drawn as large as its own extent allows inside it.
 */
/**
 * The base-ten pictures whose fit sets the unit of an item (owner ruling OQ-1, 2026-11-08: the unit is PER ITEM, one unit
 * within an item): with a hundred in the item, all three (the hundred's tenth); without one, the one and the ten (the ten
 * rod's tenth), so "one" and "ten" print with a larger unit when no hundred shares their item. `set`: the item's words
 * (default: the picture alone).
 */
export const base10UnitSet = (id, set) => ((Array.isArray(set) ? set : [id]).map(String).concat(String(id)).includes('hundred') ? BASE10_IDS : ['one', 'ten']);

export function vocabPictureFit(id, wMm = 46, hMm, set) {
    const e = vocabPictureExtent(id);
    if (!e) return null;
    const bw = Math.max(PIC_WIDTHS.min, Math.min(PIC_WIDTHS.max, Number(wMm) || 46));
    const bh = Number(hMm) > 0 ? Number(hMm) : bw * PIC_CANVAS.h / PIC_CANVAS.w;
    // a base-ten picture takes the scale at which every base-ten picture of its ITEM fits the box (base10UnitSet), so one
    // unit prints the same within the item (V16)
    const scale = BASE10_IDS.includes(String(id))
        ? Math.min(...base10UnitSet(id, set).map((b) => { const eb = vocabPictureExtent(b); return Math.min(bw / eb.w, bh / eb.h); }))
        : Math.min(bw / e.w, bh / e.h);
    return { wMm: r2(e.w * scale), hMm: r2(e.h * scale), scale };
}

/**
 * The print size (pt) of a picture's largest text when it is fitted to a `wMm` x `hMm` box (null: the picture prints no text).
 * Match 3 sets one caption size per row from it (lf-vocab r16, critic r5 nit 6; ws-vocab-unit V-CAPTION).
 */
export function vocabPictureTextPt(id, wMm = 46, hMm, set) {
    if (!hasVocabPicture(id)) return null;
    const sizes = [...bodyFor(id, '').matchAll(/<text\b[^>]*\sfont-size="([-\d.]+)"/g)].map((m) => Number(m[1])).filter((x) => x > 0);
    if (!sizes.length) return null;
    const fit = vocabPictureFit(id, wMm, hMm, set);
    return Math.max(...sizes) * fit.scale / 0.3528;
}

/**
 * The picture of a word, fitted to a `wMm` x `hMm` box (wMm 34-82 mm; hMm by default 2 : 3 of wMm), cropped to its own
 * marks. In the screen twin the same drawing at the host's --mq-k2 scale (one drawing, two scales, SP-1).
 * @returns {string} an inline SVG ('' for a word the library has no picture of)
 */
export function vocabPictureSVG(ctx, id, { wMm = 46, hMm, minPx = 0, set, printFloor = false, textPt = 0 } = {}) {
    if (!hasVocabPicture(id)) return '';
    const e = vocabPictureExtent(id);
    const fit = vocabPictureFit(id, wMm, hMm, set);
    // (`textPt`: the row's one caption size - a picture whose text would print larger is drawn at the scale that prints it at
    // that size, never larger than its box allows; lf-vocab r16 V-CAPTION)
    const own = textPt > 0 ? vocabPictureTextPt(id, wMm, hMm, set) : null;
    const w = own && own > textPt ? r2(fit.wMm * textPt / own) : fit.wMm;
    const body = bodyFor(id, focalMode(ctx));
    // (never wider than its host: a Match 3 cell in a narrow anchor-chart panel scales its pictures to the panel rather
    // than letting them spill over the letters - precritic print-lint lesson L, 2026-11-07: L-OVERFLOW / ILLEGIBLE)
    // (screen: `minPx` keeps the picture's text >= 14 px on a phone - critic r1 D8: 6-9 px digits at 390 px)
    const ar = `aspect-ratio:${r2(e.w)} / ${r2(e.h)};`;
    // (a base-ten picture's screen floor is the set's: the hundred's floor, the ten and one in proportion - one unit)
    if (minPx && BASE10_IDS.includes(String(id))) minPx = minPx * e.w / Math.max(...base10UnitSet(id, set).map((b) => vocabPictureExtent(b).w));
    // (`printFloor`, lf-vocab r14: a screen twin never narrower than the same picture on paper - the twin unit is 3.4 px, under a
    // CSS mm - so its marks are at least their print size, ws-screen-ink-size SIZE-INK)
    const floors = [minPx ? `${minPx}px` : '', L(ctx, w), printFloor ? `${r2(w)}mm` : ''].filter(Boolean);
    const size = isTwin(ctx) ? `width:${floors.length > 1 ? `max(${floors.join(', ')})` : floors[0]};max-width:100%;height:auto;${ar}` : `width:${r2(w)}mm;max-width:100%;height:auto;${ar}`;
    return `<svg class="mq-vpic" data-vpic="${esc(id)}" viewBox="${r2(e.x)} ${r2(e.y)} ${r2(e.w)} ${r2(e.h)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(PICS[id].alt)}"`
        + ` style="display:block;${size}overflow:visible;font-family:'Andika','Open Sans',sans-serif;font-feature-settings:'cv04' 1;font-variant-numeric:lining-nums proportional-nums;" fill="#000">${body}</svg>`;
}

export default { vocabPictureTextPt, vocabPictureTeaches, VOCAB_ALSO_SHOWS, vocabPictureAlsoShows, VOCAB_FEATURES, vocabReadFeatures, vocabReadMarks, vocabPictureReadFeatures, vocabPictureFeatures, PIC_CANVAS, PIC_WIDTHS, BASE10_IDS, VOCAB_FOCAL_CLASS, VOCAB_HALO_CLASS, VOCAB_HALO_W, vocabPictureFocal, base10UnitSet, vocabPictureReferent, VOCAB_HEAVY, VOCAB_PICTURE_IDS, hasVocabPicture, vocabPictureAlt, vocabPictureSVG, vocabPictureExtent, vocabPictureFit };
