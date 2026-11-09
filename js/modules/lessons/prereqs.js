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
    const pv = { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false }, why: 'Name the tens digit and the ones digit.' };
    const rung = (key, why) => ({ key, why });
    return {
        'subtraction:sub_50_no_regroup': base({
            skills: [facts10, pv], warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1,
            mixWith: [{ key: 'addition:add_50_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false } }],
        }),
        'subtraction:sub_100_no_regroup': base({
            skills: [rung('subtraction:sub_50_no_regroup', 'The same column steps with smaller numbers.'), facts10],
            vocab: NR_VOCAB_2, steps: NR_STEPS_2(), checkRow: true, maxSmall: 1,
            mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false } }],
        }),
        // The preset (host sub_100_no_regroup, lengths: shorter): every bottom number is one digit,
        // so `maxSmall` (one one-place take-away a page) does not apply; its tens step writes the tens.
        'subtraction:sub_2d_1d': base({
            skills: [facts10, pv], warmRows: ['S', 'M'], vocab: NR_VOCAB_2, steps: NR_STEPS_2('Write the tens.'), checkRow: true,
            mixWith: [{ key: 'addition:add_100_no_regroup' }, { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false } }],
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

/* ------------------------------ one-step word problems within 10 / 20 (K-1, the sentence layout) */
// Visual-quality lane (2026-10-31, design/audit/VISUAL_QUALITY.md 4.4; round 2, critic r1 F6 / F13): the word-work
// cell's sentence layout - the story, the PART-WHOLE BAR (drawn on the teaching cells), then `[ ] ◯ [ ] = [ ] unit`.
// The lesson teaches the structure, never key words (PEDAGOGY P-21, P-WP-10): two parts make the whole; I know both
// parts, I add; I know the whole and one part, I subtract. The four steps are the provider's four worked steps
// (sheet/providers/word-work.js: read, the parts and the whole on the bar, the number sentence, solve), so step n of
// the list IS panel n of the chart. The Warm-up deals the facts the story is solved with (one row of four: a bond row
// beside them pushed Guided Practice off page 2, DN-2); Mixed practice pairs the lesson with the bonds strand and the
// other operation's facts (never a second word-problem section). The _plain twin (no picture row) is the same lesson.
function storyLessons() {
    const FORMAT = {
        kind: 'numbered steps with icons + a rule',
        why: 'The one decision pupils get wrong is the sign; the bar shows which number is missing - a part or the whole - and the rule names what to do.',
    };
    const STEPS = [
        { icon: 'look', text: 'Read the story two times.' },
        { icon: 'decide', text: 'Find the parts and the whole.' },
        { icon: 'write', text: 'Write the number sentence.' },
        { icon: 'check', text: 'Solve. Say the answer and its label.' },
    ];
    // the vocabulary pictures: the same small bar, each showing only what its word names (no pointer)
    const VOCAB = (sentence) => [
        { word: 'whole', meaning: 'all of them together', picture: { kind: 'bar', whole: 7, a: 3, b: 4, mark: 'whole', only: true } },
        { word: 'part', meaning: 'some of the whole', picture: { kind: 'bar', whole: 7, a: 3, b: 4, mark: 'parts', only: true } },
        { word: 'number sentence', meaning: 'the numbers and the sign', picture: { kind: 'text', text: sentence } },
    ];
    const ADD = {
        concepts: [
            { id: 'part-whole', text: 'Two parts make the whole.' },
            { id: 'both-parts-add', text: 'I know both parts. I add to find the whole.' },
            { id: 'unit', text: 'The answer is a number of things: say the unit.' },
        ],
        vocab: VOCAB('3 + 4 = 7'),
        steps: STEPS,
        chant: 'Part + part = whole.',
    };
    const SUB = {
        concepts: [
            { id: 'part-whole', text: 'Two parts make the whole.' },
            { id: 'whole-part-sub', text: 'I know the whole and one part. I subtract to find the other part.' },
            { id: 'unit', text: 'The answer is a number of things: say the unit.' },
        ],
        vocab: VOCAB('7 − 3 = 4'),
        steps: STEPS,
        chant: 'Whole − part = part.',
    };
    // (the practice page: eight stories where they fit the page, else six - print-sheet.js practiceShapes)
    const base = (o) => Object.assign({ format: FORMAT, example: { match: 'I know' }, practiceShapes: [[8, 2], [6, 2], [4, 2]] }, o);
    const addFacts = (band) => ({ key: 'addition:add_facts', opts: { band, notation: ['stacked'] }, why: `The story is solved with an addition fact within ${band}.` });
    const subFacts = (band) => ({ key: 'subtraction:subtract', opts: { band, notation: ['stacked'] }, why: `The story is solved with a take-away fact within ${band}.` });
    const add = (band) => base(Object.assign({}, ADD, {
        skills: [addFacts(band)],
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 } }, { key: 'subtraction:subtract', opts: { band } }],
    }));
    const sub = (band) => base(Object.assign({}, SUB, {
        skills: [subFacts(band)],
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 } }, { key: 'addition:add_facts', opts: { band } }],
    }));
    const out = {};
    for (const [id, band] of [['10', 10], ['20', 20]]) {
        out[`addition:add_wp_${id}`] = add(band);
        out[`addition:add_wp_${id}_plain`] = add(band);
        out[`subtraction:sub_wp_${id}`] = sub(band);
        out[`subtraction:sub_wp_${id}_plain`] = sub(band);
    }
    return out;
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

    // --------------------------------- One-step word problems within 10 / 20 (K-1)
    ...storyLessons(),

    // ------------------------------------------- Is it a fact family? (+ / −, grade 1)
    // Visual-quality lane (2026-10-31): the kit's `family-check` cell - the three numbers in the fact
    // triangle, the whole at the top, and the printed Yes / No the pupil circles. The three steps are
    // the provider's worked steps (sheet/providers/addition.js): the big number at the top, add the
    // two small numbers, circle yes or no. The Warm-up deals the facts the check is made with.
    'addition:fact_family_sort': {
        skills: [
            { key: 'addition:add_facts', opts: { band: 20, notation: ['stacked'] }, why: 'The check adds the two small numbers.' },
        ],
        concepts: [
            { id: 'whole-top', text: 'The big number is the whole. It goes at the top.' },
            { id: 'parts-add', text: 'The two small numbers are the parts. Add them.' },
            { id: 'family', text: 'The parts make the whole: it is a fact family.' },
        ],
        vocab: [
            { word: 'whole', meaning: 'the big number at the top', picture: { kind: 'text', text: '12 at the top' } },
            { word: 'parts', meaning: 'the two small numbers', picture: { kind: 'text', text: '8 and 4' } },
            // (critic r1 F8: a family is the three numbers, never one number sentence - a sentence is one fact)
            { word: 'fact family', meaning: 'three numbers: two parts and the whole', picture: { kind: 'text', text: '8, 4, 12' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the big number.' },
            { icon: 'count', text: 'Add the small numbers.' },
            { icon: 'decide', text: 'The same? Circle yes. Not? Circle no.' },
        ],
        chant: 'Two parts make the whole.',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'Three short steps; the decision at step 3 is the whole skill, and the four-word chant is the question pupils ask themselves.',
        },
        example: { match: 'Circle yes' },
        practiceShapes: [[12, 3], [9, 3], [6, 2]],
        mixWith: [{ key: 'composing:number_bonds', opts: { band: 10 } }, { key: 'subtraction:subtract', opts: { band: 20 } }],
    },

    // ------------------------------------------------------------- Division facts (3)
    // Lane D R4 prep (node-lint LESSON-DATA): div_facts divides by thinking of the times fact (3.OA.6, 3.OA.7).
    'division:div_facts': {
        skills: [
            { key: 'multiplication:mult_facts', why: 'Each division fact is a times fact read backwards.' },
            { key: 'division:missing_mult_div', why: 'A missing factor is the answer of a division fact.' },
        ],
        concepts: [
            { id: 'groups', text: 'Dividing makes equal groups.' },
            { id: 'think', text: 'Think of the times fact.' },
            { id: 'missing', text: 'The answer is the missing factor.' },
        ],
        vocab: [
            { word: 'divide', meaning: 'the ÷ sign: share into equal groups', picture: { kind: 'glyph', text: '÷' } },
            { word: 'equals', meaning: 'the = sign: is the same as', picture: { kind: 'glyph', text: '=' } },
            { word: 'times fact', meaning: 'a fact like 3 × 4 = 12', picture: { kind: 'text', text: '3 × 4 = 12' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the number you divide by.' },
            { icon: 'count', text: 'Think: what times it makes the big number?' },
            { icon: 'write', text: 'Write that number.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'Three actions; the think-of-the-times-fact sentence is the Say band, so a chant would only add words.',
        },
        mixWith: [{ key: 'multiplication:mult_facts' }, { key: 'division:missing_mult_div' }],
    },

    // ------------------------------------------------- Round to the nearest 10 / 100 (3)
    'number_sense:nearest_10': {
        skills: [
            { key: 'number_sense:between_tens', why: 'Rounding starts by naming the two tens.' },
            { key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false }, why: 'Rounding reads the tens digit and the ones digit.' },
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
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, places: [1, 10], writeValue: false } }, { key: 'addition:add_100_regroup', minOperand: 10 }],
    },

    /* ---------------------------------------------------------- lf-placevalue (2026-11-07): read and write to 1,000
       (2.NBT.A.3, CCSS BUILD lesson 1). One block, appended; the Warm-up reviews the 2-digit version of the same idea. */
    'placevalue:identify': {
        skills: [
            { key: 'placevalue:identify', opts: { band: 99, writeValue: false }, why: 'Tens and ones first: the same question with two places.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: 'A 2-digit number is tens and ones.' },
        ],
        concepts: [
            { id: 'places', text: 'Each digit sits in a place: hundreds, tens, ones.' },
            { id: 'right-to-left', text: 'The ones place is on the right.' },
        ],
        vocab: [
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'text', text: '4 7 2' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'heads', heads: 'H T O' } },
            // critic r3 F3: a picture for a mark must draw the mark; the text picture cannot underline, so the third word is "ones"
            { word: 'ones', meaning: 'the right-hand place', picture: { kind: 'blocks', tens: 0, ones: 4, compact: true } },
        ],
        steps: [
            { icon: 'look', text: 'Find the underlined digit.' },
            { icon: 'look', text: 'Read the letter above it.' },
            { icon: 'decide', text: 'Say the place name.' },
            { icon: 'write', text: 'Circle the place.' },
            // lf-placevalue r1 F4 (writeValue, owner 2026-10-10): the value line is the last step
            { icon: 'write', text: 'Write its value.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'Five actions, the same on every item: find, read, say, circle, write the value.' },
        example: { match: 'place' },
        // The ring row of place names wraps in half the page: one panel a row, its step beside the drawing.
        chartWide: true, chartRow: true,
        // The practice page: short cells, so twelve where they fit (lf-engine: practiceShapes, densest first).
        practiceShapes: [[12, 2], [10, 2], [8, 2], [6, 2]],
        mixWith: [{ key: 'placevalue:identify', opts: { band: 99, writeValue: false } }, { key: 'placevalue:more_less_10' }],
    },
    'placevalue:value': {
        skills: [
            // (the Warm-up names the place only: lf-placevalue r1, the value line is the lesson's own step)
            { key: 'placevalue:identify', opts: { writeValue: false }, why: 'The value starts from the place.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: '6 tens is 60.' },
        ],
        concepts: [
            { id: 'value', text: 'A digit is worth its place: 6 in the hundreds is 600.' },
            { id: 'not-digit', text: 'The value is not the digit alone.' },
        ],
        vocab: [
            { word: 'value', meaning: 'how much it is worth', picture: { kind: 'text', text: '6 → 600' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'heads', heads: 'H T O' } },
            // critic r3b G1: 'worth' meant the same as 'value' (two right matches); the third word is 'digit'
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'text', text: '4 7 2' } },
        ],
        steps: [
            { icon: 'look', text: 'Find the underlined digit.' },
            { icon: 'look', text: 'Name its place.' },
            // lf-placevalue r1 F12: Grade 2 says the value with its place ("3 tens is 30"), never ×
            { icon: 'say', text: 'Say the digit with its place.' },
            { icon: 'write', text: 'Write the value.' },
        ],
        chant: '',
        format: { kind: 'numbered steps with icons', why: 'The value is the place step plus one: the steps of identify, then multiply.' },
        example: { match: 'place' },
        // The practice page: short cells, so twelve where they fit (lf-engine: practiceShapes, densest first).
        practiceShapes: [[12, 2], [10, 2], [8, 2], [6, 2]],
        mixWith: [{ key: 'placevalue:identify' }, { key: 'placevalue:more_less_10' }],
    },
    'placevalue:expand': {
        skills: [
            { key: 'placevalue:value', why: 'Each part of the expanded form is a value.' },
            { key: 'placevalue:expand', opts: { band: 99 }, why: 'Tens and ones first: 47 = 40 + 7.' },
        ],
        concepts: [
            { id: 'parts', text: 'A number is the sum of its place values.' },
            { id: 'zero-place', text: 'A zero place is written too: 405 = 400 + 0 + 5.' },
        ],
        vocab: [
            { word: 'expanded form', meaning: 'the parts added', picture: { kind: 'text', text: '400 + 70 + 2' } },
            { word: 'value', meaning: 'what a digit is worth', picture: { kind: 'text', text: '7 → 70' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'heads', heads: 'H T O' } },
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
        // The expanded-form row (288 = [ ] + [ ] + [ ]) is wider than half the page: one panel a row.
        chartWide: true,
        // The practice page: short cells, so twelve where they fit (lf-engine: practiceShapes, densest first).
        // lf-placevalue r1 F18: at M and L the row takes the full width, so the one-column shapes fill ONE page
        // (the two-column shapes spilled six items over two pages, 4 + 2).
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
        mixWith: [{ key: 'placevalue:value' }, { key: 'placevalue:more_less_10' }],
    },
    'placevalue:combine': {
        skills: [
            { key: 'placevalue:expand', why: 'Combine undoes the expanded form.' },
            { key: 'placevalue:combine', opts: { band: 99 }, why: 'Tens and ones first: 40 + 7 = 47.' },
        ],
        concepts: [
            { id: 'one-digit-each', text: 'Each place gets one digit.' },
            { id: 'zero-holds', text: 'A place with no part gets a 0: 300 + 5 = 305.' },
        ],
        vocab: [
            { word: 'standard form', meaning: 'the number in digits', picture: { kind: 'text', text: '472' } },
            { word: 'expanded form', meaning: 'the parts added', picture: { kind: 'text', text: '400 + 70 + 2' } },
            { word: 'place', meaning: 'hundreds, tens, ones', picture: { kind: 'heads', heads: 'H T O' } },
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
        // The parts row (500 + 10 + 5 = ____) is wider than half the page: one panel a row.
        chartWide: true,
        // The closing step ("Read it: 464.") writes nothing new: it is the line under the panels.
        tailLast: true,
        // The practice page: short cells, so twelve where they fit (lf-engine: practiceShapes, densest first).
        // lf-placevalue r1 (F9 one geometry, F18): every item takes the widest frame's room, which is one column at L.
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
        mixWith: [{ key: 'placevalue:expand' }, { key: 'placevalue:more_less_10' }],
    },
    'placevalue:unit_form': {
        skills: [
            { key: 'placevalue:identify', opts: { writeValue: false }, why: 'Unit form names each place.' },
            { key: 'placevalue:unit_form', opts: { band: 99 }, why: 'Tens and ones first.' },
        ],
        concepts: [
            { id: 'units', text: 'A number is hundreds, tens and ones.' },
            { id: 'count-each', text: 'The digit says how many of each.' },
        ],
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
        // The unit-form frame (__ hundreds __ tens __ ones) is wider than half the page: one panel a row.
        chartWide: true,
        // The practice page: short cells, so twelve where they fit (lf-engine: practiceShapes, densest first).
        // lf-placevalue r1 F18: one-column shapes, so the page is filled on ONE page where two columns do not fit.
        practiceShapes: [[12, 2], [10, 2], [12, 1], [10, 1], [8, 1], [6, 1]],
        mixWith: [{ key: 'placevalue:identify' }, { key: 'placevalue:more_less_10' }],
    },

    // ------------------------------------ Skip counting: the count-row family (2, 3; critic skip-count r5 SC3)
    // One family, one drawing (sheet/cells/count-row.js): a row of up to 12 numbers is too wide for half the page, so
    // the anchor chart stacks its four steps as full-width rows (`chartWide`) and the Guided problems take full-width
    // rows under the step strip; the practice pages fill with whole rows (`practiceShapes`, the most that fit first).
    // The steps match the provider's four worked steps (sheet/providers/countby.js rowSteps): the jump, the first gap,
    // the next gap, every gap and the check.
    ...skipCountLessons(),

    // ------------------------- Arrays, equal groups and the order property (3; lane lf-ops, ops-tables card §9 Q3)
    // The BUILD lesson "Properties of multiplication" (3.OA.B.5) and the array lesson it rests on (3.OA.A.1, 2.OA.C.4).
    // The steps match each provider's worked steps (sheet/providers/multiplication.js): arrays_groups 4, the order
    // property ('both' task) 5. The Warm-up deals short tracks and across facts only (an array in the Warm-up ran it
    // past half a page at L, as on count_by_tables).
    ...opsTablesLessons(),

    // ---------------------------- The plain × / ÷ stories (3; lane lf-ops, ops-tables card §9 Q3, BUILD lesson #7)
    // The stories the two-step lesson (3.OA.D.8) rests on (3.OA.A.3). The lesson teaches the STRUCTURE, never key
    // words (the card hides the cues and the bank, M-S1): equal groups - how many groups, how many in each - or a
    // total split into equal groups. The four steps are the provider's four worked steps (providers/word-work.js
    // plainStorySteps: read and name the groups, the sign, the numbers and the fact, the answer and its label).
    ...timesStoryLessons(),
});

function timesStoryLessons() {
    const FORMAT = {
        kind: 'numbered steps with icons + a rule',
        why: 'The one decision pupils get wrong is the sign; naming the equal groups first decides it, and the rule says it in four words.',
    };
    const steps = (groups) => [
        { icon: 'look', text: groups },
        { icon: 'decide', text: 'Circle the sign.' },
        { icon: 'write', text: 'Write the numbers. Solve.' },
        { icon: 'write', text: 'Write the answer and its label.' },
    ];
    const vocab = (fact) => [
        { word: 'equal groups', meaning: 'groups with the same number in each', picture: { kind: 'text', text: '3 groups of 4' } },
        { word: 'in each', meaning: 'how many one group has', picture: { kind: 'text', text: '4 in each' } },
        { word: 'fact', meaning: 'the numbers and the sign', picture: { kind: 'text', text: fact } },
    ];
    // (the Warm-up deals one row of across facts: a second row - an array, a count-by track - ran it past half a page and
    // pushed Guided Practice onto a page of its own, print-lint DN-2)
    // (one row of four across facts, the tables to 5: a two-digit factor in a quarter-width cell ran into its number tab)
    const multFacts = { key: 'multiplication:mult_facts', opts: { notation: ['across'], band: 100, constant: [2, 3, 4, 5] }, why: 'The story is solved with a times fact.' };
    const divFacts = { key: 'division:div_facts', opts: { band: 100, constant: [2, 3, 4, 5] }, why: 'The story is solved with a division fact.' };
    // (the column work is wider and taller than half a chart: two full-width panels, the drawing beside its step heads -
    // read and choose the sign, then the numbers, the fact and the answer)
    // (`offOpts`: the practice-page bar model is left off the lesson - its full-width bar ran the chart off the page)
    const base = { format: FORMAT, chartStates: 2, practiceShapes: [[6, 2], [4, 2], [4, 1], [2, 1]], offOpts: ['wpBar'] };
    return {
        'multiplication:mult_word_problems_plain': Object.assign({}, base, {
            skills: [multFacts],
            concepts: [
                { id: 'equal-groups', text: 'A times story has equal groups.' },
                { id: 'groups-times-each', text: 'Groups × the number in each = how many in all.' },
                { id: 'unit', text: 'The answer is a number of things: say the label.' },
            ],
            vocab: vocab('5 × 6 = 30'),
            steps: steps('Read the story. Find the groups and how many in each.'),
            chant: 'Equal groups? Multiply.',
            example: { match: 'equal groups' },
            mixWith: [{ key: 'multiplication:mult_facts', opts: { notation: ['across'], band: 100 } }, { key: 'addition:add_facts', opts: { band: 20 } }],
        }),
        'division:div_word_problems_plain': Object.assign({}, base, {
            skills: [divFacts],
            concepts: [
                { id: 'total-split', text: 'A division story splits a total into equal groups.' },
                { id: 'missing-number', text: 'It asks for the number in each group, or the number of groups.' },
                { id: 'unit', text: 'The answer is a number of things: say the label.' },
            ],
            vocab: vocab('15 ÷ 5 = 3'),
            steps: steps('Read the story. Find the total and the equal groups.'),
            chant: 'Split it equally? Divide.',
            example: { match: 'equal groups|How many groups' },
            mixWith: [{ key: 'division:div_facts', opts: { band: 100 } }, { key: 'multiplication:mult_facts', opts: { notation: ['across'], band: 100 } }],
        }),
    };
}

function opsTablesLessons() {
    const by5 = { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' }, why: 'Skip counting by 5s: how a row of dots is counted fast.' };
    const by2 = { key: 'counting:number_seq_fill', opts: { step: 2, dir: 'forward' }, why: 'Skip counting by 2s: the 2 times-table as a count.' };
    const x2 = { key: 'multiplication:mult_facts', opts: { constant: [2], notation: ['across'], band: 100 }, why: 'A known times fact: the fact an array is named by.' };
    return {
        'multiplication:arrays_groups': {
            skills: [by2, by5],
            concepts: [
                { id: 'equal', text: 'Every row (or group) holds the same number.' },
                { id: 'count-by', text: 'Count by the row size, once for each row.' },
                { id: 'in-all', text: 'The last number said is how many in all.' },
            ],
            vocab: [
                { word: 'row', meaning: 'a line of dots going across', picture: { kind: 'text', text: '4 in a row' } },
                { word: 'array', meaning: 'equal rows of dots', picture: { kind: 'text', text: '3 rows of 4' } },
                { word: 'in all', meaning: 'the total: every dot counted', picture: { kind: 'text', text: '12 in all' } },
            ],
            steps: [
                { icon: 'count', text: 'Count the rows or groups.' },
                { icon: 'look', text: 'Count how many in one.' },
                { icon: 'count', text: 'Count by that number.' },
                { icon: 'write', text: 'Write how many in all.' },
            ],
            chant: '',
            format: {
                kind: 'numbered steps with icons',
                why: 'Four counting actions said in order, each one a box the pupil fills; no decision to cue, so no chant.',
            },
            example: { match: 'Count by' },
            // (two pictures a row: a picture alone in a full-width row left a third of it empty - print-lint H13)
            practiceShapes: [[6, 2], [4, 2], [2, 2]],
            mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' } }, { key: 'addition:add_facts', opts: { band: 20 } }],
        },
        'multiplication:mult_properties': {
            skills: [by5, x2],
            concepts: [
                { id: 'rows-cols', text: 'An array is rows times the number in each row.' },
                { id: 'turn', text: 'Turning an array swaps the rows and the columns.' },
                { id: 'same', text: 'Turning adds no dot and takes none away: the product stays the same.' },
            ],
            vocab: [
                { word: 'array', meaning: 'equal rows of dots', picture: { kind: 'text', text: '3 rows of 4' } },
                { word: 'turn', meaning: 'the rows become the columns', picture: { kind: 'text', text: '3 × 4 → 4 × 3' } },
                { word: 'product', meaning: 'the answer of a times fact', picture: { kind: 'text', text: '3 × 4 = 12' } },
            ],
            steps: [
                { icon: 'look', text: 'Look at the array.' },
                { icon: 'write', text: 'Write the fact.' },
                { icon: 'start', text: 'Turn the array.' },
                { icon: 'write', text: 'Write the new fact.' },
                { icon: 'check', text: 'Check: same product.' },
            ],
            chant: 'Turn it round, the same amount!',
            format: {
                kind: 'numbered steps with icons + a chant',
                why: 'The one idea pupils lose is that the turn keeps the product (they recount); a short chant said at step 5 is the check.',
            },
            example: { match: 'Turn the array' },
            // (an array and its turn side by side is wider than half the page at L: the chart's panels and the Guided
            // problems take full-width rows, as the count rows do)
            guidedRows: 2,
            // (an array and its turn, two a row: one cell width per section - print-lint GRID-EVEN, LONE)
            practiceShapes: [[8, 2], [6, 2], [4, 2], [2, 2]],
            mixWith: [{ key: 'multiplication:arrays_groups', opts: { forms: [0] } }, { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' } }],
            // (lane lf-ops critic r1 D-MP-7 / D-MP-8 / D-MP-12: the lesson for each property it can deal - `forms` - has its own
            // concepts, vocabulary, steps (the provider's worked steps, sheet/providers/multiplication.js mpSteps) and Rule;
            // the order-property data above is forms [0]. lessonFor(cat, skill, opts) merges the entry the opts pick.)
            byOption: {
                forms: {
                    1: {
                        concepts: [
                            { id: 'parts', text: 'An array can be broken into two parts.' },
                            { id: 'each-part', text: 'Multiply each part.' },
                            { id: 'add', text: 'Add the two parts: that is the whole array.' },
                        ],
                        vocab: [
                            { word: 'array', meaning: 'equal rows of dots', picture: { kind: 'text', text: '6 rows of 2' } },
                            { word: 'part', meaning: 'some of the rows', picture: { kind: 'text', text: '3 rows of 2' } },
                            { word: 'whole', meaning: 'both parts together', picture: { kind: 'text', text: '6 + 6 = 12' } },
                        ],
                        steps: [
                            { icon: 'look', text: 'Look at the two parts.' },
                            { icon: 'write', text: 'Multiply the top part.' },
                            { icon: 'write', text: 'Multiply the bottom part.' },
                            { icon: 'check', text: 'Add the parts. Write the whole.' },
                        ],
                        chant: 'Break it, multiply, add!',
                        format: { kind: 'numbered steps with icons + a rule', why: 'The step pupils drop is the second part (MU-M7): the rule names all three moves.' },
                        example: { match: 'Look at the parts' },
                        // (critic r1 D-MP-7: one split array and THREE facts is taller than a half-page panel - 131 mm in a
                        // 106 mm panel at L, the facts over the Say band: each panel a full-width row, two states)
                        chartWide: true, chartRow: true, chartStates: 2,
                    },
                    unit: {
                        concepts: [
                            { id: 'one', text: 'Times 1: one group of the number, or the number of groups of 1.' },
                            { id: 'same', text: 'Times 1 keeps the number the same.' },
                            { id: 'zero', text: 'Times 0: no groups, or groups of nothing. The product is 0.' },
                        ],
                        vocab: [
                            { word: 'times 1', meaning: 'one group', picture: { kind: 'text', text: '1 × 7 = 7' } },
                            { word: 'times 0', meaning: 'no groups', picture: { kind: 'text', text: '0 × 7 = 0' } },
                            { word: 'product', meaning: 'the answer of a times fact', picture: { kind: 'text', text: '7 × 1 = 7' } },
                        ],
                        steps: [
                            { icon: 'look', text: 'Read the fact.' },
                            { icon: 'decide', text: 'Find the 1 or the 0.' },
                            { icon: 'check', text: 'Times 1: the other number. Times 0: zero.' },
                            { icon: 'write', text: 'Write the product.' },
                        ],
                        chant: 'Times 1, the same. Times 0, zero!',
                        format: { kind: 'numbered steps with icons + a rule', why: 'Pupils add 1 (MU-M5) or keep the number for times 0 (MU-M4): the rule says both.' },
                        example: { match: 'Read the fact' },
                        // (a times 1 / times 0 fact is one short line: the practice page holds a full page of them)
                        practiceShapes: [[24, 3], [18, 3], [12, 3], [8, 2]],
                        guidedRows: 3,
                    },
                    // several properties on one page (forms [0..3]): the page's own title (strings 'other') and a rule
                    // that names none of them in particular
                    mixed: {
                        concepts: [
                            { id: 'same-product', text: 'Turning an array keeps the product.' },
                            { id: 'parts', text: 'An array broken into parts: add the parts.' },
                            { id: 'one-zero', text: 'Times 1 keeps the number; times 0 makes 0.' },
                        ],
                        vocab: [
                            { word: 'turn', meaning: 'the rows become the columns', picture: { kind: 'text', text: '3 × 4 → 4 × 3' } },
                            { word: 'part', meaning: 'some of the rows', picture: { kind: 'text', text: '2 rows of 4' } },
                            { word: 'product', meaning: 'the answer of a times fact', picture: { kind: 'text', text: '1 × 4 = 4' } },
                        ],
                        chant: 'Look first: turn it, break it, or times 1 or 0?',
                    },
                },
            },
        },
    };
}

/** The lesson entry an option set picks (`byOption`, lane lf-ops critic r1): {forms: {1: {...}, unit: {...}}} - a set
 *  option holding ONE value takes that value's entry; forms 2 and 3 (times 1, times 0) alone or together take `unit`;
 *  any other mix takes `mixed`. */
function optionLesson(data, opts) {
    if (!data || !data.byOption || !opts) return data;
    let out = data;
    for (const [id, table] of Object.entries(data.byOption)) {
        let v = opts[id];
        if (v === undefined || v === null) continue;
        const list = Array.isArray(v) ? [...new Set(v.map(String))] : [String(v)];
        const hit = list.length === 1 && table[list[0]] ? table[list[0]]
            : table.unit && list.length && list.every((x) => x === '2' || x === '3') ? table.unit
                : list.length > 1 && table.mixed ? table.mixed : null;
        if (hit) out = Object.assign({}, out, hit);
    }
    return out;
}

function skipCountLessons() {
    const VOCAB = [
        { word: 'skip count', meaning: 'count on by the same jump', picture: { kind: 'text', text: '5, 10, 15, 20' } },
        { word: 'jump', meaning: 'how much is added each time', picture: { kind: 'glyph', text: '+5' } },
        { word: 'missing', meaning: 'the number in the empty box', picture: { kind: 'text', text: '10, ?, 30' } },
    ];
    const STEPS = [
        { icon: 'look', text: 'Find the jump.' },
        { icon: 'count', text: 'Add the jump.' },
        { icon: 'write', text: 'Write the next number.' },
        { icon: 'check', text: 'Every gap. Check each jump.' },
    ];
    const FORMAT = {
        kind: 'numbered steps with icons + a chant',
        why: 'The one thing pupils lose is the size of the jump at a gap; saying the count aloud in the jump keeps it the same every time.',
    };
    // Counting on by 1s and by 10s: the counts every skip count stands on (written answers only: no drag task on paper).
    const after = { key: 'counting:count_sequence', opts: { band: 100, dir: 'forward' }, why: 'Say the number after: counting on by 1.' };
    const tens = { key: 'counting:number_seq_fill', opts: { step: 10, dir: 'forward' }, why: 'Counting on by 10s: the first skip count.' };
    const base = (o) => Object.assign({
        concepts: [
            { id: 'same-jump', text: 'Every jump is the same size.' },
            { id: 'add-jump', text: 'Add the jump to get the next number.' },
        ],
        vocab: VOCAB, steps: STEPS, chant: 'Same jump, every time!', format: FORMAT,
        example: { match: 'each jump adds' },
        // (a count row is too wide for half the page: the chart's panels and the Guided cells take full-width rows)
        chartWide: true, chartStates: 3, guidedRows: 2,
        // (the practice pages: the most whole rows a page holds, most first; critic SC3, H13 - 6 rows in 2 x 3 left each cell half empty)
        practiceShapes: [[8, 1], [7, 1], [6, 1], [5, 1], [4, 1]],
    }, o);
    return {
        'patterns:skip_count_line': base({
            skills: [tens, after],
            mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 10, dir: 'forward' } }, { key: 'counting:count_sequence', opts: { band: 100, dir: 'forward' } }],
        }),
        'patterns:skip_count_grid': base({
            skills: [tens, after],
            mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 10, dir: 'forward' } }, { key: 'counting:count_sequence', opts: { band: 100, dir: 'forward' } }],
        }),
        'multiplication:count_by_tables': base({
            // (a skip-count row of its own - or an array beside a track - ran the Warm-up to 118 mm and pushed Guided overleaf at L:
            // the friendly counts by 5s and by 2s, each in one short track, are what every table count builds on)
            skills: [
                { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' }, why: 'Skip counting by 5s: a friendly count the tables build on.' },
                { key: 'counting:number_seq_fill', opts: { step: 2, dir: 'forward' }, why: 'Skip counting by 2s: the 2 times-table as a count.' },
            ],
            mixWith: [{ key: 'patterns:skip_count_grid' }, { key: 'multiplication:arrays_groups' }],
        }),
    };
}

/** The lesson data of a skill, or null (a skill with no authored lesson yet). */
export function lessonFor(categoryId, skillId, opts = null) {
    const d = LESSONS[`${categoryId}:${skillId}`] || null;
    return d && d.byOption ? optionLesson(d, opts) : d;
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
