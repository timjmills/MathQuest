// gen-function-table.js — function tables (algebra: function_table_easy, function_table_hard).
//
// Owner request 2026-09-25, from his sample sheet: "Find the rule for each function table" (an
// In / Out table with every row given, "The function rule is: [ ]") and "Complete each function
// table" (In (x) | x + 7 | Out, the In numbers given and the Out numbers blank). Rebuilt in our
// style as ONE kit cell (sheet/cells/function-table.js), drawn the same on paper, on the key and
// on screen, and extended past the sample (owner follow-ups): find the missing In numbers, mixed
// blanks, make your own table, a function-machine header, a Check row, a rule frame that fades
// to a free line, and In numbers out of order so the pupil cannot just follow the Out column.
//
// The whole item is decided by the skill's options (skill-options.js, "FUNCTION TABLES"):
//   task      outputs | rule | inputs | mixed | make       one per page
//   ops       {+, −, ×, ÷}                                  dealt in turn by item index
//   step      {1, 2}                                        one- or two-step rules, in turn
//   band      10 | 20 | 50 | 100 | 1000                     caps EVERY number in the table
//   tiles     3 | 4 | 5                                     rows
//   order     inorder | scrambled                           the In numbers
//   support   frame | line                                  the rule column / rule frame
//   pictures  bool                                          the function machine
//   response  standard | check                             a Check row under the table
//
// Guarantees (held by ws-content-audit's function-table rules): every row satisfies the rule; no
// number is negative or above the band; ÷ is always exact; a "find the rule" table shows at least
// three rows and exactly ONE rule of the rule space (+k, −k, ×k, ÷k, ×a ± b, ÷a ± b) fits them,
// so + and × can never both be right.
//
// Randomness is Math.random through utils (generateQuestionFor seeds it), so a seed reproduces
// a page; the ticked operations and step counts are dealt round-robin by state.itemIndex.
import { state } from './state.js';
import { randInt, shuffle } from './utils.js';
import { optionsFor, pvCap } from './skill-options.js';
import { renderCell, applyRule, ruleText, ftSlots } from './sheet/index.js';

export const FUNCTION_TABLE_SKILLS = Object.freeze(['function_table_easy', 'function_table_hard']);

const OPS = ['+', '-', 'x', '/'];
let _cursor = 0;

/** The skill's option values: the set's / caller's choice, else the default. */
export function ftOptions(skillId) {
    let defs = [];
    try { defs = optionsFor('algebra', skillId); } catch (e) { defs = []; }
    // Options belong to the skill being played: an item dealt by a mixed patterns page takes the
    // defaults, never another skill's choices.
    const mine = state.skill === skillId && state.skillOptions && typeof state.skillOptions === 'object' ? state.skillOptions : {};
    const out = {};
    for (const d of defs) {
        const has = Object.prototype.hasOwnProperty.call(mine, d.id) && mine[d.id] !== undefined;
        out[d.id] = has ? mine[d.id] : d.default;
    }
    return out;
}

/** A ticked set, legal members only; none ticked means no restriction (skill-options.js). */
function ticked(v, legal) {
    const list = (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]).filter((x) => legal.includes(x));
    return list.length ? list : legal.slice();
}

/** A tidy step for big bands: multiples of 5 above 100, of 10 at 1,000. */
function niceAmount(lo, hi, cap) {
    const unit = cap >= 1000 ? 10 : cap > 100 ? 5 : 1;
    const a = Math.max(1, Math.ceil(lo / unit)), b = Math.max(a, Math.floor(hi / unit));
    return randInt(a, b) * unit;
}

/** Every In number the rule keeps inside 0..cap (intermediate results too), whole all the way. */
function inputPool(rule, cap) {
    const out = [];
    for (let x = 1; x <= cap; x++) {
        let v = x;
        let ok = true;
        for (const s of rule) {
            v = applyRule([s], v);
            if (!Number.isFinite(v) || v < 0 || v > cap) { ok = false; break; }
        }
        if (ok) out.push(x);
    }
    return out;
}

