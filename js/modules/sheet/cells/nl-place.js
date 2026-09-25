// js/modules/sheet/cells/nl-place.js
// "Mark the number on the line": ONE drawing for paper, key and screen (RP-2), the kit template
// `nl-place` of the four place-it-on-the-line skills (fraction_nl_drag, mixed_nl_drag,
// decimal_nl_drag, integer_nl_drag; O6 lane AP3 fixes, 2026-09-25). It replaces the drag widget
// that the online worksheet never mounted (an empty cell with a lone underline) and the legacy
// print cell (slash fractions at 9 pt, one item to a half page).
//
//      [ 2/8 ]                              <- the number(s) to place, boxed at the digit size;
//                                              several are lettered A, B, C
//   ←──┼────┼────┼────┼────┼────┼────┼────┼──→
//      0                        1           <- the numerals the "Numbers on the line" option
//                                              chose (labelAt); a fraction stacked (TY-7)
//
// Paper: the pupil marks a dot on the tick (and writes its letter when there are several). The key
// draws the dot on the right tick with the letter (or the number) above it (AK-1). Screen: the
// same line with a button under every tick (44 px, the track scrolls when the line is long) and
// the numbers as tiles: tap a tile, then its tick (screen-cell.js mountModel 'nl-place'). The
// answer the host grades is the numbers read back from the ticks in tile order, joined ", ",
// in each tile's own form (an improper fraction stays improper), which is what `q.ans` holds.
//
// payload (built from the item's nlData by nlPlacePayload):
//   n        the number of parts: ticks 0 .. n
//   ticks    [{i, text, major}]  every labelled tick and its numeral (text '' = unlabelled major)
//   major    tick indices drawn tall (the wholes, the fives)
//   chips    [{label, fmt, at}]   the numbers to place: their text, their form, their tick
//   vals     {fmt: [string per tick]}  each tick read back in every form a chip uses
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { register, renderCell } from '../registry.js';
import { esc } from '../cell.js';
import { INK } from '../tokens.js';
import { L, P, B, isTwin, sizeOf, digitPt, textPt, inkOf, GREY, KEY_FEATURES } from './k2kit.js';

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);
const HAIR = (0.75 * PT_MM).toFixed(3);
const LABEL_PT = { S: 10, M: 11, L: 12 };
const f2 = (v) => Number(v).toFixed(2);
const neg = (s) => String(s).replace(/^-/, '−');
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
/** An attribute value (esc leaves quotes alone; JSON carries them). */
const attr = (s) => esc(s).replace(/"/g, '&quot;');

/* ============================================================ numbers on the line */

const round6 = (v) => Math.round(v * 1e6) / 1e6;

/** A tick read in one form: 'fraction' | 'improper' | 'mixed' | 'decimal' | 'integer'. */
function readTick(i, fmt, nl) {
    const min = Number(nl.min), step = Number(nl.tickStep), den = Number(nl.denom) || 0;
    const v = round6(min + i * step);
    if (fmt === 'integer') return String(Math.round(v));
    if (fmt === 'decimal') return v.toFixed(1);
    const k = Math.round(v * den);
    if (fmt === 'fraction') return k === 0 ? '0' : k === den ? '1' : `${k}/${den}`;
    if (fmt === 'improper') return k === 0 ? '0' : `${k}/${den}`;
    const w = Math.floor(k / den), r = k - w * den;
    if (k === 0) return '0';
    if (w === 0) return `${r}/${den}`;
    return r === 0 ? String(w) : `${w} ${r}/${den}`;
}

/** The numeral under a labelled tick (the line's own form: wholes in a mixed line). */
function tickText(i, nl) {
    const mode = nl.mode || 'integer';
    if (mode === 'fraction') return readTick(i, 'fraction', nl);
    if (mode === 'mixed') return readTick(i, 'mixed', nl);
    if (mode === 'decimal') {
        const v = round6(Number(nl.min) + i * Number(nl.tickStep));
        return String(Math.round(v * 100) / 100);
    }
    return readTick(i, 'integer', nl);
}

/** The form a chip is written in (its label read back the same way). */
function chipFmt(label, mode) {
    if (mode === 'mixed') return /\s|^\d+$/.test(String(label).trim()) ? 'mixed' : 'improper';
    return mode === 'fraction' || mode === 'decimal' ? mode : 'integer';
}

/**
 * The template payload of an nl-drag item (its `nlData`): tick count, labelled ticks, the chips
 * and each tick read back in every chip's form. Returns null for data it cannot draw.
 */
export function nlPlacePayload(nl) {
    if (!nl || !(Number(nl.tickStep) > 0) || !(Number(nl.max) > Number(nl.min))) return null;
    const n = Math.round((Number(nl.max) - Number(nl.min)) / Number(nl.tickStep));
    if (!(n >= 1 && n <= 40)) return null;
    const mult = Math.max(1, Math.round(Number(nl.labelStep || nl.tickStep) / Number(nl.tickStep)));
    const labelled = Array.isArray(nl.labelAt) ? new Set(nl.labelAt.map(Number)) : null;
    const major = [];
    const ticks = [];
    for (let i = 0; i <= n; i++) {
        const isMajor = i % mult === 0;
        if (isMajor) major.push(i);
        if (labelled ? labelled.has(i) : isMajor) ticks.push({ i, text: tickText(i, nl) });
    }
    const mode = nl.mode || 'integer';
    const chips = (nl.targets || []).map((t) => {
        const at = Math.round((Number(t.value) - Number(nl.min)) / Number(nl.tickStep));
        const label = String(t.label !== undefined && t.label !== null ? t.label : readTick(at, chipFmt('', mode), nl));
        return { label, fmt: chipFmt(label, mode), at };
    });
    if (!chips.length || chips.some((c) => !(c.at >= 0 && c.at <= n))) return null;
    // RP-1: a tick a number is placed on never carries its numeral (the pupil would only match
    // "2/3" to "2/3"); the tick itself stays, so the pupil counts the parts to it.
    const hidden = new Set(chips.map((c) => c.at));
    for (let k = ticks.length - 1; k >= 0; k--) if (hidden.has(ticks[k].i)) ticks.splice(k, 1);
    const vals = {};
    for (const c of chips) {
        if (!vals[c.fmt]) vals[c.fmt] = Array.from({ length: n + 1 }, (_, i) => readTick(i, c.fmt, nl));
    }
    return { n, ticks, major, chips, vals, mode, denom: Number(nl.denom) || 0 };
}

/** What the pupil's answer reads (the host's `q.ans`): each chip's number, in chip order. */
export const nlPlaceAnswer = (p) => p.chips.map((c) => c.label).join(', ');

/* ================================================================ the drawing */

/**
 * The line's length (mm at L), so a pupil can mark it (RP-51: 6 to 8 mm a part): up to ten parts
 * 8 mm each (at most 68 mm, so the cell keeps to one of two columns), a longer line 7.5 mm a part
 * up to 150 mm. A line past 1 (0 to 3) or through 0 is long at every denominator (120 mm at
 * least), so every item of the skill takes the full width and a page never mixes half and full rows.
 */
function lineMm(n, mode) {
    if (mode === 'mixed' || mode === 'integer') return Math.min(150, Math.max(120, n * 7.5));
    return n <= 10 ? Math.max(56, Math.min(68, n * 8)) : Math.min(150, Math.max(90, n * 7.5));
}

/** A numeral in the SVG: a fraction stacked over a bar (TY-7), a whole or decimal as written. */
function svgNumeral(x, y, text, lab, weight = 400, fill = INK.ink) {
    const m = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(String(text));
    const t = (tx, ty, s, anchor = 'middle') => `<text x="${f2(tx)}" y="${f2(ty)}" text-anchor="${anchor}" font-size="${f2(lab)}" `
        + `font-weight="${weight}" font-family="Andika, sans-serif" fill="${fill}">${esc(s)}</text>`;
    if (!m) return { body: t(x, y + lab * 0.8, neg(text)), h: lab * 1.05 };
    const w = m[1] ? lab * 0.62 * m[1].length + 0.6 : 0;
    const fx = x + w / 2;
    const bw = Math.max(m[2].length, m[3].length) * lab * 0.62 + 0.8;
    let body = m[1] ? t(x - w / 2 - bw / 2 + lab * 0.25, y + lab * 1.35, m[1]) : '';
    body += t(fx, y + lab * 0.8, m[2]);
    body += `<line x1="${f2(fx - bw / 2)}" y1="${f2(y + lab * 1.02)}" x2="${f2(fx + bw / 2)}" y2="${f2(y + lab * 1.02)}" stroke="${fill}" stroke-width="${HAIR}"/>`;
    body += t(fx, y + lab * 1.02 + lab * 0.95, m[3]);
    return { body, h: lab * 2.1 };
}

/** The line: ticks, the numerals under them; on the key (or a wrong answer) the dots above. */
function lineGeom(p, size, marks) {
    const lab = (LABEL_PT[size] || LABEL_PT.L) * PT_MM;
    const len = lineMm(p.n, p.mode);
    const x0 = 8, y = 9;
    const X = (i) => x0 + (i * len) / p.n;
    const major = new Set(p.major);
    let body = `<line x1="${f2(x0 - 5)}" y1="${y}" x2="${f2(X(p.n) + 5)}" y2="${y}" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    body += `<path d="M${f2(X(p.n) + 7)} ${y} l-2.6 -1.4 v2.8 z" fill="${INK.ink}"/>`;
    body += `<path d="M${f2(x0 - 7)} ${y} l2.6 -1.4 v2.8 z" fill="${INK.ink}"/>`;
    let hLab = 0;
    for (let i = 0; i <= p.n; i++) {
        const t = major.has(i) ? 3 : 2;
        body += `<line x1="${f2(X(i))}" y1="${f2(y - t)}" x2="${f2(X(i))}" y2="${f2(y + t)}" stroke="${INK.ink}" stroke-width="${major.has(i) ? HEAVY : HAIR}" data-nlp-i="${i}"/>`;
    }
    for (const tk of p.ticks) {
        const nm = svgNumeral(X(tk.i), y + 4, tk.text, lab);
        body += nm.body;
        hLab = Math.max(hLab, nm.h);
    }
    // the key's dots (or a wrong answer's): on the tick, with the letter or the number above
    // the key's marks are their own layer (the answer slot): the dot and the letter or number
    let marksBody = '';
    for (const mk of marks) {
        const ink = mk.ink === 'trace' ? GREY : INK.ink;
        marksBody += `<circle cx="${f2(X(mk.i))}" cy="${y}" r="1.7" fill="${ink}" data-nlp-mark="${mk.i}"/>`;
        marksBody += svgNumeral(X(mk.i), y - 4.5 - (mk.text.includes('/') ? lab * 2.1 : lab * 1.05), mk.text, lab, 700, ink).body;
    }
    // the room above the line where the pupil writes (and the key shows) the letter or the number:
    // the same on the pupil page and the key, so the facsimile key lines up
    const single = p.chips.length === 1;
    const top = (single && p.chips[0].label.includes('/') ? lab * 2.1 : lab * 1.05) + 5;
    return { body, marksBody, wMm: X(p.n) + 10, hMm: y + 4 + hLab + 2, top, X, y };
}

/** The dots a state draws: the key's, a trace's, a wrong answer's (tick indices), or none. */
function marksOf(p, ctx) {
    const ink = inkOf(ctx);
    if (!ink) return [];
    const multi = p.chips.length > 1;
    let at = p.chips.map((c) => c.at);
    if (ctx.state === 'wrong' && ctx.wrong && ctx.wrong.slots && Array.isArray(ctx.wrong.slots.marks)) at = ctx.wrong.slots.marks.map(Number);
    return p.chips.map((c, k) => ({ i: at[k], text: multi ? LETTERS[k] : c.label, ink })).filter((m) => Number.isFinite(m.i));
}

/** The number(s) to place: boxed at the digit size, lettered when there are several. */
function chipsRow(p, ctx) {
    const multi = p.chips.length > 1;
    const dig = digitPt(ctx);
    const one = (c, k) => {
        const m = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(c.label);
        const num = (s) => `<span style="font-size:${P(ctx, dig)};font-weight:700;line-height:1.05;${KEY_FEATURES}">${esc(s)}</span>`;
        const inner = m
            ? `${m[1] ? num(m[1]) : ''}<span style="display:inline-flex;flex-direction:column;align-items:center;margin-left:${m[1] ? L(ctx, 1) : '0'};">`
                + `${num(m[2])}<span aria-hidden="true" style="display:block;align-self:stretch;min-width:${L(ctx, 6)};border-top:${B(ctx, 1.5)} solid ${INK.ink};margin:${L(ctx, 0.6)} 0;"></span>${num(m[3])}</span>`
            : num(neg(c.label));
        const letter = multi
            ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:${L(ctx, 8)};height:${L(ctx, 8)};border-radius:50%;`
                + `border:${B(ctx, 1)} solid ${INK.ink};font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;flex:none;">${LETTERS[k]}</span>`
            : '';
        const tile = isTwin(ctx) ? ` data-nlp-chip="${k}" role="button" tabindex="0" aria-label="${attr(c.label)}"` : '';
        return `<span class="nlp-chip"${tile} style="display:inline-flex;align-items:center;gap:${L(ctx, 2)};flex:none;">${letter}`
            + `<span class="nlp-chipbox" style="display:inline-flex;align-items:center;justify-content:center;padding:${L(ctx, 1)} ${L(ctx, 2.5)};`
            + `border:${B(ctx, 1)} solid ${INK.ink};border-radius:${L(ctx, 1.5)};background:#fff;">${inner}</span></span>`;
    };
    // a fixed grid, never a wrapping row (the page is measured once): all in one row on a
    // full-width line, two to a row in a half-width cell
    const cols = chipCols(p);
    return `<div class="nlp-chips" style="display:inline-grid;grid-template-columns:repeat(${cols}, auto);justify-content:center;justify-items:start;align-items:center;gap:${L(ctx, 3)} ${L(ctx, 6)};">`
        + `${p.chips.map(one).join('')}</div>`;
}

