// Unit tests for the real skill providers: js/modules/sheet/providers/*.js (SKILL_CELL_CONTRACT.md
// section 3). Pure node: no browser, no app state.
//
//   node tests/scripts/ws-providers-unit.mjs
//
// For each of the 24 skills the independent critics re-graded on 2026-09-25 (and the sibling
// ladder ids registered beside them), 20 seeded items are built in the SAME SHAPE the generator
// emits (the fields each provider reads: a / b / op, operands, factFamilyData, clozeOptions,
// gridFill, pictureData, areaModelData, keyParts, quotientRemainder, target ...; the shapes were
// taken from generateQuestionFor output on 2026-09-25), and the provider is held to:
//
//   - it exists, and implements strings, workedSteps and wrongAnswer itself (not the defaults)
//   - strings.iCan starts with "I Can" (SCC-P7); strings.instruction is a library string that
//     passes lintInstruction once its placeholders are filled; strings.say is present
//   - strings.steps holds 2-4 steps that are specific to the skill: no forbidden generic phrase
//     (the ones the critics caught: count-on steps on subtraction, "Count by the second number" on
//     arrays, regrouping on grade-1 subtraction, "Touch each one" on sequences, times-fact steps on
//     ringing skills), and the skill's own key idea is named
//   - workedSteps(item) gives 3-6 steps, never "carry" or "borrow", the last one marking a slot
//   - wrongAnswer(item) is a named misconception, never equal to the right answer, and names the
//     slot that holds the wrong value
//   - stories (word-problem skills): a story with a number + label answer that agrees ("1 apple",
//     never "There are 1 ball"), whose answer is the item's answer
//
// Prints `ws-providers-unit: OK` or `ws-providers-unit: FAIL (n)` and exits non-zero on failure.

import {
    getProvider, listProviders, INSTRUCTION_LIBRARY, instructionFor, lintInstruction,
} from '../../js/modules/sheet/index.js';
import { REGRADED_SKILLS, STORY_NOUNS, PV_PROVIDER_IDS, pvRoundingErrors } from '../../js/modules/sheet/providers/index.js';
import { rng, int, pick, shuffle, deriveSeed } from '../../js/modules/sheet/rng.js';
import { sameAnswer } from '../../js/modules/sheet/providers/util.js';
import { applyRule, ftSlots } from '../../js/modules/sheet/index.js';

const failures = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) failures.push(msg); return !!cond; };

/* ============================================================== item shapes, seeded */
// Each maker takes a seeded stream and returns one item in the generator's shape.

const ITEM_MAKERS = {
    'addition:add_facts': (r) => {
        const a = int(r, 0, 10); const b = int(r, 0, Math.min(10, 20 - a));
        return { a, b, op: '+', ans: a + b, text: `${a} + ${b} = ?`, printFormat: 'add-facts-vertical' };
    },
    'addition:add': (r) => {
        const a = int(r, 5, 20); const b = int(r, 1, 20);
        return { a, b, op: '+', ans: a + b, text: `${a} + ${b} = ?`, printFormat: 'column-add' };
    },
    'addition:add_column_multi': (r) => {
        const ops = Array.from({ length: int(r, 3, 4) }, () => int(r, 10, 99));
        return { operands: ops, ans: ops.reduce((s, n) => s + n, 0), text: `${ops.join(' + ')} = ?`, printFormat: 'column-add-multi' };
    },
    'addition:add_sub_fact_family': (r) => {
        const p1 = int(r, 1, 15); const p2 = int(r, 1, 15); const w = p1 + p2;
        const eqs = [
            { text: `${p1} + ${p2} = ___`, ans: w, type: 'add' }, { text: `${p2} + ${p1} = ___`, ans: w, type: 'add' },
            { text: `${w} − ${p1} = ___`, ans: p2, type: 'sub' }, { text: `${w} − ${p2} = ___`, ans: p1, type: 'sub' },
        ];
        return { factFamilyData: { numbers: [p1, p2, w], equations: eqs, showAll: true }, ans: eqs.map((e) => e.ans).join(', '),
            text: 'Complete the fact family.', answerType: 'fact-family' };
    },
    'addition:cloze_addition': (r) => {
        const a = int(r, 1, 15); const b = int(r, 1, 9);
        const l1 = shuffle(r, [a, a + 1, Math.max(0, a - 2)].filter((v, i, all) => all.indexOf(v) === i)).map(String);
        const l2 = shuffle(r, [b, b + 3, a + b].filter((v, i, all) => all.indexOf(v) === i)).map(String);
        return { a, b, op: '+', ans: [String(a), String(b)], clozeOptions: [l1, l2], text: `___ + ___ = ${a + b}`, answerType: 'inline-cloze' };
    },
    'addition:number_line_add': (r) => {
        const a = int(r, 0, 15); const b = int(r, 1, 20 - a);
        return { a, b, op: '+', ans: a + b, text: `Use the number line: ${a} + ${b} = ?`, nlMax: 20 };
    },
    'addition:add_wp_10': (r) => {
        const a = int(r, 1, 8); const b = int(r, 1, 10 - a); const noun = pick(r, ['stars', 'apples', 'balls', 'pencils']);
        return { a, b, op: '+', ans: a + b, operands: [a, b], answerType: 'col-arith', printFormat: 'word-add',
            text: `Mia picks ${a} ${a === 1 ? noun.replace(/s$/, '') : noun}. Then Mia picks ${b} more. How many ${noun} did Mia pick altogether?` };
    },
    'comparing:compare_groups': (r) => {
        const v = pick(r, ['same', 'more', 'fewer']);
        if (v === 'same') {
            const ans = pick(r, ['same', 'not the same']);
            return { _variant: v, ans, text: 'Do the groups have the same number of counters?', answerType: 'text' };
        }
        return { _variant: v, ans: pick(r, ['A', 'B']), text: `Which group has ${v} squares?`, answerType: 'text' };
    },
    'composing:number_bonds': (r) => {
        const w = int(r, 2, 10); const p = int(r, 1, w - 1); const form = int(r, 0, 2);
        if (form === 0) return { ans: w, text: `${p} + ${w - p} = ?` };
        if (form === 1) return { ans: w - p, text: `? + ${p} = ${w}` };
        return { ans: w - p, text: `${p} + ? = ${w}` };
    },
    'composing:base10_build': (r) => { const n = int(r, 10, 99); return { target: n, ans: n, places: [10, 1], answerType: 'base10-build' }; },
    'composing:hundreds_chart_fill': (r) => { const n = int(r, 1, 100); return { ans: n, chartData: { target: n }, text: 'What number goes in the blank?' }; },
    'composing:ten_frame_build': (r) => { const n = int(r, 1, 10); return { target: n, ans: n, maxDots: 10, answerType: 'ten-frame-build' }; },
    'counting:count_objects': (r) => { const n = int(r, 1, 20); return { ans: n, text: `How many ${pick(r, ['stars', 'counters', 'squares'])} are there?` }; },
    'counting:number_seq_fill': (r) => {
        const by = pick(r, [1, 2, 5, 10]); const start = int(r, 0, 9);
        const blanks = new Set(shuffle(r, Array.from({ length: 10 }, (_, i) => i)).slice(0, int(r, 2, 4)));
        const cells = Array.from({ length: 10 }, (_, i) => ({ row: 0, col: i, value: start + i * by, blank: blanks.has(i) }));
        return { gridFill: { rows: 1, cols: 10, cells }, ans: cells.filter((c) => c.blank).map((c) => c.value),
            text: `Count by ${by}. Write the missing numbers.`, answerType: 'grid-fill' };
    },
    'division:div_facts': (r) => { const b = int(r, 1, 12); const qq = int(r, 1, 12); return { a: b * qq, b, op: '÷', ans: qq, text: `${b * qq} ÷ ${b} = ?` }; },
    'division:long_div_2digit': (r) => { const b = int(r, 11, 99); const qq = int(r, 2, 99); return { a: b * qq, b, ans: qq, text: `${b * qq} ÷ ${b} = ?`, printFormat: 'long-division' }; },
    'division:div_remainders': (r) => {
        const b = int(r, 2, 9); const qq = int(r, 1, 9); const rem = int(r, 1, b - 1); const a = b * qq + rem;
        return { a, b, op: '÷', ans: `${qq} R ${rem}`, quotientRemainder: { quotient: qq, remainder: rem }, text: `${a} ÷ ${b} = ?` };
    },
    'division:share_into_groups': (r) => {
        const b = int(r, 2, 5); const g = int(r, 2, 6);
        return { a: b * g, b, op: '÷', ans: g, text: `There are ${b * g} counters. Make groups of ${b}. How many groups are there?` };
    },
    'multiplication:area_model_mult': (r) => {
        const m = int(r, 2, 9); const n = int(r, 11, 199);
        const parts = [100, 10, 1].map((p) => Math.floor((n % (p * 10)) / p) * p).filter(Boolean);
        return { areaModelData: { multiplier: m, multiplicand: n, parts: parts.map((value) => ({ value })), product: m * n },
            ans: m * n, text: `Use the area model to find ${m} × ${n}`, answerType: 'area-model' };
    },
    'multiplication:arrays_groups': (r) => {
        const g = int(r, 2, 6); const s = int(r, 2, 6); const form = int(r, 0, 2);
        if (form === 2) return { ans: g * s, text: 'How many dots in all?' };
        return { ans: g * s, keyParts: [String(g), String(s), String(g * s)],
            text: form === 0 ? 'There are ___ groups of ___. ___ in all.' : 'This array shows ___ rows of ___. ___ in all.' };
    },
    'multiplication:mult_facts': (r) => { const a = int(r, 0, 12); const b = int(r, 0, 12); return { a, b, op: '×', ans: a * b, text: `${a} × ${b} = ?` }; },
    'multiplication:mult_chart': (r) => {
        const a = int(r, 2, 10); const b = int(r, 2, 10); const k = [a * b, int(r, 2, 10) * int(r, 2, 10), int(r, 2, 10) * int(r, 2, 10)];
        return { a, b, op: '×', ans: k.join(', '), keyParts: k.map(String), text: 'Fill in the missing products.' };
    },
    'subtraction:subtract': (r) => { const a = int(r, 5, 20); const b = int(r, 1, a); return { a, b, op: '-', ans: a - b, text: `${a} − ${b} = ?` }; },
    'subtraction:sub_5_pictures': (r) => {
        const n = int(r, 1, 5); const m = int(r, 1, n);
        return { ans: n - m, pictureData: { shape: pick(r, ['star', 'counter', 'triangle']), n, m, remain: n - m },
            text: `Start with ${n}, take away ${m}. How many are left?` };
    },
};

