// js/modules/sheet/support-draw.js
// DRAWING the supports a problem carries (design/SUPPORTS.md §S2). The allocator (supports.js)
// decides WHAT each item carries and writes it into the render payload:
//
//   payload.supports = { on: [ids], reserve: [ids], table?: n, tally?: n }
//
// This module draws it, one way for paper and screen:
//   - touch dots on the numerals (S1, touchdots.js): `touchPlan` says which digit of which
//     number carries dots, and the fact / stack / equation templates lay the overlay on those
//     digit spans (it takes no space, so nothing moves);
//   - a ÷ fact's tally-dot row (touch dots on a ÷ fact), a P11 cue (fact.js factCue) or a pane
//     (panes/index.js) drawn round the problem by `withSupports`, placed by `placePane`;
//   - `reserve`: the section's worst case. A support another cell of the section carries is drawn
//     here INVISIBLY (visibility:hidden), so every cell has the same geometry and the answer zone
//     stands in the same place in each (SCC-T10).
//
// Nothing here ever draws the answer: touch dots sit on the GIVEN numbers only, the tally row is
// always the section's one length (never the quotient), and the panes are answer-free (§S4.2).
//
// Pure module (SCC-01).

import { touchNumeralHTML, touchTallySVG, touchDotsFits } from './touchdots.js';
import { PANES, placePane, attachPane, PANE_GAP_MM } from './cells/panes/index.js';
import { TOUCH_IDS, CUE_IDS, alternativesOf } from './supports.js';
import { installSupportDrawer } from './registry.js';
import { blankWidth } from './tokens.js';

const OPN = { '+': '+', '-': '-', '−': '-', '*': '*', x: '*', '×': '*', '/': '/', '÷': '/' };
export const opKey = (op) => OPN[op] || '';

/** The supports spec of a payload, or null. */
export function supportsOf(p) {
    const s = p && p.supports;
    if (!s || typeof s !== 'object') return null;
    const on = Array.isArray(s.on) ? s.on : [], reserve = Array.isArray(s.reserve) ? s.reserve : [];
    return on.length || reserve.length ? { ...s, on, reserve } : null;
}

/** 'all' (count all), 'on' (count on / back / by) or null: the touch-dot rung a payload carries. */
export function touchMode(p) {
    const s = supportsOf(p);
    if (!s) return null;
    if (s.on.includes('touchall')) return 'all';
    if (s.on.includes('touch')) return 'on';
    return null;
}

/* ------------------------------------------------------------------ which digits carry dots */

const digitsOf = (n) => String(n).replace(/[^0-9]/g, '');

/**
 * Which numbers of a two-number problem carry touch dots (owner ruling 2026-09-25):
 *   +  count all: both · count on: the smaller (the pupil says the larger; b when equal)
 *   −  count all: both · count back: the number taken away
 *   ×  dots on the factor that is NOT the table number; the pupil counts by the table number
 *   ÷  none on the numerals: a tally-dot row under the fact instead
 * Returns {a: bool, b: bool}.
 */
export function touchNumbers(p, mode = touchMode(p)) {
    // Scope (owner report 2026-10-03): a touch numeral stands for its own value, so only a
    // SINGLE-DIGIT number is ever drawn as one in a sentence or a fact (a 12 is not 1 + 2 counts).
    // Column stacks dot their digits column by column instead (touchColumns).
    const r = touchNumbersRaw(p, mode);
    const one = (v) => /^[0-9]$/.test(String(v).trim());
    return { a: r.a && one(p.a), b: r.b && one(p.b) };
}

function touchNumbersRaw(p, mode) {
    const none = { a: false, b: false };
    if (!mode) return none;
    const op = opKey(p.op), a = Number(p.a), b = Number(p.b);
    if (op === '/') return none;
    if (op === '*') {
        const t = Number(p.supports && p.supports.table);
        // The table number is the one in the teacher's fact set; with both (or neither) in it, the
        // pupil counts by the larger and touches the smaller.
        if (Number.isFinite(t) && (t === a) !== (t === b)) return t === a ? { a: false, b: true } : { a: true, b: false };
        return a < b ? { a: true, b: false } : { a: false, b: true };
    }
    if (mode === 'all') return { a: true, b: true };
    if (op === '-') return { a: false, b: true };
    return a < b ? { a: true, b: false } : { a: false, b: true };
}

