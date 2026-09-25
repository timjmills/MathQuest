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
    if (t > 0) {
        const cnt = Object.assign({}, B.count, { 10: 0, 1: o + t });
        c.push({ value: value(cnt), misconception: 'tens-as-ones', slot: 'tens', slots: slotsOf(cnt),
            explain: `Drew ${t} ones for the tens digit.` });
    }
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
    misconceptions: ['swapped-tens-ones', 'left-out-ones', 'tens-as-ones'],
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
    misconceptions: ['swapped-tens-ones', 'swapped-hundreds-tens', 'left-out-ones', 'tens-as-ones'],
    workedSteps: blockSteps,
    wrongAnswer: blockWrong,
});

/* ===================================================================== hundreds_chart_fill */

registerSkill('composing:hundreds_chart_fill', {
    strings: strings({
        iCan: 'I Can find missing numbers on a hundreds chart',
        instructionKey: 'missing',
        steps: [
            'Look left: the number before. Add 1.',
            'Look up: the number above. Add 10.',
            'Both ways give the same number. Write it.',
        ],
        say: 'The missing number is __.',
    }),
    misconceptions: ['wrong-row', 'reversed-digits', 'one-less'],
    workedSteps: (q) => {
        const t = num(q.ans);
        if (!Number.isFinite(t)) return [];
        const out = [];
        if ((t - 1) % 10 !== 0) out.push(step(`The number before is ${t - 1}. One more is ${t}.`));
        if (t > 10) out.push(step(`The number above is ${t - 10}. Ten more is ${t}.`));
        if (out.length < 2 && t <= 90) out.push(step(`The number below is ${t + 10}. Ten less is ${t}.`));
        if (out.length < 2 && t % 10 !== 0) out.push(step(`The number after is ${t + 1}. One less is ${t}.`));
        out.push(step(`Write ${t}.`, [{ slot: 'answer', value: String(t) }]));
        return out;
    },
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
