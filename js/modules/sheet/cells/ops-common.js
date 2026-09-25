// js/modules/sheet/cells/ops-common.js
// Shared geometry for the operations templates that are not a plain stack or fact: long
// division, the area model, the multiplication-chart window, arrays and equal groups, the
// number line, the fact family, the cloze bank and the remainder cell.
//
// ONE DRAWING, TWO SCALES. Every one of these templates draws in em of the DIGIT size. On paper
// the root's font size is the preset's digit size (ctx.metrics.digitPt, TY-10); on screen it is
// the host's `--mq-digit` token, so the same drawing scales to the practice card, the online
// worksheet and the quiz without a second layout (SP-1). A millimetre value from the standard
// (a 6 mm ring gap, a 4 mm dot, the answer strip height) is converted with `em(mm)` at the
// PRINT digit size, which is what makes the paper geometry exact; the screen keeps the
// proportions. Strokes are in pt and never scale (section 4.2).
//
// Slots. A printed writing place is a span carrying `data-ws-slot` / `data-ws-shape` (SCC-T9,
// what the lints and the key read). In the screen twin (ctx.mode 'screen', ctx.static) the same
// span also carries the marker screen-cell.js turns into an input: `data-mq-cell` for one of
// several answers (wireCellSlots) or `data-mq-blank="box"` for the only one (adoptVisualBlank).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { INK, SIZES, SLOT, DEFAULT_SIZE, stripPos, stripSegStyle, slotRadiusMm } from '../tokens.js';
import { esc } from '../cell.js';

export { esc };

const PT_MM = 25.4 / 72;
export const HAIR = '0.75pt';
export const HEAVY = '1.5pt';

/** The resolved geometry of one render: sizes in mm, and the em converter at the print size. */
export function geo(ctx) {
    const size = SIZES[ctx.size] ? ctx.size : DEFAULT_SIZE;
    const s = SIZES[size];
    const m = ctx.metrics || {};
    const pt = m.digitPt || s.digitPt;
    const E = pt * PT_MM;                            // mm in one em at the print digit size
    const em = (mm) => `${(mm / E).toFixed(3)}em`;
    return {
        size, s, pt, E, em,
        screen: ctx.mode === 'screen',
        twin: ctx.mode === 'screen',                  // screen output is always the static twin
        textEm: (m.textPt || s.textPt) / pt,          // text line (TY-10) relative to digits
        zoneEm: (m.zonePt || s.zonePt) / pt,          // labels inside a visual
        writeMm: s.writeMm,                           // Hw
        stripMm: SLOT.digitStripMm[size],             // SL-12 answer strip height
        carryMm: SLOT.carryStripMm[size],             // SL-12 regroup strip height
        rMm: slotRadiusMm(size),                      // SL-11 slot radius
    };
}

/**
 * The template root: Andika, black on white, the digit size as 1 em. On screen a picture (an
 * SVG) also scales down with its host's width (max-width 100%, height auto): the screen keeps
 * the drawing whole; paper never shrinks it (DN-10).
 */
export function root(g, name, inner, extra = '', wMm = 0) {
    // On screen the drawing keeps its proportions and shrinks as a whole to the viewport when
    // its minimum width would not fit (a phone): never a clipped or re-flowed model (SP-12).
    const wEm = wMm ? (wMm / g.E).toFixed(2) : 0;
    const fs = g.screen ? (wEm ? `min(var(--mq-digit, 40px), calc((100vw - 72px) / ${wEm}))` : 'var(--mq-digit, 40px)') : `${g.pt}pt`;
    return `<div class="ws-ops ws-ops-${name}" data-ws-ops="${name}" style="font-family:'Andika',sans-serif;color:${INK.ink};`
        + `font-size:${fs};line-height:1.15;font-weight:400;${extra}">${inner}</div>`;
}

/** 'trace' | 'solid' | null: the ink a written value takes in this state (INK-3). */
export const inkOf = (ctx) => (ctx.state === 'traced' ? 'trace' : ctx.state === 'answered' || ctx.state === 'wrong' ? 'solid' : null);

/**
 * The value each slot shows in this state. `key` maps slot id -> the right value; `wrongSplit`
 * turns the role's shown wrong value (a string such as "5 R 3" or "12, 9, 21") into the same
 * map, so a finished-but-wrong piece of work sits in the pupil's own slots (AK-1, SCC-T10).
 */
