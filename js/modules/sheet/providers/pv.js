// js/modules/sheet/providers/pv.js
// Skill providers for place value, rounding and estimation (P9, design/research/place-value-rounding.md):
// every `placevalue` id, and every rounding and estimation id of `number_sense` (the three P4
// strategy ids `make_a_ten`, `doubles_near_doubles` and `compensation` are OUT, §3.2).
//
// Each provider reads the item's own description, `q.pv` (gen-pv.js), never its picture, so the
// worked steps and the wrong answer are about the item the pupil sees. The wrong answers are the
// misconception bank of §14 — every entry has a computable rule, and the id it returns is the
// bank's id (M-V*, M-L*, M-Z*, M-R*, M-G*), plus a few house ids named where they are used.
//
// Pure module (SCC-01): no window, no state, no DOM, no Math.random.

import { registerSkill } from '../contract.js';
import { num, fmt, obj, arr, chooseWrong, strings, step, clampSteps } from './util.js';

const PLACE_WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions',
    0.1: 'tenths', 0.01: 'hundredths', 0.001: 'thousandths' };
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M', 0.1: 'Tth', 0.01: 'Hth', 0.001: 'Thth' };
// A decimal part is worked to six places, so 3 x 0.1 prints 0.3, never 0.30000000000000004.
const f = (v) => fmt(Number(Number(v).toFixed(6)));
const r6 = (v) => Number(Number(v).toFixed(6));
/** vis_pv_decimal_places: does this item (or page's options) carry decimal places? */
const isDec = (q) => Number(pvOf(q).decimals) > 0;
/** The number written as the item shows it (3.40 keeps its zero). */
const shown = (p) => (p.s !== undefined && p.s !== null ? String(p.s) : f(p.n));
/** The number the digits `ds` make in `places` (largest first) - a decimal point stays put. */
const onPlaces = (ds, places) => r6(ds.reduce((a, d, i) => a + d * places[i], 0));
const pvOf = (q) => obj(q && q.pv) || {};
const digitAt = (n, place) => Math.floor(Math.round(Math.abs(n) * 1000) / Math.round(place * 1000)) % 10;
const roundTo = (n, P) => Math.floor((n + P / 2) / P) * P;          // halfway rounds up (owner ruling 6)
const placesOf = (n) => { const s = String(Math.trunc(Math.abs(n))); return Array.from({ length: s.length }, (_, i) => 10 ** (s.length - 1 - i)); };
const ansNum = (q) => num(q.ans);
/** chooseWrong, with the slot named: a candidate that fills several slots marks its first one. */
const choose = (q, list) => chooseWrong(q, list.filter(Boolean).map((c) => (c.slots && !c.slot ? { ...c, slot: Object.keys(c.slots)[0] } : c)));

/**
 * The §14 wrong roundings of `n` to the nearest `P`, as {value, misconception}. Shared with the
 * generator's judge items (gen-pv.js), so a "check the rounding" page shows the same errors the
 * error-analysis page does.
 *   M-R2 halfway rounded down · M-R4 at a 9, the next place was not changed · M-R1 the other end
 *   of the line · M-R5 rounded to the wrong place · M-R3 changed only the deciding digit
 */
export function pvRoundingErrors(n, P) {
    const r = roundTo(n, P);
    const lower = Math.floor(n / P) * P;
    const out = [];
    if (n - lower === P / 2) out.push({ value: lower, misconception: 'M-R2' });
    if (r > n && digitAt(n, P) === 9) out.push({ value: lower, misconception: 'M-R4' });
    out.push({ value: r > n ? lower : lower + P, misconception: 'M-R1' });
    if (P >= 1 && roundTo(n, P * 10) !== r) out.push({ value: roundTo(n, P * 10), misconception: 'M-R5' });
    if (P >= 100) {
        // Only the deciding digit changes: it becomes 0 and every other digit stays (348 -> 308).
        const unit = P / 10;
        out.push({ value: n - digitAt(n, unit) * unit, misconception: 'M-R3' });
    }
    const seen = new Set();
    return out.filter((w) => w.value !== r && w.value >= 0 && !seen.has(w.value) && seen.add(w.value));
}

/** A strings member chosen per item (the scope or task changes the instruction). */
function stringsBy(pickDef, fallbackDef) {
    const cache = new Map();
    const get = (def) => { if (!cache.has(def)) cache.set(def, strings(def)); return cache.get(def); };
    const fn = (ref = {}) => {
        // The page's first item picks, else the skill's own options (a page of one task / scope).
        const def = (ref && ref.q && pickDef(ref.q)) || (ref && ref.opts && !ref.q && pickDef({ pv: { ...ref.opts } })) || fallbackDef;
        return get(def)(ref);
    };
    fn.def = fallbackDef;
    return fn;
}

/* =============================================================================== place / value */

const PLACE_STEPS = [
    'Find the underlined digit.',
    'Read the place letter above it: O, T, H or Th.',
    'The letter names the place: ones, tens, hundreds, thousands.',
];
// A page of numbers below 1,000 never talks about thousands (round-3 finding).
const PLACE_STEPS_3 = [
    'Find the underlined digit.',
    'Read the place letter above it: O, T or H.',
    'The letter names the place: ones, tens or hundreds.',
];
const placeSteps = (q) => ((num(pvOf(q).n) || 0) < 1000 ? PLACE_STEPS_3 : PLACE_STEPS);
const placeSay = (q) => { const p = pvOf(q); return Number.isFinite(p.digit) ? [p.digit, PLACE_WORD[p.place]] : null; };
const PLACE_BANK = {
    iCan: 'I Can name the place of a digit',
    instructionKey: 'place-write',
    steps: PLACE_STEPS.concat('Copy the place word from the bank.'),
    say: 'The __ is in the __ place.',
    sayValues: placeSay,
};
const PLACE_BANK_3 = { ...PLACE_BANK, steps: PLACE_STEPS_3.concat('Copy the place word from the bank.') };
const PLACE_CIRCLE = {
    iCan: 'I Can name the place of a digit',
    instructionKey: 'place-circle',
    steps: PLACE_STEPS.concat('Circle the place word.'),
    say: 'The __ is in the __ place.',
    sayValues: placeSay,
};
const PLACE_CIRCLE_3 = { ...PLACE_CIRCLE, steps: PLACE_STEPS_3.concat('Circle the place word.') };

