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

const S_LIVE = 178, S_GAP = 4.2, S_TAB = 12, FLOOR = 9;   // S_GAP: the jump-arrow gap (count-row.js COMPACT_MIN_GAP)
const fmtLen = (n) => Number(n).toLocaleString('en-US').length;

/** How many lines one row takes on the one-page sheet: 1, or 2 when its numbers are too wide for one line at the floor. */
export function rowLines(row, signed = false, n = 12) {
    const values = rowValues(row, n);
    const chars = Math.max(1, ...values.map(fmtLen));
    const tabLen = fmtLen(row.step) + (signed ? 1 : 0);
    const tab = (tabLen <= 2 ? S_TAB : Math.max(S_TAB, tabLen * 0.6 * Math.min(16 * 1.05, 20) * 0.3528 + 7)) + 2;
    // the cell's compactFit (sheet/cells/count-row.js) at its worst case (every number a box), kept in step: boxes at their
    // writing width (>= 9 mm), every gap >= S_GAP (a 2.2 mm arrow, 1 mm clear each side); digits may shrink to FLOOR (TY-10a)
    const k = values.length, avail = S_LIVE - tab, PT = 0.3528;
    const room = avail - (k - 1) * S_GAP;
    const w = room / k;
    if (w >= 9 && (w - 1.8) / (chars * 0.56 * PT) >= FLOOR) return 1;
    return 2;
}

/** The tables the one-page sheet prints when no rows are chosen. */
export const ONE_PAGE_ITEMS = 12;
/**
 * Critic C2 round 4: the cap is the MEASURED height of the rows against the paper's body, per paper. A row's cell measures
 * ROW_MM[lines] on the one-page sheet at S (its boxed cell, label and arcs, the row rule included); the paper's body is the
 * height those cells share under the header and the instruction. Both are measured on the sheet (wave1-c2-onepage asserts the
 * cap is tight: the next chosen row would make a second page, on A4 and on Letter).
 */
export const ROW_MM = { 1: 16.5, 2: 32.0 };   // re-measured 2026-10-03: the jump arrows replaced the arcs over each line
export const ONE_PAGE_BODY = { A4: 226, Letter: 208 };
export const MIX_ROW_MM = 0.6;
let _paper = 'A4';
/** The sheet tells the generator which paper it prints on (the bridge, before it deals the rows). */
export function setOnePagePaper(paper) { _paper = /letter/i.test(String(paper || '')) ? 'Letter' : 'A4'; }
export const getOnePagePaper = () => _paper;
let _bodyOverride = 0;
/** TEST ONLY (wave1-c2-onepage proves the cap is tight): lift the body height so the next chosen row is dealt too. 0 restores it. */
export function setOnePageBodyOverride(mm) { _bodyOverride = Number(mm) > 0 ? Number(mm) : 0; }

/**
 * "All rows on one page" with rows chosen: each chosen row ONCE, in the teacher's order, as many as the paper holds. `rows` are
 * the rows printed, `heights` their natural cell heights (mm), `spare` the body height left over, `cut` the chosen rows left off.
 */
export function onePagePlan(rows, paper = _paper) {
    const list = normalizeRows(rows);
    const body = _bodyOverride || ONE_PAGE_BODY[paper === 'Letter' ? 'Letter' : 'A4'];
    const signed = list.some((r) => r.dir === 'down');          // the step tab carries a + / - sign when any row goes back
    const out = [], heights = [];
    // a page that mixes one-line and two-line rows is laid out row by row ("rows sized to the problems they hold"), which adds
    // MIX_ROW_MM to every row; a page of one kind is a plain grid
    const total = (hs) => hs.reduce((a, h) => a + h, 0) + (new Set(hs).size > 1 ? MIX_ROW_MM * hs.length : 0);
    for (const r of list) {
        const h = ROW_MM[rowLines(r, signed) === 1 ? 1 : 2];
        if (out.length && total([...heights, h]) > body + 1e-9) break;
        out.push(r); heights.push(h);
    }
    const used = total(heights);
    const mixed = new Set(heights).size > 1;
    const real = ONE_PAGE_BODY[paper === 'Letter' ? 'Letter' : 'A4'];
    return { rows: out, heights, mixed, spare: Math.max(0, real - used), cut: list.length - out.length, of: list.length };
}

/** The rows the one-page sheet prints (see onePagePlan). */
export function onePageRows(rows) { return onePagePlan(rows).rows; }
