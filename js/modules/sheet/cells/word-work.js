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
//   the answer     "Answer: [box] ______" - the number box is the one scored place (PT-WPR-8),
//                  the unit word is copied from a small printed bank of three words beside it
//                  (P-TH-1: a word from a bank of at most 4)
//   two-step       two work blocks side by side, "Step 1" and "Step 2", each with its own sign
//                  row (P-WP-11)
//
// The key (AK-1) is the same cell finished: the sign ringed, the numbers, the sign, the
// regroup digits, the partial products or the division working, the answer and its unit.
// Error analysis draws a finished cell worked with the WRONG operation (`wrong.slots.op`).
//
// SCREEN TWIN (`ctx.options.twin`, drawn by `wordWorkTwin`): the same drawing in --mq-k2 px,
// stacked for a narrow card. The sign boxes are buttons, the work boxes and the sign box are
// typed inputs (scratch, ungraded), the answer box is the host's own input
// (`data-mq-blank="box"`), and the unit bank words fill the unit line. Every writing place
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
    const lines = storyLines(q.text);
    if (!lines.length) return null;
    const unit = unitOf(q, ans);
    const seed = steps.reduce((s, st) => s + st.a * 7 + st.b * 13, ans);
    const cmp = /\b(more|fewer|less)\s+than\b|\bhow many (more|fewer)\b|\bhow much more\b|\btimes as many\b/i.test(q.text);
    const barKind = last.op === '*' || last.op === '/' ? 'groups' : cmp ? 'compare' : 'whole';
    return {
        lines, steps, ans, unit: unit.word, bank: unitBank(unit, unit.others, seed),
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

/** The carries of x × d (one digit), by position from the ones. */
function multCarries(x, d) {
    const out = {};
    let c = 0;
    digitsOf(x).split('').reverse().forEach((ch, i) => {
        const p = Number(ch) * d + c;
        c = Math.floor(p / 10);
        if (c) out[i + 1] = String(c);
    });
    return out;
}

/**
 * The rows of one column step: what each row holds on the KEY, as strings right-aligned to the
 * ones track, and which tracks carry a box. `T` counts the digit tracks (the sign track is extra).
 */
export function columnRows(st) {
    const x = st.top, y = st.bottom, z = st.ans;
    const lx = digitsOf(x).length, ly = digitsOf(y).length, lz = digitsOf(z).length;
    const rows = [];
    let T;
    if (st.op === '+') {
        T = Math.max(lx, ly) + 1;
        if (hasCarry(x, y)) rows.push({ kind: 'carry', tracks: range(1, T), vals: addCarries(x, y) });
    } else if (st.op === '-') {
        T = Math.max(lx, ly, lz);
        if (hasBorrow(x, y)) rows.push({ kind: 'carry', tracks: range(0, lx), vals: subRegroup(x, y), wide: true });
    } else {
        T = lx + ly;
        if (ly === 1 && multCarry(x, y)) rows.push({ kind: 'carry', tracks: range(1, T), vals: multCarries(x, y) });
    }
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
    return { T: Math.max(T, lz), rows };
}
/** Positions [from, to) counted from the ones. */
function range(from, to) { const out = []; for (let i = from; i < to; i++) out.push(i); return out; }

/* ============================================================== drawing */

const BOX = { S: 8.5, M: 10, L: 12 };
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
    const base = `box-sizing:border-box;width:${small ? L(ctx, w) : tw(ctx, w)};height:${small ? L(ctx, h) : tw(ctx, h)};border:${B(ctx, small ? 0.75 : 1)} solid ${INK};`
        + `border-radius:${L(ctx, 1)};background:#fff;font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};font-weight:700;line-height:1;color:${color};text-align:center;${KEY_FEATURES}`;
    if (isTwin(ctx)) {
        const lab = kind === 'sign' ? 'sign' : kind === 'regroup' ? 'regroup digit' : 'digit';
        return `<input type="text" class="mq-wwork${small ? ' mq-wwsmall' : ''}" data-mq-kind="${kind}" data-mq-expect="${esc(expect)}" data-ws-graded="0"`
            + ` maxlength="${kind === 'regroup' ? 2 : 1}" inputmode="${kind === 'sign' ? 'text' : 'numeric'}" autocomplete="off" spellcheck="false" tabindex="0"`
            + ` aria-label="${lab}" style="${base}padding:0;margin:0;${small ? 'min-width:28px;min-height:28px;' : ''}">`;
    }
    return `<span data-ws-slot="${esc(id)}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}${ink ? ` data-ws-ink="${ink}"` : ''}`
        + ` style="display:inline-flex;align-items:center;justify-content:center;${base}">${esc(value)}</span>`;
}

