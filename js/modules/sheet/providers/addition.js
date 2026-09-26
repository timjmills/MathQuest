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
import { wordWorkProvider } from './word-work.js';

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
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'touchall', 'tile', 'frame', 'line', 'boxsign']),
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
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'touchall', 'startarrow', 'boxsign']),
    strings: strings({
        // R3 (critic round 3): basic `add` is grade 1, within 20 (1.OA.6), and every item of
        // the band is a fact (gen-operations.js _applyKitFactCell), so the title, the steps and
        // the worked example are the count-on fact's, not the column algorithm's.
        iCan: 'I Can add within 20',
        instructionKey: 'add',
        steps: ['Start with the bigger number.', 'Count on the smaller number.', 'Write the sum.'],
        say: '__ plus __ equals __.',
    }),
    misconceptions: ['forgot-regroup', 'whole-column-total', 'misaligned', 'subtracted'],
    workedSteps: (q) => {
        const ops = operands(q);
        if (ops.length < 2) return [];
        const tpl = q && q.cell && q.cell.template;
        if (tpl !== 'stack' && ops[0] + ops[1] <= 20) return factSteps(ops[0], ops[1]);
        const col = columnAdd(ops.slice(0, 2));
        return clampSteps([step('Line up the digits: ones under ones, tens under tens.')].concat(col.steps).concat(step(`The sum is ${fmt(col.sum)}.`, [{ slot: 'answer', value: String(col.sum) }])));
    },
    wrongAnswer: (q) => { const ops = operands(q); return ops.length >= 2 ? columnWrong(q, ops.slice(0, 2)) : null; },
    stories: storiesFor('+'),
});

/* ========================================================== the column-addition ladder */
// add_{50,100,1k,10k,100k}_{no_regroup,regroup,mixed} (PEDAGOGY_STANDARD L-3): the standard
// algorithm, ones first, a ten regrouped into the next place when a column makes 10 or more.
// Round-4 re-grade: the ladder had no provider, so its Guided page printed no Steps band and its
// Model no worked steps; these are THIS skill's steps (never the count-on fact's).
const PLACES_BY_BAND = { 50: 2, 100: 2, '1k': 3, '10k': 4, '100k': 5 };
const PLACE_TITLE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
const columnAddSteps = (places, regroups) => {
    const out = ['Add the ones.'];
    if (regroups) out.push('10 or more? Write the ones. Regroup the ten into the box above the tens.');
    const next = PLACE_TITLE.slice(1, places);
    if (next.length <= 2) next.forEach((pl) => out.push(`Add the ${pl}${regroups ? ', and any regrouped number' : ''}.`));
    else out.push(`Add each place in turn: ${next.join(', ')}${regroups ? ', with any regrouped number' : ''}.`);
    out.push('Check: the sum is bigger than each number.');
    return out.slice(0, 6);
};
for (const [band, places] of Object.entries(PLACES_BY_BAND)) {
    const within = band === '1k' ? '1,000' : band === '10k' ? '10,000' : band === '100k' ? '100,000' : band;
    for (const [kind, tag] of [['no_regroup', ' (no regrouping)'], ['regroup', ' (with regrouping)'], ['mixed', '']]) {
        registerSkill(`addition:add_${band}_${kind}`, {
            strings: strings({
                iCan: `I Can add within ${within}${tag}`,
                instructionKey: 'add',
                steps: columnAddSteps(places, kind !== 'no_regroup'),
                say: '__ plus __ equals __.',
            }),
            misconceptions: ['forgot-regroup', 'whole-column-total', 'misaligned', 'subtracted'],
            workedSteps: (q) => {
                const ops = operands(q);
                if (ops.length < 2 || !ops.every((n) => Number.isInteger(n) && n >= 0)) return [];
                const col = columnAdd(ops.slice(0, 2));
                return clampSteps(col.steps.concat(step(`The sum is ${fmt(col.sum)}.`, [{ slot: 'answer', value: String(col.sum) }])));
            },
            wrongAnswer: (q) => { const ops = operands(q); return ops.length >= 2 ? columnWrong(q, ops.slice(0, 2)) : null; },
        });
    }
}

/* ===================================================================== add_column_multi */

const multiAddends = (q) => {
    const ops = arr(q.operands).map(num).filter(Number.isFinite);
    if (ops.length >= 2) return ops;
    const m = String(q.text || '').match(/\d[\d,]*/g);
    return m ? m.map(num) : [];
};

