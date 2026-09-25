// js/modules/sheet/providers/k2.js
// Skill providers for Counting & Cardinality (counting, comparing, composing):
//   count_objects, number_seq_fill, compare_groups, number_bonds, base10_build (+ _hundreds),
//   hundreds_chart_fill, ten_frame_build (+ _teen).
//
// These are the youngest pupils. Every step is one action they can do with a finger or a
// pencil. "Touch each one. Count." belongs to count_objects ONLY: the re-grade of 2026-09-25
// found it on number sequences, which count ON by a step and touch nothing.

import { registerSkill } from '../contract.js';
import { num, arr, obj, countList, digitsOf, chooseWrong, strings, step, clampSteps } from './util.js';

/* ========================================================================= count_objects */

registerSkill('counting:count_objects', {
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['steps']),
    strings: strings({
        iCan: 'I Can count objects to 20',
        instructionKey: 'count-write',
        steps: ['Touch each one.', 'Say one number for each one you touch.', 'The last number you say is how many.', 'Write the number.'],
        say: 'I count __.',
    }),
    misconceptions: ['counted-twice', 'skipped-one', 'reversed-teen'],
    workedSteps: (q) => {
        const n = num(q.ans);
        if (!Number.isFinite(n)) return [];
        const thing = (/How many (\w+)/i.exec(String(q.text || '')) || [])[1] || 'objects';
        return [
            step(`Touch each one of the ${thing}.`),
            step(`Count: ${countList(1, n, 1, 10)}.`),
            step(`The last number is ${n}.`),
            step(`Write ${n}.`, [{ slot: 'answer', value: String(n) }]),
        ];
    },
    wrongAnswer: (q) => {
        const n = num(q.ans);
        if (!Number.isFinite(n)) return null;
        const c = [];
        if (n >= 13 && n <= 19) c.push({ value: num(String(n).split('').reverse().join('')), misconception: 'reversed-teen', explain: `Wrote the digits of ${n} the wrong way round.` });
        c.push({ value: n + 1, misconception: 'counted-twice', explain: 'Touched one object two times.' });
        c.push({ value: n - 1, misconception: 'skipped-one', explain: 'Missed one object.' });
        return chooseWrong(q, c);
    },
});

/* ======================================================================= number_seq_fill */

function sequence(q) {
    const g = obj(q.gridFill);
    if (!g || !Array.isArray(g.cells)) return null;
    const cells = g.cells.slice().sort((x, y) => (x.row - y.row) || (x.col - y.col)).map((c) => ({ value: num(c.value), blank: !!c.blank }));
    const m = /Count (?:by|back by) (\d+)/i.exec(String(q.text || ''));
    let by = m ? num(m[1]) : NaN;
    if (!Number.isFinite(by) && cells.length > 1) by = Math.abs(cells[1].value - cells[0].value);
    const dir = cells.length > 1 && cells[1].value < cells[0].value ? -1 : 1;
    const blanks = cells.map((c, i) => (c.blank ? i : -1)).filter((i) => i >= 0);
    return { cells, by, dir, blanks };
}

