// js/modules/sheet/providers/vocabulary.js
// The provider of the picture vocabulary tasks (lane lf-vocab, 2026-11-07; design/cards/vocabulary/
// vocabulary.md): vocabulary:vocab_grade_pictures (the Match 3 pictures skill, its default task) and its
// preset vocab_pick3_words (1 picture, 3 words), which reads its host's provider (contract.js getProvider).
//
//   strings       per task: Match 3 pictures -> "Write the letter of its picture next to each word."
//                 1 picture 3 words -> "Look at the picture. Write its word on the line."
//   workedSteps   the Model, three steps (SCC-P4): look, say / read, write
//   wrongAnswer   Match 3: two letters swapped (the two pictures read the wrong way round);
//                 1 picture 3 words: a bank word that is not the picture's (picked by its sound or
//                 its first letter, not by the picture)
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { strings, step, clampSteps, chooseWrong } from './util.js';
import { VOCAB_WORDS, VOCAB_GRADES, vocabSetAt } from '../lesson-pages/vocab-words.js';

const LET = ['A', 'B', 'C'];
const meaningOf = (w) => (VOCAB_WORDS[w] ? VOCAB_WORDS[w].meaning : '');

const MATCH = strings({
    iCan: 'I Can match a math word to its picture',
    instructionKey: 'vocab-letter',
    steps: ['Look at each picture.', 'Say what it shows.', 'Read each word.', 'Write the letter of its picture.'],
    say: 'Picture __ shows __.',
    vocabulary: ['picture', 'word', 'letter'],
});
const PICK = strings({
    iCan: 'I Can name a picture with its math word',
    instructionKey: 'vocab-word',
    steps: ['Look at the picture.', 'Read the three words.', 'Choose the word for the picture.', 'Write the word on the line.'],
    say: 'This picture shows __.',
    vocabulary: ['picture', 'word', 'line'],
});

/** Plausible misspellings of a word, most likely first (its first word of a phrase is the one changed). */
export function misspellings(word) {
    const w = String(word), out = [];
    const sp = w.indexOf(' '), head = sp > 0 ? w.slice(0, sp) : w, tail = sp > 0 ? w.slice(sp) : '';
    const dbl = /([a-z])\1/.exec(head);
    if (dbl) out.push(head.slice(0, dbl.index) + head.slice(dbl.index + 1) + tail);
    const v = head.slice(1, -1).search(/[aeiou][^aeiou]/);
    if (v >= 0 && head.length > 4) out.push(head.slice(0, v + 1) + head.slice(v + 2) + tail);
    if (head.length > 2) { const i = Math.max(1, Math.floor(head.length / 2) - 1); out.push(head.slice(0, i) + head[i + 1] + head[i] + head.slice(i + 2) + tail); }
    out.push(head.slice(0, -1) + tail);
    return [...new Set(out)].filter((x) => x && x !== w);
}

const templateOf = (q) => (q && q.cell && q.cell.template) || '';
const isPick = (ref = {}) => templateOf(ref.q) === 'vocab-pick3' || ref.skillId === 'vocab_pick3_words'
    || (ref.opts && ref.opts.vocabTask === 'pick3');

/** The strings of the task the reference names (its item, its preset id, or its option). */
function vocabStrings(ref = {}) { return (isPick(ref) ? PICK : MATCH)(ref); }
vocabStrings.def = MATCH.def;

/**
 * The Pre-skill check's skills (lf-vocab r9; contract `preSkills`), nearest first: the steps under this task in its own
 * routine, never the skills data.js lists before it (four Grade 6 definition-matching skills, whose legacy cells overflowed
 * every size). Two at most, so the check is one page at S, M and L (PT 2.10): Match 3 at grade g checks 1 picture, 3 words
 * on the same words, then Match 3 a grade down; 1 picture, 3 words at grade g checks the same task one and two grades down.
 * The lowest grade's 1 picture, 3 words checks itself.
 */
