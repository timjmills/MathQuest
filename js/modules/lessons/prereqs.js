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
