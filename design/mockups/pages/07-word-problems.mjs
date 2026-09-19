// Word problems (I Can look): schema v1 (part-whole, compare, equal groups), v2 faded two-per-page,
// K picture version, two-step columns, and the keyword-checklist panel option.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file as .p07-*):
//  1. storyBox(lines, { digits, unit, faded })  - rounded story box, one sentence per line (nowrap, so a long
//     sentence fails the build instead of wrapping), answer row inside the box: `unit` slot (line + unit word)
//     or the faded `unit-open` slot (short number line + long label line with "number" / "label" captions).
//  2. workGrid(cols, rows)                        - squared work grid, squares = Hw (6 / 8 / 10 mm), 0.75 pt.
//  3. check()                                     - the kit's .ws-check is fixed at 5 mm; SL table wants 5 / 6 / 7 mm by size.
//  4. slotBox(digits)                             - stand-alone missing-number box B(n) x (Hw + 2); the kit's box() is Hw tall.
//  5. schema builders: partWhole, compare, equalGroups, change (RP-70..72) with the `?` corner mark for the unknown.
//  6. decide(lines)                               - first-person decision check-box lines (P-WP-10).
//  7. a generic zoned frame (.p07-frame / .p07-z): one 1.5 pt outer frame split into full-width zones by 0.75 pt rules.
//     The kit's band() always prints a strip label, which word-problem zones do not have.
//  8. Instruction library: the keyword-panel page has no library string ("story" names a diagram the page does not
//     have). Proposed key `story-steps`: "Read the story. Check each box. Solve."
//  9. Decision library (P-WP-10) has one Compare sentence only. Proposed partner:
//     "I know the smaller amount and the difference. I add."
// 10. page({ continuation: true }) - the HD-20 12 mm continuation header (Name + one-line outlined tab, no Date /
//     Score / title). Done here with .p07-cont overrides on the kit header for the v2 page, which is 2/2 of its set.
// 11. RP-70 conflict to settle in the standard: bars are 10 / 12 / 14 mm tall, yet the slot inside a bar is
//     Hw + 2 = 8 / 10 / 12 mm tall, which leaves under 0.5 mm of air. This file uses 12.5 / 15 / 17.5 mm bars.
// 12. storyBox minLines - holds every story box in a set to one height so the blanks sit in one place per cell.
import { page, instruction, grid, equation, doc } from '../kit/kit.mjs';

// ---- two switches for the two places where the brief and the standard disagree (see the notes on B and G) ----
const UNKNOWN_STYLE = 'solid';   // 'solid' = LS-3 / RP-70 (hairline solid difference box) | 'dashed' = the brief's wording
const PANEL_SIDE = 'right';      // 'right' = SF-53 / PAGE_TYPES 3.7 | 'left' = the brief's wording

const HW = { S: 6, M: 8, L: 10 };
const B = (n, size = 'L') => Math.max(14, Math.ceil(n * 0.75 * HW[size] + 2));
const STORY = 'Read the story. Fill in the diagram. Solve.';            // library key `story`
const STORY_V2 = 'Solve. Write the number and the label.';               // `story-v2`
const STORY_K = 'Show the story with lines. Write the equation.';        // `story-k`
const STORY_STEPS = 'Read the story. Check each box. Solve.';            // proposed `story-steps`

// ---------- local helpers ----------
const ansLine = w => `<span class="ws-line" style="--w:${w}mm" data-ws-slot="answer" data-ws-shape="line"></span>`;
const slotBox = (n, size = 'L') => `<span class="p07-slot" style="width:${B(n, size)}mm" data-ws-slot="work" data-ws-shape="box"></span>`;
const Q = '<span class="p07-q">?</span>';
const check = () => `<span class="p07-check" data-ws-slot="answer" data-ws-shape="check"></span>`;

function storyBox(lines, { digits = 2, unit = '', size = 'L', faded = false, answer = true, minLines = 0 } = {}) {
    const ans = !answer ? '' : faded
        ? `<div class="p07-ans" data-ws-shape="unit-open"><span class="p07-cap">${ansLine(B(digits, size))}<small>number</small></span><span class="p07-cap">${ansLine({ S: 40, M: 46, L: 52 }[size])}<small>label</small></span></div>`
        : `<div class="p07-ans" data-ws-shape="unit">${ansLine(B(digits, size))}<span>${unit}</span></div>`;
    return `<div class="ws-story p07-story"><div class="p07-lines" style="min-height:${(minLines * 1.45).toFixed(2)}em">${lines.map(l => `<div>${l}</div>`).join('')}</div>${ans}</div>`;
}

