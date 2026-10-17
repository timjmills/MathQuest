// js/modules/lessons/detailed/g3-oa8-two-step-wp.js
// DETAILED LESSON 7 (owner list 2026-10-16): Grade 3, "Two-step word problems with the four operations" -
// CCSS 3.OA.D.8. EE: the repo's M.EE.3.OA.7 (ee-math.json links it to 3.OA.D.8; SKILL_STANDARDS of
// algebra:multi_step_word* carry it); the owner sheet names M.EE.3.OA.8 but quotes the M.EE.3.OA.7 text
// (eeOwnerList, owner question Q1). Content follows design/lesson-planner/lessons/g3-oa8-two-step-wp/RESEARCH.md.
//
// Built for it (build list multi_step_four_ops, first part): algebra:multi_step_word(_plain) option `msOps`
// (codec key 4P: 'mult' / 'div' / 'multdiv' - a × or ÷ step that feeds a + or − step; facts within 10 × 10,
// the answer never a story number, the Step 1 answer never the answer), the kit's two-step story grammar for a
// × or ÷ first step (sheet/cells/word-work.js tellTwoStep), the provider's two-step wrong answers
// (ms-stop-step1 / ms-story-number / ms-one-op) and the case tests ms* (roles/lesson.js).
// Flow: Chunked - a) × then + or −, b) ÷ then + or −. The letter equation, the bracket order (+ first, then ÷)
// and the estimate check are follow-on lessons.
// See the format in ./index.js. Pure data (no DOM, no state). Every number a script speaks is a
// {placeholder} filled from the DEALT items.

const G = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const MS = (ops, extra) => Object.assign({ categoryId: 'algebra', skillId: 'multi_step_word_plain', opts: { msOps: ops, pictures: false, wpCues: false, wpBank: false }, fresh: true, itemSpread: true, lr6Names: true, dealTries: 2000 }, extra || {});

// 1 or 10 more / less (Y2 place value, earlier content).
const ML = (step, dir, extra) => Object.assign({ categoryId: 'placevalue', skillId: 'more_less_10', opts: { step, dir, band: 100 } }, extra || {});
// The compact form (option wpFrames): the story and one number sentence a step - the exit slip and P0.
const MSF = (ops, extra) => { const r = MS(ops, extra); r.opts = Object.assign({}, r.opts, { wpFrames: true }); return r; };
const NS = (categoryId, skillId, opts, extra) => Object.assign({ categoryId, skillId, opts }, extra || {});

