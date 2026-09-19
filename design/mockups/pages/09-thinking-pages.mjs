// Thinking pages for a low writing load: True or False?, Reason It (two pages), Stretch, and a
// discrimination page. I Can look throughout. Pupils tick, circle and write numbers; every sentence
// is a printed frame (PEDAGOGY_STANDARD 9, WORKSHEET_DESIGN_STANDARD 13.6, PAGE_TYPES 6).
//
// KIT PROPOSALS
//  1. `.ws-check` is fixed at 5 mm; the slot table asks for 5 / 6 / 7 mm at S / M / L. Proposed: a
//     `--ws-check` token per size and a `check(label)` helper that emits box + label as one slot
//     (`data-ws-shape="check"`). Done locally here as `.p09-check` / tick().
//  2. A `frame(parts)` helper for one-line sentence frames (text + line() slots on one baseline,
//     never wrapping). Done locally as frame().
//  3. `stack()` cannot show finished work: given regroup digits, struck-through digits and a black
//     answer row (state `answered` / `wrong`, P-TH-4). Proposed: `stack(..., { answer: 'given', ans,
//     rg: {col: text}, cross: [col] })`. Done locally as worked().
//  4. `fact()` has no answer row and no cue hook. Proposed: `fact(..., { ans, trace: true, ringOp: true })`
//     plus a shared `ring(d)` that draws the LS-1 dotted ring (1 pt round dots, 1.2 mm pitch) as SVG,
//     because a CSS dotted border cannot hit the pitch. Done locally as vfact() / ring().
//  5. `grid()` always makes equal `1fr` rows and columns. Proposed: `rowsTemplate` / `colsTemplate`
//     options so two problems of different height can share one ruled frame (Stretch). Done locally
//     as rowsGrid().
//  6. Results table (`table(head, rows, {traceFirst})`), rounded prompt box and word-bank box are
//     wanted by Stretch / Reason It and probably by word-problem pages too.
//  7. PAGE_TYPES PT-FRM-9 lists no tab id for the thinking roles; this file uses the role name.
//  8. Instruction library: a key for "circle the sign + cross out what you cannot do yet" is missing
//     (see page E); proposed key `circle-sign-cross`.
import { page, instruction, grid, cell, label, equation, line, doc, TIMES, MINUS } from '../kit/kit.mjs';

// ---------------------------------------------------------------- local helpers
const tick = text => `<span class="p09-tick"><span class="p09-check" data-ws-slot="answer" data-ws-shape="check"></span>${text}</span>`;
const ticks = (...labels) => `<div class="p09-ticks">${labels.map(tick).join('')}</div>`;
// one-line sentence frame: strings are text, numbers are line slots of that many digits, 'w' is a word slot
const frame = (parts, size = 'M') => `<div class="p09-frame">${parts.map(p => typeof p === 'number' ? line(p, size)
    : p === 'w' ? `<span class="ws-line" style="--w:40mm" data-ws-slot="answer" data-ws-shape="line"></span>` : `<span>${p}</span>`).join('')}</div>`;

// LS-1 dotted ring (models "circle this"): 1 pt round dots (black, so it survives a photocopier) at a 1.2 mm pitch, drawn in mm units
function ring(d = 11.2) {
    const r = d / 2 - 0.4, n = Math.round(2 * Math.PI * r / 1.2), pitch = (2 * Math.PI * r / n).toFixed(4);
    return `<svg class="p09-ring" width="${d}mm" height="${d}mm" viewBox="0 0 ${d} ${d}" aria-hidden="true"><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="#000" stroke-width="0.3528" stroke-linecap="round" stroke-dasharray="0 ${pitch}"/></svg>`;
}
const SLASH = `<svg class="p09-slash" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true"><line x1="1" y1="9.5" x2="9" y2="0.5" stroke="#000" vector-effect="non-scaling-stroke"/></svg>`;

