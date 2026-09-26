// js/modules/sheet/cells/int-line.js
// The `int-line` template: a number line THROUGH ZERO, across the cell or up and down it (a
// thermometer), for integers:count_through_zero (build list, lane operations, entry 1).
//
//   ◄─┼───┼───┼───┼───┼───┼───┼───┼───┼─►        every tick is one step of the count (1, 2, 5, 10)
//    −4  [  ]  −2  [  ]   0   1  [  ]   3   4    a label, or a writing box, under each tick
//
// Five kinds (payload.kind), one drawing:
//   fill     the pupil writes the missing numbers IN their place on the line (count in 1s, 2s, 5s
//            or 10s through zero). The boxes are the answer places; the key writes them.
//   temp     a thermometer (vertical) or a °C line (across): the start temperature is shown (a grey
//            column / a dot) and a sentence says how it rises or falls; "Now: [ ] °C".
//   diff     two points marked and numbered; "From −3 to 4 is [ ] steps."
//   write    a sentence of a quantity above or below zero, with what 0 means ("0 m is sea
//            level."); the pupil writes the number with its sign: "[ ] m".
//   compare  two temperatures marked; "−3 °C is warmer than −7 °C." then "−3 °C (  ) −7 °C": the
//            pupil writes < or > (6.NS.C.7b).
//
// Labels (payload.ticks, the SUPPORT that fades): 'one' every tick numbered, 'some' every second
// step, 'ends' the two ends only. The given point(s) and 0 are always numbered (0 is the line's
// landmark); a fill blank is never numbered. The line never marks the answer (RP-1): a temp item's
// end, a write item's value and a fill box's number are not drawn.
//
// Geometry. Every length is paper mm (k2kit L / P), so the screen twin (k2Twin) is the same
// drawing at --mq-k2 px per mm. Across: n ticks at a pitch that holds the widest box, the line
// one drawing (DN-10: never re-flowed by a narrower column). Up and down: one tick per row, the
// labels and boxes to its right, the cell narrow enough for three across at S and two at L.
//
// payload: {
//   kind, orient: 'h'|'v', values: [v0 .. vn-1] (the ticks, ascending), ticks: 'one'|'some'|'ends',
//   blanks?: [value, ...]      fill: the ticks the pupil writes (their order on the line)
//   marks?: [value, ...]       the points drawn as dots (their numbers always printed)
//   start?, change?, unit?     temp: the start, the signed change, the unit ('°C')
//   lines?: ['...']            the sentence(s) printed under the line
//   ans                        the answer: a number (temp, diff, write), '<' / '>' (compare);
//                              fill answers are its blanks
//   a?, b?                     compare / diff: the two values in the frame
// }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, SW, n2, isTwin, sizeOf, S, digitPt, textPt, zonePt, inkOf, slotValue, KEY_FEATURES } from './k2kit.js';
import { blankWidth } from '../tokens.js';

/** A number as printed: the true minus (TY-3). */
export const neg = (v) => (Number(v) < 0 ? `−${Math.abs(Number(v))}` : String(v));
/** A printed number is at least 12 pt (the number-line label floor). */
const LABEL_PT_MIN = { S: 11, M: 12, L: 12 };
const labelPt = (ctx) => Math.max(LABEL_PT_MIN[sizeOf(ctx)] || 12, zonePt(ctx));
const PT_MM = 25.4 / 72;
/** A label's width (mm): Andika runs about 0.58 em a character. */
const textW = (s, pt) => String(s).length * pt * PT_MM * 0.58;

/**
 * The writing box: wide enough for the widest number on the line (L3: never the answer's own
 * width). A box in an up-and-down line is 2.5 mm shorter (the writing height and 1.5 mm), so a
 * line of seven rows stands two to a page height at L.
 */
