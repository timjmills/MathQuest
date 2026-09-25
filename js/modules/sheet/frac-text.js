// js/modules/sheet/frac-text.js
// Running text with its fractions STACKED (TY-7: a fraction is always written over a bar, never
// with a slash), for the words a page role prints around a cell: the Steps band, a scripted
// model's steps, the key's worked lines, a story, a true-or-false statement (fractions lane,
// 2026-09-25). "Make 3/4 into 6/8." prints 3 over 4 and 6 over 8 at the size of the words
// around them; "1 3/4" prints the whole number beside its stacked fraction.
//
// escText(s) escapes like cell.js `esc` and then stacks every d/d it finds (1 to 4 digits each
// side, not part of a longer run such as a date 12/05/2026). Text without a slash comes back
// exactly as `esc` would return it, so the whole-number families are unchanged.
//
// Pure module (SCC-01).

// the same escaping as cell.js `esc` (cell.js imports this module, so it is not imported back)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const FRAC = /(^|[^\d/])(\d{1,4})\s*\/\s*(\d{1,4})(?![\d/])/g;

/** One fraction stacked inline, at the surrounding text's size. */
export function inlineFrac(n, d) {
    return `<span class="ws-ifrac" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;`
        + `line-height:1;font-size:0.9em;margin:0 0.12em;"><span>${n}</span>`
        + `<span aria-hidden="true" style="display:block;align-self:stretch;min-width:0.7em;border-top:0.09em solid #000;margin:0.08em 0;"></span>`
        + `<span>${d}</span></span>`;
}

/** Escaped text with every n/d stacked (TY-7). */
export function escText(s) {
    const e = esc(s === undefined || s === null ? '' : s);
    if (e.indexOf('/') < 0) return e;
    return e.replace(FRAC, (m, pre, n, d) => `${pre}${inlineFrac(n, d)}`);
}
