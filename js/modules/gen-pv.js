// gen-pv.js — P9: place value + rounding (design/research/place-value-rounding.md, §19.4 steps 2-7)
//
// The rewritten generators for the family's worst pages. gen-algebraic.js's rounding and place
// value dispatchers hand these ids here first; everything this file does not claim falls
// through to the older branches there.
//
// WHAT THE REWRITE FIXES, and the rule each fix answers to:
//   * TYPES ARE DEALT, NOT ROLLED (§2.2, ruling 2). No `Math.random() < p` picks a cell type any
//     more. The real items that hid behind those gates are option values ("circle every number
//     that rounds to N" is `response: circle-all`, its own step); the ones that were a different
//     skill left (placing a number on a line is RN-2's new id, "click all numbers 10 more than
//     57" had nothing to select). What a page varies is dealt round-robin off state.itemIndex.
//   * THE BAND BINDS (owner ruling of 2026-09-25, superseding §2.1). The skill's own `band` SETS
//     the working range and the place sets a floor under it (pvBand); Max Number lowers it only
//     when the teacher explicitly set Max Number below it (pvCap — the app default 100 is "not
//     chosen"). A skill whose place an explicitly lowered Max Number cannot host is REFUSED
//     (q.refused), never silently dealt at a bigger number — generateQuestionFor() returns null.
//   * SUPPORT IS AN OPTION. The place-value chart / bare numeral (identify, value), the hundreds
//     chart / number line (more / less) and the number line between the bins (round_sort_*) are
//     drawn by pv-support-cell.js, on screen (q.visual) and in print (the `pv-support` template).
//   * THE ANSWER IS NOT IN THE ITEM (§17 answer-in-item, Q-8). No place strip with the target
//     picked out, no "5 x 10 = ?", no midpoint label, no plotted dot, no bars with the distances
//     written on them, no more / less cross printing the neighbours, no hint holding the answer.
//   * EDGE CASES ARE CONTENT (§2.3). A seeded page of six carries a halfway number and a number
//     that rounds up across a place; the disks deal a 9 in a zone.
//   * THE ZERO PLACE (§2.4, owner ruling 4). Framed expanded form has one box per place and the
//     key writes the zero part: 300 + 0 + 5.
//   * THE DISK CELL (§13.4, owner ruling 3). Read to 9,999, draw to 999, every zone sized to nine
//     disks (the `pv` template, js/modules/sheet/cells/pv.js).
//
// Every item carries `q.pv`, a plain description of what was dealt, which the content gate
// (tests/scripts/ws-content-audit.cjs, family `pv`) recomputes independently, and `q.cell`, the
// sheet-kit `pv` template's payload, which the printed sheet and its facsimile key draw (the
// screen hosts draw `q.visual`, made from the same drawings). Randomness is Math.random, which
// generateQuestionFor() seeds, so a seed reprints the same page.

import { state } from './state.js';
import { randInt, shuffle } from './utils.js';
import { normalizeOptions, pvRefusal, pvRoundPlace, pvCap, pvBand } from './skill-options.js';
import { diskMatSVG, numeralTracksHTML, roundingLineSVG } from './sheet/index.js';
import { plainNumeralHTML, placeChartHTML, hundredsRowsHTML, hundredsWindow, pvLineSVG, moreLessLine } from './pv-support-cell.js';

