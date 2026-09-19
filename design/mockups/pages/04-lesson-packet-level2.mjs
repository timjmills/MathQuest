// 04 · A complete lesson packet, Level 2: "I Can subtract two-digit numbers with regrouping".
// Opener, decide-only sub-skill page, Independent, More Practice A, Error analysis, Review, Test A.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file):
//  1. stack(): accept `fill` (digits written in the regroup boxes), `strike` (which top digits are crossed out),
//     `ink: 'trace' | 'ink'` for those marks and for the answer, and let `answer: 'boxes'` carry traced digits.
//     The Model cell, the scripted Model page and Error analysis all need a stack in state traced / answered / wrong.
//  2. stack(): `grey: true` should also grey the T O heads and their cap rule (Guided prints every scaffold grey).
//  3. band(): accept a `cls`, and a `split` form that draws Model (left 93 mm) beside Steps (right 93 mm) with the
//     oral-frame line under both (PT-OPN-2). Here it is the local modelBand().
//  4. A `tickLine(text)` helper with the 5 / 6 / 7 mm size-aware checkbox (.ws-check is fixed at 5 mm).
//  5. A `sideBySide(work, response)` cell layout for decide-only and error-analysis cells at size L, where the
//     stacked arrangement does not fit a 2 x 3 / 2 x 4 grid (PT-SUB 57 > 56.75, PT-ERR 81 > 75.67).
//  6. Base-10 mini-diagram helpers (rod, unit, labelled group) for Vocabulary cards (RP-30).
import { page, instruction, grid, stack, steps, line, doc, MINUS } from '../kit/kit.mjs';

const TITLE = 'I Can subtract two-digit numbers with regrouping';
const SKILL = 'sub_100_regroup · Grade 2 · 2.NBT.B.5';
const tab = id => ['Level 2', 'Subtraction', id];

// ---------- local helpers ----------
const lband = (label, instr, content, { grow = false, cls = '' } = {}) =>
    `<div class="ws-band${grow ? ' grow' : ''} ${cls}"><div class="ws-strip">${label ? `<b>${label}</b>` : ''}<span>${instr || ''}</span></div>${content}</div>`;

const STRIKE = `<svg class="p04-strike" aria-hidden="true"><line x1="0" y1="100%" x2="100%" y2="0" stroke="#000" stroke-width="0.75pt"/></svg>`;

// Two-digit subtraction stack drawn with the kit's own classes, plus the states the kit cannot draw yet.
//  scaffold: 'ink' (Model, Independent) | 'grey' (Guided)     fill: ['3','13'] digits written in the regroup boxes
//  strike: [tens, ones] booleans                                mark: 'trace' (modelled, grey) | 'ink' (a pupil wrote it)
//  ansBoxes: answer digit boxes (Model / Guided)                ans: shown answer
function work(a, b, { scaffold = 'ink', fill = null, strike = [false, false], mark = 'trace', ansBoxes = false, ans = null } = {}) {
    const T = 3, A = String(a), B = String(b);
    const g = scaffold === 'grey' ? ' ws-grey' : '';
    const m = mark === 'trace' ? ' ws-trace' : '';
    const pad = s => [...String(s).padStart(T, ' ')];
    let h = ['', 'T', 'O'].map(x => `<span class="head${g}">${x}</span>`).join('') + `<span class="headcap${g}"></span>`;
    h += pad(A).map((ch, i) => ch === ' ' ? `<span class="rg"></span>`
        : `<span class="rg${g}"><i class="p04-f${m}"><span>${fill ? fill[i - (T - A.length)] || '' : ''}</span></i></span>`).join('');
    h += pad(A).map((ch, i) => `<span${strike[i - 1] ? ' class="p04-x"' : ''}>${ch === ' ' ? '' : ch}${strike[i - 1] ? STRIKE : ''}</span>`).join('');
    h += `<span class="gap"></span>` + pad(B).map((ch, i) => i === 0 ? `<span class="op">${MINUS}</span>` : `<span>${ch === ' ' ? '' : ch}</span>`).join('') + `<span class="rule"></span>`;
    const digits = ans === null ? pad('') : pad(ans);
    if (ansBoxes) h += digits.map(ch => `<span class="ab${g}"><i class="p04-f${m}">${ch === ' ' ? '' : ch}</i></span>`).join('');
    else if (ans !== null) h += digits.map(ch => `<span class="${m.trim()}">${ch === ' ' ? '' : ch}</span>`).join('');
    return `<div class="ws-stack wide" style="--t:${T}" data-ws-slot="answer" data-ws-shape="open">${h}</div>`;
}

