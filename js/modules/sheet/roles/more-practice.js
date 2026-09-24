// js/modules/sheet/roles/more-practice.js
// MORE PRACTICE A TO J (design/PAGE_TYPES.md 2.5): a repetition bank for the same step, up to ten
// parallel pages. Look, anatomy and geometry are the Independent page's (2.4); what differs:
//
//   PT-MPR-1   the tab reads "Practice A" .. "Practice J"; the title is the lesson title; letters
//              restart at a. on every page, because each page is handed out alone (CL-12). So
//              every letter is a sheet of its own: full header, its own Score /N, footer 1/1.
//   PT-MPR-2   each letter is its own seed (`letterSeed(seed, letter)`), so Practice C reprints
//              identically whatever else is printed with it. The host generates each letter's
//              items under that seed and tags them `letter`; untagged items are paginated like
//              an Independent run and each page becomes the next letter.
//   PT-MPR-3   supports match the last Independent page (scaffold level 1).
//
// `plan(input)` returns a PagePlan whose `pages` hold every letter (so `renderPageAndKey` works
// on it directly) plus `sheets`, one PagePlan per letter; `render(plan)` renders letter by letter
// so each keeps its own page counter and key seed.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import { composePractice, renderPlan, letterSeed } from './practice.js';

export const ROLE_ID = 'more-practice';
export const LETTERS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);

/**
 * @param {Object} input   as `independent.plan`, plus
 * @param {string|number} [input.startLetter]  the first letter when items carry no `letter`
 */
export function plan(input = {}) {
    return composePractice(ROLE_ID, input);
}

export const render = (p, opts) => renderPlan(p, opts);

export { letterSeed };

export default { ROLE_ID, LETTERS, plan, render, letterSeed };
