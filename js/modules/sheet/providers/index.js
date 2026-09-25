// js/modules/sheet/providers/index.js
// The real skill providers (SKILL_CELL_CONTRACT.md section 3). Importing this module registers
// every one of them exactly once through `registerSkill`; `sheet/index.js` imports it, so any
// code that reaches the kit through its barrel sees them.
//
// One file per family. Each provider supplies, for the role composers:
//   strings        (ref) -> {iCan, instruction, instructionKey, instructionVars?, steps, say, oralFrame}
//   workedSteps    (q)   -> [{text, marks: [{slot, value}]}]      the worked example, 3-6 steps
//   wrongAnswer    (q)   -> {value, display, misconception, slot, slots, explain} | null
//   misconceptions       the ids wrongAnswer may return
//   stories        (q, {seed}) -> Story | null                     where operands allow a story
//
// Pure modules (SCC-01): no window, no DOM, no Math.random.

import './addition.js';
import './subtraction.js';
import './multiplication.js';
import './division.js';
import './k2.js';
import './time-money.js';
import './function-table.js';
import './countby.js';
import './pv.js';
import './word-work.js';
import './fractions.js';
import './nl-place.js';
// O6 lane AP2 round 3: thermometer, ruler, bar graph and perimeter (sheet/cells/figures.js).
import './figures.js';

export { storiesFor, STORY_NOUNS, STORY_NAMES, STORY_TEMPLATES, nounFor } from './stories.js';
export { columnAdd, lineSteps } from './addition.js';
export { longDivision } from './division.js';
export { pvRoundingErrors, PV_PROVIDER_IDS } from './pv.js';
export { FIGURE_PROVIDER_IDS, inchText } from './figures.js';

/** The 24 skills re-graded on 2026-09-25, each of which now has a real provider. */
export const REGRADED_SKILLS = Object.freeze([
    'addition:add_facts', 'addition:add', 'addition:add_column_multi', 'addition:add_sub_fact_family',
    'addition:cloze_addition', 'addition:number_line_add', 'addition:add_wp_10', 'comparing:compare_groups',
    'composing:number_bonds', 'composing:base10_build', 'composing:hundreds_chart_fill', 'composing:ten_frame_build',
    'counting:count_objects', 'counting:number_seq_fill', 'division:div_facts', 'division:long_div_2digit',
    'division:div_remainders', 'division:share_into_groups', 'multiplication:area_model_mult',
    'multiplication:arrays_groups', 'multiplication:mult_facts', 'multiplication:mult_chart',
    'subtraction:subtract', 'subtraction:sub_5_pictures',
]);
