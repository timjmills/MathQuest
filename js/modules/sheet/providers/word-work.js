// js/modules/sheet/providers/word-work.js
// The provider every whole-number word problem shares (owner ruling 2026-09-25): the skills
// whose stories are drawn by the `word-work` cell (story, a small + − × ÷ row, column boxes, the
// answer with its unit bank).
//
//   strings       the iCan title, the `story-work` instruction, the four solving moves, Say:
//   workedSteps   the Model: read, the key words, circle the sign, write the numbers, work the
//                 columns (regroup), answer with the unit
//   wrongAnswer   the misconception a word problem is about: the WRONG OPERATION. The finished
//                 work of Error analysis is the same story worked with that sign (`slots.op`)
//
// add_wp_* / sub_wp_* register through addition.js with this provider's members (they keep
// their story templates there); the other story skills register here.
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { fmt, strings, step, clampSteps, chooseWrong } from './util.js';
import { cueRanges, wordWorkPayload } from '../cells/word-work.js';

const GLYPH = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const VERB = { '+': 'Add', '-': 'Subtract', '*': 'Multiply', '/': 'Divide' };
/** The sign a pupil wrongly picks for each story sign (the classic confusions). */
const WRONG_OP = { '+': '-', '-': '+', '*': '+', '/': '*' };

/** The item's word-work payload: its cell's, else built from the item itself (a story or a bare sum). */
function payloadOf(q) {
    if (q && q.cell && q.cell.template === 'word-work' && q.cell.payload) return q.cell.payload;
    try { return wordWorkPayload(q || {}, { twoStep: /multi_step/.test(String((q && q.skillId) || '')) }); } catch (e) { return null; }
}

/** The key words the story uses for its solving sign(s), in reading order. */
function cuesOf(p) {
    const ops = p.steps.map((s) => s.op);
    const out = [];
    for (const line of p.lines) for (const [s, e] of cueRanges(line, ops)) out.push(line.slice(s, e).toLowerCase());
    return [...new Set(out)];
}

function workLine(st) {
    if (st.op === '/') {
        return st.r ? `${fmt(st.top)} ÷ ${fmt(st.bottom)} = ${fmt(st.q)} R ${st.r}.` : `${fmt(st.top)} ÷ ${fmt(st.bottom)} = ${fmt(st.q)}.`;
    }
    return `${fmt(st.top)} ${GLYPH[st.op]} ${fmt(st.bottom)} = ${fmt(st.ans)}.`;
}

/**
 * The structure decision of a change or compare story (word-stories card, 2026-11-12): what the story KNOWS and what it
 * asks, read from its bar - never a key word ("more" is in the trap story, and the answer is found by subtracting).
 * `marks` writes the known numbers in the story bar's boxes (graphics/story-bar.js ids). Null for the other kinds.
 */
export function structureStep(p) {
    if (!p || !p.steps || p.steps.length !== 1) return null;
    const st = p.steps[0];
    const who = Array.isArray(p.who) ? p.who.map((x) => String(x).replace(/^The /, 'the ')) : null;
    switch (p.schema) {
        case 'add-some':
            return step(`First ${fmt(st.bottom)}, now ${fmt(st.top)}. The change is missing. I subtract.`, [{ slot: 'bar-w', value: String(st.top) }, { slot: 'bar-a', value: String(st.bottom) }]);
        case 'take-some':
            return step(`First ${fmt(st.top)}, now ${fmt(st.bottom)}. What went is missing. I subtract.`, [{ slot: 'bar-w', value: String(st.top) }, { slot: 'bar-b', value: String(st.bottom) }]);
        case 'compare-fewer':
            return step(`${who ? who[1] : 'The second'} has ${fmt(st.bottom)} fewer. The smaller amount is missing. I subtract.`, [{ slot: 'bar-big', value: String(st.top) }, { slot: 'bar-diff', value: String(st.bottom) }]);
        case 'compare-more-smaller':
            return step(`${who ? who[0] : 'The first'} has ${fmt(st.bottom)} more, so ${who ? who[1] : 'the second'} has ${fmt(st.bottom)} fewer. I subtract.`, [{ slot: 'bar-big', value: String(st.top) }, { slot: 'bar-diff', value: String(st.bottom) }]);
        case 'part-part':
            return step(`I know the whole, ${fmt(st.top)}, and one part, ${fmt(st.bottom)}. I subtract.`);
        default:
            return null;
    }
}