// finished column subtraction shown for judging: black, with the pupil's regroup marks (P-TH-4)
function worked(a, b, ans, { rg = {}, cross = [] } = {}) {
    const t = 4, pad = s => [...String(s).padStart(t, ' ')];
    const heads = ['', 'H', 'T', 'O'].map(n => `<span class="head">${n}</span>`).join('') + '<span class="headcap"></span>';
    const boxes = pad(a).map((_, i) => `<span class="rg">${i > 0 ? `<i class="p09-rgi"><em class="p09-rgd">${rg[i] || ''}</em></i>` : ''}</span>`).join('');
    const top = pad(a).map((ch, i) => `<span${cross.includes(i) ? ' class="p09-x"' : ''}>${ch.trim()}${cross.includes(i) ? SLASH : ''}</span>`).join('');
    const bot = pad(b).map((ch, i) => i === 0 ? `<span class="op">${MINUS}</span>` : `<span>${ch.trim()}</span>`).join('');
    const res = pad(ans).map(ch => `<span class="p09-given">${ch.trim()}</span>`).join('');
    return `<div class="ws-stack wide" style="--t:${t}">${heads}${boxes}${top}<span class="gap"></span>${bot}<span class="rule"></span>${res}</div>`;
}
const sample = (tag, inner) => `<div class="p09-sample"><b class="p09-sampletab">${tag}</b>${inner}</div>`;

// vertical fact with an optional traced answer and a dotted ring on the sign (Model cell cue)
function vfact(a, b, op, { pt = 28, padTop = 9, ans = null, ringed = false } = {}) {
    const glyph = { '+': '+', '-': MINUS, x: TIMES }[op];
    const A = [...String(a).padStart(3, ' ')], B = [...String(b).padStart(3, ' ')];
    const row = (chars, first) => chars.map((ch, i) => i === 0 && first
        ? `<span class="op${ringed ? ' p09-ringed' : ''}">${first}${ringed ? ring() : ''}</span>` : `<span>${ch.trim()}</span>`).join('');
    const res = ans === null ? '' : [...String(ans).padStart(3, ' ')].map(ch => `<span class="ws-trace">${ch.trim()}</span>`).join('');
    return { cls: 'fact', style: `--fd:${pt}pt;--fp:${padTop}mm`, html: `<div class="ws-fact">${row(A)}${row(B, glyph)}<span class="rule"></span>${res}</div>` };
}

// one ruled frame, one column, rows of unequal height
const rowsGrid = (cells, template) =>
    `<div class="ws-grid" style="grid-template-columns:1fr;grid-template-rows:${template}">${cells.map((c, i) => cell(c, { label: label('letter', i + 1), cls: 'p09-block' })).join('')}</div>`;

// ---------------------------------------------------------------- A. True or False?  (Level 3, size M, 2 x 3)
const X = ` ${TIMES} `;
const tfItems = [                                                  // T F F T F T  (half and half, no pattern: P-TH-3)
    { st: [6, 'x', 4, '=', 4, 'x', 6], fr: [[`6${X}4 = `, 3, ' and'], [`4${X}6 = `, 3, '.']] },
    { st: [300, '+', 40, '+', 7, '=', 374], fr: [['300 + 40 + 7 = ', 3, '.']] },                  // false: digits swapped
    { st: [6, 'x', 7, '=', 48], fr: [[`6${X}7 = `, 3, '.']] },                                     // false: the fact next door
    { st: [5, 'x', 30, '=', 150], fr: [[`5${X}30 = `, 3, '.']] },
    { st: [608, '=', 600, '+', 80], fr: [['600 + 80 = ', 3, '.']] },                               // false: zero as a place holder
    { st: [9, 'x', 3, '=', 9, '+', 9, '+', 9], fr: [[`9${X}3 = `, 3, ' and'], ['9 + 9 + 9 = ', 3, '.']] },
];
const tfCell = it => `<div class="p09-tf">${equation(it.st, 'M')}<div class="p09-resp">${ticks('True', 'False')}<div class="p09-frames">${it.fr.map(l => frame(l)).join('')}</div></div></div>`;
const trueFalse = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 6, tab: ['Level 3', 'Multiplying', 'True or False'], title: 'True or False?' },
    footer: { left: 'mult_facts · expanded_form · Grade 3 · 3.OA.B.5 · 3.NBT.A.1', right: 'Form A' },
    body: instruction('Tick True or False. Finish the sentence.') + grid(tfItems.map(tfCell), { cols: 2, rows: 3, labels: 'letter' }),
    note: '<b>09-A · True or False? — I Can look, size M.</b> 2 × 3 (the ceiling at M). One statement at working digit size, two tick boxes, one number frame that makes the pupil work out the evidence. The frame never says "true" or "false", so it cannot give the answer away; three statements are false (digits swapped, neighbouring fact, zero place holder). All blanks share one width (SL-2).',
});

