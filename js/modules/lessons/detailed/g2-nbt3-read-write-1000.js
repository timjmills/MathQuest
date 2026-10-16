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
const WORDS = (way, extra) => Object.assign({ categoryId: 'composing', skillId: 'number_word_form', opts: { wordform: [way], band: 1000, zeroPlace: 'some' }, minNum: 101, maxNum: 1000 }, extra || {});

export default {
    id: 'g2-nbt3-read-write-1000',
    title: 'I Can read and write numbers to 1,000',
    grade: '2',
    level: 2,
    strand: 'Place Value',
    ccss: ['2.NBT.A.3'],
    ee: ['M.EE.2.NBT.3'],
    cra: 'Pictorial → Abstract',
    flowNote: 'Chunk 1: numeral to expanded form. Chunk 2: words and expanded form back to the numeral.',

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
    practiceSheets: [{}, { skill: WORDS('to_number'), shape: [10, 2] }],
    // Mixed: the lesson skill with its other forms - expanded form back to the numeral, and a number
    // written in words (the writing direction, harder: on the Mixed page only).
    mixed: { skills: [PV('combine'), WORDS('to_words'), PV('unit_form')] },

    // The lesson's own placeholder names (index.js): a 3-digit number's parts.
    vars: (q, b) => {
        const n = Number(b.n);
        if (!Number.isFinite(n) || b.n === '') return {};
        const h = Math.floor(n / 100) * 100, t = Math.floor((n % 100) / 10) * 10, o = n % 10;
        return { h: h / 100, t: t / 10, o, hv: h, tv: t, ov: o, parts: `${h} + ${t} + ${o}`, say: `${h} plus ${t} plus ${o}`, tens: Math.floor(n / 10), eqParts: [h, t, o], eqOp: '+' };
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
        { atom: 1, items: 4, ref: { categoryId: 'composing', skillId: 'number_word_form', opts: { wordform: ['to_number'], band: 100, zeroPlace: 'some' }, minNum: 21, maxNum: 99 },
            lesson: { id: 'G2 NBT 3a', title: 'Write numbers to 100 in words' } },
        { atom: 2, items: 2, ref: PV('unit_form'), lesson: { id: 'G2 NBT 1', title: 'Hundreds, tens and ones' } },
        { atom: 3, items: 2, ref: PV('value'), lesson: { id: 'G2 NBT 1b', title: 'The value of a digit' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense (Q4)
    numberSense: {
        A: { ref: PV('combine'), instruction: 'Write the number.', wants: ['', '', 'pvZeroTens', '', 'pvZeroOnes'] },
        // B: the same type, harder - the parts in any order (V22 §9.2: the same types in A and B).
        B: { ref: PV('combine', { order: 'scrambled' }), instruction: 'Write the number.', wants: ['', '', 'pvZeroTens', '', 'pvZeroOnes'] },
    },

    // ------------------------------------------------------------------ P5 Word problem (Q5)
    // Our own words (Q6). The numbers come from a dealt `combine` item (hundreds + ones, a 0 tens).
    wordProblem: {
        ref: PV('combine'),
        want: 'pvZeroTens',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['Sam has {wp.h} bags of 100 beads.', 'Sam has {wp.o} more beads.', 'How many beads does Sam have?'],
        answerLine: 'Sam has __ beads.',
        say: 'Sam has __ beads.',
    },

    // ------------------------------------------------------------------ P6 Exit slip (Q8)
    // Four items, one per case the pack teaches, from the number's NAME (two lines each, so the
    // cells fill the half): the Critical Atom's case (a missing tens word) is c.
    exit: [
        { case: 'no 0 place', ref: WORDS('to_number'), want: 'pvNoZero', detects: 'Parts side by side (300407).' },
        { case: 'a 0 in the ones', ref: WORDS('to_number'), want: 'pvZeroOnes', detects: 'Drops the 0: three hundred ninety = 39.' },
        { case: 'no tens word (Critical Atom)', ref: WORDS('to_number'), want: 'pvZeroTens', detects: 'Drops the 0: six hundred five = 65.' },
        { case: 'a teen ending', ref: WORDS('to_number'), want: 'pvTeen', detects: 'Teen or ty swap: five hundred thirteen = 530.' },
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
    materials: ['Base-ten blocks (flats, rods, cubes)', 'Mini whiteboards and pens', 'H T O place chart on the board', 'Number word cards: hundred, tens, teens', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'digit', gloss: 'one of 0 to 9', diagram: { kind: 'digit', text: '7' } },
        { word: 'place', gloss: 'hundreds, tens or ones', diagram: { kind: 'pv', digits: '347' } },
        { word: 'expanded form', gloss: 'the number split by place', diagram: { kind: 'text', text: '300 + 40 + 7' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Number words: twenty to ninety-nine, and the teens', notes: 'Read eleven to nineteen and the tens words; forty has no u. Prerequisite Check a.' },
        { type: 'Conceptual', prereq: true, skill: 'Hundreds, tens and ones: 3 digits are 3 places', notes: 'From 2.NBT.A.1. Prerequisite Check b.' },
        { type: 'Conceptual', prereq: true, skill: 'Value of a digit: the 4 in 347 is worth 40', notes: 'From 2.NBT.A.1. Prerequisite Check c.' },
        { type: 'Category', skill: 'Word parts: the word before “hundred” is the hundreds digit', notes: 'The rest is a 2-digit number: “three hundred | forty-seven”.' },
        { type: 'Conceptual', critical: true, skill: 'Zero holds a place: 305 is 300 + 0 + 5', notes: 'The Critical Atom. A missing tens word means 0 tens.' },
        { type: 'Comparative', skill: 'Teen or ty: thirteen is 13, thirty is 30', notes: 'Two hundred thirteen is 213, not 230. Stress the end of the word.' },
        { type: 'Conceptual', skill: 'Expanded form: each digit is worth digit times place', notes: 'The 3 in 347 is worth 300, not 3.' },
        { type: 'Fact', skill: 'Written form: no “and” in a written number', notes: 'Accept “and” when spoken; model the written form.' },
    ],
    routine: [
        { step: 'Write the hundreds part: the hundreds digit and two zeros.', tag: 'Pre-requisite', check: 'Hundreds digit on the H T O chart' },
        { step: 'Write the tens part: the tens digit and one zero.', tag: 'New', check: '“What is the 4 worth?”' },
        { step: 'A 0 place: write 0 for its part.', tag: 'New', critical: true, check: 'Is every box filled?' },
        { step: 'Write the ones part, then read it with plus.', tag: 'New', check: 'Read it back: does it say the number?' },
        { step: 'Words to numeral: one digit for each place.', tag: 'New', check: '3 boxes, 3 digits' },
    ],
    howToTeach: [
        'Draw the H T O chart first, every time: three boxes, so three digits.',
        'Cover part of a number word with your hand and read it in two parts.',
        'Teach numeral to expanded form first: it has the lowest writing load.',
        'Point to each digit and ask what it is worth before writing its part.',
    ],
    // `misconception`: the provider's name for the wrong answer (sheet/providers/pv.js); `option`: the
    // Check Question letter it takes (the options themselves are the provider's wrong answers).
    mistakes: [
        { name: 'Digits, not values', step: 2, looks: '305 = 3 + 0 + 5', fix: 'Ask “What is the 3 worth?” on the chart.', option: 'A', misconception: 'M-V6' },
        { name: 'Gives the 0 its place', step: 3, looks: '305 = 300 + 10 + 5', fix: 'No tens: the tens part is 0, not 10.', option: 'B', misconception: 'M-V5' },
        { name: 'One place too big', step: 1, looks: '305 = 3000 + 0 + 50', fix: 'Count the zeros: a hundreds part has two.', option: 'C', misconception: 'M-V14' },
        { name: 'Drops the 0', step: 3, looks: '35 for three hundred five', fix: 'Fill the H T O chart: 3 boxes, 3 digits.', option: '' },
        { name: 'Teen or ty swap', step: 5, looks: '230 for two hundred thirteen', fix: 'Say the end of the word: teen is ones.', option: '' },
    ],
    checkQuestion: { want: 'pvZeroTens', correct: 'D' },

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    // Sections 1-10 (the 60-minute budget, V22 Lesson Time Budget). Placeholders: index.js.
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 7, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Walk and mark as pupils finish.', note: 'Expected: a. [[{pre.0.ans}]], b. [[{pre.1.ans}]], c. [[{pre.2.ans}]]. Routing is on the last page (T6).' },
            ] },
        { n: 2, name: 'Number sense', min: 5, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page.' },
                { say: 'Band A: put the parts together. Write the number.' },
                { ask: 'What is {ns.A.0.parts}?', note: 'Expected: [[{ns.A.0.n}]] ({ns.A.0.words}).' },
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
        { n: 5, name: 'I Do: the anchor chart', min: 9, page: 'P2', boxes: [{ kind: 'watch', title: 'The 0 place', text: 'Say “0 tens” out loud every time a tens word is missing.' }],
            rows: [
                { do: 'Put the anchor chart up. Point to {chart.n}.' },
                { say: '{chart.n}. The {chart.h} is in the hundreds place.' },
                { say: 'The {chart.h} is worth {chart.hv}.', note: 'Write [[{chart.hv}]] in the first box (step 1).' },
                { ask: 'What is the {chart.t} worth?', note: 'Expected: [[{chart.tv}]] (step 2).' },
                { ask: 'What is the {chart.o} worth?', note: 'Expected: [[{chart.ov}]] (step 3).' },
                { say: '{chart.n} is {chart.say}.', note: 'Step 4: read it with plus. Pupils repeat twice.' },
                { say: 'In words: {chart.words}.', note: 'The Say line of the chart: the same number, the third way.' },
                { do: 'Point to the other example: {chart2.n}.' },
                { say: 'No tens. The tens part is 0.', note: 'Expected: [[{chart2.parts}]].' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: point to the empty box and ask “What goes here?”' }],
            rows: [
                { do: 'Pupils open the lesson sheet at Guided Practice.' },
                { say: 'Look at {we.0.n}. Step 1 is done in grey.' },
                { ask: 'Hundreds part? Tens part? Ones part?', note: 'Expected ★: [[{we.0.parts}]].' },
                { do: 'Pupils do {we.1.n} on their own. Check every sheet.', note: 'Expected ★: [[{we.1.parts}]].' },
                { do: 'Pupils do {we.2.n}. Hands up when done.', note: 'Expected ★: [[{we.2.parts}]].' },
                { say: 'Every place gets a part.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write on the board: {cq.n}. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which is {cq.n} in expanded form? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach the 0 place with blocks (0 rods), then two more.', fewer: 'Stop. Build {chart2.n} with blocks. Write each part as a group.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'The last row (★★★) has the 0 places. Walk there first.' }],
            rows: [
                { do: 'Pupils finish Independent Practice (★★), then Practice 1.' },
                { say: 'Use the Steps at the top of the page.' },
                { do: 'Practice 2: read each name. Write the number.', note: 'The words form (★★). Look for 35 for three hundred five.' },
                { do: 'Circulate. Stop at every 0 place.', note: 'Look for 3 + 4 + 7 (digits, not values).' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many hundreds? How many ones?', note: 'Expected: [[{wp.h}]] hundreds, [[{wp.o}]] ones.' },
                { say: 'Sam has {wp.n} beads.', note: 'Expected: [[{wp.eq}]].' },
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