registerSkill('counting:number_seq_fill', {
    strings: strings({
        iCan: 'I Can count by a number to fill in missing numbers',
        instructionKey: 'skip-count',
        instructionVars: (q) => { const s = sequence(q); return { n: s ? s.by : '' }; },
        steps: [
            'Read two numbers that are next to each other.',
            'Find the jump from one to the next.',
            'Add the same jump to find each missing number.',
            'Check: every jump is the same.',
        ],
        say: 'I count by __.',
        sayValues: (q) => { const s = sequence(q); return s ? [s.by] : null; },
    }),
    misconceptions: ['counted-by-one', 'wrong-jump', 'copied-neighbour'],
    workedSteps: (q) => {
        const s = sequence(q);
        if (!s || !s.blanks.length) return [];
        const sign = s.dir > 0 ? '+' : '−';
        const out = [step(`The numbers go ${s.dir > 0 ? 'up' : 'down'} by ${s.by} each time.`)];
        s.blanks.slice(0, 3).forEach((i, k) => {
            const prev = i > 0 ? s.cells[i - 1].value : s.cells[i].value - s.dir * s.by;
            out.push(step(`${prev} ${sign} ${s.by} = ${s.cells[i].value}.`, [{ slot: `blank${k}`, value: String(s.cells[i].value) }]));
        });
        out.push(step(`Check: every jump is ${s.by}. Write the numbers.`,
            s.blanks.map((i, k) => ({ slot: `blank${k}`, value: String(s.cells[i].value) }))));
        return clampSteps(out);
    },
    wrongAnswer: (q) => {
        const s = sequence(q);
        if (!s || !s.blanks.length) return null;
        const answers = s.blanks.map((i) => s.cells[i].value);
        // The first blank that has a number BEFORE it: the pupil counts on from that number.
        let k = s.blanks.findIndex((i) => i > 0);
        const fromNext = k < 0;
        if (fromNext) k = 0;
        const i0 = s.blanks[k];
        const shape = (v) => (Array.isArray(q.ans) ? v : (typeof q.ans === 'string' && q.ans.trim().startsWith('[') ? JSON.stringify(v) : v.join(', ')));
        const slot = `blank${k}`;
        const c = [];
        if (fromNext) {
            // Only the first box is empty: the pupil counts BACK from the number after it.
            const next = s.cells[1] ? s.cells[1].value : answers[0] + s.dir * s.by;
            if (s.by !== 1) {
                const v = answers.slice(); v[k] = next - s.dir;
                c.push({ value: shape(v), misconception: 'counted-by-one', slot, slots: { [slot]: String(v[k]) }, explain: `Counted back by 1, not by ${s.by}.` });
            }
            const v2 = answers.slice(); v2[k] = next;
            c.push({ value: shape(v2), misconception: 'copied-neighbour', slot, slots: { [slot]: String(v2[k]) }, explain: 'Copied the number next to the box.' });
        } else {
            const prev = s.cells[i0 - 1].value;
            if (s.by !== 1) {
                const v = answers.slice(); v[k] = prev + s.dir;
                c.push({ value: shape(v), misconception: 'counted-by-one', slot, slots: { [slot]: String(v[k]) }, explain: `Counted on by 1, not by ${s.by}.` });
            }
            const jump = s.by === 10 ? 1 : 10;
            const v2 = answers.slice(); v2[k] = prev + s.dir * jump;
            c.push({ value: shape(v2), misconception: 'wrong-jump', slot, slots: { [slot]: String(v2[k]) }, explain: `Jumped by ${jump}, not ${s.by}.` });
        }
        return chooseWrong(q, c);
    },
});

/* ======================================================================== compare_groups */

const OTHER = { a: 'B', b: 'A' };

