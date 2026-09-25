// geo-compose.js - the shape COMPOSITIONS behind "Combine Shapes" (shapes_early:compose_shapes).
//
// Owner bug, 2026-09-25: the old item drew the answer shape in a "Result" panel beside the pieces,
// and its pieces (a trapezoid and a parallelogram, placed apart) did not make that result. Here
// every composition is WRITTEN AS COORDINATES: the target outline and each piece, in grid units,
// so the pieces tile the target exactly (no gap, no overlap, nothing left over). The generator
// deals one, turns and flips it (K.G.A.2: any orientation), and hands the pieces to the kit cell
// (sheet/cells/shape-grid.js), which draws the PIECES ONLY, side by side where they touch. The
// target travels in the payload for the key and the unit test (tests/scripts/ws-compose-unit.cjs
// proves, over a large sample, that the pieces' union is the target and that the pupil page never
// draws it); it is drawn only on the "which pieces make this shape?" task, where the shape is the
// given and the pieces are the answer.
//
// A shape is {name, pts: [[x, y] ...]} (a polygon, y down) or {name, arc: {cx, cy, r, a0, a1}} (a
// sector: a circle 0-360, a half circle 180 deg, a quarter circle 90 deg; degrees, clockwise on the
// page because y runs down).
//
// Families: 'square' (right angles: squares, rectangles, right triangles, the house pentagon, the
// right trapezoid), 'block' (the pattern-block lattice: equilateral triangles, 60/120 rhombi, the
// half-hexagon trapezoid, the hexagon) and 'curve' (halves and quarters of a circle, 1.G.A.2).
//
// Pure module: no DOM, no state, no Math.random. Every choice takes the caller's `pick` / `int`.

const S3 = Math.sqrt(3);

/* ============================================================== the compositions (grid units) */

// `group` is the target's kind for the "The shape made" option (5H): 0 triangle, 1 square or
// rectangle, 2 hexagon, 3 another straight-sided shape (pentagon, trapezoid, rhombus), 4 a curved
// shape (circle, half circle). `n` is the number of pieces (the "How many pieces" ladder).
const P = (name, pts) => ({ name, pts });
const A = (name, cx, cy, r, a0, a1) => ({ name, arc: { cx, cy, r, a0, a1 } });
const HEX = [[2, 0], [1, S3], [-1, S3], [-2, 0], [-1, -S3], [1, -S3]];   // side 2, flat top and bottom
const O = [0, 0];

