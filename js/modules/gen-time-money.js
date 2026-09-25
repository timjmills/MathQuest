// gen-time-money.js — P10: time and money (design/research/time-money.md, owner rulings §20)
//
// gen-measurement.js hands every time and money id here (TM_SKILLS in skill-options.js); the
// ruler, temperature, capacity and conversion branches stay there. What the rewrite fixes, and
// the rule each fix answers to:
//
//   * TYPES ARE DEALT, NOT ROLLED (§2.2, ruling 2). No `Math.random() < p` picks a cell type. The
//     30% "Set the clock" branch of every reading and elapsed id is the `response: draw` option of
//     the five reading ids (ruling Q4); forward / backward is `dir`; the analog / digital pairing is
//     `notation`; money's modes are `kind`. What a page varies is dealt round-robin off
//     state.itemIndex (the kept-item index print and the audit pass), so every ticked value
//     appears on a page of six.
//   * ONE NEW THING PER STEP (P-1, §2.2). "Time to Half Hour" deals :30 only; a lower step's
//     positions come back only through `review: some` (one in six).
//   * THE ANSWER IS NOT IN THE ITEM (§17 answer-in-item). No hint names the time, the minute value,
//     the total or the set; a write-the-time item carries no `options` (production stays
//     production, P-29); a choose-one cell prints THREE faces on paper.
//   * EDGE CASES ARE CONTENT (§2.3): 12:00 and 12:30, :05 and :55, quarter to 12 / to 1, crossing
//     the hour and 12, one coin, six of a coin, exactly 100, x.05 / x.50 / 0.75 / x.00, change
//     across zeros — seeded at fixed page positions, so every seeded page of six carries them.
//   * MONEY IS BOUNDED AND GENERIC (§2.1, §2.4, rulings Q1-Q3, Q6, Q12): totals bounded by the
//     band, coins by `tiles`; integer minor units only; generic value coins sized by value (the 50
//     at QR only); a currency adds unit words and notes, never a sign on a coin or a title.
//
// Every item carries `q.cell` (the sheet-kit template: `clock`, `timeline`, `coins` or
// `money-columns`), whose plain payload is also what the content gate (ws-content-audit, family
// `tm`) recomputes, and `q.visual`, the same template's screen twin. Randomness is Math.random,
// which generateQuestionFor() seeds, so a seed reprints the same page.

import { state } from './state.js';
import { randInt, shuffle } from './utils.js';
import { normalizeOptions } from './skill-options.js';
import { k2Twin, fmtTime, fmtDuration, toMin, fromMin, currencyOf, unitWord, fmtMoney, amountText } from './sheet/index.js';

/* ============================================================================ dealing */

let _liveCursor = -1;
let _at = 0;
const _offsets = {};
const _perms = {};
function beginItem() { _at = Number.isFinite(state.itemIndex) ? state.itemIndex : ++_liveCursor; }
/** Round-robin 0..n-1 off the page position, offset once per page so pages differ. */
function deal(key, n) {
    if (n <= 1) return 0;
    const k = `${key}:${n}`;
    if (_at === 0 || _offsets[k] === undefined) _offsets[k] = randInt(0, n - 1);
    return (((_at + _offsets[k]) % n) + n) % n;
}
/** A page-long permutation of 0..n-1 (shuffled at the page's first item), read at the position. */
function dealPerm(key, n, at = _at) {
    const k = `${key}:${n}`;
    if (_at === 0 || !_perms[k]) _perms[k] = shuffle(Array.from({ length: n }, (_, i) => i));
    return _perms[k][((at % n) + n) % n];
}
const pos6 = () => ((_at % 6) + 6) % 6;
/**
 * The position an EDGE case is seeded at. Every page of six still carries it (the content gate's
 * edge-seeded rule), but on the odd pages of six it runs from the other end, so a nine-item page
 * (a test, a guided page) meets each edge once, not twice (critic round 3: 12:00 three times, 12:45
 * twice, five of nine ending :05 or :55).
 */
const edge6 = () => (Math.floor(_at / 6) % 2 === 0 ? pos6() : 5 - pos6());

function optsOf(skill) {
    // A mixed parent's options (only `members`) never name a member's own options, so the member's
    // stand-alone defaults fill in (ruling R2).
    return normalizeOptions('measurement', skill, state.skillOptions);
}

/* ============================================================================ the item */

function setCell(q, template, payload, { twin = true } = {}) {
    q.cell = { template, v: 1, payload };
    q.visual = twin ? k2Twin(template, payload) : '';
    q.printFormat = `tm-${template}`;
    q.options = [];
    q.tm = { template, kind: payload.kind || payload.mode || payload.op || '', payload };
}

function refuse(q, msg) {
    q.refused = msg;
    q.text = msg;
    q.printText = '';
    q.ans = '';
    q.answerType = 'text';
    q.options = [];
    q.visual = '';
    q.hint = 'Ask your teacher to choose a currency.';
}

/** A choice cell: the screen twin's check boxes write the label into the host's input. */
function choiceAnswer(q, label) {
    q.ans = label;
    q.answerType = 'text';
    q.selfAnswering = true;
    q.printAnswer = label;
}

/* ============================================================================ time words (Q11) */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
const numWord = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
const h12 = (h) => ((h % 12) + 12) % 12 || 12;

/**
 * A time as a pupil hears it (ruling Q11, both spoken forms):
 *   numerals  "5 minutes past 2", "quarter to 3", "2 o'clock"    (the Say: frames' form)
 *   past      "five past two", "twenty to three", "two o'clock"
 *   oh        "two-oh-five", "two forty-five", "two o'clock"
 */
export function timeWords(h, m, style = 'numerals') {
    const H = h12(h), N = h12(h + 1);
    if (m === 0) return style === 'numerals' ? `${H} o'clock` : `${numWord(H)} o'clock`;
    if (style === 'oh') return m < 10 ? `${numWord(H)}-oh-${numWord(m)}` : `${numWord(H)} ${numWord(m)}`;
    const w = (n) => (style === 'numerals' ? String(n) : numWord(n));
    const minutesWord = (n) => (n % 5 === 0 && style === 'past' ? '' : (n === 1 ? ' minute' : ' minutes'));
    if (m === 15) return `quarter past ${w(H)}`;
    if (m === 30) return `half past ${w(H)}`;
    if (m === 45) return `quarter to ${w(N)}`;
    if (m < 30) return `${w(m)}${minutesWord(m)} past ${w(H)}`;
    return `${w(60 - m)}${minutesWord(60 - m)} to ${w(N)}`;
}

/* ============================================================================ face supports */

// The supports allocator (a later program) drives these payload flags directly, so each is an
// explicit, separable field of the cell payload: `numerals` (which numbers the face prints),
// `ring` ('auto' = Model / Guided only, 'on', 'off': the RP-103c minute ring) and, on coins,
// `dots` ('auto' | 'dots' | 'none': the RP-114 count-by-five dots).
const faceNumerals = (o) => (['all', 'quarters', 'twelve'].includes(o.numerals) ? o.numerals : 'all');
const ringFlag = (o) => (o.support === 'ring' ? 'on' : 'auto');

/* ============================================================================ reading (TR, TH) */

const READ_PRECISION = { time_hour: 60, time_half_hour: 30, time_quarter: 15, time_5min: 5, time_1min: 1 };
const FIVES_NEW = [5, 10, 20, 25, 35, 40, 50, 55];
const ONES_NEW = Array.from({ length: 60 }, (_, i) => i).filter((m) => m % 5 !== 0);

