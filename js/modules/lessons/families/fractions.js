// js/modules/lessons/families/fractions.js
// LESSON FAMILY "fractions" - Fractions, decimals and percentages, ratio.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.

// lf-algebra (2026-11-20, card design/cards/mixed-partition): Y4.B7.S3 Partition a mixed number - the lessons-first short
// lesson of fractions:mixed_numbers_intro. Four steps, as many as the provider's worked steps (sheet/providers/fractions.js
// mnSteps: read it, the wholes, the fraction, say it).
const MN_CASES = 'lf-algebra mixed-partition build (2026-11-20): its cases are declared when the lesson passes its critic (lessons-first).';
const MN_CHECK = 'lf-algebra mixed-partition build (2026-11-20): the Warm-up deals the fraction and whole skills it stands on, until its Prerequisite Check is written (LR-17).';

export const ROUTINES = Object.freeze({
    'mixed-partition': {
        archetype: 'partwhole',
        casesPending: MN_CASES,
        concepts: [
            { id: 'mixed', text: 'A mixed number is wholes and a fraction.' },
            { id: 'wholes', text: 'Each full bar is one whole.' },
            { id: 'part', text: 'The last bar is the fraction: the parts shaded of the parts in one whole.' },
        ],
        vocab: [
            { word: 'mixed number', meaning: 'wholes and a fraction together', picture: { kind: 'text', text: '2 and 3 quarters' } },
            { word: 'wholes', meaning: 'the full bars', picture: { kind: 'text', text: '2 wholes' } },
            { word: 'fraction', meaning: 'the part of one whole', picture: { kind: 'text', text: '3 of 4 parts' } },
        ],
        steps: [
            { icon: 'look', text: 'Read it.' },
            { icon: 'count', text: 'Write the wholes.' },
            { icon: 'write', text: 'Write the fraction.' },
            { icon: 'say', text: 'Say it.' },
        ],
        chant: 'Wholes first. Then the part.',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'Four actions in a fixed order; the chant keeps the wholes before the part.',
        },
        example: { match: 'wholes' },
    },
});

export const LESSONS = Object.freeze({
    'Y4.B7.S3': {
        routine: 'mixed-partition',
        practice: { skill: 'fractions:mixed_numbers_intro' },
        defaultFor: true,
        prereqsPending: MN_CHECK,
        warmup: [
            { key: 'fractions:write_fraction', opts: { model: ['bar'] }, why: 'The part bar is a fraction: the shaded parts of the parts in one whole.' },
            { key: 'composing:compose_whole', why: 'A full bar is one whole: all its parts.' },
        ],
        mixWith: [{ key: 'fractions:write_fraction', opts: { model: ['bar'] } }, { key: 'composing:compose_whole' }],
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
