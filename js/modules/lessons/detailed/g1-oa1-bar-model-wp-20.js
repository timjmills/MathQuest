// js/modules/lessons/detailed/g1-oa1-bar-model-wp-20.js
// DETAILED LESSON 2 (owner list 2026-10-16): Grade 1, "Solve one-step word problems within 20
// using bar models" - CCSS 1.OA.A.1, EE M.EE.1.OA.1 (the code standards.js holds; the owner list
// names M.EE.1.OA.1.a and .b, which ee-math.json does not split out - .a is met by the bar as a
// drawing of the story, .b only by the turn-around check). Content follows
// design/lesson-planner/lessons/g1-oa1-bar-model-wp-20/RESEARCH.md: scope = the WHOLE unknown
// only (put together and add to, which add_wp_20 alternates), the kit bar on (support: 'bar'),
// pictures off, no key-word bolding. See the format in ./index.js. Pure data (no DOM, no state).
// Every number a script speaks is a {placeholder} filled from the DEALT items, never typed here.

const NS = (categoryId, skillId, opts, extra) => Object.assign({ categoryId, skillId, opts }, extra || {});
const WP = (extra, payload) => Object.assign({ categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'bar', wpCues: false, wpBank: false }, partMin: 2, noPart: [10], cellPayload: Object.assign({ layout: 'bar' }, payload || {}), instructionKey: 'story-bar' }, extra || {});
// (The exit slip: full-size bar items, the story beside the bar, one across a 132.5 mm half.)
const EXIT_BAR = { beside: true, barW: 44 };
// (`cellPayload.layout: 'bar'`: the word-work cell's compact form - story, bar, answer box with the
// label printed; no sign row, column boxes or unit bank: the bar is the working.)

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
    skill: WP({ minNum: 11, maxNum: 20 }),
    // The last row of every Practice page (★★★): the edge cases - equal parts and a whole of 20
    // (RESEARCH.md; no part of 1 or 10 anywhere: partMin / noPart on every story ref).
    edgeTest: 'wpEdge',
    practiceSheets: [{ edgeLast: { per: 6, cols: 2, wants: ['wpEqual', 'wpWhole20'] } }],
    // The lesson's own placeholder names: the story's unit word and its parts.
    vars: (q, b) => {
        const p = (q && q.cell && q.cell.payload) || {};
        const st = (p.steps || [])[0] || {};
        const whole = st.ans !== undefined ? st.ans : b.ans;
        // (`slip`: the count slip past 10 - one less than the whole)
        return { unit: p.unit || '', parts: st.a !== undefined ? `${st.a} + ${st.b}` : '', whole, slip: Number.isFinite(Number(whole)) ? Number(whole) - 1 : '' };
    },
    checkQuestion: { want: 'wpNineFour', correct: 'D' },
    practicePages: 1,
    // Mixed: EARLIER skills only (V22 §9.5): number bonds and facts within 20.
    mixed: { skills: [
        { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 } },
        { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 10 } },
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
            { icon: 'check', text: 'Write the whole in the answer box.' },
        ],
        chant: 'Parts below. Whole on top. Add the parts.',
        // The chart's four panels fill the bar one step at a time (roles/lesson.js barState).
        chartSteps: ['{a} and {b} are the parts.', 'Write {a} and {b} in the part boxes.', 'The whole is missing: {a} + {b} = {ans}.', 'Write {ans}. Read: {ans} {unit}.'],
        guidedRows: 2,
        guidedStack: 2,
        // (Guided: two crossing-ten stories, the small part first then the big part first)
        guidedWants: ['wpBridgeSmallFirst', 'wpBridgeBigFirst'],
        practiceShape: [6, 2],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The step pupils break is step 2 (the whole in a part box); the chant names where each number goes.',
        },
        // The provider's own steps say "story"; bigSecond / bigFirst read the two operands.
        // (the chart: a crossing-ten pair such as 6 and 7, RESEARCH §E; the second example an ADD TO story, modelled on the board in I Do)
        example: { match: 'story', test: 'wpBridge' },
        second: { test: 'wpAddTo', label: 'Gets more? That is a part.' },
        third: { test: 'wpEqual', label: 'Equal parts? Still add the parts.' },
        mixWith: [
            { key: 'composing:number_bonds', opts: { band: 10, unknown: 'answer' } },
            { key: 'addition:add_facts', opts: { band: 20 } },
        ],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, ref: { categoryId: 'counting', skillId: 'count_objects', opts: { band: 20, objects: 'frame' }, minNum: 17, maxNum: 20 },
            lesson: { id: 'K CC 5', title: 'Count to 20' } },
        { atom: 2, ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer', orientation: 'horizontal' } },
            lesson: { id: 'Y1 B2 S2', title: 'Part-whole model' } },
        { atom: 3, items: 4, ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20, notation: ['stacked'] }, minNum: 11, maxNum: 16 },
            lesson: { id: 'G1 OA 6', title: 'Add within 20' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    numberSense: {
        // Five bank types (V22 §9.2), one a row, the same order in A and B; B the harder numbers.
        // (A number bond is too tall for a P1 row - it is on P0.)
        A: { items: [NS('placevalue', 'more_less_10', { step: 1, dir: 'more', band: 20 }), NS('placevalue', 'compare', { band: 99, closeness: 'far' }), NS('placevalue', 'unit_form', { band: 99 }, { maxNum: 50 }),
            NS('placevalue', 'more_less_10', { step: 10, dir: 'more', band: 100 }, { maxNum: 60 }), NS('placevalue', 'more_less_10', { step: 1, dir: 'less', band: 20 })] },
        B: { items: [NS('placevalue', 'more_less_10', { step: 1, dir: 'more', band: 100 }, { minNum: 30 }), NS('placevalue', 'compare', { band: 99, closeness: 'close' }), NS('placevalue', 'unit_form', { band: 99 }, { minNum: 50 }),
            NS('placevalue', 'more_less_10', { step: 10, dir: 'more', band: 100 }, { minNum: 61 }), NS('placevalue', 'more_less_10', { step: 1, dir: 'less', band: 100 }, { minNum: 30 })] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // The same skill with the bar OFF: the pupil draws the bar (the fade).
    wordProblem: {
        ref: { categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'none', wpCues: false, wpBank: false }, minNum: 11, maxNum: 19, partMin: 2, noPart: [10] },
        want: 'wpBridgeSmallFirst',
        // The dealt story itself (its own words and numbers); the bar is OFF - the pupil draws it in the Workspace.
        answerLine: 'The answer: __ {wp.unit}.',
        say: 'The answer is __ {wp.unit}.',
        // The key's Workspace shows the bar to draw (schematic, its numbers in the key ink).
        keyBar: true,
        // The pupil writes the sign (a printed + would give step 3 away).
        signSlot: true,
    },

    // ------------------------------------------------------------------ P6 Exit slip
    exit: [
        // (three, not four: a full-size bar item is 36 mm tall, so a half holds three one across - the capacity rule)
        { case: 'big part first, crossing ten', ref: WP({ minNum: 11, maxNum: 19 }, EXIT_BAR), want: 'wpBridgeBigFirst', detects: 'Copies a story number as the answer; subtracts.' },
        { case: 'small part first (Critical Atom)', ref: WP({ minNum: 11, maxNum: 19 }, EXIT_BAR), want: 'wpBridgeSmallFirst', detects: 'The whole written in a part box.' },
        { case: 'a whole of 14 or more, crossing ten', ref: WP({ minNum: 14, maxNum: 19 }, EXIT_BAR), want: 'wpBridgeHigh', detects: 'Count slip past 10: one less.' },
    ],
    exitCols: 1,
    exitInstruction: 'Read the story. Fill in the bar. Solve.',
    // The Say reads slip item b (the Critical Atom's case): its own unit word, one blank.
    exitSay: 'b. The answer is __ {say.unit}.',
    exitSayItem: 1,

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer' } }, ask: 'Write the whole: the bond on the board.' },
        { ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20, notation: ['across'] }, minNum: 11, maxNum: 19 }, ask: 'Solve the fact on the board.' },
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
        { type: 'Fact', prereq: true, skill: 'Count a set: the last number is how many', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Parts and whole: two parts make a whole', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Add within 20: count on past 10', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Category', prereq: true, skill: 'Missing whole: then add', notes: 'Checked again at step 3.' },
        { type: 'Category', skill: 'Story numbers are parts', notes: 'Point at each number.' },
        { type: 'Conceptual', critical: true, skill: 'Bar: whole on top, parts below', notes: 'Cubes on the mat first.' },
        { type: 'Category', skill: '“In all” and “now” ask for the whole', notes: 'Point at the top box.' },
        { type: 'Comparative', skill: 'Same parts, same whole', notes: 'Swap the cube trains (EE .b).' },
    ],
    routine: [
        { step: 'Find the two parts.', tag: 'New', check: 'Guided cell 1' },
        { step: 'Write the parts in the bar.', tag: 'New', critical: true, check: 'Check Question; exit slip b' },
        { step: 'The whole is missing. Add.', tag: 'Pre-requisite', check: 'Prerequisite Check e to h' },
        { step: 'Write the whole in the answer box.', tag: 'Pre-requisite', check: 'Practice 1 a to f' },
    ],
    howToTeach: [
        'Cubes first: two trains of cubes on the bar mat, one under each part box.',
        'Push the trains together under the top box, then draw the bar.',
        'Write the parts before solving: the bar is filled from the bottom up.',
        'Do not bold or hunt key words: point at the box the question asks for.',
    ],
    mistakes: [
        { name: 'Whole in a part box', step: 2, looks: '{exit.1.wrong.barwholeinpart}', fix: 'Chant. Touch the top box.', option: 'A', misconception: 'bar-whole-in-part' },
        { name: 'Story number as answer', step: 4, looks: '{exit.0.wrong.barpartontop}', fix: '“Is it in the story?”', option: 'B', misconception: 'bar-part-on-top' },
        { name: 'Wrong sign', step: 3, looks: '{exit.2.wrong.wrongoperation}', fix: '“Whole missing? Add.”', option: 'C', misconception: 'wrong-operation' },
        { name: 'Count slip past 10', step: 3, looks: '{exit.2.slip} for {exit.2.parts}', fix: 'Count on from the big part.', option: '', caught: 'Exit c' },
    ],

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 5, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Read each question aloud. Wait 30 seconds.', note: 'Expected: [[{p0.list}]]. Routing is on T6.' },
            ] },
        { n: 2, name: 'Number sense', min: 5, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page. Band A first.' },
                { say: 'Point. Say the number. Then write it.' },
                { do: 'Early finishers go on to band B. Check together.', note: 'Band A: [[{ns.A.0.ans}]] · [[{ns.A.1.ans}]] · [[{ns.A.2.ans}]] · [[{ns.A.3.ans}]] · [[{ns.A.4.ans}]].' },
            ] },
        { n: 3, name: 'Spaced retrieval', min: 3, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Board: {ret.0.text} Expected: [[{ret.0.ans}]].' },
                { ask: '{ret.1.ask}', note: 'Board: {ret.1.text} Expected: [[{ret.1.ans}]].' },
                { do: 'Wrong on a board? Count on from the big number with fingers.' },
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
                { say: 'Find the two parts.', note: 'Step 1. Point at each number; lay a cube train for each.' },
                { say: 'Parts below.', note: 'Step 2: write each part in a lower box.' },
                { say: 'The whole is missing. Add.', note: 'Step 3. Push the cubes together under the top box. Count on.' },
                { say: 'Wrong. {chart.whole} is the whole. The whole goes on top.', note: 'First model it wrong: write {chart.whole} in a lower box. Then move it.' },
                { ask: 'How many {chart.unit} in all?', note: 'Step 4. Expected: [[{chart.whole}]] {chart.unit}.' },
                { do: 'Now an add-to story. Write on the board: {chart2.text}' },
                { say: '“Gets more” is a part. “Now” asks for the whole.', note: 'Parts [[{chart2.parts}]]; whole [[{chart2.whole}]].' },
                { ask: 'Swap the cube trains. Same whole?', note: 'Expected: yes, the bar is the same length.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: touch the top box and ask “Is that a part?”' }],
            rows: [
                { say: 'Cell 1: the circles show the two parts.', note: 'Parts: [[{we.0.parts}]]. A part that “gets more” is a part too.' },
                { ask: 'Which box is the whole?', note: 'Pupils point at the top box. Expected: [[{we.0.whole}]] {we.0.unit}.' },
                { do: 'Pairs do cell 2: A talks, B points. Check every sheet.', note: 'Expected: [[{we.1.parts}]], whole [[{we.1.whole}]] {we.1.unit}.' },
                { say: 'Parts below. Whole on top. Add the parts.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Read the story: {cq.text}' },
                { do: 'Draw four bars on the board. A: {cq.A}. B: {cq.B}. C: {cq.C}. D: {cq.D}.' },
                { ask: 'Which bar is right? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}.' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Redo one story on the bar mat with cubes, then two more.', fewer: 'Stop. Cubes again with two stories. Write each part under its train.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 10, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'The last row (★★★): equal parts and a whole of 20. Walk there first.' }],
            rows: [
                { do: 'Pupils do Practice 1. The Steps are at the top of the page.' },
                { do: 'Visit ELL and SPED pupils first, within 60 seconds.' },
                { ask: 'Point to the parts. Point to the whole.', note: 'Praise: “You put the parts below. That is step 2.”' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { say: 'No bar this time. Draw the bar. Write the sign.', note: 'Any order of the parts, the whole on top. Expected: [[{wp.eq}]] {wp.unit}.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 5, page: 'P6',
            rows: [
                { say: 'Parts below. Whole on top. Add the parts.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by the boxes ticked.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]].' },
                { ask: 'Can you solve a story with a bar? Thumbs.' },
            ] },
    ],
    transitionsMin: 4,
    // T2b: this lesson's own slots and routing ids
    slotRows: [{ shape: 'box', use: 'a bar box: a part (lower row) or the whole (top)' }, { shape: 'line', use: 'P5: the answer on the story line' }],
    routeNote: 'K CC 5 Count to 20 · Y1 B2 S2 Part-whole model · G1 OA 6 Add within 20: the lessons P0 routes back to (T6).',

    // ------------------------------------------------------------------ T6
    accepted: [
        'The two parts in either order in the lower boxes.',
        'The equation in either order (6 + 7 or 7 + 6).',
        'The label word is printed: never marked. On P5, any two-part bar, the whole on top.',
        'The answer box and the top box hold the same number. A blank part box with the right whole: ask for the parts.',
        'P5 equation: the two parts in either order, then the whole after =.',
        'Exit slip: sort by the boxes ticked; “one more day” pupils join the cube group next lesson.',
    ],
    wrongAnswers: [
        { wrote: '{exit.1.wrong.barwholeinpart} (b)', mistake: 'Whole in a part box', next: 'The chant; touch the top box.' },
        { wrote: '{exit.0.wrong.barpartontop} (a)', mistake: 'Story number as answer', next: '“Is it in the story? Then it is a part.”' },
        { wrote: '{exit.2.slip} (c)', mistake: 'Count slip past 10', next: 'Count on from the big part with fingers.' },
        { wrote: '{exit.2.wrong.barwholeinpart} (c)', mistake: 'Whole in a part box', next: 'Point: the whole goes on top.' },
        { wrote: '{exit.1.wrong.wrongoperation} (b)', mistake: 'Wrong sign', next: '“In all”: point at the top box.' },
        { wrote: '{exit.2.wrong.barpartontop} (c)', mistake: 'Story number as answer', next: 'Count both cube trains together.' },
        { wrote: '{exit.2.wrong.wrongoperation} (c)', mistake: 'Wrong sign', next: '“Is the whole missing? Add.”' },
    ],
};
