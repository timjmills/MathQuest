// js/modules/sheet/providers/nl-place.js
// Providers of the four "put the number on the line" skills (O6 lane AP3 fixes, 2026-09-25):
//   fractions:fraction_nl_drag    fractions of 0 to 1
//   fractions:mixed_nl_drag       improper fractions and mixed numbers, 0 to 3
//   decimals:decimal_nl_drag      tenths, 0 to 1
//   integers:integer_nl_drag      integers, a line through 0
// Each reads the item's kit cell (q.cell.payload of `nl-place`: the ticks, the numbers to place and
// their ticks), so the same item always gets the same worked steps and the same wrong answer.
//
// The misconceptions are the ones number-line research names for these pupils: counting the TICKS
// instead of the spaces (one tick off), counting from the wrong end, reading the denominator as
// the number of ticks (n + 1 ticks for n parts), and, on a line through 0, placing a negative on
// the positive side (its opposite).
//
// Pure module (SCC-01).

import { registerSkill } from '../contract.js';
import { strings, step, clampSteps, chooseWrong } from './util.js';

const payloadOf = (q) => (q && q.cell && q.cell.template === 'nl-place' && q.cell.payload) || null;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** The value a tick reads in a chip's own form (payload.vals), or '' past the line. */
const read = (p, fmt, i) => (i >= 0 && i <= p.n && p.vals[fmt] ? p.vals[fmt][i] : '');

/** Where the line's numbers come from: every part is one step (the denominator, a tenth, one). */
function unitText(p) {
    if (p.mode === 'fraction' || p.mode === 'mixed') return `The space from 0 to 1 is cut into ${p.denom} equal parts. Each part is 1/${p.denom}.`;
    if (p.mode === 'decimal') return 'The space from 0 to 1 is cut into 10 equal parts. Each part is 0.1.';
    return 'Each space on the line is 1. The numbers get bigger to the right.';
}

/** How to find one number's tick, from 0 (or from the nearest whole). */
function findText(p, c) {
    if (p.mode === 'fraction') {
        const k = Number(c.label.split('/')[0]);
        return `${c.label}: count ${k} part${k === 1 ? '' : 's'} from 0.`;
    }
    if (p.mode === 'mixed') {
        const m = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(c.label);
        if (m && m[1]) return `${c.label}: go to ${m[1]}, then count ${m[2]} more part${m[2] === '1' ? '' : 's'}.`;
        if (m) return `${c.label}: count ${m[2]} parts from 0 (${p.denom} parts make 1).`;
        return `${c.label} is a whole number: its tick is labelled.`;
    }
    if (p.mode === 'decimal') {
        const k = Math.round(Number(c.label) * 10);
        return `${c.label} is ${k} tenth${k === 1 ? '' : 's'}: count ${k} part${k === 1 ? '' : 's'} from 0.`;
    }
    const v = Number(c.label);
    return v < 0 ? `${c.label.replace(/^-/, '−')} is ${-v} to the LEFT of 0.` : `${c.label} is ${v} to the right of 0.`;
}

function steps(q) {
    const p = payloadOf(q);
    if (!p) return [];
    const multi = p.chips.length > 1;
    const all = p.chips.map((c) => c.label).join(', ');
    return clampSteps([
        step(unitText(p)),
        ...p.chips.slice(0, 3).map((c) => step(findText(p, c))),
        step(multi ? `Mark each one with its letter: ${p.chips.map((c, k) => `${LETTERS[k]} = ${c.label}`).join(', ')}.` : `Mark a dot on that tick.`,
            [{ slot: 'answer', value: all }]),
    ]);
}

function wrong(q) {
    const p = payloadOf(q);
    if (!p) return null;
    const c0 = p.chips[0];
    const cand = [];
    const moved = (shift, misconception, explain) => {
        const at = p.chips.map((c, k) => (k === 0 ? c.at + shift(c) : c.at));
        if (at.some((i) => i < 0 || i > p.n) || at[0] === c0.at) return;
        const value = p.chips.map((c, k) => read(p, c.fmt, at[k])).join(', ');
        cand.push({ value, misconception, slot: 'answer', slots: { marks: at, answer: value }, explain });
    };
    // one tick off: counted the ticks (0 as "1") instead of the spaces
    moved(() => -1, 'counted-ticks', 'Counted the tick at 0 as the first one. Count the SPACES from 0.');
    if (p.mode === 'integer') {
        // the opposite side of 0
        const zero = p.vals.integer ? p.vals.integer.indexOf('0') : -1;
        if (zero >= 0) moved((c) => 2 * (zero - c.at), 'opposite-side', 'Put the number on the wrong side of 0. Negative numbers are to the LEFT of 0.');
    } else {
        // counted from the right-hand end
        moved((c) => (p.n - c.at) - c.at, 'counted-from-end', 'Counted from the wrong end. Start counting at 0.');
    }
    return chooseWrong(q, cand);
}

const DEF = {
    'fractions:fraction_nl_drag': { iCan: 'I Can place fractions on a number line', say: '__ is __ parts from 0.' },
    'fractions:mixed_nl_drag': { iCan: 'I Can place mixed numbers on a number line', say: '__ is between __ and __.' },
    'decimals:decimal_nl_drag': { iCan: 'I Can place decimals on a number line', say: '__ is __ tenths from 0.' },
    'integers:integer_nl_drag': { iCan: 'I Can place integers on a number line', say: '__ is __ from 0.' },
};

for (const [key, d] of Object.entries(DEF)) {
    registerSkill(key, {
        strings: strings({
            iCan: d.iCan,
            instructionKey: 'line-mark-each',
            steps: ['Find what one space on the line is worth.', 'Count the spaces from 0 to the number.', 'Mark a dot on that tick.'],
            say: d.say,
            vocabulary: ['number line', 'tick'],
        }),
        misconceptions: ['counted-ticks', 'counted-from-end', 'opposite-side'],
        workedSteps: steps,
        wrongAnswer: wrong,
    });
}