/** The Model problem, move by move (PEDAGOGY 8.5: read, show, decide, solve, label, say). */
export function wordWorkSteps(q) {
    const p = payloadOf(q);
    if (!p) return [];
    // A two-step story whose first step is × or ÷ (msOps, detailed lesson g3-oa8-two-step-wp): four moves, each one
    // a chart panel - read, Step 1, Step 2 (with the Step 1 answer), the answer and its unit. No key words.
    if (p.steps.length === 2 && (p.steps[0].op === '*' || p.steps[0].op === '/')) {
        const [s1, s2] = p.steps;
        return [
            step('Read the story two times.', [{ slot: 'ms-read', value: '1' }]),
            step(`Step 1: ${fmt(s1.a)} ${GLYPH[s1.op]} ${fmt(s1.b)} = ${fmt(s1.ans)}.`, [{ slot: 'op0', value: GLYPH[s1.op] }]),
            step(`Step 2: ${fmt(s2.top)} ${GLYPH[s2.op]} ${fmt(s2.bottom)} = ${fmt(s2.ans)}.`, [{ slot: 'op1', value: GLYPH[s2.op] }]),
            // (no marks: the unit word is written in the Step 2 panel - the chart's closing line, three panels)
            step(`Write the answer: ${fmt(p.ans)}${p.unit ? ` ${p.unit}` : ''}.`),
        ];
    }
    // the sentence form (stories within 20): PART-WHOLE, never key words (PEDAGOGY P-21, P-WP-10; critic r1 F6) - read,
    // find the parts and the whole on the bar (the structure decision: "I know both parts. I add." / "I know the whole
    // and one part. I subtract."), write the number sentence, solve. Four steps: each is one panel of the lesson's chart
    // and one frame of the scripted model, and each frame writes what its step says.
    if (p.layout === 'sentence' && p.steps.length === 1) {
        const st = p.steps[0];
        const add = st.op === '+';
        const whole = add ? st.ans : st.top, pa = add ? st.top : st.bottom, pb = add ? st.bottom : st.ans;
        const unit = Number(p.ans) === 1 && p.unitOne ? p.unitOne : p.unit;
        const sx = structureStep(p);
        if (sx) {
            return [
                step(`The numbers are ${fmt(st.top)} and ${fmt(st.bottom)}.`),
                sx,
                step(`Write ${fmt(st.top)} ${GLYPH[st.op]} ${fmt(st.bottom)} in the boxes.`, [{ slot: 'fr0-a', value: String(st.top) }, { slot: 'op0', value: GLYPH[st.op] }, { slot: 'fr0-b', value: String(st.bottom) }]),
                step(`${workLine(st).replace(/\.$/, '')}. The answer is ${fmt(p.ans)}${unit ? ` ${unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }]),
            ];
        }
        return [
            step(`The numbers are ${fmt(st.top)} and ${fmt(st.bottom)}.`),
            add
                ? step(`I know both parts: ${fmt(pa)} and ${fmt(pb)}. I add.`, [{ slot: 'bar-a', value: String(pa) }, { slot: 'bar-b', value: String(pb) }])
                : step(`I know the whole, ${fmt(whole)}, and one part, ${fmt(pa)}. I subtract.`, [{ slot: 'bar-w', value: String(whole) }, { slot: 'bar-a', value: String(pa) }]),
            step(`Write ${fmt(st.top)} ${GLYPH[st.op]} ${fmt(st.bottom)} in the boxes.`, [{ slot: 'fr0-a', value: String(st.top) }, { slot: 'op0', value: GLYPH[st.op] }, { slot: 'fr0-b', value: String(st.bottom) }]),
            step(`${workLine(st).replace(/\.$/, '')}. The answer is ${fmt(p.ans)}${unit ? ` ${unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }, { slot: add ? 'bar-w' : 'bar-b', value: String(p.ans) }]),
        ];
    }
    const sx = structureStep(p);
    // (a change or compare story is solved from its structure, never its key words: "more" is in the trap story)
    const cues = sx ? [] : cuesOf(p);
    const out = [step('Read the story two times.')];
    if (sx) out.push(sx);
    if (cues.length) out.push(step(`Look at the key words: ${cues.slice(0, 2).join(', ')}.`));
    p.steps.forEach((st, i) => {
        const pre = p.steps.length > 1 ? `Step ${i + 1}: ` : '';
        const mv = p.neutral && p.signRow === false ? `Write ${GLYPH[st.op]} in the circle.` : `Circle ${GLYPH[st.op]}.`;
        out.push(p.signs === false ? step(`${pre}${VERB[st.op]}.`) : step(`${pre}${mv} ${VERB[st.op]}.`, [{ slot: `op${i}`, value: GLYPH[st.op] }]));
        out.push(step(`Write ${fmt(st.top)} and ${fmt(st.bottom)} in the boxes.`));
        out.push(step(workLine(st)));
    });
    // (a one-step story's last step names the label it writes, as the lesson's "Say the answer and its label": "Write the answer:
    // 6 coins." left its Model text cell 32 % empty beside it at S - word-stories r3, EB-SIDE)
    out.push(step(`Write the answer${p.unit && p.steps.length === 1 ? ' and its label' : ''}: ${fmt(p.ans)}${p.unit ? ` ${p.unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }]));
    return clampSteps(out);
}

