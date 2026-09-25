// js/modules/sheet/providers/addition.js
// Skill providers for the addition family (SKILL_CELL_CONTRACT.md section 3).
//
//   add_facts, add, add_column_multi, add_sub_fact_family, cloze_addition, number_line_add,
//   and the word-problem ladder add_wp_* / sub_wp_* (with its _plain twins).
//
// Each provider supplies `strings` (iCan, instruction, steps, say), `workedSteps(q)`,
// `wrongAnswer(q)` built from named misconceptions, `misconceptions`, and - for skills whose
// operands a story can carry - `stories(q, {seed})`.
//
// Marks in worked steps name LOGICAL slots: 'ans' (fact cells), 'answer', 'ones', 'tens',
// 'hundreds', 'regroup:tens', 'regroup:hundreds', 'eq0'..'eq3', 'part1', 'part2',
// 'start', 'jump:1'.. . A role maps them onto the cell it draws.

import { registerSkill } from '../contract.js';
import {
    num, arr, obj, fmt, operands, countList, digitsOf, chooseWrong, strings, step, clampSteps,
} from './util.js';
import { storiesFor } from './stories.js';

const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
const PLACE_ONE = ['one', 'ten', 'hundred', 'thousand', 'ten thousand'];
const placeWord = (i, n) => (n === 1 ? PLACE_ONE[i] : PLACE[i]);

/* ====================================================================== column addition */

/**
 * Column addition of any number of whole addends, worked place by place.
 * Returns the steps, the sum, and the two classic wrong sums (PEDAGOGY_STANDARD misconception
 * list): `noRegroup` (forgot the regrouped ten) and `wholeColumn` (wrote each column total).
 */
export function columnAdd(addends) {
    const cols = Math.max(...addends.map((n) => digitsOf(n).length));
    const steps = [];
    let carry = 0;
    let noRegroup = 0;
    const colTotals = [];
    const digitsOut = [];
    for (let i = 0; i < cols; i++) {
        const ds = addends.map((n) => digitsOf(n)[i] || 0);
        const raw = ds.reduce((s, d) => s + d, 0);
        const total = raw + carry;
        colTotals.push(raw);
        const last = i === cols - 1;
        const parts = ds.filter((d, k) => digitsOf(addends[k]).length > i).map(String);
        if (carry) parts.push(`${carry} regrouped`);
        const sumText = `${parts.join(' + ')} = ${total}`;
        const name = PLACE[i].charAt(0).toUpperCase() + PLACE[i].slice(1);
        if (last) {
            steps.push(step(`${name}: ${sumText}. Write ${total}.`, [{ slot: PLACE[i], value: String(total) }]));
            digitsOut.push(total);
        } else if (total >= 10) {
            const up = Math.floor(total / 10);
            steps.push(step(
                `${name}: ${sumText}. Write ${total % 10}. Regroup ${up} ${placeWord(i + 1, up)}.`,
                [{ slot: PLACE[i], value: String(total % 10) }, { slot: `regroup:${PLACE[i + 1]}`, value: String(up) }],
            ));
            digitsOut.push(total % 10);
        } else {
            steps.push(step(`${name}: ${sumText}. Write ${total}.`, [{ slot: PLACE[i], value: String(total) }]));
            digitsOut.push(total);
        }
        noRegroup += (last ? raw : raw % 10) * 10 ** i;
        carry = Math.floor(total / 10);
    }
    const sum = addends.reduce((s, n) => s + n, 0);
    const wholeColumn = colTotals.some((t) => t >= 10) ? num(colTotals.slice().reverse().join('')) : sum;
    const regrouped = colTotals.some((t, i) => i < cols - 1 && t >= 10) || steps.some((s) => /Regroup/.test(s.text));
    return { steps, sum, noRegroup, wholeColumn, regrouped };
}

/* ============================================================================ add_facts */

function factSteps(a, b) {
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const sum = a + b;
    const done = step(`Write ${sum}.`, [{ slot: 'ans', value: String(sum) }]);
    if (small === 0) {
        return [step(`${a} + ${b}: one number is 0.`), step('Adding 0 does not change the number.'), done];
    }
    if (a === b) {
        return [step(`${a} + ${b} is a double.`), step(`Double ${a} is ${sum}.`), done];
    }
    if (sum > 10 && big < 10 && small >= 3) {
        const need = 10 - big;
        return [
            step(`Start with ${big}.`),
            step(`Make 10: ${big} + ${need} = 10.`),
            step(`${small} is ${need} and ${small - need}.`),
            step(`10 + ${small - need} = ${sum}.`),
            done,
        ];
    }
    return [step(`Start with ${big}.`), step(`Count on ${small}: ${countList(big + 1, sum)}.`), done];
}

