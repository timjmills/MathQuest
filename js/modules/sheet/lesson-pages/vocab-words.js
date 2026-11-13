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
//   explain  the wrong-answer explanation on screen (owner ruling R-2, 2026-11-09): "<Word> means ...", one kid-friendly
//            reason tied to the word's picture, in our own words, at most 14 words; it names its own word and never a
//            word of its notWith list (ws-vocab-unit V24). Shown as "The answer is <word>! <explain>" and read aloud.
//   notWith  words whose pictures could honestly be read as this word: never offered in the same
//            item (a Match 3 trio or a 1-picture-3-words bank), so every item has ONE right answer
//
// VOCAB_SETS is APPEND-ONLY: a set's position is its option value (`vocabSet`, skill-options.js),
// which share codes carry. Retire a set by leaving it in place.
//
// Pure module (SCC-01).

/** Every word: meaning, the wrong-answer explanation, the words it is never offered with. */
export const VOCAB_WORDS = Object.freeze({
    even: { meaning: 'makes pairs, none left over', explain: 'Even means the dots make pairs, with none left over.', notWith: ['equal groups'] },
    odd: { meaning: 'one is left over after making pairs', explain: 'Odd means the dots make pairs and one dot has no partner.', notWith: ['remainder', 'identity', 'equal groups', 'left', 'grow'] },
    product: { meaning: 'the answer when you multiply', explain: 'Product means the answer when you multiply, like the 12 in the box.', notWith: ['equation', 'multiple', 'row', 'column'] },
    factor: { meaning: 'a number you multiply', explain: 'Factor means a number you multiply: the 4 and the 3 in boxes.', notWith: ['equation', 'divisor', 'quotient', 'ones digit'] },
    row: { meaning: 'a line going across', explain: 'Row means a line going across, like the one drawn round.', notWith: ['multiple', 'pattern', 'rule', 'commutative', 'distributive', 'product'] },
    column: { meaning: 'a line going down', explain: 'Column means a line going down, like the one drawn round.', notWith: ['multiple', 'pattern', 'rule', 'commutative', 'distributive', 'product'] },
    multiple: { meaning: 'a number you land on counting in steps', explain: 'Multiple means a number you land on when you count in threes.', notWith: ['pattern', 'sequence', 'count on', 'rule', 'grow', 'product'] },
    input: { meaning: 'the number that goes in', explain: 'Input means the number that goes in, on the In side.', notWith: ['column'] },
    output: { meaning: 'the number that comes out', explain: 'Output means the number that comes out, on the Out side.', notWith: ['column'] },
    rule: { meaning: 'what we do to every number', explain: 'Rule means what we do to every number, like add 3.', notWith: ['pattern', 'row', 'column', 'multiple', 'term', 'first term'] },
    pattern: { meaning: 'numbers that change the same way', explain: 'Pattern means numbers that change the same way, plus 2 each time.', notWith: ['multiple', 'sequence', 'rule', 'repeat'] },
    array: { meaning: 'things in equal rows', explain: 'Array means things in equal rows, like 3 rows of 4 dots.', notWith: ['equal groups', 'distributive', 'commutative', 'even', 'row', 'column'] },
    commutative: { meaning: 'turn it round, the answer stays the same', explain: 'Commutative means you can turn it round and the answer stays the same.', notWith: ['array', 'row', 'column'] },
    identity: { meaning: 'times 1 keeps the number the same', explain: 'Identity means times 1 keeps the number the same, so 5 stays 5.', notWith: ['equal groups', 'odd'] },
    distributive: { meaning: 'split it into two easier parts', explain: 'Distributive means you split it into two easier parts, then add them.', notWith: ['array', 'row', 'column'] },
    step: { meaning: 'one part of the work, in order', explain: 'Step means one part of the work: first Step 1, then Step 2.', notWith: ['column', 'row', 'total', 'left', 'grow'] },
    total: { meaning: 'all of them together', explain: 'Total means all of them together: 5 and 3 make the whole bar.', notWith: ['unknown'] },
    left: { meaning: 'what stays after some go', explain: 'Left means what stays after some go: four are left.', notWith: ['one less'] },
    'equal groups': { meaning: 'groups with the same number in each', explain: 'Equal groups means each group has the same number: 4 dots in each.', notWith: ['array', 'even', 'odd', 'identity', 'remainder', 'round up'] },
    unknown: { meaning: 'the number we must find', explain: 'Unknown means the number we must find, the ? in the box.', notWith: ['total', 'equation'] },
    'count on': { meaning: 'say the next numbers from a start', explain: 'Count on means say the next numbers from a start: 113, 114, 115.', notWith: ['after', 'multiple', 'pattern', 'one more', 'sequence'] },
    'one more': { meaning: 'add one', explain: 'One more means add one: four dots and one more make five.', notWith: ['after', 'count on'] },
    'one less': { meaning: 'take one away', explain: 'One less means take one away: six dots, cross one out.', notWith: ['before', 'left'] },
    before: { meaning: 'the number just behind', explain: 'Before means the number just behind, so 104 comes before 105.', notWith: ['one less'] },
    after: { meaning: 'the number just ahead', explain: 'After means the number just ahead, so 106 comes after 105.', notWith: ['one more', 'count on'] },
    'hundred chart': { meaning: 'numbers in rows of ten', explain: 'Hundred chart means numbers in rows of ten, each row ten more.', notWith: [] },
    hundred: { meaning: '100: ten tens', explain: 'Hundred means 100: ten tens make one big square.', notWith: ['number name', 'array'] },
    ten: { meaning: '10: ten ones', explain: 'Ten means 10: ten ones in one long rod.', notWith: [] },
    one: { meaning: '1: a single one', explain: 'One means 1: a single small square.', notWith: [] },
    digit: { meaning: 'one of the numbers 0 to 9', explain: 'Digit means one of the numbers 0 to 9, like the 7 in 472.', notWith: ['ones digit'] },
    'expanded form': { meaning: 'the number split by place', explain: 'Expanded form means the number split by place: 300 plus 40 plus 7.', notWith: [] },
    'number name': { meaning: 'the number written in words', explain: 'Number name means the number written in words, like forty-seven.', notWith: ['hundred'] },
    'ones digit': { meaning: 'the digit in the ones place', explain: 'Ones digit means the number in the ones place, like the 3 in 473.', notWith: ['digit', 'factor', 'quotient'] },
    repeat: { meaning: 'the part comes back', explain: 'Repeat means the same part comes again and again.', notWith: ['pattern', 'cycle', 'sequence'] },
    sequence: { meaning: 'numbers in order, one after another', explain: 'Sequence means numbers in order, one after another: 5, 10, 15.', notWith: ['pattern', 'multiple', 'term', 'first term'] },
    cycle: { meaning: 'goes round and back to the start', explain: 'Cycle means it goes round to the start again: circle, square, triangle, diamond, circle.', notWith: ['repeat', 'pattern'] },
    // (a growing stack of squares is also a sequence and a pattern: critic r2 #3, r3 #9. A known look-alike is ALWAYS
    // listed; the growing-patterns set's words changed instead - ws-vocab-unit V17)
    grow: { meaning: 'gets bigger each time', explain: 'Grow means it gets bigger each time: 1, then 3, then 5 squares.', notWith: ['sequence', 'pattern', 'odd', 'multiple'] },
    term: { meaning: 'one number in a sequence', explain: 'Term means one number in the list, like the 14 in the box.', notWith: ['first term', 'sequence', 'multiple', 'pattern', 'rule'] },
    'first term': { meaning: 'the number a sequence starts with', explain: 'First term means the number at the start, like the 30 in the box.', notWith: ['term', 'sequence', 'multiple', 'pattern', 'rule'] },
    'times as many': { meaning: 'the same amount, again and again', explain: 'Times as many means one bar is 3 times as long as the other.', notWith: ['compare'] },
    compare: { meaning: 'find which is more, and by how much', explain: 'Compare means find which bar is longer, and by how much.', notWith: ['times as many'] },
    equation: { meaning: 'two sides that are equal', explain: 'Equation means both sides are equal: 12 is the same as 3 times 4.', notWith: [] },
    remainder: { meaning: 'what is left after equal groups', explain: 'Remainder means what is left over after making the groups.', notWith: ['odd', 'equal groups', 'round up'] },
    quotient: { meaning: 'the answer when you divide', explain: 'Quotient means the answer when you divide, like the 3 in the box.', notWith: ['round up', 'equation', 'factor', 'ones digit'] },
    divisor: { meaning: 'the number you divide by', explain: 'Divisor means the number you divide by, like the 4 in the box.', notWith: ['factor'] },
    dividend: { meaning: 'the number you divide up', explain: 'Dividend means the number you divide up, like the 13 in the box.', notWith: [] },
    'round up': { meaning: 'use one more group for what is left', explain: 'Round up means use one more group for what is left over.', notWith: ['remainder', 'equal groups', 'quotient'] },
});