const tick = text => `<div class="p04-tickline"><span class="p04-tick" data-ws-slot="answer" data-ws-shape="check"></span>${text}</div>`;

// ---------- base-10 mini-diagrams (RP-30: unit u x u, rod u x 10u with 0.5 pt segments), 1 SVG unit = 1 mm ----------
const H = 0.265, F = 0.176, M1 = 0.353;                                   // 0.75 / 0.5 / 1 pt in mm
const U = 2.2;
const unit = (x, y) => `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="#fff" stroke="#000" stroke-width="${H}"/>`;
const rod = (x, y) => `<rect x="${x}" y="${y}" width="${U}" height="${U * 10}" fill="#fff" stroke="#000" stroke-width="${H}"/>`
    + Array.from({ length: 9 }, (_, i) => `<line x1="${x}" x2="${x + U}" y1="${(y + U * (i + 1)).toFixed(2)}" y2="${(y + U * (i + 1)).toFixed(2)}" stroke="#000" stroke-width="${F}"/>`).join('');
const cap = (x, y, t) => `<text x="${x}" y="${y}" font-family="Andika" font-size="3.5" text-anchor="middle" fill="#000">${t}</text>`;
const svg = (w, inner) => `<svg class="ws-svg" width="${w}mm" height="28mm" viewBox="0 0 ${w} 28" aria-hidden="true">${inner}</svg>`;
const TOP = 0.5, BASE = TOP + U * 10;                                      // rods stand on y = BASE
const PITCH = U + 1;
const unitsBlock = (x, n) => Array.from({ length: n }, (_, k) => unit(x + (k % 2) * PITCH, BASE - U - Math.floor(k / 2) * PITCH)).join('');   // 2 wide, built up from the base

const picTens = svg(16, [0, 1, 2].map(k => rod(8 - (3 * U + 2) / 2 + k * PITCH, TOP)).join('') + cap(8, 27, '3 tens'));
const picOnes = svg(16, unitsBlock(8 - (2 * U + 1) / 2, 6) + cap(8, 27, '6 ones'));
const picRegroup = svg(32,
    rod(5 - U / 2, TOP) + cap(5, 27, '1 ten')
    + `<line x1="10" y1="${TOP + U * 5}" x2="17.5" y2="${TOP + U * 5}" stroke="#000" stroke-width="${M1}"/><polyline points="15.5,${TOP + U * 5 - 1.6} 17.5,${TOP + U * 5} 15.5,${TOP + U * 5 + 1.6}" fill="none" stroke="#000" stroke-width="${M1}" stroke-linejoin="miter"/>`
    + unitsBlock(24 - (2 * U + 1) / 2, 10) + cap(24, 27, '10 ones'));

const vocabCard = (pic, term, gloss) => `<div class="p04-card">${pic}<div class="p04-term"><b>${term}</b><span>${gloss}</span></div></div>`;