/** The small sign row: + − × ÷, the chosen one ringed on the key. */
function signRow(ctx, op, pick, idx) {
    const s = boxMm(ctx) * 0.78;
    const pt = textPt(ctx) + 5;
    const ink = pick && filled(ctx) ? inkOf(ctx) : null;
    const cells = OPS.map((o) => {
        const ring = ink && o === pick
            ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -1.6)};top:${L(ctx, -1.6)};right:${L(ctx, -1.6)};bottom:${L(ctx, -1.6)};border:${B(ctx, 1.5)} solid ${ink === 'trace' ? GREY : INK};border-radius:50%;"></span>`
            : '';
        const face = `display:inline-flex;align-items:center;justify-content:center;position:relative;box-sizing:border-box;width:${tw(ctx, s)};height:${tw(ctx, s)};`
            + `border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};line-height:1;padding:0;`;
        if (isTwin(ctx)) {
            return `<button type="button" class="mq-wwop" data-mq-op="${o}" data-mq-expect="${o === op ? 1 : 0}" aria-pressed="false" aria-label="${WORD[o]}" style="${face}cursor:pointer;">${GLYPH[o]}</button>`;
        }
        return `<span data-ws-slot="op${idx}-${WORD[o]}" data-ws-shape="choice" data-ws-graded="0" style="${face}">${GLYPH[o]}${ring}</span>`;
    }).join('');
    return `<div class="mq-wwsigns" role="${isTwin(ctx) ? 'group' : 'presentation'}" aria-label="choose the sign" style="display:flex;gap:${L(ctx, 2.6)};justify-content:${isTwin(ctx) ? 'center' : 'flex-start'};padding:${L(ctx, 1.6)};">${cells}</div>`;
}

/** The value in a column row at track i (0 = leftmost digit track), right-aligned. */
const at = (value, T, i) => { const p = String(value).padStart(T, ' '); return p[i] === ' ' ? '' : p[i]; };