registerSkill('placevalue:identify', {
    strings: stringsBy((q) => (pvOf(q).response === 'bank'
        ? (placeSteps(q) === PLACE_STEPS ? PLACE_BANK : PLACE_BANK_3)
        : (placeSteps(q) === PLACE_STEPS ? PLACE_CIRCLE : PLACE_CIRCLE_3)), PLACE_CIRCLE_3),
    misconceptions: ['M-V1', 'M-V3', 'M-V14'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (!p.place) return [];
        return [
            step(`Find the underlined digit: ${p.digit}.`),
            step(`The letter above it is ${LETTER[p.place]}.`),
            step(`${LETTER[p.place]} means ${PLACE_WORD[p.place]}.`),
            step(`The ${p.digit} is in the ${PLACE_WORD[p.place]} place.`, [{ slot: 'answer', value: PLACE_WORD[p.place] }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (!p.place) return null;
        const places = placesOf(p.n);
        const fromLeft = places.indexOf(p.place);
        const c = [];
        // M-V1: counted places from the LEFT (the 8 of 817 named "ones").
        c.push({ value: PLACE_WORD[10 ** fromLeft], misconception: 'M-V1', explain: 'Counted the places from the left, not the right.' });
        if (p.repeat) {
            const other = places.find((pl) => pl !== p.place && digitAt(p.n, pl) === p.digit);
            if (other) c.push({ value: PLACE_WORD[other], misconception: 'M-V3', explain: `Named the place of the other ${p.digit}.` });
        }
        // M-V14: the place next to it — a neighbour the number really has, on either side, so
        // the wrong answers differ from child to child (round-3: every child circled "hundreds").
        for (const nb of [p.place * 10, p.place / 10]) {
            if (places.includes(nb)) c.push({ value: PLACE_WORD[nb], misconception: 'M-V14', explain: 'Named the place next to it.' });
        }
        return choose(q, c);
    },
});


function valueParts(q) {
    const p = pvOf(q);
    return p.place ? { ...p, value: r6(p.digit * p.place), word: PLACE_WORD[p.place] } : null;
}

const VALUE_DEC = {
    iCan: 'I Can write the value of a digit after the point',
    instructionKey: 'digit-value',
    steps: ['Find the underlined digit and its place.', 'After the point: tenths, then hundredths, then thousandths.', 'Multiply the digit by its place: 7 hundredths is 0.07.'],
    say: 'The __ is worth __.',
    sayValues: (q) => { const v = valueParts(q); return v ? [v.digit, f(v.value)] : null; },
};

registerSkill('placevalue:value', {
    strings: stringsBy((q) => (isDec(q) ? VALUE_DEC : null), {
        iCan: 'I Can write the value of a digit',
        instructionKey: 'digit-value',
        steps: ['Find the underlined digit and its place.', 'The place says what one of it is worth.', 'Multiply the digit by its place: 7 hundreds is 700.'],
        say: 'The __ is worth __.',
        sayValues: (q) => { const v = valueParts(q); return v ? [v.digit, v.value] : null; },
    }),
    misconceptions: ['M-V2', 'M-V4', 'M-V5', 'M-V14'],
    workedSteps: (q) => {
        const v = valueParts(q);
        if (!v) return [];
        const last = v.form === 'unit' ? step(`Write ${v.digit} ${v.word}.`, [{ slot: 'b0', value: String(v.digit) }, { slot: 'b1', value: v.word }])
            : v.form === 'notation' ? step(`Write ${v.digit} × ${f(v.place)}.`, [{ slot: 'b0', value: String(v.digit) }, { slot: 'b1', value: f(v.place) }])
                : step(`Write ${f(v.value)}.`, [{ slot: 'answer', value: f(v.value) }]);
        return [
            step(`The underlined digit is ${v.digit}.`),
            step(`It is in the ${v.word} place.`),
            v.digit === 0 ? step('A zero is worth nothing. It holds the place.') : step(`${v.digit} ${v.word} is ${v.digit} × ${f(v.place)} = ${f(v.value)}.`),
            last,
        ];
    },
    wrongAnswer: (q) => {
        const v = valueParts(q);
        if (!v) return null;
        if (v.form === 'unit' || v.form === 'notation') {
            const nextP = v.place >= 10 ? v.place / 10 : v.place * 10;
            const wrong = v.form === 'unit' ? `${v.digit} ${PLACE_WORD[nextP]}` : `${v.digit} × ${f(nextP)}`;
            return choose(q, [{ value: wrong, misconception: 'M-V14', explain: 'Used the place next to it.',
                slots: { b0: String(v.digit), b1: v.form === 'unit' ? PLACE_WORD[nextP] : f(nextP) } }]);
        }
        return choose(q, [
            { value: v.digit, misconception: 'M-V2', explain: 'Wrote the digit, not what it is worth.' },
            { value: v.digit === 0 ? v.place : v.place, misconception: v.digit === 0 ? 'M-V5' : 'M-V4', explain: v.digit === 0 ? 'Gave the zero the value of its place.' : 'Wrote the place, not the value.' },
            { value: r6(v.digit * (v.place * 10)), misconception: 'M-V14', explain: 'Used the place next to it.' },
        ]);
    },
});

/* =============================================================================== expanded / standard / unit */

/* vis_pv_decimal_places: 3.47 = 3 + 0.4 + 0.07 (sum) or 3 × 1 + 4 × 0.1 + 7 × 0.01 (notation). */
const EXPAND_DEC = {
    iCan: 'I Can write a decimal in expanded form',
    instructionKey: 'expanded',
    steps: ['Start with the digit on the left.', 'Write what each digit is worth: 4 tenths is 0.4.', 'A zero holds its place: its part is 0.', 'Put + between the parts.'],
    say: '__ is __.',
    sayValues: (q) => { const p = pvOf(q); return p.n !== undefined ? [shown(p), arr(p.parts).map(Number).filter(Boolean).map(f).join(' plus ')] : null; },
};
const EXPAND_DEC_NOTATION = {
    iCan: 'I Can write a decimal in expanded notation',
    instructionKey: 'expanded',
    steps: ['Start with the digit on the left.', 'Write each digit in its box.', 'The box is multiplied by its place: 4 × 0.1.'],
    say: '__ is __.',
    sayValues: EXPAND_DEC.sayValues,
};
function expandDecSteps(q) {
    const p = pvOf(q);
    const places = arr(p.places).map(Number);
    const parts = arr(p.parts).map(Number);
    if (!places.length) return [];
    const ds = places.map((pl) => digitAt(p.n, pl));
    const note = p.form === 'notation';
    const line = p.frame === 'line';
    const out = places.slice(0, 4).map((pl, i) => step(`The ${ds[i]} is in the ${PLACE_WORD[pl]} place: ${note ? `${ds[i]} × ${f(pl)}` : f(parts[i])}.`,
        line ? [] : [{ slot: `b${i}`, value: note ? String(ds[i]) : f(parts[i]) }]));
    const k = places.length - 1;
    out.push(step(`So ${shown(p)} = ${String(q.ans)}.`, line ? [{ slot: 'answer', value: String(q.ans) }]
        : [{ slot: `b${k}`, value: note ? String(ds[k]) : f(parts[k]) }]));
    return clampSteps(out.length >= 3 ? out : [step(`Read ${shown(p)}.`)].concat(out));
}
function expandDecWrong(q) {
    const p = pvOf(q);
    const places = arr(p.places).map(Number);
    const parts = arr(p.parts).map(Number);
    if (!places.length) return null;
    const ds = places.map((pl) => digitAt(p.n, pl));
    const join = (list) => list.join(' + ');
    if (p.form === 'notation') {
        const up = places.map((pl) => r6(pl * 10));
        return choose(q, [
            { value: ds.map((d, i) => `${d} × ${f(up[i])}`).join(' + '), misconception: 'M-V14', explain: 'Moved every digit one place up: tenths read as ones.',
                slots: Object.fromEntries(ds.map((d, i) => [`b${i}`, String(d)])) },
            { value: parts.map((v, i) => `${f(v)} × ${f(places[i])}`).join(' + '), misconception: 'M-V6', explain: 'Wrote the value in the box, then multiplied by the place again.',
                slots: Object.fromEntries(parts.map((v, i) => [`b${i}`, f(v)])) },
        ]);
    }
    const line = p.frame === 'line';
    const c = [];
    // M-V6: the digits, not their worth (3.47 = 3 + 4 + 7).
    const dsS = ds.map(String);
    c.push({ value: join(line ? dsS.filter((d) => d !== '0') : dsS), misconception: 'M-V6', explain: 'Wrote the digits, not what they are worth.',
        slots: line ? { answer: join(dsS.filter((d) => d !== '0')) } : Object.fromEntries(dsS.map((d, i) => [`b${i}`, d])) });
    // M-D3: every decimal part one place too small (0.4 written 0.04).
    const small = parts.map((v, i) => (places[i] < 1 ? r6(v / 10) : v));
    c.push({ value: join(small.filter((v) => !line || v).map(f)), misconception: 'M-D3', explain: 'Put each decimal digit one place too far right.',
        slots: line ? { answer: join(small.filter(Boolean).map(f)) } : Object.fromEntries(small.map((v, i) => [`b${i}`, f(v)])) });
    return choose(q, c);
}

registerSkill('placevalue:expand', {
    strings: stringsBy((q) => (isDec(q) ? (pvOf(q).form === 'notation' ? EXPAND_DEC_NOTATION : EXPAND_DEC) : pvOf(q).form === 'notation' ? EXPAND_NOTATION : null), {
        iCan: 'I Can write a number in expanded form',
        instructionKey: 'expanded',
        steps: ['Start with the digit on the left.', 'Write what each digit is worth.', 'A zero holds its place: its part is 0.', 'Put + between the parts.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [p.n, (p.parts || []).filter(Boolean).map(f).join(' plus ')] : null; },
    }),
    misconceptions: ['M-V6', 'M-V5', 'M-V7', 'M-V14', 'M-D3'],
    workedSteps: (q) => {
        if (isDec(q)) return expandDecSteps(q);
        const p = pvOf(q);
        const parts = arr(p.parts).map(Number);
        if (!parts.length) return [];
        const ds = String(p.n).split('').map(Number);
        const places = placesOf(p.n);
        const out = ds.slice(0, 4).map((d, i) => step(`The ${d} is in the ${PLACE_WORD[places[i]]} place: ${p.form === 'notation' ? `${d} × ${f(places[i])}` : f(parts[i])}.`,
            p.frame === 'line' ? [] : [{ slot: p.form === 'notation' ? `b${i}` : `part${i}`, value: p.form === 'notation' ? String(d) : f(parts[i]) }]));
        const ans = String(q.ans);
        out.push(step(`So ${f(p.n)} = ${ans}.`, [{ slot: p.frame === 'line' ? 'answer' : (p.form === 'notation' ? `b${ds.length - 1}` : `part${ds.length - 1}`), value: p.frame === 'line' ? ans : (p.form === 'notation' ? String(ds[ds.length - 1]) : f(parts[parts.length - 1])) }]));
        return clampSteps(out.length >= 3 ? out : [step(`Read ${f(p.n)}.`)].concat(out));
    },
    wrongAnswer: (q) => {
        if (isDec(q)) return expandDecWrong(q);
        const p = pvOf(q);
        const parts = arr(p.parts).map(Number);
        if (!parts.length) return null;
        const ds = String(p.n).split('').map(Number);
        const places = placesOf(p.n);
        if (p.form === 'notation') {
            const rev = ds.slice().reverse();
            return choose(q, [
                { value: parts.map((v, i) => `${f(v)} × ${f(places[i])}`).join(' + '), misconception: 'M-V14', explain: 'Wrote the value in the box, then multiplied by the place again.',
                    slots: Object.fromEntries(parts.map((v, i) => [`b${i}`, f(v)])) },
                { value: rev.map((d, i) => `${d} × ${f(places[i])}`).join(' + '), misconception: 'M-V1', explain: 'Read the digits from the right.',
                    slots: Object.fromEntries(rev.map((d, i) => [`b${i}`, String(d)])) },
            ]);
        }
        const join = (list) => list.join(' + ');
        const digits = ds.map(String);
        const c = [];
        c.push({ value: join(p.frame === 'line' ? digits.filter((d) => d !== '0') : digits), misconception: 'M-V6', explain: 'Wrote the digits, not what they are worth.',
            slots: p.frame === 'line' ? { answer: join(digits.filter((d) => d !== '0')) } : Object.fromEntries(digits.map((d, i) => [`part${i}`, d])) });
        if (ds.includes(0) && p.frame === 'line') {
            // M-V7: dropped the zero place, so every part to its left slid down one place (305 -> 30 + 5).
            const nz = ds.filter((d) => d !== 0);
            const w = join(nz.map((d, i) => f(d * 10 ** (nz.length - 1 - i))).filter((x) => x !== '0'));
            c.push({ value: w, misconception: 'M-V7', explain: 'Left out the zero place, so the digits moved down a place.', slots: { answer: w } });
        } else if (ds.includes(0)) {
            const w = parts.map((v, i) => (v === 0 ? places[i] : v));
            c.push({ value: join(w.map(f)), misconception: 'M-V5', explain: 'Gave the zero the value of its place.', slots: Object.fromEntries(w.map((v, i) => [`part${i}`, f(v)])) });
        }
        const big = parts.map((v) => v * 10);
        c.push({ value: join(big.filter((v) => p.frame !== 'line' || v).map(f)), misconception: 'M-V14', explain: 'Named every place one place too big.',
            slots: p.frame === 'line' ? { answer: join(big.filter(Boolean).map(f)) } : Object.fromEntries(big.map((v, i) => [`part${i}`, f(v)])) });
        return choose(q, c);
    },
});

const EXPAND_NOTATION = {
    iCan: 'I Can write a number in expanded notation',
    instructionKey: 'expanded',
    steps: ['Start with the digit on the left.', 'Write each digit in its box.', 'The box is multiplied by its place: 3 × 100.'],
    say: '__ is __.',
    sayValues: (q) => { const p = pvOf(q); return p.n ? [p.n, String(q.ans).replace(/×/g, 'times').replace(/\+/g, 'plus')] : null; },
};

registerSkill('placevalue:combine', {
    strings: strings({
        iCan: 'I Can write the number from its parts',
        instructionKey: 'standard-form',
        steps: ['Find the biggest part first.', 'Write each part\'s digit in its place.', 'A place with no part gets a 0.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [arr(p.parts).map(f).join(' plus '), p.n] : null; },
    }),
    misconceptions: ['M-V7', 'M-V6', 'M-V14'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (!p.n) return [];
        const places = placesOf(p.n);
        const out = places.slice(0, 4).map((pl) => step(`${PLACE_WORD[pl]}: ${digitAt(p.n, pl)}${digitAt(p.n, pl) === 0 ? ' (no part, so 0)' : ''}.`));
        out.push(step(`Write ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }]));
        return clampSteps(out.length >= 3 ? out : [step(`The parts are ${arr(p.parts).map(f).join(' + ')}.`)].concat(out));
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const parts = arr(p.parts).map(Number);
        if (!p.n || !parts.length) return null;
        const ds = String(p.n).split('').map(Number);
        const c = [
            { value: num(parts.map(String).join('')), misconception: 'M-V7', explain: 'Wrote the parts side by side.' },
            { value: ds.reduce((a, b) => a + b, 0), misconception: 'M-V6', explain: 'Added the digits, not the parts.' },
        ];
        if (ds.includes(0)) c.unshift({ value: num(ds.filter((d) => d !== 0).join('')), misconception: 'M-V7', explain: 'Left out the zero place.' });
        if (parts.length > 1) c.push({ value: num(parts.map((v) => String(v)[0]).join('')), misconception: 'M-V14', explain: 'Wrote the digits in the order the parts are printed.' });
        return choose(q, c);
    },
});

registerSkill('placevalue:unit_form', {
    strings: stringsBy((q) => (pvOf(q).rename ? UNIT_RENAME : null), {
        iCan: 'I Can write a number in unit form',
        instructionKey: 'unit-form',
        steps: ['Look at each digit and its place.', 'The digit tells how many of that place.', 'A zero means none of that place.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [p.n, String(q.ans)] : null; },
    }),
    misconceptions: ['M-V1', 'M-V4', 'M-V8', 'M-V2'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const counts = obj(p.counts) || {};
        const keys = Object.keys(counts).map(Number).sort((a, b) => b - a);
        if (!keys.length) return [];
        if (p.rename) {
            const hiP = keys[0], loP = keys[1];
            if (counts[1] !== undefined && keys.length === 2 && hiP === 10) {
                return [step(`Every hundred is 10 tens.`), step(`${f(p.n)} has ${counts[10]} tens in all.`), step(`${counts[1]} ones are left.`),
                    step(`Write ${counts[10]}.`, [{ slot: 'answer', value: String(counts[10]) }])];
            }
            return [step(`${counts[loP]} ${PLACE_WORD[loP]} is 1 ${PLACE_WORD[hiP].replace(/s$/, '')} and ${counts[loP] - 10} ${PLACE_WORD[loP]}.`),
                step(`So there are ${counts[hiP] + 1} ${PLACE_WORD[hiP]} and ${counts[loP] - 10} ${PLACE_WORD[loP]}.`),
                step(`That is ${f(p.n)}.`), step(`Write ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }])];
        }
        const out = keys.map((pl, i) => step(`${digitAt(p.n, pl)} ${PLACE_WORD[pl]}.`, [{ slot: `b${i}`, value: String(digitAt(p.n, pl)) }]));
        return clampSteps([step(`Read ${f(p.n)}.`)].concat(out));
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const counts = obj(p.counts) || {};
        const keys = Object.keys(counts).map(Number).sort((a, b) => b - a);
        if (!keys.length) return null;
        if (p.rename) {
            const c = [];
            if (keys.length === 2 && keys[0] === 10 && counts[1] !== undefined) {
                c.push({ value: digitAt(p.n, 10), misconception: 'M-V2', explain: 'Wrote only the tens digit, not all the tens.' });
                c.push({ value: Math.floor(p.n / 100), misconception: 'M-V8', explain: 'Counted the hundreds, not the tens.' });
            } else {
                c.push({ value: num(`${counts[keys[0]]}${counts[keys[1]]}`), misconception: 'M-V8', explain: 'Wrote the counts side by side: more than 9 cannot share one place.' });
                c.push({ value: counts[keys[0]] * keys[0] + (counts[keys[1]] - 10) * keys[1], misconception: 'M-V2', explain: 'Dropped the extra one from renaming.' });
            }
            return choose(q, c);
        }
        const ds = keys.map((pl) => digitAt(p.n, pl));
        const words = keys.map((pl) => PLACE_WORD[pl]);
        const rev = ds.slice().reverse();
        const vals = keys.map((pl, i) => ds[i] * pl);
        return choose(q, [
            { value: rev.map((d, i) => `${d} ${words[i]}`).join(' '), misconception: 'M-V1', explain: 'Read the digits from the right.', slots: Object.fromEntries(rev.map((d, i) => [`b${i}`, String(d)])) },
            { value: vals.map((v, i) => `${f(v)} ${words[i]}`).join(' '), misconception: 'M-V4', explain: 'Wrote the value, not how many.', slots: Object.fromEntries(vals.map((v, i) => [`b${i}`, f(v)])) },
        ]);
    },
});

const UNIT_RENAME = {
    iCan: 'I Can rename tens and hundreds',
    instructionKey: 'missing',
    steps: ['Ten ones make one ten.', 'Ten tens make one hundred.', 'Change 10 of one place for 1 of the next.'],
    say: '__ is __.',
    sayValues: (q) => { const t = String(q.text || '').replace(/_+/g, '').replace(/=.*/, '').trim(); return t ? [t || String(q.ans), q.ans] : null; },
};

/* =============================================================================== more / less */

function moreLessSteps(q) {
    const p = pvOf(q);
    if (!p.step) return [];
    const res = p.dir === 'more' ? p.n + p.step : p.n - p.step;
    const word = PLACE_WORD[p.step] || 'ones';
    if (p.unknown === 'start') {
        return [step(`${f(p.given)} is ${f(p.step)} ${p.dir} than the missing number.`),
            step(`So go the other way: ${f(p.step)} ${p.dir === 'more' ? 'less' : 'more'} than ${f(p.given)}.`),
            step(`${f(p.given)} ${p.dir === 'more' ? '−' : '+'} ${f(p.step)} = ${f(p.n)}.`),
            step(`Write ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }])];
    }
    const crosses = Math.floor(res / (p.step * 10)) !== Math.floor(p.n / (p.step * 10));
    return [step(`Start at ${f(p.n)}.`),
        step(`${f(p.step)} ${p.dir}: the ${word} digit goes ${p.dir === 'more' ? 'up' : 'down'} by 1.`),
        crosses ? step(`It goes past ${p.dir === 'more' ? '9' : '0'}, so the next place changes too.`) : step(`The other digits stay the same.`),
        step(`Write ${f(res)}.`, [{ slot: 'answer', value: f(res) }])];
}

function moreLessWrong(q) {
    const p = pvOf(q);
    if (!p.step) return null;
    const s = p.dir === 'more' ? 1 : -1;
    if (p.unknown === 'start') {
        return choose(q, [
            { value: p.given + s * p.step, misconception: 'M-L4', explain: `Did ${p.dir}, not the opposite.` },
            { value: p.given - s * (p.step === 1 ? 10 : 1), misconception: 'M-L1', explain: 'Used the wrong jump.' },
        ]);
    }
    const res = p.n + s * p.step;
    const other = p.step === 1 ? 10 : 1;
    const c = [];
    if (Math.floor(res / (p.step * 10)) !== Math.floor(p.n / (p.step * 10))) {
        c.push({ value: res - s * p.step * 10, misconception: 'M-L2', explain: 'Changed only one digit when it went past 9 (or 0).' });
    }
    c.push({ value: p.n + s * other, misconception: 'M-L1', explain: `Found ${other} ${p.dir}, not ${f(p.step)}.` });
    c.push({ value: p.n - s * p.step, misconception: 'M-L5', explain: `Went ${p.dir === 'more' ? 'down' : 'up'}, not ${p.dir === 'more' ? 'up' : 'down'}.` });
    return choose(q, c);
}

for (const id of ['more_less_10', 'more_less_100']) {
    registerSkill(`placevalue:${id}`, {
        strings: strings({
            iCan: id === 'more_less_10' ? 'I Can find 1 more, 1 less, 10 more and 10 less' : 'I Can find 10 or 100 more and less',
            instructionKey: 'missing',
            steps: ['Read the number, the jump and the word more or less.',
                'More: that digit goes up 1. Less: it goes down 1.', 'Past 9 or 0, the next place changes too.'],
            say: '__ __ than __ is __.',
            sayValues: (q) => { const p = pvOf(q); return p.step ? (p.unknown === 'start' ? [p.step, p.dir, p.n, p.given] : [p.step, p.dir, p.n, q.ans]) : null; },
        }),
        misconceptions: ['M-L1', 'M-L2', 'M-L4', 'M-L5'],
        workedSteps: moreLessSteps,
        wrongAnswer: moreLessWrong,
    });
}

/* =============================================================================== disks, chart, x10 */

const DISK_READ_DEC = {
    iCan: 'I Can read a decimal from place-value disks',
    instructionKey: 'disk-read',
    steps: ['Count the disks in each zone.', 'Write that digit in its place. An empty zone is a 0.', 'Write the point after the ones.'],
    say: '__ is __.',
    sayValues: (q) => { const p = pvOf(q); return p.places ? [arr(p.places).map((pl) => `${(p.counts || {})[pl]} ${PLACE_WORD[pl]}`).join(', '), shown(p)] : null; },
};

registerSkill('placevalue:place_value_disks', {
    strings: stringsBy((q) => (pvOf(q).task === 'count' ? DISK_COUNT : DISK_TASKS[pvOf(q).task] || (isDec(q) ? DISK_READ_DEC : null)), {
        iCan: 'I Can read a number from place-value disks',
        instructionKey: 'disk-read',
        steps: ['Count the disks in each zone.', 'Write that digit in its place.', 'An empty zone is a 0.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.places ? [arr(p.places).map((pl) => `${(p.counts || {})[pl]} ${PLACE_WORD[pl]}`).join(', '), q.ans] : null; },
    }),
    misconceptions: ['M-V11', 'M-V7', 'M-V1', 'M-V4'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const counts = obj(p.counts) || {};
        const places = arr(p.places).map(Number);
        if (!places.length) return [];
        if (p.task === 'all') {
            const nums = arr(p.nums).map(Number);
            return clampSteps([step(`Put all ${p.counters} counters in the biggest place: ${f(nums[nums.length - 1])}.`),
                step('Move one counter to the next place each time.'), step(`Last, all ${p.counters} are in the ones: ${f(nums[0])}.`),
                step(`Write them, smallest first: ${nums.map(f).join(', ')}.`, nums.map((v, i) => ({ slot: `o${i}`, value: f(v) })))]);
        }
        if (p.task === 'take') {
            const crossed = obj(p.crossed) || {};
            const taken = Object.entries(crossed).map(([pl, c]) => `${c} ${PLACE_WORD[pl]}`).join(' and ');
            return [step(`The counters show ${f(p.n)}.`), step(`${taken} are crossed out.`), step('Count what is left, place by place.'),
                step(`${f(p.left)} is left.`, [{ slot: 'answer', value: f(p.left) }])];
        }
        if (p.task === 'x10' || p.task === 'd10') {
            const up = p.task === 'x10';
            return [step(`The counters show ${f(p.n)}.`), step(`Every counter moves one place ${up ? 'left' : 'right'}.`),
                step(up ? 'Ones become tens, tens become hundreds.' : 'Tens become ones, hundreds become tens.'),
                step(`${f(p.n)} ${up ? '×' : '÷'} 10 = ${f(p.ans)}.`, [{ slot: 'answer', value: f(p.ans) }])];
        }
        if (p.task === 'count') {
            return [step(`Find the ${PLACE_WORD[p.place]} zone.`), step(`Each disk there says ${f(p.place)}.`),
                step(`Count them: there are ${counts[p.place]}.`), step(`Write ${counts[p.place]}.`, [{ slot: 'answer', value: String(counts[p.place]) }])];
        }
        const out = places.slice(0, 4).map((pl) => step(`${PLACE_WORD[pl]}: ${counts[pl] || 0} disks, so the digit is ${counts[pl] || 0}.`));
        out.push(step(`Write ${shown(p)}.`, [{ slot: 'answer', value: shown(p) }]));
        return clampSteps(out.length >= 3 ? out : [step('Look at each zone.')].concat(out));
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const counts = obj(p.counts) || {};
        const places = arr(p.places).map(Number);
        if (!places.length) return null;
        if (p.task === 'all') {
            const nums = arr(p.nums).map(Number);
            // M-V16: swapped the tens and the ones of one number (41 for 14); M-C2: biggest first.
            const k = nums.findIndex((v) => v >= 10 && Number(String(v).split('').reverse().join('')) !== v);
            const swapped = nums.map((v, i) => (i === k ? Number(String(v).split('').reverse().join('')) : v));
            return choose(q, [
                k >= 0 ? { value: swapped.map(f).join(', '), misconception: 'M-V16', explain: `Swapped the tens and the ones of ${f(nums[k])}.`,
                    slots: Object.fromEntries(swapped.map((v, i) => [`o${i}`, f(v)])) } : null,
                { value: nums.slice().reverse().map(f).join(', '), misconception: 'M-C2', explain: 'Wrote the numbers biggest first.',
                    slots: Object.fromEntries(nums.slice().reverse().map((v, i) => [`o${i}`, f(v)])) },
            ]);
        }
        if (p.task === 'take') {
            return choose(q, [
                { value: p.n, misconception: 'M-V17', explain: 'Counted the crossed-out counters too.' },
                { value: p.n - p.left, misconception: 'M-V18', explain: 'Wrote what was taken away, not what is left.' },
            ]);
        }
        if (p.task === 'x10' || p.task === 'd10') {
            const up = p.task === 'x10';
            return choose(q, [
                { value: up ? p.n + 10 : p.n - 10, misconception: 'M-Z5', explain: up ? 'Added 10 instead of multiplying.' : 'Took away 10 instead of dividing.' },
                { value: up ? p.n / 10 : p.n * 10, misconception: 'M-Z4', explain: 'Moved the counters the wrong way.' },
            ]);
        }
        if (p.task === 'count') {
            return choose(q, [
                { value: r6((counts[p.place] || 0) * p.place), misconception: 'M-V4', explain: 'Wrote what the disks are worth, not how many.' },
                { value: places.reduce((a, pl) => a + (counts[pl] || 0), 0), misconception: 'M-V11', explain: 'Counted every disk on the mat.' },
            ]);
        }
        const ds = places.map((pl) => counts[pl] || 0);
        if (isDec(q)) {
            // the digits kept in their zones, the point after the ones: every wrong number is a
            // number the pupil really reads off this mat
            const nz = ds.filter((d) => d > 0);
            return choose(q, [
                { value: ds.reduce((a, b) => a + b, 0), misconception: 'M-V11', explain: 'Added the disk counts.' },
                nz.length < ds.length ? { value: onPlaces(nz.concat(Array(ds.length - nz.length).fill(0)), places), misconception: 'M-V7', explain: 'Left out the empty zone, so the digits slid up a place.' } : null,
                { value: onPlaces(ds.slice().reverse(), places), misconception: 'M-V1', explain: 'Read the zones from the right.' },
            ]);
        }
        return choose(q, [
            { value: ds.reduce((a, b) => a + b, 0), misconception: 'M-V11', explain: 'Added the disk counts.' },
            { value: num(ds.filter((d) => d > 0).join('')), misconception: 'M-V7', explain: 'Left out the empty zone.' },
            { value: num(ds.slice().reverse().join('')), misconception: 'M-V1', explain: 'Read the zones from the right.' },
        ]);
    },
});

// vis_pv_dot_disks (build lane placevalue): the new counter tasks.
const DISK_TASKS = {
    take: { iCan: 'I Can find what is left on a place-value chart', instructionKey: 'disk-left',
        steps: ['Look at the crossed-out counters.', 'Count the counters that are left in each place.', 'Write the number that is left.'],
        say: '__ is left.', sayValues: (q) => [q.ans] },
    x10: { iCan: 'I Can multiply by 10 on a place-value chart', instructionKey: 'counters-move',
        steps: ['Read the number on the chart.', 'Move every counter one place left.', 'Read the new number.'],
        say: '__ times 10 is __.', sayValues: (q) => { const p = pvOf(q); return [p.n, q.ans]; } },
    d10: { iCan: 'I Can divide by 10 on a place-value chart', instructionKey: 'counters-move',
        steps: ['Read the number on the chart.', 'Move every counter one place right.', 'Read the new number.'],
        say: '__ divided by 10 is __.', sayValues: (q) => { const p = pvOf(q); return [p.n, q.ans]; } },
    all: { iCan: 'I Can make every number with a few counters', instructionKey: 'counters-all',
        steps: ['Put every counter in the biggest place.', 'Move one counter to the next place.', 'Write each number. Start with the smallest.'],
        say: 'With __ counters I can make __ numbers.', sayValues: (q) => { const p = pvOf(q); return [p.counters, arr(p.nums).length]; } },
};

const DISK_COUNT = {
    iCan: 'I Can count the disks in one place',
    instructionKey: 'disk-count',
    steps: ['Find the zone the question names.', 'Count only the disks in that zone.', 'Write how many disks.'],
    say: 'There are __ disks.',
    sayValues: (q) => [q.ans],
};

const BUILD_DOTS = {
    iCan: 'I Can draw dots on a place-value chart for a number',
    instructionKey: 'draw-dots',
    steps: ['Read each digit of the number.', 'Draw that many dots in its column.', 'A zero column stays empty.'],
    say: 'I drew __.',
    sayValues: (q) => { const p = pvOf(q); return p.n ? [arr(p.places).map((pl) => `${digitAt(p.n, pl)} ${PLACE_WORD[pl]}`).join(', ')] : null; },
};
registerSkill('placevalue:pv_disks_build', {
    strings: stringsBy((q) => ((pvOf(q).dots || pvOf(q).labels === 'none') ? BUILD_DOTS : null), {
        iCan: 'I Can draw place-value disks for a number',
        instructionKey: 'draw-disks',
        steps: ['Read each digit of the number.', 'Draw that many disks in its zone.', 'Write the value in each disk. A zero zone stays empty.'],
        say: 'I drew __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [arr(p.places).map((pl) => `${digitAt(p.n, pl)} ${PLACE_WORD[pl]}`).join(', ')] : null; },
    }),
    misconceptions: ['M-V1', 'M-V16', 'M-V13', 'M-V7'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const places = arr(p.places).map(Number);
        if (!places.length) return [];
        const mark = (pl) => (p.fraction && pl < 1 ? `1/${Math.round(1 / pl)}` : f(pl));
        const out = places.map((pl) => step(`${digitAt(p.n, pl)} in the ${PLACE_WORD[pl]}: draw ${digitAt(p.n, pl)} ${p.dots ? 'dots' : `disks marked ${mark(pl)}`}.`));
        out.push(step(`The mat shows ${shown(p)}.`, [{ slot: 'answer', value: String(q.printAnswer || shown(p)) }]));
        return clampSteps(out.length >= 3 ? out : [step(`Read ${f(p.n)}.`)].concat(out));
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (!p.n) return null;
        if (isDec(q)) {
            const places = arr(p.places).map(Number);
            const dg = places.map((pl) => digitAt(p.n, pl));
            const sw = dg.slice(); if (sw.length >= 2) [sw[sw.length - 1], sw[sw.length - 2]] = [sw[sw.length - 2], sw[sw.length - 1]];
            const swapped = onPlaces(sw, places);
            return choose(q, [
                { value: onPlaces(dg.slice().reverse(), places), misconception: 'M-V1', explain: 'Drew the digits in the wrong zones: read the number from the right.' },
                swapped !== r6(p.n) ? { value: swapped, misconception: 'M-V16', explain: 'Swapped the last two places.' } : null,
            ]);
        }
        const ds = String(p.n).split('');
        // Each error is a mat a pupil really draws, and the mat drawn IS that number (critic
        // round 3: "every disk a ones disk" was drawn as the digit sum's own mat, 1 ten 5 ones).
        const swapTO = ds.length >= 2 ? num(ds.slice(0, -2).concat([ds[ds.length - 1], ds[ds.length - 2]]).join('')) : null;
        return choose(q, [
            { value: num(ds.slice().reverse().join('')), misconception: 'M-V1', explain: 'Drew the digits in the wrong zones: read the number from the right.' },
            swapTO !== null && swapTO !== p.n ? { value: swapTO, misconception: 'M-V16', explain: 'Swapped the tens and the ones.' } : null,
        ]);
    },
});

registerSkill('placevalue:pv_digit_drag', {
    strings: strings({
        iCan: 'I Can write the digits in a place-value chart',
        instructionKey: 'chart-digits',
        steps: ['Read the number part by part.', 'Each part goes under its place letter.', 'A place with no part gets a 0.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [p.sourceText || f(p.n), f(p.n)] : null; },
    }),
    misconceptions: ['M-V7', 'M-V1'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const places = arr(p.places).map(Number);
        if (!places.length) return [];
        const out = places.slice(0, 5).map((pl, i) => step(`${LETTER[pl]}: ${digitAt(p.n, pl)}.`, [{ slot: `d${i}`, value: String(digitAt(p.n, pl)) }]));
        out.push(step(`The chart shows ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }]));
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (!p.n) return null;
        const ds = String(p.n).split('');
        const c = [];
        if (ds.includes('0')) c.push({ value: num(ds.filter((d) => d !== '0').join('')), misconception: 'M-V7', explain: 'Left the zero place out, so the digits slid over.' });
        c.push({ value: num(ds.slice().reverse().join('')), misconception: 'M-V1', explain: 'Filled the chart from the right.' });
        c.push({ value: num(ds.slice(1).concat('0').join('')), misconception: 'M-V7', explain: 'Started one place too far left.' });
        return choose(q, c);
    },
});

