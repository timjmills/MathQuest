// js/modules/sheet/cells/panes/kit.js
// The drawing kit every SUPPORT PANE shares (design/SUPPORTS.md §S4).
//
// A support pane is a picture a teacher attaches to a problem to help a pupil who is struggling:
// a ten frame beside 7 + 5, base-ten blocks under 47 + 25, a rounding line beside "round 47". It
// is drawn in the program's own look — black and white, Andika, big, clean — and it is a HINT
// scaffold (PEDAGOGY_STANDARD 4.1, H1), never a writing place for the answer.
//
// ONE DRAWING, TWO HOSTS (RP-2). A pane is ONE SVG whose user unit is 1 mm. On paper its width is
// written in `mm`; in the SCREEN TWIN (`ctx.twin`) it is `calc(var(--mq-k2, 3.4px) * w)`, the
// same scale variable the K-2 kit uses (k2kit.js `L`), with `max-width:100%` so a twin never
// pushes a 390 px page sideways.
//
// THE NUMBER SENTENCE. Research (IES/WWC 2021 rec. 2; EEF KS2-3 rec. 2) says a concrete or
// pictorial model must be tied explicitly to the symbols, so every pane prints the matching
// number sentence over its picture — "7 + 5", never "7 + 5 = 12". `ctx.sentence === false` drops
// it (the allocator may do so when the pane sits right beside the very same sentence).
//
// ANSWER-FREE (RP-1). A pane never draws, labels or implies the answer:
//   - the pane root carries `data-ws-support="<id>"` and `data-ws-answer-free="1"`;
//   - a part that stands for the unknown (a "?" bar, the empty work row of grid paper) carries
//     `data-ws-support-part="unknown"` and holds nothing but an optional "?";
//   - numbers printed as a REFERENCE SCALE (the hundreds chart, the two multiples of a rounding
//     line) carry `data-ws-ref="1"`: they are printed evenly and never singled out, so a lint can
//     allow the answer to be one of them and forbid it everywhere else.
//
// INK (INK-1..INK-6). Ink, paper and the one grey. `ctx.ink === 'grey'` draws the pane's LINES in
// the grey at 1 pt or heavier (INK-4) for a faded Guided page; text the pupil reads stays black.
// Strokes come from the closed set {0.5, 0.75, 1, 1.5, 2.25} pt (INK-10). No dashes (LS-4).
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { SW, INK, GREY, n2, PT_MM, isTwin } from '../k2kit.js';
import { SIZES, DEFAULT_SIZE, opGlyph } from '../../tokens.js';

export { SW, INK, GREY, n2, PT_MM };

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Normalise the caller's ctx: size, host, ink, sentence. */
export function pc(ctx = {}) {
    const size = SIZES[ctx.size] ? ctx.size : DEFAULT_SIZE;
    const twin = !!(ctx.twin || isTwin(ctx));
    const grey = ctx.ink === 'grey';
    return { size, twin, grey, sentence: ctx.sentence !== false, S: SIZES[size], raw: ctx };
}

/** Pick a value by size: by(c, {S, M, L}). */
export const by = (c, t) => (t[c.size] !== undefined ? t[c.size] : t.L);

/** Line colour of the pane in this ink. */
export const lineCol = (c) => (c.grey ? GREY : INK);
/** Stroke attributes: a closed-set width, never under 1 pt when grey (INK-4). */
export function st(c, w = SW.hair) {
    const width = c.grey ? Math.max(w, SW.one) : w;
    return `stroke="${lineCol(c)}" stroke-width="${n2(width)}"`;
}
/** A solid fill (INK-5: solid shapes stay 7 mm or smaller — callers keep to that). */
export const solid = (c) => `fill="${lineCol(c)}"`;

/** mm size of a point size. */
export const mm = (pt) => pt * PT_MM;