function boxMm(ctx, p) {
    const chars = Math.max(2, ...(p.values || [0]).map((v) => neg(v).length));
    const rowBox = p.kind === 'fill' && p.orient === 'v';
    return { w: blankWidth(chars, sizeOf(ctx)), h: S(ctx).writeMm + (rowBox ? 1.5 : 4) };
}

/** Which ticks carry a printed number. */
export function labelled(p) {
    const vals = p.values || [];
    const blanks = new Set((p.blanks || []).map(Number));
    // the given points: the marked dots, and a temperature's start
    const marks = new Set([...(p.marks || []), ...(p.kind === 'temp' ? [p.start] : [])].map(Number));
    const step = vals.length > 1 ? Math.abs(vals[1] - vals[0]) : 1;
    const mode = p.ticks === 'some' || p.ticks === 'ends' ? p.ticks : 'one';
    return vals.map((v, i) => {
        if (blanks.has(v)) return false;
        if (marks.has(v) || v === 0) return true;
        if (mode === 'one') return true;
        if (mode === 'ends') return i === 0 || i === vals.length - 1;
        return Math.round(v / step) % 2 === 0;
    });
}

/** The answers of a payload, as the pupil writes them, in reading order. */
export function answersOf(p) {
    if (p.kind === 'fill') {
        const b = new Set((p.blanks || []).map(Number));
        const order = p.orient === 'v' ? (p.values || []).slice().reverse() : (p.values || []);
        return order.filter((v) => b.has(v)).map(neg);
    }
    if (p.kind === 'compare') return [String(p.ans)];
    return [neg(p.ans)];
}

/* ------------------------------------------------------------------------------ pieces */

function writeBox(ctx, p, id, value, { sign = false, wMm = null } = {}) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const twin = isTwin(ctx);
    let w, h, radius, shape;
    if (sign) {
        const d = S(ctx).writeMm + 4;
        w = d; h = d; radius = d / 2; shape = 'circle';
    } else {
        ({ w, h } = boxMm(ctx, p)); radius = 1.25; shape = 'box';
        if (wMm) w = wMm;
    }
    // On screen a number box is one of the cell's inputs (typed; "-" becomes the true minus); the
    // sign circle is the host's own sign slot, answered with two tiles, < and > (never =).
    const hook = !twin ? '' : sign ? ' data-mq-blank="circle" data-mq-signs="<,>"' : ' data-mq-cell="1" data-mq-kind="rule" data-mq-w="3"';
    return `<span class="il-box" data-ws-slot="${esc(id)}" data-ws-shape="${shape}"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
        + `style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:none;`
        + `width:${L(ctx, w)};height:${L(ctx, h)};${twin ? 'min-width:44px;min-height:44px;' : ''}border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, radius)};background:#fff;`
        + `font-size:${P(ctx, digitPt(ctx) * 0.8)};font-weight:700;line-height:1;color:${color};vertical-align:middle;${KEY_FEATURES}">${esc(value)}</span>`;
}

/** A size in the host's unit, never under `px` on screen (a phone shrinks the drawing's mm, not the reading size). */
const fontAt = (ctx, pt, px) => (isTwin(ctx) ? `max(${px}px, ${P(ctx, pt)})` : P(ctx, pt));

const labelSpan = (ctx, v, pt) => `<span style="font-size:${fontAt(ctx, pt, 15)};line-height:1;white-space:nowrap;">${esc(neg(v))}</span>`;

