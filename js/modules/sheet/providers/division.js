// js/modules/sheet/providers/division.js
// Skill providers for division: div_facts, long_div_2digit, div_remainders, share_into_groups.
//
// The critic's re-grade of 2026-09-25 found times-fact steps ("Think of the times fact. Find the
// missing factor.") on the two RINGING skills, and remainder skills whose steps never mention the
// remainder. Here the picture skills ring groups, the remainder skill counts the left-overs and
// checks them against the divisor, and long division works digit by digit.

import { registerSkill } from '../contract.js';
import { num, obj, fmt, operands, countList, digitsOf, chooseWrong, strings, step, clampSteps } from './util.js';
import { storiesFor } from './stories.js';

/* ============================================================================ div_facts */

registerSkill('division:div_facts', {
    strings: strings({
        iCan: 'I Can divide using times facts',
        instructionKey: 'divide',
        // Critic round 2: a missing-factor frame is easier to read than a "times what" question,
        // and skip counting to 121 by 11 is not practical - the times fact is the strategy.
        steps: [
            'Read the division: 24 ÷ 6.',
            'Write the times fact with a gap: 6 × __ = 24.',
            'Find the missing factor. It is the answer.',
        ],
        say: '__ divided by __ equals __.',
    }),
    misconceptions: ['subtracted', 'off-by-one-group'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return [];
        const quo = a / b;
        return [
            step(`Read the division: ${a} ÷ ${b}.`),
            step(`Write the times fact with a gap: ${b} × __ = ${a}.`),
            step(`${b} × ${quo} = ${a}, so the missing factor is ${quo}.`),
            step(`Write ${quo}.`, [{ slot: 'ans', value: String(quo) }]),
        ];
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return null;
        return chooseWrong(q, [
            { value: a - b, misconception: 'subtracted', slot: 'ans', explain: 'Subtracted instead of dividing.' },
            { value: a / b + 1, misconception: 'off-by-one-group', slot: 'ans', explain: 'Skip counted one time too many.' },
        ]);
    },
    stories: storiesFor('÷'),
});

/* ====================================================================== long_div_2digit */

/**
 * Long division of whole numbers, digit by digit: divide, multiply, subtract, bring down.
 * Returns the steps and the quotient digits (with the place each is written over).
 */
export function longDivision(a, b) {
    const digits = digitsOf(a).reverse();
    const steps = [];
    let part = 0;
    let started = false;
    const qDigits = [];
    for (let i = 0; i < digits.length; i++) {
        part = part * 10 + digits[i];
        const brought = i > 0 && started;
        if (!started && part < b && i < digits.length - 1) continue;
        started = true;
        const d = Math.floor(part / b);
        const m = d * b;
        const rem = part - m;
        qDigits.push(d);
        const lead = brought ? `Bring down ${digits[i]}: ${fmt(part)}. ` : '';
        const text = d === 0
            ? `${lead}${fmt(part)} ÷ ${b}: ${b} does not fit. Write 0.`
            : `${lead}${fmt(part)} ÷ ${b} = ${d}. ${d} × ${b} = ${fmt(m)}. ${fmt(part)} − ${fmt(m)} = ${fmt(rem)}.`;
        steps.push(step(text, [{ slot: `q${qDigits.length - 1}`, value: String(d) }]));
        part = rem;
    }
    const quotient = num(qDigits.join('')) || 0;
    return { steps, quotient, remainder: part, qDigits };
}

registerSkill('division:long_div_2digit', {
    strings: strings({
        iCan: 'I Can divide by a two-digit number',
        instructionKey: 'divide',
        steps: [
            'Divide: how many times does the divisor fit?',
            'Multiply that digit by the divisor.',
            'Subtract. Then bring down the next digit.',
            'Divide again until no digits are left.',
        ],
        say: '__ divided by __ equals __.',
    }),
    misconceptions: ['estimate-too-low', 'estimate-too-high', 'left-out-zero'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return [];
        const L = longDivision(a, b);
        const out = [step(`Can ${b} go into the first digits of ${fmt(a)}? Start there.`)].concat(L.steps);
        out.push(step(`The quotient is ${fmt(L.quotient)}${L.remainder ? ` R ${L.remainder}` : ''}.`, [{ slot: 'answer', value: String(L.quotient) }]));
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return null;
        const L = longDivision(a, b);
        const c = [];
        const qs = String(L.quotient);
        if (/0/.test(qs.slice(1))) {
            c.push({ value: num(qs.replace(/(?!^)0/g, '')), misconception: 'left-out-zero',
                explain: 'Did not write 0 in the quotient when the divisor did not fit.' });
        }
        if (L.quotient > 1) {
            c.push({ value: L.quotient - 1, misconception: 'estimate-too-low', slot: 'answer',
                slots: { answer: String(L.quotient - 1), remainder: String(L.remainder + b) },
                explain: `The last digit is too small: the remainder ${L.remainder + b} is not less than ${b}.` });
        }
        c.push({ value: L.quotient + 1, misconception: 'estimate-too-high', slot: 'answer',
            explain: `The last digit is too big: ${L.quotient + 1} × ${b} is more than ${fmt(a)}.` });
        return chooseWrong(q, c, { rotate: false });
    },
    stories: storiesFor('÷'),
});