/** Tiles per row: every tile on a long line (0 to 3, through 0), two on a short one. */
const chipCols = (p) => (p.mode === 'mixed' || p.mode === 'integer' ? p.chips.length : Math.min(2, p.chips.length));

function render(p, ctx) {
    const size = sizeOf(ctx);
    const marks = marksOf(p, ctx);
    const g = lineGeom(p, size, marks);
    const vb = `0 ${f2(-g.top)} ${f2(g.wMm)} ${f2(g.hMm + g.top)}`;
    const ink = marks.length ? ` data-ws-ink="${marks[0].ink}"` : '';
    const svg = `<svg class="nlp-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" `
        + `aria-label="number line in ${p.n} equal parts" style="display:block;width:100%;height:auto;overflow:visible;">${g.body}</svg>`;
    // the answer slot: a layer of the same box over the line (the pupil's dots; the key's)
    const slot = `<svg class="nlp-marks" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" data-ws-slot="answer" data-ws-shape="draw"${ink} `
        + `style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;font-weight:700;">${g.marksBody}</svg>`;
    const twin = isTwin(ctx);
    // the screen reads the line back from these: the tick numerals shown, the tile forms and
    // every tick in each form (screen-cell.js mountModel 'nl-place')
    const data = twin
        ? ` data-mq-model="nl-place" data-nlp-n="${p.n}" data-nlp-labels="${attr(JSON.stringify(Object.fromEntries(p.ticks.map((t) => [t.i, t.text]))))}"`
            + ` data-nlp-major="${attr(p.major.join(','))}" data-nlp-fmt="${attr(p.chips.map((c) => c.fmt).join(','))}"`
            + ` data-nlp-vals="${attr(JSON.stringify(p.vals))}" data-nlp-chiptext="${attr(JSON.stringify(p.chips.map((c) => c.label)))}"`
        : '';
    return `<div class="k2-cell nlp-cell"${twin ? ' data-mq-k2="1"' : ''} style="color:${INK.ink};font-family:'Andika','Open Sans',sans-serif;text-align:center;">`
        + `<div class="nlp"${data} style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 5)};">`
        + `${chipsRow(p, ctx)}<div class="nlp-line" style="position:relative;display:block;width:${L(ctx, g.wMm)};max-width:100%;margin:0 auto;">${svg}${slot}</div></div></div>`;
}

