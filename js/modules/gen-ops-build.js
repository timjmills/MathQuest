// gen-ops-build.js — the generators for the operations lane's NEW skills (design/BUILD_LIST.md,
// lane `operations`, in build order). gen-operations.js dispatches the ids in OPS_BUILD_SKILLS here
// from generateOperationsQuestion / generateIntegersQuestion, so the 7,000-line operations file is
// not grown further and every option a new skill declares (skill-options.js, block "OPERATIONS
// BUILD LANE") is read in one place.
//
// Each item is drawn by a sheet-kit template (q.cell); q.visual is the same drawing for the screen
// hosts (k2Twin), whose boxes the host turns into inputs. Randomness is Math.random, which
// generateQuestionFor() seeds, and every choice that goes down a page (the kind, the direction,
// the step, which relation) is dealt by page-deal.js, one key per independent attribute (L10).

import { state } from './state.js';
import { dealIndex, dealPick } from './page-deal.js';
import { optionsFor } from './skill-options.js';
import { k2Twin } from './sheet/index.js';

/* ------------------------------------------------------------------------------ options */

function _def(id) {
    try { return optionsFor(state.category, state.skill).find((o) => o.id === id) || null; } catch (e) { return null; }
}
/** The value of option `id`: the set's / caller's choice, else the default. */
function opt(id) {
    const def = _def(id);
    if (!def) return undefined;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined;
    return v === undefined ? def.default : v;
}
/** A ticked set, in the definition's order; every legal value when none is ticked. */
function ticked(id, fallback) {
    const def = _def(id);
    const legal = def && def.values ? def.values.map((x) => x.v) : fallback;
    let v = opt(id);
    if (!Array.isArray(v)) v = v === undefined || v === null ? [] : [v];
    const out = legal.filter((x) => v.includes(x));
    return out.length ? out : legal.slice();
}

/** A number as printed: the true minus. */
const neg = (v) => (Number(v) < 0 ? `−${Math.abs(Number(v))}` : String(v));
/** The ways a pupil may type an integer list: the true minus or a hyphen, with or without spaces. */
const accepts = (parts) => {
    const hy = parts.map((s) => String(s).replace(/−/g, '-'));
    return [...new Set([parts.join(', '), parts.join(','), hy.join(', '), hy.join(','), hy.join(' ')])];
};

/* =========================================================== integers:count_through_zero */

/** The kinds of item, in the order of the "What the pupil does" option (forms 0-4). */
export const CTZ_KINDS = Object.freeze(['fill', 'temp', 'diff', 'write', 'compare']);

/**
 * Contexts for "above and below zero" (6.NS.C.5): what 0 means, and the two directions. Every
 * sentence is ours and at most 12 words. `max` caps the size a context reads sensibly at.
 */
const CTZ_CONTEXTS = Object.freeze([
    { zero: '0 m is sea level.', up: (n) => `A bird flies ${n} m above sea level.`, down: (n) => `A diver swims ${n} m below sea level.`, unit: 'm', max: 60 },
    { zero: '0 °C is where water freezes.', up: (n) => `It is ${degrees(n)} above zero.`, down: (n) => `It is ${degrees(n)} below zero.`, unit: '°C', max: 40 },
    { zero: '0 is the ground floor.', up: (n) => `The lift goes ${n} floor${n === 1 ? '' : 's'} up.`, down: (n) => `The lift goes ${n} floor${n === 1 ? '' : 's'} down.`, unit: '', max: 8 },
    { zero: '0 is no money.', up: (n) => `The shop makes $${n}.`, down: (n) => `The shop loses $${n}.`, unit: '', max: 60 },
]);

/** "1 degree", "5 degrees". */
const degrees = (n) => `${n} degree${n === 1 ? '' : 's'}`;
/** Temperature changes in steps: [start's distance from 0, end's distance past 0]. */
const TEMP_PAIRS = Object.freeze([1, 2, 3].flatMap((a) => [0, 1, 2, 3].map((b) => [a, b])));
/** How far apart: [the negative's size, the positive's size], in steps. */
const DIFF_PAIRS = Object.freeze([1, 2, 3, 4].flatMap((a) => [1, 2, 3, 4].map((b) => [a, b])));
/** Two temperatures to compare, in steps: both below zero, or one below and one at or above. */
const CMP_NEG = Object.freeze([1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].filter((b) => b > a).map((b) => [-a, -b])));
const CMP_MIXED = Object.freeze([1, 2, 3, 4, 5, 6].flatMap((a) => [0, 1, 2, 3, 4, 5].map((b) => [-a, b])));

const _writeCache = new Map();
/** Every [context index, below zero?, size in steps] the write kind allows at step `s`. */
function writeConfigs(s) {
    if (_writeCache.has(s)) return _writeCache.get(s);
    const out = [];
    CTZ_CONTEXTS.forEach((c, ci) => {
        if (c.max < s * 2) return;
        const kMax = Math.max(1, Math.min(6, Math.floor(c.max / s)));
        for (let k = 1; k <= kMax; k++) for (const down of [true, false]) out.push([ci, down, k]);
    });
    _writeCache.set(s, out);
    return out;
}

