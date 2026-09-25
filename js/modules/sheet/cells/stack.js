// js/modules/sheet/cells/stack.js
// Stacked arithmetic: H T O heads, regroup boxes, the sum rule and the answer zone.
//
// Rules: VA-1 track count, VA-2 operator track, VA-7 missing digit, VA-10..VA-13 regroup,
// VA-20..VA-23 subtraction headroom, TY-20..TY-26 tracks, PG-14 spare height goes below.
//
// Pure module (SCC-01). A template draws inner HTML only (SCC-T5) and never chooses a type
// size, a line weight or a grey (SCC-T3).

import { opGlyph, trackMm, SIZES, factTab, stripPos } from '../tokens.js';
import { blank, esc } from '../cell.js';
import { register } from '../registry.js';
import { stepMarks, placeDigits, regroupMarks, PLACE_OFFSET } from '../steps.js';
import { touchMode, touchColumns, touchOpts, touchDigit } from '../support-draw.js';

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
export function stack(a, b, op, { T, heads = false, regroup = false, answer = 'open', grey = false, ans = null, unknown = null, slots = null, unknownSlot = null, regroupSlots = null, boxInk = null, ansTracks = 0, trackInk = null, touch = null, strikes = null, rings = null } = {}) {
    // `a` may be an ARRAY of the rows above the operator row (three or four addends, CM-5/CM-6):
    // every one of them sits on the digit tracks with an empty operator track (VA-2).
    const tops = (Array.isArray(a) ? a : [a]).map(String);
    const A = tops[0], B = String(b);
    const t = T || Math.max(...tops.map((x) => x.length), B.length) + 1;
    // SL-12 / VA-4: the answer strip spans the ANSWER's digit tracks only. The operator track is
    // never a box (a run interrupted by the operator track is two strips, and a box under the
    // operator told the pupil to write a leading 0). 0 = every track (the old shape).
    const nAns = ansTracks > 0 ? Math.min(ansTracks, t) : t;
    const firstAns = t - nAns;
    const pad = (s) => [...s.padStart(t, ' ')];
    // LS-8: one digit of the stack is unknown -> a short-dash digit box in its own track.
    const hole = (rowId, i) => unknown && unknown.row === rowId && unknown.index === i;
    const glyph = (ch, rowId, i) => (hole(rowId, i)
        ? (unknownSlot || `<span class="ws-box ws-box--unknown" data-ws-slot="d-${rowId}-${i}" data-ws-shape="box-unknown"></span>`)
        : ch === ' ' ? '' : ch);
    // S2: `touch` = {rows: [one boolean per track, per operand row], o}: touch dots on those digits,
    // column by column (support-draw.js touchColumns). The overlay takes no space.
    const row = (chars, first = '', rowId = '', tRow = null) => chars.map((ch, i) => {
        if (i === 0 && first) return `<span class="op">${first}</span>`;
        const td = tRow && tRow[i] && !hole(rowId, i) ? touchDigit(ch, true, touch.o) : null;
        // VA-23: a Model cell crosses out a regrouped top digit with a solid diagonal - 0.75 pt
        // black, or 1 pt trace grey on the step that makes it (INK-4). It overlays the digit and
        // takes no space, so the stack's geometry is the same in every step state.
        // A worked step that LOOKS at a column rings its digits (the column the step reads), in
        // trace grey on its own step and black after it; an outline takes no space.
        const rk = rings && (rowId === 'a' || rowId === 'b') ? rings[i] : null;
        if (!td && rk && ch !== ' ' && !hole(rowId, i)) {
            const style = rk === 'trace' ? 'outline:1pt solid #949494' : 'outline:0.75pt solid #000';
            return `<span><span class="ws-ring" data-ws-mark="${rk}" style="${style};outline-offset:0.06em;border-radius:45%">${glyph(ch, rowId, i)}</span></span>`;
        }
        const sk = rowId === 'a' && strikes ? strikes[i] : null;
        if (!td && sk && ch !== ' ') {
            const grey = sk === 'trace';
            return `<span style="position:relative">${glyph(ch, rowId, i)}<svg class="ws-strike${grey ? ' ws-trace' : ''}" data-ws-ink="${grey ? 'trace' : 'solid'}" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true" `
                + `style="position:absolute;left:8%;top:12%;width:84%;height:76%;overflow:visible"><line x1="1" y1="9.5" x2="9" y2="0.5" stroke="${grey ? '#949494' : '#000'}" `
                + `stroke-width="${grey ? '1pt' : '0.75pt'}" vector-effect="non-scaling-stroke"/></svg></span>`;
        }
        return td || `<span>${glyph(ch, rowId, i)}</span>`;
    }).join('');
    const tr = (k) => (touch && Array.isArray(touch.rows) ? touch.rows[k] : null);
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
    // SL-12: the boxes of one row are ONE digit strip - a rounded outline with a divider on
    // every track boundary. `data-ws-seg` says where each track sits in the strip; the
    // stylesheet draws the outline, the dividers and the end radii from it (print and screen).
    if (regroup) {
        const on = regroupTracks(regroup, t, A.length);
        html += Array.from({ length: t }, (_, i) => {
            const k = on.indexOf(i);
            return k < 0 ? `<span class="rg${g}"></span>`
                : `<span class="rg${g}" data-ws-seg="${stripPos(k, on.length)}">${rgBox(i)}</span>`;
        }).join('');
    }
    html += tops.map((x, k) => row(pad(x), '', k === 0 ? 'a' : `a${k}`, tr(k)) + `<span class="gap"></span>`).join('')
        + row(pad(B), opGlyph(op), 'b', tr(tops.length)) + `<span class="rule"></span>`;
    if (answer === 'boxes') {
        // The box is structure and stays black; only the digit inside it takes the trace grey
        // (INK-3). The inline rule centres the glyph in its box - it sets no size and no ink.
        // `trackInk` (a step state, steps.js): one {ch, ink} per track, so the newest digits are
        // grey and the earlier ones black in the SAME boxes (P-LC-9).
        const fill = boxInk && ans !== null ? pad(String(ans)) : null;
        html += Array.from({ length: t }, (_, i) => {
            if (i < firstAns) return `<span class="ab${g}"></span>`;
            const tk = trackInk ? trackInk[i] : null;
            const ch = tk ? tk.ch : trackInk ? '' : fill && fill[i] !== ' ' ? fill[i] : '';
            const inkName = tk ? tk.ink : boxInk;
            const ink = ch ? ` class="${inkName === 'trace' ? 'ws-trace' : ''}" data-ws-ink="${inkName}" style="display:flex;align-items:center;justify-content:center"` : '';
            return `<span class="ab${g}" data-ws-seg="${stripPos(i - firstAns, nAns)}"><i${ink}>${ch}</i></span>`;
        }).join('');
    }
    if (answer === 'steps' && trackInk) html += trackInk.map((tk) => (tk ? `<span class="${tk.ink === 'trace' ? 'ws-trace' : ''}" data-ws-ink="${tk.ink}">${tk.ch}</span>` : '<span></span>')).join('');
    if (answer === 'traced' && ans !== null) html += pad(String(ans)).map((ch) => `<span class="ws-trace">${ch === ' ' ? '' : ch}</span>`).join('');
    if (answer === 'solid' && ans !== null) html += pad(String(ans)).map((ch) => `<span data-ws-ink="solid" style="font-feature-settings:'cv04' 1;font-variant-numeric:lining-nums tabular-nums">${ch === ' ' ? '' : ch}</span>`).join('');
    if (answer === 'slots' && slots) {
        // A null slot is a track with no box (the operator track, SL-12): the strip skips it.
        const live = slots.filter((s) => s !== null && s !== undefined).length;
        let k = 0;
        html += slots.map((s) => (s === null || s === undefined ? `<span class="ab"></span>`
            : `<span class="ab" data-ws-seg="${stripPos(k++, live)}">${s}</span>`)).join('');
    }
    // TY-21: any regroup scaffold forces 0.95 em tracks in both looks (the 'wide' class).
    // TY-2: a box is drawn with <i>, which the browser italicises; nothing in a stack is italic.
    html = html.replace(/(<i\b[^>]*?style=")/g, '$1font-style:normal;').replace(/<i(?=[ >])(?![^>]*style=)/g, '<i style="font-style:normal"');
    return `<div class="ws-stack${regroup ? ' wide' : ''}" style="--t:${t}" data-ws-slot="answer" data-ws-shape="open">${html}</div>`;
}

/* ------------------------------------------------------------------ registry template */

const compute = (p) => {
    const ops = p.operands || [p.a, p.b];
    const [a, b] = ops;
    switch (p.op) {
        case '+': return ops.reduce((s, n) => s + Number(n), 0);
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
    const ansLen = Math.max(ansDigitsOf(p), v !== null && v !== undefined && /^\d+$/.test(String(v)) ? String(v).length : 0);
    return Math.max(...ops.map((o) => String(o ?? '').length), ansLen) + 1;
};
/**
 * SL-12: how many digit tracks the answer strip spans. A generator passes `ansDigits`, the
 * digit count of the LARGEST answer its band can reach, so the strip is sized to the answer
 * without telling the pupil this item's answer length (L-LEAK). Absent: this answer's length.
 */
function ansDigitsOf(p) {
    if (p.ansDigits) return p.ansDigits;
    const v = p.ans !== undefined ? p.ans : compute(p);
    return v !== null && v !== undefined && /^\d+$/.test(String(v)) ? String(v).length : 0;
}
/** The operand rows above the operator row, and the operator row itself. */
const topsOf = (p) => { const ops = p.operands || [p.a, p.b]; return ops.length > 2 ? ops.slice(0, -1) : ops[0]; };
const bottomOf = (p) => { const ops = p.operands || [p.a, p.b]; return ops[ops.length - 1]; };

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
        const a = topsOf(p), b = bottomOf(p);
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
        const nAns = Math.min(t - 1, Math.max(1, ansDigitsOf(p)));
        if (screen) {
            slots = Array.from({ length: t }, (_, i) => (i < t - nAns ? null : blank(answerSlot(i, t), ctx, key)));
            answer = 'slots';
            boxInk = null;
            if (regroup) {
                regroupSlots = [];
                for (const i of regroupTracks(regroup, t, String(Array.isArray(a) ? a[0] : a).length)) regroupSlots[i] = blank(regroupSlot(i), ctx, key);
            }
        }
        const tm = touchMode(p);
        const rowsTd = tm ? touchColumns([...(Array.isArray(a) ? a : [a]), b], t, p.op, tm) : null;
        return stack(a, b, p.op, {
            T: t, heads, regroup, answer, slots, regroupSlots, unknownSlot, boxInk, ansTracks: nAns,
            touch: rowsTd ? { rows: rowsTd, o: touchOpts(ctx.metrics ? ctx.metrics.digitPt : 28, ctx.mode === 'screen' ? 'px' : 'pt') } : null,
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
        const nAns = Math.min(t - 1, Math.max(1, ansDigitsOf(p)));
        for (let i = t - nAns; i < t; i++) {
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
            + digitH * (p.operands ? Math.max(2, p.operands.length) : 2) + 3 + s.answerMm;
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
        const nAns = Math.min(t - 1, Math.max(1, ansDigitsOf(p)));
        if (regroup) for (const i of regroupTracks(regroup, t, String(a ?? '').length)) out.push(regroupSlot(i));
        if (screen) for (let i = t - nAns; i < t; i++) out.push(answerSlot(i, t));
        // On paper the answer zone under the sum rule is ONE open slot (VA-11, PG-14).
        else out.push({ id: 'answer', kind: 'number', shape: 'open', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        if (p.unknown) out.push(unknownSlotSpec(p.unknown));
        return out;
    },
    layout(p) { return { card: 'card-column', checker: 'columns', requiresVisual: true }; },
    /**
     * S5 / P-LC-9: the stack as it looks after step k of `steps` (a provider's workedSteps, or
     * the anchor's grouped steps). Place marks (`ones`, `tens`, ...) and the whole `answer` go in
     * the answer row, `regroup:<place>` in the carry box over that place; the newest marks are
     * grey, the earlier ones black. Same geometry as every other state of the cell (SCC-T10).
     */
    stepState(p, steps, k, ctx) {
        const a = topsOf(p), b = bottomOf(p);
        const { heads, regroup } = scaffoldOf(p, ctx);
        const level = ctx && ctx.scaffoldLevel !== undefined ? ctx.scaffoldLevel : 1;
        const t = tracksOf(p);
        const marks = stepMarks(steps, k);
        const trackInk = placeDigits(t, marks);
        const regroupSlots = [];
        if (regroup) {
            for (const r of regroupMarks(marks)) {
                const i = t - 1 - r.offset;
                if (i < 1 || i >= t) continue;
                const cls = r.ink === 'trace' ? 'ws-trace' : '';
                regroupSlots[i] = `<i style="display:flex;align-items:center;justify-content:center;font-size:0.62em;line-height:1"><span class="${cls}" data-ws-ink="${r.ink}">${esc(r.value)}</span></i>`;
            }
        }
        const answer = p.answer || (level >= 2 ? 'boxes' : 'steps');
        const nAns = Math.min(t - 1, Math.max(1, ansDigitsOf(p)));
        // `strike:<place>` marks cross out that top digit (VA-23); later marks keep the ink of
        // the step that made them (black once the step is past, grey on its own step).
        // `ring:<place>` marks ring that column's digits (a step that looks at them).
        const strikes = [];
        const rings = [];
        for (const m of marks) {
            const r = /^(strike|ring):(.+)$/.exec(m.slot);
            if (!r || !Object.prototype.hasOwnProperty.call(PLACE_OFFSET, r[2])) continue;
            const i = t - 1 - PLACE_OFFSET[r[2]];
            // A ring points at the column the step LOOKS at: it belongs to that step only (grey),
            // and is gone from the states after it, which would otherwise pile marks on a digit.
            if (i >= 1 && i < t && (r[1] === 'strike' || m.ink === 'trace')) (r[1] === 'strike' ? strikes : rings)[i] = m.ink;
        }
        return stack(a, b, p.op, {
            T: t, heads, regroup, answer, trackInk, ansTracks: nAns, strikes: strikes.length ? strikes : null, rings: rings.length ? rings : null,
            regroupSlots: regroup ? Array.from({ length: t }, (_, i) => regroupSlots[i] || '<i></i>') : null,
            unknown: p.unknown || null,
        });
    },
});

/** The tab step a stacked section asks for at this digit size (CL-31). */
export const stackTabStep = (digitPt) => factTab(digitPt);

/** Exported so a page can draw one answer slot in the same shape the template uses. */
export const stackAnswerSlot = (ctx, key) =>
    blank({ id: 'answer', kind: 'number', shape: 'line', digits: 4, graded: true, order: 0 }, ctx, key);
