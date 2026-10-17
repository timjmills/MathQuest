// js/modules/sheet/refline.js
// THE REFERENCE NUMBER LINE AT THE TOP OF THE PAGE (design/MASTER_PLAN.md Wave 5.2, owner 2026-10-03).
//
// A support option on the skills where a number line helps (skill-options.js numberLineOptions):
// ONE line printed under the header, above the cells, on every page of the sheet and of its key,
// and above the practice card / the online worksheet on screen. It is a HINT scaffold
// (PEDAGOGY_STANDARD 4.1): off is the fade.
//
// It extends the support panes' number line (cells/panes/models.js markedLine): the same kit
// (black and white, Andika, strokes from the closed set, RP-50 axis 1.5 pt with solid arrowheads,
// labelled ticks 5 mm at 1.5 pt, part ticks 3 mm at 0.75 pt, labels below at zone-label size,
// fraction labels stacked). It is drawn across the full live width; it never shrinks its type to
// fit a long range - it raises the label interval (and thins the ticks) instead.
//
// Every label is a REFERENCE SCALE number (`data-ws-ref="1"`, kit.js): printed evenly, never
// singled out, so the answer may be one of them (SUPPORTS.md §S4.2).
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { SW, n2, st, text, mm, pc, textW, esc } from './cells/panes/kit.js';
import { arrowHead } from './cells/panes/models.js';

/** The step values a teacher can choose (skill-options.js nlStep). 'auto' = from the page. */
export const NL_STEP_VALUES = Object.freeze(['auto', '1', '2', '5', '10', '20', '25', '50', '100', '1000',
    '1/2', '1/3', '1/4', '1/5', '1/6', '1/8', '1/10', '1/12', '0.1', '0.01']);
export const NL_FRAC_DENS = Object.freeze([2, 3, 4, 5, 6, 8, 10, 12]);
/** Which ticks carry a number (nlLabels). */
export const NL_LABEL_VALUES = Object.freeze(['auto', 'all', '2', '5', '10', 'ends', 'none']);
/** Small ticks between two steps (nlMinor). */
export const NL_MINOR_VALUES = Object.freeze(['auto', '0', '2', '4', '5', '10']);

const EPS = 1e-9;
const NICE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;

/** A step as an exact ratio: {num, den, kind: 'whole'|'frac'|'dec'}. null for 'auto' / unknown. */
export function parseStep(s) {
    const t = String(s == null ? '' : s).trim();
    let m = /^1\/(\d+)$/.exec(t);
    if (m) return { num: 1, den: Number(m[1]), kind: 'frac' };
    m = /^0\.(0*)1$/.exec(t);
    if (m) return { num: 1, den: 10 ** (m[1].length + 1), kind: 'dec' };
    if (/^\d+$/.test(t) && Number(t) > 0) return { num: Number(t), den: 1, kind: 'whole' };
    return null;
}
export const stepValue = (st0) => st0.num / st0.den;
export const stepName = (st0) => (st0.kind === 'frac' ? `1/${st0.den}` : st0.kind === 'dec' ? String(1 / st0.den) : String(st0.num));

/* ------------------------------------------------------------------ the numbers a page uses */

const MINUS = /[−–]/g;
const cleanNum = (s) => Number(String(s).replace(MINUS, '-').replace(/,/g, ''));
const placesOf = (s) => { const m = /\.(\d+)/.exec(String(s)); return m ? m[1].length : 0; };