registerSkill('placevalue:place_value_10x', {
    strings: strings({
        iCan: 'I Can multiply and divide by 10, 100 and 1,000',
        instructionKey: 'times-ten',
        steps: ['Times: each digit moves left one place for each zero.', 'Divide: each digit moves right one place for each zero.', 'Fill an empty place with a 0.'],
        say: '__ is __.',
        sayValues: (q) => { const p = pvOf(q); return p.power ? [`${f(p.n)} ${p.op === 'x' ? 'times' : 'divided by'} ${f(p.power)}`, f(q.ans)] : null; },
    }),
    misconceptions: ['M-Z2', 'M-Z4', 'M-Z1'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (!p.power) return [];
        const k = Math.round(Math.log10(p.power));
        const ans = num(q.ans);
        return [step(`${f(p.power)} has ${k} zero${k === 1 ? '' : 's'}.`),
            step(`${p.op === 'x' ? 'Times' : 'Divide'}: every digit moves ${k} place${k === 1 ? '' : 's'} to the ${p.op === 'x' ? 'left' : 'right'}.`),
            step(`${f(p.n)} ${p.op === 'x' ? '×' : '÷'} ${f(p.power)} = ${f(ans)}.`),
            step(`Write ${f(ans)}.`, [{ slot: 'answer', value: f(ans) }])];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (!p.power) return null;
        const ans = num(q.ans);
        const c = [
            { value: p.op === 'x' ? p.n * p.power * 10 : p.n / (p.power * 10), misconception: 'M-Z2', explain: 'Moved the digits one place too many.' },
            { value: p.op === 'x' ? p.n / p.power : p.n * p.power, misconception: 'M-Z4', explain: 'Moved the digits the wrong way.' },
        ];
        const s = String(p.n);
        if (/\d0\d/.test(s)) c.unshift({ value: num(String(ans).replace(/(\d)0(\d)/, '$1$2') + '0'), misconception: 'M-Z1', explain: 'Lost the zero in the middle.' });
        return choose(q, c.filter((w) => Number.isInteger(w.value) || !Number.isInteger(ans)));
    },
});

