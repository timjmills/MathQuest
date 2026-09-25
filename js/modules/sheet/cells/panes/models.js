// js/modules/sheet/cells/panes/models.js
// The MODEL panes (design/SUPPORTS.md §S4.4): the number line (marked and open), arrays and area
// squares, grid paper, and the bar model.
//
// Research (§S4.1): the number line is one of the two representations the IES/WWC 2021 guide
// names outright (rec. 4); arrays lead to area (squares tiled edge to edge are the array with the
// gaps closed); grid paper with place heads is the standard alignment accommodation for pupils
// who lose their columns; the bar model (NCETM) carries part-whole and comparison.
//
// Pure module (SCC-01).

import { SW, n2, st, solid, text, mm, by, opOf, num, answerOf, downArrow } from './kit.js';
import { opGlyph } from '../../tokens.js';

const whole = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
const arrowHead = (c, x, y, dir) => `<path d="M${n2(x)} ${n2(y)}L${n2(x - dir * 3.2)} ${n2(y - 1.6)}L${n2(x - dir * 3.2)} ${n2(y + 1.6)}Z" ${solid(c)}/>`;

/* ------------------------------------------------------------------ marked number line (RP-50/51) */

// Ticks one apart (pitch 6 / 7 / 8 mm, RP-51: the pupil draws hops) when the span is 20 or less,
// otherwise tens, hundreds... Labels at every fifth tick, at both ends and at the start. The
// ANSWER'S tick is never labelled (RP-50/RP-1). The start is a solid 2.5 mm dot (RP-51).
function markedLine(c, { start, marks, answer }) {
    const vals = marks.filter(Number.isFinite);
    // Ones when the numbers lie within 20 of each other: the line runs from the five at or
    // below the smaller to the five at or above the bigger, at least ten ticks (7 + 5 draws 5 to
    // 15, not 0 to 20, so it stays readable in a half-width cell and on a phone). Wider spans
    // count in tens, hundreds...
    const mn = Math.min(...vals), mx = Math.max(...vals);
    let step = 1, lo, hi;
    if (mx - mn <= 15) {
        lo = Math.max(0, Math.floor(mn / 5) * 5); hi = Math.ceil(mx / 5) * 5;
        if (hi - lo < 10) hi = lo + 10;
        if (mx === hi) hi += 5;           // the answer never sits at the arrow's tip
    } else {
        step = 10;
        while ((mx - mn) / step > 15) step *= 10;
        lo = Math.floor(mn / step) * step; hi = Math.ceil(mx / step) * step;
        if (hi === lo) hi = lo + step;
    }
    const n = (hi - lo) / step;
    // A short line in tens (30 to 70 for 62 − 30) is spread to about 72 mm, so the pupil's hops
    // of ten from an off-tick start are big enough to draw and to read (RP-51 is the minimum).
    const pitch = step === 1 ? by(c, { S: 6, M: 7, L: 8 }) : Math.max(by(c, { S: 9, M: 10, L: 10 }), Math.min(18, by(c, { S: 64, M: 68, L: 72 }) / n));
    const pt = c.S.zonePt + 1;
    // A start that falls between two ticks (62 on a line in tens) is labelled ABOVE its dot.
    const offTick = Number.isFinite(start) && (start - lo) % step !== 0;
    const pad = 6, axisY = offTick ? 8 + mm(pt) * 1.1 : 7;
    const W = 2 * pad + n * pitch, H = axisY + 5 + mm(pt) * 1.3 + 1;
    const x = (v) => pad + ((v - lo) / step) * pitch;
    let body = `<line x1="${lo === 0 ? pad : 1}" y1="${axisY}" x2="${n2(W - 1)}" y2="${axisY}" ${st(c, SW.heavy)}/>`;
    if (lo !== 0) body += arrowHead(c, 0, axisY, -1);
    body += arrowHead(c, W, axisY, 1);
    for (let i = 0; i <= n; i++) {
        const v = lo + i * step;
        const big = step === 1 ? v % 5 === 0 : true;
        body += `<line x1="${n2(x(v))}" y1="${n2(axisY - (big ? 3 : 1.8))}" x2="${n2(x(v))}" y2="${n2(axisY + (big ? 3 : 1.8))}" ${st(c, big ? SW.heavy : SW.hair)}/>`;
        const labelled = (step === 1 ? v % 5 === 0 : true) || v === start;
        if (labelled && v !== answer) body += text(c, x(v), axisY + 5 + mm(pt) * 0.85, String(v), { pt, weight: v === start ? 700 : 400, ref: v !== start });
    }
    if (offTick) {
        body += `<line x1="${n2(x(start))}" y1="${n2(axisY - 2.2)}" x2="${n2(x(start))}" y2="${n2(axisY + 2.2)}" ${st(c, SW.heavy)}/>`;
        body += text(c, x(start), axisY - 4.4, String(start), { pt });
    }
    if (Number.isFinite(start)) body += `<circle data-ws-start="1" cx="${n2(x(start))}" cy="${axisY}" r="1.25" ${solid(c)}/>`;
    return { w: W, h: H, body };
}

