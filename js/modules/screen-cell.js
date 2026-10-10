// screen-cell.js — the on-screen question cell (WORKSHEET_DESIGN_STANDARD.md section 15).
//
// Owner ruling 2026-09-24: the question region of EVERY on-screen host (the practice card, the
// online worksheet, the quiz) is the black-and-white Andika paper cell of the design standard.
// Game chrome — XP, streak, Skip / Hint / Read / Check buttons, correct / wrong feedback — keeps
// its colour and sits OUTSIDE the cell (SC-2, SP-2, SP-30).
//
// This module is the host-side half of that contract. It never generates a question and never
// edits a generator (they belong to other waves); it only decides how an already generated
// question is DRAWN on screen:
//
//   1. `cellKindFor(q)` recognises the items the sheet kit can draw exactly — a two-operand
//      fact (horizontal or vertical, in the notation the generator chose), a column add /
//      subtract / 1-digit multiply, and a US bracket division — by reading the question the
//      pupil actually sees (`q.text`) and re-computing the answer, so a rebuilt cell can never
//      disagree with `q.ans`.
//   2. `equationHTML` / `factHTML` / `stackHTML` / `divisionHTML` draw those items with the SAME
//      builders and class names as print (`sheet/cells/stack.js`, the kit's `.ws-fact` /
//      `.ws-eq` markup), so one drawing is used on paper and on screen (SP-1).
//   3. Everything else keeps its legacy visual, and `monoCell()` holds it to the three paint
//      values of INK-1 — live, so a widget that re-renders or changes state inside the cell is
//      re-inked too. Feedback marks are exempt (SP-30).
//   4. Small shared pieces: the instruction line with the print->screen verb swap (P-LG,
//      PEDAGOGY 10.2), the true operator glyphs (TY-6), and right-to-left digit entry (SP-20).
//
// Layer: 4 (imports the pure sheet kit and data.js's skill table; the build twins load their
// widget on demand).
// No window writes; no state import.

import { opGlyph, toScreenInstruction, factDigitTracks, factGridStyle, ftAnswerMatches, ftSlots, signOf, parseRule, applyRule, renderCell, resolveCtx, getProvider, roundingLineSVG, k2Twin } from './sheet/index.js';
import { optionsFor } from './skill-options.js';
import { isOrderFreeFamily, familyBoxVerdict, familyValuesFromInputs, familyWant, familyComposedRight } from './number-family-check.js';
import {
    supportsForItem, canDraw, supportNeeds, touchNumbers, touchColumns, touchNumberHTML, touchOpts, touchDigit,
    withSupports, supportOpKey as opKey,
} from './sheet/index.js';
import { SKILLS } from './data.js';

export const INK = '#000000';
export const PAPER = '#ffffff';
export const GREY = '#949494';

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ recognising the item */

const OP_NORM = { '+': '+', '-': '-', '−': '-', '–': '-', '×': '*', 'x': '*', 'X': '*', '*': '*', '÷': '/', '/': '/' };

function computeOp(a, op, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 && a % b === 0 ? a / b : NaN;
        default: return NaN;
    }
}

/** Plain text of a question string (tags stripped, entities for the operators decoded). */
export function plainText(s) {
    return String(s == null ? '' : s)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ').trim();
}

/**
 * The two operands, the operator and the answer of a pure fact item — "44 ÷ 4 = ?" — or null.
 * The TEXT is the authority (it is what the pupil reads); the answer is re-computed and must
 * equal `q.ans`, so a rebuilt cell can never ask a different question than the generator did.
 */
export function binaryParts(q) {
    if (!q || typeof q !== 'object') return null;
    if (Array.isArray(q.options) && q.options.length > 0) return null;       // a choice item stays a choice (SP-3)
    if (q.answerType && q.answerType !== 'number') return null;
    const t = plainText(q.text);
    const m = t.match(/^(\d{1,7})\s*([+\-−–×xX*÷/])\s*(\d{1,7})\s*=\s*(?:\?|_+)?\s*$/);
    if (!m) return null;
    const a = Number(m[1]), b = Number(m[3]), op = OP_NORM[m[2]];
    if (!op || !Number.isFinite(a) || !Number.isFinite(b)) return null;
    const ans = Number(String(q.ans).replace(/,/g, ''));
    if (!Number.isInteger(ans) || ans < 0) return null;
    if (computeOp(a, op, b) !== ans) return null;
    return { a, b, op, ans };
}

/**
 * Which kit drawing an item gets on screen, or null for "keep the legacy visual".
 *   eq        horizontal fact / equation   a op b = [ ]
 *   fact      vertical fact (VA-70), the notation the generator chose (facts-column-visual)
 *   stack     column add / subtract / 1-digit multiply with digit boxes (VA-1..VA-13)
 *   division  US bracket division, quotient slot above the vinculum (VA-60, VA-61)
 */
export function cellKindFor(q) {
    const multi = multiAddParts(q);
    if (multi) return multi;
    const p = binaryParts(q);
    if (!p) return null;
    const v = String(q.visual || '');
    const A = String(p.a), B = String(p.b), ANS = String(p.ans);
    if (/Long Division/.test(v) || q.printFormat === 'long-division') {
        return p.op === '/' ? { kind: 'division', ...p } : null;
    }
    if (/column-answer-input/.test(v) && /Column (Addition|Subtraction|Multiplication)/.test(v)) {
        if (p.op === '/') return null;
        if (p.op === '*' && B.length > 1) return null;                         // partial products: legacy
        const T = Math.max(A.length, B.length) + 1;                          // VA-1
        if (ANS.length > T) return null;
        // The generator says whether the item regroups; a plain fact gets no regroup row (the
        // paper prints none), so the screen does not add one either.
        return { kind: 'stack', T, ...p, ...(q.regroup === false ? { regroup: false } : {}) };
    }
    // Round 3 ("cards 1, 3, 6: the cell is empty except a short underline"): a generator that
    // names its kit cell (q.cell) is drawn from it even when its legacy visual is not recognised.
    const cellT = q.cell && q.cell.template;
    const pay = (q.cell && q.cell.payload) || {};
    if (cellT === 'stack' && p.op !== '/' && !(p.op === '*' && B.length > 1)) {
        const T = Math.max(A.length, B.length) + 1;
        if (ANS.length <= T) {
            const noRegroup = q.regroup === false || pay.regroup === false || pay.regroup === 'none';
            return { kind: 'stack', T, ...p, ...(noRegroup ? { regroup: false } : {}) };
        }
    }
    // div_facts' Long-division form (divForm 'long'): the kit bracket on every screen host, so it
    // carries the paper's "Divide." line and the hosts' digit size like the other forms (critic R1
    // D9 / D10: it fell through to the legacy twin, which restated "54 ÷ 9 = ?" over a 48 px bracket).
    if (cellT === 'division' && pay.fact && p.op === '/') return { kind: 'division', ...p, fact: true };
    // div_facts' Fraction form: the kit equation template's fraction drawing, its slot typed.
    if (cellT === 'equation' && pay.notation === 'fraction' && p.op === '/' && (pay.unknown || 'result') === 'result') return { kind: 'eq', frac: true, ...p };
    if (cellT === 'fact' && pay.notation === 'vertical' && A.length <= 2 && B.length <= 2 && ANS.length <= 3) return { kind: 'fact', ...p };
    // div_facts' Vertical form (divForm): a 12s-table dividend has three digits (144 ÷ 12); the
    // paper draws it on the fact template, so the screen does too.
    if (cellT === 'fact' && pay.notation === 'vertical' && p.op === '/' && A.length <= 3 && B.length <= 2 && ANS.length <= 2) return { kind: 'fact', ...p };
    if (v.includes('facts-column-visual')) {
        if (A.length <= 2 && B.length <= 2 && ANS.length <= 3) return { kind: 'fact', ...p };
        return null;
    }
    // div_facts' Standard form (an across division FACT): the paper's tight tracks, and on a Mix
    // page the slot under the sentence as paper prints it (critic R3 §6: 0.7 em on screen against
    // 0.29 em on paper; the Mix slot beside on screen, under on paper).
    if (cellT === 'equation' && pay.fact && !pay.notation && p.op === '/' && (pay.unknown || 'result') === 'result') return { kind: 'eq', ...p, divFact: true, mix: !!pay.mix };
    if (!v.trim()) return { kind: 'eq', ...p };
    return null;
}

/**
 * Three or four numbers added in columns ("24 + 66 + 92 + 57 = ?", add_column_multi). The paper
 * draws them stacked; so does the screen (SP-1): every operand in its own row, the operator on the
 * last row, a regroup strip above and an answer strip sized to the sum's band. Recognised only when
 * the item is a column item (its print format, or a stacked visual), never a plain chain.
 */
export function multiAddParts(q) {
    if (!q || typeof q !== 'object') return null;
    if (Array.isArray(q.options) && q.options.length > 0) return null;
    if (q.answerType && q.answerType !== 'number') return null;
    const t = plainText(q.text);
    const m = t.match(/^(\d{1,6}(?:\s*\+\s*\d{1,6}){2,4})\s*=\s*(?:\?|_+)?\s*$/);
    if (!m) return null;
    const v = String(q.visual || '');
    const column = q.printFormat === 'column-add-multi' || q.notation === 'stacked'
        || /data-ws-seg|column|ws-stack/i.test(v);
    if (!column) return null;
    const operands = m[1].split('+').map((x) => Number(x.trim()));
    if (operands.some((n) => !Number.isFinite(n))) return null;
    const sum = operands.reduce((a, b) => a + b, 0);
    const ans = Number(String(q.ans).replace(/,/g, ''));
    if (ans !== sum) return null;
    const d = Math.max(...operands.map((n) => String(n).length));
    // The answer strip covers every digit track plus one (the sum of 2+ d-digit numbers can have
    // d + 1 digits), never the operator track: the same strip on every item of the band.
    // The kit payload's own answer width (and a `regroup: false`) wins when the generator gives
    // one (add_three stacked: sums to 20, two boxes, no carry box), so the screen draws the
    // printed column.
    const pay = q.cell && q.cell.template === 'stack' && q.cell.payload ? q.cell.payload : null;
    const own = pay && Number(pay.ansDigits) > 0 ? Math.max(String(sum).length, Number(pay.ansDigits)) : 0;
    const strip = own || Math.max(d + 1, String(sum).length);
    return { kind: 'stack', op: '+', operands, a: operands[0], b: operands[operands.length - 1], ans: sum, T: strip + 1, strip,
        ...(pay && pay.regroup === false ? { regroup: false } : {}) };
}

/** The print instruction of a rebuilt item: one verb (PEDAGOGY 10.1). */
export function instructionForKind(k) {
    if (!k) return '';
    return { '+': 'Add.', '-': 'Subtract.', '*': 'Multiply.', '/': 'Divide.' }[k.op] || '';
}

/** Blank width in digits for the answer of an item (SL-2 uses the section's longest answer). */
export function answerDigits(q) {
    const s = String(q && q.ans != null ? q.ans : '').replace(/,/g, '');
    return Math.max(2, Math.min(12, s.length || 2));
}

/* ------------------------------------------------------------------ the kit drawings */

/** TY-6: true operator glyphs in text the pupil reads (hyphen-minus, star, letter x -> − ×). */
export function screenGlyphs(html) {
    return String(html == null ? '' : html)
        .replace(/(\d|\))\s+-\s+(?=\d|\()/g, '$1 − ')
        .replace(/(\d|\))\s*\*\s*(?=\d|\()/g, '$1 × ');
}

/** The on-screen instruction line: the print string with only its verb swapped (SP-4). */
export function screenInstruction(text) {
    try { return toScreenInstruction(text); } catch (e) { return String(text || ''); }
}

/**
 * Apply the verb swap (PEDAGOGY 10.2, SP-4) and the true operator glyphs (TY-6) to a text line
 * in place. Only the FIRST text node can hold the sentence's verb; later nodes (after a
 * vocabulary link) are left alone so a noun ("in the circle") is never swapped as a verb.
 */
export function screenTextLine(el) {
    if (!el || typeof document === 'undefined') return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let first = true;
    while (walker.nextNode()) {
        const n = walker.currentNode;
        if (!n.nodeValue || !n.nodeValue.trim()) continue;
        let v = screenGlyphs(n.nodeValue);
        if (first) { v = screenInstruction(v); first = false; }
        else {
            // Round 3 (H7, "Count the coins. Write the total." on the card): a later node can hold
            // a second sentence's verb. It is swapped only after a sentence break INSIDE the node -
            // the sentinel keeps a word at the node's start (a noun after a vocabulary link, "in
            // the circle") from reading as a verb position.
            const s = screenInstruction('\u0001 ' + v);
            if (s.startsWith('\u0001 ')) v = s.slice(2);
        }
        if (v !== n.nodeValue) n.nodeValue = v;
    }
    // A paper phrase split across a vocabulary link ("<Check> one box.") is swapped on the whole
    // line; the line keeps its text, the link goes (a screen verb has no paper glossary entry).
    const whole = el.textContent || '';
    const swapped = screenInstruction(whole);
    if (swapped !== whole && el.querySelector('.mq-vocab, a, span') && !el.querySelector('input, select, button, textarea, svg, img')) {
        const sr = el.querySelector(':scope > .mq-sr');
        if (!sr) el.textContent = swapped;
        else {
            const head = Array.from(el.childNodes).filter((c) => c !== sr);
            const text = head.map((c) => c.textContent).join('');
            const t2 = screenInstruction(text);
            if (t2 !== text) { head.forEach((c) => c.remove()); el.insertBefore(document.createTextNode(t2), sr); }
        }
    }
}

/**
 * Horizontal fact: `a op b = [slot]` in the kit's `.ws-eq` (TY-25: 1 em operator slots).
 * @param {{a:number,b:number,op:string}} k
 * @param {string} slotHtml  the answer slot (an <input>), or a placeholder host span
 */
export function equationHTML(k, slotHtml) {
    // S2: touch dots on the given numbers (k.supports, screenSupportsFor).
    const tn = k.supports ? touchNumbers({ a: k.a, b: k.b, op: k.op, supports: k.supports }) : { a: false, b: false };
    const to = touchOpts(40, 'px');
    // div_facts' Fraction form (divForm): the dividend over the divisor on a bar, = [slot] - the
    // kit equation template's fraction drawing, same markup as paper (cells/equation.js).
    if (k.frac) {
        return `<div class="ws-sheet mq-kit"><div class="ws-eq mq-eq" data-ws-notation="fraction" style="align-items:center" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
            + `<span class="ws-divfrac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;">`
            + `<span style="border-bottom:1.5pt solid #000;padding:0 0.2em;"><span>${esc(k.a)}</span></span><span style="padding:0 0.2em;"><span>${esc(k.b)}</span></span></span>`
            + `<span class="o">=</span><span class="mq-eqslot">${slotHtml || ''}</span></div></div>`;
    }
    if (k.divFact) {
        // the kit equation cell's division-fact tracks (cells/equation.js ACROSS_OP_EM / ACROSS_GAP_EM)
        const o = (g) => `<span class="o" style="width:0.8em">${g}</span>`;
        const sentence = `<span>${touchNumberHTML(k.a, tn.a, to)}</span>${o(opGlyph(k.op))}<span>${touchNumberHTML(k.b, tn.b, to)}</span>${o('=')}`;
        const label = attr(`${k.a} ${spokenOp(k.op)} ${k.b}`);
        if (k.mix) {
            return `<div class="ws-sheet mq-kit"><div class="ws-eq mq-eq ws-eq-below" role="group" aria-label="${label}" style="flex-direction:column;flex-wrap:nowrap;gap:0.12em">`
                + `<span style="display:flex;align-items:flex-end;gap:0.18em;white-space:nowrap">${sentence}</span><span class="mq-eqslot">${slotHtml || ''}</span></div></div>`;
        }
        return `<div class="ws-sheet mq-kit"><div class="ws-eq mq-eq" role="group" aria-label="${label}" style="gap:0.18em">${sentence}<span class="mq-eqslot">${slotHtml || ''}</span></div></div>`;
    }
    return `<div class="ws-sheet mq-kit"><div class="ws-eq mq-eq" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
        + `<span>${touchNumberHTML(k.a, tn.a, to)}</span><span class="o">${opGlyph(k.op)}</span><span>${touchNumberHTML(k.b, tn.b, to)}</span><span class="o">=</span>`
        + `<span class="mq-eqslot">${slotHtml || ''}</span></div></div>`;
}

/** Vertical fact (VA-70): three 0.72 em tracks, operator on the bottom row, sum rule, then the slot. */
export function factHTML(k, slotHtml) {
    // VA-2 (the kit's fact template): the operator has a track of its OWN, left of the digit
    // tracks, so "×12" never touches; the digit tracks cover both operands and the answer.
    const n = factDigitTracks(k.a, k.b, String(k.ans != null ? k.ans : '').length);
    const A = String(k.a).padStart(n, ' '), B = String(k.b).padStart(n, ' ');
    // S2: touch dots on the digits of the touched number (k.supports, screenSupportsFor).
    const tn = k.supports ? touchNumbers({ a: k.a, b: k.b, op: k.op, supports: k.supports }) : { a: false, b: false };
    const to = touchOpts(40, 'px');
    const row = (s, on) => [...s].map((ch) => (ch === ' ' ? '<span></span>' : (on && touchDigit(ch, true, to)) || `<span>${ch}</span>`)).join('');
    return `<div class="ws-sheet mq-kit"><div class="ws-fact mq-fact" style="${factGridStyle(n)}" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
        + `<span></span>${row(A, tn.a)}<span class="op">${opGlyph(k.op)}</span>${row(B, tn.b)}<span class="rule"></span>`
        + `<span class="ws-factans mq-factans">${slotHtml || ''}</span></div></div>`;
}

/**
 * One set of digit tracks for every vertical fact of a sheet (regrade 2): a "7 − 4" and a
 * "19 − 10" on one worksheet sit in the same tracks, so the stacks line up card to card, as the
 * cells of a printed section do. Empty tracks are added on the left of the narrower facts.
 * Idempotent; returns the track count used.
 */
export function unifyFactTracks(root) {
    if (!root) return 0;
    const facts = Array.from(root.querySelectorAll('.ws-fact.mq-fact'));
    const count = (f) => Number(f.dataset.mqTracks) || Math.max(1, (f.children.length - 4) / 2);
    facts.forEach((f) => { if (!f.dataset.mqTracks) f.dataset.mqTracks = String(count(f)); });
    const N = Math.max(0, ...facts.map(count));
    facts.forEach((f) => {
        const n = count(f);
        if (n >= N) return;
        const kids = Array.from(f.children);
        const opIdx = kids.findIndex((k) => k.classList.contains('op'));
        const pad = () => { const s = document.createElement('span'); s.className = 'mq-factpad'; return s; };
        for (let i = 0; i < N - n; i++) {
            f.insertBefore(pad(), kids[opIdx].nextSibling);
            f.insertBefore(pad(), kids[0].nextSibling);
        }
        f.style.gridTemplateColumns = String(f.style.gridTemplateColumns || '').replace(/repeat\(\d+,/, `repeat(${N},`);
        f.dataset.mqTracks = String(N);
    });
    return N;
}

/**
 * Column arithmetic (VA-1..VA-13) in the kit's `.ws-stack` grid: the operands in their tracks, the
 * operator on the bottom row (VA-2), the sum rule, an optional regroup strip, and a digit strip of
 * inputs under the digit tracks.
 *
 * Screen parity with the page the pupil also gets on paper (RUBRIC, regrade 2026-09-25): the
 * operator track holds no answer box (a box under "+" reads as "write a leading 0"), the strip is
 * sized to the answer's band - the digit tracks, plus one more only for a multi-row sum or an item
 * whose answer really is longer - and a plain fact gets neither place-value heads nor regroup boxes
 * when the paper prints none (`k.regroup === false`).
 *
 * The answer inputs carry `column-answer-input` (SCC-S7): the three existing checkers - the live
 * per-box validation, the submit harvest and the worksheet checker - read them by that class, in
 * DOM order, left to right. They also carry `data-_col-adv-attached="1"` so the old left-to-right
 * auto-advance skips them; `wireStackEntry()` gives them the right-to-left entry of SP-20.
 * Regroup boxes are scratch space: `column-carry-input`, never graded, never auto-focused (SCC-S9).
 */
export function stackHTML(k, { idPrefix = '', regroup = true, answerClass = 'column-answer-input', heads = false } = {}) {
    const operands = (Array.isArray(k.operands) && k.operands.length >= 2 ? k.operands : [k.a, k.b]).map(String);
    const d = Math.max(...operands.map((x) => x.length));
    const ansLen = String(k.ans != null ? k.ans : '').length;
    // strip: the digit tracks under which the pupil writes (never the operator track)
    const strip = k.strip || Math.max(d, ansLen);
    const T = Math.max(k.T || 0, strip + 1, d + 1);
    const seg = (i, n) => (n <= 1 ? 'only' : i === 0 ? 'first' : i === n - 1 ? 'last' : 'mid');
    const tracks = (str) => [...String(str).padStart(T, ' ')];
    const cells = [];
    if (heads && T >= 3) {
        for (let i = 0; i < T; i++) cells.push(`<span class="head">${i === 0 ? '' : ['O', 'T', 'H', 'Th', 'TTh', 'HTh'][T - 1 - i] || ''}</span>`);
        cells.push('<span class="headcap"></span>');
    }
    // Regroup strip (VA-10): above every column except the ones for an addition (and never the
    // operator track); above the top number's digits for a subtraction (VA-22). Absent when the
    // item does not regroup, or has only a ones column.
    let rg = !regroup || k.regroup === false ? false : (k.op === '-' ? 'sub' : 'add');
    if (rg === 'add' && strip < 2) rg = false;
    if (rg === 'sub' && operands[0].length < 2) rg = false;
    if (rg) {
        const all = Array.from({ length: T }, (_, i) => i);
        const on = rg === 'add'
            ? all.filter((i) => i > T - 1 - strip && i < T - 1)
            : all.filter((i) => i > T - 1 - operands[0].length);
        for (let i = 0; i < T; i++) {
            const at = on.indexOf(i);
            if (at < 0) { cells.push('<span class="rg"></span>'); continue; }
            const place = PLACES[T - 1 - i] || '';
            cells.push(`<span class="rg" data-ws-seg="${seg(at, on.length)}"><input type="text" class="column-carry-input mq-carry" data-ws-slot="regroup-${T - 1 - i}" data-ws-graded="0"`
                + ` inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" tabindex="-1"`
                + ` aria-label="regroup, ${place}" data-_col-adv-attached="1" data-_box-val-attached="1"></span>`);
        }
    }
    // S2: touch dots column by column (k.supports, screenSupportsFor).
    const tmode = k.supports ? (k.supports.on.includes('touchall') ? 'all' : k.supports.on.includes('touch') ? 'on' : null) : null;
    const tdRows = tmode ? touchColumns(operands, T, k.op, tmode) : null;
    const to = touchOpts(40, 'px');
    operands.forEach((num, r) => {
        const last = r === operands.length - 1;
        tracks(num).forEach((ch, i) => {
            if (i === 0 && last) cells.push(`<span class="op">${opGlyph(k.op)}</span>`);
            else cells.push((tdRows && tdRows[r][i] && touchDigit(ch, true, to)) || `<span>${ch === ' ' ? '' : ch}</span>`);
        });
        if (!last) cells.push('<span class="gap"></span>');
    });
    cells.push('<span class="rule"></span>');
    for (let i = 0; i < T; i++) {
        const at = i - (T - strip);
        if (at < 0) { cells.push('<span class="ab mq-ab-empty"></span>'); continue; }
        const place = PLACES[T - 1 - i] || `place ${T - i}`;
        cells.push(`<span class="ab" data-ws-seg="${seg(at, strip)}"><input type="text" class="${answerClass} mq-digit" data-slot="ans-${T - 1 - i}" data-ws-slot="ans-${T - 1 - i}" data-ws-shape="box"`
            + ` inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" spellcheck="false"`
            + ` aria-label="answer, ${place} digit" data-_col-adv-attached="1"${idPrefix ? ` data-mq-stack="${attr(idPrefix)}"` : ''}></span>`);
    }
    const label = operands.join(` ${spokenOp(k.op)} `);
    return `<div class="ws-sheet mq-kit" role="group" aria-label="${attr(label)}">`
        + `<div class="ws-stack${rg ? ' wide' : ''}${operands.length > 2 ? ' mq-multi' : ''}" style="--t:${T}" data-ws-slot="answer" data-ws-shape="open">${cells.join('')}</div></div>`;
}

/**
 * US bracket division (VA-60, VA-61): divisor | arc | dividend under a 1.5 pt vinculum, the
 * quotient slot in the row above, right-aligned over the dividend.
 */
export function divisionHTML(k, slotHtml) {
    const arc = '<svg class="mq-ldiv-arc" viewBox="0 0 12 48" preserveAspectRatio="none" aria-hidden="true">'
        + '<path d="M1 1 Q11 24 1 47" fill="none" stroke="#000" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
    return `<div class="ws-sheet mq-kit"><div class="mq-ldiv" role="group" aria-label="${attr(`${k.a} divided by ${k.b}`)}">`
        + `<span class="mq-ldiv-q">${slotHtml || ''}</span>`
        + `<span class="mq-ldiv-dsr">${k.b}</span><span class="mq-ldiv-brk">${arc}</span>`
        + `<span class="mq-ldiv-dvd">${k.a}</span></div></div>`;
}

function spokenOp(op) {
    return { '+': 'plus', '-': 'minus', '*': 'times', '/': 'divided by' }[op] || op;
}

/** The kit drawing for a kind, with the answer slot the host supplies. */
export function kindHTML(k, { slotHtml = '', idPrefix = '', regroup = true, answerClass = 'column-answer-input', supports = null } = {}) {
    if (!k) return '';
    // S2: the item's supports (screenSupportsFor): touch dots on the digits, and the cues, tally
    // row and panes drawn round the problem by the same code as paper (support-draw.js).
    const kk = supports && supports.on && supports.on.length ? Object.assign({}, k, { supports }) : k;
    let html = '';
    if (kk.kind === 'eq') html = equationHTML(kk, slotHtml);
    else if (kk.kind === 'fact') html = factHTML(kk, slotHtml);
    else if (kk.kind === 'division') html = divisionHTML(kk, slotHtml);
    else if (kk.kind === 'stack') html = stackHTML(kk, { idPrefix, regroup, answerClass });
    if (!html || kk === k) return html;
    const p = { a: k.a, b: k.b, op: k.op, operands: k.operands, supports: { ...supports, reserve: [] } };
    return withSupports(html, p, SCREEN_TEMPLATE[k.kind] || 'fact', { mode: 'screen', size: 'L', metrics: { digitPt: 28 } }, { problemWMm: 60, problemHMm: 40 });
}

/* ------------------------------------------------------------------ S2 supports on screen */

const SCREEN_TEMPLATE = { eq: 'equation', fact: 'fact', stack: 'stack', division: 'division' };

/**
 * The supports one screen item carries (design/SUPPORTS.md §S2): its skill's ticked `support`
 * values (q.skillOptions, the set's options) that this kind can draw, dealt by the same allocator
 * as paper for item `index` of a session of `total` (so a fade and a problem-by-problem mix work
 * on the online worksheet and in live practice). null when there is none.
 */
