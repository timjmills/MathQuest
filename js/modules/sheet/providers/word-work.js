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

import { registerSkill, INSTRUCTION_LIBRARY } from '../contract.js';
import { fmt, strings, step, clampSteps, chooseWrong } from './util.js';
import { cueRanges, wordWorkPayload } from '../cells/word-work.js';
import { presetOf } from '../../skill-presets.js';   // pure table (no window / state / DOM), SCC-01 safe

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
    // (the letter and the estimate presets answer differently: their own four moves, whatever the first step - two-step card §3)
    if (p.steps.length === 2 && (p.letter || p.check)) return twoStepSteps(p);
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
    // Every other two-step story (two-step card §3: the routines of BUILD #17 and the lesson-7 follow-ons): four moves,
    // one a chart panel and one a scripted-model frame - the count of the lesson routine's steps (lessons/families/algebra.js).
    if (p.steps.length === 2) return twoStepSteps(p);
    // the sentence form (stories within 20): PART-WHOLE, never key words (PEDAGOGY P-21, P-WP-10; critic r1 F6) - read,
    // find the parts and the whole on the bar (the structure decision: "I know both parts. I add." / "I know the whole
    // and one part. I subtract."), write the number sentence, solve. Four steps: each is one panel of the lesson's chart
    // and one frame of the scripted model, and each frame writes what its step says.
    if (p.layout === 'sentence' && p.steps.length === 1) {
        const st = p.steps[0];
        const add = st.op === '+';
        const whole = add ? st.ans : st.top, pa = add ? st.top : st.bottom, pb = add ? st.bottom : st.ans;
        const unit = Number(p.ans) === 1 && p.unitOne ? p.unitOne : p.unit;
        return [
            step(`The numbers are ${fmt(st.top)} and ${fmt(st.bottom)}.`),
            add
                ? step(`I know both parts: ${fmt(pa)} and ${fmt(pb)}. I add.`, [{ slot: 'bar-a', value: String(pa) }, { slot: 'bar-b', value: String(pb) }])
                : step(`I know the whole, ${fmt(whole)}, and one part, ${fmt(pa)}. I subtract.`, [{ slot: 'bar-w', value: String(whole) }, { slot: 'bar-a', value: String(pa) }]),
            step(`Write ${fmt(st.top)} ${GLYPH[st.op]} ${fmt(st.bottom)} in the boxes.`, [{ slot: 'fr0-a', value: String(st.top) }, { slot: 'op0', value: GLYPH[st.op] }, { slot: 'fr0-b', value: String(st.bottom) }]),
            step(`${workLine(st).replace(/\.$/, '')}. The answer is ${fmt(p.ans)}${unit ? ` ${unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }, { slot: add ? 'bar-w' : 'bar-b', value: String(p.ans) }]),
        ];
    }
    const cues = cuesOf(p);
    const out = [step('Read the story two times.')];
    if (cues.length) out.push(step(`Look at the key words: ${cues.slice(0, 2).join(', ')}.`));
    p.steps.forEach((st, i) => {
        const pre = p.steps.length > 1 ? `Step ${i + 1}: ` : '';
        const mv = p.neutral && p.signRow === false ? `Write ${GLYPH[st.op]} in the circle.` : `Circle ${GLYPH[st.op]}.`;
        out.push(p.signs === false ? step(`${pre}${VERB[st.op]}.`) : step(`${pre}${mv} ${VERB[st.op]}.`, [{ slot: `op${i}`, value: GLYPH[st.op] }]));
        out.push(step(`Write ${fmt(st.top)} and ${fmt(st.bottom)} in the boxes.`));
        out.push(step(workLine(st)));
    });
    out.push(step(`Write the answer: ${fmt(p.ans)}${p.unit ? ` ${p.unit}` : ''}.`, [{ slot: 'answer', value: String(p.ans) }]));
    return clampSteps(out);
}

const r10 = (n) => Math.round(n / 10) * 10;
/** The x / ÷ step written in the story's order (groups x each; total ÷ friends). */
const stepText = (st) => (st.op === '*' ? `${fmt(st.a)} × ${fmt(st.b)} = ${fmt(st.ans)}` : st.op === '/' ? `${fmt(st.top)} ÷ ${fmt(st.bottom)} = ${fmt(st.q)}` : `${fmt(st.top)} ${GLYPH[st.op]} ${fmt(st.bottom)} = ${fmt(st.ans)}`);

/**
 * The four moves of a two-step story whose first step is + or − (the G2 routine, BUILD #17, and the add-first presets),
 * written as one equation with n (msLetter), or checked by an estimate (msCheck). Each step names only this item's numbers.
 */
