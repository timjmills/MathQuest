// js/modules/sheet/providers/fractions.js
// Skill providers for the fraction skills that print through the kit's `frac-model` cell (O6
// lane AP3, 2026-09-25; SKILL_CELL_CONTRACT.md section 3):
//
//   fractions:identify, fractions:write_fraction   write the fraction a model shows (or pick it)
//   fractions:shade_fraction                       shade the model to show a fraction
//   fractions:compare                              <, > or = between two models on one whole
//   fractions:equiv_frac_visual                    equivalent fractions with two models
//   fraction_operations:add_fractions_like, sub_fractions_like, and the picture skills of the
//   fraction-operations family (mixed numbers, unlike denominators, x a whole, decompose)
//
// Each reads only the item's cell payload (q.cell.payload: terms, joins, answer), which the
// generator (gen-fractions.js _fKit / _fSentenceKit) wrote, so the same item always gets the
// same worked steps and the same wrong answer. Every item of these skills is a kit item now
// (identify's "name the numerator" is the `part` task; compare's numbers-only items are `sign`
// items without pictures), except the multi-select and sort variants of the operations skills.
//
// The misconceptions are the ones the fraction research names for SPED / ELL pupils: counting
// the UNSHADED parts, writing shaded over unshaded (a part-to-part ratio), a denominator one too
// many (counting the lines, not the parts), a bigger denominator read as a bigger fraction,
// shading the rest, and adding (or subtracting) the denominators as well as the numerators.
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { strings, step, clampSteps, chooseWrong } from './util.js';

const payloadOf = (q) => (q && q.cell && q.cell.template === 'frac-model' && q.cell.payload) || null;
const fr = (n, d) => `${n}/${d}`;
const mixedText = (w, n, d) => (w ? `${w}${n ? ` ${n}/${d}` : ''}` : `${n}/${d}`);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lineModel = (t) => t && t.kind === 'line';

/* ========================================================= the Stretch page's open task */

/**
 * `open(q, {rows})`: the open task of the Stretch page (roles/stretch.js). A fraction item has no
 * whole-number pairs to hunt for, so the pupil hunts for FRACTIONS: the ones equal to the item's
 * fraction (bigger denominators, top and bottom multiplied by the same number), or, for a sum of
 * two fractions with one denominator, other pairs that make the same sum. Every row of the key is
 * a right answer and there are always more, so "There are more." is the true box.
 */
function fracOpen(q, { rows = 6 } = {}) {
    const p = payloadOf(q);
    if (!p) return null;
    let base = null;
    if (p.task === 'shade' || p.task === 'pick') base = p.show;
    else if (p.task === 'write' || p.task === 'part' || p.task === 'sign') base = p.terms[0];
    else if (p.task === 'op') {
        const s = sentenceOf(q);
        const a = p.answer || {};
        if (s && s.terms.length === 2 && s.ops[0] === '+' && !s.terms[0].w && !s.terms[1].w && s.terms[0].d === s.terms[1].d && !a.w && a.n) {
            // pairs of fractions with the item's denominator that add to the same total
            const d = s.terms[0].d, tot = s.terms[0].n + s.terms[1].n;
            if (tot >= 4) {
                const keyRows = [];
                for (let x = tot - 1; x >= 1 && keyRows.length < rows; x--) {
                    if (x === s.terms[0].n || x === 1) continue;
                    keyRows.push([fr(x, d), fr(tot - x, d), fr(tot, d)]);
                }
                if (keyRows.length >= 3) {
                    return { prompt: [`Two fractions add to ${fr(tot, d)}.`, 'Find different pairs.'], columns: ['First fraction', 'Second fraction', 'Check: total'],
                        example: [fr(1, d), fr(tot - 1, d), fr(tot, d)], keyRows, total: Infinity };
                }
            }
        }
        base = a.n && !a.w ? { n: a.n, d: a.d } : null;
    }
    if (!base || !(Number(base.n) > 0) || !(Number(base.d) > 1)) return null;
    const g = gcd(Number(base.n), Number(base.d));
    const n = base.n / g, d = base.d / g;
    const keyRows = [];
    for (let k = 3; keyRows.length < rows && k <= 12; k++) if (!(n * k === base.n && d * k === base.d)) keyRows.push([n * k, d * k, `× ${k}`]);
    return {
        prompt: [`Find fractions equal to ${fr(n, d)}.`, 'Multiply the top and the bottom by the same number.'],
        columns: ['Numerator', 'Denominator', 'Multiplied by'],
        example: [n * 2, d * 2, '× 2'],
        keyRows, total: Infinity,
    };
}

/** Stretch: fractions equal to n/d (a whole number too: 1 = 2/2 = 3/3 ...). */
function equivOpen(n0, d0, rows = 6) {
    if (!(n0 > 0) || !(d0 > 0)) return null;
    const g = gcd(n0, d0);
    const n = n0 / g, d = d0 / g;
    const keyRows = [];
    for (let k = 3; keyRows.length < rows && k <= 12; k++) if (!(n * k === n0 && d * k === d0)) keyRows.push([n * k, d * k, `× ${k}`]);
    return {
        prompt: [`Find fractions equal to ${d === 1 ? n : fr(n, d)}.`, 'Multiply the top and the bottom by the same number.'],
        columns: ['Numerator', 'Denominator', 'Multiplied by'],
        example: [n * 2, d * 2, '× 2'], keyRows, total: Infinity,
    };
}

/** Stretch: other ways to make the item's fraction from two fractions with its denominator (4.NF.B.3b "in more than one way"). */
function decomposeOpen(q, { rows = 6 } = {}) {
    const p = payloadOf(q);
    if (!p || !p.terms || !p.terms[0]) return null;
    const { n, d } = p.terms[0];
    const tot = d >= 5 ? Math.min(d, Math.max(n, 5)) : (n >= 5 ? n : null);
    // a small fraction (2/3, 3/4, 2/2): its equal fractions instead (1 = 2/2 = 3/3 ...)
    if (!tot) return equivOpen(n, d, rows);
    const keyRows = [];
    for (let x = tot - 2; x >= 1 && keyRows.length < rows; x--) keyRows.push([fr(x, d), fr(tot - x, d), fr(tot, d)]);
    if (keyRows.length < 3) return equivOpen(n, d, rows);
    return { prompt: [`Make ${fr(tot, d)} from two fractions.`, 'Find different ways.'], columns: ['First fraction', 'Second fraction', 'Check: total'],
        example: [fr(tot - 1, d), fr(1, d), fr(tot, d)], keyRows, total: tot - 1 };
}

/** Stretch: other shares that give each person the same amount (a ÷ b = ka ÷ kb). */
function shareOpen(q, { rows = 6 } = {}) {
    const p = payloadOf(q);
    if (!p || !p.terms || p.terms.length < 2) return null;
    const a = Number(p.terms[0].w), b = Number(p.terms[1].w);
    if (!(a > 0) || !(b > 1)) return null;
    const keyRows = [];
    for (let k = 3; keyRows.length < rows && k <= 12; k++) keyRows.push([a * k, b * k, fr(a, b)]);
    return { prompt: [`${a} shared by ${b} gives each ${fr(a, b)}.`, 'Find other shares that give each the same.'],
        columns: ['Wholes', 'Shared by', 'Each gets'], example: [a * 2, b * 2, fr(a, b)], keyRows, total: Infinity };
}

/** Stretch: fractions that make the product of the item's whole less than, more than or equal to it. */
function scalingOpen(q, { rows = 6 } = {}) {
    const p = payloadOf(q);
    if (!p || !p.terms || p.terms.length < 2) return null;
    const { n, d } = p.terms[0];
    const w = Number(p.terms[1].w);
    const s = n < d ? '<' : n > d ? '>' : '=';
    const xs = [];
    if (s === '<') for (let x = 1; x < d; x++) { if (x !== n) xs.push([x, d]); }
    else if (s === '>') for (let x = d + 1; x <= 3 * d; x++) { if (x !== n) xs.push([x, d]); }
    else for (let k = 2; k <= 8; k++) xs.push([k, k]);
    const keyRows = xs.slice(0, rows).map(([x, y]) => [fr(x, y), `${fr(x, y)} × ${w} ${s} ${w}`]);
    if (keyRows.length < 3) return null;
    const word = { '<': 'less than', '>': 'more than', '=': 'equal to' }[s];
    return { prompt: [`${fr(n, d)} × ${w} is ${word} ${w}.`, `Find other fractions that make the answer ${word} ${w}.`],
        columns: ['Fraction', 'Check'], example: [fr(n, d), `${fr(n, d)} × ${w} ${s} ${w}`], keyRows, total: s === '<' ? d - 1 : Infinity };
}

/** Stretch: other fractions bigger than 1 with the item's denominator, each as a mixed number. */
function mixedOpen(q, { rows = 6 } = {}) {
    const p = payloadOf(q);
    if (!p || !p.terms || !p.terms[0]) return null;
    const g = p.terms[0];
    const d = Number(g.d);
    if (!(d > 1)) return null;
    const own = Number(g.w || 0) * d + Number(g.n || 0);
    const keyRows = [];
    for (let x = d + 1; keyRows.length < rows && x <= 4 * d; x++) {
        if (x === own || x % d === 0) continue;
        keyRows.push([fr(x, d), mixedText(Math.floor(x / d), x % d, d)]);
    }
    if (keyRows.length < 3) return null;
    return { prompt: [`Find fractions bigger than 1 with ${d} as the denominator.`, 'Write each one as a mixed number.'],
        columns: ['Improper fraction', 'Mixed number'], example: [fr(own, d), mixedText(Math.floor(own / d), own % d, d)], keyRows, total: Infinity };
}