registerSkill('comparing:compare_groups', {
    strings: strings({
        iCan: 'I Can compare two groups: more, fewer or the same',
        instructionKey: 'check-groups',
        steps: [
            'Draw a line from each one in A to one in B.',
            'Look for the ones with no partner.',
            'No one left over? The groups are the same.',
            'Check the box that matches.',
        ],
        say: 'Group __ has more. Group __ has fewer.',
        sayValues: (q) => {
            const ans = String(q.ans || '').trim();
            if (/^same$/i.test(ans)) return 'The groups are the same.';
            if (/^not the same$/i.test(ans)) return 'The groups are not the same.';
            const w = ans.toUpperCase().replace(/^GROUP\s*/, '');
            const o = OTHER[w.toLowerCase()];
            if (!o) return null;
            return /fewer/i.test(String(q._variant || q.text)) ? [o, w] : [w, o];
        },
    }),
    misconceptions: ['more-fewer-swapped', 'judged-by-size'],
    workedSteps: (q) => {
        const v = String(q._variant || (/fewer/i.test(q.text) ? 'fewer' : /more/i.test(q.text) ? 'more' : 'same'));
        const ans = String(q.ans || '');
        if (v === 'same') {
            const same = /^same$/i.test(ans.trim());
            return [
                step('Draw a line from each one in A to one in B.'),
                step(same ? 'Every one has a partner.' : 'Some are left with no partner.'),
                step(`Check ${same ? 'Same' : 'Not the same'}.`, [{ slot: 'choice', value: same ? 'Same' : 'Not the same' }]),
            ];
        }
        const winner = ans.toUpperCase().replace(/^GROUP\s*/, '');
        const loser = OTHER[winner.toLowerCase()] || '';
        return [
            step('Draw a line from each one in A to one in B.'),
            step(v === 'more' ? `Group ${winner} has some left over.` : `Group ${loser} has some left over.`),
            step(v === 'more' ? `Group ${winner} has more.` : `Group ${winner} has fewer.`),
            step(`Check Group ${winner}.`, [{ slot: 'choice', value: `Group ${winner}` }]),
        ];
    },
    wrongAnswer: (q) => {
        const ans = String(q.ans || '').trim();
        const v = String(q._variant || '');
        if (/^(not the same|same)$/i.test(ans)) {
            const flip = /^same$/i.test(ans) ? 'not the same' : 'same';
            return chooseWrong(q, [{ value: flip, misconception: 'judged-by-size', slot: 'choice', explain: 'Judged by how much space the groups take, not by matching.' }]);
        }
        const letter = ans.toUpperCase().replace(/^GROUP\s*/, '');
        const other = OTHER[letter.toLowerCase()];
        if (!other) return null;
        const value = /group/i.test(ans) ? `Group ${other}` : other;
        return chooseWrong(q, [{ value, misconception: 'more-fewer-swapped', slot: 'choice',
            explain: v === 'fewer' ? 'Chose the group with more, not fewer.' : 'Chose the group with fewer, not more.' }]);
    },
});

/* =========================================================================== number_bonds */

function bond(q) {
    const t = String(q.text || '').replace(/\s+/g, '');
    let m = /^(\d+)\+(\d+)=\?$/.exec(t);
    if (m) return { p1: num(m[1]), p2: num(m[2]), whole: num(m[1]) + num(m[2]), missing: 'whole' };
    m = /^\?\+(\d+)=(\d+)$/.exec(t);
    if (m) return { p1: num(m[2]) - num(m[1]), p2: num(m[1]), whole: num(m[2]), missing: 'part' };
    m = /^(\d+)\+\?=(\d+)$/.exec(t);
    if (m) return { p1: num(m[1]), p2: num(m[2]) - num(m[1]), whole: num(m[2]), missing: 'part' };
    return null;
}

registerSkill('composing:number_bonds', {
    strings: strings({
        iCan: 'I Can find the missing part or whole of a number bond',
        instructionKey: 'missing',
        steps: [
            'Look: is the whole or a part missing?',
            'Whole missing: put the two parts together.',
            'Part missing: take the part you know from the whole.',
            'Write the missing number.',
        ],
        say: '__ and __ make __.',
        sayValues: (q) => { const b = bond(q); return b ? [b.p1, b.p2, b.whole] : null; },
    }),
    misconceptions: ['added-for-part', 'subtracted-for-whole', 'wrote-whole', 'counted-start'],
    workedSteps: (q) => {
        const b = bond(q);
        if (!b) return [];
        if (b.missing === 'whole') {
            return [
                step(`The parts are ${b.p1} and ${b.p2}. The whole is missing.`),
                step(`Put them together: ${b.p1} + ${b.p2} = ${b.whole}.`),
                step(`Write ${b.whole} in the whole.`, [{ slot: 'answer', value: String(b.whole) }]),
            ];
        }
        const known = /^\?/.test(String(q.text).trim()) ? b.p2 : b.p1;
        const miss = b.whole - known;
        return [
            step(`The whole is ${b.whole}. One part is ${known}.`),
            step(`Take ${known} from ${b.whole}: ${b.whole} − ${known} = ${miss}.`),
            step(`Check: ${known} and ${miss} make ${b.whole}.`),
            step(`Write ${miss} in the part.`, [{ slot: 'answer', value: String(miss) }]),
        ];
    },
    wrongAnswer: (q) => {
        const b = bond(q);
        if (!b) return null;
        if (b.missing === 'whole') {
            return chooseWrong(q, [
                { value: Math.abs(b.p1 - b.p2), misconception: 'subtracted-for-whole', explain: 'Took one part from the other instead of putting them together.' },
                { value: b.whole - 1, misconception: 'counted-start', explain: 'Counted on one too few.' },
            ]);
        }
        const known = /^\?/.test(String(q.text).trim()) ? b.p2 : b.p1;
        return chooseWrong(q, [
            { value: b.whole + known, misconception: 'added-for-part', explain: 'Added the part to the whole instead of taking it away.' },
            { value: b.whole, misconception: 'wrote-whole', explain: 'Copied the whole into the part.' },
        ]);
    },
});

