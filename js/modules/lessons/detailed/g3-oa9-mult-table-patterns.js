// js/modules/lessons/detailed/g3-oa9-mult-table-patterns.js
// DETAILED LESSON 4 (owner list 2026-10-16): Grade 3, "Patterns on the multiplication table" -
// CCSS 3.OA.D.9 (+ 3.OA.C.7), EE M.EE.3.OA.8 (the code SKILL_STANDARDS and ee-math.json hold for
// "Identify arithmetic patterns"; the owner list names M.EE.3.OA.9 - lead ruling: tag .8, record the
// owner code in `eeOwnerList`). Content follows design/lesson-planner/lessons/g3-oa9-mult-table-patterns/
// RESEARCH.md. ONE pattern only: "if the row or the column number is even, the product is even";
// odd x odd -> odd is the ★★★ contrast, never a second rule. Not here: turn-arounds / symmetry (lesson 3)
// and "a row goes up by its number" / rules (lesson 5). See the format in ./index.js. Pure data.
//
// BUILT for this lesson (2026-10-17): mult_chart task 'even' (shade-even), CHART_STEPS.even with step marks
// 'even-rows' / 'even-cols' / 'odd-odd' (countby.js) drawn by mult-grid evenGridState, wrong answers 'row-only' /
// 'odd-odd-shaded', window options winRows / winCols / minFactor; CASE_TESTS chartIn9, chartMixed, evenColOnly,
// chartOddOdd, chartBigOdd, chartColsOdd, chartColsEven (roles/lesson.js); print-sheet.js window keys (factKeyOf
// 'grid r0-r1 x c0-c1:task', turned windows one key) and near twins (gridNear: more than half the boxes shared).
// NOT BUILT (proposal, build list `patterns_notice`): B5 patterns:notice_patterns, the Even / Odd check of a fact
// with a reason bank. Until then the lesson is windows only: ONE Practice page of six windows and no Mixed page.

const CHART = (extra, opts) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_chart', allTest: 'chartIn9', allHard: true, gridApart: true,
    opts: Object.assign({ chart: 'window', band: 100, task: 'even', minFactor: 2 }, opts || {}) }, extra || {});
