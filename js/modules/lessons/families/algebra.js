// js/modules/lessons/families/algebra.js
// LESSON FAMILY "algebra" - Algebra: patterns, missing numbers, equations, formulae, sequences.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.
//
// lf-algebra (lessons-first wave 1, 2026-11-07; moved here from lessons/prereqs.js in the r5 merge with master,
// 2026-11-12): six lessons (BUILD lessons #3 #5 #19 #20 #21). lessonFor() returns each one's record as prereqs.js
// held it, plus `guidedRows: 1` on the chartWide lessons (one full-width Guided row: sheet/lesson-pages/we-do.js).

const NOT_CARDED = 'lf-algebra lesson (2026-11-07), moved from prereqs.js; its cases are declared when the lesson passes its critic (lessons-first).';
const NO_CHECK = 'lf-algebra lesson moved from prereqs.js with its Warm-up until its Prerequisite Check is written (LR-17).';

export const ROUTINES = Object.freeze({
    // ------------------------------------------------ Function tables: use a rule (3.OA.D.9, 4.OA.C.5)
    // The skill's default page (ftTask 'outputs'): the rule is given, the pupil writes each Out. The four
    // steps are the provider's four worked steps (sheet/providers/function-table.js): read the rule, work
    // row 1, work row 2, every row the same way.
    'function-table-use-rule': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        concepts: [
            { id: 'in-out', text: 'A number goes in. The rule changes it. A number comes out.' },
            { id: 'same-rule', text: 'Every row uses the same rule.' },
            { id: 'across', text: 'Read each row across: In, then Out.' },
        ],
        vocab: [
            { word: 'In', meaning: 'the number that goes in', picture: { kind: 'text', text: 'In: 3' } },
            { word: 'rule', meaning: 'what happens to every In number', picture: { kind: 'text', text: 'n + 7' } },
            { word: 'Out', meaning: 'the number that comes out', picture: { kind: 'text', text: 'Out: 10' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the rule.' },
            { icon: 'start', text: 'Do it to the In.' },
            { icon: 'write', text: 'Write the Out.' },
            { icon: 'check', text: 'Same rule again.' },
        ],
        chant: '',
        format: {
            kind: 'numbered steps with icons',
            why: 'Four short actions done the same on every row; the Say band reads one row aloud ("When the input is 3, the output is 10"), so a chant would only add words.',
        },
        example: { match: 'The rule is' },
    },

    // ------------------------------------------------ Number patterns: find and use the rule (3.OA.D.9, 4.OA.C.5)
    // The skill's default page finds the rule (option `rule` on): look at the jumps, name the rule, then use it at
    // every gap. The pattern track is wider than half the page (8 tiles), so every chart panel is a full-width row
    // (`chartWide`). The four steps are the provider's four worked steps (sheet/providers/countby.js).
    'number-patterns-find-rule': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        concepts: [
            { id: 'jump', text: 'The jump is the change from one number to the next.' },
            { id: 'same-jump', text: 'The rule makes every jump the same.' },
            { id: 'test', text: 'Test the rule on more than one pair.' },
        ],
        vocab: [
            { word: 'pattern', meaning: 'numbers that follow a rule', picture: { kind: 'text', text: '5, 10, 15, 20' } },
            { word: 'rule', meaning: 'what makes the next number', picture: { kind: 'text', text: 'add 5' } },
            { word: 'jump', meaning: 'from one number to the next', picture: { kind: 'text', text: '5 → 10' } },
        ],
        steps: [
            { icon: 'look', text: 'Look at the jumps.' },
            { icon: 'decide', text: 'Name the rule.' },
            { icon: 'write', text: 'Use the rule at the gap.' },
            { icon: 'check', text: 'Every gap. Check each jump.' },
        ],
        chant: '',
        format: {
            kind: 'numbered steps with icons',
            why: 'The skill is one decision (which rule?) and then the same move at every gap; the Say band names the rule aloud, so no chant.',
        },
        chartWide: true,
        guidedRows: 1,
        // the chart models a count-on pattern (the default page mixes in doubling; the Guided rows show it)
        example: { match: ' is \\+ \\d' },
    },

    // ------------------------------------------------ What Do You Notice? (3.OA.D.9): parity of a product
    // Four steps, as many as the provider's worked steps of the example (patterns.js).
    'notice-parity': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        iconsPending: 'Built by lf-algebra with two "look" steps (check each factor); the icons are settled when the lesson passes its critic.',
        concepts: [
            { id: 'even-groups', text: 'An even number is two equal groups.' },
            { id: 'even-factor', text: 'One even number in the fact makes the product even.' },
            { id: 'odd-odd', text: 'Odd times odd is odd.' },
        ],
        vocab: [
            { word: 'product', meaning: 'the answer to a times fact', picture: { kind: 'text', text: '6 × 7 = 42' } },
            { word: 'even', meaning: 'two equal groups: ends in 0, 2, 4, 6 or 8', picture: { kind: 'text', text: '2, 4, 6, 8' } },
            { word: 'odd', meaning: 'one left over: ends in 1, 3, 5, 7 or 9', picture: { kind: 'text', text: '1, 3, 5, 7' } },
        ],
        steps: [
            // (r2: one short line each - the wrapped Steps list set the Guided band's height and left a 22 mm band
            // under each Guided cell, H13)
            { icon: 'look', text: 'Check the first.' },
            { icon: 'look', text: 'Check the second.' },
            { icon: 'decide', text: 'An even one? Even.' },
            { icon: 'check', text: 'Circle the word.' },
        ],
        chant: 'One even factor: even. Odd × odd: odd.',
        format: {
            kind: 'numbered steps with icons + a rule chant',
            why: 'The whole lesson is one rule about the factors; saying it as a rhythm is what pupils keep when the hint words are gone.',
        },
        example: { match: 'Circle' },
    },

    // ------------------------------------------------ Features of a pattern (3.OA.D.9): the pattern preset of notice
    'pattern-features': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        iconsPending: 'Built by lf-algebra with two "check" steps (test one sentence, then the next); the icons are settled when the lesson passes its critic.',
        concepts: [
            { id: 'rule', text: 'The rule makes every number of the pattern.' },
            { id: 'every', text: 'A sentence about a pattern must be true for every number.' },
            { id: 'ones', text: 'The ones digit can repeat.' },
        ],
        vocab: [
            { word: 'pattern', meaning: 'numbers made by a rule', picture: { kind: 'text', text: '5, 10, 15, 20' } },
            { word: 'rule', meaning: 'what to do each time', picture: { kind: 'text', text: 'add 5' } },
            { word: 'ones digit', meaning: 'the last digit', picture: { kind: 'text', text: '1(5)' } },
        ],
        steps: [
            { icon: 'start', text: 'Read the rule. Write the numbers.' },
            { icon: 'check', text: 'Test a sentence.' },
            { icon: 'check', text: 'Test the next one.' },
            { icon: 'decide', text: 'Check the true one.' },
        ],
        chant: 'True for every number, not just the first.',
        // the drawing is too wide for half the page: every anchor panel a full-width row (lesson.js chartLayout), the
        // step's name and words BESIDE the drawing (chartRow: four ~50 mm panels hold the S-size drawing, r2)
        chartWide: true,
        chartRow: true,
        guidedRows: 1,
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The error the lesson fights is reading a pattern off the first numbers; the chant names it.',
        },
        example: { match: 'Check it' },
    },

    // ------------------------------------------------ Growing Shape Patterns (4.OA.C.5)
    'growing-shape-patterns': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        concepts: [
            { id: 'term', text: 'Each picture in the pattern is a term.' },
            { id: 'more', text: 'Each term has the same number more than the one before.' },
            { id: 'count', text: 'Count each term and write the number.' },
        ],
        vocab: [
            { word: 'term', meaning: 'one picture of the pattern', picture: { kind: 'text', text: 'Term 1, Term 2' } },
            { word: 'rule', meaning: 'how many more each time', picture: { kind: 'text', text: '+ 2' } },
            { word: 'grow', meaning: 'get bigger by the rule', picture: { kind: 'text', text: '3, 5, 7' } },
        ],
        steps: [
            // (r2: short names, so the Guided strip holds the four steps on one line)
            { icon: 'count', text: 'Count.' },
            { icon: 'look', text: 'Find the more.' },
            { icon: 'start', text: 'Draw Term 4.' },
            { icon: 'write', text: 'Write it.' },
        ],
        chant: 'Count, find the more, draw, write.',
        // the drawing is too wide for half the page: every anchor panel a full-width row (lesson.js chartLayout), the
        // step's name and words BESIDE the drawing (chartRow: four ~50 mm panels hold the S-size drawing, r2)
        chartWide: true,
        chartRow: true,
        guidedRows: 1,
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'Four actions in a fixed order; the chant is the order.',
        },
        example: { match: 'Write' },
    },

    // ------------------------------------------------ Follow a Given Rule (4.OA.C.5, BUILD lesson #20; owner 2026-11-07 P7)
    // The preset number_patterns_rule rule:false. Four steps, as many as the provider's worked steps (countby.js: the
    // rule, the first gap, the next gap, every gap).
    'follow-given-rule': {
        archetype: 'partwhole',
        casesPending: NOT_CARDED,
        concepts: [
            { id: 'given', text: 'The rule is given. Do it to each number.' },
            { id: 'from-last', text: 'Start from the number before the gap.' },
            { id: 'same', text: 'Do the same thing every time.' },
        ],
        vocab: [
            { word: 'rule', meaning: 'what to do each time', picture: { kind: 'text', text: 'add 4' } },
            { word: 'pattern', meaning: 'numbers made by a rule', picture: { kind: 'text', text: '3, 7, 11, 15' } },
            { word: 'extend', meaning: 'write the next numbers', picture: { kind: 'text', text: '15, 19, 23' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the rule.' },
            { icon: 'start', text: 'Do it to the number.' },
            { icon: 'write', text: 'Write the next one.' },
            { icon: 'check', text: 'Every gap, same rule.' },
        ],
        chant: '',
        format: {
            kind: 'numbered steps with icons',
            why: 'The same move at every gap; the Say band reads one step aloud, so no chant.',
        },
        chartWide: true,
        guidedRows: 1,
        // (prereqs.js named no worked-example strategy; a match-anything pattern keeps the chart example the one it
        // printed - pickExample's first tier is then its no-pattern tier - until the lesson is carded)
        example: { match: '[\\s\\S]' },
    },
});

