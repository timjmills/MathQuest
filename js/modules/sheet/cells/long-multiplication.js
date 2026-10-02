// js/modules/sheet/cells/long-multiplication.js
// Two written methods for multiplication:long_multiplication ("Long Multiplication and Short
// Division", build list lane operations, entry 4; 4.NBT.B.5, 5.NBT.B.5, 4.NBT.B.6; WRM Y5 B5).
//
// `long-multiplication` - the column grid with one partial-product row per multiplier digit:
//
//         3  4  5  6           the top number on the digit tracks
//      ×        2  7           the multiplier; a 1.5 pt rule under it
//        [ ][ ][ ]             carries for the ones row (slim boxes, support 1-2)
//      2  4  1  9  2           partial product 1, on a grey digit grid    (3456 × 7)
//     [ ][ ][ ]                carries for the tens row
//    +6  9  1  2 (0)           partial product 2: the placeholder 0 in the ones (3456 × 20)
//     [ ][ ][ ][ ]             carries for the sum
//    ─────────────
//    [9][3][3][1][2]           the answer strip (SL-12), the only graded places
//
// Support (payload.level): 2 prints the placeholder 0 (trace grey) and names each row at the side
// ("(3456 × 7)", "(3456 × 20)"), with the carry boxes; 1 keeps the carry boxes and outlines the
// placeholder's place, no names; 0 is the grid alone. The grid, the rules, the "×" and "+" are
// structural and stay at every level (P-3).
//
// `short-division` - the "bus stop": the quotient strip over the dividend, the divisor outside
// the bracket, and (support 1-2) a small exchange box before every dividend digit after the
// first, where the pupil writes what is carried (6 ) 4 ⁴5 ³3 ⁵0 ...).
//
// Both draw in em of the digit size (ops-common.js: one drawing, print size on paper, the host's
// --mq-digit on screen). In the screen twin the answer strip's boxes are typed one digit each
// (data-mq-cell, joined "" by the caller); the partial-product rows and the carry / exchange boxes
// are scratch inputs (never graded), so the whole method can be worked in the cell.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, inked, box, esc, label, HAIR, HEAVY } from './ops-common.js';
import { INK, stripPos } from '../tokens.js';

/* ------------------------------------------------------------------------------ the maths */

/** Digits of a whole number, as a string. */
const S = (n) => String(Math.round(Number(n)));

/**
 * The long multiplication of a by a two-digit b, worked: each partial row's digits by place
 * (place 0 = ones), the carries each row writes (by the place they are carried INTO), the sum's
 * carries, and the product.
 */
export function longMultiplication(a, b) {
    const A = S(a), B = S(b);
    const rows = [];
    for (let k = 0; k < B.length; k++) {
        const m = Number(B[B.length - 1 - k]);
        const carries = {};
        let c = 0;
        for (let i = 0; i < A.length; i++) {
            const pr = Number(A[A.length - 1 - i]) * m + c;
            c = Math.floor(pr / 10);
            // a carry into the next digit of the top number is written over that digit's product
            if (c && i < A.length - 1) carries[i + 1 + k] = c;
        }
        rows.push({ k, m, value: Number(A) * m * 10 ** k, carries });
    }
    // the sum of the partial rows, column by column
    const sumCarries = {};
    const total = Number(A) * Number(B);
    let c = 0;
    const width = S(total).length;
    for (let p = 0; p < width; p++) {
        const col = rows.reduce((s, r) => s + Math.floor(r.value / 10 ** p) % 10, 0) + c;
        c = Math.floor(col / 10);
        if (c && p + 1 < width) sumCarries[p + 1] = c;
    }
    return { A, B, rows, sumCarries, total };
}

