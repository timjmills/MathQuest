// Equation drills (missing number, comparison), US-bracket long division (independent + guided),
// and 2-digit x 2-digit multiplication with partial-product rows.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file as p03-* helpers)
//  1. equation(): add an `align: 'tracks'` mode - operands right-aligned in fixed n-ch tracks, 1 em sign slots,
//     left edge anchored at label side + 3 mm (PT-EQD-2). The kit version centres each equation, so a mixed
//     blank-position column has a ragged left edge. Local helper here: eqRow().
//  2. box(): a stand-alone missing-number box should be Hw + 2 tall (SL table), the kit draws Hw. Local CSS
//     override here: .p03-eq .ws-box.
//  3. compare(): a kit helper for `n ( ) n` with the circle on a fixed x (numbers in n-ch tracks either side).
//  4. stack(): add `partials: n` -> n open rows at Hw across all T tracks, "+" pre-printed in the operator
//     track of the last one, then the second 1.5 pt rule (VA-50). The kit CSS has .prow but the helper cannot
//     emit it and .prow.plus does not centre the "+" under the "x". Local helper here: multStack().
//  5. division(): the whole long-division tableau (bracket path, quotient slots, R block, work rows with the
//     pre-printed minus, 0.75 pt subtract rules, dotted guides, grey digit grid, traced model). Local: division().
//  6. band(): an `extra` slot already exists - step chips (PT-LDV-6) could become kit `chips([...])`.
//  7. sideStrip(): needs a top offset option so the strip lines up with the first band (band has 1.5 mm top margin).
//  8. sideStrip(): RP-54 asks for a 1.5 pt outline and 0.75 pt dividers between entries; the kit draws a 1 pt outline
//     and no dividers. Local override here: .p03-stripwrap .ws-sidestrip.
//  9. An oral-frame helper `say([...])` for the foot of a Model band (P-17); 04, 06 and this file each carry a copy.
// 10. .ws-stack .op: the Andika multiplication sign is much smaller than "+" at the same size; consider 1.25 em for it
//     so the operator column reads evenly on partial-product stacks (left as the kit draws it here).
import { page, instruction, grid, band, box, circle, line, sideStrip, withStrip, doc, rng, int, MINUS, TIMES, DIV } from '../kit/kit.mjs';

const r = rng(30319);
const PT = 0.352778;                                   // mm per pt
const SIZE = { S: { pt: 16, hw: 6, ans: 8 }, M: { pt: 22, hw: 8, ans: 10 }, L: { pt: 28, hw: 10, ans: 12 } };
const TRACK = { ican: 0.72, daily: 0.95 };
const f2 = n => n.toFixed(2);

// =====================================================================================================
// A. Equation drill - Daily look, size M, 3 columns, the unknown in every position
// =====================================================================================================
// parts: number | '+' | '-' | '=' | '_'   (the blank is a box in every position on a missing-number sheet)
const SIGN = { '+': '+', '-': MINUS, '=': '=' };
function eqRow(parts, size) {
    const html = parts.map(p => p === '_' ? box(2, size) : SIGN[p] ? `<span class="o">${SIGN[p]}</span>` : `<span class="n">${p}</span>`).join('');
    return { cls: 'p03-eqcell', html: `<div class="p03-eq">${html}</div>` };
}
const FORMS = [
    (a, b, c) => [a, '+', '_', '=', c],      // 27 + [] = 77
    (a, b, c) => ['_', '=', a, '+', b],      // [] = 40 + 12
    (a, b, c) => [c, '-', '_', '=', a],      // 77 - [] = 27
    (a, b, c) => ['_', '+', b, '=', c],      // [] + 50 = 77
    (a, b, c) => [c, '=', a, '+', '_'],      // 77 = 27 + []
    (a, b, c) => ['_', '-', b, '=', a],      // [] - 50 = 27
    (a, b, c) => [a, '+', b, '=', '_'],      // 27 + 50 = []
    (a, b, c) => [a, '=', c, '-', '_'],      // 27 = 77 - []
    (a, b, c) => [c, '-', b, '=', '_'],      // 77 - 50 = []
    (a, b, c) => [c, '=', '_', '+', b],      // 77 = [] + 50
];
const eqItems = Array.from({ length: 30 }, (_, i) => {
    const a = int(r, 12, 64), b = int(r, 11, 98 - a);
    return eqRow(FORMS[(i * 3) % FORMS.length](a, b, a + b), 'M');
});
const drillMissing = page({
    look: 'daily', size: 'M', tab: 5,
    header: { score: 30, tab: ['Level 2', 'Equations', 'Practice A'], title: 'I Can find the missing number' },
    footer: { left: 'missing_add_sub · Grade 2 · 2.NBT.B.5', right: 'Form A' },
    body: instruction('Write the missing number.') + grid(eqItems, { cols: 3, rows: 10, labels: 'tab' }),
    note: '<b>03-A · Equation drill — Daily look, size M, 3 columns.</b> 30 missing-number equations, black tabs, label beside. The unknown sits in every position (first, second, result, and on either side of the equals sign). Blank position is mixed, so left edges align (PT-EQD-2); operands sit in fixed 2-digit tracks, signs in 1 em slots. One slot shape on the sheet: the missing-number box, 14 × 10 mm.',
});