/* ======================================================================= div_remainders */

function qr(q) {
    const d = obj(q.quotientRemainder);
    if (d && Number.isFinite(num(d.quotient))) return { quo: num(d.quotient), rem: num(d.remainder) || 0 };
    const m = /(\d+)\s*R\s*(\d+)/i.exec(String(q.ans || ''));
    if (m) return { quo: num(m[1]), rem: num(m[2]) };
    const [a, b] = operands(q);
    return Number.isFinite(a) && Number.isFinite(b) && b ? { quo: Math.floor(a / b), rem: a % b } : null;
}

const qrText = (quo, rem) => `${quo} R ${rem}`;

registerSkill('division:div_remainders', {
    strings: strings({
        iCan: 'I Can divide and find the remainder',
        instructionKey: 'ring-remainder',
        instructionVars: (q) => ({ n: operands(q)[1] }),
        steps: [
            'Circle groups of the divisor.',
            'Count the groups. That is the quotient.',
            'Count the ones left over. That is the remainder.',
            'Check: the remainder is less than the divisor.',
        ],
        say: '__ divided by __ equals __, remainder __.',
        sayValues: (q) => { const [a, b] = operands(q); const r = qr(q); return r ? [a, b, r.quo, r.rem] : null; },
    }),
    misconceptions: ['remainder-too-big', 'ignored-remainder', 'remainder-as-quotient'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        const r = qr(q);
        if (!r || !Number.isFinite(a) || !Number.isFinite(b)) return [];
        return [
            step(`Circle groups of ${b}: ${r.quo} ${r.quo === 1 ? 'group' : 'groups'}.`, [{ slot: 'quotient', value: String(r.quo) }]),
            step(`Count the ones left over: ${r.rem}.`, [{ slot: 'remainder', value: String(r.rem) }]),
            step(`Check: ${r.rem} is less than ${b}.`),
            step(`${r.quo} × ${b} = ${r.quo * b}. ${r.quo * b} + ${r.rem} = ${a}.`),
            step(`Write ${qrText(r.quo, r.rem)}.`, [{ slot: 'answer', value: qrText(r.quo, r.rem) }]),
        ];
    },
    wrongAnswer: (q) => {
        const [, b] = operands(q);
        const r = qr(q);
        if (!r || !Number.isFinite(b)) return null;
        const c = [];
        if (r.quo >= 1) {
            c.push({ value: qrText(r.quo - 1, r.rem + b), misconception: 'remainder-too-big', slot: 'remainder',
                slots: { quotient: String(r.quo - 1), remainder: String(r.rem + b) },
                explain: `The remainder ${r.rem + b} is not less than ${b}: one more group fits.` });
        }
        if (r.rem > 0) {
            c.push({ value: qrText(r.quo, 0), misconception: 'ignored-remainder', slot: 'remainder',
                slots: { remainder: '0' }, explain: `Left out the ${r.rem} left over.` });
        }
        if (r.rem !== r.quo) {
            c.push({ value: qrText(r.rem, r.quo), misconception: 'remainder-as-quotient', slot: 'quotient',
                slots: { quotient: String(r.rem), remainder: String(r.quo) }, explain: 'Swapped the quotient and the remainder.' });
        }
        return chooseWrong(q, c);
    },
    stories: storiesFor('÷', { remainder: true }),
});

/* ==================================================================== share_into_groups */

registerSkill('division:share_into_groups', {
    strings: strings({
        iCan: 'I Can make equal groups to divide',
        instructionKey: 'ring-groups',
        instructionVars: (q) => ({ n: operands(q)[1] }),
        steps: [
            'Circle one group. Count the counters in it.',
            'Circle the next group. Use each counter only once.',
            'Stop when no counters are left.',
            'Count the circles. Write how many groups.',
        ],
        say: '__ in groups of __ makes __ groups.',
        // Critic round 2: the rings link to dividing through the number sentence under them.
        sentence: (q) => {
            const [a, b] = operands(q);
            if (!Number.isFinite(a) || !Number.isFinite(b) || !b || a % b) return null;
            return { parts: [String(a), '÷', String(b), '=', String(a / b)], blanks: [0, 2, 4] };
        },
    }),
    misconceptions: ['wrote-group-size', 'counted-counters', 'one-group-short'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return [];
        const g = a / b;
        return [
            step(`Circle ${b} counters. That is group 1.`, [{ slot: 'ring:1', value: String(b) }]),
            step(`Circle ${b} more, and ${b} more, until none are left.`, [{ slot: 'ring:all', value: String(g) }]),
            step(`Count the circles: ${countList(1, g)}.`),
            step(`${a} in groups of ${b} makes ${g} groups. Write ${g}.`, [{ slot: 'answer', value: String(g) }]),
        ];
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return null;
        const g = a / b;
        return chooseWrong(q, [
            { value: b, misconception: 'wrote-group-size', explain: 'Wrote how many are in one group, not how many groups.' },
            { value: g - 1, misconception: 'one-group-short', explain: 'Missed the last group.' },
            { value: a, misconception: 'counted-counters', explain: 'Counted all the counters, not the groups.' },
        ].filter((c) => c.value > 0));
    },
    // Critic round 2: the skill is GROUPING (how many groups), so its stories are too.
    stories: storiesFor('÷', { grouping: true }),
});
