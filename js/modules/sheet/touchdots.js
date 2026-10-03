// js/modules/sheet/touchdots.js
// TOUCH NUMERALS (S1): a digit 0-9 drawn as its own glyph with its counting points ON the strokes,
// so a pupil can touch and count them. 1-5 carry single dots; 6-9 carry circled dots (a solid dot
// inside a ring, touched and counted twice, doubles first); 0 carries none. The UI word is
// "Touch dots". MathQuest's own drawing.
//
// ONE UNIT (owner report 2026-10-03). A touch numeral is one span: the real Andika digit (so it
// registers exactly, keeps its width and baseline, and the cell never moves) with its marks on
// its strokes. The touch points come from the app's own Andika outlines (touch-glyphs.js,
// generated from css/fonts by tests/scripts/ws-touch-glyphs.py, open 4 per TY-4), snapped to the
// stroke centre; the outline path is there too for a host with no text (`glyph: true`).
//
// GEOMETRY is defined once, in 1/1000 em of the digit, origin = the centre of the digit's advance
// and of its line box (y down; the baseline is TOUCH_GLYPH_BASE below the centre whatever the
// line-height). The SVG is sized in CSS em, so the same drawing scales to every digit size
// (TOUCH_NUMERAL_SIZES); only the mark sizes change per size, through the legibility floors.
//
// Pure module (SCC-01): no DOM, no window, no state, no randomness.

import { TOUCH_GLYPHS_400, TOUCH_GLYPHS_700, TOUCH_GLYPH_BASE } from './touch-glyphs.js';

const GLYPHS = (weight) => (Number(weight) >= 600 ? TOUCH_GLYPHS_700 : TOUCH_GLYPHS_400);

/** Andika's baseline, below the centre of the digit's line box (em). */
export const TOUCH_DOT_BASELINE_EM = TOUCH_GLYPH_BASE / 1000;
/** Andika's digit top (cap of the figures), above the line-box centre (em). */
export const TOUCH_DOT_TOP_EM = -0.31;

/**
 * The digit sizes the app draws numerals at (the tokens; one geometry scales to all of them).
 *   paper S / M / L   ctx.metrics.digitPt (sheet/tokens.js)
 *   screen            css/screen-cell.css --mq-digit: phone card 40 px, card >= 600 px 48 px,
 *                     desktop >= 1200 px 56 px, online-worksheet grid cell 29 px
 */
export const TOUCH_NUMERAL_SIZES = Object.freeze([
    // Never below TOUCH_DOT_MIN (24 pt / 40 px): a paper S / M page draws its touch cells at L
    // (supports.js forceL; a fact takes the ladder, capped at 24 pt), and the 29 px online-worksheet
    // grid cell raises its digits to 40 px when it holds touch numerals (css/screen-cell.css).
    Object.freeze({ id: 'paper-fact-floor', v: 24, unit: 'pt' }),
    Object.freeze({ id: 'paper-L', v: 28, unit: 'pt' }),
    Object.freeze({ id: 'screen-phone', v: 40, unit: 'px' }),
    Object.freeze({ id: 'screen-card', v: 48, unit: 'px' }),
    Object.freeze({ id: 'screen-desktop', v: 56, unit: 'px' }),
]);

const P = (x, y, double = 0) => ({ x, y, double: !!double });
const emTable = (G) => Object.freeze(Object.fromEntries(Object.keys(G).map((d) => [d, G[d].dots.map(([x, y, dbl]) => P(x / 1000, y / 1000, dbl))])));

/**
 * The touch points of each digit, em, origin = the line-box centre (y down), IN COUNTING ORDER
 * (doubles first). Landmarks (snapped to the stroke centre by the generator):
 *   1  top of the stroke                 2  start of the curve; right end of the base
 *   3  start; middle join; end           4  top and foot of the left stroke; top of the right
 *                                           stroke; where it crosses the bar
 *   5  bar end; corner; foot of the down-stroke; right of the bowl; tail
 *   6  three doubles down the loop      7  three doubles down the bar end and diagonal; one single at the bar's left
 *   8  four doubles, top-left, top-right, bottom-left, bottom-right
 *   9  four doubles, top, right, stem, tail; one single on the left of the loop
 */
