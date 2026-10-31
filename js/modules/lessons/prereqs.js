// js/modules/lessons/prereqs.js
// THE LESSON DATA of the first sample lessons (design/LESSONS_VISION.md, type 1: one lesson per
// skill). For each lesson skill it names what the Warm-up reviews - the prerequisite SKILLS
// (drawn from their own generators through generateQuestionFor), the CONCEPTS and the
// VOCABULARY - and how the lesson's steps are made memorable (numbered steps, one icon per
// action, and a chant only where one genuinely helps).
//
// THE SHAPE, and how it grows into the vertical-alignment map the vision asks for:
//
//   'category:skill' -> {
//     skills:   [{key: 'category:skill', opts?, why}]   prerequisite skills, nearest first
//                                                      (the "prerequisite of" edges of the map)
//     concepts: [{id, text}]                           the ideas the skill leans on (concept nodes)
//     vocab:    [{word, meaning, picture}]              <= 3 words (P-LG-6), each with a line-art
//                                                      picture the lesson draws (lesson.js VOCAB_PICTURES)
//     steps:    [{icon, text}]                          the lesson's general steps: 2-5 words each where
//                                                      that is enough (P-5: 10 at most). Their count
//                                                      equals the skill's worked steps for the
//                                                      example, so step n of the list IS state n of
//                                                      the worked example (one icon per action)
//     chant:    '...' | ''                              a short rule to say together, or none
//     format:   {kind, why}                             the memorable-step format chosen, and why
//     example:  {match}                                 the worked example: a /regex/ its provider
//                                                      steps must contain (the strategy taught)
//     mixWith:  [{key, opts?}]                          Mixed practice partners (earlier skills)
//   }
//
// Later, the full map adds `leadsTo` / `buildsOn` edges between skills and concept nodes; this
// file keeps the same keys so a lesson reads the map instead of a hand list without changing.
//
// Pure data (no DOM, no state). Every skill key here must be a live skill; every standard a lesson
// prints comes from js/modules/standards.js (standardsFor), never from this file.

/** The action icons a step may use (drawn by sheet/lesson-icons.js). */
export const STEP_ICONS = Object.freeze(['look', 'start', 'count', 'write', 'regroup', 'subtract', 'subOnes', 'subTens', 'ends', 'decide', 'check', 'say']);