// =====================================================================================================
// B. Equation drill - Daily look, size L, 2 columns, comparison circle
// =====================================================================================================
const cmpPairs = [[41, 38], [67, 76], [250, 205], [98, 102], [314, 314], [560, 506], [89, 98],
    [427, 472], [700, 699], [135, 153], [86, 86], [909, 990], [243, 234], [518, 581]];
const cmpRow = ([a, b]) => ({ cls: 'p03-cmpcell', html: `<div class="p03-cmp"><span class="n l">${a}</span>${circle()}<span class="n">${b}</span></div>` });
const drillCompare = page({
    look: 'daily', size: 'L', tab: 6,
    header: { score: 14, tab: ['Level 2', 'Comparing', 'Practice A'], title: 'I Can compare numbers (to 999)' },
    footer: { left: 'compare · Grade 2 · 2.NBT.A.4', right: 'Form A' },
    body: instruction('Write <, > or = in the circle.') + grid(cmpPairs.map(cmpRow), { cols: 2, rows: 7, labels: 'tab' }),
    note: '<b>03-B · Equation drill — Daily look, size L, 2 columns, comparison items.</b> 14 items, 28 pt digits, a 12 mm circle slot (circle = a sign goes here) on the same x in every cell; numbers sit in 3-digit tracks either side. Pairs include equal numbers, swapped digits and 2-digit against 3-digit.',
});

