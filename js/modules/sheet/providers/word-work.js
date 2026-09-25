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
import { cueRanges } from '../cells/word-work.js';

const GLYPH = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const VERB = { '+': 'Add', '-': 'Subtract', '*': 'Multiply', '/': 'Divide' };
/** The sign a pupil wrongly picks for each story sign (the classic confusions). */
const WRONG_OP = { '+': '-', '-': '+', '*': '+', '/': '*' };

const payloadOf = (q) => (q && q.cell && q.cell.template === 'word-work' && q.cell.payload) || null;

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
    const cues = cuesOf(p);
    const out = [step('Read the story two times.')];
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
        explain: `${names[wop]} when the story asks to ${VERB[st.op].toLowerCase()}.`,
    }], { rotate: false });
}

/** The provider members for one word-problem skill. */
export function wordWorkProvider(iCan, extra = {}) {
    return Object.assign({
        strings: strings({
            iCan,
            instructionKey: 'story-work',
            steps: [
                'Read the story two times.',
                'Circle the sign that fits the story.',
                'Write the numbers in the boxes. Solve.',
                'Write the answer and the unit word.',
            ],
            say: 'The answer is __ __.',
            sayValues: (q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), p.unit] : null; },
        }),
        misconceptions: ['wrong-operation'],
        workedSteps: wordWorkSteps,
        wrongAnswer: wordWorkWrong,
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