export const COMPOSITIONS = Object.freeze([
    // ---- square family, two pieces
    { id: 'rect-2sq', family: 'square', group: 1, n: 2, target: P('rectangle', [[0, 0], [2, 0], [2, 1], [0, 1]]),
        parts: [P('square', [[0, 0], [1, 0], [1, 1], [0, 1]]), P('square', [[1, 0], [2, 0], [2, 1], [1, 1]])] },
    { id: 'sq-2tri', family: 'square', group: 1, n: 2, target: P('square', [[0, 0], [2, 0], [2, 2], [0, 2]]),
        parts: [P('triangle', [[0, 0], [2, 0], [0, 2]]), P('triangle', [[2, 0], [2, 2], [0, 2]])] },
    { id: 'rect-2tri', family: 'square', group: 1, n: 2, target: P('rectangle', [[0, 0], [3, 0], [3, 2], [0, 2]]),
        parts: [P('triangle', [[0, 0], [3, 0], [0, 2]]), P('triangle', [[3, 0], [3, 2], [0, 2]])] },
    { id: 'sq-2rect', family: 'square', group: 1, n: 2, target: P('square', [[0, 0], [2, 0], [2, 2], [0, 2]]),
        parts: [P('rectangle', [[0, 0], [1, 0], [1, 2], [0, 2]]), P('rectangle', [[1, 0], [2, 0], [2, 2], [1, 2]])] },
    { id: 'rect-2rect', family: 'square', group: 1, n: 2, target: P('rectangle', [[0, 0], [4, 0], [4, 1], [0, 1]]),
        parts: [P('rectangle', [[0, 0], [2, 0], [2, 1], [0, 1]]), P('rectangle', [[2, 0], [4, 0], [4, 1], [2, 1]])] },
    { id: 'tri-2right', family: 'square', group: 0, n: 2, target: P('triangle', [[0, 2], [4, 2], [2, 0]]),
        parts: [P('triangle', [[0, 2], [2, 2], [2, 0]]), P('triangle', [[2, 2], [4, 2], [2, 0]])] },
    { id: 'tri-2half', family: 'square', group: 0, n: 2, target: P('triangle', [[0, 2], [2, 2], [0, 0]]),
        parts: [P('triangle', [[0, 2], [1, 1], [0, 0]]), P('triangle', [[0, 2], [2, 2], [1, 1]])] },
    { id: 'house', family: 'square', group: 3, n: 2, target: P('pentagon', [[1, 0], [2, 1], [2, 3], [0, 3], [0, 1]]),
        parts: [P('triangle', [[0, 1], [1, 0], [2, 1]]), P('square', [[0, 1], [2, 1], [2, 3], [0, 3]])] },
    { id: 'trap-rect-tri', family: 'square', group: 3, n: 2, target: P('trapezoid', [[0, 0], [2, 0], [3, 2], [0, 2]]),
        parts: [P('square', [[0, 0], [2, 0], [2, 2], [0, 2]]), P('triangle', [[2, 0], [3, 2], [2, 2]])] },
    // ---- square family, three pieces
    { id: 'rect-3sq', family: 'square', group: 1, n: 3, target: P('rectangle', [[0, 0], [3, 0], [3, 1], [0, 1]]),
        parts: [P('square', [[0, 0], [1, 0], [1, 1], [0, 1]]), P('square', [[1, 0], [2, 0], [2, 1], [1, 1]]),
            P('square', [[2, 0], [3, 0], [3, 1], [2, 1]])] },
    { id: 'sq-rect-2tri', family: 'square', group: 1, n: 3, target: P('square', [[0, 0], [2, 0], [2, 2], [0, 2]]),
        parts: [P('rectangle', [[0, 0], [1, 0], [1, 2], [0, 2]]), P('triangle', [[1, 0], [2, 0], [1, 2]]),
            P('triangle', [[2, 0], [2, 2], [1, 2]])] },
    { id: 'house-3', family: 'square', group: 3, n: 3, target: P('pentagon', [[1, 0], [2, 1], [2, 3], [0, 3], [0, 1]]),
        parts: [P('triangle', [[0, 1], [1, 0], [1, 1]]), P('triangle', [[1, 0], [2, 1], [1, 1]]),
            P('square', [[0, 1], [2, 1], [2, 3], [0, 3]])] },
    { id: 'trap-3', family: 'square', group: 3, n: 3, target: P('trapezoid', [[0, 2], [1, 0], [3, 0], [4, 2]]),
        parts: [P('triangle', [[0, 2], [1, 0], [1, 2]]), P('square', [[1, 0], [3, 0], [3, 2], [1, 2]]),
            P('triangle', [[3, 0], [4, 2], [3, 2]])] },
    { id: 'tri-3', family: 'square', group: 0, n: 3, target: P('triangle', [[0, 2], [4, 2], [2, 0]]),
        parts: [P('triangle', [[0, 2], [2, 2], [1, 1]]), P('triangle', [[2, 2], [2, 0], [1, 1]]),
            P('triangle', [[2, 2], [4, 2], [2, 0]])] },
    // ---- pattern blocks, two pieces
    { id: 'hex-2trap', family: 'block', group: 2, n: 2, target: P('hexagon', HEX),
        parts: [P('trapezoid', [HEX[3], HEX[4], HEX[5], HEX[0]]), P('trapezoid', [HEX[0], HEX[1], HEX[2], HEX[3]])] },
    { id: 'rhom-2tri', family: 'block', group: 3, n: 2, target: P('rhombus', [[0, 0], [2, 0], [3, S3], [1, S3]]),
        parts: [P('triangle', [[0, 0], [2, 0], [1, S3]]), P('triangle', [[2, 0], [3, S3], [1, S3]])] },
    { id: 'tri-trap-tri', family: 'block', group: 0, n: 2, target: P('triangle', [[0, 2 * S3], [4, 2 * S3], [2, 0]]),
        parts: [P('trapezoid', [[0, 2 * S3], [4, 2 * S3], [3, S3], [1, S3]]), P('triangle', [[1, S3], [3, S3], [2, 0]])] },
    { id: 'trap-rhom-tri', family: 'block', group: 3, n: 2, target: P('trapezoid', [[0, S3], [1, 0], [3, 0], [4, S3]]),
        parts: [P('rhombus', [[0, S3], [1, 0], [3, 0], [2, S3]]), P('triangle', [[2, S3], [3, 0], [4, S3]])] },
    // ---- pattern blocks, three pieces
    { id: 'hex-3rhom', family: 'block', group: 2, n: 3, target: P('hexagon', HEX),
        parts: [0, 2, 4].map((i) => P('rhombus', [O, HEX[i], HEX[i + 1], HEX[(i + 2) % 6]])) },
    { id: 'hex-trap-rhom-tri', family: 'block', group: 2, n: 3, target: P('hexagon', HEX),
        parts: [P('trapezoid', [HEX[3], HEX[4], HEX[5], HEX[0]]), P('rhombus', [HEX[3], O, HEX[1], HEX[2]]),
            P('triangle', [O, HEX[0], HEX[1]])] },
    { id: 'trap-3tri', family: 'block', group: 3, n: 3, target: P('trapezoid', [[0, S3], [1, 0], [3, 0], [4, S3]]),
        parts: [P('triangle', [[0, S3], [1, 0], [2, S3]]), P('triangle', [[1, 0], [3, 0], [2, S3]]),
            P('triangle', [[2, S3], [3, 0], [4, S3]])] },
    { id: 'tri-rhom-2tri', family: 'block', group: 0, n: 3, target: P('triangle', [[0, 2 * S3], [4, 2 * S3], [2, 0]]),
        parts: [P('rhombus', [[0, 2 * S3], [2, 2 * S3], [3, S3], [1, S3]]), P('triangle', [[2, 2 * S3], [4, 2 * S3], [3, S3]]),
            P('triangle', [[1, S3], [3, S3], [2, 0]])] },
    // ---- halves and quarters of a circle (1.G.A.2)
    { id: 'circle-2half', family: 'curve', group: 4, n: 2, target: A('circle', 0, 0, 2, 0, 360),
        parts: [A('half circle', 0, 0, 2, 180, 360), A('half circle', 0, 0, 2, 0, 180)] },
    { id: 'half-2quarter', family: 'curve', group: 4, n: 2, target: A('half circle', 0, 0, 2, 180, 360),
        parts: [A('quarter circle', 0, 0, 2, 180, 270), A('quarter circle', 0, 0, 2, 270, 360)] },
    { id: 'circle-half-2quarter', family: 'curve', group: 4, n: 3, target: A('circle', 0, 0, 2, 0, 360),
        parts: [A('half circle', 0, 0, 2, 0, 180), A('quarter circle', 0, 0, 2, 180, 270), A('quarter circle', 0, 0, 2, 270, 360)] },
]);

