// js/modules/sheet/cells/word-work.js
// The `word-work` template: ONE cell type for every whole-number word problem (owner ruling
// 2026-09-25), on paper, on the key and on screen.
//
//   the story      one sentence per line at cell-text size + 2, the question last (P-WP-17)
//                  [option] key words bold + underlined (never colour, PT-WPR-6)
//                  [option] a keyword bank box beside the story (our own wording)
//                  [option] a bar model under the story, its labels blank (part-part-whole,
//                  compare, or equal parts)
//   the sign row   a SMALL row of four boxes + − × ÷ under the story: the pupil circles one on
//                  paper and taps one on screen; the key rings the right one
//   the work       COLUMN BOXES the pupil writes the story's numbers into (they are empty on the
//                  pupil page): + and − a digit-box stack with the sign box on the left of the
//                  bottom row and a regroup row on top when that item can regroup; × with one
//                  row of partial-product boxes per digit of a 2-digit multiplier; ÷ the long
//                  division frame (divisor boxes, bracket, dividend boxes, quotient boxes, two
//                  work rows per step, an R box when the item leaves a remainder)
//   the answer     written ONCE (round-4 critic, H8): the bottom row of the columns (the
//                  quotient row of ÷) is the scored place (PT-WPR-8), in heavier boxes, with the
//                  label line beside it and a bank of three label words to copy from (P-TH-1).
//                  Only a ÷ story whose answer is not the quotient ("left over", "cars needed",
//                  a quotient with a remainder) keeps a separate "Answer: [ ] ______" line
//   geometry       the SKILL's tracks on every item (payload.tracks) and a regroup row on every
//                  + / − item (a structural scaffold, empty on the pupil page); × carries only
//                  when a 2-digit number is multiplied by one digit
//   two-step       two work blocks side by side, "Step 1" and "Step 2", each with its own sign
//                  row (P-WP-11)
//
// The key (AK-1) is the same cell finished: the sign ringed, the numbers, the sign, the
// regroup digits, the partial products or the division working, the answer and its unit.
// Error analysis draws a finished cell worked with the WRONG operation (`wrong.slots.op`).
//
// SCREEN TWIN (`ctx.options.twin`, drawn by `wordWorkTwin`): the same drawing in --mq-k2 px,
// stacked for a narrow card. The sign boxes are buttons, the work boxes and the sign box are
// typed inputs (scratch, ungraded), the answer row's boxes are the host's own digit boxes
// (`data-mq-cell`, composed into the answer; the separate Answer box is `data-mq-blank="box"`),
// and the label bank words fill the label line. Every writing place
// carries `data-mq-expect` - the value the model expects - so the host can mark each one right
// as it is filled (js/modules/word-work-screen.js does the tapping and the per-box marks).
//
// payload: {lines, steps: [{a, b, op, ans, top, bottom, q?, r?}], ans, unit, bank, hl, kb, bar,
//           barKind, pic: {a, b, shape} | null}
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { blankWidth } from '../tokens.js';
import { L, P, B, INK, GREY, KEY_FEATURES, isTwin, sizeOf, digitPt, textPt, zonePt, shapeOf, n2 } from './k2kit.js';
import { divisionSteps } from './long-division.js';

export const WW_TEMPLATE = 'word-work';

/* ============================================================== the solving model (pure) */

const GLYPH = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const WORD = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
const OPS = ['+', '-', '*', '/'];
export const opKey = (op) => ({ '+': '+', '-': '-', '−': '-', '–': '-', '×': '*', x: '*', X: '*', '*': '*', '÷': '/', '/': '/' })[String(op || '').trim()] || null;
export const opGlyph = (op) => GLYPH[opKey(op)] || '';
const digitsOf = (n) => String(Math.abs(Math.trunc(Number(n))));
const plain = (s) => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−').replace(/\s+/g, ' ').trim();

