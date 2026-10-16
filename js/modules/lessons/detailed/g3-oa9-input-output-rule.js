// js/modules/lessons/detailed/g3-oa9-input-output-rule.js
// DETAILED LESSON 5 (owner list 2026-10-16): Grade 3, "Find the rule in an input-output table" -
// CCSS 3.OA.D.9, EE M.EE.3.OA.8 (the repo's EE for "Identify arithmetic patterns"; the owner list,
// DLM v4, names M.EE.3.OA.9 - see eeOwnerList / eeNote). Content follows
// design/lesson-planner/lessons/g3-oa9-input-output-rule/RESEARCH.md: one-step + / − / × rules
// (algebra:function_table_easy, ftTask 'rule'), three rows, the kit rule frame (a circle for the
// sign, a box for the number); "add 3" is SAID only. Overlap with lesson 4 avoided: no
// multiplication chart, no even/odd property. See the format in ./index.js. Pure data (no DOM, no
// state). Every number a script speaks is a {placeholder} filled from the DEALT items.
//
// NEEDS (not built here, listed for the lead): the CASE_TESTS ftAdd / ftSub / ftTimes / ftTimesTrap
// in sheet/roles/lesson.js; the option ftTrap (RESEARCH §3 proposal 1) so ftTimesTrap is dealt, not
// found by chance; SKILL_STANDARDS 3.OA.D.9 + M.EE.3.OA.8 on function_table_easy (the bridge checks
// ccss / ee against the skill's tags); the C.4 Remember string 'one-pair'.

const FT = (opts, extra) => Object.assign({ categoryId: 'algebra', skillId: 'function_table_easy', opts: Object.assign({ ftTask: 'rule', ftRules: ['+', '-', 'x'], band: 20, ftTable: 31, support: 'frame' }, opts || {}) }, extra || {});
// P1 bank types: earlier content only (place value and count-on patterns), never today's rule-finding.
const NS = (categoryId, skillId, opts, extra) => Object.assign({ categoryId, skillId, opts }, extra || {});
const GLYPH = { '+': '+', '-': '−', x: '×', '/': '÷' };