/** The geometry of a line: pitch, tick count, sizes. */
function lineGeom(ctx, p) {
    const vals = p.values || [];
    const n = Math.max(2, vals.length);
    const pt = labelPt(ctx);
    const widest = Math.max(...vals.map((v) => textW(neg(v), pt)));
    const bx = boxMm(ctx, p);
    const fill = p.kind === 'fill';
    if (p.orient === 'v') {
        // one row per tick: a box row is its height and 2 mm; a label row the label and 3 mm
        const rowMm = fill ? bx.h + 2 : Math.max(pt * PT_MM + 1.6, { S: 5, M: 5.5, L: 6 }[sizeOf(ctx)]);
        const slotW = fill ? Math.max(bx.w, widest) : widest;
        return { n, pitch: rowMm, pt, bx, slotW, len: n * rowMm };
    }
    // Across, the line is never wider than a full-width cell (172 mm with its arrows): a line of
    // three-character numbers ("−30") narrows its boxes to the pitch that fits (still >= 14 mm).
    const maxPitch = (164 - 8) / n;
    const pitch = Math.min(maxPitch, Math.max(fill ? bx.w + 2 : 0, widest + 3, { S: 8, M: 9, L: 10 }[sizeOf(ctx)]));
    const box = fill ? { w: Math.max(14, Math.min(bx.w, pitch - 2)), h: bx.h } : bx;
    return { n, pitch, pt, bx: box, len: n * pitch };
}

/** Where a value sits along the line (mm from its start), ticks at the middle of each slot. */
const posOf = (g, p, v) => {
    const vals = p.values || [];
    const i = vals.indexOf(Number(v));
    const k = i >= 0 ? i : (Number(v) - vals[0]) / ((vals[1] - vals[0]) || 1);
    return p.orient === 'v' ? (vals.length - 1 - k + 0.5) * g.pitch : (k + 0.5) * g.pitch;
};

/** The line itself (an SVG), with its ticks, the marked points, and for temp the thermometer. */
function lineSVG(ctx, p, g) {
    const vals = p.values || [];
    const across = p.orient !== 'v';
    const arrow = 4;
    let s = '';
    const tick = (v, big) => {
        const t = big ? 2.6 : 1.8;
        const u = posOf(g, p, v);
        return across
            ? `<line x1="${n2(u + arrow)}" y1="${n2(4 - t)}" x2="${n2(u + arrow)}" y2="${n2(4 + t)}" stroke="${INK}" stroke-width="${n2(SW.hair)}" data-il-v="${v}"/>`
            : `<line x1="${n2(6 - t)}" y1="${n2(u + arrow)}" x2="${n2(6 + t)}" y2="${n2(u + arrow)}" stroke="${INK}" stroke-width="${n2(SW.hair)}" data-il-v="${v}"/>`;
    };
    const thermo = p.kind === 'temp' && !across;
    if (across) {
        const W = g.len + 2 * arrow;
        s += `<line x1="${n2(arrow - 1)}" y1="4" x2="${n2(W - arrow + 1)}" y2="4" stroke="${INK}" stroke-width="${n2(SW.one)}"/>`;
        s += `<path d="M${n2(0.3)} 4 l3 -1.6 v3.2 z M${n2(W - 0.3)} 4 l-3 -1.6 v3.2 z" fill="${INK}"/>`;
        for (const v of vals) s += tick(v, v === 0);
        if (p.kind === 'temp') {
            // the start temperature: a dot on the line
            s += `<circle cx="${n2(posOf(g, p, p.start) + arrow)}" cy="4" r="1.5" fill="${INK}" data-il-start="${p.start}"/>`;
        }
        for (const m of p.marks || []) s += `<circle cx="${n2(posOf(g, p, m) + arrow)}" cy="4" r="1.5" fill="${INK}" data-il-mark="${m}"/>`;
        return { svg: `<svg viewBox="0 0 ${n2(W)} 8" aria-hidden="true" style="display:block;width:${L(ctx, W)};height:${L(ctx, 8)};overflow:visible;">${s}</svg>`, W, H: 8, lead: arrow };
    }
    // up and down: the line at x = 6 (a thermometer's tube round it), ticks every row
    const H = g.len + 2 * arrow + (thermo ? 9 : 0);
    if (thermo) {
        // the tube (a 5 mm outline) from above the top tick to the bulb; the column, in the one
        // grey, from the bulb up to the start temperature (INK-5: an outlined bulb, a grey fill)
        const top = 1, bot = g.len + 2 * arrow, bulbY = bot + 3.5;
        s += `<path d="M3.5 ${n2(top + 2.5)} A2.5 2.5 0 0 1 8.5 ${n2(top + 2.5)} L8.5 ${n2(bulbY - 3.2)} A4.2 4.2 0 1 1 3.5 ${n2(bulbY - 3.2)} Z" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>`;
        const yS = posOf(g, p, p.start) + arrow;
        s += `<circle cx="6" cy="${n2(bulbY)}" r="2.8" fill="${GREY}"/>`;
        s += `<rect x="4.9" y="${n2(yS)}" width="2.2" height="${n2(bulbY - yS)}" fill="${GREY}" data-il-start="${p.start}"/>`;
        for (const v of vals) {
            const u = posOf(g, p, v) + arrow;
            s += `<line x1="8.5" y1="${n2(u)}" x2="${n2(v === 0 ? 12 : 11)}" y2="${n2(u)}" stroke="${INK}" stroke-width="${n2(v === 0 ? SW.one : SW.hair)}" data-il-v="${v}"/>`;
        }
        return { svg: `<svg viewBox="0 0 12 ${n2(H)}" aria-hidden="true" style="display:block;width:${L(ctx, 12)};height:${L(ctx, H)};overflow:visible;">${s}</svg>`, W: 12, H, lead: arrow };
    }
    s += `<line x1="6" y1="${n2(arrow - 1)}" x2="6" y2="${n2(H - arrow + 1)}" stroke="${INK}" stroke-width="${n2(SW.one)}"/>`;
    s += `<path d="M6 0.3 l-1.6 3 h3.2 z M6 ${n2(H - 0.3)} l-1.6 -3 h3.2 z" fill="${INK}"/>`;
    for (const v of vals) s += tick(v, v === 0);
    for (const m of p.marks || []) s += `<circle cx="6" cy="${n2(posOf(g, p, m) + arrow)}" r="1.5" fill="${INK}" data-il-mark="${m}"/>`;
    return { svg: `<svg viewBox="0 0 10 ${n2(H)}" aria-hidden="true" style="display:block;width:${L(ctx, 10)};height:${L(ctx, H)};overflow:visible;">${s}</svg>`, W: 10, H, lead: arrow };
}

