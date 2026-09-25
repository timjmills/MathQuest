// js/modules/sheet/cells/stack.js
// Stacked arithmetic: H T O heads, regroup boxes, the sum rule and the answer zone.
//
// Rules: VA-1 track count, VA-2 operator track, VA-7 missing digit, VA-10..VA-13 regroup,
// VA-20..VA-23 subtraction headroom, TY-20..TY-26 tracks, PG-14 spare height goes below.
//
// Pure module (SCC-01). A template draws inner HTML only (SCC-T5) and never chooses a type
// size, a line weight or a grey (SCC-T3).

import { opGlyph, trackMm, SIZES, factTab } from '../tokens.js';
import { blank } from '../cell.js';
import { register } from '../registry.js';

// VA-2: the leftmost track is the operator track; place names run right to left from the ones.
const PLACE_NAMES = ['O', 'T', 'H', 'Th', 'TTh', 'HTh'];

/**
 * One stacked problem.
 *
 * @param {number|string} a   top operand
 * @param {number|string} b   bottom operand
 * @param {string} op         '+', '-', '*', 'x', '/'
 * @param {Object} [opts]
 * @param {number} [opts.T]           track count including the operator track (VA-1, TY-26)
 * @param {boolean} [opts.heads]      H T O place heads above the stack
 * @param {'add'|'sub'|false} [opts.regroup]  the regroup row (VA-10) or subtraction headroom (VA-20)
 * @param {'open'|'boxes'|'traced'|'solid'|'slots'} [opts.answer]  the answer zone (VA-11).
 *        'slots' takes pre-rendered slot HTML in `opts.slots`, one per track - this is how the
 *        screen gets a typed answer row in the same geometry as the printed one (SCC-T15).
 * @param {string[]} [opts.slots]
 * @param {boolean} [opts.grey]       Guided: the same scaffolds printed grey (SF-10, BD-7)
 * @param {number|string|null} [opts.ans]  the value for answer: 'traced'
 * @param {{row: 'a'|'b'|'ans', index: number}} [opts.unknown]  VA-7 / LS-8 missing-digit box
 * @param {string} [opts.unknownSlot]   the unknown digit's slot HTML, so screen mode can make it
 *        a real input instead of a printed box (SCC-T15). Absent: the printed box.
 * @param {string[]} [opts.regroupSlots] slot HTML per track for the regroup row, same reason.
 * @param {'trace'|'solid'|null} [opts.boxInk]  with `answer: 'boxes'` and `ans`, the digits are
 *        drawn INSIDE the boxes, so a key laid over a Guided page lines up exactly (SCC-T10).
 */