// Sibling ladder ids registered beside the 24 (their makers are added below).
const SIBLINGS = {
    'subtraction:sub_facts': 'subtraction:subtract',
    'subtraction:number_line_sub': null,
    'addition:add_wp_20': 'addition:add_wp_10',
    'addition:add_wp_10_plain': 'addition:add_wp_10',
    'subtraction:sub_wp_10': null,
    'multiplication:area_model_mult_hard': null,
    'multiplication:mult_chart_easy': null,
    'composing:ten_frame_build_teen': null,
    'composing:base10_build_hundreds': null,
};
Object.assign(ITEM_MAKERS, {
    'subtraction:sub_facts': ITEM_MAKERS['subtraction:subtract'],
    'addition:add_wp_20': ITEM_MAKERS['addition:add_wp_10'],
    'addition:add_wp_10_plain': ITEM_MAKERS['addition:add_wp_10'],
    'subtraction:number_line_sub': (r) => { const a = int(r, 2, 20); const b = int(r, 1, a); return { a, b, op: '-', ans: a - b, text: `Use the number line: ${a} − ${b} = ?` }; },
    'subtraction:sub_wp_10': (r) => {
        const a = int(r, 2, 10); const b = int(r, 1, a - 1);
        return { a, b, op: '-', ans: a - b, minuend: a, subtrahend: b, text: `Omar started with ${a} stars and gave away ${b}. How many stars remain?` };
    },
    'multiplication:area_model_mult_hard': (r) => {
        const x = int(r, 11, 99); const y = int(r, 11, 99);
        const split = (n) => [Math.floor(n / 10) * 10, n % 10].filter(Boolean);
        return { areaModelData: { num1: x, num2: y, rowParts: split(x), colParts: split(y), product: x * y, isGrid: true }, ans: x * y };
    },
    'multiplication:mult_chart_easy': (r) => {
        const cells = [0, 1].map(() => { const rr = int(r, 1, 12); const c = int(r, 1, 12); return { r: rr, c, product: rr * c }; });
        return { multChartData: { missingCells: cells, missingCount: 2 }, ans: cells.map((c) => c.product).join(','), answerType: 'mult-chart-cells' };
    },
    'composing:ten_frame_build_teen': (r) => { const n = int(r, 11, 19); return { target: n, ans: n, maxDots: 20 }; },
    'composing:base10_build_hundreds': (r) => { const n = int(r, 100, 999); return { target: n, ans: n, places: [100, 10, 1] }; },
});

