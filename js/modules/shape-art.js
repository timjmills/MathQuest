// shape-art.js - Black-and-white shape, solid and net drawings, their facts, and the item builders
// that use them (count sides / vertices / faces / edges, "Click ALL the shapes with N …", nets).
//
// One drawing set for every skill that shows a 2D shape, a 3D solid or a net, on paper and on
// screen. WORKSHEET_DESIGN_STANDARD INK-1 / section 4.2: ink outlines on paper white, no colour,
// no emoji. Strokes are non-scaling, so a drawing keeps its weight at every size: 2 px = 1.5 pt
// (the outline of a shape being judged), 1 px = 0.75 pt (right-angle marks, the fold lines of a
// net - partitions of a shape), 0.67 px = 0.5 pt (hidden edges of a solid: solid, never dashed,
// LS-2). A drawing never carries the shape's name: the name is the answer.
//
// Used by gen-geometry.js (shapes_early:name_2d_shapes, name_3d_shapes). Any generator may build
// its items from these: the builders fill a question object the same way the generators do.
import { pick, shuffle, randInt } from './utils.js';
import { MONO } from './design-tokens.js';

const INK = MONO.ink;
const PAPER = MONO.paper;
const attr = (px, fill = PAPER) => `fill="${fill}" stroke="${INK}" stroke-width="${px}" stroke-linejoin="round" vector-effect="non-scaling-stroke"`;
const OUT = attr(2);
const HAIR = attr(1, 'none');
const HID = attr(0.67, 'none');
const f1 = (n) => +n.toFixed(1);
const poly = (n, r, rot = -Math.PI / 2, cx = 60, cy = 60) => Array.from({ length: n }, (_, i) => {
    const a = rot + (Math.PI * 2 / n) * i;
    return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`;
}).join(' ');
const corner = (x, y, dx, dy) => `<polyline points="${x + dx},${y} ${x + dx},${y + dy} ${x},${y + dy}" ${HAIR}/>`;

/* ================================================================== 2D shapes (viewBox 120) */

/** Every 2D drawing, keyed by a lower-case name, and the facts a counting item needs. */
export const SHAPES_2D = {
    circle: { svg: `<circle cx="60" cy="60" r="48" ${OUT}/>`, sides: 0, curved: true },
    oval: { svg: `<ellipse cx="60" cy="60" rx="54" ry="34" ${OUT}/>`, sides: 0, curved: true },
    triangle: { svg: `<polygon points="60,12 5,107 115,107" ${OUT}/>`, sides: 3 },
    'right triangle': { svg: `<polygon points="14,106 14,16 106,106" ${OUT}/>` + corner(14, 106, 10, -10), sides: 3, family: 'triangle' },
    square: { svg: `<rect x="14" y="14" width="92" height="92" ${OUT}/>` + corner(14, 14, 10, 10) + corner(106, 14, -10, 10) + corner(14, 106, 10, -10) + corner(106, 106, -10, -10), sides: 4 },
    rectangle: { svg: `<rect x="6" y="28" width="108" height="64" ${OUT}/>` + corner(6, 28, 10, 10) + corner(114, 28, -10, 10), sides: 4 },
    rhombus: { svg: `<polygon points="29,41 77,55 91,103 43,89" ${OUT}/>`, sides: 4 },
    diamond: { svg: `<polygon points="60,6 98,60 60,114 22,60" ${OUT}/>`, sides: 4, family: 'rhombus' },
    trapezoid: { svg: `<polygon points="32,28 88,28 114,96 6,96" ${OUT}/>`, sides: 4 },
    pentagon: { svg: `<polygon points="${poly(5, 52, -Math.PI / 2, 60, 64)}" ${OUT}/>`, sides: 5 },
    'house pentagon': { svg: `<polygon points="60,10 108,48 108,108 12,108 12,48" ${OUT}/>`, sides: 5, family: 'pentagon' },
    hexagon: { svg: `<polygon points="${poly(6, 52)}" ${OUT}/>`, sides: 6 },
    'L hexagon': { svg: `<polygon points="14,10 56,10 56,64 108,64 108,110 14,110" ${OUT}/>`, sides: 6, family: 'hexagon' },
    heptagon: { svg: `<polygon points="${poly(7, 54, -Math.PI / 2, 60, 63)}" ${OUT}/>`, sides: 7 },
    octagon: { svg: `<polygon points="${poly(8, 54, -Math.PI / 2 + Math.PI / 8)}" ${OUT}/>`, sides: 8 },
    star: { svg: `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + Math.PI / 5 * i, r = i % 2 ? 22 : 54; return `${f1(60 + r * Math.cos(a))},${f1(64 + r * Math.sin(a))}`; }).join(' ')}" ${OUT}/>`, sides: 10, concave: true },
};
/** The drawing alone, for callers that only need the picture. */
export const MONO_2D = Object.fromEntries(Object.entries(SHAPES_2D).map(([k, v]) => [k, v.svg]));