/** The labels and boxes, one slot per tick, aligned with the ticks. */
function slotsHTML(ctx, p, g) {
    const lab = labelled(p);
    const blanks = (p.blanks || []).map(Number);
    const vals = p.values || [];
    const keys = answersOf(p);
    let k = 0;
    // reading order: across left to right, up and down top to bottom (the biggest first)
    const order = p.orient === 'v' ? vals.map((v, i) => i).reverse() : vals.map((v, i) => i);
    const cells = order.map((i) => {
        const v = vals[i];
        if (p.kind === 'fill' && blanks.includes(v)) {
            const id = `b${k}`;
            const val = slotValue(ctx, id, keys[k]);
            k++;
            return writeBox(ctx, p, id, val, { wMm: g.bx.w });
        }
        return lab[i] ? labelSpan(ctx, v, g.pt) : '';
    });
    if (p.orient === 'v') {
        return `<div style="display:flex;flex-direction:column;align-items:flex-start;">`
            + cells.map((c) => `<div style="height:${L(ctx, g.pitch)};display:flex;align-items:center;">${c}</div>`).join('') + '</div>';
    }
    // a GRID, not a flex row: a twin host re-wraps an overflowing flex row (fitTwinRows), which
    // would take the boxes off their ticks; a grid keeps them and the drawing scales as one
    return `<div style="display:grid;grid-template-columns:repeat(${cells.length}, ${L(ctx, g.pitch)});">`
        + cells.map((c) => `<div style="display:flex;justify-content:center;align-items:flex-start;">${c}</div>`).join('') + '</div>';
}