const workGrid = (cols, rows) => `<div class="p07-wg" style="--c:${cols};--r:${rows}">${'<i></i>'.repeat(cols * rows)}</div>`;
const decide = lines => `<div class="p07-decide">${lines.map(t => `<div class="p07-dec">${check()}<span>${t}</span></div>`).join('')}</div>`;
const eqFrame = (digits, size = 'L') => equation(['_line', '_circle', '_line', '=', '_line'], size, digits);

// Part-whole: one long whole bar over two part bars of the same total length (RP-70). Proportions are fixed (RP-72).
function partWhole({ digits, size = 'L', width = 140, unknown = 'whole' }) {
    const s = slotBox(digits, size);
    return `<div class="p07-schema" style="width:${width}mm">
      <div class="p07-labs"><span>whole</span></div>
      <div class="p07-bar">${unknown === 'whole' ? Q : ''}${s}</div>
      <div class="p07-barrow"><div class="p07-bar">${unknown === 'part1' ? Q : ''}${s}</div><div class="p07-bar">${unknown === 'part2' ? Q : ''}${s}</div></div>
      <div class="p07-labs"><span>part</span><span>part</span></div>
    </div>`;
}

// Compare: two left-aligned bars; the shorter one is extended to the longer one's length by the difference box.
function compare({ digits, size = 'L', width = 140, unknown = 'difference' }) {
    const s = slotBox(digits, size);
    return `<div class="p07-schema" style="width:${width}mm">
      <div class="p07-bar">${unknown === 'bigger' ? Q : ''}${s}</div>
      <div class="p07-labs"><span>bigger</span></div>
      <div class="p07-barrow p07-gapabove"><div class="p07-bar" style="flex:0 0 62%">${unknown === 'smaller' ? Q : ''}${s}</div><div class="p07-bar p07-diff ${UNKNOWN_STYLE}">${unknown === 'difference' ? Q : ''}${s}</div></div>
      <div class="p07-labs"><span style="flex:0 0 62%">smaller</span><span>difference</span></div>
    </div>`;
}

// Equal groups: a row of rounded group outlines over the frame  groups x in each group = total.
function equalGroups({ groups, digits = 2, size = 'L', unknown = 'total' }) {
    const box = k => `<span class="p07-sbox">${unknown === k ? Q : ''}</span>`;
    return `<div class="p07-schema p07-eg">
      <div class="p07-groups">${'<span class="p07-group"></span>'.repeat(groups)}</div>
      <div class="p07-egframe" style="--bw:${B(digits, size) + 6}mm">
        ${box('groups')}<span class="p07-op">×</span>${box('each')}<span class="p07-op">=</span>${box('total')}
        <small>groups</small><i></i><small>in each group</small><i></i><small>total</small>
      </div>
    </div>`;
}

// Change: start -> (sign) change -> end, joined by solid arrows (LS-7: 1.5 pt shaft, 2.5 x 2 mm head).
const arrow = (len, h) => `<svg class="ws-svg" width="${len}mm" height="${h}mm" viewBox="0 0 ${len} ${h}"><line x1="0.4" y1="${h / 2}" x2="${len - 2.4}" y2="${h / 2}" stroke="#000" stroke-width="0.529"/><polygon points="${len - 2.5},${h / 2 - 1} ${len},${h / 2} ${len - 2.5},${h / 2 + 1}" fill="#000"/></svg>`;
function change({ size = 'M', unknown = 'end', boxW = 20, arrowLen = 8 }) {
    const h = HW[size] + 6;
    const box = k => `<span class="p07-sbox" style="width:${boxW}mm;height:${h}mm">${unknown === k ? Q : ''}</span>`;
    return `<div class="p07-schema p07-change" style="grid-template-columns:${boxW}mm ${arrowLen}mm auto ${boxW}mm ${arrowLen}mm ${boxW}mm">
      ${box('start')}${arrow(arrowLen, h)}<span class="ws-circle" data-ws-slot="work" data-ws-shape="circle"></span>${box('change')}${arrow(arrowLen, h)}${box('end')}
      <small>start</small><i></i><i></i><small>change</small><i></i><small>end</small>
    </div>`;
}

