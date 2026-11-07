// js/modules/sheet/providers/vocabulary.js
// The provider of the picture vocabulary tasks (lane lf-vocab, 2026-11-07; design/cards/vocabulary/
// vocabulary.md): vocabulary:vocab_grade_pictures (the Match 3 pictures skill, its default task) and its
// preset vocab_pick3_words (1 picture, 3 words), which reads its host's provider (contract.js getProvider).
//
//   strings       per task: Match 3 pictures -> "Write the letter of its picture next to each word."
//                 1 picture 3 words -> "Look at the picture. Write its word on the line."
//   workedSteps   the Model: look at each picture and say what it shows, read the words, write
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
        if (templateOf(q) === 'vocab-pick3') {
            return clampSteps([
                step(`Look at the picture. It shows: ${meaningOf(p.word)}.`),
                step(`Read the three words: ${(p.bank || []).join(', ')}.`),
                step(`The word for this picture is "${p.word}".`),
                step(`Write ${p.word} on the line.`, [{ slot: 'answer', value: p.word }]),
            ]);
        }
        // four steps, one per step of the routine (lessons/families/multdiv.js vocab-picture-words): look, say, find, write
        const order = p.order || [0, 1, 2];
        const words = p.words || [];
        return clampSteps([
            step('Look at pictures A, B and C.'),
            step(`Say what each one shows: ${words.map((w, i) => `${LET[i]}, ${meaningOf(w)}`).join('; ')}.`),
            step(`Find the word for each: ${words.map((w, i) => `${LET[i]} is "${w}"`).join(', ')}.`),
            step('Write each letter next to its word.', order.map((wi, n) => ({ slot: `letter-${n}`, value: LET[wi] }))),
        ]);
    },
    wrongAnswer: (q) => {
        const p = q && q.cell && q.cell.payload;
        if (!p) return null;
        if (templateOf(q) === 'vocab-pick3') {
            const others = (p.bank || []).filter((w) => w !== p.word);
            return chooseWrong(q, others.map((w) => ({ value: w, misconception: 'sound-not-meaning', explain: `Chose "${w}", a word from the bank, without checking it against the picture.` })));
        }
        const order = (p.order || [0, 1, 2]).slice();
        const letters = order.map((i) => LET[i]);
        const swapped = [letters[1], letters[0], letters[2]];
        return chooseWrong(q, [{ value: swapped.join(', '), misconception: 'look-alike-swap', explain: `Swapped the letters of "${p.words[order[0]]}" and "${p.words[order[1]]}".` }], { rotate: false });
    },
});

export default { vocabStrings };