/** The sentences of a story, one per line (P-WP-17). */
export function storyLines(text) {
    return plain(text).split(/(?<=[.?!])\s+(?=[A-Z0-9$"'])/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

function compute(x, op, y) {
    switch (op) {
        case '+': return x + y;
        case '-': return x - y;
        case '*': return x * y;
        case '/': return y ? x / y : NaN;
        default: return NaN;
    }
}

/**
 * One step, oriented the way it is written in columns: + keeps the story's order, − and ÷ put
 * the number taken from / shared first, × puts the factor with more digits on top.
 */
export function makeStep(x, op, y, ans) {
    const k = opKey(op);
    if (!k || !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) return null;
    if (k === '/') {
        if (y === 0) return null;
        const q = Math.floor(x / y), r = x % y;
        return { a: x, b: y, op: k, ans: ans === undefined ? q : ans, q, r, top: x, bottom: y };
    }
    const v = compute(x, k, y);
    if (!Number.isInteger(v) || v < 0) return null;
    let top = x, bottom = y;
    if (k === '*' && (digitsOf(y).length > digitsOf(x).length || (digitsOf(y).length === digitsOf(x).length && y > x))) { top = y; bottom = x; }
    return { a: x, b: y, op: k, ans: v, top, bottom };
}

/** Does `x op y` give the story's answer? Division may be interpreted (a remainder story). */
function fits(x, op, y, ans, interpret) {
    if (op === '/') {
        if (!y || x < y) return false;
        if (x % y === 0) return x / y === ans;
        return interpret && (Math.floor(x / y) === ans || Math.ceil(x / y) === ans || x % y === ans);
    }
    if (op === '-' && x < y) return false;
    return compute(x, op, y) === ans;
}

/** The whole numbers a story prints, in reading order ("217,422" is one number). */
export function storyNumbers(text) {
    const t = plain(text);
    if (/\d\.\d/.test(t)) return null;               // decimals (money in cents) are not in scope
    return [...t.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, ''))).filter((n) => Number.isFinite(n));
}

const INVERSE = { '+': '-', '-': '+', '*': '/', '/': '*' };

/**
 * The step a story is SOLVED with (not the step it was generated from: "Owen had 37. Now Owen
 * has 71. How many more did Owen get?" is written 37 + ? but solved 71 − 37). The generator's own
 * operands and sign first; then the story's numbers, trying the inverse sign first.
 */
export function solveStory(q, { divFirst = false } = {}) {
    const ans = Number(String(q.ans).replace(/,/g, ''));
    if (!Number.isInteger(ans) || ans < 0) return null;
    const nums = storyNumbers(q.text);
    if (!nums) return null;
    const a = Number(q.a), b = Number(q.b);
    const op0 = opKey(q.op);
    const pool = [];
    if (Number.isInteger(a) && Number.isInteger(b)) pool.push([a, b], [b, a]);
    for (let i = 0; i < nums.length; i++) for (let j = 0; j < nums.length; j++) if (i !== j) pool.push([nums[i], nums[j]]);
    const order = op0 ? [op0, INVERSE[op0], ...OPS] : OPS;
    const ops = order.filter((o, i) => order.indexOf(o) === i);
    const inText = (n) => nums.includes(n);
    if (divFirst) {
        for (const [x, y] of pool) if (inText(x) && inText(y) && fits(x, '/', y, ans, true)) return makeStep(x, '/', y, ans);
    }
    for (const interpret of [false, true]) {
        // the generator's own operands, in its sign, first (they carry the story's meaning)
        if (op0 && Number.isInteger(a) && Number.isInteger(b) && fits(a, op0, b, ans, interpret) && inText(a) && inText(b)) return makeStep(a, op0, b, ans);
        for (const o of ops) {
            for (const [x, y] of pool) {
                if (!inText(x) || !inText(y)) continue;
                if (o === '+' || o === '*') { if (fits(x, o, y, ans, interpret)) return makeStep(x, o, y, ans); continue; }
                if (fits(x, o, y, ans, interpret)) return makeStep(x, o, y, ans);
            }
        }
    }
    return null;
}

/** "Step 1: 25 + 8 = 33. Step 2: 33 + 26 = 59" -> two steps. */
export function parseTwoStep(hint) {
    const m = /Step 1:\s*(\d+)\s*([+\-−×÷x*/])\s*(\d+)\s*=\s*(\d+)\.?\s*Step 2:\s*(\d+)\s*([+\-−×÷x*/])\s*(\d+)\s*=\s*(\d+)/i.exec(plain(hint));
    if (!m) return null;
    const s1 = makeStep(Number(m[1]), m[2], Number(m[3]));
    const s2 = makeStep(Number(m[5]), m[6], Number(m[7]));
    if (!s1 || !s2 || s1.ans !== Number(m[4]) || s2.ans !== Number(m[8])) return null;
    return [s1, s2];
}

/* ------------------------------------------------------------------- the unit word */

const STOP = /^(more|fewer|less|of|and|were|was|in|to|are|is|did|does|do|will|can|could|remain|left|each|times|total|groups?|rows?|extra|other|the|a|an|at|on|for|from|with|years?|old|than|then|by|into|per|as|has|have|had|so|but|or|equally|between|among|full|exactly|altogether)$/i;
const IE = /^(cookies|pies|movies|brownies|ties|calories|smoothies|hoodies|goalies)$/i;

const singular = (w) => {
    const s = String(w);
    const parts = s.split(' ');
    const last = parts.pop();
    let one = last;
    if (IE.test(last)) one = last.slice(0, -1);
    else if (/(ch|sh|x|ss)es$/i.test(last)) one = last.slice(0, -2);
    else if (/[^aeiou]ies$/i.test(last)) one = last.slice(0, -3) + 'y';
    else if (/(shelves|leaves|loaves|halves)$/i.test(last)) one = last.slice(0, -3) + 'f';
    else if (/s$/i.test(last) && !/ss$/i.test(last)) one = last.slice(0, -1);
    return [...parts, one].join(' ');
};

/** A counted noun at the start of `rest` ("website visitors are ..." -> "website visitors"). */
function nounAt(rest) {
    const m = /^([a-z]+)(?:\s+([a-z]+))?/i.exec(rest);
    if (!m) return '';
    const w1 = m[1].toLowerCase(), w2 = (m[2] || '').toLowerCase();
    if (STOP.test(w1)) return '';
    // a compound noun: a word that is not plural, then a plural ("rock samples", "soccer balls")
    if (w2 && !STOP.test(w2) && !/s$/.test(w1) && /s$/.test(w2) && !/ss$/.test(w2)) return `${w1} ${w2}`;
    return w1;
}

/** The unit word of the answer ("pencils", "1 bag"), from the question, else the story's first counted noun. */
export function unitOf(q, ans) {
    const t = plain(q.text);
    const after = [...t.matchAll(/\d[\d,]*\s+(?:more\s+|fewer\s+|extra\s+)?(?=[a-z])/gi)].map((m) => nounAt(t.slice(m.index + m[0].length))).filter(Boolean);
    const fewest = /(?:fewest|least) number of ([a-z]+(?:\s+[a-z]+)?)/i.exec(t);
    const asked = /how many\s+(?:more\s+|fewer\s+|less\s+|full\s+|extra\s+)?([a-z]+(?:\s+[a-z]+)?)/i.exec(t);
    let w = (fewest && nounAt(fewest[1])) || (asked && nounAt(asked[1])) || after[0] || '';
    w = w.toLowerCase();
    if (!w) return { word: '', many: '', others: after };
    // "How many website visitors" and "72,815 website visitors": the story's own compound wins
    const compound = after.find((x) => x.endsWith(` ${w}`) || x.startsWith(`${w} `));
    if (compound && compound.includes(' ') && !w.includes(' ')) w = compound;
    const many = w;
    // the bank's other words are the story's other counted NOUNS (plurals), never a verb ("sold")
    const others = [...new Set(after)].filter((x) => x !== many && singular(x) !== singular(many) && /[^s]s$/.test(x));
    return { word: Number(ans) === 1 ? singular(many) : many, many, others };
}

const FILLERS = ['boxes', 'days', 'people', 'bags', 'cars', 'books'];

/** Three words for the unit bank: the answer's unit and two nouns of the story (else neutral fillers). */
export function unitBank(unit, others, seed = 0) {
    if (!unit.word) return [];
    const words = [unit.word];
    for (const w of [...others, ...FILLERS]) {
        if (words.length >= 3) break;
        if (!words.some((x) => singular(x) === singular(w))) words.push(w);
    }
    // a fixed shuffle from the item's numbers, so the right word is not always first
    const k = Math.abs(Math.trunc(seed)) % 3;
    return words.slice(k).concat(words.slice(0, k));
}

/* ---------------------------------------------------------------------- key words */

/** The keyword bank (our own wording): the cue phrases that usually point to each sign. */
export const KEYWORD_BANK = Object.freeze([
    { op: '+', words: ['in all', 'altogether', 'total'] },
    { op: '-', words: ['left', 'fewer', 'how many more'] },
    { op: '*', words: ['each', 'groups of', 'times'] },
    { op: '/', words: ['share equally', 'each get', 'split'] },
]);

/** The phrases highlighted in a story, per solving sign (longest first). */
const CUES = {
    '+': ['altogether', 'in all', 'in total', 'total', 'together', 'combined', 'sum', 'more'],
    '-': ['how many more', 'how many fewer', 'how much more', 'fewer than', 'less than', 'more than', 'left over', 'left', 'remain', 'fewer', 'difference', 'gave away', 'gave', 'lost', 'ate', 'spent', 'used', 'took'],
    '*': ['groups of', 'rows of', 'in each row', 'times as many', 'times', 'each', 'every', 'per'],
    '/': ['share equally', 'shared equally', 'equally', 'each get', 'split', 'in each', 'each', 'per', 'left over', 'fewest'],
};

/** The key phrases of one sentence for the solving signs, as [start, end) ranges. */
export function cueRanges(line, ops) {
    const out = [];
    const phrases = [...new Set(ops.flatMap((o) => CUES[o] || []))].sort((x, y) => y.length - x.length);
    for (const ph of phrases) {
        const re = new RegExp(`\\b${ph.replace(/ /g, '\\s+')}\\b`, 'gi');
        let m;
        while ((m = re.exec(line))) {
            const s = m.index, e = s + m[0].length;
            if (!out.some((r) => s < r[1] && e > r[0])) out.push([s, e]);
        }
    }
    return out.sort((x, y) => x[0] - y[0]);
}

/* ---------------------------------------------------------------------- the story (P-WP-17..24)
 * Round-4 critic: the generators' own story frames were ungrammatical or nonsense for an ELL
 * pupil ("After 423 removed, how many were left?", "Then 102 spent.", "7 rows of cents" in a
 * garden, "planted rock samples", "picks 37 trees", "She" for "James"). Every word-work story is
 * therefore RETOLD here from the item's own numbers and its solving structure, in one controlled
 * grammar: present or simple past, one fact per sentence, a name repeated instead of a pronoun,
 * countable nouns that fit their verbs, and every count agreeing with its noun ("1 bag",
 * "4 bags"). The generator decides the numbers and the kind of story (its schema); the words are
 * ours. tests/scripts/ws-story-lint.mjs holds every template to these rules over a large sample.
 */

/** Short, mixed, international names (P-WP-21). */
export const WW_NAMES = Object.freeze(['Mia', 'Omar', 'Lena', 'Ravi', 'Sam', 'Ana', 'Kofi', 'Yuki', 'Zara', 'Leo', 'Noor', 'Ben', 'Aya', 'Tom']);

const N = (one, many) => Object.freeze({ one, many });
/** Things a child has, gets, gives, shares and packs (P-WP-20: every noun with both forms). */
export const WW_THINGS = Object.freeze([
    N('apple', 'apples'), N('pencil', 'pencils'), N('sticker', 'stickers'), N('book', 'books'),
    N('marble', 'marbles'), N('card', 'cards'), N('shell', 'shells'), N('bead', 'beads'),
    N('stamp', 'stamps'), N('crayon', 'crayons'), N('button', 'buttons'), N('cookie', 'cookies'),
]);
/** Money: a count of dollars (P-WP-22: plain amounts, no currency sign). */
export const WW_MONEY = N('dollar', 'dollars');
/** Containers for equal groups, grouping and full-groups stories. */
export const WW_CONTAINERS = Object.freeze([
    N('bag', 'bags'), N('box', 'boxes'), N('jar', 'jars'), N('plate', 'plates'), N('basket', 'baskets'), N('pack', 'packs'),
]);
const CHILD = N('child', 'children');
/** The subjects of a story in thousands (P-WP-22: neutral places). */
export const WW_PLACES = Object.freeze(['The shop', 'The school', 'The club', 'The farm', 'The library', 'The museum']);
const CAR = N('car', 'cars');

const num = (n) => (Math.abs(n) >= 1000 ? Number(n).toLocaleString('en-US') : String(n));
/** "1 bag", "4 bags" (P-WP-20). */
export const countOf = (n, noun) => `${num(n)} ${n === 1 ? noun.one : noun.many}`;

/** A deterministic pick from a list by a seed. */
const pickAt = (list, k) => list[((Math.floor(k) % list.length) + list.length) % list.length];

/**
 * The schema of a one-step story: what KIND of story the generator told, read from its own words
 * and the solving step (never from the words alone: "more" is also in a subtraction question).
 */
export function schemaOf(text, st, ans) {
    const t = String(text || '').toLowerCase();
    const some = /\bsome\b/.test(t) && /\b(at first|at the start|to start|start with|started with|in the beginning)\b/.test(t);
    const change = /\b(needs?|wants?|after (getting|walking|reading|earning|saving)|now has|now have|in total|started with|some more)\b/.test(t);
    const compare = /\b(more|fewer|less)\s+than\b|\bhow (many|much) (more|fewer|less)\b|\bdifference\b/.test(t);
    if (st.op === '+') {
        if (some) return 'start-sub';
        if (/\bmore than\b/.test(t)) return 'compare-more';
        return 'join';
    }
    if (st.op === '-') {
        if (some) return 'start-add';
        if (change && /\bhow many more\b/.test(t)) return 'change';
        if (compare) return 'compare';
        return 'separate';
    }
    if (st.op === '*') return /\btimes as many\b/.test(t) ? 'times' : 'groups';
    // division
    if (st.r) {
        if (ans === st.r) return 'rem-left';
        if (ans === st.q + 1) return 'rem-up';
        return 'rem-full';
    }
    if (/\bhow many times\b/.test(t)) return 'times-howmany';
    if (/\btimes as many\b/.test(t)) return 'times-inverse';
    if (/\bhow many (bags|boxes|packs|baskets|jars|shelves|buses|cars|teams|rows|groups|plates|vases|pots|tables)\b/.test(t)) return 'grouping';
    return 'sharing';
}

/**
 * The story's sentences for one schema, from the step's numbers. Returns
 * {lines: [...sentences, question], unit: {one, many} | null, ans}. `k` varies names and nouns.
 */
export function tellStory(schema, st, k0 = 0, { ans = st.ans, money = false, times = null } = {}) {
    let k = k0;
    const a = st.top, b = st.bottom;
    // Thousands of stickers in a child's hands is nonsense (round-4 critic): a + / − story with a
    // number of 1,000 or more is about a place and its money ("The shop has 57,938 dollars.").
    const big = (st.op === '+' || st.op === '-') && Math.max(a, b, ans) >= 1000;
    const n1 = big ? pickAt(WW_PLACES, k) : pickAt(WW_NAMES, k);
    const n2 = big ? pickAt(WW_PLACES, k + 1) : pickAt(WW_NAMES, k + 5);
    const T = money || big ? WW_MONEY : pickAt(WW_THINGS, k * 7 + 3);
    const C = pickAt(WW_CONTAINERS, k * 5 + 1);
    // a place is "The shop" at the start of a sentence and "the shop" inside one
    const S = (lines, unit, answer = ans) => ({ lines: big ? lines.map((l) => l.replace(/(.)\bThe (shop|school|club|farm|library|museum)\b/g, '$1the $2')) : lines, unit, ans: answer });
    if ((big || money) && schema === 'separate') k = 1;      // money is given, not kept in a box
    switch (schema) {
        case 'join':
            return (k % 2)
                ? S([`${n1} has ${countOf(a, T)}.`, `${n2} has ${countOf(b, T)}.`, `How many ${T.many} do they have in all?`], T)
                : S([`${n1} has ${countOf(a, T)}.`, `${n1} gets ${countOf(b, T).replace(/^(\S+) /, '$1 more ')}.`, `How many ${T.many} does ${n1} have now?`], T);
        case 'compare-more':
            return S([`${n1} has ${countOf(a, T)}.`, `${n2} has ${countOf(b, T).replace(/^(\S+) /, '$1 more ')} than ${n1}.`, `How many ${T.many} does ${n2} have?`], T);
        case 'start-sub':
            return S([`${n1} had some ${T.many}.`, `${n1} gave away ${countOf(b, T)}.`, `Now ${n1} has ${countOf(a, T)}.`, `How many ${T.many} did ${n1} have at first?`], T);
        case 'separate':
            return (k % 2)
                ? S([`${n1} has ${countOf(a, T)}.`, `${n1} gives ${countOf(b, T)} to ${n2}.`, `How many ${T.many} does ${n1} have left?`], T)
                : S([`There ${a === 1 ? 'is' : 'are'} ${countOf(a, T)} in a box.`, `${n1} takes ${countOf(b, T)} out.`, `How many ${T.many} are left in the box?`], T);
        case 'compare':
            return S([`${n1} has ${countOf(a, T)}.`, `${n2} has ${countOf(b, T)}.`, `How many more ${T.many} does ${n1} have than ${n2}?`], T);
        case 'change':
            return S([`${n1} has ${countOf(b, T)}.`, `${n1} wants ${countOf(a, T)}.`, `How many more ${T.many} does ${n1} need?`], T);
        case 'start-add':
            return S([`${n1} had some ${T.many}.`, `${n1} got ${countOf(b, T).replace(/^(\S+) /, '$1 more ')}.`, `Now ${n1} has ${countOf(a, T)}.`, `How many ${T.many} did ${n1} have at first?`], T);
        case 'groups': {
            const G = pickAt(WW_CONTAINERS, k * 5 + 1);
            return S([`${n1} has ${countOf(b, G)}.`, `Each ${G.one} has ${countOf(a, T)}.`, `How many ${T.many} are there in all?`], T);
        }
        case 'times': {
            const m = times && (times === a || times === b) ? times : b;
            const s = m === a ? b : a;
            return S([`${n1} has ${countOf(s, T)}.`, `${n2} has ${num(m)} times as many ${T.many}.`, `How many ${T.many} does ${n2} have?`], T);
        }
        case 'sharing':
            if (b < 2) return null;
            return (k % 2)
                ? S([`${n1} has ${countOf(a, T)}.`, `${n1} puts them into ${num(b)} equal groups.`, `How many ${T.many} are in each group?`], T)
                : S([`${n1} has ${countOf(a, T)}.`, `${n1} shares them equally among ${num(b)} friends.`, `How many ${T.many} does each friend get?`], T);
        case 'grouping':
            return S([`${n1} has ${countOf(a, T)}.`, `${n1} puts ${countOf(b, T)} in each ${C.one}.`, `How many ${C.many} does ${n1} fill?`], C);
        case 'times-inverse':
            return S([`${n1} has ${countOf(a, T)}.`, `That is ${num(b)} times as many as ${n2} has.`, `How many ${T.many} does ${n2} have?`], T);
        case 'times-howmany':
            return S([`${n1} has ${countOf(b, T)}.`, `${n2} has ${countOf(a, T)}.`, `How many times as many ${T.many} does ${n2} have?`], null);
        case 'rem-left':
            return S([`${n1} has ${countOf(a, T)}.`, `${n1} puts ${countOf(b, T)} in each ${C.one}.`, `How many ${T.many} are left over?`], T);
        case 'rem-up':
            return a >= 2 && b >= 2
                ? S([`${countOf(a, CHILD)} go on a trip.`, `Each car holds ${countOf(b, CHILD)}.`, `How many cars do they need?`], CAR)
                : null;
        case 'rem-full':
            return S([`${n1} has ${countOf(a, T)}.`, `A full ${C.one} holds ${countOf(b, T)}.`, `How many ${C.many} can ${n1} fill?`], C);
        default:
            return null;
    }
}

/** A two-step story (P-WP-11): start, change 1, change 2, question; the name repeated, never "She". */
export function tellTwoStep(s1, s2, k = 0) {
    const n1 = pickAt(WW_NAMES, k);
    const T = pickAt(WW_THINGS, k * 7 + 3);
    const c1 = s1.op === '+' ? `${n1} got ${num(s1.bottom)} more.` : `${n1} gave away ${num(s1.bottom)}.`;
    const c2 = s2.op === '+' ? `Then ${n1} found ${num(s2.bottom)} more.` : `Then ${n1} lost ${num(s2.bottom)}.`;
    return { lines: [`${n1} had ${countOf(s1.top, T)}.`, c1, c2, `How many ${T.many} does ${n1} have now?`], unit: T, ans: s2.ans };
}

/* ---------------------------------------------------------------------- the payload */

/**
 * The payload of one word problem, or null when the story is not a whole-number one- or
 * two-step problem this cell can carry (the item then keeps its old cell).
 * @param {Object} q     the generated question (text, ans, a, b, op, hint)
 * @param {Object} [o]   {hl, kb, bar, pic, twoStep}
 */
export function wordWorkPayload(q, o = {}) {
    if (!q || typeof q.text !== 'string') return null;
    const ans = Number(String(q.ans).replace(/,/g, ''));
    if (!Number.isInteger(ans) || ans < 0) return null;
    let steps = null;
    if (o.twoStep) steps = parseTwoStep(q.hint);
    if (!steps) { const s = solveStory(q, { divFirst: !!o.divFirst }); steps = s ? [s] : null; }
    if (!steps) return null;
    const last = steps[steps.length - 1];
    if (last.op !== '/' && last.ans !== ans) return null;
    let lines = storyLines(q.text);
    if (!lines.length) return null;
    let unit = unitOf(q, ans);
    const seed = steps.reduce((s, st) => s + st.a * 7 + st.b * 13, ans);
    // The story is RETOLD in the controlled grammar (the K picture story keeps its own words).
    const schema = steps.length > 1 ? 'two-step' : schemaOf(q.text, last, ans);
    if (o.retell !== false) {
        const k = Number.isFinite(o.seed) ? o.seed : seed;
        const tm = /(\d[\d,]*)\s+times as many\b/i.exec(plain(q.text));
        const told = steps.length > 1 ? tellTwoStep(steps[0], steps[1], k)
            : tellStory(schema, last, k, { ans, money: /\b(dollars?|cents?|coins?)\b/i.test(q.text) && ['join', 'compare-more', 'start-sub', 'separate', 'compare', 'change', 'start-add'].includes(schema), times: tm ? Number(tm[1].replace(/,/g, '')) : null });
        if (told && told.ans === ans) {
            lines = told.lines;
            const u = told.unit;
            const others = [];
            for (const x of [...WW_CONTAINERS.map((c) => c.many), ...WW_THINGS.map((c) => c.many)]) if (lines.join(' ').includes(` ${x}`) && (!u || x !== u.many)) others.push(x);
            unit = u ? { word: ans === 1 ? u.one : u.many, many: u.many, others } : { word: '', many: '', others };
        }
    }
    // The answer is written ONCE (round-4 critic, H8): in the bottom row of the columns (or the
    // quotient row), with the unit line beside it. Only a division story whose answer is not the
    // quotient (a remainder read as "left over", "round up", or a quotient with a remainder) keeps
    // a separate "Answer: [ ] ____" line, and then its quotient row is working.
    const inRow = !(last.op === '/' && (last.r || ans !== last.q));
    const barKind = last.op === '*' || last.op === '/' ? 'groups' : /compare/.test(schema) ? 'compare' : 'whole';
    return {
        lines, steps, ans, unit: unit.word, bank: unitBank(unit, unit.others, seed), schema, inRow,
        tracks: Number(o.tracks) > 0 ? Number(o.tracks) : 0,
        hl: !!o.hl, kb: !!o.kb, bar: !!o.bar && steps.length === 1, barKind,
        pic: o.pic || null,
    };
}

/* ============================================================== the column work (pure) */

const hasCarry = (x, y) => { while (x > 0 || y > 0) { if ((x % 10) + (y % 10) >= 10) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; };
const hasBorrow = (x, y) => { while (x > 0 || y > 0) { if ((x % 10) < (y % 10)) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; };
const multCarry = (x, d) => { let c = 0; for (const ch of digitsOf(x).split('').reverse()) { const p = Number(ch) * d + c; c = Math.floor(p / 10); if (c) return true; } return false; };

/** The carries of x + y, by digit position from the ones (index 1 = the tens' carry). */
function addCarries(x, y) {
    const out = {};
    let c = 0, i = 0;
    while (x > 0 || y > 0 || c) {
        const s = (x % 10) + (y % 10) + c;
        c = s >= 10 ? 1 : 0;
        if (c) out[i + 1] = '1';
        x = Math.floor(x / 10); y = Math.floor(y / 10); i++;
        if (i > 12) break;
    }
    return out;
}

/** The regrouped top digits of x − y, by position from the ones ("13" over the ones). */
function subRegroup(x, y) {
    const d = digitsOf(x).split('').reverse().map(Number);
    const e = digitsOf(y).split('').reverse().map(Number);
    const cur = d.slice();
    const changed = {};
    for (let i = 0; i < d.length; i++) {
        const need = e[i] || 0;
        if (cur[i] < need) {
            let j = i + 1;
            while (j < cur.length && cur[j] === 0) j++;
            if (j >= cur.length) break;
            cur[j] -= 1; changed[j] = true;
            for (let k = j - 1; k > i; k--) { cur[k] = 9; changed[k] = true; }
            cur[i] += 10; changed[i] = true;
        }
    }
    const out = {};
    Object.keys(changed).forEach((k) => { out[k] = String(cur[k]); });
    return out;
}

/** The carries of x × d (one digit), by position from the ones: only into a digit of x (a carry
 *  out of the last digit is written in the answer, never above an empty track). */
function multCarries(x, d) {
    const out = {};
    let c = 0;
    const ds = digitsOf(x).split('').reverse();
    ds.forEach((ch, i) => {
        const p = Number(ch) * d + c;
        c = Math.floor(p / 10);
        if (c && i + 1 < ds.length) out[i + 1] = String(c);
    });
    return out;
}

/**
 * The rows of one column step: what each row holds on the KEY, as strings right-aligned to the
 * ones track, and which tracks carry a box. `T` counts the digit tracks (the sign track is extra).
 *
 * Round-4 critic: the geometry is the SKILL's, not the item's. `minT` (the tracks the skill's
 * largest numbers need) keeps every item of a page on the same tracks, and the regroup row is a
 * STRUCTURAL scaffold: every + and − item with two or more tracks gets it, empty on the pupil
 * page, the key filling only the boxes the item needs (a row printed only where regrouping
 * happens told the pupil whether to regroup). × gets a carry row only when its top number has
 * two or more digits and the multiplier one: a 1-digit fact has nothing to carry into.
 */
export function columnRows(st, minT = 0) {
    const x = st.top, y = st.bottom, z = st.ans;
    const lx = digitsOf(x).length, ly = digitsOf(y).length, lz = digitsOf(z).length;
    const rows = [];
    let T;
    if (st.op === '+') T = Math.max(lx, ly) + 1;
    else if (st.op === '-') T = Math.max(lx, ly, lz);
    else T = lx + ly;
    T = Math.max(T, lz, Number(minT) || 0);
    if (st.op === '+' && T >= 2) rows.push({ kind: 'carry', tracks: range(1, T), vals: addCarries(x, y) });
    else if (st.op === '-' && T >= 2) rows.push({ kind: 'carry', tracks: range(0, T), vals: subRegroup(x, y), wide: true });
    else if (st.op === '*' && ly === 1 && lx >= 2) rows.push({ kind: 'carry', tracks: range(1, T), vals: multCarries(x, y) });
    rows.push({ kind: 'num', value: String(x), id: 'top' });
    rows.push({ kind: 'num', value: String(y), id: 'bottom', sign: st.op });
    rows.push({ kind: 'rule' });
    if (st.op === '*' && ly > 1) {
        digitsOf(y).split('').reverse().forEach((ch, k) => {
            const p = x * Number(ch) * 10 ** k;
            rows.push({ kind: 'num', value: String(p).padStart(Math.max(1, k + 1), '0'), id: `pp${k}` });
        });
        rows.push({ kind: 'rule' });
    }
    rows.push({ kind: 'num', value: String(z), id: 'ans' });
    return { T, rows };
}
/** Positions [from, to) counted from the ones. */
function range(from, to) { const out = []; for (let i = from; i < to; i++) out.push(i); return out; }

/* ============================================================== drawing */

const BOX = { S: 8.5, M: 10, L: 11.5 };
const boxMm = (ctx) => BOX[sizeOf(ctx)];
const GAP = 0.8;

/** The ink a written value takes in this state. */
const inkOf = (ctx) => (ctx.state === 'traced' ? 'trace' : (ctx.state === 'answered' || ctx.state === 'wrong') ? 'solid' : null);
const filled = (ctx) => ctx.state !== 'blank';

/** A twin box's size: never under 44 px on a phone (RUBRIC C1 touch targets). */
const tw = (ctx, mm) => (isTwin(ctx) ? `max(44px, ${L(ctx, mm)})` : L(ctx, mm));

/**
 * One writing box. On paper a span (`data-ws-slot`), on screen an input the pupil types in
 * (scratch, ungraded) carrying the value the model expects.
 */
function wbox(ctx, { id, value = '', expect = '', w, h, pt, kind = 'digit', graded = false, small = false }) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const base = `box-sizing:border-box;width:${small && !isTwin(ctx) ? L(ctx, w) : tw(ctx, w)};height:${small && !isTwin(ctx) ? L(ctx, h) : tw(ctx, h)};border:${B(ctx, small ? 0.75 : 1)} solid ${small && isTwin(ctx) ? GREY : INK};`
        + `border-radius:${L(ctx, 1)};background:#fff;font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};font-weight:700;line-height:1;color:${color};text-align:center;${KEY_FEATURES}`;
    if (isTwin(ctx)) {
        const lab = kind === 'sign' ? 'sign' : kind === 'regroup' ? 'regroup digit' : 'digit';
        return `<input type="text" class="mq-wwork${small ? ' mq-wwsmall' : ''}" data-mq-kind="${kind}" data-mq-expect="${esc(expect)}" data-ws-graded="0"`
            + ` maxlength="${kind === 'regroup' ? 2 : 1}" inputmode="${kind === 'sign' ? 'text' : 'numeric'}" autocomplete="off" spellcheck="false" tabindex="0"`
            + ` aria-label="${lab}" style="${base}padding:0;margin:0;">`;
    }
    return `<span data-ws-slot="${esc(id)}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}${ink ? ` data-ws-ink="${ink}"` : ''}`
        + ` style="display:flex;align-items:center;justify-content:center;${base}">${esc(value)}</span>`;
}

/**
 * One box of the ANSWER row. On paper a graded digit slot; on screen the host's own digit box
 * (`data-mq-cell`: the host puts an input in it and composes the typed digits into the answer),
 * with the digit it expects, so the host can turn it green when it is right.
 */
function abox(ctx, { id, value = '', expect = '', w, pt }) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const base = `box-sizing:border-box;width:${tw(ctx, w)};height:${tw(ctx, w)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;`
        + `font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};font-weight:700;line-height:1;color:${color};text-align:center;${KEY_FEATURES}`;
    if (isTwin(ctx)) {
        return `<span class="mq-wwans" data-ws-slot="${esc(id)}" data-ws-shape="box" data-mq-cell="1" data-mq-w="1" data-mq-label="answer digit" data-mq-expect="${esc(expect)}" style="display:flex;align-items:center;justify-content:center;${base}"></span>`;
    }
    // a box left of the answer's digits holds nothing on the key: it is part of the row, not a slot;
    // finished work shown to be checked (Error analysis) is judged, its fix box is the slot
    return `<span data-ws-slot="${esc(id)}" data-ws-shape="box"${expect === '' || ctx.state === 'wrong' ? ' data-ws-graded="0"' : ''}${ink ? ` data-ws-ink="${ink}"` : ''} style="display:flex;align-items:center;justify-content:center;${base}">${esc(value)}</span>`;
}

/** The small sign row: + − × ÷, the chosen one ringed on the key. */
function signRow(ctx, op, pick, idx) {
    const s = boxMm(ctx) * (isTwin(ctx) ? 0.78 : 0.72);
    const pt = textPt(ctx) + 5;
    const ink = pick && filled(ctx) ? inkOf(ctx) : null;
    const cells = OPS.map((o) => {
        const ring = ink && o === pick
            ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -1.6)};top:${L(ctx, -1.6)};right:${L(ctx, -1.6)};bottom:${L(ctx, -1.6)};color:${ink === 'trace' ? GREY : INK};border:${B(ctx, 1.5)} solid currentColor;border-radius:50%;"></span>`
            : '';
        const face = `display:inline-flex;align-items:center;justify-content:center;position:relative;box-sizing:border-box;width:${tw(ctx, s)};height:${tw(ctx, s)};`
            + `border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};line-height:1;padding:0;`;
        if (isTwin(ctx)) {
            return `<button type="button" class="mq-wwop" data-mq-op="${o}" data-mq-expect="${o === op ? 1 : 0}" aria-pressed="false" aria-label="${WORD[o]}" style="${face}cursor:pointer;">${GLYPH[o]}</button>`;
        }
        return `<span data-ws-slot="op${idx}-${WORD[o]}" data-ws-shape="choice" data-ws-graded="0" style="${face}">${GLYPH[o]}${ring}</span>`;
    }).join('');
    return `<div class="mq-wwsigns" role="${isTwin(ctx) ? 'group' : 'presentation'}" aria-label="choose the sign" style="display:flex;gap:${L(ctx, 2.6)};justify-content:${isTwin(ctx) ? 'center' : 'flex-start'};padding:${L(ctx, isTwin(ctx) ? 1.6 : 0.4)} ${L(ctx, 1.6)};">${cells}</div>`;
}