// ---------- A. Opener ----------
const sayFrame = `<div class="p04-say"><b>Say:</b><span class="p04-q1">“</span>${line(2)}<span>minus</span>${line(2)}<span>equals</span>${line(2)}<span class="p04-q2">.”</span></div>`;
const modelBand = `<div class="ws-band p04-modelband">
  <div class="p04-model">
    <div class="p04-mzone"><div class="ws-strip"><b>Model:</b></div>${grid([
        work(43, 18, { fill: ['3', '13'], strike: [true, true], ansBoxes: true, ans: 25 }),
        work(61, 24, { ansBoxes: true }),
    ], { cols: 2, rows: 1 })}</div>
    <div class="p04-szone"><div class="ws-strip"><b>Steps:</b></div>${steps([
        'Look at the ones.<br>Is the top digit smaller?',
        'Regroup. Cross out the tens.<br>Write 1 less.',
        'Cross out the ones.<br>Write 10 more.',
        'Subtract the ones.',
        'Subtract the tens.',
    ])}</div>
  </div>${sayFrame}</div>`;

const opener = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: false, tab: tab('Lesson 4'), title: TITLE },
    footer: { left: SKILL, center: '1/3', right: 'Form A' },
    body: lband("What's New:", 'This time you will regroup 1 ten as 10 ones.', '', { cls: 'p04-new' })
        + lband('Vocabulary:', '', `<div class="p04-vocab">${vocabCard(picTens, 'tens (T)', 'rods of 10 blocks')}${vocabCard(picOnes, 'ones (O)', 'single blocks')}${vocabCard(picRegroup, 'regroup', 'trade 1 ten<br>for 10 ones')}</div>`)
        + modelBand
        + lband('Guided Practice:', 'Subtract.', grid([[54, 26], [72, 35], [80, 47]].map(([a, b]) => work(a, b, { scaffold: 'grey', ansBoxes: true })), { cols: 3, rows: 1 }), { grow: true }),
    note: '<b>04-A · Opener.</b> Bands in the fixed order: What’s New, Vocabulary (3 cards with labelled base-10 line art), Model beside Steps (one traced item with filled regroup boxes and strikes, one blank item to work live, five steps in outlined circles, oral frame), Guided Practice with 3 unlabelled cells whose T O heads, regroup boxes and answer digit boxes print grey. No scored items, so Score is off.',
});

// ---------- B. Sub-skill, decide-only ----------
const decideItems = [[52, 17], [68, 25], [47, 27], [40, 13], [73, 38], [95, 60], [81, 46], [39, 14]];
const decide = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 8, tab: tab('Lesson 4'), title: TITLE },
    footer: { left: SKILL + ' · decide only', center: '2/3', right: 'Form A' },
    body: `<div class="ws-instrline"><span>Do you need to regroup? Check one box. Do <u class="p04-u">not</u> solve.</span></div>`
        + grid(decideItems.map(([a, b]) => `<div class="p04-pair p04-dec"><div>${stack(a, b, '-', { T: 3 })}</div><div class="p04-side">${tick('Yes, I regroup.')}${tick('No.')}</div></div>`), { cols: 2, rows: 4, labels: 'letter' }),
    note: '<b>04-B · Sub-skill page, decide only (“Do I need to regroup?”).</b> 2 × 4, bare stacks with no answer place, two check-box lines in the same position in every cell. 4 of 8 need regrouping (one with a zero on top, one with equal ones digits). Nothing is solved; Score /8.',
});

