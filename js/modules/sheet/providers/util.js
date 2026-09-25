// js/modules/sheet/providers/util.js
// Small pure helpers shared by the skill providers (SKILL_CELL_CONTRACT.md section 3).
//
// Pure module (SCC-01): no `window`, no `state`, no DOM, no `Math.random`. Every choice a
// provider makes about ONE item is a function of that item, so the same item always gets the
// same worked steps, the same wrong answer and the same story.

import { deriveSeed } from '../rng.js';
import { INSTRUCTION_LIBRARY, instructionFor } from '../contract.js';

/* ============================================================================ numbers */

/** A finite number from a number, a numeric string or "1,234"; NaN otherwise. */
export function num(v) {
    if (typeof v === 'number') return v;
    if (v === undefined || v === null || v === '') return NaN;
    return Number(String(v).replace(/,/g, '').trim());
}

export const isNum = (v) => Number.isFinite(num(v));

/** Digits for a pupil: 1,234 from 1000 upward, plain below. */
export const fmt = (n) => (typeof n === 'number' && Math.abs(n) >= 1000 ? n.toLocaleString('en-US') : String(n));

/** An array from an array or a JSON array string; [] otherwise. */
export function arr(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim().startsWith('[')) {
        try { const out = JSON.parse(v); return Array.isArray(out) ? out : []; } catch (e) { return []; }
    }
    return [];
}

/** An object from an object or a JSON object string; null otherwise. */
export function obj(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim().startsWith('{')) {
        try { const out = JSON.parse(v); return out && typeof out === 'object' ? out : null; } catch (e) { return null; }
    }
    return null;
}

/** The two operands of a question: q.a / q.b, then q.operands, then "7 + 3" in the text. */
export function operands(q = {}) {
    if (isNum(q.a) && isNum(q.b)) return [num(q.a), num(q.b)];
    const ops = arr(q.operands).map(num);
    if (ops.length >= 2 && ops.every(Number.isFinite)) return ops;
    const m = /(\d[\d,]*)\s*[+\-−×x*÷/]\s*(\d[\d,]*)/.exec(String(q.text || ''));
    return m ? [num(m[1]), num(m[2])] : [];
}

/** "1, 2, 3, 4" - a count the pupil says, shortened past `max` items: "1, 2, 3 ... 17". */
export function countList(from, to, step = 1, max = 8) {
    const out = [];
    if (step === 0) return String(from);
    for (let v = from; step > 0 ? v <= to : v >= to; v += step) out.push(fmt(v));
    if (out.length <= max) return out.join(', ');
    return `${out.slice(0, 3).join(', ')} ... ${out[out.length - 1]}`;
}

/** Ones, tens, hundreds, ... of a whole number, ones first. */
export const digitsOf = (n) => String(Math.abs(Math.trunc(n))).split('').reverse().map(Number);

/** A stable per-item number, so one page does not show one misconception six times. */
export function itemHash(q = {}, salt = '') {
    const key = [q.skillId, q.seed, q.itemIndex, q.text, JSON.stringify(q.ans === undefined ? '' : q.ans), salt];
    let h = deriveSeed(...key.map((p) => (p === undefined || p === null ? '' : p)));
    // FNV-1a's low bits are weak (the parity barely moves), and `% 2` reads exactly those bits,
    // so finish with the murmur3 mix before anyone takes a remainder.
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}

/* ======================================================================== answers */

/** Canonical comparable form of an answer of any shape. */
export function sameAnswer(a, b) {
    const canon = (v) => {
        if (Array.isArray(v)) return JSON.stringify(v.map((x) => String(x).trim()));
        if (v && typeof v === 'object') return JSON.stringify(v);
        const s = String(v === undefined || v === null ? '' : v).trim();
        if (s.startsWith('[')) { const a2 = arr(s); if (a2.length) return JSON.stringify(a2.map((x) => String(x).trim())); }
        return s.toLowerCase().replace(/\s+/g, ' ');
    };
    return canon(a) === canon(b);
}

/** Put a value into the shape of `ans`: a number stays a number, a numeric string a string. */
export function likeAns(ans, value) {
    if (typeof ans === 'number') return num(value);
    if (typeof ans === 'string' && typeof value === 'number') return String(value);
    return value;
}

/** A plain text of any answer (arrays joined with ", "). */
export const answerText = (v) => (Array.isArray(v) ? v.map(String).join(', ') : String(v));

/**
 * The first candidate that is a REAL wrong answer (SCC-P6): defined, not the right answer, and
 * not negative. The candidates are named misconceptions in priority order; the list is rotated
 * by the item hash so a page of six items shows more than one error.
 *
 * Every returned object carries:
 *   value          wrong final answer, in the shape of q.ans
 *   display        the same value as printable text
 *   misconception  the id of the misconception
 *   slot           the slot id that holds the wrong value (the one to circle / fix)
 *   slots          {slotId: wrongValue} for every slot the error changes
 *   explain        one short sentence for the teacher key
 */
export function chooseWrong(q, candidates, { rotate = true } = {}) {
    const list = candidates.filter(Boolean);
    if (!list.length) return null;
    const start = rotate ? itemHash(q, 'wrong') % list.length : 0;
    const order = list.slice(start).concat(list.slice(0, start));
    for (const c of order) {
        const v = likeAns(q.ans, c.value);
        if (v === undefined || v === null) continue;
        if (typeof v === 'number' && (!Number.isFinite(v) || v < 0)) continue;
        if (Array.isArray(v) && v.some((x) => (typeof x === 'number' && (!Number.isFinite(x) || x < 0)))) continue;
        if (sameAnswer(v, q.ans)) continue;
        const slot = c.slot || 'answer';
        const slots = c.slots || { [slot]: answerText(v) };
        return {
            value: v,
            display: c.display || answerText(v),
            misconception: c.misconception,
            slot,
            slots,
            explain: c.explain || '',
            // The pupil's written working behind the wrong answer ("7 − 4 = 3" for a story), when
            // the candidate names it: Error analysis shows it to be checked (critic round 2).
            ...(c.work ? { work: String(c.work).replace(/\{v\}/g, answerText(v)) } : {}),
        };
    }
    return null;
}

