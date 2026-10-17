// js/modules/lessons/detailed/g4-nbt1-ten-times-value.js
// DETAILED LESSON 6 (owner list 2026-10-16): Grade 4, "Place value: 10 times and one tenth of a digit's
// value" - CCSS 4.NBT.A.1 (the owner sheet adds 5.NBT.A.1; this lesson stays with WHOLE numbers - the
// one-tenth direction is "the same digit one place to the right is worth one tenth as much"), EE
// M.EE.5.NBT.1 (Wisconsin: "4.NBT.1: use M.EE.5.NBT.1"). Content follows
// design/lesson-planner/lessons/g4-nbt1-ten-times-value/RESEARCH.md.
//
// Built for it (build list value_ten_times): placevalue:value form "times" with the options tenDir,
// tenValues, tenPlain (gen-pv.js genTimesValue), the kit template `pv-times` (a two-row place chart, a
// worth box beside each row, the ring sentence; its stepState draws the chart), the provider branch
// (sheet/providers/pv.js: steps, wrong answers M-T1 / M-V2 / M-V14), the case tests ten* (roles/lesson.js).
// All of them read the item's rows as strings with places, so lesson 9 (5.NBT.A.1, decimals) reuses them.
// See the format in ./index.js. Pure data (no DOM, no state). Every number a script speaks is a
// {placeholder} filled from the DEALT items.

// (`spreadMax` 2: no digit on more than two of the pack's items - critic r1 D2)
const TEN = (opts, extra) => Object.assign({ categoryId: 'placevalue', skillId: 'value', spreadMax: 2, opts: Object.assign({ form: 'times', band: 9999, tenDir: 'both', tenValues: true, tenPlain: false }, opts || {}) }, extra || {});
const PV = (skillId, opts, extra) => Object.assign({ categoryId: 'placevalue', skillId, opts: opts || {} }, extra || {});
const fmt = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });
const WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

