// Backtest fixture (lane lf-vocab r11, the escape hatch): the r10 growing-patterns set if term, first term and rule all read
// as each other (every number run shows a step; the first term is a term) - three mutually notWith words cannot go into two
// clash-free Match 3 trios, so the set fails V7 and the only way out was one more redraw.
import { VOCAB_WORDS as BASE } from '../../../js/modules/sheet/lesson-pages/vocab-words.js';
const nw = (w, add) => ({ ...BASE[w], notWith: [...BASE[w].notWith, ...add] });
export const VOCAB_WORDS = { ...BASE, rule: nw('rule', ['term', 'first term']), term: nw('term', ['rule']), 'first term': nw('first term', ['rule']) };
export const VOCAB_SETS = [
    { lesson: 'G4|-|extendgrowingshapepatterns', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        words: ['grow', 'term', 'rule', 'odd', 'first term', 'equation'] },
];
