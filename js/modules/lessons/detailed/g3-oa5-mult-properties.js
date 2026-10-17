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
// 1 or 10 more / less (Y2 place value, earlier content).
const ML = (step, dir, extra) => Object.assign({ categoryId: 'placevalue', skillId: 'more_less_10', opts: { step, dir, band: 100 } }, extra || {});
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
    // (T1 prints "EE none · access point <eeAccess>")
    eeAccess: 'M.EE.N.CN.2',
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
    // (products to 20: the chart and Guided cell 1 at most 4 by 4, Guided cell 2 the widest, 4 by 5;
    // `turn-two` keeps the Guided header on one line beside the Steps)
    skill: TURN(0, { maxNum: 20, instructionKey: 'turn-two' }),
    // (no pool: the pack's own places; there are only 10 rows-by-cols pairs, so ONE Practice page)
    practicePages: 2,
    // ★★★ last row: a square array (does it change when turned?) and a 5-row array.
    edgeTest: 'arrEdge',
    // ★★ Practice 1: the known fact gives the turned fact (pictures; a square or a 5 in every place), its last
    // row a 4 x 4 square and 5 rows; Practice 2:
    // facts only, the missing number, its last row a square and a 5.
    practiceSheets: [
        // (products to 16: rows + in each row at most 8, so the array and its turn fit a half-width cell at L)
        { skill: TURN(1, { minNum: 6, maxNum: 16, allTest: 'arrNoSmall' }), shape: [4, 2], edgeLast: { per: 4, cols: 2, wants: ['arrBigSquare', 'arrFiveRows'] } },
        { skill: FACTS({ minNum: 12, factorCap: 3 }), shape: [10, 2], edgeLast: { per: 10, cols: 2, first: true, wants: ['arrSquare', 'arrFive'] } },
    ],
    // No Mixed page: a Mixed page leads with the lesson skill (half its items), and only ten arrays up to
    // 5 x 5 exist - the chart, the lesson sheet, Practice 1, the exit slip and the Check Question use them
    // all. Earlier content is P1 and the spaced retrieval (T3 §3).

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
            // (the facts-only rule, on the pupil's own page - modelled in the I Do, T4 §5)
            { id: 'same', text: 'Same two numbers, same product.' },
            { id: 'turn', text: 'Turn the array: rows become columns.' },
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
        // (two arrays-and-turns are too wide to stand side by side: they stack beside the Steps)
        guidedStack: 2,
        guidedWants: ['arrSmall', 'arrFourFive'],
        guidedRows: 2,
        practiceShape: [6, 2],
        format: { kind: 'numbered steps with icons', why: 'Step 5 is the Critical Atom: the pupil checks, never recounts.' },
        // A non-square array, no repeated digit, a product the pupils can count (3 rows of 4).
        example: { test: 'arrTurnSmall' },
        // (no second or third example: the chart's four step panels fill the page, and only ten arrays
        // to 5 x 5 exist - every one the chart does not print is one more for the pupil pages)
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    // One question per Pre-requisite atom, most basic first.
    prerequisites: [
        { atom: 1, items: 1, ref: CB(5), lesson: { id: '2.NBT.A.2', title: 'Count by 5s and 10s' } },
        { atom: 2, items: 4, ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [2], notation: ['stacked'], band: 100 }, minNum: 12, maxNum: 18 }, lesson: { id: '3.OA.A.1', title: 'Equal groups' } },
        { atom: 3, items: 2, ref: ARR({ minNum: 6, maxNum: 15 }), lesson: { id: '2.OA.C.4', title: 'Use arrays' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    // Five bank types on EARLIER content (Y2 place value: 10 more, 10 less, compare, tens and ones,
    // 1 more), never today's turn. B: the same five, harder numbers.
    numberSense: {
        // (no × fact rows: a fact cell's working room is taller than a P1 row; the × facts are the
        // spaced retrieval on mini whiteboards, T3 §3)
        A: { items: [ML(10, 'more', { minNum: 10, maxNum: 60 }), ML(10, 'less', { minNum: 20, maxNum: 60 }), { categoryId: 'placevalue', skillId: 'compare', opts: { band: 99, closeness: 'far' } },
            { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 99 }, maxNum: 50 }, ML(1, 'more', { minNum: 10, maxNum: 50 })] },
        B: { items: [ML(10, 'more', { minNum: 61, maxNum: 89 }), ML(10, 'less', { minNum: 61, maxNum: 99 }), { categoryId: 'placevalue', skillId: 'compare', opts: { band: 99, closeness: 'close' } },
            { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 99 }, minNum: 50 }, ML(1, 'more', { minNum: 51, maxNum: 98 })] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // Our own words; the numbers come from a dealt facts-only item (a non-square product item, factors to 9).
    wordProblem: {
        ref: FACTS(),
        // (the product item: its answer is the eggs in all)
        want: 'arrProduct',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['A box has {wp.rows} rows of eggs.', 'There are {wp.cols} eggs in each row.', 'How many eggs are in the box?'],
        answerLine: 'There are __ eggs.',
        say: 'There are __ eggs.',
    },

    // ------------------------------------------------------------------ P6 Exit slip
    // Four items, exactly what was taught, fresh numbers: write the fact, write the turned fact, the
    // Critical Atom (same product), and the ★★★ square case.
    // Three items (V22: 3 when 4 full-size items do not fit a half - an array and its turn is a whole row),
    // the array one across, the two facts two across: the turned fact from a picture, the Critical Atom without a picture, the ★★★ square.
    exit: [
        { case: 'an array: the known fact gives the turned fact', ref: TURN(1, { maxNum: 12 }), want: 'arrSmall', instr: 'Turn the array. Write the new fact.', detects: 'Copies the first fact: no swap.', cols: 1 },
        { case: 'same product, no picture (Critical Atom)', ref: FACTS(), want: 'arrProduct', instr: 'Write the missing number.', detects: 'Multiplies again and slips: not the same product.', cols: 2 },
        { case: 'a square fact, the missing factor', ref: FACTS(), want: 'arrSquareFactor', instr: 'Write the missing number.', detects: 'Thinks a square cannot turn.', cols: 2 },
    ],
    exitInstruction: 'Write how many rows. Write how many in each row.',
    exitSayItem: 1,
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
    caseNames: { arrSquare: 'a square', arrFive: 'a 5', arrTurn: 'non-square' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['12 counters on a tray or card, one per pair', 'Mini whiteboards and pens', 'Dot paper for the board', 'Anchor chart', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'array', gloss: 'dots in equal rows', diagram: { kind: 'text', text: '• • •  /  • • •' } },
        { word: 'row', gloss: 'a line of dots across', diagram: { kind: 'text', text: '• • • •' } },
        { word: 'turn', gloss: 'move it a quarter way round', diagram: { kind: 'text', text: '2 × 3  ↻  3 × 2' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Count by 2, 5, 10', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Fact', prereq: true, skill: '× means “groups of”, “rows of”', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Array fact: rows × in each row', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Comparative', skill: 'Turned array: rows become columns', notes: 'Non-example: a dot added.' },
        { type: 'Conceptual', critical: true, skill: 'Same product: turning adds no dot', notes: 'Ask “Did a dot move away?”' },
        { type: 'Conceptual', skill: 'Known fact gives the turned fact', notes: 'Use the fact. Do not recount.' },
    ],
    routine: [
        { step: 'Look at the array: count the rows and in each row.', tag: 'Pre-requisite', check: '“How many rows?”' },
        { step: 'Write the fact.', tag: 'Pre-requisite', check: 'Guided cell 1' },
        { step: 'Turn the array: rows become columns.', tag: 'New', check: 'Tray: “How many rows now?”' },
        { step: 'Write the new fact.', tag: 'New', check: 'Guided cell 2' },
        { step: 'Check: same product. No recount.', tag: 'New', critical: true, check: 'Check Question; exit b' },
    ],
    howToTeach: 'Turn a real tray of counters first: pupils count once, then see the same total. Ask “Did a dot move away?” First examples: non-square, no repeated digit.',
    board: 'Dot paper: {chart.rows} rows of {chart.cols}, then turned.',
    // `misconception`: the names the main provider's wrongAnswer must use for the TURNED fact (they
    // do not exist yet - see the build list): recount (a new product), no swap (the same fact again),
    // product as a factor.
    mistakes: [
        { name: 'Recounts: a new product', step: 5, looks: '{cq.A}', fix: '“Did a dot move away?”', option: 'A', misconception: 'turn-recount', caught: 'Exit b' },
        { name: 'Adds the two factors', step: 5, looks: '{cq.B}', fix: '“Times, not plus: same product.”', option: 'B', misconception: 'turn-product-factor' },
        { name: 'Copies the fact: no swap', step: 4, looks: '{exit.0.wrong.turnnoswap} for {exit.0.turned}', fix: 'Count the turned rows aloud.', option: '', caught: 'Exit a · Practice 1' },
        { name: 'Product as a factor', step: 4, looks: '{exit.2.wrong.turnproductfactor} in the box of exit c', fix: 'The product is always last.', option: '', caught: 'Exit c · Practice 2' },
    ],
    // The Check Question is a fact on the board (no dots: the Critical Atom, same product, after the I Do's
    // facts-only rows), a fresh pair; its options are the provider's wrong products, each written as a fact.
    checkQuestion: { ref: FACTS(), want: 'arrProduct', correct: 'C',
        show: (v, q) => { const p = (q && q.cell && q.cell.payload) || {}; return `${p.cols} × ${p.rows} = ${v}`; } },

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
                { do: 'Show the tray. Pupils count the counters once.', note: 'They keep the total in mind for the turn.' },
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
                { do: 'Cover the dots. Point to {chart.fact} on the chart.', note: 'One new thing: no dots. Practice 2 and exit b, c.' },
                { ask: 'So what is {chart.cols} × {chart.rows}?', note: 'Expected: [[{chart.total}]]. Same two numbers, same product.' },
                { do: 'Write {chart.cols} × □ = {chart.total} on the board.', note: 'Expected: [[{chart.rows}]]: the factor that moved.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: turn the tray again and ask “Same dots?”' }],
            rows: [
                { say: 'Look at the first array. Count the rows.' },
                { ask: 'How many rows? How many in each row?', note: 'Expected ★: [[{we.0.fact}]]; turned [[{we.0.turned}]].' },
                { do: 'Pupils do the second array on their own.', note: 'Expected ★: [[{we.1.fact}]]; turned [[{we.1.turned}]].' },
                { ask: 'Turn it. What is the new fact?', note: 'Pupils say it; write it on the board.' },
                { say: 'Cover the dots of the second array. Read its first fact.', note: 'Expected: [[{we.1.fact}]]; no dots, the same turned fact.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write {cq.fact} on the board. No dots.' },
                { do: 'Write three turned facts. A: {cq.A} · B: {cq.B} · C: {cq.C}.' },
                { ask: 'Which turned fact is true? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach step 5 with the tray, then two more.', fewer: 'Stop. Whole class: We Do again with a new tray.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'Walk to the last row first: {p4.last}.' }],
            rows: [
                { do: 'Pupils finish the lesson sheet, then Practice 1 and 2.' },
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
                { do: 'Hand out the exit slip. No help. Then sort the slips.', note: 'a. [[{exit.0.ans}]] · b. [[{exit.1.ans}]] · c. [[{exit.2.ans}]].' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'Prerequisite Check arrays: rows and in each row in either order.',
        'Exit a: only {exit.0.turned}; writing {exit.0.fact} again is the no-swap mistake.',
        'Practice 2 and exit b, c: one number in each box, no working needed.',
        'Egg story: {wp.rows} × {wp.cols} or {wp.cols} × {wp.rows}; the label “eggs” may be left off.',
    ],
    wrongAnswers: [
        { wrote: '{exit.1.wrong.turnrecount} (b)', mistake: 'Recounts: a new product', next: 'Tray: turn it; “Did a dot move away?”' },
        { wrote: '{exit.0.wrong.turnnoswap} (a)', mistake: 'Copies the fact: no swap', next: 'Count the turned rows aloud.' },
        { wrote: '{exit.2.wrong.turnproductfactor} (c)', mistake: 'Product as a factor', next: 'The box map: the product is last.' },
        { wrote: '{exit.0.wrong.turnproductfactor} (a)', mistake: 'Product as a factor', next: 'The product is always last.' },
        { wrote: '{exit.1.wrong.turnproductfactor} (b)', mistake: 'Adds the two factors', next: '“Times, not plus.” Say the fact aloud.' },
        { wrote: 'A box left empty on Practice 2', mistake: 'Not sure which number moved', next: 'Point: the two factors swap places.' },
    ],
};
