// js/modules/sheet/cells/figures.js
// O6 lane AP2: the figure and data cells, drawn by the kit so paper, the answer key and the three
// screen hosts draw ONE picture with ONE set of answer slots (AK-4).
//
//   thermometer      read a thermometer (measurement:temperature). A mark every 1 or 2 degrees, a
//                    number every 5 / 10 / 20 (O6 "Figure labels"); below zero when chosen; the unit
//                    pre-printed after the one box.
//   ruler            measure an object lying along an inch ruler drawn at TRUE scale (RP-160:
//                    25.4 mm an inch, tick heights 6 / 4.5 / 3.5 mm): its left end at 0, or on a
//                    later inch mark; ONE answer place in "The pencil is [ ] inches long." (a whole
//                    box, or a whole box and a stacked fraction when the ruler reads halves or
//                    quarters). No arrow: the pupil finds the object's end, never a printed numeral.
//   bar-graph        a bar graph with its full numbered scale (a grid line and a number on every
//                    step; a short mark half way on a scale of 2 or 10), axis titles in words
//                    (RP-130), grey bars with a 1.5 pt outline (RP-131), no number over any bar;
//                    standing up or lying down (O6 "Bars").
//   pictograph       in-house pictures in a ruled table (RP-132): a picture that matches its row,
//                    or one plain circle for every row; half pictures clipped down the middle; the
//                    key printed under the table.
//   tally-chart      tally marks in a ruled (or open) table (RP-22: a diagonal fifth).
//   perimeter-shape  a rectangle, square, triangle or five-sided shape drawn to scale, each side
//                    labelled with its length and a real unit ("5 cm"), or only the sides that
//                    cannot be worked out (O6 "Figure labels": some); "Perimeter = [ ] cm".
//
// The three graphs share one cell (`dataCell`): the drawing, then the graph's title, the question
// and its answer place beside it (RP-133: a graph and its question are one cell). Every drawing
// sizes from the page size (S / M / L, L1): the plot, the pictures, the tally height, the figure.
//
// HINTS (a support that fades, O3). `p.support` (the skill's Support level: 2 hints, 1 none) or a
// Guided / Model page (scaffold level >= 2) draws the skill's grey hint: the read-across line of a
// graph, the running count under the pictures or after each tally bundle, the guide from a ruler's
// object to the ruler, the addition frame under a perimeter figure.
//
// ONE DRAWING, TWO HOSTS: every length is a paper millimetre (k2kit.js); the screen twin
// (`ctx.options.twin`, k2Twin) draws the same cell at `--mq-k2` px a millimetre, its graphs at ONE
// fixed width (so a worksheet's graphs share one scale) and its labels large enough to read when a
// host fits the drawing into a phone-width card.
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import {
    L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, digitPt, textPt, zonePt, box, svg, root, shapeOf,
} from './k2kit.js';
import { levelOf, partValue, numberSlot, tickList, tickedIndex, words } from './tmkit.js';

const FONT = 'font-family="Andika, \'Open Sans\', sans-serif"';
/** A text's width in mm at `pt` (Andika runs wide: 0.58 em a character, a safe over-estimate). */
const textW = (s, pt) => String(s).length * pt * PT_MM * 0.58;
/** One SVG text at `pt`, its baseline at `y`. */
const txt = (x, y, s, pt, { anchor = 'middle', weight = 700, fill = INK, attrs = '' } = {}) => `<text x="${n2(x)}" y="${n2(y)}" `
    + `text-anchor="${anchor}" font-size="${n2(pt * PT_MM)}" font-weight="${weight}" ${FONT} fill="${fill}"${attrs}>${esc(s)}</text>`;
const line = (x1, y1, x2, y2, w, color = INK, extra = '') => `<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}" `
    + `stroke="${color}" stroke-width="${n2(w)}"${extra}/>`;
/** A negative number with the true minus sign (TY-6). */
const signed = (v) => (Number(v) < 0 ? `−${Math.abs(Number(v))}` : String(v));

/**
 * The label size of a figure: never under 11 pt on paper (K-3 readers, critic round 5), and on
 * the screen twin large enough (20 pt) to stay readable when a phone or worksheet card fits the
 * drawing into its width.
 */
const labelPt = (ctx) => (isTwin(ctx) ? 20 : Math.max(zonePt(ctx), 11));
/** Is the skill's grey hint drawn? The teacher's Support level 2, or a Guided / Model page. */
const hintOn = (p, ctx) => Number(p && p.support) >= 2 || levelOf(ctx) >= 2;
/** A grey hint number (8.5 pt on paper, never under the 8 pt floor of TY-11). */
const hintPt = (ctx) => (isTwin(ctx) ? 14 : 8.5);

/* ================================================================ thermometer */

/**
 * payload: {temp, unit: '°F' | '°C', lo, hi, every: 5 | 10 | 20, step: 1 | 2 (degrees a mark)}.
 * The window lo..hi holds 20 marks, 2 / 2.25 / 2.5 mm apart (S / M / L); the tube is a 7 mm
 * outline, the column a 3.2 mm solid bar and the bulb a 6.8 mm solid disc inside a 13 mm outline
 * (INK-5: no solid fill wider than 7 mm).
 */
export function thermometerSVG(p, ctx) {
    const lo = Number(p.lo), hi = Number(p.hi), every = Number(p.every) || 5, t = Number(p.temp);
    const step = Number(p.step) === 2 ? 2 : 1;
    const pitch = (isTwin(ctx) ? 2.5 : ({ S: 2, M: 2.25, L: 2.5 }[sizeOf(ctx)] || 2.5)) / step;
    const labPt = isTwin(ctx) ? 18 : Math.max(zonePt(ctx), textPt(ctx));
    const labMm = labPt * PT_MM;
    const tx = 1.5, tw = 7, cx = tx + tw / 2;
    const yT = labMm + 3.5;                               // the tube's top, under the unit
    const y = (d) => yT + 4 + (hi - d) * pitch;
    const yB = y(lo) + 4;
    const bulbR = 6.5, by = yB + 4.5;
    const yJ = by - Math.sqrt(bulbR * bulbR - (tw / 2) * (tw / 2));
    const tickX = tx + tw;
    const labX = tickX + 5.5 + 1.8;
    const labW = Math.max(...[lo, hi].map((v) => textW(signed(v), labPt)));
    const W = labX + labW + 1;
    const H = by + bulbR + 1;
    let s = '';
    s += `<path d="M${n2(tx)} ${n2(yT + tw / 2)}A${n2(tw / 2)} ${n2(tw / 2)} 0 0 1 ${n2(tx + tw)} ${n2(yT + tw / 2)}L${n2(tx + tw)} ${n2(yJ)}`
        + `A${n2(bulbR)} ${n2(bulbR)} 0 1 1 ${n2(tx)} ${n2(yJ)}Z" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>`;
    s += `<circle cx="${n2(cx)}" cy="${n2(by)}" r="3.4" fill="${INK}"/>`;
    s += `<rect x="${n2(cx - 1.6)}" y="${n2(y(t))}" width="3.2" height="${n2(by - y(t))}" fill="${INK}" data-fg-temp="${esc(t)}"/>`;
    // the scale: a mark every `step` degrees, longer every 5 and 10, a number every `every`
    for (let d = lo; d <= hi; d += step) {
        const len = d % 10 === 0 ? 5.5 : d % 5 === 0 ? 4 : 2.5;
        const w = d % 10 === 0 ? SW.heavy : d % 5 === 0 ? SW.one : SW.hair;
        s += line(tickX, y(d), tickX + len, y(d), w);
        if (d % every === 0) s += txt(labX, y(d) + labMm * 0.35, signed(d), labPt, { anchor: 'start' });
    }
    // the hint (fades): a grey guide from the column top across to the scale
    if (hintOn(p, ctx)) s += line(cx + 1.6, y(t), labX - 1, y(t), SW.one, GREY, ' data-fg-hint="guide"');
    s += txt(cx + 2, labMm, String(p.unit || ''), labPt);
    return { html: svg(ctx, W, H, s, { cls: 'fg-thermo', label: `thermometer, ${lo} to ${hi} ${p.unit || ''}` }), W, H };
}