/** The value in a column row at track i (0 = leftmost digit track), right-aligned. */
const at = (value, T, i) => { const p = String(value).padStart(T, ' '); return p[i] === ' ' ? '' : p[i]; };

/** The + − × column work of one step: a CSS grid of boxes, the sign box on the bottom row. */
function columnWork(ctx, st, show, idx, p = {}, isAnswer = false) {
    const minT = Math.max(Number(p.tracks) || 0, columnRows(st).T);
    const { T, rows } = columnRows(show, minT);
    const bx = boxMm(ctx), pt = digitPt(ctx);
    const sb = bx * 0.58;
    const cols = `${tw(ctx, bx)} repeat(${T}, ${tw(ctx, bx)})`;
    const expect = columnRows(st, minT);    // what the model expects, whatever is shown
    const eRow = (id) => (expect.rows.find((r) => r.id === id) || {}).value || '';
    const put = filled(ctx);
    let html = '';
    let r = 1;
    for (const row of rows) {
        if (row.kind === 'rule') {
            html += `<span style="grid-row:${r};grid-column:1 / -1;border-top:${B(ctx, 1.5)} solid ${INK};height:0;margin:${L(ctx, 0.4)} 0;"></span>`;
            r++; continue;
        }
        if (row.kind === 'carry') {
            const erow = expect.rows.find((x) => x.kind === 'carry');
            for (const pos of row.tracks) {
                const i = T - 1 - pos;           // track index from the left
                if (i < 0) continue;
                const v = put ? (row.vals[pos] || '') : '';
                const ev = erow ? (erow.vals[pos] || '') : '';
                const w = row.wide ? bx * 0.78 : sb;
                html += `<span style="grid-row:${r};grid-column:${i + 2};display:flex;justify-content:center;align-items:flex-end;">`
                    + wbox(ctx, { id: `w${idx}-rg-${pos}`, value: v, expect: ev, w, h: sb, pt: pt * (row.wide ? 0.5 : 0.56), kind: 'regroup', small: true }) + '</span>';
            }
            r++; continue;
        }
        if (row.sign) {
            html += `<span style="grid-row:${r};grid-column:1;">${wbox(ctx, { id: `w${idx}-sign`, value: put ? GLYPH[row.sign] : '', expect: GLYPH[st.op], w: bx, h: bx, pt, kind: 'sign' })}</span>`;
        }
        const ev = eRow(row.id);
        const eT = expect.T;
        // the bottom row of the LAST step is the one answer place (graded; on screen the host's
        // digit boxes, composing the answer): every other row is working the pupil writes in
        const ans = isAnswer && row.id === 'ans';
        for (let i = 0; i < T; i++) {
            const v = put ? at(row.value, T, i) : '';
            const e = eT === T ? at(ev, T, i) : '';
            html += `<span style="grid-row:${r};grid-column:${i + 2};">${ans ? abox(ctx, { id: `ans-${i}`, value: v, expect: e, w: bx, pt }) : wbox(ctx, { id: `w${idx}-${row.id}-${i}`, value: v, expect: e, w: bx, h: bx, pt })}</span>`;
        }
        r++;
    }
    return `<div class="mq-wwcols" role="group" aria-label="column work"${isAnswer && isTwin(ctx) ? ' data-mq-join=""' : ''} style="display:inline-grid;grid-template-columns:${cols};column-gap:${L(ctx, GAP)};row-gap:${L(ctx, 0.5)};align-items:end;">${html}</div>`;
}