export const LESSONS = Object.freeze({
    'skill:algebra:function_table_easy': {
        routine: 'function-table-use-rule',
        practice: { skill: 'algebra:function_table_easy' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        // The Warm-up deals the + / − facts each row is.
        warmup: [
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'Each row of a + rule is an addition fact.' },
            { key: 'subtraction:subtract', opts: { band: 20, notation: ['stacked'] }, why: 'Each row of a − rule is a take-away fact.' },
        ],
        mixWith: [{ key: 'addition:add_facts', opts: { band: 20 } }, { key: 'subtraction:subtract', opts: { band: 20 } }],
    },
    'skill:patterns:number_patterns_rule': {
        routine: 'number-patterns-find-rule',
        practice: { skill: 'patterns:number_patterns_rule' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        warmup: [
            // (one row of column facts: a skip-count line here took a second Warm-up row and pushed Guided Practice to the
            // next page, DN-2)
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'Each jump of a count-on pattern is an addition fact.' },
            { key: 'subtraction:subtract', opts: { band: 20, notation: ['stacked'] }, why: 'Each jump of a count-back pattern is a take-away fact.' },
        ],
        mixWith: [{ key: 'patterns:skip_count_line' }, { key: 'addition:add_facts', opts: { band: 20 } }],
    },
    'skill:patterns:notice_patterns': {
        routine: 'notice-parity',
        practice: { skill: 'patterns:notice_patterns' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        warmup: [
            // (r2: numbers to 10, so the two dot cards are one height - a 20 beside a 10 left a 22 mm band, H13)
            { key: 'composing:odd_even', opts: { range: 10 }, why: 'Tell if a number is odd or even: pairs with none left over.' },
            { key: 'multiplication:mult_facts', why: 'The facts whose products we test.' },
        ],
        mixWith: [{ key: 'composing:odd_even' }, { key: 'multiplication:mult_facts' }],
    },
    'skill:patterns:pattern_features': {
        routine: 'pattern-features',
        practice: { skill: 'patterns:pattern_features' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        warmup: [
            // (r2: one row of four facts, so the Guided Practice starts on the Warm-up page - the odd / even dot cards took
            // 75 mm and pushed it to the next page, DN-2)
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'Each number of the pattern is the one before plus the step.' },
            { key: 'multiplication:mult_facts', why: 'Counting on by 5 or 10 lands on the 5 or 10 times-table: its ones digits repeat.' },
        ],
        mixWith: [{ key: 'patterns:number_patterns_rule', opts: { pattern: ['add'], places: [1] } }, { key: 'composing:odd_even' }],
    },
    'skill:patterns:growing_shape_patterns': {
        routine: 'growing-shape-patterns',
        practice: { skill: 'patterns:growing_shape_patterns' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        warmup: [
            // (r2: column facts, one short row - the shape-pattern card was a legacy cell ("Type ..." on paper, BD-12) and
            // with the pattern track it pushed the Guided Practice to the next page, DN-2)
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'Each term is the one before plus the same number.' },
            { key: 'subtraction:subtract', opts: { band: 20, notation: ['stacked'] }, why: 'How many more: the next count take away this one.' },
        ],
        mixWith: [{ key: 'patterns:shape_pattern' }, { key: 'patterns:number_patterns_rule', opts: { pattern: ['add'], places: [1] } }],
    },
    'skill:patterns:follow_given_rule': {
        routine: 'follow-given-rule',
        practice: { skill: 'patterns:follow_given_rule' },
        defaultFor: true,
        prereqsPending: NO_CHECK,
        warmup: [
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'Each step of an add rule is an addition fact.' },
            { key: 'subtraction:subtract', opts: { band: 20, notation: ['stacked'] }, why: 'Each step of a take-away rule is a subtraction fact.' },
        ],
        mixWith: [{ key: 'patterns:skip_count_line' }, { key: 'addition:add_facts', opts: { band: 20 } }],
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
