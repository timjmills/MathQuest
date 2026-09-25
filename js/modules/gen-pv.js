// gen-pv.js — P9: place value, rounding and estimation (design/research/place-value-rounding.md, §19.4 steps 2-8)
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
//     chosen"). Round-3 direction: a stand-alone skill OWNS its numbers — its band is its range
//     whatever Max Number says, and it is never refused. Only a member of a mixed review is capped
//     by the review's Max Number, and left out when that cannot host its place (q.refused;
//     generateQuestionFor() returns null).
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
import { normalizeOptions, pvRefusal, pvRoundPlace, pvCap, pvBand, ROUND_NL } from './skill-options.js';
import { diskMatSVG, numeralTracksHTML, roundingLineSVG } from './sheet/index.js';
import { plainNumeralHTML, placeChartHTML, hundredsRowsHTML, hundredsWindow, pvLineSVG, moreLessLine, stripHTML, shiftChartHTML, roundingTableHTML } from './pv-support-cell.js';
import { pvRoundingErrors } from './sheet/providers/pv.js';

const PLACE_WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions',
    0.1: 'tenths', 0.01: 'hundredths', 0.001: 'thousandths' };
const PLACE_ONE = { 1: 'one', 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million',
    0.1: 'tenth', 0.01: 'hundredth', 0.001: 'thousandth' };

/* ----------------------------------------------------- decimal places (vis_pv_decimal_places) */

const DEC_PLACES = [0.1, 0.01, 0.001];
/** The decimal places a skill's `decimals` option asks for (0: whole numbers, the band decides). */
const decOf = (o) => ([1, 2, 3].includes(Number(o && o.decimals)) ? Number(o.decimals) : 0);
/** A value rounded to its decimal places (0.1 * 4 is 0.4, never 0.4000000000000001). */
const dround = (v, d = 6) => Number(Number(v).toFixed(d));
/**
 * A decimal of `d` places: ONE whole digit, or 0 (within 1) on one item in three; every decimal
 * digit 1-9, except a zero in a middle place when asked (never the last: 3.40 would print as
 * 3.4). Returns the string (it keeps the places), the number, and its digits by place.
 */
function decimalNumber(d, { zero = false, whole = null, fr: given = null } = {}) {
    const w = whole !== null ? whole : (slot(3) === 0 ? 0 : randInt(1, 9));
    const fr = given ? given.slice() : Array.from({ length: d }, () => randInt(1, 9));
    if (!given && zero && d >= 2) fr[randInt(0, d - 2)] = 0;
    const s = `${w}.${fr.join('')}`;
    const digits = { 1: w };
    fr.forEach((dg, j) => { digits[DEC_PLACES[j]] = dg; });
    return { s, n: Number(s), w, fr, digits, places: [1, ...DEC_PLACES.slice(0, d)] };
}
const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 6 });
const SCREEN_PX_PER_MM = 3.2;

/* --------------------------------------------------------------------------- dealing */

// The item's position on its page. The print pipeline and the audit pass the KEPT index; live
// play has none and falls back to its own cursor. Fixed once per question (see gen-counting.js
// _kBeginItem for why a per-deal cursor goes wrong).
let _liveCursor = -1;
let _at = 0;
function beginItem() { _at = Number.isFinite(state.itemIndex) ? state.itemIndex : ++_liveCursor; }
const slot = (n) => ((_at % n) + n) % n;
/**
 * The order of 0 .. L-1 for the current block of L items: each block takes every value once, the
 * order changes from block to block (a fixed mixing, no Math.random, so a seed reprints a page).
 */
function blockOrder(L) {
    const block = Math.floor(_at / Math.max(1, L));
    const key = (i) => ((i + 1) * 7919 + (block + 3) * 104729 + (i + 1) * (block + 5) * 31) % 257;
    return Array.from({ length: L }, (_, i) => i).sort((a, b) => key(a) - key(b) || a - b);
}

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
    // A stand-alone skill OWNS its numbers (round-3 direction): its band option (floored by its
    // place) is its range on every surface — print, worksheet, quiz and card — whatever Max Number
    // says ("Round to the nearest 1,000" printed blank pages at Max Number 1,000). Only a member
    // of a mixed review, which has no band of its own, is capped by the review's Max Number.
    return inReview(skill) ? pvCap(pvBand(cat, skill, o, fallback), state.range, true) : pvBand(cat, skill, o, fallback);
}
/** A number bound read off Max Number: the review's cap for a review member, else the bound itself. */
const rangeCap = (skill, v) => (inReview(skill) ? pvCap(v, state.range, true) : v);

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
const idxOf = (place, len) => len - 1 - Math.round(Math.log10(place));
const plural = (word, d) => (d === 1 ? word.replace(/s$/, '') : word);

/**
 * An inline-blanks item for the screen (one input per ___, left to right, SP one input per slot).
 * `sets` are the accepted answer rows; the first is the key.
 */
function inlineBlanks(q, text, sets, widths) {
    q.text = text;
    q.answerType = 'inline-blanks';
    q.inlineBlanksData = { acceptedSets: sets.map(r => r.map(String)), cellWidths: widths || sets[0].map(v => Math.max(2, String(v).length + 1)) };
    q.keyParts = sets[0].map(String);
    q.options = [];
}

function genPlace(q, skill, o) {
    if (skill === 'value' && decOf(o)) { genDecimalValue(q, o); return; }
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
        if (t.length && t.length < PV_ALL_PLACES.length) ticked = t.filter(p => p < 10 * hi || rangeCap(skill, p * 10 - 1) >= p);
    }
    if (!ticked.length) ticked = bandPlaces;
    // Every place once per block of items, but in a different order each block, so the answers
    // never run ones, tens, hundreds, ones, tens ... down the page (round-3 finding).
    let place = ticked[blockOrder(ticked.length)[slot(ticked.length)]];
    if (place > hi) { lo = place; hi = place * 10 - 1; nd = String(hi).length; }
    // PN-7: the value of a zero, on about a third of items. A zero is never the leading digit, so
    // a leading place hands its zero to a lower place.
    const zeroAsk = skill === 'value' && !!o.zeroDigit && nd >= 2 && slot(3) === 1;
    if (zeroAsk && place >= 10 ** (nd - 1)) place = 10 ** (_at % (nd - 1));
    // PN-5: a repeated digit (747: which 7?), only when asked; otherwise the asked digit appears
    // once, so "the underlined digit" and "the 7" never mean two different digits.
    const repeat = skill === 'identify' && !!o.repeatDigit && nd >= 2;
    let n = 0;
    for (let t = 0; t < 160; t++) {
        n = spanNumber(lo, hi);
        if (n < place) continue;
        const s = String(n);
        const i = idxOf(place, s.length);
        if (zeroAsk) {
            if (i <= 0) continue;
            const ds = s.split(''); ds[i] = '0';
            const m = Number(ds.join(''));
            if (m >= lo && m <= hi) { n = m; break; }
            continue;
        }
        const dg = s[i];
        if (dg === '0') continue;
        const cnt = s.split('').filter(c => c === dg).length;
        if (repeat) {
            if (cnt >= 2) break;
            const others = [...Array(s.length).keys()].filter(j => j !== i);
            const ds = s.split(''); ds[others[randInt(0, others.length - 1)]] = dg;
            const m = Number(ds.join(''));
            if (m >= lo && m <= hi && m >= place) { n = m; break; }
            continue;
        }
        if (cnt === 1) break;
    }
    const s = String(n);
    const digit = Number(s[idxOf(place, s.length)]);
    // Place-value support (a separate control, P-1): the chart names every place, the letters
    // (the `pv` template's own numeral) remind, and "none" leaves the digit's position to read.
    const support = o.support === 'chart' || o.support === 'none' ? o.support : 'labels';
    const drawNumeral = (opt) => support === 'chart' ? placeChartHTML(n, opt)
        : support === 'none' ? plainNumeralHTML(n, opt) : numeralTracksHTML(n, opt);
    const numeralVis = `<div style="text-align:center;">${drawNumeral({ underline: place })}</div>`;
    q.visual = numeralVis;
    const readHint = support === 'chart' ? 'Read the place name above the underlined digit.'
        : support === 'none' ? 'Count the places from the right: ones, tens, hundreds, thousands.'
            : 'Read the letter above the underlined digit.';
    const cellFor = (payload) => {
        if (support === 'labels') { setCell(q, payload); return; }
        q.cell = { template: 'pv-support', v: 1, payload: { picture: support === 'chart' ? 'chart' : 'plain', n, place,
            base: { keyValue: q.ans, ...payload, hideNumeral: true } } };
        q.printFormat = 'pv-cell';
    };
    if (skill === 'identify') {
        // Three printed place words to ring at up to 999 (PN-1 prints all three even for a 2-digit
        // number); above that, one word per place the number has.
        const allPlaces = Array.from({ length: nd }, (_, i) => 10 ** i);
        const words = (nd <= 3 ? [1, 10, 100] : allPlaces).map(p => PLACE_WORD[p]);
        q.ans = PLACE_WORD[place];
        q.hint = readHint;
        q.skillLabel = 'Name the Place';
        if (o.response === 'bank') {
            // PN-4: the words move to a bank; the pupil copies one onto the line (a production
            // item on paper stays a typed word on screen, never a choice).
            q.text = 'Write the place of the underlined digit.';
            q.printText = q.text;
            q.answerType = 'text';
            q.options = [];
            q.acceptedAnswers = [PLACE_WORD[place], PLACE_WORD[place].replace(/s$/, '')];
            q.wordBank = words.slice();
            q.visual = `${numeralVis}<div class="pv-bank" style="margin:8px auto 0;display:table;border:2px solid #000;border-radius:10px;`
                + `padding:4px 14px;font-weight:700;color:#000;">${words.join('&nbsp;&nbsp;&nbsp;')}</div>`;
            q.pv = { kind: 'place', n, place, digit, support, response: 'bank', repeat };
            cellFor({ kind: 'place-bank', n, place, words, keyValue: q.ans });
            return;
        }
        q.text = 'Which place is the underlined digit in?';
        q.printText = 'Circle the place of the underlined digit.';
        q.answerType = 'multiple-choice';
        q.options = words;
        q.pv = { kind: 'place', n, place, digit, support, response: 'circle', repeat };
        cellFor({ kind: 'place', n, place, words });
        return;
    }
    const form = o.form === 'unit' || o.form === 'notation' ? o.form : 'value';
    q.skillLabel = 'Value of a Digit';
    q.hint = `${readHint} That place tells you what the digit is worth.`;
    q.printText = 'Write what the underlined digit is worth.';
    q.pv = { kind: 'value', n, place, digit, support, form, zero: digit === 0 };
    if (form === 'value') {
        q.text = 'What is the underlined digit worth?';
        q.ans = digit * place;
        q.answerType = 'number';
        q.options = [];
        cellFor({ kind: 'value', n, place, frame: 'worth ____' });
        return;
    }
    // PN-8: the same value in unit form (7 hundreds) or expanded notation (7 x 100). Two slots.
    const word = PLACE_WORD[place];
    if (form === 'unit') {
        inlineBlanks(q, 'The underlined digit is worth ___ ___.', [[digit, word], [digit, plural(word, digit)], [digit, word.replace(/s$/, '')]], [2, 9]);
        q.ans = `${digit} ${plural(word, digit)}`;
        cellFor({ kind: 'blanks', n, place, frame: 'worth ____ ____', keys: [digit, plural(word, digit)], keyValue: q.ans });
    } else {
        inlineBlanks(q, 'The underlined digit is worth ___ × ___.', [[digit, place]], [2, String(place).length + 2]);
        q.ans = `${digit} × ${fmt(place)}`;
        cellFor({ kind: 'blanks', n, place, frame: 'worth ____ × ____', keys: [digit, fmt(place)], keyValue: q.ans });
    }
}

