// js/modules/sheet/cells/tmkit.js
// The drawing pieces the P10 time + money templates share (clock, timeline, coins,
// money-columns). Nothing here registers a template. design/research/time-money.md §13 is the
// geometry; WORKSHEET_DESIGN_STANDARD.md §11.12 (RP-100 ... RP-104) the clock and §11.13
// (RP-110 ... RP-116, amended by the owner's rulings of 2026-09-25) the coins and notes.
//
// ONE DRAWING, TWO HOSTS. Like the K-2 kit (k2kit.js) every length is a paper millimetre; in the
// screen twin (`ctx.options.twin`) it is written `calc(var(--mq-k2) * n)`, so the practice card,
// the online worksheet and the quiz draw the very same face, coin and timeline.
//
// THE SLOTS. The time slot is two boxes with a printed colon (§6 "Time", RP-104); the money slot
// two boxes with a printed point (§13.8); a duration `[ ] h [ ] min`. In the twin each box
// carries `data-mq-cell` and the pair a `data-mq-join` (":" / "." / " h "), so the host's one
// answer input receives "3:45", "2.50" or "1 h 15" composed in reading order.
//
// INK. Black, white and the one grey (#949494) only: hints (guide rings, the minute ring in
// Guided, a pre-drawn hour hand) are the grey; nothing is ever coloured (INK-1, SCC-T6).
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { esc } from '../cell.js';
import { SLOT, blankWidth } from '../tokens.js';
import {
    L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, digitPt, textPt, zonePt, box, checkBox, svg, inkOf,
    KEY_FEATURES,
} from './k2kit.js';

export { L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, digitPt, textPt, zonePt, box, checkBox, svg, inkOf, esc };

/* ================================================================ states and values */

/** The level of hint the page role asks for: 3 Model, 2 Guided, 1 Independent, 0 Test. */
export const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);

/**
 * What a slot of a MULTI-part answer shows. `key` is {slotId: value}. On the pupil page
 * nothing; on the key and in a trace the key's value; in Error analysis the wrong work, read
 * from `ctx.wrong.slots` or, failing that, split out of `ctx.wrong.value` by `split`.
 */
export function partValue(ctx, id, key, split) {
    if (!ctx || ctx.state === 'blank') return '';
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        if (w.slots && w.slots[id] !== undefined && w.slots[id] !== null) return String(w.slots[id]);
        if (typeof split === 'function') {
            const parts = split(w.value);
            if (parts && parts[id] !== undefined && parts[id] !== null) return String(parts[id]);
        }
        return key && key[id] !== undefined ? String(key[id]) : '';
    }
    return key && key[id] !== undefined && key[id] !== null ? String(key[id]) : '';
}

/** "3:45" / "11:05" -> {hour: '3', minute: '45'}. */
export const splitTime = (v) => {
    if (v && typeof v === 'object' && v.hour !== undefined) return { hour: String(Number(v.hour) % 12 || 12), minute: String(v.minute).padStart(2, '0') };
    const m = /^\s*(\d{1,2})\s*:\s*(\d{1,2})/.exec(String(v === undefined || v === null ? '' : v));
    return m ? { hour: m[1], minute: m[2].padStart(2, '0') } : null;
};
/** "1 h 15 min" -> {hours: '1', minutes: '15'}. */
export const splitDuration = (v) => {
    const s = String(v === undefined || v === null ? '' : v);
    const h = /(\d+)\s*h/.exec(s), m = /(\d+)\s*min/.exec(s);
    if (!h && !m) return null;
    return { hours: h ? h[1] : '0', minutes: m ? m[1] : '0' };
};
/** "12.50" -> {whole: '12', cents: '50'}. */
export const splitMoney = (v) => {
    const m = /^\s*(\d+)\.(\d{1,2})\s*$/.exec(String(v === undefined || v === null ? '' : v));
    return m ? { whole: m[1], cents: m[2] } : null;
};
/** "2, 1, 3" -> {o0: '2', o1: '1', o2: '3'} (any prefix). */
export const splitList = (prefix) => (v) => {
    const parts = Array.isArray(v) ? v.map(String) : String(v === undefined || v === null ? '' : v).split(/\s*,\s*/);
    return Object.fromEntries(parts.map((x, i) => [`${prefix}${i}`, x]));
};