/* ================================================================ write the fraction shown */

function writeSteps(q) {
    const p = payloadOf(q);
    if (!p || p.task !== 'write') return [];
    const t = p.terms[0];
    if (lineModel(t)) {
        return clampSteps([
            step(`Count the equal parts from 0 to 1: ${t.d}. That is the denominator.`, [{ slot: 'd', value: String(t.d) }]),
            step(`Count the parts from 0 to the dot: ${t.n}. That is the numerator.`, [{ slot: 'n', value: String(t.n) }]),
            step(`Write ${fr(t.n, t.d)}.`, [{ slot: 'n', value: String(t.n) }, { slot: 'd', value: String(t.d) }]),
        ]);
    }
    return clampSteps([
        step(`Count all the equal parts: ${t.d}. That is the denominator.`, [{ slot: 'd', value: String(t.d) }]),
        step(`Count the shaded parts: ${t.n}. That is the numerator.`, [{ slot: 'n', value: String(t.n) }]),
        step(`Write ${fr(t.n, t.d)}: ${t.n} of ${t.d} equal parts.`, [{ slot: 'n', value: String(t.n) }, { slot: 'd', value: String(t.d) }]),
    ]);
}

function writeWrong(q) {
    const p = payloadOf(q);
    if (!p) return null;
    if (p.task === 'pick') {
        const right = String(p.answer.letter);
        const other = p.terms.find((t) => t.letter !== right && t.d === p.show.d) || p.terms.find((t) => t.letter !== right);
        return other ? chooseWrong(q, [{ value: other.letter, misconception: 'counted-parts-only', slot: 'answer', slots: { answer: other.letter },
            explain: `Picked ${other.letter}: ${fr(other.n, other.d)}, not ${fr(p.show.n, p.show.d)}. Count the shaded parts AND all the parts.` }], { rotate: false }) : null;
    }
    if (p.task !== 'write') return null;
    const t = p.terms[0];
    const c = [];
    if (t.d - t.n > 0) c.push({ value: fr(t.d - t.n, t.d), misconception: 'counted-unshaded', slot: 'n', slots: { n: String(t.d - t.n), d: String(t.d) },
        explain: `Counted the parts that are NOT ${lineModel(t) ? 'before the dot' : 'shaded'}: ${t.d - t.n}, not ${t.n}.` });
    if (t.d - t.n > 1 && !lineModel(t)) c.push({ value: fr(t.n, t.d - t.n), misconception: 'part-over-part', slot: 'd', slots: { n: String(t.n), d: String(t.d - t.n) },
        explain: `Wrote shaded over unshaded (${t.n} and ${t.d - t.n}). The denominator is ALL the parts: ${t.d}.` });
    if (lineModel(t)) c.push({ value: fr(t.n, t.d + 1), misconception: 'counted-ticks', slot: 'd', slots: { n: String(t.n), d: String(t.d + 1) },
        explain: `Counted the tick marks (${t.d + 1}), not the spaces between them (${t.d}).` });
    return chooseWrong(q, c);
}

const WRITE_DEF = {
    iCan: 'I Can write the fraction a model shows',
    instructionKey: 'write-fraction',
    steps: ['Count all the equal parts. That is the denominator.', 'Count the shaded parts. That is the numerator.', 'Write the numerator over the denominator.'],
    say: '__ out of __ equal parts are shaded.',
    sayValues: (q) => { const p = payloadOf(q); return p && p.task === 'write' ? [p.terms[0].n, p.terms[0].d] : null; },
    vocabulary: ['numerator', 'denominator', 'equal parts'],
};

registerSkill('fractions:write_fraction', {
    open: fracOpen,
    strings: strings(WRITE_DEF),
    misconceptions: ['counted-unshaded', 'part-over-part', 'counted-ticks'],
    workedSteps: writeSteps,
    wrongAnswer: writeWrong,
});

registerSkill('fractions:identify', {
    open: fracOpen,
    strings: strings(Object.assign({}, WRITE_DEF, {
        iCan: 'I Can name the fraction a model shows',
        instructionKey: 'frac-name',
    })),
    misconceptions: ['counted-unshaded', 'part-over-part', 'counted-ticks', 'counted-parts-only', 'swapped-parts'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (p && p.task === 'part') {
            const t = p.terms[0];
            const top = p.part === 'n';
            return clampSteps([
                step(`The numerator is the number on top: ${t.n}. It counts the parts we have.`),
                step(`The denominator is the number under the bar: ${t.d}. It counts the equal parts in the whole.`),
                step(`The ${top ? 'numerator' : 'denominator'} is ${top ? t.n : t.d}. Write ${top ? t.n : t.d}.`, [{ slot: 'part', value: String(top ? t.n : t.d) }]),
            ]);
        }
        if (p && p.task === 'pick') {
            const right = p.terms.find((t) => t.letter === p.answer.letter);
            return clampSteps([
                step(`The fraction is ${fr(p.show.n, p.show.d)}: ${p.show.d} equal parts, ${p.show.n} shaded.`),
                step(`Find a model with ${p.show.d} equal parts.`),
                step(`Model ${right.letter} has ${p.show.n} of its ${p.show.d} parts shaded. Circle ${right.letter}.`, [{ slot: 'answer', value: right.letter }]),
            ]);
        }
        return writeSteps(q);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p && p.task === 'part') {
            // the commonest slip: the other number (top and bottom mixed up)
            const t = p.terms[0];
            const v = p.part === 'n' ? t.d : t.n;
            return chooseWrong(q, [{ value: v, misconception: 'swapped-parts', slot: 'part', slots: { part: String(v) },
                explain: p.part === 'n' ? 'Wrote the bottom number. The numerator is the TOP number.' : 'Wrote the top number. The denominator is the BOTTOM number.' }]);
        }
        return writeWrong(q);
    },
});

/* ======================================================================= shade the fraction */

