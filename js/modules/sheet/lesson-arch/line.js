// js/modules/sheet/lesson-arch/line.js
// ARCHETYPE PLUG-IN "line" (design/LESSON_LIBRARY_PLAN.md §6): the number-line archetype (A3) - rounding drawn on its number line
// (the two tens in their boxes, the dot, the arrow to the nearer ten) and its cases.
// Moved verbatim from roles/lesson.js (phase 0: the sample lessons render byte-identical).
// Pure module (SCC-01).

import { blank } from '../roles/compose.js';
import { resolveCtx, numeralTracksHTML } from '../index.js';

const PT_MM = 25.4 / 72;

/** The named cases of a rounding lesson. */
export const CASES = Object.freeze({
    roundDown: (it) => { const r = roundRest(it); return r !== null && r > 1 && r < 5; },
    // Lessons r2: the rounding Guided set and the chart's third example need the other two cases.
    roundUp: (it) => { const r = roundRest(it); return r !== null && r > 5; },
    endsFive: (it) => roundRest(it) === 5,
    toHundred: (it) => {
        const c = it && it.q && it.q.cell;
        const n = c && c.payload ? Number(c.payload.n) : NaN;
        return roundRest(it) !== null && (Number(c.payload.place) || 10) === 10 && n >= 95 && n <= 99;
    },
});

/** A rounding item's ones digit on the tenths scale of its place (0-9), or null. */
export function roundRest(it) {
    const c = it && it.q && it.q.cell;
    if (!(c && c.template === 'pv' && c.payload && c.payload.kind === 'round')) return null;
    const P = Number(c.payload.place) || 10;
    const n = Number(c.payload.n);
    if (!Number.isFinite(n)) return null;
    return Math.floor(((n % P) * 10) / P);
}

/**
 * The rounding states (the `pv` template draws no step states of its own): the numeral with its
 * cut line and answer line on top, a number line between the two tens under it.
 *   state 0  the two tens: the line's end labels            (step "27 is between 20 and 30.")
 *   state 1  the digit after the cut underlined, the dot    (step "The digit after the cut is 7 ...")
 *   state 2  the arrow from the dot to the nearer ten       (step "27 rounds to 30.")
 *   state 3  the answer written                             (step "Write 30.")
 */
export function roundState(it, k, c, lineMm) {
    const p = (it.q && it.q.cell && it.q.cell.payload) || {};
    const n = Number(p.n);
    const P = Number(p.place) || 10;
    const lo = Math.floor(n / P) * P;
    const hi = lo + P;
    const r = n - lo >= P / 2 ? hi : lo;
    const m = c.metrics;
    const ink = (s) => (k < s ? null : k === s ? 'trace' : 'solid');
    const col = (i) => (i === 'trace' ? '#949494' : '#000');
    let num = numeralTracksHTML(n, { cut: P, arrow: true, size: `${m.digitPt}pt`, underline: ink(1) ? P / 10 >= 1 ? P / 10 : 1 : 0 });
    if (ink(1) === 'trace') num = num.replace(/border-bottom:0\.08em solid #000/, 'border-bottom:0.08em solid #949494');
    const ans = ink(3);
    const slotCtx = resolveCtx({ size: c.size, look: c.look, mode: 'print', state: ans === 'trace' ? 'traced' : ans ? 'answered' : 'blank' });
    const digits = String(hi).length;
    const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: false, order: 0 }, slotCtx, ans ? { value: String(r), display: String(r) } : null);
    const top = `<div class="mq-lround-top" style="font-size:${m.digitPt}pt">${num}<span style="font-weight:700">${slot}</span></div>`;
    const labPt = Math.max(12, m.zonePt);
    const svg = roundLineSvg({ lo, hi, n, r, lineMm, labPt, tens: ink(0), dot: ink(1), arrow: ink(2) });
    return `<div class="mq-lround">${top}${svg}</div>`;
}

/**
 * The rounding number line of the chart AND of the Guided cells (lessons r1: "the chart's number
 * line reaches the Guided cells"): 11 ticks, the halfway tick taller (RL-13), a TENS BOX under
 * each end (step 1, "Find the two tens", writes the two tens in them - grey on its own step, black
 * after; empty boxes on a Guided cell), the number's dot (step 2) and the arrow to the nearer ten
 * (step 3). Inks: null (not drawn / empty), 'trace' (grey, the newest step), 'solid'.
 */
