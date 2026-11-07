// js/modules/sheet/lesson-arch/array.js
// ARCHETYPE PLUG-IN "array" (the detailed lesson maker, lesson 3a: turn an array, 3.OA.B.5): the arrays-turn payload and the
// cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

/** An arrays-turn payload's {rows, cols} (detailed lesson 3a), else null. */
export const arrTurnOf = (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'arrays-turn' && c.payload; return p ? { rows: Number(p.rows), cols: Number(p.cols) } : null; };

/** The named cases of an array lesson. */
export const CASES = Object.freeze({
    // The detailed lesson maker, lesson 3a (turn an array, 3.OA.B.5): an arrays-turn payload.
    // arrTurn: non-square, no repeated digit across rows, cols and product (which 3 was which?).
    arrTurn: (it) => { const p = arrTurnOf(it); return !!p && p.rows !== p.cols && p.rows >= 2 && p.cols >= 2 && new Set(`${p.rows}${p.cols}${p.rows * p.cols}`).size === `${p.rows}${p.cols}${p.rows * p.cols}`.length; },
    // (any non-square array: the pack's other pictured items - only five arrays to 5 x 5 pass arrTurn)
    arrNonSq: (it) => { const p = arrTurnOf(it); return !!p && p.rows !== p.cols && p.rows >= 2 && p.cols >= 2; },
    arrSquare: (it) => { const p = arrTurnOf(it); return !!p && p.rows === p.cols && p.rows >= 2; },
    arrFive: (it) => { const p = arrTurnOf(it); return !!p && p.rows !== p.cols && (p.rows === 5 || p.cols === 5); },
    // (a facts-only turn that asks for the factor: 6 x [ ] = 24)
    arrFactor: (it) => { const c = it && it.q && it.q.cell; return !!arrTurnOf(it) && CASES.arrNonSq(it) && c.payload.type === 'missing' && c.payload.ask === 'factor'; },
    arrProduct: (it) => { const c = it && it.q && it.q.cell; return !!arrTurnOf(it) && CASES.arrNonSq(it) && c.payload.type === 'missing' && c.payload.ask !== 'factor'; },
    // (a facts-only square that asks for the factor: 9 x [ ] = 81 - the product alone would be a giveaway)
    arrSquareFactor: (it) => { const c = it && it.q && it.q.cell; return CASES.arrSquare(it) && c.payload.type === 'missing' && c.payload.ask === 'factor'; },
    arrEdge: (it) => CASES.arrSquare(it) || CASES.arrFive(it),
    arrAny: (it) => !!arrTurnOf(it),
    // (the chart's example: plain digits and at most 4 by 4)
    arrTurnSmall: (it) => CASES.arrTurn(it) && CASES.arrSmall(it),
    // (Practice 1, lesson 3a: every place a square, 2 rows of 5 or 5 rows; its last row a big square and 5 rows)
    arrNoSmall: (it) => { const p = arrTurnOf(it); return !!p && (p.rows === p.cols || p.rows === 5 || (p.rows === 2 && p.cols === 5)); },
    arrBigSquare: (it) => { const p = arrTurnOf(it); return !!p && p.rows === p.cols && p.rows >= 4; },
    arrFiveRows: (it) => { const p = arrTurnOf(it); return !!p && p.rows === 5 && p.cols !== 5; },
    // (4 rows of 5 or 5 rows of 4: the widest array - a lesson sheet's second Guided cell)
    arrFourFive: (it) => { const p = arrTurnOf(it); return !!p && p.rows * p.cols === 20; },
    // (a non-square array at most 4 by 4: two of them and their turns stack on a lesson sheet)
    arrSmall: (it) => { const p = arrTurnOf(it); return !!p && CASES.arrNonSq(it) && p.rows <= 4 && p.cols <= 4; },
    // (lesson 3a r2: the pack's six non-square arrays to 5 x 5 are spent once each (LR-5, critic D6): the chart and
    // Guided cell 1 two of 2 x 3, 2 x 4, 3 x 4 (both products; the first factor never 4, n2), Guided cell 2 4 x 5 (the
    // known fact in three boxes - the Practice 1 response, D2), Practice 1 the rest and the 5s)
    arrBothChart: (it) => { const p = arrTurnOf(it); return !!p && it.q.cell.payload.type === 'both' && CASES.arrTurnSmall(it) && p.rows !== 4; },
    arrSmallBoth: (it) => { const p = arrTurnOf(it); return !!p && it.q.cell.payload.type === 'both' && CASES.arrSmall(it) && p.rows !== 4; },
    arrKnownG: (it) => { const p = arrTurnOf(it); return !!p && it.q.cell.payload.type === 'known' && p.rows * p.cols === 20; },
    // (Practice 1, critic D1: row 1 two non-squares - one with no 5, and 2 rows of 5 -, the last row the one square,
    // 4 x 4, and 5 rows of 3: the 5s spent where they teach)
    // (r4, critic r2 m1: row 1 2 x 4 and 3 x 5 - no first factor twice in a row -, the last row 4 x 4 and 5 rows of 2)
    arrP1: (it) => { const p = arrTurnOf(it); return !!p && ((CASES.arrNonSq(it) && p.rows !== 5 && p.cols !== 5) || (p.rows === 3 && p.cols === 5) || (p.rows === 5 && p.cols === 2) || CASES.arrBigSquare(it)); },
    // (Practice 2, lesson 3a r2, critic D6: no factor 2 - the Prerequisite Check's x 2 facts)
    arrP2: (it) => { const p = arrTurnOf(it); return !!p && p.rows >= 3 && p.cols >= 3; },
    // (exit c, lesson 3a r2, critic D4: the missing factor of a non-square fact with no factor 2)
    arrFactorP2: (it) => CASES.arrFactor(it) && CASES.arrP2(it),
    arrProductP2: (it) => { const p = arrTurnOf(it); return CASES.arrProduct(it) && CASES.arrP2(it) && p.rows !== 4; },
    // (exit a, lesson 3a r2: a known fact with no arrays - nothing to recount)
    arrKnownBare: (it) => { const p = arrTurnOf(it); return !!p && CASES.arrNonSq(it) && it.q.cell.payload.type === 'known' && it.q.cell.payload.draw === 'none' && p.rows >= 3 && p.cols >= 3; },
    // (P5, lesson 3a r2, critic D5: 5 rows of 6-9 - a count by 5 - and the turned fact's missing factor)
    arrWpTurn: (it) => { const p = arrTurnOf(it); return !!p && CASES.arrFactor(it) && p.rows === 5 && p.cols >= 6; },
    // (a Prerequisite Check array, lesson 3a r2: a square - the pack's few non-square arrays are the lesson's)
    arrGridSquare: (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'arrays' && c.payload; return !!p && Number(p.rows) === Number(p.cols); },
});

export default { CASES, arrTurnOf };
