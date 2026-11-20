// js/modules/lessons/families/multdiv.js
// LESSON FAMILY "multdiv" - Multiplication and division: equal groups, arrays, tables, written methods, factors and multiples.
// One lesson lane owns this file (design/LESSON_LIBRARY_PLAN.md §2). It holds:
//   ROUTINES  {id: routine}   the teaching (lessons/schema.js), hand-authored
//   LESSONS   {id: lesson}    one per WRM small step (or sup: / ccss: / ee: / skill:), thin
//   NEEDS     [need]          what a lesson waits for (merged into build-list.js)
// A lesson lane never edits generators, providers, options or the engine; ids are never deleted.
// Pure data.

// The 1-digit column routine (lane lf-ops sizes): its own routine, and the `tiles: 41` option entry of the 2-digit
// routine (a 4-digit x 1-digit item has five worked steps, one per place and the product; under the 2-digit routine's four
// step names, steps 1 and 2 shared panel 1 and ran 7 mm out of it - ws-cell-checks OVERFLOW, lesson tiles=41).
const MULT_COLUMN_1DIGIT = Object.freeze({
    archetype: 'column',
    casesPending: 'Lane lf-ops sizes (card mult-sizes): the 4-digit column lesson; its cases (a place with no regrouping, a regrouped place, a 0 digit) are declared when unit G4-Y5.B5 is carded.',
    concepts: [
        { id: 'ones-first', text: 'Multiply the ones first, then each place to the left.' },
        { id: 'regroup', text: '10 or more? Write the ones digit. Regroup the tens into the next place.' },
        { id: 'add-on', text: 'Multiply first, then add the regrouped number.' },
    ],
    vocab: [
        { word: 'multiply', meaning: 'the × sign: equal groups', picture: { kind: 'glyph', text: '×' } },
        { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '4 × 3 = 12' } },
        { word: 'regroup', meaning: '10 ones become 1 ten', picture: { kind: 'trade' } },
    ],
    // (one step per place of the 4-digit number, then the product: shortMultSteps' five worked steps)
    steps: [
        { icon: 'start', text: 'Multiply the ones.' },
        { icon: 'regroup', text: 'Multiply the tens. Add on.' },
        { icon: 'count', text: 'Multiply the hundreds. Add on.' },
        { icon: 'write', text: 'Multiply the thousands. Add on.' },
        { icon: 'check', text: 'Read the product.' },
    ],
    chant: 'Multiply, then add the regrouped number!',
    format: {
        kind: 'numbered steps with icons + a chant',
        why: 'The error pupils make is adding the regrouped number before multiplying (or not at all); the chant says the order at step 2.',
    },
    example: { match: 'regroup' },
    // (five worked steps in a 2 x 2 chart: the drawing may go down to LR-15's 0.8 floor rather than past the Say band)
    chartMinZoom: 0.8,
    // (the product step writes nothing new - the thousands step already wrote every digit: the line under the four panels,
    // so no panel holds two steps; print-lint OVERFLOW 22 mm / L-OVERLAP "Say:" when steps 1 and 2 shared panel 1)
    tailLast: true,
});

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
        // (a count-by row is a full-width drawing - two lines of six numbers: the anchor chart's panels one column, the step's
        // words under the row, LESSONS L11; in a half-page panel the row shrank its boxes to 2.6 mm, print-lint TY-12)
        chartWide: true,
        // (the closing step - every gap filled, each jump checked - is the line under the panels, not a fourth panel: four
        // full-width rows with the times labels under them - option times each / given, 15 jumps - ran past the page, ws-cell-checks
        // OVERFLOW 16-18 on the lesson chart)
        tailLast: true,
        casesPending: 'Lane lf-ops build #4 r5 (node-lint LESSON-DATA): written from the count-row card (signed 2026-11-12) and the provider steps; its cases are declared when the lesson is carded (lessons-first).',
        concepts: [
            { id: 'jump', text: 'Every jump is the same size: the number in the arrow.' },
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
        // (one count row a line - the footprint's maxCols 1: the default 6 x 2 shape fell back to two pages, 4 + 2 with no step strip,
        // print-lint PAGEFILL / PG-23. Densest first: the page takes as many rows as print on it, LR-17's single Practice page)
        practiceShapes: [[8, 1], [7, 1], [6, 1], [5, 1], [4, 1], [3, 1]],
        // (critic cbt r1 D8: a row with its times labels, or of 15 jumps, is taller - the chart draws two panels, not three,
        // so its row keeps the working size instead of a zoom to 13 pt; prereqs.js optionLesson reads `byOption`)
        byOption: {
            // (lead ruling 2026-11-14, cbt r3 E7: the look step "Read the jump" is a numbered HEAD line above the two panels -
            // `headFirst` - not merged into panel 1, so every step keeps its own numbered line, P-1)
            times: { each: { chartMaxStates: 2, headFirst: true }, given: { chartMaxStates: 2, headFirst: true } },
            // (critic cbt r1 D9: three-line Guided rows - two of them did not fit under the Warm-up, so the sheet's page 1 stood half
            // empty and its page 2 held the Guided and ONE Independent row; one Guided row keeps the sheet on one page)
            jumps: { 15: { chartMaxStates: 2, headFirst: true, guidedRows: 1 } },
        },
    },
    // ------------------------------------------------ Multiplication by size (lane lf-ops sizes, card mult-sizes, 2026-11-20)
    // Y5.B5.S1-S4 (4.NBT.B.5, 5.NBT.B.5): one routine per written method. Each routine's steps are the provider's worked steps
    // for the example, one to one (lesson-pages/common.js namedSteps): the area model's areaSteps (sheet/providers/
    // multiplication.js) - split, one step per part (1-digit multiplier) or per row (2-digit), add the parts - and, for the
    // column methods, multiplication:multiply's own (shortMultSteps: one step per place, then the product; longMultSteps:
    // the ones row, the tens row with its placeholder 0, the sum).
    'mult-column-1digit': MULT_COLUMN_1DIGIT,
    'mult-column-2digit': {
        archetype: 'column',
        casesPending: 'Lane lf-ops sizes (card mult-sizes): the long-multiplication lesson; its cases (regrouping in a row / in the sum, a multiplier ending in 0) are declared when unit G4-Y5.B5 is carded.',
        concepts: [
            { id: 'two-rows', text: 'Multiply by the ones digit, then by the tens: two rows.' },
            { id: 'zero', text: 'The tens row starts with a 0 in the ones place: you are multiplying by tens.' },
            { id: 'add-rows', text: 'Add the two rows to find the product.' },
        ],
        vocab: [
            { word: 'partial product', meaning: 'one row: the top number × one digit', picture: { kind: 'text', text: '76 × 9 = 684' } },
            { word: 'placeholder 0', meaning: 'the 0 in the ones of the tens row', picture: { kind: 'text', text: '76 × 30 = 2,280' } },
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '684 + 2,280 = 2,964' } },
        ],
        // (longMultSteps' four worked steps: the ones row, the placeholder 0, the tens row, the sum)
        steps: [
            // (one line each in a half-width chart panel: the chant says them in the same order)
            { icon: 'start', text: 'Ones row.' },
            { icon: 'write', text: 'Write the 0.' },
            { icon: 'regroup', text: 'Tens row.' },
            { icon: 'count', text: 'Add the rows.' },
        ],
        chant: '',
        format: {
            kind: 'icons + very short steps',
            why: 'The step pupils drop is the placeholder 0 of the tens row (the second row then is ten times too small): it is a step of its own, and the four step names said in order ("Ones row. Write the 0. Tens row. Add the rows.") are the rule, so a chant would repeat them - and its band would push the 4-panel chart off its page.',
        },
        example: { match: 'Multiply by the ones' },
        // (the long-multiplication grid - top number, two rows, the sum, their carry boxes - is ~20 mm too tall for two panel rows
        // on one page at zoom 1 (118.5 mm a panel row, 195 mm free at M): it ran over the Say band. chart.js chartPage may draw
        // it down to LR-15's floor, 0.8)
        chartMinZoom: 0.8,
        // (`byOption`, prereqs.js optionLesson - lane lf-ops sizes fix 2026-11-20: the card prints this lesson for every `tiles` value;
        // a 4-digit x 1-digit item is taught with the 1-digit column routine - five steps, the product line under the panels)
        // ... and the tables facts (tiles null: 11 x 11 in the stack, no long-multiplication grid) keep the panels at most 1.3 up,
        // so the measure's millimetre has room (OVERFLOW 0.6 mm on the third panel at zoom 1.6)
        byOption: { tiles: { 41: MULT_COLUMN_1DIGIT, null: { chartMaxZoom: 1.3 } } },
    },
    'mult-area-1digit': {
        archetype: 'groups',
        casesPending: 'Lane lf-ops sizes (card mult-sizes): the 4-digit area model; its cases (a 0 digit, a part of 10 or more) are declared when the lesson is carded.',
        concepts: [
            { id: 'split', text: 'Split the big number by place: thousands, hundreds, tens and ones.' },
            { id: 'parts', text: 'Multiply each part by the 1-digit number.' },
            { id: 'add', text: 'Add the parts: that is the product.' },
        ],
        vocab: [
            { word: 'part', meaning: 'one place of the number', picture: { kind: 'text', text: '1,000 + 500' } },
            { word: 'area model', meaning: 'a rectangle split into parts', picture: { kind: 'text', text: '5 × 500 = 2,500' } },
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '4 × 3 = 12' } },
        ],
        steps: [
            { icon: 'look', text: 'Split the number by place.' },
            { icon: 'start', text: 'Multiply the thousands.' },
            { icon: 'regroup', text: 'Multiply the hundreds.' },
            { icon: 'count', text: 'Multiply the tens.' },
            { icon: 'write', text: 'Multiply the ones.' },
            { icon: 'check', text: 'Add the parts.' },
        ],
        chant: 'Split it, multiply each part, add!',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'One step per part, so no part is dropped (the left-out-part error); the chant names the three moves.',
        },
        // (lead A9: the area model is too wide for a half-page panel, so the chart prints one full-width panel a row; down to LR-15's
        // 0.8 floor, two panel rows share a chart page instead of one, chart.js chartPage)
        chartMinZoom: 0.8,
        example: { match: '^Split' },
    },
    'mult-area-2digit': {
        archetype: 'groups',
        casesPending: 'Lane lf-ops sizes (card mult-sizes): the 2-row area model; its cases (a 0 digit, a 2 x 3 grid) are declared when the lesson is carded.',
        concepts: [
            { id: 'split', text: 'Split both numbers by place: tens and ones (and hundreds).' },
            { id: 'rows', text: 'Multiply across each row: one part for each box.' },
            { id: 'add', text: 'Add all the parts: that is the product.' },
        ],
        vocab: [
            { word: 'part', meaning: 'one box: a place times a place', picture: { kind: 'text', text: '70 × 30 = 2,100' } },
            { word: 'row', meaning: 'a line of boxes going across', picture: { kind: 'array', rows: 1, cols: 4, mark: 'row' } },
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '4 × 3 = 12' } },
        ],
        steps: [
            { icon: 'look', text: 'Split both numbers by place.' },
            { icon: 'start', text: 'Multiply across the first row.' },
            { icon: 'write', text: 'Multiply across the second row.' },
            { icon: 'check', text: 'Add all the parts.' },
        ],
        chant: 'Split, multiply each box, add!',
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'One step per row, so every box is filled (the left-out-part error); the chant names the three moves.',
        },
        // (lead A9: the area model is too wide for a half-page panel, so the chart prints one full-width panel a row; down to LR-15's
        // 0.8 floor, two panel rows share a chart page instead of one, chart.js chartPage)
        chartMinZoom: 0.8,
        example: { match: '^Split' },
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
            // (critic cbt r1 m2: one writing shape - the count row's boxes - not the circle / hexagon mix of number_seq_fill's default)
            { key: 'counting:number_seq_fill', opts: { step: 2, dir: 'forward', shape: 'box' }, why: 'Skip counting by 2s: a count-by row with the smallest jump.' },
            { key: 'counting:number_seq_fill', opts: { step: 5, dir: 'forward', shape: 'box' }, why: 'Skip counting by 5s: the count-by row most pupils know first.' },
        ],
        mixWith: [{ key: 'counting:number_seq_fill', opts: { step: 10, dir: 'forward', shape: 'box' } }, { key: 'addition:add_facts', opts: { band: 20 } }],
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
    // ------------------------------------------------ Multiplication by size (lane lf-ops sizes, card mult-sizes, 2026-11-20)
    // Each preset is its own lesson in unit G4-Y5.B5 (Y5.B5.S1 4 x 1, S2 2 x 2 area model, S3 2 x 2, S4 3 x 2); the second
    // preset of a step (the area model of S1, of S4) is a skill: id. The Warm-up is the size below; the Prerequisite Check
    // is written when the unit is carded (LR-17).
    'Y5.B5.S1': {
        routine: 'mult-column-1digit',
        practice: { skill: 'multiplication:mult_4by1_column' },
        defaultFor: true,
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the size below and the facts) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'multiplication:mult_3by1_column', why: 'The same column steps with three digits.' },
            { key: 'multiplication:mult_facts', why: 'Each place is a times fact: 6 × 4.' },
        ],
        mixWith: [{ key: 'multiplication:mult_3by1_column' }, { key: 'addition:add_10k_regroup' }],
        note: 'WRM Y5.B5.S1 "Multiply up to a 4-digit number by a 1-digit number": the column method; its area model is skill:multiplication:area_model_4by1.',
    },
    'skill:multiplication:area_model_4by1': {
        routine: 'mult-area-1digit',
        practice: { skill: 'multiplication:area_model_4by1' },
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the size below and the facts) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'multiplication:area_model_3by1', why: 'The same area model with three parts.' },
            { key: 'multiplication:mult_by_hundred', why: 'A part is a fact times 10, 100 or 1,000: 5 × 500.' },
        ],
        mixWith: [{ key: 'multiplication:area_model_3by1' }, { key: 'addition:add_10k_regroup' }],
        steps: ['Y5.B5.S1'],
        note: 'WRM Y5.B5.S1 (the area model half; the column half is lesson Y5.B5.S1).',
    },
    'Y5.B5.S2': {
        routine: 'mult-area-2digit',
        practice: { skill: 'multiplication:area_model_2by2' },
        defaultFor: true,
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the 1-digit area model and tens times tens) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'multiplication:area_model_2by1', why: 'The area model with one row: a 2-digit number times a 1-digit number.' },
            { key: 'multiplication:mult_multiples_of_ten', why: 'A part is a fact times tens: 6 × 40.' },
        ],
        mixWith: [{ key: 'multiplication:area_model_2by1' }, { key: 'multiplication:mult_2by1_column' }],
        note: 'WRM Y5.B5.S2 "Multiply a 2-digit number by a 2-digit number (area model)".',
    },
    'Y5.B5.S3': {
        routine: 'mult-column-2digit',
        practice: { skill: 'multiplication:mult_2by2_standard' },
        defaultFor: true,
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the 1-digit column and the area model) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        warmup: [
            { key: 'multiplication:mult_2by1_column', why: 'Each row is a 2-digit number times a 1-digit number.' },
            { key: 'multiplication:area_model_2by2', why: 'The area model shows the same two rows as parts.' },
        ],
        mixWith: [{ key: 'multiplication:area_model_2by2' }, { key: 'multiplication:mult_2by1_column' }],
        note: 'WRM Y5.B5.S3 "Multiply a 2-digit number by a 2-digit number": the standard algorithm.',
    },
    'Y5.B5.S4': {
        routine: 'mult-column-2digit',
        practice: { skill: 'multiplication:mult_3by2_standard' },
        defaultFor: true,
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the size below) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        teach: {
            vocab: [
                { word: 'partial product', meaning: 'one row: the top number × one digit', picture: { kind: 'text', text: '135 × 4 = 540' } },
                { word: 'placeholder 0', meaning: 'the 0 in the ones of the tens row', picture: { kind: 'text', text: '135 × 20 = 2,700' } },
                { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '540 + 2,700 = 3,240' } },
            ],
        },
        warmup: [
            { key: 'multiplication:mult_2by2_standard', why: 'The same two rows with a 2-digit top number.' },
            { key: 'multiplication:mult_3by1_column', why: 'Each row is a 3-digit number times a 1-digit number.' },
        ],
        mixWith: [{ key: 'multiplication:mult_2by2_standard' }, { key: 'multiplication:mult_3by1_column' }],
        note: 'WRM Y5.B5.S4 "Multiply a 3-digit number by a 2-digit number": the standard algorithm; its area model is skill:multiplication:area_model_3by2.',
    },
    'skill:multiplication:area_model_3by2': {
        routine: 'mult-area-2digit',
        practice: { skill: 'multiplication:area_model_3by2' },
        prereqsPending: 'Lane lf-ops sizes: the Warm-up (the 2 x 2 area model and tens times hundreds) until the G4-Y5.B5 Prerequisite Check is written (LR-17).',
        teach: {
            vocab: [
                { word: 'part', meaning: 'one box: a place times a place', picture: { kind: 'text', text: '20 × 100 = 2,000' } },
                { word: 'row', meaning: 'a line of boxes going across', picture: { kind: 'array', rows: 1, cols: 3, mark: 'row' } },
                { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '4 × 3 = 12' } },
            ],
        },
        warmup: [
            { key: 'multiplication:area_model_2by2', why: 'The same two rows with a 2-digit top number.' },
            { key: 'multiplication:mult_multiples_of_ten', why: 'A part is a fact times tens or hundreds: 20 × 100.' },
        ],
        mixWith: [{ key: 'multiplication:area_model_2by2' }, { key: 'multiplication:mult_3by1_column' }],
        steps: ['Y5.B5.S4'],
        note: 'WRM Y5.B5.S4 (the area model half; the standard algorithm is lesson Y5.B5.S4).',
    },
});

export const NEEDS = Object.freeze([]);

export default { ROUTINES, LESSONS, NEEDS };