export function vocabPreSkills(sk = {}) {
    const o = sk.opts || {};
    const set = o.vocabSet !== null && o.vocabSet !== undefined ? vocabSetAt(o.vocabSet) : null;
    const g = set ? set.grade : (VOCAB_GRADES.includes(Number(o.vocabGrade)) ? Number(o.vocabGrade) : 3);
    const ref = (task, grade, keepSet) => ({ categoryId: 'vocabulary', skillId: task === 'pick3' ? 'vocab_pick3_words' : 'vocab_grade_pictures',
        opts: { vocabTask: task, vocabGrade: grade, vocabSet: keepSet && set ? o.vocabSet : null } });
    const lower = VOCAB_GRADES.filter((x) => x < g).sort((a, b) => b - a);
    const out = [];
    if (isPick(sk)) for (const x of lower) out.push(ref('pick3', x, false));
    else { out.push(ref('pick3', g, true)); if (lower.length) out.push(ref('match3', lower[0], false)); }
    return out.length ? out.slice(0, 2) : [ref('pick3', g, true)];
}

/**
 * W1 (lf-placevalue, 2026-11-20; lf-roles critic r15): the Model's middle step for 1 picture, 3 words names what the picture
 * SHOWS - the feature that defines its word - never the word itself and never a letter cue (ws-vocab-unit MODEL-STEP-NOT-CUE).
 */
export const PICK_FEATURE = Object.freeze({
    even: 'Every dot has a partner.',
    odd: 'A dot has no partner.',
    product: 'The box is around the answer of the times.',
    factor: 'The boxes are around the numbers we times.',
    row: 'The line goes across.',
    column: 'The line goes down.',
    multiple: 'We land on this number counting in threes.',
    input: 'The box is around the In column.',
    output: 'The box is around the Out column.',
    rule: 'We do the same to every number.',
    pattern: 'The numbers change the same way each time.',
    array: 'The dots are in equal rows.',
    commutative: 'The numbers swap. The answer stays the same.',
    identity: 'Times 1. The number stays the same.',
    distributive: 'The array is split into two parts.',
    step: 'The work is in order: 1, then 2.',
    total: 'The bar shows all of them together.',
    left: 'Some go away. Some stay.',
    'equal groups': 'Each group has the same number of dots.',
    unknown: 'The ? is the number to find.',
    'count on': 'The numbers go on from the start.',
    'one more': 'A dot is added.',
    'one less': 'A dot is crossed out.',
    before: 'The box is just behind the number.',
    after: 'The box is just ahead of the number.',
    'hundred chart': 'The numbers are in rows.',
    hundred: 'The rods make a big square.',
    ten: 'Small squares make a long rod.',
    one: 'It is a single small square.',
    digit: 'The box is around one single number, 0 to 9.',
    'expanded form': 'The number is split by its places.',
    'number name': 'The number is written in words.',
    'ones digit': 'The box is around the number in the ones place.',
    repeat: 'The same part comes again and again.',
    sequence: 'The numbers are in order, one after another.',
    cycle: 'It goes round and back to the start.',
    grow: 'It gets bigger each time.',
    term: 'The box is around one number in the list.',
    'first term': 'The box is around the number at the start.',
    'times as many': 'One bar is 3 times as long.',
    compare: 'We find which bar is longer, and by how much.',
    equation: 'The two sides are equal.',
    remainder: 'Some are left over after the groups.',
    quotient: 'The box is around the answer of the divide.',
    divisor: 'The box is around the number we divide by.',
    dividend: 'The box is around the number we divide up.',
    'round up': 'An extra group holds what is left.',
});