/** One rule of the asked kind, inside the band. */
function makeRule(kind, steps, cap, need) {
    const hi = (k) => Math.max(2, Math.min(10, Math.floor(cap / Math.max(1, k))));
    if (steps === 1) {
        if (kind === '+' || kind === '-') {
            const top = cap <= 10 ? 5 : cap <= 20 ? 9 : cap <= 50 ? 20 : cap <= 100 ? 30 : Math.floor(cap / 4);
            return [{ op: kind, n: niceAmount(1, Math.max(1, Math.min(top, cap - need)), cap) }];
        }
        return [{ op: kind, n: randInt(2, hi(need)) }];
    }
    // Two steps: × or ÷ first, then + or −, so "x × 2 + 1" is read left to right (no brackets).
    const [mul, add] = kind;
    const a = randInt(2, Math.max(2, Math.min(mul === 'x' ? 10 : 5, Math.floor(cap / (need + 1)))));
    const b = randInt(1, Math.max(1, Math.min(10, Math.floor(cap / 5))));
    return [{ op: mul, n: a }, { op: add, n: b }];
}

// ---- the rule space a pupil could name, for the uniqueness guard --------------------------
function* ruleSpace(cap) {
    for (let k = 1; k <= cap; k++) { yield [{ op: '+', n: k }]; yield [{ op: '-', n: k }]; }
    for (let k = 2; k <= 12; k++) { yield [{ op: 'x', n: k }]; yield [{ op: '/', n: k }]; }
    for (let a = 2; a <= 12; a++) {
        for (let b = 1; b <= Math.min(cap, 100); b++) {
            yield [{ op: 'x', n: a }, { op: '+', n: b }]; yield [{ op: 'x', n: a }, { op: '-', n: b }];
            yield [{ op: '/', n: a }, { op: '+', n: b }]; yield [{ op: '/', n: a }, { op: '-', n: b }];
        }
    }
}
/** How many rules of the space fit every given pair (1 = the table names its rule). */
export function rulesFitting(pairs, cap) {
    let n = 0;
    for (const r of ruleSpace(cap)) if (pairs.every(([x, y]) => applyRule(r, x) === y)) n++;
    return n;
}

const INSTRUCTION = {
    outputs: 'Use the rule. Fill in the table.',
    rule: 'Find the rule. Write the rule.',
    inputs: 'Use the rule backward. Write each In number.',
    mixed: 'Use the rule. Fill in the table.',
    make: 'Write your own In numbers. Use the rule for Out.',
};
const HINT = {
    outputs: 'Do the rule to each In number. Write what comes out.',
    rule: 'Look at each In and Out. Test +, −, × and ÷ on every row, not just one.',
    inputs: 'Work backward: do the opposite of the rule to each Out number.',
    mixed: 'Go forward with the rule to find Out. Go backward to find In.',
    make: 'Choose any In number. Do the rule to it. That is the Out number.',
};

/**
 * Fill `q` with one function table. Returns true (the caller returns straight after).
 * `skillId` is function_table_easy or function_table_hard.
 */