// The steps follow the number's size: a three-digit page never talks about thousands.
const WORD_NAME_BASE = {
    iCan: 'I Can match a number to its word name',
    instructionKey: 'word-name',
    say: '__ is __.',
    sayValues: (q) => [pvOf(q).n !== undefined ? f(pvOf(q).n) : (String(q.text || '').replace(/[^\d,]/g, '') || '?'), q.ans],
};
const WORD_NAME_SMALL = { ...WORD_NAME_BASE,
    steps: ['Read the hundreds digit. Say the word hundred.', 'Read the tens and ones together.', 'Find the choice with the same words.'] };
const WORD_NAME_BIG = { ...WORD_NAME_BASE,
    steps: ['Read the number in groups of three digits.', 'Say the thousands, then the word thousand.', 'Say the hundreds, tens and ones.'] };
const wordNameN = (q) => { const n = num(pvOf(q).n); return Number.isFinite(n) ? n : num(String(q.text || '').replace(/[^\d]/g, '')); };

registerSkill('placevalue:number_word_names', {
    strings: stringsBy((q) => (wordNameN(q) < 1000 ? WORD_NAME_SMALL : WORD_NAME_BIG), WORD_NAME_BIG),
    misconceptions: ['M-V9', 'M-V10'],
    workedSteps: (q) => {
        const n = wordNameN(q);
        const first = n >= 1000
            ? [step(`Read the thousands group first: ${f(Math.floor(n / 1000))} thousand.`), step(`Then read the rest: ${f(n % 1000)}.`)]
            : [step(`Read the hundreds: ${Math.floor(n / 100)} hundred.`), step(`Then read the tens and ones: ${n % 100}.`)];
        return [...first, step('Find the choice with the same words.'), step(`Circle: ${q.ans}`, [{ slot: 'answer', value: String(q.ans) }])];
    },
    wrongAnswer: (q) => {
        const opts = arr(q.options).map((o) => (o && typeof o === 'object' ? o.label : o)).map(String).filter((o) => o !== String(q.ans));
        return choose(q, opts.slice(0, 2).map((o, i) => ({ value: o, misconception: i ? 'M-V10' : 'M-V9', explain: i ? 'Dropped a place.' : 'Swapped two digits.' })));
    },
});

