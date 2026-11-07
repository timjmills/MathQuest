// js/modules/lessons/families/multdiv.js
// LESSON FAMILY "multdiv" - Multiplication and division: equal groups, arrays, tables, written methods, factors and multiples.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.

export const ROUTINES = Object.freeze({
    // ------------------------------------------------------------- Division facts (3)
    // Ported from master's lessons/prereqs.js (Lane D R4 prep, node-lint LESSON-DATA): div_facts divides by thinking
    // of the times fact (3.OA.6, 3.OA.7).
    'div-think-times': {
        archetype: 'fact',
        casesPending: 'Ported from Lane D unchanged; its cases are declared when the lesson is carded (lessons-first).',
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
        // (master's record named no worked-example strategy; a match-anything pattern keeps its chart example the one it
        // printed - pickExample's first tier is then its no-pattern tier - until the lesson is carded)
        example: { match: '[\\s\\S]' },
    },
    // ------------------------------------------------------- Lesson words with pictures (lane lf-vocab, 2026-11-07)
    // vocabulary:vocab_grade_pictures (Match 3 pictures): its default words are the pilot unit's (G3-Y4.B4, grade 3
    // multiplication and division). Three steps, one per worked step of the provider (look, say, write).
    'vocab-picture-words': {
        archetype: 'fact',
        // a full-width drawing: the anchor chart's panels one column (chart.js chartLayout; precritic render gate r1)
        chartWide: true,
        casesPending: 'Lane lf-vocab: the cases are the lesson word sets (sheet/lesson-pages/vocab-words.js); carded in design/cards/vocabulary.',
        concepts: [
            { id: 'picture', text: 'Each picture shows one math word.' },
            { id: 'mark', text: 'The thick line shows the part the word means.' },
        ],
        vocab: [
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'fact', a: 4, b: 3 } },
            { word: 'array', meaning: 'things in equal rows', picture: { kind: 'array', rows: 3, cols: 3 } },
            { word: 'row', meaning: 'a line going across', picture: { kind: 'array', rows: 1, cols: 4, mark: 'row' } },
        ],
        steps: [
            { icon: 'look', text: 'Look at pictures A, B and C.' },
            { icon: 'say', text: 'Say what each picture shows.' },
            { icon: 'write', text: 'Write each letter next to its word.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'Three moves (SCC-P4: 3-6 steps), one anchor-chart panel each in one column, so a panel is wide and tall enough for the whole cell; the Say band is the oral frame, so no chant.',
        },
        example: { match: '[\\s\\S]' },
    },
    // vocabulary:vocab_pick3_words (1 picture, 3 words): the same words, the productive step.
    'vocab-name-picture': {
        archetype: 'fact',
        // a full-width drawing: the anchor chart's panels one column (chart.js chartLayout; precritic render gate r1)
        chartWide: true,
        // (each panel a row: the cell beside the step's words, so three panels fit one page - r2 render: col panels ran off)
        chartRow: true,
        casesPending: 'Lane lf-vocab: the cases are the lesson word sets (sheet/lesson-pages/vocab-words.js); carded in design/cards/vocabulary.',
        concepts: [
            { id: 'picture', text: 'Each picture shows one math word.' },
            { id: 'bank', text: 'One word in the box names the picture.' },
        ],
        vocab: [
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'fact', a: 4, b: 3 } },
            { word: 'array', meaning: 'things in equal rows', picture: { kind: 'array', rows: 3, cols: 3 } },
            { word: 'row', meaning: 'a line going across', picture: { kind: 'array', rows: 1, cols: 4, mark: 'row' } },
        ],
        steps: [
            { icon: 'look', text: 'Look at the picture.' },
            { icon: 'say', text: 'Read the three words in the box.' },
            { icon: 'write', text: 'Write its word on the line.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'Three moves (SCC-P4), one anchor-chart panel each in one column, so a panel holds the whole cell; the Say band is the oral frame.',
        },
        example: { match: '[\\s\\S]' },
    },
});

export const LESSONS = Object.freeze({
    'skill:division:div_facts': {
        routine: 'div-think-times',
        practice: { skill: 'division:div_facts' },
        prereqsPending: 'Ported from Lane D with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'multiplication:mult_facts', why: 'Each division fact is a times fact read backwards.' },
            { key: 'division:missing_mult_div', why: 'A missing factor is the answer of a division fact.' },
        ],
        mixWith: [{ key: 'multiplication:mult_facts' }, { key: 'division:missing_mult_div' }],
    },
    'skill:vocabulary:vocab_grade_pictures': {
        routine: 'vocab-picture-words',
        practice: { skill: 'vocabulary:vocab_grade_pictures' },
        prereqsPending: 'Lane lf-vocab: a vocabulary skill opens other lessons (the lesson part vocab-page); its Warm-up is the table the words describe.',
        warmup: [
            { key: 'multiplication:mult_chart_easy', why: 'The times table the words row, column, product and multiple describe.' },
            { key: 'multiplication:mult_facts', why: 'Factor and product are the parts of a times fact.' },
        ],
        mixWith: [{ key: 'multiplication:mult_chart_easy' }, { key: 'multiplication:mult_facts' }],
    },
    'skill:vocabulary:vocab_pick3_words': {
        routine: 'vocab-name-picture',
        practice: { skill: 'vocabulary:vocab_pick3_words' },
        prereqsPending: 'Lane lf-vocab: a vocabulary skill opens other lessons (the lesson part vocab-page); its Warm-up is the matching step before it.',
        warmup: [
            { key: 'vocabulary:vocab_grade_pictures', why: 'Matching the same words to their pictures comes first.' },
            { key: 'multiplication:mult_chart_easy', why: 'The times table the words describe.' },
        ],
        mixWith: [{ key: 'vocabulary:vocab_grade_pictures' }, { key: 'multiplication:mult_facts' }],
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