/** Numbers in a piece of text: mixed numbers, fractions, decimals and whole numbers (commas allowed). */
export function numbersInText(s) {
    let t = String(s == null ? '' : s).replace(/<sup>(\d+)<\/sup>\s*(?:\/|⁄)?\s*<sub>(\d+)<\/sub>/g, ' $1/$2 ')
        .replace(/<[^>]*>/g, ' ').replace(/&minus;/g, '−').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ');
    const out = [];
    // "15%" is 0.15 (critic nl-r2 D4): a percent is read as its value, never as a whole number.
    t = t.replace(/(^|[^\w.])([-−]?)(\d+(?:\.\d+)?)\s*%/g, (m, pre, sg, a) => {
        out.push({ v: (sg ? -1 : 1) * Number(a) / 100, den: 1, places: placesOf(a) + 2 });
        return pre + ' ';
    });
    t = t.replace(/([-−]?)(\d+)\s+(\d+)\s*\/\s*(\d+)/g, (m, sg, w, a, b) => {
        if (Number(b) > 0) out.push({ v: (sg ? -1 : 1) * (Number(w) + Number(a) / Number(b)), den: Number(b), places: 0 });
        return ' ';
    });
    t = t.replace(/(^|[^\d.])([-−]?)(\d+)\s*\/\s*(\d+)/g, (m, pre, sg, a, b) => {
        if (Number(b) > 0) out.push({ v: (sg ? -1 : 1) * Number(a) / Number(b), den: Number(b), places: 0 });
        return pre + ' ';
    });
    const re = /(^|[^\w.])([-−]?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/g;
    let m;
    while ((m = re.exec(t))) {
        // A minus sign is a sign only when it is not the operator between two numbers ("7 - 2").
        const before = t.slice(0, m.index + m[1].length).trimEnd();
        const signed = m[2] && !/[\d)]$/.test(before);
        // "1,250" is one number; "44,90,100" or "-55,-52,18" is a LIST (critic nl-r1 D2): a group
        // touching another comma is read part by part.
        const start = m.index + m[1].length;
        const listy = m[3].includes(',') && (t[start - 1] === ',' || t[re.lastIndex] === ',' || /,\s*[-−]/.test(t));
        const parts = listy ? m[3].split(',') : [m[3]];
        parts.forEach((part, k) => {
            const raw = (signed && k === 0 ? '-' : '') + part + (k === parts.length - 1 ? (m[4] || '') : '');
            const v = cleanNum(raw);
            if (Number.isFinite(v)) out.push({ v, den: 1, places: placesOf(raw) });
        });
    }
    return out;
}

// Keys that hold drawing geometry or bookkeeping, never a number the pupil works with.
const SKIP_KEY = /(mm|Mm|Px|px)$|^(n|digits|count|cols|rows|w|h|width|height|size|pitch|ticks|tickCount|parts|seed|index|i|id|level|x|y|places|tracks|v|version|weight|tries|itemIndex|kind|template|answerType|interactiveType|printFormat|skillLabel|skillId|categoryId|requestedSkillId|grade|label|letter|letters|hint|hints|visual|solution|steps|workedSteps|explanation|skillOptions|strings|instruction|sentence|svg|html|text|ans|answer|cell)$/;
// Keys that hold numbers the pupil works with (an item's own drawing range, tick lists and
// denominator menus are left out: they are geometry, not the problem).
const PICK_KEY = /^(a|b|c|operands|terms|numbers|values|start|target|value|whole|cards|tiles|bins|items|choices|nums|list|sequence|given|addends|parts?Values|dragItems|sortItems|points)$/;
function walkNumbers(p, out, depth = 0) {
    if (p === null || p === undefined || depth > 4) return;
    if (typeof p === 'number') { if (Number.isFinite(p)) out.push({ v: p, den: 1, places: placesOf(p) }); return; }
    if (typeof p === 'string') { if (/^\s*[-−]?\d/.test(p) && p.length < 60) out.push(...listNumbers(p)); return; }
    if (Array.isArray(p)) { p.forEach((x) => walkNumbers(x, out, depth + 1)); return; }
    if (typeof p !== 'object') return;
    if (Number.isFinite(Number(p.n)) && Number(p.d) > 0 && typeof p.n !== 'object') {
        const w = Number(p.w || p.whole || 0);
        out.push({ v: w + Number(p.n) / Number(p.d), den: Number(p.d), places: 0 });
        return;
    }
    for (const [k, v] of Object.entries(p)) if (!SKIP_KEY.test(k) && PICK_KEY.test(k)) walkNumbers(v, out, depth + 1);
}
/** An answer or a card: a single value, or a list split on its commas ("-55,-52,18"). */
function listNumbers(s) {
    const t = String(s);
    if (/^[\s\d.,/%−-]+$/.test(t) && t.includes(',') && !/^\s*\d{1,3}(,\d{3})+(\.\d+)?\s*$/.test(t)) return t.split(',').flatMap((x) => numbersInText(x));
    return numbersInText(t);
}

/**
 * Every number one generated item uses: its text, its answer (a list split on its commas), its
 * cell payload and whatever else it carries (drag cards, tiles, bins, choices), so a skill whose
 * numbers live on cards is read too (critic nl-r1 D2).
 */