export function roundLineSvg({ lo, hi, n, r, lineMm, labPt = 14, tens = 'solid', dot = null, arrow = null, emptyTens = false, boxHmm = 0, boxDigits = 0 }) {
    const col = (i) => (i === 'trace' ? '#949494' : '#000');
    const L = lineMm;
    // Lessons r2: a box the pupil WRITES in (Guided) is as tall as the answer strip and
    // `boxDigits` digits wide; its tens are written at that box's size (the key, cell 1's trace).
    const fsz = boxHmm ? Math.max(labPt * PT_MM, boxHmm * 0.55) : labPt * PT_MM;
    const boxW = boxHmm ? Math.max(10, (boxDigits || String(hi).length) * boxHmm * 0.5 + 3) : Math.max(10, String(hi).length * fsz * 0.62 + 3.4);
    const boxH = boxHmm || fsz + 2.6;
    const pad = Math.max(7, boxW / 2 + 1);
    const w = L + pad * 2;
    const axisY = 9;
    const boxY = axisY + 5.2;
    const h = boxY + boxH + 1.5;
    const X = (v) => pad + (L * (v - lo)) / (hi - lo);
    let body = `<line x1="${pad}" y1="${axisY}" x2="${pad + L}" y2="${axisY}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
    for (let i = 0; i <= 10; i++) {
        const x = pad + (L * i) / 10;
        const half = i === 5;
        body += `<line x1="${x.toFixed(2)}" y1="${axisY - (half ? 4 : 2.4)}" x2="${x.toFixed(2)}" y2="${axisY + (half ? 4 : 2.4)}" stroke="#000" stroke-width="${((half ? 1.5 : 0.75) * PT_MM).toFixed(3)}"/>`;
    }
    // The two tens boxes: the boxes are structure (black; grey on the step that writes them in),
    // the tens inside them the step's ink; a Guided cell's boxes are empty (the pupil writes them).
    for (const [x, v] of [[pad, lo], [pad + L, hi]]) {
        const bi = emptyTens ? 'solid' : (tens || 'solid');
        body += `<rect x="${(x - boxW / 2).toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxW.toFixed(2)}" height="${boxH.toFixed(2)}" rx="1.2" fill="none" stroke="${col(bi)}" stroke-width="${((bi === 'trace' ? 1 : 0.75) * PT_MM).toFixed(3)}"${bi === 'trace' ? ' data-ws-mark="trace"' : ''}/>`;
        if (!emptyTens && tens) body += `<text x="${x.toFixed(2)}" y="${(boxY + boxH / 2 + fsz * 0.36).toFixed(2)}" text-anchor="middle" font-size="${fsz.toFixed(3)}" font-weight="700" fill="${col(tens)}" style="fill:${col(tens)}"${tens === 'trace' ? ' data-ws-ink="trace"' : ''}>${v}</text>`;
    }
    if (dot) body += `<circle cx="${X(n).toFixed(2)}" cy="${axisY}" r="1.3" fill="${col(dot)}"${dot === 'trace' ? ' data-ws-ink="trace"' : ''}/>`;
    if (arrow && r !== undefined && r !== n) {
        const x1 = X(n), x2 = X(r);
        const dir = x2 > x1 ? 1 : -1;
        const y = axisY - 5.2;
        const sw = arrow === 'trace' ? PT_MM : 1.5 * PT_MM;
        body += `<path d="M${x1.toFixed(2)} ${(axisY - 1.8).toFixed(2)} Q${((x1 + x2) / 2).toFixed(2)} ${(y - 2.4).toFixed(2)} ${(x2 - dir * 0.8).toFixed(2)} ${(axisY - 2.4).toFixed(2)}" fill="none" stroke="${col(arrow)}" stroke-width="${sw.toFixed(3)}"/>`
            + `<path d="M${(x2 - dir * 2.4).toFixed(2)} ${(axisY - 4.4).toFixed(2)} L${x2.toFixed(2)} ${(axisY - 2).toFixed(2)} L${(x2 - dir * 0.2).toFixed(2)} ${(axisY - 5).toFixed(2)} Z" fill="${col(arrow)}"/>`;
    }
    return `<svg class="mq-lround-line" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm" aria-hidden="true" style="display:block;margin:0 auto;font-family:'Andika',sans-serif">${body}</svg>`;
}

/** The height (mm) of a Guided cell's number line under its problem, at a line length. */
export const roundLineMm = (labPt = 14, boxHmm = 0) => 9 + 5.2 + (boxHmm || labPt * PT_MM + 2.6) + 1.5 + 2;

/** The side margin (mm) a rounding line needs past each end for its tens boxes. */
export const roundLinePad = (labPt = 14, boxHmm = 0, boxDigits = 0) => {
    const fsz = labPt * PT_MM;
    const boxW = boxHmm ? Math.max(10, (boxDigits || 2) * boxHmm * 0.5 + 3) : Math.max(10, 3 * fsz * 0.62 + 3.4);
    return Math.max(7, boxW / 2 + 1);
};

/** Is this a rounding item (drawn by roundState)? */
export const isRound = (it) => {
    const c = it && it.q && it.q.cell;
    return !!(c && c.template === 'pv' && c.payload && c.payload.kind === 'round' && Number.isFinite(Number(c.payload.n)));
};

/** The number line length (mm) of a rounding chart panel, by the panel variant and columns. */
export function chartLineMmOf(variant, cols, size) {
    if (variant === 'row') return 70;
    if (cols >= 3) return { S: 36, M: 38, L: 41 }[size] || 41;
    return { S: 62, M: 66, L: 70 }[size] || 70;
}

export default { CASES, roundRest, roundState, roundLineSvg, roundLineMm, roundLinePad, isRound, chartLineMmOf };