/* ============================================================ P10 time + money */
// The tm items come from the REAL generator (gen-time-money.js is pure enough to run in node):
// Math.random is the seeded stream for one item, and the page position alternates the option
// that changes the item's shape (write / draw, the two tasks), so both paths are held.
const { state: TM_STATE } = await import('../../js/modules/state.js');
const { generateTimeMoneyQuestion } = await import('../../js/modules/gen-time-money.js');
const { TM_PROVIDER_SKILLS } = await import('../../js/modules/sheet/providers/time-money.js');
const TM_ALT = {
    time_hour: [{}, { response: 'draw' }], time_half_hour: [{}, { response: 'draw' }], time_quarter: [{}, { response: 'draw' }],
    time_5min: [{}, { response: 'draw' }], time_1min: [{}, { response: 'draw', stimulus: 'words' }],
    time_analog_digital: [{}, { dir: 'to-analog' }], clock_parts: [{}, { task: 'hands' }], coin_value: [{}, { task: 'order' }],
    money_compare: [{}, { response: 'sign' }], money_count: [{}, { kind: 'mixed' }, { kind: 'notes-coins', currency: 'qar' }],
    elapsed_find_duration: [{}, { response: 'minutes' }], elapsed_hour: [{}, { dir: 'earlier' }, { response: 'draw' }],
    money: [{}, { step: 25 }], money_change: [{}, {}, { step: 100 }],
};
const tmMaker = (skill) => {
    let k = 0;
    return (r) => {
        const alts = TM_ALT[skill] || [{}];
        const opts = alts[k % alts.length];
        const saved = Math.random;
        Math.random = r;
        try {
            Object.assign(TM_STATE, { category: 'measurement', skill, skillOptions: opts, itemIndex: k });
            const q = {};
            generateTimeMoneyQuestion(q, skill);
            k++;
            return q;
        } finally { Math.random = saved; }
    };
};
for (const key of TM_PROVIDER_SKILLS) ITEM_MAKERS[key] = tmMaker(key.split(':')[1]);
// Count by 1-12, number patterns and x / ÷ on a number line (2026-09-25, providers/countby.js),
// in the shapes js/modules/gen-mult-patterns.js emits.
const COUNTBY_MAKERS = {
    'multiplication:count_by_tables': (r) => {
        const t = int(r, 2, 12); const values = Array.from({ length: 12 }, (_, i) => t * (i + 1));
        const blanks = shuffle(r, Array.from({ length: 11 }, (_, i) => i + 1)).slice(0, int(r, 2, 10)).sort((a, b) => a - b);
        const k = blanks.map((i) => values[i]);
        return { a: t, b: 12, op: '×', ans: k.join(', '), keyParts: k.map(String), countBy: { step: t, values, blanks }, text: `Count by ${t}. Write the missing numbers.` };
    },
    'patterns:number_patterns_rule': (r) => {
        const kind = pick(r, ['add', 'sub', 'double', 'halve', 'times10', 'grow']);
        const hidden = int(r, 0, 1) === 1;
        let values; let stepN = 2;
        if (kind === 'add') { stepN = pick(r, [2, 5, 10, 25]); const s0 = int(r, 1, 90); values = Array.from({ length: 8 }, (_, i) => s0 + i * stepN); }
        else if (kind === 'sub') { stepN = pick(r, [2, 5, 10]); const s0 = int(r, 80, 99); values = Array.from({ length: 8 }, (_, i) => s0 - i * stepN); }
        else if (kind === 'double') { const s0 = int(r, 1, 3); values = Array.from({ length: 6 }, (_, i) => s0 * 2 ** i); }
        else if (kind === 'halve') { const e = int(r, 1, 3); values = Array.from({ length: 6 }, (_, i) => e * 2 ** (5 - i)); }
        else if (kind === 'times10') { stepN = 10; const s0 = int(r, 1, 9); values = [s0, s0 * 10, s0 * 100, s0 * 1000]; }
        else { stepN = pick(r, [1, 2]); const s0 = int(r, 1, 20); values = [s0]; for (let i = 1; i < 6; i++) values.push(values[i - 1] + i * stepN); }
        const blanks = Array.from({ length: values.length - 3 }, (_, i) => i + 3);
        const rule = kind === 'double' || kind === 'halve' ? 2 : stepN;
        const k = blanks.map((i) => values[i]).concat(hidden ? [rule] : []);
        return { ans: k.join(', '), keyParts: k.map(String), pattern: { kind, step: stepN, values, blanks, place: 1, ruleHidden: hidden, rule }, text: 'Use the rule. Write the missing numbers.' };
    },
    'multiplication:nl_mult': (r) => {
        const g = int(r, 2, 9); const s2 = int(r, 2, 10); const response = pick(r, ['draw', 'sentence', 'missing']);
        const base = { a: g, b: s2, op: '×', hopLine: { hops: g, step: s2, max: s2 * 12, response, ticks: 'step', numbered: false } };
        if (response === 'sentence') return { ...base, ans: `${g}, ${s2}, ${g * s2}`, keyParts: [String(g), String(s2), String(g * s2)], text: 'Look at the hops. Write the multiplication sentence.' };
        return { ...base, ans: g * s2, text: `${g} × ${s2} = ?` };
    },
    'division:nl_div': (r) => {
        const g = int(r, 2, 9); const s2 = int(r, 2, 10); const response = pick(r, ['draw', 'sentence', 'missing']);
        const base = { a: g * s2, b: s2, op: '÷', hopLine: { hops: g, step: s2, max: s2 * 12, response, ticks: 'step', numbered: false } };
        if (response === 'sentence') return { ...base, ans: `${g * s2}, ${s2}, ${g}`, keyParts: [String(g * s2), String(s2), String(g)], text: 'Look at the hops. Write the division sentence.' };
        return { ...base, ans: g, text: `${g * s2} ÷ ${s2} = ?` };
    },
};
Object.assign(ITEM_MAKERS, COUNTBY_MAKERS);

/* ============================================================ skill-specific phrasing */

// Phrases a skill's STEPS must never use (the critics' 2026-09-25 findings, and their kin).
const GLOBAL_FORBIDDEN = [/^solve\.?$/i, /^read the problem\.?$/i, /^write the answer\.?$/i, /\bcarry\b/i, /\bborrow/i];
const SUBTRACTION_FORBIDDEN = [/count on/i, /\bregroup/i, /write the sum/i, /start with the bigger number/i];
const FORBIDDEN = {
    'subtraction:subtract': SUBTRACTION_FORBIDDEN,
    'subtraction:sub_facts': SUBTRACTION_FORBIDDEN,
    'subtraction:sub_5_pictures': SUBTRACTION_FORBIDDEN.concat([/difference/i]),
    'subtraction:number_line_sub': SUBTRACTION_FORBIDDEN,
    'addition:cloze_addition': [/start with the bigger number/i, /write the sum/i],
    'composing:number_bonds': [/start with the bigger number/i, /count on\./i],
    'addition:number_line_add': [/start with the bigger number/i],
    'addition:add_wp_10': [/start with the bigger number/i, /count on/i],
    'addition:add_column_multi': [/regroup 10 ones as 1 ten/i],
    'multiplication:arrays_groups': [/count by the second number/i, /read the fact/i],
    'multiplication:mult_chart': [/count by the second number/i, /read the fact/i],
    'multiplication:mult_chart_easy': [/count by the second number/i, /read the fact/i],
    'multiplication:area_model_mult': [/regroup/i, /count by the second number/i],
    'multiplication:area_model_mult_hard': [/regroup/i, /count by the second number/i],
    'multiplication:mult_facts': [/count by the second number/i],
    'counting:number_seq_fill': [/touch each/i],
    'multiplication:count_by_tables': [/touch each/i, /count by the second number/i],
    'patterns:number_patterns_rule': [/touch each/i],
    'multiplication:nl_mult': [/count by the second number/i],
    'division:nl_div': [/times fact/i],
    'division:share_into_groups': [/times fact/i, /missing factor/i],
    'division:div_remainders': [/times fact/i, /missing factor/i],
    'comparing:compare_groups': [/write the answer/i],
    'composing:base10_build': [/write the answer/i, /rods|units/i],
    'composing:ten_frame_build': [/write the answer/i],
};

// The key idea each skill's steps must name.
const REQUIRED = {
    'addition:add_facts': /count on|make 10/i,
    // R3: basic add is within 20 (1.OA.6), every item a fact counted on - no column steps.
    'addition:add': /count on/i,
    'addition:add_column_multi': /column/i,
    'addition:add_sub_fact_family': /whole/i,
    'addition:cloze_addition': /list/i,
    'addition:number_line_add': /jump/i,
    'addition:add_wp_10': /label/i,
    'comparing:compare_groups': /line|partner/i,
    'composing:number_bonds': /part/i,
    'composing:base10_build': /tens/i,
    'composing:hundreds_chart_fill': /add 10|above/i,
    'composing:ten_frame_build': /row|box/i,
    'counting:count_objects': /touch/i,
    'counting:number_seq_fill': /jump/i,
    'division:div_facts': /times|skip count/i,
    'division:long_div_2digit': /bring down/i,
    'division:div_remainders': /left over|remainder/i,
    'division:share_into_groups': /circle/i,
    'multiplication:area_model_mult': /part/i,
    'multiplication:arrays_groups': /row|group/i,
    'multiplication:mult_facts': /group|skip count/i,
    'multiplication:mult_chart': /row.*column|column/i,
    'subtraction:subtract': /take away|count back/i,
    'subtraction:sub_5_pictures': /crossed out/i,
    'multiplication:count_by_tables': /jump/i,
    'patterns:number_patterns_rule': /rule/i,
    'multiplication:nl_mult': /hop/i,
    'division:nl_div': /hop/i,
};


/* ================================================================ P9: place value, rounding, estimation */
// Items in the shape gen-pv.js emits (q.pv is what every pv provider reads), one maker per id.
// Checked by the same checkSkill as the re-graded skills, plus the pv section at the end.

const PWORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };
const rnd = (n, P) => Math.floor((n + P / 2) / P) * P;
const dAt = (n, p) => Math.floor(n / p) % 10;
const nonMultiple = (r, lo, hi, P) => { for (;;) { const v = int(r, lo, hi); if (v % P) return v; } };
const pvPlaceItem = (r, extra = {}) => {
    const n = int(r, 101, 999); const place = pick(r, [1, 10, 100]);
    return { n, place, digit: dAt(n, place), ...extra };
};
const PV_MAKERS = {
    'placevalue:identify': (r, i) => { const p = pvPlaceItem(r); return { pv: { kind: 'place', ...p, support: 'labels', response: i % 2 ? 'bank' : 'circle' }, ans: PWORD[p.place], answerType: i % 2 ? 'text' : 'multiple-choice', options: ['ones', 'tens', 'hundreds'] }; },
    'placevalue:value': (r, i) => {
        const p = pvPlaceItem(r); const form = ['value', 'value', 'unit', 'notation'][i % 4];
        const ans = form === 'value' ? p.digit * p.place : form === 'unit' ? `${p.digit} ${p.digit === 1 ? PWORD[p.place].replace(/s$/, '') : PWORD[p.place]}` : `${p.digit} × ${p.place}`;
        return { pv: { kind: 'value', ...p, support: 'labels', form }, ans, answerType: form === 'value' ? 'number' : 'inline-blanks' };
    },
    'placevalue:expand': (r, i) => {
        const n = i % 3 === 1 ? int(r, 1, 9) * 100 + int(r, 1, 9) : int(r, 111, 999); const ds = String(n).split('').map(Number);
        const parts = ds.map((d, k) => d * 10 ** (ds.length - 1 - k)); const line = i % 4 === 3;
        return { pv: { kind: 'expand', n, parts, form: 'sum', frame: line ? 'line' : 'boxes' }, ans: (line ? parts.filter(Boolean) : parts).join(' + ') };
    },
    'placevalue:combine': (r) => { const n = int(r, 111, 999); const parts = String(n).split('').map((d, k) => Number(d) * 10 ** (2 - k)).filter(Boolean); return { pv: { kind: 'combine', n, parts }, ans: n }; },
    'placevalue:unit_form': (r, i) => {
        if (i % 2) { const a = int(r, 1, 8); const b = int(r, 10, 19); return { pv: { kind: 'unit', n: a * 100 + b * 10, rename: true, counts: { 100: a, 10: b } }, ans: a * 100 + b * 10, text: `${a} hundreds ${b} tens = ___` }; }
        const n = int(r, 101, 999);
        return { pv: { kind: 'unit', n, rename: false, counts: { 100: dAt(n, 100), 10: dAt(n, 10), 1: dAt(n, 1) } }, ans: `${dAt(n, 100)} hundreds ${dAt(n, 10)} tens ${dAt(n, 1)} ones`, answerType: 'inline-blanks' };
    },
    'placevalue:more_less_10': (r, i) => {
        const step = pick(r, [1, 10]); const dir = pick(r, ['more', 'less']); const n = int(r, 11, 89);
        const res = dir === 'more' ? n + step : n - step; const start = i % 3 === 2;
        return { pv: { kind: 'moreless', n, step, dir, support: 'none', unknown: start ? 'start' : 'answer', given: start ? res : n }, ans: start ? n : res };
    },
    'placevalue:more_less_100': (r) => { const step = pick(r, [10, 100]); const dir = pick(r, ['more', 'less']); const n = int(r, 150, 850); return { pv: { kind: 'moreless', n, step, dir, support: 'none', unknown: 'answer', given: n }, ans: dir === 'more' ? n + step : n - step }; },
    'placevalue:place_value_disks': (r, i) => {
        const places = [100, 10, 1]; const counts = { 100: int(r, 1, 9), 10: i % 3 ? int(r, 0, 9) : 0, 1: int(r, 1, 9) };
        const n = 100 * counts[100] + 10 * counts[10] + counts[1]; const count = i % 4 === 3;
        return { pv: count ? { kind: 'disks', task: 'count', places, counts, n, place: 100 } : { kind: 'disks', task: 'read', places, counts, n }, ans: count ? counts[100] : n };
    },
    'placevalue:pv_disks_build': (r) => { const n = int(r, 101, 999); return { pv: { kind: 'build', n, places: [100, 10, 1] }, ans: n, printAnswer: `${dAt(n, 100)} hundreds` }; },
    'placevalue:pv_digit_drag': (r, i) => { const n = i % 2 ? int(r, 10, 99) * 1000 + int(r, 1, 9) : int(r, 10000, 99999); return { pv: { kind: 'chart', n, places: [10000, 1000, 100, 10, 1], source: 'expanded', sourceText: String(n) }, ans: n }; },
    'placevalue:place_value_10x': (r, i) => { const power = pick(r, [10, 100, 1000]); const k = i % 3 === 0 ? int(r, 101, 909) : int(r, 2, 99); const op = i % 2 ? '/' : 'x'; return { pv: { kind: 'x10', n: op === 'x' ? k : k * power, op, power, support: 'shift' }, ans: op === 'x' ? k * power : k }; },
    'placevalue:number_word_names': (r) => { const n = int(r, 1000, 99999); return { text: `Which is the word name for ${n}?`, ans: 'the name', options: ['the name', 'a swapped name', 'a dropped name'], answerType: 'choice' }; },
    'placevalue:compare': (r) => { const a = int(r, 100, 999); const b = int(r, 100, 999); return { pv: { kind: 'compare', a, b }, ans: a > b ? '>' : a < b ? '<' : '=' }; },
    'placevalue:order_least_to_greatest': (r) => { const nums = [int(r, 10, 99), int(r, 100, 499), int(r, 500, 999)]; return { pv: { kind: 'order', nums, dir: 'asc' }, ans: nums.slice().sort((a, b) => a - b).join(',') }; },
    'placevalue:order_greatest_to_least': (r) => { const nums = [int(r, 10, 99), int(r, 100, 499), int(r, 500, 999)]; return { pv: { kind: 'order', nums, dir: 'desc' }, ans: nums.slice().sort((a, b) => b - a).join(',') }; },
    'number_sense:rounding_visual': (r) => { const n = nonMultiple(r, 11, 99, 10); return { pv: { kind: 'round', n, place: 10, line: [Math.floor(n / 10) * 10, Math.floor(n / 10) * 10 + 10] }, ans: rnd(n, 10) }; },
    'number_sense:between_tens': (r) => { const n = nonMultiple(r, 11, 99, 10); const lo = Math.floor(n / 10) * 10; return { pv: { kind: 'between', n, place: 10, lo, hi: lo + 10 }, ans: `${lo} and ${lo + 10}`, answerType: 'inline-blanks' }; },
    'number_sense:place_on_number_line': (r) => { const lo = int(r, 1, 9) * 100; const n = lo + int(r, 1, 9) * 10; return { pv: { kind: 'mark', n, span: 100, line: [lo, lo + 100] }, ans: n }; },
    // Round on a number line to thousands and beyond: the dot placed by the pupil (inline blanks,
    // the dot then the rounded number) or shown; halfway and a multiple are dealt among them.
    ...Object.fromEntries([['round_nl_thousands', 1000, 9999, [10, 100, 1000, 10000]],
        ['round_nl_ten_thousands', 10000, 99999, [100, 1000, 10000, 100000]],
        ['round_nl_hundred_thousands', 100000, 999999, [1000, 10000, 100000, 1000000]]].map(([id, lo, hi, places]) => [`number_sense:${id}`, (r, i) => {
        const P = places[i % places.length];
        let n = i % 5 === 1 ? Math.floor(int(r, lo, hi - P) / P) * P + P / 2 : i % 5 === 4 ? Math.max(lo, Math.floor(int(r, lo, hi) / P) * P) : int(r, lo, hi);
        if (n < lo) n = lo + P / 2;
        const L = Math.floor(n / P) * P;
        const plotted = i % 4 === 3;
        return { pv: { kind: 'round', n, place: P, line: [L, L + P], lineMode: plotted ? 'plotted' : 'mark', nl: true }, ans: rnd(n, P),
            answerType: plotted ? 'number' : 'inline-blanks' };
    }])),
    'number_sense:rounding_table': (r, i) => {
        const rows = [int(r, 101, 999), int(r, 101, 999), int(r, 101, 999), int(r, 101, 999)]; const places = [10, 100]; const c = i % 2;
        const cells = rows.map((_, k) => [k, c]); const keys = cells.map(([k, cc]) => rnd(rows[k], places[cc]));
        return { pv: { kind: 'table', rows, places, blank: 'column', cells, keys }, ans: keys.join('; ') };
    },
};
for (const [id, P] of [['nearest_10', 10], ['nearest_100', 100], ['nearest_1000', 1000], ['nearest_10000', 10000], ['nearest_100000', 100000], ['nearest_million', 1000000]]) {
    PV_MAKERS[`number_sense:${id}`] = (r, i) => {
        const n = i % 5 === 1 ? int(r, 1, 9) * P + P / 2 : i % 5 === 3 ? 10 * P - int(r, 1, P / 2 - 1) : nonMultiple(r, P + 1, 10 * P - 1, P);
        const scope = ['full', 'full', 'full', 'decision', 'judge'][i % 5];
        const rd = rnd(n, P); const shown = i % 2 ? rd : Math.floor(n / P) * P === rd ? rd + P : Math.floor(n / P) * P;
        const ans = scope === 'decision' ? (rd > n ? 'Round up' : 'Round down') : scope === 'judge' ? (shown === rd ? 'Correct' : 'Fix it') : rd;
        return { pv: { kind: 'round', n, place: P, scope, shown }, ans };
    };
}
for (const [id, P] of [['round_sort_10', 10], ['round_sort_100', 100], ['round_sort_1000', 1000], ['round_sort_10000', 10000], ['round_sort_100000', 100000], ['round_sort_million', 1000000]]) {
    PV_MAKERS[`number_sense:${id}`] = (r) => {
        const L = int(r, 1, 8) * P; const vals = [L + P / 2, L + 1 + int(r, 0, P / 2 - 2), L + P / 2 + 1 + int(r, 0, P / 2 - 3), L + int(r, 1, P / 2 - 1), L + P - 1, L + 2];
        const uniq = [...new Set(vals)];
        const tiles = uniq.map((v, k) => ({ id: `t${k}`, label: String(v) }));
        const ans = Object.fromEntries(uniq.map((v, k) => [`t${k}`, rnd(v, P) === L ? 'bin_0' : 'bin_1']));
        return { pv: { kind: 'sort', place: P, tiles: uniq, bins: [L, L + P] }, tiles, bins: [{ id: 'bin_0', label: String(L) }, { id: 'bin_1', label: String(L + P) }], ans, answerType: 'dnd-generic', printAnswer: 'sorted' };
    };
}
for (const [id, P] of [['round_sort_tenths', 0.1], ['round_sort_hundredths', 0.01]]) {
    PV_MAKERS[`number_sense:${id}`] = (r) => {
        const d = P === 0.1 ? 1 : 2; const Lu = int(r, 1, 8) * 10; const us = [...new Set([Lu + 5, Lu + 1, Lu + 3, Lu + 6, Lu + 8, Lu + 9])];
        const val = (u) => +(u * 10 ** -(d + 1)).toFixed(d + 1);
        const tiles = us.map((u, k) => ({ id: `t${k}`, label: val(u).toFixed(d + 1) }));
        const ans = Object.fromEntries(us.map((u, k) => [`t${k}`, u < Lu + 5 ? 'bin_0' : 'bin_1']));
        return { pv: { kind: 'sort', place: P, tiles: us.map(val), bins: [val(Lu), val(Lu + 10)] }, tiles, bins: [{ id: 'bin_0', label: val(Lu).toFixed(d) }, { id: 'bin_1', label: val(Lu + 10).toFixed(d) }], ans, answerType: 'dnd-generic' };
    };
}
const estItem = (op) => (r, i) => {
    if (op === '÷') { const b = int(r, 3, 9); const est = int(r, 2, 9); const compat = b * est; const a = compat + (i % 2 ? 1 : -1); return { pv: { kind: 'estimate', task: 'compute', op, a, b, place: 1, est, rounded: [compat, b] }, ans: est }; }
    const P = 10; const a = nonMultiple(r, 21, 99, 5); let b = nonMultiple(r, 11, op === '−' ? a - 10 : 99, 5);
    if (op === '×') b = int(r, 2, 9);
    const ra = rnd(a, P), rb = op === '×' ? b : rnd(b, P);
    const est = op === '+' ? ra + rb : op === '−' ? ra - rb : ra * rb;
    const task = i % 4 === 3 && op !== '+' ? 'reasonable' : 'compute';
    if (task === 'reasonable') { const ok = i % 8 === 3; return { pv: { kind: 'estimate', task, op, a, b, place: P, est, rounded: [ra, rb], shown: ok ? a * b : a * b * 10, reasonable: ok }, ans: ok ? 'Reasonable' : 'Not reasonable', answerType: 'multiple-choice' }; }
    return { pv: { kind: 'estimate', task, op, a, b, place: P, est, rounded: [ra, rb] }, ans: est, answerType: op === '+' ? 'inline-blanks' : 'number' };
};
Object.assign(PV_MAKERS, {
    'number_sense:estimate_sum': estItem('+'),
    'number_sense:estimate_diff': estItem('−'),
    'number_sense:estimate_sums_diffs': estItem('−'),
    'number_sense:estimate_products': estItem('×'),
    'number_sense:estimate_quotient': estItem('÷'),
});
// Each maker takes (r, index): wrap to the (r) shape checkSkill calls, counting items per skill.
for (const [key, mk] of Object.entries(PV_MAKERS)) { let k = 0; ITEM_MAKERS[key] = (r) => mk(r, k++); }
Object.assign(REQUIRED, {
    'placevalue:identify': /place/i, 'placevalue:value': /place/i, 'placevalue:expand': /worth|zero/i,
    'number_sense:nearest_10': /5 or more|round up/i, 'number_sense:nearest_100': /5 or more|round up/i,
    'number_sense:rounding_visual': /halfway/i, 'number_sense:round_nl_thousands': /halfway/i,
    'number_sense:round_nl_ten_thousands': /halfway/i, 'number_sense:round_nl_hundred_thousands': /halfway/i, 'number_sense:estimate_sum': /round/i, 'placevalue:place_value_10x': /moves? (left|right)/i,
});

