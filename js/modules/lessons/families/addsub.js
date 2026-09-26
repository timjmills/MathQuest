// js/modules/lessons/families/addsub.js
// LESSON FAMILY "addsub" - Addition and subtraction: facts, mental strategies, column addition and subtraction, inverse, estimation.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.

export const ROUTINES = Object.freeze({
    // ------------------------------------------------ Count on from the bigger number (A2 fact)
    // Certified by the sample lesson add-within-10 (critic lessons r1-r4).
    'add-count-on': {
        archetype: 'fact',
        concepts: [
            { id: 'count-on', text: 'Start at the bigger number and count on.' },
            { id: 'join', text: 'Adding puts two groups together.' },
            { id: 'bigger', text: 'Tell which of two numbers is bigger.' },
        ],
        vocab: [
            { word: 'plus', meaning: 'the + sign: put together', picture: { kind: 'glyph', text: '+' } },
            { word: 'equals', meaning: 'the = sign: is the same as', picture: { kind: 'glyph', text: '=' } },
            { word: 'count on', meaning: 'say the next numbers', picture: { kind: 'text', text: '4, 5, 6, 7' } },
        ],
        steps: [
            { icon: 'start', text: 'Start with the big number.' },
            { icon: 'count', text: 'Count on.' },
            { icon: 'write', text: 'Write how many.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'Three actions of two to five words each: the counting-on words are said aloud anyway (the Say band), so a chant would only add words.',
        },
        // Count on 2 or 3 (a 1-step hop shows nothing being counted).
        example: { match: 'Count on', test: 'bigFirst', prefer: '\\+ [23] =' },
        // The chart's second example: the big number SECOND (lessons r1: the Guided and practice
        // items put it on either side, so the chart models both).
        second: { test: 'bigSecond', label: 'Big number second? Start with it.' },
        // Lessons r4 (LR-1): a double (3 + 3) has no big number - the chart DRAWS one.
        third: { test: 'double', label: 'Same numbers? Start with either.', ref: { sameOps: true, tries: 300 } },
        cases: ['bigFirst', 'bigSecond', 'double'],
        // Lessons r2: counting on 0 is not counting on (the chart never shows it): no + 0 item.
        minOperand: 1,
    },

    // ------------------------------ Column subtraction with regrouping, two places (A1 column)
    // Certified by the sample lesson subtract-2-digit-regroup (critic lessons r1-r4).
    'sub-column-regroup': {
        archetype: 'column',
        concepts: [
            { id: 'ten-ones', text: '1 ten is 10 ones.' },
            { id: 'ones-first', text: 'Subtract the ones first, then the tens.' },
            { id: 'top-smaller', text: 'When the top ones digit is smaller, regroup.' },
        ],
        vocab: [
            { word: 'tens', meaning: 'groups of ten', picture: { kind: 'blocks', tens: 3, ones: 0 } },
            { word: 'ones', meaning: 'single units', picture: { kind: 'blocks', tens: 0, ones: 4 } },
            { word: 'regroup', meaning: '1 ten becomes 10 ones', picture: { kind: 'trade' } },
        ],
        steps: [
            { icon: 'look', text: 'Look at the ones.' },
            { icon: 'regroup', text: 'Top smaller? Regroup a ten.' },
            { icon: 'subOnes', text: 'Subtract the ones.' },
            { icon: 'subTens', text: 'Subtract the tens.' },
            { icon: 'check', text: 'Check: add back.' },
        ],
        chant: 'Top too small? Take a ten!',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The one decision pupils forget is whether to regroup; a four-word chant said at step 2 cues it every time.',
        },
        example: { match: 'Regroup a ten' },
        // The second example: a 0 in the ones (the edge case: 0 is smaller than any digit).
        // Lessons r3: the other example is a ONE-PLACE take-away from a number with 0 ones (70 - 8):
        // the 0 in the ones regroups and the bottom number has an empty tens place. Its own pool
        // deals the case (`ref`: print-sheet.js refAccepts), as the main pool rarely holds it.
        second: { test: 'takeAwayZero', label: '0 ones? Regroup a ten.', ref: { maxBottom: 9, zeroOnes: true, tries: 400 } },
        // Lessons r4 (LR-1): an answer under 10 is DRAWN, its tens box left empty (36 - 29 = 7).
        third: { test: 'underTen', label: 'Answer under 10? Leave the tens empty.', ref: { maxAnswer: 9, tries: 400 } },
        cases: ['twoPlace', 'onePlace', 'zeroOnes', 'underTen'],
        // LR-7: at most one one-place take-away and two answers under 10 a page.
        caps: { onePlace: 1, underTen: 2 },
        // LR-6: no near twins (51 - 44, 53 - 45) and no number taken away twice on a page.
        noNearTwin: true,
        // The check step's words, without the step name's own "Check:" (lessons r2).
        words: [{ from: '^Check:\\s*', to: '' }],
        // Practice cells give step 5 its room: a Check line under every problem.
        checkRow: true,
        // Lessons r2: no two problems of a page share a top number.
        distinctFirst: true,
        // Lessons r3: no two answers alike.
        distinctAnswer: true,
        // ... and every top number is past the teens (11 - 6 is a fact, not regrouping).
        minTop: 20,
        // Lessons r3: two places only - 100 - 47 regroups across a 0 the chart never shows.
        maxTop: 99,
    },
});

export const LESSONS = Object.freeze({
    // Add within 10 by counting on 1, 2 or 3 from the bigger number (K-1). WRM teaches counting on
    // as "add more"; the skill is addition:add_facts with its band option at 10 ("Within N" bounds
    // the sum) and the constant addend 1-3.
    'Y1.B2.S9': {
        routine: 'add-count-on',
        slug: 'add-within-10',
        practice: { skill: 'addition:add_facts', opts: { band: 10, constant: [1, 2, 3] } },
        defaultFor: true,
        warmup: [
            { key: 'counting:count_objects', opts: { band: 10 }, why: 'Counting a set is how a sum is found.' },
            { key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole: the idea of adding.' },
        ],
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 }, title: 'Number Bonds' }, { key: 'counting:count_objects', opts: { band: 10 } }],
        note: 'Counting on from the bigger number is WRM Y1 "Addition - add more"; the add 1-3 constant keeps each hop countable.',
    },

    // 2-digit subtraction with regrouping (2).
    'Y2.B2.S18': {
        routine: 'sub-column-regroup',
        slug: 'subtract-2-digit-regroup',
        practice: { skill: 'subtraction:sub_100_regroup' },
        defaultFor: true,
        warmup: [
            { key: 'subtraction:subtract', opts: { band: 20, regroup: 'always' }, why: 'After regrouping, the ones column is a teen fact: 13 − 5.' },
            { key: 'subtraction:sub_100_no_regroup', why: 'The column steps without the new part.' },
        ],
        // Lessons r2: the partner is 2-digit addition (never 2 + 8 in a carry scaffold).
        // Lessons r4: sums to 99, so the column has no empty hundreds place.
        mixWith: [{ key: 'addition:add_100_regroup', minOperand: 10, maxAnswer: 99, ansDigits: 2 }],
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