registerSkill('addition:add_column_multi', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'touchall', 'startarrow', 'steps']),
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
export function lineSteps(a, b, dir, { verb = 'Jump', noun = 'jumps' } = {}) {
    const end = a + dir * b;
    const side = dir > 0 ? 'right' : 'left';
    // Round-4 re-grade: the start dot is printed on the line, so the worked step finds it.
    const out = [step(`Start at ${a}, the dot.`, [{ slot: 'start', value: String(a) }])];
    if (b <= 10) {
        const marks = [];
        for (let k = 1; k <= b; k++) marks.push({ slot: `jump:${k}`, value: `${a + dir * (k - 1)}-${a + dir * k}` });
        out.push(step(`${verb} ${b} ${b === 1 ? 'space' : 'spaces'} to the ${side}.`, marks));
        out.push(step(`Count the ${noun}: ${countList(1, b)}.`));
    } else {
        const tens = Math.floor(b / 10);
        const ones = b % 10;
        const mid = a + dir * tens * 10;
        out.push(step(`${verb} ${tens} ${tens === 1 ? 'ten' : 'tens'} to the ${side}: ${a} to ${mid}.`, [{ slot: 'jump:10s', value: `${a}-${mid}` }]));
        if (ones) out.push(step(`${verb} ${ones} ${ones === 1 ? 'one' : 'ones'}: ${mid} to ${end}.`, [{ slot: 'jump:1s', value: `${mid}-${end}` }]));
    }
    out.push(step(`You land on ${end}. Write ${end}.`, [{ slot: 'answer', value: String(end) }]));
    return clampSteps(out);
}