/* ================================================================ the time helpers */

/** 12-hour display: 0 and 12 are both 12 (RP-101: "12, never 0"). */
export const h12 = (h) => ((Math.round(Number(h)) % 12) + 12) % 12 || 12;
export const fmtTime = (h, m) => `${h12(h)}:${String(Math.round(Number(m)) || 0).padStart(2, '0')}`;
export const fmtDuration = (h, m) => `${h} h ${m} min`;
/** Minutes since midnight of a {h (0-23), m} time. */
export const toMin = (t) => ((Number(t.h) * 60 + Number(t.m)) % 1440 + 1440) % 1440;
export const fromMin = (x) => { const v = ((Math.round(x) % 1440) + 1440) % 1440; return { h: Math.floor(v / 60), m: v % 60 }; };
export const ampmOf = (t) => (Number(t.h) % 24 >= 12 ? 'p.m.' : 'a.m.');

/* ================================================================ the clock face (RP-100 ... RP-103) */

/** The face diameter for a precision and a response (§13.1, §13.2; RP-102). */
export function faceDiameter(ctx, { precision = 5, draw = false, choose = false, small = false } = {}) {
    const size = sizeOf(ctx);
    if (draw) return { S: 46, M: 50, L: 52 }[size];
    if (choose || small) return { S: 36, M: 38, L: 38 }[size];
    if (precision === 1) return { S: 46, M: 50, L: 52 }[size];
    return { S: 36, M: 42, L: 50 }[size];
}

const HAND_HOUR = 0.46, HAND_MIN = 0.78;

/** A hand from the centre at `deg` (0 = 12 o'clock, clockwise), with a solid arrow tip (RP-101). */
function hand(cx, cy, deg, len, wPt, color, attrs = '') {
    const a = (deg - 90) * Math.PI / 180;
    const w = wPt * PT_MM;
    const tip = w * 2.6;                          // the arrow head's length
    const ex = cx + (len - tip) * Math.cos(a), ey = cy + (len - tip) * Math.sin(a);
    const tx = cx + len * Math.cos(a), ty = cy + len * Math.sin(a);
    const px = -Math.sin(a) * w * 1.25, py = Math.cos(a) * w * 1.25;
    return `<g${attrs}><line x1="${n2(cx)}" y1="${n2(cy)}" x2="${n2(ex)}" y2="${n2(ey)}" stroke="${color}" stroke-width="${n2(w)}" stroke-linecap="round"/>`
        + `<path d="M${n2(tx)} ${n2(ty)}L${n2(ex + px)} ${n2(ey + py)}L${n2(ex - px)} ${n2(ey - py)}Z" fill="${color}"/></g>`;
}

/**
 * One analog face as an SVG in paper mm. `o`:
 *   D            diameter (mm)
 *   hour, minute the hands; omit `hands` (or false) for a face with no hands (RP-103e)
 *   hands        true | 'hour-grey' (Guided: the hour hand pre-drawn grey, RP-103e)
 *   handColor    INK or GREY (a traced key)
 *   ticks1       draw the 1-minute ticks (TR-9, TH-6)
 *   ring         false | 'black' | 'grey'  the outer minute ring 5 ... 55 at 1.14 R (RP-103c)
 *   guides       the hand-length guide rings (§13.2, ruling Q8); `guideLabels` on the Model
 *   half         the half-shaded face (RP-103d)
 *   missing      numerals left out of the face (clock_parts): their places stay empty
 *   labelHands   ['A', 'B'] letters beside the two hands (clock_parts "which is the hour hand")
 *   label        aria label
 */