/** The minutes a precision step deals as its NEW positions (§2.2, §17 tm-precision). */
function newMinutes(skill, o) {
    switch (skill) {
        case 'time_hour': return [0];
        case 'time_half_hour': return [30];
        case 'time_quarter': {
            const d = Array.isArray(o.quarters) && o.quarters.length ? o.quarters : ['past', 'to'];
            return d.map((x) => (x === 'to' ? 45 : 15));
        }
        case 'time_5min': return FIVES_NEW;
        default: return ONES_NEW;
    }
}
/** The earlier steps' positions, for `review: some`. */
const REVIEW_MINUTES = { time_half_hour: [0], time_quarter: [0, 30], time_5min: [0, 15, 30, 45], time_1min: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] };

/** One reading time: its hour and minute, with the step's edge cases at fixed page positions. */
function readingTime(skill, o) {
    const k = edge6();
    // The edge case owns 12 (k === 0); every other item takes an hour 1-11 from a page-long
    // permutation, so no hour comes back until all eleven have been used (critic round 3).
    const hour = 1 + dealPerm(`${skill}:h11`, 11);
    if (o.review === 'some' && k === 5 && REVIEW_MINUTES[skill]) {
        const pool = REVIEW_MINUTES[skill];
        return { h: hour, m: pool[deal(`${skill}:rv`, pool.length)] };
    }
    const mins = newMinutes(skill, o);
    switch (skill) {
        case 'time_hour':
            if (k === 0) return { h: 12, m: 0 };
            return { h: hour, m: 0 };
        case 'time_half_hour':
            if (k === 0) return { h: 12, m: 30 };      // the hour hand between 12 and 1 (M-T2)
            return { h: hour, m: 30 };
        case 'time_quarter': {
            const m = mins[deal(`${skill}:q`, mins.length)];
            // 12:45 is quarter to 1, 12:15 quarter past 12: the page's edge alternates page by page.
            if (k === 0) return { h: 12, m: mins[Math.floor(_at / 6) % mins.length] };
            if (k === 1 && m === 45 && hour !== 11) return { h: 11, m };   // 11:45: quarter to 12
            return { h: hour, m };
        }
        case 'time_5min':
            if (k === 0) return { h: hour, m: 5 };      // the leading zero (M-T6)
            if (k === 1) return { h: hour, m: 55 };     // almost the next hour (M-T7)
            { const mid = FIVES_NEW.filter((x) => x !== 5 && x !== 55); return { h: hour, m: mid[dealPerm(`${skill}:m`, mid.length)] }; }   // :05 and :55 are the edges, once each
        default: {
            if (k === 0) return { h: hour, m: 10 * randInt(0, 5) + 3 };
            if (k === 1) return { h: hour, m: 10 * randInt(0, 5) + 7 };
            if (k === 2) return { h: hour, m: 58 };
            return { h: hour, m: ONES_NEW[randInt(0, ONES_NEW.length - 1)] };
        }
    }
}

function genReading(q, skill) {
    const o = optsOf(skill);
    const P = READ_PRECISION[skill];
    const { h, m } = readingTime(skill, o);
    // `stimulus` carries the spoken form too (ruling Q11): words / words-past / words-oh.
    const words = /^words/.test(String(o.stimulus || ''));
    const said = timeWords(h, m, o.stimulus === 'words-past' ? 'past' : o.stimulus === 'words-oh' ? 'oh' : 'numerals');
    if (o.response === 'draw') {
        setCell(q, 'clock', { kind: 'draw', h, m, precision: P, ring: ringFlag(o), numerals: faceNumerals(o),
            stimulus: words ? 'words' : 'digital', text: words ? said : fmtTime(h, m) }, { twin: false });
        q.text = `Draw the hands to show ${words ? said : fmtTime(h, m)}.`;
        q.answerType = 'clock-set';
        q.ans = { hour: h % 12, minute: m };
        q.minuteSnap = P === 1 ? 1 : 5;
        q.initialHour = 12;
        q.initialMinute = 0;
        q.hint = 'Draw the long hand first, to the minutes. Then the short hand, for the hour.';
        return;
    }
    if (words) {
        setCell(q, 'clock', { kind: 'words', h, m, precision: P, text: said });
        q.text = 'Write the time.';
        q.hint = 'The hour is the number after "past", or the number before the one after "to".';
    } else {
        setCell(q, 'clock', { kind: 'read', h, m, precision: P, ring: ringFlag(o), numerals: faceNumerals(o) });
        q.text = 'Write the time.';
        q.hint = P === 1
            ? 'The short hand has passed the hour. Count the minutes by fives from 12, then on by ones.'
            : P === 60 ? 'Look at the short hand for the hour. The long hand on 12 means o\'clock.'
                : 'The short hand shows the hour it has passed. Count the minutes by fives from 12.';
    }
    q.ans = fmtTime(h, m);
    q.answerType = 'text';
}

/* ============================================================================ match and order (TO) */

/** Three faces: the time and two distractors from the misconception bank (§14). */
function distractorFaces(h, m, P) {
    const cands = [];
    cands.push({ h: h12(h + 1), m, why: 'M-T2' });                                   // took the next hour
    if (m !== 0 && m % 5 === 0 && m / 5 !== h % 12) cands.push({ h: h12(m / 5), m: (h % 12) * 5, why: 'M-T3' });   // swapped hands
    if (m === 15 || m === 45) cands.push({ h, m: 60 - m, why: 'M-T4' });              // quarter past <-> quarter to
    if (m % 5 === 0 && m > 0 && m / 5 !== m) cands.push({ h, m: m / 5, why: 'M-T1' }); // numeral read as minutes
    cands.push({ h: h12(h - 1), m, why: 'off-by-one' });
    cands.push({ h, m: (m + 30) % 60, why: 'half-turn' });
    const seen = new Set([`${h12(h)}:${m}`]);
    const out = [];
    for (const c of cands) {
        const key = `${h12(c.h)}:${c.m}`;
        if (seen.has(key)) continue;
        if (P >= 5 && c.m % Math.min(P, 5) !== 0 && c.why !== 'M-T1') continue;
        seen.add(key);
        out.push({ h: h12(c.h), m: c.m });
        if (out.length === 2) break;
    }
    return out;
}

function precisionTime(P, key) {
    const hour = 1 + dealPerm(`${key}:h`, 12);
    if (P === 60) return { h: hour, m: 0 };
    if (P === 30) return { h: hour, m: 30 * deal(`${key}:m`, 2) };
    if (P === 15) return { h: hour, m: 15 * deal(`${key}:m`, 4) };
    if (P === 5) return { h: hour, m: 5 * dealPerm(`${key}:m`, 12) };
    return { h: hour, m: randInt(0, 59) };
}

function genAnalogDigital(q, skill) {
    const o = optsOf(skill);
    const P = Number(o.precision) || 5;
    const t = precisionTime(P, skill);
    if (o.dir === 'to-analog') {
        const faces = [{ h: t.h, m: t.m }, ...distractorFaces(t.h, t.m, P)];
        const correct = deal(`${skill}:c`, 3);
        const order = [faces[1], faces[2]];
        order.splice(correct, 0, faces[0]);
        setCell(q, 'clock', { kind: 'choose', h: t.h, m: t.m, precision: P, stimulus: 'digital', text: fmtTime(t.h, t.m), faces: order, correct, numerals: faceNumerals(o) });
        q.text = 'Check the clock that shows the time.';
        choiceAnswer(q, ['A', 'B', 'C'][correct]);
        q.hint = 'Read the hour on the digital clock. Find the short hand that has just passed it.';
        return;
    }
    setCell(q, 'clock', { kind: 'read', h: t.h, m: t.m, precision: P, readoutSlot: true, ring: 'auto', numerals: faceNumerals(o) });
    q.text = 'Write the time.';
    q.ans = fmtTime(t.h, t.m);
    q.answerType = 'text';
    q.hint = 'Read the short hand for the hour, then count the minutes on the long hand.';
}