/**
 * The misconceptions of a change or compare story (word-stories card §6), each a value the pupil would write: M-W1 adds
 * the two numbers, M-W2 writes the "now" number, M-W3 "more" means add, M-W4 writes the difference, M-W5 writes what is
 * left. Null for the other kinds.
 */
function storyWrongs(p) {
    if (!p || !p.steps || p.steps.length !== 1) return null;
    const st = p.steps[0];
    const sum = st.top + st.bottom;
    const add = { value: sum, misconception: 'wrong-operation', slots: { answer: String(sum), op: '+' }, work: `${st.top} + ${st.bottom} = {v}`, explain: 'Added the two numbers in the story.' };
    switch (p.schema) {
        case 'add-some':
            return [add, { value: st.top, misconception: 'answer-is-now', explain: 'Wrote the "now" number: the change is what was added.' }];
        case 'take-some':
            return [add, { value: st.bottom, misconception: 'answer-is-left', explain: 'Wrote how many are left, not how many went.' }];
        case 'compare-fewer':
            return [add, { value: st.bottom, misconception: 'answer-is-difference', explain: 'Wrote the difference, not the smaller amount.' }];
        case 'compare-more-smaller':
            return [Object.assign({}, add, { misconception: 'more-means-add', explain: '"More" made them add: the one asked about has fewer.' }),
                { value: st.bottom, misconception: 'answer-is-difference', explain: 'Wrote the difference, not the smaller amount.' }];
        case 'part-part':
            return [add, { value: st.top, misconception: 'answer-is-whole', explain: 'Wrote the whole, not the missing part.' }];
        default:
            return null;
    }
}
/** The misconceptions the four general + / − story hosts deal (wrongAnswer names one of them). */
export const STORY_MISCONCEPTIONS = Object.freeze(['wrong-operation', 'answer-is-now', 'answer-is-left', 'answer-is-difference', 'more-means-add', 'answer-is-whole']);

