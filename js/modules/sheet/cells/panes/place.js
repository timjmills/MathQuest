// js/modules/sheet/cells/panes/place.js
// The PLACE-VALUE panes (design/SUPPORTS.md §S4.3): base-ten blocks to scale, the base-ten quick
// sketch, place-value counters (disks), the place-value grid, the hundreds chart (top-down or
// bottom-up), and the two "parts of a number chart" for rounding — the rounding line and the
// rounding chart.
//
// Order of use (research, §S4.1): to-scale base-ten first (ten ones really are one ten long),
// then the quick sketch, then disks, whose size no longer carries the value (NCETM; Third Space /
// Nuffield manipulatives review). Charts and lines are the pictorial-to-abstract bridge.
//
// Pure module (SCC-01).

import { diskMatSVG } from '../pv.js';
import { SW, n2, st, text, mm, by, opOf, num, row, col, answerOf } from './kit.js';

const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh' };
const placesFor = (...vals) => {
    const digits = Math.max(2, ...vals.filter(Number.isFinite).map((v) => String(Math.floor(Math.abs(v))).length));
    return Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));
};
const whole = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;

/* ------------------------------------------------------------------ base-ten, to scale (RP-30) */

// Gridded blocks: a one is a u x u square, a ten a u x 10u rod with its ten segments ruled, so
// ten ones are exactly one ten long. u = 6 mm (RP-5: ones are counted by touching). Loose ones
// stand 2 wide x 5 high (RP-30). Numbers to 99: a hundred flat would be 60 mm square — for
// hundreds use the quick sketch or the disks.
const U = 6;
function blocks(c, n) {
    const tens = Math.floor(n / 10), ones = n % 10;
    const pitch = U + 1;
    let body = '', x = 0;
    for (let t = 0; t < tens; t++) {
        for (let k = 1; k < 10; k++) body += `<line x1="${n2(x)}" y1="${n2(k * U)}" x2="${n2(x + U)}" y2="${n2(k * U)}" ${st(c, SW.fine)}/>`;
        body += `<rect data-ws-block="10" x="${n2(x)}" y="0" width="${U}" height="${10 * U}" fill="none" ${st(c, SW.hair)}/>`;
        x += pitch;
    }
    if (tens && ones) x += 3;
    for (let k = 0; k < ones; k++) {
        const ux = x + (k % 2) * pitch, uy = 10 * U - U - Math.floor(k / 2) * pitch;
        body += `<rect data-ws-block="1" x="${n2(ux)}" y="${n2(uy)}" width="${U}" height="${U}" fill="none" ${st(c, SW.hair)}/>`;
    }
    const w = (x + (ones ? (ones > 1 ? 2 * pitch - 1 : U) : -1)) || U;
    return { w: Math.max(U, w), h: 10 * U, body };
}

/* ------------------------------------------------------------------ base-ten quick sketch (RP-31) */

// Open square = hundred, stick = ten, open dot = one, all 1.5 pt. The page prints the key once.
function quick(c, n) {
    const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
    const SQ = 11, STICK = 20, DOT = 5.5;
    const H = Math.max(STICK, h ? SQ : 0, o ? 5 * 6.5 - 1 : 0);
    let body = '', x = 0;
    for (let k = 0; k < h; k++) {
        body += `<rect data-ws-block="100" x="${n2(x)}" y="${n2(H - SQ)}" width="${SQ}" height="${SQ}" fill="none" ${st(c, SW.heavy)}/>`;
        x += SQ + 2.5;
    }
    if (h && (t || o)) x += 2;
    for (let k = 0; k < t; k++) {
        body += `<line data-ws-block="10" x1="${n2(x + 1)}" y1="${n2(H - STICK)}" x2="${n2(x + 1)}" y2="${n2(H)}" ${st(c, SW.heavy)} stroke-linecap="round"/>`;
        x += 4;
    }
    if (t && o) x += 3;
    for (let k = 0; k < o; k++) {
        const cx = x + DOT / 2 + (k % 2) * 6.5, cy = H - DOT / 2 - Math.floor(k / 2) * 6.5;
        body += `<circle data-ws-block="1" cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(DOT / 2 - SW.heavy / 2)}" fill="#fff" ${st(c, SW.heavy)}/>`;
    }
    if (o) x += (o > 1 ? 6.5 : 0) + DOT;
    return { w: Math.max(4, x), h: H, body };
}

/* ------------------------------------------------------------------ disks (reuses pv.js) */

