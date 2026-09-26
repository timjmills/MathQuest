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
import { chooseWrong, strings, step, clampSteps, obj } from './util.js';

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

/* ============================================================ the area and perimeter family */
// The figure items (shape-grid kind `figure`, gen-geo-kit.js). The misconception bank:
//   M-AP1  added the sides for an area (found the perimeter)       M-AP2  multiplied for a perimeter
//   M-AP3  added one length and one width only                    M-AP4  missed a row of squares
//   M-AP5  forgot to halve (a triangle)                            M-AP6  missed a side of a composite
//   M-AP7  multiplied the outside lengths of a composite            M-AP8  used the whole perimeter for
//                                                                          one length and one width

const figOf = (q) => payloadOf(q);
const askOf = (q, id) => (figOf(q).ask || []).find((a) => a.id === id);
const unitOf = (q) => figOf(q).unit || '';
const sidesOf = (q) => {
    const poly = figOf(q).poly || [];
    return poly.map((A, i) => { const B = poly[(i + 1) % poly.length]; return Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) * 100) / 100; });
};
const bboxWH = (poly) => { const xs = poly.map((v) => v[0]), ys = poly.map((v) => v[1]); return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; };
const givenNumber = (q) => Number(((figOf(q).given || [])[0] || '').replace(/^[^=]*=\s*/, '').replace(/[^0-9.].*$/, ''));

function figSteps(q) {
    const p = figOf(q);
    const sides = sidesOf(q), u = unitOf(q);
    const out = [];
    const a = askOf(q, 'area'), per = askOf(q, 'perimeter'), side = askOf(q, 'side');
    if (p.grid === 'squares' && a) {
        const [w, h] = bboxWH(p.poly || []);
        out.push(step('Touch each unit square once as you count.'));
        out.push(step((p.poly || []).length === 4 ? `There are ${h} rows of ${w} squares.` : 'Count the squares row by row.'));
        out.push(step(`There are ${a.ans} squares. Write ${a.ans}.`, [{ slot: 'area', value: String(a.ans) }]));
        return out;
    }
    if (p.grid === 'squares' && per) {
        out.push(step('Start at a corner. Count the unit edges round the outside.'));
        out.push(step(`The sides are ${sides.join(', ')} units.`));
        out.push(step(`${sides.join(' + ')} = ${per.ans}. Write ${per.ans}.`, [{ slot: 'perimeter', value: String(per.ans) }]));
        return out;
    }
    if (p.height && a) {
        const b = ((p.edges || [])[0] || {}).v, h = p.height.v;
        out.push(step(`The base is ${b} ${u}. The height is ${h} ${u}.`));
        out.push(step(`${b} × ${h} = ${b * h}.`));
        out.push(step(`Half of ${b * h} is ${a.ans}. Write ${a.ans}.`, [{ slot: 'area', value: String(a.ans) }]));
        return out;
    }
    if (side) {
        const byPerimeter = /Perimeter/.test((p.given || [])[0] || '');
        const known = (p.edges || []).find((e) => e.show !== false && e.v !== '?');
        const G = givenNumber(q), kv = known ? known.v : 0;
        out.push(step(`Find the side marked ?. The ${byPerimeter ? 'perimeter' : 'area'} is ${G}.`));
        if (byPerimeter) {
            out.push(step(`One length and one width make half the perimeter: ${G} ÷ 2 = ${G / 2}.`));
            out.push(step(`${G / 2} − ${kv} = ${side.ans}.`, [{ slot: 'side', value: String(side.ans) }]));
        } else {
            out.push(step(`Area = length × width, so ${kv} × ? = ${G}.`));
            out.push(step(`${G} ÷ ${kv} = ${side.ans}.`, [{ slot: 'side', value: String(side.ans) }]));
        }
        return out;
    }
    const marks = [];
    out.push(step(`Read every side: ${sides.join(', ')} ${u}.`));
    if (per) {
        out.push(step(`Add all ${sides.length} sides: ${sides.join(' + ')} = ${per.ans}.`));
        marks.push({ slot: 'perimeter', value: String(per.ans) });
    }
    if (a) {
        if ((p.poly || []).length === 4) {
            const [w, h] = bboxWH(p.poly);
            out.push(step(`Area = length × width = ${w} × ${h} = ${a.ans}.`));
        } else {
            out.push(step('Split the shape into two rectangles along the dotted line.'));
            out.push(step(`Find each area and add them: ${a.ans}.`));
        }
        marks.push({ slot: 'area', value: String(a.ans) });
    }
    out.push(step(`Write ${marks.map((m) => m.value).join(' and ')}.`, marks));
    return clampSteps(out);
}

