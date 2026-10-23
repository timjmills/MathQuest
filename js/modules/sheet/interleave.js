// js/modules/sheet/interleave.js
// THE MIXED ORDER (design/IMPROVEMENT_PLAN.md 3.3 "Order"; PAGE_TYPES.md PT-MIX-6).
//
// A Mixed practice page deals several skills together. This module decides two things, both pure:
//
//   dealCounts(weights, count, opts)  how many problems each skill gets on a page of `count`
//   interleave(items, weights, seed, opts)  the order those problems print in
//
// dealCounts(weights, count, {min = 2, labels})
//   weights   {key: w} (or [[key, w], ...]) - the teacher's weights, Less : Equal : More = 1 : 2 : 3
//   count     problems on the page
//   returns   {counts: {key: n}, shares: {key: exact share}, plain: {key: largest-remainder n}, notes: [string]}
//   Largest remainder first (counts within 1 of the weights). Then TWO OF EACH beats the exact
//   weights: a skill on a page gets at least `min` problems (one alone is a lone item), taken from
//   the skill furthest over its share; the note says where the counts differ from the weights
//   ("Less : More on a 4-problem page gives 2 and 2, not 1 and 3"). A page too small for `min` of
//   every skill keeps the largest-remainder counts and says so (rotation over pages is M2's).
//
// interleave(items, weights, seed, {maxRun = 2, blockRun = 1, firstThird = true, labels})
//   items     [{key, block?}, ...] - one entry per problem, any extra fields kept. `key` is the
//             skill; entries of one skill keep their relative order. A RUN IS COUNTED IN TURNS:
//             a turn is one entry, or every entry sharing one `block` id (a block of small boxes,
//             printed together). A block whose entries are of several skills belongs to no skill
//             and breaks every run.
//   weights   {key: w} or null - only used to word the notes (the counts are the items given)
//   seed      the page's seed (sheet/rng.js; SCC-01: never Math.random)
//   maxRun    turns of one skill in a row (2); `blockRun` the same for a skill whose turns are
//             blocks (1: "facts block, clock, facts block, clock" passes, two facts blocks in a row
//             fail - one block already holds several problems of one kind)
//   firstThird every skill's first problem lies in the first third of the page (by problem
//             position, ceil(n / 3))
//   labels    {key: {name, noun}} - plain words for the notes ("Time", "clocks")
//   returns   {order: [item], indices: [i], counts: {key: problems}, turns: {key: turns},
//              cap: {key: turns}, maxRun: {key: longest run in turns}, longest, notes: [string],
//              firstThird: bool, relaxed: [string]}
//
// WHEN THE RUN RULE CANNOT BE MET, THE WEIGHTS WIN. A skill with `major` turns among `minor`
// turns of every other skill can be kept to runs of ceil(major / (minor + 1)) at best, so its cap
// becomes max(maxRun, that); the order spreads the runs as evenly as the counts allow (it follows
// each skill's ideal spacing), and a note says so in plain words ("Time takes most of the page, so
// up to 3 clocks come in a row"). The teacher's weights are never clipped silently.
//
// The order is a weighted round-robin: each turn goes to the skill furthest behind its even
// spacing (its turns spread over the page), with a small seeded jitter so another seed gives
// another order. A depth-first search keeps every rule (caps, first third) and backtracks when a
// choice would leave the rest impossible; if the first-third rule and the caps cannot both hold,
// the caps win and `relaxed` names the rule that gave way.
//
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { rng } from './rng.js';

const WEIGHT_WORDS = { 1: 'Less', 2: 'Equal', 3: 'More' };

const entriesOf = (weights) => (Array.isArray(weights)
    ? weights.map((w) => (Array.isArray(w) ? [String(w[0]), Number(w[1])] : [String(w.key), Number(w.weight)]))
    : Object.entries(weights || {}).map(([k, w]) => [k, Number(w)]))
    .map(([k, w]) => [k, Number.isFinite(w) && w > 0 ? w : 1]);

const nameOf = (labels, key) => (labels && labels[key] && labels[key].name) || key;