// ---------------------------------------------------------------- B. Reason It: which is correct + odd one out  (Level 3, size M)
const whichCell = `<div class="p09-which">
  ${sample('A', worked(452, 127, 325, { rg: { 2: '4', 3: '12' }, cross: [2, 3] }))}
  ${sample('B', worked(452, 127, 335))}
  <div class="p09-whichresp">
    <div class="p09-choice" data-ws-slot="answer" data-ws-shape="choice"><span>A</span><span>B</span></div>
    ${frame([1, ' is correct.'])}
    ${frame(['The answer is ', 3, '.'])}
  </div>
</div>`;
const tri = pts => `<svg class="ws-svg" width="20mm" height="20mm" viewBox="0 0 18 18" aria-hidden="true"><polygon points="${pts}" fill="#fff" stroke="#000" stroke-width="0.4763" stroke-linejoin="miter"/></svg>`;
const oddCell = (items, bank) => `<div class="p09-odd">
  <div class="p09-items" data-ws-slot="answer" data-ws-shape="choice">${items.map(i => `<div class="p09-item">${i}</div>`).join('')}</div>
  <div class="p09-bank"><b>Word bank</b>${bank.map(w => `<span>${w}</span>`).join('')}</div>
  ${frame([2, ' does not belong.&ensp;It is not ', 'w', '.'])}
</div>`;
const oddNumbers = oddCell([14, 26, 35, 18].map(n => `<span class="p09-num">${n}</span>`), ['even', 'odd']);
const oddShapes = oddCell([
    '2,15 16,15 2,4',            // right triangle
    '9,2.5 15.5,15.5 2.5,15.5',  // tall triangle
    '4,4.5 14,4.5 16.5,14.5 1.5,14.5', // the odd one: four sides
    '1.5,14 16.5,14 12.5,5',     // wide triangle
].map((p, i) => `<em class="p09-itemno">${i + 1}</em>${tri(p)}`), ['a triangle', 'a circle', 'a square']);
const reasonMixed = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 3, tab: ['Level 3', 'Mixed review', 'Reason It A'], title: 'Reason It' },
    footer: { left: 'sub_1k_regroup · odd_even · shapes_2d · Grade 3 · 3.NBT.A.2 · 2.OA.C.3 · 2.G.A.1', right: 'Form A' },
    body: instruction('Which answer is correct? Circle A or B.') + grid([whichCell], { cols: 1, rows: 1, labels: 'letter', cls: 'p09-gwhich' })
        + `<div class="p09-gap"></div>` + instruction('Circle the one that does not belong. Finish the sentence.')
        + grid([oddNumbers, oddShapes], { cols: 1, rows: 2, labels: 'letter', start: 2 }),
    note: '<b>09-B · Reason It, "Mixed" option — I Can look, size M.</b> Which is correct: two finished subtractions in square work-sample frames, printed black like real pupil work (B takes the small digit from the big one). Odd one out: four boxed items, a word bank of at most 4 words, one frame. Three items = the ceiling at M. Solutions are "A" and "B", never named pupils (P-TH-14).',
});