function factWrong(q, slot = 'ans') {
    const [a, b] = operands(q);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const sum = a + b;
    return chooseWrong(q, [
        { value: sum - 1, misconception: 'counted-start', slot, explain: `Counted ${Math.max(a, b)} again as the first count-on number.` },
        { value: Math.abs(a - b), misconception: 'subtracted', slot, explain: 'Subtracted instead of adding.' },
        { value: sum + 1, misconception: 'counted-one-extra', slot, explain: 'Counted on one too many.' },
    ]);
}

registerSkill('addition:add_facts', {
    strings: strings({
        iCan: 'I Can add facts to 20',
        instructionKey: 'add',
        // Critic round 2: the steps name only a support the page prints. The Guided page's
        // first row carries a grey dot tile of the smaller number (H3), so the strategy is
        // count on with the dots; "make 10 first" had no ten frame anywhere on the page.
        steps: ['Start with the bigger number.', 'Count on the smaller number. Use the dots.', 'Write the sum.'],
        say: '__ plus __ equals __.',
    }),
    misconceptions: ['counted-start', 'subtracted', 'counted-one-extra'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        return Number.isFinite(a) && Number.isFinite(b) ? factSteps(a, b) : [];
    },
    wrongAnswer: (q) => factWrong(q),
    stories: storiesFor('+'),
});

/* ================================================================================== add */

function columnWrong(q, addends) {
    const col = columnAdd(addends);
    const c = [];
    if (col.noRegroup !== col.sum) {
        const tensDigit = String(Math.floor(col.noRegroup / 10) % 10);
        c.push({ value: col.noRegroup, misconception: 'forgot-regroup', slot: 'tens',
            slots: { tens: tensDigit, answer: String(col.noRegroup) }, explain: 'Did not add the regrouped ten.' });
        c.push({ value: col.wholeColumn, misconception: 'whole-column-total', slot: 'answer',
            explain: 'Wrote each column total without regrouping.' });
    }
    if (addends.length === 2) {
        const [a, b] = addends;
        if (a >= 10 && b < 10) c.push({ value: a + b * 10, misconception: 'misaligned', slot: 'answer', explain: `Lined up ${b} under the tens.` });
        if (b >= 10 && a < 10) c.push({ value: b + a * 10, misconception: 'misaligned', slot: 'answer', explain: `Lined up ${a} under the tens.` });
        c.push({ value: Math.abs(a - b), misconception: 'subtracted', slot: 'answer', explain: 'Subtracted instead of adding.' });
    } else {
        c.push({ value: col.sum - addends[addends.length - 1], misconception: 'left-out-addend', slot: 'answer',
            explain: `Left out ${addends[addends.length - 1]}.` });
    }
    return chooseWrong(q, c);
}

registerSkill('addition:add', {
    strings: strings({
        iCan: 'I Can add tens and ones in columns',
        instructionKey: 'add',
        steps: ['Add the ones.', '10 ones or more? Regroup 10 ones as 1 ten.', 'Add the tens.', 'Write the sum.'],
        say: '__ plus __ equals __.',
    }),
    misconceptions: ['forgot-regroup', 'whole-column-total', 'misaligned', 'subtracted'],
    workedSteps: (q) => {
        const ops = operands(q);
        if (ops.length < 2) return [];
        const col = columnAdd(ops.slice(0, 2));
        return clampSteps([step('Line up the digits: ones under ones, tens under tens.')].concat(col.steps).concat(step(`The sum is ${fmt(col.sum)}.`, [{ slot: 'answer', value: String(col.sum) }])));
    },
    wrongAnswer: (q) => { const ops = operands(q); return ops.length >= 2 ? columnWrong(q, ops.slice(0, 2)) : null; },
    stories: storiesFor('+'),
});

/* ===================================================================== add_column_multi */

const multiAddends = (q) => {
    const ops = arr(q.operands).map(num).filter(Number.isFinite);
    if (ops.length >= 2) return ops;
    const m = String(q.text || '').match(/\d[\d,]*/g);
    return m ? m.map(num) : [];
};