// In-house line art, 24 x 24 grid, 1.5 pt outline, 0.75 pt interior detail, no fill (RP-20).
function apple(mm) {
    const o = (0.529 * 24 / mm).toFixed(3), d = (0.265 * 24 / mm).toFixed(3);
    return `<svg class="ws-svg" width="${mm}mm" height="${mm}mm" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">
      <path stroke-width="${o}" transform="translate(0 .8)" d="M12 7.6C10.5 5.6 7.6 5.2 5.6 6.8 3.2 8.7 3 12.6 4.4 16c1.2 3 3.4 5.7 5.6 5.7.9 0 1.3-.45 2-.45s1.1.45 2 .45c2.2 0 4.4-2.7 5.6-5.7 1.4-3.4 1.2-7.3-1.2-9.2-2-1.6-4.9-1.2-6.4.8Z"/>
      <path stroke-width="${o}" d="M12 8.4C12 6.6 11.7 4.8 10.9 3.2"/>
      <path stroke-width="${o}" d="M11.9 6C12.6 3.4 15.6 1.8 18.6 2.6 18 5 15 6.2 11.9 6Z"/>
      <path stroke-width="${d}" d="M11.9 6C14 5.4 16.6 4 18.6 2.6"/>
    </svg>`;
}
const pictureRows = (n, mm, perRow = 5) => `<div class="p07-pics" style="--item:${mm}mm">${Array.from({ length: Math.ceil(n / perRow) }, (_, r) =>
    `<div>${Array.from({ length: Math.min(perRow, n - r * perRow) }, () => apple(mm)).join('')}</div>`).join('')}</div>`;

// ---------- v1 page: story / diagram / decide / equation + grid ----------
function v1Body({ lines, digits, unit, diagram, decisions, gridCols = 6, gridRows = 7 }) {
    return instruction(STORY) + `<div class="p07-frame" data-ws-cell>
      <div class="p07-z p07-zstory">${storyBox(lines, { digits, unit })}</div>
      <div class="p07-z p07-grow p07-mid" style="flex-grow:.9">${diagram}</div>
      <div class="p07-z">${decide(decisions)}</div>
      <div class="p07-z p07-grow p07-work" style="flex-grow:1.1"><div class="p07-eqwrap">${eqFrame(digits)}</div><div class="p07-gridwrap">${workGrid(gridCols, gridRows)}</div></div>
    </div>`;
}

// ---- A. v1, Level 2, part-whole (whole unknown) ----
const pA = page({
    look: 'ican', size: 'L',
    header: { score: 1, tab: ['Level 2', 'Part-Whole', 'Lesson 4'], title: 'I Can solve part-whole word problems' },
    footer: { left: 'wp_part_whole · Grade 2 · 2.OA.A.1', right: 'Form A' },
    body: v1Body({
        lines: ['The library has <b>46</b> story books.', 'The library has <b>27</b> animal books.', 'How many books does the library have <u>in all</u>?'],
        digits: 2, unit: 'books',
        diagram: partWhole({ digits: 2 }),
        decisions: ['I know both parts. I add.', 'I know the whole and one part. I subtract.'],
    }),
    note: '<b>07-A · Word problem v1 — part-whole, Level 2.</b> One per page, fully scaffolded: rounded story box (one sentence per line, relational phrase underlined, key numbers bold, answer line + unit word inside the box), part / part / whole bars with box slots and the “?” corner mark on the unknown, two first-person decision check-box lines, equation frame (line · circle · line = line) beside a squared work grid. Score /1.',
});

