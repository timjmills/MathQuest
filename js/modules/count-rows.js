// count-rows.js — the ROW LIST of "Count by 1-12" (multiplication:count_by_tables), wave 1 lane C2.
//
// Owner (2026-10-02): "You should be able to select which count-bys you want on a page, in addition
// to where they start etc. - also custom ones as well." The teacher builds the page's rows: any of
// the tables 1 to 12 and any typed step, each with its own start and direction. One option, `rows`,
// holds the list; the page deals the rows in order (or shuffled), repeating the list when the page
// has more rows than were chosen. An EMPTY list is the skill's old behaviour (the tables 1 to 12).
//
// A row: { step, start, at?, dir }
//   step   1 .. 100,000, the number counted by
//   start  'step'   the row begins at the step (3, 6, 9 ...); counting down it runs from 12 x step to the step
//          'zero'   begins at 0 (0, 3, 6 ...); counting down it ends on 0
//          'custom' begins at `at` (0 .. 1,000,000): count by 5 from 3 is 3, 8, 13 ...
//   dir    'up' | 'down'. Down never goes below 0 (no negative numbers).
//
// Pure module: no window, no DOM, no state. skill-options.js, the codec and the generator import it.

export const ROW_MAX = 12;           // rows in the list
export const STEP_MAX = 100000;
export const AT_MAX = 1000000;

const num = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : NaN; };

/** One row, made legal (or null when it cannot be). */
export function normalizeRow(r) {
    if (!r || typeof r !== 'object') return null;
    const step = num(r.step);
    if (!(step >= 1)) return null;
    const out = { step: Math.min(STEP_MAX, step), start: 'step', dir: r.dir === 'down' ? 'down' : 'up' };
    if (r.start === 'zero') out.start = 'zero';
    else if (r.start === 'custom') {
        const at = num(r.at);
        out.start = 'custom';
        out.at = Number.isFinite(at) ? Math.min(AT_MAX, Math.max(0, at)) : 0;
    }
    return out;
}

/** The list, made legal: an array of at most ROW_MAX normalised rows ([] for anything else). */
export function normalizeRows(v) {
    let list = v;
    if (typeof v === 'string') { try { list = JSON.parse(v); } catch (e) { list = null; } }
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const r of list) { const n = normalizeRow(r); if (n) out.push(n); if (out.length >= ROW_MAX) break; }
    return out;
}

/** A plain table row: the times table 1 to 12, counting on from its first multiple. */
export const isPlainRow = (r) => !!r && r.start === 'step' && r.dir === 'up' && r.step >= 1 && r.step <= 12;

/* ------------------------------------------------------------------ the share-code form */
// Letters and digits only (a payload is A-Z 0-9 and "_"): rows are joined by "R"; a row is its step,
// then "Z" (start at 0) or "C" + the typed start, then "D" when it counts down.
//   [{step:2,start:'zero'},{step:5,start:'custom',at:3},{step:25,start:'custom',at:100,dir:'down'}] -> "2ZR5C3R25C100D"

export function encodeRows(rows) {
    return normalizeRows(rows).map((r) => `${r.step}${r.start === 'zero' ? 'Z' : r.start === 'custom' ? `C${r.at}` : ''}${r.dir === 'down' ? 'D' : ''}`).join('R');
}

export function decodeRows(body) {
    const out = [];
    for (const part of String(body || '').toUpperCase().split('R')) {
        const m = /^(\d+)(?:(Z)|C(\d+))?(D)?$/.exec(part);
        if (!m) continue;
        const row = { step: Number(m[1]), start: m[2] ? 'zero' : m[3] !== undefined ? 'custom' : 'step', dir: m[4] ? 'down' : 'up' };
        if (m[3] !== undefined) row.at = Number(m[3]);
        const n = normalizeRow(row);
        if (n) out.push(n);
        if (out.length >= ROW_MAX) break;
    }
    return out;
}

/* ------------------------------------------------------------------ the numbers of a row */

/**
 * The start a counting-back row really uses. Every row holds the full 12 (or 15) numbers, so a typed down start that
 * cannot give that many without going below 0 is raised to the smallest start that can, keeping its ones digit
 * (12 down by 5 -> 57: 57, 52 ... 2). Returns the start the row uses; equal to `row.at` when nothing was raised.
 */
export function downStart(row, n = 12) {
    const t = row.step;
    const need = (n - 1) * t;
    return row.at >= need ? row.at : need + (row.at % t);
}

/** The numbers one row shows: always `n` of them (12, or 15 on the long line), never below 0. */
export function rowValues(row, n) {
    const t = row.step;
    if (row.dir !== 'down') {
        const a0 = row.start === 'zero' ? 0 : row.start === 'custom' ? row.at : t;
        return Array.from({ length: n }, (_, i) => a0 + t * i);
    }
    if (row.start === 'custom') {
        const top = downStart(row, n);
        return Array.from({ length: n }, (_, i) => top - t * i);
    }
    const hi = row.start === 'zero' ? n - 1 : n;            // from the end of the table down, or down to 0
    return Array.from({ length: n }, (_, i) => t * (hi - i));
}