export const TOUCH_DOTS = emTable(TOUCH_GLYPHS_400);
/** Bold (700): the same landmarks on the heavier strokes. */
export const TOUCH_DOTS_BOLD = emTable(TOUCH_GLYPHS_700);

/** The dots of digit `d` at `weight` (400 / 700), in counting order. */
export function touchDots(d, weight = 400) {
    const t = Number(weight) >= 600 ? TOUCH_DOTS_BOLD : TOUCH_DOTS;
    return (t[Number(d)] || []).map((p) => ({ ...p }));
}

/** How many counts a digit's dots make (doubles count 2). Equals the digit for 0-9. */
export function touchDotCount(d) {
    return (TOUCH_DOTS[Number(d)] || []).reduce((n, p) => n + (p.double ? 2 : 1), 0);
}

/**
 * The counting order: one entry per TOUCH, in order, with the number said at that touch.
 * A double is two touches on one mark. 7 -> [m0:1, m0:2, m1:3, m1:4, m2:5, m2:6, m3:7].
 * @returns {{mark: number, say: number, second: boolean}[]}
 */
export function touchDotOrder(d) {
    const out = [];
    let say = 0;
    (TOUCH_DOTS[Number(d)] || []).forEach((p, mark) => {
        out.push({ mark, say: ++say, second: false });
        if (p.double) out.push({ mark, say: ++say, second: true });
    });
    return out;
}

/* ------------------------------------------------------------------ sizes */

/**
 * Mark geometry, in em of the digit (diameters / widths). Andika's stroke is 0.08-0.10 em
 * (Regular): a single dot is 0.18 em, wider than the stroke so it stands proud of it, and nothing
 * is cut out of the stroke. A double is a 0.10 em dot in a thin open ring (0.19 em across): the
 * stroke runs through it, so the digit stays whole and reads first. Every mark keeps >= 0.085 em, a stroke width,
 * from the next at every size >= TOUCH_DOT_MIN.
 */
export const TOUCH_DOT_SIZES = Object.freeze({
    // coordinator review 2026-10-03: the stroke stays WHOLE (no white keyline cuts it), the rings
    // are small enough that every mark keeps a clear gap from the next one.
    M: Object.freeze({ dot: 0.18, ring: 0.19, inner: 0.10, rw: 0.02 }),
});
export const TOUCH_DOT_DEFAULT = 'M';

/** Floors (paper mm, screen px): only reached below the touch-numeral minimum (TOUCH_DOT_MIN). */
export const TOUCH_DOT_FLOOR_MM = Object.freeze({ dot: 1.2, inner: 0.8, rw: 0.18 });
export const TOUCH_DOT_FLOOR_PX = Object.freeze({ dot: 6, inner: 4, rw: 0.8 });

/**
 * The minimum digit size at which touch dots are SET for a pupil to count (owner ruling
 * 2026-09-25): a paper item with touch dots whose digits would fall below it is laid out at size L
 * (supports.js forceL). The numeral itself draws at any size (the specimen shows them all).
 */
export const TOUCH_DOT_MIN = Object.freeze({ pt: 24, px: 40 });

const PT_MM = 25.4 / 72;

/** Can a digit of this size carry touch dots? `unit` is 'pt' (paper) or 'px' (screen). */
export function touchDotsFits(size, unit = 'pt') {
    const n = Number(size);
    if (!Number.isFinite(n)) return false;
    return unit === 'px' ? n >= TOUCH_DOT_MIN.px : n >= TOUCH_DOT_MIN.pt;
}

/**
 * The mark geometry at a digit size, in em, with the floors applied: radii dotR / innerR / ringR,
 * ring stroke rw, the gap between centre dot and ring.
 */
export function touchDotGeometry({ em = 28, unit = 'pt' } = {}) {
    const s = TOUCH_DOT_SIZES.M;
    const v = Number(em) || 28;
    const px = unit === 'px';
    const F = px ? TOUCH_DOT_FLOOR_PX : TOUCH_DOT_FLOOR_MM;
    const per = px ? 1 / v : 1 / (unit === 'mm' ? v : v * PT_MM);
    const fl = (k, e) => Math.max(e, F[k] * per);
    const innerR = fl('inner', s.inner) / 2, rw = fl('rw', s.rw);
    const ringR = Math.max(s.ring / 2, innerR + rw * 1.25 + rw);
    return { dotR: fl('dot', s.dot) / 2, innerR, rw, ringR, gap: ringR - rw - innerR };
}