/** The sentence(s) and the answer frame under the line. */
/** The frame's printed words and numbers: a step above the text (they are read, not written). */
const frameWordPt = (ctx) => textPt(ctx) * 1.2;

/** The text column beside an up-and-down line (L11: text beside a drawing only in >= 38 mm). */
const SIDE_MM = { S: 40, M: 46, L: 52 };

function sentenceHTML(ctx, p, side = false) {
    const tp = textPt(ctx);
    const out = [];
    for (const line of p.lines || []) out.push(`<div style="font-size:${fontAt(ctx, tp, 17)};line-height:1.3;">${esc(line)}</div>`);
    const dpt = frameWordPt(ctx);
    const word = (t) => `<span style="font-size:${fontAt(ctx, dpt, 19)};line-height:1;white-space:nowrap;">${esc(t)}</span>`;
    const keys = answersOf(p);
    const unit = p.unit ? ` ${p.unit}` : '';
    let frame = '';
    if (p.kind === 'temp') frame = `${word('Now:')}${writeBox(ctx, p, 'answer', slotValue(ctx, 'answer', keys[0]))}${unit ? word(p.unit) : ''}`;
    else if (p.kind === 'diff') frame = `${word(`From ${neg(p.a)} to ${neg(p.b)}:`)}${writeBox(ctx, p, 'answer', slotValue(ctx, 'answer', keys[0]))}`;
    else if (p.kind === 'write') frame = `${writeBox(ctx, p, 'answer', slotValue(ctx, 'answer', keys[0]))}${unit ? word(p.unit) : ''}`;
    else if (p.kind === 'compare') {
        frame = `${word(`${neg(p.a)}${unit}`)}${writeBox(ctx, p, 'answer', slotValue(ctx, 'answer', keys[0]), { sign: true })}${word(`${neg(p.b)}${unit}`)}`;
    }
    if (frame) out.push(`<div style="display:flex;align-items:center;justify-content:${side ? 'flex-start' : 'center'};flex-wrap:nowrap;gap:${L(ctx, 2)};margin-top:${L(ctx, 2.5)};">${frame}</div>`);
    if (!out.length) return '';
    return side
        ? `<div style="width:${L(ctx, sideWidth(ctx, p))};text-align:left;">${out.join('')}</div>`
        : `<div style="margin-top:${L(ctx, 3)};text-align:center;">${out.join('')}</div>`;
}

/* ------------------------------------------------------------------------------ template */

/**
 * Do the words and the answer stand BESIDE the line? Always up and down (every kind but fill has
 * words); across, when the line and a text column fit one full-width cell. Then the cell is as
 * tall as the line, not the line and the words (H13), and the text column is >= 40 mm (L11).
 */
function sideBySide(ctx, p) {
    if (p.kind === 'fill') return false;
    if (p.orient === 'v') return true;
    // on screen a line across keeps its words UNDER it: a phone's card is narrower than the line
    // and a text column together (the twin shrinks as one drawing, never below its floor)
    if (isTwin(ctx)) return false;
    const g = lineGeom(ctx, p);
    return g.len + 8 + 4 + sideWidth(ctx, p) <= 172;
}

/** The answer frame's width (mm) on one line: its printed words, the box or circle, the gaps. */
function frameMm(ctx, p) {
    const pt = frameWordPt(ctx);
    const unit = p.unit ? ` ${p.unit}` : '';
    const box = boxMm(ctx, p).w, circle = S(ctx).writeMm + 4;
    if (p.kind === 'temp') return textW('Now:', pt) + box + textW(p.unit || '', pt) + 6;
    if (p.kind === 'diff') return textW(`From ${neg(p.a)} to ${neg(p.b)}:`, pt) + box + 3;
    if (p.kind === 'write') return box + textW(p.unit || '', pt) + 3;
    if (p.kind === 'compare') return textW(`${neg(p.a)}${unit}`, pt) + circle + textW(`${neg(p.b)}${unit}`, pt) + 6;
    return 0;
}