export default {
    id: 'g3-oa8-two-step-wp',
    title: 'I Can solve two-step stories',
    grade: '3',
    level: 3,
    strand: 'Operations',
    ccss: ['3.OA.D.8'],
    ee: ['M.EE.3.OA.7'],
    // (the owner sheet's code; its text is M.EE.3.OA.7's - owner question Q1)
    eeOwnerList: ['M.EE.3.OA.8'],
    eeNote: 'Sheet code M.EE.3.OA.8 quotes the M.EE.3.OA.7 text; the repo tag is M.EE.3.OA.7.',
    cra: 'Pictorial → Abstract',
    flowNote: 'Chunk 1 (5a, 6a): × first. Chunk 2 (5b, 6b): ÷ first. Step 2 is always + or −.',
    followOn: [
        { title: 'Two-step stories: add first, then divide', skill: 'algebra:multi_step_word_plain', opts: {}, ccss: '3.OA.D.8', note: 'Brackets: (12 + 18) ÷ 5. Build list multi_step_four_ops.' },
        { title: 'Write the equation with a letter', skill: 'algebra:multi_step_word_plain', opts: {}, ccss: '3.OA.D.8', note: '4 × 6 − 5 = n. Build list multi_step_four_ops.' },
        { title: 'Is the answer reasonable? Round to check', skill: 'number_sense:estimate_sums_diffs', opts: {}, ccss: '3.OA.D.8' },
    ],
    // The two SITUATIONS the lesson teaches (E31): groups then a change (chunk a), a fair share then a change (chunk b).
    situations: [{ id: 'groups-then-change', test: 'msMult' }, { id: 'share-then-change', test: 'msDiv' }],
    fade: { P5: '★★', P6: '★★' },
    chunks: [
        { id: 'a', name: 'Groups first: ×, then + or −' },
        {
            id: 'b', name: 'Share first: ÷, then + or −', skill: MS('div', { allTest: 'msDiv' }),
            lessonData: {
                skills: [],
                concepts: [],
                vocab: [],
                steps: [
                    { icon: 'look', text: 'Read it. What do I find first?' },
                    { icon: 'write', text: 'Step 1: share it. Divide.' },
                    { icon: 'decide', text: 'Step 2: use my Step 1 answer.' },
                    { icon: 'check', text: 'Write the answer and the unit.' },
                ],
                chant: 'First the share. Then the change.',
                guidedRows: 2,
                chartWide: true,
                chartRow: true,
                noStripChant: true,
        tailRead: true,
                practiceShape: [2, 1],
                format: { kind: 'numbered steps with icons + a chant', why: 'The share is the Step 1 answer; the change is done to one share, not to the total.' },
                example: { match: 'story', test: 'msDivAdd' },
                second: { test: 'msDivSub', label: 'Gives away? Step 2 is −.' },
                guidedWants: ['msDivAdd', 'msDivSub'],
                mixWith: [],
            },
        },
    ],

    // ------------------------------------------------------------------ the practice skill
    // Chunk a: equal groups (×), then a change (+ or −). The two-step word-work cell: Step 1 and Step 2 blocks.
    skill: MS('mult', { allTest: 'msMult', sectionLabel: 'Stories' }),
    edgeTest: 'msEdge',
    practicePages: 2,
    practiceSheets: [
        { steps: false, skill: MS('mult', { allTest: 'msMult' }), shape: [2, 1], edgeLast: { per: 2, cols: 1, wants: ['msEdge'], first: true } },
        { steps: false, skill: MS('div', { allTest: 'msDiv' }), shape: [2, 1], edgeLast: { per: 2, cols: 1, wants: ['msEdge'], first: true } },
    ],
    vars: (q) => {
        const p = (q && q.cell && q.cell.payload) || {};
        const st = Array.isArray(p.steps) ? p.steps : [];
        const lines = Array.isArray(p.lines) ? p.lines : [];
        if (st.length !== 2) return { unit: p.unit || '', question: lines.length ? lines[lines.length - 1] : '' };
        const [s1, s2] = st;
        return {
            unit: p.unit || '', question: lines[lines.length - 1] || '', story: lines.join(' '),
            // (the story's lines, and its question in a short form - "How many beads are left?" - so each sentence keeps
            // one line of the P5 story box: AX-3)
            l0: lines[0] || '', l1: lines[1] || '', l2: lines[2] || '',
            qShort: String(lines[lines.length - 1] || '').replace(/ does (?:each friend|[A-Z][a-z]+) have (left|now)\?$/, (m, w) => (w === 'left' ? ' are left?' : ' now?')),
            g: s1.a, e: s1.b, s1: s1.ans, c: s2.bottom, whole: s2.ans,
            step1: `${s1.a} ${G[s1.op]} ${s1.b} = ${s1.ans}`, step2: `${s1.ans} ${G[s2.op]} ${s2.bottom} = ${s2.ans}`,
            op1: G[s1.op], op2: G[s2.op],
            m3: s2.op === '+' ? s1.b + s2.bottom : Math.abs(s1.b - s2.bottom),
            eqSteps: [{ parts: [s1.a, s1.b], op: G[s1.op], n: s1.ans }, { parts: [s1.ans, s2.bottom], op: G[s2.op], n: s2.ans }],
            eqParts: [s1.ans, s2.bottom], eqOp: G[s2.op], eqN: s2.ans,
        };
    },

    lessonData: {
        skills: [],
        // (no vocabulary match and no Remember line on the lesson sheet: two Guided two-step cells fill its page - WDS 12.1,
        // two a page at L; the words step / each / left are T1's cards and the I Do's, the rule is under the Steps strip)
        concepts: [],
        vocab: [],
        steps: [
            { icon: 'look', text: 'Read it. What do I find first?' },
            { icon: 'write', text: 'Step 1: the groups. Multiply.' },
            { icon: 'decide', text: 'Step 2: use my Step 1 answer.' },
            { icon: 'check', text: 'Write the answer and the unit.' },
        ],
        chant: 'First the groups. Then the change.',
        guidedRows: 2,
        chartWide: true,
        chartRow: true,
        noStripChant: true,
        tailRead: true,
        practiceShape: [2, 1],
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'The step pupils break is step 3: Step 2 done with a story number. The chant names the order of the two steps.',
        },
        example: { match: 'story', test: 'msMultSub' },
        second: { test: 'msMultAdd', label: 'Gets more? Step 2 is +.' },
        guidedWants: ['msMultSub', 'msMultAdd'],
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, items: 4, ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [3, 4, 5, 6], notation: ['stacked'], band: 100 }, allTest: 'factNoZeroOne' },
            lesson: { id: '3.OA.C.7', title: 'Multiply within 100' } },
        { atom: 2, ref: { categoryId: 'multiplication', skillId: 'mult_word_problems_plain', opts: { forms: [0], pictures: false, wpCues: false, wpBank: false, wpFrames: true }, instructionKey: 'story-steps' },
            lesson: { id: '3.OA.A.3', title: 'Equal-groups stories' } },
        { atom: 3, ref: { categoryId: 'division', skillId: 'div_word_problems_plain', opts: { forms: [0], pictures: false, wpCues: false, wpBank: false, wpFrames: true }, instructionKey: 'story-steps' },
            lesson: { id: '3.OA.A.3', title: 'Sharing stories' } },
        { atom: 4, ref: { categoryId: 'algebra', skillId: 'multi_step_word_plain', opts: { forms: [0], band: 30, pictures: false, wpCues: false, wpBank: false, wpFrames: true }, instructionKey: 'story-steps' },
            lesson: { id: 'Y2 B4 S10', title: 'Two-step problems' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    numberSense: {
        // (earlier content in one-line rows, as lessons 3a and 4: a fact cell is taller than a P1 row; the facts are T3 §3)
        A: { items: [ML(10, 'more', { minNum: 10, maxNum: 60 }), ML(10, 'less', { minNum: 20, maxNum: 60 }), NS('placevalue', 'compare', { band: 99, closeness: 'far' }),
            NS('placevalue', 'unit_form', { band: 99 }, { maxNum: 50 }), ML(1, 'more', { minNum: 10, maxNum: 50 })] },
        B: { items: [NS('placevalue', 'more_less_100', { step: 10, dir: 'more' }, { minNum: 120, maxNum: 880 }), NS('placevalue', 'more_less_100', { step: 10, dir: 'less' }, { minNum: 120, maxNum: 980 }),
            NS('placevalue', 'compare', { band: 999, closeness: 'close' }, { minNum: 100 }),
            NS('placevalue', 'unit_form', { band: 99 }, { minNum: 50 }), ML(1, 'more', { minNum: 101, maxNum: 118, opts: { step: 1, dir: 'more', band: 120 } })] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // A × first story with no step boxes: the pupil draws it and writes both steps.
    wordProblem: {
        ref: MS('mult', { allTest: 'msMult' }),
        want: ['msMultSub', 'msClean'],
        lines: ['{wp.l0}', '{wp.l1}', '{wp.l2}', '{wp.qShort}'],
        answerLine: 'The answer: __ {wp.unit}.',
        say: 'First I find the groups. Then I take away.',
        eqSteps: true,
    },

    // ------------------------------------------------------------------ P6 Exit slip
    exit: [
        { case: '× then − (Critical Atom: Step 2 uses the Step 1 answer)', ref: MSF('mult', { allTest: 'msMult', instructionKey: 'story-steps' }), want: ['msMultSub', 'msClean', 'msMid'], detects: 'Stops after Step 1, or takes away from a story number.' },
        { case: '÷ then +', ref: MSF('div', { allTest: 'msDiv', instructionKey: 'story-steps' }), want: ['msDivAdd', 'msClean'], detects: 'Adds to the total, not to one share.' },
    ],
    exitCols: 1,
    exitInstruction: 'Read the story. Write each step. Solve.',
    exitSay: 'Step 2 uses my Step 1 __.',
    exitSayAns: 'answer',
    exitSayItem: 0,

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [3, 4], notation: ['across'], band: 100 }, allTest: 'factNoZeroOne' }, ask: '{ret.0.text}' },
        { ref: { categoryId: 'division', skillId: 'div_facts', opts: { constant: [3, 4], notation: ['across'] } }, ask: '{ret.1.text}' },
        { ref: { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 100, notation: ['across'] } }, ask: '{ret.2.text}' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Two boxes, two steps', text: 'Point at the Step 1 box, then the Step 2 box, every time you read a story.' },
        { kind: 'language', title: '“Each”', text: '“Each bag has 6” means every bag has 6: equal groups. Act it out with cups.' },
        { kind: 'watch', title: 'A story number in Step 2', text: 'The mistake to stop today: Step 2 done with a story number. Draw the arrow from the Step 1 answer.' },
    ],
    materials: ['Cups and counters, 6 cups and 40 counters per pair', 'Mini whiteboards and pens', 'Anchor charts 1 and 2', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'step', gloss: 'one part of the work', diagram: { kind: 'text', text: 'Step 1 → Step 2' } },
        { word: 'each', gloss: 'every group has the same', diagram: { kind: 'text', text: '3 bags of 4' } },
        { word: 'left', gloss: 'what stays after some go', diagram: { kind: 'text', text: '6 − 2 = 4' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: '× facts to 10 × 10', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Category', prereq: true, skill: 'Equal groups: multiply', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Category', prereq: true, skill: 'Share equally: divide', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Two steps with + and −', notes: 'Prerequisite Check {pre.3.letters}.' },
        { type: 'Category', skill: '“Each” names Step 1', notes: 'The first two lines are Step 1.' },
        { type: 'Conceptual', critical: true, skill: 'Step 1 answer: a Step 2 number', notes: 'Draw the arrow into Step 2.' },
        { type: 'Comparative', skill: 'Two steps or one step', notes: 'Is the Step 1 answer the question?' },
        { type: 'Category', skill: 'Gives away: −. Gets more: +.', notes: 'The third line is Step 2.' },
    ],
    routine: [
        { step: 'Read it. What do I find first?', tag: 'New', check: 'Guided cell 1' },
        { step: 'Step 1: the groups or the share. × or ÷.', tag: 'Pre-requisite', check: 'Prerequisite Check a to c' },
        { step: 'Step 2: use my Step 1 answer.', tag: 'New', critical: true, check: 'Check Question; exit slip a' },
        { step: 'Write the answer and the unit.', tag: 'Pre-requisite', check: 'Practice 1 a to d' },
    ],
    howToTeach: [
        'Cups and counters first: the groups, then take some away or add some.',
        'Then the two step boxes: the Step 1 answer is copied into Step 2 with an arrow.',
        'Chunk 1 is × first; chunk 2 is ÷ first. Step 2 is + or − every time.',
        'Do not hunt key words: ask “What do I find first?”',
    ],
    board: 'Two boxes: Step 1 {chart.step1} → Step 2 {chart.step2}.',
    mistakes: [
        { name: 'Stops after Step 1', step: 3, looks: '{cq.A}', fix: '“Is that the question? Read the last line.”', option: 'A', misconception: 'ms-stop-step1', caught: 'exit a' },
        { name: 'Story number in Step 2', step: 3, looks: '{cq.B}', fix: 'Arrow: the Step 1 answer goes into Step 2.', option: 'B', misconception: 'ms-story-number' },
        { name: 'One sign for all', step: 2, looks: '{cq.C}', fix: '“How many steps?” Count the boxes.', option: 'C', misconception: 'ms-one-op' },
        { name: 'Story number in Step 2', step: 3, looks: '{exit.1.wrong.msstorynumber} for exit b', fix: 'One share first, then the change.', option: '', caught: 'Exit b' },
    ],
    checkQuestion: { want: ['msMultSub', 'msClean', 'msMid'], correct: 'D' },
    slotRows: [{ shape: 'box', use: 'a step box: Step 1 or Step 2' }, { shape: 'line', use: 'P5: the answer on the story line' }],
    caseNames: { msEdge: 'the Step 2 number bigger than both Step 1 numbers' },
    routeNote: '3.OA.C.7 · 3.OA.A.3 · Y2 B4 S10 Two-step problems: the lessons P0 routes back to (T6).',

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 5, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Read each story aloud. Walk and mark.', note: 'Expected: [[{p0.list}]]. Routing is on T6.' },
            ] },
        { n: 2, name: 'Number sense', min: 4, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page. Band A first.' },
                { say: 'Read each row. Write the answer.' },
                { do: 'Early finishers go on to band B.', note: 'Band A: [[{ns.A.0.ans}]] · [[{ns.A.1.ans}]] · [[{ns.A.2.ans}]] · [[{ns.A.3.ans}]] · [[{ns.A.4.ans}]].' },
            ] },
        { n: 3, name: 'Spaced retrieval', min: 3, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.ans}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.ans}]].' },
                { ask: '{ret.2.ask}', note: 'Expected: [[{ret.2.ans}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 2, page: '',
            rows: [
                { say: 'You can solve a story with one step.' },
                { say: 'Today: two steps. Step 2 uses the Step 1 answer.' },
            ] },
        { n: '5a', name: 'I Do 1: groups first', min: 6, page: 'P2', boxes: [{ kind: 'watch', title: 'Step 1 is not the answer', text: 'Stop on the Step 1 answer and ask: “Is that the question?”' }],
            rows: [
                { do: 'Put anchor chart 1 up. Read the story two times.' },
                { say: 'What do I find first? The groups.', note: 'Step 1. Show {chart.g} cups of {chart.e} counters.' },
                { say: 'Step 1: {chart.step1}.', note: 'Write it in the Step 1 box: [[{chart.s1}]].' },
                { say: 'Is {chart.s1} the question? No. Step 2.', note: 'Read the last line again.' },
                { say: 'Step 2 uses my Step 1 answer: {chart.step2}.', note: 'Draw the arrow from [[{chart.s1}]] into Step 2.' },
                { ask: '{chart.question}', note: 'Expected: [[{chart.whole}]] {chart.unit}.' },
                { say: 'Gets more? Step 2 is +.', note: 'Write on the board: {chart2.story} Step 1 [[{chart2.step1}]], Step 2 [[{chart2.step2}]].' },
            ] },
        { n: '6a', name: 'We Do 1: Guided Practice', min: 5, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: point to the Step 1 box. “Where does this number go next?”' }],
            rows: [
                { say: 'Cell 1: the Step 1 sign is done in grey.', note: 'Step 1 [[{we.0.step1}]]; Step 2 [[{we.0.step2}]].' },
                { ask: 'Which number goes into Step 2 first?', note: 'Expected: the Step 1 answer, [[{we.0.s1}]].' },
                { do: 'Pairs do cell 2: A reads, B points to each box.', note: 'Expected: [[{we.1.step1}]], then [[{we.1.step2}]] {we.1.unit}.' },
                { ask: 'Cell 2: which sign is Step 2? How do you know?', note: 'Gets more: [[+]]. Gives away: [[−]]. The third line tells.' },
                { do: 'A pupil who stops after Step 1: point to the last line.', note: 'Read the question aloud together. Is the Step 1 answer the question?' },
                { ask: 'Where did your Step 1 answer go?', note: 'Pupils point: the top row of Step 2.' },
                { say: 'First the groups. Then the change.', note: 'The chant. Say it twice together.' },
            ] },
        { n: '5b', name: 'I Do 2: share first', min: 5, page: 'P2b', boxes: [{ kind: 'language', title: '“Shares equally”', text: 'Act it out: deal the counters one at a time into the cups.' }],
            rows: [
                { do: 'Put anchor chart 2 up. Read the story two times.' },
                { say: 'What do I find first? One share.', note: 'Deal {b.chart.g} counters into {b.chart.e} cups.' },
                { say: 'Step 1: {b.chart.step1}.', note: 'Each friend has [[{b.chart.s1}]].' },
                { say: 'Step 2 uses my Step 1 answer: {b.chart.step2}.', note: 'The change is to ONE share, not to {b.chart.g}.' },
                { ask: '{b.chart.question}', note: 'Expected: [[{b.chart.whole}]] {b.chart.unit}.' },
            ] },
        { n: '6b', name: 'We Do 2: Guided Practice', min: 5, page: 'P3b', boxes: [{ kind: 'feedback', title: 'Change to the total', text: 'A pupil who changes the total: “Is that one friend’s share?”' }],
            rows: [
                { say: 'Cell 1: share first.', note: 'Step 1 [[{b.we.0.step1}]]; Step 2 [[{b.we.0.step2}]].' },
                { do: 'Pupils do cell 2 on their own.', note: 'Expected: [[{b.we.1.step1}]], then [[{b.we.1.step2}]].' },
                { say: 'First the share. Then the change.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Read the story on the board: {cq.story}' },
                { do: 'Write four answers. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which answer is right? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Redo one story with cups and counters, then two more.', fewer: 'Stop. Cups again with two stories. Point to each step box.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'Walk to the last rows first: {p4.last}.' }],
            rows: [
                { do: 'Pupils do Practice 1 (× first), then Practice 2 (÷ first). {p4.steps}' },
                { do: 'Visit ELL and SPED pupils first, within 60 seconds.' },
                { ask: 'Point to your Step 1 answer. Where did it go?', note: 'Praise: “You used your Step 1 answer. That is step 3.”' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { say: 'No step boxes this time. Draw it. Write both steps.', note: 'Expected: Step 1 [[{wp.step1}]]; Step 2 [[{wp.step2}]] {wp.unit}.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'First the groups. Then the change.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by the boxes ticked.', note: 'a. [[{exit.0.whole}]] · b. [[{exit.1.whole}]].' },
            ] },
    ],
    transitionsMin: 4,
    p3Score: 'Guided: not scored',

    // ------------------------------------------------------------------ T6
    accepted: [
        'Step 1 for groups may be written either way round: 4 × 6 or 6 × 4.',
        'The unit word is from the bank; a missing unit with the right number: ask for it.',
        'P5: any drawing that shows the groups and the change, and both steps written.',
        'Step 1 right and Step 2 a slip of one: not yet right; ask the pupil to check Step 2.',
    ],
    wrongAnswers: [
        { wrote: '{exit.0.wrong.msstopstep1} (a)', mistake: 'Stops after Step 1', next: '“Is that the question?” Read the last line.' },
        { wrote: '{exit.0.wrong.msstorynumber} (a)', mistake: 'Story number in Step 2', next: 'The arrow from Step 1 into Step 2.' },
        { wrote: '{exit.1.wrong.msstopstep1} (b)', mistake: 'Stops after Step 1', next: 'Point to the Step 2 box.' },
        { wrote: '{exit.1.wrong.msstorynumber} (b)', mistake: 'Story number in Step 2', next: 'Cups: one share first, then the change.' },
    ],
};