const PLACE_WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions' };
const PLACE_ONE = { 1: 'one', 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million' };
const fmt = (n) => Number(n).toLocaleString('en-US');
const SCREEN_PX_PER_MM = 3.2;

/* --------------------------------------------------------------------------- dealing */

// The item's position on its page. The print pipeline and the audit pass the KEPT index; live
// play has none and falls back to its own cursor. Fixed once per question (see gen-counting.js
// _kBeginItem for why a per-deal cursor goes wrong).
let _liveCursor = -1;
let _at = 0;
function beginItem() { _at = Number.isFinite(state.itemIndex) ? state.itemIndex : ++_liveCursor; }
const slot = (n) => ((_at % n) + n) % n;

function optsOf(cat, skill) {
    // A mixed parent's options (only `level`) never name a member's own options, so the member's
    // stand-alone defaults fill in (ruling R2).
    return normalizeOptions(cat, skill, state.skillOptions);
}

/**
 * The digit span a band allows: "to 100" is the two-digit numbers (so band 99 / Max Number 100
 * really deals 2-digit items, §17 pv-band), "to 999" the three-digit ones, "to 50" 10-50.
 */
function digitSpan(cap) {
    const c = Math.max(1, Math.floor(cap));
    const d = String(c).length;
    const lo = 10 ** (d - 1);
    if (c === lo && d > 1) return [10 ** (d - 2), lo - 1];
    return [lo, c];
}

/**
 * True while this skill is dealt as a member of a mixed review (state.skill is the review's id).
 * The review has no band of its own, so its Max Number caps every member (pvCap `strict`).
 */
const inReview = (skill) => !!state.skill && state.skill !== skill && /(^mixed|_all$|_mixed$)/.test(String(state.skill));

/** The biggest number this skill deals: its band (or `fallback`), floored by its place, capped by pvCap. */
function capOf(cat, skill, o, fallback) {
    return pvCap(pvBand(cat, skill, o, fallback), state.range, inReview(skill));
}

function refuse(q, cat, skill, o) {
    const msg = pvRefusal(cat, skill, state.range, o, inReview(skill));
    if (!msg) return false;
    q.refused = msg;
    q.text = msg;
    q.printText = '';
    q.ans = '';
    q.answerType = 'text';
    q.options = [];
    q.visual = '';
    q.hint = 'Ask your teacher to raise Max Number.';
    return true;
}

/** A number of `nd` digits whose non-leading digits are 1-9, with a zero forced into one of them. */
function digitsNumber(nd, { zero = false, nine = false } = {}) {
    const ds = [randInt(1, 9)];
    for (let i = 1; i < nd; i++) ds.push(randInt(1, 9));
    if (nine && nd >= 1) ds[randInt(0, nd - 1)] = 9;
    if (zero && nd >= 2) ds[randInt(1, nd - 1)] = 0;
    return ds;
}
const fromDigits = (ds) => ds.reduce((a, d) => a * 10 + d, 0);

/** A number in [lo, hi] with every digit non-zero (unless asked) and no digit repeated at `place`. */
function spanNumber(lo, hi, opt = {}) {
    const nd = String(hi).length;
    for (let t = 0; t < 60; t++) {
        const n = fromDigits(digitsNumber(String(lo).length === nd ? nd : randInt(String(lo).length, nd), opt));
        if (n >= lo && n <= hi) return n;
    }
    // A span too narrow for the digit rule (e.g. 10-20): any number in it.
    return randInt(lo, hi);
}

/* --------------------------------------------------------------------------- print payload */

// The kit cell (SCC-Q3: plain data). `keyValue` is what the facsimile key writes in the slot.
function setCell(q, payload) {
    q.cell = { template: 'pv', v: 1, payload: { keyValue: q.ans, ...payload } };
    q.printFormat = 'pv-cell';
}

/* =========================================================================== PLACE VALUE */

const PV_ALL_PLACES = [1, 10, 100, 1000, 10000, 100000];

function genPlace(q, skill, o) {
    const cap = capOf('placevalue', skill, o, 999);
    let [lo, hi] = digitSpan(cap);
    let nd = String(hi).length;
    const bandPlaces = Array.from({ length: nd }, (_, i) => 10 ** i);
    // The ticked places. Every place ticked (or none) means "every place the number has", so the
    // band alone decides. A narrower tick is honoured exactly: a place the band's numbers do not
    // have makes THAT item's number just long enough to have it, unless an explicitly lowered Max
    // Number forbids it, when the place is dropped (the tick cannot be honoured, the page is not
    // emptied).
    let ticked = [];
    if (skill === 'identify' && Array.isArray(o.places)) {
        const t = o.places.map(Number).filter(p => PV_ALL_PLACES.includes(p));
        if (t.length && t.length < PV_ALL_PLACES.length) ticked = t.filter(p => p < 10 * hi || pvCap(p * 10 - 1, state.range) >= p);
    }
    if (!ticked.length) ticked = bandPlaces;
    const place = ticked[slot(ticked.length)];
    if (place > hi) { lo = place; hi = place * 10 - 1; nd = String(hi).length; }
    const allPlaces = Array.from({ length: nd }, (_, i) => 10 ** i);
    // The digit at the asked place is non-zero and appears once, so "the underlined digit" and
    // "the 7" can never mean two different digits (PN-5's repeated digit is its own step).
    let n = 0;
    for (let t = 0; t < 80; t++) {
        n = spanNumber(lo, hi);
        if (n < place) continue;
        const s = String(n);
        const dg = s[s.length - 1 - Math.round(Math.log10(place))];
        if (dg !== '0' && s.split('').filter(c => c === dg).length === 1) break;
    }
    const s = String(n);
    const digit = Number(s[s.length - 1 - Math.round(Math.log10(place))]);
    // Place-value support (a separate control, P-1): the chart names every place, the letters
    // (the `pv` template's own numeral) remind, and "none" leaves the digit's position to read.
    const support = o.support === 'chart' || o.support === 'none' ? o.support : 'labels';
    const drawNumeral = (opt) => support === 'chart' ? placeChartHTML(n, opt)
        : support === 'none' ? plainNumeralHTML(n, opt) : numeralTracksHTML(n, opt);
    q.visual = `<div style="text-align:center;">${drawNumeral({ underline: place })}</div>`;
    const readHint = support === 'chart' ? 'Read the place name above the underlined digit.'
        : support === 'none' ? 'Count the places from the right: ones, tens, hundreds, thousands.'
            : 'Read the letter above the underlined digit.';
    const cellFor = (payload) => {
        if (support === 'labels') { setCell(q, payload); return; }
        q.cell = { template: 'pv-support', v: 1, payload: { picture: support === 'chart' ? 'chart' : 'plain', n, place,
            base: { keyValue: q.ans, ...payload } } };
        q.printFormat = 'pv-cell';
    };
    if (skill === 'identify') {
        // Three printed place words to ring at up to 999 (PN-1 prints all three even for a 2-digit
        // number); above that, one word per place the number has.
        const words = (nd <= 3 ? [1, 10, 100] : allPlaces).map(p => PLACE_WORD[p]);
        q.text = 'Which place is the underlined digit in?';
        q.printText = 'Circle the place of the underlined digit.';
        q.ans = PLACE_WORD[place];
        q.answerType = 'multiple-choice';
        q.options = words;
        q.hint = readHint;
        q.skillLabel = 'Name the Place';
        q.pv = { kind: 'place', n, place, digit, support };
        cellFor({ kind: 'place', n, place, words });
    } else {
        q.text = 'What is the underlined digit worth?';
        q.printText = 'Write what the underlined digit is worth.';
        q.ans = digit * place;
        q.answerType = 'number';
        q.options = [];
        q.hint = `${readHint} That place tells you what the digit is worth.`;
        q.skillLabel = 'Value of a Digit';
        q.pv = { kind: 'value', n, place, digit, support };
        cellFor({ kind: 'value', n, place, frame: 'worth ____' });
    }
}

function wantZero(o) {
    return o.zeroPlace === 'always' || (o.zeroPlace === 'some' && slot(2) === 1);
}

function genExpandCombine(q, skill, o) {
    const cap = capOf('placevalue', skill, o, 999);
    const [lo, hi] = digitSpan(cap);
    const nd = String(hi).length;
    const zero = wantZero(o);
    let ds = [];
    for (let t = 0; t < 60; t++) {
        ds = digitsNumber(nd, { zero });
        const v = fromDigits(ds);
        if (v >= lo && v <= hi) break;
    }
    let n = fromDigits(ds);
    if (n < lo || n > hi) { n = randInt(lo, hi); ds = String(n).split('').map(Number); }
    // ONE PART PER PLACE, zeros included (§2.4 rule 1): the box count never tells the pupil how
    // many non-zero parts there are, and the key writes the zero part.
    const parts = ds.map((d, i) => d * 10 ** (ds.length - 1 - i));
    if (skill === 'expand') {
        q.text = `Write ${fmt(n)} in expanded form.`;
        q.printText = q.text;
        q.answerType = 'interactive';
        q.interactiveType = 'expanded';
        q.expandedNumber = n;
        q.expandedDigits = ds.slice();
        q.expandedValues = parts.slice();
        q.expandedPlaceIdx = ds.map((_, i) => ds.length - 1 - i);
        q.ans = parts.map(fmt).join(' + ');
        q.printAnswer = q.ans;
        q.options = [];
        q.visual = '';
        q.hint = 'Write what each digit is worth. A zero holds a place: its part is 0.';
        q.skillLabel = 'Expanded Form';
        q.pv = { kind: 'expand', n, parts };
        setCell(q, { kind: 'expand', n, parts, keyValue: q.ans });
        return;
    }
    // combine: the non-zero parts only, so 300 + 5 makes the pupil supply the 0 digit (M-V7).
    let shown = parts.filter(p => p !== 0);
    if (o.order === 'scrambled' && shown.length > 1) {
        const inOrder = shown.join();
        for (let t = 0; t < 8 && shown.join() === inOrder; t++) shown = shuffle(shown.slice());
        if (shown.join() === inOrder) shown = shown.slice().reverse();
    }
    const expr = shown.map(fmt).join(' + ');
    q.text = `${expr} = ?`;
    q.printText = 'Write the number.';
    q.ans = n;
    q.answerType = 'number';
    q.options = [];
    q.visual = `<div style="text-align:center;font-size:1.6em;font-weight:700;color:#000;">${expr} =</div>`;
    q.hint = 'Add the parts. A place with no part gets a 0.';
    q.skillLabel = 'Standard Form';
    q.pv = { kind: 'combine', n, parts: shown };
    setCell(q, { kind: 'frame', frame: `${expr} = ____` });
}

function genMoreLess(q, skill, o) {
    const step = Number(o.step) || (skill === 'more_less_100' ? 100 : 1);
    const dir = o.dir === 'both' ? (slot(2) === 0 ? 'more' : 'less') : (o.dir || 'more');
    const cap = capOf('placevalue', skill, o, 100);
    // Support is its own control (P-1): a hundreds chart (more_less_10 only), a number line, or
    // nothing. It changes the picture, never the numbers dealt, except that the chart starts at 1,
    // so an item drawn on it never asks for an answer of 0.
    const support = o.support === 'chart' && skill === 'more_less_10' ? 'chart' : o.support === 'line' ? 'line' : 'none';
    // The band caps BOTH the given number and the answer (§2.1). 2.NBT.B.8 keeps the hundreds
    // step to 100-900.
    const nLo = skill === 'more_less_100' ? 100 : (dir === 'less' ? step + (support === 'chart' ? 1 : 0) : 0);
    const nHi = skill === 'more_less_100' ? Math.min(900, cap - (dir === 'more' ? step : 0))
        : (dir === 'more' ? cap - step : cap);
    let n;
    const edge = slot(6) === 2;
    const candidates = [];
    if (edge) {
        // Crossing (M-L2 / M-L3): 29 + 1, 70 - 1, 95 + 10, 104 - 10 — the digit to the left changes too.
        for (let v = Math.max(nLo, 1); v <= nHi; v++) {
            const next = dir === 'more' ? v + step : v - step;
            if (Math.floor(next / (step * 10)) !== Math.floor(v / (step * 10))) candidates.push(v);
        }
    }
    n = candidates.length ? candidates[randInt(0, candidates.length - 1)] : randInt(Math.max(nLo, 1), Math.max(Math.max(nLo, 1), nHi));
    const ans = dir === 'more' ? n + step : n - step;
    q.text = `What is ${step} ${dir} than ${fmt(n)}?`;
    q.printText = `${step} ${dir} than ${fmt(n)} is ____.`;
    q.ans = ans;
    q.answerType = 'number';
    q.options = [];
    q.visual = '';
    q.hint = step === 1 ? `Count ${dir === 'more' ? 'on' : 'back'} one.`
        : `Only the ${PLACE_WORD[step]} digit changes, unless it goes past 9 or below 0.`;
    q.skillLabel = skill === 'more_less_100' ? '10 or 100 More or Less' : '1 or 10 More or Less';
    q.pv = { kind: 'moreless', n, step, dir, support };
    const base = { keyValue: q.ans, kind: 'frame', frame: q.printText };
    if (support === 'chart') {
        const rows = hundredsWindow(n, ans, cap);
        q.visual = `<div style="text-align:center;">${hundredsRowsHTML(rows[0], rows[1], { size: '1.05em' })}</div>`;
        q.hint = step === 1 ? `Find ${fmt(n)} on the chart. Move one box ${dir === 'more' ? 'right' : 'left'}.`
            : `Find ${fmt(n)} on the chart. Move one row ${dir === 'more' ? 'down' : 'up'}.`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'hchart', rows, base } };
        q.printFormat = 'pv-cell';
    } else if (support === 'line') {
        const line = moreLessLine(n, step);
        q.visual = `<div style="text-align:center;">${pvLineSVG({ ticks: line.ticks, labels: line.labels, lengthMm: 110, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = `Each jump on the line is ${step}. Jump once ${dir === 'more' ? 'to the right' : 'to the left'} from ${fmt(n)}.`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'line', ticks: line.ticks, labels: line.labels, base } };
        q.printFormat = 'pv-cell';
    } else {
        setCell(q, { kind: 'frame', frame: q.printText });
    }
}

function diskCounts(places, o) {
    const zero = o.zeroPlace === 'some' && slot(2) === 1 && places.length >= 2;
    const nine = slot(3) === 0;
    const ds = digitsNumber(places.length, { zero, nine });
    const counts = {};
    places.forEach((p, i) => { counts[p] = ds[i]; });
    return { counts, n: fromDigits(ds) };
}

function genDisks(q, skill, o) {
    const cap = Math.min(capOf('placevalue', skill, o, 999), skill === 'pv_disks_build' ? 999 : 9999);
    const [, hi] = digitSpan(cap);
    const nd = String(hi).length;
    const places = Array.from({ length: nd }, (_, i) => 10 ** (nd - 1 - i));
    let { counts, n } = diskCounts(places, o);
    for (let t = 0; t < 20 && n > hi; t++) ({ counts, n } = diskCounts(places, o));
    if (n > hi) { n = randInt(10 ** (nd - 1), hi); String(n).split('').forEach((d, i) => { counts[places[i]] = Number(d); }); }
    const screenMat = (withCounts) => diskMatSVG({ places, counts: withCounts ? counts : null, size: 'M', pxPerMm: SCREEN_PX_PER_MM }).svg;
    if (skill === 'pv_disks_build') {
        const parts = places.map(p => `${counts[p]} ${counts[p] === 1 ? PLACE_ONE[p] : PLACE_WORD[p]}`);
        q.text = `Build the number ${fmt(n)} on the place value mat.`;
        q.printText = `Draw ${fmt(n)} with place-value disks.`;
        q.target = n;
        q.places = places.slice();
        q.ans = n;
        q.printAnswer = parts.join(', ');
        q.answerType = 'pv-build';
        q.options = [];
        q.visual = '';
        q.hint = 'Look at each digit. Draw that many disks in its place. A zero place stays empty.';
        q.skillLabel = 'Draw Place-Value Disks';
        q.pv = { kind: 'build', n, places: places.slice() };
        setCell(q, { kind: 'build', n, places: places.slice(), counts: { ...counts }, keyValue: q.printAnswer });
        return;
    }
    const task = o.task === 'count' ? 'count' : 'read';
    q.visual = `<div style="text-align:center;">${screenMat(true)}</div>`;
    q.options = [];
    q.answerType = 'number';
    q.skillLabel = 'Read Place-Value Disks';
    if (task === 'count') {
        const withSome = places.filter(p => counts[p] > 0);
        const place = withSome[slot(withSome.length)];
        q.text = `How many ${PLACE_WORD[place]} disks are there?`;
        q.printText = q.text;
        q.ans = counts[place];
        q.hint = `Count only the disks in the ${PLACE_WORD[place]} zone.`;
        q.pv = { kind: 'disks', task, places: places.slice(), counts: { ...counts }, n, place };
    } else {
        q.text = 'What number do the disks show?';
        q.printText = 'Write the number the disks show.';
        q.ans = n;
        q.hint = 'Count the disks in each zone. Write that digit in its place. An empty zone is a 0.';
        q.pv = { kind: 'disks', task, places: places.slice(), counts: { ...counts }, n };
    }
    setCell(q, { kind: 'disks', task, places: places.slice(), counts: { ...counts }, place: q.pv.place });
}

function genTimesTen(q, skill, o) {
    const op = o.op === '/' ? '/' : 'x';
    let powers = (Array.isArray(o.power) && o.power.length ? o.power : [10]).map(Number).filter(p => [10, 100, 1000].includes(p));
    if (!powers.length) powers = [10];
    powers.sort((a, b) => a - b);
    const power = powers[slot(powers.length)];
    const cap = capOf('placevalue', skill, o, 10000);
    const kMax = Math.max(1, Math.floor(cap / power));
    let n, ans;
    if (o.decimals && op === 'x') {
        // Level 5: one decimal place, shifted left past the point (5.NBT.A.2).
        const tenths = randInt(11, Math.max(11, Math.min(999, kMax * 10 - 1)));
        n = tenths / 10;
        ans = +(n * power).toFixed(4);
    } else if (o.decimals) {
        n = randInt(Math.min(11, kMax * power), Math.max(11, Math.min(kMax * power, 999)));
        ans = +(n / power).toFixed(4);
    } else {
        // Whole numbers: × keeps the product in the band; ÷ divides a multiple of the power.
        // Two items in three come from the band's top digit span, so a bigger band really deals
        // bigger numbers (Numbers to 1,000,000 with x 10: 12,345 x 10); the third is a one-digit
        // number, the easy anchor.
        let k;
        if (kMax >= 10 && slot(3) !== 0) {
            const [a, b] = digitSpan(kMax);
            const kLo = Math.max(10, a);
            k = randInt(kLo, Math.max(kLo, b));
        } else k = randInt(1, Math.min(kMax, 9));
        if (op === 'x') { n = k; ans = k * power; } else { n = k * power; ans = k; }
    }
    const glyph = op === 'x' ? '×' : '÷';
    q.text = `${fmt(n)} ${glyph} ${fmt(power)} = ?`;
    q.printText = `${fmt(n)} ${glyph} ${fmt(power)} = ____`;
    q.ans = ans;
    q.answerType = 'number';
    q.options = [];
    q.visual = Number.isInteger(n) ? `<div style="text-align:center;">${numeralTracksHTML(n)}</div>` : '';
    q.hint = op === 'x' ? 'Each digit moves to the left, one place for each zero.' : 'Each digit moves to the right, one place for each zero.';
    q.skillLabel = 'Multiply and Divide by 10, 100, 1,000';
    q.pv = { kind: 'x10', n, op, power };
    setCell(q, { kind: 'frame', n, showNumeral: Number.isInteger(n), frame: q.printText });
}

/* =========================================================================== ROUNDING */

const roundTo = (n, P) => Math.floor((n + P / 2) / P) * P;   // halfway rounds up (owner ruling 6)

/**
 * The number to round. `kind`: 'mid' (exactly halfway), 'across' (rounds up into the next place:
 * 96 -> 100, 951 -> 1,000), 'zero' (a zero in the deciding place: 305 -> 300), or 'plain'.
 * Never a multiple of the place (the "already rounded" guard), never below the place's floor.
 */
function roundNumber(P, cap, kind, avoidMid) {
    const lo = P + 1;
    const pickIn = (a, b) => randInt(Math.min(a, b), Math.max(a, b));
    if (kind === 'mid') {
        const mMax = Math.max(1, Math.floor((cap - P / 2) / P));
        return pickIn(1, mMax) * P + P / 2;
    }
    if (kind === 'across') {
        const jMax = Math.max(1, Math.floor((cap + P / 2) / (10 * P)));
        const j = pickIn(1, jMax);
        const n = j * 10 * P - pickIn(1, P / 2 - (avoidMid ? 1 : 0));
        if (n >= lo && n <= cap) return n;
    }
    if (kind === 'zero' && P >= 100) {
        const mMax = Math.max(1, Math.floor(cap / P) - 1);
        const n = pickIn(1, mMax) * P + pickIn(1, P / 10 - 1);
        if (n >= lo && n <= cap) return n;
    }
    for (let t = 0; t < 60; t++) {
        const n = pickIn(lo, cap);
        if (n % P === 0) continue;
        if (n % P === P / 2) continue;       // a plain item is never halfway: halfway is dealt
        return n;
    }
    return lo + 1;
}

function dealRoundKind(o) {
    if (o.midpoint === 'only') return 'mid';
    const k = slot(6);
    if (k === 1 && o.midpoint !== 'never') return 'mid';
    if (k === 3) return 'across';
    if (k === 5) return 'zero';
    return 'plain';
}

function genNearest(q, skill, o) {
    const P = pvRoundPlace(skill, o);
    const cap = capOf('number_sense', skill, o, P * 10);
    const name = `the nearest ${fmt(P)}`;
    if (o.response === 'circle-all') {
        // RN-10: eight printed numbers, three to five of them round to T, with the near misses
        // either side of halfway (349 / 350 / 449 / 450 for 400).
        const tMin = P * 1;
        const tMax = Math.max(tMin, Math.floor((cap - P / 2) / P) * P);
        const T = randInt(tMin / P, tMax / P) * P;
        const inside = new Set([T - P / 2, T + P / 2 - 1]);
        const outside = new Set([T - P / 2 - 1, T + P / 2]);
        const want = 3 + slot(3);
        for (let t = 0; inside.size < want && t < 60; t++) {
            const v = randInt(T - P / 2, T + P / 2 - 1);
            if (v !== T && v > 0) inside.add(v);
        }
        for (let t = 0; inside.size + outside.size < 8 && t < 80; t++) {
            const v = randInt(Math.max(1, T - P * 2), Math.min(cap, T + P * 2));
            if (roundTo(v, P) !== T && v % P !== 0) outside.add(v);
        }
        const tiles = [...inside, ...outside].filter(v => v > 0 && v <= cap).sort((a, b) => a - b);
        const opts = tiles.map((v, i) => ({ id: 'opt' + i, label: fmt(v), correct: roundTo(v, P) === T }));
        q.text = `Circle every number that rounds to ${fmt(T)} (${name}).`;
        q.printText = q.text;
        q.options = opts;
        q.ans = opts.filter(x => x.correct).map(x => x.id);
        q.printAnswer = opts.filter(x => x.correct).map(x => x.label).join(', ');
        q.answerType = 'multi-select-check';
        q.visual = '';
        q.hint = 'Find the two halfway numbers. Halfway rounds up.';
        q.skillLabel = `Round to ${fmt(P)}`;
        q.pv = { kind: 'circle', place: P, target: T, tiles };
        setCell(q, { kind: 'circle', target: T, tiles: opts.map(x => x.label), correct: opts.filter(x => x.correct).map(x => x.label), keyValue: q.printAnswer });
        return;
    }
    const kind = dealRoundKind(o);
    const n = roundNumber(P, cap, kind, o.midpoint === 'never');
    const lower = Math.floor(n / P) * P;
    q.text = `Round ${fmt(n)} to ${name}.`;
    q.printText = q.text;
    q.ans = roundTo(n, P);
    q.answerType = 'number';
    q.options = [];
    q.skillLabel = `Round to ${fmt(P)}`;
    q.pv = { kind: 'round', n, place: P, deal: kind };
    const support = o.support || 'cut';
    if (support === 'line') {
        q.visual = `<div style="text-align:center;">${roundingLineSVG({ lo: lower, hi: lower + P, n, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = `Is ${fmt(n)} nearer the left end or the right end? Halfway rounds up.`;
        setCell(q, { kind: 'round', n, place: P, support: 'line', lo: lower, hi: lower + P });
    } else if (support === 'none') {
        q.visual = '';
        q.hint = `Look at the digit after the ${PLACE_WORD[P]} place. 5 or more rounds up.`;
        setCell(q, { kind: 'round', n, place: P, support: 'none' });
    } else {
        const strip = numeralTracksHTML(n, { cut: P, arrow: true });
        q.visual = `<div style="text-align:center;">${strip}</div>`;
        q.hint = 'Look at the digit after the cut line. 5 or more rounds up.';
        setCell(q, { kind: 'round', n, place: P, support: 'cut' });
    }
}

function genRoundingVisual(q, skill, o) {
    const P = Number(o.place) || 10;
    // The band grows to fit the place ("to the nearest 1,000" needs numbers to 10,000).
    const cap = capOf('number_sense', skill, o, 100);
    const kind = dealRoundKind(o);
    const n = roundNumber(P, cap, kind, o.midpoint === 'never');
    const lower = Math.floor(n / P) * P;
    q.text = `Round ${fmt(n)} to the nearest ${fmt(P)}.`;
    q.printText = q.text;
    q.ans = roundTo(n, P);
    q.answerType = 'number';
    q.options = [];
    q.visual = `<div style="text-align:center;">${roundingLineSVG({ lo: lower, hi: lower + P, n, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
    q.hint = `Mark ${fmt(n)} on the line. Is it nearer the left end or the right end? Halfway rounds up.`;
    q.skillLabel = 'Round on a Number Line';
    q.pv = { kind: 'round', n, place: P, deal: kind, line: [lower, lower + P] };
    setCell(q, { kind: 'round', n, place: P, support: 'line', lo: lower, hi: lower + P });
}

const SORT_PLACE = { round_sort_10: 10, round_sort_100: 100, round_sort_1000: 1000, round_sort_10000: 10000,
    round_sort_100000: 100000, round_sort_million: 1000000, round_sort_tenths: 0.1, round_sort_hundredths: 0.01 };

function genRoundSort(q, skill, o) {
    const P = SORT_PLACE[skill];
    const dec = P === 0.1 ? 1 : P === 0.01 ? 2 : 0;
    // Work in whole units: for a decimal sort one unit is one digit past the bins (0.01 for a
    // tenths sort), so the place is always 10 units and halfway is 5.
    const unit = dec ? 10 ** -(dec + 1) : 1;
    const Pu = dec ? 10 : P;
    const cap = dec ? Infinity : capOf('number_sense', skill, o, P * 10);
    // The bins: two neighbouring multiples, the upper one inside the band.
    const mMin = dec ? (dec === 1 ? 1 : 40) : 1;
    const mMax = dec ? (dec === 1 ? 8 : 95) : Math.max(1, Math.floor(cap / P) - 1);
    const Lu = randInt(mMin, Math.max(mMin, mMax)) * Pu;
    const mid = Lu + Pu / 2;
    const count = Number(o.tiles) === 8 ? 8 : 6;
    const nLow = count / 2;                          // an even split, dealt - never rolled
    const low = new Set(), high = new Set();
    if (o.midpoint !== 'never') high.add(mid);       // halfway, in every set (midpoint-seeded)
    for (let t = 0; low.size < nLow && t < 80; t++) low.add(randInt(Lu + 1, mid - 1));
    for (let t = 0; high.size < count - nLow && t < 80; t++) high.add(randInt(mid, Lu + Pu - 1));
    const units = shuffle([...low, ...high]);
    const val = (u) => dec ? +(u * unit).toFixed(dec + 1) : u;
    const label = (u, d) => dec ? (u * unit).toFixed(d) : fmt(u);
    const place = dec ? (dec === 1 ? 'tenth' : 'hundredth') : PLACE_ONE[P];
    const isLow = (u) => u < mid;
    const ans = {};
    units.forEach((u, i) => { ans['t' + i] = isLow(u) ? 'bin_low' : 'bin_high'; });
    q.text = `Sort the numbers by what they round to (nearest ${place}).`;
    q.printText = `Write each number under what it rounds to (nearest ${place}).`;
    q.ans = ans;
    q.answerType = 'dnd-generic';
    q.dndMode = 'categorize';
    q.tiles = units.map((u, i) => ({ id: 't' + i, label: label(u, dec + 1) }));
    q.bins = [{ id: 'bin_low', label: label(Lu, dec) }, { id: 'bin_high', label: label(Lu + Pu, dec) }];
    q.options = [];
    q.visual = '';
    q.hint = 'Find the halfway number between the two. Halfway rounds up.';
    q.skillLabel = `Sort: nearest ${place}`;
    const lows = units.filter(isLow).map(u => label(u, dec + 1));
    const highs = units.filter(u => !isLow(u)).map(u => label(u, dec + 1));
    q.printAnswer = `${q.bins[0].label}: ${lows.join(', ')} · ${q.bins[1].label}: ${highs.join(', ')}`;
    const support = o.support === 'line' ? 'line' : 'none';
    q.pv = { kind: 'sort', place: P, tiles: units.map(val), bins: [val(Lu), val(Lu + Pu)], support };
    const base = {
        kind: 'sort', bank: q.tiles.map(t => t.label), bins: q.bins.map(b => `rounds to ${b.label}`),
        rows: count / 2 + 1, sorted: [lows, highs], keyValue: q.printAnswer,
    };
    if (support === 'line') {
        // The number line from one bin to the other: eleven ticks, only the two ends labelled, so
        // the pupil places each number and sees which end it is nearer. Halfway is not labelled.
        const labels = { 0: q.bins[0].label, 10: q.bins[1].label };
        q.visual = `<div style="text-align:center;">${pvLineSVG({ ticks: 11, labels, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = 'Find each number on the line. Is it nearer the left end or the right end? Halfway rounds up.';
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'line', ticks: 11, labels, base: { keyValue: q.printAnswer, ...base } } };
        q.printFormat = 'pv-cell';
    } else {
        setCell(q, base);
    }
}

/* =========================================================================== entry points */

const PV_IDS = new Set(['identify', 'value', 'expand', 'combine', 'more_less_10', 'more_less_100',
    'place_value_disks', 'pv_disks_build', 'place_value_10x']);
const ROUND_IDS = new Set(['rounding_visual', 'nearest_10', 'nearest_100', 'nearest_1000', 'nearest_10000',
    'nearest_100000', 'nearest_million', ...Object.keys(SORT_PLACE)]);

/** Place value ids rewritten in P9. Returns true when the item was generated (or refused) here. */
export function generatePvPlaceValue(q, skill) {
    if (!PV_IDS.has(skill)) return false;
    beginItem();
    const o = optsOf('placevalue', skill);
    if (refuse(q, 'placevalue', skill, o)) return true;
    if (skill === 'identify' || skill === 'value') genPlace(q, skill, o);
    else if (skill === 'expand' || skill === 'combine') genExpandCombine(q, skill, o);
    else if (skill === 'more_less_10' || skill === 'more_less_100') genMoreLess(q, skill, o);
    else if (skill === 'place_value_disks' || skill === 'pv_disks_build') genDisks(q, skill, o);
    else if (skill === 'place_value_10x') genTimesTen(q, skill, o);
    return true;
}

/** Rounding ids rewritten in P9. Returns true when the item was generated (or refused) here. */
export function generatePvRounding(q, skill) {
    if (!ROUND_IDS.has(skill)) return false;
    beginItem();
    const o = optsOf('number_sense', skill);
    if (refuse(q, 'number_sense', skill, o)) return true;
    if (skill === 'rounding_visual') genRoundingVisual(q, skill, o);
    else if (SORT_PLACE[skill]) genRoundSort(q, skill, o);
    else genNearest(q, skill, o);
    return true;
}

/** The digit span of a band, for the older branches in gen-algebraic.js that now bind to it. */
export function pvSpan(categoryId, skillId, fallbackBand) {
    const o = optsOf(categoryId, skillId);
    return digitSpan(capOf(categoryId, skillId, o, fallbackBand));
}
export { refuse as pvRefuse, optsOf as pvOptions };
