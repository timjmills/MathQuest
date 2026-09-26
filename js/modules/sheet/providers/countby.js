// js/modules/sheet/providers/countby.js
// Skill providers for the count-by family of 2026-09-25 (SKILL_CELL_CONTRACT.md section 3.8):
//
//   multiplication:count_by_tables      one count-by row per table ("Count by 1-12")
//   patterns:number_patterns_rule       count on / back, double / halve, x 10, growing steps
//   multiplication:mult_chart (+ _easy) the chart to fill, its factors, its multiples, a row's rule
//   multiplication:nl_mult, division:nl_div   equal hops on a number line
//
// Each item carries its own plain data (q.countBy, q.pattern, q.chartTask + q.multChartData,
// q.hopLine), written by js/modules/gen-mult-patterns.js; the providers read only that, so the
// same item always gets the same worked steps and the same wrong answer.
//
// The misconceptions are the real ones for a skip count (research notes, 2026-09-25): skipping a
// multiple (writing the one after), counting on by ONE at a gap, a place-value slip where the
// count crosses a hundred (96, 108 written 96, 98), ADDING where the rule doubles, reading the
// wrong row or column of the chart, and on a hop line counting the tick marks instead of the hops.
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { num, arr, obj, operands, chooseWrong, strings, step, clampSteps, fmt } from './util.js';

/** A `strings` member whose library key (and steps) depend on the item: `pick(q)` -> def. */
function stringsBy(pick) {
    const fn = (ref = {}) => strings(pick(ref && ref.q, ref || {}))(ref);
    fn.def = pick(null);
    return fn;
}

const listOf = (q) => arr(q.keyParts).length ? arr(q.keyParts).map(String) : String(q.ans).split(/\s*,\s*/);
const joinLike = (q, parts) => (Array.isArray(q.ans) ? parts.map(String) : parts.map(String).join(', '));

/* ======================================================================= count by 1-12 */

function countData(q) {
    const d = obj(q.countBy);
    if (d && Array.isArray(d.values)) return d;
    const t = num(q.a);
    if (!Number.isFinite(t)) return null;
    const values = Array.from({ length: 12 }, (_, i) => t * (i + 1));
    const keys = listOf(q).map(num);
    const blanks = keys.map((k) => values.indexOf(k)).filter((i) => i > 0);
    return { step: t, values, blanks };
}

/** Worked steps of a row with gaps: jump by the step to each missing number (slots blank0 ..). */
function rowSteps(values, blanks, stepText, jump) {
    if (!blanks.length) return [];
    const out = [step(stepText)];
    const first = blanks[0];
    out.push(step(`${fmt(values[first - 1])} ${jump(first)} = ${fmt(values[first])}. Write ${fmt(values[first])}.`, [{ slot: 'blank0', value: String(values[first]) }]));
    if (blanks.length > 1) {
        const k = 1, i = blanks[k];
        out.push(step(`${fmt(values[i - 1])} ${jump(i)} = ${fmt(values[i])}. Write ${fmt(values[i])}.`, [{ slot: `blank${k}`, value: String(values[i]) }]));
    }
    out.push(step('Do the same at every gap. Check each jump.', blanks.map((i, k) => ({ slot: `blank${k}`, value: String(values[i]) }))));
    return clampSteps(out);
}