// ---------------------------------------------------------------- C. Reason It: always, sometimes, never  (Level 3, size M, 4 rows)
const asnItems = [
    ['When I multiply by 5,', 'the answer ends in 5.'],                  // sometimes
    ['When I multiply a number by 1,', 'the number stays the same.'],    // always
    ['When I multiply by 2,', 'the answer is odd.'],                     // never
    ['When I multiply two numbers,', 'the answer is bigger than both.'], // sometimes
];
const exFrame = equation(['_line', 'x', '_line', '=', '_line'], 'M', 2);
const asnCell = st => `<div class="p09-asn">
  <div class="p09-asnleft"><p class="p09-claim">${st.join('<br>')}</p>${ticks('Always', 'Sometimes', 'Never')}</div>
  <div class="p09-asnright"><b class="ws-zone">Examples</b>${exFrame}${exFrame}</div>
</div>`;
const reasonAsn = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 4, tab: ['Level 3', 'Multiplying', 'Reason It B'], title: 'Reason It' },
    footer: { left: 'mult_facts · Grade 3 · 3.OA.D.9 · 3.OA.B.5', right: 'Form A' },
    body: instruction('Tick Always, Sometimes or Never. Write two examples.') + grid(asnItems.map(asnCell), { cols: 1, rows: 4, labels: 'letter' }),
    note: '<b>09-C · Reason It: always, sometimes, never — I Can look, size M.</b> Four full-width rows: one claim, three tick boxes, and two equation frames in every row (a "sometimes" claim needs one example that works and one that does not, P-TH-16; printing two everywhere means the layout never hints at the verdict). Verdicts here: sometimes, always, never, sometimes.',
});

// ---------------------------------------------------------------- D. Stretch  (Level 2, size M, two open problems)
const prompt = (lines, extra = '') => `<div class="ws-story p09-prompt"><div>${lines.map(l => `<div>${l}</div>`).join('')}</div>${extra}</div>`;
const closing = (word = 'answers') => `<div class="p09-closing">${frame(['I found ', 2, ` ${word}.`])}<div class="p09-closeticks">${tick('There are more.')}${tick('I found them all.')}</div></div>`;
const tr = c => `<span class="ws-trace">${c}</span>`;
const pairsTable = `<div class="p09-table" style="grid-template-columns:repeat(3,1fr)">
  <b>First number</b><b>Second number</b><b>Check: total</b>
  <div>${tr(12)}</div><div>${tr(8)}</div><div>${tr(20)}</div>
  ${'<div data-ws-slot="answer" data-ws-shape="box"></div>'.repeat(15)}
</div>`;
const entry = (tens, ones = '') => `<span class="p09-entry"><span>${tens}</span><i data-ws-slot="answer" data-ws-shape="box">${ones}</i></span>`;
const listRow = (tens, traced = null) => `<div class="p09-start">${tens}</div><div class="p09-entries">${[0, 1, 2].map(k => entry(traced ? tr(tens) : tens, traced ? tr(traced[k]) : '')).join('')}</div><div${traced ? '' : ' data-ws-slot="answer" data-ws-shape="box"'}>${traced ? tr(3) : ''}</div>`;
const listTable = `<div class="p09-table p09-list" style="grid-template-columns:24mm 1fr 34mm">
  <b>Tens digit</b><b>Numbers I can make</b><b>Check: how many</b>
  ${listRow(1, [3, 5, 8])}${listRow(3)}${listRow(5)}${listRow(8)}
</div>`;
const cards = `<div class="p09-cards">${[1, 3, 5, 8].map(d => `<span>${d}</span>`).join('')}</div>`;
const stretchA = `${prompt(['Two numbers add to 20.', 'Find five different pairs.'])}<div class="p09-work">${pairsTable}${closing()}</div>`;
const stretchB = `${prompt(['Pick two cards. Make a two-digit number.', 'Find all the numbers.'], cards)}<div class="p09-work">${listTable}${closing()}</div>`;
const stretch = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: false, tab: ['Level 2', 'Number', 'Stretch A'], title: 'Stretch' },
    footer: { left: 'add_within_20 · place_value_2digit · Grade 2 · 2.OA.B.2 · 2.NBT.A.3', right: 'Form A · Answers vary' },
    body: instruction('Find more than one answer. Fill in the table.') + rowsGrid([stretchA, stretchB], '126fr 100fr'),
    note: '<b>09-D · Stretch — I Can look, size M, two open problems.</b> Rounded prompt box (something to read), square results table (somewhere to write) with the first row traced in grey, a self-check in the last column, and a closing frame of one number blank and two tick lines. Problem b. is an organised list: one row per tens digit, the tens digit pre-printed so pupils write one digit per number. No Score (open answers; the key prints "Answers vary").',
});