registerSkill('addition:add_column_multi', {
    strings: strings({
        iCan: 'I Can add three or four numbers in columns',
        instructionKey: 'add',
        steps: [
            'Add all the digits in the ones column.',
            'Write the ones digit. Regroup the tens to the tens column.',
            'Add the tens column and the regrouped tens.',
            'Write the sum.',
        ],
        say: 'The sum is __.',
    }),
    misconceptions: ['forgot-regroup', 'whole-column-total', 'left-out-addend'],
    workedSteps: (q) => {
        const ops = multiAddends(q);
        if (ops.length < 2) return [];
        const col = columnAdd(ops);
        return clampSteps(col.steps.concat(step(`The sum is ${fmt(col.sum)}.`, [{ slot: 'answer', value: String(col.sum) }])));
    },
    wrongAnswer: (q) => { const ops = multiAddends(q); return ops.length >= 2 ? columnWrong(q, ops) : null; },
});

/* ================================================================== add_sub_fact_family */

function family(q) {
    const d = obj(q.factFamilyData);
    if (!d || !Array.isArray(d.equations) || !Array.isArray(d.numbers)) return null;
    const whole = Math.max(...d.numbers.map(num));
    const parts = d.numbers.map(num).filter((n, i, all) => i !== all.indexOf(whole));
    return { whole, parts, eqs: d.equations.map((e) => ({ text: String(e.text), ans: num(e.ans), type: e.type })) };
}

const joinLike = (q, list) => (typeof q.ans === 'string' ? list.map(String).join(', ') : list);

registerSkill('addition:add_sub_fact_family', {
    strings: strings({
        iCan: 'I Can write the fact family for three numbers',
        instructionKey: 'fact-family',
        steps: [
            'Find the whole: the biggest number.',
            'Write two addition facts: part plus part.',
            'Write two subtraction facts: whole minus part.',
            'Check: every fact uses the same three numbers.',
        ],
        say: '__ plus __ equals __. __ minus __ equals __.',
        sayValues: (q) => { const f = family(q); return f ? [f.parts[0], f.parts[1], f.whole, f.whole, f.parts[0], f.parts[1]] : null; },
    }),
    misconceptions: ['swapped-parts', 'added-in-subtraction'],
    workedSteps: (q) => {
        const f = family(q);
        if (!f) return [];
        const head = step(`The whole is ${f.whole}. The parts are ${f.parts.join(' and ')}.`);
        return clampSteps([head].concat(f.eqs.map((e, i) => step(e.text.replace(/_+/, String(e.ans)), [{ slot: `eq${i}`, value: String(e.ans) }]))));
    },
    wrongAnswer: (q) => {
        const f = family(q);
        if (!f) return null;
        const answers = f.eqs.map((e) => e.ans);
        const subIdx = f.eqs.map((e, i) => (e.type === 'sub' || /[−-]/.test(e.text) ? i : -1)).filter((i) => i >= 0);
        const c = [];
        if (subIdx.length >= 2) {
            const [i, j] = subIdx;
            const sw = answers.slice(); [sw[i], sw[j]] = [sw[j], sw[i]];
            c.push({ value: joinLike(q, sw), misconception: 'swapped-parts', slot: `eq${i}`,
                slots: { [`eq${i}`]: String(sw[i]), [`eq${j}`]: String(sw[j]) },
                explain: 'Wrote the part that was taken away, not the part that is left.' });
        }
        if (subIdx.length) {
            const i = subIdx[0];
            const sw = answers.slice();
            sw[i] = f.whole + (f.whole - answers[i]);
            c.push({ value: joinLike(q, sw), misconception: 'added-in-subtraction', slot: `eq${i}`,
                slots: { [`eq${i}`]: String(sw[i]) }, explain: 'Added in a subtraction fact.' });
        }
        return chooseWrong(q, c);
    },
});

/* ========================================================================= cloze_addition */

