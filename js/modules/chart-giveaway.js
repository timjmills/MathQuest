// js/modules/chart-giveaway.js
// CROSS-GIVEAWAY, the one window rule of every deal (paper: print-sheet.js; screen: worksheet.js and quiz-builder.js; chart_120
// critic r1 F4 / F9 on paper, r2 N2 on the screen hosts): a chart window never prints, as a chart number, a square another
// window of the same sheet leaves empty. Layer 0: no imports, no state.

/* CROSS-GIVEAWAY (chart_120 critic r1 F4 / F9): a chart window must never print, as a chart number, a square another window
 * of the sheet leaves empty - the pupil copies the answer across. Band 120's three-rows grid and the chart to 10 have ONE
 * window, so every second window gave the first one's answers away; overlapping 3 x 5 windows could too. Each kept window is
 * recorded in the run's `seen` (`cw:` keys, so a later run of the same sheet reads it); a draw that gives an answer away
 * is passed over while tries remain; when every try still shows the SAME squares as a kept window with other gaps (a
 * one-window chart) the item is not dealt: the sheet holds the windows it can hold without giving an answer away. */
export function chartOfQ(q) {
    // (the item's window, else its chartwindow cell's payload: a quiz question keeps the cell, not `chartWindow`)
    const cp = q && q.cell && q.cell.template === 'chartwindow' && q.cell.payload;
    const w = (q && q.chartWindow) || (cp ? { rows: cp.rows, cols: cp.cols } : null);
    if (!w || !Array.isArray(w.rows) || !Array.isArray(w.cols)) return null;
    const raw = Array.isArray(q.keyParts) && q.keyParts.length ? q.keyParts : String(q.ans === undefined ? '' : q.ans).split(/\s*,\s*/);
    return { rows: w.rows.map(Number), cols: w.cols.map(Number), gaps: raw.map((x) => Number(String(x).replace(/,/g, ''))).filter(Number.isFinite) };
}
export const cwKey = (c, shows = false) => `cw:${c.rows.join('.')}:${c.cols.join('.')}:${c.gaps.join('.')}${shows ? ':s' : ''}`;
// (flags: 's' a SHOWN window - a worked Model or anchor; 'x' a window of ANOTHER run of the sheet - another page or section)
const cwParse = (k) => { const [, r, c, g, fl = ''] = k.split(':'); const L = (x) => (x ? x.split('.').map(Number) : []); return { rows: L(r), cols: L(c), gaps: L(g), shows: fl.includes('s'), ext: fl.includes('x') }; };
/** The key of `k` as a window of another run ('x'). */
export const cwExt = (k) => { const p = k.split(':'); if (p.length < 5) p.push(''); if (!p[4].includes('x')) p[4] += 'x'; return p.join(':'); };
/** Is `n` one of window `c`'s squares? (a SHOWN window - a worked Model - prints its gaps too, traced) */
const cwHas = (c, n) => c.rows.includes(Math.floor((n - 1) / 10)) && c.cols.includes((n - 1) % 10);
/** Does window `c` print `n` as a chart number (in it, and not one of its own empty squares)? */
const cwPrints = (c, n) => !c.gaps.includes(n) && c.rows.includes(Math.floor((n - 1) / 10)) && c.cols.includes((n - 1) % 10);
/**
 * Would `q` give an answer away to, or take one from, a window already kept on the sheet? `same` (the hard rule): is a
 * window of the SAME squares already kept - with other gaps it gives the answers away, with the same gaps it is the same
 * problem (GUIDED-MODEL-ECHO). Without it, an overlapping window that prints a kept window's answer counts (the dealer's
 * preference only: band 120's 30 squares cannot hold six windows that never overlap, so overlap is avoided while tries remain).
 */
export function chartGivesAway(q, seen, { same = false } = {}) {
    const a = chartOfQ(q);
    if (!a || !seen) return false;
    for (const k of seen) {
        if (typeof k !== 'string' || !k.startsWith('cw:')) continue;
        const b = cwParse(k);
        const twin = a.rows.join('.') === b.rows.join('.') && a.cols.join('.') === b.cols.join('.');
        // (a window of another page that holds the SAME gaps is the same problem again, not a giveaway: a packet of more
        // pages than band 120 has windows repeats one; a shown window, or a twin on the same run, is never repeated)
        if (twin && b.ext && !b.shows && a.gaps.join('.') === b.gaps.join('.')) continue;
        if (same) { if (twin) return true; continue; }
        // (lead ruling A13: a band-100 lesson practice rows-of-ten grid prints an EARLIER part's teaching gaps as given - asked and
        // answered there; never a gap of its own part, a shown window's, or one not yet asked, and it still never blanks a printed one)
        if (a13Given(a, b)) { if (b.gaps.some((n) => cwPrints(a, n)) && !a.gaps.some((n) => cwPrints(b, n))) continue; }
        if (a.gaps.some((n) => (b.shows ? cwHas(b, n) : cwPrints(b, n))) || (!b.shows && b.gaps.some((n) => cwPrints(a, n)))) return true;
    }
    return false;
}

