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
    const cues = cuesOf(p);
    const out = [step('Read the story two times.')];
    // the sentence form (stories within 20): the two numbers, the sign in the circle, the answer
    if (p.layout === 'sentence' && p.steps.length === 1) {
        const st = p.steps[0];
        if (cues.length) out.push(step(`Look at the key words: ${cues.slice(0, 2).join(', ')}.`));
        out.push(step(`Write ${fmt(st.top)} and ${fmt(st.bottom)} in the boxes.`, [{ slot: 'fr0-a', value: String(st.top) }, { slot: 'fr0-b', value: String(st.bottom) }]));
        out.push(step(`Write ${GLYPH[st.op]} in the circle. ${VERB[st.op]}.`, [{ slot: 'op0', value: GLYPH[st.op] }]));
        out.push(step(`${workLine(st).replace(/\.$/, '')}. Write ${fmt(p.ans)}${p.unit ? ` ${p.unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }]));
        return clampSteps(out);
    }
    if (cues.length) out.push(step(`Look at the key words: ${cues.slice(0, 2).join(', ')}.`));
    p.steps.forEach((st, i) => {
        const pre = p.steps.length > 1 ? `Step ${i + 1}: ` : '';
        out.push(step(`${pre}Circle ${GLYPH[st.op]}. ${VERB[st.op]}.`, [{ slot: `op${i}`, value: GLYPH[st.op] }]));
        out.push(step(`Write ${fmt(st.top)} and ${fmt(st.bottom)} in the boxes.`));
        out.push(step(workLine(st)));
    });
    out.push(step(`Write the answer: ${fmt(p.ans)}${p.unit ? ` ${p.unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }]));
    return clampSteps(out);
}

/** Error analysis / True or False?: the same story worked with the wrong sign. */
export function wordWorkWrong(q) {
    const p = payloadOf(q);
    if (!p) return null;
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
                'Write the two numbers in the boxes.',
                'Write + or − in the circle.',
                'Solve. Write the answer by its label word.',
            ] : [
                'Read the story two times.',
                'Circle the sign that fits the story.',
                'Write the numbers in the boxes. Solve.',
                'Write the answer and its label word.',
            ],
            say: 'The answer is __ __.',
            sayValues: (q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), p.unit] : null; },
        }),
        misconceptions: ['wrong-operation'],
        workedSteps: wordWorkSteps,
        wrongAnswer: wordWorkWrong,
        wrongAnswers: wordWorkWrongs,
    }, extra);
}

const OWN = {
    'addition:add_word_problems': 'I Can solve addition stories',
    'subtraction:sub_word_problems': 'I Can solve subtraction stories',
    'multiplication:mult_word_problems': 'I Can solve multiplication stories',
    'division:div_word_problems': 'I Can solve division stories',
    'multiplication:mult_comparison': 'I Can solve times-as-many stories',
    'number_ops_mixed:word_problems_mixed': 'I Can choose the sign and solve stories',
    'algebra:multi_step_word': 'I Can solve two-step stories',
    'division:remainder_interpret': 'I Can solve division stories with remainders',
    'division:remainder_contexts': 'I Can solve division stories with remainders',
};
for (const [key, iCan] of Object.entries(OWN)) {
    const def = wordWorkProvider(iCan);
    registerSkill(key, def);
    if (!/remainder_/.test(key)) registerSkill(`${key}_plain`, def);
}