/** What a page of these rows is about: its steps (in order, once each), its way, and a shared typed start. */
export function rowsSummary(rows, n = 12) {
    const list = normalizeRows(rows);
    const steps = [];
    for (const r of list) if (!steps.includes(r.step)) steps.push(r.step);
    const downs = list.filter((r) => r.dir === 'down').length;
    const dir = !list.length || !downs ? 'up' : downs === list.length ? 'down' : 'mixed';
    // the start a row really prints: a back row raised to give n numbers names the raised start (downStart)
    const froms = [...new Set(list.map((r) => (r.start === 'custom' ? (r.dir === 'down' ? downStart(r, n) : r.at) : null)))];
    const from = list.length && froms.length === 1 && froms[0] !== null ? froms[0] : null;
    return { steps, dir, from, count: list.length };
}

/* ------------------------------------------------------------------ one page */
// "All rows on one page" keeps the compact sheet (owner 2026-10-02): every row is a single line of 12 numbers at size S, so
// the page holds twelve lines. A row whose widest number cannot be written on one line even at the 9 pt floor (more than six
// characters, "100,000") takes two lines of six. With rows chosen the sheet prints those rows in order and starts the list again until its
// twelve lines are full; with none chosen it is the tables x 1 to x 12. The test below is the cell's own arithmetic
// (sheet/cells/count-row.js, compact), kept in step with it.

const S_LIVE = 178, S_GAP = 1, S_TAB = 12, FLOOR = 9;
const fmtLen = (n) => Number(n).toLocaleString('en-US').length;

/** How many lines one row takes on the one-page sheet: 1, or 2 when its numbers are too wide for one line at the floor. */
export function rowLines(row, signed = false, n = 12) {
    const values = rowValues(row, n);
    const chars = Math.max(1, ...values.map(fmtLen));
    if (chars <= 3) return 1;
    const tabLen = fmtLen(row.step) + (signed ? 1 : 0);
    const tab = (tabLen <= 2 ? S_TAB : Math.max(S_TAB, tabLen * 0.6 * Math.min(16 * 1.05, 20) * 0.3528 + 7)) + 2;
    const pitch = (S_LIVE - tab + S_GAP) / values.length;
    const pt = Math.min(16, 18, (pitch - S_GAP - 2) / (0.56 * Math.max(2, chars)) * 72 / 25.4);
    return pt >= FLOOR ? 1 : 2;
}

/** The page holds this many single-line rows (A4 and Letter alike: twelve compact lines fit both). */
export const ONE_PAGE_LINES = 12;
/** A row of two lines of six takes this many single-line rows of height (measured on the sheet). */
export const TWO_LINE_UNITS = 2.5;
/** The tables the one-page sheet prints when no rows are chosen. */
export const ONE_PAGE_ITEMS = 12;
/** Usable body height (mm) the one-page sheet's rows share, a little under the shorter paper's (Letter). */
/** Height (mm) of one compact single-line row on the sheet, and the air a mixed page keeps round every row. */
export const NATURAL_MM = 19.5;
export const MIXED_PAD_MM = 2.2;
export const ONE_PAGE_BODY_MM = 225;
let _bodyMm = ONE_PAGE_BODY_MM;
/** The sheet tells the generator the paper's body height (A4 225, Letter 207) so a short list's spread fits the page it prints on. */
export function setOnePageBody(mm) { _bodyMm = Number(mm) > 0 ? Number(mm) : ONE_PAGE_BODY_MM; }
export const getOnePageBody = () => _bodyMm;

/**
 * "All rows on one page" with rows chosen: each chosen row ONCE, in the teacher's order, as many as fit one page. `rows` are the
 * rows printed; `cut` the chosen rows that did not fit (the panel says so); `units` the page height they use (a one-line row is 1).
 */
export function onePagePlan(rows, bodyMm = _bodyMm) {
    const list = normalizeRows(rows);
    const signed = list.some((r) => r.dir === 'down');          // the step tab carries a + / - sign when any row goes back
    const out = [];
    let used = 0;
    for (const r of list) {
        const w = rowLines(r, signed) === 1 ? 1 : TWO_LINE_UNITS;
        if (out.length && used + w > ONE_PAGE_LINES + 1e-9) break;
        out.push(Object.assign({}, r, { _w: w }));
        used += w;
    }
    // a page that mixes one-line and two-line rows keeps a little air round the one-line rows (heights within 1.6x, so nothing is regrouped
    // and the order stays the teacher's): drop the last rows until the page, with that air, still fits its paper
    const mixed = () => out.some((r) => r._w > 1) && out.some((r) => r._w === 1);
    const hmm = () => out.reduce((a, r) => a + NATURAL_MM * r._w, 0) + (mixed() ? 2 * MIXED_PAD_MM * out.length : 0);
    while (out.length > 1 && hmm() > Math.min(bodyMm, 207) + (mixed() ? 0 : 30)) out.pop();
    used = out.reduce((a, r) => a + r._w, 0);
    return { mixed: mixed(), rows: out.map((r) => { const c = { ...r }; delete c._w; return c; }), weights: out.map((r) => r._w), cut: list.length - out.length, units: used, of: list.length };
}

/** The rows the one-page sheet prints (see onePagePlan). */
export function onePageRows(rows) { return onePagePlan(rows).rows; }