function twoStepSteps(p) {
    const [s1, s2] = p.steps;
    const unit = p.unit ? ` ${Number(p.ans) === 1 && p.unitOne ? p.unitOne : p.unit}` : '';
    if (p.letter) {
        const x = (st) => (st.op === '*' ? st.a : st.top), y = (st) => (st.op === '*' ? st.b : st.bottom);
        const brk = (s1.op === '+' || s1.op === '-') && (s2.op === '*' || s2.op === '/');
        const eq = `${brk ? '(' : ''}${fmt(x(s1))} ${GLYPH[s1.op]} ${fmt(y(s1))}${brk ? ')' : ''} ${GLYPH[s2.op]} ${fmt(s2.bottom)} = n`;
        return [
            step('Read the story two times.'),
            step(`My equation is ${eq}.`, [{ slot: 'op0', value: GLYPH[s1.op] }, { slot: 'op1', value: GLYPH[s2.op] }]),
            step(`Work it out: ${stepText(s1)}, then ${stepText(s2)}.`),
            step(`n = ${fmt(p.ans)}.`, [{ slot: 'answer', value: String(p.ans) }]),
        ];
    }
    if (p.check) {
        const c = p.check;
        return [
            step(`Solve: ${stepText(s1)}. ${stepText(s2)}.`, [{ slot: 'answer', value: String(p.ans) }]),
            step(`Round each number: ${fmt(s1.top)} is about ${fmt(c.a)}, ${fmt(s1.bottom)} is about ${fmt(c.b)}, ${fmt(s2.bottom)} is about ${fmt(c.c)}.`),
            step(`Estimate: ${fmt(c.a)} ${GLYPH[s1.op]} ${fmt(c.b)} ${GLYPH[s2.op]} ${fmt(c.c)} = ${fmt(c.est)}.`, [{ slot: 'es-r', value: String(c.est) }]),
            step(`${fmt(p.ans)} is close to ${fmt(c.est)}. Yes.`),
        ];
    }
    const add = s1.op === '+' || s1.op === '-';
    return [
        step('Read the story two times.', [{ slot: 'ms-read', value: '1' }]),
        step(`Step 1: ${add ? `circle ${GLYPH[s1.op]}. ` : ''}${stepText(s1)}.`, [{ slot: 'op0', value: GLYPH[s1.op] }]),
        step(`Step 2: use ${fmt(s1.op === '/' ? s1.q : s1.ans)}. ${stepText(s2)}.`, [{ slot: 'op1', value: GLYPH[s2.op] }]),
        // (no marks, as the x / ÷-first moves: the unit word is written in the Step 2 panel - the chart's closing line, three
        // panels; sheet/lesson-arch/story.js twoState draws the parts)
        step(`Write the answer: ${fmt(p.ans)}${unit}.`),
    ];
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
    // Every other two-step story (+ / − first; two-step card §6): M-TS1 stopped after Step 1, M-TS3 Step 2 with a story
    // number, M-TS2 / M-TS6 one operation for all the story numbers (every number added).
    if (p && p.steps.length === 2) {
        const [s1, s2] = p.steps;
        const r1 = s1.op === '/' ? s1.q : s1.ans;
        const calc = (x, op, y) => (op === '+' ? x + y : op === '-' ? Math.abs(x - y) : op === '*' ? x * y : (y && x % y === 0 ? x / y : NaN));
        const n2 = s2.op === '*' ? (s2.a === r1 ? s2.b : s2.a) : s2.bottom;
        const out = [
            { value: r1, display: fmt(r1), misconception: 'ms-stop-step1', explain: 'Stopped after Step 1.' },
            { value: calc(s1.op === '-' ? s1.top : s1.bottom, s2.op, n2), misconception: 'ms-story-number', explain: 'Did Step 2 with a story number, not the Step 1 answer.' },
            { value: s1.top + s1.bottom + n2, misconception: 'ms-one-op', explain: 'Added every number in the story.' },
        ].map((w) => Object.assign(w, { display: fmt(w.value) }));
        const seen = new Set([s2.op === '/' ? s2.q : s2.ans]);
        return out.filter((w) => Number.isInteger(w.value) && w.value >= 0 && !seen.has(w.value) && (seen.add(w.value), true))
            .concat([{ value: p.ans, display: fmt(p.ans), correct: true }]);
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
 * The two-step stories' provider (two-step card 2026-11-13: algebra:multi_step_word(_plain) and the five two_step_*
 * presets, which answer through their host). Its strings FOLLOW THE ITEM, or with no item the page's options (ref.opts,
 * else the preset's values - L28): the instruction ('story-letter', 'story-estimate', 'story-steps', 'story-work'), the
 * lesson routine of card §3 as the steps (four, as many as workedSteps), the title and the Say frame of each kind.
 */
const TS_KIND = {
    letter: { iCan: 'I Can write a two-step story as one equation', key: 'story-letter',
        steps: ['Read it. What do I find first?', 'Write one equation.', 'Work it out.', 'n is the answer.'],
        say: 'My equation is __. n is __.',
        sayValues: (q) => { const p = payloadOf(q); if (!p || p.steps.length !== 2) return null; const w = twoStepSteps(p)[1]; const m = /My equation is (.+)\.$/.exec(w.text); return m ? [m[1], fmt(p.ans)] : null; } },
    check: { iCan: 'I Can check a two-step answer with an estimate', key: 'story-estimate',
        steps: ['Solve the two steps.', 'Round each number to the nearest ten.', 'Estimate.', 'Is my answer close?'],
        say: 'About __. My answer __ is close.',
        sayValues: (q) => { const p = payloadOf(q); return p && p.check ? [fmt(p.check.est), fmt(p.ans)] : null; } },
    muldiv: { iCan: 'I Can solve two-step stories', key: 'story-work',
        steps: ['Read it. What do I find first?', 'Step 1: groups or share. × or ÷.', 'Step 2: use my Step 1 answer.', 'Write the answer and the unit.'] },
    addfirst: { iCan: 'I Can solve two-step stories', key: 'story-work',
        steps: ['Read it. What do I find first?', 'Step 1: put them together.', 'Step 2: share or make groups.', 'Write the answer and the unit.'],
        // (the item's own moves, L6: a take-away first step is not "put them together"; Step 2 shares OR makes groups)
        stepsFor: (q) => { const p = payloadOf(q); if (!p || p.steps.length !== 2) return null; const [s1, s2] = p.steps;
            return ['Read it. What do I find first?', s1.op === '+' ? 'Step 1: put them together.' : 'Step 1: take some away.', s2.op === '/' ? 'Step 2: share them.' : 'Step 2: make groups.', 'Write the answer and the unit.']; } },
    addsub: { iCan: 'I Can solve two-step stories', key: 'story-work',
        steps: ['Read it. What happens first?', 'Step 1: circle the sign. Solve.', 'Step 2: use my Step 1 answer.', 'Write the answer and the unit.'] },
};
/** The kind of a two-step page: from the item's payload, else the page's options, else the preset's values. */
function twoStepKind(ref = {}) {
    const p = ref.q ? payloadOf(ref.q) : null;
    if (p && Array.isArray(p.steps) && p.steps.length === 2) {
        if (p.letter) return 'letter';
        if (p.check) return 'check';
        const [s1, s2] = p.steps;
        if (s1.op === '*' || s1.op === '/') return 'muldiv';
        return s2.op === '*' || s2.op === '/' ? 'addfirst' : 'addsub';
    }
    let o = ref.opts && typeof ref.opts === 'object' ? ref.opts : null;
    if (!o) { const pre = presetOf(ref.categoryId || 'algebra', ref.skillId || ''); o = pre ? pre.opts : {}; }
    if (o.msLetter === true) return 'letter';
    if (o.msCheck === true) return 'check';
    if (['mult', 'div', 'multdiv'].includes(o.msOps)) return 'muldiv';
    if (['addmult', 'adddiv'].includes(o.msOps)) return 'addfirst';
    return 'addsub';
}
export function twoStepProvider() {
    const fns = {};
    for (const [k, d] of Object.entries(TS_KIND)) {
        fns[k] = strings({
            iCan: d.iCan, instructionKey: d.key, steps: d.steps,
            say: d.say || 'The answer is __ __.',
            ...(d.stepsFor ? { stepsFor: d.stepsFor } : {}),
            sayValues: d.sayValues || ((q) => { const p = payloadOf(q); return p && p.unit ? [fmt(p.ans), Number(p.ans) === 1 && p.unitOne ? p.unitOne : p.unit] : null; }),
        });
    }
    const pick = (ref) => {
        const kind = twoStepKind(ref || {});
        const out = fns[kind](ref);
        // (the compact form: one number sentence a step - its own instruction, as the item's printText says)
        const p = ref && ref.q ? payloadOf(ref.q) : null;
        const frames = p ? p.layout === 'frames' && !p.letter && !p.check : !!(ref && ref.opts && ref.opts.wpFrames);
        if (frames && (kind === 'addsub' || kind === 'muldiv' || kind === 'addfirst')) { out.instructionKey = 'story-steps'; out.instruction = INSTRUCTION_LIBRARY['story-steps']; }
        return out;
    };
    pick.def = fns.addsub.def;
    return wordWorkProvider('I Can solve two-step stories', {
        strings: pick,
        // card §6: the two-step errors (M-TS1 / M-TS3 / M-TS2 / M-TS6) and the wrong operation for a step (M-TS4)
        misconceptions: ['ms-stop-step1', 'ms-story-number', 'ms-one-op', 'wrong-operation'],
        // a two-step story is a full-width cell (the two step columns side by side), measured on the page
        footprint: { kind: 'word-work', factLike: false, maxCols: 1, wMm: 186, measure: true },
    });
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
        : /multi_step_word/.test(key) ? twoStepProvider()
        : wordWorkProvider(iCan);
    registerSkill(key, def);
    if (!/remainder_/.test(key)) registerSkill(`${key}_plain`, def);
}