export function lineNumbers(q) {
    if (!q || typeof q !== 'object') return [];
    const out = numbersInText(q.text);
    const a = q.ans;
    if (Array.isArray(a)) a.forEach((x) => walkNumbers(x, out));
    else if (typeof a === 'number' && Number.isFinite(a)) out.push({ v: a, den: 1, places: placesOf(a) });
    else if (typeof a === 'string') out.push(...listNumbers(a));
    if (q.cell && q.cell.payload) walkNumbers(q.cell.payload, out);
    for (const [k, v] of Object.entries(q)) if (!SKIP_KEY.test(k) && PICK_KEY.test(k) && v && typeof v === 'object') walkNumbers(v, out);
    return out.filter((x) => Number.isFinite(x.v) && Math.abs(x.v) < 1e7);
}

/** The usual step of a run of numbers (a count-by sequence): the commonest gap, or 0. */
export function sequenceStep(qs = []) {
    const tally = new Map();
    for (const q of qs) {
        const v = numbersInText(q && q.text).map((x) => x.v).filter(Number.isInteger);
        for (let i = 1; i < v.length; i++) { const d = Math.abs(v[i] - v[i - 1]); if (d > 0) tally.set(d, (tally.get(d) || 0) + 1); }
    }
    let best = 0, n = 0;
    for (const [d, c] of tally) if (c > n || (c === n && d < best)) { best = d; n = c; }
    return n >= 2 ? best : 0;
}

/**
 * The step each item counts in (critic nl-r2 D1): per item, the commonest gap between the whole
 * numbers of its text, in order. Items with no repeated gap (a doubling row) give none.
 */
export function itemSteps(qs = []) {
    const commonGap = (v) => {
        const tally = new Map();
        for (let i = 1; i < v.length; i++) { const d = Math.abs(v[i] - v[i - 1]); if (d > 0) tally.set(d, (tally.get(d) || 0) + 1); }
        let best = 0, n = 0;
        for (const [d, c] of tally) if (c > n || (c === n && d < best)) { best = d; n = c; }
        return n >= 2 ? best : 0;
    };
    const ints = (list) => list.map((x) => x.v).filter(Number.isInteger);
    const out = [];
    for (const q of qs) {
        if (!q) continue;
        const t = String(q.text || '').replace(/<[^>]*>/g, ' ');
        // The step the item names: "Count by 11", "by 3s", "count-by-4s".
        const m = /\bby[\s-]+(\d[\d,]*)s?\b/i.exec(t);
        let st0 = m ? cleanNum(m[1]) : 0;
        if (!st0) st0 = commonGap(ints(numbersInText(t)));
        if (!st0 && typeof q.ans === 'string') st0 = commonGap(ints(listNumbers(q.ans)));
        if (!st0 && Array.isArray(q.ans)) st0 = commonGap(q.ans.map(Number).filter(Number.isInteger));
        if (!st0 && q.cell && q.cell.payload) { const w = []; walkNumbers(q.cell.payload, w); st0 = commonGap(ints(w)); }
        if (st0 > 0) out.push(st0);
    }
    return out;
}
/** The one step every item of a skill lands on: their shared step, else the gcd of their steps. */
export function commonStep(steps = []) {
    if (!steps.length) return 0;
    return steps.reduce((a, b) => gcd(a, b));
}

/* ------------------------------------------------------------------ the line's spec */

const FRAC_NAMES = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 12: 'twelfths', 100: 'hundredths' };

/**
 * The default line for a skill (critic nl-r1 D3-D5). `hints` is what the skill says about itself
 * (skill-options.js numberLineSkillHints, plus the app's `within` from its options and the count
 * step of its sequences): the ends come from the skill's declared range ("within 20" ends at 20)
 * and widen to its numbers; a skip-count skill counts in its own step; fractions count in the
 * page's common denominator, or in halves with a note when no one offered step serves them all;
 * decimals get a whole-number line with tenth minor ticks.
 */
