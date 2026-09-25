// js/modules/sheet/touchdots.js
// Touch dots (S1): counting dots drawn ON the strokes of a printed numeral, so a pupil can touch
// and count them. 1-5 carry single dots; 6-9 carry double dots (a solid dot inside an open ring,
// touched and counted twice, doubles first); 0 carries none. The UI word is "Touch dots" (or
// "Count dots", a teacher setting). This is MathQuest's own drawing, fitted to the owner's glyphs.
//
// The positions are fitted to the DEFAULT Andika 6.200 digits with only cv04 (the open 4) set
// (TY-4: cv01 and cv06 are rejected, so the flagged 1 and the default 6 / 9 stand). They are
// measured in the browser by tests/scripts/ws-touchdots-fit.cjs and held to the strokes by the
// gate tests/scripts/ws-touchdots.cjs (see design/SUPPORTS.md §S1).
//
// COORDINATES. em units, relative to the CENTRE of the digit's line box, y down. The kit's digit
// span (css/sheet-kit.css `.ws-fact > span`, `.ws-stack > span`) is a flex box that centres a
// line-height-1 line box, so the line-box centre is the span's centre whatever the span's height
// (1.15 em) or track width (0.72 / 0.95 em). The overlay is therefore anchored at the host's centre
// and never depends on the track. The baseline sits TOUCH_DOT_BASELINE_EM below that centre.
//
// Pure module (SCC-01): no DOM, no window, no state, no randomness.

/** Andika's baseline, below the centre of a line-height-1 line box (both weights, measured). */
export const TOUCH_DOT_BASELINE_EM = 0.41;
/** Andika's digit top (cap of the figures), above the line-box centre (measured). */
export const TOUCH_DOT_TOP_EM = -0.31;

const P = (x, y, double = 0) => ({ x, y, double: !!double });

/**
 * Regular (400). Each list is in COUNTING ORDER: doubles first, then singles, in the order the
 * pupil touches them. The landmarks (owner table, S1):
 *   1  top of the stroke
 *   2  start of the curve (top left); right end of the base
 *   3  start (top left); middle join; end (bottom left)
 *   4  (open 4) top of the left stroke; foot of the left stroke at the bar; top of the right
 *      stroke; where the right stroke crosses the bar
 *   5  right end of the top bar; top-left corner; foot of the short down-stroke; right-most
 *      point of the bowl; tail end
 *   6  three doubles down the left: top, middle, bottom of the loop
 *   7  three doubles: bar right end, middle of the diagonal, foot of the diagonal; then one
 *      single at the bar's left end
 *   8  four doubles in a Z: top-loop left, top-loop right, bottom-loop left, bottom-loop right
 *   9  four doubles: top of the loop, right of the loop, middle of the stem, bottom tip; then one
 *      single on the left of the loop
 */
export const TOUCH_DOTS = Object.freeze({
    0: [],
    1: [P(0.013, -0.235)],
    2: [P(-0.190, -0.195), P(0.180, 0.372)],
    3: [P(-0.175, -0.203), P(-0.030, 0.030), P(-0.215, 0.285)],
    4: [P(-0.123, -0.250), P(-0.188, 0.165), P(0.112, -0.110), P(0.113, 0.163)],
    5: [P(0.130, -0.258), P(-0.152, -0.255), P(-0.170, 0.030), P(0.172, 0.200), P(-0.193, 0.335)],
    6: [P(-0.060, -0.240, 1), P(-0.190, 0.060, 1), P(-0.005, 0.380, 1)],
    7: [P(0.170, -0.258, 1), P(0.030, 0.037, 1), P(-0.100, 0.350, 1), P(-0.210, -0.253)],
    8: [P(-0.165, -0.168, 1), P(0.163, -0.165, 1), P(-0.198, 0.200, 1), P(0.193, 0.193, 1)],
    9: [P(-0.020, -0.268, 1), P(0.195, -0.040, 1), P(0.152, 0.260, 1), P(-0.163, 0.340, 1), P(-0.185, -0.030)],
});