export function screenSupportsFor(q, k, { index = 0, total = 1, categoryId = '', skillId = '', options = null } = {}) {
    if (!q || !k) return null;
    const o = q.skillOptions || options || {};
    let def = null;
    try { def = optionsFor(q.categoryId || categoryId, q.requestedSkillId || q.skillId || skillId).find((d) => d.id === 'support' && d.supportsModel) || null; } catch (e) { def = null; }
    if (!def && skillId) try { def = optionsFor(categoryId, skillId).find((d) => d.id === 'support' && d.supportsModel) || null; } catch (e) { def = null; }
    if (!def) return null;
    const chosen = (Array.isArray(o.support) ? o.support : []).filter((v) => def.render.includes(v));
    if (!chosen.length) return null;
    const template = SCREEN_TEMPLATE[k.kind];
    if (!template) return null;
    const p = { a: k.a, b: k.b, op: k.op, operands: k.operands };
    const can = chosen.filter((id) => canDraw(id, p, template));
    if (!can.length) return null;
    const need = Object.fromEntries(can.map((id) => [id, supportNeeds(id, p, template)]));
    const r = supportsForItem(chosen, { index, total, coverage: o.cover || 'whole', mix: o.mix || 'section', can, need });
    if (!r.on.length) return null;
    const out = { on: r.on };
    if (opKey(k.op) === '/') out.tally = Number(o.band) >= 144 ? 12 : 10;
    if (opKey(k.op) === '*' && Array.isArray(o.constant)) {
        const cs = o.constant;
        if (cs.includes(k.a) !== cs.includes(k.b)) out.table = cs.includes(k.a) ? k.a : k.b;
    }
    return out;
}

/**
 * Regroup boxes: VA-10 puts them above every column whether or not it regroups, as a section
 * option. A skill whose name says it does NOT regroup gets none — the boxes would be scratch
 * space the item can never use.
 */
export function regroupFor(skillId) {
    return !/no_?regroup|without_regroup/i.test(String(skillId || ''));
}

/* ------------------------------------------------------------------ entry order (SP-20) */

/**
 * Right-to-left digit entry for a stack: initial focus on the ones box, typing a digit moves
 * one track left, Backspace in an empty box moves right, the arrow keys move within the row,
 * the Up arrow reaches the regroup box above (SP-23: never auto-focused). Idempotent.
 */
export function wireStackEntry(root, { autofocus = false } = {}) {
    if (!root) return;
    root.querySelectorAll('.ws-stack').forEach((stk) => {
        const boxes = Array.from(stk.querySelectorAll('input.mq-digit'));
        if (!boxes.length) return;
        const carries = Array.from(stk.querySelectorAll('input.mq-carry'));
        boxes.forEach((inp, i) => {
            if (inp.dataset.mqEntry === '1') return;
            inp.dataset.mqEntry = '1';
            inp.addEventListener('input', () => {
                const v = (inp.value || '').replace(/[^0-9]/g, '');
                if (v !== inp.value) inp.value = v;
                if (v.length >= 1 && i > 0) {
                    const left = boxes[i - 1];
                    left.focus();
                    try { left.select(); } catch (e) { /* not selectable */ }
                }
            });
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !(inp.value || '') && i < boxes.length - 1) {
                    e.preventDefault();
                    boxes[i + 1].focus();
                } else if (e.key === 'ArrowLeft' && i > 0) {
                    e.preventDefault(); boxes[i - 1].focus();
                } else if (e.key === 'ArrowRight' && i < boxes.length - 1) {
                    e.preventDefault(); boxes[i + 1].focus();
                } else if (e.key === 'ArrowUp' && carries.length) {
                    // the regroup box in the same column, if there is one
                    const col = boxes.length - 1 - i;             // 0 = ones
                    const target = carries.find((c) => c.getAttribute('data-ws-slot') === `regroup-${col}`);
                    if (target) { e.preventDefault(); target.focus(); }
                }
            });
        });
        carries.forEach((c) => {
            if (c.dataset.mqEntry === '1') return;
            c.dataset.mqEntry = '1';
            c.addEventListener('input', () => {
                const v = (c.value || '').replace(/[^0-9]/g, '');
                if (v !== c.value) c.value = v;
            });
            c.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    const col = String(c.getAttribute('data-ws-slot') || '').replace('regroup-', '');
                    const target = boxes[boxes.length - 1 - Number(col)];
                    if (target) { e.preventDefault(); target.focus(); }
                }
            });
        });
        if (autofocus) {
            const ones = boxes[boxes.length - 1];
            try { ones.focus({ preventScroll: true }); } catch (e) { ones.focus(); }
        }
    });
}

/* ------------------------------------------------------------------ green as soon as it is right
 * Owner request (2026-09-25): "If a cell is correct it should immediately turn green - including
 * regrouping cells and answer cells. If the cell is just one digit, then that digit; if the cell
 * is the whole number, wait until the correct digits are all in." Each writing place learns the
 * value it should hold; as the pupil types, a place whose value IS that value gets
 * `mq-live-correct` (a feedback mark, SP-30 - the only colour allowed in the cell). A correct
 * prefix of a whole number is never green; a wrong value is never red while typing (wrong is
 * only shown by Check, which keeps today's marking). A regroup box that should stay empty stays
 * neutral whatever is typed. The expected values live in a WeakMap, never in the page's markup.
 */
const LIVE_EXPECT = new WeakMap();
// test hook (read-only): the answers a live box accepts — lets the browser sweeps type a right answer
if (typeof window !== 'undefined') window.__mqLiveExpect = (el) => (LIVE_EXPECT.get(el) || null);
const _liveNorm = (v) => String(v == null ? '' : v).replace(/[,\s]/g, '').replace(/[−–]/g, '-').replace(/[×xX*]/g, '×').toLowerCase();

/*
 * WAVE 1 / A2 (owner 2026-10-02): "Each answer box should turn green as it's filled if correct, or
 * red if wrong." Each box is judged on its own against the value it was bound to (the same
 * expectations as the green above, which come from each item's own answer data and accepted forms):
 *   - right at once: `mq-live-correct` (green + a tick in the corner)
 *   - wrong: `mq-live-wrong` (red + a cross in the corner) once the pupil leaves the box (blur or
 *     Tab) or the box holds as many characters as its longest accepted answer
 * Editing a red box clears its red; it is judged again when filled again. Colour is never the only
 * cue (the corner mark), and the digits are never covered. A red box adds NO wrong try: the Skip
 * count stays per Check press. The quiz never wires this (it would reveal answers).
 */
const LIVE_NUM = new WeakSet();       // a single numeric answer place: "7.0" and "7" are the same number
const _isNum = (v) => v !== '' && v !== '-' && v !== '.' && Number.isFinite(Number(v));

// Leaving a box for the item's own Hint / Read / Check / speaker / Skip is not "leaving the box":
// the entry may be half typed, so it is not judged (red) until the pupil goes to another answer
// box or away from the item. relatedTarget covers keyboard and most pointers; the pointerdown
// stamp covers browsers whose buttons take no focus on click.
const _CONTROL_SEL = 'button, a[href], [role="button"], .hint-popup, .mq-wsbar, #hintBtn, .hint-btn, .ws-tts-btn';
let _lastControlDown = 0;
if (typeof document !== 'undefined' && !window.__mqCtlDownBound) {
    window.__mqCtlDownBound = true;
    document.addEventListener('pointerdown', (e) => { if (e.target && e.target.closest && e.target.closest(_CONTROL_SEL)) _lastControlDown = Date.now(); }, true);
}
function _toControl(e) {
    const t = e && e.relatedTarget;
    if (t && t.closest && t.closest(_CONTROL_SEL)) return true;
    return !t && Date.now() - _lastControlDown < 700;
}

const LIVE_FN = new WeakMap();        // a box judged by a function of its value (a rule table's "make" rows)

/*
 * The tick / cross badge sits on the box's OUTER corner, never on its digits, and clear of everything
 * else in the item (another answer box, a jump arc, a bar or rule, a label). It is a child of the item's
 * own card (#questionCard / .problem-card), placed against that card, so a dialog, the settings panel or
 * the hint box covers it exactly as it covers the box. It is placed again when the box or the card
 * changes size (ResizeObserver), on resize, and when the card scrolls; the box's own classes say which
 * badge it shows and it goes with the box.
 */
const BADGES = new Map();            // box -> { b: the badge span, host: the item card }
let _badgeSeq = 0;
let _badgeRO = null;
let _badgeRaf = 0;
let _measureCtx = null;
/** Where the pupil's digits are in a box (viewport px): the text's width, and the cap height about the middle. */
function _writtenRect(el, r) {
    const v = String(el.value || '');
    if (!v) return null;
    try {
        _measureCtx = _measureCtx || document.createElement('canvas').getContext('2d');
        const cs = getComputedStyle(el);
        _measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const tw = _measureCtx.measureText(v).width;
        const fs = parseFloat(cs.fontSize) || 16;
        const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, bw = parseFloat(cs.borderLeftWidth) || 0;
        const left = /left|start/.test(cs.textAlign) ? r.left + bw + pl : r.left + pl + (r.width - pl - pr) / 2 - tw / 2;
        return { l: left, r: left + tw, t: r.top + r.height / 2 - 0.36 * fs, b: r.top + r.height / 2 + 0.36 * fs };
    } catch (e) { return null; }
}
const _rectOf = (q) => ({ l: q.left, r: q.right, t: q.top, b: q.bottom });
const _overlapArea = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
const _BOX_FRAME = 'table, tr, td, th, tbody, [data-mq-cell], .k2-tile, .ab, .rg, .mq-cellbox, .mq-slothost';
const _BADGE_SKIP = '.mq-wsbar, .hint-popup, button, .mq-live-badge, .mq-sr, script, style';

/** What a badge must not sit on in this item (viewport rects): the digits written in the box, other answer
 *  boxes, drawn arcs and lines, text (labels, numbers, signs) and the rules and bars (element borders). */
function _obstacles(host, el, r) {
    const out = [];
    const w = _writtenRect(el, r);
    if (w) out.push(w);
    host.querySelectorAll('input:not([type="hidden"]), textarea').forEach((o) => {
        if (o === el) return;
        const q = o.getBoundingClientRect();
        if (q.width && q.height) out.push(_rectOf(q));
    });
    host.querySelectorAll('svg path, svg line, svg polyline, svg text').forEach((o) => {
        if (o.closest(_BADGE_SKIP)) return;
        if (o.tagName === 'path' && typeof o.getTotalLength === 'function' && typeof o.getScreenCTM === 'function') {
            // a curve (a jump arc) is its stroke, not the empty box around it: sample along it
            try {
                const m = o.getScreenCTM(); const svg = o.ownerSVGElement; const len = o.getTotalLength();
                if (m && svg && len > 0) {
                    for (let d = 0; d <= len + 0.1; d += 4) {
                        const pt = svg.createSVGPoint(); const p0 = o.getPointAtLength(Math.min(d, len)); pt.x = p0.x; pt.y = p0.y;
                        const sp = pt.matrixTransform(m);
                        out.push({ l: sp.x - 1.5, r: sp.x + 1.5, t: sp.y - 1.5, b: sp.y + 1.5 });
                    }
                    return;
                }
            } catch (e) { /* fall back to the box */ }
        }
        const q = o.getBoundingClientRect();
        if (q.width || q.height) out.push(_rectOf(q));
    });
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    const rng = document.createRange();
    while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!/\S/.test(t.nodeValue || '')) continue;
        const pe = t.parentElement;
        if (!pe || pe.closest(_BADGE_SKIP) || pe.tagName === 'OPTION') continue;
        rng.selectNodeContents(t);
        Array.from(rng.getClientRects()).forEach((q) => { if (q.width && q.height) out.push(_rectOf(q)); });
    }
    host.querySelectorAll('*').forEach((o) => {
        if (o === el || o.contains(el) || o.closest(_BADGE_SKIP) || o.tagName === 'svg' || o.closest('svg')) return;
        // a grid's own lines and an answer box's own tile are the box's surroundings, not rules to keep clear of
        if (o.matches(_BOX_FRAME)) return;
        const cs = getComputedStyle(o);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const q = o.getBoundingClientRect();
        if (!q.width || !q.height) return;
        const e = (side) => (cs['border' + side + 'Style'] !== 'none' ? parseFloat(cs['border' + side + 'Width']) || 0 : 0);
        const T = e('Top'), B = e('Bottom'), Lf = e('Left'), Rt = e('Right');
        if (T >= 1) out.push({ l: q.left, r: q.right, t: q.top, b: q.top + T });
        if (B >= 1) out.push({ l: q.left, r: q.right, t: q.bottom - B, b: q.bottom });
        if (Lf >= 1) out.push({ l: q.left, r: q.left + Lf, t: q.top, b: q.bottom });
        if (Rt >= 1) out.push({ l: q.right - Rt, r: q.right, t: q.top, b: q.bottom });
    });
    return out;
}

/** Where the badge goes: as near the box's top-right corner as it can sit without touching anything. The
 *  band around the box (and its inside, if the box is roomy) is searched in 3 px steps, nearest the corner
 *  first, outside the box before inside; the position with no overlap is taken, else the least overlap. */
function _badgeSpot(el, r, host) {
    const w = r.width, h = r.height;
    const cands = [];
    for (let L = -19; L <= w + 1; L += 3) {
        for (let T = -19; T <= h + 1; T += 3) {
            const cx = L + 9, cy = T + 9;
            const inside = cx > 6 && cx < w - 6 && cy > 6 && cy < h - 6;
            // only the band around the box, or the inside of a roomy box
            if (!inside && !(cx < 3 || cx > w - 3 || cy < 3 || cy > h - 3)) continue;
            cands.push({ c: [L, T], d: Math.hypot(cx - w, cy) + (inside ? 14 : 0) });
        }
    }
    cands.sort((x, y) => x.d - y.d);
    const obs = _obstacles(host, el, r);
    let best = [w - 12, -11], bestArea = Infinity;
    for (const { c } of cands) {
        const box = { l: r.left + c[0], r: r.left + c[0] + 18, t: r.top + c[1], b: r.top + c[1] + 18 };
        let area = 0;
        for (const o of obs) { area += _overlapArea(box, o); if (area >= bestArea) break; }
        if (area < bestArea) { best = c; bestArea = area; if (area === 0) break; }
    }
    return best;
}

function _badgePlace(el) {
    const rec = BADGES.get(el);
    if (!rec) return;
    const { b, host } = rec;
    const kind = el.classList.contains('mq-live-wrong') ? 'bad' : el.classList.contains('mq-live-correct') ? 'ok' : '';
    if (!el.isConnected || !host.isConnected || !kind) { _badgeDrop(el); return; }
    b.dataset.kind = kind;
    const r = el.getBoundingClientRect();
    // not shown while the box is not
    // (the hint now sits in page flow above the cell, so the tick stays while it is open)
    // a box scrolled out of view inside its own swipe row (a ten-column chart, a number line) hides its badge
    let clipped = false;
    for (let a = el.parentElement; a && a !== host; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if ((ox === 'auto' || ox === 'scroll' || ox === 'hidden') && a.scrollWidth > a.clientWidth + 1) {
            const q = a.getBoundingClientRect();
            if (r.right <= q.left + 2 || r.left >= q.right - 2) { clipped = true; break; }
        }
    }
    if (!r.width || !r.height || clipped) { b.style.display = 'none'; return; }
    b.style.display = '';
    const c = _badgeSpot(el, r, host);
    const hr = host.getBoundingClientRect();
    b.style.left = Math.round(r.left + c[0] - hr.left - host.clientLeft + host.scrollLeft) + 'px';
    b.style.top = Math.round(r.top + c[1] - hr.top - host.clientTop + host.scrollTop) + 'px';
}
function _badgeDrop(el) {
    const rec = BADGES.get(el);
    if (!rec) return;
    rec.b.remove();
    BADGES.delete(el);
    if (_badgeRO) { try { _badgeRO.unobserve(el); } catch (e) { /* gone */ } }
    delete el.dataset.mqBadge;
}
/** Badges whose box has left the page (a new question drew over the card) go with it. */
export function pruneBadges() {
    Array.from(BADGES.keys()).forEach((el) => { if (!el.isConnected) _badgeDrop(el); });
    Array.from(MIRRORS.keys()).forEach((el) => { if (!el.isConnected) _mirrorDrop(el); });
}
function _badgePlaceAll() {
    _badgeRaf = 0;
    Array.from(BADGES.keys()).forEach(_badgePlace);
    Array.from(MIRRORS.keys()).forEach(_mirrorPlace);
}
function _badgeSoon() {
    if (!_badgeRaf && typeof requestAnimationFrame === 'function') _badgeRaf = requestAnimationFrame(_badgePlaceAll);
}
function _badgeTrack(el) {
    if (typeof document === 'undefined' || !document.body) return;
    const host = el.closest('#questionCard, .problem-card');
    if (!host) return;
    pruneBadges();
    if (!BADGES.has(el)) {
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        const b = document.createElement('span');
        b.className = 'mq-live-badge';
        b.setAttribute('aria-hidden', 'true');
        const id = String(++_badgeSeq);
        b.dataset.id = id; el.dataset.mqBadge = id;
        host.appendChild(b);
        BADGES.set(el, { b, host });
        if (typeof ResizeObserver === 'function') {
            _badgeRO = _badgeRO || new ResizeObserver(_badgeSoon);
            _badgeRO.observe(el); _badgeRO.observe(host);
        }
        if (host.dataset.mqBadgeHost !== '1') {
            host.dataset.mqBadgeHost = '1';
            host.addEventListener('scroll', _badgeSoon, true);
            window.addEventListener('resize', _badgeSoon);
        }
    }
    _badgeSoon();
    // the layout settles after the verdict (fonts, a ladder step, the screen-fit pass); never while the
    // pupil is typing in this card (the scan must not slow the keys)
    const settle = () => { const a = document.activeElement; if (!(a && a.tagName === 'INPUT' && host.contains(a))) _badgePlace(el); };
    setTimeout(settle, 150);
    setTimeout(settle, 600);
}

/* ---- Wave 1 / A3 (owner 2026-10-03): the wrong DIGITS blink red; tapping a red box empties it ----
 * Practice card and online worksheet only (never the quiz, never paper). A one-digit box that is wrong
 * IS the wrong digit (class mq-wrong-digit). A box that holds several digits gets a mirror overlay, one
 * span per digit compared by place value, right-aligned: wrong digits mq-wd-bad, a missing digit an
 * empty mq-wd-miss box, the right digits stay black. The input's own text goes clear under the mirror,
 * so typing is untouched (the mirror goes on the next keystroke or the tap that empties the box). */
const MIRRORS = new Map();
// the expected value of a box bound by a judge (mixed / improper fractions): its digits can still be compared
const LIVE_WANT = new WeakMap();
const _inQuiz = (el) => !!(el && el.closest && el.closest('#quizTakeView'));
function _mirrorDrop(el) {
    const m = MIRRORS.get(el);
    if (m) { m.remove(); MIRRORS.delete(el); }
    el.classList.remove('mq-wd-mirrored', 'mq-wrong-digit');
}
function _mirrorPlace(el) {
    const m = MIRRORS.get(el);
    if (!m) return;
    const host = m.parentElement;
    if (!el.isConnected || !host || !host.isConnected) { _mirrorDrop(el); return; }
    const r = el.getBoundingClientRect(), hr = host.getBoundingClientRect(), cs = getComputedStyle(el);
    // a box inside its own swipe row (a count-by row): the digits are clipped to the row's window
    let clip = 'none';
    for (let a = el.parentElement; a && a !== host; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if ((ox === 'auto' || ox === 'scroll' || ox === 'hidden') && a.scrollWidth > a.clientWidth + 1) {
            const q = a.getBoundingClientRect();
            const L = Math.max(0, q.left - r.left), R = Math.max(0, r.right - q.right);
            clip = (L + R >= r.width) ? 'inset(0 100% 0 0)' : 'inset(0 ' + Math.round(R) + 'px 0 ' + Math.round(L) + 'px)';
            break;
        }
    }
    Object.assign(m.style, {
        left: Math.round(r.left - hr.left - host.clientLeft + host.scrollLeft) + 'px',
        top: Math.round(r.top - hr.top - host.clientTop + host.scrollTop) + 'px',
        width: Math.round(r.width) + 'px', height: Math.round(r.height) + 'px', clipPath: clip,
        fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing,
        paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
        justifyContent: /center/.test(cs.textAlign) ? 'center' : /right|end/.test(cs.textAlign) ? 'flex-end' : 'flex-start',
    });
}
/** A written number in parts: its sign, its digit runs and the marks between them (".", "/", a space). */
function _wdParse(s) {
    const t = String(s == null ? '' : s).trim().replace(/,/g, '').replace(/\s+/g, ' ').replace(/[−–]/g, '-');
    const m = /^(-?)\s*([0-9./ ]*)$/.exec(t);
    if (!m || !m[2] || !/\d/.test(m[2])) return null;
    const parts = m[2].split(/([./ ])/);         // run, sep, run, sep, run ...
    const runs = parts.filter((_, i) => i % 2 === 0);
    const seps = parts.filter((_, i) => i % 2 === 1);
    return { sign: m[1], runs, seps };
}
/** Line two parsed numbers up part by part; null when their shapes cannot be compared digit by digit. */
function _wdAlign(v, w) {
    let vr = v.runs, wr = w.runs, seps = v.seps;
    const sameSeps = v.seps.join('|') === w.seps.join('|');
    let dotMissing = false;
    if (!sameSeps) {
        // decimals line up at the point: a missing point (and the digits after it) are missing marks
        const dec = (p) => p.seps.every((x) => x === '.') && p.seps.length <= 1;
        if (!dec(v) || !dec(w)) return null;
        vr = [v.runs[0], v.runs[1] != null ? v.runs[1] : ''];
        wr = [w.runs[0], w.runs[1] != null ? w.runs[1] : ''];
        seps = ['.'];
        dotMissing = !v.seps.length;
    }
    const cells = [];
    if (v.sign || w.sign) cells.push(v.sign && w.sign ? { ch: '-', cls: '' } : v.sign ? { ch: '-', cls: 'bad' } : { ch: ' ', cls: 'miss' });
    vr.forEach((a, k) => {
        if (k > 0) cells.push({ ch: seps[k - 1] === ' ' ? ' ' : seps[k - 1], cls: k === 1 && dotMissing ? 'miss' : '', sep: true });
        const b = wr[k] || '';
        const left = k > 0 && seps[k - 1] === '.';      // the digits after a point line up from the point
        const n = Math.max(a.length, b.length);
        for (let i = 0; i < n; i++) {
            const x = left ? a[i] : a[i - (n - a.length)];
            const y = left ? b[i] : b[i - (n - b.length)];
            if (x === undefined) cells.push({ ch: ' ', cls: 'miss' });
            else cells.push({ ch: x, cls: x === y ? '' : 'bad' });
        }
    });
    return cells;
}
/** For tests: the marks a value gets against an answer ("." right, "b" wrong, "m" missing, "|" a separator), or null. */
export function wrongDigitPattern(value, want) {
    const v = _wdParse(value), w = _wdParse(want);
    const cells = v && w ? _wdAlign(v, w) : null;
    return cells ? cells.map((c) => (c.sep && c.cls !== 'miss' ? '|' : c.cls === 'bad' ? 'b' : c.cls === 'miss' ? 'm' : '.')).join('') : null;
}
/** Mark the wrong digits of a box judged wrong. Returns true when it could compare digit by digit. */
function _markWrongDigits(el, want) {
    _mirrorDrop(el);
    if (_inQuiz(el) || typeof document === 'undefined') return false;
    const v = _wdParse(el.value);
    if (!v) return false;
    const ws = (Array.isArray(want) ? want : [want]).map(_wdParse).filter(Boolean);
    const w = ws.find((x) => x.seps.join('|') === v.seps.join('|')) || ws[0];
    if (!w) return false;
    const plain = (p) => !p.sign && !p.seps.length && p.runs[0].length === 1;
    if (plain(v) && plain(w)) { el.classList.add('mq-wrong-digit'); return true; }
    const cells = _wdAlign(v, w);
    if (!cells) return false;
    const host = el.closest('#questionCard, .problem-card');
    if (!host) return false;
    const m = document.createElement('span');
    m.className = 'mq-wd-mirror';
    m.setAttribute('aria-hidden', 'true');
    m.dataset.v = el.value;
    cells.forEach((c) => {
        const s = document.createElement('span');
        s.className = 'mq-wd' + (c.cls === 'bad' ? ' mq-wd-bad' : c.cls === 'miss' ? ' mq-wd-miss' : '') + (c.sep ? ' mq-wd-sep' : '');
        s.textContent = c.cls === 'miss' ? ' ' : c.ch;
        m.appendChild(s);
    });
    // on the card, like the corner mark (a cell's own redraws never touch it); _mirrorPlace keeps it on its box
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(m);
    MIRRORS.set(el, m);
    el.classList.add('mq-wd-mirrored');
    _mirrorPlace(el);
    setTimeout(() => _mirrorPlace(el), 150);
    _mirrorWatch();
    return true;
}
// A checker that empties or rewrites a box without an input event (the ladder's last try, Check all)
// must not leave its old digits floating: a mirror whose box no longer holds its value goes.
let _mirrorTimer = 0;
function _mirrorWatch() {
    if (_mirrorTimer || typeof setInterval !== 'function') return;
    _mirrorTimer = setInterval(() => {
        MIRRORS.forEach((m, el) => { if (!el.isConnected || el.value !== m.dataset.v) _mirrorDrop(el); });
        if (!MIRRORS.size) { clearInterval(_mirrorTimer); _mirrorTimer = 0; }
    }, 200);
}
/**
 * THE one way a checker empties or resets a box it has marked: the value, the red / green, the
 * corner mark and the digit mirror all go together (Wave 1 / A3 critic r1).
 */
