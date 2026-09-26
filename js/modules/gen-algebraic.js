// gen-algebraic.js - Algebraic Thinking: Order of Operations, Patterns, Rounding, Place Value, Estimation, Algebra
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createNumberLine } from './svg-base10.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';
import { optionsFor, pvCap } from './skill-options.js';
import { generatePvRounding, generatePvPlaceValue, generatePvEstimation, pvSpan, pvRefuse, pvOptions } from './gen-pv.js';
import { numeralTracksHTML, k2Twin } from './sheet/index.js';
import { generateFunctionTable } from './gen-function-table.js';
import { genNumberPatterns } from './gen-mult-patterns.js';

// ===========================================================================
// THE ODD / EVEN SORT ON PAPER
// ===========================================================================
// A printed cell may never tell a pupil holding a pencil to "click" (BD-12). The screen keeps
// its widget; `printText` is the paper wording and print-generate.js prefers it over q.text.
//
// ONE string, declared once and reused byte-for-byte by every odd/even sort item in this file
// (BD-14, P-LG-2: the same task always gets the same string). Two short imperative sentences,
// 8 words, both verbs from the print verb list (PEDAGOGY_STANDARD.md 10.2); BD-15 names this
// exact pairing as the way a multi-mark instruction is written, inside the 12-word cap of BD-10.
//
// It also makes the PAPER task better than the screen's: every number gets a mark, so the pupil
// makes a decision about each one instead of leaving the rejects blank and indistinguishable
// from the ones they skipped, and the teacher can mark every number rather than only the hits.
// The wording is the same on every cell of the page, so a pupil who has decoded the instruction
// once never has to re-read it to find out which kind is wanted this time.
//
// Because the paper answer is then both groups and the screen answer is only the target group,
// the cell carries `printAnswer` as well — the paper-only key print-settings.js
// _formatAnsForKey() prefers, while q.ans stays what the SCREEN checks.
const ODD_EVEN_SORT_PRINT = 'Circle the even numbers. Cross out the odd numbers.';

// The paper key for that sort: both groups, in the order they are printed, so the teacher marks
// left to right. "0,2" (the screen's index list) is not something anyone can mark against.
function oddEvenSortKey(nums) {
    const list = Array.isArray(nums) ? nums : [];
    const evens = list.filter(n => Number(n) % 2 === 0);
    const odds = list.filter(n => Number(n) % 2 !== 0);
    return `Circle: ${evens.join(', ') || '(none)'}; Cross out: ${odds.join(', ') || '(none)'}`;
}

// ===========================================================================
// WHICH WAY ROUND — number_word_form (one cell shape per page)
// ===========================================================================
// "Write the numeral: ten" and "Write the number in word form: 41" are two different TASKS: one
// reads words and writes a number, the other reads a number and writes words. Rolled per item
// they put two cell shapes on one printed page (the audit's [cell-shape] failure), and the two
// are not even the same writing load — spelling "forty-one" is a spelling task for an ELL pupil,
// writing 41 is not.
//
// So the direction is DEALT, not rolled, exactly as notationFor() and factConstantFor() deal
// their ticked sets in gen-operations.js: the value comes off state.itemIndex, so a six-cell
// page gives 3/3 when both ways are ticked and 6 of one when one is, and nothing is random.
//
// The option itself is NOT registered here — skill-options.js is not this file's to edit. Until
// it is registered, optionsFor() returns no 'wordform' entry and this falls back to a single
// direction, so every cell on today's page is the same task, which is the defect being fixed.
// The registration this expects, to add to SKILL_OPTIONS under 'composing:number_word_form':
//
//   { id: 'wordform', label: 'Which way round', type: 'set', default: ['to_number'],
//     values: [{ v: 'to_number', l: 'Words to numeral (write 41)' },
//              { v: 'to_words',  l: 'Numeral to words (write forty-one)' }],
//     allLabel: 'Both ways', help: 'Tick one way for a page that stays with it. Tick both and
//     the page alternates.' }
//
// The default is 'to_number' because it is the lower writing load (P-LG / low writing load: a
// number, a sign, a check box or a label from a bank before a written word), and because a
// misspelled "fourty" is a spelling error being marked as a maths error.
// ===========================================================================
// ONE COUNTING STEP PER PAGE — number_seq_fill
// ===========================================================================
// The strip's step is drawn ONCE, at the page's first item, and held for the rest of the page,
// the way factConstantFor() draws its page offset in gen-operations.js. Each cell of this skill
// carries its own instruction line, so a page that rolled the step per item read "Count by 10."
// on cell 1 and "Count by 1." on cell 2 — two instructions on one page (BD-10), and for a K-2
// pupil two different tasks on a sheet that is meant to practise one. The next page draws again,
// so a teacher printing a set still gets both.
//
// Live play has no page and no item index, so it draws per question, which is what a single
// question on screen means.
let _seqPageStep = null;
function seqStepFor(range) {
    const legal = range <= 20 ? [1]
        : range <= 100 ? [1, 10]
            : range <= 1000 ? [10, 100]
                : [100, 1000];
    const at = state.itemIndex;
    if (!Number.isFinite(at)) return pick(legal);
    // Redrawn at the first item of a page, and whenever Max Number has moved the legal steps
    // under a page that is already running.
    if (at === 0 || !legal.includes(_seqPageStep)) _seqPageStep = pick(legal);
    return _seqPageStep;
}

const WORD_FORM_WAYS = ['to_number', 'to_words'];
let _wordFormCursor = 0;
function wordFormWay() {
    let def = null;
    try {
        def = optionsFor(state.category, state.skill).find(o => o.id === 'wordform') || null;
    } catch (e) { def = null; }
    const legal = def && Array.isArray(def.values)
        ? def.values.map(v => v.v).filter(v => WORD_FORM_WAYS.includes(v))
        : [];
    let ticked = state.skillOptions ? state.skillOptions.wordform : undefined;
    // A scalar is a pre-check-box value (share code, saved section): treat it as one tick.
    if (typeof ticked === 'string') ticked = [ticked];
    if (!Array.isArray(ticked) && def) ticked = [].concat(def.default);
    ticked = Array.isArray(ticked) ? ticked.filter(v => legal.includes(v)) : [];
    // Nothing ticked means no restriction, never an empty page (skill-options.js set semantics);
    // with no option registered at all there is one legal way and the page stays on it.
    if (!ticked.length) ticked = legal.length ? legal.slice() : ['to_number'];
    // Prefer the caller's kept-item index (generateQuestionFor) for the same reason notationFor
    // does: the internal cursor counts attempts, and a caller that discards duplicates would
    // skew the deal. Live play has no index, so it falls back to its own cursor.
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _wordFormCursor++;
    return ticked[((at % ticked.length) + ticked.length) % ticked.length];
}

export function generateOrderOfOpsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Progressive skill levels for PEMDAS
            let ooSkill = mappedSkill;
            if (ooSkill === "mixed" || !ooSkill) {
                ooSkill = pick(["oop_easy", "oop_medium", "oop_hard", "two_ops_no_paren", "three_ops_no_paren", "multi_ops_no_paren", "paren_simple", "paren_multi", "nested_complex", "exponents_simple", "exponents_mixed", "full_pemdas", "compare_expressions"]);
            }

            // Scale OoO numbers with range: range 10->small, 100->medium, 1000->larger
            // Keep numbers manageable for mental math (cap factors at reasonable levels)
            const ooScale = Math.max(1, Math.min(Math.floor(range / 10), 5));
            // Helper to generate safe numbers for operations, scaled by range
            const safeNum = (min, max) => rng(min, Math.max(min, Math.min(max * ooScale, range)));

            // Helper to pick operation
            const pickOp = (ops) => pick(ops);

            // Helper to format expression for display
            const formatExp = (exp) => exp.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7').replace(/\^/g, '<sup>').replace(/\^(\d+)/g, '<sup>$1</sup>');

            let expression = "";
            let answer = 0;
            let hint = "";
            let steps = [];

            if (ooSkill === "oop_easy" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL expressions equal to N"
                const target = rng(10, 24);
                const correctList = [];
                // Build a few oop expressions that evaluate to target
                for (let attempt = 0; attempt < 8 && correctList.length < 4; attempt++) {
                    const aE = rng(2, 6);
                    const bE = rng(2, 6);
                    const remainder = target - aE * bE;
                    if (remainder >= 1 && remainder <= 20) correctList.push(`${remainder} + ${aE} × ${bE}`);
                }
                if (correctList.length < 2) {
                    correctList.push(`${target} + 0`);
                    correctList.push(`0 + ${target}`);
                }
                const correctPick = shuffle(correctList).slice(0, rng(2, 3));
                // Build wrong expressions: ones that don't equal target
                const wrongList = [
                    `${target + 1} + 0 × 5`,
                    `${target + 2} − 1 × 1`,
                    `(${target} + 2) × 1 − 1`,
                    `${Math.max(1, target - 3)} + 2 × 1`,
                    `${target} × 2 ÷ 4 + 1`
                ];
                const wrongPick = shuffle(wrongList).slice(0, Math.max(2, 5 - correctPick.length));
                const all = shuffle([
                    ...correctPick.map(s => ({ label: s, correct: true })),
                    ...wrongPick.map(s => ({ label: s, correct: false }))
                ]);
                const options = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${target}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Compute each expression using order of operations (× and ÷ before + and −).`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'OoO Easy';
                return;
            }
            if (ooSkill === "oop_easy") {
                // Grade 4: 2 operations, no parentheses, numbers 1-12
                const pattern = pick(["a+bxc", "axb-c", "a+bdc", "axb+c", "a-bdc"]);

                if (pattern === "a+bxc") {
                    const a = rng(1, 12);
                    const b = rng(2, 6);
                    const c = rng(2, 6);
                    expression = `${a} + ${b} \u00d7 ${c}`;
                    answer = a + (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${answer}`];
                    hint = "Multiply first, then add. \u00d7 comes before +";
                } else if (pattern === "axb-c") {
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const c = rng(1, Math.min(a * b - 1, 12));
                    expression = `${a} \u00d7 ${b} \u2212 ${c}`;
                    answer = (a * b) - c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} \u2212 ${c} = ${answer}`];
                    hint = "Multiply first, then subtract.";
                } else if (pattern === "a+bdc") {
                    const c = rng(2, 6);
                    const b = c * rng(2, 4);
                    const a = rng(1, 12);
                    expression = `${a} + ${b} \u00f7 ${c}`;
                    answer = a + (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} + ${b / c} = ${answer}`];
                    hint = "Divide first, then add. \u00f7 comes before +";
                } else if (pattern === "axb+c") {
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const c = rng(1, 12);
                    expression = `${a} \u00d7 ${b} + ${c}`;
                    answer = (a * b) + c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} + ${c} = ${answer}`];
                    hint = "Multiply first, then add.";
                } else {
                    // a - b / c
                    const c = rng(2, 6);
                    const b = c * rng(2, 4);
                    const a = rng(Math.ceil(b / c) + 1, 12);
                    expression = `${a} \u2212 ${b} \u00f7 ${c}`;
                    answer = a - (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} \u2212 ${b / c} = ${answer}`];
                    hint = "Divide first, then subtract.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Easy";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "oop_medium" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL expressions equal to N" (with parens)
                const target = rng(12, 36);
                const correctList = [];
                // Build expressions with parens that evaluate to target
                for (let attempt = 0; attempt < 8 && correctList.length < 4; attempt++) {
                    const cE = rng(2, 6);
                    if (target % cE === 0) {
                        const sumPart = target / cE;
                        if (sumPart >= 3) {
                            const aE = rng(1, sumPart - 1);
                            const bE = sumPart - aE;
                            correctList.push(`(${aE} + ${bE}) × ${cE}`);
                        }
                    }
                }
                // Always-true backups
                correctList.push(`(${target / 2}) × 2`);
                correctList.push(`(${target} + 1) − 1`);
                if (target >= 4) correctList.push(`${target} + (3 − 3)`);
                const correctPick = shuffle(Array.from(new Set(correctList))).slice(0, rng(2, 3));
                const wrongList = [
                    `(${target / 2}) × 3`,
                    `(${target} + 2) × 1 − 1`,
                    `${target} + (2 × 1)`,
                    `(${target} − 1) × 2`,
                    `(2 + 3) × ${target}`
                ];
                const wrongPick = shuffle(wrongList).slice(0, Math.max(2, 5 - correctPick.length));
                const all = shuffle([
                    ...correctPick.map(s => ({ label: s, correct: true })),
                    ...wrongPick.map(s => ({ label: s, correct: false }))
                ]);
                const options = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${target}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Compute parentheses first, then × and ÷, then + and −. Pick every expression that equals ${target}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'OoO Medium';
                return;
            } else if (ooSkill === "oop_medium") {
                // Grade 5: 3-4 operations WITH parentheses
                const pattern = pick(["(a+b)xc", "ax(b-c)+d", "(a+b)dc+dxe", "ax(b+(c-d))"]);

                if (pattern === "(a+b)xc") {
                    const a = rng(2, 10);
                    const b = rng(2, 10);
                    const c = rng(2, 8);
                    expression = `(${a} + ${b}) \u00d7 ${c}`;
                    answer = (a + b) * c;
                    steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Add inside, then multiply.";
                } else if (pattern === "ax(b-c)+d") {
                    const c = rng(2, 8);
                    const b = rng(c + 2, 15);
                    const a = rng(2, 6);
                    const d = rng(1, 15);
                    expression = `${a} \u00d7 (${b} \u2212 ${c}) + ${d}`;
                    answer = a * (b - c) + d;
                    const inner = b - c;
                    const prod = a * inner;
                    steps = [`Parentheses: ${b} \u2212 ${c} = ${inner}`, `Multiply: ${a} \u00d7 ${inner} = ${prod}`, `Add: ${prod} + ${d} = ${answer}`];
                    hint = "Parentheses first, then \u00d7 and \u00f7, then + and \u2212";
                } else if (pattern === "(a+b)dc+dxe") {
                    // (a+b) / c + d * e, ensure clean division
                    const c = rng(2, 5);
                    const sum = c * rng(2, 6);
                    const a = rng(1, sum - 1);
                    const b = sum - a;
                    const d = rng(2, 5);
                    const e = rng(2, 5);
                    expression = `(${a} + ${b}) \u00f7 ${c} + ${d} \u00d7 ${e}`;
                    const divResult = sum / c;
                    const multResult = d * e;
                    answer = divResult + multResult;
                    steps = [`Parentheses: ${a} + ${b} = ${sum}`, `Divide: ${sum} \u00f7 ${c} = ${divResult}`, `Multiply: ${d} \u00d7 ${e} = ${multResult}`, `Add: ${divResult} + ${multResult} = ${answer}`];
                    hint = "Parentheses first, then \u00d7 and \u00f7, then + and \u2212";
                } else {
                    // a * (b + (c - d)) — nested
                    const d = rng(2, 8);
                    const c = rng(d + 2, 15);
                    const b = rng(2, 8);
                    const a = rng(2, 5);
                    const innermost = c - d;
                    const middle = b + innermost;
                    answer = a * middle;
                    expression = `${a} \u00d7 (${b} + (${c} \u2212 ${d}))`;
                    steps = [`Inner parentheses: ${c} \u2212 ${d} = ${innermost}`, `Outer parentheses: ${b} + ${innermost} = ${middle}`, `Multiply: ${a} \u00d7 ${middle} = ${answer}`];
                    hint = "Work from the innermost parentheses outward.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Medium";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "oop_hard") {
                // Grade 6: Nested brackets, exponents, full PEMDAS
                const pattern = pick(["[a+(bxc)]dd", "a2+(bxc)", "(a+b)2-c", "ax[b-(cdd)]"]);

                if (pattern === "[a+(bxc)]dd") {
                    // [a + (b * c)] / d — ensure clean division
                    const b = rng(2, 6);
                    const c = rng(2, 6);
                    const prod = b * c;
                    const a = rng(2, 10);
                    const sum = a + prod;
                    // Find a divisor for sum
                    const divisors = [];
                    for (let i = 2; i <= Math.min(sum, 15); i++) {
                        if (sum % i === 0) divisors.push(i);
                    }
                    const d = divisors.length > 0 ? pick(divisors) : 1;
                    answer = sum / d;
                    expression = `[${a} + (${b} \u00d7 ${c})] \u00f7 ${d}`;
                    steps = [`Inner parentheses: ${b} \u00d7 ${c} = ${prod}`, `Brackets: ${a} + ${prod} = ${sum}`, `Divide: ${sum} \u00f7 ${d} = ${answer}`];
                    hint = "Brackets and parentheses first, then divide.";
                } else if (pattern === "a2+(bxc)") {
                    // a^2 + (b * c)
                    const a = rng(2, 10);
                    const b = rng(2, 8);
                    const c = rng(2, 8);
                    const sq = a * a;
                    const prod = b * c;
                    answer = sq + prod;
                    expression = `${a}<sup>2</sup> + (${b} \u00d7 ${c})`;
                    steps = [`Exponent: ${a}<sup>2</sup> = ${a} \u00d7 ${a} = ${sq}`, `Parentheses: ${b} \u00d7 ${c} = ${prod}`, `Add: ${sq} + ${prod} = ${answer}`];
                    hint = "Brackets, Exponents, Multiply/Divide, Add/Subtract (BEDMAS)";
                } else if (pattern === "(a+b)2-c") {
                    // (a + b)^2 - c
                    const a = rng(2, 6);
                    const b = rng(2, 6);
                    const sum = a + b;
                    const sq = sum * sum;
                    const c = rng(1, Math.min(sq - 1, 30));
                    answer = sq - c;
                    expression = `(${a} + ${b})<sup>2</sup> \u2212 ${c}`;
                    steps = [`Parentheses: ${a} + ${b} = ${sum}`, `Exponent: ${sum}<sup>2</sup> = ${sum} \u00d7 ${sum} = ${sq}`, `Subtract: ${sq} \u2212 ${c} = ${answer}`];
                    hint = "Parentheses first, then exponent, then subtract.";
                } else {
                    // a * [b - (c / d)] — ensure clean division and positive result
                    const d = rng(2, 5);
                    const c = d * rng(1, 4);
                    const quotient = c / d;
                    const b = rng(quotient + 2, 15);
                    const inner = b - quotient;
                    const a = rng(2, 6);
                    answer = a * inner;
                    expression = `${a} \u00d7 [${b} \u2212 (${c} \u00f7 ${d})]`;
                    steps = [`Inner parentheses: ${c} \u00f7 ${d} = ${quotient}`, `Brackets: ${b} \u2212 ${quotient} = ${inner}`, `Multiply: ${a} \u00d7 ${inner} = ${answer}`];
                    hint = "Innermost parentheses first, then brackets, then multiply.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "OoO Hard";
                q.oooSteps = steps;
                q.calculatorAllowed = true;
                return;
            } else if (ooSkill === "two_ops_no_paren") {
                // Level 1: Two operations, no parentheses
                // Examples: 3 + 4 * 2, 8 - 6 / 2, 5 * 3 + 4
                const pattern = pick(["a+b*c", "a-b*c", "a*b+c", "a*b-c", "a+b/c", "a-b/c"]);

                if (pattern === "a+b*c") {
                    const a = safeNum(1, 20);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} + ${b} \u00d7 ${c}`;
                    answer = a + (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before adding!";
                } else if (pattern === "a-b*c") {
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const a = safeNum(b * c + 1, b * c + 20);
                    expression = `${a} - ${b} \u00d7 ${c}`;
                    answer = a - (b * c);
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} - ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before subtracting!";
                } else if (pattern === "a*b+c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, 20);
                    expression = `${a} \u00d7 ${b} + ${c}`;
                    answer = (a * b) + c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} + ${c} = ${answer}`];
                    hint = "Multiply first, then add.";
                } else if (pattern === "a*b-c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, Math.min(a * b - 1, 15));
                    expression = `${a} \u00d7 ${b} - ${c}`;
                    answer = (a * b) - c;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${answer}`];
                    hint = "Multiply first, then subtract.";
                } else if (pattern === "a+b/c") {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10); // Ensure clean division
                    const a = safeNum(1, 20);
                    expression = `${a} + ${b} \u00f7 ${c}`;
                    answer = a + (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} + ${b / c} = ${answer}`];
                    hint = "Remember: Divide before adding!";
                } else {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10);
                    const a = safeNum(b / c + 1, 30);
                    expression = `${a} - ${b} \u00f7 ${c}`;
                    answer = a - (b / c);
                    steps = [`First: ${b} \u00f7 ${c} = ${b / c}`, `Then: ${a} - ${b / c} = ${answer}`];
                    hint = "Remember: Divide before subtracting!";
                }
            } else if (ooSkill === "three_ops_no_paren") {
                // Level 2: Three operations, no parentheses
                const pattern = pick(["a+b*c-d", "a*b+c*d", "a+b+c*d", "a*b-c+d"]);

                if (pattern === "a+b*c-d") {
                    const a = safeNum(5, 20);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const d = safeNum(1, Math.min(a + b * c - 1, 10));
                    expression = `${a} + ${b} \u00d7 ${c} - ${d}`;
                    answer = a + (b * c) - d;
                    steps = [`First: ${b} \u00d7 ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${a + b * c}`, `Finally: ${a + b * c} - ${d} = ${answer}`];
                    hint = "Do multiplication first, then work left to right.";
                } else if (pattern === "a*b+c*d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    expression = `${a} \u00d7 ${b} + ${c} \u00d7 ${d}`;
                    answer = (a * b) + (c * d);
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `And: ${c} \u00d7 ${d} = ${c * d}`, `Then: ${a * b} + ${c * d} = ${answer}`];
                    hint = "Do both multiplications first, then add.";
                } else if (pattern === "a+b+c*d") {
                    const a = safeNum(5, 15);
                    const b = safeNum(5, 15);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 5);
                    expression = `${a} + ${b} + ${c} \u00d7 ${d}`;
                    answer = a + b + (c * d);
                    steps = [`First: ${c} \u00d7 ${d} = ${c * d}`, `Then: ${a} + ${b} + ${c * d} = ${answer}`];
                    hint = "Do the \u00d7 part first, then add the other numbers left to right.";
                } else {
                    const a = safeNum(3, 10);
                    const b = safeNum(2, 8);
                    const c = safeNum(1, Math.min(a * b - 2, 15));
                    const d = safeNum(1, 10);
                    expression = `${a} \u00d7 ${b} - ${c} + ${d}`;
                    answer = (a * b) - c + d;
                    steps = [`First: ${a} \u00d7 ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${a * b - c}`, `Finally: ${a * b - c} + ${d} = ${answer}`];
                    hint = "Multiply first, then work left to right.";
                }
            } else if (ooSkill === "multi_ops_no_paren") {
                // Level 3: 4-6 operations, no parentheses
                // e.g., 26 ÷ 2 × 9 + 21 − 45 or 88 ÷ 11 + 7 × 8 + 12 − 38 + 5
                const pattern = pick(["adxc+d-e", "addbc+dxe+f-g+h", "axb+c-dxe", "addb+cxd-e+f", "axbxc+d-e"]);

                if (pattern === "adxc+d-e") {
                    // a ÷ b × c + d − e (like 26÷2×9+21−45)
                    const b = safeNum(2, 8);
                    const a = b * safeNum(2, 8); // ensure clean division
                    const quotient = a / b;
                    const c = safeNum(2, 9);
                    const prod = quotient * c;
                    const d = safeNum(5, 30);
                    const e = safeNum(1, Math.min(prod + d - 1, 50));
                    expression = `${a} \u00f7 ${b} \u00d7 ${c} + ${d} \u2212 ${e}`;
                    answer = prod + d - e;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${quotient} \u00d7 ${c} = ${prod}`,
                        `Add: ${prod} + ${d} = ${prod + d}`,
                        `Subtract: ${prod + d} \u2212 ${e} = ${answer}`
                    ];
                    hint = "×/÷ left to right first, then +/− left to right.";
                } else if (pattern === "addbc+dxe+f-g+h") {
                    // a ÷ b + c × d + e − f + g (like 88÷11+7×8+12−38+5)
                    const b = safeNum(2, 11);
                    const a = b * safeNum(2, 9);
                    const quotient = a / b;
                    const c = safeNum(2, 9);
                    const d = safeNum(2, 8);
                    const prod = c * d;
                    const e = safeNum(2, 20);
                    const partial = quotient + prod + e;
                    const f = safeNum(1, Math.min(partial - 1, 40));
                    const g = safeNum(1, 15);
                    expression = `${a} \u00f7 ${b} + ${c} \u00d7 ${d} + ${e} \u2212 ${f} + ${g}`;
                    answer = partial - f + g;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${c} \u00d7 ${d} = ${prod}`,
                        `Add/Sub left to right: ${quotient} + ${prod} + ${e} \u2212 ${f} + ${g} = ${answer}`
                    ];
                    hint = "Do all ×/÷ first, then +/− left to right.";
                } else if (pattern === "axb+c-dxe") {
                    // a × b + c − d × e
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    const e = safeNum(2, 6);
                    const prod1 = a * b;
                    const prod2 = d * e;
                    const c = safeNum(1, 20);
                    // Ensure non-negative
                    if (prod1 + c - prod2 < 0) {
                        expression = `${a} \u00d7 ${b} + ${c} + ${d} \u00d7 ${e}`;
                        answer = prod1 + c + prod2;
                        steps = [
                            `First multiply: ${a} \u00d7 ${b} = ${prod1}`,
                            `Second multiply: ${d} \u00d7 ${e} = ${prod2}`,
                            `Add: ${prod1} + ${c} + ${prod2} = ${answer}`
                        ];
                    } else {
                        expression = `${a} \u00d7 ${b} + ${c} \u2212 ${d} \u00d7 ${e}`;
                        answer = prod1 + c - prod2;
                        steps = [
                            `First multiply: ${a} \u00d7 ${b} = ${prod1}`,
                            `Second multiply: ${d} \u00d7 ${e} = ${prod2}`,
                            `Add/Sub: ${prod1} + ${c} \u2212 ${prod2} = ${answer}`
                        ];
                    }
                    hint = "Do both multiplications first, then +/− left to right.";
                } else if (pattern === "addb+cxd-e+f") {
                    // a ÷ b + c × d − e + f
                    const b = safeNum(2, 8);
                    const a = b * safeNum(2, 8);
                    const quotient = a / b;
                    const c = safeNum(2, 7);
                    const d = safeNum(2, 7);
                    const prod = c * d;
                    const e = safeNum(1, Math.min(quotient + prod - 1, 30));
                    const f = safeNum(1, 15);
                    expression = `${a} \u00f7 ${b} + ${c} \u00d7 ${d} \u2212 ${e} + ${f}`;
                    answer = quotient + prod - e + f;
                    steps = [
                        `Divide: ${a} \u00f7 ${b} = ${quotient}`,
                        `Multiply: ${c} \u00d7 ${d} = ${prod}`,
                        `Add/Sub: ${quotient} + ${prod} \u2212 ${e} + ${f} = ${answer}`
                    ];
                    hint = "Multiply and divide first, then add and subtract left to right.";
                } else {
                    // a × b × c + d − e
                    const a = safeNum(2, 5);
                    const b = safeNum(2, 5);
                    const c = safeNum(2, 4);
                    const prod = a * b * c;
                    const d = safeNum(1, 20);
                    const e = safeNum(1, Math.min(prod + d - 1, 30));
                    expression = `${a} \u00d7 ${b} \u00d7 ${c} + ${d} \u2212 ${e}`;
                    answer = prod + d - e;
                    steps = [
                        `Multiply left to right: ${a} \u00d7 ${b} = ${a * b}`,
                        `Continue: ${a * b} \u00d7 ${c} = ${prod}`,
                        `Add: ${prod} + ${d} = ${prod + d}`,
                        `Subtract: ${prod + d} \u2212 ${e} = ${answer}`
                    ];
                    hint = "Multiply left to right first, then +/− left to right.";
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "Multi-Op";
                q.oooSteps = steps;
                return;
            } else if (ooSkill === "paren_simple") {
                // Level 4: Simple parentheses
                const pattern = pick(["(a+b)*c", "(a-b)*c", "a*(b+c)", "a*(b-c)", "(a+b)/c"]);

                if (pattern === "(a+b)*c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 8);
                    expression = `(${a} + ${b}) \u00d7 ${c}`;
                    answer = (a + b) * c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Add inside, then multiply.";
                } else if (pattern === "(a-b)*c") {
                    const b = safeNum(2, 8);
                    const a = safeNum(b + 2, 15);
                    const c = safeNum(2, 8);
                    expression = `(${a} - ${b}) \u00d7 ${c}`;
                    answer = (a - b) * c;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then: ${a - b} \u00d7 ${c} = ${answer}`];
                    hint = "Parentheses first! Subtract inside, then multiply.";
                } else if (pattern === "a*(b+c)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} \u00d7 (${b} + ${c})`;
                    answer = a * (b + c);
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then: ${a} \u00d7 ${b + c} = ${answer}`];
                    hint = "Add inside the parentheses first, then multiply by the number outside.";
                } else if (pattern === "a*(b-c)") {
                    const a = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const b = safeNum(c + 2, 15);
                    expression = `${a} \u00d7 (${b} - ${c})`;
                    answer = a * (b - c);
                    steps = [`First (parentheses): ${b} - ${c} = ${b - c}`, `Then: ${a} \u00d7 ${b - c} = ${answer}`];
                    hint = "Subtract inside the parentheses first, then multiply by the number outside.";
                } else {
                    const c = safeNum(2, 8);
                    const sum = c * safeNum(2, 10);
                    const a = safeNum(1, sum - 1);
                    const b = sum - a;
                    expression = `(${a} + ${b}) \u00f7 ${c}`;
                    answer = (a + b) / c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} \u00f7 ${c} = ${answer}`];
                    hint = "Add inside parentheses first, then divide.";
                }
            } else if (ooSkill === "paren_multi") {
                // Level 4: Parentheses with multiple operations
                const pattern = pick(["(a+b)*c+d", "(a+b)*(c+d)", "a*(b+c)-d", "(a-b)*c+d"]);
                let _pmMax = 0;
                const _trackPm = (...nums) => { for (const n of nums) if (n > _pmMax) _pmMax = n; };

                if (pattern === "(a+b)*c+d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    _trackPm(a, b, c, d, answer);
                    expression = `(${a} + ${b}) \u00d7 ${c} + ${d}`;
                    answer = (a + b) * c + d;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then multiply: ${a + b} \u00d7 ${c} = ${(a + b) * c}`, `Finally add: ${(a + b) * c} + ${d} = ${answer}`];
                    hint = "P then M then A: Parentheses, Multiply, Add";
                } else if (pattern === "(a+b)*(c+d)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 6);
                    _trackPm(a, b, c, d);
                    expression = `(${a} + ${b}) \u00d7 (${c} + ${d})`;
                    answer = (a + b) * (c + d);
                    steps = [`First parentheses: ${a} + ${b} = ${a + b}`, `Second parentheses: ${c} + ${d} = ${c + d}`, `Then multiply: ${a + b} \u00d7 ${c + d} = ${answer}`];
                    hint = "Do BOTH parentheses first, then multiply!";
                } else if (pattern === "a*(b+c)-d") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const d = safeNum(1, Math.min(a * (b + c) - 1, 15));
                    _trackPm(a, b, c, d);
                    expression = `${a} \u00d7 (${b} + ${c}) - ${d}`;
                    answer = a * (b + c) - d;
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then multiply: ${a} \u00d7 ${b + c} = ${a * (b + c)}`, `Finally subtract: ${a * (b + c)} - ${d} = ${answer}`];
                    hint = "Parentheses \u2192 Multiply \u2192 Subtract";
                } else {
                    const b = safeNum(2, 6);
                    const a = safeNum(b + 2, 12);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    _trackPm(a, b, c, d);
                    expression = `(${a} - ${b}) \u00d7 ${c} + ${d}`;
                    answer = (a - b) * c + d;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then multiply: ${a - b} \u00d7 ${c} = ${(a - b) * c}`, `Finally add: ${(a - b) * c} + ${d} = ${answer}`];
                    hint = "Parentheses \u2192 Multiply \u2192 Add";
                }
                // Calculator allowed when any operand exceeds 50 (large-number
                // PEMDAS at high range settings \u2014 paper mental-math threshold).
                if (_pmMax > 50 || answer > 50) q.calculatorAllowed = true;
            } else if (ooSkill === "nested_complex") {
                // Level 6: Complex nested brackets — deeply nested with many operations
                // e.g., (20+80÷2×8)÷[(54÷9+14)÷4] or 3×[64÷(13−5)−4]×42÷6
                const pattern = pick(["(a+bdc*e)d[(fdg+h)di]", "a*[bd(c-d)-e]*f", "(a*b+c)d[(d+e)*f]", "a*[b+(c*d)]de+f"]);

                if (pattern === "(a+bdc*e)d[(fdg+h)di]") {
                    // (a + b÷c × e) ÷ [(f÷g + h) ÷ i]
                    const c = rng(2, 5);
                    const b = c * rng(2, 8);
                    const quotient1 = b / c;
                    const e = rng(2, 5);
                    const prod1 = quotient1 * e;
                    const a = rng(2, 30);
                    const leftVal = a + prod1;
                    const g = rng(2, 9);
                    const f = g * rng(1, 8);
                    const quotient2 = f / g;
                    const h = rng(2, 15);
                    const innerSum = quotient2 + h;
                    // Find a divisor for innerSum to get clean right value
                    const divisors = [];
                    for (let d = 2; d <= Math.min(innerSum, 12); d++) {
                        if (innerSum % d === 0) divisors.push(d);
                    }
                    if (divisors.length > 0) {
                        const i = pick(divisors);
                        const rightVal = innerSum / i;
                        // Ensure leftVal is divisible by rightVal
                        if (rightVal > 0 && leftVal % rightVal === 0) {
                            answer = leftVal / rightVal;
                            expression = `(${a} + ${b} \u00f7 ${c} \u00d7 ${e}) \u00f7 [(${f} \u00f7 ${g} + ${h}) \u00f7 ${i}]`;
                            steps = [
                                `Left side: ${b} \u00f7 ${c} = ${quotient1}`,
                                `Continue: ${quotient1} \u00d7 ${e} = ${prod1}`,
                                `Left result: ${a} + ${prod1} = ${leftVal}`,
                                `Right inner: ${f} \u00f7 ${g} = ${quotient2}`,
                                `Right add: ${quotient2} + ${h} = ${innerSum}`,
                                `Right result: ${innerSum} \u00f7 ${i} = ${rightVal}`,
                                `Final: ${leftVal} \u00f7 ${rightVal} = ${answer}`
                            ];
                            hint = "Work each bracket separately, then combine.";
                        } else {
                            // Fallback: simpler nested
                            const aa = rng(2, 6), bb = rng(2, 6), cc = rng(2, 5);
                            const dd = rng(2, 5);
                            const inner = aa + bb;
                            const mid = inner * cc;
                            const divs2 = [];
                            for (let x = 2; x <= Math.min(mid, 10); x++) if (mid % x === 0) divs2.push(x);
                            const ee = divs2.length > 0 ? pick(divs2) : 1;
                            answer = mid / ee;
                            expression = `(${aa} + ${bb}) \u00d7 ${cc} \u00f7 ${ee}`;
                            steps = [`Parentheses: ${aa} + ${bb} = ${inner}`, `Multiply: ${inner} \u00d7 ${cc} = ${mid}`, `Divide: ${mid} \u00f7 ${ee} = ${answer}`];
                            hint = "Parentheses first, then multiply/divide left to right.";
                        }
                    } else {
                        // Simpler fallback
                        const aa = rng(2, 8), bb = rng(2, 8), cc = rng(2, 6), dd = rng(2, 5);
                        expression = `[${aa} + ${bb}] \u00d7 [${cc} + ${dd}]`;
                        answer = (aa + bb) * (cc + dd);
                        steps = [`First bracket: ${aa} + ${bb} = ${aa + bb}`, `Second bracket: ${cc} + ${dd} = ${cc + dd}`, `Multiply: ${aa + bb} \u00d7 ${cc + dd} = ${answer}`];
                        hint = "Evaluate each bracket first, then multiply.";
                    }
                } else if (pattern === "a*[bd(c-d)-e]*f") {
                    // a × [b ÷ (c − d) − e] × f
                    const d = rng(2, 8);
                    const c = rng(d + 2, d + 10);
                    const diff = c - d;
                    const b = diff * rng(2, 6);
                    const quotient = b / diff;
                    const e = rng(1, Math.max(1, quotient - 1));
                    const bracketVal = quotient - e;
                    const a = rng(2, 6);
                    const f = rng(2, 6);
                    answer = a * bracketVal * f;
                    expression = `${a} \u00d7 [${b} \u00f7 (${c} \u2212 ${d}) \u2212 ${e}] \u00d7 ${f}`;
                    steps = [
                        `Innermost parentheses: ${c} \u2212 ${d} = ${diff}`,
                        `Divide: ${b} \u00f7 ${diff} = ${quotient}`,
                        `Subtract in brackets: ${quotient} \u2212 ${e} = ${bracketVal}`,
                        `Multiply left: ${a} \u00d7 ${bracketVal} = ${a * bracketVal}`,
                        `Multiply right: ${a * bracketVal} \u00d7 ${f} = ${answer}`
                    ];
                    hint = "Innermost parentheses first, then brackets, then multiply left to right.";
                } else if (pattern === "(a*b+c)d[(d+e)*f]") {
                    // (a × b + c) ÷ [(d + e) × f]
                    const d = rng(2, 6);
                    const e = rng(2, 6);
                    const f = rng(2, 5);
                    const rightVal = (d + e) * f;
                    const mult = rng(1, 5);
                    const leftVal = rightVal * mult;
                    // Find a,b,c such that a*b+c = leftVal
                    const aa = rng(2, 8);
                    const bb = rng(2, Math.max(2, Math.floor(leftVal / aa)));
                    const cc = leftVal - (aa * bb);
                    if (cc >= 0 && cc < 100) {
                        answer = mult;
                        expression = `(${aa} \u00d7 ${bb} + ${cc}) \u00f7 [(${d} + ${e}) \u00d7 ${f}]`;
                        steps = [
                            `Left multiply: ${aa} \u00d7 ${bb} = ${aa * bb}`,
                            `Left add: ${aa * bb} + ${cc} = ${leftVal}`,
                            `Right parentheses: ${d} + ${e} = ${d + e}`,
                            `Right multiply: ${d + e} \u00d7 ${f} = ${rightVal}`,
                            `Divide: ${leftVal} \u00f7 ${rightVal} = ${answer}`
                        ];
                        hint = "Evaluate each group, then divide.";
                    } else {
                        // Fallback
                        const x = rng(2, 6), y = rng(2, 6), z = rng(2, 5);
                        expression = `(${x} + ${y}) \u00d7 ${z}`;
                        answer = (x + y) * z;
                        steps = [`Parentheses: ${x} + ${y} = ${x + y}`, `Multiply: ${x + y} \u00d7 ${z} = ${answer}`];
                        hint = "Parentheses first, then multiply.";
                    }
                } else {
                    // a × [b + (c × d)] ÷ e + f
                    const c = rng(2, 6);
                    const d = rng(2, 5);
                    const prod = c * d;
                    const b = rng(2, 15);
                    const bracketVal = b + prod;
                    const e = rng(2, 8);
                    // Ensure clean division
                    const adjusted = Math.ceil(bracketVal / e) * e;
                    const bAdj = adjusted - prod;
                    if (bAdj >= 1) {
                        const a = rng(2, 5);
                        const f = rng(1, 15);
                        const divResult = (bAdj + prod) / e;
                        answer = a * divResult + f;
                        expression = `${a} \u00d7 [${bAdj} + (${c} \u00d7 ${d})] \u00f7 ${e} + ${f}`;
                        steps = [
                            `Inner parentheses: ${c} \u00d7 ${d} = ${prod}`,
                            `Brackets: ${bAdj} + ${prod} = ${bAdj + prod}`,
                            `Multiply: ${a} \u00d7 ${bAdj + prod} = ${a * (bAdj + prod)}`,
                            `Divide: ${a * (bAdj + prod)} \u00f7 ${e} = ${a * divResult}`,
                            `Add: ${a * divResult} + ${f} = ${answer}`
                        ];
                        hint = "Inner parentheses → brackets → multiply/divide → add.";
                    } else {
                        // Simple fallback
                        const x = rng(2, 6), y = rng(2, 6), z = rng(2, 5);
                        expression = `[${x} + ${y}] \u00d7 ${z}`;
                        answer = (x + y) * z;
                        steps = [`Brackets: ${x} + ${y} = ${x + y}`, `Multiply: ${x + y} \u00d7 ${z} = ${answer}`];
                        hint = "Brackets first, then multiply.";
                    }
                }

                q.text = `${expression} = ?`;
                q.ans = answer;
                q.hint = hint;
                q.options = buildNumericOptions(answer);
                q.printFormat = "order-of-ops";
                q.skillLabel = "Nested";
                q.oooSteps = steps;
                q.calculatorAllowed = true;
                return;
            } else if (ooSkill === "exponents_simple") {
                // Level 7: Simple exponents
                // Calculator allowed: students need a tool that supports exponents
                // (mental cubing/squaring of large bases is unreasonable on paper).
                q.calculatorAllowed = true;
                const pattern = pick(["a^2", "a^2+b", "a^2-b", "a^3"]);

                if (pattern === "a^2") {
                    const a = safeNum(2, 12);
                    expression = `${a}\u00b2`;
                    answer = a * a;
                    steps = [`${a}\u00b2 means ${a} \u00d7 ${a}`, `${a} \u00d7 ${a} = ${answer}`];
                    hint = "The small 2 means multiply the number by itself!";
                } else if (pattern === "a^2+b") {
                    const a = safeNum(2, 10);
                    const b = safeNum(1, 20);
                    expression = `${a}\u00b2 + ${b}`;
                    answer = (a * a) + b;
                    steps = [`First: ${a}\u00b2 = ${a} \u00d7 ${a} = ${a * a}`, `Then: ${a * a} + ${b} = ${answer}`];
                    hint = "Exponents before addition!";
                } else if (pattern === "a^2-b") {
                    const a = safeNum(3, 10);
                    const b = safeNum(1, Math.min(a * a - 1, 15));
                    expression = `${a}\u00b2 - ${b}`;
                    answer = (a * a) - b;
                    steps = [`First: ${a}\u00b2 = ${a} \u00d7 ${a} = ${a * a}`, `Then: ${a * a} - ${b} = ${answer}`];
                    hint = "Exponents before subtraction!";
                } else {
                    const a = safeNum(2, 5);
                    expression = `${a}\u00b3`;
                    answer = a * a * a;
                    steps = [`${a}\u00b3 means ${a} \u00d7 ${a} \u00d7 ${a}`, `${a} \u00d7 ${a} = ${a * a}`, `${a * a} \u00d7 ${a} = ${answer}`];
                    hint = "The small 3 means multiply the number by itself 3 times!";
                }
            } else if (ooSkill === "compare_expressions" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 4 comparison statements true/false
                const genCmpExpr = () => {
                    const type = pick(["a+b*c", "a*b-c", "a+b/c", "a*b+c"]);
                    if (type === "a+b*c") {
                        const aa = rng(1, 12), bb = rng(2, 8), cc = rng(2, 6);
                        return { expr: `${aa} + ${bb} × ${cc}`, val: aa + bb * cc };
                    } else if (type === "a*b-c") {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, Math.max(1, aa * bb - 1));
                        return { expr: `${aa} × ${bb} − ${cc}`, val: aa * bb - cc };
                    } else if (type === "a+b/c") {
                        const cc = rng(2, 8), bb = cc * rng(1, 6), aa = rng(1, 15);
                        return { expr: `${aa} + ${bb} ÷ ${cc}`, val: aa + bb / cc };
                    } else {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, 15);
                        return { expr: `${aa} × ${bb} + ${cc}`, val: aa * bb + cc };
                    }
                };
                const stmts = [];
                let safety = 0;
                while (stmts.length < 4 && safety < 80) {
                    safety++;
                    const L = genCmpExpr();
                    const R = genCmpExpr();
                    const sym = pick(['<', '>', '=']);
                    let actuallyTrue;
                    if (sym === '<') actuallyTrue = L.val < R.val;
                    else if (sym === '>') actuallyTrue = L.val > R.val;
                    else actuallyTrue = L.val === R.val;
                    stmts.push({ label: `${L.expr} ${sym} ${R.expr}`, isTrue: actuallyTrue });
                }
                // Ensure at least 1 true and 1 false
                const trues = stmts.filter(s => s.isTrue).length;
                if (trues === 0) stmts[0].isTrue = true;
                else if (trues === 4) stmts[0].isTrue = false;
                const tilesArr = shuffle(stmts);
                const tiles = tilesArr.map((s, i) => ({ id: 't' + i, label: s.label }));
                const ans = {};
                tilesArr.forEach((s, i) => { ans['t' + i] = s.isTrue ? 'binTrue' : 'binFalse'; });
                q.text = `Evaluate each side and drag each statement into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binTrue', label: 'True' },
                    { id: 'binFalse', label: 'False' }
                ];
                q.hint = `Apply order of operations to each side, then compare.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Compare';
                return;
            } else if (ooSkill === "compare_expressions") {
                // Compare two OoO expressions with =, ≠, <, >
                // e.g., 2×3+5 □ 6÷2+5 → answer is = or ≠ or < or >
                const genExpr = () => {
                    // Generate a random 2-3 operation expression and compute its value
                    const type = pick(["a+b*c", "a*b-c", "a+b/c", "a*b+c"]);
                    let expr, val;
                    if (type === "a+b*c") {
                        const aa = rng(1, 12), bb = rng(2, 8), cc = rng(2, 6);
                        expr = `${aa} + ${bb} \u00d7 ${cc}`;
                        val = aa + bb * cc;
                    } else if (type === "a*b-c") {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, Math.max(1, aa * bb - 1));
                        expr = `${aa} \u00d7 ${bb} \u2212 ${cc}`;
                        val = aa * bb - cc;
                    } else if (type === "a+b/c") {
                        const cc = rng(2, 8), bb = cc * rng(1, 6), aa = rng(1, 15);
                        expr = `${aa} + ${bb} \u00f7 ${cc}`;
                        val = aa + bb / cc;
                    } else {
                        const aa = rng(2, 8), bb = rng(2, 6), cc = rng(1, 15);
                        expr = `${aa} \u00d7 ${bb} + ${cc}`;
                        val = aa * bb + cc;
                    }
                    return { expr, val };
                };

                const left = genExpr();
                const right = genExpr();
                const leftVal = left.val;
                const rightVal = right.val;

                let symbol;
                if (leftVal === rightVal) symbol = '=';
                else if (leftVal < rightVal) symbol = '<';
                else symbol = '>';

                expression = `${left.expr}  \u25a1  ${right.expr}`;
                answer = symbol;
                q.text = `Compare: ${left.expr}  ◻  ${right.expr}`;
                q.ans = symbol;
                q.hint = `Evaluate each side first! Left = ${leftVal}, Right = ${rightVal}`;
                q.options = ['<', '>', '=', '\u2260'];
                q.answerType = 'multiple-choice';
                q.printFormat = "compare-expressions";
                q.skillLabel = "Compare";
                q.compareData = { leftExpr: left.expr, rightExpr: right.expr, leftVal, rightVal, symbol };
                q.oooSteps = [`Left: ${left.expr} = ${leftVal}`, `Right: ${right.expr} = ${rightVal}`, `${leftVal} ${symbol} ${rightVal}`];
                // Calculator allowed when either side contains an exponent
                // (^/squared/cubed) OR any literal exceeds 50. Helps with
                // larger-number variants while leaving easy compares calc-free.
                {
                    const _bothExpr = `${left.expr} ${right.expr}`;
                    const _hasExp = /[²³\^]/.test(_bothExpr);
                    const _nums = _bothExpr.match(/\d+/g) || [];
                    const _bigNum = _nums.some(n => parseInt(n, 10) > 50);
                    if (_hasExp || _bigNum) q.calculatorAllowed = true;
                }
                return;
            } else if (ooSkill === "exponents_mixed") {
                // Level 8: Exponents with operations
                // Calculator allowed: combined exponent + multi-op work is hard on paper.
                q.calculatorAllowed = true;
                const pattern = pick(["a^2+b*c", "a*b^2", "(a+b)^2", "a^2-b^2"]);

                if (pattern === "a^2+b*c") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    expression = `${a}\u00b2 + ${b} \u00d7 ${c}`;
                    answer = (a * a) + (b * c);
                    steps = [`First exponent: ${a}\u00b2 = ${a * a}`, `Then multiply: ${b} \u00d7 ${c} = ${b * c}`, `Finally add: ${a * a} + ${b * c} = ${answer}`];
                    hint = "Exponents and multiplication before addition!";
                } else if (pattern === "a*b^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    expression = `${a} \u00d7 ${b}\u00b2`;
                    answer = a * (b * b);
                    steps = [`First exponent: ${b}\u00b2 = ${b * b}`, `Then multiply: ${a} \u00d7 ${b * b} = ${answer}`];
                    hint = "Exponent first, then multiply!";
                } else if (pattern === "(a+b)^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 6);
                    expression = `(${a} + ${b})\u00b2`;
                    answer = (a + b) * (a + b);
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then square: ${a + b}\u00b2 = ${a + b} \u00d7 ${a + b} = ${answer}`];
                    hint = "Parentheses first, then apply the exponent!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, a - 1);
                    expression = `${a}\u00b2 - ${b}\u00b2`;
                    answer = (a * a) - (b * b);
                    steps = [`First: ${a}\u00b2 = ${a * a}`, `Then: ${b}\u00b2 = ${b * b}`, `Finally: ${a * a} - ${b * b} = ${answer}`];
                    hint = "Calculate both squares, then subtract!";
                }
            } else {
                // Level 7: Full PEMDAS challenge
                // Calculator allowed: full PEMDAS with exponents is the hardest tier.
                q.calculatorAllowed = true;
                const pattern = pick(["(a+b)^2-c*d", "a^2+(b+c)*d", "(a*b+c)^2", "a^2+b^2-c"]);

                if (pattern === "(a+b)^2-c*d") {
                    const a = safeNum(2, 5);
                    const b = safeNum(2, 5);
                    const c = safeNum(2, 5);
                    const d = safeNum(2, 5);
                    const squared = (a + b) * (a + b);
                    const product = c * d;
                    if (squared > product) {
                        expression = `(${a} + ${b})\u00b2 - ${c} \u00d7 ${d}`;
                        answer = squared - product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}\u00b2 = ${squared}`, `Multiply: ${c} \u00d7 ${d} = ${product}`, `Subtract: ${squared} - ${product} = ${answer}`];
                    } else {
                        expression = `(${a} + ${b})\u00b2 + ${c} \u00d7 ${d}`;
                        answer = squared + product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}\u00b2 = ${squared}`, `Multiply: ${c} \u00d7 ${d} = ${product}`, `Add: ${squared} + ${product} = ${answer}`];
                    }
                    hint = "PEMDAS: Parentheses \u2192 Exponents \u2192 Multiply \u2192 Add/Subtract";
                } else if (pattern === "a^2+(b+c)*d") {
                    const a = safeNum(3, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 5);
                    expression = `${a}\u00b2 + (${b} + ${c}) \u00d7 ${d}`;
                    answer = (a * a) + (b + c) * d;
                    steps = [`Exponent: ${a}\u00b2 = ${a * a}`, `Parentheses: ${b} + ${c} = ${b + c}`, `Multiply: ${b + c} \u00d7 ${d} = ${(b + c) * d}`, `Add: ${a * a} + ${(b + c) * d} = ${answer}`];
                    hint = "Handle exponents and parentheses first!";
                } else if (pattern === "(a*b+c)^2") {
                    const a = safeNum(2, 4);
                    const b = safeNum(2, 4);
                    const c = safeNum(1, 5);
                    const inside = a * b + c;
                    expression = `(${a} \u00d7 ${b} + ${c})\u00b2`;
                    answer = inside * inside;
                    steps = [`Inside parentheses - multiply: ${a} \u00d7 ${b} = ${a * b}`, `Inside parentheses - add: ${a * b} + ${c} = ${inside}`, `Square the result: ${inside}\u00b2 = ${answer}`];
                    hint = "Solve inside the parentheses first, then square!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, 6);
                    const c = safeNum(1, 15);
                    expression = `${a}\u00b2 + ${b}\u00b2 - ${c}`;
                    answer = (a * a) + (b * b) - c;
                    steps = [`First: ${a}\u00b2 = ${a * a}`, `Then: ${b}\u00b2 = ${b * b}`, `Add: ${a * a} + ${b * b} = ${a * a + b * b}`, `Subtract: ${a * a + b * b} - ${c} = ${answer}`];
                    hint = "Calculate both exponents first!";
                }
            }

            q.text = `${expression} = ?`;
            q.ans = answer;
            q.hint = hint;
            q.oooSteps = steps;
            q.printFormat = "order-of-ops";

            // Create visual with step-by-step breakdown
            const stepsHTML = steps.map((s, i) => `<div style="margin: 5px 0;"><strong>Step ${i + 1}:</strong> ${s}</div>`).join('');
            q.hintVisual = `<div style="text-align:left;font-size:0.9rem;padding:10px;background:rgba(255,255,255,0.1);border-radius:8px;">
                <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">PEMDAS Steps:</div>
                ${stepsHTML}
            </div>`;

            q.options = buildNumericOptions(answer);
            return;
}