/**
 * A column stack's touch digits, COLUMN BY COLUMN (owner ruling): rows = the operands top to
 * bottom (strings), T = the track count (operator track first). Returns one boolean array of
 * length T per row: count all = every digit; count on (+) = in each column every digit but the
 * largest (the pupil says the largest and counts on); count back (−) = the bottom digit; × = the
 * bottom (one-digit) factor.
 */
export function touchColumns(rows, T, op, mode) {
    const pad = (s) => [...String(s).padStart(T, ' ')];
    const grid = rows.map(pad);
    const out = grid.map(() => Array(T).fill(false));
    if (!mode) return out;
    const o = opKey(op);
    if (o === '/') return out;
    for (let c = 0; c < T; c++) {
        const col = grid.map((r) => r[c]);
        const has = col.map((ch) => /[0-9]/.test(ch));
        if (mode === 'all') { has.forEach((h, r) => { out[r][c] = h; }); continue; }
        if (o === '-' || o === '*') { const r = rows.length - 1; out[r][c] = has[r]; continue; }
        // + count on: say the largest digit in the column, touch the others.
        let big = -1;
        col.forEach((ch, r) => { if (has[r] && (big < 0 || Number(ch) > Number(col[big]))) big = r; });
        has.forEach((h, r) => { out[r][c] = h && r !== big; });
    }
    return out;
}

/** The overlay options for a digit printed at `pt` points (or px on screen). */
export const touchOpts = (em, unit = 'pt', ink = 'solid', photocopy = false) => ({ em, unit, ink, label: false, photocopy: !!photocopy });

/**
 * One digit track's span with the digit AS a touch numeral (touchdots.js): the touch numeral
 * replaces the plain digit in place, same width and baseline, so the cell never moves.
 */
export function touchDigit(ch, on, o) {
    if (!on || !/^[0-9]$/.test(String(ch))) return null;
    return `<span>${touchNumeralHTML(ch, o)}</span>`;
}

/** A whole number, one span per digit, with touch dots when `on` (equation sentences, screen). */
export function touchNumberHTML(n, on, o) {
    const s = String(n);
    if (!on) return s;
    return [...s].map((ch) => touchNumeralHTML(ch, o)).join('');
}

/** Can this digit size carry dots? (24 pt paper, 40 px screen, SUPPORTS.md §S1.6.) */
export const touchFits = (size, unit) => touchDotsFits(size, unit);

/* ------------------------------------------------------------------ what an item can draw */

/**
 * The pane payload read off a template payload: `{op, a, b}` for a calculation, the rounding
 * payload as it is, `{n, steps}` for counting. null when no pane applies.
 */
export function panePayloadOf(p, template) {
    if (!p || typeof p !== 'object') return null;
    if (p.kind === 'round' && Number.isFinite(Number(p.n))) return { kind: 'round', n: Number(p.n), place: Number(p.place) };
    if (template === 'counters' || template === 'k2-count') {
        const n = Number(p.n ?? p.count);
        return Number.isFinite(n) ? { n, kind: 'count', steps: COUNT_STEPS } : null;
    }
    const ops = Array.isArray(p.operands) ? p.operands : null;
    const a = ops ? ops[0] : p.a, b = ops ? ops[1] : p.b;
    const op = opKey(p.op);
    if (!op || !Number.isFinite(Number(a)) || !Number.isFinite(Number(b))) return null;
    return { op, a: Number(a), b: Number(b) };
}

/** A counting checklist (the steps pane on a count-the-objects cell): no number, no answer. */
export const COUNT_STEPS = Object.freeze(['Point to each.', 'Count each once.', 'Say the last one.', 'Write it.']);
/**
 * The checklist a support strip carries beside a problem: the S4 steps, cut to about 13 characters a
 * line so the strip (about 40 mm at S) stands BESIDE a column problem in a two-column cell
 * instead of under it. Print verbs, one action a line (P-5).
 */
export const SUPPORT_STEPS = Object.freeze({
    '+': Object.freeze(['Ones first.', 'Add down.', 'Regroup tens.', 'Next column.']),
    '-': Object.freeze(['Ones first.', 'Top smaller?', 'Regroup.', 'Subtract.']),
    '*': Object.freeze(['Ones first.', 'Multiply.', 'Regroup tens.', 'Next column.']),
    '/': Object.freeze(['Divide.', 'Multiply.', 'Subtract.', 'Bring down.']),
    round: Object.freeze(['Find the place.', 'Look next door.', '5 or more: up.', 'Write it.']),
});

