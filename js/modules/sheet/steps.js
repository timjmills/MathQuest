// js/modules/sheet/steps.js
// STEP STATES (P-LC-9, design/SUPPORTS.md S5): a problem drawn as it looks after step k of its
// worked steps - the marks of step k (the newest) in trace grey, every earlier mark in solid
// black ink, later marks not drawn at all.
//
// A provider's `workedSteps(q)` marks name LOGICAL slots (SKILL_CELL_CONTRACT.md 3.8): `ones`,
// `tens`, `regroup:tens`, `answer`, `q0`, `part1`, ... Each template that can draw its own step
// state exports `stepState(payload, steps, k, ctx)` (registry.js keeps extra members) and maps
// those slots onto its own geometry with the two helpers below. A template without `stepState`
// is drawn whole by the anchor (anchors.js), with the numbered text steps beside it.
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

/** Place names -> the digit offset from the ones track (ones = 0). */
export const PLACE_OFFSET = Object.freeze({
    ones: 0, tens: 1, hundreds: 2, thousands: 3, 'ten thousands': 4, 'ten-thousands': 4, 'hundred thousands': 5,
});

/** Slots that mark a WHOLE answer, written right-aligned to the ones track. */
export const WHOLE_SLOTS = new Set(['answer', 'ans', 'total', 'sum', 'difference', 'product', 'quotient']);

/**
 * The marks drawn after step `k` (0-based), in step order, each with its ink: steps before k are
 * 'solid' (black), step k is 'trace' (grey). A later mark of the same slot replaces an earlier one.
 *
 * @param {{marks?: {slot: string, value: *}[]}[]} steps
 * @param {number} k
 * @returns {{slot: string, value: string, ink: 'solid'|'trace', step: number}[]}
 */
export function stepMarks(steps, k) {
    const out = [];
    const list = Array.isArray(steps) ? steps : [];
    const last = Math.min(list.length - 1, Math.max(-1, Math.floor(Number(k))));
    for (let i = 0; i <= last; i++) {
        for (const m of (list[i] && list[i].marks) || []) {
            if (!m || m.slot === undefined || m.slot === null) continue;
            out.push({ slot: String(m.slot), value: m.value === undefined || m.value === null ? '' : String(m.value), ink: i === last ? 'trace' : 'solid', step: i });
        }
    }
    return out;
}

/**
 * Digits of an answer row of `n` tracks, from place marks (`ones`, `tens`, ...) and whole-answer
 * marks (`answer`, `ans`, ...). A value is written right-aligned so that its LAST digit sits on
 * its place's track (a "22" written for the tens fills the tens and the hundreds). A track that
 * already holds the same digit keeps its ink: the final "The sum is 224." re-marks the whole
 * answer, but only the digits it newly writes turn grey.
 *
 * @param {number} n                          tracks in the row (the operator track included)
 * @param {{slot, value, ink}[]} marks        from stepMarks
 * @param {(slot: string) => number|null} [offsetOf]  a template's own slot map
 * @returns {({ch: string, ink: string}|null)[]}
 */
export function placeDigits(n, marks, offsetOf = defaultOffset) {
    const row = Array.from({ length: n }, () => null);
    for (const m of marks) {
        const off = offsetOf(m.slot);
        if (off === null || off === undefined) continue;
        const digits = String(m.value).replace(/[^0-9]/g, '');
        const end = n - 1 - off;
        for (let j = 0; j < digits.length; j++) {
            const idx = end - (digits.length - 1 - j);
            if (idx < 0 || idx >= n) continue;
            const ch = digits[j];
            if (row[idx] && row[idx].ch === ch) continue;
            row[idx] = { ch, ink: m.ink };
        }
    }
    return row;
}

/** The default slot -> offset map of a column of digits: place names and whole answers. */
export function defaultOffset(slot) {
    if (Object.prototype.hasOwnProperty.call(PLACE_OFFSET, slot)) return PLACE_OFFSET[slot];
    if (WHOLE_SLOTS.has(slot)) return 0;
    return null;
}

/** The regroup marks (`regroup:tens` ...) as {offset, value, ink}. */
export function regroupMarks(marks) {
    const out = [];
    for (const m of marks) {
        const r = /^regroup:(.+)$/.exec(m.slot);
        if (!r || !Object.prototype.hasOwnProperty.call(PLACE_OFFSET, r[1])) continue;
        out.push({ offset: PLACE_OFFSET[r[1]], value: m.value, ink: m.ink });
    }
    return out;
}

/**
 * A template with ONE answer slot: 'blank' before the answer is marked, 'traced' on the step that
 * marks it, 'answered' (solid) after. Any whole-answer mark counts; place marks do not.
 */
export function singleSlotState(marks) {
    const hit = marks.filter((m) => WHOLE_SLOTS.has(m.slot));
    if (!hit.length) return 'blank';
    return hit[hit.length - 1].ink === 'trace' ? 'traced' : 'answered';
}

/**
 * Slot values with their ink, through a template's slot map (`map(slot) -> template slot id`,
 * null to skip). Later marks win.
 * @returns {Object<string, {value: string, ink: string}>}
 */
export function slotInks(marks, map) {
    const out = {};
    for (const m of marks) {
        const id = map(m.slot, m);
        if (id === null || id === undefined) continue;
        out[id] = { value: m.value, ink: m.ink };
    }
    return out;
}

export default { PLACE_OFFSET, WHOLE_SLOTS, stepMarks, placeDigits, defaultOffset, regroupMarks, singleSlotState, slotInks };
