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
// Layer: 4 (imports only the pure sheet kit). No window writes; no state import.

import { stack, opGlyph, toScreenInstruction } from './sheet/index.js';

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
        return { kind: 'stack', T, ...p };
    }
    if (v.includes('facts-column-visual')) {
        if (A.length <= 2 && B.length <= 2 && ANS.length <= 3) return { kind: 'fact', ...p };
        return null;
    }
    if (!v.trim()) return { kind: 'eq', ...p };
    return null;
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
    const A = String(k.a).padStart(3, ' '), B = String(k.b).padStart(3, ' ');
    const row = (s, first) => [...s].map((ch, i) => `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : ch === ' ' ? '' : ch}</span>`).join('');
    return `<div class="ws-sheet mq-kit"><div class="ws-fact mq-fact" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">`
        + `${row(A)}${row(B, opGlyph(k.op))}<span class="rule"></span>`
        + `<span class="ws-factans mq-factans">${slotHtml || ''}</span></div></div>`;
}

/**
 * Column arithmetic (VA-1..VA-13) with the kit's own `stack()` builder: H T O heads, a regroup
 * row, the sum rule and ONE digit input under EVERY track, including the operator track, so the
 * layout never reveals the answer's length (VA-4, SP-34).
 *
 * The answer inputs carry `column-answer-input` (SCC-S7): the three existing checkers — the live
 * per-box validation, the submit harvest and the worksheet checker — read them by that class, in
 * DOM order, left to right. They also carry `data-_col-adv-attached="1"` so the old left-to-right
 * auto-advance skips them; `wireStackEntry()` gives them the right-to-left entry of SP-20.
 * Regroup boxes are scratch space: `column-carry-input`, never graded, never auto-focused (SCC-S9).
 */
export function stackHTML(k, { idPrefix = '', regroup = true, answerClass = 'column-answer-input' } = {}) {
    const T = k.T || Math.max(String(k.a).length, String(k.b).length) + 1;
    const slots = [];
    for (let i = 0; i < T; i++) {
        const place = PLACES[T - 1 - i] || `place ${T - i}`;
        slots.push(`<input type="text" class="${answerClass} mq-digit" data-slot="ans-${T - 1 - i}" data-ws-slot="ans-${T - 1 - i}" data-ws-shape="box"`
            + ` inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" spellcheck="false"`
            + ` aria-label="answer, ${place} digit" data-_col-adv-attached="1"${idPrefix ? ` data-mq-stack="${attr(idPrefix)}"` : ''}>`);
    }
    let rg = !regroup ? false : (k.op === '-' ? 'sub' : 'add');
    // A regroup row needs a box to hold: an addition / 1-digit multiply of one-digit numbers has
    // no column but the ones, and a one-digit top number has nothing to regroup from.
    if (rg === 'add' && T < 3) rg = false;
    if (rg === 'sub' && String(k.a).length < 2) rg = false;
    // Place-value heads (VA-30) label columns; a one-column sum has only the ones to name.
    const heads = T >= 3;
    const regroupSlots = rg ? Array.from({ length: T }, (_, i) => {
        const place = PLACES[T - 1 - i] || '';
        return `<input type="text" class="column-carry-input mq-carry" data-ws-slot="regroup-${T - 1 - i}" data-ws-graded="0"`
            + ` inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" tabindex="-1"`
            + ` aria-label="regroup, ${place}" data-_col-adv-attached="1" data-_box-val-attached="1">`;
    }) : null;
    const inner = stack(k.a, k.b, k.op, { T, heads, regroup: rg, answer: 'slots', slots, regroupSlots });
    return `<div class="ws-sheet mq-kit" role="group" aria-label="${attr(`${k.a} ${spokenOp(k.op)} ${k.b}`)}">${inner}</div>`;
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
    if (!want || want.length < 6) return false;
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
    if (!want || want.length < 6) return false;
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
