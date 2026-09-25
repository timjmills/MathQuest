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
        }, ctx, ctx.state === 'wrong' ? (ctx.wrong && ctx.wrong.value) : unknownValue(Object.assign({}, p, { result })));
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
                ? `<span class="ws-divfrac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;">`
                    + `<span style="border-bottom:0.75pt solid #000;padding:0 0.2em;">${A}</span><span style="padding:0 0.2em;">${B}</span></span>`
                : `${B}<span style="border-top:0.75pt solid #000;border-left:0.75pt solid #000;border-top-left-radius:0.4em;padding:0.05em 0.3em 0 0.3em;margin-left:0.15em;">${A}</span>`;
            return `<div class="ws-eq" data-ws-notation="${p.notation}">${body}<span class="o">=</span>${R}</div>`;
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
        const wMm = chars * em * 0.62 + 2 * em + blankWidth(p.digits || 2, ctx.size) + 6;
        return {
            wMm: Math.ceil(wMm), hMm: Math.ceil(em * 1.15 + ctx.metrics.writeMm + 4) * (p.notation === 'fraction' ? 2 : 1), measure: p.notation === 'fraction',
            factLike: false, maxCols: 4, stretchCap: STRETCH_CAP.equation,
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
