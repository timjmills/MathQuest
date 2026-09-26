// wrm.js — every White Rose Maths (WRM) small step tied to the skills that teach it (owner request
// 2026-09-25, design/WRM_ALIGNMENT_PLAN.md: "Map each small step to our skills and to its CCSS and EE
// standards ... Add WRM tags and a coverage check that fails while any small step has no skill").
//
// Kept apart from standards.js on purpose: lanes that add SKILL_STANDARDS entries never touch this
// file, and a lane that tags WRM steps never touches that one.
//
// A pure module: no DOM, no storage. It reads the step inventory (wrm-db.js, generated from
// data/curriculum/wrm-steps.json by `node tests/scripts/ws-wrm.cjs --write-db`) and answers:
//
//   wrmFor(categoryId, skillId)       which small steps a skill teaches (fully or in part)
//   skillsForWrmStep(id)              which skills teach a small step
//   wrmCoverage()                     every step: covered, partial or gap, for the gate and report
//
// STEP IDS  <year>.B<block>.S<step>: year R (Reception = PK4), Y1 ... Y6; block = the WRM block
//           folder number within the year; step = the WRM small-step number. Y4.B1.S3 is Year 4,
//           Autumn Block 1 (Place value), Step 3 "Number line to 1,000". The school maps WRM
//           Year N to US grade N-1 (Year 1 = Kindergarten); data/curriculum/wrm-steps.json has
//           the full record (block, term, CCSS, EE, Drive file ids).
//
// THE MAP (SKILL_WRM, below)
//   key     'categoryId:skillId' of a live skill. Retired skills are not listed: they inherit
//           from the skill they alias to (skill-aliases.js).
//   value   the steps the skill teaches, in curriculum order. Each is either
//             'Y4.B1.S3'                                 the skill fully teaches the step: its key
//                                                        idea, task and vocabulary at the step's
//                                                        level (possibly with option values);
//             { step, note }                             the same, with the option values or range
//                                                        the teacher sets (note: 'constant 6');
//             { step, partial: 'what is missing' }       the skill teaches part of the step; the
//                                                        text says what the step needs that the
//                                                        skill does not give. A partial never
//                                                        counts as coverage.
//   A skill is tagged only to steps it genuinely teaches: shared CCSS codes are evidence, not proof.
//
// THE BUILD LIST (WRM_PROPOSALS, below)
//   Every step with no full-coverage skill names a proposal: a new skill (kind 'new', with its
//   proposed id) or an option on an existing skill (kind 'option'). `steps` are the gaps it would
//   close; `improves` are steps already covered that it would strengthen. When a proposal is
//   built, tag its steps in SKILL_WRM and delete the proposal (or the steps it now covers).
//
// `node tests/scripts/ws-wrm.cjs` is the gate: it fails while any small step has no full-coverage
// skill, on an unknown step id, on a key that is not a live skill, and on a gap with no proposal.

import { WRM_YEARS, WRM_BLOCKS, WRM_STEPS } from './wrm-db.js';
import { SKILL_ALIASES } from './skill-aliases.js';

