// js/modules/sheet/lesson-arch/index.js
// THE ARCHETYPE PLUG-INS of the lesson engine (design/LESSON_LIBRARY_PLAN.md §6): each archetype
// draws its worked example's states and names its cases; the lesson page builders
// (sheet/lesson-pages/*) are the same for every archetype. Certified by the sample lessons:
// column (A1, subtract), fact (A2, add), line (A3, round). The others land in Phase 1.
// Pure module (SCC-01).

import * as fact from './fact.js';
import * as column from './column.js';
import * as line from './line.js';

export { fact, column, line };

/** The archetypes built so far, by id (lessons/schema.js ARCHETYPES). */
export const ARCHS = Object.freeze({ fact, column, line });

/**
 * The named cases a lesson's examples are chosen by (lesson data `example.test`, `second.test`):
 * the chart models BOTH cases the practice pages deal (lessons r1). Every archetype's cases, in
 * one table (the lesson data names a case, never its archetype).
 */
export const CASE_TESTS = Object.freeze({
    bigFirst: fact.CASES.bigFirst,
    bigSecond: fact.CASES.bigSecond,
    zeroOnes: column.CASES.zeroOnes,
    roundDown: line.CASES.roundDown,
    roundUp: line.CASES.roundUp,
    endsFive: line.CASES.endsFive,
    double: fact.CASES.double,
    underTen: column.CASES.underTen,
    takeAwayZero: column.CASES.takeAwayZero,
    toHundred: line.CASES.toHundred,
});

export default { ARCHS, CASE_TESTS, fact, column, line };
