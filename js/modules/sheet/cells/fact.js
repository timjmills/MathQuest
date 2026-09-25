// js/modules/sheet/cells/fact.js
// The vertical fact cell, and the column -> point-size ladder that drives it.
//
// Rules: VA-70 fact cell height, VA-71 both orientations, TY-22 (facts always use 0.72 em
// tracks and T = 3 in both looks - the look changes border weight only), TY-30..TY-33 the
// ladder, CL-31 tab size by EFFECTIVE digit size, CL-21 the three labelling modes.
//
// Pure module (SCC-01).

import {
    opGlyph, FACT_LADDER, factTab, factDigitPt, factCellHMm, FACT_TRACKS, FACT_TRACK_EM,
    FACT_AUTO_COLS, EM_MM, SIZES, blankWidth,
} from '../tokens.js';
import { blank } from '../cell.js';
import { register } from '../registry.js';

export { FACT_LADDER, factTab, factDigitPt, factCellHMm, FACT_AUTO_COLS };

/**
 * One vertical fact. Returns a grid item (`{cls, style, html}`) because the fact cell carries
 * its own digit size and top padding: the column count wins over the S / M / L preset (TY-30).
 *
 * @param {number|string} a
 * @param {number|string} b
 * @param {string} op
 * @param {{pt?: number, padTop?: number}} [opts]  pt from FACT_LADDER[columns]
 */
export function fact(a, b, op, { pt, padTop = 2, digits = 0 } = {}) {
    // VA-2: the operator has a track of its OWN, left of the digit tracks, so "×12", "−10" and
    // "÷12" never touch (the old cell padded both rows to 3 tracks and wrote the operator OVER
    // the first, which at 0.72 em sat flush against a tens digit). The digit tracks stay 0.72 em
    // (TY-22); their count is the widest of the two operands and the answer (VA-3: the rule spans
    // the answer too), at least 2 so a section's facts keep one width.
    const n = factDigitTracks(a, b, digits);
    const A = String(a).padStart(n, ' '), B = String(b).padStart(n, ' ');
    const r = (s) => [...s].map((ch) => `<span>${ch === ' ' ? '' : ch}</span>`).join('');
    const html = `<div class="ws-fact" style="${factGridStyle(n)}"><span></span>${r(A)}<span class="op">${opGlyph(op)}</span>${r(B)}<span class="rule"></span></div>`;
    return { cls: 'fact', style: `--fd:${pt}pt;--fp:${padTop}mm`, html };
}

/** The operator track (em). Wider than a digit track so the glyph clears the tens digit. */
export const FACT_OP_TRACK_EM = 1.2;
/** Digit tracks of a vertical fact: operands and answer, at least 2 (TY-22 keeps 0.72 em). */
export const factDigitTracks = (a, b, n = 0) =>
    Math.max(2, String(a).length, String(b).length, Number(n) || 0);
/** The inline grid a vertical fact carries: one operator track, then n digit tracks. */
export const factGridStyle = (n) => `grid-template-columns:${FACT_OP_TRACK_EM}em repeat(${n}, ${FACT_TRACK_EM}em)`;

/**
 * CL-21 / CL-30: the top padding a fact cell needs so the black number tab clears the digits.
 * Dense rows (8-10 columns) need a little more.
 */
export const factPadTop = (labelStyle, cols) => (labelStyle === 'tab' ? (cols >= 8 ? 4.5 : 3) : 2);

/** TY-31: fill of column stays between 55% and 75%; 2.16 em is the drawn width of a fact. */
export const factWidthMm = (cols, n = 2) => (FACT_OP_TRACK_EM + n * FACT_TRACK_EM) * (EM_MM[factDigitPt(cols)] || 9.88);
export const factFillOfColumn = (cols, liveWMm = 186) => factWidthMm(cols) / (liveWMm / cols);

/* ------------------------------------------------------------------ the fact cue (P11) */