registerSkill('fractions:shade_fraction', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can shade a model to show a fraction',
        instructionKey: 'shade',
        steps: ['The denominator says how many equal parts: count them.', 'The numerator says how many to shade.', 'Shade that many parts.'],
        say: 'I shaded __ of __ equal parts.',
        sayValues: (q) => { const p = payloadOf(q); return p ? [p.show.n, p.show.d] : null; },
        vocabulary: ['numerator', 'denominator', 'shade'],
    }),
    misconceptions: ['shaded-the-rest', 'shaded-denominator'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'shade') return [];
        const { n, d } = p.show;
        return clampSteps([
            step(`The denominator is ${d}. Check: the model has ${d} equal parts.`),
            step(`The numerator is ${n}. Shade ${n} parts.`),
            step(`${n} of ${d} parts are shaded: ${fr(n, d)}.`, [{ slot: 'answer', value: String(n) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'shade') return null;
        const { n, d } = p.show;
        return chooseWrong(q, [
            { value: String(d - n), misconception: 'shaded-the-rest', slot: 'answer', slots: { answer: String(d - n) }, explain: `Shaded ${d - n} parts: the parts that should stay white.` },
            { value: String(Math.min(d, n + 1)), misconception: 'shaded-denominator', slot: 'answer', slots: { answer: String(Math.min(d, n + 1)) }, explain: `Shaded ${Math.min(d, n + 1)} parts, one too many: count the ${n} again.` },
        ]);
    },
});

/* ========================================================================= compare */

function signOf(a, b) { return a > b ? '>' : a < b ? '<' : '='; }

registerSkill('fractions:compare', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can compare two fractions',
        instructionKey: 'compare',
        steps: ['Look: both models are the same whole.', 'Which one has more shaded?', 'Write >, < or = in the circle.'],
        say: '__ is __ __.',
        sayValues: (q) => {
            const p = payloadOf(q);
            if (!p || p.task !== 'sign') return null;
            const [a, b] = p.terms;
            const word = { '>': 'greater than', '<': 'less than', '=': 'equal to' }[p.answer.sign];
            return `${fr(a.n, a.d)} is ${word} ${fr(b.n, b.d)}.`;
        },
        vocabulary: ['greater than', 'less than', 'equal to'],
    }),
    misconceptions: ['sign-reversed', 'bigger-denominator-bigger'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'sign') return [];
        const [a, b] = p.terms;
        const s = p.answer.sign;
        const more = s === '>' ? fr(a.n, a.d) : s === '<' ? fr(b.n, b.d) : null;
        if (!a.kind && p.benchmark) {
            // numbers only, against the benchmark 1/2: half of the denominator
            const half = a.d / 2;
            return clampSteps([
                step(`Half of ${a.d} is ${half}. So ${fr(half, a.d)} is the same as 1/2.`),
                step(`${a.n} is ${a.n > half ? 'more than' : a.n < half ? 'less than' : 'equal to'} ${half}.`),
                step(`${fr(a.n, a.d)} ${s} 1/2. Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
            ]);
        }
        if (!a.kind) {
            // numbers only: give the two fractions the same denominator
            const L = (a.d * b.d) / gcd(a.d, b.d);
            const an = a.n * (L / a.d), bn = b.n * (L / b.d);
            return clampSteps([
                step(`Make the denominators the same: ${L}.`),
                step(`${fr(a.n, a.d)} = ${fr(an, L)} and ${fr(b.n, b.d)} = ${fr(bn, L)}.`),
                step(`${an} ${s} ${bn}, so ${fr(a.n, a.d)} ${s} ${fr(b.n, b.d)}. Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
            ]);
        }
        return clampSteps([
            step(`Both models are the same size of whole.`),
            step(more ? `${more} covers more of the whole.` : `They cover the same amount of the whole.`),
            step(`${fr(a.n, a.d)} ${s} ${fr(b.n, b.d)}. Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'sign') return null;
        const [a, b] = p.terms;
        const s = p.answer.sign;
        const c = [];
        if (s !== '=') c.push({ value: s === '>' ? '<' : '>', misconception: 'sign-reversed', slot: 'sign', slots: { sign: s === '>' ? '<' : '>' }, explain: 'Wrote the sign the wrong way round: it opens to the bigger fraction.' });
        const byDen = a.d === b.d ? null : signOf(a.d, b.d);
        if (byDen && byDen !== s) c.push({ value: byDen, misconception: 'bigger-denominator-bigger', slot: 'sign', slots: { sign: byDen }, explain: `Read the bigger denominator as the bigger fraction: more parts means SMALLER parts.` });
        return chooseWrong(q, c);
    },
});

/* =========================================================================== equivalent */

registerSkill('fractions:equiv_frac_visual', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can find equivalent fractions with models',
        instructionKey: 'models-complete',
        steps: ['Both models are the same whole.', 'Count the equal parts and the shaded parts of each.', 'Equivalent fractions cover the same amount.'],
        say: '__ is equal to __.',
        sayValues: (q) => {
            const p = payloadOf(q);
            if (!p) return null;
            const [a, b] = p.terms;
            return a.n * b.d === b.n * a.d ? [fr(a.n, a.d), fr(b.n, b.d)] : null;
        },
        vocabulary: ['equivalent', 'numerator', 'denominator'],
    }),
    misconceptions: ['added-same-number', 'only-one-multiplied', 'said-equal'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const [a, b] = p.terms;
        const k = b.d / a.d;
        if (p.task === 'sign') {
            const s = p.answer.sign;
            return clampSteps([
                step(`Both models are the same whole.`),
                step(s === '=' ? `${fr(a.n, a.d)} and ${fr(b.n, b.d)} cover the same amount.` : `${fr(a.n, a.d)} and ${fr(b.n, b.d)} do not cover the same amount.`),
                step(`Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
            ]);
        }
        const slots = b.frac === 'n' ? ['n'] : b.frac === 'd' ? ['d'] : ['n', 'd'];
        return clampSteps([
            step(`The second model has ${Number.isInteger(k) ? `${k} times as many` : 'more'} equal parts: ${b.d}.`, slots.includes('d') ? [{ slot: 'd', value: String(b.d) }] : []),
            step(`Its shaded parts cover the same amount: ${b.n}.`, slots.includes('n') ? [{ slot: 'n', value: String(b.n) }] : []),
            step(`${fr(a.n, a.d)} = ${fr(b.n, b.d)}.`, slots.map((s) => ({ slot: s, value: String(s === 'n' ? b.n : b.d) }))),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const [a, b] = p.terms;
        if (p.task === 'sign') {
            const s = p.answer.sign;
            return chooseWrong(q, [{ value: s === '=' ? '≠' : '=', misconception: 'said-equal', slot: 'sign', slots: { sign: s === '=' ? '≠' : '=' },
                explain: s === '=' ? 'Said the fractions are not equal because the numbers are different.' : 'Said the fractions are equal without checking the shaded amount.' }]);
        }
        const k = b.d - a.d;
        const c = [];
        if (b.frac === 'n') c.push({ value: a.n + k, misconception: 'added-same-number', slot: 'n', slots: { n: String(a.n + k) }, explain: `Added ${k} to the numerator because ${k} was added to the denominator. Multiply instead.` });
        else if (b.frac === 'd') c.push({ value: a.d + (b.n - a.n), misconception: 'added-same-number', slot: 'd', slots: { d: String(a.d + (b.n - a.n)) }, explain: `Added the same number to the denominator. Multiply instead.` });
        else c.push({ value: fr(b.n, a.d), misconception: 'only-one-multiplied', slot: 'd', slots: { n: String(b.n), d: String(a.d) }, explain: `Changed the numerator only: count ALL the parts of the second model.` });
        return chooseWrong(q, c);
    },
});

/* ============================================================== fraction number sentences */

/** The two fractions and the answer of a sentence item, as numbers. */
function sentenceOf(q) {
    const p = payloadOf(q);
    if (!p || p.task !== 'op') return null;
    const terms = p.terms.filter((t) => !/^(n|d|w|nd|wnd)$/.test(t.frac || ''));
    return { p, terms, ops: p.joins.slice(0, -1), a: p.answer };
}

/** A whole-number term (the 3 of 3 x 2/5, the 4 of 4 / 1/3): no fraction part. */
const isWholeTerm = (t) => !Number(t.n) && Number(t.w) > 0 && !t.copies;

/** A x sentence as {k: the whole number, f: the fraction term}, whichever way round it is written. */
function groupsOf(x, y) {
    if (isWholeTerm(x)) return { k: Number(x.w), f: y };
    if (isWholeTerm(y)) return { k: Number(y.w), f: x };
    return null;
}

function sentenceSteps(q) {
    const s = sentenceOf(q);
    if (!s || s.terms.length !== 2) return [];
    const [x, y] = s.terms;
    const op = s.ops[0];
    const ansText = mixedText(s.a.w, s.a.n, s.a.d);
    const marks = [...(s.a.w ? [{ slot: 'w', value: String(s.a.w) }] : []), ...(s.a.n ? [{ slot: 'n', value: String(s.a.n) }, { slot: 'd', value: String(s.a.d) }] : [])];
    const xv = (x.w || 0) * x.d + x.n, yv = (y.w || 0) * y.d + y.n;
    if ((op === '+' || op === '−') && (x.w || y.w)) {
        // a mixed number: the parts first (on one denominator), then the wholes, then regroup
        const L = (x.d * y.d) / gcd(x.d, y.d);
        const xn = x.n * (L / x.d), yn = y.n * (L / y.d);
        const same = x.d === y.d;
        const rename = same ? [] : [step(`Make the denominators the same: ${L}. ${fr(x.n, x.d)} = ${fr(xn, L)} and ${fr(y.n, y.d)} = ${fr(yn, L)}.`)];
        if (op === '+') {
            const parts = xn + yn, wholes = (x.w || 0) + (y.w || 0);
            return clampSteps([
                ...rename,
                step(`Add the parts: ${fr(xn, L)} + ${fr(yn, L)} = ${fr(parts, L)}.`),
                step(`Add the wholes: ${x.w || 0} + ${y.w || 0} = ${wholes}.`),
                ...(parts >= L ? [step(`${fr(parts, L)} is 1 whole or more: regroup. ${wholes} + ${fr(parts, L)} = ${ansText}.`)]
                    : mixedText(wholes, parts, L) !== ansText ? [step(`${mixedText(wholes, parts, L)} = ${ansText} in simplest form.`)] : []),
                step(`Write ${ansText}.`, marks),
            ]);
        }
        const borrow = xn < yn;
        const pw = (borrow ? x.w - 1 : x.w) - (y.w || 0), pn = (borrow ? xn + L : xn) - yn;
        const simp = mixedText(pw, pn, L) !== ansText ? [step(`${mixedText(pw, pn, L)} = ${ansText} in simplest form.`)] : [];
        return clampSteps([
            ...rename,
            ...(borrow ? [step(`${fr(xn, L)} is less than ${fr(yn, L)}: take 1 whole as ${fr(L, L)}. ${x.w} ${fr(xn, L)} = ${x.w - 1} ${fr(xn + L, L)}.`)] : []),
            step(`Subtract the parts: ${fr(borrow ? xn + L : xn, L)} − ${fr(yn, L)} = ${fr((borrow ? xn + L : xn) - yn, L)}.`),
            step(`Subtract the wholes: ${borrow ? x.w - 1 : x.w} − ${y.w || 0} = ${pw}.`),
            ...simp,
            step(`Write ${ansText}.`, marks),
        ]);
    }
    if ((op === '+' || op === '−') && x.d === y.d) {
        const r = op === '+' ? xv + yv : xv - yv;
        return clampSteps([
            step(`The denominators are the same: ${x.d}. The parts are the same size.`),
            step(`${op === '+' ? 'Add' : 'Subtract'} the numerators: ${xv} ${op} ${yv} = ${r}. That is ${fr(r, x.d)}.`),
            ...(ansText !== fr(r, x.d) ? [step(`${fr(r, x.d)} = ${ansText}.`)] : []),
            step(`Write ${ansText}.`, marks),
        ]);
    }
    if (op === '+' || op === '−') {
        const lcd = (x.d * y.d) / gcd(x.d, y.d);
        return clampSteps([
            step(`The denominators are ${x.d} and ${y.d}. Make them the same: ${lcd}.`),
            step(`${fr(xv, x.d)} = ${fr(xv * (lcd / x.d), lcd)} and ${fr(yv, y.d)} = ${fr(yv * (lcd / y.d), lcd)}.`),
            step(`${op === '+' ? 'Add' : 'Subtract'} the numerators: ${fr(xv * (lcd / x.d) + (op === '+' ? 1 : -1) * yv * (lcd / y.d), lcd)}.`),
            step(`Write ${ansText}.`, marks),
        ]);
    }
    if (op === '×') {
        const g = groupsOf(x, y);
        if (g) {
            return clampSteps([
                step(`${g.k} groups of ${fr(g.f.n, g.f.d)}.`),
                step(`Count the shaded parts: ${g.k} × ${g.f.n} = ${g.k * g.f.n}. That is ${fr(g.k * g.f.n, g.f.d)}.`),
                ...(ansText !== fr(g.k * g.f.n, g.f.d) ? [step(`${fr(g.k * g.f.n, g.f.d)} = ${ansText}.`)] : []),
                step(`Write ${ansText}.`, marks),
            ]);
        }
        // a fraction of a fraction: the area model's cells
        return clampSteps([
            step(`Cut the whole into ${x.d} rows and ${y.d} columns: ${x.d * y.d} equal cells. That is the denominator.`),
            step(`Shade ${x.n} row${x.n === 1 ? '' : 's'}. Take ${y.n} of the ${y.d} columns: ${x.n} × ${y.n} = ${x.n * y.n} cell${x.n * y.n === 1 ? '' : 's'}.`),
            step(`${fr(x.n, x.d)} × ${fr(y.n, y.d)} = ${fr(x.n * y.n, x.d * y.d)}${ansText !== fr(x.n * y.n, x.d * y.d) ? ` = ${ansText}` : ''}. Write ${ansText}.`, marks),
        ]);
    }
    if (op === '÷') {
        if (isWholeTerm(x)) {
            // a whole divided by a unit fraction: how many 1/d parts are in the wholes?
            return clampSteps([
                step(`How many ${fr(1, y.d)} parts are in ${x.w}?`),
                step(`Each whole has ${y.d} parts. ${x.w} × ${y.d} = ${x.w * y.d}.`),
                step(`Write ${ansText}.`, marks),
            ]);
        }
        return clampSteps([
            step(`Cut ${fr(x.n, x.d)} into ${y.w} equal parts.`),
            step(`The whole now has ${x.d} × ${y.w} = ${x.d * y.w} of those parts.`),
            step(`Each part is ${fr(1, x.d * y.w)}. Write ${ansText}.`, marks),
        ]);
    }
    return [];
}