/** "a", "a and b", "a, b and c". */
const listWords = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The weights in plain words: "Less : More" when every weight is 1, 2 or 3; else "1 : 4". */
function ratioWords(ws) {
    if (ws.every((w) => WEIGHT_WORDS[w])) return ws.map((w) => WEIGHT_WORDS[w]).join(' : ');
    return ws.map((w) => String(Math.round(w * 100) / 100)).join(' : ');
}

/**
 * Largest-remainder counts for `count` problems by weight, then two of each (see the header).
 */
export function dealCounts(weights, count, { min = 2, labels } = {}) {
    const ents = entriesOf(weights);
    const keys = ents.map(([k]) => k);
    const n = Math.max(0, Math.floor(Number(count) || 0));
    const total = ents.reduce((a, [, w]) => a + w, 0) || 1;
    const shares = ents.map(([, w]) => (w / total) * n);
    const base = shares.map(Math.floor);
    let left = n - base.reduce((a, b) => a + b, 0);
    const byRem = shares.map((s, i) => [s - Math.floor(s), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of byRem) { if (left <= 0) break; base[i]++; left--; }
    const plain = base.slice();
    const out = base.slice();
    const notes = [];
    if (keys.length > 1 && n >= min * keys.length) {
        for (let guard = 0; guard < n * keys.length; guard++) {
            const low = out.findIndex((c) => c < min);
            if (low < 0) break;
            // Take from the skill furthest over its share (then the biggest count, then the later one).
            let from = -1;
            for (let i = 0; i < out.length; i++) {
                if (out[i] <= min) continue;
                if (from < 0) { from = i; continue; }
                const d = out[i] - shares[i];
                const df = out[from] - shares[from];
                if (d > df + 1e-9 || (Math.abs(d - df) <= 1e-9 && out[i] >= out[from])) from = i;
            }
            if (from < 0) break;
            out[from]--; out[low]++;
        }
        if (out.some((c, i) => c !== plain[i])) {
            notes.push(`${ratioWords(ents.map(([, w]) => w))} on a ${n}-problem page gives ${listWords(out.map(String))}, not ${listWords(plain.map(String))}`);
        }
    } else if (keys.length > 1 && n < min * keys.length) {
        notes.push(`A ${n}-problem page cannot hold ${min} of each of ${listWords(keys.map((k) => nameOf(labels, k)))}`);
    }
    const obj = (arr) => Object.fromEntries(keys.map((k, i) => [k, arr[i]]));
    return { counts: obj(out), shares: obj(shares), plain: obj(plain), notes };
}

/** The turns of an item list: [{key, items: [index], size}] in first-appearance order. */
export function turnsOf(items) {
    const turns = [];
    const byBlock = new Map();
    (items || []).forEach((it, i) => {
        const b = it && it.block !== undefined && it.block !== null && it.block !== '' ? String(it.block) : null;
        if (b !== null && byBlock.has(b)) {
            const t = byBlock.get(b);
            t.items.push(i);
            if (t.key !== String(it.key)) t.key = null;   // a block of several skills belongs to none
            return;
        }
        const t = { key: String(it.key), items: [i], block: b };
        if (b !== null) byBlock.set(b, t);
        turns.push(t);
    });
    for (const t of turns) t.size = t.items.length;
    return turns;
}

/**
 * The runs of an ordered item list, counted in turns (the check the self-test and the lint use):
 * {maxRun: {key: n}, longest, firstAt: {key: problem index}, blockPairs: {key: n}}.
 * `blockPairs` counts two block turns of one skill in a row (the block rule).
 */
export function runsOf(order) {
    const turns = turnsOf(order);
    const maxRun = {};
    const blockPairs = {};
    const firstAt = {};
    let last = null;
    let run = 0;
    let lastBlock = false;
    let pos = 0;
    for (const t of turns) {
        if (t.key !== null && firstAt[t.key] === undefined) firstAt[t.key] = pos;
        pos += t.size;
        const isBlock = t.size > 1;
        if (t.key !== null && t.key === last) {
            run++;
            if (isBlock && lastBlock) blockPairs[t.key] = (blockPairs[t.key] || 0) + 1;
        } else run = t.key === null ? 0 : 1;
        if (t.key !== null) maxRun[t.key] = Math.max(maxRun[t.key] || 0, run);
        last = t.key;
        lastBlock = isBlock;
    }
    const longest = Math.max(0, ...Object.values(maxRun));
    return { maxRun, longest, firstAt, blockPairs, n: pos };
}

/** The weights-win cap of each skill (see the header), in turns. */
export function capsOf(turnCount, { maxRun = 2, blockRun = 1, blockKeys = new Set() } = {}) {
    const total = Object.values(turnCount).reduce((a, b) => a + b, 0);
    const cap = {};
    for (const [k, t] of Object.entries(turnCount)) {
        const base = blockKeys.has(k) ? blockRun : maxRun;
        const minor = total - t;
        cap[k] = Math.max(base, Math.ceil(t / (minor + 1)));
    }
    return cap;
}

/** Order the items (see the header). */
export function interleave(items, weights = null, seed = 1, opts = {}) {
    const { maxRun = 2, blockRun = 1, firstThird = true, labels = null, nodeLimit = 40000 } = opts;
    const list = Array.isArray(items) ? items : [];
    const turns = turnsOf(list);
    const nItems = list.length;
    const keys = [...new Set(turns.map((t) => t.key).filter((k) => k !== null))];
    // Each skill's turns, in their given order (a skill's problems keep their own order).
    const queue = Object.fromEntries(keys.map((k) => [k, turns.filter((t) => t.key === k)]));
    const loose = turns.filter((t) => t.key === null);     // blocks of several skills: free separators
    const turnCount = Object.fromEntries(keys.map((k) => [k, queue[k].length]));
    const blockKeys = new Set(keys.filter((k) => queue[k].length && queue[k].every((t) => t.size > 1)));
    const cap = capsOf(Object.assign({}, turnCount, loose.length ? { '\u0000loose': loose.length } : {}), { maxRun, blockRun, blockKeys });
    delete cap['\u0000loose'];
    const counts = Object.fromEntries(keys.map((k) => [k, queue[k].reduce((a, t) => a + t.size, 0)]));
    const raised = new Set(keys.filter((k) => cap[k] > (blockKeys.has(k) ? blockRun : maxRun)));
    const T = turns.length;
    const deadline = Math.ceil(nItems / 3);
    const r = rng((Number(seed) >>> 0) || 1);
    // One jitter per (skill, turn index) drawn up front, so the search order is seed-stable.
    const jitter = Object.fromEntries(keys.map((k) => [k, Array.from({ length: T + 1 }, () => r() * 0.8)]));
    const looseJitter = Array.from({ length: T + 1 }, () => r() * 0.8);

    const placed = Object.fromEntries(keys.map((k) => [k, 0]));
    let looseUsed = 0;
    const seq = [];
    let nodes = 0;

    /** Can the rest still be laid with every cap kept? (A skill's left turns need separators.) */
    const feasible = (last, run) => {
        const left = keys.map((k) => turnCount[k] - placed[k]);
        const R = left.reduce((a, b) => a + b, 0) + (loose.length - looseUsed);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const rk = left[i];
            if (!rk) continue;
            const others = R - rk;
            const head = k === last ? Math.max(0, cap[k] - run) : cap[k];
            if (rk > head + cap[k] * others) return false;
        }
        return true;
    };

    const search = (last, run, pos, strictThird) => {
        if (seq.length === T) return true;
        if (++nodes > nodeLimit) return false;
        const t = seq.length;
        const cands = [];
        // A skill whose cap the weights raised runs as evenly as the counts allow: a run of it
        // holds floor or ceil of (its turns left at the run's start) / (other turns left + 1).
        let must = null;
        let stop = null;
        if (last !== null && raised.has(last) && placed[last] < turnCount[last]) {
            const othersLeft = keys.reduce((a, k) => a + (k === last ? 0 : turnCount[k] - placed[k]), 0) + (loose.length - looseUsed);
            const atStart = turnCount[last] - placed[last] + run;
            const lo = Math.floor(atStart / (othersLeft + 1));
            const hi = Math.ceil(atStart / (othersLeft + 1));
            if (run < lo) must = last;
            if (run >= hi) stop = last;
        }
        for (const k of keys) {
            if (placed[k] >= turnCount[k]) continue;
            if (k === last && run + 1 > cap[k]) continue;
            if (must !== null && k !== must) continue;
            if (stop !== null && k === stop) continue;
            // Even spacing: how far the skill is behind its ideal share of the turns so far.
            const lag = ((t + 1) * turnCount[k]) / T - placed[k];
            cands.push({ k, score: lag + jitter[k][placed[k]] });
        }
        if (looseUsed < loose.length && must === null) cands.push({ k: null, score: ((t + 1) * loose.length) / T - looseUsed + looseJitter[looseUsed] });
        cands.sort((a, b) => b.score - a.score);
        for (const c of cands) {
            const turn = c.k === null ? loose[looseUsed] : queue[c.k][placed[c.k]];
            const npos = pos + turn.size;
            if (c.k === null) looseUsed++; else placed[c.k]++;
            const nlast = c.k;
            const nrun = c.k === null ? 0 : c.k === last ? run + 1 : 1;
            let ok = feasible(nlast, nrun);
            if (ok && strictThird) {
                // Every skill not yet seen must still start before the deadline.
                const unseen = keys.filter((k) => placed[k] === 0);
                if (unseen.length && npos + unseen.length - 1 >= deadline) ok = false;
            }
            if (ok) {
                seq.push(turn);
                if (search(nlast, nrun, npos, strictThird)) return true;
                seq.pop();
            }
            if (c.k === null) looseUsed--; else placed[c.k]--;
            if (nodes > nodeLimit) return false;
        }
        return false;
    };

    const relaxed = [];
    let done = keys.length < 2 ? (seq.push(...turns), true) : search(null, 0, 0, !!firstThird);
    if (!done && firstThird) {
        // The caps win over the first-third rule.
        seq.length = 0; nodes = 0; looseUsed = 0;
        for (const k of keys) placed[k] = 0;
        done = search(null, 0, 0, false);
        if (done) relaxed.push('firstThird');
    }
    if (!done) {
        // Nothing keeps every cap (only possible past the node limit): plain even spacing, no caps.
        seq.length = 0;
        const p = Object.fromEntries(keys.map((k) => [k, 0]));
        let lu = 0;
        for (let t = 0; t < T; t++) {
            let best = null;
            for (const k of keys) {
                if (p[k] >= turnCount[k]) continue;
                const s = ((t + 1) * turnCount[k]) / T - p[k];
                if (!best || s > best.s) best = { k, s };
            }
            if (lu < loose.length && (!best || ((t + 1) * loose.length) / T - lu > best.s)) { seq.push(loose[lu++]); continue; }
            seq.push(queue[best.k][p[best.k]++]);
        }
        relaxed.push('caps');
    }
    const indices = seq.flatMap((t) => t.items);
    const order = indices.map((i) => list[i]);
    const runs = runsOf(order);
    const notes = [];
    const base = (k) => (blockKeys.has(k) ? blockRun : maxRun);
    for (const k of keys.length > 1 ? keys : []) {
        if (cap[k] > base(k) && (runs.maxRun[k] || 0) > base(k)) {
            const lab = (labels && labels[k]) || {};
            const name = lab.name || k;
            const noun = lab.noun || (blockKeys.has(k) ? `blocks of ${name.toLowerCase()}` : `${name.toLowerCase()} problems`);
            notes.push(`${name} takes most of the page, so up to ${runs.maxRun[k]} ${noun} come in a row`);
        }
    }
    if (relaxed.includes('firstThird')) {
        const late = keys.filter((k) => runs.firstAt[k] >= deadline).map((k) => nameOf(labels, k));
        if (late.length) notes.push(`${listWords(late)} first comes after the first third of the page, so the runs stay short`);
    }
    // Counts against the weights (within 1 of the weighted share), when weights are given.
    if (weights && keys.length > 1) {
        const ents = entriesOf(weights).filter(([k]) => keys.includes(k));
        // (the largest-remainder counts are within 1 of every share; say where the page's differ)
        const plain = dealCounts(ents, nItems, { min: 0 }).counts;
        if (ents.some(([k]) => counts[k] !== plain[k])) {
            notes.push(`${ratioWords(ents.map(([, w]) => w))} on a ${nItems}-problem page gives ${listWords(ents.map(([k]) => String(counts[k])))}, not ${listWords(ents.map(([k]) => String(plain[k])))}`);
        }
    }
    return {
        order, indices, counts, turns: turnCount, cap, maxRun: runs.maxRun, longest: runs.longest,
        notes: [...new Set(notes)], firstThird: keys.every((k) => runs.firstAt[k] < deadline), relaxed,
    };
}

