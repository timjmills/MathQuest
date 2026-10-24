// ws-dealer-uniform — does a skill's dealer draw its items evenly from the skill's valid set, with no value crowding a
// page and no seeded case pinned to a position? (pilot-su-c critic r2 N1: the fix-r1 2-digit dealer drew the bottom
// digit first, so the top ones digit was 9 on 39 of 120 items where a uniform draw gives 22 %, minuend 49 printed four
// times on one page of 20, and the one zero item always landed on item h or r — `itemIndex % 10 === 7`, L10.)
//
//   node tests/scripts/ws-dealer-uniform.mjs --skill subtraction:sub_50_no_regroup
//   node tests/scripts/ws-dealer-uniform.mjs --skill a:b,c:d --n 120 --page 20 --opts '{"zeros":"on"}'
//   node tests/scripts/ws-dealer-uniform.mjs --skill a:b --rulings tests/fixtures/precritic/pilot-su-c/rulings.json --root <tree>
//   node tests/scripts/ws-dealer-uniform.mjs --self-test          # the statistics and the three judges on seeded decks, no app
//
// THE DEAL (print-sheet.js generateRun, emulated as ws-node-lint REPEATS does): one run of --n items (default 120) of the
// one skill, item i dealt by generateQuestionFor({category, skill, opts, seed: base + i + 7919k, itemIndex: i,
// itemCount: n}) with base = fnv(category:skill), a repeat of an earlier item retried up to 12 times (k). The run is cut
// into pages of --page items (default 20: buildSheet's count is the host's measure, which node cannot take; pass the
// page's count with --page when it differs). Operands are read as ws-card-rulings reads them (q.cell.payload.operands,
// q.a / q.b, or "a − b" in q.text); an item none of these read is unreadable.
//
// THE THREE JUDGES
//   UNIFORM   every place of a, b and the answer (ones, tens, ...) and, where the valid set holds at most n/5 values, the
//             value of a and of the answer, against their frequencies under a UNIFORM draw from the valid set. A cell
//             (one digit of one place, or one value) more than 2σ above its uniform expectation is named; a place / value
//             set is over-dealt only when its χ² tail is also below the 1 % family-wise bar, CALIBRATED by 2,000 simulated
//             uniform decks of the same size (a min-p test over every place and value set of the skill), so 120 honest
//             items do not fail by chance (a flat 2σ per cell would: about 40 cells a skill). Under-dealt cells are never
//             failed on their own (a card may thin a case on purpose: 2d − 1d deals b = 1 half as often).
//             FOUR READINGS of "uniform over the valid set", one of which a fair dealer follows on EVERY place (the skill
//             passes when one reading finds no place over-dealt): pairs (every valid pair equally likely: critic r2 N1's
//             reference), kinds (the same inside each item kind by operand length, 2d − 1d vs 2d − 2d, the mix being the
//             dealer's), digits (every digit a place uses equally likely: the approved _100_regroup dealers draw the ones
//             digit "flat"), and named number first (the number "within N" bounds - the minuend, the sum - uniform over its
//             band, then the item uniform given it: generateSubPair's minuend-first draw). Drawing the OTHER number first
//             (fix r1's bottom digit first) is no reading, so it fails all four.
//             THE VALID SET is LEARNED from a deep sample (72 pages of the same deal from other seeds) inside the spec
//             card's rulings (ws-card-rulings' parser): the span of a, b and the answer, every SHAPES constraint the
//             sample never breaks (a ≥ b, no regrouping, the ones regroup, b as long as a, ...), and the digits each place
//             uses (a dealer that never prints a 0 in b has a smaller set by design: uniformity is judged INSIDE the
//             support). A card `maxShare` bound of at most 10 % on a case (zeroCase) takes that case out of the set and
//             out of this judge (the share bound is ws-card-rulings' / ws-content-audit's check 1). A skill whose set cannot
//             be learned or sampled (no single operation, under 30 judged items) is NOT checked: INCOMPLETE, never OK.
//   PAGE      on every page, no value of a prints more than twice and no answer more than three times (critic r2 N1's fix:
//             "cap a page at 2 copies of any minuend and 3 of any answer"), and no item twice. A value the valid set itself
//             deals more than once a page (a small domain) may print ceil(cap × its expected count) times.
//   PERIOD    no seeded case sits on a fixed position: for each case (a zero case, an answer shorter than a, b = 1, b = 0,
//             a = b) with at least 4 items, its positions on the page (i mod page) and in the run (i mod m, m = 2..page)
//             may not crowd one residue (binomial tail, Bonferroni over the residues and periods, below 0.001).
//
// Exit 0 OK, 1 FAIL, 2 usage (an unknown flag, an unknown --skill: FAIL), 4 N/A (every skill deals no operands: fractions,
// clocks, shapes - `ws-dealer-uniform: N/A - no operand-dealt items: ...`), 3 INCOMPLETE (a skill whose valid set is unknown, or
// with unreadable items); 0 items read for a skill FAILS it. Prints `ws-dealer-uniform: OK|FAIL|INCOMPLETE (...)` last.
// --json <file> writes the per-skill results; --report-only exits 0 (the last line still says what it found).
// BASELINE: tests/fixtures/precritic/dealer-uniform.baseline.json {skills: {"cat:skill": [finding key, ...]}} pins real
// findings on approved skills (a key is the finding's text up to its first " ("); a pinned finding prints `pinned` and
// does not fail, a pinned key no longer found prints `fixed?`. --baseline <file> picks another pin, --no-baseline none.
import { resolve, dirname, relative } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseRulings, cardBlocks, readItem, PRED, itemPasses, predicate, loadApp, fnv } from './ws-card-rulings.mjs';