/** value with decimal places: what the underlined tenths / hundredths / thousandths digit is worth. */
function genDecimalValue(q, o) {
    const d = decOf(o);
    // PN-7 carried over: the value of a zero, on about a third of items, in a middle place.
    const zeroAsk = !!o.zeroDigit && d >= 2 && slot(3) === 1;
    const place = zeroAsk ? DEC_PLACES[randInt(0, d - 2)] : DEC_PLACES[blockOrder(d)[slot(d)]];
    let num = decimalNumber(d);
    if (zeroAsk) {
        const fr = num.fr.slice();
        fr[DEC_PLACES.indexOf(place)] = 0;
        num = decimalNumber(d, { whole: num.w, fr });
    }
    const { s, n } = num;
    const digit = num.digits[place];
    const support = o.support === 'chart' || o.support === 'none' ? o.support : 'labels';
    const drawNumeral = (opt) => (support === 'chart' ? placeChartHTML(s, opt) : support === 'none' ? plainNumeralHTML(s, opt) : numeralTracksHTML(s, opt));
    q.visual = `<div style="text-align:center;">${drawNumeral({ underline: place })}</div>`;
    const form = o.form === 'unit' || o.form === 'notation' ? o.form : 'value';
    q.skillLabel = 'Value of a Digit';
    q.hint = support === 'chart' ? 'Read the place name above the underlined digit. That place tells you what the digit is worth.'
        : support === 'none' ? 'Count the places after the point: tenths, hundredths, thousandths.'
            : 'Read the letters above the underlined digit: Tth, Hth or Thth. That place tells you what it is worth.';
    q.printText = 'Write what the underlined digit is worth.';
    q.pv = { kind: 'value', n, s, place, digit, support, form, zero: digit === 0, decimals: d };
    const cellFor = (payload) => {
        if (support === 'labels') { setCell(q, payload); return; }
        q.cell = { template: 'pv-support', v: 1, payload: { picture: support === 'chart' ? 'chart' : 'plain', n: s, place,
            base: { keyValue: q.ans, ...payload, hideNumeral: true } } };
        q.printFormat = 'pv-cell';
    };
    const word = PLACE_WORD[place];
    if (form === 'value') {
        q.text = 'What is the underlined digit worth?';
        q.ans = dround(digit * place, d);
        q.answerType = 'number';
        q.options = [];
        cellFor({ kind: 'value', n: s, place, frame: 'worth ____' });
        return;
    }
    if (form === 'unit') {
        inlineBlanks(q, 'The underlined digit is worth ___ ___.', [[digit, word], [digit, plural(word, digit)], [digit, word.replace(/s$/, '')]], [2, 11]);
        q.ans = `${digit} ${plural(word, digit)}`;
        cellFor({ kind: 'blanks', n: s, place, frame: 'worth ____ ____', keys: [digit, plural(word, digit)], keyValue: q.ans });
    } else {
        inlineBlanks(q, 'The underlined digit is worth ___ × ___.', [[digit, String(place)]], [2, String(place).length + 2]);
        q.ans = `${digit} × ${place}`;
        cellFor({ kind: 'blanks', n: s, place, frame: 'worth ____ × ____', keys: [digit, String(place)], keyValue: q.ans });
    }
}

function wantZero(o) {
    return o.zeroPlace === 'always' || (o.zeroPlace === 'some' && slot(2) === 1);
}

/** Every order of a short list (up to 5 parts; longer lists keep the given order and its reverse). */
function orders(list) {
    if (list.length > 5) return [list, list.slice().reverse()];
    if (list.length <= 1) return [list];
    const out = [];
    list.forEach((x, i) => orders(list.slice(0, i).concat(list.slice(i + 1))).forEach(r => out.push([x].concat(r))));
    return out;
}

