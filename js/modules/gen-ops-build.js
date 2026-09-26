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
import { k2Twin, fadeRung, renderCell } from './sheet/index.js';

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

/* ================================================== division:share_and_group_early */

/** The kinds of item, in the order of the "What the pupil does" option (forms 0-3). */
export const SHARE_KINDS = Object.freeze(['share', 'group', 'fair', 'left']);
/** The smallest amount a band deals, so each band's page really uses its numbers. */
const SHARE_LO = { 10: 2, 20: 8, 30: 14 };

const _shareCache = new Map();
/**
 * Every item a kind allows at a band, as plain data the page dealer runs through (a block holds
 * each once, so a page never repeats an item):
 *   share  [n, k]  k plates (2-5), n a multiple of k, at most 10 on a plate
 *   group  [n, k]  groups of k (2-5), 2 to 6 groups
 *   left   [n, k]  k plates (2-3; 2-5 past 10), n not a multiple of k, at least 1 on a plate
 *   fair   [counts] 2 or 3 plates, all equal (fair) or one plate 1 or 2 away (not fair), tagged
 */
function shareConfigs(kind, band) {
    const key = `${kind}:${band}`;
    if (_shareCache.has(key)) return _shareCache.get(key);
    const lo = SHARE_LO[band] || 2;
    const out = [];
    if (kind === 'share' || kind === 'group' || kind === 'left') {
        // plates: 2 to 4 friends (5 at 30); groups of 2 to 5
        const ks = kind === 'group' ? [2, 3, 4, 5] : kind === 'left' && band <= 10 ? [2, 3] : band >= 30 ? [2, 3, 4, 5] : [2, 3, 4];
        for (let n = lo; n <= band; n++) for (const k of ks) {
            if (kind === 'share' && n % k === 0 && n / k >= 1 && n / k <= 10) out.push([n, k]);
            if (kind === 'group' && n % k === 0 && n / k >= 2 && n / k <= 6) out.push([n, k]);
            if (kind === 'left' && n % k !== 0 && Math.floor(n / k) >= 1 && Math.floor(n / k) <= 10) out.push([n, k]);
        }
    } else {
        for (const k of [2, 3]) for (let m = 1; m <= 10; m++) {
            if (k * m > band || k * m < Math.min(lo, 4)) continue;
            out.push({ fair: true, shown: Array(k).fill(m) });
            for (const dlt of [1, 2]) {
                if (m + dlt > 10 || k * m + dlt > band) continue;
                // the odd plate out is the last, the first or the middle one
                const shown = Array(k).fill(m);
                shown[(m + dlt) % k] = m + dlt;
                out.push({ fair: false, shown });
            }
        }
    }
    _shareCache.set(key, out);
    return out;
}

