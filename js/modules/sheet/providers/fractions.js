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
    if (t.d - t.n > 0 && !lineModel(t)) c.push({ value: fr(t.n, t.d - t.n), misconception: 'part-over-part', slot: 'd', slots: { n: String(t.n), d: String(t.d - t.n) },
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
    strings: strings(WRITE_DEF),
    misconceptions: ['counted-unshaded', 'part-over-part', 'counted-ticks'],
    workedSteps: writeSteps,
    wrongAnswer: writeWrong,
});

registerSkill('fractions:identify', {
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