/** Nest pv.js's disk mat (its own mm viewBox) at the origin of the pane. */
function diskMat(c, n, places) {
    const counts = {};
    let rest = n;
    for (const p of places) { counts[p] = Math.min(9, Math.floor(rest / p)); rest -= counts[p] * p; }
    const m = diskMatSVG({ places, counts, size: c.size });
    const w = m.widthMm + 1, h = m.heightMm + 1;
    const svg = m.svg
        .replace(/ width="[\d.]+mm" height="[\d.]+mm"/, ` x="0" y="0" width="${n2(w)}" height="${n2(h)}"`)
        .replace(/ role="img" aria-label="[^"]*"/, '')
        .replace(/ style="[^"]*"/, '');
    return { w, h, body: svg };
}

/* ------------------------------------------------------------------ place-value grid (RP-40) */

// A ruled chart: bold place letters over 14 mm columns (VA-30, P-SC-7), each operand's digits
// in their columns at the working digit size, the operation sign in its own narrow column
// (VA-2). NO answer row: the problem already has its answer place, and a pane never adds a
// second one (RUBRIC C1, "no doubled slots").
function pvGrid(c, rowsVals, op) {
    const places = placesFor(...rowsVals);
    const cw = 14, headH = 7, rh = by(c, { S: 12, M: 13, L: 14 });
    const opW = op ? 9 : 0;
    const W = opW + places.length * cw, H = headH + rowsVals.length * rh;
    const dpt = c.S.digitPt;
    let body = '';
    places.forEach((p, i) => {
        body += text(c, opW + i * cw + cw / 2, headH - 1.8, LETTER[p] || String(p), { pt: c.S.zonePt });
    });
    rowsVals.forEach((v, r) => {
        const s = String(v).padStart(places.length, ' ');
        const y = headH + r * rh;
        [...s].forEach((ch, i) => { if (ch !== ' ') body += text(c, opW + i * cw + cw / 2, y + rh / 2 + mm(dpt) * 0.36, ch, { pt: dpt }); });
        if (op && r === rowsVals.length - 1) body += text(c, opW / 2, y + rh / 2 + mm(dpt) * 0.36, op === '+' ? '+' : op === '-' ? '−' : '×', { pt: dpt });
        if (r) body += `<line x1="${n2(opW)}" y1="${n2(y)}" x2="${n2(W)}" y2="${n2(y)}" ${st(c, SW.hair)}/>`;
    });
    for (let i = 1; i < places.length; i++) body += `<line x1="${n2(opW + i * cw)}" y1="0" x2="${n2(opW + i * cw)}" y2="${n2(H)}" ${st(c, SW.hair)}/>`;
    body += `<line x1="${n2(opW)}" y1="${headH}" x2="${n2(W)}" y2="${headH}" ${st(c, SW.hair)}/>`;
    body += `<rect x="${n2(opW)}" y="0" width="${n2(W - opW)}" height="${n2(H)}" fill="none" ${st(c, SW.heavy)}/>`;
    return { w: W, h: H, body };
}

/* ------------------------------------------------------------------ hundreds chart */

// The 1-100 chart, whole or a window of rows. Its numbers are a REFERENCE SCALE (data-ws-ref):
// printed evenly in regular weight, none singled out except the START number, which is ringed
// (given information, H4). `bottomUp` puts 1-10 at the bottom so "up" means "more" (Bay-Williams
// & Fletcher 2017, the bottom-up hundred chart).
function hundreds(c, { rows, ring = null, bottomUp = false }) {
    const cs = by(c, { S: 7.5, M: 8, L: 8.5 });
    const pt = by(c, { S: 9, M: 10, L: 10 });
    const [r0, r1] = rows;
    const n = r1 - r0 + 1;
    let body = '';
    for (let r = r0; r <= r1; r++) {
        const yi = bottomUp ? (r1 - r) : (r - r0);
        for (let k = 0; k < 10; k++) {
            const v = r * 10 + k + 1;
            const x = k * cs, y = yi * cs;
            body += text(c, x + cs / 2, y + cs / 2 + mm(pt) * 0.36, String(v), { pt, weight: 400, ref: true });
            if (v === ring) body += `<circle cx="${n2(x + cs / 2)}" cy="${n2(y + cs / 2)}" r="${n2(cs / 2 - 0.6)}" fill="none" ${st(c, SW.heavy)}/>`;
        }
    }
    for (let k = 1; k < 10; k++) body += `<line x1="${n2(k * cs)}" y1="0" x2="${n2(k * cs)}" y2="${n2(n * cs)}" ${st(c, SW.hair)}/>`;
    for (let r = 1; r < n; r++) body += `<line x1="0" y1="${n2(r * cs)}" x2="${n2(10 * cs)}" y2="${n2(r * cs)}" ${st(c, SW.hair)}/>`;
    body += `<rect x="0" y="0" width="${n2(10 * cs)}" height="${n2(n * cs)}" fill="none" ${st(c, SW.heavy)}/>`;
    return { w: 10 * cs, h: n * cs, body };
}