export const SKILL_WRM = {
    // ---- counting
    'counting:count_objects': [
        { step: 'R.B3.S1', note: 'count to 5' },
        { step: 'R.B3.S2', partial: 'recognition at a glance (dice patterns are counted one by one, not subitised)' },
        { step: 'R.B5.S1', note: 'count to 5' },
        { step: 'R.B5.S2', partial: 'recognition at a glance' },
        { step: 'R.B7.S2', note: 'count to 5' },
        { step: 'R.B7.S3', partial: 'recognition at a glance; zero' },
        { step: 'R.B9.S1', note: 'count to 10' },
        { step: 'R.B11.S1', note: 'count to 10' },
        { step: 'Y1.B1.S2', note: 'count to 10' },
        { step: 'Y1.B1.S3', partial: 'counting out a given number from a larger group' },
        { step: 'Y1.B4.S1', note: 'count to 20' },
    ],
    'counting:count_sequence': [
        { step: 'R.B3.S4', note: 'the number after, to 10' },
        { step: 'R.B3.S5', note: 'the number before, to 10' },
        { step: 'R.B5.S4', note: 'the number after' },
        { step: 'R.B5.S5', note: 'the number before' },
        { step: 'R.B7.S5', note: 'the number after' },
        { step: 'R.B7.S6', note: 'the number before' },
        { step: 'R.B9.S3', note: 'the number after' },
        { step: 'R.B9.S4', note: 'the number before' },
        { step: 'R.B11.S5', note: 'the number after' },
        { step: 'R.B11.S6', note: 'the number before' },
        { step: 'R.B13.S2', note: 'to 20' },
        { step: 'R.B13.S4', note: 'to 20' },
        'Y1.B1.S6',
        { step: 'Y1.B1.S7', note: 'the number after' },
        { step: 'Y1.B1.S8', note: 'the number before' },
        { step: 'Y1.B1.S9', note: 'the number before' },
        { step: 'Y1.B4.S7', note: 'to 20' },
    ],
    'counting:number_seq_fill': [
        { step: 'R.B13.S2', note: 'count by 1s, to 20' },
        { step: 'R.B13.S4', note: 'count by 1s, to 20' },
        { step: 'R.B13.S5', partial: 'saying the counting sequence aloud past 20; the skill fills a written track' },
        'R.B13.S6',
        { step: 'Y1.B1.S6', note: 'count by 1s, counting on' },
        { step: 'Y1.B1.S8', note: 'counting back' },
        { step: 'Y1.B6.S1', note: 'count by 1s, to 50' },
        { step: 'Y1.B12.S1', note: 'count by 1s, to 100' },
    ],

    // ---- comparing
    'comparing:compare_groups': [
        'R.B1.S7',
        { step: 'R.B11.S2', note: 'count to 10' },
        { step: 'Y1.B1.S10', note: 'level 1: match one to one' },
        'Y1.B1.S11',
        { step: 'Y1.B1.S12', partial: 'the symbols <, > and = and the words greater than / less than' },
        { step: 'Y2.B1.S12', partial: 'comparing groups of objects to 100 (tens and ones pictures)' },
    ],
    'comparing:compare_objects': [
        { step: 'R.B2.S1', partial: 'overall size (big/small); the skill compares length, height and thickness only' },
        { step: 'R.B10.S1', note: 'length' },
        { step: 'R.B10.S2', note: 'length' },
        { step: 'R.B10.S3', note: 'height' },
        { step: 'R.B10.S4', note: 'height' },
        { step: 'Y1.B7.S1', note: 'length and height' },
        'Y2.B6.S3',
    ],
    'comparing:classify_count': [
        { step: 'R.B1.S4', partial: 'the sort itself: putting every object into its group; the skill only counts one kind' },
        { step: 'R.B1.S5', partial: 'sorting by different attributes (colour, size, kind) rather than counting one shape' },
        { step: 'Y1.B1.S1', partial: 'sorting every object into groups by a rule; the skill counts one kind' },
    ],

    // ---- composing
    'composing:number_bonds': [
        { step: 'R.B3.S6', note: 'bonds to 5' },
        { step: 'R.B5.S6', note: 'bonds to 5' },
        { step: 'R.B5.S7', note: 'bonds to 5' },
        { step: 'R.B7.S7', note: 'bonds to 5' },
        { step: 'R.B9.S5', note: 'bonds to 10' },
        { step: 'R.B11.S7', note: 'bonds to 10' },
        { step: 'R.B11.S8', note: 'bonds to 10' },
        'Y1.B2.S2',
        { step: 'Y1.B2.S5', note: 'bonds to 10' },
        { step: 'Y1.B2.S7', note: 'bonds to 10, whole = 10' },
        { step: 'Y1.B2.S11', note: 'missing part' },
        { step: 'Y1.B2.S12', note: 'missing part' },
        { step: 'Y2.B2.S1', note: 'bonds to 10' },
    ],
    'composing:make_ten': [
        'R.B11.S8',
        'Y1.B2.S7',
        { step: 'Y1.B5.S3', partial: 'bonds to 20 (make 20 fills a second ten frame; bonds like 13 + 7)' },
        'Y2.B2.S1',
    ],
    'composing:teen_compose': [
        { step: 'R.B13.S1', note: 'to 15' },
        'R.B13.S3',
        { step: 'Y1.B4.S3', note: 'to 15' },
        'Y1.B4.S4',
        'Y1.B4.S5',
        'Y2.B1.S1',
    ],
    'composing:tens_foundation_visual': [
        { step: 'Y1.B6.S2', note: 'tens to 50' },
        { step: 'Y1.B6.S3', partial: 'counting a large set by making groups of ten' },
        { step: 'Y1.B12.S2', note: 'tens to 90' },
        'Y2.B1.S3',
    ],
    'composing:hundreds_chart_fill': [{ step: 'Y1.B6.S1', note: 'numbers to 50' }, 'Y1.B12.S1'],
    'composing:ten_frame_build': [
        { step: 'R.B3.S3', note: 'count to 5' },
        { step: 'R.B5.S3', note: 'count to 5' },
        { step: 'R.B7.S4', note: 'count to 5' },
        { step: 'R.B9.S2', note: 'count to 10' },
        { step: 'R.B11.S3', note: 'count to 10' },
        { step: 'R.B11.S9', partial: 'different arrangements of 10 (5 and 5, 4 and 6) seen as the same 10' },
        { step: 'Y1.B1.S4', note: 'count to 10' },
        { step: 'Y1.B4.S2', partial: '10 as one ten (a full frame is one ten)' },
    ],
    'composing:ten_frame_build_teen': [
        'R.B13.S1',
        'R.B13.S3',
        'Y1.B4.S3',
        'Y1.B4.S4',
        'Y1.B4.S5',
        { step: 'Y1.B4.S6', partial: '20 as two full tens' },
    ],
    'composing:base10_build': [
        { step: 'Y1.B6.S4', note: 'numbers to 50' },
        { step: 'Y1.B6.S5', note: 'numbers to 50' },
        'Y1.B12.S3',
        { step: 'Y2.B1.S1', note: 'numbers to 20' },
        'Y2.B1.S3',
        'Y3.B1.S1',
        { step: 'Y3.B1.S2', partial: 'partitioning in more than one way' },
    ],
    'composing:base10_build_hundreds': [
        { step: 'Y3.B1.S4', partial: 'counting in hundreds; 100 as ten tens' },
        'Y3.B1.S5',
        'Y4.B1.S1',
    ],
    'composing:odd_even': [
        { step: 'R.B9.S6', partial: 'making pairs of objects to see odd and even; the skill names odd or even numbers' },
        { step: 'R.B11.S13', partial: 'making pairs to see odd and even' },
        { step: 'R.B16.S5', partial: 'sharing an amount between two and seeing it is fair (even) or not (odd)' },
        'Y2.B5.S12',
    ],
    'composing:select_even_odd': ['Y2.B5.S12'],
    'composing:number_word_form': [
        { step: 'Y1.B1.S5', partial: 'number words 0 to 9 (the skill starts at 10)' },
        { step: 'Y2.B1.S6', note: 'Max Number 100' },
    ],
    'composing:fraction_number_line': ['Y3.B6.S7', 'Y4.B7.S4'],
    'composing:whole_as_fraction': ['Y4.B7.S1'],
    'composing:compose_whole': [
        { step: 'Y3.B6.S4', partial: 'how many parts make one whole for any denominator' },
        'Y4.B7.S1',
    ],

    // ---- addition
    'addition:add_facts': ['Y3.B2.S1'],
    'addition:add_sub_10s': [
        { step: 'Y2.B2.S4', partial: 'bonds of tens to 100 (30 + 70) from bonds to 10' },
        'Y2.B2.S14',
        'Y3.B2.S3',
    ],
    'addition:add_sub_100s': [
        'Y3.B2.S4',
        { step: 'Y4.B2.S1', partial: 'adding and subtracting 1s, 10s, 100s and 1,000s to 4-digit numbers' },
    ],
    'addition:add_sub_fact_family': ['Y1.B2.S4', 'Y1.B2.S13', 'Y1.B5.S9', 'Y2.B2.S2'],
    'addition:number_families_add': [
        { step: 'Y1.B2.S2', partial: 'the part-whole diagram itself' },
        'Y1.B2.S4',
        'Y1.B2.S13',
        'Y1.B5.S9',
        'Y2.B2.S2',
        'Y2.B2.S3',
    ],
    'addition:add_three': [{ step: 'R.B11.S10', partial: 'three parts that make 10' }, 'Y2.B2.S7'],
    'addition:comparison_word': [
        { step: 'Y1.B5.S8', partial: 'finding the difference by comparing two bars or a number line' },
    ],
    'addition:equal_sign': [
        { step: 'Y2.B2.S20', partial: 'comparing two number sentences with <, > or = (the skill judges true/false)' },
    ],
    'addition:add_5_pictures': ['R.B9.S9', 'R.B14.S1', 'Y1.B2.S3', 'Y1.B2.S8'],
    'addition:add_10_regroup': ['Y1.B5.S2', 'Y2.B2.S6'],
    'addition:add_10_mixed': [
        'Y1.B2.S8',
        { step: 'Y1.B2.S17', partial: 'adding or subtracting only 1 or 2 (counting on or back by 1 or 2)' },
    ],
    'addition:add_20_mixed': ['Y1.B5.S1'],
    'addition:add_50_regroup': ['Y2.B2.S9'],
    'addition:add_100_no_regroup': [
        'Y2.B2.S15',
        { step: 'Y3.B2.S2', partial: 'adding and subtracting only ones to a 2- or 3-digit number mentally' },
    ],
    'addition:add_100_regroup': ['Y2.B2.S16'],
    'addition:add_1k_no_regroup': ['Y3.B2.S11'],
    'addition:add_1k_regroup': ['Y3.B2.S13', 'Y3.B2.S14'],
    'addition:add_1k_mixed': ['Y3.B2.S17'],
    'addition:add_10k_no_regroup': ['Y4.B2.S2'],
    'addition:add_10k_regroup': ['Y4.B2.S3', 'Y4.B2.S4'],
    'addition:add_100k_regroup': ['Y5.B2.S2'],
    'addition:add_1m_mixed': ['Y5.B2.S2', 'Y6.B2.S1'],
    'addition:add_wp_10': [
        'R.B9.S9',
        'R.B14.S1',
        { step: 'R.B14.S2', partial: 'finding how many were added (change unknown); the skill asks for the total' },
        'Y1.B2.S9',
        'Y1.B2.S10',
    ],
    'addition:add_wp_10_plain': ['Y1.B2.S10'],
    'addition:add_wp_100': ['Y2.B2.S19'],
    'addition:number_line_add': [
        'Y1.B2.S9',
        { step: 'Y1.B4.S9', partial: 'using the line to count on and back (the skill is addition only)' },
        'Y1.B5.S1',
        'Y2.B2.S5',
    ],
    'addition:cloze_addition': ['Y1.B5.S10', 'Y2.B2.S21'],
    'addition:fact_family_sort': ['Y1.B2.S13', 'Y2.B2.S3'],

    // ---- subtraction
    'subtraction:sub_facts': ['Y3.B2.S1'],
    'subtraction:missing_add_sub': ['Y1.B2.S12', 'Y1.B5.S10', 'Y2.B2.S21', 'Y5.B2.S8'],
    'subtraction:sub_5_pictures': ['R.B14.S3', 'Y1.B2.S3', 'Y1.B2.S14'],
    'subtraction:sub_10_regroup': ['Y1.B5.S6', 'Y2.B2.S10'],
    'subtraction:sub_10_mixed': ['Y1.B2.S15'],
    'subtraction:sub_50_regroup': [
        'Y2.B2.S12',
        { step: 'Y3.B2.S8', partial: 'subtracting ones across a ten mentally (43 − 5)' },
    ],
    'subtraction:sub_100_no_regroup': ['Y2.B2.S17'],
    'subtraction:sub_100_regroup': ['Y2.B2.S12', 'Y2.B2.S18'],
    'subtraction:sub_1k_no_regroup': ['Y3.B2.S12'],
    'subtraction:sub_1k_regroup': ['Y3.B2.S15', 'Y3.B2.S16'],
    'subtraction:sub_1k_mixed': ['Y3.B2.S18'],
    'subtraction:sub_10k_no_regroup': ['Y4.B2.S5'],
    'subtraction:sub_10k_regroup': ['Y4.B2.S6', 'Y4.B2.S7'],
    'subtraction:sub_100k_regroup': ['Y5.B2.S3'],
    'subtraction:sub_1m_mixed': ['Y5.B2.S3', 'Y6.B2.S1'],
    'subtraction:sub_wp_10': [
        'R.B14.S3',
        { step: 'R.B14.S4', partial: 'finding how many were taken away (change unknown)' },
        'Y1.B2.S15',
    ],
    'subtraction:sub_wp_100': ['Y2.B2.S19'],
    'subtraction:nl_sub': ['Y1.B2.S16', 'Y1.B5.S7'],
    'subtraction:number_line_sub': ['Y1.B2.S16', 'Y1.B5.S7', 'Y2.B2.S5'],
    'subtraction:mixed_add_sub': ['Y2.B2.S19'],
    'subtraction:sub_across_zeros': ['Y3.B2.S16', 'Y4.B2.S7'],
    'subtraction:sub_check_by_adding': [
        'Y3.B2.S21',
        'Y4.B2.S10',
        { step: 'Y5.B2.S5', partial: '5- and 6-digit numbers; checking addition by subtracting' },
    ],

    // ---- multiplication
    'multiplication:mult_facts': [
        { step: 'Y2.B5.S9', note: 'constant 2' },
        { step: 'Y2.B5.S13', note: 'constant 10' },
        { step: 'Y2.B5.S15', note: 'constant 5' },
        { step: 'Y2.B5.S17', note: 'tables 5 and 10' },
        { step: 'Y3.B3.S6', note: 'constant 3' },
        { step: 'Y3.B3.S8', note: 'constant 3' },
        { step: 'Y3.B3.S9', note: 'constant 4' },
        { step: 'Y3.B3.S11', note: 'constant 4' },
        { step: 'Y3.B3.S12', note: 'constant 8' },
        { step: 'Y3.B3.S14', note: 'constant 8' },
        { step: 'Y3.B3.S15', partial: 'the doubling link between the 2, 4 and 8 tables' },
        { step: 'Y4.B4.S2', note: 'constant 6' },
        { step: 'Y4.B4.S3', note: 'constant 6' },
        { step: 'Y4.B4.S4', note: 'constant 9' },
        { step: 'Y4.B4.S5', note: 'constant 9' },
        { step: 'Y4.B4.S7', note: 'constant 7' },
        { step: 'Y4.B4.S8', note: 'constant 7' },
        { step: 'Y4.B4.S9', note: 'constant 11' },
        { step: 'Y4.B4.S10', note: 'constant 12' },
    ],
    'multiplication:multiply': [
        { step: 'Y3.B4.S4', note: '2-digit × 1-digit' },
        { step: 'Y3.B4.S5', note: '2-digit × 1-digit' },
        { step: 'Y4.B5.S8', partial: 'partitioning in a written layout' },
        { step: 'Y4.B5.S9', note: '2-digit × 1-digit' },
        { step: 'Y4.B5.S10', note: '3-digit × 1-digit' },
        { step: 'Y5.B5.S1', partial: '4-digit × 1-digit (the largest size is 3-digit × 1-digit)' },
        { step: 'Y5.B5.S3', note: '2-digit × 2-digit' },
    ],
    'multiplication:arrays_groups': [
        { step: 'Y1.B9.S5', note: 'groups' },
        { step: 'Y1.B9.S6', note: 'arrays' },
        { step: 'Y2.B5.S3', note: 'groups' },
        'Y2.B5.S5',
        { step: 'Y2.B5.S6', note: 'arrays' },
        { step: 'Y3.B3.S1', note: 'groups' },
        { step: 'Y3.B3.S2', note: 'arrays' },
    ],
    'multiplication:dot_array_mult': ['Y1.B9.S6', 'Y2.B5.S6', 'Y3.B3.S2'],
    'multiplication:mult_properties': [
        'Y3.B4.S3',
        'Y4.B4.S11',
        { step: 'Y4.B4.S12', partial: 'dividing a number by 1 and by itself' },
        { step: 'Y4.B5.S2', partial: 'using factor pairs to multiply mentally (12 × 5 = 6 × 2 × 5)' },
        { step: 'Y4.B5.S15', partial: 'choosing an efficient strategy: doubling, near multiples, factor pairs' },
    ],
    'multiplication:mult_comparison': ['Y3.B4.S10', 'Y5.B5.S11'],
    'multiplication:area_model_mult': ['Y3.B4.S4', 'Y3.B4.S5', 'Y4.B5.S8', 'Y4.B5.S9', 'Y4.B5.S10'],
    'multiplication:area_model_mult_hard': [
        { step: 'Y5.B5.S2', note: '2 × 2' },
        { step: 'Y5.B5.S4', note: '2 × 3' },
        'Y6.B2.S7',
    ],
    'multiplication:mult_div_fact_family': ['Y3.B4.S6', 'Y4.B4.S3', 'Y4.B4.S5', 'Y4.B4.S8'],
    'multiplication:mult_chart': [{ step: 'Y4.B4.S6', partial: 'the links between the 3, 6 and 9 tables' }],
    'multiplication:mult_chart_easy': ['Y2.B5.S17'],
    'multiplication:repeated_add_to_mult': ['Y1.B9.S5', 'Y2.B5.S3', 'Y2.B5.S4', 'Y3.B3.S1'],
    'multiplication:equal_or_unequal_groups': ['Y1.B9.S4', 'Y2.B5.S1'],
    'multiplication:mult_zeros': [
        { step: 'Y3.B4.S1', note: '× 10' },
        'Y3.B4.S2',
        { step: 'Y4.B5.S3', note: '× 10' },
        { step: 'Y4.B5.S4', note: '× 100' },
        { step: 'Y4.B5.S7', partial: 'related facts both ways (3 × 4 = 12 so 30 × 4 = 120 and 120 ÷ 4 = 30)' },
    ],
    'multiplication:mult_placeholder_zero': [
        'Y5.B5.S3',
        'Y5.B5.S4',
        { step: 'Y5.B5.S5', partial: 'a 4-digit by 2-digit long multiplication worked to the end' },
        { step: 'Y6.B2.S7', partial: 'the whole 4-digit by 2-digit calculation' },
    ],
    'multiplication:count_by_tables': [
        { step: 'Y2.B5.S9', note: '2' },
        { step: 'Y2.B5.S13', note: '10' },
        { step: 'Y2.B5.S15', note: '5' },
        { step: 'Y3.B3.S8', note: '3' },
        { step: 'Y3.B3.S11', note: '4' },
        { step: 'Y3.B3.S14', note: '8' },
        { step: 'Y4.B4.S1', note: '3' },
    ],

    // ---- division
    'division:div_facts': [
        { step: 'Y2.B5.S10', note: 'divide by 2' },
        { step: 'Y2.B5.S14', note: 'divide by 10' },
        { step: 'Y2.B5.S16', note: 'divide by 5' },
        { step: 'Y3.B3.S7', note: 'divide by 3' },
        { step: 'Y3.B3.S10', note: 'divide by 4' },
        { step: 'Y3.B3.S13', note: 'divide by 8' },
        { step: 'Y4.B4.S2', note: 'divide by 6' },
        { step: 'Y4.B4.S4', note: 'divide by 9' },
        { step: 'Y4.B4.S7', note: 'divide by 7' },
        { step: 'Y4.B4.S9', note: 'divide by 11' },
        { step: 'Y4.B4.S10', note: 'divide by 12' },
    ],
    'division:div_remainders': ['Y3.B4.S9', 'Y4.B5.S12', 'Y5.B5.S9'],
    'division:div_word_problems': ['Y3.B3.S5'],
    'division:remainder_interpret': ['Y5.B5.S11', 'Y6.B2.S13'],
    'division:remainder_contexts': ['Y6.B2.S13'],
    'division:box_division_easy': ['Y3.B4.S7', 'Y4.B5.S11', 'Y4.B5.S12'],
    'division:box_division_hard': [
        'Y4.B5.S13',
        'Y5.B5.S7',
        { step: 'Y5.B5.S8', partial: '4-digit dividends' },
        'Y5.B5.S9',
        'Y6.B2.S9',
    ],
    'division:area_model_div_2by1': ['Y3.B4.S7', 'Y3.B4.S8', 'Y4.B5.S11'],
    'division:area_model_div_3by1': [
        'Y4.B5.S13',
        { step: 'Y5.B5.S10', partial: 'choosing an efficient method (factors, known facts, partitioning)' },
    ],
    'division:long_div_2digit': [
        'Y6.B2.S11',
        { step: 'Y6.B2.S12', partial: 'remainders written as r, a fraction or a decimal' },
    ],
    'division:missing_mult_div': ['Y3.B4.S6'],
    'division:share_into_groups': [
        { step: 'R.B16.S2', partial: 'sharing one at a time (how many each); the skill makes groups of a size, and works to 20' },
        'R.B16.S4',
        'Y1.B9.S8',
        { step: 'Y1.B9.S9', partial: 'sharing one at a time between a given number of groups (how many in each)' },
        'Y2.B5.S7',
        { step: 'Y2.B5.S8', partial: 'sharing into a given number of groups (how many in each)' },
        'Y3.B3.S5',
    ],
    'division:div_zero_in_quotient': ['Y5.B5.S7', 'Y6.B2.S9'],
    'division:remainder_too_big': ['Y5.B5.S9'],
    'division:div_fix_estimate': ['Y6.B2.S11'],

    // ---- integers
    'integers:number_line_int': ['Y5.B13.S1', 'Y6.B1.S8'],
    'integers:compare_int': ['Y5.B13.S4', 'Y6.B1.S8'],
    'integers:sub_int': [
        { step: 'Y5.B13.S5', partial: 'finding the difference between a positive and a negative number on a number line' },
    ],
    'integers:order_negatives': ['Y5.B13.S4', 'Y6.B1.S6', 'Y6.B1.S8'],
    'integers:integer_nl_drag': ['Y5.B13.S1'],
    // Build lane operations, entry 1 (2026-09-26): count through zero in 1s and multiples,
    // temperature below zero, the difference across zero.
    'integers:count_through_zero': ['Y5.B13.S2', 'Y5.B13.S3', 'Y5.B13.S5'],
    // Build lane operations, entry 2 (2026-09-26): sharing and grouping, fair / not fair, left over.
    'division:share_and_group_early': ['R.B9.S6', 'R.B9.S8', 'R.B11.S10', 'R.B11.S12', 'R.B11.S13', 'R.B14.S2', 'R.B14.S4', 'R.B16.S1', 'R.B16.S2', 'R.B16.S3', 'R.B16.S5', 'Y1.B9.S9', 'Y2.B5.S8'],

    // ---- number_ops_mixed
    'number_ops_mixed:word_problems_mixed': ['Y5.B5.S6', 'Y5.B5.S11', 'Y6.B2.S8', 'Y6.B2.S14'],
    'number_ops_mixed:missing_factor_or_addend': ['Y5.B2.S8'],

    // ---- fractions
    'fractions:identify': ['Y2.B8.S10', { step: 'Y2.B8.S13', note: '3/4' }, 'Y3.B6.S1'],
    'fractions:write_fraction': [
        'Y2.B8.S10',
        'Y2.B8.S11',
        'Y2.B8.S13',
        'Y3.B6.S1',
        'Y3.B6.S3',
        { step: 'Y4.B8.S1', note: 'tenths' },
    ],
    'fractions:shade_fraction': [
        { step: 'Y1.B10.S2', note: '1/2' },
        { step: 'Y1.B10.S6', note: '1/4' },
        { step: 'Y2.B8.S4', note: '1/2' },
        { step: 'Y2.B8.S6', note: '1/4' },
        { step: 'Y2.B8.S8', note: '1/3' },
        'Y2.B8.S11',
        { step: 'Y2.B8.S14', note: '3/4' },
        'Y3.B6.S3',
    ],
    'fractions:equiv_frac_visual': [
        { step: 'Y2.B8.S12', note: 'halves and quarters' },
        { step: 'Y3.B6.S9', partial: 'equivalent fractions shown on two number lines' },
        'Y3.B6.S10',
        { step: 'Y4.B7.S9', partial: 'equivalent fractions on number lines' },
        'Y5.B4.S2',
    ],
    'fractions:equiv_frac_nv': ['Y4.B7.S10', 'Y5.B4.S1'],
    'fractions:select_equiv_frac': ['Y5.B4.S3'],
    'fractions:equivalent': ['Y4.B7.S10', 'Y5.B4.S1', 'Y5.B4.S2', 'Y5.B4.S3', 'Y6.B3.S1'],
    'fractions:fraction_of_set': [
        { step: 'Y1.B10.S3', partial: 'recognising whether a set is split into two equal groups' },
        { step: 'Y1.B10.S4', note: '1/2' },
        { step: 'Y1.B10.S7', partial: 'recognising a set split into four equal groups' },
        { step: 'Y1.B10.S8', note: '1/4' },
        { step: 'Y2.B8.S4', note: '1/2' },
        { step: 'Y2.B8.S6', note: '1/4' },
        { step: 'Y2.B8.S8', note: '1/3' },
        { step: 'Y2.B8.S14', note: '3/4' },
        { step: 'Y3.B8.S4', note: 'unit fractions' },
        'Y3.B8.S5',
        'Y5.B6.S4',
    ],
    'fractions:fraction_of_set_hard': [
        { step: 'Y3.B8.S6', partial: 'reasoning and word problems with fractions of amounts (bar model)' },
        'Y5.B6.S5',
        'Y6.B4.S6',
    ],
    'fractions:compare': [
        { step: 'Y3.B6.S2', note: 'unit fractions' },
        { step: 'Y3.B6.S5', note: 'same denominator' },
        { step: 'Y4.B7.S5', partial: 'comparing and ordering mixed numbers' },
        'Y5.B4.S6',
    ],
    'fractions:simplify': ['Y6.B3.S1'],
    'fractions:improper_mixed': ['Y4.B7.S6', 'Y4.B7.S7', 'Y4.B7.S8', 'Y5.B4.S4', 'Y5.B4.S5'],
    'fractions:mixed_improper_visual': ['Y4.B7.S6', 'Y5.B4.S4', 'Y5.B4.S5'],
    'fractions:fraction_of_set_nv': ['Y3.B8.S5', 'Y5.B6.S4'],
    'fractions:fraction_of_set_hard_nv': [
        'Y5.B6.S5',
        { step: 'Y5.B6.S6', note: 'find the whole' },
        'Y6.B4.S6',
        { step: 'Y6.B4.S7', partial: 'a page of find-the-whole only, with a bar model' },
    ],
    'fractions:order_fractions': ['Y3.B6.S2', 'Y3.B6.S5', 'Y5.B4.S7', 'Y6.B3.S3'],
    'fractions:compare_frac_lcd': ['Y5.B4.S6', 'Y6.B3.S3'],
    'fractions:graph_fractions': ['Y3.B6.S7'],

    // ---- fraction_operations
    'fraction_operations:add_fractions_like': [
        'Y3.B8.S1',
        { step: 'Y4.B7.S11', partial: 'three or more addends, totals past 1' },
        'Y5.B4.S9',
        'Y5.B4.S11',
    ],
    'fraction_operations:sub_fractions_like': ['Y3.B8.S2', 'Y4.B7.S13', 'Y5.B4.S9', 'Y5.B4.S14'],
    'fraction_operations:add_mixed_like': ['Y4.B7.S12', 'Y5.B4.S12', 'Y5.B4.S13'],
    'fraction_operations:sub_mixed_like': [
        'Y4.B7.S15',
        'Y5.B4.S15',
        { step: 'Y5.B4.S16', partial: 'a page that always exchanges a whole' },
        'Y5.B4.S17',
    ],
    'fraction_operations:mult_frac_whole': [{ step: 'Y5.B6.S1', note: 'unit fractions' }, 'Y5.B6.S2', 'Y6.B4.S1'],
    'fraction_operations:frac_word_problems': [
        { step: 'Y6.B3.S9', partial: 'multi-step problems with unlike denominators' },
    ],
    'fraction_operations:frac_10_100': ['Y4.B8.S1', 'Y4.B8.S7', 'Y5.B7.S3'],
    'fraction_operations:add_frac_unlike': [
        { step: 'Y5.B4.S10', note: 'related denominators, total within 1' },
        'Y5.B4.S11',
        'Y6.B3.S5',
    ],
    'fraction_operations:sub_frac_unlike': ['Y5.B4.S14', 'Y6.B3.S5'],
    'fraction_operations:add_mixed_unlike': ['Y5.B4.S12', 'Y5.B4.S13', 'Y6.B3.S7'],
    'fraction_operations:sub_mixed_unlike': ['Y5.B4.S15', 'Y5.B4.S17', 'Y6.B3.S8'],
    'fraction_operations:add_frac_like_nv': ['Y3.B8.S1'],
    'fraction_operations:sub_frac_like_nv': ['Y3.B8.S2', 'Y4.B7.S13'],
    'fraction_operations:add_frac_unlike_nv': ['Y6.B3.S6'],
    'fraction_operations:sub_frac_unlike_nv': ['Y6.B3.S6'],
    'fraction_operations:add_mixed_unlike_nv': ['Y6.B3.S7'],
    'fraction_operations:sub_mixed_unlike_nv': ['Y6.B3.S8'],
    'fraction_operations:mult_frac_whole_nv': ['Y5.B6.S2', 'Y6.B4.S1'],
    'fraction_operations:mult_frac_frac_nv': ['Y6.B4.S2'],
    'fraction_operations:div_unit_frac_nv': [
        'Y6.B4.S3',
        { step: 'Y6.B4.S4', partial: 'a non-unit fraction divided by an integer (4/5 ÷ 3)' },
    ],
    'fraction_operations:frac_as_div_nv': ['Y6.B9.S2'],
    'fraction_operations:mult_frac_frac': ['Y6.B4.S2'],
    'fraction_operations:div_unit_fraction': [{ step: 'Y6.B4.S3', note: 'fraction ÷ whole' }],
    'fraction_operations:frac_as_division': ['Y6.B9.S2'],
    'fraction_operations:mult_scaling': [{ step: 'Y6.B6.S6', partial: 'scale factors applied to shapes and lengths' }],

    // ---- decimals
    'decimals:add_decimal': [
        'Y5.B12.S3',
        'Y5.B12.S4',
        { step: 'Y5.B12.S6', note: 'different decimal places' },
        'Y6.B8.S4',
    ],
    'decimals:sub_decimal': [
        'Y5.B12.S3',
        'Y5.B12.S5',
        { step: 'Y5.B12.S7', note: 'different decimal places' },
        'Y6.B8.S4',
    ],
    'decimals:mult_decimal': [{ step: 'Y6.B8.S7', note: 'decimal × whole number' }],
    'decimals:div_decimal': [{ step: 'Y6.B8.S8', note: 'decimal ÷ whole number' }],
    'decimals:compare_decimal': ['Y4.B9.S5', 'Y5.B7.S8'],
    'decimals:compare_thousandths': [
        { step: 'Y5.B7.S6', partial: 'writing thousandths as decimals' },
        'Y5.B7.S9',
        { step: 'Y6.B8.S1', partial: 'the value of each digit within 1' },
    ],
    'decimals:round_decimals': ['Y6.B8.S3'],
    'decimals:round_thousandths': [{ step: 'Y5.B7.S11', note: 'nearest tenth' }, 'Y6.B8.S3'],
    'decimals:order_decimals': ['Y4.B9.S6', 'Y5.B7.S8', 'Y5.B7.S9'],
    'decimals:decimal_nl_drag': ['Y4.B8.S4', 'Y5.B7.S1'],

    // ---- conversions
    'conversions:f_to_d': [
        { step: 'Y4.B8.S2', note: 'tenths' },
        { step: 'Y4.B8.S8', note: 'hundredths' },
        { step: 'Y4.B9.S8', note: 'halves and quarters' },
        { step: 'Y5.B7.S2', note: 'tenths' },
        { step: 'Y5.B7.S3', note: 'hundredths' },
        'Y5.B7.S4',
        'Y6.B9.S1',
    ],
    'conversions:d_to_f': [
        'Y4.B8.S2',
        'Y4.B8.S8',
        'Y5.B7.S1',
        'Y5.B7.S2',
        'Y5.B7.S4',
        { step: 'Y5.B7.S5', partial: 'thousandths as fractions (x/1000)' },
        'Y6.B9.S1',
    ],
    'conversions:f_to_p': ['Y5.B7.S13', 'Y5.B7.S15', 'Y6.B9.S4', 'Y6.B9.S5'],
    'conversions:p_to_f': ['Y5.B7.S13', 'Y6.B9.S5'],
    'conversions:d_to_p': ['Y5.B7.S14', 'Y5.B7.S15', 'Y6.B9.S5'],
    'conversions:p_to_d': ['Y5.B7.S14'],
    'conversions:percent_visual': ['Y5.B7.S12', 'Y6.B9.S3'],
    'conversions:percent_of_number': [
        'Y6.B9.S7',
        { step: 'Y6.B9.S9', partial: 'finding the percentage itself (12 is what percent of 40)' },
    ],
    'conversions:find_whole_from_pct': ['Y6.B9.S9'],
    'conversions:order_fdp': ['Y5.B7.S15', 'Y6.B9.S6'],
    'conversions:ratio_intro': [
        'Y6.B6.S2',
        'Y6.B6.S3',
        { step: 'Y6.B6.S4', partial: 'linking a ratio to fractions of the whole' },
    ],
    'conversions:unit_rate_intro': ['Y6.B6.S9'],
    'conversions:double_num_line': ['Y6.B6.S9'],
    'conversions:equiv_ratios': ['Y6.B6.S3', 'Y6.B6.S8'],
    'conversions:ratio_tables': [
        'Y6.B6.S8',
        { step: 'Y6.B6.S10', partial: 'recipes: scaling a list of ingredients up or down' },
    ],

    // ---- shapes_early
    'shapes_early:name_2d_shapes': [
        'R.B4.S1',
        'R.B6.S1',
        { step: 'R.B15.S2', partial: 'recognising a shape when it is turned' },
        'Y1.B3.S3',
        'Y2.B3.S1',
        'Y3.B11.S7',
    ],
    'shapes_early:name_3d_shapes': ['R.B12.S1', 'Y1.B3.S1', 'Y2.B3.S1', 'Y3.B11.S9'],
    'shapes_early:shape_name_match_2d': ['Y1.B3.S3'],
    'shapes_early:shape_name_match_3d': ['R.B12.S1', 'Y1.B3.S1'],
    'shapes_early:shape_positions': [
        'R.B4.S4',
        'R.B17.S6',
        { step: 'R.B17.S7', partial: 'giving instructions to build (first, next, on top of)' },
        'Y1.B11.S4',
        'Y2.B11.S1',
    ],
    'shapes_early:shape_corners_count': ['Y2.B3.S3'],
    'shapes_early:count_edges_faces_vertices': [
        { step: 'Y2.B3.S8', partial: 'faces only, one property per page' },
        'Y2.B3.S9',
        'Y2.B3.S10',
        'Y3.B11.S9',
        { step: 'Y5.B10.S10', partial: 'naming prisms and pyramids and matching 2-D views' },
    ],
    'shapes_early:count_sides_vertices_2d': [
        { step: 'Y2.B3.S2', note: 'sides' },
        { step: 'Y2.B3.S3', note: 'vertices' },
        'Y3.B11.S7',
    ],
    'shapes_early:order_objects_length': ['Y1.B7.S1', 'Y2.B6.S3', 'Y2.B6.S4'],
    'shapes_early:measure_nonstandard': ['Y1.B7.S2'],
    'shapes_early:compose_shapes': [
        'R.B6.S2',
        'R.B15.S3',
        { step: 'R.B15.S4', partial: 'explaining an arrangement of shapes' },
        'R.B15.S5',
        { step: 'R.B15.S6', partial: 'decomposing: finding the shapes inside a shape' },
    ],
    'shapes_early:compose_hexagon': ['R.B15.S5'],
    'shapes_early:compose_rect_from_squares': [
        { step: 'Y4.B3.S3', partial: 'making different shapes with the same area' },
    ],
    'shapes_early:partition_shapes': [
        { step: 'Y1.B10.S1', note: 'halves' },
        { step: 'Y1.B10.S5', note: 'fourths' },
        { step: 'Y2.B8.S3', note: 'halves' },
        { step: 'Y2.B8.S5', note: 'fourths' },
        { step: 'Y2.B8.S7', note: 'thirds' },
    ],
    'shapes_early:shape_attributes': [
        { step: 'R.B4.S2', partial: 'comparing two shapes side by side; curved and straight sides' },
        { step: 'R.B15.S1', partial: 'choosing a shape for a purpose (it rolls, it stacks, it fits)' },
    ],
    'shapes_early:compose_from_attributes': [
        { step: 'Y1.B3.S4', partial: 'sorting into groups by a rule; the skill selects by two attributes' },
        { step: 'Y2.B3.S7', partial: 'sorting into labelled groups' },
    ],

    // ---- area_perimeter
    'area_perimeter:perimeter_intro': [
        'Y3.B5.S10',
        'Y4.B6.S9',
        { step: 'Y5.B8.S3', partial: 'perimeter of any polygon from its side lengths' },
    ],
    'area_perimeter:area_unit_squares': ['Y4.B3.S1', 'Y4.B3.S2'],
    'area_perimeter:perimeter_grid': [
        'Y3.B5.S11',
        'Y4.B6.S3',
        { step: 'Y4.B6.S5', note: 'L-shapes' },
        { step: 'Y4.B6.S7', partial: 'rectilinear shapes with side lengths given, not on a grid' },
    ],
    'area_perimeter:perimeter': [
        'Y3.B5.S12',
        { step: 'Y4.B6.S4', note: 'rectangles' },
        { step: 'Y5.B8.S1', note: 'rectangles' },
    ],
    'area_perimeter:area': [{ step: 'Y5.B8.S4', note: 'rectangles' }],
    'area_perimeter:area_perimeter': ['Y6.B10.S2'],
    'area_perimeter:area_triangle': ['Y6.B10.S4', 'Y6.B10.S5'],
    'area_perimeter:area_polygon_decompose': ['Y5.B8.S5'],
    'area_perimeter:composite_shapes': [{ step: 'Y5.B8.S2', note: 'perimeter' }, 'Y5.B8.S5'],
    'area_perimeter:volume': ['Y6.B10.S8'],

    // ---- angles_lines
    'angles_lines:identify_angles': [
        { step: 'Y3.B11.S2', partial: 'recognising a right angle as a quarter turn in shapes and around the room' },
        'Y4.B12.S2',
        { step: 'Y4.B12.S3', partial: 'comparing and ordering angles by size' },
        'Y5.B10.S1',
        'Y5.B10.S2',
        'Y6.B12.S1',
    ],
    'angles_lines:measure_angles': [
        'Y5.B10.S1',
        { step: 'Y5.B10.S3', partial: 'estimating an angle before measuring' },
        'Y5.B10.S4',
        'Y6.B12.S1',
    ],
    'angles_lines:identify_lines': ['Y3.B11.S6'],
    'angles_lines:symmetry': ['Y2.B3.S5', 'Y4.B12.S7', 'Y5.B11.S5'],
    'angles_lines:place_symmetry_lines': ['Y2.B3.S5', 'Y4.B12.S7', 'Y5.B11.S5'],
    'angles_lines:additive_angles': [
        { step: 'Y5.B10.S6', partial: 'angles around a point sum to 360°' },
        { step: 'Y5.B10.S7', partial: 'angles on a straight line sum to 180°' },
        'Y6.B12.S2',
    ],

    // ---- shapes_classify
    'shapes_classify:classify_triangles': ['Y4.B12.S4'],
    'shapes_classify:classify_quads': ['Y4.B12.S5'],
    'shapes_classify:hotspot_quads': ['Y4.B12.S5'],
    'shapes_classify:net_identify': ['Y6.B12.S11'],

    // ---- coordinates
    'coordinates:coordinate_q1': ['Y4.B14.S1', 'Y4.B14.S2', 'Y5.B11.S1', 'Y6.B13.S1'],
    'coordinates:coordinate_all': ['Y6.B13.S2'],
    'coordinates:coordinate_graph': ['Y6.B13.S1'],
    'coordinates:coord_polygon': [
        { step: 'Y4.B14.S3', partial: 'drawing a 2-D shape by plotting its vertices and finding a missing vertex' },
        { step: 'Y5.B11.S2', partial: 'finding a missing vertex of a shape from coordinates' },
        { step: 'Y6.B13.S3', partial: 'missing vertices and coordinates problems in four quadrants' },
    ],
    'coordinates:geo_reflect': [
        { step: 'Y5.B11.S6', partial: 'reflecting in a horizontal or vertical line on a square grid by drawing' },
        'Y6.B13.S5',
    ],
    'coordinates:geo_translate': [
        { step: 'Y4.B14.S4', partial: 'the skill is multiple choice in four quadrants; drawing the image in the first quadrant' },
        'Y4.B14.S5',
        'Y5.B11.S3',
        { step: 'Y5.B11.S4', partial: 'writing the new coordinates after a translation' },
        'Y6.B13.S4',
    ],

    // ---- measurement
    'measurement:time_hour': ['Y1.B14.S5', 'Y2.B9.S1'],
    'measurement:time_half_hour': ['Y1.B14.S6', 'Y2.B9.S1'],
    'measurement:time_quarter': ['Y2.B9.S2'],
    'measurement:time_5min': ['Y2.B9.S3', 'Y2.B9.S4', 'Y2.B9.S5', 'Y3.B10.S2'],
    'measurement:time_1min': ['Y3.B10.S3'],
    'measurement:time_analog_digital': ['Y3.B10.S4', 'Y4.B11.S3'],
    'measurement:elapsed_mixed': ['Y3.B10.S8', 'Y3.B10.S9'],
    'measurement:elapsed_find_duration': ['Y3.B10.S8', 'Y3.B10.S9', 'Y3.B10.S12'],
    'measurement:heavier_lighter_visual': [
        'R.B2.S2',
        'R.B8.S1',
        { step: 'R.B8.S2', partial: 'equal mass: a level, balanced scale' },
        'Y1.B8.S1',
        { step: 'Y1.B8.S3', partial: 'comparing masses by the number of units' },
        'Y2.B7.S1',
        { step: 'Y3.B7.S5', partial: 'comparing masses in g and kg' },
    ],
    'measurement:pictograph_intro': ['Y2.B10.S5'],
    'measurement:bar_graph_intro': ['Y3.B12.S3'],
    'measurement:reading_ruler': [
        { step: 'Y1.B7.S3', partial: 'a centimetre ruler (the skill reads inches only)' },
        { step: 'Y2.B6.S1', partial: 'a centimetre ruler (the skill reads inches only)' },
        { step: 'Y3.B5.S2', partial: 'a ruler in millimetres' },
        { step: 'Y3.B11.S4', partial: 'drawing a line of a given length; measuring in mm' },
    ],
    'measurement:money_count': [
        'Y1.B13.S4',
        'Y2.B4.S1',
        { step: 'Y2.B4.S2', partial: 'counting notes' },
        { step: 'Y2.B4.S3', partial: 'counting notes and coins together as dollars and cents' },
        'Y3.B9.S1',
    ],
    'measurement:money': ['Y2.B4.S7', 'Y3.B9.S3', 'Y4.B10.S5'],
    'measurement:equiv_coin_sets': [
        'Y2.B4.S5',
        { step: 'Y2.B4.S8', partial: 'making exactly one dollar (100 cents) in different ways' },
    ],
    'measurement:enough_money': ['Y2.B4.S7'],
    'measurement:make_change_least_coins': ['Y2.B4.S4'],
    'measurement:temperature': [{ step: 'Y2.B7.S9', note: 'Read the thermometer (°C)' }],
    'measurement:capacity': [
        { step: 'Y3.B7.S9', note: 'L and mL' },
        { step: 'Y5.B14.S2', note: 'mL' },
        { step: 'Y5.B15.S4', partial: 'estimating capacity in ml and l' },
        'Y6.B5.S2',
    ],
    'measurement:unit_conversions': [
        { step: 'Y3.B7.S4', partial: 'kilograms and grams, including mixed units (1 kg 250 g)' },
        'Y5.B14.S1',
        'Y6.B5.S1',
        'Y6.B5.S5',
    ],
    'measurement:length_customary': ['Y6.B5.S5'],
    'measurement:length_metric': [
        { step: 'Y3.B5.S1', partial: 'measuring in m and cm with a mixed answer (1 m 25 cm)' },
        'Y3.B5.S4',
        { step: 'Y3.B5.S5', note: 'm and cm' },
        { step: 'Y3.B5.S6', note: 'cm and mm' },
        { step: 'Y4.B6.S1', partial: 'a sense of 1 km and mixed km and m measures (2 km 300 m)' },
        { step: 'Y4.B6.S2', note: 'km and m' },
        { step: 'Y5.B14.S1', note: 'km and m' },
        { step: 'Y5.B14.S2', note: 'mm' },
        'Y5.B14.S3',
        'Y6.B5.S1',
        'Y6.B5.S2',
    ],
    'measurement:unit_conversion_word': ['Y5.B14.S3'],
    'measurement:mass_volume_liquid': [
        { step: 'Y2.B7.S2', partial: 'reading a scale in grams with different scale steps' },
        { step: 'Y2.B7.S3', partial: 'reading a scale in kilograms' },
        { step: 'Y2.B7.S6', note: 'millilitres' },
        { step: 'Y2.B7.S7', partial: 'reading a jug in litres' },
        { step: 'Y3.B7.S1', partial: 'reading scales with different intervals' },
        { step: 'Y3.B7.S2', note: 'grams' },
        { step: 'Y3.B7.S3', partial: 'mixed kg and g readings' },
        { step: 'Y3.B7.S7', note: 'millilitres' },
        { step: 'Y3.B7.S8', partial: 'mixed l and ml readings' },
    ],
    'measurement:time_fives_ring': ['Y2.B9.S5'],
    'measurement:time_sense': ['Y3.B10.S5'],
    'measurement:elapsed_find_start': ['Y3.B10.S8', 'Y3.B10.S12'],
    'measurement:coin_value': ['Y1.B13.S1', 'Y1.B13.S2', 'Y2.B4.S1'],
    'measurement:money_notation': ['Y3.B9.S1', 'Y4.B10.S1'],
    'measurement:money_change': [
        'Y2.B4.S9',
        { step: 'Y3.B9.S4', partial: 'subtracting two prices that are not change from a payment' },
        'Y3.B9.S5',
        'Y4.B10.S5',
    ],
    'measurement:money_compare': ['Y2.B4.S6', 'Y4.B10.S3'],

    // ---- graphs
    'graphs:bar_graph': [
        'Y3.B12.S3',
        'Y4.B13.S1',
        { step: 'Y4.B13.S2', partial: 'comparison, sum and difference questions across a chart' },
    ],
    'graphs:build_bar_graph': ['Y3.B12.S4'],
    'graphs:pictograph': ['Y2.B10.S7', 'Y3.B12.S1', 'Y4.B13.S1'],
    'graphs:build_pictograph': [
        { step: 'Y2.B10.S4', note: 'each picture = 1' },
        { step: 'Y2.B10.S6', partial: 'a key where one picture stands for 2, 5 or 10' },
        { step: 'Y3.B12.S2', partial: 'a key where one picture stands for 2, 5 or 10' },
    ],
    'graphs:tally_chart': ['Y2.B10.S1'],
    'graphs:pie_chart': [
        { step: 'Y6.B11.S3', partial: 'reading fractions of the whole from a pie chart; the skill is tagged approximately' },
    ],

    // ---- data_analysis
    'data_analysis:mean': ['Y6.B11.S6'],

    // ---- patterns
    'patterns:seq_2': ['Y1.B9.S1', 'Y2.B1.S15'],
    'patterns:seq_5': ['Y1.B9.S3', 'Y2.B1.S15'],
    'patterns:seq_10': ['R.B13.S6', 'Y1.B6.S2', 'Y1.B9.S2', 'Y1.B12.S2', 'Y2.B1.S15', 'Y3.B4.S1'],
    'patterns:skip_count_line': [{ step: 'Y1.B9.S1', note: 'by 2s' }],
    'patterns:count_by_step_up': [
        { step: 'Y2.B1.S16', partial: 'counting in 3s from 0 as a counting sequence (the skill steps from any number)' },
    ],
    'patterns:double': [
        { step: 'R.B9.S8', partial: 'building a double with objects to 8; the skill is double facts to 100' },
        { step: 'R.B11.S12', partial: 'building a double with objects to 10' },
        'Y1.B9.S7',
        'Y2.B5.S11',
    ],
    'patterns:halve': ['Y1.B10.S4', 'Y2.B5.S11'],
    'patterns:shape_pattern': [
        { step: 'R.B2.S4', partial: 'talking about what repeats; the skill only fills missing shapes' },
        'R.B2.S5',
        'R.B12.S5',
        'R.B12.S6',
        { step: 'R.B12.S7', partial: 'patterns in real objects and scenes' },
        { step: 'R.B17.S1', partial: 'circling the unit that repeats' },
        { step: 'R.B18.S2', partial: 'relationships between numbers (1 more, doubles, bonds) seen as patterns' },
        'Y1.B3.S5',
        'Y2.B3.S12',
    ],

    // ---- algebra
    'algebra:tape_diagram': ['Y5.B2.S6'],
    'algebra:multi_step_word': ['Y5.B2.S6', 'Y5.B5.S6', 'Y6.B2.S8', 'Y6.B2.S14'],
    'algebra:multi_step_word_plain': ['Y6.B2.S14'],
    'algebra:write_expression': ['Y6.B7.S3'],
    'algebra:evaluate_expression': ['Y6.B7.S4'],
    'algebra:evaluate_expression_hard': ['Y6.B7.S4'],
    'algebra:function_table_easy': ['Y6.B7.S1'],
    'algebra:function_table_hard': [{ step: 'Y6.B7.S2', partial: 'two operations in sequence and working backwards' }],
    'algebra:solve_eq_addsub': ['Y6.B7.S7'],
    'algebra:solve_eq_multdiv': ['Y6.B7.S7'],
    'algebra:solve_eq_twostep': ['Y6.B7.S8'],
    'algebra:write_equation': ['Y6.B7.S6'],

    // ---- order_of_operations
    'order_of_operations:oop_medium': ['Y6.B2.S15'],
    'order_of_operations:two_ops_no_paren': ['Y6.B2.S15'],
    'order_of_operations:paren_simple': ['Y6.B2.S15'],
    'order_of_operations:exponents_simple': [
        { step: 'Y5.B3.S6', partial: 'square numbers as square arrays; recognising squares' },
    ],

    // ---- placevalue
    'placevalue:more_less_10': [
        { step: 'Y1.B1.S7', note: '1 more' },
        { step: 'Y1.B1.S9', note: '1 less' },
        { step: 'Y1.B4.S7', note: '1 more and 1 less, numbers to 20' },
        { step: 'Y1.B6.S8', note: '1 more, 1 less, numbers to 50' },
        { step: 'Y1.B12.S5', note: '1 more, 1 less' },
        { step: 'Y2.B2.S13', note: '10 more and 10 less' },
    ],
    'placevalue:more_less_100': [
        { step: 'Y3.B1.S9', note: '1, 10 and 100' },
        { step: 'Y3.B2.S3', note: '10 more, 10 less' },
        { step: 'Y4.B1.S8', note: '1, 10, 100 and 1,000' },
        { step: 'Y5.B1.S7', partial: '10,000 and 100,000 more or less' },
    ],
    'placevalue:place_value_disks': [
        { step: 'Y3.B1.S5', note: 'band 999' },
        { step: 'Y4.B1.S1', note: 'band 999' },
        { step: 'Y4.B1.S4', partial: '1,000 as ten hundreds; counting in thousands' },
        { step: 'Y4.B1.S5', note: 'band 9999' },
    ],
    'placevalue:pv_digit_drag': [
        { step: 'Y4.B1.S5', note: 'band 9999' },
        { step: 'Y5.B1.S2', note: 'band 9999' },
        { step: 'Y5.B1.S3', note: 'band 99999' },
        { step: 'Y5.B1.S4', note: 'band 999999' },
        { step: 'Y6.B1.S1', note: 'band 999999' },
    ],
    'placevalue:number_word_names': [{ step: 'Y5.B1.S5', note: 'band 999999' }, 'Y6.B1.S1'],
    'placevalue:place_value_10x': [
        { step: 'Y4.B5.S3', note: '× 10' },
        { step: 'Y4.B5.S4', note: '× 100' },
        { step: 'Y4.B5.S5', note: '÷ 10' },
        { step: 'Y4.B5.S6', note: '÷ 100' },
        { step: 'Y4.B8.S5', note: '÷ 10, decimals on' },
        { step: 'Y4.B8.S6', note: '÷ 10, decimals on' },
        { step: 'Y4.B8.S10', note: '÷ 100, decimals on' },
        'Y5.B1.S6',
        { step: 'Y5.B3.S8', note: '×' },
        { step: 'Y5.B3.S9', note: '÷' },
        { step: 'Y5.B12.S10', note: '×, decimals on' },
        { step: 'Y5.B12.S11', note: '÷, decimals on' },
        'Y6.B1.S4',
        { step: 'Y6.B8.S5', note: '×, decimals on' },
        { step: 'Y6.B8.S6', note: '÷, decimals on' },
    ],
    'placevalue:identify': [{ step: 'Y2.B1.S4', note: 'band 99' }, { step: 'Y3.B1.S8', note: 'band 999' }],
    'placevalue:value': [{ step: 'Y2.B1.S4', note: 'band 99' }, { step: 'Y3.B1.S8', note: 'band 999' }],
    'placevalue:compare': [
        { step: 'R.B11.S2', note: 'numbers to 10' },
        { step: 'Y1.B1.S13', partial: 'numbers within 10 (the lowest band is 99)' },
        { step: 'Y1.B4.S11', partial: 'numbers within 20 (the lowest band is 99)' },
        { step: 'Y1.B12.S6', note: 'band 99' },
        { step: 'Y1.B12.S7', note: 'band 99' },
        { step: 'Y2.B1.S13', note: 'band 99' },
        { step: 'Y3.B1.S12', note: 'band 999' },
        { step: 'Y4.B1.S11', note: 'band 9999' },
        { step: 'Y5.B1.S10', note: 'band 99999' },
        { step: 'Y5.B1.S11', note: 'band 999999' },
        { step: 'Y6.B1.S6', note: 'band 999999' },
    ],
    'placevalue:expand': [
        { step: 'Y2.B1.S5', note: 'band 99' },
        { step: 'Y2.B1.S8', note: 'band 99' },
        { step: 'Y3.B1.S2', note: 'band 99' },
        { step: 'Y3.B1.S6', note: 'band 999' },
        { step: 'Y4.B1.S2', note: 'band 999' },
        { step: 'Y4.B1.S6', note: 'band 9999' },
        { step: 'Y5.B1.S2', note: 'band 9999' },
        { step: 'Y5.B1.S8', note: 'band 999999' },
    ],
    'placevalue:combine': [{ step: 'Y2.B1.S8', note: 'band 99' }, { step: 'Y4.B1.S6', note: 'band 9999' }, 'Y5.B1.S8'],
    'placevalue:order_least_to_greatest': [
        { step: 'Y1.B1.S14', partial: 'ordering objects and numbers within 10' },
        { step: 'Y1.B4.S12', partial: 'numbers within 20' },
        { step: 'Y2.B1.S14', note: 'band 99' },
        { step: 'Y3.B1.S13', note: 'band 999' },
        { step: 'Y4.B1.S12', note: 'band 9999' },
        { step: 'Y5.B1.S10', note: 'band 99999' },
        { step: 'Y5.B1.S11', note: 'band 999999' },
        'Y6.B1.S6',
    ],
    'placevalue:order_greatest_to_least': [
        { step: 'Y2.B1.S14', note: 'band 99' },
        { step: 'Y3.B1.S13', note: 'band 999' },
        { step: 'Y4.B1.S12', note: 'band 9999' },
    ],
    'placevalue:unit_form': [
        'Y1.B6.S5',
        { step: 'Y1.B12.S3', note: 'band 99' },
        { step: 'Y2.B1.S5', note: 'band 99' },
        { step: 'Y3.B1.S1', note: 'band 99' },
        { step: 'Y3.B1.S6', note: 'band 999' },
        { step: 'Y3.B1.S8', note: 'band 999' },
        { step: 'Y4.B1.S1', note: 'band 999' },
        { step: 'Y4.B1.S2', note: 'band 999' },
    ],

    // ---- number_sense
    'number_sense:rounding_visual': ['Y4.B1.S14'],
    'number_sense:nearest_10': ['Y4.B1.S14'],
    'number_sense:nearest_100': ['Y4.B1.S15'],
    'number_sense:nearest_1000': ['Y4.B1.S16', 'Y5.B1.S12'],
    'number_sense:nearest_10000': ['Y5.B1.S13'],
    'number_sense:nearest_100000': ['Y5.B1.S14', 'Y6.B1.S7'],
    'number_sense:nearest_million': ['Y6.B1.S7'],
    // Round on a number line to thousands and beyond (2026-09-25): the place is the skill's option.
    'number_sense:round_nl_thousands': ['Y4.B1.S16', 'Y4.B1.S17'],
    'number_sense:round_nl_ten_thousands': ['Y5.B1.S13'],
    'number_sense:round_nl_hundred_thousands': ['Y5.B1.S14'],
    'number_sense:round_sort_100': ['Y4.B1.S15'],
    'number_sense:round_sort_1000': ['Y4.B1.S16'],
    'number_sense:round_sort_10000': ['Y5.B1.S13'],
    'number_sense:round_sort_100000': ['Y5.B1.S14'],
    'number_sense:round_sort_million': ['Y6.B1.S7'],
    'number_sense:round_sort_tenths': ['Y5.B7.S11'],
    'number_sense:estimate_sum': ['Y3.B2.S20'],
    'number_sense:estimate_sums_diffs': [
        'Y3.B2.S20',
        { step: 'Y4.B2.S9', note: 'nearest 100 or 1,000' },
        { step: 'Y5.B2.S4', note: 'nearest 1,000' },
    ],
    'number_sense:estimate_products': [
        { step: 'Y6.B2.S16', partial: 'estimating and checking with all four operations' },
    ],
    'number_sense:rounding_table': ['Y4.B1.S17', 'Y5.B1.S12'],
    'number_sense:make_a_ten': [
        'Y1.B5.S2',
        { step: 'Y1.B5.S6', partial: 'subtracting through 10 using bonds' },
        'Y2.B2.S6',
        { step: 'Y2.B2.S9', partial: 'bridging 10 in a 2-digit number (38 + 5)' },
        { step: 'Y3.B2.S6', partial: 'adding ones across a ten in a 2- or 3-digit number (68 + 5)' },
    ],
    'number_sense:doubles_near_doubles': ['R.B9.S7', 'R.B11.S11', 'R.B16.S6', 'Y1.B5.S4', 'Y1.B5.S5', 'Y1.B9.S7'],
    'number_sense:compensation': [
        { step: 'Y3.B2.S10', partial: 'explaining links between facts, place value and the column method (2.NBT.B.9)' },
        'Y4.B2.S8',
    ],
    'number_sense:place_on_number_line': [
        { step: 'Y1.B6.S6', partial: 'a whole 0-50 line counted in tens then ones (the skill\'s line spans one ten)' },
        { step: 'Y1.B6.S7', partial: 'estimating on a line with only the ends marked' },
        { step: 'Y1.B12.S4', partial: 'a whole 0-100 line counted in tens then ones (the skill\'s line spans one ten)' },
        { step: 'Y2.B1.S9', partial: 'counting in 10s along a line marked in tens' },
        { step: 'Y2.B1.S10', partial: 'a whole 0-100 line counted in tens then ones (the skill\'s line spans one ten)' },
        { step: 'Y2.B1.S11', partial: 'estimating on a line with only the ends marked' },
        { step: 'Y3.B1.S3', partial: 'a whole 0-100 line counted in tens then ones (the skill\'s line spans one ten)' },
        { step: 'Y3.B1.S10', partial: 'a 0-1,000 line (the skill\'s lines are to 100)' },
        { step: 'Y4.B1.S3', partial: 'a 0-1,000 line' },
        { step: 'Y4.B1.S9', partial: 'a 0-10,000 line' },
    ],

    // ---- number_theory
    'number_theory:prime_composite': ['Y5.B3.S5', 'Y6.B2.S5'],
    'number_theory:factors_identify': ['Y4.B5.S1', 'Y5.B3.S3'],
    'number_theory:factor_tchart_easy': ['Y4.B5.S1'],
    'number_theory:factor_tchart_medium': ['Y5.B3.S3'],
    'number_theory:factor_links_easy': ['Y4.B5.S2'],
    'number_theory:multiples': [
        { step: 'Y3.B3.S3', partial: 'multiples of 2 as even numbers to 100' },
        { step: 'Y3.B3.S4', partial: 'multiples of 5 and 10 at Grade 2' },
        { step: 'Y4.B4.S1', note: '3' },
        'Y5.B3.S1',
    ],
    'number_theory:gcf_easy': [
        { step: 'Y5.B3.S4', partial: 'listing all the common factors, not only the greatest' },
        { step: 'Y6.B2.S2', partial: 'listing all common factors' },
    ],
    'number_theory:lcm': [
        { step: 'Y5.B3.S2', partial: 'listing all the common multiples, not only the least' },
        { step: 'Y6.B2.S3', partial: 'listing all common multiples' },
    ],
    'number_theory:divisibility_sort': [{ step: 'Y6.B2.S4', partial: 'stating and applying the divisibility rules' }],
};

