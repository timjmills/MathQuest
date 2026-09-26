// js/modules/sheet/providers/integers.js
// Skill providers for the operations lane's integer skills (design/BUILD_LIST.md, lane
// operations): integers:count_through_zero.
//
// Each item carries its own plain data (q.ctz, written by js/modules/gen-ops-build.js); the
// provider reads only that, so the same item always gets the same steps and the same wrong answer.
//
// The misconceptions are the real ones for counting through zero (research notes, 2026-09-26,
// and the build list): counting 2, 1, 0, 1, 2 (no negatives: the sizes mirror but the sign is
// dropped), jumping from 1 to −1 (zero is skipped), going the wrong way on a temperature change,
// finding the distance from −3 to 4 as 4 − 3 = 1 (the sizes subtracted), writing a quantity
// below zero without its sign, and reading −7 as bigger than −3 because 7 > 3.
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { obj, chooseWrong, strings, step, clampSteps } from './util.js';

const neg = (v) => (Number(v) < 0 ? `−${Math.abs(Number(v))}` : String(v));
const ctzOf = (q) => obj(q && q.ctz);

/** A `strings` member whose library key depends on the item (or, with no item, the section's options). */
function stringsBy(pick) {
    const fn = (ref = {}) => strings(pick(ref && ref.q, ref || {}))(ref);
    fn.def = pick(null, {});
    return fn;
}

const CTZ_STRINGS = {
    fill: {
        iCan: 'I Can count through zero',
        instructionKey: 'line-fill',
        steps: ['Find 0 on the line.', 'Each mark is one step more to the right.',
            'Left of 0 the numbers get a minus sign.', 'Write the number for each box.'],
        say: 'I count __, __, __.',
    },
    temp: {
        iCan: 'I Can find the temperature after a change',
        instructionKey: 'temp-now',
        steps: ['Find the start on the thermometer.', 'Warmer: count up. Colder: count down.',
            'Count one step at a time, through 0.', 'Write where you stop.'],
        say: 'It was __. Now it is __.',
    },
    diff: {
        iCan: 'I Can find how far apart numbers are across zero',
        instructionKey: 'line-apart',
        steps: ['Count from the first number up to 0.', 'Count from 0 up to the second number.',
            'Add the two counts.', 'Write how far apart they are.'],
        say: 'From __ to __ is __.',
    },
    write: {
        iCan: 'I Can write numbers above and below zero',
        instructionKey: 'sign-number',
        steps: ['Read what 0 means.', 'Above 0 is a positive number.',
            'Below 0 is a negative number: write the minus sign.', 'Write the number.'],
        say: 'The number is __.',
    },
    compare: {
        iCan: 'I Can compare numbers below zero',
        instructionKey: 'sign-compare',
        steps: ['Find both numbers on the line.', 'The one further up or right is greater.',
            'Warmer means greater: write >.', 'Colder means less: write <.'],
        say: '__ is greater than __.',
    },
};

/** The kinds a section deals, from its options (forms 0-4), for a page without an item. */
const KINDS = ['fill', 'temp', 'diff', 'write', 'compare'];
const kindsOf = (opts) => {
    const f = opts && Array.isArray(opts.forms) ? opts.forms.filter((i) => KINDS[i]) : [0];
    return f.length ? f.map((i) => KINDS[i]) : ['fill'];
};