/**
 * P11: the ONE hint picture a fact may carry under it (skill-options.js `support`), drawn in ink
 * on paper and on screen from the same data. It is a HINT: the fact's own rule and answer zone are
 * unchanged, and "None" (no `cue`) is the fade. Kinds:
 *   tile   dot tiles, one dot per unit (+: a tile then b; −: a with the last b crossed out)
 *   frame  ten frames (+: a solid then b open; −: a with the last b crossed out)
 *   line   a number line 0 to 20 (or to the answer's decade), the start marked
 *   skip   a skip-count strip: the first five multiples of the table number (÷: the divisor)
 *   array  a dot array, b rows of a (÷: rows of the divisor)
 *   think  the think box of a ÷ fact: b × [ ] = a
 * `px` > 0 draws it for a screen host at that many CSS px per mm; 0 is paper (mm).
 */
export function factCue(p, { px = 0 } = {}) {
    const kind = p && p.cue;
    if (!kind) return '';
    const a = Number(p.a), b = Number(p.b);
    const op = String(p.op);
    const sub = op === '-' || op === '−';
    const div = op === '/' || op === '÷';
    const INK = '#000';
    const f2 = (v) => Number(v).toFixed(2);
    const size = (w, h) => (px ? `width="${Math.round(w * px)}" height="${Math.round(h * px)}"` : `width="${f2(w)}mm" height="${f2(h)}mm"`);
    const wrap = (w, h, body, label) => `<svg class="ws-factcue-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(w)} ${f2(h)}" ${size(w, h)} `
        + `role="img" aria-label="${label}" style="display:block;margin:0 auto;max-width:100%;overflow:visible;">${body}</svg>`;
    const dot = (x, y, r, open) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" ${open ? `fill="none" stroke="${INK}" stroke-width="0.35"` : `fill="${INK}"`}/>`;
    const cross = (x, y, r) => `<path d="M${f2(x - r)} ${f2(y - r)}L${f2(x + r)} ${f2(y + r)}M${f2(x + r)} ${f2(y - r)}L${f2(x - r)} ${f2(y + r)}" stroke="${INK}" stroke-width="0.5"/>`;
    const text = (x, y, s, pt = 3.2, anchor = 'middle') => `<text x="${f2(x)}" y="${f2(y)}" font-size="${pt}" text-anchor="${anchor}" font-family="Andika, sans-serif" fill="${INK}">${s}</text>`;
    if (kind === 'tile' || kind === 'frame') {
        const frame = kind === 'frame';
        const pitch = frame ? 4.2 : 3.6, r = frame ? 1.4 : 1.2;
        // One group of n units in rows of five (a frame is two rows of five), the last `x` crossed out.
        const group = (n, ox, x = 0, open = false) => {
            const frames = frame ? Math.max(1, Math.ceil(n / 10)) : 0;
            const rows = frame ? frames * 2 : Math.max(1, Math.ceil(n / 5));
            const fy = (f) => 0.6 + f * (2 * pitch + 1.5);
            const w = 5 * pitch + 1.2, h = frame ? fy(frames - 1) + 2 * pitch + 0.6 : rows * pitch + 1.2;
            let body = '';
            if (frame) {
                for (let f = 0; f < frames; f++) {
                    const oy = fy(f);
                    body += `<rect x="${f2(ox + 0.6)}" y="${f2(oy)}" width="${f2(5 * pitch)}" height="${f2(2 * pitch)}" fill="none" stroke="${INK}" stroke-width="0.4"/>`;
                    for (let c = 1; c < 5; c++) body += `<line x1="${f2(ox + 0.6 + c * pitch)}" y1="${f2(oy)}" x2="${f2(ox + 0.6 + c * pitch)}" y2="${f2(oy + 2 * pitch)}" stroke="${INK}" stroke-width="0.2"/>`;
                    body += `<line x1="${f2(ox + 0.6)}" y1="${f2(oy + pitch)}" x2="${f2(ox + 0.6 + 5 * pitch)}" y2="${f2(oy + pitch)}" stroke="${INK}" stroke-width="0.2"/>`;
                }
            } else {
                body += `<rect x="${f2(ox + 0.3)}" y="0.3" width="${f2(w - 0.6)}" height="${f2(h - 0.6)}" rx="1.2" fill="none" stroke="${INK}" stroke-width="0.35"/>`;
            }
            for (let i = 0; i < n; i++) {
                const f = frame ? Math.floor(i / 10) : 0;
                const j = frame ? i % 10 : i;
                const cx = ox + 0.6 + (j % 5) * pitch + pitch / 2;
                const cy = (frame ? fy(f) : 0.6) + Math.floor(j / 5) * pitch + pitch / 2;
                body += dot(cx, cy, r, open);
                if (i >= n - x) body += cross(cx, cy, r + 0.6);
            }
            return { body, w, h };
        };
        if (sub) {
            const g = group(a, 0, b);
            return wrap(g.w, g.h, g.body, `${a}, ${b} crossed out`);
        }
        const g1 = group(a, 0), g2 = group(b, g1.w + 4, 0, frame);
        return wrap(g1.w + 4 + g2.w, Math.max(g1.h, g2.h), g1.body + g2.body, `${a} and ${b}`);
    }
    if (kind === 'line') {
        const top = Math.max(20, Math.ceil(Math.max(a, sub ? a : a + b) / 10) * 10);
        const pitch = Math.min(3.2, 64 / top), w = top * pitch + 6, h = 10;
        let body = `<line x1="3" y1="4" x2="${f2(3 + top * pitch)}" y2="4" stroke="${INK}" stroke-width="0.4"/>`;
        for (let v = 0; v <= top; v++) {
            const x = 3 + v * pitch;
            body += `<line x1="${f2(x)}" y1="${v % 5 ? 3 : 2.2}" x2="${f2(x)}" y2="${v % 5 ? 5 : 5.8}" stroke="${INK}" stroke-width="${v % 5 ? 0.2 : 0.35}"/>`;
            if (v % 5 === 0) body += text(x, 9.2, v, 2.8);
        }
        body += dot(3 + a * pitch, 4, 1.1, false);
        return wrap(w, h, body, `number line 0 to ${top}, start at ${a}`);
    }
    if (kind === 'skip') {
        const step = div ? b : a;
        const n = 5, bw = 8, gap = 1.2, w = n * (bw + gap) + 6, h = 7;
        let body = '';
        for (let i = 0; i < n; i++) {
            const x = i * (bw + gap);
            body += `<rect x="${f2(x + 0.2)}" y="0.2" width="${bw}" height="6" rx="1" fill="none" stroke="${INK}" stroke-width="0.35"/>`
                + text(x + 0.2 + bw / 2, 4.4, step * (i + 1));
        }
        body += text(n * (bw + gap) + 1, 4.4, '…', 3.2, 'start');
        return wrap(w, h, body, `count by ${step}`);
    }
    if (kind === 'array') {
        const cols = div ? b : a, rows = div ? (b ? a / b : 0) : b;
        if (!cols || !rows) return '';
        const pitch = Math.min(3, 36 / Math.max(cols, rows)), r = pitch * 0.32;
        let body = '';
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) body += dot(0.5 + x * pitch + pitch / 2, 0.5 + y * pitch + pitch / 2, r, false);
        return wrap(cols * pitch + 1, rows * pitch + 1, body, `${rows} rows of ${cols}`);
    }
    if (kind === 'think') {
        const w = 36, h = 9;
        const body = `<rect x="0.3" y="0.3" width="${w - 0.6}" height="${h - 0.6}" rx="1.5" fill="none" stroke="${INK}" stroke-width="0.35"/>`
            + text(3, 6, `Think: ${b} ×`, 3.6, 'start')
            + `<rect x="21.5" y="1.8" width="5.4" height="5.4" rx="0.8" fill="none" stroke="${INK}" stroke-width="0.35" stroke-dasharray="1 0.7"/>`
            + text(28.4, 6, `= ${a}`, 3.6, 'start');
        return wrap(w, h, body, `think ${b} times what is ${a}`);
    }
    return '';
}
/** Height (mm) a cue adds under the fact on paper. */
const cueHMm = (p) => {
    const m = /height="([\d.]+)mm"/.exec(factCue(p));
    return m ? Math.ceil(Number(m[1]) + 4) : 0;
};
const withCue = (html, p) => (p && p.cue ? `${html}<div class="ws-factcue" style="margin-top:3mm;">${factCue(p)}</div>` : html);

