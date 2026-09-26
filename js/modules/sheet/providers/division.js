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
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'skip', 'array', 'think', 'boxsign']),
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
        stepsFor: (q) => {
            const [a, b] = operands(q);
            if (!Number.isInteger(a) || !Number.isInteger(b) || !b || a % b) return null;
            return [`Read the division: ${a} ÷ ${b}.`, `Write the times fact with a gap: ${b} × __ = ${a}.`,
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

/* ============================================================ share_and_group_early (build lane) */

// Build list, lane operations, entry 2 (2026-09-26): sharing a small amount equally onto plates
// (or into rings), making equal groups, judging a share fair or not, and sharing with some left
// over. The item's own data is q.share (gen-ops-build.js). The misconceptions (research notes,
// 2026-09-26): an unequal share (one plate given more), counting the groups instead of the share
// (writing k, the number of plates), counting all the counters (writing n), and calling a share
// fair because every plate has SOME.

const shareOf = (q) => obj(q && q.share);

function shareStringsBy(pick) {
    const fn = (ref = {}) => strings(pick(ref && ref.q, ref || {}))(ref);
    fn.def = pick(null, {});
    return fn;
}

const SHARE_KINDS = ['share', 'group', 'fair', 'left'];
const SHARE_WORDS = {
    share: { iCan: 'I Can share equally', steps: ['Give one to each plate.', 'Give one more to each plate.', 'Stop when none are left.', 'Count one plate. Write how many.'], say: '__ shared between __ is __ each.' },
    group: { iCan: 'I Can make equal groups', steps: ['Circle one group.', 'Circle the next group. Use each counter once.', 'Stop when none are left.', 'Count the circles. Write how many.'], say: '__ in groups of __ makes __ groups.' },
    fair: { iCan: 'I Can tell if a share is fair', steps: ['Count the first plate.', 'Count every other plate.', 'All the same? It is fair.', 'Check one box.'], say: 'The share is __.' },
    left: { iCan: 'I Can share equally and find what is left over', steps: ['Give one to each plate.', 'Keep going while every plate can get one.', 'Count one plate. Write how many.', 'Count the ones left. Write them.'], say: '__ on each plate and __ left over.' },
};
const shareKey = (kind, look) => (kind === 'group' ? 'ring-groups' : kind === 'fair' ? 'fair-check'
    : kind === 'left' ? (look === 'rings' ? 'share-left-rings' : 'share-left') : (look === 'rings' ? 'share-rings' : 'share-plates'));

registerSkill('division:share_and_group_early', {
    strings: shareStringsBy((q, ref = {}) => {
        const d = q ? shareOf(q) : null;
        const opts = ref.opts || {};
        const forms = Array.isArray(opts.forms) && opts.forms.length ? opts.forms.filter((i) => SHARE_KINDS[i]) : [0];
        const kinds = forms.length ? forms.map((i) => SHARE_KINDS[i]) : ['share'];
        const look = d ? d.look : opts.groupLook === 'rings' ? 'rings' : 'plates';
        const mixed = !d && kinds.length > 1;
        const kind = d ? d.kind : kinds[0];
        const w = SHARE_WORDS[kind] || SHARE_WORDS.share;
        const ringWords = (s) => (look === 'rings' ? s.replace(/plate/g, 'ring') : s);
        return {
            iCan: mixed ? 'I Can share and make equal groups' : w.iCan,
            instructionKey: mixed ? 'share-mixed' : shareKey(kind, look),
            instructionVars: (item) => { const e = shareOf(item); return e && e.kind === 'group' ? { n: e.k } : {}; },
            steps: w.steps.map(ringWords),
            say: ringWords(w.say),
            sayValues: (item) => {
                const e = shareOf(item);
                if (!e) return null;
                if (e.kind === 'share') return [e.n, e.k, e.n / e.k];
                if (e.kind === 'group') return [e.n, e.k, e.n / e.k];
                if (e.kind === 'left') return [Math.floor(e.n / e.k), e.n % e.k];
                return [e.fair ? 'fair' : 'not fair'];
            },
        };
    }),
    misconceptions: ['unequal-share', 'counted-plates', 'counted-all', 'some-is-fair', 'left-in-share'],
    workedSteps: (q) => {
        const d = shareOf(q);
        if (!d) return [];
        const where = d.look === 'rings' ? 'ring' : 'plate';
        if (d.kind === 'fair') {
            const same = d.shown.every((v) => v === d.shown[0]);
            return clampSteps([
                step(`Count each ${where}: ${d.shown.join(', ')}.`),
                step(same ? 'They are all the same.' : 'They are not all the same.'),
                step(`Check ${same ? 'Fair' : 'Not fair'}.`, [{ slot: same ? 'fair' : 'notfair', value: '✓' }]),
            ]);
        }
        if (d.kind === 'group') {
            const g = d.n / d.k;
            return clampSteps([
                step(`Circle ${d.k} counters. That is one group.`, [{ slot: 'ring:1', value: String(d.k) }]),
                step(`Circle ${d.k} more, until none are left.`, [{ slot: 'ring:all', value: String(g) }]),
                step(`Count the circles: ${countList(1, g)}.`),
                step(`Write ${g}.`, [{ slot: 'answer', value: String(g) }]),
            ]);
        }
        const each = Math.floor(d.n / d.k), left = d.n % d.k;
        const out = [
            step(`Give one counter to each ${where}.`),
            step(`Keep going: ${countList(1, each)} on each ${where}.`),
        ];
        if (d.kind === 'left') {
            out.push(step(`Write ${each}.`, [{ slot: 'each', value: String(each) }]));
            out.push(step(`${left} ${left === 1 ? 'is' : 'are'} left. Write ${left}.`, [{ slot: 'left', value: String(left) }]));
        } else {
            out.push(step(`None are left. Write ${each}.`, [{ slot: 'answer', value: String(each) }]));
        }
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const d = shareOf(q);
        if (!d) return null;
        if (d.kind === 'fair') {
            const same = d.shown.every((v) => v === d.shown[0]);
            return chooseWrong(q, [{ value: same ? 'Not fair' : 'Fair', misconception: 'some-is-fair', slot: same ? 'notfair' : 'fair',
                slots: { [same ? 'notfair' : 'fair']: '✓' }, explain: same ? 'Every plate has the same: it is fair.' : 'Every plate has some, but not the same number.' }], { rotate: false });
        }
        if (d.kind === 'left') {
            const each = Math.floor(d.n / d.k), left = d.n % d.k;
            return chooseWrong(q, [
                { value: `${each}, ${left + d.k}`, misconception: 'left-in-share', slot: 'left', slots: { left: String(left + d.k) },
                    explain: `${left + d.k} left over is enough to give each plate one more.` },
                { value: `${each + 1}, ${left}`, misconception: 'unequal-share', slot: 'each', slots: { each: String(each + 1) },
                    explain: `${each + 1} on each would need ${(each + 1) * d.k} counters.` },
            ]);
        }
        const ans = d.n / d.k;
        return chooseWrong(q, [
            { value: d.k, misconception: 'counted-plates', explain: d.kind === 'group' ? 'Wrote how many in a group, not how many groups.' : 'Wrote how many plates, not how many on each.' },
            { value: d.n, misconception: 'counted-all', explain: 'Counted all the counters.' },
            { value: ans + 1, misconception: 'unequal-share', explain: 'One plate got more than the others.' },
        ].filter((c) => c.value !== ans));
    },
});
