// js/modules/lessons/detailed/g3-oa5-mult-properties.js
// DETAILED LESSON 3a (owner list 2026-10-16, lead ruling: the owner's lesson is SPLIT): Grade 3,
// "Turn an array: the order property of multiplication" - CCSS 3.OA.B.5 (the commutative part only).
// EE: none at grade 3 (ee: []); see `eeNote`. Content follows
// design/lesson-planner/lessons/g3-oa5-mult-properties/RESEARCH.md §4. Flow: Standard (2 New steps).
// The file id keeps the owner's lesson name; this pack is lesson 3a. 3b and 3c are `followOn`.
//
// Practice skill MEANWHILE: multiplication:arrays_groups forms:[0] (arrays only, rows and columns 2..5,
// so every pictured array meets RP-21 on its own terms: at most 5 rows, at most 5 in a row, never a
// row past 5 that would need the fives gap - E27 must read the arrays template's rows/cols, see the
// lead's build list). Its frame accepts rows-of-cols in EITHER order, which is exactly the turned fact.
// multiplication:mult_properties is NOT used on any pupil page: its prompt gives the answer away
// (MU-A7) and it has no kit cell; proposal P-A (RESEARCH §3) redoes form 0 under its own id, and this
// file's `skill` then becomes {categoryId: 'multiplication', skillId: 'mult_properties', opts: {forms: [0]}}.
// Pure data (no DOM, no state). Every number a script speaks is a {placeholder} filled from a DEALT item.

// The array item: one picture, `___ rows of ___ make ___ in all.` (gen-operations.js arrays_groups).
const ARR = (extra) => Object.assign({ categoryId: 'multiplication', skillId: 'arrays_groups', opts: { forms: [0] } }, extra || {});
// The lesson's own skill (3.OA.B.5): an array and its turn. task 0 both products, 1 the known fact
// gives the turned fact, 2 facts only (the missing number). Arrays stay at most 5 x 5 (band 25).
const TURN = (task, extra) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_properties', opts: { forms: [0], task: [task], band: 25 } }, extra || {});
// The abstract ★★★ facts (task 2): factors to 9, so the pack's few 5 x 5 arrays are not all spent.
const FACTS = (extra) => Object.assign(TURN(2), { opts: { forms: [0], task: [2], band: 81 } }, extra || {});
// A one-line × fact (earlier content, Y3.B3): the tables of 2, 5 and 10.
const FACT = (t, extra) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [t], notation: ['across'], band: 100 } }, extra || {});
// One count-by row (Count by 1-12), the first two numbers printed.
const CB = (step) => ({ categoryId: 'multiplication', skillId: 'count_by_tables', opts: { rows: [{ step, start: 'step', dir: 'up' }], fill: 'two', times: 'none' } });