/**
 * V-FEAT (lf-vocab r11): each word's DEFINING FEATURES - alternatives, each a set of picture features (graphics/vocab-pictures.js
 * VOCAB_FEATURES) that together show the word. 'step:*' matches any step; '!f' means the picture must NOT draw f. A picture of
 * word A whose features satisfy word B's definition reads as B: dealt with B it is a clash, unless A and B are notWith
 * (ws-vocab-unit V-FEAT). A word with no picture of its own still has a definition: other pictures may read as it.
 */
export const VOCAB_DEFS = Object.freeze({
    // (r13 V-NUM, critic r12 #1: a picture whose ringed or boxed numbers are all even reads as even - 2, 4, 6, 8 ringed)
    even: [['pairs-ringed', '!lone-mark'], ['all-even']],
    odd: [['pairs-ringed', 'lone-mark'], ['all-odd']],
    // (r13, critic r12 #2: every cell of a times table is a product, as it is a multiple)
    product: [['boxed-answer', 'times-sign'], ['table', 'skip-count']],
    factor: [['boxed-operand', 'times-sign']],
    row: [['row-ringed'], ['array']],
    column: [['column-ringed'], ['array']],
    // (r12, critic r11 #2: a product is a multiple of each of its factors - 4.OA.B.4 - so a boxed answer of a times sentence
    // reads as multiple too; product / multiple are notWith)
    multiple: [['hops', 'number-line'], ['skip-count'], ['boxed-answer', 'times-sign'], ['table', 'skip-count']],
    input: [['arrow-into-box', 'numbers-at-ends'], ['in-ringed']],
    output: [['arrow-out-of-box', 'numbers-at-ends'], ['out-ringed']],
    // (a run reads as THE rule when its step is the rule picture's own +3, or when its step is written on it, +2 hops; a bare
    // run with another step does not - critic r10 #1's redraw of term and first term)
    rule: [['step:3'], ['plus-sign', 'rising-run'], ['arrow-into-box'], ['op-box']],
    pattern: [['rising-run'], ['falling-run'], ['loop-numbers'], ['repeated-block']],
    array: [['array']],
    commutative: [['turn-arrow']],
    identity: [['same-number-arc']],
    distributive: [['split-line', 'array']],
    step: [['step-labels']],
    total: [['bar-whole', 'bar-parts']],
    left: [['crossed-mark'], ['lone-mark']],
    'equal groups': [['groups-of:*']],
    unknown: [['question-mark']],
    'count on': [['forward-hop', 'number-track', 'rising-run']],
    'one more': [['ringed-new'], ['forward-hop']],
    'one less': [['crossed-mark'], ['back-hop']],
    before: [['back-hop']],
    after: [['forward-hop']],
    'hundred chart': [['table', 'step:10']],
    hundred: [['base10-flat']],
    ten: [['base10-rod']],
    one: [['base10-unit']],
    digit: [['digit-ringed'], ['last-digit-boxed']],
    'expanded form': [['expanded-sum']],
    'number name': [['number-words']],
    'ones digit': [['last-digit-boxed']],
    repeat: [['repeated-block']],
    sequence: [['rising-run'], ['falling-run'], ['loop-numbers'], ['repeated-block']],
    cycle: [['loop-shapes'], ['loop-numbers'], ['loop-arrows']],
    grow: [['rising-run'], ['shapes-growing']],
    term: [['boxed-in-run'], ['boxed-first-of-run']],
    'first term': [['boxed-first-of-run']],
    'times as many': [['times-bar']],
    compare: [['bar-pair', 'double-arrow'], ['times-bar']],
    equation: [['equals']],
    remainder: [['groups-of:*', 'lone-mark']],
    quotient: [['boxed-answer', 'divide-sign']],
    divisor: [['boxed-divisor']],
    dividend: [['boxed-dividend']],
    'round up': [['grouped-boxes', 'lone-mark'], ['grouped-boxes']],
});
const featHas = (fs, t) => (t.endsWith(':*') ? fs.some((f) => f.startsWith(t.slice(0, -1))) : fs.includes(t));
/** Do these picture features satisfy a word's definition (one alternative all met)? */
export function featuresSatisfy(features, word) {
    const fs = Array.isArray(features) ? features : [];
    return (VOCAB_DEFS[word] || []).some((alt) => alt.every((t) => (t.startsWith('!') ? !featHas(fs, t.slice(1)) : featHas(fs, t))));
}
/** Every word a picture with these features reads as (its own word included). */
export const vocabWordsReading = (features) => Object.keys(VOCAB_DEFS).filter((w) => featuresSatisfy(features, w));