registerSkill('addition:number_line_add', {
    strings: strings({
        iCan: 'I Can add by jumping on a number line',
        instructionKey: 'line-jumps',
        steps: [
            'Find the dot. It is the first number.',
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

/* ============================================================================ nl_add */
// Owner request (2026-09-25): nl_add draws on the kit's number line, as number_line_add, one hop
// per number; its missing number can be the sum, the jump or the start.
registerSkill('addition:nl_add', {
    strings: strings({
        iCan: 'I Can add by hopping on a number line',
        instructionKey: 'line-jumps',
        steps: [
            'Find the first number on the line.',
            'Hop to the right, one number each hop.',
            'Count the hops. Write the missing number.',
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
        if (!Number.isFinite(a) || !Number.isFinite(b) || q.missing) return null;
        return chooseWrong(q, [
            { value: a + b - 1, misconception: 'counted-start', explain: `Counted ${a}, the start, as the first hop.` },
            { value: a - b, misconception: 'jumped-wrong-way', explain: 'Hopped to the left, not the right.' },
        ]);
    },
});

/* ====================================================================== word problems */

const WP_BANDS = { 10: '10', 20: '20', 50: '50', 100: '100', '1k': '1,000', '10k': '10,000', '100k': '100,000', '1m': '1,000,000' };

/** 52 - 18 = 46: each column takes the smaller digit from the bigger (misconception list). */
export function smallerFromBigger(a, b) {
    const da = digitsOf(a);
    const db = digitsOf(b);
    let out = 0;
    for (let i = 0; i < da.length; i++) out += Math.abs(da[i] - (db[i] || 0)) * 10 ** i;
    return out;
}

for (const op of ['add', 'sub']) {
    const isAdd = op === 'add';
    for (const [code, band] of Object.entries(WP_BANDS)) {
        // Every story is drawn by the word-work cell (owner ruling 2026-09-25): its strings, Model
        // steps and wrong-operation error come from the shared word-work provider; the story
        // templates stay (the word-problem role of a non-story page still asks for them).
        const def = wordWorkProvider(isAdd ? `I Can solve addition stories (sums to ${band})` : `I Can solve subtraction stories (numbers to ${band})`, {
            stories: storiesFor(isAdd ? '+' : '-'),
        });
        const cat = isAdd ? 'addition' : 'subtraction';
        registerSkill(`${cat}:${op}_wp_${code}`, def);
        registerSkill(`${cat}:${op}_wp_${code}_plain`, def);
    }
}

/* =============================================================== add_sub_patterns (build lane) */

// Build list, lane operations, entry 3 (2026-09-26): a known fact and the same fact in tens and
// hundreds (3 + 4 = 7, 30 + 40 = 70, 300 + 400 = 700). The item's own data is q.ladder
// (gen-ops-build.js). The misconceptions (research notes, 2026-09-26; build list): adding the
// zeros too (30 + 40 = 700), dropping a zero (300 + 400 = 70), and in words writing the number
// for the tens (3 tens + 4 tens = 70 tens).

const ladderOf = (q) => obj(q && q.ladder);
const LADDER_KINDS = ['add', 'sub', 'missing', 'words'];

function ladderStringsBy(pick) {
    const fn = (ref = {}) => strings(pick(ref && ref.q, ref || {}))(ref);
    fn.def = pick(null, {});
    return fn;
}

/** The rows the pupil writes, and the right value of each box in reading order. */
function ladderAsked(d) {
    const rows = d.places.map((pl) => ({ pl, A: d.a * pl, B: d.b * pl, R: d.res * pl }));
    const asked = rows.filter((r, i) => !(i === 0 && d.given));
    const right = [];
    asked.forEach((r) => {
        if (d.kind === 'missing') right.push(r.B);
        else if (d.kind === 'words' && r.pl > 1) { right.push(d.res); right.push(r.R); }
        else right.push(r.R);
    });
    return { asked, right };
}

registerSkill('addition:add_sub_patterns', {
    strings: ladderStringsBy((q, ref = {}) => {
        const d = q ? ladderOf(q) : null;
        const opts = ref.opts || {};
        const forms = Array.isArray(opts.forms) && opts.forms.length ? opts.forms.filter((i) => LADDER_KINDS[i]) : [0];
        const kinds = forms.length ? forms.map((i) => LADDER_KINDS[i]) : ['add'];
        const mixed = !d && kinds.length > 1;
        const kind = d ? (d.kind === 'result' ? (d.op === '-' ? 'sub' : 'add') : d.kind) : kinds[0];
        const sub = kind === 'sub';
        // the places the ladder reaches: the band (to 100, 1000, 10 000) or the item's own rows
        const top = d && Array.isArray(d.places) ? Math.max(...d.places) : ({ 100: 10, 1000: 100, 10000: 1000 }[Number(opts.band)] || 100);
        const units = top >= 1000 ? 'tens, hundreds and thousands' : top >= 100 ? 'tens and hundreds' : 'tens';
        return {
            iCan: mixed ? `I Can use a fact to add and subtract ${units}`
                : kind === 'words' ? `I Can add and subtract ${units} in place words`
                    : kind === 'missing' ? 'I Can use a fact to find a missing number'
                        : sub ? `I Can use a fact to subtract ${units}` : `I Can use a fact to add ${units}`,
            instructionKey: mixed || kind === 'words' ? 'ladder-fill' : kind === 'missing' ? 'ladder-missing' : 'ladder-result',
            steps: kind === 'words'
                ? ['Read the first fact.', 'Tens: the same digits, now tens.', 'Write how many tens.', 'Write the number: put the zero on.']
                : ['Read the first fact.', 'Look down: the digits stay the same.', 'Each row adds one more zero.', 'Write each answer with its zeros.'],
            say: kind === 'words' ? '__ tens and __ tens make __ tens.' : '__ and __ make __, so __ and __ make __.',
            sayValues: (item) => {
                const e = ladderOf(item);
                if (!e) return null;
                if (e.kind === 'words') return [e.a, e.b, e.res];
                const g = e.op === '-' ? 'take away' : 'and';
                const v = e.op === '-' ? 'is' : 'make';
                return `${e.a} ${g} ${e.b} ${v} ${e.res}, so ${e.a * 10} ${g} ${e.b * 10} ${v} ${e.res * 10}.`;
            },
        };
    }),
    misconceptions: ['added-zeros', 'dropped-zero', 'tens-as-number'],
    workedSteps: (q) => {
        const d = ladderOf(q);
        if (!d) return [];
        const g = d.op === '-' ? '−' : '+';
        const { right } = ladderAsked(d);
        const all = right.map((v, i) => ({ slot: `b${i}`, value: String(v) }));
        const out = [step(`Read the fact: ${d.a} ${g} ${d.b} = ${d.res}.`)];
        if (d.kind === 'words') {
            out.push(step(`${d.a} tens ${g} ${d.b} tens = ${d.res} tens.`));
            out.push(step(`${d.res} tens is ${d.res * 10}.`));
        } else if (d.kind === 'missing') {
            out.push(step(`${d.a * 10} ${g} ? = ${d.res * 10}: the missing number is ${d.b * 10}.`));
        } else {
            out.push(step(`${d.a * 10} ${g} ${d.b * 10}: the same digits, one zero: ${d.res * 10}.`));
        }
        out.push(step('Do each row the same way.', all));
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const d = ladderOf(q);
        if (!d) return null;
        const { asked, right } = ladderAsked(d);
        // the first box of a tens (or more) row
        const k = asked.findIndex((r) => r.pl >= 10);
        if (k < 0) return null;
        const first = asked.slice(0, k).reduce((n, r) => n + (d.kind === 'words' && r.pl > 1 ? 2 : 1), 0);
        const r = asked[k];
        const withV = (i, v) => right.map((x, j) => String(j === i ? v : x)).join(', ');
        const c = [];
        if (d.kind === 'words') {
            c.push({ value: withV(first, r.R), misconception: 'tens-as-number', slot: `b${first}`,
                slots: { [`b${first}`]: String(r.R) }, explain: `Wrote ${r.R} ${r.pl === 10 ? 'tens' : 'hundreds'}: it is ${d.res}.` });
        } else {
            const v = d.kind === 'missing' ? r.B * 10 : r.R * 10;
            c.push({ value: withV(first, v), misconception: 'added-zeros', slot: `b${first}`, slots: { [`b${first}`]: String(v) },
                explain: 'Counted the zeros of both numbers: one zero too many.' });
            const drop = d.kind === 'missing' ? r.B / 10 : r.R / 10;
            if (Number.isInteger(drop) && drop > 0) c.push({ value: withV(first, drop), misconception: 'dropped-zero', slot: `b${first}`, slots: { [`b${first}`]: String(drop) }, explain: 'Left off a zero: the place changed.' });
        }
        return chooseWrong(q, c);
    },
});