/** The ÷ frame: divisor boxes, the bracket, dividend boxes, quotient boxes, the working, R. */
function divisionWork(ctx, st, show, idx, p = {}, isAnswer = false) {
    const x = show.top, y = show.bottom;
    const Dx = digitsOf(st.top).length, Dy = digitsOf(st.bottom).length;
    const bx = boxMm(ctx), pt = digitPt(ctx);
    const put = filled(ctx);
    const q = Math.floor(x / y), rem = x % y;
    const steps = divisionSteps(x, y);
    const eSteps = divisionSteps(st.top, st.bottom);
    const hasR = st.top % st.bottom !== 0;
    const bw = bx * 0.45;
    const cols = `repeat(${Dy}, ${tw(ctx, bx)}) ${L(ctx, bw)} repeat(${Dx}, ${tw(ctx, bx)})${hasR ? ` auto ${tw(ctx, bx)}` : ''}`;
    const c0 = Dy + 2;                                  // the dividend's first grid column
    let html = '';
    // row 1: the quotient over the dividend (one box over every dividend track, VA-61), then R [ ]
    const qs = String(q).padStart(Dx, ' '), eq = String(Math.floor(st.top / st.bottom)).padStart(Dx, ' ');
    for (let i = 0; i < Dx; i++) {
        html += `<span style="grid-row:1;grid-column:${c0 + i};">${isAnswer ? abox(ctx, { id: `ans-${i}`, value: put ? qs[i].trim() : '', expect: eq[i].trim(), w: bx, pt }) : wbox(ctx, { id: `w${idx}-q-${i}`, value: put ? qs[i].trim() : '', expect: eq[i].trim(), w: bx, h: bx, pt })}</span>`;
    }
    if (hasR) {
        html += `<span style="grid-row:1;grid-column:${c0 + Dx};align-self:center;font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;padding:0 ${L(ctx, 1.2)};">R</span>`
            + `<span style="grid-row:1;grid-column:${c0 + Dx + 1};">${wbox(ctx, { id: `w${idx}-r`, value: put ? String(rem) : '', expect: String(st.top % st.bottom), w: bx, h: bx, pt })}</span>`;
    }
    // row 2: divisor | bracket | dividend (the vinculum over the dividend)
    const ys = String(y).padStart(Dy, ' '), eys = String(st.bottom).padStart(Dy, ' ');
    for (let i = 0; i < Dy; i++) html += `<span style="grid-row:2;grid-column:${i + 1};">${wbox(ctx, { id: `w${idx}-dv-${i}`, value: put ? ys[i].trim() : '', expect: eys[i].trim(), w: bx, h: bx, pt })}</span>`;
    const hMm = bx + 1.6;
    html += `<span aria-hidden="true" style="grid-row:2;grid-column:${Dy + 1};align-self:stretch;display:flex;align-items:stretch;justify-content:center;">`
        + `<svg viewBox="0 0 10 40" preserveAspectRatio="none" style="display:block;width:${L(ctx, bw)};height:${isTwin(ctx) ? `max(48px, ${L(ctx, hMm)})` : L(ctx, hMm)};overflow:visible;"><path d="M2 1 Q9 20 2 39" fill="none" stroke="${INK}" stroke-width="2.4" vector-effect="non-scaling-stroke"/></svg></span>`;
    html += `<span style="grid-row:2;grid-column:${c0} / span ${Dx};border-top:${B(ctx, 1.5)} solid ${INK};align-self:start;height:0;"></span>`;
    const xs = String(x).padStart(Dx, ' '), exs = String(st.top).padStart(Dx, ' ');
    for (let i = 0; i < Dx; i++) html += `<span style="grid-row:2;grid-column:${c0 + i};padding-top:${L(ctx, 0.8)};">${wbox(ctx, { id: `w${idx}-dd-${i}`, value: put ? xs[i].trim() : '', expect: exs[i].trim(), w: bx, h: bx, pt })}</span>`;
    // the working: two rows per step (the product, then the difference and the digit brought down)
    const rowsOf = (sts) => {
        const out = [];
        for (const s of sts) {
            const prod = String(s.product);
            out.push({ text: prod, end: s.col, minus: true });
            // the difference and the digit brought down beside it ("0" + "5" is written 5)
            const diff = s.bring !== null ? (s.rem === 0 ? String(s.bring) : `${s.rem}${s.bring}`) : String(s.rem);
            out.push({ text: diff, end: s.bring !== null ? s.col + 1 : s.col });
        }
        return out;
    };
    const eRows = rowsOf(eSteps);
    const sRows = rowsOf(steps);
    eRows.forEach((er, k) => {
        const sr = sRows[k] || { text: '', end: 0 };
        const row = 3 + k;
        if (er.minus) html += `<span style="grid-row:${row};grid-column:${Dy + 1};align-self:center;text-align:center;font-size:${P(ctx, pt * 0.8)};">−</span>`;
        for (let i = 0; i < Dx; i++) {
            const sAt = i - (sr.end - sr.text.length + 1);
            const eAt = i - (er.end - er.text.length + 1);
            const v = put && sAt >= 0 && sAt < sr.text.length ? sr.text[sAt] : '';
            const e = eAt >= 0 && eAt < er.text.length ? er.text[eAt] : '';
            html += `<span style="grid-row:${row};grid-column:${c0 + i};${er.minus ? `border-bottom:${B(ctx, 0.75)} solid ${INK};padding-bottom:${L(ctx, 0.6)};` : ''}">${wbox(ctx, { id: `w${idx}-wk${k}-${i}`, value: v, expect: e, w: bx, h: bx, pt })}</span>`;
        }
    });
    return `<div class="mq-wwcols mq-wwdiv" role="group" aria-label="division work"${isAnswer && isTwin(ctx) ? ' data-mq-join=""' : ''} style="display:inline-grid;grid-template-columns:${cols};column-gap:${L(ctx, GAP)};row-gap:${L(ctx, 0.5)};align-items:end;">${html}</div>`;
}