/* =============================================================================== compare / order */

/* vis_pv_decimal_places: comparing decimals. "More digits is bigger" is the very error here
 * (0.45 < 0.5), so the steps line up the points and compare place by place. */
const cmpWord = (q) => (q.ans === '>' ? 'greater than' : q.ans === '<' ? 'less than' : 'equal to');
const COMPARE_DEC = {
    iCan: 'I Can compare decimals with <, > and =',
    instructionKey: 'compare',
    steps: ['Line up the points. Compare the ones first.', 'Then the tenths, then the hundredths: the first different digit decides.', 'More digits is not bigger: 0.5 > 0.45. A zero on the end changes nothing.'],
    say: '__ is __ __.',
    sayValues: (q) => { const p = pvOf(q); return p.as !== undefined ? [p.as, cmpWord(q), p.bs] : null; },
};
/** The two decimals written to the same number of places (5.6 and 5.59 -> 5.60 and 5.59). */
function padDec(p) {
    const [aw, af = ''] = String(p.as).split('.');
    const [bw, bf = ''] = String(p.bs).split('.');
    const n = Math.max(af.length, bf.length);
    return { aw, bw, af: af.padEnd(n, '0'), bf: bf.padEnd(n, '0') };
}
const DEC_PLACE_NAMES = ['tenths', 'hundredths', 'thousandths', 'ten-thousandths'];

registerSkill('placevalue:compare', {
    strings: stringsBy((q) => (isDec(q) ? COMPARE_DEC : null), {
        iCan: 'I Can compare numbers with <, > and =',
        instructionKey: 'compare',
        steps: ['Count the digits: more digits is bigger.', 'Same length: compare from the left place.', 'The first different digit decides.'],
        say: '__ is __ __.',
        sayValues: (q) => { const p = pvOf(q); return p.a !== undefined ? [p.a, cmpWord(q), p.b] : null; },
    }),
    misconceptions: ['M-C1', 'M-C2', 'M-C3', 'M-D1'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (p.a === undefined) return [];
        if (isDec(q) && p.as !== undefined) {
            const d = padDec(p);
            let why;
            if (d.aw !== d.bw) why = `The ones differ: ${d.aw} and ${d.bw}.`;
            else {
                const i = [...d.af].findIndex((c, k) => c !== d.bf[k]);
                why = i < 0 ? `Written to the same places they are ${d.aw}.${d.af} and ${d.bw}.${d.bf}: every digit is the same.`
                    : `The first different digits are ${d.af[i]} and ${d.bf[i]}, in the ${DEC_PLACE_NAMES[i]}.`;
            }
            return [step(`Line up the points: ${d.aw}.${d.af} and ${d.bw}.${d.bf}.`), step(why),
                step(`${p.as} ${q.ans} ${p.bs}.`, [{ slot: 'answer', value: String(q.ans) }])];
        }
        const la = String(p.a).length, lb = String(p.b).length;
        let why;
        if (la !== lb) why = `${f(la > lb ? p.a : p.b)} has more digits.`;
        else if (p.a === p.b) why = 'Every digit is the same.';
        else {
            const sa = String(p.a), sb = String(p.b);
            const i = [...sa].findIndex((d, k) => d !== sb[k]);
            why = `The first different digits are ${sa[i]} and ${sb[i]}.`;
        }
        return [step(`Compare ${f(p.a)} and ${f(p.b)}.`), step(why), step(`${f(p.a)} ${q.ans} ${f(p.b)}.`, [{ slot: 'answer', value: String(q.ans) }])];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (p.a === undefined) return null;
        const flip = q.ans === '>' ? '<' : q.ans === '<' ? '>' : '<';
        if (isDec(q) && p.as !== undefined) {
            // M-D1: "longer is bigger" - read the parts after the point as whole numbers (45 > 5).
            const [aw, af = ''] = String(p.as).split('.');
            const [bw, bf = ''] = String(p.bs).split('.');
            const asWhole = aw !== bw ? null : (Number(af) > Number(bf) ? '>' : Number(af) < Number(bf) ? '<' : '=');
            const longer = String(p.as).length > String(p.bs).length ? '>' : String(p.as).length < String(p.bs).length ? '<' : null;
            const cands = [
                asWhole ? { value: asWhole, misconception: 'M-D1', explain: 'Read the digits after the point as a whole number: more digits looked bigger.' } : null,
                longer ? { value: longer, misconception: 'M-D1', explain: 'Took the longer number as the bigger one.' } : null,
            ].filter((c) => c && c.value !== String(q.ans));
            return choose(q, cands.length ? [cands[0]] : [{ value: flip, misconception: 'M-C1', explain: 'Wrote the sign the wrong way round.' }]);
        }
        const lastDigits = (String(p.a).slice(-1) > String(p.b).slice(-1)) ? '>' : (String(p.a).slice(-1) < String(p.b).slice(-1) ? '<' : '=');
        const sa = String(p.a), sb = String(p.b);
        const firstDigits = sa.length !== sb.length ? (sa[0] > sb[0] ? '>' : sa[0] < sb[0] ? '<' : null) : null;
        // A named place error first (critic round 3: every shown mistake was the reversed sign);
        // the reversed sign only when no place error gives a wrong sign.
        const place = [
            firstDigits ? { value: firstDigits, misconception: 'M-C3', explain: 'Compared the first digits, not how many digits.' } : null,
            { value: lastDigits, misconception: 'M-C2', explain: 'Compared the ones digits, not the biggest place.' },
        ].filter((c) => c && c.value !== String(q.ans));
        return choose(q, place.length ? place : [{ value: flip, misconception: 'M-C1', explain: 'Wrote the sign the wrong way round.' }]);
    },
});

for (const id of ['order_least_to_greatest', 'order_greatest_to_least']) {
    const up = id === 'order_least_to_greatest';
    registerSkill(`placevalue:${id}`, {
        strings: strings({
            iCan: up ? 'I Can order numbers from least to greatest' : 'I Can order numbers from greatest to least',
            instructionKey: up ? 'order-least' : 'order-down',
            steps: [up ? 'Find the least number. Write it first.' : 'Find the greatest number. Write it first.',
                'Compare the digits from the left place.', 'Cross out each number as you write it.'],
            say: 'In order: __.',
            sayValues: (q) => [String(q.ans).split(',').map((v) => f(v)).join(', ')],
        }),
        misconceptions: ['M-O1', 'M-O2'],
        workedSteps: (q) => {
            const list = String(q.ans).split(',').map(Number).filter(Number.isFinite);
            if (!list.length) return [];
            const out = list.slice(0, 4).map((v, i) => step(`${i === 0 ? (up ? 'Least' : 'Greatest') : 'Next'}: ${f(v)}.`, [{ slot: `o${i}`, value: f(v) }]));
            out.push(step(`Write ${list.map(f).join(', ')}.`, [{ slot: 'answer', value: list.map(f).join(', ') }]));
            return clampSteps(out);
        },
        wrongAnswer: (q) => {
            const list = String(q.ans).split(',').map(Number).filter(Number.isFinite);
            if (list.length < 2) return null;
            const rev = list.slice().reverse();
            const byLead = list.slice().sort((a, b) => (up ? 1 : -1) * (String(a).localeCompare(String(b))));
            return choose(q, [
                { value: rev.join(','), misconception: 'M-O1', explain: 'Started from the wrong end.', slots: Object.fromEntries(rev.map((v, i) => [`o${i}`, f(v)])) },
                { value: byLead.join(','), misconception: 'M-O2', explain: 'Sorted by the first digit only.', slots: Object.fromEntries(byLead.map((v, i) => [`o${i}`, f(v)])) },
            ]);
        },
    });
}

/* =============================================================================== rounding */

const roundSay = '__ is between __ and __. It rounds to __.';
const roundSayValues = (q) => { const p = pvOf(q); if (!p.place) return null; const lo = Math.floor(p.n / p.place) * p.place; return [p.n, lo, lo + p.place, roundTo(p.n, p.place)]; };

const ROUND_NOTATE = {
    iCan: 'I Can find the digit that decides',
    instructionKey: 'underline-place',
    instructionVars: (q) => ({ place: (PLACE_WORD[pvOf(q).place] || 'tens') }),
    steps: ['Find the letter of the place you round to.', 'Underline the digit under it.', 'Circle the digit just after it.'],
    say: 'I look at the __ digit.',
    sayValues: (q) => { const p = pvOf(q); return p.place ? [digitAt(p.n, p.place / 10 || 1)] : null; },
};
const ROUND_DECIDE = {
    iCan: 'I Can decide to round up or round down',
    instructionKey: 'round-up-down',
    steps: ['Look at the digit after the cut line.', '5 or more: round up.', '4 or less: round down.'],
    say: 'It is __, so I __.',
    sayValues: (q) => { const p = pvOf(q); return p.place ? [digitAt(p.n, p.place / 10 || 1), String(q.ans).toLowerCase()] : null; },
};
const ROUND_JUDGE = {
    iCan: 'I Can check a rounding',
    instructionKey: 'check-fix',
    steps: ['Round the number yourself first.', 'Compare with the answer shown.', 'Check Correct, or Fix it and write the right answer.'],
    say: '__ rounds to __.',
    sayValues: (q) => { const p = pvOf(q); return p.place ? [p.n, roundTo(p.n, p.place)] : null; },
};
const ROUND_CIRCLE = {
    iCan: 'I Can find every number that rounds to a number',
    instructionKey: 'circle-rounds-to',
    instructionVars: (q) => ({ n: f(pvOf(q).target) }),
    steps: ['Find the two halfway numbers either side.', 'Halfway rounds up.', 'Circle every number between them.'],
    say: '__ rounds to __, so I circle it.',
    sayValues: (q) => { const p = pvOf(q); return p.target ? [arr(p.tiles).find((v) => roundTo(v, p.place) === p.target), p.target] : null; },
};

function roundingSteps(q) {
    const p = pvOf(q);
    if (!p.place) return [];
    const P = p.place;
    const lo = Math.floor(p.n / P) * P;
    const r = roundTo(p.n, P);
    const next = digitAt(p.n, P / 10 >= 1 ? P / 10 : 1);
    if (p.scope === 'notation') {
        return [step(`Round to the nearest ${f(P)}: find the ${PLACE_WORD[P]} place.`), step(`Underline its digit: ${digitAt(p.n, P)}.`),
            step(`Circle the digit after it: ${next}.`, [{ slot: 'b0', value: String(digitAt(p.n, P)) }, { slot: 'b1', value: String(next) }])];
    }
    const out = [step(`${f(p.n)} is between ${f(lo)} and ${f(lo + P)}.`),
        p.n - lo === P / 2 ? step(`It is exactly halfway. Halfway rounds up.`) : step(`The digit after the cut is ${next}: ${next >= 5 ? '5 or more, round up' : '4 or less, round down'}.`)];
    if (p.scope === 'decision') return out.concat(step(`Check ${String(q.ans)}.`, [{ slot: 'answer', value: String(q.ans) }]));
    if (p.scope === 'judge') return out.concat(step(`${f(p.n)} rounds to ${f(r)}.`), step(`${f(p.shown)} is ${p.shown === r ? 'correct' : 'wrong'}.`, [{ slot: 'answer', value: String(q.ans) }]));
    return out.concat(step(`${f(p.n)} rounds to ${f(r)}.`), step(`Write ${f(r)}.`, [{ slot: 'answer', value: f(r) }]));
}