/** Error analysis / True or False?: the same story worked with the wrong sign. */
export function wordWorkWrong(q) {
    const p = payloadOf(q);
    if (!p) return null;
    const sw = storyWrongs(p);
    if (sw) return chooseWrong(q, sw);
    const st = p.steps[p.steps.length - 1];
    const wop = WRONG_OP[st.op];
    const hi = Math.max(st.a, st.b), lo = Math.min(st.a, st.b);
    const v = wop === '+' ? st.a + st.b : wop === '-' ? hi - lo : wop === '*' ? st.a * st.b : null;
    if (v === null || !Number.isFinite(v)) return null;
    const names = { '+': 'Added', '-': 'Subtracted', '*': 'Multiplied', '/': 'Divided' };
    return chooseWrong(q, [{
        value: v, misconception: 'wrong-operation', slots: { answer: String(v), op: GLYPH[wop] },
        work: wop === '-' ? `${hi} − ${lo} = {v}` : `${st.a} ${GLYPH[wop]} ${st.b} = {v}`,
        explain: `${names[wop]} when the story asks to ${VERB[st.op].toLowerCase()}.`,
    }], { rotate: false });
}

/**
 * EVERY misconception-based wrong answer of a one-step join story drawn with a part-whole bar, as
 * the bar a pupil would fill (detailed lesson 2's Check Question, 2026-10-16): the whole written in
 * a part box, a story number (a part) on top, and the wrong sign. `display` reads the bar
 * ("top 7 · below 2 and 9"). Not used by `wrongAnswer`, so no existing page changes.
 */
export function wordWorkWrongs(q) {
    const p = payloadOf(q);
    // A two-step story whose first step is × or ÷ (msOps, detailed lesson g3-oa8-two-step-wp): the three
    // two-step errors, each a number (`display` the answer the pupil would write). Absent on every other story.
    if (p && p.steps.length === 2 && (p.steps[0].op === '*' || p.steps[0].op === '/')) {
        const [s1, s2] = p.steps;
        const c = s2.bottom;
        const sign = (x, y) => (s2.op === '+' ? x + y : x - y);
        const small = s1.op === '*' ? s1.b : s1.b;
        const m3 = s2.op === '+' ? small + c : Math.abs(small - c);
        const m2 = s1.op === '*' ? sign(s1.a + s1.b, c) : sign(s1.a - s1.b, c);
        const out = [
            { value: s1.ans, display: fmt(s1.ans), misconception: 'ms-stop-step1', explain: 'Stopped after Step 1.' },
            { value: m3, display: fmt(m3), misconception: 'ms-story-number', explain: 'Did Step 2 with a story number, not the Step 1 answer.' },
            { value: m2, display: fmt(m2), misconception: 'ms-one-op', explain: s1.op === '*' ? 'Added the groups and the number in each.' : 'Took away the friends from the total.' },
        ];
        const seen = new Set([s2.ans]);
        return out.filter((w) => Number.isFinite(w.value) && w.value >= 0 && !seen.has(w.value) && (seen.add(w.value), true))
            .concat([{ value: s2.ans, display: fmt(s2.ans), correct: true }]);
    }
    if (!p || p.steps.length !== 1) return [];
    const st = p.steps[0];
    const sw = storyWrongs(p);
    if (sw) {
        const seen = new Set([Number(p.ans)]);
        return sw.filter((w) => !seen.has(w.value) && (seen.add(w.value), true))
            .map((w) => ({ value: w.value, display: fmt(w.value), misconception: w.misconception, explain: w.explain }))
            .concat([{ value: p.ans, display: fmt(p.ans), correct: true }]);
    }
    if (st.op !== '+') { const w = wordWorkWrong(q); return w ? [w] : []; }
    const bar = (top, x, y) => `top ${fmt(top)} · below ${fmt(x)} and ${fmt(y)}`;
    const hi = Math.max(st.a, st.b), lo = Math.min(st.a, st.b);
    return [
        { value: st.a, display: bar(st.a, st.ans, st.b), misconception: 'bar-whole-in-part', explain: 'Wrote the whole in a part box and a part on top.' },
        { value: hi, display: bar(hi, lo, hi), misconception: 'bar-part-on-top', explain: 'Copied a story number as the whole.' },
        { value: hi - lo, display: bar(hi - lo, st.a, st.b), misconception: 'wrong-operation', explain: 'Subtracted the parts.' },
    ].filter((w) => w.value !== st.ans)
        // the right answer written the same way, so a list of options reads alike
        .concat([{ value: st.ans, display: bar(st.ans, st.a, st.b), correct: true }]);
}
export const barAnswerText = (q) => { const p = payloadOf(q); const st = p && p.steps[0]; return st ? `top ${fmt(st.ans)} · below ${fmt(st.a)} and ${fmt(st.b)}` : ''; };