/** Short division of a by a one-digit d, worked: each quotient digit and the exchange INTO each digit. */
export function shortDivision(dividend, divisor) {
    const D = S(dividend), d = Number(divisor);
    const q = [];
    const exch = {};
    let r = 0;
    let started = false;
    for (let j = 0; j < D.length; j++) {
        const cur = r * 10 + Number(D[j]);
        if (j > 0 && r > 0) exch[j] = r;
        const digit = Math.floor(cur / d);
        // a leading quotient digit of 0 is not written (1530 ÷ 6: nothing over the 1)
        if (!started && digit === 0 && j < D.length - 1) q.push('');
        else { started = true; q.push(String(digit)); }
        r = cur - digit * d;
    }
    return { D, q, exch, remainder: r };
}

/* ------------------------------------------------------------------------------ geometry */

const trackOf = (ctx, g) => Math.max((ctx.metrics && ctx.metrics.trackMm) || 0, g.writeMm * 0.8);
const rowHOf = (g) => Math.max(g.writeMm, 6) + 1;
const slimOf = (g) => g.carryMm * 0.8;
// the exchange box's share of a short-division digit column, in tracks
const EX_W = 0.62;
// the operator gutter ("×", "+") of the multiplication grid, in tracks: the sign stands clear of the digits
const GUTTER = 1.6;

/** A scratch input for the screen twin: typed, never graded, outside the tab order. */
function scratch(labelText, small = false) {
    return `<input type="text" class="mq-work mq-opswork" inputmode="numeric" maxlength="1" autocomplete="off" spellcheck="false" tabindex="-1" `
        // inline !important: the hosts' generic input rules (a 44-50 px minimum, a white fill) would
        // otherwise overflow the grid cell and paint over its walls; the CELL is the target here
        + `data-ws-graded="0" aria-label="${esc(labelText)}" style="display:block!important;width:100%!important;height:100%!important;min-height:0!important;`
        + `min-width:0!important;box-sizing:border-box;border:0!important;box-shadow:none!important;background:transparent!important;border-radius:0!important;`
        + `text-align:center;font-family:inherit!important;font-size:${small ? '0.6em' : '0.9em'}!important;color:#000!important;padding:0!important;margin:0!important;">`;
}

/** A grid cell at (col, row). */
const at = (content, col, row, extra = '') =>
    `<span style="grid-column:${col};grid-row:${row};display:flex;align-items:center;justify-content:center;${extra}">${content}</span>`;

/* ------------------------------------------------------------------------ long multiplication */

function lmKey(p) {
    const w = longMultiplication(p.a, p.b);
    const T = S(w.total);
    // the grid is as wide as the LONGEST product this size can have (a 4-digit × 2-digit product
    // has at most 6 digits), never this product's own length: that would give the answer away (L3)
    const n = Math.max(w.A.length + w.B.length, T.length);
    const slots = {};
    const t = T.padStart(n, ' ');
    for (let i = 0; i < n; i++) slots[`t-${i}`] = t[i] === ' ' ? '' : t[i];
    return { w, n, slots };
}

function lmFootprint(p, ctx) {
    const g = geo(ctx);
    const { w, n } = lmKey(p);
    const tr = trackOf(ctx, g);
    const lvl = Number(p.level) || 0;
    const single = w.B.length === 1;
    const notes = lvl >= 2 && !single ? (`(${w.A} × ${Number(w.B[0]) * 10})`.length * 0.5 * g.zoneEm * g.E + 3) : 0;
    const slim = lvl >= 1 ? (single ? 1 : 3) * (slimOf(g) + 0.6) : 0;
    return {
        wMm: Math.ceil((n + GUTTER) * tr + notes + 8),
        hMm: Math.ceil(2 * g.E * 1.25 + (single ? 0 : 2 * rowHOf(g)) + g.stripMm + slim + 10),
        tracks: n + 1,
    };
}

