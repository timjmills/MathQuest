// js/modules/lessons/families/addsub.js
// LESSON FAMILY "addsub" - Addition and subtraction: facts, mental strategies, column addition and subtraction, inverse, estimation.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.
//
// The teaching fields below are the lesson data of lessons/prereqs.js as it was on 2026-10-30, moved
// here unchanged (lead decision D3: every packet byte-identical); prereqs.js is now a view of this
// library. `archetype`, `cases`, `caps` are the library's own (schema.js LIBRARY_ONLY).

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
        // Lessons r3: a double (3 + 3) has no big number - the chart says what to do.
        notes: { 0: 'Same numbers? Start with either.' },
        // Lessons r2: counting on 0 is not counting on (the chart never shows it): no + 0 item.
        minOperand: 1,
        // LR-1 (lessons r4): the cases the packet deals. (r5 drew the double as a third chart
        // example; until that engine hunk lands the chart says it in words - ws-lesson-check LR-1.)
        cases: ['bigFirst', 'bigSecond', 'double'],
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
        // ... and the rule for an answer under 10 (36 - 29 = 7), on step 4's panel.
        notes: { 3: '0 tens? Leave it empty.' },
        // The check step's words, without the step name's own "Check:" (lessons r2).
        words: [{ from: '^Check:\\s*', to: '' }],
        // Practice cells give step 5 its room: a Check line under every problem.
        checkRow: true,
        // Lessons r2: no two problems of a page share a top number.
        distinctFirst: true,
        // Lessons r3: no two answers alike, at most one one-place take-away a page.
        distinctAnswer: true,
        maxSmall: 1,
        // ... and every top number is past the teens (11 - 6 is a fact, not regrouping).
        minTop: 20,
        // Lessons r3: two places only - 100 - 47 regroups across a 0 the chart never shows.
        maxTop: 99,
        // LR-1 / LR-7 (lessons r4-r5): the cases the packet deals and the caps on the rare ones
        // (at most one one-place take-away - `maxSmall` - and two answers under 10 a page).
        cases: ['twoPlace', 'onePlace', 'zeroOnes', 'underTen'],
        caps: { onePlace: 1, underTen: 2 },
    },

    // ------------------------------- Column subtraction WITHOUT regrouping (SU-C, 2 to 6; A1 column)
    // ONE routine across the ladder's ranges (plan §1: a shared routine): each lesson sets its own
    // vocabulary pictures and steps in `teach`. Spec card design/cards/subtraction/subtraction.md
    // (critic SU-C r1 D4): the chart's example is never a zero case (`subNoZero`).
    'sub-column-no-regroup': {
        archetype: 'column',
        concepts: [
            { id: 'line-up', text: 'Line up the places: ones under ones.' },
            { id: 'ones-first', text: 'Subtract the ones first, then each place to the left.' },
            { id: 'top-bigger', text: 'Every top digit is bigger: nothing regroups.' },
        ],
        chant: '',
        format: {
            kind: 'numbered steps with icons',
            why: 'The move is the same in every column, ones first; four short steps said in order are what pupils need. No decision to cue, so no chant.',
        },
        example: { match: 'Ones:', test: 'subNoZero' },
        words: [{ from: '^Check:\\s*', to: '' }],
        distinctFirst: true,
        distinctAnswer: true,
        casesPending: 'The SU-C pilot routine was graded before LR-1 cases were declared; its cases are declared when the no-regrouping ladder is next re-graded.',
    },
});

