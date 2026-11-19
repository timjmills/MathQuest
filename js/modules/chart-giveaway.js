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
export const cwKey = (c) => `cw:${c.rows.join('.')}:${c.cols.join('.')}:${c.gaps.join('.')}`;
const cwParse = (k) => { const [, r, c, g] = k.split(':'); const L = (x) => (x ? x.split('.').map(Number) : []); return { rows: L(r), cols: L(c), gaps: L(g) }; };
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
        if (same) { if (twin) return true; continue; }
        if (a.gaps.some((n) => cwPrints(b, n)) || b.gaps.some((n) => cwPrints(a, n))) return true;
    }
    return false;
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
    let q = gen(0);
    for (let k = 1; k < tries && q && seen.size && chartGivesAway(q, seen, { same: true }); k++) q = gen(k) || q;
    return q;
}
