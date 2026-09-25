// gen-mult-patterns.js — the generators for four skills that share one idea (count by a step):
//
//   multiplication:count_by_tables     "Count by 1-12": one count-by row per table, to 12×
//   patterns:number_patterns_rule      count on, count back, double / halve, ×10, growing steps
//   multiplication:mult_chart (+ _easy) the multiplication chart to complete, shade or read
//   multiplication:nl_mult, division:nl_div   × and ÷ as equal hops on a number line
//
// gen-operations.js and gen-algebraic.js call in here from their own branches for these ids, so
// the logic sits in one file (owner requests A, B, C and the idea board of 2026-09-25). Every
// option a teacher sees for these skills (skill-options.js, block "COUNT-BY · MULTIPLICATION
// CHART · × / ÷ NUMBER LINE · NUMBER PATTERNS") is read here and nowhere else.
//
// Each item is drawn by a sheet-kit template (q.cell): `count-row`, `mult-grid`, `hop-line`. The
// screen twin (q.visual) is the same drawing, whose boxes the screen host turns into inputs.
//
// Randomness is Math.random, which generateQuestionFor() seeds, so a page is reproducible.

import { state } from './state.js';
import { randInt, shuffle } from './utils.js';
import { optionsFor, pvCap } from './skill-options.js';
import { k2Twin, renderCell } from './sheet/index.js';

/* ------------------------------------------------------------------------------ options */