/** Can a template payload draw support `id`? */
export function canDraw(id, p, template) {
    if (TOUCH_IDS.includes(id)) {
        if (!['fact', 'stack', 'equation'].includes(template)) return false;
        const op = opKey(p && p.op);
        if (!op) return false;
        // An across fact / equation with a missing number: dots on a given number still help.
        return true;
    }
    const pp = panePayloadOf(p, template);
    if (!pp) return false;
    if (CUE_IDS.includes(id)) {
        if (!['fact', 'equation', 'stack'].includes(template) || !pp.op) return false;
        if (template === 'stack' && Array.isArray(p.operands) && p.operands.length > 2) return false;
        const { a, b, op } = pp;
        if (id === 'think') return op === '/';
        if (id === 'array' && op === '/' && p.supports && p.supports.arrayFrame) return true;
        if (id === 'array' && op === '/' && p.arrayFrame) return true;
        if (id === 'array' && op === '/') return !!(PANES.array && PANES.array.accepts(pp));
        if (id === 'skip' || id === 'array') return op === '*' || op === '/';
        return (op === '+' || op === '-') && a <= 20 && b <= 20;
    }
    const P = PANES[id];
    return !!(P && P.accepts(pp));
}

/**
 * Do this item's numbers QUALIFY for a support (coverage 'needed')? A support is needed where
 * counting is real work: + / − a counted number of 3 or more, × both factors 3 or more, ÷ a
 * quotient of 3 or more, a column that regroups, a count of 6 or more. Everything else qualifies.
 */
export function needs(id, p, template) {
    const pp = panePayloadOf(p, template);
    if (!pp) return true;
    if (pp.kind === 'count') return pp.n >= 6;
    if (pp.kind === 'round') return true;
    const { a, b, op } = pp;
    if (template === 'stack') {
        const ops = (Array.isArray(p.operands) ? p.operands : [a, b]).map(Number);
        const cols = Math.max(...ops.map((x) => String(x).length));
        for (let c = 0; c < cols; c++) {
            const d = ops.map((x) => Math.floor(x / 10 ** c) % 10);
            if (op === '+' && d.reduce((s, x) => s + x, 0) >= 10) return true;
            if (op === '-' && d[0] < d[1]) return true;
        }
        return false;
    }
    if (op === '+') return Math.min(a, b) >= 3;
    if (op === '-') return b >= 3;
    if (op === '*') return Math.min(a, b) >= 3;
    if (op === '/') return b ? a / b >= 3 : false;
    return true;
}

/* ------------------------------------------------------------------ drawing round the problem */

const CANON = ['boxsign', 'startarrow', ...CUE_IDS, 'touch', 'touchall'];
const order = (ids) => ids.slice().sort((x, y) => {
    const ix = CANON.indexOf(x), iy = CANON.indexOf(y);
    return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy) || String(x).localeCompare(String(y));
});

/** The tally row's size in mm (its SVG is in em of the digit size). */
const tallyFoot = (n, ctx) => {
    const pt = Math.max(24, (ctx.metrics && ctx.metrics.digitPt) || 28);
    const em = pt * 25.4 / 72;
    const m = /width:([\d.]+)em;height:([\d.]+)em/.exec(touchTallySVG(n, { em: pt, unit: 'pt' })) || [];
    return { wMm: (Number(m[1]) || 2) * em, hMm: (Number(m[2]) || 1) * em + 0.5, placements: ['beside', 'under'] };
};

/**
 * The ÷ tally-dot row, sized in CSS em of a wrapper at the page's digit size, so its dots are the
 * fact's own single touch dots. Its length is the section's (`supports.tally`), never the quotient.
 */
const tallyHtml = (n, ctx) => {
    const screen = ctx.mode === 'screen';
    const pt = Math.max(24, (ctx.metrics && ctx.metrics.digitPt) || 28);
    return `<div class="ws-td-tallyrow" data-ws-tally="${n}" style="font-size:${screen ? '40px' : `${pt}pt`};line-height:1;padding-top:0.5mm">`
        + touchTallySVG(n, { em: screen ? 40 : pt, unit: screen ? 'px' : 'pt' }) + '</div>';
};