export function stack(a, b, op, { T, heads = false, regroup = false, answer = 'open', grey = false, ans = null, unknown = null, slots = null, unknownSlot = null, regroupSlots = null, boxInk = null } = {}) {
    const A = String(a), B = String(b);
    const t = T || Math.max(A.length, B.length) + 1;
    const pad = (s) => [...s.padStart(t, ' ')];
    // LS-8: one digit of the stack is unknown -> a short-dash digit box in its own track.
    const hole = (rowId, i) => unknown && unknown.row === rowId && unknown.index === i;
    const glyph = (ch, rowId, i) => (hole(rowId, i)
        ? (unknownSlot || `<span class="ws-box ws-box--unknown" data-ws-slot="d-${rowId}-${i}" data-ws-shape="box-unknown"></span>`)
        : ch === ' ' ? '' : ch);
    const row = (chars, first = '', rowId = '') => chars.map((ch, i) =>
        `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : glyph(ch, rowId, i)}</span>`).join('');
    const g = grey ? ' ws-grey' : '';
    // On screen the carry box is a real (ungraded) input in the same track; on paper it is the
    // empty box VA-10 asks for.
    const rgBox = (i) => (regroupSlots ? (regroupSlots[i] || '<i></i>') : '<i></i>');
    let html = '';
    if (heads) {
        html += Array.from({ length: t }, (_, i) => `<span class="head">${i === 0 ? '' : PLACE_NAMES[t - 1 - i] || ''}</span>`).join('') + `<span class="headcap"></span>`;
    }
    // VA-10: one carry box above EVERY column except the ones, whether or not that column
    // regroups, so the boxes reveal nothing. VA-22: subtraction boxes come from the top
    // number's digits only, never from the answer.
    if (regroup === 'add') html += Array.from({ length: t }, (_, i) => `<span class="rg${g}">${i > 0 && i < t - 1 ? rgBox(i) : ''}</span>`).join('');
    if (regroup === 'sub') html += Array.from({ length: t }, (_, i) => `<span class="rg${g}">${i > t - 1 - A.length ? rgBox(i) : ''}</span>`).join('');
    html += row(pad(A), '', 'a') + `<span class="gap"></span>` + row(pad(B), opGlyph(op), 'b') + `<span class="rule"></span>`;
    if (answer === 'boxes') {
        // The box is structure and stays black; only the digit inside it takes the trace grey
        // (INK-3). The inline rule centres the glyph in its box - it sets no size and no ink.
        const fill = boxInk && ans !== null ? pad(String(ans)) : null;
        html += Array.from({ length: t }, (_, i) => {
            const ch = fill && fill[i] !== ' ' ? fill[i] : '';
            const ink = ch ? ` class="${boxInk === 'trace' ? 'ws-trace' : ''}" data-ws-ink="${boxInk}" style="display:flex;align-items:center;justify-content:center"` : '';
            return `<span class="ab${g}"><i${ink}>${ch}</i></span>`;
        }).join('');
    }
    if (answer === 'traced' && ans !== null) html += pad(String(ans)).map((ch) => `<span class="ws-trace">${ch === ' ' ? '' : ch}</span>`).join('');
    if (answer === 'solid' && ans !== null) html += pad(String(ans)).map((ch) => `<span data-ws-ink="solid">${ch === ' ' ? '' : ch}</span>`).join('');
    if (answer === 'slots' && slots) html += slots.map((s) => `<span class="ab">${s}</span>`).join('');
    // TY-21: any regroup scaffold forces 0.95 em tracks in both looks (the 'wide' class).
    return `<div class="ws-stack${regroup ? ' wide' : ''}" style="--t:${t}" data-ws-slot="answer" data-ws-shape="open">${html}</div>`;
}

/* ------------------------------------------------------------------ registry template */

const compute = (p) => {
    const [a, b] = p.operands || [p.a, p.b];
    switch (p.op) {
        case '+': return Number(a) + Number(b);
        case '-': case '−': return Number(a) - Number(b);
        case '*': case 'x': case '×': return Number(a) * Number(b);
        case '/': case '÷': return Number(b) ? Number(a) / Number(b) : null;
        default: return null;
    }
};
// The widest ROW sets the tracks, the answer row included: 6 + 5 = 11 needs a tens track under
// the operator track, or the key's second digit has nowhere to go (VA-3, AK-1).
const tracksOf = (p) => {
    if (p.T) return p.T;
    const ops = p.operands || [p.a, p.b];
    const v = p.ans !== undefined ? p.ans : compute(p);
    const ansLen = v !== null && v !== undefined && /^\d+$/.test(String(v)) ? String(v).length : 0;
    return Math.max(String(ops[0] ?? '').length, String(ops[1] ?? '').length, ansLen) + 1;
};

/**
 * Which tracks carry a regroup box, so `render`, `inputs` and `answerKey` agree (SCC-T13).
 * VA-10: addition boxes sit above every column except the ones (and not over the operator track).
 * VA-22: subtraction boxes come from the TOP NUMBER's digits only, never from the answer - so
 * their indexes are not the addition ones, which is why this lives in one place.
 */
function regroupTracks(kind, t, topDigits) {
    const all = Array.from({ length: t }, (_, i) => i);
    if (kind === 'add') return all.filter((i) => i > 0 && i < t - 1);
    if (kind === 'sub') return all.filter((i) => i > t - 1 - topDigits);
    return [];
}