register('thermometer', {
    render(p, ctx) {
        const th = thermometerSVG(p, ctx);
        const digits = Math.max(2, String(Math.abs(Number(p.hi))).length + (Number(p.lo) < 0 ? 1 : 0));
        const slot = numberSlot(ctx, 'answer', signed(p.temp), { digits, unit: String(p.unit || '') });
        // S sets the box closer, so three thermometers stand across an S page (critic regrade 5)
        const gap = !isTwin(ctx) && sizeOf(ctx) === 'S' ? 4 : 8;
        return root(ctx, 'fg-thermometer', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, gap)};">`
            + `<div style="flex:none;">${th.html}</div><div style="flex:none;">${slot}</div></div>`);
    },
    answerKey(p) {
        return { value: Number(p.temp), display: `${signed(p.temp)} ${p.unit || ''}`.trim(), slots: { answer: { value: signed(p.temp), graded: true } } };
    },
    // up to 3 across (a thermometer and one box are narrow); the page measures what fits
    footprint(p, ctx) { return { wMm: ctx && !isTwin(ctx) && sizeOf(ctx) === 'S' ? 54 : 62, hMm: null, measure: true, factLike: false, maxCols: 3, autoCols: 3 }; },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

/* ================================================================ ruler */

/** "2 3/4" / "3/4" / "5" -> {w, n, d} (strings; '' where absent). */
export function splitMixed(v) {
    const m = /^\s*(\d+)?\s*(?:(\d+)\s*\/\s*(\d+))?\s*$/.exec(String(v === undefined || v === null ? '' : v));
    if (!m || (!m[1] && !m[2])) return null;
    return { w: m[1] || '', n: m[2] || '', d: m[3] || '' };
}

/** The key parts of a ruler payload: the whole inches, and the fraction when there is one. */
const rulerKey = (p) => {
    const k = splitMixed(p.ans) || { w: String(p.ans), n: '', d: '' };
    return { w: k.w, n: k.n, d: k.d };
};

/** The objects a pupil measures: their name, and the drawing (a pencil has a point). */
export const RULER_OBJECTS = Object.freeze({ pencil: 'pencil', crayon: 'crayon', ribbon: 'ribbon', straw: 'straw' });

/** One object from x1 to x2 (mm), `h` tall, its top at `y`: outline only, ink. */
function objectPath(kind, x1, x2, y, h) {
    const m = y + h / 2;
    const o = `fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"`;
    if (kind === 'pencil' || kind === 'crayon') {
        // a body, a band near the back, a sharpened point that ENDS at x2
        const tip = Math.min(kind === 'pencil' ? 6 : 4, (x2 - x1) * 0.35);
        const body = `<path d="M${n2(x1)} ${n2(y)}L${n2(x2 - tip)} ${n2(y)}L${n2(x2)} ${n2(m)}L${n2(x2 - tip)} ${n2(y + h)}L${n2(x1)} ${n2(y + h)}Z" ${o}/>`;
        const band = line(x1 + 3, y, x1 + 3, y + h, SW.one);
        const core = kind === 'pencil' ? line(x2 - tip, y, x2 - tip, y + h, SW.hair) : '';
        return body + band + core;
    }
    // a ribbon or a straw: a plain long rectangle with rounded ends
    return `<rect x="${n2(x1)}" y="${n2(y)}" width="${n2(x2 - x1)}" height="${n2(h)}" rx="${kind === 'straw' ? n2(h / 2) : 0.8}" ${o}/>`
        + (kind === 'straw' ? line(x1 + 1.5, m, x2 - 1.5, m, SW.hair) : '');
}

/**
 * payload: {len: 6, start (inches, the object's left end), meas (its length, a multiple of
 * 1/res), res: 1 | 2 | 4 (marks per inch), labels: 'all' | 'some', object, ans: "2 1/2",
 * support}. Drawn at true scale on paper (RP-160).
 */