// The S4 pane that draws a P11 cue (owner, 2026-09-25: the pane versions, whose crosses sit on
// white-edged counters, replace the old cue drawing). A cue a pane cannot draw keeps factCue.
const CUE_PANE = Object.freeze({ tile: ['dice', 'tenframe'], frame: ['tenframe'] });
// A support attached to a problem is drawn one preset smaller than the page (the pupil's own
// problem stays the biggest thing in the cell): pictures at M (their touch floors hold, §S4.2),
// the marks and the checklist at S. The problem itself is the matching number sentence, so the
// pane's own sentence is left off.
const PANE_SIZE = (id, size) => (size === 'S' ? 'S' : EXTRA_IDS.includes(id) ? 'S' : 'M');
const EXTRA_IDS = ['boxsign', 'startarrow', 'steps', 'round-mark'];
const MM_RE = /width="([\d.]+)mm" height="([\d.]+)mm"/;

function paneOf(id, pp0, ctx, twin) {
    const P = PANES[id];
    const pp = id === 'steps' && pp0 && !pp0.steps ? { ...pp0, steps: SUPPORT_STEPS[pp0.kind === 'round' ? 'round' : pp0.op] } : pp0;
    if (!P || !pp || !P.accepts(pp)) return null;
    const pctx = { size: PANE_SIZE(id, ctx.size), twin, ink: 'black', sentence: false };
    return { html: P.draw(pp, pctx), foot: P.footprint(pp, pctx), place: null };
}

function pieceOf(id, p, template, ctx) {
    const pp = panePayloadOf(p, template);
    const twin = ctx.mode === 'screen';
    if (TOUCH_IDS.includes(id)) {
        if (opKey(p.op) !== '/') return null;          // overlay on the digits: no piece
        const n = Number(p.supports && p.supports.tally) || 10;
        return { html: tallyHtml(n, ctx), foot: tallyFoot(n, ctx), place: null };
    }
    if (CUE_IDS.includes(id)) {
        if (!pp || !pp.op) return null;
        // Subtraction's crossed-out counters use the panes (white-edged crosses, owner 2026-09-25);
        // addition keeps the compact cue, which has no crosses to clutter.
        // ÷: the old array cue drew the quotient as its row count (it gave the answer away); the
        // S4 array pane draws the dividend's counters loose, to be ringed (answer-free, §S4.2).
        const panes = pp.op === '-' ? CUE_PANE[id] || [] : pp.op === '/' && id === 'array' ? ['array'] : [];
        // (facts card F2: a ÷ fact whose section offers the array - every dividend 50 or less, print-sheet.js - draws the
        // TRUE array, landscape since the owner's 2026-11-13 ruling - the divisor's rows of the quotient's dots - in the
        // section's one frame `supports.arrayFrame`)
        const af = pp.op === '/' && id === 'array' && p.supports && p.supports.arrayFrame;
        if (af) {
            // (critic r5 R5-4: at S the dots take a 2.25 mm pitch, so the S page holds a 4th row of arrays - S denser than M;
            // facts card §5.9, landscape: at M and L the dots grow into the cell's width - ARRAY_PITCH_MM; a screen host
            // draws paper M's frame, scaled to its digit)
            const pitch = ARRAY_PITCH_MM[twin ? 'M' : (ctx && ctx.size) || 'M'] || ARRAY_PITCH_MM.M;
            const cp = { a: pp.a, b: pp.b, op: '/', cue: 'array', frame: Object.assign({}, af, { pitch }) };
            // (facts card §5.9, owner 2026-11-13: on screen the landscape array follows the cell's digit, its dots
            // SCREEN_ARRAY_SCALE x paper's dot-to-digit ratio - bigger, never smaller than the print dot - capped by the cell)
            const html = factCueOf(cp, twin, twin ? SCREEN_CUE_DIGIT_MM / SCREEN_ARRAY_SCALE : 0);
            const m = MM_RE.exec(factCueOf(cp, false)) || [];
            return html ? { html: `<div class="ws-factcue">${html}</div>`, foot: { wMm: Number(m[1]) || 16, hMm: Number(m[2]) || 38, placements: ['beside', 'under'] }, place: null } : null;
        }
        if (pp.op === '/' && id === 'array') {
            const pane = paneOf('array', pp, ctx, twin);
            return pane;                                   // null: this ÷ fact has no answer-free array
        }
        for (const pid of panes) {
            const pane = paneOf(pid, pp, ctx, twin);
            if (pane) return pane;
        }
        // (facts card F3: a ÷ skip strip runs to the section's top multiple, the tally length - 10 or 12 - never the quotient)
        const cp = { a: pp.a, b: pp.b, op: pp.op, cue: id, ...(id === 'skip' && pp.op === '/' ? { n: Number(p.supports && p.supports.tally) || 12 } : {}) };
        // (a × array on screen follows the cell's digit like the ÷ array, facts card §5.10)
        // (SCREEN-CUE-SIZE: a × skip strip follows the digit at paper's ratio as the ÷ one does)
        const cue = factCueOf(cp, twin, twin && (pp.op === '/' || pp.op === '*') && (id === 'skip' || id === 'think') ? SCREEN_CUE_DIGIT_MM
            : twin && id === 'array' ? SCREEN_CUE_DIGIT_MM / SCREEN_ARRAY_SCALE : 0);
        if (!cue) return null;
        const m = MM_RE.exec(factCueOf(cp, false)) || [];
        const foot = { wMm: Number(m[1]) || 40, hMm: Number(m[2]) || 12, placements: ['beside', 'under'] };
        return { html: `<div class="ws-factcue">${cue}</div>`, foot, place: null };
    }
    return paneOf(id, pp, ctx, twin);
}

