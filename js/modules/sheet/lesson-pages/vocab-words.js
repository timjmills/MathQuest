// js/modules/sheet/lesson-pages/vocab-words.js
// THE LESSON WORD SETS of the vocabulary redesign (design/cards/vocabulary/vocabulary.md §1-2; lane
// lf-vocab, 2026-11-07). One set per CCSS BUILD lesson (design/lessons-first/BUILD_LESSONS.md),
// keyed by the lesson's site id (data/curriculum/site-lessons.json). BUILD lessons have no White
// Rose step, so wrm-vocab.json has no words for them: each set was decided from the lesson's CCSS
// standard text (data/standards/ccss-math.json) and, where a long lesson exists, its own vocabulary
// (lessons/detailed/*.js), owner rule 2026-11-07 ("decide card lines from the standards").
//
// Every word here has a picture in the graphic library (graphics/vocab-pictures.js, the same id).
//   meaning  the child-friendly meaning (at most 8 words; the teacher's line, never printed
//            beside its own picture: that would be the answer)
//   notWith  words whose pictures could honestly be read as this word: never offered in the same
//            item (a Match 3 trio or a 1-picture-3-words bank), so every item has ONE right answer
//
// VOCAB_SETS is APPEND-ONLY: a set's position is its option value (`vocabSet`, skill-options.js),
// which share codes carry. Retire a set by leaving it in place.
//
// Pure module (SCC-01).

/** Every word: meaning, the words it is never offered with. */
export const VOCAB_WORDS = Object.freeze({
    even: { meaning: 'makes pairs, none left over', notWith: ['equal groups'] },
    odd: { meaning: 'one is left over after making pairs', notWith: ['remainder', 'identity', 'equal groups'] },
    product: { meaning: 'the answer when you multiply', notWith: [] },
    factor: { meaning: 'a number you multiply', notWith: [] },
    row: { meaning: 'a line going across', notWith: [] },
    column: { meaning: 'a line going down', notWith: [] },
    multiple: { meaning: 'a number you land on counting in steps', notWith: ['pattern', 'sequence', 'count on'] },
    input: { meaning: 'the number that goes in', notWith: [] },
    output: { meaning: 'the number that comes out', notWith: [] },
    rule: { meaning: 'what we do to every number', notWith: ['pattern'] },
    pattern: { meaning: 'numbers that change the same way', notWith: ['multiple', 'sequence', 'rule', 'repeat'] },
    array: { meaning: 'things in equal rows', notWith: ['equal groups', 'distributive', 'commutative', 'even'] },
    commutative: { meaning: 'turn it round, the answer stays the same', notWith: ['array'] },
    identity: { meaning: 'times 1 keeps the number the same', notWith: ['equal groups', 'odd'] },
    distributive: { meaning: 'split it into two easier parts', notWith: ['array'] },
    step: { meaning: 'one part of the work, in order', notWith: [] },
    total: { meaning: 'all of them together', notWith: ['unknown'] },
    left: { meaning: 'what stays after some go', notWith: ['one less'] },
    'equal groups': { meaning: 'groups with the same number in each', notWith: ['array', 'even', 'odd', 'identity', 'remainder', 'round up'] },
    unknown: { meaning: 'the number we must find', notWith: ['total'] },
    'count on': { meaning: 'say the next numbers from a start', notWith: ['after', 'multiple', 'pattern', 'one more'] },
    'one more': { meaning: 'add one', notWith: ['after', 'count on'] },
    'one less': { meaning: 'take one away', notWith: ['before', 'left'] },
    before: { meaning: 'the number just behind', notWith: ['one less'] },
    after: { meaning: 'the number just ahead', notWith: ['one more', 'count on'] },
    'hundred chart': { meaning: 'numbers in rows of ten', notWith: [] },
    hundred: { meaning: '100: ten tens', notWith: [] },
    ten: { meaning: '10: ten ones', notWith: [] },
    one: { meaning: '1: a single one', notWith: [] },
    digit: { meaning: 'one of the figures 0 to 9', notWith: ['ones digit'] },
    'expanded form': { meaning: 'the number split by place', notWith: [] },
    'number name': { meaning: 'the number written in words', notWith: [] },
    'ones digit': { meaning: 'the digit in the ones place', notWith: ['digit'] },
    repeat: { meaning: 'the same part comes again', notWith: ['pattern', 'cycle'] },
    sequence: { meaning: 'numbers in order, one after another', notWith: ['pattern', 'multiple', 'term', 'first term'] },
    cycle: { meaning: 'goes round and back to the start', notWith: ['repeat'] },
    // (a growing stack of squares is also a sequence and a pattern: critic r2 #3, r3 #9. A known look-alike is ALWAYS
    // listed; the growing-patterns set's words changed instead - ws-vocab-unit V17)
    grow: { meaning: 'gets bigger each time', notWith: ['sequence', 'pattern'] },
    term: { meaning: 'one number in a sequence', notWith: ['first term', 'sequence'] },
    'first term': { meaning: 'the number a sequence starts with', notWith: ['term', 'sequence'] },
    'times as many': { meaning: 'the same amount, again and again', notWith: ['compare'] },
    compare: { meaning: 'find which is more, and by how much', notWith: ['times as many'] },
    equation: { meaning: 'two sides that are equal', notWith: [] },
    remainder: { meaning: 'what is left after equal groups', notWith: ['odd', 'equal groups', 'round up'] },
    quotient: { meaning: 'the answer when you divide', notWith: ['round up'] },
    divisor: { meaning: 'the number you divide by', notWith: [] },
    dividend: { meaning: 'the number you divide up', notWith: [] },
    'round up': { meaning: 'use one more group for what is left', notWith: ['remainder', 'equal groups', 'quotient'] },
});