/* ================================================================== 3D solids (viewBox 120) */

// Oblique drawings, depth up and to the right. The edges at the back are hidden: thin solid lines.
export const SOLIDS = {
    cube: { faces: 6, edges: 12, vertices: 8,
        svg: `<polygon points="14,46 80,46 80,112 14,112" ${OUT}/><polygon points="14,46 40,20 106,20 80,46" ${OUT}/>`
            + `<polygon points="80,46 106,20 106,86 80,112" ${OUT}/><polyline points="14,112 40,86 106,86" ${HID}/><line x1="40" y1="86" x2="40" y2="20" ${HID}/>` },
    'rectangular prism': { faces: 6, edges: 12, vertices: 8,
        svg: `<polygon points="4,52 88,52 88,108 4,108" ${OUT}/><polygon points="4,52 30,28 114,28 88,52" ${OUT}/>`
            + `<polygon points="88,52 114,28 114,84 88,108" ${OUT}/><polyline points="4,108 30,84 114,84" ${HID}/><line x1="30" y1="84" x2="30" y2="28" ${HID}/>` },
    'triangular prism': { faces: 5, edges: 9, vertices: 6,
        svg: `<polygon points="8,104 66,104 37,52" ${OUT}/><polygon points="37,52 81,22 110,74 66,104" ${OUT}/>`
            + `<polyline points="8,104 52,74 110,74" ${HID}/><line x1="52" y1="74" x2="81" y2="22" ${HID}/>` },
    'square pyramid': { faces: 5, edges: 8, vertices: 5,
        svg: `<polygon points="60,10 10,104 82,104" ${OUT}/><polygon points="60,10 82,104 110,82" ${OUT}/>`
            + `<polyline points="10,104 38,82 110,82" ${HID}/><line x1="38" y1="82" x2="60" y2="10" ${HID}/>` },
    'triangular pyramid': { faces: 4, edges: 6, vertices: 4,
        svg: `<polygon points="56,10 10,102 104,98" ${OUT}/>`
            + `<polyline points="10,102 64,78 104,98" ${HID}/><line x1="64" y1="78" x2="56" y2="10" ${HID}/>` },
    // Curved solids: a counting item asks only what has one plain answer at K-2 (White Rose Y2:
    // a cylinder has 2 flat faces and a curved surface, a cone 1 flat face and 1 vertex).
    sphere: { flatFaces: 0, vertices: 0, curved: true,
        svg: `<circle cx="60" cy="60" r="50" ${OUT}/><path d="M10,60 A50,14 0 0 0 110,60" ${HAIR}/><path d="M10,60 A50,14 0 0 1 110,60" ${HID}/>` },
    cylinder: { flatFaces: 2, vertices: 0, curved: true,
        svg: `<path d="M22,26 L22,96 A38,12 0 0 0 98,96 L98,26" ${OUT}/><ellipse cx="60" cy="26" rx="38" ry="12" ${OUT}/><path d="M22,96 A38,12 0 0 1 98,96" ${HID}/>` },
    cone: { flatFaces: 1, vertices: 1, curved: true,
        svg: `<path d="M60,10 L18,98 A42,13 0 0 0 102,98 Z" ${OUT}/><path d="M18,98 A42,13 0 0 1 102,98" ${HID}/>` },
};
SOLIDS.pyramid = SOLIDS['square pyramid'];
export const MONO_3D = Object.fromEntries(Object.entries(SOLIDS).map(([k, v]) => [k, v.svg]));
export const POLYHEDRA = ['cube', 'rectangular prism', 'triangular prism', 'square pyramid', 'triangular pyramid'];

/* ================================================================== nets */