function sentenceWrong(q) {
    const s = sentenceOf(q);
    if (!s || s.terms.length !== 2) return null;
    const [x, y] = s.terms;
    const op = s.ops[0];
    const c = [];
    const xv = (x.w || 0) * x.d + x.n, yv = (y.w || 0) * y.d + y.n;
    if (op === '+' && !x.w && !y.w) c.push({ value: fr(x.n + y.n, x.d + y.d), misconception: 'added-denominators', slot: 'd', slots: { n: String(x.n + y.n), d: String(x.d + y.d), w: '' }, explain: 'Added the denominators too. The size of the parts does not change when you add.' });
    if (op === '−' && !x.w && !y.w && x.d !== y.d) c.push({ value: fr(Math.abs(x.n - y.n), Math.abs(x.d - y.d) || 1), misconception: 'subtracted-denominators', slot: 'd', slots: { n: String(Math.abs(x.n - y.n)), d: String(Math.abs(x.d - y.d) || 1), w: '' }, explain: 'Subtracted the denominators too. Make them the same first.' });
    if (op === '−' && x.d === y.d && !x.w && !y.w) c.push({ value: fr(xv - yv, 2 * x.d), misconception: 'subtracted-denominators', slot: 'd', slots: { n: String(xv - yv), d: String(2 * x.d), w: '' }, explain: 'Changed the denominator. Only the numerators are subtracted.' });
    if ((op === '+' || op === '−') && (x.w || y.w)) {
        const w = op === '+' ? (x.w || 0) + (y.w || 0) : (x.w || 0) - (y.w || 0);
        const right = op === '+' ? xv / x.d + yv / y.d : xv / x.d - yv / y.d;
        const push = (n, d, misconception, explain) => {
            if (w < 0 || d <= 1 || Math.abs(w + n / d - right) < 1e-9) return;   // never the right value, never "n/1"
            c.push({ value: `${w} ${fr(n, d)}`, misconception, slot: 'n', slots: { w: String(w), n: String(n), d: String(d) }, explain });
        };
        if (x.d === y.d) {
            // the parts added past a whole (or subtracted the smaller from the bigger) and kept apart
            push(op === '+' ? x.n + y.n : Math.abs(x.n - y.n), x.d, 'did-not-regroup',
                op === '+' ? 'Added the parts past a whole and did not regroup it.' : 'Took the smaller part from the bigger one instead of taking a whole.');
            if (op === '+') push(x.n + y.n, x.d + y.d, 'added-denominators', 'Added the denominators of the parts too. The size of the parts does not change.');
            else push(x.n, x.d, 'wholes-only', 'Subtracted the wholes and left the parts as they were.');
        } else {
            push(op === '+' ? x.n + y.n : Math.abs(x.n - y.n), op === '+' ? x.d + y.d : Math.abs(x.d - y.d),
                op === '+' ? 'added-denominators' : 'subtracted-denominators',
                op === '+' ? 'Added the denominators of the parts. Make them the same first.' : 'Subtracted the denominators of the parts. Make them the same first.');
        }
    }
    if (op === '×') {
        const g = groupsOf(x, y);
        if (g) c.push({ value: fr(g.k * g.f.n, g.k * g.f.d), misconception: 'multiplied-denominator', slot: 'd', slots: { n: String(g.k * g.f.n), d: String(g.k * g.f.d), w: '' }, explain: 'Multiplied the denominator too. The parts stay the same size: only count them.' });
        else c.push({ value: fr(x.n * y.n, x.d + y.d), misconception: 'added-denominators', slot: 'd', slots: { n: String(x.n * y.n), d: String(x.d + y.d), w: '' }, explain: 'Added the denominators. Count ALL the cells of the area model: rows times columns.' });
    }
    if (op === '÷') {
        // the commonest error: divided the other way (4 ÷ 1/3 read as 4 × 1/3, 1/3 ÷ 2 as 2/3)
        if (isWholeTerm(x)) c.push({ value: fr(x.w, y.d), misconception: 'divided-wrong-way', slot: 'w', slots: { w: fr(x.w, y.d) }, explain: `Found ${fr(1, y.d)} of ${x.w}. The question is how many ${fr(1, y.d)} parts FIT in ${x.w}.` });
        else c.push({ value: fr(y.w, x.d), misconception: 'divided-wrong-way', slot: 'n', slots: { n: String(y.w), d: String(x.d), w: '' }, explain: `Multiplied instead of dividing. Cut ${fr(x.n, x.d)} into ${y.w} parts: each part is SMALLER.` });
    }
    return chooseWrong(q, c);
}

const SENTENCE = {
    '+': { iCan: 'I Can add fractions', instructionKey: 'add', steps: ['Look at the denominators.', 'Add the numerators. The denominator stays the same.', 'Write the answer in simplest form.'], say: '__ plus __ is __.' },
    '−': { iCan: 'I Can subtract fractions', instructionKey: 'subtract', steps: ['Look at the denominators.', 'Subtract the numerators. The denominator stays the same.', 'Write the answer in simplest form.'], say: '__ minus __ is __.' },
    '÷': { iCan: 'I Can divide with unit fractions', instructionKey: 'divide', steps: ['Look at what is divided and what it is divided by.', 'Count how many parts fit, or cut the part into equal parts.', 'Write the answer.'], say: '__ divided by __ is __.' },
    'x': { iCan: 'I Can multiply a fraction by a whole number', instructionKey: 'multiply', steps: ['Read it as groups: how many groups of the fraction?', 'Count the shaded parts in all the groups.', 'Keep the denominator.'], say: '__ groups of __ is __.' },
};
const sayOf = (q) => {
    const s = sentenceOf(q);
    if (!s || s.terms.length !== 2) return null;
    const t = (u) => mixedText(u.w, u.n, u.d);
    const g = s.ops[0] === '×' ? groupsOf(s.terms[0], s.terms[1]) : null;
    // "__ groups of __ is __." reads the whole number first, whichever way the sum is written
    if (g) return [String(g.k), t(g.f), mixedText(s.a.w, s.a.n, s.a.d)];
    return [t(s.terms[0]), t(s.terms[1]), mixedText(s.a.w, s.a.n, s.a.d)];
};

/** Register one fraction-sentence skill (its label and its operation). */
export function registerFractionSentence(key, op, extra = {}) {
    const def = SENTENCE[op];
    registerSkill(key, {
        open: fracOpen,
        strings: strings(Object.assign({}, def, { sayValues: sayOf, vocabulary: ['numerator', 'denominator'] }, extra)),
        misconceptions: ['added-denominators', 'subtracted-denominators', 'did-not-regroup', 'wholes-only', 'multiplied-denominator', 'divided-wrong-way'],
        workedSteps: sentenceSteps,
        wrongAnswer: sentenceWrong,
    });
}

registerFractionSentence('fraction_operations:add_fractions_like', '+', { iCan: 'I Can add fractions with the same denominator' });
registerFractionSentence('fraction_operations:sub_fractions_like', '−', { iCan: 'I Can subtract fractions with the same denominator' });
registerFractionSentence('fraction_operations:add_mixed_like', '+', { iCan: 'I Can add mixed numbers with the same denominator' });
registerFractionSentence('fraction_operations:sub_mixed_like', '−', { iCan: 'I Can subtract mixed numbers with the same denominator' });
registerFractionSentence('fraction_operations:add_frac_unlike', '+', { iCan: 'I Can add fractions with different denominators',
    steps: ['Find a common denominator.', 'Rename both fractions.', 'Add the numerators. Simplify.'] });