export function defaultLine(nums = [], hints = {}) {
    const notes = [];
    nums = lineNums(nums, hints);
    const vals = nums.map((x) => x.v).filter(Number.isFinite);
    const within = Number(hints.within) > 0 ? Number(hints.within) : 0;
    if (!vals.length && !within) return { from: 0, to: 10, step: { num: 1, den: 1, kind: 'whole' }, unknown: true, notes };
    let lo = Math.min(0, ...vals), hi = Math.max(0, within, ...vals);
    const isFrac = (x) => x.den > 1 && Math.abs(x.v - Math.round(x.v)) > EPS;
    const fracDens = nums.filter(isFrac).map((x) => x.den);
    const allDens = nums.filter((x) => x.den > 1).map((x) => x.den);
    const places = Math.max(0, ...nums.map((x) => x.places || 0));
    // A fraction step only when the fractions are the page (critic nl-r2 D5): one stray −1/3 among
    // a hundred integers does not turn −100..100 into twelfths.
    const fracPage = hints.fraction ? allDens.length > 0 : fracDens.length > 0 && fracDens.length * 2 >= nums.length;
    let step, minor = 0;
    if (hints.decimal || (places >= 1 && !fracPage)) {
        lo = Math.floor(lo + EPS); hi = Math.max(Math.ceil(hi - EPS), lo + 1);
        const span = hi - lo;
        if (span <= 2) {
            // Values between 0 and 1 (or 2): a line of tenths, hundredths as small ticks (D4).
            step = { num: 1, den: 10, kind: 'dec' };
            minor = 10;
        } else {
            // A whole-number line with tenths as small ticks, like a ruler (D8), ends on a five.
            const s = span <= 20 ? 1 : (NICE.find((k) => span / k <= 20) || 100000);
            step = { num: s, den: 1, kind: 'whole' };
            if (s === 1) { minor = 10; lo = Math.floor(lo / 5) * 5; hi = Math.ceil(hi / 5) * 5; }
            else { lo = Math.floor(lo / s) * s; hi = Math.ceil(hi / s) * s; }
        }
    } else if (fracPage) {
        const dens = [...new Set(fracDens.length ? fracDens : allDens)];
        const L = dens.reduce(lcm, 1);
        let den = L;
        if (!NL_FRAC_DENS.includes(L)) {
            den = 2;
            notes.push(`This page uses ${dens.sort((a, b) => a - b).map((d) => FRAC_NAMES[d] || `${d}ths`).join(', ')}: one line cannot show them all, so it marks halves.`);
        }
        step = { num: 1, den, kind: 'frac' };
        lo = Math.floor(lo + EPS); hi = Math.max(Math.ceil(hi - EPS), lo + 1);
    } else if (hints.skip) {
        // A count-by line counts in the items' own step, reduced so that every number of the page
        // lands on a tick (critic nl-r2 D1): 71, 73, 75 is a count in 2s, but not on a line of evens.
        const ints = vals.filter(Number.isInteger).map(Math.abs).filter((v) => v > 0);
        let s = [Number(hints.step) > 0 ? Number(hints.step) : 0, ...ints].reduce((g, v) => gcd(g, v), 0) || 1;
        lo = Math.floor(lo / s) * s; hi = Math.ceil(hi / s) * s;
        if (hi <= lo) hi = lo + 10 * s;
        if (s === 1 && hi - lo > 60) {
            // A long line of ones: tens, with every one as a small tick (fives or twos when ones would touch).
            lo = Math.floor(lo / 10) * 10; hi = Math.ceil(hi / 10) * 10;
            step = { num: 10, den: 1, kind: 'whole' };
            minor = 10;
            if (hi - lo > 1000) { const k = NICE.find((m) => (hi - lo) / (10 * m) <= 100) || 1; step = { num: 10 * k, den: 1, kind: 'whole' }; lo = Math.floor(lo / step.num) * step.num; hi = Math.ceil(hi / step.num) * step.num; }
        } else {
            if ((hi - lo) / s > 200) { const k = NICE.find((m) => (hi - lo) / (s * m) <= 200) || 1; s *= k; lo = Math.floor(lo / s) * s; hi = Math.ceil(hi / s) * s; }
            step = { num: s, den: 1, kind: 'whole' };
        }
    } else {
        const span = Math.max(1, hi - lo);
        const s = span <= 20 ? 1 : (NICE.find((k) => span / k <= 20) || 100000);
        step = { num: s, den: 1, kind: 'whole' };
        // Round the ends out to a friendly number: fives on a line of ones, two steps on a longer
        // one; a skill's declared end ("within 50") is kept exactly.
        const r = s === 1 ? 5 : 2 * s;
        lo = Math.floor(lo / r) * r;
        hi = within && hi <= within ? within : Math.ceil(hi / r) * r;
        if (s === 1 && hi - lo < 10 && lo >= 0) hi = lo + 10;
        if (hi <= lo) hi = lo + 10 * s;
    }
    return { from: lo, to: hi, step, minor, notes };
}