// A net is drawn in three passes so its outline is heavy and its fold lines are hairlines,
// with no outline geometry to compute: a 4 px stroke round every face, then every face filled
// white (which covers the inner half of every stroke, so a shared edge vanishes and an outer
// edge keeps 2 px), then a 1 px stroke round every face (the folds).
const S = 20;    // drawing units per net unit
const sq = (x, y, w = 1, h = 1) => ({ t: 'poly', p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] });
const tri = (...p) => ({ t: 'poly', p });
const circ = (cx, cy, r) => ({ t: 'circle', cx, cy, r });
const sector = (cx, cy, r, a0, a1) => ({ t: 'sector', cx, cy, r, a0, a1 });
function faceSvg(f, a) {
    if (f.t === 'circle') return `<circle cx="${f1(f.cx * S)}" cy="${f1(f.cy * S)}" r="${f1(f.r * S)}" ${a}/>`;
    if (f.t === 'sector') {
        const pt = (ang) => `${f1((f.cx + f.r * Math.cos(ang)) * S)},${f1((f.cy + f.r * Math.sin(ang)) * S)}`;
        return `<path d="M${f1(f.cx * S)},${f1(f.cy * S)} L${pt(f.a0)} A${f1(f.r * S)},${f1(f.r * S)} 0 0 1 ${pt(f.a1)} Z" ${a}/>`;
    }
    return `<polygon points="${f.p.map(([x, y]) => `${f1(x * S)},${f1(y * S)}`).join(' ')}" ${a}/>`;
}
function bounds(faces) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    for (const f of faces) {
        if (f.t === 'poly') f.p.forEach(([x, y]) => add(x, y));
        else { add(f.cx - f.r, f.cy - f.r); add(f.cx + f.r, f.cy + f.r); }
    }
    return [x0 * S, y0 * S, x1 * S, y1 * S];
}
/** The SVG of a net (an array of faces), sized by `width` (CSS). */
export function netSVG(faces, width = 'min(150px,100%)') {
    const [x0, y0, x1, y1] = bounds(faces);
    const pad = 4;
    const vb = `${f1(x0 - pad)} ${f1(y0 - pad)} ${f1(x1 - x0 + pad * 2)} ${f1(y1 - y0 + pad * 2)}`;
    const body = faces.map(f => faceSvg(f, `fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"`)).join('')
        + faces.map(f => faceSvg(f, `fill="${PAPER}" stroke="none"`)).join('')
        + faces.map(f => faceSvg(f, HAIR)).join('');
    return `<svg viewBox="${vb}" role="img" aria-label="a net" style="display:block;margin:0 auto;width:${width};height:auto;overflow:visible;">${body}</svg>`;
}
const cells = (list) => list.map(([x, y]) => sq(x, y));
const h3 = Math.sqrt(3) / 2;

/** One net for each solid a "What shape does this net make?" item can show. */
export const NETS = {
    cube: cells([[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]),
    'rectangular prism': [sq(0, 0.8, 2, 1.2), sq(2, 0.8, 0.8, 1.2), sq(2.8, 0.8, 2, 1.2), sq(4.8, 0.8, 0.8, 1.2), sq(0, 0, 2, 0.8), sq(0, 2, 2, 0.8)],
    'triangular prism': [sq(0, 0, 1.4, 2.2), sq(1.4, 0, 1.4, 2.2), sq(2.8, 0, 1.4, 2.2),
        tri([1.4, 0], [2.8, 0], [2.1, -1.4 * h3]), tri([1.4, 2.2], [2.8, 2.2], [2.1, 2.2 + 1.4 * h3])],
    'square pyramid': [sq(1.3, 1.3, 1.6, 1.6), tri([1.3, 1.3], [2.9, 1.3], [2.1, 0]), tri([2.9, 1.3], [2.9, 2.9], [4.2, 2.1]),
        tri([1.3, 2.9], [2.9, 2.9], [2.1, 4.2]), tri([1.3, 1.3], [1.3, 2.9], [0, 2.1])],
    'triangular pyramid': null,   // drawn below
    cylinder: [sq(0, 1.3, 3.2, 1.8), circ(1.6, 0.65, 0.65), circ(1.6, 3.75, 0.65)],
    cone: [sector(1.6, 0, 2.3, Math.PI / 2 - 1.05, Math.PI / 2 + 1.05), circ(1.6, 2.3 + 0.8, 0.8)],
};
// A triangular pyramid's net: one big triangle cut into four by its midlines.
{
    const A = [0, 2 * 2 * h3], B = [4, 2 * 2 * h3], C = [2, 0];
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const ab = mid(A, B), bc = mid(B, C), ca = mid(C, A);
    NETS['triangular pyramid'] = [tri(A, ab, ca), tri(ab, B, bc), tri(ca, bc, C), tri(ab, bc, ca)];
}

// Cube nets on unit squares: which fold into a cube and which do not (a 2 x 2 block, or five in
// a row, always overlaps). The non-nets are the misconceptions a "Click ALL the nets" page tests.
const CUBE_NETS = [
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],     // the cross
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2], [1, 3]],     // the T
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],     // 1-4-1, flaps at opposite ends
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],     // the staircase
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],     // 1-4-1, flaps one apart
    [[0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, -1]].map(([x, y]) => [x, y + 1]),   // 2-3-1
];
const CUBE_NON_NETS = [
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],     // a 2 x 3 block
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],     // a 2 x 2 block in it
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],     // five in a row
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]],     // a 2 x 2 block, staircase tail
];