/** Text in the SVG: Andika, 700 unless told otherwise. `ref` marks a reference-scale number. */
export function text(c, x, y, s, { pt = 12, anchor = 'middle', weight = 700, ref = false, attrs = '', fill = INK } = {}) {
    return `<text x="${n2(x)}" y="${n2(y)}" font-size="${n2(mm(pt))}" font-weight="${weight}" text-anchor="${anchor}" `
        + `fill="${fill}" font-family="Andika, sans-serif" style="font-feature-settings:'cv04' 1;"${ref ? ' data-ws-ref="1"' : ''}${attrs}>${esc(s)}</text>`;
}

/** Approximate advance width (mm) of a string in Andika at `pt` (digits 0.56 em, letters ~0.52 em). */
export const textW = (s, pt) => String(s).length * 0.55 * mm(pt);

/* ------------------------------------------------------------------ the problem, read once */

const OPS = { '+': '+', add: '+', '-': '-', '−': '-', subtract: '-', '*': '*', x: '*', '×': '*', multiply: '*', '/': '/', '÷': '/', divide: '/' };
/** The canonical operator of a payload: '+', '-', '*', '/', or '' (a single number). */
export const opOf = (p) => OPS[p && p.op] || '';
export const num = (v) => (v === undefined || v === null || v === '' ? NaN : Number(v));

/**
 * The answer a problem has, computed only so a pane can AVOID printing it (RP-50: a number line
 * leaves the answer's tick unlabelled). Never drawn.
 */
export function answerOf(p) {
    const a = num(p.a), b = num(p.b), op = opOf(p);
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b ? a / b : NaN;
    return NaN;
}

const fmt = (v) => (Number.isFinite(Number(v)) && Math.abs(Number(v)) >= 10000 ? Number(v).toLocaleString('en-US') : String(v));

/** The matching number sentence, without "=" and without the answer. */
export function sentenceOf(p) {
    if (p.sentence) return String(p.sentence);
    const op = opOf(p);
    if (op) return `${fmt(p.a)} ${opGlyph(op)} ${fmt(p.b)}`;
    if (p.n !== undefined) return fmt(p.n);
    return '';
}

/* ------------------------------------------------------------------ the pane wrapper */

/** Sentence height (mm) over the picture, 0 when off. */
export const sentenceH = (c, p) => (c.sentence && sentenceOf(p) ? mm(c.S.textPt + 3) * 1.25 + 2.5 : 0);

/**
 * Wrap a geometry `{w, h, body, label}` (mm) into the pane: the sentence line on top, then the
 * picture. Returns the HTML of the pane root.
 */
export function wrap(c, id, p, g, { scaffold = 'hint' } = {}) {
    const sh = sentenceH(c, p);
    const sent = sh ? text(c, 0, mm(c.S.textPt + 3) * 1.0, sentenceOf(p), { pt: c.S.textPt + 3, anchor: 'start', attrs: ' data-ws-sentence="1"' }) : '';
    const w = Math.max(g.w, sh ? textW(sentenceOf(p), c.S.textPt + 3) : 0);
    const h = g.h + sh;
    const M = 0.6;   // stroke margin so an outline is never clipped
    const width = c.twin ? `calc(var(--mq-k2, 3.4px) * ${n2(w + 2 * M)})` : `${n2(w + 2 * M)}mm`;
    const svg = `<svg class="ws-pane-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${n2(w + 2 * M)} ${n2(h + 2 * M)}" `
        + `role="img" aria-label="${esc(g.label || id)}" style="display:block;width:${width};height:auto;max-width:100%;overflow:visible;">`
        + `${sent}<g transform="translate(0 ${n2(sh)})">${g.body}</g></svg>`;
    return `<div class="ws-pane" data-ws-support="${esc(id)}" data-ws-answer-free="1" data-ws-scaffold="${scaffold}"`
        + `${c.grey ? ' data-ws-ink="trace"' : ''}${c.twin ? ' data-mq-pane="1"' : ''} style="display:inline-block;vertical-align:top;`
        + `color:${INK};background:#fff;font-family:'Andika',sans-serif;line-height:1;">${svg}</div>`;
}