export function genShareGroupEarly(q) {
    const kinds = ticked('forms', [0, 1, 2, 3]).map((i) => SHARE_KINDS[i]).filter(Boolean);
    const kind = kinds.length > 1 ? kinds[dealIndex('sge:kind', kinds.length)] : kinds[0] || 'share';
    const band = [10, 20, 30].includes(Number(opt('band'))) ? Number(opt('band')) : 10;
    const look = opt('groupLook') === 'rings' ? 'rings' : 'plates';
    // the support level: several ticked FADE down the page, most support first (sheet fadeRung)
    const levels = ticked('level', [2, 1]).slice().sort((a, b) => b - a);
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : 0;
    const hint = levels[fadeRung(at, levels.length, state.itemCount, Number.isFinite(state.itemIndex))] >= 2;
    const where = look === 'rings' ? 'into' : 'between';
    const things = (k) => (look === 'rings' ? `${k} rings` : `${k} plates`);
    let payload, text, printText, ans, hintText;

    if (kind === 'fair') {
        // fair or not is its own deal, so a page shows both; the plates within each list
        const fair = dealIndex('sge:fair', 2) === 0;
        const pool = shareConfigs('fair', band).filter((c) => c.fair === fair);
        const c = pool.length ? dealPick(`sge:fair:${fair}:${band}`, pool) : shareConfigs('fair', band)[0];
        const k = c.shown.length, n = c.shown.reduce((a, b) => a + b, 0);
        ans = c.fair ? 'Fair' : 'Not fair';
        payload = { kind, n, k, look, shown: c.shown.slice(), ans };
        text = `Are the counters shared fairly? Check Fair or Not fair.`;
        printText = 'Is it fair? Check one box.';
        hintText = 'Count each plate. Fair means every plate has the same.';
        q.printAnswer = ans;
        q.acceptedAnswers = [ans, ans.toLowerCase()];
        q.share = { kind, k, shown: c.shown.slice(), fair: c.fair };
    } else {
        const list = shareConfigs(kind, band);
        const [n, k] = dealPick(`sge:${kind}:${band}`, list);
        payload = { kind, n, k, look, hint, ans: 0 };
        if (kind === 'share') {
            ans = String(n / k);
            text = `Share ${n} counters ${where} ${things(k)}. How many ${look === 'rings' ? 'in' : 'on'} each?`;
            printText = look === 'rings' ? 'Draw the same number in each ring. Write how many.'
                : 'Draw the same number on each plate. Write how many.';
            hintText = `Give one to each ${look === 'rings' ? 'ring' : 'plate'}, then one more to each, until none are left.`;
            q.acceptedAnswers = [ans];
        } else if (kind === 'group') {
            ans = String(n / k);
            text = `Make groups of ${k} from ${n} counters. How many groups?`;
            printText = `Circle groups of ${k}. Write how many groups.`;
            hintText = `Circle ${k} counters. Then circle ${k} more. Count the circles.`;
            q.acceptedAnswers = [ans];
        } else {
            const each = Math.floor(n / k), left = n % k;
            ans = `${each}, ${left}`;
            q.keyParts = [String(each), String(left)];
            q.acceptedAnswers = [`${each}, ${left}`, `${each},${left}`, `${each} ${left}`];
            text = `Share ${n} counters ${where} ${things(k)}. How many ${look === 'rings' ? 'in' : 'on'} each, and how many left over?`;
            printText = look === 'rings' ? 'Draw the same number in each ring. Fill in the boxes.'
                : 'Draw the same number on each plate. Fill in the boxes.';
            hintText = `Give one to each ${look === 'rings' ? 'ring' : 'plate'} until there are not enough to go round. Those are left over.`;
        }
        payload.ans = kind === 'left' ? [Math.floor(n / k), n % k] : n / k;
        q.share = { kind, n, k, look, hint };
    }

    q.a = payload.n; q.b = payload.k;
    q.text = text;
    q.printText = printText;
    q.ans = ans;
    q.answerType = kind === 'share' || kind === 'group' ? 'number' : 'text';
    if (q.answerType === 'number') q.ans = Number(ans);
    q.selfAnswering = true;
    q.options = [];
    q.hint = hintText;
    q.skillLabel = 'Share and Make Groups';
    q.cell = { template: 'share-plates', v: 1, payload };
    q.visual = k2Twin('share-plates', payload);
    q.printFormat = 'share-plates';
    return q;
}

/* ============================================================== addition:add_sub_patterns */

/** The kinds, in the order of "What the pupil does" (forms 0-3). */
export const LADDER_KINDS = Object.freeze(['add', 'sub', 'missing', 'words']);
/** The ladder's places for each "Numbers to" band. */
const LADDER_PLACES = { 100: [1, 10], 1000: [1, 10, 100], 10000: [1, 10, 100, 1000] };
/** Every known fact with a one-digit answer: [a, b] for + (a + b <= 9), for − (b < a <= 9). */
const LADDER_ADD = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8].flatMap((a) => [1, 2, 3, 4, 5, 6, 7, 8].filter((b) => a + b <= 9).map((b) => [a, b])));
const LADDER_SUB = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9].flatMap((a) => [1, 2, 3, 4, 5, 6, 7, 8].filter((b) => b < a).map((b) => [a, b])));