export function clearBoxMark(el, value = '') {
    if (!el) return;
    el.value = value;
    el.classList.remove('mq-live-wrong', 'mq-live-correct', 'mq-wd-empty');
    el.removeAttribute('aria-invalid');
    _mirrorDrop(el);
    _badgeDrop(el);
}
let _tabAt = 0;
let _clearWired = false;
function _clearIfWrong(el) {
    if (!el || _inQuiz(el) || el.disabled || el.readOnly || !el.classList.contains('mq-live-wrong')) return;
    clearBoxMark(el);
    el.style.borderColor = ''; el.style.background = '';
    // the item stays "helped" (host.dataset.mqHelped is kept): a cleared box still went red
    const card = el.closest('.problem-card');
    if (card && !card.querySelector('input.mq-live-wrong')) { card.style.background = ''; card.style.border = ''; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
}
function _wireClear() {
    if (_clearWired || typeof document === 'undefined') return;
    _clearWired = true;
    // a pupil's tap or click empties a red box; a Tab into it only selects it (typing replaces it, and
    // Tabbing THROUGH it keeps it) - never a program focus (the app refocuses the box after Check)
    document.addEventListener('pointerdown', (e) => { if (e.target && e.target.tagName === 'INPUT') _clearIfWrong(e.target); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Tab') _tabAt = Date.now(); }, true);
    document.addEventListener('focusin', (e) => {
        const t = e.target;
        if (Date.now() - _tabAt < 400 && t && t.tagName === 'INPUT' && t.classList.contains('mq-live-wrong') && !_inQuiz(t)) {
            setTimeout(() => { try { if (document.activeElement === t) t.select(); } catch (_) { /* not selectable */ } }, 0);
        }
    }, true);
    window.addEventListener('resize', () => Array.from(MIRRORS.keys()).forEach(_mirrorPlace));
}
/**
 * The item was judged wrong at Check: the digit boxes the pupil left empty are missing digits, so
 * they are marked too (an answer digit box only; a regroup box may rightly stay empty).
 */
export function markMissingDigits(root) {
    if (!root || _inQuiz(root)) return 0;
    let n = 0;
    root.querySelectorAll('input.mq-digit, input.mq-cellslot:not(.mq-cellslot-host), input.ib-cell').forEach((el) => {
        if (el.classList.contains('mq-carry') || LIVE_FN.has(el) || String(el.value || '').trim() !== '') return;
        const want = LIVE_EXPECT.get(el);
        if (!want || !want.some((w) => w !== '') || !el.offsetWidth) return;
        _liveSet(el, false, true);
        el.classList.add('mq-wrong-digit', 'mq-wd-empty');
        n++;
    });
    return n;
}

function _liveSet(el, ok, bad) {
    el.classList.toggle('mq-live-correct', ok);
    el.classList.toggle('mq-live-wrong', bad);
    if (ok || bad) _badgeTrack(el);
    el.classList.remove('mq-wd-empty');
    if (bad) { _wireClear(); _markWrongDigits(el, LIVE_WANT.get(el) || LIVE_EXPECT.get(el)); } else _mirrorDrop(el);
    if (bad) {
        el.setAttribute('aria-invalid', 'true');
        // owner 2026-10-02: an item whose box went red before it was checked right is "helped"
        const host = el.closest('.problem-card, #questionCard');
        if (host) host.dataset.mqHelped = '1';
    } else el.removeAttribute('aria-invalid');
}

/** Did any box of this item (the practice card, or a worksheet card) go red since it was drawn? */
export function itemWasHelped(host) {
    return !!host && host.dataset && host.dataset.mqHelped === '1';
}

function _liveMark(el, final) {
    const fn = LIVE_FN.get(el);
    if (fn) {
        const raw = String(el.value == null ? '' : el.value).trim();
        const verdict = raw === '' ? null : fn(raw);
        _liveSet(el, verdict === true, verdict === false && !!final);
        return;
    }
    const want = LIVE_EXPECT.get(el);
    if (!want) return;
    const v = _liveNorm(el.value);
    // a missing digit marked at Check stays marked while the box is still empty: a blur or a move (the
    // ladder redraws the stack around the box the caret is in) is not the pupil answering it
    if (v === '' && el.classList.contains('mq-wd-empty')) return;
    const num = LIVE_NUM.has(el);
    const ok = v !== '' && want.some((w) => _liveNorm(w) === v || (num && _isNum(v) && _isNum(_liveNorm(w)) && Number(v) === Number(_liveNorm(w))));
    const maxLen = Math.max(...want.map((w) => _liveNorm(w).length));
    // a single answer place judges on fill only when its answer is a number (anything else waits for Check)
    const judgeable = !el.hasAttribute('data-mq-single') || num;
    // a number entry that starts with 0 is still being written ("07" is accepted for 7): not red yet
    const zeroLead = num && /^-?0/.test(v) && v.length < maxLen + 1;
    const bad = !ok && v !== '' && judgeable && ((!!final) || (v.length >= maxLen && !zeroLead));
    _liveSet(el, ok, bad);
}

function _liveBind(el, expected, { single = false, numeric = false } = {}) {
    const list = (Array.isArray(expected) ? expected : [expected]).map((w) => String(w == null ? '' : w)).filter((w) => w !== '');
    if (!el || !list.length) return false;
    LIVE_EXPECT.set(el, list);
    if (single) el.setAttribute('data-mq-single', '1'); else el.removeAttribute('data-mq-single');
    if (numeric) LIVE_NUM.add(el); else LIVE_NUM.delete(el);
    if (el.dataset.mqLive !== '1') {
        el.dataset.mqLive = '1';
        el.addEventListener('input', () => _liveMark(el, false));
        el.addEventListener('change', () => _liveMark(el, false));      // the blur that follows judges it
        el.addEventListener('blur', (e) => _liveMark(el, !_toControl(e)));
    }
    _liveMark(el, false);
    return true;
}

/**
 * Bind a box to a judge: fn(value) -> true | false | null (null: cannot be judged yet). `group` is
 * the other boxes the verdict depends on (a rule table's Out box depends on its In box): when one
 * of them changes, the rest are judged again - a box the pupil has left is judged as final.
 */
function _liveBindFn(el, fn, group = [], want = null) {
    if (!el || typeof fn !== 'function') return false;
    LIVE_FN.set(el, fn);
    if (want != null && want !== '') LIVE_WANT.set(el, [String(want)]); else LIVE_WANT.delete(el);
    LIVE_EXPECT.set(el, ['']);             // marks the box as bound (unwire, markBoxSubmitted)
    if (el.dataset.mqLive !== '1') {
        el.dataset.mqLive = '1';
        // The other boxes of the group are re-judged as UNFINISHED (a half-typed In number must not turn
        // its neighbours red); a box that is already red stays red unless it is now right.
        const again = (final) => {
            _liveMark(el, final);
            group.forEach((o) => {
                if (o === el || !String(o.value || '').trim()) return;
                const wasRed = o.classList.contains('mq-live-wrong');
                _liveMark(o, false);
                if (wasRed && !o.classList.contains('mq-live-correct')) _liveSet(o, false, true);
            });
        };
        el.addEventListener('input', () => again(false));
        el.addEventListener('change', () => again(false));
        el.addEventListener('blur', (e) => again(!_toControl(e)));
    }
    _liveMark(el, false);
    return true;
}

/**
 * The host's Check judged the one answer place: colour the box (green / red + its corner mark)
 * and keep the host's own message (no double feedback). Only a visible place that IS the answer,
 * never a hidden host fed by several boxes.
 */
export function markBoxSubmitted(el, ok) {
    if (!el || el.type === 'hidden' || el.classList.contains('mq-cellslot-host')) return;
    if (!el.offsetWidth && !el.offsetHeight) return;
    el.classList.toggle('mq-live-correct', !!ok);
    el.classList.toggle('mq-live-wrong', !ok);
    _badgeTrack(el);
    if (!ok) { _wireClear(); const w = LIVE_WANT.get(el) || LIVE_EXPECT.get(el); if (w && w.some((x) => x !== '')) _markWrongDigits(el, w); }
    else _mirrorDrop(el);
    if (!ok) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    if (el.dataset.mqSubmitMark !== '1') {
        el.dataset.mqSubmitMark = '1';
        el.addEventListener('input', () => {
            if (LIVE_EXPECT.has(el)) return;               // a bound box re-judges itself
            el.classList.remove('mq-live-wrong', 'mq-live-correct');
            el.removeAttribute('aria-invalid');
            _mirrorDrop(el);
        });
    }
}

/** Stop marking an input that outlives its cell (the practice card's #answerInput). */
export function unwireLiveCorrect(el) {
    if (!el) return;
    LIVE_EXPECT.delete(el);
    LIVE_NUM.delete(el);
    LIVE_FN.delete(el);
    el.removeAttribute('data-mq-single');
    el.classList.remove('mq-live-correct', 'mq-live-wrong');
    el.removeAttribute('aria-invalid');
    _mirrorDrop(el);
}

/**
 * The digit each box of a kit stack should hold: answer digits by column (0 = ones), and the
 * regroup boxes that should hold something - a carry of an addition or a 1-digit multiplication,
 * the new top digit of a subtraction's regrouped column ("12" over a 2, "9" over a 0 that was
 * borrowed through). A regroup box whose column does not regroup is absent (it stays neutral).
 */
export function stackExpectations(k) {
    const out = { ans: {}, regroup: {} };
    if (!k) return out;
    const ans = String(k.ans != null ? k.ans : '').replace(/[^0-9]/g, '');
    [...ans].reverse().forEach((ch, c) => { out.ans[c] = ch; });
    const operands = (Array.isArray(k.operands) && k.operands.length >= 2 ? k.operands : [k.a, k.b]).map((x) => String(x));
    const digitAt = (s, c) => { const i = s.length - 1 - c; return i >= 0 ? Number(s[i]) : 0; };
    const width = Math.max(...operands.map((s) => s.length));
    if (k.op === '+') {
        let carry = 0;
        for (let c = 0; c < width; c++) {
            const sum = operands.reduce((t, s) => t + digitAt(s, c), 0) + carry;
            carry = Math.floor(sum / 10);
            if (carry > 0) out.regroup[c + 1] = String(carry);
        }
    } else if (k.op === '*' && operands.length === 2) {
        const [top, by] = String(operands[0]).length >= String(operands[1]).length ? operands : [operands[1], operands[0]];
        if (by.length === 1) {
            let carry = 0;
            for (let c = 0; c < top.length; c++) {
                const p = digitAt(top, c) * Number(by) + carry;
                carry = Math.floor(p / 10);
                if (carry > 0 && c + 1 < top.length) out.regroup[c + 1] = String(carry);
            }
        }
    } else if (k.op === '-' && operands.length === 2) {
        const [top, bot] = operands;
        let borrow = 0;
        for (let c = 0; c < top.length; c++) {
            let cur = digitAt(top, c) - borrow;
            borrow = 0;
            if (cur < digitAt(bot, c)) { cur += 10; borrow = 1; }
            if (cur !== digitAt(top, c)) out.regroup[c] = String(cur);
        }
    }
    return out;
}

const _ftNum = (s) => (/^\d+$/.test(String(s).replace(/,/g, '').trim()) ? Number(String(s).replace(/,/g, '')) : NaN);
const _ftSameRule = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((s, i) => s.op === b[i].op && Number(s.n) === Number(b[i].n));

/**
 * A rule table's boxes, in reading order (the slots of ftSlots). A table with a fixed answer
 * (outputs / inputs / mixed / rule tasks) judges each box against its slot's value, the way
 * ftAnswerMatches does. A "make your own" table has no fixed answer, so each box is judged from
 * the rule: an Out box must be the rule applied to its row's In box, an In box a whole number
 * that no other row uses, the check box the rule's value.
 */
function _bindFunctionTable(boxes, p) {
    const slots = ftSlots(p);
    if (!slots.length || slots.length !== boxes.length) return 0;
    let n = 0;
    if (p.task === 'make') {
        const rows = {};
        slots.forEach((s, k) => { if (s.row !== undefined) (rows[s.row] = rows[s.row] || {})[s.col] = boxes[k]; });
        const inBoxes = Object.values(rows).map((r) => r.in).filter(Boolean);
        const outAll = [...inBoxes, ...Object.values(rows).map((r) => r.out).filter(Boolean)];
        slots.forEach((s, k) => {
            const b = boxes[k];
            let fn = null;
            if (s.id === 'chk') fn = (v) => _ftNum(v) === Number(p.check.y);
            else if (s.col === 'in') fn = (v) => Number.isFinite(_ftNum(v)) && inBoxes.filter((o) => o !== b && _ftNum(o.value) === _ftNum(v)).length === 0;
            else if (s.col === 'out') {
                const inEl = rows[s.row] && rows[s.row].in;
                fn = (v) => { const i = inEl ? _ftNum(inEl.value) : NaN; return Number.isFinite(i) ? applyRule(p.rule, i) === _ftNum(v) : null; };
            }
            if (fn && _liveBindFn(b, fn, outAll)) n++;
        });
        return n;
    }
    slots.forEach((s, k) => {
        const b = boxes[k];
        let ok = false;
        if (s.kind === 'sign') ok = _liveBindFn(b, (v) => signOf(v) !== '' && signOf(v) === signOf(s.value));
        else if (s.kind === 'rule') ok = _liveBindFn(b, (v) => _ftSameRule(parseRule(v), p.rule));
        else ok = _liveBindFn(b, (v) => _ftNum(v) === Number(s.value));
        if (ok) n++;
    });
    return n;
}

const _fracNorm = (s) => String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase();

function _bindOwnBoxes(root, q) {
    let n = 0;
    const bind = (el, expected, opts) => { if (el && el.dataset.mqLive !== '1' && _liveBind(el, expected, opts)) n++; };
    // A number family is right in ANY order (owner 2026-10-04): each row may hold any fact its sign
    // makes, no fact twice. A box's verdict depends on the other rows, so they are one group.
    if (isOrderFreeFamily(q)) {
        const fam = Array.from(root.querySelectorAll('input.number-family-input[data-eq][data-pos]'));
        fam.forEach((el) => {
            if (el.dataset.mqLive === '1') return;
            const r = Number(el.getAttribute('data-eq')), p = Number(el.getAttribute('data-pos'));
            const fn = () => {
                const w = familyWant(q.numberFamilyData, familyValuesFromInputs(fam), r, p);
                if (w != null) LIVE_WANT.set(el, [String(w)]);
                return familyBoxVerdict(q.numberFamilyData, fam, el);
            };
            if (_liveBindFn(el, fn, fam)) n++;
        });
    }
    // data-answer, compared exactly (the older checkers compare the trimmed text)
    root.querySelectorAll('input.fact-family-input[data-answer], input.number-family-input[data-answer], input.area-model-input[data-answer], input.area-model-total[data-answer], input.fp-input[data-answer]')
        .forEach((el) => bind(el, String(el.dataset.answer).replace(/,/g, '')));
    // expanded form: the place-value part as a number
    root.querySelectorAll('input.expanded-input-box[data-expected]').forEach((el) => bind(el, el.getAttribute('data-expected'), { numeric: true }));
    if (q && Array.isArray(q.expandedValues)) {
        root.querySelectorAll('input.ws-expanded-input').forEach((el) => {
            const v = q.expandedValues[Number(el.getAttribute('data-expanded-idx'))];
            if (v !== undefined) bind(el, String(v), { numeric: true });
        });
    }
    // coordinates: point idx, x then y
    if (q && Array.isArray(q.ans) && q.ans.every((p) => p && typeof p === 'object' && 'x' in p)) {
        root.querySelectorAll('input.ci-x, input.ci-y').forEach((el) => {
            const pt = q.ans[Number(el.getAttribute('data-point'))];
            if (pt) bind(el, String(el.classList.contains('ci-x') ? pt.x : pt.y), { numeric: true });
        });
    }
    // perimeter + area
    if (q && q.dualAnswers) {
        bind(root.querySelector('#perimeterInput, [id^="ws_perimeter_"]'), String(q.dualAnswers.perimeter), { numeric: true });
        bind(root.querySelector('#areaInput, [id^="ws_area_"]'), String(q.dualAnswers.area), { numeric: true });
    }
    // mixed number + improper fraction: the checker's own compare (trim, collapse spaces, lower-case)
    if (q && q.dualFractionAnswers) {
        [['#mixedInput', q.dualFractionAnswers.mixed], ['#improperInput', q.dualFractionAnswers.improper]].forEach(([sel, want]) => {
            const el = root.querySelector(sel);
            if (el && el.dataset.mqLive !== '1' && _liveBindFn(el, (v) => _fracNorm(v) === _fracNorm(want), [], want)) n++;
        });
    }
    // ordering boxes: the n-th item of the answer (text, else the same number)
    if (q && typeof q.ans === 'string' && root.querySelector('input.order-input-box, input.ws-order-input')) {
        const parts = q.ans.split(',').map((s) => s.trim());
        root.querySelectorAll('input.order-input-box, input.ws-order-input').forEach((el) => {
            const want = parts[Number(el.getAttribute('data-order-idx'))];
            if (want !== undefined && el.dataset.mqLive !== '1') {
                if (_liveBindFn(el, (v) => { const u = v.replace(/,/g, '').replace(/\s+/g, ''); return u === want || (Number.isFinite(parseFloat(u)) && Number.isFinite(parseFloat(want)) && parseFloat(u) === parseFloat(want)); }, [], want)) n++;
            }
        });
    }
    // a legacy column's answer boxes (no kit slot ids): the answer's digits, right-aligned
    const cols = Array.from(root.querySelectorAll('input.column-answer-input:not(.column-carry-input):not([data-ws-slot])'));
    if (cols.length && q && q.ans != null && /^-?[\d,]+$/.test(String(q.ans))) {
        const d = String(q.ans).replace(/[^0-9]/g, '');
        cols.forEach((el, i) => { const at = d.length - cols.length + i; if (at >= 0) bind(el, d[at]); });
    }
    return n;
}

/** The value each of a multi-slot answer's boxes should hold (reading order), or null. */
function _slotExpectations(q, count, join) {
    if (!q || !count) return null;
    const sets = q.inlineBlanksData && Array.isArray(q.inlineBlanksData.acceptedSets) ? q.inlineBlanksData.acceptedSets : null;
    if (q.answerType === 'inline-blanks' && sets) {
        return Array.from({ length: count }, (_, k) => sets.filter((s) => s.length === count).map((s) => String(s[k])));
    }
    if (q.ftCheck) return null;                                    // a rule table has no one answer per box
    let parts;
    if (Array.isArray(q.ans)) parts = q.ans.map(String);
    else if (join === ':' || join === '.' || join === '/') parts = String(q.ans).split(join);
    else if (join === 'mixed') {
        // a mixed number's three boxes (frac-model.js): whole, numerator, denominator
        const m = /^\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)\s*$/.exec(String(q.ans));
        const w = /^\s*(\d+)\s*$/.exec(String(q.ans));
        parts = m ? [m[1] || '', m[2], m[3]] : w ? [w[1], '', ''] : null;
    }
    else if (join === ' h ') { const m = /(\d+)\s*h\s*(\d+)/.exec(String(q.ans)); parts = m ? [m[1], m[2]] : null; }
    else if (join === '') { const d = String(q.ans == null ? '' : q.ans).replace(/[^0-9]/g, ''); parts = d.length === count ? d.split('') : null; }
    else parts = String(q.ans == null ? '' : q.ans).split(/\s*,\s*|\s+R\s+/i);
    if (!parts || parts.length !== count) return null;
    return parts.map((p) => [p.trim()]);
}

/**
 * Wire the live green mark in one cell. `kind` is the kit kind the host drew (a stack's digit
 * and regroup boxes), `single` the host's own answer input when the cell answers in one place
 * (green only once the WHOLE value is right). Returns the number of places wired.
 */
export function wireLiveCorrect(root, { q = null, kind = null, single = null } = {}) {
    if (!root || !q) return 0;
    pruneBadges();
    const _h = root.closest && root.closest('.problem-card, #questionCard');
    if (_h && !(_h.id === 'questionCard' && root.id === 'answerInputArea')) delete _h.dataset.mqHelped;   // a new item starts clean
    let n = 0;
    // 1. a kit stack: each answer digit, each regroup box that should hold something
    const stk = root.querySelector('.ws-stack');
    if (stk && kind && kind.kind === 'stack') {
        const ex = stackExpectations(kind);
        stk.querySelectorAll('input.mq-digit').forEach((inp) => {
            const col = Number(String(inp.getAttribute('data-ws-slot') || '').replace('ans-', ''));
            if (Number.isFinite(col) && ex.ans[col] !== undefined && _liveBind(inp, ex.ans[col])) n++;
        });
        stk.querySelectorAll('input.mq-carry').forEach((inp) => {
            const col = Number(String(inp.getAttribute('data-ws-slot') || '').replace('regroup-', ''));
            if (Number.isFinite(col) && ex.regroup[col] !== undefined && _liveBind(inp, ex.regroup[col])) n++;
        });
    }
    // 2. several boxes in one drawing (a time, an amount, a strip, a sentence's boxes)
    const cellslots = Array.from(root.querySelectorAll('input.mq-cellslot:not(.cloze-cell)'));
    const ibs = cellslots.length ? [] : Array.from(root.querySelectorAll('input.ib-cell'));
    const boxes = cellslots.length ? cellslots : ibs;
    if (boxes.length) {
        const joinEl = boxes[0].closest('[data-mq-join]');
        const join = joinEl ? joinEl.getAttribute('data-mq-join') : ', ';
        const exp = _slotExpectations(q, boxes.length, join);
        if (q.ftCheck) n += _bindFunctionTable(boxes, q.ftCheck);
        else if (exp) boxes.forEach((b, k) => { if (_liveBind(b, exp[k])) n++; });
    }
    // 2b. WAVE 1 / A2: the older drawings that answer in their own boxes. Each judges against the
    // value its own checker uses (never a stricter one):
    //   fact / number family, area model, factor-pair blanks: the box's `data-answer`, exact;
    //   expanded form: `data-expected`, as a number; coordinates: the point's x / y;
    //   perimeter + area: `dualAnswers`; mixed + improper: `dualFractionAnswers`; ordering: the
    //   n-th item of the answer; a legacy column's answer boxes: the answer's digits, right-aligned.
    n += _bindOwnBoxes(root, q);
    // 3. the host's one answer place: the whole value, never a prefix
    if (single && !single.classList.contains('mq-cellslot-host') && single.type !== 'hidden') {
        const a = q.ans;
        const whole = a != null && typeof a !== 'object' ? [String(a)] : [];
        if (Array.isArray(q.acceptedAnswers)) q.acceptedAnswers.forEach((x) => { if (x != null && typeof x !== 'object') whole.push(String(x)); });
        if (typeof a === 'number' && Number.isInteger(a)) whole.push(a.toLocaleString('en-US'));
        if (whole.length && _liveBind(single, whole, { single: true, numeric: q.answerType === 'number' || typeof a === 'number' })) n++;
    }
    return n;
}

/* ------------------------------------------------------------------ check boxes -> tap (P-29) */

const CHECK_SVG = '<svg class="mq-tickmark" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10.5l4.2 4.2L16.5 5.5" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * The screen twin of a printed "Check one box." cell (PEDAGOGY 10.2: Check a box -> Tap; SP-3:
 * a choice on paper stays a choice on screen, never a typed word). A K-2 decision cell prints a
 * list of labels, each with a hollow box on its right (P-TH-11). Here each row becomes one tap
 * target (role radio, >= 44 px); a tap draws the check mark in the box and writes the answer
 * into the host's own answer input, so every existing checker keeps working unchanged.
 *
 * Only items that say so are adapted: `q.selfAnswering` (the cell draws its own response) and
 * `q.printAnswer` (the label of the right box, which the answer key prints).
 *
 * @param {Element} cellEl
 * @param {Object} q
 * @param {HTMLInputElement} input  the host's answer input (#answerInput, ws_input_N)
 * @returns {boolean} true when the cell was adapted
 */
export function wireTickBoxes(cellEl, q, input) {
    if (!cellEl || !q || !input || !q.selfAnswering || !q.printAnswer) return false;
    const norm = (s) => plainText(s).toLowerCase().replace(/\s+/g, ' ').trim();
    const rows = Array.from(cellEl.querySelectorAll('div')).filter((d) => {
        const kids = Array.from(d.children);
        if (kids.length !== 2 || kids[0].tagName !== 'SPAN' || kids[1].tagName !== 'SPAN') return false;
        const box = kids[1];
        return !box.textContent.trim() && /border/.test(box.getAttribute('style') || '') && !!kids[0].textContent.trim();
    });
    if (rows.length < 2) return false;
    const right = norm(q.printAnswer);
    if (!rows.some((r) => norm(r.children[0].textContent) === right)) return false;
    const group = rows[0].parentElement;
    if (group) { group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', 'answer choices'); }
    const pick = (row) => {
        rows.forEach((r) => {
            const on = r === row;
            r.setAttribute('aria-checked', on ? 'true' : 'false');
            r.children[1].innerHTML = on ? CHECK_SVG : '';
        });
        const label = row.children[0].textContent;
        // The right box writes the generator's own answer; any other box writes its label, which
        // no checker accepts — so the verdict is the checker's, not this adapter's.
        input.value = norm(label) === right ? String(q.ans) : label.trim();
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    rows.forEach((row) => {
        if (row.dataset.mqTick === '1') return;
        row.dataset.mqTick = '1';
        row.classList.add('mq-tickrow');
        row.setAttribute('role', 'radio');
        row.setAttribute('aria-checked', 'false');
        row.setAttribute('tabindex', '0');
        row.children[1].classList.add('mq-tickbox');
        row.addEventListener('click', () => { if (!input.disabled) pick(row); });
        row.addEventListener('keydown', (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !input.disabled) { e.preventDefault(); pick(row); }
        });
    });
    cellEl.classList.add('mq-tick-mode');
    return true;
}

/* ------------------------------------------------------------------ one slot per answer (SL-7) */

/**
 * One slot per answer on screen, as on paper (SL-7, RUBRIC H8). A legacy visual may draw its own
 * answer blank: the ruled blank after "=" in "5 − 2 = ___", the empty box of a number bond. The
 * generator marks that blank `data-mq-blank="line"` or `"box"`. When the cell holds EXACTLY ONE
 * such blank, the host's answer input takes its place, so the pupil writes where the paper pupil
 * writes and the host's separate answer row is left empty (the caller hides it). The input keeps
 * its id and listeners, so every checker keeps working; a box blank lends the input its size.
 *
 * @param {Element} cellEl                 the cell (or the visual inside it)
 * @param {HTMLInputElement} input         the host's answer input
 * @returns {boolean} true when the input moved into the visual
 */
/**
 * One answer area (owner ruling 2026-09-26): "where they give a blank, it should not have a
 * separate answer area". A legacy drawing or sentence that draws its ONE blank without the
 * `data-mq-blank` marker - an `.answer-blank-inline` rule, an element holding only "___", or
 * "___" inside a sentence - gets the marker, so adoptVisualBlank moves the host's input there.
 * Only when the root holds exactly one such blank (several blanks are a multi-slot item, which
 * its own twin wires). Returns the number of blanks marked (0 or 1).
 */
const HOST_AREAS = '.mq-answerrow, .qt-answer-area, #answerInputArea, input, select, textarea, button, .mq-sr, [data-mq-screen-only]';
export function markLegacyBlanks(root) {
    if (!root || typeof document === 'undefined') return 0;
    if (root.querySelector('[data-mq-blank], [data-mq-cell]')) return 0;
    const ok = (el) => el && !el.closest(HOST_AREAS) && !el.closest('[hidden]') && !(el.closest('svg'));
    const v2 = markV2Blanks(root, ok);
    if (v2) return v2;
    const found = [];
    root.querySelectorAll('.answer-blank-inline').forEach((el) => { if (ok(el) && !(el.textContent || '').trim()) found.push({ el, kind: 'el' }); });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const t = walker.currentNode;
        const v = t.nodeValue || '';
        const m = v.match(/_{3,}/g);
        if (!m || !ok(t.parentElement) || t.parentElement.closest('.answer-blank-inline')) continue;
        if (m.length > 1) return 0;
        found.push({ el: t.parentElement, node: t, kind: v.trim().replace(/_{3,}/, '') ? 'text' : 'leaf' });
    }
    if (found.length !== 1) return 0;
    const f = found[0];
    if (f.kind === 'el') {
        f.el.setAttribute('data-mq-blank', 'line');
    } else if (f.kind === 'leaf' && f.el.childNodes.length === 1) {
        const cs = typeof getComputedStyle !== 'undefined' ? getComputedStyle(f.el) : null;
        const boxed = cs && ['Top', 'Right', 'Bottom', 'Left'].every((k) => (parseFloat(cs[`border${k}Width`]) || 0) >= 1);
        f.el.textContent = '';
        f.el.setAttribute('data-mq-blank', boxed ? 'box' : 'line');
        if (boxed) f.el.setAttribute('style', 'display:inline-block;min-width:3em;min-height:1.4em;');
    } else {
        const v = f.node.nodeValue;
        const i = v.search(/_{3,}/);
        const len = v.slice(i).match(/^_+/)[0].length;
        const span = document.createElement('span');
        span.className = 'mq-legblank';
        span.setAttribute('data-mq-blank', 'line');
        const after = f.node.splitText(i);
        after.nodeValue = after.nodeValue.slice(len);
        f.node.parentNode.insertBefore(span, after);
    }
    return 1;
}

/**
 * The drawn blanks of a `.ws-v2-cell` visual (the new skills' legacy drawing): an empty box or
 * rule with a border. The LAST one outside a "Say:" frame is the answer (the input goes there);
 * any earlier one is working - a real input that is not graded; a "Say:" frame's blank is said,
 * not typed. A round box is a sign circle.
 */
function markV2Blanks(root, ok) {
    const cells = root.matches && root.matches('.ws-v2-cell') ? [root] : Array.from(root.querySelectorAll('.ws-v2-cell'));
    if (!cells.length || typeof getComputedStyle === 'undefined') return 0;
    const empty = (el) => !(el.textContent || '').replace(/\u00a0/g, '').trim();
    const bordered = (el) => {
        const cs = getComputedStyle(el);
        const w = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0);
        return w[2] >= 1 ? (w.every((x) => x >= 1) ? (parseFloat(cs.borderTopLeftRadius) >= el.getBoundingClientRect().width * 0.35 ? 'circle' : 'box') : 'line') : '';
    };
    let n = 0;
    cells.forEach((cell) => {
        let cands = Array.from(cell.querySelectorAll('span, div'))
            .filter((el) => ok(el) && empty(el) && !el.querySelector('svg, img, input') && bordered(el) && el.getBoundingClientRect().width >= 12);
        cands = cands.filter((el) => !cands.some((o) => o !== el && el.contains(o)));   // innermost
        // a sum rule is a block with only a bottom border: drawing, never a blank
        cands = cands.filter((el) => !(bordered(el) === 'line' && getComputedStyle(el).display === 'block'));
        const oral = (el) => /^\s*Say:/i.test((el.parentElement && el.parentElement.textContent) || '');
        let graded = cands.filter((el) => !oral(el));
        // a drawn box (or circle) is the answer place when there is one; rules are then working
        if (graded.some((el) => bordered(el) !== 'line')) graded = graded.filter((el) => bordered(el) !== 'line');
        if (!graded.length) return;
        const last = graded[graded.length - 1];
        graded.slice(0, -1).forEach((el) => {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'mq-workbox';
            inp.setAttribute('data-mq-work', '1');
            inp.setAttribute('inputmode', 'numeric');
            inp.setAttribute('autocomplete', 'off');
            inp.setAttribute('aria-label', 'working');
            el.textContent = '';
            el.appendChild(inp);
        });
        const shape = bordered(last);
        last.textContent = '';
        last.setAttribute('data-mq-blank', shape === 'line' ? 'line' : shape);
        n++;
    });
    return n;
}