registerSkill('addition:cloze_addition', {
    strings: strings({
        iCan: 'I Can find two parts that make a sum',
        instructionKey: 'pick-parts',
        steps: [
            'Read the sum.',
            'Choose a number from the first list.',
            'Find the number in the second list that makes the sum.',
            'Check: add the two parts.',
        ],
        say: '__ plus __ equals __.',
        sayValues: (q) => { const [a, b] = operands(q); return [a, b, a + b]; },
    }),
    misconceptions: ['sum-off-by-one', 'picked-the-sum'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
        const sum = a + b;
        return [
            step(`The sum is ${sum}.`),
            step(`Try ${a} from the first list.`, [{ slot: 'part1', value: String(a) }]),
            step(`${a} + ? = ${sum}. Count on from ${a} to ${sum}: ${b}.`),
            step(`Choose ${b}. Check: ${a} + ${b} = ${sum}.`, [{ slot: 'part2', value: String(b) }]),
        ];
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
        const lists = arr(q.clozeOptions).map((l) => arr(l).map(num));
        const sum = a + b;
        const second = (lists[1] || []).filter((v) => v !== b);
        const first = (lists[0] || []).filter((v) => v !== a);
        const near = (list, want) => list.slice().sort((x, y) => Math.abs(x - want) - Math.abs(y - want))[0];
        const c = [];
        const shape = (p1, p2) => (Array.isArray(q.ans) ? [String(p1), String(p2)] : `${p1}, ${p2}`);
        if (second.length) {
            const d = near(second, b);
            c.push({ value: shape(a, d), misconception: 'sum-off-by-one', slot: 'part2', slots: { part2: String(d) },
                explain: `${a} + ${d} = ${a + d}, not ${sum}.` });
        }
        if (first.length) {
            const d = near(first, a);
            c.push({ value: shape(d, b), misconception: 'sum-off-by-one', slot: 'part1', slots: { part1: String(d) },
                explain: `${d} + ${b} = ${d + b}, not ${sum}.` });
        }
        if (second.includes(sum)) {
            c.push({ value: shape(a, sum), misconception: 'picked-the-sum', slot: 'part2', slots: { part2: String(sum) },
                explain: 'Chose the sum itself as a part.' });
        }
        // No lists on the item: the classic near miss.
        if (!c.length) c.push({ value: shape(a, b + 1), misconception: 'sum-off-by-one', slot: 'part2', slots: { part2: String(b + 1) } });
        return chooseWrong(q, c);
    },
});

/* ======================================================================= number lines */

/** Worked jumps on a number line, one jump per one (b <= 10) or tens then ones. */
export function lineSteps(a, b, dir) {
    const end = a + dir * b;
    const side = dir > 0 ? 'right' : 'left';
    const out = [step(`Put a dot on ${a}. That is the start.`, [{ slot: 'start', value: String(a) }])];
    if (b <= 10) {
        const marks = [];
        for (let k = 1; k <= b; k++) marks.push({ slot: `jump:${k}`, value: `${a + dir * (k - 1)}-${a + dir * k}` });
        out.push(step(`Jump ${b} ${b === 1 ? 'space' : 'spaces'} to the ${side}.`, marks));
        out.push(step(`Count the jumps: ${countList(1, b)}.`));
    } else {
        const tens = Math.floor(b / 10);
        const ones = b % 10;
        const mid = a + dir * tens * 10;
        out.push(step(`Jump ${tens} ${tens === 1 ? 'ten' : 'tens'} to the ${side}: ${a} to ${mid}.`, [{ slot: 'jump:10s', value: `${a}-${mid}` }]));
        if (ones) out.push(step(`Jump ${ones} ${ones === 1 ? 'one' : 'ones'}: ${mid} to ${end}.`, [{ slot: 'jump:1s', value: `${mid}-${end}` }]));
    }
    out.push(step(`You land on ${end}. Write ${end}.`, [{ slot: 'answer', value: String(end) }]));
    return clampSteps(out);
}

registerSkill('addition:number_line_add', {
    strings: strings({
        iCan: 'I Can add by jumping on a number line',
        instructionKey: 'line-jumps',
        steps: [
            'Put a dot on the first number.',
            'Jump to the right, one jump for each one you add.',
            'Write the number you land on.',
        ],
        say: '__ plus __ equals __.',
    }),
    misconceptions: ['counted-start', 'jumped-wrong-way'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        return Number.isFinite(a) && Number.isFinite(b) ? lineSteps(a, b, 1) : [];
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
        return chooseWrong(q, [
            { value: a + b - 1, misconception: 'counted-start', explain: `Counted ${a}, the start, as the first jump.` },
            { value: a - b, misconception: 'jumped-wrong-way', explain: 'Jumped to the left, not the right.' },
        ]);
    },
    stories: storiesFor('+'),
});

/* ====================================================================== word problems */

const WP_BANDS = { 10: '10', 20: '20', 50: '50', 100: '100', '1k': '1,000', '10k': '10,000', '100k': '100,000', '1m': '1,000,000' };

/** The unit word of a generated story ("stars"), and its singular. */
function storyUnit(q) {
    const text = String(q.text || '');
    const m = [...text.matchAll(/(\d[\d,]*)\s+(?:more\s+)?([a-z]+)/gi)].map((x) => ({ n: num(x[1]), w: x[2].toLowerCase() }));
    const asked = /How many ([a-z]+)/i.exec(text);
    const skip = /^(more|of|and|were|was|in|to|are|is|did|does|do|remain|left)$/;
    const plural = (asked && !skip.test(asked[1].toLowerCase()) ? asked[1].toLowerCase() : null)
        || (m.find((x) => x.n !== 1 && !skip.test(x.w)) || {}).w;
    if (!plural) return null;
    const one = plural.replace(/(ch|sh|x)es$/, '$1').replace(/ies$/, 'y').replace(/s$/, '');
    return { one, many: plural };
}

