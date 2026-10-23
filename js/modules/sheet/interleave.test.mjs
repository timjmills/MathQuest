// js/modules/sheet/interleave.test.mjs
// Self-test of the mixed order (sheet/interleave.js; design/IMPROVEMENT_PLAN.md 3.4).
//
//   node js/modules/sheet/interleave.test.mjs
//
// Deterministic (fixed seeds). Prints one line per case, then `interleave self-test: OK` or
// `interleave self-test: FAIL` and exits non-zero on a failure. A case marked pending (a later
// phase builds what it checks) is listed and printed as pending, never counted as a failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { interleave, dealCounts, runsOf, turnsOf, pageRepeats, factFamily, factOf } from './interleave.js';

const results = [];
const check = (name, fn) => {
    try {
        const why = fn();
        results.push({ name, ok: !why, why: why || '' });
    } catch (e) {
        results.push({ name, ok: false, why: `threw ${e && e.message}` });
    }
};
const pending = (name, phase) => results.push({ name, pending: phase });

/** n items of skill `key`, each its own turn (a box of 2 x 1 or larger). */
const boxes = (key, n) => Array.from({ length: n }, (_, i) => ({ key, i }));
/** `blocks` blocks of `per` small boxes of skill `key` (one turn each). */
const blocks = (key, nBlocks, per) => Array.from({ length: nBlocks * per }, (_, i) => ({ key, i, block: `${key}#${Math.floor(i / per)}` }));
const seq = (res) => turnsOf(res.order).map((t) => (t.key === null ? '*' : t.key[0])).join('');
const keepsOwnOrder = (res) => {
    const by = {};
    for (const it of res.order) { const l = by[it.key] || (by[it.key] = []); l.push(it.i); }
    return Object.values(by).every((l) => l.every((v, j) => j === 0 || v > l[j - 1]));
};
const firstThirdOk = (res, n) => Object.values(runsOf(res.order).firstAt).every((p) => p < Math.ceil(n / 3));

// 1. The weights-win case: a skill with far more turns than every other skill can separate.
check('weights win: 1 : 5 on 12 boxes -> cap max(2, ceil(10 / 3)) = 4, runs spread, note', () => {
    const items = [...boxes('add', 2), ...boxes('time', 10)];
    for (const sd of [1, 2, 3, 4, 5, 6]) {
        const r = interleave(items, { add: 1, time: 5 }, sd);
        const rr = seq(r).split('a').filter(Boolean).map((x) => x.length).sort();
        if (rr.join(',') !== '3,3,4') return `seed ${sd}: runs ${rr} (${seq(r)})`;
    }
    const res = interleave(items, { add: 1, time: 5 }, 11, { labels: { time: { name: 'Time', noun: 'clocks' } } });
    if (res.cap.time !== 4) return `cap ${res.cap.time}`;
    if (res.maxRun.time > 4) return `run ${res.maxRun.time}`;
    if (res.maxRun.time < 4) return `run ${res.maxRun.time}: 10 among 2 cannot be kept to less than 4`;
    if (res.maxRun.add > 2) return `add run ${res.maxRun.add}`;
    // As evenly as the counts allow: 10 clocks in 3 gaps -> runs 4, 3, 3 in some order.
    const runs = seq(res).split('a').filter(Boolean).map((s) => s.length).sort();
    if (runs.join(',') !== '3,3,4') return `runs ${runs} (${seq(res)})`;
    if (!res.notes.some((t) => /^Time takes most of the page, so up to 4 clocks come in a row$/.test(t))) return `notes ${JSON.stringify(res.notes)}`;
    return '';
});