// ---------------------------------------------------------------- E. Discrimination: look at the sign  (Level 3, size L, 3 x 3)
const signFacts = [[6, 4, 'x'], [52, 8, '-'], [27, 6, '+'], [9, 3, 'x'], [63, 7, '-'], [41, 5, '-'], [8, 6, 'x'], [46, 9, '+']];
const signCells = [{ ...vfact(35, 7, '+', { ans: 42, ringed: true }), nolabel: true, model: true }, ...signFacts.map(([a, b, op]) => vfact(a, b, op))];
const ruleBox = `<div class="ws-story p09-rule"><span>The sign tells me what to do.</span><span class="p09-key"><span><b>+</b>add</span><span><b>${MINUS}</b>subtract</span><span><b>${TIMES}</b>multiply</span></span></div>`;
const signPage = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 8, tab: ['Level 3', 'Mixed facts', 'Lesson 9'], title: 'I Can look at the sign before I solve' },
    footer: { left: 'mixed_facts_sign · Grade 3 · 3.OA.C.7 · 2.OA.B.2', right: 'Form A' },
    body: ruleBox + instruction('Circle the sign. Then solve. Cross out ones you cannot do yet.') + grid(signCells, { cols: 3, rows: 3, labels: 'letter' }),
    note: '<b>09-E · Discrimination page — I Can look, size L.</b> 3 × 3 mixed-sign facts (+, −, × in no pattern). The rule is printed once in a rounded box (P-TH-11). The unlabelled Model cell shows the cue: a dotted ring on the sign (dotted = "trace this") and the answer in grey trace. "Cross out the ones you cannot do yet" option on: a crossed-out fact is information for the teacher, not a wrong answer.',
});