export function faceSVG(ctx, o = {}) {
    const D = o.D || 42;
    const R = D / 2;
    const pad = o.ring ? R * 0.34 : (o.guides && o.guideLabels ? R * 0.28 : SW.heavy);
    const W = D + 2 * pad;
    const c = W / 2;
    const numPt = Math.max(0.12 * D / PT_MM, zonePt(ctx));
    const numMm = numPt * PT_MM;
    let s = '';
    if (o.half) s += `<path d="M${n2(c)} ${n2(c - 0.9 * R)}A${n2(0.9 * R)} ${n2(0.9 * R)} 0 0 1 ${n2(c)} ${n2(c + 0.9 * R)}Z" fill="${GREY}" data-tm-hint="half"/>`;
    s += `<circle cx="${n2(c)}" cy="${n2(c)}" r="${n2(R - SW.heavy / 2)}" fill="${o.half ? 'none' : '#fff'}" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    s += `<circle cx="${n2(c)}" cy="${n2(c)}" r="${n2(0.9 * R)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`;
    let ticks = '';
    for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0;
        if (!five && !o.ticks1) continue;
        const a = (i * 6 - 90) * Math.PI / 180;
        const r1 = 0.9 * R, r2 = (five ? 0.8 : 0.85) * R;
        ticks += `<line x1="${n2(c + r1 * Math.cos(a))}" y1="${n2(c + r1 * Math.sin(a))}" x2="${n2(c + r2 * Math.cos(a))}" y2="${n2(c + r2 * Math.sin(a))}" `
            + `stroke="${INK}" stroke-width="${n2(five ? SW.hair : SW.fine)}"/>`;
    }
    s += ticks;
    const missing = new Set((o.missing || []).map(Number));
    for (let i = 1; i <= 12; i++) {
        if (missing.has(i)) continue;
        const a = (i * 30 - 90) * Math.PI / 180;
        const r = 0.66 * R;
        s += `<text x="${n2(c + r * Math.cos(a))}" y="${n2(c + r * Math.sin(a) + numMm * 0.36)}" text-anchor="middle" `
            + `font-size="${n2(numMm)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}" data-tm-numeral="${i}">${i}</text>`;
    }
    if (o.ring) {
        const col = o.ring === 'grey' ? GREY : INK;
        const rMm = zonePt(ctx) * PT_MM * 0.9;
        for (let i = 1; i <= 12; i++) {
            const a = (i * 30 - 90) * Math.PI / 180;
            const r = 1.14 * R;
            const v = i === 12 ? 0 : i * 5;
            s += `<text x="${n2(c + r * Math.cos(a))}" y="${n2(c + r * Math.sin(a) + rMm * 0.36)}" text-anchor="middle" font-size="${n2(rMm)}" `
                + `font-family="Andika, 'Open Sans', sans-serif" fill="${col}" data-tm-hint="ring">${v === 0 ? '0' : v}</text>`;
        }
    }
    if (o.guides) {
        for (const [k, word] of [[HAND_HOUR, 'short'], [HAND_MIN, 'long']]) {
            s += `<circle cx="${n2(c)}" cy="${n2(c)}" r="${n2(k * R)}" fill="none" stroke="${GREY}" stroke-width="${n2(SW.fine)}" `
                + `stroke-dasharray="0.4 1.2" stroke-linecap="round" data-tm-hint="guide"/>`;
            if (o.guideLabels) {
                const a = (38 - 90) * Math.PI / 180;
                const rr = R + (word === 'short' ? 2.4 : 5.6);
                s += `<text x="${n2(c + rr * Math.cos(a))}" y="${n2(c + rr * Math.sin(a))}" font-size="${n2(zonePt(ctx) * PT_MM * 0.8)}" `
                    + `font-family="Andika, 'Open Sans', sans-serif" fill="${GREY}" data-tm-hint="guide">${word}</text>`;
            }
        }
    }
    if (o.hands) {
        const h = Number(o.hour) % 12, m = Number(o.minute) || 0;
        const col = o.handColor || INK;
        const hourCol = o.hands === 'hour-grey' ? GREY : col;
        // RP-101: the hour hand at 30h + 0.5m; the minute hand drawn on top (12:00 overlaps).
        s += hand(c, c, 30 * h + 0.5 * m, HAND_HOUR * R, 2.25, hourCol, ` data-tm-hand="hour" data-tm-deg="${n2(30 * h + 0.5 * m)}"`);
        if (o.hands !== 'hour-grey') s += hand(c, c, 6 * m, HAND_MIN * R, 1.5, col, ` data-tm-hand="minute" data-tm-deg="${n2(6 * m)}"`);
        if (Array.isArray(o.labelHands)) {
            const put = (deg, len, txt) => {
                const a = (deg - 90) * Math.PI / 180;
                const off = (deg + 90 - 90) * Math.PI / 180;
                const x = c + len * Math.cos(a) + 2.6 * Math.cos(off), y = c + len * Math.sin(a) + 2.6 * Math.sin(off);
                return `<text x="${n2(x)}" y="${n2(y + 1.2)}" text-anchor="middle" font-size="${n2(zonePt(ctx) * PT_MM)}" font-weight="700" `
                    + `font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${esc(txt)}</text>`;
            };
            s += put(30 * h + 0.5 * m, HAND_HOUR * R * 0.62, o.labelHands[0]) + put(6 * m, HAND_MIN * R * 0.7, o.labelHands[1]);
        }
    }
    s += `<circle cx="${n2(c)}" cy="${n2(c)}" r="1" fill="${INK}"/>`;
    return svg(ctx, W, W, s, { cls: 'tm-face', label: o.label || 'clock face' });
}

