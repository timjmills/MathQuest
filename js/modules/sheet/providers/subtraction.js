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
            'Put a dot on the first number.',
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
