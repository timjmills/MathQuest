// js/modules/sheet/lesson-arch/column.js
// ARCHETYPE PLUG-IN "column" (design/LESSON_LIBRARY_PLAN.md §6): the written-algorithm archetype (A1) - the column stack, its check
// drawn as the addition it is, and the cases a column lesson declares.
// Moved verbatim from roles/lesson.js (phase 0: the sample lessons render byte-identical).
// Pure module (SCC-01).

import { operandsOf, opOf } from '../roles/compose.js';
import { resolveCtx } from '../index.js';
import { stepTemplateOf, unslot } from '../anchors.js';

/** The named cases of a column lesson. */
export const CASES = Object.freeze({
    zeroOnes: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && Number(o[0]) % 10 === 0; },
    underTen: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && opOf(it.q || {}) === 'subtract' && Number(o[0]) - Number(o[1]) < 10; },
    // Lessons r3: a one-place take-away from a number with 0 ones (70 - 8), and the 90s -> 100.
    takeAwayZero: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && Number(o[0]) % 10 === 0 && Number(o[1]) < 10; },
});

/**
 * The check of a column subtraction as its own column addition (difference + subtrahend = the
 * top number, the carries in their boxes), all its marks the newest (grey); null for any other
 * example.
 */
export function checkStackOf(example) {
    const t = stepTemplateOf(example);
    const cell = example && example.q && example.q.cell;
    if (!t || !cell || cell.template !== 'stack' || opOf(example.q || {}) !== 'subtract') return null;
    const [A, B] = operandsOf(example.q || {}).map(Number);
    if (!Number.isFinite(A) || !Number.isFinite(B) || A < B) return null;
    const D = A - B;
    const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
    const marks = [{ slot: 'answer', value: String(A) }];
    let carry = 0;
    for (let j = 0; j < String(A).length - 1; j++) {
        const dig = (v) => Math.floor(v / 10 ** j) % 10;
        carry = dig(D) + dig(B) + carry >= 10 ? 1 : 0;
        if (carry && places[j + 1]) marks.push({ slot: `regroup:${places[j + 1]}`, value: '1' });
    }
    return (c) => {
        const ctx = resolveCtx(Object.assign({}, c, { state: 'blank', scaffoldLevel: 3, metrics: undefined }));
        return unslot(t.stepState({ a: D, b: B, op: '+' }, [{ marks }], 0, Object.assign({}, ctx, { step: 0 })));
    };
}

export default { CASES, checkStackOf };