/**
 * THE SETS (append-only; position = option value). `lesson` the BUILD lesson's site id, `grade`
 * its school grade (K = 0), `round` its lessons-first round, `ccss` its codes, `words` in teaching
 * order (the first three are the lesson's core words: the vocabulary page's Match 3 cell).
 */
export const VOCAB_SETS = Object.freeze([
    // round 1, the pilot unit G3-Y4.B4 first (owner order "one grade first")
    { lesson: 'G3|-|patternsonthemultiplicationtable', title: 'Patterns on the multiplication table', grade: 3, round: 1, ccss: ['3.OA.D.9', '3.OA.C.7'],
        // (r12, critic r11 #2: product / multiple notWith - 12 is a multiple of 4 and of 3 - so multiple joins the core trio;
        // trios {even, odd, multiple} / {product, row, column}; edited in place, the set keeps its position - V7)
        // (r13, critic r12 #2: product reads in every times-table cell, so product / row and product / column went notWith; with
        // multiple / product too the six words had no clash-free split - product (taught by sets 1-3) gave way to factor, a
        // 3.OA.C.7 word; trios {even, odd, multiple} / {factor, row, column}; edited in place, the set keeps its position - V7)
        words: ['even', 'odd', 'multiple', 'factor', 'row', 'column'] },
    { lesson: 'G3|-|findtheruleinaninputoutputtable', title: 'Find the rule in an input-output table', grade: 3, round: 1, ccss: ['3.OA.D.9'],
        words: ['input', 'output', 'rule', 'pattern', 'product', 'factor'] },
    { lesson: 'G3|-|propertiesofmultiplicationcommutativeidentityanddistributive', title: 'Properties of multiplication', grade: 3, round: 1, ccss: ['3.OA.B.5'],
        words: ['commutative', 'identity', 'distributive', 'array', 'factor', 'product'] },
    { lesson: 'G3|-|twostepwordproblemswiththefouroperations', title: 'Two-step word problems with the four operations', grade: 3, round: 1, ccss: ['3.OA.D.8'],
        // (r8, owner O-3: the worked-problem step picture shows a total and what is left, so step sits with equal groups and unknown)
        words: ['step', 'equal groups', 'unknown', 'total', 'left', 'product'] },
    // round 1, the other grades
    { lesson: 'G1|-|countonto120', title: 'Count on to 120', grade: 1, round: 1, ccss: ['1.NBT.A.1'],
        words: ['count on', 'before', 'digit', 'after', 'one less', 'hundred chart'] },
    { lesson: 'G2|-|readandwritenumbersto1000inwordsnumeralsandexpandedform', title: 'Read and write numbers to 1,000', grade: 2, round: 1, ccss: ['2.NBT.A.3'],
        words: ['digit', 'expanded form', 'number name', 'hundred', 'ten', 'one'] },
    { lesson: 'G4|-|findemergentfeaturesegunitsdigitcycle', title: 'Find emergent features (units digit cycle)', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        // (r12, critic r11 #2: product / multiple notWith; the critic's {multiple, sequence, repeat} holds two notWith pairs, so the
        // trios are {product, sequence, cycle} / {ones digit, multiple, repeat}; edited in place, the set keeps its position - V7)
        words: ['ones digit', 'multiple', 'repeat', 'product', 'sequence', 'cycle'] },
    { lesson: 'G4|-|extendgrowingshapepatterns', title: 'Extend growing shape patterns', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        // (r5: 'sequence' gave way to 'first term' - grow / sequence and grow / pattern are look-alikes, and with sequence
        // the six words had no two clash-free trios; edited in place, the set keeps its position)
        // (r9, critic r7 #6: pattern gave way to total: term and first term now clash with pattern (their number runs show a pattern, V-AMBIG+); edited in place, the set keeps its position - V7)
        // (r10, critic r9 #5: total's 5 + 3 part-whole bar did not match a growing-pattern lesson - total gave way to odd, a word of
        // the set's own standard (4.OA.C.5: "the terms appear to alternate between odd and even numbers"; the grow picture's 1, 3, 5
        // squares are odd); odd / grow notWith; edited in place, the set keeps its position - V7)
        // (r12, critic r11 #3: term / rule notWith - the term picture's run can read as the rule "take 4" - so the trios are
        // {rule, odd, first term} (core) / {grow, term, equation}; edited in place, the set keeps its position - V7)
        // (r13, critic r12 #3: first term / rule notWith - the twin of term / rule, V-TWIN - so rule, term and first term all clash
        // and two trios cannot hold them: term gave way to repeat (4.OA.C.5 patterns); trios {grow, first term, repeat} (core) /
        // {rule, odd, equation}; edited in place, the set keeps its position - V7)
        words: ['grow', 'first term', 'repeat', 'rule', 'odd', 'equation'] },
    { lesson: 'G4|-|followagivenruletoextendanumberpattern', title: 'Follow a given rule to extend a number pattern', grade: 4, round: 1, ccss: ['4.OA.C.5'],
        // (r9, critic r7 #6: pattern gave way to output (what a rule gives): pattern clashed with rule, term, first term and repeat (V-AMBIG+); edited in place, the set keeps its position - V7)
        // (r10, critic r9 #5: output belongs to input-output tables, not to extending a pattern by a rule - output gave way to grow;
        // trios {rule, first term, ones digit} / {term, repeat, grow}; edited in place, the set keeps its position - V7)
        // (r13, critic r12 #3: rule, term and first term all clash now (V-TWIN) - first term gave way to odd, named by the set's
        // standard (4.OA.C.5 "alternate between odd and even"); trios {rule, odd, ones digit} / {term, repeat, grow}; edited in
        // place, the set keeps its position - V7)
        words: ['rule', 'odd', 'ones digit', 'term', 'repeat', 'grow'] },
    { lesson: 'G4|-|multiplicativecomparisontimesasmany', title: 'Multiplicative comparison: times as many', grade: 4, round: 1, ccss: ['4.OA.A.1'],
        // (r9, critic r7 #6: equation gave way to total: factor, product and unknown each draw a number sentence ("=", V-AMBIG+); edited in place, the set keeps its position - V7)
        // (r10, critic r9 #4: total's 5 + 3 bar is ADDITIVE part-whole, wrong for a 4.OA.A.1 core trio - total gave way to multiple;
        // trios {times as many, factor, product} / {compare, multiple, unknown}; edited in place, the set keeps its position - V7, V-FIT)
        words: ['times as many', 'factor', 'product', 'compare', 'multiple', 'unknown'] },
    { lesson: 'G4|-|multistepwordproblemsdivideandinterprettheremainder', title: 'Multi-step word problems: divide and interpret the remainder', grade: 4, round: 1, ccss: ['4.OA.A.3', '5.NBT.B.6'],
        words: ['remainder', 'quotient', 'divisor', 'dividend', 'round up', 'equation'] },
]);

