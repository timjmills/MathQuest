// js/modules/sheet/lesson-arch/grid.js
// ARCHETYPE PLUG-IN "grid" (the detailed lesson maker, lesson 4: even products, 3.OA.D.9): a mult-grid shading window - its
// rows and columns, two windows that share a box, and the cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

/** Two mult-grid windows that share a box, a turned box counted (lesson 4 critic r1 D5): never on one page. */
export const winBoxes = (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'mult-grid' && c.payload; const o = new Set();
    if (p && Array.isArray(p.rows) && Array.isArray(p.cols)) for (const r of p.rows) for (const k of p.cols) o.add(`${Math.min(r, k)},${Math.max(r, k)}`); return o; };
export const winShare = (x, y) => { const A = winBoxes(x); if (!A.size) return false; for (const b of winBoxes(y)) if (A.has(b)) return true; return false; };
/** A mult-grid window's {rows, cols} (detailed lesson 4), else null. */
export const multGridOf = (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'mult-grid' && c.payload; if (!p || !Array.isArray(p.rows) || !Array.isArray(p.cols)) return null; const g = { rows: p.rows.map(Number), cols: p.cols.map(Number) }; return g.rows.concat(g.cols).every((v) => v >= 2 && v <= 12) ? g : null; };
// (no 1 and no 10 in a lesson 4 window: x 1 is the other number, x 10 ends in 0 - both give the parity away)

/** The named cases of a multiplication-grid lesson. */
export const CASES = Object.freeze({
    // The detailed lesson maker, lesson 4 (even products, 3.OA.D.9): a mult-grid shading window.
    // chartMixed: even and odd rows AND even and odd columns (every case on one window).
    // (lesson 4 r3: the chart example stays on the 2-9 chart; the Check Question shows the 11 / 12 rows first, critic r1 D3)
    chartExample: (it) => CASES.chartMixed(it) && CASES.chartIn9(it) && CASES.chartOddOdd(it),
    chartEleven: (it) => { const p = multGridOf(it); return !!p && CASES.chartMixed(it) && p.rows.concat(p.cols).some((v) => v >= 11); },
    // (the ★★★ last row, critic r1 D5: the "tens digit decides" trap - two even products with an odd tens digit, 36 56 72 -
    // or an odd x odd product of 35 or more; the rows above hold neither)
    // (r4, lead ruling: a REAL trap - even products in the 30s, 50s, 70s or 90s; 12 or 16 is no trap, every window holds one)
    chartTrap: (it) => { const p = multGridOf(it); if (!p) return false; const pr = [...new Set(p.rows.flatMap((r) => p.cols.map((c) => r * c)))]; return pr.filter((v) => v % 2 === 0 && v >= 30 && Math.floor(v / 10) % 2 === 1).length >= 2; },
    // (the row-only mistake shows on it: an odd row's even box whose product no even row holds)
    chartRowOnly: (it) => { const p = multGridOf(it); if (!p) return false; const er = new Set(p.rows.filter((r) => r % 2 === 0).flatMap((r) => p.cols.map((c) => r * c)));
        return p.rows.some((r) => r % 2 === 1 && p.cols.some((c) => c % 2 === 0 && !er.has(r * c))); },
    chartEdge: (it) => CASES.chartTrap(it) || CASES.chartBigOdd(it),
    chartIn9: (it) => { const p = multGridOf(it); return !!p && p.rows.concat(p.cols).every((v) => v <= 9); },
    // (an exit / Check Question window, lesson 4 r3: the 10 row may show there - the pool of fresh windows needs it)
    // (an exit / Check Question window, lesson 4 r2: fresh windows need the 11 and 12 rows - no 1, no 10; the 2-9 chart
    // is spent by the lesson's own pages. The rule is the same; the numbers are new: transfer.)
    // (products to 100 on the lesson pages; an exit / Check Question window may reach 12 x 12 - its products are printed)
    // (a Practice window, lesson 4 r3: 2-12, the 10 row allowed, products to 100 - six windows that share no box need the room)
    chartTo100: (it) => { const p = multGridOf(it); return !!p && Math.max(...p.rows) * Math.max(...p.cols) <= 100; },
    chartFresh: (it) => { const p = multGridOf(it); return !!p && !p.rows.concat(p.cols).includes(10) && Math.max(...p.rows) * Math.max(...p.cols) <= 100; },
    chartMixed: (it) => { const p = multGridOf(it); return !!p && [p.rows, p.cols].every((l) => l.some((v) => v % 2 === 0) && l.some((v) => v % 2 === 1)); },
    // evenColOnly: more odd rows than even ones, so most even products come from an even COLUMN (the Critical Atom).
    evenColOnly: (it) => { const p = multGridOf(it); return !!p && CASES.chartMixed(it) && p.rows.filter((v) => v % 2 === 1).length > p.rows.filter((v) => v % 2 === 0).length; },
    // chartOddOdd: an odd x odd box whose product is two-digit (both 3 or more: 3 x 7 = 21, not 1 x 9).
    chartOddOdd: (it) => { const p = multGridOf(it); return !!p && p.rows.some((r) => r % 2 === 1 && r >= 3 && p.cols.some((c) => c % 2 === 1 && c >= 3 && r * c >= 10)); },
    // chartBigOdd: an odd x odd product of 55 or more (7 x 9 = 63, 11 x 5) - the ★★★ last row.
    chartBigOdd: (it) => { const p = multGridOf(it); return !!p && p.rows.some((r) => r % 2 === 1 && p.cols.some((c) => c % 2 === 1 && r * c >= 55)); },
    // chartColsOdd: more odd columns than even ones, so most even products come from an even ROW.
    // chartColsEven: more even columns than odd ones (2 x 3: even-odd-even) - the odd row's even boxes carry it.
    chartColsEven: (it) => { const p = multGridOf(it); return !!p && CASES.chartMixed(it) && p.cols.filter((v) => v % 2 === 0).length > p.cols.filter((v) => v % 2 === 1).length; },
    chartColsOdd: (it) => { const p = multGridOf(it); return !!p && CASES.chartMixed(it) && p.cols.filter((v) => v % 2 === 1).length > p.cols.filter((v) => v % 2 === 0).length; },
});

export default { CASES, winBoxes, winShare, multGridOf };
