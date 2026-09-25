// js/modules/sheet/providers/multiplication.js
// Skill providers for multiplication: mult_facts, arrays_groups, area_model_mult (+ _hard),
// (mult_chart and mult_chart_easy: see countby.js).
//
// The critic's re-grade of 2026-09-25 found the generic "Read the fact. Count by the second
// number." on arrays, charts and the area model. Each skill here teaches its own model: equal
// groups and rows on arrays, partial products on the area model, row-meets-column on the chart.

import { registerSkill } from '../contract.js';
import { num, arr, obj, operands, countList, chooseWrong, strings, step, clampSteps } from './util.js';
import { storiesFor } from './stories.js';

/* =========================================================================== mult_facts */

registerSkill('multiplication:mult_facts', {
    strings: strings({
        iCan: 'I Can multiply facts to 12',
        instructionKey: 'multiply',
        steps: [
            'Read 3 × 4 as 3 groups of 4.',
            'Skip count by the size of one group.',
            'Stop when you have counted every group.',
            'Write the product.',
        ],
        say: '__ times __ equals __.',
    }),
    misconceptions: ['added', 'times-zero', 'times-one', 'one-group-short'],
    workedSteps: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return [];
        const p = a * b;
        const done = step(`Write ${p}.`, [{ slot: 'ans', value: String(p) }]);
        if (a === 0 || b === 0) return [step(`${a} × ${b}: one number is 0.`), step('Zero groups, or groups of 0, make 0.'), done];
        if (a === 1 || b === 1) return [step(`${a} × ${b} is ${a === 1 ? `1 group of ${b}` : `${a} groups of 1`}.`), step(`That is ${p}.`), done];
        return [
            step(`${a} × ${b} is ${a} groups of ${b}.`),
            step(`Count by ${b}, ${a} times: ${countList(b, p, b)}.`),
            step(`${a} groups of ${b} is ${p}.`),
            done,
        ];
    },
    wrongAnswer: (q) => {
        const [a, b] = operands(q);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
        const p = a * b;
        const slot = 'ans';
        if (a === 0 || b === 0) {
            return chooseWrong(q, [{ value: a + b, misconception: 'times-zero', slot, explain: 'Thought a number times 0 is the number.' }], { rotate: false });
        }
        if (a === 1 || b === 1) {
            return chooseWrong(q, [{ value: p + 1, misconception: 'times-one', slot, explain: 'Thought a number times 1 is one more.' }], { rotate: false });
        }
        return chooseWrong(q, [
            { value: a + b, misconception: 'added', slot, explain: 'Added instead of multiplying.' },
            { value: p - b, misconception: 'one-group-short', slot, explain: `Counted ${a - 1} groups of ${b}, not ${a}.` },
        ]);
    },
    stories: storiesFor('x'),
});

/* ======================================================================== arrays_groups */

function arrayParts(q) {
    const k = arr(q.keyParts).map(num);
    if (k.length >= 3 && k.every(Number.isFinite)) {
        return { groups: k[0], size: k[1], total: k[2], kind: /rows?/i.test(String(q.text || '')) ? 'row' : 'group' };
    }
    return null;
}

