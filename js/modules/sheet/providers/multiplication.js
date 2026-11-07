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

/* ======================================================================== dot_array_mult */
// Wave 1 lane D (2026-10-02, critic): the dot array carries a ROWS x COLUMNS frame ("7 rows x 8
// columns", "7 x 8 = [ ]"), so the pupil multiplies two written numbers and does not count 56
// dots; with Support "none" the counts are not written and the pupil finds them in the picture.

const daOf = (q) => {
    const p = q && q.cell && q.cell.template === 'arrays' && q.cell.payload;
    const rows = p ? num(p.rows) : num(q && q.a), cols = p ? num(p.cols) : num(q && q.b);
    return Number.isFinite(rows) && Number.isFinite(cols) ? { rows, cols, bare: !!p && p.kind === 'count_all' } : null;
};
const DA_FRAME = strings({
    iCan: 'I Can multiply using a dot array',
    instructionKey: 'multiply-array',
    steps: ['Read the rows and the columns.', 'Multiply the rows by the columns.', 'Write the answer in the box.'],
    say: '__ rows of __ is __.',
    sayValues: (q) => { const d = daOf(q); return d ? [d.rows, d.cols, d.rows * d.cols] : null; },
    vocabulary: ['row', 'column', 'array'],
});
const DA_BARE = strings(Object.assign({}, DA_FRAME.def, {
    instructionKey: 'count-all',
    steps: ['Count the rows.', 'Count the dots in one row.', 'Multiply the two numbers. Write how many in all.'],
}));
const daStrings = (ref = {}) => ((ref && ref.q && (daOf(ref.q) || {}).bare) ? DA_BARE : DA_FRAME)(ref);
daStrings.def = DA_FRAME.def;

