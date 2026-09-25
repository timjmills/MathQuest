// js/modules/sheet/cells/line-labels.js
// Which ticks of a number line carry a numeral: the `ticks` appearance option ("Numbers on the
// line", skill-options.js, O6 lane AP3, 2026-09-25). One rule for every line that offers the
// option - the kit's number-line template (+ / − jumps), the drag-onto-the-line widget and its
// printed twin, and the read-the-marked-integer line - so paper and screen label the same ticks.
//
//   one    every tick                       (the pupil reads or matches the numeral)
//   some   every `period`-th tick, counted from 0 (or from the left end on a line without 0),
//          and always both ends and 0       (the pupil counts at most period / 2 from a numeral)
//   ends   both ends and 0 only             (the pupil counts along the unit ticks)
//
// The ticks never move and never thin out: only their numerals do (P-1: one control, one
// change). `keep` ticks are always labelled (given information, e.g. the start of a jump);
// `hide` ticks never are (RP-1: the answer's tick on a read-the-line item), whatever the value.
//
// Pure module (SCC-01).

/** The values `ticks` takes on a labelled line (nl_mult / nl_div add 'step', their own). */
export const TICK_LABEL_VALUES = Object.freeze(['one', 'some', 'ends']);

/**
 * The indices (0 = left end, N = right end) of the ticks that carry a numeral.
 *
 * @param {number} N            the number of intervals: ticks are 0..N
 * @param {'one'|'some'|'ends'} mode
 * @param {{period?: number, zero?: number|null, origin?: number|null, keep?: number[], hide?: number[]}} [o]
 *   period  'some': label every period-th tick (default 5, or 2 on a line of 10 or fewer)
 *   zero    the index of 0 when the line has one (it is labelled under 'some' and 'ends')
 *   origin  'some': the index the period counts from (default: 0's index, else the left end), so
 *           a window 25-40 counted in 2s labels the even numbers
 * @returns {number[]} sorted, unique
 */
export function tickLabelSet(N, mode, { period = null, zero = null, origin = null, keep = [], hide = [] } = {}) {
    const n = Math.max(1, Math.round(Number(N) || 1));
    const out = new Set();
    const z = Number.isInteger(zero) && zero >= 0 && zero <= n ? zero : null;
    if (mode === 'one') {
        for (let i = 0; i <= n; i++) out.add(i);
    } else {
        out.add(0); out.add(n);
        if (z !== null) out.add(z);
        if (mode === 'some') {
            const p = Math.max(2, Math.round(Number(period) || (n <= 10 ? 2 : 5)));
            const o = Number.isInteger(origin) ? origin : z !== null ? z : 0;
            for (let i = 0; i <= n; i++) if (((i - o) % p + p) % p === 0) out.add(i);
        }
    }
    for (const k of keep) if (Number.isInteger(k) && k >= 0 && k <= n) out.add(k);
    for (const k of hide) out.delete(k);
    return Array.from(out).sort((a, b) => a - b);
}