/* ------------------------------------------------------------------ rounding line (RP-50, RP-41) */

// The two multiples at the ends, eleven ticks, and the MIDPOINT marked with a taller, heavier
// labelled tick — the one thing a struggling pupil needs to see which multiple is nearer. The
// number to round is NOT plotted: placing it is the pupil's work (pv.js RN-4). The two multiples
// and the midpoint are reference numbers (data-ws-ref): one of the multiples is the answer, as
// on every rounding line, and neither is marked.
function roundLine(c, n, place) {
    const lo = Math.floor(n / place) * place, hi = lo + place, mid = lo + place / 2;
    const len = by(c, { S: 90, M: 95, L: 100 }), pad = 8;   // tick pitch 9-10 mm (RP-51)
    const pt = c.S.zonePt + 1;
    const axisY = 8;
    const W = len + 2 * pad, H = axisY + 5 + mm(pt) * 1.4 + 1;
    let body = `<line x1="1" y1="${axisY}" x2="${n2(W - 1)}" y2="${axisY}" ${st(c, SW.heavy)}/>`
        + `<path d="M0 ${axisY}L3.2 ${axisY - 1.6}L3.2 ${axisY + 1.6}Z M${n2(W)} ${axisY}L${n2(W - 3.2)} ${axisY - 1.6}L${n2(W - 3.2)} ${axisY + 1.6}Z" fill="${c.grey ? '#949494' : '#000'}"/>`;
    for (let i = 0; i <= 10; i++) {
        const x = pad + (len * i) / 10;
        const end = i === 0 || i === 10, midT = i === 5;
        const up = midT ? 6 : end ? 4 : 2.5;
        body += `<line x1="${n2(x)}" y1="${n2(axisY - up)}" x2="${n2(x)}" y2="${n2(axisY + (end || midT ? 3 : 1.5))}" ${st(c, end || midT ? SW.heavy : SW.hair)}/>`;
    }
    const ly = axisY + 5 + mm(pt) * 0.9;
    body += text(c, pad, ly, lo.toLocaleString('en-US'), { pt, ref: true });
    body += text(c, pad + len, ly, hi.toLocaleString('en-US'), { pt, ref: true });
    body += text(c, pad + len / 2, ly, mid.toLocaleString('en-US'), { pt, weight: 400, ref: true, attrs: ' data-ws-mid="1"' });
    return { w: W, h: H, body };
}

// The rounding CHART: the part of the number chart from one multiple to the next, stood up with
// the bigger number at the top (RP-53: up is more), the halfway row boxed heavy.
function roundChart(c, n, place) {
    const lo = Math.floor(n / place) * place, step = place / 10;
    const cw = by(c, { S: 20, M: 21, L: 22 }), ch = by(c, { S: 6.5, M: 7, L: 7.5 });
    const pt = by(c, { S: 10, M: 10, L: 11 });
    let body = '';
    for (let i = 0; i <= 10; i++) {
        const v = lo + i * step, y = (10 - i) * ch;
        body += text(c, cw / 2, y + ch / 2 + mm(pt) * 0.36, v.toLocaleString('en-US'), { pt, weight: i === 5 ? 700 : 400, ref: true });
        if (i < 10) body += `<line x1="0" y1="${n2(y)}" x2="${n2(cw)}" y2="${n2(y)}" ${st(c, SW.hair)}/>`;
    }
    body += `<rect x="0" y="0" width="${n2(cw)}" height="${n2(11 * ch)}" fill="none" ${st(c, SW.heavy)}/>`;
    body += `<rect data-ws-mid="1" x="0" y="${n2(5 * ch)}" width="${n2(cw)}" height="${n2(ch)}" fill="none" ${st(c, SW.heavy)}/>`;
    return { w: cw, h: 11 * ch, body };
}

/* ------------------------------------------------------------------ the pane geometries */

const PLACES = [10, 100, 1000];
// The rounding panes' sentence is the number itself: the problem beside it already says "Round
// ... to the nearest ...", and repeating the words made the pane wider than its picture.
const roundSentence = (p) => Number(p.n).toLocaleString('en-US');