/** The width (mm) of one step's work block: the wider of its sign row and its columns. */
function blockWidthMm(ctx, st, p = {}) {
    const bx = boxMm(ctx);
    const signs = 4 * bx * 0.72 + 3 * 2.6 + 3.2;
    let work;
    if (st.op === '/') {
        const Dx = digitsOf(st.top).length, Dy = digitsOf(st.bottom).length;
        work = (Dx + Dy) * (bx + GAP) + bx * 0.45 + (st.top % st.bottom ? bx + 6 : 0);
    } else {
        work = (columnRows(st, p.tracks).T + 1) * (bx + GAP);
    }
    return Math.max(signs, work);
}

/** One step's work block: its sign row over its columns. */
function stepBlock(ctx, st, show, pick, idx, caption, p = {}, unitBlock = '', noSigns = false) {
    const isAnswer = !!unitBlock || (p.inRow && idx === (p.steps || []).length - 1);
    const grid = st.op === '/' ? divisionWork(ctx, st, show, idx, p, isAnswer) : columnWork(ctx, st, show, idx, p, isAnswer);
    // The unit line stands beside the answer row (the bottom row; the quotient row of ÷), its
    // word bank beside it: one answer place, number and label together.
    const work = unitBlock
        ? (isTwin(ctx)
            // on screen the label line and its word chips sit in one row right under the columns
            ? `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">${grid}${unitBlock}</div>`
            : `<div style="display:flex;gap:${L(ctx, 3)};align-items:${st.op === '/' ? 'flex-start' : 'flex-end'};">${grid}${unitBlock}</div>`)
        : grid;
    const cap = caption ? `<div style="font-size:${P(ctx, zonePt(ctx))};font-weight:700;line-height:1.3;">${esc(caption)}</div>` : '';
    return `<div class="mq-wwstep" style="display:flex;flex-direction:column;align-items:${isTwin(ctx) ? 'center' : 'flex-start'};gap:${L(ctx, 1)};">${cap}${noSigns ? '' : signRow(ctx, st.op, pick, idx)}`
        + `<div style="max-width:100%;overflow-x:auto;">${work}</div></div>`;
}