export const WRM_PROPOSALS = {
    // ---- algebra
    pattern_make: {
        kind: 'new', skill: 'patterns:make_a_pattern',
        name: 'Make a Pattern',
        teaches: 'copying, continuing and creating repeating patterns (AB, ABB, ABC) and finding the part that repeats',
        representation: 'a row of boxes with a started pattern; draw or write the next shapes; option: circle the repeating unit; option: make your own',
        family: 'algebra',
        steps: ['R.B2.S4', 'R.B2.S6', 'R.B12.S7', 'R.B17.S1', 'R.B17.S2', 'R.B17.S3'],
    },
    count_50s: {
        kind: 'option', skill: 'patterns:count_by_step_up', option: 'steps 50, 100, 1,000',
        name: 'Count in 50s, 100s and 1,000s (option)',
        teaches: 'counting forwards and backwards in 50s, 100s and 1,000s, and seeing 10 hundreds as 1,000',
        representation: 'step values 50, 100 and 1,000 on count_by_step_up / skip_count_line with a base-10 picture support',
        family: 'algebra',
        steps: ['Y3.B1.S4', 'Y3.B1.S14', 'Y4.B1.S4'],
    },
    function_machine: {
        kind: 'new', skill: 'algebra:function_machines',
        name: 'Function Machines',
        teaches: '1-step and 2-step function machines: find the output, the input (work backwards) or the rule',
        representation: 'drawn machine boxes with arrows; fill the empty box',
        family: 'algebra',
        steps: ['Y6.B7.S2'],
    },
    formulae: {
        kind: 'new', skill: 'algebra:use_formulae',
        name: 'Formulae',
        teaches: 'using a formula in words and in letters (perimeter = 2 × (l + w)) by substitution',
        representation: 'a formula card and values; write the result',
        family: 'algebra',
        steps: ['Y6.B7.S5'],
    },
    pairs_values: {
        kind: 'new', skill: 'algebra:pairs_of_values',
        name: 'Pairs of Values and Two Unknowns',
        teaches: 'finding all whole-number pairs that satisfy an equation (a + b = 8, 2a + b = 10) and solving simple problems with two unknowns',
        representation: 'a two-column table to list pairs systematically; option: a bar model problem',
        family: 'algebra',
        steps: ['Y6.B7.S9', 'Y6.B7.S10'],
    },

    // ---- counting
    match_same: {
        kind: 'new', skill: 'counting:match_same',
        name: 'Match the Same',
        teaches: 'matching identical objects and pictures one to one (the first step before sorting and counting)',
        representation: 'two columns of line-drawn pictures; draw a line to join each pair that is the same',
        family: 'counting',
        steps: ['R.B1.S1', 'R.B1.S2'],
    },
    odd_one_out: {
        kind: 'new', skill: 'comparing:odd_one_out',
        name: 'Which One Does Not Belong?',
        teaches: 'identifying a set: objects that belong together because they share one attribute',
        representation: 'a row of four line drawings; circle the one that is not in the set, say why',
        family: 'counting',
        steps: ['R.B1.S3'],
    },
    sort_groups: {
        kind: 'new', skill: 'comparing:sort_into_groups',
        name: 'Sort into Groups',
        teaches: 'sorting objects by one attribute (kind, colour, size, shape) into labelled groups, then saying the sorting rule',
        representation: 'picture tiles and two or three labelled sorting rings; write the letter of each tile in its ring; option: rule given or rule found',
        family: 'counting',
        steps: ['R.B1.S4', 'R.B1.S5', 'R.B1.S6', 'Y1.B1.S1'],
    },
    subitise: {
        kind: 'new', skill: 'counting:subitise',
        name: 'Say How Many Without Counting',
        teaches: 'perceptual subitising of 0-5 and conceptual subitising to 10 (seeing small groups inside a larger one: 3 and 2 make 5)',
        representation: 'standard dot, dice, finger and ten-frame patterns shown briefly on screen, printed as a grid; write the number; option: say the two parts',
        family: 'counting',
        steps: ['R.B3.S2', 'R.B5.S2', 'R.B7.S3', 'R.B7.S8', 'R.B9.S10', 'R.B11.S4', 'R.B11.S9'],
    },
    zero: {
        kind: 'new', skill: 'counting:zero_none',
        name: 'Zero Means None',
        teaches: 'zero as the count of an empty set, and writing 0',
        representation: 'pictures of plates/boxes with some or no objects; write how many, including 0',
        family: 'counting',
        steps: ['R.B7.S1'],
    },
    consolidate: {
        kind: 'new', skill: 'counting:number_sense_review',
        name: 'Number Sense Review',
        teaches: 'consolidating counting, cardinality, composition and patterns to 10 (Reception year review)',
        representation: 'a mixed page of counting, compare, compose and pattern cells drawn from the existing K skills (a review pool, not new content)',
        family: 'counting',
        steps: ['R.B13.S5', 'R.B18.S1', 'R.B18.S2'],
    },
    words_0_10: {
        kind: 'option', skill: 'composing:number_word_form', option: 'words 0-10',
        name: 'Number Words 0 to 10 (option)',
        teaches: 'reading and writing the number words zero to ten (the skill starts at 10)',
        representation: 'a band option "0 to 10" on the existing skill: numeral to word and word to numeral',
        family: 'counting',
        steps: ['Y1.B1.S5'],
    },
    teen_structure: {
        kind: 'option', skill: 'composing:teen_compose', option: '10 and 20',
        name: 'Understand 10 and 20 (option)',
        teaches: '10 as one ten and 20 as two tens (the skill covers 11-19)',
        representation: 'band values "exactly 10" and "20" on teen_compose with one and two full ten frames',
        family: 'counting',
        steps: ['Y1.B4.S2', 'Y1.B4.S6'],
    },
    ordinal: {
        kind: 'new', skill: 'counting:ordinal_numbers',
        name: '1st, 2nd, 3rd',
        teaches: 'ordinal numbers (first to tenth) and their abbreviations for position in a line',
        representation: 'a line of line-drawn children or objects with a start flag; circle the 3rd, write the position of the star',
        family: 'counting',
        steps: ['Y1.B11.S5'],
    },
    ten_count_out: {
        kind: 'new', skill: 'counting:count_out',
        name: 'Count Out a Number',
        teaches: 'counting out a given number of objects from a larger group (give me 7)',
        representation: 'a drawn group of 10-20 objects; circle exactly the number asked',
        family: 'counting',
        steps: ['Y1.B1.S3'],
    },
    tens_ones_group: {
        kind: 'new', skill: 'composing:count_in_tens_groups',
        name: 'Count by Making Tens',
        teaches: 'counting a large set by circling groups of ten, then counting tens and ones',
        representation: 'a scattered set of 20-50 objects; circle tens, write ___ tens ___ ones = ___',
        family: 'counting',
        steps: ['Y1.B6.S3', 'Y2.B1.S2'],
    },
    count_3s: {
        kind: 'new', skill: 'patterns:count_in_3s',
        name: 'Count in 3s',
        teaches: 'counting forwards and backwards in 3s from 0 (the step before the 3 times-table)',
        representation: 'a number track and a number line jumping in 3s; write the missing numbers',
        family: 'counting',
        steps: ['Y2.B1.S16'],
    },

    // ---- data
    table_data: {
        kind: 'new', skill: 'graphs:read_and_make_tables',
        name: 'Tables',
        teaches: 'reading and completing simple tables and tally-to-number tables',
        representation: 'a two-column table with blanks; fill in the counts; answer one question',
        family: 'data',
        steps: ['Y2.B10.S2', 'Y5.B9.S3'],
    },
    block_diagram: {
        kind: 'new', skill: 'graphs:block_diagrams',
        name: 'Block Diagrams',
        teaches: 'reading and drawing block diagrams (one square = one) with a scale in 1s or 2s',
        representation: 'a squared grid with labelled columns; count the blocks or colour to build',
        family: 'data',
        steps: ['Y2.B10.S3'],
    },
    pictogram_scale: {
        kind: 'option', skill: 'graphs:build_pictograph', option: 'key 2, 5, 10',
        name: 'Pictograms with a Key (option)',
        teaches: 'drawing pictograms where one picture stands for 2, 5 or 10, including half pictures',
        representation: 'a key option (1, 2, 5, 10) on build_pictograph',
        family: 'data',
        steps: ['Y2.B10.S6', 'Y3.B12.S2'],
    },
    two_way: {
        kind: 'new', skill: 'graphs:two_way_tables',
        name: 'Two-Way Tables',
        teaches: 'reading and completing two-way tables',
        representation: 'a two-way table with blanks and totals; fill them in',
        family: 'data',
        steps: ['Y3.B12.S6', 'Y5.B9.S4'],
    },
    collect_data: {
        kind: 'new', skill: 'graphs:collect_and_represent',
        name: 'Collect and Represent Data',
        teaches: 'collecting data into a tally, then choosing a table, pictogram or bar chart to show it',
        representation: 'a list of raw data; tally it, then draw the chart on a grid',
        family: 'data',
        steps: ['Y3.B12.S5'],
    },
    line_graph: {
        kind: 'new', skill: 'graphs:line_graphs',
        name: 'Line Graphs',
        teaches: 'reading and drawing line graphs that show change over time',
        representation: 'a line graph on a grid with labelled axes; read values, find differences, or plot the points',
        family: 'data',
        steps: ['Y4.B13.S2', 'Y4.B13.S3', 'Y4.B13.S4', 'Y5.B9.S1', 'Y5.B9.S2', 'Y6.B11.S1'],
    },
    dual_bar: {
        kind: 'new', skill: 'graphs:dual_bar_charts',
        name: 'Dual Bar Charts',
        teaches: 'reading and drawing dual bar charts that compare two sets of data',
        representation: 'a dual bar chart with a key; answer comparison questions',
        family: 'data',
        steps: ['Y6.B11.S2'],
    },
    pie: {
        kind: 'new', skill: 'graphs:pie_charts_read_draw',
        name: 'Pie Charts',
        teaches: 'reading pie charts with fractions and percentages and drawing them from angles (360°)',
        representation: 'a circle divided into sectors with fraction/percent labels; option: draw from a table',
        family: 'data',
        steps: ['Y6.B11.S3', 'Y6.B11.S4', 'Y6.B11.S5'],
    },

    // ---- decimals
    decimal_pv: {
        kind: 'new', skill: 'decimals:decimal_place_value',
        name: 'Tenths and Hundredths in a Place-Value Chart',
        teaches: 'tenths and hundredths as decimals in a place-value chart, with counters and base-10 (flat = 1)',
        representation: 'a place-value chart with counters; write the decimal; option: partition 0.36 = 0.3 + 0.06',
        family: 'decimals',
        steps: ['Y4.B8.S3', 'Y4.B8.S9', 'Y4.B9.S3', 'Y4.B9.S4'],
    },
    decimal_whole: {
        kind: 'new', skill: 'decimals:make_a_whole',
        name: 'Make a Whole with Decimals',
        teaches: 'complements to 1 with tenths and hundredths (0.3 + 0.7, 0.45 + 0.55)',
        representation: 'a tenths strip or hundred square with part shaded; write the missing part',
        family: 'decimals',
        steps: ['Y4.B9.S1', 'Y4.B9.S2'],
    },
    round_whole: {
        kind: 'option', skill: 'decimals:round_decimals', option: 'nearest whole',
        name: 'Round Decimals to the Nearest Whole (option)',
        teaches: 'rounding a 1-dp or 2-dp decimal to the nearest whole number on a number line',
        representation: 'a "nearest whole" target option with a number-line support',
        family: 'decimals',
        steps: ['Y4.B9.S7', 'Y5.B7.S10'],
    },
    thousandths_pv: {
        kind: 'option', skill: 'decimals:decimal_place_value', option: 'thousandths',
        name: 'Thousandths (option)',
        teaches: 'thousandths as fractions and decimals and on a place-value chart',
        representation: 'the decimal_pv proposal extended to 3 dp',
        family: 'decimals',
        steps: ['Y5.B7.S5', 'Y5.B7.S6', 'Y5.B7.S7'],
    },
    dec_known_facts: {
        kind: 'new', skill: 'decimals:decimal_known_facts',
        name: 'Decimals from Known Facts',
        teaches: 'adding and subtracting decimals within 1 using known facts (3 + 4 = 7 so 0.3 + 0.4 = 0.7), complements to 1 and efficient strategies',
        representation: 'a fact and its decimal twin; write the answer; option: complements to 1',
        family: 'decimals',
        steps: ['Y5.B12.S1', 'Y5.B12.S2', 'Y5.B12.S8'],
    },
    dec_sequence: {
        kind: 'new', skill: 'patterns:decimal_sequences',
        name: 'Decimal Sequences',
        teaches: 'continuing and finding the rule of sequences with decimal steps (0.2, 0.4, 0.6 ... ; 1.5, 1.25, 1.0)',
        representation: 'a number track with decimal steps; write the missing terms and the rule',
        family: 'decimals',
        steps: ['Y5.B12.S9'],
    },
    ratio_fraction: {
        kind: 'option', skill: 'conversions:ratio_intro', option: 'ratio and fractions',
        name: 'Ratio and Fractions (option)',
        teaches: 'linking ratio and fractions (3 : 2 means 3/5 of the whole) with a bar model',
        representation: 'the partWhole variant plus a bar model support',
        family: 'decimals',
        steps: ['Y6.B6.S4'],
    },
    dec_pv_within1: {
        kind: 'option', skill: 'decimals:decimal_place_value', option: 'within 1 and integers',
        name: 'Decimal Place Value (option)',
        teaches: 'the value of each digit in decimals within 1 and in numbers with integer and decimal parts',
        representation: 'the decimal_pv proposal with thousandths and integer parts',
        family: 'decimals',
        steps: ['Y6.B8.S1', 'Y6.B8.S2'],
    },
    dec_context: {
        kind: 'option', skill: 'decimals:mult_decimal', option: 'context',
        name: 'Multiply and Divide Decimals in Context (option)',
        teaches: 'word problems multiplying and dividing decimals by integers (money, measures)',
        representation: 'a word-problem mode on mult_decimal and div_decimal',
        family: 'decimals',
        steps: ['Y6.B8.S9'],
    },
    percent_multi: {
        kind: 'option', skill: 'conversions:percent_of_number', option: 'multi-step',
        name: 'Percentages: Multi-Step and Missing Values (option)',
        teaches: 'percentage of an amount in two steps (increase/decrease), and missing values (what percent is 12 of 40?)',
        representation: 'task options on percent_of_number',
        family: 'decimals',
        steps: ['Y6.B9.S8'],
        improves: ['Y6.B9.S9'],
    },

    // ---- fractions
    half_quarter: {
        kind: 'new', skill: 'fractions:halves_and_quarters',
        name: 'Halves and Quarters',
        teaches: 'finding and recognising a half and a quarter of a shape, an object and a small quantity (equal parts, 2 or 4)',
        representation: 'shapes and small sets of objects; shade or circle a half/quarter; tick if the parts are equal',
        family: 'fractions',
        steps: ['Y1.B10.S3', 'Y1.B10.S7'],
    },
    fraction_parts: {
        kind: 'new', skill: 'fractions:equal_parts',
        name: 'Equal and Unequal Parts',
        teaches: 'parts and wholes; deciding whether parts are equal; finding the whole from a part',
        representation: 'shapes split into parts; tick equal / not equal; draw the whole from a half or a quarter',
        family: 'fractions',
        steps: ['Y2.B8.S1', 'Y2.B8.S2', 'Y2.B8.S9'],
    },
    frac_count: {
        kind: 'new', skill: 'fractions:count_in_fractions',
        name: 'Count in Fractions',
        teaches: 'counting up and down in unit fractions on a number line and past a whole (1/4, 2/4, 3/4, 1, 1 1/4)',
        representation: 'a number line with fraction ticks; fill the missing counts',
        family: 'fractions',
        steps: ['Y2.B8.S15', 'Y3.B6.S8', 'Y3.B6.S9', 'Y4.B7.S9'],
    },
    frac_whole: {
        kind: 'new', skill: 'fractions:understand_the_whole',
        name: 'Understand the Whole',
        teaches: 'how many parts of a given size make a whole (4/4 = 1), and finding the whole from a part',
        representation: 'a bar split into parts with some shaded; write how many more make the whole',
        family: 'fractions',
        steps: ['Y3.B6.S4'],
    },
    frac_scales: {
        kind: 'new', skill: 'fractions:fractions_on_scales',
        name: 'Fractions and Scales',
        teaches: 'reading a scale or number line divided into halves, quarters, fifths and tenths of a unit',
        representation: 'a measuring scale (jug, ruler, number line) with unlabelled intervals; write the reading as a fraction',
        family: 'fractions',
        steps: ['Y3.B6.S6'],
    },
    frac_whole_partition: {
        kind: 'new', skill: 'fractions:partition_the_whole',
        name: 'Partition the Whole',
        teaches: 'finding the fraction that completes a whole (1 − 3/5), as a part-whole or bar model',
        representation: 'a bar model with one part given as a fraction; write the missing part',
        family: 'fractions',
        steps: ['Y3.B8.S3'],
    },
    frac_amount_wp: {
        kind: 'new', skill: 'fractions:fraction_of_amount_problems',
        name: 'Fraction of an Amount Problems',
        teaches: 'reasoning about fractions of amounts with a bar model: find a part, find the whole, compare two fractions of amounts',
        representation: 'a bar model split into equal parts with the whole or a part labelled; write the missing value',
        family: 'fractions',
        steps: ['Y3.B8.S6'],
    },
    frac_beyond_1: {
        kind: 'new', skill: 'fractions:mixed_numbers_intro',
        name: 'Fractions Beyond 1',
        teaches: 'counting beyond 1 in fractions, partitioning a mixed number into wholes and a fraction, mixed numbers on a number line',
        representation: 'bar and number-line models with wholes shaded; write the mixed number',
        family: 'fractions',
        steps: ['Y4.B7.S2', 'Y4.B7.S3', 'Y4.B7.S5'],
    },
    frac_add_multi: {
        kind: 'option', skill: 'fraction_operations:add_fractions_like', option: 'three addends and wholes',
        name: 'Add and Subtract More Fractions (option)',
        teaches: 'adding two or more fractions with the same denominator, adding fractions to mixed numbers, and subtracting from whole amounts (3 − 3/4)',
        representation: 'addend-count and "from a whole" options with a bar-model support',
        family: 'fractions',
        steps: ['Y4.B7.S11', 'Y4.B7.S14'],
    },
    frac_compare_gt1: {
        kind: 'option', skill: 'fractions:compare', option: 'greater than 1',
        name: 'Compare and Order Fractions Greater Than 1 (option)',
        teaches: 'comparing and ordering improper fractions and mixed numbers',
        representation: 'a band option on compare / order_fractions',
        family: 'fractions',
        steps: ['Y5.B4.S8'],
    },
    sub_break_whole: {
        kind: 'option', skill: 'fraction_operations:sub_mixed_like', option: 'breaking the whole',
        name: 'Subtract from a Mixed Number: Break the Whole (option)',
        teaches: 'subtracting a fraction larger than the fractional part of a mixed number by exchanging one whole (3 1/5 − 4/5)',
        representation: 'an "exchange a whole" band with a bar-model support',
        family: 'fractions',
        steps: ['Y5.B4.S16'],
    },
    mult_mixed_int: {
        kind: 'option', skill: 'fraction_operations:mult_frac_whole', option: 'mixed numbers',
        name: 'Multiply a Mixed Number by an Integer (option)',
        teaches: 'multiplying a mixed number by a whole number (2 1/3 × 4)',
        representation: 'a mixed-number band on mult_frac_whole',
        family: 'fractions',
        steps: ['Y5.B6.S3'],
    },
    frac_operator: {
        kind: 'new', skill: 'fractions:fraction_as_operator',
        name: 'Fractions as Operators',
        teaches: 'using a fraction as an operator (2/5 of 30 = 30 ÷ 5 × 2) and seeing that 1/4 of 20 = 20 ÷ 4 = 20 × 1/4',
        representation: 'a bar model with the operator arrows; write the calculation both ways',
        family: 'fractions',
        steps: ['Y5.B6.S7'],
    },
    frac_nl_equiv: {
        kind: 'option', skill: 'fractions:equiv_frac_visual', option: 'number lines',
        name: 'Equivalent Fractions on a Number Line (option)',
        teaches: 'equivalent fractions shown on stacked number lines',
        representation: 'a double number-line representation option',
        family: 'fractions',
        steps: ['Y6.B3.S2'],
    },
    compare_numerator: {
        kind: 'option', skill: 'fractions:compare', option: 'same numerator',
        name: 'Compare Fractions by Numerator (option)',
        teaches: 'comparing and ordering fractions with the same numerator (3/5 > 3/7) and by denominators',
        representation: 'a comparison-type option on compare/order',
        family: 'fractions',
        steps: ['Y6.B3.S4'],
    },
    frac_multistep: {
        kind: 'new', skill: 'fraction_operations:fraction_multi_step_problems',
        name: 'Multi-Step Fraction Problems',
        teaches: 'multi-step word problems with adding and subtracting fractions, using a bar model',
        representation: 'a bar model with the steps; write each step\'s answer',
        family: 'fractions',
        steps: ['Y6.B3.S9'],
    },
    mixed_frac_qs: {
        kind: 'new', skill: 'fraction_operations:mixed_fraction_questions',
        name: 'Mixed Fraction Questions',
        teaches: 'choosing the operation in mixed fraction calculations (+, −, ×, ÷ by an integer)',
        representation: 'a page mixing the four operations with fraction cards',
        family: 'fractions',
        steps: ['Y6.B4.S4', 'Y6.B4.S5'],
    },
    frac_find_whole: {
        kind: 'option', skill: 'fractions:fraction_of_set_hard_nv', option: 'find the whole',
        name: 'Fraction of an Amount: Find the Whole (option)',
        teaches: 'finding the whole from a known fractional part with a bar model (3/5 is 24, what is the whole?)',
        representation: 'a "find the whole" task option with a bar model support',
        family: 'fractions',
        steps: ['Y6.B4.S7'],
    },

    // ---- geometry
    shapes_world: {
        kind: 'new', skill: 'shapes_early:shapes_around_us',
        name: 'Shapes Around Us',
        teaches: 'recognising 2-D and 3-D shapes in everyday objects (a clock is a circle, a tin is a cylinder)',
        representation: 'line drawings of everyday objects; circle or write the matching shape name from a word bank',
        family: 'geometry',
        steps: ['R.B4.S3', 'R.B6.S3', 'R.B12.S4'],
    },
    compare_shapes: {
        kind: 'new', skill: 'shapes_early:compare_two_shapes',
        name: 'Same and Different Shapes',
        teaches: 'comparing two shapes by sides, corners and straight or curved edges',
        representation: 'two shapes side by side with a same/different checklist (sides, corners, curved)',
        family: 'geometry',
        steps: ['R.B4.S2', 'R.B15.S2'],
    },
    position_map: {
        kind: 'new', skill: 'shapes_early:position_and_maps',
        name: 'Where Is It? Positions and Maps',
        teaches: 'position and direction language (on, under, next to, behind, in front, left, right, forwards, backwards), following and giving simple directions on a grid map',
        representation: 'a simple picture map on a square grid; answer where-is questions or follow arrows',
        family: 'geometry',
        steps: ['R.B17.S7', 'R.B17.S8', 'R.B17.S9', 'R.B17.S10', 'R.B17.S11', 'Y1.B11.S2', 'Y1.B11.S3'],
    },
    shape_3d_tasks: {
        kind: 'new', skill: 'shapes_early:shape_properties_3d',
        name: 'What Can This Shape Do?',
        teaches: 'properties of 3-D shapes in use: roll, stack, slide; flat and curved faces; faces seen in 3-D shapes',
        representation: 'line drawings of 3-D shapes; tick roll/stack/slide; match the face print to the 3-D shape',
        family: 'geometry',
        steps: ['R.B12.S2', 'R.B12.S3', 'R.B15.S1', 'R.B15.S8'],
    },
    scenes: {
        kind: 'new', skill: 'shapes_early:build_and_copy',
        name: 'Copy and Build',
        teaches: 'copying a picture or construction made of shapes, visualising from another viewpoint, replicating a scene',
        representation: 'a model picture made of shapes beside an empty frame; draw or choose the matching copy',
        family: 'geometry',
        steps: ['R.B15.S4', 'R.B15.S6', 'R.B15.S7', 'R.B17.S4', 'R.B17.S5'],
    },
    shape_sort: {
        kind: 'new', skill: 'shapes_early:sort_shapes',
        name: 'Sort 2-D and 3-D Shapes',
        teaches: 'sorting shapes by one property (sides, corners, flat or curved faces, rolls or stacks) and naming the sorting rule',
        representation: 'shape tiles and two labelled sorting rings or a Carroll-style two-box table',
        family: 'geometry',
        steps: ['Y1.B3.S2', 'Y1.B3.S4', 'Y2.B3.S7', 'Y2.B3.S11'],
    },
    turns: {
        kind: 'new', skill: 'coordinates:whole_half_quarter_turns',
        name: 'Whole, Half and Quarter Turns',
        teaches: 'describing turns (whole, half, quarter, three-quarter; clockwise, anticlockwise) of an arrow or object',
        representation: 'an arrow or object drawn before and after a turn; circle the turn from a word bank',
        family: 'geometry',
        steps: ['Y1.B11.S1', 'Y2.B11.S3'],
    },
    shape_draw: {
        kind: 'new', skill: 'shapes_early:draw_2d_shapes',
        name: 'Draw 2-D Shapes',
        teaches: 'drawing 2-D shapes on a dot grid from a name or a description (4 sides, 2 long and 2 short)',
        representation: 'a square dot grid; draw the shape; the key shows one correct drawing',
        family: 'geometry',
        steps: ['Y2.B3.S4', 'Y3.B11.S8'],
    },
    symmetry_complete: {
        kind: 'new', skill: 'angles_lines:complete_symmetric_shape',
        name: 'Complete the Symmetric Shape',
        teaches: 'using a vertical line of symmetry to complete a shape or pattern on a square grid',
        representation: 'half a shape on squared paper beside a dashed mirror line; draw the other half',
        family: 'geometry',
        steps: ['Y2.B3.S6', 'Y4.B12.S8'],
    },
    shape_faces: {
        kind: 'option', skill: 'shapes_early:count_edges_faces_vertices', option: 'by part',
        name: 'Faces, Edges or Vertices (option)',
        teaches: 'counting faces, edges and vertices of 3-D shapes one property per page (the skill mixes them)',
        representation: 'a "count" option: faces / edges / vertices / mixed',
        family: 'geometry',
        steps: ['Y2.B3.S8'],
    },
    movement: {
        kind: 'new', skill: 'coordinates:describe_movement',
        name: 'Describe Movement',
        teaches: 'describing movement on a grid (up, down, left, right, number of squares) and combining movement with quarter/half turns',
        representation: 'a square grid with a start and an object; write the moves; option: follow a route',
        family: 'geometry',
        steps: ['Y2.B11.S2', 'Y2.B11.S4'],
    },
    pattern_turns: {
        kind: 'new', skill: 'patterns:patterns_with_turns',
        name: 'Shape Patterns with Turns',
        teaches: 'continuing patterns made by turning a shape (quarter turns clockwise)',
        representation: 'a row of arrow or shape tiles turning; draw or circle the next one',
        family: 'geometry',
        steps: ['Y2.B11.S5'],
    },
    turns_angles: {
        kind: 'new', skill: 'angles_lines:turns_and_angles',
        name: 'Turns and Angles',
        teaches: 'an angle as an amount of turn; right angles as quarter turns; comparing angles with a right angle (greater/less)',
        representation: 'an angle tester (a square corner) beside each angle; tick greater, less or right angle',
        family: 'geometry',
        steps: ['Y3.B11.S1', 'Y3.B11.S2', 'Y3.B11.S3', 'Y4.B12.S1', 'Y4.B12.S3'],
    },
    hv_lines: {
        kind: 'new', skill: 'angles_lines:horizontal_vertical',
        name: 'Horizontal and Vertical Lines',
        teaches: 'recognising horizontal and vertical lines in shapes and on a grid',
        representation: 'shapes with sides marked; write H or V for each marked line',
        family: 'geometry',
        steps: ['Y3.B11.S5'],
    },
    draw_measure: {
        kind: 'new', skill: 'measurement:draw_lines_accurately',
        name: 'Measure and Draw Accurately',
        teaches: 'measuring lines to the nearest cm/mm and drawing lines of a given length',
        representation: 'a ruler picture under a line; option: draw a line of 7 cm on the grid (key shows the length)',
        family: 'geometry',
        steps: ['Y3.B11.S4'],
    },
    make_3d: {
        kind: 'new', skill: 'shapes_early:make_3d_shapes',
        name: 'Make 3-D Shapes',
        teaches: 'making skeleton 3-D shapes (straws and balls) and matching nets or faces to shapes',
        representation: 'a picture of a skeleton model; write how many straws and balls; option: match a net',
        family: 'geometry',
        steps: ['Y3.B11.S10'],
    },
    polygons: {
        kind: 'new', skill: 'shapes_classify:regular_irregular_polygons',
        name: 'Regular and Irregular Polygons',
        teaches: 'naming polygons by the number of sides, and telling regular from irregular',
        representation: 'polygon line drawings; write the name and tick regular / irregular',
        family: 'geometry',
        steps: ['Y4.B12.S6', 'Y5.B10.S9'],
    },
    translate_grid: {
        kind: 'new', skill: 'coordinates:translate_on_grid',
        name: 'Translate on a Grid',
        teaches: 'translating a shape or point on a first-quadrant grid and describing a translation (3 right, 2 up)',
        representation: 'a coordinate grid with a shape and its image; write the translation or draw the image',
        family: 'geometry',
        steps: ['Y4.B14.S3', 'Y4.B14.S4', 'Y5.B11.S2', 'Y5.B11.S4'],
    },
    draw_angles: {
        kind: 'new', skill: 'angles_lines:draw_angles',
        name: 'Draw Angles and Lines',
        teaches: 'drawing angles of a given size with a protractor and lines of a given length',
        representation: 'a protractor picture with a base line; the key shows the angle drawn; print-first skill',
        family: 'geometry',
        steps: ['Y5.B10.S3', 'Y5.B10.S5'],
    },
    angles_point: {
        kind: 'option', skill: 'angles_lines:additive_angles', option: 'point and straight line',
        name: 'Angles Around a Point and on a Line (option)',
        teaches: 'angles on a straight line sum to 180°, around a point to 360°',
        representation: 'diagram-type options on additive_angles',
        family: 'geometry',
        steps: ['Y5.B10.S6', 'Y5.B10.S7'],
    },
    lengths_angles_shapes: {
        kind: 'new', skill: 'shapes_classify:angles_in_shapes',
        name: 'Lengths and Angles in Shapes',
        teaches: 'using properties of rectangles, squares and regular polygons to find missing lengths and angles',
        representation: 'a shape with marked equal sides and right angles; write the missing values',
        family: 'geometry',
        steps: ['Y5.B10.S8'],
    },
    shapes_3d_props: {
        kind: 'new', skill: 'shapes_classify:3d_shape_properties',
        name: '3-D Shapes: Names and Properties',
        teaches: 'naming 3-D shapes (prisms, pyramids) from faces, edges and vertices and from their 2-D views or nets',
        representation: 'a 3-D shape drawing with a property table; option: which net makes it',
        family: 'geometry',
        steps: ['Y5.B10.S10'],
    },
    reflect_grid: {
        kind: 'new', skill: 'coordinates:reflect_on_grid',
        name: 'Reflect on a Grid',
        teaches: 'reflecting a shape in a horizontal or vertical mirror line on a square grid and in the axes',
        representation: 'a grid with a dashed mirror line and a shape; draw the reflection; key shows it',
        family: 'geometry',
        steps: ['Y5.B11.S6'],
    },
    angle_rules: {
        kind: 'new', skill: 'angles_lines:angle_rules',
        name: 'Angle Rules',
        teaches: 'vertically opposite angles, angles in a triangle (180°), in a quadrilateral (360°), in polygons, and special triangles',
        representation: 'a diagram with some angles given; write the missing angle',
        family: 'geometry',
        steps: ['Y6.B12.S3', 'Y6.B12.S4', 'Y6.B12.S5', 'Y6.B12.S6', 'Y6.B12.S7', 'Y6.B12.S8'],
    },
    circles: {
        kind: 'new', skill: 'shapes_classify:parts_of_a_circle',
        name: 'Parts of a Circle',
        teaches: 'radius, diameter and circumference; diameter = 2 × radius',
        representation: 'a circle with a marked line; write radius or diameter',
        family: 'geometry',
        steps: ['Y6.B12.S9'],
    },
    draw_accurately: {
        kind: 'new', skill: 'angles_lines:draw_shapes_accurately',
        name: 'Draw Shapes Accurately',
        teaches: 'drawing triangles and quadrilaterals from given lengths and angles with ruler and protractor',
        representation: 'a sketch with measurements; print-first skill with a key drawing',
        family: 'geometry',
        steps: ['Y6.B12.S10'],
    },
    four_quadrants: {
        kind: 'option', skill: 'coordinates:coordinate_all', option: 'problems',
        name: 'Coordinates in Four Quadrants (option)',
        teaches: 'reading, plotting and solving problems with coordinates in four quadrants (missing vertices, midpoints)',
        representation: 'a task option on coordinate_all',
        family: 'geometry',
        steps: ['Y6.B13.S3'],
    },

    // ---- measurement
    compare_size: {
        kind: 'new', skill: 'comparing:compare_size',
        name: 'Big and Small',
        teaches: 'comparing overall size (big, bigger, small, smaller) of two or three objects',
        representation: 'pairs of the same object drawn at different sizes; circle the bigger or the smaller',
        family: 'measurement',
        steps: ['R.B2.S1'],
    },
    capacity_early: {
        kind: 'new', skill: 'comparing:compare_capacity',
        name: 'Full, Empty, Holds More',
        teaches: 'capacity language (full, empty, half full, nearly full) and comparing how much two containers hold',
        representation: 'outline containers with a drawn fill line; circle full/empty or the one that holds more; option: order three',
        family: 'measurement',
        steps: ['R.B2.S3', 'R.B8.S3', 'R.B8.S4', 'Y1.B8.S4', 'Y1.B8.S5', 'Y2.B7.S5'],
    },
    balance: {
        kind: 'new', skill: 'measurement:balance_scales',
        name: 'Balanced or Not?',
        teaches: 'a balance scale shows heavier, lighter or equal (balanced) mass',
        representation: 'a drawn pan balance tipped or level with objects in each pan; tick heavier, lighter or balanced',
        family: 'measurement',
        steps: ['R.B8.S2'],
    },
    day_order: {
        kind: 'new', skill: 'measurement:order_events',
        name: 'First, Next, Then',
        teaches: 'sequencing events and times of day (morning, afternoon, evening, night; before, after; first, next, then)',
        representation: 'three or four picture cards; number them 1-4 in order; option: before/after questions',
        family: 'measurement',
        steps: ['R.B6.S4', 'R.B10.S6', 'Y1.B14.S1'],
    },
    time_talk: {
        kind: 'new', skill: 'measurement:time_words',
        name: 'Time Words',
        teaches: 'the language of time (today, yesterday, tomorrow, days of the week, months, seasons, before, after)',
        representation: 'calendar strip or picture timeline; circle or write the word from a bank',
        family: 'measurement',
        steps: ['R.B10.S5', 'Y1.B14.S2', 'Y1.B14.S3'],
    },
    nonstandard_mass: {
        kind: 'new', skill: 'measurement:measure_mass_cubes',
        name: 'Measure Mass with Cubes',
        teaches: 'measuring mass with non-standard units (cubes, marbles) on a balance, and comparing masses by the count',
        representation: 'a drawn balance with an object in one pan and cubes in the other; write how many cubes',
        family: 'measurement',
        steps: ['Y1.B8.S2', 'Y1.B8.S3'],
    },
    nonstandard_capacity: {
        kind: 'new', skill: 'measurement:measure_capacity_cups',
        name: 'Measure Capacity with Cups',
        teaches: 'measuring capacity and volume with non-standard units (cups, spoons) and comparing',
        representation: 'containers with a count of cups drawn beside them; write how many cups; circle the one that holds more',
        family: 'measurement',
        steps: ['Y1.B8.S6', 'Y1.B8.S7'],
    },
    time_units: {
        kind: 'new', skill: 'measurement:hours_minutes_seconds',
        name: 'Hours, Minutes or Seconds?',
        teaches: 'a sense of time units: which activities take seconds, minutes or hours',
        representation: 'activity pictures with a unit word bank; option: longer/shorter',
        family: 'measurement',
        steps: ['Y1.B14.S4'],
    },
    money_notes: {
        kind: 'option', skill: 'measurement:coin_value', option: 'notes',
        name: 'Recognise Notes (option)',
        teaches: 'recognising banknotes and their values alongside coins (the school teaches US dollars)',
        representation: 'add notes to the coin-value picture bank',
        family: 'measurement',
        steps: ['Y1.B13.S3'],
    },
    ruler_cm: {
        kind: 'option', skill: 'measurement:reading_ruler', option: 'centimetres and millimetres',
        name: 'Read a Centimetre Ruler (option)',
        teaches: 'measuring lengths in whole centimetres, then millimetres, on a metric ruler (the skill reads inches only)',
        representation: 'a unit option (cm, mm) on reading_ruler with the same arrow-and-ruler picture',
        family: 'measurement',
        steps: ['Y1.B7.S3', 'Y2.B6.S1', 'Y3.B5.S2'],
    },
    money_uk: {
        kind: 'option', skill: 'measurement:money_count', option: 'notes and cents',
        name: 'Count Money (option)',
        teaches: 'counting notes and coins together and in dollars and cents, choosing coins to make an amount, making the same amount two ways',
        representation: 'options on money_count / equiv_coin_sets: notes, dollars-and-cents mode, "make it two ways"',
        family: 'measurement',
        steps: ['Y2.B4.S2', 'Y2.B4.S3', 'Y2.B4.S8'],
    },
    money_2step: {
        kind: 'new', skill: 'measurement:money_two_step',
        name: 'Two-Step Money Problems',
        teaches: 'two-step money word problems (buy two items, then find the change)',
        representation: 'a price list drawn as tags plus a short story; bar model support level',
        family: 'measurement',
        steps: ['Y2.B4.S10', 'Y3.B9.S4', 'Y4.B10.S6'],
    },
    length_ops: {
        kind: 'new', skill: 'measurement:length_word_problems',
        name: 'Length Word Problems',
        teaches: 'adding, subtracting, multiplying and dividing lengths and heights in context (same units)',
        representation: 'a drawn ruler or bar model with the lengths labelled; write the answer with its unit',
        family: 'measurement',
        steps: ['Y2.B6.S5'],
    },
    metres: {
        kind: 'option', skill: 'measurement:reading_ruler', option: 'metres',
        name: 'Measure in Metres (option)',
        teaches: 'measuring and comparing lengths in metres, choosing cm or m',
        representation: 'a metre stick picture; unit choice cm/m',
        family: 'measurement',
        steps: ['Y2.B6.S2'],
    },
    mass_scales: {
        kind: 'new', skill: 'measurement:read_scales',
        name: 'Read Scales (g, kg, ml, l)',
        teaches: 'reading mass and capacity scales in grams, kilograms, millilitres and litres with scale steps of 1, 2, 5, 10, 100',
        representation: 'a drawn dial or jug scale; write the reading with the unit; option: scale step',
        family: 'measurement',
        steps: ['Y2.B7.S2', 'Y2.B7.S3', 'Y2.B7.S7', 'Y3.B7.S1', 'Y3.B7.S3', 'Y3.B7.S4', 'Y3.B7.S8'],
    },
    mass_ops: {
        kind: 'new', skill: 'measurement:mass_capacity_word_problems',
        name: 'Mass and Capacity Word Problems',
        teaches: 'adding, subtracting, multiplying and dividing masses and capacities in context',
        representation: 'picture of scales/jugs with values; write the answer with the unit',
        family: 'measurement',
        steps: ['Y2.B7.S4', 'Y2.B7.S8', 'Y3.B7.S5', 'Y3.B7.S6', 'Y3.B7.S10', 'Y3.B7.S11'],
    },
    time_facts: {
        kind: 'new', skill: 'measurement:time_facts',
        name: 'Minutes, Hours and Days',
        teaches: 'knowing and using 60 minutes in an hour, 24 hours in a day, 7 days in a week, and converting simple times',
        representation: 'fact cells with a clock or timeline support; option: word problems',
        family: 'measurement',
        steps: ['Y2.B9.S6', 'Y2.B9.S7'],
    },
    mm_cm_m: {
        kind: 'option', skill: 'measurement:length_metric', option: 'mm and cm',
        name: 'Metres, Centimetres, Millimetres (option)',
        teaches: 'measuring in mm, cm and m and converting between them (2 m 30 cm = 230 cm)',
        representation: 'ruler pictures in mm; mixed-unit answers (_ m _ cm)',
        family: 'measurement',
        steps: ['Y3.B5.S1', 'Y3.B5.S3'],
    },
    compare_lengths: {
        kind: 'new', skill: 'measurement:compare_lengths',
        name: 'Compare Lengths',
        teaches: 'comparing and ordering lengths in mixed units (1 m 20 cm vs 125 cm)',
        representation: 'two labelled bars; write <, > or = after converting',
        family: 'measurement',
        steps: ['Y3.B5.S7'],
    },
    add_sub_lengths: {
        kind: 'new', skill: 'measurement:add_subtract_lengths',
        name: 'Add and Subtract Lengths',
        teaches: 'adding and subtracting lengths in the same and mixed units, including bar-model "longer by" / "shorter by" problems',
        representation: 'a bar model with two lengths; write the total or the difference with the unit',
        family: 'measurement',
        steps: ['Y3.B5.S8', 'Y3.B5.S9'],
    },
    money_convert: {
        kind: 'option', skill: 'measurement:money_notation', option: 'convert',
        name: 'Dollars and Cents (option)',
        teaches: 'converting between cents and dollars-and-cents (345 cents = $3.45) and recording money',
        representation: 'option: cents to dollars and back',
        family: 'measurement',
        steps: ['Y3.B9.S2', 'Y4.B10.S2'],
    },
    roman_12: {
        kind: 'new', skill: 'measurement:roman_numerals_clock',
        name: 'Roman Numerals to 12',
        teaches: 'reading Roman numerals I to XII on a clock face',
        representation: 'a clock face with Roman numerals; write the time or the numeral value',
        family: 'measurement',
        steps: ['Y3.B10.S1'],
    },
    time_calendar: {
        kind: 'new', skill: 'measurement:calendar_and_units',
        name: 'Years, Months, Days, Hours',
        teaches: 'converting and comparing units of time: years, months, weeks, days, hours, minutes, seconds; days in each month; leap years',
        representation: 'a calendar page or conversion table; fill the missing values',
        family: 'measurement',
        steps: ['Y3.B10.S6', 'Y3.B10.S7', 'Y3.B10.S10', 'Y3.B10.S11', 'Y4.B11.S1', 'Y4.B11.S2'],
    },
    area_compare: {
        kind: 'new', skill: 'area_perimeter:compare_areas',
        name: 'Make and Compare Areas',
        teaches: 'making shapes with a given area from squares and comparing areas by counting squares',
        representation: 'two shapes on squared paper; circle the larger area or draw a shape of 6 squares',
        family: 'measurement',
        steps: ['Y4.B3.S3', 'Y4.B3.S4'],
    },
    km_m: {
        kind: 'option', skill: 'measurement:length_metric', option: 'km and m mixed',
        name: 'Kilometres and Metres (option)',
        teaches: 'measuring and converting km and m, including mixed units (2 km 300 m)',
        representation: 'mixed-unit answer option',
        family: 'measurement',
        steps: ['Y4.B6.S1'],
    },
    missing_lengths: {
        kind: 'new', skill: 'area_perimeter:rectilinear_missing_sides',
        name: 'Missing Lengths in Rectilinear Shapes',
        teaches: 'finding missing side lengths in rectilinear shapes and then their perimeter',
        representation: 'an L or T shape with some sides labelled; write the missing lengths',
        family: 'measurement',
        steps: ['Y4.B6.S6', 'Y4.B6.S7'],
    },
    regular_polygon: {
        kind: 'option', skill: 'area_perimeter:perimeter', option: 'regular polygons',
        name: 'Perimeter of Regular Polygons (option)',
        teaches: 'perimeter of regular polygons from one side (5 sides of 7 cm) and of any polygon',
        representation: 'a polygon-type option on the perimeter skill',
        family: 'measurement',
        steps: ['Y4.B6.S8', 'Y5.B8.S3'],
    },
    money_estimate: {
        kind: 'new', skill: 'measurement:estimate_with_money',
        name: 'Estimate with Money',
        teaches: 'rounding prices to the nearest dollar to estimate totals and change',
        representation: 'a price list; write the rounded prices and the estimate',
        family: 'measurement',
        steps: ['Y4.B10.S4'],
    },
    time_24h_convert: {
        kind: 'new', skill: 'measurement:twenty_four_hour_clock',
        name: 'The 24-Hour Clock',
        teaches: 'converting between 12-hour and 24-hour times and between analogue and digital',
        representation: 'an analogue clock beside a 24-hour display; write the time; option: a.m./p.m. to 24-hour',
        family: 'measurement',
        steps: ['Y4.B11.S4', 'Y4.B11.S5'],
    },
    area_estimate: {
        kind: 'new', skill: 'area_perimeter:estimate_area',
        name: 'Estimate Area',
        teaches: 'estimating the area of irregular shapes by counting whole and half squares',
        representation: 'an irregular blob on squared paper; count whole and part squares; write the estimate',
        family: 'measurement',
        steps: ['Y5.B8.S6'],
    },
    timetables: {
        kind: 'new', skill: 'measurement:read_timetables',
        name: 'Timetables',
        teaches: 'reading and calculating with bus and train timetables (times, durations, which bus)',
        representation: 'a drawn timetable table; answer questions with times and durations',
        family: 'measurement',
        steps: ['Y5.B9.S5', 'Y5.B14.S6'],
    },
    metric_imperial: {
        kind: 'new', skill: 'measurement:metric_imperial',
        name: 'Metric and Imperial Units',
        teaches: 'approximate conversions between metric and imperial units (1 inch ≈ 2.5 cm, 1 kg ≈ 2.2 lb)',
        representation: 'a conversion fact box beside each question',
        family: 'measurement',
        steps: ['Y5.B14.S4'],
    },
    volume_cubes: {
        kind: 'new', skill: 'area_perimeter:volume_counting_cubes',
        name: 'Volume by Counting Cubes',
        teaches: 'volume as the number of unit cubes (cm³), comparing volumes and estimating volume and capacity',
        representation: 'isometric drawings of cube solids; write how many cubes / cm³; option: which has more',
        family: 'measurement',
        steps: ['Y5.B15.S1', 'Y5.B15.S2', 'Y5.B15.S3', 'Y5.B15.S4', 'Y6.B10.S7'],
    },
    time_convert: {
        kind: 'option', skill: 'measurement:unit_conversion_word', option: 'time',
        name: 'Convert Units of Time (option)',
        teaches: 'converting between seconds, minutes, hours, days, weeks, months and years',
        representation: 'a time-only unit option',
        family: 'measurement',
        steps: ['Y5.B14.S5'],
    },
    metric_calc: {
        kind: 'new', skill: 'measurement:metric_measure_problems',
        name: 'Calculate with Metric Measures',
        teaches: 'calculating with metric measures in context, converting first when the units differ',
        representation: 'a problem with two units; write the conversion then the answer',
        family: 'measurement',
        steps: ['Y6.B5.S3'],
    },
    miles_km: {
        kind: 'new', skill: 'measurement:miles_kilometres',
        name: 'Miles and Kilometres',
        teaches: 'converting between miles and kilometres using 5 miles ≈ 8 km',
        representation: 'a conversion graph or double number line',
        family: 'measurement',
        steps: ['Y6.B5.S4'],
    },
    same_area: {
        kind: 'new', skill: 'area_perimeter:same_area_different_perimeter',
        name: 'Same Area, Different Perimeter',
        teaches: 'shapes with the same area but different perimeters, and the reverse',
        representation: 'shapes on squared paper; write area and perimeter for each; circle the pair that match',
        family: 'measurement',
        steps: ['Y6.B10.S1'],
    },
    area_triangle_grid: {
        kind: 'option', skill: 'area_perimeter:area_triangle', option: 'counting squares and right-angled',
        name: 'Area of Triangles (option)',
        teaches: 'the area of a triangle by counting squares, then as half a rectangle for right-angled and any triangles',
        representation: 'grid and "half the rectangle" supports on area_triangle',
        family: 'measurement',
        steps: ['Y6.B10.S3'],
    },
    parallelogram: {
        kind: 'new', skill: 'area_perimeter:area_parallelogram',
        name: 'Area of a Parallelogram',
        teaches: 'area of a parallelogram as base × perpendicular height, by cutting and moving a triangle',
        representation: 'a parallelogram on squared paper with the height dashed; write the area',
        family: 'measurement',
        steps: ['Y6.B10.S6'],
    },

    // ---- number_theory
    multiples_2_5_10: {
        kind: 'option', skill: 'number_theory:multiples', option: '2, 5, 10 at Grade 2',
        name: 'Multiples of 2, 5 and 10 (option)',
        teaches: 'recognising multiples of 2, 5 and 10 (odd/even, ends in 0 or 5)',
        representation: 'a base option limited to 2, 5 and 10 with numbers to 100',
        family: 'number_theory',
        steps: ['Y3.B3.S3', 'Y3.B3.S4'],
    },
    common_mf: {
        kind: 'option', skill: 'number_theory:multiples', option: 'common multiples and factors',
        name: 'Common Multiples and Common Factors (option)',
        teaches: 'listing multiples and factors of two numbers and circling those they share (all of them, not only the least or greatest)',
        representation: 'two lists side by side or a Venn diagram; circle the common ones',
        family: 'number_theory',
        steps: ['Y5.B3.S2', 'Y5.B3.S4', 'Y6.B2.S2', 'Y6.B2.S3'],
    },
    square_cube: {
        kind: 'new', skill: 'number_theory:square_and_cube_numbers',
        name: 'Square and Cube Numbers',
        teaches: 'square numbers as square arrays and cube numbers as cubes, with the notation 5² and 2³',
        representation: 'dot arrays and cube drawings; write the number and the notation; option: is it square?',
        family: 'number_theory',
        steps: ['Y5.B3.S6', 'Y5.B3.S7', 'Y6.B2.S6'],
    },
    divisibility_rules: {
        kind: 'option', skill: 'number_theory:divisibility_sort', option: 'rules',
        name: 'Rules of Divisibility (option)',
        teaches: 'the divisibility rules for 2, 3, 4, 5, 6, 8, 9, 10, 25 stated and applied',
        representation: 'a rule card beside each sort; option: "which rule tells you?"',
        family: 'number_theory',
        steps: ['Y6.B2.S4'],
    },

    // ---- operations
    part_whole: {
        kind: 'new', skill: 'composing:part_whole_model',
        name: 'Part-Whole Model',
        teaches: 'parts and wholes: the cherry part-whole model, writing the four number sentences it shows, and finding a missing part',
        representation: 'the bar/cherry part-whole diagram in B&W with one box empty; write the missing part or the number sentence',
        family: 'operations',
        steps: ['Y1.B2.S1'],
        improves: ['Y1.B2.S2'],
    },
    systematic_bonds: {
        kind: 'new', skill: 'composing:bonds_in_order',
        name: 'Number Bonds in Order',
        teaches: 'listing all the bonds of a number systematically (0+5, 1+4, 2+3 ...) and seeing the pattern',
        representation: 'a two-column table with the first rows filled; complete it; option: ten frame beside each row',
        family: 'operations',
        steps: ['Y1.B2.S6'],
    },
    equal_groups_early: {
        kind: 'new', skill: 'multiplication:make_equal_groups',
        name: 'Make Equal Groups',
        teaches: 'recognising, making and adding equal groups, and doubles as two equal groups',
        representation: 'groups drawn in rings; tick equal or not, write groups of and the repeated addition',
        family: 'operations',
        steps: ['Y2.B5.S2'],
    },
    add_sub_1_2: {
        kind: 'new', skill: 'addition:add_sub_1_or_2',
        name: 'Add or Subtract 1 or 2',
        teaches: 'adding or subtracting 1 or 2 by counting on or back, linked to 1 more / 1 less',
        representation: 'a number track with the start circled; write the answer; mixed + and - on one page',
        family: 'operations',
        steps: ['Y1.B2.S17'],
    },
    bonds_20: {
        kind: 'new', skill: 'composing:bonds_to_20',
        name: 'Number Bonds to 20',
        teaches: 'bonds to 20 and bonds within 20 from bonds to 10 (3 + 7 = 10 so 13 + 7 = 20), used to add and subtract ones',
        representation: 'two ten frames and a part-whole diagram; write the missing part',
        family: 'operations',
        steps: ['Y1.B5.S3'],
        improves: ['Y1.B5.S6'],
    },
    difference: {
        kind: 'new', skill: 'subtraction:find_the_difference',
        name: 'Find the Difference',
        teaches: 'subtraction as difference: comparing two amounts (bars, cubes, number line) and finding how many more or fewer',
        representation: 'two cube trains or bars drawn one above the other; write the difference and the number sentence',
        family: 'operations',
        steps: ['Y1.B5.S8'],
    },
    bonds_100: {
        kind: 'new', skill: 'addition:bonds_to_100',
        name: 'Bonds to 100',
        teaches: 'pairs of tens that make 100 (30 + 70) and later any pair (37 + 63), from bonds to 10',
        representation: 'a hundred square or bead string with part shaded; part-whole diagram; write the missing part',
        family: 'operations',
        steps: ['Y2.B2.S4', 'Y3.B2.S19'],
    },
    add_next_10: {
        kind: 'new', skill: 'addition:bridge_to_next_ten',
        name: 'To the Next Ten',
        teaches: 'adding to reach the next multiple of 10 (38 + 2 = 40), then crossing it (38 + 5 = 38 + 2 + 3), and subtracting back to a ten (43 - 3)',
        representation: 'a number line with the ten marked; write the jump to the ten and then the rest',
        family: 'operations',
        steps: ['Y2.B2.S8', 'Y2.B2.S11', 'Y3.B2.S6', 'Y3.B2.S8'],
        improves: ['Y2.B2.S9'],
    },
    compare_sentences: {
        kind: 'new', skill: 'algebra:compare_number_sentences',
        name: 'Compare Number Sentences',
        teaches: 'comparing two expressions with <, > or = by reasoning, not only calculating (7 + 5 ___ 7 + 6)',
        representation: 'two expressions with a circle between; write <, > or =',
        family: 'operations',
        steps: ['Y2.B2.S20'],
    },
    add_sub_patterns: {
        kind: 'new', skill: 'addition:add_sub_patterns',
        name: 'Spot the Pattern (+/−)',
        teaches: 'using known facts to add and subtract 1s, 10s and 100s (3 + 4, 30 + 40, 300 + 400) and seeing what changes and what stays the same',
        representation: 'a three-row fact ladder with the first row done; complete the others',
        family: 'operations',
        steps: ['Y3.B2.S2', 'Y3.B2.S5', 'Y3.B2.S10', 'Y4.B2.S1'],
    },
    cross_100: {
        kind: 'option', skill: 'addition:add_sub_100s', option: 'tens across 100',
        name: 'Add and Subtract 10s Across 100 (option)',
        teaches: 'adding or subtracting multiples of 10 across a hundred (180 + 30, 210 − 40)',
        representation: 'a band option "tens across 100" with a number line support',
        family: 'operations',
        steps: ['Y3.B2.S7', 'Y3.B2.S9'],
    },
    make_decisions: {
        kind: 'new', skill: 'addition:choose_a_method',
        name: 'Mental or Written?',
        teaches: 'choosing a mental strategy or the column method for a calculation, and explaining the choice',
        representation: 'a list of calculations; tick mental or written, then solve',
        family: 'operations',
        steps: ['Y3.B2.S22'],
    },
    tables_links: {
        kind: 'new', skill: 'multiplication:related_tables',
        name: 'Related Times-Tables',
        teaches: 'using one table to find another: 2 → 4 → 8 by doubling, 3 → 6 → 12, 5 and 10, and 9 as 10 − 1',
        representation: 'a three-column table with the known table given; fill the doubled table',
        family: 'operations',
        steps: ['Y3.B3.S15', 'Y4.B4.S6', 'Y4.B5.S7', 'Y4.B5.S15'],
    },
    how_many_ways: {
        kind: 'new', skill: 'multiplication:how_many_ways',
        name: 'How Many Ways?',
        teaches: 'counting combinations systematically (3 tops × 4 bottoms) as a multiplication',
        representation: 'a picture grid of items; list or draw every pair; write the multiplication',
        family: 'operations',
        steps: ['Y3.B4.S11'],
    },
    mult_three: {
        kind: 'new', skill: 'multiplication:multiply_three_numbers',
        name: 'Multiply Three Numbers',
        teaches: 'multiplying three 1-digit numbers using the associative property (2 × 5 × 7 = 10 × 7)',
        representation: 'three-factor expressions with a bracket prompt to choose the easy pair first',
        family: 'operations',
        steps: ['Y4.B4.S12', 'Y4.B4.S13'],
        improves: ['Y4.B5.S2'],
    },
    correspondence: {
        kind: 'new', skill: 'multiplication:correspondence_problems',
        name: 'Correspondence Problems',
        teaches: 'one-to-many correspondence (each of 3 hats with each of 4 scarves; 1 bag holds 5) as multiplication',
        representation: 'a table or tree diagram to complete, then the multiplication',
        family: 'operations',
        steps: ['Y4.B5.S14'],
    },
    informal_mult: {
        kind: 'new', skill: 'multiplication:partition_multiply',
        name: 'Partition to Multiply',
        teaches: 'informal written multiplication by partitioning (23 × 4 = 20 × 4 + 3 × 4), before the column method',
        representation: 'a part-whole or grid model with the partial products to fill',
        family: 'operations',
        steps: [],
        improves: ['Y4.B5.S8'],
    },
    mental_add_sub: {
        kind: 'new', skill: 'addition:mental_strategies',
        name: 'Mental Addition and Subtraction',
        teaches: 'mental strategies for large numbers: partitioning, counting on, compensating, near multiples',
        representation: 'a strategy prompt (round and adjust) beside each calculation',
        family: 'operations',
        steps: ['Y5.B2.S1'],
    },
    inverse_check: {
        kind: 'option', skill: 'subtraction:sub_check_by_adding', option: 'large numbers and addition',
        name: 'Inverse Operations (option)',
        teaches: 'using the inverse to check and to find missing numbers in addition and subtraction with 5- and 6-digit numbers',
        representation: 'band option to 1,000,000 and an "addition checked by subtracting" variant',
        family: 'operations',
        steps: ['Y5.B2.S5'],
    },
    compare_calcs: {
        kind: 'new', skill: 'algebra:compare_calculations',
        name: 'Compare Calculations',
        teaches: 'comparing two calculations without working them out (4,580 + 2,000 vs 4,580 + 1,999)',
        representation: 'two expressions with a circle between them; write <, > or =; reasoning prompt',
        family: 'operations',
        steps: ['Y5.B2.S7'],
    },
    mult_multiples: {
        kind: 'option', skill: 'multiplication:mult_zeros', option: 'multiples of 10, 100, 1,000',
        name: 'Multiples of 10, 100 and 1,000 (option)',
        teaches: 'recognising and generating multiples of 10, 100 and 1,000',
        representation: 'a "is it a multiple of" task on number_theory:multiples with base 10/100/1,000',
        family: 'operations',
        steps: ['Y5.B3.S10'],
    },
    long_mult: {
        kind: 'new', skill: 'multiplication:long_multiplication_4x2',
        name: 'Long Multiplication and Division (4-digit)',
        teaches: 'long multiplication of a 4-digit by a 2-digit number, short division of a 4-digit number, and choosing an efficient division method',
        representation: 'a column grid with carry boxes and the placeholder row; option: short division bus stop with exchange boxes',
        family: 'operations',
        steps: ['Y5.B5.S1', 'Y5.B5.S5', 'Y5.B5.S8', 'Y5.B5.S10'],
        improves: ['Y6.B2.S7'],
    },
    div_factors: {
        kind: 'new', skill: 'division:divide_using_factors',
        name: 'Division Using Factors',
        teaches: 'dividing by a 2-digit number by dividing by its factors in turn (420 ÷ 12 = 420 ÷ 2 ÷ 6)',
        representation: 'a two-step arrow diagram with the factor pair chosen',
        family: 'operations',
        steps: ['Y6.B2.S10'],
    },
    long_div_rem: {
        kind: 'option', skill: 'division:long_div_2digit', option: 'remainders',
        name: 'Long Division with Remainders (option)',
        teaches: 'long division by a 2-digit number with remainders written as r, a fraction or a decimal',
        representation: 'a remainder-form option on long_div_2digit',
        family: 'operations',
        steps: ['Y6.B2.S12'],
    },
    mental_estimate: {
        kind: 'new', skill: 'number_sense:estimate_and_check',
        name: 'Mental Calculation and Estimation',
        teaches: 'estimating to check answers to calculations with all four operations and choosing mental methods',
        representation: 'a calculation with a proposed answer; round, estimate and tick reasonable or not',
        family: 'operations',
        steps: ['Y6.B2.S16'],
    },
    known_facts: {
        kind: 'new', skill: 'multiplication:reason_from_known_facts',
        name: 'Reason from Known Facts',
        teaches: 'deriving new facts from a known one (24 × 15 = 360 so 24 × 16 = 384, 2.4 × 15 = 36)',
        representation: 'a given fact and a list of related calculations to answer without recalculating',
        family: 'operations',
        steps: ['Y6.B2.S17'],
    },
    add_or_mult: {
        kind: 'new', skill: 'algebra:add_or_multiply',
        name: 'Add or Multiply?',
        teaches: 'recognising additive and multiplicative relationships between two quantities',
        representation: 'two sets of values in a table; tick "add 3" or "multiply by 3"',
        family: 'operations',
        steps: ['Y6.B6.S1'],
    },

    // ---- placevalue
    compare_small: {
        kind: 'option', skill: 'placevalue:compare', option: 'band 10/20 and pictures',
        name: 'Compare Numbers to 10 and 20 (option)',
        teaches: 'comparing and ordering numbers and groups of objects within 10 and 20 (and tens-and-ones pictures to 100) with <, >, = and the words greater than / less than / equal to (the lowest band today is 99)',
        representation: 'band options 10 and 20 on placevalue:compare and the two order skills, a ten-frame or tens-and-ones picture support level',
        family: 'placevalue',
        steps: ['Y1.B1.S12', 'Y1.B1.S13', 'Y1.B1.S14', 'Y1.B4.S11', 'Y1.B4.S12', 'Y2.B1.S12'],
    },
    nl_20: {
        kind: 'new', skill: 'number_sense:number_line_scales',
        name: 'Numbers on a Number Line (any scale)',
        teaches: 'the number line as a counting and place-value tool: count along, find, place and estimate numbers on 0-20, 0-50, 0-100, 0-1,000, 0-10,000 and 0-1,000,000 lines, counting in 1s, 10s, 100s ... and with only some ticks labelled',
        representation: 'a drawn number line with some ticks labelled; write the number at the arrow, or mark a number; option: scale; option: estimate on a line with only the ends marked',
        family: 'placevalue',
        steps: ['Y1.B1.S15', 'Y1.B4.S8', 'Y1.B4.S9', 'Y1.B4.S10', 'Y1.B6.S6', 'Y1.B6.S7', 'Y1.B12.S4', 'Y2.B1.S9', 'Y2.B1.S10', 'Y2.B1.S11', 'Y3.B1.S3', 'Y3.B1.S10', 'Y3.B1.S11', 'Y4.B1.S3', 'Y4.B1.S9', 'Y4.B1.S10', 'Y5.B1.S9'],
    },
    flex_partition: {
        kind: 'new', skill: 'placevalue:flexible_partition',
        name: 'Partition Numbers Flexibly',
        teaches: 'partitioning a 2-, 3- or 4-digit number in more than one way (45 = 40 + 5 = 30 + 15), with base-10 and part-whole models',
        representation: 'a part-whole diagram with one part given; base-10 picture beside it; write the other part',
        family: 'placevalue',
        steps: ['Y2.B1.S7', 'Y3.B1.S7', 'Y4.B1.S7'],
        improves: ['Y3.B1.S2'],
    },
    roman_100: {
        kind: 'new', skill: 'placevalue:roman_numerals',
        name: 'Roman Numerals',
        teaches: 'reading and writing Roman numerals to 100 (I, V, X, L, C) and knowing there is no zero',
        representation: 'numeral cards with a symbol key; write the value or the numeral',
        family: 'placevalue',
        steps: ['Y4.B1.S13'],
    },
    roman_1000: {
        kind: 'option', skill: 'placevalue:roman_numerals', option: 'to 1,000',
        name: 'Roman Numerals to 1,000 (option)',
        teaches: 'reading and writing Roman numerals to 1,000 (D, M) and years',
        representation: 'a band option on the roman_100 proposal',
        family: 'placevalue',
        steps: ['Y5.B1.S1'],
    },
    pv_more_less_big: {
        kind: 'option', skill: 'placevalue:more_less_100', option: '10,000 and 100,000',
        name: '10,000 and 100,000 More or Less (option)',
        teaches: 'finding 10, 100, 1,000, 10,000 and 100,000 more or less than a number to 1,000,000',
        representation: 'step values 10,000 and 100,000 on more_less_100',
        family: 'placevalue',
        steps: ['Y5.B1.S7'],
    },
    dec_missing: {
        kind: 'option', skill: 'placevalue:place_value_10x', option: 'missing number',
        name: 'Multiply and Divide Decimals: Missing Values (option)',
        teaches: 'finding the missing number or the missing power of 10 (3.4 × __ = 340)',
        representation: 'an "unknown" option on place_value_10x',
        family: 'placevalue',
        steps: ['Y5.B12.S12'],
    },
    big_numbers: {
        kind: 'option', skill: 'placevalue:pv_digit_drag', option: 'to 10,000,000',
        name: 'Numbers to 10,000,000 (option)',
        teaches: 'reading, writing, partitioning, comparing and placing numbers to ten million',
        representation: 'band 9,999,999 on pv_digit_drag, number_word_names, compare and the number-line proposal',
        family: 'placevalue',
        steps: ['Y6.B1.S2', 'Y6.B1.S3', 'Y6.B1.S5'],
    },

    // ---- ratio
    scale: {
        kind: 'new', skill: 'conversions:scale_drawing',
        name: 'Scale Drawing and Scale Factors',
        teaches: 'enlarging shapes by a scale factor, scale drawings and similar shapes (find the missing side)',
        representation: 'shapes on squared paper with one side of the image given; write the scale factor or the missing side',
        family: 'ratio',
        steps: ['Y6.B6.S5', 'Y6.B6.S6', 'Y6.B6.S7'],
    },
    ratio_problems: {
        kind: 'new', skill: 'conversions:ratio_problems_bar',
        name: 'Ratio and Proportion Problems',
        teaches: 'ratio, proportion and recipe problems solved with a bar model or ratio table',
        representation: 'a bar model / ratio table beside a short story; write the missing amount',
        family: 'ratio',
        steps: ['Y6.B6.S10'],
    },
};

