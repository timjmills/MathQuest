// js/modules/sheet/providers/multiplication.js
// Skill providers for multiplication: mult_facts, arrays_groups, area_model_mult (+ _hard),
// mult_chart (+ _easy).
//
// The critic's re-grade of 2026-09-25 found the generic "Read the fact. Count by the second
// number." on arrays, charts and the area model. Each skill here teaches its own model: equal
// groups and rows on arrays, partial products on the area model, row-meets-column on the chart.

import { registerSkill } from '../contract.js';
import { num, arr, obj, operands, countList, chooseWrong, strings, step, clampSteps } from './util.js';
import { storiesFor } from './stories.js';

/* =========================================================================== mult_facts */

registerSkill('multiplication:mult_facts', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['touch', 'skip', 'array', 'boxsign']),
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

function chartCells(q) {
    const d = obj(q.multChartData);
    if (d && Array.isArray(d.missingCells)) return d.missingCells.map((m) => ({ r: num(m.r), c: num(m.c), p: num(m.product) }));
    const keys = arr(q.keyParts).map(num);
    const [a, b] = operands(q);
    if (!keys.length) return [];
    // The legacy chart names only its first gap (q.a x q.b); the others are keyed by value.
    return keys.map((p, i) => (i === 0 && Number.isFinite(a) && Number.isFinite(b) && a * b === p ? { r: a, c: b, p } : { r: NaN, c: NaN, p }));
}

function chartAnswerOf(q, list) {
    if (Array.isArray(q.ans)) return list.map(String);
    const sep = /,\s/.test(String(q.ans)) ? ', ' : ',';
    return list.join(sep);
}

const CHART_STRINGS = {
    instructionKey: 'chart-fill',
    steps: [
        'Put one finger on the row number.',
        'Put another finger on the column number.',
        'Slide them to the box where they meet.',
        'Multiply the two numbers. Write the product there.',
    ],
    say: '__ times __ equals __.',
    sayValues: (q) => { const c = chartCells(q).find((x) => Number.isFinite(x.r)); return c ? [c.r, c.c, c.p] : null; },
};

function chartSteps(q) {
    const cells = chartCells(q);
    if (!cells.length) return [];
    const out = [];
    const known = cells.filter((c) => Number.isFinite(c.r));
    known.slice(0, 3).forEach((c) => {
        const i = cells.indexOf(c);
        out.push(step(`Row ${c.r}, column ${c.c}: ${c.r} × ${c.c} = ${c.p}.`, [{ slot: `cell${i}`, value: String(c.p) }]));
    });
    if (out.length === 1) {
        out.unshift(step(`Find row ${known[0].r} and column ${known[0].c}.`));
        out.push(step(`Write ${known[0].p} where they meet.`));
    }
    const all = cells.map((c, i) => ({ slot: `cell${i}`, value: String(c.p) }));
    if (known.length < cells.length) out.push(step('Do the same for each empty box.', all));
    else out.push(step('Check: count along each row by the row number.', all));
    while (out.length < 3) out.unshift(step('Find the row number on the left edge.'));
    return clampSteps(out);
}

function chartWrong(q) {
    const cells = chartCells(q);
    if (!cells.length) return null;
    const values = cells.map((c) => c.p);
    const c0 = cells[0];
    const c = [];
    if (Number.isFinite(c0.r) && c0.c > 1) {
        const v = values.slice(); v[0] = c0.r * (c0.c - 1);
        c.push({ value: chartAnswerOf(q, v), misconception: 'read-next-column', slot: 'cell0', slots: { cell0: String(v[0]) },
            explain: `Wrote ${c0.r} × ${c0.c - 1}: read the column next to it.` });
    }
    if (Number.isFinite(c0.r)) {
        const v = values.slice(); v[0] = c0.r + c0.c;
        c.push({ value: chartAnswerOf(q, v), misconception: 'added', slot: 'cell0', slots: { cell0: String(v[0]) },
            explain: `Added ${c0.r} and ${c0.c} instead of multiplying.` });
    }
    const last = values.length - 1;
    const v = values.slice(); v[last] = values[last] + (Number.isFinite(cells[last].r) ? cells[last].r : 1);
    c.push({ value: chartAnswerOf(q, v), misconception: 'read-next-column', slot: `cell${last}`, slots: { [`cell${last}`]: String(v[last]) },
        explain: 'Read the box one column over.' });
    return chooseWrong(q, c);
}

registerSkill('multiplication:mult_chart', {
    strings: strings(Object.assign({ iCan: 'I Can use a multiplication chart to find products' }, CHART_STRINGS)),
    misconceptions: ['read-next-column', 'added'],
    workedSteps: chartSteps,
    wrongAnswer: chartWrong,
});

registerSkill('multiplication:mult_chart_easy', {
    strings: strings(Object.assign({ iCan: 'I Can use a multiplication chart to find products' }, CHART_STRINGS)),
    misconceptions: ['read-next-column', 'added'],
    workedSteps: chartSteps,
    wrongAnswer: chartWrong,
});