function figWrong(q) {
    const p = figOf(q);
    const sides = sidesOf(q);
    const a = askOf(q, 'area'), per = askOf(q, 'perimeter'), side = askOf(q, 'side');
    const both = !!(a && per);
    const one = (id, v, misconception, explain) => (both
        ? { value: id === 'area' ? `${per.ans}, ${v}` : `${v}, ${a.ans}`, slot: id,
            slots: { perimeter: String(id === 'perimeter' ? v : per.ans), area: String(id === 'area' ? v : a.ans) }, misconception, explain }
        : { value: v, slot: id, misconception, explain });
    const c = [];
    if (side) {
        const known = (p.edges || []).find((e) => e.show !== false && e.v !== '?');
        const G = givenNumber(q), kv = known ? known.v : 0;
        if (/Perimeter/.test((p.given || [])[0] || '')) c.push(one('side', G - kv, 'M-AP8', 'Took the side away from the whole perimeter, not from half of it.'));
        else c.push(one('side', G - kv, 'M-AP2', 'Took the side away from the area; the area is length × width, so divide.'));
        return chooseWrong(q, c);
    }
    if (p.height && a) {
        c.push(one('area', a.ans * 2, 'M-AP5', 'Multiplied the base by the height but did not halve it.'));
        return chooseWrong(q, c);
    }
    const [w, h] = bboxWH(p.poly || []);
    if (a) {
        if (p.grid === 'squares') c.push(one('area', a.ans - w, 'M-AP4', 'Missed a row of squares.'));
        else if ((p.poly || []).length > 4) c.push(one('area', w * h, 'M-AP7', 'Multiplied the outside lengths: the cut-out part was counted too.'));
        c.push(one('area', sides.reduce((s, v) => s + v, 0), 'M-AP1', 'Added the sides: that is the perimeter, not the area.'));
    }
    if (per) {
        c.push(one('perimeter', w + h, 'M-AP3', 'Added one length and one width only: the other sides were left out.'));
        if ((p.poly || []).length > 4) c.push(one('perimeter', per.ans - Math.min(...sides), 'M-AP6', 'Missed one of the short sides.'));
        else c.push(one('perimeter', w * h, 'M-AP2', 'Multiplied the sides: that is the area, not the perimeter.'));
    }
    return chooseWrong(q, c);
}

const FIG_DEFS = {
    area_unit_squares: { iCan: 'I Can find area by counting unit squares', instructionKey: 'count-squares',
        steps: ['Touch each square once.', 'Count row by row.', 'Write how many squares.'], say: 'The area is __ square units.',
        sayValues: (q) => [askOf(q, 'area').ans] },
    perimeter_grid: { iCan: 'I Can find perimeter by counting units', instructionKey: 'count-edges',
        steps: ['Start at a corner.', 'Count each unit edge round the outside.', 'Stop where you started. Write the number.'], say: 'The perimeter is __.',
        sayValues: (q) => [`${q.ans} ${unitOf(q) || 'units'}`] },
    perimeter: { iCan: 'I Can find the perimeter of a rectangle', instructionKey: 'perimeter-or-side',
        steps: ['Find the length of every side.', 'Opposite sides are the same length.', 'Add all four sides.'], say: 'The answer is __.',
        sayValues: (q) => [`${q.ans} ${unitOf(q)}`.trim()] },
    area: { iCan: 'I Can find the area of a rectangle', instructionKey: 'area-or-side',
        steps: ['Find the length and the width.', 'Multiply the length by the width.', 'Write the area in square units.'], say: 'The answer is __.',
        sayValues: (q) => [q.ans] },
    area_perimeter: { iCan: 'I Can find the perimeter and the area', instructionKey: 'area-perimeter',
        steps: ['Perimeter: add all the sides.', 'Area: multiply the length by the width.', 'Write each in its box.'], say: 'The perimeter is __. The area is __.',
        sayValues: (q) => String(q.ans).split(', ') },
    composite_shapes: { iCan: 'I Can find the perimeter of a composite shape', instructionKey: 'composite-perimeter',
        steps: ['Find the length of every side.', 'Work out a side with no number from the sides opposite it.', 'Add all the sides.'], say: 'The perimeter is __.',
        sayValues: (q) => [String(q.ans).split(', ')[0]] },
    area_polygon_decompose: { iCan: 'I Can find the area of a shape by splitting it', instructionKey: 'composite-area',
        steps: ['Split the shape into two rectangles.', 'Find the area of each rectangle.', 'Add the two areas.'], say: 'The area is __.',
        sayValues: (q) => [q.ans] },
    area_triangle: { iCan: 'I Can find the area of a triangle', instructionKey: 'triangle-area',
        steps: ['Find the base and the height.', 'Multiply the base by the height.', 'Halve it.'], say: 'The area is __.',
        sayValues: (q) => [q.ans] },
};
for (const [id, def] of Object.entries(FIG_DEFS)) {
    registerSkill(`area_perimeter:${id}`, {
        strings: strings(def),
        misconceptions: ['M-AP1', 'M-AP2', 'M-AP3', 'M-AP4', 'M-AP5', 'M-AP6', 'M-AP7', 'M-AP8'],
        workedSteps: (q) => clampSteps(figSteps(q)),
        wrongAnswer: figWrong,
    });
}
export const GEO_FIGURE_SKILLS = Object.freeze(Object.keys(FIG_DEFS).map((id) => `area_perimeter:${id}`));