function roundingWrong(q) {
    const p = pvOf(q);
    if (!p.place) return null;
    if (p.kind === 'circle') {
        const ids = arr(q.ans).map(String);
        const tiles = arr(p.tiles).map(Number);
        const opts = arr(q.options);
        const idOf = (v) => { const o = opts.find((x) => x && num(x.label) === v); return o ? o.id : null; };
        const below = idOf(p.target - p.place / 2 - 1);
        const high = idOf(p.target + p.place / 2);
        const low = idOf(p.target - p.place / 2);
        const c = [];
        if (high) c.push({ value: ids.concat(high), misconception: 'M-R2', explain: 'Treated halfway above as rounding down.' });
        if (low) c.push({ value: ids.filter((x) => x !== low), misconception: 'M-R2', explain: 'Treated halfway below as rounding down.' });
        if (below) c.push({ value: ids.concat(below), misconception: 'M-R7', explain: 'Circled a number by its first digits only.' });
        void tiles;
        return choose(q, c);
    }
    if (p.scope === 'decision') {
        return choose(q, [{ value: q.ans === 'Round up' ? 'Round down' : 'Round up', misconception: p.n % p.place === p.place / 2 ? 'M-R2' : 'M-R3', explain: 'Read the wrong digit, or rounded halfway down.' }]);
    }
    if (p.scope === 'judge') {
        return choose(q, [{ value: q.ans === 'Correct' ? 'Fix it' : 'Correct', misconception: 'M-R1', explain: 'Did not round the number before checking.' }]);
    }
    if (p.scope === 'notation') {
        const d = digitAt(p.n, p.place), nx = digitAt(p.n, p.place / 10 || 1), up = digitAt(p.n, p.place * 10);
        return choose(q, [
            { value: `${nx}, ${d}`, misconception: 'M-R5', explain: 'Underlined the digit after the place.', slots: { b0: String(nx), b1: String(d) } },
            { value: `${up}, ${d}`, misconception: 'M-R5', explain: 'Underlined the place before it.', slots: { b0: String(up), b1: String(d) } },
        ]);
    }
    return choose(q, pvRoundingErrors(p.n, p.place).map((w) => ({ ...w, explain: {
        'M-R1': 'Rounded to the other end of the line.', 'M-R2': 'Rounded halfway down.', 'M-R3': 'Changed only the digit after the place.',
        'M-R4': 'Did not change the next place at a 9.', 'M-R5': 'Rounded to the wrong place.' }[w.misconception] })));
}

const nearestDef = (P) => ({
    iCan: `I Can round to the nearest ${f(P)}`,
    instructionKey: 'round',
    instructionVars: () => ({ place: f(P) }),
    steps: ['Find the place you round to. The cut line is after it.', 'Look at the digit after the cut line.', '5 or more: round up. 4 or less: round down.'],
    say: roundSay,
    sayValues: roundSayValues,
});

for (const [id, P] of [['nearest_10', 10], ['nearest_100', 100], ['nearest_1000', 1000], ['nearest_10000', 10000], ['nearest_100000', 100000], ['nearest_million', 1000000]]) {
    const main = nearestDef(P);
    registerSkill(`number_sense:${id}`, {
        strings: stringsBy((q) => {
            const p = pvOf(q);
            if (p.kind === 'circle') return ROUND_CIRCLE;
            return p.scope === 'notation' ? ROUND_NOTATE : p.scope === 'decision' ? ROUND_DECIDE : p.scope === 'judge' ? ROUND_JUDGE : null;
        }, main),
        misconceptions: ['M-R1', 'M-R2', 'M-R3', 'M-R4', 'M-R5', 'M-R7'],
        workedSteps: (q) => (pvOf(q).kind === 'circle'
            ? [step(`The numbers that round to ${f(pvOf(q).target)} go from ${f(pvOf(q).target - P / 2)} up to ${f(pvOf(q).target + P / 2 - 1)}.`),
                step('Halfway rounds up.'), step(`Circle ${String(q.printAnswer || '')}.`, [{ slot: 'answer', value: String(q.printAnswer || '') }])]
            : roundingSteps(q)),
        wrongAnswer: roundingWrong,
    });
}

registerSkill('number_sense:rounding_visual', {
    strings: strings({
        iCan: 'I Can round on a number line',
        instructionKey: 'mark-round',
        steps: ['Find the number between the two ends.', 'Mark the number on the line.', 'Which end is it nearer? Halfway rounds up.'],
        say: roundSay,
        sayValues: roundSayValues,
    }),
    misconceptions: ['M-R1', 'M-R2', 'M-R4', 'M-R5'],
    workedSteps: roundingSteps,
    wrongAnswer: roundingWrong,
});

/* ------------------------------------------------ round on a number line: thousands and beyond */
// round_nl_thousands / _ten_thousands / _hundred_thousands (owner, 2026-09-25). The pupil places
// the number as a dot, finds the halfway point, and decides; the steps say exactly that.
const RNL_SIZE = { round_nl_thousands: 'thousands', round_nl_ten_thousands: 'ten thousands', round_nl_hundred_thousands: 'hundred thousands' };
function roundNlSteps(q) {
    const p = pvOf(q);
    if (!p.place || !Array.isArray(p.line)) return [];
    const [lo, hi] = p.line.map(Number);
    const half = lo + p.place / 2;
    const r = roundTo(p.n, p.place);
    const place = p.lineMode === 'plotted'
        ? step(`${f(p.n)} is the dot, between ${f(lo)} and ${f(hi)}.`)
        : step(`Put a dot for ${f(p.n)} between ${f(lo)} and ${f(hi)}.`, [{ slot: 'mark', value: f(p.n) }]);
    const decide = p.n === lo ? step(`It is already on a multiple of ${f(p.place)}, so it stays ${f(p.n)}.`)
        : p.n === half ? step(`${f(p.n)} is exactly halfway. Halfway rounds up.`)
            : step(`${f(p.n)} is ${p.n > half ? 'after' : 'before'} halfway, so it is nearer ${f(r)}.`);
    return [place, step(`Halfway between ${f(lo)} and ${f(hi)} is ${f(half)}.`), decide,
        step(`Write ${f(r)}.`, [{ slot: 'answer', value: f(r) }])];
}
function roundNlWrong(q) {
    const p = pvOf(q);
    if (!p.place || !Array.isArray(p.line)) return null;
    const [lo, hi] = p.line.map(Number);
    const blanks = q.answerType === 'inline-blanks';
    const explain = { 'M-R1': 'Rounded to the other end of the line.', 'M-R2': 'Rounded halfway down.',
        'M-R3': 'Changed only the digit after the place.', 'M-R4': 'Did not change the next place at a 9.', 'M-R5': 'Rounded to the wrong place.' };
    // Already a multiple (owner ruling 2026-09-25): the real error is moving it to the next one.
    const c = p.n % p.place === 0
        ? [{ value: p.n + p.place, misconception: 'M-R1', explain: `Rounded ${f(p.n)} up to ${f(p.n + p.place)}: it was already a multiple of ${f(p.place)}.` }]
        : pvRoundingErrors(p.n, p.place).map((w) => ({ ...w, explain: explain[w.misconception] }));
    // M-R8: the dot counted from the wrong end of the line, so it lands on the other side of
    // halfway and the number rounds the wrong way (only where the pupil places the dot).
    if (p.lineMode !== 'plotted') {
        const mirror = hi - (p.n - lo);
        const rm = roundTo(mirror, p.place);
        if (mirror !== p.n && rm !== roundTo(p.n, p.place)) c.push({ value: rm, misconception: 'M-R8', explain: 'Placed the dot from the wrong end of the line.', mark: mirror });
    }
    // Always down (truncating): the lower end, even when the number is past halfway.
    if (roundTo(p.n, p.place) !== lo) c.push({ value: lo, misconception: 'M-R1', explain: 'Always rounded down: kept the digits and wrote zeros after them.' });
    return choose(q, c.map((w) => ({
        value: w.value, misconception: w.misconception, explain: w.explain,
        ...(blanks ? { slot: 'answer', slots: { mark: f(w.mark !== undefined ? w.mark : p.n), answer: f(w.value) } } : {}),
    })));
}
// A number already on a multiple of the place (owner ruling 2026-09-25, "yes please allow": one
// per block of six, an exception to the family's already-rounded guard for these three skills
// only) says so in its oral frame: "6,000 is already a multiple of 1,000, so it stays 6,000."
const RNL_MULT_SAY = '__ is already a multiple of __, so it stays __.';
const rnlSayValues = (q) => { const p = pvOf(q); return p.place && p.n % p.place === 0 ? [p.n, p.place, p.n] : roundSayValues(q); };
const RNL_MARK = {
    iCan: 'I Can place a number on a number line and round it',
    instructionKey: 'mark-dot-round',
    instructionVars: (q) => ({ place: f(pvOf(q).place || 1000) }),
    steps: ['Put a dot for the number between the two ends.', 'Find the halfway point.', 'Before halfway: round down. Halfway or after: round up.'],
    say: roundSay,
    sayValues: roundSayValues,
};
const RNL_PLOTTED = {
    iCan: 'I Can round a number on a number line',
    instructionKey: 'round',
    instructionVars: (q) => ({ place: f(pvOf(q).place || 1000) }),
    steps: ['Find the dot between the two ends.', 'Find the halfway point.', 'Before halfway: round down. Halfway or after: round up.'],
    say: roundSay,
    sayValues: roundSayValues,
};
const RNL_MARK_MULT = { ...RNL_MARK, say: RNL_MULT_SAY, sayValues: rnlSayValues };
const RNL_PLOTTED_MULT = { ...RNL_PLOTTED, say: RNL_MULT_SAY, sayValues: rnlSayValues };
for (const id of Object.keys(RNL_SIZE)) {
    registerSkill(`number_sense:${id}`, {
        strings: stringsBy((q) => {
            const p = pvOf(q);
            const mult = p.place && p.n % p.place === 0;
            return p.lineMode === 'plotted' ? (mult ? RNL_PLOTTED_MULT : RNL_PLOTTED) : (mult ? RNL_MARK_MULT : RNL_MARK);
        }, RNL_MARK),
        misconceptions: ['M-R1', 'M-R2', 'M-R3', 'M-R4', 'M-R5', 'M-R8'],
        workedSteps: roundNlSteps,
        wrongAnswer: roundNlWrong,
    });
}

registerSkill('number_sense:between_tens', {
    strings: strings({
        iCan: 'I Can find the two tens a number is between',
        instructionKey: 'between-tens',
        steps: ['Look at the tens digit.', 'The ten before: the tens digit, then 0.', 'The ten after: one more ten.'],
        say: '__ is between __ and __.',
        sayValues: (q) => { const p = pvOf(q); return p.n ? [p.n, p.lo, p.hi] : null; },
    }),
    misconceptions: ['M-B1', 'M-B2'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (!p.n) return [];
        return [step(`${f(p.n)} has ${Math.floor(p.n / 10)} tens.`), step(`The ten before is ${f(p.lo)}.`, [{ slot: 'b0', value: f(p.lo) }]),
            step(`The ten after is ${f(p.hi)}.`, [{ slot: 'b1', value: f(p.hi) }])];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        if (!p.n) return null;
        const t = Math.floor(p.n / 10);
        return choose(q, [
            { value: `${f(t)} and ${f(t + 1)}`, misconception: 'M-B1', explain: 'Wrote how many tens, not the tens.', slots: { b0: f(t), b1: f(t + 1) } },
            { value: `${f(p.hi)} and ${f(p.hi + 10)}`, misconception: 'M-B2', explain: 'Started at the next ten.', slots: { b0: f(p.hi), b1: f(p.hi + 10) } },
        ]);
    },
});