/** Bold (700): the same landmarks on the heavier strokes (fitted separately). */
export const TOUCH_DOTS_BOLD = Object.freeze({
    0: [],
    1: [P(0.010, -0.228)],
    2: [P(-0.193, -0.170), P(0.180, 0.352)],
    3: [P(-0.175, -0.205), P(-0.030, 0.040), P(-0.212, 0.282)],
    4: [P(-0.126, -0.250), P(-0.193, 0.165), P(0.125, -0.100), P(0.125, 0.180)],
    5: [P(0.135, -0.240), P(-0.140, -0.240), P(-0.170, 0.040), P(0.163, 0.200), P(-0.190, 0.330)],
    6: [P(-0.052, -0.230, 1), P(-0.185, 0.060, 1), P(0.000, 0.365, 1)],
    7: [P(0.172, -0.240, 1), P(0.028, 0.037, 1), P(-0.120, 0.370, 1), P(-0.198, -0.237)],
    8: [P(-0.155, -0.160, 1), P(0.150, -0.163, 1), P(-0.190, 0.200, 1), P(0.188, 0.200, 1)],
    9: [P(-0.030, -0.250, 1), P(0.180, -0.040, 1), P(0.140, 0.260, 1), P(-0.160, 0.347, 1), P(-0.195, -0.030)],
});

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
 * Mark geometry, in em of the digit (diameters). The research found SF-30's 0.09 em is the
 * Andika stroke width itself (measured 0.085-0.095 em Regular, 0.115-0.135 em Bold), so a dot that
 * size vanishes into the stroke. Three candidates are shown side by side in the specimen:
 *   dot    single dot diameter
 *   ring   outer diameter of a double's ring
 *   inner  a double's solid centre dot
 *   rw     ring stroke width
 *   halo   white keyline round a single dot (0 = none); a double's ring needs none
 * A double's ring gap (between centre dot and ring) = ring/2 - rw - inner/2.
 */
export const TOUCH_DOT_SIZES = Object.freeze({
    S: Object.freeze({ dot: 0.15, ring: 0.21, inner: 0.09, rw: 0.028, halo: 0.018 }),
    M: Object.freeze({ dot: 0.17, ring: 0.23, inner: 0.10, rw: 0.03, halo: 0.018 }),
    L: Object.freeze({ dot: 0.19, ring: 0.25, inner: 0.11, rw: 0.032, halo: 0.018 }),
});
/** The chosen size (set from the specimen evidence; design/SUPPORTS.md §S1). */
export const TOUCH_DOT_DEFAULT = 'M';

/** Physical floors (mm) that keep a mark legible after a photocopy, whatever the em. */
export const TOUCH_DOT_FLOOR_MM = Object.freeze({ gap: 0.3, rw: 0.25, halo: 0.15 });

/** The minimum digit size that may carry touch dots. Below it the caller uses the dot tile. */
export const TOUCH_DOT_MIN = Object.freeze({ pt: 24, px: 40 });

const PT_MM = 25.4 / 72;
const PX_MM = 25.4 / 96;

/**
 * Can a digit of this size carry touch dots? `unit` is 'pt' (paper) or 'px' (screen).
 * Below 24 pt / 40 px the dots would be too small to touch and count: use the dot tile instead.
 */
export function touchDotsFits(size, unit = 'pt') {
    const n = Number(size);
    if (!Number.isFinite(n)) return false;
    return unit === 'px' ? n >= TOUCH_DOT_MIN.px : n >= TOUCH_DOT_MIN.pt;
}

/** The em of a digit in mm, from a size in pt, px or mm. */
const emToMm = (em, unit) => (unit === 'px' ? em * PX_MM : unit === 'mm' ? em : em * PT_MM);

/**
 * The mark geometry at a given digit size, in em, with the photocopy floors applied (the ring
 * grows outward to keep its gap and stroke; the centre dot never shrinks).
 */
