// Backtest fixture (lane lf-vocab r11, the escape hatch): the r10 growing-patterns set if term, first term and rule all read
// as each other (every number run shows a step; the first term is a term) - the hatch drops first term from the set's PICTURE items (noPicture),
// so its five picture words split into a clash-free trio and pair (V7) and no redraw is needed.
import { VOCAB_WORDS as BASE } from '../../../js/modules/sheet/lesson-pages/vocab-words.js';
const nw = (w, add) => ({ ...BASE[w], notWith: [...BASE[w].notWith, ...add] });
export const VOCAB_WORDS = { ...BASE, rule: nw('rule', ['term', 'first term']), term: nw('term', ['rule']), 'first term': nw('first term', ['rule']) };
export const VOCAB_SETS = [
    { lesson: 'G4|-|extendgrowingshapepatterns', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        words: ['grow', 'term', 'rule', 'odd', 'first term', 'equation'], noPicture: ['first term'] },
];