/** Natural size (mm at the preset), for the layout. */
function size(p, ctx) {
    const g = lineGeom(p, sizeOf(ctx), []);
    const lineH = g.hMm + g.top;
    const dig = digitPt(ctx) * PT_MM;
    const frac = p.chips.some((c) => c.label.includes('/'));
    const chipH = (frac ? 2 * dig * 1.05 + 1.5 : dig * 1.05) + 2.5;
    // the tiles stand in a fixed grid (chipCols)
    const one = Math.max(...p.chips.map((c) => c.label.length * dig * 0.45 + 10 + (p.chips.length > 1 ? 10 : 0)));
    const perRow = chipCols(p);
    const rows = Math.ceil(p.chips.length / perRow);
    const chipW = perRow * one + (perRow - 1) * 6;
    // the key's letters or numbers above the line take the same room as the chips' gap
    return { w: Math.max(g.wMm, chipW), h: rows * chipH + (rows - 1) * 3 + 5 + lineH };
}

register('nl-place', {
    render,
    answerKey(p) {
        const value = nlPlaceAnswer(p);
        return { value, display: value, slots: { answer: { value, graded: true } } };
    },
    footprint(p, ctx) {
        const { w, h } = size(p, ctx);
        const wMm = Math.ceil(w + 8), hMm = Math.ceil(h + 8);
        // a line past 1 (a mixed number's 0 to 3) or through 0 is long at every denominator: one
        // column for all of a skill's items, so a page never mixes half and full rows
        const long = p.mode === 'mixed' || p.mode === 'integer';
        return { wMm, hMm, measure: true, factLike: false, maxCols: !long && wMm <= 88 ? 2 : 1 };
    },
    inputs() { return [{ id: 'answer', kind: 'choice', shape: 'draw', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-wide-visual', checker: 'value', requiresVisual: true }; },
});

/** The screen twin of an nl-place cell (the same drawing at the host's scale, tiles and ticks live). */
export function nlPlaceTwin(payload) {
    const html = renderCell({ cell: { template: 'nl-place', payload, v: 1 } }, { mode: 'print', size: 'L', look: 'ican', state: 'blank', options: { twin: true } });
    return `<div class="k2-twin" data-mq-template="nl-place" style="text-align:center;color:${INK.ink};">${html}</div>`;
}