/** The provider members for one word-problem skill (`sentence`: the stories within 20, drawn as a number sentence). */
export function wordWorkProvider(iCan, extra = {}, { sentence = false } = {}) {
    return Object.assign({
        strings: strings({
            iCan,
            instructionKey: sentence ? 'story-sentence' : 'story-work',
            steps: sentence ? [
                'Read the story two times.',
                'Find the parts and the whole.',
                'Write the number sentence.',
                'Solve. Say the answer and its label.',
            ] : [
                'Read the story two times.',
                'Circle the sign that fits the story.',
                'Write the numbers in the boxes. Solve.',
                'Write the answer and its label word.',
            ],
            say: 'The answer is __ __.',
            sayValues: (q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), Number(p.ans) === 1 && p.unitOne ? p.unitOne : p.unit] : null; },
        }),
        misconceptions: ['wrong-operation'],
        workedSteps: wordWorkSteps,
        wrongAnswer: wordWorkWrong,
        wrongAnswers: wordWorkWrongs,
    }, extra);
}

/**
 * The provider of the four general + / − story hosts (word-stories card, 2026-11-12): its strings follow the page - the
 * number-sentence steps when the band draws the sentence (within 20), the column steps otherwise - and its I Can line
 * follows the kinds the page deals (L6, L28): the change-unknown value "I Can find how many were added" / "... taken
 * away", the two compare-smaller values "I Can find the smaller amount in a compare story".
 */
function storyHostProvider(op) {
    const base = op === '+' ? 'I Can solve addition stories' : 'I Can solve subtraction stories';
    const change = op === '+' ? 'I Can find how many were added' : 'I Can find how many were taken away';
    const compare = 'I Can find the smaller amount in a compare story';
    const cols = wordWorkProvider(base);
    const sent = wordWorkProvider(base, {}, { sentence: true });
    const titleOf = (ref) => {
        const o = ref && ref.opts && typeof ref.opts === 'object' ? ref.opts : null;
        const f = o && Array.isArray(o.forms) && o.forms.length ? o.forms.map(Number) : null;
        if (f) {
            if (f.every((v) => v === 3)) return change;
            if (op === '-' && f.every((v) => v === 4 || v === 5)) return compare;
            return base;
        }
        const p = ref && ref.q ? payloadOf(ref.q) : null;
        if (p && (p.schema === 'add-some' || p.schema === 'take-some')) return change;
        if (p && /^compare-(fewer|more-smaller)$/.test(p.schema || '')) return compare;
        return base;
    };
    const isSentence = (ref) => {
        const p = ref && ref.q ? payloadOf(ref.q) : null;
        if (p) return p.layout === 'sentence';
        const o = ref && ref.opts;
        return !!(o && Number(o.band) > 0 && Number(o.band) <= 20);
    };
    // the structure step of the Steps band names what the kind's bar shows (never "parts and whole" on a compare story)
    const STRUCT = {
        [change]: 'Find First, Then and Now.',
        [compare]: 'Find the bigger amount and the difference.',
    };
    const fn = (ref = {}) => {
        const sentence = isSentence(ref);
        const s = (sentence ? sent : cols).strings(ref);
        const iCan = titleOf(ref);
        const out = Object.assign({}, s, { iCan });
        if (sentence && STRUCT[iCan] && Array.isArray(s.steps) && s.steps.length === 4) {
            out.steps = s.steps.slice();
            out.steps[1] = STRUCT[iCan];
        }
        return out;
    };
    fn.def = cols.strings.def;
    return Object.assign({}, cols, { strings: fn, misconceptions: STORY_MISCONCEPTIONS.slice(), open: compareOpen });
}