/** The + − × column work of one step: a CSS grid of boxes, the sign box on the bottom row. */
function columnWork(ctx, st, show, idx) {
    const { T, rows } = columnRows(show);
    const bx = boxMm(ctx), pt = digitPt(ctx);
    const sb = bx * 0.62;
    const cols = `${tw(ctx, bx)} repeat(${T}, ${tw(ctx, bx)})`;
    const expect = columnRows(st);          // what the model expects, whatever is shown
    const eRow = (id) => (expect.rows.find((r) => r.id === id) || {}).value || '';
    const put = filled(ctx);
    let html = '';
    let r = 1;
    for (const row of rows) {
        if (row.kind === 'rule') {
            html += `<span style="grid-row:${r};grid-column:1 / -1;border-top:${B(ctx, 1.5)} solid ${INK};height:0;margin:${L(ctx, 0.6)} 0;"></span>`;
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
        for (let i = 0; i < T; i++) {
            const v = put ? at(row.value, T, i) : '';
            const e = eT === T ? at(ev, T, i) : '';
            html += `<span style="grid-row:${r};grid-column:${i + 2};">${wbox(ctx, { id: `w${idx}-${row.id}-${i}`, value: v, expect: e, w: bx, h: bx, pt })}</span>`;
        }
        r++;
    }
    return `<div class="mq-wwcols" role="group" aria-label="column work" style="display:inline-grid;grid-template-columns:${cols};column-gap:${L(ctx, GAP)};row-gap:${L(ctx, GAP)};align-items:end;">${html}</div>`;
}

/** The ÷ frame: divisor boxes, the bracket, dividend boxes, quotient boxes, the working, R. */
function divisionWork(ctx, st, show, idx) {
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
        html += `<span style="grid-row:1;grid-column:${c0 + i};">${wbox(ctx, { id: `w${idx}-q-${i}`, value: put ? qs[i].trim() : '', expect: eq[i].trim(), w: bx, h: bx, pt })}</span>`;
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
        + `<svg viewBox="0 0 10 40" preserveAspectRatio="none" style="display:block;width:${L(ctx, bw)};height:${isTwin(ctx) ? '100%' : L(ctx, hMm)};overflow:visible;"><path d="M2 1 Q9 20 2 39" fill="none" stroke="${INK}" stroke-width="2.4" vector-effect="non-scaling-stroke"/></svg></span>`;
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
    return `<div class="mq-wwcols mq-wwdiv" role="group" aria-label="division work" style="display:inline-grid;grid-template-columns:${cols};column-gap:${L(ctx, GAP)};row-gap:${L(ctx, GAP)};align-items:end;">${html}</div>`;
}

/** One step's work block: its sign row over its columns. */
function stepBlock(ctx, st, show, pick, idx, caption) {
    const work = st.op === '/' ? divisionWork(ctx, st, show, idx) : columnWork(ctx, st, show, idx);
    const cap = caption ? `<div style="font-size:${P(ctx, zonePt(ctx))};font-weight:700;line-height:1.3;">${esc(caption)}</div>` : '';
    return `<div class="mq-wwstep" style="display:flex;flex-direction:column;align-items:${isTwin(ctx) ? 'center' : 'flex-start'};gap:${L(ctx, 1.4)};">${cap}${signRow(ctx, st.op, pick, idx)}`
        + `<div style="max-width:100%;overflow-x:auto;">${work}</div></div>`;
}

/** The story, the key words bold and underlined when asked (never colour, PT-WPR-6). */
function storyHTML(ctx, p) {
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
    return `<div class="mq-wwstory" style="flex:1 1 auto;min-width:0;text-align:left;font-size:${P(ctx, textPt(ctx) + 2)};line-height:1.4;">${keep}${lines}</div>`;
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
    const lab = (v, w) => `<span data-ws-graded="0" data-ws-slot="bar" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${L(ctx, w)};height:${L(ctx, 7)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, zonePt(ctx) + 2)};font-weight:700;padding:0 ${L(ctx, 1)};color:${ink === 'trace' ? GREY : INK};"${put && ink ? ` data-ws-ink="${ink}"` : ''}>${put ? esc(v) : ''}</span>`;
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
    const d = 9, pitch = d + 2.6, gap = 10;
    const n = pic.a + pic.b;
    const w = (n - 1) * pitch + gap + d + 2, h = d + 2;
    let body = '';
    for (let i = 0; i < n; i++) body += shapeOf(pic.shape).draw(1 + d / 2 + i * pitch + (i >= pic.a ? gap : 0), 1 + d / 2, d);
    return `<div style="margin-top:${L(ctx, 1.5)};"><svg class="k2-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}" role="img" aria-label="${pic.a} and ${pic.b} ${esc(shapeOf(pic.shape).plural)}" `
        + `style="display:block;width:${L(ctx, w)};height:auto;max-width:100%;overflow:visible;">${body}</svg></div>`;
}

/** "Answer: [box] ______" and the unit-word bank under it. */
function answerBlock(ctx, p, shown, unitShown) {
    const bx = boxMm(ctx);
    const tp = textPt(ctx) + 2;
    const digits = Math.max(2, ...p.steps.map((s) => Math.max(digitsOf(s.top).length, digitsOf(s.bottom).length, digitsOf(s.ans).length)));
    const w = Math.max(blankWidth(digits, sizeOf(ctx)), bx * 1.4);
    const ink = shown !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const boxStyle = `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${tw(ctx, w)};height:${tw(ctx, bx + 1)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;color:${color};${KEY_FEATURES}`;
    const num = `<span data-ws-slot="answer" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${isTwin(ctx) ? ' data-mq-blank="box"' : ''} style="${boxStyle}">${esc(shown)}</span>`;
    const uw = isTwin(ctx) ? 26 : { S: 28, M: 32, L: 36 }[sizeOf(ctx)];
    const uInk = unitShown !== '' ? inkOf(ctx) : null;
    const unit = p.unit
        ? `<span class="mq-wwunit" data-ws-slot="answer-label" data-ws-shape="line" data-ws-graded="0"${uInk ? ` data-ws-ink="${uInk}"` : ''} data-mq-expect="${esc(p.unit)}" style="display:inline-flex;align-items:flex-end;justify-content:center;box-sizing:border-box;width:${L(ctx, uw)};min-height:${L(ctx, bx * 0.8)};border-bottom:${B(ctx, 1)} solid ${INK};font-size:${P(ctx, tp)};font-weight:700;line-height:1.1;color:${uInk === 'trace' ? GREY : INK};">${esc(unitShown)}</span>`
        : '';
    const bank = p.unit && p.bank && p.bank.length
        ? `<div class="mq-wwwords" aria-label="unit words" style="display:inline-flex;gap:${L(ctx, 1.6)};align-items:center;border:${B(ctx, 0.75)} solid ${INK};padding:${L(ctx, 0.8)} ${L(ctx, 1.8)};font-size:${P(ctx, zonePt(ctx) + 1)};line-height:1.2;">`
            + p.bank.map((wd) => (isTwin(ctx)
                ? `<button type="button" class="mq-wwword" data-mq-word="${esc(wd)}" style="min-height:44px;min-width:44px;padding:0 ${L(ctx, 1.5)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;color:${INK};font:inherit;cursor:pointer;">${esc(wd)}</button>`
                : `<span>${esc(wd)}</span>`)).join(isTwin(ctx) ? '' : `<span aria-hidden="true">·</span>`)
            + '</div>'
        : '';
    return `<div class="mq-wwanswer" style="display:flex;flex-direction:column;align-items:${isTwin(ctx) ? 'center' : 'flex-start'};gap:${L(ctx, 1.6)};">`
        + `<div style="display:flex;align-items:flex-end;gap:${L(ctx, 2)};font-size:${P(ctx, tp)};flex-wrap:${isTwin(ctx) ? 'nowrap' : 'wrap'};justify-content:center;"><span style="font-weight:700;align-self:center;">Answer:</span>${num}${unit}</div>`
        + bank + '</div>';
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
        const put = filled(ctx);
        const sh = shownSteps(p, ctx);
        const two = p.steps.length > 1;
        const blocks = p.steps.map((st, i) => stepBlock(ctx, st, sh.steps[i], put ? sh.picks[i] : null, i, two ? `Step ${i + 1}` : '')).join('');
        const answer = answerBlock(ctx, p, put ? sh.ans : '', put ? p.unit : '');
        const head = `<div style="display:flex;gap:${L(ctx, 4)};align-items:flex-start;${twin ? 'flex-direction:column;align-items:stretch;' : ''}">${storyHTML(ctx, p)}${p.kb ? keywordBank(ctx) : ''}</div>`
            + pictureRow(ctx, p.pic) + (p.bar ? barModel(ctx, p) : '');
        const body = twin
            ? `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};margin-top:${L(ctx, 3)};">${two ? `<div style="display:flex;flex-wrap:wrap;gap:${L(ctx, 6)};justify-content:center;">${blocks}</div>` : blocks}${answer}</div>`
            : two
                ? `<div style="display:flex;align-items:flex-start;gap:${L(ctx, 8)};margin-top:${L(ctx, 3)};">${blocks}<div style="margin-left:auto;align-self:flex-end;">${answer}</div></div>`
                : `<div style="display:flex;align-items:flex-end;gap:${L(ctx, 10)};margin-top:${L(ctx, 3)};">${blocks}<div style="margin-left:auto;padding-right:${L(ctx, 4)};">${answer}</div></div>`;
        return `<div class="mq-ww" data-ww-ops="${p.steps.map((s) => s.op).join(' ')}" style="width:100%;box-sizing:border-box;color:${INK};font-family:'Andika','Open Sans',sans-serif;padding-left:${twin ? '0' : L(ctx, 5)};">${head}${body}</div>`;
    },
    answerKey(p) {
        const slots = { answer: { value: String(p.ans), graded: true, accept: [Number(p.ans).toLocaleString('en-US')] } };
        if (p.unit) slots['answer-label'] = { value: p.unit, graded: false };
        (p.steps || []).forEach((s, i) => { slots[`op${i}`] = { value: GLYPH[s.op], graded: false }; });
        return { value: p.ans, display: p.unit ? `${Number(p.ans).toLocaleString('en-US')} ${p.unit}` : String(p.ans), slots };
    },
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
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