/** A digital readout (RP-103f): rounded rectangle 1.5 pt, solid Andika 700 digits. */
export function readout(ctx, text, { small = false } = {}) {
    const dims = { S: [31, 14], M: [40, 17], L: [48, 19] }[sizeOf(ctx)];
    const [w, h] = small ? [dims[0] * 0.85, dims[1] * 0.85] : dims;
    return `<span class="tm-readout" data-tm-readout="${esc(text)}" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;`
        + `width:${L(ctx, w)};height:${L(ctx, h)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 3)};background:#fff;`
        + `font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;${KEY_FEATURES}">${esc(text)}</span>`;
}

/* ================================================================ slots */

/** A row of inline pieces, centred, that never wraps its slot apart. */
export const row = (ctx, inner, { gap = 2, justify = 'center', attrs = '' } = {}) => `<div${attrs} style="display:flex;align-items:center;`
    + `justify-content:${justify};gap:${L(ctx, gap)};flex-wrap:nowrap;white-space:nowrap;">${inner}</div>`;

/** Cell text (a label beside a slot, a short stimulus line). */
export const words = (ctx, text, { pt = null, bold = false, attrs = '' } = {}) => `<span${attrs} style="font-size:${P(ctx, pt || textPt(ctx))};`
    + `${bold ? 'font-weight:700;' : ''}line-height:1.25;">${text}</span>`;

/**
 * The two-box time slot (section 6 "Time", RP-104): each box 16 / 18 / 20 mm x (Hw + 2), a
 * colon printed in a 5 mm gap. `key` is "3:45"; the pupil's page is empty.
 */
export function timeSlot(ctx, key, { idH = 'hour', idM = 'minute', twin = true } = {}) {
    const s = S(ctx);
    const w = SLOT.timeBoxMm[sizeOf(ctx)], h = s.writeMm + 2;
    const k = splitTime(key) || {};
    const kv = { [idH]: k.hour, [idM]: k.minute };
    const mark = twin ? 'cell' : null;
    const hb = box(ctx, { id: idH, value: partValue(ctx, idH, kv, (v) => { const t = splitTime(v); return t ? { [idH]: t.hour, [idM]: t.minute } : null; }), w, h, mark });
    const mb = box(ctx, { id: idM, value: partValue(ctx, idM, kv, (v) => { const t = splitTime(v); return t ? { [idH]: t.hour, [idM]: t.minute } : null; }), w, h, mark });
    const colon = `<span aria-hidden="true" style="display:inline-block;width:${L(ctx, SLOT.timeGapMm)};text-align:center;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">:</span>`;
    const join = isTwin(ctx) && twin ? ' data-mq-join=":"' : '';
    return `<span class="tm-timeslot" data-ws-slot="time" data-ws-shape="time"${join} style="display:inline-flex;align-items:center;">${hb}${colon}${mb}</span>`;
}

/** `[ ] h [ ] min`: a duration in two boxes (§13.5, ruling Q5). `key` is "1 h 15 min". */
export function durationSlot(ctx, key) {
    const s = S(ctx);
    const w = blankWidth(2, sizeOf(ctx)), h = s.writeMm + 2;
    const k = splitDuration(key) || {};
    const kv = { hours: k.hours, minutes: k.minutes };
    const val = (id) => partValue(ctx, id, kv, splitDuration);
    const join = isTwin(ctx) ? ' data-mq-join=" h "' : '';
    return `<span class="tm-durslot" data-ws-slot="duration" data-ws-shape="time"${join} style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};">`
        + box(ctx, { id: 'hours', value: val('hours'), w, h, mark: 'cell' }) + words(ctx, 'h', { pt: textPt(ctx) + 1, bold: true })
        + box(ctx, { id: 'minutes', value: val('minutes'), w, h, mark: 'cell' }) + words(ctx, 'min', { pt: textPt(ctx) + 1, bold: true }) + `</span>`;
}

