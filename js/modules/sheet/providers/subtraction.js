// js/modules/sheet/providers/subtraction.js
// Skill providers for subtraction: sub_facts, subtract, sub_5_pictures, number_line_sub.
//
// Grade-1 subtraction is taught as TAKING AWAY (count back) or THINKING ADDITION, never with
// column regrouping: the critic's re-grade of 2026-09-25 caught "Regroup 1 ten as 10 ones" on a
// basic-facts sheet. Regrouping belongs to the sub_*_regroup ladder, not here.

import { registerSkill } from '../contract.js';
import { obj, operands, countList, chooseWrong, strings, step } from './util.js';
import { storiesFor } from './stories.js';
import { lineSteps } from './addition.js';

/** Worked subtraction without regrouping: count back, tens then ones, or think addition. */
function takeAwaySteps(a, b, slot) {
    const d = a - b;
    const done = step(`Write ${d}.`, [{ slot, value: String(d) }]);
    if (b === 0) return [step(`${a} − 0: take away nothing.`), step(`${a} is left.`), done];
    if (b <= 3) {
        return [step(`Start at ${a}.`), step(`Count back ${b}: ${countList(a - 1, d, -1)}.`), done];
    }
    if (b >= 10) {
        const tens = Math.floor(b / 10) * 10;
        const ones = b - tens;
        const out = [step(`Take away ${tens} first: ${a} − ${tens} = ${a - tens}.`)];
        if (ones) out.push(step(`Take away ${ones} more: ${a - tens} − ${ones} = ${d}.`));
        out.push(done);
        return out.length >= 3 ? out : [step(`${a} − ${b}: take away ${b}.`)].concat(out);
    }
    return [step(`Think addition: ${b} + ? = ${a}.`), step(`${b} + ${d} = ${a}.`), step(`So ${a} − ${b} = ${d}.`), done];
}

function takeAwayWrong(q, slot) {
    const [a, b] = operands(q);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const d = a - b;
    return chooseWrong(q, [
        { value: a + b, misconception: 'added', slot, explain: 'Added instead of taking away.' },
        { value: d + 1, misconception: 'counted-start', slot, explain: `Counted ${a}, the start, when counting back.` },
    ]);
}

const TAKE_AWAY_STEPS = [
    'Start with the first number.',
    'Take away the second number: count back, or think addition.',
    'Write how many are left.',
];

registerSkill('subtraction:sub_facts', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'touchall', 'tile', 'frame', 'line', 'boxsign']),
    strings: strings({
        iCan: 'I Can subtract facts to 20',
        instructionKey: 'subtract',
        steps: TAKE_AWAY_STEPS,
        say: '__ minus __ equals __.',
    }),
    misconceptions: ['added', 'counted-start'],
    workedSteps: (q) => { const [a, b] = operands(q); return Number.isFinite(a) && Number.isFinite(b) ? takeAwaySteps(a, b, 'ans') : []; },
    wrongAnswer: (q) => takeAwayWrong(q, 'ans'),
    stories: storiesFor('-'),
});

registerSkill('subtraction:subtract', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'touchall', 'startarrow', 'boxsign']),
    strings: strings({
        iCan: 'I Can subtract within 20',
        instructionKey: 'subtract',
        steps: TAKE_AWAY_STEPS,
        say: '__ minus __ equals __.',
    }),
    misconceptions: ['added', 'counted-start'],
    workedSteps: (q) => { const [a, b] = operands(q); return Number.isFinite(a) && Number.isFinite(b) ? takeAwaySteps(a, b, 'answer') : []; },
    wrongAnswer: (q) => takeAwayWrong(q, 'answer'),
    stories: storiesFor('-'),
});

/* ======================================================================= sub_5_pictures */

function pictures(q) {
    const d = obj(q.pictureData);
    if (d && Number.isFinite(Number(d.n)) && Number.isFinite(Number(d.m))) {
        const n = Number(d.n);
        const m = Number(d.m);
        return { n, m, left: n - m, shape: String(d.shape || 'picture') };
    }
    const t = /Start with (\d+), take away (\d+)/i.exec(String(q.text || ''));
    return t ? { n: Number(t[1]), m: Number(t[2]), left: Number(t[1]) - Number(t[2]), shape: 'picture' } : null;
}

const plural = (w, n) => (n === 1 ? w : `${w}s`);
// Critic round 2: Kindergarten stories - short lines about the picture's own objects, and the
// label printed for the pupil (the role reads `story.k`).
const TAKE_AWAY_STORIES = storiesFor('-', { k: true });
const SHAPE_NOUNS = { circle: ['circle', 'circles'], square: ['square', 'squares'], triangle: ['triangle', 'triangles'], star: ['star', 'stars'], ball: ['ball', 'balls'], apple: ['apple', 'apples'], fish: ['fish', 'fish'] };