// ---------- C / D. Independent and More Practice A ----------
const lessonCell = ([a, b]) => stack(a, b, '-', { T: 3, heads: true, regroup: 'sub' });
const independent = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: tab('Lesson 4'), title: TITLE },
    footer: { left: SKILL, center: '3/3', right: 'Form A' },
    body: lband('Independent Practice:', 'Subtract.', grid([[62, 27], [45, 18], [78, 35], [70, 36], [96, 54], [53, 29]].map(lessonCell), { cols: 2, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>04-C · Independent page.</b> 2 × 3, quiet letters a.–f., structural supports only (black T O heads and a regroup box over every top digit, so the boxes give nothing away). Four items regroup, two do not. All spare height is working room.',
});
const practiceA = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: tab('Practice A'), title: TITLE },
    footer: { left: SKILL, center: '1/1', right: 'Practice A' },
    body: lband('More Practice:', 'Subtract.', grid([[34, 16], [85, 49], [67, 23], [90, 52], [71, 38], [58, 41]].map(lessonCell), { cols: 2, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>04-D · More Practice A.</b> The identical cell and grid; only the band label and the tab id change. Letters restart at a.',
});

// ---------- E. Error analysis ----------
const samples = [
    // Order is deliberately irregular (C W W / C W C by rows gives columns C W W and W C C): no left / right or alternating tell.
    { a: 74, b: 38, ans: 36, fill: ['6', '14'], strike: [true, true] },           // a. correct (74 - 38 = 36)
    { a: 63, b: 28, ans: 45 },                                                      // b. wrong: smaller digit taken from the larger (true answer 35)
    { a: 91, b: 46, ans: 55, fill: ['', '11'], strike: [false, true] },             // c. wrong: tens not reduced (true answer 45)
    { a: 86, b: 43, ans: 43 },                                                      // d. correct, no regrouping needed
    { a: 65, b: 19, ans: 54 },                                                      // e. wrong: smaller digit taken from the larger (true answer 46)
    { a: 80, b: 36, ans: 44, fill: ['7', '10'], strike: [true, true] },           // f. correct (80 - 36 = 44)
];
const errorPage = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: tab('Check it'), title: TITLE },
    footer: { left: SKILL + ' · error analysis', center: '1/1', right: 'Form A' },
    body: instruction('Check the work. Check one box. Fix the mistakes.')
        + grid(samples.map(s => `<div class="p04-pair p04-ea"><div>${work(s.a, s.b, { fill: s.fill || null, strike: s.strike || [false, false], mark: 'ink', ans: s.ans })}</div>`
            + `<div class="p04-side">${tick('Correct')}${tick('Not correct')}<div class="p04-fix"><span>Fix it:</span>${line(2)}</div></div></div>`), { cols: 2, rows: 3, labels: 'letter' }),
    note: '<b>04-E · Error analysis.</b> 2 × 3 finished subtractions set in black as a pupil would leave them. b. and e. take the smaller digit from the larger, c. regroups the ones but forgets to reduce the tens; a., d. and f. are correct (d. needs no regrouping, so empty boxes are not a tell). Right and wrong items do not alternate and do not sort by column. Tab id “Check it” (PT-FRM-9); handed out alone, so letters restart at a. and the footer reads 1/1. Check-box pair plus a fix-it line level with the shown answer.',
});

// ---------- F. Review (size M, 3 x 4) ----------
const review = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 12, tab: tab('Review'), title: 'Review: subtracting two-digit numbers' },
    footer: { left: 'sub_100_regroup + sub_100_1digit · Grade 2 · 2.NBT.B.5', center: '1/1', right: 'Form A' },
    body: lband('', 'Subtract.', grid([[64, 28], [57, 32], [83, 45], [92, 67], [76, 14], [50, 23], [41, 15], [68, 38], [75, 49]].map(lessonCell), { cols: 3, rows: 3, labels: 'letter' }), { cls: 'p04-rev3' })
        + lband('Mixed Review:', 'Subtract.', grid([[32, 7], [56, 4], [60, 8]].map(lessonCell), { cols: 3, rows: 1, labels: 'letter', start: 10 }), { cls: 'p04-rev1' }),
    note: '<b>04-F · Review, size M.</b> 12 items in 3 × 4: nine lesson cells mixing regroup (6) and no-regroup (3), then a Mixed Review row of the earlier step (two-digit minus one-digit), 25% of the page. Same cell template and supports as the lesson; no steps, models or traces.',
});

