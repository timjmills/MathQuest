// js/modules/sheet/providers/time-money.js
// Skill providers for the P10 time + money family (design/research/time-money.md): the five
// clock-reading steps, analog / digital, find the clock, the four order-clocks ids, the elapsed
// ladder, the three "time between two clocks" ids, clock parts, the fives ring, a.m. / p.m., and
// the money ids. Every member reads the item's sheet-kit payload (`q.cell.payload`, plain data
// written by gen-time-money.js), never the drawing.
//
// THE MISCONCEPTION BANK (§14). Every wrong answer is a named, computable error:
//   M-T1 read the minute-hand numeral as the minutes      M-T2 took the next hour
//   M-T3 swapped the hands                                M-T4 quarter past <-> quarter to
//   M-T6 dropped the leading zero                         M-T7 read :55 as the next o'clock
//   M-T9 ordered 12 as the biggest / the wrong way        M-E1 subtracted times as decimals
//   M-E2 let the minutes pass 59                          M-E3 kept counting past 12
//   M-E4 counted ticks, not spaces (one step too many)    M-E5 answered in one unit only
//   M-E6 found the start by counting forward              M-M1 counted the coins, not their value
//   M-M2 lost count at a switch (one coin missed)         M-M4 dropped the zero place
//   M-M5 wrote the two units the wrong way round          M-M6 did not regroup across the point
//   M-M7 smaller from larger in every column              M-M8 compared how many coins
//   M-M9 used smaller coins than needed                   M-M11 counted a note by its leading digit
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { registerSkill } from '../contract.js';
import { chooseWrong, strings, step, clampSteps, obj } from './util.js';

/* ============================================================================ helpers */