// =====================================================================================================
// C / D. US-bracket long division
// =====================================================================================================
// model: 'traced' (every answer + working in trace grey) | 'first' (first quotient digit grey) | null
// track: em override - a digit grid is a box scaffold, so it forces 0.95 em tracks (TY-21 / VA-12: 8.4 mm boxes at L)
function division(divisor, dividend, { look = 'ican', size = 'L', digitGrid = false, guides = false, model = null, track = null } = {}) {
    const S = SIZE[size], t = (track || TRACK[look]) * S.pt * PT, RB = 21;       // RB: R block = 3.5 pad + R + 1.5 gap + Hw box
    const dv = String(divisor), dd = [...String(dividend)], nD = dd.length;
    const n = 2 * (nD - dv.length + 1);                               // work rows
    const qH = S.ans, dH = Math.ceil(1.15 * S.pt * PT) + 1.5, wH = S.hw;
    const xG = t * dv.length, xD = xG + 0.6 * t, xE = xD + nD * t, W = xE + RB, H = qH + dH + n * wH;

    // the working, for a traced model
    const rows = []; const q = Array(nD).fill('');
    let cur = 0, started = false;
    dd.forEach((ch, i) => {
        cur = cur * 10 + +ch;
        const qi = Math.floor(cur / divisor);
        if (!started && qi === 0 && i < nD - 1) return;
        started = true; q[i] = String(qi);
        rows.push({ text: String(qi * divisor), end: i });
        cur -= qi * divisor;
        rows.push(i < nD - 1 ? { text: String(cur * 10 + +dd[i + 1]), end: i + 1, bring: true } : { text: String(cur), end: i });
    });                                                               // `cur` is now the remainder
    const traced = model === 'traced';

    // ---- overlay: bracket + vinculum (one path), subtract rules, dotted guides ----
    const xA = xG + 0.7, yV = qH;
    let svg = `<path d="M${f2(xE)},${f2(yV)} L${f2(xA)},${f2(yV)} Q${f2(xA + 3.2)},${f2(yV + dH / 2)} ${f2(xA - 0.3)},${f2(yV + dH - 0.6)}" fill="none" stroke="#000" stroke-width="${f2(1.5 * PT)}" stroke-linejoin="round"/>`;
    const y0 = qH + dH;
    for (let j = 0; j < n; j += 2) svg += `<line x1="${f2(xD - 6)}" x2="${f2(xE)}" y1="${f2(y0 + (j + 1) * wH)}" y2="${f2(y0 + (j + 1) * wH)}" stroke="#000" stroke-width="${f2(0.75 * PT)}"/>`;
    if (guides) for (let k = 0; k <= nD; k++) svg += `<line x1="${f2(xD + k * t)}" x2="${f2(xD + k * t)}" y1="${f2(digitGrid ? yV + 1.2 : 1)}" y2="${f2(H - 0.4)}" stroke="#949494" stroke-width="${f2(PT)}" stroke-dasharray="0 1.2" stroke-linecap="round"/>`;
    // ---- rows ----
    const slot = i => {
        const grey = (traced || (model === 'first' && i === q.findIndex(Boolean))) ? q[i] : '';
        return digitGrid ? `<span class="q"><i class="ws-grey"><span class="ws-trace">${grey}</span></i></span>` : `<span class="q"><span class="ws-trace">${grey}</span></span>`;
    };
    const qRow = `<div class="p03-row" style="height:${qH}mm"><span style="grid-column:1/3"></span>${dd.map((_, i) => slot(i)).join('')}`
        + `<span class="rb"><b>R</b><i data-ws-slot="answer" data-ws-shape="box">${traced ? `<span class="ws-trace">${cur}</span>` : ''}</i></span></div>`;
    const dRow = `<div class="p03-row dvd" style="height:${dH}mm"><span>${dv}</span><span></span>${dd.map(ch => `<span>${ch}</span>`).join('')}</div>`;
    const wRows = Array.from({ length: n }, (_, j) => {
        const w = traced ? rows[j] : null;
        const cells = dd.map((_, i) => { const ch = w ? w.text[w.text.length - 1 - (w.end - i)] : ''; return `<span class="ws-trace">${w && i <= w.end && ch ? ch : ''}</span>`; }).join('');
        return `<div class="p03-row" style="height:${wH}mm">${j % 2 === 0 ? `<span class="mn" style="grid-column:1/3">${MINUS}</span>` : '<span style="grid-column:1/3"></span>'}${cells}</div>`;
    }).join('');

    const cols = `${f2(xG)}mm ${f2(0.6 * t)}mm repeat(${nD},${f2(t)}mm) ${RB}mm`;
    return `<div class="p03-ld" style="--cols:${cols};--tk:${f2(t)}mm;width:${f2(W)}mm;height:${f2(H)}mm" data-ws-slot="answer" data-ws-shape="open">`
        + `<svg class="p03-ov" width="${f2(W)}mm" height="${f2(H)}mm" viewBox="0 0 ${f2(W)} ${f2(H)}" aria-hidden="true">${svg}</svg>${qRow}${dRow}${wRows}</div>`;
}

const LD_TITLE = 'I Can divide three-digit numbers with remainders';
const LD_FOOT = 'div_remainders · Grade 4 · 4.NBT.B.6';

const indepDiv = [[4, 739], [3, 517], [6, 255], [5, 748]];       // 658 / 4 is the traced Model on page D - never reprint it blank
const divIndependent = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 4, tab: ['Level 4', 'Division', 'Lesson 4'], title: LD_TITLE },
    footer: { left: LD_FOOT, center: '3/3', right: 'Form A' },
    body: band('Independent Practice:', 'Divide.', grid(indepDiv.map(([d, n]) => division(d, n)), { cols: 2, rows: 2, labels: 'letter' }), { grow: true }),
    note: '<b>03-C · Long division — I Can look, size L, 2 × 2, Independent.</b> US bracket drawn as one 1.5 pt path; 3-digit by 1-digit with remainders. The vinculum is the answer line (digit grid OFF, so nothing shows how long the quotient is); “R” and its box print in every cell; six 10 mm work rows with the “−” pre-printed and a 0.75 pt rule under each product row only. Alignment guides OFF. Tracks are the I Can 0.72 em (7.1 mm). Spare height stays open under the work rows (PG-14).',
});

