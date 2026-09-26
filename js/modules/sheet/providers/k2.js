// js/modules/sheet/providers/k2.js
// Skill providers for Counting & Cardinality (counting, comparing, composing):
//   count_objects, number_seq_fill, compare_groups, number_bonds, base10_build (+ _hundreds),
//   hundreds_chart_fill, ten_frame_build (+ _teen).
//
// These are the youngest pupils. Every step is one action they can do with a finger or a
// pencil. "Touch each one. Count." belongs to count_objects ONLY: the re-grade of 2026-09-25
// found it on number sequences, which count ON by a step and touch nothing.

import { registerSkill } from '../contract.js';
import { SHAPES as K2_PICTURES } from '../cells/k2kit.js';
import { num, arr, obj, countList, digitsOf, chooseWrong, strings, step, clampSteps } from './util.js';


/**
 * The row-1 hint / level-2 cue of each K picture skill (contract member `hint`, critic k2-r2): a
 * patch for the item's payload that draws the skill's own fading hint, never the answer. The
 * Guided / We Do builders merge it into the cells after the worked example.
 */
const K2_HINTS = {
    'counting:count_objects': (q) => {
        const p = payloadOf(q);
        if (p.kind === 'conserve') return { marks: true };
        if ((p.kind || 'count') !== 'count' || p.objects) return null;
        if (p.layout === 'circle') return { startMark: true };
        const band = Number(p.band) || 20;
        return band > 20 ? { tenMarks: true } : { track: band };
    },
    'counting:zero_none': (q) => {
        const p = payloadOf(q);
        if (p.task === 'find') return { legend: true };
        return { track: Number(p.band) || 5 };
    },
    'counting:match_same': (q) => {
        const t = payloadOf(q).target;
        const one = t && K2_PICTURES[t.shape] ? K2_PICTURES[t.shape].one : null;
        return one ? { name: one } : null;
    },
    'counting:ordinal_numbers': () => ({ numbers: true }),
    'comparing:compare_size': () => ({ base: true }),
    'comparing:odd_one_out': (q) => { const p = payloadOf(q); return p.kind === 'pick' && p.attr ? { cue: p.attr } : null; },
    'comparing:compare_capacity': (q) => (payloadOf(q).kind === 'words' ? { icons: true } : { base: true }),
    'comparing:what_can_we_measure': (q) => {
        const p = payloadOf(q);
        if (p.caption) {
            const NOTE = { Ruler: 'A ruler: long, tall.', Scale: 'A scale: heavy.', Jug: 'A jug: how much it holds.' };
            const note = (p.words || []).map((w) => NOTE[w.label]).filter(Boolean).join(' ');
            return note ? { note } : null;
        }
        return { icons: true };
    },
    'comparing:sort_into_groups': (q) => (payloadOf(q).task === 'count' || !payloadOf(q).task ? { work: true } : null),
    'composing:bonds_in_order': (q) => (payloadOf(q).notation === 'across' ? null : { dots: true }),
    'comparing:compare_groups': () => ({ showCounts: true }),
    'composing:number_bonds': () => ({ dots: true }),
};

/* ========================================================================= count_objects */

const COUNT_WRITE = {
    iCan: 'I Can count objects to 20',
    instructionKey: 'count-write',
    steps: ['Touch each one.', 'Say one number for each one you touch.', 'The last number you say is how many.', 'Write the number.'],
    say: 'I count __.',
};
const COUNT_30 = Object.assign({}, COUNT_WRITE, { iCan: 'I Can count objects to 30' });
const COUNT_SAME = {
    iCan: 'I Can tell when two groups have the same number',
    instructionKey: 'check-same-number',
    steps: ['Count A. Touch each one.', 'Count B. Touch each one.', 'Same number? Check Same.', 'Moving them does not change how many.'],
    say: 'A has __. B has __.',
    sayValues: (q) => { const p = (q && q.cell && q.cell.payload) || {}; return Number.isFinite(p.n) && Number.isFinite(p.m) ? [p.n, p.m] : null; },
};

