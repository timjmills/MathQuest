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
const ROW = { one: 'row', many: 'rows' };
const CHAIR = { one: 'chair', many: 'chairs' };

export const nounFor = (unit, n) => (n === 1 ? unit.one : unit.many);
export const be = (n) => (n === 1 ? 'is' : 'are');
const count = (unit, n) => `${fmt(n)} ${nounFor(unit, n)}`;

/**
 * The templates, by operation. Each takes {a, b, ans, unit, n1, n2} and returns
 * {schema, lines, question, ans, label unit}. `a` and `b` are the item's own operands in the
 * item's own order; the templates never change the numbers, only the words.
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
    ],
    // a ÷ b. Grouping answers with BAGS; sharing answers with the thing noun.
    '÷': [
        ({ a, b, n1, unit }) => ({
            schema: 'grouping',
            unit: BAG,
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} puts ${fmt(b)} in each bag.`],
            question: `How many bags does ${n1} fill?`,
        }),
        ({ a, b, n1, unit }) => (b < 2 ? null : {
            schema: 'sharing',
            lines: [`${n1} has ${count(unit, a)}.`, `${n1} shares them into ${fmt(b)} bags.`, 'Each bag gets the same.'],
            question: `How many ${unit.many} go in each bag?`,
        }),
    ],
});

const OP_OF = { '+': '+', '-': '-', '−': '-', '×': 'x', x: 'x', '*': 'x', '÷': '÷', '/': '÷' };
const GLYPH = { '+': '+', '-': '−', x: '×', '÷': '÷' };

/**
 * Build a `stories` member for one operation.
 * @param {'+'|'-'|'x'|'÷'} op
 * @param {{remainder?: boolean, max?: number}} [cfg]  remainder: division stories ask how many
 *        bags are FULL and say what is left over (the interpretation step of div_remainders)
 */
export function storiesFor(op, cfg = {}) {
    const fn = (q = {}, opts = {}) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
        let ans;
        let rem = 0;
        if (op === '+') ans = a + b;
        else if (op === '-') { if (b >= a) return null; ans = a - b; }
        else if (op === 'x') ans = a * b;
        else {
            if (b < 1) return null;
            ans = Math.floor(a / b);
            rem = a - ans * b;
            if (rem && !cfg.remainder) return null;
            if (ans < 1) return null;
        }
        const seed = opts.seed !== undefined ? deriveSeed(opts.seed, 'story', a, b) : itemHash(q, 'story');
        const r = rng(seed);
        const [n1, n2] = shuffle(r, STORY_NAMES).slice(0, 2);
        const unit = pick(r, STORY_NOUNS);
        let templates = STORY_TEMPLATES[op];
        // A remainder is only meaningful when the question counts full groups.
        if (op === '÷' && rem) templates = templates.slice(0, 1);
        const order = shuffle(r, templates.map((t, i) => i));
        let body = null;
        for (const i of order) { body = templates[i]({ a, b, ans, unit, n1, n2 }); if (body) break; }
        if (!body) return null;
        const u = body.unit || unit;
        const label = nounFor(u, ans);
        const story = {
            schema: rem ? 'grouping-left' : body.schema,
            op,
            lines: body.lines,
            question: rem ? `How many bags does ${n1} fill?` : body.question,
            ans,
            label,
            unit: { one: u.one, many: u.many },
            answerText: `${fmt(ans)} ${label}`,
            equation: rem
                ? `${fmt(a)} ÷ ${fmt(b)} = ${fmt(ans)} R ${fmt(rem)}`
                : `${fmt(a)} ${GLYPH[op]} ${fmt(b)} = ${fmt(ans)}`,
            say: `The answer is ${fmt(ans)} ${label}.`,
            names: body.lines.join(' ').includes(n2) ? [n1, n2] : [n1],
        };
        if (rem) story.leftOver = `${count(unit, rem)} ${be(rem)} left over.`;
        story.sentences = story.lines.concat(story.question);
        return story;
    };
    fn.op = op;
    fn.templates = STORY_TEMPLATES[op];
    return fn;
}

/** The operation of an item, as the story engine names it ('' when unknown). */
export const storyOpOf = (q = {}) => OP_OF[String(q.op || '')] || '';
