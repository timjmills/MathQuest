// js/modules/lessons/detailed/g3-oa9-mult-table-patterns.js
// DETAILED LESSON 4 (owner list 2026-10-16): Grade 3, "Patterns on the multiplication table" -
// CCSS 3.OA.D.9 (+ 3.OA.C.7), EE M.EE.3.OA.8 (the code SKILL_STANDARDS and ee-math.json hold for
// "Identify arithmetic patterns"; the owner list names M.EE.3.OA.9 - lead ruling: tag .8, record the
// owner code in `eeOwnerList`). Content follows design/lesson-planner/lessons/g3-oa9-mult-table-patterns/
// RESEARCH.md. ONE pattern only: "if the row or the column number is even, the product is even";
// odd x odd -> odd is the ★★★ contrast, never a second rule. Not here: turn-arounds / symmetry (lesson 3)
// and "a row goes up by its number" / rules (lesson 5). See the format in ./index.js. Pure data.
//
// BUILD NEEDS (not built here; the lead / a skill lane builds them - see `buildNeeds` below):
//  B1 mult_chart / mult_chart_easy option task:'even' (instruction key `shade-even`, NEW string
//     "Shade every even product."; screen "Tap every even product."; same mult-grid cell and
//     multi-select-check as task:'shade' with n = 2; q.chartTask 'even'; iCan "I Can find even products").
//     Meanwhile this file deals task:'shade', constant:[2] ("Shade every multiple of 2.").
//  B2 countby.js CHART_STEPS.even (worked steps, below) + wrongAnswer misconceptions 'row-only'
//     (left an even COLUMN white) and 'odd-odd-shaded' (shaded odd x odd), replacing the generic
//     'missed-multiple' / 'shaded-non-multiple' the Check Question reads today.
//  B3 mult_chart window options: `winRows` / `winCols` (size; today always 4 x 5) and `minFactor: 2`
//     (no 1 row or 1 column in the window); the exit slip needs a 2 x 3 window.
//  B4 CASE_TESTS (roles/lesson.js): chartMixed (window holds an even AND an odd row), chartOddOdd
//     (window holds an odd x odd box with a 2-digit product), evenColOnly (odd row, even column).
//  B5 the Even / Odd check of a fact (n x m: check Even or Odd), first build of build-list
//     `patterns_notice` -> patterns:notice_patterns narrowed to parity: P4 page 2, the Check
//     Question 9 x 4 form, exit a/b/d. Meanwhile those slots use the chart window.

const CHART = (extra, opts) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_chart', allTest: 'chartIn9',
    opts: Object.assign({ chart: 'window', band: 100, task: 'even', minFactor: 2 }, opts || {}) }, extra || {});
const FACT = (tables, extra) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: tables, notation: ['stacked'], band: 100 } }, extra || {});
const ML = (step, dir, extra) => Object.assign({ categoryId: 'placevalue', skillId: 'more_less_10', opts: { step, dir, band: 100 } }, extra || {});
const CB = (step) => ({ categoryId: 'multiplication', skillId: 'count_by_tables', opts: { rows: [{ step, start: 'step', dir: 'up' }], fill: 'two', times: 'none' } });

