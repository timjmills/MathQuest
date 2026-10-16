// js/modules/sheet/cells/words.js
// The `words` template: a number and its NAME (composing:number_word_form; detailed lesson 1,
// 2026-10-16). Two ways round, one per page (the generator deals the way):
//
//   to_number   the number name, bold, on one line ("three hundred five"), and under it the
//               answer line at digit size, B(4) wide: the pupil writes 305
//   to_words    the numeral at digit size, and under it one long ruled line the pupil writes the
//               words on (two lines' room is never needed under 1,000: "seven hundred seventy-seven"
//               is 27 characters)
//
// Black and white, Andika, the kit's sizes (ctx.metrics): words at text size + 4 pt, the numeral
// and the written number at digit size. The given form is never repeated inside the cell (BD-10).
// Key (AK-1): the answer in its slot.
//
// payload: {n, words, way: 'to_number'|'to_words', ans}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc, blank } from '../cell.js';

/** US number names to 1,000 (no "and", hyphenated tens) - the generator's own form. */
export function numberWords(n) {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
        'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const two = (v) => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? `-${ones[v % 10]}` : ''));
    n = Math.trunc(Number(n));
    if (n === 1000) return 'one thousand';
    if (n < 100) return two(n);
    const h = Math.floor(n / 100), r = n % 100;
    return `${ones[h]} hundred${r ? ` ${two(r)}` : ''}`;
}

const pt = (v) => `${Math.round(v * 100) / 100}pt`;
const toWords = (p) => p.way === 'to_words';
const keyOf = (p) => String(p.ans !== undefined ? p.ans : (toWords(p) ? (p.words || numberWords(p.n)) : p.n));

register('words', {
    render(p, ctx) {
        const m = ctx.metrics || {};
        const digitPt = m.digitPt || 28, textPt = m.textPt || 15;
        const key = ctx.state === 'answered' ? keyOf(p) : null;
        if (toWords(p)) {
            const line = blank({ id: 'answer', kind: 'text', shape: 'line', widthMm: ctx.size === 'S' ? 70 : ctx.size === 'M' ? 85 : 100, graded: true }, ctx, key);
            return `<div class="ws-words" data-ws-words="to_words" style="display:flex;flex-direction:column;align-items:center;gap:2mm;">`
                + `<span style="font-size:${pt(digitPt)};font-weight:700;line-height:1.1;">${esc(Number(p.n).toLocaleString('en-US'))}</span>`
                + `<span style="font-size:${pt(textPt + 4)};line-height:1.2;">${line}</span></div>`;
        }
        const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits: 4, graded: true }, ctx, key);
        return `<div class="ws-words" data-ws-words="to_number" style="display:flex;flex-direction:column;align-items:center;gap:4mm;">`
            + `<span style="font-size:${pt(textPt + 2)};font-weight:700;line-height:1.2;text-align:center;max-width:100%;text-wrap:balance;">${esc(p.words || numberWords(p.n))}</span>`
            + `<span style="font-size:${pt(digitPt)};font-weight:700;line-height:1.1;">${slot}</span></div>`;
    },
    answerKey(p) {
        const v = keyOf(p);
        return { value: v, display: v, slots: { answer: { value: v, graded: true } } };
    },
    footprint(p, ctx) {
        const words = String(p.words || numberWords(p.n));
        const textPt = (ctx && ctx.metrics && ctx.metrics.textPt) || 15;
        // (A long name wraps to two balanced lines, so a words-to-numeral cell takes two columns.)
        const wMm = toWords(p) ? 110 : Math.min(84, Math.max(60, words.length * (textPt + 2) * 0.52 * 0.3528 + 10));
        return { wMm, hMm: null, measure: true, factLike: false, maxCols: toWords(p) ? 1 : 2 };
    },
    inputs(p) { return [{ id: 'answer', kind: toWords(p) ? 'text' : 'number', shape: 'line', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-simple', checker: 'value' }; },
});

export default { numberWords };