// ---- B. v1, Level 3, compare (difference unknown), 3-digit work ----
const pB = page({
    look: 'ican', size: 'L',
    header: { score: 1, tab: ['Level 3', 'Compare', 'Lesson 2'], title: 'I Can solve compare word problems' },
    footer: { left: 'wp_compare · Grade 3 · 3.NBT.A.2', right: 'Form A' },
    body: v1Body({
        lines: ['Omar has <b>342</b> stamps.', 'Lina has <b>187</b> stamps.', 'How many <u>more</u> stamps does Omar have <u>than</u> Lina?'],
        digits: 3, unit: 'more stamps',
        diagram: compare({ digits: 3 }),
        decisions: ['I am finding the difference. I subtract.', 'I know the smaller amount and the difference. I add.'],
    }),
    note: `<b>07-B · Word problem v1 — compare, Level 3.</b> Bigger bar, smaller bar, and the difference box that extends the smaller bar to the bigger bar’s length. Bar lengths are schematic and never encode the numbers. Blanks sized for 3 digits (25 mm); the 6 × 7 work grid (its own sub-cell, split from the equation frame by a hairline) takes a 3-digit subtraction with regrouping. <i>Difference box drawn ${UNKNOWN_STYLE} (standard LS-3 / RP-70: the unknown is a solid hairline box with “?”, dashed means cut only); switch UNKNOWN_STYLE in the page file to compare.</i>`,
});

// ---- C. v1, Level 3, equal groups (total unknown) ----
const pC = page({
    look: 'ican', size: 'L',
    header: { score: 1, tab: ['Level 3', 'Equal Groups', 'Lesson 1'], title: 'I Can solve equal-groups word problems' },
    footer: { left: 'wp_equal_groups · Grade 3 · 3.OA.A.3', right: 'Form A' },
    body: v1Body({
        lines: ['Noor has <b>4</b> boxes.', 'Noor puts <b>6</b> pencils <u>in each</u> box.', 'How many pencils does Noor have?'],
        digits: 2, unit: 'pencils',
        diagram: equalGroups({ groups: 4 }),
        decisions: ['I know the groups and the size. I multiply.', 'I know the total and the size. I divide.'],
    }),
    note: '<b>07-C · Word problem v1 — equal groups, Level 3.</b> A row of rounded group outlines (one per group in the story, empty — the pupil draws or writes the size in each) over the labelled frame groups × in each group = total, “?” on the unknown box. Same four zones in the same places as A and B.',
});

// ---- D. v2, two per page, faded ----
const v2Cell = ({ lines, digits }) => ({
    html: `<div class="p07-v2">${storyBox(lines, { digits, faded: true, minLines: 4 })}<div class="p07-v2work">${eqFrame(digits)}</div></div>`,
});
const pD = page({
    look: 'ican', size: 'L', cls: 'p07-cont',
    header: { date: false, score: false, tab: ['Level 2', 'Part-Whole', 'Lesson 9'], title: '' },   // HD-20 continuation header
    footer: { left: 'wp_part_whole · Grade 2 · 2.OA.A.1', center: '2/2', right: 'Form A' },
    body: instruction(STORY_V2) + grid([
        v2Cell({ lines: ['The library has 38 picture books.', 'The library has 25 puzzle books.', 'How many books does the library have <u>in all</u>?'], digits: 2 }),
        v2Cell({ lines: ['The library has 52 maps.', '30 maps are old.', '<u>The rest</u> of the maps are new.', 'How many maps are new?'], digits: 2 }),
    ], { cols: 1, rows: 2, labels: 'letter', start: 3 }),
    note: '<b>07-D · Word problem v2 — two per page, faded.</b> No diagram, no check-box lines, no bold numbers: story box, a short number line + a long label line (the pupil writes the unit word), an equation frame and open work space. Letters run on from the first page of the set (c., d.); one context for the whole set. This is page 2/2 of the set, so it carries the 12 mm continuation header of HD-20 (Name + one-line tab, no Date / Score / title); Score /4 prints on page 1. Both story boxes are held to the same height so the equation frame and the blanks sit in the same place in each cell.',
});

// ---- E. K picture version ----
const pE = page({
    look: 'ican', size: 'L',
    header: { score: 1, tab: ['Level K', 'Take Away', 'Lesson 3'], title: 'I Can solve word problems (take away)' },
    footer: { left: 'wp_k_separate · Grade K · K.OA.A.2', right: 'Form A' },
    body: instruction(STORY_K) + `<div class="p07-frame" data-ws-cell>
      <div class="p07-z p07-zstory">${storyBox(['Sam has 8 apples.', 'Sam eats 3 apples.', 'How many apples are left?'], { answer: false })}</div>
      <div class="p07-z p07-grow p07-mid">${pictureRows(8, 26)}</div>
      <div class="p07-z p07-kframe"><div class="ws-eq">${ansLine(24)}<span class="ws-circle" data-ws-slot="answer" data-ws-shape="circle"></span>${ansLine(24)}<span class="o">=</span>${ansLine(24)}</div></div>
      <div class="p07-z p07-oral">Say the number and its label.</div>
    </div>`,
    note: '<b>07-E · K picture version.</b> Story of 13 words in 3 lines; a row-of-five picture set in in-house line art with nothing crossed out (the pupil draws the lines); the frame line · circle · line = line with 24 mm lines for big K handwriting; the last line is the oral prompt. One per page at L. <i>Pictures are 26 mm (the 12 mm minimum × 1.25 would be 15 mm) so a K pupil can cross each one out — a departure to confirm.</i>',
});