/** The ticks of a line through zero: `n` ticks `step` apart, zero at index `o`. */
const ticksFrom = (lo, hi, step) => {
    const out = [];
    for (let v = lo; v <= hi; v += step) out.push(v);
    return out;
};

/**
 * A window lo..hi (multiples of `step`) round the values `need`, one step past each end, widened
 * evenly to at least `minN` ticks.
 */
function windowRound(need, step, minN) {
    let lo = Math.min(...need, 0) - step, hi = Math.max(...need, 0) + step;
    let n = Math.round((hi - lo) / step) + 1;
    let k = 0;
    while (n < minN) { if (k++ % 2) lo -= step; else hi += step; n++; }
    return ticksFrom(lo, hi, step);
}

const _fillCache = new Map();
/** Every [zero index, blank indices] of a line of n ticks that the fill kind allows. */
function fillConfigs(n) {
    if (_fillCache.has(n)) return _fillCache.get(n);
    const out = [];
    const seen = new Set();
    for (let o = 2; o <= n - 3; o++) {
        for (let a = 1; a <= n - 2; a++) for (let b = a + 1; b <= n - 2; b++) for (let c = b + 1; c <= n - 2; c++) {
            if (c - a === 2) continue;                           // three in a row
            const pick = [a, b, c];
            if (!pick.some((i) => i < o) || !pick.some((i) => i >= o)) continue;   // one below 0, one at or above
            // one line per set of missing numbers: the same three answers on a shifted window
            // read as a repeat to the pupil
            const sig = pick.map((i) => i - o).join(',');
            if (seen.has(sig)) continue;
            seen.add(sig);
            out.push([o, pick]);
        }
    }
    _fillCache.set(n, out);
    return out;
}