/** Wrong rows a pupil really writes: every gap one multiple on, a count on by one, a hundred slip. */
function rowWrongs(q, values, blanks, stepN, { rule = null } = {}) {
    const key = listOf(q);
    const tail = rule !== null ? [String(rule)] : [];
    const c = [];
    if (!blanks.length) return null;
    // skipped a multiple: wrote the NEXT number at the first gap and carried on from there
    const skip = blanks.map((i, k) => (k === 0 ? values[i] + stepN : values[i]));
    c.push({ value: joinLike(q, [...skip, ...tail]), misconception: 'skipped-multiple', slot: 'b0', slots: { b0: String(skip[0]) },
        explain: `Skipped a number: wrote ${fmt(skip[0])}, not ${fmt(values[blanks[0]])}.` });
    // counted on by one at a gap
    const i1 = blanks.find((i) => i > 0 && !blanks.includes(i - 1));
    if (i1 !== undefined && stepN !== 1) {
        const k = blanks.indexOf(i1);
        const v = blanks.map((i) => values[i]); v[k] = values[i1 - 1] + 1;
        c.push({ value: joinLike(q, [...v, ...tail]), misconception: 'counted-by-one', slot: `b${k}`, slots: { [`b${k}`]: String(v[k]) },
            explain: `Counted on by 1 after ${fmt(values[i1 - 1])}, not by ${fmt(stepN)}.` });
    }
    // a place-value slip where the count crosses a hundred (96, 108 written as 98)
    const i2 = blanks.find((i) => i > 0 && Math.floor(values[i] / 100) > Math.floor(values[i - 1] / 100) && values[i] - 10 > values[i - 1]);
    if (i2 !== undefined) {
        const k = blanks.indexOf(i2);
        const v = blanks.map((i) => values[i]); v[k] = values[i2] - 10;
        c.push({ value: joinLike(q, [...v, ...tail]), misconception: 'hundred-slip', slot: `b${k}`, slots: { [`b${k}`]: String(v[k]) },
            explain: `Crossed the hundred and lost a ten: wrote ${fmt(v[k])}, not ${fmt(values[i2])}.` });
    }
    const w = chooseWrong(q, c);
    if (w && key.length) w.display = String(Array.isArray(w.value) ? w.value.join(', ') : w.value);
    return w;
}

registerSkill('multiplication:count_by_tables', {
    strings: strings({
        iCan: 'I Can count by 1 to 12',
        instructionKey: 'count-by-row',
        steps: [
            'Read the number in the box. That is the jump.',
            'Add the jump to a number to get the next one.',
            'Write each missing number in its box.',
            'Check: the last number is 12 jumps.',
        ],
        say: 'I count by __: __, __, __.',
        sayValues: (q) => { const d = countData(q); return d ? [d.step, d.values[0], d.values[1], d.values[2]] : null; },
    }),
    misconceptions: ['skipped-multiple', 'counted-by-one', 'hundred-slip'],
    workedSteps: (q) => {
        const d = countData(q);
        if (!d) return [];
        return rowSteps(d.values, d.blanks, `Count by ${d.step}: each jump adds ${d.step}.`, () => `+ ${d.step}`);
    },
    wrongAnswer: (q) => { const d = countData(q); return d ? rowWrongs(q, d.values, d.blanks, d.step) : null; },
});

/* ===================================================================== number patterns */

function patternData(q) {
    const d = obj(q.pattern);
    return d && Array.isArray(d.values) ? d : null;
}
const JUMP = {
    add: (d) => () => `+ ${fmt(d.step)}`,
    sub: (d) => () => `− ${fmt(d.step)}`,
    double: () => () => '× 2',
    halve: () => () => '÷ 2',
    times10: () => () => '× 10',
    grow: (d) => (i) => `+ ${fmt(i * d.step)}`,
};
const RULE_WORDS = {
    add: (d) => `count on by ${fmt(d.step)}`, sub: (d) => `count back by ${fmt(d.step)}`,
    double: () => 'double each number', halve: () => 'halve each number', times10: () => 'multiply by 10',
    grow: (d) => `add ${fmt(d.step)} more each time`,
};

