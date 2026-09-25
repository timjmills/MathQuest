// js/modules/sheet/cell.js
// The cell box, the two label styles, and the one helper that draws every place a pupil writes.
//
// One rule makes print and screen agree: a slot exists in exactly one place, `blank()`. Print
// gets a span, screen gets an <input>, and both carry `data-ws-slot` and `data-ws-shape` so the
// lints can key off the attributes and never off a styling class (SCC-T9).
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

import { escText } from './frac-text.js';
import {
    SIZES, DEFAULT_SIZE, LOOKS, DEFAULT_LOOK, SLOT, blankWidth, resolveCtx, TAB_LADDER, factTab,
} from './tokens.js';

/** Escapes the two characters that can break out of a text node or an attribute value. */
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ----------------------------------------------------------------- labels (section 11) */

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * One item label. CL-10 quiet letter, CL-30 black number tab, CL-34 outlined Model tab.
 * A template never draws a label itself (SCC-T5); the grid and `cell()` do.
 * @param {'letter'|'tab'|'model'|'none'} style
 * @param {number} n  1-based item number (CL-13: a run never passes z.)
 */
export function label(style, n) {
    if (style === 'letter') return `<span class="ws-letter" data-ws-label="letter">${LETTERS[(n - 1) % 26]}.</span>`;
    if (style === 'tab') return `<span class="ws-tab${n > 99 ? ' w3' : n > 9 ? ' w2' : ''}" data-ws-label="tab">${n}</span>`;
    if (style === 'model') return `<span class="ws-modeltab" data-ws-label="model">Model</span>`;
    return '';
}

/** The label style a look defaults to (CL-10 / CL-30); the dialog may override it (CL-20). */
export const defaultLabelStyle = (look) => (LOOKS[look] || LOOKS[DEFAULT_LOOK]).label;

/** The tab step (6 / 5 / 4 mm) a section's effective digit size asks for (CL-31). */
export const tabStepFor = (digitPt) => factTab(digitPt);
export const tabSideMm = (digitPt) => TAB_LADDER[factTab(digitPt)].sideMm;

/* --------------------------------------------------------------- the cell box (CL-1) */

/**
 * One cell of the grid. Draws the frame, the label and nothing else: the template's own
 * output goes in unchanged (SCC-T5).
 *
 * Called with only `{label, cls, style}` the output is byte-identical to the approved mock-up
 * kit. The `data-ws-*` options below are additive and only appear when they are passed.
 *
 * @param {string} inner            template.render() output
 * @param {Object} [opts]
 * @param {string} [opts.label]     the html from label()
 * @param {string} [opts.cls]       extra classes (e.g. 'fact')
 * @param {string} [opts.style]     inline custom properties (e.g. '--fd:28pt')
 * @param {string} [opts.template]  cell template id  -> data-ws-cell="<id>"
 * @param {string} [opts.state]     blank | traced | answered | wrong
 * @param {string} [opts.look]      ican | daily
 * @param {string} [opts.size]      S | M | L
 * @param {string} [opts.skill]     'categoryId:skillId'
 * @param {string} [opts.scope]     q.responseScope
 * @param {boolean} [opts.legacy]   marks a legacy-adapter cell (SCC-A5)
 */
export function cell(inner, opts = {}) {
    const { label: lab = '', cls = '', style = '' } = opts;
    let a = opts.template ? ` data-ws-cell="${attr(opts.template)}"` : ' data-ws-cell';
    if (opts.state) a += ` data-ws-state="${attr(opts.state)}"`;
    if (opts.look) a += ` data-ws-look="${attr(opts.look)}"`;
    if (opts.size) a += ` data-ws-size="${attr(opts.size)}"`;
    if (opts.skill) a += ` data-ws-skill="${attr(opts.skill)}"`;
    if (opts.scope) a += ` data-ws-scope="${attr(opts.scope)}"`;
    if (opts.legacy) a += ' data-ws-legacy="1"';
    const body = opts.template ? `<div class="ws-cell-body">${inner}</div>` : inner;
    return `<div class="ws-cell ${cls}"${a} style="${style}">${lab}${body}</div>`;
}