// 2. 1 : 3 on 12 clock-sized items: counts 3 and 9, runs of 3, the summary note.
check('1 : 3 on 12 clock-sized items: counts 3 and 9, runs of 3, the note', () => {
    const d = dealCounts({ add: 1, time: 3 }, 12);
    if (d.counts.add !== 3 || d.counts.time !== 9) return `counts ${JSON.stringify(d.counts)}`;
    const items = [...boxes('add', d.counts.add), ...boxes('time', d.counts.time)];
    for (const sd of [1, 2, 3, 4, 5, 6, 8, 9]) {
        const r = interleave(items, { add: 1, time: 3 }, sd);
        if (r.maxRun.time !== 3 || r.maxRun.add > 2 || !firstThirdOk(r, 12)) return `seed ${sd}: ${seq(r)}`;
    }
    const res = interleave(items, { add: 1, time: 3 }, 7, { labels: { time: { name: 'Time', noun: 'clocks' } } });
    if (res.counts.add !== 3 || res.counts.time !== 9) return `order counts ${JSON.stringify(res.counts)}`;
    if (res.cap.time !== 3) return `cap ${res.cap.time}`;
    if (res.maxRun.time !== 3) return `time run ${res.maxRun.time} (${seq(res)})`;
    if (res.maxRun.add > 2) return `add run ${res.maxRun.add}`;
    if (!res.notes.includes('Time takes most of the page, so up to 3 clocks come in a row')) return `notes ${JSON.stringify(res.notes)}`;
    if (!firstThirdOk(res, 12)) return `first third (${seq(res)})`;
    if (!keepsOwnOrder(res)) return 'a skill lost its own order';
    return '';
});

// 3. 1 : 1 : 1 - no run over 2.
check('1 : 1 : 1 on 12: 4 / 4 / 4, no run over 2, no note', () => {
    const d = dealCounts({ add: 1, sub: 1, mul: 1 }, 12);
    if (Object.values(d.counts).join(',') !== '4,4,4') return `counts ${JSON.stringify(d.counts)}`;
    for (const seed of [1, 2, 3, 99, 4242]) {
        const res = interleave([...boxes('add', 4), ...boxes('sub', 4), ...boxes('mul', 4)], { add: 1, sub: 1, mul: 1 }, seed);
        if (res.longest > 2) return `seed ${seed}: run ${res.longest} (${seq(res)})`;
        if (res.notes.length) return `seed ${seed}: notes ${JSON.stringify(res.notes)}`;
        if (!firstThirdOk(res, 12)) return `seed ${seed}: first third (${seq(res)})`;
    }
    return '';
});

// 4. Facts with clocks: blocks of facts alternate with clocks, runs counted in turns.
check('facts with clocks: facts block, clock, facts block, clock (blocks never two in a row)', () => {
    const items = [...blocks('facts', 3, 4), ...boxes('clock', 3)];
    for (const seed of [5, 6, 7]) {
        const res = interleave(items, { facts: 1, clock: 1 }, seed);
        const s = seq(res);
        if (/ff/.test(s)) return `seed ${seed}: two facts blocks in a row (${s})`;
        if (/ccc/.test(s)) return `seed ${seed}: three clocks in a row (${s})`;
        // A block prints together.
        const t = turnsOf(res.order);
        if (t.length !== 6) return `seed ${seed}: ${t.length} turns`;
    }
    // The checker itself: two facts blocks in a row is a run of 2 block turns (fails the block rule).
    const bad = [...blocks('facts', 2, 4), ...boxes('clock', 2)];
    const r = runsOf(bad);
    if (r.maxRun.facts !== 2 || r.blockPairs.facts !== 1) return `checker: ${JSON.stringify(r)}`;
    const good = [...blocks('facts', 1, 4), { key: 'clock', i: 0 }, ...blocks('facts', 1, 4).map((x) => Object.assign({}, x, { block: 'facts#9' })), { key: 'clock', i: 1 }];
    const g = runsOf(good);
    if (g.longest !== 1 || (g.blockPairs.facts || 0) !== 0) return `checker passes F C F C wrongly: ${JSON.stringify(g)}`;
    return '';
});