// Wrong piece sets for the "which pieces make this shape?" task that no composition lists: the
// curved family has only three compositions, so it needs a few of its own. Each is a set of pieces
// in the same units; it is offered only when its total area differs from the target's, so it can
// never make the shape.
const CURVE_DECOYS = Object.freeze([
    [A('half circle', 0, 0, 2, 180, 360), A('quarter circle', 0, 0, 2, 270, 360)],
    [A('quarter circle', 0, 0, 2, 180, 270), A('quarter circle', 0, 0, 2, 270, 360), A('quarter circle', 0, 0, 2, 0, 90),
        A('half circle', 0, 0, 2, 0, 180)],
    [A('half circle', 0, 0, 2, 180, 360), A('half circle', 0, 0, 2, 0, 180), A('quarter circle', 0, 0, 2, 0, 90)],
    [A('quarter circle', 0, 0, 2, 180, 270)],
]);

/* ============================================================== names */

/** The names on the shape bank (K-1 vocabulary, lower case as the pupil writes them). */
export const SHAPE_NAMES = Object.freeze(['triangle', 'square', 'rectangle', 'rhombus', 'trapezoid', 'pentagon', 'hexagon',
    'circle', 'half circle', 'quarter circle']);

// Names that are ALSO true of a shape (a square is a rectangle, a rhombus and a trapezoid under
// the inclusive definitions of 3.G.A.1): never offered as a WRONG name beside it.
const ALSO_TRUE = Object.freeze({
    square: ['rectangle', 'rhombus', 'trapezoid'],
    rectangle: ['trapezoid'],
    rhombus: ['trapezoid'],
});
// The near names a pupil confuses with each answer, most likely first (one side more or fewer,
// the other four-sided names, the whole and its half).
const NEAR = Object.freeze({
    triangle: ['square', 'rectangle', 'pentagon', 'rhombus'],
    square: ['triangle', 'pentagon', 'hexagon', 'circle'],
    rectangle: ['square', 'triangle', 'pentagon'],
    rhombus: ['triangle', 'square', 'hexagon'],
    trapezoid: ['triangle', 'rectangle', 'hexagon', 'pentagon'],
    pentagon: ['hexagon', 'square', 'triangle'],
    hexagon: ['pentagon', 'trapezoid', 'rhombus'],
    circle: ['half circle', 'hexagon', 'square'],
    'half circle': ['circle', 'quarter circle', 'triangle'],
});