registerFractionSentence('fraction_operations:sub_frac_unlike', '−', { iCan: 'I Can subtract fractions with different denominators',
    steps: ['Find a common denominator.', 'Rename both fractions.', 'Subtract the numerators. Simplify.'] });
registerFractionSentence('fraction_operations:add_mixed_unlike', '+', { iCan: 'I Can add mixed numbers with different denominators',
    steps: ['Find a common denominator.', 'Add the wholes, then the fractions.', 'Regroup if the fraction is 1 or more.'] });
registerFractionSentence('fraction_operations:sub_mixed_unlike', '−', { iCan: 'I Can subtract mixed numbers with different denominators',
    steps: ['Find a common denominator.', 'Regroup a whole if you need more parts.', 'Subtract the wholes, then the fractions.'] });
registerFractionSentence('fraction_operations:mult_frac_whole', 'x');
registerFractionSentence('fraction_operations:mult_frac_frac', 'x', { iCan: 'I Can multiply two fractions',
    steps: ['Draw rows for the first fraction.', 'Take the columns of the second fraction.', 'Count the cells inside both. Count all the cells.'], say: '__ times __ is __.' });
registerFractionSentence('fraction_operations:div_unit_fraction', '÷');
registerFractionSentence('fractions:fraction_bar_ops', '+', { iCan: 'I Can add and subtract fractions with fraction bars',
    steps: ['Look at the bars: are the parts the same size?', 'If not, cut the bars into the same size of parts.', 'Add or subtract the parts. Write the answer.'] });

/* =============================================================== fractions lane, 2026-09-25 */
// decompose_fractions, frac_10_100, frac_as_division, mult_scaling and the fraction word
// problems, all on the frac-model cell (gen-fractions.js).

