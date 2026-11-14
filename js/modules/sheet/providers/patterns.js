// js/modules/sheet/providers/patterns.js
// Skill providers (lane lf-algebra, 2026-11-07): patterns:notice_patterns (the `notice` cell) and
// patterns:growing_shape_patterns (the `growing-pattern` cell). Everything is read from the item's payload
// (q.cell.payload), never from the text, so the strings, the worked steps and the wrong answer follow the item (L6).
// The preset patterns:pattern_features reads notice_patterns' provider (contract.js getProvider).
//
// Misconceptions (build list patterns_notice; PEDAGOGY P-10; the lessons G3 "Patterns on the multiplication table"
// and G4 "Find emergent features", "Extend growing shape patterns"):
//   odd-odd-even    odd × odd is even (the adding rule odd + odd = even carried over)
//   first-factor    decides by the first factor only (3 × 4: "3 is odd, so odd")
//   first-terms     a pattern seen in the first number(s) is taken to hold for all ("5, 10, 15: every number is odd")
//   some-not-all    a sentence that fits some products is called true ("ends in 5": 5, 15, 25 do)
//   adds-one        the next term has one more, whatever the step (3, 5, 7 -> 8)
//   doubles         the next term doubles the last (3, 5, 7 -> 14)
//   two-gaps        the rule read across two terms (1, 3, 5: + 4)
//   times-ten       Term 10 = 10 × the step, the start forgotten
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { strings, step as rawStep, clampSteps, chooseWrong } from './util.js';

/** An expression never breaks after its sign (print-lint WRAP-OP): no-break spaces round × + − = in a step. */
const nb = (t) => String(t).replace(/ ([×+=−]) /g, '\u00a0$1\u00a0');
const step = (text, marks) => rawStep(nb(text), marks);

const noticeOf = (q) => (q && q.cell && q.cell.template === 'notice' && q.cell.payload) || null;
const growOf = (q) => (q && q.cell && q.cell.template === 'growing-pattern' && q.cell.payload) || null;
const pe = (n) => (Number(n) % 2 === 0 ? 'even' : 'odd');
const lowerFirst = (s) => String(s || '').replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase());

/* ================================================================== notice_patterns: strings */

const NOTICE_BY_TASK = {
    parity: {
        iCan: 'I Can tell if a product is even or odd',
        instructionKey: 'product-even-odd',
        // (r8, critic r1 F6b: the steps are the lesson's four step names, lessons/families/algebra.js 'notice-parity')
        steps: ['Check the first.', 'Check the second.', 'An even one? Even.', 'Circle the word.'],
        say: 'The product is __ because __.',
        sayValues: (q) => {
            const p = noticeOf(q);
            if (!p || p.task !== 'parity') return null;
            const even = p.product % 2 === 0;
            const e = p.a % 2 === 0 ? p.a : p.b;
            return [even ? 'even' : 'odd', even ? `${e} is even: two equal groups` : `${p.a} and ${p.b} are both odd`];
        },
        stepsFor: (q) => {
            const p = noticeOf(q);
            if (!p || p.task !== 'parity') return null;
            return [`Look at ${p.a}: it is ${pe(p.a)}. Look at ${p.b}: it is ${pe(p.b)}.`,
                'One even number makes the product even. Both odd make it odd.',
                `Circle ${p.product % 2 === 0 ? 'Even' : 'Odd'}.`];
        },
        vocabulary: ['product', 'even', 'odd', 'factor'],
        rule: 'An even number is two equal groups. If one number in the fact is even, the product is even.',
    },
    feature: {
        iCan: 'I Can find what a number pattern shows',
        instructionKey: 'pattern-true-one',
        // (r8: the lesson's step names, 'pattern-features')
        steps: ['Read the rule. Write the numbers.', 'Test a sentence.', 'Test the next one.', 'Check the true one.'],
        say: 'I notice that __.',
        sayValues: (q) => { const p = noticeOf(q); return p && p.task === 'feature' ? [lowerFirst((p.choices || [])[p.correct])] : null; },
        stepsFor: (q) => {
            const p = noticeOf(q);
            if (!p || p.task !== 'feature') return null;
            return [`Start at ${p.start}. Add ${p.step}: ${p.terms.join(', ')}.`, 'Test each sentence on every number.', `Check: ${(p.choices || [])[p.correct]}`];
        },
        vocabulary: ['pattern', 'rule', 'odd', 'even', 'ones digit'],
    },
    truefalse: {
        iCan: 'I Can test a sentence about a times-table',
        instructionKey: 'row-true-false',
        steps: ['Read the sentence.', 'Test it on every product in the times-table.', 'One product that does not fit makes it false.'],
        say: 'It is __ because __.',
        sayValues: (q) => {
            const p = noticeOf(q);
            if (!p || p.task !== 'truefalse') return null;
            const bad = counterExample(p);
            return [p.isTrue ? 'true' : 'false', p.isTrue ? 'every product fits' : `${bad} does not fit`];
        },
        stepsFor: (q) => {
            const p = noticeOf(q);
            if (!p || p.task !== 'truefalse') return null;
            const bad = counterExample(p);
            return [`The ${p.table} times-table: ${p.products.join(', ')}.`, 'Test the sentence on every product.',
                p.isTrue ? 'Every product fits: circle True.' : `${bad} does not fit: circle False.`];
        },
        vocabulary: ['times-table', 'product', 'true', 'false'],
    },
};
// (r8, critic r1 F6: a page's Steps band takes the item's steps only when every item's are the same; a per-item
// `stepsFor` sent the guided page to the provider's item-less strings, which have no options and fell to PARITY on the
// pattern_features preset. The steps are the task's fixed list (the same on every item of a page); the numbers stay in
// the worked steps and the Say band. ws-node-lint STEPS-FOLLOW-PRESET (proposed) and the lane probe check it.)
for (const d of Object.values(NOTICE_BY_TASK)) delete d.stepsFor;
const nbSteps = (f) => (typeof f === 'function' ? (q) => { const r = f(q); return Array.isArray(r) ? r.map(nb) : r; } : undefined);
const NOTICE_STRINGS = Object.fromEntries(Object.entries(NOTICE_BY_TASK).map(([k, d]) => [k, strings({ ...d, stepsFor: nbSteps(d.stepsFor) })]));

