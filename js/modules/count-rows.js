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
/** Counting down from a typed start: fewer than this many numbers fit before 0, so the start is raised. */
export const DOWN_MIN = 3;
export const DOWN_LIFT = 8;

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

/** The numbers one row shows: `n` of them (12 or 15), fewer when a typed down start runs out before 0. */
export function rowValues(row, n) {
    const t = row.step;
    if (row.dir !== 'down') {
        const a0 = row.start === 'zero' ? 0 : row.start === 'custom' ? row.at : t;
        return Array.from({ length: n }, (_, i) => a0 + t * i);
    }
    if (row.start === 'custom') {
        let top = row.at;
        let m = Math.min(n, Math.floor(top / t) + 1);
        if (m < DOWN_MIN) { top = (DOWN_LIFT - 1) * t + (top % t); m = DOWN_LIFT; }   // too short: raise the start, keeping its ones
        return Array.from({ length: m }, (_, i) => top - t * i);
    }
    const hi = row.start === 'zero' ? n - 1 : n;            // from the end of the table down, or down to 0
    return Array.from({ length: n }, (_, i) => t * (hi - i));
}

/** What a page of these rows is about: its steps (in order, once each), its way, and a shared typed start. */
export function rowsSummary(rows) {
    const list = normalizeRows(rows);
    const steps = [];
    for (const r of list) if (!steps.includes(r.step)) steps.push(r.step);
    const downs = list.filter((r) => r.dir === 'down').length;
    const dir = !list.length || !downs ? 'up' : downs === list.length ? 'down' : 'mixed';
    const froms = [...new Set(list.map((r) => (r.start === 'custom' ? r.at : null)))];
    const from = list.length && froms.length === 1 && froms[0] !== null ? froms[0] : null;
    return { steps, dir, from, count: list.length };
}

/* ------------------------------------------------------------------ one page */
// "All 12 tables on one page" with rows chosen prints THOSE rows once each, in order, on one page at
// size S in compact form. The page holds twelve single-line rows; a row of wide numbers wraps to two
// or more lines (the same geometry as sheet/cells/count-row.js at S, compact), so the list is cut
// where the lines run out. The estimate is the cell's own arithmetic, kept in step with it.

const S_PITCH = 13.5, S_GAP = 1, S_LIVE = 178, S_TAB = 12, S_MIN_BOX = 11;
const fmtLen = (n) => Number(n).toLocaleString('en-US').length;

/** How many lines one row takes on the one-page sheet. */
export function rowLines(row, n = 12) {
    const values = rowValues(row, n);
    const chars = Math.max(1, ...values.map(fmtLen));
    const tabText = (row.dir === 'down' ? 1 : 0) + fmtLen(row.step);
    const tab = Math.max(S_TAB, tabText * 0.6 * Math.min(16 * 0.64 * 1.05 * 1, 20) * 0.3528 + 7) + 2;
    const wide = Math.max(0, chars - 3) * 3;
    const len = values.length;
    const fitPitch = (S_LIVE - tab + S_GAP) / len;
    if (fitPitch - S_GAP >= S_MIN_BOX + wide) return 1;
    const boxW = S_PITCH - S_GAP + wide;
    let perRow = Math.ceil(len / 2);
    const fitN = Math.max(1, Math.floor((S_LIVE - tab + S_GAP) / (boxW + S_GAP)));
    if (fitN < perRow) perRow = Math.ceil(len / Math.ceil(len / fitN));
    return Math.ceil(len / perRow);
}

export const ONE_PAGE_LINES = 12;

/** The rows the one-page sheet prints: the list in order, until its lines run out (at least one row). */
export function onePageRows(rows) {
    const out = [];
    let used = 0;
    for (const r of normalizeRows(rows)) {
        const l = rowLines(r);
        if (out.length && used + l > ONE_PAGE_LINES) break;
        out.push(r);
        used += l;
    }
    return out;
}