/**
 * The numbers a line must hold. On a fraction skill, a whole number that only answers "find the
 * missing numerator" (2/3 = 8/?) is not a position on the line (critic nl-r2 D5).
 */
export function lineNums(nums = [], hints = {}) {
    if (hints.fraction && nums.some((x) => x.den > 1)) return nums.filter((x) => x.den > 1);
    return nums;
}

/** True when every number lies on the line's span. */
export function lineCovers(spec, nums = []) {
    const missing = nums.map((x) => x.v).filter((v) => v < spec.from - EPS || v > spec.to + EPS);
    return { ok: !missing.length, missing: [...new Set(missing)].sort((a, b) => a - b) };
}

/**
 * Resolve the teacher's options (nlFrom, nlTo, nlStep, nlLabels, nlMinor, nlHops) against the
 * page's numbers. Unset values come from the numbers. Returns the spec plus `covers`/`missing`,
 * and a `warn` line for the panel when the teacher's own range misses some of them.
 */
export function resolveLine(opts = {}, nums = [], hints = {}) {
    const d = defaultLine(nums, hints);
    const own = parseStep(opts.nlStep);
    const hasFrom = opts.nlFrom !== null && opts.nlFrom !== undefined && opts.nlFrom !== '' && Number.isFinite(Number(opts.nlFrom));
    const hasTo = opts.nlTo !== null && opts.nlTo !== undefined && opts.nlTo !== '' && Number.isFinite(Number(opts.nlTo));
    let step = own || d.step;
    // An Auto step on the teacher's own range counts in what suits THAT range (−10 to 10 by ones).
    if (!own && step.kind === 'whole' && (hasFrom || hasTo)) {
        const span = Math.max(1, Math.abs((hasTo ? Number(opts.nlTo) : d.to) - (hasFrom ? Number(opts.nlFrom) : d.from)));
        step = { num: span <= 20 ? 1 : (NICE.find((k) => span / k <= 20) || 100000), den: 1, kind: 'whole' };
    }
    const sv = stepValue(step);
    let from = hasFrom ? Number(opts.nlFrom) : (own ? Math.floor(d.from / sv + EPS) * sv : d.from);
    let to = hasTo ? Number(opts.nlTo) : (own ? Math.ceil(d.to / sv - EPS) * sv : d.to);
    if (to < from) [from, to] = [to, from];
    if (to - from < sv - EPS) to = from + sv;
    let labels = NL_LABEL_VALUES.includes(String(opts.nlLabels)) ? String(opts.nlLabels) : 'auto';
    // A skip-count line labels only its ends: every tick labelled would be the answer list.
    // A skip-count line labels landmarks, not every count (critic nl-r2 D2): its ends when it has
    // a dozen ticks or fewer, else every 5th count (0, 10, 20 … on a line of 2s), or every 10 on
    // a line of ones. The counted values between them stay unlabelled.
    if (labels === 'auto' && hints.skip) {
        const ticks = Math.round((to - from) / sv);
        labels = ticks <= 12 && !d.minor ? 'ends' : d.minor ? 'all' : step.kind === 'whole' && step.num === 1 ? '10' : '5';
    }
    let minor = NL_MINOR_VALUES.includes(String(opts.nlMinor)) ? String(opts.nlMinor) : 'auto';
    if (minor === 'auto' && !own && d.minor) minor = String(d.minor);
    const spec = { from, to, step, labels, minor, hops: !!opts.nlHops, autoFrom: !hasFrom, autoTo: !hasTo, notes: d.notes.slice() };
    const cov = lineCovers(spec, lineNums(nums, hints));
    const fmt = (v) => String(Math.round(v * 1000) / 1000).replace('-', '−');
    spec.covers = cov.ok && !d.unknown;
    spec.unknown = !!d.unknown;
    spec.missing = cov.missing;
    const list = cov.missing.slice(0, 4).map(fmt).join(', ') + (cov.missing.length > 4 ? ' and more' : '');
    spec.warn = d.unknown && !(hasFrom && hasTo) ? 'This skill\'s numbers could not be read: set Start and End for its number line.'
        : cov.ok ? '' : `The number line runs ${fmt(from)} to ${fmt(to)}, but the page uses ${list}. Widen it or leave Start and End on Auto.`;
    if (own) spec.notes = [];
    if (spec.notes.length && !spec.warn) spec.warn = spec.notes.join(' ');
    return spec;
}

