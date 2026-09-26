// js/modules/sheet/cells/figures.js
// O6 lane AP2, round 3 (critic round 4, root cause #5): the figure and data cells that were
// still drawn by the LEGACY print path, moved to the kit so paper, the answer key and the three
// screen hosts draw ONE picture with ONE set of answer slots (AK-4).
//
//   thermometer      read a thermometer (measurement:temperature). A mark every degree, numbers
//                    every 5 or 10 (O6 "Figure labels"); the unit pre-printed after the one box.
//   ruler            read an inch ruler at TRUE scale (RP-160: 25.4 mm an inch, tick heights 6 /
//                    4.5 / 3.5 mm), an arrow from above; ONE answer slot in the sentence
//                    "The arrow points to [ ] inches." (a whole box, or a whole box and a stacked
//                    fraction when the ruler reads halves or quarters).
//   bar-graph        a bar graph with its FULL numbered scale (a grid line and a number on every
//                    step, every value on a step), axis titles in words (RP-130), grey bars with a
//                    1.5 pt outline (RP-131), no number over any bar; standing up or lying down
//                    (O6 "Bars"). The question and its answer sit beside the graph in one
//                    keep-together cell (RP-133): a box for a number, "Check one box." for a bar.
//   perimeter-shape  a rectangle, square or triangle drawn to scale, every side labelled with its
//                    length and a real unit ("5 cm"), or only the sides that cannot be worked out
//                    (O6 "Figure labels": some); "Perimeter = [ ] cm".
//
// ONE DRAWING, TWO HOSTS: every length is a paper millimetre (k2kit.js); the screen twin
// (`ctx.options.twin`, k2Twin) draws the same cell at `--mq-k2` px a millimetre, and its boxes
// carry the screen hooks (`data-mq-blank` for one answer, `data-mq-cell` + `data-mq-join` for a
// mixed number), so the practice card, the online worksheet and the quiz take the answer in the
// paper's own slot.
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

/* ================================================================ thermometer */

/**
 * payload: {temp, unit: '°F' | '°C', lo, hi, every: 5 | 10}. The window lo..hi is 20 degrees, a
 * mark every degree 2 / 2.25 / 2.5 mm apart (S / M / L); the tube is a 7 mm outline, the column a 3.2 mm solid bar and
 * the bulb a 6.8 mm solid disc inside a 13 mm outline (INK-5: no solid fill wider than 7 mm).
 */
export function thermometerSVG(p, ctx) {
    const lo = Number(p.lo), hi = Number(p.hi), every = Number(p.every) || 5, t = Number(p.temp);
    // a mark every degree, 2 / 2.25 / 2.5 mm apart at S / M / L (L1: the S page holds more)
    const pitch = isTwin(ctx) ? 2.5 : ({ S: 2, M: 2.25, L: 2.5 }[sizeOf(ctx)] || 2.5);
    const labPt = Math.max(zonePt(ctx), textPt(ctx));
    const labMm = labPt * PT_MM;
    // the bulb (r 6.5) is wider than the tube: the tube sits in from the left so the bulb's
    // edge and stroke stay inside the viewBox (it drew 1.5 mm outside the cell, left-aligned)
    const tw = 7, tx = 6.5 - tw / 2 + 1, cx = tx + tw / 2;
    const yT = labMm + 3.5;                               // the tube's top, under the unit
    const y = (d) => yT + 4 + (hi - d) * pitch;
    const yB = y(lo) + 4;
    const bulbR = 6.5, by = yB + 4.5;
    const yJ = by - Math.sqrt(bulbR * bulbR - (tw / 2) * (tw / 2));
    const tickX = tx + tw;
    const labX = tickX + 5.5 + 1.8;
    const labW = Math.max(...[lo, hi].map((v) => textW(v, labPt)));
    const W = labX + labW + 1;
    const H = by + bulbR + 1;
    let s = '';
    // the glass: a tube with a round top that opens into the bulb
    s += `<path d="M${n2(tx)} ${n2(yT + tw / 2)}A${n2(tw / 2)} ${n2(tw / 2)} 0 0 1 ${n2(tx + tw)} ${n2(yT + tw / 2)}L${n2(tx + tw)} ${n2(yJ)}`
        + `A${n2(bulbR)} ${n2(bulbR)} 0 1 1 ${n2(tx)} ${n2(yJ)}Z" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"/>`;
    // the liquid: a solid column from the bulb to the temperature
    s += `<circle cx="${n2(cx)}" cy="${n2(by)}" r="3.4" fill="${INK}"/>`;
    s += `<rect x="${n2(cx - 1.6)}" y="${n2(y(t))}" width="3.2" height="${n2(by - y(t))}" fill="${INK}" data-fg-temp="${esc(t)}"/>`;
    // the scale: a mark every degree, longer every 5 and 10, a number every `every`
    for (let d = lo; d <= hi; d++) {
        const len = d % 10 === 0 ? 5.5 : d % 5 === 0 ? 4 : 2.5;
        const w = d % 10 === 0 ? SW.heavy : d % 5 === 0 ? SW.one : SW.hair;
        s += line(tickX, y(d), tickX + len, y(d), w);
        if (d % every === 0) s += txt(labX, y(d) + labMm * 0.35, String(d), labPt, { anchor: 'start' });
    }
    // Guided and Model (hint, fades at Independent): a grey guide from the column top to the scale
    if (levelOf(ctx) >= 2) s += line(cx + 1.6, y(t), labX - 1, y(t), SW.one, GREY, ' data-fg-hint="guide"');
    // the unit, over the tube
    s += txt(cx + 2, labMm, String(p.unit || ''), labPt);
    return { html: svg(ctx, W, H, s, { cls: 'fg-thermo', label: `thermometer, ${lo} to ${hi} ${p.unit || ''}` }), W, H };
}