/* ============================================================ fill a shape with blocks */
// compose_hexagon, compose_rect_from_squares (shape-grid kind `fill`). The misconception bank:
//   M-F1  left a gap: one block too few          M-F2  overlapped: one block too many
//   M-F3  counted the sides of the shape, not the blocks inside it
const FILL_PLURAL = { triangle: 'triangles', rhombus: 'rhombuses', trapezoid: 'trapezoids', square: 'squares' };
const fillName = (q) => FILL_PLURAL[payloadOf(q).block] || 'blocks';

function fillSteps(q) {
    const p = payloadOf(q);
    const n = Number(p.count) || 0;
    const one = p.block || 'block';
    return [
        step(`Look at the ${one}. Every block is the same size.`),
        step(`Start in a corner of the ${p.shapeName || 'shape'}. Draw the lines of one ${one}.`),
        step(`Fill the rest with no gaps. Count the ${fillName(q)}: ${n}.`, [{ slot: 'count', value: String(n) }]),
    ];
}

function fillWrong(q) {
    const p = payloadOf(q);
    const n = Number(p.count) || 0;
    const sides = (p.target || []).length;
    const c = [];
    if (n > 2) c.push({ value: n - 1, slot: 'count', misconception: 'M-F1', explain: 'Left a gap: one block is missing.' });
    c.push({ value: n + 1, slot: 'count', misconception: 'M-F2', explain: 'Two blocks overlap: one block too many.' });
    if (sides && sides !== n) c.push({ value: sides, slot: 'count', misconception: 'M-F3', explain: 'Counted the sides of the shape, not the blocks inside it.' });
    return chooseWrong(q, c);
}

const FILL_DEFS = {
    compose_hexagon: { iCan: 'I Can fill a hexagon with pattern blocks' },
    compose_rect_from_squares: { iCan: 'I Can fill a rectangle with squares' },
};
for (const [id, def] of Object.entries(FILL_DEFS)) {
    registerSkill(`shapes_early:${id}`, {
        strings: strings({
            iCan: def.iCan, instructionKey: 'fill-blocks',
            steps: ['Put one block in a corner.', 'Fill the shape with no gaps and no overlaps.', 'Count the blocks. Write how many.'],
            say: '__ blocks fill the shape.',
            sayValues: (q) => [payloadOf(q).count],
        }),
        misconceptions: ['M-F1', 'M-F2', 'M-F3'],
        workedSteps: (q) => clampSteps(fillSteps(q)),
        wrongAnswer: fillWrong,
    });
}
export const GEO_FILL_SKILLS = Object.freeze(Object.keys(FILL_DEFS).map((id) => `shapes_early:${id}`));