/* ------------------------------------- the no-regrouping ladder's own pictures and steps */
const NR_VOCAB_2 = [
    { word: 'ones', meaning: 'the right-hand place', picture: { kind: 'blocks', tens: 0, ones: 4 } },
    { word: 'tens', meaning: 'groups of ten', picture: { kind: 'blocks', tens: 3, ones: 0 } },
    { word: 'line up', meaning: 'ones under ones', picture: { kind: 'stack', top: '47', bottom: '23' } },
];
// (critic SU-C r2 N6: "line up" is pictured as a small column, ones under ones, never as an across
// sentence that can wrap; "place" names the lesson's own place heads)
const NR_VOCAB_BIG = (top, bottom, heads) => [
    // (the heads as the stack's head row: a 'text' picture of six heads wrapped at L, critic s3-stack r1 N6b)
    { word: 'place', meaning: 'ones, tens, hundreds ...', picture: { kind: 'heads', heads } },
    { word: 'line up', meaning: 'ones under ones', picture: { kind: 'stack', top, bottom } },
    { word: 'take away', meaning: 'subtract: the − sign', picture: { kind: 'glyph', text: '−' } },
];
const NR_STEPS_2 = (tens = 'Subtract the tens.') => [
    { icon: 'subOnes', text: 'Subtract the ones.' },
    { icon: 'subTens', text: tens },
    { icon: 'write', text: 'Read the answer.' },
    { icon: 'check', text: 'Check: add back.' },
];
const NR_STEPS_3 = [
    { icon: 'subOnes', text: 'Subtract the ones.' },
    { icon: 'subTens', text: 'Subtract the tens.' },
    { icon: 'subtract', text: 'Subtract the hundreds.' },
    { icon: 'check', text: 'Check: add back.' },
];
const NR_STEPS_BIG = [
    { icon: 'subOnes', text: 'Subtract the ones.' },
    { icon: 'subTens', text: 'Subtract the tens.' },
    { icon: 'subtract', text: 'Each place to the left.' },
    { icon: 'write', text: 'Read the answer.' },
];
// (stacked, as the sub_100_regroup Warm-up draws its facts: an across fact sat in a row sized
// for the stacks beside it and left 43-59 % of its cell empty; critic SU-C r2 N2. Where the
// other prerequisite is wide - the place-value word bank, a 5-digit column - `warmRows` gives
// the facts a row of their own, four across, on the S and M lesson sheets: in a half-page cell a
// one-digit column left 34 % of the width empty. At L the extra row does not fit the sheet.)
const NR_FACTS_10 = { key: 'subtraction:subtract', opts: { band: 10, notation: ['stacked'] }, why: 'Each column is a take-away fact within 10.' };
const NR_PV = { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Name the tens digit and the ones digit.' };
const NR_PENDING = 'The SU-C pilot lesson keeps its Warm-up (its rung below and the facts within 10) until its Prerequisite Check is written (LR-17).';
const nr = (o) => Object.assign({ routine: 'sub-column-no-regroup', defaultFor: true, prereqsPending: NR_PENDING }, o);

export const LESSONS = Object.freeze({
    // ---------------------------------------------------------------- Add within 10 (K-1)
    // Counting on 1, 2 or 3 from the bigger number. WRM teaches counting on as "add more"; the skill
    // is addition:add_facts with its band option at 10 ("Within N" bounds the sum) and the constant
    // addend 1-3.
    'Y1.B2.S9': {
        routine: 'add-count-on',
        slug: 'add-within-10',
        practice: { skill: 'addition:add_facts', opts: { band: 10, constant: [1, 2, 3] } },
        defaultFor: true,
        warmup: [
            { key: 'counting:count_objects', opts: { band: 10 }, why: 'Counting a set is how a sum is found.' },
            { key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole: the idea of adding.' },
        ],
        // LR-17 (owner ruling 2026-09-26): the Prerequisite Check, most basic first; a question
        // missed sends the pupil to that lesson first, then back. (It replaces the Warm-up.)
        prereqs: [
            { lesson: 'Y1.B1.S2', title: 'Count objects', key: 'counting:count_objects', opts: { band: 10 }, why: 'Counting a set is how a sum is found.' },
            { lesson: 'Y1.B1.S6', title: 'Count on from any number', key: 'counting:count_sequence', why: 'Counting on says the next numbers from any number.' },
            { lesson: 'Y1.B1.S11', title: 'Fewer, more, same', key: 'comparing:compare_groups', why: 'Step 1 starts with the bigger number.' },
            { lesson: 'Y1.B2.S5', title: 'Number bonds within 10', key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole: the idea of adding.' },
        ],
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 } }, { key: 'counting:count_objects', opts: { band: 10 } }],
        note: 'Counting on from the bigger number is WRM Y1 "Addition - add more"; the add 1-3 constant keeps each hop countable.',
    },

    // ---------------------------------------------- 2-digit subtraction with regrouping (2)
    'Y2.B2.S18': {
        routine: 'sub-column-regroup',
        slug: 'subtract-2-digit-regroup',
        practice: { skill: 'subtraction:sub_100_regroup' },
        defaultFor: true,
        warmup: [
            { key: 'subtraction:subtract', opts: { band: 20, regroup: 'always' }, why: 'After regrouping, the ones column is a teen fact: 13 − 5.' },
            { key: 'subtraction:sub_100_no_regroup', why: 'The column steps without the new part.' },
        ],
        // LR-17: the Prerequisite Check, most basic first. (`check`: each stack with its Check line,
        // the lesson's step 5, and a cell its content fills, H13.)
        prereqs: [
            { lesson: 'Y2.B1.S4', title: 'Use a place value chart', key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Regrouping reads the tens digit and the ones digit.' },
            { lesson: 'Y2.B1.S5', title: 'Partition numbers to 100', key: 'placevalue:expand', opts: { band: 99, zeroPlace: 'none' }, why: 'A 2-digit number is its tens and its ones: 63 = 60 + 3.' },
            { lesson: 'Y2.B2.S10', title: 'Subtract across 10', key: 'subtraction:sub_10_regroup', check: true, why: 'After regrouping, the ones column is a teen fact: 13 − 5.' },
            { lesson: 'Y2.B2.S17', title: 'Subtract two 2-digit numbers (not across a 10)', key: 'subtraction:sub_100_no_regroup', check: true, why: 'The column steps without the new part.' },
        ],
        // Lessons r2: the partner is 2-digit addition (never 2 + 8 in a carry scaffold).
        mixWith: [{ key: 'addition:add_100_regroup', minOperand: 10 }],
    },

    // ------------------------------- Column subtraction WITHOUT regrouping (SU-C, 2 to 6)
    // The Warm-up deals the rung below on the same no-regrouping ladder (never a regrouping item),
    // the steps match the provider's four worked steps (sheet/providers/subtraction.js
    // columnSubNoRegroup), and Mixed practice pairs the lesson with other strands (addition, place
    // value), never a second Subtraction section. (sub_50 / sub_100k / sub_1m teach no WRM step of
    // their own: skill: ids.)
    'skill:subtraction:sub_50_no_regroup': nr({
        practice: { skill: 'subtraction:sub_50_no_regroup' },
        warmup: [NR_FACTS_10, NR_PV],
        teach: { warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_50_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
    }),
    'Y2.B2.S17': nr({
        practice: { skill: 'subtraction:sub_100_no_regroup' },
        warmup: [{ key: 'subtraction:sub_50_no_regroup', why: 'The same column steps with smaller numbers.' }, NR_FACTS_10],
        teach: { vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
    }),
    // The preset (host sub_100_no_regroup, lengths: shorter): every bottom number is one digit, so
    // `maxSmall` (one one-place take-away a page) does not apply; its tens step writes the tens. It
    // covers only the subtracting half of Y2.B2.S5 (SKILL_WRM partial): a skill: id.
    'skill:subtraction:sub_2d_1d': nr({
        practice: { skill: 'subtraction:sub_2d_1d' },
        warmup: [NR_FACTS_10, NR_PV],
        teach: { warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2('Write the tens.'), checkRow: true },
        mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
    }),
    'Y3.B2.S12': nr({
        practice: { skill: 'subtraction:sub_1k_no_regroup' },
        warmup: [{ key: 'subtraction:sub_100_no_regroup', why: 'The same column steps with two places.' }, NR_FACTS_10],
        teach: { vocab: NR_VOCAB_BIG('486', '52', 'H T O'), steps: NR_STEPS_3, checkRow: true, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_1k_no_regroup' }],
    }),
    'Y4.B2.S5': nr({
        practice: { skill: 'subtraction:sub_10k_no_regroup' },
        warmup: [{ key: 'subtraction:sub_1k_no_regroup', why: 'The same column steps with three places.' }, NR_FACTS_10],
        teach: { vocab: NR_VOCAB_BIG('4,867', '352', 'Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_10k_no_regroup' }],
    }),
    'skill:subtraction:sub_100k_no_regroup': nr({
        practice: { skill: 'subtraction:sub_100k_no_regroup' },
        warmup: [{ key: 'subtraction:sub_10k_no_regroup', why: 'The same column steps with four places.' }, NR_FACTS_10],
        teach: { vocab: NR_VOCAB_BIG('48,675', '3,524', 'TTh Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_100k_no_regroup' }],
    }),
    'skill:subtraction:sub_1m_no_regroup': nr({
        practice: { skill: 'subtraction:sub_1m_no_regroup' },
        warmup: [{ key: 'subtraction:sub_100k_no_regroup', why: 'The same column steps with five places.' }, NR_FACTS_10],
        teach: { warmRows: ['S', 'M'], vocab: NR_VOCAB_BIG('486,759', '35,247', 'HTh TTh Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1 },
        mixWith: [{ key: 'addition:add_1m_no_regroup' }],
    }),
});

// LR-17: the Prerequisite Check's lessons that are not written yet (Phase 1 pilots, first in line).
// (Y2.B2.S17, question 4 of Y2.B2.S18, is a library lesson - the SU-C no-regrouping lesson above.)
export const NEEDS = Object.freeze([
    { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B1.S2', name: 'Count objects', why: 'Prerequisite Check question 1 routes here' },
    { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B1.S6', name: 'Count on from any number', why: 'Prerequisite Check question 2 routes here' },
    { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B1.S11', name: 'Fewer, more, same', why: 'Prerequisite Check question 3 routes here' },
    { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B2.S5', name: 'Number bonds within 10', why: 'Prerequisite Check question 4 routes here' },
    { lesson: 'Y2.B2.S18', kind: 'lesson', prereq: 'Y2.B1.S4', name: 'Use a place value chart', why: 'Prerequisite Check question 1 routes here' },
    { lesson: 'Y2.B2.S18', kind: 'lesson', prereq: 'Y2.B1.S5', name: 'Partition numbers to 100', why: 'Prerequisite Check question 2 routes here' },
    { lesson: 'Y2.B2.S18', kind: 'lesson', prereq: 'Y2.B2.S10', name: 'Subtract across 10', why: 'Prerequisite Check question 3 routes here' },
]);

export default { ROUTINES, LESSONS, NEEDS };