export const PLACE_PANES = {
    base10: {
        label: 'Base-ten blocks (to scale)', grades: ['1', '2', '3'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 99) && num(p.n) >= 1;
            if (op === '+') return whole(a, 99) && whole(b, 99) && a >= 1 && b >= 1;
            if (op === '-') return whole(a, 99) && whole(b, a);
            return false;
        },
        geom(p, c) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...blocks(c, num(p.n)), label: `base-ten blocks for ${p.n}` };
            // −: the blocks of the start number; the pupil crosses out (and trades a ten) himself.
            if (op === '-') return { ...blocks(c, a), label: `base-ten blocks for ${a}` };
            return { ...row([blocks(c, a), blocks(c, b)], 9, { align: 'bottom' }), label: `base-ten blocks for ${a} and ${b}` };
        },
    },
    'base10-quick': {
        label: 'Base-ten quick sketch', grades: ['2', '3', '4'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 999) && num(p.n) >= 1;
            if (op === '+') return whole(a, 999) && whole(b, 999) && a >= 1 && b >= 1;
            if (op === '-') return whole(a, 999) && whole(b, a);
            return false;
        },
        geom(p, c) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...quick(c, num(p.n)), label: `quick sketch of ${p.n}` };
            if (op === '-') return { ...quick(c, a), label: `quick sketch of ${a}` };
            // One sketch over the other: each number keeps its own line (and the pane its width).
            return { ...col([quick(c, a), quick(c, b)], 5), label: `quick sketches of ${a} and ${b}` };
        },
    },
    disks: {
        label: 'Place-value counters (disks)', grades: ['2', '3', '4'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 9999);
            if (op === '+') return whole(a, 9999) && whole(b, 9999);
            if (op === '-') return whole(a, 9999) && whole(b, a);
            return false;
        },
        geom(p, c) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...diskMat(c, num(p.n), placesFor(num(p.n))), label: `disks for ${p.n}` };
            const places = placesFor(a, b);
            if (op === '-') return { ...diskMat(c, a, places), label: `disks for ${a}` };
            return { ...col([diskMat(c, a, places), diskMat(c, b, places)], 3), label: `disks for ${a} and ${b}` };
        },
    },
    pvgrid: {
        label: 'Place-value grid', grades: ['2', '3', '4'], ops: ['count', '+', '-', '*'], scaffold: 'structural',
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 99999);
            if (op === '+' || op === '-' || op === '*') return whole(a, 99999) && whole(b, 99999);
            return false;
        },
        geom(p, c) {
            const op = opOf(p);
            if (!op) return { ...pvGrid(c, [num(p.n)], ''), label: `place-value grid for ${p.n}` };
            return { ...pvGrid(c, [num(p.a), num(p.b)], op), label: `place-value grid for ${p.a} and ${p.b}` };
        },
    },
    hundreds: {
        label: 'Hundreds chart', grades: ['1', '2', '3'], ops: ['count', '+', '-'], scaffold: 'structural',
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return whole(num(p.n), 100) && num(p.n) >= 1;
            if (op !== '+' && op !== '-') return false;
            const ans = answerOf(p);
            return whole(a, 100) && whole(b, 100) && a >= 1 && ans >= 1 && ans <= 100;
        },
        geom(p, c) {
            const op = opOf(p);
            const rowOf = (v) => Math.floor((v - 1) / 10);
            const ring = op ? num(p.a) : null;
            let rows = [0, 9];
            if (p.chart !== 'full') {
                const vs = op ? [num(p.a), answerOf(p)] : [num(p.n)];
                rows = [Math.max(0, Math.min(...vs.map(rowOf)) - 1), Math.min(9, Math.max(...vs.map(rowOf)) + 1)];
            }
            return { ...hundreds(c, { rows, ring, bottomUp: !!p.bottomUp }), label: `hundreds chart rows ${rows[0] * 10 + 1} to ${rows[1] * 10 + 10}` };
        },
    },
    'round-line': {
        label: 'Rounding number line', grades: ['3', '4'], ops: ['round'], scaffold: 'hint',
        accepts(p) { return Number.isInteger(num(p.n)) && num(p.n) >= 0 && PLACES.includes(num(p.place || 10)); },
        sentence: roundSentence,
        geom(p, c) {
            const place = num(p.place || 10);
            return { ...roundLine(c, num(p.n), place), label: `number line from ${Math.floor(p.n / place) * place} to ${Math.floor(p.n / place) * place + place}, halfway marked` };
        },
    },
    'round-chart': {
        label: 'Rounding chart (part of a number chart)', grades: ['3', '4'], ops: ['round'], scaffold: 'hint',
        accepts(p) { return Number.isInteger(num(p.n)) && num(p.n) >= 0 && PLACES.includes(num(p.place || 10)); },
        sentence: roundSentence,
        geom(p, c) {
            const place = num(p.place || 10);
            return { ...roundChart(c, num(p.n), place), label: `number chart from ${Math.floor(p.n / place) * place} up to the next ${place}, halfway boxed` };
        },
    },
};