// ---- F. two-step, Level 4, Step 1 / Step 2 columns (size M so two schemas fit side by side) ----
const stepCol = (n, question, diagram, unit) => `<div class="p07-col">
    <div class="p07-step"><b>Step ${n}</b><span>${question}</span></div>
    <div class="p07-colmid">${diagram}</div>
    <div class="p07-total">${ansLine(B(3, 'M'))}<span>${unit}</span></div>
    <div class="p07-colgrid">${workGrid(6, 8)}</div>
  </div>`;
const pF = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 1, tab: ['Level 4', 'Two-Step', 'Lesson 5'], title: 'I Can solve two-step word problems' },
    footer: { left: 'wp_two_step · Grade 4 · 4.OA.A.3', right: 'Form A' },
    body: instruction(STORY) + `<div class="p07-frame" data-ws-cell>
      <div class="p07-z p07-zstory">${storyBox(['A shop has <b>248</b> red pens.', 'The shop has <b>175</b> blue pens.', 'The shop sells <b>96</b> pens on Monday.', 'How many pens does the shop have <u>now</u>?'], { digits: 3, unit: 'pens', size: 'M' })}</div>
      <div class="p07-cols">
        ${stepCol(1, 'How many pens are there <u>in all</u>?', partWhole({ digits: 3, size: 'M', width: 84 }), 'pens in all')}
        ${stepCol(2, 'How many pens are there <u>now</u>?', change({ size: 'M' }), 'pens now')}
      </div>
    </div>`,
    note: '<b>07-F · Two-step problem, Level 4 (size M).</b> Story box with the final answer line; below it a 1.5 pt vertical rule makes two columns, Step 1 and Step 2, each with its printed sub-question, its own schema (part-whole, then change with a sign circle and solid arrows), a result line with its unit phrase and a squared work grid. Size M is used because two 3-digit schemas do not fit side by side at L.',
});

// ---- G. keyword-checklist panel option ----
const PANEL = ['Read the story two times.', 'Circle the numbers.', 'Underline the question.', 'Box the clue words.',
    'Choose:<span class="p07-signs"><b>+</b><b>−</b><b>×</b><b>÷</b></span>', 'Solve. Write the label.'];
const panel = `<aside class="p07-panel">${PANEL.map((t, i) => `<div class="p07-pstep">${check()}<em>${i + 1}.</em><span>${t}</span></div>`).join('')}</aside>`;
const gMain = `<div class="p07-frame" data-ws-cell>
    <div class="p07-z p07-zstory">${storyBox(['A farm has 315 hens.', 'The farm sells 128 hens.', 'How many hens are <u>left</u>?'], { digits: 3, unit: 'hens' })}</div>
    <div class="p07-z p07-grow p07-drawz"><div class="p07-draw"><small>Draw</small></div></div>
    <div class="p07-z p07-gwork"><div class="p07-eqwrap">${eqFrame(3)}</div>${workGrid(6, 6)}</div>
  </div>`;
const pG = page({
    look: 'ican', size: 'L',
    header: { score: 1, tab: ['Level 3', 'Subtraction', 'Lesson 6'], title: 'I Can solve subtraction word problems' },
    footer: { left: 'wp_change_separate · Grade 3 · 3.NBT.A.2', right: 'Form A' },
    body: instruction(STORY_STEPS) + `<div class="p07-split">${PANEL_SIDE === 'left' ? panel + gMain : gMain + panel}</div>`,
    note: `<b>07-G · Keyword-checklist panel (teacher option).</b> One problem per page. The panel replaces the schema diagram and the decision lines: a rounded 62 mm panel (one third of the body) with the six fixed check-box steps of P-WP-14, identical on every page; the story box and the work area (grey rounded “Draw” helper box per SF-41, equation frame, squared grid) take the other two thirds. Key numbers are not bold here because step 2 asks the pupil to circle them. <i>Panel on the ${PANEL_SIDE} with six steps per SF-53 / P-WP-14; switch PANEL_SIDE in the page file to see it on the other side.</i>`,
});