export function slotValues(ctx, key, wrongSplit) {
    const out = {};
    if (ctx.state === 'blank') return out;
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const split = (typeof wrongSplit === 'function' && w.value !== undefined && w.value !== null) ? (wrongSplit(String(w.value)) || {}) : {};
        for (const id of Object.keys(key)) {
            const v = w.slots && w.slots[id] !== undefined ? w.slots[id] : split[id] !== undefined ? split[id] : key[id];
            out[id] = v === undefined || v === null ? '' : String(v);
        }
        return out;
    }
    for (const id of Object.keys(key)) out[id] = key[id] === undefined || key[id] === null ? '' : String(key[id]);
    return out;
}

/** A written value inside a slot, in the ink of the state. */
export function inked(value, ink) {
    if (value === '' || value === undefined || value === null || !ink) return '';
    return ink === 'trace'
        ? `<span class="ws-trace" data-ws-ink="trace" style="color:${INK.grey}">${esc(value)}</span>`
        : `<span data-ws-ink="solid" style="color:${INK.ink};font-weight:700">${esc(value)}</span>`;   // AK-2
}

/**
 * One writing box (SL-11: slot radius, 0.75 pt). `mark` is the screen marker: 'cell' (one of
 * several answers), 'blank' (the only answer) or null (scratch space: printed, never typed).
 */
export function box(g, id, { wMm, hMm, value = '', ink = null, mark = 'cell', shape = 'box', graded = true, seg = null, extra = '', scale = 1 } = {}) {
    // `scale` writes the value smaller than the digit size (a chart cell): the box keeps its mm
    // size, because an em in a width is the element's OWN font size.
    const em = scale === 1 ? g.em : (mm) => `${(mm / (g.E * scale)).toFixed(3)}em`;
    const border = seg
        ? stripSegStyle(seg, { r: em(g.rMm), w: 0.75 })
        : `border:${HAIR} solid ${INK.ink};border-radius:${em(g.rMm)};`;
    if (scale !== 1) extra = `font-size:${scale}em;${extra}`;
    const m = g.twin && mark === 'cell' ? ' data-mq-cell="1"' : g.twin && mark === 'blank' ? ' data-mq-blank="box"' : '';
    // On screen the box receives an <input> (width 100%): a block box that clips, so the
    // input's intrinsic width can never widen one segment of a strip.
    const disp = m ? 'display:inline-block;overflow:hidden;text-align:center;' : 'display:inline-flex;align-items:center;justify-content:center;';
    return `<span data-ws-slot="${esc(id)}" data-ws-shape="${shape}"${graded ? '' : ' data-ws-graded="0"'}${m} `
        + `style="${disp}box-sizing:border-box;vertical-align:middle;`
        + `width:${em(wMm)};height:${em(hMm)};${border}background:#fff;line-height:1;${extra}">${inked(value, ink)}</span>`;
}

/**
 * SL-12: a DIGIT STRIP - one rounded outline with a divider on every track boundary, each
 * segment exactly one track wide. `values` is one string per segment ('' for empty).
 */
export function strip(g, idOf, n, { trackMm, hMm, values = [], ink = null, mark = 'cell', graded = true } = {}) {
    return Array.from({ length: n }, (_, k) => box(g, idOf(k), {
        wMm: trackMm, hMm, value: values[k] || '', ink, mark, graded, seg: stripPos(k, n),
    })).join('');
}

/** A number in the text face, the size of a zone label (never under the 8 pt floor, TY-11). */
export const label = (g, text, { bold = true, em = null } = {}) =>
    `<span style="font-size:${(em || g.zoneEm).toFixed(3)}em;font-weight:${bold ? 700 : 400};white-space:nowrap">${esc(text)}</span>`;

/** Parse "q R r" in any spacing or case. */
export function splitRemainder(v) {
    const m = String(v).match(/^\s*(\d+)\s*(?:r|rem\.?|remainder)?\s*(\d+)?\s*$/i);
    return m ? { q: m[1], r: m[2] !== undefined ? m[2] : '' } : { q: String(v), r: '' };
}

/** Parse a list "a, b, c" (commas or spaces). */
export const splitList = (v) => String(v).split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