registerSkill('fraction_operations:decompose_fractions', {
    open: decomposeOpen,
    strings: strings({
        iCan: 'I Can write a fraction as a sum of unit fractions',
        instructionKey: 'unit-fractions',
        steps: ['Count all the equal parts. Each part is 1 over that number.', 'Count the shaded parts.', 'Write one unit fraction for each shaded part.'],
        say: '__ is __ unit fractions of __.',
        sayValues: (q) => { const p = payloadOf(q); if (!p) return null; const t = p.terms[0]; return [fr(t.n, t.d), t.n, fr(1, t.d)]; },
        vocabulary: ['unit fraction', 'numerator', 'denominator'],
    }),
    misconceptions: ['used-numerator', 'counted-shaded-as-parts'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const t = p.terms[0];
        const marks = (p.answer.terms || []).map((u, i) => ({ slot: `d${i}`, value: String(u.d) }));
        return clampSteps([
            step(`The whole has ${t.d} equal parts. Each part is ${fr(1, t.d)}: a unit fraction.`),
            step(`${t.n} parts are shaded, so ${fr(t.n, t.d)} is ${t.n} parts of ${fr(1, t.d)}.`),
            step(`Write ${fr(1, t.d)} ${t.n} times: ${p.answer.text}.`, marks),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const t = p.terms[0];
        const k = (p.answer.terms || []).length;
        const all = (d) => { const o = {}; for (let i = 0; i < k; i++) o[`d${i}`] = String(d); return o; };
        const text = (d) => Array.from({ length: k }, () => fr(1, d)).join(' + ');
        return chooseWrong(q, [
            t.n !== t.d ? { value: text(t.n), misconception: 'used-numerator', slot: 'd0', slots: all(t.n), explain: `Used the numerator ${t.n} as the size of each part. The parts are ${fr(1, t.d)}: count ALL the parts.` } : null,
            t.d - t.n > 1 ? { value: text(t.d - t.n), misconception: 'counted-shaded-as-parts', slot: 'd0', slots: all(t.d - t.n), explain: `Counted the white parts (${t.d - t.n}) as the denominator. The denominator is all ${t.d} parts.` } : null,
        ]);
    },
});

registerSkill('fraction_operations:frac_10_100', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can write tenths as hundredths',
        instructionKey: 'missing',
        steps: ['A tenth is one column of the hundred square.', 'One column is 10 hundredths.', 'Multiply by 10, or divide by 10.'],
        say: '__ is equal to __.',
        sayValues: (q) => { const p = payloadOf(q); if (!p) return null; return [fr(p.terms[0].n, p.terms[0].d), fr(p.answer.n, p.answer.d)]; },
        vocabulary: ['tenths', 'hundredths', 'equivalent'],
    }),
    misconceptions: ['added-zero-to-denominator-only', 'divided-wrong-way'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const t = p.terms[0], a = p.answer;
        const up = t.d === 10;
        return clampSteps([
            step(up ? `${fr(t.n, 10)} is ${t.n} columns of the hundred square.` : `${fr(t.n, 100)} is ${t.n} small squares: ${t.n / 10} whole columns.`),
            step(up ? `Each column is 10 hundredths: ${t.n} × 10 = ${a.n}.` : `Each column is 1 tenth: ${t.n} ÷ 10 = ${a.n}.`),
            step(`${fr(t.n, t.d)} = ${fr(a.n, a.d)}. Write ${a.n}.`, [{ slot: 'n', value: String(a.n) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const t = p.terms[0];
        return chooseWrong(q, [
            { value: fr(t.n, p.answer.d), misconception: 'added-zero-to-denominator-only', slot: 'n', slots: { n: String(t.n) }, explain: 'Changed the denominator only. The numerator changes by the same factor.' },
            t.d === 10 ? { value: fr(t.n + 10, 100), misconception: 'divided-wrong-way', slot: 'n', slots: { n: String(t.n + 10) }, explain: 'Added 10 instead of multiplying by 10.' } : null,
        ]);
    },
});

registerSkill('fraction_operations:frac_as_division', {
    open: shareOpen,
    strings: strings({
        iCan: 'I Can see a fraction as a division',
        instructionKey: 'share-fraction',
        steps: ['Cut every whole into as many equal parts as there are people.', 'Give each person one part of each whole.', 'Count one person\'s parts: that is the fraction.'],
        say: '__ shared by __ is __ each.',
        sayValues: (q) => { const p = payloadOf(q); if (!p) return null; return [p.terms[0].w, p.terms[1].w, mixedText(p.answer.w, p.answer.n, p.answer.d)]; },
        vocabulary: ['share', 'equal parts', 'divide'],
    }),
    misconceptions: ['divided-wrong-way', 'counted-all-parts'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const a = p.terms[0].w, b = p.terms[1].w, ans = p.answer;
        const marks = [...(ans.w ? [{ slot: 'w', value: String(ans.w) }] : []), ...(ans.n ? [{ slot: 'n', value: String(ans.n) }, { slot: 'd', value: String(ans.d) }] : [])];
        return clampSteps([
            step(`Cut each of the ${a} whole${a > 1 ? 's' : ''} into ${b} equal parts. Each part is ${fr(1, b)}.`),
            step(`Each of the ${b} gets one part of every whole: ${a} parts of ${fr(1, b)}.`),
            step(`${a} ÷ ${b} = ${fr(a, b)}${mixedText(ans.w, ans.n, ans.d) !== fr(a, b) ? ` = ${mixedText(ans.w, ans.n, ans.d)}` : ''}. Write it.`, marks),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const a = p.terms[0].w, b = p.terms[1].w;
        const mixed = p.terms[p.terms.length - 1].frac === 'wnd';
        const inv = b >= a ? { w: Math.floor(b / a), n: b % a, d: a } : { w: 0, n: b, d: a };
        const c = [];
        if (a !== b) {
            const explain = `Wrote ${b} over ${a}: the people over the wholes. It is the wholes shared: ${fr(a, b)}.`;
            if (mixed) c.push({ value: mixedText(inv.w, inv.n, inv.d), misconception: 'divided-wrong-way', slot: 'd', explain,
                slots: { w: inv.w ? String(inv.w) : '', n: inv.n ? String(inv.n) : '', d: inv.n ? String(inv.d) : '' } });
            else c.push({ value: fr(b, a), misconception: 'divided-wrong-way', slot: 'd', slots: { n: String(b), d: String(a) }, explain });
        }
        if (!mixed && a < b) c.push({ value: fr(a, a * b), misconception: 'counted-all-parts', slot: 'd', slots: { n: String(a), d: String(a * b) }, explain: `Counted every part of all the wholes (${a * b}) as the denominator. One whole has ${b} parts.` });
        return chooseWrong(q, c);
    },
});

registerSkill('fraction_operations:mult_scaling', {
    open: scalingOpen,
    strings: strings({
        iCan: 'I Can tell if multiplying by a fraction makes a number bigger or smaller',
        instructionKey: 'scaling-compare',
        steps: ['Look at the fraction: is it less than 1, equal to 1, or more than 1?', 'Less than 1 makes the number smaller. More than 1 makes it bigger.', 'Write <, > or = in the circle.'],
        say: '__ times __ is __ __.',
        sayValues: (q) => {
            const p = payloadOf(q);
            if (!p) return null;
            const word = { '>': 'greater than', '<': 'less than', '=': 'equal to' }[p.answer.sign];
            return `${fr(p.terms[0].n, p.terms[0].d)} times ${p.terms[1].w} is ${word} ${p.terms[2].w}.`;
        },
        vocabulary: ['scaling', 'greater than', 'less than'],
    }),
    misconceptions: ['multiplying-always-bigger', 'sign-reversed'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const t = p.terms[0], w = p.terms[1].w, s = p.answer.sign;
        const vs = t.n > t.d ? 'more than 1' : t.n < t.d ? 'less than 1' : 'equal to 1';
        return clampSteps([
            step(`${fr(t.n, t.d)} is ${vs}: look at the bars.`),
            step(s === '=' ? `Times 1 keeps ${w} the same.` : `Times a number ${vs} makes ${w} ${s === '>' ? 'bigger' : 'smaller'}.`),
            step(`${fr(t.n, t.d)} × ${w} ${s} ${w}. Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const s = p.answer.sign;
        return chooseWrong(q, [
            s !== '>' ? { value: '>', misconception: 'multiplying-always-bigger', slot: 'sign', slots: { sign: '>' }, explain: 'Thought multiplying always makes a number bigger. Times a fraction less than 1 makes it smaller.' } : null,
            s !== '=' ? { value: s === '>' ? '<' : '>', misconception: 'sign-reversed', slot: 'sign', slots: { sign: s === '>' ? '<' : '>' }, explain: 'Wrote the sign the wrong way round.' } : null,
        ]);
    },
});

// The fraction word problems: the story over the number sentence it makes. Their worked steps
// and wrong answers are the sentence's (+, −, groups, area, a whole ÷ a unit fraction).
const STORY = { instructionKey: 'story-fraction', steps: ['Read the story. Find the fractions.', 'Look at the number sentence the story makes.', 'Work it out. Write the answer.'] };
registerFractionSentence('fraction_operations:frac_word_problems', '+', Object.assign({ iCan: 'I Can solve fraction stories with adding and subtracting', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));
registerFractionSentence('fraction_operations:frac_word_problems_plain', '+', Object.assign({ iCan: 'I Can solve fraction stories with adding and subtracting', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));
registerFractionSentence('fraction_operations:frac_mult_word', 'x', Object.assign({ iCan: 'I Can solve fraction stories with multiplying and dividing', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));
registerFractionSentence('fraction_operations:frac_mult_word_plain', 'x', Object.assign({ iCan: 'I Can solve fraction stories with multiplying and dividing', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));
registerFractionSentence('fraction_operations:frac_word_mixed', '+', Object.assign({ iCan: 'I Can solve fraction stories', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));
registerFractionSentence('fraction_operations:frac_word_mixed_plain', '+', Object.assign({ iCan: 'I Can solve fraction stories', say: 'The answer is __.', sayValues: (q) => [q.ans] }, STORY));

const MIXED_IMPROPER = {
    open: mixedOpen,
    strings: strings({
        iCan: 'I Can change mixed numbers and improper fractions',
        instructionKey: 'missing',
        steps: ['Count the equal parts in one whole: the denominator.', 'Count all the shaded parts: the improper numerator.', 'Count the whole shapes and the parts left: the mixed number.'],
        say: '__ is the same as __.',
        sayValues: (q) => { const p = payloadOf(q); if (!p) return null; const g = p.terms[0], a = p.answer; return [mixedText(g.w, g.n, g.d), mixedText(a.w, a.n, a.d)]; },
        vocabulary: ['mixed number', 'improper fraction', 'whole'],
    }),
    misconceptions: ['added-whole-to-numerator', 'wholes-as-parts', 'remainder-as-whole'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const g = p.terms[0], a = p.answer, d = g.d;
        const total = (g.w || 0) * d + g.n;
        const w = Math.floor(total / d), n = total % d;
        if (a.w) {
            return clampSteps([
                step(`${d} parts make one whole.`),
                step(`${total} ÷ ${d} = ${w} wholes and ${n} parts left.`),
                step(`Write ${w} ${fr(n, d)}.`, [{ slot: 'w', value: String(w) }, { slot: 'n', value: String(n) }, { slot: 'd', value: String(d) }]),
            ]);
        }
        return clampSteps([
            step(`Each whole is ${fr(d, d)}: ${g.w} wholes are ${g.w} × ${d} = ${g.w * d} parts.`),
            step(`Add the ${g.n} parts: ${g.w * d} + ${g.n} = ${total}.`),
            step(`Write ${fr(total, d)}.`, [{ slot: 'n', value: String(total) }, { slot: 'd', value: String(d) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const g = p.terms[0], a = p.answer, d = g.d;
        if (a.w) {
            const total = g.n;
            return chooseWrong(q, [
                a.n !== a.w ? { value: `${a.n} ${fr(a.w, d)}`, misconception: 'remainder-as-whole', slot: 'w', slots: { w: String(a.n), n: String(a.w), d: String(d) }, explain: 'Swapped the wholes and the parts left over.' } : null,
                a.w > 1 ? { value: `1 ${fr(total - d, d)}`, misconception: 'wholes-as-parts', slot: 'w', slots: { w: '1', n: String(total - d), d: String(d) }, explain: `Took out one whole only. ${fr(total, d)} holds ${a.w} wholes.` } : null,
            ]);
        }
        return chooseWrong(q, [
            { value: fr(g.w + g.n, d), misconception: 'added-whole-to-numerator', slot: 'n', slots: { n: String(g.w + g.n), d: String(d) }, explain: `Added the whole number to the numerator. Each whole is ${d} parts, not 1.` },
            { value: fr(g.w * d, d), misconception: 'wholes-as-parts', slot: 'n', slots: { n: String(g.w * d), d: String(d) }, explain: `Counted the wholes but forgot the ${g.n} parts.` },
        ]);
    },
};
registerSkill('fractions:mixed_improper_visual', MIXED_IMPROPER);
registerSkill('fractions:improper_mixed', MIXED_IMPROPER);

/* ============================================= a fraction of an amount, and find the whole */

const AMOUNT_DEF = (iCan) => ({
    strings: strings({
        iCan,
        instructionKey: 'missing',
        steps: ['The denominator says how many equal parts the whole has.', 'Find one part: divide.', 'Multiply by the parts you need.'],
        say: '__ of __ is __.',
        sayValues: (q) => { const p = payloadOf(q); return p && p.task === 'amount' ? [fr(p.n, p.d), p.total, p.part] : null; },
        vocabulary: ['fraction of', 'equal parts', 'whole'],
    }),
    misconceptions: ['divided-by-numerator', 'multiplied-only', 'forgot-to-divide', 'divided-by-denominator'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'amount') return [];
        const one = p.total / p.d;
        if (p.ask === 'num') {
            return clampSteps([
                step(`Cut ${p.total} into ${p.d} equal groups: ${p.total} ÷ ${p.d} = ${one} in each.`),
                step(`How many groups make ${p.part}? ${p.part} ÷ ${one} = ${p.n}.`),
                step(`${fr(p.n, p.d)} of ${p.total} is ${p.part}. Write ${p.n}.`, [{ slot: 'answer', value: String(p.n) }]),
            ]);
        }
        if (p.ask === 'whole') {
            return clampSteps([
                step(`${fr(p.n, p.d)} is ${p.part}: ${p.n} equal part${p.n > 1 ? 's' : ''} make ${p.part}.`),
                step(`One part is ${p.part} ÷ ${p.n} = ${one}.`),
                step(`The whole is ${p.d} parts: ${one} × ${p.d} = ${p.total}.`, [{ slot: 'answer', value: String(p.total) }]),
            ]);
        }
        return clampSteps([
            step(`Cut ${p.total} into ${p.d} equal parts: ${p.total} ÷ ${p.d} = ${one}.`),
            step(`Take ${p.n} part${p.n > 1 ? 's' : ''}: ${one} × ${p.n} = ${p.part}.`),
            step(`${fr(p.n, p.d)} of ${p.total} is ${p.part}.`, [{ slot: 'answer', value: String(p.part) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'amount') return null;
        const one = p.total / p.d;
        if (p.ask === 'num') {
            return chooseWrong(q, [
                { value: p.part, misconception: 'multiplied-only', slot: 'answer', slots: { answer: String(p.part) }, explain: `Wrote the part (${p.part}), not how many groups it is.` },
                one !== p.n ? { value: one, misconception: 'divided-by-denominator', slot: 'answer', slots: { answer: String(one) }, explain: `Wrote the size of one group (${one}). The numerator counts the groups: ${p.part} ÷ ${one}.` } : null,
            ]);
        }
        if (p.ask === 'whole') {
            return chooseWrong(q, [
                { value: p.part * p.d, misconception: 'forgot-to-divide', slot: 'answer', slots: { answer: String(p.part * p.d) }, explain: `Multiplied ${p.part} by ${p.d} without finding one part first (${p.part} ÷ ${p.n}).` },
                Number.isInteger(p.part / p.d) ? { value: p.part / p.d, misconception: 'divided-by-denominator', slot: 'answer', slots: { answer: String(p.part / p.d) }, explain: `Divided ${p.part} by ${p.d}. ${p.part} is ${p.n} parts of the whole, so the whole is bigger.` } : null,
            ]);
        }
        return chooseWrong(q, [
            { value: one, misconception: 'multiplied-only', slot: 'answer', slots: { answer: String(one) }, explain: `Found one part (${one}) and stopped. ${fr(p.n, p.d)} is ${p.n} parts.` },
            Number.isInteger(p.total / p.n) ? { value: p.total / p.n, misconception: 'divided-by-numerator', slot: 'answer', slots: { answer: String(p.total / p.n) }, explain: `Divided by the numerator ${p.n}. Divide by the denominator ${p.d} to find one part.` } : null,
        ]);
    },
});
registerSkill('fractions:fraction_of_set_hard_nv', AMOUNT_DEF('I Can find a fraction of an amount, and the whole'));
registerSkill('fractions:fraction_of_set', AMOUNT_DEF('I Can find a fraction of a set'));
registerSkill('fractions:fraction_of_set_hard', AMOUNT_DEF('I Can find a fraction of a set'));

/* ================================================================ percent on the hundred square */

const pctOf = (p) => (p && p.terms && p.terms[0] ? Math.round((p.terms[0].n * 100) / p.terms[0].d) : null);
registerSkill('conversions:percent_visual', {
    strings: strings({
        iCan: 'I Can read percent on a hundred square',
        instructionKey: 'missing',
        steps: ['The square is one whole: 100 small squares.', 'Each small square is 1%. A column is 10%.', 'Count the shaded squares.'],
        say: '__ out of 100 is __ percent.',
        sayValues: (q) => { const v = pctOf(payloadOf(q)); return v === null ? null : [v, v]; },
        vocabulary: ['percent', 'hundredths', 'whole'],
    }),
    misconceptions: ['counted-unshaded', 'columns-as-ones', 'not-simplified'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const v = pctOf(p);
        if (v === null) return [];
        const a = p.answer;
        const ans = p.terms[p.terms.length - 1];
        const marks = ans.frac === 'nd' ? [{ slot: 'n', value: String(a.n) }, { slot: 'd', value: String(a.d) }]
            : ans.frac === 'n' ? [{ slot: 'n', value: String(a.n) }] : [{ slot: 'w', value: String(a.w) }];
        const tens = Math.floor(v / 10), ones = v % 10;
        return clampSteps([
            step(`Count the full columns: ${tens} columns of 10 = ${tens * 10}.${ones ? ` Then ${ones} more: ${v}.` : ''}`),
            step(`${v} of the 100 squares are shaded: ${v}%, or ${fr(v, 100)}.`),
            ...(ans.frac === 'nd' && a.d !== 100 ? [step(`${fr(v, 100)} in simplest form is ${fr(a.n, a.d)}.`)] : []),
            step(`Write ${ans.frac === 'nd' ? fr(a.n, a.d) : ans.frac === 'n' ? a.n : a.w}.`, marks),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const v = pctOf(p);
        if (v === null) return null;
        const ans = p.terms[p.terms.length - 1];
        if (ans.frac === 'nd') {
            return chooseWrong(q, [
                p.answer.d !== 100 ? { value: fr(v, 100), misconception: 'not-simplified', slot: 'n', slots: { n: String(v), d: '100' }, explain: `Wrote ${fr(v, 100)} and did not simplify it.` } : null,
                { value: fr(100 - v, 100), misconception: 'counted-unshaded', slot: 'n', slots: { n: String(100 - v), d: '100' }, explain: 'Counted the white squares.' },
            ]);
        }
        const slot = ans.frac === 'n' ? 'n' : 'w';
        return chooseWrong(q, [
            { value: ans.frac === 'n' ? fr(100 - v, 100) : 100 - v, misconception: 'counted-unshaded', slot, slots: { [slot]: String(100 - v) }, explain: 'Counted the white squares, not the shaded ones.' },
            v % 10 === 0 && v > 10 ? { value: ans.frac === 'n' ? fr(v / 10, 100) : v / 10, misconception: 'columns-as-ones', slot, slots: { [slot]: String(v / 10) }, explain: `Counted the columns (${v / 10}) as single squares. Each column is 10 squares.` } : null,
        ]);
    },
});

/* ==================================================== equivalent fractions and simplifying */

/** The factor between the two fractions of "a/b = c/d" (c/a or a/c), and which way. */
function factorOf(p) {
    const [x, y] = p.terms;
    const up = y.d >= x.d;
    const k = up ? y.d / x.d : x.d / y.d;
    return { x, y, up, k: Number.isInteger(k) ? k : null };
}

const EQUIV_DEF = {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can find equivalent fractions',
        instructionKey: 'missing',
        steps: ['Look at the two denominators (or numerators): what are they multiplied by?', 'Multiply the other part by the same number.', 'Write the missing number.'],
        say: '__ is equal to __.',
        sayValues: (q) => { const p = payloadOf(q); return p && p.task === 'op' ? [fr(p.terms[0].n, p.terms[0].d), fr(p.answer.n, p.answer.d)] : null; },
        vocabulary: ['equivalent', 'numerator', 'denominator', 'multiply'],
    }),
    misconceptions: ['added-same-number', 'only-one-multiplied', 'said-equal'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        if (p.task === 'sign') {
            const [a, b] = p.terms;
            const s = p.answer.sign;
            const k = b.d / a.d;
            return clampSteps([
                step(Number.isInteger(k) ? `${a.d} × ${k} = ${b.d}: the denominator is multiplied by ${k}.` : `${a.d} does not go into ${b.d} a whole number of times.`),
                step(Number.isInteger(k) ? `${a.n} × ${k} = ${a.n * k}. ${a.n * k === b.n ? 'That is the numerator too.' : `The numerator is ${b.n}, not ${a.n * k}.`}` : `So ${fr(a.n, a.d)} and ${fr(b.n, b.d)} are not the same size.`),
                step(`Write ${s} in the circle.`, [{ slot: 'sign', value: s }]),
            ]);
        }
        const { x, y, k, up } = factorOf(p);
        const miss = y.frac === 'n' ? 'n' : 'd';
        const op = up ? '×' : '÷';
        const verb = up ? 'Multiply' : 'Divide';
        const known = miss === 'n' ? `${x.d} ${op} ${k} = ${y.d}` : `${x.n} ${op} ${k} = ${y.n}`;
        return clampSteps([
            step(`${known}: ${up ? 'multiplied' : 'divided'} by ${k}.`, p.arcs ? [{ slot: 'arc-top', value: String(k) }, { slot: 'arc-bottom', value: String(k) }] : []),
            step(miss === 'n' ? `${verb} the numerator by ${k} too: ${x.n} ${op} ${k} = ${y.n}.` : `${verb} the denominator by ${k} too: ${x.d} ${op} ${k} = ${y.d}.`),
            step(`${fr(x.n, x.d)} = ${fr(y.n, y.d)}. Write ${miss === 'n' ? y.n : y.d}.`, [{ slot: miss, value: String(miss === 'n' ? y.n : y.d) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        if (p.task === 'sign') {
            const s = p.answer.sign;
            return chooseWrong(q, [{ value: s === '=' ? '≠' : '=', misconception: 'said-equal', slot: 'sign', slots: { sign: s === '=' ? '≠' : '=' },
                explain: s === '=' ? 'Said they are not equal because the numbers are different.' : 'Said they are equal without multiplying both parts by one number.' }]);
        }
        const { x, y, up } = factorOf(p);
        const miss = y.frac === 'n' ? 'n' : 'd';
        const add = miss === 'n' ? x.n + (y.d - x.d) : x.d + (y.n - x.n);
        const right = miss === 'n' ? y.n : y.d;
        return chooseWrong(q, [
            add > 0 && add !== right ? { value: add, misconception: 'added-same-number', slot: miss, slots: { [miss]: String(add) },
                explain: up ? 'Added the same number to top and bottom. Multiply both by the same number instead.' : 'Took the same number off top and bottom. Divide both by the same number instead.' } : null,
            { value: miss === 'n' ? x.n : x.d, misconception: 'only-one-multiplied', slot: miss, slots: { [miss]: String(miss === 'n' ? x.n : x.d) },
                explain: up ? 'Kept the number the same: only one part was multiplied.' : 'Kept the number the same: only one part was divided.' },
        ]);
    },
};
registerSkill('fractions:equivalent', EQUIV_DEF);
registerSkill('fractions:equiv_frac_nv', { ...EQUIV_DEF, strings: strings({
    iCan: 'I Can find equivalent fractions without pictures',
    instructionKey: 'missing',
    steps: ['Look at the two numbers you know on the top or the bottom: what are they multiplied or divided by?', 'Do the same to the other part.', 'Write the missing number.'],
    say: '__ is equal to __.',
    sayValues: (q) => { const p = payloadOf(q); return p && p.task === 'op' ? [fr(p.terms[0].n, p.terms[0].d), fr(p.answer.n, p.answer.d)] : null; },
    vocabulary: ['equivalent', 'numerator', 'denominator', 'multiply', 'divide'],
}) });

registerSkill('fractions:simplify', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can write a fraction in simplest form',
        instructionKey: 'simplest-form',
        steps: ['Find the greatest number that divides the numerator and the denominator.', 'Divide both by it.', 'Check: only 1 divides both now.'],
        say: '__ in simplest form is __.',
        sayValues: (q) => { const p = payloadOf(q); return p && p.terms[0].frac !== 'text' ? [fr(p.terms[0].n, p.terms[0].d), fr(p.answer.n, p.answer.d)] : null; },
        vocabulary: ['simplest form', 'common factor', 'divide'],
    }),
    misconceptions: ['not-fully-simplified', 'divided-one-part', 'factor-not-gcf'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        if (p.terms[0].frac === 'text') {
            const m = /of (\d+) and (\d+)/.exec((p.story || []).join(' ')) || [];
            const a = Number(m[1]), b = Number(m[2]), g = p.answer.w;
            return clampSteps([
                step(`List the factors of ${a} and of ${b}.`),
                step(`The biggest number in both lists is ${g}.`),
                step(`Write ${g}.`, [{ slot: 'w', value: String(g) }]),
            ]);
        }
        const [x] = p.terms, a = p.answer;
        const g = x.n / a.n;
        if (g === 1) {
            return clampSteps([
                step(`Which numbers divide both ${x.n} and ${x.d}? Only 1.`),
                step(`So ${fr(x.n, x.d)} is already in simplest form.`),
                step(`Write ${fr(a.n, a.d)}.`, [{ slot: 'n', value: String(a.n) }, { slot: 'd', value: String(a.d) }]),
            ]);
        }
        return clampSteps([
            step(`The greatest number that divides ${x.n} and ${x.d} is ${g}.`, p.arcs ? [{ slot: 'arc-top', value: String(g) }, { slot: 'arc-bottom', value: String(g) }] : []),
            step(`${x.n} ÷ ${g} = ${a.n} and ${x.d} ÷ ${g} = ${a.d}.`),
            step(`Write ${fr(a.n, a.d)}.`, [{ slot: 'n', value: String(a.n) }, { slot: 'd', value: String(a.d) }]),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        if (p.terms[0].frac === 'text') {
            const g = p.answer.w;
            return chooseWrong(q, [g % 2 === 0 && g > 2 ? { value: 2, misconception: 'factor-not-gcf', slot: 'w', slots: { w: '2' }, explain: '2 is a common factor, but not the greatest.' } : null,
                { value: 1, misconception: 'factor-not-gcf', slot: 'w', slots: { w: '1' }, explain: '1 divides every number: look for a bigger common factor.' }]);
        }
        const [x] = p.terms, a = p.answer;
        const g = x.n / a.n;
        const c = [];
        if (g % 2 === 0 && g > 2) c.push({ value: fr(x.n / 2, x.d / 2), misconception: 'not-fully-simplified', slot: 'n', slots: { n: String(x.n / 2), d: String(x.d / 2) }, explain: 'Divided by 2 and stopped: it can be simplified again.' });
        if (g > 1) c.push({ value: fr(a.n, x.d), misconception: 'divided-one-part', slot: 'd', slots: { n: String(a.n), d: String(x.d) }, explain: `Divided the numerator only. Divide the denominator by ${g} too.` });
        return chooseWrong(q, c);
    },
});

/* ==================================================================== count in fractions */

registerSkill('fractions:count_in_fractions', {
    strings: strings({
        iCan: 'I Can count in fractions',
        instructionKey: 'missing-many',
        steps: ['Each step is one unit fraction: the numerator goes up by 1.', 'When the numerator equals the denominator, you have 1 whole.', 'Keep counting past the whole.'],
        say: '__, __, __ ...',
        sayValues: (q) => {
            const p = payloadOf(q);
            if (!p || p.task !== 'count') return null;
            const txt = (t) => (t.frac === 'text' ? t.text : mixedText(t.w, t.n, t.d));
            return p.terms.slice(0, 3).map((t) => (t.ai === undefined ? txt(t) : ((p.answer.terms || [])[t.ai] ? mixedText(p.answer.terms[t.ai].w, p.answer.terms[t.ai].n, p.answer.terms[t.ai].d) : ''))).join(', ') + ' ...';
        },
        vocabulary: ['unit fraction', 'whole', 'count on', 'count back'],
    }),
    misconceptions: ['added-to-denominator', 'did-not-name-whole', 'counted-wrong-way'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'count') return [];
        const d = p.terms[0].d;
        const back = p.mode === 3;
        const marks = [];
        p.terms.forEach((t) => {
            if (t.ai === undefined) return;
            const a = p.answer.terms[t.ai];
            if (/w/.test(t.frac) && a.w) marks.push({ slot: `w${t.ai}`, value: String(a.w) });
            if (/n/.test(t.frac) && (t.frac !== 'wnd' || a.n)) marks.push({ slot: `n${t.ai}`, value: String(a.n) });
            if (/d/.test(t.frac) && (t.frac !== 'wnd' || a.n)) marks.push({ slot: `d${t.ai}`, value: String(a.d) });
        });
        return clampSteps([
            step(`Each step is ${fr(1, d)}. The numerator goes ${back ? 'down' : 'up'} by 1; the denominator stays ${d}.`),
            step(p.mode === 1 ? `${fr(d, d)} is 1 whole; after it come ${fr(d + 1, d)}, ${fr(d + 2, d)} ...` : `${fr(d, d)} is 1 whole: write 1. After 1 comes 1 ${fr(1, d)}.`),
            step(`Write the missing counts: ${p.answer.text}.`, marks),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p || p.task !== 'count') return null;
        const ans = p.answer.terms;
        // the commonest slip: the denominator counted up too (1/4, 1/5, 1/6)
        const slots = {};
        const vals = [];
        let changed = false;
        p.terms.forEach((t) => {
            if (t.ai === undefined) return;
            const a = ans[t.ai];
            if (t.frac === 'nd' && a.d) {
                const wd = a.d + t.ai + 1;
                slots[`n${t.ai}`] = String(a.n); slots[`d${t.ai}`] = String(wd); vals.push(`${a.n}/${wd}`); changed = true;
            } else vals.push(mixedText(a.w, a.n, a.d));
        });
        const c = [];
        if (changed) c.push({ value: vals.join(', '), misconception: 'added-to-denominator', slot: Object.keys(slots)[1] || 'd0', slots,
            explain: 'Counted the denominator up too. The parts stay the same size: only the numerator counts.' });
        // a whole written as a fraction on the mixed ladder: 4/4 left as 4/4 instead of 1
        const wi = p.terms.find((t) => t.frac === 'w' && t.ai !== undefined);
        if (wi) {
            const a = ans[wi.ai];
            const v2 = ans.map((x, i) => (i === wi.ai ? `${a.w * a.d}/${a.d}` : mixedText(x.w, x.n, x.d)));
            c.push({ value: v2.join(', '), misconception: 'did-not-name-whole', slot: `w${wi.ai}`, slots: { [`w${wi.ai}`]: `${a.w * a.d}/${a.d}` },
                explain: `Wrote ${a.w * a.d}/${a.d} where the count reaches ${a.w} whole${a.w > 1 ? 's' : ''}: name the whole number.` });
        }
        return chooseWrong(q, c);
    },
});

/* ==================================================================== fractions beyond 1 */

registerSkill('fractions:mixed_numbers_intro', {
    open: fracOpen,
    strings: strings({
        iCan: 'I Can write numbers bigger than 1 with fractions',
        instructionKey: 'missing',
        steps: ['Count the wholes first.', 'Then count the parts of the next whole.', 'Write the wholes, then the fraction.'],
        say: '__ wholes and __ is __.',
        sayValues: (q) => {
            const p = payloadOf(q);
            if (!p) return null;
            const t = p.terms[0];
            return [t.w, fr(t.n, t.d), mixedText(t.w, t.n, t.d)];
        },
        vocabulary: ['mixed number', 'whole', 'part'],
    }),
    misconceptions: ['counted-all-parts', 'whole-as-numerator', 'parts-of-wrong-whole'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!p) return [];
        const t = p.terms[0];
        if (p.task === 'op') {
            return clampSteps([
                step(`${mixedText(t.w, t.n, t.d)} means ${t.w} whole${t.w > 1 ? 's' : ''} and ${fr(t.n, t.d)} more.`),
                step(`The wholes: ${t.w}.`, [{ slot: 'w0', value: String(t.w) }]),
                step(`The fraction: ${fr(t.n, t.d)}. ${mixedText(t.w, t.n, t.d)} = ${t.w} + ${fr(t.n, t.d)}.`, [{ slot: 'w0', value: String(t.w) }, { slot: 'n1', value: String(t.n) }]),
            ]);
        }
        const marks = [{ slot: 'w', value: String(t.w) }, { slot: 'n', value: String(t.n) }, { slot: 'd', value: String(t.d) }];
        if (t.kind === 'line') {
            return clampSteps([
                step(`The dot is past ${t.w}: that is the whole number.`),
                step(`Each whole is cut into ${t.d} equal parts. Count the parts from ${t.w} to the dot: ${t.n}.`),
                step(`Write ${mixedText(t.w, t.n, t.d)}.`, marks),
            ]);
        }
        return clampSteps([
            step(`Count the whole shapes: ${t.w}.`),
            step(`The last shape has ${t.n} of its ${t.d} parts shaded: ${fr(t.n, t.d)}.`),
            step(`Write ${mixedText(t.w, t.n, t.d)}.`, marks),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!p) return null;
        const t = p.terms[0];
        if (p.task === 'op') {
            return chooseWrong(q, [{ value: `${t.w * t.d + t.n} + ${fr(t.n, t.d)}`, misconception: 'whole-as-numerator', slot: 'w0', slots: { w0: String(t.w * t.d + t.n), n1: String(t.n) },
                explain: `Wrote all the parts as the whole number. The wholes are ${t.w}.` }]);
        }
        const total = t.w * t.d + t.n;
        return chooseWrong(q, [
            { value: `${t.w} ${fr(total, t.d)}`, misconception: 'counted-all-parts', slot: 'n', slots: { w: String(t.w), n: String(total), d: String(t.d) }, explain: `Counted every part (${total}) for the fraction. Only the parts after the wholes count: ${t.n}.` },
            t.w > 1 ? { value: `${t.w - 1} ${fr(t.n, t.d)}`, misconception: 'parts-of-wrong-whole', slot: 'w', slots: { w: String(t.w - 1), n: String(t.n), d: String(t.d) }, explain: `Counted one whole too few.` } : null,
        ]);
    },
});