/* =========================================================================== base-10 build */

const PLACE_NAMES = { 100: 'hundreds', 10: 'tens', 1: 'ones' };
const PLACE_ONE = { 100: 'hundred', 10: 'ten', 1: 'one' };
const placeCount = (n, p) => `${n} ${n === 1 ? PLACE_ONE[p] : PLACE_NAMES[p]}`;

function blocks(q) {
    const n = num(q.target !== undefined ? q.target : q.ans);
    if (!Number.isFinite(n)) return null;
    let places = arr(q.places).map(num).filter((p) => PLACE_NAMES[p]);
    if (!places.length) places = n >= 100 ? [100, 10, 1] : [10, 1];
    const d = digitsOf(n);
    const count = {};
    for (const p of places) count[p] = p === places[0] ? Math.floor(n / p) : (d[Math.log10(p)] || 0);
    return { n, places, count };
}

function blockSteps(q) {
    const B = blocks(q);
    if (!B) return [];
    const out = [];
    for (const p of B.places) {
        const c = B.count[p];
        out.push(step(`Draw ${placeCount(c, p)}.`, [{ slot: PLACE_NAMES[p], value: String(c) }]));
    }
    const parts = B.places.map((p) => B.count[p] * p).filter(Boolean);
    const check = parts.length > 1 ? `${parts.join(' + ')} = ${B.n}` : String(B.n);
    out.push(step(`Count to check: ${check}.`, [{ slot: 'answer', value: String(B.n) }]));
    if (out.length < 3) out.unshift(step(`Read the number: ${B.n}.`));
    return out;
}

function blockWrong(q) {
    const B = blocks(q);
    if (!B) return null;
    const value = (cnt) => B.places.reduce((s, p) => s + (cnt[p] || 0) * p, 0);
    const slotsOf = (cnt) => Object.fromEntries(B.places.map((p) => [PLACE_NAMES[p], String(cnt[p] || 0)]));
    const c = [];
    const t = B.count[10] || 0;
    const o = B.count[1] || 0;
    if (t !== o) {
        const cnt = Object.assign({}, B.count, { 10: o, 1: t });
        c.push({ value: value(cnt), misconception: 'swapped-tens-ones', slot: 'tens', slots: slotsOf(cnt),
            explain: `Drew ${o} tens and ${t} ones: the digits swapped places.` });
    }
    if (B.places.includes(100) && (B.count[100] || 0) !== t) {
        const cnt = Object.assign({}, B.count, { 100: t, 10: B.count[100] });
        c.push({ value: value(cnt), misconception: 'swapped-hundreds-tens', slot: 'hundreds', slots: slotsOf(cnt),
            explain: 'Swapped the hundreds and the tens.' });
    }
    if (o > 0) {
        const cnt = Object.assign({}, B.count, { 1: 0 });
        c.push({ value: value(cnt), misconception: 'left-out-ones', slot: 'ones', slots: slotsOf(cnt), explain: 'Drew the tens but not the ones.' });
    }
    // Critic round 2: "tens drawn as ones" (57 as 12) cannot be SHOWN - the model of a value is
    // drawn canonically, so it printed as "1 ten 2 ones", which no pupil draws for 57. Only errors
    // whose drawing is the pupil's are offered: the swapped digits and the missing ones.
    return chooseWrong(q, c);
}