function noticeStrings(ref = {}) {
    const p = noticeOf(ref && ref.q);
    const task = p && NOTICE_STRINGS[p.task] ? p.task : (presetTask(ref) || 'parity');
    return NOTICE_STRINGS[task](ref);
}
noticeStrings.def = NOTICE_STRINGS.parity.def;

/** A preset page with no item yet (the title of the pattern_features preset). */
const presetTask = (ref) => {
    const t = ref && ref.opts && ref.opts.patTask;
    if (t && NOTICE_BY_TASK[t]) return t;
    return ref && ref.skillId === 'pattern_features' ? 'feature' : null;
};

/** The first product a false times-table sentence does not fit (the counterexample a pupil names). */
function counterExample(p) {
    const prods = p.products || [];
    const ones = prods.map((v) => v % 10);
    switch (p.kind) {
        case 'all-even': return prods.find((v) => v % 2 === 1);
        case 'all-odd': return prods.find((v) => v % 2 === 0);
        case 'alt': return prods.find((v, i) => v % 2 !== (i % 2 === 0 ? 1 : 0));
        case 'ends05': return prods.find((v, i) => ones[i] !== 0 && ones[i] !== 5);
        case 'ends0': return prods.find((v, i) => ones[i] !== 0);
        case 'down1': return prods.find((v, i) => i > 0 && ones[i] !== ones[i - 1] - 1);
        default: return prods[0];
    }
}

/* ================================================================== notice_patterns: worked steps */

function noticeSteps(q) {
    const p = noticeOf(q);
    if (!p) return [];
    const ans = [{ slot: 'answer', value: q.printAnswer || '' }];
    if (p.task === 'parity') {
        const even = p.product % 2 === 0;
        // (lf-algebra r3, H13 on the side twin: a long step wrapped to 6 lines in the twin's column and made its pair row
        // 113 mm tall over a 45 mm problem) one short line a step, the same four steps
        const out = [step(`${p.a} is ${pe(p.a)}.`), step(`${p.b} is ${pe(p.b)}.`)];
        if (even) {
            const e = p.a % 2 === 0 ? p.a : p.b;
            out.push(step(`${e} is even, so ${p.a} × ${p.b} makes two equal groups.`));
        } else {
            out.push(step('Odd × odd leaves one over: odd.'));
        }
        // (r8, card ruling P2: the product is never printed - the lesson is to know it from the factors)
        out.push(step(`So the product is ${even ? 'even' : 'odd'}. Circle ${even ? 'Even' : 'Odd'}.`, ans));
        return clampSteps(out);
    }
    if (p.task === 'feature') {
        const marks = p.show === false ? p.terms.slice(1).map((v, i) => ({ slot: `w${i + 1}`, value: String(v) })) : [];
        const out = [step(`Add ${p.step} each time: ${p.terms.slice(0, 4).join(', ')} …`, marks)];
        (p.choices || []).forEach((c, i) => {
            if (i === p.correct) return;
            out.push(step(`Sentence ${i + 1}: not true for every number.`));
        });
        out.push(step(`Sentence ${p.correct + 1} fits every number. Check it.`, ans));
        return clampSteps(out);
    }
    const bad = counterExample(p);
    return clampSteps([
        step(`Read the ${p.table} times-table: ${p.products.join(', ')}.`),
        step(`Test the sentence: ${lowerFirst(p.statement)}.`),
        step(p.isTrue ? 'Every product fits.' : `${bad} does not fit. One is enough to make it false.`),
        step(`Circle ${p.isTrue ? 'True' : 'False'}.`, ans),
    ]);
}