/* ------------------------------------------------------------------ open number line */

// An empty line with arrowheads and ONE labelled tick: the start. For − the start sits at the
// right end (the pupil jumps back); for + at the left. The pupil draws the jumps (RP-52).
function openLine(c, start, back = false) {
    const W = by(c, { S: 96, M: 104, L: 112 }), axisY = 7, pt = c.S.zonePt + 2;
    const H = axisY + 5 + mm(pt) * 1.3 + 1;
    const sx = back ? W - 12 : 12;
    return {
        w: W, h: H,
        body: `<line x1="1" y1="${axisY}" x2="${n2(W - 1)}" y2="${axisY}" ${st(c, SW.heavy)}/>`
            + arrowHead(c, 0, axisY, -1) + arrowHead(c, W, axisY, 1)
            + `<line x1="${n2(sx)}" y1="${axisY - 3}" x2="${n2(sx)}" y2="${axisY + 3}" ${st(c, SW.heavy)}/>`
            + text(c, sx, axisY + 5 + mm(pt) * 0.85, String(start), { pt }),
    };
}

/* ------------------------------------------------------------------ arrays and area squares */

// Array: open circles 0.6 of the pitch (RP-81), 6 mm across (RP-5), a 1.5 mm subitising gap
// after the 5th row and column. Area: the same grid with the gaps closed — unit squares edge to
// edge, 0.5 pt interior, 0.75 pt every fifth line, 1.5 pt outline (RP-94's grid weights), each
// square at least 6.5 mm (RP-5, INK-20: a part to shade).
function arrayDots(c, rows, cols) {
    const d = 6, pitch = 10, gap = 1.5;
    const off = (k) => k * pitch + (k >= 5 ? gap : 0);
    let body = '';
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        body += `<circle data-ws-count="1" cx="${n2(off(k) + pitch / 2)}" cy="${n2(off(r) + pitch / 2)}" r="${n2(d / 2 - SW.hair / 2)}" fill="#fff" ${st(c, SW.hair)}/>`;
    }
    return { w: off(cols - 1) + pitch, h: off(rows - 1) + pitch, body };
}
function areaSquares(c, rows, cols) {
    const s = by(c, { S: 6.5, M: 7, L: 7.5 });
    const W = cols * s, H = rows * s;
    let body = '';
    for (let k = 1; k < cols; k++) body += `<line x1="${n2(k * s)}" y1="0" x2="${n2(k * s)}" y2="${n2(H)}" ${st(c, k % 5 ? SW.fine : SW.hair)}/>`;
    for (let r = 1; r < rows; r++) body += `<line x1="0" y1="${n2(r * s)}" x2="${n2(W)}" y2="${n2(r * s)}" ${st(c, r % 5 ? SW.fine : SW.hair)}/>`;
    body += `<rect x="0" y="0" width="${n2(W)}" height="${n2(H)}" fill="none" ${st(c, SW.heavy)}/>`;
    return { w: W, h: H, body };
}
/** ÷: the dividend as loose open counters in rows of ten (5 + gap + 5) for the pupil to ring
 *  into groups. Nothing is pre-grouped: grouping them IS the work, so nothing shows the answer. */
function ringable(c, n) {
    const d = 6, pitch = 8.5, gap = 3;
    const off = (k) => k * pitch + (k >= 5 ? gap : 0);
    let body = '';
    for (let i = 0; i < n; i++) {
        body += `<circle data-ws-count="1" cx="${n2(off(i % 10) + d / 2)}" cy="${n2(Math.floor(i / 10) * pitch + d / 2)}" r="${n2(d / 2 - SW.hair / 2)}" fill="#fff" ${st(c, SW.hair)}/>`;
    }
    const across = Math.min(10, n);
    return { w: off(across - 1) + d, h: (Math.ceil(n / 10) - 1) * pitch + d, body };
}

/* ------------------------------------------------------------------ grid paper */

