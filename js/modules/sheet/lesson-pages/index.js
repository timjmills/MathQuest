// js/modules/sheet/lesson-pages/index.js
// THE LESSON PAGE BUILDERS (design/LESSON_LIBRARY_PLAN.md §8c, owner ruling 2026-09-26: "merge
// these types"): one design per page job, used by the lesson packet and by any skill's Practice /
// Quiz paper. The archetype of the skill decides only how its worked example is drawn
// (sheet/lesson-arch/*); these builders are the same for every archetype.
//
//   chart.js          the anchor chart (was: Worked example / scripted Model)
//   prereq-check.js   the lesson's opening check of its prerequisites (was: Warm-up / pre-skill check)
//   we-do.js          the We Do band (was: Guided)
//   practice.js       the practice page and its step strip (was: Independent / More practice)
//   mixed.js          the mixed page (was: Review / Mixed practice)
//   vocab.js          the Vocabulary match and the Remember strip
//   common.js         the shared pieces
//
// What a skill supplies to them: design/SKILL_CELL_CONTRACT.md §3.9. Pure modules (SCC-01).

export * as chart from './chart.js';
export * as prereqCheck from './prereq-check.js';
export * as weDo from './we-do.js';
export * as practice from './practice.js';
export * as mixed from './mixed.js';
export * as vocab from './vocab.js';
export * as common from './common.js';