registerSkill('composing:base10_build', {
    strings: strings({
        iCan: 'I Can show a number with tens and ones',
        instructionKey: 'draw-blocks',
        steps: ['Read the tens digit. Draw that many tens.', 'Read the ones digit. Draw that many ones.', 'Count to check: tens first, then ones.'],
        say: '__ tens and __ ones is __.',
        sayValues: (q) => { const B = blocks(q); return B ? [B.count[10] || 0, B.count[1] || 0, B.n] : null; },
    }),
    misconceptions: ['swapped-tens-ones', 'left-out-ones'],
    workedSteps: blockSteps,
    wrongAnswer: blockWrong,
});

registerSkill('composing:base10_build_hundreds', {
    strings: strings({
        iCan: 'I Can show a number with hundreds, tens and ones',
        instructionKey: 'draw-blocks-100',
        steps: [
            'Read the hundreds digit. Draw that many hundreds.',
            'Read the tens digit. Draw that many tens.',
            'Read the ones digit. Draw that many ones.',
            'Count to check: hundreds, then tens, then ones.',
        ],
        say: '__ hundreds, __ tens and __ ones is __.',
        sayValues: (q) => { const B = blocks(q); return B ? [B.count[100] || 0, B.count[10] || 0, B.count[1] || 0, B.n] : null; },
    }),
    misconceptions: ['swapped-tens-ones', 'swapped-hundreds-tens', 'left-out-ones'],
    workedSteps: blockSteps,
    wrongAnswer: blockWrong,
});

/* ================================================== hundreds_chart_fill, number_chart_fill */

/**
 * The worked steps of a chart window, reading only the numbers the WINDOW prints (2026-09-25:
 * a window of one row, the chart to 10, has no number above or below; a steps line naming one
 * pointed the pupil at a number that is not on the page). `t` is the first gap.
 */
function chartSteps(q) {
    const t = num(Array.isArray(q.keyParts) && q.keyParts.length ? q.keyParts[0] : q.ans);
    if (!Number.isFinite(t)) return [];
    const win = obj(q.chartWindow);
    const gaps = new Set((Array.isArray(q.keyParts) ? q.keyParts : [q.ans]).map(num));
    const shows = (n) => {
        if (gaps.has(n) || n < 1) return false;
        if (!win || !Array.isArray(win.rows) || !Array.isArray(win.cols)) return true;
        return win.rows.includes(Math.floor((n - 1) / 10)) && win.cols.includes((n - 1) % 10);
    };
    const out = [];
    if ((t - 1) % 10 !== 0 && shows(t - 1)) out.push(step(`The number before is ${t - 1}. One more is ${t}.`));
    if (shows(t - 10)) out.push(step(`The number above is ${t - 10}. Ten more is ${t}.`));
    if (out.length < 2 && shows(t + 10)) out.push(step(`The number below is ${t + 10}. Ten less is ${t}.`));
    if (out.length < 2 && t % 10 !== 0 && shows(t + 1)) out.push(step(`The number after is ${t + 1}. One less is ${t}.`));
    out.push(step(`Write ${t}.`, [{ slot: 'answer', value: String(t) }]));
    return out;
}