/* ------------------------------------------------------------------ drawing */

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const GREY = '#949494'; // INK-1: the sheet's one grey

/**
 * The marks of one digit as SVG elements in 1/1000 em, origin = the line-box centre (y down).
 *
 * @param {number|string} d
 * @param {object} o
 * @param {number} [o.em=28]         the digit size, in `unit` (drives the floors)
 * @param {'pt'|'px'|'mm'} [o.unit]  'pt' paper (default), 'px' screen, 'mm'
 * @param {number} [o.weight=400]    400 / 700: which glyph table
 * @param {'solid'|'trace'} [o.ink]  solid black, or trace: the marks in the one grey (a faded
 *                                   hint; the numeral stays black). With `photocopy` a trace
 *                                   mark is a dashed outline instead of grey.
 * @param {boolean} [o.photocopy]
 * @param {number[]} [o.counted]     screen: per-mark touches already made (0, 1 or 2); a touched
 *                                   part turns the one grey
 * @param {boolean} [o.tappable]     screen: tag each mark with data-td-mark
 */
export function touchDotsMarks(d, o = {}) {
    const dots = touchDots(d, o.weight);
    if (!dots.length) return '';
    const g = touchDotGeometry(o);
    const K = (v) => f1(v * 1000);
    const trace = o.ink === 'trace';
    const pc = !!o.photocopy;
    const INK = trace && !pc ? GREY : '#000';
    const counted = Array.isArray(o.counted) ? o.counted : [];
    const dash = `stroke-dasharray="${K(g.rw * 1.2)} ${K(g.rw)}"`;
    return dots.map((p, i) => {
        const c = `cx="${K(p.x)}" cy="${K(p.y)}"`;
        const n = counted[i] || 0;
        const tag = o.tappable ? ` data-td-mark="${i}"` : '';
        const ink = (k) => (k ? GREY : INK);
        const parts = [];
        // Nothing is ever cut out of the stroke: a dot is a solid disc ON the stroke, a double is
        // that disc with a thin ring round it (the stroke runs through the ring).
        if (p.double) {
            if (trace && pc) parts.push(`<circle ${c} r="${K(g.ringR - g.rw / 2)}" fill="none" stroke="#000" stroke-width="${K(g.rw)}" ${dash}/>`);
            else parts.push(`<circle ${c} r="${K(g.ringR - g.rw / 2)}" fill="none" stroke="${ink(n >= 2)}" stroke-width="${K(g.rw)}"/>`);
        }
        const r = p.double ? g.innerR : g.dotR;
        if (trace && pc) parts.push(`<circle ${c} r="${K(r - g.rw / 2)}" fill="#fff" stroke="#000" stroke-width="${K(g.rw)}" ${dash}/>`);
        else parts.push(`<circle ${c} r="${K(r)}" fill="${ink(n >= 1)}"/>`);
        return `<g class="ws-td-mark${p.double ? ' dbl' : ''}"${tag}>${parts.join('')}</g>`;
    }).join('');
}

/**
 * The touch numeral as one SVG: the Andika glyph path in solid ink, then its marks. It is
 * absolutely positioned on the CENTRE of its host span (which holds the transparent real digit),
 * 1 advance wide and 1.3 em tall, in CSS em, so it lands exactly on the plain digit at any size
 * and takes no space of its own.
 */
export function touchNumeralSVG(d, o = {}) {
    const n = Number(d);
    if (!/^[0-9]$/.test(String(d))) return '';
    const G = GLYPHS(o.weight)[n];
    const w = G.adv, h = 1300;
    const label = o.label === false ? '' : ` role="img" aria-label="${n}, ${touchDotCount(n)} touch dots"`;
    const pe = o.tappable ? 'auto' : 'none';
    const glyphInk = o.glyphInk || '#000';
    return `<svg class="ws-td-svg ws-tn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${f1(-w / 2)} ${-h / 2} ${f1(w)} ${h}"${label} aria-hidden="${o.label === false ? 'true' : 'false'}" data-digit="${n}" `
        + `style="position:absolute;left:50%;top:50%;width:${(w / 1000).toFixed(4)}em;height:${h / 1000}em;margin:${-h / 2000}em 0 0 ${(-w / 2000).toFixed(4)}em;overflow:visible;pointer-events:${pe};display:block">`
        + `${o.glyph ? `<path d="${G.d}" fill="${glyphInk}"/>` : ''}${touchDotsMarks(n, o)}</svg>`;
}