/**
 * V-FIT (r10): the operations each set standard teaches. A core word's picture fits its set when it shares a CCSS code with the
 * set or its `op` (graphics/vocab-pictures.js vocabPictureTeaches) is one of these for a set code (ws-vocab-unit V-FIT).
 */
export const VOCAB_STANDARD_OPS = Object.freeze({
    '1.NBT.A.1': ['count'],
    '2.NBT.A.3': ['place'],
    '3.OA.B.5': ['property', 'multiply'],
    '3.OA.C.7': ['multiply', 'table'],
    '3.OA.D.8': ['add', 'subtract', 'multiply', 'divide', 'two-step', 'unknown'],
    '3.OA.D.9': ['pattern', 'table', 'parity', 'rule', 'io-table', 'multiply'],
    '4.OA.A.1': ['multiply', 'compare-times'],
    '4.OA.A.3': ['divide', 'two-step', 'unknown'],
    '4.OA.C.5': ['pattern', 'rule'],
    '5.NBT.B.6': ['divide'],
});
/**
 * The words of a set dealt AS PICTURES (Match 3 pictures, the 1 picture, 3 words picture): its words less its `noPicture`
 * (the r11 escape hatch, lead ruling: a word that cannot get a picture passing V-FEAT against its set is dropped from the
 * set's picture items - it stays in the set's words, its banks and its explanations - and is never redrawn again; each drop
 * carries a comment in the set). No set needs a drop today (r11: term and first term redrawn as falling runs pass V-FEAT).
 */
