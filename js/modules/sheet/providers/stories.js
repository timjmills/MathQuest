// js/modules/sheet/providers/stories.js
// Story templates for the word-problem role (PEDAGOGY_STANDARD.md 8.5, 8.6).
//
// A provider's `stories` member is a FUNCTION built here:
//
//     stories(q, { seed } = {}) -> Story | null
//
// It turns the numbers of ONE generated item into a short original story whose answer is a
// number AND a label. It returns null when the item has no numbers a story can carry (a zero
// operand, a missing operand); the role then takes another item.
//
//   @typedef {Object} Story
//   @property {string}   schema      'join' | 'part-whole' | 'join-place' | 'separate' | 'take-from'
//                                    | 'lose' | 'groups' | 'rows' | 'grouping' | 'sharing'
//                                    | 'grouping-left'
//   @property {string}   op          '+' | '-' | 'x' | '÷'
//   @property {string[]} lines       the story sentences, one per line (P-WP-17)
//   @property {string}   question    the question sentence, always the last line
//   @property {string[]} sentences   lines + question, in reading order
//   @property {number}   ans         the number the pupil writes
//   @property {string}   label       the unit word that agrees with `ans` ("1 apple", "4 apples")
//   @property {{one: string, many: string}} unit   both forms, for a pre-printed label
//   @property {string}   answerText  "4 apples"
//   @property {string}   equation    "2 + 2 = 4"
//   @property {string}   say         "The answer is 4 apples."
//   @property {string}   [leftOver]  division with a remainder: "3 apples are left over."
//
// Grammar is built in, not patched afterwards: every count goes through `nounFor(n)` and every
// "there is / there are" through `be(n)`, so "There are 1 ball" cannot be produced. Sentences
// stay at 8 words or fewer for the youngest bands (P-WP-18); names repeat instead of pronouns
// (P-WP-19); contexts and nouns are neutral (P-WP-20, P-WP-22). Nothing here is copied from any
// workbook (P-WP-23).

import { rng, pick, shuffle, deriveSeed } from '../rng.js';
import { fmt, itemHash, operands } from './util.js';

/** The controlled noun list (P-WP-20): singular and plural, so a label always agrees. */
export const STORY_NOUNS = Object.freeze([
    { one: 'apple', many: 'apples' },
    { one: 'book', many: 'books' },
    { one: 'pencil', many: 'pencils' },
    { one: 'ball', many: 'balls' },
    { one: 'cup', many: 'cups' },
    { one: 'shell', many: 'shells' },
    { one: 'sticker', many: 'stickers' },
    { one: 'leaf', many: 'leaves' },
    { one: 'block', many: 'blocks' },
    { one: 'brush', many: 'brushes' },
    { one: 'card', many: 'cards' },
    { one: 'bead', many: 'beads' },
]);

/** Short, mixed, international names (P-WP-21). A story uses at most two. */
export const STORY_NAMES = Object.freeze(['Mia', 'Omar', 'Lena', 'Ravi', 'Sam', 'Ana', 'Kofi', 'Yuki', 'Zara', 'Leo', 'Noor', 'Ben']);

const BAG = { one: 'bag', many: 'bags' };
const BOX = { one: 'box', many: 'boxes' };
const ROW = { one: 'row', many: 'rows' };
const CHAIR = { one: 'chair', many: 'chairs' };
const PLATE = { one: 'plate', many: 'plates' };
const FLOWER = { one: 'flower', many: 'flowers' };
const CHILD = { one: 'child', many: 'children' };
const TEAM = { one: 'team', many: 'teams' };
const VASE = { one: 'vase', many: 'vases' };
const CAR = { one: 'car', many: 'cars' };
const JAR = { one: 'jar', many: 'jars' };

export const nounFor = (unit, n) => (n === 1 ? unit.one : unit.many);
export const be = (n) => (n === 1 ? 'is' : 'are');
const count = (unit, n) => `${fmt(n)} ${nounFor(unit, n)}`;

