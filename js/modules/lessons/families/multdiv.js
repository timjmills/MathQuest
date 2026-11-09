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
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