/**
 * The money slot (§13.8, ruling Q3): a whole-units box B(n), a printed point in a 3 mm gap, a
 * hundredths box B(2). `sign` prints before it ("QR", "$") on the notation step only.
 */
export function moneySlot(ctx, key, { nWhole = 2, sign = '' } = {}) {
    const s = S(ctx);
    const size = sizeOf(ctx);
    const h = s.writeMm + 2;
    const k = splitMoney(key) || {};
    const kv = { whole: k.whole, cents: k.cents };
    const val = (id) => partValue(ctx, id, kv, splitMoney);
    const join = isTwin(ctx) ? ' data-mq-join="."' : '';
    const point = `<span aria-hidden="true" style="display:inline-block;width:${L(ctx, 3)};text-align:center;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;">.</span>`;
    return `<span class="tm-moneyslot" data-ws-slot="money" data-ws-shape="unit"${join} style="display:inline-flex;align-items:flex-end;gap:${L(ctx, 1)};">`
        + (sign ? words(ctx, esc(sign), { pt: digitPt(ctx) * 0.8, bold: true }) : '')
        + box(ctx, { id: 'whole', value: val('whole'), w: blankWidth(nWhole, size), h, mark: 'cell' }) + point
        + box(ctx, { id: 'cents', value: val('cents'), w: { S: 14, M: 14, L: 17 }[size], h, mark: 'cell' }) + `</span>`;
}

/** One number box with an optional unit word after it (SL-5). `mark`: 'blank' (only slot) or 'cell'. */
export function numberSlot(ctx, id, keyValue, { digits = 2, unit = '', mark = 'blank', wrongKey = null } = {}) {
    const s = S(ctx);
    let value = '';
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        value = w.slots && w.slots[id] !== undefined ? String(w.slots[id]) : (wrongKey === null ? String(w.value === undefined ? '' : w.value) : String(wrongKey));
    } else if (ctx.state !== 'blank') value = keyValue === undefined || keyValue === null ? '' : String(keyValue);
    const b = box(ctx, { id, value, w: blankWidth(Math.max(1, digits), sizeOf(ctx)), h: s.writeMm + 2, mark });
    return unit ? `<span style="display:inline-flex;align-items:center;gap:${L(ctx, SLOT.unitGapMm)};" data-ws-shape="unit">${b}${words(ctx, esc(unit))}</span>` : b;
}

/**
 * A "Check one box." list (P-TH-11: the box on the RIGHT of its label). Each row is a div of
 * exactly two spans — the label and the empty bordered box — which is the shape screen-cell.js
 * `wireTickBoxes` turns into one tap target per row on every screen host.
 */
export function tickList(ctx, labels, { on = -1, id = 'choice', vertical = true, pt = null } = {}) {
    const rows = labels.map((lab, i) => `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, 1)} ${vertical ? 0 : L(ctx, 3)};">`
        + `<span style="font-size:${P(ctx, pt || textPt(ctx) + 1)};font-weight:700;line-height:1.2;">${esc(lab)}</span>`
        + checkBox(ctx, { id: `${id}${i}`, on: i === on, slot: false }) + `</div>`).join('');
    // ONE decision, so ONE slot: the group of boxes, inked when one is checked (AK-2).
    const ink = on >= 0 ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    return `<div class="tm-ticks" data-ws-slot="${esc(id)}" data-ws-shape="check"${ink} style="display:inline-flex;flex-direction:${vertical ? 'column' : 'row'};`
        + `align-items:flex-start;justify-content:center;">${rows}</div>`;
}

/** Which row a check list shows ticked in this state (`labels` in order, `right` the key's). */
export function tickedIndex(ctx, labels, right) {
    if (!ctx || ctx.state === 'blank') return -1;
    const norm = (v) => String(v === undefined || v === null ? '' : v).trim().toLowerCase();
    const want = ctx.state === 'wrong' ? norm(ctx.wrong && ctx.wrong.value) : norm(right);
    return labels.findIndex((l) => norm(l) === want);
}

/* ================================================================ coins and notes (RP-110 ... RP-116) */