register('long-multiplication', {
    render(p, ctx) {
        const g = geo(ctx);
        const { w, n, slots: keySlots } = lmKey(p);
        const lvl = Number(p.level) || 0;
        const tr = trackOf(ctx, g);
        const ink = inkOf(ctx);
        const vals = slotValues(ctx, keySlots, (v) => {
            const s = String(v).replace(/\D/g, '').padStart(n, ' ');
            const o = {};
            for (let i = 0; i < n; i++) o[`t-${i}`] = s[i] === ' ' ? '' : s[i];
            return o;
        });
        const showWork = ink !== null;                 // the key and a finished cell write the work
        // a one-digit multiplier is SHORT multiplication (Y5.B5.S1): its one row is the answer, so
        // there is no partial row, no sum and no row names - the carries sit over the answer strip
        const single = w.B.length === 1;
        const notes = lvl >= 2 && !single;
        const colOf = (place) => 1 + n - place;          // grid column of a place (1 = the operator gutter)
        const cols = `grid-template-columns:${g.em(tr * GUTTER)} repeat(${n}, ${g.em(tr)})${notes ? ' auto' : ''};`;
        const rowH = g.em(rowHOf(g));
        const slimH = g.em(slimOf(g));
        let html = '';
        let row = 0;
        const digitsRow = (str, r, extra = '') => {
            const s = str.padStart(n, ' ');
            for (let i = 0; i < n; i++) html += at(s[i] === ' ' ? '' : esc(s[i]), 2 + i, r, extra);
        };
        // the top number and the multiplier, the rule under the multiplier (structural)
        row++; digitsRow(w.A, row);
        row++;
        html += at('<span style="font-weight:700">×</span>', 1, row);
        digitsRow(w.B, row, `border-bottom:${HEAVY} solid ${INK.ink};`);
        const carryRow = (carries, places, r, id) => {
            // a slim box over every place a carry can land in (never only where one does: that
            // would say where the carries are)
            for (const pl of places) {
                const v = showWork && carries[pl] ? String(carries[pl]) : '';
                const inner = g.twin ? scratch(`carry, ${id}, place ${pl}`, true)
                    : (v ? `<span style="font-size:0.6em;line-height:1">${inked(v, ink)}</span>` : '');
                html += at(inner, colOf(pl), r, `box-sizing:border-box;height:${slimH};width:${g.em(tr * 0.62)};justify-self:center;`
                    + `border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm * 0.7)};background:#fff;`);
            }
        };
        const workRow = (rw, r, rowIdx) => {
            const val = S(rw.value).padStart(n, ' ');
            for (let i = 0; i < n; i++) {
                const place = n - 1 - i;
                const isPh = rw.k > 0 && place < rw.k;          // a placeholder place (the ones of the tens row)
                const ch = val[i] === ' ' ? '' : val[i];
                const grid = `box-sizing:border-box;height:${rowH};border-left:${HAIR} solid ${INK.grey};${i === n - 1 ? `border-right:${HAIR} solid ${INK.grey};` : ''}`
                    + `border-bottom:${HAIR} solid ${INK.grey};${rowIdx === 0 ? `border-top:${HAIR} solid ${INK.grey};` : ''}`;
                let inner = '';
                if (isPh && lvl >= 2) {
                    // the placeholder 0, given as a hint: trace grey (the pupil sees why the row starts one place left)
                    inner = `<span class="ws-trace" data-ws-ink="trace" style="color:${INK.grey}">0</span>`;
                } else if (showWork && ch) inner = inked(ch, ink);
                else if (g.twin) inner = scratch(`row ${rowIdx + 1}, place ${place}`);
                const ph = isPh && lvl === 1 ? `outline:${HAIR} solid ${INK.ink};outline-offset:-0.12em;border-radius:${g.em(g.rMm)};` : '';
                html += at(inner, 2 + i, r, grid + ph);
            }
            if (notes) {
                const mult = Number(rw.m) * 10 ** rw.k;
                html += at(label(g, `(${w.A} × ${mult})`, { bold: false }), n + 2, r, `justify-content:flex-start;padding-left:${g.em(2)};`);
            }
        };
        if (single && lvl >= 1) {
            row++;
            const places = [];
            for (let pl = 1; pl < w.A.length; pl++) places.push(pl);
            carryRow(w.rows[0].carries, places, row, 'row 1');
        }
        if (!single) w.rows.forEach((rw, idx) => {
            if (lvl >= 1) {
                row++;
                const places = [];
                for (let pl = 1 + rw.k; pl < w.A.length + rw.k; pl++) places.push(pl);
                carryRow(rw.carries, places, row, `row ${idx + 1}`);
            }
            row++;
            if (idx === w.rows.length - 1 && w.rows.length > 1) html += at('<span style="font-weight:700">+</span>', 1, row);
            workRow(rw, row, idx);
        });
        if (lvl >= 1 && !single) {
            row++;
            const places = [];
            for (let pl = 1; pl < n; pl++) places.push(pl);
            carryRow(w.sumCarries, places, row, 'sum');
        }
        // the answer strip under the sum rule (SL-12): the only graded places
        row++;
        for (let i = 0; i < n; i++) {
            const id = `t-${i}`;
            html += at(box(g, id, {
                wMm: tr, hMm: g.stripMm, value: vals[id] || '', ink, mark: 'cell', seg: stripPos(i, n),
                graded: keySlots[id] !== '',
            }), 2 + i, row, `border-top:${HEAVY} solid ${INK.ink};padding-top:${g.em(1.2)};`);
        }
        const rowsTpl = [];
        rowsTpl.push('auto', 'auto');
        if (single) { if (lvl >= 1) rowsTpl.push(slimH); } else {
            w.rows.forEach(() => { if (lvl >= 1) rowsTpl.push(slimH); rowsTpl.push(rowH); });
            if (lvl >= 1) rowsTpl.push(slimH);
        }
        rowsTpl.push('auto');
        return root(g, 'longmult',
            `<div role="group" aria-label="${esc(`${w.A} times ${w.B}`)}" style="display:inline-grid;${cols}grid-template-rows:${rowsTpl.join(' ')};`
            + `row-gap:${g.em(0.6)};align-items:stretch;margin:0 auto">${html}</div>`,
            'text-align:center;', lmFootprint(p, ctx).wMm);
    },
    answerKey(p) {
        const { w, slots: ks } = lmKey(p);
        const slots = {};
        for (const [id, v] of Object.entries(ks)) slots[id] = { value: v, graded: v !== '' };
        slots.answer = { value: S(w.total), graded: true };
        return { value: w.total, display: S(w.total), slots };
    },
    footprint(p, ctx) {
        const f = lmFootprint(p, ctx);
        // three to a row when the grid is narrow enough (short multiplication, a 3-digit grid with no
        // row names): two would leave a third of each cell empty (H13)
        return Object.assign(f, { measure: true, factLike: false, maxCols: f.wMm <= 58 ? 3 : 2 });
    },
    inputs(p) {
        const { n } = lmKey(p);
        return Array.from({ length: n }, (_, i) => ({
            id: `t-${i}`, kind: 'digit', shape: 'box', graded: true, order: i, maxLength: 1, inputmode: 'numeric', scopes: ['full', 'answer-only'],
        }));
    },
    layout() { return { card: 'card-division', checker: 'value', requiresVisual: true }; },
});