function genMatchClock(q, skill) {
    const o = optsOf(skill);
    const P = Number(o.precision) || 5;
    const t = precisionTime(P, skill);
    const faces = [{ h: t.h, m: t.m }, ...distractorFaces(t.h, t.m, P)];
    const correct = deal(`${skill}:c`, 3);
    const order = [faces[1], faces[2]];
    order.splice(correct, 0, faces[0]);
    const said = timeWords(t.h, t.m, o.words || 'numerals');
    setCell(q, 'clock', { kind: 'choose', h: t.h, m: t.m, precision: P, stimulus: 'words', text: said, faces: order, correct, numerals: faceNumerals(o) });
    q.text = 'Check the clock that shows the time.';
    choiceAnswer(q, ['A', 'B', 'C'][correct]);
    q.hint = 'Say the time in numbers first. Then look for its short hand and its long hand.';
}

function genOrderClocks(q, skill) {
    const o = optsOf(skill);
    const n = [3, 4, 5].includes(Number(o.tiles)) ? Number(o.tiles) : 3;
    const P = [60, 30, 15, 5].includes(Number(o.precision)) ? Number(o.precision) : 15;
    const analog = skill.indexOf('analog') !== -1;
    const asc = skill.endsWith('asc');
    const across = o.noon === 'across';
    // Minutes since midnight. One morning (7-11 a.m.) or one afternoon (1-5 p.m.), never 12
    // (ruling Q10); across 12 runs 10 a.m. to 2 p.m. with a.m. / p.m. printed on every clock.
    const pm = !across && deal(`${skill}:pm`, 2) === 1;
    const lo = across ? 10 * 60 : pm ? 13 * 60 : 7 * 60;
    const hi = across ? 14 * 60 + 45 : pm ? 17 * 60 + 45 : 11 * 60 + 45;
    const step = Math.max(P, 15) === 60 ? 60 : P;
    const slots = [];
    for (let t = lo; t <= hi; t += step) slots.push(t);
    let picked;
    for (let tries = 0; tries < 40; tries++) {
        picked = shuffle(slots.slice()).slice(0, n);
        if (!across || (picked.some((t) => t < 12 * 60) && picked.some((t) => t >= 12 * 60 && t < 13 * 60) && picked.some((t) => t >= 13 * 60))) break;
    }
    // The ORDER is dealt, not left to the shuffle: a page runs through every arrangement that is
    // not already in order (a row that is its own answer teaches nothing) before one comes back,
    // so the ranks are never one copyable pattern down the page (critic round 3: 1, 3, 2 on every
    // item).
    const sortedT = picked.slice().sort((a, b) => (asc ? a - b : b - a));
    const pats = rankPatterns(n);
    const pat = pats[dealPerm(`${skill}:pat`, pats.length)];
    picked = pat.map((r) => sortedT[r - 1]);
    const ranks = pat.slice();
    const times = picked.map((t) => { const x = fromMin(t); return { h: x.h, m: x.m, ...(across ? { ap: x.h >= 12 ? 'p.m.' : 'a.m.' } : {}) }; });
    setCell(q, 'clock', { kind: 'order', analog, dir: asc ? 'asc' : 'desc', times, ranks, precision: P, numerals: faceNumerals(o) });
    q.text = asc ? 'Write 1, 2, 3 under the clocks. Start with the earliest.' : 'Write 1, 2, 3 under the clocks. Start with the latest.';
    q.ans = ranks.join(', ');
    q.answerType = 'text';
    q.hint = asc ? 'Read every clock first. The earliest time gets 1.' : 'Read every clock first. The latest time gets 1.';
}

/** Every arrangement of ranks 1..n except 1, 2, ..., n itself (n <= 5). */
const _pats = {};
function rankPatterns(n) {
    if (_pats[n]) return _pats[n];
    const out = [];
    const walk = (pre, rest) => {
        if (!rest.length) { if (pre.some((v, i) => v !== i + 1)) out.push(pre); return; }
        rest.forEach((v, i) => walk(pre.concat(v), rest.slice(0, i).concat(rest.slice(i + 1))));
    };
    walk([], Array.from({ length: n }, (_, i) => i + 1));
    _pats[n] = out;
    return out;
}

/* ============================================================================ elapsed (TE) */

/**
 * One elapsed item. `mode` later | earlier | duration | start; `durs` the durations (minutes) the
 * step allows; `startStep` the minute step of the given time; `spanH` the line's length in hours.
 */
function elapsedItem(q, skill, { mode, durs, startStep, spanH, tickStep, support = 'labels', answer = 'time', faces = null, noon = 'never', response = 'write', seeds = [], both = false, numerals = null }) {
    const k = pos6();
    let total = durs[dealPerm(`${skill}:d`, durs.length)];
    // Crossing noon (TE-9): some items start before 12 and end after it, a.m. / p.m. printed.
    const crossNoon = noon === 'seeded' && (k === 2 || k === 5);
    let start;
    const seed = seeds[k];
    if (seed) {
        total = seed.total ? seed.total : total;
        start = seed.start;
        // a seed whose total is 0 crosses 12 on the face: the smallest whole-hour total that does
        if (seed.total === 0) total = durs.find((d) => start + d > 12 * 60) || durs[durs.length - 1];
    }
    if (start === undefined) {
        if (crossNoon) {
            const latest = 12 * 60 - startStep;
            const earliest = Math.max(12 * 60 - total + startStep, 9 * 60);
            const steps = Math.max(0, Math.floor((latest - earliest) / startStep));
            start = earliest + startStep * randInt(0, steps);
            if (start + total <= 12 * 60) start = 12 * 60 - Math.max(startStep, Math.min(total - startStep, 60));
        } else {
            // One afternoon: 1:00 to 11:xx p.m. on the 12-hour face, never touching 12 (M-E3 is a
            // seeded case of its own, below).
            const lo = 13 * 60, hi = 24 * 60 - 60 - total;
            const steps = Math.max(0, Math.floor((hi - lo) / startStep));
            start = lo + startStep * randInt(0, steps);
        }
    }
    const end = start + total;
    const ampm = crossNoon || !!(seed && seed.ampm);
    const s = fromMin(start), e = fromMin(end);
    // The line: `spanH` + 1 hours from the given time's hour (never fitted to the answer).
    const given = mode === 'earlier' || mode === 'start' ? end : start;
    const back = mode === 'earlier' || mode === 'start';
    const hours = spanH + 1;
    const from = back ? (Math.ceil(given / 60) * 60 === given ? given - 60 * (hours - 1) : Math.ceil(given / 60) * 60 - 60 * hours) : Math.floor(given / 60) * 60;
    const payload = {
        mode, start: { h: s.h, m: s.m }, end: { h: e.h, m: e.m }, total, step: tickStep,
        axis: { from: ((from % 1440) + 1440) % 1440, hours }, support, answer, ampm, response,
        ...(faces ? { faces } : {}), ...(both ? { both: true } : {}), ...(numerals ? { numerals } : {}),
    };
    setCell(q, 'timeline', payload, { twin: response !== 'draw' });
    const durText = fmtDuration(Math.floor(total / 60), total % 60);
    if (mode === 'duration') {
        q.text = 'Use the time line. Write how long it takes.';
        if (answer === 'minutes') { q.ans = total; q.answerType = 'number'; } else { q.ans = durText; q.answerType = 'text'; }
        q.hint = 'Start at the start time. Hop to the next hours, then count the minutes to the end.';
    } else {
        const t = mode === 'later' ? e : s;
        q.text = mode === 'later' ? 'Use the time line. Write the end time.' : 'Use the time line. Write the start time.';
        if (response === 'draw') {
            q.answerType = 'clock-set';
            q.ans = { hour: t.h % 12, minute: t.m };
            q.minuteSnap = 5;
            q.initialHour = 12;
            q.initialMinute = 0;
            q.text = mode === 'later'
                ? `Start at ${fmtTime(s.h, s.m)}. Show the time ${durWordsShort(total)} later.`
                : `End at ${fmtTime(e.h, e.m)}. Show the time ${durWordsShort(total)} earlier.`;
        } else {
            q.ans = fmtTime(t.h, t.m);
            q.answerType = 'text';
        }
        q.hint = back ? 'Start at the end time. Hop back the hours, then the minutes.' : 'Start at the start time. Hop the hours, then the minutes.';
        // A page dealing later AND earlier carries one instruction for both (the cell's own
        // Start / End label names the time to write).
        if (both && response !== 'draw') q.text = 'Use the time line. Write the missing time.';
    }
    q.tm.ampm = ampm;
}
const durWordsShort = (total) => {
    const h = Math.floor(total / 60), m = total % 60;
    return [h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '', m ? `${m} minutes` : ''].filter(Boolean).join(' ');
};