/** The scaffold the ladder asks for, resolved once (SCC-Q10: the ctx decides, not the generator). */
function scaffoldOf(p, ctx) {
    const level = ctx && ctx.scaffoldLevel !== undefined ? ctx.scaffoldLevel : 1;
    const heads = p.heads !== undefined ? p.heads : level >= 2;
    const regroup = p.regroup !== undefined ? p.regroup : (level >= 1 && (p.op === '-' ? 'sub' : 'add'));
    return { level, heads, regroup };
}

/**
 * One digit place of the answer row. DOM order stays left to right; SCC-T14 puts the FOCUS
 * order right to left, because that is the order the algorithm is worked in.
 */
const answerSlot = (i, t) => ({
    id: `ans-${i}`, kind: 'digit', shape: 'box', graded: true, order: t - 1 - i,
    maxLength: 1, inputmode: 'numeric', legacyClass: 'column-answer-input',
    scopes: ['full', 'answer-only'],
});

/** VA-13 / SCC-T17: a carry box is scratch space - present, never graded, never auto-focused. */
const regroupSlot = (i) => ({
    id: `regroup-${i}`, kind: 'digit', shape: 'box', graded: false, order: 100 + i,
    maxLength: 1, inputmode: 'numeric', scopes: ['full', 'notation'],
});

/** VA-7 / LS-8: the one unknown digit. It IS the scored answer of a missing-digit item (SL-10). */
const unknownSlotSpec = (u) => ({
    id: `d-${u.row}-${u.index}`, kind: 'digit', shape: 'box-unknown', graded: true, order: 0,
    maxLength: 1, inputmode: 'numeric', scopes: ['full', 'answer-only'],
});

