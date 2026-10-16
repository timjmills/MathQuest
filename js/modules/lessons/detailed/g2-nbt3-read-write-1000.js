// js/modules/lessons/detailed/g2-nbt3-read-write-1000.js
// DETAILED LESSON 1 (owner list 2026-10-16): Grade 2, "Read and write numbers to 1,000 in words,
// numerals and expanded form" - CCSS 2.NBT.A.3, EE M.EE.2.NBT.3. The content follows
// design/lesson-planner/lessons/g2-nbt3-read-write-1000/RESEARCH.md, with one change: the anchor
// chart and the practice pages teach NUMERAL -> EXPANDED FORM (placevalue:expand), the form the
// site's kit draws and works step by step today; words -> numeral (composing:number_word_form) is
// on the Number sense page, the Mixed page and the exit slip, and expanded -> numeral
// (placevalue:combine) on the Mixed page, the word problem and the exit slip. See the format in
// ./index.js. Pure data (no DOM, no state). Every number a script speaks is a {placeholder} filled
// from the DEALT items (index.js `PLACEHOLDERS`), never typed here.

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
    skill: { categoryId: 'placevalue', skillId: 'expand', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 },
    practicePages: 2,
    // Mixed: EARLIER skills only (V22 §9.5), the lesson skill at least half the items.
    mixed: { skills: [
        { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 999 }, minNum: 101, maxNum: 999 },
        { categoryId: 'placevalue', skillId: 'value', opts: { band: 999 }, minNum: 101, maxNum: 999 },
    ] },

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
        tailLast: true,
        practiceShape: [9, 1],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The one step pupils skip is the 0 place; a five-word chant said at step 2 cues it.',
        },
        example: { match: 'hundreds place', test: 'pvNoZero' },
        second: { test: 'pvZeroTens', label: 'No tens? The tens part is 0.' },
        third: { test: 'pvZeroOnes', label: 'No ones? The ones part is 0.' },
        mixWith: [
            { key: 'composing:number_word_form', opts: { wordform: ['to_number'] } },
            { key: 'placevalue:combine', opts: { band: 999, zero: true } },
        ],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    // One question per Pre-requisite atom on T2, most basic first; each routes to ONE earlier lesson.
    prerequisites: [
        { atom: 2, ref: { categoryId: 'placevalue', skillId: 'identify', opts: { band: 999 }, minNum: 101, maxNum: 999 },
            lesson: { id: 'G2 NBT 1a', title: 'Hundreds, tens and ones' } },
        { atom: 2, ref: { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 999 }, minNum: 101, maxNum: 999 },
            lesson: { id: 'G2 NBT 1b', title: 'Unit form: hundreds, tens and ones' } },
        { atom: 2, ref: { categoryId: 'placevalue', skillId: 'value', opts: { band: 999 }, minNum: 101, maxNum: 999 },
            lesson: { id: 'G2 NBT 1c', title: 'The value of a digit' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense (Q4)
    numberSense: {
        A: { ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 }, instruction: 'Write the number.' },
        // B: the same type, harder - the parts in any order (V22 §9.2: the same types in A and B).
        B: { ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true, order: 'scrambled' }, minNum: 101, maxNum: 999 }, instruction: 'Write the number.' },
    },

    // ------------------------------------------------------------------ P5 Word problem (Q5)
    // Our own words (Q6). The numbers come from a dealt `combine` item (hundreds + ones, a 0 tens).
    wordProblem: {
        ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 },
        want: 'zeroTens',
        lines: ['Sam has {wp.h} bags of 100 beads.', 'Sam has {wp.o} more beads.', 'How many beads does Sam have?'],
        answerLine: 'Sam has __ beads.',
        say: 'Sam has __ beads.',
    },

    // ------------------------------------------------------------------ P6 Exit slip (Q8)
    // Four items, one per case the chart teaches; the Critical Atom's case (a 0 place) is c.
    // The exit slip reads expanded form back to the numeral (chunk 2): a 3-box expanded-form cell
    // at 28 pt (136 mm) is wider than a 132.5 mm half; `combine` is 105 mm.
    exit: [
        { case: 'no 0 place', ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 }, want: 'noZero', detects: 'Parts side by side (300407).' },
        { case: 'a 0 in the ones', ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 }, want: 'zeroOnes', detects: 'Drops the 0: 300 + 90 = 39.' },
        { case: 'a 0 in the tens (Critical Atom)', ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 }, want: 'zeroTens', detects: 'Drops the 0: 600 + 5 = 65.' },
        { case: 'a teen ending', ref: { categoryId: 'placevalue', skillId: 'combine', opts: { band: 999, zero: true }, minNum: 101, maxNum: 999 }, want: 'teen', detects: 'Teen or ty swap: 500 + 10 + 3 = 530.' },
    ],
    exitInstruction: 'Write the number.',
    exitSay: '{exit.0.parts} is __.',

    // ------------------------------------------------------------------ retrieval (MWB, T3 §3)
    retrieval: [
        { ref: { categoryId: 'composing', skillId: 'number_word_form', opts: { wordform: ['to_number'] }, range: 100, minNum: 21, maxNum: 99 }, ask: 'Write the number for {ret.0.words}.' },
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
        { type: 'Fact', prereq: true, skill: 'Number words: twenty to ninety-nine, and the teens', notes: 'Read eleven to nineteen and the tens words; forty has no u. Checked on mini whiteboards (Section 3).' },
        { type: 'Conceptual', prereq: true, skill: 'Hundreds, tens and ones: 3 digits are 3 places', notes: 'From 2.NBT.A.1. Checked on the Prerequisite Check, a to c.' },
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
    mistakes: [
        { name: 'Drops the 0', step: 3, looks: '305 = 30 + 5, or 35 for three hundred five', fix: 'Fill the H T O chart: 3 boxes, 3 digits.', option: 'A' },
        { name: 'Digits, not values', step: 2, looks: '305 = 3 + 0 + 5', fix: 'Ask “What is the 3 worth?” on the chart.', option: 'B' },
        { name: 'One place too big', step: 1, looks: '305 = 3000 + 0 + 50', fix: 'Count the zeros: a hundreds part has two.', option: 'C' },
        { name: 'Parts side by side', step: 5, looks: '300405 or 3045 for three hundred forty-five', fix: 'Read the last two words as one number.', option: '' },
        { name: 'Teen or ty swap', step: 5, looks: '230 for two hundred thirteen', fix: 'Say the end of the word: teen is ones.', option: '' },
    ],

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    // Sections 1-10 (the 60-minute budget, V22 Lesson Time Budget). Placeholders: index.js.
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 8, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Walk and mark as pupils finish.', note: 'Expected: a. [[{pre.0.ans}]], b. [[{pre.1.ans}]], c. [[{pre.2.ans}]]. Routing is on the last page (T6).' },
            ] },
        { n: 2, name: 'Number sense', min: 6, page: 'P1',
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
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'The 0 place', text: 'Say “0 tens” out loud every time a tens word is missing.' }],
            rows: [
                { do: 'Put the anchor chart up. Point to {chart.n}.' },
                { say: '{chart.n}. The {chart.h} is in the hundreds place.' },
                { say: 'The {chart.h} is worth {chart.hv}.', note: 'Write [[{chart.hv}]] in the first box (step 1).' },
                { ask: 'What is the {chart.t} worth?', note: 'Expected: [[{chart.tv}]] (step 2).' },
                { ask: 'What is the {chart.o} worth?', note: 'Expected: [[{chart.ov}]] (step 3).' },
                { say: '{chart.n} is {chart.say}.', note: 'Step 4: read it with plus. Pupils repeat twice.' },
                { do: 'Point to the other example: {chart2.n}.' },
                { say: 'No tens. The tens part is 0.', note: 'Expected: [[{chart2.parts}]].' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: point to the empty box and ask “What goes here?”' }],
            rows: [
                { do: 'Pupils open the lesson sheet at Guided Practice.' },
                { say: 'Look at {we.0.n}. Step 1 is done in grey.' },
                { ask: 'Hundreds part? Tens part? Ones part?', note: 'Expected ★: [[{we.0.parts}]].' },
                { do: 'Pupils do {we.1.n} on their own. Check every sheet.', note: 'Expected ★: [[{we.1.parts}]].' },
                { say: 'Every place gets a part.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write on the board: {cq.n}. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which is {cq.n} in expanded form? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach the 0 place with blocks (0 rods), then two more.', fewer: 'Stop. Build {chart2.n} with blocks. Write each part as a group.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 10, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'The last row (★★★) has the 0 places. Walk there first.' }],
            rows: [
                { do: 'Pupils finish Independent Practice (★★), then Practice 1.' },
                { say: 'Use the Steps at the top of the page.' },
                { do: 'Circulate. Stop at every 0 place.', note: 'Look for 3 + 4 + 7 (digits, not values).' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many hundreds? How many ones?', note: 'Expected: [[{wp.h}]] hundreds, [[{wp.o}]] ones.' },
                { say: 'Sam has {wp.n} beads.', note: 'Expected: [[{wp.parts} = {wp.n}]].' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'Every place gets a part.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Then sort the slips by the boxes ticked.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]] · d. [[{exit.3.ans}]].' },
            ] },
    ],
    transitionsMin: 0,

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