export function generateFunctionTable(q, skillId) {
    const o = ftOptions(skillId);
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _cursor++;
    const task = ['outputs', 'rule', 'inputs', 'mixed', 'make'].includes(o.task) ? o.task : 'outputs';
    const band = [10, 20, 50, 100, 1000].includes(Number(o.band)) ? Number(o.band) : (skillId === 'function_table_hard' ? 100 : 20);
    const cap = Math.max(10, pvCap(band, state.range));
    const rowsN = [3, 4, 5].includes(Number(o.tiles)) ? Number(o.tiles) : 4;
    const ops = ticked(o.ops, OPS);
    const stepsSet = ticked(o.step, [1, 2]);
    const wantCheck = o.response === 'check' && task !== 'make';
    const need = rowsN + (wantCheck ? 1 : 0);

    // Deal the step count and the operation in turn, so every ticked choice appears on a page.
    let steps = stepsSet[at % stepsSet.length];
    let kind;
    if (steps === 2) {
        const muls = ops.filter((x) => x === 'x' || x === '/');
        const adds = ops.filter((x) => x === '+' || x === '-');
        const M = muls.length ? muls : ['x'];
        const A = adds.length ? adds : ['+'];
        kind = [M[Math.floor(at / stepsSet.length) % M.length], A[Math.floor(at / (stepsSet.length * M.length)) % A.length]];
    } else {
        kind = ops[Math.floor(at / stepsSet.length) % ops.length];
    }

    let rule = null, pool = [];
    const attempt = (k, st) => {
        for (let tries = 0; tries < 40 && !rule; tries++) {
            const r = makeRule(k, st, cap, need);
            const p = inputPool(r, cap);
            if (p.length >= need) { rule = r; pool = p; }
        }
    };
    attempt(kind, steps);
    // A band too small for the ask (two steps inside 10): one step of the same kind, then + 1.
    if (!rule && steps === 2) { steps = 1; kind = kind[0]; attempt(kind, 1); }
    if (!rule) { steps = 1; rule = [{ op: '+', n: 1 }]; pool = inputPool(rule, cap); }

    // The In numbers: distinct, then in order or out of order.
    let xs = [];
    let check = null;
    for (let tries = 0; tries < 40; tries++) {
        const pickd = shuffle(pool.slice()).slice(0, need);
        xs = pickd.slice(0, rowsN);
        const cx = wantCheck ? pickd[rowsN] : null;
        if (o.order === 'scrambled') {
            // never smallest-first (nor largest-first): the Out column cannot be read down
            for (let k = 0; k < 20; k++) {
                const asc = xs.every((v, i) => i === 0 || v > xs[i - 1]);
                const desc = xs.every((v, i) => i === 0 || v < xs[i - 1]);
                if (!asc && !desc) break;
                xs = shuffle(xs);
            }
        } else {
            xs.sort((a, b) => a - b);
        }
        const pairs = xs.map((x) => [x, applyRule(rule, x)]);
        if (task === 'rule' && rulesFitting(pairs, cap) !== 1) continue;
        check = cx === null || cx === undefined ? null : { x: cx, y: applyRule(rule, cx) };
        break;
    }

    const rows = xs.map((x) => ({ x, y: applyRule(rule, x), hide: null }));
    if (task === 'outputs') rows.forEach((r) => { r.hide = 'out'; });
    else if (task === 'inputs') rows.forEach((r) => { r.hide = 'in'; });
    else if (task === 'make') rows.forEach((r) => { r.hide = 'both'; });
    else if (task === 'mixed') {
        const idx = shuffle(rows.map((_, i) => i));
        const outs = new Set(idx.slice(0, Math.ceil(rows.length / 2)));
        rows.forEach((r, i) => { r.hide = outs.has(i) ? 'out' : 'in'; });
    }

    let note;
    if (task === 'make') {
        const lo = pool[0], hi = pool[pool.length - 1];
        note = rule[0].op === '/'
            ? `Use In numbers you can divide by ${rule[0].n}, up to ${hi}.`
            : `Use In numbers from ${lo} to ${hi}.`;
    }

    const payload = {
        task, rule, rows, check,
        support: o.support === 'line' ? 'line' : 'frame',
        machine: o.pictures !== false,
    };
    if (note) payload.note = note;

    const parts = ftSlots(payload).map((s) => s.value);
    q.cell = { template: 'function-table', v: 1, payload };
    try {
        q.visual = renderCell({ cell: q.cell }, { mode: 'screen', static: true, size: 'L', look: 'ican', state: 'blank' });
    } catch (e) { q.visual = ''; }
    q.text = INSTRUCTION[task];
    q.printText = INSTRUCTION[task];
    q.ans = parts.join(', ');
    q.keyParts = parts;
    q.answerType = 'text';
    q.selfAnswering = true;             // the table's own boxes are the slots (SL-7)
    q.ftCheck = payload;                // every screen host checks through ftAnswerMatches
    q.hint = HINT[task];
    q.options = [];
    q.printFormat = 'function-table';
    q.skillLabel = skillId === 'function_table_hard' ? 'Function Table' : 'Function Table';
    q.ftRule = ruleText(rule);
    return true;
}
