// js/modules/lessons/detailed/g2-nbt3-read-write-1000.js
// DETAILED LESSON 1 (owner list 2026-10-16): Grade 2, "Read and write numbers to 1,000 in words,
// numerals and expanded form" - CCSS 2.NBT.A.3, EE M.EE.2.NBT.3. The content follows
// design/lesson-planner/lessons/g2-nbt3-read-write-1000/RESEARCH.md. All three forms are practised in
// print: the anchor chart shows one number as a numeral, in expanded form and (its Say line) in words;
// the lesson sheet and Practice 1 write numerals in expanded form (placevalue:expand); Practice 2 writes
// numbers from their names (composing:number_word_form, words to numeral); the Mixed page writes a
// number in words; P1, the word problem and the Check Question read expanded form back. See the format
// in ./index.js. Pure data (no DOM, no state). Every number a script speaks is a {placeholder} filled
// from the DEALT items through the kit's readers and `vars` below, never typed here.

const PV = (skillId, opts, extra) => Object.assign({ categoryId: 'placevalue', skillId, opts: Object.assign({ band: 999, zeroPlace: 'some' }, opts || {}), minNum: 101, maxNum: 999 }, extra || {});
const WORDS = (way, extra, opts) => Object.assign({ categoryId: 'composing', skillId: 'number_word_form', opts: Object.assign({ wordform: [way], band: 1000, zeroPlace: 'some' }, way === 'to_number' ? { answerSlot: 'hto' } : {}, opts || {}), minNum: 101, maxNum: 1000 }, extra || {});
// P1's bank types (V22 §9.2, critic D11): 2-digit prior knowledge, never today's new skill.
const NS = (skillId, opts, extra) => Object.assign({ categoryId: 'placevalue', skillId, opts: Object.assign({ band: 99 }, opts || {}), minNum: 10, maxNum: 99 }, extra || {});