/** Kept for callers of the old API: the full touch numeral (never a marks-only overlay now). */
export const touchDotsSVG = touchNumeralSVG;

/**
 * One digit as a touch numeral: the host span holds the real digit as transparent text (the
 * plain digit's exact width and baseline, its text for readers and copy) and the numeral SVG on
 * top of it. A non-digit comes back unchanged.
 */
export function touchNumeralHTML(ch, o = {}) {
    const s = String(ch);
    if (!/^[0-9]$/.test(s)) return s;
    return `<span class="ws-td ws-tn" data-ws-touch="1" data-digit="${s}" style="position:relative;display:inline-block">${s}${touchNumeralSVG(s, { ...o, label: false })}</span>`;
}

/** Kept for callers of the old API. */
export const touchDotsDigitHTML = (ch, o = {}) => touchNumeralHTML(ch, o);

/**
 * Screen taps: which mark a tap at (x, y) (em, centre-relative) should count next. The WHOLE
 * numeral is the touch target, so a tap never misses: it counts the nearest mark that still has
 * a touch left. Returns the mark index, or -1 when every dot is counted.
 */
export function touchDotNearest(d, x, y, counted = [], weight = 400) {
    const dots = touchDots(d, weight);
    let best = -1, bd = Infinity;
    dots.forEach((p, i) => {
        const left = (p.double ? 2 : 1) - (counted[i] || 0);
        if (left <= 0) return;
        const dd = Math.hypot(p.x - x, p.y - y);
        if (dd < bd) { bd = dd; best = i; }
    });
    return best;
}

/**
 * ÷ facts: the tally-dot row (owner ruling 2026-09-25). The pupil touches one dot for each count
 * by the divisor and then counts the dots touched. The row always has the SAME length for a sheet
 * (default 10, 12 for a ×12 set), so its length never tells the quotient. Lines of five, sized in
 * CSS em of the host (the digit size).
 */
export function touchTallySVG(n = 10, o = {}) {
    const g = touchDotGeometry(o);
    const f3 = (v) => Number(v).toFixed(3);
    const count = Math.max(1, Math.min(20, Math.round(Number(n) || 10)));
    const pitch = Math.max(0.36, g.dotR * 2 + 0.16);
    const pad = g.dotR + g.rw * 2;
    const counted = Array.isArray(o.counted) ? o.counted : [];
    const traceOutline = o.ink === 'trace' && o.photocopy;
    const ink = o.ink === 'trace' && !o.photocopy ? GREY : '#000';
    const rows = Math.ceil(count / 5);
    let body = '';
    for (let i = 0; i < count; i++) {
        const x = pad + (i % 5) * pitch, y = pad + Math.floor(i / 5) * pitch;
        const tag = o.tappable ? ` data-td-mark="${i}"` : '';
        body += `<g class="ws-td-mark"${tag}>`
            + (traceOutline
                ? `<circle cx="${f3(x)}" cy="${f3(y)}" r="${f3(g.dotR - g.rw * 0.3)}" fill="#fff" stroke="#000" stroke-width="${f3(g.rw * 0.6)}" stroke-dasharray="${f3(g.rw * 1.2)} ${f3(g.rw)}"/>`
                : `<circle cx="${f3(x)}" cy="${f3(y)}" r="${f3(g.dotR)}" fill="${counted[i] ? GREY : ink}"/>`)
            + '</g>';
    }
    const w = 2 * pad + (Math.min(count, 5) - 1) * pitch, h = 2 * pad + (rows - 1) * pitch;
    return `<svg class="ws-td-tally" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f3(w)} ${f3(h)}" role="img" aria-label="${count} counting dots in fives" `
        + `style="display:block;margin:0 auto;width:${f3(w)}em;height:${f3(h)}em;overflow:visible">${body}</svg>`;
}