/* ------------------------------------------------------------------ the drawing */

/** The label of tick index i: {whole: '3'} or {num: '5', den: '4'} (stacked). */
function labelOf(i, step) {
    if (step.kind === 'frac') {
        const g = gcd(i, step.den);
        if (i % step.den === 0) return { whole: String(i / step.den).replace('-', '−') };
        // in lowest terms (critic nl-r3 D3): 6/12 reads ½, 4/12 reads ⅓
        const r = gcd(Math.abs(i * step.num), step.den) || 1;
        return { num: String((i * step.num) / r).replace('-', '−'), den: String(step.den / r), g };
    }
    if (step.kind === 'dec') {
        const places = String(step.den).length - 1;
        const v = (i * step.num) / step.den;
        // One format on the whole line: 0, 0.5, 1, 1.5 (never 0.50 beside 1).
        return { whole: String(Number(v.toFixed(places))).replace('-', '−') };
    }
    const v = i * step.num;
    return { whole: (Math.abs(v) >= 10000 ? v.toLocaleString('en-US') : String(v)).replace('-', '−') };
}
const labelWidth = (lab, pt) => (lab.whole !== undefined ? textW(lab.whole, pt) : Math.max(textW(lab.num, pt), textW(lab.den, pt)));

/**
 * The geometry of the line across `widthMm`. `c` is the pane kit's context (pc()).
 * Returns {w, h, body, label, labelEvery, tickEvery, notes}.
 */
