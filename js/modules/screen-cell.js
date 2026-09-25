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
// Layer: 4 (imports only the pure sheet kit; the build twins load their widget on demand).
// No window writes; no state import.

import { opGlyph, toScreenInstruction, factDigitTracks, factGridStyle } from './sheet/index.js';

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
    if (v.includes('facts-column-visual')) {
        if (A.length <= 2 && B.length <= 2 && ANS.length <= 3) return { kind: 'fact', ...p };
        return null;
    }
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
    const strip = Math.max(d + 1, String(sum).length);
    return { kind: 'stack', op: '+', operands, a: operands[0], b: operands[operands.length - 1], ans: sum, T: strip + 1, strip };
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
        if (v !== n.nodeValue) n.nodeValue = v;
    }
}

/**
 * Horizontal fact: `a op b = [slot]` in the kit's `.ws-eq` (TY-25: 1 em operator slots).
 * @param {{a:number,b:number,op:string}} k
 * @param {string} slotHtml  the answer slot (an <input>), or a placeholder host span
 */
export function equationHTML(k, slotHtml) {
    return `<div class="ws-sheet mq-kit"><div class="ws-eq mq-eq" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
        + `<span>${k.a}</span><span class="o">${opGlyph(k.op)}</span><span>${k.b}</span><span class="o">=</span>`
        + `<span class="mq-eqslot">${slotHtml || ''}</span></div></div>`;
}

/** Vertical fact (VA-70): three 0.72 em tracks, operator on the bottom row, sum rule, then the slot. */
export function factHTML(k, slotHtml) {
    // VA-2 (the kit's fact template): the operator has a track of its OWN, left of the digit
    // tracks, so "×12" never touches; the digit tracks cover both operands and the answer.
    const n = factDigitTracks(k.a, k.b, String(k.ans != null ? k.ans : '').length);
    const A = String(k.a).padStart(n, ' '), B = String(k.b).padStart(n, ' ');
    const row = (s) => [...s].map((ch) => `<span>${ch === ' ' ? '' : ch}</span>`).join('');
    return `<div class="ws-sheet mq-kit"><div class="ws-fact mq-fact" style="${factGridStyle(n)}" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
        + `<span></span>${row(A)}<span class="op">${opGlyph(k.op)}</span>${row(B)}<span class="rule"></span>`
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
    operands.forEach((num, r) => {
        const last = r === operands.length - 1;
        tracks(num).forEach((ch, i) => {
            if (i === 0 && last) cells.push(`<span class="op">${opGlyph(k.op)}</span>`);
            else cells.push(`<span>${ch === ' ' ? '' : ch}</span>`);
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
export function kindHTML(k, { slotHtml = '', idPrefix = '', regroup = true, answerClass = 'column-answer-input' } = {}) {
    if (!k) return '';
    if (k.kind === 'eq') return equationHTML(k, slotHtml);
    if (k.kind === 'fact') return factHTML(k, slotHtml);
    if (k.kind === 'division') return divisionHTML(k, slotHtml);
    if (k.kind === 'stack') return stackHTML(k, { idPrefix, regroup, answerClass });
    return '';
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
export function adoptVisualBlank(cellEl, input) {
    if (!cellEl || !input) return false;
    wireNumberLines(cellEl);
    const blanks = cellEl.querySelectorAll('[data-mq-blank]');
    if (blanks.length !== 1) return false;
    const blank = blanks[0];
    // A K-2 picture cell answers in a box on paper ("5 − 2 = [ ]", the sheet's equation
    // template), whatever the legacy drawing's blank was: the screen matches the page.
    const box = blank.getAttribute('data-mq-blank') === 'box' || !!blank.closest('.k2-cell');
    input.classList.add('mq-slot', 'mq-slot--invisual');
    input.classList.toggle('mq-slot--box', box);
    if (box) {
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
export function wireCellSlots(cellEl, input, { onChange = null } = {}) {
    if (!cellEl || !input) return false;
    wireOpsWork(cellEl);
    const slots = Array.from(cellEl.querySelectorAll('[data-mq-cell]'));
    if (!slots.length) return false;
    // What stands between the answers in `q.ans`: ", " for a list, " R " for a quotient and
    // remainder (the drawing says so with `data-mq-join` on an ancestor of the slots).
    const joinEl = slots[0].closest('[data-mq-join]');
    const join = joinEl ? joinEl.getAttribute('data-mq-join') : ', ';
    const saved = String(input.value || '').split(join.trim() || ',').map((t) => t.trim());
    const boxes = slots.map((slot, k) => {
        const el = document.createElement('input');
        el.type = 'text';
        el.className = 'mq-cellslot';
        el.setAttribute('inputmode', 'numeric');
        el.setAttribute('autocomplete', 'off');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('maxlength', String(Math.max(2, Number(slot.getAttribute('data-mq-w')) || 4)));
        el.setAttribute('aria-label', slot.getAttribute('data-mq-label') || `answer ${k + 1} of ${slots.length}`);
        if (saved[k]) el.value = saved[k];
        slot.textContent = '';
        slot.appendChild(el);
        return el;
    });
    const compose = () => boxes.map((b) => (b.value || '').trim()).join(join);
    boxes.forEach((b, k) => {
        b.addEventListener('input', () => {
            b.value = b.value.replace(/[^0-9]/g, '');
            input.value = compose();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        b.addEventListener('change', () => { if (onChange) onChange(compose()); });
        b.addEventListener('keydown', (e) => {
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
export const NUMBER_LINE_INSTRUCTION = 'Tap the line to jump. Write the answer.';

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
        const labels = Array.from(svg.querySelectorAll('text'))
            .map((t) => ({ x: Number(t.getAttribute('x')), s: t.textContent.trim() }))
            .filter((t) => t.s !== '' && Number.isFinite(t.x) && /^-?\d+$/.test(t.s))
            .sort((a, b) => a.x - b.x);
        if (labels.length < 2) return;
        const dot = svg.querySelector('[data-nl-start]');
        const start = dot ? String(dot.getAttribute('data-nl-start')) : labels[0].s;
        const vals = labels.map((l) => l.s);
        const startIdx = Math.max(0, vals.indexOf(start));
        ops.dataset.mqNl = '1';
        const wrap = document.createElement('div');
        wrap.className = 'mq-nl';
        wrap.setAttribute('data-mq-nl', '');
        wrap.style.setProperty('--mq-nl-n', String(vals.length));
        wrap.innerHTML = `<div class="mq-nl-scroll" data-mq-scroll><div class="mq-nl-track" role="group" aria-label="${attr(svg.getAttribute('aria-label') || 'number line')}. Tap a number to jump to it.">`
            + '<svg class="mq-nl-arcs" aria-hidden="true" preserveAspectRatio="none"></svg><span class="mq-nl-line" aria-hidden="true"></span>'
            + vals.map((v, i) => `<button type="button" class="mq-nl-tick${i === startIdx ? ' mq-nl-start' : ''}" data-i="${i}" aria-label="${attr(v)}${i === startIdx ? ', start' : ''}">`
                + `<span class="mq-nl-mark" aria-hidden="true"></span><span class="mq-nl-lab">${esc(v)}</span></button>`).join('')
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
export function saveWorking(root) {
    if (!root) return null;
    return {
        nl: Array.from(root.querySelectorAll('[data-mq-nl]')).map((w) => w.dataset.mqJumps || ''),
        work: Array.from(root.querySelectorAll('input.mq-work')).map((i) => i.value || ''),
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
    input.classList.remove('mq-slot--invisual', 'mq-slot--svg', 'mq-bsize');
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
export function monoCell(root, { afterInk = null } = {}) {
    if (!root || typeof MutationObserver === 'undefined') return;
    if (afterInk) AFTER_INK.set(root, afterInk);
    const run = (targets) => {
        const obs = OBSERVERS.get(root);
        if (obs) obs.disconnect();
        try { targets.forEach(inkTree); } catch (e) { /* never break a render */ }
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
export function cellSlot(w = 2, label = '') {
    const n = Math.max(1, Math.min(8, w | 0));
    return `<span class="mq-cellbox" data-mq-cell data-mq-w="${n}" style="--mq-w:${n}"${label ? ` data-mq-label="${attr(label)}"` : ''}></span>`;
}

/** "This array shows ___ rows of ___." -> the sentence with one boxed slot per blank (SL-7). */
export function inlineBlanksHTML(text, widths) {
    let i = 0;
    const html = esc(plainText(text)).replace(/_{3,}/g, () => {
        const w = widths && widths[i] ? Math.max(1, Math.min(4, widths[i] - 1)) : 3;
        i++;
        return cellSlot(w);
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
        return { kind: 'remainder', a, b, q: Number(rem[1]), r: Number(rem[2]) };
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

/** Are all the slots of a multi-slot answer filled? */
export function slotsFilled(value, count) {
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
export function screenTwin(q) {
    if (!q) return null;
    const t = q.answerType;
    if (t === 'inline-blanks' && /_{3,}/.test(String(q.text || ''))) {
        const widths = q.inlineBlanksData && q.inlineBlanksData.cellWidths;
        return { mode: 'slots', html: inlineBlanksHTML(q.text, widths) + (q.visual || ''), instr: 'Solve.', count: (String(q.text).match(/_{3,}/g) || []).length };
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
        const instr = isNumberLineItem(q) ? NUMBER_LINE_INSTRUCTION
            : (said && said.length > 12 && _normText(q.visual).includes(said)) ? 'Read the story. Write the answer.'
                : plainText(q.text);
        return { mode: 'kit', html: q.visual, instr, count: cells > 1 ? cells : 0 };
    }
    if (t === 'base10-build' || t === 'ten-frame-build') {
        const target = _n(q.target != null ? q.target : q.ans);
        if (target == null) return null;
        return { mode: 'build', html: `<div class="mq-buildhost" data-mq-build="${t}"></div>`, instr: plainText(q.text) };
    }
    return null;
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
    if (type === 'ten-frame-build') {
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
