// The answer-slot model of the + − × ÷ `ansBox` option (ansBox r3, 2026-10-31). ONE place decides, per
// template, what each value draws: which values a teacher is offered, the value a cell actually honours, the
// box count, the box size (never narrower than a digit at the question's size), where the slot sits, and the
// key's ink size. Print pupil, print key and the screen hosts all read it (LESSONS_LEARNED L18).
//
// Lead decision SL-3 (2026-10-31): an UNTOUCHED option (null) draws the OLD drawing, byte for byte - the
// ruled line / open answer row of main. So a teacher value is offered only where it draws something the old
// drawing does not, on every host:
//   stack        (kit column)    auto = the open row on paper (per-digit strip where the generator draws it), strip on
//                                screen -> One box (+ Off where Automatic is the strip)
//   legacy-stack (legacy column) auto = open row on paper, per-digit strip on screen -> One box
//                                (per digit = the screen's strip, Off = the paper's open row)
//   fact / legacy-eq / legacy-fact  auto = open zone or ruled line on paper, ONE box on screen
//                                -> One box per digit (One box = the screen's own box, Off = the paper's plain
//                                space: each would draw what Automatic draws on one host - ws-ansbox-shape f)
//   add-three, missing-number sentences (auto = one box everywhere) -> One box per digit
// A value that is not offered (an old share code) draws Automatic: effectiveAnsBox() returns null.
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

export const ANS_VALUES = ['digit', 'one', 'off'];
const OFFER = {
    stack: ['one'],
    'legacy-stack': ['one'],
    fact: ['digit'],
    'legacy-eq': ['digit'],
    'legacy-fact': ['digit'],
    'add-three': ['digit'],
};
// skills whose automatic answer place is already ONE box on paper (a missing-number sentence's box)
const ONE_BOX_AUTO = new Set(['subtraction:missing_add_sub', 'division:missing_mult_div']);
// kit columns whose generator draws the per-digit strip itself (answer: 'boxes'): their Automatic is already one box
// per digit, so 'Off' (the plain open row) is a real choice there; every other kit column's Automatic IS the open row
const STACK_BOXES_AUTO = new Set(['subtraction:sub_50_no_regroup', 'subtraction:sub_100_no_regroup', 'subtraction:sub_1k_no_regroup',
    'subtraction:sub_10k_no_regroup', 'subtraction:sub_100k_no_regroup', 'subtraction:sub_1m_no_regroup', 'addition:add_column_multi']);
// a pool whose members draw differently: no single value is honoured, so nothing is offered
const MIXED = new Set(['division:mixed_division']);

/** The teacher values offered for a skill's measured layout ('' or a 'a+b' pool = none). */
export function offeredAnsValues(layout = '', key = '') {
    const parts = String(layout || '').split('+').filter(Boolean);
    if (parts.length !== 1 || MIXED.has(key)) return [];
    const base = parts[0] === 'stack' && STACK_BOXES_AUTO.has(key) ? ['one', 'off'] : OFFER[parts[0]] || [];
    return ONE_BOX_AUTO.has(key) ? base.filter((v) => v !== 'one') : base;
}

/** The value a cell honours: the teacher's value when it is offered for this layout, else null (Automatic). */
export function effectiveAnsBox(value, layout = '', key = '') {
    return ANS_VALUES.includes(value) && offeredAnsValues(layout, key).includes(value) ? value : null;
}

/**
 * Does the option draw anything on this look? Long division keeps its vinculum and its quotient place whatever
 * the value (owner ruling SL-3 exception): on a long-division look every value draws Automatic's answer place. A
 * stacked add_three is a column that already draws one box per digit.
 */
export function ansBoxApplies(look = {}, key = '') {
    const o = look || {};
    // add_three drawn stacked is a column whose generator already draws one box per digit (its Automatic)
    if (key === 'addition:add_three' && o.notation === 'stacked') return false;
    return !(o.divForm === 'long' || o.notation === 'bracket' || o.notation === 'long');
}

/** The em width an answer slot of this value takes beside "=" (the across fact's fit, DN-22), or 0 = the old line. */
export function ansSlotEm(value, n = 2) {
    if (value === 'digit') return Math.max(1, n) * DIGIT_BOX_EM;
    if (value === 'one') return Math.max(1, n) * 0.62 + 0.8;
    return 0;
}
/** Digit-box proportions (em of the question's digit size): a box is never narrower than a digit track. */
export const DIGIT_BOX_EM = 0.82;     // Andika's tabular digit advance is about 0.58 em; the box holds it with clear sides
export const SLOT_H_EM = 1.15;        // the slot is never shorter than the printed operands
export const BOX_HW = 0.75;           // and at least 0.75 x the writing height wide (at 0.95 add_sub_10s L lost page density: ws-render-delta)
export const KEY_EM = 1;              // the key writes at the question's own digit size (AK-1)

/**
 * The geometry of one answer slot.
 * @param {string|null} value   the EFFECTIVE value (effectiveAnsBox), null = Automatic (the caller draws the old slot)
 * @param {object} m            { digits: the item's answer digits, band: the section's widest answer (SL-2),
 *                                hwMm: the size's writing height, blankMm: the size's B(n) line width }
 * @returns {null | {value, n, boxW, boxH, oneW, keyEm, place, cls}}  CSS lengths as strings
 */
export function ansSlot(value, { digits = 2, band = 0, hwMm = 8, blankMm = 0 } = {}) {
    if (!ANS_VALUES.includes(value)) return null;
    const n = Math.max(1, Number(band) || 0, Number(digits) || 0);
    // hwMm / blankMm: a number of mm (the legacy formatter) or a CSS length (a kit cell: var(--ws-hw))
    const len = (v) => (typeof v === 'number' ? `${v.toFixed(2)}mm` : String(v || '0mm'));
    const boxW = typeof hwMm === 'number' ? `max(${(hwMm * BOX_HW).toFixed(2)}mm, ${DIGIT_BOX_EM}em)` : `max(calc(${len(hwMm)} * ${BOX_HW}), ${DIGIT_BOX_EM}em)`;
    const boxH = `max(${len(hwMm)}, ${SLOT_H_EM}em)`;
    const oneW = `max(${len(blankMm)}, ${(n * 0.62 + 0.8).toFixed(2)}em)`;
    return { value, n: value === 'digit' ? n : 1, boxW, boxH, oneW, keyEm: KEY_EM, place: 'after-equals', cls: `ws-ab ws-ab--${value}` };
}