/* ================================================================ the page's repeats (M1 r4) */

const OP_KEYS = { '+': '+', '-': '-', '−': '-', '*': '*', x: '*', '×': '*', '/': '/', '÷': '/' };
const numOf = (v) => (v === undefined || v === null || v === '' ? NaN : Number(String(v).replace(/,/g, '')));

/**
 * One two-number + - x / fact, normalised: {op: '+'|'-'|'*'|'/', a, b}, or null when the item is
 * not such a fact. Takes a plain {op, a, b}, a kit cell {template, payload}, a question {cell} or
 * a host item {q: {cell}}.
 */
export function factOf(x) {
    if (!x) return null;
    const q = x.q || x;
    const p = (q.cell && q.cell.payload) || (q.payload) || q;
    const op = OP_KEYS[String(p.op || q.op || '')];
    const ops = Array.isArray(p.operands) ? p.operands : [p.a, p.b];
    const a = numOf(ops[0]);
    const b = numOf(ops[1]);
    if (!op || !Number.isFinite(a) || !Number.isFinite(b)) return null;
    return { op, a, b };
}

/**
 * The fact family of a fact, the same for every fact of it (6 + 7, 7 + 6, 13 - 6, 13 - 7 ->
 * "+:13:6,7"; 8 x 10, 80 / 8 -> "x:8,10"), or '' (a quotient with a remainder has none).
 */