function genElapsed(q, skill) {
    const o = optsOf(skill);
    const support = ['labels', 'pupil', 'none'].includes(o.support) ? o.support : 'labels';
    // "Later or earlier" (the skills' names): `both` deals the two directions down one page,
    // alternately; `later` / `earlier` keep one direction per page (critic round 3).
    const both = o.dir === 'both';
    const dir = both ? (dealPerm(`${skill}:dir`, 2) === 0 ? 'later' : 'earlier') : o.dir === 'earlier' ? 'earlier' : 'later';
    // An afternoon hour (1 p.m. - 8 p.m.) for a seeded edge: the edge is the MINUTE, so the hour is
    // drawn, and a role's model, its first item and its test never repeat one item (critic round 3).
    const pmHour = (lo = 13, hi = 20) => 60 * randInt(lo, hi);
    switch (skill) {
        case 'elapsed_hour': {
            const spanH = Number(o.hours) === 5 ? 5 : 3;
            const durs = Array.from({ length: spanH }, (_, i) => 60 * (i + 1));
            elapsedItem(q, skill, {
                mode: dir, durs, startStep: 60, spanH, tickStep: 30, support, response: o.response === 'draw' ? 'draw' : 'write', both,
                // a whole-hour interval from a non-zero minute (4:15 + 2 h), and crossing 12 on the face (11:30 + 2 h = 1:30)
                seeds: {
                    1: { start: pmHour(13, 18) + 15 * randInt(1, 3), total: 60 * randInt(1, Math.min(2, spanH)) },
                    3: { start: (spanH >= 3 && randInt(0, 1) ? 10 : 11) * 60 + 30, total: 0 },
                },
            });
            return;
        }
        case 'elapsed_30min':
            elapsedItem(q, skill, { mode: dir, durs: [30], startStep: 15, spanH: 1, tickStep: 15, support, both,
                seeds: { 0: { start: pmHour() + 45 }, 2: { start: pmHour() + 30 } } });   // crossing the hour
            return;
        case 'elapsed_15min': {
            const set = Array.isArray(o.step) && o.step.length ? o.step.map(Number).filter((x) => [15, 30, 45].includes(x)) : [15];
            const use = set.length ? set : [15];
            // crossing the hour: the start's minutes and the step make 60 or more
            const t0 = use[dealPerm(`${skill}:t0`, use.length)];
            elapsedItem(q, skill, { mode: dir, durs: use, startStep: 15, spanH: 1, tickStep: 15, support, both,
                seeds: { 0: { start: pmHour() + 15 * randInt(Math.max(1, Math.ceil((60 - t0) / 15)), 3), total: t0 } } });
            return;
        }
        default: break;
    }
    const spanH = [2, 3, 5].includes(Number(o.hours)) ? Number(o.hours) : 3;
    const step = [15, 5, 1].includes(Number(o.step)) ? Number(o.step) : 15;
    const durs = [];
    for (let hh = 1; hh < spanH; hh++) for (let mm = step; mm < 60; mm += step) durs.push(hh * 60 + mm);
    if (spanH <= 1 || !durs.length) for (let mm = step; mm < 60; mm += step) durs.push(mm);
    const tick = step === 15 ? 15 : 5;
    const startStep = step === 1 ? 1 : step;
    const noon = o.noon === 'seeded' ? 'seeded' : 'never';
    if (skill === 'elapsed_mixed') {
        // minutes pass 60 (M-E2): a :45 start and more than 15 minutes on top, at a drawn hour
        const extra = step === 15 ? 15 * randInt(2, 3) : step === 5 ? 5 * randInt(4, 11) : randInt(16, 58);
        elapsedItem(q, skill, { mode: 'later', durs, startStep, spanH, tickStep: tick, support, noon,
            seeds: { 0: { start: 60 * randInt(13, 18) + 45, total: 60 * randInt(1, Math.max(1, spanH - 1)) + extra } } });
    } else if (skill === 'elapsed_find_duration') {
        elapsedItem(q, skill, { mode: 'duration', durs, startStep, spanH, tickStep: tick, support, noon, answer: o.response === 'minutes' ? 'minutes' : 'hm' });
    } else if (skill === 'elapsed_find_start') {
        elapsedItem(q, skill, { mode: 'start', durs, startStep, spanH, tickStep: tick, support, noon });
    } else {
        // elapsed_visual_*: two faces give the start and the end; easy 30, medium 15, hard 5.
        const vstep = skill === 'elapsed_visual_easy' ? 30 : skill === 'elapsed_visual_medium' ? 15 : 5;
        const vd = [];
        for (let t = vstep; t <= 180; t += vstep) vd.push(t);
        const facesOpt = ['analog', 'digital', 'mixed'].includes(o.notation) ? o.notation : 'analog';
        elapsedItem(q, skill, { mode: 'duration', durs: vd, startStep: vstep, spanH: 3, tickStep: vstep === 30 ? 30 : vstep === 15 ? 15 : 5, support, faces: facesOpt,
            numerals: facesOpt !== 'digital' && faceNumerals(o) !== 'all' ? faceNumerals(o) : null });
    }
}

/* ============================================================================ clock parts, fives, a.m./p.m. */

function genClockParts(q, skill) {
    const o = optsOf(skill);
    if (o.task === 'hands') {
        const t = { h: 1 + dealPerm(`${skill}:h`, 12), m: 5 * randInt(1, 11) };
        const hourLetter = deal(`${skill}:l`, 2) === 0 ? 'A' : 'B';
        setCell(q, 'clock', { kind: 'parts', task: 'hands', h: t.h, m: t.m, hourLetter, ...(faceNumerals(o) !== 'all' ? { numerals: faceNumerals(o) } : {}) });
        // Its own print format, so a page's instruction line (read before any item, from the
        // provider's chooseRef) names this task, not "Write the missing numbers".
        q.printFormat = 'tm-clock-hands';
        q.text = 'Which is the hour hand? Check one box.';
        choiceAnswer(q, hourLetter);
        q.hint = 'The hour hand is the short hand.';
        return;
    }
    // O6 (AP4) "Numbers on the clock": which numbers the face prints, as on every clock skill.
    // 3 to 5 places are always boxes to write (the task); with 12, 3, 6 and 9 only, or 12 only,
    // the boxes come from the places that are not printed and the other places are left empty, so
    // the pupil counts round from the nearest printed number. At `all` (the default) the item is
    // dealt exactly as before.
    const printed = faceNumerals(o);
    const pool = printed === 'quarters' ? [1, 2, 4, 5, 7, 8, 10, 11] : printed === 'twelve' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : Array.from({ length: 12 }, (_, i) => i + 1);
    const nMiss = 3 + deal(`${skill}:n`, 3);
    const all = shuffle(pool.slice());
    const missing = all.slice(0, nMiss).sort((a, b) => a - b);
    // The 12 is always missing on one item a page: the top number pupils most often leave out.
    if (printed === 'all' && pos6() === 0 && !missing.includes(12)) { missing.pop(); missing.push(12); missing.sort((a, b) => a - b); }
    setCell(q, 'clock', { kind: 'parts', task: 'numerals', missing, ...(printed !== 'all' ? { numerals: printed } : {}) });
    q.text = 'Write the missing numbers on the clock.';
    q.ans = missing.join(', ');
    q.answerType = 'text';
    q.hint = 'Count round the clock from the top, one number at each big mark.';
}