export function genAddSubPatterns(q) {
    const kinds = ticked('forms', [0, 1, 2, 3]).map((i) => LADDER_KINDS[i]).filter(Boolean);
    const kind = kinds.length > 1 ? kinds[dealIndex('asp:kind', kinds.length)] : kinds[0] || 'add';
    const band = LADDER_PLACES[Number(opt('band'))] ? Number(opt('band')) : 1000;
    const places = LADDER_PLACES[band];
    const look = (() => { const v = opt('notation'); const t = Array.isArray(v) ? v[0] : v; return t === 'stacked' ? 'stacked' : 'across'; })();
    const levels = ticked('level', [2, 1]).slice().sort((x, y) => y - x);
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : 0;
    const given = levels[fadeRung(at, levels.length, state.itemCount, Number.isFinite(state.itemIndex))] >= 2;
    // + or − : the kind says it, or (missing, words) it is its own deal
    const op = kind === 'add' ? '+' : kind === 'sub' ? '-' : dealIndex('asp:op', 2) === 0 ? '+' : '-';
    // place words name every number by its place ("3 tens"), so no 1 (never "1 tens", and a
    // printed "ten" after a box would give the 1 away)
    const facts = (op === '+' ? LADDER_ADD : LADDER_SUB).filter(([x, y]) => kind !== 'words' || (x > 1 && y > 1 && (op === '+' ? x + y : x - y) > 1));
    const [a, b] = dealPick(`asp:fact:${op}:${kind === 'words' ? 'w' : 'n'}`, facts);
    const glyph = op === '+' ? '+' : '−';
    const res = op === '+' ? a + b : a - b;
    const payloadKind = kind === 'missing' ? 'missing' : kind === 'words' ? 'words' : 'result';
    const payload = { kind: payloadKind, op, a, b, places, given, look };
    const rows = places.map((pl) => ({ A: a * pl, B: b * pl, R: res * pl, pl }));
    const asked = rows.filter((r, i) => !(i === 0 && given));
    const parts = [];
    for (const r of asked) {
        if (payloadKind === 'missing') parts.push(String(r.B));
        else if (payloadKind === 'words' && r.pl > 1) { parts.push(String(res)); parts.push(String(r.R)); }
        else parts.push(String(r.R));
    }
    const PW = { 10: 'tens', 100: 'hundreds', 1000: 'thousands' };
    let text, printText;
    if (payloadKind === 'result') {
        text = `${op === '+' ? 'Add' : 'Subtract'}: ${rows.map((r) => `${r.A} ${glyph} ${r.B}`).join(', ')}.`;
        printText = 'Use the first fact. Write each answer.';
    } else if (payloadKind === 'missing') {
        text = `Find the missing numbers: ${rows.slice(1).map((r) => `${r.A} ${glyph} ? = ${r.R}`).join(', ')}.`;
        printText = 'Use the first fact. Write the missing numbers.';
    } else {
        text = `${rows.slice(1).map((r) => `${a} ${PW[r.pl]} ${glyph} ${b} ${PW[r.pl]} = ? ${PW[r.pl]}`).join(', ')}.`;
        printText = 'Use the first fact. Fill in the boxes.';
    }
    q.text = text;
    q.printText = printText;
    q.ans = parts.join(', ');
    q.keyParts = parts;
    q.acceptedAnswers = [parts.join(', '), parts.join(','), parts.join(' ')];
    q.answerType = 'text';
    q.selfAnswering = true;
    q.options = [];
    q.a = a; q.b = b; q.op = op === '+' ? '+' : '−';
    q.hint = `${a} ${glyph} ${b} = ${res}. ${a} tens ${glyph} ${b} tens = ${res} tens = ${res * 10}. The digits stay the same; the place changes.`;
    q.skillLabel = 'Spot the Pattern';
    q.ladder = { kind: payloadKind, op, a, b, places: places.slice(), given, res };
    q.cell = { template: 'fact-ladder', v: 1, payload };
    q.visual = k2Twin('fact-ladder', payload);
    q.printFormat = 'fact-ladder';
    // what the pupil sees: place words are always written across
    q.notation = payloadKind === 'words' ? 'across' : look;
    return q;
}

/* ================================================ multiplication:long_multiplication */

// Build list, lane operations, entry 4 (2026-09-26): long multiplication of a 3- or 4-digit
// number by a 2-digit one (4.NBT.B.5, 5.NBT.B.5; WRM Y5.B5.S5), and short division of a 3- or
// 4-digit number by a 1-digit one (4.NBT.B.6; WRM Y5.B5.S8). Templates `long-multiplication`
// and `short-division` (sheet/cells/long-multiplication.js).

/** The kinds, in the order of the "What the pupil does" option. */
export const LM_KINDS = Object.freeze(['mult', 'div', 'short']);

/** The screen twin of an ops-common template: the same drawing at the host's digit size. */
function opsTwin(template, payload) {
    let html = '';
    try { html = renderCell({ cell: { template, v: 1, payload } }, { mode: 'screen', static: true, size: 'L', look: 'ican', state: 'blank' }); } catch (e) { html = ''; }
    return `<div data-mq-join="">${html}</div>`;
}

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Does short division of n by d exchange at least once (a remainder carried into a digit)? */
function exchanges(n, d) {
    const D = String(n);
    let r = 0;
    for (let j = 0; j < D.length; j++) {
        const cur = r * 10 + Number(D[j]);
        if (j > 0 && r > 0) return true;
        r = cur % d;
    }
    return false;
}

