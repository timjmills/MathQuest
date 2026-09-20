// js/modules/sheet/roles/todays-number.js
// TODAY'S NUMBER - the owner's own daily sheet.
//
// One number, explored many ways, on a layout that never changes from day to day. It is the
// routine that opens a lesson: the pupil spends no working memory on "what is this page", only
// on the number.
//
// Rules this file implements
//   design/PAGE_TYPES.md 5.3          PT-TDN-1..5, and PT-FRM-6/9, PT-LOOK-1, PT-COL-6
//   PEDAGOGY_STANDARD.md 7.4          P-RV-15..18 (task list, versions, oral first, blocks <= 4 digits)
//   WORKSHEET_DESIGN_STANDARD.md      INK-1/3 (three paints), INK-10 (five strokes), LS (line style),
//                                     RP-10/11 (ten frame), RP-22 (tally), RP-30/31/32 (base-10),
//                                     RP-40/41 (place-value chart), RP-50..54 (line, hops, track),
//                                     BD-10 (one instruction, never a paragraph), CL-30 (black tabs)
//
// WHERE THE TWO STANDARDS DISAGREE, and what this file does about it
//   - PAGE_TYPES 5.3 and PEDAGOGY 7.4 give slightly different task lists per range. PAGE_TYPES owns
//     the page anatomy (six equal bands on side 1), PEDAGOGY owns the teaching order. The band sets
//     below take PEDAGOGY's tasks in PEDAGOGY's order and cut them to PAGE_TYPES' six bands; the
//     tasks that do not fit open side 2 (P-RV-15: at most 11 tabs over the two sides).
//   - PAGE_TYPES 5.3 asks for a "number bond two ways" on the to-20 sheet. A vertical part-whole
//     (RP-60) needs whole box + link + part boxes = 14 + 4 + 14 = 32 mm at its SMALLEST legal box
//     side, and a band's work area is 29-30 mm. It does not fit. The bond is therefore drawn in its
//     horizontal SPLIT form (`N = a + __`), twice, which keeps the 14 mm writing boxes and the
//     "two ways" teaching point. Reported, not silently changed.
//
// THE NUMBER HAS NO ZERO DIGIT. PT-TDN-2 says the layout never changes from day to day inside a
// version. Expanded form prints one term per NON-ZERO place, so a day whose number held a zero
// would print a different number of slots and move every band under it. A zero in a place is its
// own teaching step (one new thing per step); until that step exists the daily number avoids it.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import. Everything random
// comes from `../rng.js` under a seed derived from (range, version, day, class seed), so the same
// day reprints the same sheet and two classes can be given different ones.

import { blank, esc, instructionFor, lintInstruction, instructionKeyOf } from '../index.js';
import { rng, int, pick, shuffle, deriveSeed } from '../rng.js';
import { renderAnswerKey, renderSource, keyCoverage } from './answer-key.js';

/* ============================================================================ measurements */

const PT_MM = 25.4 / 72;
const HEAVY = +(1.5 * PT_MM).toFixed(3);    // 1.5 pt  - frames, ten-frame border, axis, track box
const HAIR = +(0.75 * PT_MM).toFixed(3);    // 0.75 pt - anything bounding a writing place
const FINE = +(0.5 * PT_MM).toFixed(3);     // 0.5 pt  - inside a visual only
const INK = '#000';
const GREY = '#949494';                     // INK-3: the only grey

/* ================================================================================ ranges */

/**
 * A range is a band of the number line with its own task list. `window` is the sliding window
 * the teacher may move (PT-TDN-4); the defaults are chosen so that EVERY value the sheet prints
 * or expects stays inside the range's declared maximum - a sheet called "to 120" never asks for
 * 121. `auditValues()` below is the check that this actually holds.
 */
export const RANGES = Object.freeze({
    to20: Object.freeze({
        id: 'to20', label: 'to 20', max: 20, level: 'K', ccss: 'K.CC.4, K.NBT.1',
        size: 'L', window: [3, 19], digits: 2, blocks: false,
        bands: ['number', 'tenframe', 'track', 'compare', 'split', 'make'],
        side2: { chart: 'strip', chartHMm: 46, followups: ['tally', 'line-mark', 'odd-even'] },
    }),
    to120: Object.freeze({
        id: 'to120', label: 'to 120', max: 120, level: '1', ccss: '1.NBT.1, 1.NBT.2',
        size: 'M', window: [11, 99], digits: 2, blocks: true,
        bands: ['number', 'pv-chart', 'expanded', 'hops', 'compare', 'nearest'],
        side2: { chart: 'chart120', chartHMm: 176, followups: ['odd-even', 'split'] },
    }),
    to1000: Object.freeze({
        id: 'to1000', label: 'to 1,000', max: 1000, level: '2', ccss: '2.NBT.1, 2.NBT.3',
        size: 'M', window: [101, 899], digits: 3, blocks: true,
        bands: ['number', 'pv-chart', 'expanded', 'hops', 'compare', 'round-table'],
        side2: { chart: 'open-line', chartHMm: 58, followups: ['word-bank', 'order3', 'odd-even'] },
    }),
    to10000: Object.freeze({
        id: 'to10000', label: 'to 10,000', max: 10000, level: '4', ccss: '4.NBT.1, 4.NBT.2',
        size: 'M', window: [1001, 8999], digits: 4, blocks: false,   // P-RV-18: no blocks above 4 digits
        bands: ['number', 'pv-chart', 'expanded', 'hops', 'compare', 'round-table'],
        side2: { chart: 'open-line', chartHMm: 58, followups: ['digit-value', 'order3', 'word-bank'] },
    }),
});
export const RANGE_IDS = Object.freeze(['to20', 'to120', 'to1000', 'to10000']);
export const VERSIONS = Object.freeze(['A', 'B', 'C', 'D']);

/** The hop set a range uses (PT-TDN table). to-20 uses the `track` band instead. */
const HOPS = Object.freeze({
    to20: [-1, 1],
    to120: [-10, -1, 1, 10],
    to1000: [-100, -10, -1, 1, 10, 100],
    to10000: [-1000, -100, -10, -1, 1, 10, 100, 1000],
});

/** Places a range rounds to (PT-TDN table; to-20 does not round). */
const ROUND_PLACES = Object.freeze({
    to20: [], to120: [10, 100], to1000: [10, 100], to10000: [10, 100, 1000],
});

/** How far a compare partner may sit from the number, per range. */
const COMPARE_SPREAD = Object.freeze({ to20: 5, to120: 14, to1000: 80, to10000: 900 });

/* ================================================================== number words and forms */

