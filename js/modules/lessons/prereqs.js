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
export const STEP_ICONS = Object.freeze(['look', 'start', 'count', 'write', 'regroup', 'subtract', 'decide', 'check', 'say']);

export const LESSONS = Object.freeze({
    // ---------------------------------------------------------------- Add within 10 (K-1)
    // The skill is addition:add_facts with its band option at 10 ("Within N" bounds the sum).
    'addition:add_facts': {
        skills: [
            { key: 'counting:count_objects', opts: { band: 10 }, why: 'Counting a set is how a sum is found.' },
            { key: 'composing:number_bonds', opts: { band: 10 }, why: 'Two parts make a whole: the idea of adding.' },
        ],
        concepts: [
            { id: 'join', text: 'Adding puts two groups together.' },
            { id: 'count-on', text: 'Start at the bigger number and count on.' },
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
        example: { match: 'Count on' },
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
            { icon: 'subtract', text: 'Subtract the ones.' },
            { icon: 'subtract', text: 'Subtract the tens.' },
            { icon: 'check', text: 'Check: add back.' },
        ],
        chant: 'Top too small? Take a ten!',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The one decision pupils forget is whether to regroup; a four-word chant said at step 2 cues it every time.',
        },
        example: { match: 'Regroup a ten' },
        mixWith: [{ key: 'addition:add_100_regroup' }],
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
            { icon: 'look', text: 'Find the two tens.' },
            { icon: 'look', text: 'Look at the ones digit.' },
            { icon: 'decide', text: 'Round up or down.' },
            { icon: 'write', text: 'Write the ten.' },
        ],
        chant: '5 or more, round up. 4 or less, round down.',
        format: {
            kind: 'numbered steps with icons + a rule chant',
            why: 'The whole skill turns on one rule; saying it as a rhythm is what pupils remember when the number line is gone.',
        },
        example: { match: 'round up', prefer: '\\b\\d[678]\\b' },
        mixWith: [{ key: 'number_sense:nearest_100' }],
    },
});

/** The lesson data of a skill, or null (a skill with no authored lesson yet). */
export function lessonFor(categoryId, skillId) {
    return LESSONS[`${categoryId}:${skillId}`] || null;
}

/** `{categoryId, skillId, opts?}` of a 'category:skill' key. */
export function skillRef(entry) {
    const [categoryId, skillId] = String(entry.key || '').split(':');
    return entry.opts ? { categoryId, skillId, opts: Object.assign({}, entry.opts) } : { categoryId, skillId };
}

export default { LESSONS, STEP_ICONS, lessonFor, skillRef };