const chip = (sign, word) => `<span class="p03-chip"><b>${sign}</b>${word}</span>`;
const arrowDown = `<svg width="2.6mm" height="4mm" viewBox="0 0 2.6 4" aria-hidden="true"><line x1="1.3" x2="1.3" y1="0.2" y2="2.2" stroke="#000" stroke-width="${f2(1.5 * PT)}"/><path d="M0.2,1.9 L2.4,1.9 L1.3,3.9 Z" fill="#000"/></svg>`;
const chips = `<span class="p03-chips">${chip(DIV, 'Divide')}${chip(TIMES, 'Multiply')}${chip(MINUS, 'Subtract')}${chip(arrowDown, 'Bring down')}</span>`;
const ldCell = ([d, n, model]) => division(d, n, { digitGrid: true, guides: true, model, track: 0.95 });
const sayFrame = `<div class="p03-say"><b>Say:</b><span class="p03-q1">“</span>${line(2)}<span>divided by</span>${line(2)}<span>equals</span>${line(2)}<span>remainder</span>${line(2)}<span class="p03-q2">.”</span></div>`;
const divGuided = page({
    look: 'ican', size: 'L', tab: 6, cls: 'p03-guided',
    header: { score: false, tab: ['Level 4', 'Division', 'Lesson 4'], title: LD_TITLE },
    footer: { left: LD_FOOT, center: '2/3', right: 'Form A' },
    body: withStrip(
        band('Model:', 'Trace the answer. Say the steps.', grid([[4, 658, 'traced'], [4, 935, null]].map(ldCell), { cols: 2, rows: 1, labels: 'none' }) + sayFrame, { grow: true })
        + band('Guided Practice:', 'Divide.', grid([[4, 507, 'first'], [4, 786, null]].map(ldCell), { cols: 2, rows: 1, labels: 'none' }), { grow: true, extra: chips }),
        `<div class="p03-stripwrap">${sideStrip([4, 8, 12, 16, 20, 24, 28, 32, 36, 40], { width: 12, pitch: 10.5 })}</div>`),
    note: '<b>03-D · Long division — the same cell as a Guided page, worked-model option ON.</b> Cells unlabelled, no Score. A traced answer may only live in a Model band (P-LC-6 / P-LC-7), so the page has two bands: Model (cell 1 fully traced in grey, cell 2 the same anatomy blank for the teacher to work live, oral frame underneath) and Guided Practice (first quotient digit in grey = hint H5, then structural supports only). Tracks widen to 0.95 em because the digit grid is a box scaffold (TY-21: 8.4 mm boxes at L). Digit grid ON in grey (a 1 pt grey box over every dividend track), alignment guides ON (1 pt grey dotted verticals at track pitch through the dividend and the work rows), step chips share the Guided band strip, multiples strip for the divisor (×4) at the page side, 12 mm wide, 1.5 pt outline with 0.75 pt dividers (RP-54).',
});

// =====================================================================================================
// E / F. Multi-digit multiplication, 2-digit x 2-digit, partial-product rows
// =====================================================================================================
function multStack(a, b, { T = 5 } = {}) {
    const pad = s => [...String(s).padStart(T, ' ')];
    const row = (chars, first = '') => chars.map((ch, i) => `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : ch === ' ' ? '' : ch}</span>`).join('');
    const prow = (first = '') => Array.from({ length: T }, (_, i) => `<span class="p03-pr${i === 0 && first ? ' op' : ''}">${i === 0 ? first : ''}</span>`).join('');
    return `<div class="ws-stack" style="--t:${T}" data-ws-slot="answer" data-ws-shape="open">${row(pad(a))}<span class="gap"></span>${row(pad(b), TIMES)}<span class="rule"></span>`
        + `${prow()}${prow('+')}<span class="rule"></span></div>`;
}
const MULT_TITLE = 'I Can multiply by a two-digit number';
const multL = [[34, 26], [47, 32], [58, 24], [63, 45]];
const multPageL = page({
    look: 'daily', size: 'L', tab: 6,
    header: { score: 4, tab: ['Level 4', 'Multiplying', 'Practice A'], title: MULT_TITLE },
    footer: { left: 'mult_2digit · Grade 4 · 4.NBT.B.5', right: 'Form A' },
    body: instruction('Multiply.') + grid(multL.map(([a, b]) => multStack(a, b)), { cols: 2, rows: 2, labels: 'tab' }),
    note: '<b>03-E · Multi-digit multiplication — Daily look, size L, 2 × 2.</b> 2-digit × 2-digit on 5 tracks (0.95 em). Two open 10 mm partial-product rows across all tracks with the “+” pre-printed in the operator track of the second, then the second 1.5 pt rule and an open answer row. Rows are open (Independent), not boxed. All spare height is working room.',
});

const multM = [[23, 14], [41, 32], [52, 36], [38, 25], [64, 43], [75, 28], [86, 57], [49, 62], [97, 84]];   // easy -> hard, no factor repeated
const multPageM = page({
    look: 'daily', size: 'M', tab: 5,
    header: { score: 9, tab: ['Level 4', 'Multiplying', 'Practice B'], title: MULT_TITLE },
    footer: { left: 'mult_2digit · Grade 4 · 4.NBT.B.5', right: 'Form A' },
    body: instruction('Multiply.') + grid(multM.map(([a, b]) => multStack(a, b)), { cols: 3, rows: 3, labels: 'tab' }),
    note: '<b>03-F · The same cell at size M, 3 × 3.</b> 9 problems; 22 pt digits, 8 mm partial-product rows, 5 mm tabs.',
});