export function refLineGeom(c, spec, widthMm) {
    const step = spec.step;
    const notes = [];
    let i0 = Math.round((spec.from * step.den) / step.num);
    let i1 = Math.round((spec.to * step.den) / step.num);
    if (Math.abs(i0 * step.num / step.den - spec.from) > EPS) i0 = Math.floor((spec.from * step.den) / step.num + EPS);
    if (Math.abs(i1 * step.num / step.den - spec.to) > EPS) i1 = Math.ceil((spec.to * step.den) / step.num - EPS);
    if (i1 <= i0) i1 = i0 + 1;
    const W = Math.max(60, widthMm);
    const pad = 6;
    const usable = W - 2 * pad;
    const pt = c.S.zonePt;
    const frac = step.kind === 'frac';
    // The intervals ticks and labels may take: on a fraction line the divisors of the denominator
    // and then whole multiples, so every whole is a tick and a label (critic nl-r1 D4); else 1, 2, 5, 10 ...
    const GRID = frac
        ? [...new Set([...Array.from({ length: step.den }, (_, k) => k + 1).filter((k) => step.den % k === 0), ...NICE.map((k) => k * step.den)])].sort((a, b) => a - b)
        : NICE;
    const gapMm = 1.5;
    const want = spec.labels;
    let n, pitch, tickEvery, maxW, fitEvery, labelEvery;
    // Auto ends land on the label grid, so every label gap is the same (critic nl-r1 D10).
    for (let pass = 0; pass < 3; pass++) {
        n = i1 - i0;
        pitch = usable / n;
        tickEvery = GRID.find((k) => k * pitch >= 1.5) || GRID[GRID.length - 1];
        maxW = 0;
        for (let i = i0; i <= i1; i += Math.max(1, Math.ceil(n / 400))) maxW = Math.max(maxW, labelWidth(labelOf(i, step), pt));
        maxW = Math.max(maxW, labelWidth(labelOf(i0, step), pt), labelWidth(labelOf(i1, step), pt));
        fitEvery = GRID.find((k) => k % tickEvery === 0 && k * pitch >= maxW + gapMm) || GRID[GRID.length - 1];
        labelEvery = 0;
        if (want === 'all') labelEvery = tickEvery;
        else if (want === '2' || want === '5' || want === '10') labelEvery = Number(want) * tickEvery;
        else if (want === 'auto') labelEvery = fitEvery;
        if (labelEvery && labelEvery < fitEvery) labelEvery = GRID.find((k) => k >= fitEvery && k % labelEvery === 0) || fitEvery;
        const g = labelEvery || tickEvery;
        const j0 = spec.autoFrom ? Math.floor(i0 / g) * g : i0, j1 = spec.autoTo ? Math.ceil(i1 / g) * g : i1;
        if (j0 === i0 && j1 === i1) break;
        i0 = j0; i1 = j1;
    }
    if (tickEvery > 1 && !frac) notes.push(`ticks every ${tickEvery} steps (the range is long)`);
    if (labelEvery && want !== 'auto' && labelEvery !== (want === 'all' ? tickEvery : Number(want) * tickEvery)) notes.push(`labels every ${labelEvery} steps so the numbers do not crowd`);
    const hopEvery = spec.hops ? (n / tickEvery <= 40 ? tickEvery : (labelEvery || fitEvery)) : 0;
    // Minor ticks between two drawn ticks.
    let minor = spec.minor === 'auto' ? 0 : Number(spec.minor) || 0;
    if (spec.minor === 'auto' && step.kind === 'whole' && tickEvery === 1 && step.num > 1) {
        minor = [10, 5, 4, 2].find((m) => step.num % m === 0 && pitch / m >= 1.6) || 0;
    }
    // Small ticks as fine as a ruler's millimetres (0.85 mm apart) stay readable (critic nl-r2 D8);
    // closer than that, fall back to fifths, then halves, before dropping them.
    if (minor && (pitch * tickEvery) / minor < 0.85) {
        const alt = [5, 2].find((m) => m < minor && minor % m === 0 && (pitch * tickEvery) / m >= 0.85) || 0;
        notes.push(alt ? `small ticks in ${alt === 2 ? 'halves' : 'fifths'}: ${minor} would touch` : 'no small ticks: they would touch');
        minor = alt;
    }

    const hopH = hopEvery ? 7 : 0;
    // A tight band (critic nl-r1 D9): the strokes and type keep their sizes, only the air goes.
    const axisY = 2.8 + hopH;
    const labTop = axisY + 2.5 + 1.0;
    const H = labTop + (frac ? mm(pt) * 2.2 : mm(pt) * 1.0) + 0.4;
    const x = (i) => pad + (i - i0) * pitch;
    const oneEnd = i0 === 0 && step.kind === 'whole';
    let body = `<line x1="${n2(oneEnd ? pad : 1)}" y1="${n2(axisY)}" x2="${n2(W - 1)}" y2="${n2(axisY)}" ${st(c, SW.heavy)}/>`;
    if (!oneEnd) body += arrowHead(c, 0, axisY, -1);
    body += arrowHead(c, W, axisY, 1);
    const onGrid = (i, k) => k > 0 && ((i % k) + k) % k === 0;
    // Both ends always carry their number (the pupil reads where the line starts and stops); a grid
    // label too close to an end gives way to it.
    const nearEnd = (i) => !(i === i0 || i === i1) && (Math.abs(i - i0) * pitch < maxW + gapMm || Math.abs(i1 - i) * pitch < maxW + gapMm);
    const labelled = (i) => (want === 'none' ? false : (i === i0 || i === i1) ? true : want === 'ends' ? false : onGrid(i, labelEvery) && !nearEnd(i));
    let labels = '', ticks = '', hops = '';
    for (let i = i0; i <= i1; i++) {
        const drawn = onGrid(i, tickEvery) || i === i0 || i === i1;
        if (drawn) {
            const big = labelled(i) || (frac && i % step.den === 0);
            ticks += `<line x1="${n2(x(i))}" y1="${n2(axisY - (big ? 2.5 : 1.5))}" x2="${n2(x(i))}" y2="${n2(axisY + (big ? 2.5 : 1.5))}" ${st(c, big ? SW.heavy : SW.hair)}/>`;
        }
        if (minor && onGrid(i, tickEvery) && i + tickEvery <= i1) {
            for (let m = 1; m < minor; m++) {
                const mx = x(i) + (m * pitch * tickEvery) / minor;
                const half = minor % 2 === 0 && m === minor / 2 ? 0.5 : 0;   // the half-way tick is longer, as on a ruler
                ticks += `<line x1="${n2(mx)}" y1="${n2(axisY - 1 - half)}" x2="${n2(mx)}" y2="${n2(axisY + 1 + half)}" ${st(c, SW.fine)}/>`;
            }
        }
        if (hopEvery && onGrid(i, hopEvery) && i + hopEvery <= i1) {
            const xa = x(i), xb = x(i + hopEvery), xm = (xa + xb) / 2, top = axisY - 1.2 - Math.min(5.5, (xb - xa) * 0.45);
            hops += `<path d="M${n2(xa + 0.4)} ${n2(axisY - 1.2)}Q${n2(xm)} ${n2(top)} ${n2(xb - 0.4)} ${n2(axisY - 1.2)}" fill="none" ${st(c, SW.hair)}/>`
                + `<path d="M${n2(xb - 0.4)} ${n2(axisY - 1.2)}l-1.6 -1.1l0.3 1.7Z" fill="#000" ${st(c, SW.fine)}/>`;
        }
        if (!labelled(i)) continue;
        const lab = labelOf(i, step);
        if (lab.whole !== undefined) labels += text(c, x(i), labTop + mm(pt) * 0.8, lab.whole, { pt, ref: true });
        else {
            const bw = Math.max(textW(lab.num, pt), textW(lab.den, pt)) + 0.8;
            labels += `<g data-ws-ref="1" data-ws-frac="1">${text(c, x(i), labTop + mm(pt) * 0.8, lab.num, { pt, ref: true })}`
                + `<line x1="${n2(x(i) - bw / 2)}" y1="${n2(labTop + mm(pt) * 1.05)}" x2="${n2(x(i) + bw / 2)}" y2="${n2(labTop + mm(pt) * 1.05)}" ${st(c, SW.one)}/>`
                + `${text(c, x(i), labTop + mm(pt) * 1.98, lab.den, { pt, ref: true })}</g>`;
        }
    }
    // Labels the teacher asked for but did not get (each end): not repeated here, the dialog names them.
    if (want === 'all' || want === 'auto') { /* ends handled above */ }
    body += ticks + hops + labels;
    const lf = (v) => String(Math.round(v * 1000) / 1000).replace('-', '−');
    return { w: W, h: H, body, label: `number line ${lf(i0 * step.num / step.den)} to ${lf(i1 * step.num / step.den)}, steps of ${stepName(step)}`, tickEvery, labelEvery, notes };
}