registerSkill('subtraction:sub_5_pictures', {
    strings: strings({
        iCan: 'I Can take away within 5 with pictures',
        instructionKey: 'how-many-left',
        steps: [
            'Count all the pictures.',
            'Look at the ones crossed out. They are gone.',
            'Count the pictures that are not crossed out.',
            'Write how many are left.',
        ],
        say: '__ take away __ is __.',
        sayValues: (q) => { const p = pictures(q); return p ? [p.n, p.m, p.left] : null; },
    }),
    misconceptions: ['wrote-crossed-out', 'counted-all'],
    workedSteps: (q) => {
        const p = pictures(q);
        if (!p) return [];
        return [
            step(`Count all the ${plural(p.shape, 2)}: ${countList(1, p.n)}. There are ${p.n}.`),
            step(`${p.m} ${p.m === 1 ? 'is' : 'are'} crossed out.`, [{ slot: 'crossed', value: String(p.m) }]),
            step(p.left ? `Count the ones left: ${countList(1, p.left)}.` : 'No pictures are left.'),
            step(`Write ${p.left}.`, [{ slot: 'answer', value: String(p.left) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = pictures(q);
        if (!p) return null;
        return chooseWrong(q, [
            { value: p.m, misconception: 'wrote-crossed-out', explain: 'Wrote how many are crossed out.' },
            { value: p.n, misconception: 'counted-all', explain: 'Counted every picture, crossed out too.' },
        ]);
    },
    // The picture item names its numbers in pictureData, not in a / b.
    stories: (q = {}, opts = {}) => {
        const p = pictures(q);
        if (!p) return null;
        const w = SHAPE_NOUNS[p.shape];
        return TAKE_AWAY_STORIES(Object.assign({}, q, { a: p.n, b: p.m }), Object.assign({}, opts, w ? { unit: { one: w[0], many: w[1] } } : {}));
    },
});

/* ====================================================================== number_line_sub */

registerSkill('subtraction:number_line_sub', {
    strings: strings({
        iCan: 'I Can subtract by jumping back on a number line',
        instructionKey: 'line-jumps',
        steps: [
            'Find the dot. It is the first number.',
            'Jump to the left, one jump for each one you take away.',
            'Write the number you land on.',
        ],
        say: '__ minus __ equals __.',
    }),
    misconceptions: ['counted-start', 'jumped-wrong-way'],
    workedSteps: (q) => { const [a, b] = operands(q); return Number.isFinite(a) && Number.isFinite(b) ? lineSteps(a, b, -1) : []; },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
        return chooseWrong(q, [
            { value: a - b + 1, misconception: 'counted-start', explain: `Counted ${a}, the start, as the first jump.` },
            { value: a + b, misconception: 'jumped-wrong-way', explain: 'Jumped to the right, not the left.' },
        ]);
    },
    stories: storiesFor('-'),
});

/* ============================================================================ nl_sub */
// Owner request (2026-09-25): nl_sub draws on the kit's number line, one hop per number.
registerSkill('subtraction:nl_sub', {
    strings: strings({
        iCan: 'I Can subtract by hopping back on a number line',
        instructionKey: 'line-jumps',
        steps: [
            'Find the first number on the line.',
            'Hop to the left, one number each hop.',
            'Count the hops. Write the missing number.',
        ],
        say: '__ minus __ equals __.',
    }),
    misconceptions: ['counted-start', 'jumped-wrong-way'],
    // The steps say "hop" (round-4 re-grade: the Model said "Jump" under "Hop" steps).
    workedSteps: (q) => { const [a, b] = operands(q); return Number.isFinite(a) && Number.isFinite(b) ? lineSteps(a, b, -1, { verb: 'Hop', noun: 'hops' }) : []; },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || q.missing) return null;
        return chooseWrong(q, [
            { value: a - b + 1, misconception: 'counted-start', explain: `Counted ${a}, the start, as the first hop.` },
            { value: a + b, misconception: 'jumped-wrong-way', explain: 'Hopped to the right, not the left.' },
        ]);
    },
});

/* ====================================================== two-digit column subtraction */
// The sub_*_regroup / _no_regroup / _mixed ladder within 50 and 100 (PEDAGOGY_STANDARD L-3 and
// L-5): the standard algorithm, ones first, a ten regrouped from the next place when the top
// ones digit is smaller. Added 2026-09-25 with the first sample lessons, so a Model, a Guided
// page and a lesson's worked example show THIS skill's steps (never "count back").
//
// Marks name the stack's logical slots (steps.js): `strike:tens` / `strike:ones` cross out a
// top digit (VA-23), `regroup:tens` / `regroup:ones` write the new values in the headroom boxes
// above them (VA-20 / VA-21), `ones` / `tens` write the answer digits.

/**
 * Column subtraction of two whole numbers below 100 (a >= b), worked place by place.
 * @returns {{steps, diff, regroup, smallFromLarge, forgotTen}}
 */
export function columnSub(a, b) {
    const ao = a % 10, at = Math.floor(a / 10);
    const bo = b % 10, bt = Math.floor(b / 10);
    const diff = a - b;
    const regroup = ao < bo;
    const steps = [];
    if (regroup) {
        steps.push(step(`Ones: ${ao} is less than ${bo}.`, [{ slot: 'ring:ones', value: '' }]));
        steps.push(step(`${at} tens ${ao} ones is ${at - 1} tens ${ao + 10} ones.`, [
            { slot: 'strike:tens', value: String(at) }, { slot: 'regroup:tens', value: String(at - 1) },
            { slot: 'strike:ones', value: String(ao) }, { slot: 'regroup:ones', value: String(ao + 10) },
        ]));
        steps.push(step(`${ao + 10} − ${bo} = ${ao + 10 - bo}. Write ${ao + 10 - bo}.`, [{ slot: 'ones', value: String(ao + 10 - bo) }]));
    } else {
        steps.push(step(`Ones: ${ao} is not less than ${bo}.`, [{ slot: 'ring:ones', value: '' }]));
        steps.push(step(`${ao} − ${bo} = ${ao - bo}. Write ${ao - bo}.`, [{ slot: 'ones', value: String(ao - bo) }]));
    }
    const topTens = regroup ? at - 1 : at;
    const t = topTens - bt;
    // A leading zero is never written (L-3 step 5): 53 − 48 = 5, not 05.
    if (t > 0) steps.push(step(`${topTens} − ${bt} = ${t}. Write ${t}.`, [{ slot: 'tens', value: String(t) }]));
    else if (topTens > 0) steps.push(step(`${topTens} − ${bt} = 0. Leave the tens empty.`));
    steps.push(step(`Check: ${diff} + ${b} = ${a}.`));
    // Two classic errors (PEDAGOGY misconception list): the smaller digit taken from the larger in
    // every column, and the ones regrouped but the ten never taken from the tens.
    const smallFromLarge = Math.abs(at - bt) * 10 + Math.abs(ao - bo);
    const forgotTen = regroup ? (at - bt) * 10 + (ao + 10 - bo) : diff;
    return { steps, diff, regroup, smallFromLarge, forgotTen };
}

const COLUMN_SUB_STEPS = [
    'Look at the ones. Is the top smaller?',
    'Yes: regroup a ten. Cross out. Write the new numbers.',
    'Subtract the ones.',
    'Subtract the tens.',
    'Check: add the answer and the bottom number.',
];

for (const [id, iCan] of [
    ['sub_50_regroup', 'I Can subtract within 50 (with regrouping)'],
    ['sub_100_regroup', 'I Can subtract within 100 (with regrouping)'],
    ['sub_50_no_regroup', 'I Can subtract within 50 (no regrouping)'],
    ['sub_100_no_regroup', 'I Can subtract within 100 (no regrouping)'],
    ['sub_50_mixed', 'I Can subtract within 50'],
    ['sub_100_mixed', 'I Can subtract within 100'],
]) {
    const regroups = /_(regroup|mixed)$/.test(id);
    registerSkill(`subtraction:${id}`, {
        strings: strings({
            iCan,
            instructionKey: 'subtract',
            steps: regroups ? COLUMN_SUB_STEPS : [COLUMN_SUB_STEPS[0], ...COLUMN_SUB_STEPS.slice(2)],
            say: '__ minus __ equals __.',
        }),
        misconceptions: ['small-from-large', 'forgot-ten', 'added'],
        workedSteps: (q) => {
            const [a, b] = operands(q);
            if (!Number.isInteger(a) || !Number.isInteger(b) || a < b || a >= 100) return [];
            return columnSub(a, b).steps;
        },
        wrongAnswer: (q) => {
            const [a, b] = operands(q);
            if (!Number.isInteger(a) || !Number.isInteger(b) || a < b || a >= 100) return null;
            const c = columnSub(a, b);
            return chooseWrong(q, [
                c.regroup ? { value: c.smallFromLarge, misconception: 'small-from-large', explain: 'Took the smaller ones digit from the larger one.' } : null,
                c.regroup ? { value: c.forgotTen, misconception: 'forgot-ten', explain: 'Regrouped the ones but did not take the ten from the tens.' } : null,
                { value: a + b, misconception: 'added', explain: 'Added instead of subtracting.' },
            ]);
        },
        stories: storiesFor('-'),
    });
}