export function factFamily(f) {
    if (!f) return '';
    const pair = (x, y) => [x, y].sort((m, n) => m - n).join(',');
    if (f.op === '+') return `+:${f.a + f.b}:${pair(f.a, f.b)}`;
    if (f.op === '-') return `+:${f.a}:${pair(f.b, f.a - f.b)}`;
    if (f.op === '*') return `x:${pair(f.a, f.b)}`;
    if (f.op === '/' && f.b !== 0 && f.a % f.b === 0) return `x:${pair(f.b, f.a / f.b)}`;
    return '';
}

/**
 * THE PAGE'S REPEATS (critic M1 r3 D1; the machine check of a Mixed practice page). Over the
 * items of ONE page, in print order:
 *   exact        the same fact twice (7 + 3 and 7 + 3)
 *   turnarounds  a + or x fact and the same fact turned round (7 + 3 and 3 + 7)
 *   families     two facts of one fact family that are neither of those (6 + 7 and 13 - 6,
 *                13 - 6 and 13 - 7, 8 x 10 and 80 / 10)
 * Each entry is {i, j, key}: j the later item, i the first item it repeats. Items that are not
 * two-number facts are skipped. -> {exact, turnarounds, families, bad}; `bad` = exact +
 * turnarounds, the count a page may never print.
 */