registerSkill('multiplication:arrays_groups', {
    strings: strings({
        iCan: 'I Can use arrays and equal groups to multiply',
        instructionKey: 'groups-total',
        steps: [
            'Count the rows or the groups.',
            'Count how many are in one row or group.',
            'Skip count by that number, once for each row or group.',
            'Write how many in all.',
        ],
        say: '__ groups of __ is __.',
        sayValues: (q) => { const p = arrayParts(q); return p ? [p.groups, p.size, p.total] : `There are ${q.ans} dots in all.`; },
    }),
    misconceptions: ['added', 'one-group-short', 'miscounted'],
    workedSteps: (q) => {
        const p = arrayParts(q);
        const t = num(q.ans);
        if (!p) {
            if (!Number.isFinite(t)) return [];
            return [
                step('Count the dots in one row.'),
                step('Count the rows.'),
                step('Skip count by the row size, once for each row.'),
                step(`There are ${t} dots. Write ${t}.`, [{ slot: 'answer', value: String(t) }]),
            ];
        }
        const many = p.kind === 'row' ? 'rows' : 'groups';
        return [
            step(`Count the ${many}: ${p.groups}.`, [{ slot: 'groups', value: String(p.groups) }]),
            step(`Count one ${p.kind}: ${p.size} in each.`, [{ slot: 'size', value: String(p.size) }]),
            step(`Count by ${p.size}, ${p.groups} times: ${countList(p.size, p.total, p.size)}.`),
            step(`${p.groups} ${many} of ${p.size} is ${p.total}. Write ${p.total}.`, [{ slot: 'total', value: String(p.total) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = arrayParts(q);
        if (!p) {
            const t = num(q.ans);
            if (!Number.isFinite(t)) return null;
            return chooseWrong(q, [
                { value: t + 1, misconception: 'miscounted', explain: 'Counted one dot twice.' },
                { value: t - 1, misconception: 'miscounted', explain: 'Missed one dot.' },
            ]);
        }
        return chooseWrong(q, [
            { value: p.groups + p.size, misconception: 'added', slot: 'total',
                slots: { groups: String(p.groups), size: String(p.size), total: String(p.groups + p.size) },
                explain: `Added ${p.groups} and ${p.size} instead of counting ${p.groups} groups of ${p.size}.` },
            { value: p.total - p.size, misconception: 'one-group-short', slot: 'total',
                slots: { groups: String(p.groups), size: String(p.size), total: String(p.total - p.size) },
                explain: `Skip counted ${p.groups - 1} times, not ${p.groups}.` },
        ].map((c) => Object.assign(c, { value: typeof q.ans === 'string' ? String(c.value) : c.value })));
    },
});

/* ======================================================================== area models */

/** 80 -> 8, 300 -> 3: the product a pupil gets when the zeros are dropped. */
const stripZeros = (n) => { let v = Math.abs(n); while (v >= 10 && v % 10 === 0) v /= 10; return v; };

function areaModel(q) {
    const d = obj(q.areaModelData);
    if (!d) return null;
    if (Array.isArray(d.rowParts) && Array.isArray(d.colParts)) {
        const rows = d.rowParts.map(num);
        const cols = d.colParts.map(num);
        return { grid: true, a: num(d.num1), b: num(d.num2), rows, cols, product: num(d.product) };
    }
    if (Array.isArray(d.parts)) {
        const m = num(d.multiplier);
        const parts = d.parts.map((p) => num(p && typeof p === 'object' ? p.value : p));
        return { grid: false, a: m, b: num(d.multiplicand), rows: [m], cols: parts, product: num(d.product) };
    }
    return null;
}

function areaSteps(q) {
    const M = areaModel(q);
    if (!M) return [];
    const out = [];
    if (M.grid) out.push(step(`Split ${M.a} into ${M.rows.join(' + ')}. Split ${M.b} into ${M.cols.join(' + ')}.`));
    else out.push(step(`Split ${M.b} into ${M.cols.join(' + ')}.`));
    const partials = [];
    M.rows.forEach((r, i) => {
        const bits = [];
        const marks = [];
        M.cols.forEach((c, j) => {
            const p = r * c;
            partials.push(p);
            bits.push(`${r} × ${c} = ${p}`);
            marks.push({ slot: M.grid ? `r${i}c${j}` : `part${j}`, value: String(p) });
        });
        if (M.grid) out.push(step(`Row ${r}: ${bits.join(', ')}.`, marks));
        else bits.forEach((b, j) => out.push(step(`${b}. Write it in part ${j + 1}.`, [marks[j]])));
    });
    out.push(step(`Add the parts: ${partials.join(' + ')} = ${M.product}.`, [{ slot: 'total', value: String(M.product) }]));
    return clampSteps(out);
}

function areaWrong(q) {
    const M = areaModel(q);
    if (!M) return null;
    const c = [];
    // Dropped the zeros of the biggest part: 7 × 80 written as 56.
    let bi = 0; let bj = 0; let best = -1;
    M.rows.forEach((r, i) => M.cols.forEach((col, j) => { if (r * col > best) { best = r * col; bi = i; bj = j; } }));
    const r = M.rows[bi]; const col = M.cols[bj];
    const dropped = stripZeros(r) * stripZeros(col);
    if (dropped !== r * col) {
        const slot = M.grid ? `r${bi}c${bj}` : `part${bj}`;
        c.push({ value: M.product - r * col + dropped, misconception: 'dropped-zeros', slot,
            slots: { [slot]: String(dropped), total: String(M.product - r * col + dropped) },
            explain: `Wrote ${r} × ${col} as ${dropped}: the zeros are missing.` });
    }
    // Left the last (ones) part out of the total.
    const lastRow = M.rows[M.rows.length - 1];
    const lastCol = M.cols[M.cols.length - 1];
    c.push({ value: M.product - lastRow * lastCol, misconception: 'left-out-part', slot: 'total',
        explain: `Did not add the ${lastRow} × ${lastCol} part.` });
    return chooseWrong(q, c);
}

const AREA_STRINGS = {
    instructionKey: 'multiply',
    steps: [
        'Read the parts at the top: the number split by place.',
        'Multiply to find the area of each part.',
        'Write each product in its part of the model.',
        'Add the parts. Write the total.',
    ],
    say: '__ times __ equals __.',
    sayValues: (q) => { const M2 = areaModel(q); return M2 ? [M2.a, M2.b, M2.product] : null; },
};

registerSkill('multiplication:area_model_mult', {
    strings: strings(Object.assign({ iCan: 'I Can multiply with an area model' }, AREA_STRINGS)),
    misconceptions: ['dropped-zeros', 'left-out-part'],
    workedSteps: areaSteps,
    wrongAnswer: areaWrong,
    stories: storiesFor('x'),
});

registerSkill('multiplication:area_model_mult_hard', {
    strings: strings(Object.assign({ iCan: 'I Can multiply two numbers with an area model' }, AREA_STRINGS)),
    misconceptions: ['dropped-zeros', 'left-out-part'],
    workedSteps: areaSteps,
    wrongAnswer: areaWrong,
    stories: storiesFor('x'),
});

/* =========================================================================== mult_chart */
// mult_chart and mult_chart_easy moved to countby.js (2026-09-25): the chart now has four tasks
// (fill, the factors on its edges, shading multiples, a row's rule), and each needs its own words.