/** A13: is `a` the band-100 lesson practice rows grid (3 x 10, rows 1-100) and `b` a teaching window of another part (ext, not shown)? */
function a13Given(a, b) {
    return LESSON && PAGE_GRID === 'rows' && b.ext && !b.shows && b.cols.length !== 10 && a.cols.length === 10 && a.rows.length === 3 && Math.max(...a.rows) <= 9;
}
/** The `cw:` keys of the chart windows among `items` (questions), for `chartGivesAway(q, seen)`. */
export function chartSeen(items) {
    const seen = new Set();
    for (const q of items || []) { const c = chartOfQ(q); if (c) seen.add(cwKey(c)); }
    return seen;
}
/**
 * The screen deal's rule (r2 N2): draw `gen()` until the item does not repeat the squares of a window in `others` (with other
 * gaps it prints their answers; with the same gaps it is the same problem). `tries` draws; the last draw stands when every
 * one repeats (a chart with fewer windows than the sheet has items). A non-chart item returns at once.
 */
export function dealPastWindows(gen, others, tries = 48) {
    const seen = chartSeen(others);
    const draw = (k) => { if (seen.size) setChartSheet(seen); try { return gen(k); } finally { SHEET = null; } };
    let q = draw(0);
    for (let k = 1; k < tries && q && seen.size && chartGivesAway(q, seen); k++) q = draw(k) || q;
    return q;
}

/* The sheet's kept windows, for the generator (lead ruling 2026-11-14, chart_120 r3 n1): a window dealt while a sheet is set
 * blanks every square a kept window leaves empty that falls inside it, and leaves empty no square a kept window prints - so no
 * missing value is printed anywhere else on the sheet (blank shared values consistently). The dealers set it around each
 * generate call (print-sheet.js, worksheet.js, quiz-builder.js) and clear it after; `null` outside a deal. */
let SHEET = null;
/** Set the sheet's kept windows from a `seen` set of `cw:` keys (or questions); `null` clears it. */
export function setChartSheet(seenOrItems) {
    if (!seenOrItems) { SHEET = null; return; }
    const keys = Array.isArray(seenOrItems) ? [...chartSeen(seenOrItems)] : [...seenOrItems];
    const ws = keys.filter((k) => typeof k === 'string' && k.startsWith('cw:')).map(cwParse);
    SHEET = ws.length ? ws : null;
}
/** The kept windows of the sheet being dealt ([{rows, cols, gaps}]), or null. */
export const chartSheet = () => SHEET;
/* A band-120 LESSON packet (lead ruling (a) 2026-11-14, critic blanks B2): its worked example prints five of the ten columns, so a
 * pupil window there leaves empty only the column either side of the example's - one a row, 3 a window - and the packet holds five
 * pupil windows beside its one shown window, none printing another's answer. Set by the lesson dealer, `false` elsewhere. */
let EDGE = false;
export const setChartEdge = (v) => { EDGE = !!v; };
export const chartEdge = () => EDGE;
/* The band-120 LESSON practice page's own form (lead ruling 2026-11-14 fallback, taken 2026-11-20 after critic blanks r2 R2-1):
 * N=3 windows beside the shown example left one answer column for the whole packet, so the practice page prints the three rows
 * of ten (91-120) as ONE grid, its gaps every square no other packet window prints. An internal page form set by the lesson
 * dealer around the practice part - never the pupil-chosen `grid` value, which the lesson role still hides - `null` elsewhere. */
let PAGE_GRID = null;
export const setChartPageGrid = (v) => { PAGE_GRID = v || null; };
export const chartPageGrid = () => PAGE_GRID;
/* A LESSON packet is being dealt (critic blanks r2, STEP-COVER and LESSON-TWIN on every band): its pages print the Steps band
 * (left +1, up +10, top row: down -10), so every gap keeps a neighbour one of those steps reads, and no pupil window repeats
 * another window's squares on any page. Set by buildSheet for role 'lesson', `false` elsewhere. */
let LESSON = false;
export const setChartLesson = (v) => { LESSON = !!v; };
export const chartLesson = () => LESSON;
/* Which part of a LESSON packet is being dealt - 'teach' (the teaching sheet) or 'practice' - else null (lead ruling 2026-11-20,
 * critic blanks r4 F1 / F2): band 120's Independent windows review 1-25 in disjoint columns (every 3 x 5 window on 91-120 beside
 * the example holds the same 3 gaps - a proof); band 100's teaching windows keep to rows 3-6 (21-70) so two bands of three rows
 * (1-30, 71-100) stay fresh for the practice page's rows of ten. */
let PART = null;
export const setChartPart = (v) => { PART = v || null; };
export const chartPart = () => PART;

/**
 * "Numbers to fill in" (lead ruling 2026-11-14): the most empty squares a window of R rows and C columns can legally hold -
 * never more than half its squares, no whole row empty (and no two side by side in a row, so every gap keeps a printed
 * neighbour along its row). A window that cannot hold the teacher's number holds this many, silently (the panel's help says so).
 */
export const chartGapCap = (R, C, per5 = false) => Math.max(1, Math.min(Math.floor((R * C) / 2), R * Math.min(Math.ceil(C / 2), Math.max(1, C - 2)), per5 ? R * 2 : Infinity));
// (per5: band 120's windows share one pattern repeating every five columns, so a row holds at most 2 - three in five would
// put a gap beside the next window's first one: 6 a 3 x 5 window, not 7; critic blanks B3)
/** "Numbers to fill in" when none is chosen (null, an old code): 5. */
export const CHART_TILES_DEFAULT = 5;