export default {
    id: 'g2-nbt3-read-write-1000',
    title: 'I Can read and write numbers to 1,000',
    grade: '2',
    level: 2,
    strand: 'Place Value',
    ccss: ['2.NBT.A.3'],
    ee: ['M.EE.2.NBT.3'],
    cra: 'Pictorial → Abstract',
    flowNote: 'Chunk 1 (5a, 6a): steps 1–4, numeral to expanded form. Chunk 2 (5b, 6b): step 5, the number name to the numeral in H T O boxes.',
    // V22 Chunked Flow: two I Do / We Do cycles. Chunk a is this file's own skill and chart data;
    // chunk b has its own anchor chart (P2b) and lesson sheet (P3b), and its Steps head Practice 2.
    chunks: [
        { id: 'a', name: 'Numeral to expanded form' },
        {
            // (to 999: 1,000 is Practice 2's ★★★ case)
            id: 'b', name: 'Number name to numeral', skill: WORDS('to_number', { maxNum: 999 }),
            lessonData: {
                skills: [],
                concepts: [{ id: 'zero', text: 'No tens word? Write 0 tens.' }],
                vocab: [],
                steps: [
                    { icon: 'look', text: 'Read the hundreds word.' },
                    { icon: 'write', text: 'Read the rest. Write the tens and ones.' },
                    { icon: 'check', text: 'Read the number back.' },
                ],
                chant: 'Three boxes, three digits.',
                guidedRows: 2,
                format: { kind: 'numbered steps with icons + a chant', why: 'Three boxes make the missing tens word visible: the T box cannot stay empty.' },
                example: { test: 'pvNoZero' },
                second: { test: 'pvZeroTens', label: 'No tens word? Write 0 tens.' },
                third: { test: 'pvZeroOnes', label: 'No ones word? Write 0 ones.' },
                mixWith: [],
            },
        },
    ],

    // ------------------------------------------------------------------ the practice skill
    // Expanded form of a 3-digit number, one box per place (a 0 place keeps its box: 400 + 0 + 6).
    skill: PV('expand'),
    // The pool (V22 §9.5, data): every number the pack may deal, 21 to 1,000 (P0 reads 2-digit words).
    pool: { kind: 'range', lo: 21, hi: 1000 },
    // The last row of every Practice page (★★★): a 0 place, a teen ending or 1,000 (roles/lesson.js).
    edgeTest: 'pvEdge',
    practicePages: 2,
    // Each Practice page its own sheet (V22 §9.5): 1 = numeral to expanded form (the chart's steps on
    // top), 2 = number name to numeral (the words form).
    // (its ★★★ last row: 1,000 and one more edge case - critic D2)
    practiceSheets: [{}, { skill: WORDS('to_number'), shape: [8, 2], chunk: 'b', edgeLast: { per: 8, cols: 2, wants: ['pvThousand', ''] } }],
    // Mixed: the lesson skill with its other forms - expanded form back to the numeral, and a number
    // written in words (the writing direction, harder: on the Mixed page only).
    // (no Steps band on the mixed page, and the words band named for what it asks - critic D17, D18)
    mixed: { skills: [PV('combine'), WORDS('to_words', { sectionLabel: 'Words' }), PV('unit_form')], strip: false },

    // The lesson's own placeholder names (index.js): a 3-digit number's parts.
    vars: (q, b) => {
        const n = Number(b.n);
        if (!Number.isFinite(n) || b.n === '') return {};
        const h = Math.floor(n / 100) * 100, t = Math.floor((n % 100) / 10) * 10, o = n % 10;
        return { h: h / 100, t: t / 10, o, hv: h, hto: `${h / 100} | ${t / 10} | ${o}`, tv: t, ov: o, parts: `${h} + ${t} + ${o}`, say: `${h} plus ${t} plus ${o}`, tens: Math.floor(n / 10), eqParts: [h, t, o], eqOp: '+' };
    },

    // The anchor chart / lesson sheet data, in the prereqs.js LESSONS shape (roles/lesson.js).
    lessonData: {
        // No Warm-up on the lesson sheet: the Prerequisite Check (P0) replaces it (V22 §9.4, Q3).
        skills: [],
        concepts: [
            { id: 'worth', text: 'Write what each digit is worth.' },
            { id: 'zero', text: 'A 0 place still gets its part: 0.' },
        ],
        vocab: [
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'glyph', text: '7' } },
            { word: 'place', meaning: 'hundreds, tens or ones', picture: { kind: 'text', text: 'H  T  O' } },
            { word: 'expanded form', meaning: 'the number split by place', picture: { kind: 'text', text: '300 + 40 + 7' } },
        ],
        steps: [
            { icon: 'start', text: 'Write the hundreds.' },
            { icon: 'write', text: 'Write the tens.' },
            { icon: 'write', text: 'Write the ones.' },
            { icon: 'check', text: 'Read it with plus.' },
        ],
        chant: 'Every place gets a part.',
        chartWide: true,
        // The Say line reads the example's name: the chart shows numeral, expanded form and words.
        sayWords: true,
        guidedRows: 3,
        tailLast: true,
        practiceShape: [9, 1],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The one step pupils skip is the 0 place; a five-word chant said at step 2 cues it.',
        },
        example: { match: 'hundreds place', test: 'pvNoZero' },
        second: { test: 'pvZeroTens', label: 'No tens? The tens part is 0.' },
        third: { test: 'pvZeroOnes', label: 'No ones? The ones part is 0.' },
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    // One question per Pre-requisite atom on T2, most basic first; each routes to ONE earlier lesson.
    prerequisites: [
        // Routes (critic D22): the site has no lesson for these yet, so each names the CCSS code and a
        // short title (V22 Appendix H); `routeNote` says so on T2b.
        { atom: 1, items: 4, ref: { categoryId: 'composing', skillId: 'number_word_form', opts: { wordform: ['to_number'], band: 100, zeroPlace: 'none' }, minNum: 21, maxNum: 99 },
            lesson: { id: '1.NBT.A.1', title: 'Read and write numbers to 120' } },
        { atom: 2, items: 3, ref: PV('unit_form'), lesson: { id: '2.NBT.A.1', title: 'Hundreds, tens and ones' } },
        { atom: 3, items: 2, ref: PV('value'), lesson: { id: '2.NBT.A.1', title: 'The value of a digit' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense (Q4)
    // Five bank types on 2-digit numbers (Grade 1-2 prior knowledge), one a row, the same order in A
    // and B; each row prints its item's own library instruction. B: the same types, harder numbers.
    numberSense: {
        A: { items: [NS('more_less_10', { step: 10, dir: 'more', band: 100 }), NS('compare', { closeness: 'far' }), NS('unit_form'), NS('more_less_10', { step: 1, dir: 'less', band: 100 }), NS('more_less_10', { step: 10, dir: 'less', band: 100 })] },
        B: { items: [NS('more_less_10', { step: 10, dir: 'more', band: 100 }, { minNum: 85 }), NS('compare', { closeness: 'close' }), NS('unit_form'), NS('more_less_10', { step: 1, dir: 'less', band: 100 }, { minNum: 85 }), NS('more_less_10', { step: 10, dir: 'less', band: 100 }, { minNum: 85 })] },
    },

    // ------------------------------------------------------------------ P5 Word problem (Q5)
    // Our own words (Q6). The numbers come from a dealt `combine` item (hundreds + ones, a 0 tens).
    wordProblem: {
        ref: PV('combine'),
        want: 'pvZeroTens',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['Sam has {wp.h} bags of 100 beads.', 'Sam has {wp.o} more beads.', 'How many beads does Sam have?'],
        answerLine: 'Sam has __ beads.',
        // (the number in words too - critic D19)
        wordsLine: 'Write the number in words: __',
        say: 'Sam has __ beads.',
    },

    // ------------------------------------------------------------------ P6 Exit slip (Q8)
    // Four items, both chunks (critic D14): a-b the number's NAME to the numeral (chunk 2), c-d
    // expanded form back to the numeral (chunk 1: step 4 reads it with plus; an expanded-form row is
    // too wide for a 132.5 mm half at L). The Critical Atom's case (a missing tens word) is b, a 0
    // part d.
    exit: [
        { case: 'name, no 0 place', ref: WORDS('to_number'), want: 'pvNoZero', instr: 'Write the number.', detects: 'Parts side by side (300407).' },
        { case: 'name, no tens word (Critical Atom)', ref: WORDS('to_number'), want: 'pvZeroTens', instr: 'Write the number.', detects: 'Drops the 0: six hundred five = 65.' },
        { case: 'expanded form to the numeral, no 0 place', ref: PV('combine'), want: 'pvNoZero', instr: 'Write the number.', detects: 'Parts side by side: 500 + 30 + 9 = 500309.' },
        { case: 'expanded form to the numeral, a 0 part', ref: PV('combine'), want: 'pvZeroTens', instr: 'Write the number.', detects: 'Drops the 0 part: 700 + 0 + 5 = 75.' },
    ],
    exitInstruction: 'Write the number.',
    // The Say line reads a FRESH number (dealt apart from the four items).
    exitSay: '{say.words} is __.',

    // ------------------------------------------------------------------ retrieval (MWB, T3 §3)
    retrieval: [
        { ref: { categoryId: 'composing', skillId: 'number_word_form', opts: { wordform: ['to_number'], band: 100 }, minNum: 21, maxNum: 99 }, ask: 'Write the number for {ret.0.words}.' },
        { ref: { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 99 }, minNum: 21, maxNum: 99 }, ask: 'How many tens in {ret.1.n}?' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Keep the chart up', text: 'Keep the H T O place chart on the board all lesson.' },
        { kind: 'language', title: 'No "and" in writing', text: 'Pupils who say “three hundred and five” are right to say it. We write “three hundred five”.' },
        { kind: 'watch', title: 'The 0 place', text: 'The mistake to stop today is 35 for 305: a 0 place still gets its part.' },
    ],
    // Pupil-page answers whose case a teacher should see first (T5 Watch, critic D13): the case
    // tests of roles/lesson.js, named.
    // T2b's extra answer-slot shapes this pack prints (critic D9).
    slotRows: [{ shape: 'hto', use: 'a number from its name, a digit a box' }, { shape: 'longline', use: 'a number in words' }],
    caseNames: { pvThousand: 'one thousand', pvZeroTens: '0 tens', pvZeroOnes: '0 ones', pvTeen: 'a teen' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['Base-ten blocks (flats, rods, cubes)', 'Mini whiteboards and pens', 'H T O place chart on the board', 'Number word cards: hundred, tens, teens', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'digit', gloss: 'one of 0 to 9', diagram: { kind: 'digit', text: '7' } },
        { word: 'place', gloss: 'hundreds, tens or ones', diagram: { kind: 'pv', digits: '347' } },
        { word: 'expanded form', gloss: 'the number split by place', diagram: { kind: 'text', text: '300 + 40 + 7' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Number words: twenty to ninety-nine, and the teens', notes: 'Read eleven to nineteen and the tens words; forty has no u. Prerequisite Check {pre.0.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Hundreds, tens and ones: 3 digits are 3 places', notes: 'From 2.NBT.A.1. Prerequisite Check {pre.1.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Value of a digit: the 4 in 347 is worth 40', notes: 'From 2.NBT.A.1. Prerequisite Check {pre.2.letters}.' },
        { type: 'Category', skill: 'Word parts: the word before “hundred” is the hundreds digit', notes: 'The rest is a 2-digit number: “three hundred | forty-seven”.' },
        { type: 'Conceptual', critical: true, skill: 'Zero holds a place: 305 is 300 + 0 + 5', notes: 'A missing tens word means 0 tens.' },
        { type: 'Comparative', skill: 'Teen or ty: thirteen is 13, thirty is 30', notes: 'Two hundred thirteen is 213, not 230. Stress the end of the word.' },
        { type: 'Conceptual', skill: 'Expanded form: each digit is worth digit times place', notes: 'The 3 in 347 is worth 300, not 3.' },
        { type: 'Fact', skill: 'Written form: no “and” in a written number', notes: 'Accept “and” when spoken; model the written form.' },
    ],
    // In teaching order (critic D6): chunk 1 is steps 1-4, chunk 2 is step 5.
    routine: [
        { step: 'Write the hundreds part: the hundreds digit and two zeros.', tag: 'New', check: 'Hundreds digit on the H T O chart' },
        { step: 'Write the tens part: the tens digit and one zero.', tag: 'New', check: '“What is the 4 worth?”' },
        { step: 'A 0 place: write 0 for its part.', tag: 'New', critical: true, check: 'Is every box filled?' },
        { step: 'Write the ones part, then read it with plus.', tag: 'New', check: 'Read it back: does it say the number?' },
        { step: 'Name to numeral: the hundreds word in H, the rest in T and O.', tag: 'New', check: '3 boxes, 3 digits' },
    ],
    howToTeach: [
        'Draw the H T O chart first, every time: three boxes, so three digits.',
        'Cover part of a number word with your hand and read it in two parts.',
        'Chunk 1 first, numeral to expanded form: it has the lowest writing load. Chunk 2: the name to the numeral.',
        'Point to each digit and ask what it is worth before writing its part.',
    ],
    board: 'H T O boxes for {b.chart2.words}: {b.chart2.hto}.',
    // `misconception`: the provider's name for the wrong answer (sheet/providers/pv.js); `option`: the
    // Check Question letter it takes (the options themselves are the provider's wrong answers).
    mistakes: [
        { name: 'Digits, not values', step: 2, looks: '305 = 3 + 0 + 5', fix: 'Ask “What is the 3 worth?” on the chart.', option: 'A', misconception: 'M-V6' },
        { name: 'Writes 10 for an empty tens', step: 3, looks: '305 = 300 + 10 + 5', fix: 'No tens: the tens part is 0, not 10.', option: 'B', misconception: 'M-V5' },
        { name: 'One place too big', step: 1, looks: '305 = 3000 + 0 + 50', fix: 'Count the zeros: a hundreds part has two.', option: 'C', misconception: 'M-V14' },
        { name: 'Drops the 0', step: 5, looks: '35 for three hundred five', fix: 'Fill the H T O boxes: 3 boxes, 3 digits.', option: '', caught: 'exit slip b and the Practice 2 boxes' },
        { name: 'Teen or ty swap', step: 5, looks: '230 for two hundred thirteen', fix: 'Say the end of the word: teen is ones.', option: '', caught: 'Practice 2 and the Guided cells of the lesson sheet 2' },
    ],
    checkQuestion: { want: 'pvZeroTens', correct: 'D' },

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    // Sections 1-10 (the 60-minute budget, V22 Lesson Time Budget). Placeholders: index.js.
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 6, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Walk and mark as pupils finish.', note: 'Expected: [[{p0.list}]]. Routing is on the last page (T6).' },
            ] },
        { n: 2, name: 'Number sense', min: 5, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page.' },
                { say: 'Band A: read each row. Write the answer.' },
                { ask: '{ns.A.0.text}', note: 'Expected: [[{ns.A.0.ans}]]. Band B: the same five kinds, harder numbers.' },
            ] },
        { n: 3, name: 'Spaced retrieval', min: 4, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.n}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.tens}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 2, page: '',
            rows: [
                { say: 'You wrote numbers to 100. Today: numbers to 1,000.' },
                { say: 'Today we write numbers three ways.' },
            ] },
        { n: '5a', name: 'I Do 1: numeral to expanded form', min: 5, page: 'P2', boxes: [{ kind: 'watch', title: 'The 0 place', text: 'Say “0 tens” out loud every time a place is empty.' }],
            rows: [
                { do: 'Put anchor chart 1 up. Point to {chart.n}.' },
                { say: 'The {chart.h} is worth {chart.hv}.', note: 'Write [[{chart.hv}]] in the first box (step 1).' },
                { ask: 'What is the {chart.t} worth?', note: 'Expected: [[{chart.tv}]] (step 2).' },
                { ask: 'What is the {chart.o} worth?', note: 'Expected: [[{chart.ov}]] (step 3).' },
                { say: '{chart.n} is {chart.say}.', note: 'Step 4: read it with plus. Pupils repeat twice.' },
                { say: 'In words: {chart.words}.', note: 'The Say line: the same number, the third way.' },
                { say: '{chart2.n}: no tens. The tens part is 0.', note: 'Expected: [[{chart2.parts}]].' },
                { say: '{chart3.n}: no ones. The ones part is 0.', note: 'Expected: [[{chart3.parts}]].' },
            ] },
        { n: '6a', name: 'We Do 1: Guided Practice', min: 4, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: point to the empty box and ask “What goes here?”' }],
            rows: [
                { say: 'Look at {we.0.n}. Step 1 is done in grey.' },
                { ask: 'Hundreds part? Tens part? Ones part?', note: 'Expected ★: [[{we.0.parts}]].' },
                { do: 'Pupils do {we.1.n} and {we.2.n} on their own.', note: 'Expected ★: [[{we.1.parts}]] · [[{we.2.parts}]].' },
                { say: 'Every place gets a part.', note: 'The chant. Say it twice together.' },
            ] },
        { n: '5b', name: 'I Do 2: the name to the numeral', min: 5, page: 'P2b', boxes: [{ kind: 'language', title: 'Two parts', text: 'Cover the end of the name with your hand: read the hundreds word first.' }],
            rows: [
                { do: 'Put anchor chart 2 up. Point to {b.chart.words}.' },
                { ask: 'How many hundreds?', note: 'Expected: [[{b.chart.h}]] in the H box (step 1).' },
                { ask: 'Read the rest. How many tens? How many ones?', note: 'Expected: [[{b.chart.t}]] tens, [[{b.chart.o}]] ones (step 2).' },
                { say: 'Three boxes, three digits: {b.chart.n}.', note: 'Step 3: read it back.' },
                { say: '{b.chart2.Words}: no tens word. Write 0 tens.', note: 'Expected: [[{b.chart2.n}]].' },
            ] },
        { n: '6b', name: 'We Do 2: Guided Practice', min: 4, page: 'P3b', boxes: [{ kind: 'feedback', title: 'An empty box', text: 'Point to it: “Is there a tens word? Then write 0.”' }],
            rows: [
                { say: 'Read {b.we.0.words}. Step 1 is done in grey.' },
                { ask: 'H box? T box? O box?', note: 'Expected ★: [[{b.we.0.hto}]].' },
                { do: 'Pupils do {b.we.1.words} on their own.', note: 'Expected ★: [[{b.we.1.n}]].' },
                { say: 'Three boxes, three digits.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write on the board: {cq.n}. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which is {cq.n} in expanded form? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach the 0 place with blocks (0 rods), then two more.', fewer: 'Stop. Build {chart2.n} with blocks. Write each part as a group.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last rows', text: 'Walk to the last rows first: {p4.last}.' }],
            rows: [
                { do: 'Pupils finish Independent Practice on both lesson sheets, then Practice 1.' },
                { say: 'Use the Steps at the top of the page.' },
                { do: 'Practice 2: read each name. Write one digit in each box.', note: 'Look for 35 for three hundred five.' },
                { do: 'Circulate. Stop at every 0 place.', note: 'Look for 3 + 4 + 7 (digits, not values).' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many hundreds? How many ones?', note: 'Expected: [[{wp.h}]] hundreds, [[{wp.o}]] ones.' },
                { ask: 'How many beads? Say it in words.', note: 'Expected: [[{wp.eq}]]; [[{wp.words}]].' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'Every place gets a part.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Then sort the slips by the boxes ticked.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]] · d. [[{exit.3.ans}]].' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'Expanded form with a 0 part: 400 + 0 + 6 and 400 + 6 are both right; the key draws 400 + 0 + 6.',
        'Number words with or without the hyphen (forty-seven, forty seven) are right.',
        'A spoken “and” (three hundred and five) is not wrong; model the written form.',
    ],
    wrongAnswers: [
        { wrote: '35 for three hundred five', mistake: 'Drops the 0', next: 'H T O chart: 3 boxes, 3 digits.' },
        { wrote: '300407 or 3047', mistake: 'Parts side by side', next: 'Read the last two words as one number.' },
        { wrote: '230 for two hundred thirteen', mistake: 'Teen or ty swap', next: 'The Comparative atom card: teen is ones.' },
        { wrote: '3 + 4 + 7 for 347', mistake: 'Digits, not values', next: '“What is the 3 worth?” on the chart.' },
    ],
};