export function pageRepeats(items) {
    const exact = [];
    const turnarounds = [];
    const families = [];
    const firstEx = new Map();
    const firstTurn = new Map();
    const firstFam = new Map();
    (items || []).forEach((x, j) => {
        const f = factOf(x);
        if (!f) return;
        const ex = `${f.op}:${f.a},${f.b}`;
        const turn = f.op === '+' || f.op === '*' ? `${f.op}:${[f.a, f.b].sort((m, n) => m - n).join(',')}` : '';
        const fam = factFamily(f);
        if (firstEx.has(ex)) exact.push({ i: firstEx.get(ex), j, key: ex });
        else if (turn && firstTurn.has(turn)) turnarounds.push({ i: firstTurn.get(turn), j, key: turn });
        else if (fam && firstFam.has(fam)) families.push({ i: firstFam.get(fam), j, key: fam });
        if (!firstEx.has(ex)) firstEx.set(ex, j);
        if (turn && !firstTurn.has(turn)) firstTurn.set(turn, j);
        if (fam && !firstFam.has(fam)) firstFam.set(fam, j);
    });
    return { exact, turnarounds, families, bad: exact.length + turnarounds.length };
}

export default { interleave, dealCounts, turnsOf, runsOf, capsOf, factOf, factFamily, pageRepeats };