registerSkill('patterns:number_patterns_rule', {
    strings: stringsBy((q, ref = {}) => {
        const d = q ? patternData(q) : null;
        // R3 (critic round 3): the steps match the task - finding the rule when the pupil
        // writes it, reading it when it is printed - and the title reads as one verb.
        // With no item (the page title and instruction), the section's own option says it.
        const shown = d ? !d.ruleHidden : !!(ref.opts && ref.opts.rule === false);
        return {
            iCan: shown ? 'I Can use the rule of a number pattern' : 'I Can find the rule of a number pattern',
            instructionKey: shown ? 'pattern-rule' : 'pattern-find-rule',   // R3: the default (no item) is find the rule
            steps: shown ? [
                'Read the rule.',
                'Start at the last number shown.',
                'Use the rule to get the next number.',
                'Write each missing number.',
            ] : [
                'Look at two numbers side by side.',
                'Find the rule: more, less, double, half or times 10?',
                'Check the rule on the next pair.',
                'Write the rule. Use it to write each missing number.',
            ],
            say: 'The rule is __. The next number is __.',
            sayValues: (item) => {
                const p = patternData(item);
                if (!p || !p.blanks.length) return null;
                return `The rule is ${RULE_WORDS[p.kind](p)}. The next number is ${fmt(p.values[p.blanks[0]])}.`;
            },
        };
    }),
    misconceptions: ['added-not-doubled', 'skipped-multiple', 'counted-by-one', 'hundred-slip', 'wrong-direction'],
    workedSteps: (q) => {
        const d = patternData(q);
        if (!d) return [];
        const out = rowSteps(d.values, d.blanks, `The rule: ${RULE_WORDS[d.kind](d)}.`, JUMP[d.kind](d));
        if (d.ruleHidden) {
            const last = out[out.length - 1];
            last.marks = last.marks.concat([{ slot: 'rule', value: String(d.rule) }]);
            out.splice(1, 0, step(`${fmt(d.values[0])}, ${fmt(d.values[1])}, ${fmt(d.values[2])}: the rule is ${RULE_WORDS[d.kind](d)}.`));
        }
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const d = patternData(q);
        if (!d || !d.blanks.length) return null;
        const rule = d.ruleHidden ? d.rule : null;
        const vals = d.blanks.map((i) => d.values[i]);
        const tail = rule !== null ? [String(rule)] : [];
        const c = [];
        if (d.kind === 'double' || d.kind === 'times10') {
            // added the first jump over and over instead of multiplying
            const jump = d.values[1] - d.values[0];
            const v = d.blanks.map((i) => d.values[0] + i * jump);
            const k = d.blanks.findIndex((i, n) => v[n] !== d.values[i]);
            if (k >= 0) {
                c.push({ value: joinLike(q, [...v, ...(rule !== null ? [String(jump)] : [])]), misconception: 'added-not-doubled', slot: `b${k}`, slots: { [`b${k}`]: String(v[k]) },
                    explain: `Added ${fmt(jump)} each time instead of ${d.kind === 'double' ? 'doubling' : 'multiplying by 10'}.` });
            }
        }
        if (d.kind === 'sub' || d.kind === 'halve') {
            const i = d.blanks[0];
            if (i > 0) {
                const v = vals.slice(); v[0] = d.kind === 'sub' ? d.values[i - 1] + d.step : d.values[i - 1] * 2;
                c.push({ value: joinLike(q, [...v, ...tail]), misconception: 'wrong-direction', slot: 'b0', slots: { b0: String(v[0]) },
                    explain: `Went the wrong way: wrote ${fmt(v[0])}, not ${fmt(d.values[i])}.` });
            }
        }
        const base = rowWrongs(q, d.values, d.blanks, d.kind === 'add' || d.kind === 'sub' ? (d.kind === 'sub' ? -d.step : d.step) : d.values[1] - d.values[0], { rule });
        const w = chooseWrong(q, c);
        return w || base;
    },
});

/* ================================================================ multiplication chart */

function chartCells(q) {
    const d = obj(q.multChartData);
    if (d && Array.isArray(d.missingCells)) return d.missingCells.map((m) => ({ r: num(m.r), c: num(m.c), p: num(m.product) }));
    const keys = arr(q.keyParts).map(num);
    const [a, b] = operands(q);
    if (!keys.length) return [];
    return keys.map((p, i) => (i === 0 && Number.isFinite(a) && Number.isFinite(b) && a * b === p ? { r: a, c: b, p } : { r: NaN, c: NaN, p }));
}
const chartTask = (q) => (q && q.chartTask) || 'fill';

const CHART_STEPS = {
    fill: [
        'Put one finger on the row number.',
        'Put another finger on the column number.',
        'Slide them to the box where they meet.',
        'Multiply the two numbers. Write the product there.',
    ],
    headers: [
        'Find a product in the row or column with a missing number.',
        'Read the number you know on its other edge.',
        'Think: what times that number makes the product?',
        'Write that number on the edge.',
    ],
    shade: [
        'Say the times table of the number.',
        'Find each of those numbers in the chart, row by row and column by column.',
        'Shade every box that holds one.',
        'Look at the pattern the shaded boxes make.',
    ],
    pattern: [
        'Read the row number on the left.',
        'Find how much the row goes up from one column to the next.',
        'Count on by that much to fill each gap.',
        'Write the rule: add the row number.',
    ],
};

registerSkill('multiplication:mult_chart', chartProvider());
registerSkill('multiplication:mult_chart_easy', chartProvider());