// fact.js registers itself and imports this module, so the cue drawing is handed in at load
// (installCueDrawer) rather than imported (no import cycle).
let factCueOf = () => '';
const twin0 = (ctx) => !!ctx && ctx.mode === 'screen';
// (SIZE-INK, facts card §5.10: a screen cue is never under its print size - one CSS mm per paper mm, 96 / 25.4 px - where the
// old 3.4 px / mm drew tiles, frames, skip strips and arrays at 90 % of paper)
export function installCueDrawer(fn) { if (typeof fn === 'function') factCueOf = (p, twin, digitMm = 0) => fn(p, twin ? { px: SCREEN_PX_PER_MM, digitMm } : {}); }
const SCREEN_PX_PER_MM = 96 / 25.4;
// A ÷ fact's skip strip and think box on screen follow the cell's digit at paper's ratio (lf-ops div_facts screen critic
// r1 D3): paper draws them beside a 24 pt (8.47 mm) fact digit.
const SCREEN_CUE_DIGIT_MM = 24 * 25.4 / 72;
// The ÷ landscape array on screen (facts card §5.9): its dots this many times paper's ratio to the fact digit (capped by the cell: max-width 100 %).
const SCREEN_ARRAY_SCALE = 1.7;
// The ÷ landscape array's dot pitch on paper by size (mm; facts card §5.9: "as large as the cell width allows", and never
// under the old 2.6 mm print dot): its frame is 12 columns wide at most (the 12s band) - 35.8 / 43.0 / 57.4 mm at S / M / L.
const ARRAY_PITCH_MM = Object.freeze({ S: 2.6, M: 3.2, L: 4.4 });
// ... and the columns that give that frame its width (a 3-column cell holds ~49 mm inside its pads, a 2-column L cell ~79 mm):
// the frame is never shrunk to fit the cell (max-width), it is given the cell it needs.
const ARRAY_MAX_COLS = Object.freeze({ S: 3, M: 3, L: 2 });

/**
 * Wrap a problem's HTML with the supports its payload carries. `problemWMm` / `problemHMm` are
 * the problem's own footprint (for choosing beside or under). `ctx.columns` is the page's column
 * count when known.
 */