/* ================================================================== picture helpers */

/** One picture option tile for a "Click ALL the …" item: the drawing only, no name, no emoji. */
export const shapeTile = (inner) => `<svg viewBox="0 0 120 120" role="img" aria-label="shape" style="display:block;margin:0 auto;width:min(150px,100%);height:auto;overflow:visible;">${inner}</svg>`;
/** The single drawing a "What shape is this?" / "How many …?" item shows. */
export const shapeFigure = (inner) => `<div style="text-align:center;"><svg viewBox="0 0 120 120" role="img" aria-label="a shape" style="display:block;margin:0 auto;width:min(240px,80%);height:auto;max-width:100%;overflow:visible;">${inner}</svg></div>`;
const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
/** The printed key for a picture option set: which pictures (1st, 2nd …) the pupil rings. */
export function pictureKey(opts) {
    const at = opts.map((o, i) => (o.correct ? ORD[i] : null)).filter(Boolean);
    return at.length > 1 ? `${at.slice(0, -1).join(', ')} and ${at[at.length - 1]}` : at[0] || '';
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const title = (s) => s.replace(/\b[a-z]/g, c => c.toUpperCase());

/** Fill `q` as a multi-select picture item: 1-2 (or up to `maxRight`) right pictures among `n`. */
function pictureSelect(q, { text, right, wrong, n = 4, maxRight = 2, hint, skillLabel }) {
    const k = Math.min(right.length ? randInt(1, Math.min(maxRight, n - 1)) : 0, n);
    const chosen = shuffle([...shuffle([...right]).slice(0, k), ...shuffle([...wrong]).slice(0, n - k)]);
    const opts = chosen.map((c, i) => ({ id: 'opt' + i, svg: c.svg, label: '', correct: c.ok }));
    q.text = text;
    q.ans = opts.filter(o => o.correct).map(o => o.id);
    q.options = opts;
    q.printAnswer = pictureKey(opts);
    q.answerType = 'multi-select-check';
    q.printFormat = 'multi-select';
    q.hint = hint;
    q.skillLabel = skillLabel;
}

/* ================================================================== item builders */

// The 2D shapes a counting item draws: every polygon (regular and irregular), never the star.
const COUNT_2D = ['triangle', 'right triangle', 'square', 'rectangle', 'rhombus', 'trapezoid', 'pentagon',
    'house pentagon', 'hexagon', 'L hexagon', 'heptagon', 'octagon'];

/** "How many sides / vertices (corners) does this shape have?" — `what` 'sides' | 'vertices'. */
export function countShape2d(q, what, { maxSides = 8, curved = true } = {}) {
    const pool = COUNT_2D.filter(k => SHAPES_2D[k].sides <= maxSides);
    // A circle has 0 sides and 0 vertices: one item in eight, the edge case a K pupil must meet.
    const key = curved && Math.random() < 0.125 ? 'circle' : pick(pool);
    const n = SHAPES_2D[key].sides;
    q.text = what === 'sides' ? 'How many sides does this shape have?' : 'How many vertices (corners) does this shape have?';
    q.ans = n;
    q.answerType = 'number';
    q.visual = shapeFigure(SHAPES_2D[key].svg);
    q.hint = what === 'sides'
        ? 'Put your finger on one side. Count each straight side as you go round, until you are back where you started.'
        : 'A vertex is a corner, where two sides meet. Count each corner as you go round.';
    q.skillLabel = '2D Shapes';
    q.printFormat = 'geometry-2d-shapes';
}

/** "Click ALL the shapes with N sides / vertices." */
export function selectShape2d(q, what) {
    const n = pick([3, 4, 5, 6]);
    const item = (k) => ({ svg: shapeTile(SHAPES_2D[k].svg), ok: SHAPES_2D[k].sides === n });
    const all = COUNT_2D.map(item);
    pictureSelect(q, {
        text: `Click ALL the shapes with ${plural(n, what === 'sides' ? 'side' : 'vertex', what === 'sides' ? 'sides' : 'vertices')}.`,
        right: all.filter(x => x.ok), wrong: all.filter(x => !x.ok), maxRight: 2,
        hint: what === 'sides' ? `Count the sides of each shape. Click every shape that has ${n}.` : `Count the corners of each shape. Click every shape that has ${n}.`,
        skillLabel: '2D Shapes',
    });
}

/** "How many faces / edges / vertices does this shape have?" — prisms and pyramids only. */
export function countSolid(q, what) {
    const key = pick(POLYHEDRA);
    q.text = `How many ${what} does this shape have?`;
    q.ans = SOLIDS[key][what];
    q.answerType = 'number';
    q.visual = shapeFigure(SOLIDS[key].svg);
    q.hint = {
        faces: 'A face is a flat side. Count the faces you can see, then the ones at the back. The thin lines are the hidden edges.',
        edges: 'An edge is where two faces meet. Count the thick lines and the thin lines at the back.',
        vertices: 'A vertex is a corner, where edges meet. Count the corners at the front and at the back.',
    }[what];
    q.skillLabel = '3D Shapes';
    q.printFormat = 'geometry-3d-shapes';
}

/** "Click ALL the shapes with N faces / vertices." Faces: prisms and pyramids; vertices: every solid. */
export function selectSolid(q, what) {
    const keys = what === 'faces' ? POLYHEDRA : [...POLYHEDRA, 'sphere', 'cylinder', 'cone'];
    const count = (k) => (what === 'faces' ? SOLIDS[k].faces : SOLIDS[k].vertices);
    const n = pick([...new Set(keys.map(count))]);
    const all = keys.map(k => ({ svg: shapeTile(SOLIDS[k].svg), ok: count(k) === n }));
    pictureSelect(q, {
        text: `Click ALL the shapes with ${plural(n, what === 'faces' ? 'face' : 'vertex', what)}.`,
        right: all.filter(x => x.ok), wrong: all.filter(x => !x.ok), maxRight: 2,
        hint: what === 'faces' ? `Count the flat faces of each shape, the hidden ones too. Click every shape with ${n}.`
            : `Count the corners of each shape. A round shape may have none. Click every shape with ${n}.`,
        skillLabel: '3D Shapes',
    });
}

const NET_NAMES = Object.keys(NETS);
/** "What shape does this net make?" — the name, from four. */
export function netNameItem(q) {
    const key = pick(NET_NAMES);
    q.text = 'What shape does this net make?';
    q.ans = title(key);
    q.answerType = 'multiple-choice';
    q.options = shuffle([title(key), ...shuffle(NET_NAMES.filter(k => k !== key)).slice(0, 3).map(title)]);
    q.visual = `<div style="text-align:center;">${netSVG(NETS[key], 'min(240px,80%)')}</div>`;
    q.hint = 'Picture folding the net up along the lines. Count the faces and look at their shapes: squares, rectangles, triangles or circles.';
    q.skillLabel = '3D Shapes';
    q.printFormat = 'geometry-3d-shapes';
}

/** "Click ALL the nets that fold to make a cube." — real nets among non-nets. */
export function cubeNetsItem(q) {
    const item = (c, ok) => ({ svg: netSVG(cells(c), 'min(130px,100%)'), ok });
    pictureSelect(q, {
        text: 'Click ALL the nets that fold to make a cube.',
        right: CUBE_NETS.map(c => item(c, true)), wrong: CUBE_NON_NETS.map(c => item(c, false)), maxRight: 3,
        hint: 'A cube has 6 square faces. Picture folding each net: a block of 4 squares, or 5 squares in a row, will not close.',
        skillLabel: '3D Shapes',
    });
}