// Digits in squares: bold place letters over the columns, a regroup row, the two operands (the
// sign in its own square, VA-2), the sum rule, and an EMPTY work row — a place to work, never
// scored (SF-41: a "Work here" box is never an answer place); the problem's own slot stays the
// answer place. Squares are 14 mm (writing places, RUBRIC C1 >= 14 mm); a start-here arrow and
// "Start" stand over the ones (H4 attention mark, the owner's list). Numbers go in right-aligned.
function gridPaper(c, a, b, op) {
    const A = String(a), B = String(b);
    const t = Math.max(A.length, B.length) + (op === '+' || op === '*' ? 1 : 0);
    const sq = 14, headH = 6, rgH = by(c, { S: 8, M: 9, L: 10 }), arrowH = 12;
    const workRows = op === '*' && B.length > 1 ? B.length + 1 : 1;
    const W = (t + 1) * sq;
    const y0 = arrowH;
    const yRg = y0 + headH, yA = yRg + rgH, yB = yA + sq, yRule = yB + sq;
    const H = yRule + workRows * sq;
    const dpt = c.S.digitPt;
    const names = ['O', 'T', 'H', 'Th', 'TTh', 'HTh'];
    const cx = (i) => sq + i * sq + sq / 2;   // i = track 0..t-1 (0 = leftmost digit track)
    const base = (y, h) => y + h / 2 + mm(dpt) * 0.36;
    let body = '';
    for (let i = 0; i < t; i++) body += text(c, cx(i), y0 + headH - 1.2, names[t - 1 - i] || '', { pt: c.S.zonePt });
    [...A.padStart(t, ' ')].forEach((ch, i) => { if (ch !== ' ') body += text(c, cx(i), base(yA, sq), ch, { pt: dpt }); });
    [...B.padStart(t, ' ')].forEach((ch, i) => { if (ch !== ' ') body += text(c, cx(i), base(yB, sq), ch, { pt: dpt }); });
    body += text(c, sq / 2, base(yB, sq), opGlyph(op), { pt: dpt });
    // Grid: vertical lines through every row below the heads, horizontal lines per row.
    for (let i = 1; i <= t; i++) body += `<line x1="${n2(i * sq)}" y1="${n2(yRg)}" x2="${n2(i * sq)}" y2="${n2(H)}" ${st(c, SW.hair)}/>`;
    for (const y of [yA, yB]) body += `<line x1="0" y1="${n2(y)}" x2="${n2(W)}" y2="${n2(y)}" ${st(c, SW.hair)}/>`;
    for (let r = 1; r < workRows; r++) body += `<line x1="0" y1="${n2(yRule + r * sq)}" x2="${n2(W)}" y2="${n2(yRule + r * sq)}" ${st(c, SW.hair)}/>`;
    body += `<rect x="0" y="${n2(yRg)}" width="${n2(W)}" height="${n2(H - yRg)}" fill="none" ${st(c, SW.heavy)}/>`;
    body += `<line x1="${sq}" y1="${n2(yRule)}" x2="${n2(W)}" y2="${n2(yRule)}" ${st(c, SW.rule)}/>`;
    body += `<rect data-ws-support-part="unknown" data-ws-graded="0" x="${sq}" y="${n2(yRule)}" width="${n2(W - sq)}" height="${n2(workRows * sq)}" fill="none" stroke="none"/>`;
    // Start here: over the ones column.
    const ox = cx(t - 1);
    body += text(c, ox - 4.2, 4.6, 'Start', { pt: c.S.zonePt, anchor: 'end' });
    body += downArrow(c, ox, 0.6, y0 + 0.4, 3);
    return { w: W, h: H, body };
}

/* ------------------------------------------------------------------ bar model (RP-70, RP-80) */