function wpSteps(q, isAdd) {
    const [a, b] = operands(q);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
    const ans = isAdd ? a + b : a - b;
    const u = storyUnit(q);
    const label = u ? (ans === 1 ? u.one : u.many) : '';
    return [
        step('Read the story two times.'),
        step(`Circle the numbers: ${fmt(a)} and ${fmt(b)}.`),
        step(isAdd ? 'Two groups go together. Add.' : 'Some are taken away. Subtract.'),
        step(`${fmt(a)} ${isAdd ? '+' : '−'} ${fmt(b)} = ${fmt(ans)}.`, [{ slot: 'equation', value: `${a}${isAdd ? '+' : '-'}${b}=${ans}` }]),
        step(`Write ${fmt(ans)}${label ? ` ${label}` : ''}.`, [{ slot: 'answer', value: String(ans) }].concat(label ? [{ slot: 'label', value: label }] : [])),
    ];
}

/** 52 - 18 = 46: each column takes the smaller digit from the bigger (misconception list). */
export function smallerFromBigger(a, b) {
    const da = digitsOf(a);
    const db = digitsOf(b);
    let out = 0;
    for (let i = 0; i < da.length; i++) out += Math.abs(da[i] - (db[i] || 0)) * 10 ** i;
    return out;
}

function wpWrong(q, isAdd) {
    const [a, b] = operands(q);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const ans = isAdd ? a + b : a - b;
    const u = storyUnit(q);
    const withLabel = (c) => {
        if (!c) return c;
        if (u) c.label = num(c.value) === 1 ? u.one : u.many;
        return c;
    };
    const big = a >= 10 && b >= 10;
    const c = [];
    // `work`: the number sentence the pupil wrote, which Error analysis shows to be checked.
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    if (isAdd) {
        c.push({ value: Math.abs(a - b), misconception: 'wrong-operation', explain: 'Subtracted in a putting-together story.', work: `${hi} − ${lo} = {v}` });
        const col = columnAdd([a, b]);
        if (big && col.noRegroup !== ans) c.push({ value: col.noRegroup, misconception: 'forgot-regroup', explain: 'Did not add the regrouped ten.', work: `${a} + ${b} = {v}` });
        else if (!big) c.push({ value: ans - 1, misconception: 'counted-start', explain: 'Counted the start number again when counting on.', work: `${a} + ${b} = {v}` });
    } else {
        c.push({ value: a + b, misconception: 'wrong-operation', explain: 'Added in a taking-away story.', work: `${a} + ${b} = {v}` });
        const sm = smallerFromBigger(a, b);
        if (big && sm !== ans) c.push({ value: sm, misconception: 'smaller-from-bigger', explain: 'Took the smaller digit from the bigger digit in each column.', work: `${a} − ${b} = {v}` });
        else if (!big) c.push({ value: ans + 1, misconception: 'counted-start', explain: 'Counted the start number when counting back.', work: `${a} − ${b} = {v}` });
    }
    return withLabel(chooseWrong(q, c));
}

for (const op of ['add', 'sub']) {
    const isAdd = op === 'add';
    for (const [code, band] of Object.entries(WP_BANDS)) {
        const def = {
            strings: strings({
                iCan: isAdd ? `I Can solve addition stories (sums to ${band})` : `I Can solve subtraction stories (numbers to ${band})`,
                instructionKey: 'story-v2',
                steps: [
                    'Read the story two times.',
                    'Circle the numbers. Underline the question.',
                    isAdd ? 'Do the groups go together? Add.' : 'Are some taken away? Subtract.',
                    'Write the number and the label.',
                ],
                say: 'The answer is __ __.',
                sayValues: (q) => {
                    const [a, b] = operands(q);
                    const u = storyUnit(q);
                    const ans = isAdd ? a + b : a - b;
                    return u && Number.isFinite(ans) ? [ans, ans === 1 ? u.one : u.many] : null;
                },
            }),
            misconceptions: isAdd ? ['wrong-operation', 'counted-start', 'forgot-regroup'] : ['wrong-operation', 'counted-start', 'smaller-from-bigger'],
            workedSteps: (q) => wpSteps(q, isAdd),
            wrongAnswer: (q) => wpWrong(q, isAdd),
            stories: storiesFor(isAdd ? '+' : '-'),
        };
        const cat = isAdd ? 'addition' : 'subtraction';
        registerSkill(`${cat}:${op}_wp_${code}`, def);
        registerSkill(`${cat}:${op}_wp_${code}_plain`, def);
    }
}

