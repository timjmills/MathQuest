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
import { VOCAB_WORDS } from '../lesson-pages/vocab-words.js';

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

registerSkill('vocabulary:vocab_grade_pictures', {
    supports: Object.freeze([]),
    strings: vocabStrings,
    misconceptions: ['look-alike-swap', 'sound-not-meaning'],
    workedSteps: (q) => {
        const p = q && q.cell && q.cell.payload;
        if (!p) return [];
        // three steps of at most 10 words (SCC-P4), one per step of the routine (lessons/families/multdiv.js)
        if (templateOf(q) === 'vocab-pick3') {
            // (step 1 is the Guided page's grey hint, guided.js hintOf: it names a cue - the word's first letter - never the
            // instruction again: critic r2 #5; ws-vocab-unit V12)
            return clampSteps([
                step(`Look at the picture. Its word starts with "${String(p.word).charAt(0)}".`),
                step('Read the three words in the box.'),
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