export function rulerSVG(p, ctx) {
    const len = Number(p.len) || 6, res = [1, 2, 4].includes(Number(p.res)) ? Number(p.res) : 1;
    // true scale on paper (RP-160); the screen twin is never true scale, so it is drawn shorter
    // with bigger numerals (a phone shows it 320 px wide)
    const inch = isTwin(ctx) ? 17 : 25.4, inset = 4;
    // the body is as tall as its marks and numbers need; S packs it closer (five rulers to a page)
    const bodyW = len * inch + 2 * inset, bodyH = isTwin(ctx) ? 14 : ({ S: 11.6, M: 12.4, L: 13 }[sizeOf(ctx)] || 13);
    const objH = isTwin(ctx) ? 6 : ({ S: 4, M: 5, L: 5.5 }[sizeOf(ctx)] || 5.5);
    const y0 = objH + 2.5;                                // the body's top edge, under the object
    const numPt = isTwin(ctx) ? 19 : textPt(ctx);
    const x = (inches) => SW.hair / 2 + inset + inches * inch;
    const start = Number(p.start) || 0, end = start + Number(p.meas);
    let s = `<rect x="${n2(SW.hair / 2)}" y="${n2(y0)}" width="${n2(bodyW)}" height="${bodyH}" rx="1" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    // the hint (fades): grey guides from the object's two ends down to the marks
    if (hintOn(p, ctx)) {
        s += line(x(start), 1, x(start), y0 + 6, SW.one, GREY, ' data-fg-hint="guide"');
        s += line(x(end), 1, x(end), y0 + 6, SW.one, GREY, ' data-fg-hint="guide"');
    }
    for (let i = 0; i <= len * res; i++) {
        const xi = x(i / res);
        const whole = i % res === 0, half = !whole && (i * 2) % res === 0;
        const h = whole ? 6 : half ? 4.5 : 3.5;
        s += line(xi, y0, xi, y0 + h, whole ? SW.one : SW.hair);
        const n = i / res;
        if (whole && (p.labels !== 'some' || n % 2 === 0)) s += txt(xi, y0 + 6.8 + numPt * PT_MM * 0.8, String(n), numPt);
    }
    // the object, lying along the ruler just above it
    s += `<g data-fg-object="${esc(p.object || 'pencil')}" data-fg-end="${esc(end)}">${objectPath(p.object || 'pencil', x(start), x(end), 1, objH)}</g>`;
    return { html: svg(ctx, bodyW + SW.hair, y0 + bodyH + 0.5, s, { cls: 'fg-ruler', label: `a ${p.object || 'pencil'} along an inch ruler` }), W: bodyW };
}

/** The ruler's answer: one box (whole inches), or a whole box and a stacked fraction. */
function rulerSlot(p, ctx) {
    const res = Number(p.res) || 1;
    if (res === 1) return numberSlot(ctx, 'answer', p.ans, { digits: 1 });
    const key = rulerKey(p);
    const val = (id) => partValue(ctx, id, key, splitMixed);
    const h = S(ctx).writeMm + 2;
    const fb = S(ctx).writeMm + 1;
    // a whole-number answer leaves the fraction boxes out of the key (never "0/4"), and "3/4"
    // leaves the whole box empty: those boxes are not graded (AK-2). Error analysis shows the
    // pupil's finished work on both pages, so there the work decides which boxes hold a number.
    const shown = ctx.state === 'wrong' ? (splitMixed(val('w') + (val('n') ? ` ${val('n')}/${val('d')}` : '')) || key) : key;
    const one = (id, w, hh) => {
        const graded = id === 'w' ? shown.w !== '' : shown.n !== '';
        return box(ctx, { id, value: val(id), w, h: hh, mark: 'cell', graded });
    };
    // the screen twin's fraction boxes are a touch target each (>= 44 px on a phone card, critic
    // figures-r6): wider and taller than the paper boxes
    const fw = isTwin(ctx) ? 17 : 12, fhh = isTwin(ctx) ? fb + 3 : fb;
    const frac = `<span style="display:inline-flex;flex-direction:column;align-items:center;flex:none;">${one('n', fw, fhh)}`
        + `<span aria-hidden="true" style="display:block;align-self:stretch;min-width:${L(ctx, fw)};border-top:${B(ctx, 1.5)} solid ${INK};margin:${L(ctx, 0.8)} 0;"></span>`
        + `${one('d', fw, fhh)}</span>`;
    return `<span data-ws-slot-group="mixed"${isTwin(ctx) ? ' data-mq-join="mixed"' : ''} style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};flex:none;">`
        + `${one('w', isTwin(ctx) ? 17 : 14, isTwin(ctx) ? h + 3 : h)}${frac}</span>`;
}