/** RP-111 diameters at scale 1.0; the 50 is the next 2.25 mm step (ruling Q2: at QR only). */
export const COIN_D = Object.freeze({ 1: 17.5, 5: 19.75, 10: 22.0, 25: 24.26, 50: 26.51 });
export const coinScale = (ctx, compact = false) => (compact ? 0.8 : sizeOf(ctx) === 'S' ? 0.85 : 1);
export const coinD = (ctx, v, compact = false) => (COIN_D[v] || COIN_D[25]) * coinScale(ctx, compact);

/**
 * One generic coin (RP-112): outer rim 1.5 pt, inner ring 0.5 pt at 0.88 r, the value numeral
 * Andika 700 about 0.40 D tall, white fill. `dots` prints RP-114's count-by-five dots under the
 * numeral (a hint, one per five; the 1 carries a short stroke).
 */
export function coinSVG(ctx, v, { dots = false, compact = false, dashed = false } = {}) {
    const D = coinD(ctx, v, compact);
    const r = D / 2;
    const fs = D * 0.5;
    const dy = dots ? -D * 0.08 : 0;
    let s = dashed
        ? `<circle cx="${n2(r)}" cy="${n2(r)}" r="${n2(r - SW.hair)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.hair)}" stroke-dasharray="1.2 1" data-tm-placeholder="1"/>`
        : `<circle cx="${n2(r)}" cy="${n2(r)}" r="${n2(r - SW.heavy / 2)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
        + `<circle cx="${n2(r)}" cy="${n2(r)}" r="${n2(0.88 * r)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`;
    if (!dashed) {
        s += `<text x="${n2(r)}" y="${n2(r + fs * 0.35 + dy)}" text-anchor="middle" font-size="${n2(fs)}" font-weight="700" `
            + `font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${v}</text>`;
    }
    if (dots && !dashed) {
        const n = v === 1 ? 0 : Math.round(v / 5);
        const y0 = r + fs * 0.35 + dy + 2.1;
        if (v === 1) s += `<line x1="${n2(r - 1.5)}" y1="${n2(y0)}" x2="${n2(r + 1.5)}" y2="${n2(y0)}" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linecap="round" data-tm-hint="dots"/>`;
        const perRow = 5;
        for (let i = 0; i < n; i++) {
            const rowN = Math.min(perRow, n - Math.floor(i / perRow) * perRow);
            const col = i % perRow, rowI = Math.floor(i / perRow);
            const x = r + (col - (rowN - 1) / 2) * 2.2, y = y0 + rowI * 2.2;
            s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="0.75" fill="${INK}" data-tm-hint="dots"/>`;
        }
    }
    return svg(ctx, D, D, s, { cls: 'tm-coin', label: dashed ? 'empty coin' : `coin worth ${v}`, attrs: dashed ? '' : ` data-tm-coin="${v}"` });
}

/**
 * One generic note (RP-115, ruling Q1/Q3): an upright rounded rectangle 26 x 60 mm, 1.5 pt
 * outline, 0.5 pt inset border, the value in the centre and in two opposite corners.
 */
export function noteSVG(ctx, v, { compact = false } = {}) {
    const k = compact ? 0.8 : sizeOf(ctx) === 'S' ? 0.85 : 1;
    const w = 26 * k, h = 60 * k;
    const big = Math.min(digitPt(ctx) * PT_MM * 1.05, (w - 5) / (0.62 * String(v).length));
    const small = zonePt(ctx) * PT_MM;
    let s = `<rect x="${n2(SW.heavy / 2)}" y="${n2(SW.heavy / 2)}" width="${n2(w - SW.heavy)}" height="${n2(h - SW.heavy)}" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
        + `<rect x="2.2" y="2.2" width="${n2(w - 4.4)}" height="${n2(h - 4.4)}" rx="1.5" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`
        + `<text x="${n2(w / 2)}" y="${n2(h / 2 + big * 0.35)}" text-anchor="middle" font-size="${n2(big)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${v}</text>`
        + `<text x="4" y="${n2(4 + small)}" font-size="${n2(small)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${v}</text>`
        + `<text x="${n2(w - 4)}" y="${n2(h - 4)}" text-anchor="end" font-size="${n2(small)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${v}</text>`;
    return svg(ctx, w, h, s, { cls: 'tm-note', label: `note worth ${v}`, attrs: ` data-tm-note="${v}"` });
}

/**
 * A row of coins (RP-113: highest value first, 2 mm gaps, centred). In the screen twin each coin
 * is a tap target (a hidden check box in a label): a tap marks the coin counted, which is the
 * screen twin of touching each coin with a pencil (ruling: "coins you tap to count"). The mark
 * shows no number, so tapping never gives the total away.
 */
export function coinRow(ctx, values, { dots = false, compact = false, wrap = 6, scatter = false } = {}) {
    const twin = isTwin(ctx);
    const one = (v) => {
        const c = coinSVG(ctx, v, { dots, compact });
        return twin
            ? `<label class="tm-cointap" style="display:inline-block;position:relative;line-height:0;"><input type="checkbox" class="tm-cointap-in" aria-label="coin worth ${v}: tap when counted">${c}<span class="tm-cointap-mark" aria-hidden="true"></span></label>`
            : `<span style="display:inline-block;line-height:0;">${c}</span>`;
    };
    const lines = [];
    for (let i = 0; i < values.length; i += wrap) lines.push(values.slice(i, i + wrap));
    return `<div class="tm-coins" data-tm-coins="${esc(values.join(','))}" style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">`
        // `scatter` (MC-6, order: scattered): the coins stand at uneven heights and gaps, not in a
        // tidy row, so the pupil has to find the biggest one before counting.
        + lines.map((ln) => `<div style="display:flex;align-items:${scatter ? 'flex-start' : 'center'};justify-content:center;gap:${L(ctx, scatter ? 4 : 2)};">`
            + ln.map((v, i) => (scatter ? `<span style="display:inline-block;margin-top:${L(ctx, [0, 7, 2, 9, 4, 1][i % 6])};">${one(v)}</span>` : one(v))).join('') + `</div>`).join('')
        + `</div>`;
}

/** A row of notes, highest value first, 3 mm gaps. */
export function noteRow(ctx, values, { compact = false } = {}) {
    return `<div class="tm-notes" data-tm-notes="${esc(values.join(','))}" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 3)};flex-wrap:wrap;">`
        + values.map((v) => `<span style="display:inline-block;line-height:0;">${noteSVG(ctx, v, { compact })}</span>`).join('') + `</div>`;
}

/** A price tag: a rounded label with the price, drawn like a luggage tag (no colour). */
export function priceTag(ctx, text) {
    return `<span class="tm-price" data-tm-price="${esc(text)}" style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};border:${B(ctx, 1.5)} solid ${INK};`
        + `border-radius:${L(ctx, 3)};padding:${L(ctx, 1.5)} ${L(ctx, 3)};font-size:${P(ctx, digitPt(ctx) * 0.9)};font-weight:700;line-height:1;background:#fff;">`
        + `<span aria-hidden="true" style="display:inline-block;width:${L(ctx, 2.4)};height:${L(ctx, 2.4)};border:${B(ctx, 1)} solid ${INK};border-radius:50%;"></span>${esc(text)}</span>`;
}

/* ================================================================ currency words (§2.4) */

export const CURRENCIES = Object.freeze({
    plain: { coins: [1, 5, 10, 25], notes: [1, 5, 10, 20], minor: '', major: '', minorOne: '', majorOne: '', sign: '' },
    qar: { coins: [1, 5, 10, 25, 50], notes: [1, 5, 10, 50, 100, 200, 500], minor: 'dirhams', major: 'riyals', minorOne: 'dirham', majorOne: 'riyal', sign: 'QR' },
    usd: { coins: [1, 5, 10, 25], notes: [1, 5, 10, 20, 50, 100], minor: 'cents', major: 'dollars', minorOne: 'cent', majorOne: 'dollar', sign: '$' },
});
export const currencyOf = (id) => CURRENCIES[id] || CURRENCIES.plain;
/** "5 dirhams" / "1 riyal"; plain numbers carry no unit (SL-9). */
export function unitWord(currency, n, major = false) {
    const c = currencyOf(currency);
    const w = major ? (Number(n) === 1 ? c.majorOne : c.major) : (Number(n) === 1 ? c.minorOne : c.minor);
    return w || '';
}
/** An amount in minor units as a decimal string: 250 -> "2.50". */
export const fmtMoney = (minor) => `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