register('thermometer', {
    render(p, ctx) {
        const th = thermometerSVG(p, ctx);
        const digits = Math.max(2, String(Math.abs(Number(p.hi))).length);
        const slot = numberSlot(ctx, 'answer', p.temp, { digits, unit: String(p.unit || '') });
        return root(ctx, 'fg-thermometer', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 8)};">`
            + `<div style="flex:none;">${th.html}</div><div style="flex:none;">${slot}</div></div>`);
    },
    answerKey(p) {
        return { value: Number(p.temp), display: `${p.temp} ${p.unit || ''}`.trim(), slots: { answer: { value: String(p.temp), graded: true } } };
    },
    // up to 3 across (a thermometer and one box are narrow); the page measures what fits
    footprint() { return { wMm: 62, hMm: null, measure: true, factLike: false, maxCols: 3 }; },
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

/**
 * payload: {len: 6, meas (inches, a multiple of 1/res), res: 1 | 2 | 4 (marks per inch),
 * labels: 'all' | 'some', ans: "2 1/2"}. Drawn at true scale (RP-160).
 */
export function rulerSVG(p, ctx) {
    const len = Number(p.len) || 6, res = [1, 2, 4].includes(Number(p.res)) ? Number(p.res) : 1;
    // true scale on paper (RP-160); the screen twin is never true scale, so it is drawn shorter
    // with bigger numerals (a phone shows it 320 px wide)
    const inch = isTwin(ctx) ? 17 : 25.4, inset = 3;
    const bodyW = len * inch + 2 * inset, bodyH = 14;
    const y0 = 10;                                        // the body's top edge, under the arrow
    const numPt = textPt(ctx) * (isTwin(ctx) ? 1.3 : 1);
    let s = `<rect x="${n2(SW.hair / 2)}" y="${n2(y0)}" width="${n2(bodyW)}" height="${bodyH}" rx="1.5" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let i = 0; i <= len * res; i++) {
        const x = SW.hair / 2 + inset + i * inch / res;
        const whole = i % res === 0, half = !whole && (i * 2) % res === 0;
        const h = whole ? 6 : half ? 4.5 : 3.5;
        s += line(x, y0, x, y0 + h, whole ? SW.one : SW.hair);
        const n = i / res;
        if (whole && (p.labels !== 'some' || n % 2 === 0)) s += txt(x, y0 + 6.8 + numPt * PT_MM * 0.8, String(n), numPt);
    }
    // the arrow, from above, its point on the body's top edge
    const ax = SW.hair / 2 + inset + Number(p.meas) * inch;
    s += line(ax, 0.5, ax, y0 - 4, SW.heavy);
    s += `<path d="M${n2(ax - 2.6)} ${n2(y0 - 4.6)}L${n2(ax + 2.6)} ${n2(y0 - 4.6)}L${n2(ax)} ${n2(y0 - 0.3)}Z" fill="${INK}" data-fg-arrow="${esc(p.meas)}"/>`;
    return { html: svg(ctx, bodyW + SW.hair, y0 + bodyH + 0.5, s, { cls: 'fg-ruler', label: `inch ruler, 0 to ${len} inches, with an arrow` }), W: bodyW };
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
    const frac = `<span style="display:inline-flex;flex-direction:column;align-items:center;flex:none;">${one('n', 12, fb)}`
        + `<span aria-hidden="true" style="display:block;align-self:stretch;min-width:${L(ctx, 12)};border-top:${B(ctx, 1.5)} solid ${INK};margin:${L(ctx, 0.8)} 0;"></span>`
        + `${one('d', 12, fb)}</span>`;
    return `<span data-ws-slot-group="mixed"${isTwin(ctx) ? ' data-mq-join="mixed"' : ''} style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};flex:none;">`
        + `${one('w', 14, h)}${frac}</span>`;
}