export function genCountThroughZero(q) {
    const orient = opt('orientation') === 'vertical' ? 'v' : 'h';
    const kinds = ticked('forms', [0, 1, 2, 3, 4]).map((i) => CTZ_KINDS[i]).filter(Boolean);
    const kind = kinds.length > 1 ? kinds[dealIndex('ctz:kind', kinds.length)] : kinds[0] || 'fill';
    const steps = ticked('step', [1, 2, 5, 10]);
    const s = steps.length > 1 ? steps[dealIndex('ctz:step', steps.length)] : steps[0] || 1;
    const ticks = ['some', 'ends'].includes(opt('ticks')) ? opt('ticks') : 'one';
    // Seven ticks (a phone's card holds seven 44 px boxes across; up and down, two lines stand in
    // one page height at L); the other kinds widen to their numbers.
    const minN = 7;
    let payload, text, printText, ans, hint;
    const stepWord = s === 1 ? '1s' : `${s}s`;

    if (kind === 'fill') {
        // Count through zero: n ticks, zero inside with at least two ticks each side, three of
        // the inner ticks to write - at least one below zero and one at or above it, never three
        // in a row (a printed number between them to count from), never an end (always printed).
        // Every such line (where 0 sits, which three are blank) is one entry of a list the page
        // dealer runs through, a block holding each once, so a page never prints a line twice.
        const n = minN;
        const [o, pick] = dealPick(`ctz:fill:${n}`, fillConfigs(n));
        const values = Array.from({ length: n }, (_, i) => (i - o) * s);
        const blanks = pick.map((i) => values[i]);
        payload = { kind, orient, values, ticks, blanks };
        const parts = (orient === 'v' ? blanks.slice().reverse() : blanks).map(neg);
        ans = parts.join(', ');
        q.keyParts = parts;
        q.acceptedAnswers = accepts(parts);
        text = `Count in ${stepWord} through zero. Fill in the missing numbers.`;
        printText = 'Write the missing numbers on the line.';
        hint = `Each mark is ${s} more than the one ${orient === 'v' ? 'below' : 'before'} it. Below 0 the numbers have a minus sign.`;
        q.ctz = { kind, step: s, values, blanks, orient };
    } else if (kind === 'temp') {
        // A temperature that rises or falls THROUGH zero (or lands on it): start and change are
        // multiples of the step. Rise or fall is its own deal.
        // (how far the start is from zero, how far past zero it ends) is one of twelve pairs the
        // page dealer runs through, so a page never repeats a change
        const fall = dealIndex('ctz:temp-dir', 2) === 0;
        const [ka, kb] = dealPick(`ctz:temp:${fall}`, TEMP_PAIRS);
        const a = ka * s, b = kb * s;
        const start = fall ? a : -a;
        const end = fall ? -b : b;
        const change = end - start;
        const values = windowRound([start, end], s, 7);
        const lines = [`It is ${neg(start)} °C.`, `It gets ${degrees(Math.abs(change))} ${fall ? 'colder' : 'warmer'}.`];
        payload = { kind, orient, values, ticks, start, change, unit: '°C', lines, ans: end };
        ans = neg(end);
        q.acceptedAnswers = accepts([ans]);
        text = lines.join(' ');
        printText = 'Read the sentence. Write the temperature now.';
        hint = `Start at ${neg(start)}. Count ${Math.abs(change)} ${fall ? 'down' : 'up'}, one step at a time.`;
        q.ctz = { kind, step: s, start, change, end };
    } else if (kind === 'diff') {
        // From a negative to a positive: the pupil counts the steps between (the answer is the
        // sum of the two sizes, never their difference).
        const [ka, kb] = dealPick('ctz:diff', DIFF_PAIRS);
        const a = -ka * s, b = kb * s;
        const values = windowRound([a, b], s, minN);
        payload = { kind, orient, values, ticks, marks: [a, b], a, b, ans: b - a };
        ans = String(b - a);
        q.acceptedAnswers = [ans];
        text = `How far is it from ${neg(a)} to ${neg(b)}?`;
        printText = 'Use the line. Write how far apart the numbers are.';
        hint = `Count from ${neg(a)} up to 0, then from 0 up to ${neg(b)}. Add the two.`;
        q.ctz = { kind, step: s, a, b };
    } else if (kind === 'write') {
        // Above and below zero in a context, with what 0 means; the sign is dealt on its own.
        // (context, above or below, size) is one entry of the step's list, which the page dealer
        // runs through: a page never repeats a sentence, and both signs and every context appear
        const [ci, down, k] = dealPick(`ctz:write:${s}`, writeConfigs(s));
        const ctx = CTZ_CONTEXTS[ci];
        const m = k * s;
        const v = down ? -m : m;
        const lines = [ctx.zero, down ? ctx.down(m) : ctx.up(m)];
        const values = windowRound([v, -v], s, minN);
        payload = { kind, orient, values, ticks, unit: ctx.unit, lines, ans: v };
        ans = neg(v);
        q.acceptedAnswers = accepts([ans]);
        text = lines.join(' ');
        printText = 'Read the sentence. Write the number with its sign.';
        hint = down ? `Below zero is a negative number: write the minus sign.` : 'Above zero is a positive number.';
        q.ctz = { kind, step: s, value: v, down, unit: ctx.unit };
    } else {
        // compare: "−3 °C is warmer than −7 °C." -> −3 °C [>] −7 °C (6.NS.C.7b). The relation
        // (warmer / colder) is dealt, so the sign varies; at least one of the two is below zero,
        // and half the pairs are both below zero (where bigger digits mean colder).
        const warmer = dealIndex('ctz:rel', 2) === 0;
        const bothNeg = dealIndex('ctz:pair', 2) === 0;
        const [kx, ky] = dealPick(bothNeg ? 'ctz:pairs-neg' : 'ctz:pairs-mixed', bothNeg ? CMP_NEG : CMP_MIXED);
        const x = kx * s, y = ky * s;
        const hiV = Math.max(x, y), loV = Math.min(x, y);
        // the sentence names the warmer one first for "warmer", the colder one first for "colder",
        // so the frame reads a > b or a < b as the sentence says
        const [a, b] = warmer ? [hiV, loV] : [loV, hiV];
        const values = windowRound([x, y], s, minN);
        const lines = [`${neg(a)} °C is ${warmer ? 'warmer' : 'colder'} than ${neg(b)} °C.`];
        payload = { kind, orient, values, ticks, marks: [x, y], a, b, unit: '°C', lines, ans: warmer ? '>' : '<' };
        ans = warmer ? '>' : '<';
        q.acceptedAnswers = [ans];
        text = lines[0];
        printText = 'Read the sentence. Write < or > in the circle.';
        hint = 'On the line, the warmer temperature is further up (or to the right).';
        q.ctz = { kind, step: s, a, b, warmer };
    }

    q.text = text;
    q.printText = printText;
    q.ans = ans;
    q.answerType = 'text';
    q.selfAnswering = true;
    q.options = [];
    q.hint = hint;
    q.skillLabel = 'Count Through Zero';
    q.cell = { template: 'int-line', v: 1, payload };
    q.visual = k2Twin('int-line', payload);
    q.printFormat = 'int-line';
    return q;
}

/* ------------------------------------------------------------------------------ dispatch */

/** Every skill id this module generates, by its id within its category. */
export const OPS_BUILD_SKILLS = Object.freeze({
    count_through_zero: genCountThroughZero,
});

/** Generate `q` for a build-lane skill; false when the id is not one of them. */
export function generateOpsBuild(q, skillId) {
    const fn = OPS_BUILD_SKILLS[skillId];
    if (!fn) return false;
    fn(q);
    return true;
}