const payloadOf = (q) => (q && q.cell && q.cell.payload) || obj(q && q.tm && q.tm.payload) || {};
const h12 = (h) => ((Math.round(h) % 12) + 12) % 12 || 12;
const T = (h, m) => `${h12(h)}:${String(((m % 60) + 60) % 60).padStart(2, '0')}`;
const toMin = (t) => ((Number(t.h) * 60 + Number(t.m)) % 1440 + 1440) % 1440;
const fromMin = (x) => { const v = ((Math.round(x) % 1440) + 1440) % 1440; return { h: Math.floor(v / 60), m: v % 60 }; };
const dur = (total) => `${Math.floor(total / 60)} h ${total % 60} min`;
const money = (minor) => `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
const sum = (l) => (l || []).reduce((a, b) => a + b, 0);
const timeSlots = (v) => { const [h, m] = String(v).split(':'); return { hour: h, minute: m }; };
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * A `strings` member whose instruction depends on the item (write or draw the time; earliest
 * or latest first; notes or coins). `choose(q)` names one of the `defs` by key; the first def is
 * the default, used when the role asks with no item.
 */
function stringsBy(defs, choose, chooseRef = null) {
    const fns = Object.fromEntries(Object.entries(defs).map(([k, d]) => [k, strings(d)]));
    const first = Object.keys(defs)[0];
    const fn = (ref = {}) => {
        let k = first;
        // `chooseRef(ref)`: a role that asks with no item (the sheet header) still names the
        // item's kind through `ref.printFormat` (money_count: coins, notes, or both).
        try {
            if (ref && ref.q) k = choose(ref.q) || first;
            else if (ref && chooseRef) k = chooseRef(ref) || first;
        } catch (e) { k = first; }
        const out = (fns[k] || fns[first])(ref);
        const sayFill = out.sayFill;
        out.sayFill = (item) => { let kk = first; try { kk = choose(item) || first; } catch (e) { /* default */ } return (fns[kk] || fns[first])({}).sayFill(item) || sayFill(item); };
        return out;
    };
    fn.def = defs[first];
    return fn;
}

/* ============================================================================ reading the time */

function readWrong(q) {
    const p = payloadOf(q);
    const h = Number(p.h), m = Number(p.m);
    const c = [];
    if (m > 0) c.push({ value: T(h + 1, m), misconception: 'M-T2', explain: `Took the next hour: the short hand has only passed ${h12(h)}.` });
    if (m % 5 === 0 && m > 0 && m / 5 !== m) c.push({ value: T(h, m / 5), misconception: 'M-T1', explain: `Read the number the long hand points to (${m / 5}) as the minutes.` });
    if (m % 5 === 0 && m / 5 !== h % 12) c.push({ value: T(m === 0 ? 12 : m / 5, (h % 12) * 5), misconception: 'M-T3', explain: 'Swapped the hands: read the long hand as the hour.' });
    if (m === 15 || m === 45) c.push({ value: T(m === 45 ? h + 1 : h, 60 - m), misconception: 'M-T4', explain: m === 45 ? 'Wrote quarter to as quarter past the next hour.' : 'Wrote quarter past as quarter to.' });
    if (m > 0 && m < 10) c.push({ value: `${h12(h)}:${m}0`, misconception: 'M-T6', explain: `Dropped the zero: ${m} minutes is written 0${m}.` });
    if (m >= 55) c.push({ value: T(h + 1, 0), misconception: 'M-T7', explain: 'Read the time as the next o\'clock: the long hand has not reached 12.' });
    if (m === 0) c.push({ value: T(h, 12), misconception: 'M-T1', explain: 'Read the 12 under the long hand as 12 minutes.' });
    if (m % 5 !== 0 && Math.floor(m / 5) > 0) c.push({ value: T(h, Math.floor(m / 5)), misconception: 'M-T1', explain: `Read the number the long hand has passed (${Math.floor(m / 5)}) as the minutes.` });
    return chooseWrong(q, c.map((x) => Object.assign(x, { slot: 'minute', slots: timeSlots(x.value) })));
}

function readSteps(q) {
    const p = payloadOf(q);
    const h = Number(p.h), m = Number(p.m);
    const out = [step(`The short hand has passed ${h12(h)}. The hour is ${h12(h)}.`, [{ slot: 'hour', value: String(h12(h)) }])];
    if (m === 0) out.push(step('The long hand is on 12. That is o\'clock: 00 minutes.'));
    else if (m % 5 === 0) out.push(step(`The long hand is on ${m / 5}. Count by fives: ${m} minutes.`));
    else out.push(step(`Count by fives to ${Math.floor(m / 5) * 5}, then on by ones: ${m} minutes.`));
    out.push(step(`Write ${T(h, m)}.`, [{ slot: 'hour', value: String(h12(h)) }, { slot: 'minute', value: String(m).padStart(2, '0') }]));
    return out;
}

function drawSteps(q) {
    const p = payloadOf(q);
    const h = Number(p.h), m = Number(p.m);
    return [
        step(`Read the time: ${T(h, m)}.`),
        step(m === 0 ? 'Draw the long hand to 12.' : `Draw the long hand to ${m % 5 === 0 ? m / 5 : `${m} minutes`}. Make it long.`),
        step(m === 0 ? `Draw the short hand to ${h12(h)}.` : `Draw the short hand just past ${h12(h)}. Make it short.`, [{ slot: 'hands', value: T(h, m) }]),
    ];
}

function drawWrong(q) {
    const p = payloadOf(q);
    const h = Number(p.h), m = Number(p.m);
    const obj2 = (hh, mm) => ({ hour: h12(hh) % 12, minute: mm });
    const c = [];
    if (m % 5 === 0 && m / 5 !== h % 12) c.push({ value: obj2(m === 0 ? 12 : m / 5, (h % 12) * 5), misconception: 'M-T3', explain: 'Swapped the hands: the long hand shows the hour.' });
    if (m > 0) c.push({ value: obj2(h + 1, m), misconception: 'M-T2', explain: `Put the short hand past ${h12(h + 1)}, not past ${h12(h)}.` });
    if (m === 15 || m === 45) c.push({ value: obj2(h, 60 - m), misconception: 'M-T4', explain: 'Put the long hand on the other quarter.' });
    if (m === 0 && h12(h) !== 12) c.push({ value: obj2(h, h12(h) * 5 % 60), misconception: 'M-T1', explain: 'Put the long hand on the hour number too.' });
    if (m === 0) c.push({ value: obj2(h + 1, 0), misconception: 'M-T2', explain: `Put the short hand on ${h12(h + 1)}, the next number, not on ${h12(h)}.` });
    const w = chooseWrong(q, c.map((x) => Object.assign(x, { slot: 'hands', slots: { hands: T(x.value.hour, x.value.minute) }, display: T(x.value.hour, x.value.minute) })));
    return w;
}

const isDraw = (q) => payloadOf(q).kind === 'draw' || (q && q.answerType === 'clock-set');
const readingDefs = (ican, extraStep) => ({
    write: {
        iCan: ican, instructionKey: 'time-write',
        steps: ['Look at the short hand. It gives the hour it has passed.', extraStep, 'Write the hour, then the minutes.'],
        say: 'It is __.', sayValues: (q) => { const p = payloadOf(q); return [T(p.h, p.m)]; },
    },
    draw: {
        iCan: ican.replace(/^I Can tell/, 'I Can show'), instructionKey: 'time-draw',
        steps: ['Draw the long hand first, to the minutes.', 'Draw the short hand, for the hour.', 'Check: the long hand is longer.'],
        say: 'The long hand shows __ minutes.', sayValues: (q) => { const p = payloadOf(q); return [p.m]; },
    },
});
const READING = {
    time_hour: ['I Can tell time to the hour', 'The long hand on 12 means o\'clock.'],
    time_half_hour: ['I Can tell time to the half hour', 'The long hand on 6 means 30 minutes: half past.'],
    time_quarter: ['I Can tell time to the quarter hour', 'Long hand on 3: 15 minutes. On 9: 45 minutes.'],
    time_5min: ['I Can tell time to 5 minutes', 'Count the minutes by fives from 12.'],
    time_1min: ['I Can tell time to the minute', 'Count by fives, then on by ones.'],
};
for (const [id, [ican, extra]] of Object.entries(READING)) {
    registerSkill(`measurement:${id}`, {
        strings: stringsBy(readingDefs(ican, extra), (q) => (isDraw(q) ? 'draw' : 'write')),
        misconceptions: ['M-T1', 'M-T2', 'M-T3', 'M-T4', 'M-T6', 'M-T7'],
        workedSteps: (q) => (isDraw(q) ? drawSteps(q) : readSteps(q)),
        wrongAnswer: (q) => (isDraw(q) ? drawWrong(q) : readWrong(q)),
    });
}

/* ============================================================================ analog / digital, find the clock */

function chooseSteps(q) {
    const p = payloadOf(q);
    const L = LETTERS[p.correct];
    return [
        step(`Say the time: ${T(p.h, p.m)}.`),
        step(`Find the clock with the short hand at ${h12(p.h)}${p.m ? ' (just past it)' : ''}.`),
        step(`Check its long hand shows ${p.m} minutes.`),
        step(`Check box ${L}.`, [{ slot: 'choice', value: L }]),
    ];
}
function chooseWrong2(q) {
    const p = payloadOf(q);
    const faces = p.faces || [];
    const c = faces.map((f, i) => {
        if (i === p.correct) return null;
        const why = h12(f.h) === h12(p.h + 1) && f.m === p.m ? 'M-T2' : (f.m === 60 - p.m ? 'M-T4' : (h12(f.h) === h12(p.m / 5) ? 'M-T3' : 'M-T1'));
        return { value: LETTERS[i], misconception: why, slot: 'choice', explain: `Chose the clock showing ${T(f.h, f.m)}.` };
    });
    return chooseWrong(q, c);
}
const chooseDef = (ican) => ({
    iCan: ican, instructionKey: 'check-clock',
    steps: ['Read the time you are given.', 'Look at the short hand on each clock, then the long hand.', 'Check the one clock that matches.'],
    say: 'The clock shows __.', sayValues: (q) => { const p = payloadOf(q); return [T(p.h, p.m)]; },
});
registerSkill('measurement:time_analog_digital', {
    strings: stringsBy({
        write: { iCan: 'I Can write the digital time for a clock', instructionKey: 'time-write',
            steps: ['Read the short hand for the hour.', 'Count the minutes on the long hand.', 'Write the hour, then the minutes.'],
            say: 'The clock says __.', sayValues: (q) => { const p = payloadOf(q); return [T(p.h, p.m)]; } },
        choose: chooseDef('I Can find the clock for a digital time'),
    }, (q) => (payloadOf(q).kind === 'choose' ? 'choose' : 'write')),
    misconceptions: ['M-T1', 'M-T2', 'M-T3', 'M-T4', 'M-T6', 'M-T7'],
    workedSteps: (q) => (payloadOf(q).kind === 'choose' ? chooseSteps(q) : readSteps(q)),
    wrongAnswer: (q) => (payloadOf(q).kind === 'choose' ? chooseWrong2(q) : readWrong(q)),
});
registerSkill('measurement:time_match_clock', {
    strings: strings(chooseDef('I Can find the clock for a time in words')),
    misconceptions: ['M-T1', 'M-T2', 'M-T3', 'M-T4'],
    workedSteps: chooseSteps,
    wrongAnswer: chooseWrong2,
});

/* ============================================================================ order clocks */

function orderSteps(q) {
    const p = payloadOf(q);
    const asc = p.dir !== 'desc';
    const times = (p.times || []).map((t) => T(t.h, t.m) + (t.ap ? ` ${t.ap}` : ''));
    const ranks = (p.ranks || []).map(String);
    const first = times[ranks.indexOf('1')];
    return [
        step(`Read every clock: ${times.join(', ')}.`),
        step(`The ${asc ? 'earliest' : 'latest'} time is ${first}. Write 1 under it.`, [{ slot: `o${ranks.indexOf('1')}`, value: '1' }]),
        step('Write 2, then 3, under the next ones.', ranks.map((r, i) => ({ slot: `o${i}`, value: r }))),
    ];
}
function orderWrong(q) {
    const p = payloadOf(q);
    const ranks = (p.ranks || []).map(Number);
    const n = ranks.length;
    const rev = ranks.map((r) => n + 1 - r);
    const c = [{ value: rev.join(', '), misconception: 'M-T9', slot: 'o0', slots: Object.fromEntries(rev.map((r, i) => [`o${i}`, String(r)])),
        explain: p.dir === 'desc' ? 'Put the earliest first, not the latest.' : 'Put the latest first, not the earliest.' }];
    // 12 read as the biggest hour: a 12:xx clock ranked last
    const twelve = (p.times || []).findIndex((t) => t.h % 12 === 0);
    if (twelve >= 0 && ranks[twelve] !== n) {
        const w = ranks.map((r) => (r > ranks[twelve] ? r - 1 : r));
        w[twelve] = n;
        c.push({ value: w.join(', '), misconception: 'M-T9', slot: `o${twelve}`, slots: Object.fromEntries(w.map((r, i) => [`o${i}`, String(r)])), explain: 'Put 12 o\'clock last, as the biggest number.' });
    }
    return chooseWrong(q, c);
}
const ORDERS = {
    order_clocks_analog_asc: ['I Can put clocks in order, earliest first', 'order-times', true],
    order_clocks_analog_desc: ['I Can put clocks in order, latest first', 'order-times-late', false],
    order_clocks_digital_asc: ['I Can put times in order, earliest first', 'order-times', true],
    order_clocks_digital_desc: ['I Can put times in order, latest first', 'order-times-late', false],
};
for (const [id, [ican, key, asc]] of Object.entries(ORDERS)) {
    registerSkill(`measurement:${id}`, {
        strings: strings({
            iCan: ican, instructionKey: key,
            steps: ['Read every clock first.', `Find the ${asc ? 'earliest' : 'latest'} time. Write 1 under it.`, 'Write the next number under the next time.'],
            say: '__ comes first.', sayValues: (q) => { const p = payloadOf(q); const i = (p.ranks || []).indexOf(1); const t = (p.times || [])[i]; return t ? [T(t.h, t.m)] : null; },
        }),
        misconceptions: ['M-T9'],
        workedSteps: orderSteps,
        wrongAnswer: orderWrong,
    });
}

/* ============================================================================ elapsed time */

function elapsedSteps(q) {
    const p = payloadOf(q);
    const total = Number(p.total);
    const hh = Math.floor(total / 60), mm = total % 60;
    const s = p.start, e = p.end;
    if (p.mode === 'duration') {
        const out = [step(`Start at ${T(s.h, s.m)} on the line.`)];
        let at = toMin(s);
        if (hh) { at += 60 * hh; out.push(step(`Hop ${hh} ${hh === 1 ? 'hour' : 'hours'} to ${T(fromMin(at).h, fromMin(at).m)}.`)); }
        if (mm) out.push(step(`Hop ${mm} minutes to ${T(e.h, e.m)}.`));
        const marks = p.answer === 'minutes' ? [{ slot: 'answer', value: String(total) }] : [{ slot: 'hours', value: String(hh) }, { slot: 'minutes', value: String(mm) }];
        out.push(step(p.answer === 'minutes' ? `${hh} h ${mm} min is ${hh} × 60 + ${mm} = ${total} minutes.` : `Add the hops: ${hh} h ${mm} min.`, marks));
        return clampSteps(out);
    }
    const back = p.mode !== 'later';
    const from = back ? e : s, to = back ? s : e;
    const out = [step(`Start at ${T(from.h, from.m)} on the line.`)];
    let at = toMin(from);
    if (hh) { at += (back ? -60 : 60) * hh; out.push(step(`Hop ${back ? 'back ' : ''}${hh} ${hh === 1 ? 'hour' : 'hours'} to ${T(fromMin(at).h, fromMin(at).m)}.`)); }
    if (mm) out.push(step(`Hop ${back ? 'back ' : ''}${mm} minutes to ${T(to.h, to.m)}.`));
    const marks = p.response === 'draw' ? [{ slot: 'hands', value: T(to.h, to.m) }] : [{ slot: 'hour', value: String(h12(to.h)) }, { slot: 'minute', value: String(to.m).padStart(2, '0') }];
    out.push(step(`Write ${T(to.h, to.m)}.`, marks));
    return out;
}

function elapsedWrong(q) {
    const p = payloadOf(q);
    const total = Number(p.total);
    const hh = Math.floor(total / 60), mm = total % 60;
    const step0 = Number(p.step) || 15;
    const c = [];
    const asDraw = p.response === 'draw';
    const tv = (h, m, mis, explain) => (asDraw
        ? { value: { hour: h12(h) % 12, minute: ((m % 60) + 60) % 60 }, display: T(h, m), misconception: mis, slot: 'hands', slots: { hands: T(h, m) }, explain }
        : { value: `${h12(h)}:${String(m).padStart(2, '0')}`, misconception: mis, slot: 'minute', slots: { hour: String(h12(h)), minute: String(m).padStart(2, '0') }, explain });
    if (p.mode === 'duration') {
        const s = p.start, e = p.end;
        const minutes = p.answer === 'minutes';
        const put = (H, M, mis, explain) => (minutes
            ? { value: H * 60 + M, misconception: mis, slot: 'answer', slots: { answer: String(H * 60 + M) }, explain }
            : { value: `${H} h ${M} min`, misconception: mis, slot: 'minutes', slots: { hours: String(H), minutes: String(M) }, explain });
        const eh = h12(e.h) < h12(s.h) ? h12(e.h) + 12 : h12(e.h);
        if (e.m < s.m) { const d = (eh * 100 + e.m) - (h12(s.h) * 100 + s.m); c.push(put(Math.floor(d / 100), d % 100, 'M-E1', 'Took the times away like two numbers: there are 60 minutes in an hour, not 100.')); }
        c.push(put(Math.floor((total + step0) / 60), (total + step0) % 60, 'M-E4', 'Counted the ticks, not the spaces: one step too many.'));
        if (minutes && hh) c.push({ value: hh * 100 + mm, misconception: 'M-E5', slot: 'answer', slots: { answer: String(hh * 100 + mm) }, explain: `Wrote ${hh} h ${mm} min as ${hh}${String(mm).padStart(2, '0')}, not ${hh} × 60 + ${mm}.` });
        if (!minutes && hh && mm) c.push(put(0, total, 'M-E5', 'Wrote it all in minutes in the minutes box.'));
        return chooseWrong(q, c);
    }
    if (p.mode === 'later') {
        const s = p.start;
        if (s.m + mm >= 60) c.push(tv(s.h + hh, s.m + mm, 'M-E2', `Let the minutes pass 59: ${s.m} + ${mm} is more than an hour.`));
        const endRaw = h12(s.h) + hh + Math.floor((s.m + mm) / 60);
        if (endRaw > 12) c.push({ value: `${endRaw}:${String((s.m + mm) % 60).padStart(2, '0')}`, misconception: 'M-E3', slot: 'hour', slots: { hour: String(endRaw), minute: String((s.m + mm) % 60).padStart(2, '0') }, explain: 'Kept counting past 12: after 12 comes 1.' });
        const e4 = fromMin(toMin(p.end) + step0);
        c.push(tv(e4.h, e4.m, 'M-E4', 'Counted the ticks, not the spaces: one step too many.'));
    } else {
        const e = p.end;
        const fwd = fromMin(toMin(e) + total);
        c.push(tv(fwd.h, fwd.m, 'M-E6', 'Counted forward from the end instead of back.'));
        const e4 = fromMin(toMin(p.start) - step0);
        c.push(tv(e4.h, e4.m, 'M-E4', 'Counted the ticks, not the spaces: one step too many.'));
    }
    return chooseWrong(q, c);
}

const ELAPSED = {
    elapsed_30min: ['I Can find the time 30 minutes later or earlier', 'elapsed-end'],
    elapsed_hour: ['I Can find the time some hours later or earlier', 'elapsed-end'],
    elapsed_15min: ['I Can find the time 15, 30 or 45 minutes later or earlier', 'elapsed-end'],
    elapsed_mixed: ['I Can find the time hours and minutes later', 'elapsed-end'],
    elapsed_find_duration: ['I Can find how long from start to end', 'elapsed-how-long'],
    elapsed_find_start: ['I Can find the start time', 'elapsed-start'],
    elapsed_visual_easy: ['I Can find the time between two clocks', 'elapsed-how-long'],
    elapsed_visual_medium: ['I Can find the time between two clocks', 'elapsed-how-long'],
    elapsed_visual_hard: ['I Can find the time between two clocks', 'elapsed-how-long'],
};
// The hops a step's items really make (critic round 3: "hop the hours first" on a 30-minute page,
// "then hop the minutes" on a whole-hours page): minutes only, hours only, or both.
const HOPS = { elapsed_30min: 'min', elapsed_15min: 'min', elapsed_hour: 'hours' };
const hopSteps = (id, back) => {
    const b = back ? 'back ' : '';
    if (HOPS[id] === 'min') return [`Hop ${b}the minutes along the line.`, 'Write the time where you land.'];
    if (HOPS[id] === 'hours') return [`Hop ${b}one hour at a time.`, 'Write the time where you land.'];
    return [`Hop ${b}the hours first.`, `Then hop ${b}the minutes. Write where you land.`];
};
for (const [id, [ican, key]] of Object.entries(ELAPSED)) {
    const sayEnd = (q) => { const p = payloadOf(q); return [T(p.start.h, p.start.m), T(p.end.h, p.end.m)]; };
    const defs = {
        end: { iCan: ican, instructionKey: 'elapsed-end',
            steps: ['Put your pencil on the start time.', ...hopSteps(id, false)],
            say: 'Start at __. The end is __.', sayValues: sayEnd },
        start: { iCan: ican, instructionKey: 'elapsed-start',
            steps: ['Put your pencil on the end time.', ...hopSteps(id, true)],
            say: 'Count back from __. The start is __.', sayValues: (q) => { const p = payloadOf(q); return [T(p.end.h, p.end.m), T(p.start.h, p.start.m)]; } },
        // A page that deals later AND earlier (`dir: both`): one instruction for both directions.
        either: { iCan: ican, instructionKey: 'elapsed-missing',
            steps: ['Find the time you are given.', ...hopSteps(id, false).map((s) => s.replace('Hop the', 'Hop on or back the').replace('Hop one', 'Hop on or back one'))],
            say: 'From __ to __.', sayValues: sayEnd },
        dur: { iCan: ican, instructionKey: 'elapsed-how-long',
            steps: ['Put your pencil on the start time.', 'Hop to the end: the hours first, then the minutes.', 'Add the hops.'],
            say: 'From __ to __ is __.', sayValues: (q) => { const p = payloadOf(q); return [T(p.start.h, p.start.m), T(p.end.h, p.end.m), p.answer === 'minutes' ? `${p.total} minutes` : dur(p.total)]; } },
    };
    const order = key === 'elapsed-start' ? { start: defs.start, end: defs.end, dur: defs.dur, either: defs.either }
        : key === 'elapsed-how-long' ? { dur: defs.dur, end: defs.end, start: defs.start, either: defs.either }
            : { end: defs.end, start: defs.start, dur: defs.dur, either: defs.either };
    registerSkill(`measurement:${id}`, {
        strings: stringsBy(order, (q) => { const p = payloadOf(q); const m = p.mode; return m === 'duration' ? 'dur' : p.both ? 'either' : m === 'later' ? 'end' : 'start'; }),
        misconceptions: ['M-E1', 'M-E2', 'M-E3', 'M-E4', 'M-E5', 'M-E6'],
        workedSteps: elapsedSteps,
        wrongAnswer: elapsedWrong,
    });
}

/* ============================================================================ clock parts, fives, a.m. / p.m. */

registerSkill('measurement:clock_parts', {
    strings: stringsBy({
        numerals: { iCan: 'I Can name the parts of a clock', instructionKey: 'clock-numbers',
            steps: ['Start at 12 at the top.', 'Count round the clock: 1, 2, 3 and on.', 'Write each missing number in its place.'],
            say: 'After __ comes __.', sayValues: (q) => { const m = payloadOf(q).missing || []; return m.length ? [m[0] === 1 ? 12 : m[0] - 1, m[0]] : null; } },
        hands: { iCan: 'I Can name the parts of a clock', instructionKey: 'hour-hand',
            steps: ['Look at the two hands.', 'The short hand is the hour hand.', 'Check its letter.'],
            say: 'The short hand is the hour hand. It is __.', sayValues: (q) => [payloadOf(q).hourLetter || 'A'] },
    }, (q) => (payloadOf(q).task === 'hands' ? 'hands' : 'numerals')),
    misconceptions: ['counted-backwards', 'M-T3'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (p.task === 'hands') return [step('Look at the two hands.'), step('The short hand is the hour hand.'), step(`It is ${p.hourLetter}. Check ${p.hourLetter}.`, [{ slot: 'choice', value: p.hourLetter }])];
        const m = (p.missing || []).map(String);
        return [step('Start at 12 at the top.'), step('Count round: 1, 2, 3 ... 12.'), step(`Write ${m.join(', ')} in the gaps.`, m.map((v, i) => ({ slot: `n${i}`, value: v })))];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.task === 'hands') return chooseWrong(q, [{ value: p.hourLetter === 'A' ? 'B' : 'A', misconception: 'M-T3', slot: 'choice', explain: 'Chose the long hand: it is the minute hand.' }]);
        const w = (p.missing || []).map((v) => (12 - v) || 12);
        return chooseWrong(q, [{ value: w.join(', '), misconception: 'counted-backwards', slot: 'n0', slots: Object.fromEntries(w.map((v, i) => [`n${i}`, String(v)])), explain: 'Counted round the clock the wrong way.' }]);
    },
});

registerSkill('measurement:time_fives_ring', {
    strings: strings({ iCan: 'I Can count the minutes by fives round a clock', instructionKey: 'fives-ring',
        steps: ['Start at 12 with 0.', 'Count on 5 at each number.', 'Write the minutes in the empty boxes.'],
        say: '5, 10, 15 ... The long hand on __ is __ minutes.', sayValues: () => [3, 15] }),
    misconceptions: ['M-T1', 'skipped-one'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const given = new Set((p.given || []).map(Number));
        const vals = [];
        for (let i = 1; i <= 12; i++) if (!given.has(i)) vals.push(i === 12 ? 0 : i * 5);
        return [step('Start at 12 with 0.'), step('Count on 5 at each number: 5, 10, 15 ...'), step('Write the missing minutes.', vals.map((v, i) => ({ slot: `r${i}`, value: String(v) })))];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const given = new Set((p.given || []).map(Number));
        const pos = [];
        for (let i = 1; i <= 12; i++) if (!given.has(i)) pos.push(i);
        const a = pos.map((i) => (i === 12 ? 12 : i));
        const b = pos.map((i) => (i === 12 ? 0 : (i + 1) * 5));
        const mk = (list, mis, explain) => ({ value: list.join(', '), misconception: mis, slot: 'r0', slots: Object.fromEntries(list.map((v, i) => [`r${i}`, String(v)])), explain });
        return chooseWrong(q, [mk(a, 'M-T1', 'Wrote the clock number, not the minutes.'), mk(b, 'skipped-one', 'Started counting at the 1 with 10: one five too many.')]);
    },
});

registerSkill('measurement:time_sense', {
    strings: strings({ iCan: 'I Can choose a.m. or p.m. for a time', instructionKey: 'am-pm',
        steps: ['Read what happens and the time.', 'Morning, before 12 noon, is a.m.', 'After 12 noon is p.m. Check one box.'],
        say: '__ is in the __, so it is __.', sayValues: (q) => { const p = payloadOf(q); return [p.activity, p.ap === 'a.m.' ? 'morning' : 'afternoon or evening', p.ap]; } }),
    misconceptions: ['am-pm-swapped'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        return [step(`${p.activity} at ${T(p.h, p.m)}.`), step(p.ap === 'a.m.' ? 'That is in the morning, before 12 noon.' : 'That is after 12 noon.'), step(`Check ${p.ap}`, [{ slot: 'choice', value: p.ap }])];
    },
    wrongAnswer: (q) => { const p = payloadOf(q); return chooseWrong(q, [{ value: p.ap === 'a.m.' ? 'p.m.' : 'a.m.', misconception: 'am-pm-swapped', slot: 'choice', explain: 'Mixed up a.m. (morning) and p.m. (after noon).' }]); },
});

/* ============================================================================ money */

function countSteps(q) {
    const p = payloadOf(q);
    const coins = p.coins || [], notes = p.notes || [];
    if (p.answer === 'two') {
        const M = sum(notes), m = sum(coins);
        return [step(`Count the notes: ${notes.join(' + ')} = ${M}.`), step(`Count the coins: ${coins.join(' + ')} = ${m}.`),
            step(`Write ${M} and ${m}.`, [{ slot: 'major', value: String(M) }, { slot: 'minor', value: String(m) }])];
    }
    const list = (notes.length ? notes : coins).slice().sort((a, b) => b - a);
    let run = 0;
    const counts = list.map((v) => (run += v));
    return clampSteps([
        step(`Start with the biggest: ${list[0]}.`),
        step(`Count on: ${counts.slice(0, 8).join(', ')}.`),
        step(`Write ${run}.`, [{ slot: 'answer', value: String(run) }]),
    ]);
}
function countWrong(q) {
    const p = payloadOf(q);
    const coins = p.coins || [], notes = p.notes || [];
    if (p.answer === 'two') {
        const M = sum(notes), m = sum(coins);
        return chooseWrong(q, [
            { value: `${m}, ${M}`, misconception: 'M-M5', slot: 'major', slots: { major: String(m), minor: String(M) }, explain: 'Wrote the coins in the notes box and the notes in the coins box.' },
            { value: `${notes.length}, ${m}`, misconception: 'M-M1', slot: 'major', slots: { major: String(notes.length), minor: String(m) }, explain: 'Counted how many notes, not what they are worth.' },
        ]);
    }
    const list = (notes.length ? notes : coins).slice().sort((a, b) => b - a);
    const total = sum(list);
    const c = [{ value: list.length, misconception: 'M-M1', explain: `Counted ${list.length} ${notes.length ? 'notes' : 'coins'}, not their value.` }];
    if (list.length > 1) c.push({ value: total - list[list.length - 1], misconception: 'M-M2', explain: 'Lost count and missed one.' });
    c.push({ value: total + list[list.length - 1], misconception: 'counted-twice', explain: 'Counted the last one twice.' });
    if (notes.length) c.push({ value: sum(list.map((v) => Number(String(v)[0]))), misconception: 'M-M11', explain: 'Counted each note by its first digit.' });
    return chooseWrong(q, c);
}
registerSkill('measurement:money_count', {
    strings: stringsBy({
        coins: { iCan: 'I Can count coins', instructionKey: 'coins',
            steps: ['Start with the biggest coin.', 'Count on by each coin\'s value.', 'The last number is the total.'],
            say: 'The coins make __.', sayValues: (q) => [payloadOf(q).total] },
        notes: { iCan: 'I Can count notes', instructionKey: 'money-count',
            steps: ['Start with the biggest note.', 'Count on by each note\'s value.', 'The last number is the total.'],
            say: 'The notes make __.', sayValues: (q) => [payloadOf(q).total] },
        two: { iCan: 'I Can count notes and coins', instructionKey: 'money-two',
            steps: ['Count the notes.', 'Then count the coins.', 'Write the two numbers.'],
            say: '__ and __.', sayValues: (q) => { const p = payloadOf(q); return [sum(p.notes), sum(p.coins)]; } },
    }, (q) => { const p = payloadOf(q); return p.answer === 'two' ? 'two' : p.answer === 'major' ? 'notes' : 'coins'; },
    // The sheet header asks with the first item's printFormat only (gen-time-money.js sets
    // tm-notes / tm-notes-coins), so a page of notes is titled and instructed for notes.
    (ref) => (ref.printFormat === 'tm-notes-coins' ? 'two' : ref.printFormat === 'tm-notes' ? 'notes' : 'coins')),
    misconceptions: ['M-M1', 'M-M2', 'M-M5', 'M-M11', 'counted-twice'],
    workedSteps: countSteps,
    wrongAnswer: countWrong,
});

/** Column addition / subtraction of minor units, with and without the regroup (for M-M6 / M-M7). */
function noRegroup(a, b, op) {
    const da = String(a).split('').reverse().map(Number), db = String(b).split('').reverse().map(Number);
    let out = 0;
    for (let i = Math.max(da.length, db.length) - 1; i >= 0; i--) {
        const x = da[i] || 0, y = db[i] || 0;
        out = out * 10 + (op === '+' ? (x + y) % 10 : Math.abs(x - y));
    }
    return out;
}
function columnsSteps(q) {
    const p = payloadOf(q);
    const res = p.op === '-' ? p.a - p.b : p.a + p.b;
    const v = p.cents ? money(res) : String(res / 100);
    const [w, c] = v.split('.');
    const marks = p.cents ? [{ slot: 'whole', value: w }, { slot: 'cents', value: c }] : [{ slot: 'whole', value: w }];
    return [
        step(p.cents ? 'Line up the points.' : 'Line up the ones.'),
        step(p.op === '-' ? 'Subtract the right column first. Regroup if the top digit is smaller.' : 'Add the right column first. Regroup 10 if you need to.'),
        step(p.cents ? 'Bring the point straight down.' : 'Add the next column.'),
        step(`Write ${v}.`, marks),
    ];
}
function columnsWrong(q) {
    const p = payloadOf(q);
    const res = p.op === '-' ? p.a - p.b : p.a + p.b;
    const bad = noRegroup(p.a, p.b, p.op);
    const fmt = (x) => (p.cents ? money(x) : x / 100);
    const slotsOf = (x) => { const s = p.cents ? money(x).split('.') : [String(x / 100)]; return p.cents ? { whole: s[0], cents: s[1] } : { whole: s[0] }; };
    const c = [];
    if (bad !== res && (p.cents || bad % 100 === 0)) c.push({ value: fmt(bad), misconception: p.op === '-' ? 'M-M7' : 'M-M6', slot: 'whole', slots: slotsOf(bad), explain: p.op === '-' ? 'Took the smaller digit from the larger in every column.' : 'Did not regroup a column that made 10 or more.' });
    const off = p.cents ? 10 : 100;
    const alt = p.op === '-' ? res + off : res - off;
    if (alt > 0) c.push({ value: fmt(alt), misconception: p.op === '-' ? 'kept-the-one' : 'M-M6', slot: 'whole', slots: slotsOf(alt), explain: p.op === '-' ? 'Regrouped but did not take the 1 away from the next column.' : 'Lost the regrouped 1.' });
    return chooseWrong(q, c);
}
/*
 * Shopping stories for the word-problem role (critic round 3, H11: "no stories yet" on Add Money).
 * RP-116 / SL-9 let a currency sign and word stand in STORY text and beside the story's blank, so
 * a story names its money even at Plain numbers (there it reads in dollars, the coin set 1, 5, 10,
 * 25 being the US one); Qatari riyal reads QR / riyals. The numbers are the item's own.
 */
const SHOP = ['book', 'kite', 'ball', 'cap', 'lunch box', 'toy car', 'pencil case', 'puzzle', 'water bottle', 'scarf'];
const SHOPPERS = ['Mia', 'Omar', 'Lena', 'Ravi', 'Ana', 'Kofi', 'Yuki', 'Zara', 'Leo', 'Noor'];
function moneyStories(op) {
    return (q = {}, opts = {}) => {
        const p = payloadOf(q);
        if (!Number.isFinite(p.a) || !Number.isFinite(p.b) || p.b <= 0) return null;
        const res = op === '-' ? p.a - p.b : p.a + p.b;
        if (res <= 0) return null;
        const qar = p.currency === 'qar';
        const unit = qar ? { one: 'riyal', many: 'riyals' } : { one: 'dollar', many: 'dollars' };
        const amt = (x) => (qar ? 'QR ' : '$') + (p.cents ? money(x) : String(x / 100));
        const k = Number.isInteger(opts.index) && opts.index >= 0 ? opts.index : Math.abs(Number(opts.seed) || 0);
        const name = SHOPPERS[(k * 3 + Math.floor(p.a / 100)) % SHOPPERS.length];
        const i1 = SHOP[(k * 2) % SHOP.length], i2 = SHOP[(k * 2 + 1) % SHOP.length];
        const ans = p.cents ? money(res) : res / 100;
        let lines, question, work;
        if (op === '-') {
            lines = [`${name} buys a ${i1} for ${amt(p.b)}.`, `${name} pays with ${amt(p.a)}.`];
            question = `How much change does ${name} get?`;
            work = `${amt(p.a)} − ${amt(p.b)} = ${amt(res)}`;
        } else {
            lines = [`${name} buys a ${i1} for ${amt(p.a)}.`, `${name} buys a ${i2} for ${amt(p.b)}.`];
            question = `How much does ${name} spend?`;
            work = `${amt(p.a)} + ${amt(p.b)} = ${amt(res)}`;
        }
        const label = ans === 1 ? unit.one : unit.many;
        return {
            schema: op === '-' ? 'separate' : 'join', op, lines, question, sentences: lines.concat(question),
            ans, label, unit, answerText: `${ans} ${label}`, equation: work, work, say: `The answer is ${ans} ${label}.`, names: [name],
        };
    };
}
const colStrings = (op) => {
    const add = op === '+';
    const say = add ? '__ and __ make __.' : '__ take away __ is __ change.';
    const sayValues = (q) => { const p = payloadOf(q); const f = (x) => (p.cents ? money(x) : String(x / 100)); return [f(p.a), f(p.b), f(add ? p.a + p.b : p.a - p.b)]; };
    const base = add
        ? { iCan: 'I Can add money', instructionKey: 'money-add' }
        : { iCan: 'I Can find the change', instructionKey: 'money-change' };
    // The steps name the point only on a page that has one (critic round 3: "line up the points"
    // over whole-unit prices).
    return stringsBy({
        whole: Object.assign({}, base, { say, sayValues, steps: add
            ? ['Line up the ones under the ones.', 'Add the ones first; regroup 10 if you need to.', 'Add the next column. That is the total.']
            : ['Write the money paid on top, the price under it.', 'Subtract the ones first; regroup if you need to.', 'The answer is the change.'] }),
        point: Object.assign({}, base, { say, sayValues, steps: add
            ? ['Line up the points.', 'Add the right column first; regroup 10 if you need to.', 'Bring the point down into the answer.']
            : ['Write the money paid on top, the price under it.', 'Subtract the right column first; regroup across the zeros.', 'Bring the point down. That is the change.'] }),
    }, (q) => (payloadOf(q).cents ? 'point' : 'whole'));
};
registerSkill('measurement:money', {
    strings: colStrings('+'),
    misconceptions: ['M-M6'],
    workedSteps: columnsSteps,
    wrongAnswer: columnsWrong,
    stories: moneyStories('+'),
});
registerSkill('measurement:money_change', {
    strings: colStrings('-'),
    misconceptions: ['M-M6', 'M-M7', 'kept-the-one'],
    workedSteps: columnsSteps,
    wrongAnswer: columnsWrong,
    stories: moneyStories('-'),
});

registerSkill('measurement:equiv_coin_sets', {
    strings: strings({ iCan: 'I Can tell if coins make an amount', instructionKey: 'coins-make',
        steps: ['Count the coins, biggest first.', 'Compare the total with the amount.', 'Check Yes if they are the same.'],
        say: 'The coins make __.', sayValues: (q) => [sum(payloadOf(q).coins)] }),
    misconceptions: ['M-M1', 'M-M2'],
    workedSteps: (q) => { const p = payloadOf(q); const v = p.makes ? 'Yes' : 'No'; return [step('Count the coins, biggest first.'), step(`They make ${sum(p.coins)}.`), step(`${sum(p.coins)} ${p.makes ? 'is' : 'is not'} ${p.target}. Check ${v}.`, [{ slot: 'choice', value: v }])]; },
    wrongAnswer: (q) => { const p = payloadOf(q); return chooseWrong(q, [{ value: p.makes ? 'No' : 'Yes', misconception: p.makes ? 'M-M2' : 'M-M1', slot: 'choice', explain: p.makes ? 'Lost count and got a different total.' : 'Counted the coins, not their value.' }]); },
});

registerSkill('measurement:make_change_least_coins', {
    strings: strings({ iCan: 'I Can make an amount with the fewest coins', instructionKey: 'fewest-coins',
        steps: ['Use as many of the biggest coin as you can.', 'Make what is left with the next coin.', 'Write how many of each.'],
        say: '__ is made with the fewest coins.', sayValues: (q) => [payloadOf(q).target] }),
    misconceptions: ['M-M9'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const used = (p.values || []).map((v, i) => [v, (p.counts || [])[i]]).filter(([, n]) => n);
        return clampSteps([step(`Make ${p.target}.`), ...used.slice(0, 3).map(([v, n]) => step(`Use ${n} of the ${v}.`)),
            step('Write how many of each.', (p.counts || []).map((n, i) => ({ slot: `n${i}`, value: String(n) })))]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const counts = (p.counts || []).slice();
        const vals = p.values || [];
        // break the biggest used coin into smaller ones (M-M9)
        const i = counts.findIndex((n, k) => n > 0 && k < vals.length - 1 && vals.slice(k + 1).some((v) => vals[k] % v === 0));
        if (i < 0) return null;
        const j = vals.findIndex((v, k) => k > i && vals[i] % v === 0);
        const w = counts.slice();
        w[i] -= 1; w[j] += vals[i] / vals[j];
        return chooseWrong(q, [{ value: w.join(', '), misconception: 'M-M9', slot: `n${j}`, slots: Object.fromEntries(w.map((n, k) => [`n${k}`, String(n)])), explain: `Used ${vals[i] / vals[j]} coins of ${vals[j]} where one ${vals[i]} would do.` }]);
    },
});

registerSkill('measurement:enough_money', {
    strings: strings({ iCan: 'I Can tell if there is enough money', instructionKey: 'enough',
        steps: ['Count the coins, biggest first.', 'Compare the total with the price.', 'The same or more is enough.'],
        say: 'I have __. The price is __.', sayValues: (q) => { const p = payloadOf(q); return [sum(p.coins), p.price]; } }),
    misconceptions: ['M-M8', 'M-M2'],
    workedSteps: (q) => { const p = payloadOf(q); const v = p.enough ? 'Enough' : 'Not enough'; return [step('Count the coins, biggest first.'), step(`They make ${sum(p.coins)}. The price is ${p.price}.`), step(`Check ${v}.`, [{ slot: 'choice', value: v }])]; },
    wrongAnswer: (q) => { const p = payloadOf(q); return chooseWrong(q, [{ value: p.enough ? 'Not enough' : 'Enough', misconception: p.enough ? 'M-M2' : 'M-M8', slot: 'choice', explain: p.enough ? 'Lost count and got too little.' : 'Judged by how many coins, not their value.' }]); },
});

registerSkill('measurement:coin_value', {
    strings: stringsBy({
        find: { iCan: 'I Can find coins by their value', instructionKey: 'coin-find',
            steps: ['Read the number on each coin.', 'Circle every coin with the number.', 'Count your circles.'],
            say: 'There are __ coins worth __.', sayValues: (q) => { const p = payloadOf(q); return [p.count, p.target]; } },
        order: { iCan: 'I Can put notes in order of value', instructionKey: 'notes-order',
            steps: ['Read the value on each note.', 'Find the note worth the least. Write 1.', 'Write 2, 3 under the next ones.'],
            say: '__ is worth the least.', sayValues: (q) => { const p = payloadOf(q); const i = (p.ranks || []).indexOf(1); return i >= 0 ? [(p.notes || [])[i]] : null; } },
    }, (q) => (payloadOf(q).kind === 'order' ? 'order' : 'find')),
    misconceptions: ['missed-one', 'most-first'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'order') {
            const r = (p.ranks || []).map(String);
            return [step('Read the value on each note.'), step(`The least is ${(p.notes || [])[r.indexOf('1')]}. Write 1 under it.`), step('Write the next numbers.', r.map((v, i) => ({ slot: `o${i}`, value: v })))];
        }
        return [step('Read the number on each coin.'), step(`Circle every ${p.target}.`), step(`There are ${p.count}.`, [{ slot: 'answer', value: String(p.count) }])];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'order') {
            const n = (p.ranks || []).length;
            const w = p.ranks.map((r) => n + 1 - r);
            return chooseWrong(q, [{ value: w.join(', '), misconception: 'most-first', slot: 'o0', slots: Object.fromEntries(w.map((v, i) => [`o${i}`, String(v)])), explain: 'Started with the note worth the most.' }]);
        }
        return chooseWrong(q, [{ value: p.count - 1, misconception: 'missed-one', explain: 'Missed one of the coins.' }, { value: p.count + 1, misconception: 'missed-one', explain: 'Circled a coin of another value.' }]);
    },
});

registerSkill('measurement:money_notation', {
    strings: strings({ iCan: 'I Can write an amount of money with a point', instructionKey: 'money-write',
        steps: ['Count the notes: that number goes before the point.', 'Count the coins: two digits after the point.', 'A zero keeps an empty place: 3.05.'],
        say: 'The amount is __.', sayValues: (q) => [money(payloadOf(q).total)] }),
    misconceptions: ['M-M4'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const [w, c] = money(p.total).split('.');
        return [step(`The whole units make ${w}.`), step(`The coins make ${Number(c)}: write ${c} after the point.`), step(`Write ${w}.${c}.`, [{ slot: 'whole', value: w }, { slot: 'cents', value: c }])];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const w = Math.floor(p.total / 100), c = p.total % 100;
        const cand = [];
        if (c > 0 && c < 10) cand.push({ value: `${w}.${c}0`, misconception: 'M-M4', slot: 'cents', slots: { whole: String(w), cents: `${c}0` }, explain: `Dropped the zero: ${c} is written 0${c} after the point.` });
        if (c % 10 === 0) cand.push({ value: `${w}.${c / 10}`, misconception: 'M-M4', slot: 'cents', slots: { whole: String(w), cents: String(c / 10) }, explain: 'Wrote one digit after the point: it takes two.' });
        // The point is printed in the slot, so "left out the point" shows as the whole total in
        // the units box: every coin counted as a whole unit (3.05 written 305.00).
        cand.push({ value: `${p.total}.00`, misconception: 'M-M4', slot: 'whole', slots: { whole: String(p.total), cents: '00' }, explain: `Counted the coins as whole units: ${p.total} is the coins, so it is ${w}.${String(c).padStart(2, '0')}.` });
        return chooseWrong(q, cand);
    },
});

registerSkill('measurement:money_compare', {
    strings: stringsBy({
        ring: { iCan: 'I Can tell which has more money', instructionKey: 'money-more',
            steps: ['Count the coins in A.', 'Count the coins in B.', 'Check the bigger total, not the most coins.'],
            say: 'A has __. B has __.', sayValues: (q) => { const p = payloadOf(q); return [sum(p.a.coins), sum(p.b.coins)]; } },
        sign: { iCan: 'I Can compare amounts of money', instructionKey: 'compare',
            steps: ['Count the coins in A.', 'Count the coins in B.', 'Write <, > or = between the totals.'],
            say: 'A has __. B has __.', sayValues: (q) => { const p = payloadOf(q); return [sum(p.a.coins), sum(p.b.coins)]; } },
    }, (q) => (payloadOf(q).response === 'sign' ? 'sign' : 'ring')),
    misconceptions: ['M-M8', 'sign-reversed'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const a = sum(p.a.coins), b = sum(p.b.coins);
        const v = p.response === 'sign' ? p.sign : p.more;
        return [step(`A makes ${a}.`), step(`B makes ${b}.`), step(p.response === 'sign' ? `${a} ${v} ${b}.` : `Check ${v}.`, [{ slot: p.response === 'sign' ? 'sign' : 'choice', value: v }])];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.response === 'sign') {
            const flip = { '<': '>', '>': '<', '=': '<' }[p.sign];
            return chooseWrong(q, [{ value: flip, misconception: 'sign-reversed', slot: 'sign', explain: 'Turned the sign the wrong way: it opens to the bigger amount.' }]);
        }
        return chooseWrong(q, [{ value: p.more === 'A' ? 'B' : 'A', misconception: 'M-M8', slot: 'choice', explain: 'Chose the group with more coins, not more money.' }]);
    },
});

/** The P10 skills that carry a real provider. */
export const TM_PROVIDER_SKILLS = Object.freeze([
    ...Object.keys(READING), 'time_analog_digital', 'time_match_clock', ...Object.keys(ORDERS), ...Object.keys(ELAPSED),
    'clock_parts', 'time_fives_ring', 'time_sense', 'money_count', 'money', 'money_change', 'equiv_coin_sets',
    'make_change_least_coins', 'enough_money', 'coin_value', 'money_notation', 'money_compare',
].map((id) => `measurement:${id}`));