register('ruler', {
    render(p, ctx) {
        const r = rulerSVG(p, ctx);
        const sentence = `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 4)};white-space:nowrap;">`
            + `${words(ctx, 'The arrow points to')}${rulerSlot(p, ctx)}${words(ctx, 'inches.')}</div>`;
        return root(ctx, 'fg-ruler-cell', `<div style="display:inline-block;">${r.html}</div>${sentence}`);
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
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
    inputs(p) {
        if ((Number(p.res) || 1) === 1) return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        return ['w', 'n', 'd'].map((id, k) => ({ id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});

/* ================================================================ bar graph */

/** Plot area by size (section 11.2 "Graph (plot area)"). */
const PLOT = Object.freeze({ S: [80, 60], M: [90, 70], L: [100, 80] });

/**
 * payload: {title, categories, values, step, top, orientation: 'vertical' | 'horizontal',
 * catTitle, valTitle, ask: {kind: 'value'|'most'|'least'|'more'|'total', i?, j?}, question,
 * answer (a number, or a category for most / least)}.
 */
export function barGraphSVG(p, ctx) {
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const n = Math.max(1, cats.length);
    const step = Number(p.step) || 1, top = Number(p.top) || Math.max(...vals, 1);
    // The screen twin is drawn smaller than paper by its host (a phone, a worksheet card), so it
    // takes the M plot and labels nearly half as large again: the numbers stay readable at 390 px.
    const [pw0, ph0] = isTwin(ctx) ? PLOT.M : (PLOT[sizeOf(ctx)] || PLOT.L);
    const zPt = zonePt(ctx) * (isTwin(ctx) ? 1.45 : 1), zMm = zPt * PT_MM;
    const steps = [];
    for (let v = 0; v <= top + 1e-9; v += step) steps.push(+v.toFixed(6));
    const hint = levelOf(ctx) >= 2 && p.ask && p.ask.kind === 'value' && Number.isInteger(p.ask.i) ? p.ask.i : -1;
    let s = '';
    let W, H;
    // the graph's title stands over the question beside it (render), so the drawing starts
    // with the top axis title
    if (p.orientation !== 'horizontal') {
        const valLabW = Math.max(...steps.map((v) => textW(v, zPt)));
        const catW = Math.max(...cats.map((c) => textW(c, zPt)));
        const slotW = Math.max(pw0 / n, catW + 2, 16);
        const PW = slotW * n, PH = ph0;
        const valTitleY = zMm * 1.0;
        const x0 = Math.max(valLabW + 3, 1), yTop = valTitleY + 3.2, yBot = yTop + PH;
        const yOf = (v) => yBot - (v / top) * PH;
        for (const v of steps) {
            s += line(x0, yOf(v), x0 + PW, yOf(v), SW.fine);
            s += line(x0 - 1.5, yOf(v), x0, yOf(v), SW.one);
            s += txt(x0 - 2.5, yOf(v) + zMm * 0.35, String(v), zPt, { anchor: 'end', weight: 400 });
        }
        const barW = Math.min(slotW * 0.6, 18);
        vals.forEach((v, i) => {
            const bx = x0 + i * slotW + (slotW - barW) / 2;
            if (v > 0) {
                s += `<rect x="${n2(bx)}" y="${n2(yOf(v))}" width="${n2(barW)}" height="${n2(yBot - yOf(v))}" fill="${GREY}" `
                    + `stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-fg-bar="${esc(cats[i])}"/>`;
            }
            if (i === hint) s += line(x0, yOf(v), bx, yOf(v), SW.rule, GREY, ' data-fg-hint="guide"');
            s += txt(bx + barW / 2, yBot + 1.8 + zMm * 0.8, cats[i], zPt, { weight: 400 });
        });
        s += line(x0, yTop - 2, x0, yBot, SW.heavy) + line(x0, yBot, x0 + PW, yBot, SW.heavy);
        // the axis titles in words (RP-130), the value axis's over the scale, never turned
        // over the plot, right of the axis, so it never meets the top number of the scale
        s += txt(x0 + 2, valTitleY, p.valTitle || '', zPt, { anchor: 'start' });
        const catTitleY = yBot + 1.5 + zMm * 0.8 + zMm * 1.35;
        s += txt(x0 + PW / 2, catTitleY, p.catTitle || '', zPt);
        W = x0 + PW + 2;
        H = catTitleY + zMm * 0.4;
        W = Math.max(W, x0 + 2 + textW(p.valTitle || '', zPt) + 1);
    } else {
        const catW = Math.max(...cats.map((c) => textW(c, zPt)));
        const slotH = Math.max(ph0 / n, 13);
        const PW = pw0, PH = slotH * n;
        const catTitleY = zMm * 1.0;
        const x0 = Math.max(catW + 3, 1), yTop = catTitleY + 3, yBot = yTop + PH;
        const xOf = (v) => x0 + (v / top) * PW;
        for (const v of steps) {
            s += line(xOf(v), yTop, xOf(v), yBot, SW.fine);
            s += line(xOf(v), yBot, xOf(v), yBot + 1.5, SW.one);
            s += txt(xOf(v), yBot + 2.2 + zMm * 0.8, String(v), zPt, { weight: 400 });
        }
        const barH = Math.min(slotH * 0.6, 12);
        vals.forEach((v, i) => {
            const by = yTop + i * slotH + (slotH - barH) / 2;
            if (v > 0) {
                s += `<rect x="${n2(x0)}" y="${n2(by)}" width="${n2(xOf(v) - x0)}" height="${n2(barH)}" fill="${GREY}" `
                    + `stroke="${INK}" stroke-width="${n2(SW.heavy)}" data-fg-bar="${esc(cats[i])}"/>`;
            }
            if (i === hint) s += line(xOf(v), by + barH, xOf(v), yBot, SW.rule, GREY, ' data-fg-hint="guide"');
            s += txt(x0 - 2.5, by + barH / 2 + zMm * 0.35, cats[i], zPt, { anchor: 'end', weight: 400 });
        });
        s += line(x0, yTop, x0, yBot, SW.heavy) + line(x0, yBot, x0 + PW + 2, yBot, SW.heavy);
        s += txt(0.5, catTitleY, p.catTitle || '', zPt, { anchor: 'start' });
        const valTitleY = yBot + 2 + zMm * 0.8 + zMm * 1.35;
        s += txt(x0 + PW / 2, valTitleY, p.valTitle || '', zPt);
        W = Math.max(x0 + PW + 3, textW(p.catTitle || '', zPt) + 1, x0 + PW / 2 + textW(p.valTitle || '', zPt) / 2 + 1);
        H = valTitleY + zMm * 0.4;
    }
    return { html: svg(ctx, W, H, s, { cls: 'fg-bars', label: `bar graph: ${p.title || ''}` }), W, H };
}

/** Is the answer a bar (check one box) rather than a number? */
const asksBar = (p) => p.ask && (p.ask.kind === 'most' || p.ask.kind === 'least');

/**
 * The data cell every graph shares (bar graph, pictograph, tally chart): the drawing on the
 * left; on the right the graph's title, the question and its answer place: a box for a number,
 * "Check one box." for a bar or a row (RP-133: the graph and its question are one cell).
 */
function dataCell(name, draw) {
    register(name, {
        render(p, ctx) {
            const g = draw(p, ctx);
            const cats = (p.categories || []).map(String);
            // the screen twin is drawn smaller than paper: its words a third larger (as its labels)
            const tw = isTwin(ctx) ? 1.35 : 1;
            let answer;
            if (asksBar(p)) {
                answer = `<div style="margin-top:${L(ctx, 3)};">${words(ctx, 'Check one box.', { pt: zonePt(ctx) * tw })}</div>`
                    + `<div style="margin-top:${L(ctx, 1)};">${tickList(ctx, cats, { on: tickedIndex(ctx, cats, p.answer), id: 'answer', pt: (textPt(ctx) + 1) * tw })}</div>`;
            } else {
                const digits = Math.max(1, String(p.answer).length);
                answer = `<div style="margin-top:${L(ctx, 4)};">${numberSlot(ctx, 'answer', p.answer, { digits })}</div>`;
            }
            const ask = `<div class="fg-ask" style="flex:1 1 ${L(ctx, 40)};min-width:${L(ctx, 40)};max-width:${L(ctx, 70)};text-align:left;">`
                + `<div class="fg-title" style="font-size:${P(ctx, textPt(ctx) * tw)};font-weight:700;line-height:1.25;margin-bottom:${L(ctx, 3)};">${esc(p.title || '')}</div>`
                + `<div style="font-size:${P(ctx, textPt(ctx) * tw)};font-weight:400;line-height:1.3;white-space:normal;">${esc(p.question || '')}</div>${answer}</div>`;
            return root(ctx, `fg-${name}`, `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 6)};flex-wrap:wrap;">`
                + `<div style="flex:none;max-width:100%;">${g.html}</div>${ask}</div>`);
        },
        answerKey(p) {
            const v = asksBar(p) ? String(p.answer) : Number(p.answer);
            return { value: v, display: String(p.answer), slots: { answer: { value: String(p.answer), graded: true } } };
        },
        footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
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
 * `cell(i, x, yMid)` drawing the row's marks; `markW` is the widest row's marks.
 */
function rowTable(p, ctx, { markW, rowH, head2, cell, foot = null }) {
    const cats = (p.categories || []).map(String);
    const zPt = zonePt(ctx) * (isTwin(ctx) ? 1.45 : 1), zMm = zPt * PT_MM;
    const labW = Math.max(...cats.map((c) => textW(c, zPt)), textW(p.catTitle || '', zPt)) + 5;
    const m = SW.heavy / 2;
    const headH = zMm * 1.9;
    const W = labW + Math.max(markW + 6, textW(head2, zPt) + 5);
    const H = headH + cats.length * rowH;
    let s = `<rect x="${n2(m)}" y="${n2(m)}" width="${n2(W)}" height="${n2(H)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    s += line(m, m + headH, m + W, m + headH, SW.one) + line(m + labW, m, m + labW, m + H, SW.hair);
    s += txt(m + 2.5, m + headH / 2 + zMm * 0.35, p.catTitle || '', zPt, { anchor: 'start' });
    s += txt(m + labW + 3, m + headH / 2 + zMm * 0.35, head2, zPt, { anchor: 'start' });
    cats.forEach((c, i) => {
        const y = m + headH + i * rowH;
        if (i) s += line(m, y, m + W, y, SW.hair);
        s += txt(m + 2.5, y + rowH / 2 + zMm * 0.35, c, zPt, { anchor: 'start', weight: 400 });
        s += cell(i, m + labW + 3, y + rowH / 2);
    });
    let Ht = H + 2 * m;
    if (foot) { s += foot(m + 0.5, Ht + 2, zPt, zMm); Ht += foot.h(zMm) + 2; }
    return { html: svg(ctx, W + 2 * m, Ht, s, { cls: 'fg-table', label: `${p.title || 'table'}` }), W: W + 2 * m, H: Ht };
}

/**
 * payload: the bar graph's, with `scale` (what one picture stands for) and `icon` (a k2kit
 * shape). Every value is a whole number of pictures; the key is printed under the table
 * (RP-132: "Key: [picture] = 2").
 */
export function pictographSVG(p, ctx) {
    const vals = (p.values || []).map(Number);
    const scale = Number(p.scale) || 1;
    const d = sizeOf(ctx) === 'L' || isTwin(ctx) ? 7 : 6, pitch = d + 2;
    const counts = vals.map((v) => Math.round(v / scale));
    const markW = Math.max(3, ...counts) * pitch;
    const shape = shapeOf(p.icon);
    const foot = (x, y, zPt, zMm) => {
        const kw = textW('Key:', zPt);
        return txt(x, y + d / 2 + zMm * 0.35, 'Key:', zPt, { anchor: 'start' })
            + shape.draw(x + kw + 2 + d / 2, y + d / 2, d)
            + txt(x + kw + 4 + d, y + d / 2 + zMm * 0.35, `= ${scale}`, zPt, { anchor: 'start' });
    };
    foot.h = () => d + 1;
    return rowTable(p, ctx, {
        markW, rowH: d + (sizeOf(ctx) === 'S' && !isTwin(ctx) ? 4 : 5), head2: p.valTitle || '', foot,
        cell: (i, x, y) => {
            let out = '';
            for (let k = 0; k < counts[i]; k++) out += shape.draw(x + k * pitch + d / 2, y, d);
            return out;
        },
    });
}

/** payload: the bar graph's; the values are drawn as tally marks (RP-22). */
export function tallySVG(p, ctx) {
    const vals = (p.values || []).map(Number);
    const h = isTwin(ctx) ? 10 : ({ S: 6, M: 8, L: 10 }[sizeOf(ctx)] || 10);
    const pitch = 2.5, bundleW = 4 * pitch + 4;
    const widthOf = (v) => Math.floor(v / 5) * bundleW + (v % 5) * pitch;
    const markW = Math.max(...vals.map(widthOf), 10);
    return rowTable(p, ctx, {
        markW, rowH: h + 5, head2: p.valTitle || 'Tally',
        cell: (i, x, y) => {
            let out = '';
            const v = vals[i];
            for (let k = 0; k < v; k++) {
                const b = Math.floor(k / 5), j = k % 5;
                const bx = x + b * bundleW;
                if (j < 4) out += line(bx + j * pitch, y - h / 2, bx + j * pitch, y + h / 2, SW.hair, INK, ' stroke-linecap="round"');
                else out += line(bx - 1.2, y + h * 0.3, bx + 3 * pitch + 1.2, y - h * 0.3, SW.hair, INK, ' stroke-linecap="round"');
            }
            return out;
        },
    });
}
dataCell('pictograph', pictographSVG);
dataCell('tally-chart', tallySVG);

/* ================================================================ perimeter */

/**
 * payload: {shape: 'rectangle' | 'square' | 'triangle', sides (in order round the shape: a
 * rectangle's top, left, bottom, right; a triangle's base, then its right and left sides),
 * show: [bool per side], unit: 'cm' | 'm', ans}. Drawn to scale in a box at most 48 x 32 mm.
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
    const maxW = 48, maxH = 32, minSide = 10;
    let pts, labels = [];
    if (p.shape === 'triangle') {
        // base along the bottom; the apex from the other two sides (law of cosines)
        const [c, a, b] = sides;                          // base, right side, left side
        const ax = (c * c + b * b - a * a) / (2 * c);
        const ay = Math.sqrt(Math.max(0.01, b * b - ax * ax));
        const minX = Math.min(0, ax), maxX = Math.max(c, ax);
        const k = Math.min(maxW / (maxX - minX), maxH / ay);
        const P0 = [(0 - minX) * k, ay * k], P1 = [(c - minX) * k, ay * k], P2 = [(ax - minX) * k, 0];
        pts = [P0, P1, P2];
        const cen = [(P0[0] + P1[0] + P2[0]) / 3, (P0[1] + P1[1] + P2[1]) / 3];
        const edges = [[P0, P1, 0], [P1, P2, 1], [P2, P0, 2]];
        for (const [A, Bp, i] of edges) {
            if (!show[i]) continue;
            const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2;
            let nx = -(Bp[1] - A[1]), ny = Bp[0] - A[0];
            const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
            if ((mx - cen[0]) * nx + (my - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
            const w = labW(sides[i]);
            const off = 2.5 + Math.abs(nx) * w / 2 + Math.abs(ny) * dMm / 2;
            labels.push({ x: mx + nx * off, y: my + ny * off, v: sides[i], anchor: 'middle', w, h: dMm });
        }
    } else {
        const l = sides[0], w = sides[1];
        let k = Math.min(maxW / l, maxH / w);
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

register('perimeter-shape', {
    render(p, ctx) {
        const f = perimeterSVG(p, ctx);
        const digits = Math.max(2, String(p.ans).length);
        const sentence = `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 4)};white-space:nowrap;">`
            + `${words(ctx, 'Perimeter =')}${numberSlot(ctx, 'answer', p.ans, { digits, unit: String(p.unit || '') })}</div>`;
        return root(ctx, 'fg-perimeter-cell', `<div style="display:inline-block;">${f.html}</div>${sentence}`);
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
        const wMm = Math.ceil(Math.max(f.W, sentence) + 8);
        return { wMm, hMm: null, measure: true, factLike: false, maxCols: wMm <= 88 ? 2 : 1 };
    },
    inputs() { return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

export const FIGURE_TEMPLATE_IDS = Object.freeze(['thermometer', 'ruler', 'bar-graph', 'pictograph', 'tally-chart', 'perimeter-shape']);