/* ================================================================== notice_patterns: wrong answers */

function noticeWrong(q) {
    const p = noticeOf(q);
    if (!p) return null;
    const c = [];
    if (p.task === 'parity') {
        const wrongLabel = p.product % 2 === 0 ? 'Odd' : 'Even';
        if (p.a % 2 === 1 && p.b % 2 === 1) {
            c.push({ value: 'Even', display: 'Even', slot: 'answer', slots: { answer: 'Even' }, misconception: 'odd-odd-even', explain: `Thought odd × odd is even (like odd + odd): ${p.a} × ${p.b} = ${p.product}, odd.` });
        }
        if (pe(p.a) !== pe(p.product)) {
            c.push({ value: wrongLabel, display: wrongLabel, slot: 'answer', slots: { answer: wrongLabel }, misconception: 'first-factor', explain: `Looked at ${p.a} only (${pe(p.a)}); ${p.b} is ${pe(p.b)}, so the product is ${pe(p.product)}.` });
        }
        if (!c.length) c.push({ value: wrongLabel, display: wrongLabel, slot: 'answer', slots: { answer: wrongLabel }, misconception: 'odd-odd-even', explain: `Mixed up the rule: ${p.a} × ${p.b} = ${p.product} is ${pe(p.product)}.` });
        return chooseWrong(q, c);
    }
    if (p.task === 'feature') {
        (p.choices || []).forEach((t, i) => {
            if (i === p.correct) return;
            c.push({ value: t, display: t, slot: 'answer', slots: { answer: t }, misconception: 'first-terms', explain: `Read the pattern off the first numbers; it does not hold for every number (${p.terms.join(', ')}).` });
        });
        return chooseWrong(q, c);
    }
    const lab = p.isTrue ? 'False' : 'True';
    const bad = counterExample(p);
    c.push({ value: lab, display: lab, slot: 'answer', slots: { answer: lab },
        misconception: p.kind === 'alt' || p.kind === 'all-odd' ? 'odd-odd-even' : 'some-not-all',
        explain: p.isTrue ? 'Called it false without testing every product: all of them fit.' : `Some products fit, but ${bad} does not.` });
    return chooseWrong(q, c);
}

/* ================================================================== growing_shape_patterns */

const GROW_BY_TASK = {
    // (r8, critic r1 F7: one verb, so a role title reads "Review: finding the next term ...", never "drawing and count";
    // the steps are the lesson's four step names, 'growing-shape-patterns', F6b)
    next: { iCan: 'I Can find the next term of a growing pattern', instructionKey: 'grow-next',
        steps: ['Count.', 'Find the more.', 'Draw Term 4.', 'Write it.'] },
    rule: { iCan: 'I Can find the rule of a growing pattern', instructionKey: 'grow-rule',
        steps: ['Count each term.', 'Find how many more each term has: that is the rule.', 'Draw Term 4. Write how many and the rule.'] },
    far: { iCan: 'I Can find a later term of a growing pattern', instructionKey: 'grow-far',
        steps: ['Count each term. Find the rule.', 'Count on by the rule, one term at a time.', 'Stop at Term 10. Write how many.'] },
};
const GROW_SAY = 'Each term has __ more, so Term __ has __.';
const growSayValues = (q) => {
    const p = growOf(q);
    if (!p) return null;
    return p.ask === 'far' ? [p.step, 10, p.count10] : [p.step, 4, p.counts[3]];
};
const GROW_STRINGS = Object.fromEntries(Object.entries(GROW_BY_TASK).map(([k, d]) => [k, strings({ ...d, say: GROW_SAY, sayValues: growSayValues, vocabulary: ['term', 'pattern', 'rule'] })]));
function growStrings(ref = {}) {
    const p = growOf(ref && ref.q);
    const t = p && GROW_STRINGS[p.ask] ? p.ask : (ref && ref.opts && GROW_STRINGS[ref.opts.patTask] ? ref.opts.patTask : 'next');
    return GROW_STRINGS[t](ref);
}
growStrings.def = GROW_STRINGS.next.def;