/* ============================================================ volume (solid-kit) */
// area_perimeter:volume, area_perimeter:volume_composite. The misconception bank:
//   M-V1  added the edges              M-V2  multiplied two edges only (an area)
//   M-V3  multiplied every edge shown on a composite (the whole box round it)
//   M-V4  found only one of the two prisms
function volSteps(q) {
    const p = payloadOf(q);
    const a = (p.ask || [])[0] || {};
    const vals = (p.labels || []).map((l) => l.v);
    if (a.id === 'edge') {
        const known = vals.filter((v) => v !== '?');
        const V = Number(String((p.given || [''])[0]).replace(/[^0-9]+/g, ' ').trim().split(' ')[0]);
        return [step(`Multiply the two edges you know: ${known.join(' × ')} = ${known[0] * known[1]}.`),
            step(`Divide the volume: ${V} ÷ ${known[0] * known[1]} = ${a.ans}.`, [{ slot: 'edge', value: String(a.ans) }])];
    }
    if ((p.parts || []).length === 2) {
        return [step('Split the solid into two rectangular prisms.'),
            step(`Find each volume: ${p.parts[0]} and ${p.parts[1]}.`),
            step(`Add them: ${p.parts[0]} + ${p.parts[1]} = ${a.ans}.`, [{ slot: 'volume', value: String(a.ans) }])];
    }
    return [step(`Read the edges: ${vals.join(', ')}.`),
        step(`Multiply: ${vals.join(' × ')} = ${a.ans}.`, [{ slot: 'volume', value: String(a.ans) }])];
}
function volWrong(q) {
    const p = payloadOf(q);
    const a = (p.ask || [])[0] || {};
    const vals = (p.labels || []).map((l) => l.v).filter((v) => v !== '?').map(Number);
    const c = [];
    if (a.id === 'edge') {
        const V = Number(String((p.given || [''])[0]).replace(/[^0-9]+/g, ' ').trim().split(' ')[0]);
        c.push({ value: V - vals[0] * vals[1], slot: 'edge', misconception: 'M-V2', explain: 'Took away instead of dividing.' });
        return chooseWrong(q, c);
    }
    if ((p.parts || []).length === 2) {
        c.push({ value: Math.max(...p.parts), slot: 'volume', misconception: 'M-V4', explain: 'Found only one of the two prisms.' });
        const bx = p.boxes || [];
        const L = Math.max(...bx.map((b) => b.x + b.l)), D = Math.max(...bx.map((b) => b.y + b.w)), H = Math.max(...bx.map((b) => b.z + b.h));
        c.push({ value: L * D * H, slot: 'volume', misconception: 'M-V3', explain: 'Multiplied the outside edges: the missing corner was counted too.' });
        return chooseWrong(q, c);
    }
    c.push({ value: vals.reduce((s, v) => s + v, 0), slot: 'volume', misconception: 'M-V1', explain: 'Added the edges instead of multiplying.' });
    if (vals.length === 3) c.push({ value: vals[0] * vals[1], slot: 'volume', misconception: 'M-V2', explain: 'Multiplied two edges only: that is the area of one face.' });
    return chooseWrong(q, c);
}
const VOL_DEFS = {
    volume: { iCan: 'I Can find the volume of a rectangular prism', instructionKey: 'volume',
        steps: ['Find the length, the width and the height.', 'Multiply them.', 'Write the volume in cubic units.'] },
    volume_composite: { iCan: 'I Can find the volume of two joined prisms', instructionKey: 'volume-composite',
        steps: ['Split the solid into two prisms.', 'Find the volume of each.', 'Add the two volumes.'] },
};
for (const [id, def] of Object.entries(VOL_DEFS)) {
    registerSkill(`area_perimeter:${id}`, {
        strings: strings({ iCan: def.iCan, instructionKey: def.instructionKey, steps: def.steps,
            say: 'The answer is __.', sayValues: (q) => { const a = (payloadOf(q).ask || [])[0] || {}; return [`${a.ans} ${a.unit || ''}`.trim()]; } }),
        misconceptions: ['M-V1', 'M-V2', 'M-V3', 'M-V4'],
        workedSteps: (q) => clampSteps(volSteps(q)),
        wrongAnswer: volWrong,
    });
}

