// word-work.js — every whole-number word problem becomes ONE cell type (owner ruling 2026-09-25).
//
// The generators keep writing their stories (text, a, b, op, ans, hint); this post-step, run
// once by generate-question.js on every generated item, turns a story of a word-problem skill
// into the kit's `word-work` cell (js/modules/sheet/cells/word-work.js):
//
//   story  ->  a small sign row  + − × ÷  ->  column boxes the pupil writes the numbers in
//          ->  "Answer: [box] ______" with a three-word unit bank
//
// q.cell is what print and the key read; q.visual is the same template drawn as its screen twin
// (the host's input takes the answer box). A story this cell cannot carry (a decimal amount, a
// story whose answer is not one or two whole-number steps of its own numbers, a "which numbers"
// or array-builder response) keeps its old cell, so nothing regresses.
//
// The three keyword supports are options on the skill (Support group, all OFF by default):
// `wpCues` bold + underline the key words, `wpBank` the keyword bank box, `wpBar` a bar model
// with blank labels (skill-options.js WORD_WORK_OPTIONS, share keys 8A-8C).
//
// Layer 4 (reads state; imports the pure kit only).

import { state } from './state.js';
import { pageConstant } from './page-deal.js';
import { renderCell, wordWorkPayload, wordWorkTwin, wordWorkWrongs, WW_TEMPLATE } from './sheet/index.js';

/** The word-problem skills the cell is for (the ids a generated item carries). */
const WP_RANGED = /^(add|sub)_wp_(10|20|50|100|1k|10k|100k|1m)(_plain)?$/;
const WP_SKILLS = new Set([
    'add_word_problems', 'add_word_problems_plain', 'sub_word_problems', 'sub_word_problems_plain',
    'mult_word_problems', 'mult_word_problems_plain', 'div_word_problems', 'div_word_problems_plain',
    'mult_comparison', 'mult_comparison_plain', 'word_problems_mixed', 'word_problems_mixed_plain',
    'multi_step_word', 'multi_step_word_plain', 'remainder_interpret', 'remainder_contexts',
]);
const TWO_STEP = new Set(['multi_step_word', 'multi_step_word_plain']);

/** Is `skillId` one of the word-problem skills that take the word-work cell? */
export const isWordWorkSkill = (skillId) => WP_RANGED.test(String(skillId || '')) || WP_SKILLS.has(String(skillId || ''));

/** A support option's value for this item (the set's / caller's choice; OFF when not declared). */
function opt(id) {
    const o = state.skillOptions;
    return !!(o && typeof o === 'object' && o[id] === true);
}

/**
 * The digit tracks of the SKILL's largest numbers, so every item of a page stands on the same
 * columns (round-4 critic: a 2-track and a 3-track grid on one page). The ranged stories take
 * their band (the answer's bound); the others the Max Number (a sum may reach twice it).
 */
function skillTracks(skill, op) {
    const m = /_wp_(10|20|50|100|1k|10k|100k|1m)(_plain)?$/.exec(skill);
    const BAND = { 10: 10, 20: 20, 50: 50, 100: 100, '1k': 1000, '10k': 10000, '100k': 100000, '1m': 1000000 };
    const o = state.skillOptions;
    const band = o && Number(o.band) > 0 ? Number(o.band) : m ? BAND[m[1]] : 0;
    // a difference never needs the band's own extra digit (the number taken from is rarely the band itself)
    if (band) return String(op === '-' ? Math.max(9, band - 1) : band).length;
    const R = Math.max(10, Number(state.range) || 100);
    if (op === '+') return String(2 * R - 1).length;
    return String(R).length;
}

/** The answer bound of a ranged story skill (its band, or the `band` option), else 0. */
function sentenceBand(skill) {
    const m = /_wp_(10|20|50|100|1k|10k|100k|1m)(_plain)?$/.exec(String(skill || ''));
    if (!m) return 0;
    const BAND = { 10: 10, 20: 20, 50: 50, 100: 100, '1k': 1000, '10k': 10000, '100k': 100000, '1m': 1000000 };
    const o = state.skillOptions;
    return o && Number(o.band) > 0 ? Number(o.band) : BAND[m[1]];
}

/** The ranged stories' own "Bar model" support (`support: bar`, skill-options.js _opsBar). */
function barSupport() {
    const o = state.skillOptions;
    return !!(o && typeof o === 'object' && o.support === 'bar');
}

/**
 * Turn one generated story into the word-work cell, in place. Idempotent (a mixed pool that
 * generates through generateQuestion twice converts once). Returns q.
 */