/** True when `name` is a wrong name for a shape whose best name is `answer`. */
export function isWrongName(name, answer) {
    return name !== answer && !(ALSO_TRUE[answer] || []).includes(name);
}

/* ============================================================== geometry */

const r6 = (v) => Math.round(v * 1e6) / 1e6;

/** The shape turned `rot` degrees (clockwise on the page) about the origin, then mirrored when `flip`. */
export function transformShape(s, rot, flip) {
    const t = rot * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
    const f = flip ? -1 : 1;
    const pt = ([x, y]) => { const X = x * c - y * sn, Y = x * sn + y * c; return [r6(f * X), r6(Y)]; };
    if (s.pts) {
        const pts = s.pts.map(pt);
        return { name: s.name, pts: flip ? pts.reverse() : pts };
    }
    const a = s.arc;
    const [cx, cy] = pt([a.cx, a.cy]);
    let a0 = a.a0 + rot, a1 = a.a1 + rot;
    if (flip) { const b0 = 180 - a1, b1 = 180 - a0; a0 = b0; a1 = b1; }
    const k = Math.floor(a0 / 360);
    return { name: s.name, arc: { cx, cy, r: a.r, a0: r6(a0 - 360 * k), a1: r6(a1 - 360 * k) } };
}

/** Points that bound a shape (a sector samples its arc every 15 degrees). */
export function outlinePoints(s) {
    if (s.pts) return s.pts;
    const a = s.arc;
    const out = a.a1 - a.a0 >= 360 ? [] : [[a.cx, a.cy]];
    for (let d = a.a0; d <= a.a1 + 1e-9; d += 15) {
        const t = d * Math.PI / 180;
        out.push([a.cx + a.r * Math.cos(t), a.cy + a.r * Math.sin(t)]);
    }
    return out;
}