/* ============================================================ coordinates (coord-grid) */
// coordinate_q1 / coordinate_all / coordinate_graph (read or plot), geo_reflect / geo_rotate /
// geo_translate (which grid). The misconception bank:
//   M-C1  swapped x and y             M-C2  lost the minus sign        M-C3  counted from 1, not 0
//   M-T1  flipped over the other axis M-T2  turned the other way       M-T3  slid the other way
const minus = (v) => (v < 0 ? `−${-v}` : String(v));
function coordSteps(q) {
    const p = payloadOf(q);
    const pts = p.points || [];
    if (p.kind === 'transform') {
        return [step('Look at one corner of the shape.'), step('Move that corner as the question says.'),
            step(`Find the grid with the corner there: ${LETTERS[p.correct]}.`, [{ slot: 'choice', value: LETTERS[p.correct] }])];
    }
    const pt = pts[0] || { x: 0, y: 0, label: 'A' };
    if (p.kind === 'plot') {
        return [step(`Start at 0. Go along the x-axis to ${minus(pt.x)}.`), step(`Go ${pt.y < 0 ? 'down' : 'up'} to ${minus(pt.y)}. Put a dot. Write ${pt.label}.`)];
    }
    return [step(`Start at 0. Go along to ${pt.label}: x is ${minus(pt.x)}.`, [{ slot: 'x0', value: String(pt.x) }]),
        step(`Go ${pt.y < 0 ? 'down' : 'up'} to ${pt.label}: y is ${minus(pt.y)}.`, [{ slot: 'y0', value: String(pt.y) }]),
        step(`Write (${minus(pt.x)}, ${minus(pt.y)}).`)];
}
function coordWrong(q) {
    const p = payloadOf(q);
    const c = [];
    if (p.kind === 'transform') {
        const w = (p.correct + 1) % ((p.choices || []).length || 3);
        c.push({ value: LETTERS[w], slot: 'choice', slots: { choice: LETTERS[w] }, misconception: 'M-T1', explain: 'Chose a shape moved the wrong way.' });
        return chooseWrong(q, c);
    }
    const pts = p.points || [];
    if (!pts.length || p.kind === 'plot') return null;
    const sw = pts.map((pt) => ({ x: pt.y, y: pt.x }));
    if (pts.some((pt) => pt.x !== pt.y)) {
        const slots = {};
        sw.forEach((pt, i) => { slots[`x${i}`] = String(pt.x); slots[`y${i}`] = String(pt.y); });
        c.push({ value: sw.map((pt) => `${pt.x}, ${pt.y}`).join(', '), slots, misconception: 'M-C1', explain: 'Wrote the y-coordinate first.' });
    }
    if (pts.some((pt) => pt.x < 0 || pt.y < 0)) {
        const slots = {};
        pts.forEach((pt, i) => { slots[`x${i}`] = String(Math.abs(pt.x)); slots[`y${i}`] = String(Math.abs(pt.y)); });
        c.push({ value: pts.map((pt) => `${Math.abs(pt.x)}, ${Math.abs(pt.y)}`).join(', '), slots, misconception: 'M-C2', explain: 'Lost the minus sign.' });
    }
    return chooseWrong(q, c);
}
const COORD_DEFS = {
    coordinate_q1: { iCan: 'I Can read and plot points on a grid' },
    coordinate_all: { iCan: 'I Can read and plot points in all four quadrants' },
    coordinate_graph: { iCan: 'I Can read and plot points on a grid' },
    geo_reflect: { iCan: 'I Can reflect a shape over an axis', move: true },
    geo_rotate: { iCan: 'I Can turn a shape around the origin', move: true },
    geo_translate: { iCan: 'I Can slide a shape on a grid', move: true },
};
for (const [id, def] of Object.entries(COORD_DEFS)) {
    registerSkill(`coordinates:${id}`, {
        strings: strings({
            iCan: def.iCan, instructionKey: def.move ? 'transform-choice' : 'coord-read-plot',
            steps: def.move ? ['Look at one corner of the shape.', 'Move it as the question says.', 'Check the grid that shows it.']
                : ['Start at 0.', 'Go along the x-axis first.', 'Then go up or down the y-axis.'],
            say: def.move ? 'Grid __ shows the shape moved.' : 'Point A is at __.',
            sayValues: (q) => {
                const p = payloadOf(q);
                if (p.kind === 'transform') return [LETTERS[p.correct]];
                const pt = (p.points || [])[0] || { x: 0, y: 0 };
                return [`(${minus(pt.x)}, ${minus(pt.y)})`];
            },
        }),
        misconceptions: def.move ? ['M-T1', 'M-T2', 'M-T3'] : ['M-C1', 'M-C2', 'M-C3'],
        workedSteps: (q) => clampSteps(coordSteps(q)),
        wrongAnswer: coordWrong,
    });
}
