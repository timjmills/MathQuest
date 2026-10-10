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
import { renderCell, wordWorkPayload, wordWorkTwin, WW_TEMPLATE } from './sheet/index.js';

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
        // A times-as-many story divides a TIMES-TABLE fact (4.OA.2: 45 is 5 times as many as 9):
        // the division frame keeps the divisor, dividend and quotient boxes but drops the long
        // division working rows, which a known fact never needs (P-1 writing load; wave 1 lane D:
        // the working made every cell 120 mm tall, two problems to a page).
        if (payload && /^mult_comparison(_plain)?$/.test(skill === outer ? skill : (isWordWorkSkill(skill) ? skill : outer))) {
            for (const st of payload.steps) {
                if (st.op === '/' && st.bottom > 0 && st.bottom <= 10 && st.top % st.bottom === 0 && st.top / st.bottom <= 10) st.fact = true;
            }
            // the pupil CHOOSES × or ÷ here: the work is the neutral [ ] ( ) [ ] = [ ] row, never a
            // ÷ bracket that prints the answer to "Circle the sign" (wave 1 lane D, critic 2026-10-03)
            // ONE answer place for the sign (critic r3 D4): the pupil writes it in the ring, so
            // the frame carries no sign row to circle as well (`signRow: false`).
            if (payload.steps.length === 1) { payload.neutral = true; payload.inRow = false; payload.signRow = false; }
        }
        // A remainder story is division by its name: there is no sign to choose, so no sign row and
        // no "Circle the sign" (the frame's ÷ bracket would give the choice away).
        if (payload && (/^remainder_/.test(skill) || /^remainder_/.test(outer)) && payload.steps.length === 1 && payload.steps[0].op === '/') payload.signs = false;
    } catch (e) { payload = null; }
    if (!payload) return q;
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
    const ring = payload.neutral && payload.signRow === false;
    q.printText = payload.signs === false ? 'Write the numbers in the boxes. Divide. Answer the question.'
        : ring ? 'Write the sign in the circle. Write the numbers. Solve.'
        : 'Circle the sign. Write the numbers in the boxes. Solve.';
    // the same instruction in screen verbs (PEDAGOGY 10.2): the hosts print it over the cell
    q.screenInstr = payload.signs === false ? 'Type the numbers in the boxes. Divide. Answer the question.'
        : ring ? 'Type the sign in the circle. Type the numbers. Solve.'
        : 'Tap the sign. Type the numbers in the boxes. Solve.';
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