registerSkill('vocabulary:vocab_grade_pictures', {
    supports: Object.freeze([]),
    preSkills: vocabPreSkills,
    strings: vocabStrings,
    misconceptions: ['look-alike-swap', 'sound-not-meaning'],
    workedSteps: (q) => {
        const p = q && q.cell && q.cell.payload;
        if (!p) return [];
        // three steps of at most 10 words (SCC-P4), one per step of the routine (lessons/families/multdiv.js)
        if (templateOf(q) === 'vocab-pick3') {
            // (step 1 is the Guided page's grey hint, guided.js hintOf: it names a cue - the word's first letter - never the
            // instruction again: critic r2 #5; ws-vocab-unit V12)
            // GUIDED-HINT-LEAK (bank) (lf-roles critic r14 z1, lead 2026-11-20; replaces critic r3 #5's one-word cue): the cue
            // narrows the bank to TWO words, never one (a one-word cue is the answer, PT 2.3). The answer's first letter when another
            // bank word shares it; else that letter and one other bank word's letter, in alphabetical order (the order gives nothing).
            // ws-vocab-unit V14.
            const ini = (w) => String(w).charAt(0).toLowerCase();
            const first = ini(p.word);
            const bank = (p.bank || []).map(String);
            const other = bank.find((w) => w !== p.word && ini(w) !== first);
            const shared = bank.filter((w) => ini(w) === first).length >= 2 || !other;
            const cue = shared ? `Its word starts with "${first}".` : `Its word starts with "${[first, ini(other)].sort().join('" or "')}".`;
            // W1: the cue is the Guided hint ONLY (`hint` on step 1, read by guided.js hintOf when present); the Model and the
            // Lesson read the steps: read the bank once, name the picture's defining feature, choose (MODEL-STEP-NOT-CUE)
            const feature = PICK_FEATURE[p.word] || 'Look at what the picture shows.';
            return clampSteps([
                { ...step('Read the three words in the box.'), hint: cue },
                step(feature),
                step(`Write "${p.word}" on the line.`, [{ slot: 'answer', value: p.word }]),
            ]);
        }
        const order = p.order || [0, 1, 2];
        return clampSteps([
            // (step 1 names one word's meaning: the cue the Guided page's grey hint gives - critic r2 #5; V12)
            step(`${p.words[order[0]]} means ${meaningOf(p.words[order[0]])}.`),
            step('Say what each picture shows.'),
            step('Write each letter next to its word.', order.map((wi, n) => ({ slot: `letter-${n}`, value: LET[wi] }))),
        ]);
    },
    wrongAnswer: (q) => {
        const p = q && q.cell && q.cell.payload;
        if (!p) return null;
        if (templateOf(q) === 'vocab-pick3') {
            // a REAL mistake (critic r2 #8): the right word misspelt (M-V4: a double letter written once, two letters
            // swapped, a vowel dropped) - ELL pupils copy the word from the bank and miss a letter; never a bank word that
            // no pupil would read into the picture (ws-vocab-unit V13)
            return chooseWrong(q, misspellings(p.word).map((w) => ({ value: w, misconception: 'misspelt', explain: `Wrote "${w}": copied the word with a letter wrong.` })), { rotate: false });
        }
        const order = (p.order || [0, 1, 2]).slice();
        const letters = order.map((i) => LET[i]);
        // M-V1: two letters swapped; M-V3: A, B, C written in order (matched by position, not by reading the pictures)
        const swapped = [letters[1], letters[0], letters[2]];
        const slotsOf = (ls) => Object.fromEntries(ls.map((l, n) => [`letter-${n}`, l]));
        return chooseWrong(q, [
            { value: swapped.join(', '), slots: slotsOf(swapped), slot: 'letter-0', misconception: 'look-alike-swap', explain: `Swapped the letters of "${p.words[order[0]]}" and "${p.words[order[1]]}".` },
            { value: 'A, B, C', slots: slotsOf(['A', 'B', 'C']), slot: 'letter-0', misconception: 'by-position', explain: 'Wrote A, B, C in order without reading the pictures.' },
        ]);
    },
});

export default { vocabStrings };