/* ------------------------------------------------------------ lookups */
const stepById = new Map(WRM_STEPS.map((s) => [s.id, s]));
const blockById = new Map(WRM_BLOCKS.map((b) => [b.id, b]));
const yearById = new Map(WRM_YEARS.map((y) => [y.id, y]));

/** A step record { id, title, year, block, ccss, ee, flag, ... } with its block and year, or null. */
export function wrmStep(id) {
    const s = stepById.get(String(id || '').trim());
    if (!s) return null;
    const blockId = s.id.replace(/\.S\d+$/, '');
    return { ...s, block: blockById.get(blockId) || null, year: yearById.get(s.id.split('.')[0]) || null };
}

const entryStep = (e) => (typeof e === 'string' ? e : e.step);

function resolveAlias(categoryId, skillId) {
    const a = SKILL_ALIASES[`${categoryId}:${skillId}`] || SKILL_ALIASES[skillId];
    if (!a) return null;
    return { categoryId: a.categoryId || categoryId, skillId: a.skillId };
}

/**
 * The small steps a skill teaches: [{ id, title, partial, note, key, via }] in curriculum order.
 * `partial` is the text of what is missing ('' when the skill fully teaches the step). Follows an
 * alias for a retired id; returns [] for an unknown skill.
 */
export function wrmFor(categoryId, skillId) {
    let key = `${categoryId}:${skillId}`;
    let via = '';
    if (!SKILL_WRM[key]) {
        const to = resolveAlias(categoryId, skillId);
        if (!to || !SKILL_WRM[`${to.categoryId}:${to.skillId}`]) return [];
        via = key;
        key = `${to.categoryId}:${to.skillId}`;
    }
    return SKILL_WRM[key].map((e) => {
        const s = stepById.get(entryStep(e));
        return { id: entryStep(e), title: s ? s.title : '', partial: (typeof e === 'object' && e.partial) || '', note: (typeof e === 'object' && e.note) || '', key, via };
    });
}

