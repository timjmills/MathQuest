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
    const html = `<div class="ws-fact" style="${factGridStyle(n, b)}"><span></span>${r(A)}<span class="op">${opGlyph(op)}</span>${r(B)}<span class="rule"></span></div>`;
    return { cls: 'fact', style: `--fd:${pt}pt;--fp:${padTop}mm`, html };
}

/** The operator track (em). Wider than a digit track so the glyph clears the tens digit. */
export const FACT_OP_TRACK_EM = 1.2;
/**
 * The operator track when the operator's own row (the second operand) leaves the first digit
 * track EMPTY: "+ _ 1 6" over three tracks. The empty track already keeps the glyph clear of
 * the operand (VA-2), so the operator needs only a digit track of its own. This is what lets a
 * 2-digit fact with a 3-digit answer band (add within 100: 99 + 99 = 198) print 5 across at L
 * and 6 at M (DN-16), where the 1.2 em track made it 1-3 mm too wide; the answer zone keeps all
 * n tracks. Only a band of 3 or more tracks takes it, so every fact of a section keeps one width
 * (the generator sends facts of at most two digits per operand, so every item of a 3-track band
 * has the empty track). A 3-digit dividend over a 1- or 2-digit divisor takes it too.
 */
export const FACT_OP_TRACK_TIGHT_EM = FACT_TRACK_EM;
/** Digit tracks of a vertical fact: operands and answer, at least 2 (TY-22 keeps 0.72 em). */
export const factDigitTracks = (a, b, n = 0) =>
    Math.max(2, String(a).length, String(b).length, Number(n) || 0);
/** The operator track (em) of a fact with `n` digit tracks whose second operand is `b`. */
export const factOpTrackEm = (n, b) =>
    (b !== undefined && b !== null && n >= 3 && String(b).length < n ? FACT_OP_TRACK_TIGHT_EM : FACT_OP_TRACK_EM);
/**
 * The inline grid a vertical fact carries: one operator track, then n digit tracks. Without `b`
 * (the screen host's older call) the operator keeps the full 1.2 em track.
 */
export const factGridStyle = (n, b) => `grid-template-columns:${factOpTrackEm(n, b)}em repeat(${n}, ${FACT_TRACK_EM}em)`;

/**
 * CL-21 / CL-30: the top padding a fact cell needs so the black number tab clears the digits.
 * Dense rows (8-10 columns) need a little more.
 */
export const factPadTop = (labelStyle, cols) => (labelStyle === 'tab' ? (cols >= 8 ? 4.5 : 3) : 2);

/**
 * TY-31: fill of column stays between 55% and 75%; 2.64 em is the drawn width of a 2-track
 * fact. With `b`, a band of 3+ tracks takes the tight operator track (factOpTrackEm).
 */
export const factWidthMm = (cols, n = 2, b) => (factOpTrackEm(n, b) + n * FACT_TRACK_EM) * (EM_MM[factDigitPt(cols)] || 9.88);
export const factFillOfColumn = (cols, liveWMm = 186) => factWidthMm(cols) / (liveWMm / cols);

/* ------------------------------------------------------------------ registry template */

/**
 * The column count this cell is drawn at, resolved ONE way for render, footprint and gridItem:
 * the payload wins, then the dialog option, then the preset's Auto (TY-30). They disagreed
 * before, so a page whose dialog chose 10 columns was laid out at the 5-column footprint.
 */
const columnsOf = (p, ctx) => p.columns || (ctx && ctx.options && ctx.options.factColumns) || FACT_AUTO_COLS[ctx && ctx.size] || FACT_AUTO_COLS.L;

/* ----------------------------------------------------------------- the across form */

/** VA-71: an across fact prints at most 4 columns. */
export const ACROSS_MAX_COLS = 4;
/** The "answer below" form's tighter operator track and gap (em). */
const ACROSS_TIGHT_OP_EM = 0.8;
const ACROSS_TIGHT_GAP_EM = 0.18;
/** The drawn height of a vertical fact (em): two operand rows, the rule, the answer zone. */
const VERT_FACT_EM = 3.6;
/** Advance of one Andika digit (em), for the width estimates below. */
const DIGIT_EM = 0.56;
/** A cell's content width at `cols` columns: the nominal width less the side pads and borders. */
const contentMm = (cols) => 186 / Math.max(1, cols) - 6.6;
const isAcross = (p) => p.notation === 'horiz' || p.notation === 'horizontal';
const explicitCols = (p, ctx) => Number(p.columns || (ctx && ctx.options && ctx.options.factColumns)) || 0;
/**
 * Is this fact drawn across? Only when its notation asks for it AND the page's column count
 * allows an across fact (VA-71: at most 4). A fact-rows page of 5 or more columns is a page of
 * vertical rows, so the same fact is drawn vertical there (VA-65 for division: the dividend
 * over the divisor, the operator in its own track). The screen twin always keeps its notation.
 */