registerSkill('multiplication:dot_array_mult', {
    strings: daStrings,
    misconceptions: ['added', 'one-row-short', 'miscounted'],
    workedSteps: (q) => {
        const d = daOf(q);
        const t = num(q.ans);
        if (!d || !Number.isFinite(t)) return [];
        return [
            step(`There are ${d.rows} rows and ${d.cols} columns.`),
            step(`Multiply: ${d.rows} \u00d7 ${d.cols}. Skip count by ${d.cols}, ${d.rows} times: ${countList(d.cols, t, d.cols)}.`),
            step(`${d.rows} \u00d7 ${d.cols} = ${t}. Write ${t}.`, [{ slot: 'total', value: String(t) }]),
        ];
    },
    wrongAnswer: (q) => {
        const d = daOf(q);
        if (!d) return null;
        const t = d.rows * d.cols;
        return chooseWrong(q, [
            { value: d.rows + d.cols, misconception: 'added', slot: 'total', slots: { total: String(d.rows + d.cols) },
                explain: `Added ${d.rows} and ${d.cols}. An array is ${d.rows} rows OF ${d.cols}: multiply.` },
            { value: t - d.cols, misconception: 'one-row-short', slot: 'total', slots: { total: String(t - d.cols) },
                explain: `Counted ${d.rows - 1} rows, not ${d.rows}.` },
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


/* ===================================================================== mult_properties */
// Form 0 (the order property, lesson 3a) and form 1 (the distributive split, lf-ops 2026-11-07) draw the
// `arrays-turn` cell; forms 2-3 (times 1, times 0) draw the `equation` cell. Each hook answers for its kind
// (ops-tables card §6: MU-M3 turn-recount, MU-M4 times-zero, MU-M5 times-one, MU-M7 split-drop-part).

const turnOf = (q) => {
    const c = q && q.cell;
    if (!c || c.template !== 'arrays-turn') return null;
    const p = obj(c.payload);
    if (!p) return null;
    const rows = num(p.rows), cols = num(p.cols);
    if (!Number.isFinite(rows) || !Number.isFinite(cols)) return null;
    return { rows, cols, product: rows * cols, type: p.type || 'known', ask: p.ask || 'product' };
};

/** A distributive split item (arrays-turn type 'split'), or null. */
const splitOf = (q) => {
    const t = turnOf(q);
    if (!t || t.type !== 'split') return null;
    const p = q.cell.payload;
    const top = Math.round(num(p.top));
    if (!(top >= 1 && top < t.rows)) return null;
    return { rows: t.rows, cols: t.cols, top, rest: t.rows - top, p1: top * t.cols, p2: (t.rows - top) * t.cols, product: t.product, bare: p.draw === 'none' };
};
/** A times-1 / times-0 fact (equation cell, forms 2-3), or null. */
const unitOf = (q) => {
    const c = q && q.cell;
    if (!c || c.template !== 'equation') return null;
    const p = obj(c.payload);
    const a = num(p && p.a), b = num(p && p.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const k = a === 0 || b === 0 ? 0 : a === 1 || b === 1 ? 1 : null;
    if (k === null) return null;
    const n = (a === k ? b : a);
    return { a, b, k, n, first: a === k, product: a * b };
};

const TURN_STRINGS = {
    both: strings({
        iCan: 'I Can turn an array to multiply',
        instructionKey: 'turn-facts',
        steps: ['Look at the array.', 'Write the fact.', 'Turn the array.', 'Write the new fact.', 'Check: same product.'],
        say: '__ times __ equals __ times __.',
        sayValues: (q) => { const t = turnOf(q); return t ? [t.rows, t.cols, t.cols, t.rows] : ''; },
    }),
    known: strings({
        iCan: 'I Can turn an array to multiply',
        instructionKey: 'turn-new',
        steps: ['Look at the array.', 'Read the fact.', 'Turn the array.', 'Write the new fact.', 'Check: same product.'],
        say: '__ times __ equals __ times __.',
        sayValues: (q) => { const t = turnOf(q); return t ? [t.rows, t.cols, t.cols, t.rows] : ''; },
    }),
    missing: strings({
        iCan: 'I Can turn a fact to multiply',
        instructionKey: 'missing',
        steps: ['Read the fact.', 'Turn it: swap the two factors.', 'The product stays the same.', 'Write the missing number.'],
        say: '__ times __ equals __ times __.',
        sayValues: (q) => { const t = turnOf(q); return t ? [t.rows, t.cols, t.cols, t.rows] : ''; },
    }),
    split: strings({
        iCan: 'I Can break apart an array to multiply',
        instructionKey: 'missing-many',
        steps: ['Look at the two parts of the array.', 'Multiply the top part.', 'Multiply the bottom part.', 'Add the two parts. Write the whole.'],
        say: '__ times __ is __ plus __.',
        sayValues: (q) => { const t = splitOf(q); return t ? [t.rows, t.cols, t.p1, t.p2] : ''; },
        vocabulary: ['array', 'row', 'part'],
    }),
    unit: strings({
        iCan: 'I Can multiply by 1 and by 0',
        instructionKey: 'multiply',
        steps: ['Read the fact.', 'Find the 1 or the 0.', 'Times 1: the other number. Times 0: zero.', 'Write the product.'],
        say: '__ times __ equals __.',
        sayValues: (q) => { const u = unitOf(q); return u ? [u.a, u.b, u.product] : ''; },
        vocabulary: ['times', 'zero', 'product'],
    }),
    other: strings({
        iCan: 'I Can use the properties of multiplication',
        instructionKey: 'missing',
        steps: ['Read the fact.', 'Look at the numbers that change.', 'Write the missing number.'],
        say: 'The answer is __.',
        sayValues: (q) => [q && q.ans],
    }),
};

/** A fact never breaks after its sign: "3 × 4 = 12" joined with no-break spaces (print-lint WRAP-OP, lane lf-ops). */
const nbFacts = (steps) => (Array.isArray(steps) ? steps.map((s) => (s && typeof s.text === 'string'
    ? Object.assign({}, s, { text: s.text.replace(/(\d) ([×=+]) (?=\d)/g, '$1\u00a0$2\u00a0') }) : s)) : steps);

registerSkill('multiplication:mult_properties', {
    strings: (ref = {}) => {
        const t = turnOf(ref && ref.q);
        const q = ref && ref.q;
        if (t) return TURN_STRINGS[t.type] ? TURN_STRINGS[t.type](ref) : TURN_STRINGS.known(ref);
        if (unitOf(q)) return TURN_STRINGS.unit(ref);
        if (q) return TURN_STRINGS.other(ref);
        // A page with no item yet (the dialog, the title from the options): the ticked property; the order
        // property by default; several ticked, the family's own line.
        let f = ref && ref.opts && ref.opts.forms;
        if (typeof f === 'number') f = [f];
        f = Array.isArray(f) ? [...new Set(f.map(Number))] : [0];
        if (f.length === 1 && f[0] === 1) return TURN_STRINGS.split(ref);
        if (f.length && f.every((v) => v === 2 || v === 3)) return TURN_STRINGS.unit(ref);
        if (f.length === 1 && f[0] === 0) return TURN_STRINGS.both(ref);
        return TURN_STRINGS.other(ref);
    },
    misconceptions: ['turn-recount', 'turn-no-swap', 'turn-product-factor', 'split-drop-part', 'split-one-part', 'times-one', 'times-zero'],
    workedSteps: (q) => nbFacts(mpSteps(q)),
    wrongAnswer: (q) => mpWrong(q),
    footprint: { kind: 'arrays-turn', factLike: false, maxCols: 2, measure: true },
});

function mpSteps(q) {
        const sp = splitOf(q);
        if (sp) {
            return [
                sp.bare ? step(`Break ${sp.rows} × ${sp.cols} into ${sp.top} × ${sp.cols} and ${sp.rest} × ${sp.cols}.`)
                    : step(`Look at the parts: ${sp.top} rows of ${sp.cols} and ${sp.rest} rows of ${sp.cols}.`, [{ slot: 'array', value: 'shown' }]),
                step(`${sp.top} × ${sp.cols} = ${sp.p1}. Write ${sp.p1}.`, [{ slot: 'p1', value: String(sp.p1) }]),
                step(`${sp.rest} × ${sp.cols} = ${sp.p2}. Write ${sp.p2}.`, [{ slot: 'p2', value: String(sp.p2) }]),
                step(`Add the parts: ${sp.p1} + ${sp.p2} = ${sp.product}. So ${sp.rows} × ${sp.cols} = ${sp.product}.`, [{ slot: 't', value: String(sp.product) }]),
            ];
        }
        const u = unitOf(q);
        if (u) {
            const done = step(`Write ${u.product}.`, [{ slot: 'answer', value: String(u.product) }]);
            if (u.k === 1) return [step(`Read the fact: ${u.a} × ${u.b}.`), step(u.first ? `1 group of ${u.n} is ${u.n}.` : `${u.n} groups of 1 is ${u.n}.`), step(`Times 1 keeps the number: ${u.n}.`), done];
            return [step(`Read the fact: ${u.a} × ${u.b}.`), step(u.first ? `0 groups of ${u.n} is nothing.` : `${u.n} groups of 0 is nothing.`), step('Times 0 makes 0.'), done];
        }
        const t = turnOf(q);
        if (!t) return [];
        const { rows: r, cols: c, product: P } = t;
        if (t.type === 'missing') {
            const v = t.ask === 'factor' ? r : P;
            return [
                step(`Read the fact: ${r} × ${c} = ${P}.`),
                step(`Turn it: ${c} × ${r}. The same two factors.`),
                step(`The product stays ${P}.`),
                step(`Write ${v}.`, [{ slot: 'answer', value: String(v) }]),
            ];
        }
        const first = t.type === 'both'
            ? step(`Write the fact: ${r} × ${c} = ${P}.`, [{ slot: 'fact', value: String(P) }])
            : step(`Read the fact: ${r} × ${c} = ${P}.`);
        const last = t.type === 'both'
            ? step(`Write the new fact: ${c} × ${r} = ${P}.`, [{ slot: 'turned', value: String(P) }])
            : step(`Write the new fact: ${c} × ${r} = ${P}.`, [{ slot: 'b1', value: String(c) }, { slot: 'b2', value: String(r) }, { slot: 'b3', value: String(P) }]);
        return [
            step(`Look at the array: ${r} rows of ${c}.`, [{ slot: 'array', value: 'shown' }]),
            first,
            step(`Turn the array: ${c} rows of ${r}.`, [{ slot: 'turn', value: 'shown' }]),
            last,
            // (lesson 3a r2, critic D3: the Critical Atom is a step of its own - it writes nothing, so the chart
            // prints it as the line under its panels and the Steps list carries it)
            step(`Check: same product, ${P}. No recount.`),
        ];
}

function mpWrong(q) {
        const sp = splitOf(q);
        if (sp) {
            // MU-M7: the second part written as its rows alone (6 × 7 = (6 × 5) + 2), or the whole read as one part.
            const dropped = sp.p1 + sp.rest;
            return chooseWrong(q, [
                { value: `${sp.p1}, ${sp.rest}, ${dropped}`, misconception: 'split-drop-part', slot: 'p2',
                    slots: { p1: String(sp.p1), p2: String(sp.rest), t: String(dropped) },
                    explain: `Wrote ${sp.rest} for ${sp.rest} × ${sp.cols}: the bottom part is ${sp.rest} rows of ${sp.cols}, ${sp.p2}.` },
                { value: `${sp.p1}, ${sp.p2}, ${sp.p1}`, misconception: 'split-one-part', slot: 't',
                    slots: { p1: String(sp.p1), p2: String(sp.p2), t: String(sp.p1) },
                    explain: `Wrote one part as the whole. The whole is both parts: ${sp.p1} + ${sp.p2} = ${sp.product}.` },
            ]);
        }
        const u = unitOf(q);
        if (u) {
            // MU-M5: times 1 adds one; MU-M4: times 0 gives the other number.
            return u.k === 1
                ? chooseWrong(q, [{ value: u.n + 1, misconception: 'times-one', slot: 'answer', explain: `Added 1. ${u.a} × ${u.b} is ${u.first ? `1 group of ${u.n}` : `${u.n} groups of 1`}: ${u.n}.` }], { rotate: false })
                : chooseWrong(q, [{ value: u.n, misconception: 'times-zero', slot: 'answer', explain: `Wrote ${u.n}. ${u.first ? `0 groups of ${u.n}` : `${u.n} groups of 0`} is 0.` }], { rotate: false });
        }
        const t = turnOf(q);
        if (!t) return null;
        const { rows: r, cols: c, product: P } = t;
        // A recount that is one row short: the turned array counted again, a row missed.
        const recount = P - r;
        if (t.type === 'both') {
            return chooseWrong(q, [
                { value: `${P}, ${recount}`, misconception: 'turn-recount', slot: 'b', slots: { a: String(P), b: String(recount) },
                    explain: `Counted the turned array again and missed a row: ${recount}. Turning it does not change the total.` },
            ]);
        }
        if (t.type === 'known') {
            const cands = [
                { value: `${c}, ${r}, ${recount}`, misconception: 'turn-recount', slot: 'b3', slots: { b1: String(c), b2: String(r), b3: String(recount) },
                    explain: `Counted the turned array again and got ${recount}. It is the same ${P} dots.` },
                { value: `${c}, ${P}, ${P}`, misconception: 'turn-product-factor', slot: 'b2', slots: { b1: String(c), b2: String(P), b3: String(P) },
                    explain: `Wrote the product ${P} as a factor. The new fact is ${c} × ${r}.` },
            ];
            // Wrote the same order: only a different answer when the array is not a square.
            if (r !== c) cands.unshift({ value: `${r}, ${c}, ${P}`, misconception: 'turn-no-swap', slot: 'b1', slots: { b1: String(r), b2: String(c), b3: String(P) },
                explain: `Wrote ${r} × ${c} again. The turned array has ${c} rows of ${r}.` });
            return chooseWrong(q, cands);
        }
        if (t.ask === 'factor') {
            return chooseWrong(q, [
                ...(r !== c ? [{ value: c, misconception: 'turn-no-swap', slot: 'answer', explain: `Wrote ${c} again. ${c} × ${r} needs the other factor, ${r}.` }] : []),
                { value: P, misconception: 'turn-product-factor', slot: 'answer', explain: `Wrote the product ${P} as a factor.` },
            ]);
        }
        return chooseWrong(q, [
            { value: recount, misconception: 'turn-recount', slot: 'answer', explain: `Worked it out again and got ${recount}. Turning a fact keeps the product: ${P}.` },
            { value: r + c, misconception: 'turn-product-factor', slot: 'answer', explain: `Added ${r} and ${c}. The product is ${P}.` },
        ]);
}