/* ================================================================================ run */

const libraryKeys = new Set(Object.keys(INSTRUCTION_LIBRARY));
const registered = new Set(listProviders());

const wordsOf = (s) => String(s).replace(/[.?!]/g, '').trim().split(/\s+/).filter(Boolean).length;
const pluralNouns = new Set(STORY_NOUNS.map((n) => n.many));

function checkSkill(key, { requireStories = false } = {}) {
    const [cat, skill] = key.split(':');
    const maker = ITEM_MAKERS[key];
    if (!ok(registered.has(key), `${key}: no provider registered`)) return;
    const p = getProvider(cat, skill);
    for (const m of ['strings', 'workedSteps', 'wrongAnswer']) ok(p.real.includes(m), `${key}: ${m} comes from the default adapter`);
    if (!ok(typeof maker === 'function', `${key}: the test has no item maker`)) return;

    const r = rng(deriveSeed('ws-providers-unit', key));
    const items = Array.from({ length: 20 }, (_, i) => Object.assign({ categoryId: cat, skillId: skill, seed: 1000 + i, itemIndex: i }, maker(r)));

    // ---- strings
    const str = typeof p.strings === 'function' ? p.strings({ categoryId: cat, skillId: skill, q: items[0] }) : p.strings;
    ok(/^I Can \S/.test(str.iCan || ''), `${key}: iCan "${str.iCan}" does not start with "I Can"`);
    ok(/^i can /i.test(str.iCan || ''), `${key}: iCan must start with "I can"`);
    ok(!/work on/i.test(str.iCan || '') && !/[.]$/.test(str.iCan || ''), `${key}: iCan "${str.iCan}" is the auto label or ends with a period`);
    ok(libraryKeys.has(str.instructionKey), `${key}: instructionKey "${str.instructionKey}" is not a library key`);
    let filled = '';
    try { filled = instructionFor(str.instructionKey, str.instructionVars ? str.instructionVars(items[0]) : {}); } catch (e) { filled = ''; }
    ok(filled && filled === str.instruction, `${key}: instruction "${str.instruction}" is not the filled library string "${filled}"`);
    ok(!/\{\w+\}/.test(str.instruction), `${key}: instruction keeps a placeholder: "${str.instruction}"`);
    ok(lintInstruction(str.instruction).length === 0, `${key}: instruction fails the lint: ${lintInstruction(str.instruction).join('; ')}`);
    ok(!/^default-/.test(str.instructionKey) && str.instructionKey !== 'default-solve', `${key}: instruction is a default-adapter string`);
    ok(typeof str.say === 'string' && /__/.test(str.say) && str.say === str.oralFrame, `${key}: say / oralFrame missing or different`);
    ok(!/[{}]/.test(str.say), `${key}: say "${str.say}" holds a {placeholder}; blanks are __ only`);
    ok(Array.isArray(str.steps) && str.steps.length >= 2 && str.steps.length <= 4, `${key}: strings.steps must hold 2-4 steps (has ${(str.steps || []).length})`);
    const steps = (str.steps || []).map(String);
    ok(steps.every((s) => s.trim().length > 0), `${key}: an empty step`);
    for (const s of steps) {
        for (const re of GLOBAL_FORBIDDEN.concat(FORBIDDEN[key] || [])) ok(!re.test(s), `${key}: generic step "${s}" (matches ${re})`);
        ok(wordsOf(s) <= 12, `${key}: step "${s}" is over 12 words`);
    }
    if (REQUIRED[key]) ok(REQUIRED[key].test(steps.join(' ')), `${key}: steps never name ${REQUIRED[key]}`);

    // ---- per item
    const seen = new Set();
    for (const q of items) {
        const tag = `${key} item ${q.itemIndex} (${q.text || JSON.stringify(q.ans)})`;
        let ws = [];
        try { ws = p.workedSteps(q); } catch (e) { ok(false, `${tag}: workedSteps threw ${e.message}`); }
        ok(Array.isArray(ws) && ws.length >= 3 && ws.length <= 6, `${tag}: workedSteps gave ${ws.length} steps (3-6, SCC-P4)`);
        for (const s of ws) {
            ok(typeof s.text === 'string' && s.text.trim(), `${tag}: a worked step has no text`);
            ok(Array.isArray(s.marks), `${tag}: a worked step has no marks array`);
            for (const re of GLOBAL_FORBIDDEN.concat(FORBIDDEN[key] || [])) ok(!re.test(s.text), `${tag}: worked step "${s.text}" (matches ${re})`);
        }
        ok(ws.length && ws[ws.length - 1].marks.length > 0, `${tag}: the last worked step marks no slot`);

        const itemStrings = typeof p.strings === 'function' ? p.strings({ categoryId: cat, skillId: skill, q }) : p.strings;
        const said = typeof itemStrings.sayFill === 'function' ? itemStrings.sayFill(q) : '';
        ok(said && !/__|\{/.test(said), `${tag}: the Say frame does not fill: "${said}"`);
        ok(!/\{\w+\}/.test(itemStrings.instruction), `${tag}: instruction keeps a placeholder: "${itemStrings.instruction}"`);

        let w = null;
        try { w = p.wrongAnswer(q); } catch (e) { ok(false, `${tag}: wrongAnswer threw ${e.message}`); }
        if (ok(w && w.value !== undefined && w.value !== null, `${tag}: no wrong answer`)) {
            ok(!sameAnswer(w.value, q.ans), `${tag}: wrong answer ${JSON.stringify(w.value)} equals the answer`);
            ok(String(w.display) !== String(Array.isArray(q.ans) ? q.ans.join(', ') : q.ans), `${tag}: wrong display equals the answer`);
            ok(typeof w.value === typeof q.ans || (Array.isArray(w.value) && Array.isArray(q.ans)), `${tag}: wrong answer type ${typeof w.value} differs from ${typeof q.ans}`);
            ok((p.misconceptions || []).includes(w.misconception), `${tag}: misconception "${w.misconception}" is not declared`);
            ok(typeof w.slot === 'string' && w.slot && w.slots && w.slot in w.slots, `${tag}: the wrong answer does not name its slot`);
            ok(typeof w.explain === 'string' && w.explain.length > 0, `${tag}: the wrong answer has no teacher note`);
            if (typeof w.value === 'number') ok(w.value >= 0 && Number.isFinite(w.value), `${tag}: wrong answer ${w.value} is negative`);
            seen.add(w.misconception);
        }

        if (p.stories) {
            const sty = p.stories(q, { seed: q.itemIndex });
            if (requireStories) ok(sty, `${tag}: no story`);
            if (sty) {
                ok(Number(sty.ans) === Number(q.ans) || /R/.test(String(q.ans)), `${tag}: story answer ${sty.ans} is not ${q.ans}`);
                ok(sty.label === (sty.ans === 1 ? sty.unit.one : sty.unit.many), `${tag}: label "${sty.label}" does not agree with ${sty.ans}`);
                ok(sty.answerText === `${sty.ans} ${sty.label}` || sty.ans >= 1000, `${tag}: answerText "${sty.answerText}"`);
                ok(sty.sentences[sty.sentences.length - 1] === sty.question && /\?$/.test(sty.question), `${tag}: the question is not the last line`);
                const text = sty.sentences.join(' ');
                ok(!/\bThere are 1 /.test(text) && !/\bThere is (?!1 )\d/.test(text), `${tag}: "there is/are" disagrees: ${text}`);
                for (const m of text.matchAll(/\b1 ([a-z]+)/g)) ok(!pluralNouns.has(m[1]), `${tag}: "1 ${m[1]}" in "${text}"`);
                if (requireStories) for (const s of sty.sentences) ok(wordsOf(s) <= 8, `${tag}: story sentence over 8 words: "${s}"`);
            }
        }
    }
    ok(seen.size >= 2 || (p.misconceptions || []).length < 2 || key === 'division:long_div_2digit' || key === 'comparing:compare_groups',
        `${key}: only one misconception across 20 items (${[...seen].join(', ')})`);
}

for (const key of REGRADED_SKILLS) checkSkill(key, { requireStories: key === 'addition:add_wp_10' });
for (const key of Object.keys(SIBLINGS)) checkSkill(key, { requireStories: /_wp_/.test(key) });
// P10 time + money: every provider, both of its item shapes.
for (const key of TM_PROVIDER_SKILLS) checkSkill(key);
for (const key of Object.keys(COUNTBY_MAKERS)) checkSkill(key);

// ---- O6 lane AP2 round 3: the figure and data cells (providers/figures.js), items in the shapes
// gen-measurement.js / gen-data-stats.js emit (the kit payload the providers read).
const { FIGURE_PROVIDER_IDS, inchText } = await import('../../js/modules/sheet/providers/index.js');
const figCell = (template, payload, extra = {}) => Object.assign({ cell: { template, v: 1, payload } }, extra);
const DATA_CATS = ['Dogs', 'Cats', 'Fish', 'Birds', 'Rabbits'];
const dataItem = (template, { scale = 1, step = 1, max = 10, kinds = ['value', 'most', 'least', 'more', 'total'] } = {}) => (r) => {
    const n = int(r, 3, 5);
    const categories = DATA_CATS.slice(0, n);
    let values = categories.map(() => int(r, 1, max) * scale * step);
    const kind = pick(r, kinds);
    let ask, answer;
    if (kind === 'most' || kind === 'least') {
        values = values.map((v, i) => v + i * scale * step);        // distinct, so one extreme
        values = shuffle(r, values);
        const v = kind === 'most' ? Math.max(...values) : Math.min(...values);
        ask = { kind }; answer = categories[values.indexOf(v)];
    } else if (kind === 'more') {
        values[0] = values[1] + scale * step * int(r, 1, 3);
        ask = { kind, i: 0, j: 1 }; answer = values[0] - values[1];
    } else if (kind === 'total') {
        ask = { kind }; answer = values.reduce((a, b) => a + b, 0);
    } else {
        const i = int(r, 0, n - 1);
        ask = { kind: 'value', i }; answer = values[i];
    }
    const payload = { title: 'Favorite Pets', categories, values, step, top: Math.max(...values) + step, scale, icon: 'circle', catTitle: 'Pet',
        valTitle: 'Number of children', ask, question: 'Which pet?', answer, orientation: 'vertical' };
    return figCell(template, payload, { ans: answer, text: payload.question, answerType: typeof answer === 'string' ? 'text' : 'number' });
};
const FIGURE_MAKERS = {
    'measurement:temperature': (r) => {
        const unit = pick(r, ['°F', '°C']); const step = pick(r, [1, 1, 2]); const lo = pick(r, [-10, 0, 10, 20, 30]);
        const every = step === 2 ? pick(r, [10, 20]) : pick(r, [5, 10]);
        const temp = step * int(r, Math.ceil((lo + 1) / step), Math.floor((lo + 20 * step - 1) / step));
        return figCell('thermometer', { temp, unit, lo, hi: lo + 20 * step, every, step }, { ans: temp, text: `What is the temperature in ${unit}?` });
    },
    'measurement:reading_ruler': (r) => {
        const res = pick(r, [1, 1, 2]); const start = pick(r, [0, 0, 1, 2]);
        const meas = res === 1 ? int(r, 1, 6 - start) : int(r, 0, 5 - start) + 0.5;
        const ans = inchText(meas, 4);
        return figCell('ruler', { len: 6, start, meas, res, labels: 'all', object: 'pencil', ans }, { ans: res === 1 ? meas : ans, text: 'How long is the pencil?' });
    },
    'measurement:reading_ruler_hard': (r) => {
        const start = pick(r, [0, 0, 1]);
        const meas = int(r, 0, 4 - start) + pick(r, [0.25, 0.5, 0.75, 1]);
        const ans = inchText(meas, 4);
        return figCell('ruler', { len: 6, start, meas, res: 4, labels: 'all', object: 'crayon', ans }, { ans, text: 'How long is the crayon?' });
    },
    'graphs:bar_graph': dataItem('bar-graph', { step: 2 }),
    'measurement:bar_graph_intro': dataItem('bar-graph', { max: 5, kinds: ['value', 'most', 'more'] }),
    'graphs:pictograph': (r) => {
        const q = dataItem('pictograph', { scale: 2, max: 6 })(r);
        // one row ends in half a picture (a key of 2): its value is odd
        const p = q.cell.payload;
        if (p.ask.kind === 'value' && r() < 0.5) { p.values[p.ask.i] -= 1; p.answer = p.values[p.ask.i]; q.ans = p.answer; }
        return q;
    },
    'measurement:pictograph_intro': dataItem('pictograph', { max: 5, kinds: ['value', 'more'] }),
    'graphs:tally_chart': dataItem('tally-chart', { max: 15 }),
    'area_perimeter:perimeter_intro': (r) => {
        const shape = pick(r, ['rectangle', 'square', 'triangle', 'pentagon']);
        let sides;
        if (shape === 'rectangle') { const l = int(r, 3, 10), w = int(r, 2, l - 1); sides = [l, w, l, w]; }
        else if (shape === 'square') { const e = int(r, 2, 9); sides = [e, e, e, e]; }
        else if (shape === 'pentagon') sides = [6, 4, 5, 5, 4];
        else sides = [9, 7, 5];
        const some = shape !== 'triangle' && r() < 0.5;
        const show = sides.map((_, i) => !some || i < 2);
        const ans = sides.reduce((a, b) => a + b, 0);
        return figCell('perimeter-shape', { shape, sides, show, unit: 'cm', ans }, { ans, text: 'What is the perimeter?' });
    },
};
for (const [key, maker] of Object.entries(FIGURE_MAKERS)) ITEM_MAKERS[key] = maker;
for (const key of FIGURE_PROVIDER_IDS) checkSkill(key);
ok(FIGURE_PROVIDER_IDS.length === Object.keys(FIGURE_MAKERS).length, `FIGURE_PROVIDER_IDS lists ${FIGURE_PROVIDER_IDS.length}, the test makes ${Object.keys(FIGURE_MAKERS).length}`);
for (const k of ['read-thermometer', 'measure-object', 'add-sides', 'tally']) {
    ok(k in INSTRUCTION_LIBRARY, `figure library key "${k}" is missing`);
    ok(lintInstruction(INSTRUCTION_LIBRARY[k]).length === 0, `figure library "${k}" fails the lint: ${lintInstruction(INSTRUCTION_LIBRARY[k]).join('; ')}`);
}

// ---- P9: every place-value, rounding and estimation id has a real provider (no "Solve.").
for (const key of PV_PROVIDER_IDS) checkSkill(key);
ok(PV_PROVIDER_IDS.length === Object.keys(PV_MAKERS).length, `PV_PROVIDER_IDS lists ${PV_PROVIDER_IDS.length}, the test makes ${Object.keys(PV_MAKERS).length}`);
for (const k of ['place-circle', 'place-write', 'unit-form', 'standard-form', 'disk-read', 'disk-count', 'draw-disks', 'chart-digits',
    'times-ten', 'word-name', 'order-least', 'order-down', 'underline-place', 'round-up-down', 'circle-rounds-to', 'mark-round',
    'between-tens', 'sort-round', 'round-table', 'estimate', 'estimate-place', 'estimate-closest', 'estimate-reasonable']) {
    ok(k in INSTRUCTION_LIBRARY, `pv library key "${k}" is missing`);
    const text = instructionFor(k, { n: 400, place: 'tens' });
    ok(lintInstruction(text).length === 0, `pv library "${k}" fails the lint: ${lintInstruction(text).join('; ')}`);
}
// The §14 rounding errors: never the right answer, always a named M-R id, and the cases they exist for.
for (const [n, P] of [[45, 10], [96, 10], [348, 100], [951, 100], [250, 100], [4038, 100], [1449, 1000]]) {
    const errs = pvRoundingErrors(n, P);
    const right = Math.floor((n + P / 2) / P) * P;
    ok(errs.length >= 1, `pvRoundingErrors(${n}, ${P}) gives no error`);
    for (const e of errs) ok(e.value !== right && /^M-R\d$/.test(e.misconception), `pvRoundingErrors(${n}, ${P}): ${JSON.stringify(e)}`);
}
ok(pvRoundingErrors(45, 10).some((e) => e.misconception === 'M-R2' && e.value === 40), 'halfway rounded down (M-R2) is missing for 45');
ok(pvRoundingErrors(96, 10).some((e) => e.misconception === 'M-R4' && e.value === 90), 'M-R4 (96 -> 90) is missing');
ok(pvRoundingErrors(348, 100).some((e) => e.misconception === 'M-R5' && e.value === 0) || pvRoundingErrors(348, 100).some((e) => e.misconception === 'M-R3' && e.value === 308), 'M-R3 / M-R5 missing for 348');
// The strings change with the item's scope: a decision page never says "Round to the nearest".
{
    const p = getProvider('number_sense', 'nearest_100');
    const dec = p.strings({ categoryId: 'number_sense', skillId: 'nearest_100', q: { pv: { kind: 'round', n: 348, place: 100, scope: 'decision' }, ans: 'Round up' } });
    ok(dec.instructionKey === 'round-up-down', `a decision item's instruction is "${dec.instruction}"`);
    const full = p.strings({ categoryId: 'number_sense', skillId: 'nearest_100', q: { pv: { kind: 'round', n: 348, place: 100 }, ans: 300 } });
    ok(full.instruction === 'Round to the nearest 100.', `a rounding item's instruction is "${full.instruction}"`);
}

/* ============================================================ function tables (2026-09-25) */
// Items in the generator's shape: q.cell = {template: 'function-table', payload}, q.ans the slots
// joined ", ". Every task is dealt, with one- and two-step rules, frame and line supports.
function ftItem(r, tasks, twoStep) {
    const task = pick(r, tasks);
    const two = twoStep && int(r, 0, 1) === 1;
    const rule = two ? [{ op: pick(r, ['x', '/']), n: int(r, 2, 5) }, { op: pick(r, ['+', '-']), n: int(r, 1, 6) }]
        : [{ op: pick(r, twoStep ? ['+', '-', 'x', '/'] : ['+', '-']), n: int(r, 2, 9) }];
    const pool = [];
    for (let x = 1; x <= 100; x++) { const y = applyRule(rule, x); if (Number.isFinite(y) && y >= 0 && y <= 100 && (rule[0].op !== '/' || x % rule[0].n === 0)) pool.push(x); }
    const xs = shuffle(r, pool).slice(0, 5);
    const rows = xs.slice(0, twoStep ? 3 : 4).map((x) => ({ x, y: applyRule(rule, x), hide: null }));
    rows.forEach((row, i) => {
        row.hide = task === 'outputs' ? 'out' : task === 'inputs' ? 'in' : task === 'make' ? 'both' : task === 'mixed' ? (i % 2 ? 'in' : 'out') : null;
    });
    const check = twoStep && task !== 'make' ? { x: xs[4], y: applyRule(rule, xs[4]) } : null;
    const payload = { task, rule, rows, check, support: int(r, 0, 1) ? 'line' : 'frame', machine: true };
    const ans = ftSlots(payload).map((sl) => sl.value).join(', ');
    return { cell: { template: 'function-table', v: 1, payload }, ftCheck: payload, ans, answerType: 'text', text: 'Use the rule.' };
}
ITEM_MAKERS['algebra:function_table_easy'] = (r) => ftItem(r, ['outputs', 'inputs', 'mixed', 'make', 'outputs'], false);
ITEM_MAKERS['algebra:function_table_hard'] = (r) => ftItem(r, ['rule', 'rule', 'inputs', 'mixed', 'outputs'], true);
REQUIRED['algebra:function_table_easy'] = /rule/i;
REQUIRED['algebra:function_table_hard'] = /rule/i;
checkSkill('algebra:function_table_easy');
checkSkill('algebra:function_table_hard');

// ---- the contract seam the roles rely on
ok(REGRADED_SKILLS.length === 24, `REGRADED_SKILLS lists ${REGRADED_SKILLS.length} skills, not 24`);
let threw = false;
try { instructionFor('ring-groups'); } catch (e) { threw = true; }
ok(threw, 'instructionFor must refuse to return an unfilled {n} placeholder');
ok(instructionFor('ring-groups', { n: 3 }) === 'Circle groups of 3. Write how many groups.', 'ring-groups does not fill {n}');
// Every library string added with the providers passes the instruction lint once filled.
for (const k of ['line-jumps', 'draw-blocks', 'draw-blocks-100', 'check-groups', 'how-many-left', 'ring-remainder',
    'pick-parts', 'fact-family', 'chart-fill', 'groups-total']) {
    ok(k in INSTRUCTION_LIBRARY, `library key "${k}" is missing`);
    const text = instructionFor(k, { n: 4 });
    ok(lintInstruction(text).length === 0, `library "${k}" fails the lint: ${lintInstruction(text).join('; ')}`);
}
// Critic round 2: the new library strings pass the lint too.
for (const k of ['ring-groups-each', 'ring-remainder-each', 'missing-all', 'story-k2', 'count-all', 'count-kind', 'count-tens']) {
    ok(k in INSTRUCTION_LIBRARY && lintInstruction(instructionFor(k, {})).length === 0, `library "${k}" is missing or fails the lint`);
}
ok(/quotient and the remainder/.test(instructionFor('ring-remainder', { n: 4 })), 'ring-remainder names the quotient and the remainder (its two slots)');
{
    const P = (k) => getProvider(...k.split(':'));
    // share_into_groups: grouping stories only - "N in each ..., how many groups".
    const sg = P('division:share_into_groups');
    for (let i = 0; i < 12; i++) {
        const st = sg.stories({ a: 24, b: 4, op: '÷', ans: 6 }, { seed: 7, index: i });
        ok(st && /^grouping/.test(st.schema), `share_into_groups story ${i} is ${st && st.schema}, not grouping`);
    }
    // R3 (critic round 3): the "___ ÷ ___ = ___" line asked for the number of groups a second
    // time beside the box (H8, a doubled slot). The box is the one answer place: no sentence.
    const sgs = sg.strings({ categoryId: 'division', skillId: 'share_into_groups' });
    ok(typeof sgs.sentence !== 'function', 'share_into_groups has ONE answer place (no second division sentence)');
    // div_remainders: every story interprets the remainder (left over, round up, full groups).
    const dr = P('division:div_remainders');
    const seenSchemas = new Set();
    for (let i = 0; i < 9; i++) {
        const st = dr.stories({ a: 23, b: 4, op: '÷', ans: '5 R 3', quotientRemainder: { quotient: 5, remainder: 3 } }, { seed: 3, index: i });
        ok(st && /left over|need|fill/.test(st.question) && [3, 5, 6].includes(st.ans), `div_remainders story ${i} does not interpret the remainder: ${st && st.question}`);
        if (st) seenSchemas.add(st.schema);
    }
    ok(seenSchemas.size === 3, `div_remainders rotates its three interpretations (${[...seenSchemas].join(', ')})`);
    // One page: neighbours never share a template AND a noun (mult_facts: "rows of chairs" twice).
    const mf = P('multiplication:mult_facts');
    const page = [0, 1, 2].map((i) => mf.stories({ a: 3 + i, b: 4, op: '×', ans: (3 + i) * 4 }, { seed: 11, index: i }));
    ok(new Set(page.map((s) => s.lines[0].replace(/\d+/g, '#').replace(/^[A-Z][a-z]+/, 'N'))).size === 3, 'mult_facts: three stories on a page, three contexts');
    // sub_5_pictures: Kindergarten stories about the picture's own objects, 6 words a line at most.
    const sp = P('subtraction:sub_5_pictures');
    const k = sp.stories({ pictureData: { shape: 'star', n: 5, m: 2 }, ans: 3 }, { seed: 1, index: 0 });
    ok(k && k.k && /stars?/.test(k.sentences.join(' ')) && k.sentences.every((s) => s.split(/\s+/).length <= 6), `sub_5_pictures: a short K story about stars (${k && k.sentences.join(' / ')})`);
    // base10_build: only misconceptions whose drawing a pupil makes.
    const bb = P('composing:base10_build');
    for (const n of [73, 57, 31, 90]) {
        const w = bb.wrongAnswer({ categoryId: 'composing', skillId: 'base10_build', ans: n, target: n, text: `Show ${n}`, cell: { template: 'base10', payload: { n } } });
        ok(!w || w.misconception !== 'tens-as-ones', `base10_build ${n}: "tens drawn as ones" cannot be drawn`);
    }
    // add_wp_*: the wrong answer carries the pupil's number sentence for Error analysis.
    const wp = P('addition:add_wp_10');
    const ww = wp.wrongAnswer({ categoryId: 'addition', skillId: 'add_wp_10', a: 2, b: 6, op: '+', ans: 8, text: '2 + 6' });
    ok(ww && /^\d+ [+−] \d+ = \d+$/.test(ww.work || ''), `add_wp_10: the wrong answer shows its working (${ww && ww.work})`);
}
// A registered sibling that is not in the test must still carry a real provider (every wp band).
for (const band of ['10', '20', '50', '100', '1k', '10k', '100k', '1m']) {
    for (const [cat, op] of [['addition', 'add'], ['subtraction', 'sub']]) {
        for (const suffix of ['', '_plain']) ok(registered.has(`${cat}:${op}_wp_${band}${suffix}`), `${cat}:${op}_wp_${band}${suffix} has no provider`);
    }
}

if (failures.length) {
    for (const f of failures.slice(0, 60)) console.log('  FAIL', f);
    if (failures.length > 60) console.log(`  ... and ${failures.length - 60} more`);
    console.log(`ws-providers-unit: FAIL (${failures.length} of ${checks} checks)`);
    process.exit(1);
}
console.log(`ws-providers-unit: OK (${checks} checks, ${TM_PROVIDER_SKILLS.length} time and money + ${REGRADED_SKILLS.length} re-graded skills + ${Object.keys(SIBLINGS).length} siblings + ${PV_PROVIDER_IDS.length} place-value / rounding / estimation + ${Object.keys(COUNTBY_MAKERS).length} count-by)`);