const drawsAcross = (p, ctx) => isAcross(p) && !(ctx && ctx.mode !== 'screen' && explicitCols(p, ctx) > ACROSS_MAX_COLS);
/** Width (mm) of the across fact with its answer line beside it. */
const besideMm = (p, pt, size) => {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    const glyphs = DIGIT_EM * (String(p.a).length + String(p.b).length) + 2 * 1 + 4 * 0.28;
    return em * glyphs + blankWidth(Math.max(2, Number(p.digits) || 3), size);
};
/** Width (mm) of the across fact with its answer line stacked below (DN-22). */
const belowMm = (p, pt, size) => {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    const glyphs = DIGIT_EM * (String(p.a).length + String(p.b).length) + 2 * ACROSS_TIGHT_OP_EM + 3 * ACROSS_TIGHT_GAP_EM;
    return Math.max(em * glyphs, blankWidth(Math.max(2, Number(p.digits) || 3), size));
};
/** 'beside' when the answer fits beside the sentence at this column count, else 'below'. */
const acrossForm = (p, ctx, pt) => {
    const cols = explicitCols(p, ctx);
    if (!cols || (ctx && ctx.mode === 'screen')) return 'beside';
    return besideMm(p, pt, ctx.size) <= contentMm(cols) - 1 ? 'beside' : 'below';
};

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
    render(p, ctx) {
        const value = p.ans !== undefined ? p.ans : compute(p);
        const cols = columnsOf(p, ctx);
        const pt = p.pt || factDigitPt(cols);
        // VA-71 / the notation option: vertical rows first, then a horizontal block. An across
        // fact on a page of more than 4 columns (a fact-rows page) is drawn vertical (VA-65).
        if (drawsAcross(p, ctx)) {
            const nd = Math.max(2, Number(p.digits) || 3);
            // The key's value is written at the DIGIT size and weight, on the line, like the
            // pupil's own digits (AK-1) - never the small bold of a caption.
            const slot = blank({ id: 'ans', kind: 'number', shape: 'line', digits: nd, graded: true, order: 0, maxLength: nd, inputmode: 'numeric', scopes: ['full', 'answer-only'] }, ctx, value)
                .replace(/(<span class="ws-line[^"]*" style="[^"]*)"/, `$1;font-size:1em;font-weight:${ctx.state === 'answered' || ctx.state === 'wrong' ? 700 : 400};display:inline-flex;align-items:flex-end;justify-content:center;line-height:1.1"`);
            const o = (g, w) => `<span class="o"${w ? ` style="width:${w}em"` : ''}>${g}</span>`;
            // On paper an across fact keeps the vertical fact's height (VA-70: one fact cell
            // height whichever way it is drawn), the spare below the answer (PG-14). So the
            // same item measured across at 1 column and vertical at 5 is one height, not a
            // "collapse" (the host's reflow check), and the answer stays in the top half (CL-4).
            const hold = ctx.mode === 'screen' ? '' : `min-height:${VERT_FACT_EM}em;`;
            if (acrossForm(p, ctx, pt) === 'below') {
                // DN-22's "answer stacked below": the sentence on one line with tighter operator
                // tracks, the same answer line under it, centred. Its width is the sentence
                // alone, so "60 ÷ 12 =" fits a 3- or 4-column page where the answer beside it
                // would not (the answer line itself is unchanged: SL-12, AK-4).
                return `<div class="ws-eq ws-eq-below" style="--ws-digit:${pt}pt;${hold}flex-direction:column;align-items:center;justify-content:flex-start;gap:0.12em">`
                    + `<span style="display:flex;align-items:flex-end;gap:${ACROSS_TIGHT_GAP_EM}em;white-space:nowrap">`
                    + `<span>${p.a}</span>${o(opGlyph(p.op), ACROSS_TIGHT_OP_EM)}<span>${p.b}</span>${o('=', ACROSS_TIGHT_OP_EM)}</span>${slot}</div>`;
            }
            const eq = `<div class="ws-eq" style="--ws-digit:${pt}pt">`
                + `<span>${p.a}</span>${o(opGlyph(p.op))}<span>${p.b}</span>${o('=')}${slot}</div>`;
            return hold ? `<div class="ws-eq-hold" style="font-size:${pt}pt;${hold}">${eq}</div>` : eq;
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
        const n = factDigitTracks(p.a, p.b, p.digits || String(compute(p) ?? '').length);
        const vertW = Math.ceil(factWidthMm(cols, n, p.b) + 4);
        if (drawsAcross(p, ctx)) {
            // VA-71: a horizontal fact follows the equation fit function (DN-22), which clamps it
            // to 4 columns. It has three drawings, chosen by the column count it is drawn at:
            // the answer beside the sentence where that fits, the answer stacked below it where
            // it does not (a 3- or 4-column page), and the vertical fact on a page of 5 or more.
            // With no column count yet, the footprint is the narrowest of them (the host
            // measures each count it may choose, DN-10); with one, it is the form drawn there.
            const cAt = explicitCols(p, ctx);
            const ptA = p.pt || factDigitPt(Math.min(cAt || ACROSS_MAX_COLS, ACROSS_MAX_COLS));
            const across = Math.ceil((cAt && acrossForm(p, ctx, ptA) === 'beside' ? besideMm(p, ptA, ctx.size) : belowMm(p, ptA, ctx.size)) + 4);
            return {
                wMm: cAt ? across : Math.min(across, vertW), hMm: factCellHMm(cols, ctx.size), measure: false,
                // No `tracks`: an across fact is not stacked work, so 12.3's stacked-digit clamp
                // (which read it as a 3-track Daily stack and held a fact-rows page to 4) does
                // not apply; its vertical drawing is a fact (VA-70), never a stack.
                // It is a fact cell either way, VA-70's height (the drawing holds it, above), so
                // its height is the fact cell's with the pads inside (`factLike`).
                factLike: true, maxCols: ACROSS_MAX_COLS,
            };
        }
        return {
            wMm: vertW,
            hMm: factCellHMm(cols, ctx.size),      // VA-70
            measure: false, factLike: true, maxCols: 10, tracks: FACT_TRACKS,
        };
    },
    inputs(p, ctx) {
        // SCC-T13: the shape reported is the shape `render` draws for the same arguments. The
        // vertical fact's zone is open on paper and a digit box on screen.
        const horiz = drawsAcross(p, ctx);
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