/* ------------------------------------------------------------------------------ short division */

function sdKey(p) {
    const sd = shortDivision(p.dividend, p.divisor);
    const slots = {};
    sd.q.forEach((v, i) => { slots[`q-${i}`] = v; });
    return { sd, slots, quotient: Math.floor(Number(p.dividend) / Number(p.divisor)) };
}

function sdFootprint(p, ctx) {
    const g = geo(ctx);
    const n = S(p.dividend).length, dv = S(p.divisor).length;
    const tr = trackOf(ctx, g);
    const ex = (Number(p.level) || 0) >= 1 ? tr * EX_W : 0;
    return {
        wMm: Math.ceil((dv + 1.1) * tr + n * (tr + ex) + 8),
        hMm: Math.ceil(g.stripMm + g.E * 1.4 + 8),
        tracks: n + dv + 1,
    };
}

register('short-division', {
    render(p, ctx) {
        const g = geo(ctx);
        const { sd, slots: ks } = sdKey(p);
        const D = sd.D, V = S(p.divisor);
        const n = D.length, dv = V.length;
        const lvl = Number(p.level) || 0;
        const tr = trackOf(ctx, g);
        const ex = lvl >= 1 ? tr * EX_W : 0;
        const ink = inkOf(ctx);
        const vals = slotValues(ctx, ks, (v) => {
            const s = String(v).replace(/\D/g, '').padStart(n, ' ');
            const o = {};
            for (let i = 0; i < n; i++) o[`q-${i}`] = s[i] === ' ' ? '' : s[i];
            return o;
        });
        const cols = `grid-template-columns:repeat(${dv}, ${g.em(tr)}) ${g.em(tr * 1.1)} repeat(${n}, ${g.em(tr + ex)});`;
        let html = '';
        // the quotient strip, each box over its dividend digit (right of the exchange box)
        for (let i = 0; i < n; i++) {
            const id = `q-${i}`;
            // each quotient box stands alone over its digit (the exchange boxes sit between the digits)
            html += at(box(g, id, { wMm: tr * 0.92, hMm: g.stripMm, value: vals[id] || '', ink, mark: 'cell', graded: ks[id] !== '' }),
                dv + 2 + i, 1, `justify-content:flex-end;align-items:flex-end;padding-bottom:0.08em;`);
        }
        for (let i = 0; i < dv; i++) html += at(esc(V[i]), i + 1, 2);
        const arc = `<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:100%;overflow:visible">`
            + `<path d="M1.5 0 H10 M1.5 0 Q9 20 1.5 40" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}" vector-effect="non-scaling-stroke"/></svg>`;
        html += `<span style="grid-column:${dv + 1};grid-row:2;align-self:stretch;display:block">${arc}</span>`;
        for (let i = 0; i < n; i++) {
            let exBox = '';
            if (lvl >= 1) {
                // the exchange box: small, raised, before the digit (never before the first digit)
                const v = ink !== null && sd.exch[i] ? String(sd.exch[i]) : '';
                const inner = i === 0 ? '' : g.twin ? scratch(`exchange into digit ${i + 1}`, true)
                    : (v ? `<span style="font-size:0.5em;line-height:1">${inked(v, ink)}</span>` : '');
                exBox = i === 0 ? `<span style="display:inline-block;width:${g.em(ex)}"></span>`
                    : `<span style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${g.em(ex * 0.86)};height:${g.em(slimOf(g))};`
                    + `align-self:flex-start;margin-top:0.08em;border:${HAIR} solid ${INK.ink};border-radius:${g.em(g.rMm * 0.6)};background:#fff;">${inner}</span>`;
            }
            html += at(`${exBox}<span style="display:inline-block;width:${g.em(tr)};text-align:center">${esc(D[i])}</span>`, dv + 2 + i, 2,
                `justify-content:flex-end;align-items:center;border-top:${HEAVY} solid ${INK.ink};`);
        }
        return root(g, 'shortdiv',
            `<div role="group" aria-label="${esc(`${D} divided by ${V}`)}" style="display:inline-grid;${cols}grid-template-rows:auto ${g.em(g.E * 1.35)};align-items:stretch;margin:0 auto">${html}</div>`,
            'text-align:center;', sdFootprint(p, ctx).wMm);
    },
    answerKey(p) {
        const { slots: ks, quotient } = sdKey(p);
        const slots = {};
        for (const [id, v] of Object.entries(ks)) slots[id] = { value: v, graded: v !== '' };
        slots.answer = { value: String(quotient), graded: true };
        return { value: quotient, display: String(quotient), slots };
    },
    footprint(p, ctx) {
        return Object.assign(sdFootprint(p, ctx), { measure: true, factLike: false, maxCols: 3 });
    },
    inputs(p) {
        const n = S(p.dividend).length;
        return Array.from({ length: n }, (_, i) => ({
            id: `q-${i}`, kind: 'digit', shape: 'box', graded: true, order: i, maxLength: 1, inputmode: 'numeric', scopes: ['full', 'answer-only'],
        }));
    },
    layout() { return { card: 'card-division', checker: 'value', requiresVisual: true }; },
});