// ---------- G. Test A (size M, open 4 x 4) ----------
const testItems = [[53, 26], [87, 43], [60, 35], [74, 19], [96, 72], [42, 28], [81, 57], [65, 40], [33, 17], [78, 29], [59, 36], [90, 44], [46, 38], [84, 61], [72, 56], [67, 25]];
const testA = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 16, tab: tab('Test A'), title: 'Test A: subtracting two-digit numbers' },
    footer: { left: SKILL, center: '1/1', right: 'Form A' },
    body: instruction('Subtract.') + grid(testItems.map(lessonCell), { cols: 4, rows: 4, labels: 'letter', cls: 'open' }),
    note: '<b>04-G · Test A, size M.</b> Open 4 × 4 array (outer frame only), quiet letters a.–p., Score /16. “Keep structural supports” is on (T O heads, regroup boxes); hints are off. 10 items regroup, 6 do not.',
});

const css = `
/* bands */
.p04-new .ws-strip { min-height: 10mm; }
.p04-vocab { display: grid; grid-template-columns: 59mm 55mm 1fr; padding: 0 3mm 2.5mm 6mm; }
.p04-card { display: flex; align-items: center; gap: 3mm; min-width: 0; }
.p04-card svg { flex: none; }
.p04-term { display: flex; flex-direction: column; gap: 1mm; line-height: 1.2; }
.p04-term b { font-weight: 700; font-size: var(--ws-text); }
.p04-term span { font-size: var(--ws-zone); white-space: nowrap; }
.p04-model { display: flex; height: 82mm; }
.p04-mzone { flex: 0 0 50%; min-width: 0; display: flex; flex-direction: column; border-right: var(--ws-heavy) solid var(--ws-ink); }
.p04-mzone > .ws-grid { border-width: var(--ws-heavy) 0 0 0; }
.p04-szone { flex: 1 1 0; min-width: 0; }
.p04-szone .ws-steps { padding: 1mm 3mm 0 4mm; }
.p04-say { border-top: var(--ws-heavy) solid var(--ws-ink); min-height: 13mm; display: flex; align-items: flex-end; gap: 2mm; padding: 0 3mm 2.5mm; font-size: var(--ws-text); }
.p04-say b { font-weight: 700; margin-right: 1mm; }
.p04-q1 { margin-right: -1.2mm; } .p04-q2 { margin-left: -1.4mm; }
/* filled boxes and strikes */
.ws-stack .rg i.p04-f, .ws-stack .ab i.p04-f { display: flex; align-items: center; justify-content: center; font-style: normal; line-height: 1; color: var(--ws-ink); }
.ws-stack .rg i.p04-f span { font-size: var(--ws-text); }
.ws-stack i.p04-f.ws-trace { color: var(--ws-grey); }
.p04-x { position: relative; }
.p04-strike { position: absolute; left: 6%; top: 4%; width: 88%; height: 92%; overflow: visible; }
/* work beside response (decide-only, error analysis) */
.p04-pair { width: 100%; display: grid; }
.p04-dec { grid-template-columns: 42% 58%; } .p04-ea { grid-template-columns: 50% 50%; }
.p04-side { display: flex; flex-direction: column; font-size: var(--ws-text); }
.p04-tickline { display: flex; align-items: center; height: 11.36mm; white-space: nowrap; }
.p04-tick { flex: none; width: 7mm; height: 7mm; border: var(--ws-hair) solid var(--ws-ink); margin-right: 3mm; }
.p04-dec .p04-side { padding-top: calc(var(--ws-tab) - 1mm); }
.p04-ea .p04-side { padding-top: calc(var(--ws-tab) - 1mm + 15mm); }
.p04-fix { margin-top: auto; display: flex; align-items: flex-end; gap: 2mm; padding-bottom: 1.6mm; }
.p04-fix span:first-child { font-size: var(--ws-zone); font-weight: 700; }
.p04-u { text-decoration-thickness: .75pt; text-underline-offset: 1.2mm; }
/* review: 3 rows + 1 row share the body in proportion */
.p04-rev3 { flex: 3 1 calc(6mm + 6pt); min-height: 0; } .p04-rev1 { flex: 1 1 calc(6mm + 5.25pt); min-height: 0; }
`;

export default doc('04 Lesson packet, Level 2: subtract two-digit numbers with regrouping', [opener, decide, independent, practiceA, errorPage, review, testA], css);