/**
 * THE SETS (append-only; position = option value). `lesson` the BUILD lesson's site id, `grade`
 * its school grade (K = 0), `round` its lessons-first round, `ccss` its codes, `words` in teaching
 * order (the first three are the lesson's core words: the vocabulary page's Match 3 cell).
 */
export const VOCAB_SETS = Object.freeze([
    // round 1, the pilot unit G3-Y4.B4 first (owner order "one grade first")
    { lesson: 'G3|-|patternsonthemultiplicationtable', title: 'Patterns on the multiplication table', grade: 3, round: 1, ccss: ['3.OA.D.9', '3.OA.C.7'],
        words: ['even', 'odd', 'product', 'row', 'column', 'multiple'] },
    { lesson: 'G3|-|findtheruleinaninputoutputtable', title: 'Find the rule in an input-output table', grade: 3, round: 1, ccss: ['3.OA.D.9'],
        words: ['input', 'output', 'rule', 'pattern', 'product', 'factor'] },
    { lesson: 'G3|-|propertiesofmultiplicationcommutativeidentityanddistributive', title: 'Properties of multiplication', grade: 3, round: 1, ccss: ['3.OA.B.5'],
        words: ['commutative', 'identity', 'distributive', 'array', 'factor', 'product'] },
    { lesson: 'G3|-|twostepwordproblemswiththefouroperations', title: 'Two-step word problems with the four operations', grade: 3, round: 1, ccss: ['3.OA.D.8'],
        words: ['step', 'total', 'left', 'equal groups', 'unknown', 'product'] },
    // round 1, the other grades
    { lesson: 'G1|-|countonto120', title: 'Count on to 120', grade: 1, round: 1, ccss: ['1.NBT.A.1'],
        words: ['count on', 'before', 'digit', 'after', 'one less', 'hundred chart'] },
    { lesson: 'G2|-|readandwritenumbersto1000inwordsnumeralsandexpandedform', title: 'Read and write numbers to 1,000', grade: 2, round: 1, ccss: ['2.NBT.A.3'],
        words: ['digit', 'expanded form', 'number name', 'hundred', 'ten', 'one'] },
    { lesson: 'G4|-|findemergentfeaturesegunitsdigitcycle', title: 'Find emergent features (units digit cycle)', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        words: ['ones digit', 'cycle', 'sequence', 'repeat', 'multiple', 'product'] },
    { lesson: 'G4|-|extendgrowingshapepatterns', title: 'Extend growing shape patterns', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        // (r5: 'sequence' gave way to 'first term' - grow / sequence and grow / pattern are look-alikes, and with sequence
        // the six words had no two clash-free trios; edited in place, the set keeps its position)
        words: ['grow', 'term', 'rule', 'pattern', 'first term', 'equation'] },
    { lesson: 'G4|-|followagivenruletoextendanumberpattern', title: 'Follow a given rule to extend a number pattern', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        words: ['rule', 'first term', 'ones digit', 'term', 'repeat', 'pattern'] },
    { lesson: 'G4|-|multiplicativecomparisontimesasmany', title: 'Multiplicative comparison: times as many', grade: 4, round: 1, ccss: ['4.OA.A.1'],
        words: ['times as many', 'equation', 'factor', 'compare', 'product', 'unknown'] },
    { lesson: 'G4|-|multistepwordproblemsdivideandinterprettheremainder', title: 'Multi-step word problems: divide and interpret the remainder', grade: 4, round: 1, ccss: ['4.OA.A.3', '5.NBT.B.6'],
        words: ['remainder', 'quotient', 'divisor', 'dividend', 'round up', 'equation'] },
]);

/** The set of a BUILD lesson (by site id), or null. */
export const vocabSetFor = (lessonId) => VOCAB_SETS.find((s) => s.lesson === String(lessonId)) || null;
/** The set at an option value (index), or null. */
export const vocabSetAt = (i) => (Number.isInteger(Number(i)) && VOCAB_SETS[Number(i)]) || null;
/** Every word of a grade's sets, in set order, each once. */
export function gradeWords(grade) {
    const out = [];
    for (const s of VOCAB_SETS) if (s.grade === Number(grade)) for (const w of s.words) if (!out.includes(w)) out.push(w);
    return out;
}
// (ws-vocab-unit V5/V7: every set's six words split into two trios with no notWith pair inside, so a page of Match 3
// shows every word once; three words that all clash cannot share one lesson set.)
/** May these words sit in one item (no pair of them reads as the other)? */
export function compatible(words) {
    for (const a of words) for (const b of words) if (a !== b && ((VOCAB_WORDS[a] || {}).notWith || []).includes(b)) return false;
    return true;
}
/** The grades that have sets (K = 0). */
export const VOCAB_GRADES = Object.freeze([...new Set(VOCAB_SETS.map((s) => s.grade))].sort((a, b) => a - b));

export default { VOCAB_WORDS, VOCAB_SETS, vocabSetFor, vocabSetAt, gradeWords, compatible, VOCAB_GRADES };