export default {
    id: 'g3-oa5-mult-properties',
    title: 'I Can turn an array to multiply',
    // (the sequence name, for the print screen and T1; the pupil title is the I Can line)
    packTitle: 'Lesson 3a · Turn it: the order property',
    grade: '3',
    level: 3,
    strand: 'Operations',
    ccss: ['3.OA.B.5'],
    ee: [],
    // ee-math.json has no grade-3 EE for 3.OA.B.5; its Wisconsin record points (`see`) to M.EE.N.CN.2,
    // which is not itself an EE record in the repo, so it is a note, never a tag.
    eeNote: 'No EE at grade 3. DLM access point: M.EE.N.CN.2 (ee-math.json "see" of 3.OA.B.5).',
    cra: 'Concrete → Pictorial',
    flowNote: 'One chunk: turn the array; the product stays the same.',
    // Lead ruling 2026-10-16: 3a = commutative only. 3b and 3c are their own lessons.
    followOn: [
        { title: 'Multiply by 1 and by 0', iCan: 'I Can multiply by 1 and by 0', skill: 'multiplication:mult_properties', opts: { forms: [2, 3] }, ccss: '3.OA.B.5',
            note: '× 1 is the property; × 0 is the contrast only. Needs P-A (no answer in the prompt, a kit cell).' },
        { title: 'Break apart an array', iCan: 'I Can break apart an array', skill: 'multiplication:mult_properties', opts: { forms: [1] }, ccss: '3.OA.B.5',
            note: 'Distributive: split at the fives line (7 = 5 + 2). After 3a and 3b.' },
    ],

    // ------------------------------------------------------------------ the practice skill
    skill: TURN(0),
    // (no pool: the pack's own places; there are only 10 rows-by-cols pairs, so ONE Practice page)
    practicePages: 2,
    // ★★★ last row: a square array (does it change when turned?) and a 5-row array.
    edgeTest: 'arrEdge',
    // ★★ Practice 1: the known fact gives the turned fact (pictures); ★★★ Practice 2: facts only, the
    // missing number; each last row a square and a 5.
    practiceSheets: [
        { skill: TURN(1), shape: [4, 2], edgeLast: { per: 4, cols: 2, wants: ['arrSquare', 'arrFive'] } },
        { skill: FACTS(), shape: [8, 2], edgeLast: { per: 8, cols: 2, wants: ['arrSquare', 'arrFive'] } },
    ],
    // Mixed: EARLIER content only (V22 §9.5): × facts of 2, 5 and 10 and array totals.
    mixed: { skills: [FACT(2), FACT(5), FACT(10), { categoryId: 'multiplication', skillId: 'dot_array_mult', opts: { band: 25, support: 'none' } }], strip: false },

    // The lesson's own placeholder names for one dealt item: an array's rows, columns, total and its
    // two facts (the fact as dealt and the fact turned).
    vars: (q, b) => {
        const p = (q && q.cell && q.cell.payload) || {};
        if (p.rows !== undefined && p.cols !== undefined) {
            const r = Number(p.rows), c = Number(p.cols), t = r * c;
            return { rows: r, cols: c, total: t, fact: `${r} × ${c} = ${t}`, turned: `${c} × ${r} = ${t}`, both: `${r} × ${c} = ${t} and ${c} × ${r} = ${t}`, eqParts: [r, c], eqOp: '×' };
        }
        const a = Number(b.a), c = Number(b.b);
        if (Number.isFinite(a) && Number.isFinite(c)) return { fact: `${a} × ${c} = ${a * c}`, turned: `${c} × ${a} = ${a * c}` };
        return {};
    },

    // The anchor chart / lesson sheet data (prereqs.js LESSONS shape, roles/lesson.js).
    lessonData: {
        skills: [],
        concepts: [
            { id: 'turn', text: 'Turn the array: rows become columns.' },
            { id: 'same', text: 'No dot comes or goes. The total stays the same.' },
        ],
        vocab: [
            { word: 'array', meaning: 'dots in equal rows', picture: { kind: 'array', rows: 2, cols: 3 } },
            { word: 'row', meaning: 'a line of dots across', picture: { kind: 'array', rows: 1, cols: 4, mark: 'row' } },
            { word: 'turn', meaning: 'move it a quarter way round', picture: { kind: 'array', rows: 2, cols: 3, mark: 'turn' } },
        ],
        // (RESEARCH §4: five steps; step 3 needs the NEW `turn` icon, Appendix H)
        steps: [
            { icon: 'look', text: 'Look at the array.' },
            { icon: 'write', text: 'Write the fact.' },
            { icon: 'turn', text: 'Turn the array.' },
            { icon: 'write', text: 'Write the new fact.' },
            { icon: 'check', text: 'Check: same product.' },
        ],
        // No chant: the Say frame does the work (RESEARCH §4).
        chant: '',
        guidedRows: 2,
        practiceShape: [6, 2],
        format: { kind: 'numbered steps with icons', why: 'Step 5 is the Critical Atom: the pupil checks, never recounts.' },
        // A non-square array, no repeated digit, a product the pupils can count (3 rows of 4).
        example: { test: 'arrTurn' },
        second: { test: 'arrNonSq', label: 'Another size. Turn it: same product.' },
        third: { test: 'arrFive', label: '5 rows? Turn it: 5 in each row.' },
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    // One question per Pre-requisite atom, most basic first.
    prerequisites: [
        { atom: 1, items: 3, ref: CB(5), lesson: { id: '2.NBT.A.2', title: 'Count by 5s and 10s' } },
        { atom: 2, items: 3, ref: FACT(2, { maxNum: 20 }), lesson: { id: '3.OA.A.1', title: 'Equal groups' } },
        { atom: 3, items: 2, ref: ARR({ maxNum: 12 }), lesson: { id: '2.OA.C.4', title: 'Use arrays' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    // Five bank types on EARLIER content (the 2, 5, 10 facts, 10 more, add within 20), never today's
    // turn. B: the same five, harder numbers.
    numberSense: {
        A: { items: [FACT(2, { maxNum: 10 }), FACT(5, { maxNum: 25 }), FACT(10, { maxNum: 50 }),
            { categoryId: 'placevalue', skillId: 'more_less_10', opts: { step: 10, dir: 'more', band: 100 }, minNum: 10, maxNum: 60 },
            { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20, notation: ['across'] }, maxNum: 12 }] },
        B: { items: [FACT(2, { minNum: 12 }), FACT(5, { minNum: 30 }), FACT(10, { minNum: 60 }),
            { categoryId: 'placevalue', skillId: 'more_less_10', opts: { step: 10, dir: 'more', band: 100 }, minNum: 61, maxNum: 89 },
            { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20, notation: ['across'] }, minNum: 13 }] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // Our own words; the numbers come from a dealt array item (a non-square array).
    wordProblem: {
        ref: TURN(0),
        want: 'arrNonSq',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['A box has {wp.rows} rows of eggs.', 'There are {wp.cols} eggs in each row.', 'How many eggs are in the box?'],
        answerLine: 'There are __ eggs.',
        say: 'There are __ eggs.',
    },

    // ------------------------------------------------------------------ P6 Exit slip
    // Four items, exactly what was taught, fresh numbers: write the fact, write the turned fact, the
    // Critical Atom (same product), and the ★★★ square case.
    exit: [
        { case: 'an array: the known fact gives the turned fact', ref: TURN(1), want: 'arrNonSq', instr: 'Turn the array. Write the new fact.', detects: 'Copies the first fact: no swap.' },
        { case: 'same product, no picture (Critical Atom)', ref: FACTS(), want: 'arrProduct', instr: 'Write the missing number.', detects: 'Multiplies again and slips: not the same product.' },
        { case: 'the missing factor', ref: FACTS(), want: 'arrFactor', instr: 'Write the missing number.', detects: 'Writes the product, or the same factor, in the box.' },
        { case: 'a square fact', ref: FACTS(), want: 'arrSquare', instr: 'Write the missing number.', detects: 'Thinks a square cannot turn.' },
    ],
    exitInstruction: 'Write how many rows. Write how many in each row.',
    exitSay: '{say.rows} times {say.cols} equals {say.cols} times {say.rows}.',

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: FACT(5, { maxNum: 30 }), ask: '{ret.0.text}' },
        { ref: FACT(2, { maxNum: 20 }), ask: '{ret.1.text}' },
        { ref: FACT(10, { maxNum: 60 }), ask: '{ret.2.text}' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Tray first, then the picture', text: 'Turn a real tray of counters before any drawn array.' },
        { kind: 'tip', title: 'No square in the I Do', text: 'A square turns into itself. It waits for the last row.' },
        { kind: 'watch', title: 'Recounting', text: 'A pupil who recounts the turned array has not got step 5 yet.' },
    ],
    caseNames: { arrSquare: 'a square array', arrFive: '5 rows or 5 in a row', arrTurn: 'non-square' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['12 counters on a tray or card, one per pair', 'Mini whiteboards and pens', 'Dot paper for the board', 'Anchor chart', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'array', gloss: 'dots in equal rows', diagram: { kind: 'text', text: '• • •  /  • • •' } },
        { word: 'row', gloss: 'a line of dots across', diagram: { kind: 'text', text: '• • • •' } },
        { word: 'turn', gloss: 'move it a quarter way round', diagram: { kind: 'text', text: '2 × 3  ↻  3 × 2' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Count by 2, 5, 10', notes: 'Finds the total fast. Prerequisite Check {pre.0.letters}.' },
        { type: 'Fact', prereq: true, skill: '× means “groups of”, “rows of”', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Array fact: rows × in each row', notes: 'A row goes across. Prerequisite Check {pre.2.letters}.' },
        { type: 'Comparative', skill: 'Turned array: rows become columns', notes: 'Same dots, turned. Non-example: a dot added.' },
        { type: 'Conceptual', critical: true, skill: 'Same product: turning adds no dot', notes: 'Ask “Did a dot move away?”' },
        { type: 'Conceptual', skill: 'Known fact gives the turned fact', notes: 'Use the fact. Do not recount.' },
    ],
    routine: [
        { step: 'Look at the array: count the rows and in each row.', tag: 'Pre-requisite', check: '“How many rows?”' },
        { step: 'Write the fact.', tag: 'Pre-requisite', check: 'Prerequisite Check {pre.2.letters}' },
        { step: 'Turn the array: rows become columns.', tag: 'New', check: 'Tray: “How many rows now?”' },
        { step: 'Write the new fact.', tag: 'New', check: 'Guided cell 2' },
        { step: 'Check: same product. No recount.', tag: 'New', critical: true, check: 'Check Question; exit c' },
    ],
    howToTeach: 'Turn a real tray of counters first; pupils count once, then see the same total. Teach the turned array with before-and-after pairs, then ask “Did a dot move away?” before the I Do. First examples: non-square, no repeated digit.',
    board: 'Dot paper: {chart.rows} rows of {chart.cols}, then turned.',
    // `misconception`: the names the main provider's wrongAnswer must use for the TURNED fact (they
    // do not exist yet - see the build list): recount (a new product), no swap (the same fact again),
    // product as a factor.
    mistakes: [
        { name: 'Recounts: a new product', step: 5, looks: '{cq.A}', fix: '“Did a dot move away?”', option: 'A', misconception: 'turn-recount' },
        { name: 'Copies the fact: no swap', step: 4, looks: '{cq.B}', fix: 'Count the turned rows aloud.', option: 'B', misconception: 'turn-no-swap' },
        { name: 'Product as a factor', step: 4, looks: '{cq.C}', fix: 'The product is always last.', option: 'C', misconception: 'turn-product-factor' },
        { name: 'Recounts the turned array', step: 5, looks: '{exit.1.wrong.turnrecount} for {exit.1.turned}', fix: 'Turn the tray: same dots.', option: '', caught: 'Exit b · Practice 2' },
        { name: 'Story: counts eggs one by one', step: 2, looks: 'A tally, no fact, on P5', fix: 'Rows first: write the fact.', option: '', caught: 'Word problem' },
    ],
    checkQuestion: { want: 'arrNonSq', correct: 'D' },

    // ------------------------------------------------------------------ T3-T5 delivery scripts
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
                { do: 'Pupils hold mini whiteboards. Write each fact on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.ans}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.ans}]].' },
                { ask: '{ret.2.ask}', note: 'Expected: [[{ret.2.ans}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 2, page: '',
            rows: [
                { say: 'Last time: one array gives a fact.' },
                { say: 'Today: one array gives two facts. Same answer.' },
            ] },
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'Turn slowly', text: 'Let them see that no dot leaves the tray.' }],
            rows: [
                { do: 'Hold up a tray of {chart.rows} rows of {chart.cols}.' },
                { say: '{chart.rows} rows of {chart.cols} is {chart.total}.', note: 'Step 1 and 2: write [[{chart.fact}]].' },
                { do: 'Turn the tray a quarter way round. Slowly.', note: 'Step 3.' },
                { ask: 'How many rows now? How many in each row?', note: 'Expected: [[{chart.cols}]] rows of [[{chart.rows}]].' },
                { say: '{chart.cols} rows of {chart.rows} is {chart.total}.', note: 'Step 4: write [[{chart.turned}]].' },
                { ask: 'Did a dot move away?', note: 'Expected: no. Step 5: same product.' },
                { say: '{chart.rows} times {chart.cols} equals {chart.cols} times {chart.rows}.', note: 'The Say frame. Pupils repeat twice.' },
                { say: 'Another size: {chart2.both}.', note: 'Panel 2: only the size changes.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: turn the tray again and ask “Same dots?”' }],
            rows: [
                { say: 'Look at the first array. Step 1 is done in grey.' },
                { ask: 'How many rows? How many in each row?', note: 'Expected ★: [[{we.0.fact}]]; turned [[{we.0.turned}]].' },
                { do: 'Pupils do the second array on their own.', note: 'Expected ★: [[{we.1.fact}]]; turned [[{we.1.turned}]].' },
                { ask: 'Turn it. What is the new fact?', note: 'Pupils say it; write it on the board.' },
                { do: 'Pupils do the Independent Practice. Walk and check.', note: 'Expected ★★: [[{indepList}]].' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Draw {cq.rows} rows of {cq.cols} dots. Write {cq.fact}.' },
                { do: 'Turn it on the board. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which is the turned fact? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach step 5 with the tray, then two more.', fewer: 'Stop. Whole class: We Do again with a new tray.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'Walk to the last row first: {p4.last}.' }],
            rows: [
                { do: 'Pupils finish the lesson sheet, then Practice 1. Mixed 1 is homework.' },
                { say: 'Write the fact. Then say the turned fact.' },
                { do: 'Circulate at ★★. Look for pupils who recount.', note: 'Ask “Did a dot move away?”' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many rows? How many in each row?', note: 'Expected: [[{wp.rows}]] rows, [[{wp.cols}]] in each.' },
                { ask: 'How many eggs? Say both facts.', note: 'Expected: [[{wp.total}]]; said: {wp.both}.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'Turning does not change the total.', note: 'Say it together twice.' },
                { do: 'Hand out the exit slip. No help. Then sort the slips.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]] · d. [[{exit.3.ans}]].' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'Rows and in each row in either order: the frame accepts 4 rows of 3 or 3 rows of 4.',
        'The two facts in either order (the turned fact first is right).',
        'On the egg story, 3 × 5 or 5 × 3 first; the label “eggs” may be left off.',
    ],
    wrongAnswers: [
        { wrote: '{exit.1.wrong.turnrecount} (b)', mistake: 'Recounts: a new product', next: 'Tray: turn it; “Did a dot move away?”' },
        { wrote: '{exit.0.wrong.turnnoswap} (a)', mistake: 'Copies the fact: no swap', next: 'Count the turned rows aloud.' },
        { wrote: '{exit.2.wrong.turnproductfactor} (c)', mistake: 'Product as a factor', next: 'The box map: the product is last.' },
        { wrote: '{exit.0.wrong.turnproductfactor} (a)', mistake: 'Product as a factor', next: 'The product is always last.' },
    ],
};