function genFivesRing(q, skill) {
    const o = optsOf(skill);
    let given = [];
    if (o.task !== 'all') {
        const nGiven = 3 + deal(`${skill}:n`, 3);
        given = shuffle(Array.from({ length: 11 }, (_, i) => i + 1)).slice(0, nGiven);
        given.push(12);
        given.sort((a, b) => a - b);
    }
    // O6 (AP4): the hour numbers printed on the face; the minute boxes round it never change.
    setCell(q, 'clock', { kind: 'fives', given, ...(faceNumerals(o) !== 'all' ? { numerals: faceNumerals(o) } : {}) });
    const vals = [];
    for (let i = 1; i <= 12; i++) if (!given.includes(i)) vals.push(i === 12 ? 0 : i * 5);
    q.text = 'Count by 5. Write the minutes round the clock.';
    q.ans = vals.join(', ');
    q.answerType = 'text';
    q.hint = 'Start at 12 with 0. Count on by 5 at each number.';
}

const ACTIVITIES = [
    { text: 'Wake up', h: 6, m: 30, ap: 'a.m.' }, { text: 'Eat breakfast', h: 7, m: 0, ap: 'a.m.' },
    { text: 'School starts', h: 7, m: 30, ap: 'a.m.' }, { text: 'Break time', h: 10, m: 0, ap: 'a.m.' },
    { text: 'Walk to school', h: 7, m: 15, ap: 'a.m.' }, { text: 'Maths lesson', h: 9, m: 0, ap: 'a.m.' },
    { text: 'Eat a snack', h: 10, m: 30, ap: 'a.m.' }, { text: 'Brush your teeth', h: 6, m: 45, ap: 'a.m.' },
    { text: 'Eat lunch', h: 12, m: 30, ap: 'p.m.' }, { text: 'Play in the park', h: 4, m: 30, ap: 'p.m.' },
    { text: 'Eat dinner', h: 7, m: 0, ap: 'p.m.' }, { text: 'Go to bed', h: 8, m: 30, ap: 'p.m.' },
    { text: 'School ends', h: 2, m: 30, ap: 'p.m.' }, { text: 'Swimming lesson', h: 3, m: 45, ap: 'p.m.' },
    { text: 'Read a bedtime story', h: 8, m: 0, ap: 'p.m.' }, { text: 'Do homework', h: 5, m: 0, ap: 'p.m.' },
];
/** The a.m. / p.m. pattern of a page: each run of six holds three of each in a dealt order, so the
 *  answers never simply alternate (critic round 3: a, p, a, p ... could be guessed). */
const _apBlocks = {};
function apAt(skill, at) {
    const b = Math.floor(at / 6);
    const key = `${skill}:${b}`;
    if (_at === 0) for (const k of Object.keys(_apBlocks)) delete _apBlocks[k];
    if (!_apBlocks[key]) _apBlocks[key] = shuffle([true, true, true, false, false, false]);
    return _apBlocks[key][((at % 6) + 6) % 6];
}
function genTimeSense(q, skill) {
    const am = ACTIVITIES.filter((a) => a.ap === 'a.m.'), pm = ACTIVITIES.filter((a) => a.ap === 'p.m.');
    const pickAm = apAt(skill, _at);
    const pool = pickAm ? am : pm;
    // Each list is read at its own running count, so no activity repeats until the list is used up.
    let n = 0;
    for (let j = 0; j < _at; j++) if (apAt(skill, j) === pickAm) n++;
    const a = pool[dealPerm(`${skill}:${pickAm ? 'a' : 'p'}`, pool.length, n)];
    setCell(q, 'clock', { kind: 'sense', h: a.h, m: a.m, ap: a.ap, activity: a.text });
    q.text = 'Read the time. Check a.m. or p.m.';
    choiceAnswer(q, a.ap);
    q.hint = 'Morning is before 12 noon. Afternoon, evening and night come after 12 noon.';
}

/* ============================================================================ money */

/** The coin values this item may use: the ticked ones in the currency's set, else its usual set (Q12). */
function coinSet(o) {
    const c = currencyOf(o.currency);
    const ticked = Array.isArray(o.values) ? o.values.map(Number).filter((v) => c.coins.includes(v)) : [];
    // None ticked, or all four, is the currency's usual set (at Qatari riyal 50 and 25 first, Q12).
    if (ticked.length && ticked.length < 4) return ticked.slice().sort((a, b) => b - a);
    return o.currency === 'qar' ? [50, 25] : c.coins.slice().sort((a, b) => b - a);
}
const sum = (list) => list.reduce((a, b) => a + b, 0);

/** A random collection of `n` coins from `vals`, total <= cap, biggest first. */
function randomCoins(vals, n, cap) {
    for (let t = 0; t < 60; t++) {
        const out = Array.from({ length: n }, () => vals[randInt(0, vals.length - 1)]);
        if (sum(out) <= cap) return out.sort((a, b) => b - a);
    }
    const small = Math.min(...vals);
    return Array.from({ length: Math.max(1, Math.min(n, Math.floor(cap / small))) }, () => small);
}

function scatter(list) {
    // Scattered (MC-6): never already biggest first.
    for (let t = 0; t < 8; t++) {
        const s = shuffle(list.slice());
        if (s.some((v, i) => i && v > s[i - 1])) return s;
    }
    return list.slice().reverse();
}

// O6 APPEARANCE (lane AP4): "Coins set out" on every coin skill that draws a collection of coins
// to count or compare (equiv_coin_sets, enough_money, money_compare, money_notation). `largest`
// (the default) is today's row, biggest coin first; `scrambled` scatters the same coins, so the
// pupil must find the biggest coin before counting on. The coins and the answer never change, and
// at the default nothing is shuffled, so an untouched page draws exactly the same random numbers.
const coinsScattered = (o) => /^scrambled/.test(String(o.order || ''));
/**
 * The coins as set out: scattered when asked (and there is more than one kind to scatter). The
 * arrangement is DEALT, not shuffled, so it draws no random number: a scattered page holds exactly
 * the default page's coins, amounts and answers, and only their arrangement changes (P-1). The
 * coins are laid smallest, biggest, next smallest, next biggest ..., turned by the item's place on
 * the page so the biggest coin is not always second; never biggest first.
 */
function dealtScatter(coins) {
    const c = coins.slice().sort((a, b) => b - a);
    const zig = [];
    for (let lo = c.length - 1, hi = 0; hi <= lo; lo--, hi++) { zig.push(c[lo]); if (hi !== lo) zig.push(c[hi]); }
    const k = ((_at % zig.length) + zig.length) % zig.length;
    const turned = zig.slice(k).concat(zig.slice(0, k));
    const tidy = (l) => l.every((v, i) => !i || v <= l[i - 1]);
    return tidy(turned) ? zig : turned;
}
function setOut(o, coins) {
    return coinsScattered(o) && new Set(coins).size > 1 ? { coins: dealtScatter(coins), scatter: 'soft' } : { coins };
}