registerSkill('number_sense:place_on_number_line', {
    strings: strings({
        iCan: 'I Can mark a number on a number line',
        instructionKey: 'line-mark',
        steps: ['Read the two end numbers.', 'Find how much each small jump is.', 'Count the jumps from the left end. Mark the number.'],
        say: '__ is here.',
        sayValues: (q) => [q.ans],
    }),
    misconceptions: ['M-N1', 'M-N2'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const line = arr(p.line).map(Number);
        if (line.length !== 2) return [];
        const tick = (line[1] - line[0]) / 10;
        const k = Math.round((p.n - line[0]) / tick);
        return [step(`The line goes from ${f(line[0])} to ${f(line[1])}.`), step(`Each small jump is ${f(tick)}.`),
            step(`${f(p.n)} is ${k} jump${k === 1 ? '' : 's'} from ${f(line[0])}.`), step(`Mark ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }])];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const line = arr(p.line).map(Number);
        if (line.length !== 2) return null;
        const tick = (line[1] - line[0]) / 10;
        const k = Math.round((p.n - line[0]) / tick);
        const c = [{ value: p.n + tick, misconception: 'M-N1', explain: 'Counted the start of the line as one jump.' }];
        if (tick > 1) c.push({ value: line[0] + k, misconception: 'M-N2', explain: 'Counted every jump as 1.' });
        c.push({ value: p.n - tick, misconception: 'M-N1', explain: 'Stopped one jump short.' });
        return choose(q, c);
    },
});

/* ============================================ nl_20: numbers on a number line (build lane placevalue) */

const SCALE_DEFS = {
    read: {
        iCan: 'I Can read a number on a number line',
        instructionKey: 'line-arrow',
        steps: ['Read the numbers on the line.', 'Find how much each jump is.', 'Count the jumps to the arrow.', 'Write the number.'],
        say: 'The arrow points to __.',
    },
    mark: {
        iCan: 'I Can mark a number on a number line',
        instructionKey: 'line-mark',
        steps: ['Read the numbers on the line.', 'Find how much each jump is.', 'Count the jumps to the number.', 'Mark it with a dot.'],
        say: '__ is here.',
    },
    fill: {
        iCan: 'I Can count along a number line',
        instructionKey: 'line-letters',
        steps: ['Read the numbers on the line.', 'Find how much each jump is.', 'Count on to each letter.', 'Write the number.'],
        say: 'A is __.',
    },
    estimate: {
        iCan: 'I Can estimate where a number goes on a line',
        instructionKey: 'line-estimate',
        steps: ['Read the two end numbers.', 'Find halfway.', 'Is the number before or after halfway?', 'Mark about where it goes.'],
        say: '__ is about here.',
    },
};
for (const d of Object.values(SCALE_DEFS)) d.sayValues = (q) => { const p = pvOf(q); return [p.task === 'fill' ? arr(p.targets)[0] : p.n]; };

registerSkill('number_sense:number_line_scales', {
    // The task is the page's (one task a page): the first item's, else the skill's own option.
    strings: (() => {
        const by = Object.fromEntries(Object.entries(SCALE_DEFS).map(([k, d]) => [k, strings(d)]));
        const fn = (ref = {}) => {
            const t = (ref.q && pvOf(ref.q).task) || (ref.opts && ref.opts.task) || 'read';
            return (by[t] || by.read)(ref);
        };
        fn.def = SCALE_DEFS.read;
        return fn;
    })(),
    misconceptions: ['M-N1', 'M-N2', 'M-N3'],
    workedSteps: (q) => {
        const p = pvOf(q);
        if (!Number.isFinite(Number(p.step))) return [];
        const lo = Number(p.lo), hi = Number(p.hi), st = Number(p.step);
        if (p.task === 'estimate') {
            const mid = (lo + hi) / 2;
            return [step(`The line goes from ${f(lo)} to ${f(hi)}.`), step(`Halfway is ${f(mid)}.`),
                step(`${f(p.n)} is ${p.n < mid ? 'before' : p.n > mid ? 'after' : 'at'} halfway.`), step(`Mark ${f(p.n)} about there.`, [{ slot: 'answer', value: f(p.n) }])];
        }
        if (p.task === 'fill') {
            const ts = arr(p.targets).map(Number);
            return clampSteps([step(`The line goes from ${f(lo)} to ${f(hi)}.`), step(`Each jump is ${f(st)}.`),
                ...ts.map((v, i) => step(`${'ABC'[i]} is ${Math.round((v - lo) / st)} jumps from ${f(lo)}: ${f(v)}.`, [{ slot: `b${i}`, value: f(v) }]))]);
        }
        const k = Math.floor((p.n - lo) / st + 1e-9);
        const at = Math.round((lo + k * st) * 1e6) / 1e6;
        const last = p.task === 'mark' ? step(`Mark ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }]) : step(`The arrow points to ${f(p.n)}.`, [{ slot: 'answer', value: f(p.n) }]);
        const count = step(`Count ${k} jump${k === 1 ? '' : 's'} from ${f(lo)}${p.half ? ` to ${f(at)}` : ''}.`);
        return [step(`The line goes from ${f(lo)} to ${f(hi)}.`), step(`Each jump is ${f(st)}.`), count,
            ...(p.half ? [step(`The arrow is halfway to ${f(at + st)}.`)] : []), last];
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const lo = Number(p.lo), st = Number(p.step);
        if (!Number.isFinite(st)) return null;
        if (p.task === 'fill') {
            const ts = arr(p.targets).map(Number);
            const k = ts.map((v) => Math.round((v - lo) / st));
            const ones = ts.map((v, i) => lo + k[i]);
            const c = [];
            if (st > 1) c.push({ value: ones.map(f).join(', '), misconception: 'M-N2', explain: 'Counted every jump as 1.', slots: Object.fromEntries(ones.map((v, i) => [`b${i}`, f(v)])) });
            const off = ts.map((v) => v + st);
            c.push({ value: off.map(f).join(', '), misconception: 'M-N1', explain: 'Counted the first tick as a jump.', slots: Object.fromEntries(off.map((v, i) => [`b${i}`, f(v)])) });
            return choose(q, c);
        }
        const k = Math.round((p.n - lo) / st);
        const c = [{ value: p.n + st, misconception: 'M-N1', explain: 'Counted the ticks, not the jumps: one jump too many.' }];
        if (st > 1 && !p.half) c.push({ value: lo + k, misconception: 'M-N2', explain: 'Counted every jump as 1.' });
        if (p.half) c.push({ value: p.n - st / 2 + 1, misconception: 'M-N3', explain: 'Read halfway along a jump as one more.' });
        c.push({ value: p.n - st, misconception: 'M-N1', explain: 'Stopped one jump short.' });
        return choose(q, c);
    },
});

const SORTS = [['round_sort_10', 10], ['round_sort_100', 100], ['round_sort_1000', 1000], ['round_sort_10000', 10000],
    ['round_sort_100000', 100000], ['round_sort_million', 1000000], ['round_sort_tenths', 0.1], ['round_sort_hundredths', 0.01]];
for (const [id, P] of SORTS) {
    const name = P === 0.1 ? 'tenth' : P === 0.01 ? 'hundredth' : f(P);
    registerSkill(`number_sense:${id}`, {
        strings: strings({
            iCan: `I Can sort numbers by the nearest ${name}`,
            instructionKey: 'sort-round',
            steps: ['Find the halfway number between the bins.', 'Halfway rounds up.', 'Write each number under what it rounds to.'],
            say: '__ rounds to __, so it goes here.',
            sayValues: (q) => { const t = arr(q.tiles)[0]; const a = obj(q.ans) || {}; const b = arr(q.bins).find((x) => x.id === a[t && t.id]); return t && b ? [t.label, b.label] : null; },
        }),
        misconceptions: ['M-R7', 'M-R2'],
        workedSteps: (q) => {
            const bins = arr(q.bins);
            const a = obj(q.ans) || {};
            if (!bins.length) return [];
            const out = bins.slice(0, 3).map((b) => step(`${b.label === 'Neither' ? 'Neither' : `Rounds to ${b.label}`}: ${arr(q.tiles).filter((t) => a[t.id] === b.id).map((t) => t.label).join(', ') || 'none'}.`));
            out.push(step('Write each number in its column.', [{ slot: 'answer', value: String(q.printAnswer || '') }]));
            // Name the halfway number itself (the step the page's Steps band teaches).
            const bv = arr(pvOf(q).bins).map(Number);
            const dec = P < 1 ? (P === 0.1 ? 2 : 3) : 0;
            const halves = bv.slice(1).map((b, i) => (bv[i] + b) / 2).filter((h, i) => bv[i + 1] - bv[i] <= P + 1e-9);
            const first = halves.length
                ? step(`Halfway between ${dec ? bv[0].toFixed(dec - 1) : f(bv[0])} and ${dec ? (bv[0] + P).toFixed(dec - 1) : f(bv[0] + P)} is ${dec ? halves[0].toFixed(dec) : f(halves[0])}. Halfway rounds up.`)
                : step('Find the halfway numbers first. Halfway rounds up.');
            return clampSteps([first].concat(out));
        },
        wrongAnswer: (q) => {
            const a = obj(q.ans) || {};
            const tiles = arr(q.tiles);
            const bins = arr(q.bins);
            const p = pvOf(q);
            if (!tiles.length || bins.length < 2) return null;
            const binVals = arr(p.bins).map(Number);
            // M-R7: every number sorted by its leading digits (into the lower bin); M-R2: the
            // halfway numbers put in the lower bin.
            const lead = {};
            tiles.forEach((t) => { const v = num(t.label); let k = 0; binVals.forEach((b, i) => { if (v >= b) k = i; }); lead[t.id] = `bin_${k}`; });
            const half = Object.assign({}, a);
            tiles.forEach((t) => { const v = num(t.label); binVals.forEach((b, i) => { if (i && Math.abs(v - (b - (binVals[1] - binVals[0]) / 2)) < 1e-9) half[t.id] = `bin_${i - 1}`; }); });
            if (Math.abs(num(tiles[0].label) - binVals[0] - P / 2) < 1e-9) half[tiles[0].id] = 'bin_0';
            const show = (m) => bins.map((b) => `${b.label}: ${tiles.filter((t) => m[t.id] === b.id).map((t) => t.label).join(', ') || '—'}`).join(' · ');
            return choose(q, [
                { value: lead, display: show(lead), misconception: 'M-R7', explain: 'Sorted by the first digits only.' },
                { value: half, display: show(half), misconception: 'M-R2', explain: 'Put the halfway number in the lower bin.' },
            ]);
        },
    });
}