/* ------------------------------------------------------------------ registry template */

/**
 * The column count this cell is drawn at, resolved ONE way for render, footprint and gridItem:
 * the payload wins, then the dialog option, then the preset's Auto (TY-30). They disagreed
 * before, so a page whose dialog chose 10 columns was laid out at the 5-column footprint.
 */
const columnsOf = (p, ctx) => p.columns || (ctx && ctx.options && ctx.options.factColumns) || FACT_AUTO_COLS[ctx && ctx.size] || FACT_AUTO_COLS.L;

const compute = (p) => {
    switch (p.op) {
        case '+': return Number(p.a) + Number(p.b);
        case '-': case '−': return Number(p.a) - Number(p.b);
        case '*': case 'x': case '×': return Number(p.a) * Number(p.b);
        case '/': case '÷': return Number(p.b) ? Number(p.a) / Number(p.b) : null;
        default: return null;
    }
};

register('fact', {
    /** P11: the fact, then its hint cue when the payload carries one (`cue`, see factCue). */
    render(p, ctx) { return withCue(this.renderFact(p, ctx), p); },
    renderFact(p, ctx) {
        const value = p.ans !== undefined ? p.ans : compute(p);
        const cols = columnsOf(p, ctx);
        const pt = p.pt || factDigitPt(cols);
        // VA-71 / the notation option: vertical rows first, then a horizontal block.
        if (p.notation === 'horiz' || p.notation === 'horizontal') {
            const nd = Math.max(2, Number(p.digits) || 3);
            // The key's value is written at the DIGIT size and weight, on the line, like the
            // pupil's own digits (AK-1) - never the small bold of a caption.
            const slot = blank({ id: 'ans', kind: 'number', shape: 'line', digits: nd, graded: true, order: 0, maxLength: nd, inputmode: 'numeric', scopes: ['full', 'answer-only'] }, ctx, value)
                .replace(/(<span class="ws-line[^"]*" style="[^"]*)"/, `$1;font-size:1em;font-weight:${ctx.state === 'answered' || ctx.state === 'wrong' ? 700 : 400};display:inline-flex;align-items:flex-end;justify-content:center;line-height:1.1"`);
            return `<div class="ws-eq" style="--ws-digit:${pt}pt">`
                + `<span>${p.a}</span><span class="o">${opGlyph(p.op)}</span><span>${p.b}</span><span class="o">=</span>${slot}</div>`;
        }
        const n = factDigitTracks(p.a, p.b, p.digits || String(value ?? '').length);
        const item = fact(p.a, p.b, p.op, { pt, digits: n, padTop: p.padTop !== undefined ? p.padTop : factPadTop(ctx.label && ctx.label.style, cols) });
        // `fact()` returns a grid item, so the ladder's point size rides on the CELL. Through
        // the registry the template must stand alone, so the same value is inlined here.
        item.html = item.html.replace('<div class="ws-fact" style="', `<div class="ws-fact" style="--fd:${pt}pt;`);
        // SCC-T15 parity: the open answer zone is typed on screen, in the same place.
        if (ctx.mode === 'screen' && !ctx.static) {
            const slot = blank({
                id: 'ans', kind: 'number', shape: 'box', digits: n, graded: true, order: 0,
                maxLength: n, inputmode: 'numeric', scopes: ['full', 'answer-only'],
            }, ctx, this.answerKey(p));
            return item.html.replace('<span class="rule"></span>', `<span class="rule"></span><span class="ws-factans" style="grid-column:2 / -1">${slot}</span>`);
        }
        // The answer zone under the sum rule is open (PG-14: all spare height goes below the
        // rule). It is the same slot in every state (AK-4: the key and the pupil page carry the
        // same slots), and a written value sits on the digit tracks, right-aligned to the ones
        // (TY-20), so the key's digits stand under the digits of the problem.
        const ink = ctx.state === 'blank' ? null : ctx.state === 'traced' ? 'trace' : 'solid';
        const shown = ctx.state === 'wrong' ? (ctx.wrong && ctx.wrong.value) : value;
        const text = ink && shown !== undefined && shown !== null ? String(shown) : '';
        // INK-3 / LS-1: a trace digit is grey, or a dotted outline when photocopy-safe.
        const cls = ink === 'trace' ? (ctx.photocopySafe ? 'ws-factans ws-dotted' : 'ws-factans ws-trace') : 'ws-factans';
        const w = Math.max(n, text.length);
        const cells = [...text.padStart(w, ' ')].map((ch) => `<span style="text-align:center">${ch === ' ' ? '' : ch}</span>`).join('');
        return item.html.replace('<span class="rule"></span>',
            `<span class="rule"></span><span class="${cls}" data-ws-slot="ans" data-ws-shape="open"${ink ? ` data-ws-ink="${ink}"` : ''} `
            + `style="grid-column:${w > n ? 1 : 2} / -1;font-weight:${ink === 'solid' ? 700 : 400};display:grid;grid-template-columns:repeat(${w}, ${FACT_TRACK_EM}em);justify-content:end;height:1.15em;line-height:1.15">${cells}</span>`);
    },
    answerKey(p) {
        const value = p.ans !== undefined ? p.ans : compute(p);
        return { value, display: String(value), slots: { ans: { value: String(value), graded: true } } };
    },
    footprint(p, ctx) {
        const cols = columnsOf(p, ctx);
        const pt = p.pt || factDigitPt(cols);
        if (p.notation === 'horiz' || p.notation === 'horizontal') {
            // VA-71: a horizontal fact follows the equation fit function (DN-22), which in
            // practice clamps it to 4 columns. It keeps the ladder's digit size (TY-30), so it
            // is much wider than the vertical form and must say so.
            const em = EM_MM[pt] || (pt / 72) * 25.4;
            const digits = String(p.a).length + String(p.b).length;
            const wMm = em * (0.55 * digits + 2 + 0.28 * 3) + blankWidth(Math.max(2, Number(p.digits) || 3), ctx.size) + 8;
            return {
                wMm: Math.ceil(wMm), hMm: factCellHMm(cols, ctx.size) + cueHMm(p), measure: !!p.cue,
                factLike: false, maxCols: 4, tracks: FACT_TRACKS,
            };
        }
        const n = factDigitTracks(p.a, p.b, p.digits || String(compute(p) ?? '').length);
        // P11: a fact with a cue is no longer a bare fact row: it is measured, three to a row.
        if (p.cue) {
            return {
                wMm: Math.ceil(Math.max(factWidthMm(cols, n) + 4, 42)), hMm: factCellHMm(cols, ctx.size) + cueHMm(p),
                measure: true, factLike: false, maxCols: 3, tracks: FACT_TRACKS,
            };
        }
        return {
            wMm: Math.ceil(factWidthMm(cols, n) + 4),
            hMm: factCellHMm(cols, ctx.size),      // VA-70
            measure: false, factLike: true, maxCols: 10, tracks: FACT_TRACKS,
        };
    },
    inputs(p, ctx) {
        // SCC-T13: the shape reported is the shape `render` draws for the same arguments. The
        // vertical fact's zone is open on paper and a digit box on screen.
        const horiz = p.notation === 'horiz' || p.notation === 'horizontal';
        const screen = ctx && ctx.mode === 'screen' && !ctx.static;
        return [{
            id: 'ans', kind: 'number', shape: horiz ? 'line' : (screen ? 'box' : 'open'), graded: true,
            order: 0, maxLength: 3, inputmode: 'numeric', scopes: ['full', 'answer-only'],
        }];
    },
    layout() { return { card: 'card-simple', checker: 'value' }; },
    /** The cell class and custom properties a fact cell carries (TY-30 ladder, CL-30 tab clearance). */
    gridItem(p, ctx) {
        const cols = columnsOf(p, ctx);
        const pt = p.pt || factDigitPt(cols);
        return { cls: 'fact', style: `--fd:${pt}pt;--fp:${p.padTop !== undefined ? p.padTop : factPadTop(ctx.label && ctx.label.style, cols)}mm` };
    },
});

/** TY-22: fact tracks never change with the look. Exported so a lint can assert it. */
export const FACT_GEOMETRY = Object.freeze({ tracks: FACT_TRACKS, trackEm: FACT_TRACK_EM });

/** The writing height a fact row's answer zone keeps, by preset (section 3.2). */
export const factWriteMm = (size) => SIZES[size].writeMm;