/** The footprint of a geometry: its size in mm plus the sentence and the stroke margin. */
export function foot(c, p, g, { beside = true } = {}) {
    const sh = sentenceH(c, p);
    const w = Math.max(g.w, sh ? textW(sentenceOf(p), c.S.textPt + 3) : 0) + 1.2;
    return { wMm: Math.ceil(w * 10) / 10, hMm: Math.ceil((g.h + sh + 1.2) * 10) / 10, beside };
}

/* ------------------------------------------------------------------ shared marks */

/**
 * A take-away mark: an X through a thing of size d centred on (cx, cy). The black 1.5 pt X lies on
 * a white 2.25 pt halo, so it still reads where it crosses a solid counter (black on black
 * vanished and left only four stubs).
 */
export const cross = (c, cx, cy, d) => {
    const r = d * 0.5;
    const dd = `M${n2(cx - r)} ${n2(cy - r)}L${n2(cx + r)} ${n2(cy + r)}M${n2(cx + r)} ${n2(cy - r)}L${n2(cx - r)} ${n2(cy + r)}`;
    return `<path d="${dd}" stroke="#fff" stroke-width="${n2(SW.rule)}" stroke-linecap="round" fill="none"/>`
        + `<path d="${dd}" ${st(c, SW.heavy)} stroke-linecap="round" fill="none"/>`;
};

/** A counter: solid (set A) or hollow (set B, LS-5). */
export const counter = (c, cx, cy, d, hollow = false) => (hollow
    ? `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2 - SW.heavy / 2)}" fill="#fff" ${st(c, SW.heavy)}/>`
    : `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(Math.min(7, d) / 2)}" ${solid(c)}/>`);

/** A down arrow with a solid tip, from (x, y0) to (x, y1). */
export const downArrow = (c, x, y0, y1, head = 3.2) =>
    `<line x1="${n2(x)}" y1="${n2(y0)}" x2="${n2(x)}" y2="${n2(y1 - head * 0.8)}" ${st(c, SW.heavy)} stroke-linecap="round"/>`
    + `<path d="M${n2(x - head * 0.7)} ${n2(y1 - head)}L${n2(x + head * 0.7)} ${n2(y1 - head)}L${n2(x)} ${n2(y1)}Z" ${solid(c)}/>`;

/** A bracket over [x0, x1] at height y, opening downwards, with a centre nib. */
export const bracket = (c, x0, x1, y, h = 3) =>
    `<path d="M${n2(x0)} ${n2(y + h)}L${n2(x0)} ${n2(y)}L${n2(x1)} ${n2(y)}L${n2(x1)} ${n2(y + h)}M${n2((x0 + x1) / 2)} ${n2(y)}L${n2((x0 + x1) / 2)} ${n2(y - 1.8)}" fill="none" ${st(c, SW.hair)}/>`;

/** Lay groups side by side with `gap` mm between: [{w,h,body}] -> {w,h,body} (top-aligned). */
export function row(parts, gap = 8, { align = 'top' } = {}) {
    let x = 0, body = '';
    const h = Math.max(0, ...parts.map((g) => g.h));
    parts.forEach((g, i) => {
        const y = align === 'bottom' ? h - g.h : align === 'middle' ? (h - g.h) / 2 : 0;
        body += `<g transform="translate(${n2(x)} ${n2(y)})">${g.body}</g>`;
        x += g.w + (i < parts.length - 1 ? gap : 0);
    });
    return { w: x, h, body };
}

/** Stack groups one under another with `gap` mm between (left-aligned). */
export function col(parts, gap = 5) {
    let y = 0, body = '';
    const w = Math.max(0, ...parts.map((g) => g.w));
    parts.forEach((g, i) => {
        body += `<g transform="translate(0 ${n2(y)})">${g.body}</g>`;
        y += g.h + (i < parts.length - 1 ? gap : 0);
    });
    return { w, h: y, body };
}

/** A plus / minus glyph between two groups, centred in a `w` mm slot of height h. */
export const opMark = (c, op, h, w = 8) => ({ w, h, body: text(c, w / 2, h / 2 + mm(c.S.textPt + 3) * 0.35, opGlyph(op), { pt: c.S.textPt + 3 }) });