registerSkill('integers:count_through_zero', {
    strings: stringsBy((q, ref = {}) => {
        const d = q ? ctzOf(q) : null;
        const kinds = kindsOf(ref.opts || {});
        // one instruction for a section of one kind; a mixed section says what every cell shares
        const mixed = !d && kinds.length > 1;
        const kind = d ? d.kind : kinds[0];
        const base = CTZ_STRINGS[kind] || CTZ_STRINGS.fill;
        return {
            // L6: the title says what the page does; a mixed page says it all
            iCan: mixed ? 'I Can count and compare through zero' : base.iCan,
            instructionKey: mixed ? 'line-each' : base.instructionKey,
            steps: base.steps,
            say: base.say,
            stepsFor: (item) => stepsOf(item),
            sayValues: (item) => sayOf(item),
        };
    }),
    misconceptions: ['no-negatives', 'skipped-zero', 'wrong-direction', 'sizes-subtracted', 'counted-ticks', 'sign-dropped', 'size-not-value'],
    workedSteps: (q) => {
        const d = ctzOf(q);
        if (!d) return [];
        if (d.kind === 'fill') {
            const order = d.orient === 'v' ? d.blanks.slice().reverse() : d.blanks;
            const marks = order.map((v, i) => ({ slot: `b${i}`, value: neg(v) }));
            return clampSteps([
                step(`Find 0. Each mark is ${d.step} more going ${d.orient === 'v' ? 'up' : 'right'}.`),
                step(`${d.orient === 'v' ? 'Below' : 'Left of'} 0: ${neg(-d.step)}, ${neg(-2 * d.step)}. ${d.orient === 'v' ? 'Above' : 'Right of'} 0: ${d.step}, ${2 * d.step}.`),
                step(`Write ${neg(order[0])} in the first box.`, marks.slice(0, 1)),
                step('Write the other boxes the same way.', marks),
            ]);
        }
        if (d.kind === 'temp') {
            const dir = d.change < 0 ? 'down' : 'up';
            const toZero = Math.abs(d.start);
            const rest = Math.abs(d.change) - toZero;
            return clampSteps([
                step(`Start at ${neg(d.start)} °C.`),
                step(`Count ${dir} ${toZero} to 0.`),
                step(rest > 0 ? `Count ${dir} ${rest} more: ${neg(d.end)}.` : 'That is the whole change: 0.'),
                step(`Write ${neg(d.end)}.`, [{ slot: 'answer', value: neg(d.end) }]),
            ]);
        }
        if (d.kind === 'diff') {
            return clampSteps([
                step(`From ${neg(d.a)} up to 0 is ${Math.abs(d.a)}.`),
                step(`From 0 up to ${neg(d.b)} is ${d.b}.`),
                step(`${Math.abs(d.a)} + ${d.b} = ${d.b - d.a}.`),
                step(`Write ${d.b - d.a}.`, [{ slot: 'answer', value: String(d.b - d.a) }]),
            ]);
        }
        if (d.kind === 'write') {
            return clampSteps([
                step('Read what 0 means.'),
                step(d.down ? 'Below 0: a negative number.' : 'Above 0: a positive number.'),
                step(`Write ${neg(d.value)}.`, [{ slot: 'answer', value: neg(d.value) }]),
            ]);
        }
        const sign = d.warmer ? '>' : '<';
        return clampSteps([
            step(`Find ${neg(d.a)} and ${neg(d.b)} on the line.`),
            step(`${neg(Math.max(d.a, d.b))} is further up: it is greater.`),
            step(d.warmer ? 'Warmer is greater: write >.' : 'Colder is less: write <.', [{ slot: 'answer', value: sign }]),
        ]);
    },
    wrongAnswer: (q) => {
        const d = ctzOf(q);
        if (!d) return null;
        if (d.kind === 'fill') {
            const order = d.orient === 'v' ? d.blanks.slice().reverse() : d.blanks;
            const c = [];
            // no negatives: the sizes written without the sign (2, 1, 0, 1, 2)
            if (order.some((v) => v < 0)) {
                const w = order.map((v) => neg(Math.abs(v)));
                const k = order.findIndex((v) => v < 0);
                c.push({ value: w.join(', '), misconception: 'no-negatives', slot: `b${k}`, slots: { [`b${k}`]: w[k] },
                    explain: `Wrote ${w[k]} for ${neg(order[k])}: below zero the numbers are negative.` });
            }
            // skipped zero: every number below zero one step further out (1, −1, −2 ...)
            if (order.some((v) => v < 0)) {
                const w = order.map((v) => neg(v < 0 ? v - d.step : v));
                const k = order.findIndex((v) => v < 0);
                c.push({ value: w.join(', '), misconception: 'skipped-zero', slot: `b${k}`, slots: { [`b${k}`]: w[k] },
                    explain: `Jumped over 0: wrote ${w[k]}, not ${neg(order[k])}.` });
            }
            return chooseWrong(q, c);
        }
        if (d.kind === 'temp') {
            const c = [
                { value: neg(d.start - d.change), misconception: 'wrong-direction', explain: `Counted the wrong way: ${d.change < 0 ? 'colder' : 'warmer'} is ${d.change < 0 ? 'down' : 'up'}.` },
                { value: neg(Math.abs(d.end)), misconception: 'sign-dropped', explain: 'Left out the minus sign below zero.' },
            ];
            return chooseWrong(q, c);
        }
        if (d.kind === 'diff') {
            return chooseWrong(q, [
                { value: String(Math.abs(d.b - Math.abs(d.a))), misconception: 'sizes-subtracted', explain: `Took ${Math.min(d.b, Math.abs(d.a))} from ${Math.max(d.b, Math.abs(d.a))}: count through 0 instead.` },
                { value: String(d.b - d.a + d.step), misconception: 'counted-ticks', explain: 'Counted the ticks, not the steps between them.' },
            ]);
        }
        if (d.kind === 'write') {
            return chooseWrong(q, [{ value: neg(-d.value), misconception: 'sign-dropped', explain: d.down ? 'Below zero needs a minus sign.' : 'Above zero is positive: no minus sign.' }]);
        }
        return chooseWrong(q, [{ value: d.warmer ? '<' : '>', misconception: 'size-not-value', explain: `Compared ${Math.abs(d.a)} and ${Math.abs(d.b)} without the signs.` }]);
    },
});

/** The Steps band for the page's own first item. */
function stepsOf(q) {
    const d = ctzOf(q);
    if (!d) return null;
    const base = (CTZ_STRINGS[d.kind] || CTZ_STRINGS.fill).steps.slice();
    if (d.kind === 'fill') {
        base[1] = `Each mark is ${d.step} more going ${d.orient === 'v' ? 'up' : 'right'}.`;
        if (d.orient === 'v') base[2] = 'Below 0 the numbers get a minus sign.';
    }
    if (d.kind === 'temp') base[0] = `Find ${neg(d.start)} on the thermometer.`;
    if (d.kind === 'diff') { base[0] = `Count from ${neg(d.a)} up to 0.`; base[1] = `Count from 0 up to ${neg(d.b)}.`; }
    return base;
}

/** The Say line's values for one item. */
function sayOf(q) {
    const d = ctzOf(q);
    if (!d) return null;
    if (d.kind === 'fill') {
        const order = d.orient === 'v' ? d.blanks.slice().reverse() : d.blanks;
        return order.slice(0, 3).map(neg);
    }
    if (d.kind === 'temp') return [`${neg(d.start)} °C`, `${neg(d.end)} °C`];
    if (d.kind === 'diff') return [neg(d.a), neg(d.b), String(d.b - d.a)];
    if (d.kind === 'write') return [neg(d.value)];
    const hi = Math.max(d.a, d.b), lo = Math.min(d.a, d.b);
    return [neg(hi), neg(lo)];
}