// Plain numbers have no notes of their own beyond 20 (tmkit CURRENCIES), so a Plain page of notes
// "to 100" or "to 500" could only reach 80. A plain note is a generic value rectangle like a plain
// coin, so Plain counts notes of 1 to 100 (option-panel round 3, OPTIONS-CRITIC-R2 §5 #16).
const PLAIN_NOTES = [1, 5, 10, 20, 50, 100];

function genMoneyCount(q, skill) {
    const o = optsOf(skill);
    const c = currencyOf(o.currency);
    // What to count (the old notes kinds are folded into note / both by skill-options.js).
    const kind = ['like', 'two', 'mixed', 'note', 'both'].includes(o.kind) ? o.kind : 'like';
    const band = Number(o.band) || 100;
    // Coins in a cell: six fit a half-width cell; "Totals to 500" (or an old "Coins at most: 10")
    // deals up to ten, a full-width row.
    const maxN = Number(o.tiles) === 10 || band >= 500 ? 10 : 6;
    const order = String(o.order || 'largest');
    const k = pos6();
    if (kind === 'note' || kind === 'both') {
        // Notes total to the band in WHOLE units (the notes' own totals: to 20, 100, 500).
        const capMajor = band;
        const notesAll = (o.currency === 'plain' ? PLAIN_NOTES : c.notes).filter((v) => v <= capMajor);
        let notes;
        if (k <= 1 && kind === 'note') {
            const v = notesAll[dealPerm(`${skill}:nv`, notesAll.length)];
            const cnt = Math.max(1, Math.min(5, maxN, Math.floor(capMajor / v), 1 + randInt(1, 4)));
            notes = Array.from({ length: cnt }, () => v);                  // like notes: "five 10 notes"
        } else if (k === 2 && o.currency === 'qar' && capMajor >= 70) {
            notes = [50, 10, 10];                                          // the 50 -> 60 -> 70 jump (no 20 note)
        } else {
            notes = randomCoins(notesAll, Math.min(maxN, 1 + randInt(1, kind === 'both' ? 2 : 3)), capMajor);
        }
        notes.sort((a, b) => b - a);
        if (kind === 'note') {
            const total = sum(notes);
            setCell(q, 'coins', { kind: 'count', notes, coins: [], currency: o.currency, answer: 'major', total, dots: 'none' });
            q.printFormat = 'tm-notes';
            q.text = 'Count the money. Write the total.';
            q.ans = total;
            q.answerType = 'number';
            q.hint = 'Start with the biggest note. Count on for each note.';
            return;
        }
        const coinVals = coinSet(o).filter((v) => v < 100);
        const coins = randomCoins(coinVals, 1 + randInt(1, 3), 99);
        const total = sum(notes) * 100 + sum(coins);
        setCell(q, 'coins', { kind: 'count', notes, coins, currency: o.currency, answer: 'two', total, dots: 'none' });
        q.printFormat = 'tm-notes-coins';
        q.text = 'Count the notes, then the coins. Write both numbers.';
        q.ans = `${sum(notes)}, ${sum(coins)}`;
        q.answerType = 'text';
        q.hint = 'Count the notes first. Then count the coins.';
        return;
    }
    const vals = coinSet(o).filter((v) => v <= band);
    if (!vals.length) { refuse(q, `Totals to ${band} are too small for these coins: choose a bigger total.`); return; }
    let coins;
    if (kind === 'like') {
        const v = vals[deal(`${skill}:v`, vals.length)];
        const most = Math.max(1, Math.min(maxN, Math.floor(band / v)));
        let n;
        if (k === 0) n = 1;                                               // a single coin
        else if (k === 1) n = most;                                       // as many as the cell holds (six 10s)
        else if (k === 2 && v === 25 && band >= 100 && maxN >= 4) n = 4;   // exactly 100
        else n = randInt(Math.min(2, most), most);
        coins = Array.from({ length: n }, () => v);
    } else if (kind === 'two' && vals.length >= 2) {
        const pairs = [];
        for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) pairs.push([vals[i], vals[j]]);
        const [a, b] = pairs[deal(`${skill}:p`, pairs.length)];
        coins = null;
        for (let t = 0; t < 40 && !coins; t++) {
            const na = randInt(1, Math.max(1, maxN - 1)), nb = randInt(1, Math.max(1, maxN - na));
            const list = [...Array(na).fill(a), ...Array(nb).fill(b)];
            if (sum(list) <= band) coins = list;
        }
        if (!coins) coins = [a, b].filter((v) => v <= band);
    } else {
        const n = randInt(3, maxN === 10 ? 9 : 6);                        // ten coins: up to nine mixed
        coins = randomCoins(vals, n, band);
        if (k === 3 && vals.includes(25) && vals.includes(10) && vals.includes(5) && band >= 75) coins = [25, 25, 10, 10, 5].slice(0, Math.min(5, maxN));   // M-M3
    }
    coins.sort((x, y) => y - x);
    const scattered = /^scrambled/.test(order);
    if (scattered && new Set(coins).size > 1) coins = scatter(coins);
    const total = sum(coins);
    // "Coins set out": the -dots values keep the count-by-five dots on every page (an old code's
    // `support: dots` is folded into them); otherwise they show on Model and Guided pages only.
    const dots = /-dots$/.test(order) || o.support === 'dots' ? 'dots' : 'auto';
    setCell(q, 'coins', { kind: 'count', coins, notes: [], currency: o.currency, answer: 'minor', total, dots, ...(scattered ? { scatter: true } : {}) });
    q.text = 'Count the coins. Write the total.';
    q.ans = total;
    q.answerType = 'number';
    q.hint = scattered ? 'Find the biggest coin first. Count on from it.' : 'Start with the biggest coin. Count on by each coin\'s value.';
}

/** Does a + b (or a - b) regroup in any column of the minor-unit digits? */
function regroups(a, b, op) {
    const da = String(a).split('').reverse().map(Number), db = String(b).split('').reverse().map(Number);
    let carry = 0;
    for (let i = 0; i < Math.max(da.length, db.length); i++) {
        const x = da[i] || 0, y = db[i] || 0;
        if (op === '+') { if (x + y + carry >= 10) return true; carry = 0; }
        else { if (x - carry < y) return true; carry = 0; }
    }
    return false;
}
const wantRegroup = (o, k) => (o.regroup === 'always' ? true : o.regroup === 'none' ? false : k % 2 === 1);

function genMoneyAdd(q, skill) {
    const o = optsOf(skill);
    const band = Number(o.band) || 500;
    const step = [100, 25, 5, 1].includes(Number(o.step)) ? Number(o.step) : 100;
    const want = wantRegroup(o, pos6());
    let a = 0, b = 0;
    for (let t = 0; t < 200; t++) {
        const total = step * randInt(Math.max(2, Math.ceil(band * 0.3 / step)), Math.floor(band / step));
        a = step * randInt(1, total / step - 1);
        b = total - a;
        if (a < b) [a, b] = [b, a];
        if (regroups(a, b, '+') === want) break;
    }
    const cents = step < 100;
    setCell(q, 'money-columns', { op: '+', a, b, band, cents, currency: o.currency, sign: o.currency !== 'plain' && cents });
    q.text = 'Add the prices.';
    if (cents) { q.ans = fmtMoney(a + b); q.answerType = 'text'; } else { q.ans = (a + b) / 100; q.answerType = 'number'; }
    q.hint = cents ? 'Line up the points. Add the right column first.' : 'Add the ones first, then the tens.';
}