/** LS-3: a dashed line across the page means CUT, and only that. Tagged for the lint (LS-4). */
export const cutLine = (note = '') =>
    `<div class="ws-cut" data-ws-cut>${note ? `<span class="ws-cut-note">${esc(note)}</span>` : ''}</div>`;

/* ------------------------------------------------------------------- slots (section 6) */

/**
 * @typedef {Object} SlotSpec
 * @property {string} [id]        unique inside the cell; defaults to 'answer'
 * @property {string} [kind]      digit | number | text | sign | fraction | time | money | unit | check | choice | place | drag
 * @property {string} [shape]     section 6 key, printed as data-ws-shape; defaults to 'line'
 * @property {boolean} [graded]   false for regroup boxes and scratch space (SCC-T17)
 * @property {number} [order]     focus order on screen (0 first)
 * @property {number} [digits]    digits in the longest expected answer -> B(n) width
 * @property {number} [separators] commas / decimal points in that answer
 * @property {number} [widthMm]   an explicit width, when the shape is not width-by-digits
 * @property {number} [maxLength]
 * @property {string} [inputmode] numeric | decimal | text
 * @property {string} [unitWord]  pre-printed after a number slot
 * @property {string} [legacyClass]
 * @property {string[]} [scopes]  response scopes that include this slot
 */

const SCREEN_INPUTMODE = { digit: 'numeric', number: 'numeric', money: 'decimal', time: 'numeric' };

function slotWidthMm(slot, ctx) {
    if (typeof slot.widthMm === 'number') return slot.widthMm;
    return blankWidth(slot.digits || 2, ctx.size, slot.separators || 0);
}

function slotAttrs(slot) {
    let a = ` data-ws-slot="${attr(slot.id || 'answer')}" data-ws-shape="${attr(slot.shape || 'line')}"`;
    if (slot.graded === false) a += ' data-ws-graded="0"';
    return a;
}

function inkOf(ctx) {
    if (ctx.state === 'traced') return 'trace';
    if (ctx.state === 'answered' || ctx.state === 'wrong') return 'solid';
    return null;
}

/** The value a slot shows in the current state; '' in state blank (SCC-T11). */
function slotValue(slot, ctx, key) {
    if (ctx.state === 'blank') return '';
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const v = (w.slots && w.slots[slot.id || 'answer']) !== undefined ? w.slots[slot.id || 'answer'] : w.value;
        return v === undefined || v === null ? '' : String(v);
    }
    if (key === null || key === undefined) return '';
    if (typeof key === 'object') {
        const entry = key.slots && key.slots[slot.id || 'answer'];
        if (entry && entry.value !== undefined) return String(entry.value);
        return key.display !== undefined ? String(key.display) : '';
    }
    return String(key);
}

/**
 * The ONE helper that draws a writing place. Print gives a span, screen gives an input, and
 * both carry the same `data-ws-slot` / `data-ws-shape` pair.
 *
 * @param {SlotSpec} slot
 * @param {Object} ctx   a resolved (or partial) CellCtx
 * @param {*} [key]      the answer key: a plain value, or an AnswerKey object
 */