let rev = null;
function reverseIndex() {
    if (rev) return rev;
    rev = new Map();
    for (const [key, list] of Object.entries(SKILL_WRM)) {
        for (const e of list) {
            const id = entryStep(e);
            if (!rev.has(id)) rev.set(id, []);
            rev.get(id).push({ key, partial: (typeof e === 'object' && e.partial) || '', note: (typeof e === 'object' && e.note) || '' });
        }
    }
    return rev;
}

/**
 * The skills that teach a step, as 'categoryId:skillId' keys (full coverage only). Pass
 * { withPartial: true } to get [{ key, partial, note }] for every tagged skill instead.
 */
export function skillsForWrmStep(id, { withPartial = false } = {}) {
    const list = reverseIndex().get(String(id || '').trim()) || [];
    return withPartial ? list.map((x) => ({ ...x })) : list.filter((x) => !x.partial).map((x) => x.key);
}

/** The proposals that would close or strengthen a step: [{ id, ...proposal, closes }]. */
export function proposalsForWrmStep(id) {
    const out = [];
    for (const [pid, p] of Object.entries(WRM_PROPOSALS)) {
        if (p.steps.includes(id)) out.push({ id: pid, ...p, closes: true });
        else if ((p.improves || []).includes(id)) out.push({ id: pid, ...p, closes: false });
    }
    return out;
}

