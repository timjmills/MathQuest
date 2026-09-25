// js/modules/sheet/providers/geometry.js
// Skill providers for build lane geometry (design/BUILD_LIST.md). Every member reads the item's
// sheet-kit payload (`q.cell.payload`, plain data written by gen-geometry.js), never the drawing.
//
// Combine Shapes (shapes_early:compose_shapes) — the misconception bank:
//   names-a-piece      names one of the pieces, not the whole shape ("two triangles make a triangle")
//   miscounts-sides    counts the seam as a side, or a side too few: the name one side out
//   wrong-pieces       picks pieces that are too small or too big to fill the shape
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { registerSkill } from '../contract.js';
import { chooseWrong, strings, step, obj } from './util.js';

const payloadOf = (q) => (q && q.cell && q.cell.payload) || obj(q && q.payload) || {};
const LETTERS = ['A', 'B', 'C', 'D'];
const COUNT = ['', 'one', 'two', 'three', 'four'];
const plural = (nm) => (nm === 'rhombus' ? 'rhombuses' : `${nm}s`);
const article = (nm) => (/^[aeiou]/.test(nm) ? 'an' : 'a');

/** "two triangles", "a square and a triangle". */
function piecesPhrase(parts) {
    const counts = {};
    (parts || []).forEach((s) => { counts[s.name] = (counts[s.name] || 0) + 1; });
    const out = Object.entries(counts).map(([n, c]) => (c === 1 ? `${article(n)} ${n}` : `${COUNT[c]} ${plural(n)}`));
    return out.length === 1 ? out[0] : `${out.slice(0, -1).join(', ')} and ${out[out.length - 1]}`;
}
const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());

/** The corners and sides of the whole shape, as the pupil counts them. */
function outsideOf(p) {
    const t = p.target || {};
    if (t.arc) return t.arc.a1 - t.arc.a0 >= 360 ? 'The outside is one curved line. It has no corners.'
        : 'The outside is a curved line and one straight side.';
    const n = (p.corners || []).length || (t.pts || []).length;
    return `Look at the outside. It has ${n} corners and ${n} sides.`;
}

function area(s) {
    if (s.pts) {
        let a = 0;
        s.pts.forEach(([x, y], i) => { const [X, Y] = s.pts[(i + 1) % s.pts.length]; a += x * Y - X * y; });
        return Math.abs(a) / 2;
    }
    return Math.PI * s.arc.r * s.arc.r * (s.arc.a1 - s.arc.a0) / 360;
}
const total = (parts) => (parts || []).reduce((a, s) => a + area(s), 0);

const isPieces = (q) => payloadOf(q).task === 'pieces';
const isWrite = (q) => payloadOf(q).response === 'write';
const sayOf = (q) => {
    const p = payloadOf(q);
    return `${cap(piecesPhrase(p.parts))} make ${article(p.answer || '')} ${p.answer || '__'}.`;
};

const COMPOSE_STEPS = {
    check: ['Look at the pieces where they join.', 'Look at the outside of the whole shape. Count its corners.', 'Check the name of the whole shape.'],
    write: ['Look at the pieces where they join.', 'Look at the outside of the whole shape. Count its corners.', 'Find its name in the bank. Write it.'],
    pieces: ['Look at the shape. Count its corners.', 'Look at each set of pieces. Slide them together in your head.', 'Check the set that fills the shape with no gaps.'],
};

function stringsBy() {
    const defs = {
        check: { iCan: 'I Can put shapes together to make a new shape', instructionKey: 'compose-name', steps: COMPOSE_STEPS.check,
            say: '__ make __.', sayValues: sayOf },
        write: { iCan: 'I Can put shapes together and name the new shape', instructionKey: 'compose-name-write', steps: COMPOSE_STEPS.write,
            say: '__ make __.', sayValues: sayOf },
        pieces: { iCan: 'I Can find the shapes that make a bigger shape', instructionKey: 'compose-pieces', steps: COMPOSE_STEPS.pieces,
            say: '__ make __.', sayValues: sayOf },
    };
    const fns = Object.fromEntries(Object.entries(defs).map(([k, d]) => [k, strings(d)]));
    const which = (q) => (isPieces(q) ? 'pieces' : isWrite(q) ? 'write' : 'check');
    const fn = (ref = {}) => {
        let k = 'check';
        try {
            // a role that asks with no item (the sheet header) names the task by the skill's options
            if (ref && ref.q) k = which(ref.q);
            // (by the item's printFormat, which the page meta carries, or by the skill's options)
            else if (ref && /^shape-grid-(pieces|write)$/.test(String(ref.printFormat || ''))) k = String(ref.printFormat).slice(11);
            else if (ref && ref.opts) k = ref.opts.compose === 'pieces' ? 'pieces' : ref.opts.response === 'write' ? 'write' : 'check';
        } catch (e) { k = 'check'; }
        const out = fns[k](ref);
        out.sayFill = (item) => { try { return sayOf(item); } catch (e) { return ''; } };
        return out;
    };
    fn.def = defs.check;
    return fn;
}

function composeSteps(q) {
    const p = payloadOf(q);
    if (p.task === 'pieces') {
        const L = LETTERS[p.correct];
        return [
            step(outsideOf(p)),
            step(`Set ${L} is ${piecesPhrase(p.choices[p.correct].parts)}. Slid together, they fill the shape with no gaps.`),
            step(`Check ${L}.`, [{ slot: 'choice', value: L }]),
        ];
    }
    const slot = p.response === 'write' ? 'answer' : 'choice';
    return [
        step(`The pieces are ${piecesPhrase(p.parts)}.`),
        step(outsideOf(p)),
        step(`${p.response === 'write' ? 'Write' : 'Check'} ${p.answer}.`, [{ slot, value: p.answer }]),
    ];
}

function composeWrong(q) {
    const p = payloadOf(q);
    if (p.task === 'pieces') {
        const want = total(p.target ? [p.target] : p.parts);
        const c = (p.choices || []).map((ch, i) => {
            if (i === p.correct) return null;
            const t = total(ch.parts);
            return { value: LETTERS[i], slot: 'choice', misconception: 'wrong-pieces',
                explain: `Set ${LETTERS[i]} is ${t < want ? 'too small' : 'too big'} to fill the shape: it leaves ${t < want ? 'a gap' : 'pieces sticking out'}.` };
        });
        return chooseWrong(q, c);
    }
    const slot = p.response === 'write' ? 'answer' : 'choice';
    const names = p.names || [];
    const pieceNames = (p.parts || []).map((s) => s.name);
    const c = names.filter((nm) => nm !== p.answer).map((nm) => (pieceNames.includes(nm)
        ? { value: nm, slot, misconception: 'names-a-piece', explain: `Named one piece (${nm}), not the whole shape.` }
        : { value: nm, slot, misconception: 'miscounts-sides', explain: `Counted the corners wrong: the whole shape is ${article(p.answer)} ${p.answer}.` }));
    return chooseWrong(q, c);
}

registerSkill('shapes_early:compose_shapes', {
    strings: stringsBy(),
    misconceptions: ['names-a-piece', 'miscounts-sides', 'wrong-pieces'],
    workedSteps: composeSteps,
    wrongAnswer: composeWrong,
});

/** The build-lane geometry skills that carry a real provider. */
export const GEO_PROVIDER_SKILLS = Object.freeze(['shapes_early:compose_shapes']);
