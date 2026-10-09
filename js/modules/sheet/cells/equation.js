// js/modules/sheet/cells/equation.js
// Horizontal number sentences with the unknown in ANY position, and the stacked fraction.
//
// Rules: section 6 "Equation frame" (lines for numbers, circles for signs), TY-25 (horizontal
// equations keep natural digit spacing with 1 em slots for each operator and for `=`; the
// 0.95 em Daily track applies to stacked work only), TY-7 (fractions are always stacked over a
// bar - a slash fraction is a defect), DN-22 the equation fit function.
//
// Pure module (SCC-01).

import { opGlyph, DEFAULT_SIZE, blankWidth, STRETCH_CAP } from '../tokens.js';
import { esc, line, box, circle, blank } from '../cell.js';
import { register } from '../registry.js';
import { stepMarks, singleSlotState } from '../steps.js';
import { touchNumbers, touchNumberHTML, touchOpts } from '../support-draw.js';

const OP_RE = /^[+\-*x/=<>]$/;

/**
 * A horizontal equation.
 *
 * `parts` are literals plus three placeholders:
 *   '_line'   a number the pupil writes   (shape `line`)
 *   '_box'    a missing number in an expression (shape `box`)
 *   '_circle' a sign: + - x / or < = >    (shape `circle`)
 *
 * @param {Array<string|number>} parts
 * @param {'S'|'M'|'L'} [size]
 * @param {number} [digits]   digits in the longest expected answer -> B(n)
 */
export function equation(parts, size = DEFAULT_SIZE, digits = 2) {
    return `<div class="ws-eq">${parts.map((p) => p === '_line' ? line(digits, size) : p === '_box' ? box(digits, size) : p === '_circle' ? circle()
        : OP_RE.test(String(p)) ? `<span class="o">${opGlyph(p)}</span>` : `<span>${esc(p)}</span>`).join('')}</div>`;
}

/** TY-7: a fraction is always stacked over a bar, including inside story text. */
export const frac = (n, d) => `<span class="ws-frac"><span>${n}</span><span>${d}</span></span>`;

/** A mixed number: the whole part stays at working digit size (section 3.2). */
export const mixed = (whole, n, d) => `<span class="ws-mixed"><span class="ws-whole">${esc(whole)}</span>${frac(n, d)}</span>`;

/**
 * Build the parts of `a op b = c` with one position unknown.
 * @param {{a: *, b: *, op: string, result: *, unknown?: 'a'|'b'|'op'|'result'|'none'}} p
 */
export function equationParts(p) {
    const u = p.unknown || 'result';
    return [
        u === 'a' ? '_box' : p.a,
        u === 'op' ? '_circle' : p.op,
        u === 'b' ? '_box' : p.b,
        '=',
        u === 'result' ? '_line' : p.result,
    ];
}

/* ------------------------------------------------------------------ registry template */

const compute = (p) => {
    switch (p.op) {
        case '+': return Number(p.a) + Number(p.b);
        case '-': case '−': return Number(p.a) - Number(p.b);
        case '*': case 'x': case '×': return Number(p.a) * Number(p.b);
        case '/': case '÷': return Number(p.b) ? Number(p.a) / Number(p.b) : null;
        default: return null;
    }
};
const unknownValue = (p) => {
    const u = p.unknown || 'result';
    if (u === 'a') return p.a;
    if (u === 'b') return p.b;
    if (u === 'op') return opGlyph(p.op);
    return p.result !== undefined && p.result !== null ? p.result : compute(p);
};
/** A division fact's across tracks: the fact template's tight ones (cells/fact.js ACROSS_TIGHT_*). */
const ACROSS_OP_EM = 0.8;
const ACROSS_GAP_EM = 0.18;
/**
 * Width (mm) of a division fact across with its answer line beside it, for the band's WIDEST
 * fact (a dividend one digit longer than the answer band, a divisor as long as it: 144 ÷ 12),
 * so every fact of one page takes the same form.
 */