// ---------------------------------------------------------------- local CSS
const css = `
.ws-S{--p09-ck:5mm}.ws-M{--p09-ck:6mm}.ws-L{--p09-ck:7mm}
.p09-check{display:inline-block;flex:none;width:var(--p09-ck);height:var(--p09-ck);border:var(--ws-hair) solid var(--ws-ink)}
.p09-ticks{display:flex;align-items:center;gap:12mm;font-size:var(--ws-text);line-height:1}
.p09-tick{display:inline-flex;align-items:center;gap:2.5mm;white-space:nowrap}
.p09-frame{font-size:var(--ws-text);line-height:1;white-space:nowrap}
.p09-frame .ws-line{margin:0 .8mm}

/* A. true or false */
.p09-tf{flex:1;width:100%;display:flex;flex-direction:column;align-items:flex-start;padding:8mm 0 0 6mm}
.p09-frames{display:flex;flex-direction:column;gap:2.5mm}
.p09-tf .ws-eq{justify-content:flex-start}
.p09-resp{margin-top:12mm;display:flex;flex-direction:column;align-items:flex-start;gap:7mm}

/* B. which is correct */
.ws-grid.p09-gwhich{flex:0 0 78mm}
.p09-gap{flex:none;height:2mm}
.p09-which{flex:1;width:100%;display:flex;align-items:stretch;align-self:flex-start;flex-grow:0;gap:8mm;padding:6mm 0 0 8mm}
.p09-sample{position:relative;flex:none;width:46mm;padding:4mm 0 5mm;border:var(--ws-hair) solid var(--ws-ink)}
.p09-sampletab{position:absolute;left:0;top:0;width:8mm;height:8mm;border-right:var(--ws-hair) solid var(--ws-ink);border-bottom:var(--ws-hair) solid var(--ws-ink);display:flex;align-items:center;justify-content:center;font-size:var(--ws-title);line-height:1}
.p09-rgi{display:flex !important;align-items:center;justify-content:center}
.p09-rgd{font-style:normal;font-size:10pt;font-weight:700;line-height:1}
.p09-given{font-weight:700}
.p09-x{position:relative}
.p09-slash{position:absolute;left:12%;top:8%;width:76%;height:84%;overflow:visible}
.p09-slash line{stroke-width:.75pt}
.p09-whichresp{flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:1mm 0 6mm 4mm}
.p09-choice{display:flex;gap:16mm;font-size:var(--ws-digit);font-weight:700;line-height:12mm;height:12mm;padding-left:3mm}

/* B. odd one out */
.p09-odd{flex:1;width:100%;display:grid;grid-template-columns:1fr 36mm;column-gap:9mm;row-gap:12mm;align-content:start;padding:6mm 2mm 0 8mm}
.p09-items{display:flex;justify-content:space-between}
.p09-item{position:relative;width:24mm;height:24mm;border:var(--ws-hair) solid var(--ws-ink);display:flex;align-items:center;justify-content:center}
.p09-num{font-size:var(--ws-digit);line-height:1}
.p09-itemno{position:absolute;left:1.2mm;top:1mm;font-style:normal;font-weight:700;font-size:var(--ws-zone);line-height:1}
.p09-bank{grid-row:1 / span 2;grid-column:2;align-self:start;border:var(--ws-hair) solid var(--ws-ink);border-radius:3mm;padding:2.5mm 4mm 3mm;display:flex;flex-direction:column;gap:1.6mm;font-size:var(--ws-text);line-height:1.2}
.p09-bank b{font-size:var(--ws-zone)}
.p09-odd .p09-frame{grid-column:1}

/* C. always, sometimes, never */
.p09-asn{flex:1;width:100%;display:flex;align-items:flex-start;gap:8mm;padding:7mm 3mm 0 8mm}
.p09-asnleft{flex:1;display:flex;flex-direction:column;gap:12mm}
.p09-claim{margin:0;font-size:var(--ws-text);line-height:1.3;min-height:2.6em}
.p09-asn .p09-ticks{gap:7mm}
.p09-asnright{flex:none;width:68mm;display:flex;flex-direction:column;align-items:flex-start;gap:7mm}
.p09-asnright .ws-eq{justify-content:flex-start}
.p09-asnright b{line-height:1;margin-bottom:-3mm}

/* D. stretch */
.ws-cell.p09-block{align-items:stretch;padding:4mm 5mm 4mm 9mm;gap:4mm}
.p09-prompt{display:flex;align-items:center;justify-content:space-between;gap:6mm;padding:2.5mm 5mm}
.p09-work{display:flex;align-items:flex-end;gap:7mm}
.p09-table{flex:none;width:112mm;display:grid;grid-auto-rows:14mm;grid-template-rows:10mm;gap:var(--ws-hair);background:var(--ws-ink);border:var(--ws-heavy) solid var(--ws-ink)}
.p09-table > *{background:var(--ws-paper);display:flex;align-items:center;justify-content:center;font-size:var(--ws-digit);line-height:1;min-width:0}
.p09-table > b{font-size:var(--ws-zone);font-weight:700;text-align:center}
.p09-entries{justify-content:space-evenly !important}
.p09-entry{display:inline-flex;align-items:center;gap:1mm}
.p09-entry i{display:flex;align-items:center;justify-content:center;font-style:normal;width:7mm;height:10mm;border:var(--ws-hair) solid var(--ws-ink)}
.p09-cards{display:flex;gap:3mm}
.p09-cards span{width:11mm;height:14mm;border:var(--ws-hair) solid var(--ws-ink);border-radius:1mm;display:flex;align-items:center;justify-content:center;font-size:var(--ws-digit);line-height:1}
.p09-closing{flex:1;display:flex;flex-direction:column;gap:6mm;padding-bottom:1mm}
.p09-closeticks{display:flex;flex-direction:column;gap:4mm;font-size:var(--ws-text);line-height:1}

/* E. look at the sign */
.p09-rule{flex:none;margin-top:1.5mm;display:flex;align-items:center;justify-content:space-between;padding:2mm 5mm}
.p09-key{display:flex;gap:9mm}
.p09-key > span{display:inline-flex;align-items:center;gap:2mm}
.p09-key b{font-size:22pt;line-height:1;font-weight:700}
.p09-ringed{position:relative}
.p09-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);overflow:visible}
`;

export default doc('09 Thinking pages', [trueFalse, reasonMixed, reasonAsn, stretch, signPage], css);
