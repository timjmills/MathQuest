// js/modules/sheet/roles/independent.js
// THE INDEPENDENT PAGE (design/PAGE_TYPES.md 2.4): "you do" with a clear stopping point - six
// items in the 2 x 3 grid, fewer for long algorithms (2 x 2), more only for one-symbol answers
// (2 x 4 / 2 x 5 / 2 x 8), full-width rows for wide pictures and word problems.
//
//   Look       I Can (PT-LOOK-1): quiet letters a. b. c. that run on across the lesson's
//              Independent pages (CL-12), hairline cells in one 1.5 pt frame (CL-1).
//   Header     Name, Date, Score /N (N = every scored cell on the sheet, PT-FRM-4), the strand
//              tab [Level N | strand | Lesson n] (PT-FRM-5, PT-FRM-9) and the "I Can" title.
//   Body       one library instruction per section (BD-10), then the grid (PG-10).
//   Footer     skill id(s) · grade · CCSS - page n/N - Form A · seed (HD-30).
//   Level      structural supports only (PT-IND-2, scaffold level 1).
//
// `plan(input)` returns a PagePlan; `renderPageAndKey(plan)` (answer-key.js) renders the pupil
// page and its facsimile key from it, or `render(plan)` below adds the 17.1 data-ws-* hooks.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import { composePractice, renderPlan } from './practice.js';

export const ROLE_ID = 'independent';

/**
 * @param {Object} input
 * @param {Object[]} input.items     generated items: `{q}` or the host's rich form (practice.js)
 * @param {Object[]} [input.skills]  {categoryId, skillId, label, grade, iCan?, instructionKey?, ccss?}
 * @param {Object[]} [input.sections] [{columns: 'auto'|N, instructionKey?}] - items carry `section`
 * @param {Object} [input.ctx]       {look, size, paper, photocopySafe, availableWidthMm}
 * @param {Object} [input.header]    {name, date, score, tab, title, titleLines} - false hides a part
 * @param {string} [input.form]      'A'
 * @param {number|string} [input.seed]
 * @param {number} [input.lesson]    the n of "Lesson n" on the tab
 * @param {'letter'|'tab'|'none'} [input.labels]   the dialog's label override (CL-20)
 */
export function plan(input = {}) {
    return composePractice(ROLE_ID, input);
}

/** Pupil pages and key pages, with the data-ws-* hooks. */
export const render = (p, opts) => renderPlan(p, opts);

export default { ROLE_ID, plan, render };