register('stack', {
    render(p, ctx) {
        const [a, b] = p.operands || [p.a, p.b];
        const value = p.ans !== undefined ? p.ans : compute(p);
        // The scaffold ladder (section 2.5) decides what is drawn, never the generator (SCC-Q10).
        const { level, heads, regroup } = scaffoldOf(p, ctx);
        const t = tracksOf(p);
        const shown = ctx.state === 'wrong' ? (ctx.wrong && ctx.wrong.value) : value;
        // SCC-T10: geometry is identical across states, so the ANSWER ZONE's shape is chosen by
        // the scaffold level alone and the state only decides what ink goes in it. A Guided or
        // Model cell keeps its digit boxes in every state and the digits sit inside them; an
        // Independent cell keeps its open zone and the digits sit in it.
        let answer = p.answer || (level >= 2 ? 'boxes' : 'open');
        let boxInk = null;
        if (ctx.state !== 'blank') {
            const ink = ctx.state === 'traced' ? 'trace' : 'solid';
            if (answer === 'boxes') boxInk = ink;
            else answer = ink === 'trace' ? 'traced' : 'solid';
        }
        // SCC-T15 parity: a slot the pupil writes on paper is TYPED on screen. The printed
        // open answer zone becomes one digit input per track, in the same geometry (VA-11), the
        // carry boxes become ungraded inputs (VA-13) and the missing digit becomes an input too.
        const screen = ctx.mode === 'screen' && !ctx.static;
        const key = p.unknown || screen ? this.answerKey(p) : null;
        let slots = null, regroupSlots = null, unknownSlot = null;
        // VA-7: the missing digit is a slot in BOTH modes, so it is typed on screen and carries
        // its given digit on an answer key. Its printed width is B(1) = 14 mm either way.
        if (p.unknown) unknownSlot = blank(unknownSlotSpec(p.unknown), ctx, key);
        if (screen) {
            slots = Array.from({ length: t }, (_, i) => blank(answerSlot(i, t), ctx, key));
            answer = 'slots';
            boxInk = null;
            if (regroup) {
                regroupSlots = [];
                for (const i of regroupTracks(regroup, t, String(a).length)) regroupSlots[i] = blank(regroupSlot(i), ctx, key);
            }
        }
        return stack(a, b, p.op, {
            T: t, heads, regroup, answer, slots, regroupSlots, unknownSlot, boxInk,
            grey: level === 2 && ctx.state === 'blank',
            ans: shown === undefined ? null : shown,
            unknown: p.unknown || null,
        });
    },
    answerKey(p) {
        const value = p.ans !== undefined ? p.ans : compute(p);
        const digits = String(value === null ? '' : value);
        // SCC-T18: thousands use a comma separator in `display`.
        const display = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
        const t = tracksOf(p);
        const slots = { answer: { value: digits, graded: true, accept: [display] } };
        // One graded digit slot per track, right-aligned to the ones track (TY-20).
        const padded = digits.padStart(t, ' ');
        for (let i = 0; i < t; i++) {
            slots[`ans-${i}`] = { value: padded[i] === ' ' ? '' : padded[i], graded: true };
        }
        // VA-13: regroup boxes are scratch space; never scored, on paper or on screen. Both
        // regroup shapes are listed, because `answerKey` has no ctx and so cannot know which
        // scaffold is drawn; `gradeSlots` returns null for every one of them either way.
        const topDigits = String((p.operands || [p.a])[0] ?? '').length;
        for (const i of regroupTracks('add', t, topDigits)) slots[`regroup-${i}`] = { value: '', graded: false };
        for (const i of regroupTracks('sub', t, topDigits)) slots[`regroup-${i}`] = { value: '', graded: false };
        // VA-7: in a missing-digit item the unknown digit is the scored answer (SL-10).
        if (p.unknown) {
            const src = p.unknown.row === 'b' ? String((p.operands || [p.a, p.b])[1] ?? '') : p.unknown.row === 'a' ? String((p.operands || [p.a])[0] ?? '') : digits;
            const padded = src.padStart(t, ' ');
            slots[`d-${p.unknown.row}-${p.unknown.index}`] = { value: padded[p.unknown.index] === ' ' ? '' : padded[p.unknown.index], graded: true };
        }
        return { value, display, slots };
    },
    footprint(p, ctx) {
        const t = tracksOf(p);
        const s = SIZES[ctx.size];
        const regroup = p.regroup !== undefined ? !!p.regroup : ctx.scaffoldLevel >= 1;
        const track = trackMm(ctx.metrics.digitPt, ctx.size, ctx.look, regroup);
        const digitH = (ctx.metrics.digitPt / 72) * 25.4 * 1.15;   // TY-13 digit line-height 1.15
        const hMm = (p.heads || ctx.scaffoldLevel >= 2 ? s.headsMm : 0)
            + (regroup ? (p.op === '-' ? s.headroomMm : s.regroupMm) : 0)
            + digitH * 2 + 3 + s.answerMm;
        return {
            wMm: Math.ceil(t * track + 6), hMm: Math.ceil(hMm), measure: false,
            factLike: false, maxCols: 3, tracks: t,
        };
    },
    /**
     * SCC-T13: exactly the slots `render` draws for the same arguments - no more (a regroup row
     * that is switched off has no slots) and no fewer (the stack's own open answer zone is a
     * slot on paper).
     */
    inputs(p, ctx) {
        const t = tracksOf(p);
        const { regroup } = scaffoldOf(p, ctx);
        const [a] = p.operands || [p.a, p.b];
        const screen = ctx && ctx.mode === 'screen' && !ctx.static;
        const out = [];
        if (regroup) for (const i of regroupTracks(regroup, t, String(a ?? '').length)) out.push(regroupSlot(i));
        if (screen) for (let i = 0; i < t; i++) out.push(answerSlot(i, t));
        // On paper the answer zone under the sum rule is ONE open slot (VA-11, PG-14).
        else out.push({ id: 'answer', kind: 'number', shape: 'open', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        if (p.unknown) out.push(unknownSlotSpec(p.unknown));
        return out;
    },
    layout(p) { return { card: 'card-column', checker: 'columns', requiresVisual: true }; },
});

/** The tab step a stacked section asks for at this digit size (CL-31). */
export const stackTabStep = (digitPt) => factTab(digitPt);

/** Exported so a page can draw one answer slot in the same shape the template uses. */
export const stackAnswerSlot = (ctx, key) =>
    blank({ id: 'answer', kind: 'number', shape: 'line', digits: 4, graded: true, order: 0 }, ctx, key);