// 5. The L case: N = 6, a word row, 24 units; facts and clocks at Equal give 5 clocks (2 x 2 = 4
// units each) and 1 facts block (4 facts) = 6 turns; cap ceil(5 / 2) = 3; the note in turns.
check('L case: 5 clocks + 1 facts block = 6 turns, cap 3, the note in turns', () => {
    const items = [...boxes('clock', 5), ...blocks('facts', 1, 4)];
    const units = 5 * 4 + 1 * 4;
    if (units !== 24) return `units ${units}`;
    const res = interleave(items, { clock: 2, facts: 2 }, 3, { labels: { clock: { name: 'Time', noun: 'clocks' } } });
    if (Object.values(res.turns).reduce((a, b) => a + b, 0) !== 6) return `turns ${JSON.stringify(res.turns)}`;
    if (res.cap.clock !== 3) return `cap ${res.cap.clock}`;
    if (res.maxRun.clock !== 3) return `clock run ${res.maxRun.clock} (${seq(res)})`;
    if (!res.notes.includes('Time takes most of the page, so up to 3 clocks come in a row')) return `notes ${JSON.stringify(res.notes)}`;
    // 9 problems: the facts block starts within the first three.
    if (!firstThirdOk(res, 9)) return `first third (${seq(res)})`;
    return '';
});

// 6. Less : More on a 4-problem page: 2 and 2, the note.
check('Less : More on a 4-problem page: 2 and 2, the note', () => {
    const d = dealCounts({ add: 1, time: 3 }, 4);
    if (d.counts.add !== 2 || d.counts.time !== 2) return `counts ${JSON.stringify(d.counts)}`;
    if (!d.notes.includes('Less : More on a 4-problem page gives 2 and 2, not 1 and 3')) return `notes ${JSON.stringify(d.notes)}`;
    const res = interleave([...boxes('add', 2), ...boxes('time', 2)], { add: 1, time: 3 }, 1);
    if (!res.notes.includes('Less : More on a 4-problem page gives 2 and 2, not 1 and 3')) return `interleave notes ${JSON.stringify(res.notes)}`;
    if (res.longest > 2) return `run ${res.longest}`;
    return '';
});

// 7. Two of each with three skills, and a page too small for two of each.
check('two of each: 1 : 1 : 4 on 6 -> 2 / 2 / 2; 3 skills on 5 problems says so', () => {
    const d = dealCounts({ a: 1, b: 1, c: 4 }, 6);
    if (Object.values(d.counts).join(',') !== '2,2,2') return `counts ${JSON.stringify(d.counts)}`;
    if (!d.notes.length) return 'no note';
    const e = dealCounts({ a: 1, b: 1, c: 1 }, 5, { labels: { a: { name: 'Add' } } });
    if (!e.notes.some((t) => /cannot hold 2 of each/.test(t))) return `small page notes ${JSON.stringify(e.notes)}`;
    const f = dealCounts({ a: 2, b: 2 }, 8);
    if (f.notes.length) return `Equal on 8 noted: ${JSON.stringify(f.notes)}`;
    return '';
});

// 8. Counts within 1 of the weights.
check('counts within 1 of the weighted share (1 : 2 : 3 on 7..40)', () => {
    for (let n = 7; n <= 40; n++) {
        const d = dealCounts({ a: 1, b: 2, c: 3 }, n);
        for (const k of ['a', 'b', 'c']) if (d.counts[k] >= 2 && Math.abs(d.counts[k] - d.shares[k]) >= 1 && !d.notes.length) return `n ${n}: ${k} ${d.counts[k]} vs ${d.shares[k]}`;
        const sum = Object.values(d.counts).reduce((x, y) => x + y, 0);
        if (sum !== n) return `n ${n}: sum ${sum}`;
    }
    return '';
});

// 9. The seed: same seed -> identical order; different seeds -> different orders.
check('same seed -> identical order; different seeds -> different orders', () => {
    const items = [...boxes('add', 4), ...boxes('sub', 4), ...boxes('mul', 4), ...boxes('div', 4)];
    const a = seq(interleave(items, null, 4242));
    const b = seq(interleave(items, null, 4242));
    if (a !== b) return `same seed differs: ${a} / ${b}`;
    const orders = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => seq(interleave(items, null, s))));
    if (orders.size < 4) return `only ${orders.size} orders over 8 seeds`;
    return '';
});

