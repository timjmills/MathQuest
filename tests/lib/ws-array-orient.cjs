// tests/lib/ws-array-orient.cjs - ARRAY-ORIENT (owner 2026-11-13, "arrays landscape so they can be bigger"; lead ruling for
// multiplication:arrays_groups, lane lf-ops-props r5). The same rule id and semantics as the -divarray branch's
// ws-screen-support-eq ARRAY-ORIENT: a dot array of 2 or more rows is drawn LANDSCAPE - its dots span at least as wide as they
// span high - on paper and on every screen host. Judged here on the kit's `arrays` cells (arrays_groups' array items) and any
// array a kit cell draws, EXCEPT where the item's own payload names a reading (`data-mq-reading`, written by the cell from
// payload.reading: an item that asks for "4 rows of 3") and except the `arrays-turn` pair (mult_properties: an array and its
// TURN shows both orientations by design; its split array keeps the rows the item breaks apart). Ringed equal groups
// (data-mq-ring) are groups, not an array: not judged.
//
// MEASURE_ARRAY_ORIENT(rootSel) runs IN THE PAGE: [{rows, cols, wPx, hPx, label}] for every judged array under rootSel.
function MEASURE_ARRAY_ORIENT(rootSel) {
    const out = [];
    for (const root of document.querySelectorAll(rootSel)) {
        for (const svg of root.querySelectorAll('svg')) {
            if (svg.closest('[data-ws-cell="arrays-turn"], [data-ws-ops="arrays-turn"]')) continue;
            if (svg.querySelector('[data-mq-ring]')) continue;
            if (svg.closest('[data-mq-reading]')) continue;
            const dots = [...svg.querySelectorAll('circle')].map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
            if (dots.length < 4) continue;
            const cx = [...new Set(dots.map((r) => Math.round((r.left + r.right) / 2)))];
            const cy = [...new Set(dots.map((r) => Math.round((r.top + r.bottom) / 2)))];
            // merge centres within 1.5 px (sub-pixel rounding)
            const uniq = (v) => v.sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > 1.5);
            const xs = uniq(cx), ys = uniq(cy);
            const rows = ys.length, cols = xs.length;
            if (rows * cols !== dots.length && rows * cols < dots.length) continue;   // not a grid
            const wPx = Math.max(...dots.map((r) => r.right)) - Math.min(...dots.map((r) => r.left));
            const hPx = Math.max(...dots.map((r) => r.bottom)) - Math.min(...dots.map((r) => r.top));
            out.push({ rows, cols, wPx: Math.round(wPx * 10) / 10, hPx: Math.round(hPx * 10) / 10, label: svg.getAttribute('aria-label') || '' });
        }
    }
    return out;
}
/** The verdict on one measured array: null when it passes. */
function arrayOrientVerdict(a) {
    if (!a || a.rows < 2) return null;
    return a.wPx + 0.5 >= a.hPx ? null : `a ${a.rows} x ${a.cols} dot array is drawn PORTRAIT (${a.wPx} px wide, ${a.hPx} px high): an array of 2 or more rows is landscape, the smaller factor its rows (owner 2026-11-13; "${a.label}")`;
}
module.exports = { MEASURE_ARRAY_ORIENT, arrayOrientVerdict };