register('ruler', {
    render(p, ctx) {
        const r = rulerSVG(p, ctx);
        const noun = p.object || 'pencil';
        // "The pencil is [ ] inches long." - the slot and its unit never part (a narrow card
        // wraps the sentence before the slot, never between the box and "inches")
        const tail = `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 2)};flex:none;white-space:nowrap;">`
            + `${rulerSlot(p, ctx)}${words(ctx, 'inches long.')}</span>`;
        // (paper keeps the sentence close under the ruler: four rulers to a page at S and L)
        const sentence = `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, isTwin(ctx) ? 3 : 1.5)};">`
            + `${words(ctx, `The ${esc(noun)} is`)}${tail}</div>`;
        return root(ctx, 'fg-ruler-cell', `<div style="display:inline-block;max-width:100%;">${r.html}</div>${sentence}`);
    },
    answerKey(p) {
        const res = Number(p.res) || 1;
        if (res === 1) return { value: Number(p.ans), display: String(p.ans), slots: { answer: { value: String(p.ans), graded: true } } };
        const k = rulerKey(p);
        return {
            value: String(p.ans), display: String(p.ans),
            slots: { w: { value: k.w, graded: k.w !== '' }, n: { value: k.n, graded: k.n !== '' }, d: { value: k.d, graded: k.n !== '' } },
        };
    },
    // denseRoom 1: the measured cell already holds the ruler's margins, so a Test packs rulers
    // to their own height (five quarter-inch rulers on an S test page)
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1, denseRoom: 1 }; },
    inputs(p) {
        if ((Number(p.res) || 1) === 1) return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        return ['w', 'n', 'd'].map((id, k) => ({ id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});

/* ================================================================ bar graph */

/**
 * Plot area by size: the most a plot may take (section 11.2: 80 x 60 / 90 x 70 / 100 x 80). Critic
 * regrade 5 (R1, OC14): a paper graph is SIZED TO ITS CONTENT - a line of the scale every
 * `GRID_PITCH` mm and a bar slot as wide as its name needs - so a 5-line intro graph is small and
 * a 10-line graph still leaves three to an L page; S packs the lines closer (every other line
 * numbered on a long scale), so more graphs fit an S page. The screen twin draws every graph at one
 * width (one scale per worksheet).
 */
const PLOT = Object.freeze({ S: [80, 46], M: [90, 62], L: [100, 80] });
// the twin: one plot size for every graph of a worksheet (critic figures-r6: "one graph scale
// per worksheet"), five slots wide whatever the number of bars
const TWIN_PLOT = Object.freeze([130, 64]);
/** mm between two lines of the scale on paper: [short scale (6 lines or fewer), long scale]. */
const GRID_PITCH = Object.freeze({ S: [4, 2.6], M: [4.6, 4.2], L: [6, 4.5] });
/** The shortest paper plot, and the narrowest bar slot / the height of a bar's row (horizontal). */
const PLOT_MIN = Object.freeze({ S: 20, M: 28, L: 36 });
const SLOT_MIN = Object.freeze({ S: 14, M: 16, L: 18 });
const ROW_MIN = Object.freeze({ S: 8, M: 9, L: 10 });

/**
 * payload: {title, categories, values, step, top, half (a mark half way between two numbers),
 * orientation: 'vertical' | 'horizontal', catTitle, valTitle, ask: {kind: 'value' | 'most' |
 * 'least' | 'more' | 'total', i?, j?}, question, answer (a number, or a category), support}.
 */
export function barGraphSVG(p, ctx) {
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const n = Math.max(1, cats.length);
    const step = Number(p.step) || 1;
    let top = Number(p.top) || Math.max(...vals, 1);
    const twin = isTwin(ctx);
    const sz = PLOT[sizeOf(ctx)] ? sizeOf(ctx) : 'L';
    const [pw0, ph0] = twin ? TWIN_PLOT : PLOT[sz];
    const zPt = labelPt(ctx), zMm = zPt * PT_MM;
    const long = Math.round(top / step) > 6;
    // an S page and the screen twin number every other line of a long scale (the lines stay; the
    // numbers would touch). The scale then ENDS on a numbered line, one more line when it must:
    // 0, 4, 8, ... 20, never "16, 18" at the top (critic figures-r6, H2).
    const every = long && (twin || sz === 'S') ? 2 : 1;
    if (every === 2 && Math.round(top / step) % 2) top += step;
    const steps = [];
    for (let v = 0; v <= top + 1e-9; v += step) steps.push(+v.toFixed(6));
    const nSt = Math.max(1, steps.length - 1);
    const named = (k) => k % every === 0;
    const a = p.ask || {};
    // the hint's bars: the one asked, the two compared, or every bar
    // (a "most" or "in all" question reads every bar: no line across the whole plot for it)
    const guides = !hintOn(p, ctx) ? [] : a.kind === 'value' ? [a.i] : a.kind === 'more' ? [a.i, a.j] : [];
    let s = '';
    let W, H;
    if (p.orientation !== 'horizontal') {
        const valLabW = Math.max(...steps.map((v) => textW(v, zPt)));
        const catW = Math.max(...cats.map((c) => textW(c, zPt)));
        // the twin keeps one plot width for every graph (one scale per worksheet); paper widens a
        // slot only when a name needs it
        // the twin: every number of the scale a line apart (they ran together on a long scale,
        // critic regrade 5) and every name inside its own slot
        const slotW = twin ? Math.max(pw0 / Math.max(n, 5), catW + 4) * Math.max(n, 5) / n : Math.max(catW + 3, SLOT_MIN[sz]);
        const PW = slotW * n;
        const PH = twin ? Math.max(ph0, (nSt / every) * zMm * 1.3) : Math.min(ph0, Math.max(PLOT_MIN[sz], nSt * GRID_PITCH[sz][long ? 1 : 0]));
        const valTitleY = zMm * 1.0;
        const x0 = Math.max(valLabW + 3, 1), yTop = valTitleY + 3.2, yBot = yTop + PH;
        const yOf = (v) => yBot - (v / top) * PH;
        for (const [k, v] of steps.entries()) {
            s += line(x0, yOf(v), x0 + PW, yOf(v), SW.fine);
            s += line(x0 - 1.5, yOf(v), x0, yOf(v), SW.one);
            if (named(k)) s += txt(x0 - 2.5, yOf(v) + zMm * 0.35, String(v), zPt, { anchor: 'end', weight: 400 });
            if (p.half && v + step <= top + 1e-9) s += line(x0 - 1, yOf(v + step / 2), x0, yOf(v + step / 2), SW.one, INK, ' data-fg-half="1"');
        }
        const barW = Math.min(slotW * 0.6, 18);
        const bxOf = (i) => x0 + i * slotW + (slotW - barW) / 2;
        // the grey read-across lines sit UNDER the bars, so a taller bar in the way hides its part
        for (const i of guides) if (Number.isInteger(i) && vals[i] > 0) s += line(x0, yOf(vals[i]), bxOf(i) + barW, yOf(vals[i]), SW.rule, GREY, ' data-fg-hint="guide"');
        vals.forEach((v, i) => {
            const bx = bxOf(i);
            if (v > 0) {
                s += `<rect x="${n2(bx)}" y="${n2(yOf(v))}" width="${n2(barW)}" height="${n2(yBot - yOf(v))}" fill="${GREY}" `
                    + `stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-fg-bar="${esc(cats[i])}"/>`;
            }
            s += txt(bx + barW / 2, yBot + 1.5 + zMm * 0.8, cats[i], zPt, { weight: 400 });
        });
        s += line(x0, yTop - 2, x0, yBot, SW.heavy) + line(x0, yBot, x0 + PW, yBot, SW.heavy);
        // the axis titles in words (RP-130), never turned: the value axis's over the plot, right
        // of the axis, so it never meets the top number of the scale
        s += txt(x0 + 2, valTitleY, p.valTitle || '', zPt, { anchor: 'start' });
        const catTitleY = yBot + 1.5 + zMm * 0.8 + zMm * 1.3;
        s += txt(x0 + PW / 2, catTitleY, p.catTitle || '', zPt);
        W = Math.max(x0 + PW + 2, x0 + 2 + textW(p.valTitle || '', zPt) + 1);
        H = catTitleY + zMm * 0.35;
    } else {
        const catW = Math.max(...cats.map((c) => textW(c, zPt)));
        const slotH = twin ? ph0 / n : ROW_MIN[sz];
        // every number along the bottom keeps its own room (the twin's numbers are big)
        const PW = Math.max(twin ? pw0 - catW : pw0, nSt * (textW(String(top), zPt) + 2)), PH = slotH * n;
        const catTitleY = zMm * 1.0;
        const x0 = Math.max(catW + 3, 1), yTop = catTitleY + 3, yBot = yTop + PH;
        const xOf = (v) => x0 + (v / top) * PW;
        for (const [k, v] of steps.entries()) {
            s += line(xOf(v), yTop, xOf(v), yBot, SW.fine);
            s += line(xOf(v), yBot, xOf(v), yBot + 1.5, SW.one);
            if (named(k)) s += txt(xOf(v), yBot + 2 + zMm * 0.8, String(v), zPt, { weight: 400 });
            if (p.half && v + step <= top + 1e-9) s += line(xOf(v + step / 2), yBot, xOf(v + step / 2), yBot + 1, SW.one, INK, ' data-fg-half="1"');
        }
        const barH = Math.min(slotH * 0.6, 12);
        const byOf = (i) => yTop + i * slotH + (slotH - barH) / 2;
        for (const i of guides) if (Number.isInteger(i) && vals[i] > 0) s += line(xOf(vals[i]), byOf(i), xOf(vals[i]), yBot, SW.rule, GREY, ' data-fg-hint="guide"');
        vals.forEach((v, i) => {
            const by = byOf(i);
            if (v > 0) {
                s += `<rect x="${n2(x0)}" y="${n2(by)}" width="${n2(xOf(v) - x0)}" height="${n2(barH)}" fill="${GREY}" `
                    + `stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-fg-bar="${esc(cats[i])}"/>`;
            }
            s += txt(x0 - 2.5, by + barH / 2 + zMm * 0.35, cats[i], zPt, { anchor: 'end', weight: 400 });
        });
        s += line(x0, yTop, x0, yBot, SW.heavy) + line(x0, yBot, x0 + PW + 2, yBot, SW.heavy);
        s += txt(0.5, catTitleY, p.catTitle || '', zPt, { anchor: 'start' });
        const valTitleY = yBot + 2 + zMm * 0.8 + zMm * 1.3;
        s += txt(x0 + PW / 2, valTitleY, p.valTitle || '', zPt);
        W = Math.max(x0 + PW + 3, textW(p.catTitle || '', zPt) + 1, x0 + PW / 2 + textW(p.valTitle || '', zPt) / 2 + 1);
        H = valTitleY + zMm * 0.35;
    }
    return { html: svg(ctx, W, H, s, { cls: 'fg-bars', label: `bar graph: ${p.title || ''}` }), W, H };
}

/** Is the answer a bar or a row (check one box) rather than a number? */
const asksBar = (p) => p.ask && (p.ask.kind === 'most' || p.ask.kind === 'least');

/** A check list whose boxes run across and wrap (a short answer column, the rows it has). */
function tickRow(ctx, labels, on, pt) {
    const html = tickList(ctx, labels, { on, id: 'answer', vertical: false, pt });
    return html.replace('flex-direction:row;', `flex-direction:row;flex-wrap:wrap;row-gap:${L(ctx, 1)};`)
        .replace('justify-content:center;">', 'justify-content:flex-start;">');
}

/**
 * The data cell every graph shares (bar graph, pictograph, tally chart): the drawing, then the
 * graph's title, its key (a pictograph), the question and its answer place: a box for a number,
 * one check box for a bar or a row (RP-133: the graph and its question are one cell). Beside the
 * drawing when the cell is wide enough, under it in a narrow screen card.
 */
function dataCell(name, draw) {
    register(name, {
        render(p, ctx) {
            const g = draw(p, ctx);
            const cats = (p.categories || []).map(String);
            const tw = isTwin(ctx) ? 1.35 : 1;
            const tPt = textPt(ctx) * tw;
            let answer;
            if (asksBar(p)) {
                answer = `<div style="margin-top:${L(ctx, 2.5)};">${words(ctx, 'Check one box.', { pt: Math.max(zonePt(ctx), 11) * tw })}</div>`
                    + `<div style="margin-top:${L(ctx, 1)};">${tickRow(ctx, cats, tickedIndex(ctx, cats, p.answer), tPt)}</div>`;
            } else {
                const digits = Math.max(2, String(p.answer).length);
                answer = `<div style="margin-top:${L(ctx, 3)};">${numberSlot(ctx, 'answer', p.answer, { digits })}</div>`;
            }
            const key = typeof g.key === 'string' ? `<div class="fg-key" style="margin-bottom:${L(ctx, 2)};">${g.key}</div>` : '';
            const ask = `<div class="fg-ask" style="flex:1 1 ${L(ctx, 44)};min-width:${L(ctx, 40)};max-width:${L(ctx, 110)};text-align:left;">`
                + `<div class="fg-title" style="font-size:${P(ctx, tPt)};font-weight:700;line-height:1.25;margin-bottom:${L(ctx, 2)};">${esc(p.title || '')}</div>`
                + key
                + `<div style="font-size:${P(ctx, tPt)};font-weight:400;line-height:1.3;white-space:normal;">${esc(p.question || '')}</div>${answer}</div>`;
            // the twin's drawing fills its card (one scale for every graph of a worksheet); paper
            // keeps the drawing's own millimetres
            const pic = isTwin(ctx)
                ? `<div class="fg-pic" style="flex:1 1 ${L(ctx, 100)};max-width:${L(ctx, g.W)};min-width:0;">${g.html.replace(/width:[^;]*;height:auto;max-width:100%;/, 'width:100%;height:auto;max-width:100%;')}</div>`
                : `<div class="fg-pic" style="flex:none;max-width:100%;">${g.html}</div>`;
            // paper: the cell takes the full column width, so the question stands beside the graph
            // (a shrink-to-fit cell wrapped a short question under a narrow graph)
            return root(ctx, `fg-${name}`, `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 5)};flex-wrap:wrap;">`
                + `${pic}${ask}</div>`, { style: isTwin(ctx) ? '' : 'width:100%;box-sizing:border-box;' });
        },
        answerKey(p) {
            const v = asksBar(p) ? String(p.answer) : Number(p.answer);
            return { value: v, display: String(p.answer), slots: { answer: { value: String(p.answer), graded: true } } };
        },
        // RUBRIC H13 (critic figures-r6): the cell is as wide as its drawing. A drawing that fits
        // half the page (a picture table, a tally chart, a small or S bar graph) stands two to a
        // row, its question under it; a wide one keeps the full width, the question beside it.
        footprint(p, ctx) {
            // The width of the WIDEST drawing the skill deals (its longest row, its longest name, a
            // bar graph's five bars), so every item of a page takes one cell width - a page never
            // mixes half-width and full-width graphs.
            const q = p || {};
            const scale = Number(q.scale) || 1;
            const canon = name === 'bar-graph'
                ? (Number(q.step) === 1 && Number(q.top) <= 10 && (q.categories || []).length <= 3
                    ? Object.assign({}, q, { categories: ['Nature', 'Nature', 'Nature'], values: [1, 1, 1] }) : null)
                : name === 'pictograph'
                    ? Object.assign({}, q, { categories: ['Triangles'], values: [(Number(q.widest) || 6) * scale] })
                    : Object.assign({}, q, { categories: ['Purple'], values: [Number(q.widest) || 15] });
            let W = 186;
            try { if (canon) W = draw(canon, ctx || {}).W; } catch (e) { W = 186; }
            // Two to a row when the drawing fits half the page (the question then stands under
            // it); the layout keeps whichever column count holds more problems (byCapacity).
            const two = W + 4 <= 84;
            // restacks: the question stands under the drawing in a half-width cell on purpose (not a
            // collapse, print-sheet's reflow rule)
            return { wMm: two ? Math.ceil(Math.max(W, 44) + 4) : 186, hMm: null, measure: true, factLike: false, maxCols: two ? 2 : 1, restacks: true, byCapacity: true };
        },
        inputs(p) {
            return asksBar(p)
                ? [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }]
                : [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        },
        layout(p) { return { card: 'card-wide-visual', checker: asksBar(p || {}) ? 'choice' : 'value', requiresVisual: true }; },
    });
}
dataCell('bar-graph', barGraphSVG);

/* ================================================================ pictograph and tally chart */

/**
 * The table a pictograph and a tally chart share: a heavy outline, a header row with the column
 * titles in words (RP-130's axis titles), one row per category with its name on the left and
 * `cell(i, x, yMid)` drawing the row's marks; `markW` is the widest row's marks. `rules: 'open'`
 * (O6) leaves out the lines between the rows.
 */
function rowTable(p, ctx, { markW, rowH, head2, cell }) {
    const cats = (p.categories || []).map(String);
    const zPt = labelPt(ctx), zMm = zPt * PT_MM;
    const labW = Math.max(...cats.map((c) => textW(c, zPt)), textW(p.catTitle || '', zPt)) + 5;
    const m = SW.heavy / 2;
    const headH = zMm * 1.8;
    const W = labW + Math.max(markW + 6, textW(head2, zPt) + 5);
    const H = headH + cats.length * rowH;
    let s = `<rect x="${n2(m)}" y="${n2(m)}" width="${n2(W)}" height="${n2(H)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    s += line(m, m + headH, m + W, m + headH, SW.one) + line(m + labW, m, m + labW, m + H, SW.hair);
    s += txt(m + 2.5, m + headH / 2 + zMm * 0.35, p.catTitle || '', zPt, { anchor: 'start' });
    s += txt(m + labW + 3, m + headH / 2 + zMm * 0.35, head2, zPt, { anchor: 'start' });
    cats.forEach((c, i) => {
        const y = m + headH + i * rowH;
        if (i && p.rules !== 'open') s += line(m, y, m + W, y, SW.hair);
        s += txt(m + 2.5, y + rowH / 2 + zMm * 0.35, c, zPt, { anchor: 'start', weight: 400 });
        s += cell(i, m + labW + 3, y + rowH / 2);
    });
    return { html: svg(ctx, W + 2 * m, H + 2 * m, s, { cls: 'fg-table', label: `${p.title || 'table'}` }), W: W + 2 * m, H: H + 2 * m };
}

// In-house line art the k2kit set does not have (RP-20: 1.5 pt outline, no fill, no faces): a
// person (a child counted by a "Number of children" graph) and a car.
const OUT = (sw) => `fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round" stroke-linecap="round"`;
const ART = Object.freeze({
    person: (cx, cy, d) => {
        const r = d * 0.2;
        return `<circle cx="${n2(cx)}" cy="${n2(cy - d * 0.27)}" r="${n2(r)}" ${OUT(SW.heavy)}/>`
            + `<path d="M${n2(cx - d * 0.36)} ${n2(cy + d * 0.47)}L${n2(cx - d * 0.3)} ${n2(cy + d * 0.08)}Q${n2(cx)} ${n2(cy - d * 0.08)} ${n2(cx + d * 0.3)} ${n2(cy + d * 0.08)}`
            + `L${n2(cx + d * 0.36)} ${n2(cy + d * 0.47)}Z" ${OUT(SW.heavy)}/>`;
    },
    car: (cx, cy, d) => {
        const w = d * 0.98, h = d * 0.42, y = cy - h * 0.1;
        return `<path d="M${n2(cx - w / 2)} ${n2(y + h / 2)}L${n2(cx - w / 2)} ${n2(y - h * 0.05)}L${n2(cx - w * 0.28)} ${n2(y - h * 0.12)}`
            + `L${n2(cx - w * 0.16)} ${n2(y - h * 0.62)}L${n2(cx + w * 0.2)} ${n2(y - h * 0.62)}L${n2(cx + w * 0.32)} ${n2(y - h * 0.12)}`
            + `L${n2(cx + w / 2)} ${n2(y)}L${n2(cx + w / 2)} ${n2(y + h / 2)}Z" ${OUT(SW.heavy)}/>`
            + `<circle cx="${n2(cx - w * 0.26)}" cy="${n2(y + h / 2)}" r="${n2(d * 0.12)}" ${OUT(SW.heavy)}/>`
            + `<circle cx="${n2(cx + w * 0.26)}" cy="${n2(y + h / 2)}" r="${n2(d * 0.12)}" ${OUT(SW.heavy)}/>`;
    },
});
/** Draw one picture (an ART figure or a k2kit shape) centred on (cx, cy), `d` across. */
const picture = (id, cx, cy, d) => (ART[id] ? ART[id](cx, cy, d) : shapeOf(id).draw(cx, cy, d));
/** The left half of a picture, clipped down its middle (RP-132). */
const halfPicture = (id, cx, cy, d) => `<g clip-path="url(#fg-half-l)">${picture(id, cx, cy, d)}</g>`;
const HALF_CLIP = '<defs><clipPath id="fg-half-l" clipPathUnits="objectBoundingBox"><rect x="-0.05" y="-0.1" width="0.55" height="1.2"/></clipPath></defs>';

/**
 * payload: the bar graph's, with `scale` (what one picture stands for), `icons` (the picture of
 * each row, a k2kit shape or an ART id) or `icon` (one for every row), and `rules`. A value may
 * end in half a picture. The key ("Key: [picture] = 2") goes beside the table, over the question.
 */
export function pictographSVG(p, ctx) {
    const vals = (p.values || []).map(Number);
    const scale = Number(p.scale) || 1;
    const twin = isTwin(ctx);
    // a picture graph of ones (Kindergarten) draws its pictures bigger on screen (critic regrade 5:
    // 12 px pictures on a phone card)
    const d = twin ? (scale === 1 ? 12 : 9) : ({ S: 5.5, M: 6.5, L: 7 }[sizeOf(ctx)] || 7);
    const pitch = d + (twin ? 2.5 : 2);
    const counts = vals.map((v) => v / scale);
    // the twin keeps the widest table a skill deals (5 or 6 pictures), so every graph shares a scale
    // every table of a page is as wide as the widest row the skill deals (`widest`)
    const maxPics = Math.max(twin ? (scale === 1 ? 5 : 6) : 3, Number(p.widest) || 0, ...counts.map(Math.ceil));
    const iconOf = (i) => (Array.isArray(p.icons) && p.icons[i]) || p.icon || 'circle';
    const hint = hintOn(p, ctx);
    const hPt = hintPt(ctx), hMm = hPt * PT_MM;
    const rowH = d + (twin ? 4 : 3) + (hint ? hMm + 0.6 : 0);
    const g = rowTable(p, ctx, {
        markW: maxPics * pitch, rowH, head2: p.valTitle || '',
        cell: (i, x, y) => {
            let out = '';
            const whole = Math.floor(counts[i] + 1e-9), half = counts[i] - whole > 0.25;
            const cy = hint ? y - (hMm + 0.6) / 2 : y;
            for (let k = 0; k < whole; k++) {
                out += picture(iconOf(i), x + k * pitch + d / 2, cy, d);
                // the hint (fades): the running count under each picture, in grey
                if (hint) out += txt(x + k * pitch + d / 2, cy + d / 2 + hMm * 0.95, String((k + 1) * scale), hPt, { weight: 400, fill: GREY, attrs: ' data-fg-hint="count"' });
            }
            if (half) {
                out += halfPicture(iconOf(i), x + whole * pitch + d / 2, cy, d);
                if (hint) out += txt(x + whole * pitch + d / 2, cy + d / 2 + hMm * 0.95, String(vals[i]), hPt, { weight: 400, fill: GREY, attrs: ' data-fg-hint="count"' });
            }
            return out;
        },
    });
    // the key: every picture of the graph once (one picture, or each row's), "= scale"
    const kinds = [...new Set(vals.map((_, i) => iconOf(i)))];
    // the key decides the answer: on screen it is as big as the question (critic figures-r6)
    const kPt = twin ? textPt(ctx) * 1.35 : Math.max(zonePt(ctx), 11);
    const kd = d * 0.85;
    const keySvg = (id) => svg(ctx, kd + 1, kd + 1, picture(id, (kd + 1) / 2, (kd + 1) / 2, kd), { label: `picture` });
    const unit = scale === 1 ? '1' : String(scale);
    // a graph of ones with a different picture in each row says so in words (three pictures
    // "= 1" read as three things making one)
    g.key = scale === 1 && kinds.length > 1
        ? `<span style="font-size:${P(ctx, kPt)};font-weight:700;line-height:1.2;">Each picture is 1.</span>`
        : `<span style="display:inline-flex;align-items:center;flex-wrap:wrap;gap:${L(ctx, 1.5)};font-size:${P(ctx, kPt)};font-weight:700;line-height:1.2;">`
            + `<span>Key:</span>${kinds.slice(0, 4).map((id) => `<span style="display:inline-block;line-height:0;">${keySvg(id)}</span>`).join('')}<span>= ${esc(unit)}</span></span>`;
    g.html = g.html.replace('>', `>${HALF_CLIP}`);
    return g;
}

/** payload: the bar graph's; the values are drawn as tally marks (RP-22), `rules` as above. */
export function tallySVG(p, ctx) {
    const vals = (p.values || []).map(Number);
    const twin = isTwin(ctx);
    const h = twin ? 11 : ({ S: 5.5, M: 8, L: 9 }[sizeOf(ctx)] || 9);
    const pitch = twin ? 3.2 : 2.5;
    const sw = twin ? 0.75 : SW.one;                      // a screen stroke reads at >= 2 px
    const hint = hintOn(p, ctx);
    const hPt = hintPt(ctx), hLab = hint ? textW('20', hPt) + 1.5 : 0;
    const bundleW = 4 * pitch + (twin ? 5 : 4) + hLab;
    const widthOf = (v) => Math.floor(v / 5) * bundleW + (v % 5) * pitch;
    const markW = Math.max(twin ? 4 * bundleW : 10, widthOf(Number(p.widest) || 0), ...vals.map(widthOf));
    return rowTable(p, ctx, {
        markW, rowH: h + (twin ? 4 : sizeOf(ctx) === 'S' ? 2.5 : 3), head2: p.valTitle || 'Tally',
        cell: (i, x, y) => {
            let out = '';
            const v = vals[i];
            for (let k = 0; k < v; k++) {
                const b = Math.floor(k / 5), j = k % 5;
                const bx = x + b * bundleW;
                if (j < 4) out += line(bx + j * pitch, y - h / 2, bx + j * pitch, y + h / 2, sw, INK, ' stroke-linecap="round"');
                else {
                    out += line(bx - 1.2, y + h * 0.3, bx + 3 * pitch + 1.2, y - h * 0.3, sw, INK, ' stroke-linecap="round"');
                    // the hint (fades): the running count after each whole bundle, in grey
                    if (hint) out += txt(bx + 3 * pitch + 2.4, y + hPt * PT_MM * 0.35, String((b + 1) * 5), hPt, { anchor: 'start', weight: 400, fill: GREY, attrs: ' data-fg-hint="count"' });
                }
            }
            return out;
        },
    });
}
dataCell('pictograph', pictographSVG);
dataCell('tally-chart', tallySVG);

/* ================================================================ perimeter */

/** The largest drawing box of a figure (mm) by page size: the figure scales with the page (L1). */
const FIG_BOX = Object.freeze({ S: [36, 24], M: [42, 28], L: [48, 32] });

/**
 * payload: {shape: 'rectangle' | 'square' | 'triangle' | 'pentagon', sides (in order round the
 * shape: a rectangle's top, left, bottom, right; a triangle's base, then its right and left
 * sides; a five-sided house's base, right wall, right roof, left roof, left wall), show: [bool per
 * side], unit: 'cm' | 'm', ans, support}. Drawn to scale.
 */
export function perimeterSVG(p, ctx) {
    const sides = (p.sides || []).map(Number);
    const show = p.show || sides.map(() => true);
    const unit = String(p.unit || '');
    const dPt = digitPt(ctx), uPt = textPt(ctx);
    const dMm = dPt * PT_MM;
    const labW = (v) => textW(v, dPt) + (unit ? textW(` ${unit}`, uPt) : 0);
    const label = (x, y, v, anchor) => `<text x="${n2(x)}" y="${n2(y + dMm * 0.35)}" text-anchor="${anchor}" ${FONT} font-weight="700" fill="${INK}">`
        + `<tspan font-size="${n2(dMm)}">${esc(v)}</tspan>${unit ? `<tspan font-size="${n2(uPt * PT_MM)}"> ${esc(unit)}</tspan>` : ''}</text>`;
    const [maxW, maxH] = isTwin(ctx) ? FIG_BOX.L : (FIG_BOX[sizeOf(ctx)] || FIG_BOX.L);
    const minSide = maxH * 0.32;
    let pts;
    const labels = [];
    /** Labels outside each shown side of a closed polygon (the outward normal of the side). */
    const labelEdges = (poly) => {
        const cen = [poly.reduce((a, q) => a + q[0], 0) / poly.length, poly.reduce((a, q) => a + q[1], 0) / poly.length];
        poly.forEach((A, i) => {
            if (!show[i]) return;
            const Bp = poly[(i + 1) % poly.length];
            const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2;
            let nx = -(Bp[1] - A[1]), ny = Bp[0] - A[0];
            const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
            if ((mx - cen[0]) * nx + (my - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
            const w = labW(sides[i]);
            const off = 2.5 + Math.abs(nx) * w / 2 + Math.abs(ny) * dMm / 2;
            labels.push({ x: mx + nx * off, y: my + ny * off, v: sides[i], anchor: 'middle', w, h: dMm });
        });
    };
    if (p.shape === 'triangle') {
        // base along the bottom; the apex from the other two sides (law of cosines)
        const [c, a, b] = sides;                          // base, right side, left side
        const ax = (c * c + b * b - a * a) / (2 * c);
        const ay = Math.sqrt(Math.max(0.01, b * b - ax * ax));
        const minX = Math.min(0, ax), maxX = Math.max(c, ax);
        const k = Math.min(maxW / (maxX - minX), maxH / ay);
        pts = [[(0 - minX) * k, ay * k], [(c - minX) * k, ay * k], [(ax - minX) * k, 0]];
        labelEdges(pts);
    } else if (p.shape === 'pentagon') {
        // a house: a base, two equal walls, two equal roof edges meeting over the middle
        const [base, wall, roof] = sides;
        const halfB = base / 2;
        const rise = Math.sqrt(Math.max(0.25, roof * roof - halfB * halfB));
        const k = Math.min(maxW / base, maxH / (wall + rise));
        const bw = base * k, wh = wall * k, rh = rise * k;
        // round the shape from the bottom left: base, right wall, right roof, left roof, left wall
        pts = [[0, rh + wh], [bw, rh + wh], [bw, rh], [bw / 2, 0], [0, rh]];
        labelEdges(pts);
    } else {
        const l = sides[0], w = sides[1];
        const k = Math.min(maxW / l, maxH / w);
        let rw = l * k, rh = w * k;
        if (rh < minSide) rh = minSide;
        if (rw < minSide) rw = minSide;
        pts = [[0, 0], [rw, 0], [rw, rh], [0, rh]];
        const gap = 2.5;
        if (show[0]) labels.push({ x: rw / 2, y: -gap - dMm / 2, v: sides[0], anchor: 'middle', w: labW(sides[0]), h: dMm });
        if (show[1]) labels.push({ x: -gap, y: rh / 2, v: sides[1], anchor: 'end', w: labW(sides[1]), h: dMm });
        if (show[2]) labels.push({ x: rw / 2, y: rh + gap + dMm / 2, v: sides[2], anchor: 'middle', w: labW(sides[2]), h: dMm });
        if (show[3]) labels.push({ x: rw + gap, y: rh / 2, v: sides[3], anchor: 'start', w: labW(sides[3]), h: dMm });
    }
    // the drawing's bounds: the shape and every label
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    const grow = (a, b, c, d) => { x1 = Math.min(x1, a); y1 = Math.min(y1, b); x2 = Math.max(x2, c); y2 = Math.max(y2, d); };
    for (const [x, y] of pts) grow(x, y, x, y);
    for (const lb of labels) {
        const lx = lb.anchor === 'middle' ? lb.x - lb.w / 2 : lb.anchor === 'end' ? lb.x - lb.w : lb.x;
        grow(lx, lb.y - lb.h / 2, lx + lb.w, lb.y + lb.h / 2);
    }
    const pad = 1.5;
    const ox = -x1 + pad, oy = -y1 + pad;
    const W = x2 - x1 + 2 * pad, H = y2 - y1 + 2 * pad;
    let s = `<polygon points="${pts.map(([x, y]) => `${n2(x + ox)},${n2(y + oy)}`).join(' ')}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>`;
    for (const lb of labels) s += label(lb.x + ox, lb.y + oy, lb.v, lb.anchor);
    return { html: svg(ctx, W, H, s, { cls: 'fg-perimeter', label: `${p.shape} with sides ${sides.join(', ')} ${unit}` }), W, H };
}

/** The hint (fades): a grey addition frame, one short line a side ("__ + __ + __ + __"). */
function additionFrame(p, ctx) {
    const n = (p.sides || []).length;
    const w = blankWidth(2, sizeOf(ctx)) * 0.8;
    const blank = `<span data-fg-hint="frame" style="display:inline-block;width:${L(ctx, w)};height:${L(ctx, S(ctx).writeMm)};border-bottom:${B(ctx, 1)} solid ${GREY};"></span>`;
    const plus = `<span style="color:${GREY};font-size:${P(ctx, textPt(ctx))};font-weight:700;">+</span>`;
    return `<div style="display:flex;align-items:flex-end;justify-content:center;gap:${L(ctx, 1.5)};margin-top:${L(ctx, 2)};flex-wrap:wrap;">`
        + Array.from({ length: n }, () => blank).join(plus) + `</div>`;
}

register('perimeter-shape', {
    render(p, ctx) {
        const f = perimeterSVG(p, ctx);
        const digits = Math.max(2, String(p.ans).length);
        const frame = hintOn(p, ctx) ? additionFrame(p, ctx) : '';
        const sentence = `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 3)};white-space:nowrap;">`
            + `${words(ctx, 'Perimeter =')}${numberSlot(ctx, 'answer', p.ans, { digits, unit: String(p.unit || '') })}</div>`;
        // paper: every drawing stands in one box as tall as the tallest shape and its labels, so
        // the "Perimeter =" lines of a row sit level (critic regrade 5, test@S)
        const box = isTwin(ctx) ? 'display:inline-block;max-width:100%;'
            : `display:flex;align-items:center;justify-content:center;max-width:100%;min-height:${L(ctx, (FIG_BOX[sizeOf(ctx)] || FIG_BOX.L)[1] + 2 * (2.5 + digitPt(ctx) * PT_MM) + 1)};`;
        return root(ctx, 'fg-perimeter-cell', `<div style="${box}">${f.html}</div>${frame}${sentence}`);
    },
    answerKey(p) {
        return { value: Number(p.ans), display: `${p.ans} ${p.unit || ''}`.trim(), slots: { answer: { value: String(p.ans), graded: true } } };
    },
    footprint(p, ctx) {
        // the drawing or the "Perimeter = [ ] cm" line, whichever is wider, and a margin (like
        // frac-model): a Model cell then sits beside its worked steps without an empty band
        const f = perimeterSVG(p || {}, ctx || {});
        const sentence = textW('Perimeter =', textPt(ctx || {})) + blankWidth(Math.max(2, String((p || {}).ans).length), sizeOf(ctx || {}))
            + textW(` ${(p || {}).unit || ''}`, textPt(ctx || {})) + 6;
        // (+3: the drawing's own box already carries its label margins; +8 capped a 10 cm
        // rectangle at one column, so a Guided page stood one shape to a page)
        const wMm = Math.ceil(Math.max(f.W, sentence) + 3);
        return { wMm, hMm: null, measure: true, factLike: false, maxCols: wMm <= 60 ? 3 : wMm <= 90 ? 2 : 1 };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

export const FIGURE_TEMPLATE_IDS = Object.freeze(['thermometer', 'ruler', 'bar-graph', 'pictograph', 'tally-chart', 'perimeter-shape']);
