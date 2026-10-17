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
const WP = (extra, payload) => Object.assign({ categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'bar', wpCues: false, wpBank: false }, partMin: 3, noPart: [10], crossTen: true, crossTenExcept: [20], cellPayload: Object.assign({ layout: 'bar' }, payload || {}), instructionKey: 'story-bar', shortQuestion: true, fresh: true, itemSpread: true }, extra || {});
// (`fresh` / `itemSpread` - the items dealt one by one (exit slip, Check Question): first a story whose turn-around no
// page dealt (V22: a turn-around only when the pool is spent), and every name and noun the generator has - critic r3 D3, m3)
// (`shortQuestion`: the question in its short form - "How many books now?", "How many books in all?" -
// so every sentence of a story fits ONE line of its cell, three lines a story: AX-3, SF-50; critic r2 D4.)
// (The exit slip: full-size bar items, the story ABOVE its bar, one across a 132.5 mm half - two a half:
// a story beside the bar had a 60 mm column and split its sentences, critic r2 D4.)
const EXIT_BAR = { storyTight: true, gradeParts: true };
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
    // The two SITUATIONS the lesson teaches (RESEARCH.md scope; critic r2 D1): each is modelled in I Do
    // (the chart: put together; the board: add to), practised, and assessed on the exit slip - the
    // gate (ws-detailed-lesson E31) holds the pack to it. Each `test` is a roles/lesson.js CASE_TESTS name.
    situations: [{ id: 'put-together', test: 'wpPutTogether' }, { id: 'add-to', test: 'wpAddToAny' }],
    // (P5 has no trace and the slip no edge item: both are Independent work, ★★ - critic r2 n7)
    fade: { P5: '★★', P6: '★★' },

    // ------------------------------------------------------------------ the practice skill
    // A join story within 20 (the sum <= 20), the kit part-part-whole bar under it, all labels blank.
    // (the chart, Guided and Mixed stories all cross ten - no whole of 20 - so the pool holds enough
    // put-together stories for the chart AND Guided cell 2; the whole of 20 is the Practice page's ★★★ case)
    skill: WP({ minNum: 11, maxNum: 18, crossTenExcept: [], sectionLabel: 'Stories' }),
    // The last row of every Practice page (★★★): the edge cases - equal parts and a whole of 20
    // (RESEARCH.md §5; every other story crosses ten with parts of 3 to 9: partMin / noPart / crossTen on every story ref).
    edgeTest: 'wpEdge',
    // (`first`: the last row is dealt first, so the rows above keep LR-6 against its equal parts - critic r2 D2)
    practiceSheets: [{ skill: WP({ minNum: 11, maxNum: 20, edgeTest: 'wpEdge', tries: 600 }), edgeLast: { per: 6, cols: 2, wants: ['wpEqual', 'wpWhole20'], first: true } }],
    // The lesson's own placeholder names: the story's unit word and its parts.
    vars: (q, b) => {
        const p = (q && q.cell && q.cell.payload) || {};
        const st = (p.steps || [])[0] || {};
        const whole = st.ans !== undefined ? st.ans : b.ans;
        // (`slip`: the count slip past 10 - one less than the whole)
        // (`question`: the story's own question sentence, as printed - a script never retypes it, critic r2 D1)
        const lines = Array.isArray(p.lines) ? p.lines : [];
        return { unit: p.unit || '', parts: st.a !== undefined ? `${st.a} + ${st.b}` : '', whole, slip: Number.isFinite(Number(whole)) ? Number(whole) - 1 : '', question: lines.length ? lines[lines.length - 1] : '' };
    },
    checkQuestion: { want: 'wpBridgeBigFirst', correct: 'D' },
    practicePages: 1,
    // Mixed: EARLIER skills only (V22 §9.5): number bonds and facts within 20.
    mixed: { skills: [
        // (no + 0 and no 1 + 1: both numbers 2 or more)
        // (within 10: the stories hold the sums past 10, so the facts never take a story's fact - critic r3 D1)
        { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10 }, sectionLabel: 'Add facts', minOperand: 2 },
        { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 10 }, sectionLabel: 'Take-away facts', minOperand: 2 },
    // (`leadDrop`: the stories hold at least half the page - a partner's only shelf may go, V22 §9.5, critic r2 D3)
    ], leadDrop: true },

    lessonData: {
        skills: [],
        concepts: [
            { id: 'parts', text: 'The two story numbers are the parts.' },
            { id: 'whole', text: 'The whole goes on top. Add the parts.' },
        ],
        vocab: [
            { word: 'part', meaning: 'one piece of the whole', picture: { kind: 'bar', whole: 14, a: 5, b: 9, mark: 'parts' } },
            { word: 'whole', meaning: 'all the parts together', picture: { kind: 'bar', whole: 14, a: 5, b: 9, mark: 'whole' } },
            { word: 'bar', meaning: 'boxes that show the story', picture: { kind: 'bar', whole: 14, a: 5, b: 9 } },
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
        // (Guided: two crossing-ten stories, one of each situation the I Do modelled - an add-to story with
        // the small part first, then a put-together story)
        guidedWants: ['wpBridgeSmallFirstAT', 'wpBridgePT'],
        practiceShape: [6, 2],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The step pupils break is step 2 (the whole in a part box); the chant names where each number goes.',
        },
        // The provider's own steps say "story"; bigSecond / bigFirst read the two operands.
        // (the chart: a crossing-ten PUT TOGETHER story such as 6 and 7, RESEARCH §E - pinned, critic r2 D1; the
        // second example an ADD TO story, modelled on the board in I Do)
        example: { match: 'story', test: 'wpBridgePT' },
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
        // (both parts 2 or more: "4 and 1" can be answered by "one more", with no part-whole idea - critic r2 n5)
        { atom: 2, ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer', orientation: 'horizontal' }, minOperand: 3, partMin: 3 },
            lesson: { id: 'Y1 B2 S2', title: 'Part-whole model' } },
        { atom: 3, items: 4, ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20, notation: ['stacked'] }, minNum: 11, maxNum: 16, noPart: [10] },
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
        ref: { categoryId: 'addition', skillId: 'add_wp_20', opts: { band: 20, pictures: false, support: 'none', wpCues: false, wpBank: false }, minNum: 11, maxNum: 19, partMin: 3, noPart: [10], crossTen: true, shortQuestion: true, fresh: true, itemSpread: true },
        want: 'wpBridgeSmallFirst',
        // The dealt story itself (its own words and numbers); the bar is OFF - the pupil draws it in the Workspace.
        answerLine: 'The answer: __ {wp.unit}.',
        // (no blank: the story line and the equation already take the whole - critic r2 n3)
        say: 'I add the parts to find the whole.',
        // The key's Workspace shows the bar to draw (schematic, its numbers in the key ink).
        keyBar: true,
        // The pupil writes the sign (a printed + would give step 3 away).
        signSlot: true,
    },

    // ------------------------------------------------------------------ P6 Exit slip
    exit: [
        // (two a half, full size: the story above its bar, so each sentence keeps its line - critic r2 D4. Both
        // situations are assessed: a. put together, b. add to.)
        { case: 'put together, big part first, a whole of 14 or more', ref: WP({ minNum: 14, maxNum: 19 }, EXIT_BAR), want: ['wpBridgeHigh', 'wpBridgeBigFirst', 'wpPutTogether', 'wpClean'], detects: 'Copies a story number as the answer; count slip past 10.' },
        { case: 'add to, small part first (Critical Atom)', ref: WP({ minNum: 11, maxNum: 19 }, EXIT_BAR), want: ['wpBridgeSmallFirst', 'wpAddToAny', 'wpClean'], detects: 'The whole written in a part box.' },
    ],
    exitCols: 1,
    exitInstruction: 'Read the story. Fill in the bar. Solve.',
    // The Say reads slip item b (the Critical Atom's case): its own unit word, one blank.
    exitSay: 'b. The answer is __ {say.unit}.',
    exitSayItem: 1,

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'composing', skillId: 'number_bonds', opts: { band: 10, unknown: 'answer' }, partMin: 3 }, ask: 'Write the whole: the bond on the board.' },
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
        { word: 'part', gloss: 'one piece of the whole', diagram: { kind: 'bar', whole: 14, a: 5, b: 9, mark: 'parts' } },
        { word: 'whole', gloss: 'all the parts together', diagram: { kind: 'bar', whole: 14, a: 5, b: 9, mark: 'whole' } },
        { word: 'bar', gloss: 'boxes that show the story', diagram: { kind: 'bar', whole: 14, a: 5, b: 9 } },
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
        // (each "Looks like" is the form of the place it names: the Check Question's own option - critic r2 n4)
        { name: 'Whole in a part box', step: 2, looks: '{cq.A}', fix: 'Chant. Touch the top box.', option: 'A', misconception: 'bar-whole-in-part', caught: 'exit b' },
        { name: 'Story number as answer', step: 4, looks: '{cq.B}', fix: '“Is it in the story?”', option: 'B', misconception: 'bar-part-on-top', caught: 'exit a' },
        { name: 'Wrong sign', step: 3, looks: '{cq.C}', fix: '“Whole missing? Add.”', option: 'C', misconception: 'wrong-operation' },
        { name: 'Count slip past 10', step: 3, looks: '{exit.0.slip} for {exit.0.parts}', fix: 'Count on from the big part.', option: '', caught: 'Exit a' },
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
                { ask: '{chart.question}', note: 'Step 4. Expected: [[{chart.whole}]] {chart.unit}.' },
                { say: 'Now an add-to story. Gets more: a part. Now: the whole.', note: 'Write on the board: {chart2.text} Parts [[{chart2.parts}]]; whole [[{chart2.whole}]].' },
                // (the chart's third example, on the board: equal parts - the ★★★ row's case, modelled - critic r3 m4)
                { say: 'Equal parts? Still add the parts.', note: 'Write on the board: {chart3.text} Parts [[{chart3.parts}]]; whole [[{chart3.whole}]].' },
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
                // ({p4.steps}: read from whether Practice 1 prints its Steps band - critic r3 D2)
                { do: 'Pupils do Practice 1. {p4.steps}' },
                { do: 'Visit ELL and SPED pupils first, within 60 seconds.' },
                { ask: 'Point to the parts. Point to the whole.', note: 'Praise: “You put the parts below. That is step 2.”' },
                { do: 'Early finishers: Mixed 1, the stories and the facts. Or send it home.', note: 'Mixed 1 answers: T6.' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { say: 'No bar this time. Draw the bar. Write the sign.', note: 'Any order of the parts, the whole on top. Expected: [[{wp.eq}]] {wp.unit}.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 5, page: 'P6',
            rows: [
                { say: 'Parts below. Whole on top. Add the parts.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by the boxes ticked.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]].' },
                { ask: 'Can you solve a story with a bar? Thumbs.' },
            ] },
    ],
    transitionsMin: 4,
    // (P3 holds Guided cells only: the Independent work is Practice 1)
    p3Score: 'Guided: not scored',
    // T2b: this lesson's own slots and routing ids
    slotRows: [{ shape: 'box', use: 'a bar box: a part (lower row) or the whole (top)' }, { shape: 'line', use: 'P5: the answer on the story line' }],
    routeNote: 'K CC 5 Count to 20 · Y1 B2 S2 Part-whole model · G1 OA 6 Add within 20: the lessons P0 routes back to (T6).',

    // ------------------------------------------------------------------ T6
    accepted: [
        'The two parts in either order in the lower boxes.',
        'The equation with the two parts in either order.',
        'The label word is printed: never marked. On P5, any two-part bar, the whole on top.',
        'The answer box and the top box hold the same number. A blank part box with the right whole: ask for the parts.',
        'P5 equation: the two parts in either order, + in the circle, then the whole after =.',
        'Equal parts (★★★): the two part boxes hold the same number.',
        'Exit slip: sort by the boxes ticked; “one more day” pupils join the cube group next lesson.',
    ],
    wrongAnswers: [
        // (exit a is put together - "in all"; exit b is add to - "now": critic r2 n8)
        { wrote: '{exit.1.wrong.barwholeinpart} (b)', mistake: 'Whole in a part box', next: 'The chant; touch the top box.' },
        { wrote: '{exit.0.wrong.barpartontop} (a)', mistake: 'Story number as answer', next: '“Is it in the story? Then it is a part.”' },
        { wrote: '{exit.0.slip} (a)', mistake: 'Count slip past 10', next: 'Start at the big part; count on the small part.' },
        { wrote: '{exit.1.slip} (b)', mistake: 'Count slip past 10', next: 'Count on from the big part with fingers.' },
        { wrote: '{exit.0.wrong.barwholeinpart} (a)', mistake: 'Whole in a part box', next: 'Point: the whole goes on top.' },
        { wrote: '{exit.1.wrong.wrongoperation} (b)', mistake: 'Wrong sign', next: '“Now” asks for the whole: point at the top box.' },
        { wrote: '{exit.1.wrong.barpartontop} (b)', mistake: 'Story number as answer', next: 'Count both cube trains together.' },
        { wrote: '{exit.0.wrong.wrongoperation} (a)', mistake: 'Wrong sign', next: '“In all” asks for the whole. Add.' },
    ],
};