export function withSupports(problemHtml, p, template, ctx = {}, { problemWMm = 40, problemHMm = 30, ghostHtml = '' } = {}) {
    const s = supportsOf(p);
    if (!s) return problemHtml;
    const ids = order([...new Set([...s.on, ...s.reserve])]);
    const cols = Number(ctx.columns) || 0;
    const cellWMm = cols ? 186 / cols - 6.6 : 186 - 6.6;
    // ROWS. Supports that clash never share a problem, so the cells of a section carry one of them
    // or another (supports.js alternativesOf). They share ONE row, laid over each other, so a cell
    // keeps room for the tallest of them, not for their sum; a support that stacks with everything
    // has a row of its own.
    const alts = alternativesOf(ids);
    const free = alts.length ? ids.filter((x) => alts.every((a) => a.includes(x))) : ids;
    const rowOf = (id) => {
        if (free.includes(id)) return `f:${id}`;
        for (const a of alts) { const c = a.filter((x) => !free.includes(x)); const r = c.indexOf(id); if (r >= 0) return `c:${r}`; }
        return `f:${id}`;
    };
    const groups = { 'over-ones': new Map(), before: new Map(), beside: new Map(), under: new Map() };
    // Lane D R4 prep (slot-clip PG-12, div_facts fade packet at L): the sign box stands BEFORE the problem and the beside
    // group starts 2 mm in, so a picture fits beside only when the sign box, its gap and that inset fit too (the 85 mm
    // ÷ counters beside "144 ÷ 12 =" with the sign box ran 4.5 mm out of a full-width cell).
    // Critic laned-restart r4 R4-4 (boxsign Test L: 132 ÷ 12 alone in a full-width row): the sign box stands BEFORE a ÷
    // fact only when the fact's answer line, which then stands beside the fact, fits the cell too; else it goes under, as
    // in the narrower cells of the section. (Before, the box stood before "132 ÷ 12 = ____" in a two-column cell and ran
    // 5 mm out of it, so the fact counted as full-width only and was split off the grid it fits at three columns.)
    const divLineW = template === 'equation' && opKey(p.op) === '/' ? blankWidth(Number(p.digits) || 2, ctx.size) : 0;
    const placeOf = (pc) => {
        const pl = pc.place || placePane(pc.foot, { problemWMm, cellWMm, problemHMm });
        return pl === 'before' && divLineW && problemWMm + divLineW + 6 + PANE_GAP_MM + pc.foot.wMm > cellWMm ? 'under' : pl;
    };
    let beforeW = 0;
    for (const id of ids) { const pc = pieceOf(id, p, template, ctx); if (pc && pc.foot && placeOf(pc) === 'before') beforeW = Math.max(beforeW, pc.foot.wMm + PANE_GAP_MM); }
    for (const id of ids) {
        const piece = pieceOf(id, p, template, ctx);
        if (!piece) continue;
        let place = piece.place;
        // Beside the problem whenever the cell is wide enough (the cell grows to the taller of the
        // two, never to their sum), else under it; the sign and the arrow have their own places.
        if (!place) {
            const pl = piece.foot.placements || ['beside', 'under'];
            place = placeOf(piece);
            if (pl.includes('beside') && problemWMm + PANE_GAP_MM + piece.foot.wMm <= cellWMm) place = 'beside';
            // (facts card F2: the framed array beside a ÷ fact keeps the beside group's 2 mm inset clear of the cell's edge)
            if (place === 'beside' && id === 'array' && s.arrayFrame && problemWMm + 5 + PANE_GAP_MM + piece.foot.wMm + 2.5 > cellWMm) place = 'under';
            // (a ÷ fact's footprint counts its answer line UNDER it - equation.js - but beside a picture in a full-width
            // cell the line stands beside the fact, so the line is counted too; the beside group's inset clears the tab)
            const lineW = template === 'equation' && opKey(p.op) === '/' ? blankWidth(Number(p.digits) || 2, ctx.size) : 0;
            if (place === 'beside' && (beforeW || lineW) && problemWMm + lineW + beforeW + 6 + PANE_GAP_MM + piece.foot.wMm > cellWMm) place = 'under';
            if (!place) place = 'under';
        }
        const shown = s.on.includes(id);
        const html = shown
            ? `<div class="ws-support" data-ws-support-on="${id}" style="grid-area:1 / 1">${piece.html}</div>`
            : `<div class="ws-support-reserve" data-ws-support-reserve="${id}" aria-hidden="true" style="grid-area:1 / 1;visibility:hidden">${piece.html}</div>`;
        const row = rowOf(id);
        if (!groups[place].has(row)) groups[place].set(row, []);
        groups[place].get(row).push(html);
    }
    // Critic r3 R3-1: beside a ÷ fact, the row of one fixed height (the think cue) comes first and the
    // overlaid pictures (tally / skip count / array, whose height follows the fact) after it, so the
    // think cue stands at one place in every cell of the section, never pushed down by a tall array.
    if (opKey(p.op) === '/' && !twin0(ctx)) {
        const m = groups.beside;
        const fixed = (e) => (e[1].some((h) => /data-ws-support-(on|reserve)="think"/.test(h)) ? 0 : 1);
        groups.beside = new Map([...m.entries()].sort((x, y) => fixed(x) - fixed(y)));
    }
    // One row: its pieces overlaid in one grid cell (only one of them is ever drawn).
    // (critic laned-restart r4 H13-INK: a row that overlays clashing supports - the touch tally or the skip strip - keeps
    // the tallest one's room; the shorter one stands at the row's FOOT, so the room it leaves is inside the cell, between
    // its supports, never an empty band under the cell's last ink)
    const rows = (m, j = 'center') => [...m.values()].map((list) => `<div class="ws-support-row" style="display:grid;justify-items:${j};align-items:${list.length > 1 ? 'end' : 'start'}">${list.join('')}</div>`);
    groups['over-ones'] = rows(groups['over-ones']);
    groups.before = rows(groups.before);
    // R3-1: beside a ÷ fact on paper, each support starts at the zone's left edge (one x per section).
    const besideLeft = opKey(p.op) === '/' && !twin0(ctx) && groups.beside.size > 0;
    groups.beside = rows(groups.beside, besideLeft ? 'start' : 'center');
    groups.under = rows(groups.under);
    const twin = ctx.mode === 'screen';
    const fixedZone = !twin && opKey(p.op) === '/' && groups.beside.length > 0;
    // Critic r3 R3-1: on paper, a ÷ fact with supports beside it holds ONE fact zone for the section:
    // the widest fact of its set (144 ÷ 12, handed in by registry.js) drawn unseen under the item's own,
    // which is left-anchored over it. With the sign box's zone before it, the fact, its answer line and
    // the supports beside stand at one x in every cell, whichever supports a cell draws.
    const ghost = fixedZone && ghostHtml
        ? `<div class="ws-fact-zone" style="display:grid;justify-items:end;align-items:start"><div style="grid-area:1 / 1">${problemHtml}</div>`
            + `<div class="ws-fact-zone-ghost" aria-hidden="true" style="grid-area:1 / 1;visibility:hidden">${ghostHtml.replace(/data-ws-slot=/g, 'data-ws-ghost-slot=').replace(/data-ws-([a-z-]*)="/g, (m, k) => (k === 'ghost-slot' ? m : `data-ws-ghost-${k}="`))}</div></div>`
        : '';
    let html = ghost || problemHtml;
    if (groups['over-ones'].length) html = attachPane(html, groups['over-ones'].join(''), 'over-ones', { twin });
    if (groups.before.length) html = attachPane(html, `<div style="display:flex;flex-direction:column;gap:2mm">${groups.before.join('')}</div>`, 'before', { twin });
    if (fixedZone && groups.before.length) html = html.replace(/(data-ws-pane-place="before" style="[^"]*?)justify-content:center;/, '$1justify-content:flex-start;');
    if (groups.beside.length) {
        html = attachPane(html, `<div style="display:flex;flex-direction:column;gap:${PANE_GAP_MM}mm">${groups.beside.join('')}</div>`, 'beside', { twin });
        // A picture beside the problem may differ in width from cell to cell (an array of 3 x 4 and
        // one of 9 x 7), so on paper the pair starts at the cell's left, not its centre: the
        // problem and its answer zone stand in the same place in every cell (SCC-T10).
        if (!twin) html = html.replace('data-ws-pane-place="beside" style="display:flex;', 'data-ws-pane-place="beside" style="display:flex;box-sizing:border-box;width:100%;align-self:stretch;padding-left:2mm;').replace(/(data-ws-pane-place="beside" style="[^"]*?)justify-content:center;/, '$1justify-content:flex-start;');
    }
    if (groups.under.length) html = attachPane(html, `<div style="display:flex;flex-direction:column;align-items:center;gap:2mm">${groups.under.join('')}</div>`, 'under', { twin });
    const wide = !twin && groups.beside.length ? ' style="align-self:stretch;width:100%"' : '';
    return html === problemHtml || html === ghost ? problemHtml : `<div class="ws-supported" data-ws-supports="${s.on.join(' ')}"${wide}>${html}</div>`;
}