export function applyWordWork(q) {
    if (!q || typeof q !== 'object') return q;
    if (q.cell && q.cell.template === WW_TEMPLATE) return q;
    const skill = String(q.skillId || state.skill || '');
    const outer = String(state.skill || '');
    if (!isWordWorkSkill(skill) && !isWordWorkSkill(outer)) return q;
    // a teacher-chosen response that is not "solve" keeps its own cell (the which-numbers pick, the array builder)
    if (/multi-select|array-builder/.test(String(q.printFormat || '')) || q.answerType === 'multi-select-check') return q;
    if (Array.isArray(q.options) && q.options.length && q.answerType === 'multiple-choice') return q;
    // the K picture story (add_wp_10) keeps its countable picture while pictures are on
    const wp = q.cell && q.cell.template === 'wordpic' && q.cell.payload ? q.cell.payload : null;
    const pic = wp && wp.pictures !== false ? { a: wp.a, b: wp.b, shape: wp.shape } : null;
    let payload = null;
    // the story's names and nouns vary by the item's place on a page (seeded, so reproducible)
    // (by the item's place: neighbours never share a name or a noun, P-WP-12 variety across the page)
    // L10: the walk starts at a point drawn once per page from the seeded rng, so every seed tells
    // different stories (it used to be the same books, stickers, pencils … on every page).
    const k = Number.isFinite(state.itemIndex) ? (state.itemIndex + pageConstant('word-work', 200)) * 5 : Math.floor(Math.random() * 1000);
    const two = TWO_STEP.has(skill) || TWO_STEP.has(outer);
    try {
        payload = wordWorkPayload(q, {
            hl: opt('wpCues'), kb: opt('wpBank'), bar: opt('wpBar') || barSupport(), pic, twoStep: two,
            divFirst: /^remainder_/.test(skill) || /^remainder_/.test(outer),
            // the K picture story keeps its own (already controlled) words
            retell: !(/^add_wp_10(_plain)?$/.test(skill) || wp), seed: k,
        });
        if (payload && !two && payload.steps.length === 1 && payload.steps[0].op !== '/') {
            payload.tracks = skillTracks(skill === outer ? skill : (isWordWorkSkill(skill) ? skill : outer), payload.steps[0].op);
        }
    } catch (e) { payload = null; }
    if (!payload) return q;
    // `wpFrames` (detailed lesson 7): one number sentence a step (the kit cell's `layout: 'frames'`)
    if (opt('wpFrames') && !payload.bar) payload.layout = 'frames';
    // `msLetter` / `msCheck` (3.OA.D.8, detailed lesson 7 round 2): the compact cell answers as ONE equation with a
    // letter (5 × 4 − 6 = n, then n), or with an estimate from numbers rounded to the nearest ten and a yes / no check
    if (opt('msLetter') && !payload.bar) { payload.layout = 'frames'; payload.letter = true; }
    if (opt('msCheck') && !payload.bar && payload.steps.every((st) => st.op === '+' || st.op === '-')) {
        const r10 = (n) => Math.round(n / 10) * 10;
        const [s1, s2] = payload.steps;
        const ea = r10(s1.top), eb = r10(s1.bottom), ec = s2 ? r10(s2.bottom) : 0;
        const e1 = s1.op === '+' ? ea + eb : ea - eb;
        const est = s2 ? (s2.op === '+' ? e1 + ec : e1 - ec) : e1;
        if (e1 >= 0 && est >= 0) { payload.layout = 'frames'; payload.check = { a: ea, b: eb, c: ec, est }; }
    }
    // `msChoose` (3.OA.D.8, detailed lesson 7 r3: the board Check Question's A-D online): a two-step story whose first
    // step is × or ÷ answers by checking one of four - the answer and the three two-step errors, each a different
    // number (the generator deals only such stories), in an order drawn from the item's place (never always D).
    if (opt('msChoose') && !payload.bar && payload.steps.length === 2 && (payload.steps[0].op === '*' || payload.steps[0].op === '/')) {
        let ws = [];
        try { ws = wordWorkWrongs({ cell: { template: WW_TEMPLATE, payload } }) || []; } catch (e) { ws = []; }
        const vals = ws.filter((w) => !w.correct).map((w) => Number(w.value));
        if (vals.length === 3 && new Set([...vals, Number(payload.ans)]).size === 4) {
            const four = [Number(payload.ans), ...vals];
            const r = ((k % 4) + 4) % 4;
            const order = four.slice(r).concat(four.slice(0, r));
            payload.layout = 'choose';
            payload.choices = order;
            payload.correct = order.indexOf(Number(payload.ans));
        }
    }
    // Visual-quality lane (2026-10-31, VQ-3): a one-step + / − story of a skill whose answers are all
    // <= 20 (add_wp_10 / _20, sub_wp_10 / _20, with or without pictures) draws the number SENTENCE
    // `[ ] ◯ [ ] = [ ] unit`, not columns, four signs and a word bank (K-1 counts on / makes ten). The
    // bar option stays (drawn above the sentence); the lesson options (choose / letter / check) win.
    const band = sentenceBand(skill === outer ? skill : (isWordWorkSkill(skill) ? skill : outer));
    if (band && band <= 20 && !two && payload.steps.length === 1 && (payload.steps[0].op === '+' || payload.steps[0].op === '-')
        && Number(payload.ans) <= 20 && !payload.letter && !payload.check && payload.layout !== 'choose') {
        payload.layout = 'sentence';
        payload.digits = 2;
    }
    // the retold story is the item's text on every host (the card, the worksheet, the quiz, print)
    const retold = q.text !== payload.lines.join(' ');
    q.text = payload.lines.join(' ');
    // A retold story has new names and nouns: the generator's hint ("Zoe has more, so add ...")
    // would name a child who is not in it. The hint is rebuilt from the item's own work.
    if (retold) q.hint = workHint(payload);
    q.cell = { template: WW_TEMPLATE, v: 1, payload };
    try { q.visual = wordWorkTwin(renderCell, payload); } catch (e) { /* keep the old visual */ }
    q.answerType = 'number';
    q.options = [];
    q.selfAnswering = true;
    // not a `word*` format: the page measures the cell's columns (print-sheet.js footprintClass)
    q.printFormat = 'story-work';
    q.printText = 'Circle the sign. Write the numbers in the boxes. Solve.';
    if (payload.layout === 'choose') {
        // (one label span + one box span a row: wireTickBoxes makes each row a tap target on every host)
        q.printAnswer = `${'ABCD'[payload.correct]}  ${payload.ans}`;
        q.printText = 'Read the story. Check the right answer.';
        q.screenInstr = 'Read the story. Tap the right answer.';
        q.wordWork = { ops: payload.steps.map((s) => s.op), unit: payload.unit, choose: true };
        return q;
    }
    if (payload.layout === 'sentence') {
        q.printText = 'Read the story. Write the number sentence. Solve.';
        q.screenInstr = 'Read the story. Type the number sentence. Solve.';
        q.wordWork = { ops: payload.steps.map((s) => s.op), unit: payload.unit, sentence: true };
        return q;
    }
    if (payload.letter) { q.printText = 'Read the story. Write the equation. Find n.'; }
    else if (payload.check) { q.printText = 'Solve. Estimate. Circle Yes or No.'; }
    else if (payload.layout === 'frames') { q.printText = 'Read the story. Write each step. Solve.'; }
    // the same instruction in screen verbs (PEDAGOGY 10.2): the hosts print it over the cell
    q.screenInstr = 'Tap the sign. Type the numbers in the boxes. Solve.';
    if (payload.letter) q.screenInstr = 'Read the story. Type the equation. Find n.';
    else if (payload.check) q.screenInstr = 'Solve. Estimate. Tap Yes or No.';
    else if (payload.layout === 'frames') q.screenInstr = 'Read the story. Type each step. Solve.';
    // what the work expects, for a host that marks each box as it is filled
    q.wordWork = { ops: payload.steps.map((s) => s.op), unit: payload.unit };
    return q;
}