const NEXT_NOTE = { plain: [1, 5, 10, 20], qar: [1, 5, 10, 50, 100, 200, 500], usd: [1, 5, 10, 20, 50, 100] };
function genMoneyChange(q, skill) {
    const o = optsOf(skill);
    const band = Number(o.band) || 500;
    const step = [100, 25, 5, 1].includes(Number(o.step)) ? Number(o.step) : 25;
    const k = pos6();
    const want = wantRegroup(o, k);
    let price = 0, paid = 0;
    for (let t = 0; t < 200; t++) {
        price = step * randInt(1, Math.max(1, Math.floor((band - 1) / step)));
        if (o.paid === 'note') {
            const notes = (NEXT_NOTE[o.currency] || NEXT_NOTE.plain).map((v) => v * 100);
            paid = notes.find((v) => v > price) || 0;
        } else {
            paid = (Math.floor(price / 100) + 1) * 100;
        }
        if (!paid || paid > band || paid === price) continue;
        // a step in cents deals a price with cents: 2.00 - 1.00 is not a change-with-cents item
        if (step < 100 && price % 100 === 0) continue;
        if (k === 0 && step < 100 && paid % 100 === 0 && price % 100 !== 0) break;   // across zeros (5.00 - 3.25)
        if (regroups(paid, price, '-') === want) break;
    }
    if (!paid || paid > band) { paid = Math.min(band, 100 * Math.ceil((price + 1) / 100)); }
    const cents = step < 100;
    setCell(q, 'money-columns', { op: '-', a: paid, b: price, band, cents, currency: o.currency, sign: o.currency !== 'plain' && cents, paid: o.paid === 'note' ? 'note' : 'unit' });
    q.text = 'Subtract to find the change.';
    if (cents) { q.ans = fmtMoney(paid - price); q.answerType = 'text'; } else { q.ans = (paid - price) / 100; q.answerType = 'number'; }
    q.hint = 'Take the price from the money paid. Regroup across the zeros if you need to.';
}

function genEquivSets(q, skill) {
    const o = optsOf(skill);
    const band = Number(o.band) || 50;
    const vals = coinSet(o).filter((v) => v <= band);
    const makes = dealPerm(`${skill}:y`, 2) === 0;
    let coins, target;
    for (let t = 0; t < 80; t++) {
        coins = randomCoins(vals, randInt(2, 5), band);
        const s = sum(coins);
        target = makes ? s : s + (randInt(0, 1) ? 5 : -5) * randInt(1, 2);
        if (target > 0 && target <= band && (makes || target !== s)) break;
    }
    const eqOut = setOut(o, coins);
    setCell(q, 'coins', { kind: 'check', coins: eqOut.coins, currency: o.currency, target, makes, dots: 'none', ...(eqOut.scatter ? { scatter: eqOut.scatter } : {}) });
    q.text = 'Do the coins make the amount? Check one box.';
    choiceAnswer(q, makes ? 'Yes' : 'No');
    q.hint = 'Count the coins, biggest first. Then compare with the amount.';
}

/** The fewest-coin counts (in `values` order) that make `target` exactly, or null. */
export function fewestCounts(values, target) {
    const best = new Array(target + 1).fill(Infinity), from = new Array(target + 1).fill(-1);
    best[0] = 0;
    for (let a = 1; a <= target; a++) values.forEach((v, i) => { if (v <= a && best[a - v] + 1 < best[a]) { best[a] = best[a - v] + 1; from[a] = i; } });
    if (!Number.isFinite(best[target])) return null;
    const counts = values.map(() => 0);
    for (let a = target; a > 0; a -= values[from[a]]) counts[from[a]]++;
    return counts;
}

function genFewestCoins(q, skill) {
    const o = optsOf(skill);
    const c = currencyOf(o.currency);
    const band = Number(o.band) || 50;
    const ticked = Array.isArray(o.values) ? o.values.map(Number).filter((v) => c.coins.includes(v)) : [];
    const values = (ticked.length && ticked.length < 4 ? ticked : c.coins).filter((v) => v <= Math.max(band, 25)).slice().sort((a, b) => b - a);
    // Every amount must be makeable with the ticked coins: a multiple of the smallest one.
    const unit = values[values.length - 1] || 1;
    let target = unit * randInt(Math.max(1, Math.ceil(Math.max(6, band * 0.3) / unit)), Math.max(1, Math.floor(band / unit)));
    // exactly the band (or the nearest amount below it), once a page, and not as the first item
    // (critic round 3: every form opened with "Make 50")
    if (edge6() === 3) target = unit * Math.floor(band / unit);
    // The fewest coins by dynamic programming: greedy is optimal for 1-5-10-25(-50), but not for a
    // teacher's chosen few (10 and 25 make 30 as 10 + 10 + 10, which greedy cannot find).
    let counts = fewestCounts(values, target);
    for (let t = 0; !counts && t < 40; t++) { target = unit * randInt(1, Math.max(1, Math.floor(band / unit))); counts = fewestCounts(values, target); }
    if (!counts) { target = values[0]; counts = values.map((v, i) => (i === 0 ? 1 : 0)); }
    setCell(q, 'coins', { kind: 'tally', target, values, counts, currency: o.currency });
    q.text = 'Use the fewest coins. Write how many of each.';
    q.ans = counts.join(', ');
    q.answerType = 'text';
    q.hint = 'Use as many of the biggest coin as you can. Then the next coin.';
}

function genEnough(q, skill) {
    const o = optsOf(skill);
    const band = Number(o.band) || 100;
    const vals = coinSet(o).filter((v) => v <= band);
    const enough = dealPerm(`${skill}:e`, 2) === 0;
    const near = o.gap === 'near';
    // The exact price ("the same is enough", §2.3) on the second Enough item of each six.
    const k = pos6();
    let before = 0;
    for (let j = _at - k; j < _at; j++) if (dealPerm(`${skill}:e`, 2, j) === 0) before++;
    const exact = enough && before === 1;
    let coins, price;
    for (let t = 0; t < 120; t++) {
        coins = randomCoins(vals, randInt(2, 6), band);
        const s = sum(coins);
        // "Far" is 10 or more away, but never so far that one glance decides it (critic round 3:
        // 31 against a price of 5): at most 20 away, and a price is never under 10.
        const gap = near ? randInt(1, 5) : randInt(10, Math.max(10, Math.min(20, Math.floor(band / 3))));
        price = enough ? s - (exact ? 0 : gap) : s + gap;
        if (price >= Math.min(10, band) && price <= band) break;
    }
    const enOut = setOut(o, coins);
    setCell(q, 'coins', { kind: 'enough', coins: enOut.coins, currency: o.currency, price, enough: sum(coins) >= price, dots: 'none', ...(enOut.scatter ? { scatter: enOut.scatter } : {}) });
    q.text = 'Is there enough money? Check one box.';
    choiceAnswer(q, sum(coins) >= price ? 'Enough' : 'Not enough');
    q.hint = 'Count the coins. Is the total the same as the price, or more?';
}