export default {
    id: 'g3-oa9-input-output-rule',
    title: 'I Can find the rule in a table',
    grade: '3',
    level: 3,
    strand: 'Algebra',
    ccss: ['3.OA.D.9'],
    ee: ['M.EE.3.OA.8'],
    // The owner's list (DLM v4) names M.EE.3.OA.9; the repo's EE set files this standard's EE as .8.
    eeOwnerList: ['M.EE.3.OA.9'],
    eeNote: 'owner list (DLM v4) vs repo EE set',
    cra: 'Concrete → Pictorial',
    flowNote: 'One chunk: + rules, then − rules, then × rules; test every row.',
    followOn: [
        { title: 'Input-output stories: find the rule', skill: 'algebra:function_table_story', opts: {}, ccss: '3.OA.D.9' },
        { title: 'Find the missing In number', skill: 'algebra:function_table_easy', opts: { ftTask: 'inputs' }, ccss: '4.OA.C.5' },
    ],

    // ------------------------------------------------------------------ the practice skill
    // Find the one-step rule of a 3-row table (+, − or ×), numbers to 20, In in order, frame + machine.
    skill: FT(),
    // The ★★★ last row: a × table whose first row also fits a + rule (2 → 4), and a − rule.
    edgeTest: 'ftTimesTrap',
    practicePages: 2,
    // Practice 1: + and − rules (★, ★★). Practice 2: × then mixed, numbers to 50, In out of order,
    // the machine picture faded (★★★).
    practiceSheets: [
        { skill: FT({ ftRules: ['+', '-'] }), shape: [6, 2] },
        { skill: FT({ ftRules: ['+', '-', 'x'], band: 50, ftTable: 32, support: 'frame-bare' }), shape: [6, 2], edgeLast: { per: 6, cols: 2, wants: ['ftTimesTrap', 'ftSub'] } },
    ],
    // Mixed: earlier content only (use a given rule, count-on patterns, facts).
    mixed: { skills: [
        FT({ ftTask: 'outputs', ftRules: ['+', '-'] }),
        { categoryId: 'patterns', skillId: 'number_patterns_rule', opts: { pattern: ['add', 'sub'], places: [1], rule: false } },
        { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 } },
        { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 20 } },
    ], strip: false },

    // The lesson's own placeholder names: one table's rows and rule (the function-table payload).
    vars: (q) => {
        const p = (q && q.cell && q.cell.template === 'function-table' && q.cell.payload) || (q && q.ftCheck) || null;
        if (!p || !Array.isArray(p.rows) || p.rows.length < 3 || !Array.isArray(p.rule) || !p.rule.length) return {};
        const [r1, r2, r3] = p.rows;
        const s = p.rule[0];
        const sign = GLYPH[s.op] || s.op;
        const d = Math.abs(r1.y - r1.x);
        const next = Math.max(r1.x, r2.x, r3.x) + 1;
        const nextOut = s.op === 'x' ? next * s.n : s.op === '+' ? next + s.n : next - s.n;
        return {
            x1: r1.x, y1: r1.y, x2: r2.x, y2: r2.y, x3: r3.x, y3: r3.y,
            sign, k: s.n, rule: `${sign} ${s.n}`, d, plus: r2.x + d,
            word: s.op === 'x' ? 'times' : s.op === '-' ? 'take away' : 'add',
            rows: `${r1.x} → ${r1.y}, ${r2.x} → ${r2.y}, ${r3.x} → ${r3.y}`,
            next, nextOut, eqParts: [next, s.n], eqOp: sign,
        };
    },

    // The anchor chart / lesson sheet data (roles/lesson.js).
    lessonData: {
        skills: [],
        concepts: [
            { id: 'every', text: 'The rule must work for every row.' },
            { id: 'across', text: 'Read across: In, then Out.' },
        ],
        vocab: [
            { word: 'In', meaning: 'the number that goes in', picture: { kind: 'text', text: '4 →' } },
            { word: 'Out', meaning: 'the number that comes out', picture: { kind: 'text', text: '→ 7' } },
            { word: 'rule', meaning: 'what the machine does to every number', picture: { kind: 'text', text: '4 → + 3 → 7' } },
        ],
        steps: [
            { icon: 'look', text: 'Look at In and Out.' },
            { icon: 'decide', text: 'Find the change.' },
            { icon: 'check', text: 'Test every row.' },
        ],
        // No chant (research §4): the three steps are said in the Say band.
        chant: '',
        guidedRows: 2,
        practiceShape: [6, 2],
        format: {
            kind: 'numbered steps with icons',
            why: 'The step pupils skip is step 3: a rule read off row 1 alone. Panel 3 shows it failing.',
        },
        // Panel 1: a + rule; panel 2: a − rule; panel 3: the × table whose row 1 suggests + (the trap).
        example: { match: 'Test', test: 'ftAdd' },
        second: { test: 'ftSub', label: 'Out smaller? Try −.' },
        third: { test: 'ftTimesTrap', label: '+ fails on row 2? Try ×.' },
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, items: 2, ref: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 }, minNum: 11, maxNum: 20 },
            lesson: { id: '2.OA.B.2', title: 'Add within 20' } },
        { atom: 2, items: 2, ref: { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 20 } },
            lesson: { id: '2.OA.B.2', title: 'Subtract within 20' } },
        { atom: 3, items: 3, ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [2, 5, 10] } },
            lesson: { id: '3.OA.C.7', title: 'Multiply by 2, 5 and 10' } },
        { atom: 4, items: 1, ref: FT({ ftTask: 'outputs', ftRules: ['+'] }),
            lesson: { id: '4.OA.C.5', title: 'Use a rule to fill a table' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    // Five bank types, one a row, the same order in A and B; B the harder numbers.
    numberSense: {
        A: { items: [
            NS('placevalue', 'more_less_10', { step: 10, dir: 'more', band: 100 }, { maxNum: 60 }),
            NS('placevalue', 'compare', { band: 99, closeness: 'far' }),
            NS('patterns', 'number_patterns_rule', { pattern: ['add'], places: [1], rule: false }),
            NS('placevalue', 'more_less_10', { step: 10, dir: 'less', band: 100 }, { maxNum: 60 }),
            NS('patterns', 'number_patterns_rule', { pattern: ['sub'], places: [10], rule: false }),
        ] },
        B: { items: [
            NS('placevalue', 'more_less_10', { step: 10, dir: 'more', band: 100 }, { minNum: 61 }),
            NS('placevalue', 'compare', { band: 99, closeness: 'close' }),
            NS('patterns', 'number_patterns_rule', { pattern: ['add'], places: [10], rule: false }),
            NS('placevalue', 'more_less_10', { step: 10, dir: 'less', band: 100 }, { minNum: 61 }),
            NS('patterns', 'number_patterns_rule', { pattern: ['sub'], places: [10], rule: false }, { minNum: 50 }),
        ] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    // No skill deals a story read from a table (proposal algebra:function_table_story). Our own
    // story; its numbers are a dealt × table (no trap) and one more In past the table.
    wordProblem: {
        ref: FT({ ftRules: ['x'], band: 50 }),
        want: 'ftTimes',
        instruction: 'Read the story. Draw it. Solve.',
        lines: ['A machine makes toy cars.', 'Put in {wp.x1} boxes, get {wp.y1} cars.', 'Put in {wp.x2} boxes, get {wp.y2} cars.', 'Put in {wp.x3} boxes, get {wp.y3} cars.', 'What is the rule? How many cars for {wp.next} boxes?'],
        answerLine: 'The rule is __. {wp.next} boxes make __ cars.',
        say: 'The rule is __. The answer is __ cars.',
    },

    // ------------------------------------------------------------------ P6 Exit slip
    // One item per rule kind taught, then the Critical Atom's case (row 1 also fits +).
    exit: [
        { case: 'a + rule', ref: FT({ ftRules: ['+'] }), want: 'ftAdd', instr: 'Find the rule. Write the rule.', detects: 'Reads down the Out column: the gap between Outs.' },
        { case: 'a − rule', ref: FT({ ftRules: ['-'] }), want: 'ftSub', instr: 'Find the rule. Write the rule.', detects: 'Sign flipped: + when Out is smaller.' },
        { case: 'a × rule', ref: FT({ ftRules: ['x'], band: 50 }), want: 'ftTimes', instr: 'Find the rule. Write the rule.', detects: 'Adds for times: + read off row 1.' },
        { case: 'row 1 also fits + (Critical Atom)', ref: FT({ ftRules: ['x'], band: 50 }), want: 'ftTimesTrap', instr: 'Find the rule. Write the rule.', detects: 'One pair only: never tests row 2.' },
    ],
    exitInstruction: 'Find the rule. Write the rule.',
    exitSay: 'In {say.x1}, out {say.y1}. The rule is __.',

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [2, 5, 10] } }, ask: '{ret.0.text}' },
        { ref: { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 20 }, minNum: 11 }, ask: '{ret.1.text}' },
        { ref: { categoryId: 'placevalue', skillId: 'more_less_10', opts: { step: 10, dir: 'more', band: 100 }, maxNum: 89 }, ask: '{ret.2.text}' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Read across', text: 'Read a row across, In then Out. Never down the Out column.' },
        { kind: 'language', title: 'Say the rule', text: 'Pupils write a sign and a number. They SAY “add 3” or “times 2”.' },
        { kind: 'watch', title: 'One row is not enough', text: '2 → 4 fits + 2 and × 2. Test every row, aloud.' },
    ],
    slotRows: [{ shape: 'rule frame', use: 'the sign in the circle, the number in the box' }],
    caseNames: { ftTimesTrap: 'row 1 also fits +', ftSub: 'a − rule', ftTimes: 'a × rule', ftAdd: 'a + rule' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['A paper “rule machine” box with In and Out slots', 'Number cards 1 to 20', 'Reading strips (card to cover the other rows)', 'Mini whiteboards and pens', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'In', gloss: 'the number that goes in', diagram: { kind: 'text', text: '4 →' } },
        { word: 'Out', gloss: 'the number that comes out', diagram: { kind: 'text', text: '→ 7' } },
        { word: 'rule', gloss: 'what the machine does to every number', diagram: { kind: 'text', text: '4 → + 3 → 7' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Add facts to 20', notes: 'Find a change fast. Prerequisite Check {pre.0.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Subtract facts to 20', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Fact', prereq: true, skill: '×2, ×5, ×10 facts', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Use a given rule', notes: 'Prerequisite Check {pre.3.letters} (4.OA.C.5).' },
        { type: 'Category', skill: 'In and Out: each row is a pair', notes: 'Read across, not down.' },
        { type: 'Comparative', skill: 'Bigger or smaller', notes: 'Out bigger: + or ×. Out smaller: −.' },
        { type: 'Conceptual', critical: true, skill: 'Test every row', notes: 'A rule from one row may be wrong (2 → 4).' },
        { type: 'Comparative', skill: '+ or ×', notes: '+ fails on row 2? Try ×.' },
    ],
    routine: [
        { step: 'Read In and Out across row 1.', tag: 'New', check: '“Point to In. Point to Out.”' },
        { step: 'Find the change: bigger or smaller, by how much.', tag: 'Pre-requisite', check: 'Prerequisite Check a to c' },
        { step: 'Test the rule on every row.', tag: 'New', critical: true, check: 'Check Question; exit slip d' },
        { step: 'Write the sign in the circle, the number in the box.', tag: 'Pre-requisite', check: 'Guided cell 2' },
    ],
    howToTeach: 'Feed cards through the rule machine first. Model + (the change is plain), then −, then a × table where “+ the change” fails on row 2: the failure is the lesson. Say the test aloud on every row.',
    board: 'The In / Out table {chart3.rows}. Write “Wrong” beside + {chart3.d}.',
    // Check Question options: the × item's provider wrong answers (sheet/providers/function-table.js).
    mistakes: [
        { name: 'One pair only', step: 3, looks: '{cq.A} for {cq.rows}', fix: 'Test row 2 aloud.', option: 'A', misconception: 'add-for-times' },
        { name: 'Down the Out column', step: 1, looks: '{cq.B} for {cq.rows}', fix: 'Reading strip: one row across.', option: 'B', misconception: 'neighbour-outputs' },
        { name: 'Sign flipped', step: 2, looks: '+ {exit.1.k} for {exit.1.rows}', fix: '“Bigger or smaller?”', option: '', caught: 'Exit b · Practice 1' },
        { name: 'Adds for times', step: 3, looks: '{exit.2.wrong.addfortimes} for {exit.2.rows}', fix: '+ fails on row 2: try ×.', option: '', caught: 'Exit c · Practice 2' },
    ],
    checkQuestion: { want: 'ftTimes', correct: 'C' },

    // ------------------------------------------------------------------ T3-T5 delivery scripts
    sections: [
        { n: 1, name: 'Prerequisite Check', min: 5, page: 'P0', boxes: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }],
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
        { n: 3, name: 'Spaced retrieval', min: 3, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.ans}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.ans}]].' },
                { ask: '{ret.2.ask}', note: 'Expected: [[{ret.2.ans}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 1, page: '',
            rows: [
                { say: 'Yesterday each times row went up by the same number.' },
                { say: 'Today the machine has a rule. We find it.' },
            ] },
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'The nodders', text: 'Pupils who nod at + {chart3.d} on panel 3 are the one-pair group.' }],
            rows: [
                { do: 'Feed card {chart.x1} into the rule machine. Show {chart.y1}.' },
                { say: 'In {chart.x1}, out {chart.y1}. It got bigger.', note: 'Step 1 and step 2.' },
                { ask: 'Bigger by how much?', note: 'Expected: [[{chart.d}]].' },
                { say: 'Test every row: {chart.x2} {chart.sign} {chart.k} is {chart.y2}.', note: 'Step 3. Then row 3. The rule: [[{chart.rule}]].' },
                { say: 'In {chart2.x1}, out {chart2.y1}. It got smaller.', note: 'Panel 2. The rule: [[{chart2.rule}]].' },
                { say: 'In {chart3.x1}, out {chart3.y1}. Plus {chart3.d}? Test row 2.', note: 'Panel 3: the trap.' },
                { say: '{chart3.x2} plus {chart3.d} is {chart3.plus}. Not {chart3.y2}. Try times.', note: 'Write “Wrong” beside + {chart3.d} on the board only.' },
                { say: 'The rule is {chart3.word} {chart3.k}. It works for every row.', note: 'Pupils repeat. The rule: [[{chart3.rule}]].' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: cover the other rows with the strip. “Test this row.”' }],
            rows: [
                { say: 'Look at {we.0.rows}. Step 1 is done in grey.' },
                { ask: 'Bigger or smaller? By how much?', note: 'Expected ★: [[{we.0.rule}]].' },
                { do: 'Pairs do {we.1.rows}: A reads a row, B tests it.', note: 'Expected ★: [[{we.1.rule}]].' },
                { say: 'In ___, out ___. The rule is ___.', note: 'The Say frame, for every row.' },
                { do: 'Pupils do the Independent Practice. Walk and check.', note: 'Expected ★★: [[{indepList}]].' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write the table on the board: {cq.rows}. A: {cq.A} · B: {cq.B} · C: {cq.C}.' },
                { ask: 'What is the rule? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach “test every row” with the machine, then two more.', fewer: 'Stop. Feed {chart3.x2} through the machine. Test + {chart3.d} together.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 12, page: 'P4', boxes: [{ kind: 'watch', title: 'The last rows', text: 'Walk to the last rows first: {p4.last}.' }],
            rows: [
                { do: 'Pupils finish the lesson sheet, then Practice 1 and 2. Mixed 1 is homework.' },
                { say: 'Use the Steps at the top of the page.' },
                { ask: 'Does it work on row 3?', note: 'Visit the one-pair group first.' },
                { do: 'Practice 2: In numbers out of order. Read each row across.', note: 'Look for the gap between Outs written as the rule.' },
            ] },
        { n: 9, name: 'Word problem', min: 5, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'Boxes in, cars out. What is the rule?', note: 'Expected: [[{wp.rule}]], tested on every row.' },
                { ask: 'How many cars for {wp.next} boxes?', note: 'Expected: [[{wp.nextOut}]] cars.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'The rule must work for every row.', note: 'Say it together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by item d.', note: 'a. [[{exit.0.rule}]] · b. [[{exit.1.rule}]] · c. [[{exit.2.rule}]] · d. [[{exit.3.rule}]].' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'The sign written + or “add”; × written x.',
        'One-step rules only: “+ 2 then …” is not the answer.',
        'Said aloud: “add 3”, “plus 3” and “3 more” are all right.',
    ],
    wrongAnswers: [
        { wrote: '{exit.3.wrong.addfortimes} for {exit.3.rows}', mistake: 'One pair only', next: 'Test row 2 aloud.' },
        { wrote: '{exit.0.wrong.neighbouroutputs} for {exit.0.rows}', mistake: 'Down the Out column', next: 'Reading strip: one row across.' },
        { wrote: '+ {exit.1.k} for {exit.1.rows}', mistake: 'Sign flipped', next: '“Bigger or smaller?” first.' },
        { wrote: '{exit.2.wrong.addfortimes} for {exit.2.rows}', mistake: 'Adds for times', next: '+ fails on row 2: try ×.' },
    ],
};
