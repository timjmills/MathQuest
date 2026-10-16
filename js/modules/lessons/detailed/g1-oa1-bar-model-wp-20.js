// js/modules/lessons/detailed/g1-oa1-bar-model-wp-20.js
// DETAILED LESSON 2 (owner list 2026-10-16): Grade 1, "Solve one-step word problems within 20
// using bar models" - CCSS 1.OA.A.1, EE M.EE.1.OA.1 (the code standards.js holds; the owner list
// names M.EE.1.OA.1.a and .b, which ee-math.json does not split out - .a is met by the bar as a
// drawing of the story, .b only by the turn-around check). Content follows
// design/lesson-planner/lessons/g1-oa1-bar-model-wp-20/RESEARCH.md: scope = the WHOLE unknown
// only (put together and add to, which add_wp_20 alternates), the kit bar on (support: 'bar'),
// pictures off, no key-word bolding. See the format in ./index.js. Pure data (no DOM, no state).
// Every number a script speaks is a {placeholder} filled from the DEALT items, never typed here.

const WP = (extra) => Object.assign({ categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'bar', wpCues: false, wpBank: false } }, extra || {});

export default {
    id: 'g1-oa1-bar-model-wp-20',
    title: 'I Can solve stories with a bar',
    grade: '1',
    level: 1,
    strand: 'Operations',
    ccss: ['1.OA.A.1'],
    ee: ['M.EE.1.OA.1'],
    cra: 'Concrete → Pictorial',
    flowNote: 'One chunk: the two story numbers are the parts; the whole is missing, so add.',

    // ------------------------------------------------------------------ the practice skill
    // A join story within 20 (the sum <= 20), the kit part-part-whole bar under it, all labels blank.
    skill: WP({ maxNum: 20 }),
    // The last row of every Practice page (★★★): the small part first (the Critical Atom's case).
    edgeTest: 'bigSecond',
    // The lesson's own placeholder names: the story's unit word and its parts.
    vars: (q, b) => {
        const p = (q && q.cell && q.cell.payload) || {};
        const st = (p.steps || [])[0] || {};
        return { unit: p.unit || '', parts: st.a !== undefined ? `${st.a} + ${st.b}` : '', whole: st.ans !== undefined ? st.ans : b.ans };
    },
    checkQuestion: { want: 'bigSecond', correct: 'D' },
    practicePages: 1,
    // Mixed: EARLIER skills only (V22 §9.5): number bonds and facts within 20.
    mixed: { skills: [
        { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer' } },
        { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 } },
    ] },

    lessonData: {
        skills: [],
        concepts: [
            { id: 'parts', text: 'The two story numbers are the parts.' },
            { id: 'whole', text: 'The whole goes on top. Add the parts.' },
        ],
        vocab: [
            { word: 'part', meaning: 'one piece of the whole', picture: { kind: 'bar', whole: 13, a: 6, b: 7, mark: 'parts' } },
            { word: 'whole', meaning: 'all the parts together', picture: { kind: 'bar', whole: 13, a: 6, b: 7, mark: 'whole' } },
            { word: 'bar', meaning: 'boxes that show the story', picture: { kind: 'bar', whole: 13, a: 6, b: 7 } },
        ],
        steps: [
            { icon: 'look', text: 'Find the two parts.' },
            { icon: 'write', text: 'Write the parts in the bar.' },
            { icon: 'decide', text: 'The whole is missing. Add.' },
            { icon: 'check', text: 'Write the whole and the label.' },
        ],
        chant: 'Parts below. Whole on top. Add the parts.',
        chartWide: true,
        // The chart's four panels fill the bar one step at a time (roles/lesson.js barState).
        chartSteps: ['{a} and {b} are the parts.', 'Write {a} and {b} in the part boxes.', 'The whole is missing: {a} + {b} = {ans}.', 'Write {ans} {unit}.'],
        guidedRows: 2,
        practiceShape: [4, 2],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The step pupils break is step 2 (the whole in a part box); the chant names where each number goes.',
        },
        // The provider's own steps say "story"; bigSecond / bigFirst read the two operands.
        example: { match: 'story', test: 'bigSecond' },
        second: { test: 'bigFirst', label: 'Big part first? The whole is the same.' },
        third: { test: 'bigSecond', label: 'Small part first? Still add the parts.' },
        mixWith: [
            { key: 'composing:number_bonds', opts: { band: 10, unknown: 'answer' } },
            { key: 'addition:add_facts', opts: { band: 20 } },
        ],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, ref: { categoryId: 'counting', skillId: 'count_objects', opts: { band: 20, objects: 'frame' }, minNum: 11, maxNum: 20 },
            lesson: { id: 'K CC 5', title: 'Count to 20' } },
        { atom: 2, ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer' } },
            lesson: { id: 'Y1 B2 S2', title: 'Part-whole model' } },
        { atom: 3, ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 }, minNum: 11, maxNum: 20 },
            lesson: { id: 'G1 OA 6', title: 'Add within 20' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    numberSense: {
        A: { ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'mixed' } }, instruction: 'Write the missing number.' },
        B: { ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 }, minNum: 11, maxNum: 20 }, instruction: 'Add.' },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // The same skill with the bar OFF: the pupil draws the bar (the fade).
    wordProblem: {
        ref: { categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'none', wpCues: false, wpBank: false }, maxNum: 20 },
        want: 'bigSecond',
        // The dealt story itself (its own words and numbers); the bar is OFF - the pupil draws it in the Workspace.
        answerLine: 'The answer: __ {wp.unit}.',
        say: 'The answer is __ {wp.unit}.',
    },

    // ------------------------------------------------------------------ P6 Exit slip
    exit: [
        { case: 'put together, big part first', ref: WP({ maxNum: 20 }), want: 'bigFirst', detects: 'Copies a story number as the answer.' },
        { case: 'small part first (Critical Atom)', ref: WP({ maxNum: 20 }), want: 'bigSecond', detects: 'The whole written in a part box.' },
        { case: 'add to: gets more', ref: WP({ maxNum: 20 }), want: 'bigFirst', detects: 'Subtracts: the wrong sign.' },
        { case: 'a whole past 10', ref: WP({ minNum: 11, maxNum: 20 }), want: 'bigSecond', detects: 'Count slip past 10: one less.' },
    ],
    exitInstruction: 'Circle the sign. Write the numbers in the boxes. Solve.',
    exitSay: 'The answer is __ __.',

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer' } }, ask: 'Write the whole: the bond on the board.' },
        { ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 }, minNum: 11, maxNum: 19 }, ask: 'Solve the fact on the board.' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Parts below, whole on top', text: 'Say it each time you point at the bar.' },
        { kind: 'language', title: 'Read it two times', text: 'ELL pupils need the first read for the words, the second for the numbers.' },
        { kind: 'watch', title: 'Whole in a part box', text: 'The mistake to stop today: the sum written under the bar. Touch the top box: “whole”.' },
    ],
    materials: ['Printed bar mat (boxes 20 mm high), one per pair', 'Linking cubes, 20 per pair', 'Mini whiteboards and pens', 'Anchor chart', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'part', gloss: 'one piece of the whole', diagram: { kind: 'bar', whole: 13, a: 6, b: 7, mark: 'parts' } },
        { word: 'whole', gloss: 'all the parts together', diagram: { kind: 'bar', whole: 13, a: 6, b: 7, mark: 'whole' } },
        { word: 'bar', gloss: 'boxes that show the story', diagram: { kind: 'bar', whole: 13, a: 6, b: 7 } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Count a set: the last number said tells how many', notes: 'Prerequisite Check a.' },
        { type: 'Conceptual', prereq: true, skill: 'Parts and whole: two parts make a whole', notes: 'Prerequisite Check b (number bond, the whole blank).' },
        { type: 'Fact', prereq: true, skill: 'Add within 20: count on past 10', notes: 'Prerequisite Check c.' },
        { type: 'Category', prereq: true, skill: 'Missing whole: when the whole is missing, add', notes: 'From number bonds. Checked again at step 3.' },
        { type: 'Category', skill: 'Story numbers are parts: “has … has …” gives two parts', notes: 'Show a story with one number too: no bar yet.' },
        { type: 'Conceptual', critical: true, skill: 'Bar = part-whole: the top box is the whole, the lower boxes the parts', notes: 'The Critical Atom. Cubes on the mat first.' },
        { type: 'Category', skill: 'In all / now: the question asks for the whole', notes: '“In all” and “now” both point at the top box.' },
        { type: 'Comparative', skill: 'Same parts, same whole: 6 and 7 or 7 and 6', notes: 'The bar has the same length (EE .b). The other examples.' },
    ],
    routine: [
        { step: 'Find the two parts.', tag: 'New', check: 'Guided cell 1' },
        { step: 'Write the parts in the bar.', tag: 'New', critical: true, check: 'Check Question; exit slip b' },
        { step: 'The whole is missing. Add.', tag: 'Pre-requisite', check: 'Prerequisite Check b' },
        { step: 'Write the whole and the label.', tag: 'Pre-requisite', check: 'Independent Practice a to d' },
    ],
    howToTeach: [
        'Cubes first: two trains of cubes on the bar mat, one under each part box.',
        'Push the trains together under the top box, then draw the bar.',
        'Write the parts before solving: the bar is filled from the bottom up.',
        'Do not bold or hunt key words: point at the box the question asks for.',
    ],
    mistakes: [
        { name: 'Whole in a part box', step: 2, looks: 'The sum written in a lower box', fix: 'Chant. Touch the top box: “whole”.', option: 'A', misconception: 'bar-whole-in-part' },
        { name: 'Story number as answer', step: 4, looks: '“in all”: writes a part', fix: 'Point at the top box. Is it in the story?', option: 'B', misconception: 'bar-part-on-top' },
        { name: 'Wrong sign', step: 3, looks: 'The difference of the parts', fix: '“Is the whole missing? Add.”', option: 'C', misconception: 'wrong-operation' },
        { name: 'Count slip past 10', step: 3, looks: 'One less than the whole', fix: 'Count on from the big part with fingers.', option: '' },
    ],

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 5, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Read each question aloud. Wait 30 seconds.', note: 'Expected: a. [[{pre.0.ans}]], b. [[{pre.1.ans}]], c. [[{pre.2.ans}]]. Routing is on T6.' },
            ] },
        { n: 2, name: 'Number sense', min: 5, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page. Band A first.' },
                { say: 'Point. Say the number. Then write it.' },
                { do: 'Early finishers go on to band B. Check together.' },
            ] },
        { n: 3, name: 'Spaced retrieval', min: 3, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.n}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.n}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 2, page: '',
            rows: [
                { say: 'Last time we added numbers to 20.' },
                { say: 'Today the numbers live in a story.' },
                { say: 'I can solve stories with a bar. Say it.' },
            ] },
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'Whole in a part box', text: 'Model it wrong once, say “Wrong”, fix it. Never print it.' }],
            rows: [
                { do: 'Put the anchor chart up. Read the story two times.' },
                { say: 'Find the two parts.', note: 'Step 1. Point at each story number.' },
                { do: 'Lay a cube train for each part under the bar mat.' },
                { say: 'Parts below.', note: 'Step 2: write each part in a lower box.' },
                { ask: 'Is the whole missing?', note: 'Expected: yes. Step 3.' },
                { say: 'The whole is missing. Add.', note: 'Push the cubes together under the top box. Count on.' },
                { say: 'The whole goes on top.', note: 'Step 4: write the whole and the label word.' },
                { do: 'Point to the other examples: the big part first, then the small part first.' },
                { ask: 'Same parts, other order. Same whole?', note: 'Expected: yes, the bar is the same length.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: touch the top box and ask “Is that a part?”' }],
            rows: [
                { do: 'Pupils open the lesson sheet at Guided Practice.' },
                { say: 'Cell 1: the grey is a helper. Trace it.' },
                { ask: 'Which box is the whole?', note: 'Pupils point at the top box.' },
                { do: 'Pairs do cell 2: A talks, B points. Check every sheet.' },
                { say: 'Parts below. Whole on top. Add the parts.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Read the story: {cq.text}' },
                { do: 'Draw four bars on the board. A: {cq.A}. B: {cq.B}. C: {cq.C}. D: {cq.D}.' },
                { ask: 'Which bar is right? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}.' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Redo one story on the bar mat with cubes, then two more.', fewer: 'Stop. Cubes again with two stories. Write each part under its train.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 10, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'The last row (★★★) has the small part first. Walk there first.' }],
            rows: [
                { do: 'Pupils finish Independent Practice (★★), then Practice 1.' },
                { say: 'Use the Steps at the top of the page.' },
                { do: 'Visit ELL and SPED pupils first, within 60 seconds.' },
                { ask: 'Point to the parts. Point to the whole.', note: 'Praise: “You put the parts below. That is step 2.”' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { say: 'No bar this time. Draw the bar.', note: 'Any two-part bar with the right labels is right.' },
                { ask: 'Which box is the whole?', note: 'Expected: the top box. Either order of the parts.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 5, page: 'P6',
            rows: [
                { say: 'Parts below. Whole on top. Add the parts.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by the boxes ticked.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]] · d. [[{exit.3.ans}]].' },
                { ask: 'Can you solve a story with a bar? Thumbs.' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'The two parts in either order in the lower boxes.',
        'The equation in either order (6 + 7 or 7 + 6).',
        'The label word is the story noun. On P5, any two-part bar with the right labels.',
    ],
    wrongAnswers: [
        { wrote: 'The sum in a lower box', mistake: 'Whole in a part box', next: 'The chant; touch the top box.' },
        { wrote: 'A story number as the answer', mistake: 'Story number as answer', next: '“Is it in the story? Then it is a part.”' },
        { wrote: 'The difference of the parts', mistake: 'Wrong sign', next: '“Is the whole missing? Add.”' },
        { wrote: 'One less than the key', mistake: 'Count slip past 10', next: 'Count on from the big part with fingers.' },
    ],
};