function genCoinValue(q, skill) {
    const o = optsOf(skill);
    const c = currencyOf(o.currency);
    if (o.task === 'order') {
        const n = 3 + deal(`${skill}:n`, 3);
        const notes = shuffle(c.notes.slice()).slice(0, Math.min(n, c.notes.length));
        let shown = shuffle(notes.slice());
        if (shown.every((v, i) => !i || v > shown[i - 1])) shown = shown.slice().reverse();
        const sorted = shown.slice().sort((a, b) => a - b);
        const ranks = shown.map((v) => sorted.indexOf(v) + 1);
        setCell(q, 'coins', { kind: 'order', notes: shown, ranks, currency: o.currency });
        q.text = 'Write 1, 2, 3 under the notes. Start with the least.';
        q.ans = ranks.join(', ');
        q.answerType = 'text';
        q.hint = 'Find the note worth the least. It gets 1.';
        return;
    }
    const vals = c.coins;
    const v = vals[dealPerm(`${skill}:v`, vals.length)];
    const count = randInt(2, 5);
    const others = vals.filter((x) => x !== v);
    const field = [...Array(count).fill(v), ...Array.from({ length: 8 - count }, () => others[randInt(0, others.length - 1)])];
    // "Coins and Notes": two notes stand in the field too, one printed with the SAME number where the
    // currency has that note, so the task is "a coin worth 5", not "find the numeral 5" (critic round 3).
    const noteVals = c.notes.filter((x) => x <= 20);
    const notes = [noteVals.includes(v) ? v : noteVals[randInt(0, noteVals.length - 1)], noteVals[randInt(0, noteVals.length - 1)]].sort((a, b) => b - a);
    setCell(q, 'coins', { kind: 'find', coins: shuffle(field), notes, target: v, count, currency: o.currency, dots: 'none', wrap: 4 });
    q.text = 'Circle every coin worth the number. Write how many.';
    q.ans = count;
    q.answerType = 'number';
    q.hint = 'Look at the coins only. Circle each coin with the number.';
}

function genMoneyNotation(q, skill) {
    const o = optsOf(skill);
    const c = currencyOf(o.currency);
    const k = pos6();
    // The zero cases (MW-2): x.05, x.50, 0.75, x.00 at fixed page positions.
    const major = k === 2 ? 0 : randInt(1, 9);
    const minorBy = { 0: 5, 1: 50, 2: 75, 3: 0 };
    let minor = minorBy[k] !== undefined ? minorBy[k] : 5 * randInt(1, 19);
    const total = major * 100 + minor;
    if (o.task === 'words') {
        const text = c.major
            ? `${major ? `${major} ${unitWord(o.currency, major, true)}` : ''}${major && minor ? ' ' : ''}${minor ? `${minor} ${unitWord(o.currency, minor)}` : ''}` || `0 ${c.minor}`
            : `${major} and ${minor} hundredths`;
        setCell(q, 'coins', { kind: 'notation', words: text, total, currency: o.currency, sign: o.currency !== 'plain' });
    } else {
        const notes = [];
        let r = major;
        for (const v of c.notes.slice().sort((a, b) => b - a)) while (r >= v && notes.length < 4) { notes.push(v); r -= v; }
        const coinVals = c.coins.slice().sort((a, b) => b - a);
        const coins = [];
        let rm = minor;
        for (const v of coinVals) while (rm >= v && coins.length < 6) { coins.push(v); rm -= v; }
        // Notes stay biggest first (as on money_count); only the coins are scattered.
        const ntOut = setOut(o, coins);
        setCell(q, 'coins', { kind: 'notation', notes, coins: ntOut.coins, total: sum(notes) * 100 + sum(coins), currency: o.currency, sign: o.currency !== 'plain', dots: 'none', ...(ntOut.scatter ? { scatter: ntOut.scatter } : {}) });
        minor = sum(coins);
    }
    q.text = 'Write the amount. Use the point.';
    q.ans = fmtMoney(q.cell.payload.total);
    q.answerType = 'text';
    q.hint = 'Whole notes go before the point. The coins go after it, always two digits.';
}

function genMoneyCompare(q, skill) {
    const o = optsOf(skill);
    const band = Number(o.band) || 100;
    const vals = coinSet(o).filter((v) => v <= band);
    const k = pos6();
    let a, b;
    for (let t = 0; t < 120; t++) {
        // At most four coins a side (2026-09-25, AP4): two rows of two half-size coins, so the
        // two collections stand side by side in a half-width cell and a page holds six.
        a = randomCoins(vals, randInt(1, 4), band);
        b = randomCoins(vals, randInt(1, 4), band);
        if (o.response === 'sign' && k === 5) b = a.slice().reverse().sort((x, y) => y - x);   // equal totals once a page
        const ok = o.response === 'sign' ? true : sum(a) !== sum(b);
        // M-M8: more coins but less money, once a page
        if (k === 1 && !(a.length > b.length && sum(a) < sum(b)) && !(b.length > a.length && sum(b) < sum(a))) continue;
        if (ok) break;
    }
    // Which side has more is dealt (three A and three B in each six, in a dealt order), never left
    // to the draw (critic round 3: the answer was B on every item of a page).
    const wantA = dealPerm(`${skill}:s6`, 6) < 3;
    if ((sum(a) > sum(b)) !== wantA && sum(a) !== sum(b)) [a, b] = [b, a];
    const sa = sum(a), sb = sum(b);
    // Each side is set out on its own (a scattered side is never simply the other reversed).
    const sideA = setOut(o, a), sideB = setOut(o, b);
    const sideOf = (s) => (s.scatter ? { coins: s.coins, scatter: s.scatter } : { coins: s.coins });
    if (o.response === 'sign') {
        const sign = sa > sb ? '>' : sa < sb ? '<' : '=';
        setCell(q, 'coins', { kind: 'compare', a: sideOf(sideA), b: sideOf(sideB), response: 'sign', sign, currency: o.currency });
        q.text = 'Write <, > or = in the circle.';
        q.ans = sign;
        q.answerType = 'text';
    } else {
        const more = sa > sb ? 'A' : 'B';
        setCell(q, 'coins', { kind: 'compare', a: sideOf(sideA), b: sideOf(sideB), response: 'ring', more, currency: o.currency });
        q.text = 'Which has more money? Check one box.';
        choiceAnswer(q, more);
    }
    q.hint = 'Count each group of coins. Compare the totals, not how many coins.';
}

/* ============================================================================ the dispatcher */

const GENERATORS = {
    time_hour: genReading, time_half_hour: genReading, time_quarter: genReading, time_5min: genReading, time_1min: genReading,
    time_analog_digital: genAnalogDigital, time_match_clock: genMatchClock,
    order_clocks_analog_asc: genOrderClocks, order_clocks_analog_desc: genOrderClocks,
    order_clocks_digital_asc: genOrderClocks, order_clocks_digital_desc: genOrderClocks,
    elapsed_30min: genElapsed, elapsed_hour: genElapsed, elapsed_15min: genElapsed, elapsed_mixed: genElapsed,
    elapsed_find_duration: genElapsed, elapsed_find_start: genElapsed,
    elapsed_visual_easy: genElapsed, elapsed_visual_medium: genElapsed, elapsed_visual_hard: genElapsed,
    clock_parts: genClockParts, time_fives_ring: genFivesRing, time_sense: genTimeSense,
    money_count: genMoneyCount, money: genMoneyAdd, money_change: genMoneyChange,
    equiv_coin_sets: genEquivSets, make_change_least_coins: genFewestCoins, enough_money: genEnough,
    coin_value: genCoinValue, money_notation: genMoneyNotation, money_compare: genMoneyCompare,
};

/** True when this module generates `skill`. */
export const isTimeMoneySkill = (skill) => Object.prototype.hasOwnProperty.call(GENERATORS, skill);

/**
 * Generate one time / money item into `q`. Returns false for an id this module does not own
 * (gen-measurement.js then carries on with its own branches).
 */
export function generateTimeMoneyQuestion(q, skill) {
    const gen = GENERATORS[skill];
    if (!gen) return false;
    beginItem();
    q.options = [];
    gen(q, skill);
    return true;
}
