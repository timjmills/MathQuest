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

import { touchDotsSVG, touchTallySVG, touchDotsFits } from './touchdots.js';
import { PANES, placePane, attachPane, PANE_GAP_MM } from './cells/panes/index.js';
import { TOUCH_IDS, CUE_IDS, alternativesOf } from './supports.js';
import { installSupportDrawer } from './registry.js';

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
export const touchOpts = (em, unit = 'pt', ink = 'solid') => ({ em, unit, ink, label: false });

/** One digit span with its touch dots: the digit, then the overlay; the span is `position:relative`. */
export function touchDigit(ch, on, o) {
    if (!on || !/^[0-9]$/.test(String(ch))) return null;
    return `<span class="ws-td" data-ws-touch="1">${ch}${touchDotsSVG(ch, o)}</span>`;
}

/** A whole number, one span per digit, with touch dots when `on` (equation sentences, screen). */
export function touchNumberHTML(n, on, o) {
    const s = String(n);
    if (!on) return s;
    return [...s].map((ch) => (/[0-9]/.test(ch) ? `<span class="ws-td" data-ws-touch="1">${ch}${touchDotsSVG(ch, o)}</span>` : ch)).join('');
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
        if (pp.op === '/' && id === 'array') {
            const pane = paneOf('array', pp, ctx, twin);
            return pane;                                   // null: this ÷ fact has no answer-free array
        }
        for (const pid of panes) {
            const pane = paneOf(pid, pp, ctx, twin);
            if (pane) return pane;
        }
        const cue = factCueOf({ a: pp.a, b: pp.b, op: pp.op, cue: id }, twin);
        if (!cue) return null;
        const m = MM_RE.exec(factCueOf({ a: pp.a, b: pp.b, op: pp.op, cue: id }, false)) || [];
        const foot = { wMm: Number(m[1]) || 40, hMm: Number(m[2]) || 12, placements: ['beside', 'under'] };
        return { html: `<div class="ws-factcue">${cue}</div>`, foot, place: null };
    }
    return paneOf(id, pp, ctx, twin);
}

// fact.js registers itself and imports this module, so the cue drawing is handed in at load
// (installCueDrawer) rather than imported (no import cycle).
let factCueOf = () => '';
export function installCueDrawer(fn) { if (typeof fn === 'function') factCueOf = (p, twin) => fn(p, twin ? { px: 3.4 } : {}); }

/**
 * Wrap a problem's HTML with the supports its payload carries. `problemWMm` / `problemHMm` are
 * the problem's own footprint (for choosing beside or under). `ctx.columns` is the page's column
 * count when known.
 */
export function withSupports(problemHtml, p, template, ctx = {}, { problemWMm = 40, problemHMm = 30 } = {}) {
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
    for (const id of ids) {
        const piece = pieceOf(id, p, template, ctx);
        if (!piece) continue;
        let place = piece.place;
        // Beside the problem whenever the cell is wide enough (the cell grows to the taller of the
        // two, never to their sum), else under it; the sign and the arrow have their own places.
        if (!place) {
            const pl = piece.foot.placements || ['beside', 'under'];
            place = placePane(piece.foot, { problemWMm, cellWMm, problemHMm });
            if (pl.includes('beside') && problemWMm + PANE_GAP_MM + piece.foot.wMm <= cellWMm) place = 'beside';
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
    // One row: its pieces overlaid in one grid cell (only one of them is ever drawn).
    const rows = (m) => [...m.values()].map((list) => `<div class="ws-support-row" style="display:grid;justify-items:center;align-items:start">${list.join('')}</div>`);
    groups['over-ones'] = rows(groups['over-ones']);
    groups.before = rows(groups.before);
    groups.beside = rows(groups.beside);
    groups.under = rows(groups.under);
    let html = problemHtml;
    const twin = ctx.mode === 'screen';
    if (groups['over-ones'].length) html = attachPane(html, groups['over-ones'].join(''), 'over-ones', { twin });
    if (groups.before.length) html = attachPane(html, `<div style="display:flex;flex-direction:column;gap:2mm">${groups.before.join('')}</div>`, 'before', { twin });
    if (groups.beside.length) {
        html = attachPane(html, `<div style="display:flex;flex-direction:column;gap:${PANE_GAP_MM}mm">${groups.beside.join('')}</div>`, 'beside', { twin });
        // A picture beside the problem may differ in width from cell to cell (an array of 3 x 4 and
        // one of 9 x 7), so on paper the pair starts at the cell's left, not its centre: the
        // problem and its answer zone stand in the same place in every cell (SCC-T10).
        if (!twin) html = html.replace('data-ws-pane-place="beside" style="display:flex;', 'data-ws-pane-place="beside" style="display:flex;box-sizing:border-box;width:100%;align-self:stretch;padding-left:2mm;').replace(/(data-ws-pane-place="beside" style="[^"]*?)justify-content:center;/, '$1justify-content:flex-start;');
    }
    if (groups.under.length) html = attachPane(html, `<div style="display:flex;flex-direction:column;align-items:center;gap:2mm">${groups.under.join('')}</div>`, 'under', { twin });
    const wide = !twin && groups.beside.length ? ' style="align-self:stretch;width:100%"' : '';
    return html === problemHtml ? html : `<div class="ws-supported" data-ws-supports="${s.on.join(' ')}"${wide}>${html}</div>`;
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
    return Object.assign({}, out, { wMm: Math.ceil(w), hMm: out.hMm, measure: true, factLike: false, maxCols: Math.min(out.maxCols || 10, cap, 4) });
}

// Every template's render and footprint go through the registry, which draws the supports round
// the problem once this module has loaded (fact.js, stack.js and equation.js import it).
installSupportDrawer({ withSupports, supportsOf, footprint: supportFootprint });