registerSkill('counting:count_objects', {
    hint: K2_HINTS['counting:count_objects'],
    // S2: the supports this skill can draw (touch dots, cues, panes); the Support control offers these.
    supports: Object.freeze(['steps']),
    // task 'same' (K.CC.B.4b): two groups, one moved; the instruction and steps change with it.
    strings: stringsBy((t, ref) => (t === 'same' ? COUNT_SAME
        : (Number(ref && ref.opts && ref.opts.band) > 20 || num(payloadOf(ref && ref.q).band) > 20 || num(payloadOf(ref && ref.q).n) > 20) ? COUNT_30 : null), COUNT_WRITE),
    misconceptions: ['counted-twice', 'skipped-one', 'reversed-teen', 'spread-means-more'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'conserve') {
            const n = num(p.n); const m = num(p.m);
            return [
                step(`Count A: ${countList(1, n, 1, 10)}. A has ${n}.`, [WORK('countA')]),
                step(`Count B: ${countList(1, m, 1, 10)}. B has ${m}.`, [WORK('countB')]),
                step(`${n} and ${m} are ${n === m ? '' : 'not '}the same. Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        const n = num(q.ans);
        if (!Number.isFinite(n)) return [];
        // PT-MOD-1: each step adds one mark group (k2kit `work`): the start, the count numerals, the
        // last one ringed, the number written
        if (p.layout === 'circle') {
            return [
                step('Start at the arrow at the top.', [WORK('start')]),
                step(`Count round the circle: ${countList(1, n, 1, 10)}.`, [WORK('count')]),
                step(`The last number is ${n}. That is how many.`, [WORK('last')]),
                step(`Write ${n}.`, [{ slot: 'answer', value: String(n) }]),
            ];
        }
        return [
            step(`Touch each one. Count: ${countList(1, n, 1, 10)}.`, [WORK('count')]),
            step(`The last number is ${n}. That is how many.`, [WORK('last')]),
            step(`Write ${n}.`, [{ slot: 'answer', value: String(n) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'conserve') {
            const other = (p.labels || []).find((l) => l !== q.ans);
            const spread = num(p.m) < num(p.n);
            return other ? chooseWrong(q, [{ value: other, misconception: 'spread-means-more', explain: spread ? 'B is spread out, so it looked like more.' : 'Looked at how much room they take, not how many.' }]) : null;
        }
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

/* ============================================================================== make_ten */

const MAKE_N = (n) => ({
    iCan: `I Can find how many more make ${n}`,
    instructionKey: 'how-many-more',
    instructionVars: (q) => { const p = payloadOf(q); return { n: Number.isFinite(p.target) ? p.target : n }; },
    steps: ['Count the counters.', 'Count the empty boxes.', 'The empty boxes are how many more.'],
    say: '__ and __ make __.',
    sayValues: (q) => { const p = payloadOf(q); return Number.isFinite(p.filled) ? [p.filled, p.target - p.filled, p.target] : null; },
});
const MAKE_5 = MAKE_N(5), MAKE_10 = MAKE_N(10), MAKE_20 = MAKE_N(20);

registerSkill('composing:make_ten', {
    // the title names the number the page makes ("Make" option: 5 / 10 / 20)
    strings: stringsBy((t, ref) => {
        const b = Number(ref && ref.opts && ref.opts.band) || num(payloadOf(ref && ref.q).target);
        return b === 5 ? MAKE_5 : b === 20 ? MAKE_20 : null;
    }, MAKE_10),
    misconceptions: ['wrote-the-counters', 'wrote-the-target'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        if (!Number.isFinite(p.filled)) return [];
        const more = p.target - p.filled;
        return [
            step(`There are ${p.filled} counters.`),
            step(`Count the empty boxes: ${countList(1, more, 1, 10)}.`),
            step(`${p.filled} and ${more} make ${p.target}. Write ${more}.`, [{ slot: 'answer', value: String(more) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (!Number.isFinite(p.filled)) return null;
        return chooseWrong(q, [
            { value: p.filled, misconception: 'wrote-the-counters', explain: `Wrote the counters there are (${p.filled}), not how many more.` },
            { value: p.target, misconception: 'wrote-the-target', explain: `Wrote ${p.target}, the number to make.` },
        ]);
    },
});

/* ======================================================================== count_sequence */

/** The five-box path of a count_sequence item: {values, pos, form, ans} or null. */
function pathOf(q) {
    const p = payloadOf(q);
    const values = Array.isArray(p.values) ? p.values.map(Number) : null;
    const pos = Array.isArray(p.blanks) && p.blanks.length ? Number(p.blanks[0]) : NaN;
    if (!values || values.length < 3 || !Number.isInteger(pos)) return null;
    const form = pos === values.length - 1 ? 'after' : pos === 0 ? 'before' : 'between';
    return { values, pos, form, ans: values[pos] };
}

// critic k2-r2: the skill had no provider - no Steps band, no Model, no Error analysis (H11), and a
// title built from its label ("I Can count next/before/after number").
registerSkill('counting:count_sequence', {
    strings: strings({
        iCan: 'I Can find the number before, after or between',
        instructionKey: 'missing',
        steps: ['Read the numbers in the path.', 'Count on by 1, or back by 1, to the empty box.', 'Write the number.'],
        say: 'The missing number is __.',
        sayValues: (q) => { const s = pathOf(q); return s ? [s.ans] : null; },
    }),
    misconceptions: ['counted-the-wrong-way', 'skipped-one', 'copied-neighbour'],
    workedSteps: (q) => {
        const s = pathOf(q);
        if (!s) return [];
        const shown = s.values.filter((_, i) => i !== s.pos);
        const write = step(`Write ${s.ans} in the empty box.`, [{ slot: 'b0', value: String(s.ans) }]);
        if (s.form === 'after') {
            return [step(`Read the numbers: ${shown.join(', ')}.`), step(`Count on by 1: after ${s.ans - 1} comes ${s.ans}.`), write];
        }
        if (s.form === 'before') {
            return [step(`Read the numbers: ${shown.join(', ')}.`), step(`Count back by 1: before ${s.ans + 1} comes ${s.ans}.`), write];
        }
        return [step(`Read the numbers on each side: ${s.ans - 1} and ${s.ans + 1}.`), step(`Count on by 1 from ${s.ans - 1}: ${s.ans}.`), write];
    },
    wrongAnswer: (q) => {
        const s = pathOf(q);
        if (!s) return null;
        const c = [];
        if (s.form === 'after') {
            c.push({ value: s.ans + 1, misconception: 'skipped-one', slot: 'b0', explain: `Skipped a number: after ${s.ans - 1} comes ${s.ans}, not ${s.ans + 1}.` });
            c.push({ value: s.ans - 2, misconception: 'counted-the-wrong-way', slot: 'b0', explain: `Counted back from ${s.ans - 1} instead of on.` });
        } else if (s.form === 'before') {
            c.push({ value: s.ans - 1, misconception: 'skipped-one', slot: 'b0', explain: `Skipped a number: before ${s.ans + 1} comes ${s.ans}, not ${s.ans - 1}.` });
            c.push({ value: s.ans + 2, misconception: 'counted-the-wrong-way', slot: 'b0', explain: `Counted on from ${s.ans + 1} instead of back.` });
        } else {
            c.push({ value: s.ans + 1, misconception: 'copied-neighbour', slot: 'b0', explain: `Copied the number after the box, ${s.ans + 1}.` });
            c.push({ value: s.ans - 1, misconception: 'copied-neighbour', slot: 'b0', explain: `Copied the number before the box, ${s.ans - 1}.` });
        }
        return chooseWrong(q, c);
    },
});

/* ======================================================================== compare_groups */

const OTHER = { a: 'B', b: 'A' };

registerSkill('comparing:compare_groups', {
    hint: K2_HINTS['comparing:compare_groups'],
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
                step('Draw a line from each one in A to one in B.', [WORK('match')]),
                step(same ? 'Every one has a partner.' : 'Some are left with no partner.', [WORK('left')]),
                step(`Check ${same ? 'Same' : 'Not the same'}.`, [{ slot: 'answer', value: same ? 'Same' : 'Not the same' }]),
            ];
        }
        const winner = ans.toUpperCase().replace(/^GROUP\s*/, '');
        const loser = OTHER[winner.toLowerCase()] || '';
        // PT-MOD-1 (critic k2-r2): the matching lines, then the leftovers ringed, then the group named
        return [
            step('Draw a line from each one in A to one in B.', [WORK('match')]),
            step(v === 'more' ? `Group ${winner} has some left over.` : `Group ${loser} has some left over.`, [WORK('left')]),
            step(v === 'more' ? `Group ${winner} has more.` : `Group ${winner} has fewer.`, [WORK('win')]),
            step(`Check Group ${winner}.`, [{ slot: 'answer', value: `Group ${winner}` }]),
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
    // the item's own payload first (the screen prompt now opens with a verb, critic k2-r2)
    const pl = payloadOf(q);
    if (Number.isFinite(Number(pl.whole)) && Number.isFinite(Number(pl.a)) && Number.isFinite(Number(pl.b)) && pl.unknown) {
        return { p1: num(pl.a), p2: num(pl.b), whole: num(pl.whole), missing: pl.unknown === 'whole' ? 'whole' : 'part', unknown: pl.unknown };
    }
    const t = String(q.text || '').replace(/^[^0-9?]*/, '').replace(/\s+/g, '');
    let m = /^(\d+)\+(\d+)=\?$/.exec(t);
    if (m) return { p1: num(m[1]), p2: num(m[2]), whole: num(m[1]) + num(m[2]), missing: 'whole' };
    m = /^\?\+(\d+)=(\d+)$/.exec(t);
    if (m) return { p1: num(m[2]) - num(m[1]), p2: num(m[1]), whole: num(m[2]), missing: 'part' };
    m = /^(\d+)\+\?=(\d+)$/.exec(t);
    if (m) return { p1: num(m[1]), p2: num(m[2]) - num(m[1]), whole: num(m[2]), missing: 'part' };
    return null;
}

registerSkill('composing:number_bonds', {
    hint: K2_HINTS['composing:number_bonds'],
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
        // PT-MOD-1 (critic k2-r2: states 1-3 were the same blank bond): each step adds its marks -
        // the numbers read ringed, the dots counted under the parts, the check sentence
        if (b.missing === 'whole') {
            return [
                step(`The parts are ${b.p1} and ${b.p2}. The whole is missing.`, [WORK('parts')]),
                step(`Put them together: ${b.p1} + ${b.p2} = ${b.whole}.`, [WORK('dots')]),
                step(`Write ${b.whole} in the whole.`, [{ slot: 'answer', value: String(b.whole) }]),
            ];
        }
        const firstMissing = b.unknown ? b.unknown === 'A' : /^\?/.test(String(q.text).replace(/^[^0-9?]*/, '').trim());
        const known = firstMissing ? b.p2 : b.p1;
        const miss = b.whole - known;
        return [
            step(`The whole is ${b.whole}. One part is ${known}.`, [WORK('given')]),
            step(`Take ${known} from ${b.whole}: ${b.whole} − ${known} = ${miss}.`, [WORK('dots')]),
            step(`Check: ${known} and ${miss} make ${b.whole}.`, [WORK('check')]),
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
    // Guided fade (critic guided-r1): the first relation is two steps, the number to read and
    // then the result, so a first try's grey hint ("The number before is 66.") never holds it.
    if (out.length) {
        const m = out[0].text.match(/^(The number \w+ is \d+\.) (.*)$/);
        if (m) out.splice(0, 1, step(m[1]), step(m[2]));
    }
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
            // Round-4 re-grade: a gap in the window's top row has no number above; its worked
            // steps read the number below, so the Steps band names that way too.
            'Top row? Look down: the number below. Take away 10.',
            'Write the missing number.',
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
            // Round-4 re-grade: a gap in the window's top row has no number above; its worked
            // steps read the number below, so the Steps band names that way too.
            'Top row? Look down: the number below. Take away 10.',
            'Write the missing number.',
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

/* ================================================================================================
 * BUILD LANE k2 (2026-09-25, design/BUILD_LIST.md lane k2): the new K-1 skills.
 * Each item carries its kit payload (q.cell.payload), so every member reads that first and falls
 * back to the item's own fields; a step never names a strategy the skill does not use.
 * ================================================================================================ */

/** The kit payload of an item, or {}. */
/** A step's working mark for the scripted model (k2kit `work` tokens: count, ring, start ...). */
const WORK = (v) => ({ slot: 'work', value: v });
const payloadOf = (q) => (q && q.cell && q.cell.payload && typeof q.cell.payload === 'object' ? q.cell.payload : {});

/**
 * The task (problem type) a reference is about: the item's payload, else the page's first item
 * as the page engine describes it (`printFormat: 'k2-<task>'`, print-sheet skillMeta passes the
 * first item's printFormat), else the skill's options. '' when none says.
 */
export function k2TaskOf(ref = {}) {
    const q = ref && ref.q;
    const fromQ = q && (payloadOf(q).task || q._variant);
    if (fromQ) return String(fromQ);
    const pf = /^k2-([\w-]+)$/.exec(String((ref && (ref.printFormat || (q && q.printFormat))) || ''));
    if (pf) return pf[1];
    return String((ref && ref.opts && ref.opts.task) || '');
}

/** strings() chosen per task (a task changes the instruction), with a fixed fallback. */
function stringsBy(pickDef, fallbackDef) {
    const cache = new Map();
    const get = (def) => { if (!cache.has(def)) cache.set(def, strings(def)); return cache.get(def); };
    const fn = (ref = {}) => get(pickDef(k2TaskOf(ref), ref) || fallbackDef)(ref);
    fn.def = fallbackDef;
    return fn;
}

const HOLDER = { plates: 'plate', boxes: 'box', frame: 'ten frame' };

/* ============================================================================ zero_none */

const ZERO_COUNT = {
    iCan: 'I Can write 0 when there are none',
    instructionKey: 'count-zero',
    steps: ['Look at the plate.', 'Count each one you see.', 'Nothing there? That is none. Write 0.'],
    say: 'There are __.',
    sayValues: (q) => { const n = num(q.ans); return Number.isFinite(n) ? [n === 0 ? '0. None' : n] : null; },
};
const ZERO_FIND = {
    iCan: 'I Can write 0 when there are none',
    instructionKey: 'check-none',
    steps: ['Look at each one.', 'Find the one with nothing in it.', 'None is 0. Check that one.'],
    say: '__ has none.',
    sayValues: (q) => [String(q.ans)],
};
const ZERO_LEFT = {
    iCan: 'I Can write 0 when there are none',
    instructionKey: 'how-many-left',
    steps: ['Look for the crosses.', 'Count the ones not crossed out.', 'Write how many are left.'],
    say: '__ take away __ is __.',
    sayValues: (q) => {
        const p = payloadOf(q); const n = num(p.n); const m = Number.isFinite(p.m) ? p.m : n;
        return Number.isFinite(n) ? [n, m, n - m] : null;
    },
};

registerSkill('counting:zero_none', {
    hint: K2_HINTS['counting:zero_none'],
    strings: stringsBy((t) => (t === 'find' ? ZERO_FIND : t === 'compute' ? ZERO_LEFT : ZERO_COUNT), ZERO_COUNT),
    misconceptions: ['wrote-one-for-none', 'skipped-one', 'counted-twice', 'chose-fewest', 'wrote-the-start', 'took-all-away'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const word = HOLDER[p.objects] || 'plate';
        const t = p.task || q._variant;
        if (t === 'find') {
            const counts = Array.isArray(p.counts) ? p.counts : [];
            return [
                step('Count each one: ' + counts.map((c, i) => `${['A', 'B', 'C'][i]} has ${c}`).join(', ') + '.', [WORK('count')]),
                step(`${q.ans} has nothing in it. That is none.`, [WORK('ring')]),
                step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        if (t === 'compute' && Number.isFinite(p.m) && p.m === 0) {
            const n = num(p.n);
            return [
                step(`There are ${n} on the ${word}.`, [WORK('count')]),
                step('None are crossed out: 0 are taken away.'),
                step(`All ${n} are left.`),
                step(`Write ${n}.`, [{ slot: 'answer', value: String(n) }]),
            ];
        }
        if (t === 'compute') {
            const n = num(p.n);
            return [
                step(`There are ${n} on the ${word}.`, [WORK('count')]),
                step(`Every one is crossed out: ${n} are taken away.`),
                step('None are left.'),
                // the numeral stays in the box (traced on the Model), never in the text: the support
                // ladder cannot blank a 0, so the words must not give it away
                step('Write the number for none.', [{ slot: 'answer', value: '0' }]),
            ];
        }
        const n = num(q.ans);
        if (n === 0) {
            return [
                step(`Look at the ${word}.`, [WORK('ring')]),
                step(`There is nothing on the ${word}. Nothing there is none.`),
                step('Write the number for none.', [{ slot: 'answer', value: '0' }]),
            ];
        }
        return [
            step(`Touch each one on the ${word}. Count: ${countList(1, n, 1, 10)}.`, [WORK('count')]),
            step(`The last number is ${n}. That is how many.`),
            step(`Write ${n}.`, [{ slot: 'answer', value: String(n) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const t = p.task || q._variant;
        if (t === 'find') {
            const counts = Array.isArray(p.counts) ? p.counts : [];
            const nz = counts.map((c, i) => [c, i]).filter(([c]) => c > 0).sort((x, y) => x[0] - y[0]);
            return chooseWrong(q, nz.slice(0, 1).map(([c, i]) => ({ value: ['A', 'B', 'C'][i], misconception: 'chose-fewest',
                slot: 'answer', explain: `Chose the one with the fewest (${c}), not the one with none.` })), { rotate: false });
        }
        if (t === 'compute' && Number.isFinite(p.m) && p.m === 0) {
            return chooseWrong(q, [
                { value: 0, misconception: 'took-all-away', explain: 'Wrote 0: took them all away when none were taken.' },
            ]);
        }
        if (t === 'compute') {
            const n = num(p.n);
            return chooseWrong(q, [
                { value: n, misconception: 'wrote-the-start', explain: `Wrote ${n}, how many there were, not how many are left.` },
                { value: 1, misconception: 'wrote-one-for-none', explain: 'Wrote 1 when none are left.' },
            ]);
        }
        const n = num(q.ans);
        if (n === 0) {
            return chooseWrong(q, [
                { value: 1, misconception: 'wrote-one-for-none', explain: 'Wrote 1 for an empty plate: none is 0.' },
            ]);
        }
        return chooseWrong(q, [
            { value: n + 1, misconception: 'counted-twice', explain: 'Touched one object two times.' },
            n > 1 ? { value: n - 1, misconception: 'skipped-one', explain: 'Missed one object.' } : null,
        ]);
    },
});

/* ============================================================================ compare_size */

const SIZE_WORDS = ['bigger', 'smaller', 'biggest', 'smallest'];
const sizeDef = (word) => ({
    iCan: 'I Can compare the size of things',
    instructionKey: `check-${word}`,
    steps: word === 'bigger' || word === 'biggest'
        ? ['Look at the whole of each one.', 'Find the one that takes up the most room.', 'That one is the ' + word + '. Check its box.']
        : ['Look at the whole of each one.', 'Find the one that takes up the least room.', 'That one is the ' + word + '. Check its box.'],
    say: `__ is ${word}.`,   // "A is bigger." (critic k2-r2: "The A is bigger." is not English)
    sayValues: (q) => [String(q.ans)],
});
const SIZE_DEFS = Object.fromEntries(SIZE_WORDS.map((w) => [w, sizeDef(w)]));
const SIZE_ORDER = {
    iCan: 'I Can compare the size of things',
    instructionKey: 'order-size',
    steps: ['Find the smallest. Write 1 under it.', 'Find the next size. Write 2.', 'The biggest gets 3.'],
    say: '__ is the smallest.',
    sayValues: (q) => { const o = String(q.ans).split(/\s*,\s*/); const i = o.indexOf('1'); return i >= 0 ? [LETTERS_K2[i]] : null; },
};
const LETTERS_K2 = ['A', 'B', 'C', 'D', 'E', 'F'];

registerSkill('comparing:compare_size', {
    hint: K2_HINTS['comparing:compare_size'],
    strings: stringsBy((t, ref) => {
        if (t === 'order') return SIZE_ORDER;
        if (SIZE_DEFS[t]) return SIZE_DEFS[t];
        const o = (ref && ref.opts) || {};
        if (o.task === 'order') return SIZE_ORDER;
        const three = Number(o.tiles) === 3;
        return SIZE_DEFS[o.dir === 'less' ? (three ? 'smallest' : 'smaller') : (three ? 'biggest' : 'bigger')];
    }, SIZE_DEFS.bigger),
    misconceptions: ['size-swapped', 'middle-one', 'order-reversed', 'order-by-place'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const n = (p.choices || []).length;
        const names = LETTERS_K2.slice(0, n).join(', ');
        if (p.kind === 'order') {
            const order = (p.order || []).map(Number);
            const at = (r) => LETTERS_K2[order.indexOf(r)];
            return [
                step(`${at(1)} is the smallest. Write 1 under ${at(1)}.`, [{ slot: `b${order.indexOf(1)}`, value: '1' }]),
                step(`${at(2)} is the next size. Write 2 under ${at(2)}.`, [{ slot: `b${order.indexOf(2)}`, value: '2' }]),
                step(`${at(3)} is the biggest. Write 3 under ${at(3)}.`, order.map((r, i) => ({ slot: `b${i}`, value: String(r) }))),
            ];
        }
        const word = SIZE_DEFS[q._variant] ? q._variant : 'bigger';
        const most = word === 'bigger' || word === 'biggest';
        return [
            step(`Look at the whole of ${names}.`),
            step(`${q.ans} takes up the ${most ? 'most' : 'least'} room: it is the ${word}.`, [WORK('ring')]),
            step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const n = (p.choices || []).length;
        if (p.kind === 'order') {
            const order = (p.order || []).map(Number);
            const rev = order.map((r) => 4 - r);
            const place = [1, 2, 3];
            return chooseWrong(q, [
                { value: rev.join(', '), misconception: 'order-reversed', slot: 'b0', slots: Object.fromEntries(rev.map((r, i) => [`b${i}`, String(r)])), explain: 'Started with the biggest, not the smallest.' },
                { value: place.join(', '), misconception: 'order-by-place', slot: 'b0', slots: Object.fromEntries(place.map((r, i) => [`b${i}`, String(r)])), explain: 'Wrote 1, 2, 3 left to right without comparing.' },
            ]);
        }
        const sizes = (p.choices || []).map((c) => Number(c.s) || 1);
        const correct = Number(p.correct) || 0;
        const most = /bigg/.test(String(q._variant || 'bigger'));
        const opposite = sizes.indexOf(most ? Math.min(...sizes) : Math.max(...sizes));
        const c = [{ value: LETTERS_K2[opposite], misconception: 'size-swapped', explain: `Chose the ${most ? 'smallest' : 'biggest'} one: mixed up bigger and smaller.` }];
        if (n === 3) {
            const mid = sizes.map((s, i) => [s, i]).sort((a, b) => a[0] - b[0])[1][1];
            if (mid !== correct) c.push({ value: LETTERS_K2[mid], misconception: 'middle-one', explain: 'Chose the middle size: compared only two of the three.' });
        }
        return chooseWrong(q, c);
    },
});

/* ============================================================================ odd_one_out */

const ODD_FIND = {
    iCan: 'I Can find the one that does not belong',
    instructionKey: 'check-odd',
    steps: ['Look at every picture.', 'Find what most of them share: kind or size.', 'Check the one that is not like the others.'],
    say: '__ does not belong.',
    sayValues: (q) => [String(q.ans)],
};
const ODD_WHY = {
    iCan: 'I Can find the one that does not belong',
    instructionKey: 'check-why',
    steps: ['Look at the circled one.', 'Look at the others: same kind? same size?', 'Check the reason that is true.'],
    say: 'It does not belong. It is __.',
    sayValues: (q) => [String(q.ans).toLowerCase()],
};

registerSkill('comparing:odd_one_out', {
    hint: K2_HINTS['comparing:odd_one_out'],
    strings: stringsBy((t, ref) => (t === 'why' || t === 'rule' || (ref && ref.opts && ref.opts.task === 'rule') ? ODD_WHY : null), ODD_FIND),
    misconceptions: ['chose-by-place', 'chose-a-match', 'reason-wrong-attribute'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const attr = q.oddAttr || (p.cue) || (/size/i.test(String(q.ans)) ? 'size' : 'kind');
        if (p.kind === 'words') {
            return [
                step(`Look at the others. They are all the same ${attr === 'kind' ? 'kind of thing' : 'size'}.`),
                step(`The circled one is ${attr === 'kind' ? 'another kind' : 'another size'}: "${q.ans}".`, [WORK('ring')]),
                step(`Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        const n = (p.choices || []).length;
        return [
            step(attr === 'kind' ? `Look at ${LETTERS_K2.slice(0, n).join(', ')}: ${n - 1} are the same kind of thing.` : `Look at ${LETTERS_K2.slice(0, n).join(', ')}: ${n - 1} are the same size.`),
            step(`${q.ans} is not like the others.`, [WORK('ring')]),
            step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'words') {
            const other = (p.words || []).map((w) => w.label).find((l) => l !== q.ans);
            return other ? chooseWrong(q, [{ value: other, misconception: 'reason-wrong-attribute', explain: 'Named a reason that is not what makes it different.' }]) : null;
        }
        const n = (p.choices || []).length;
        const c = Number(p.correct) || 0;
        return chooseWrong(q, [
            { value: LETTERS_K2[c === n - 1 ? 0 : n - 1], misconception: 'chose-by-place', explain: 'Chose by where it stands (the last one), not by looking.' },
            { value: LETTERS_K2[(c + 1) % n], misconception: 'chose-a-match', explain: 'Chose one of the pictures that are alike.' },
        ]);
    },
});

/* ============================================================================ match_same */

const matchDef = (key, steps, say) => ({ iCan: 'I Can match pictures that are the same', instructionKey: key, steps, say, sayValues: (q) => [String(q.ans)] });
const MATCH_DEFS = {
    same: matchDef('check-same', ['Look at the picture in the box.', 'Look at each picture in the row.', 'Find the one that is the same. Check its box.'], '__ is the same.'),
    shadow: matchDef('check-shadow', ['Look at the outline of the shadow.', 'Find the picture with the same outline.', 'Check its box.'], '__ fits the shadow.'),
    kind: matchDef('check-same-kind', ['Look at the picture in the box.', 'Find the same kind of thing. Its size can change.', 'Check its box.'], '__ is the same kind.'),
};

registerSkill('counting:match_same', {
    hint: K2_HINTS['counting:match_same'],
    strings: stringsBy((t, ref) => MATCH_DEFS[t] || MATCH_DEFS[ref && ref.opts && ref.opts.match] || null, MATCH_DEFS.same),
    misconceptions: ['matched-by-size', 'matched-a-neighbour', 'matched-by-outline-only'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const n = (p.choices || []).length;
        const t = MATCH_DEFS[q._variant] ? q._variant : 'same';
        const first = t === 'shadow' ? 'Look at the outline of the shadow in the box.' : 'Look at the picture in the box.';
        return [
            step(`${first} Then look at ${LETTERS_K2.slice(0, n).join(', ')}.`),
            step(t === 'kind' ? `${q.ans} is the same kind, in another size.` : `${q.ans} is just like it.`, [WORK('ring')]),
            step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const n = (p.choices || []).length;
        const c = Number(p.correct) || 0;
        const t = q._variant;
        return chooseWrong(q, [
            t === 'kind' ? { value: LETTERS_K2[(c + 1) % n], misconception: 'matched-by-size', explain: 'Chose a different thing of the same size.' } : null,
            { value: LETTERS_K2[c === 0 ? 1 : c - 1], misconception: 'matched-a-neighbour', explain: 'Chose the picture next to the match.' },
            t === 'shadow' ? { value: LETTERS_K2[(c + 1) % n], misconception: 'matched-by-outline-only', explain: 'Chose a picture whose outline only looks a little like the shadow.' } : null,
        ]);
    },
});

/* ============================================================================ compare_capacity */

const CAP_ICAN = 'I Can talk about how much a container holds';
const CAP_READ = {
    iCan: CAP_ICAN, instructionKey: 'check-level',
    steps: ['Look at the grey water.', 'At the top: full. Halfway: half full. None: empty.', 'Check the word that matches.'],
    say: 'It is __.', sayValues: (q) => [String(q.ans).toLowerCase()],
};
const capFind = (verb, dir) => ({
    iCan: CAP_ICAN, instructionKey: `check-${verb}-${dir}`,
    steps: verb === 'holds'
        ? ['Look at how big each container is.', `The ${dir === 'more' ? 'bigger' : 'smaller'} one holds ${dir}.`, 'Check its box.']
        : ['Look at the grey water in each one.', `The ${dir === 'more' ? 'higher' : 'lower'} water has ${dir}.`, 'Check its box.'],
    say: `__ ${verb} ${dir}.`, sayValues: (q) => [String(q.ans)],
});
const capOrder = (verb) => ({
    iCan: CAP_ICAN, instructionKey: `order-${verb}`,
    steps: verb === 'holds' ? ['The smallest holds the least. Write 1.', 'The next size holds more. Write 2.', 'The biggest holds the most. Write 3.']
        : ['The lowest water has the least. Write 1.', 'The next has more. Write 2.', 'The highest water has the most. Write 3.'],
    say: '__ has the least.', sayValues: (q) => { const o = String(q.ans).split(/\s*,\s*/); const i = o.indexOf('1'); return i >= 0 ? [LETTERS_K2[i]] : null; },
});
const CAP_DEFS = { read: CAP_READ, 'holds-more': capFind('holds', 'more'), 'has-more': capFind('has', 'more'), 'order-holds': capOrder('holds') };

registerSkill('comparing:compare_capacity', {
    hint: K2_HINTS['comparing:compare_capacity'],
    strings: stringsBy((t, ref) => {
        if (CAP_DEFS[t]) return CAP_DEFS[t];
        const o = (ref && ref.opts) || {};
        return o.task === 'order' ? CAP_DEFS['order-holds'] : o.task === 'find' ? CAP_DEFS['holds-more'] : o.task === 'fill' ? CAP_DEFS['has-more'] : null;
    }, CAP_READ),
    misconceptions: ['next-word', 'half-means-any', 'more-less-swapped', 'taller-holds-more', 'order-reversed'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const t = String(q._variant || 'read');
        if (p.kind === 'words') {
            const fill = Number(p.pic0 && p.pic0.fill) || 0;
            const where = fill >= 0.99 ? 'at the very top' : fill >= 0.7 ? 'near the top' : fill >= 0.4 ? 'halfway up' : fill > 0 ? 'near the bottom' : 'not there: there is none';
            return [
                step('Look at the grey water.'),
                step(`The water is ${where}. So it is ${String(q.ans).toLowerCase()}.`, [WORK('ring')]),
                step(`Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        const holds = /holds/.test(t);
        if (p.kind === 'order') {
            const order = (p.order || []).map(Number);
            const at = (r) => LETTERS_K2[order.indexOf(r)];
            return [
                step(`${at(1)} ${holds ? 'holds' : 'has'} the least. Write 1 under ${at(1)}.`, [{ slot: `b${order.indexOf(1)}`, value: '1' }]),
                step(`${at(2)} is next. Write 2 under ${at(2)}.`, [{ slot: `b${order.indexOf(2)}`, value: '2' }]),
                step(`${at(3)} ${holds ? 'holds' : 'has'} the most. Write 3.`, order.map((r, i) => ({ slot: `b${i}`, value: String(r) }))),
            ];
        }
        const more = /more/.test(t);
        return [
            step(holds ? 'Look at how big each one is.' : 'Look at the grey water in each one.'),
            step(holds ? `${q.ans} is ${more ? 'bigger' : 'smaller'}: it holds ${more ? 'more' : 'less'}.` : `${q.ans} has ${more ? 'higher' : 'lower'} water: it has ${more ? 'more' : 'less'}.`, [WORK('ring')]),
            step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        if (p.kind === 'words') {
            const labels = (p.words || []).map((w) => w.label);
            const i = labels.indexOf(String(q.ans));
            const next = labels[i + 1] !== undefined ? labels[i + 1] : labels[i - 1];
            const half = labels.find((l) => /^Half/.test(l));
            return chooseWrong(q, [
                next !== undefined ? { value: next, misconception: 'next-word', explain: 'Chose the word next to the right one: read the water level roughly.' } : null,
                half && half !== q.ans ? { value: half, misconception: 'half-means-any', explain: 'Said half full for a container that has some water, not half.' } : null,
            ]);
        }
        if (p.kind === 'order') {
            const order = (p.order || []).map(Number);
            const rev = order.map((r) => 4 - r);
            return chooseWrong(q, [{ value: rev.join(', '), misconception: 'order-reversed', slot: 'b0',
                slots: Object.fromEntries(rev.map((r, i) => [`b${i}`, String(r)])), explain: 'Started with the most, not the least.' }]);
        }
        const c = Number(p.correct) || 0;
        const other = LETTERS_K2[1 - c];
        const holds = /holds/.test(String(q._variant));
        return chooseWrong(q, [holds
            ? { value: other, misconception: 'taller-holds-more', explain: 'Chose by height alone, or mixed up more and less.' }
            : { value: other, misconception: 'more-less-swapped', explain: 'Mixed up more and less water.' }]);
    },
});

/* ============================================================================ what_can_we_measure */

const MEAS_ICAN = 'I Can say what we can measure';
const MEAS_WHICH = {
    iCan: MEAS_ICAN, instructionKey: 'check-measure',
    steps: ['Look at the thing in the picture.', 'We can measure how long, tall, heavy, or how much it holds.', 'We cannot measure a colour or a name.'],
    say: 'We can measure __.', sayValues: (q) => [String(q.ans).toLowerCase().replace(/^how /, 'how ')],
};
const MEAS_TOOL = {
    iCan: MEAS_ICAN, instructionKey: 'check-tool',
    steps: ['Read the question: long, tall, heavy or holds?', 'A ruler measures long and tall. A scale measures heavy.', 'A jug measures how much it holds.'],
    say: 'We use a __.', sayValues: (q) => [String(q.ans).toLowerCase()],
};
const MEAS_WORD = { long: 'how long', heavy: 'how heavy', tall: 'how tall', holds: 'how much it holds' };

registerSkill('comparing:what_can_we_measure', {
    hint: K2_HINTS['comparing:what_can_we_measure'],
    strings: stringsBy((t, ref) => (t === 'tool' || (ref && ref.opts && ref.opts.task === 'find') ? MEAS_TOOL : null), MEAS_WHICH),
    misconceptions: ['colour-is-measured', 'name-is-measured', 'wrong-tool'],
    workedSteps: (q) => {
        const attr = q.measureAttr || 'long';
        if (q._variant === 'tool') {
            return [
                step(`The question is ${MEAS_WORD[attr]}.`),
                step(attr === 'heavy' ? 'A scale shows which is heavier.' : attr === 'holds' ? 'A jug shows how much it holds.' : 'A ruler shows how long or tall.', [WORK('ring')]),
                step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        return [
            step('Look at the thing in the picture. A colour or a name is not measured.'),
            step(`We can find ${MEAS_WORD[attr]} it is.`.replace('how much it holds it is', 'how much it holds'), [WORK('ring')]),
            step(`Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const others = (p.words || []).map((w) => w.label).filter((l) => l !== q.ans);
        return chooseWrong(q, others.map((l) => ({
            value: l,
            misconception: q._variant === 'tool' ? 'wrong-tool' : /colour/i.test(l) ? 'colour-is-measured' : 'name-is-measured',
            explain: q._variant === 'tool' ? `Chose the ${l.toLowerCase()} for ${MEAS_WORD[q.measureAttr || 'long']}.` : `Thought we can measure ${l.toLowerCase()}.`,
        })));
    },
});

/* ============================================================================ ordinal_numbers */

const ORD = (n) => { const t = n % 100; return t >= 11 && t <= 13 ? `${n}th` : `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`; };
const ORD_ICAN = 'I Can use 1st, 2nd, 3rd to say a place';
const ORD_FIND = {
    iCan: ORD_ICAN, instructionKey: 'check-place',
    steps: ['Start at the flag.', 'Count the places: 1st, 2nd, 3rd ...', 'Stop at the place shown. Check that one.'],
    say: 'This one is __.', sayValues: (q) => (q.ordPlace ? [ORD(q.ordPlace)] : null),
};
const ORD_WRITE = {
    iCan: ORD_ICAN, instructionKey: 'write-place',
    steps: ['Start at the flag.', 'Count the places: 1st, 2nd, 3rd ...', 'Stop at the star. Write its place.'],
    say: 'The star is __.', sayValues: (q) => [String(q.ans)],
};

registerSkill('counting:ordinal_numbers', {
    hint: K2_HINTS['counting:ordinal_numbers'],
    strings: stringsBy((t, ref) => (t === 'write' || (ref && ref.opts && ref.opts.task === 'write') ? ORD_WRITE : null), ORD_FIND),
    misconceptions: ['wrong-end', 'off-by-one', 'wrong-suffix'],
    workedSteps: (q) => {
        const n = Number(q.ordPlace) || 1;
        const counted = Array.from({ length: Math.min(n, 4) }, (_, i) => ORD(i + 1)).join(', ') + (n > 4 ? ` ... ${ORD(n)}` : '');
        if (q._variant === 'write') {
            return [step('Start at the flag.', [WORK('flag')]), step(`Count: ${counted}.`, [WORK('count')]), step(`The star is ${ORD(n)}.`, [WORK('ring')]), step(`Write ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }])];
        }
        return [step('Start at the flag.', [WORK('flag')]), step(`Count: ${counted}.`, [WORK('count')]), step(`${q.ans} is ${ORD(n)}.`, [WORK('ring')]), step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }])];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const n = Number(q.ordPlace) || 1;
        const len = (p.items || []).length || n;
        if (q._variant === 'write') {
            const bad = n % 10 === 1 && n !== 11 ? `${n}th` : n % 10 === 2 && n !== 12 ? `${n}th` : n % 10 === 3 && n !== 13 ? `${n}th` : null;
            return chooseWrong(q, [
                len + 1 - n !== n ? { value: ORD(len + 1 - n), misconception: 'wrong-end', explain: 'Counted from the wrong end of the line.' } : null,
                n > 1 ? { value: ORD(n - 1), misconception: 'off-by-one', explain: 'Did not count the first place.' } : { value: ORD(n + 1), misconception: 'off-by-one', explain: 'Counted the flag as a place.' },
                bad ? { value: bad, misconception: 'wrong-suffix', explain: `Wrote ${bad}: the right ending is ${ORD(n)}.` } : null,
            ]);
        }
        const labels = Array.isArray(p.labels) ? p.labels : [];
        return chooseWrong(q, [
            len + 1 - n !== n ? { value: labels[len - n], misconception: 'wrong-end', explain: 'Counted from the wrong end of the line.' } : null,
            { value: labels[n > 1 ? n - 2 : n], misconception: 'off-by-one', explain: n > 1 ? 'Counted the flag as the 1st place.' : 'Skipped the 1st place.' },
        ]);
    },
});

/* ============================================================================ sort_into_groups */

const SORT_ICAN = 'I Can sort things into groups';
const SORT_DEFS = {
    count: {
        iCan: SORT_ICAN, instructionKey: 'sort-count',
        steps: ['Look at the label on each ring.', 'Write each letter in the ring it belongs to.', 'Count each ring. Write how many.'],
        say: 'This ring has __.', sayValues: (q) => { const c = String(q.ans).split(/\s*,\s*/); return c.length ? [c[0]] : null; },
    },
    most: {
        iCan: SORT_ICAN, instructionKey: 'check-most-ring',
        steps: ['Count each ring.', 'Find the biggest number.', 'Check the ring with the most.'],
        say: 'Ring __ has the most.', sayValues: (q) => [String(q.ans)],
    },
    order: {
        iCan: SORT_ICAN, instructionKey: 'order-rings',
        steps: ['Count each ring.', 'The ring with the fewest gets 1.', 'Then 2, then 3 for the most.'],
        say: 'The fewest is __.', sayValues: (q) => { const p = payloadOf(q); return Array.isArray(p.counts) ? [Math.min(...p.counts)] : null; },
    },
    rule: {
        iCan: SORT_ICAN, instructionKey: 'check-sorted',
        steps: ['Look at one ring.', 'What is the same about everything in it?', 'Check the rule that fits every ring.'],
        say: 'They are sorted __.', sayValues: (q) => [String(q.ans).toLowerCase().replace(/^by /, 'by ')],
    },
};

registerSkill('comparing:sort_into_groups', {
    hint: K2_HINTS['comparing:sort_into_groups'],
    strings: stringsBy((t, ref) => SORT_DEFS[t] || SORT_DEFS[ref && ref.opts && ref.opts.task] || null, SORT_DEFS.count),
    misconceptions: ['counted-a-tile-twice', 'left-one-out', 'rings-swapped', 'most-fewest-swapped', 'order-reversed', 'rule-does-not-fit'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const groups = p.groups || [];
        const counts = (p.counts || groups.map((g) => g.members.length)).map(Number);
        const name = (gi) => {
            const g = groups[gi] || {};
            if (g.word) return `the ${g.word.toLowerCase()} ring`;
            const sh = g.pic && K2_PICTURES[g.pic.shape];
            return sh ? `the ${sh.plural} ring` : `ring ${gi + 1}`;
        };
        if (p.task === 'count') {
            const out = [];
            groups.forEach((g, gi) => out.push(step(`${g.members.map((i) => LETTERS_K2[i] || '').join(', ')} go in ${name(gi)}.`, [WORK(`g${gi}`)])));
            out.push(step(`Count: ${counts.join(' and ')}.`, counts.map((c, i) => ({ slot: `b${i}`, value: String(c) }))));
            return clampSteps(out.length < 3 ? [step('Look at the label on each ring.')].concat(out) : out);
        }
        if (p.task === 'order') {
            const order = (p.order || []).map(Number);
            const at = (r) => order.indexOf(r);
            return [
                step(`Count each ring: ${counts.join(', ')}.`, [WORK('count')]),
                step(`The fewest is ${Math.min(...counts)}. It gets 1.`, [{ slot: `b${at(1)}`, value: '1' }]),
                step(`The most is ${Math.max(...counts)}. It gets 3.`, [{ slot: `b${at(3)}`, value: '3' }]),
                step(`Write ${order.join(', ')}.`, order.map((r, i) => ({ slot: `b${i}`, value: String(r) }))),
            ];
        }
        if (p.task === 'most') {
            return [
                step(`Count each ring: ${counts.join(', ')}.`, [WORK('count')]),
                step(`${Math.max(...counts)} is the most.`, [WORK('ring')]),
                step(`Check ${q.ans}.`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        return [
            step(`Look at one ring. Everything in it is the same ${String(q.sortAttr || 'kind').replace('weight', 'weight (heavy or light)')}.`),
            step(`They are sorted ${String(q.ans).toLowerCase()}.`, [WORK('ring')]),
            step(`Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
        ];
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const counts = (p.counts || []).map(Number);
        if (p.task === 'count') {
            const plus = counts.map((c, i) => (i === 0 ? c + 1 : c));
            const minus = counts.map((c, i) => (i === counts.length - 1 && c > 1 ? c - 1 : c));
            const rev = counts.slice().reverse();
            const mk = (v, m, e) => ({ value: v.join(', '), misconception: m, slot: 'b0', slots: Object.fromEntries(v.map((x, i) => [`b${i}`, String(x)])), explain: e });
            return chooseWrong(q, [
                mk(plus, 'counted-a-tile-twice', 'Put one picture in two rings.'),
                minus.join(',') !== counts.join(',') ? mk(minus, 'left-one-out', 'Left one picture out of the rings.') : null,
                rev.join(',') !== counts.join(',') ? mk(rev, 'rings-swapped', 'Wrote the counts under the wrong rings.') : null,
            ]);
        }
        if (p.task === 'order') {
            const order = (p.order || []).map(Number);
            const rev = order.map((r) => 4 - r);
            return chooseWrong(q, [{ value: rev.join(', '), misconception: 'order-reversed', slot: 'b0', slots: Object.fromEntries(rev.map((r, i) => [`b${i}`, String(r)])), explain: 'Started with the most, not the fewest.' }]);
        }
        if (p.task === 'most') {
            return chooseWrong(q, [{ value: LETTERS_K2[counts.indexOf(Math.min(...counts))], misconception: 'most-fewest-swapped', explain: 'Chose the ring with the fewest.' }]);
        }
        const other = (p.words || []).map((w) => w.label).find((l) => l !== q.ans);
        return other ? chooseWrong(q, [{ value: other, misconception: 'rule-does-not-fit', explain: 'Named a rule that does not split the rings.' }]) : null;
    },
});

/* ============================================================================ bonds_in_order */

const BONDS_ICAN = 'I Can find all the bonds of a number in order';
/** Is the table listed from the whole down (n and 0 first)? */
const bondsDown = (q) => { const r = payloadOf(q).rows || []; return r.length > 1 && r[1].a < r[0].a; };
const BONDS_DEFS = {
    fill: {
        iCan: BONDS_ICAN, instructionKey: 'fill-bonds',
        steps: ['Start with 0 and the whole.', 'The first part goes up by 1.', 'The second part goes down by 1.', 'Check: the two parts make the whole.'],
        stepsFor: (q) => (payloadOf(q).mixedDir ? ['Read the first row.', 'One part goes up by 1. The other goes down by 1.', 'Keep going to the last row.', 'Check: the two parts make the whole.']
            : bondsDown(q) ? ['Start with the whole and 0.', 'The first part goes down by 1.', 'The second part goes up by 1.', 'Check: the two parts make the whole.'] : null),
        say: '__ is __ and __.',
        sayValues: (q) => { const p = payloadOf(q); const r = (p.rows || [])[1]; return r ? [p.n, r.a, r.b] : null; },
    },
    missing: {
        iCan: BONDS_ICAN, instructionKey: 'missing-bonds',
        steps: ['Read the row before the gap.', 'The first part is 1 more.', 'The second part is 1 less.', 'Write both parts.'],
        stepsFor: (q) => (payloadOf(q).mixedDir ? ['Read the row before the gap.', 'Does the first part go up or down?', 'One part is 1 more. The other is 1 less.', 'Write both parts.']
            : bondsDown(q) ? ['Read the row before the gap.', 'The first part is 1 less.', 'The second part is 1 more.', 'Write both parts.'] : null),
        say: '__ is __ and __.',
        sayValues: (q) => { const p = payloadOf(q); const r = (p.rows || []).find((x) => x.hide === 'both'); return r ? [p.n, r.a, r.b] : null; },
    },
    pattern: {
        iCan: BONDS_ICAN, instructionKey: 'check-bond-pattern',
        steps: ['Read the first numbers down.', 'Read the second numbers down.', 'Is each one 1 more, 1 less or the same?', 'Check how the numbers change.'],
        say: 'The first number goes __ by 1.',
        sayValues: (q) => { const p = payloadOf(q); const r = p.rows || []; return r.length > 1 ? [r[1].a > r[0].a ? 'up' : 'down'] : null; },
    },
};

/** The table's blanks in reading order (the bond template's order): {id, value, i, part, r}. */
function bondBlanks(rows) {
    const out = [];
    rows.forEach((r, i) => {
        if (r.hide === 'both') out.push({ id: `r${i}a`, value: String(r.a), v: r.a, i, part: 'a', r });
        if (r.hide) out.push({ id: `r${i}b`, value: String(r.b), v: r.b, i, part: 'b', r });
    });
    return out;
}

registerSkill('composing:bonds_in_order', {
    hint: K2_HINTS['composing:bonds_in_order'],
    // Stretch: the open task behind the table - the pairs of parts that make this whole, a pair and
    // its swap counted once (critic k2-r2: 7 ordered pairs of 6 did not fit the page's rows, so "I
    // found them all" could not be written); the example row is 0 and the whole.
    open: (q) => {
        const n = num(payloadOf(q).n);
        if (!Number.isInteger(n) || n < 2) return null;
        const rows = [];
        for (let a = 1; a <= Math.floor(n / 2); a++) rows.push([a, n - a, n]);
        return {
            prompt: [`Two parts make ${n}.`, `Find different pairs. ${n - 1} and 1 is the same pair as 1 and ${n - 1}.`],
            columns: ['First part', 'Second part', 'Check: whole'],
            example: [0, n, n],
            keyRows: rows,
            rule: `+ = ${n}`,
            total: Math.floor(n / 2) + 1,
        };
    },
    strings: stringsBy((t, ref) => BONDS_DEFS[String(t).replace(/^bonds-/, '')] || BONDS_DEFS[ref && ref.opts && ref.opts.task] || null, BONDS_DEFS.fill),
    misconceptions: ['copied-first-part', 'second-goes-up', 'missed-zero', 'parts-miss-whole', 'repeated-a-row', 'up-down-swapped'],
    workedSteps: (q) => {
        const p = payloadOf(q);
        const rows = p.rows || [];
        const n = num(p.n);
        if (!rows.length || !Number.isFinite(n)) return [];
        const marks = (list) => list.map((b) => ({ slot: b.id, value: b.value }));
        const blanks = bondBlanks(rows);
        if (p.task === 'pattern') {
            const col = p.ask === 'first' ? rows.map((r) => r.a) : rows.map((r) => r.b);
            return [
                step(`Read the ${p.ask === 'first' ? 'first' : 'second'} numbers: ${col.slice(0, 4).join(', ')} ...`),
                step(`Each one is 1 ${col[1] > col[0] ? 'more' : 'less'} than the one before.`),
                step(`Check "${q.ans}".`, [{ slot: 'answer', value: String(q.ans) }]),
            ];
        }
        if (p.task === 'missing') {
            const hidden = rows.map((r, i) => (r.hide === 'both' ? i : -1)).filter((i) => i >= 0);
            const out = [step(bondsDown(q) ? `The bonds of ${n} go ${n} and 0, ${n - 1} and 1 ... in order.` : `The bonds of ${n} go 0 and ${n}, 1 and ${n - 1} ... in order.`)];
            hidden.slice(0, 2).forEach((i) => out.push(step(`Row ${i + 1}: ${rows[i].a} and ${rows[i].b} make ${n}.`, marks(blanks.filter((b) => b.i === i)))));
            out.push(step('Write both parts of each missing row.', marks(blanks)));
            return clampSteps(out);
        }
        const first = blanks[0];
        const r0 = first ? first.r : rows[0];
        return clampSteps([
            step(`The whole is ${n}. The first part goes ${bondsDown(q) ? 'down' : 'up'} by 1.`),
            step(`${r0.a} and ${r0.b} make ${n}. Write ${r0.b}.`, first ? [{ slot: first.id, value: first.value }] : []),
            step(`Each next second part is 1 ${bondsDown(q) ? 'more' : 'less'}.`, blanks[1] ? [{ slot: blanks[1].id, value: blanks[1].value }] : []),
            step(`Write ${blanks.map((b) => b.value).join(', ')}.`, marks(blanks)),
        ]);
    },
    wrongAnswer: (q) => {
        const p = payloadOf(q);
        const rows = p.rows || [];
        if (p.task === 'pattern') {
            const other = (p.labels || []).find((l) => l !== q.ans && l !== 'Stays the same');
            return other ? chooseWrong(q, [{ value: other, misconception: 'up-down-swapped', explain: 'Read the other column.' }]) : null;
        }
        const blanks = bondBlanks(rows);
        if (!blanks.length) return null;
        const mk = (vals, m, e) => ({ value: vals.join(', '), misconception: m, slot: blanks[0].id, slots: Object.fromEntries(blanks.map((b, k) => [b.id, String(vals[k])])), explain: e });
        const right = blanks.map((b) => b.v).join(', ');
        const c = [];
        if (p.task === 'fill') {
            c.push(mk(blanks.map((b) => b.r.a), 'copied-first-part', 'Wrote the first part again.'));
            const minus = blanks.map((b, k) => (k === blanks.length - 1 && b.v > 0 ? b.v - 1 : b.v));
            c.push(mk(minus, 'parts-miss-whole', 'The last two parts do not make the whole.'));
        } else {
            // a missing row written as the row above it (the pair repeated)
            const rep = blanks.map((b) => (b.part === 'a' ? b.v - 1 : b.v + 1));
            if (rep.every((v) => v >= 0)) c.push(mk(rep, 'repeated-a-row', 'Wrote the row above again.'));
            c.push(mk(blanks.map((b) => (b.part === 'a' ? b.r.b : b.r.a)), 'up-down-swapped', 'Swapped the two parts.'));
        }
        return chooseWrong(q, c.filter((x) => x.value !== right));
    },
});