const ONES_WORDS = Object.freeze(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen']);
const TENS_WORDS = Object.freeze(['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty',
    'seventy', 'eighty', 'ninety']);

/** US word form, no "and" (PT-DOC-6). Whole numbers below one million. */
export function numberWords(n) {
    const v = Math.floor(Math.abs(n));
    if (v < 20) return ONES_WORDS[v];
    if (v < 100) {
        const t = TENS_WORDS[Math.floor(v / 10)];
        const o = v % 10;
        return o ? `${t}-${ONES_WORDS[o]}` : t;
    }
    if (v < 1000) {
        const h = `${ONES_WORDS[Math.floor(v / 100)]} hundred`;
        const rest = v % 100;
        return rest ? `${h} ${numberWords(rest)}` : h;
    }
    if (v < 1000000) {
        const th = `${numberWords(Math.floor(v / 1000))} thousand`;
        const rest = v % 1000;
        return rest ? `${th} ${numberWords(rest)}` : th;
    }
    return String(v);
}

/** PT-DOC-6: the comma thousands separator. */
export const comma = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** The non-zero place values of n, largest first: 4372 -> [4000, 300, 70, 2]. */
export const placeValues = (n) => String(Math.floor(Math.abs(n))).split('')
    .map((d, i, all) => Number(d) * Math.pow(10, all.length - 1 - i))
    .filter((v) => v !== 0);

/** Round half up, which is the US convention and what a pupil is taught. */
export const roundTo = (n, place) => Math.floor(n / place + 0.5) * place;

const PLACE_WORD = Object.freeze({ 1: 'one', 10: 'ten', 100: 'hundred', 1000: 'thousand' });
const PLACE_HEAD = Object.freeze({ 1: 'Ones', 10: 'Tens', 100: 'Hundreds', 1000: 'Thousands' });
// VA-30 / RP-40: the letter forms, which are distinct - "Th" for thousands, never a second "T".
const PLACE_LETTER = Object.freeze({ 1: 'O', 10: 'T', 100: 'H', 1000: 'Th' });

/* ================================================================== picking the day's number */

const hasZeroDigit = (n) => String(n).includes('0');

/**
 * The window the sheet may actually draw from. PT-TDN-4 lets the teacher slide it, and a slid
 * window still has to keep the promise the whole file rests on: a sheet called "to 120" never
 * asks for 121. The hop band reaches furthest from the number, so the window is pulled in by
 * the largest hop at each end.
 *
 * Every default window already satisfies this, so nothing moves unless a window is slid past
 * the edge. Slid to 111-119 it used to print `+10` answers of 124 and 128 on a to-120 sheet,
 * and a count-by strip that ended 120, 120.
 */
function safeWindow(spec, win) {
    const hops = HOPS[spec.id] || [-1, 1];
    const reachUp = Math.max(0, ...hops);
    const reachDown = Math.min(0, ...hops);
    const [lo, hi] = Array.isArray(win) && win.length === 2 ? win : spec.window;
    return [Math.max(1 - reachDown, Math.ceil(lo)), Math.min(spec.max - reachUp, Math.floor(hi))];
}

/**
 * The day's number. Seeded from (range, version, day, class seed) - PT-TDN-4 - so the same day
 * reprints identically and two classes can be handed different sheets from the same day.
 */
export function pickNumber({ range = 'to120', version = 'B', day = '', seed = 0, window: win } = {}) {
    const spec = RANGES[range] || RANGES.to120;
    const fill = (lo, hi) => {
        const out = [];
        for (let v = Math.max(1, Math.ceil(lo)); v <= Math.min(spec.max, Math.floor(hi)); v++) {
            if (!hasZeroDigit(v)) out.push(v);
        }
        return out;
    };
    let pool = fill(...safeWindow(spec, win));
    // A window slid right to the edge can hold no usable number once the hops are allowed for
    // (111-119 on a to-120 sheet). Falling back to its own first value would hand the hop band
    // an answer of 121, so the fallback is the RANGE'S OWN default window instead.
    if (!pool.length) pool = fill(...safeWindow(spec, spec.window));
    const r = rng(deriveSeed('todays-number', range, version, String(day), String(seed)));
    const n = pool.length ? pick(r, pool) : Math.max(1, Math.min(spec.max, spec.window[0]));
    return { n, r, pool: pool.length };
}

/* ========================================================================= drawing helpers */

const svgBox = (w, h, inner, extra = '') =>
    `<svg class="ws-svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" `
    + `style="font-family:Andika,sans-serif;flex:none${extra ? ';' + extra : ''}" role="presentation">${inner}</svg>`;

const sText = (x, y, str, { pt = 10, w = 400, anchor = 'middle', fill = INK } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${(pt * PT_MM).toFixed(2)}" `
    + `font-weight="${w}" fill="${fill}">${esc(str)}</text>`;

const sRect = (x, y, w, h, sw = HAIR, { rx = 0, fill = 'none', stroke = INK, dash = '' } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" `
    + `stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const sLine = (x1, y1, x2, y2, sw = HAIR, { stroke = INK, dash = '' } = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"`
    + `${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const sCircle = (cx, cy, r, { fill = 'none', stroke = INK, sw = HAIR, dash = '' } = {}) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`
    + `${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

/* --------------------------------------------------------------------------- HTML helpers */

const row = (html, extra = '') =>
    `<div style="display:flex;align-items:center;gap:3mm;${extra}">${html}</div>`;

const col = (html, extra = '') =>
    `<div style="display:flex;flex-direction:column;gap:1.5mm;${extra}">${html}</div>`;

/** A number set at working digit size. */
const big = (v) => `<span style="font-size:var(--ws-digit);font-weight:700;line-height:1">${esc(String(v))}</span>`;

/** A caption: a hint scaffold, so it is present only while captions are on (versions A and B). */
const caption = (t) => `<span style="font-size:var(--ws-zone);line-height:1.1">${esc(t)}</span>`;

/** A rule reminder the cell may carry (never a restatement of the instruction). */
const oral = (t) => `<span style="font-size:var(--ws-zone);line-height:1.25">${esc(t)}</span>`;

/* ------------------------------------------------------------------------------- the slots */

/**
 * A writing place. `blank()` is the ONE helper that draws one, so print and screen agree and the
 * facsimile key can fill it (`answer-key.js` reads `data-ws-slot`).
 */
const put = (ctx, key, spec) => blank(spec, ctx, key);

/**
 * A slot whose value is PRINTED IN TRACE GREY in both states: the version-A model. It is not a
 * pupil answer, so its key entry carries `graded: false` and the key prints exactly what the
 * pupil page prints.
 */
const traced = (ctx, spec, value) =>
    blank(spec, Object.assign({}, ctx, { state: 'traced' }),
        { slots: { [spec.id]: { value: String(value) } } });

/* ============================================================== the band renderers (tasks) */
//
// Every renderer takes (m, ctx) where `m` is the band's own model - plain data built once from
// the seed - and returns the WORK AREA html. The instruction line and the band frame are added
// by `bandShell`. A renderer draws the same thing in `blank` and `answered`; the only difference
// is that `put()` carries a value in `answered`, and where the ANSWER IS A DRAWING (counters,
// tally marks, a marked point) the renderer draws it when `ctx.state === 'answered'`, so the key
// shows what the pupil should have drawn instead of an empty frame.

const isAnswered = (ctx) => ctx.state === 'answered' || ctx.state === 'wrong';

/* ------------------------------------------------------------------ 1. the number (fixed) */

function renderNumber(m, ctx) {
    const boxed = `<span style="display:inline-flex;align-items:center;justify-content:center;`
        + `border:${HEAVY}mm solid ${INK};border-radius:3mm;padding:1mm 5mm;min-width:26mm;`
        + `font-size:var(--ws-digit);font-weight:700;line-height:1.1">${esc(comma(m.n))}</span>`;

    const prompts = col(
        oral(`Count on from ${comma(m.n)}.`) + oral(`Count back from ${comma(m.n)}.`),
        'gap:0.8mm',
    );

    let word;
    if (m.wordMode === 'trace') {
        word = col(caption('Word form') + `<span class="ws-trace" data-ws-ink="trace" `
            + `style="font-size:var(--ws-text);font-weight:700;line-height:1.2">${esc(m.words)}</span>`);
    } else if (m.wordMode === 'bank') {
        const stack = m.wordBank.some((w) => w.length > 14);
        const opts = m.wordBank.map((w, i) => put(ctx, m.key, {
            id: `word${i}`, kind: 'choice', shape: 'choice', text: w,
        })).join('');
        word = col((m.captions ? caption('Word form') : '')
            + `<div style="display:flex;${stack ? 'flex-direction:column;gap:1.2mm' : 'gap:7mm'};`
            + `font-size:var(--ws-text);line-height:1.35">${opts}</div>`);
    } else {
        // A word form is TEXT, not a number: "five thousand nine hundred forty-eight" is 38
        // characters and will not sit on a 62 mm rule at working digit size. The rule is drawn
        // here so the writing line is full width at cell-text size and never wraps.
        word = col((m.captions ? caption('Word form') : '')
            + row(`<span style="font-size:var(--ws-text);font-weight:700">${esc(m.words[0])}</span>`
                + `<span style="display:inline-flex;align-items:flex-end;justify-content:flex-start;`
                + `flex:1 1 auto;min-width:62mm;height:var(--ws-hw);border-bottom:${HAIR}mm solid ${INK};`
                + `font-size:var(--ws-text);font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden">`
                + put(ctx, m.key, { id: 'word', kind: 'text', shape: 'open' })
                + `</span>`, 'gap:1.5mm;width:100%'), 'width:100%');
    }
    // A long word form needs the whole band width, so the band stacks instead of sitting in one
    // row. "two thousand one hundred seventy-eight" beside the number box has nowhere to go.
    const wide = m.words.length > 20 && m.wordMode !== 'bank';
    return wide
        ? col(row(boxed + prompts, 'gap:8mm') + word, 'gap:2mm;width:100%')
        : row(boxed + prompts + word, 'gap:8mm;width:100%');
}

/* ------------------------------------------------------- 2. double ten frame (to 20 only) */

/** RP-10: 2 x 5, border 1.5 pt, interior 0.75 pt. RP-11: counters at 0.65 of the cell. */
function tenFrame(x, y, cell, filled, { dotted = 0 } = {}) {
    const w = cell * 5, h = cell * 2;
    let out = sRect(x, y, w, h, HEAVY);
    for (let i = 1; i < 5; i++) out += sLine(x + i * cell, y, x + i * cell, y + h, HAIR);
    out += sLine(x, y + cell, x + w, y + cell, HAIR);
    const r = 0.325 * cell;
    for (let i = 0; i < filled; i++) {
        const cx = x + (i % 5) * cell + cell / 2;
        const cy = y + Math.floor(i / 5) * cell + cell / 2;
        out += i >= filled - dotted
            ? sCircle(cx, cy, r, { stroke: GREY, sw: 1 * PT_MM, dash: '1.2 1.2' })   // LS-1 dotted = trace
            : sCircle(cx, cy, r, { fill: INK, stroke: INK, sw: HAIR });
    }
    return out;
}

function renderTenFrame(m, ctx) {
    const cell = ctx.size === 'S' ? 8 : ctx.size === 'M' ? 9 : 10;
    const fw = cell * 5, fh = cell * 2, gap = 6;
    const w = fw * 2 + gap, h = fh + (m.captions ? 5 : 0);
    // Version A draws every counter and dots the ones past the first ten so the pupil traces
    // them; B draws them solid; C and D leave the frames empty for the pupil to draw, and the
    // KEY draws them (this is an answer that is a drawing).
    const show = m.drawGiven || isAnswered(ctx);
    const first = show ? Math.min(m.n, 10) : 0;
    const second = show ? Math.max(0, m.n - 10) : 0;
    const dotFirst = m.traceGiven && !isAnswered(ctx) ? Math.max(0, first - 10) : 0;
    const dotSecond = m.traceGiven && !isAnswered(ctx) ? second : 0;
    let g = tenFrame(0, 0, cell, first, { dotted: dotFirst })
        + tenFrame(fw + gap, 0, cell, second, { dotted: dotSecond });
    if (m.captions) {
        // The caption names what the frame HOLDS, and below ten there is no ten to name: every
        // counter sits in the FIRST frame, as ones. Captioning that frame "ten" told a pupil who
        // reads the picture rather than the words that 9 is nine tens, while the key beside it
        // said 0 tens 9 ones - the picture and the key must never disagree (BD-10, RP-10).
        if (m.n >= 10) {
            g += sText(fw / 2, fh + 4, 'ten', { pt: 10 });
            g += sText(fw + gap + fw / 2, fh + 4, 'ones', { pt: 10 });
        } else {
            g += sText(fw / 2, fh + 4, 'ones', { pt: 10 });
        }
    }
    const answer = row(
        put(ctx, m.key, { id: 'tens', kind: 'number', shape: 'box', digits: 1 }) + caption('tens')
        + '<span style="width:4mm"></span>'
        + put(ctx, m.key, { id: 'ones', kind: 'number', shape: 'box', digits: 1 }) + caption('ones'),
        'gap:1.5mm',
    );
    return row(svgBox(w, h, g) + answer, 'gap:8mm');
}

/* ------------------------------------- 3. one more / one less on a track piece (to 20 only) */

/** RP-54: rounded box, 1.5 pt outline, 0.75 pt dividers, one entry per cell. */
function renderTrack(m, ctx) {
    const cw = 24, ch = 15;
    const cellStyle = `flex:none;width:${cw}mm;height:${ch}mm;display:flex;align-items:center;`
        + `justify-content:center;font-size:var(--ws-digit);font-weight:700;line-height:1`;
    const divider = `border-left:${HAIR}mm solid ${INK}`;
    const slotFor = (id, i) => (m.traceGiven && i === 0
        ? traced(ctx, { id, kind: 'number', shape: 'open' }, m.key.slots[id].value)
        : put(ctx, m.key, { id, kind: 'number', shape: 'open' }));
    const track = `<div style="display:flex;border:${HEAVY}mm solid ${INK};border-radius:3mm;overflow:hidden">`
        + `<div style="${cellStyle}">${slotFor('less', 0)}</div>`
        + `<div style="${cellStyle};${divider}">${esc(String(m.n))}</div>`
        + `<div style="${cellStyle};${divider}">${slotFor('more', 1)}</div>`
        + `</div>`;
    const caps = m.captions
        ? `<div style="display:flex;margin-top:1mm">`
        + `<span style="width:${cw}mm;text-align:center;font-size:var(--ws-zone)">1 less</span>`
        + `<span style="width:${cw}mm"></span>`
        + `<span style="width:${cw}mm;text-align:center;font-size:var(--ws-zone)">1 more</span></div>`
        : '';
    return col(track + caps, 'gap:0');
}

/* ----------------------------------------------------------------------------- 4. compare */

/** A stacking grid: the two numbers right-aligned one above the other (RP-40 interior). */
function stackingGrid(a, b, digits, cellW, cellH) {
    const w = digits * cellW, h = digits ? cellH * 2 : 0;
    let g = sRect(0, 0, w, h, HEAVY);
    for (let i = 1; i < digits; i++) g += sLine(i * cellW, 0, i * cellW, h, HAIR);
    g += sLine(0, cellH, w, cellH, HAIR);
    const put1 = (v, rowIndex) => {
        const s = String(v).padStart(digits, ' ');
        let out = '';
        for (let i = 0; i < digits; i++) {
            if (s[i] === ' ') continue;
            out += sText(i * cellW + cellW / 2, rowIndex * cellH + cellH * 0.74, s[i], { pt: 14, w: 700 });
        }
        return out;
    };
    return svgBox(w, h, g + put1(a, 0) + put1(b, 1));
}

function renderCompare(m, ctx) {
    const grid = m.stack ? stackingGrid(m.n, m.other, m.digits, 9, 9) : '';
    let task;
    if (m.mode === 'circle') {
        const a = put(ctx, m.key, { id: 'pick0', kind: 'choice', shape: 'choice', text: String(comma(m.n)) });
        const b = put(ctx, m.key, { id: 'pick1', kind: 'choice', shape: 'choice', text: String(comma(m.other)) });
        task = `<div style="display:flex;gap:14mm;font-size:var(--ws-digit);font-weight:700;line-height:1.1">${a}${b}</div>`;
    } else {
        task = row(big(comma(m.n))
            + put(ctx, m.key, { id: 'sign', kind: 'sign', shape: 'circle' })
            + big(comma(m.other)), 'gap:5mm');
    }
    return row((grid ? grid + '<span style="width:4mm"></span>' : '') + task, 'gap:4mm');
}

/* ------------------------------------------------- 5. split (bond two ways) and 6. make it */

const eqRow = (parts) =>
    `<div style="display:flex;align-items:center;gap:2.5mm;font-size:var(--ws-digit);`
    + `font-weight:700;line-height:1">${parts.join('')}</div>`;

function renderSplit(m, ctx) {
    const cell = (i) => {
        const id = `part${i}`;
        return (m.traceGiven && i === 0)
            ? traced(ctx, { id, kind: 'number', shape: 'box', digits: m.digits }, m.key.slots[id].value)
            : put(ctx, m.key, { id, kind: 'number', shape: 'box', digits: m.digits });
    };
    if (m.reverse) {
        // D: the two parts are given, the whole is the unknown - the reverse task.
        return col(
            eqRow([put(ctx, m.key, { id: 'part0', kind: 'number', shape: 'box', digits: m.digits }),
                '<span>=</span>', big(m.givens[0]), '<span>+</span>', big(m.n - m.givens[0])])
            + eqRow([put(ctx, m.key, { id: 'part1', kind: 'number', shape: 'box', digits: m.digits }),
                '<span>=</span>', big(m.givens[1]), '<span>+</span>', big(m.n - m.givens[1])]),
            'gap:2.5mm',
        );
    }
    return col(
        eqRow([big(m.n), '<span>=</span>', big(m.givens[0]), '<span>+</span>', cell(0)])
        + eqRow([big(m.n), '<span>=</span>', big(m.givens[1]), '<span>+</span>', cell(1)]),
        'gap:2.5mm',
    );
}

function renderMake(m, ctx) {
    const one = (i) => (m.traceGiven
        ? traced(ctx, { id: `add${i}`, kind: 'number', shape: 'box', digits: m.digits }, m.key.slots[`add${i}`].value)
        : put(ctx, m.key, { id: `add${i}`, kind: 'number', shape: 'box', digits: m.digits }));
    return eqRow([one(0), '<span>+</span>', one(1), '<span>=</span>', big(m.n)]);
}

/* -------------------------------------- 7. place-value chart (tens/ones, H T O, with comma) */

/**
 * RP-31 quick-draw blocks: open square = hundred, stick = ten, open dot = one, all 1.5 pt.
 *
 * Five hundreds or more will not share a row with the tens and the ones: 8 x 9.5 + 9 x 3.2 +
 * 5 x 4.4 is 136, past the 104 the bank box has. The hundreds therefore take the top row alone
 * and the tens and ones take a second row beneath them, with the legend in the space the
 * hundreds row leaves on the right. Wrapping the hundreds INSIDE the shared row (what this did
 * before) put the ten-sticks through the hundreds squares and pushed the legend below the
 * viewBox, so 655 drew as six squares with sticks hanging out of them and no legend at all:
 * on these pages the picture is the question, and a picture that cannot be counted is the same
 * defect as a wrong answer.
 */
function quickDrawBlocks(x, y, hundreds, tens, ones, { key = false, boxW = 104 } = {}) {
    const twoRow = hundreds > 4;
    let g = '';
    let cx = x;
    const hy = twoRow ? 1 : y;
    const hPitch = twoRow ? 9 : 9.5;
    for (let i = 0; i < hundreds; i++) { g += sRect(cx, hy, 8, 8, HEAVY); cx += hPitch; }
    const ty = twoRow ? 14 : y;
    let tx = twoRow ? x : cx + (hundreds ? 4 : 0);
    for (let i = 0; i < tens; i++) { g += sLine(tx, ty - 2, tx, ty + 10, HEAVY); tx += 3.2; }
    let ox = tx + (tens ? 5 : 0);
    let oy = ty + 1.8;
    for (let i = 0; i < ones; i++) {
        g += sCircle(ox, oy, 1.7, { sw: HEAVY });
        ox += 4.4;
        if ((i + 1) % 5 === 0) { ox = tx + (tens ? 5 : 0); oy += 4.6; }
    }
    if (key) {
        // Beneath the blocks on a one-row picture, beside them on a two-row one. Either way the
        // whole legend is inside the box: an SVG clips to its viewBox without saying so.
        const lx = twoRow ? boxW - 26 : x;
        const ly = twoRow ? 0 : y + 14;
        g += sRect(lx, ly, 4, 4, HEAVY) + sText(lx + 2, ly + 7.5, '100', { pt: 8 });
        g += sLine(lx + 11, ly, lx + 11, ly + 4, HEAVY) + sText(lx + 11, ly + 7.5, '10', { pt: 8 });
        g += sCircle(lx + 19, ly + 2, 1.7, { sw: HEAVY }) + sText(lx + 19, ly + 7.5, '1', { pt: 8 });
    }
    return g;
}

/** RP-40: heavy outline, hairline interior, heads row, comma pre-printed on the boundary. */
function renderPvChart(m, ctx) {
    const cw = m.headWords ? 20 : 15;
    const headH = 6, cellH = ctx.size === 'L' ? 14 : 12;
    const w = m.places.length * cw;
    let g = sRect(0, 0, w, headH + cellH, HEAVY) + sLine(0, headH, w, headH, HAIR);
    for (let i = 1; i < m.places.length; i++) g += sLine(i * cw, 0, i * cw, headH + cellH, HAIR);
    m.places.forEach((p, i) => {
        g += sText(i * cw + cw / 2, headH - 1.6, m.headWords ? PLACE_HEAD[p] : PLACE_LETTER[p], { pt: 9, w: 700 });
    });
    if (m.commaAfter > 0) {
        // The thousands comma sits ON the column boundary, pre-printed (RP-40).
        g += sText(m.commaAfter * cw, headH + cellH + 0.4, ',', { pt: 16, w: 700 });
    }
    const chart = `<div style="position:relative;flex:none;width:${w}mm;height:${headH + cellH}mm">`
        + svgBox(w, headH + cellH, g, 'position:absolute;left:0;top:0')
        + m.places.map((p, i) => {
            const id = `d${i}`;
            // P-RV-16: version A traces the FIRST task of each kind, not every one of them - the
            // pupil still writes the rest, or the band would have nothing to answer.
            const inner = (m.traceGiven && i === 0
                ? traced(ctx, { id, kind: 'digit', shape: 'open' }, m.key.slots[id].value)
                : put(ctx, m.key, { id, kind: 'digit', shape: 'open' }));
            return `<span style="position:absolute;left:${i * cw}mm;top:${headH}mm;width:${cw}mm;`
                + `height:${cellH}mm;display:flex;align-items:center;justify-content:center;`
                + `font-size:var(--ws-digit);font-weight:700;line-height:1">${inner}</span>`;
        }).join('')
        + `</div>`;

    if (!m.blocks) return chart;
    const bw = 104, bh = 26;
    const show = m.drawGiven || isAnswered(ctx);
    const inner = show
        ? quickDrawBlocks(2, 4, m.hundreds, m.tens, m.ones, { key: m.captions, boxW: bw })
        : (m.captions ? quickDrawBlocks(2, 4, 0, 0, 0, { key: true, boxW: bw }) : '');
    // Where the pupil draws, the bank is a square-cornered box: it is a writing place (LS).
    const bank = svgBox(bw, bh, sRect(0.4, 0.4, bw - 0.8, bh - 0.8, HAIR) + inner);
    return row(chart + bank, 'gap:6mm');
}

/* ----------------------------------------------------------------------- 8. expanded form */

function renderExpanded(m, ctx) {
    const sep = (t) => (String(t).length > 3 ? 1 : 0);
    if (m.reverse) {
        return eqRow(m.terms.map((t, i) => (i ? `<span>+</span>${big(comma(t))}` : big(comma(t))))
            .concat(['<span>=</span>', put(ctx, m.key, {
                id: 'whole', kind: 'number', shape: 'line', digits: m.digits, separators: sep(m.n),
            })]));
    }
    const parts = [big(comma(m.n)), '<span>=</span>'];
    m.terms.forEach((t, i) => {
        if (i) parts.push('<span>+</span>');
        const spec = { id: `t${i}`, kind: 'number', shape: 'line', digits: String(t).length, separators: sep(t) };
        parts.push(m.traceGiven && i === 0 ? traced(ctx, spec, comma(t)) : put(ctx, m.key, spec));
    });
    return eqRow(parts);
}

/* ----------------------------------------------------------------------- 9. hops (+/- n) */

function renderHops(m, ctx) {
    const wide = String(m.n + Math.max(...m.hops)).length;
    const cells = m.hops.map((h, i) => {
        const id = `h${i}`;
        const spec = { id, kind: 'number', shape: 'line', digits: wide };
        const slot = (m.traceGiven && h === 1)
            ? traced(ctx, spec, m.key.slots[id].value)
            : put(ctx, m.key, spec);
        const word = `${comma(Math.abs(h))} ${h < 0 ? 'less' : 'more'}`;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:1mm">`
            + `<span style="font-size:var(--ws-zone);line-height:1">${esc(word)}</span>${slot}</div>`;
    });
    const numberBox = `<span style="border:${HEAVY}mm solid ${INK};padding:0.5mm 3mm;`
        + `font-size:var(--ws-digit);font-weight:700;line-height:1.1;flex:none">${esc(comma(m.n))}</span>`;
    const half = m.hops.length / 2;
    // Up to four hops sit in one row with the number in the middle. Eight of them (the 10,000
    // band) would need 8 x B(4) = 208 mm, past the 186 mm live width, so they break into a
    // "less" row and a "more" row with the number beside them. PT-ENG-1: never shrink to fit.
    if (m.hops.length > 4) {
        return row(numberBox + col(
            row(cells.slice(0, half).join(''), 'gap:3mm')
            + row(cells.slice(half).join(''), 'gap:3mm'), 'gap:1.5mm'), 'gap:6mm');
    }
    return row(cells.slice(0, half).join('') + numberBox + cells.slice(half).join(''),
        'gap:4mm;width:100%;justify-content:center');
}

/* ------------------------------------------------- 10. number line: count-by, round, mark */

/**
 * RP-50: axis 1.5 pt with arrowheads; labelled ticks 5 mm at 1.5 pt, part ticks 3 mm at 0.75 pt;
 * labels below at zone size. RP-51: a plotted point is a 2.5 mm solid dot.
 */
function numberLineSVG(lo, hi, { width = 130, step = 1, mark = null, markLabel = '', labelEvery = null, height = 22 } = {}) {
    const span = hi - lo;
    const y = 11, x0 = 5, x1 = width - 5;
    const at = (v) => x0 + ((v - lo) / span) * (x1 - x0);
    let g = sLine(x0, y, x1, y, HEAVY);
    g += `<path d="M${x0 - 4} ${y} l4 -2 v4 z" fill="${INK}"/><path d="M${x1 + 4} ${y} l-4 -2 v4 z" fill="${INK}"/>`;
    // RP-51: tick pitch is at least 6 mm wherever a pupil marks a tick, so the tick STEP is an
    // input - a 0-to-1,000 line draws ten ticks of 100, never a thousand ticks of 1.
    for (let i = 0; i * step <= span; i++) {
        const v = lo + i * step;
        const labelled = labelEvery ? (i % labelEvery === 0) : (v === lo || v === hi);
        g += labelled ? sLine(at(v), y - 2.5, at(v), y + 2.5, HEAVY) : sLine(at(v), y - 1.5, at(v), y + 1.5, HAIR);
        if (labelled) g += sText(at(v), y + 7, comma(v), { pt: 10, w: 700 });
    }
    if (mark !== null) {
        g += sCircle(at(mark), y, 1.25, { fill: INK, stroke: INK, sw: HAIR });
        if (markLabel) g += sText(at(mark), y - 4, markLabel, { pt: 10, w: 700 });
    }
    return svgBox(width, height, g);
}

/** Versions A and B: a count-by-10 strip with gaps (RP-54 track, filled / empty fade). */
function renderCountBy(m, ctx) {
    const cw = 20, ch = 14;
    const cells = m.strip.map((v, i) => {
        const divider = i ? `border-left:${HAIR}mm solid ${INK};` : '';
        const inner = v === null
            ? put(ctx, m.key, { id: `s${i}`, kind: 'number', shape: 'open' })
            : esc(String(v));
        return `<div style="flex:none;width:${cw}mm;height:${ch}mm;${divider}display:flex;`
            + `align-items:center;justify-content:center;font-size:var(--ws-digit);font-weight:700;`
            + `line-height:1">${inner}</div>`;
    }).join('');
    return `<div style="display:flex;border:${HEAVY}mm solid ${INK};border-radius:3mm;overflow:hidden">${cells}</div>`;
}

function renderNearest(m, ctx) {
    if (m.mode === 'count-by') return renderCountBy(m, ctx);
    if (m.mode === 'abstract') {
        return col(m.places.map((p, i) => row(
            big(comma(m.n)) + caption(`to the nearest ${PLACE_WORD[p]}`)
            + put(ctx, m.key, { id: `r${i}`, kind: 'number', shape: 'line', digits: m.digits }),
        )).join(''), 'gap:2mm');
    }
    // C: the line is given, the pupil marks the number on it and writes the rounded number.
    const marked = isAnswered(ctx) ? m.n : null;
    const line = numberLineSVG(m.lo, m.hi, {
        width: 116, mark: marked, markLabel: marked === null ? '' : comma(m.n), labelEvery: 5,
    });
    return row(line + put(ctx, m.key, { id: 'round', kind: 'number', shape: 'line', digits: m.digits }), 'gap:6mm');
}

/* ---------------------------------------------------------------- 11. round to each place */

function renderRoundTable(m, ctx) {
    const scaffold = m.captions ? renderPlaceStrip(m) : '';
    const rows = m.places.map((p, i) => {
        const id = `r${i}`;
        const spec = { id, kind: 'number', shape: 'line', digits: m.digits, separators: m.digits > 3 ? 1 : 0 };
        const slot = (m.traceGiven && i === 0) ? traced(ctx, spec, m.key.slots[id].value) : put(ctx, m.key, spec);
        return row(`<span style="font-size:var(--ws-zone);width:34mm">nearest ${esc(PLACE_WORD[p])}</span>${slot}`, 'gap:2mm');
    }).join('');
    return row((scaffold ? scaffold + '<span style="width:5mm"></span>' : '') + col(rows, 'gap:1.5mm'), 'gap:2mm');
}

/** RP-41: the target place's head letter in bold with a 1.5 pt divider to its right. */
function renderPlaceStrip(m) {
    const digits = String(m.n).split('');
    const cw = 8, h = 13;
    const w = digits.length * cw;
    let g = sRect(0, 0, w, h, HAIR);
    digits.forEach((d, i) => {
        if (i) g += sLine(i * cw, 0, i * cw, h, HAIR);
        g += sText(i * cw + cw / 2, h * 0.7, d, { pt: 13, w: 700 });
    });
    const targetIndex = digits.length - 1 - Math.round(Math.log10(m.places[0]));
    if (targetIndex >= 0 && targetIndex < digits.length) {
        g += sLine((targetIndex + 1) * cw, 0, (targetIndex + 1) * cw, h, HEAVY);
    }
    return svgBox(w, h, g);
}

/* --------------------------------------------------------- 12. odd or even, tally, and co. */

function renderOddEven(m, ctx) {
    // The scaffold has to match the size of the number. Pairing twenty counters is the picture
    // that makes odd and even VISIBLE; pairing 387 of them is 815 mm of dots, so above 20 the
    // scaffold becomes the rule the pupil will actually use - look at the ones digit.
    const scaffold = m.captions ? (m.n <= 20 ? pairPicture(m.n) : onesDigitStrip(m.n)) : '';
    const boxes = col(
        row(put(ctx, m.key, { id: 'odd', kind: 'check', shape: 'check' }) + caption('odd'), 'gap:1mm')
        + row(put(ctx, m.key, { id: 'even', kind: 'check', shape: 'check' }) + caption('even'), 'gap:1mm'),
        'gap:2mm',
    );
    return row(big(comma(m.n)) + scaffold + boxes, 'gap:8mm');
}

/** Pairs of dots with the odd one unpaired: the picture that makes odd and even visible. */
function pairPicture(n) {
    const cols = Math.ceil(n / 2), pitch = 4.2;
    const w = cols * pitch + 2, h = 11;
    let g = '';
    for (let i = 0; i < n; i++) {
        const cx = 1.6 + Math.floor(i / 2) * pitch;
        const cy = i % 2 === 0 ? 3.2 : 7.6;
        g += sCircle(cx, cy, 1.5, { fill: INK, stroke: INK, sw: HAIR });
    }
    return svgBox(w, h, g);
}

/** RP-41 shape: the place that decides is cut off by a 1.5 pt divider and named beneath. */
function onesDigitStrip(n) {
    const digits = String(n).split('');
    const cw = 8, h = 13, w = digits.length * cw;
    let g = sRect(0, 0, w, h, HAIR);
    digits.forEach((d, i) => {
        if (i) g += sLine(i * cw, 0, i * cw, h, i === digits.length - 1 ? HEAVY : HAIR);
        g += sText(i * cw + cw / 2, h * 0.68, d, { pt: 13, w: 700 });
    });
    g += sText(w - cw / 2, h + 3.6, 'ones', { pt: 8 });
    return svgBox(w, h + 4.5, g);
}

/** RP-22: 0.75 pt strokes, 6 / 8 / 10 mm tall, 2.5 mm pitch, diagonal fifth; square-cornered box. */
function renderTally(m, ctx) {
    const tall = ctx.size === 'S' ? 6 : ctx.size === 'M' ? 8 : 10;
    const groups = Math.ceil(m.n / 5);
    const w = Math.max(32, groups * (4 * 2.5 + 4) + 6), h = tall + 8;
    let g = sRect(0.4, 0.4, w - 0.8, h - 0.8, HAIR);
    if (isAnswered(ctx)) {
        let x = 4;
        for (let i = 0; i < m.n; i++) {
            const inGroup = i % 5;
            if (inGroup === 4) {
                g += sLine(x - 4 * 2.5 - 0.5, h - 4 - tall + 0.5, x - 0.5, h - 4 - 0.5, HAIR);
                x += 4;
            } else {
                g += sLine(x, h - 4 - tall, x, h - 4, HAIR);
                x += 2.5;
            }
        }
    }
    return row(big(comma(m.n)) + svgBox(w, h, g), 'gap:8mm');
}

function renderLineMark(m, ctx) {
    const marked = isAnswered(ctx) ? m.n : null;
    return numberLineSVG(m.lo, m.hi, {
        width: 168, mark: marked, markLabel: marked === null ? '' : comma(m.n),
        labelEvery: m.labelEvery, height: 24,
    });
}

function renderOrder3(m, ctx) {
    const given = row(m.set.map((v) => big(comma(v))).join('<span style="width:8mm"></span>'), 'gap:0');
    const slots = row([0, 1, 2].map((i) => put(ctx, m.key, {
        id: `o${i}`, kind: 'number', shape: 'box', digits: m.digits, separators: m.digits > 3 ? 1 : 0,
    })).join('<span style="width:4mm"></span>'), 'gap:0');
    return col(given + slots, 'gap:3mm');
}

function renderDigitValue(m, ctx) {
    // The number keeps its thousands comma (PT-DOC-6); only the DIGIT is underlined, never the
    // comma, so the display is rebuilt from the comma'd form with the digit positions tracked.
    let digitSeen = -1;
    const shown = comma(m.n).split('').map((ch) => {
        if (ch === ',') return ',';
        digitSeen++;
        return digitSeen === m.markIndex
            ? `<span style="text-decoration:underline;text-decoration-thickness:${HAIR}mm;text-underline-offset:1.2mm">${esc(ch)}</span>`
            : esc(ch);
    }).join('');
    return row(`<span style="font-size:var(--ws-digit);font-weight:700;line-height:1">${shown}</span>`
        + put(ctx, m.key, { id: 'value', kind: 'number', shape: 'line', digits: m.digits, separators: m.digits > 3 ? 1 : 0 }), 'gap:8mm');
}

function renderWordBank(m, ctx) {
    const opts = m.wordBank.map((w, i) => put(ctx, m.key, {
        id: `wb${i}`, kind: 'choice', shape: 'choice', text: w,
    })).join('');
    return row(big(comma(m.n))
        + `<div style="display:flex;flex-direction:column;gap:1.4mm;font-size:var(--ws-text);line-height:1.3">${opts}</div>`,
        'gap:10mm');
}

/* ------------------------------------------------------------- 13. side-2 charts and strips */

/** A 0-20 number strip with gaps (RP-54). */
function renderStrip(m, ctx) {
    const cw = 8, ch = 15;
    const cells = m.cells.map((v, i) => {
        const divider = i ? `border-left:${HAIR}mm solid ${INK};` : '';
        let inner = v === null
            ? put(ctx, m.key, { id: `c${i}`, kind: 'number', shape: 'open' })
            : esc(String(v));
        // "Circle N" is a drawn answer, so the KEY draws the ring - without it the key showed a
        // filled strip and left half of the instruction unanswered (AK-2, PT-KEY-7).
        if (isAnswered(ctx) && v === m.n) {
            inner = `<span style="display:inline-flex;align-items:center;justify-content:center;`
                + `width:7mm;height:9.5mm;border:${HAIR}mm solid ${INK};border-radius:50%">${inner}</span>`;
        }
        return `<div style="flex:none;width:${cw}mm;height:${ch}mm;${divider}display:flex;`
            + `align-items:center;justify-content:center;font-size:var(--ws-text);font-weight:700;`
            + `line-height:1">${inner}</div>`;
    }).join('');
    // BD-10: the band's instruction already says what to do. A caption repeating it inside the
    // cell is a restatement, not a scaffold, so there is none here.
    return `<div style="display:flex;border:${HEAVY}mm solid ${INK};border-radius:3mm;`
        + `overflow:hidden;width:max-content">${cells}</div>`;
}

/** A 120 chart with targeted blanks around the number (chart cells are writing places). */
function renderChart120(m, ctx) {
    // 10 x 17.2 = 172 mm plus the 1.5 pt frame, inside the 178.9 mm a band cell leaves after
    // the sheet frame and the cell's own 3 mm side padding. 18.4 mm columns (the figure in
    // PT-TDN-5, which is measured against the full 186 mm live width) overflow the cell.
    const cw = 17.2, ch = 13;
    const cells = [];
    for (let v = 1; v <= 120; v++) {
        const blankCell = m.blanks.includes(v);
        const inner = blankCell
            ? put(ctx, m.key, { id: `k${v}`, kind: 'number', shape: 'open' })
            : esc(String(v));
        cells.push(`<div style="border-right:${HAIR}mm solid ${INK};border-bottom:${HAIR}mm solid ${INK};`
            + `display:flex;align-items:center;justify-content:center;font-size:var(--ws-text);`
            + `font-weight:${v === m.n ? 700 : 400};line-height:1">${inner}</div>`);
    }
    return `<div style="display:grid;grid-template-columns:repeat(10,${cw}mm);`
        + `grid-template-rows:repeat(12,${ch}mm);border:${HEAVY}mm solid ${INK};`
        + `border-right:0;border-bottom:0;width:max-content">${cells.join('')}</div>`;
}

function renderOpenLine(m, ctx) {
    const marked = isAnswered(ctx) ? m.n : null;
    const line = numberLineSVG(m.lo, m.hi, {
        width: 176, step: m.step, mark: marked, markLabel: marked === null ? '' : comma(m.n),
        labelEvery: m.labelEvery, height: 26,
    });
    return col(line + row(caption('halfway') + put(ctx, m.key, {
        id: 'half', kind: 'number', shape: 'line', digits: m.digits, separators: m.digits > 3 ? 1 : 0,
    })), 'gap:3mm');
}

/* =========================================================== building one band's data model */

const DRAW = Object.freeze({
    number: renderNumber, tenframe: renderTenFrame, track: renderTrack, compare: renderCompare,
    split: renderSplit, make: renderMake, 'pv-chart': renderPvChart, expanded: renderExpanded,
    hops: renderHops, nearest: renderNearest, 'round-table': renderRoundTable,
    'odd-even': renderOddEven, tally: renderTally, 'line-mark': renderLineMark,
    order3: renderOrder3, 'digit-value': renderDigitValue, 'word-bank': renderWordBank,
    strip: renderStrip, chart120: renderChart120, 'open-line': renderOpenLine,
});

/** Every band id this role can compose. */
export const BAND_IDS = Object.freeze(Object.keys(DRAW));

/**
 * Bands whose ANSWER IS A DRAWING and which therefore carry no writing place: the pupil draws
 * tally marks, or marks a point on the line. They are scored cells all the same (PT-FRM-4), and
 * the key draws what the pupil should have drawn (AK-2). Bands that draw AND have slots
 * (the ten frame, the blocks bank, the rounding line) are covered by their slots.
 */
const DRAWN_ANSWER_BANDS = new Set(['tally', 'line-mark']);

const keyOf = (slots, display) => ({ display: display === undefined ? '' : String(display), slots });
// PT-DOC-6: a number a pupil reads carries its thousands comma, on the key as on the page.
// `gradeSlots` strips commas before it compares, so printing one never makes an answer wrong.
const fmt = (value) => (typeof value === 'number' ? comma(value) : String(value));
const g = (value) => ({ value: fmt(value) });
const ung = (value) => ({ value: value === undefined ? '' : fmt(value), graded: false });

/** A partner number for compare / order: near, inside the range, never equal. */
function nearNumber(r, n, max, spread) {
    for (let i = 0; i < 40; i++) {
        const d = int(r, 1, spread) * (int(r, 0, 1) ? 1 : -1);
        const m = n + d;
        if (m !== n && m >= 1 && m <= max) return m;
    }
    return n < max ? n + 1 : n - 1;
}

/**
 * Build one band. Returns plain data plus the `render(ctx)` the plan hands to the renderer, so
 * ONE function draws the pupil page and the key (parity by construction, AK-1).
 */
function buildBand(id, s) {
    const { n, r, spec, version, digits, max } = s;
    const captions = version === 'A' || version === 'B';          // P-RV-16
    const traceGiven = version === 'A';
    const drawGiven = version === 'A' || version === 'B';
    const abstract = version === 'D';
    const base = { id, n, digits, captions, traceGiven, drawGiven, abstract, max };
    let m = base;
    let instr = '';
    let key = keyOf({});

    switch (id) {
        case 'number': {
            const words = numberWords(n);
            const wordMode = traceGiven ? 'trace' : (abstract ? 'write' : 'bank');
            let wordBank = [];
            if (wordMode === 'bank') {
                const others = [];
                while (others.length < 2) {
                    const o = nearNumber(r, n, max, Math.max(4, Math.round(max / 12)));
                    const w = numberWords(o);
                    if (w !== words && !others.includes(w)) others.push(w);
                }
                wordBank = shuffle(r, [words, others[0], others[1]]);
                const slots = {};
                wordBank.forEach((w, i) => { slots[`word${i}`] = w === words ? g(w) : ung(''); });
                key = keyOf(slots, words);
            } else if (wordMode === 'write') {
                key = keyOf({ word: g(words) }, words);
            } else {
                key = keyOf({}, words);          // fully traced: nothing for the pupil to answer
            }
            instr = wordMode === 'trace' ? 'Say the number. Trace the word.'
                : wordMode === 'bank' ? 'Say the number. Circle the word.'
                : 'Say the number. Write the word.';
            m = Object.assign({}, base, { words, wordMode, wordBank, key });
            break;
        }
        case 'tenframe': {
            const tens = Math.floor(n / 10), ones = n % 10;
            key = keyOf({ tens: g(tens), ones: g(ones) }, `${tens} tens ${ones} ones`);
            instr = drawGiven ? 'Count the counters. Write the tens and ones.'
                : 'Draw counters. Write the tens and ones.';
            m = Object.assign({}, base, { key });
            break;
        }
        case 'track': {
            key = keyOf({ less: g(n - 1), more: g(n + 1) }, `${n - 1}, ${n + 1}`);
            instr = instructionFor('more-less');
            m = Object.assign({}, base, { key });
            break;
        }
        case 'compare': {
            const other = nearNumber(r, n, max, COMPARE_SPREAD[spec.id] || 5);
            const mode = captions ? 'circle' : 'sign';
            if (mode === 'circle') {
                const bigger = Math.max(n, other);
                key = keyOf({
                    pick0: n === bigger ? g(comma(n)) : ung(''),
                    pick1: other === bigger ? g(comma(other)) : ung(''),
                }, comma(bigger));
                instr = instructionFor('circle-bigger');
            } else {
                const sign = n > other ? '>' : n < other ? '<' : '=';
                key = keyOf({ sign: g(sign) }, `${comma(n)} ${sign} ${comma(other)}`);
                instr = instructionFor('compare');
            }
            m = Object.assign({}, base, { other, mode, stack: digits >= 2 && spec.id !== 'to20', key });
            break;
        }
        case 'split': {
            const a = int(r, 1, Math.max(1, n - 1));
            let b = int(r, 1, Math.max(1, n - 1));
            if (b === a) b = a === n - 1 ? Math.max(1, a - 1) : a + 1;
            const givens = [a, b];
            key = keyOf(
                m.abstract
                    ? { part0: g(n), part1: g(n) }
                    : { part0: g(n - a), part1: g(n - b) },
                m.abstract ? String(n) : `${n - a}, ${n - b}`,
            );
            instr = instructionFor('missing');
            m = Object.assign({}, base, { givens, reverse: abstract, key });
            break;
        }
        case 'make': {
            const a = int(r, 1, Math.max(1, n - 1));
            // An OPEN task: any pair that makes the number is right (P-LG-15). The key shows one
            // correct pair. In version A both numbers are traced, so the band is a model: nothing
            // is graded and the key IS the pupil page.
            key = keyOf(traceGiven ? { add0: ung(a), add1: ung(n - a) } : { add0: g(a), add1: g(n - a) },
                `${a} + ${n - a} (any pair that makes ${comma(n)})`);
            instr = traceGiven ? 'Trace the two numbers.' : 'Write two numbers that make the number.';
            m = Object.assign({}, base, { key });
            break;
        }
        case 'pv-chart': {
            const places = [];
            for (let p = Math.pow(10, String(n).length - 1); p >= 1; p /= 10) places.push(p);
            const slots = {};
            String(n).split('').forEach((d, i) => { slots[`d${i}`] = g(d); });
            key = keyOf(slots, comma(n));
            const blocks = spec.blocks && String(n).length <= 3;   // P-RV-18
            instr = blocks
                ? (drawGiven ? 'Write the number in the chart.' : 'Draw the blocks. Write the number in the chart.')
                : 'Write the number in the chart.';
            m = Object.assign({}, base, {
                places, blocks, headWords: places.length <= 4,
                commaAfter: places.length > 3 ? places.length - 3 : 0,
                hundreds: Math.floor(n / 100), tens: Math.floor((n % 100) / 10), ones: n % 10, key,
            });
            break;
        }
        case 'expanded': {
            const terms = placeValues(n);
            const slots = {};
            if (abstract) slots.whole = g(n);
            else terms.forEach((t, i) => { slots[`t${i}`] = g(t); });
            key = keyOf(slots, abstract ? comma(n) : terms.join(' + '));
            instr = abstract ? 'Write the number.' : instructionFor('expanded');
            m = Object.assign({}, base, { terms, reverse: abstract, key });
            break;
        }
        case 'hops': {
            const hops = HOPS[spec.id] || [-1, 1];
            const slots = {};
            hops.forEach((h, i) => { slots[`h${i}`] = g(n + h); });
            key = keyOf(slots, hops.map((h) => comma(n + h)).join(', '));
            instr = 'Write the missing numbers.';
            m = Object.assign({}, base, { hops, key });
            break;
        }
        case 'nearest': {
            const mode = captions ? 'count-by' : (abstract ? 'abstract' : 'line');
            if (mode === 'count-by') {
                // Anchored so the last cell lands ON the range top rather than being clamped to
                // it: clamping printed "120, 120" and asked the pupil to count by ten across two
                // equal cells. The default window never reaches this, a slid one does.
                const start = Math.max(0, Math.min((Math.floor(n / 10) - 2) * 10, max - 50));
                const values = [0, 1, 2, 3, 4, 5].map((i) => start + i * 10);
                const gaps = shuffle(r, [1, 2, 3, 4]).slice(0, 2).sort((x, y) => x - y);
                const strip = values.map((v, i) => (gaps.includes(i) ? null : v));
                const slots = {};
                gaps.forEach((i) => { slots[`s${i}`] = g(values[i]); });
                key = keyOf(slots, gaps.map((i) => values[i]).join(', '));
                instr = instructionFor('skip-count', { n: 10 });
                m = Object.assign({}, base, { mode, strip, key });
            } else if (mode === 'abstract') {
                const places = ROUND_PLACES[spec.id] || [10];
                const slots = {};
                places.forEach((p, i) => { slots[`r${i}`] = g(roundTo(n, p)); });
                key = keyOf(slots, places.map((p) => comma(roundTo(n, p))).join(', '));
                instr = 'Round the number to each place.';
                m = Object.assign({}, base, { mode, places, key });
            } else {
                const lo = Math.floor(n / 10) * 10, hi = lo + 10;
                key = keyOf({ round: g(roundTo(n, 10)) }, comma(roundTo(n, 10)));
                instr = 'Mark the number. Round to the nearest ten.';
                m = Object.assign({}, base, { mode, lo, hi, key });
            }
            break;
        }
        case 'round-table': {
            const places = ROUND_PLACES[spec.id] || [10];
            const slots = {};
            places.forEach((p, i) => { slots[`r${i}`] = g(roundTo(n, p)); });
            key = keyOf(slots, places.map((p) => comma(roundTo(n, p))).join(', '));
            instr = 'Round the number to each place.';
            m = Object.assign({}, base, { places, key });
            break;
        }
        case 'odd-even': {
            const even = n % 2 === 0;
            key = keyOf({ odd: even ? ung('') : g('1'), even: even ? g('1') : ung('') }, even ? 'even' : 'odd');
            instr = 'Check one box: odd or even.';
            m = Object.assign({}, base, { key });
            break;
        }
        case 'tally': {
            key = keyOf({}, `${Math.floor(n / 5)} groups of five and ${n % 5}`);
            instr = 'Draw tally marks for the number.';
            m = Object.assign({}, base, { key });
            break;
        }
        case 'line-mark': {
            const lo = spec.id === 'to20' ? 0 : Math.max(0, Math.floor(n / 10) * 10 - 10);
            const hi = spec.id === 'to20' ? 20 : lo + 20;
            key = keyOf({}, comma(n));
            instr = instructionFor('line-mark');
            m = Object.assign({}, base, { lo, hi, labelEvery: 5, key });
            break;
        }
        case 'order3': {
            const a = nearNumber(r, n, max, COMPARE_SPREAD[spec.id] || 5);
            let b = nearNumber(r, n, max, COMPARE_SPREAD[spec.id] || 5);
            if (b === a) b = a < max ? a + 1 : a - 1;
            const set = shuffle(r, [n, a, b]);
            const sorted = set.slice().sort((x, y) => x - y);
            const slots = {};
            sorted.forEach((v, i) => { slots[`o${i}`] = g(comma(v)); });
            key = keyOf(slots, sorted.map(comma).join(', '));
            instr = instructionFor('order-up');
            m = Object.assign({}, base, { set, key });
            break;
        }
        case 'digit-value': {
            const markIndex = int(r, 0, String(n).length - 1);
            const value = Number(String(n)[markIndex]) * Math.pow(10, String(n).length - 1 - markIndex);
            key = keyOf({ value: g(value) }, comma(value));
            instr = instructionFor('digit-value');
            m = Object.assign({}, base, { markIndex, key });
            break;
        }
        case 'word-bank': {
            const words = numberWords(n);
            const others = [];
            while (others.length < 2) {
                const o = nearNumber(r, n, max, Math.max(4, Math.round(max / 12)));
                const w = numberWords(o);
                if (w !== words && !others.includes(w)) others.push(w);
            }
            const wordBank = shuffle(r, [words, others[0], others[1]]);
            const slots = {};
            wordBank.forEach((w, i) => { slots[`wb${i}`] = w === words ? g(w) : ung(''); });
            key = keyOf(slots, words);
            instr = 'Circle the word form of the number.';
            m = Object.assign({}, base, { wordBank, key });
            break;
        }
        case 'strip': {
            const cells = [];
            const slots = {};
            // The day's number is never one of the gaps: the instruction says to circle it, and
            // a pupil cannot circle a cell that has been blanked out. 6 candidates remain, so
            // the 5 gaps are still drawn from the same shuffled pool.
            const gaps = shuffle(r, [2, 5, 8, 11, 14, 17, 19].filter((v) => v !== n)).slice(0, 5);
            for (let v = 0; v <= 20; v++) {
                if (gaps.includes(v)) { cells.push(null); slots[`c${v}`] = g(v); } else cells.push(v);
            }
            key = keyOf(slots,
                `${gaps.slice().sort((x, y) => x - y).join(', ')} · ${comma(n)} circled`);
            instr = `Write the missing numbers. Circle ${comma(n)}.`;
            m = Object.assign({}, base, { cells, key });
            break;
        }
        case 'chart120': {
            const around = [n - 10, n - 1, n, n + 1, n + 10].filter((v) => v >= 1 && v <= 120);
            const extra = shuffle(r, [7, 23, 46, 68, 91, 104, 117]).slice(0, 3);
            const blanks = Array.from(new Set(around.concat(extra))).filter((v) => v >= 1 && v <= 120);
            const slots = {};
            blanks.forEach((v) => { slots[`k${v}`] = g(v); });
            key = keyOf(slots, blanks.slice().sort((x, y) => x - y).join(', '));
            instr = 'Write the missing numbers.';
            m = Object.assign({}, base, { blanks, key });
            break;
        }
        case 'open-line': {
            const stepSize = spec.id === 'to10000' ? 1000 : 100;
            const lo = Math.floor(n / stepSize) * stepSize;
            const hi = lo + stepSize;
            const half = lo + stepSize / 2;
            key = keyOf({ half: g(half) }, comma(half));
            instr = 'Mark the number. Write the halfway number.';
            // Ten part ticks across 176 mm = 17.6 mm pitch, well over the RP-51 floor of 6 mm.
            m = Object.assign({}, base, { lo, hi, step: stepSize / 10, labelEvery: 10, key });
            break;
        }
        default:
            instr = 'Solve.';
            m = Object.assign({}, base, { key });
    }

    const draw = DRAW[id];
    // Two different questions, which were one flag before and gave the wrong answer to both.
    //   hasSlot  - is there a writing place for `fillSlots` to fill? If not the key must say so
    //              (`drawsAnswer`) or `keyCoverage` reports a gap the role does not have.
    //   graded   - is this a SCORED CELL (PT-FRM-4)? Drawing the tally marks or marking the
    //              number line is an answer and is scored; the version-A traced model is not.
    const hasSlot = Object.values(key.slots).some((sl) => sl.graded !== false);
    const drawnAnswer = DRAWN_ANSWER_BANDS.has(id);
    const graded = hasSlot || drawnAnswer;
    return {
        id, instr, key, graded, hasSlot, drawnAnswer, model: m,
        render: (ctx) => bandShell(instr, draw(m, ctx), ctx),
    };
}

/* ------------------------------------------------------------------- the band frame (cell) */

/**
 * PT-TDN-2: each band is a full-width cell carrying its black number tab, ONE instruction at
 * cell-text size on its first line, and a work area of at least 28 mm. The tab occupies the
 * cell's top-left corner, so the instruction starts at tab + 2 mm (the label keep-out).
 */
function bandShell(instr, work) {
    return `<div class="tn-band" style="display:flex;flex-direction:column;width:100%;height:100%;gap:1mm">`
        + `<div class="tn-instr" style="flex:none;min-height:var(--ws-tab);font-size:var(--ws-text);`
        + `line-height:1.15;padding-left:calc(var(--ws-tab) + 2mm)">${esc(instr)}</div>`
        + `<div class="tn-work" style="flex:1 1 0;min-height:0;display:flex;align-items:center;`
        + `justify-content:flex-start;overflow:hidden">${work}</div></div>`;
}

const CELL_STYLE = 'padding:1.2mm 3mm 1.5mm;align-items:stretch;justify-content:flex-start';

/* ================================================================================= the plan */

/**
 * Build the whole sheet as data. Returns the day's number, the bands of each side, the score
 * denominator and the seed - everything a caller (or a test) needs without rendering anything.
 */
export function build(opts = {}) {
    const rangeId = RANGES[opts.range] ? opts.range : 'to120';
    const spec = RANGES[rangeId];
    const version = VERSIONS.includes(opts.version) ? opts.version : 'B';
    const day = opts.day === undefined ? '' : String(opts.day);
    const classSeed = opts.seed === undefined ? 0 : opts.seed;
    const sides = opts.sides === 1 ? 1 : 2;

    const { n, r } = pickNumber({ range: rangeId, version, day, seed: classSeed, window: opts.window });
    const s = { n, r, spec, version, digits: String(n).length, max: spec.max };

    const ids = Array.isArray(opts.bands) && opts.bands.length ? opts.bands.slice(0, 6) : spec.bands.slice();
    const side1 = ids.map((id) => buildBand(id, s));
    const side2 = sides === 2
        ? {
            chart: buildBand(spec.side2.chart, s),
            chartHMm: spec.side2.chartHMm,
            followups: spec.side2.followups.map((id) => buildBand(id, s)),
        }
        : null;

    const all = side1.concat(side2 ? [side2.chart].concat(side2.followups) : []);
    const score = all.filter((b) => b.graded).length;      // PT-FRM-4: scored CELLS

    return {
        range: rangeId, spec, version, day, seed: classSeed, sides,
        n, words: numberWords(n), size: opts.size || spec.size,
        side1, side2, bands: all, score,
        seedValue: deriveSeed('todays-number', rangeId, version, day, String(classSeed)),
    };
}

/**
 * The PagePlan. `answer-key.js` renders it once blank (the pupil sheet) and once answered (the
 * facsimile key) - one plan, two states, so cell N sits at the same place on both (AK-1).
 */
export function plan(opts = {}) {
    const b = opts.built || build(opts);
    const spec = b.spec;
    const itemOf = (band) => ({
        render: band.render,
        key: band.key,
        skill: `todays_number:${band.id}`,
        style: CELL_STYLE,
        visual: true,
        // A band with no writing place is either a model whose answer is already printed (the
        // version-A traced word form) or one whose answer is a drawing the key draws (tally,
        // line-mark). Either way the key is complete, so say so instead of reporting a gap.
        drawsAnswer: band.hasSlot ? undefined : true,
    });

    const pages = [{
        sections: [{
            kind: 'grid', cols: 1, rows: b.side1.length, labels: 'tab', start: 1,
            items: b.side1.map(itemOf),
        }],
    }];

    if (b.side2) {
        pages.push({
            sections: [
                {
                    kind: 'grid', cols: 1, rows: 1, labels: 'tab', start: b.side1.length + 1,
                    cls: 'fixed', height: `${b.side2.chartHMm}mm`,
                    items: [itemOf(b.side2.chart)],
                },
                {
                    kind: 'grid', cols: 1, rows: b.side2.followups.length, labels: 'tab',
                    start: b.side1.length + 2,
                    items: b.side2.followups.map(itemOf),
                },
            ],
        });
    }

    return {
        role: 'todays-number',
        built: b,
        ctx: {
            look: 'daily',                       // PT-LOOK-1: Today's Number is a Daily-look sheet
            size: b.size,
            scaffoldLevel: b.version === 'A' ? 3 : b.version === 'B' ? 2 : b.version === 'C' ? 1 : 0,
            paper: opts.paper || 'A4',
            photocopySafe: opts.photocopySafe === true,
            mode: 'print',
        },
        header: {
            name: true, date: true, score: b.score,
            tab: [`Level ${spec.level}`, 'Number', `${spec.label} - ${b.version}`],   // PT-FRM-9
            title: "Today's Number",                                                  // PT-FRM-6 fixed title
        },
        // HD-20: the continuation header is supplied here rather than left to the default,
        // which joins the strand lines ("Level 1 · Number") into one line too wide for the
        // 30 mm tab box. Two lines keep HD-5's shape and leave the key's id line free.
        contHeader: {
            name: true, date: false, score: false, title: '',
            tab: [`Level ${spec.level}`, `${spec.label} - ${b.version}`],
        },
        footer: {
            left: `todays_number · Grade ${spec.level} · ${spec.ccss}`,
            right: `Form ${b.version} · seed ${b.seedValue}`,
        },
        form: b.version,
        seed: b.seedValue,
        pages,
    };
}

/** The pupil sheet and its facsimile key, from one plan. */
export function renderTodaysNumber(opts = {}) {
    const p = plan(opts);
    return { plan: p, built: p.built, source: renderSource(p), key: renderAnswerKey(p) };
}

/* ====================================================================== checks a test can run */

/**
 * Every number this sheet PRINTS or EXPECTS, so a test can prove that a sheet called "to 120"
 * never asks for 121. Returns {values, min, max, overMax, underZero}.
 */
export function auditValues(built) {
    const values = [built.n];
    for (const band of built.bands) {
        for (const slot of Object.values(band.key.slots || {})) {
            const raw = String(slot.value === undefined ? '' : slot.value).replace(/,/g, '');
            if (/^-?\d+$/.test(raw)) values.push(Number(raw));
        }
        const m = band.model || {};
        for (const k of ['other', 'lo', 'hi']) if (typeof m[k] === 'number') values.push(m[k]);
        if (Array.isArray(m.givens)) values.push(...m.givens);
        if (Array.isArray(m.set)) values.push(...m.set);
        if (Array.isArray(m.terms)) values.push(...m.terms);
        if (Array.isArray(m.strip)) values.push(...m.strip.filter((v) => typeof v === 'number'));
        if (Array.isArray(m.cells)) values.push(...m.cells.filter((v) => typeof v === 'number'));
    }
    const max = Math.max(...values);
    const min = Math.min(...values);
    return {
        values, min, max,
        overMax: values.filter((v) => v > built.spec.max),
        underZero: values.filter((v) => v < 0),
    };
}

/** Lint every instruction the sheet prints (P-LG-1, P-LG-4, the print-verb list). */
export function auditInstructions(built) {
    return built.bands.map((band) => ({
        band: band.id,
        text: band.instr,
        libraryKey: instructionKeyOf(band.instr),
        words: band.instr.replace(/_/g, '').trim().split(/\s+/).length,
        problems: lintInstruction(band.instr),
    }));
}

/** Facsimile parity for this role: same cells, same pages, and what the key could not draw. */
export const audit = (opts = {}) => keyCoverage(plan(opts));

export default {
    RANGES, RANGE_IDS, VERSIONS, BAND_IDS,
    numberWords, comma, placeValues, roundTo, pickNumber,
    build, plan, renderTodaysNumber, auditValues, auditInstructions, audit,
};
