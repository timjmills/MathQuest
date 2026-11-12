// js/modules/sheet/lesson-arch/table.js
// ARCHETYPE PLUG-IN "table" (the detailed lesson maker, lesson 5: find the rule, 3.OA.D.9): a one-step find-the-rule
// function table and the cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

/** A one-step find-the-rule function table's {op, k, x1} (detailed lesson 5), else null. */
export const ftRuleOf = (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'function-table' && c.payload; if (!p || p.task !== 'rule' || !Array.isArray(p.rule) || p.rule.length !== 1 || !Array.isArray(p.rows) || p.rows.length < 3) return null; return { op: p.rule[0].op, k: Number(p.rule[0].n), x1: Number(p.rows[0].x), y1: Number(p.rows[0].y), yMin: Math.min(...p.rows.map((r) => Number(r.y))) }; };
/** Row 1 of a + table fits no taught × rule (x 2, x 5, x 10): 2 -> 10 is also x 5 (lesson 5 r3, critic D2). */
export const ftPlainFirst = (p) => ![2, 3, 5, 10].some((m) => p.x1 * m === p.y1);

/** The named cases of a function-table lesson. */
export const CASES = Object.freeze({
    // The detailed lesson maker, lesson 5 (find the rule, 3.OA.D.9): a one-step find-the-rule table.
    // + / − / × with a plain first row (+: not 1 -> 1 + k, which is also x (1 + k)); the trap:
    // a × table whose first row is k → k × k (2 → 4: + 2 or × 2), so only row 2 decides.
    ftAdd: (it) => { const p = ftRuleOf(it); return !!p && p.op === '+' && p.k >= 2 && p.k <= 10 && p.x1 >= 2 && ftPlainFirst(p); },
    ftSub: (it) => { const p = ftRuleOf(it); return !!p && p.op === '-' && p.k >= 2 && p.k <= 10 && p.y1 >= 1 && p.yMin >= 1 && p.x1 !== 2 * p.k; },
    // (any × table is the trap: its row 1 also fits a + rule, so only row 2 decides - the Critical Atom; lesson 5 r3)
    ftTimes: (it) => { const p = ftRuleOf(it); return !!p && p.op === 'x' && [2, 3, 5, 10].includes(p.k) && p.x1 >= 2; },
    ftTimesTrap: (it) => CASES.ftTimes(it),
    // (an edge of − : a row whose Out is 0)
    ftSubZero: (it) => { const p = ftRuleOf(it); return !!p && p.op === '-' && p.k >= 2 && p.k <= 10 && p.yMin === 0; },
    // (no two Ins back to back - lesson 5 r4, critic r2 n14: testing row 3 after row 2 is then a real test)
    ftSpread: (it) => { const c = it && it.q && it.q.cell; const p = c && c.template === 'function-table' && c.payload; if (!p || !Array.isArray(p.rows)) return false; const xs = p.rows.map((r) => Number(r.x)).sort((a, b) => a - b); return xs.every((v, i) => !i || v - xs[i - 1] >= 2); },
    ftEdge: (it) => CASES.ftTimes(it) || CASES.ftSubZero(it),
    ftLessonAny: (it) => CASES.ftAdd(it) || CASES.ftSub(it) || CASES.ftTimes(it),
    ftPracticeAny: (it) => CASES.ftAdd(it) || CASES.ftSub(it) || CASES.ftEdge(it),
});

export default { CASES, ftRuleOf, ftPlainFirst };