const acrossBesideMm = (p, ctx) => {
    const pt = (ctx.metrics && ctx.metrics.digitPt) || 28;
    const em = (pt / 72) * 25.4;
    const d = Math.max(1, Number(p.digits) || 2);
    const aLen = Math.max(String(p.a).length, d + 1), bLen = Math.max(String(p.b).length, d);
    return em * (0.56 * (aLen + bLen) + 2 * ACROSS_OP_EM + 4 * ACROSS_GAP_EM) + blankWidth(d, ctx.size);
};
/** The answer line under the sentence: on paper, in a column narrower than the line beside needs. */
const acrossBelow = (p, ctx) => {
    if (!ctx || ctx.mode === 'screen') return false;
    // A Mix page's across fact: always over its line, as tall as the page's bracket and fraction.
    if (p.mix) return true;
    const cols = Number(ctx.columns || (ctx.options && ctx.options.factColumns)) || 0;
    if (!cols) return false;
    return acrossBesideMm(p, ctx) > 186 / cols - 6.6 - 1;
};
const slotShape = (p) => {
    const u = p.unknown || 'result';
    return u === 'op' ? 'circle' : u === 'result' ? 'line' : 'box';
};

register('equation', {
    render(p, ctx) {
        const u = p.unknown || 'result';
        const result = p.result !== undefined && p.result !== null ? p.result : compute(p);
        const digits = p.digits || String(unknownValue(Object.assign({}, p, { result }))).replace('-', '').length || 2;
        // SCC-T15: parity. The slot the pupil writes on paper is typed on screen, same shape.
        const slotHtml = blank({
            id: 'answer', kind: u === 'op' ? 'sign' : 'number', shape: slotShape(p),
            digits, graded: true, order: 0, inputmode: u === 'op' ? 'text' : 'numeric',
            scopes: ['full', 'answer-only'],
        }, ctx, ctx.state === 'wrong' ? (ctx.wrong && ctx.wrong.value) : unknownValue(Object.assign({}, p, { result })))
            // AK-2 (critic R1 D2): a value written on the line - the key's answer, a model's trace, a
            // pupil's claimed answer - is drawn at the DIGIT size, on the line, as the fact template
            // draws it; never the small caption size of the line's own default.
            .replace(/(<span class="ws-line[^"]*" style="[^"]*)"/, `$1;font-size:1em;font-weight:${ctx.state === 'answered' || ctx.state === 'wrong' ? 700 : 400};display:inline-flex;align-items:flex-end;justify-content:center;line-height:1.1"`);
        // P11: a ÷ sentence written the way the teacher ticked (`notation`): the dividend over the
        // divisor on a fraction bar, or the divisor outside a long-division bracket. The unknown
        // keeps its slot wherever it sits.
        // S2: touch dots on the GIVEN numbers (never on the unknown or the result).
        const tn = touchNumbers(p);
        const to = touchOpts((ctx.metrics && ctx.metrics.digitPt) || 28, ctx.mode === 'screen' ? 'px' : 'pt');
        const num = (k) => (tn[k] ? touchNumberHTML(p[k], true, to) : esc(p[k]));
        const isDiv = p.op === '/' || p.op === '÷';
        if (isDiv && (p.notation === 'fraction' || p.notation === 'bracket')) {
            const A = u === 'a' ? slotHtml : `<span>${esc(p.a)}</span>`;
            const B = u === 'b' ? slotHtml : `<span>${esc(p.b)}</span>`;
            const R = u === 'result' ? slotHtml : `<span>${esc(result)}</span>`;
            const body = p.notation === 'fraction'
                // D3 (critic R1): the fraction bar is a Heavy stroke (1.5 pt, stroke table), and "=" and the
                // answer line sit on the bar's axis (align-items:center below), on paper as on screen.
                ? `<span class="ws-divfrac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;">`
                    + `<span style="border-bottom:1.5pt solid #000;padding:0 0.2em;">${A}</span><span style="padding:0 0.2em;">${B}</span></span>`
                : `${B}<span style="border-top:0.75pt solid #000;border-left:0.75pt solid #000;border-top-left-radius:0.4em;padding:0.05em 0.3em 0 0.3em;margin-left:0.15em;">${A}</span>`;
            return `<div class="ws-eq" data-ws-notation="${p.notation}"${p.notation === 'fraction' ? ' style="align-items:center"' : ''}>${body}<span class="o">=</span>${R}</div>`;
        }
        if (p.fact && u === 'result') {
            // A division FACT across (div_facts Standard, alone or in Mix, critic R2 R-2): ONE across
            // look in the kit - the fact template's tight tracks (cells/fact.js ACROSS_TIGHT_*), so
            // "30 ÷ 5 =" reads the same on an Independent page, a fact-rows page and a lesson's
            // warm-up. In a column too narrow for the answer line beside the sentence (judged on
            // the band's widest fact, so one page holds one form, AX-4) the line goes under it,
            // centred (DN-22's "answer stacked below"), never a smaller digit (PG-20).
            const o = (g) => `<span class="o" style="width:${ACROSS_OP_EM}em">${g}</span>`;
            const sentence = `<span>${num('a')}</span>${o(opGlyph(p.op))}<span>${num('b')}</span>${o('=')}`;
            if (acrossBelow(p, ctx)) {
                return `<div class="ws-eq ws-eq-below" style="flex-direction:column;align-items:center;justify-content:flex-start;gap:0.12em">`
                    + `<span style="display:flex;align-items:flex-end;gap:${ACROSS_GAP_EM}em;white-space:nowrap">${sentence}</span>${slotHtml}</div>`;
            }
            return `<div class="ws-eq" style="gap:${ACROSS_GAP_EM}em">${sentence}${slotHtml}</div>`;
        }
        const pieces = [
            u === 'a' ? slotHtml : `<span>${num('a')}</span>`,
            u === 'op' ? slotHtml : `<span class="o">${opGlyph(p.op)}</span>`,
            u === 'b' ? slotHtml : `<span>${num('b')}</span>`,
            `<span class="o">=</span>`,
            u === 'result' ? slotHtml : `<span>${esc(result)}</span>`,
        ];
        return `<div class="ws-eq">${pieces.join('')}</div>`;
    },
    answerKey(p) {
        const result = p.result !== undefined && p.result !== null ? p.result : compute(p);
        const value = unknownValue(Object.assign({}, p, { result }));
        const display = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
        return { value, display, slots: { answer: { value: String(value), graded: true, accept: [display] } } };
    },
    footprint(p, ctx) {
        const em = (ctx.metrics.digitPt / 72) * 25.4;
        const chars = String(p.a).length + String(p.b).length + String(p.result ?? compute(p)).length;
        const isDivFact = p.fact && (p.op === '/' || p.op === '÷') && (p.unknown || 'result') === 'result';
        const A = String(p.a).length, B = String(p.b).length;
        // A division fact's width is its narrowest drawn form (the cell picks the form for its
        // column, see acrossBelow): across, the sentence with the line under it; fraction, the bar
        // with "=" and the line beside it. Other sentences keep their across estimate.
        const wMm = isDivFact && p.notation === 'fraction'
            ? em * (0.56 * Math.max(A, B) + 0.4 + 2 * 0.28 + 1) + blankWidth(p.digits || 2, ctx.size) + 6
            : isDivFact && !p.notation
                ? Math.max(em * (0.56 * (A + B) + 2 * ACROSS_OP_EM + 3 * ACROSS_GAP_EM), blankWidth(p.digits || 2, ctx.size)) + 6
                : chars * em * 0.62 + 2 * em + blankWidth(p.digits || 2, ctx.size) + 6;
        return {
            // `fact` (div_facts' Fraction form): a one-line fact cell, packed like the other
            // fact forms of its page instead of measured as a visual.
            wMm: Math.ceil(wMm), hMm: Math.ceil(em * 1.15 + ctx.metrics.writeMm + 4) * (p.notation === 'fraction' ? 2 : 1), measure: p.notation === 'fraction' && !p.fact,
            factLike: !!p.fact, maxCols: 4, stretchCap: STRETCH_CAP.equation,
        };
    },
    inputs(p, ctx) {
        const u = p.unknown || 'result';
        return [{
            id: 'answer', kind: u === 'op' ? 'sign' : 'number', shape: slotShape(p), graded: true,
            order: 0, maxLength: u === 'op' ? 1 : 4, inputmode: u === 'op' ? 'text' : 'numeric',
            scopes: ['full', 'answer-only'],
        }];
    },
    layout() { return { card: 'card-simple', checker: 'value' }; },
    /** S5 / P-LC-9: one slot - blank until the step that writes it (grey), black after it. */
    stepState(p, steps, k, ctx) {
        return this.render(p, Object.assign({}, ctx, { state: singleSlotState(stepMarks(steps, k)) }));
    },
});

/**
 * DN-22 - the equation fit function. How many equation cells fit a row at this width without
 * shrinking anything (PG-20: content never shrinks to fit).
 */
export function equationColumns(sampleWMm, availableWMm = 186, maxCols = 4) {
    return Math.max(1, Math.min(maxCols, Math.floor(availableWMm / sampleWMm)));
}