function growSteps(q) {
    const p = growOf(q);
    if (!p) return [];
    const [a, b, c, d] = p.counts;
    const work = p.show === false ? [1, 2, 3].map((t) => ({ slot: `n${t}`, value: String(p.counts[t - 1]) })) : [];
    const out = [step(`Count each term: ${a}, ${b}, ${c} ${p.unit}.`, work)];
    out.push(step(`${a} to ${b} is + ${p.step}. ${b} to ${c} is + ${p.step}. Each term has ${p.step} more.`, p.ask === 'rule' ? [{ slot: 'rule', value: String(p.step) }] : []));
    if (p.ask === 'far') {
        out.push(step(`Term 4 has ${c} + ${p.step} = ${d}.`, [{ slot: 'n4', value: String(d) }]));
        const list = [];
        for (let t = 5, v = d + p.step; t <= 10; t++, v += p.step) list.push(v);
        out.push(step(`Count on by ${p.step}: ${list.join(', ')}. Term 10 has ${p.count10}.`, [{ slot: 'answer', value: String(p.count10) }]));
    } else {
        out.push(step(`Draw Term 3 again and add ${p.step} more ${p.unit}.`, [{ slot: 'draw', value: '' }]));
        out.push(step(`Term 4 has ${c} + ${p.step} = ${d} ${p.unit}. Write ${d}.`, [{ slot: 'answer', value: String(d) }]));
    }
    return clampSteps(out);
}

function growWrong(q) {
    const p = growOf(q);
    if (!p) return null;
    const [a, , c, d] = p.counts;
    const cand = [];
    const pair = (four, rule) => (p.ask === 'rule' ? `${four}, ${rule}` : String(four));
    if (p.ask === 'far') {
        if (p.step * 10 !== p.count10) cand.push({ value: String(p.step * 10), slot: 'answer', slots: { answer: String(p.step * 10) }, misconception: 'times-ten', explain: `Wrote 10 × ${p.step} and forgot the ${a} the pattern starts with.` });
        const six = d + 6;
        if (six !== p.count10) cand.push({ value: String(six), slot: 'answer', slots: { answer: String(six) }, misconception: 'adds-one', explain: `Counted on by 1 from Term 4 (${d}), not by ${p.step}.` });
        return chooseWrong(q, cand);
    }
    if (p.ask === 'rule') {
        const gap2 = 2 * p.step;
        cand.push({ value: pair(d, gap2), slot: 'rule', slots: { answer: String(d), rule: String(gap2) }, misconception: 'two-gaps', explain: `Read the rule from Term 1 to Term 3 (${a} to ${c}): + ${gap2}, not + ${p.step}.` });
    }
    if (p.step !== 1) cand.push({ value: pair(c + 1, p.step), slot: 'answer', slots: { answer: String(c + 1), rule: String(p.step) }, misconception: 'adds-one', explain: `Added 1 to Term 3 (${c}); each term has ${p.step} more.` });
    if (c * 2 !== d) cand.push({ value: pair(c * 2, p.step), slot: 'answer', slots: { answer: String(c * 2), rule: String(p.step) }, misconception: 'doubles', explain: `Doubled Term 3 (${c}); the pattern adds ${p.step}.` });
    return chooseWrong(q, cand);
}

/* ================================================================== register */

registerSkill('patterns:notice_patterns', {
    strings: noticeStrings,
    misconceptions: ['odd-odd-even', 'first-factor', 'first-terms', 'some-not-all'],
    workedSteps: noticeSteps,
    wrongAnswer: noticeWrong,
    footprint: { kind: 'choice', factLike: false, maxCols: 3 },
});

registerSkill('patterns:growing_shape_patterns', {
    strings: growStrings,
    misconceptions: ['adds-one', 'doubles', 'two-gaps', 'times-ten'],
    workedSteps: growSteps,
    wrongAnswer: growWrong,
    footprint: { kind: 'picture', factLike: false, maxCols: 2 },
});