export function genLongMult(q) {
    const kinds = ticked('forms', [0, 1]).map((i) => LM_KINDS[i]).filter(Boolean);
    const kind = kinds.length > 1 ? kinds[dealIndex('lm:kind', kinds.length)] : kinds[0] || 'mult';
    const digits = Number(opt('tiles')) === 32 ? 3 : 4;
    const levels = ticked('level', [2, 1, 0]).slice().sort((x, y) => y - x);
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : 0;
    const level = levels[fadeRung(at, levels.length, state.itemCount, Number.isFinite(state.itemIndex))];
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    if (kind === 'div') {
        // the divisor is dealt (a page holds each of 2-9 once before any repeats); the quotient is
        // chosen so the dividend has the asked number of digits and at least one exchange
        const d = dealPick(`lm:div:${digits}`, [2, 3, 4, 5, 6, 7, 8, 9]);
        let n = 0;
        for (let t = 0; t < 60; t++) {
            const quo = rnd(Math.ceil(lo / d), Math.floor(hi / d));
            n = quo * d;
            if (n >= lo && n <= hi && exchanges(n, d) && n % 10 !== 0) break;
        }
        const quotient = n / d;
        const payload = { dividend: n, divisor: d, level };
        q.text = `Divide: ${n} ÷ ${d}.`;
        q.printText = 'Use short division. Write the answer.';
        q.ans = quotient;
        q.a = n; q.b = d; q.op = '÷';
        q.answerType = 'number';
        q.options = [];
        q.hint = `Divide each digit by ${d}, from the left. Carry what is left over to the next digit: write it small in front of it.`;
        q.skillLabel = 'Short Division';
        q.lm = { kind, a: n, b: d, level, digits };
        q.cell = { template: 'short-division', v: 1, payload };
        q.visual = opsTwin('short-division', payload);
        q.printFormat = 'short-div-kit';
        q.notation = 'bracket';
        return q;
    }
    // the multiplier: its ones digit is dealt from 2-9 (a 0 has no ones row, a 1 copies the top
    // number) and its tens digit from 1-9, each on its own key (L10); short multiplication has the
    // ones digit alone
    const short = kind === 'short';
    const ones = dealPick(`lm:ones:${short ? 's' : ''}${digits}`, [2, 3, 4, 5, 6, 7, 8, 9]);
    const tens = short ? 0 : dealPick(`lm:tens:${digits}`, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const b = tens * 10 + ones;
    let a = rnd(lo, hi);
    // a top number of all one digit (2222) or ending in 0 has no carrying to practise
    for (let t = 0; t < 20 && (a % 10 === 0 || /^(\d)\1+$/.test(String(a))); t++) a = rnd(lo, hi);
    const payload = { a, b, level };
    q.text = `Multiply: ${a} × ${b}.`;
    q.printText = short ? 'Use short multiplication. Write the answer.' : 'Use long multiplication. Write the answer.';
    q.ans = a * b;
    q.a = a; q.b = b; q.op = '×';
    q.answerType = 'number';
    q.options = [];
    q.hint = short ? `Multiply each digit of ${a} by ${ones}, from the ones. Write the tens small, in the box of the next place.`
        : `First ${a} × ${ones}. Then ${a} × ${tens * 10}: write 0 in the ones first. Add the two rows.`;
    q.skillLabel = short ? 'Short Multiplication' : 'Long Multiplication';
    q.lm = { kind, a, b, level, digits };
    q.cell = { template: 'long-multiplication', v: 1, payload };
    q.visual = opsTwin('long-multiplication', payload);
    q.printFormat = 'long-mult-kit';
    q.notation = 'stacked';
    return q;
}

/* ------------------------------------------------------------------------------ dispatch */

/** Every skill id this module generates, by its id within its category. */
export const OPS_BUILD_SKILLS = Object.freeze({
    count_through_zero: genCountThroughZero,
    share_and_group_early: genShareGroupEarly,
    add_sub_patterns: genAddSubPatterns,
    long_multiplication: genLongMult,
});

/** Generate `q` for a build-lane skill; false when the id is not one of them. */
export function generateOpsBuild(q, skillId) {
    const fn = OPS_BUILD_SKILLS[skillId];
    if (!fn) return false;
    fn(q);
    return true;
}
