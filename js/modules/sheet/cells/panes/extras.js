// js/modules/sheet/cells/panes/extras.js
// The STRUGGLING-LEARNER EXTRAS (design/SUPPORTS.md §S4.5): small marks any problem can carry,
// from the owner's list — a boxed operation sign, a start-here arrow over the ones, and a
// step-checklist strip. They are H4 attention marks and step hints (PEDAGOGY_STANDARD 4.2): they
// tell the pupil where to look and what to do next, never what the answer is.
//
// Pure module (SCC-01).

import { SW, n2, st, text, mm, by, opOf, textW, downArrow } from './kit.js';
import { opGlyph } from '../../tokens.js';

const WORD = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };

/** The sign in a heavy rounded box with its word under it: the pupil sees WHICH operation first. */
function boxSign(c, op) {
    const s = by(c, { S: 13, M: 14, L: 15 });
    const dpt = c.S.digitPt, zpt = c.S.zonePt + 1;
    const word = WORD[op] || '';
    const W = Math.max(s, textW(word, zpt) + 1);
    const x0 = (W - s) / 2;
    const body = `<rect x="${n2(x0)}" y="0" width="${s}" height="${s}" rx="2.5" fill="#fff" ${st(c, SW.rule)}/>`
        + text(c, W / 2, s / 2 + mm(dpt) * 0.36, opGlyph(op), { pt: dpt })
        + text(c, W / 2, s + 1.5 + mm(zpt) * 0.85, word, { pt: zpt, weight: 400 });
    return { w: W, h: s + 2 + mm(zpt) * 1.1, body };
}

/** "Start" over a solid-tipped down arrow: it stands over the ONES column of a stack. */
function startArrow(c) {
    const zpt = c.S.zonePt;
    const h = by(c, { S: 11, M: 12, L: 13 });
    const W = Math.max(8, textW('Start', zpt) + 1);
    return {
        w: W, h,
        body: text(c, W / 2, mm(zpt) * 0.85, 'Start', { pt: zpt }) + downArrow(c, W / 2, mm(zpt) * 1.1 + 0.8, h, 3),
    };
}

// Default step lists, 8 words or fewer each, print verbs, after the procedures of
// PEDAGOGY_STANDARD §5.2 (L-4, L-5, L-6, L-8) and the rounding routine. A provider's own
// `workedSteps` text, passed as `payload.steps`, wins.
export const DEFAULT_STEPS = Object.freeze({
    '+': ['Start at the ones.', 'Add the ones.', '10 or more? Regroup.', 'Add the tens.'],
    '-': ['Start at the ones.', 'Top digit smaller? Regroup.', 'Subtract the ones.', 'Subtract the tens.'],
    '*': ['Multiply the ones.', 'Write the regrouped ten.', 'Multiply the tens.', 'Add the regrouped ten.'],
    '/': ['Divide.', 'Multiply.', 'Subtract.', 'Bring down the next digit.'],
    round: ['Find the two numbers.', 'Find halfway.', 'Which number is nearer?', 'Write that number.'],
});

/** A strip of numbered steps, each with a check box the pupil marks when done (never scored). */
function stepStrip(c, steps) {
    const pt = c.S.textPt, box = c.S.checkMm;
    const lh = Math.max(box + 2.5, mm(pt) * 1.55);
    const numW = mm(pt) * 1.1;
    const W = box + 2.5 + numW + Math.max(...steps.map((s) => textW(s, pt))) + 2;
    let body = '';
    steps.forEach((s, i) => {
        const y = i * lh;
        body += `<rect data-ws-graded="0" x="0" y="${n2(y + (lh - box) / 2)}" width="${box}" height="${box}" rx="1.25" fill="#fff" ${st(c, SW.hair)}/>`;
        body += text(c, box + 2.5, y + lh / 2 + mm(pt) * 0.36, `${i + 1}`, { pt, anchor: 'start', ref: true });
        body += text(c, box + 2.5 + numW, y + lh / 2 + mm(pt) * 0.36, s, { pt, anchor: 'start', weight: 400 });
    });
    return { w: W, h: steps.length * lh, body };
}

const stepsKey = (p) => (p.kind === 'round' ? 'round' : opOf(p));

export const EXTRA_PANES = {
    boxsign: {
        label: 'Boxed operation sign', grades: ['K', '1', '2', '3', '4'], ops: ['+', '-', '*', '/'], kind: 'extra', sentenceOff: true,
        placements: ['before'],
        accepts(p) { return !!WORD[opOf(p)]; },
        geom(p, c) { return { ...boxSign(c, opOf(p)), label: `the sign: ${WORD[opOf(p)]}` }; },
    },
    startarrow: {
        label: 'Start-here arrow (over the ones)', grades: ['1', '2', '3', '4'], ops: ['+', '-', '*'], kind: 'extra', sentenceOff: true,
        placements: ['over-ones'],
        accepts(p) { return ['+', '-', '*'].includes(opOf(p)); },
        geom(p, c) { return { ...startArrow(c), label: 'start at the ones' }; },
    },
    steps: {
        label: 'Step checklist strip', grades: ['1', '2', '3', '4'], ops: ['+', '-', '*', '/', 'round'], kind: 'extra', sentenceOff: true,
        placements: ['under', 'beside'],
        accepts(p) { return (Array.isArray(p.steps) && p.steps.length > 0) || !!DEFAULT_STEPS[stepsKey(p)]; },
        geom(p, c) {
            const steps = Array.isArray(p.steps) && p.steps.length ? p.steps.slice(0, 6).map(String) : DEFAULT_STEPS[stepsKey(p)];
            return { ...stepStrip(c, steps), label: 'steps' };
        },
    },
};