export const pictureWords = (set) => (set ? set.words.filter((w) => !(set.noPicture || []).includes(w)) : []);
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
/**
 * The set's VETTED trios (r13, critic r12 root cause: pick3 dealt any clash-free pair of the whole set, so banks crossed the
 * trios): every trio of the set's words that is clash-free AND leaves a clash-free rest - the splits a Match 3 page deals.
 */
export function vettedTrios(set) {
    const ws = set ? set.words : [];
    const out = [];
    for (let a = 0; a < ws.length; a++) for (let b = a + 1; b < ws.length; b++) for (let c = b + 1; c < ws.length; c++) {
        const t = [ws[a], ws[b], ws[c]], rest = ws.filter((w) => !t.includes(w));
        if (compatible(t) && compatible(rest)) out.push(t);
    }
    return out;
}
/**
 * EVERY bank a "1 picture, 3 words" item of this set can deal (r13): the picture's word plus the other two words of a vetted
 * trio that holds it. The generator deals only these (gen-vocabulary.js), so ws-vocab-unit V7-ALL judges every one.
 */
export function dealtBanks(set) {
    const trios = vettedTrios(set);
    return pictureWords(set).flatMap((w) => trios.filter((t) => t.includes(w)).map((t) => ({ picture: w, bank: t.slice() })));
}
/** The grades that have sets (K = 0). */
export const VOCAB_GRADES = Object.freeze([...new Set(VOCAB_SETS.map((s) => s.grade))].sort((a, b) => a - b));