export function touchDotGeometry({ em = 28, unit = 'pt', size = TOUCH_DOT_DEFAULT, halo = true, photocopy = false } = {}) {
    const s = TOUCH_DOT_SIZES[size] || TOUCH_DOT_SIZES[TOUCH_DOT_DEFAULT];
    const mm = emToMm(Number(em) || 28, unit);
    const f = (m) => m / mm; // mm -> em at this size
    const floorGap = f(TOUCH_DOT_FLOOR_MM.gap) * (photocopy ? 1.25 : 1);
    const rw = Math.max(s.rw, f(TOUCH_DOT_FLOOR_MM.rw));
    const gap = Math.max(s.ring / 2 - s.rw - s.inner / 2, floorGap);
    const ringR = s.inner / 2 + gap + rw; // outer radius
    return {
        dotR: s.dot / 2, innerR: s.inner / 2, ringR, rw, gap,
        halo: halo ? Math.max(s.halo, f(TOUCH_DOT_FLOOR_MM.halo)) : 0,
    };
}

/* ------------------------------------------------------------------ drawing */

const f3 = (v) => Number(v).toFixed(3);
const GREY = '#949494'; // INK-1: the sheet's one grey

/**
 * The marks of one digit as SVG elements in EM coordinates (origin = line-box centre, y down),
 * for a caller that already has an SVG (a clock face, a coin) and a transform to em.
 *
 * @param {number|string} d
 * @param {object} o
 * @param {number} [o.em=28]         the digit size, in `unit` (drives the photocopy floors)
 * @param {'pt'|'px'|'mm'} [o.unit]  'pt' paper (default), 'px' screen, 'mm'
 * @param {number} [o.weight=400]    400 / 700: which fitted table
 * @param {'solid'|'trace'} [o.ink]  solid black, or trace (grey; dotted outline when photocopy)
 * @param {boolean} [o.photocopy]    photocopy-safe: no grey fills, wider ring gaps
 * @param {'S'|'M'|'L'} [o.size]     mark size (TOUCH_DOT_SIZES)
 * @param {boolean} [o.halo=true]    white keyline round every solid dot
 * @param {'knockout'|'open'} [o.ring='knockout']  a double's ring filled white, or open over the stroke
 * @param {number[]} [o.counted]     screen: per-mark touches already made (0, 1 or 2); a touched
 *                                   part is drawn in the one grey
 * @param {boolean} [o.tappable]     screen: tag each mark with data-td-mark for a tap handler
 */
export function touchDotsMarks(d, o = {}) {
    const dots = touchDots(d, o.weight);
    if (!dots.length) return '';
    const g = touchDotGeometry(o);
    const trace = o.ink === 'trace';
    const pc = !!o.photocopy;
    const INK = trace && !pc ? GREY : '#000';
    const counted = Array.isArray(o.counted) ? o.counted : [];
    const out = [];
    dots.forEach((p, i) => {
        const cx = f3(p.x), cy = f3(p.y);
        const n = counted[i] || 0;
        const tag = o.tappable ? ` data-td-mark="${i}"` : '';
        const parts = [];
        if (p.double) {
            // A ring round a solid centre dot. By default ('knockout') the ring is a white disc
            // with an ink edge: it knocks the glyph stroke out of the gap, so the gap and the centre
            // dot read cleanly and survive a photocopy (specimen §2). 'open' draws the ring over the
            // stroke instead (the stroke runs through the gap; the centre dot takes a keyline):
            // the numeral stays more whole, but after a copy a double looks like a single blob.
            // Screen: a touched part turns the one grey (a touch still to make stays black). The
            // first touch greys the centre dot, the second greys the ring; nothing grows.
            const ringInk = n >= 2 ? GREY : INK, dotInk = n >= 1 ? GREY : INK;
            if (trace && pc) {
                parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.ringR - g.rw / 2)}" fill="#fff" stroke="#000" stroke-width="${f3(g.rw * 0.6)}" stroke-dasharray="${f3(g.rw * 1.2)} ${f3(g.rw)}"/>`);
                parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.innerR - g.rw * 0.3)}" fill="#fff" stroke="#000" stroke-width="${f3(g.rw * 0.6)}"/>`);
            } else {
                const knock = o.ring !== 'open';
                parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.ringR - g.rw / 2)}" fill="${knock ? '#fff' : 'none'}" stroke="${ringInk}" stroke-width="${f3(g.rw)}"/>`);
                if (!knock && g.halo) parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.innerR + g.halo)}" fill="#fff"/>`);
                parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.innerR)}" fill="${dotInk}"/>`);
            }
        } else {
            if (g.halo) parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.dotR + g.halo)}" fill="#fff"/>`);
            if (trace && pc) parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.dotR - g.rw * 0.3)}" fill="#fff" stroke="#000" stroke-width="${f3(g.rw * 0.6)}" stroke-dasharray="${f3(g.rw * 1.2)} ${f3(g.rw)}"/>`);
            else parts.push(`<circle cx="${cx}" cy="${cy}" r="${f3(g.dotR)}" fill="${n >= 1 ? GREY : INK}"/>`);
        }
        out.push(`<g class="ws-td-mark${p.double ? ' dbl' : ''}"${tag}>${parts.join('')}</g>`);
    });
    return out.join('');
}