const FACT = (tables, extra) => Object.assign({ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: tables, notation: ['stacked'], band: 100 } }, extra || {});
const ML = (step, dir, extra) => Object.assign({ categoryId: 'placevalue', skillId: 'more_less_10', opts: { step, dir, band: 100 } }, extra || {});
const CB = (step) => ({ categoryId: 'multiplication', skillId: 'count_by_tables', opts: { rows: [{ step, start: 'step', dir: 'up' }], fill: 'two', times: 'none', missing: 20 } });

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
    // (the lesson pages use the 2-12 chart without 10, products to 100 - chartFresh; the chart example stays on 2-9 - chartExample;
    // r4: the sheet's spare height goes into its cells, lessonData.growAll)
    skill: CHART({ tries: 600, allTest: 'chartFresh' }, { winRows: 2, winCols: 4, band: 144 }),
    edgeTest: 'chartEdge',
    // (T5 Watch, critic r2 n8: a last-row window named by its traps - the even products with an odd tens digit, the big odd)
    lastName: (q) => {
        const p = (q && q.cell && q.cell.payload) || {}; const rows = p.rows || [], cols = p.cols || [];
        if (!rows.length || !cols.length) return '';
        const span = (l) => (l.length > 2 ? `${l[0]}–${l[l.length - 1]}` : l.join(', '));
        const pr = [...new Set(rows.flatMap((r) => cols.map((c) => r * c)))].sort((x, y) => x - y);
        const trap = pr.filter((v) => v % 2 === 0 && v >= 30 && Math.floor(v / 10) % 2 === 1);
        const odd = [...new Set(rows.flatMap((r) => cols.filter((c) => r % 2 && c % 2 && r * c >= 55).map((c) => r * c)))].sort((x, y) => x - y);
        const and = (l) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}` : String(l[0]));
        const bits = [trap.length ? `${and(trap)} ${trap.length > 1 ? 'are' : 'is'} even (tens digit odd)` : '', odd.length ? `${and(odd)} ${odd.length > 1 ? 'stay' : 'stays'} white` : ''].filter(Boolean);
        return `${span(rows)} × ${span(cols)}: ${bits.join(', ')}`;
    },
    practicePages: 1,
    // (r4, lead ruling: Practice windows are 2 x 3; two of a page share at most half their boxes (turned boxes counted), none
    // copies another page's window, and each REVISITS the lesson's ground (`gridRevisit`: more than half shared with an
    // earlier page's window), so the fresh windows are left for the exit slip and the Check Question. The ★★★ row is
    // chartEdge - even products in the 30s / 50s / 70s / 90s, or an odd x odd product of 55 or more - and no row above holds one.)
    practiceSheets: [{ steps: true, skill: CHART({ tries: 600, allTest: 'chartFresh', gridRevisit: true }, { winRows: 2, winCols: 3, band: 144 }), shape: [6, 2], edgeLast: { per: 6, cols: 2, first: true, wants: ['chartEdge', 'chartEdge'] } }],
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
            const or1 = rows.find((v) => v % 2 === 1);
            if (or !== undefined && oc !== undefined) Object.assign(out, { oa: or1, ob: oc, op: or1 * oc });
            if (er !== undefined && ec !== undefined) Object.assign(out, { wa: er, wb: ec, wp: er * ec, wh: er * ec / 2 });
            // (an even product whose TENS digit is odd - 36, 56, 72: the "tens digit decides" trap)
            const trap = prods.find((v) => v % 2 === 0 && v >= 10 && Math.floor(v / 10) % 2 === 1);
            if (trap !== undefined) out.trap = trap;
            if (or !== undefined && ec !== undefined) Object.assign(out, { ca: or, cb: ec, cp: or * ec });
            return out;
        }
        const x = Number(b.a), y = Number(b.b);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return {};
        const pr = x * y;
        return { sum: x + y, p: pr, half: pr % 2 === 0 ? pr / 2 : '', parity: pr % 2 === 0 ? 'even' : 'odd', eqParts: [x, y], eqOp: '×' };
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
            { word: 'product', meaning: 'the answer when you multiply', picture: { kind: 'fact', a: 4, b: 3 } },
        ],
        steps: [
            { icon: 'look', text: 'Shade the even rows.' },
            { icon: 'decide', text: 'Shade the even columns too.' },
            { icon: 'write', text: 'Both odd? Leave it white.' },
        ],
        chant: '',
        guidedRows: 2,
        // (r4, E9b: the sheet's spare height goes into its cells - V22 OR-a, the work space first - not a blank band)
        growAll: true,
        practiceShape: [4, 2],
        format: { kind: 'numbered steps with icons', why: 'The step pupils break is step 2: they look at the row only.' },
        example: { test: 'chartExample' },
        guided: ['chartMixed', 'chartMixed'],
        guidedWants: ['chartMixed', 'chartMixed'],
        independent: ['chartMixed', 'chartMixed'],
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, items: 1, ref: CB(2), lesson: { id: '2.OA.C.3', title: 'Even numbers: count by 2s' } },
        { atom: 2, items: 4, ref: FACT([2, 4], { minNum: 12, maxNum: 36 }), lesson: { id: '3.OA.C.7', title: 'Multiply by 2 and 4' } },
        { atom: 3, items: 2, ref: CHART({ gridRevisit: true }, { task: 'fill', winRows: 2, winCols: 3 }), lesson: { id: '3.OA.C.7', title: 'Read the multiplication chart' } },
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
        // (r5, critic r2 n10: a frame that fits an odd item as well as an even one; the numbers are the story's own)
        say: 'Is {wp.a} or {wp.b} even? The product is __.',
        sayAns: '{wp.parity}',
    },

    // ------------------------------------------------------------------ P6 Exit slip (fresh windows)
    // Designed around the 4 x 5 window the generator cuts today (B3 would allow the 2 x 3 of RESEARCH.md).
    // (three 2 x 3 windows, each fresh: no window of any page, any task, holds more than half its boxes; the slip's windows
    // share none if they can, else at most half. They may use the 11 and 12 rows, modelled on the lesson sheet and Practice,
    // never the 10 row, which no page models (chartFresh, products to 100). The Check Question is dealt first - `first`.)
    exit: [
        { case: 'an even row (odd columns)', ref: CHART({ pageGroup: 'exit', gridFresh: true, allTest: 'chartFresh' }, { winRows: 2, winCols: 3, band: 144 }), want: ['chartColsOdd', 'chartIn9'], cols: 1, group: 'a', detects: 'Misses the even row.' },
        { case: 'the odd row: its even column (Critical Atom)', ref: CHART({ pageGroup: 'exit', gridFresh: true, allTest: 'chartFresh' }, { winRows: 2, winCols: 3, band: 144 }), want: ['chartMixed', 'chartRowOnly'], cols: 2, group: 'bc', detects: 'Leaves an even column white.' },
        { case: 'odd x odd stays white', ref: CHART({ pageGroup: 'exit', gridFresh: true, allTest: 'chartFresh' }, { winRows: 2, winCols: 3, band: 144 }), want: 'chartOddOdd', cols: 2, group: 'bc', detects: 'Shades an odd × odd box.' },
    ],
    exitInstruction: 'Shade every even product.',

    // ------------------------------------------------------------------ retrieval (MWB, earlier content)
    retrieval: [
        { ref: FACT([5]), ask: '{ret.0.text}' },
        { ref: FACT([2]), ask: '{ret.1.text}' },
        { ref: FACT([3, 7]), ask: '{ret.2.text}' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Cubes: two equal parts', text: 'Build {chart.wa} rows of {chart.wb}: {chart.wh} and {chart.wh}, two equal parts, so it is even.' },
        { kind: 'language', title: 'Row OR column', text: 'Say "row or column" every time. One even number is enough.' },
        { kind: 'watch', title: 'Row only', text: 'The mistake to stop today: an even column left white.' },
    ],
    caseNames: { chartBigOdd: 'odd × odd stays white', evenColOnly: 'even column only' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['Interlocking cubes: a teacher set of 60', 'Mini whiteboards and pens', 'Anchor chart (a 2 × 4 window), A3 or projected', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'even', gloss: 'makes pairs, none left over', diagram: { kind: 'text', text: '●● ●● ●●' } },
        { word: 'odd', gloss: 'one is left over', diagram: { kind: 'text', text: '●● ●● ●● ●' } },
        { word: 'product', gloss: 'the answer when you multiply', diagram: { kind: 'fact', a: 4, b: 3 } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Category', prereq: true, skill: 'Even numbers: the count by 2s (2, 4, 6, 8 ...)', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Facts of 2 and 4: 4 × n is 2 × n twice', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Read the chart: row meets column', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Comparative', skill: 'Even row: every product is even', notes: 'Anchor chart, the even rows.' },
        { type: 'Conceptual', skill: 'Why: an even row splits into two equal parts', notes: 'Cubes: {chart.wa} rows of {chart.wb}, {chart.wh} and {chart.wh}.' },
        { type: 'Category', critical: true, skill: 'One even factor is enough: row OR column', notes: 'Routine step 2.' },
        { type: 'Comparative', skill: 'Odd × odd is odd (contrast)', notes: 'Anchor chart step 3; every window.' },
    ],
    routine: [
        { step: 'Shade the even rows.', tag: 'New', check: 'Guided 1, exit a' },
        { step: 'Shade the even columns too.', tag: 'New', critical: true, check: 'Guided 2, Check Question, exit b' },
        { step: 'Both odd? Leave it white.', tag: 'New', check: 'Practice last row, exit c' },
    ],
    howToTeach: 'Show, then name. Build the even row of the chart with cubes and split it into two equal parts, then shade the even rows on the window, then the even columns. Odd × odd is shown last, as a contrast, never as a second rule.',
    board: 'Window rows {chart.rows} × columns {chart.cols}.',
    mistakes: [
        { name: 'Row only', step: 2, looks: '{cq.A}', fix: 'Row OR column? Check both.', option: 'A', misconception: 'row-only' },
        { name: 'Odd × odd = even', step: 3, looks: '{cq.B}', fix: 'Count the pairs: one is left over.', option: 'B', misconception: 'odd-odd-shaded' },
        { name: 'Tens digit decides', step: 1, looks: '{chart.trap} left white (its tens digit is odd)', fix: 'Cover the tens. Read the ones.', option: '', caught: 'Practice 1, a white box' },
        { name: 'Any odd factor is odd', step: 2, looks: '{chart.ca} × {chart.cb} left white', fix: 'One even number is enough.', option: '', caught: 'Exit b' },
        { name: 'Columns only', step: 1, looks: 'The {exit.0.ec} column shaded, the {exit.0.er} row white', fix: 'Rows first, then columns: finger on each header.', option: '', caught: 'Exit a' },
    ],
    checkQuestion: { want: ['chartMixed', 'chartRowOnly'], first: true, correct: 'C', ref: CHART({ gridFresh: true, allTest: 'chartFresh' }, { winRows: 2, winCols: 3, band: 144 }) },

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
                { ask: '{ns.B.0.text}', note: 'Expected: [[{ns.B.0.ans}]].' },
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
                { do: 'Build {chart.wa} rows of {chart.wb} cubes.' },
                { say: '{chart.er} is even. Every box in that row is even.', note: 'Step 1: shade the row.' },
                { ask: 'What about the {chart.ec} column?', note: 'Expected: even. Shade the column.' },
                { say: '{chart.ca} is odd. {chart.cb} is even. So {chart.cp} is even.', note: 'Step 2, the Critical Atom: one is enough.' },
                { say: '{chart.oa} and {chart.ob} are both odd. So {chart.op} is odd.', note: 'Leave it white. Contrast only.' },
                { do: 'Point to {chart.wa} × {chart.wb} = {chart.wp}: the cubes. Split them into two equal parts.' },
                { say: '{chart.wp} is {chart.wh} and {chart.wh}: two equal parts.', note: 'Why it is even: it splits into two equal parts.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 7, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: "Check the row AND the column."' }],
            rows: [
                { say: 'Finger on the row number. Finger on the column number.' },
                { ask: 'Is one of them even?', note: 'Listen for "row or column".' },
                { do: 'Pupils shade the first window with you, row by row.', note: 'Expected ★: [[{we.0.shaded}]].' },
                { say: '{we.0.ca} is odd. {we.0.cb} is even. So {we.0.cp} is even.', note: 'The odd row: its even column.' },
                { do: 'Pupils shade the second window alone, row by row.', note: 'Expected ★: [[{we.1.shaded}]].' },
                { ask: 'Which boxes stay white?', note: 'Both numbers odd: [[{we.1.white}]].' },
                { do: 'Pupils do the two Independent windows under the Guided cells.', note: 'Circulate: a white box with an even number?' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Draw the window rows {cq.rows} × columns {cq.cols} three times. Shade A: {cq.A} · B: {cq.B} · C: {cq.C}.' },
                { ask: 'Which shading is right? Show fingers.', note: 'Correct: [[{cq.right}]]. {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Re-show the odd row with an even column, then one more.', fewer: 'Back to the cubes: {chart.wa} rows of {chart.wb}, two equal parts.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 9, page: 'P4', boxes: [{ kind: 'watch', title: 'The last row', text: 'Walk to the last row first. {p4.last}.' }],
            rows: [
                { do: 'Pupils do Practice 1. {p4.steps}' },
                { do: 'Circulate. Point at every white box.', note: 'Ask: "Row odd? Column odd?"' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'How many apples? Even or odd?', note: 'Expected: [[{wp.p}]], [[{wp.parity}]].' },
                { say: '{wp.a} is even. So {wp.p} is even.', note: 'The Say line on the page: one even number is enough.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 5, page: 'P6',
            rows: [
                { say: 'If one number is even, the product is even.', note: 'The Remember line. Say it twice.' },
                { do: 'Hand out the exit slip. No help. Sort by the boxes ticked.', note: 'a. [[{exit.0.shaded}]] · b. [[{exit.1.shaded}]] · c. [[{exit.2.shaded}]].' },
                { say: 'Tomorrow we use rules to make number patterns.' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'A shade drawn as a hatch, a fill or a ring around the number.',
        'Word problem: the product and "even"; the drawing may be groups or equal parts.',
        'A box shaded by mistake and crossed out: mark the pupil\'s last choice.',
        'A window is right only when every box is right: shaded even, white odd.',
        'The Say lines are spoken, not marked: listen for "row or column" and "even".',
    ],
    wrongAnswers: [
        { wrote: '{exit.1.wrong.rowonly}', mistake: 'Row only', next: '"Row OR column?" Finger on every even header.' },
        { wrote: '{exit.2.wrong.oddoddshaded}', mistake: 'Odd × odd = even', next: 'Count the pairs: one is left over.' },
        { wrote: '{exit.1.cp} left white ({exit.1.ca} is odd)', mistake: 'Any odd factor is odd', next: 'One even number is enough.' },
        { wrote: '{exit.0.trap} left white (its tens digit is odd)', mistake: 'Tens digit decides', next: 'Cover the tens. Read the ones.' },
        { wrote: 'The even columns shaded, the {exit.0.er} row white', mistake: 'Columns only', next: 'Rows first, then columns: finger on each header.' },
        { wrote: 'Word problem: {wp.p}, "odd"', mistake: 'Any odd factor is odd', next: 'Find one even number: {wp.a}. So {wp.p} is even.' },
        { wrote: 'Word problem: {wp.sum}', mistake: 'Added the numbers', next: '{wp.a} groups of {wp.b}: draw the groups, then multiply.' },
    ],
};