export default {
    id: 'g4-nbt1-ten-times-value',
    title: 'I Can find 10 times and one tenth',
    grade: '4',
    level: 4,
    strand: 'Place Value',
    ccss: ['4.NBT.A.1'],
    // The owner sheet also lists 5.NBT.A.1 (the same idea with decimals: lesson 9, built later).
    ccssOwnerList: ['4.NBT.A.1', '5.NBT.A.1'],
    ee: ['M.EE.5.NBT.1'],
    eeOwnerList: ['M.EE.5.NBT.1'],
    eeNote: 'Wisconsin files 4.NBT.1 as "use M.EE.5.NBT.1"',
    cra: 'Pictorial → Abstract',
    flowNote: 'One chunk: 10 times first, then one tenth; the same chart every time.',
    followOn: [
        { title: 'Ten times and one tenth with decimals', skill: 'placevalue:value', opts: { form: 'times' }, ccss: '5.NBT.A.1' },
        { title: 'Multiply and divide by 10, 100 and 1,000', skill: 'placevalue:place_value_10x', opts: {}, ccss: '5.NBT.A.2' },
    ],

    // ------------------------------------------------------------------ the practice skill
    // The same digit in two numbers to 9,999, one place apart: write both values, circle 10 times or one tenth.
    skill: TEN({}, { allTest: 'tenMixed' }),
    edgeTest: 'tenEdge',
    practicePages: 2,
    practiceSheets: [
        { steps: true, skill: TEN({}, { allTest: 'tenMixed' }), shape: [4, 1], edgeLast: { per: 4, cols: 1, wants: ['tenThouTenth'] } },
        // Practice 2: the same steps, numbers to 99,999 (the one new thing: bigger numbers).
        { steps: true, skill: TEN({ band: 99999 }, { allTest: 'tenMixed' }), shape: [4, 1], edgeLast: { per: 4, cols: 1, wants: ['tenOnesTimes'] } },
    ],

    vars: (q) => {
        const pc = (q && q.cell && q.cell.payload) || {};
        if (pc.kind === 'compare') return { big: fmt(Math.max(Number(pc.a), Number(pc.b))) };
        const p = q && q.pv;
        if (!p || p.kind !== 'times') return {};
        const n = fmt(p.n), m = fmt(p.m);
        return {
            d: p.digit, nF: n, mF: m, v0: fmt(p.v0), v1: fmt(p.v1), rel: p.rel,
            place: WORD[p.place] || fmt(p.place), placeM: WORD[p.placeM] || fmt(p.placeM),
            relShort: p.dir === 'times' ? '10 times' : 'one tenth',
            big: fmt(Math.max(p.v0, p.v1)), small: fmt(Math.min(p.v0, p.v1)),
            sent: `The ${p.digit} in ${n} is ${p.rel} the ${p.digit} in ${m}`,
            sentQ: `The ${p.digit} in ${n} is ___ the ${p.digit} in ${m}`,
            worths: `${fmt(p.v0)} and ${fmt(p.v1)}, ${p.rel}`,
            eqN: 10, wpAns: 10, eqParts: [fmt(Math.max(p.v0, p.v1)), fmt(Math.min(p.v0, p.v1))], eqOp: '÷',
        };
    },

    lessonData: {
        skills: [],
        concepts: [
            { id: 'left', text: 'One place left: 10 times as much.' },
            { id: 'right', text: 'One place right: one tenth as much.' },
        ],
        vocab: [
            { word: 'digit', meaning: 'one of 0 to 9', picture: { kind: 'glyph', text: '7' } },
            { word: 'value', meaning: 'what a digit is worth', picture: { kind: 'text', text: '7 in 70 → 70' } },
            { word: 'one tenth', meaning: '1 of 10 equal parts', picture: { kind: 'text', text: '700 ÷ 10 = 70' } },
        ],
        steps: [
            { icon: 'write', text: 'Write what each digit is worth.' },
            { icon: 'decide', text: 'Bigger value: 10 times. Smaller: one tenth.' },
        ],
        chant: 'Left is ten times. Right is one tenth.',
        chartWide: true,
        guidedRows: 2,
        format: {
            kind: 'numbered steps with icons + a chant',
            why: 'Writing both values first makes the comparison a comparison of numbers, not of digits: the 7 and the 7 look the same.',
        },
        example: { test: 'tenChart' },
        second: { test: 'tenTenthOther', label: 'One place right? One tenth.' },
        guided: ['tenTimesMid', 'tenTenthMid'],
        practiceShape: [4, 1],
        mixWith: [],
    },

    // ------------------------------------------------------------------ P0 Prerequisite Check
    prerequisites: [
        { atom: 1, items: 4, ref: PV('identify', { band: 999, response: 'circle' }), lesson: { id: '4.NBT.A.2', title: 'Name the place of a digit' } },
        { atom: 2, items: 4, ref: PV('value', { band: 9999, form: 'value' }), lesson: { id: '4.NBT.A.2', title: 'The value of a digit' } },
        { atom: 3, items: 4, ref: PV('place_value_10x', { op: 'x', power: [10], band: 1000 }), lesson: { id: '3.NBT.A.3', title: 'Multiply by 10' } },
        { atom: 4, items: 4, ref: PV('place_value_10x', { op: '/', power: [10], band: 1000 }), lesson: { id: '4.NBT.B.6', title: 'Divide by 10' } },
    ],

    // ------------------------------------------------------------------ P1 Number sense
    numberSense: {
        A: { items: [PV('more_less_100', { step: 10, dir: 'more' }, { minNum: 120, maxNum: 880 }), PV('compare', { band: 999, closeness: 'far' }, { minNum: 100 }),
            PV('more_less_100', { step: 100, dir: 'less' }, { minNum: 200, maxNum: 980 }), PV('more_less_100', { step: 100, dir: 'more' }, { minNum: 120, maxNum: 880 }),
            PV('more_less_100', { step: 10, dir: 'less' }, { minNum: 120, maxNum: 880 })] },
        B: { items: [PV('more_less_100', { step: 10, dir: 'more' }, { minNum: 891, maxNum: 899 }), PV('compare', { band: 999, closeness: 'close' }, { minNum: 100 }),
            PV('more_less_100', { step: 100, dir: 'less' }, { minNum: 101, maxNum: 199 }), PV('more_less_100', { step: 100, dir: 'more' }, { minNum: 801, maxNum: 899 }),
            PV('more_less_100', { step: 10, dir: 'less' }, { minNum: 301, maxNum: 309 })] },
    },

    // ------------------------------------------------------------------ P5 Word problem
    wordProblem: {
        // (r2, owner skill-coverage rule: the story is the skill's own item - value form times, tenTask story)
        ref: TEN({ tenTask: 'story', tenDir: 'times', band: 9999 }),
        want: ['tenThou'],
        instruction: 'Read the story. Draw it. Solve.',
        answerLine: '',
        say: 'Mia has __ times as many.',
        sayAns: '{wp.eqN}',
    },

    // ------------------------------------------------------------------ P6 Exit slip
    // Three items: four of the chart-and-sentence cells do not fit a 132.5 mm half (never shrunk).
    exit: [
        // (r2, critic D3: every item writes a value - the top row's - then rings; one worth box so a 132.5 mm half holds three)
        { case: '10 times, hundreds and tens', ref: TEN({ tenDir: 'times', tenWrite: 'top' }, { cellPayload: { sayTwo: true } }), want: 'tenTimesMid', instr: 'Write the top value. Circle 10 times or one tenth.', detects: 'Writes the digit as its value: 4 for 400.' },
        { case: 'one tenth (Critical Atom: the other way)', ref: TEN({ tenDir: 'tenth', tenWrite: 'top' }, { cellPayload: { sayTwo: true } }), want: 'tenTenthMid', instr: 'Write the top value. Circle 10 times or one tenth.', detects: 'Right value, then 10 times circled: the smaller value read as 10 times.' },
        { case: 'one tenth, thousands and hundreds', ref: TEN({ tenDir: 'tenth', tenWrite: 'top' }, { cellPayload: { sayTwo: true } }), want: 'tenThouTenth', instr: 'Write the top value. Circle 10 times or one tenth.', detects: 'Uses the place next to it: a thousands value for a hundreds digit.' },
    ],
    exitInstruction: 'Write the top value. Circle 10 times or one tenth.',
    exitSay: 'Left is ten times. Right is one tenth.',
    exitSayItem: 0,

    // ------------------------------------------------------------------ retrieval (MWB)
    retrieval: [
        { ref: { categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [10] } }, ask: '{ret.0.text}' },
        { ref: PV('unit_form', { band: 999 }), ask: '{ret.1.text}' },
        { ref: PV('compare', { band: 999, closeness: 'close' }, { minNum: 100 }), ask: 'Which is bigger: {ret.2.a} or {ret.2.b}?' },
    ],

    // ------------------------------------------------------------------ T1
    t1Boxes: [
        { kind: 'tip', title: 'Values first', text: 'The two digits look the same. Their values do not: write both values first.' },
        { kind: 'language', title: 'One tenth', text: 'Say “one tenth of”: 70 is one tenth of 700. Ten tenths make one whole.' },
        { kind: 'watch', title: 'The other way', text: 'The mistake to stop today: “10 times” for every pair, whichever is bigger.' },
    ],
    slotRows: [{ shape: 'ring', use: 'circle 10 times or one tenth of' }],
    caseNames: { tenThouTenth: 'one tenth, thousands and hundreds', tenOnesTimes: 'ones and tens, 10 times', tenTimes: '10 times', tenTenth: 'one tenth' },
    routeNote: 'No site lesson exists yet for these prerequisites: T6 names a CCSS code and a short title (V22 Appendix H).',
    materials: ['Base-ten blocks: cubes, rods, flats, a big cube', 'A Th H T O place chart on the board', 'Mini whiteboards and pens', 'Pupil packet, one per pupil', 'Exit slips, cut in half'],
    vocabulary: [
        { word: 'digit', gloss: 'one of 0 to 9', diagram: { kind: 'digit', text: '7' } },
        { word: 'value', gloss: 'what a digit is worth', diagram: { kind: 'text', text: '7 tens = 70' } },
        { word: 'one tenth', gloss: '1 of 10 equal parts', diagram: { kind: 'text', text: '700 ÷ 10' } },
    ],

    // ------------------------------------------------------------------ T2 Atomisation template
    atoms: [
        { type: 'Fact', prereq: true, skill: 'Places: O, T, H, Th', notes: 'Prerequisite Check {pre.0.letters}.' },
        { type: 'Conceptual', prereq: true, skill: 'Value: the 7 in 740 is 700', notes: 'Prerequisite Check {pre.1.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Times 10: 70 × 10 = 700', notes: 'Prerequisite Check {pre.2.letters}.' },
        { type: 'Fact', prereq: true, skill: 'Divide by 10: 700 ÷ 10 = 70', notes: 'Prerequisite Check {pre.3.letters}.' },
        { type: 'Conceptual', critical: true, skill: 'One place left: 10 times', notes: '10 ones make 1 ten; 10 tens make 1 hundred.' },
        { type: 'Comparative', skill: 'Left or right: 10 times or one tenth', notes: 'Compare the values, not the digits.' },
        { type: 'Category', skill: 'Any place: always 10', notes: 'Th and H, H and T, T and O: each is 10 times.' },
        { type: 'Conceptual', skill: 'One tenth: 10 equal parts', notes: '70 is one tenth of 700: 700 ÷ 10 = 70.' },
    ],
    routine: [
        { step: 'Find the digit in each row. Read its place.', tag: 'Pre-requisite', check: 'Prerequisite Check: places' },
        { step: 'Write what each digit is worth.', tag: 'New', check: 'Every worth box filled' },
        { step: 'Bigger value: 10 times. Smaller: one tenth.', tag: 'New', critical: true, check: 'Check Question; exit b' },
    ],
    howToTeach: 'Build it with blocks first: 10 rods make a flat. Then the chart: the same digit one column left is worth 10 times as much. Model 10 times, then the same pair read the other way: one tenth.',
    board: 'Th H T O chart: {chart.nF} over {chart.mF}, the {chart.d}s underlined.',
    mistakes: [
        { name: 'Wrong way round', step: 3, looks: '“{cq.A}” for {cq.v0} and {cq.v1}', fix: 'Which value is bigger?', option: 'A', misconception: 'M-T1' },
        { name: 'Same digit, same value', step: 2, looks: '“{cq.B}” for {cq.v0} and {cq.v1}', fix: '“What is each {cq.d} worth?”', option: 'B', misconception: 'M-V2' },
        { name: 'Counted two places', step: 1, looks: '“{cq.C}” for {cq.v0} and {cq.v1}', fix: 'Point: one column apart.', option: 'C', misconception: 'M-V14' },
        { name: 'Digit, not value', step: 2, looks: '{we.1.d} and {we.1.d} for {we.1.v0} and {we.1.v1}', fix: 'Write the zeros: the place.', option: '', caught: 'Guided 2 · Practice 1' },
    ],
    checkQuestion: { want: 'tenTimesMid', ref: TEN({ tenValues: false }), correct: 'D', show: (v) => String(v).replace(/ \(.*\)$/, '') },

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
                { ask: '{ns.A.0.text}', note: 'Expected: [[{ns.A.0.ans}]]. Band B: the same five kinds, crossing a hundred.' },
            ] },
        { n: 3, name: 'Spaced retrieval', min: 3, page: '',
            rows: [
                { do: 'Pupils hold mini whiteboards. Write each question on the board.' },
                { ask: '{ret.0.ask}', note: 'Expected: [[{ret.0.ans}]].' },
                { ask: '{ret.1.ask}', note: 'Expected: [[{ret.1.ans}]].' },
                { ask: '{ret.2.ask}', note: 'Expected: [[{ret.2.big}]].' },
            ] },
        { n: 4, name: 'Chaining bridge', min: 2, page: '',
            rows: [
                { say: 'You know what a digit is worth.' },
                { say: 'Today: the same digit in two places. Which is worth more?' },
            ] },
        { n: 5, name: 'I Do: the anchor chart', min: 10, page: 'P2', boxes: [{ kind: 'watch', title: 'Same digit', text: 'Pupils who say “they are the same” are looking at digits. Ask for values.' }],
            rows: [
                { do: 'Show 10 rods next to 1 flat. They match.', note: '10 tens is 1 hundred.' },
                { do: 'Put anchor chart up. Point to {chart.nF} and {chart.mF}.' },
                { say: 'The {chart.d} in {chart.nF} is in the {chart.place} place.', note: 'Step 1: worth [[{chart.v0}]].' },
                { say: 'The {chart.d} in {chart.mF} is in the {chart.placeM} place.', note: 'Step 1 again: worth [[{chart.v1}]].' },
                { say: '{chart.v0} is 10 times {chart.v1}. One place left.', note: 'Step 2: circle [[10 times]].' },
                { say: 'Now the other way: {chart2.v0} is one tenth of {chart2.v1}.', note: 'Another example. Circle [[one tenth of]].' },
                { say: 'Any two places side by side: 10 times.', note: 'Point along the Th H T O heads.' },
            ] },
        { n: 6, name: 'We Do: Guided Practice', min: 8, page: 'P3', boxes: [{ kind: 'feedback', title: 'Fix it at once', text: 'Fix: cover one row. “What is this {we.0.d} worth?”' }],
            rows: [
                { say: 'Look at {we.0.nF} and {we.0.mF}. Step 1 is in grey.' },
                { ask: 'What is each {we.0.d} worth?', note: 'Expected ★: [[{we.0.v0}]], [[{we.0.v1}]]; circle [[{we.0.rel}]].' },
                { do: 'Pairs do cell 2: {we.1.nF} and {we.1.mF}.', note: 'Expected ★: [[{we.1.worths}]].' },
                { ask: 'Cell 2: is the top value bigger or smaller?', note: 'Smaller, so [[one tenth of]].' },
                { do: 'Pupils do the Independent Practice. Walk and check.', note: 'Expected ★★: [[{indepList}]].' },
                { say: 'Left is ten times. Right is one tenth.', note: 'The chant. Say it twice together.' },
            ] },
        { n: 7, name: 'Check Question', min: 3, page: '',
            rows: [
                { do: 'Write on the board: {cq.sentQ}. A: {cq.A} · B: {cq.B} · C: {cq.C} · D: {cq.D}.' },
                { ask: 'Which words fit the blank? Show fingers.', note: 'Correct: [[{cq.right}]]. Each wrong option is one T2 mistake: {cq.why}' },
            ],
            loop: { most: 'Go on to You Do.', half: 'Reteach with rods and a flat, then two more pairs.', fewer: 'Stop. Build {chart.v1} and {chart.v0} with blocks. Count the rods.' } },
        { n: 8, name: 'You Do: Independent Practice', min: 12, page: 'P4', boxes: [{ kind: 'watch', title: 'The last rows', text: 'Walk to the last rows first: {p4.last}.' }],
            rows: [
                { do: 'Pupils finish the lesson sheet, then Practice 1 and 2.' },
                { say: '{p4.steps}' },
                { ask: 'Which value is bigger?', note: 'Visit pupils who circle 10 times every time.' },
                { do: 'Practice 2: the same steps, numbers to 99,999.', note: 'Look for the digit written in a worth box.' },
            ] },
        { n: 9, name: 'Word problem', min: 4, page: 'P5',
            rows: [
                { do: 'Read the story aloud two times. Pupils tick each box.' },
                { ask: 'What is each {wp.d} worth?', note: 'Expected: [[{wp.v0}]] and [[{wp.v1}]].' },
                { ask: 'How many times as much?', note: 'Expected: [[{wp.v0} ÷ {wp.v1} = 10]]: 10 times.' },
            ] },
        { n: 10, name: 'Plenary and exit slip', min: 4, page: 'P6',
            rows: [
                { say: 'Left is ten times. Right is one tenth.', note: 'Say the chant together twice.' },
                { do: 'Hand out the exit slip. No help. Sort the slips by item b.', note: 'a. [[{exit.0.v0}]], [[{exit.0.rel}]] · b. [[{exit.1.v0}]], [[{exit.1.rel}]] · c. [[{exit.2.v0}]], [[{exit.2.rel}]].' },
            ] },
    ],
    transitionsMin: 4,

    // ------------------------------------------------------------------ T6
    accepted: [
        'A value written with or without its comma (7000 or 7,000) is right.',
        'Said aloud: “ten times as much”, “times 10” and “a tenth of” are all right.',
        'A right ring with an empty worth box: not yet right; ask “what is it worth?”.',
    ],
    wrongAnswers: [
        // (each row an answer the slip can show: two values and a ring - critic r1 D3)
        { wrote: '{exit.0.wrong.MV2} for {exit.0.nF} and {exit.0.mF} (exit a)', mistake: 'Digit, not value', next: 'Cover one row; write its value.' },
        { wrote: '{exit.1.wrong.MT1} for {exit.1.nF} and {exit.1.mF} (exit b)', mistake: 'Wrong way round', next: '“Which value is bigger?” first.' },
        { wrote: '{exit.2.wrong.MV14} for {exit.2.nF} and {exit.2.mF} (exit c)', mistake: 'Place next to it', next: 'Point to the heads: read the place.' },
        { wrote: '“{cq.wrong.MT1}” for {cq.v0} and {cq.v1} (Check Question)', mistake: 'Wrong way round', next: 'Rods and a flat: which is more?' },
    ],
};