function _def(id) {
    try { return optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { return null; }
}
/** The value of option `id` for this item: the set's / caller's choice, else the default. */
function opt(id) {
    const def = _def(id);
    if (!def) return undefined;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined;
    return v === undefined ? def.default : v;
}
/** A ticked set, or every legal value when none (or nothing legal) is ticked. */
function ticked(id, fallback) {
    const def = _def(id);
    const legal = def && def.values ? def.values.map(x => x.v) : fallback;
    let v = opt(id);
    if (!Array.isArray(v)) v = v === undefined || v === null ? [] : [v];
    const out = v.filter(x => legal.includes(x));
    return out.length ? out : legal.slice();
}

let _cursor = 0;
/** The item's position on the page (dealing round-robin), or a running cursor in live play. */
function itemAt() {
    if (Number.isFinite(state.itemIndex)) return state.itemIndex;
    return _cursor++;
}

const fmt = (n) => Number(n).toLocaleString('en-US');
const list = (a) => a.map(String).join(', ');
const acceptLists = (parts) => [parts.join(','), parts.join(', '), parts.join(' '), parts.map(fmt).join(', ')];

/**
 * `k` positions out of `pool` (ascending), spread along it rather than bunched: the pool is cut
 * into `given` even stretches and one position of each stays printed, so the missing ones never
 * run as one block to the end of the row (unless every one of them is missing).
 */
export function spreadBlanks(pool, k) {
    const n = pool.length;
    k = Math.max(0, Math.min(n, k));
    if (k >= n) return pool.slice();
    const given = n - k;
    const keep = new Set();
    for (let i = 0; i < given; i++) {
        const lo = Math.floor(i * n / given), hi = Math.max(lo, Math.floor((i + 1) * n / given) - 1);
        keep.add(pool[randInt(lo, hi)]);
    }
    // One printed number on its own: never at the very start, so the row's gaps are not all at its end.
    if (given === 1 && keep.has(pool[0]) && n > 3) { keep.clear(); keep.add(pool[randInt(Math.floor(n / 3), n - 1)]); }
    return pool.filter(x => !keep.has(x));
}

/** How many of `n` numbers a percentage leaves blank: at least one, and all at 100%. */
const pctCount = (pct, n) => (pct >= 100 ? n : Math.max(1, Math.min(n, Math.round(pct / 100 * n))));

/* ======================================================================== count by 1-12 */

let _lastTable = null;

export function genCountByTables(q) {
    let tables = ticked('constant', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice().sort((a, b) => a - b);
    const idx = itemAt();
    // R3 (critic round 3): with every table ticked (untouched) a page of five rows was the 1s to
    // the 5s in order, and counting by 1 is not practice. Untouched, the page deals 2 to 12 in a
    // shuffled round, so any page samples across the tables its title names; a teacher who
    // ticks tables keeps the order option.
    const untouched = tables.length === 12;
    if (untouched) tables = tables.filter((v) => v >= 2);
    let t;
    if ((untouched || opt('order') === 'mixed') && tables.length > 1) {
        // Mixed: every ticked table once in a shuffled round, then the next round.
        const round = Math.floor(idx / tables.length);
        const order = tables.slice();
        // a per-round shuffle that does not depend on earlier items (a seeded page is reproducible)
        let h = 2166136261 ^ round;
        for (let i = order.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 16777619) >>> 0; const j = h % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
        t = order[idx % order.length];
        if (!Number.isFinite(state.itemIndex) && t === _lastTable) t = order[(idx + 1) % order.length];
    } else {
        t = tables[idx % tables.length];
    }
    _lastTable = t;
    const values = Array.from({ length: 12 }, (_, i) => t * (i + 1));
    const pct = Number(opt('missing')) || 50;
    const pool = Array.from({ length: 11 }, (_, i) => i + 1);          // the first number always shows
    const blanks = spreadBlanks(pool, pctCount(pct, 11));
    const parts = blanks.map(i => values[i]);
    const shape = opt('shape') || 'box';

    q.text = `Count by ${t}. Write the missing numbers.`;
    q.printText = 'Count by the number in the box. Write the missing numbers.';
    q.ans = list(parts);
    q.keyParts = parts.map(String);
    q.acceptedAnswers = acceptLists(parts);
    q.answerType = 'text';
    q.selfAnswering = true;
    q.options = [];
    q.a = t; q.b = 12; q.op = '×';
    q.countBy = { step: t, values: values.slice(), blanks: blanks.slice(), pct };
    q.hint = `Each number is ${t} more than the one before. Count on by ${t}.`;
    q.skillLabel = `Count by ${t}`;
    const payload = { values, blanks, look: 'arcs', tab: String(t), shape };
    q.cell = { template: 'count-row', v: 1, payload };
    q.visual = k2Twin('count-row', payload);
    q.printFormat = 'count-row';
    return q;
}

/* ======================================================================= number patterns */

const PLACE_LO = { 1: 1, 10: 10, 100: 100, 1000: 1000 };
const PLACE_HI = { 1: 9, 10: 99, 100: 999, 1000: 9999 };
/** The band a start place sets: the biggest number a row may reach. */
const PLACE_CAP = { 1: 99, 10: 999, 100: 9999, 1000: 9999 };
const ADD_STEPS = { 1: [2, 3, 4, 5, 10], 10: [2, 3, 4, 5, 10, 25], 100: [5, 10, 25, 100], 1000: [10, 25, 100, 1000] };
const GROW_BY = { 1: [1, 2], 10: [1, 2, 5], 100: [10, 20], 1000: [100] };

/** One row of the pattern kind at this place, or null when the place cannot hold one. */
function patternRow(kind, place, cap) {
    const lo = PLACE_LO[place], hi = Math.min(PLACE_HI[place], cap);
    if (hi < lo) return null;
    for (let t = 0; t < 60; t++) {
        if (kind === 'add' || kind === 'sub') {
            const n = 8;
            const steps = ADD_STEPS[place].filter(s => (n - 1) * s <= cap);
            if (!steps.length) return null;
            const step = steps[randInt(0, steps.length - 1)];
            if (kind === 'add') {
                const top = Math.min(hi, cap - (n - 1) * step);
                if (top < lo) continue;
                const s = randInt(lo, top);
                return { kind, step, values: Array.from({ length: n }, (_, i) => s + i * step) };
            }
            const bottom = Math.max(lo, (n - 1) * step);
            if (bottom > hi) continue;
            const s = randInt(bottom, hi);
            return { kind, step, values: Array.from({ length: n }, (_, i) => s - i * step) };
        }
        if (kind === 'double') {
            const halve = randInt(0, 1) === 1;
            let n = 6;
            while (n > 4 && lo * 2 ** (n - 1) > (halve ? hi : cap)) n--;
            if (!halve) {
                const top = Math.min(hi, Math.floor(cap / 2 ** (n - 1)));
                if (top < lo) return null;
                const s = randInt(lo, top);
                return { kind: 'double', step: 2, values: Array.from({ length: n }, (_, i) => s * 2 ** i) };
            }
            // Halving: from a number that halves cleanly all the way (first = end x 2^(n-1)).
            const m = 2 ** (n - 1);
            const eLo = Math.max(1, Math.ceil(lo / m)), eHi = Math.floor(hi / m);
            if (eHi < eLo) { if (n > 4) { n--; continue; } return null; }
            const e = randInt(eLo, eHi);
            return { kind: 'halve', step: 2, values: Array.from({ length: n }, (_, i) => e * 2 ** (n - 1 - i)) };
        }
        if (kind === 'times10') {
            // × 10 runs on to the thousands (a place of its own cannot hold three terms).
            const c = Math.max(cap, 9999);
            const s = randInt(lo, Math.min(hi, Math.floor(c / 100)));
            if (s < lo) return null;
            const values = [s];
            while (values[values.length - 1] * 10 <= c && values.length < 5) values.push(values[values.length - 1] * 10);
            if (values.length < 3) continue;
            return { kind, step: 10, values };
        }
        if (kind === 'grow') {
            const n = 6;
            const g = GROW_BY[place][randInt(0, GROW_BY[place].length - 1)];
            const top = Math.min(hi, cap - 15 * g);
            if (top < lo) continue;
            const s = randInt(lo, top);
            const values = [s];
            for (let i = 1; i < n; i++) values.push(values[i - 1] + i * g);
            return { kind, step: g, values };
        }
        return null;
    }
    return null;
}

const RULE_TEXT = {
    add: (r) => `Rule: count on by ${fmt(r.step)}.`,
    sub: (r) => `Rule: count back by ${fmt(r.step)}.`,
    double: () => 'Rule: double each number.',
    halve: () => 'Rule: halve each number.',
    times10: () => 'Rule: multiply each number by 10.',
    grow: (r) => `Rule: add ${fmt(r.step)}, then ${fmt(2 * r.step)}, then ${fmt(3 * r.step)} … (${fmt(r.step)} more each time).`,
};
const RULE_BOX = {
    add: (r) => ({ pre: 'Rule: add', post: 'each time', value: r.step }),
    sub: (r) => ({ pre: 'Rule: subtract', post: 'each time', value: r.step }),
    double: () => ({ pre: 'Rule: multiply by', post: '', value: 2 }),
    halve: () => ({ pre: 'Rule: divide by', post: '', value: 2 }),
    times10: () => ({ pre: 'Rule: multiply by', post: '', value: 10 }),
    grow: (r) => ({ pre: 'Rule: the step grows by', post: 'each time', value: r.step }),
};

export function genNumberPatterns(q) {
    const kinds = ticked('pattern', ['add', 'sub', 'double', 'times10', 'grow']);
    const places = ticked('places', [1, 10, 100, 1000]).slice().sort((a, b) => a - b);
    const idx = itemAt();
    const kind0 = kinds[idx % kinds.length];
    let place = places[Math.floor(idx / kinds.length) % places.length];
    let row = null;
    for (let t = 0; t < places.length * 2 && !row; t++) {
        const cap = pvCap(PLACE_CAP[place], state.range);
        row = patternRow(kind0, place, cap);
        if (!row) place = places[(places.indexOf(place) + 1) % places.length];
    }
    if (!row) row = patternRow('add', 1, 99);
    const values = row.values;
    const n = values.length;
    const hideRule = !!opt('rule');
    const pct = opt('missing');
    let blanks;
    if (pct === null || pct === undefined) {
        blanks = Array.from({ length: Math.max(0, n - 3) }, (_, i) => i + 3);   // continue: first three shown
    } else {
        // Gaps anywhere. The first number always shows; a hidden rule keeps the first three, so
        // the rule can be found (3, 6 is +3 or ×2 until the third number decides it).
        const keepFirst = hideRule ? 3 : 1;
        const pool = Array.from({ length: n - keepFirst }, (_, i) => i + keepFirst);
        blanks = spreadBlanks(pool, pctCount(Number(pct), pool.length));
    }
    const parts = blanks.map(i => values[i]);
    const rule = RULE_BOX[row.kind](row);
    const answer = hideRule ? [...parts, rule.value] : parts;
    const shape = opt('shape') || 'box';

    q.text = hideRule ? 'Find the rule. Write the missing numbers and the rule.' : 'Use the rule. Write the missing numbers.';
    q.printText = q.text;
    q.ans = list(answer);
    q.keyParts = answer.map(String);
    q.acceptedAnswers = acceptLists(answer);
    q.answerType = 'text';
    q.selfAnswering = true;
    q.options = [];
    q.pattern = { kind: row.kind, step: row.step, values: values.slice(), blanks: blanks.slice(), place, ruleHidden: hideRule, rule: rule.value, gaps: pct === undefined ? null : pct };
    q.hint = row.kind === 'add' || row.kind === 'sub'
        ? `Find how much the numbers change each time. ${row.kind === 'add' ? 'Count on' : 'Count back'} by that much.`
        : row.kind === 'grow' ? 'Find the jump between each pair of numbers. The jump gets bigger each time.'
            : 'Compare two numbers side by side. Is the next one double, half or ten times as big?';
    q.skillLabel = 'Number Pattern';
    const payload = { values, blanks, look: 'train', shape };
    if (hideRule) payload.ruleBox = { pre: rule.pre, post: rule.post, value: String(rule.value) };
    else payload.rule = RULE_TEXT[row.kind](row);
    q.cell = { template: 'count-row', v: 1, payload };
    q.visual = k2Twin('count-row', payload);
    q.printFormat = 'count-row';
    return q;
}

/* ================================================================== multiplication chart */

const CHART_T = { 25: 5, 36: 6, 100: 10, 144: 12 };
// R3 (critic round 3): two holes in a 12 x 12 chart was a whole A4 page for two answers, and
// two holes are filled from their neighbours (pattern completion), not by using the chart. The
// most supported level now leaves 8 products to find, then 16, then 30.
const LEVEL_COUNT = { 2: 8, 1: 16, 0: 30 };

/** The support level of a mult_chart_easy item (a retired twin id names its own). */
function chartLevel(skill) {
    if (skill === 'mult_chart_medium') return 1;
    if (skill === 'mult_chart_hard') return 0;
    let t = opt('level');
    if (typeof t === 'number') t = [t];
    t = Array.isArray(t) ? t.filter(v => [0, 1, 2].includes(v)).sort((a, b) => b - a) : [];
    if (!t.length) return 2;
    return t[itemAt() % t.length];
}

export function genMultChart(q, skill) {
    const easy = skill !== 'mult_chart';
    const T = CHART_T[Number(opt('band'))] || 12;
    const allT = Array.from({ length: T }, (_, i) => i + 1);
    let tabs = ticked('constant', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).filter(v => v <= T);
    if (!tabs.length) tabs = allT.slice();
    const tabSet = new Set(tabs);
    const allTicked = tabs.length === T;
    const whole = easy || opt('chart') === 'whole';
    const task = opt('task') || 'fill';
    const pctRaw = opt('missing');
    const pct = pctRaw === null || pctRaw === undefined ? null : Number(pctRaw);
    const idx = itemAt();
    const focus = tabs[idx % tabs.length];                      // the table this item leans on

    // The chart: the whole block 1..T, or a 4 x 5 window cut from it that holds the focus table.
    let rows, cols;
    if (whole) { rows = allT.slice(); cols = allT.slice(); } else {
        const R = Math.min(4, T), C = Math.min(5, T);
        const inRows = task === 'pattern' || randInt(0, 1) === 0;
        const place = (n, t) => randInt(Math.max(1, t - n + 1), Math.min(t, T - n + 1));
        const r0 = inRows ? place(R, focus) : randInt(1, T - R + 1);
        const c0 = inRows ? randInt(1, T - C + 1) : place(C, focus);
        rows = Array.from({ length: R }, (_, i) => r0 + i);
        cols = Array.from({ length: C }, (_, j) => c0 + j);
    }
    const payload = { rows, cols, blanks: [] };
    const cellOK = (i, j) => tabSet.has(rows[i]) || tabSet.has(cols[j]);
    const cells = [];
    rows.forEach((_, i) => cols.forEach((__, j) => { if (cellOK(i, j)) cells.push([i, j]); }));

    if (task === 'fill') {
        let k;
        if (pct !== null) k = pctCount(pct, cells.length);
        else if (!whole) k = Math.min(3, cells.length);
        else if (easy) k = Math.min(LEVEL_COUNT[chartLevel(skill)], cells.length);
        else k = pctCount(50, cells.length);
        let pool = cells;
        // Level 2 (two cells) keeps the 1 row and the 1 column printed, as the old easy tier did.
        if (easy && pct === null && chartLevel(skill) === 2) {
            const inner = cells.filter(([i, j]) => rows[i] >= 2 && cols[j] >= 2);
            if (inner.length >= k) pool = inner;
        }
        let picked;
        if (!whole && pct === null) {
            // A window's three gaps sit in three different rows, each with a printed product beside it.
            for (let t = 0; t < 60; t++) {
                picked = shuffle(pool.slice()).slice(0, k);
                if (new Set(picked.map(c => c[0])).size === Math.min(k, rows.length)) break;
            }
        } else {
            picked = shuffle(pool.slice()).slice(0, k);
        }
        payload.blanks = picked.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const products = payload.blanks.map(([i, j]) => rows[i] * cols[j]);
        const complete = payload.blanks.length === rows.length * cols.length;
        q.text = complete ? 'Fill in the whole multiplication chart.' : 'Fill in the missing products.';
        q.printText = q.text;
        q.ans = list(products);
        q.keyParts = products.map(String);
        q.acceptedAnswers = acceptLists(products);
        const [i0, j0] = payload.blanks[0];
        q.a = rows[i0]; q.b = cols[j0]; q.op = '×';
        q.multChartData = { missingCells: payload.blanks.map(([i, j]) => ({ r: rows[i], c: cols[j], product: rows[i] * cols[j] })), missingCount: payload.blanks.length };
        q.hint = 'Find the row number and the column number of each empty box, and multiply. Or count on along the row: each step adds the row number.';
    } else if (task === 'headers') {
        const hr = rows.map((v, i) => i).filter(i => tabSet.has(rows[i]));
        const hc = cols.map((v, j) => j).filter(j => tabSet.has(cols[j]));
        const all = [...hr.map(i => ['r', i]), ...hc.map(j => ['c', j])];
        let k = pct === null ? (whole ? Math.max(2, Math.round(all.length / 3)) : 2) : pctCount(pct, all.length);
        let picked = [];
        for (let t = 0; t < 60; t++) {
            picked = shuffle(all.slice()).slice(0, k);
            const rOut = picked.filter(x => x[0] === 'r').length, cOut = picked.filter(x => x[0] === 'c').length;
            // A window keeps at least one row number and one column number printed to start from.
            if (whole || ((rOut < rows.length) && (cOut < cols.length))) break;
            if (t === 59) picked = picked.slice(0, Math.max(1, k - 2));
        }
        if (!picked.length) picked = [all[0]];
        payload.hdr = { rows: picked.filter(x => x[0] === 'r').map(x => x[1]).sort((a, b) => a - b), cols: picked.filter(x => x[0] === 'c').map(x => x[1]).sort((a, b) => a - b) };
        // Reading order of the header slots (the top row first, then each row's own number).
        const vals = [...payload.hdr.cols.map(j => cols[j]), ...payload.hdr.rows.map(i => rows[i])];
        q.text = 'Fill in the missing row and column numbers.';
        q.printText = q.text;
        q.ans = list(vals);
        q.keyParts = vals.map(String);
        q.acceptedAnswers = acceptLists(vals);
        q.hint = 'Look at a product and the number you know on its edge. What times that number makes the product?';
    } else if (task === 'shade') {
        const n = tabs.filter(v => v >= 2).length ? tabs.filter(v => v >= 2)[idx % tabs.filter(v => v >= 2).length] : 2;
        payload.shade = n;
        const distinct = [...new Set(rows.flatMap(r => cols.map(c => r * c)))].sort((a, b) => a - b);
        const opts = distinct.map((v, k) => ({ id: 'opt' + k, label: String(v), correct: v % n === 0 }));
        // The screen's own verb (the pupil taps the numbers); paper shades them (BD-11).
        q.text = `Tap every multiple of ${n}.`;
        q.printText = `Shade every multiple of ${n}.`;
        q.options = opts;
        q.ans = opts.filter(o => o.correct).map(o => o.id);
        q.printAnswer = opts.filter(o => o.correct).map(o => o.label).join(', ');
        q.answerType = 'multi-select-check';
        q.shadeOf = n;
        q.hint = `A multiple of ${n} is in the ${n} times table: ${n}, ${2 * n}, ${3 * n} … Look for the pattern the shaded boxes make.`;
    } else {
        // pattern: one row of the focus table with gaps, and the rule it follows
        const i = rows.indexOf(focus) >= 0 ? rows.indexOf(focus) : 0;
        const t = rows[i];
        const pool = cols.map((_, j) => j).slice(1);            // the row's first product always shows
        const k = pctCount(pct === null ? 50 : pct, pool.length);
        const bl = spreadBlanks(pool, k);
        payload.blanks = bl.map(j => [i, j]);
        payload.ruleBox = { pre: `Across the ${t} row, add`, post: 'each time', value: String(t) };
        const products = bl.map(j => t * cols[j]);
        const vals = [...products, t];
        q.text = `Fill in the ${t} row. Write the rule.`;
        q.printText = q.text;
        q.ans = list(vals);
        q.keyParts = vals.map(String);
        q.acceptedAnswers = acceptLists(vals);
        q.chartRow = t;
        q.hint = `Along a row the products go up by the row number. How much does the ${t} row go up each time?`;
    }
    if (task !== 'shade') { q.answerType = 'text'; q.options = []; }
    q.selfAnswering = true;
    q.chartTask = task;
    q.cell = { template: 'mult-grid', v: 1, payload };
    q.visual = k2Twin('mult-grid', payload);
    q.printFormat = 'mult-grid';
    q.skillLabel = task === 'fill' ? 'Mult Chart' : task === 'headers' ? 'Mult Chart: Factors' : task === 'shade' ? 'Mult Chart: Multiples' : 'Mult Chart: Pattern';
    if (!allTicked) q.chartTables = tabs.slice();
    return q;
}

/* ======================================================== × and ÷ on a number line (hops) */

export function genHopLine(q, skill) {
    const div = skill === 'nl_div';
    const tabs = ticked('constant', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice().sort((a, b) => a - b);
    const band = Number(opt('band')) || 100;
    const one = opt('ticks') === 'one';
    const maxEnd = one ? Math.min(band, 36) : band;
    const idx = itemAt();
    const fits = tabs.filter(s => 2 * s <= maxEnd);
    // Each longer line leans on the tables that need it: at 0-144 the tables whose 12 hops pass
    // 100 come first, at 0-100 those that pass 50, and so on (any ticked table that fits is used
    // when none of the ticked tables needs the longer line).
    const below = { 20: 0, 50: 20, 100: 50, 144: 100 }[band] || 0;
    const lean = one ? [] : fits.filter(s => s * 12 > below);
    const deal = lean.length ? lean : fits;
    const s = deal.length ? deal[idx % deal.length] : 2;
    const gMax = Math.max(2, Math.min(12, Math.floor(maxEnd / s)));
    const g = randInt(2, gMax);
    const p = g * s;
    let M;
    if (one) M = Math.min(maxEnd, Math.max(20, p + randInt(2, 6)));
    else M = s * Math.min(Math.floor(maxEnd / s), 12, g + randInt(1, 3));
    if (M < p) M = p;
    const response = ['draw', 'sentence', 'missing'].includes(opt('response')) ? opt('response') : 'draw';
    const unknown = ['a', 'b', 'c'][idx % 3];
    const numbered = opt('support') === 'numbers';
    const payload = { op: div ? '/' : 'x', hops: g, step: s, max: M, ticks: one ? 'one' : 'step', response, numbered };
    if (response === 'missing') payload.unknown = unknown;
    const t = div ? { a: p, b: s, c: g, glyph: '÷' } : { a: g, b: s, c: p, glyph: '×' };
    const show = (k) => (response === 'missing' && unknown === k ? '?' : String(t[k]));

    if (response === 'draw') {
        q.text = `${t.a} ${t.glyph} ${t.b} = ?`;
        q.printText = div ? 'Draw hops of the number you divide by. Write how many hops.' : 'Draw the hops on the line. Write the product.';
        q.ans = t.c;
        q.answerType = 'number';
    } else if (response === 'sentence') {
        q.text = div ? 'Look at the hops. Write the division sentence.' : 'Look at the hops. Write the multiplication sentence.';
        q.printText = 'Look at the hops. Write the number sentence.';
        const parts = [t.a, t.b, t.c];
        q.ans = list(parts);
        q.keyParts = parts.map(String);
        q.acceptedAnswers = acceptLists(parts).concat(div ? [] : acceptLists([t.b, t.a, t.c]));
        q.answerType = 'text';
        q.selfAnswering = true;
    } else {
        q.text = `${show('a')} ${t.glyph} ${show('b')} = ${show('c')}`;
        q.printText = 'Look at the hops. Write the missing number.';
        q.ans = t[unknown];
        q.answerType = 'number';
        q.missing = unknown === 'c' ? undefined : unknown;
    }
    q.options = [];
    q.a = t.a; q.b = t.b; q.op = t.glyph;
    q.hopLine = { hops: g, step: s, max: M, response, ticks: payload.ticks, numbered };
    q.hint = div ? `Hop by ${s} from 0 until you reach ${p}. Count the hops.` : `Make ${g} hops of ${s} from 0. Where do you land?`;
    q.skillLabel = div ? 'Division Number Line' : 'Multiplication Number Line';
    q.cell = { template: 'hop-line', v: 1, payload };
    let html = '';
    try { html = renderCell({ cell: q.cell }, { mode: 'screen', static: true, size: 'L', look: 'ican', state: 'blank' }); } catch (e) { html = ''; }
    q.visual = html;
    q.printFormat = 'hop-line';
    return q;
}