function genExpandCombine(q, skill, o) {
    if (skill === 'expand' && decOf(o)) { genDecimalExpand(q, o); return; }
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
    const places = ds.map((_, i) => 10 ** (ds.length - 1 - i));
    if (skill === 'expand') {
        const form = o.form === 'notation' ? 'notation' : 'sum';
        const frame = o.frame === 'line' ? 'line' : 'boxes';
        q.skillLabel = form === 'notation' ? 'Expanded Notation' : 'Expanded Form';
        q.printText = `Write ${fmt(n)} in expanded form.`;
        q.options = [];
        q.visual = '';
        q.hint = form === 'notation' ? 'Write each digit. It is multiplied by its place.'
            : 'Write what each digit is worth. A zero holds a place: its part is 0.';
        q.pv = { kind: 'expand', n, parts, form, frame };
        const term = (d, p) => (form === 'notation' ? `${d} × ${fmt(p)}` : fmt(d * p));
        if (frame === 'line') {
            // EF-7: the frame fades to a ruled line. 300 + 5 and 300 + 0 + 5 are both right, in any
            // order (§2.4 rule 2, owner ruling 4): the key writes the short form and names the other.
            const all = ds.map((d, i) => term(d, places[i]));
            const nonZero = ds.map((d, i) => (d ? term(d, places[i]) : null)).filter(Boolean);
            const accept = new Set();
            for (const list of [nonZero, all]) {
                for (const ord of orders(list)) {
                    accept.add(ord.join(' + '));
                    accept.add(ord.map(x => x.replace(/,/g, '')).join(' + '));
                    accept.add(ord.map(x => x.replace(/,/g, '').replace(/×/g, 'x')).join(' + '));
                }
            }
            q.text = `Write ${fmt(n)} in expanded form.`;
            q.answerType = 'text';
            q.ans = nonZero.join(' + ');
            q.acceptedAnswers = [...accept];
            q.printAnswer = q.ans;
            setCell(q, { kind: 'expand-line', n, keyValue: q.ans, also: all.length !== nonZero.length ? all.join(' + ') : '' });
            return;
        }
        if (form === 'notation') {
            // EF-8: one digit box per place, the place printed after it.
            const frameText = ds.map((_, i) => `____ × ${fmt(places[i])}`).join(' + ');
            inlineBlanks(q, `${fmt(n)} = ${ds.map((_, i) => `___ × ${fmt(places[i])}`).join(' + ')}`, [ds.slice()], ds.map(() => 2));
            q.ans = ds.map((d, i) => term(d, places[i])).join(' + ');
            q.printAnswer = q.ans;
            setCell(q, { kind: 'blanks', n, frame: `${fmt(n)} = ${frameText}`, keys: ds.slice(), keyValue: q.ans, bigNumerals: true });
            return;
        }
        q.text = `Write ${fmt(n)} in expanded form.`;
        q.answerType = 'interactive';
        q.interactiveType = 'expanded';
        q.expandedNumber = n;
        q.expandedDigits = ds.slice();
        q.expandedValues = parts.slice();
        q.expandedPlaceIdx = ds.map((_, i) => ds.length - 1 - i);
        q.ans = parts.map(fmt).join(' + ');
        q.printAnswer = q.ans;
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

/**
 * expand with decimal places (vis_pv_decimal_places): 3.47 = 3 + 0.4 + 0.07, one box per place (a
 * zero place included: 3.07 = 3 + 0 + 0.07); a number within 1 has no whole part (0.47 = 0.4 +
 * 0.07). `form: notation` writes each digit times its place (3 × 1 + 4 × 0.1 + 7 × 0.01); `frame:
 * line` fades the boxes to a ruled line.
 */
function genDecimalExpand(q, o) {
    const d = decOf(o);
    const num = decimalNumber(d, { zero: wantZero(o) });
    const { s, n } = num;
    const places = num.w ? num.places : num.places.slice(1);
    const ds = places.map((p) => num.digits[p]);
    const parts = ds.map((dg, i) => dround(dg * places[i], d));
    const form = o.form === 'notation' ? 'notation' : 'sum';
    const frame = o.frame === 'line' ? 'line' : 'boxes';
    q.skillLabel = form === 'notation' ? 'Expanded Notation' : 'Expanded Form';
    q.printText = `Write ${s} in expanded form.`;
    q.options = [];
    q.visual = '';
    q.hint = form === 'notation' ? 'Write each digit. It is multiplied by its place: 1, 0.1, 0.01.'
        : 'Write what each digit is worth: 0.4 is 4 tenths. A zero holds a place: its part is 0.';
    q.pv = { kind: 'expand', n, s, parts, form, frame, decimals: d, places };
    const term = (dg, p) => (form === 'notation' ? `${dg} × ${p}` : String(dround(dg * p, d)));
    if (frame === 'line') {
        const all = ds.map((dg, i) => term(dg, places[i]));
        const nonZero = ds.map((dg, i) => (dg ? term(dg, places[i]) : null)).filter(Boolean);
        const accept = new Set();
        for (const list of [nonZero, all]) {
            for (const ord of orders(list)) { accept.add(ord.join(' + ')); accept.add(ord.map((x) => x.replace(/×/g, 'x')).join(' + ')); }
        }
        q.text = `Write ${s} in expanded form.`;
        q.answerType = 'text';
        q.ans = nonZero.join(' + ');
        q.acceptedAnswers = [...accept];
        q.printAnswer = q.ans;
        setCell(q, { kind: 'expand-line', n: s, keyValue: q.ans, also: all.length !== nonZero.length ? all.join(' + ') : '' });
        return;
    }
    if (form === 'notation') {
        const frameText = places.map((p) => `____ × ${p}`).join(' + ');
        inlineBlanks(q, `${s} = ${places.map((p) => `___ × ${p}`).join(' + ')}`, [ds.map(String)], ds.map(() => 2));
        q.ans = ds.map((dg, i) => term(dg, places[i])).join(' + ');
        q.printAnswer = q.ans;
        setCell(q, { kind: 'blanks', n: s, frame: `${s} = ${frameText}`, keys: ds.map(String), keyValue: q.ans, bigNumerals: true });
        return;
    }
    // One box per place, in the kit's blanks frame (typed into the same boxes on screen).
    const keys = parts.map(String);
    inlineBlanks(q, `${s} = ${parts.map(() => '___').join(' + ')}`, [keys], keys.map((k) => k.length + 1));
    q.ans = keys.join(' + ');
    q.printAnswer = q.ans;
    setCell(q, { kind: 'blanks', n: s, frame: `${s} = ${parts.map(() => '____').join(' + ')}`, keys, keyValue: q.ans });
}

/** EF-9 / EF-10: unit form, and renaming more than 9 of one place (47 tens, 3 hundreds 15 tens). */
function genUnitForm(q, skill, o) {
    const cap = capOf('placevalue', skill, o, 999);
    const [lo, hi] = digitSpan(cap);
    const nd = String(hi).length;
    let n = spanNumber(lo, hi);
    if (slot(3) === 2 && nd >= 3) {
        // a zero place is content (§2.3): 405 is 4 hundreds 0 tens 5 ones.
        const ds = String(n).split(''); ds[randInt(1, ds.length - 1)] = '0'; n = Number(ds.join(''));
    }
    const ds = String(n).split('').map(Number);
    const places = ds.map((_, i) => 10 ** (ds.length - 1 - i));
    q.skillLabel = 'Unit Form';
    q.options = [];
    q.visual = '';
    q.printText = 'Write the missing number.';
    if (o.rename === 'more') {
        // Renaming, dealt in turn: "476 = __ tens 6 ones" (47), and "3 hundreds 15 tens = __".
        const big = places[0];
        if (slot(2) === 0 && ds.length >= 3) {
            const unit = 10;                               // rename everything above the ones as tens
            const count = Math.floor(n / unit);
            const ones = n % unit;
            q.text = `${fmt(n)} = ___ tens ${ones} ${plural('ones', ones)}`;
            q.ans = count;
            q.answerType = 'number';
            q.hint = 'Every hundred is 10 tens. Count all the tens.';
            q.pv = { kind: 'unit', n, rename: true, counts: { 10: count, 1: ones } };
            setCell(q, { kind: 'frame', frame: `${fmt(n)} = ____ tens ${ones} ${plural('ones', ones)}`, keyValue: count, words: true });
            return;
        }
        // a hundreds (or tens) count plus 10-19 of the next place down.
        const hiP = Math.max(10, big);
        const loP = hiP / 10;
        const a = randInt(1, Math.max(1, Math.min(8, Math.floor((hi - 19 * loP) / hiP))));
        const b = randInt(10, 19);
        const total = a * hiP + b * loP;
        const wa = PLACE_WORD[hiP], wb = PLACE_WORD[loP];
        q.text = `${a} ${plural(wa, a)} ${b} ${wb} = ___`;
        q.ans = total;
        q.answerType = 'number';
        q.hint = `Ten ${wb} make one ${PLACE_ONE[hiP]}.`;
        q.pv = { kind: 'unit', n: total, rename: true, counts: { [hiP]: a, [loP]: b } };
        setCell(q, { kind: 'frame', frame: `${a} ${plural(wa, a)} ${b} ${wb} = ____`, keyValue: total, words: true });
        return;
    }
    const words = places.map(p => PLACE_WORD[p]);
    const text = `${fmt(n)} = ${words.map(w => `___ ${w}`).join(' ')}`;
    inlineBlanks(q, text, [ds.slice()], ds.map(() => 2));
    q.ans = ds.map((d, i) => `${d} ${words[i]}`).join(' ');
    q.printAnswer = q.ans;
    q.hint = 'Each digit tells how many of its place. A zero means none of that place.';
    q.pv = { kind: 'unit', n, rename: false, counts: Object.fromEntries(places.map((p, i) => [p, ds[i]])) };
    setCell(q, { kind: 'blanks', n, frame: `${fmt(n)} = ${words.map(w => `____ ${w}`).join(' ')}`, keys: ds.slice(), keyValue: q.ans, words: true });
}

function genMoreLess(q, skill, o) {
    // Step 0 is "both jumps the name promises" (1 and 10, or 10 and 100), dealt in turn with the
    // direction so a page of four already carries all four: 1 more, 1 less, 10 more, 10 less.
    const both = skill === 'more_less_100' ? [10, 100] : [1, 10];
    const step = Number(o.step) || both[Math.floor(_at / 2) % 2];
    const dir = o.dir === 'both' ? (slot(2) === 0 ? 'more' : 'less') : (o.dir || 'more');
    const cap = capOf('placevalue', skill, o, 100);
    // Support is its own control (P-1): a strip of the hundreds chart, the chart rows, a number
    // line, or nothing. It changes the picture, never the numbers dealt, except that a chart
    // starts at 1, so an item drawn on it never asks for an answer of 0.
    const support = o.support === 'chart' && skill === 'more_less_10' ? 'chart'
        : o.support === 'line' ? 'line' : o.support === 'strip' ? 'strip' : 'none';
    const onChart = support === 'chart' || (support === 'strip' && step <= 10);
    // The band caps BOTH the given number and the answer (§2.1). 2.NBT.B.8 keeps the hundreds
    // step to 100-900; the 1,000 step (4.NBT) works in 1,000-9,000.
    const big = skill === 'more_less_100';
    const nLo = big ? (step === 1000 ? 1000 : 100) : (dir === 'less' ? step + (onChart ? 1 : 0) : (onChart ? 1 : 0));
    const nHi = big ? Math.min(step === 1000 ? 9000 : 900, cap - (dir === 'more' ? step : 0))
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
    const result = dir === 'more' ? n + step : n - step;
    // ML-7: the unknown START, "47 is 10 more than ____" (the inverse; M-L4).
    const start = o.unknown === 'start';
    const given = start ? result : n;
    const ans = start ? n : result;
    q.text = start ? `${fmt(result)} is ${fmt(step)} ${dir} than ___.` : `What is ${fmt(step)} ${dir} than ${fmt(n)}?`;
    q.printText = start ? `${fmt(result)} is ${fmt(step)} ${dir} than ____.` : `${fmt(step)} ${dir} than ${fmt(n)} is ____.`;
    q.ans = ans;
    q.answerType = 'number';
    q.options = [];
    q.visual = '';
    q.hint = start ? `Think: which number is ${fmt(step)} ${dir === 'more' ? 'less' : 'more'} than ${fmt(result)}?`
        : step === 1 ? `Count ${dir === 'more' ? 'on' : 'back'} one.`
            : `Only the ${PLACE_WORD[step]} digit changes, unless it goes past 9 or below 0.`;
    q.skillLabel = big ? '10, 100 or 1,000 More or Less' : '1 or 10 More or Less';
    q.pv = { kind: 'moreless', n, step, dir, support, unknown: start ? 'start' : 'answer', given };
    const base = { keyValue: q.ans, kind: 'frame', frame: q.printText, slotDigits: String(Math.trunc(cap)).length };
    if (support === 'chart') {
        const rows = hundredsWindow(n, result, cap);
        q.visual = `<div style="text-align:center;">${hundredsRowsHTML(rows[0], rows[1], { size: '1.05em' })}</div>`;
        q.hint = start ? q.hint : step === 1 ? `Find ${fmt(n)} on the chart. Move one box ${dir === 'more' ? 'right' : 'left'}.`
            : `Find ${fmt(n)} on the chart. Move one row ${dir === 'more' ? 'down' : 'up'}.`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'hchart', rows, base } };
        q.printFormat = 'pv-cell';
    } else if (support === 'strip') {
        // ML-1 … ML-4's H1: the chart's row (a step of 1) or column (a step of 10 or more) around
        // the given number, the number's box outlined bold and every other box EMPTY — the strip
        // shows where to move, never what is there.
        const strip = stripAround(given, step, dir, start);
        q.visual = `<div style="text-align:center;">${stripHTML(strip, { size: '1.05em' })}</div>`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'strip', strip, base } };
        q.printFormat = 'pv-cell';
    } else if (support === 'line') {
        const line = moreLessLine(given, step);
        q.visual = `<div style="text-align:center;">${pvLineSVG({ ticks: line.ticks, labels: line.labels, lengthMm: 110, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = start ? q.hint : `Each jump on the line is ${fmt(step)}. Jump once ${dir === 'more' ? 'to the right' : 'to the left'} from ${fmt(n)}.`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'line', ticks: line.ticks, labels: line.labels, base } };
        q.printFormat = 'pv-cell';
    } else {
        setCell(q, { kind: 'frame', frame: q.printText, slotDigits: base.slotDigits });
    }
}

/**
 * The strip of a hundreds chart around `v`: a row of ten for a step of 1 (two rows when the
 * move leaves the row), a column of three for a bigger step. Only `v` is printed.
 * @returns {{rows: Array<Array<number|null>>, mark: number, vertical: boolean}}
 */
function stripAround(v, step, dir, inverse) {
    const goesUp = (dir === 'more') !== inverse;          // the move the pupil makes, in the chart
    if (step === 1) {
        const rowOf = (x) => Math.floor((x - 1) / 10);
        const r = rowOf(Math.max(1, v));
        const other = rowOf(Math.max(1, v + (goesUp ? 1 : -1)));
        const rs = other === r ? [r] : [Math.min(r, other), Math.max(r, other)];
        return { rows: rs.map(rr => Array.from({ length: 10 }, (_, c) => (rr * 10 + c + 1 === v ? v : null))), mark: v, vertical: false };
    }
    return { rows: [[null], [v], [null]], mark: v, vertical: true };
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
    let places = Array.from({ length: nd }, (_, i) => 10 ** (nd - 1 - i));
    let { counts, n } = diskCounts(places, o);
    for (let t = 0; t < 20 && n > hi; t++) ({ counts, n } = diskCounts(places, o));
    if (n > hi) { n = randInt(10 ** (nd - 1), hi); String(n).split('').forEach((d, i) => { counts[places[i]] = Number(d); }); }
    // vis_pv_decimal_places: a decimal of 1-3 places on an O | Tth | Hth | Thth mat, the point on the
    // line after the ones (a number within 1 leaves the ones zone empty). The band then has no say.
    const dec = decOf(o);
    let ns = null;
    if (dec && ['read', 'count', undefined, ''].includes(o.task || '')) {
        const num = decimalNumber(dec, { zero: o.zeroPlace === 'some' && slot(2) === 1 });
        places = num.places.slice();
        counts = { ...num.digits };
        n = num.n;
        ns = num.s;
    } else if (dec && skill === 'pv_disks_build') {
        const num = decimalNumber(Math.min(2, dec), { zero: o.zeroPlace === 'some' && slot(2) === 1 });
        places = num.places.slice();
        counts = { ...num.digits };
        n = num.n;
        ns = num.s;
    }
    const nText = ns || fmt(n);
    // R61: decimal disks may be named as fractions (1/10, 1/100, 1/1000) - `counterLabel`.
    const frac = !!ns && o.counterLabel === 'fraction' && o.labels !== 'none';
    // vis_pv_dot_disks: `labels: 'none'` draws plain dots that take their value from the column.
    const dots = o.labels === 'none';
    const screenMat = (withCounts) => diskMatSVG({ places, counts: withCounts ? counts : null, size: 'M', pxPerMm: SCREEN_PX_PER_MM, dots, fraction: frac }).svg;
    if (skill === 'place_value_disks' && ['take', 'x10', 'd10', 'all'].includes(o.task)) { genDiskTask(q, o, places, counts, n, dots); return; }
    if (skill === 'pv_disks_build') {
        const parts = places.map(p => `${counts[p]} ${counts[p] === 1 ? PLACE_ONE[p] : PLACE_WORD[p]}`);
        q.text = `Build the number ${nText} on the place value mat.`;
        q.printText = dots ? `Draw ${nText} with dots.` : `Draw ${nText} with place-value disks.`;
        q.target = n;
        q.places = places.slice();
        q.ans = n;
        q.printAnswer = parts.join(', ');
        q.answerType = 'pv-build';
        q.options = [];
        q.visual = '';
        q.hint = 'Look at each digit. Draw that many disks in its place. A zero place stays empty.';
        q.skillLabel = 'Draw Place-Value Disks';
        q.pv = { kind: 'build', n, places: places.slice(), dots, decimals: ns ? dec : 0, s: ns, fraction: frac };
        setCell(q, { kind: 'build', n: ns || n, places: places.slice(), counts: { ...counts }, keyValue: q.printAnswer, dots, ...(frac ? { fraction: true } : {}) });
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
    q.pv.dots = dots;
    if (ns) { q.pv.decimals = dec; q.pv.s = ns; q.pv.fraction = frac; }
    setCell(q, { kind: 'disks', task, places: places.slice(), counts: { ...counts }, place: q.pv.place, dots, ...(ns ? { n: ns } : {}), ...(frac ? { fraction: true } : {}) });
}

/**
 * vis_pv_dot_disks: the three new mat tasks of place_value_disks.
 *   take  some counters are crossed out: write the number that is left (WRM "a counter is taken")
 *   x10   the counters and an arrow from each zone to the next on its left: write n × 10
 *   d10   a number ending in 0, the arrows to the right: write n ÷ 10
 *   all   use exactly c counters on the chart: write every number they make, smallest first
 */
function genDiskTask(q, o, places, counts, n, dots) {
    const task = o.task;
    const top = places[0];
    q.options = [];
    q.answerType = 'number';
    q.skillLabel = 'Place-Value Counters';
    const mat = (m) => `<div style="text-align:center;">${diskMatSVG({ size: 'M', pxPerMm: SCREEN_PX_PER_MM, dots, ...m }).svg}</div>`;
    if (task === 'all') {
        // A tens and ones chart, 2 to 5 counters (3 to 6 numbers): a three-place chart with even
        // three counters asks for ten numbers, too many for one cell.
        const c = [2, 3, 4, 5][blockOrder(4)[slot(4)]];
        const ps = [10, 1];
        const nums = [];
        const rec = (i, left, acc) => {
            if (i === ps.length - 1) { nums.push(acc + left * ps[i]); return; }
            for (let k = left; k >= 0; k--) rec(i + 1, left - k, acc + k * ps[i]);
        };
        rec(0, c, 0);
        const sorted = [...new Set(nums)].sort((a, b) => a - b);
        inlineBlanks(q, sorted.map(() => '___').join(', '), [sorted.map(String)], sorted.map((v) => String(v).length + 1));
        q.text = `Use ${c} counters on the chart. Write every number you can make, smallest first: ${q.text}`;
        q.printText = `Use ${c} counters. Write every number you can make, smallest first.`;
        q.ans = sorted.join(', ');
        q.printAnswer = sorted.map(fmt).join(', ');
        q.visual = mat({ places: ps, counts: null });
        q.hint = `Try all ${c} counters in one place, then move them one at a time.`;
        q.pv = { kind: 'disks', task, places: ps, counters: c, nums: sorted, dots };
        setCell(q, { kind: 'disks', task, places: ps, counters: c, sorted: sorted.map(fmt), keyValue: q.printAnswer });
        return;
    }
    if (task === 'take') {
        // Cross out 1-3 counters of one or two places, never all of the mat.
        const withSome = places.filter((p) => counts[p] > 0);
        const crossed = {};
        const k = 1 + (slot(3) === 2 && withSome.length > 1 ? 1 : 0);
        // Never every counter of the biggest place: the number left keeps its size.
        for (const p of shuffle(withSome.slice()).slice(0, k)) {
            const most = Math.min(3, counts[p] - (p === top ? 1 : 0));
            if (most >= 1) crossed[p] = randInt(1, most);
        }
        if (!Object.keys(crossed).length) { const p = withSome[withSome.length - 1]; if (p !== top || counts[p] > 1) crossed[p] = 1; }
        const taken = Object.entries(crossed).reduce((a, [p, c]) => a + Number(p) * c, 0);
        if (taken >= n) { const p = withSome[withSome.length - 1]; for (const key of Object.keys(crossed)) delete crossed[key]; crossed[p] = 1; }
        const left = n - Object.entries(crossed).reduce((a, [p, c]) => a + Number(p) * c, 0);
        q.text = 'Some counters are crossed out. What number is left?';
        q.printText = 'Write the number that is left.';
        q.ans = left;
        q.hint = 'Count only the counters that are not crossed out, place by place.';
        q.visual = mat({ places, counts, crossed });
        q.pv = { kind: 'disks', task, places: places.slice(), counts: { ...counts }, crossed: { ...crossed }, n, left, dots };
        setCell(q, { kind: 'disks', task, places: places.slice(), counts: { ...counts }, crossed: { ...crossed }, n, dots, keyValue: left });
        return;
    }
    // x10 / d10: the chart has one more place than the number, on the side the counters move to.
    const up = task === 'x10';
    let m = n, cs = { ...counts }, ps = places.slice();
    if (up && ps.length > 3) {
        // × 10 needs a zone to move into: a number of at most three digits (four zones at most).
        ps = ps.slice(-3);
        cs = Object.fromEntries(ps.map((p) => [p, counts[p] || 0]));
        if (!cs[ps[0]]) cs[ps[0]] = randInt(1, 9);
        m = Object.entries(cs).reduce((a, [p, c]) => a + Number(p) * c, 0);
    }
    if (up) ps = [ps[0] * 10, ...ps];
    else {
        // ÷ 10: a number whose ones zone is empty; the chart keeps its places (the ones zone receives).
        cs = { ...counts, 1: 0 };
        if (!Object.keys(cs).some((p) => Number(p) > 1 && cs[p] > 0)) cs[10] = randInt(1, 9);
        m = Object.entries(cs).reduce((a, [p, c]) => a + Number(p) * c, 0);
    }
    const ans = up ? m * 10 : m / 10;
    const glyph = up ? '×' : '÷';
    q.text = `Every counter moves one place ${up ? 'left' : 'right'}. ${fmt(m)} ${glyph} 10 = ?`;
    q.printText = `${fmt(m)} ${glyph} 10 = ____`;
    q.ans = ans;
    q.hint = up ? 'Each counter moves one place to the left: ones become tens, tens become hundreds.'
        : 'Each counter moves one place to the right: tens become ones, hundreds become tens.';
    q.visual = mat({ places: ps, counts: cs, arrows: up ? 'left' : 'right' });
    q.pv = { kind: 'disks', task, places: ps, counts: { ...cs }, n: m, ans, dots };
    setCell(q, { kind: 'disks', task, places: ps, counts: { ...cs }, n: m, dots, keyValue: ans });
}

function genTimesTen(q, skill, o) {
    let powers = (Array.isArray(o.power) && o.power.length ? o.power : [10]).map(Number).filter(p => [10, 100, 1000].includes(p));
    if (!powers.length) powers = [10];
    powers.sort((a, b) => a - b);
    const power = powers[slot(powers.length)];
    // 'both': a block of × (one per power), then a block of ÷, so every op meets every power.
    const op = o.op === 'both' ? (Math.floor(_at / powers.length) % 2 === 0 ? 'x' : '/') : o.op === '/' ? '/' : 'x';
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
        // number, the easy anchor. Every third item from the top span has a zero inside (305 x
        // 10, M-Z1), the edge case §2.3 names.
        let k;
        if (kMax >= 10 && slot(3) !== 0) {
            const [a, b] = digitSpan(kMax);
            // Not a round ten (10 x 1,000 teaches nothing a one-digit item does not).
            const kLo = Math.max(b > 11 ? 11 : 10, a);
            k = randInt(kLo, Math.max(kLo, b));
            if (slot(3) === 2 && k >= 100) {
                const ds = String(k).split(''); ds[randInt(1, ds.length - 1)] = '0';
                const k2 = Number(ds.join('')); if (k2 >= kLo) k = k2;
            }
        } else k = randInt(Math.min(2, kMax), Math.max(Math.min(2, kMax), Math.min(kMax, 9)));
        if (op === 'x') { n = k; ans = k * power; } else { n = k * power; ans = k; }
    }
    const glyph = op === 'x' ? '×' : '÷';
    q.text = `${fmt(n)} ${glyph} ${fmt(power)} = ?`;
    q.printText = `${fmt(n)} ${glyph} ${fmt(power)} = ____`;
    q.ans = ans;
    q.answerType = 'number';
    q.options = [];
    q.hint = op === 'x' ? 'Each digit moves to the left, one place for each zero.' : 'Each digit moves to the right, one place for each zero.';
    q.skillLabel = 'Multiply and Divide by 10, 100, 1,000';
    const whole = Number.isInteger(n) && Number.isInteger(ans);
    const support = o.support === 'none' || !whole ? 'none' : 'shift';
    q.pv = { kind: 'x10', n, op, power, support };
    if (support === 'shift') {
        // TX-1 … TX-4: the shift chart (PV-15) — the number in the top row, an empty answer row
        // under it, the move named on the arrow. The pupil writes the digits; the equation's line
        // takes the answer.
        const shift = { n, ans, label: `${glyph} ${fmt(power)}` };
        q.visual = `<div style="text-align:center;">${shiftChartHTML(shift, { size: '1.25em' })}</div>`;
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'shift', shift, base: { keyValue: q.ans, kind: 'frame', frame: q.printText } } };
        q.printFormat = 'pv-cell';
        return;
    }
    q.visual = Number.isInteger(n) ? `<div style="text-align:center;">${numeralTracksHTML(n)}</div>` : '';
    setCell(q, { kind: 'frame', n, showNumeral: Number.isInteger(n), frame: q.printText });
}

/* --------------------------------------------------------------------------- compare / order */

/** A number with exactly `nd` digits, capped at `hi`. */
function numberOfLength(nd, hi) {
    const lo = nd <= 1 ? 1 : 10 ** (nd - 1);
    return randInt(lo, Math.min(hi, 10 ** nd - 1));
}

/**
 * Numbers for compare / order (P6 CP-8 … CP-13, OR-*): `lengths` equal (all the band's widest
 * length) or mixed (lengths differ), `closeness` far (different first digits) or close (the same
 * first digit, so the next place decides).
 */
function comparableSet(count, cap, o) {
    const [lo, hi] = digitSpan(cap);
    const nd = String(hi).length;
    const mixed = o.lengths === 'mixed' && nd >= 2;
    // 'some': every other item is close, so the first digit does not decide every item.
    // (Not strictly alternate: in a two-column page that would put every close item in one column.)
    const close = o.closeness === 'close' || (o.closeness === 'some' && [0, 1, 1, 0, 1, 0][slot(6)] === 1);
    for (let t = 0; t < 200; t++) {
        const out = new Set();
        if (close && !mixed) {
            const lead = randInt(Math.max(1, Math.floor(lo / 10 ** (nd - 1))), Math.max(1, Math.floor(hi / 10 ** (nd - 1))));
            const base = lead * 10 ** (nd - 1);
            for (let k = 0; out.size < count && k < 80; k++) {
                const v = base + randInt(0, 10 ** (nd - 1) - 1);
                if (v >= lo && v <= hi) out.add(v);
            }
        } else {
            for (let k = 0; out.size < count && k < 120; k++) {
                const len = mixed ? (out.size === 0 ? nd : randInt(Math.max(1, nd - 2), nd)) : nd;
                let v = numberOfLength(len, hi);
                if (close && mixed && out.size) {
                    // Close and mixed: the shorter number starts with the longer one's digits
                    // (345 and 34), the classic trap.
                    const first = String([...out][0]);
                    const cut = first.slice(0, Math.max(1, len - 1));
                    v = Number(cut + String(randInt(0, 9)).repeat(Math.max(0, len - cut.length)).slice(0, Math.max(0, len - cut.length)));
                    if (!(v >= 1)) v = numberOfLength(len, hi);
                }
                if (v <= hi) out.add(v);
            }
        }
        const arr = [...out];
        if (arr.length < count) continue;
        const leads = arr.map(v => String(v)[0]);
        if (!close && !mixed && new Set(leads).size < Math.min(count, 9 - Math.floor(lo / 10 ** (nd - 1)) + 1, count)) continue;
        if (mixed && new Set(arr.map(v => String(v).length)).size < 2) continue;
        return arr;
    }
    const arr = new Set();
    while (arr.size < count) arr.add(randInt(Math.max(1, lo), hi));
    return [...arr];
}

/**
 * compare with decimal places (vis_pv_decimal_places): the pairs that teach, dealt in turn - the
 * first decimal place decides; the last place decides; the SHORTER number is bigger (0.5 and 0.45:
 * "longer is bigger" is the error); the whole parts differ; equal with a trailing zero (0.5 = 0.50).
 */
function genDecimalCompare(q, o) {
    const d = decOf(o);
    const a0 = decimalNumber(d);
    const w = a0.w, fr = a0.fr.slice();
    let a = a0.s, b;
    const kind = [0, 1, 2, 3, 0, 4][slot(6)];
    if (kind === 1 && d >= 2) {
        const f2 = fr.slice(); const j = d - 1; f2[j] = f2[j] === 9 ? 8 : f2[j] + 1; b = `${w}.${f2.join('')}`;
    } else if (kind === 2 && d >= 2) {
        b = `${w}.${fr[0] === 9 ? 8 : fr[0] + 1}`;
    } else if (kind === 3) {
        b = `${w === 9 ? 8 : w + 1}.${fr.map(() => randInt(1, 9)).join('')}`;
    } else if (kind === 4) {
        b = `${w}.${fr.join('')}0`;
    } else {
        const f2 = fr.slice(); f2[0] = f2[0] === 1 ? 2 : f2[0] - 1; b = `${w}.${f2.join('')}`;
    }
    if (slot(2) === 1) [a, b] = [b, a];
    const na = Number(a), nb = Number(b);
    q.text = `Compare: ${a} ___ ${b}`;
    q.printText = 'Write <, > or = in the circle.';
    q.ans = na > nb ? '>' : na < nb ? '<' : '=';
    q.answerType = 'symbol';
    q.options = ['>', '<', '='];
    q.hint = 'Line up the points. Compare the digits from the left: ones, then tenths, then hundredths.';
    q.skillLabel = 'Compare Decimals';
    q.visual = `<div style="display:flex;justify-content:center;align-items:center;gap:20px;color:#000;">`
        + `<div style="font-size:2rem;font-weight:700;">${a}</div>`
        + `<div style="width:2.2rem;height:2.2rem;border:1.5pt solid #000;border-radius:50%;"></div>`
        + `<div style="font-size:2rem;font-weight:700;">${b}</div></div>`;
    q.pv = { kind: 'compare', a: na, b: nb, as: a, bs: b, decimals: d, closeness: 'close', lengths: a.length === b.length ? 'equal' : 'mixed' };
    setCell(q, { kind: 'compare', a, b, keyValue: q.ans });
}

function genCompare(q, skill, o) {
    if (decOf(o)) { genDecimalCompare(q, o); return; }
    const cap = capOf('placevalue', skill, o, 999);
    let [a, b] = comparableSet(2, cap, o);
    // One item in six is equal (the "=" case; CP-9), dealt, never rolled.
    if (slot(6) === 5 && o.lengths !== 'mixed') b = a;
    if (slot(2) === 1 && a !== b) [a, b] = [b, a];
    q.text = `Compare: ${fmt(a)} ___ ${fmt(b)}`;
    q.printText = 'Write <, > or = in the circle.';
    q.ans = a > b ? '>' : a < b ? '<' : '=';
    q.answerType = 'symbol';
    q.options = ['>', '<', '='];
    q.hint = String(a).length !== String(b).length ? 'Count the digits first. More digits is the bigger number.'
        : 'Compare the digits from the left. The first place that is different decides.';
    q.skillLabel = 'Compare Numbers';
    q.visual = `<div style="display:flex;justify-content:center;align-items:center;gap:20px;color:#000;">`
        + `<div style="font-size:2rem;font-weight:700;">${fmt(a)}</div>`
        + `<div style="width:2.2rem;height:2.2rem;border:1.5pt solid #000;border-radius:50%;"></div>`
        + `<div style="font-size:2rem;font-weight:700;">${fmt(b)}</div></div>`;
    q.pv = { kind: 'compare', a, b, closeness: String(a)[0] === String(b)[0] && String(a).length === String(b).length ? 'close' : 'far', lengths: o.lengths || 'equal' };
    setCell(q, { kind: 'compare', a, b, keyValue: q.ans });
}

function genOrder(q, skill, o) {
    const cap = capOf('placevalue', skill, o, 999);
    const count = [3, 4, 5, 6].includes(Number(o.count)) ? Number(o.count) : 3;
    const nums = comparableSet(count, cap, o);
    const isAsc = skill === 'order_least_to_greatest';
    const sorted = [...nums].sort((x, y) => (isAsc ? x - y : y - x));
    let shown = shuffle([...nums]);
    if (shown.join() === sorted.join()) shown = shown.slice().reverse();
    q.text = isAsc ? 'Put the numbers in order. Start with the least.' : 'Put the numbers in order. Start with the greatest.';
    q.printText = isAsc ? 'Write the numbers in order. Start with the least.' : 'Write the numbers in order. Start with the greatest.';
    q.answerType = 'interactive';
    q.interactiveType = 'ordering';
    q.orderMode = 'click';
    q.orderDirection = isAsc ? 'asc' : 'desc';
    q.orderIcon = isAsc ? 'Least → Greatest' : 'Greatest → Least';
    q.numbers = shown;
    q.orderingItems = q.numbers;
    q.sortedNumbers = sorted;
    q.ans = sorted.join(',');
    q.printAnswer = sorted.map(fmt).join(', ');
    q.hint = isAsc ? 'Find the smallest number first, then the next smallest, and so on.'
        : 'Find the largest number first, then the next largest, and so on.';
    q.options = [];
    q.visual = '';
    q.skillLabel = 'Ordering';
    q.pv = { kind: 'order', nums: shown.slice(), dir: isAsc ? 'asc' : 'desc' };
    setCell(q, { kind: 'order', nums: shown.map(fmt), sorted: sorted.map(fmt), keyValue: q.printAnswer });
}

/* --------------------------------------------------------------------------- chart fill */

const ONES_W = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_W = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words999(n) {
    const h = Math.floor(n / 100), r = n % 100;
    const out = [];
    if (h) out.push(`${ONES_W[h]} hundred`);
    if (r) out.push(r < 20 ? ONES_W[r] : TENS_W[Math.floor(r / 10)] + (r % 10 ? `-${ONES_W[r % 10]}` : ''));
    return out.join(' ');
}
/** The word name of a whole number below a million ("forty thousand, three hundred six"). */
export function numberWords(n) {
    if (n === 0) return 'zero';
    const th = Math.floor(n / 1000), r = n % 1000;
    const out = [];
    if (th) out.push(`${words999(th)} thousand`);
    if (r) out.push(words999(r));
    return out.join(', ');
}

function genDigitChart(q, skill, o) {
    const cap = capOf('placevalue', skill, o, 99999);
    const [lo, hi] = digitSpan(cap);
    const nd = String(hi).length;
    // A zero place in every other item (an empty column is a wrong answer here, §13.3).
    const ds = digitsNumber(nd, { zero: slot(2) === 1 });
    let n = fromDigits(ds);
    if (n < lo || n > hi) n = randInt(lo, hi);
    const s = String(n);
    const places = Array.from({ length: s.length }, (_, i) => 10 ** (s.length - 1 - i));
    const source = o.source === 'word' || o.source === 'numeral' ? o.source : 'expanded';
    const parts = s.split('').map((d, i) => Number(d) * places[i]).filter(Boolean);
    const sourceText = source === 'word' ? numberWords(n) : source === 'numeral' ? fmt(n) : parts.map(fmt).join(' + ');
    q.text = `Write each digit in its place in the chart: ${sourceText}`;
    q.printText = 'Write each digit in its place in the chart.';
    q.target = n;
    q.places = places;
    q.ans = n;
    q.answerType = 'pv-digit-drag';
    q.hint = source === 'word' ? 'Write the thousands first, then the hundreds, tens and ones. A place with nothing gets a 0.'
        : 'Each part goes in its own place. A place with no part gets a 0.';
    q.skillLabel = 'Place-Value Chart';
    q.printFormat = 'pv-cell';
    q.visual = '';
    q.options = [];
    q.pv = { kind: 'chart', n, places, source, sourceText };
    setCell(q, { kind: 'chart', n, places, source: sourceText, keys: s.split(''), keyValue: fmt(n) });
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
    // A plain item stays below the band's top step: the numbers just under the next place (96,
    // 97 ... for the nearest 10) belong to the one `across` item, so they do not crowd a page.
    const plainHi = cap - P > lo + P ? cap - P : cap;
    for (let t = 0; t < 60; t++) {
        const n = pickIn(lo, plainHi);
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
            const v = randInt(Math.max(Math.ceil(P / 2), T - P * 2), Math.min(cap, T + P * 2));
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
        q.circleAll = true;
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
    const rounded = roundTo(n, P);
    const scope = ['notation', 'decision', 'judge'].includes(o.responseScope) ? o.responseScope : 'full';
    q.skillLabel = `Round to ${fmt(P)}`;
    q.options = [];
    q.pv = { kind: 'round', n, place: P, deal: kind, scope };
    // S2: `support` is a SET now. Its generation rungs are 'line' and 'cut' (line wins when both
    // are ticked); the chart and the marks ('round-pv', 'round-mark') are drawn round the cell at
    // render time. Nothing ticked (an old "none") is the bare number. A scalar is an old value.
    const sup = Array.isArray(o.support) ? o.support : [o.support === undefined || o.support === null ? 'cut' : o.support];
    const support = scope === 'full' ? (sup.includes('line') ? 'line' : sup.includes('cut') ? 'cut' : 'none') : 'cut';
    const strip = numeralTracksHTML(n, { cut: P, arrow: scope === 'full' || scope === 'judge' });
    if (scope === 'notation') {
        // RN-7a: find the place and the digit that decides — no rounding. Paper: underline and
        // circle on the strip; screen: the two digits typed in order.
        const dPlace = Math.floor(n / P) % 10;
        const dNext = Math.floor(n / (P / 10)) % 10;
        q.printText = `Underline the ${PLACE_WORD[P]} digit. Circle the digit after it.`;
        inlineBlanks(q, `${fmt(n)}: the ${PLACE_WORD[P]} digit is ___. The digit after it is ___.`, [[dPlace, dNext]], [2, 2]);
        q.ans = `${dPlace}, ${dNext}`;
        q.visual = `<div style="text-align:center;">${numeralTracksHTML(n, { cut: 0 })}</div>`;
        q.hint = `Find the letter of the ${PLACE_WORD[P]} place. The digit after it is to its right.`;
        q.pv.digits = [dPlace, dNext];
        setCell(q, { kind: 'round-notate', n, place: P, keyValue: q.ans });
        return;
    }
    if (scope === 'decision') {
        // RN-7b: round up or round down? One check box, no answer slot.
        q.text = `Round ${fmt(n)} to ${name}. Do you round up or round down?`;
        q.printText = 'Check one box: Round up or Round down.';
        q.answerType = 'multiple-choice';
        q.options = ['Round up', 'Round down'];
        q.ans = rounded > n ? 'Round up' : 'Round down';
        q.visual = `<div style="text-align:center;">${numeralTracksHTML(n, { cut: P })}</div>`;
        q.hint = 'Look at the digit after the cut line. 5 or more rounds up.';
        setCell(q, { kind: 'decide', n, place: P, labels: ['Round up', 'Round down'], keyValue: q.ans });
        return;
    }
    if (scope === 'judge') {
        // RN-14: a finished rounding in black; about half are wrong, each from §14.
        const wrongs = pvRoundingErrors(n, P);
        const isWrong = slot(2) === 1 && wrongs.length > 0;
        const shown = isWrong ? wrongs[Math.floor(_at / 2) % wrongs.length].value : rounded;
        q.text = `Check: ${fmt(n)} rounded to ${name} is ${fmt(shown)}. Is it correct?`;
        q.printText = 'Check the work. Check one box: Correct or Fix it.';
        q.answerType = 'multiple-choice';
        q.options = ['Correct', 'Fix it'];
        q.ans = isWrong ? 'Fix it' : 'Correct';
        q.printAnswer = isWrong ? `Fix it: ${fmt(rounded)}` : 'Correct';
        q.visual = `<div style="text-align:center;">${strip}<span style="font-size:1.9em;font-weight:700;color:#000;">${fmt(shown)}</span></div>`;
        q.hint = 'Round it yourself first. Then compare.';
        q.pv.shown = shown;
        q.pv.correct = rounded;
        setCell(q, { kind: 'judge', n, place: P, shown, correct: rounded, keyValue: q.printAnswer });
        return;
    }
    q.text = `Round ${fmt(n)} to ${name}.`;
    q.printText = q.text;
    q.ans = rounded;
    q.answerType = 'number';
    if (support === 'line') {
        q.visual = `<div style="text-align:center;">${roundingLineSVG({ lo: lower, hi: lower + P, n, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = `Is ${fmt(n)} nearer the left end or the right end? Halfway rounds up.`;
        setCell(q, { kind: 'round', n, place: P, support: 'line', lo: lower, hi: lower + P });
    } else if (support === 'none') {
        q.visual = '';
        q.hint = `Look at the digit after the ${PLACE_WORD[P]} place. 5 or more rounds up.`;
        setCell(q, { kind: 'round', n, place: P, support: 'none' });
    } else {
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
    // The line has 11 ticks, so the number sits on a tick: a multiple of P / 10.
    let n = roundNumber(P, cap, kind, o.midpoint === 'never');
    if (P >= 100) n = Math.round(n / (P / 10)) * (P / 10) || (P + P / 10);
    if (n % P === 0) n += P / 10;
    const lower = Math.floor(n / P) * P;
    const line = o.line === 'plotted' || o.line === 'ends' ? o.line : 'mark';
    const mid = !!o.midLabel;
    q.text = `Round ${fmt(n)} to the nearest ${fmt(P)}.`;
    q.printText = line === 'mark' ? `Mark ${fmt(n)} on the line. Round it to the nearest ${fmt(P)}.` : q.text;
    q.ans = roundTo(n, P);
    q.answerType = 'number';
    q.options = [];
    q.visual = `<div style="text-align:center;">${roundingLineSVG({ lo: lower, hi: lower + P, n, dot: line === 'plotted', mid, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
    q.hint = line === 'mark' ? `Mark ${fmt(n)} on the line. Is it nearer the left end or the right end? Halfway rounds up.`
        : `Is ${fmt(n)} nearer the left end or the right end? Halfway rounds up.`;
    q.skillLabel = 'Round on a Number Line';
    q.pv = { kind: 'round', n, place: P, deal: kind, line: [lower, lower + P], lineMode: line, midLabel: mid };
    setCell(q, { kind: 'round', n, place: P, support: 'line', lo: lower, hi: lower + P, dot: line === 'plotted', mark: line === 'mark', mid });
}

/**
 * Round on a number line to thousands and beyond (owner, 2026-09-25): round_nl_thousands /
 * _ten_thousands / _hundred_thousands. The number's SIZE is the skill; the place is its option.
 * The pupil places the number as a dot on the line (the ends are the two multiples of the place,
 * the halfway tick is marked and, by default, labelled), then writes the rounded number; the dot
 * drawn for them is the support that fades (`line: plotted`).
 *
 * Edge cases are dealt, never rolled (§2.3), one of each in a block of six: a halfway number
 * (rounds up), a number that rounds up across a bigger place (9,960 -> 10,000), a zero in a
 * middle place (40,508) and a number already on a multiple of the place (6,000 stays 6,000; owner
 * ruling 2026-09-25, an exception to the already-rounded guard for these three skills only).
 */
function roundNlNumber(R, P, kind) {
    const { lo, hi } = R;
    const inRange = (v) => v >= lo && v <= hi;
    const plain = () => {
        for (let t = 0; t < 80; t++) {
            const v = randInt(lo, hi);
            if (v % P === 0 || v % P === P / 2) continue;
            return v;
        }
        return lo + 1;
    };
    if (kind === 'mid') {
        const a = Math.ceil((lo - P / 2) / P), b = Math.floor((hi - P / 2) / P);
        if (a <= b) return randInt(Math.max(0, a), b) * P + P / 2;
    }
    if (kind === 'across') {
        // Just under a multiple of ten of the place, close enough to round up into it.
        const T = P * 10;
        const a = Math.ceil((lo + 1) / T), b = Math.floor((hi + P / 2) / T);
        for (let t = 0; t < 20 && a <= b; t++) {
            const v = randInt(a, b) * T - randInt(1, Math.max(1, P / 2 - 1));
            if (inRange(v) && v % P !== 0) return v;
        }
        // The place is above the number's own top place: an item that rounds up to it.
        for (let t = 0; t < 40; t++) { const v = randInt(lo, hi); if (v % P > P / 2) return v; }
    }
    if (kind === 'zero') {
        for (let t = 0; t < 40; t++) {
            const ds = String(plain()).split('');
            if (ds.length < 3) break;
            ds[randInt(1, ds.length - 2)] = '0';
            const v = Number(ds.join(''));
            if (inRange(v) && v % P !== 0 && v % P !== P / 2) return v;
        }
    }
    if (kind === 'multiple') {
        // On a multiple of the place (the dot sits on the line's left end tick). A place above the
        // number's top place has no multiple in range: a plain item then.
        const a = Math.max(1, Math.ceil(lo / P)), b = Math.floor(hi / P);
        if (a <= b) return randInt(a, b) * P;
    }
    return plain();
}

function genRoundNl(q, skill, o) {
    const R = ROUND_NL[skill];
    const P = R.places.includes(Number(o.place)) ? Number(o.place) : R.dflt;
    // Slot 4 is "already a multiple" (6,000 to the nearest 1,000 stays 6,000): owner ruling
    // 2026-09-25, "yes please allow" - a named exception to the family's already-rounded guard,
    // for these three skills only (ws-content-audit carries the matching exception).
    let kind = o.midpoint === 'only' ? 'mid' : ['plain', 'mid', 'across', 'zero', 'multiple', 'plain'][slot(6)];
    if (kind === 'mid' && o.midpoint === 'never') kind = 'plain';
    const n = roundNlNumber(R, P, kind);
    const lower = Math.floor(n / P) * P;
    const upper = lower + P;
    const rounded = roundTo(n, P);
    const plotted = o.line === 'plotted';
    const mid = o.midLabel !== false;
    const name = `the nearest ${fmt(P)}`;
    q.skillLabel = 'Round on a Number Line';
    q.options = [];
    q.visual = `<div style="text-align:center;">${roundingLineSVG({ lo: lower, hi: upper, n, dot: plotted, mid, lengthMm: 110, labelPt: 14, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
    q.hint = `${fmt(n)} is between ${fmt(lower)} and ${fmt(upper)}. Is it before or after the halfway point, ${fmt(lower + P / 2)}? Halfway rounds up.`;
    q.pv = { kind: 'round', n, place: P, deal: kind, line: [lower, upper], lineMode: plotted ? 'plotted' : 'mark', midLabel: mid, nl: true };
    if (plotted) {
        q.text = `Round ${fmt(n)} to ${name}.`;
        q.printText = q.text;
        q.ans = rounded;
        q.answerType = 'number';
    } else {
        // Two parts, both marked: the dot (a tap on the screen line writes the number it lands on
        // into the first slot; within half a small tick counts as the number itself) and the
        // rounded number.
        inlineBlanks(q, `Tap the line to mark ${fmt(n)}: ___ Round it to ${name}: ___`, [[n, rounded]],
            [String(n).length + 1, String(rounded).length + 1]);
        q.printText = `Mark ${fmt(n)} with a dot. Round it to ${name}.`;
        q.ans = rounded;
        q.nlMark = { n, lo: lower, hi: upper, tol: P / 20 };
    }
    q.printAnswer = fmt(rounded);
    setCell(q, { kind: 'round', n, place: P, support: 'line', lo: lower, hi: upper, dot: plotted, mark: !plotted, mid,
        markWord: !plotted, tapMark: !plotted, keyValue: rounded });
}

/** RN-1: the two tens a number is between. */
function genBetweenTens(q, skill, o) {
    const cap = capOf('number_sense', skill, o, 100);
    let n = 0;
    for (let t = 0; t < 40; t++) { n = randInt(11, Math.max(11, cap - 1)); if (n % 10) break; }
    if (n % 10 === 0) n += 1;
    // A number just past a hundred (104: 100 and 110) and a teen are content (§2.3).
    if (slot(6) === 3 && cap >= 200) n = Math.floor(randInt(100, cap - 10) / 100) * 100 + randInt(1, 9);
    const lo = Math.floor(n / 10) * 10, hi = lo + 10;
    inlineBlanks(q, `${fmt(n)} is between ___ and ___.`, [[lo, hi]], [String(hi).length + 1, String(hi).length + 1]);
    q.printText = `${fmt(n)} is between ____ and ____.`;
    q.ans = `${fmt(lo)} and ${fmt(hi)}`;
    q.printAnswer = q.ans;
    q.visual = '';
    q.hint = 'Find the ten just before the number, and the ten just after it.';
    q.skillLabel = 'Between Two Tens';
    q.pv = { kind: 'between', n, place: 10, lo, hi };
    setCell(q, { kind: 'blanks', frame: `${fmt(n)} is between ____ and ____`, keys: [fmt(lo), fmt(hi)], keyValue: q.ans, words: true });
}

/** RN-2: mark a number on a line whose two ends are labelled. */
function genPlaceOnLine(q, skill, o) {
    const P = Number(o.span) || 10;
    const cap = capOf('number_sense', skill, o, P * 10);
    const tick = P / 10;
    const lo = randInt(1, Math.max(1, Math.floor(cap / P) - 1)) * P;
    // A tick inside the line, never an end; halfway is dealt one item in six.
    const k = slot(6) === 1 ? 5 : randInt(1, 9);
    const n = lo + k * tick;
    // The screen verb map turns a leading "Mark" into "Tap the line", which garbled this item
    // ("Tap the line 76 on the number line."), so the screen sentence is written with its own verb.
    q.text = `Tap ${fmt(n)} on the number line.`;
    q.printText = `Mark ${fmt(n)} on the number line.`;
    q.ans = n;
    q.answerType = 'number-line-extended';
    q.rangeMin = lo;
    q.rangeMax = lo + P;
    q.majorTickEvery = P;
    q.minorSnap = tick;
    q.tolerance = tick / 2 - 1e-9;
    q.numberType = 'integer';
    q.options = [];
    q.visual = '';
    q.hint = `Each small jump is ${fmt(tick)}. Count the jumps from ${fmt(lo)}.`;
    q.skillLabel = 'Mark a Number on a Line';
    q.pv = { kind: 'mark', n, span: P, line: [lo, lo + P] };
    setCell(q, { kind: 'line-mark', n, lo, hi: lo + P, keyValue: fmt(n) });
}

/* --------------------------------------------------------------------------- nl_20: scales */

/**
 * The line of number_line_scales (BUILD_LIST nl_20): the WHOLE line runs 0 to the band in ten
 * jumps (0 to 50 in 5s; 0 to 20 in twenty jumps of 1), a WINDOW is ten jumps of a hundredth of the
 * band (40 to 50 in 1s, 300 to 400 in 10s; 1s on the lines to 20 and 50).
 */
export const SCALE_BANDS = [20, 50, 100, 1000, 10000, 1000000, 10000000];
const r6 = (v) => Math.round(v * 1e6) / 1e6;
export function scaleLineOf(band, chart, pick = (lo, hi) => randInt(lo, hi), decimals = 0) {
    const B = SCALE_BANDS.includes(Number(band)) ? Number(band) : 100;
    // Decimal jumps (tenths, hundredths, thousandths): ten jumps from a multiple of ten jumps - 0 to
    // 1 in tenths on the whole line, 3 to 4 or 0.2 to 0.3 on a part of it - below the band.
    const d = [1, 2, 3].includes(Number(decimals)) ? Number(decimals) : 0;
    if (d) {
        const S = 10 ** d, span = 10;
        // Tenths to 100, hundredths to 10, thousandths to 1: at most four digits a number (43.7, 6.25, 0.384).
        const top = Math.max(1, Math.floor((Math.min(B, 1000 / S) * S) / span) - 1);
        const loI = chart === 'window' ? pick(0, top) * span : 0;
        return { lo: r6(loI / S), hi: r6((loI + span) / S), step: r6(1 / S), decimals: d };
    }
    if (chart !== 'window') return B === 20 ? { lo: 0, hi: 20, step: 1 } : { lo: 0, hi: B, step: B / 10 };
    // A part of the line: ten jumps of a hundredth of the band (of 1 on the lines to 20 and 50).
    const step = B <= 50 ? 1 : B / 100;
    const span = 10 * step;
    const lo = pick(0, Math.max(0, B / span - 1)) * span;
    return { lo, hi: lo + span, step };
}
/** The tick indexes that carry a number on a line of n jumps (never an asked one). */
export function scaleLabelled(n, labels) {
    const out = new Set([0, n]);
    if (labels === 'some') for (let i = 1; i < n; i++) if (n > 10 ? i % 5 === 0 : i === n / 2) out.add(i);
    return out;
}
const SCALE_TASKS = ['read', 'mark', 'fill', 'estimate'];

function genScaleLine(q, skill, o) {
    const task = SCALE_TASKS.includes(o.task) ? o.task : 'read';
    // An estimate line has no inner ticks: its ends, or its ends and halfway ('some').
    const labels = task === 'estimate' ? (o.ticks === 'ends' ? 'ends' : 'some') : (['step', 'some', 'ends'].includes(o.ticks) ? o.ticks : 'some');
    // A member of a mixed review takes the biggest line its review's Max Number allows.
    const band = inReview(skill) ? (SCALE_BANDS.filter((b) => b <= rangeCap(skill, Number(o.band) || 100)).pop() || 20) : o.band;
    const { lo, hi, step } = scaleLineOf(band, o.chart, undefined, o.decimals);
    const dec = [1, 2, 3].includes(Number(o.decimals)) ? Number(o.decimals) : 0;
    const n = Math.round((hi - lo) / step);
    // The asked ticks: never an end, never a labelled tick (with every tick labelled, any inner one).
    const fixed = labels === 'step' ? new Set([0, n]) : scaleLabelled(n, labels);
    const free = Array.from({ length: n - 1 }, (_, i) => i + 1).filter((i) => !fixed.has(i));
    const order = blockOrder(free.length);
    const val = (i) => r6(lo + i * step);
    q.options = [];
    q.visual = '';
    q.skillLabel = 'Numbers on a Number Line';
    const jumps = `The line counts in ${fmt(step)}s.`;
    if (task === 'fill') {
        // Three ticks, never three side by side on a line of ten (the pupil counts on from a label).
        let ks = [];
        for (let t = 0; t < 30; t++) {
            ks = shuffle(free.slice()).slice(0, 3).sort((a, b) => a - b);
            if (ks.length < 3 || !(ks[1] === ks[0] + 1 && ks[2] === ks[1] + 1)) break;
        }
        const targets = ks.map(val);
        inlineBlanks(q, 'A ___ B ___ C ___', [targets.map(String)], targets.map((v) => String(v).length + 1));
        q.text = `What numbers are at A, B and C? ${q.text}`;
        q.printText = 'Write the number at each letter.';
        q.ans = targets.map(fmt).join(', ');
        q.printAnswer = targets.map((v, i) => `${'ABC'[i]} ${fmt(v)}`).join(', ');
        q.hint = `${jumps} Count on from a number you know.`;
        q.pv = { kind: 'scale', task, lo, hi, step, labels, targets, n: targets[0], decimals: dec };
        setCell(q, { kind: 'scale', task, lo, hi, step, labels, targets, n: targets[0], keyValue: q.ans });
        return;
    }
    const k = free[order[slot(free.length)]];
    // Edge case (WRM Y4 "arrows between ticks"): one read item in six points HALFWAY along a jump
    // of an even size (45 on a line in tens), never past the band's last jump.
    const half = task === 'read' && !dec && step % 2 === 0 && slot(6) === 4 && k < n;
    const v = half ? val(k) + step / 2 : val(k);
    q.ans = v;
    q.pv = { kind: 'scale', task, lo, hi, step, labels, n: v, decimals: dec, half };
    if (task === 'read') {
        q.text = 'What number does the arrow point to?';
        q.printText = 'Write the number the arrow points to.';
        q.answerType = 'number';
        q.hint = half ? `${jumps} The arrow is halfway along a jump.` : `${jumps} Count the jumps from ${fmt(lo)} to the arrow.`;
        setCell(q, { kind: 'scale', task, lo, hi, step, labels, n: v, keyValue: v });
        return;
    }
    // mark / estimate: on screen the paper's own line is ONE tap target (screen-cell.js
    // scaleLineTwin, the round-line tap machinery): a tap puts the dot there and writes the number
    // into the item's one slot - the number itself when the tap is within the tolerance: half a
    // jump for a mark on a tick, one jump for an estimate.
    const est = task === 'estimate';
    inlineBlanks(q, `Tap the line to mark ${fmt(v)}: ___`, [[String(v)]], [String(v).length + 1]);
    q.text = est ? `Tap about where ${fmt(v)} goes on the line. ___` : `Tap ${fmt(v)} on the number line. ___`;
    q.printText = est ? `Estimate. Mark ${fmt(v)} on the line.` : `Mark ${fmt(v)} on the number line.`;
    q.ans = v;
    q.nlMark = { n: v, lo, hi, tol: est ? step : step / 2 };
    q.hint = est ? `Halfway is ${fmt(r6((lo + hi) / 2))}. Is ${fmt(v)} before or after halfway?` : `${jumps} Count the jumps from ${fmt(lo)}.`;
    q.printAnswer = fmt(v);
    setCell(q, { kind: 'scale', task, lo, hi, step, labels, n: v, keyValue: fmt(v) });
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
    // RS-2: bins one apart (a Neither column) or three in a row; decimal sorts keep two adjacent.
    const bins = dec ? 'adjacent' : (o.bins === 'apart' || o.bins === 'three' ? o.bins : 'adjacent');
    const span = bins === 'adjacent' ? 1 : 2;              // how many places the bins cover
    const mMin = dec ? (dec === 1 ? 1 : 40) : 1;
    const mMax = dec ? (dec === 1 ? 8 : 95) : Math.max(1, Math.floor(cap / P) - span);
    const Lu = randInt(mMin, Math.max(mMin, mMax)) * Pu;
    const binVals = bins === 'adjacent' ? [Lu, Lu + Pu] : bins === 'apart' ? [Lu, Lu + 2 * Pu] : [Lu, Lu + Pu, Lu + 2 * Pu];
    const count = Number(o.tiles) === 8 ? 8 : 6;
    const rnd = (u) => Math.floor((u + Pu / 2) / Pu) * Pu;
    // The numbers that can be dealt: every non-multiple from halfway below the first bin to
    // halfway above the last (minus one), inside the band.
    const loU = bins === 'adjacent' ? Lu + 1 : Math.max(1, Lu - Pu / 2);
    const hiU = bins === 'adjacent' ? Lu + Pu - 1 : Math.min(dec ? Infinity : cap, Lu + 2 * Pu + Pu / 2 - 1);
    const groups = bins === 'apart' ? [Lu, Lu + Pu, Lu + 2 * Pu] : binVals;   // apart: the middle is Neither
    const chosen = new Set();
    // Halfway, in every set (midpoint-seeded): the first bin's halfway number, and for three bins
    // or a Neither column the next halfway too (the Neither trap: 45 rounds to 50, not 40).
    if (o.midpoint !== 'never') {
        chosen.add(Lu + Pu / 2);
        if (bins !== 'adjacent' && Lu + Pu + Pu / 2 <= hiU) chosen.add(Lu + Pu + Pu / 2);
    }
    // The split is dealt, never rolled, and it CHANGES from item to item (round-3: every set split
    // 3 / 3, so the last numbers could be placed by counting): two bins take 2 / 4, 4 / 2 or 3 / 3
    // in turn; three groups take every group at least one.
    const inGroup = (u) => groups.indexOf(rnd(u));
    const quota = groups.length === 2
        ? (() => { const k = [2, 4, 3][slot(3)] + (count === 8 ? 1 : 0); return [k, count - k]; })()
        : groups.map((_, i) => Math.floor(count / groups.length) + (i < count % groups.length ? 1 : 0) + (i === slot(groups.length) ? 1 : 0) - (i === (slot(groups.length) + 1) % groups.length ? 1 : 0));
    const have = () => groups.map((_, i) => [...chosen].filter(u => inGroup(u) === i).length);
    for (let g = 0, t = 0; chosen.size < count && t < 400; t++, g++) {
        const gi = g % groups.length;
        if (have()[gi] >= quota[gi] && t < 300) continue;
        const target = groups[gi];
        const a = Math.max(loU, target - Pu / 2), b = Math.min(hiU, target + Pu / 2 - 1);
        if (a > b) continue;
        const u = randInt(a, b);
        if (u % Pu === 0) continue;
        chosen.add(u);
    }
    const units = shuffle([...chosen]).slice(0, count);
    const val = (u) => dec ? +(u * unit).toFixed(dec + 1) : u;
    const label = (u, d) => dec ? (u * unit).toFixed(d) : fmt(u);
    const place = dec ? (dec === 1 ? 'tenth' : 'hundredth') : PLACE_ONE[P];
    const binOf = (u) => { const r = rnd(u); const i = binVals.indexOf(r); return i >= 0 ? `bin_${i}` : 'bin_neither'; };
    const ans = {};
    units.forEach((u, i) => { ans['t' + i] = binOf(u); });
    q.text = `Sort the numbers by what they round to (nearest ${place}).`;
    q.printText = `Write each number under what it rounds to (nearest ${place}).`;
    q.ans = ans;
    q.answerType = 'dnd-generic';
    q.dndMode = 'categorize';
    q.tiles = units.map((u, i) => ({ id: 't' + i, label: label(u, dec + 1) }));
    q.bins = binVals.map((b, i) => ({ id: `bin_${i}`, label: label(b, dec) }));
    if (bins === 'apart') q.bins.push({ id: 'bin_neither', label: 'Neither' });
    q.options = [];
    q.visual = '';
    q.hint = 'Find the halfway number between each pair. Halfway rounds up.';
    q.skillLabel = `Sort: nearest ${place}`;
    const sorted = q.bins.map(b => units.filter(u => binOf(u) === b.id).map(u => label(u, dec + 1)));
    q.printAnswer = q.bins.map((b, i) => `${b.label}: ${sorted[i].join(', ') || '—'}`).join(' · ');
    const support = o.support === 'line' ? 'line' : 'none';
    q.pv = { kind: 'sort', place: P, tiles: units.map(val), bins: binVals.map(val), binMode: bins, support };
    const base = {
        kind: 'sort', bank: q.tiles.map(t => t.label), bins: q.bins.map(b => (b.id === 'bin_neither' ? 'neither' : `rounds to ${b.label}`)),
        rows: Math.max(2, ...sorted.map(l => l.length)) + 1, sorted, keyValue: q.printAnswer,
    };
    if (support === 'line') {
        // The number line from the first bin to the last: ten ticks a place, only the bins
        // labelled, so the pupil places each number and sees which end it is nearer.
        const ticks = 10 * (binVals.length === 2 && bins === 'adjacent' ? 1 : 2) + 1;
        const labels = {};
        binVals.forEach((b) => { labels[Math.round((b - Lu) / Pu * 10)] = label(b, dec); });
        q.visual = `<div style="text-align:center;">${pvLineSVG({ ticks, labels, lengthMm: 120, pxPerMm: SCREEN_PX_PER_MM })}</div>`;
        q.hint = 'Find each number on the line. Which labelled number is it nearest? Halfway rounds up.';
        q.cell = { template: 'pv-support', v: 1, payload: { picture: 'line', ticks, labels, base: { keyValue: q.printAnswer, ...base } } };
        q.printFormat = 'pv-cell';
    } else {
        setCell(q, base);
    }
}

/** RT-1 / RT-2: the rounding table — a whole column (or a whole row) blank, never one cell. */
function genRoundingTable(q, skill, o) {
    let places = (Array.isArray(o.places) && o.places.length ? o.places : [10, 100]).map(Number).filter(p => [10, 100, 1000, 10000].includes(p));
    if (!places.length) places = [10, 100];
    places.sort((a, b) => a - b);
    const top = places[places.length - 1];
    const cap = capOf('number_sense', skill, o, top * 10);
    const rowsN = 4;
    const nums = new Set();
    // One halfway number for the smallest place, and one chain-rounding trap (1,449: to the
    // nearest 1,000 it is 1,000, not 2,000 — M-R6) where two places are asked.
    const small = places[0];
    for (let t = 0; nums.size < rowsN && t < 200; t++) {
        let v;
        if (nums.size === 0) v = randInt(top / small + 1, Math.floor(cap / small) - 1) * small + small / 2;
        else if (nums.size === 1 && places.length >= 2) {
            const P2 = places[1];
            v = randInt(1, Math.max(1, Math.floor(cap / P2) - 1)) * P2 + P2 / 2 - small / 2;
        } else v = randInt(top + 1, cap - 1);
        if (v <= top || v >= cap || v % small === 0) continue;
        nums.add(v);
    }
    const rows = shuffle([...nums]);
    const blank = o.blank === 'row' ? 'row' : 'column';
    const table = rows.map(n => places.map(p => roundTo(n, p)));
    let text, sets, blankCells;
    if (blank === 'column') {
        const ci = slot(places.length);
        const P = places[ci];
        blankCells = rows.map((_, r) => [r, ci]);
        sets = [rows.map((_, r) => table[r][ci])];
        text = `Round each number to the nearest ${fmt(P)}. ${rows.map(n => `${fmt(n)}: ___`).join('  ')}`;
        q.printText = `Round each number to the nearest ${fmt(P)}. Fill in the column.`;
    } else {
        const ri = slot(rows.length);
        blankCells = places.map((_, c) => [ri, c]);
        sets = [places.map((_, c) => table[ri][c])];
        text = `Round ${fmt(rows[ri])}. ${places.map(p => `Nearest ${fmt(p)}: ___`).join('  ')}`;
        q.printText = `Round ${fmt(rows[ri])} to each place. Fill in the row.`;
    }
    inlineBlanks(q, text, sets, sets[0].map(v => String(v).length + 2));
    q.ans = sets[0].map(fmt).join('; ');
    q.printAnswer = q.ans;
    const isBlank = (r, c) => blankCells.some(([rr, cc]) => rr === r && cc === c);
    const cellsView = rows.map((n, r) => places.map((_, c) => (isBlank(r, c) ? null : table[r][c])));
    q.visual = `<div style="text-align:center;">${roundingTableHTML(rows, places, cellsView, { size: '1em' })}</div>`;
    q.hint = 'Round each number from the number itself, not from the column next to it.';
    q.skillLabel = 'Rounding Table';
    q.pv = { kind: 'table', rows, places, blank, cells: blankCells, keys: sets[0] };
    setCell(q, { kind: 'table', rows: rows.map(fmt), places, view: cellsView.map(r => r.map(v => (v === null ? null : fmt(v)))),
        keys: table.map(r => r.map(fmt)), keyValue: q.ans });
}

/* =========================================================================== ESTIMATION (ES, §12) */

const EST_IDS = new Set(['estimate_sum', 'estimate_diff', 'estimate_sums_diffs', 'estimate_products', 'estimate_quotient']);

/** A number in [P + 1, 10P - 1] that is not a multiple of P and not halfway (no tie to argue). */
function estOperand(P, lo, hi) {
    for (let t = 0; t < 60; t++) {
        const v = randInt(Math.max(P + 1, lo), Math.max(P + 1, hi));
        if (v % P && v % P !== P / 2) return v;
    }
    return P + 1;
}

function genEstimate(q, skill, o) {
    const task = skill === 'estimate_sum' || skill === 'estimate_diff' ? 'compute'
        : (o.task === 'closest' || o.task === 'reasonable' ? o.task : 'compute');
    let a, b, op, est, exact, P, compat = null;
    if (skill === 'estimate_quotient') {
        // ES-9: a nearby number the divisor goes into (compatible numbers), then divide.
        const pf = Number(o.place) || 1;
        const divisor = [3, 4, 5, 6, 7, 8, 9][randInt(0, 6)];
        // The dividend sits within a THIRD of the divisor of its compatible number, so one friendly
        // fact is clearly nearest (84 ÷ 9 -> 81 ÷ 9, never the two-way 85 ÷ 9), and it has at
        // least two digits (a 5 ÷ 3 "estimate" teaches nothing, 4.NBT.B.6).
        const off = pf === 1 ? Math.max(1, Math.floor(divisor / 3)) : Math.max(1, Math.floor(pf / 3));
        const quotCap = rangeCap(skill, divisor * 9 * pf + off);
        const qMax = Math.max(3, Math.min(9, Math.floor((quotCap - off) / (divisor * pf))));
        const qMin = Math.min(qMax, Math.max(2, Math.ceil((10 + off) / (divisor * pf))));
        est = randInt(qMin, qMax) * pf;
        compat = divisor * est;
        a = Math.max(1, compat + randInt(1, off) * (slot(2) ? 1 : -1));
        if (a === compat) a += 1;
        b = divisor;
        op = '÷';
        P = pf;
        exact = a / b;
    } else {
        const roundTo_ = Number(o.place) || 10;
        P = roundTo_;
        // The estimate owns its numbers (the place's two-digit multiples); only a mixed review's
        // Max Number narrows them, never below three of the place.
        const top = Math.max(3 * P, rangeCap(skill, P * 10 - 1));
        op = skill === 'estimate_sum' ? '+' : skill === 'estimate_diff' ? '−' : skill === 'estimate_products' ? '×' : (slot(2) === 0 ? '+' : '−');
        if (op === '×') {
            a = estOperand(P, P + 1, top);
            b = randInt(2, 9);
            est = roundTo(a, P) * b;
            exact = a * b;
        } else {
            // The edge cases are dealt, not rolled (§2.3): one item in six has a number exactly
            // halfway (45 -> 50, halfway rounds up) and one a number that rounds up into the next
            // place (97 -> 100).
            const edge = slot(6) === 1 ? 'mid' : slot(6) === 4 && top >= 10 * P - 1 ? 'across' : '';
            for (let t = 0; t < 60; t++) {
                a = estOperand(P, P + 1, top);
                b = estOperand(P, P + 1, top);
                if (edge === 'mid') a = randInt(1, Math.max(1, Math.floor((top - P / 2) / P))) * P + P / 2;
                if (edge === 'across') a = 10 * P - randInt(1, P / 2 - 1);
                if (op === '+') break;
                if (a < b) [a, b] = [b, a];
                if (roundTo(a, P) > roundTo(b, P)) break;       // the estimate is a real difference
            }
            est = op === '+' ? roundTo(a, P) + roundTo(b, P) : roundTo(a, P) - roundTo(b, P);
            exact = op === '+' ? a + b : a - b;
        }
    }
    const expr = `${fmt(a)} ${op} ${fmt(b)}`;
    const placeName = op === '÷' ? '' : `the nearest ${fmt(P)}`;
    const ra = op === '÷' ? compat : roundTo(a, P);
    const rb = op === '÷' || op === '×' ? b : roundTo(b, P);
    q.options = [];
    q.visual = '';
    q.skillLabel = { '+': 'Estimate Sums', '−': 'Estimate Differences', '×': 'Estimate Products', '÷': 'Estimate Quotients' }[op];
    q.pv = { kind: 'estimate', task, op, a, b, place: P, est, rounded: [ra, rb] };
    if (task === 'closest') {
        // ES-5: three printed estimates; the distractors are one place either side, or the
        // exact answer rounded at the wrong moment (M-G1).
        const step = op === '×' ? P * b : op === '÷' ? P : P;
        const cands = [est + step, est - step, est + 2 * step].filter(v => v > 0 && v !== est);
        const choices = shuffle([est, cands[0], cands[1] !== undefined ? cands[1] : cands[2]].filter(v => v !== undefined));
        q.text = `${expr} is closest to:`;
        q.printText = `Circle the closest estimate. ${expr}`;
        q.answerType = 'multiple-choice';
        q.options = choices.map(fmt);
        q.keepChoices = true;
        q.ans = fmt(est);
        q.hint = op === '÷' ? `Find a number near ${fmt(a)} that ${fmt(b)} goes into.` : `Round each number to ${placeName} first.`;
        q.pv.choices = choices;
        setCell(q, { kind: 'closest', expr, choices: choices.map(fmt), keyValue: q.ans });
        return;
    }
    if (task === 'reasonable') {
        // ES-6: an exact answer in black; HALF are genuinely reasonable (the true answer), dealt,
        // never rolled — the gate holds the page to 40-60% (§17 reasonable-balance). A wrong one
        // is off by a whole place (M-G4, a dropped or extra zero) or several of the place.
        const reasonable = Math.floor(_at / 2) % 2 === 0;
        const exactShown = op === '÷' ? Math.round(exact) : exact;
        let shown = exactShown;
        if (!reasonable) {
            const k = Math.floor(_at / 4) % 3;
            shown = k === 0 ? exactShown * 10 : k === 1 && exactShown >= 20 ? Math.round(exactShown / 10) : exactShown + (3 + (_at % 3)) * (op === '×' ? P * b : P);
            if (shown === exactShown) shown = exactShown * 10;
        }
        q.text = `Is this answer reasonable? ${expr} ${op === '÷' ? '≈' : '='} ${fmt(shown)}`;
        q.printText = `Estimate. Check one box: Reasonable or Not reasonable. ${expr} = ${fmt(shown)}`;
        q.answerType = 'multiple-choice';
        q.options = ['Reasonable', 'Not reasonable'];
        q.ans = reasonable ? 'Reasonable' : 'Not reasonable';
        q.hint = 'Estimate first. Is the answer close to your estimate?';
        q.pv.shown = shown;
        q.pv.reasonable = reasonable;
        setCell(q, { kind: 'decide', expr: `${expr} ${op === '÷' ? '≈' : '='} ${fmt(shown)}`, labels: ['Reasonable', 'Not reasonable'], keyValue: q.ans });
        return;
    }
    // Round, then compute: the two-line rewrite (RD-07) — the working frame: each changed number
    // in a box under the problem, then the estimate — or, as the fade (a `support: none` option
    // where the skill has one), the estimate alone. Every estimation skill gets the frame, so the
    // rounding step has a slot and a key (round-3: sums/diffs, products and quotients had none).
    const rewrite = o.support !== 'none';
    const lead = op === '÷' ? 'Find a near number that divides easily.'
        : op === '×' ? `Round the bigger number to ${placeName}.` : `Round each number to ${placeName}.`;
    q.printText = op === '÷' ? `${lead} Then divide. ${expr}` : op === '×' ? `${lead} Then multiply. ${expr}` : `${lead} Then estimate. ${expr}`;
    q.hint = op === '÷' ? `Find a number near ${fmt(a)} that ${fmt(b)} goes into. Then divide.`
        : op === '×' ? `Round ${fmt(a)} to ${placeName}. Keep ${fmt(b)}. Then multiply.` : `Round each number to ${placeName}. Then ${op === '+' ? 'add' : 'subtract'}.`;
    if (rewrite) {
        inlineBlanks(q, `${lead} ${expr} ≈ ___ ${op} ___ = ___`, [[ra, rb, est]]);
        q.ans = est;
        q.printAnswer = `${fmt(ra)} ${op} ${fmt(rb)} = ${fmt(est)}`;
        setCell(q, { kind: 'estimate', expr, op, keys: [fmt(ra), fmt(rb), fmt(est)], keyValue: q.printAnswer });
        return;
    }
    q.text = `${lead} ${expr} ≈ ?`;
    q.ans = est;
    q.answerType = 'number';
    setCell(q, { kind: 'frame', frame: `${expr} ≈ ____`, keyValue: est });
}

/* =========================================================================== entry points */

const PV_IDS = new Set(['identify', 'value', 'expand', 'combine', 'more_less_10', 'more_less_100',
    'place_value_disks', 'pv_disks_build', 'place_value_10x', 'unit_form', 'compare',
    'order_least_to_greatest', 'order_greatest_to_least', 'pv_digit_drag']);
const ROUND_IDS = new Set(['rounding_visual', 'nearest_10', 'nearest_100', 'nearest_1000', 'nearest_10000',
    'nearest_100000', 'nearest_million', 'between_tens', 'place_on_number_line', 'rounding_table', ...Object.keys(SORT_PLACE),
    ...Object.keys(ROUND_NL),
    // build lane placevalue (BUILD_LIST nl_20)
    'number_line_scales']);

/** Place value ids rewritten in P9. Returns true when the item was generated (or refused) here. */
export function generatePvPlaceValue(q, skill) {
    if (!PV_IDS.has(skill)) return false;
    beginItem();
    const o = optsOf('placevalue', skill);
    if (refuse(q, 'placevalue', skill, o)) return true;
    if (skill === 'identify' || skill === 'value') genPlace(q, skill, o);
    else if (skill === 'expand' || skill === 'combine') genExpandCombine(q, skill, o);
    else if (skill === 'unit_form') genUnitForm(q, skill, o);
    else if (skill === 'more_less_10' || skill === 'more_less_100') genMoreLess(q, skill, o);
    else if (skill === 'place_value_disks' || skill === 'pv_disks_build') genDisks(q, skill, o);
    else if (skill === 'place_value_10x') genTimesTen(q, skill, o);
    else if (skill === 'compare') genCompare(q, skill, o);
    else if (skill === 'pv_digit_drag') genDigitChart(q, skill, o);
    else genOrder(q, skill, o);
    return true;
}

/** Rounding ids rewritten in P9. Returns true when the item was generated (or refused) here. */
export function generatePvRounding(q, skill) {
    if (!ROUND_IDS.has(skill)) return false;
    beginItem();
    const o = optsOf('number_sense', skill);
    if (refuse(q, 'number_sense', skill, o)) return true;
    if (skill === 'rounding_visual') genRoundingVisual(q, skill, o);
    else if (skill === 'between_tens') genBetweenTens(q, skill, o);
    else if (skill === 'place_on_number_line') genPlaceOnLine(q, skill, o);
    else if (skill === 'number_line_scales') genScaleLine(q, skill, o);
    else if (skill === 'rounding_table') genRoundingTable(q, skill, o);
    else if (ROUND_NL[skill]) genRoundNl(q, skill, o);
    else if (SORT_PLACE[skill]) genRoundSort(q, skill, o);
    else genNearest(q, skill, o);
    return true;
}

/** Estimation ids rewritten in P9 step 8 (§12). Returns true when the item was generated here. */
export function generatePvEstimation(q, skill) {
    if (!EST_IDS.has(skill)) return false;
    beginItem();
    const o = optsOf('number_sense', skill);
    genEstimate(q, skill, o);
    return true;
}

/** The digit span of a band, for the older branches in gen-algebraic.js that now bind to it. */
export function pvSpan(categoryId, skillId, fallbackBand) {
    const o = optsOf(categoryId, skillId);
    return digitSpan(capOf(categoryId, skillId, o, fallbackBand));
}
export { refuse as pvRefuse, optsOf as pvOptions };