/**
 * The templates, by operation. Each takes {a, b, ans, rem, unit, n1, n2} and returns
 * {schema, lines, question, unit?, ans?, work?}. `a` and `b` are the item's own operands in the
 * item's own order; the templates never change the numbers, only the words. A template may
 * return null when the numbers do not suit it.
 *
 * Critic round 2: a page held "rows of chairs" twice, or "balls into bags" twice, because x and ÷
 * had two templates each and one noun per item. Each operation now has several contexts, and the
 * role hands in the item's place on the page, which rotates template and noun (see storiesFor).
 */
export const STORY_TEMPLATES = Object.freeze({
    '+': [
        ({ a, b, unit, n1 }) => ({
            schema: 'join',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} gets ${fmt(b)} more.`],
            question: `How many ${unit.many} does ${n1} have now?`,
        }),
        ({ a, b, unit, n1, n2 }) => ({
            schema: 'part-whole',
            lines: [`${n1} has ${count(unit, a)}.`, `${n2} has ${count(unit, b)}.`],
            question: `How many ${unit.many} do they have in all?`,
        }),
        ({ a, b, unit, n1 }) => ({
            schema: 'join-place',
            lines: [`There ${be(a)} ${count(unit, a)} on the table.`, `${n1} puts ${fmt(b)} more on the table.`],
            question: `How many ${unit.many} are on the table now?`,
        }),
    ],
    '-': [
        ({ a, b, unit, n1, n2 }) => ({
            schema: 'separate',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} gives ${fmt(b)} to ${n2}.`],
            question: `How many ${unit.many} does ${n1} have now?`,
        }),
        ({ a, b, unit, n1 }) => ({
            schema: 'take-from',
            lines: [`There ${be(a)} ${count(unit, a)} in a bag.`, `${n1} takes ${fmt(b)} out.`],
            question: `How many ${unit.many} are in the bag now?`,
        }),
        ({ a, b, unit, n1 }) => ({
            schema: 'lose',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} loses ${fmt(b)} of them.`],
            question: `How many ${unit.many} does ${n1} have left?`,
        }),
    ],
    // a groups of b. The answer counts the THINGS, so the label is the thing noun.
    x: [
        ({ a, b, unit, n1 }) => ({
            schema: 'groups',
            lines: [`${n1} has ${count(BAG, a)}.`, `Each bag has ${count(unit, b)}.`],
            question: `How many ${unit.many} are there in all?`,
        }),
        ({ a, b }) => ({
            schema: 'rows',
            unit: CHAIR,
            lines: [`There ${be(a)} ${count(ROW, a)} of chairs.`, `Each row has ${count(CHAIR, b)}.`],
            question: 'How many chairs are there in all?',
        }),
        ({ a, b, unit, n1 }) => ({
            schema: 'groups',
            lines: [`${n1} packs ${count(BOX, a)}.`, `Each box holds ${count(unit, b)}.`],
            question: `How many ${unit.many} are in the boxes?`,
        }),
        ({ a, b, unit }) => ({
            schema: 'groups',
            lines: [`There ${be(a)} ${count(PLATE, a)}.`, `Each plate has ${count(unit, b)}.`],
            question: `How many ${unit.many} are on the plates?`,
        }),
        ({ a, b, n1 }) => ({
            schema: 'rows',
            unit: FLOWER,
            lines: [`${n1} plants ${count(ROW, a)} of flowers.`, `Each row has ${count(FLOWER, b)}.`],
            question: `How many flowers does ${n1} plant?`,
        }),
    ],
    // a ÷ b, MEASUREMENT (grouping): b in each group, how many groups. The label is the group noun.
    grouping: [
        ({ a, b, n1, unit }) => ({
            schema: 'grouping',
            unit: BAG,
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} puts ${fmt(b)} in each bag.`],
            question: `How many bags does ${n1} fill?`,
        }),
        ({ a, b, n1, unit }) => ({
            schema: 'grouping',
            unit: BOX,
            lines: [`${n1} has ${count(unit, a)}.`, `Each box holds ${count(unit, b)}.`],
            question: `How many boxes does ${n1} fill?`,
        }),
        ({ a, b }) => ({
            schema: 'grouping',
            unit: TEAM,
            lines: [`There ${be(a)} ${count(CHILD, a)} in the gym.`, `Each team has ${count(CHILD, b)}.`],
            question: 'How many teams are there?',
        }),
        ({ a, b, n1 }) => ({
            schema: 'grouping',
            unit: VASE,
            lines: [`${n1} has ${count(FLOWER, a)}.`, `${n1} puts ${fmt(b)} flowers in each vase.`],
            question: `How many vases does ${n1} fill?`,
        }),
    ],
    // a ÷ b, SHARING (partitive): b groups, how many in each. The label is the thing noun.
    sharing: [
        ({ a, b, n1, unit }) => (b < 2 ? null : {
            schema: 'sharing',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} shares them into ${fmt(b)} bags.`, 'Each bag gets the same.'],
            question: `How many ${unit.many} go in each bag?`,
        }),
        ({ a, b, n1, unit }) => (b < 2 ? null : {
            schema: 'sharing',
            lines: [`${n1} puts ${count(unit, a)} on ${fmt(b)} plates.`, 'Each plate gets the same.'],
            question: `How many ${unit.many} are on each plate?`,
        }),
    ],
    // a ÷ b with a REMAINDER: the question interprets the left-over (PEDAGOGY 8.6, critic round 2).
    remainder: [
        // how many are left over: the answer IS the remainder
        ({ a, b, rem, n1, unit }) => ({
            schema: 'grouping-left',
            ans: rem,
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} puts ${fmt(b)} in each bag.`],
            question: `How many ${unit.many} are left over?`,
        }),
        // round UP: every one needs a place
        ({ a, b, quo, rem }) => ({
            schema: 'grouping-up',
            unit: CAR,
            ans: quo + 1,
            lines: [`${count(CHILD, a)} go to the park.`, `Each car holds ${count(CHILD, b)}.`],
            question: 'How many cars do they need?',
            work: `${fmt(a)} ÷ ${fmt(b)} = ${fmt(quo)} R ${fmt(rem)}, so ${fmt(quo + 1)} cars`,
        }),
        // round DOWN: only full groups count
        ({ a, b, quo, rem, n1, unit }) => ({
            schema: 'grouping-full',
            unit: JAR,
            ans: quo,
            lines: [`${n1} has ${count(unit, a)}.`, `A full jar holds ${count(unit, b)}.`],
            question: `How many jars can ${n1} fill?`,
            work: `${fmt(a)} ÷ ${fmt(b)} = ${fmt(quo)} R ${fmt(rem)}, so ${fmt(quo)} full jars`,
        }),
    ],
    // Kindergarten take-away (P-WP-18: at most 6 words a line), about the picture's own objects.
    'k-': [
        ({ a, b, unit, n1 }) => ({
            schema: 'take-from',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} gives away ${fmt(b)}.`],
            question: `How many ${unit.many} are left?`,
        }),
        ({ a, b, unit }) => ({
            schema: 'take-from',
            lines: [`There ${be(a)} ${count(unit, a)}.`, `${fmt(b)} ${b === 1 ? 'goes' : 'go'} away.`],
            question: `How many ${unit.many} are left?`,
        }),
    ],
});

const OP_OF = { '+': '+', '-': '-', '−': '-', '×': 'x', x: 'x', '*': 'x', '÷': '÷', '/': '÷' };
const GLYPH = { '+': '+', '-': '−', x: '×', '÷': '÷' };

/** The template list an item draws from. */
function templatesFor(op, cfg, rem) {
    if (op === '÷') {
        if (rem) return cfg.remainder ? STORY_TEMPLATES.remainder : [];
        if (cfg.grouping) return STORY_TEMPLATES.grouping;
        return [...STORY_TEMPLATES.grouping, ...STORY_TEMPLATES.sharing];
    }
    if (op === '-' && cfg.k) return STORY_TEMPLATES['k-'];
    return STORY_TEMPLATES[op] || [];
}

/**
 * Build a `stories` member for one operation.
 * @param {'+'|'-'|'x'|'÷'} op
 * @param {{remainder?: boolean, grouping?: boolean, k?: boolean}} [cfg]
 *        remainder: division stories interpret the left-over (how many left, round up, full groups)
 *        grouping:  measurement division only - "N in each bag, how many bags" (share_into_groups)
 *        k:         Kindergarten stories: short lines about the picture's own objects (`opts.unit`)
 *
 * `opts` = {seed, index, unit}. With `index` (the item's place on the page) the template and the
 * noun ROTATE from a page-wide start drawn from `seed`, so neighbours never share either; without
 * it, both are drawn per item (the old behaviour, kept for single-item callers).
 */
export function storiesFor(op, cfg = {}) {
    const fn = (q = {}, opts = {}) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
        let ans;
        let rem = 0;
        let quo = 0;
        if (op === '+') ans = a + b;
        else if (op === '-') { if (b >= a) return null; ans = a - b; }
        else if (op === 'x') ans = a * b;
        else {
            if (b < 1) return null;
            quo = Math.floor(a / b);
            rem = a - quo * b;
            if (rem && !cfg.remainder) return null;
            if (quo < 1) return null;
            ans = quo;
        }
        const placed = Number.isInteger(opts.index) && opts.index >= 0;
        const seed = placed ? deriveSeed(opts.seed === undefined ? 0 : opts.seed, 'story-page', op)
            : opts.seed !== undefined ? deriveSeed(opts.seed, 'story', a, b) : itemHash(q, 'story');
        const r = rng(seed);
        const names = shuffle(r, STORY_NAMES);
        const nouns = shuffle(r, STORY_NOUNS);
        const templates = templatesFor(op, cfg, rem);
        if (!templates.length) return null;
        const start = Math.floor(r() * templates.length);
        const k = placed ? opts.index : 0;
        const n1 = names[(2 * k) % names.length];
        const n2 = names[(2 * k + 1) % names.length];
        const unit = opts.unit && opts.unit.one && opts.unit.many ? opts.unit
            : nouns[placed ? k % nouns.length : Math.floor(r() * nouns.length)];
        const order = placed
            ? templates.map((t, i) => (start + k + i) % templates.length)
            : shuffle(r, templates.map((t, i) => i));
        let body = null;
        for (const i of order) { body = templates[i]({ a, b, ans, quo, rem, unit, n1, n2 }); if (body) break; }
        if (!body) return null;
        const u = body.unit || unit;
        const answer = body.ans !== undefined ? body.ans : ans;
        const label = nounFor(u, answer);
        const equation = rem
            ? `${fmt(a)} ÷ ${fmt(b)} = ${fmt(quo)} R ${fmt(rem)}`
            : `${fmt(a)} ${GLYPH[op]} ${fmt(b)} = ${fmt(ans)}`;
        const story = {
            schema: body.schema,
            op,
            lines: body.lines,
            question: body.question,
            ans: answer,
            label,
            unit: { one: u.one, many: u.many },
            answerText: `${fmt(answer)} ${label}`,
            equation,
            work: body.work || (rem ? `${equation}: ${fmt(rem)} left over` : equation),
            say: `The answer is ${fmt(answer)} ${label}.`,
            names: body.lines.join(' ').includes(n2) ? [n1, n2] : [n1],
        };
        if (cfg.k) story.k = true;
        if (rem) story.leftOver = `${count(unit, rem)} ${be(rem)} left over.`;
        story.sentences = story.lines.concat(story.question);
        return story;
    };
    fn.op = op;
    fn.templates = templatesFor(op, cfg, cfg.remainder ? 1 : 0);
    return fn;
}

/** The operation of an item, as the story engine names it ('' when unknown). */
export const storyOpOf = (q = {}) => OP_OF[String(q.op || '')] || '';