/** The screen's wrong-answer line for a word (owner R-2): "The answer is <word>! <explain>". */
export const vocabExplainLine = (w) => (VOCAB_WORDS[w] && VOCAB_WORDS[w].explain ? `The answer is ${w}! ${VOCAB_WORDS[w].explain}` : '');

/**
 * The "Here is how" steps of a wrong vocabulary answer on screen (screen-cell.js markVocabFeedback). Their verb is the
 * screen task's own (critic r7 #4: the pick3 screen says "Tap its word", so the step says "Tap even.", never "Type");
 * the last step names the answer. `wrong`: Match 3's wrongly matched [{word, letter}].
 */
export function vocabHowSteps(template, word, wrong = []) {
    return template === 'vocab-pick3'
        ? ['Read the three words in the box.', `Tap ${word}.`]
        : ['Say what each picture shows.', `Write ${wrong.map((w) => `${w.letter} next to ${w.word}`).join(' and ')}.`];
}
export default { vettedTrios, dealtBanks, VOCAB_DEFS, featuresSatisfy, vocabWordsReading, pictureWords, VOCAB_STANDARD_OPS, vocabHowSteps, vocabExplainLine, VOCAB_WORDS, VOCAB_SETS, vocabSetFor, vocabSetAt, gradeWords, compatible, VOCAB_GRADES };