function chartProvider() {
    return {
        strings: stringsBy((q) => {
            const task = chartTask(q);
            const complete = q && /whole multiplication chart/i.test(String(q.text || ''));
            return {
                iCan: task === 'shade' ? 'I Can find the multiples of a number in the chart'
                    : task === 'pattern' ? 'I Can find the pattern in a row of the chart'
                        : 'I Can use a multiplication chart to find products',
                instructionKey: task === 'headers' ? 'chart-headers' : task === 'shade' ? 'shade-multiples' : task === 'pattern' ? 'chart-row-rule'
                    : complete ? 'chart-fill-all' : 'chart-fill',
                instructionVars: task === 'shade' ? (item) => ({ n: (item && item.shadeOf) || 2 }) : undefined,
                steps: CHART_STEPS[task] || CHART_STEPS.fill,
                say: '__ times __ equals __.',
                sayValues: (item) => {
                    const t = chartTask(item);
                    if (t === 'shade') return `${item.shadeOf || 2}, ${2 * (item.shadeOf || 2)}, ${3 * (item.shadeOf || 2)}: these are multiples of ${item.shadeOf || 2}.`;
                    if (t === 'pattern') return `The ${item.chartRow} row goes up by ${item.chartRow} each time.`;
                    if (t === 'headers') { const k = listOf(item); return k.length ? `The missing number is ${k[0]}.` : null; }
                    const c = chartCells(item).find((x) => Number.isFinite(x.r));
                    return c ? [c.r, c.c, c.p] : null;
                },
            };
        }),
        misconceptions: ['read-next-column', 'added', 'next-factor', 'missed-multiple', 'shaded-non-multiple', 'counted-by-one'],
        workedSteps: (q) => {
            const task = chartTask(q);
            const key = listOf(q);
            if (task === 'shade') {
                const n = q.shadeOf || 2;
                const all = arr(q.options).map((o) => o.label);
                const want = arr(q.options).filter((o) => o.correct).map((o) => o.label);
                return [
                    step(`The multiples of ${n}: ${n}, ${2 * n}, ${3 * n}, ${4 * n} …`),
                    step(`Look at each number in the chart. Is it in the ${n} times table?`),
                    step(`Shade ${want.slice(0, 4).join(', ')}${want.length > 4 ? ' …' : ''}.`, [{ slot: 'answer', value: want.join(', ') || String(all[0] || '') }]),
                ];
            }
            if (task === 'headers') {
                return [
                    step('Pick a product whose row or column number is missing.'),
                    step('Divide it by the number on its other edge.'),
                    step(`Write ${key.join(', ')}.`, key.map((v, i) => ({ slot: `cell${i}`, value: v }))),
                ];
            }
            if (task === 'pattern') {
                const t = q.chartRow;
                const cells = key.slice(0, -1);
                return [
                    step(`This is the ${t} row. Each column adds ${t}.`),
                    step(`Count on by ${t} to fill each gap: ${cells.join(', ')}.`, cells.map((v, i) => ({ slot: `cell${i}`, value: v }))),
                    step(`The rule: add ${t} each time.`, key.map((v, i) => ({ slot: i === key.length - 1 ? 'rule' : `cell${i}`, value: v }))),
                ];
            }
            const cells = chartCells(q);
            if (!cells.length) return [];
            const out = [];
            const known = cells.filter((c) => Number.isFinite(c.r));
            known.slice(0, 2).forEach((c) => {
                const i = cells.indexOf(c);
                out.push(step(`Row ${c.r}, column ${c.c}: ${c.r} × ${c.c} = ${c.p}.`, [{ slot: `cell${i}`, value: String(c.p) }]));
            });
            if (known.length === 1) out.unshift(step(`Find row ${known[0].r} and column ${known[0].c}.`));
            out.push(step(known.length < cells.length ? 'Do the same for each empty box.' : 'Check: count along each row by the row number.',
                cells.map((c, i) => ({ slot: `cell${i}`, value: String(c.p) }))));
            while (out.length < 3) out.unshift(step('Find the row number on the left edge.'));
            return clampSteps(out);
        },
        wrongAnswer: (q) => {
            const task = chartTask(q);
            if (task === 'shade') {
                const opts = arr(q.options);
                const right = opts.filter((o) => o.correct).map((o) => o.id);
                const c = [];
                if (right.length > 1) c.push({ value: right.slice(0, -1), misconception: 'missed-multiple', slot: 'answer', slots: { answer: right.slice(0, -1).join(', ') }, explain: 'Missed a multiple: one box that should be shaded is not.' });
                const extra = opts.find((o) => !o.correct && opts.some((x) => x.correct && Number(x.label) + 1 === Number(o.label)));
                if (extra) c.push({ value: right.concat([extra.id]), misconception: 'shaded-non-multiple', slot: 'answer', slots: { answer: right.concat([extra.id]).join(', ') }, explain: `Shaded ${extra.label}, which is not a multiple.` });
                const w = chooseWrong(q, c);
                if (w) {
                    const lab = new Map(opts.map((o) => [o.id, o.label]));
                    w.display = (Array.isArray(w.value) ? w.value : []).map((id) => lab.get(id)).join(', ');
                }
                return w;
            }
            const key = listOf(q);
            if (!key.length) return null;
            if (task === 'headers') {
                const v = key.slice(); v[0] = String(num(v[0]) + 1);
                const v2 = key.slice(); v2[v2.length - 1] = String(Math.max(1, num(v2[v2.length - 1]) - 1));
                return chooseWrong(q, [
                    { value: joinLike(q, v), misconception: 'next-factor', slot: 'mc0', slots: { mc0: v[0] }, explain: 'Wrote the number next to it on the edge.' },
                    { value: joinLike(q, v2), misconception: 'next-factor', slot: `mc${v2.length - 1}`, slots: { [`mc${v2.length - 1}`]: v2[v2.length - 1] }, explain: 'Wrote the number before it on the edge.' },
                ]);
            }
            if (task === 'pattern') {
                const t = num(q.chartRow);
                const v = key.slice(); v[v.length - 1] = '1';
                const v2 = key.slice(); v2[0] = String(num(v2[0]) + t);
                return chooseWrong(q, [
                    { value: joinLike(q, v), misconception: 'counted-by-one', slot: 'rule', slots: { rule: '1' }, explain: 'Wrote how far the column moves (1), not how much the product grows.' },
                    { value: joinLike(q, v2), misconception: 'read-next-column', slot: 'mc0', slots: { mc0: v2[0] }, explain: 'Wrote the product one column over.' },
                ]);
            }
            const cells = chartCells(q);
            const values = cells.map((c) => c.p);
            const c0 = cells[0];
            const c = [];
            if (Number.isFinite(c0.r) && c0.c > 1) {
                const v = values.slice(); v[0] = c0.r * (c0.c - 1);
                c.push({ value: joinLike(q, v), misconception: 'read-next-column', slot: 'mc0', slots: { mc0: String(v[0]) }, explain: `Wrote ${c0.r} × ${c0.c - 1}: read the column next to it.` });
            }
            if (Number.isFinite(c0.r)) {
                const v = values.slice(); v[0] = c0.r + c0.c;
                c.push({ value: joinLike(q, v), misconception: 'added', slot: 'mc0', slots: { mc0: String(v[0]) }, explain: `Added ${c0.r} and ${c0.c} instead of multiplying.` });
            }
            const last = values.length - 1;
            const v = values.slice(); v[last] = values[last] + (Number.isFinite(cells[last].r) ? cells[last].r : 1);
            c.push({ value: joinLike(q, v), misconception: 'read-next-column', slot: `mc${last}`, slots: { [`mc${last}`]: String(v[last]) }, explain: 'Read the box one column over.' });
            return chooseWrong(q, c);
        },
    };
}