const css = `
/* zoned frame: one 1.5 pt outer frame, zones divided by 0.75 pt rules */
.p07-frame { flex: 1 1 0; min-height: 0; min-width: 0; display: flex; flex-direction: column; border: var(--ws-heavy) solid var(--ws-ink); background: var(--ws-paper); }
.p07-z { flex: none; padding: 4mm; border-top: var(--ws-hair) solid var(--ws-ink); }
.p07-z:first-child { border-top: 0; }
.p07-zstory { padding: 3mm; }
.p07-grow { flex: 1 1 0; min-height: 0; }
.p07-mid { display: flex; align-items: center; justify-content: center; }

/* story box */
.p07-lines > div { white-space: nowrap; }
.p07-story b { font-weight: 700; }
.p07-ans { display: flex; align-items: baseline; justify-content: flex-end; gap: 2mm; margin-top: 2mm; padding-right: 4mm; }
.p07-cap { display: inline-flex; flex-direction: column; align-items: center; margin-left: 4mm; }
.p07-cap small { font-size: var(--ws-zone); line-height: 1.2; margin-top: .8mm; }
.p07-cap + .p07-cap { margin-left: 2mm; }

/* slots, checks */
.p07-slot { display: block; height: calc(var(--ws-hw) + 2mm); border: var(--ws-hair) solid var(--ws-ink); background: var(--ws-paper); }
.p07-check { flex: none; display: inline-block; width: 7mm; height: 7mm; border: var(--ws-hair) solid var(--ws-ink); }
.ws-M .p07-check { width: 6mm; height: 6mm; } .ws-S .p07-check { width: 5mm; height: 5mm; }
.p07-decide { display: flex; flex-direction: column; gap: 3mm; padding-left: 3.5mm; }
.p07-dec { display: flex; align-items: center; gap: 3mm; line-height: 1.1; }

/* schema diagrams */
.p07-schema { --bar: 17.5mm; display: flex; flex-direction: column; }
.ws-M .p07-schema { --bar: 15mm; } .ws-S .p07-schema { --bar: 12.5mm; }
.p07-bar { position: relative; flex: 1 1 0; height: var(--bar); border: var(--ws-heavy) solid var(--ws-ink); display: flex; align-items: center; justify-content: center; }
.p07-schema > .p07-bar { flex: none; }
.p07-barrow { display: flex; margin-top: calc(-1 * var(--ws-heavy)); }
.p07-barrow.p07-gapabove { margin-top: 5mm; }
.p07-barrow .p07-bar + .p07-bar { margin-left: calc(-1 * var(--ws-heavy)); }
.p07-bar.p07-diff { border-width: var(--ws-hair); border-left: var(--ws-heavy) solid var(--ws-ink); }
.p07-bar.p07-diff.dashed { border-style: dashed; border-left-style: solid; }
.p07-q { position: absolute; left: 1.4mm; top: .8mm; font-size: var(--ws-zone); font-weight: 700; line-height: 1; }
.p07-labs { display: flex; font-size: var(--ws-zone); line-height: 1; padding: 1.4mm 0; }
.p07-labs span { flex: 1 1 0; text-align: center; }
.p07-sbox { position: relative; display: block; width: var(--bw, 23mm); height: calc(var(--ws-hw) + 6mm); border: var(--ws-hair) solid var(--ws-ink); }

.p07-eg { align-items: center; gap: 7mm; }
.p07-groups { display: flex; gap: 6mm; }
.p07-group { display: block; width: 32mm; height: 24mm; border: var(--ws-heavy) solid var(--ws-ink); border-radius: 50%; }
.p07-egframe { display: grid; grid-template-columns: auto auto auto auto auto; column-gap: 3mm; row-gap: 1.4mm; align-items: center; justify-items: center; }
.p07-egframe small, .p07-change small { font-size: var(--ws-zone); line-height: 1; }
.p07-op { font-size: var(--ws-digit); font-weight: 700; line-height: 1; width: 1em; text-align: center; }

.p07-change { display: grid; align-items: center; justify-items: center; row-gap: 1.4mm; }
.p07-change .ws-circle { margin-right: -0.5pt; }

/* decision + work zones */
.p07-work { display: flex; align-items: stretch; padding: 0; }
.p07-eqwrap { flex: 1 1 0; display: flex; align-items: center; justify-content: center; padding: 4mm 2mm; min-width: 0; }
.p07-gridwrap { flex: none; display: flex; align-items: center; padding: 4mm; border-left: var(--ws-hair) solid var(--ws-ink); }
.p07-wg { --sq: 10mm; flex: none; display: grid; grid-template-columns: repeat(var(--c), var(--sq)); grid-auto-rows: var(--sq); gap: var(--ws-hair);
    background: var(--ws-ink); border: var(--ws-hair) solid var(--ws-ink); }
.ws-M .p07-wg { --sq: 8mm; } .ws-S .p07-wg { --sq: 6mm; }
.p07-wg i { display: block; background: var(--ws-paper); }

/* continuation header (HD-20): 12 mm = 9 mm row + rule block; Name + one-line outlined tab */
.p07-cont .ws-rowA { height: 9mm; }
.p07-cont .ws-field { height: 9mm; } .p07-cont .ws-field i { height: 8mm; }
.p07-cont .ws-tabbox { width: auto; height: 8mm; padding: 0 3mm; align-self: flex-end; flex-direction: row; align-items: center; font-size: 9pt; white-space: pre; }
.p07-cont .ws-tabbox span + span::before { content: "  ·  "; font-weight: 400; }

/* v2 cells */
.p07-v2 { align-self: stretch; flex: 1 1 0; display: flex; flex-direction: column; padding-left: 6mm; }
.p07-v2work { flex: 1 1 0; display: flex; align-items: flex-start; justify-content: flex-start; padding: 8mm 0 0 4mm; }

/* K picture */
.p07-pics { display: flex; flex-direction: column; gap: 12mm; }
.p07-pics > div { display: flex; gap: 9mm; }
.p07-kframe { padding: 20mm 4mm 16mm; }
.p07-oral { padding: 2.5mm 4mm; }

/* two-step */
.p07-cols { flex: 1 1 0; min-height: 0; display: flex; border-top: var(--ws-hair) solid var(--ws-ink); }
.p07-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; padding: 3mm; }
.p07-col + .p07-col { border-left: var(--ws-heavy) solid var(--ws-ink); }
.p07-step { display: flex; flex-direction: column; }
.p07-step b { font-weight: 700; }
.p07-colmid { flex: none; height: 60mm; display: flex; align-items: center; justify-content: center; }
.p07-total { display: flex; align-items: baseline; justify-content: center; gap: 2mm; }
.p07-colgrid { flex: 1 1 0; display: flex; align-items: center; justify-content: center; }

/* keyword panel */
.p07-split { flex: 1 1 0; min-height: 0; display: flex; gap: 3mm; }
.p07-panel { flex: none; width: 62mm; border: var(--ws-heavy) solid var(--ws-ink); border-radius: 3mm; padding: 6mm 4mm; display: flex; flex-direction: column; justify-content: space-around; }
.p07-pstep { display: flex; align-items: flex-start; gap: 2mm; line-height: 1.25; }
.p07-pstep em { flex: none; font-style: normal; font-weight: 700; margin-left: 1mm; }
.p07-pstep .p07-check { margin-top: .3mm; }
.p07-signs { display: flex; gap: 4mm; margin: 4mm 0 0 -8mm; font-size: 22pt; line-height: 1; }
.p07-signs b { width: 8mm; text-align: center; }
.p07-drawz { display: flex; }
.p07-draw { flex: 1 1 0; border: 1pt solid var(--ws-grey); border-radius: 3mm; padding: 1.5mm 2.5mm; }
.p07-draw small { font-size: var(--ws-zone); line-height: 1; }
.p07-gwork { display: flex; flex-direction: column; align-items: center; gap: 6mm; }
.p07-gwork .p07-eqwrap { flex: none; padding: 3mm 0 0; }
`;

export default doc('07 Word problems', [pA, pB, pC, pD, pE, pF, pG], css);