/* -------------------------------------------- the no-regrouping column subtraction lessons */
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
const NR_CONCEPTS = [
    { id: 'line-up', text: 'Line up the places: ones under ones.' },
    { id: 'ones-first', text: 'Subtract the ones first, then each place to the left.' },
    { id: 'top-bigger', text: 'Every top digit is bigger: nothing regroups.' },
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
function subNoRegroupLessons() {
    const FORMAT = {
        kind: 'numbered steps with icons',
        why: 'The move is the same in every column, ones first; four short steps said in order are what pupils need. No decision to cue, so no chant.',
    };
    const base = (o) => Object.assign({
        concepts: NR_CONCEPTS, chant: '', format: FORMAT,
        example: { match: 'Ones:', test: 'subNoZero' },
        words: [{ from: '^Check:\\s*', to: '' }],
        distinctFirst: true, distinctAnswer: true,
    }, o);
    // (stacked, as the sub_100_regroup Warm-up draws its facts: an across fact sat in a row sized
    // for the stacks beside it and left 43-59 % of its cell empty; critic SU-C r2 N2. Where the
    // other prerequisite is wide - the place-value word bank, a 5-digit column - `warmRows` gives
    // the facts a row of their own, four across, on the S and M lesson sheets: in a half-page cell a
    // one-digit column left 34 % of the width empty. At L the extra row does not fit the sheet.)
    const facts10 = { key: 'subtraction:subtract', opts: { band: 10, notation: ['stacked'] }, why: 'Each column is a take-away fact within 10.' };
    const pv = { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Name the tens digit and the ones digit.' };
    const rung = (key, why) => ({ key, why });
    return {
        'subtraction:sub_50_no_regroup': base({
            skills: [facts10, pv], warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1,
            mixWith: [{ key: 'addition:add_50_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
        }),
        'subtraction:sub_100_no_regroup': base({
            skills: [rung('subtraction:sub_50_no_regroup', 'The same column steps with smaller numbers.'), facts10],
            vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1,
            mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
        }),
        // The preset (host sub_100_no_regroup, lengths: shorter): every bottom number is one digit,
        // so `maxSmall` (one one-place take-away a page) does not apply; its tens step writes the tens.
        'subtraction:sub_2d_1d': base({
            skills: [facts10, pv], warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2('Write the tens.'), checkRow: true,
            mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
        }),
        'subtraction:sub_1k_no_regroup': base({
            skills: [rung('subtraction:sub_100_no_regroup', 'The same column steps with two places.'), facts10],
            vocab: NR_VOCAB_BIG('486', '52', 'H T O'), steps: NR_STEPS_3, checkRow: true, maxSmall: 1,
            mixWith: [{ key: 'addition:add_1k_no_regroup' }],
        }),
        'subtraction:sub_10k_no_regroup': base({
            skills: [rung('subtraction:sub_1k_no_regroup', 'The same column steps with three places.'), facts10],
            vocab: NR_VOCAB_BIG('4,867', '352', 'Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1,
            mixWith: [{ key: 'addition:add_10k_no_regroup' }],
        }),
        'subtraction:sub_100k_no_regroup': base({
            skills: [rung('subtraction:sub_10k_no_regroup', 'The same column steps with four places.'), facts10],
            vocab: NR_VOCAB_BIG('48,675', '3,524', 'TTh Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1,
            mixWith: [{ key: 'addition:add_100k_no_regroup' }],
        }),
        'subtraction:sub_1m_no_regroup': base({
            skills: [rung('subtraction:sub_100k_no_regroup', 'The same column steps with five places.'), facts10], warmRows: ['S', 'M'],
            vocab: NR_VOCAB_BIG('486,759', '35,247', 'HTh TTh Th H T O'), steps: NR_STEPS_BIG, maxSmall: 1,
            mixWith: [{ key: 'addition:add_1m_no_regroup' }],
        }),
    };
}

export const LESSONS = Object.freeze({
    // ---------------------------------------------------------------- Add within 10 (K-1)
    // The skill is addition:add_facts with its band option at 10 ("Within N" bounds the sum).
    'addition:add_facts': {
        skills: [
            { key: 'counting:count_objects', opts: { band: 10 }, why: 'Counting a set is how a sum is found.' },
            { key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole: the idea of adding.' },
        ],
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
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 } }, { key: 'counting:count_objects', opts: { band: 10 } }],
    },

    // ---------------------------------------------- 2-digit subtraction with regrouping (2)
    'subtraction:sub_100_regroup': {
        skills: [
            { key: 'subtraction:subtract', opts: { band: 20, regroup: 'always' }, why: 'After regrouping, the ones column is a teen fact: 13 − 5.' },
            { key: 'subtraction:sub_100_no_regroup', why: 'The column steps without the new part.' },
        ],
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
        // Lessons r2: the partner is 2-digit addition (never 2 + 8 in a carry scaffold).
        mixWith: [{ key: 'addition:add_100_regroup', minOperand: 10 }],
    },

    // ------------------------------- Column subtraction WITHOUT regrouping (SU-C, 2 to 6)
    // Spec card design/cards/subtraction/subtraction.md (critic SU-C r1 D4): the Warm-up deals the
    // rung below on the same no-regrouping ladder (never a regrouping item), the steps match the
    // provider's four worked steps (sheet/providers/subtraction.js columnSubNoRegroup), the
    // chart's example is never a zero case (`subNoZero`), and Mixed practice pairs the lesson with
    // other strands (addition, place value), never a second Subtraction section.
    ...subNoRegroupLessons(),

    // ------------------------------------------------- Round to the nearest 10 / 100 (3)
    'number_sense:nearest_10': {
        skills: [
            { key: 'number_sense:between_tens', why: 'Rounding starts by naming the two tens.' },
            { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Rounding reads the tens digit and the ones digit.' },
        ],
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
        // Mixed practice: EARLIER skills only, each from its own strand (lessons r1: never nearest
        // 100, which comes after, and never two "Number Sense" sections).
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }, { key: 'addition:add_100_regroup', minOperand: 10 }],
    },

    // ---------------------------------------- ops-family G1 (2026-10-30): one-line sentences
    // Each lesson's steps match its provider's worked steps for the example, one step a state.
    'addition:add_sub_10s': {
        skills: [
            { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] }, why: 'Name the tens digit and the ones digit.' },
            { key: 'patterns:skip_count_line', opts: { step: [2] }, why: 'Counting on by tens.' },
        ],
        concepts: [
            { id: 'ten-more', text: '10 more: the tens digit goes up by 1.' },
            { id: 'ten-less', text: '10 less: the tens digit goes down by 1.' },
            { id: 'ones-stay', text: 'The ones digit does not change.' },
        ],
        vocab: [
            { word: 'tens', meaning: 'groups of ten', picture: { kind: 'text', text: '40 = 4 tens' } },
            { word: '10 more', meaning: 'one more ten', picture: { kind: 'text', text: '43 \u2192 53' } },
            { word: '10 less', meaning: 'one ten fewer', picture: { kind: 'text', text: '43 \u2192 33' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the tens.' },
            { icon: 'count', text: 'One ten on or back.' },
            { icon: 'look', text: 'Keep the ones.' },
            { icon: 'write', text: 'Write the answer.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'One move in one place; four short steps said in order. No decision to cue, so no chant.' },
        example: { match: 'one ten' },
        mixWith: [{ key: 'placevalue:more_less_10' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10] } }],
    },
    'addition:add_sub_100s': {
        skills: [
            { key: 'addition:add_sub_10s', why: 'The same move one place to the right.' },
            { key: 'placevalue:identify', opts: { band: 999, places: [1, 10, 100] }, why: 'Name the hundreds digit.' },
        ],
        concepts: [
            { id: 'hundred-more', text: '100 more: the hundreds digit goes up by 1.' },
            { id: 'hundred-less', text: '100 less: the hundreds digit goes down by 1.' },
            { id: 'rest-stay', text: 'The tens and ones digits do not change.' },
        ],
        vocab: [
            { word: 'hundreds', meaning: 'groups of a hundred', picture: { kind: 'heads', heads: 'H T O' } },
            { word: '100 more', meaning: 'one more hundred', picture: { kind: 'text', text: '367 \u2192 467' } },
            { word: '100 less', meaning: 'one hundred fewer', picture: { kind: 'text', text: '367 \u2192 267' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the hundreds.' },
            { icon: 'count', text: 'One hundred on or back.' },
            { icon: 'look', text: 'Keep the tens and ones.' },
            { icon: 'write', text: 'Write the answer.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'The same four steps as tens, one place over. No decision to cue, so no chant.' },
        example: { match: 'one hundred' },
        mixWith: [{ key: 'placevalue:more_less_100' }, { key: 'addition:add_sub_10s' }],
    },
    'subtraction:missing_add_sub': {
        skills: [
            { key: 'addition:add_facts', opts: { band: 20 }, why: 'Count on to find a part.' },
            { key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole.' },
        ],
        concepts: [
            { id: 'whole-parts', text: 'Two parts make the whole.' },
            { id: 'count-on', text: 'Count on from the part you know to the whole.' },
            { id: 'check', text: 'Put the number in. Is the sentence true?' },
        ],
        vocab: [
            { word: 'missing', meaning: 'the number in the box', picture: { kind: 'text', text: '? + 5 = 12' } },
            { word: 'whole', meaning: 'the parts together', picture: { kind: 'text', text: '7 + 5 = 12' } },
            { word: 'equals', meaning: 'the = sign: is the same as', picture: { kind: 'glyph', text: '=' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the whole.' },
            { icon: 'count', text: 'Count on from the part.' },
            { icon: 'check', text: 'Check the sentence.' },
            { icon: 'write', text: 'Write the number.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'Find the whole, count on, check: three moves said in order, then write.' },
        example: { match: 'Count on from' },
        mixWith: [{ key: 'addition:add_facts', opts: { band: 20 } }, { key: 'composing:number_bonds', opts: { band: 10 } }],
    },
    'division:missing_mult_div': {
        skills: [
            { key: 'multiplication:mult_facts', why: 'Know the times facts.' },
            { key: 'division:div_facts', why: 'Division is the times fact turned round.' },
        ],
        concepts: [
            { id: 'fact', text: 'A times fact has two factors and a product.' },
            { id: 'related', text: 'Every division has a times fact.' },
            { id: 'check', text: 'Put the number in. Is the fact true?' },
        ],
        vocab: [
            { word: 'factor', meaning: 'a number we multiply', picture: { kind: 'text', text: '6 \u00d7 7' } },
            { word: 'missing', meaning: 'the number in the box', picture: { kind: 'text', text: '? \u00d7 6 = 42' } },
            { word: 'divide', meaning: 'the \u00f7 sign: share equally', picture: { kind: 'glyph', text: '\u00f7' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the fact.' },
            { icon: 'count', text: 'Count by the number.' },
            { icon: 'check', text: 'Check the fact.' },
            { icon: 'write', text: 'Write the number.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'Count by the number you know until you reach the total; the check says the whole fact.' },
        example: { match: 'Count by' },
        mixWith: [{ key: 'multiplication:mult_facts' }, { key: 'division:div_facts' }],
    },
    'division:div_zero_in_quotient': {
        skills: [
            { key: 'division:div_facts', why: 'Each place is a division fact.' },
            { key: 'division:divide', why: 'Divide one place at a time.' },
        ],
        concepts: [
            { id: 'one-place', text: 'Divide one place at a time, left to right.' },
            { id: 'zero', text: 'If the divisor does not fit, write 0 in that place.' },
            { id: 'every-place', text: 'Every place of the answer gets a digit.' },
        ],
        vocab: [
            { word: 'quotient', meaning: 'the answer to a division', picture: { kind: 'text', text: '721 \u00f7 7 = 103' } },
            { word: 'divisor', meaning: 'the number we divide by', picture: { kind: 'text', text: '7' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'heads', heads: 'H T O' } },
        ],
        steps: [
            { icon: 'start', text: 'Divide the first place.' },
            { icon: 'decide', text: 'Does not fit? Write 0.' },
            { icon: 'subtract', text: 'Bring down. Divide again.' },
            { icon: 'write', text: 'Write the quotient.' },
        ],
        chant: 'Does not fit? Write a zero.',
        format: { kind: 'numbered steps with icons + a chant', why: 'The one move pupils skip is the 0; a short chant at step 2 cues it every time.' },
        example: { match: 'write 0\\. Bring down' },
        mixWith: [{ key: 'division:div_facts' }, { key: 'division:divide' }],
    },
});

/** The lesson data of a skill, or null (a skill with no authored lesson yet). */
export function lessonFor(categoryId, skillId) {
    return LESSONS[`${categoryId}:${skillId}`] || null;
}

/** `{categoryId, skillId, opts?}` of a 'category:skill' key. */
export function skillRef(entry) {
    const [categoryId, skillId] = String(entry.key || '').split(':');
    const ref = entry.opts ? { categoryId, skillId, opts: Object.assign({}, entry.opts) } : { categoryId, skillId };
    // `minOperand` (lessons r2): the packet's floor on every operand (2-digit addition only).
    if (entry.minOperand !== undefined) ref.minOperand = entry.minOperand;
    return ref;
}

export default { LESSONS, STEP_ICONS, lessonFor, skillRef };