/** The story, the key words bold and underlined when asked (never colour, PT-WPR-6). */
function storyHTML(ctx, p, narrow = false) {
    const ops = p.hl ? p.steps.map((s) => s.op) : [];
    const lines = p.lines.map((line) => {
        if (!ops.length) return `<div>${esc(line)}</div>`;
        let out = '', i = 0;
        for (const [s, e] of cueRanges(line, ops)) {
            out += esc(line.slice(i, s)) + `<b data-ww-cue="1" style="font-weight:700;text-decoration:underline;text-underline-offset:0.18em;text-decoration-thickness:0.08em;">${esc(line.slice(s, e))}</b>`;
            i = e;
        }
        return `<div>${out}${esc(line.slice(i))}</div>`;
    }).join('');
    // On screen the story is the cell's own: an empty SVG keeps the host from hiding the block as
    // a repeat of its text line (screen-cell.js hideRepeatedPrompt skips a block that holds one);
    // the host hides its own line instead (visualRepeatsText), so the story is said once, here.
    const keep = isTwin(ctx) ? '<svg aria-hidden="true" width="0" height="0" style="position:absolute;"></svg>' : '';
    return `<div class="mq-wwstory" style="flex:1 1 auto;min-width:0;text-align:left;font-size:${P(ctx, textPt(ctx) + (narrow && !isTwin(ctx) ? 0 : 2))};line-height:${narrow && !isTwin(ctx) ? 1.2 : 1.4};">${keep}${lines}</div>`;
}

/** The keyword bank box: each sign with its cue phrases (a fixed panel, the same on every item). */
function keywordBank(ctx) {
    const z = zonePt(ctx);
    const rows = KEYWORD_BANK.map((r) => `<div style="display:flex;gap:${L(ctx, 2)};align-items:baseline;"><b style="display:inline-block;width:${L(ctx, 4)};font-size:${P(ctx, z + 2)};">${GLYPH[r.op]}</b><span>${esc(r.words.join(', '))}</span></div>`).join('');
    return `<div class="mq-wwbank" aria-label="key words" style="flex:none;box-sizing:border-box;width:${L(ctx, 64)};border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1.4)} ${L(ctx, 2)};font-size:${P(ctx, z)};line-height:1.35;text-align:left;">`
        + `<div style="font-weight:700;">Key words</div>${rows}</div>`;
}