/** Does a supports spec add anything round the problem (so the cell must be measured)? */
export function addsSpace(p, template) {
    const s = supportsOf(p);
    if (!s) return false;
    return [...s.on, ...s.reserve].some((id) => (TOUCH_IDS.includes(id) ? opKey(p.op) === '/' : true));
}

/** The widest piece drawn round a problem (mm), so a footprint can cap its columns. */
export function widestPaneMm(p, template, size = 'L') {
    const s = supportsOf(p);
    if (!s) return 0;
    let w = 0;
    for (const id of [...s.on, ...s.reserve]) {
        const piece = pieceOf(id, p, template, { size, mode: 'print', metrics: null });
        if (piece && piece.foot) w = Math.max(w, piece.foot.wMm);
    }
    return w;
}

/**
 * A template's footprint with its supports: touch dots on a fact need a digit of 24 pt or more,
 * so the fact ladder stops at 6 columns (SUPPORTS.md §S1.6); a support drawn round the problem
 * makes the cell MEASURED (its real height) and no narrower than its widest pane.
 */
export function supportFootprint(fp, p, template, ctx = {}) {
    if (!supportsOf(p) || !fp) return fp;
    let out = fp;
    if (template === 'fact' && touchMode(p)) out = Object.assign({}, out, { maxCols: Math.min(out.maxCols || 10, 6) });
    if (!addsSpace(p, template)) return out;
    const paneW = widestPaneMm(p, template, ctx.size) || 0;
    const w = Math.max(out.wMm || 0, paneW);
    const cap = Math.max(1, Math.floor(186 / (paneW + 6.6)));
    // Lane D R4 prep (H13-ROW, div_facts array S/M/L): the ÷ counters to ring are the dividend in rows
    // of ten, 1 to 6 rows tall with the fact, and none at all where the dividend passes 60. Stacked
    // UNDER the fact in two columns they paired a 5-row cell with a 2-row or a picture-less one, and
    // the row was sized for a taller item than its other cell held. They stand BESIDE the fact only:
    // the cell is as wide as fact + gap + counters, so each such problem has a row of its own height
    // (the practice roles split the picture-less facts into columns of their own).
    const s = supportsOf(p);
    const pp = panePayloadOf(p, template);
    // (facts card F2: the true array in its section frame is a narrow column of dots - the generic measured cell below)
    if (pp && pp.op === '/' && s && s.on.includes('array') && !s.arrayFrame) {
        const piece = pieceOf('array', p, template, { size: ctx.size, mode: 'print', metrics: null });
        // (hardCap: a measured cell's cap is otherwise the widest grid it measured as fitting - under the fact)
        if (piece && piece.foot) return Object.assign({}, out, { wMm: Math.ceil(w), hMm: out.hMm, measure: true, factLike: false, hardCap: true,
            maxCols: Math.max(1, Math.min(out.maxCols || 10, cap, 4, Math.floor(186 / ((fp.wMm || 0) + PANE_GAP_MM + piece.foot.wMm + 6.6)))) });
    }
    // Critic laned-restart r4 R4-1 (div_facts touch S / M, boxsign S / L Independent: cells a third empty, H13): a ÷ fact's
    // measured height already holds its supports and pads, so its rows keep the Test's 1.05 room over it (test.js), not the
    // practice 1.2 - touch S / M prints 3 x 5 = 15, as the Test of the same support does.
    const room = pp && pp.op === '/' ? { denseRoom: 1.05 } : {};
    // (facts card §5.9: the landscape ÷ array takes the columns its frame needs at this size, ARRAY_MAX_COLS)
    const arrCap = pp && pp.op === '/' && s && s.on.includes('array') && s.arrayFrame ? ARRAY_MAX_COLS[ctx.size] || ARRAY_MAX_COLS.L : 10;
    return Object.assign({}, out, { wMm: Math.ceil(w), hMm: out.hMm, measure: true, factLike: false, maxCols: Math.min(out.maxCols || 10, cap, 4, arrCap), ...(arrCap < 10 ? { hardCap: true } : {}) }, room);
}

// Every template's render and footprint go through the registry, which draws the supports round
// the problem once this module has loaded (fact.js, stack.js and equation.js import it).
installSupportDrawer({ withSupports, supportsOf, footprint: supportFootprint });
