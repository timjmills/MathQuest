// js/modules/sheet/lesson-arch/index.js
// THE ARCHETYPE PLUG-INS of the lesson engine (design/LESSON_LIBRARY_PLAN.md §6, §8c): each archetype draws its worked
// example's states and names its cases; the lesson page builders (sheet/lesson-pages/*) are the same for every
// archetype. Certified by the sample lessons: column (A1, subtract), fact (A2, add), line (A3, round). Built for the
// detailed lessons (js/modules/lessons/detailed/): pv (numbers to 1,000), story (bar model), array (turn an array),
// grid (even products), table (find the rule).
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import * as fact from './fact.js';
import * as column from './column.js';
import * as line from './line.js';
import * as pv from './pv.js';
import * as story from './story.js';
import * as array from './array.js';
import * as grid from './grid.js';
import * as table from './table.js';

export { fact, column, line, pv, story, array, grid, table };

/** The archetypes built so far, by id. */
export const ARCHS = Object.freeze({ fact, column, line, pv, story, array, grid, table });

/**
 * The named cases a lesson's examples, Guided cells and Independent cells are chosen by (lesson data `example.test`,
 * `second.test`, `guided`, `guidedWants`, `independent`; the detailed lessons' `want`, `edgeTest`, `caseNames`): every
 * archetype's cases in one table (the lesson data names a case, never its archetype). A case name is unique across
 * the archetypes (checked below: a clash would silently replace a case).
 */
export const CASE_TESTS = Object.freeze(Object.assign({}, ...Object.values(ARCHS).map((a) => a.CASES)));

const named = Object.values(ARCHS).reduce((n, a) => n + Object.keys(a.CASES).length, 0);
if (named !== Object.keys(CASE_TESTS).length) throw new Error('lesson-arch: two archetypes name the same case');

export default { ARCHS, CASE_TESTS, fact, column, line, pv, story, array, grid, table };