registerSkill('number_sense:rounding_table', {
    strings: strings({
        iCan: 'I Can round a number to different places',
        instructionKey: 'round-table',
        steps: ['Round from the number itself every time.', 'Find the place, then the digit after it.', '5 or more rounds up.'],
        say: 'To the nearest __, __ is __.',
        sayValues: (q) => { const p = pvOf(q); const rows = arr(p.rows); const pl = arr(p.places); return rows.length ? [pl[0], rows[0], roundTo(rows[0], pl[0])] : null; },
    }),
    misconceptions: ['M-R6', 'M-R5', 'M-R1'],
    workedSteps: (q) => {
        const p = pvOf(q);
        const cells = arr(p.cells);
        const rows = arr(p.rows).map(Number);
        const places = arr(p.places).map(Number);
        if (!cells.length) return [];
        const out = cells.slice(0, 4).map(([r, c], i) => step(`${f(rows[r])} to the nearest ${f(places[c])} is ${f(roundTo(rows[r], places[c]))}.`, [{ slot: `t${i}`, value: f(roundTo(rows[r], places[c])) }]));
        out.push(step(`Fill in: ${String(q.ans)}.`, [{ slot: 'answer', value: String(q.ans) }]));
        return clampSteps(out.length >= 3 ? out : [step('Round from the number itself.')].concat(out));
    },
    wrongAnswer: (q) => {
        const p = pvOf(q);
        const cells = arr(p.cells);
        const rows = arr(p.rows).map(Number);
        const places = arr(p.places).map(Number);
        if (!cells.length) return null;
        // M-R6: rounded from the column before (a chain: 145 -> 150 -> 200); M-R5: rounded to the
        // place AFTER the one asked (171 to the nearest 100 written 170); M-R1: always rounded
        // down. A cell the error does not change keeps its right value, so a table shows the one
        // mistake a pupil really makes, never "0, 0, 1,000" (critic round 3: rounding to the next
        // place UP turned 3-digit numbers into 0s and 1,000s).
        const down = (n, P) => Math.floor(n / P) * P;
        const chain = cells.map(([r, c]) => (c > 0 ? roundTo(roundTo(rows[r], places[c - 1]), places[c]) : roundTo(rows[r], places[c])));
        const wrongPlace = cells.map(([r, c]) => (places[c] >= 100 ? roundTo(rows[r], places[c] / 10) : down(rows[r], places[c])));
        const alwaysDown = cells.map(([r, c]) => down(rows[r], places[c]));
        const right = cells.map(([r, c]) => roundTo(rows[r], places[c]));
        const differs = (list) => list.some((v, i) => v !== right[i]);
        return choose(q, [
            differs(chain) ? { value: chain.map(f).join('; '), misconception: 'M-R6', explain: 'Rounded the rounded number again.' } : null,
            differs(wrongPlace) ? { value: wrongPlace.map(f).join('; '), misconception: 'M-R5', explain: 'Rounded to the wrong place.' } : null,
            differs(alwaysDown) ? { value: alwaysDown.map(f).join('; '), misconception: 'M-R1', explain: 'Always rounded down.' } : null,
            // every number here rounds down: the other end of the line is rounding UP each time
            !differs(alwaysDown) ? { value: cells.map(([r, c]) => Math.ceil(rows[r] / places[c]) * places[c]).map(f).join('; '), misconception: 'M-R1', explain: 'Always rounded up.' } : null,
        ]);
    },
});

/* =============================================================================== estimation */

const EST_CLOSEST = {
    iCan: 'I Can choose the closest estimate',
    instructionKey: 'estimate-closest',
    steps: ['Round each number first.', 'Work out the rounded problem.', 'Circle the estimate that matches.'],
    say: 'It is closest to __.',
    sayValues: (q) => [q.ans],
};
const EST_REASONABLE = {
    iCan: 'I Can check if an answer is reasonable',
    instructionKey: 'estimate-reasonable',
    steps: ['Round each number and estimate.', 'Is the answer close to the estimate?', 'Check Reasonable or Not reasonable.'],
    say: 'My estimate is __, so the answer is __.',
    sayValues: (q) => { const p = pvOf(q); return p.est !== undefined ? [p.est, String(q.ans).toLowerCase()] : null; },
};

function estimateSteps(q) {
    const p = pvOf(q);
    if (p.est === undefined) return [];
    const [ra, rb] = arr(p.rounded).map(Number);
    if (p.task === 'closest') return [step(`Round: ${f(p.a)} is about ${f(ra)}, ${f(p.b)} is about ${f(rb)}.`), step(`${f(ra)} ${p.op} ${f(rb)} = ${f(p.est)}.`),
        step(`Circle ${f(p.est)}.`, [{ slot: 'answer', value: f(p.est) }])];
    if (p.task === 'reasonable') return [step(`Round: ${f(ra)} ${p.op} ${f(rb)} = ${f(p.est)}.`), step(`The answer shown is ${f(p.shown)}.`),
        step(`${f(p.shown)} is ${p.reasonable ? '' : 'not '}close to ${f(p.est)}.`), step(`Check ${String(q.ans)}.`, [{ slot: 'answer', value: String(q.ans) }])];
    const rewrite = q.answerType === 'inline-blanks';
    return [step(`${f(p.a)} is about ${f(ra)}.`, rewrite ? [{ slot: 'b0', value: f(ra) }] : []),
        step(p.op === '÷' ? `${f(ra)} is a number ${f(p.b)} goes into. Keep ${f(p.b)}.` : p.op === '×' ? `Keep ${f(p.b)}: it is one digit.` : `${f(p.b)} is about ${f(rb)}.`,
            rewrite ? [{ slot: 'b1', value: f(rb) }] : []),
        step(`${f(ra)} ${p.op} ${f(rb)} = ${f(p.est)}.`),
        step(`Write ${f(p.est)}.`, [{ slot: rewrite ? 'b2' : 'answer', value: f(p.est) }])];
}

function estimateWrong(q) {
    const p = pvOf(q);
    if (p.est === undefined) return null;
    if (p.task === 'reasonable') return choose(q, [{ value: q.ans === 'Reasonable' ? 'Not reasonable' : 'Reasonable', misconception: 'M-G1', explain: 'Did not estimate before judging.' }]);
    const [ra, rb] = arr(p.rounded).map(Number);
    const P = p.place;
    const exact = p.op === '+' ? p.a + p.b : p.op === '−' ? p.a - p.b : p.op === '×' ? p.a * p.b : p.a / p.b;
    const calc = (x, y) => (p.op === '+' ? x + y : p.op === '−' ? x - y : p.op === '÷' ? x / y : x * y);
    const c = [];
    if (p.op === '÷') {
        c.push({ value: p.est * 10, misconception: 'M-G4', explain: 'Wrote an extra zero.' });
        if (p.est >= 20) c.push({ value: p.est / 10, misconception: 'M-G4', explain: 'Dropped a zero.' });
        // Only when that quotient is clearly off: 37 ÷ 6 ≈ 7 is defensible (42 ÷ 6), so it is not
        // a mistake to find (critic round 3).
        if (Math.abs((p.est + P) * p.b - p.a) > p.b) c.push({ value: p.est + P, misconception: 'M-G1', explain: 'Rounded the dividend to the wrong compatible number.' });
    } else {
        // `ab`: the two numbers the pupil wrote in the rounded-problem boxes, so the shown work of
        // an inline item is the work THAT error produces (critic round 3: "80 + 80 = 170" named
        // "rounded one number the wrong way" with both numbers rounded right).
        const rOfExact = roundTo(exact, p.op === '×' ? P * 10 : P);
        c.push({ value: rOfExact, ab: [ra, rb], misconception: 'M-G1', explain: 'Worked out the exact answer, then rounded it.' });
        c.push({ value: calc(ra, p.b), ab: [ra, p.b], misconception: 'M-G2', explain: 'Rounded only one number.' });
        if (p.op === '−') c.push({ value: rb - ra, ab: [rb, ra], misconception: 'M-G3', explain: 'Took the bigger number from the smaller.' });
        if (p.op === '×') c.push({ value: p.est / 10, ab: [ra, rb], misconception: 'M-G4', explain: 'Dropped a zero from the product.' });
        const other = ra > p.a ? ra - P : ra + P;
        if (other > 0) c.push({ value: calc(other, rb), ab: [other, rb], misconception: 'M-R1', explain: 'Rounded one number the wrong way.' });
    }
    const asText = typeof q.ans === 'string';
    const inline = q.answerType === 'inline-blanks';
    return choose(q, c.filter((w) => Number.isInteger(w.value) && w.value >= 0)
        // an exact-then-rounded answer next to the rounded numbers would contradict itself
        .filter((w) => !inline || !w.ab || w.misconception !== 'M-G1' || calc(w.ab[0], w.ab[1]) === w.value)
        .map(({ ab, ...w }) => ({
            ...w, value: asText ? f(w.value) : w.value,
            slots: inline ? { b0: f((ab || [ra])[0]), b1: f((ab || [ra, rb])[1]), b2: f(w.value) } : undefined,
            slot: inline ? 'b2' : 'answer',
        })));
}

const EST = [
    ['estimate_sum', 'I Can estimate a sum by rounding'],
    ['estimate_diff', 'I Can estimate a difference by rounding'],
    ['estimate_sums_diffs', 'I Can estimate sums and differences'],
    ['estimate_products', 'I Can estimate a product by rounding'],
    ['estimate_quotient', 'I Can estimate a quotient'],
];
for (const [id, iCan] of EST) {
    const main = {
        iCan,
        // The place is printed (§12, owner Q10): the key is definite only when it is.
        // Each instruction says what the key does (round-3): the product rounds only the bigger
        // number, the quotient changes the dividend to a compatible number (it does not round).
        instructionKey: id === 'estimate_quotient' ? 'estimate-compatible' : id === 'estimate_products' ? 'estimate-product' : 'estimate-place',
        ...(id === 'estimate_quotient' ? {} : { instructionVars: (q) => ({ place: f(pvOf(q).place || 10) }) }),
        steps: id === 'estimate_quotient'
            ? ['Find a number near the first number that the divisor goes into.', 'Write the easy numbers in the boxes.', 'Divide the easy numbers. Write the estimate.']
            : id === 'estimate_products'
                ? ['Round the bigger number to the place shown.', 'Keep the one-digit number. Write both in the boxes.', 'Multiply the easy numbers. Write the estimate.']
                : ['Round each number to the place shown.', 'Write the rounded numbers in the boxes.', 'Work out the rounded problem.'],
        say: 'About __ is about __.',
        sayValues: (q) => { const p = pvOf(q); const r = arr(p.rounded).map(Number); return p.est !== undefined ? [`${f(r[0])} ${{ '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divided by' }[p.op]} ${f(r[1])}`, f(p.est)] : null; },
    };
    registerSkill(`number_sense:${id}`, {
        strings: stringsBy((q) => (pvOf(q).task === 'closest' ? EST_CLOSEST : pvOf(q).task === 'reasonable' ? EST_REASONABLE : null), main),
        misconceptions: ['M-G1', 'M-G2', 'M-G3', 'M-G4', 'M-R1'],
        workedSteps: estimateSteps,
        wrongAnswer: estimateWrong,
    });
}

/** The ids this file registers (the P9 family's providers). */
export const PV_PROVIDER_IDS = Object.freeze([
    'placevalue:identify', 'placevalue:value', 'placevalue:expand', 'placevalue:combine', 'placevalue:unit_form',
    'placevalue:more_less_10', 'placevalue:more_less_100', 'placevalue:place_value_disks', 'placevalue:pv_disks_build',
    'placevalue:pv_digit_drag', 'placevalue:place_value_10x', 'placevalue:number_word_names', 'placevalue:compare',
    'placevalue:order_least_to_greatest', 'placevalue:order_greatest_to_least',
    'number_sense:rounding_visual', 'number_sense:between_tens', 'number_sense:place_on_number_line', 'number_sense:rounding_table',
    ...['nearest_10', 'nearest_100', 'nearest_1000', 'nearest_10000', 'nearest_100000', 'nearest_million'].map((s) => `number_sense:${s}`),
    ...SORTS.map(([s]) => `number_sense:${s}`),
    ...Object.keys(RNL_SIZE).map((s) => `number_sense:${s}`),
    ...EST.map(([s]) => `number_sense:${s}`),
    // build lane placevalue
    'number_sense:number_line_scales',
]);