/**
 * The text column's width (mm): never narrower than SIDE_MM nor than the answer frame (the frame
 * never wraps); up and down that is all, across the line takes what the cell leaves (to 80 mm).
 */
function sideWidth(ctx, p) {
    const min = Math.max(SIDE_MM[sizeOf(ctx)], Math.ceil(frameMm(ctx, p)) + 2);
    if (p.orient === 'v') return min;
    const g = lineGeom(ctx, p);
    return Math.max(min, Math.min(80, 172 - (g.len + 8) - 10));
}

function drawing(ctx, p) {
    const g = lineGeom(ctx, p);
    const ln = lineSVG(ctx, p, g);
    if (p.orient === 'v') {
        // the line's arrow head takes `lead` mm above the first row
        const rows = slotsHTML(ctx, p, g);
        return `<div style="display:inline-grid;grid-template-columns:auto auto;align-items:start;column-gap:${L(ctx, 2)};">`
            + `<div>${ln.svg}</div><div style="margin-top:${L(ctx, ln.lead)};">${rows}</div></div>`;
    }
    const rows = slotsHTML(ctx, p, g);
    return `<div style="display:inline-block;">${ln.svg}<div style="margin-left:${L(ctx, ln.lead)};margin-top:${L(ctx, 1.5)};">${rows}</div></div>`;
}

register('int-line', {
    render(p, ctx) {
        // Up and down with a sentence (every kind but fill): the words and the answer stand BESIDE
        // the line, so the cell is as tall as the line, not the line and the words (H13, L11).
        const side = sideBySide(ctx, p);
        const body = side
            ? `<div style="display:inline-grid;grid-template-columns:auto auto;align-items:center;column-gap:${L(ctx, 4)};">`
                + `<div>${drawing(ctx, p)}</div>${sentenceHTML(ctx, p, true)}</div>`
            : `<div style="display:flex;justify-content:center;">${drawing(ctx, p)}</div>${sentenceHTML(ctx, p)}`;
        const twin = isTwin(ctx);
        return `<div class="il-cell" data-il-kind="${esc(p.kind)}"${twin ? ' data-mq-k2="1" data-mq-join=", "' : ''} style="color:${INK};font-family:'Andika','Open Sans',sans-serif;text-align:center;">${body}</div>`;
    },
    answerKey(p) {
        const keys = answersOf(p);
        const slots = {};
        if (p.kind === 'fill') keys.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        else slots.answer = { value: keys[0], graded: true };
        return { value: p.kind === 'fill' ? keys.join(', ') : keys[0], display: keys.join(', '), slots };
    },
    footprint(p, ctx) {
        const g = lineGeom(ctx, p);
        const across = p.orient !== 'v';
        const side = sideBySide(ctx, p);
        const w = (across ? g.len + 8 : 12 + 2 + (g.slotW || 12) + 4) + (side ? 4 + sideWidth(ctx, p) : 0);
        // an up-and-down fill line is narrow (three or four across); with its words beside it, two
        return { wMm: Math.ceil(w + 6), hMm: null, measure: true, factLike: false, maxCols: w + 6 <= 88 ? (across || side ? 2 : 4) : 1, denseRoom: 1.05 };
    },
    inputs(p) {
        const keys = answersOf(p);
        if (p.kind === 'fill') return keys.map((_, i) => ({ id: `b${i}`, kind: 'text', shape: 'box', graded: true, order: i, inputmode: 'text', scopes: ['full'] }));
        return [{ id: 'answer', kind: p.kind === 'compare' ? 'sign' : 'text', shape: p.kind === 'compare' ? 'circle' : 'box', graded: true, order: 0, inputmode: 'text', scopes: ['full', 'answer-only'] }];
    },
    layout(p) { return { card: p && p.orient === 'v' ? 'card-medium-visual' : 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});
