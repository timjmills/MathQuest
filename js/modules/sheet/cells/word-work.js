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
import { L, P, B, INK, GREY, KEY_FEATURES, isTwin, sizeOf, digitPt, textPt, zonePt, shapeOf, n2, checkBox } from './k2kit.js';
import { divisionSteps } from './long-division.js';
import { partWholeBar } from '../graphics/part-whole-bar.js';
import { sentenceFrame, sentenceFrameWidthMm } from '../graphics/sentence-frame.js';

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
    // a comparison between two people: the question asks about someone other than the story's
    // first subject, and nobody gives or adds ("Noor earned 7. Omar earned 3 more. How many did Omar earn?")
    const raw = String(text || '');
    const subj0 = (raw.match(/^\s*([A-Z][a-z]+)\b/) || [])[1];
    const subjQ = (raw.match(/\b(?:did|does|do)\s+([A-Z][a-z]+)\b[^.?!]*\?\s*$/) || [])[1];
    const twoPeople = !!(subj0 && subjQ && subj0 !== subjQ && !/\b(gave|gives|added|adds|give)\b/.test(t));
    if (st.op === '+') {
        if (some) return 'start-sub';
        if (/\bmore( \w+)? than\b/.test(t) || (twoPeople && /\bmore\b/.test(t))) return 'compare-more';
        return 'join';
    }
    if (st.op === '-') {
        if (some) return 'start-add';
        if (change && /\bhow many more\b/.test(t)) return 'change';
        // change-unknown join told as "had a … now has b. How many did X earn / get?": the
        // missing change, retold as "has a, wants b, how many more needed" (never a give-away)
        if (change && /\bhow many \w+ did .+? (earn|get|gain|save|find|collect)\b/.test(t)) return 'change';
        // "Omar has 7 fewer than Noor": a fewer comparison, never a give-away
        if (/\bfewer\b|\bless than\b/.test(t) && !/\bhow many (fewer|less)\b/.test(t)) return 'compare-fewer';
        // "had 50, after spending some has 20 left, how many spent?": the change is unknown
        if (/\bafter\b[^.]*\b(some|part|a while)\b|\bnow there (are|is)\b/.test(t) && /\b(left|now)\b/.test(t)) return 'take-some';
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
        case 'compare-fewer':
            return S([`${n1} has ${countOf(a, T)}.`, `${n2} has ${b} fewer ${b === 1 ? T.one : T.many} than ${n1}.`, `How many ${T.many} does ${n2} have?`], T);
        case 'take-some':
            return S([`${n1} had ${countOf(a, T)}.`, `${n1} gave some away.`, `Now ${n1} has ${countOf(b, T)}.`, `How many ${T.many} did ${n1} give away?`], T);
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
    // A × or ÷ first step (msOps, 3.OA.D.8): equal groups or a fair share, then a change. s1.a / s1.b keep the
    // story's order (groups, each / total, friends); the change is the Step 2 number.
    // A + or − first step, then × or ÷ (msOps addmult / adddiv, brackets): parts in each group / a total shared.
    if ((s1.op === '+' || s1.op === '-') && (s2.op === '*' || s2.op === '/')) {
        const n = s2.bottom;
        if (s2.op === '*') {
            const C = pickAt(WW_CONTAINERS, k * 5 + 1);
            const L = s1.op === '+'
                ? [`Each ${C.one} has ${num(s1.a)} red ${s1.a === 1 ? T.one : T.many} and ${num(s1.b)} blue ${s1.b === 1 ? T.one : T.many}.`, `${n1} has ${countOf(n, C)}.`, `How many ${T.many} does ${n1} have?`]
                : [`Each ${C.one} had ${countOf(s1.a, T)}.`, `${n1} took ${num(s1.b)} out of each ${C.one}.`, `${n1} has ${countOf(n, C)}.`, `How many ${T.many} are in the ${C.many} now?`];
            return { lines: L, unit: T, ans: s2.ans };
        }
        const L = s1.op === '+'
            ? [`${n1} has ${num(s1.a)} red ${s1.a === 1 ? T.one : T.many} and ${num(s1.b)} blue ${s1.b === 1 ? T.one : T.many}.`, `${n1} shares them equally among ${num(n)} friends.`, `How many ${T.many} does each friend get?`]
            : [`${n1} has ${countOf(s1.a, T)}.`, `${n1} keeps ${num(s1.b)}.`, `${n1} shares the rest equally among ${num(n)} friends.`, `How many ${T.many} does each friend get?`];
        return { lines: L, unit: T, ans: s2.ans };
    }
    if (s1.op === '*' || s1.op === '/') {
        const c = s2.bottom;
        if (s1.op === '*') {
            const C = pickAt(WW_CONTAINERS, k * 5 + 1);
            const ch = s2.op === '+' ? `${n1} gets ${num(c)} more ${c === 1 ? T.one : T.many}.` : `${n1} gives away ${countOf(c, T)}.`;
            return { lines: [`${n1} has ${countOf(s1.a, C)}.`, `Each ${C.one} has ${countOf(s1.b, T)}.`, ch, `How many ${T.many} does ${n1} have ${s2.op === '+' ? 'now' : 'left'}?`], unit: T, ans: s2.ans };
        }
        const ch = s2.op === '+' ? `Each friend gets ${num(c)} more.` : `Each friend gives away ${num(c)}.`;
        return { lines: [`${n1} has ${countOf(s1.a, T)}.`, `${n1} shares them equally among ${num(s1.b)} friends.`, ch, `How many ${T.many} does each friend have now?`], unit: T, ans: s2.ans };
    }
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
            : tellStory(schema, last, k, { ans, money: /\b(dollars?|cents?|coins?)\b/i.test(q.text) && ['join', 'compare-more', 'start-sub', 'separate', 'compare', 'change', 'start-add', 'compare-fewer', 'take-some'].includes(schema), times: tm ? Number(tm[1].replace(/,/g, '')) : null });
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
        ...(steps.length === 2 && steps[0].op === '/' && steps[0].top <= 100 && steps[0].bottom <= 10 && !steps[0].r ? { factDiv: true } : {}),
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
function signRow(ctx, op, pick, idx, traceIt = false) {
    const s = boxMm(ctx) * (isTwin(ctx) ? 0.78 : 0.72);
    const pt = textPt(ctx) + 5;
    // (`traceIt` - a blank cell's sign ringed in grey: Guided cell 1 of the detailed lesson maker, lesson 7)
    const tr = traceIt && !isTwin(ctx);
    if (tr) pick = op;
    const ink = tr ? 'trace' : pick && filled(ctx) ? inkOf(ctx) : null;
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
    // (`factDiv` - a two-step story's ÷ first step is a table fact, msOps lesson 7: the quotient only, no working rows)
    if (!(p.factDiv && idx === 0)) eRows.forEach((er, k) => {
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
    return `<div class="mq-wwstep" style="display:flex;flex-direction:column;align-items:${isTwin(ctx) ? 'center' : 'flex-start'};gap:${L(ctx, 1)};">${cap}${noSigns ? '' : signRow(ctx, st.op, pick, idx, idx === 0 && !!p.traceOp0 && !filled(ctx))}`
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
    // (a two-step story prints at the WDS text line-height 1.3 - TY-13 / AX-3; lesson 7 r2: the Guided page of two
    // two-step cells overflowed by 3 mm at 1.4, and content never shrinks: the type size is unchanged)
    return `<div class="mq-wwstory" style="flex:1 1 auto;min-width:0;text-align:left;font-size:${P(ctx, textPt(ctx) + (narrow && !isTwin(ctx) ? 0 : 2))};line-height:${narrow && !isTwin(ctx) ? 1.2 : (Array.isArray(p.steps) && p.steps.length > 1 && !isTwin(ctx) ? 1.3 : 1.4)};">${keep}${lines}</div>`;
}

/** The keyword bank box: each sign with its cue phrases (a fixed panel, the same on every item). */
function keywordBank(ctx) {
    const z = zonePt(ctx);
    const rows = KEYWORD_BANK.map((r) => `<div style="display:flex;gap:${L(ctx, 2)};align-items:baseline;"><b style="display:inline-block;width:${L(ctx, 4)};font-size:${P(ctx, z + 2)};">${GLYPH[r.op]}</b><span>${esc(r.words.join(', '))}</span></div>`).join('');
    return `<div class="mq-wwbank" aria-label="key words" style="flex:none;box-sizing:border-box;width:${L(ctx, 64)};border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 1.4)} ${L(ctx, 2)};font-size:${P(ctx, z)};line-height:1.35;text-align:left;">`
        + `<div style="font-weight:700;">Key words</div>${rows}</div>`;
}

/**
 * A small part-whole bar for a vocabulary card or a chart caption (detailed lesson 2): the whole
 * box on top, the two part boxes under it (widths in proportion), the labels written in; `mark`
 * ('whole' | 'parts') draws that box (or boxes) at 1.5 pt, the rest at 0.75 pt. Line art, black.
 */
export function barMini({ whole, a, b, mark = '', wMm = 40, pt = 13 } = {}) {
    const H = 7, W = wMm, PTMM = 25.4 / 72;
    // schematic (RP-72): equal parts equal, else the bigger part the longer stock length
    const wa = a === b ? W / 2 : (a > b ? 0.6 * W : 0.4 * W);
    const sw = (m) => ((m ? 1.5 : 0.75) * PTMM).toFixed(3);
    const box = (x, y, w, label, m) => `<rect x="${x.toFixed(2)}" y="${y}" width="${w.toFixed(2)}" height="${H}" fill="#fff" stroke="#000" stroke-width="${sw(m)}"/>`
        + `<text x="${(x + w / 2).toFixed(2)}" y="${(y + H / 2 + pt * PTMM * 0.35).toFixed(2)}" text-anchor="middle" font-family="Andika" font-weight="700" font-size="${(pt * PTMM).toFixed(2)}">${esc(String(label))}</text>`;
    // The named thing is pointed at (critic r1 D9: a thicker line alone is too faint a cue for an ELL
    // match): an arrow at the left of the whole's row or the parts' row; "bar" rings the whole figure.
    const L0 = 6, y2 = H + 1.5;
    const arrow = (y) => `<path d="M0 ${(y + H / 2 - 2.2).toFixed(2)} L4.2 ${(y + H / 2).toFixed(2)} L0 ${(y + H / 2 + 2.2).toFixed(2)} Z" fill="#000"/>`;
    const ring = mark ? '' : `<rect x="${(L0 - 1.6).toFixed(2)}" y="-0.4" width="${(W + 3.2).toFixed(2)}" height="${(2 * H + 1.5 + 0.8).toFixed(2)}" rx="1.5" fill="none" stroke="#000" stroke-width="${sw(false)}"/>`;
    const point = mark === 'whole' ? arrow(0) : mark === 'parts' ? arrow(y2) : '';
    const g = `<g transform="translate(${L0} 0)">` + box(0, 0, W, whole, mark === 'whole') + box(0, y2, wa, a, mark === 'parts') + box(wa, y2, W - wa, b, mark === 'parts') + '</g>';
    const VW = W + L0 + 2.2, VH = 2 * H + 1.5 + 1;
    return `<svg class="mq-barmini" viewBox="-0.5 -0.5 ${VW.toFixed(2)} ${VH.toFixed(2)}" width="${VW.toFixed(1)}mm" height="${VH.toFixed(1)}mm" aria-label="bar model">`
        + ring + point + g + '</svg>';
}

/** A bar model with blank label boxes (the key writes the numbers and the answer). */
function barModel(ctx, p, W = 150) {
    const st = p.steps[0];
    const put = filled(ctx);
    const ink = inkOf(ctx);
    const H = 8;
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
        const mp = Math.min(30, W * 0.38);
        const wa = Math.max(mp, Math.min(W - mp, W * pa / Math.max(1, whole)));
        const lw = Math.min(16, mp - 3);
        body = row(seg(W, lab(fmt(whole), lw), false)) + row(seg(wa, lab(fmt(pa), lw), false) + seg(W - wa, lab(fmt(pb), lw), false));
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

/**
 * `layout: 'bar'` (a lesson's ref payload, the detailed lesson maker - lesson 2): the story, its
 * part-whole bar as wide as the cell, and one answer box with the label word PRINTED beside it. No
 * sign row, no column boxes, no unit bank: the bar IS the working (RCDWS "Draw it").
 */
function barLayout(p, ctx) {
    const cols = Math.max(1, Number(ctx.columns || 1));
    const size = sizeOf(ctx);
    const put = filled(ctx);
    const ink = put ? inkOf(ctx) : null;
    const st = p.steps[0];
    // RP-70 / RP-72 (V22 XP-G-15): the SCHEMATIC part-whole bar, drawn by the graphic library
    // (graphics/part-whole-bar.js): never proportional, equal parts equal, else 60 / 40.
    const W = Number(p.barW) > 0 ? Math.max(42, Number(p.barW)) : (cols >= 2 ? 52 : 70);
    const whole = st.op === '+' ? st.ans : st.top;
    const pa = st.op === '+' ? st.top : st.bottom;
    const pb = st.op === '+' ? st.bottom : st.ans;
    // (`gradeParts`, lesson 2 r4 - critic r2 n9: the exit slip's sort reads the bar, so its boxes are graded there)
    const bar = partWholeBar(ctx, { whole, a: pa, b: pb, wMm: W, show: put, ink, gradeParts: !!p.gradeParts });
    const bx = boxMm(ctx);
    const aw = Math.max(blankWidth(2, size), bx * 1.4);
    const shown = put ? String(p.ans) : '';
    const box = `<span data-ws-slot="answer" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${tw(ctx, aw)};height:${tw(ctx, bx + 1)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${ink === 'trace' ? GREY : INK};${KEY_FEATURES}">${esc(shown)}</span>`;
    const ans = `<div class="mq-wwanswer" style="flex:none;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};font-size:${P(ctx, textPt(ctx) + 1)};">${box}${p.unit ? `<span style="font-weight:700;line-height:1.1;">${esc(p.unit)}</span>` : ''}</div>`;
    const work = `<div style="flex:none;display:flex;align-items:flex-end;gap:${L(ctx, 3)};">${bar}${ans}</div>`;
    // (`storyTight`, lesson 2 r4: a one-across cell sets its story at the Practice cells' size and leading,
    // so two full-size stories with their bars fit a 132.5 mm exit-slip half)
    // (`beside`: the story on the left, the bar and answer on the right - a one-across cell on a half page)
    if (p.beside) {
        return `<div class="mq-ww mq-wwbarlayout" data-ww-ops="${st.op}" data-read style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${L(ctx, 2.5)};display:flex;align-items:center;gap:${L(ctx, 3)};">`
            + `<div style="flex:1 1 auto;min-width:0;">${storyHTML(ctx, p, true)}</div>${work}</div>`;
    }
    return `<div class="mq-ww mq-wwbarlayout" data-ww-ops="${st.op}" data-read style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${L(ctx, 2.5)};${p.storyTight ? `padding-top:${L(ctx, 2.5)};` : ''}">${storyHTML(ctx, p, cols >= 2 || !!p.storyTight)}`
        + `<div style="margin-top:${L(ctx, 1.5)};">${work}</div></div>`;
}

/**
 * One part of a two-step story whose first step is x or / (msOps, the detailed lesson maker, lesson 7): the anchor
 * chart's panel drawing for step k - 0 the story, 1 Step 1 worked (grey), 2 Step 2 worked with its unit word (grey). `ctx` is a resolved print context.
 */
export function twoStepPart(p, k, ctx) {
    if (!p || !Array.isArray(p.steps) || p.steps.length !== 2) return '';
    const solid = Object.assign({}, ctx, { state: 'answered' }), grey = Object.assign({}, ctx, { state: 'traced' }), none = Object.assign({}, ctx, { state: 'blank' });
    const [s1, s2] = p.steps;
    const wrap = (html) => `<div class="mq-ww mq-wwpart" data-ww-ops="${s1.op} ${s2.op}" data-read style="box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${L(ctx, 2.5)};">${html}</div>`;
    if (k <= 0) return wrap(`<div style="white-space:nowrap;">${storyHTML(none, p)}</div>`);
    if (k === 1) return wrap(stepBlock(grey, s1, s1, s1.op, 0, 'Step 1', p));
    return wrap(stepBlock(grey, s2, s2, s2.op, 1, 'Step 2', p, unitBlock(grey, p, p.unit, s2.op === '/')));
}

/**
 * `layout: 'frames'` (a lesson's ref payload - the detailed lesson maker, lesson 7): the story, then one number
 * sentence per step - "Step 1: [ ] ( ) [ ] = [ ]" - the pupil writes the numbers and the sign; the last step's
 * result box is the answer, the unit line and its word bank beside it. No column boxes: a compact cell for the
 * exit slip and the Prerequisite Check (the fade of the two step blocks; the response is still produced).
 */
function framesLayout(p, ctx) {
    const twin = isTwin(ctx);
    const put = filled(ctx) && !twin;
    const ink = put ? inkOf(ctx) : null;
    const col = ink === 'trace' ? GREY : INK;
    const bx = boxMm(ctx);
    const pt = digitPt(ctx);
    const two = p.steps.length > 1;
    const lastI = p.steps.length - 1;
    const face = (w, heavy) => `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${tw(ctx, w)};height:${tw(ctx, bx)};border:${B(ctx, heavy ? 1.5 : 1)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};font-weight:700;line-height:1;color:${col};text-align:center;${KEY_FEATURES}`;
    // one number box; on screen an input as wide as its number (the answer: the host's own cell, `data-mq-cell`)
    const box = (id, v, digits, graded = false, heavy = false) => {
        const w = Math.max(bx * 1.25, blankWidth(Math.max(2, digits), sizeOf(ctx)));
        if (twin) {
            if (graded) return `<span class="mq-wwans" data-ws-slot="${esc(id)}" data-ws-shape="box" data-mq-cell="1" data-mq-w="${Math.max(1, digits)}" data-mq-label="answer" data-mq-expect="${esc(v)}" style="${face(w, true)}"></span>`;
            return `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(v)}" data-ws-graded="0" maxlength="${Math.max(1, digits)}" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="number" style="${face(w, heavy)}padding:0;margin:0;">`;
        }
        return `<span data-ws-slot="${esc(id)}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}${ink ? ` data-ws-ink="${ink}"` : ''} style="${face(w, heavy)}">${put ? esc(v) : ''}</span>`;
    };
    const sign = (id, op) => (twin
        ? `<input type="text" class="mq-wwork" data-mq-kind="sign" data-mq-expect="${GLYPH[op]}" data-ws-graded="0" maxlength="1" autocomplete="off" spellcheck="false" aria-label="sign" style="box-sizing:border-box;width:${tw(ctx, bx * 0.9)};height:${tw(ctx, bx * 0.9)};border:${B(ctx, 1)} solid ${INK};border-radius:50%;background:#fff;font-size:${P(ctx, pt * 0.85)};font-weight:700;text-align:center;padding:0;margin:0;">`
        : `<span data-ws-slot="${esc(id)}" data-ws-shape="circle" data-ws-graded="0"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, bx * 0.9)};height:${L(ctx, bx * 0.9)};border:${B(ctx, 1)} solid ${INK};border-radius:50%;background:#fff;font-size:${P(ctx, pt * 0.85)};font-weight:700;line-height:1;color:${col};">${put ? GLYPH[op] : ''}</span>`);
    const sym = (t) => `<span style="font-size:${P(ctx, pt)};font-weight:700;line-height:1;">${t}</span>`;
    const cap = (t) => `<span style="font-size:${P(ctx, textPt(ctx))};font-weight:700;min-width:${L(ctx, 17)};">${t}</span>`;
    const row = (html) => `<div class="mq-wwframe" style="display:flex;align-items:center;${twin ? "flex-wrap:wrap;" : ""}gap:${L(ctx, 2.2)};">${html}</div>`;
    let rows;
    if (p.letter) {
        // msLetter (3.OA.D.8): the whole story as ONE equation with a letter, then the letter's value
        const [s1, s2] = p.steps;
        const x = (st) => (st.op === '*' ? st.a : st.top), y = (st) => (st.op === '*' ? st.b : st.bottom);
        const brk = two && (s1.op === '+' || s1.op === '-') && (s2.op === '*' || s2.op === '/');
        const first = `${box('fr0-a', String(x(s1)), String(x(s1)).length)}${sign('op0', s1.op)}${box('fr0-b', String(y(s1)), String(y(s1)).length)}`;
        const eqn = two ? `${brk ? sym('(') : ''}${first}${brk ? sym(')') : ''}${sign('op1', s2.op)}${box('fr1-b', String(s2.bottom), String(s2.bottom).length)}` : first;
        rows = row(`${eqn}${sym('=')}${sym('n')}`) + row(`${sym('n')}${sym('=')}${box('answer', String(p.ans), String(p.ans).length, true, true)}`);
    } else {
        rows = p.steps.map((st, i) => {
            const x = st.op === '*' ? st.a : st.top, y = st.op === '*' ? st.b : st.bottom;
            const r = st.op === '/' ? st.q : st.ans;
            const res = i === lastI ? box('answer', String(p.ans), String(r).length, true, true) : box(`fr${i}-r`, String(r), String(r).length);
            return row(`${two ? cap(`Step ${i + 1}:`) : ''}${box(`fr${i}-a`, String(x), String(x).length)}${sign(`op${i}`, st.op)}${box(`fr${i}-b`, String(y), String(y).length)}${sym('=')}${res}`);
        }).join('');
    }
    // msCheck (3.OA.D.8): each story number rounded to the nearest ten, the estimate, and the pupil's own answer judged
    if (p.check) {
        const c = p.check;
        const est = row(`${cap('Estimate:')}${box('es-a', String(c.a), String(c.a).length)}${sign('es-op0', p.steps[0].op)}${box('es-b', String(c.b), String(c.b).length)}`
            + (two ? `${sign('es-op1', p.steps[1].op)}${box('es-c', String(c.c), String(c.c).length)}` : '') + `${sym('=')}${box('es-r', String(c.est), String(c.est).length)}`);
        const ring = (w) => (twin
            ? `<button type="button" class="mq-wwword" data-mq-word="${w}" style="min-height:44px;min-width:44px;padding:0 ${L(ctx, 1.5)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font:inherit;cursor:pointer;">${w}</button>`
            : `<span data-ws-slot="ok-${w.toLowerCase()}" data-ws-shape="choice" data-ws-graded="0" style="position:relative;display:inline-flex;padding:0 ${L(ctx, 2)};font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;">${w}${put && w === 'Yes' ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -0.5)};top:${L(ctx, -1)};right:${L(ctx, -0.5)};bottom:${L(ctx, -1)};border:${B(ctx, 1.5)} solid ${col};border-radius:50%;"></span>` : ''}</span>`);
        rows += est + row(`${cap('Is my answer close to the estimate?')}${ring('Yes')}${ring('No')}`);
    }
    const work = `<div style="flex:none;display:flex;flex-direction:column;gap:${L(ctx, 2.2)};">${rows}</div>`;
    // (the unit word PRINTED beside the answer box, as the bar layout does: the compact cell asks for the numbers)
    const unit = p.unit && !p.check ? `<span style="font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;line-height:1.1;padding-bottom:${L(ctx, 2)};">${esc(p.unit)}</span>` : '';
    // (the story starts level with the item tab, in a gutter beside it - the frames cell takes no tab spacer, CSS
    // .mq-wwframes in sheet-kit.css: lesson 7 r2, the exit slip half overflowed by 8 mm and content never shrinks)
    return `<div class="mq-ww mq-wwframes" data-ww-ops="${p.steps.map((x) => x.op).join(' ')}" data-read style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};padding-top:${twin ? L(ctx, 1.5) : '0'};${twin ? 'text-align:left;' : ''}">${storyHTML(ctx, p, true)}`
        + `<div style="margin-top:${L(ctx, 2)};display:flex;align-items:flex-end;${twin ? "flex-wrap:wrap;" : ""}gap:${L(ctx, 2.5)};">${work}${unit}</div></div>`;
}

/**
 * `layout: 'sentence'` (visual-quality lane 2026-10-31, design/audit/VISUAL_QUALITY.md 4.4; VQ-1..VQ-3):
 * a one-step + / − story whose skill's answers are all <= 20 (add_wp_10 / _20, sub_wp_10 / _20 and
 * their _plain twins). Grade K-1 solves these by counting on or making ten, not in columns, so the
 * cell draws only what the item uses - the story, then the library's number sentence
 * `[ ] ◯ [ ] = [ ]` (the pupil writes both numbers and the sign in the circle) whose last box is the
 * one scored place with the unit word PRINTED beside it. No sign row of four, no column grid, no
 * regroup row, no word bank. The `bar` option draws the library part-whole bar above the sentence;
 * the K picture story keeps its countable picture. A full-width cell puts the work beside the
 * story (no empty band, H13); a column cell and the screen twin stack it.
 */
function sentenceLayout(p, ctx) {
    const twin = isTwin(ctx);
    const narrow = twin || Number(ctx.columns || 1) >= 2;
    const sh = shownSteps(p, ctx);
    const st = sh.steps[0];
    const put = filled(ctx) && !twin;
    const ink = put ? inkOf(ctx) : null;
    const digits = Math.max(2, Number(p.digits) || 2);
    const frame = sentenceFrame(ctx, { a: st.top, b: st.bottom, op: GLYPH[st.op], ans: put ? sh.ans : String(p.ans), unit: p.unit, digits, show: put, ink });
    const whole = st.op === '+' ? st.ans : st.top;
    const pa = st.op === '+' ? st.top : st.bottom;
    const pb = st.op === '+' ? st.bottom : st.ans;
    const bar = p.bar ? partWholeBar(ctx, { whole, a: pa, b: pb, wMm: narrow ? 52 : 64, show: put, ink }) : '';
    const work = `<div class="mq-wwwork" style="flex:none;display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 3)};">${bar}${frame}</div>`;
    const cls = 'mq-ww mq-wwframes mq-wwsentence';
    const base = `box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;`;
    if (!narrow) {
        return `<div class="${cls}" data-ww-ops="${st.op}" data-read style="width:100%;${base}padding-left:calc(var(--ws-tab, 5mm) + 1mm);display:flex;align-items:center;gap:${L(ctx, 6)};">`
            + `<div style="flex:1 1 auto;min-width:0;">${storyHTML(ctx, p, true)}${pictureRow(ctx, p.pic)}</div>${work}</div>`;
    }
    // (a column cell whose sentence is wider than the column is a FULL-WIDTH item: the page's measurement
    // reads its min-width as not fitting and prints it full width, beside its story - practice.js splitWide)
    const fullW = !twin && !sentenceFits(p, ctx) ? `min-width:${L(ctx, 120)};` : '';
    return `<div class="${cls}" data-ww-ops="${st.op}" data-read style="width:100%;${fullW}${base}padding-left:${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};padding-top:${twin ? L(ctx, 1.5) : '0'};${twin ? 'text-align:left;' : ''}">`
        + `${storyHTML(ctx, p, true)}${pictureRow(ctx, p.pic)}<div style="margin-top:${L(ctx, 3)};display:flex;${twin ? 'justify-content:center;' : ''}">${work}</div></div>`;
}

/** Does a sentence layout's work fit a column of `cols` across at this size (else the cell is full width)? */
export function sentenceFits(p, ctx) {
    const cols = Math.max(1, Number(ctx.columns || 1));
    const inner = 186 / cols - (cols > 1 ? 9 : 10);
    return sentenceFrameWidthMm(ctx, { digits: Math.max(2, Number(p.digits) || 2), unitChars: String(p.unit || '').length }) <= inner;
}

/** The A-D labels of a `choose` cell, as printed and as the key names them. */
export const chooseLabels = (p) => (p.choices || []).map((v, i) => `${'ABCD'[i]}  ${Number(v).toLocaleString('en-US')}`);

/**
 * `layout: 'choose'` (option msChoose - the detailed lesson maker, lesson 7 r3: the board Check Question's A-D form
 * online): the story, then four rows "A  20 [ ]" - the answer and the three two-step errors; the pupil checks one box.
 * ONE decision, so ONE slot (the group, AK-2). Each row is one label span + one box span: the shape wireTickBoxes
 * turns into a tap target on the card, the worksheet and the quiz.
 */
function chooseLayout(p, ctx) {
    const twin = isTwin(ctx);
    const labels = chooseLabels(p);
    const on = !filled(ctx) || twin ? -1 : ctx.state === 'wrong'
        ? labels.findIndex((l) => String(l).replace(/^[A-D]\s+/, '').replace(/,/g, '') === String(ctx.wrong && ctx.wrong.value))
        : p.correct;
    const pt = digitPt(ctx);
    const rows = labels.map((lab, i) => `<div style="display:flex;align-items:center;gap:${L(ctx, 4)};margin:${L(ctx, 1.2)} 0;">`
        + `<span style="flex:none;min-width:${L(ctx, 22)};white-space:pre;font-size:${P(ctx, pt)};font-weight:700;line-height:1.1;">${esc(lab)}</span>`
        + checkBox(ctx, { id: `ch${i}`, on: i === on, slot: false }) + `</div>`).join('');
    const ink = on >= 0 ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    return `<div class="mq-ww mq-wwframes mq-wwchoose" data-ww-ops="${p.steps.map((x) => x.op).join(' ')}" data-read style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};padding-top:${twin ? L(ctx, 1.5) : '0'};${twin ? 'text-align:left;' : ''}">${storyHTML(ctx, p, true)}`
        + `<div data-ws-slot="answer" data-ws-shape="check"${ink} style="display:grid;grid-template-columns:repeat(2, max-content);column-gap:${L(ctx, 14)};margin-top:${L(ctx, 2)};">${rows}</div></div>`;
}

register(WW_TEMPLATE, {
    render(p, ctx) {
        if (!p || !Array.isArray(p.steps) || !p.steps.length) return '';
        if (p.layout === 'choose' && Array.isArray(p.choices) && p.choices.length === 4) return chooseLayout(p, ctx);
        if (p.layout === 'bar' && p.bar && p.steps.length === 1 && !isTwin(ctx)) return barLayout(p, ctx);
        if (p.layout === 'frames') return framesLayout(p, ctx);
        if (p.layout === 'sentence' && p.steps.length === 1 && (p.steps[0].op === '+' || p.steps[0].op === '-')) return sentenceLayout(p, ctx);
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
            : `<div style="display:flex;align-items:flex-end;gap:${L(ctx, 8)};margin-top:${L(ctx, p.factDiv || (two && p.steps[0].op === "*") ? 1 : 3)};">${blocks}${answer ? `<div style="margin-left:auto;padding-right:${L(ctx, 4)};">${answer}</div>` : ''}</div>`;
        // A column cell that cannot hold its answer beside the work (a wide stack, two steps) is a
        // FULL-WIDTH item: it keeps its full-width layout's width, so the page's measurement reads
        // it as not fitting the column and prints it in the full-width group at the bottom
        // (practice.js splitWide) instead of a tall, half-empty column cell (RUBRIC H13).
        const fullW = !twin && narrow && !side ? `min-width:${L(ctx, 120)};` : '';
        return `<div class="mq-ww" data-ww-ops="${p.steps.map((s) => s.op).join(' ')}" style="width:100%;${fullW}box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${twin ? '0' : L(ctx, narrow ? 2.5 : 5)};">${head}${body}</div>`;
    },
    answerKey(p) {
        // (`layout: 'choose'`, msChoose: the key checks the right row - its label, with the number it names)
        if (p.layout === 'choose' && Array.isArray(p.choices) && p.choices.length === 4) {
            const lab = chooseLabels(p)[p.correct];
            return { value: p.ans, display: lab, slots: { answer: { value: lab, graded: true, accept: [String(p.ans)] } } };
        }
        const slots = { answer: { value: String(p.ans), graded: true, accept: [Number(p.ans).toLocaleString('en-US')] } };
        // the answer row's digit boxes (the one answer place when the answer is the row's result)
        if (p.inRow !== false && p.layout !== 'bar' && p.layout !== 'frames' && p.layout !== 'sentence' && Array.isArray(p.steps) && p.steps.length) {
            const st = p.steps[p.steps.length - 1];
            const T = st.op === '/' ? digitsOf(st.top).length : columnRows(st, p.tracks).T;
            const d = String(p.ans).padStart(T, ' ');
            for (let i = 0; i < T; i++) slots[`ans-${i}`] = { value: d[i] === ' ' ? '' : d[i], graded: d[i] !== ' ' };
        }
        // (`layout: 'frames'`: each step's number sentence - lesson 7; the last result box is the answer)
        if (p.layout === 'frames' && Array.isArray(p.steps)) {
            const lastI = p.steps.length - 1;
            p.steps.forEach((st, i) => {
                if (p.letter && i > 0) { slots[`fr${i}-b`] = { value: String(st.bottom), graded: false }; return; }
                slots[`fr${i}-a`] = { value: String(st.op === '*' ? st.a : st.top), graded: false };
                slots[`fr${i}-b`] = { value: String(st.op === '*' ? st.b : st.bottom), graded: false };
                if (i !== lastI && !p.letter) slots[`fr${i}-r`] = { value: String(st.op === '/' ? st.q : st.ans), graded: false };
            });
            if (p.check) {
                const c = p.check;
                Object.assign(slots, { 'es-a': { value: String(c.a), graded: false }, 'es-b': { value: String(c.b), graded: false }, 'es-r': { value: String(c.est), graded: false }, 'es-op0': { value: GLYPH[p.steps[0].op], graded: false } });
                if (p.steps.length > 1) Object.assign(slots, { 'es-c': { value: String(c.c), graded: false }, 'es-op1': { value: GLYPH[p.steps[1].op], graded: false } });
            }
        }
        // (`layout: 'sentence'`: the number sentence's two numbers; its last box is the answer, the unit printed)
        if (p.layout === 'sentence' && Array.isArray(p.steps) && p.steps.length === 1) {
            const st = p.steps[0];
            slots['fr0-a'] = { value: String(st.top), graded: false };
            slots['fr0-b'] = { value: String(st.bottom), graded: false };
        }
        if (p.unit && p.layout !== 'bar' && p.layout !== 'frames' && p.layout !== 'sentence') slots['answer-label'] = { value: p.unit, graded: false };
        (p.steps || []).forEach((s, i) => { slots[`op${i}`] = { value: GLYPH[s.op], graded: false }; });
        return { value: p.ans, display: p.unit ? `${Number(p.ans).toLocaleString('en-US')} ${p.unit}` : String(p.ans), slots };
    },
    // Measured: a story of small numbers stands in 2 columns; one whose columns are wider than a
    // 2-column cell is measured to one and goes in the full-width group (practice.js splitWide).
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2, restacks: true }; },
    inputs(p) {
        const out = [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        if (p && p.unit && p.layout !== 'sentence') out.push({ id: 'answer-label', kind: 'unit', shape: 'line', graded: false, order: 1, scopes: ['full'] });
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
