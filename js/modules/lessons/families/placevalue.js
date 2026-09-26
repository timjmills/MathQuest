// js/modules/lessons/families/placevalue.js
// LESSON FAMILY "placevalue" - Place value: numbers to 1,000,000, the place-value chart, base 10, rounding, negative numbers, Roman numerals.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.

export const ROUTINES = Object.freeze({
    // ------------------------------------------- Round to the nearest 10 on a number line (A3 line)
    // Certified by the sample lesson round-nearest-10 (critic lessons r1-r4).
    'round-nearest-10': {
        archetype: 'line',
        concepts: [
            { id: 'between', text: 'A number sits between two tens.' },
            { id: 'nearest', text: 'Round to the ten it is nearer.' },
            { id: 'halfway', text: 'Halfway (5) rounds up.' },
        ],
        vocab: [
            { word: 'round', meaning: 'change to a near ten', picture: { kind: 'text', text: '27 → 30' } },
            { word: 'tens', meaning: '10, 20, 30, 40 ...', picture: { kind: 'text', text: '10, 20, 30' } },
            { word: 'halfway', meaning: 'the middle: 25 between 20 and 30', picture: { kind: 'line', lo: 20, hi: 30, mark: 25 } },
        ],
        steps: [
            { icon: 'ends', text: 'Find the two tens.' },
            { icon: 'look', text: 'Look at the ones.' },
            { icon: 'decide', text: 'Round up or down.' },
            { icon: 'write', text: 'Write the ten.' },
        ],
        chant: '5 or more, round up. 4 or less, round down.',
        format: {
            kind: 'numbered steps with icons + a rule chant',
            why: 'The whole skill turns on one rule; saying it as a rhythm is what pupils remember when the number line is gone.',
        },
        example: { match: 'round up', prefer: '\\b\\d[678]\\b' },
        // The second example rounds DOWN (the first rounds up): both directions of the rule.
        second: { test: 'roundDown', label: '4 or less? Round down.' },
        // The third case (lessons r2): a 5 in the ones rounds UP - the half the rule decides.
        third: { test: 'endsFive', label: '5 in the ones? Round up.' },
        // Lessons r3: the 90s round up to 100 (a three-digit answer), where the chart has room.
        fourth: { test: 'toHundred', label: '9 tens? Up to 100.', ref: { minN: 95, tries: 300 } },
        cases: ['roundUp', 'roundDown', 'endsFive', 'toHundred'],
        // Guided Practice: one of each case, in this order (up, down, ends in 5).
        guided: ['roundUp', 'roundDown', 'endsFive'],
        // The provider's words, in the lesson's own terms ("the cut" is never taught here).
        words: [{ from: '^The digit after the cut is (\\d+):.*$', to: 'The ones digit is $1.' }],
    },
});

export const LESSONS = Object.freeze({
    // Round to the nearest 10 (3).
    'Y4.B1.S14': {
        routine: 'round-nearest-10',
        slug: 'round-nearest-10',
        practice: { skill: 'number_sense:nearest_10' },
        defaultFor: true,
        // LR-17: the Prerequisite Check, most basic first.
        prereqs: [
            { lesson: 'Y1.B9.S2', key: 'patterns:seq_10', opts: { forms: [0], unknown: [1] }, why: 'The tens a number is rounded to: 10, 20, 30 ...' },
            { lesson: 'Y2.B1.S4', key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Rounding reads the tens digit and the ones digit.' },
            { lesson: 'Y2.B1.S10', key: 'number_sense:between_tens', why: 'Rounding starts by naming the two tens.' },
            { lesson: 'Y3.B1.S3', key: 'number_sense:place_on_number_line', why: 'The rounding line is a number line to 100.' },
        ],
        // Mixed practice: EARLIER skills only, each from its own strand (lessons r1: never nearest
        // 100, which comes after, and never two "Number Sense" sections).
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }, { key: 'addition:add_100_regroup', minOperand: 10, maxAnswer: 99, ansDigits: 2 }],
    },
});

// LR-17: the Prerequisite Check's lessons that are not written yet (Phase 1 pilots, first in line).
export const NEEDS = Object.freeze([
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y1.B9.S2', name: 'Count in 10s', why: 'Prerequisite Check question 1 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y2.B1.S4', name: 'Use a place value chart', why: 'Prerequisite Check question 2 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y2.B1.S10', name: '10s and 1s on the number line to 100', why: 'Prerequisite Check question 3 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y3.B1.S3', name: 'Number line to 100', why: 'Prerequisite Check question 4 routes here' },
]);

export default { ROUTINES, LESSONS, NEEDS };
