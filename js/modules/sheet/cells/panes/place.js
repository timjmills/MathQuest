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
import { SW, GREY, n2, st, text, mm, by, opOf, num, row, col, answerOf } from './kit.js';

const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M' };
const PLACE_NAME = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions' };
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
// FIXED PLACE ZONES (vis_supports_wiring, 2026-09-25): hundreds in a block three wide (up to three
// rows), tens as up to nine sticks, ones two wide - each place in its own zone, as wide as nine of
// that place needs, so every sketch of a page is one width (the picture stands in the same place in
// every cell, and the zone never tells how many there are), and two numbers' sketches stacked one
// over the other line up hundreds under hundreds. `digits` is the page's number size (2 or 3).
function quick(c, n, digits = String(Math.floor(Math.abs(n))).length) {
    const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
    const SQ = 11, PH = SQ + 2.5, STICK = 20, TP = 4, DOT = 5.5, OP = 6.5, GAP = 4;
    const hasH = digits >= 3 || h > 0, hasT = digits >= 2 || t > 0;
    const wH = hasH ? 3 * PH - 2.5 : 0, wT = hasT ? 9 * TP : 0, wO = OP + DOT;
    const H = Math.max(STICK, h ? Math.ceil(h / 3) * PH - 2.5 : 0, o ? Math.ceil(o / 2) * OP - 1 : 0);
    let body = '', x = 0;
    for (let k = 0; k < h; k++) {
        const r = Math.floor(k / 3), cc = k % 3;
        body += `<rect data-ws-block="100" x="${n2(x + cc * PH)}" y="${n2(H - SQ - r * PH)}" width="${SQ}" height="${SQ}" fill="none" ${st(c, SW.heavy)}/>`;
    }
    if (hasH) x += wH + GAP;
    for (let k = 0; k < t; k++) {
        body += `<line data-ws-block="10" x1="${n2(x + 1 + k * TP)}" y1="${n2(H - STICK)}" x2="${n2(x + 1 + k * TP)}" y2="${n2(H)}" ${st(c, SW.heavy)} stroke-linecap="round"/>`;
    }
    if (hasT) x += wT + GAP;
    for (let k = 0; k < o; k++) {
        const cx = x + DOT / 2 + (k % 2) * OP, cy = H - DOT / 2 - Math.floor(k / 2) * OP;
        body += `<circle data-ws-block="1" cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(DOT / 2 - SW.heavy / 2)}" fill="#fff" ${st(c, SW.heavy)}/>`;
    }
    return { w: x + wO, h: H, body };
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
// (VA-2). Under a calculation it ends in an ANSWER ROW (owner ruling 2026-09-25): one empty
// writing box per place, 14 mm at L, below a heavy rule, like a column sum on the chart. It is
// the pupil's WORKING place (`data-ws-graded="0"`, the problem keeps its own answer blank) and
// the key fills it (`ctx.key`). Columns cover the answer too (99 + 99 needs a hundreds column).
function pvGrid(c, rowsVals, op, { ans = NaN, key = false } = {}) {
    const answerRow = !!op;
    const places = placesFor(...rowsVals, ...(answerRow && Number.isFinite(ans) && ans >= 0 ? [ans] : []));
    const cw = 14, headH = 7, rh = by(c, { S: 12, M: 13, L: 14 }), ah = by(c, { S: 14, M: 14, L: 15 });
    const opW = op ? 9 : 0;
    const W = opW + places.length * cw;
    const Hn = headH + rowsVals.length * rh, H = Hn + (answerRow ? ah : 0);
    const dpt = c.S.digitPt;
    const base = (y, h) => y + h / 2 + mm(dpt) * 0.36;
    let body = '';
    places.forEach((pl, i) => {
        body += text(c, opW + i * cw + cw / 2, headH - 1.8, LETTER[pl] || String(pl), { pt: c.S.zonePt });
    });
    rowsVals.forEach((v, r) => {
        const s2 = String(v).padStart(places.length, ' ');
        const y = headH + r * rh;
        [...s2].forEach((ch, i) => { if (ch !== ' ') body += text(c, opW + i * cw + cw / 2, base(y, rh), ch, { pt: dpt }); });
        if (op && r === rowsVals.length - 1) body += text(c, opW / 2, base(y, rh), op === '+' ? '+' : op === '-' ? '−' : '×', { pt: dpt });
        if (r) body += `<line x1="${n2(opW)}" y1="${n2(y)}" x2="${n2(W)}" y2="${n2(y)}" ${st(c, SW.hair)}/>`;
    });
    if (answerRow) {
        const digits = key && Number.isFinite(ans) ? String(ans).padStart(places.length, ' ') : '';
        body += `<g data-ws-support-part="unknown" data-ws-graded="0">`;
        places.forEach((pl, i) => {
            body += `<rect x="${n2(opW + i * cw)}" y="${n2(Hn)}" width="${cw}" height="${n2(ah)}" fill="none" stroke="none"/>`;
            if (digits && digits[i] !== ' ') body += text(c, opW + i * cw + cw / 2, base(Hn, ah), digits[i], { pt: dpt, weight: 400, attrs: ' data-ws-key="1"' });
        });
        body += '</g>';
    }
    for (let i = 1; i < places.length; i++) body += `<line x1="${n2(opW + i * cw)}" y1="0" x2="${n2(opW + i * cw)}" y2="${n2(H)}" ${st(c, SW.hair)}/>`;
    body += `<line x1="${n2(opW)}" y1="${headH}" x2="${n2(W)}" y2="${headH}" ${st(c, SW.hair)}/>`;
    if (answerRow) body += `<line x1="${n2(opW)}" y1="${n2(Hn)}" x2="${n2(W)}" y2="${n2(Hn)}" ${st(c, SW.rule)}/>`;
    body += `<rect x="${n2(opW)}" y="0" width="${n2(W - opW)}" height="${n2(H)}" fill="none" ${st(c, SW.heavy)}/>`;
    return { w: W, h: H, body };
}

/* ------------------------------------------------------------------ rounding on a place-value chart */

// Research (§S4.1): pupils find WHICH digit to change by marking the rounding place and the digit
// to its right — "underline / circle the place, box the digit next door", the "rounding digit"
// and the "decider digit" (common US and UK classroom practice; NCETM Y4-Y5 place value, "What is
// 4773 rounded to the nearest hundred?"). A place-value chart makes the place visible even for
// big numbers rounded to a small place. Our marks: a RING round the digit in the rounding place,
// named under its column; an UNDERLINE under its right-hand neighbour, "look here"; an optional
// RULE strip; and an ANSWER ROW in the same columns. Each is its own level so they fade:
//   level 4  ring + look-here + rule + answer row with the zeros pre-marked (grey placeholders)
//   level 3  ring + look-here + rule + answer row
//   level 2  ring + look-here + answer row
//   level 1  ring + answer row
//   level 0  chart + answer row only
// Flags `ring`, `look`, `rule`, `answerRow`, `zeros` override the level one by one.
const roundOf = (n, place) => Math.round(n / place) * place;
function roundMarks(p, c = null) {
    const lv = Number.isInteger(num(p.level)) ? num(p.level) : 3;
    const pick = (k, on) => (typeof p[k] === 'boolean' ? p[k] : on);
    // No answer row where the chart is a SUPPORT (drawn without its own sentence, beside a problem
    // that has its own line: support-draw.js, the screen twin, the ladder) - a second, empty row
    // read as a second answer (critic pv-r2). On its own, the chart keeps its answer row.
    const asSupport = !!(c && c.raw && c.raw.sentence === false);
    return { ring: pick('ring', lv >= 1), look: pick('look', lv >= 2), rule: pick('rule', lv >= 3), answerRow: pick('answerRow', !asSupport), zeros: pick('zeros', lv >= 4) };
}

/** The rule strip: two short lines in a rounded box. A hint, black text, line ink. */
function ruleStrip(c, w) {
    const pt = c.S.zonePt, lh = mm(pt) * 1.35, pad = 2;
    const h = 2 * lh + 2 * pad;
    return {
        w, h,
        body: `<rect x="0" y="0" width="${n2(w)}" height="${n2(h)}" rx="2.5" fill="none" ${st(c, SW.hair)}/>`
            + text(c, 3, pad + lh * 0.78, '5 or more → round up.', { pt, anchor: 'start', weight: 400 })
            + text(c, 3, pad + lh * 1.78, '4 or less → keep it.', { pt, anchor: 'start', weight: 400 }),
    };
}

function roundPv(c, n, place, m, key) {
    const r = roundOf(n, place);
    const places = placesFor(n, r);
    const cw = by(c, { S: 12, M: 13, L: 14 }), headH = 7, rh = by(c, { S: 12, M: 13, L: 14 }), ah = by(c, { S: 14, M: 14, L: 15 });
    const W = places.length * cw;
    const Hn = headH + rh, H = Hn + (m.answerRow ? ah : 0);
    const dpt = c.S.digitPt, zpt = c.S.zonePt;
    const base = (y, h) => y + h / 2 + mm(dpt) * 0.36;
    const iR = places.indexOf(place), iL = iR + 1;
    let body = '';
    places.forEach((pl, i) => { body += text(c, i * cw + cw / 2, headH - 1.8, LETTER[pl] || String(pl), { pt: zpt }); });
    const s2 = String(n).padStart(places.length, ' ');
    [...s2].forEach((ch, i) => { if (ch !== ' ') body += text(c, i * cw + cw / 2, base(headH, rh), ch, { pt: dpt }); });
    if (m.answerRow) {
        const rs = String(r).padStart(places.length, ' ');
        body += '<g data-ws-support-part="unknown" data-ws-graded="0">';
        places.forEach((pl, i) => {
            body += `<rect x="${n2(i * cw)}" y="${n2(Hn)}" width="${cw}" height="${n2(ah)}" fill="none" stroke="none"/>`;
        });
        body += '</g>';
        // The zeros right of the rounding place: grey placeholders at the top level only (not when
        // the whole answer is 0, which would print it). The key writes every digit.
        places.forEach((pl, i) => {
            if (key && rs[i] !== ' ') body += text(c, i * cw + cw / 2, base(Hn, ah), rs[i], { pt: dpt, weight: 400, attrs: ' data-ws-key="1"' });
            else if (m.zeros && i > iR && r !== 0) body += text(c, i * cw + cw / 2, base(Hn, ah), '0', { pt: dpt, weight: 400, fill: GREY, attrs: ' data-ws-ink="trace" data-ws-placeholder="1"' });
        });
    }
    for (let i = 1; i < places.length; i++) body += `<line x1="${n2(i * cw)}" y1="0" x2="${n2(i * cw)}" y2="${n2(H)}" ${st(c, SW.hair)}/>`;
    body += `<line x1="0" y1="${headH}" x2="${n2(W)}" y2="${headH}" ${st(c, SW.hair)}/>`;
    if (m.answerRow) body += `<line x1="0" y1="${n2(Hn)}" x2="${n2(W)}" y2="${n2(Hn)}" ${st(c, SW.rule)}/>`;
    body += `<rect x="0" y="0" width="${n2(W)}" height="${n2(H)}" fill="none" ${st(c, SW.heavy)}/>`;
    // The marks, on top of the chart.
    const cy = headH + rh / 2;
    if (m.ring && iR >= 0) body += `<circle data-ws-mark="ring" cx="${n2(iR * cw + cw / 2)}" cy="${n2(cy)}" r="${n2(Math.min(cw, rh) / 2 - 0.9)}" fill="none" ${st(c, SW.rule)}/>`;
    if (m.look && iL < places.length) {
        const y = headH + rh - 1.6;
        body += `<line data-ws-mark="look" x1="${n2(iL * cw + 3)}" y1="${n2(y)}" x2="${n2(iL * cw + cw - 3)}" y2="${n2(y)}" ${st(c, SW.rule)} stroke-linecap="round"/>`;
    }
    // Captions under the chart: the place name under the ring (line 1), "look here" under the
    // underline (line 2), each centred on its column and allowed to run past it.
    let y = H + 1;
    const cap = mm(zpt) * 1.25;
    const capts = [];
    if (m.ring && iR >= 0) capts.push([iR, PLACE_NAME[place] || String(place), 700]);
    if (m.look && iL < places.length) capts.push([iL, 'look here', 400]);
    let minX = 0, maxX = W;
    capts.forEach(([i, label, weight]) => {
        const cx = i * cw + cw / 2, half = String(label).length * 0.55 * mm(zpt) / 2;
        minX = Math.min(minX, cx - half); maxX = Math.max(maxX, cx + half);
        y += cap;
        body += text(c, cx, y - cap * 0.22, label, { pt: zpt, weight });
    });
    let h = capts.length ? y + 1 : H;
    let out = { w: W, h, body };
    // Shift right if a caption runs off the left edge; widen for one off the right.
    if (minX < 0 || maxX > W) {
        const dx = minX < 0 ? -minX : 0;
        out = { w: maxX - minX, h, body: `<g transform="translate(${n2(dx)} 0)">${body}</g>` };
    }
    if (m.rule) out = col([out, ruleStrip(c, Math.max(out.w, by(c, { S: 50, M: 54, L: 58 })))], 3);
    return out;
}

/** The problem's own numeral with the two marks drawn on it (the lighter pane, `round-mark`). */
function roundMark(c, n, place) {
    // Digits are set a little apart (0.8 em) so the ring clears its neighbours and the comma.
    const dpt = c.S.digitPt, em = mm(dpt), dw = em * 0.8, cwid = em * 0.34;
    const s2 = Number(n).toLocaleString('en-US');
    const digits = String(n);
    const iR = digits.length - 1 - Math.round(Math.log10(place)), iL = iR + 1;
    const top = 1.5, baseY = top + em * 0.95;
    let x = 1.5, k = 0, body = '';
    const pos = [];
    for (const ch of s2) {
        if (ch === ',') { body += text(c, x + cwid / 2, baseY, ',', { pt: dpt, weight: 400 }); x += cwid; continue; }
        pos[k] = x + dw / 2;
        body += text(c, x + dw / 2, baseY, ch, { pt: dpt, weight: 400 });
        x += dw; k++;
    }
    const W = x + 1.5, cy = top + em * 0.6;
    if (iR >= 0) body += `<ellipse data-ws-mark="ring" cx="${n2(pos[iR])}" cy="${n2(cy)}" rx="${n2(em * 0.39)}" ry="${n2(em * 0.52)}" fill="none" ${st(c, SW.heavy)}/>`;
    if (iL < digits.length) {
        const y = baseY + em * 0.2;
        body += `<line data-ws-mark="look" x1="${n2(pos[iL] - em * 0.3)}" y1="${n2(y)}" x2="${n2(pos[iL] + em * 0.3)}" y2="${n2(y)}" ${st(c, SW.rule)} stroke-linecap="round"/>`;
    }
    return { w: W, h: baseY + em * 0.2 + 2, body };
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
    const pt = c.S.zonePt + 1;
    // The end labels stand centred on the end ticks: the pad holds half the longest one, so
    // "8,000,000" is never clipped at the drawing's edge (the plain rounding ladder to 1,000,000).
    const pad = Math.max(8, hi.toLocaleString('en-US').length * 0.56 * mm(pt) / 2 + 1);
    const len = by(c, { S: 90, M: 95, L: 100 });   // tick pitch 9-10 mm (RP-51)
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
const RPV_PLACES = [10, 100, 1000, 10000, 100000, 1000000];
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
            const digits = String(Math.max(a, b)).length;
            if (op === '-') return { ...quick(c, a, digits), label: `quick sketch of ${a}` };
            // One sketch over the other, in the same place zones (hundreds under hundreds).
            return { ...col([quick(c, a, digits), quick(c, b, digits)], 7), label: `quick sketches of ${a} and ${b}` };
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
            return { ...pvGrid(c, [num(p.a), num(p.b)], op, { ans: answerOf(p), key: !!(c.raw && c.raw.key) }), label: `place-value grid for ${p.a} and ${p.b}, answer row empty` };
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
        // Every place to 1,000,000 (owner 2026-09-26, the plain rounding ladder): the line is always
        // ten intervals with its two ends and halfway labelled, whatever the place.
        accepts(p) { return Number.isInteger(num(p.n)) && num(p.n) >= 0 && num(p.n) <= 9999999 && RPV_PLACES.includes(num(p.place || 10)); },
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
    'round-pv': {
        label: 'Rounding on a place-value chart', kind: 'model', grades: ['3', '4'], ops: ['round'], scaffold: 'hint', sentenceOff: true,
        accepts(p) {
            const n = num(p.n), place = num(p.place || 10);
            return Number.isInteger(n) && n >= 0 && n <= 9999999 && RPV_PLACES.includes(place) && place <= 10 ** String(n).length;
        },
        geom(p, c) {
            const place = num(p.place || 10), m = roundMarks(p, c);
            return { ...roundPv(c, num(p.n), place, m, !!(c.raw && c.raw.key)), label: `place-value chart of ${p.n}${m.ring ? `, the ${PLACE_NAME[place]} digit ringed` : ''}${m.look ? ', the digit to its right underlined' : ''}` };
        },
    },
    'round-mark': {
        label: 'Rounding marks on the number', grades: ['3', '4'], ops: ['round'], scaffold: 'hint', sentenceOff: true,
        accepts(p) {
            const n = num(p.n), place = num(p.place || 10);
            return Number.isInteger(n) && n >= 10 && n <= 9999999 && RPV_PLACES.includes(place) && place < 10 ** (String(n).length - 1) * 10 && place <= 10 ** (String(n).length - 1);
        },
        geom(p, c) {
            const place = num(p.place || 10);
            return { ...roundMark(c, num(p.n), place), label: `${p.n} with the ${PLACE_NAME[place]} digit ringed and the next digit underlined` };
        },
    },
};