export default {
    id: 'g3-oa9-mult-table-patterns',
    title: 'I Can find even products',
    grade: '3',
    level: 3,
    strand: 'Operations',
    ccss: ['3.OA.D.9', '3.OA.C.7'],
    ee: ['M.EE.3.OA.8'],
    eeOwnerList: ['M.EE.3.OA.9'],
    eeNote: 'owner list (DLM v4) vs repo EE set',
    cra: 'Concrete → Pictorial',
    flowNote: 'One chunk: one even row or column number makes the product even.',
    buildNeeds: [
        { id: 'B1', kind: 'option', what: "multiplication:mult_chart(+_easy) task:'even'; instruction key shade-even 'Shade every even product.' (screen 'Tap every even product.')" },
        { id: 'B2', kind: 'provider', what: "countby.js CHART_STEPS.even + wrongAnswer 'row-only', 'odd-odd-shaded'" },
        { id: 'B3', kind: 'option', what: 'mult_chart window size winRows/winCols and minFactor:2' },
        { id: 'B4', kind: 'case-tests', what: 'chartMixed, chartOddOdd, evenColOnly in roles/lesson.js CASE_TESTS' },
        { id: 'B5', kind: 'skill', what: 'patterns:notice_patterns (parity first): n × m, check Even / Odd; reason bank "two equal parts"' },
    ],
    // The worked steps B2 adds (CHART_STEPS.even), in teaching order:
    evenSteps: [
        'Find the even row numbers.',
        'Every box in an even row is even. Shade it.',
        'Find the even column numbers. Shade those boxes too.',
        'Both odd? Leave it white.',
    ],

    // ------------------------------------------------------------------ the practice skill
    // A 4 x 5 window of the 10 x 10 chart; shade the even products (meanwhile: multiples of 2).
    skill: CHART({}, { winRows: 3, winCols: 3 }),
    edgeTest: 'chartBigOdd',
    practicePages: 1,
    practiceSheets: [{ shape: [6, 2], edgeLast: { per: 2, cols: 2, wants: ['chartBigOdd', 'chartBigOdd'] } }],
    // (no Mixed page: the facts the windows rest on are P0 and the spaced retrieval; one full Practice page)

    // The lesson's own names for a dealt window: first even row / column, an odd x odd box, a reason fact.
    vars: (q, b) => {
        const p = (q && q.cell && q.cell.payload) || {};
        const rows = p.rows || [], cols = p.cols || [];
        if (rows.length && cols.length) {
            const er = rows.find((v) => v % 2 === 0), ec = cols.find((v) => v % 2 === 0);
            const or = rows.filter((v) => v % 2 === 1).pop(), oc = cols.filter((v) => v % 2 === 1).pop();
            const prods = [...new Set(rows.flatMap((r) => cols.map((c) => r * c)))].sort((x, y) => x - y);
            const out = { rows: rows.join(', '), cols: cols.join(', '), shaded: rows.flatMap((r) => cols.map((c) => r * c)).filter((v) => v % 2 === 0).join(', '), white: prods.filter((v) => v % 2 === 1).join(', ') };
            if (er !== undefined) Object.assign(out, { er, erHalf: er / 2 });
            if (ec !== undefined) Object.assign(out, { ec });
            if (or !== undefined && oc !== undefined) Object.assign(out, { oa: or, ob: oc, op: or * oc });
            if (or !== undefined && ec !== undefined) Object.assign(out, { ca: or, cb: ec, cp: or * ec });
            return out;
        }
        const x = Number(b.a), y = Number(b.b);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return {};
        const pr = x * y;
        return { p: pr, half: pr % 2 === 0 ? pr / 2 : '', parity: pr % 2 === 0 ? 'even' : 'odd', eqParts: [x, y], eqOp: '×' };
    },

    lessonData: {
        skills: [],
        concepts: [
            { id: 'even', text: 'An even row or column: the product is even.' },
            { id: 'odd', text: 'Both numbers odd: the product is odd.' },
        ],
        vocab: [
            { word: 'even', meaning: 'makes pairs, none left over', picture: { kind: 'text', text: '●● ●● ●●' } },
            { word: 'odd', meaning: 'one is left over', picture: { kind: 'text', text: '●● ●● ●● ●' } },
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'text', text: '4 × 3 = 12' } },
        ],
        steps: [
            { icon: 'look', text: 'Shade the even rows.' },
            { icon: 'decide', text: 'Shade the even columns too.' },
            { icon: 'write', text: 'Both odd? Leave it white.' },
        ],
        chant: '',
        guidedRows: 2,
        practiceShape: [6, 2],
        format: { kind: 'numbered steps with icons', why: 'The step pupils break is step 2: they look at the row only.' },
        example: { test: 'evenColOnly' },
        guided: ['chartMixed', 'evenColOnly'],
        independent: ['chartMixed', 'evenColOnly'],
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, items: 1, ref: CB(2), lesson: { id: '2.OA.C.3', title: 'Even numbers: count by 2s' } },
        { atom: 2, items: 4, ref: FACT([2], { minNum: 12, maxNum: 18 }), lesson: { id: '3.OA.C.7', title: 'Multiply by 2' } },
        { atom: 3, items: 2, ref: CHART({}, { task: 'fill', winRows: 2, winCols: 3 }), lesson: { id: '3.OA.C.7', title: 'Read the multiplication chart' } },
        { atom: 4, items: 4, ref: FACT([4], { minNum: 12, maxNum: 36 }), lesson: { id: '3.OA.C.7', title: 'Multiply by 4' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense (earlier content)
    numberSense: {
        // (earlier content in one-line rows, as lesson 3a: a fact cell is taller than a P1 row; the facts are T3 §3)
        A: { items: [ML(10, 'more', { minNum: 10, maxNum: 60 }), ML(10, 'less', { minNum: 20, maxNum: 60 }), { categoryId: 'placevalue', skillId: 'compare', opts: { band: 99, closeness: 'far' } },
            { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 99 }, maxNum: 50 }, ML(1, 'more', { minNum: 10, maxNum: 50 })] },
        B: { items: [{ categoryId: 'placevalue', skillId: 'more_less_100', opts: { step: 10, dir: 'more' }, minNum: 120, maxNum: 880 }, { categoryId: 'placevalue', skillId: 'more_less_100', opts: { step: 10, dir: 'less' }, minNum: 120, maxNum: 980 },
            { categoryId: 'placevalue', skillId: 'compare', opts: { band: 999, closeness: 'close' }, minNum: 100 },
            { categoryId: 'placevalue', skillId: 'unit_form', opts: { band: 99 }, minNum: 50 }, ML(1, 'more', { minNum: 101, maxNum: 118, opts: { step: 1, dir: 'more', band: 120 } })] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    wordProblem: {
        ref: FACT([4, 6, 8]),
        want: 'bigSecond',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['There are {wp.a} bags.', 'Each bag has {wp.b} apples.', 'How many apples? Is it even or odd?'],
        answerLine: 'There are __ apples.',
        say: 'One number is even. So {wp.p} is __.',
        sayAns: 'even',
    },

    // ------------------------------------------------------------------ P6 Exit slip (fresh windows)
    // Designed around the 4 x 5 window the generator cuts today (B3 would allow the 2 x 3 of RESEARCH.md).
    // (four 2 x 3 windows, two across: a 3-row window leaves a half's cell no free room - never shrunk)
    exit: [
        { case: 'an even row (odd columns)', ref: CHART({ pageGroup: 'exit' }, { winRows: 2, winCols: 3 }), want: 'chartColsOdd', cols: 2, detects: 'Misses the even row.' },
        { case: 'the odd row: its even column (Critical Atom)', ref: CHART({ pageGroup: 'exit' }, { winRows: 2, winCols: 3 }), want: 'chartColsEven', cols: 2, detects: 'Leaves an even column white.' },
        { case: 'odd x odd stays white', ref: CHART({ pageGroup: 'exit' }, { winRows: 2, winCols: 3 }), want: 'chartOddOdd', cols: 2, detects: 'Shades an odd × odd box.' },
        { case: 'rows and columns', ref: CHART({ pageGroup: 'exit' }, { winRows: 2, winCols: 3 }), want: 'chartMixed', cols: 2, detects: 'Shades one line only.' },
    ],
    exitInstruction: 'Shade every even product.',
    exitSay: 'b. {say.ca} × {say.cb}: {say.cb} is even. So {say.cp} is __.',
    exitSayItem: 1,
    exitSayAns: 'even',

    // ------------------------------------------------------------------ retrieval (MWB, earlier content)
    retrieval: [
        { ref: FACT([5]), ask: '{ret.0.text}' },
        { ref: FACT([2]), ask: '{ret.1.text}' },
        { ref: FACT([3, 7]), ask: '{ret.2.text}' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Cubes in pairs first', text: 'The 4 row is two 2 rows: every product splits into pairs.' },
        { kind: 'language', title: 'Row OR column', text: 'Say "row or column" every time. One even number is enough.' },
        { kind: 'watch', title: 'Row only', text: 'The mistake to stop today: an even column left white.' },
    ],
    caseNames: { chartBigOdd: 'odd × odd stays white', evenColOnly: 'even column only' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['Interlocking cubes, 20 per pair', 'Mini whiteboards and pens', 'Anchor chart (a 4 × 5 window), A3 or projected', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'even', gloss: 'makes pairs, none left over', diagram: { kind: 'text', text: '●● ●● ●●' } },
        { word: 'odd', gloss: 'one is left over', diagram: { kind: 'text', text: '●● ●● ●● ●' } },
        { word: 'product', gloss: 'the answer when you multiply', diagram: { kind: 'text', text: '4 × 3 = 12' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Category', prereq: true, skill: 'Even numbers: the count by 2s', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Facts of 2: 2 × n is n + n', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Read the chart: row meets column', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Facts of 4: double the 2s', notes: 'Prerequisite Check {pre.3.letters}.' },
        { type: 'Comparative', skill: 'Even row: every product is even', notes: 'Anchor chart, the even rows.' },
        { type: 'Conceptual', skill: 'Why: 4 × n is two equal parts', notes: 'Cubes: the 4 row is two 2 rows.' },
        { type: 'Category', critical: true, skill: 'One even factor is enough: row OR column', notes: 'Routine step 2.' },
        { type: 'Comparative', skill: 'Odd × odd is odd (contrast)', notes: 'The last Practice row only.' },
    ],
    routine: [
        { step: 'Shade the even rows.', tag: 'New', check: 'Guided 1, exit a' },
        { step: 'Shade the even columns too.', tag: 'New', critical: true, check: 'Guided 2, Check Question, exit b' },
        { step: 'Both odd? Leave it white.', tag: 'New', check: 'Practice last row, exit c' },
    ],
    howToTeach: 'Show, then name. Build the 2 row and the 4 row with cubes in pairs, then shade them on the window, then the even columns. Odd × odd is shown last, as a contrast, never as a second rule.',
    board: 'Window rows {chart.rows} × columns {chart.cols}.',
    mistakes: [
        { name: 'Row only', step: 2, looks: '{cq.A}', fix: 'Row OR column? Check both.', option: 'A', misconception: 'row-only' },
        { name: 'Odd × odd = even', step: 3, looks: '{cq.B}', fix: 'Count the pairs: one is left over.', option: 'B', misconception: 'odd-odd-shaded' },
        { name: 'Tens digit decides', step: 1, looks: '36 called odd (the 3)', fix: 'Cover the tens. Read the ones.', option: '', caught: 'Prerequisite Check · Number sense' },
        { name: 'Any odd factor is odd', step: 2, looks: '{chart.ca} × {chart.cb} left white', fix: 'One even number is enough.', option: '', caught: 'Exit b' },
    ],
    checkQuestion: { want: 'evenColOnly', correct: 'C', ref: CHART({}, { winRows: 3, winCols: 4 }) },

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 6, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
            rows: [
                { do: 'Hand out the Prerequisite Check, face down.' },
                { say: 'Do these on your own. Try every one.' },
                { do: 'Walk and mark as pupils finish.', note: 'Expected: [[{p0.list}]]. Routing is on T6.' },
            ] },
        { n: 2, name: 'Number sense', min: 5, page: 'P1',
            rows: [
                { do: 'Hand out the Number sense page. Band A, then band B.' },
                { ask: '{ns.A.0.text}', note: 'Expected: [[{ns.A.0.ans}]].' },
                { ask: 'Are all the 4s even?', note: 'Expected: yes (band B, the count by 4s).' },
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
                { say: 'Even numbers make pairs.' },
                { say: 'Today we find them in the times table.' },
            ] },
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'Row only', text: 'Point to the row number AND the column number, every box.' }],
            rows: [
                { do: 'Put the anchor chart up: rows {chart.rows}, columns {chart.cols}.' },
                { do: 'Build {chart.er} rows of cubes in pairs.' },
                { say: '{chart.er} is even. Every box in that row is even.', note: 'Shade the row (step 3).' },
                { ask: 'What about the {chart.ec} column?', note: 'Expected: even. Shade the column.' },
                { say: '{chart.ca} is odd. {chart.cb} is even. So {chart.cp} is even.', note: 'Step 2, the Critical Atom: one is enough.' },
                { say: '{chart.oa} and {chart.ob} are both odd. So {chart.op} is odd.', note: 'Leave it white. Contrast only.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 7, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: "Check the row AND the column."' }],
            rows: [
                { say: 'Finger on the row number. Finger on the column number.' },
                { ask: 'Is one of them even?', note: 'Listen for "row or column".' },
                { do: 'Pupils shade {we.0.rows} × {we.0.cols} with you.', note: 'Expected ★: [[{we.0.shaded}]].' },
                { do: 'Pupils shade the second window alone.', note: 'Expected ★: [[{we.1.shaded}]].' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Show the window {cq.rows} × {cq.cols}. A: {cq.A} · B: {cq.B} · C: {cq.C}.' },
                { ask: 'Which shading is right? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Re-show the odd row with an even column, then one more.', fewer: 'Back to cubes: build {chart.ca} rows of {chart.cb}, pair them up.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'Walk to the last rows first: {p4.last}.' }],
            rows: [
                { do: 'Pupils do Practice 1. The Steps are at the top.' },
                { do: 'Circulate. Point at every white box.', note: 'Ask: "Row odd? Column odd?"' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many apples? Even or odd?', note: 'Expected: [[{wp.p}]], [[{wp.parity}]].' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 5, page: 'P6',
            rows: [
                { say: 'If one number is even, the product is even.', note: 'The Remember line. Say it twice.' },
                { do: 'Hand out the exit slip. No help. Sort by the boxes ticked.', note: 'a. [[{exit.0.shaded}]] · b. [[{exit.1.shaded}]] · c. [[{exit.2.shaded}]] · d. [[{exit.3.shaded}]].' },
                { say: 'Tomorrow we use rules to make number patterns.' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'A shade drawn as a hatch, a fill or a ring around the number.',
        'Word problem: the product and "even"; the bar may be drawn as groups or as equal parts.',
    ],
    wrongAnswers: [
        { wrote: '{exit.1.wrong.rowonly}', mistake: 'Row only', next: '"Row OR column?" Finger on every even header.' },
        { wrote: '{exit.2.wrong.oddoddshaded}', mistake: 'Odd × odd = even', next: 'Count the pairs: one is left over.' },
        { wrote: 'An even product left white because a factor is odd', mistake: 'Any odd factor is odd', next: 'One even number is enough.' },
        { wrote: '36 called odd', mistake: 'Tens digit decides', next: 'Cover the tens. Read the ones.' },
    ],
};