// =====================================================================================================
const css = `
/* A: equations anchored left, beside the tab */
.ws-cell.p03-eqcell { align-items: flex-start; padding: 4mm 2mm 2mm calc(var(--ws-tab) + 3.5mm); }
.p03-eq { font-size: var(--ws-digit); line-height: 1; display: flex; align-items: center; white-space: nowrap; }
.p03-eq .n { width: 2ch; text-align: right; }
.p03-eq .n, .p03-eq .o { position: relative; top: -.035em; }      /* optical: digit centre on the box centre */
.p03-eq .o { width: 1em; text-align: center; font-weight: 700; }
.p03-eq .ws-box { height: calc(var(--ws-hw) + 2mm); }
/* B: comparison, circle on a fixed x */
.ws-cell.p03-cmpcell { padding-top: 7mm; }
.p03-cmp { font-size: var(--ws-digit); line-height: 1; display: grid; grid-template-columns: 3ch auto 3ch; column-gap: .55em; align-items: center; }
.p03-cmp .n.l { text-align: right; }
/* C / D: long division tableau */
.p03-ld { position: relative; font-size: var(--ws-digit); line-height: 1; margin-top: 5mm; flex: none; }
.p03-ov { position: absolute; left: 0; top: 0; display: block; overflow: visible; }
.p03-row { position: relative; display: grid; grid-template-columns: var(--cols); }
.p03-row > span { display: flex; align-items: center; justify-content: center; min-width: 0; }
.p03-row.dvd > span { padding-top: 1mm; }
.p03-row .mn { justify-content: flex-end; font-weight: 700; padding-right: .3mm; }
.p03-row .q { align-items: flex-end; padding-bottom: 1mm; }
.p03-row .q > i { display: flex; align-items: center; justify-content: center; font-style: normal; width: calc(var(--tk) - 1mm); height: var(--ws-hw); border: 1pt solid var(--ws-grey); }
.p03-row .rb { justify-content: flex-start; align-items: flex-end; padding: 0 0 1mm 3.5mm; gap: 1.5mm; }
.p03-row .rb b { font-weight: 400; height: var(--ws-hw); display: flex; align-items: center; }
.p03-row .rb i { display: flex; align-items: center; justify-content: center; font-style: normal; width: var(--ws-hw); height: var(--ws-hw); border: var(--ws-hair) solid var(--ws-ink); }
.p03-chips { margin-left: auto; display: flex; align-items: center; gap: 1.5mm; }
.p03-chip { height: 6mm; padding: 0 2mm; border: var(--ws-hair) solid var(--ws-ink); border-radius: 1mm; display: flex; align-items: center; gap: 1.2mm; font-size: var(--ws-tabtext); white-space: nowrap; }
.p03-guided .ws-strip > b, .p03-guided .ws-strip > span { white-space: nowrap; }
.p03-chip b { font-weight: 700; font-size: 1.5em; line-height: 1; display: flex; align-items: center; }
.p03-stripwrap { flex: none; margin-top: 1.5mm; }
.p03-stripwrap .ws-sidestrip { border-width: var(--ws-heavy); padding: 0; }                       /* RP-54: 1.5 pt outline, 0.75 pt dividers */
.p03-stripwrap .ws-sidestrip span { width: 100%; justify-content: center; }
.p03-stripwrap .ws-sidestrip span + span { border-top: var(--ws-hair) solid var(--ws-ink); }
.p03-say { flex: none; border-top: var(--ws-heavy) solid var(--ws-ink); min-height: 13mm; display: flex; align-items: flex-end; gap: 1.2mm; padding: 0 3mm 2.5mm; font-size: var(--ws-text); }
.p03-say b { font-weight: 700; margin-right: 1mm; } .p03-say span { white-space: nowrap; flex: none; }
.p03-guided .ws-band.grow:first-child { flex-basis: 13.5mm; }                                  /* the Model band is taller by its oral frame, so both rows of cells come out the same height */
.p03-q1 { margin-right: -1.2mm; } .p03-q2 { margin-left: -1.4mm; }
/* E / F: open partial-product rows */
.ws-stack .p03-pr { height: var(--ws-hw); }
`;

export default doc('03 Equation drills, long division, multi-digit multiplication', [drillMissing, drillCompare, divIndependent, divGuided, multPageL, multPageM], css);