// 10. Every skill within the first third, over many seeds and mixes.
check('every skill within the first third (4 skills, 1 : 1 : 2 : 3, 50 seeds)', () => {
    const d = dealCounts({ add: 1, sub: 1, mul: 2, div: 3 }, 14).counts;
    const items = Object.entries(d).flatMap(([k, n]) => boxes(k, n));
    for (let s = 1; s <= 50; s++) {
        const res = interleave(items, { add: 1, sub: 1, mul: 2, div: 3 }, s);
        if (!firstThirdOk(res, items.length)) return `seed ${s}: ${seq(res)}`;
        if (res.longest > 2) return `seed ${s}: run ${res.longest} (${seq(res)})`;
        if (!keepsOwnOrder(res)) return `seed ${s}: own order lost`;
        if (res.order.length !== items.length) return `seed ${s}: ${res.order.length} items`;
    }
    return '';
});

// 11. One skill: the order is the items' own.
check('one skill: order unchanged, no note', () => {
    const res = interleave(boxes('add', 6), null, 3);
    if (res.order.map((x) => x.i).join('') !== '012345') return 'order changed';
    if (res.notes.length) return 'note';
    return '';
});

// 12. SCC-01: no Math.random in the module.
check('no Math.random in sheet/interleave.js', () => {
    const src = readFileSync(fileURLToPath(new URL('./interleave.js', import.meta.url)), 'utf8');
    const code = src.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
    if (/Math\.random/.test(code)) return 'Math.random found';
    if (/\bwindow\b|\bdocument\b/.test(code)) return 'window / document found';
    return '';
});

// 13. Pending (M4): the 3-skill case at M with "the first time" - one example cell right before
// each skill's first problem on each page, outside the runs and the shares, inside the capacity sum.
pending('3 skills at M with "the first time": one example cell before each skill\'s first problem', 'M4');

// 14. pageRepeats (critic M1 r3 D1): exact repeats, turnarounds and fact families on one page.
check('pageRepeats: exact, turnaround and family found; other facts clean', () => {
    const f = (op, a, b) => ({ op, a, b });
    const r = pageRepeats([f('+', 7, 3), f('-', 13, 6), f('+', 3, 7), f('+', 7, 3), f('\u2212', 13, 7), f('\u00d7', 8, 10), f('\u00f7', 80, 10), f('/', 17, 5), f('/', 17, 5), { op: '+' }]);
    if (r.exact.length !== 2 || r.exact[0].j !== 3 || r.exact[1].j !== 8) return `exact ${JSON.stringify(r.exact)}`;
    if (r.turnarounds.length !== 1 || r.turnarounds[0].j !== 2) return `turn ${JSON.stringify(r.turnarounds)}`;
    if (r.families.length !== 2 || r.families[0].j !== 4 || r.families[1].j !== 6) return `fam ${JSON.stringify(r.families)}`;
    if (r.bad !== 3) return `bad ${r.bad}`;
    const clean = pageRepeats([f('+', 2, 3), f('-', 9, 4), f('*', 6, 7), f('/', 20, 4)]);
    if (clean.bad || clean.families.length) return 'clean page flagged';
    if (factFamily(factOf({ q: { cell: { payload: { a: 12, b: 3, op: '/' } } } })) !== 'x:3,4') return 'host item not read';
    if (factFamily(factOf({ op: '-', operands: [13, 6] })) !== '+:13:6,7') return 'operands not read';
    return '';
});

let failed = 0;
for (const r of results) {
    if (r.pending) { console.log(`  pending (${r.pending})  ${r.name}`); continue; }
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'ok     ' : 'FAIL   '} ${r.name}${r.ok ? '' : ` - ${r.why}`}`);
}
console.log(`interleave self-test: ${failed ? 'FAIL' : 'OK'} (${results.filter((r) => !r.pending).length - failed} passed, ${failed} failed, ${results.filter((r) => r.pending).length} pending)`);
process.exit(failed ? 1 : 0);