export function bbox(shapes) {
    const pts = shapes.flatMap(outlinePoints);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/** The shape moved by (dx, dy). */
export function moveShape(s, dx, dy) {
    if (s.pts) return { name: s.name, pts: s.pts.map(([x, y]) => [r6(x + dx), r6(y + dy)]) };
    return { name: s.name, arc: { ...s.arc, cx: r6(s.arc.cx + dx), cy: r6(s.arc.cy + dy) } };
}

/** Area of a polygon (shoelace) or a sector. */
export function shapeArea(s) {
    if (s.pts) {
        let a = 0;
        s.pts.forEach(([x, y], i) => { const [X, Y] = s.pts[(i + 1) % s.pts.length]; a += x * Y - X * y; });
        return Math.abs(a) / 2;
    }
    return Math.PI * s.arc.r * s.arc.r * (s.arc.a1 - s.arc.a0) / 360;
}

/** The corners of a polygon (the hint dots): its vertices, a straight angle dropped. */
export function corners(s) {
    if (!s.pts) return [];
    const n = s.pts.length;
    return s.pts.filter((p, i) => {
        const a = s.pts[(i + n - 1) % n], b = s.pts[(i + 1) % n];
        return Math.abs((p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])) > 1e-6;
    });
}

/* ============================================================== dealing */

/** Turns that keep a family on its own lattice (squares: quarter turns; blocks: sixth turns). */
const TURNS = { square: [0, 90, 180, 270], block: [0, 60, 120, 180, 240, 300], curve: [0, 90, 180, 270] };

/**
 * The compositions an option set allows: `groups` the ticked "shape made" kinds (null = all),
 * `n` the number of pieces (2 or 3).
 */
export function compositionsFor({ groups = null, n = 2 } = {}) {
    const g = Array.isArray(groups) && groups.length ? groups : null;
    return COMPOSITIONS.filter((c) => c.n === n && (!g || g.includes(c.group)));
}

/**
 * One composition turned and flipped, moved so its outline starts at (0, 0).
 * `pick(list)` and `int(lo, hi)` are the caller's (seeded) random helpers.
 */
export function dealComposition(list, { pick, int }) {
    const c = pick(list);
    const rot = pick(TURNS[c.family]);
    const flip = int(0, 1) === 1;
    const target0 = transformShape(c.target, rot, flip);
    const parts0 = c.parts.map((s) => transformShape(s, rot, flip));
    const b = bbox([target0]);
    return {
        id: c.id, family: c.family, group: c.group, rot, flip,
        target: moveShape(target0, -b.x0, -b.y0),
        parts: parts0.map((s) => moveShape(s, -b.x0, -b.y0)),
    };
}

/** Three names for the bank: the answer, the name of a piece when that is wrong, a near name. */
export function nameBank(answer, pieceNames, { shuffle }) {
    const wrong = [];
    for (const nm of pieceNames) if (isWrongName(nm, answer) && !wrong.includes(nm)) { wrong.push(nm); break; }
    for (const nm of NEAR[answer] || []) {
        if (wrong.length >= 2) break;
        if (isWrongName(nm, answer) && !wrong.includes(nm)) wrong.push(nm);
    }
    return shuffle([answer, ...wrong.slice(0, 2)]);
}

/**
 * The two wrong piece sets for "which pieces make this shape?": the pieces of other compositions
 * of the same family and piece count (or the curved decoys), each with a total area that differs
 * from the target's, so it cannot make the shape. Returned in their own units, un-turned.
 */
export function decoyPieceSets(deal, n, { shuffle }) {
    const want = shapeArea(deal.target);
    const kindsOf = (parts) => parts.map((s) => s.name).sort().join('+');
    const mine = kindsOf(deal.parts);
    let pool = COMPOSITIONS.filter((c) => c.family === deal.family && c.id !== deal.id).map((c) => c.parts);
    if (deal.family === 'curve') pool = pool.concat(CURVE_DECOYS);
    // Sets of the same number of pieces first, so the count of pieces never tells the answer.
    const mixed = shuffle(pool.slice());
    const ordered = mixed.filter((p) => p.length === n).concat(mixed.filter((p) => p.length !== n));
    const seen = new Set([mine]);
    const out = [];
    for (const parts of ordered) {
        const area = parts.reduce((s, p) => s + shapeArea(p), 0);
        const k = kindsOf(parts);
        if (Math.abs(area - want) < 1e-3 * want || seen.has(k)) continue;
        seen.add(k);
        out.push(parts);
        if (out.length === 2) break;
    }
    return out;
}
