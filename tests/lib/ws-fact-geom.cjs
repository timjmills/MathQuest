// ws-fact-geom — measures the fact-rows grid of a printed sheet in the browser (facts-print-fix, owner 2026-11-05: "there
// are a lack of lines and the alignment is off").
//
//   factGeomSource   the source of a function (doc) => report, to run inside the page:
//                      new Function('return ' + factGeomSource)()(iframe.contentDocument)
//   report           { pages: [{ grids, cells, rules: {...}, sign: {...}, grid: {...} }] }
//
// ROWRULES   every cell of a fact-rows grid (.ws-grid.facts) is closed on all four sides by a DRAWN rule (a border of its
//            own, its neighbour's, or the grid's frame), never by the ink background showing through a gap between white
//            cells (a gap rasterises with conflation: rules vanish or double in a PDF viewer or on a printer); every inner
//            rule is one weight.
// SIGNGAP    in every stacked fact (.ws-fact) the operator's ink ends >= 0.3 em before the ink of the bottom number's
//            first digit; the fact's ink stays >= 1 mm clear of its cell's inner edges; and in each grid column the ones
//            digits of every fact share one x (digits on a fixed column grid).
'use strict';

const factGeomSource = String(function factGeom(doc) {
    const win = doc.defaultView;
    const cv = doc.createElement('canvas').getContext('2d');
    const mmPx = 96 / 25.4;
    const inkOf = (span) => {
        const t = [...span.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!t) return null;
        const cs = win.getComputedStyle(span);
        cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const mt = cv.measureText(t.textContent);
        const rg = doc.createRange(); rg.selectNodeContents(t);
        const b = rg.getBoundingClientRect();
        return { l: b.left - mt.actualBoundingBoxLeft, r: b.left + mt.actualBoundingBoxRight, em: parseFloat(cs.fontSize), box: span.getBoundingClientRect() };
    };
    const pages = [];
    for (const pg of doc.querySelectorAll('.ws-page')) {
        const out = { grids: 0, cells: 0, rules: { gapPx: [], undrawn: 0, weights: [], open: 0 }, sign: { min: Infinity, worst: '', n: 0, clearMin: Infinity, clearWorst: '' }, grid: { misaligned: 0, worst: 0 } };
        for (const g of pg.querySelectorAll('.ws-grid.facts')) {
            out.grids++;
            const gs = win.getComputedStyle(g);
            out.rules.gapPx.push(parseFloat(gs.rowGap) || 0, parseFloat(gs.columnGap) || 0);
            const cells = [...g.children].filter((c) => c.classList.contains('ws-cell') && !c.classList.contains('blankrun'));
            const gb = g.getBoundingClientRect();
            const fw = { l: parseFloat(gs.borderLeftWidth), t: parseFloat(gs.borderTopWidth), r: parseFloat(gs.borderRightWidth), b: parseFloat(gs.borderBottomWidth) };
            const rects = cells.map((c) => c.getBoundingClientRect());
            const near = (a, b2) => Math.abs(a - b2) < 1.5;
            const onesByCol = new Map();
            cells.forEach((c, i) => {
                out.cells++;
                const cs = win.getComputedStyle(c);
                const r = rects[i];
                const bw = { l: parseFloat(cs.borderLeftWidth) || 0, t: parseFloat(cs.borderTopWidth) || 0, r: parseFloat(cs.borderRightWidth) || 0, b: parseFloat(cs.borderBottomWidth) || 0 };
                // each side: drawn by this cell, by the neighbour that shares it, or by the grid's frame
                const sideDrawn = (side) => {
                    if (bw[side] > 0) { out.rules.weights.push(bw[side]); return true; }
                    if (side === 'l' && near(r.left, gb.left + fw.l) && fw.l > 0) return true;
                    if (side === 't' && near(r.top, gb.top + fw.t) && fw.t > 0) return true;
                    if (side === 'r' && near(r.right, gb.right - fw.r) && fw.r > 0) return true;
                    if (side === 'b' && near(r.bottom, gb.bottom - fw.b) && fw.b > 0) return true;
                    // the neighbour's own rule on the shared edge
                    return rects.some((o, j) => {
                        if (j === i) return false;
                        const ocs = win.getComputedStyle(cells[j]);
                        if (side === 'r') return near(o.left, r.right) && parseFloat(ocs.borderLeftWidth) > 0 && o.top < r.bottom - 2 && o.bottom > r.top + 2;
                        if (side === 'b') return near(o.top, r.bottom) && parseFloat(ocs.borderTopWidth) > 0 && o.left < r.right - 2 && o.right > r.left + 2;
                        if (side === 'l') return near(o.right, r.left) && parseFloat(ocs.borderRightWidth) > 0;
                        if (side === 't') return near(o.bottom, r.top) && parseFloat(ocs.borderBottomWidth) > 0;
                        return false;
                    });
                };
                for (const s of ['l', 't', 'r', 'b']) if (!sideDrawn(s)) out.rules.undrawn++;
                // the stacked fact
                const f = c.querySelector(':scope > .ws-fact, :scope .ws-fact');
                if (!f) return;
                const cols = win.getComputedStyle(f).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
                const n = cols - 1;
                const kids = [...f.children];
                const A = kids.slice(1, 1 + n), op = kids[1 + n], B = kids.slice(2 + n, 2 + 2 * n);
                if (!op || !op.classList.contains('op')) return;
                const oi = inkOf(op);
                const bFirst = B.map(inkOf).find(Boolean);
                if (oi && bFirst) {
                    out.sign.n++;
                    const gap = (bFirst.l - oi.r) / oi.em;
                    if (gap < out.sign.min) { out.sign.min = gap; out.sign.worst = `${A.map((x) => x.textContent).join('').trim()} ${op.textContent} ${B.map((x) => x.textContent).join('').trim()}`; }
                }
                // clearance of the fact's ink from the cell's inner edges (left / right)
                const inks = [...A, op, ...B].map(inkOf).filter(Boolean);
                if (inks.length) {
                    const inL = r.left + bw.l, inR = r.right - bw.r;
                    const cl = Math.min(Math.min(...inks.map((x) => x.l)) - inL, inR - Math.max(...inks.map((x) => x.r))) / mmPx;
                    if (cl < out.sign.clearMin) { out.sign.clearMin = cl; out.sign.clearWorst = `${A.map((x) => x.textContent).join('').trim()} ${op.textContent} ${B.map((x) => x.textContent).join('').trim()}`; }
                }
                // the ones track's right edge, per grid column (the cell's left edge, rounded)
                const ones = (A[n - 1] || B[n - 1]);
                if (ones) {
                    const k = Math.round(r.left);
                    if (!onesByCol.has(k)) onesByCol.set(k, []);
                    onesByCol.get(k).push(ones.getBoundingClientRect().right);
                }
            });
            for (const xs of onesByCol.values()) {
                const spread = Math.max(...xs) - Math.min(...xs);
                if (spread > 0.5) out.grid.misaligned++;
                out.grid.worst = Math.max(out.grid.worst, spread);
            }
        }
        out.rules.weights = [...new Set(out.rules.weights.map((w) => Math.round(w * 100) / 100))];
        out.rules.gapPx = [...new Set(out.rules.gapPx)];
        if (!Number.isFinite(out.sign.min)) out.sign.min = null;
        if (!Number.isFinite(out.sign.clearMin)) out.sign.clearMin = null;
        pages.push(out);
    }
    return { pages };
});