const TOOL = 'ws-dealer-uniform';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const argAll = (f) => argv.flatMap((a, i) => (a === f && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const say = (...a) => process.stdout.write(a.join(' ') + '\n');
const RETRIES = 12;
const MIN_STRATUM = 30;   // judged items an item kind needs before UNIFORM judges it
const DEEP = 72;          // pages in the deep sample the valid set is learned from (1,440 items at 20 a page)

/* ------------------------------------------------------------------ statistics (pure) */
/** Upper tail of the chi-square distribution, P(X >= x; k), by the regularized incomplete gamma. */
export function chiSqTail(x, k) {
    if (x <= 0) return 1;
    const a = k / 2, z = x / 2;
    const lg = lgamma(a);
    if (z < a + 1) { // series for P, tail = 1 - P
        let sum = 1 / a, term = 1 / a;
        for (let n = 1; n < 500; n++) { term *= z / (a + n); sum += term; if (term < sum * 1e-14) break; }
        return Math.max(0, 1 - sum * Math.exp(-z + a * Math.log(z) - lg));
    }
    let b = z + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d; // continued fraction for Q
    for (let i = 1; i < 500; i++) {
        const an = -i * (i - a); b += 2;
        d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
        c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
        d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break;
    }
    return Math.min(1, Math.exp(-z + a * Math.log(z) - lg) * h);
}
function lgamma(x) {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; let s = c[0]; for (let i = 1; i < g + 2; i++) s += c[i] / (x + i);
    const t = x + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(s);
}
/** P(X >= k) for X ~ Binomial(n, p). */
export function binomTail(k, n, p) {
    if (k <= 0) return 1;
    let s = 0;
    for (let j = k; j <= n; j++) s += Math.exp(lgamma(n + 1) - lgamma(j + 1) - lgamma(n - j + 1) + j * Math.log(p) + (n - j) * Math.log(1 - p));
    return Math.min(1, s);
}
/** One distribution judged: observed counts against expected probabilities. */
export function judgeCells(obs, probs, n) {
    const cells = [];
    let chi = 0, df = -1;
    for (const [v, p] of probs) {
        if (!(p > 0)) continue;
        const o = obs.get(v) || 0, e = n * p, sd = Math.sqrt(n * p * (1 - p)) || 1e-9;
        chi += (o - e) * (o - e) / e; df++;
        cells.push({ v, o, e, z: (o - e) / sd });
    }
    const outside = [...obs.entries()].filter(([v]) => !(probs.get(v) > 0)).reduce((a, [, c]) => a + c, 0);
    return { chi, df: Math.max(1, df), p: df >= 1 ? chiSqTail(chi, df) : 1, cells, over: cells.filter((c) => c.z > 2), under: cells.filter((c) => c.z < -2), outside };
}
const digitAt = (x, k) => Math.floor(Math.abs(x) / 10 ** k) % 10;
const nd = (x) => String(Math.abs(Math.trunc(x))).length;

/* ------------------------------------------------------------------ the valid set */
const OPS = { '-': (a, b) => a - b, '+': (a, b) => a + b, '×': (a, b) => a * b, '÷': (a, b) => (b ? a / b : NaN) };
/** The operation of an item: its payload's sign, else the one that makes its answer. */
export function opOf(x) {
    const o = x.op == null ? '' : String(x.op);
    if (/[−\-–]/.test(o)) return '-';
    if (/\+/.test(o)) return '+';
    if (/[×x*]/.test(o)) return '×';
    if (/[÷/]/.test(o)) return '÷';
    for (const k of ['-', '+', '×', '÷']) if (OPS[k](x.a, x.b) === x.ans) return k;
    return null;
}
/** The shape constraints the valid set may LEARN: each one that holds on every item of the deep sample is kept. */
export const SHAPES = {
    'a ≥ b': (x) => x.a >= x.b,
    'no regrouping (−)': (x) => itemPasses({ assert: 'noRegroup', op: '-' }, x),
    'no regrouping (+)': (x) => itemPasses({ assert: 'noRegroup', op: '+' }, x),
    'regroups (−)': (x) => !itemPasses({ assert: 'noRegroup', op: '-' }, x),
    'regroups (+)': (x) => !itemPasses({ assert: 'noRegroup', op: '+' }, x),
    'the ones regroup (+)': (x) => (x.a % 10) + (x.b % 10) >= 10,
    'the ones regroup (−)': (x) => (x.a % 10) < (x.b % 10),
    'b as long as a': (x) => nd(x.b) === nd(x.a),
    'b shorter than a': (x) => nd(x.b) < nd(x.a),
};
const placeKey = (fld, k) => `${fld}:${k}`;
const digitOrDot = (v, k) => (nd(v) > k ? digitAt(v, k) : '·');
/**
 * The skill's valid set, as a uniform sample of it: every pair (a, b) whose
 *   - a, b and the answer lie inside the span of the deep sample (and every card item ruling: range, digits, noRegroup),
 *   - shape holds every SHAPES constraint the deep sample never breaks,
 *   - digits, place by place, are digits the deep sample uses at that place (a dealer that never prints a 0 in b, or a
 *     tens digit 1 in a 2d − 1d minuend, has a smaller valid set by design: uniformity is judged INSIDE the support),
 *   - case is not one the card bounds to at most 10 % (`maxShare`): those items are left out of the judge.
 * Drawn by rejection from the uniform rectangle of the bounds, so it is uniform over pairs (not over a, then b).
 * Returns {sample, how, excluded, learned} or {error}.
 */
export function validSet({ rulings = [], deep, rng, want = 4000, maxTries = 2e6 }) {
    const itemR = rulings.filter((r) => ['range', 'digits', 'noRegroup'].includes(r.assert));
    const excluded = rulings.filter((r) => r.assert === 'maxShare' && r.max <= 0.1).map((r) => ({ id: r.id, p: predicate(r.when) }));
    const pool = deep.filter((x) => x && !excluded.some((e) => e.p(x)));
    if (pool.length < 50) return { error: `only ${pool.length} item(s) of the deep sample to learn the valid set from` };
    const ops = new Map();
    for (const x of pool) { const o = opOf(x); ops.set(o, (ops.get(o) || 0) + 1); }
    const [op, nOp] = [...ops.entries()].sort((u, v) => v[1] - u[1])[0];
    if (!op || nOp < pool.length * 0.95) return { error: `no single operation (${[...ops.entries()].map(([o, c]) => `${o || '?'} ${c}`).join(', ')})` };
    const span = (f) => { let lo = Infinity, hi = -Infinity; for (const x of pool) { const v = f(x); if (v < lo) lo = v; if (v > hi) hi = v; } return [lo, hi]; };
    const [aLo, aHi] = span((x) => x.a), [bLo, bHi] = span((x) => x.b), [cLo, cHi] = span((x) => x.ans);
    const shapes = Object.entries(SHAPES).filter(([, f]) => pool.every(f));
    const W = Math.max(nd(aHi), nd(bHi), nd(cHi), 1);
    const alpha = new Map();
    for (const x of pool) for (const fld of ['a', 'b', 'ans']) for (let k = 0; k < W; k++) {
        const key = placeKey(fld, k);
        if (!alpha.has(key)) alpha.set(key, new Set());
        alpha.get(key).add(digitOrDot(x[fld], k));
    }
    const ok = (x) => {
        if (!(x.ans >= cLo && x.ans <= cHi) || !Number.isInteger(x.ans)) return false;
        for (const fld of ['a', 'b', 'ans']) for (let k = 0; k < W; k++) if (!alpha.get(placeKey(fld, k)).has(digitOrDot(x[fld], k))) return false;
        return shapes.every(([, f]) => f(x)) && !excluded.some((e) => e.p(x));
    };
    const out = [];
    let tries = 0;
    for (; tries < maxTries && out.length < want; tries++) {
        const a = aLo + Math.floor(rng() * (aHi - aLo + 1)), b = bLo + Math.floor(rng() * (bHi - bLo + 1));
        const x = { a, b, ans: OPS[op](a, b), op };
        if (ok(x)) out.push(x);
    }
    if (out.length < Math.min(want, 400)) return { error: `the learned valid set is too sparse to sample (${out.length} of ${tries} draws)` };
    const learned = [...shapes.map(([n]) => n), `a ${aLo}..${aHi}`, `b ${bLo}..${bHi}`, `answer ${cLo}..${cHi}`];
    const narrow = [...alpha.entries()].filter(([, set]) => { const d = [...set].filter((v) => v !== '·'); return d.length > 1 && d.length < 10; }).map(([k, set]) => `${k.replace(':', '@')} {${[...set].filter((v) => v !== '·').sort().join('')}}`);
    return {
        sample: out, excluded, learned, ok, op, span: { a: [aLo, aHi], b: [bLo, bHi], ans: [cLo, cHi] },
        how: `${rulings.length ? `card ${itemR.map((r) => r.id).join(', ')}${excluded.length ? ` (${excluded.map((e) => e.id).join(', ')} cases left out)` : ''} + ` : 'no card; '}learned from ${pool.length} items: ${learned.join(', ')}${narrow.length ? `; digits ${narrow.slice(0, 4).join(' ')}${narrow.length > 4 ? ' …' : ''}` : ''}; ${out.length} uniform draws`,
    };
}

/**
 * The NAMED-NUMBER-FIRST reading of a valid set: the number "within N" bounds (CLAUDE.md: the minuend for −, the
 * dividend for ÷, the sum for +, the product for ×) drawn uniformly over its band, then the item uniformly among the
 * valid items with that number. It is how the approved within-N dealers draw (generateSubPair: the minuend, then a
 * subtrahend under it). Drawing the OTHER number first (fix r1's bottom digit first, critic r2 N1) is not a reading.
 */
export function namedFirst(v, rng, want = 4000, inner = 400) {
    const named = v.op === '+' || v.op === '×' ? 'ans' : 'a';
    const [nLo, nHi] = v.span[named];
    const out = [];
    for (let t = 0; t < want * 60 && out.length < want; t++) {
        const n = nLo + Math.floor(rng() * (nHi - nLo + 1));
        for (let k = 0; k < inner; k++) {
            let x;
            if (named === 'a') {
                const [bl, bh] = v.span.b;
                const b = bl + Math.floor(rng() * (bh - bl + 1));
                x = { a: n, b, ans: OPS[v.op](n, b), op: v.op };
            } else {
                const [al, ah] = v.span.a;
                const a = al + Math.floor(rng() * (ah - al + 1));
                const b = v.op === '+' ? n - a : (a ? n / a : NaN);
                x = { a, b, ans: n, op: v.op };
            }
            if (Number.isInteger(x.b) && v.ok(x)) { out.push(x); break; }
        }
    }
    return out.length >= Math.min(want, 400) ? out : null;
}

/** The frequencies the judges compare against: per place of a / b / ans, and per value when the set is small. */
export function expectations(valid, nItems) {
    const exp = {};
    const tally = (name, f) => { const m = new Map(); for (const x of valid) { const v = f(x); m.set(v, (m.get(v) || 0) + 1); } for (const [k, c] of m) m.set(k, c / valid.length); exp[name] = m; };
    const width = (f) => Math.max(...valid.map((x) => nd(f(x))));
    for (const fld of ['a', 'b', 'ans']) {
        const w = width((x) => x[fld]);
        const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'];
        for (let k = 0; k < w; k++) tally(`${fld} ${names[k] || `10^${k}`} digit`, (x) => (nd(x[fld]) > k ? digitAt(x[fld], k) : '·'));
    }
    for (const fld of ['a', 'ans']) {
        const distinct = new Set(valid.map((x) => x[fld])).size;
        if (distinct <= nItems / 5 && distinct >= 2) tally(`${fld} value`, (x) => x[fld]);
    }
    // a place that is constant over the valid set judges nothing
    for (const k of Object.keys(exp)) if (exp[k].size < 2) delete exp[k];
    return exp;
}

/* ------------------------------------------------------------------ the three judges (pure) */
/**
 * Every place / value set of `exp` judged on `items`. The family-wise bar is calibrated, not assumed: `sims` decks of
 * the same size are drawn uniformly from the valid sample, and a set fails when its χ² tail is below the `alpha`
 * quantile of the smallest tail per simulated deck (a min-p test: it holds the false-alarm rate at `alpha` for the
 * whole skill, small expected counts and correlated places included) AND one of its cells is more than 2σ over.
 */
export function judgeUniform(items, exp, { sample, rng, sims = 2000, alpha = 0.01, bar: fixedBar = null } = {}) {
    const names = Object.keys(exp);
    const fns = names.map((name) => {
        const [fld, kind] = name.split(' ');
        const placeK = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'].indexOf(kind);
        return kind === 'value' ? (x) => x[fld] : (x) => (nd(x[fld]) > placeK ? digitAt(x[fld], placeK) : '·');
    });
    const tails = (deck) => fns.map((f, t) => {
        const obs = new Map();
        for (const x of deck) { const v = f(x); obs.set(v, (obs.get(v) || 0) + 1); }
        return judgeCells(obs, exp[names[t]], deck.length);
    });
    // the bar: the alpha quantile of min-p over simulated uniform decks (Bonferroni alpha / T without a sample)
    let bar = fixedBar != null ? fixedBar : alpha / Math.max(1, names.length);
    if (fixedBar == null && sample && sample.length && rng && names.length) {
        const mins = [];
        for (let s = 0; s < sims; s++) {
            const deck = Array.from({ length: items.length }, () => sample[Math.floor(rng() * sample.length)]);
            mins.push(Math.min(...tails(deck).map((j) => j.p)));
        }
        mins.sort((u, v) => u - v);
        bar = mins[Math.max(0, Math.floor(alpha * sims) - 1)];
    }
    return tails(items).map((j, t) => ({ name: names[t], fail: j.p < bar && j.over.length > 0, chi: j.chi, df: j.df, p: j.p, bar, over: j.over, under: j.under, outside: j.outside }));
}
export const PAGE_CAPS = { a: 2, ans: 3, item: 1 };
/**
 * The page judge. `prob(fld, v)` (optional) is the value's probability under the valid set; a value the valid set
 * itself deals more than once a page on average (a small domain: a 1-digit addend has 7 values) may print up to
 * ceil(cap × its expected count) times, never fewer than the cap.
 */
export function judgePage(items, page, { caps = PAGE_CAPS, prob = null } = {}) {
    const out = [];
    for (let p = 0; p * page < items.length; p++) {
        const pg = items.slice(p * page, (p + 1) * page);
        for (const fld of ['a', 'ans', 'item']) {
            const m = new Map();
            for (const x of pg) { if (!x) continue; const v = fld === 'item' ? `${x.a} ${x.op || '−'} ${x.b}` : x[fld]; m.set(v, (m.get(v) || 0) + 1); }
            for (const [v, c] of m) {
                const e = fld !== 'item' && prob ? page * prob(fld, v) : 0;
                const cap = e > 1 ? Math.max(caps[fld], Math.ceil(caps[fld] * e)) : caps[fld];
                if (c > cap) out.push({ page: p + 1, fld, v, c, cap, e });
            }
        }
    }
    return out;
}
/** The shape stratum of an item: the digit counts of its operands (2d − 1d and 2d − 2d are different item kinds). */
export const shapeOf = (x) => `${nd(x.a)}d ${x.op || opOf(x) || '?'} ${nd(x.b)}d`;
export const CASES = {
    zeroCase: (x) => PRED.zeroCase(x),
    ansShorter: (x) => PRED.ansShorter(x),
    'b=1': (x) => x.b === 1,
    'b=0': (x) => x.b === 0,
    'a=b': (x) => x.a === x.b,
};
export function judgePeriod(items, page, limit = 1e-3) {
    const out = [];
    for (const [name, f] of Object.entries(CASES)) {
        const at = items.map((x, i) => (x && f(x) ? i : -1)).filter((i) => i >= 0);
        if (at.length < 4 || at.length > items.length / 2) continue;
        let worst = null;
        const periods = [];
        for (let m = 2; m <= page; m++) periods.push(m);
        const tests = periods.reduce((s, m) => s + m, 0);
        for (const m of periods) {
            const res = new Map();
            for (const i of at) res.set(i % m, (res.get(i % m) || 0) + 1);
            const [r, k] = [...res.entries()].sort((x, y) => y[1] - x[1])[0];
            // items available on residue r: the run positions i with i % m === r
            const slots = items.filter((_, i) => i % m === r).length;
            const p = binomTail(k, at.length, slots / items.length) * tests;
            if (!worst || p < worst.p) worst = { m, r, k, n: at.length, p };
        }
        if (worst && worst.p < limit) out.push(Object.assign({ case: name, positions: at.slice(0, 12) }, worst));
    }
    return out;
}

/* ------------------------------------------------------------------ self-test */
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function selfTest() {
    const fails = [];
    const t = (c, m) => { if (!c) fails.push(m); };
    t(Math.abs(chiSqTail(14.07, 7) - 0.05) < 0.002, `chiSqTail(14.07, 7) = ${chiSqTail(14.07, 7)}`);
    t(Math.abs(chiSqTail(3.84, 1) - 0.05) < 0.002, 'chiSqTail(3.84, 1) ~ 0.05');
    t(Math.abs(binomTail(3, 4, 0.5) - 0.3125) < 1e-9, 'binomTail(3,4,.5)');
    const rulings = [
        { id: 'R-A', assert: 'range', of: 'a', min: 21, max: 50 },
        { id: 'R-NR', assert: 'noRegroup', op: '-' },
        { id: 'R-LEN', assert: 'digits', of: 'b', eq: 'a' },
        { id: 'R-Z', assert: 'maxShare', when: 'zeroCase', max: 0.1 },
    ];
    // the within-50 no-regroup pairs, enumerated: a 21..50, b as long as a, no column regroups, no zero case
    const truth = [];
    for (let a = 21; a <= 50; a++) for (let b = 10; b <= a; b++) { const x = { a, b, ans: a - b, op: '-' }; if (itemPasses(rulings[1], x) && !PRED.zeroCase(x)) truth.push(x); }
    const dr = mulberry(11);
    const deepS = Array.from({ length: 1440 }, (_, i) => (i % 10 === 3 ? { a: 40, b: 20, ans: 20, op: '-' } : truth[Math.floor(dr() * truth.length)]));
    const vs = validSet({ rulings, deep: deepS, rng: mulberry(7), want: 6000 });
    t(!vs.error && vs.sample.length >= 1500, `valid set drawn from the rulings and the deep sample (${vs.error || ''})`);
    t(!vs.error && vs.sample.every((x) => truth.some((y) => y.a === x.a && y.b === x.b)), 'every draw of the learned set is a valid pair');
    t(!vs.error && truth.every((y) => vs.sample.some((x) => x.a === y.a && x.b === y.b)), 'every valid pair is drawn');
    const exp = expectations(vs.sample, 120);
    const p9 = exp['a ones digit'] && exp['a ones digit'].get(9);
    t(p9 > 0.19 && p9 < 0.25, `uniform-pairs share of a ones = 9 is about 22 % (${p9})`);
    // the uniform dealer (critic r2's fix) passes; the bottom-first dealer (fix r1, critic r2 N1) fails
    const uni = (rng) => vs.sample[Math.floor(rng() * vs.sample.length)];
    const skew = (rng) => { for (;;) { const bo = 1 + Math.floor(rng() * 8); const ao = bo + 1 + Math.floor(rng() * (9 - bo)); const at = 2 + Math.floor(rng() * 3); const bt = 1 + Math.floor(rng() * (at - 1)); const a = at * 10 + ao, b = bt * 10 + bo; if (a <= 50) return { a, b, ans: a - b, op: '-' }; } };
    const deal = (f, seed, n = 120) => { const r = mulberry(seed); return Array.from({ length: n }, () => f(r)); };
    let fpu = 0;
    for (let s = 1; s <= 20; s++) { const jr = judgeUniform(deal(uni, s), exp, { sample: vs.sample, rng: mulberry(900 + s), sims: 1000 }); if (jr.some((x) => x.fail)) { fpu++; if (process.env.MQ_DEBUG) say(s, JSON.stringify(jr.filter((x) => x.fail).map((x) => [x.name, x.p, x.bar, x.over.length]))); } }
    t(fpu <= 2, `the uniform dealer fails UNIFORM on at most 2 of 20 seeds (${fpu})`);
    let tps = 0;
    for (let s = 1; s <= 20; s++) if (judgeUniform(deal(skew, s), exp, { sample: vs.sample, rng: mulberry(900 + s), sims: 1000 }).some((x) => x.fail)) tps++;
    t(tps >= 18, `the bottom-first dealer fails UNIFORM on at least 18 of 20 seeds (${tps})`);
    // PAGE: four copies of one minuend on a page of 20
    const crowd = deal(uni, 3, 20).map((x, i) => (i < 4 ? { a: 49, b: 27, ans: 22, op: '-' } : x));
    t(judgePage(crowd, 20).some((f) => f.fld === 'a' && f.v === 49 && f.c >= 4), 'PAGE names minuend 49 four times');
    t(judgePage(crowd, 20).some((f) => f.fld === 'item'), 'PAGE names a repeated item');
    t(!judgePage([{ a: 1, b: 1, ans: 0 }, { a: 2, b: 1, ans: 1 }], 20).length, 'PAGE: a clean page');
    // PERIOD: the zero item at index % 10 === 7 (fix r1) fails; zero items at seeded positions pass
    const zero = { a: 40, b: 20, ans: 20, op: '-' };
    const nz = deal((r) => { for (;;) { const x = uni(r); if (!PRED.zeroCase(x)) return x; } }, 5);
    const pinned = nz.map((x, i) => (i % 10 === 7 ? zero : x));
    t(judgePeriod(pinned, 20).some((f) => f.case === 'zeroCase'), 'PERIOD: the zero case pinned to item 7 of 10');
    let fpp = 0;
    for (let s = 1; s <= 20; s++) { const r = mulberry(100 + s); const free = nz.map((x) => (r() < 0.1 ? zero : x)); if (judgePeriod(free, 20).length) fpp++; }
    t(fpp <= 1, `PERIOD: seeded positions fail on at most 1 of 20 seeds (${fpp})`);
    // D1 (S1 critic r1): a skill that deals no numbers is N/A, never FAIL; a numeric skill that read 0 items is FAIL
    const R = (key, status, findings = []) => ({ key, status, findings });
    t(finalVerdict([R('fractions:identify', 'N/A'), R('measurement:time_hour', 'N/A')]).code === 4 && /^ws-dealer-uniform: N\/A - no operand-dealt items: fractions:identify, measurement:time_hour /.test(finalVerdict([R('fractions:identify', 'N/A'), R('measurement:time_hour', 'N/A')]).line), 'D1: only non-numeric skills -> N/A, exit 4');
    const mix = finalVerdict([R('fractions:identify', 'N/A'), R('subtraction:sub_100_regroup', 'OK')]);
    t(mix.code === 0 && /N\/A, no operand-dealt items: fractions:identify/.test(mix.line), 'D1: an N/A skill beside an OK one: OK, the N/A named');
    t(finalVerdict([R('fractions:identify', 'N/A'), R('subtraction:x', 'FAIL', ['0 of 120 items read (120 threw, 0 without operands): nothing checked'])]).code === 1, 'D1: a numeric skill whose items all threw still FAILS (A1)');
    t(finalVerdict([]).code === 0 ? false : true, 'D1: an empty scope is never OK');
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 19 cases)`);
    process.exit(fails.length ? 1 : 0);
}

/* ------------------------------------------------------------------ main */
let BASE = {}, BASE_FILE = null;
/** A finding's pin key: its text up to the first " (" (the counts and expectations after it may move). */
export const findingKey = (f) => String(f).split(' (')[0].trim();
async function main() {
    if (has('--self-test')) return selfTest();
    const known = new Set(['--skill', '--root', '--n', '--page', '--opts', '--rulings', '--json', '--report-only', '--self-test', '--baseline', '--no-baseline']);
    const usage = (m) => { say(`${TOOL}: ${m}`); say(`${TOOL}: FAIL - usage`); process.exit(2); };
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('--')) usage(`unexpected argument ${argv[i]}`);
        if (!known.has(argv[i])) usage(`unknown flag ${argv[i]}`);
        if (!['--report-only', '--self-test', '--no-baseline'].includes(argv[i])) i++;
    }
    const keys = argAll('--skill');
    if (!keys.length) usage('give --skill cat:skill[,cat:skill]');
    const N = +arg('--n', '120'), PAGE = +arg('--page', '20');
    if (!(N >= 20) || !(PAGE >= 2)) usage('--n must be >= 20 and --page >= 2');
    let opts;
    try { opts = arg('--opts', null) ? JSON.parse(arg('--opts')) : undefined; } catch (e) { usage(`--opts is not JSON: ${e.message}`); }
    const ROOT = resolve(arg('--root', process.env.MQ_ROOT || HERE));
    const T0 = Date.now();
    let blocks = [];
    for (const f of argAll('--rulings')) {
        const p = resolve(HERE, f);
        if (!existsSync(p)) usage(`${f}: no such file`);
        const b = parseRulings(readFileSync(p, 'utf8'), f);
        if (!b) usage(`${f}: no rulings block`);
        blocks.push(b);
    }
    if (!blocks.length) blocks = cardBlocks(ROOT);
    BASE_FILE = has('--no-baseline') ? null : resolve(HERE, arg('--baseline', 'tests/fixtures/precritic/dealer-uniform.baseline.json'));
    if (BASE_FILE && existsSync(BASE_FILE)) BASE = JSON.parse(readFileSync(BASE_FILE, 'utf8'));
    else if (BASE_FILE && argv.includes('--baseline')) usage(`--baseline ${arg('--baseline')}: no such file`);
    const app = await loadApp(ROOT);
    const live = new Set();
    for (const [cat, list] of Object.entries(app.data.SKILLS)) for (const s of list || []) if (s && s.v && !s.retired) live.add(`${cat}:${s.v}`);
    const unknown = keys.filter((k) => !live.has(k));
    if (unknown.length) { say(`${TOOL}: not a live skill in ${ROOT}: ${unknown.join(', ')}`); say(`${TOOL}: FAIL - unknown skill(s) ${unknown.join(', ')}`); process.exit(2); }

    const quiet = () => { const s = {}; for (const k of ['log', 'warn', 'error', 'info', 'debug']) { s[k] = console[k]; console[k] = () => {}; } return () => Object.assign(console, s); };
    const sig = (q) => `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans}|${q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : ''}`;
    /** One run of n items, the print-sheet way. */
    const run = (key, n, base) => {
        const [category, skill] = key.split(':');
        const seen = new Set(), out = [];
        let errors = 0;
        const un = quiet();
        try {
            for (let i = 0; i < n; i++) {
                let got = null;
                for (let k = 0; k <= RETRIES; k++) {
                    let q = null;
                    try { q = app.gq.generateQuestionFor({ category, skill, opts, seed: (base + i + 7919 * k) >>> 0, itemIndex: i, itemCount: n }); } catch (e) { q = null; }
                    if (!q) continue;
                    got = q;
                    if (!seen.has(sig(q))) break;
                }
                if (!got) { errors++; out.push(null); continue; }
                seen.add(sig(got));
                out.push(readItem(got));
            }
        } finally { un(); }
        return { items: out, errors };
    };

    const results = [];
    for (const key of keys) {
        const base = fnv(key);
        const { items, errors } = run(key, N, base);
        const read = items.filter(Boolean);
        const r = { key, n: N, read: read.length, errors, unread: items.length - read.length - errors, findings: [], notes: [], status: 'OK' };
        results.push(r);
        if (!read.length && !errors && r.unread === N) { r.status = 'N/A'; r.notes.push(`all ${N} items generated, none deals operands (no "a op b" to read): nothing to deal evenly`); continue; }
        if (!read.length) { r.status = 'FAIL'; r.findings.push(`0 of ${N} items read (${errors} threw, ${r.unread} without operands): nothing checked`); continue; }
        if (read.length < N) { r.status = 'INCOMPLETE'; r.notes.push(`${N - read.length} of ${N} item(s) not read (${errors} threw)`); }
        // ---- the valid set
        const rul = blocks.flatMap((b) => (b.skills.includes(key) ? (b.rulings || []).filter((x) => (!x.skills || x.skills.includes(key)) && JSON.stringify(x.opts || {}) === JSON.stringify(opts || {})) : []));
        // the deep sample: DEEP pages of the same deal from another base, so the support the valid set learns is not the
        // judged run's own
        const deep = [];
        for (let p = 0; p < DEEP; p++) deep.push(...run(key, PAGE, (base ^ (0x5bd1e995 + 104729 * p)) >>> 0).items);
        // STRATA: the item kinds by operand length (a dealer mixes 2d − 1d and 2d − 2d by design; uniformity is judged
        // inside each kind, the mix is the dealer's choice). A kind with fewer than MIN_STRATUM judged items is noted.
        const deepBy = new Map();
        for (const x of deep.filter(Boolean)) { const s = shapeOf(x); if (!deepBy.has(s)) deepBy.set(s, []); deepBy.get(s).push(x); }
        const nDeep = deep.filter(Boolean).length;
        const strata = [];
        for (const [s, dx] of deepBy) {
            const v = validSet({ rulings: rul, deep: dx, rng: mulberry((base + fnv(s)) >>> 0) });
            strata.push({ s, share: dx.length / nDeep, valid: v, judged: read.filter((x) => shapeOf(x) === s && !(v.excluded || []).some((e) => e.p(x))) });
        }
        const judgeable = strata.filter((st) => !st.valid.error && st.judged.length >= MIN_STRATUM);
        r.valid = strata.map((st) => `[${st.s}, ${(st.share * 100).toFixed(0)} % of the deal, ${st.judged.length} judged] ${st.valid.error ? `not judged: ${st.valid.error}` : st.valid.how}`).join(' ');
        for (const st of strata.filter((x) => !judgeable.includes(x) && x.share >= 0.1)) r.notes.push(`kind ${st.s} (${(st.share * 100).toFixed(0)} % of the deal) not judged for UNIFORM: ${st.valid.error || `${st.judged.length} item(s) of it in the run (fewer than ${MIN_STRATUM})`}`);
        // THE THREE READINGS of "uniform over the valid set" (a dealer is fair under any one of them, per place):
        //   pairs      every valid pair equally likely (critic r2 N1's reference: "a uniform draw over the valid pairs");
        //   kinds      the same, inside each item kind (2d − 1d, 2d − 2d), the mix of kinds being the dealer's choice;
        //   digits     every digit a place uses equally likely (the approved add / sub _100_regroup dealers draw the ones
        //              digit flat: "flat over the minuend's ones digit"), the share of shorter numbers as under pairs.
        // A place (or value set) FAILS only when it is over-dealt under all three; the finding quotes the pairs reading.
        r.uniform = [];
        const vAll = validSet({ rulings: rul, deep, rng: mulberry((base + 17) >>> 0) });
        const allJudged = vAll.error ? [] : read.filter((x) => !(vAll.excluded || []).some((e) => e.p(x)));
        const verdicts = new Map(); // name -> {pairs, kinds, digits, row}
        const mark = (name, reading, fail, row) => { if (!verdicts.has(name)) verdicts.set(name, {}); const v = verdicts.get(name); v[reading] = (v[reading] || false) || fail; if (row && (reading === 'pairs' || !v.row)) v.row = row; };
        if (!vAll.error && allJudged.length >= MIN_STRATUM) {
            const exp = expectations(vAll.sample, allJudged.length);
            const rows = judgeUniform(allJudged, exp, { sample: vAll.sample, rng: mulberry((base ^ 0x2545f491) >>> 0) });
            for (const x of rows) mark(x.name, 'pairs', x.fail, Object.assign({ n: allJudged.length, kind: 'all' }, x));
            // digits: flat over the digits a place uses (the place's share of shorter numbers kept); value sets have no digit reading
            const flat = {};
            for (const [name, m] of Object.entries(exp)) {
                if (/ value$/.test(name)) continue;
                const dot = m.get('·') || 0, ds = [...m.keys()].filter((k) => k !== '·');
                flat[name] = new Map(ds.map((d) => [d, (1 - dot) / ds.length]));
                if (dot) flat[name].set('·', dot);
            }
            const bar = rows.length ? rows[0].bar : 0.01;
            for (const x of judgeUniform(allJudged, flat, { bar })) mark(x.name, 'digits', x.fail, null);
            // named first: the bounded number uniform over its band, then the item uniform given it
            const nf = namedFirst(vAll, mulberry((base ^ 0x9e3779b9) >>> 0));
            if (nf) for (const x of judgeUniform(allJudged, expectations(nf, allJudged.length), { sample: nf, rng: mulberry((base ^ 0x85ebca6b) >>> 0) })) mark(x.name, 'named', x.fail, null);
            r.uniform.push(...rows.map((x) => ({ reading: 'pairs', name: x.name, chi: +x.chi.toFixed(1), df: x.df, p: +x.p.toPrecision(2), bar: +x.bar.toPrecision(2), fail: x.fail, over: x.over.map((c) => `${c.v}: ${c.o} (exp ${c.e.toFixed(1)})`) })));
        }
        for (const st of judgeable) {
            const exp = expectations(st.valid.sample, st.judged.length);
            const rows = judgeUniform(st.judged, exp, { sample: st.valid.sample, rng: mulberry((base ^ 0x2545f491 ^ fnv(st.s)) >>> 0), alpha: 0.01 / judgeable.length });
            for (const x of rows) mark(x.name, 'kinds', x.fail, Object.assign({ n: st.judged.length, kind: st.s }, x));
            r.uniform.push(...rows.map((x) => ({ reading: `kind ${st.s}`, name: x.name, chi: +x.chi.toFixed(1), df: x.df, p: +x.p.toPrecision(2), bar: +x.bar.toPrecision(2), fail: x.fail, over: x.over.map((c) => `${c.v}: ${c.o} (exp ${c.e.toFixed(1)})`) })));
        }
        // A dealer follows ONE reading on every place: the skill passes when some reading judged it and found no place
        // over-dealt; it fails when every reading that judged it found one (the finding quotes the pairs reading's places).
        const READINGS = ['pairs', 'kinds', 'digits', 'named'];
        const per = Object.fromEntries(READINGS.map((k) => [k, { judged: false, fails: [] }]));
        for (const [name, v] of verdicts) for (const k of READINGS) if (v[k] !== undefined) { per[k].judged = true; if (v[k]) per[k].fails.push(name); }
        const judgedR = READINGS.filter((k) => per[k].judged);
        r.readings = Object.fromEntries(judgedR.map((k) => [k, per[k].fails]));
        if (judgedR.length && judgedR.every((k) => per[k].fails.length)) {
            const names = per.pairs.fails.length ? per.pairs.fails : per[judgedR[0]].fails;
            const others = judgedR.filter((k) => k !== 'pairs').map((k) => `${k}: ${per[k].fails.join(', ')}`).join('; ');
            for (const name of names) {
                const x = verdicts.get(name).row;
                r.findings.push(`UNIFORM ${name}${x && x.kind !== 'all' ? ` (kind ${x.kind})` : ''}: over-dealt under every reading of uniform (${others ? `also ${others}` : 'pairs'})${x ? `; pairs: χ² ${x.chi.toFixed(1)} on ${x.df} df (tail ${x.p.toPrecision(2)}, below the 1 % family-wise bar ${x.bar.toPrecision(2)}) over ${x.n} items; above 2σ: ${x.over.map((c) => `${c.v} ${c.o}× (uniform ${c.e.toFixed(1)})`).join(', ')}` : ''}`);
            }
        } else if (judgedR.length) r.notes.push(`UNIFORM: fair under the ${judgedR.filter((k) => !per[k].fails.length).join(' / ')} reading`);
        if (!verdicts.size && r.status === 'OK') { r.status = 'INCOMPLETE'; r.notes.push('no place could be judged for UNIFORM'); }
        // a value's probability under the valid set: the kinds mixed as the dealer mixes them, uniform inside each
        const probOf = new Map();
        for (const st of strata.filter((x) => !x.valid.error)) for (const fld of ['a', 'ans']) {
            const n = st.valid.sample.length;
            for (const x of st.valid.sample) { const k = `${fld}|${x[fld]}`; probOf.set(k, (probOf.get(k) || 0) + st.share / n); }
        }
        for (const f of judgePage(items, PAGE, { prob: (fld, v) => probOf.get(`${fld}|${v}`) || 0 })) {
            r.findings.push(`PAGE ${f.page}: ${f.fld === 'item' ? `item ${f.v}` : `${f.fld} = ${f.v}`} ${f.c} times (at most ${f.cap}${f.e > 1 ? `: the valid set deals it ${f.e.toFixed(1)} times a page` : ''})`);
        }
        for (const f of judgePeriod(items, PAGE)) r.findings.push(`PERIOD ${f.case}: ${f.k} of its ${f.n} items at position ${f.r} mod ${f.m} (p ${f.p.toExponential(1)}; positions ${f.positions.join(', ')}…)`);
        // the pin: a finding whose key (its text up to the first " (") is pinned for the skill is reported, not failed
        const pinned = new Set(((BASE.skills || {})[key] || []).map(String));
        r.pinned = r.findings.filter((f) => pinned.has(findingKey(f)));
        r.findings = r.findings.filter((f) => !pinned.has(findingKey(f)));
        r.stale = [...pinned].filter((k) => !r.pinned.some((f) => findingKey(f) === k));
        if (r.findings.length) r.status = 'FAIL';
    }
    // ---- report
    say(`${TOOL}: ${keys.length} skill(s) on ${ROOT === HERE ? 'this tree' : ROOT}; ${N} items a skill, pages of ${PAGE}${opts ? `, opts ${JSON.stringify(opts)}` : ''}`);
    for (const r of results) {
        say(`  ${r.status.padEnd(10)} ${r.key}  (${r.read}/${r.n} read${r.valid ? `; valid set: ${r.valid}` : ''})`);
        for (const f of r.findings) say(`      FAIL ${f}`);
        for (const f of r.pinned || []) say(`      pinned ${f}`);
        for (const k of r.stale || []) say(`      fixed? pinned "${k}" no longer found (re-pin ${BASE_FILE ? relative(HERE, BASE_FILE) : 'the baseline'})`);
        for (const n of r.notes) say(`      note ${n}`);
    }
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('--json')) writeFileSync(resolve(arg('--json')), JSON.stringify({ tool: TOOL, root: ROOT, n: N, page: PAGE, opts: opts || null, results }, null, 1) + '\n');
    const v = finalVerdict(results, secs);
    say(v.line);
    process.exit(has('--report-only') ? 0 : v.code);
}

/**
 * The last line and exit code (pure; self-tested). FAIL (1) beats INCOMPLETE (3) beats OK (0). A skill whose items
 * carry no dealable numbers (every item generated, none with operands: fractions, clocks, shapes) is N/A: nothing to
 * deal evenly. A scope of N/A skills only prints `N/A - no operand-dealt items: <skills>` and exits 4 (ws-precritic:
 * N/A); N/A skills beside judged ones are named in the tail. A skill with 0 items read because items THREW is FAIL.
 */
export function finalVerdict(results, secs = '0.0') {
    const bad = results.filter((r) => r.status === 'FAIL'), inc = results.filter((r) => r.status === 'INCOMPLETE'), na = results.filter((r) => r.status === 'N/A');
    const ok = results.length - bad.length - inc.length - na.length;
    const tail = `${ok} OK, ${bad.length} FAIL, ${inc.length} INCOMPLETE, ${na.length} N/A of ${results.length} skill(s)${na.length && na.length < results.length ? ` (N/A, no operand-dealt items: ${na.map((r) => r.key).join(', ')})` : ''}; ${secs} s`;
    if (!results.length) return { code: 1, line: `${TOOL}: FAIL - 0 skills checked` };
    if (bad.length) return { code: 1, line: `${TOOL}: FAIL - ${bad.map((r) => `${r.key.split(':')[1]} (${r.findings.length})`).join(', ')} (${tail})` };
    if (inc.length) return { code: 3, line: `${TOOL}: INCOMPLETE - not fully checked: ${inc.map((r) => r.key).join(', ')} (${tail})` };
    if (results.length && na.length === results.length) return { code: 4, line: `${TOOL}: N/A - no operand-dealt items: ${na.map((r) => r.key).join(', ')} (${tail})` };
    return { code: 0, line: `${TOOL}: OK (${tail})` };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); });
