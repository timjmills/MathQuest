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

/** An expression kept on one line: its spaces made non-breaking. */
const nb = (t) => String(t).replace(/ /g, '\u00a0');

registerSkill('division:div_facts', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'skip', 'array', 'think', 'boxsign']),
    strings: strings({
        iCan: 'I Can divide using times facts',
        instructionKey: 'divide',
        // Critic round 2: a missing-factor frame is easier to read than a "times what" question,
        // and skip counting to 121 by 11 is not practical - the times fact is the strategy.
        // Critic R1 D12: the page-wide steps carry no numbers of their own (they printed "24 ÷ 6"
        // beside a Model of 12)24); an expression never breaks across lines (NBSP inside it).
        steps: [
            'Read the division.',
            'Write the times fact with a gap.',
            'Find the missing factor. It is the answer.',
        ],
        stepsFor: (q) => {
            const [a, b] = operands(q);
            if (!Number.isInteger(a) || !Number.isInteger(b) || !b || a % b) return null;
            return [`Read the division: ${nb(`${a} ÷ ${b}`)}.`, `Write the times fact with a gap: ${nb(`${b} × __ = ${a}`)}.`,
                'Find the missing factor. It is the answer.'];
        },
        say: '__ divided by __ equals __.',
    }),
    misconceptions: ['subtracted', 'off-by-one-group'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return [];
        const quo = a / b;
        return [
            step(`Read the division: ${nb(`${a} ÷ ${b}`)}.`),
            step(`Write the times fact with a gap: ${nb(`${b} × __ = ${a}`)}.`),
            step(`${nb(`${b} × ${quo} = ${a}`)}, so the missing factor is ${quo}.`),
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
    // R3: most 2-digit divisions leave a remainder; without remainder stories the Word problems
    // page found one story in a pool and printed it alone on the page (H5).
    stories: storiesFor('÷', { remainder: true }),
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
        iCan: 'I Can divide with remainders',
        instructionKey: 'ring-remainder',
        instructionVars: (q) => ({ n: operands(q)[1] }),
        steps: [
            'Circle a group. Count the counters in it.',
            'Count the groups. That is the answer.',
            'Count the ones left over. That is the remainder.',
            'Check: the remainder is less than one group.',
        ],
        // R3: the Steps band names the model's own group size, never the word "divisor".
        stepsFor: (q) => {
            const [, b] = operands(q);
            if (!Number.isInteger(b) || b < 1) return null;
            return [`Circle groups of ${b}.`, 'Count the groups. That is the answer.',
                'Count the ones left over. That is the remainder.', `Check: the remainder is less than ${b}.`];
        },
        say: '__ divided by __ equals __, remainder __.',
        sayValues: (q) => { const [a, b] = operands(q); const r = qr(q); return r ? [a, b, r.quo, r.rem] : null; },
    }),
    misconceptions: ['remainder-too-big', 'ignored-remainder', 'remainder-as-quotient'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        const r = qr(q);
        if (!r || !Number.isFinite(a) || !Number.isFinite(b)) return [];
        return [
            // Guided fade (critic guided-r1): the first step is the action alone, so a first try's
            // grey hint ("Circle groups of 5.") never holds the quotient.
            step(`Circle groups of ${b}.`),
            step(`Count the groups: ${r.quo}.`, [{ slot: 'quotient', value: String(r.quo) }]),
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
        // R3 (critic round 3): the "___ ÷ ___ = ___" line under the rings asked for the number of
        // groups a second time (a doubled slot, H8). The box beside "groups of" is the one answer
        // place; the division sentence is the Say: frame's job, spoken, not written twice.
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

/* ===================================================================== missing_mult_div */
// A missing factor in a × or ÷ sentence (3.OA.A.4): ___ × 6 = 42, 42 ÷ ___ = 7, the unknown always
// before the = sign. The kit's `equation` cell (slot 'answer') in the notation the teacher ticked.

function mmParts(q) {
    const a = Number(q.a), b = Number(q.b);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return null;
    const div = q.op === '÷' || q.op === '/';
    const d = obj(q.missingNumberData);
    const c = d && Number.isFinite(Number(d.c)) ? Number(d.c) : (div ? a / b : a * b);
    const unknown = q.missing === 'a' || q.missing === 'b' ? q.missing : 'result';
    return { a, b, c, div, unknown, ans: unknown === 'a' ? a : unknown === 'b' ? b : c };
}

registerSkill('division:missing_mult_div', {
    strings: strings({
        iCan: 'I Can find the missing number in × and ÷',
        instructionKey: 'missing',
        steps: ['Read the sign.', 'Say the times fact with a gap.', 'Find the missing number.', 'Check: say the whole fact.'],
        stepsFor: (q) => {
            const m = mmParts(q);
            if (!m) return null;
            const fact = m.div ? (m.unknown === 'a' ? `${m.b} × ${m.c} = __` : `${m.c} × __ = ${m.a}`)
                : (m.unknown === 'a' ? `__ × ${m.b} = ${m.c}` : `${m.a} × __ = ${m.c}`);
            return [`Read the sign: ${m.div ? '÷' : '×'}.`, `Say the times fact: ${nb(fact)}.`, 'Find the missing number.', 'Check: say the whole fact.'];
        },
        say: '__ times __ equals __.',
        sayValues: (q) => {
            const m = mmParts(q);
            if (!m) return null;
            return m.div ? `${m.a} divided by ${m.b} equals ${m.c}.` : `${m.a} times ${m.b} equals ${m.c}.`;
        },
    }),
    misconceptions: ['multiplied-the-numbers', 'off-by-one-group', 'divided-wrong-way'],
    workedSteps: (q) => {
        const m = mmParts(q);
        if (!m) return [];
        const { a, b, c, div, unknown, ans } = m;
        const done = step(`Write ${ans}.`, [{ slot: 'answer', value: String(ans) }]);
        if (!div) {
            const known = unknown === 'a' ? b : a;
            return [step(nb(`Think: what times ${known} is ${c}?`)), step(`Count by ${known}s to ${c}: ${ans} ${known}s.`),
                step(`Check: ${nb(`${a} × ${b} = ${c}`)}.`), done];
        }
        if (unknown === 'a') {
            return [step('The missing number is the total.'), step(`Multiply: ${nb(`${b} × ${c} = ${a}`)}.`),
                step(`Check: ${nb(`${a} ÷ ${b} = ${c}`)}.`), done];
        }
        return [step(nb(`Think: ${c} times what is ${a}?`)), step(`Count by ${c}s to ${a}: ${b} ${c}s.`),
            step(`Check: ${nb(`${a} ÷ ${b} = ${c}`)}.`), done];
    },
    wrongAnswer: (q) => {
        const m = mmParts(q);
        if (!m) return null;
        const { a, b, c, div, unknown, ans } = m;
        const cands = [];
        if (!div) cands.push({ value: (unknown === 'a' ? b : a) * c, misconception: 'multiplied-the-numbers', slot: 'answer', explain: 'Multiplied the two numbers shown.' });
        if (div && unknown === 'b') cands.push({ value: a * c, misconception: 'multiplied-the-numbers', slot: 'answer', explain: 'Multiplied the two numbers shown.' });
        if (div && unknown === 'a' && c % b === 0 && c / b !== ans) cands.push({ value: c / b, misconception: 'divided-wrong-way', slot: 'answer', explain: 'Divided the two numbers shown; the missing number is the total.' });
        cands.push({ value: unknown === 'a' && div ? ans + b : ans + 1, misconception: 'off-by-one-group', slot: 'answer', explain: 'Counted one group too many.' });
        return chooseWrong(q, cands);
    },
});

/* ================================================================= div_zero_in_quotient */
// Long division where a place of the quotient is 0 (4.NBT.B.6, M-D2 "312 ÷ 3 = 14"): the kit's
// `division` bracket with a box over every dividend digit. Steps are one place each, ≤ 10 words.

registerSkill('division:div_zero_in_quotient', {
    strings: strings({
        iCan: 'I Can write a zero in the quotient',
        instructionKey: 'divide',
        steps: ['Divide one place at a time.', 'Does the divisor not fit? Write 0.', 'Multiply, subtract, bring down the next digit.', 'Write a digit in every place.'],
        say: '__ divided by __ equals __.',
    }),
    misconceptions: ['left-out-zero', 'last-digit-off'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return [];
        const L = longDivision(a, b);
        const digits = digitsOf(a).reverse();
        const out = [];
        let part = 0, started = false, k = 0;
        for (let i = 0; i < digits.length; i++) {
            part = part * 10 + digits[i];
            if (!started && part < b && i < digits.length - 1) continue;
            const brought = started;
            started = true;
            const d = Math.floor(part / b);
            const text = d === 0
                ? (brought ? `Bring down ${digits[i]}. ${b} does not fit: write 0.` : `${b} does not fit ${part}: write 0.`)
                : `${brought ? `Bring down ${digits[i]}. ` : ''}${nb(`${part} ÷ ${b} = ${d}`)}. Subtract ${d * b}.`;
            out.push(step(text, [{ slot: `q${k}`, value: String(d) }]));
            k += 1;
            part -= d * b;
        }
        out.push(step(`Write ${fmt(L.quotient)}.`, [{ slot: 'answer', value: String(L.quotient) }]));
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !b) return null;
        const quo = Math.floor(a / b);
        const qs = String(quo);
        const c = [];
        if (/0/.test(qs.slice(1))) c.push({ value: num(qs.replace(/(?!^)0/g, '')), misconception: 'left-out-zero', explain: 'Skipped the place the divisor did not fit: no 0 written.' });
        c.push({ value: quo + 1, misconception: 'last-digit-off', explain: `The last digit is too big: ${quo + 1} × ${b} is more than ${fmt(a)}.` });
        return chooseWrong(q, c, { rotate: false });
    },
});