registerSkill('composing:hundreds_chart_fill', {
    strings: strings({
        iCan: 'I Can find missing numbers on a hundreds chart',
        // A window has one to three empty cells (payload `blanks`), so the page asks for numbers.
        instructionKey: 'missing-many',
        steps: [
            'Look left: the number before. Add 1.',
            'Look up: the number above. Add 10.',
            'Both ways give the same number. Write it.',
        ],
        say: 'The missing number is __.',
    }),
    misconceptions: ['wrong-row', 'reversed-digits', 'one-less'],
    workedSteps: chartSteps,
    wrongAnswer: (q) => {
        const t = num(q.ans);
        if (!Number.isFinite(t)) return null;
        const c = [{ value: t <= 90 ? t + 10 : t - 10, misconception: 'wrong-row', explain: 'Read the number from the wrong row.' }];
        const rev = num(String(t).split('').reverse().join(''));
        if (t >= 10 && t < 100 && t % 10 && rev !== t) c.push({ value: rev, misconception: 'reversed-digits', explain: `Wrote the digits of ${t} the wrong way round.` });
        c.push({ value: t - 1, misconception: 'one-less', explain: 'Wrote the number before, not the missing number.' });
        return chooseWrong(q, c);
    },
});

// The same window cut from the chart of the hundreds and the thousands (owner, 2026-09-25).
// Its real errors: the number from the wrong row (ten off), the number before, and a place-value
// slip in a number with a zero inside it (1,005 written 105: the zero dropped).
registerSkill('composing:number_chart_fill', {
    strings: strings({
        iCan: 'I Can find missing numbers on a number chart',
        instructionKey: 'missing-many',
        steps: [
            'Look left: the number before. Add 1.',
            'Look up: the number above. Add 10.',
            'Both ways give the same number. Write it.',
        ],
        say: 'The missing number is __.',
    }),
    misconceptions: ['wrong-row', 'dropped-zero', 'one-less'],
    workedSteps: chartSteps,
    wrongAnswer: (q) => {
        const t = num(q.ans);
        if (!Number.isFinite(t)) return null;
        const c = [{ value: t + 10, misconception: 'wrong-row', explain: 'Read the number from the wrong row.' }];
        const s = String(t);
        if (/\d0\d/.test(s)) c.push({ value: num(s.replace(/0(?=\d)/, '')), misconception: 'dropped-zero', explain: `Left out the zero in ${t}.` });
        c.push({ value: t - 1, misconception: 'one-less', explain: 'Wrote the number before, not the missing number.' });
        return chooseWrong(q, c);
    },
});

/* ============================ add_5_pictures, tens_foundation_visual, classify_count, teen_compose */
// O6 AP1 round 2 (2026-09-25): these four moved from gen-counting.js HTML to the kit's `counters`
// cell (kinds join / tens / sort / teen), so they carry real providers: their own "I Can", a
// library instruction, steps a K pupil can follow, and the two real errors of each.

/** The payload of a kit `counters` item, when it is of `kind`. */
const counterPay = (q, kind) => {
    const c = obj(q && q.cell);
    const p = c && c.template === 'counters' ? obj(c.payload) : null;
    return p && p.kind === kind ? p : null;
};
const NOUN = { circle: 'circles', square: 'squares', triangle: 'triangles', star: 'stars', diamond: 'diamonds',
    ball: 'balls', apple: 'apples', fish: 'fish', flower: 'flowers' };