/** A hint built from a word-work payload alone (no names): the sign and the number sentence.
 *  Multi-step: one line per step, and a later step never prints the earlier step's answer
 *  (it says "your Step 1 answer"), so the hint does not fill the Step 1 boxes. */
export function workHint(p) {
    const G = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };
    const V = { '+': 'Add', '-': 'Subtract', '*': 'Multiply', '/': 'Divide' };
    const steps = (p && p.steps) || [];
    if (steps.length <= 1) {
        return steps.map((st) => `${V[st.op] || 'Work it out'}: ${st.top} ${G[st.op] || st.op} ${st.bottom} = ?`).join('');
    }
    const lines = steps.map((st, i) => {
        const pre = `Step ${i + 1}: `;
        const prev = i > 0 ? steps[i - 1].ans : undefined;
        const yours = `your Step ${i} answer`;
        let a = st.top, b = st.bottom, aPrev = false, bPrev = false;
        // the previous result is identified by position (st.prevSide when the generator gives
        // it, else the first operand equal to it), so a same-valued own number never leaks it
        const side = st.prevSide || (prev === undefined ? null : String(a) === String(prev) ? 'top' : String(b) === String(prev) ? 'bottom' : null);
        if (side === 'top') { a = yours; aPrev = true; }
        else if (side === 'bottom') { b = yours; bPrev = true; }
        // the other operand equals the previous result too: naming it would print the Step 1 answer
        if (side && String(st.top) === String(st.bottom)) {
            const W = { '+': 'Add your Step N answer to itself', '-': 'Subtract your Step N answer from itself', '*': 'Multiply your Step N answer by itself', '/': 'Divide your Step N answer by itself' };
            if (W[st.op]) return `${pre}${W[st.op].replace('N', String(i))}.`;
        }
        switch (st.op) {
            case '+': return (aPrev || bPrev) ? `${pre}Add ${aPrev ? b : a} to ${aPrev ? a : b}.` : `${pre}Add ${a} and ${b}.`;
            case '-': return `${pre}Subtract ${b} from ${a}.`;
            case '*': return `${pre}Multiply ${aPrev ? a : b} by ${aPrev ? b : a}.`;
            case '/': return `${pre}Divide ${a} by ${b}.`;
            default: return `${pre}${a} ${st.op} ${b} = ?`;
        }
    });
    return lines.join('<br>');
}