// Schematic, fixed proportions (RP-72: a bar's length never encodes its number). Bars 10 / 12 /
// 14 mm tall, 1.5 pt outline, 0.75 pt dividers. The unknown is its own box with a "?" in its
// top-left corner at zone-label size (LS-3/RP-70), exactly one per model; nothing is dashed.
function bar(c, p) {
    const op = opOf(p), a = num(p.a), b = num(p.b);
    const W = by(c, { S: 76, M: 80, L: 84 }), bh = by(c, { S: 10, M: 12, L: 14 });
    const pt = c.S.textPt + 3, zpt = c.S.zonePt;
    const numIn = (x, y, w, v) => text(c, x + w / 2, y + bh / 2 + mm(pt) * 0.36, String(v), { pt });
    const unknown = (x, y, w) => `<g data-ws-support-part="unknown"><rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${bh}" fill="none" ${st(c, SW.heavy)}/>`
        + text(c, x + 1.3, y + mm(zpt) * 0.95, '?', { pt: zpt, anchor: 'start' }) + '</g>';
    const box = (x, y, w, v) => `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${bh}" fill="none" ${st(c, SW.heavy)}/>${numIn(x, y, w, v)}`;
    const gap = 4;
    const y2 = bh + gap;
    let body = '', H = 2 * bh + gap;
    if (p.model === 'compare' && (op === '-' || op === '+')) {
        // Comparison: the bigger bar on top; the smaller under it, left-aligned; the difference
        // (−) or the bigger bar (+, "b more than a") is the unknown.
        const big = op === '-' ? a : NaN, small = op === '-' ? b : a;
        const sw = W * 0.6;
        if (op === '-') body += box(0, 0, W, big) + box(0, y2, sw, small) + unknown(sw, y2, W - sw);
        else body += unknown(0, 0, W) + box(0, y2, sw, small) + box(sw, y2, W - sw, b);
        return { w: W, h: H, body, label: 'comparison bar model' };
    }
    if (op === '+') {
        const s = W * 0.58;
        body += unknown(0, 0, W) + box(0, y2, s, a) + box(s, y2, W - s, b);
    } else if (op === '-') {
        const s = W * 0.58;
        body += box(0, 0, W, a) + box(0, y2, s, b) + unknown(s, y2, W - s);
    } else if (op === '*') {
        const pw = W / a;
        body += unknown(0, 0, W);
        for (let k = 0; k < a; k++) body += box(k * pw, y2, pw, b);
    } else if (op === '/') {
        const pw = W / b;
        body += box(0, 0, W, a);
        for (let k = 0; k < b; k++) body += k === 0 ? unknown(0, y2, pw) : `<rect x="${n2(k * pw)}" y="${n2(y2)}" width="${n2(pw)}" height="${bh}" fill="none" ${st(c, SW.heavy)}/>`;
    }
    return { w: W, h: H, body, label: 'part-whole bar model' };
}

/* ------------------------------------------------------------------ the pane geometries */

export const MODEL_PANES = {
    numberline: {
        label: 'Number line (marked)', grades: ['1', '2', '3', '4'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 1000);
            if (op !== '+' && op !== '-') return false;
            const ans = answerOf(p);
            return whole(a, 1000) && whole(b, 1000) && ans >= 0 && ans <= 1000;
        },
        geom(p, c) {
            const op = opOf(p);
            if (!op) return { ...markedLine(c, { start: num(p.n), marks: [0, num(p.n)], answer: NaN }), label: `number line to ${p.n}` };
            const a = num(p.a), ans = answerOf(p);
            return { ...markedLine(c, { start: a, marks: [a, ans], answer: ans }), label: `number line, start at ${a}` };
        },
    },
    openline: {
        label: 'Open number line', grades: ['2', '3', '4'], ops: ['+', '-'],
        accepts(p) {
            const op = opOf(p);
            return (op === '+' || op === '-') && whole(num(p.a), 99999) && whole(num(p.b), 99999);
        },
        geom(p, c) {
            const back = opOf(p) === '-';
            return { ...openLine(c, num(p.a), back), label: `open number line starting at ${p.a}` };
        },
    },
    array: {
        label: 'Array', grades: ['2', '3', '4'], ops: ['*', '/'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (op === '*') return whole(a, 10) && whole(b, 10) && a >= 1 && b >= 1;
            if (op === '/') return whole(a, 60) && a >= 1 && whole(b, 10) && b >= 1;
            return false;
        },
        geom(p, c) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (op === '/') return { ...ringable(c, a), label: `${a} counters to ring in groups of ${b}` };
            return { ...arrayDots(c, a, b), label: `array, ${a} rows of ${b}` };
        },
    },
    area: {
        label: 'Area squares', grades: ['3', '4'], ops: ['*'],
        accepts(p) { return opOf(p) === '*' && whole(num(p.a), 12) && whole(num(p.b), 12) && num(p.a) >= 1 && num(p.b) >= 1; },
        geom(p, c) { return { ...areaSquares(c, num(p.a), num(p.b)), label: `rectangle of squares, ${p.a} rows of ${p.b}` }; },
    },
    gridpaper: {
        label: 'Grid-paper squares', grades: ['2', '3', '4'], ops: ['+', '-', '*'], scaffold: 'structural', sentenceOff: true,
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (op === '+' || op === '-') return whole(a, 99999) && whole(b, 99999) && (op === '+' || b <= a);
            if (op === '*') return whole(a, 9999) && whole(b, 99);
            return false;
        },
        geom(p, c) { return { ...gridPaper(c, num(p.a), num(p.b), opOf(p)), label: `grid paper: ${p.a} ${opGlyph(opOf(p))} ${p.b} in squares` }; },
    },
    bar: {
        label: 'Bar model', grades: ['1', '2', '3', '4'], ops: ['+', '-', '*', '/'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
            if (op === '+') return a >= 0 && b >= 0;
            if (op === '-') return b <= a;
            if (op === '*') return whole(a, 10) && a >= 2;
            if (op === '/') return whole(b, 10) && b >= 2;
            return false;
        },
        geom(p, c) { return bar(c, p); },
    },
};