/* ======================================================== x and ÷ on a number line (hops) */

function hopData(q) {
    const d = obj(q.hopLine);
    if (d && Number.isFinite(num(d.hops))) return d;
    return null;
}

function hopProvider(div) {
    return {
        strings: stringsBy((q) => {
            const d = q ? hopData(q) : null;
            const r = d ? d.response : 'draw';
            return {
                iCan: div ? 'I Can divide by making equal hops on a number line' : 'I Can multiply by making equal hops on a number line',
                instructionKey: r === 'sentence' ? 'hop-sentence' : r === 'missing' ? 'hop-missing' : div ? 'hop-draw-div' : 'hop-draw',
                steps: div ? [
                    'Start at 0.',
                    'Make a hop the size of the number you divide by.',
                    'Keep hopping until you land on the number shared.',
                    'Count the hops. That is the answer.',
                ] : [
                    'Start at 0.',
                    'Make one hop the size of one group.',
                    'Make one hop for each group, all the same size.',
                    'Where you land is the product.',
                ],
                say: div ? '__ shared into hops of __ is __ hops.' : '__ hops of __ make __.',
                sayValues: (item) => {
                    const h = hopData(item);
                    if (!h) return null;
                    const p = num(h.hops) * num(h.step);
                    return div ? [p, h.step, h.hops] : [h.hops, h.step, p];
                },
            };
        }),
        misconceptions: ['counted-ticks', 'one-hop-short', 'added'],
        workedSteps: (q) => {
            const d = hopData(q);
            if (!d) return [];
            const g = num(d.hops), s = num(d.step), p = g * s;
            const land = [];
            for (let k = 1; k <= Math.min(g, 4); k++) land.push(fmt(k * s));
            const slot = d.response === 'sentence' ? 'c' : d.response === 'missing' ? 'answer' : 'answer';
            const ans = div ? g : p;
            return [
                step(`Start at 0. Each hop is ${s}.`),
                step(`Hop: ${land.join(', ')}${g > 4 ? ' …' : ''}.`, Array.from({ length: g }, (_, k) => ({ slot: `jump:${k + 1}`, value: `${k * s}-${(k + 1) * s}` }))),
                step(div ? `${g} hops of ${s} land on ${p}.` : `${g} hops land on ${p}.`),
                step(div ? `${p} ÷ ${s} = ${g}.` : `${g} × ${s} = ${p}.`, [{ slot, value: String(q.ans === undefined ? ans : (typeof q.ans === 'number' ? q.ans : ans)) }]),
            ];
        },
        wrongAnswer: (q) => {
            const d = hopData(q);
            if (!d) return null;
            const g = num(d.hops), s = num(d.step), p = g * s;
            if (d.response === 'sentence') {
                const parts = div ? [p, s, g] : [g, s, p];
                const w1 = parts.slice(); if (div) w1[2] = p; else w1[2] = g + s;
                const w2 = parts.slice(); w2[div ? 2 : 0] = div ? g + 1 : g + 1;
                return chooseWrong(q, [
                    { value: w1.join(', '), misconception: div ? 'counted-ticks' : 'added', slot: 'c', slots: { c: String(w1[2]) }, explain: div ? 'Wrote where the hops land, not how many hops.' : `Added ${g} and ${s} instead of multiplying.` },
                    { value: w2.join(', '), misconception: 'counted-ticks', slot: div ? 'c' : 'a', slots: { [div ? 'c' : 'a']: String(w2[div ? 2 : 0]) }, explain: 'Counted the tick at 0 as a hop.' },
                ]);
            }
            const ans = num(q.ans);
            const c = [];
            if (d.response !== 'missing' || q.missing === undefined) {
                c.push(div
                    ? { value: g + 1, misconception: 'counted-ticks', slot: 'answer', slots: { answer: String(g + 1) }, explain: 'Counted the ticks (0 too), not the hops.' }
                    : { value: p - s, misconception: 'one-hop-short', slot: 'answer', slots: { answer: String(p - s) }, explain: `Made ${g - 1} hops, not ${g}.` });
                c.push(div
                    ? { value: g - 1, misconception: 'one-hop-short', slot: 'answer', slots: { answer: String(g - 1) }, explain: 'Stopped one hop short.' }
                    : { value: g + s, misconception: 'added', slot: 'answer', slots: { answer: String(g + s) }, explain: `Added ${g} and ${s} instead of multiplying.` });
            } else {
                c.push({ value: ans + 1, misconception: 'counted-ticks', slot: 'answer', slots: { answer: String(ans + 1) }, explain: 'Counted a tick mark as a hop.' });
                c.push({ value: Math.max(0, ans - 1), misconception: 'one-hop-short', slot: 'answer', slots: { answer: String(Math.max(0, ans - 1)) }, explain: 'Stopped one short.' });
            }
            return chooseWrong(q, c);
        },
    };
}

registerSkill('multiplication:nl_mult', hopProvider(false));
registerSkill('division:nl_div', hopProvider(true));