export function blank(slot, ctx = {}, key = null) {
    const c = ctx.metrics ? ctx : resolveCtx(ctx);
    const shape = slot.shape || 'line';
    const value = slotValue(slot, c, key);
    const ink = value !== '' ? inkOf(c) : null;

    if (c.mode === 'screen' && !c.static && shape !== 'none') return screenSlot(slot, c, value);

    const a = slotAttrs(slot) + (ink ? ` data-ws-ink="${ink}"` : '');
    const traced = ink === 'trace' ? (c.photocopySafe ? ' ws-dotted' : ' ws-trace') : '';
    const w = slotWidthMm(slot, c);

    switch (shape) {
        case 'none':
            return '';
        case 'box':
            return `<span class="ws-box${traced}" style="--w:${w}mm"${a}>${escText(value)}</span>`;
        case 'box-unknown':   // LS-8: short dash, the only dashed shape that is not a cut line
            return `<span class="ws-box ws-box--unknown${traced}" style="--w:${w}mm"${a}>${escText(value)}</span>`;
        case 'circle':        // a sign: + - x / or < = >
            return `<span class="ws-circle${traced}"${a}>${escText(value)}</span>`;
        case 'check': {
            // Section 6: the checkbox is 5 / 6 / 7 mm. The stylesheet's `.ws-check` is a flat
            // 5 mm (it came from the mock-up, which only ever drew one size), so the size the
            // preset asks for is carried here, from SIZES, until the stylesheet reads a token.
            const cw = (SIZES[c.size] || SIZES[DEFAULT_SIZE]).checkMm;
            return `<span class="ws-check${traced}" style="width:${cw}mm;height:${cw}mm"${a}>${escText(value)}</span>`;
        }
        case 'choice':
            return `<span class="ws-choice${traced}"${a}>${escText(slot.text || value)}</span>`;
        case 'fraction':
            return `<span class="ws-slotfrac${traced}"${a}><span></span><span></span></span>`;
        case 'mixed':
            return `<span class="ws-slotmixed${traced}"${a}><span class="ws-box" style="--w:${blankWidth(1, c.size)}mm"></span>`
                + `<span class="ws-slotfrac"><span></span><span></span></span></span>`;
        case 'time': {
            const tw = SLOT.timeBoxMm[c.size];
            return `<span class="ws-slottime${traced}"${a}><span class="ws-box" style="--w:${tw}mm"></span>`
                + `<b>:</b><span class="ws-box" style="--w:${tw}mm"></span></span>`;
        }
        case 'unit':
            return `<span class="ws-line${traced}" style="--w:${w}mm"${a}>${escText(value)}</span>`
                + (slot.unitWord ? `<span class="ws-unitword">${esc(slot.unitWord)}</span>` : '');
        case 'unit-open':
            return `<span class="ws-line${traced}" style="--w:${w}mm"${a}>${escText(value)}</span>`
                + `<span class="ws-line ws-line--label" style="--w:${SLOT.unitOpenLineMm[c.size]}mm" data-ws-slot="${attr((slot.id || 'answer') + '-label')}" data-ws-shape="line"></span>`;
        case 'open':          // the open answer zone under a sum rule: ruled by the cell, not here
            return `<span class="ws-open${traced}"${a}>${escText(value)}</span>`;
        case 'line':
        default:
            return `<span class="ws-line${traced}" style="--w:${w}mm"${a}>${escText(value)}</span>`;
    }
}

/** Screen form of a slot: a real input, same ids and shapes as the printed span (SCC-T15). */
function screenSlot(slot, c, value) {
    const id = slot.id || 'answer';
    const shape = slot.shape || 'line';
    const name = (c.idPrefix ? `${c.idPrefix}-` : '') + id;
    if (shape === 'check' || shape === 'choice') {
        return `<label class="ws-choicewrap"><input type="checkbox" class="ws-check-input" name="${attr(name)}"`
            + ` data-slot="${attr(id)}"${slotAttrs(slot)}${value ? ' checked' : ''}>`
            + (slot.text ? `<span>${esc(slot.text)}</span>` : '') + `</label>`;
    }
    // LS-8: the missing-digit box keeps its own class on screen too, so the short dash that
    // tells it from a solid regroup box survives the print -> screen crossing.
    const cls = shape === 'box-unknown' ? 'ws-input ws-input--box ws-box--unknown'
        : shape === 'box' ? 'ws-input ws-input--box'
        : shape === 'circle' ? 'ws-input ws-input--circle' : 'ws-input ws-input--line';
    const bits = [
        `type="text"`,
        `class="${cls}${slot.legacyClass ? ' ' + attr(slot.legacyClass) : ''}"`,
        `name="${attr(name)}"`,
        `data-slot="${attr(id)}"`,
        `inputmode="${attr(slot.inputmode || SCREEN_INPUTMODE[slot.kind] || 'text')}"`,
        `autocomplete="off"`,
        `style="--w:${slotWidthMm(slot, c)}mm"`,
    ];
    if (slot.maxLength) bits.push(`maxlength="${slot.maxLength}"`);
    if (typeof slot.order === 'number') bits.push(`data-ws-order="${slot.order}"`);
    // SCC-T12: a traced slot on screen is a real input showing the trace value as a ghost.
    if (c.state === 'traced' && value !== '') bits.push(`placeholder="${attr(value)}"`, `data-ws-ink="trace"`);
    else if (value !== '') bits.push(`value="${attr(value)}"`, `data-ws-ink="solid"`);
    return `<input ${bits.join(' ')}${slotAttrs(slot)}>`;
}

