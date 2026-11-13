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
    // ------------------------------------------------------------- Arrays and properties (lane lf-ops build #4, 3.OA.B.5)
    // Ported from lf-ops fix4's lessons/prereqs.js (ops-tables card 9 Q3): arrays_groups counts an array or equal groups
    // by the row size; mult_properties teaches the order property by default and, per `forms` (byOption, read by
    // prereqs.js optionLesson), the break-apart and the times 1 / times 0 properties.
    'mult-arrays-count': {
        archetype: 'groups',
        iconsPending: 'Ported from lane lf-ops build #4 as printed: two steps are both a count or both a write (one action, done twice).',
        casesPending: 'Ported from lane lf-ops build #4 (ops-tables card 9 Q3, signed 2026-11-07); its cases are declared when the lesson is carded (lessons-first).',
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
    },
    'mult-turn-array': {
        archetype: 'groups',
        iconsPending: 'Ported from lane lf-ops build #4 as printed: two steps are both a count or both a write (one action, done twice).',
        casesPending: 'Ported from lane lf-ops build #4 (ops-tables card 9 Q3, signed 2026-11-07); its cases are declared when the lesson is carded (lessons-first).',
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
    // ------------------------------------------------------------- Count by the tables (lane lf-ops build #4, 3.OA.C.7 prep)
    // count_by_tables (count-row card, signed 2026-11-12): one count-by row per table, a jump arrow between numbers; the
    // pupil reads the jump, adds it to get the next number and writes each missing number. Its four steps are the four
    // worked states of countby.js rowSteps (the jump; the first gap; the next gap; every gap, each jump checked).
    'mult-count-by-table': {
        archetype: 'count',
        casesPending: 'Lane lf-ops build #4 r5 (node-lint LESSON-DATA): written from the count-row card (signed 2026-11-12) and the provider steps; its cases are declared when the lesson is carded (lessons-first).',
        concepts: [
            { id: 'jump', text: 'Every jump is the same size: the number in the box.' },
            { id: 'add-jump', text: 'Add the jump to a number to get the next one.' },
            { id: 'table', text: 'Counting by a number says its times table.' },
        ],
        vocab: [
            { word: 'count by', meaning: 'say every 5th (or 2nd, 3rd ...) number', picture: { kind: 'text', text: '5, 10, 15' } },
            { word: 'jump', meaning: 'how much is added each time', picture: { kind: 'text', text: '+ 5' } },
            { word: 'missing', meaning: 'a number not written yet: an empty box', picture: { kind: 'text', text: '10, __, 20' } },
        ],
        steps: [
            { icon: 'look', text: 'Read the jump.' },
            { icon: 'count', text: 'Add the jump.' },
            { icon: 'write', text: 'Write the missing number.' },
            { icon: 'check', text: 'Check every jump.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'Four actions, one icon each; the count itself ("I count by 5: 5, 10, 15") is the Say band, so a chant would only repeat it.',
        },
        example: { match: 'Count by' },
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
    'skill:multiplication:arrays_groups': {
        routine: 'mult-arrays-count',
        practice: { skill: 'multiplication:arrays_groups' },
        prereqsPending: 'Ported from lane lf-ops build #4 with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'counting:number_seq_fill', opts: { step: 2, dir: 'forward' }, why: 'Skip counting by 2s: the 2 times-table as a count.' },
            { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' }, why: 'Skip counting by 5s: how a row of dots is counted fast.' },
        ],
        mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' } }, { key: 'addition:add_facts', opts: { band: 20 } }],
    },
    'skill:multiplication:count_by_tables': {
        routine: 'mult-count-by-table',
        practice: { skill: 'multiplication:count_by_tables' },
        prereqsPending: 'Lane lf-ops build #4 r5 (node-lint LESSON-DATA): a Warm-up of the skip counts it extends until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'counting:number_seq_fill', opts: { step: 2, dir: 'forward' }, why: 'Skip counting by 2s: a count-by row with the smallest jump.' },
            { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' }, why: 'Skip counting by 5s: the count-by row most pupils know first.' },
        ],
        mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 10, dir: 'forward' } }, { key: 'addition:add_facts', opts: { band: 20 } }],
    },
    'skill:multiplication:mult_properties': {
        routine: 'mult-turn-array',
        practice: { skill: 'multiplication:mult_properties' },
        prereqsPending: 'Ported from lane lf-ops build #4 with its Warm-up until its Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' }, why: 'Skip counting by 5s: how a row of dots is counted fast.' },
            { key: 'multiplication:mult_facts', opts: { constant: [2], notation: ['across'], band: 100 }, why: 'A known times fact: the fact an array is named by.' },
        ],
        mixWith: [{ key: 'multiplication:arrays_groups', opts: { forms: [0] } }, { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward' } }],
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