/** A bar model with blank label boxes (the key writes the numbers and the answer). */
function barModel(ctx, p) {
    const st = p.steps[0];
    const put = filled(ctx);
    const ink = inkOf(ctx);
    const W = 150, H = 8;
    // A bar label is written on paper and typed on screen (scratch, never graded, SP-1 parity).
    const lab = (v, w) => (isTwin(ctx)
        ? `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(String(v).replace(/,/g, ''))}" data-ws-graded="0" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="bar label" style="box-sizing:border-box;width:${L(ctx, Math.max(w, 16))};min-width:44px;height:max(44px, ${L(ctx, 7)});border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, zonePt(ctx) + 2)};font-weight:700;text-align:center;padding:0;">`
        : `<span data-ws-graded="0" data-ws-slot="bar" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, w)};height:${L(ctx, 7)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, zonePt(ctx) + 2)};font-weight:700;padding:0 ${L(ctx, 1)};color:${ink === 'trace' ? GREY : INK};"${put && ink ? ` data-ws-ink="${ink}"` : ''}>${put ? esc(v) : ''}</span>`);
    const seg = (w, inner, dashed) => `<span style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, H + 3)};border:${B(ctx, 1)} ${dashed ? 'dashed' : 'solid'} ${INK};background:#fff;">${inner}</span>`;
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const row = (inner) => `<div style="display:flex;align-items:center;">${inner}</div>`;
    let body = '';
    if (p.barKind === 'groups') {
        const whole = st.op === '*' ? st.ans : st.top;
        const part = st.op === '*' ? st.top : (st.ans === st.q ? st.q : st.bottom);
        const n = st.op === '*' ? (st.bottom <= 10 ? st.bottom : 10) : (st.bottom <= 10 ? st.bottom : Math.min(10, st.q || 10));
        const w = W / n;
        body = row(seg(W, lab(fmt(whole), 16), false))
            + row(Array.from({ length: n }, (_, i) => seg(w, i === 0 ? lab(fmt(part), Math.min(14, w - 2)) : '', false)).join(''));
    } else if (p.barKind === 'compare') {
        const big = st.op === '-' ? st.top : st.ans;
        const small = st.op === '-' ? st.bottom : st.top;
        const diff = st.op === '-' ? st.ans : st.bottom;
        const ws = Math.max(30, Math.min(W - 30, W * small / Math.max(1, big)));
        body = row(seg(W, lab(fmt(big), 16), false))
            + row(seg(ws, lab(fmt(small), 16), false) + `<span style="display:flex;align-items:center;justify-content:center;width:${L(ctx, W - ws)};height:${L(ctx, H + 3)};border:${B(ctx, 1)} dashed ${INK};border-left:none;box-sizing:border-box;">${lab(fmt(diff), 14)}</span>`);
    } else {
        const whole = st.op === '+' ? st.ans : st.top;
        const pa = st.op === '+' ? st.top : st.bottom;
        const pb = st.op === '+' ? st.bottom : st.ans;
        const wa = Math.max(30, Math.min(W - 30, W * pa / Math.max(1, whole)));
        body = row(seg(W, lab(fmt(whole), 16), false)) + row(seg(wa, lab(fmt(pa), 16), false) + seg(W - wa, lab(fmt(pb), 16), false));
    }
    return `<div class="mq-wwbar" aria-label="bar model" style="display:flex;flex-direction:column;gap:${L(ctx, 1.2)};margin-top:${L(ctx, 1.5)};">${body}</div>`;
}

/** The K picture of the two groups (add_wp_10 with pictures on): line-art objects to count. */
function pictureRow(ctx, pic) {
    if (!pic) return '';
    // Two groups, each its own drawing (9 mm objects, RP-20 >= 8 mm), a clear gap between them;
    // in a narrow column the second group wraps under the first instead of shrinking (DN-10).
    const d = 9, pitch = d + 2.2;
    const group = (n) => {
        const w = (n - 1) * pitch + d + 2, h = d + 2;
        let body = '';
        for (let i = 0; i < n; i++) body += shapeOf(pic.shape).draw(1 + d / 2 + i * pitch, 1 + d / 2, d);
        return `<svg class="k2-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}" aria-hidden="true" `
            + `style="display:block;width:${L(ctx, w)};height:auto;max-width:100%;overflow:visible;">${body}</svg>`;
    };
    return `<div role="img" aria-label="${pic.a} and ${pic.b} ${esc(shapeOf(pic.shape).plural)}" style="display:flex;flex-wrap:wrap;gap:${L(ctx, 3)} ${L(ctx, 9)};margin-top:${L(ctx, 1.5)};">${group(pic.a)}${group(pic.b)}</div>`;
}