/**
 * The overlay for one digit span: an absolutely positioned SVG, 1 em x 1.15 em, centred on the
 * host span, with overflow visible and no pointer events (unless tappable). It takes no space,
 * so laying it over a digit never moves anything. The HOST must be `position: relative`
 * (the `.ws-td` class in css/sheet-kit.css) and its font-size must be the digit size (as in
 * every kit digit span): the SVG is sized in CSS em so it follows the digit exactly.
 *
 * Use: `<span class="ws-td">7${touchDotsSVG(7, {em: 28})}</span>` in place of `<span>7</span>`.
 */
export function touchDotsSVG(d, o = {}) {
    const body = touchDotsMarks(d, o);
    if (!body) return '';
    const label = o.label === false ? '' : ` role="img" aria-label="${touchDotCount(d)} touch dots"`;
    const pe = o.tappable ? 'auto' : 'none';
    return `<svg class="ws-td-svg" xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.575 1 1.15" preserveAspectRatio="xMidYMid meet"${label} data-digit="${Number(d)}" `
        + `style="position:absolute;left:50%;top:50%;width:1em;height:1.15em;margin:-0.575em 0 0 -0.5em;overflow:visible;pointer-events:${pe}">${body}</svg>`;
}

/** A digit span's inner HTML with its overlay: the digit text, then the SVG. */
export const touchDotsDigitHTML = (ch, o = {}) => `${ch}${/^[0-9]$/.test(String(ch)) ? touchDotsSVG(ch, o) : ''}`;

/**
 * Screen taps: which mark a tap at (x, y) (em, centre-relative) should count next. The WHOLE
 * numeral is the touch target (≥ 44 px, see SUPPORTS.md §S1), so a tap never misses: it counts
 * the nearest mark that still has a touch left. `counted[i]` is 0, 1 or 2 touches made on mark i.
 * Returns the mark index, or -1 when every dot is counted.
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
 * by the divisor ("3, 6, 9, 12, 15") and then counts the dots touched. The row always has the SAME
 * length for a sheet (default 10, 12 for a ×12 set), so its length never tells the quotient.
 * Dots are the single touch dot's size, in lines of five, sized in CSS em of the host (the digit
 * size), so the row sits under a fact at the fact's own scale.
 */
export function touchTallySVG(n = 10, o = {}) {
    const g = touchDotGeometry(o);
    const count = Math.max(1, Math.min(20, Math.round(Number(n) || 10)));
    const pitch = Math.max(0.36, g.dotR * 2 + 0.16);
    const pad = g.dotR + g.rw * 2;
    const counted = Array.isArray(o.counted) ? o.counted : [];
    const traceOutline = o.ink === 'trace' && o.photocopy;
    const ink = o.ink === 'trace' && !o.photocopy ? GREY : '#000';
    // Groups of five, one group per line (a ten is two lines of five), read left to right and
    // top to bottom, so the row fits a fact cell's width at 28 pt.
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
