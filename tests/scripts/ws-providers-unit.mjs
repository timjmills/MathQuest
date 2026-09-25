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
import { REGRADED_SKILLS, STORY_NOUNS } from '../../js/modules/sheet/providers/index.js';
import { rng, int, pick, shuffle, deriveSeed } from '../../js/modules/sheet/rng.js';
import { sameAnswer } from '../../js/modules/sheet/providers/util.js';

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
    'division:share_into_groups': [/times fact/i, /missing factor/i],
    'division:div_remainders': [/times fact/i, /missing factor/i],
    'comparing:compare_groups': [/write the answer/i],
    'composing:base10_build': [/write the answer/i, /rods|units/i],
    'composing:ten_frame_build': [/write the answer/i],
};

// The key idea each skill's steps must name.
const REQUIRED = {
    'addition:add_facts': /count on|make 10/i,
    'addition:add': /ones/i,
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
};

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
console.log(`ws-providers-unit: OK (${checks} checks, ${REGRADED_SKILLS.length} re-graded skills + ${Object.keys(SIBLINGS).length} siblings + ${TM_PROVIDER_SKILLS.length} time and money)`);