/**
 * Every step with its coverage:
 * { steps: [{ ...record, skills, partials, status: 'covered' | 'partial' | 'gap', proposals }], summary }.
 * A step is covered when at least one skill teaches it fully; partial when skills teach only part
 * of it; a gap when no skill is tagged at all. Summary counts are overall and per year.
 */
export function wrmCoverage() {
    const idx = reverseIndex();
    const steps = WRM_STEPS.map((s) => {
        const hits = idx.get(s.id) || [];
        const skills = hits.filter((h) => !h.partial).map((h) => h.key);
        const partials = hits.filter((h) => h.partial).map((h) => ({ key: h.key, missing: h.partial }));
        const status = skills.length ? 'covered' : partials.length ? 'partial' : 'gap';
        return { ...s, skills, partials, status, proposals: proposalsForWrmStep(s.id).map((p) => p.id) };
    });
    const tally = { total: 0, covered: 0, partial: 0, gap: 0, byYear: {} };
    for (const s of steps) {
        const y = s.id.split('.')[0];
        const t = tally.byYear[y] || (tally.byYear[y] = { total: 0, covered: 0, partial: 0, gap: 0 });
        t.total += 1; tally.total += 1;
        t[s.status] += 1; tally[s.status] += 1;
    }
    return { steps, summary: tally };
}

export { WRM_YEARS, WRM_BLOCKS, WRM_STEPS };