export function generatePatternsQuestion(q, mappedSkill, helpers) {
    // Number patterns with a rule (owner, 2026-09-25): count on / back, double / halve, x 10,
    // growing steps, from the ones to the thousands. See gen-mult-patterns.js genNumberPatterns.
    if (mappedSkill === 'number_patterns_rule') { genNumberPatterns(q); return; }
    const { rng, range, applyDecimals, ensureTables } = helpers;
            const start = rng(1, range);
            // allowRuleQ: only true for mixed patterns, not specific ones like seq_2, seq_5, etc.
            const patternQ = (step, allowRuleQ = false) => {
                const seq = [start, start + step, start + step * 2, start + step * 3];

                // Only ask for rule identification when it's a mixed pattern (50% chance)
                const askForRule = allowRuleQ && Math.random() < 0.5;

                if (askForRule) {
                    // Rule identification question
                    const isAdd = step > 0;
                    const absStep = Math.abs(step);
                    const ruleText = isAdd ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${seq[0].toLocaleString()}, ${seq[1].toLocaleString()}, ${seq[2].toLocaleString()}, ${seq[3].toLocaleString()}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    // Wrong operation
                    wrongRules.push(isAdd ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    // Wrong step amount
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    // Visual showing the sequence with question marks for the rule
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                        <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;white-space:nowrap;max-width:100%;">
                            <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[0].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[1].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[2].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[3].toLocaleString()}</span>
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Ask for a missing number at any position (1st, 2nd, 3rd, or 4th)
                    const missingPos = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
                    q.ans = seq[missingPos];
                    q.hint = `Each number ${step > 0 ? "increases" : "decreases"} by ${Math.abs(step).toLocaleString()}. Pattern: ${step > 0 ? '+' : '\u2212'}${Math.abs(step).toLocaleString()}`;

                    // Build sequence display with ___ at the missing position
                    const seqDisplay = seq.map((n, i) => i === missingPos ? '___' : n.toLocaleString());
                    q.text = `Complete: ${seqDisplay.join(', ')}`;

                    const arrow = step > 0 ? `+${Math.abs(step).toLocaleString()}\u2192` : `\u2212${Math.abs(step).toLocaleString()}\u2192`;
                    const posLabels = ['1st', '2nd', '3rd', '4th'];
                    q.visual = `<div style="text-align:center;">
                        <div style="margin-bottom:10px;font-size:0.9rem;color:var(--text-secondary);">Find the <strong style="color:var(--accent-green);">${posLabels[missingPos]}</strong> number</div>
                        <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;white-space:nowrap;max-width:100%;">
                        ${seq.map((n, i) => {
                            if (i === missingPos) {
                                return `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:12px 20px;border-radius:10px;min-width:50px;text-align:center;font-size:1.3rem;">___</span>`;
                            } else {
                                return `<span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${n.toLocaleString()}</span>`;
                            }
                        }).join(`<span style="color:var(--accent-orange);font-size:1.2rem;font-weight:700;">${arrow}</span>`)}
                        </div>
                    </div>`;
                }
            };
            // For mixed, pick a random skill from patterns (including doubling/halving)
            let patternSkill = mappedSkill;
            if (mappedSkill === "mixed") {
                patternSkill = pick(["seq_2", "seq_5", "seq_10", "seq_100", "count_by_fill", "plus_minus_10", "plus_minus_100", "random_step", "identify_rule", "next_three", "function_table_easy", "function_table_hard", "double", "halve", "shape_pattern", "number_pattern", "skip_count_line", "skip_count_grid", "pattern_relationship"]);
            } else if (mappedSkill === "mixed_double_halve") {
                // LRU rotation between double and halve so neither dominates.
                patternSkill = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('mixed_double_halve', ["double", "halve"])
                    : pick(["double", "halve"]);
                q._variant = patternSkill;
            }

            // Phase 4.5 batch 2: dnd-order modernization for sequence/skip-count skills
            if ((patternSkill === "seq_2" || patternSkill === "seq_5" || patternSkill === "seq_10" || patternSkill === "count_by_fill" || patternSkill === "number_pattern") && Math.random() < 0.30) {
                let step;
                let labelStr;
                if (patternSkill === "seq_2") { step = 2; labelStr = "Skip Count by 2s"; }
                else if (patternSkill === "seq_5") { step = 5; labelStr = "Skip Count by 5s"; }
                else if (patternSkill === "seq_10") { step = 10; labelStr = "Skip Count by 10s"; }
                else if (patternSkill === "count_by_fill") {
                    step = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    labelStr = `Count by ${step}s`;
                } else {
                    // number_pattern — pick step in line with original logic
                    let stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                    if (range >= 100) stepOptions.push(15, 20, 25);
                    if (range >= 500) stepOptions.push(50);
                    step = pick(stepOptions);
                    labelStr = "Number Pattern";
                }
                const tileCount = pick([4, 5]);
                const maxStart = Math.max(1, Math.min(range - step * (tileCount + 1), Math.floor(range / 2)));
                const start = rng(1, Math.max(1, maxStart));
                const terms = Array.from({ length: tileCount }, (_, i) => start + step * i);
                // LRU rotation across 2 variants (was random pick).
                const direction = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('_skip_count_dir', ["asc", "desc"])
                    : pick(["asc", "desc"]);
                q._variant = direction;
                const sortedTerms = direction === "asc" ? [...terms] : [...terms].reverse();
                const presentation = shuffle(terms.map((t, i) => ({ id: 't' + i, label: String(t), val: t })));
                const ans = sortedTerms.map(v => presentation.find(t => t.val === v).id);
                q.text = `Drag the numbers in ${direction === "asc" ? "counting" : "reverse counting"} order.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? `counting up by ${step}s` : `counting down by ${step}s`;
                q.hint = `Each step ${direction === "asc" ? "adds" : "subtracts"} ${step}.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = labelStr;
                return;
            }
            // Phase 4.5 batch 2: dnd-order for pattern_relationship — drag corresponding output values
            if (patternSkill === "pattern_relationship" && Math.random() < 0.30) {
                const factor = pick([2, 3, 4, 5, 10]);
                const startA = rng(1, 5);
                const seqA = Array.from({ length: 4 }, (_, i) => startA + i);
                const seqB = seqA.map(x => x * factor);
                const presentation = shuffle(seqB.map((v, i) => ({ id: 't' + i, label: String(v), val: v })));
                const sortedB = [...seqB].sort((a, b) => a - b);
                const ans = sortedB.map(v => presentation.find(t => t.val === v).id);
                q.text = `Pattern A is ${seqA.join(', ')}. Drag Pattern B values in the matching order (smallest first).`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = `B values, smallest to largest`;
                q.hint = `Pattern B is each Pattern A value × ${factor}.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Pattern Relationship';
                return;
            }
            // Function tables (owner request 2026-09-25): one kit cell, drawn the same on paper, on the
            // key and on screen, every choice made by the skill's options (gen-function-table.js).
            // Replaces the 30% "drag each pair into a bin" diversion and the colour IN/OUT table.
            if (patternSkill === "function_table_easy" || patternSkill === "function_table_hard") {
                generateFunctionTable(q, patternSkill);
                return;
            }

            if (patternSkill === "select_even_odd") {
                // MAP-style multi-select-check: "Click ALL the even/odd numbers"
                // Modeled on NWEA RIT 181-200 sample items (worksheet ref: "Click on
                // all the even numbers from this set"). Uses the standard MAP widget
                // (multi-select-check) instead of the legacy odd-even-select panel,
                // so it slots into the same pipeline as other MAP gap-fill skills.
                const seoMax = Math.max(20, Math.min(range, 100));
                const targetType = pick(["even", "odd"]);
                const optionCount = 6;
                const correctCount = randInt(2, 4);
                const wrongCount = optionCount - correctCount;
                const correctNums = [];
                const wrongNums = [];
                let safety = 0;
                while (correctNums.length < correctCount && safety++ < 200) {
                    const n = randInt(1, seoMax);
                    const fits = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                    if (fits && !correctNums.includes(n)) correctNums.push(n);
                }
                safety = 0;
                while (wrongNums.length < wrongCount && safety++ < 200) {
                    const n = randInt(1, seoMax);
                    const fits = targetType === "even" ? n % 2 !== 0 : n % 2 === 0;
                    if (fits && !wrongNums.includes(n) && !correctNums.includes(n)) wrongNums.push(n);
                }
                const allNums = shuffle([...correctNums, ...wrongNums]);
                const options = allNums.map((n, i) => ({
                    id: 'opt' + i,
                    label: String(n),
                    correct: targetType === "even" ? n % 2 === 0 : n % 2 !== 0
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the ${targetType.toUpperCase()} numbers.`;
                q.ans = ans;
                // Paper says what a pencil does, and the key names both groups (see
                // ODD_EVEN_SORT_PRINT / oddEvenSortKey at the top of this file). q.ans stays the
                // option ids the SCREEN widget checks.
                q.printText = ODD_EVEN_SORT_PRINT;
                q.printAnswer = oddEvenSortKey(allNums);
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = targetType === "even"
                    ? "Even numbers end in 0, 2, 4, 6, or 8."
                    : "Odd numbers end in 1, 3, 5, 7, or 9.";
                q.printFormat = 'multi-select';
                q.skillLabel = 'Select Even/Odd';
                // Paper (2026-09-26): the kit `parity` cell, the numbers in two rows; the key rings
                // the even ones and crosses out the odd ones. The screen keeps its multi-select widget.
                q._variant = 'sort';
                q.cell = { template: 'parity', v: 1, payload: { task: 'sort', nums: allNums } };
                return;
            }

            if (patternSkill === "odd_even") {
                // Grade 2 (2.OA.C.3): odd or even - three problem types, drawn by the kit `parity`
                // cell on paper and on screen (2026-09-26). The old cells were colour tiles with
                // translucent white borders and printed on the legacy path, whose answer key did not
                // match the pupil page (ws-print-lint INK-2, AK-4).
                const maxNum = Math.max(10, Math.min(range, 100));
                q.skillLabel = 'Odd/Even';
                q.printFormat = 'odd-even';

                const oeRoll = Math.random();
                let oeType;
                if (oeRoll < 0.40) oeType = 'single';      // Type 1: Is N odd or even? (40%)
                else if (oeRoll < 0.70) oeType = 'select';  // Type 2: circle even / cross out odd (30%)
                else oeType = 'which';                       // Type 3: Which of 3 is odd/even? (30%)

                if (oeType === 'single') {
                    // Type 1, the CONCRETE type: the number and the number drawn as dots in pairs.
                    // Bounded at 20 (review, 2026-09-20) so the picture is the whole number (ten
                    // pairs and a leftover at most); larger numbers are the 'which' type's.
                    // Nothing in the cell names the verdict (the old caption "One circle has no
                    // partner!" answered the question).
                    const num = rng(1, Math.min(maxNum, 20));
                    const isEven = num % 2 === 0;
                    q.text = `Is ${num} odd or even?`;
                    q.ans = isEven ? "Even" : "Odd";
                    q.printAnswer = q.ans;
                    q.acceptedAnswers = [q.ans, q.ans.toLowerCase()];
                    q.printText = 'Odd or even? Check one box.';
                    q.answerType = "text";
                    q.selfAnswering = true;
                    q.options = [];
                    q.hint = `Make pairs. If every dot has a partner, the number is even. If one is left over, it is odd.`;
                    q._variant = 'pairs';
                    q.cell = { template: 'parity', v: 1, payload: { task: 'pairs', n: num, correct: isEven ? 1 : 0 } };
                    q.visual = k2Twin('parity', q.cell.payload);

                } else if (oeType === 'select') {
                    // Type 2: a set of five numbers. Paper: circle the even ones, cross out the odd
                    // ones (the key marks both). Screen: the multi-select widget (as select_even_odd),
                    // "Click all the EVEN numbers."
                    const targetType = pick(["odd", "even"]);
                    const targetCount = rng(2, 4); // 2-4 numbers match
                    const nonTargetCount = 5 - targetCount;
                    const targetNums = [];
                    const nonTargetNums = [];
                    while (targetNums.length < targetCount) {
                        const n = rng(1, maxNum);
                        const fits = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                        if (fits && !targetNums.includes(n)) targetNums.push(n);
                    }
                    while (nonTargetNums.length < nonTargetCount) {
                        const n = rng(1, maxNum);
                        const fits = targetType === "even" ? n % 2 !== 0 : n % 2 === 0;
                        if (fits && !nonTargetNums.includes(n) && !targetNums.includes(n)) nonTargetNums.push(n);
                    }
                    const allNums = shuffle([...targetNums, ...nonTargetNums]);
                    const options = allNums.map((n, i) => ({
                        id: 'opt' + i,
                        label: String(n),
                        correct: targetType === "even" ? n % 2 === 0 : n % 2 !== 0
                    }));
                    q.text = `Click all the ${targetType.toUpperCase()} numbers.`;
                    q.ans = options.filter(o => o.correct).map(o => o.id);
                    q.options = options;
                    q.answerType = 'multi-select-check';
                    // Paper says what a pencil does, and the key names both groups (BD-14).
                    q.printText = ODD_EVEN_SORT_PRINT;
                    q.printAnswer = oddEvenSortKey(allNums);
                    q.printFormat = 'multi-select';
                    q.hint = `${targetType === "even" ? "Even" : "Odd"} numbers ${targetType === "even" ? "end in 0, 2, 4, 6 or 8" : "end in 1, 3, 5, 7 or 9"}.`;
                    q._variant = 'sort';
                    // print only: the screen draws the multi-select widget from q.options
                    q.cell = { template: 'parity', v: 1, payload: { task: 'sort', nums: allNums, caption: true } };

                } else {
                    // Type 3: Which of these 3 numbers is odd/even? (abstract: up to Max Number)
                    const targetType = pick(["odd", "even"]);
                    let target;
                    do { target = rng(1, maxNum); } while ((targetType === "even") !== (target % 2 === 0));
                    const others = [];
                    while (others.length < 2) {
                        const n = rng(1, maxNum);
                        const isTarget = targetType === "even" ? n % 2 === 0 : n % 2 !== 0;
                        if (!isTarget && n !== target && !others.includes(n)) others.push(n);
                    }
                    const choices = shuffle([target, ...others]);
                    q.text = `Which number is ${targetType}?`;
                    q.ans = String(target);
                    q.printAnswer = String(target);
                    q.acceptedAnswers = [String(target)];
                    q.printText = 'Read the question. Check one box.';
                    q.answerType = "text";
                    q.selfAnswering = true;
                    q.options = [];
                    q.hint = `${targetType === "even" ? "Even" : "Odd"} numbers end in ${targetType === "even" ? "0, 2, 4, 6, or 8" : "1, 3, 5, 7, or 9"}.`;
                    q._variant = 'which';
                    q.cell = { template: 'parity', v: 1, payload: { task: 'which', nums: choices, target: targetType, correct: choices.indexOf(target) } };
                    q.visual = k2Twin('parity', q.cell.payload);
                }
                return;
            } else if (patternSkill === "pattern_relationship") {
                // Grade 5: Two patterns, find the relationship
                const multipliers = [2, 3, 4, 5, 6, 10];
                const addends = [3, 5, 7, 10, 12, 15, 20];
                const relType = pick(["multiply", "add"]);
                let factor, seqA, seqB, correctAnswer, wrongAnswers;

                if (relType === "multiply") {
                    factor = pick(multipliers);
                    const startA = rng(0, 4);
                    seqA = Array.from({length: 5}, (_, i) => startA + i);
                    seqB = seqA.map(x => x * factor);
                    correctAnswer = `Multiply by ${factor}`;
                    wrongAnswers = [
                        `Add ${factor}`,
                        `Multiply by ${factor + 1}`,
                        `Multiply by ${Math.max(2, factor - 1)}`
                    ];
                } else {
                    factor = pick(addends);
                    const startA = rng(1, Math.min(10, Math.max(1, Math.floor(range / 10))));
                    seqA = Array.from({length: 5}, (_, i) => startA + i * rng(1, 3));
                    // Ensure ascending with consistent step for sequence A
                    const stepA = rng(1, 3);
                    seqA = Array.from({length: 5}, (_, i) => startA + i * stepA);
                    seqB = seqA.map(x => x + factor);
                    correctAnswer = `Add ${factor}`;
                    wrongAnswers = [
                        `Multiply by ${factor}`,
                        `Add ${factor + 1}`,
                        `Add ${Math.max(1, factor - 1)}`
                    ];
                }

                q.text = `Look at the two patterns. How do you get from Pattern A to Pattern B?`;
                q.ans = correctAnswer;
                q.answerType = "multiple-choice";
                q.options = shuffle([correctAnswer, ...wrongAnswers]);
                q.hint = `Compare each pair: ${seqA[0]} becomes ${seqB[0]}, ${seqA[1]} becomes ${seqB[1]}. What operation turns A into B?`;
                q.skillLabel = 'Pattern Relationship';

                // Two-column table visual
                const tableRows = seqA.map((a, i) => `<tr>
                    <td style="padding:8px 16px;border:2px solid var(--text-dim);text-align:center;font-weight:700;color:var(--accent-cyan);">${a}</td>
                    <td style="padding:8px 16px;border:2px solid var(--text-dim);text-align:center;font-weight:700;color:var(--accent-green);">${seqB[i]}</td>
                </tr>`).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Find the Relationship</div>
                    <table style="margin:0 auto;border-collapse:collapse;font-size:1.05rem;border:2px solid var(--text-dim);">
                        <tr>
                            <th style="padding:10px 20px;border:2px solid var(--text-dim);background:var(--accent-cyan);color:white;font-weight:800;">Pattern A</th>
                            <th style="padding:10px 20px;border:2px solid var(--text-dim);background:var(--accent-green);color:white;font-weight:800;">Pattern B</th>
                        </tr>
                        ${tableRows}
                    </table>
                    <div style="margin-top:12px;font-size:0.9rem;color:var(--text-dim);">A <span style="color:var(--accent-orange);font-weight:700;">?</span> = B</div>
                </div>`;
                return;
            } else if (patternSkill === "seq_2") patternQ(2);
            else if (patternSkill === "seq_5") patternQ(5);
            else if (patternSkill === "seq_10") patternQ(10);
            else if (patternSkill === "seq_100") patternQ(100);
            else if (patternSkill === "count_by_fill") {
                // Count-By Fill-In (1-12): Partially filled skip counting sequences
                const countBy = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                const sequenceLength = 12;
                const allNumbers = Array.from({length: sequenceLength}, (_, i) => countBy * (i + 1));

                // Determine how many to show (4-6 shown, rest hidden)
                const showCount = pick([4, 5, 6]);
                const showIndices = new Set();

                // Always show first one or two for context
                showIndices.add(0);
                if (Math.random() > 0.3) showIndices.add(1);

                // Add more random shown indices
                while (showIndices.size < showCount) {
                    showIndices.add(Math.floor(Math.random() * sequenceLength));
                }

                const sequence = allNumbers.map((val, i) => ({
                    value: val,
                    shown: showIndices.has(i),
                    position: i + 1
                }));

                const missingValues = sequence.filter(s => !s.shown).map(s => s.value);

                q.text = `Complete the count-by-${countBy}s sequence`;
                q.ans = missingValues.join(", ");
                q.answerType = "text";
                q.hint = `Skip count by ${countBy}: ${countBy}, ${countBy*2}, ${countBy*3}...`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd22 Count by ${countBy}s</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Fill in the missing numbers in the sequence</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px auto;max-width:500px;">
                        ${sequence.map(s => s.shown
                            ? `<span style="padding:12px 16px;background:var(--accent-cyan);color:white;border-radius:8px;font-weight:700;font-size:1.1rem;min-width:45px;">${s.value}</span>`
                            : `<span style="padding:12px 16px;border:2px dashed var(--accent-orange);border-radius:8px;font-weight:600;min-width:45px;color:var(--accent-orange);">?</span>`
                        ).join('')}
                    </div>
                    <div style="margin-top:15px;font-size:0.85rem;color:var(--text-dim);">
                        Pattern: +${countBy} each time
                    </div>
                </div>`;

                q.patternData = { countBy, sequence, missingValues, type: 'count_by_fill' };
                q.printFormat = "pattern-count-by-fill";
            }
            else if (patternSkill === "identify_rule") {
                // Dedicated "Identify the Rule" skill - always asks for rule identification
                const stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const absStep = pick(stepOptions);
                const isAdd = Math.random() > 0.4; // 60% add, 40% subtract
                const step = isAdd ? absStep : -absStep;

                // For subtraction, start higher to avoid negative numbers
                const ruleStart = isAdd ? rng(1, Math.min(range, 50)) : rng(absStep * 4, range);
                const seq = [ruleStart, ruleStart + step, ruleStart + step * 2, ruleStart + step * 3];

                const ruleText = isAdd ? `Add ${absStep}` : `Subtract ${absStep}`;

                q.text = `What is the rule? ${seq.map(n => n.toLocaleString()).join(", ")}`;
                q.answerType = "text";
                q.ans = ruleText;
                q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                // Generate wrong answers
                const wrongRules = [];
                // Wrong operation
                wrongRules.push(isAdd ? `Subtract ${absStep}` : `Add ${absStep}`);
                // Wrong step amounts
                wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 1}`);
                if (absStep > 1) {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep - 1}`);
                } else {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 2}`);
                }

                q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                    <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;white-space:nowrap;max-width:100%;">
                        <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[0].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[1].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[2].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${seq[3].toLocaleString()}</span>
                    </div>
                    <div style="margin-top:15px;font-size:0.95rem;color:var(--text-secondary);">Is the pattern <strong style="color:var(--accent-green);">Add</strong> or <strong style="color:var(--accent-pink);">Subtract</strong>? By how much?</div>
                </div>`;
            } else if (patternSkill === "plus_minus_10") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 10: ${start.toLocaleString()} \u2192 ?`;
                q.ans = start + (plus ? 10 : -10);
                q.hint = `Jump ${plus ? "forward" : "back"} 10 on the number line.`;
                const minVal = Math.min(start, q.ans) - 5;
                const maxVal = Math.max(start, q.ans) + 5;
                q.visual = `<div style="text-align:center;"><div style="font-weight:700;margin-bottom:30px;">${plus ? "Jump forward" : "Jump back"} 10</div>${createNumberLine(Math.max(0, minVal), maxVal, start, q.ans)}</div>`;
            } else if (patternSkill === "plus_minus_100") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 100: ${start.toLocaleString()} \u2192 ?`;
                q.ans = start + (plus ? 100 : -100);
                q.hint = `Jump ${plus ? "forward" : "back"} 100. The hundreds digit changes!`;
                q.visual = `<div style="font-weight:700;font-size:1.3rem;">${start.toLocaleString()} <span style="color:var(--accent-orange);">${plus ? "+" : "\u2212"} 100</span> = <span style="color:var(--accent-green);">?</span></div>`;
            } else if (patternSkill === "next_three") {
                // Next 3 Numbers - give pattern, ask for next 3 OR identify the rule
                const baseStep = pick([2, 3, 4, 5, 10, 11, 12, 25, 50]);
                const isSubtract = Math.random() < 0.4; // 40% chance of subtraction pattern
                const step = isSubtract ? -baseStep : baseStep;

                // For subtraction, start higher to avoid negative numbers
                const minStart = isSubtract ? baseStep * 6 : 1;
                const maxStart = Math.min(range, isSubtract ? range : 100);
                const patternStart = rng(minStart, maxStart);

                const showSeq = [patternStart, patternStart + step, patternStart + step * 2];
                const nextThree = [patternStart + step * 3, patternStart + step * 4, patternStart + step * 5];

                // Only ask for rule identification when in mixed mode (40% chance)
                const askForRule = mappedSkill === "mixed" && Math.random() < 0.4;

                if (askForRule) {
                    // Rule identification variant
                    const absStep = Math.abs(step);
                    const ruleText = step > 0 ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${showSeq.map(n => n.toLocaleString()).join(", ")}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    wrongRules.push(step > 0 ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">\ud83d\udd0d Find the Rule</div>
                        <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;white-space:nowrap;max-width:100%;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${n.toLocaleString()}</span>`).join('<span style="background:var(--accent-orange);color:white;padding:8px 14px;border-radius:8px;font-size:1.1rem;">?</span>')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Original: ask for next 3 numbers
                    q.text = `What are the next 3 numbers? ${showSeq.map(n => n.toLocaleString()).join(", ")}, ___, ___, ___`;
                    q.answerType = "text";
                    q.ans = nextThree.map(n => n.toLocaleString()).join(", ");
                    q.hint = `Find the pattern: each number ${step > 0 ? 'increases' : 'decreases'} by ${Math.abs(step)}. ${step > 0 ? 'Add' : 'Subtract'} ${Math.abs(step)} three more times!`;

                    // Wrong answers with different patterns
                    const wrongs = new Set();
                    let patternAttempts = 0;
                    while (wrongs.size < 3 && patternAttempts < 30) {
                        patternAttempts++;
                        const wrongStep = step + pick([-2, -1, 1, 2, 3]);
                        if (wrongStep !== step && wrongStep !== 0) {
                            const wrongAns = [patternStart + wrongStep * 3, patternStart + wrongStep * 4, patternStart + wrongStep * 5];
                            if (wrongAns.every(n => n >= 0)) { // Avoid negative numbers
                                wrongs.add(wrongAns.map(n => n.toLocaleString()).join(", "));
                            }
                        }
                    }
                    q.options = shuffle([q.ans, ...wrongs]);

                    const arrow = step > 0 ? `+${Math.abs(step)}` : `\u2212${Math.abs(step)}`;
                    const blankBox = `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:12px 20px;border-radius:10px;min-width:50px;text-align:center;font-size:1.3rem;">___</span>`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Find the pattern:</div>
                        <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;white-space:nowrap;max-width:100%;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:12px 20px;border-radius:10px;font-size:1.3rem;">${n.toLocaleString()}</span>`).join('<span style="color:var(--text-dim);">,</span>')}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                        </div>
                        <div style="margin-top:12px;font-size:0.9rem;color:var(--accent-orange);">${arrow} each time</div>
                    </div>`;
                }
            } else if (patternSkill === "function_table_easy" || patternSkill === "function_table_hard") {
                // Function tables: one kit cell (gen-function-table.js). Reached only through a
                // path that skipped the early return above; kept so the chain stays whole.
                generateFunctionTable(q, patternSkill);
            } else if (patternSkill === "double" || patternSkill === "halve") {
                // Doubling and Halving skills (moved from separate category)
                const maxForDouble = range;
                const maxForHalve = Math.floor(range / 2);

                // Bar graph for doubling
                const createDoubleBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Double = Add another equal bar</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-purple));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Original</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:20px;">\u2192</div>
                            <div style="text-align:center;">
                                <div style="display:flex;flex-direction:column;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;border-bottom:2px dashed white;">${base.toLocaleString()}</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-green));width:60px;height:80px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Doubled = ?</div>
                            </div>
                        </div>
                    </div>`;
                };

                // Bar graph for halving
                const createHalveBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Half = Split the bar into 2 equal parts</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-purple),var(--accent-cyan));width:60px;height:160px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Whole</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:60px;">\u2192</div>
                            <div style="text-align:center;">
                                <div style="display:flex;gap:8px;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Two halves</div>
                            </div>
                        </div>
                    </div>`;
                };

                if (patternSkill === "double") {
                    const base = rng(2, maxForDouble);
                    q.text = `Double ${base.toLocaleString()}`;
                    q.ans = base * 2;
                    q.hint = `Double means \u00d72. Think: ${base.toLocaleString()} + ${base.toLocaleString()} = ?`;
                    q.visual = createDoubleBarGraph(base);
                } else {
                    // If decimals are enabled, allow odd numbers (result will be .5)
                    const allowOdd = state.decimalPlaces > 0;
                    let base;
                    if (allowOdd) {
                        base = rng(2, range);
                    } else {
                        const half = rng(1, maxForHalve);
                        base = half * 2;
                    }
                    const halfResult = base / 2;
                    q.text = `Half of ${base.toLocaleString()}`;
                    q.ans = allowOdd ? halfResult : Math.floor(halfResult);
                    q.hint = `Half means \u00f72. Split ${base.toLocaleString()} into 2 equal parts.`;
                    q.visual = createHalveBarGraph(base);
                }
            } else if (patternSkill === "skip_count_line") {
                // Skip Counting on a Number Line - 3-4 missing numbers
                let skipOptions = [2, 3, 4, 5, 6, 10];
                if (range >= 100) skipOptions.push(25);
                if (range >= 500) skipOptions.push(50);
                if (range >= 1000) skipOptions.push(100);
                const skipBy = pick(skipOptions);
                const maxStartMult = Math.max(1, Math.min(Math.floor(range / skipBy / 8), 20));
                const startVal = rng(0, maxStartMult) * skipBy;
                const numMarks = 8;
                const values = Array.from({length: numMarks}, (_, i) => startVal + skipBy * i);

                const numMissing = rng(3, 4);
                const candidateIndices = [];
                for (let i = 1; i <= numMarks - 2; i++) candidateIndices.push(i);
                shuffle(candidateIndices);
                const missingIndices = candidateIndices.slice(0, numMissing).sort((a, b) => a - b);
                const missingValues = missingIndices.map(i => values[i]);
                const answerStr = missingValues.join(", ");

                q.text = `Fill in the missing numbers. Skip count by ${skipBy}s.`;
                q.ans = answerStr;
                q.hint = `Each mark increases by ${skipBy}. Fill in all ${numMissing} blanks separated by commas.`;
                q.skillLabel = 'Skip Count';
                q.printFormat = 'skip-count-line';
                q.answerType = "text";
                q.options = [];

                const svgW = 420;
                const svgH = 80;
                const leftPad = 30;
                const rightPad = 30;
                const lineY = 40;
                const spacing = (svgW - leftPad - rightPad) / (numMarks - 1);
                const missingSet = new Set(missingIndices);

                let ticksSVG = '';
                for (let i = 0; i < numMarks; i++) {
                    const x = leftPad + i * spacing;
                    const isMissing = missingSet.has(i);
                    ticksSVG += `<line x1="${x}" y1="${lineY - 10}" x2="${x}" y2="${lineY + 10}" stroke="currentColor" stroke-width="${STROKE.normal}"/>`;
                    if (isMissing) {
                        ticksSVG += `<circle cx="${x}" cy="${lineY}" r="14" fill="${COLORS.fill[2]}" opacity="0.3"/>`;
                        ticksSVG += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" font-family='${FONTS.sans}' fill="${COLORS.fill[2]}" font-size="18" font-weight="bold">?</text>`;
                    } else {
                        ticksSVG += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" font-family='${FONTS.sans}' fill="currentColor" font-size="15" font-weight="bold">${values[i].toLocaleString()}</text>`;
                    }
                }
                let arrowsSVG = '';
                for (let i = 0; i < numMarks - 1; i++) {
                    const x1 = leftPad + i * spacing + 8;
                    const x2 = leftPad + (i + 1) * spacing - 8;
                    arrowsSVG += `<line x1="${x1}" y1="${lineY - 18}" x2="${x2}" y2="${lineY - 18}" stroke="${COLORS.primary}" stroke-width="${STROKE.normal}" marker-end="url(#skipArrow)"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.2rem;">Skip Count by ${skipBy}s</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:600px;height:auto;">
                        <defs>
                            <marker id="skipArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M 0 0 L 6 3 L 0 6" fill="none" stroke="${COLORS.primary}" stroke-width="1"/>
                            </marker>
                        </defs>
                        <line x1="${leftPad}" y1="${lineY}" x2="${svgW - rightPad}" y2="${lineY}" stroke="currentColor" stroke-width="${STROKE.normal}"/>
                        ${arrowsSVG}
                        ${ticksSVG}
                    </svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">+${skipBy} each step | Type all ${numMissing} missing numbers separated by commas</div>
                </div>`;
            } else if (patternSkill === "skip_count_grid") {
                // Skip Counting Grid - emits grid-fill answerType with 1-7 blanks.
                // Widget consumes q.gridFill.cells[i] = {row, col, value, blank}.
                const multiplier = rng(1, 12);
                const gridRows = 2;
                const gridCols = 6;
                const gridSize = gridRows * gridCols; // 12 cells
                const allMultiples = Array.from({length: gridSize}, (_, i) => multiplier * (i + 1));

                // Pick blank count: weight toward 3-5 for solvability.
                // Distribution: 1:8%, 2:12%, 3:20%, 4:20%, 5:20%, 6:12%, 7:8%
                const blankWeights = [0, 8, 12, 20, 20, 20, 12, 8];
                const totalWeight = blankWeights.reduce((a, b) => a + b, 0);
                let roll = rng(1, totalWeight);
                let numBlanks = 1;
                for (let n = 1; n <= 7; n++) {
                    roll -= blankWeights[n];
                    if (roll <= 0) { numBlanks = n; break; }
                }

                // Pick blank positions subject to constraints:
                //  (1) at least 1, never more than 7
                //  (2) don't blank ALL cells of any row or column
                //  (3) don't blank both first AND last cells together
                let blankIndices;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const candidateIdx = Array.from({length: gridSize}, (_, i) => i);
                    shuffle(candidateIdx);
                    const trial = new Set(candidateIdx.slice(0, numBlanks));

                    // Check constraint (3): not both first AND last
                    if (trial.has(0) && trial.has(gridSize - 1)) continue;

                    // Check constraint (2): no fully blank row or column
                    let rowBlankCounts = new Array(gridRows).fill(0);
                    let colBlankCounts = new Array(gridCols).fill(0);
                    trial.forEach(idx => {
                        rowBlankCounts[Math.floor(idx / gridCols)]++;
                        colBlankCounts[idx % gridCols]++;
                    });
                    if (rowBlankCounts.some(c => c === gridCols)) continue;
                    if (colBlankCounts.some(c => c === gridRows)) continue;

                    blankIndices = trial;
                    break;
                }
                // Fallback: just take first cell as the only blank
                if (!blankIndices) {
                    blankIndices = new Set([rng(1, gridSize - 2)]);
                    numBlanks = 1;
                }

                const blankArray = [...blankIndices].sort((a, b) => a - b);
                const blankValues = blankArray.map(i => allMultiples[i]);

                // Build cells array for the grid-fill widget
                const cells = allMultiples.map((val, i) => ({
                    row: Math.floor(i / gridCols),
                    col: i % gridCols,
                    value: val,
                    blank: blankIndices.has(i),
                }));

                q.text = `Fill in all the blank cells. Count by ${multiplier}s.`;
                q.hint = `Count by ${multiplier}s: ${multiplier}, ${multiplier * 2}, ${multiplier * 3}... Fill in each blank cell.`;
                q.skillLabel = 'Skip Count Grid';
                q.answerType = 'grid-fill';
                q.gridFill = {
                    rows: gridRows,
                    cols: gridCols,
                    cells: cells,
                    label: `x ${multiplier} Grid`,
                };
                // Legacy fallback: array of expected blank values (in row-major order)
                q.ans = blankValues;
                q.options = [];
                q.printFormat = 'skip-count-grid';

                // Keep a static visual for any path that hasn't been migrated to
                // the widget yet (worksheet/print modes still consume q.visual).
                const gridCellsHTML = allMultiples.map((val, i) => {
                    const isBlank = blankIndices.has(i);
                    if (isBlank) {
                        return `<div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--bg-card-light);min-height:95px;">
                            <span style="display:inline-block;width:60%;border-bottom:3px solid var(--text-dim);"></span>
                        </div>`;
                    } else {
                        return `<div style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:var(--accent-cyan);color:white;border-radius:10px;font-weight:700;font-size:1.85rem;min-height:95px;">${val}</div>`;
                    }
                });

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.2rem;">x ${multiplier} Grid</div>
                    <div style="display:grid;grid-template-columns:repeat(${gridCols},1fr);gap:10px;max-width:820px;width:100%;margin:0 auto;">
                        ${gridCellsHTML.join('')}
                    </div>
                </div>`;
            } else if (patternSkill === "number_seq_fill") {
                // Number Sequence Fill — ONE ROW OF TEN boxes with 2-4 of them missing.
                //
                // It used to print the whole hundred chart inside a single cell whenever Max
                // Number was 100: a 10x10 grid, 100 boxes, 104-106 words in ONE cell of a page
                // that holds six (WORKSHEET_DESIGN_STANDARD capacity). This is a K-2 counting
                // skill; a pupil who cannot yet read a sentence cannot sweep a hundred numbers
                // hunting seven gaps, and one such cell IS the page. A hundred chart is a
                // whole-page representation and it already has a skill of its own —
                // counting/hundreds_chart_fill (gen-counting.js, printFormat
                // 'hundreds-chart-fill'), which this change does not touch and which is still
                // the place a real hundred chart is drawn.
                //
                // A row of ten is that same chart's own row, so the representation is one the
                // pupil already knows, cut to what a cell can hold: ten boxes, 2-4 blank, so at
                // least six numbers stand as anchors and every gap has a neighbour to count from.
                // Every variant is now the same shape, so the page does not change kind when the
                // teacher changes Max Number — only the step and the numbers change.
                const seqStep = seqStepFor(range);
                let seqStart;
                if (seqStep === 1) {
                    // The highest number the strip may reach. Max Number 10 leaves exactly one
                    // legal strip of ten consecutive numbers, 1-10, and the two draws below both
                    // collapse onto it rather than running past the setting.
                    const cap = Math.max(10, Math.min(range, 100));
                    // Half the strips are a ten-row of the chart (1-10, 41-50); half BRIDGE a ten
                    // (36-45), because crossing the ten is where counting on breaks down and a
                    // chart row never asks for it.
                    seqStart = pick([true, false])
                        ? rng(0, Math.floor(cap / 10) - 1) * 10 + 1
                        : rng(1, Math.max(1, cap - 9));
                } else {
                    // P8 (critic, baseline 2026-09-24): the strip used to start at the step
                    // itself, so every count-by-10 item on a page was the SAME strip, 10-100,
                    // with only the blanks moving (20 near-identical items). The step is still
                    // one per page (BD-10); the START now varies: counting by 10 from any number
                    // 1-10 (7, 17, 27 ... 97 — "ten more" off the decade, 1.NBT.C.5), by 100
                    // from any ten, by 1,000 from any hundred. The strip never passes the
                    // setting's ceiling (step x 10).
                    const unit = seqStep / 10;
                    seqStart = rng(1, 10) * unit;
                }

                const seqRows = 1, seqCols = 10, seqTotal = 10;
                const seqValues = Array.from({length: seqTotal}, (_, i) => seqStart + i * seqStep);
                const seqLast = seqValues[seqTotal - 1];
                // A label, not a second instruction: BD-10 keeps the instruction above the cells
                // and out of them, so this names the strip rather than telling the pupil to count.
                const seqLabel = seqStep === 1
                    ? `Numbers ${seqStart}-${seqLast}`
                    : `${seqStep}s: ${seqStart.toLocaleString()}-${seqLast.toLocaleString()}`;
                const seqBlanks = rng(2, 4);

                // Blank positions: never both ends (the strip would have no anchor at either
                // side), and never three in a row (a pupil counting on from an anchor two boxes
                // away is doing the skill; four boxes away is guessing).
                let seqBlankSet;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const idxs = Array.from({length: seqTotal}, (_, i) => i);
                    shuffle(idxs);
                    const trial = new Set(idxs.slice(0, seqBlanks));
                    if (trial.has(0) && trial.has(seqTotal - 1)) continue;
                    let run = 0, tooLong = false;
                    for (let i = 0; i < seqTotal; i++) {
                        run = trial.has(i) ? run + 1 : 0;
                        if (run >= 3) { tooLong = true; break; }
                    }
                    if (tooLong) continue;
                    seqBlankSet = trial;
                    break;
                }
                if (!seqBlankSet) seqBlankSet = new Set([rng(1, seqTotal - 2)]);

                const seqCells = seqValues.map((v, i) => ({
                    row: 0,
                    col: i,
                    value: v,
                    blank: seqBlankSet.has(i),
                }));
                const seqBlankValues = seqCells.filter(c => c.blank).map(c => c.value);

                // The instruction library's `skip-count` string, word for word: "Count by {n}.
                // Write the missing numbers." (PEDAGOGY_STANDARD.md 10.1). Both verbs are print
                // verbs and both sentences survive on paper, so this cell needs no printText.
                q.text = `Count by ${seqStep.toLocaleString()}. Write the missing numbers.`;
                q.hint = seqStep === 1
                    ? `Each number is 1 more than the one before it.`
                    : `Each number is ${seqStep.toLocaleString()} more than the one before it.`;
                q.skillLabel = 'Number Sequence';
                q.answerType = 'grid-fill';
                q.gridFill = {
                    rows: seqRows,
                    cols: seqCols,
                    cells: seqCells,
                    label: seqLabel,
                };
                q.ans = seqBlankValues;
                // The missing numbers in the order they are printed, left to right, so the key
                // can be marked against the strip. q.ans is the same list, but the key must not
                // depend on how a downstream joiner happens to render an array.
                q.printAnswer = seqBlankValues.join(', ');
                q.options = [];
                q.printFormat = 'grid-fill';
            } else if (patternSkill === "count_by_step_up") {
                // Count by Step (Up) — start at K, add S each cell.
                const stepPool = [2, 3, 4, 5, 10, 25, 50, 100];
                const cellCount = pick([6, 7, 8, 10, 12]);
                const cuRows = cellCount > 6 ? 2 : 1;
                const cuCols = cuRows === 2 ? Math.ceil(cellCount / 2) : cellCount;
                const cuTotal = cuRows * cuCols;

                // Cap step so end value stays reasonable for the chosen range.
                const maxEnd = Math.max(50, range * 2);
                const validSteps = stepPool.filter(s => s * (cuTotal - 1) < maxEnd * 0.8);
                const cuStep = pick(validSteps.length ? validSteps : [2, 5, 10]);
                // Start: any number; half the time use a multiple of step for cleaner sequences.
                const useMultipleOfStep = Math.random() < 0.5;
                const startMaxRaw = Math.max(1, Math.floor(maxEnd - cuStep * (cuTotal - 1)));
                const startMax = Math.max(1, Math.min(startMaxRaw, range));
                let cuStart;
                if (useMultipleOfStep) {
                    const startMaxMult = Math.max(1, Math.floor(startMax / cuStep));
                    cuStart = rng(1, startMaxMult) * cuStep;
                } else {
                    cuStart = rng(1, startMax);
                }
                const cuValues = Array.from({length: cuTotal}, (_, i) => cuStart + cuStep * i);

                const cuBlanks = rng(1, Math.min(7, cuTotal - 1));
                let cuBlankSet;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const idxs = Array.from({length: cuTotal}, (_, i) => i);
                    shuffle(idxs);
                    const trial = new Set(idxs.slice(0, cuBlanks));
                    if (trial.has(0) && trial.has(cuTotal - 1)) continue;
                    if (cuRows === 2) {
                        const rowCnt = new Array(cuRows).fill(0);
                        const colCnt = new Array(cuCols).fill(0);
                        trial.forEach(i => {
                            rowCnt[Math.floor(i / cuCols)]++;
                            colCnt[i % cuCols]++;
                        });
                        if (rowCnt.some(c => c === cuCols)) continue;
                        if (colCnt.some(c => c === cuRows)) continue;
                    }
                    cuBlankSet = trial;
                    break;
                }
                if (!cuBlankSet) cuBlankSet = new Set([rng(1, cuTotal - 2)]);

                const cuCells = cuValues.map((v, i) => ({
                    row: Math.floor(i / cuCols),
                    col: i % cuCols,
                    value: v,
                    blank: cuBlankSet.has(i),
                }));

                q.text = `Count up by ${cuStep}s. Fill in the missing numbers.`;
                q.hint = `Each cell adds ${cuStep} to the previous one.`;
                q.skillLabel = 'Count Up by ' + cuStep;
                q.answerType = 'grid-fill';
                q.gridFill = {
                    rows: cuRows,
                    cols: cuCols,
                    cells: cuCells,
                    label: `Count up by ${cuStep}s, starting at ${cuStart}`,
                };
                q.ans = cuCells.filter(c => c.blank).map(c => c.value);
                q.options = [];
                q.printFormat = 'grid-fill';
            } else if (patternSkill === "count_by_step_down") {
                // Count by Step (Down) — start at K, subtract S each cell.
                // Keep all cells positive (no negatives).
                const stepPool = [2, 3, 4, 5, 10, 25, 50, 100];
                const cellCount = pick([6, 7, 8, 10, 12]);
                const cdRows = cellCount > 6 ? 2 : 1;
                const cdCols = cdRows === 2 ? Math.ceil(cellCount / 2) : cellCount;
                const cdTotal = cdRows * cdCols;

                const cdMaxEnd = Math.max(50, range * 2);
                const validSteps = stepPool.filter(s => s * (cdTotal - 1) < cdMaxEnd * 0.8);
                const cdStep = pick(validSteps.length ? validSteps : [2, 5, 10]);
                // Start needs to be high enough that final value (start - step*(total-1)) >= 1.
                const cdStartMin = cdStep * (cdTotal - 1) + 1;
                const cdStartMax = Math.max(cdStartMin + 1, cdMaxEnd);
                let cdStart = rng(cdStartMin, cdStartMax);
                // Snap to a multiple of step half the time for cleaner sequences.
                if (Math.random() < 0.5) {
                    cdStart = Math.ceil(cdStart / cdStep) * cdStep;
                }
                const cdValues = Array.from({length: cdTotal}, (_, i) => cdStart - cdStep * i);

                const cdBlanks = rng(1, Math.min(7, cdTotal - 1));
                let cdBlankSet;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const idxs = Array.from({length: cdTotal}, (_, i) => i);
                    shuffle(idxs);
                    const trial = new Set(idxs.slice(0, cdBlanks));
                    if (trial.has(0) && trial.has(cdTotal - 1)) continue;
                    if (cdRows === 2) {
                        const rowCnt = new Array(cdRows).fill(0);
                        const colCnt = new Array(cdCols).fill(0);
                        trial.forEach(i => {
                            rowCnt[Math.floor(i / cdCols)]++;
                            colCnt[i % cdCols]++;
                        });
                        if (rowCnt.some(c => c === cdCols)) continue;
                        if (colCnt.some(c => c === cdRows)) continue;
                    }
                    cdBlankSet = trial;
                    break;
                }
                if (!cdBlankSet) cdBlankSet = new Set([rng(1, cdTotal - 2)]);

                const cdCells = cdValues.map((v, i) => ({
                    row: Math.floor(i / cdCols),
                    col: i % cdCols,
                    value: v,
                    blank: cdBlankSet.has(i),
                }));

                q.text = `Count down by ${cdStep}s. Fill in the missing numbers.`;
                q.hint = `Each cell subtracts ${cdStep} from the previous one.`;
                q.skillLabel = 'Count Down by ' + cdStep;
                q.answerType = 'grid-fill';
                q.gridFill = {
                    rows: cdRows,
                    cols: cdCols,
                    cells: cdCells,
                    label: `Count down by ${cdStep}s, starting at ${cdStart}`,
                };
                q.ans = cdCells.filter(c => c.blank).map(c => c.value);
                q.options = [];
                q.printFormat = 'grid-fill';
            } else if (patternSkill === "count_by_powers_of_10") {
                // Count by Powers of 10 — RECONCEPTUALIZED for readability:
                // numbers like 18,000,000 are too wide for grid-fill tiles, so
                // we render a compact horizontal sequence with arrow separators
                // and per-blank typable inputs (same .np-cell pattern as the
                // number_pattern skill — wireBoxValidation handles per-cell
                // green/red + auto-advance, hides the global Type-answer box).
                const powerPool = [10, 100, 1000, 10000, 100000, 1000000];
                const validPowers = powerPool.filter(p => p * 25 < 100000000);
                const power = pick(validPowers);
                const goDown = Math.random() < 0.5;
                // Cap the visible sequence at 5 terms — wider than that the
                // commas + arrows wrap awkwardly even after compression.
                const pTotal = 5;

                const kMultMin = goDown ? pTotal : 2;
                const kMultMax = Math.max(kMultMin + 1, 20);
                const kMult = rng(kMultMin, kMultMax);
                const pStart = kMult * power;
                const pValues = Array.from({length: pTotal}, (_, i) =>
                    goDown ? pStart - power * i : pStart + power * i
                );

                // 1-2 blanks; never both endpoints (so the rule is visible).
                const pBlanks = rng(1, 2);
                let pBlankSet;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const idxs = Array.from({length: pTotal}, (_, i) => i);
                    shuffle(idxs);
                    const trial = new Set(idxs.slice(0, pBlanks));
                    if (trial.has(0) && trial.has(pTotal - 1)) continue;
                    pBlankSet = trial;
                    break;
                }
                if (!pBlankSet) pBlankSet = new Set([rng(1, pTotal - 2)]);

                const verb = goDown ? 'down' : 'up';
                q.text = `Count ${verb} by ${power.toLocaleString()}s. Fill in the missing numbers.`;
                q.hint = `Each step ${goDown ? 'subtracts' : 'adds'} ${power.toLocaleString()}.`;
                q.skillLabel = `Powers of 10 (${power.toLocaleString()})`;

                const fmt = (n) => n.toLocaleString();
                // Adjust input width to the magnitude — millions need ~13ch
                // (e.g. "18,000,000"), thousands need ~7ch ("18,000").
                const widestStr = pValues.reduce((a, b) => a.length > b.length ? a : b, '0').length || 8;
                const inputCh = Math.max(7, widestStr);
                const blankIdxs = Array.from(pBlankSet).sort((a, b) => a - b);
                let bIdx = 0;
                const cells = pValues.map((v, i) => {
                    if (pBlankSet.has(i)) {
                        const dataI = bIdx++;
                        return `<input type="text" class="np-cell" data-i="${dataI}" data-answer="${v}" maxlength="${inputCh + 2}" inputmode="numeric" style="display:inline-flex;width:${inputCh + 1}ch;height:42px;padding:0 6px;border:2px dashed #f59e0b;border-radius:8px;background:#fff8e1;font-weight:700;color:#0288d1;font-size:1.05rem;text-align:center;font-variant-numeric:tabular-nums;" placeholder="?" autocomplete="off">`;
                    }
                    return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:${inputCh + 1}ch;height:42px;padding:0 8px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:8px;font-weight:700;font-size:1.05rem;font-variant-numeric:tabular-nums;">${fmt(v)}</span>`;
                }).join('<span style="margin:0 4px;color:var(--accent-orange);font-size:1.2rem;">→</span>');

                q.visual = `<div style="text-align:center;max-width:760px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--accent-cyan);">Count ${verb} by ${power.toLocaleString()}s</div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:14px;">Each step ${goDown ? 'subtracts' : 'adds'} <b>${power.toLocaleString()}</b>.</div>
                    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;">
                        ${cells}
                    </div>
                </div>`;

                q.answerType = 'text';
                q.ans = blankIdxs.map(i => String(pValues[i])).join(',');
                q.options = [];
                q.printFormat = 'number-pattern';
                q.patternData = { type: 'count_by_powers_of_10', power, goDown, values: pValues, blanks: blankIdxs };
                return;
            } else if (patternSkill === "shape_pattern") {
                // Shape Patterns - repeating patterns with 2-3 missing shapes (4.OA.C.5)
                const SHAPES = [
                    // Shape pattern question: each shape needs a distinct color so the
                    // student can tell them apart (color encodes the pattern element).
                    { name: 'circle',   color: COLORS.fill[4], border: COLORS.fill[4], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${COLORS.fill[4]}" stroke="${COLORS.fill[4]}" stroke-width="${STROKE.normal}"/></svg>` },
                    { name: 'square',   color: COLORS.fill[0], border: COLORS.fill[0], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" fill="${COLORS.fill[0]}" stroke="${COLORS.fill[0]}" stroke-width="${STROKE.normal}" rx="2"/></svg>` },
                    { name: 'triangle', color: COLORS.fill[1], border: COLORS.fill[1], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" fill="${COLORS.fill[1]}" stroke="${COLORS.fill[1]}" stroke-width="${STROKE.normal}"/></svg>` },
                    { name: 'star',     color: COLORS.fill[2], border: COLORS.fill[2], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 16.5,14 18.5,22 12,17.5 5.5,22 7.5,14 2,9 9,9" fill="${COLORS.fill[2]}" stroke="${COLORS.fill[2]}" stroke-width="1"/></svg>` },
                    { name: 'diamond',  color: COLORS.fill[3], border: COLORS.fill[3], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" fill="${COLORS.fill[3]}" stroke="${COLORS.fill[3]}" stroke-width="${STROKE.normal}"/></svg>` },
                    { name: 'hexagon',  color: COLORS.fill[5], border: COLORS.fill[5], svg: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="${COLORS.fill[5]}" stroke="${COLORS.fill[5]}" stroke-width="${STROKE.normal}"/></svg>` },
                ];

                // Pick a pattern type and shapes
                const patternTypes = [
                    [0, 1],          // AB
                    [0, 1, 2],       // ABC
                    [0, 1, 1],       // ABB
                    [0, 0, 1, 1],   // AABB
                    [0, 1, 1, 2],   // ABBC
                ];
                const corePattern = pick(patternTypes);
                const numDistinct = Math.max(...corePattern) + 1;

                // Pick distinct shapes for this pattern
                const shuffledShapes = shuffle([...SHAPES]);
                const chosenShapes = shuffledShapes.slice(0, numDistinct);

                // Build the full sequence (2-3 full cycles)
                const numCycles = corePattern.length <= 3 ? 3 : 2;
                const sequence = [];
                for (let c = 0; c < numCycles; c++) {
                    for (let i = 0; i < corePattern.length; i++) {
                        sequence.push(chosenShapes[corePattern[i]]);
                    }
                }
                // Add partial cycle to reach 8-10 elements
                const targetLen = Math.max(8, Math.min(10, sequence.length));
                while (sequence.length > targetLen) sequence.pop();
                while (sequence.length < targetLen) {
                    sequence.push(chosenShapes[corePattern[sequence.length % corePattern.length]]);
                }

                // Pick 2-3 blank positions (not the first 3)
                const numBlanks = rng(2, 3);
                const candidateIdx = [];
                for (let i = 3; i < sequence.length; i++) candidateIdx.push(i);
                shuffle(candidateIdx);
                const blankPositions = candidateIdx.slice(0, numBlanks).sort((a, b) => a - b);

                const missingNames = blankPositions.map(i => sequence[i].name);
                q.ans = missingNames.join(", ");
                q.answerType = "text";
                q.text = `Look at the pattern. Fill in the missing shapes.`;
                q.hint = `Find the repeating group of shapes, then figure out which shape goes in each blank.`;
                q.skillLabel = 'Shape Pattern';
                q.printFormat = 'shape-pattern';

                // Build visual
                const shapeSize = 36;
                const cells = sequence.map((shape, i) => {
                    if (blankPositions.includes(i)) {
                        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${shapeSize + 8}px;height:${shapeSize + 8}px;border:2px dashed #f59e0b;border-radius:8px;background:#fff8e1;font-weight:700;color:#f59e0b;font-size:1.2rem;">?</span>`;
                    }
                    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${shapeSize + 8}px;height:${shapeSize + 8}px;">${shape.svg(shapeSize)}</span>`;
                }).join('');

                // Build legend
                const legend = chosenShapes.map(s =>
                    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;">${s.svg(18)} ${s.name}</span>`
                ).join('&nbsp;&nbsp;');

                q.visual = `<div style="text-align:center;max-width:520px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:10px;color:var(--accent-purple);">Shape Pattern</div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:12px;text-align:left;">
                        Find the repeating group, then fill in the <b>missing shapes</b>.
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px;">
                        ${cells}
                    </div>
                    <div style="background:var(--bg-card);padding:8px 12px;border-radius:8px;margin-bottom:10px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:4px;">Shape names:</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${legend}</div>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-dim);">Type missing shapes separated by commas (e.g. circle, star)</div>
                </div>`;

                q.patternData = {
                    type: 'shape_pattern',
                    sequence: sequence.map(s => s.name),
                    blankPositions,
                    missingNames,
                    corePattern: corePattern.map(i => chosenShapes[i].name),
                    shapes: chosenShapes.map(s => ({ name: s.name, color: s.color }))
                };
                return;

            } else if (patternSkill === "number_pattern") {
                // Number Patterns - arithmetic sequences with 2-3 missing numbers (4.OA.C.5)
                let stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                if (range >= 100) stepOptions.push(15, 20, 25);
                if (range >= 500) stepOptions.push(50);
                if (range >= 1000) stepOptions.push(100);

                const step = pick(stepOptions);
                const maxStart = Math.max(1, Math.min(range - step * 8, Math.floor(range / 2)));
                const startVal = rng(1, maxStart);
                const numTerms = rng(7, 8);
                const terms = Array.from({ length: numTerms }, (_, i) => startVal + step * i);

                // Pick 2-3 blank positions (not the first 2)
                const numBlanks = rng(2, 3);
                const candidateIdx = [];
                for (let i = 2; i < numTerms; i++) candidateIdx.push(i);
                shuffle(candidateIdx);
                const blankPositions = candidateIdx.slice(0, numBlanks).sort((a, b) => a - b);

                const missingValues = blankPositions.map(i => terms[i]);
                q.ans = missingValues.join(", ");
                q.answerType = "text";
                q.text = `Find the pattern. Fill in the missing numbers.`;
                q.hint = `Look at the difference between numbers that are next to each other. The pattern adds ${step} each time.`;
                q.skillLabel = 'Number Pattern';
                q.printFormat = 'number-pattern';

                // Build visual — blanks are typable inputs that turn green per
                // cell when correct (wired by wireBoxValidation via .np-cell).
                const cells = terms.map((val, i) => {
                    if (blankPositions.includes(i)) {
                        return `<input type="text" class="np-cell" data-i="${i}" data-answer="${val}" maxlength="6" inputmode="numeric" autocomplete="off" aria-label="missing number" style="display:inline-flex;width:54px;height:42px;padding:0 8px;border:2px dashed #f59e0b;border-radius:8px;background:#fff8e1;font-weight:700;color:#0288d1;font-size:1.1rem;text-align:center;box-sizing:border-box;">`;
                    }
                    return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 8px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:8px;font-weight:700;font-size:1.05rem;">${val}</span>`;
                }).join('');

                // Show step hint between first two terms
                const stepHint = `<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:8px;">
                    <span style="font-weight:700;">${terms[0]}</span>
                    <span style="color:var(--accent-orange);font-size:1.2rem;">→</span>
                    <span style="font-weight:700;">${terms[1]}</span>
                    <span style="color:var(--text-dim);font-size:0.85rem;margin-left:6px;">(+${step})</span>
                </div>`;

                q.visual = `<div style="text-align:center;max-width:520px;margin:0 auto;">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:10px;color:var(--accent-cyan);">Number Pattern</div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:12px;text-align:left;">
                        Find the <b>rule</b> (what's added each time), then fill in the <b>missing numbers</b>.
                    </div>
                    ${stepHint}
                    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin-bottom:12px;">
                        ${cells}
                    </div>
                </div>`;

                q.patternData = {
                    type: 'number_pattern',
                    terms,
                    step,
                    blankPositions,
                    missingValues,
                    startVal
                };
                return;

            } else {
                // random_step in mixed mode - allow rule identification questions
                const step = rng(1, 12) * (Math.random() > 0.5 ? 1 : -1);
                patternQ(step, mappedSkill === "mixed");
            }
            // Distractor options exist for items whose answer is ONE number. Every grid skill in
            // this chain (number_seq_fill, count_by_step_up, count_by_step_down) answers with an
            // ARRAY of missing numbers and falls through to here, and buildNumericOptions then
            // did arithmetic on the array: [30,50,80] + 1 is the string "30,50,801", so the
            // options read "30,50,801", "40,60,70,90,1001". grid-fill never renders options, so
            // nobody has seen it, but it is nonsense the moment anything reads them — an answer
            // key, an export, a quiz. A non-numeric answer gets no distractors.
            q.options = q.options.length
                ? q.options
                : (Number.isFinite(q.ans) ? buildNumericOptions(q.ans) : []);
            return;
}

export function generateRoundingQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // P9 (design/research/place-value-rounding.md): nearest_*, rounding_visual and the eight
            // round_sort_* ids are generated by gen-pv.js — dealt types, a binding band, no answer
            // in the item. The old random-gated branches (three visual styles, a 30% "Click ALL"
            // and a 30% "Drag the marker" on every page) are gone. A mixed pick resolves first so
            // it reaches the same generator.
            const roundingSkill = mappedSkill === "mixed" ? pick(["nearest_10", "nearest_100", "nearest_1000", "nearest_10000", "nearest_100000", "nearest_million", "nearest_tenth", "nearest_hundredth", "nearest_thousandth"])
                : mappedSkill === "mixed_whole" ? pick(["nearest_10", "nearest_100", "nearest_1000", "nearest_10000", "nearest_100000", "nearest_million", "rounding_table"])
                : mappedSkill;
            if (generatePvRounding(q, roundingSkill)) return;

            // For mixed, pick a random rounding skill; mixed_whole only uses whole number rounding
            // Round Decimals skill: round decimals to nearest tenth, hundredth
            if (mappedSkill === "round_decimals") {
                const placeChoice = pick(["tenth", "hundredth"]);
                const targetPlaces = placeChoice === "tenth" ? 1 : 2;
                // Generate a decimal with one more digit than the target
                const extraDigits = targetPlaces + 1;
                const maxWhole = Math.max(1, Math.min(Math.floor(range / 10), 99));
                const wholePart = rng(0, maxWhole);
                const decShift = Math.pow(10, extraDigits);
                // Pedagogical guard: the deciding digit (last decimal) must be non-zero,
                // otherwise the number is already rounded to the target precision.
                // E.g. for "nearest tenth" 5.10 is invalid; 5.14 is valid.
                let decPart = rng(1, decShift - 1);
                let _g = 0;
                while (decPart % 10 === 0 && _g++ < 30) decPart = rng(1, decShift - 1);
                if (decPart % 10 === 0) decPart += rng(1, 9);
                const num = parseFloat((wholePart + decPart / decShift).toFixed(extraDigits));

                const factor = Math.pow(10, targetPlaces);
                const rounded = Math.round(num * factor) / factor;

                // Calculate number line bounds
                const lowerBound = Math.floor(num * factor) / factor;
                const upperBound = parseFloat((lowerBound + 1 / factor).toFixed(targetPlaces));
                const midpoint = parseFloat(((lowerBound + upperBound) / 2).toFixed(extraDigits));
                const pct = Math.min(100, Math.max(0, ((num - lowerBound) / (upperBound - lowerBound)) * 100));

                q.text = `Round ${num} to the nearest ${placeChoice}`;
                q.ans = rounded;
                q.answerType = "number";
                q.hint = `${num} is between ${lowerBound} and ${upperBound}. The midpoint is ${midpoint}. Look at the digit after the ${placeChoice} place: if it's 5 or more, round up!`;
                q.skillLabel = 'Round Decimals';
                q.options = buildNumericOptions(rounded);

                // Number line visual showing the decimal between tick marks
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Round to the nearest ${placeChoice}</div>
                    <div style="position:relative;max-width:400px;margin:0 auto;padding:30px 0 10px;">
                        <div style="position:absolute;left:${pct}%;top:0;transform:translateX(-50%);font-weight:800;font-size:1.1rem;color:var(--accent-orange);">${num}</div>
                        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1rem;margin-bottom:5px;">
                            <span style="color:var(--accent-cyan);">${lowerBound}</span>
                            <span style="color:var(--text-dim);font-size:0.85rem;">${midpoint}</span>
                            <span style="color:var(--accent-cyan);">${upperBound}</span>
                        </div>
                        <div style="height:10px;background:linear-gradient(90deg,var(--accent-cyan),var(--accent-purple),var(--accent-cyan));border-radius:5px;position:relative;">
                            <div style="position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--text-dim);transform:translateX(-50%);"></div>
                            <div style="position:absolute;left:${pct}%;top:-7px;transform:translateX(-50%);">
                                <div style="width:18px;height:18px;background:var(--accent-orange);border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Is ${num} closer to ${lowerBound} or ${upperBound}?</div>
                    </div>
                </div>`;
                return;
            }

            // Rounding Table skill: table with NUMBER | NEAREST 10 | NEAREST 100 | NEAREST 1000
            if (roundingSkill === "rounding_table") {
                // Determine columns based on range. P9 §2.1: Max Number caps the number being
                // rounded and a place needs Numbers to ten times itself (a nearest-100 column
                // needs 3-digit numbers), so a column is only offered when Max Number hosts it.
                const columns = [];
                columns.push({ label: 'Nearest 10', place: 10 });
                if (range >= 1000) columns.push({ label: 'Nearest 100', place: 100 });
                if (range >= 10000) columns.push({ label: 'Nearest 1,000', place: 1000 });

                // Generate 6-8 random numbers, none above Max Number
                const rowCount = rng(6, 8);
                const maxNum = Math.max(columns[columns.length - 1].place + 2, Math.min(range, 9999));
                const minNum = columns[columns.length - 1].place + 1;
                const rows = [];
                const usedNums = new Set();
                // Pedagogical guard: a number is "valid for rounding" only if it is NOT
                // already a multiple of every column's place (otherwise every cell would
                // simply repeat the source number). Smallest place must divide it != 0.
                const smallestPlace = columns[0].place;
                for (let i = 0; i < rowCount; i++) {
                    let num;
                    let _g = 0;
                    do {
                        num = rng(minNum, maxNum);
                        _g++;
                    } while ((usedNums.has(num) || num % smallestPlace === 0) && _g < 50);
                    if (num % smallestPlace === 0) num += rng(1, smallestPlace - 1);
                    usedNums.add(num);
                    const row = { number: num };
                    for (const col of columns) {
                        row[`nearest${col.place}`] = Math.round(num / col.place) * col.place;
                    }
                    rows.push(row);
                }

                // For online play: ask about one cell at a time
                const targetRow = rows[rng(0, rows.length - 1)];
                const targetCol = columns[rng(0, columns.length - 1)];
                const answer = targetRow[`nearest${targetCol.place}`];

                q.text = `Round ${targetRow.number.toLocaleString()} to the ${targetCol.label.toLowerCase()}`;
                q.ans = answer;
                q.hint = `Look at the digit in the ${targetCol.place === 10 ? 'ones' : targetCol.place === 100 ? 'tens' : 'hundreds'} place. If it's 5 or more, round up!`;
                q.answerType = 'number';
                q.skillLabel = 'Rounding Table';
                q.printFormat = 'rounding-table';
                q.options = buildNumericOptions(answer);

                // Store table data for print rendering
                q.roundingTableData = { rows, columns };

                // Build visual table showing full grid with "?" on the target cell
                let tableHTML = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Rounding Table</div>
                    <table style="margin:0 auto;border-collapse:collapse;font-size:0.95rem;">
                        <thead><tr>
                            <th style="border:2px solid var(--border);padding:8px 14px;background:var(--bg-card-light);font-weight:700;">Number</th>`;
                for (const col of columns) {
                    tableHTML += `<th style="border:2px solid var(--border);padding:8px 14px;background:var(--bg-card-light);font-weight:700;">${col.label}</th>`;
                }
                tableHTML += `</tr></thead><tbody>`;
                for (const row of rows) {
                    tableHTML += `<tr><td style="border:2px solid var(--border);padding:6px 14px;font-weight:600;">${row.number.toLocaleString()}</td>`;
                    for (const col of columns) {
                        const val = row[`nearest${col.place}`];
                        const isTarget = row.number === targetRow.number && col.place === targetCol.place;
                        if (isTarget) {
                            tableHTML += `<td style="border:2px solid var(--accent-orange);padding:6px 14px;background:var(--accent-orange)20;font-weight:800;color:var(--accent-orange);font-size:1.2rem;">?</td>`;
                        } else {
                            tableHTML += `<td style="border:2px solid var(--border);padding:6px 14px;">${val.toLocaleString()}</td>`;
                        }
                    }
                    tableHTML += `</tr>`;
                }
                tableHTML += `</tbody></table></div>`;
                q.visual = tableHTML;
                return;
            }

            {
                const decimals = { nearest_tenth: 1, nearest_hundredth: 2, nearest_thousandth: 3 };
                const places = decimals[roundingSkill] || 1;
                // Generate number and ensure the deciding digit (at places+1) is non-zero
                // so the problem isn't trivially "already rounded"
                let num;
                for (let _try = 0; _try < 20; _try++) {
                    num = +(Math.random() * range).toFixed(places + 1);
                    const str = num.toFixed(places + 1);
                    const decIdx = str.indexOf('.');
                    if (decIdx >= 0 && str.length > decIdx + places + 1 && str[decIdx + places + 1] !== '0') break;
                    // Last resort: inject a random non-zero digit
                    if (_try === 19) {
                        const base = +(Math.random() * range).toFixed(places);
                        const extra = rng(1, 9) * Math.pow(10, -(places + 1));
                        num = +(base + extra).toFixed(places + 1);
                    }
                }
                const factor = Math.pow(10, places);
                const placeName = ["tenth","hundredth","thousandth"][places-1];
                q.text = `Round ${num} to the nearest ${placeName}`;
                q.ans = Math.round(num * factor) / factor;
                q.hint = `Look at the digit after the ${placeName} place. If it's 5 or more, round up!`;
                q.visual = `<div style="font-weight:700;font-size:1.2rem;text-align:center;">
                    <span style="color:var(--text-bright);">${num}</span><br>
                    <span style="font-size:0.9rem;color:var(--text-dim);">Check the digit after the ${placeName} place</span>
                </div>`;
                q.options = buildNumericOptions(q.ans);
            }
            return;
}

export function generatePlaceValueQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // For mixed, pick random skill from all place value skills
            const placeSkill = mappedSkill === "mixed" ? pick(["value", "identify", "compare", "expand", "combine", "order_asc", "order_desc", "more_less_10", "more_less_100", "place_value_disks", "pv_disks_build", "pv_digit_drag", "number_word_names", "place_value_10x", "unit_form"]) : mappedSkill;

            // P9 (design/research/place-value-rounding.md): identify, value, expand, combine,
            // more_less_10 / _100, place_value_disks, pv_disks_build and place_value_10x are
            // generated by gen-pv.js — dealt types, a binding band, no answer in the item, the zero
            // place kept, and the disk mat sized to nine disks a zone. Their old branches (a 25%
            // "Click ALL" on three of them, a cross printing the neighbours, a place strip with the
            // answer picked out, "5 x 10 = ?", coloured disks) are gone.
            if (generatePvPlaceValue(q, placeSkill)) return;

            // The "Click ALL ways to write N" multi-select variant was removed here (2026-09-20).
            // It was chosen by Math.random() < 0.25, so one printed page carried three
            // different cell shapes; it had no printText, so on paper it read "Click ALL ways
            // to write the number 100." at a pupil holding a pencil; and P-29 says a written
            // item is never turned into multiple choice. The to_words / to_number variant
            // below is the skill.
            if (placeSkill === "number_word_form") {
                // Grade 2: Write number in word form or numeral from words
                const numberToWordForm = (n) => {
                    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                                  'seventeen', 'eighteen', 'nineteen'];
                    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                    if (n < 20) return ones[n];
                    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
                    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWordForm(n % 100) : '');
                    if (n < 10000) return numberToWordForm(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numberToWordForm(n % 1000) : '');
                    return String(n);
                };

                const maxNum = Math.max(10, Math.min(range, 9999));
                const num = rng(10, maxNum);
                const wordForm = numberToWordForm(num);
                // Which way round is DEALT off state.itemIndex, not rolled: see wordFormWay() at
                // the top of this file. An LRU rotation still changed the task between cells of
                // one printed page, which is two cell shapes on one page.
                const mode = wordFormWay();
                q._variant = mode;

                if (mode === "to_words") {
                    q.text = `Write the number in word form: ${num.toLocaleString()}`;
                    q.ans = wordForm;
                    q.answerType = "text";
                    q.hint = `Break the number into parts: ${num.toString().split('').map((d, i, a) => {
                        const place = Math.pow(10, a.length - 1 - i);
                        return parseInt(d) > 0 ? `${parseInt(d)} ${['thousands', 'hundreds', 'tens', 'ones'][4 - a.length + i]}` : '';
                    }).filter(Boolean).join(', ')}`;
                } else {
                    q.text = `Write the numeral: ${wordForm}`;
                    q.ans = num;
                    q.answerType = "number";
                    q.hint = `Read each part of the word form and combine: "${wordForm}" = ?`;
                    q.options = buildNumericOptions(num);
                }
                q.skillLabel = 'Word Form';

                // Place value chart visual
                const digits = num.toString().split('');
                const placeLabels = ['thousands', 'hundreds', 'tens', 'ones'];
                const placeColors = ['var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-cyan)', 'var(--accent-green)'];
                const startIdx = 4 - digits.length;

                // The chart is filled only when the NUMERAL is the thing given. Asking "Write the
                // numeral: thirty-seven" beside a chart reading Tens 3 Ones 7 prints the answer
                // in the cell; with the direction now dealt, every cell on the page would have
                // done it. So that way round gets an EMPTY digit grid instead — the structural
                // scaffold the pupil writes into, one box per place, which is what the grid is
                // for. The number of boxes tells the pupil how many digits to write, exactly as
                // a column-addition grid does.
                const chartCols = digits.map((d, i) => {
                    const pIdx = startIdx + i;
                    const filled = mode === "to_words";
                    const box = filled
                        ? `<div style="width:40px;height:40px;border-radius:8px;background:${placeColors[pIdx]};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.2rem;">${d}</div>`
                        : `<div style="width:40px;height:40px;border-radius:8px;background:var(--bg-card-light);border:2px solid ${placeColors[pIdx]};"></div>`;
                    return `<div style="text-align:center;padding:6px 10px;">
                        <div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:6px;text-transform:capitalize;">${placeLabels[pIdx]}</div>
                        ${box}
                    </div>`;
                }).join('');

                // The given number is NOT repeated inside the cell. q.text already carries it
                // ("Write the numeral: seventy-three"), and the visual restated it one line
                // below, so every printed cell on the page said the same words twice
                // (CLAUDE.md print checklist 5 / BD-10). visualContainsText does not catch it
                // because the visual wraps the word in quotes, so the duplicate is removed at
                // source. What is left is the digit grid, which is the structural scaffold:
                // empty when the pupil writes the numeral, filled when the numeral is given and
                // the pupil writes the words.
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Number Word Form</div>
                    <div style="display:inline-flex;gap:4px;padding:10px 16px;background:var(--bg-card);border-radius:12px;border:2px solid var(--accent-cyan);">
                        ${chartCols}
                    </div>
                </div>`;
                // The caption under the chart ("Write this as a numeral") restated the
                // instruction inside the cell, which BD-10 forbids and the printed cell showed
                // twice over. q.text above the cell is the instruction.
                return;
            } else if (placeSkill === "compare") {
                // Level 2: Compare Numbers (>, <, =)
                // P9 §2.1: the band binds — `band` (default 999) capped by Max Number, so "to 99"
                // deals two-digit numbers and nothing past the band (it reached 1,303 at Max
                // Number 100). Both numbers sit in the band's digit span.
                if (pvRefuse(q, 'placevalue', 'compare', pvOptions('placevalue', 'compare'))) return;
                const [cLo, cHi] = pvSpan('placevalue', 'compare', 999);
                const base = rng(cLo, cHi);

                // LRU rotation across 3 variants (was random pick).
                const diffType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('estimate_diff', ["different", "same", "close"])
                    : pick(["different", "same", "close"]);
                q._variant = diffType;
                let num1 = base, num2 = base;
                const inSpan = (v) => v >= cLo && v <= cHi && v !== base;
                if (diffType === "close") {
                    for (let t = 0; t < 20 && num2 === base; t++) { const v = base + rng(1, 9) * (rng(0, 1) ? 1 : -1); if (inSpan(v)) num2 = v; }
                } else if (diffType !== "same") {
                    for (let t = 0; t < 20 && num2 === base; t++) { const v = rng(cLo, cHi); if (inSpan(v)) num2 = v; }
                }
                if (rng(0, 1) && num1 !== num2) [num1, num2] = [num2, num1];

                q.text = `Compare: ${num1.toLocaleString()} ___ ${num2.toLocaleString()}`;
                q.ans = num1 > num2 ? ">" : num1 < num2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Compare digit by digit from left to right. Which number is greater?`;
                q.visual = `<div style="text-align:center;color:#000;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        <div style="font-size:2rem;font-weight:700;">${num1.toLocaleString()}</div>
                        <div style="width:2.2rem;height:2.2rem;border:1.5pt solid #000;border-radius:50%;"></div>
                        <div style="font-size:2rem;font-weight:700;">${num2.toLocaleString()}</div>
                    </div>
                </div>`;
            } else if (placeSkill === "order_asc" || placeSkill === "order_desc") {
                // Ordering skills (order_asc or order_desc)
                // Ensure unique numbers; bumped pool to 3-6 for harder practice
                const orderCount = randInt(3, 6);
                const arrSet = new Set();
                let orderSafety = 0;
                while (arrSet.size < orderCount && orderSafety < 200) {
                    orderSafety++;
                    arrSet.add(rng(1, Math.max(orderCount, range)));
                }
                const arr = Array.from(arrSet);
                const sortedAsc = [...arr].sort((a,b)=>a-b);
                const sortedDesc = [...arr].sort((a,b)=>b-a);
                const isAsc = placeSkill === "order_asc";
                const asc = sortedAsc.map(n => n.toLocaleString()).join(" \u2192 ");
                const desc = sortedDesc.map(n => n.toLocaleString()).join(" \u2192 ");

                const ascPhrases = [
                    { text: "smallest to largest", icon: "\ud83d\udd3c Smallest \u2192 Largest", hint: "smallest" },
                    { text: "least to greatest", icon: "\ud83d\udd3c Least \u2192 Greatest", hint: "least" },
                    { text: "increasing order", icon: "\ud83d\udcc8 Increasing Order", hint: "smallest" }
                ];
                const descPhrases = [
                    { text: "largest to smallest", icon: "\ud83d\udd3d Largest \u2192 Smallest", hint: "largest" },
                    { text: "greatest to least", icon: "\ud83d\udd3d Greatest \u2192 Least", hint: "greatest" },
                    { text: "decreasing order", icon: "\ud83d\udcc9 Decreasing Order", hint: "largest" }
                ];
                const phrase = isAsc ? pick(ascPhrases) : pick(descPhrases);
                const sortedArr = isAsc ? sortedAsc : sortedDesc;

                // Randomly choose between 3 modes: input boxes, click-to-order, or multiple choice
                // LRU rotation across 3 variants (was random pick).
                const orderMode = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('_order_mode', ["input", "click", "choice"])
                    : pick(["input", "click", "choice"]);
                q._variant = orderMode;

                if (orderMode === "input") {
                    // Input boxes mode - students type each number
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "input";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Write the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then write it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else if (orderMode === "click") {
                    // Click-to-order mode - students click numbers in sequence
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "click";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Click the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then click it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else {
                    // Multiple choice mode - pick the correct order
                    q.answerType = "text";
                    q.text = `Which list is in order from ${phrase.text}?`;
                    q.ans = isAsc ? asc : desc;
                    q.hint = `Find the ${phrase.hint} number first, then the next ${phrase.hint}, and so on.`;
                    const wrongs = new Set();
                    let orderAttempts = 0;
                    while (wrongs.size < 3 && orderAttempts < 50) {
                        orderAttempts++;
                        const wrongOrder = shuffle([...arr]).map(n => n.toLocaleString()).join(" \u2192 ");
                        if (wrongOrder !== q.ans) wrongs.add(wrongOrder);
                    }
                    q.options = shuffle([q.ans, ...wrongs]);
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Compare these numbers:</div>
                        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                            ${arr.map(n => `<div style="background:var(--accent-cyan);color:white;padding:12px 18px;border-radius:12px;font-weight:800;font-size:1.1rem;">${n.toLocaleString()}</div>`).join("")}
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">${phrase.icon}</div>
                    </div>`;
                }
            } else if (placeSkill === "order_least_to_greatest" || placeSkill === "order_greatest_to_least") {
                // Dedicated ordering skill: 3-6 random whole numbers from state.range
                const isAsc = placeSkill === "order_least_to_greatest";
                const count = randInt(3, 6);
                const setNums = new Set();
                let safety = 0;
                // P9 §2.1: `band` (default 999) capped by Max Number; nothing past it is printed.
                const [, oHi] = pvSpan('placevalue', placeSkill, 999);
                const maxN = Math.max(count + 1, oHi);
                while (setNums.size < count && safety < 200) {
                    safety++;
                    setNums.add(rng(1, maxN));
                }
                const nums = Array.from(setNums);
                const sorted = [...nums].sort((a, b) => isAsc ? a - b : b - a);
                const direction = isAsc ? "asc" : "desc";

                // Paper and screen wording without a screen verb or words in capitals (BD-12).
                q.text = isAsc ? 'Put the numbers in order. Start with the least.' : 'Put the numbers in order. Start with the greatest.';
                q.printText = isAsc ? 'Write the numbers in order. Start with the least.' : 'Write the numbers in order. Start with the greatest.';
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = direction;
                q.orderIcon = isAsc ? "Least → Greatest" : "Greatest → Least";
                q.numbers = shuffle([...nums]);
                q.orderingItems = q.numbers;
                q.sortedNumbers = sorted;
                q.ans = sorted.join(",");
                q.hint = isAsc
                    ? `Find the smallest number first, then the next smallest, and so on.`
                    : `Find the largest number first, then the next largest, and so on.`;
                q.options = [];
                q.visual = "";
                q.skillLabel = "Ordering";
                q.printFormat = "ordering";
                return;
            } else if (placeSkill === "order_negatives") {
                // Grade 6: 3-6 integers (positive + negative); sort ascending
                const isAsc = true; // can be extended later; default least-to-greatest
                const count = randInt(3, 6);
                const setNums = new Set();
                let safety = 0;
                // O2 (2026-09-25): the skill's own band (−N to N) replaces the Max Number cap.
                const _onBand = state.skillOptions && typeof state.skillOptions.band === 'number' && state.skillOptions.band > 0 ? state.skillOptions.band : null;
                const limit = _onBand || Math.max(10, Math.min(range, 100));
                while (setNums.size < count && safety < 200) {
                    safety++;
                    const sign = pick([-1, 1]);
                    setNums.add(sign * rng(1, limit));
                }
                const nums = Array.from(setNums);
                const sorted = [...nums].sort((a, b) => a - b);
                const dirLabel = "LEAST TO GREATEST";

                q.text = `Drag the integers in order from ${dirLabel}.`;
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = "asc";
                q.orderIcon = "Least → Greatest";
                q.numbers = shuffle([...nums]);
                q.orderingItems = q.numbers;
                q.sortedNumbers = sorted;
                q.ans = sorted.join(",");
                q.hint = `Negative numbers come before positive. The bigger the negative, the smaller the value (-9 < -2).`;
                q.options = [];
                q.visual = "";
                q.skillLabel = "Order Integers";
                q.printFormat = "ordering";
                return;
            } else if (placeSkill === "pv_digit_drag") {
                // Grade 4 — drag each digit of a 5- or 6-digit number into the
                // matching place value column (HTh, TTh, Th, H, T, O). Self-
                // submits via in-widget Submit button (answerType: 'pv-digit-drag').
                // Range scaling: 10000 unlocks 5-digit; 100000 unlocks 6-digit;
                // 1000000 unlocks 7-digit. Defaults bias toward 5- and 6-digit.
                // P9 §2.1: `band` (default 99,999) capped by Max Number sets the digit count;
                // below Numbers to 1,000 the skill is refused, never dealt past Max Number. No
                // Math.random gate chooses the digit count any more: the band is the choice.
                if (pvRefuse(q, 'placevalue', 'pv_digit_drag', pvOptions('placevalue', 'pv_digit_drag'))) return;
                const [dLo, dHi] = pvSpan('placevalue', 'pv_digit_drag', 99999);
                let target = rng(dLo, dHi);
                // Avoid targets where the same digit repeats too often (e.g.
                // 333,333) so the chart has variety.
                let attempts = 0;
                while (attempts < 4) {
                    const digits = String(target).split('');
                    const unique = new Set(digits).size;
                    if (unique >= Math.min(3, digits.length)) break;
                    target = rng(dLo, dHi);
                    attempts++;
                }

                let places;
                if (target >= 1000000) places = [1000000, 100000, 10000, 1000, 100, 10, 1];
                else if (target >= 100000) places = [100000, 10000, 1000, 100, 10, 1];
                else if (target >= 10000) places = [10000, 1000, 100, 10, 1];
                else if (target >= 1000) places = [1000, 100, 10, 1];
                else places = [100, 10, 1];

                const placeNamesShort = {
                    1: 'O', 10: 'T', 100: 'H', 1000: 'Th',
                    10000: 'TTh', 100000: 'HTh', 1000000: 'M'
                };
                void placeNamesShort;

                q.text = `Put each digit of ${target.toLocaleString()} in its place in the chart.`;
                q.printText = `Write each digit of ${target.toLocaleString()} in its place.`;
                q.target = target;
                q.places = places;
                q.ans = target;
                q.answerType = 'pv-digit-drag';
                // The hint names the method, never the finished chart (Q-8).
                q.hint = 'Start with the ones digit on the right. Each place to the left is ten times bigger.';
                q.skillLabel = 'Digit Drag';
                q.printFormat = 'pv-digit-drag';
                q.visual = '';
                q.options = [];
            } else if (placeSkill === "number_word_names") {
                // Grade 4 — multiple-choice match a numeral to its English
                // word name. Distractors are constructed by perturbing one
                // place value of the target so the wrong choices are
                // plausible (off-by-one digit in a single place).
                const numberToWordForm = (n) => {
                    if (n === 0) return 'zero';
                    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                                  'seventeen', 'eighteen', 'nineteen'];
                    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                    const under1000 = (x) => {
                        if (x === 0) return '';
                        if (x < 20) return ones[x];
                        if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : '');
                        return ones[Math.floor(x / 100)] + ' hundred' + (x % 100 ? ' ' + under1000(x % 100) : '');
                    };
                    if (n < 1000) return under1000(n);
                    if (n < 1000000) {
                        const thou = Math.floor(n / 1000);
                        const rest = n % 1000;
                        return under1000(thou) + ' thousand' + (rest ? ', ' + under1000(rest) : '');
                    }
                    // n < 1,000,000,000
                    const mil = Math.floor(n / 1000000);
                    const restAfterMil = n % 1000000;
                    const thou = Math.floor(restAfterMil / 1000);
                    const rest = restAfterMil % 1000;
                    let out = under1000(mil) + ' million';
                    if (thou) out += ', ' + under1000(thou) + ' thousand';
                    if (rest) out += ', ' + under1000(rest);
                    return out;
                };
                // Capitalize the first letter of the word name for display.
                const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

                // Pick a target. Bias toward 6- and 7-digit numbers when the
                // range allows; fall back to smaller magnitudes for tiny
                // ranges so the skill still works.
                // P9 §2.1: `band` (default 999,999) capped by Max Number sets the digit count. No
                // Math.random gate picks the magnitude any more.
                const [wLo, wHi] = pvSpan('placevalue', 'number_word_names', 999999);
                let target = rng(wLo, wHi);
                // Avoid trivially-named numbers whose word forms are very short
                // (e.g. round multiples of 1000). Make sure at least 2 places
                // are non-zero so distractors have room to be plausible.
                let safety = 0;
                while (safety < 8) {
                    const nonZero = String(target).split('').filter(d => d !== '0').length;
                    if (nonZero >= 2) break;
                    target = rng(wLo, wHi);
                    safety++;
                }

                // Build distractors by perturbing one digit (not the leading
                // one) by ±1 or by swapping two adjacent non-zero digits.
                const correctText = cap(numberToWordForm(target)) + '.';
                const distractorSet = new Set();
                distractorSet.add(target);
                let safetyD = 0;
                while (distractorSet.size < 4 && safetyD < 50) {
                    safetyD++;
                    const digits = String(target).split('').map(Number);
                    const mode = pick(['perturb', 'perturb', 'swap']);
                    let candidate = null;
                    if (mode === 'perturb' && digits.length >= 2) {
                        const pos = rng(1, digits.length - 1); // not leading digit
                        const newDigits = digits.slice();
                        const delta = pick([-1, 1, -2, 2]);
                        let nd = newDigits[pos] + delta;
                        if (nd < 0 || nd > 9) nd = (nd + 10) % 10;
                        if (nd === newDigits[pos]) nd = (nd + 1) % 10;
                        newDigits[pos] = nd;
                        candidate = parseInt(newDigits.join(''), 10);
                    } else if (mode === 'swap' && digits.length >= 3) {
                        const pos = rng(0, digits.length - 2);
                        const newDigits = digits.slice();
                        [newDigits[pos], newDigits[pos + 1]] = [newDigits[pos + 1], newDigits[pos]];
                        // Don't allow the swap to introduce a leading zero.
                        if (newDigits[0] === 0) continue;
                        candidate = parseInt(newDigits.join(''), 10);
                    }
                    if (candidate == null || candidate <= 0) continue;
                    if (String(candidate).length !== String(target).length) continue;
                    if (distractorSet.has(candidate)) continue;
                    distractorSet.add(candidate);
                }
                // Final fallback: pad with random nearby numbers.
                while (distractorSet.size < 4) {
                    const c = target + rng(-9, 9) * Math.pow(10, rng(0, String(target).length - 2));
                    if (c > 0 && String(c).length === String(target).length && !distractorSet.has(c)) {
                        distractorSet.add(c);
                    } else {
                        // Loosen length restriction as last resort, never past the band.
                        const c2 = Math.max(1, Math.min(wHi, target + rng(-99, 99)));
                        if (!distractorSet.has(c2)) distractorSet.add(c2);
                    }
                }

                const choiceNumbers = shuffle(Array.from(distractorSet));
                const options = choiceNumbers.map(n => cap(numberToWordForm(n)) + '.');

                q.text = `Which is the word name for ${target.toLocaleString()}?`;
                q.printText = 'Circle the word name of the number.';
                q.ans = correctText;
                q.options = options;
                // 'multiple-choice' (it was 'choice', which the quiz host does not know, so the quiz
                // printed a bare write-line for a Choose skill).
                q.answerType = 'multiple-choice';
                // The hint names the method; it used to print the answer itself (Q-8).
                q.hint = 'Read each part: millions, thousands, then hundreds, tens and ones.';
                q.skillLabel = 'Word Name';
                // Visual: the numeral under its place letters, in ink (it was a seven-colour
                // chart that printed as grey blocks).
                q.visual = `<div style="text-align:center;">${numeralTracksHTML(target)}</div>`;
                // The kit cell (it was template:legacy, whose handler printed "word name for NaN"
                // and a second Answer line under the choices): the numeral, then the four word
                // names one per line; ONE response — ring the right one. The key rings it.
                // `labels` / `correct`: the choices' letters, so a fix on Error analysis is a check
                // box by the right letter, not the whole word name copied into a box.
                const letters = options.map((_, i) => 'ABCD'[i]);
                q.cell = { template: 'pv', v: 1, payload: { kind: 'word-choice', n: target, choices: options, labels: letters,
                    correct: options.indexOf(correctText), keyValue: correctText } };
                q.printFormat = 'pv-cell';
                q.pv = { kind: 'words', n: target, choices: options.slice() };
            }
            return;
}

let _estLiveCursor = -1;
export function generateEstimationQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Estimation Category
            // Allow estMax to scale through millions for larger ranges so estimate skills
            // can produce 4-7 digit operands (rounded to 10/100/1k/10k/100k/1M).
            const estMax = Math.max(10, Math.min(range, 9999999));
            const estSkill = mappedSkill === "mixed" ? pick(["estimate_sum", "estimate_diff", "estimate_prod", "estimate_quotient", "compatible_numbers", "frontend_estimation", "estimate_sums_diffs", "estimate_products", "make_a_ten", "doubles_near_doubles", "compensation"]) : mappedSkill;

            // P9 step 8 (§12): the five estimation ids of number_sense are generated by gen-pv.js —
            // the place printed, the two-line rewrite, the closest of three, and "is it
            // reasonable?" genuinely reasonable on half the items. Their old branches below are
            // left only for the ids gen-pv.js does not claim.
            if (generatePvEstimation(q, estSkill)) return;

            // P9 §2.2: the 25% "Click ALL reasonable estimates" gate is gone. Choosing the closest
            // estimate is `task: closest` on the skills that declare it (skill-options.js), dealt
            // for a whole page, never rolled per item. Item types that are not options yet are
            // dealt round-robin off the page position, so a seed reprints the same page and every
            // type appears — no Math.random() picks a type any more.
            const _estAt = Number.isFinite(state.itemIndex) ? state.itemIndex : (++_estLiveCursor);
            const _estDeal = (n) => ((_estAt % n) + n) % n;
            // P12: `forms` (make_a_ten, doubles_near_doubles) — when the teacher changed it from
            // every kind, deal only the ticked kinds; untouched, the old deal.
            const _estForm = (n) => {
                let def = null;
                try { def = optionsFor(state.category, state.skill).find(o => o.id === 'forms') || null; } catch (e) { def = null; }
                const o = state.skillOptions;
                if (!def || !o || !Array.isArray(o.forms)) return _estDeal(n);
                const t = def.values.map(x => x.v).filter(v => o.forms.includes(v) && v < n);
                if (!t.length || t.length === def.values.length) return _estDeal(n);
                return t[_estDeal(t.length)];
            };
            // One value that lands in the chosen task's branch in ALL THREE skills below (their
            // cut points are 0.4 / 0.7, 0.4 / 0.7 and 0.5 / 0.8): 0.55 is "closest" in every one.
            const _estTaskR = () => {
                const t = pvOptions('number_sense', estSkill).task;
                return t === 'closest' ? 0.55 : t === 'reasonable' ? 0.95 : 0;
            };
            // "Round to the nearest" (skill-options.js, owner 2026-09-25): the PLACE sets the
            // number size, the way a rounding skill's band does — numbers to 10 x the place — and
            // Max Number lowers it only when the teacher explicitly set it below (pvCap).
            const _estPlaceRange = () => {
                const roundTo = Number(pvOptions('number_sense', estSkill).place) || 10;
                const top = pvCap(roundTo * 10 - 1, range);
                const opMin = roundTo + Math.max(2, Math.floor(roundTo / 5));
                const opMax = Math.max(opMin + roundTo, top);
                return { roundTo, opMin, opMax, estMax: opMax };
            };

            // Helper: pick a rounding place AND an operand range that scales to whatever
            // estMax allows (estMax is bounded by state.range above). We always include
            // smaller rounding places so the practice mixes scales rather than always
            // jumping to the maximum.
            const _pickRoundPlaceAndRange = () => {
                const places = [10];
                if (estMax >= 200) places.push(100);
                if (estMax >= 2000) places.push(1000);
                if (estMax >= 20000) places.push(10000);
                if (estMax >= 200000) places.push(100000);
                if (estMax >= 2000000) places.push(1000000);
                const roundTo = pick(places);
                const opMin = roundTo + Math.max(2, Math.floor(roundTo / 5));
                const opMax = Math.max(opMin + roundTo, Math.min(estMax, roundTo * 10 - 1));
                return { roundTo, opMin, opMax };
            };

            if (estSkill === "estimate_sum") {
                // Estimate sums by rounding
                const { roundTo, opMin, opMax } = _pickRoundPlaceAndRange();
                let a = rng(opMin, opMax);
                let b = rng(opMin, opMax);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded + bRounded;
                const actual = a + b;

                q.text = `Estimate: ${a.toLocaleString()} + ${b.toLocaleString()}`;
                q.ans = estimate;
                q.hint = `Round each to the nearest ${roundTo.toLocaleString()}: ${a.toLocaleString()} \u2192 ${aRounded.toLocaleString()}, ${b.toLocaleString()} \u2192 ${bRounded.toLocaleString()}. Then add: ${aRounded.toLocaleString()} + ${bRounded.toLocaleString()} = ${estimate.toLocaleString()}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Sum</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a.toLocaleString()} + ${b.toLocaleString()}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round each to nearest ${roundTo.toLocaleString()}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a.toLocaleString()}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b.toLocaleString()}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Add the rounded numbers</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '+', strategy: 'rounding' };
                q.printFormat = "estimation-sum";
            } else if (estSkill === "estimate_diff") {
                // Estimate differences by rounding
                const { roundTo, opMin, opMax } = _pickRoundPlaceAndRange();
                // a should be near the top of the range so b can fit below it
                const aMin = Math.max(opMin + roundTo * 2, Math.floor(opMax / 2));
                let a = rng(Math.min(aMin, opMax), opMax);
                let b = rng(opMin, Math.max(opMin + 1, a - roundTo * 2));
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded - bRounded;
                const actual = a - b;

                q.text = `Estimate: ${a.toLocaleString()} - ${b.toLocaleString()}`;
                q.ans = estimate;
                q.hint = `Round each to the nearest ${roundTo.toLocaleString()}: ${a.toLocaleString()} \u2192 ${aRounded.toLocaleString()}, ${b.toLocaleString()} \u2192 ${bRounded.toLocaleString()}. Then subtract: ${aRounded.toLocaleString()} - ${bRounded.toLocaleString()} = ${estimate.toLocaleString()}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Difference</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a.toLocaleString()} - ${b.toLocaleString()}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round each to nearest ${roundTo.toLocaleString()}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a.toLocaleString()}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b.toLocaleString()}</div>
                                <div style="font-size:1.2rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Subtract the rounded numbers</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '-', strategy: 'rounding' };
                q.printFormat = "estimation-diff";
            } else if (estSkill === "estimate_prod") {
                // Estimate products by rounding
                const roundTo = 10;
                const prodMaxA = Math.max(15, Math.min(estMax, 49));
                let a = rng(12, prodMaxA);
                let b = rng(2, 9);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const estimate = aRounded * b;
                const actual = a * b;

                q.text = `Estimate: ${a} \u00d7 ${b}`;
                q.ans = estimate;
                q.hint = `Round ${a} to the nearest ${roundTo}: ${a} \u2192 ${aRounded}. Then multiply: ${aRounded} \u00d7 ${b} = ${estimate}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Estimate the Product</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} \u00d7 ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round ${a} to nearest ${roundTo}</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:0.9rem;color:var(--text-dim);">${a} \u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Multiply by ${b}</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded: b, estimate, actual, roundTo, op: '\u00d7', strategy: 'rounding' };
                q.printFormat = "estimation-prod";
            } else if (estSkill === "compatible_numbers") {
                // Compatible numbers for division
                const divisor = pick([3, 4, 5, 6, 7, 8, 9]);
                const compatMaxQ = Math.max(5, Math.min(Math.floor(estMax / divisor), 15));
                const targetQuotient = rng(5, compatMaxQ);
                const compatible = divisor * targetQuotient;
                // Create dividend that's close to compatible
                const dividend = compatible + rng(-divisor + 1, divisor - 1);
                const estimate = targetQuotient;
                const actual = Math.round(dividend / divisor * 10) / 10;

                q.text = `Use compatible numbers to estimate: ${dividend} \u00f7 ${divisor}`;
                q.ans = estimate;
                q.hint = `Find a number close to ${dividend} that divides evenly by ${divisor}: ${compatible} works (${compatible} \u00f7 ${divisor} = ${targetQuotient}).`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Compatible Numbers</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${dividend} \u00f7 ${divisor}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Find compatible dividend</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">What number close to ${dividend} divides evenly by ${divisor}?</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:1.1rem;">${dividend} \u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Divide by ${divisor}</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { dividend, divisor, compatible, estimate, actual, op: '\u00f7', strategy: 'compatible' };
                q.printFormat = "estimation-compatible";
            } else if (estSkill === "frontend_estimation") {
                // Front-end estimation (requires 3-digit numbers for front-end digit strategy)
                const feMax = Math.max(200, Math.min(estMax, 999));
                const a = rng(100, feMax);
                const b = rng(100, feMax);
                const op = pick(['+', '-']);

                // Get front-end digits (hundreds place)
                const aFront = Math.floor(a / 100) * 100;
                const bFront = Math.floor(b / 100) * 100;

                let estimate, actual;
                if (op === '+') {
                    estimate = aFront + bFront;
                    actual = a + b;
                } else {
                    // Ensure a > b for subtraction
                    const [larger, smaller] = a > b ? [a, b] : [b, a];
                    const largerFront = Math.floor(larger / 100) * 100;
                    const smallerFront = Math.floor(smaller / 100) * 100;
                    estimate = largerFront - smallerFront;
                    actual = larger - smaller;
                    q.estimationData = { a: larger, b: smaller, aFront: largerFront, bFront: smallerFront, estimate, actual, op, strategy: 'frontend' };
                }

                q.text = `Use front-end estimation: ${op === '+' ? a : (a > b ? a : b)} ${op} ${op === '+' ? b : (a > b ? b : a)}`;
                q.ans = estimate;

                const displayA = op === '+' ? a : (a > b ? a : b);
                const displayB = op === '+' ? b : (a > b ? b : a);
                const displayAFront = op === '+' ? aFront : (a > b ? aFront : bFront);
                const displayBFront = op === '+' ? bFront : (a > b ? bFront : aFront);

                q.hint = `Keep only the front digit, replace the rest with zeros: ${displayA} \u2192 ${displayAFront}, ${displayB} \u2192 ${displayBFront}. Then ${op === '+' ? 'add' : 'subtract'}: ${displayAFront} ${op} ${displayBFront} = ${estimate}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\ud83d\udccf Front-End Estimation</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${displayA} ${op} ${displayB}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Keep the front digit; replace the rest with zeros</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayA.toString()[0]}</span><span style="color:var(--text-dim);">${displayA.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayB.toString()[0]}</span><span style="color:var(--text-dim);">${displayB.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">\u2192 <span style="border-bottom:2px dashed var(--accent-green);padding:0 8px;">?</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: ${op === '+' ? 'Add' : 'Subtract'} the rounded numbers</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                if (!q.estimationData) {
                    q.estimationData = { a: displayA, b: displayB, aFront: displayAFront, bFront: displayBFront, estimate, actual, op, strategy: 'frontend' };
                }
                q.printFormat = "estimation-frontend";
            }

            // ========================================
            // ESTIMATE SUMS & DIFFERENCES (Grade 3)
            // ========================================
            else if (estSkill === "estimate_sums_diffs") {
                const r = _estTaskR();
                const { roundTo, opMin, opMax } = _estPlaceRange();
                const placeName = roundTo === 10 ? 'ten' : roundTo === 100 ? 'hundred' : roundTo === 1000 ? 'thousand' : roundTo === 10000 ? 'ten thousand' : roundTo === 100000 ? 'hundred thousand' : 'million';

                if (r < 0.4) {
                    // Type 1 (40%): Round-then-compute
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(opMin, opMax);
                        b = rng(opMin, opMax);
                    } else {
                        a = rng(Math.max(opMin + roundTo * 2, Math.floor(opMax / 2)), opMax);
                        b = rng(opMin, Math.max(opMin + 1, a - roundTo * 2));
                    }
                    const aR = Math.round(a / roundTo) * roundTo;
                    const bR = Math.round(b / roundTo) * roundTo;
                    const estimate = op === '+' ? aR + bR : aR - bR;
                    const opName = op === '+' ? 'add' : 'subtract';

                    q.text = `Round to the nearest ${placeName}, then ${opName}: ${a.toLocaleString()} ${op} ${b.toLocaleString()} \u2248 ?`;
                    q.ans = estimate;
                    q.hint = `${a.toLocaleString()} \u2192 ${aR.toLocaleString()}, ${b.toLocaleString()} \u2192 ${bR.toLocaleString()}, then ${aR.toLocaleString()} ${op} ${bR.toLocaleString()} = ${estimate.toLocaleString()}`;
                    q.options = buildNumericOptions(estimate);
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                } else if (r < 0.7) {
                    // Type 2 (30%): Closest estimate (MC)
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(opMin, opMax);
                        b = rng(opMin, opMax);
                    } else {
                        a = rng(Math.max(opMin + roundTo * 2, Math.floor(opMax / 2)), opMax);
                        b = rng(opMin, Math.max(opMin + 1, a - roundTo * 2));
                    }
                    const aR = Math.round(a / roundTo) * roundTo;
                    const bR = Math.round(b / roundTo) * roundTo;
                    const estimate = op === '+' ? aR + bR : aR - bR;
                    // Build MC choices spaced by roundTo
                    const choices = [estimate, estimate + roundTo, estimate - roundTo, estimate + roundTo * 2].filter(x => x >= 0);
                    while (choices.length < 4) choices.push(estimate + roundTo * (choices.length));

                    q.text = `${a.toLocaleString()} ${op} ${b.toLocaleString()} is closest to:`;
                    q.ans = estimate;
                    q.hint = `Round each number to the nearest ${placeName} first!`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([...new Set(choices)]).slice(0, 4).map(v => Number(v).toLocaleString());
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                } else {
                    // Type 3 (30%): Reasonable check
                    const op = pick(['+', '-']);
                    let a, b;
                    if (op === '+') {
                        a = rng(opMin, opMax);
                        b = rng(opMin, opMax);
                    } else {
                        a = rng(Math.max(opMin + roundTo * 2, Math.floor(opMax / 2)), opMax);
                        b = rng(opMin, Math.max(opMin + 1, a - roundTo * 2));
                    }
                    const actual = op === '+' ? a + b : a - b;
                    // Create a wrong answer that's clearly off
                    const errorType = pick(['too_low', 'too_high']);
                    const wrongAns = errorType === 'too_low'
                        ? actual - rng(Math.max(20, Math.floor(actual * 0.3)), Math.max(30, Math.floor(actual * 0.5)))
                        : actual + rng(Math.max(20, Math.floor(actual * 0.3)), Math.max(30, Math.floor(actual * 0.5)));
                    const correctChoice = errorType === 'too_low' ? 'No, too low' : 'No, too high';

                    q.text = `Is this reasonable? ${a.toLocaleString()} ${op} ${b.toLocaleString()} = ${wrongAns.toLocaleString()}`;
                    q.ans = correctChoice;
                    const _aR3 = Math.round(a / roundTo) * roundTo;
                    const _bR3 = Math.round(b / roundTo) * roundTo;
                    const _est3 = op === '+' ? _aR3 + _bR3 : _aR3 - _bR3;
                    q.hint = `Estimate by rounding: ${_aR3.toLocaleString()} ${op} ${_bR3.toLocaleString()} = ${_est3.toLocaleString()}. Is ${wrongAns.toLocaleString()} close?`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle(['No, too low', 'Yes, reasonable', 'No, too high']);
                    q.skillLabel = 'Est. Sums/Diffs';
                    q.printFormat = 'estimation-sums-diffs';
                }
            }

            // ========================================
            // ESTIMATE PRODUCTS (Grade 4)
            // ========================================
            else if (estSkill === "estimate_products") {
                const r = _estTaskR();
                // The multiplicand's rounding place is the teacher's "Round to the nearest";
                // the multiplier stays a single digit (2-9) to keep it mental-math friendly.
                const { roundTo, opMin: aMin, opMax: aMax } = _estPlaceRange();

                if (r < 0.4) {
                    // Type 1 (40%): Round-then-multiply
                    const a = rng(aMin, aMax);
                    const b = rng(2, 9);
                    const aR = Math.round(a / roundTo) * roundTo;
                    const estimate = aR * b;

                    q.text = `Estimate: ${a.toLocaleString()} \u00d7 ${b} \u2248 ?`;
                    q.ans = estimate;
                    q.hint = `${a.toLocaleString()} \u2192 ${aR.toLocaleString()}, then ${aR.toLocaleString()} \u00d7 ${b} = ${estimate.toLocaleString()}`;
                    q.options = buildNumericOptions(estimate);
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                } else if (r < 0.7) {
                    // Type 2 (30%): Closest estimate (MC)
                    const a = rng(aMin, aMax);
                    const b = rng(2, 9);
                    const aR = Math.round(a / roundTo) * roundTo;
                    const estimate = aR * b;
                    const step = roundTo * b;
                    const choices = [estimate, estimate + step, estimate - step, estimate + step * 2].filter(x => x > 0);
                    while (choices.length < 4) choices.push(estimate + step * choices.length);

                    q.text = `${a.toLocaleString()} \u00d7 ${b} is closest to:`;
                    q.ans = estimate;
                    q.hint = `Round ${a.toLocaleString()} to the nearest ${roundTo.toLocaleString()} first!`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([...new Set(choices)]).slice(0, 4).map(v => Number(v).toLocaleString());
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                } else {
                    // Type 3 (30%): Reasonable check
                    const a = rng(aMin, aMax);
                    const b = rng(2, 9);
                    const actual = a * b;
                    const errorType = pick(['too_low', 'too_high']);
                    const wrongAns = errorType === 'too_low'
                        ? Math.max(1, actual - rng(Math.max(20, Math.floor(actual * 0.4)), Math.max(30, Math.floor(actual * 0.6))))
                        : actual + rng(Math.max(20, Math.floor(actual * 0.4)), Math.max(30, Math.floor(actual * 0.6)));
                    const correctChoice = errorType === 'too_low' ? 'No, too low' : 'No, too high';

                    q.text = `Is this reasonable? ${a.toLocaleString()} \u00d7 ${b} = ${wrongAns.toLocaleString()}`;
                    q.ans = correctChoice;
                    q.hint = `Estimate: ${(Math.round(a / roundTo) * roundTo).toLocaleString()} \u00d7 ${b} = ${(Math.round(a / roundTo) * roundTo * b).toLocaleString()}. Is ${wrongAns.toLocaleString()} close?`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle(['No, too low', 'Yes, reasonable', 'No, too high']);
                    q.skillLabel = 'Est. Products';
                    q.printFormat = 'estimation-products';
                }
            }

            // ========================================
            // ESTIMATE QUOTIENTS (Grade 4-5)
            // Round dividend (and optionally divisor) to make division mental-math friendly.
            // ========================================
            else if (estSkill === "estimate_quotient") {
                const r = _estTaskR();
                // The size of the estimate is the teacher's choice ("Size of the estimate",
                // skill-options.js): ones (43 ÷ 6 ≈ 7), tens (430 ÷ 6 ≈ 70), hundreds, thousands.
                // It SETS the dividend's size; Max Number lowers it only when the teacher explicitly
                // set it below (pvCap).
                const placeFactor = Number(pvOptions('number_sense', estSkill).place) || 1;
                // With no place factor the compatible number is the nearest multiple of the
                // divisor, so the offset stays under half the divisor: 21 ÷ 3 must never be
                // "about 6" when 21 is itself a multiple of 3. A divisor of 2 has no such offset,
                // so it is not dealt for a ones-sized estimate.
                const divisor = pick(placeFactor === 1 ? [3, 4, 5, 6, 7, 8, 9] : [2, 3, 4, 5, 6, 7, 8, 9]);
                const _offFor = (pf) => pf === 1 ? Math.max(0, Math.ceil(divisor / 2) - 1)
                    : Math.max(1, Math.floor(pf / 2) - 1);
                const quotCap = pvCap(divisor * 9 * placeFactor + _offFor(placeFactor), range);
                const qMax = Math.max(2, Math.min(9, Math.floor((quotCap - _offFor(placeFactor)) / (divisor * placeFactor))));
                const targetQuotient = rng(2, qMax) * placeFactor; // e.g. 4, 40, 400, 4000, 40000, 400000
                const roundedDividend = divisor * targetQuotient; // already a "nice" number
                // Choose a rounding place small enough that the dividend isn't already exact
                const roundTo = placeFactor === 1 ? 10 : placeFactor;
                // Build a real dividend by adding a small offset so rounding to roundTo produces roundedDividend
                const offsetMax = _offFor(placeFactor);
                const offset = offsetMax ? rng(1, offsetMax) * (rng(0, 1) ? 1 : -1) : 0;
                const dividend = Math.max(1, roundedDividend + offset);
                const estimate = targetQuotient;
                const actual = Math.round((dividend / divisor) * 100) / 100;

                if (r < 0.5) {
                    // Type 1 (50%): Round-then-divide
                    q.text = `Estimate: ${dividend.toLocaleString()} \u00f7 ${divisor} \u2248 ?`;
                    q.ans = estimate;
                    q.hint = `Round ${dividend.toLocaleString()} to a number that divides evenly by ${divisor}: ${roundedDividend.toLocaleString()}. Then ${roundedDividend.toLocaleString()} \u00f7 ${divisor} = ${estimate.toLocaleString()}.`;
                    q.options = buildNumericOptions(estimate);
                    q.skillLabel = 'Est. Quotient';
                    q.printFormat = 'estimation-quotient';
                    q.estimationData = { a: dividend, b: divisor, aRounded: roundedDividend, bRounded: divisor, estimate, actual, roundTo, op: '\u00f7', strategy: 'compatible' };
                } else if (r < 0.8) {
                    // Type 2 (30%): Closest estimate (MC)
                    const step = placeFactor;
                    const choices = [estimate, estimate + step, Math.max(1, estimate - step), estimate + step * 2];
                    q.text = `${dividend.toLocaleString()} \u00f7 ${divisor} is closest to:`;
                    q.ans = estimate;
                    q.hint = `Find a number close to ${dividend.toLocaleString()} that divides evenly by ${divisor}.`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([...new Set(choices)]).slice(0, 4).map(v => Number(v).toLocaleString());
                    q.skillLabel = 'Est. Quotient';
                    q.printFormat = 'estimation-quotient';
                    q.estimationData = { a: dividend, b: divisor, aRounded: roundedDividend, bRounded: divisor, estimate, actual, roundTo, op: '\u00f7', strategy: 'compatible' };
                } else {
                    // Type 3 (20%): Reasonable check
                    const errorType = pick(['too_low', 'too_high']);
                    const wrongAns = errorType === 'too_low'
                        ? Math.max(1, estimate - placeFactor * rng(2, 5))
                        : estimate + placeFactor * rng(2, 5);
                    const correctChoice = errorType === 'too_low' ? 'No, too low' : 'No, too high';
                    q.text = `Is this reasonable? ${dividend.toLocaleString()} \u00f7 ${divisor} \u2248 ${wrongAns.toLocaleString()}`;
                    q.ans = correctChoice;
                    q.hint = `Use compatible numbers: ${roundedDividend.toLocaleString()} \u00f7 ${divisor} = ${estimate.toLocaleString()}. Is ${wrongAns.toLocaleString()} close?`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle(['No, too low', 'Yes, reasonable', 'No, too high']);
                    q.skillLabel = 'Est. Quotient';
                    q.printFormat = 'estimation-quotient';
                }
            }

            // ========================================
            // MAKE A TEN STRATEGY (Grade 1)
            // ========================================
            else if (estSkill === "make_a_ten") {
                const r = [0, 0.9][_estForm(2)];

                if (r < 0.5) {
                    // Type 1 (50%): Complete the make-ten decomposition
                    // Pick first addend 6-9 (where making ten is useful)
                    const a = rng(6, 9);
                    const complement = 10 - a; // how much a needs to reach 10
                    // Second addend must be > complement so we can decompose
                    const b = rng(complement + 1, complement + 5);
                    const remainder = b - complement;
                    const total = a + b;

                    q.text = `Use Make a Ten: ${a} + ${b} = ?`;
                    q.ans = total;
                    q.hint = `${a} + ${complement} = 10, so ${a} + ${b} = ${a} + ${complement} + ${remainder} = 10 + ${remainder} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Make a Ten!</div>
                        <div style="font-size:1.4rem;margin:10px 0;">${a} + ${b}</div>
                        <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:1.1rem;margin:8px 0;">
                                <span style="color:var(--accent-cyan);font-weight:700;">${a}</span> +
                                <span style="color:var(--accent-orange);font-weight:700;">${complement}</span> +
                                <span style="color:var(--accent-green);font-weight:700;">${remainder}</span>
                            </div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin:5px 0;">
                                Split ${b} into ${complement} + ${remainder}
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                = <span style="color:var(--accent-purple);font-weight:700;">10</span> +
                                <span style="color:var(--accent-green);font-weight:700;">${remainder}</span>
                                = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Make a Ten';
                    q.printFormat = 'make-a-ten';
                } else {
                    // Type 2 (50%): Choose the correct make-ten decomposition (MC)
                    const a = rng(6, 9);
                    const complement = 10 - a;
                    const b = rng(complement + 1, complement + 5);
                    const remainder = b - complement;
                    const total = a + b;
                    const correct = `${a} + ${complement} + ${remainder}`;
                    // Wrong decompositions
                    const wrong1 = `${a} + ${complement + 1} + ${Math.max(0, remainder - 1)}`;
                    const wrong2 = `${a} + ${Math.max(1, complement - 1)} + ${remainder + 1}`;
                    const wrong3 = `${a + 1} + ${complement} + ${Math.max(0, remainder - 1)}`;

                    q.text = `Which shows the Make a Ten way to add ${a} + ${b}?`;
                    q.ans = correct;
                    q.hint = `${a} needs ${complement} more to make 10. Split ${b} into ${complement} and ${remainder}.`;
                    q.answerType = 'multiple-choice';
                    q.options = shuffle([correct, wrong1, wrong2, wrong3]);
                    q.skillLabel = 'Make a Ten';
                    q.printFormat = 'make-a-ten';
                }
            }

            // ========================================
            // DOUBLES & NEAR DOUBLES (Grade 1)
            // ========================================
            else if (estSkill === "doubles_near_doubles") {
                const r = [0, 0.5, 0.9][_estForm(3)];

                if (r < 0.4) {
                    // Type 1 (40%): Doubles fact
                    const n = rng(1, 10);
                    const total = n + n;

                    q.text = `Double it! ${n} + ${n} = ?`;
                    q.ans = total;
                    q.hint = `${n} + ${n} means two groups of ${n}. Count: ${total}`;
                    q.answerType = 'number';
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Doubles';
                    q.printFormat = 'doubles';
                } else if (r < 0.7) {
                    // Type 2 (30%): Doubles plus one
                    const n = rng(2, 9);
                    const total = n + n + 1;

                    q.text = `Use doubles: ${n} + ${n + 1} = ?`;
                    q.ans = total;
                    q.hint = `Think: ${n} + ${n} = ${n * 2}, then add 1 more. ${n * 2} + 1 = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Doubles + 1</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${n} + ${n + 1}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:280px;">
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n} + ${n} = <span style="color:var(--accent-cyan);font-weight:700;">${n * 2}</span>
                            </div>
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n * 2} + 1 = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Near Doubles';
                    q.printFormat = 'doubles';
                } else {
                    // Type 3 (30%): Doubles minus one
                    const n = rng(3, 10);
                    const total = n + n - 1;

                    q.text = `Use doubles: ${n} + ${n - 1} = ?`;
                    q.ans = total;
                    q.hint = `Think: ${n} + ${n} = ${n * 2}, then subtract 1. ${n * 2} - 1 = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Doubles - 1</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${n} + ${n - 1}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:280px;">
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n} + ${n} = <span style="color:var(--accent-cyan);font-weight:700;">${n * 2}</span>
                            </div>
                            <div style="font-size:1rem;margin:5px 0;">
                                ${n * 2} - 1 = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Near Doubles';
                    q.printFormat = 'doubles';
                }
            }

            // ========================================
            // COMPENSATION STRATEGY (Grade 2)
            // ========================================
            else if (estSkill === "compensation") {
                const r = [0, 0.9][_estDeal(2)];

                if (r < 0.5) {
                    // Type 1 (50%): Add with compensation
                    // One addend is close to a round number (like 19, 29, 38, 49, 99)
                    const roundTarget = pick([10, 20, 30, 40, 50, 100]);
                    const diff = rng(1, 3); // how far from the round number
                    const nearRound = roundTarget - diff; // e.g., 19, 28, 47, 99
                    const maxB = Math.max(5, Math.min(estMax - roundTarget, 50));
                    const b = rng(3, maxB);
                    const total = nearRound + b;
                    const adjusted = b - diff;

                    q.text = `Use compensation: ${nearRound} + ${b} = ?`;
                    q.ans = total;
                    q.hint = `Add ${diff} to ${nearRound} to make ${roundTarget}. Subtract ${diff} from ${b} to get ${adjusted}. ${roundTarget} + ${adjusted} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Compensation Strategy</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${nearRound} + ${b}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Add ${diff} to ${nearRound} \u2192 <span style="color:var(--accent-cyan);font-weight:700;">${roundTarget}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Subtract ${diff} from ${b} \u2192 <span style="color:var(--accent-orange);font-weight:700;">${adjusted}</span>
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                ${roundTarget} + ${adjusted} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Compensation';
                    q.printFormat = 'compensation';
                } else {
                    // Type 2 (50%): Subtract with compensation
                    // Subtrahend is close to a round number
                    const roundTarget = pick([10, 20, 30, 50]);
                    const diff = rng(1, 3);
                    const nearRound = roundTarget - diff; // e.g., 9, 18, 27, 49
                    const minA = roundTarget + 5;
                    const a = rng(minA, Math.max(minA + 10, Math.min(estMax, 100)));
                    const total = a - nearRound;
                    const adjusted = a - roundTarget; // subtracted too much
                    // total = adjusted + diff

                    q.text = `Use compensation: ${a} - ${nearRound} = ?`;
                    q.ans = total;
                    q.hint = `Subtract ${roundTarget} instead: ${a} - ${roundTarget} = ${adjusted}. You subtracted ${diff} too many, so add ${diff} back: ${adjusted} + ${diff} = ${total}`;
                    q.answerType = 'number';

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Compensation Strategy</div>
                        <div style="font-size:1.3rem;margin:10px 0;">${a} - ${nearRound}</div>
                        <div style="background:var(--bg-card);padding:12px;border-radius:12px;margin:10px auto;max-width:320px;">
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Round ${nearRound} up to <span style="color:var(--accent-cyan);font-weight:700;">${roundTarget}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                ${a} - ${roundTarget} = <span style="color:var(--accent-orange);font-weight:700;">${adjusted}</span>
                            </div>
                            <div style="font-size:0.95rem;color:var(--text-dim);margin:5px 0;">
                                Add back ${diff}: ${adjusted} + ${diff}
                            </div>
                            <div style="font-size:1.2rem;margin:8px 0;">
                                = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = buildNumericOptions(total);
                    q.skillLabel = 'Compensation';
                    q.printFormat = 'compensation';
                }
            }

            return;
}

export function generateAlgebraQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Algebraic Thinking Category
            const algMax = Math.max(10, Math.min(range, 100));
            const algSkill = mappedSkill === "mixed" ? pick(["solve_eq_addsub", "solve_eq_multdiv", "solve_eq_twostep", "write_equation", "solve_unknown", "write_expression", "evaluate_expression", "evaluate_expression_hard", "inequalities", "tape_diagram", "multi_step_word"]) : mappedSkill;

            // ========================================
            // GRADE 6 — NUMBER SYSTEM (6.NS)
            // ========================================
            // O2 (2026-09-25): abs_value / opposite_numbers read the skill's own band (−N to N); unset,
            // they deal their old fixed spans (−15…15 to compare, −20…20 otherwise).
            const _intBand = (algSkill === 'abs_value' || algSkill === 'opposite_numbers') && state.skillOptions
                && typeof state.skillOptions.band === 'number' && state.skillOptions.band > 0 ? state.skillOptions.band : null;
            if (algSkill === "abs_value") {
                if (Math.random() < 0.35) {
                    // Compare absolute values variant
                    const cm = _intBand || 15;
                    let aAv = randInt(-cm, cm); if (aAv === 0) aAv = -Math.min(7, cm);
                    let bAv = randInt(-cm, cm); if (bAv === 0) bAv = Math.min(4, cm - 1);
                    while (Math.abs(aAv) === Math.abs(bAv)) { bAv = randInt(-cm, cm) || Math.min(5, cm - 2) || 1; }
                    const greater = Math.abs(aAv) > Math.abs(bAv) ? aAv : bAv;
                    q.text = `Which has the greater absolute value: ${aAv} or ${bAv}?`;
                    q.ans = String(greater);
                    q.options = [String(aAv), String(bAv)];
                    q.answerType = 'multiple-choice';
                    q.hint = `|${aAv}| = ${Math.abs(aAv)} and |${bAv}| = ${Math.abs(bAv)}. The greater absolute value is ${Math.abs(greater)}.`;
                    q.skillLabel = 'Absolute Value';
                    q.printFormat = 'compact';
                    return;
                }
                let nAv = randInt(-(_intBand || 20), _intBand || 20);
                if (nAv === 0) nAv = -Math.min(7, _intBand || 20);
                q.text = `What is |${nAv}|?`;
                q.ans = Math.abs(nAv);
                q.answerType = 'number';
                q.hint = `Absolute value is the distance from zero — always positive (or zero). |${nAv}| = ${Math.abs(nAv)}.`;
                q.skillLabel = 'Absolute Value';
                q.printFormat = 'compact';
                return;
            }

            if (algSkill === "opposite_numbers") {
                if (Math.random() < 0.4) {
                    // Distance-from-zero phrasing variant
                    let nOp = randInt(-(_intBand || 20), _intBand || 20);
                    if (nOp === 0) nOp = -Math.min(7, _intBand || 20);
                    q.text = `What number is the same distance from 0 as ${nOp} but on the other side of the number line?`;
                    q.ans = -nOp;
                    q.answerType = 'number';
                    q.hint = `The opposite of ${nOp} is ${-nOp} — same distance from 0, opposite sign.`;
                    q.skillLabel = 'Opposite Numbers';
                    q.printFormat = 'compact';
                    return;
                }
                let nOp = randInt(-(_intBand || 20), _intBand || 20);
                if (nOp === 0) nOp = Math.min(12, _intBand || 20);
                q.text = `What is the opposite of ${nOp}?`;
                q.ans = -nOp;
                q.answerType = 'number';
                q.hint = `The opposite of a number flips its sign. Opposite of ${nOp} is ${-nOp}.`;
                q.skillLabel = 'Opposite Numbers';
                q.printFormat = 'compact';
                return;
            }

            if (algSkill === "ordering_rationals") {
                // Build a small mix of rationals and present orderings as multiple choice
                const pool = [
                    { label: '-3/4', val: -0.75 },
                    { label: '-1/2', val: -0.5 },
                    { label: '-1/3', val: -1 / 3 },
                    { label: '-0.2', val: -0.2 },
                    { label: '0', val: 0 },
                    { label: '0.25', val: 0.25 },
                    { label: '1/3', val: 1 / 3 },
                    { label: '1/2', val: 0.5 },
                    { label: '0.6', val: 0.6 },
                    { label: '3/4', val: 0.75 },
                    { label: '-0.5', val: -0.5 },
                ];
                // Pick 4 distinct values
                const picked = [];
                const used = new Set();
                let safety = 0;
                while (picked.length < 4 && safety < 50) {
                    const cand = pool[randInt(0, pool.length - 1)];
                    if (!used.has(cand.val)) { used.add(cand.val); picked.push(cand); }
                    safety++;
                }
                const sortedAsc = [...picked].sort((a, b) => a.val - b.val);
                const correct = sortedAsc.map(x => x.label).join(', ');
                // Build 3 distractors by swapping pairs
                const distractors = new Set();
                let tries = 0;
                while (distractors.size < 3 && tries < 30) {
                    const arr = [...sortedAsc];
                    const i = randInt(0, 3); let j = randInt(0, 3);
                    if (j === i) j = (j + 1) % 4;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    const candStr = arr.map(x => x.label).join(', ');
                    if (candStr !== correct) distractors.add(candStr);
                    tries++;
                }
                // Always include reverse order
                const reverse = [...sortedAsc].reverse().map(x => x.label).join(', ');
                if (reverse !== correct) distractors.add(reverse);
                const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
                q.text = `Order from LEAST to GREATEST: ${picked.map(x => x.label).join(', ')}`;
                q.ans = correct;
                q.options = options;
                q.answerType = 'multiple-choice';
                q.hint = `Convert each value to a decimal to compare. Least → greatest: ${correct}.`;
                q.skillLabel = 'Order Rationals';
                q.printFormat = 'wide';
                return;
            }

            // ========================================
            // GRADE 6 — EXPRESSIONS & EQUATIONS (6.EE)
            // ========================================
            if (algSkill === "combine_like_terms") {
                if (Math.random() < 0.3) {
                    // Count x-terms variant
                    const aCt = randInt(2, 8);
                    const bCt = randInt(2, 8);
                    const cCt = randInt(2, 8);
                    q.text = `How many x-terms are in the expression: ${aCt}x + ${bCt}y + ${cCt}x ?`;
                    q.ans = 2;
                    q.answerType = 'number';
                    q.hint = `Count terms that contain the variable x. Here ${aCt}x and ${cCt}x both have x — that's 2.`;
                    q.skillLabel = 'Combine Like Terms';
                    q.printFormat = 'standard';
                    return;
                }
                // Simplify variant
                const a1 = randInt(2, 9);
                const a2 = randInt(2, 9);
                const c1 = randInt(1, 9);
                const xSum = a1 + a2;
                q.text = `Simplify: ${a1}x + ${c1} + ${a2}x`;
                const ansStr = `${xSum}x + ${c1}`;
                q.ans = ansStr;
                q.acceptedAnswers = [ansStr, `${xSum}x+${c1}`, `${c1} + ${xSum}x`, `${c1}+${xSum}x`];
                q.answerType = 'text';
                q.hint = `Combine the x-terms: ${a1}x + ${a2}x = ${xSum}x. The constant ${c1} stays. Answer: ${xSum}x + ${c1}.`;
                q.skillLabel = 'Combine Like Terms';
                q.printFormat = 'standard';
                return;
            }

            if (algSkill === "distributive_expr") {
                if (Math.random() < 0.4) {
                    // Factor out the GCF variant
                    const gcf = pick([2, 3, 4, 5]);
                    const inA = randInt(2, 6);
                    const inB = randInt(2, 6);
                    const aTotal = gcf * inA;
                    const bTotal = gcf * inB;
                    q.text = `Factor out the GCF: ${aTotal}x + ${bTotal}`;
                    const ansStr = `${gcf}(${inA}x + ${inB})`;
                    q.ans = ansStr;
                    q.acceptedAnswers = [ansStr, `${gcf}(${inA}x+${inB})`];
                    q.answerType = 'text';
                    q.hint = `GCF of ${aTotal} and ${bTotal} is ${gcf}. ${aTotal}x + ${bTotal} = ${gcf}(${inA}x + ${inB}).`;
                    q.skillLabel = 'Distributive Property';
                    q.printFormat = 'standard';
                    return;
                }
                // Apply distributive variant
                const aD = randInt(2, 9);
                const bD = randInt(2, 12);
                const op = pick(['+', '−']);
                const prod = aD * bD;
                if (op === '+') {
                    q.text = `Apply the distributive property: ${aD}(x + ${bD})`;
                    const ansStr = `${aD}x + ${prod}`;
                    q.ans = ansStr;
                    q.acceptedAnswers = [ansStr, `${aD}x+${prod}`];
                    q.hint = `Multiply ${aD} by each term: ${aD}·x = ${aD}x and ${aD}·${bD} = ${prod}. Answer: ${aD}x + ${prod}.`;
                } else {
                    q.text = `Apply the distributive property: ${aD}(x − ${bD})`;
                    const ansStr = `${aD}x − ${prod}`;
                    q.ans = ansStr;
                    q.acceptedAnswers = [ansStr, `${aD}x-${prod}`, `${aD}x − ${prod}`];
                    q.hint = `Multiply ${aD} by each term: ${aD}·x = ${aD}x and ${aD}·${bD} = ${prod}. Answer: ${aD}x − ${prod}.`;
                }
                q.answerType = 'text';
                q.skillLabel = 'Distributive Property';
                q.printFormat = 'standard';
                return;
            }

            // ========================================
            // BUILD EXPRESSION (drag tiles): build_expr_multdiv
            // Student reads a word problem and drags number/operator tiles
            // into 5 slots to construct: A op B = C
            // ========================================
            if (algSkill === "build_expr_multdiv") {
                const op = pick(['×', '÷']);
                const namesBE = ['Sara', 'Liam', 'Mia', 'Noah', 'Ava', 'James', 'Lily', 'Ben'];
                const itemsBE_mult = [
                    { plural: 'cookies', container: 'plate', verb: 'baked', cont_pl: 'plates' },
                    { plural: 'pencils', container: 'box', verb: 'packed', cont_pl: 'boxes' },
                    { plural: 'apples', container: 'basket', verb: 'put', cont_pl: 'baskets' },
                    { plural: 'crayons', container: 'pack', verb: 'has', cont_pl: 'packs' },
                    { plural: 'stickers', container: 'sheet', verb: 'collected', cont_pl: 'sheets' },
                    { plural: 'marbles', container: 'bag', verb: 'has', cont_pl: 'bags' },
                ];
                const itemsBE_div = [
                    { plural: 'cookies', container: 'plate', cont_pl: 'plates' },
                    { plural: 'pencils', container: 'box', cont_pl: 'boxes' },
                    { plural: 'apples', container: 'basket', cont_pl: 'baskets' },
                    { plural: 'crayons', container: 'pack', cont_pl: 'packs' },
                    { plural: 'students', container: 'group', cont_pl: 'groups' },
                    { plural: 'marbles', container: 'bag', cont_pl: 'bags' },
                ];
                const nameBE = pick(namesBE);
                let aBE, bBE, cBE;
                if (op === '×') {
                    const itemBE = pick(itemsBE_mult);
                    aBE = randInt(2, 10);   // groups
                    bBE = randInt(2, 10);   // per-group
                    cBE = aBE * bBE;
                    q.text = `${nameBE} ${itemBE.verb} ${aBE} ${itemBE.cont_pl} of ${itemBE.plural}. Each ${itemBE.container} has ${bBE} ${itemBE.plural}. How many ${itemBE.plural} in all? Build the expression.`;
                    q.hint = `${aBE} groups of ${bBE} = ${aBE} × ${bBE} = ${cBE}.`;
                } else {
                    const itemBE = pick(itemsBE_div);
                    bBE = randInt(2, 10);   // groups (divisor)
                    cBE = randInt(2, 10);   // per-group (quotient)
                    aBE = bBE * cBE;        // total (dividend) — clean integer division
                    q.text = `${nameBE} has ${aBE} ${itemBE.plural} to share equally among ${bBE} ${itemBE.cont_pl}. How many ${itemBE.plural} go in each ${itemBE.container}? Build the expression.`;
                    q.hint = `Share ${aBE} into ${bBE} equal groups: ${aBE} ÷ ${bBE} = ${cBE}.`;
                }
                const targetBE = [String(aBE), op, String(bBE), '=', String(cBE)];
                const distractorsBE = new Set();
                const altOpBE = op === '×' ? '÷' : '×';
                distractorsBE.add(altOpBE);
                while (distractorsBE.size < 4) {
                    const d = randInt(2, 50);
                    if (d !== aBE && d !== bBE && d !== cBE) distractorsBE.add(String(d));
                }
                const paletteBE = shuffle([...targetBE, ...distractorsBE]);
                q.targetExpression = targetBE;
                q.palette = paletteBE;
                q.ans = targetBE.join(' ');
                q.answerType = 'build-expr';
                q.printFormat = 'build-expr';
                q.skillLabel = 'Build Expression ×/÷';
                return;
            }

            if (algSkill === "equal_sign") {
                // Grade 1: Balance/true-false equations
                const eqMax = Math.max(5, Math.min(algMax, 20));
                // LRU rotation between true and false equations.
                const eqType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('equal_sign', ["true", "false"])
                    : pick(["true", "false"]);
                q._variant = eqType;

                let leftA, leftB, rightA, rightB, leftSum, rightSum;

                if (eqType === "true") {
                    // Make a true equation: left side = right side
                    leftA = rng(1, eqMax);
                    leftB = rng(1, eqMax);
                    leftSum = leftA + leftB;
                    // Find two numbers that add to the same sum
                    rightA = rng(1, leftSum - 1);
                    rightB = leftSum - rightA;
                    rightSum = leftSum;
                } else {
                    // Make a false equation: left side != right side
                    leftA = rng(1, eqMax);
                    leftB = rng(1, eqMax);
                    leftSum = leftA + leftB;
                    // Pick a different sum
                    const offset = pick([-2, -1, 1, 2, 3]);
                    rightSum = Math.max(2, leftSum + offset);
                    rightA = rng(1, Math.max(1, rightSum - 1));
                    rightB = rightSum - rightA;
                    if (rightB < 1) { rightB = 1; rightSum = rightA + rightB; }
                    // Ensure they're actually different
                    if (leftSum === rightSum) {
                        rightB += 1;
                        rightSum = rightA + rightB;
                    }
                }

                const isEqual = leftSum === rightSum;
                q.text = `Is ${leftA} + ${leftB} = ${rightA} + ${rightB} true or false?`;
                q.ans = isEqual ? "True" : "False";
                q.answerType = "multiple-choice";
                q.options = ["True", "False"];
                q.hint = `Add each side: ${leftA} + ${leftB} = ${leftSum} and ${rightA} + ${rightB} = ${rightSum}. Are they the same?`;
                q.skillLabel = 'Equal Sign';

                // Balance scale visual
                const diff = leftSum - rightSum;
                const tiltAngle = diff === 0 ? 0 : (diff > 0 ? 12 : -12);
                const beamColor = isEqual ? COLORS.correct : COLORS.fill[2];
                const leftPanColor = COLORS.fill[0];
                const rightPanColor = COLORS.fill[1];
                const leftY = isEqual ? 60 : (diff > 0 ? 70 : 50);
                const rightY = isEqual ? 60 : (diff > 0 ? 50 : 70);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Balance Scale</div>
                    <svg width="300" height="160" viewBox="0 0 300 160" style="max-width:100%;">
                        <!-- Fulcrum triangle -->
                        <polygon points="150,150 135,120 165,120" fill="var(--text-dim)" opacity="0.6"/>
                        <!-- Beam -->
                        <line x1="40" y1="${leftY}" x2="260" y2="${rightY}" stroke="${beamColor}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                        <!-- Left pan -->
                        <rect x="20" y="${leftY}" width="80" height="6" rx="3" fill="${leftPanColor}"/>
                        <text x="60" y="${leftY - 8}" text-anchor="middle" font-family='${FONTS.sans}' fill="${leftPanColor}" font-size="16" font-weight="bold">${leftA} + ${leftB}</text>
                        <text x="60" y="${leftY - 24}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-dim)" font-size="12">= ${leftSum}</text>
                        <!-- Right pan -->
                        <rect x="200" y="${rightY}" width="80" height="6" rx="3" fill="${rightPanColor}"/>
                        <text x="240" y="${rightY - 8}" text-anchor="middle" font-family='${FONTS.sans}' fill="${rightPanColor}" font-size="16" font-weight="bold">${rightA} + ${rightB}</text>
                        <text x="240" y="${rightY - 24}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-dim)" font-size="12">= ${rightSum}</text>
                        <!-- Center pivot -->
                        <circle cx="150" cy="120" r="6" fill="${beamColor}"/>
                        <!-- Status -->
                        <text x="150" y="15" text-anchor="middle" font-family='${FONTS.sans}' fill="${beamColor}" font-size="13" font-weight="bold">${isEqual ? 'Balanced!' : 'Not balanced!'}</text>
                    </svg>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_addsub" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — 4 candidate solution values, sort solution/not
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 2 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('solve_eq_addsub_a', ["plus", "minus"])
                    : pick(["plus", "minus"]);
                q._variant = ptype;
                const known = rng(2, Math.floor(eqMax / 2));
                const eqAnswer = rng(1, Math.floor(eqMax / 2));
                let eqText, eqHint;
                if (ptype === "plus") {
                    const total = eqAnswer + known;
                    eqText = `${varName} + ${known} = ${total}`;
                    eqHint = `Subtract ${known} from both sides to find ${varName}.`;
                } else {
                    const total = eqAnswer - known + 0;
                    // n - known = total → n = eqAnswer where eqAnswer > known
                    const safeAns = eqAnswer + known + 1;
                    const safeTotal = safeAns - known;
                    eqText = `${varName} − ${known} = ${safeTotal}`;
                    eqHint = `Add ${known} to both sides to find ${varName}.`;
                    // Recompute eqAnswer
                    var eqAns2 = safeAns;
                }
                const correctVal = ptype === "plus" ? eqAnswer : eqAns2;
                const candidates = new Set([correctVal]);
                let safety = 0;
                while (candidates.size < 4 && safety < 50) {
                    safety++;
                    const v = correctVal + pick([-3, -2, -1, 1, 2, 3]);
                    if (v >= 0 && v !== correctVal) candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: `${varName} = ${v}` }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = v === correctVal ? 'binYes' : 'binNo'; });
                q.text = `Equation: ${eqText}. Drag each candidate value into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binYes', label: 'Solution' },
                    { id: 'binNo', label: 'Not a solution' }
                ];
                q.hint = eqHint;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Solve +/−';
                return;
            } else if (algSkill === "solve_eq_addsub") {
                // Grade 5: One-step addition/subtraction equations
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 4 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('solve_eq_addsub_b', ["var_plus", "var_minus", "reversed", "qmark"])
                    : pick(["var_plus", "var_minus", "reversed", "qmark"]);
                q._variant = ptype;

                let leftSide, rightSide, eqAnswer, eqHint;

                if (ptype === "var_plus") {
                    // x + 7 = 15
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `${varName} + ${known}`;
                    rightSide = `${total}`;
                    eqHint = `Subtract ${known} from both sides.`;
                } else if (ptype === "var_minus") {
                    // n - 3 = 12
                    const known = rng(2, Math.floor(eqMax / 3));
                    eqAnswer = rng(known + 1, eqMax);
                    const total = eqAnswer - known;
                    leftSide = `${varName} \u2212 ${known}`;
                    rightSide = `${total}`;
                    eqHint = `Add ${known} to both sides.`;
                } else if (ptype === "reversed") {
                    // 15 = x + 8
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `${total}`;
                    rightSide = `${varName} + ${known}`;
                    eqHint = `Subtract ${known} from both sides.`;
                } else {
                    // ? + 6 = 14
                    const known = rng(2, Math.floor(eqMax / 2));
                    eqAnswer = rng(1, Math.floor(eqMax / 2));
                    const total = eqAnswer + known;
                    leftSide = `? + ${known}`;
                    rightSide = `${total}`;
                    eqHint = `Subtract ${known} from both sides.`;
                }

                q.text = `Solve: ${leftSide} = ${rightSide}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-solve";
                q.skillLabel = "Solve +/\u2212";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Solve the Equation</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${leftSide}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${rightSide}</div>
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);">Use inverse operations: + undoes \u2212, \u2212 undoes +</div>
                    </div>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_multdiv" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — 4 candidate solution values, sort solution/not
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 2 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('solve_eq_multdiv_a', ["coeff", "div"])
                    : pick(["coeff", "div"]);
                q._variant = ptype;
                let eqText, correctVal, eqHint;
                if (ptype === "coeff") {
                    const coeff = rng(2, 9);
                    correctVal = rng(2, Math.max(2, Math.floor(eqMax / coeff)));
                    const total = coeff * correctVal;
                    eqText = `${coeff}${varName} = ${total}`;
                    eqHint = `Divide both sides by ${coeff} to find ${varName}.`;
                } else {
                    const divisor = rng(2, 8);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    correctVal = divisor * quotient;
                    eqText = `${varName} ÷ ${divisor} = ${quotient}`;
                    eqHint = `Multiply both sides by ${divisor} to find ${varName}.`;
                }
                const candidates = new Set([correctVal]);
                let safety = 0;
                while (candidates.size < 4 && safety < 50) {
                    safety++;
                    const v = correctVal + pick([-4, -2, -1, 1, 2, 4, correctVal]);
                    if (v > 0 && v !== correctVal) candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: `${varName} = ${v}` }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = v === correctVal ? 'binYes' : 'binNo'; });
                q.text = `Equation: ${eqText}. Drag each candidate value into the correct bin.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binYes', label: 'Solution' },
                    { id: 'binNo', label: 'Not a solution' }
                ];
                q.hint = eqHint;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Solve ×/÷';
                return;
            } else if (algSkill === "solve_eq_multdiv") {
                // Grade 5: One-step multiplication/division equations
                const varName = pick(['x', 'n', 'y', 'a']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 4 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('solve_eq_multdiv_b', ["coeff_var", "var_div", "times_var", "qmark_div"])
                    : pick(["coeff_var", "var_div", "times_var", "qmark_div"]);
                q._variant = ptype;

                let leftSide, rightSide, eqAnswer, eqHint;

                if (ptype === "coeff_var") {
                    // 4x = 28
                    const coeff = rng(2, 10);
                    eqAnswer = rng(2, Math.floor(eqMax / coeff));
                    const total = coeff * eqAnswer;
                    leftSide = `${coeff}${varName}`;
                    rightSide = `${total}`;
                    eqHint = `Divide both sides by ${coeff}.`;
                } else if (ptype === "var_div") {
                    // n / 6 = 5
                    const divisor = rng(2, 8);
                    eqAnswer = divisor * rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    const quotient = eqAnswer / divisor;
                    leftSide = `${varName} \u00f7 ${divisor}`;
                    rightSide = `${quotient}`;
                    eqHint = `Multiply both sides by ${divisor}.`;
                } else if (ptype === "times_var") {
                    // 3 * n = 21
                    const coeff = rng(2, 9);
                    eqAnswer = rng(2, Math.floor(eqMax / coeff));
                    const total = coeff * eqAnswer;
                    leftSide = `${coeff} \u00d7 ${varName}`;
                    rightSide = `${total}`;
                    eqHint = `Divide both sides by ${coeff}.`;
                } else {
                    // ? / 4 = 7
                    const divisor = rng(2, 8);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    eqAnswer = divisor * quotient;
                    leftSide = `? \u00f7 ${divisor}`;
                    rightSide = `${quotient}`;
                    eqHint = `Multiply both sides by ${divisor}.`;
                }

                q.text = `Solve: ${leftSide} = ${rightSide}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-solve";
                q.skillLabel = "Solve \u00d7/\u00f7";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Solve the Equation</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-green);">
                            <div style="font-size:1.5rem;font-weight:700;">${leftSide}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-green);">
                            <div style="font-size:1.5rem;font-weight:700;">${rightSide}</div>
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:10px;background:rgba(46,204,113,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);">Use inverse operations: \u00d7 undoes \u00f7, \u00f7 undoes \u00d7</div>
                    </div>
                </div>`;
                return;
            } else if (algSkill === "solve_eq_twostep") {
                // Grade 6: Two-step equations
                const varName = pick(['x', 'n', 'y']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 4 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('solve_eq_twostep', ["ax_plus_b", "paren_div", "ax_minus_b", "var_div_plus"])
                    : pick(["ax_plus_b", "paren_div", "ax_minus_b", "var_div_plus"]);
                q._variant = ptype;

                let eqDisplay, eqAnswer, eqHint, step1Desc, step2Desc;

                if (ptype === "ax_plus_b") {
                    // 2x + 3 = 11
                    const a = rng(2, 6);
                    eqAnswer = rng(2, Math.max(2, Math.floor(eqMax / a)));
                    const b = rng(1, 12);
                    const total = a * eqAnswer + b;
                    eqDisplay = `${a}${varName} + ${b} = ${total}`;
                    step1Desc = `Subtract ${b} from both sides.`;
                    step2Desc = `Divide both sides by ${a}.`;
                    eqHint = `Step 1: ${step1Desc} Step 2: ${step2Desc}`;
                } else if (ptype === "paren_div") {
                    // (n - 4) / 2 = 5
                    const divisor = rng(2, 5);
                    const quotient = rng(2, Math.max(2, Math.floor(eqMax / divisor)));
                    const b = rng(1, 10);
                    eqAnswer = divisor * quotient + b;
                    eqDisplay = `(${varName} \u2212 ${b}) \u00f7 ${divisor} = ${quotient}`;
                    step1Desc = `Multiply both sides by ${divisor}.`;
                    step2Desc = `Add ${b} to both sides.`;
                    eqHint = `Step 1: ${step1Desc} Step 2: ${step2Desc}`;
                } else if (ptype === "ax_minus_b") {
                    // 3n - 7 = 14
                    const a = rng(2, 6);
                    eqAnswer = rng(3, Math.max(3, Math.floor(eqMax / a)));
                    const b = rng(1, Math.min(a * eqAnswer - 1, 12));
                    const total = a * eqAnswer - b;
                    eqDisplay = `${a}${varName} \u2212 ${b} = ${total}`;
                    step1Desc = `Add ${b} to both sides.`;
                    step2Desc = `Divide both sides by ${a}.`;
                    eqHint = `Step 1: ${step1Desc} Step 2: ${step2Desc}`;
                } else {
                    // n/4 + 5 = 8
                    const divisor = rng(2, 6);
                    const b = rng(2, 10);
                    const total = rng(b + 2, Math.max(b + 2, Math.floor(eqMax / 2)));
                    const leftover = total - b;
                    eqAnswer = leftover * divisor;
                    eqDisplay = `${varName} \u00f7 ${divisor} + ${b} = ${total}`;
                    step1Desc = `Subtract ${b} from both sides.`;
                    step2Desc = `Multiply both sides by ${divisor}.`;
                    eqHint = `Step 1: ${step1Desc} Step 2: ${step2Desc}`;
                }

                q.text = `Solve: ${eqDisplay}`;
                q.ans = eqAnswer;
                q.hint = eqHint;
                q.options = buildNumericOptions(eqAnswer);
                q.printFormat = "algebra-twostep";
                q.skillLabel = "Two-Step Eq";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Two-Step Equation</div>
                    <div style="background:var(--bg-card);padding:20px 35px;border-radius:12px;border:3px solid var(--accent-orange);display:inline-block;margin:15px 0;">
                        <div style="font-size:1.6rem;font-weight:700;">${eqDisplay}</div>
                    </div>
                    <div style="max-width:300px;margin:15px auto;text-align:left;">
                        <div style="background:rgba(52,152,219,0.1);padding:12px;border-radius:8px;margin-bottom:8px;">
                            <div style="font-weight:700;color:var(--accent-cyan);font-size:0.9rem;">Step 1: Undo + or \u2212</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:4px;">${step1Desc}</div>
                        </div>
                        <div style="background:rgba(46,204,113,0.1);padding:12px;border-radius:8px;">
                            <div style="font-weight:700;color:var(--accent-green);font-size:0.9rem;">Step 2: Undo \u00d7 or \u00f7</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:4px;">${step2Desc}</div>
                        </div>
                    </div>
                    <div style="font-size:1.3rem;margin-top:10px;">${varName} = <span style="border-bottom:3px solid var(--accent-green);padding:0 20px;font-weight:700;">?</span></div>
                </div>`;
                return;
            } else if (algSkill === "write_equation") {
                // Grade 6: Translate word problems into equations
                const varName = pick(['x', 'n', 'y']);
                const eqMax = Math.max(5, Math.min(algMax, 50));
                // LRU rotation across 4 ptype variants.
                const ptype = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('write_equation', ["number_plus", "twice_minus", "story_give", "story_earn"])
                    : pick(["number_plus", "twice_minus", "story_give", "story_earn"]);
                q._variant = ptype;

                let wordProblem, eqAnswer, eqHint;

                if (ptype === "number_plus") {
                    // "A number plus 7 equals 15. Write the equation."
                    const num = rng(2, Math.floor(eqMax / 2));
                    const total = rng(num + 2, eqMax);
                    wordProblem = `A number plus ${num} equals ${total}. Write the equation.`;
                    eqAnswer = `${varName} + ${num} = ${total}`;
                    eqHint = `"A number" becomes ${varName}. "Plus" becomes +. "Equals" becomes =. So: ${varName} + ${num} = ${total}`;
                } else if (ptype === "twice_minus") {
                    // "Twice a number minus 3 is 11. What is the equation?"
                    const sub = rng(1, 8);
                    const result = rng(3, eqMax);
                    wordProblem = `Twice a number minus ${sub} is ${result}. What is the equation?`;
                    eqAnswer = `2${varName} - ${sub} = ${result}`;
                    eqHint = `"Twice a number" becomes 2${varName}. "Minus" becomes \u2212. "Is" becomes =. So: 2${varName} \u2212 ${sub} = ${result}`;
                } else if (ptype === "story_give") {
                    // "Sam has x stickers. After giving away 5, he has 12 left."
                    const names = ["Sam", "Mia", "Leo", "Ava", "Kai"];
                    const items = ["stickers", "marbles", "cards", "coins", "books"];
                    const name = pick(names);
                    const item = pick(items);
                    const gave = rng(2, Math.floor(eqMax / 3));
                    const left = rng(2, Math.floor(eqMax / 2));
                    wordProblem = `${name} has ${varName} ${item}. After giving away ${gave}, he has ${left} left. Write the equation.`;
                    eqAnswer = `${varName} - ${gave} = ${left}`;
                    eqHint = `Starts with ${varName}, gives away ${gave} (subtract), has ${left} left (equals). So: ${varName} \u2212 ${gave} = ${left}`;
                } else {
                    // "Zoe earns $8 per hour. After h hours, she has $56."
                    const names = ["Zoe", "Ben", "Lily", "Max", "Emma"];
                    const name = pick(names);
                    const rate = pick([3, 4, 5, 6, 7, 8, 9, 10]);
                    const hours = rng(2, Math.max(2, Math.floor(eqMax / rate)));
                    const total = rate * hours;
                    wordProblem = `${name} earns $${rate} per hour. After ${varName} hours, she has $${total}. Write the equation.`;
                    eqAnswer = `${rate}${varName} = ${total}`;
                    eqHint = `$${rate} per hour for ${varName} hours is ${rate} \u00d7 ${varName}. Total is $${total}. So: ${rate}${varName} = ${total}`;
                }

                q.text = wordProblem;
                q.ans = eqAnswer;
                q.answerType = "text";
                q.hint = eqHint;
                q.printFormat = "algebra-write-eq";
                q.skillLabel = "Write Equation";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Write an Equation</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;border:2px solid var(--accent-cyan);max-width:320px;margin:15px auto;">
                        <div style="font-size:1.05rem;line-height:1.5;">${wordProblem}</div>
                    </div>
                    <div style="margin:20px 0;padding:12px;background:rgba(155,89,182,0.1);border-radius:8px;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);line-height:1.4;">
                            <strong>Key words:</strong><br/>
                            "plus/more/earns" = + | "minus/gave/lost" = \u2212<br/>
                            "times/per/each" = \u00d7 | "equals/is/left" = =
                        </div>
                    </div>
                    <div style="font-size:1.2rem;margin-top:15px;">Equation: <span style="border-bottom:2px solid var(--accent-green);padding:0 30px;min-width:120px;display:inline-block;">&nbsp;</span></div>
                </div>`;
                return;
            } else if (algSkill === "balance_addsub") {
                // MAP-style "Balance the equation" — make both sides equal.
                // RIT 191-210; IXL skills 7PE/MD8/8VK. The student fills in the
                // missing number on one side so left-sum equals right-sum.
                const balMax = Math.max(10, Math.min(algMax, 100));
                const variant = pick(["plus_plus", "plus_minus", "minus_plus"]);
                let leftA, leftB, rightA, rightB, target, blank, hintMsg;
                if (variant === "plus_plus") {
                    // 7 + 5 = ___ + 3   (find missing addend on right)
                    leftA = rng(2, balMax - 1);
                    leftB = rng(2, balMax - 1);
                    target = leftA + leftB;
                    rightB = rng(1, target - 1);
                    rightA = target - rightB;
                    blank = rightA;
                    q.text = `Make both sides equal: ${leftA} + ${leftB} = ___ + ${rightB}`;
                    hintMsg = `Left side: ${leftA} + ${leftB} = ${target}. Find the number that, plus ${rightB}, also equals ${target}.`;
                } else if (variant === "plus_minus") {
                    // ___ + 4 = 12 - 3   (find missing addend on left)
                    rightA = rng(5, balMax);
                    rightB = rng(1, rightA - 1);
                    target = rightA - rightB;
                    leftB = rng(1, target - 1);
                    leftA = target - leftB;
                    blank = leftA;
                    q.text = `Make both sides equal: ___ + ${leftB} = ${rightA} − ${rightB}`;
                    hintMsg = `Right side: ${rightA} − ${rightB} = ${target}. Find the number that, plus ${leftB}, also equals ${target}.`;
                } else {
                    // 9 - ___ = 2 + 1   (find missing subtrahend on left)
                    rightA = rng(1, Math.floor(balMax / 2));
                    rightB = rng(1, Math.floor(balMax / 2));
                    target = rightA + rightB;
                    leftA = rng(target + 1, Math.max(target + 2, balMax));
                    blank = leftA - target;
                    q.text = `Make both sides equal: ${leftA} − ___ = ${rightA} + ${rightB}`;
                    hintMsg = `Right side: ${rightA} + ${rightB} = ${target}. Find the number that, when subtracted from ${leftA}, also equals ${target}.`;
                }
                q.ans = blank;
                q.hint = hintMsg;
                q.options = buildNumericOptions(blank);
                q.skillLabel = 'Balance Equation';
                // Use generic word-problem print format. algebra-solve requires
                // an algebraData payload with a different shape.
                q.printFormat = 'word-problem';
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.05rem;">Balance the Equation</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:14px;margin:14px 0;font-size:1.4rem;font-weight:700;">
                        <span style="background:var(--bg-card);padding:10px 18px;border-radius:10px;border:2px solid var(--accent-cyan);">${q.text.split(':')[1].split('=')[0].trim()}</span>
                        <span style="font-size:1.6rem;">=</span>
                        <span style="background:var(--bg-card);padding:10px 18px;border-radius:10px;border:2px solid var(--accent-orange);">${q.text.split('=')[1].trim()}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:8px;">Both sides must have the same total.</div>
                </div>`;
                return;
            } else if (algSkill === "solve_unknown" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL values of x that satisfy x + 5 = 12"
                const opSU = pick(['+', '−']);
                const knownSU = rng(2, 12);
                const correctX = rng(1, 12);
                let totalSU, eqText;
                if (opSU === '+') {
                    totalSU = correctX + knownSU;
                    eqText = `x + ${knownSU} = ${totalSU}`;
                } else {
                    totalSU = correctX - knownSU;
                    if (totalSU <= 0) { totalSU = 1; }
                    const correctXAdj = totalSU + knownSU;
                    eqText = `x − ${knownSU} = ${totalSU}`;
                    // Use correctXAdj as the truth
                    var correctXFinal = correctXAdj;
                }
                const trueX = opSU === '+' ? correctX : correctXFinal;
                // Generate 1-2 true Xs (only one mathematically valid; allow MSC to have only 1 correct)
                const correctCount = 1;
                const optsSet = new Set([trueX]);
                while (optsSet.size < 5) {
                    const v = trueX + pick([-3, -2, -1, 1, 2, 3, 5]);
                    if (v > 0 && v !== trueX) optsSet.add(v);
                }
                const valuesSU = shuffle(Array.from(optsSet));
                const options = valuesSU.map((v, i) => ({
                    id: 'opt' + i,
                    label: `x = ${v}`,
                    correct: v === trueX
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL values of x that satisfy ${eqText}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Substitute each value into ${eqText}. Pick the one(s) that make the equation true.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Solve Unknown';
                return;
            } else if (algSkill === "solve_unknown") {
                // Solve for unknown (x + 5 = 12)
                const ops = ['+', '-', '\u00d7'];
                const op = pick(ops);
                let answer, known, total;
                const solveMax = Math.max(5, Math.floor(algMax / 2));
                const useDecAlg = state.decimalPlaces > 0 && op !== '\u00d7';

                if (op === '+') {
                    answer = rng(1, solveMax);
                    known = rng(1, solveMax);
                    if (useDecAlg) { answer = applyDecimals(answer); known = applyDecimals(known); }
                    total = useDecAlg ? parseFloat((answer + known).toFixed(state.decimalPlaces)) : answer + known;
                    q.text = `Solve: x + ${known} = ${total}`;
                    q.hint = `To isolate x, subtract ${known} from both sides!`;
                } else if (op === '-') {
                    answer = rng(5, Math.max(5, solveMax));
                    known = rng(1, answer - 1);
                    if (useDecAlg) { answer = applyDecimals(answer); known = applyDecimals(Math.floor(known)); if (known >= answer) known = parseFloat((answer - 0.1).toFixed(state.decimalPlaces)); }
                    total = useDecAlg ? parseFloat((answer - known).toFixed(state.decimalPlaces)) : answer - known;
                    q.text = `Solve: x \u2212 ${known} = ${total}`;
                    q.hint = `To isolate x, add ${known} to both sides!`;
                } else {
                    answer = rng(2, 12);
                    known = rng(2, 10);
                    total = answer * known;
                    q.text = `Solve: ${known}x = ${total}`;
                    q.hint = `To isolate x, divide both sides by ${known}!`;
                }

                q.ans = answer;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Solve for Unknown</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${op === '\u00d7' ? known + 'x' : 'x ' + (op === '-' ? '\u2212' : '+') + ' ' + known}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${total}</div>
                        </div>
                    </div>
                    <div style="font-size:1.3rem;margin-top:15px;">x = <span style="border-bottom:3px solid var(--accent-green);padding:0 20px;font-weight:700;">?</span></div>
                </div>`;
                q.options = buildNumericOptions(answer);
                q.algebraData = { op, answer, known, total };
                q.printFormat = "algebra-solve";
            } else if (algSkill === "write_expression" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL expressions that match: '<phrase>'"
                const phrasesWE = [
                    { phrase: 'three more than n', correct: ['n + 3', '3 + n'], wrong: ['3 − n', '3n', 'n − 3', 'n × 3'] },
                    { phrase: 'five less than x', correct: ['x − 5'], wrong: ['5 − x', '5 + x', 'x + 5', '5x', '5 × x'] },
                    { phrase: 'twice a number n', correct: ['2n', '2 × n', 'n + n'], wrong: ['n + 2', 'n²', 'n − 2', 'n ÷ 2'] },
                    { phrase: 'a number n divided by 4', correct: ['n ÷ 4', 'n / 4'], wrong: ['4 ÷ n', 'n × 4', 'n − 4', 'n + 4'] },
                    { phrase: 'the sum of n and 7', correct: ['n + 7', '7 + n'], wrong: ['n − 7', 'n × 7', '7 − n', '7n'] },
                    { phrase: 'a number n squared', correct: ['n²', 'n × n'], wrong: ['2n', 'n + 2', 'n + n', 'n / 2'] }
                ];
                const pWE = pick(phrasesWE);
                const correctCount = Math.min(pWE.correct.length, rng(1, pWE.correct.length));
                const correctPick = shuffle([...pWE.correct]).slice(0, correctCount);
                const wrongPick = shuffle([...pWE.wrong]).slice(0, Math.min(3, 5 - correctPick.length));
                const all = shuffle([
                    ...correctPick.map(s => ({ label: s, correct: true })),
                    ...wrongPick.map(s => ({ label: s, correct: false }))
                ]);
                const options = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions that match: "${pWE.phrase}".`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Read the words carefully: "more than" = +, "less than" = −, "times/twice" = ×, "divided by" = ÷, "squared" = ².`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Write Expression';
                return;
            } else if (algSkill === "write_expression") {
                // Write expressions from words
                const templates = [
                    { words: "the sum of a number and", op: '+', phrase: 'n + ' },
                    { words: "a number plus", op: '+', phrase: 'n + ' },
                    { words: "the difference of a number and", op: '-', phrase: 'n \u2212 ' },
                    { words: "a number minus", op: '-', phrase: 'n \u2212 ' },
                    { words: "the product of a number and", op: '\u00d7', phrase: 'n \u00d7 ' },
                    { words: "a number times", op: '\u00d7', phrase: 'n \u00d7 ' },
                    { words: "a number divided by", op: '\u00f7', phrase: 'n \u00f7 ' },
                ];
                const template = pick(templates);
                const exprMax = Math.max(5, Math.min(algMax, 50));
                const num = rng(2, exprMax);

                q.text = `Write an expression: "${template.words} ${num}"`;
                q.ans = template.phrase + num;
                q.answerType = "text";
                q.hint = `"Sum" means +, "difference" means \u2212, "product" means \u00d7, "quotient" means \u00f7`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Write an Expression</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-size:1.1rem;font-style:italic;color:var(--text-dim);">"${template.words} ${num}"</div>
                    </div>
                    <div style="margin:20px 0;font-size:0.9rem;">
                        <div style="display:inline-block;background:rgba(52,152,219,0.15);padding:10px 15px;border-radius:8px;margin:5px;">
                            <strong>Key Words:</strong><br/>
                            sum/plus = + | difference/minus = \u2212<br/>
                            product/times = \u00d7 | quotient/divided = \u00f7
                        </div>
                    </div>
                    <div style="font-size:1.2rem;margin-top:15px;">Expression: <span style="border-bottom:2px solid var(--accent-green);padding:0 30px;min-width:80px;display:inline-block;">&nbsp;</span></div>
                </div>`;
                q.algebraData = { template: template.words, num, answer: template.phrase + num };
                q.printFormat = "algebra-write";
            } else if (algSkill === "evaluate_expression" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — "Click ALL expressions that equal N"
                // Pick a target value and generate expressions that compute to it.
                const target = rng(8, 24);
                const correctMakers = [
                    () => `${target} + 0`,
                    () => `${target - 1} + 1`,
                    () => `${target + 2} − 2`,
                    () => `${target * 2} ÷ 2`,
                    () => `${target} × 1`,
                    () => `${Math.max(1, target - 3)} + 3`,
                ];
                const correctSet = new Set();
                while (correctSet.size < 3) {
                    const maker = pick(correctMakers);
                    const v = maker();
                    correctSet.add(v);
                }
                const correctList = Array.from(correctSet).slice(0, rng(2, 3));
                const wrongMakers = [
                    () => `${target + 1} + 1`,
                    () => `${target} − 1`,
                    () => `${target} + 2`,
                    () => `${target} × 2`,
                    () => `${target + 3} − 1`,
                    () => `${Math.max(2, target - 2)} + 1`
                ];
                const wrongSet = new Set();
                while (wrongSet.size < 5) wrongSet.add(pick(wrongMakers)());
                const wrongList = Array.from(wrongSet).slice(0, 5 - correctList.length);
                const all = shuffle([
                    ...correctList.map(s => ({ label: s, correct: true })),
                    ...wrongList.map(s => ({ label: s, correct: false }))
                ]);
                const options = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions that equal ${target}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Compute each expression. Pick every one that equals ${target}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Evaluate';
                return;
            } else if (algSkill === "evaluate_expression") {
                // Evaluate expressions with variables — varied variable names, ops including ÷ and exponents
                const evalMax = Math.max(5, Math.min(algMax, 30));
                const varName = pick(['x', 'n', 'p', 'r', 'a', 'k', 'm']);
                let varVal = rng(2, evalMax);
                // Weighted pattern selection: simple ops 60%, exponents 20%, division 20%
                const patternType = pick(["simple", "simple", "simple", "exponent", "division"]);
                let expression, result, stepText;

                if (patternType === "exponent") {
                    // p² or p³
                    varVal = rng(2, 10);
                    const exp = pick([2, 2, 3]);
                    if (exp === 2) {
                        expression = `${varName}\u00b2`;
                        result = varVal * varVal;
                        stepText = `${varVal}\u00b2 = ${varVal} \u00d7 ${varVal} = ${result}`;
                    } else {
                        varVal = rng(2, 5);
                        expression = `${varName}\u00b3`;
                        result = varVal * varVal * varVal;
                        stepText = `${varVal}\u00b3 = ${varVal} \u00d7 ${varVal} \u00d7 ${varVal} = ${result}`;
                    }
                } else if (patternType === "division") {
                    // a ÷ n or n ÷ a (ensure clean division)
                    const divisor = rng(2, 8);
                    varVal = divisor * rng(2, 8);
                    const flip = pick([true, false]);
                    if (flip) {
                        expression = `${varName} \u00f7 ${divisor}`;
                        result = varVal / divisor;
                        stepText = `${varVal} \u00f7 ${divisor} = ${result}`;
                    } else {
                        const dividend = varVal * rng(2, 6);
                        expression = `${dividend} \u00f7 ${varName}`;
                        result = dividend / varVal;
                        stepText = `${dividend} \u00f7 ${varVal} = ${result}`;
                    }
                } else {
                    // Simple: + − × with varied variable position
                    const ops = ['+', '-', '\u00d7'];
                    const op = pick(ops);
                    let num = rng(1, Math.min(evalMax, 12));
                    const useDecEval = state.decimalPlaces > 0 && op !== '\u00d7';
                    if (useDecEval) { varVal = applyDecimals(varVal); num = applyDecimals(num); }
                    const flip = pick([true, false]);
                    if (op === '+') {
                        expression = flip ? `${varName} + ${num}` : `${num} + ${varName}`;
                        result = useDecEval ? parseFloat((varVal + num).toFixed(state.decimalPlaces)) : varVal + num;
                        stepText = `${varVal} + ${num} = ${result}`;
                    } else if (op === '-') {
                        if (flip) {
                            expression = `${varName} \u2212 ${num}`;
                            result = useDecEval ? parseFloat((varVal - num).toFixed(state.decimalPlaces)) : varVal - num;
                            stepText = `${varVal} \u2212 ${num} = ${result}`;
                        } else {
                            expression = `${num + varVal} \u2212 ${varName}`;
                            result = num;
                            stepText = `${num + varVal} \u2212 ${varVal} = ${result}`;
                        }
                    } else {
                        const coeffStyle = pick([true, false]); // 3n vs n × 3
                        if (coeffStyle) {
                            expression = `${num}${varName}`;
                            stepText = `${num} \u00d7 ${varVal} = ${num * varVal}`;
                        } else {
                            expression = `${varName} \u00d7 ${num}`;
                            stepText = `${varVal} \u00d7 ${num} = ${num * varVal}`;
                        }
                        result = varVal * num;
                    }
                }

                q.text = `Evaluate ${expression} at ${varName} = ${varVal}`;
                q.ans = result;
                q.hint = `Substitute ${varVal} for ${varName}, then calculate!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Evaluate Expression</div>
                    <div style="font-size:1.4rem;margin:15px 0;">
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-cyan);">${expression}</span>
                        <span style="margin:0 10px;">at</span>
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-orange);">${varName} = ${varVal}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:20px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Step 1: Substitute</div>
                        <div style="font-size:1.2rem;">${expression.replace(new RegExp(varName, 'g'), `<span style="color:var(--accent-orange);font-weight:700;">${varVal}</span>`)}</div>
                        <div style="font-weight:600;color:var(--accent-cyan);margin-top:10px;margin-bottom:8px;">Step 2: Calculate</div>
                        <div style="font-size:1.2rem;">= <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.algebraData = { expression, varName, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "evaluate_expression_hard" && Math.random() < 0.25) {
                // Phase 4.5 batch 10: multi-select-check variant — harder MSC: "Click ALL expressions equal to N"
                const target = rng(15, 45);
                // Build several harder-style expressions that evaluate to target
                const a1 = rng(2, 6); const b1 = target - a1 * a1; // a² + b
                const a2 = rng(2, 5); const c2 = target / a2; const safe2 = Math.floor(c2) === c2 && c2 > 0;
                const a3 = rng(2, 5); const b3 = target - 2 * a3; // 2a + b
                const correctList = [];
                correctList.push(`${a1}² + ${b1}`);
                if (safe2) correctList.push(`${a2} × ${c2}`);
                correctList.push(`(${target / 2}) × 2`);
                correctList.push(`${target + 5} − 5`);
                if (b3 >= 0) correctList.push(`2 × ${a3} + ${b3}`);
                const correctPick = shuffle(correctList).slice(0, rng(2, 3));
                const wrongList = [
                    `${a1}² + ${b1 + 2}`,
                    `${target} + 3`,
                    `${target} ÷ 2`,
                    `${target + 2} − 5`,
                    `${a1 + 1}² − ${a1}`,
                    `${target} × 2`
                ];
                const wrongPick = shuffle(wrongList).slice(0, Math.max(2, 5 - correctPick.length));
                const all = shuffle([
                    ...correctPick.map(s => ({ label: s, correct: true })),
                    ...wrongPick.map(s => ({ label: s, correct: false }))
                ]);
                const options = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions that equal ${target}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Compute carefully — follow order of operations (PEMDAS). Pick every expression that equals ${target}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Evaluate (Hard)';
                // Calculator allowed: this MSC variant mixes exponent expressions
                // (e.g., 6² + 19) with multi-step arithmetic across 5+ options.
                q.calculatorAllowed = true;
                return;
            } else if (algSkill === "evaluate_expression_hard") {
                // Multi-step evaluate: compound expressions with parens, exponents, negatives
                // e.g., (y+2)² at y=−4, 25/(r−4) at r=9, 4v−3 at v=−5, m(m+2) at m=2
                const varName = pick(['x', 'y', 'r', 'v', 'm', 'a', 'k']);
                const pattern = pick(["coeff_sub", "var_squared_plus", "paren_squared", "frac_expr", "var_times_expr", "two_step"]);
                let expression, result, varVal, stepText;

                if (pattern === "coeff_sub") {
                    // av − b at v = c (or v = −c)
                    const a = rng(2, 8);
                    const b = rng(1, 15);
                    const useNeg = pick([true, false]);
                    varVal = useNeg ? -rng(1, 8) : rng(2, 12);
                    expression = `${a}${varName} \u2212 ${b}`;
                    result = a * varVal - b;
                    stepText = `${a}(${varVal}) \u2212 ${b} = ${a * varVal} \u2212 ${b} = ${result}`;
                } else if (pattern === "var_squared_plus") {
                    // x² + b at x = c
                    varVal = rng(2, 10);
                    const b = rng(1, 20);
                    expression = `${varName}\u00b2 + ${b}`;
                    result = varVal * varVal + b;
                    stepText = `(${varVal})\u00b2 + ${b} = ${varVal * varVal} + ${b} = ${result}`;
                } else if (pattern === "paren_squared") {
                    // (y + a)² at y = b (can be negative)
                    const a = rng(1, 6);
                    const useNeg = pick([true, false]);
                    varVal = useNeg ? -rng(1, 6) : rng(1, 8);
                    const inner = varVal + a;
                    expression = `(${varName} + ${a})\u00b2`;
                    result = inner * inner;
                    stepText = `(${varVal} + ${a})\u00b2 = (${inner})\u00b2 = ${inner} \u00d7 ${inner} = ${result}`;
                } else if (pattern === "frac_expr") {
                    // a/(r − b) at r = c — ensure clean division, no division by zero
                    const b = rng(1, 8);
                    varVal = rng(b + 2, b + 10); // ensure r-b > 0
                    const denom = varVal - b;
                    const mult = rng(2, 8);
                    const a = denom * mult; // ensure clean division
                    expression = `${a} \u00f7 (${varName} \u2212 ${b})`;
                    result = a / denom;
                    stepText = `${a} \u00f7 (${varVal} \u2212 ${b}) = ${a} \u00f7 ${denom} = ${result}`;
                } else if (pattern === "var_times_expr") {
                    // m(m + a) at m = b
                    const a = rng(1, 8);
                    varVal = rng(2, 10);
                    const inner = varVal + a;
                    expression = `${varName}(${varName} + ${a})`;
                    result = varVal * inner;
                    stepText = `${varVal}(${varVal} + ${a}) = ${varVal} \u00d7 ${inner} = ${result}`;
                } else {
                    // Two-step: ax + b at x = c
                    const a = rng(2, 8);
                    const b = rng(1, 15);
                    varVal = rng(2, 12);
                    const addSub = pick(['+', '\u2212']);
                    expression = `${a}${varName} ${addSub} ${b}`;
                    result = addSub === '+' ? a * varVal + b : a * varVal - b;
                    stepText = `${a}(${varVal}) ${addSub} ${b} = ${a * varVal} ${addSub} ${b} = ${result}`;
                }

                q.text = `Evaluate ${expression} at ${varName} = ${varVal}`;
                q.ans = result;
                q.hint = `Substitute ${varVal} for ${varName}, then follow order of operations!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Evaluate Expression</div>
                    <div style="font-size:1.4rem;margin:15px 0;">
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-cyan);">${expression}</span>
                        <span style="margin:0 10px;">at</span>
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-orange);">${varName} = ${varVal}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:20px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Step 1: Substitute</div>
                        <div style="font-size:1.1rem;">${stepText.split('=')[0]}= ?</div>
                        <div style="font-weight:600;color:var(--accent-cyan);margin-top:10px;margin-bottom:8px;">Step 2: Calculate</div>
                        <div style="font-size:1.2rem;">= <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.algebraData = { expression, varName, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "inequalities" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 5 candidate values into satisfies/not bins
                const ineqSymbols = ['>', '<', '≥', '≤'];
                const ineqSymbol = pick(ineqSymbols);
                const ineqMaxC = Math.max(5, Math.min(algMax, 50));
                const ineqBoundary = rng(3, ineqMaxC);
                const checkSatisfies = (v) => {
                    if (ineqSymbol === '>') return v > ineqBoundary;
                    if (ineqSymbol === '<') return v < ineqBoundary;
                    if (ineqSymbol === '≥') return v >= ineqBoundary;
                    return v <= ineqBoundary;
                };
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < 5 && safety < 100) {
                    safety++;
                    const v = rng(Math.max(0, ineqBoundary - 6), ineqBoundary + 6);
                    candidates.add(v);
                }
                let arr = shuffle(Array.from(candidates).slice(0, 5));
                const allSat = arr.every(checkSatisfies);
                const noneSat = arr.every(v => !checkSatisfies(v));
                if (allSat) {
                    arr[0] = (ineqSymbol === '>' || ineqSymbol === '≥') ? Math.max(0, ineqBoundary - 2) : ineqBoundary + 5;
                } else if (noneSat) {
                    arr[0] = (ineqSymbol === '>' || ineqSymbol === '≥') ? ineqBoundary + 5 : Math.max(0, ineqBoundary - 2);
                }
                const tiles = arr.map((v, i) => ({ id: 't' + i, label: String(v) }));
                const ans = {};
                arr.forEach((v, i) => { ans['t' + i] = checkSatisfies(v) ? 'binSat' : 'binNot'; });
                q.text = `Drag each value into the correct bin for the inequality x ${ineqSymbol} ${ineqBoundary}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binSat', label: `Satisfies x ${ineqSymbol} ${ineqBoundary}` },
                    { id: 'binNot', label: `Does NOT satisfy` }
                ];
                q.hint = `Test each value: substitute into x ${ineqSymbol} ${ineqBoundary}. Is the statement true?`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Inequalities';
                return;
            } else if (algSkill === "inequalities" && Math.random() < 0.30) {
                // Phase 4.5 batch 3: number-line-extended variant — drag a marker to any value
                // satisfying the inequality. We pick a single satisfying example value as `ans`
                // (the widget's tolerance check accepts that exact placement).
                const nleSymbols = ['>', '<', '≥', '≤'];
                const nleSymbol = pick(nleSymbols);
                const nleMaxC = Math.max(5, Math.min(algMax, 50));
                const nleThreshold = rng(2, Math.min(10, nleMaxC));
                const nleLow = -5;
                const nleHigh = Math.max(20, nleThreshold + 10);
                const checkSat = (v) => {
                    if (nleSymbol === '>') return v > nleThreshold;
                    if (nleSymbol === '<') return v < nleThreshold;
                    if (nleSymbol === '≥') return v >= nleThreshold;
                    return v <= nleThreshold;
                };
                const validValues = [];
                for (let v = nleLow; v <= nleHigh; v++) {
                    if (checkSat(v)) validValues.push(v);
                }
                // Fallback safety: if (somehow) no satisfying values, widen to the threshold itself
                const example = validValues.length > 0
                    ? pick(validValues)
                    : (nleSymbol === '≥' || nleSymbol === '≤' ? nleThreshold : nleThreshold + (nleSymbol === '>' ? 1 : -1));
                q.text = `Drag the marker to a value that satisfies x ${nleSymbol} ${nleThreshold}. (Example: ${example})`;
                q.printText = `Mark a value that satisfies x ${nleSymbol} ${nleThreshold}. (Example: ${example})`;
                q.answerType = 'number-line-extended';
                q.rangeMin = nleLow;
                q.rangeMax = nleHigh;
                q.majorTickEvery = 1;
                q.minorSnap = 1;
                q.numberType = 'integer';
                q.ans = example;
                q.tolerance = 0.5;
                q.hint = `Any whole number ${nleSymbol} ${nleThreshold} works. The example shown is just one of many valid answers.`;
                q.printFormat = 'number-line-extended';
                q.skillLabel = 'Inequalities';
                q.options = [];
                return;
            } else if (algSkill === "inequalities") {
                // Inequalities
                const symbols = ['>', '<', '\u2265', '\u2264'];
                const symbol = pick(symbols);
                const ineqMax = Math.max(5, Math.min(algMax, 50));
                const boundary = rng(1, ineqMax);
                const testVal = rng(Math.max(0, boundary - 5), boundary + 5);

                let isTrue;
                if (symbol === '>') isTrue = testVal > boundary;
                else if (symbol === '<') isTrue = testVal < boundary;
                else if (symbol === '\u2265') isTrue = testVal >= boundary;
                else isTrue = testVal <= boundary;

                q.text = `Is ${testVal} ${symbol} ${boundary} true or false?`;
                q.ans = isTrue ? "True" : "False";
                q.answerType = "choice";
                q.options = ["True", "False"];
                q.hint = `> means greater than, < means less than, \u2265 means greater than or equal, \u2264 means less than or equal`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\ud83d\udd24 Inequalities</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="font-weight:700;">${testVal}</span>
                        <span style="margin:0 15px;color:var(--accent-cyan);font-weight:700;">${symbol}</span>
                        <span style="font-weight:700;">${boundary}</span>
                    </div>
                    <svg width="280" height="50" viewBox="0 0 280 50" style="margin:15px auto;display:block;">
                        <line x1="20" y1="25" x2="260" y2="25" stroke="currentColor" stroke-width="${STROKE.normal}"/>
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + i * 24;
                            const val = boundary - 5 + i;
                            return `<line x1="${x}" y1="20" x2="${x}" y2="30" stroke="currentColor" stroke-width="1"/>
                            <text x="${x}" y="45" text-anchor="middle" font-family='${FONTS.sans}' fill="currentColor" font-size="10">${val}</text>`;
                        }).join('')}
                        <circle cx="${20 + (testVal - (boundary - 5)) * 24}" cy="25" r="8" fill="${COLORS.correct}"/>
                    </svg>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        > greater than | < less than | \u2265 greater or equal | \u2264 less or equal
                    </div>
                </div>`;
                q.algebraData = { testVal, symbol, boundary, isTrue };
                q.printFormat = "algebra-inequality";
            } else if (algSkill === "tape_diagram") {
                // Tape Diagram - bar model for addition/subtraction word problems
                const tdNames = ["Sam", "Mia", "Leo", "Ava", "Kai", "Zoe", "Ben", "Lily"];
                const tdItems = ["apples", "stickers", "marbles", "books", "coins", "cards", "shells", "stars"];
                const tdName = pick(tdNames);
                const tdItem = pick(tdItems);
                const diagType = pick(["find_whole", "find_part"]);
                const tdMax = Math.max(10, Math.min(algMax, 100));

                if (diagType === "find_whole") {
                    // Given two parts, find the whole
                    const part1 = rng(10, tdMax);
                    const part2 = rng(10, tdMax);
                    const whole = part1 + part2;

                    q.text = `${tdName} has ${part1} ${tdItem} and gets ${part2} more. How many ${tdItem} in all?`;
                    q.ans = whole;
                    q.hint = `Add the two parts together: ${part1} + ${part2}`;

                    const totalW = 620;
                    const part1W = Math.round((part1 / whole) * totalW);
                    const part2W = totalW - part1W;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">Tape Diagram</div>
                        <div style="max-width:600px;width:100%;margin:0 auto;">
                            <div style="display:flex;margin-bottom:4px;">
                                <div style="flex:1;border-top:2px solid var(--text-bright);border-left:2px solid var(--text-bright);border-right:2px solid var(--text-bright);height:14px;border-radius:4px 4px 0 0;"></div>
                            </div>
                            <div style="text-align:center;font-weight:700;font-size:1.2rem;color:var(--accent-orange);margin-bottom:8px;">? total</div>
                            <div style="display:flex;gap:3px;">
                                <div style="width:${part1W}px;height:110px;background:var(--accent-cyan);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.8rem;">${part1}</div>
                                <div style="width:${part2W}px;height:110px;background:var(--accent-green);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.8rem;">${part2}</div>
                            </div>
                        </div>
                        <div style="font-size:1rem;color:var(--text-dim);margin-top:12px;">Add the two parts to find the whole.</div>
                    </div>`;
                } else {
                    // Given whole and one part, find missing part
                    const whole = rng(20, Math.max(20, tdMax * 2));
                    const knownPart = rng(5, whole - 5);
                    const missingPart = whole - knownPart;
                    const actions = [
                        `${tdName} had ${whole} ${tdItem}. He gave ${knownPart} away. How many are left?`,
                        `${tdName} had ${whole} ${tdItem}. She used ${knownPart}. How many remain?`,
                        `${tdName} needs ${whole} ${tdItem}. He already has ${knownPart}. How many more does he need?`
                    ];

                    q.text = pick(actions);
                    q.ans = missingPart;
                    q.hint = `The whole is ${whole} and one part is ${knownPart}. Subtract to find the missing part: ${whole} - ${knownPart}`;

                    const totalW = 620;
                    const knownW = Math.round((knownPart / whole) * totalW);
                    const missingW = totalW - knownW;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">Tape Diagram</div>
                        <div style="max-width:600px;width:100%;margin:0 auto;">
                            <div style="display:flex;margin-bottom:4px;">
                                <div style="flex:1;border-top:2px solid var(--text-bright);border-left:2px solid var(--text-bright);border-right:2px solid var(--text-bright);height:14px;border-radius:4px 4px 0 0;"></div>
                            </div>
                            <div style="text-align:center;font-weight:700;font-size:1.2rem;color:var(--accent-cyan);margin-bottom:8px;">${whole} total</div>
                            <div style="display:flex;gap:3px;">
                                <div style="width:${knownW}px;height:110px;background:var(--accent-cyan);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.8rem;">${knownPart}</div>
                                <div style="width:${missingW}px;height:110px;border:3px dashed var(--accent-orange);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:2rem;color:var(--accent-orange);background:rgba(255,159,28,0.08);">?</div>
                            </div>
                        </div>
                        <div style="font-size:1rem;color:var(--text-dim);margin-top:12px;">Subtract the known part from the whole.</div>
                    </div>`;
                }
                q.skillLabel = 'Tape Diagram';
                q.printFormat = 'tape-diagram';
                q.options = buildNumericOptions(q.ans);
            } else if (algSkill === "multi_step_word") {
                // Multi-Step Word Problems with bar model visual
                const msNames = ["Maria", "James", "Sofia", "Ethan", "Noor", "Liam", "Aisha", "Owen"];
                const msItems = ["stickers", "marbles", "books", "pencils", "cookies", "tokens", "points", "beads"];
                const msName = pick(msNames);
                const msItem = pick(msItems);

                // LRU rotation across the 4 multi-step archetypes so students see all forms.
                const problemType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('multi_step_word', ["add_then_sub", "sub_then_add", "add_then_add", "sub_then_sub"])
                    : pick(["add_then_sub", "sub_then_add", "add_then_add", "sub_then_sub"]);
                q._variant = problemType;
                let startVal, step1Val, step2Val, afterStep1, finalVal;
                let step1Text, step2Text;
                const msMax = Math.max(20, Math.min(algMax, 100));

                if (problemType === "add_then_sub") {
                    startVal = rng(20, msMax);
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 2)));
                    step2Val = rng(3, Math.min(Math.floor(msMax / 2), startVal + step1Val - 1));
                    afterStep1 = startVal + step1Val;
                    finalVal = afterStep1 - step2Val;
                    step1Text = `bought ${step1Val} more`;
                    step2Text = `gave ${step2Val} to a friend`;
                } else if (problemType === "sub_then_add") {
                    startVal = rng(30, msMax);
                    step1Val = rng(5, startVal - 5);
                    step2Val = rng(3, Math.max(3, Math.floor(msMax / 2)));
                    afterStep1 = startVal - step1Val;
                    finalVal = afterStep1 + step2Val;
                    step1Text = `lost ${step1Val}`;
                    step2Text = `found ${step2Val} more`;
                } else if (problemType === "add_then_add") {
                    startVal = rng(10, Math.max(10, Math.floor(msMax * 0.6)));
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 3)));
                    step2Val = rng(5, Math.max(5, Math.floor(msMax / 3)));
                    afterStep1 = startVal + step1Val;
                    finalVal = afterStep1 + step2Val;
                    step1Text = `earned ${step1Val} more`;
                    step2Text = `received ${step2Val} more`;
                } else {
                    startVal = rng(50, msMax);
                    step1Val = rng(5, Math.max(5, Math.floor(msMax / 4)));
                    step2Val = rng(3, Math.max(3, Math.min(Math.floor(msMax / 4), startVal - step1Val - 1)));
                    afterStep1 = startVal - step1Val;
                    finalVal = afterStep1 - step2Val;
                    step1Text = `used ${step1Val}`;
                    step2Text = `gave away ${step2Val}`;
                }

                q.text = `${msName} had ${startVal} ${msItem}. She ${step1Text}, then ${step2Text}. How many ${msItem} does she have now?`;
                q.ans = finalVal;

                const msStep1Op = (problemType === "add_then_sub" || problemType === "add_then_add") ? '+' : '-';
                const msStep2Op = (problemType === "add_then_sub" || problemType === "sub_then_sub") ? '-' : '+';
                q.hint = `Step 1: ${startVal} ${msStep1Op} ${step1Val} = ${afterStep1}. Step 2: ${afterStep1} ${msStep2Op} ${step2Val} = ${finalVal}`;

                // Multi-bar visual. Use a placeholder width for the
                // start bar only; intermediate and final bars are kept
                // generic so a student can't measure the answer by eye.
                const barW = 280;
                const startW = Math.max(60, Math.min(barW, Math.round((startVal / Math.max(startVal, 1)) * barW * 0.8 + 30)));
                const placeholderW = 120;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Multi-Step Bar Model</div>
                    <div style="max-width:300px;margin:0 auto;text-align:left;">
                        <div style="margin-bottom:10px;">
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Start: ${startVal}</div>
                            <div style="width:${startW}px;height:30px;background:var(--accent-cyan);border-radius:5px;display:flex;align-items:center;padding-left:8px;color:white;font-weight:700;font-size:0.85rem;">${startVal}</div>
                        </div>
                        <div style="margin-bottom:10px;">
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Step 1: ${msStep1Op} ${step1Val}</div>
                            <div style="width:${placeholderW}px;height:30px;border:2px dashed var(--accent-green);border-radius:5px;display:flex;align-items:center;padding-left:8px;color:var(--accent-green);font-weight:700;font-size:0.85rem;background:rgba(76,175,80,0.08);">?</div>
                        </div>
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:3px;">Step 2: ${msStep2Op} ${step2Val}</div>
                            <div style="width:${placeholderW}px;height:30px;border:3px dashed var(--accent-orange);border-radius:5px;display:flex;align-items:center;padding-left:8px;font-weight:700;font-size:0.85rem;color:var(--accent-orange);background:rgba(255,159,28,0.08);">?</div>
                        </div>
                    </div>
                </div>`;
                q.skillLabel = 'Multi-Step';
                q.printFormat = 'multi-step-word';
                q.options = buildNumericOptions(finalVal);

                // ── Column workmat (col-arith) ──
                // Wire the workmat for the FINAL step, pre-supplying the
                // intermediate result (afterStep1) so the student finishes
                // the chain in the column. msStep2Op decides add vs sub.
                if (Number.isFinite(afterStep1) && Number.isFinite(step2Val)
                    && Number.isFinite(finalVal) && finalVal >= 0) {
                    q.answerType = 'col-arith';
                    q.decimalPlaces = 0;
                    if (msStep2Op === '+') {
                        q.colMode = 'add';
                        q.operands = [afterStep1, step2Val];
                    } else if (afterStep1 >= step2Val) {
                        q.colMode = 'sub';
                        q.minuend = afterStep1;
                        q.subtrahend = step2Val;
                    }
                }
            }
            return;
}