/**
 * The verdicts on one report: [] when ROWRULES and SIGNGAP hold, else the failures in words.
 * `minGapEm` 0.3 (owner brief); `minClearMm` 1.75: the digits' ink clear of the cell's border (owner 2026-11-05: the 3-digit
 * dividends "crowd the box" at 10 columns with 1.55 mm; the + - x page he accepted keeps 1.9-2.1 mm).
 */
function factGeomVerdict(rep, { minGapEm = 0.3, minClearMm = 1.75 } = {}) {
    const fails = [];
    (rep.pages || []).forEach((p, i) => {
        if (!p.grids) return;
        const pn = `page ${i + 1}`;
        if (p.rules.gapPx.some((g) => g > 0) && p.rules.undrawn) fails.push(`ROWRULES ${pn}: ${p.rules.undrawn} cell sides closed only by a ${p.rules.gapPx.filter(Boolean).join('/')} px gap (no drawn rule)`);
        else if (p.rules.undrawn) fails.push(`ROWRULES ${pn}: ${p.rules.undrawn} cell sides with no rule`);
        if (p.rules.weights.length > 1) fails.push(`ROWRULES ${pn}: inner rules of ${p.rules.weights.length} weights (${p.rules.weights.join(', ')} px)`);
        if (p.sign.min !== null && p.sign.min < minGapEm) fails.push(`SIGNGAP ${pn}: "${p.sign.worst}" sign-to-number gap ${p.sign.min.toFixed(2)} em < ${minGapEm}`);
        if (p.sign.clearMin !== null && p.sign.clearMin < minClearMm) fails.push(`SIGNGAP ${pn}: "${p.sign.clearWorst}" ink ${p.sign.clearMin.toFixed(2)} mm from its cell's edge < ${minClearMm}`);
        if (p.grid.misaligned) fails.push(`SIGNGAP ${pn}: ${p.grid.misaligned} grid columns whose ones digits do not line up (spread ${p.grid.worst.toFixed(1)} px)`);
    });
    return fails;
}

module.exports = { factGeomSource, factGeomVerdict };