export function adoptVisualBlank(cellEl, input) {
    if (!cellEl || !input) return false;
    wireNumberLines(cellEl);
    if (!cellEl.querySelector('[data-mq-blank]')) markLegacyBlanks(cellEl);
    const blanks = cellEl.querySelectorAll('[data-mq-blank]');
    if (blanks.length !== 1) return false;
    const blank = blanks[0];
    // A K-2 picture cell answers in a box on paper ("5 − 2 = [ ]", the sheet's equation
    // template), whatever the legacy drawing's blank was: the screen matches the page.
    const circle = blank.getAttribute('data-mq-blank') === 'circle';
    const box = !circle && (blank.getAttribute('data-mq-blank') === 'box' || !!blank.closest('.k2-cell'));
    input.classList.add('mq-slot', 'mq-slot--invisual');
    input.classList.toggle('mq-slot--box', box);
    // a sign circle (the kit twin of "Write <, > or = in the circle.") keeps the paper's circle
    input.classList.toggle('mq-slot--circle', circle);
    if (circle) {
        input.setAttribute('maxlength', '1');
        input.setAttribute('inputmode', 'text');
        // a circle that takes other signs (= or ≠, frac-model.js) names them
        const signs = blank.getAttribute('data-mq-signs');
        if (signs) input.dataset.mqSigns = signs;
        input.setAttribute('aria-label', `sign: ${signs ? signs.split(',').join(' or ') : '<, = or >'}`);
    }
    if (box && !blank.classList.contains('mq-kblank')) {
        // The box is positioned by the drawing (a bond's corner boxes are absolutely placed):
        // the input inherits the box's own placement and size, and draws its border.
        input.dataset.mqPrevStyle = input.getAttribute('style') || '';
        input.style.cssText += `;${blank.getAttribute('style') || ''}`;
        input.style.removeProperty('display');
        // a K-2 kit box keeps the paper's shape (a square for a count): the host's slot rules
        // would widen it into a line-slot rectangle (regrade 2)
        const bw = blank.style.width, bh = blank.style.height;
        if (/--mq-k2/.test(bw) && /--mq-k2/.test(bh)) {
            input.style.setProperty('--mq-bw', bw);
            input.style.setProperty('--mq-bh', bh);
            input.classList.add('mq-bsize');
        }
    }
    blank.replaceWith(input);
    return true;
}

/**
 * Several answers in one drawing (a multiplication chart's empty cells): the generator marks
 * each boxed slot `data-mq-cell`. On screen each becomes its own input, where the paper pupil
 * writes (one input per answer, never three answers typed into one comma list). The values
 * travel to the host's answer input in reading order, joined ", ", which is what `q.ans` holds,
 * so every checker keeps working. The host input is hidden; its row is the caller's to hide.
 *
 * @param {Element} cellEl
 * @param {HTMLInputElement} input   the host's answer input (#answerInput, ws_input_N, #qtAnswerInput)
 * @param {{onChange?: function(string): void}} [opts]
 * @returns {boolean} true when the cell's slots were wired
 */
/** What a typed slot keeps: digits; a sign circle one sign (as its glyph); a rule line signs and digits. */
function _slotChars(v, kind) {
    const glyph = (t) => t.replace(/[*xX]/g, '×').replace(/[/:]/g, '÷').replace(/-/g, '−');
    if (kind === 'sign') { const m = glyph(String(v)).match(/[+−×÷]/g); return m ? m[m.length - 1] : ''; }
    if (kind === 'rule') return glyph(String(v)).replace(/[^0-9+−×÷ ]/g, '');
    return String(v).replace(/[^0-9]/g, '');
}

/**
 * A ten-column number chart on a phone swipes sideways INSIDE its own cell (owner ruling 2026-10-02,
 * WORKSHEET_DESIGN_STANDARD.md SP-11 exception). The "swipe" cue under it hides when the grid is scrolled to
 * the end (or fits), and a box that takes focus scrolls into view so no empty square is missed.
 */
function wireChartSwipe(cellEl) {
    cellEl.querySelectorAll('.k2-chartwindow').forEach((w) => {
        if (w.dataset.mqSwipe === '1' || !w.querySelector('.k2-chart-ten')) return;
        w.dataset.mqSwipe = '1';
        const upd = () => { w.toggleAttribute('data-mq-end', w.scrollWidth <= w.clientWidth + 1 || w.scrollLeft + w.clientWidth >= w.scrollWidth - 2); };
        w.addEventListener('scroll', upd, { passive: true });
        window.addEventListener('resize', upd);
        w.addEventListener('focusin', (e) => {
            if (e.target && e.target.scrollIntoView) e.target.scrollIntoView({ inline: 'center', block: 'nearest' });
        });
        upd(); setTimeout(upd, 300); setTimeout(upd, 1000);
    });
}

/** The disk mat's window (kitCellTwin): the same swipe cue, hidden when the mat fits or is scrolled to the end. */
// ONE shared resize listener for every disk window on the page (critic nit: one per render piled up
// and kept old nodes alive); it updates the windows that are in the page now.
const diskWinEnd = (w) => { w.toggleAttribute('data-mq-end', w.scrollWidth <= w.clientWidth + 1 || w.scrollLeft + w.clientWidth >= w.scrollWidth - 2); };
let diskResizeWired = false;
export function wireDiskSwipe(root) {
    if (!root || !root.querySelectorAll) return;
    if (!diskResizeWired && typeof window !== 'undefined') {
        diskResizeWired = true;
        window.addEventListener('resize', () => document.querySelectorAll('.mq-diskwin').forEach(diskWinEnd));
    }
    root.querySelectorAll('.mq-diskwin').forEach((w) => {
        const upd = () => diskWinEnd(w);
        if (w.dataset.mqSwipe !== '1') {
            w.dataset.mqSwipe = '1';
            w.addEventListener('scroll', upd, { passive: true });
            setTimeout(upd, 300); setTimeout(upd, 1000);
        }
        upd();
    });
}