/** "Answer: [box] ______" and the unit-word bank under it. */
function answerBlock(ctx, p, shown, unitShown, vertical = false) {
    const bx = boxMm(ctx);
    const tp = textPt(ctx) + 2;
    const digits = Math.max(2, ...p.steps.map((s) => Math.max(digitsOf(s.top).length, digitsOf(s.bottom).length, digitsOf(s.ans).length)));
    const w = Math.max(blankWidth(digits, sizeOf(ctx)), bx * 1.4);
    const ink = shown !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const boxStyle = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${tw(ctx, w)};height:${tw(ctx, bx + 1)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${color};${KEY_FEATURES}`;
    const num = `<span data-ws-slot="answer" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${isTwin(ctx) ? ' data-mq-blank="box"' : ''} style="${boxStyle}">${esc(shown)}</span>`;
    const uw = isTwin(ctx) ? 26 : vertical ? { S: 20, M: 22, L: 24 }[sizeOf(ctx)] : { S: 28, M: 32, L: 36 }[sizeOf(ctx)];
    const uInk = unitShown !== '' ? inkOf(ctx) : null;
    const unit = p.unit
        ? `<span class="mq-wwunit" data-ws-slot="answer-label" data-ws-shape="line" data-ws-graded="0"${uInk ? ` data-ws-ink="${uInk}"` : ''} data-mq-expect="${esc(p.unit)}" style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;width:${L(ctx, uw)};min-height:${L(ctx, bx * 0.8)};border-bottom:${B(ctx, 1)} solid ${INK};font-size:${P(ctx, tp)};font-weight:700;line-height:1.1;color:${uInk === 'trace' ? GREY : INK};">${esc(unitShown)}</span>`
        : '';
    const bank = p.unit && p.bank && p.bank.length
        ? `<div class="mq-wwwords" aria-label="unit words" style="display:inline-flex;${vertical ? 'flex-direction:column;align-items:flex-start;' : 'align-items:center;'}gap:${L(ctx, vertical ? 0.4 : 1.6)};border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 0.8)} ${L(ctx, 1.8)};font-size:${P(ctx, zonePt(ctx) + 1)};line-height:1.2;">`
            + p.bank.map((wd) => (isTwin(ctx)
                ? `<button type="button" class="mq-wwword" data-mq-word="${esc(wd)}" style="min-height:44px;min-width:44px;padding:0 ${L(ctx, 1.5)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font:inherit;cursor:pointer;">${esc(wd)}</button>`
                : `<span>${esc(wd)}</span>`)).join(isTwin(ctx) || vertical ? '' : `<span aria-hidden="true">·</span>`)
            + '</div>'
        : '';
    if (vertical) {
        // beside a narrow column stack (a 2-column page): label, box, unit line, the bank under it
        return `<div class="mq-wwanswer" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 1.4)};font-size:${P(ctx, tp)};">`
            + `<span style="font-weight:700;line-height:1.1;">Answer:</span>${num}${unit}${bank}</div>`;
    }
    return `<div class="mq-wwanswer" style="display:flex;flex-direction:column;align-items:${isTwin(ctx) ? 'center' : 'flex-start'};gap:${L(ctx, 1.6)};">`
        + `<div style="display:flex;align-items:flex-end;gap:${L(ctx, 2)};font-size:${P(ctx, tp)};flex-wrap:${isTwin(ctx) ? 'nowrap' : 'wrap'};justify-content:center;"><span style="font-weight:700;align-self:center;">Answer:</span>${num}${unit}</div>`
        + bank + '</div>';
}

/**
 * The label beside the answer row: the unit-word bank and the line the pupil copies the word
 * onto. Above the line for a bottom answer row, under it for the quotient row of ÷.
 */
function unitBlock(ctx, p, unitShown, top = false) {
    if (!p.unit) return '';
    const bx = boxMm(ctx);
    const tp = textPt(ctx) + 2;
    const uw = isTwin(ctx) ? 26 : { S: 20, M: 22, L: 24 }[sizeOf(ctx)];
    const uInk = unitShown !== '' ? inkOf(ctx) : null;
    const line = `<span class="mq-wwunit" data-ws-slot="answer-label" data-ws-shape="line" data-ws-graded="0"${uInk ? ` data-ws-ink="${uInk}"` : ''} data-mq-expect="${esc(p.unit)}" aria-label="label" style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;width:${L(ctx, uw)};height:${isTwin(ctx) ? `max(44px, ${L(ctx, bx)})` : L(ctx, bx)};border-bottom:${B(ctx, 1)} solid ${INK};font-size:${P(ctx, tp)};font-weight:700;line-height:1.1;padding-bottom:${L(ctx, 0.6)};color:${uInk === 'trace' ? GREY : INK};">${esc(unitShown)}</span>`;
    const bank = p.bank && p.bank.length
        ? `<div class="mq-wwwords" aria-label="label words" style="display:inline-flex;flex-direction:${isTwin(ctx) ? 'row' : 'column'};align-items:flex-start;gap:${L(ctx, isTwin(ctx) ? 1.2 : 0.3)};border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 0.6)} ${L(ctx, 1.6)};font-size:${P(ctx, zonePt(ctx) + 1)};line-height:1.15;">`
            + p.bank.map((wd) => (isTwin(ctx)
                ? `<button type="button" class="mq-wwword" data-mq-word="${esc(wd)}" style="min-height:44px;min-width:44px;padding:0 ${L(ctx, 1.5)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font:inherit;cursor:pointer;">${esc(wd)}</button>`
                : `<span>${esc(wd)}</span>`)).join('')
            + '</div>'
        : '';
    if (isTwin(ctx)) return `<div class="mq-wwanswer" style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center;gap:${L(ctx, 2)};">${line}${bank}</div>`;
    return `<div class="mq-wwanswer" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 1.2)};">${top ? line + bank : bank + line}</div>`;
}

/** The step a cell SHOWS: the model's, or (Error analysis) the same numbers worked with the wrong sign. */
function shownSteps(p, ctx) {
    const w = ctx.state === 'wrong' ? (ctx.wrong || {}) : null;
    const wop = w && w.slots && opKey(w.slots.op);
    if (!wop) return { steps: p.steps, picks: p.steps.map((s) => s.op), ans: String(p.ans) };
    const out = p.steps.map((s, i) => {
        if (i !== p.steps.length - 1) return s;
        const x = Math.max(s.a, s.b), y = Math.min(s.a, s.b);
        const alt = wop === '-' || wop === '/' ? makeStep(x, wop, y) : makeStep(s.a, wop, s.b);
        return alt || s;
    });
    const last = out[out.length - 1];
    return { steps: out, picks: out.map((s) => s.op), ans: w.value !== undefined && w.value !== null ? String(w.value) : String(last.op === '/' ? last.q : last.ans) };
}

register(WW_TEMPLATE, {
    render(p, ctx) {
        if (!p || !Array.isArray(p.steps) || !p.steps.length) return '';
        const twin = isTwin(ctx);
        // A cell in a 2- or 3-column grid (and the screen twin) stacks its zones: story, sign
        // row, columns, answer. A full-width cell puts the answer beside the columns, so a page
        // at L still holds two or three stories (the page measures which fits, DN-10).
        const narrow = twin || Number(ctx.columns || 1) >= 2;
        const put = filled(ctx);
        const sh = shownSteps(p, ctx);
        const two = p.steps.length > 1;
        const inRow = p.inRow !== false;
        const lastI = p.steps.length - 1;
        const unitHere = inRow ? unitBlock(ctx, p, put ? p.unit : '', p.steps[lastI].op === '/') : '';
        const blocks = p.steps.map((st, i) => stepBlock(ctx, st, sh.steps[i], put ? sh.picks[i] : null, i, two ? `Step ${i + 1}` : '', p, i === lastI ? unitHere : '')).join('');
        const answer = inRow ? '' : answerBlock(ctx, p, put ? sh.ans : '', put ? p.unit : '');
        // In a column cell a separate "Answer:" block stands BESIDE a narrow stack; a wider stack
        // (or a two-step story) makes the cell a full-width one (see fullW below).
        const cols = Math.max(1, Number(ctx.columns || 1));
        const innerW = 186 / cols - (cols > 1 ? 9 : 10);
        const beside = (p.unit ? { S: 22, M: 25, L: 28 }[sizeOf(ctx)] : 0) + 3;
        const side = !twin && narrow && !two && blockWidthMm(ctx, p.steps[0], p) + (inRow ? beside : 5 + { S: 20, M: 22, L: 24 }[sizeOf(ctx)]) <= innerW;
        const head = `<div style="display:flex;gap:${L(ctx, 4)};align-items:flex-start;${narrow ? 'flex-direction:column;align-items:stretch;' : ''}">${storyHTML(ctx, p, narrow)}${p.kb ? keywordBank(ctx) : ''}</div>`
            + pictureRow(ctx, p.pic) + (p.bar ? barModel(ctx, p) : '');
        // A FULL-WIDTH cell whose work is narrow reads left to right: the story with its sign row
        // under it on the left, the columns and the answer on the right. The page then holds three
        // stories at L (the word-problem role's 12.1 ceiling) with no half-empty right side (H13).
        const workW = blockWidthMm(ctx, p.steps[0], p) + (inRow ? beside : 44);
        if (!twin && !narrow && !two && !p.kb && workW <= 88) {
            const grid = stepBlock(ctx, p.steps[0], sh.steps[0], put ? sh.picks[0] : null, 0, '', p, unitHere, true);
            const left = `<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${L(ctx, 2)};">${head}${signRow(ctx, p.steps[0].op, put ? sh.picks[0] : null, 0)}</div>`;
            const right = `<div style="flex:none;display:flex;align-items:flex-end;gap:${L(ctx, 5)};">${grid}${answer ? answerBlock(ctx, p, put ? sh.ans : '', put ? p.unit : '', true) : ''}</div>`;
            return `<div class="mq-ww" data-ww-ops="${p.steps[0].op}" style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${L(ctx, 5)};display:flex;gap:${L(ctx, 6)};align-items:flex-start;">${left}${right}</div>`;
        }
        const body = side
            ? `<div style="display:flex;align-items:flex-start;gap:${L(ctx, 5)};margin-top:${L(ctx, 1.2)};">${blocks}${answer ? answerBlock(ctx, p, put ? sh.ans : '', put ? p.unit : '', true) : ''}</div>`
            : narrow
            ? `<div style="display:flex;flex-direction:column;align-items:${twin ? 'center' : 'flex-start'};gap:${L(ctx, 3)};margin-top:${L(ctx, 3)};">${two ? `<div style="display:flex;flex-wrap:wrap;gap:${L(ctx, 6)};justify-content:${twin ? 'center' : 'flex-start'};">${blocks}</div>` : blocks}${answer}</div>`
            : `<div style="display:flex;align-items:flex-end;gap:${L(ctx, 8)};margin-top:${L(ctx, 3)};">${blocks}${answer ? `<div style="margin-left:auto;padding-right:${L(ctx, 4)};">${answer}</div>` : ''}</div>`;
        // A column cell that cannot hold its answer beside the work (a wide stack, two steps) is a
        // FULL-WIDTH item: it keeps its full-width layout's width, so the page's measurement reads
        // it as not fitting the column and prints it in the full-width group at the bottom
        // (practice.js splitWide) instead of a tall, half-empty column cell (RUBRIC H13).
        const fullW = !twin && narrow && !side ? `min-width:${L(ctx, 120)};` : '';
        return `<div class="mq-ww" data-ww-ops="${p.steps.map((s) => s.op).join(' ')}" style="width:100%;${fullW}box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${twin ? '0' : L(ctx, narrow ? 2.5 : 5)};">${head}${body}</div>`;
    },
    answerKey(p) {
        const slots = { answer: { value: String(p.ans), graded: true, accept: [Number(p.ans).toLocaleString('en-US')] } };
        // the answer row's digit boxes (the one answer place when the answer is the row's result)
        if (p.inRow !== false && Array.isArray(p.steps) && p.steps.length) {
            const st = p.steps[p.steps.length - 1];
            const T = st.op === '/' ? digitsOf(st.top).length : columnRows(st, p.tracks).T;
            const d = String(p.ans).padStart(T, ' ');
            for (let i = 0; i < T; i++) slots[`ans-${i}`] = { value: d[i] === ' ' ? '' : d[i], graded: d[i] !== ' ' };
        }
        if (p.unit) slots['answer-label'] = { value: p.unit, graded: false };
        (p.steps || []).forEach((s, i) => { slots[`op${i}`] = { value: GLYPH[s.op], graded: false }; });
        return { value: p.ans, display: p.unit ? `${Number(p.ans).toLocaleString('en-US')} ${p.unit}` : String(p.ans), slots };
    },
    // Measured: a story of small numbers stands in 2 columns; one whose columns are wider than a
    // 2-column cell is measured to one and goes in the full-width group (practice.js splitWide).
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2, restacks: true }; },
    inputs(p) {
        const out = [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        if (p && p.unit) out.push({ id: 'answer-label', kind: 'unit', shape: 'line', graded: false, order: 1, scopes: ['full'] });
        return out;
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

/* ============================================================== screen twin */

/** The screen twin of a word-work cell (`q.visual`): the host's input takes the answer box. */
export function wordWorkTwin(renderCellFn, payload) {
    const html = renderCellFn({ cell: { template: WW_TEMPLATE, payload, v: 1 } }, { mode: 'print', size: 'L', look: 'ican', state: 'blank', options: { twin: true } });
    return `<div class="k2-twin mq-wwtwin" data-mq-template="${WW_TEMPLATE}" style="text-align:center;color:${INK};">${html}</div>`;
}