/**
 * The band: the line across `widthMm` (paper: the live width; screen: the host's width / px per mm).
 * Returns {html, hMm, notes}. `twin` draws it for a screen host at `pxPerMm`.
 */
export function refLineHTML(spec, { size = 'M', widthMm = 186, twin = false, pxPerMm = 3.4, ink = 'black', hMm: fixedH = 0 } = {}) {
    const c = pc({ size, twin, ink });
    const g = refLineGeom(c, spec, widthMm);
    const M = 0.6;
    const vw = g.w + 2 * M, vh = g.h + 2 * M;
    const width = twin ? `${Math.round(vw * pxPerMm)}px` : `${n2(vw)}mm`;
    const svg = `<svg class="ws-refline-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${n2(vw)} ${n2(vh)}" role="img" aria-label="${esc(g.label)}" `
        + `style="display:block;width:${width};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
    const natural = Math.ceil((vh + 1.0) * 10) / 10;
    // A host that reserved the band already (print-sheet.js) keeps its height: the page was laid out with it.
    const hMm = fixedH > 0 ? Math.max(fixedH, 0) : natural;
    const html = `<div class="ws-refline" data-ws-support="refline" data-ws-band="refline" data-ws-answer-free="1" data-ws-scaffold="hint" `
        + `style="flex:none;${twin ? '' : `height:${hMm}mm;`}box-sizing:border-box;padding-top:0.5mm;display:flex;justify-content:center;color:#000;background:#fff;font-family:'Andika',sans-serif;line-height:1;">${svg}</div>`;
    return { html, hMm, natural, notes: g.notes, geom: { tickEvery: g.tickEvery, labelEvery: g.labelEvery } };
}

export default { parseStep, numbersInText, lineNumbers, itemSteps, commonStep, lineNums, defaultLine, lineCovers, resolveLine, refLineGeom, refLineHTML };