/* ======================================================================== strings */

/**
 * A provider's `strings` member (SKILL_CELL_CONTRACT.md 3.4, extended 2026-09-25).
 *
 * The returned FUNCTION takes the reference the roles pass (`{categoryId, skillId, label}`,
 * optionally `q` = the first item) and returns:
 *   iCan            'I Can ...'
 *   instruction     the library string (placeholders filled when `ref.q` is given)
 *   instructionKey  its library key
 *   instructionVars (q) => vars for `{n}` / `{place}` placeholders (when the key has any)
 *   steps           2-4 general steps for the Steps band, right for THIS skill
 *   say / oralFrame the `Say:` frame (both names, one value): blanks `__` only, never `{unit}`
 *   sayFill         (q) -> the frame with THIS item's numbers (and unit word) in its blanks
 *   whatsNew, vocabulary, rule   when the skill has them
 */
export function strings(def) {
    const key = def.instructionKey;
    if (!(key in INSTRUCTION_LIBRARY)) throw new Error(`strings: "${key}" is not a library key`);
    const fn = (ref = {}) => {
        const q = ref && ref.q;
        let instruction = INSTRUCTION_LIBRARY[key];
        if (q && typeof def.instructionVars === 'function') {
            try { instruction = instructionFor(key, def.instructionVars(q) || {}); } catch (e) { /* keep template */ }
        }
        const out = {
            iCan: def.iCan,
            instruction,
            instructionKey: key,
            steps: def.steps.slice(),
            say: def.say,
            oralFrame: def.say,
        };
        out.sayFill = (item) => sayFill(def, item);
        if (def.instructionVars) out.instructionVars = def.instructionVars;
        if (def.whatsNew) out.whatsNew = def.whatsNew;
        if (def.vocabulary) out.vocabulary = def.vocabulary;
        if (def.rule) out.rule = def.rule;
        if (typeof def.sentence === 'function') out.sentence = def.sentence;
        if (typeof def.instructionPlural === 'function') out.instructionPlural = def.instructionPlural;
        return out;
    };
    fn.def = def;
    return fn;
}

/**
 * The `Say:` frame filled for one item. A skill's `sayValues(q)` gives the values in blank
 * order (or a whole sentence as a string); without it, a one-blank frame takes the answer and a
 * three-blank frame takes the two operands and the answer. '' when it cannot be filled.
 */
export function sayFill(def, q) {
    if (!q) return '';
    let vals = null;
    try { vals = typeof def.sayValues === 'function' ? def.sayValues(q) : null; } catch (e) { vals = null; }
    if (typeof vals === 'string') return vals;
    const blanks = (def.say.match(/__/g) || []).length;
    if (!vals) {
        const [a, b] = operands(q);
        if (blanks === 1 && q.ans !== undefined && typeof q.ans !== 'object') vals = [q.ans];
        else if (blanks === 3 && Number.isFinite(a) && Number.isFinite(b) && isNum(q.ans)) vals = [a, b, num(q.ans)];
    }
    if (!Array.isArray(vals) || vals.length !== blanks || vals.some((v) => v === undefined || v === null || v === '')) return '';
    let k = 0;
    return def.say.replace(/__/g, () => fmt(vals[k++]));
}

/** A worked step. `marks` is [{slot, value}] - what the cell shows once the step is done. */
export const step = (text, marks = []) => ({ text, marks });

/** Clamp a worked-steps list to the contract's 3-6 (SCC-P4), keeping the last (answer) step. */
export function clampSteps(list) {
    const out = list.filter((s) => s && s.text);
    if (out.length <= 6) return out;
    return out.slice(0, 5).concat(out[out.length - 1]);
}

/* ============================================================================ supports */

/**
 * S2 (design/SUPPORTS.md §S2): the supports a skill can DRAW, by family, for a skill whose
 * provider does not declare its own `supports` list. The Support control in skill-options.js
 * offers a subset of this (ws-supports-unit checks every panel against it), so a teacher is never
 * offered a support the skill cannot draw. Ids: touch dots ('touch' count on / back / by,
 * 'touchall' count all), the fact cues (support-draw.js) and the S4 panes.
 */
export const FAMILY_SUPPORTS = Object.freeze({
    addition: Object.freeze(['touch', 'touchall', 'tile', 'frame', 'line', 'boxsign', 'startarrow', 'steps']),
    subtraction: Object.freeze(['touch', 'touchall', 'tile', 'frame', 'line', 'boxsign', 'startarrow', 'steps']),
    multiplication: Object.freeze(['touch', 'skip', 'array', 'boxsign', 'startarrow', 'steps']),
    division: Object.freeze(['touch', 'skip', 'array', 'think', 'boxsign', 'steps']),
    number_sense: Object.freeze(['round-pv', 'round-mark', 'steps']),
    counting: Object.freeze(['steps']),
});

/** The supports a skill declares: its provider's own `supports`, else its family's default. */
export function declaredSupports(categoryId, provider = null) {
    if (provider && Array.isArray(provider.supports)) return provider.supports.slice();
    return (FAMILY_SUPPORTS[categoryId] || []).slice();
}