/** A count-by row swipes sideways inside its cell on a phone; a box that takes focus scrolls into view so no gap is missed. */
function wireSwipeRows(cellEl) {
    cellEl.querySelectorAll('[data-mq-swiperow]').forEach((w) => {
        if (w.dataset.mqSwipe === '1') return;
        w.dataset.mqSwipe = '1';
        // the cue (SP-11a, extended to count-by rows 2026-10-02) hides at the end of the row, or when the row fits
        // the step-tab column beside the row: each entry as tall as its line (the boxes keep a 44 px floor on screen)
        const col = w.previousElementSibling && w.previousElementSibling.matches('[data-mq-tabcol]') ? w.previousElementSibling : null;
        const frame = col ? w.parentElement : null;
        const level = () => {
            if (!col) return;
            const lines = w.querySelectorAll('.k2-countrow-line');
            const swipes = frame && frame.hasAttribute('data-mq-swipes');
            col.querySelectorAll('[data-mq-tabfor]').forEach((t) => {
                const ln = lines[Number(t.getAttribute('data-mq-tabfor'))];
                if (!ln) return;
                t.style.height = swipes ? '' : `${ln.getBoundingClientRect().height}px`;
                t.style.marginTop = swipes ? '' : getComputedStyle(ln).marginTop;
            });
        };
        // the row's end lands on a column start too (a little air after the last line), so scrolling to the end cuts no number
        const body = w.querySelector('.k2-countrow-body');
        const items = () => { const ln = w.querySelector('.k2-countrow-line [data-mq-wrapped]'); return ln ? [...ln.children] : []; };
        const padEnd = () => {
            if (!body || !col) return;
            body.style.paddingRight = '0px';
            const cw = w.clientWidth, max0 = w.scrollWidth - cw;
            if (max0 <= 0) return;
            const v = w.getBoundingClientRect(), sl = w.scrollLeft;
            const xs = items().map((e) => e.getBoundingClientRect().left - v.left + sl).filter((x) => x >= max0 - 0.5);
            if (xs.length) body.style.paddingRight = `${Math.max(0, Math.min(...xs) - max0)}px`;
        };
        // critic C2 r6: when the row is wider than the cell, the step tab goes ABOVE line 1 (the window takes the cell's full width)
        // and the window is a whole number of columns wide, so no number is cut at its right edge either
        let firstSnap = null, firstFlag = false, held = null, lastSL = 0;
        // the forward cue (critic C2 r7): shown only while a number or a box lies past the row's right edge (the turn arrows do not count)
        const moreRight = () => {
            const v = w.getBoundingClientRect();
            return [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body input')].some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > v.right + 1; });
        };
        // the cue stays on ONE line inside a narrow window (29 px digits on a phone, TY-10b): its type shrinks to fit, never under 14 px
        const fitCue = (win) => {
            const cues = w.querySelector('.k2-swipe-cues');
            if (!cues) return;
            cues.querySelectorAll('.k2-swipe-cue, .k2-swipe-back').forEach((c) => { c.style.fontSize = ''; });
            const c = cues.querySelector('.k2-swipe-cue');
            if (!c || getComputedStyle(c).display === 'none') return;
            const need = c.scrollWidth, have = Math.max(0, win - 8);
            if (need > have && have > 0) {
                const fs = parseFloat(getComputedStyle(c).fontSize) || 18;
                const nf = `${Math.max(14, Math.floor(fs * have / need))}px`;
                cues.querySelectorAll('.k2-swipe-cue, .k2-swipe-back').forEach((x) => { x.style.fontSize = nf; });
            }
        };
        const mode = () => {
            if (!frame || !body) return;
            frame.removeAttribute('data-mq-swipes'); w.style.width = ''; frame.style.minWidth = ''; w.style.maxWidth = ''; w.style.overflowX = 'auto'; body.style.paddingRight = '0px';
            const its = items();
            const fw = frame.parentElement ? frame.parentElement.getBoundingClientRect().width : frame.getBoundingClientRect().width;
            if (body.getBoundingClientRect().width + col.getBoundingClientRect().width <= fw + 1 || its.length < 2) { level(); return; }
            frame.setAttribute('data-mq-swipes', '');
            level();
            const a = its[0].getBoundingClientRect(), b = its[1].getBoundingClientRect();
            const pitch = b.left - a.left, gap = pitch - a.width;
            // critic C2 r8 (a): the room is measured from the CELL's inner box (from the frame's left edge to the cell's inner right
            // edge), not from the frame, which may hug a narrower drawing; as many whole columns as fit there
            const fr = frame.getBoundingClientRect();
            let avail = fr.width;
            const cellEl2 = frame.closest('.mq-scell');
            if (cellEl2) {
                const cr = cellEl2.getBoundingClientRect(), cs = getComputedStyle(cellEl2);
                // the drawing is centred in the cell, so the room is the cell's whole inner width (it widens, still centred)
                const inner = cr.width - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0) - parseFloat(cs.borderLeftWidth || 0) - parseFloat(cs.borderRightWidth || 0);
                if (inner > avail) avail = inner;
            }
            const n = Math.max(1, Math.floor((avail + gap + 0.5) / pitch));
            // critic C2 r7: when every column of a line fits, the window takes the full width and the row does not scroll at all
            // (a line's turn arrow may reach past the last column; it is drawn, never scrolled to)
            if (n >= its.length) { w.style.overflowX = 'visible'; level(); return; }
            const win = Math.min(avail, n * pitch - gap + 3);
            w.style.width = `${win}px`; w.style.maxWidth = `${Math.floor(avail)}px`;
            frame.style.minWidth = `${Math.ceil(win)}px`;     // the drawing around the window widens with it (it stays centred in the cell)
            padEnd();
            fitCue(win);
        };
        mode();
        window.addEventListener('resize', mode);
        const upd = () => { level(); lastSL = w.scrollLeft; w.toggleAttribute('data-mq-scrolled', w.scrollLeft > 1); w.toggleAttribute('data-mq-end', !moreRight()); };
        w.addEventListener('scroll', upd, { passive: true });
        window.addEventListener('resize', upd);
        // the pupil's own move into a box (critic C2 r7): a tap in this row, a Tab key, or a step from another box of the row
        let tapAt = 0;
        w.addEventListener('pointerdown', () => { tapAt = Date.now(); }, { capture: true, passive: true });
        const tappedNow = () => Date.now() - tapAt < 1500;
        watchTabKey();
        // critic C2 r8 (b): when the card held its focus back (a first box the start does not show), the first digit key typed
        // with nothing focused goes to that box under the same rule as the pupil's Tab (the row moves to show it whole)
        const digitKey = (e) => {
            if (!w.isConnected) { document.removeEventListener('keydown', digitKey, true); return; }
            if (!held || !held.isConnected || !/^[0-9]$/.test(e.key) || e.ctrlKey || e.metaKey || e.altKey || !w.offsetParent) return;
            const a = document.activeElement;
            if (a && a !== document.body && a !== document.documentElement) return;
            const t = held;
            tabKeyNow = true; setTimeout(() => { tabKeyNow = false; }, 0);
            try { t.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
        };
        document.addEventListener('keydown', digitKey, true);
        // is the box fully inside the window when the row rests at its start?
        const shownAtStart = (t) => {
            const v = w.getBoundingClientRect(), r = t.getBoundingClientRect(), sl = w.scrollLeft;
            return r.left - v.left + sl >= -0.5 && r.right - v.left + sl <= w.clientWidth + 0.5;
        };
        // a focus the PROGRAM gives (the card's auto-focus, a re-focus) to a box the pupil cannot see at the row's start is refused:
        // the row stays at its start and nothing is typed blind; the pupil swipes and taps the box (or Tabs to it)
        const hold = (t, keep) => {
            held = t;
            w.scrollLeft = keep;
            try { t.blur(); } catch (e) { /* ignore */ }
            upd();
            requestAnimationFrame(() => { if (document.activeElement !== t) { w.scrollLeft = keep; upd(); } });
        };
        // a box that takes focus scrolls fully into view, clear of the pinned cue
        w.addEventListener('focusin', (e) => {
            const t = e.target;
            if (!t || !t.getBoundingClientRect) return;
            const fromRow = !!e.relatedTarget && w.contains(e.relatedTarget);
            const tapped = tappedNow();
            const user = tapped || tabKeyNow || fromRow;
            const first = w.dataset.mqFocused !== '1';      // the first focus (the card's auto-focus) keeps the row at its start when the box shows there
            if (!user) {
                if (first) mode();
                const keep = first || w.dataset.mqMoved !== '1' ? 0 : lastSL;
                if (!shownAtStart(t) && (first || keep === 0)) { hold(t, keep); return; }
            }
            held = null;
            // (the step tab sits beside the row, outside it, so nothing scrolls under it). The row stops on a COLUMN start (the
            // lines' columns line up), the nearest one to where it is that shows the whole box, so no number is ever cut at the
            // row's left edge; the browser's own focus scroll is undone first (the card opens at scrollLeft 0).
            const snap = () => {
                const v2 = w.getBoundingClientRect(), r2 = t.getBoundingClientRect(), sl = w.scrollLeft, cw = w.clientWidth;
                const line = w.querySelector('.k2-countrow-line [data-mq-wrapped]');
                const xs = [0, ...(line ? [...line.children].map((x) => x.getBoundingClientRect().left - v2.left + sl) : [])];
                const bl = r2.left - v2.left + sl, br = r2.right - v2.left + sl;
                const ok = xs.filter((x) => x <= bl + 0.5 && br - x <= cw + 0.5);
                if (!ok.length && firstFlag) w.scrollLeft = 0;      // no position shows the box: the row stays at its start (the start beats the box)
                else if (!ok.length) { if (r2.left < v2.left + 4) w.scrollLeft -= (v2.left + 4 - r2.left); else if (r2.right > v2.right - 4) w.scrollLeft += (r2.right - v2.right + 4); }
                else w.scrollLeft = Math.max(0, firstFlag ? Math.min(...ok) : ok.reduce((a, x) => (Math.abs(x - sl) < Math.abs(a - sl) ? x : a)));   // the first focus: the LEFTMOST start that shows the box (critic C2 r5)
                upd();
            };
            if (!first) w.dataset.mqMoved = '1';
            w.dataset.mqFocused = '1';
            // a box the pupil TAPPED is in view already: the row does not move under the finger
            if (tapped) { const v0 = w.getBoundingClientRect(), r0 = t.getBoundingClientRect(); if (r0.left >= v0.left - 0.5 && r0.right <= v0.right + 0.5) { upd(); return; } }
            const progFirst = first && !user;
            // coming into the row from outside it (the card's auto-focus, or the pupil's Tab): the LEFTMOST column start that shows
            // the whole box, so the most numbers before it stay in view; within the row, the nearest start
            const leftmost = progFirst || !fromRow;
            // after the late fit: a box that no longer shows at the start gives its focus back (unless the pupil has typed in it)
            if (progFirst) {
                firstSnap = () => {
                    if (document.activeElement !== t || w.dataset.mqMoved === '1') return;
                    mode();
                    if (!shownAtStart(t) && !t.value) { delete w.dataset.mqFocused; firstSnap = null; hold(t, 0); return; }
                    snapAs(true);
                };
            }
            const snapAs = (f) => { const keep = leftmost; try { firstFlag = f; snap(); } finally { firstFlag = keep; } };
            firstFlag = leftmost;
            snap();
            requestAnimationFrame(snap);
            setTimeout(() => { if (document.activeElement === t) snap(); }, 150);    // after the cell's late fit (fitTwinRows) moves the boxes
        });
        // after the cell's late fit (fonts, fitTwinRows): lay the row out again and, while the pupil has not moved on, re-rest it;
        // a held box that now shows at the start takes the focus it was refused
        const late = () => {
            if (firstSnap) firstSnap();
            else if (!w.scrollLeft) mode();
            if (held && held.isConnected && w.dataset.mqFocused !== '1' && !w.scrollLeft && (!document.activeElement || document.activeElement === document.body) && shownAtStart(held)) {
                try { held.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
            }
            upd();
        };
        upd(); setTimeout(late, 300); setTimeout(late, 1000);
    });
}

// a Tab key press anywhere: the focus it moves is the pupil's own (wireSwipeRows)
// (only the focus move of that same key press: the flag clears in the next task, so a Tab and a later Enter on "Next" do not
// make the next card's auto-focus look like the pupil's own)
let tabKeyNow = false, tabKeyWatched = false;
function watchTabKey() {
    if (tabKeyWatched || typeof document === 'undefined') return;
    tabKeyWatched = true;
    document.addEventListener('keydown', (e) => { if (e.key === 'Tab') { tabKeyNow = true; setTimeout(() => { tabKeyNow = false; }, 0); } }, true);
}

export function wireCellSlots(cellEl, input, { onChange = null } = {}) {
    if (!cellEl || !input) return false;
    wireOpsWork(cellEl);
    wireSwipeRows(cellEl);
    const slots = Array.from(cellEl.querySelectorAll('[data-mq-cell]'));
    if (!slots.length) return false;
    wireChartSwipe(cellEl);
    // What stands between the answers in `q.ans`: ", " for a list, " R " for a quotient and
    // remainder (the drawing says so with `data-mq-join` on an ancestor of the slots).
    const joinEl = slots[0].closest('[data-mq-join]');
    const join = joinEl ? joinEl.getAttribute('data-mq-join') : ', ';
    // A mixed number (frac-model.js, data-mq-join="mixed"): "1 3/8" from whole, numerator and
    // denominator, the whole or the fraction left out when its boxes are empty.
    const mixed = join === 'mixed';
    const splitMixed = (v) => { const m = /^\s*(?:(\d+)\s+)?(\d*)\s*\/?\s*(\d*)\s*$/.exec(String(v || '')); return m ? [m[1] || '', m[2] || '', m[3] || ''] : []; };
    let saved = mixed ? splitMixed(input.value) : String(input.value || '').split(join.trim() || ',').map((t) => t.trim());
    // A row that joins with NO separator (a word problem's answer digits, data-mq-join=""): "816" is one digit per box, the
    // digits in the rightmost boxes (the row's spare boxes stand on the left) - small fixes item 4, "[816|_|_|_]" on going back.
    if (!mixed && join === '' && slots.length > 1) {
        const ch = [...String(input.value || '').replace(/\s/g, '')];
        saved = ch.length <= slots.length ? [...Array(slots.length - ch.length).fill(''), ...ch] : saved;
    }
    const boxes = slots.map((slot, k) => {
        const el = document.createElement('input');
        el.type = 'text';
        el.className = 'mq-cellslot';
        // A function table's sign circle and rule line take signs (data-mq-kind): every other box digits.
        const kind = slot.getAttribute('data-mq-kind') || '';
        if (kind) el.dataset.mqKind = kind;
        el.setAttribute('inputmode', kind ? 'text' : 'numeric');
        el.setAttribute('autocomplete', 'off');
        el.setAttribute('spellcheck', 'false');
        const fixedW = slot.getAttribute('data-mq-fixed') === '1' && Number(slot.getAttribute('data-mq-w'));
        el.setAttribute('maxlength', String(fixedW || Math.max(2, Number(slot.getAttribute('data-mq-w')) || 4)));
        if (fixedW) el.dataset.mqFixed = '1';
        // a count-by box: as many digits as the row's widest number; one more goes on to the next box (active-box.js)
        if (Number(slot.getAttribute('data-mq-max')) > 0) { el.dataset.mqMax = slot.getAttribute('data-mq-max'); el.setAttribute('maxlength', el.dataset.mqMax); }
        el.setAttribute('aria-label', slot.getAttribute('data-mq-label') || `answer ${k + 1} of ${slots.length}`);
        if (saved[k]) el.value = saved[k];
        slot.textContent = '';
        slot.appendChild(el);
        return el;
    });
    const compose = () => {
        const v = boxes.map((b) => (b.value || '').trim());
        if (!mixed) return v.join(join);
        const [w, n, d] = v;
        return `${w}${w && (n || d) ? ' ' : ''}${n || d ? `${n}/${d}` : ''}`;
    };
    boxes.forEach((b, k) => {
        b.addEventListener('input', () => {
            delete b.dataset.mqHandedAt;
            b.value = _slotChars(b.value, b.dataset.mqKind);
            input.value = compose();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        b.addEventListener('change', () => { if (onChange) onChange(compose()); });
        b.addEventListener('keydown', (e) => {
            // a LIST of numbers (a count-by row): Space or a comma after a number moves on to the next box, as a pupil writes
            // a gap (a box keeps digits only, so a comma is never part of a number here)
            const list = join.trim() === ',' && !b.dataset.mqKind;
            // critic r3 N7: the caret was just HANDED to this empty box (a right number turned green, or a digit ran over):
            // the pupil's Space / comma / Enter / Tab is the move-on for the number they finished - it is already done here
            const handed = list && !(b.value || '').trim() && Date.now() - Number(b.dataset.mqHandedAt || 0) < 2500;
            if (handed && (e.key === ' ' || e.key === ',' || e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey))) {
                e.preventDefault();
                delete b.dataset.mqHandedAt;
                return;
            }
            // Space or a comma moves on to the NEXT EMPTY box (one already right or filled is passed over, critic r3 N11)
            const nextEmpty = boxes.slice(k + 1).find((x) => !(x.value || '').trim());
            if ((e.key === ' ' || e.key === ',') && list && (b.value || '').trim() && nextEmpty) {
                e.preventDefault();
                const nx = nextEmpty;
                nx.focus({ preventScroll: true });
                try { nx.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (err) { /* ignore */ }   // a box 1 px under the fold too
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const next = boxes[k + 1];
                if (next && !next.value) next.focus();
                else if (onChange) onChange(compose());
                else input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
        });
    });
    input.classList.add('mq-cellslot-host');
    return true;
}

/* ------------------------------------------------------------------ the number line (regrade 2)
 * The kit's number line is one SVG sized for paper: on a phone its labels are 7-9 px, and the
 * paper's task ("Draw the jumps on the line") had no screen twin, so the pupil only typed a sum.
 * On screen the line is redrawn from the same drawing (its labels and its start dot) as a row of
 * tick buttons: every label is read at the cell's text size, every tick is a tap target (44 px
 * wide below 1024 px; the line scrolls inside the cell when it is longer than the cell, never the
 * page), and a tap on a tick draws a jump arc from where the pupil stands to that tick. A tap on
 * the last landing takes that jump back; "Start again" clears them. The jumps are working, as the
 * paper's are: the answer is still written in the equation's box.
 */
export const NUMBER_LINE_INSTRUCTION = 'Tap the line to jump. Type the answer.';

/** Is this item the kit's number line (its instruction on screen is the jump one)? */
export function isNumberLineItem(q) {
    if (!q) return false;
    const t = q.cell && q.cell.template;
    return t === 'number-line' || /data-ws-ops="number-line"/.test(String(q.visual || ''));
}

export function wireNumberLines(root) {
    if (!root || typeof document === 'undefined') return 0;
    let n = 0;
    root.querySelectorAll('.ws-ops-number-line').forEach((ops) => {
        if (ops.dataset.mqNl === '1') return;
        const svg = ops.querySelector(':scope > svg');
        if (!svg) return;
        // O6 "Numbers on the line" (lane AP3): a line that labels only some ticks names EVERY tick
        // (`data-nl-v`) and marks the labelled ones (`data-nl-lab`): every tick stays a tap target,
        // and only the paper's numerals are shown under the ticks.
        const tagged = Array.from(svg.querySelectorAll('line[data-nl-v]'));
        const labels = tagged.length >= 2
            ? tagged.map((t) => ({ x: Number(t.getAttribute('x1')), s: String(t.getAttribute('data-nl-v')), on: t.hasAttribute('data-nl-lab') }))
                .filter((t) => Number.isFinite(t.x) && /^-?\d+$/.test(t.s)).sort((a, b) => a.x - b.x)
            : Array.from(svg.querySelectorAll('text'))
                .map((t) => ({ x: Number(t.getAttribute('x')), s: t.textContent.trim(), on: true }))
                .filter((t) => t.s !== '' && Number.isFinite(t.x) && /^-?\d+$/.test(t.s))
                .sort((a, b) => a.x - b.x);
        if (labels.length < 2) return;
        const dot = svg.querySelector('[data-nl-start]');
        const start = dot ? String(dot.getAttribute('data-nl-start')) : labels[0].s;
        const vals = labels.map((l) => l.s);
        const shown = labels.map((l) => l.on);
        const startIdx = Math.max(0, vals.indexOf(start));
        // start unknown ("? − 4 = 15"): the given point is where the hops LAND, drawn hollow on
        // paper; the screen keeps it hollow and names it (round 4: "the dot sits on the result")
        const given = !!dot && /^#?f{3}(f{3})?$|white/i.test(String(dot.getAttribute('fill') || ''));
        ops.dataset.mqNl = '1';
        const wrap = document.createElement('div');
        wrap.className = 'mq-nl';
        wrap.setAttribute('data-mq-nl', '');
        wrap.style.setProperty('--mq-nl-n', String(vals.length));
        // a tick is never narrower than its label (round 3: "10152025..." ran together)
        wrap.style.setProperty('--mq-nl-chars', String(Math.max(1, ...vals.map((v) => String(v).length))));
        wrap.innerHTML = `<div class="mq-nl-scroll" data-mq-scroll><div class="mq-nl-track" role="group" aria-label="${attr(svg.getAttribute('aria-label') || 'number line')}. Tap a number to jump to it.">`
            + '<svg class="mq-nl-arcs" aria-hidden="true" preserveAspectRatio="none"></svg><span class="mq-nl-line" aria-hidden="true"></span>'
            + vals.map((v, i) => `<button type="button" class="mq-nl-tick${i === startIdx ? ' mq-nl-start' : ''}${i === startIdx && given ? ' mq-nl-given' : ''}" data-i="${i}" aria-label="${attr(v)}${i === startIdx ? (given ? ', where the hops land' : ', start') : ''}">`
                + `<span class="mq-nl-mark" aria-hidden="true"></span><span class="mq-nl-lab">${shown[i] ? esc(String(v).replace(/^-/, '\u2212')) : ''}</span></button>`).join('')
            + '</div></div>'
            + `<div class="mq-nl-tools"><button type="button" class="mq-nl-pan" data-d="-1" aria-label="show smaller numbers">◀</button>`
            + `<button type="button" class="mq-nl-reset">Start again</button>`
            + `<button type="button" class="mq-nl-pan" data-d="1" aria-label="show bigger numbers">▶</button></div>`;
        svg.replaceWith(wrap);
        const arcs = wrap.querySelector('.mq-nl-arcs');
        const ticks = Array.from(wrap.querySelectorAll('.mq-nl-tick'));
        const N = vals.length;
        arcs.setAttribute('viewBox', `0 0 ${N * 10} 30`);
        const jumps = [];
        wrap._mqSetJumps = (arr) => { jumps.length = 0; (arr || []).forEach((i) => { if (i >= 0 && i < N) jumps.push(i); }); draw(); };
        const draw = () => {
            wrap.dataset.mqJumps = jumps.join(',');
            let pos = startIdx;
            let html = '';
            jumps.forEach((to) => {
                const x1 = (pos + 0.5) * 10, x2 = (to + 0.5) * 10;
                const h = Math.min(26, 8 + Math.abs(to - pos) * 2.5);
                html += `<path d="M${x1} 29 Q${(x1 + x2) / 2} ${29 - h * 2} ${x2} 29" fill="none" stroke="#000" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
                pos = to;
            });
            arcs.innerHTML = html;
            ticks.forEach((t, i) => t.classList.toggle('mq-nl-land', jumps.length > 0 && i === pos));
            ticks.forEach((t, i) => t.setAttribute('aria-pressed', jumps.includes(i) ? 'true' : 'false'));
            wrap.dataset.mqAt = vals[pos];
        };
        wrap.addEventListener('click', (e) => {
            if (e.target.closest('.mq-nl-reset')) { jumps.length = 0; draw(); return; }
            const pan = e.target.closest('.mq-nl-pan');
            if (pan) {
                const sc = wrap.querySelector('.mq-nl-scroll');
                sc.scrollBy({ left: Number(pan.dataset.d) * sc.clientWidth * 0.6, behavior: 'smooth' });
                return;
            }
            const t = e.target.closest('.mq-nl-tick');
            if (!t) return;
            const i = Number(t.dataset.i);
            const at = jumps.length ? jumps[jumps.length - 1] : startIdx;
            if (i === at) { if (jumps.length) jumps.pop(); }
            else jumps.push(i);
            draw();
        });
        draw();
        // the start is in view when the line scrolls inside the cell
        const scroller = wrap.querySelector('.mq-nl-scroll');
        requestAnimationFrame(() => {
            const scrolls = scroller.scrollWidth > scroller.clientWidth + 1;
            wrap.classList.toggle('mq-nl-scrolls', scrolls);
            if (scrolls) {
                const tick = ticks[startIdx];
                scroller.scrollLeft = Math.max(0, tick.offsetLeft - scroller.clientWidth * 0.25);
            }
        });
        n++;
    });
    return n;
}

/**
 * The pupil's working in a cell (number-line jumps, long-division working digits), so a host that
 * redraws the cell (the quiz re-renders on every answer) can put it back. Working is never graded.
 */
// A word problem's working and answer (small fixes item 4, critic r1 D4): the copy boxes and sign box (input.mq-wwork), each
// answer box (input.mq-cellslot: a row joined with no separator cannot be split back from "816"), and the tapped sign or unit word.
const WORK_BOXES = 'input.mq-wwork, input.mq-cellslot:not(.mq-cellslot-host)';
const WORK_PICKS = 'button.mq-wwop, button.mq-wwword';
export function saveWorking(root) {
    if (!root) return null;
    return {
        nl: Array.from(root.querySelectorAll('[data-mq-nl]')).map((w) => w.dataset.mqJumps || ''),
        work: Array.from(root.querySelectorAll('input.mq-work')).map((i) => i.value || ''),
        boxes: Array.from(root.querySelectorAll(WORK_BOXES)).map((i) => i.value || ''),
        picks: Array.from(root.querySelectorAll(WORK_PICKS)).map((b) => b.getAttribute('aria-pressed') === 'true'),
    };
}
export function restoreWorking(root, saved) {
    if (!root || !saved) return;
    Array.from(root.querySelectorAll('[data-mq-nl]')).forEach((w, k) => {
        const s = saved.nl && saved.nl[k];
        if (s && w._mqSetJumps) w._mqSetJumps(s.split(',').map(Number));
    });
    Array.from(root.querySelectorAll('input.mq-work')).forEach((i, k) => {
        if (saved.work && saved.work[k]) i.value = saved.work[k];
    });
    // every box back as the pupil left it, holes and all (only when the drawing is the same one: same number of boxes)
    const boxes = Array.from(root.querySelectorAll(WORK_BOXES));
    if (Array.isArray(saved.boxes) && saved.boxes.length === boxes.length) {
        boxes.forEach((i, k) => {
            if ((i.value || '') === saved.boxes[k]) return;
            i.value = saved.boxes[k];
            i.dispatchEvent(new Event('input', { bubbles: true }));   // the host recomposes its answer from its boxes
        });
    }
    const picks = Array.from(root.querySelectorAll(WORK_PICKS));
    if (Array.isArray(saved.picks) && saved.picks.length === picks.length) {
        picks.forEach((b, k) => { if (saved.picks[k] && b.getAttribute('aria-pressed') !== 'true') b.click(); });
    }
}

/**
 * Long division's working on screen (regrade 2, 2026-09-25): the kit's bracket draws the
 * subtraction rows and the bring-down rows under the dividend as ruled space. On paper the pupil
 * writes there; on screen each digit place of those rows becomes a one-digit box, so the whole
 * algorithm can be worked in the cell. Scratch space only: never graded (`data-ws-graded="0"`),
 * never auto-focused, outside the tab order, and not a `data-mq-cell` slot, so every checker
 * still reads the quotient alone. The drawing's own rules (the line under each "−" row) stay.
 * Idempotent. Returns the number of boxes added.
 */
export function wireOpsWork(root) {
    if (!root || typeof document === 'undefined') return 0;
    let added = 0;
    root.querySelectorAll('.ws-ops-division').forEach((ops) => {
        ops.classList.add('mq-opsdiv');
        if (ops.dataset.mqOpsWork === '1') return;
        ops.dataset.mqOpsWork = '1';
        const grid = ops.querySelector('[role="group"]') || ops.firstElementChild;
        if (!grid) return;
        const pos = (el) => {
            const st = el.getAttribute('style') || '';
            const c = st.match(/grid-column:\s*(\d+)/), r = st.match(/grid-row:\s*(\d+)/);
            return c && r ? { col: Number(c[1]), row: Number(r[1]) } : null;
        };
        const cells = Array.from(grid.children).map((el) => ({ el, p: pos(el) })).filter((x) => x.p);
        // the dividend's digit places: row 2, under the vinculum
        const cols = new Set(cells.filter((x) => x.p.row === 2 && /border-top/.test(x.el.getAttribute('style') || '')).map((x) => x.p.col));
        if (!cols.size) return;
        const rows = new Map();
        cells.forEach((x) => {
            if (x.p.row < 3 || !cols.has(x.p.col) || x.el.textContent.trim() || x.el.querySelector('input')) return;
            if (!rows.has(x.p.row)) rows.set(x.p.row, []);
            rows.get(x.p.row).push(x);
        });
        let step = 0;
        Array.from(rows.keys()).sort((a, b) => a - b).forEach((row) => {
            step++;
            const list = rows.get(row).sort((a, b) => a.p.col - b.p.col);
            const boxes = list.map((x, k) => {
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = 'mq-work mq-opswork';
                inp.setAttribute('inputmode', 'numeric');
                inp.setAttribute('maxlength', '1');
                inp.setAttribute('autocomplete', 'off');
                inp.setAttribute('spellcheck', 'false');
                inp.tabIndex = -1;
                inp.dataset.wsGraded = '0';
                inp.dataset._boxValAttached = '1';
                inp.dataset._colAdvAttached = '1';
                inp.setAttribute('aria-label', `working, row ${step}, digit ${k + 1}`);
                x.el.appendChild(inp);
                added++;
                return inp;
            });
            boxes.forEach((b, k) => {
                b.addEventListener('input', () => {
                    b.value = (b.value || '').replace(/[^0-9]/g, '').slice(-1);
                    if (b.value && boxes[k + 1]) boxes[k + 1].focus();
                });
                b.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !b.value && boxes[k - 1]) { e.preventDefault(); boxes[k - 1].focus(); }
                    else if (e.key === 'ArrowLeft' && boxes[k - 1]) { e.preventDefault(); boxes[k - 1].focus(); }
                    else if (e.key === 'ArrowRight' && boxes[k + 1]) { e.preventDefault(); boxes[k + 1].focus(); }
                });
            });
        });
    });
    return added;
}

/** Undo adoptVisualBlank on an input that outlives its cell (the practice card's #answerInput). */
export function releaseVisualBlank(input) {
    if (!input || !input.classList.contains('mq-slot--invisual')) return;
    input.classList.remove('mq-slot--invisual', 'mq-slot--svg', 'mq-bsize', 'mq-slot--circle');
    if (input.getAttribute('maxlength') === '1') input.removeAttribute('maxlength');
    if (input.dataset.mqSigns) delete input.dataset.mqSigns;
    if (input.dataset.mqPrevStyle !== undefined) {
        input.setAttribute('style', input.dataset.mqPrevStyle);
        delete input.dataset.mqPrevStyle;
    }
}

/* ------------------------------------------------------------------ legacy visual clean-up */

// Screen-only captions some legacy visuals carry above or under the drawing. On paper the
// instruction line says what to do (BD-10); inside a cell they are extra reading load.
const SCREEN_ONLY_TEXT = [
    /^Column (Addition|Subtraction|Multiplication)$/i,
    /^Long Division$/i,
    /^Type in boxes\b/i,
];

/** Hide the screen-only captions of a legacy visual. Returns the number hidden. */
export function hideScreenOnlyCaptions(root) {
    if (!root) return 0;
    let n = 0;
    root.querySelectorAll('div, span, p').forEach((el) => {
        if (el.children.length > 0) return;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t && SCREEN_ONLY_TEXT.some((re) => re.test(t))) {
            el.setAttribute('data-mq-screen-only', '1');
            el.style.setProperty('display', 'none', 'important');
            n++;
        }
    });
    return n;
}

const _normText = (s) => plainText(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * The owner's "said twice" defect: a widget or legacy visual that prints the question text again
 * under (or over) the instruction line. The instruction line is kept — it is where the sheet puts
 * the instruction (BD-10) — and the visual's own copy is hidden. Only an element whose whole text
 * IS the instruction is hidden, never a container that also holds the drawing. Idempotent.
 * @returns {boolean} true when a copy was found (hidden now or earlier)
 */
export function hideRepeatedPrompt(visualEl, text) {
    if (!visualEl) return false;
    const want = _normText(text);
    // A sentence, not a bare number row: "52 + 63 + 49" normalises to the digits a column stack
    // also holds, and hiding the stack as a "repeat" would empty the cell.
    if (!want || want.length < 6 || !/[a-z]{3,}/.test(want)) return false;
    let found = false;
    visualEl.querySelectorAll('div, p, span, h1, h2, h3, h4, label, legend').forEach((el) => {
        if (el.closest('[data-mq-screen-only]') && !el.hasAttribute('data-mq-screen-only')) return;
        if (el.querySelector('input, button, svg, img, canvas, select, textarea')) return;
        if (_normText(el.textContent || '') !== want) return;
        // the deepest element that carries the whole sentence
        const inner = Array.from(el.children).find((c) => _normText(c.textContent || '') === want);
        if (inner) return;
        found = true;
        if (!el.hasAttribute('data-mq-screen-only')) {
            el.setAttribute('data-mq-screen-only', '1');
            el.style.setProperty('display', 'none', 'important');
        }
    });
    return found;
}

/** Does the visual already say the question text? Then the text line is a duplicate. */
export function visualRepeatsText(visualEl, text) {
    if (!visualEl) return false;
    const norm = (s) => plainText(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const want = norm(text);
    // A sentence, not a bare number row: "52 + 63 + 49" normalises to the digits a column stack
    // also holds, and hiding the stack as a "repeat" would empty the cell.
    if (!want || want.length < 6 || !/[a-z]{3,}/.test(want)) return false;
    const have = norm(visualEl.textContent || '');
    return have.includes(want);
}

/* ------------------------------------------------------------------ the live mono pass (INK-1) */

// A colour that is ink, paper, grey or transparent needs no change.
function parseColor(str) {
    if (!str || str === 'none' || str === 'transparent') return null;
    const m = String(str).match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)/);
    if (!m) return null;
    let a = m[4] === undefined ? 1 : (String(m[4]).endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return { r: +m[1], g: +m[2], b: +m[3], a };
}
// A translucent paint is read as it lands on the paper: composited over white first, so a 10 %
// wash of blue is a near-white (paper), not the blue it was mixed from.
function lum({ r, g, b, a = 1 }) {
    if (a < 1) { r = r * a + 255 * (1 - a); g = g * a + 255 * (1 - a); b = b * a + 255 * (1 - a); }
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const isInk = (c) => c.r === 0 && c.g === 0 && c.b === 0;
const isPaper = (c) => c.r === 255 && c.g === 255 && c.b === 255;
const isGrey = (c) => c.r === 148 && c.g === 148 && c.b === 148;
// A translucent ink or paper is not ink or paper once it lands: rgba(0,0,0,.06) is a light grey.
const isPalette = (c) => c.a >= 1 && (isInk(c) || isPaper(c) || isGrey(c));

/** A fill or a background: light -> paper, mid -> the one grey, dark -> ink (INK-1, INK-3a). */
export function monoFill(c) {
    const L = lum(c);
    if (L >= 0.62) return PAPER;
    if (L >= 0.2) return GREY;
    return INK;
}
/** A line: near-white disappears into the paper, everything else is ink (lines are structure). */
export function monoStroke(c) {
    return lum(c) >= 0.9 ? PAPER : INK;
}

// Elements whose colour IS the feedback (SP-30, P-ON-13) or is chrome the host placed in the cell.
const FEEDBACK_RE = /(^|[\s_-])(correct|incorrect|wrong|right|flash|feedback|is-ok|is-no|box-correct|box-wrong|selected-correct|selected-wrong|correct-answer|wrong-choice|revealed)([\s_-]|$)/i;
const SKIP_SELECTOR = '[data-ws-feedback], [data-ws-feedback] *, .zoom-icon-btn, .mq-keep-color, .mq-emoji, [data-mq-emoji]';

function isFeedbackEl(el) {
    for (let n = el, depth = 0; n && n.nodeType === 1 && depth < 3; n = n.parentElement, depth++) {
        const cls = typeof n.className === 'string' ? n.className : (n.className && n.className.baseVal) || '';
        if (cls && FEEDBACK_RE.test(cls)) return true;
    }
    return false;
}

// What the pass wrote, per element, so a later pass can put the author's value back first.
const WROTE = new WeakMap();

function setMono(el, prop, value, rec) {
    const cur = el.style.getPropertyValue(prop);
    const pri = el.style.getPropertyPriority(prop);
    if (!rec.has(prop)) rec.set(prop, { orig: cur, origPri: pri, mine: value });
    else rec.get(prop).mine = value;
    if (cur !== value || pri !== 'important') el.style.setProperty(prop, value, 'important');
}

function restoreAuthor(el) {
    const rec = WROTE.get(el);
    if (!rec) return;
    for (const [prop, r] of rec) {
        const cur = el.style.getPropertyValue(prop);
        if (cur === r.mine) {
            // still ours: put the author's own value back so the cascade is read afresh
            if (r.orig) el.style.setProperty(prop, r.orig, r.origPri); else el.style.removeProperty(prop);
        }
        // otherwise the author changed it after us; theirs is now the value to read
    }
    rec.clear();
}

const HTML_BORDERS = ['top', 'right', 'bottom', 'left'];

/**
 * Re-ink one element: every computed colour that is not ink, paper, grey or transparent is
 * mapped by luminance. Text is always ink or paper, whichever reads against its (re-inked)
 * background — never grey (INK-3, AX-1).
 */
function inkOne(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.matches && el.matches(SKIP_SELECTOR)) return;
    if (isFeedbackEl(el)) return;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') return;   // CSS owns slots
    restoreAuthor(el);
    let rec = WROTE.get(el);
    if (!rec) { rec = new Map(); WROTE.set(el, rec); }
    const cs = getComputedStyle(el);
    const isSvg = el instanceof SVGElement;
    if (isSvg) {
        if (tag === 'svg' || tag === 'g' || tag === 'defs' || tag === 'clippath' || tag === 'mask') return;
        const fill = cs.fill;
        if (fill && fill.startsWith('url(')) setMono(el, 'fill', GREY, rec);
        else {
            const c = parseColor(fill);
            if (c && c.a > 0 && !isPalette(c)) {
                // text drawn in SVG is read, so it is ink or paper, never grey
                const v = (tag === 'text' || tag === 'tspan') ? (lum(c) >= 0.62 ? PAPER : INK) : monoFill(c);
                setMono(el, 'fill', v, rec);
            }
        }
        const stroke = cs.stroke;
        if (stroke && stroke.startsWith('url(')) setMono(el, 'stroke', INK, rec);
        else {
            const s = parseColor(stroke);
            if (s && s.a > 0 && !isPalette(s)) setMono(el, 'stroke', monoStroke(s), rec);
        }
        return;
    }
    // HTML
    const bg = parseColor(cs.backgroundColor);
    let bgInk = false;
    if (bg && bg.a > 0.05) {
        const v = isPalette(bg) ? null : monoFill(bg);
        if (v) setMono(el, 'background-color', v, rec);
        bgInk = (v || monoFill(bg)) === INK;
    } else {
        bgInk = inkBehind(el);
    }
    const col = parseColor(cs.color);
    // Text is ink on paper, or paper on ink — whichever reads (INK-3: never grey, AX-1).
    if (col && col.a > 0) {
        const want = bgInk ? PAPER : INK;
        const have = isInk(col) && col.a >= 1 ? INK : isPaper(col) && col.a >= 1 ? PAPER : null;
        if (have !== want) setMono(el, 'color', want, rec);
    }
    // LS-2..LS-4: inside a cell a dashed line means CUT and a dotted line means TRACE. A widget's
    // dashed drop zone or dotted guide is neither, so it is drawn solid. The missing-digit box
    // (LS-8) and a tagged cut line keep their dash.
    const keepDash = el.matches('[data-ws-cut], .ws-box--unknown, [data-ws-shape="box-unknown"]');
    for (const side of HTML_BORDERS) {
        const w = parseFloat(cs.getPropertyValue(`border-${side}-width`)) || 0;
        if (!w) continue;
        const style = cs.getPropertyValue(`border-${side}-style`);
        if (!keepDash && (style === 'dashed' || style === 'dotted')) setMono(el, `border-${side}-style`, 'solid', rec);
        const bc = parseColor(cs.getPropertyValue(`border-${side}-color`));
        if (bc && bc.a > 0 && !isPalette(bc)) setMono(el, `border-${side}-color`, monoStroke(bc), rec);
    }
    const oc = parseColor(cs.outlineColor);
    if (oc && parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none' && !isPalette(oc) && document.activeElement !== el) {
        setMono(el, 'outline-color', INK, rec);
    }
}

function inkBehind(el) {
    for (let n = el.parentElement, d = 0; n && d < 6; n = n.parentElement, d++) {
        if (n.classList && n.classList.contains('mq-scell')) return false;
        const bg = parseColor(getComputedStyle(n).backgroundColor);
        if (bg && bg.a > 0.05) return monoFill(bg) === INK;
    }
    return false;
}

// INK-7: pictographic code points are wrapped so the mono scope can take their colour away.
const EMOJI_RE = /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)/u;
function wrapEmoji(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
            if (!n.nodeValue || !EMOJI_RE.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
            const p = n.parentElement;
            if (!p || p.closest('.mq-emoji, [data-mq-emoji], .zoom-icon-btn, [data-ws-feedback], script, style, textarea, option, svg')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        const parts = n.nodeValue.split(new RegExp(EMOJI_RE.source, 'gu'));
        if (parts.length < 2) continue;
        const frag = document.createDocumentFragment();
        parts.forEach((part, i) => {
            if (!part) return;
            if (i % 2 === 1) {
                const s = document.createElement('span');
                s.className = 'mq-emoji';
                s.textContent = part;
                frag.appendChild(s);
            } else frag.appendChild(document.createTextNode(part));
        });
        n.parentNode.replaceChild(frag, n);
    }
}

function inkTree(root) {
    if (!root || root.nodeType !== 1) return;
    wrapEmoji(root);
    inkOne(root);
    root.querySelectorAll('*').forEach(inkOne);
}

const OBSERVERS = new WeakMap();
const AFTER_INK = new WeakMap();

/**
 * Hold everything inside `root` to ink, paper and grey, now and whenever the content changes
 * (a widget mounting late, re-rendering, or toggling a state class). Idempotent per root.
 */
/**
 * Screen verbs inside the cell too (round 4, H7: "Mark 6,480" drawn inside a rounding twin, a
 * widget's "Write ..." line). Every text a pupil reads in the cell - a label in a kit drawing, SVG
 * text included - takes the print -> screen verb swap (PEDAGOGY 10.2) when it reads as a
 * sentence (two words or more), so a shape's name ("Circle") or a lone word is never touched.
 */
const PAPER_VERB_HINT = /\b(Write|Circle|Mark|Draw|Shade|Check|Cross|Underline|Trace|Colou?r|Cut|Glue|Measure|Box|Sort)\b/i;
export function screenCellVerbs(root) {
    if (!root || typeof document === 'undefined') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const SHORT = { Mark: 'Tap', Write: 'Type', Circle: 'Tap', Draw: 'Tap', Shade: 'Tap', Underline: 'Tap', Trace: 'Tap' };
    nodes.forEach((n) => {
        const v = n.nodeValue || '';
        if (!PAPER_VERB_HINT.test(v)) return;
        const p = n.parentElement;
        if (!p || p.closest('input, textarea, select, script, style, .mq-sr, [data-mq-keep-verb]')) return;
        const words = v.trim().split(/\s+/);
        if (words.length < 2) {
            // a one-word verb label before its number ("Mark 6,480"): the short screen verb, never
            // a shape's name standing alone ("Circle" under a picture)
            const w = words[0];
            const phrase = p.parentElement && /\d/.test(p.parentElement.textContent || '') && (p.parentElement.textContent || '').trim() !== w;
            if (SHORT[w] && phrase) n.nodeValue = v.replace(w, SHORT[w]);
            return;
        }
        const s = screenInstruction(v);
        if (s !== v) n.nodeValue = s;
    });
}

export function monoCell(root, { afterInk = null } = {}) {
    if (!root || typeof MutationObserver === 'undefined') return;
    if (afterInk) AFTER_INK.set(root, afterInk);
    const run = (targets) => {
        const obs = OBSERVERS.get(root);
        if (obs) obs.disconnect();
        try { targets.forEach(inkTree); } catch (e) { /* never break a render */ }
        try { targets.forEach(screenCellVerbs); } catch (e) { /* never break a render */ }
        const after = AFTER_INK.get(root);
        if (after) { try { after(root); } catch (e) { /* never break a render */ } }
        if (obs) { obs.observe(root, OBS_OPTS); obs.takeRecords(); }
    };
    if (!OBSERVERS.has(root)) {
        let pending = new Set();
        const obs = new MutationObserver((records) => {
            for (const r of records) {
                if (r.type === 'childList') r.addedNodes.forEach((n) => { if (n.nodeType === 1) pending.add(n); else if (n.parentElement) pending.add(n.parentElement); });
                else if (r.target && r.target.nodeType === 1) pending.add(r.target);
            }
            // MutationObserver callbacks run as a microtask, before the next paint: inking here
            // means a widget that mounts late never shows its colours, not even for a frame.
            const list = Array.from(pending).filter((n) => n.isConnected && root.contains(n));
            pending = new Set();
            if (list.length) run(list);
        });
        OBSERVERS.set(root, obs);
    }
    run([root]);
    // A widget may mount its markup first and its stylesheet a moment later; that changes the
    // computed colours without a mutation inside the cell, so the whole cell is re-read a few
    // times while it settles.
    [60, 250, 700].forEach((ms) => setTimeout(() => { if (root.isConnected) run([root]); }, ms));
}

const OBS_OPTS = { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'fill', 'stroke'] };

/** Stop watching a root (a card that is being thrown away). */
export function unmonoCell(root) {
    const obs = root && OBSERVERS.get(root);
    if (obs) { obs.disconnect(); OBSERVERS.delete(root); }
}

/* ================================================================== screen twins (regrade 2026-09-25)
 *
 * The critic's re-grade of 2026-09-25 (design/audit/runs/regrade-2026-09-25) found hosts that lose
 * the paper's response model: a build item retyped as a number, a two-addend cloze with one
 * answer line, a q R r answer in one text box, a strip that never renders in the quiz. Each helper
 * below draws the paper cell's screen twin from fields the question already carries (or can be
 * read from its text, for a quiz saved before those fields travelled), with `data-mq-cell` /
 * `data-mq-blank` slots, so the existing slot wiring (wireCellSlots / adoptVisualBlank) and the
 * hosts' own checkers keep working. Kit templates that emit the same markers need nothing here.
 */

const _n = (v) => { const x = Number(String(v == null ? '' : v).replace(/,/g, '')); return Number.isFinite(x) ? x : null; };

/** One boxed answer slot for wireCellSlots: `w` is the digit capacity (SL-2: the section's width). */
export function cellSlot(w = 2, label = '', fixed = false) {
    const n = Math.max(1, Math.min(8, w | 0));
    // `fixed`: the box holds exactly `w` digits (a unit-form place box is one digit): maxlength is w,
    // and a full box hands the caret on (active-box.js)
    return `<span class="mq-cellbox" data-mq-cell data-mq-w="${n}"${fixed ? ' data-mq-fixed="1"' : ''} style="--mq-w:${n}"${label ? ` data-mq-label="${attr(label)}"` : ''}></span>`;
}

/** "This array shows ___ rows of ___." -> the sentence with one boxed slot per blank (SL-7). */
export function inlineBlanksHTML(text, widths, fixed = false) {
    let i = 0;
    const html = esc(plainText(text)).replace(/_{3,}/g, () => {
        const w = widths && widths[i] ? Math.max(1, Math.min(4, widths[i] - 1)) : 3;
        i++;
        return cellSlot(w, '', fixed && !!(widths && widths[i - 1]));
    });
    return i ? `<div class="mq-ibline">${html}</div>` : '';
}

/**
 * The inline-cloze twin (cloze_addition): `[ ] + [ ] = 6` with one box per addend, then the
 * two number lists in ink, as on paper ("Choose one number from each list."). A tap on a list
 * number writes it into that list's box; the box can also be typed into.
 */
export function clozeHTML(q) {
    const opts = Array.isArray(q && q.clozeOptions) ? q.clozeOptions : [];
    let i = 0;
    const w = Math.max(1, ...opts.flat().map((v) => String(v).length));
    const eq = esc(plainText(q && q.text)).replace(/\s([+\-−×÷=])\s/g, ' <span class="o">$1</span> ')
        .replace(/_{3,}/g, () => cellSlot(w, `addend ${++i}`));
    if (!i) return '';
    const names = ['First number', 'Second number', 'Third number', 'Fourth number'];
    const banks = opts.length
        ? `<div class="mq-bankhead">${esc(toScreenInstruction('Choose one number from each list.'))}</div>`
          + opts.map((list, k) => `<div class="mq-bank" data-mq-bank="${k}" role="group" aria-label="${attr(names[k] || `List ${k + 1}`)}">`
            + `<span class="mq-bankname">${esc(names[k] || `List ${k + 1}`)}</span>`
            + (list || []).map((v) => `<button type="button" class="mq-banktile" data-mq-bank-for="${k}" data-v="${attr(v)}">${esc(v)}</button>`).join('')
            + '</div>').join('')
        : '';
    return `<div class="mq-cloze" data-mq-join=", "><div class="ws-eq mq-eq mq-clozeeq">${eq}</div>${banks}</div>`;
}

/** Wire the list tiles of a cloze twin to its boxes (after wireCellSlots made them inputs). */
export function wireClozeBanks(root) {
    if (!root) return;
    // The kit's cloze-bank twin prints each bank as numbers to READ under its box; on screen a
    // tap on one of them writes it into that box (it can still be typed).
    root.querySelectorAll('.cloze-bank [data-mq-cell]').forEach((slot) => {
        const box = slot.querySelector('input');
        const bank = slot.parentElement && slot.parentElement.lastElementChild;
        if (!box || !bank || bank === slot || bank.dataset.mqWired === '1') return;
        bank.dataset.mqWired = '1';
        bank.classList.add('mq-kitbank');
        Array.from(bank.children).forEach((item) => {
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `choose ${item.textContent.trim()}`);
            const pick = () => {
                if (box.disabled) return;
                box.value = item.textContent.trim();
                Array.from(bank.children).forEach((b) => b.setAttribute('aria-pressed', b === item ? 'true' : 'false'));
                box.dispatchEvent(new Event('input', { bubbles: true }));
                box.dispatchEvent(new Event('change', { bubbles: true }));
            };
            item.addEventListener('click', pick);
            item.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
        });
    });
    root.querySelectorAll('.mq-cloze').forEach((cz) => {
        const boxes = Array.from(cz.querySelectorAll('input.mq-cellslot, input.cloze-cell'));
        cz.querySelectorAll('.mq-banktile').forEach((btn) => {
            if (btn.dataset.mqWired === '1') return;
            btn.dataset.mqWired = '1';
            btn.addEventListener('click', () => {
                const box = boxes[Number(btn.dataset.mqBankFor)];
                if (!box || box.disabled) return;
                box.value = btn.dataset.v;
                cz.querySelectorAll(`.mq-banktile[data-mq-bank-for="${btn.dataset.mqBankFor}"]`)
                    .forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
                box.dispatchEvent(new Event('input', { bubbles: true }));
                box.dispatchEvent(new Event('change', { bubbles: true }));
                const next = boxes.find((b) => !b.value);
                if (next) { try { next.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
            });
        });
    });
}

/**
 * The number strip of a grid-fill item (number_seq_fill, count_by_*): given tiles in ink, one
 * boxed slot per missing number, wrapping to a second row on a phone instead of crushing the
 * tiles. No range caption: "Numbers 64-73" states the first and last answers (regrade C2).
 */
export function gridFillHTML(q) {
    const gf = q && q.gridFill;
    if (!gf || !Array.isArray(gf.cells) || !gf.rows || !gf.cols) return '';
    const by = new Map(gf.cells.map((c) => [`${c.row},${c.col}`, c]));
    const w = Math.max(2, ...gf.cells.map((c) => String(c.value).length));
    let rows = '';
    for (let r = 0; r < gf.rows; r++) {
        let tiles = '';
        for (let c = 0; c < gf.cols; c++) {
            const cell = by.get(`${r},${c}`);
            if (!cell) tiles += '<span class="mq-gftile mq-gfempty"></span>';
            else if (cell.blank) tiles += `<span class="mq-gftile mq-gfblank">${cellSlot(w, `row ${r + 1}, number ${c + 1}`)}</span>`;
            else tiles += `<span class="mq-gftile">${esc(cell.value)}</span>`;
        }
        rows += `<div class="mq-gfrow" style="--mq-gfcols:${gf.cols}">${tiles}</div>`;
    }
    return `<div class="mq-gridfill" data-mq-join=", ">${rows}</div>`;
}

/**
 * Tap-to-ring grouping (share_into_groups, div_remainders): the counters are tap targets; each
 * tap puts a counter into the group being made, and a full group of `size` is ringed and moved
 * into the row of rings. A tap on a ring opens it again. The pupil counts the rings (and the
 * counters left over) and writes the answer in the slot, as on paper.
 */
export function ringGroupsHTML(total, size) {
    const t = Math.max(0, Math.min(60, total | 0));
    const ctr = Array.from({ length: t }, (_, i) => `<button type="button" class="mq-ctr" aria-label="counter ${i + 1}" aria-pressed="false"></button>`).join('');
    return `<div class="mq-ring" data-mq-ring data-size="${size | 0}">`
        + `<div class="mq-ring-pool" role="group" aria-label="counters">${ctr}</div>`
        + '<div class="mq-ring-rings" role="group" aria-label="groups"></div>'
        + '<div class="mq-ring-tools"><span class="mq-ring-tip">Tap counters to ring a group.</span><button type="button" class="mq-ring-reset">Start again</button></div>'
        + '</div>';
}

export function wireRingGroups(root) {
    if (!root) return;
    root.querySelectorAll('[data-mq-ring]').forEach((ring) => {
        if (ring.dataset.mqWired === '1') return;
        ring.dataset.mqWired = '1';
        const size = Math.max(1, Number(ring.dataset.size) || 1);
        const pool = ring.querySelector('.mq-ring-pool');
        const rings = ring.querySelector('.mq-ring-rings');
        const picked = () => Array.from(pool.querySelectorAll('.mq-ctr[aria-pressed="true"]'));
        const makeRing = (ctrs) => {
            const g = document.createElement('button');
            g.type = 'button';
            g.className = 'mq-ringgroup';
            g.setAttribute('aria-label', `a group of ${ctrs.length}. Tap to open it.`);
            ctrs.forEach((c) => { c.setAttribute('aria-pressed', 'false'); c.tabIndex = -1; g.appendChild(c); });
            rings.appendChild(g);
        };
        const open = (g) => {
            Array.from(g.querySelectorAll('.mq-ctr')).forEach((c) => { c.tabIndex = 0; pool.appendChild(c); });
            g.remove();
        };
        ring.addEventListener('click', (e) => {
            const g = e.target.closest('.mq-ringgroup');
            if (g && ring.contains(g)) { open(g); return; }
            const c = e.target.closest('.mq-ctr');
            if (c && pool.contains(c)) {
                c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
                const p = picked();
                if (p.length >= size) makeRing(p.slice(0, size));
                return;
            }
            if (e.target.closest('.mq-ring-reset')) {
                Array.from(rings.querySelectorAll('.mq-ringgroup')).forEach(open);
                picked().forEach((x) => x.setAttribute('aria-pressed', 'false'));
            }
        });
    });
}

/**
 * Counters + sizes of a grouping item, read from the fields or the text the pupil reads:
 * "There are 20 counters. Make groups of 4." / "27 ÷ 7 = ?" with a "q R r" answer.
 */
export function ringParts(q) {
    if (!q) return null;
    const t = plainText(q.text);
    const ans = String(q.ans == null ? '' : q.ans);
    const rem = ans.match(/^\s*(\d+)\s*R\s*(\d+)\s*$/i);
    if (rem || q.quotientRemainder || q.printFormat === 'div-remainders') {
        const m = t.match(/(\d+)\s*[÷/]\s*(\d+)/);
        const a = _n(q.a) != null && q.printFormat === 'div-remainders' ? _n(q.a) : m && _n(m[1]);
        const b = _n(q.b) != null && q.printFormat === 'div-remainders' ? _n(q.b) : m && _n(m[2]);
        if (a == null || !b || !rem) return null;
        if (Math.floor(a / b) !== Number(rem[1]) || a % b !== Number(rem[2])) return null;
        // O6 (AP4): the notation the generator chose (div_remainders: across or the bracket).
        const bracket = q.notation === 'bracket' || !!(q.cell && q.cell.payload && q.cell.payload.notation === 'bracket');
        return { kind: 'remainder', a, b, q: Number(rem[1]), r: Number(rem[2]), ...(bracket ? { notation: 'bracket' } : {}) };
    }
    const g = t.match(/(\d+)\s+counters?\b.*?\bgroups?\s+of\s+(\d+)/i);
    if ((q.printFormat === 'share-into-groups' || g) && g) {
        const a = _n(g[1]), b = _n(g[2]);
        if (!a || !b || a % b !== 0 || _n(ans) !== a / b || a > 60) return null;
        return { kind: 'groups', a, b };
    }
    return null;
}

/** The cell body of a grouping twin: counters to ring, then the paper's answer slot(s). */
export function ringCellHTML(p) {
    if (!p) return '';
    if (p.kind === 'remainder') {
        const w = Math.max(String(p.q).length, String(p.r).length, 2);
        if (p.notation === 'bracket') {
            // The long-division bracket, as the printed cell draws it (ops-counters.js): the
            // quotient box over the dividend, "R [ ]" beside it, the divisor against the arc and
            // the vinculum over the dividend. The two slots keep their order (quotient, remainder).
            const arc = '<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:100%;overflow:visible">'
                + '<path d="M1.5 0 H10 M1.5 0 Q9 20 1.5 40" fill="none" stroke="#000" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
            const at = (c, r, inner, extra = '') => `<span style="grid-column:${c};grid-row:${r};display:flex;align-items:flex-end;justify-content:center;${extra}">${inner}</span>`;
            return (p.a <= 60 ? ringGroupsHTML(p.a, p.b) : '')
                + `<div style="text-align:center"><div class="ws-eq mq-eq mq-remeq" data-mq-join=" R " role="group" aria-label="${attr(`${p.a} divided by ${p.b}`)}" `
                + 'style="display:inline-grid;grid-template-columns:auto 0.55em auto auto auto;grid-template-rows:auto 1.3em;column-gap:0.15em;row-gap:0.12em;">'
                + at(3, 1, cellSlot(w, 'quotient')) + at(4, 1, '<span class="mq-rlabel">R</span>') + at(5, 1, cellSlot(w, 'remainder'))
                + at(1, 2, String(p.b), 'align-items:center;padding-right:0.1em;')
                + `<span style="grid-column:2;grid-row:2;align-self:stretch;display:block">${arc}</span>`
                + at(3, 2, String(p.a), 'align-items:center;border-top:2px solid #000;padding:0 0.15em;')
                + '</div></div>';
        }
        return (p.a <= 60 ? ringGroupsHTML(p.a, p.b) : '')
            + `<div class="ws-eq mq-eq mq-remeq" data-mq-join=" R " role="group" aria-label="${attr(`${p.a} divided by ${p.b}`)}">`
            + `<span>${p.a}</span><span class="o">÷</span><span>${p.b}</span><span class="o">=</span>`
            + `${cellSlot(w, 'quotient')}<span class="mq-rlabel">R</span>${cellSlot(w, 'remainder')}</div>`;
    }
    // the paper's frame: "[ ] groups of 4" (regrade 2: not a bare "Answer:")
    return ringGroupsHTML(p.a, p.b)
        + `<div class="mq-ansline mq-groupsof"><span data-mq-blank="box"></span> <span class="mq-anslabel">groups of</span> <span class="mq-ansn">${p.b | 0}</span></div>`;
}

/**
 * Long division work rows (VA-62, the paper's "−" strips): under the bracket, one subtract row
 * per quotient digit, each a strip as wide as the dividend. Scratch space: never graded, never
 * auto-focused, skipped by the checkers (they read the quotient slot only).
 */
export function workRowsHTML(k) {
    if (!k || k.kind !== 'division') return '';
    if (k.fact) return '';      // a division FACT has no working rows (paper: workRows 0)
    const n = String(k.a).length;
    const steps = Math.max(1, Math.min(4, String(Math.floor(k.a / k.b)).length));
    const strip = (label) => `<div class="mq-workrow" role="group" aria-label="${attr(label)}"><span class="mq-workop">−</span>`
        + Array.from({ length: n }, (_, i) => `<input type="text" class="mq-work" inputmode="numeric" maxlength="1" autocomplete="off" tabindex="-1" data-ws-graded="0" data-_box-val-attached="1" data-_col-adv-attached="1" aria-label="${attr(`${label}, digit ${i + 1}`)}" data-ws-seg="${n <= 1 ? 'only' : i === 0 ? 'first' : i === n - 1 ? 'last' : 'mid'}">`).join('')
        + '</div>'
        + `<div class="mq-workrow mq-workrest"><span class="mq-workop"></span>`
        + Array.from({ length: n }, (_, i) => `<input type="text" class="mq-work" inputmode="numeric" maxlength="1" autocomplete="off" tabindex="-1" data-ws-graded="0" data-_box-val-attached="1" data-_col-adv-attached="1" aria-label="${attr(`${label} left over, digit ${i + 1}`)}" data-ws-seg="${n <= 1 ? 'only' : i === 0 ? 'first' : i === n - 1 ? 'last' : 'mid'}">`).join('')
        + '</div>';
    let rows = '';
    for (let s = 1; s <= steps; s++) rows += strip(`working, step ${s}`);
    return `<div class="mq-work-area" aria-label="working">${rows}</div>`;
}

/**
 * Does a multi-slot answer (the joined values of wireCellSlots) match the item? `null` when the
 * item is not a multi-slot item, so the caller falls back to its own checker.
 *   - inline blanks: any of `inlineBlanksData.acceptedSets` (4 rows of 5 = 5 rows of 4)
 *   - an array answer (cloze addends, the missing numbers of a strip): position by position
 *   - "q R r": quotient and remainder
 */
export function slotAnswerMatches(value, q) {
    if (!q) return null;
    // A function table checks each slot against the rule (a 'make your own' table has no one answer).
    if (q.ftCheck) return ftAnswerMatches(value, q.ftCheck);
    const cv = cellInputVerdict(value, q);
    if (typeof cv === 'boolean') return cv;
    const parts = String(value == null ? '' : value).split(/\s*(?:,|\bR\b)\s*/i).map((s) => s.trim().toLowerCase());
    const eq = (a, b) => String(a).trim().toLowerCase().replace(/,/g, '') === String(b).trim().toLowerCase().replace(/,/g, '');
    const sets = q.inlineBlanksData && Array.isArray(q.inlineBlanksData.acceptedSets) ? q.inlineBlanksData.acceptedSets : null;
    if (q.answerType === 'inline-blanks' && sets) {
        return sets.some((set) => set.length === parts.length && set.every((v, i) => eq(v, parts[i])));
    }
    if (Array.isArray(q.ans)) {
        return q.ans.length === parts.length && q.ans.every((v, i) => eq(v, parts[i]));
    }
    const rem = String(q.ans == null ? '' : q.ans).match(/^\s*(\d+)\s*R\s*(\d+)\s*$/i);
    if (rem && /R/i.test(String(value))) {
        return parts.length === 2 && eq(parts[0], rem[1]) && eq(parts[1], rem[2]);
    }
    return null;
}

/* ------------------------------------------------------------------ one answer area (2026-09-26)
 * Owner ruling: "In problems like this where they give a blank, it should not have a separate
 * answer area." A legacy drawing that answers through its OWN inputs - column digit boxes, a
 * bracket division's roof, a fraction's two boxes, a number pattern's blanks, a factor table,
 * factor links, coordinate boxes - is the answer area on every host. The online worksheet and the
 * quiz used to draw those boxes AND their own answer field. `wireCellInputs` composes the cell's
 * inputs, in reading order, into the host's (hidden) answer input, so the host's checker and
 * save path keep working; `cellInputVerdict` grades the composed value where plain equality
 * cannot (a pair list in any order, a fraction's two forms, coordinates). Working boxes (the
 * subtraction row of a bracket division, a justification's factors) stay in the cell as working.
 */
const _val = (el) => String(el && el.value != null ? el.value : '').trim();
const CELL_INPUT_RULES = [
    { sel: 'input.column-answer-input:not(.column-carry-input)', parts: 1,
        compose: (els) => els.map(_val).join('').replace(/^0+(?=\d)/, '') },
    { sel: 'input.bx-roof', parts: 1, work: 'input.bx-sub, input.bx-rem:not(:last-of-type)',
        compose: (els, root, q) => {
            const quo = els.map(_val).join('').replace(/^0+(?=\d)/, '');
            const rems = root.querySelectorAll('input.bx-rem');
            const remEl = rems[rems.length - 1];      // the last step's remainder is the answer's
            const rem = _val(remEl);
            return /R/i.test(String(q && q.ans)) || (rem && rem !== '0') ? `${quo} R ${rem || 0}` : quo;
        }, also: 'input.bx-rem' },
    { sel: 'input.dual-frac-input', parts: 2, join: ', ' },
    { sel: 'input.np-cell', join: ', ' },
    { sel: 'input.fp-input', join: ', ' },
    { sel: 'input.tc-input', pairs: ' × ' },
    { sel: 'input.links-input', pairs: '×' },
    { sel: 'input.ci-x, input.ci-y', coords: true },
];

function _cellRule(root) {
    for (const r of CELL_INPUT_RULES) {
        const els = Array.from(root.querySelectorAll(r.sel));
        if (els.length) return { rule: r, els };
    }
    return null;
}

/** Compose a cell's own inputs into one answer string (the host's answer format). */
function _compose(rule, els, root, q) {
    if (rule.compose) return rule.compose(els, root, q);
    if (rule.join) return els.map(_val).join(rule.join);
    if (rule.pairs) {
        const out = [];
        for (let i = 0; i + 1 < els.length; i += 2) {
            const a = _val(els[i]), b = _val(els[i + 1]);
            if (a || b) out.push(`${a}${rule.pairs}${b}`);
        }
        return out.join(', ');
    }
    if (rule.coords) {
        const xs = els.filter((e) => e.classList.contains('ci-x')), ys = els.filter((e) => e.classList.contains('ci-y'));
        return xs.map((x, i) => `(${_val(x)}, ${_val(ys[i])})`).join(', ');
    }
    return els.map(_val).join(', ');
}

/** How many parts the composed answer has (the grid hosts wait for all of them). */
function _partCount(rule, els) {
    if (rule.parts) return rule.parts;
    if (rule.pairs) return Math.floor(els.length / 2);
    if (rule.coords) return 2 * els.filter((e) => e.classList.contains('ci-x')).length;
    return els.length;
}

/**
 * Make a legacy drawing's own inputs the answer area of a grid host (worksheet, quiz). Returns
 * the number of answer parts (0 when the cell has no inputs this knows), and marks the host
 * input `mq-cellslot-host`; the caller hides its answer row.
 */
export function wireCellInputs(root, input, q, { onChange = null } = {}) {
    if (!root || !input || root.dataset.mqCellInputs === '1') return 0;
    const hit = _cellRule(root);
    if (!hit) return 0;
    const { rule, els } = hit;
    root.dataset.mqCellInputs = '1';
    // working boxes stay as working (never graded here)
    if (rule.work) root.querySelectorAll(rule.work).forEach((w) => w.setAttribute('data-mq-work', '1'));
    const all = rule.also ? [...els, ...Array.from(root.querySelectorAll(rule.also))] : els;
    // a saved answer comes back into the boxes (the quiz re-renders on every move)
    const saved = String(input.value || '');
    if (saved && (rule.join || rule.pairs)) {
        const vals = saved.split(/\s*,\s*/).flatMap((p) => (rule.pairs ? p.split(/\s*[×x*]\s*/) : [p]));
        els.forEach((e, i) => { if (vals[i] !== undefined && !e.value) e.value = vals[i]; });
    } else if (saved && rule.sel.startsWith('input.column-answer-input')) {
        const d = saved.replace(/[^0-9]/g, ''); const pad = els.length - d.length;
        els.forEach((e, i) => { if (i >= pad && !e.value) e.value = d.charAt(i - pad); });
    }
    const push = (commit) => {
        const v = _compose(rule, els, root, q);
        input.value = v.replace(/^[\s,()]+$/, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (commit && onChange) onChange(input.value);
    };
    all.forEach((e) => {
        e.addEventListener('input', () => push(false));
        e.addEventListener('change', () => push(true));
    });
    input.classList.add('mq-cellslot-host');
    return _partCount(rule, els);
}

const _normPair = (p) => String(p).split(/\s*[×x*]\s*/i).map((t) => t.trim()).filter(Boolean).map(Number).sort((a, b) => a - b).join('x');
const _normFrac = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * The verdict on a composed cell answer where plain equality cannot judge it, or null.
 *   factor pairs (T-chart, links): the same pairs, in any order, either way round
 *   a fraction's two forms: both, when the item carries them
 *   coordinates: every point, in order
 *   a list answer "180,190": the same numbers in the same order
 */
export function cellInputVerdict(value, q) {
    if (!q) return null;
    const v = String(value == null ? '' : value);
    // a number family's boxes, joined in reading order: right in any order, no fact twice
    if (q.answerType === 'number-family' && isOrderFreeFamily(q) && v.includes(',')) return familyComposedRight(q.numberFamilyData, v);
    if ((q.answerType === 'tchart-cells' || q.answerType === 'factor-links') && typeof q.ans === 'string' && /[×x*]/.test(v)) {
        const want = q.ans.split(/\s*,\s*/).filter(Boolean).map(_normPair).sort();
        const got = v.split(/\s*,\s*/).filter(Boolean).map(_normPair).sort();
        return want.length === got.length && want.every((p, i) => p === got[i]);
    }
    if (q.answerType === 'dual-fraction' && q.dualFractionAnswers && v.includes(',')) {
        const [m, i] = v.split(/\s*,\s*/);
        return _normFrac(m) === _normFrac(q.dualFractionAnswers.mixed) && _normFrac(i) === _normFrac(q.dualFractionAnswers.improper);
    }
    if (Array.isArray(q.ans) && q.ans.length && q.ans.every((p) => p && typeof p === 'object' && 'x' in p && 'y' in p)) {
        const pts = [...v.matchAll(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
        return pts.length === q.ans.length && q.ans.every((p, i) => Number(p.x) === pts[i][0] && Number(p.y) === pts[i][1]);
    }
    if ((q.answerType === 'text' || q.answerType === 'factor-pairs') && typeof q.ans === 'string' && q.ans.includes(',') && v.includes(',')) {
        const a = q.ans.split(/\s*,\s*/).map((t) => t.trim().toLowerCase());
        const b = v.split(/\s*,\s*/).map((t) => t.trim().toLowerCase());
        return a.length === b.length && a.every((t, i) => t.replace(/,/g, '') === b[i].replace(/,/g, ''));
    }
    return null;
}

/** Are all the slots of a multi-slot answer filled? */
export function slotsFilled(value, count) {
    // A time's two boxes join with ":" (the clock twin's data-mq-join): filled once the hour is in
    // and the minutes have both digits ("12:" and "12:1" are still being typed).
    const t = /^\s*(\d*)\s*:\s*(\d*)\s*$/.exec(String(value == null ? '' : value));
    if (t && count === 2) return !!t[1] && t[2].length >= 2;
    const parts = String(value == null ? '' : value).split(/\s*(?:,|\bR\b)\s*/i).map((s) => s.trim());
    return parts.length >= count && parts.slice(0, count).every(Boolean);
}

/* ------------------------------------------------------------------ the digit size of a cell (C3)
 * RUBRIC C3: the question's digits are 56 / 48 / 40 px on the practice card, 29 px on the online
 * worksheet. A legacy drawing (a bond, a picture sum, a model, a chart) was sized for paper in
 * px or mm and reads at 20-37 px on screen. The whole drawing is scaled up - never its text alone,
 * so the picture keeps its proportions - until its largest numerals reach the host's size or it
 * fills the cell's width, whichever comes first. A drawing that already meets the size is left
 * alone; nothing is ever scaled down (content never shrinks to fit).
 */
const NUMERAL_RE = /^[\s\d,.+\-−×÷=?<>()R]*\d[\s\d,.+\-−×÷=?<>()R]*$/;

function _numeralSizes(root) {
    const out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
        const n = w.currentNode;
        if (!n.nodeValue || !NUMERAL_RE.test(n.nodeValue)) continue;
        const p = n.parentElement;
        if (!p || p.closest('[data-mq-screen-only], .mq-sr, button, .mq-noscale')) continue;
        const r = p.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        let px = parseFloat(getComputedStyle(p).fontSize) || 0;
        if (p instanceof SVGElement && p.getScreenCTM) {
            const m = p.getScreenCTM();
            if (m) px *= Math.hypot(m.a, m.b);
        }
        if (px) out.push(px);
    }
    return out;
}

function _contentWidth(root) {
    const base = root.getBoundingClientRect();
    let l = Infinity, r = -Infinity;
    const els = root.querySelectorAll('*');
    for (let i = 0; i < els.length && i < 1500; i++) {
        const el = els[i];
        if (el.closest('[data-mq-screen-only]')) continue;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        // a block that only stretches to its parent says nothing about the drawing's width
        if (b.width >= base.width - 1 && el.children.length) continue;
        l = Math.min(l, b.left); r = Math.max(r, b.right);
    }
    return r > l ? r - l : base.width;
}

/**
 * Scale a legacy drawing so its numerals reach `target` px. `avail` is the width it may take.
 * Returns the factor applied (1 when none). Idempotent: measures from an unscaled drawing.
 */
export function fitCellDigits(root, target, { avail = 0, max = 2.6 } = {}) {
    if (!root || typeof document === 'undefined' || !target) return 1;
    // a kit twin is already drawn at the host's size (--mq-k2)
    if (root.matches('.k2-twin, [data-mq-k2]') || root.querySelector('[data-mq-k2]')) return 1;
    root.style.removeProperty('zoom');
    // the disk mat keeps its paper width under a host's zoom (the worksheet scales the cell to its
    // digit size; the mat was drawn to 790 px at 1280): its caps are divided by the zoom
    const capMats = (z) => root.querySelectorAll('svg.pv-disk-mat[data-mq-paper-w]').forEach((s) => {
        s.style.maxWidth = `${Math.round(Number(s.dataset.mqPaperW) / z)}px`;
        s.style.minWidth = `${Math.ceil(Number(s.dataset.mqFloorW) / z)}px`;
    });
    capMats(1);
    delete root.dataset.mqFit;
    delete root.dataset.mqFitShort;
    const sizes = _numeralSizes(root);
    if (!sizes.length) return 1;
    const main = Math.max(...sizes);
    const want = target / main;
    let f = want;
    if (f <= 1.04) return 1;
    const room = avail || (root.parentElement ? root.parentElement.clientWidth : root.clientWidth);
    const wide = _contentWidth(root);
    if (wide > 0 && room > 0) f = Math.min(f, (room - 4) / wide);
    f = Math.min(f, max);
    // the cell was too narrow for the host's digit size: a host that can widen the cell does
    if (f < Math.min(want, max) * 0.97) root.dataset.mqFitShort = '1';
    if (f <= 1.04) return 1;
    root.style.setProperty('zoom', f.toFixed(3));
    capMats(f);
    root.dataset.mqFit = f.toFixed(2);
    return f;
}

// Answer types whose drawing is a live widget (drag, build, plot) or a screen twin already drawn
// at the digit size: never scaled as a picture.
const NO_FIT_TYPES = new Set([
    'dnd-generic', 'drag-fill', 'nl-drag', 'hot-spot', 'image-hotspot', 'graph-builder', 'coord-plot',
    'clock-set', 'number-line-extended', 'pv-build', 'pv-digit-drag', 'compose-fraction-tiles',
    'compose-shape-blocks', 'build-expr', 'array-builder', 'vocab-match', 'tchart-drag',
    'divisibility-sort', 'base10-build', 'ten-frame-build', 'grid-fill', 'inline-cloze',
    'numpad-input', 'coin-builder', 'place-symmetry-lines', 'multi-select-check', 'odd-even-select',
    'number-line-place', 'box-division', 'multiple-choice', 'choice', 'interactive',
]);
/** May this item's drawing be scaled up to the host's digit size? */
export function canFitDigits(q) {
    return !!q && !NO_FIT_TYPES.has(q.answerType) && !(Array.isArray(q.options) && q.options.length);
}

/** The digit size a host asks for (the cell's own --mq-digit token). */
export function cellDigitTarget(cellEl) {
    if (!cellEl || typeof getComputedStyle === 'undefined') return 0;
    const v = parseFloat(getComputedStyle(cellEl).getPropertyValue('--mq-digit'));
    return Number.isFinite(v) ? v : 0;
}

/* ------------------------------------------------------------------ one twin for the grid hosts
 * The online worksheet and the quiz draw the cell from the question alone (the quiz from what a
 * saved quiz stores). `screenTwin(q)` is the one decision both make: the cell's body, its
 * instruction line, and how the answer reaches the host's input.
 *   slots    the body holds `data-mq-cell` boxes (wireCellSlots joins them into the input)
 *   blank    the body holds one `data-mq-blank` (adoptVisualBlank moves the input into it)
 *   build    the body holds a build mat (mountBuild writes the mat's value into the input)
 * null: the item keeps the host's legacy path.
 */
export function screenTwin(q, { categoryId = '', typedOrder = false } = {}) {
    if (!q) return null;
    // TY-10b (critic phone29): on a phone a count-by row is drawn again with its gap capped at 24 px absolute, so the
    // geometry (box pitch, arcs) is laid out on the narrower pitch and three whole columns fit the worksheet / quiz window
    if (q.cell && q.cell.template === 'count-row' && q.cell.payload && typeof window !== 'undefined' && window.innerWidth <= 480
        && /class="k2-twin"/.test(String(q.visual || ''))) {
        try { q = Object.assign({}, q, { visual: k2Twin('count-row', Object.assign({}, q.cell.payload, { twinGapPx: 24 })) }); } catch (e) { /* keep the stored twin */ }
    }
    const kt = kitCellTwin(q, { categoryId, typedOrder });
    if (kt) return kt;
    const t = q.answerType;
    if (t === 'inline-blanks' && /_{3,}/.test(String(q.text || ''))) {
        const widths = q.inlineBlanksData && q.inlineBlanksData.cellWidths;
        return { mode: 'slots', html: inlineBlanksHTML(q.text, widths, !!(q.inlineBlanksData && q.inlineBlanksData.fixedWidth)) + (q.visual || ''), instr: q.screenInstr || printInstructionFor(q, categoryId) || 'Solve.', count: (String(q.text).match(/_{3,}/g) || []).length };
    }
    if (t === 'inline-cloze' && /_{3,}/.test(String(q.text || ''))) {
        return { mode: 'slots', html: clozeHTML(q), instr: 'Solve.', count: (String(q.text).match(/_{3,}/g) || []).length };
    }
    if (t === 'grid-fill' && q.gridFill) {
        const html = gridFillHTML(q);
        if (html) return { mode: 'slots', html, instr: plainText(q.text), count: q.gridFill.cells.filter((c) => c.blank).length, wide: true };
    }
    const rp = ringParts(q);
    if (rp) {
        return rp.kind === 'remainder'
            ? { mode: 'slots', html: ringCellHTML(rp), instr: `Make groups of ${rp.b}. Write the answer.`, count: 2 }
            : { mode: 'blank', html: ringCellHTML(rp), instr: plainText(q.text) };
    }
    // the kit's screen twin of a build (data-mq-model): the drawn mat/frame is the answer
    if (/data-mq-model=/.test(String(q.visual || ''))) {
        return { mode: 'model', html: q.visual, instr: plainText(q.text) };
    }
    // any other kit twin (a strip, a chart window, a bond, a picture sum): the twin IS the cell;
    // its data-mq-blank / data-mq-cell boxes take the answer (the generic slot pass wires them)
    if (/class="k2-twin"|data-mq-cell=|data-mq-blank=|area-model-total|fact-family-input/.test(String(q.visual || ''))) {
        const cells = (String(q.visual).match(/data-mq-cell=/g) || []).length;
        // said once (regrade 2): a twin that prints the story itself (add_wp_10) takes a short
        // instruction, not the story again; the number line takes its jump instruction
        const said = _normText(q.text);
        // `q.screenInstr`: a generator's own instruction for a twin that prints its whole sentence
        // (add_three: "Add." over `8 + 5 + 3 = [ ]`, never the sentence twice).
        const instr = q.screenInstr ? q.screenInstr : isNumberLineItem(q) ? NUMBER_LINE_INSTRUCTION
            : (said && said.length > 12 && _normText(q.visual).includes(said)) ? 'Read the story. Write the answer.'
                : plainText(q.text);
        return { mode: 'kit', html: q.visual, instr, count: cells > 1 ? cells : 0 };
    }
    // the place-value disk mat (round 3: the worksheet and quiz drew an empty cell for pv_disks_build)
    if (t === 'pv-build') {
        const target = _n(q.target != null ? q.target : q.ans);
        if (target == null) return null;
        return { mode: 'build', html: `<div class="mq-buildhost" data-mq-build="pv-build"></div>`, instr: printInstructionFor(q, categoryId) || plainText(q.text) };
    }
    if (t === 'base10-build' || t === 'ten-frame-build') {
        const target = _n(q.target != null ? q.target : q.ans);
        if (target == null) return null;
        return { mode: 'build', html: `<div class="mq-buildhost" data-mq-build="${t}"></div>`, instr: plainText(q.text) };
    }
    return null;
}

/* ------------------------------------------------------------------ a twin never clips (round 3)
 * The kit twins draw in paper millimetres (`calc(var(--mq-k2) * n)`) and lay their rows out as
 * centred, non-wrapping flex rows. In a cell narrower than the paper cell (a phone, a quiz
 * column, three digital clocks at 1280) such a row ran off BOTH edges: "9:45" lost its first
 * digit, only the middle clock showed, "Start" read "rt". The cell clips (overflow hidden), so
 * the pupil lost information (H2).
 *
 * `fitTwinRows(root)` measures every flex row of a twin against the cell: a row whose items do
 * not fit wraps (its items keep their size and order, the row gains a row gap), and when a single
 * item is still wider than the cell the whole drawing's millimetre is reduced until it fits, never
 * below a floor that keeps numerals legible. Idempotent; run after mount and after a re-render.
 */
const K2_FLOOR_PX = 2.4;

function _rowOverflows(el, box) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return false;
    const left = Math.max(r.left, box.left), right = Math.min(r.right, box.right);
    for (const c of el.children) {
        const cr = c.getBoundingClientRect();
        if (cr.width <= 0) continue;
        if (cr.left < left - 1 || cr.right > right + 1) return true;
    }
    return false;
}

export function fitTwinRows(root) {
    if (!root || typeof getComputedStyle === 'undefined') return false;
    const twins = root.matches && root.matches('.k2-twin') ? [root] : Array.from(root.querySelectorAll('.k2-twin'));
    let changed = false;
    wireDiskSwipe(root);
    // Long division (round 3, 390 px: "the fourth digit column is clipped"): the divisor's tracks
    // hold printed digits, not inputs, so in a narrow cell they close up to the digit's own width;
    // the dividend's tracks keep their >= 44 px targets.
    root.querySelectorAll('.ws-ops-division [role="group"]').forEach((g) => {
        if (g.dataset.mqNarrow === '1') return;
        const cell = g.closest('.mq-scell, .ws-cell, #visualAid') || g.parentElement;
        if (!cell || g.getBoundingClientRect().width <= cell.getBoundingClientRect().width - 4) return;
        const cols = g.style.gridTemplateColumns || '';
        const m = /^repeat\((\d+),\s*([\d.]+)em\)\s+([\d.]+em)\s+(.*)$/.exec(cols);
        if (!m) return;
        g.style.gridTemplateColumns = `repeat(${m[1]}, 0.6em) ${m[3]} ${m[4]}`;
        g.dataset.mqNarrow = '1';
        changed = true;
    });
    twins.forEach((twin) => {
        const cell = twin.closest('.mq-scell, .ws-cell, #visualAid') || twin.parentElement;
        if (!cell) return;
        const box = cell.getBoundingClientRect();
        if (box.width <= 0) return;
        // A clock face is read, so it keeps a reading size (about 120 px) - the row wraps instead
        // of shrinking three faces to 100 px each on a phone.
        if (twin.getAttribute('data-mq-template') === 'clock' && twin.dataset.mqClockMin !== '1') {
            twin.dataset.mqClockMin = '1';
            const faces = Array.from(twin.querySelectorAll('svg.k2-svg')).map((s) => s.getBoundingClientRect().width).filter((w) => w > 0);
            const face = faces.length ? Math.min(...faces) : 0;
            if (face > 0 && face < 120 && box.width >= 150) {
                const cur = parseFloat(getComputedStyle(twin).getPropertyValue('--mq-k2')) || 3.4;
                twin.style.setProperty('--mq-k2', `${(cur * Math.min(1.6, 124 / face)).toFixed(2)}px`);
                changed = true;
            }
        }
        const rows = Array.from(twin.querySelectorAll('div, span')).filter((el) => {
            const cs = getComputedStyle(el);
            return (cs.display === 'flex' || cs.display === 'inline-flex') && !/column/.test(cs.flexDirection) && el.children.length > 1;
        });
        rows.forEach((row) => {
            if (row.dataset.mqWrapped === '1' || !_rowOverflows(row, box)) return;
            row.style.setProperty('flex-wrap', 'wrap', 'important');
            row.style.setProperty('white-space', 'normal', 'important');
            row.style.setProperty('justify-content', 'center', 'important');
            if (!row.style.rowGap) row.style.rowGap = 'calc(var(--mq-k2, 3.4px) * 3)';
            row.style.maxWidth = '100%';
            row.dataset.mqWrapped = '1';
            changed = true;
        });
        // one item still wider than the cell: the drawing's millimetre shrinks to fit - except a
        // ten-column chart, whose squares are sized from the host's digits and which swipes inside
        // its own cell instead (TY-10, SP-11a / SP-12a; critic round 4 defect F)
        // a count-by row (two lines of six, wave 1 C2) keeps its box size and swipes inside its own cell on a phone
        const sw = twin.querySelector('[data-mq-swiperow]');
        if (sw) {
            // shrink the millimetre only as far as keeps every box a 44 px touch target, then it swipes (SP-10, SP-11a)
            const cur = parseFloat(getComputedStyle(twin).getPropertyValue('--mq-k2')) || 3.4;
            const need = sw.scrollWidth, have = sw.clientWidth;
            // owner ruling 2026-10-03 (TY-10b): on a phone the row is drawn at about 29 px digits (boxes scale with them) and swipes;
            // a row whose numbers TY-10a already shrank (wider than six boxes hold) keeps that shrink, scaled by the same factor
            if (typeof window !== 'undefined' && window.innerWidth <= 480 && have > 0) {
                const dg = twin.querySelector('.k2-countrow-body .k2-given, .k2-countrow-body input.mq-cellslot');
                const fs = dg ? parseFloat(getComputedStyle(dg).fontSize) : 0;
                const base = parseFloat(twin.dataset.mqK2Base || '') || cur;
                if (!twin.dataset.mqK2Base) twin.dataset.mqK2Base = String(cur);
                const fs0 = cur > 0 ? fs * base / cur : 0;                    // the digit size at the drawing's own scale
                // a full row grows to 29 px digits; a TY-10a-shrunk row (digits under 20 px) grows by the factor a full row of the
                // card / quiz takes (29 / 24), so its long numbers grow with the rest and never pass 29 px
                const k = fs0 >= 20 ? base * Math.max(1, 29 / fs0) : base * 29 / 24;
                if (Math.abs(k - cur) > 0.01) { twin.style.setProperty('--mq-k2', `${k.toFixed(2)}px`); changed = true; }
                return;
            }
            if (need > have + 1 && have > 0) {
                const slot = twin.querySelector('.k2-tile-slot');
                const r = slot ? slot.getBoundingClientRect() : null;
                const small = r ? Math.min(r.width, r.height) : 0;       // the host's input is at least 44 px each way, so no tile shrinks below that
                const floor = small > 0 ? cur * 44 / small : cur * 0.75;
                const k = Math.max(Math.min(cur, floor), cur * have / need);
                if (k < cur - 0.01) { twin.style.setProperty('--mq-k2', `${k.toFixed(2)}px`); changed = true; }
            }
            return;
        }
        if (twin.querySelector('.k2-chart-ten')) return;
        // Fit once per cell width. This pass re-runs on every DOM change (monoCell's afterInk), and
        // typing changes the DOM (live marks, badges). Parts with a fixed pixel floor - the 44 px
        // answer boxes - never shrink with --mq-k2, so their overflow never goes away and each
        // re-run would ratchet the drawing smaller as the pupil types. Only a new cell width
        // (rotation, resize) earns a new fit.
        // (the key also counts the drawing's elements, so a widget that mounts late is still fitted)
        const fitW = `${Math.round(box.width)}:${twin.getElementsByTagName('*').length}`;
        if (twin.dataset.mqFitW === fitW) return;
        twin.dataset.mqFitW = fitW;
        const tw = twin.scrollWidth;
        const avail = Math.min(box.width, twin.parentElement ? twin.parentElement.clientWidth || box.width : box.width) - 8;
        const over = Array.from(twin.querySelectorAll('*')).reduce((m, el) => {
            const r = el.getBoundingClientRect();
            return Math.max(m, r.right - box.right, box.left - r.left);
        }, 0);
        if (over > 1 || tw > avail + 1) {
            const cur = parseFloat(getComputedStyle(twin).getPropertyValue('--mq-k2')) || 3.4;
            const need = Math.max(tw, avail + 2 * over);
            const k = Math.max(K2_FLOOR_PX, cur * (avail / need));
            if (k < cur - 0.01) { twin.style.setProperty('--mq-k2', `${k.toFixed(2)}px`); changed = true; }
        }
    });
    return changed;
}

/* ------------------------------------------------------------------ the kit cell's screen twin
 * Round-3 grades (worksheet / quiz / card, H2 / C3): a generator that emits `q.cell` (the P9
 * place-value family: estimation, rounding, value, compare, combine, more / less) often has NO
 * legacy visual - the paper cell is drawn by the kit alone. The grid hosts then drew an empty box
 * with a lone underline and the problem only in the small instruction line.
 *
 * The screen draws the SAME kit cell as paper (SP-1): `renderCell` in its blank state, with the
 * paper's point sizes rewritten against the host's digit token (so the digits reach 56 / 48 / 40
 * px on the card and 29 px on the worksheet), and the paper's writing places turned into the
 * host's slots at the paper position: one answer slot becomes a `data-mq-blank` (adoptVisualBlank
 * moves the host's own input there - after "=", after the arrow, in the circle), several become
 * `data-mq-cell` boxes (wireCellSlots joins them in reading order). The instruction line is the
 * skill's own print instruction with its verb swapped (P-LG, PEDAGOGY 10.2).
 */
const PV_TWIN_KINDS = new Set(['frame', 'value', 'compare', 'round', 'expand-line', 'place-bank', 'disks', 'estimate', 'blanks', 'chart']);
const PV_PLACE_WORDS = new Set(['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions',
    'one', 'ten', 'hundred', 'thousand', 'tenths', 'hundredths', 'thousandths']);
const PV_TWIN_TYPES = new Set(['number', 'text', 'symbol', 'inline-blanks', 'pv-digit-drag', '', undefined]);

function _categoriesOf(skillId, given) {
    if (given) return [given];
    return Object.entries(SKILLS || {})
        .filter(([, list]) => Array.isArray(list) && list.some((s) => s && s.v === skillId))
        .map(([cat]) => cat);
}

/** The skill's print instruction (its provider's controlled string), or ''. */
export function printInstructionFor(q, categoryId = '') {
    const skillId = (q && (q.skillId || q.skill)) || '';
    if (!skillId) return '';
    for (const cat of _categoriesOf(skillId, categoryId || q.categoryId || q.category || '')) {
        try {
            const p = getProvider(cat, skillId);
            if (!p || !p.real || !p.real.includes('strings')) continue;
            const s = typeof p.strings === 'function' ? p.strings({ categoryId: cat, skillId, q }) : p.strings;
            if (s && typeof s.instruction === 'string' && s.instruction) return s.instruction;
        } catch (e) { /* next category */ }
    }
    return '';
}

/**
 * The skill's name for the chrome pill (round 3: "Compare Frac" on a whole-number compare, "Find
 * the Sta", "Est Product"): the skill's own label in its category, a trailing "(…)" note dropped.
 * '' when the category does not hold the skill (a mixed session), so the caller keeps its own.
 */
export function skillDisplayLabel(categoryId, skillId) {
    if (!categoryId || !skillId) return '';
    const list = SKILLS && SKILLS[categoryId];
    const hit = Array.isArray(list) ? list.find((s) => s && s.v === skillId) : null;
    if (!hit || !hit.l) return '';
    const l = String(hit.l).replace(/\s*\([^)]*\)\s*$/, '').trim();
    return l || String(hit.l);
}

/** Paper point sizes -> the host's digit token (a digit is 1 × --mq-digit on every host). */
function _screenSizes(html, digitPt) {
    return String(html).replace(/font-size:\s*([\d.]+)pt/g, (m, v) => {
        const r = Number(v) / digitPt;
        return Number.isFinite(r) && r > 0 ? `font-size:calc(var(--mq-digit) * ${r.toFixed(3)})` : m;
    });
}

/* ------------------------------------------------------------------ round on a number line
 * The screen twin of "Mark 6,480 with a dot. Round it to the nearest 1,000." (round_nl_*, owner
 * 2026-09-25): the kit's rounding line, drawn to the cell's width, is ONE tap target; a tap puts
 * the dot where it lands and writes the number there into the item's first (hidden) slot - the
 * number itself when the tap is within half a small tick of it (`q.nlMark.tol`), so a pupil is
 * not asked for pixel precision. The second slot takes the rounded number. The two slots join into
 * the host's own answer ("6480, 6000") and every host checks it against the item's accepted set,
 * so the dot and the rounding are both marked; live green colours the dot and the box on their
 * own. Arrow keys move the dot by one hundredth of the line (keyboard access).
 */
const _fmtN = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });

function roundLineTwin(q, p, categoryId) {
    const n = Number(p.n), lo = Number(p.lo), hi = Number(p.hi);
    if (![n, lo, hi].every(Number.isFinite) || !(hi > lo)) return null;
    const tol = q.nlMark && Number.isFinite(Number(q.nlMark.tol)) ? Number(q.nlMark.tol) : (hi - lo) / 20;
    const svg = roundingLineSVG({ lo, hi, n, lengthMm: 100, labelPt: 20, mid: !!p.mid, showNumber: false, tapDot: true, pxPerMm: 3.2 })
        .replace('max-width:100%;', 'max-width:100%;width:100%;height:auto;');
    const wDot = Math.max(2, String(Math.round(hi)).length);
    const html = `<div class="ws-sheet ws-L ws-ican mq-kit mq-kittwin mq-rlwrap" data-mq-kit="pv" data-mq-kind="round-line">`
        + `<div class="mq-rl-num" style="text-align:center;font-weight:700;"><span style="font-size:calc(var(--mq-digit) * 0.55);font-weight:400;">Mark</span> `
        + `<span style="font-size:calc(var(--mq-digit));">${esc(_fmtN(n))}</span></div>`
        + `<div class="mq-rl" role="slider" tabindex="0" aria-label="${attr(`Number line from ${_fmtN(lo)} to ${_fmtN(hi)}. Tap to place ${_fmtN(n)}.`)}" `
        + `aria-valuemin="${lo}" aria-valuemax="${hi}" data-mq-rl-lo="${lo}" data-mq-rl-hi="${hi}" data-mq-rl-n="${n}" data-mq-rl-tol="${tol}" `
        + `style="cursor:pointer;touch-action:manipulation;margin:2mm 0;">${svg}</div>`
        + `<span class="mq-rl-dotslot" data-mq-rl-dot style="display:none;">${cellSlot(wDot, 'the dot')}</span>`
        + `<div class="ws-eq mq-rl-eq" style="justify-content:center;font-weight:700;flex-wrap:wrap;column-gap:0.3em;">`
        + `<span style="font-size:calc(var(--mq-digit) * 0.55);font-weight:400;">Round to the nearest</span>`
        + `<span style="font-size:calc(var(--mq-digit) * 0.7);">${esc(_fmtN(p.place))}:</span>${cellSlot(Math.max(2, String(Math.round(hi)).length), 'the rounded number')}</div></div>`;
    _wireRoundLines();
    const instr = printInstructionFor(q, categoryId) || plainText(q.text);
    return { mode: 'slots', html, instr, count: 2, kit: 'pv' };
}

let _rlWired = false;
function _rlPlace(host, v, { exact = false } = {}) {
    const lo = Number(host.dataset.mqRlLo), hi = Number(host.dataset.mqRlHi), n = Number(host.dataset.mqRlN);
    const tol = Number(host.dataset.mqRlTol) || (hi - lo) / 20;
    const wrap = host.closest('.mq-rlwrap');
    const input = wrap && wrap.querySelector('[data-mq-rl-dot] input');
    const svg = host.querySelector('svg');
    const dot = svg && svg.querySelector('.mq-rl-dot');
    if (!svg || !dot) return;
    if (input && (input.disabled || input.readOnly) && !exact) return;          // answered: the line is still
    const step = (hi - lo) / 100;
    let val = !exact && Math.abs(v - n) <= tol + 1e-9 ? n : Math.round(v / step) * step;
    val = Math.min(hi, Math.max(lo, Math.round(val * 1e6) / 1e6));
    const pad = Number(svg.dataset.rlPad), len = Number(svg.dataset.rlLen);
    dot.setAttribute('cx', (pad + (len * (val - lo)) / (hi - lo)).toFixed(2));
    dot.setAttribute('visibility', 'visible');
    host.dataset.mqRlCur = String(val);
    host.setAttribute('aria-valuenow', String(val));
    if (input && !exact) {
        input.value = String(val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // Live green (where the host shows it) marks the dot itself: the slot it writes is hidden.
    dot.classList.toggle('mq-rl-dot--ok', !!(input && input.classList.contains('mq-live-correct')));
}
/** Draw the dot of every round line under `root` from its slot's saved value (a quiz revisit). */
function _rlSync(root) {
    if (!root || !root.querySelectorAll) return;
    const hosts = root.matches && root.matches('.mq-rl') ? [root] : Array.from(root.querySelectorAll('.mq-rl'));
    hosts.forEach((host) => {
        const wrap = host.closest('.mq-rlwrap');
        const input = wrap && wrap.querySelector('[data-mq-rl-dot] input');
        const v = input ? Number(String(input.value || '').replace(/,/g, '')) : NaN;
        if (input && input.value && Number.isFinite(v)) _rlPlace(host, v, { exact: true });
    });
}
function _wireRoundLines() {
    if (_rlWired || typeof document === 'undefined' || !document.addEventListener) return;
    _rlWired = true;
    document.addEventListener('click', (e) => {
        const host = e.target && e.target.closest ? e.target.closest('.mq-rl') : null;
        if (!host) return;
        const svg = host.querySelector('svg');
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const w = Number(svg.dataset.rlW), pad = Number(svg.dataset.rlPad), len = Number(svg.dataset.rlLen);
        if (!(r.width > 0) || !(w > 0) || !(len > 0)) return;
        const x = ((e.clientX - r.left) / r.width) * w;
        const t = Math.min(1, Math.max(0, (x - pad) / len));
        const lo = Number(host.dataset.mqRlLo), hi = Number(host.dataset.mqRlHi);
        _rlPlace(host, lo + t * (hi - lo));
    });
    document.addEventListener('keydown', (e) => {
        const host = e.target && e.target.classList && e.target.classList.contains('mq-rl') ? e.target : null;
        if (!host || !/^Arrow(Left|Right|Up|Down)$|^Home$|^End$/.test(e.key)) return;
        e.preventDefault();
        const lo = Number(host.dataset.mqRlLo), hi = Number(host.dataset.mqRlHi);
        const cur = host.dataset.mqRlCur !== undefined ? Number(host.dataset.mqRlCur) : (lo + hi) / 2;
        const step = (hi - lo) / 100;
        const v = e.key === 'Home' ? lo : e.key === 'End' ? hi : cur + (/Left|Down/.test(e.key) ? -step : step);
        // A key press places exactly (no snap to the number): the pupil moves the dot there.
        const lo2 = Math.min(hi, Math.max(lo, v));
        const n = Number(host.dataset.mqRlN), tol = Number(host.dataset.mqRlTol);
        _rlPlace(host, Math.abs(lo2 - n) <= tol / 2 ? n : lo2);
    });
    if (typeof MutationObserver !== 'undefined' && document.body) {
        new MutationObserver((muts) => {
            for (const m of muts) {
                for (const nd of m.addedNodes) {
                    if (nd.nodeType === 1 && ((nd.matches && nd.matches('.mq-rlwrap')) || (nd.querySelector && nd.querySelector('.mq-rlwrap')))) {
                        setTimeout(() => _rlSync(nd), 0);
                    }
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    }
}

/**
 * The screen twin of a kit-drawn cell, or null when the item has no kit cell this can draw.
 * @returns {{mode: 'blank'|'slots', html: string, instr: string, count: number, kit: string}|null}
 */
export function kitCellTwin(q, { categoryId = '', typedOrder = false } = {}) {
    const c = q && q.cell;
    if (!c || c.template !== 'pv' || !c.payload || typeof c.payload !== 'object') return null;
    if (typeof document === 'undefined') return null;
    const p = c.payload;
    // An order item is typed into the paper's boxes where the host has no ordering widget (the
    // quiz drew an empty cell); the card and the worksheet keep their tap-to-order widget.
    const order = p.kind === 'order' && typedOrder;
    if (p.kind === 'round' && p.tapMark && q.answerType === 'inline-blanks') return roundLineTwin(q, p, categoryId);
    if (!order && (!PV_TWIN_KINDS.has(p.kind) || !PV_TWIN_TYPES.has(q.answerType))) return null;
    if (p.kind === 'round' && p.mark) return null;                            // a drawn mark: the line widget's
    if (p.kind === 'disks' && p.task !== 'count' && q.answerType !== 'number') return null;
    let html = '';
    let digitPt = 28;
    try {
        const ctx = resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank' });
        digitPt = (ctx.metrics && ctx.metrics.digitPt) || 28;
        html = renderCell(Object.assign({}, q, { cell: { template: 'pv', payload: p, v: 1 } }), ctx);
    } catch (e) { return null; }
    if (!html || /data-ws-refused/.test(html)) return null;
    const tpl = document.createElement('template');
    tpl.innerHTML = _screenSizes(html, digitPt);
    // A unit-form frame ("6,725 = __ thousands __ hundreds __ tens __ ones") keeps its slots on one
    // nowrap line for paper; on a phone that line ran off both edges of the card. On screen each
    // slot and its place word become one unbreakable pair, and the pairs wrap between them, so a
    // line never splits a box from its word and the boxes and digits keep their full size.
    tpl.content.querySelectorAll('.pv-blanks .pv-slotgroup').forEach((grp) => {
        const kids = Array.from(grp.children);
        const isSlot = (el) => el.hasAttribute('data-ws-slot') || !!el.querySelector('[data-ws-slot]');
        const words = kids.filter((el) => !isSlot(el)).map((el) => el.textContent.trim());
        if (!words.length || !words.every((w) => PV_PLACE_WORDS.has(w))) return;
        // the frame's last word ("ones") follows the group: it joins the last pair
        const tail = [];
        for (let s = grp.nextElementSibling; s && !isSlot(s); s = s.nextElementSibling) {
            if (!PV_PLACE_WORDS.has(s.textContent.trim())) break;
            tail.push(s);
        }
        const pairs = [];
        kids.forEach((el) => {
            if (isSlot(el) || !pairs.length) {
                const pr = document.createElement('span');
                pr.className = 'mq-slotpair';
                pr.style.cssText = 'display:inline-flex;align-items:flex-end;flex-wrap:nowrap;white-space:nowrap;column-gap:0.2em;';
                pairs.push(pr);
            }
            pairs[pairs.length - 1].appendChild(el);
        });
        tail.forEach((el) => pairs[pairs.length - 1].appendChild(el));
        pairs.forEach((pr) => grp.appendChild(pr));
        grp.style.flexWrap = 'wrap';
        grp.style.whiteSpace = 'normal';
        grp.style.justifyContent = 'center';
        grp.style.rowGap = '2mm';
        grp.style.columnGap = '0.45em';
        grp.style.maxWidth = '100%';
        grp.classList.add('mq-pairwrap');
    });
    const slots = Array.from(tpl.content.querySelectorAll('[data-ws-slot]'))
        .filter((s) => s.getAttribute('data-ws-graded') !== '0');
    const chart = p.kind === 'chart';
    if (!slots.length || slots.some((s) => !(chart ? /^cell$/ : /^(line|box|circle)$/).test(s.getAttribute('data-ws-shape') || ''))) return null;
    const inline = q.answerType === 'inline-blanks';
    const sets = q.inlineBlanksData && Array.isArray(q.inlineBlanksData.acceptedSets) ? q.inlineBlanksData.acceptedSets : null;
    let mode;
    if (slots.length === 1 && !inline) {
        const s = slots[0];
        const shape = s.getAttribute('data-ws-shape');
        const b = document.createElement('span');
        b.className = `mq-kblank mq-kblank--${shape}`;
        b.setAttribute('data-mq-blank', shape === 'line' ? 'line' : shape === 'circle' ? 'circle' : 'box');
        s.replaceWith(b);
        mode = 'blank';
    } else if (order) {
        const row = tpl.content.querySelector('.pv-order');
        if (!row) return null;
        row.setAttribute('data-mq-join', ',');
        slots.forEach((s, k) => {
            const t = document.createElement('template');
            t.innerHTML = cellSlot(Math.max(2, String((p.sorted || [])[k] || '').length), `number ${k + 1} of ${slots.length}`);
            s.replaceWith(t.content.firstChild);
        });
        mode = 'slots';
    } else if (chart) {
        // the place-value chart: one digit per column, written in the chart (the paper's cells);
        // the digits join into the number, left to right (data-mq-join="")
        const table = tpl.content.querySelector('table');
        if (!table) return null;
        table.setAttribute('data-mq-join', '');
        slots.forEach((s, k) => {
            const t = document.createElement('template');
            t.innerHTML = cellSlot(1, `digit ${k + 1} of ${slots.length}`, true);
            const box = t.content.firstChild;
            box.classList.add('mq-cellbox--chart');
            s.replaceWith(box);
        });
        mode = 'slots';
    } else if (inline && sets && sets[0] && sets[0].length === slots.length) {
        slots.forEach((s, k) => {
            // a unit-form place box (fixedWidth) holds its own digits exactly: 1 for "7 hundreds"
            const fx = !!q.inlineBlanksData.fixedWidth;
            const len = String(sets[0][k]).replace(/[^0-9]/g, '').length;
            const w = fx ? Math.max(1, Math.min(8, len)) : Math.max(2, Math.min(8, len));
            const t = document.createElement('template');
            t.innerHTML = cellSlot(w, `answer ${k + 1} of ${slots.length}`, fx);
            const box = t.content.firstChild;
            if (s.getAttribute('data-ws-shape') === 'line') box.classList.add('mq-cellbox--line');
            s.replaceWith(box);
        });
        mode = 'slots';
    } else {
        return null;
    }
    // The disk mat is drawn in paper millimetres (three L zones = 115 mm = 435 px), wider than a
    // phone card. It scales down with its cell, never below the size at which its smallest label
    // reaches the 8 pt floor (TY-11); past that it swipes inside its own window with the SP-11a cue.
    tpl.content.querySelectorAll('svg.pv-disk-mat').forEach((svg) => {
        const wMm = parseFloat(svg.getAttribute('width'));
        const labels = Array.from(svg.querySelectorAll('text')).map((t) => parseFloat(t.getAttribute('font-size'))).filter((v) => v > 0);
        if (!(wMm > 0) || !labels.length) return;
        const pxPerMm = 96 / 25.4;
        const minLabelPt = Math.min(...labels) / (25.4 / 72);
        const floor = Math.min(1, 8 / minLabelPt);
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxWidth = `${Math.round(wMm * pxPerMm)}px`;
        svg.style.minWidth = `${Math.ceil(wMm * pxPerMm * floor)}px`;
        svg.dataset.mqPaperW = String(Math.round(wMm * pxPerMm));
        svg.dataset.mqFloorW = String(Math.ceil(wMm * pxPerMm * floor));
        const win = document.createElement('div');
        win.className = 'k2-chartwindow mq-diskwin';
        svg.replaceWith(win);
        win.appendChild(svg);
        win.insertAdjacentHTML('beforeend', '<span class="k2-swipe-cue" aria-hidden="true"><b>Swipe</b> <i>&#10142;</i> <b>for more</b></span>');
    });
    const wrap = document.createElement('div');
    wrap.appendChild(tpl.content);
    const body = `<div class="ws-sheet ws-L ws-ican mq-kit mq-kittwin" data-mq-kit="pv" data-mq-kind="${attr(p.kind)}">${wrap.innerHTML}</div>`;
    const instr = printInstructionFor(q, categoryId) || plainText(q.text);
    // a chart's digits make ONE number: the host checks the number, not a list of parts
    return { mode, html: body, instr, count: mode === 'slots' && !chart && !order ? slots.length : 0, kit: 'pv' };
}

/**
 * A sign circle is tapped, not typed on a phone keyboard (SP-3 / H3): three sign tiles under the
 * drawing write the sign into the circle's input (it can still be typed). The tiles are the
 * paper's bank of signs, drawn in ink; the host's own checker grades the input.
 */
/** The signs a circle takes: an operation sign (+ − × ÷) or a comparison (< = >). */
export function signsFor(q) {
    return /^[+\-−×÷*/x]$/.test(String(q && q.ans != null ? q.ans : '').trim()) ? ['+', '−', '×', '÷'] : ['<', '=', '>'];
}
const SIGN_NAMES = { '<': 'less than', '>': 'greater than', '=': 'equals', '≠': 'not equal to', '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divided by' };

export function wireSignCircle(root, input, { onChange = null, signs = null } = {}) {
    if (!root || !input || !input.classList.contains('mq-slot--circle')) return false;
    if (root.querySelector('.mq-signbank')) return true;
    const bank = document.createElement('div');
    bank.className = 'mq-signbank';
    bank.setAttribute('role', 'group');
    bank.setAttribute('aria-label', 'signs');
    // the signs: the blank's own (data-mq-signs), else the caller's, else a comparison
    const list = (input.dataset.mqSigns ? input.dataset.mqSigns.split(',') : null) || signs || ['<', '=', '>'];
    list.forEach((sg) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mq-signtile';
        b.textContent = sg;
        b.setAttribute('aria-label', SIGN_NAMES[sg] || sg);
        b.addEventListener('click', () => {
            if (input.disabled || input.readOnly) return;
            input.value = sg;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            if (onChange) onChange(sg);
        });
        bank.appendChild(b);
    });
    const kit = input.closest('.mq-kittwin') || root;
    kit.appendChild(bank);
    return true;
}

/** A numeral as the paper writes it: a fraction stacked over its bar (TY-7), a negative with −. */
function _nlpNumeral(t) {
    const m = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(String(t));
    if (!m) return esc(String(t).replace(/^-/, '−'));
    return `${m[1] ? `<span class="mq-nlp-w">${esc(m[1])}</span>` : ''}<span class="mq-nlp-frac"><span>${esc(m[2])}</span><span class="mq-nlp-bar" aria-hidden="true"></span><span>${esc(m[3])}</span></span>`;
}

/**
 * O6 lane AP3 fixes: "Put the number on the line" (sheet/cells/nl-place.js), the same line on every
 * screen host. The paper's line becomes a row of tick buttons (44 px each; the row scrolls when the
 * line is long), its numerals where the paper has them. Tap a number tile (the first unplaced one
 * is chosen for you), then its tick: a dot and the tile's letter (or number) stand on that tick.
 * Tap the tick again to take it off. The input holds each tile's tick read back in the tile's own
 * form, in tile order ("2/8", "1/4, 3/4"), which is what the item's answer is.
 */
function _mountNlPlace(el, write, locked) {
    const n = Number(el.dataset.nlpN);
    const line = el.querySelector('.nlp-line');
    if (!(n >= 1) || !line) return false;
    let labels = {}, vals = {}, chipText = [];
    try { labels = JSON.parse(el.dataset.nlpLabels || '{}'); vals = JSON.parse(el.dataset.nlpVals || '{}'); chipText = JSON.parse(el.dataset.nlpChiptext || '[]'); } catch (e) { return false; }
    const fmts = String(el.dataset.nlpFmt || '').split(',');
    const major = new Set(String(el.dataset.nlpMajor || '').split(',').filter((x) => x !== '').map(Number));
    const chips = Array.from(el.querySelectorAll('[data-nlp-chip]'));
    const multi = chips.length > 1;
    const LET = ['A', 'B', 'C', 'D', 'E'];
    const wrap = document.createElement('div');
    wrap.className = 'mq-nlp';
    let ticks = '';
    for (let i = 0; i <= n; i++) {
        const lab = labels[i] !== undefined ? String(labels[i]) : '';
        ticks += `<button type="button" class="mq-nlp-tick${major.has(i) ? ' mq-nlp-major' : ''}" data-i="${i}" aria-label="${attr(lab ? `tick ${lab}` : `tick ${i} of ${n}`)}">`
            + `<span class="mq-nlp-pin" aria-hidden="true"></span><span class="mq-nlp-mark" aria-hidden="true"></span><span class="mq-nlp-dot" aria-hidden="true"></span>`
            + `<span class="mq-nlp-lab">${lab ? _nlpNumeral(lab) : ''}</span></button>`;
    }
    wrap.innerHTML = `<div class="mq-nlp-scroll" data-mq-scroll><div class="mq-nlp-track" role="group" style="--mq-nlp-n:${n + 1}" `
        + `aria-label="number line: tap a number, then its tick"><span class="mq-nlp-axis" aria-hidden="true"></span>${ticks}</div></div>`;
    line.replaceWith(wrap);
    const tickEls = Array.from(wrap.querySelectorAll('.mq-nlp-tick'));
    const placed = chips.map(() => null);
    let sel = 0;
    const cue = document.createElement('div');
    cue.className = 'mq-buildcue';
    cue.textContent = multi ? 'Tap a number, then tap its tick.' : 'Tap the tick where the number goes.';
    el.appendChild(cue);
    const paint = () => {
        chips.forEach((c, k) => {
            c.classList.toggle('mq-nlp-sel', k === sel && !locked());
            c.classList.toggle('mq-nlp-used', placed[k] !== null);
            c.setAttribute('aria-pressed', k === sel ? 'true' : 'false');
        });
        tickEls.forEach((t, i) => {
            const here = placed.map((v, k) => (v === i ? k : -1)).filter((k) => k >= 0);
            t.classList.toggle('mq-nlp-on', here.length > 0);
            t.querySelector('.mq-nlp-pin').innerHTML = here.map((k) => (multi ? LET[k] : _nlpNumeral(chipText[k] || ''))).join(' ');
        });
        write(placed.every((v) => v === null) ? '' : placed.map((v, k) => (v === null ? '' : ((vals[fmts[k]] || [])[v] || ''))).join(', '));
    };
    const nextFree = () => { const k = placed.findIndex((v) => v === null); return k >= 0 ? k : sel; };
    chips.forEach((c, k) => {
        const pickChip = () => { if (locked()) return; sel = k; paint(); };
        c.addEventListener('click', pickChip);
        c.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pickChip(); } });
    });
    tickEls.forEach((t, i) => {
        t.addEventListener('click', () => {
            if (locked()) return;
            if (placed[sel] === i) { placed[sel] = null; paint(); return; }     // tap again: take it off
            const other = placed.findIndex((v, k) => v === i && k !== sel);
            if (other >= 0 && !multi) placed[other] = null;
            placed[sel] = i;
            sel = nextFree();
            paint();
        });
    });
    // a long line opens on its 0 (the middle of an integer line, the left end of 0 to 3)
    const sc = wrap.querySelector('.mq-nlp-scroll');
    const zero = tickEls.find((t) => String(labels[t.dataset.i]) === '0');
    requestAnimationFrame(() => {
        if (!sc || sc.scrollWidth <= sc.clientWidth || !zero) return;
        sc.scrollLeft = Math.max(0, zero.offsetLeft + zero.offsetWidth / 2 - sc.clientWidth / 2);
    });
    paint();
    return true;
}

/**
 * Mount the build mat of a twin (`data-mq-build`) and write its value into `input` as the pupil
 * builds - the mat IS the answer, so the pupil never retypes the number (RUBRIC H3). The mat's
 * own Submit is hidden: the host's checker grades the value. Fields a saved quiz lost are rebuilt
 * from the answer (a target of 57 needs tens and ones).
 */
export function mountBuild(root, q, input, onValue) {
    const host = root && root.querySelector('[data-mq-build]');
    if (!host || !q || !input) return false;
    const type = host.getAttribute('data-mq-build');
    const target = _n(q.target != null ? q.target : q.ans) || 0;
    const qq = Object.assign({}, q, { target });
    if (type === 'ten-frame-build' && !qq.maxDots) qq.maxDots = target > 10 ? 20 : 10;
    if (type === 'base10-build' && !qq.maxPlace) qq.maxPlace = target >= 100 ? 100 : 10;
    const write = (v) => {
        const val = v ? String(v) : '';
        if (input.value === val) return;
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (onValue) onValue(val);
    };
    if (type === 'pv-build') {
        host.dataset.pvbNoSubmit = '1';
        host._pvOnChange = (v) => write(v);
        import('./widgets/pv-disks-build.js').then((mod) => mod.renderPvDisksBuild(qq, host))
            .catch((e) => console.error('pv-build twin:', e));
    } else if (type === 'ten-frame-build') {
        host.dataset.tfbNoSubmit = '1';
        host._tfbOnChange = (n) => write(n);
        import('./widgets/ten-frame-build.js').then((mod) => mod.renderTenFrameBuild(qq, host))
            .catch((e) => console.error('ten-frame-build twin:', e));
    } else {
        host.dataset.b10NoSubmit = '1';
        host._b10OnChange = (total) => write(total);
        import('./widgets/base10-build.js').then((mod) => mod.renderBase10Build(qq, host))
            .catch((e) => console.error('base10-build twin:', e));
    }
    return true;
}

/**
 * The empty box of a drawn chart IS the answer slot (hundreds_chart_fill: "the paper writes in the
 * chart"). A legacy SVG chart draws one empty `<rect>` among rects that each hold a number; the
 * host's input is laid exactly over that rect (percent of the viewBox, so it follows the drawing
 * at any scale), and the host's separate answer row goes. Returns true when the input moved.
 */
export function adoptSvgBlank(visualEl, input) {
    if (!visualEl || !input || typeof document === 'undefined') return false;
    const svgs = visualEl.querySelectorAll('svg');
    if (svgs.length !== 1) return false;
    const svg = svgs[0];
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (vb.length !== 4 || !(vb[2] > 0) || !(vb[3] > 0)) return false;
    const texts = Array.from(svg.querySelectorAll('text')).map((t) => ({ x: Number(t.getAttribute('x')), y: Number(t.getAttribute('y')), s: t.textContent.trim() }));
    const rects = Array.from(svg.querySelectorAll('rect')).map((r) => ({
        el: r, x: Number(r.getAttribute('x')), y: Number(r.getAttribute('y')), w: Number(r.getAttribute('width')), h: Number(r.getAttribute('height')),
    })).filter((r) => [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0 && r.w < vb[2] * 0.6);
    const holds = (r) => texts.some((t) => t.s && t.x > r.x && t.x < r.x + r.w && t.y > r.y && t.y < r.y + r.h);
    const empty = rects.filter((r) => !holds(r));
    if (empty.length !== 1 || rects.length - 1 < 3) return false;
    const r = empty[0];
    // a chart: every cell the same size as the blank one (never a bar graph or a picture)
    if (!rects.every((o) => Math.abs(o.w - r.w) < 1 && Math.abs(o.h - r.h) < 1)) return false;
    const wrap = document.createElement('span');
    wrap.className = 'mq-svgslot';
    svg.parentNode.insertBefore(wrap, svg);
    wrap.appendChild(svg);
    const pct = (v, d) => `${((v / d) * 100).toFixed(3)}%`;
    input.classList.add('mq-slot', 'mq-slot--invisual', 'mq-slot--svg');
    input.dataset.mqPrevStyle = input.getAttribute('style') || '';
    input.style.cssText += `;position:absolute;left:${pct(r.x - vb[0], vb[2])};top:${pct(r.y - vb[1], vb[3])};width:${pct(r.w, vb[2])};height:${pct(r.h, vb[3])}`;
    wrap.appendChild(input);
    return true;
}

/* ------------------------------------------------------------------ tap-to-build on the kit's model
 * The K-2 kit's screen twin names its drawing model (`data-mq-model="ten-frame" | "base10"`,
 * `data-mq-target`, `data-mq-places`, `data-mq-max`). The host makes that SAME drawing the answer:
 * a tap on a ten-frame box puts a counter in it (a tap on a counter takes it out); under each
 * base-ten zone a - / + pair takes a stick or dot away or adds one. The model's value is written
 * into the host's input as the pupil builds, so the pupil never retypes the number (RUBRIC H3),
 * and every target is at least 48 px (H6). Idempotent per model.
 */
const B10_WORD = { 100: 'hundred', 10: 'ten', 1: 'one' };
function _b10Symbol(place) {
    if (place === 10) return '<svg viewBox="0 0 2 22" aria-hidden="true" style="display:block;width:calc(var(--mq-k2, 3.4px) * 2);height:calc(var(--mq-k2, 3.4px) * 22);"><line x1="1" y1="0.8" x2="1" y2="21.2" stroke="#000" stroke-width="0.8" stroke-linecap="round"/></svg>';
    if (place === 100) return '<svg viewBox="0 0 9 9" aria-hidden="true" style="display:block;width:calc(var(--mq-k2, 3.4px) * 9);height:calc(var(--mq-k2, 3.4px) * 9);"><rect x="0.4" y="0.4" width="8.2" height="8.2" fill="none" stroke="#000" stroke-width="0.8"/></svg>';
    return '<svg viewBox="0 0 4 4" aria-hidden="true" style="display:block;width:calc(var(--mq-k2, 3.4px) * 4);height:calc(var(--mq-k2, 3.4px) * 4);"><circle cx="2" cy="2" r="1.6" fill="none" stroke="#000" stroke-width="0.8"/></svg>';
}

export function mountModel(root, input, { onValue = null } = {}) {
    const el = root && root.querySelector('[data-mq-model]');
    if (!el || !input) return false;
    if (el.dataset.mqBuilt === '1') return true;
    el.dataset.mqBuilt = '1';
    const write = (v) => {
        const val = v ? String(v) : '';
        if (input.value === val) return;
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (onValue) onValue(val);
    };
    const locked = () => !!input.disabled;
    const model = el.getAttribute('data-mq-model');
    if (model === 'nl-place') return _mountNlPlace(el, write, locked);
    if (model === 'shade') {
        // O6 lane AP3: a fraction model to shade (sheet/cells/frac-model.js). A tap shades a part
        // (the one grey), a tap again clears it; the count of shaded parts is the answer.
        const parts = Array.from(el.querySelectorAll('.shade-target'));
        const count = () => parts.filter((g) => g.getAttribute('data-shaded') === '1').length;
        parts.forEach((g, i) => {
            const fillEl = g.querySelector('[data-fill-color]');
            g.setAttribute('role', 'button');
            g.setAttribute('tabindex', '0');
            g.setAttribute('aria-pressed', 'false');
            g.setAttribute('aria-label', `part ${i + 1}`);
            const toggle = () => {
                if (locked()) return;
                const on = g.getAttribute('data-shaded') !== '1';
                g.setAttribute('data-shaded', on ? '1' : '0');
                g.setAttribute('aria-pressed', on ? 'true' : 'false');
                if (fillEl) fillEl.setAttribute('fill', on ? (fillEl.getAttribute('data-fill-color') || GREY) : PAPER);
                write(count());
            };
            g.addEventListener('click', toggle);
            g.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
        });
        const cue = document.createElement('div');
        cue.className = 'mq-buildcue';
        cue.textContent = 'Tap the parts to shade them.';
        el.appendChild(cue);
        return true;
    }
    if (model === 'ten-frame') {
        const cells = Array.from(el.querySelectorAll('td'));
        const count = () => cells.filter((c) => c.dataset.on === '1').length;
        cells.forEach((td, i) => {
            td.classList.add('mq-tfcell');
            td.setAttribute('role', 'button');
            td.setAttribute('tabindex', '0');
            td.setAttribute('aria-pressed', 'false');
            td.setAttribute('aria-label', `box ${i + 1}`);
            const toggle = () => {
                if (locked()) return;
                const on = td.dataset.on !== '1';
                td.dataset.on = on ? '1' : '0';
                td.setAttribute('aria-pressed', on ? 'true' : 'false');
                td.innerHTML = on ? '<svg viewBox="0 0 10 10" aria-hidden="true" style="display:block;margin:auto;width:60%;height:60%;"><circle cx="5" cy="5" r="5" fill="#000"/></svg>' : '';
                write(count());
            };
            td.addEventListener('click', toggle);
            td.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
        });
        // how to build (regrade 2): a black-and-white cue under the frame
        const cue = document.createElement('div');
        cue.className = 'mq-buildcue';
        cue.textContent = 'Tap the boxes to put in counters.';
        el.appendChild(cue);
        return true;
    }
    if (model === 'base10') {
        const places = String(el.getAttribute('data-mq-places') || '10,1').split(',').map(Number).filter(Boolean);
        const zones = Array.from(el.querySelectorAll('[data-ws-zone]'));
        const counts = Object.fromEntries(places.map((p) => [p, 0]));
        const total = () => places.reduce((s, p) => s + counts[p] * p, 0);
        const draw = (p, zone) => {
            const wrap = p === 1 ? 'display:grid;grid-template-columns:repeat(5, calc(var(--mq-k2, 3.4px) * 4));gap:calc(var(--mq-k2, 3.4px) * 2.5);'
                : 'display:flex;flex-wrap:wrap;gap:calc(var(--mq-k2, 3.4px) * 2);';
            zone.innerHTML = counts[p]
                ? `<div style="${wrap}justify-content:center;align-content:center;padding:calc(var(--mq-k2, 3.4px) * 3);">${Array.from({ length: counts[p] }, () => _b10Symbol(p)).join('')}</div>`
                : '';
            zone.setAttribute('aria-label', `${counts[p]} ${B10_WORD[p] || p}${counts[p] === 1 ? '' : 's'}`);
        };
        const bar = document.createElement('div');
        bar.className = 'mq-b10bar';
        places.forEach((p, i) => {
            const zone = zones[i];
            if (!zone) return;
            const word = B10_WORD[p] || String(p);
            const grp = document.createElement('div');
            grp.className = 'mq-b10pair';
            grp.setAttribute('role', 'group');
            grp.setAttribute('aria-label', `${word}s`);
            grp.innerHTML = `<button type="button" class="mq-b10btn" data-d="-1" aria-label="take away a ${word}">−</button>`
                + `<button type="button" class="mq-b10btn" data-d="1" aria-label="add a ${word}">+</button>`;
            grp.addEventListener('click', (e) => {
                const b = e.target.closest('.mq-b10btn');
                if (!b || locked()) return;
                counts[p] = Math.max(0, Math.min(p === 1 ? 19 : 9, counts[p] + Number(b.dataset.d)));
                draw(p, zone);
                write(total());
            });
            bar.appendChild(grp);
        });
        el.appendChild(bar);
        const cue = document.createElement('div');
        cue.className = 'mq-buildcue';
        cue.textContent = 'Tap + to add a block. Tap − to take one away.';
        el.appendChild(cue);
        return true;
    }
    el.dataset.mqBuilt = '';
    return false;
}

/**
 * A legacy drawing that answers through its own boxes (a fact family's four equations, an area
 * model's parts and total) feeds the grid hosts' single answer input (SL-7: those boxes ARE the
 * slots, so the host's own answer line is not drawn - RUBRIC H8 "stray extra underline"). A fact
 * family's answers travel joined ", " in reading order (what `q.ans` holds); an area model's
 * graded answer is its total (the parts are working). Returns the number of boxes, 0 when none.
 */
export function wireDrawnAnswers(cellEl, input, { onChange = null } = {}) {
    if (!cellEl || !input) return 0;
    const fam = Array.from(cellEl.querySelectorAll('input.fact-family-input, input.number-family-input'));
    const total = cellEl.querySelector('input.area-model-total');
    if (!fam.length && !total) return 0;
    const compose = () => (fam.length ? fam.map((b) => (b.value || '').trim()).join(', ') : (total.value || '').trim());
    const push = (commit) => {
        input.value = compose();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (commit && onChange) onChange(input.value);
    };
    (fam.length ? fam : [total]).forEach((b) => {
        if (b.dataset.mqDrawn === '1') return;
        b.dataset.mqDrawn = '1';
        b.addEventListener('input', () => push(false));
        b.addEventListener('change', () => push(true));
    });
    input.classList.add('mq-cellslot-host');
    return fam.length || 1;
}

/**
 * S2: the supports of a two-number fact the screen host draws with its legacy visual (no kit kind):
 * the cues, the ÷ tally row and the extras, as HTML to put under that visual. Touch dots need the
 * kit's digit spans, so they are drawn only on a kit kind. '' when there is nothing to add.
 */
export function screenSupportExtrasHTML(q, opts = {}) {
    if (!q) return '';
    const p = binaryParts(Object.assign({}, q, { options: [] })) || (Number.isFinite(Number(q.a)) && Number.isFinite(Number(q.b)) && OP_NORM[q.op] ? { a: Number(q.a), b: Number(q.b), op: OP_NORM[q.op] } : null);
    if (!p) return '';
    const k = { kind: 'eq', a: p.a, b: p.b, op: p.op };
    const sup = screenSupportsFor(q, k, opts);
    if (!sup) return '';
    const on = sup.on.filter((id) => !(id === 'touch' || id === 'touchall') || opKey(p.op) === '/');
    if (!on.length) return '';
    const html = withSupports('<span class="mq-sup-anchor"></span>', { a: p.a, b: p.b, op: p.op, supports: { ...sup, on, reserve: [] } }, 'equation',
        { mode: 'screen', size: 'L', metrics: { digitPt: 28 } }, { problemWMm: 0, problemHMm: 0 });
    return `<div class="ws-sheet mq-kit mq-sup-extra" style="margin-top:10px">${html}</div>`;
}