/* -------------------------------------------- the slot primitives the mock-up pack uses */

/** A number: a baseline rule of width B(n). */
export const line = (n = 2, size = DEFAULT_SIZE, opts = {}) =>
    blank({ id: 'answer', kind: 'number', shape: 'line', digits: n, graded: true, ...opts }, { mode: 'print', size });

/** One digit, or a missing number inside an expression: a square-cornered box. */
export const box = (n = 1, size = DEFAULT_SIZE, opts = {}) =>
    blank({ id: 'answer', kind: 'number', shape: 'box', digits: n, graded: true, ...opts }, { mode: 'print', size });

/** A sign: + - x / or < = >. Diameter Hw + 2 mm. */
export const circle = (opts = {}) =>
    blank({ id: 'answer', kind: 'sign', shape: 'circle', graded: true, ...opts }, { mode: 'print' });

/** A decision: one hollow square, 5 / 6 / 7 mm. */
export const check = (size = DEFAULT_SIZE, opts = {}) =>
    blank({ id: 'check', kind: 'check', shape: 'check', graded: true, ...opts }, { mode: 'print', size });

/** LS-8: the one unknown digit inside a stacked problem. */
export const unknownBox = (n = 1, size = DEFAULT_SIZE, opts = {}) =>
    blank({ id: 'unknown', kind: 'digit', shape: 'box-unknown', digits: n, graded: true, ...opts }, { mode: 'print', size });

/* ------------------------------------------------------------------ cell box + grading */

/**
 * The contract's `renderCellBox(q, ctx)`: registry render wrapped in the cell frame.
 * Kept here (not in registry.js) so a template can never reach the frame (SCC-T5).
 */
export function renderCellBox(q, ctx = {}, renderInner) {
    const c = resolveCtx(ctx);
    const tpl = (q && q.cell && q.cell.template) || 'legacy';
    const inner = typeof renderInner === 'function' ? renderInner(q, c) : '';
    const lab = c.label && c.label.style && c.label.style !== 'none'
        ? (c.label.style === 'model' ? label('model') : `<span class="ws-${c.label.style === 'tab' ? 'tab' : 'letter'}" data-ws-label="${c.label.style}">${esc(c.label.text || '')}</span>`)
        : '';
    return cell(inner, {
        label: lab,
        template: tpl,
        state: c.state,
        look: c.look,
        size: c.size,
        skill: q && q.skillId ? `${q.categoryId || ''}:${q.skillId}` : '',
        scope: (q && q.responseScope) || 'full',
    });
}

/**
 * Compare typed values against an AnswerKey. Pure: no DOM, no feedback chrome.
 * Ungraded slots (regroup boxes, scratch, think boxes) are never marked (SCC-T17).
 */
export function gradeSlots(answerKey, values = {}) {
    const slots = (answerKey && answerKey.slots) || {};
    const out = {};
    let right = 0, total = 0;
    for (const [id, spec] of Object.entries(slots)) {
        if (!spec || spec.graded === false) { out[id] = null; continue; }
        total++;
        const got = String(values[id] === undefined || values[id] === null ? '' : values[id]).trim().replace(/,/g, '');
        const want = String(spec.value === undefined ? '' : spec.value).trim().replace(/,/g, '');
        const accept = (spec.accept || []).map((v) => String(v).trim().replace(/,/g, ''));
        const ok = got !== '' && (got === want || accept.includes(got));
        out[id] = ok;
        if (ok) right++;
    }
    return { slots: out, right, total, correct: total > 0 && right === total };
}

export { SIZES, SLOT, blankWidth };