registerSkill('addition:add_5_pictures', {
    strings: strings({
        iCan: 'I Can add within 5 with pictures',
        instructionKey: 'count-all',
        steps: [
            'Count the first group.',
            'Keep counting into the second group.',
            'The last number you say is how many in all.',
            'Write it in the box.',
        ],
        say: '__ and __ make __.',
        sayValues: (q) => { const p = counterPay(q, 'join'); return p ? [p.n, p.m, p.n + p.m] : null; },
    }),
    misconceptions: ['counted-one-group', 'counted-twice'],
    workedSteps: (q) => {
        const p = counterPay(q, 'join');
        if (!p) return [];
        const t = p.n + p.m;
        return [
            step(`Count the first group: ${countList(1, p.n)}.`),
            step(`Keep counting: ${countList(p.n + 1, t)}.`),
            step(`${p.n} and ${p.m} make ${t}. Write ${t}.`, [{ slot: 'answer', value: String(t) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = counterPay(q, 'join');
        if (!p) return null;
        return chooseWrong(q, [
            { value: Math.max(p.n, p.m), misconception: 'counted-one-group', explain: 'Counted only one group.' },
            { value: p.n + p.m + 1, misconception: 'counted-twice', explain: 'Counted one picture two times.' },
        ]);
    },
});

registerSkill('composing:tens_foundation_visual', {
    strings: strings({
        iCan: 'I Can count tens',
        instructionKey: 'count-tens',
        steps: [
            'Read the rule: one rod is one ten.',
            'Touch each rod. Say one ten for each.',
            'Write how many tens.',
        ],
        say: 'There are __ tens.',
        sayValues: (q) => { const p = counterPay(q, 'tens'); return p ? [p.n] : null; },
    }),
    misconceptions: ['wrote-the-value', 'counted-twice'],
    workedSteps: (q) => {
        const p = counterPay(q, 'tens');
        if (!p) return [];
        const thing = p.objects === 'frame' ? 'full frame' : 'rod';
        return [
            step(`One ${thing} is one ten.`),
            step(`Count the ${thing}s: ${countList(1, p.n)}.`),
            step(`${p.n} ten${p.n === 1 ? '' : 's'}. Write ${p.n}.`, [{ slot: 'answer', value: String(p.n) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = counterPay(q, 'tens');
        if (!p) return null;
        return chooseWrong(q, [
            { value: p.n * 10, misconception: 'wrote-the-value', explain: `Wrote the value, ${p.n * 10}, not how many tens.` },
            { value: p.n + 1, misconception: 'counted-twice', explain: 'Counted one ten two times.' },
        ]);
    },
});

registerSkill('comparing:classify_count', {
    strings: strings({
        iCan: 'I Can sort and count one kind',
        instructionKey: 'count-kind',
        steps: [
            'Look at the box: it shows the kind to count.',
            'Touch only that kind. Say one number for each.',
            'Write how many.',
        ],
        say: 'There are __ __.',
        sayValues: (q) => { const p = counterPay(q, 'sort'); return p ? [p.ans, NOUN[p.asked] || 'of them'] : null; },
    }),
    misconceptions: ['counted-every-object', 'counted-other-kind'],
    workedSteps: (q) => {
        const p = counterPay(q, 'sort');
        if (!p) return [];
        const noun = NOUN[p.asked] || 'objects';
        return [
            step(`The box shows ${noun}.`),
            step(`Touch only the ${noun}: ${countList(1, p.ans)}.`),
            step(`Write ${p.ans}.`, [{ slot: 'answer', value: String(p.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = counterPay(q, 'sort');
        if (!p) return null;
        const bag = arr(p.bag) || [];
        const other = bag.filter((s) => s !== p.asked);
        const kinds = [...new Set(other)];
        const c = [{ value: bag.length, misconception: 'counted-every-object', explain: 'Counted every object, not only one kind.' }];
        if (kinds.length) c.push({ value: other.filter((s) => s === kinds[0]).length, misconception: 'counted-other-kind', explain: 'Counted a different kind.' });
        return chooseWrong(q, c);
    },
});

registerSkill('composing:teen_compose', {
    strings: strings({
        iCan: 'I Can make teen numbers: 10 and some ones',
        instructionKey: 'missing',
        steps: [
            'The full ten frame is 10.',
            'Count the ones outside the frame.',
            '10 and the ones make the teen number.',
            'Write the missing number.',
        ],
        say: '10 and __ make __.',
        sayValues: (q) => { const p = counterPay(q, 'teen'); return p ? [p.ones, 10 + p.ones] : null; },
    }),
    misconceptions: ['wrote-ones-for-teen', 'wrote-teen-for-ones'],
    workedSteps: (q) => {
        const p = counterPay(q, 'teen');
        if (!p) return [];
        const ten = p.objects === 'blocks' ? 'The rod is 10.' : 'The full frame is 10.';
        return [
            step(ten),
            step(`Count the ones: ${countList(1, p.ones)}.`),
            step(`10 and ${p.ones} make ${10 + p.ones}.`),
            step(`Write ${p.ans}.`, [{ slot: 'answer', value: String(p.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = counterPay(q, 'teen');
        if (!p) return null;
        return chooseWrong(q, p.askTotal
            ? [{ value: p.ones, misconception: 'wrote-ones-for-teen', explain: 'Wrote only the ones, not 10 and the ones.' },
                { value: 10 + p.ones + 1, misconception: 'wrote-teen-for-ones', explain: 'Counted one more than there are.' }]
            : [{ value: 10 + p.ones, misconception: 'wrote-teen-for-ones', explain: 'Wrote the whole teen number, not the ones.' },
                { value: p.ones + 1, misconception: 'wrote-ones-for-teen', explain: 'Counted one loose counter two times.' }]);
    },
});

/* ======================================================================== ten frames */

function frameSteps(q) {
    const n = num(q.target !== undefined ? q.target : q.ans);
    if (!Number.isFinite(n)) return [];
    const mark = [{ slot: 'counters', value: String(n) }];
    if (n > 10) {
        return [
            step('Fill the first ten frame: 10 counters.'),
            step(`Draw ${n - 10} more in the second frame, top row first.`),
            step(`Count: 10 and ${n - 10} make ${n}.`, mark),
        ];
    }
    if (n > 5) {
        return [
            step('Draw 5 counters in the top row.'),
            step(`Draw ${n - 5} in the bottom row, left to right.`),
            step(`Count: 5 and ${n - 5} make ${n}. Stop.`, mark),
        ];
    }
    return [
        step('Start in the top left box.'),
        step(`Draw ${n} ${n === 1 ? 'counter' : 'counters'} in the top row, left to right.`),
        step(`Count: ${countList(1, n)}. Stop at ${n}.`, mark),
    ];
}

function frameWrong(q) {
    const n = num(q.target !== undefined ? q.target : q.ans);
    if (!Number.isFinite(n)) return null;
    const max = num(q.maxDots) || (n > 10 ? 20 : 10);
    return chooseWrong(q, [
        n < max ? { value: n + 1, misconception: 'did-not-stop', slot: 'counters', explain: `Drew ${n + 1} counters: did not stop at ${n}.` } : null,
        n > 1 ? { value: n - 1, misconception: 'skipped-a-box', slot: 'counters', explain: 'Missed one box.' } : null,
        n > 5 && n <= 10 ? { value: 5, misconception: 'top-row-only', slot: 'counters', explain: 'Filled the top row only.' } : null,
    ]);
}

registerSkill('composing:ten_frame_build', {
    strings: strings({
        iCan: 'I Can show a number on a ten frame',
        instructionKey: 'draw-count',
        steps: [
            'Start in the top left box.',
            'Draw one counter in each box, left to right.',
            'Fill the top row before the bottom row.',
            'Count the counters. Stop at the number.',
        ],
        say: 'I drew __ counters.',
    }),
    misconceptions: ['did-not-stop', 'skipped-a-box', 'top-row-only'],
    workedSteps: frameSteps,
    wrongAnswer: frameWrong,
});

registerSkill('composing:ten_frame_build_teen', {
    strings: strings({
        iCan: 'I Can show a teen number on two ten frames',
        instructionKey: 'draw-count',
        steps: [
            'Fill the first ten frame: that is 10.',
            'Draw the ones in the second frame, top row first.',
            'Count: 10 and the ones. Stop at the number.',
        ],
        say: '10 and __ make __.',
        sayValues: (q) => { const n = num(q.target !== undefined ? q.target : q.ans); return Number.isFinite(n) ? [n - 10, n] : null; },
    }),
    misconceptions: ['did-not-stop', 'skipped-a-box'],
    workedSteps: frameSteps,
    wrongAnswer: frameWrong,
});
