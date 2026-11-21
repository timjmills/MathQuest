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

export const ROUTINES = {
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
        // (lf-algebra r3, lesson M PAGEFILL 37 %: the Practice page is ONE page - the two bar-model rows the hint fades from, then
        // one row of two diagrams under them (sheet/paginate.js fillRest); six problems ran to a second page that held one row)
        // (at L the two bar rows fill the page with the step strip: a row of diagrams no longer fits under them)
        practiceShapesBySize: { M: [[4, 2]], L: [[2, 1]] },
    },
};
// (mnTask compose / name - A18: every chart panel is a full-width row, the step's words over the drawing; the bars stand in one
// row UNDER the diagram (lead ruling 2026-11-21 (2): beside it the pair ran the chart over the page). `headFirst`: the opening
// step writes nothing, so it is the numbered line over the two panels (chart.js) - two drawings fit the chart page at zoom 1.
// Their own four steps, the provider's worked steps)
ROUTINES['mixed-partition'].byOption = {
    mnTask: {
        compose: {
            // (every compose / name problem is a full-width bar-model row: the Practice page holds three at M, two at L, on one page)
            chartWide: true, chartRow: false, guidedRows: 1, headFirst: true, practiceShapesBySize: { M: [[3, 1]], L: [[2, 1]] },
            steps: [{ icon: 'look', text: 'Read the parts.' }, { icon: 'write', text: 'Write the wholes.' }, { icon: 'write', text: 'Write the fraction.' }, { icon: 'say', text: 'Say it.' }],
        },
        name: {
            chartWide: true, chartRow: false, guidedRows: 1, headFirst: true, practiceShapesBySize: { M: [[3, 1]], L: [[2, 1]] },
            steps: [{ icon: 'count', text: 'Count the bars.' }, { icon: 'write', text: 'Write the mixed number.' }, { icon: 'write', text: 'Write the parts.' }, { icon: 'say', text: 'Say it.' }],
        },
    },
    // (the equation form draws no bars: its short rows fill the Practice page, the most that fit first)
    mnForm: { eq: { practiceShapesBySize: { M: [[12, 2], [10, 2], [8, 2]], L: [[12, 2], [10, 2], [8, 2]] } } },
};
Object.freeze(ROUTINES);

export const LESSONS = Object.freeze({
    'Y4.B7.S3': {
        routine: 'mixed-partition',
        practice: { skill: 'fractions:mixed_numbers_intro' },
        defaultFor: true,
        prereqsPending: MN_CHECK,
        warmup: [
            { key: 'fractions:write_fraction', opts: { model: ['bar'] }, why: 'The part bar is a fraction: the shaded parts of the parts in one whole.' },
            // (two cells of one height: a shade-it bar beside a write-it bar left a 35 % band under the shorter one at L)
            // ('What fraction is shaded?' only (forms [0]): the pick-a-model form's fraction stood 0.1 mm from the cell's number tab
            // in the half-width Warm-up cell at L - ws-empty-band TAB-CLEAR - and the part's instruction named two tasks)
            { key: 'fractions:identify', opts: { model: ['bar'], forms: [0] }, why: 'A bar cut into equal parts: count the parts in one whole.' },
        ],
        mixWith: [{ key: 'fractions:write_fraction', opts: { model: ['bar'] } }, { key: 'fractions:shade_fraction', opts: { model: ['bar'] } }],
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