/**
 * Stretch's open problem of a compare story with the smaller amount unknown (word-stories critic r1 F11, L6: the role's
 * default "two numbers have a difference of 8" table had no story and no smaller amount). The story stays: the bigger amount
 * is known, the difference is open - "How many could Tom have? How many fewer is that?" - and the check column adds them
 * back to the bigger amount. Undefined for every other kind of story (the role's on-topic default stands).
 */
export function compareOpen(q) {
    const p = payloadOf(q);
    if (!p || !p.steps || p.steps.length !== 1 || !/^compare-(fewer|more-smaller)$/.test(p.schema || '')) return undefined;
    const st = p.steps[0];
    const B = st.top, S = st.ans, d = st.bottom;
    const who = Array.isArray(p.who) && p.who.length >= 2 ? p.who : ['Maya', 'Tom'];
    const things = p.unitMany || p.unit || 'things';
    if (!(B >= 4)) return undefined;
    const rows = [];
    for (let s = B - 1; s >= 1 && rows.length < 8; s -= Math.max(1, Math.round(B / 7))) if (s !== S) rows.push([s, B - s, B]);
    return {
        prompt: [`${who[0]} has ${B} ${things}.`, `${who[1]} has fewer ${things} than ${who[0]}.`, `How many could ${who[1]} have? How many fewer is that?`],
        columns: [`${who[1]} has`, 'Fewer', `Check: ${who[1]} + fewer`],
        example: [S, d, B],
        keyRows: rows,
        rule: `+ = ${B}`, glyph: '+',
        // every smaller amount from 1 to B - 1 is an answer
        total: B - 1,
        basic: false,
    };
}
for (const [key, op] of [['addition:add_word_problems', '+'], ['subtraction:sub_word_problems', '-']]) {
    const def = storyHostProvider(op);
    registerSkill(key, def);
    registerSkill(`${key}_plain`, def);
}

const OWN = {
    'multiplication:mult_word_problems': 'I Can solve multiplication stories',
    'division:div_word_problems': 'I Can solve division stories',
    'multiplication:mult_comparison': 'I Can solve times-as-many stories',
    'number_ops_mixed:word_problems_mixed': 'I Can choose the sign and solve stories',
    'algebra:multi_step_word': 'I Can solve two-step stories',
    'division:remainder_interpret': 'I Can solve division stories with remainders',
    'division:remainder_contexts': 'I Can solve division stories with remainders',
};
for (const [key, iCan] of Object.entries(OWN)) {
    // a remainder story is division by its name: its page never asks for a sign (no sign row)
    // a times-as-many story writes its sign in the neutral sentence's ring: one sign place
    const def = /mult_comparison/.test(key)
        ? wordWorkProvider(iCan, {
            strings: strings({
                iCan,
                instructionKey: 'story-work-ring',
                steps: ['Read the story two times.', 'Write the sign that fits the story in the circle.', 'Write the numbers in the boxes. Solve.', 'Write the answer and its label word.'],
                say: 'The answer is __ __.',
                sayValues: (q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), p.unit] : null; },
            }),
        })
        : /remainder_/.test(key)
        ? wordWorkProvider(iCan, {
            strings: strings({
                iCan,
                instructionKey: 'story-work-div',
                steps: ['Read the story two times.', 'Write the numbers in the boxes. Divide.', 'Read the question again: what does the remainder mean?', 'Write the answer and its label word.'],
                say: 'The answer is __ __.',
                sayValues: (q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), p.unit] : null; },
            }),
        })
        : wordWorkProvider(iCan);
    registerSkill(key, def);
    if (!/remainder_/.test(key)) registerSkill(`${key}_plain`, def);
}
