// js/modules/lessons/families/placevalue.js
// LESSON FAMILY "placevalue" - Place value: numbers to 1,000,000, the place-value chart, base 10, rounding, negative numbers, Roman numerals.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.
//
// The teaching fields below are the lesson data of lessons/prereqs.js as it was on 2026-10-30, moved
// here unchanged (lead decision D3: every packet byte-identical); `archetype`, `cases` are the
// library's own (schema.js LIBRARY_ONLY).

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
        // Guided Practice: one of each case, in this order (up, down, ends in 5).
        guided: ['roundUp', 'roundDown', 'endsFive'],
        // The provider's words, in the lesson's own terms ("the cut" is never taught here).
        words: [{ from: '^The digit after the cut is (\\d+):.*$', to: 'The ones digit is $1.' }],
        // LR-1: the cases the packet deals, each drawn on the chart.
        cases: ['roundUp', 'roundDown', 'endsFive', 'toHundred'],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:identify' (lf-placevalue) unchanged (lf-engine landing 2026-11-09).
    'pv-identify': {
        archetype: 'pv',
        casesPending: 'Ported from master (lf-placevalue) unchanged; its cases are declared when the lesson is carded (lessons-first).',
        iconsPending: 'Ported from master as printed: its steps repeat an icon (LR-3) until the lesson is carded.',
        concepts: [
            { id: 'places', text: 'Each digit sits in a place: hundreds, tens, ones.' },
            { id: 'right-to-left', text: 'The ones place is on the right.' },
        ],
        vocab: [
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'vocab', id: 'digit' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'placechart', heads: 'H T O', shade: 1 } },
            // (lf-vocab r8, owner O-2: 472 with one digit ringed / an H T O chart with one heading shaded / a ten beside its ones drawn
            // round: four cubes alone read as four empty boxes, a 'place'; ws-vocab-unit V-AMBIG)
            { word: 'ones', meaning: 'the right-hand place', picture: { kind: 'blocks', tens: 1, ones: 4, ring: true } },
        ],
        steps: [
            { icon: 'look', text: 'Find the underlined digit.' },
            { icon: 'look', text: 'Read the letter above it.' },
            { icon: 'decide', text: 'Say the place name.' },
            { icon: 'write', text: 'Circle the place.' },
            { icon: 'write', text: 'Write its value.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'Five actions, the same on every item: find, read, say, circle, write the value.' },
        example: { match: 'place' },
        chartWide: true,
        chartRow: true,
        guidedCols: 2,
        practiceShapes: [[12, 2], [10, 2], [8, 2], [6, 2]],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:value' (lf-placevalue) unchanged (lf-engine landing 2026-11-09).
    'pv-value': {
        archetype: 'pv',
        casesPending: 'Ported from master (lf-placevalue) unchanged; its cases are declared when the lesson is carded (lessons-first).',
        iconsPending: 'Ported from master as printed: its steps repeat an icon (LR-3) until the lesson is carded.',
        concepts: [
            { id: 'value', text: 'A digit is worth its place: 6 in the hundreds is 600.' },
            { id: 'not-digit', text: 'The value is not the digit alone.' },
        ],
        vocab: [
            { word: 'value', meaning: 'how much it is worth', picture: { kind: 'text', text: '6 → 600' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'placechart', heads: 'H T O', shade: 1 } },
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'vocab', id: 'digit' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the underlined digit.' },
            { icon: 'look', text: 'Name its place.' },
            { icon: 'say', text: 'Say the digit with its place.' },
            { icon: 'write', text: 'Write the value.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'The value is the place step plus one: the steps of identify, then multiply.' },
        example: { match: 'place' },
        practiceShapes: [[12, 2], [10, 2], [8, 2], [6, 2]],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:expand' (lf-placevalue) unchanged (lf-engine landing 2026-11-09).
    'pv-expand': {
        archetype: 'pv',
        casesPending: 'Ported from master (lf-placevalue) unchanged; its cases are declared when the lesson is carded (lessons-first).',
        iconsPending: 'Ported from master as printed: its steps repeat an icon (LR-3) until the lesson is carded.',
        concepts: [
            { id: 'parts', text: 'A number is the sum of its place values.' },
            { id: 'zero-place', text: 'A zero place is written too: 405 = 400 + 0 + 5.' },
        ],
        vocab: [
            { word: 'expanded form', meaning: 'the parts added', picture: { kind: 'text', text: '400 + 70 + 2' } },
            { word: 'value', meaning: 'what a digit is worth', picture: { kind: 'text', text: '7 → 70' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'placechart', heads: 'H T O', shade: 1 } },
        ],
        steps: [
            { icon: 'look', text: 'Hundreds digit: its value.' },
            { icon: 'look', text: 'Tens digit: its value.' },
            { icon: 'look', text: 'Ones digit: its value.' },
            { icon: 'write', text: 'Write the parts with +.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'One step per place, left to right, so the zero place is never skipped.' },
        example: { match: 'place' },
        chartWide: true,
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:combine' (lf-placevalue) unchanged (lf-engine landing 2026-11-09).
    'pv-combine': {
        archetype: 'pv',
        casesPending: 'Ported from master (lf-placevalue) unchanged; its cases are declared when the lesson is carded (lessons-first).',
        iconsPending: 'Ported from master as printed: its steps repeat an icon (LR-3) until the lesson is carded.',
        concepts: [{ id: 'one-digit-each', text: 'Each place gets one digit.' }, { id: 'zero-holds', text: 'A place with no part gets a 0: 300 + 5 = 305.' }],
        vocab: [
            { word: 'standard form', meaning: 'the number in digits', picture: { kind: 'text', text: '472' } },
            { word: 'expanded form', meaning: 'the parts added', picture: { kind: 'text', text: '400 + 70 + 2' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'placechart', heads: 'H T O', shade: 1 } },
        ],
        steps: [
            { icon: 'write', text: 'Hundreds: write the digit.' },
            { icon: 'write', text: 'Tens: write the digit.' },
            { icon: 'write', text: 'Ones: write the digit.' },
            { icon: 'say', text: 'Read the number.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'One step per place, so an empty place gets its 0.' },
        example: { match: 'Write' },
        chartWide: true,
        tailLast: true,
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:unit_form' (lf-placevalue) unchanged (lf-engine landing 2026-11-09).
    'pv-unit-form': {
        archetype: 'pv',
        casesPending: 'Ported from master (lf-placevalue) unchanged; its cases are declared when the lesson is carded (lessons-first).',
        iconsPending: 'Ported from master as printed: its steps repeat an icon (LR-3) until the lesson is carded.',
        concepts: [{ id: 'units', text: 'A number is hundreds, tens and ones.' }, { id: 'count-each', text: 'The digit says how many of each.' }],
        vocab: [
            { word: 'hundreds', meaning: 'groups of 100', picture: { kind: 'text', text: '300' } },
            { word: 'tens', meaning: 'groups of 10', picture: { kind: 'blocks', tens: 3, ones: 0 } },
            { word: 'ones', meaning: 'single ones', picture: { kind: 'blocks', tens: 0, ones: 4, compact: true } },
        ],
        steps: [
            { icon: 'look', text: 'Read the number.' },
            { icon: 'write', text: 'How many hundreds?' },
            { icon: 'write', text: 'How many tens?' },
            { icon: 'write', text: 'How many ones?' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'One blank per place, the same order as the frame.' },
        example: { match: 'hundreds' },
        chartWide: true,
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
    },
    // lf-placevalue w2 (2026-11-12): number names to the numeral (2.NBT.A.3), the H T O boxes keep a missing tens word's 0.
    'pv-number-words': {
        archetype: 'pv',
        casesPending: 'New with lf-placevalue w2; its cases are declared when the lesson is carded (lessons-first).',
        concepts: [
            { id: 'parts', text: 'A number name says the hundreds, then the rest.' },
            { id: 'zero', text: 'No tens word? Write 0 tens.' },
        ],
        vocab: [
            { word: 'number name', meaning: 'a number in words', picture: { kind: 'text', text: 'forty-one' } },
            { word: 'numeral', meaning: 'a number in digits', picture: { kind: 'glyph', text: '41' } },
            { word: 'place', meaning: 'hundreds, tens or ones', picture: { kind: 'heads', heads: 'H T O' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the hundreds word.' },
            { icon: 'write', text: 'Write the hundreds digit.' },
            { icon: 'decide', text: 'Read the rest. Tens and ones.' },
            { icon: 'check', text: 'Read the number back.' },
        ],
        // (critic nwf r1 N6: "Three boxes, three digits." was printed over 2-digit items with no boxes and over "one thousand" in
        // four boxes; the chant names no count - every item the lesson deals is boxed, one digit a box, the empty place a 0)
        chant: 'Every box gets a digit.',
        format: { kind: 'numbered steps with icons + a chant', why: 'The one step pupils skip is the empty place; the chant cues its 0.' },
        example: { match: 'hundred' },
        // (three across where the name and its boxes fit: two across left 31 % beside the boxes at S - ws-print-lint H13)
        practiceShapes: [[15, 3], [12, 3], [12, 2], [10, 2], [8, 2], [6, 2]],
    },
    // lf-placevalue compare round (2026-11-13): compare two numbers with <, > and = (2.NBT.A.4); the card's PV-04 and M6.
    'pv-compare': {
        archetype: 'pv',
        casesPending: 'New with lf-placevalue compare: its cases are declared when the lesson is carded (lessons-first).',
        // (compare r4, critic r2 N6: the Remember line prints the FIRST concept, and "More digits is the bigger number." decided
        // none of the same-length items its page deals; the whole rule first - ws-lesson-unit chant-fit judges the Remember line too)
        concepts: [
            { id: 'rule', text: 'More digits wins. Same count: the first different digit decides.' },
            { id: 'length', text: 'More digits is the bigger number.' },
            { id: 'left', text: 'Same length: the first different digit from the left decides.' },
        ],
        vocab: [
            { word: 'greater than', meaning: 'bigger', picture: { kind: 'text', text: '7 > 3' } },
            { word: 'less than', meaning: 'smaller', picture: { kind: 'text', text: '3 < 7' } },
            { word: 'equal to', meaning: 'the same', picture: { kind: 'text', text: '5 = 5' } },
        ],
        // (one step a worked step - workedSteps of placevalue:compare on an item the first different digit decides: count the
        // digits / the first different place, its two digits boxed / the sign, the bigger number underlined.
        // lf-placevalue compare r2, critic r1 F2: the r1 steps "Compare 419 and 470." and an unmarked "1 and 7" drew the same
        // picture twice; each state now draws its own mark - the template's stepState)
        steps: [
            { icon: 'count', text: 'Count the digits.' },
            { icon: 'look', text: 'Find the first different digit.' },
            { icon: 'write', text: 'Write <,\u00a0>\u00a0or\u00a0=.' },   // (the sign list is one unit: critic compare r3 N9 / WRAP-SIGN)
        ],
        // (critic r1 F2: "More digits, bigger number." decided 8 of the lesson's 33 items - every other one has two numbers of one
        // length. The chant names both rules: the count first, then the first different digit; ws-lesson-unit chant-fit)
        chant: 'More digits wins. Then first different digit.',
        format: { kind: 'numbered steps with icons + a chant', why: 'The error is comparing the wrong digits (M6); the chant puts the digit count first, then the first different digit.' },
        example: { match: 'digits differ' },
        // (two blocks, the card's step 5 in order: same length, then different lengths. The rows are held to the ink
        // (tightRows), so one 12-item grid left 42-54 % of the page white - ws-print-lint PAGEFILL; 20 in two blocks fill it,
        // DN-1's ceiling at L)
        practiceBlocks: [{ shape: [12, 3] }, { shape: [8, 2], opts: { lengths: 'mixed' } }],
        practiceShapes: [[12, 3], [9, 3]],
    },
});

export const LESSONS = Object.freeze({
    // Round to the nearest 10 (3).
    'Y4.B1.S14': {
        routine: 'round-nearest-10',
        prereqsLive: false,   // LR-17 switch: live when this lesson's Prerequisite Check passes its critic
        vocabZoom: true, roundOneNum: true,   // LR-17b: the phase-0 look critic r2 graded, live with the check
        slug: 'round-nearest-10',
        practice: { skill: 'number_sense:nearest_10' },
        defaultFor: true,
        warmup: [
            { key: 'number_sense:between_tens', why: 'Rounding starts by naming the two tens.' },
            { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false }, why: 'Rounding reads the tens digit and the ones digit.' },
        ],
        // LR-17: the Prerequisite Check, most basic first.
        prereqs: [
            { lesson: 'Y1.B9.S2', title: 'Count in 10s', key: 'patterns:skip_count_line', opts: { step: [2] }, why: 'The tens a number is rounded to: 10, 20, 30 ...', checks: 'Count in 10s on a number line: 10, 20, 30 ...' },
            { lesson: 'Y2.B1.S4', title: 'Use a place value chart', key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false }, why: 'Rounding reads the tens digit and the ones digit.', checks: 'Name the place of a digit: tens or ones.' },
            { lesson: 'Y2.B1.S10', title: '10s and 1s on the number line to 100', key: 'number_sense:between_tens', why: 'Rounding starts by naming the two tens.', checks: 'Name the two tens a number is between.' },
            { lesson: 'Y2.B2.S13', title: '10 more, 10 less', key: 'placevalue:more_less_10', opts: { step: 10, dir: 'both' }, why: 'The ten before and the ten after a number: 10 less, 10 more.', checks: 'Find 10 more or 10 less than a 2-digit number.' },
        ],
        // Mixed practice: EARLIER skills only, each from its own strand (lessons r1: never nearest
        // 100, which comes after, and never two "Number Sense" sections).
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false } }, { key: 'addition:add_100_regroup', minOperand: 10 }],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:identify' (lf-placevalue, 2.NBT.A.3 / 2.NBT.A.1); skill: id.
    'skill:placevalue:identify': {
        routine: 'pv-identify',
        practice: { skill: 'placevalue:identify' },
        defaultFor: true,
        prereqsPending: 'Ported from master (lf-placevalue) with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:identify', opts: { band: 99, writeValue: false }, why: 'Tens and ones first: the same question with two places.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: 'A 2-digit number is tens and ones.' },
        ],
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, writeValue: false } }, { key: 'placevalue:more_less_10' }],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:value' (lf-placevalue, 2.NBT.A.3 / 2.NBT.A.1); skill: id.
    'skill:placevalue:value': {
        routine: 'pv-value',
        practice: { skill: 'placevalue:value' },
        defaultFor: true,
        prereqsPending: 'Ported from master (lf-placevalue) with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:identify', opts: { writeValue: false }, why: 'The value starts from the place.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: '6 tens is 60.' },
        ],
        mixWith: [{ key: 'placevalue:identify' }, { key: 'placevalue:more_less_10' }],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:expand' (lf-placevalue, 2.NBT.A.3 / 2.NBT.A.1); skill: id.
    'skill:placevalue:expand': {
        routine: 'pv-expand',
        practice: { skill: 'placevalue:expand' },
        defaultFor: true,
        prereqsPending: 'Ported from master (lf-placevalue) with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:value', why: 'Each part of the expanded form is a value.' },
            { key: 'placevalue:expand', opts: { band: 99 }, why: 'Tens and ones first: 47 = 40 + 7.' },
        ],
        mixWith: [{ key: 'placevalue:value' }, { key: 'placevalue:more_less_10' }],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:combine' (lf-placevalue, 2.NBT.A.3 / 2.NBT.A.1); skill: id.
    'skill:placevalue:combine': {
        routine: 'pv-combine',
        practice: { skill: 'placevalue:combine' },
        defaultFor: true,
        prereqsPending: 'Ported from master (lf-placevalue) with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:expand', why: 'Combine undoes the expanded form.' },
            { key: 'placevalue:combine', opts: { band: 99 }, why: 'Tens and ones first: 40 + 7 = 47.' },
        ],
        mixWith: [{ key: 'placevalue:expand' }, { key: 'placevalue:more_less_10' }],
    },
    // Ported from master's lessons/prereqs.js 'placevalue:unit_form' (lf-placevalue, 2.NBT.A.3 / 2.NBT.A.1); skill: id.
    'skill:placevalue:unit_form': {
        routine: 'pv-unit-form',
        practice: { skill: 'placevalue:unit_form' },
        defaultFor: true,
        prereqsPending: 'Ported from master (lf-placevalue) with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:identify', opts: { writeValue: false }, why: 'Unit form names each place.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: 'Tens and ones first.' },
        ],
        mixWith: [{ key: 'placevalue:identify' }, { key: 'placevalue:more_less_10' }],
    },
    // lf-placevalue compare round (2026-11-13, 2.NBT.A.4): compare two numbers; skill: id.
    'skill:placevalue:compare': {
        routine: 'pv-compare',
        practice: { skill: 'placevalue:compare' },
        defaultFor: true,
        prereqsPending: 'New with lf-placevalue compare: its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'placevalue:identify', opts: { writeValue: false }, why: 'Comparing reads the digits place by place.' },
            { key: 'placevalue:compare', opts: { band: 99 }, why: 'Two-digit numbers first: tens, then ones.' },
        ],
        mixWith: [{ key: 'placevalue:identify' }, { key: 'placevalue:more_less_10' }],
    },
    // lf-placevalue w2 (2026-11-12, 2.NBT.A.3 / 1.NBT.B.2): number names to numerals; skill: id.
    'skill:composing:number_word_form': {
        routine: 'pv-number-words',
        practice: { skill: 'composing:number_word_form', opts: { wordform: ['to_number'], band: 1000, zeroPlace: 'some', answerSlot: 'hto' } },
        // (critic nwf r1 N6: the lesson asked for by the skill alone deals these practice options - print-sheet buildLesson)
        dealPracticeOpts: true,
        defaultFor: true,
        prereqsPending: 'New with lf-placevalue w2: its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'composing:number_word_form', opts: { wordform: ['to_number'], band: 100 }, why: 'Names to 100 first: forty-one is 41.' },
            { key: 'placevalue:unit_form', opts: { band: 999 }, why: 'A 3-digit number is hundreds, tens and ones.' },
        ],
        mixWith: [{ key: 'placevalue:unit_form' }, { key: 'placevalue:expand' }],
    },
});

// LR-17: the Prerequisite Check's lessons that are not written yet (Phase 1 pilots, first in line).
export const NEEDS = Object.freeze([
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y1.B9.S2', name: 'Count in 10s', why: 'Prerequisite Check question 1 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y2.B1.S4', name: 'Use a place value chart', why: 'Prerequisite Check question 2 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y2.B1.S10', name: '10s and 1s on the number line to 100', why: 'Prerequisite Check question 3 routes here' },
    { lesson: 'Y4.B1.S14', kind: 'lesson', prereq: 'Y2.B2.S13', name: '10 more, 10 less', why: 'Prerequisite Check question 4 routes here' },
]);

export default { ROUTINES, LESSONS, NEEDS };
