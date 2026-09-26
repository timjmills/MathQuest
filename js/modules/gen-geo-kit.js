// gen-geo-kit.js - build lane geometry: the items that draw on the kit's shape-grid cell
// (sheet/cells/shape-grid.js, kind `figure`: sheet/cells/shape-figure.js). gen-geometry.js calls in.
//
// The area and perimeter family (options-r3 critic, 2026-09-25): every item was a legacy colour SVG
// with a blue definition box and a second "Answer: ___" line, printed ONE item to an A4 page. Now each
// item is a figure in grid units with its measures to find in the cell's own boxes, the same drawing
// on paper and on the three screen hosts:
//
//   area_unit_squares  a rectangle or L-shape of unit squares; Area = [ ] square units
//   perimeter_grid     the same, "Perimeter = [ ] units"; or a labelled rectangle or L-shape
//   perimeter / area   a labelled rectangle or square; or the same with one side "?" and the
//                      perimeter / area given (the "missing side" form)
//   area_perimeter     a labelled rectangle or square: Perimeter = [ ], Area = [ ]
//   composite_shapes   a labelled L- or T-shape: the perimeter, or the perimeter and the area
//   area_polygon_decompose   an L-, T- or U-shape: the area (the split line is the hint)
//   area_triangle      a right, acute or obtuse triangle: its base, its dotted height; the area
//
// Options every item reads: `labels` (5E, Figure labels: all / some / none), `level` (Support level:
// 3 traced, 2 the hint - touch dots, the formula, the split line - 1 the figure alone). The formula
// box that used to print on every item is now that level-2 hint (OC8).
//
// Pure of the DOM; reads the seeded Math.random through utils.

import { state } from './state.js';
import { randInt, shuffle, pick } from './utils.js';
import { optionsFor } from './skill-options.js';
import { k2Twin, fadeRung, coordPicture } from './sheet/index.js';

/* ============================================================ options and the page position */

/** A skill option's value for the skill being generated (its default when unset), or undefined. */
export function geoOpt(id) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { def = null; }
    if (!def) return undefined;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined;
    return v === undefined ? def.default : v;
}
// Page position: a printed page passes state.itemIndex; live play counts its own items.
let _at = 0;
let _liveCursor = -1;
const _perms = {};
export function geoBegin() { _at = Number.isFinite(state.itemIndex) ? state.itemIndex : ++_liveCursor; }
/** A page-long permutation of 0..n-1 (shuffled at the page's first item), read at the position. */
export function geoDeal(key, n) {
    if (n <= 1) return 0;
    const k = `${key}:${n}`;
    if (_at === 0 || !_perms[k]) _perms[k] = shuffle(Array.from({ length: n }, (_, i) => i));
    return _perms[k][((_at % n) + n) % n];
}
/** The Support level for this item: the ticked levels dealt most-support-first down a page. */
export function geoLevel(fallback = 1) {
    let t = geoOpt('level');
    if (typeof t === 'number') t = [t];
    t = Array.isArray(t) ? t.map(Number).filter(Number.isFinite) : [];
    if (!t.length) return fallback;
    t = t.slice().sort((x, y) => y - x);
    return t[fadeRung(_at, t.length, state.itemCount, Number.isFinite(state.itemIndex))];
}

/* ============================================================ shapes in grid units */

// Every outline runs clockwise on the page from its top-left corner (y down).
export const rectPoly = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
/** An L: a W x H rectangle with a cw x ch block cut from its top-right corner. */
export const lPoly = (W, H, cw, ch) => [[0, 0], [W - cw, 0], [W - cw, ch], [W, ch], [W, H], [0, H]];
/** A T: a tw x th bar on a sw x sh stem, `off` in from the left. */
export const tPoly = (tw, th, sw, sh, off) => [[0, 0], [tw, 0], [tw, th], [off + sw, th], [off + sw, th + sh], [off, th + sh], [off, th], [0, th]];
/** A U: a w x h rectangle with a cw x ch notch cut down from the top, `off` in from the left. */
export const uPoly = (w, h, cw, ch, off) => [[0, 0], [off, 0], [off, ch], [off + cw, ch], [off + cw, 0], [w, 0], [w, h], [0, h]];

export const edgeLen = (poly, i) => { const a = poly[i], b = poly[(i + 1) % poly.length]; return Math.hypot(b[0] - a[0], b[1] - a[1]); };
export const perimeterOf = (poly) => poly.reduce((s, _, i) => s + edgeLen(poly, i), 0);
export function areaOf(poly) {
    let a = 0;
    poly.forEach(([x, y], i) => { const [X, Y] = poly[(i + 1) % poly.length]; a += x * Y - X * y; });
    return Math.abs(a) / 2;
}

/**
 * The side labels. `all` writes every side; `some` leaves out the sides the pupil can work out
 * (`derivable`: a rectangle's second length and width, the step of an L); `none` writes none.
 * `missing` is the side whose label is "?".
 */
export function edgesFor(poly, { labels = 'all', derivable = [], missing = -1 } = {}) {
    return poly.map((_, i) => ({ i, v: i === missing ? '?' : Math.round(edgeLen(poly, i) * 100) / 100,
        show: i === missing || labels === 'all' || (labels === 'some' && !derivable.includes(i)) }));
}

/** The Figure-labels choice of the skill being generated, or `dflt`. */
export function labelsOpt(dflt = 'all') {
    const v = geoOpt('labels');
    return v === undefined || v === null ? dflt : v;
}

const UNITS = ['cm', 'm', 'in', 'ft'];
/** The square unit an area is written in: sq cm, sq m, sq in, sq ft. */
const sq = (u) => `sq ${u}`;

/** Hand an item to the kit cell: q.cell, the screen twin, and the answer fields. */
function finish(q, payload, { text, ans, printFormat, skillLabel, hint }) {
    q.cell = { template: 'shape-grid', v: 1, payload };
    q.visual = k2Twin('shape-grid', payload);
    q.text = text;
    q.ans = ans;
    q.answerType = typeof ans === 'number' ? 'number' : 'text';
    q.options = [];
    q.hint = hint;
    q.printFormat = printFormat;
    q.skillLabel = skillLabel;
    q.figure = { poly: payload.poly, ask: payload.ask.map(a => ({ id: a.id, ans: a.ans })) };
    return q;
}

/** The support flags of a figure at this item's Support level. */
function supportOf(lvl) { return { hint: lvl >= 2, traced: lvl >= 3 }; }

/* ============================================================ area_unit_squares */

export function areaUnitSquares(q) {
    geoBegin();
    // "Which shapes" (forms 0 rectangles, 1 L-shapes) is read here, and a page deals three
    // rectangles to two L-shapes by position (reproducible: the page's seed decides it)
    const forms = geoOpt('forms');
    const kinds = ['rectangle', 'L'];
    const pool = Array.isArray(forms) && forms.length ? forms.map((i) => kinds[i]).filter(Boolean) : ['rectangle', 'L', 'rectangle', 'L', 'rectangle'];
    const shape = pool[geoDeal('aus-shape', pool.length)] || 'rectangle';
    q._variant = shape;
    // "Area up to" (band): the shape is drawn within it, never redrawn into a different kind
    const band = Number(geoOpt('band')) || 42;
    let poly;
    for (let tries = 0; tries < 60; tries++) {
        if (shape === 'rectangle') poly = rectPoly(randInt(2, 8), randInt(2, 6));
        else {
            const W = randInt(3, 7), H = randInt(3, 6);
            poly = lPoly(W, H, randInt(1, W - 2), randInt(1, H - 2));
        }
        if (areaOf(poly) <= band) break;
    }
    if (areaOf(poly) > band) poly = shape === 'rectangle' ? rectPoly(3, 3) : lPoly(4, 3, 2, 1);
    const area = areaOf(poly);
    const lvl = geoLevel(1);
    const labels = labelsOpt('none');
    const payload = {
        kind: 'figure', poly, grid: 'squares', unit: '',
        edges: labels === 'none' ? [] : edgesFor(poly, { labels }),
        ask: [{ id: 'area', label: 'Area', unit: 'square units', ans: area }],
        dots: 'squares', formula: 'Count every square once.', ...supportOf(lvl),
    };
    return finish(q, payload, {
        text: shape === 'L' ? 'Count the unit squares. What is the area of this L-shape?' : 'Count the unit squares. What is the area?',
        ans: area, printFormat: 'area-unit-squares', skillLabel: 'Unit Squares',
        hint: 'Count each square once. Touch each one as you count.',
    });
}

/* ============================================================ perimeter_grid */

export function perimeterGrid(q) {
    geoBegin();
    const roll = Math.random();
    const kind = roll < 0.40 ? 'rectangle' : roll < 0.65 ? 'L' : 'labeled';
    const lvl = geoLevel(1);
    if (kind !== 'labeled') {
        let poly;
        if (kind === 'rectangle') poly = rectPoly(randInt(2, 8), randInt(2, 6));
        else {
            const W = randInt(4, 7), H = randInt(4, 6);
            poly = lPoly(W, H, randInt(1, W - 2), randInt(1, H - 2));
        }
        const per = perimeterOf(poly);
        const labels = labelsOpt('none');
        return finish(q, {
            kind: 'figure', poly, grid: 'squares', unit: '',
            edges: labels === 'none' ? [] : edgesFor(poly, { labels }),
            ask: [{ id: 'perimeter', label: 'Perimeter', unit: 'units', ans: per }],
            dots: 'edges', formula: 'Count every unit round the outside.', ...supportOf(lvl),
        }, {
            text: kind === 'L' ? 'Count the outside edges of this L-shape. What is the perimeter?' : 'Count the outside edges. What is the perimeter?',
            ans: per, printFormat: 'perimeter-grid', skillLabel: 'Perim Grid',
            hint: 'Count the unit edges all the way round the outside. Do not count the lines inside.',
        });
    }
    // a labelled rectangle or L-shape, no squares
    const isL = Math.random() < 0.35;
    let poly, derivable;
    if (!isL) { const w = randInt(3, 12), h = randInt(2, Math.min(9, w)); poly = rectPoly(w, h); derivable = [1, 2]; }
    else { const W = randInt(5, 10), H = randInt(4, 8); poly = lPoly(W, H, randInt(1, W - 2), randInt(1, H - 2)); derivable = [1, 2]; }
    const unit = pick(UNITS);
    const per = perimeterOf(poly);
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit,
        edges: edgesFor(poly, { labels: labelsOpt('all'), derivable }),
        ask: [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }],
        formula: 'Perimeter = add all the sides', ...supportOf(lvl),
    }, {
        text: isL ? 'Find the perimeter of this composite shape.' : 'Find the perimeter of this rectangle.',
        ans: per, printFormat: 'perimeter-grid', skillLabel: 'Perim Grid',
        hint: 'Add the lengths of all the sides. A side with no number is as long as the side, or the sides, opposite it.',
    });
}

/* ============================================================ perimeter / area (standard + missing side) */

/** A labelled rectangle or square no bigger than `maxDim`. */
function rectDims(maxDim, minL = 3) {
    if (Math.random() < 0.3) { const s = randInt(2, Math.max(2, maxDim)); return { w: s, h: s, square: true }; }
    const l = randInt(minL, Math.max(minL, maxDim));
    const w = randInt(2, Math.max(2, Math.min(l - 1, maxDim - 1)));
    return { w: l, h: w, square: false };
}

export function perimeterFigure(q, variant, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const unit = pick(UNITS);
    const d = rectDims(maxDim);
    const poly = rectPoly(d.w, d.h);
    const per = perimeterOf(poly);
    if (variant === 'missing') {
        const missing = pick([1, 2]);   // the right side (a width) or the bottom (a length)
        const ans = edgeLen(poly, missing);
        // the pupil needs one length and one width: the missing side's partner is not written
        const partner = (missing + 2) % 4;
        const edges = edgesFor(poly, { labels: 'all', missing }).map(e => (e.i === partner ? { ...e, show: false } : e));
        return finish(q, {
            kind: 'figure', poly, grid: 'none', unit, edges,
            given: [`Perimeter = ${per} ${unit}`],
            ask: [{ id: 'side', label: '?', unit, ans }],
            formula: 'The two lengths and the two widths make the perimeter.', ...supportOf(lvl),
        }, {
            text: `The perimeter is ${per} ${unit}. What is the missing side?`, ans, printFormat: 'perimeter-missing', skillLabel: 'Perimeter · Missing Side',
            hint: 'Halve the perimeter: that is one length and one width. Take away the side you know.',
        });
    }
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit,
        edges: edgesFor(poly, { labels: labelsOpt('all'), derivable: [1, 2] }),
        ask: [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }],
        formula: 'Perimeter = add all the sides', ...supportOf(lvl),
    }, {
        text: d.square ? 'Find the perimeter of this square.' : 'Find the perimeter of this rectangle.', ans: per,
        printFormat: 'geometry-perimeter', skillLabel: 'Perimeter',
        hint: 'Add the lengths of all four sides.',
    });
}

export function areaFigure(q, variant, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const unit = pick(UNITS);
    const d = rectDims(Math.min(12, maxDim), 2);
    const poly = rectPoly(d.w, d.h);
    const area = areaOf(poly);
    if (variant === 'missing') {
        const missing = pick([1, 2]);
        const ans = edgeLen(poly, missing);
        const partner = (missing + 2) % 4;
        const edges = edgesFor(poly, { labels: 'all', missing }).map(e => (e.i === partner ? { ...e, show: false } : e));
        return finish(q, {
            kind: 'figure', poly, grid: 'none', unit, edges,
            given: [`Area = ${area} ${sq(unit)}`],
            ask: [{ id: 'side', label: '?', unit, ans }],
            formula: 'Area = length × width', ...supportOf(lvl),
        }, {
            text: `The area is ${area} ${sq(unit)}. What is the missing side?`, ans, printFormat: 'area-missing', skillLabel: 'Area · Missing Side',
            hint: 'Area = length × width. Divide the area by the side you know.',
        });
    }
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit,
        edges: edgesFor(poly, { labels: labelsOpt('all'), derivable: [1, 2] }),
        ask: [{ id: 'area', label: 'Area', unit: sq(unit), ans: area }],
        formula: 'Area = length × width', ...supportOf(lvl),
    }, {
        text: d.square ? 'Find the area of this square.' : 'Find the area of this rectangle.', ans: area,
        printFormat: 'geometry-area', skillLabel: 'Area',
        hint: 'Multiply the length by the width.',
    });
}

/* ============================================================ perimeter_intro */

/**
 * Perimeter Intro (3.MD.D.8, sum the sides). Kinds (option `shapes`, 5H): 0 a rectangle or a
 * square, 1 a triangle, 2 a shape with 5 or 6 sides (a house-shaped pentagon, an L-shaped
 * hexagon). A page deals them by position, three four-sided shapes to two triangles to one
 * polygon by default, so every page mixes in a shape that is not a rectangle. Every figure is
 * drawn to scale in the shape-grid figure cell; "Perimeter up to" (band) bounds the answer.
 * The payload also carries `shape`, `sides`, `show` and `ans` for the skill's provider
 * (sheet/providers/figures.js), and its answer slot is `answer`.
 * Support level 2 prints the grey addition frame "___ + ___ + ___ + ___ =" (a hint), level 3
 * the answer in grey to trace.
 */
export function perimeterIntroFigure(q) {
    geoBegin();
    const lvl = geoLevel(1);
    const ticked = geoOpt('shapes');
    const kinds = Array.isArray(ticked) && ticked.length ? ticked.map(Number) : [0, 1, 2];
    const order = [0, 1, 0, 2, 0, 1].filter((k) => kinds.includes(k));
    const pool = order.length ? order : kinds;
    const kind = pool[geoDeal('pintro-kind', pool.length)];
    // "Perimeter up to" bounds the answer and sets the side lengths: a longest side of about a
    // quarter of it (sides to 10 at the default 40, to 25 at 100)
    const band = Number(geoOpt('band')) || 40;
    const cap = Math.max(5, Math.min(25, Math.floor(band / 4)));
    const unit = pick(['cm', 'm']);
    const labels = labelsOpt('all');
    let poly, sides, shape, edges;
    for (let tries = 0; tries < 80; tries++) {
        if (kind === 1) {
            // three different-looking whole-number sides, the longest along the bottom
            const a = randInt(3, cap - 1), b = randInt(3, cap - 1);
            const cMax = Math.min(cap, a + b - 1), cMin = Math.max(3, Math.abs(a - b) + 1);
            const c = cMin <= cMax ? randInt(cMin, cMax) : a;
            const [base, right, left] = [a, b, c].sort((x, y) => y - x);
            // the apex from the three lengths (law of cosines); never a sliver
            const x = (base * base + left * left - right * right) / (2 * base);
            const hgt = Math.sqrt(Math.max(0, left * left - x * x));
            if (hgt < base * 0.3) continue;
            poly = [[x, 0], [base, hgt], [0, hgt]];
            sides = [right, base, left];                      // poly[0]->[1] right, [1]->[2] base, [2]->[0] left
            shape = 'triangle';
            edges = sides.map((v, i) => ({ i, v, show: true }));
        } else if (kind === 2) {
            if (Math.random() < 0.5) {
                // a house: a w x h wall under a roof of two equal sides r
                const w = 2 * randInt(2, Math.max(2, Math.floor(cap / 2) - 1)), h = randInt(2, Math.max(2, cap - 4)), r = randInt(w / 2 + 1, w / 2 + 3);
                const rh = Math.sqrt(r * r - (w / 2) * (w / 2));
                poly = [[w / 2, 0], [w, rh], [w, rh + h], [0, rh + h], [0, rh]];
                sides = [r, h, w, h, r];
                shape = 'pentagon';
            } else {
                const Wd = randInt(4, Math.max(4, cap - 2)), H = randInt(4, Math.max(4, cap - 3)), cw = randInt(2, Wd - 2), ch = randInt(2, H - 2);
                poly = lPoly(Wd, H, cw, ch);
                sides = poly.map((_, i) => edgeLen(poly, i));
                shape = 'hexagon';
            }
            edges = sides.map((v, i) => ({ i, v, show: true }));
        } else {
            const square = Math.random() < 0.3;
            const l = randInt(2, cap);
            let w = square ? l : randInt(2, cap - 1);
            if (!square && w === l) w = l === 2 ? 3 : l - 1;
            poly = rectPoly(l, w);
            sides = [l, w, l, w];
            shape = square ? 'square' : 'rectangle';
            // Figure labels "some": one length and one width (the pupil uses the equal sides)
            edges = sides.map((v, i) => ({ i, v, show: labels !== 'some' || i < 2 }));
        }
        if (sides.reduce((s, v) => s + v, 0) <= band) break;
    }
    const ans = sides.reduce((s, v) => s + v, 0);
    const show = edges.map((e) => e.show !== false);
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit, edges,
        ask: [{ id: 'answer', label: 'Perimeter', unit, ans }],
        frame: sides.length, ...supportOf(lvl),
        shape, sides, show, ans,
    }, {
        text: 'What is the perimeter?', ans, printFormat: 'perimeter-intro', skillLabel: 'Perimeter Intro',
        hint: show.every(Boolean) ? 'Add the lengths of all the sides.' : 'A side with no number is as long as the side opposite it. Add all the sides.',
    });
}

/* ============================================================ the word problems of perimeter and area */

const NAMES = ['Maria', 'Liam', 'Aisha', 'Noah', 'Sofia', 'Owen', 'Omar', 'Lena'];
const UNIT_WORD = { m: 'meters', ft: 'feet', in: 'inches', cm: 'centimeters' };
const PERIMETER_STORIES = [
    { obj: 'garden', verb: 'putting a fence around', unit: 'm', need: 'fence' },
    { obj: 'rug', verb: 'sewing a trim around', unit: 'ft', need: 'trim' },
    { obj: 'photo', verb: 'putting a frame around', unit: 'in', need: 'frame' },
    { obj: 'pool', verb: 'putting a border around', unit: 'ft', need: 'border' },
    { obj: 'card', verb: 'gluing a ribbon around', unit: 'cm', need: 'ribbon' },
];
const AREA_STORIES = [
    { obj: 'room', verb: 'carpeting', unit: 'ft', need: 'carpet' },
    { obj: 'wall', verb: 'painting', unit: 'ft', need: 'wall to paint' },
    { obj: 'garden bed', verb: 'covering', unit: 'm', need: 'mulch' },
    { obj: 'kitchen floor', verb: 'tiling', unit: 'ft', need: 'tile' },
    { obj: 'table top', verb: 'covering', unit: 'cm', need: 'cloth' },
];

/**
 * A perimeter or area story (`measure` 'perimeter' | 'area'): one sentence a line, the question
 * last (P-WP-17). The rectangle it names is drawn as a labelled sketch only at Support level 2 and
 * on Model and Guided pages (a hint); on an Independent page the pupil reads the numbers from the
 * story. One answer box, its unit printed after it.
 */
export function storyFigure(q, measure, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const name = pick(NAMES);
    const st = pick(measure === 'area' ? AREA_STORIES : PERIMETER_STORIES);
    const unit = st.unit;
    const l = randInt(3, Math.max(3, Math.min(measure === 'area' ? 12 : 15, maxDim)));
    const w = randInt(2, Math.max(2, l - 1));
    const poly = rectPoly(l, w);
    const ans = measure === 'area' ? l * w : 2 * (l + w);
    const story = [
        `${name} is ${st.verb} a rectangular ${st.obj}.`,
        // a number keeps its unit on its line (a no-break space)
        `The ${st.obj} is ${l}\u00a0${unit} long and ${w}\u00a0${unit} wide.`,
        measure === 'area' ? `How many square ${UNIT_WORD[unit]} of ${st.need} does ${name} need?`
            : `How many ${UNIT_WORD[unit]} of ${st.need} does ${name} need?`,
    ];
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit, story, sketch: true,
        edges: edgesFor(poly, { labels: 'some', derivable: [2, 3] }),
        ask: [measure === 'area' ? { id: 'area', label: 'Area', unit: sq(unit), ans } : { id: 'perimeter', label: 'Perimeter', unit, ans }],
        formula: measure === 'area' ? 'Area = length × width' : 'Perimeter = add all four sides', ...supportOf(lvl),
    }, {
        text: story.join(' ').replace(/\u00a0/g, ' '), ans, printFormat: measure === 'area' ? 'area-story' : 'perimeter-story',
        skillLabel: measure === 'area' ? 'Area · Word Problem' : 'Perimeter · Word Problem',
        hint: measure === 'area' ? `Area = length × width = ${l} × ${w}.` : `Perimeter = ${l} + ${w} + ${l} + ${w}.`,
    });
}

export function areaPerimeterFigure(q, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const unit = pick(UNITS);
    const d = rectDims(Math.min(20, maxDim), 3);
    const poly = rectPoly(d.w, d.h);
    const per = perimeterOf(poly), area = areaOf(poly);
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit,
        edges: edgesFor(poly, { labels: labelsOpt('all'), derivable: [1, 2] }),
        ask: [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }, { id: 'area', label: 'Area', unit: sq(unit), ans: area }],
        formula: 'Perimeter = add the sides. Area = length × width.', ...supportOf(lvl),
    }, {
        text: 'Find the perimeter and the area.', ans: `${per}, ${area}`,
        printFormat: 'geometry-area-perimeter', skillLabel: 'Area & Perimeter',
        hint: 'Perimeter: add all four sides. Area: multiply the length by the width.',
    });
}

/* ============================================================ composite shapes */

/** An L- or T-shape (whole-number sides), its split line and the sides the pupil can work out. */
function compositeShape(kind, maxDim) {
    const cap = Math.max(5, Math.min(maxDim, 14));
    // every side is 2 units or more, and an inner corner has room for its two labels (a 1-unit arm
    // or a narrow notch stacked them on each other)
    if (kind === 'T') {
        const tw = randInt(7, Math.max(8, cap)), th = randInt(2, Math.max(2, Math.floor(cap / 3)));
        const sw = randInt(2, Math.max(2, tw - 6));
        const off = randInt(3, tw - sw - 3);
        const sh = randInt(3, Math.max(4, Math.floor(cap * 0.6)));
        // the stem's left side equals its right; the bar's left end equals its right end
        return { poly: tPoly(tw, th, sw, sh, off), split: [[0, th], [tw, th]], derivable: [5, 7] };
    }
    if (kind === 'U') {
        const w = randInt(8, Math.max(9, cap)), h = randInt(5, Math.max(6, cap));
        const cw = randInt(4, Math.max(4, w - 4)), off = randInt(2, w - cw - 2), ch = randInt(2, h - 2);
        return { poly: uPoly(w, h, cw, ch, off), split: [[0, ch], [w, ch]], derivable: [3, 7] };
    }
    const W = randInt(5, Math.max(6, cap)), H = randInt(5, Math.max(6, cap));
    const cw = randInt(3, W - 2), ch = randInt(2, H - 3);
    return { poly: lPoly(W, H, cw, ch), split: [[0, ch], [W - cw, ch]], derivable: [1, 2] };
}

export function compositeFigure(q, form, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const kind = pick(['L', 'T']);
    const unit = pick(UNITS);
    const s = compositeShape(kind, maxDim);
    const per = perimeterOf(s.poly), area = areaOf(s.poly);
    const both = form === 'dual_pa';
    return finish(q, {
        kind: 'figure', poly: s.poly, grid: 'none', unit, split: both ? s.split : null,
        edges: edgesFor(s.poly, { labels: labelsOpt('all'), derivable: s.derivable }),
        ask: both ? [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }, { id: 'area', label: 'Area', unit: sq(unit), ans: area }]
            : [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }],
        formula: both ? 'Add all the sides. Split it into rectangles for the area.' : 'Perimeter = add all the sides', ...supportOf(lvl),
    }, {
        text: both ? `Find the perimeter and the area of this ${kind}-shape.` : 'Find the perimeter of this composite shape.',
        ans: both ? `${per}, ${area}` : per, printFormat: 'geometry-composite', skillLabel: 'Composite',
        hint: both ? 'Add every side for the perimeter. Split the shape into two rectangles and add their areas.' : 'Add every side. A side with no number: use the sides opposite it.',
    });
}

export function decomposeFigure(q, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const kind = (typeof window !== 'undefined' && window.pickVariant) ? window.pickVariant('area_polygon_decompose_shape', ['L', 'T', 'U']) : pick(['L', 'T', 'U']);
    const unit = pick(UNITS);
    const s = compositeShape(kind, Math.min(maxDim, 12));
    const area = areaOf(s.poly);
    const lbl = { L: 'L-shape', T: 'T-shape', U: 'U-shape' }[kind];
    return finish(q, {
        kind: 'figure', poly: s.poly, grid: 'none', unit, split: s.split,
        edges: edgesFor(s.poly, { labels: labelsOpt('all'), derivable: s.derivable }),
        ask: [{ id: 'area', label: 'Area', unit: sq(unit), ans: area }],
        formula: 'Split it into rectangles. Add their areas.', ...supportOf(lvl),
    }, {
        text: `Find the area of this ${lbl}.`, ans: area, printFormat: 'area-decompose', skillLabel: 'Decompose Area',
        hint: 'Draw one line to split the shape into two rectangles. Find each area, then add.',
    });
}

/* ============================================================ area_triangle */

/**
 * A triangle with its base along the bottom and its height dotted from the top corner. Kinds (option
 * `shapes`, 5H): 0 right (the height is a side), 1 acute (the height falls inside), 2 obtuse (the
 * height falls outside, on the base drawn on).
 */
export function triangleFigure(q, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const kinds = geoOpt('shapes');
    const pool = Array.isArray(kinds) && kinds.length ? kinds : [0, 1, 2];
    const k = pool[geoDeal('tri-kind', pool.length)];
    const cap = Math.max(4, Math.min(20, maxDim));
    let b = randInt(2, cap), h = randInt(Math.max(2, Math.ceil(b / 3)), cap);
    if (b < Math.ceil(h / 3)) b = Math.ceil(h / 3);
    if ((b * h) % 2) { if (b % 2) b = b + 1 <= cap ? b + 1 : b - 1; else h = h + 1 <= cap ? h + 1 : h - 1; }
    b = Math.max(2, b); h = Math.max(2, h);
    let apexX;
    if (k === 0) apexX = 0;
    else if (k === 1) apexX = Math.max(1, Math.min(b - 1, Math.round(b * (0.3 + Math.random() * 0.4))));
    else apexX = -Math.max(1, Math.round(b * 0.4));
    const x0 = Math.min(0, apexX);
    const poly = [[apexX - x0, 0], [b - x0, h], [0 - x0, h]];
    const unit = pick(UNITS);
    const area = (b * h) / 2;
    const edges = [{ i: 1, v: b, show: true }];    // the base, poly[1] -> poly[2]
    return finish(q, {
        kind: 'figure', poly, grid: 'none', unit, edges,
        height: { from: [apexX - x0, 0], to: [apexX - x0, h], v: h, show: true },
        ask: [{ id: 'area', label: 'Area', unit: sq(unit), ans: area }],
        formula: 'Area = base × height ÷ 2', ...supportOf(lvl),
    }, {
        text: 'What is the area of this triangle?', ans: area, printFormat: 'area-triangle', skillLabel: 'Triangle Area',
        hint: 'Multiply the base by the height, then halve it.',
    });
}

/* ============================================================ volume (solid-kit) */

const CUBIC = (u) => `cubic ${u}`;
/** A solid's item for the solid-kit cell (the screen twin, the answer fields). */
function finishSolid(q, payload, { text, ans, printFormat, skillLabel, hint }) {
    q.cell = { template: 'solid-kit', v: 1, payload };
    q.visual = k2Twin('solid-kit', payload);
    q.text = text;
    q.ans = ans;
    q.answerType = 'number';
    q.options = [];
    q.hint = hint;
    q.printFormat = printFormat;
    q.skillLabel = skillLabel;
    return q;
}

/** Drawn units for real edges: to scale up to 10, else in proportion with every edge 1 or more. */
function drawnDims(dims) {
    const m = Math.max(...dims);
    if (m <= 10) return { d: dims.slice(), toScale: true };
    return { d: dims.map((v) => Math.max(2, Math.round((v * 10) / m))), toScale: false };
}

const VOLUME_STORIES = [
    { obj: 'fish tank', verb: 'has', unit: 'ft' }, { obj: 'storage box', verb: 'has', unit: 'ft' },
    { obj: 'sandbox', verb: 'built', unit: 'ft' }, { obj: 'gift box', verb: 'wrapped', unit: 'in' },
    { obj: 'planter', verb: 'filled', unit: 'm' },
];
const UNIT_NAME = { m: 'meters', ft: 'feet', in: 'inches', cm: 'centimeters' };

/**
 * One rectangular prism (area_perimeter:volume). Variants: standard (the three edges labelled),
 * missing (the volume given, one edge "?"), word (a story; the labelled solid is the Support-level-2
 * sketch). The unit-cube lines are the level-2 hint when the solid is drawn to scale.
 */
export function volumeFigure(q, variant, cap) {
    geoBegin();
    const lvl = geoLevel(1);
    // never a rod: the longest edge is at most four times the shortest
    let l, w, h;
    for (let t = 0; t < 40; t++) {
        l = randInt(2, cap); w = randInt(2, Math.max(2, cap - 1)); h = randInt(2, Math.max(2, cap - 1));
        if (Math.max(l, w, h) <= 4 * Math.min(l, w, h)) break;
    }
    const vol = l * w * h;
    const { d: [dl, dw, dh], toScale } = drawnDims([l, w, h]);
    const box = { x: 0, y: 0, z: 0, l: dl, w: dw, h: dh };
    const edges = [
        { a: [0, 0, 0], b: [dl, 0, 0], v: l, name: 'length' },
        { a: [dl, 0, 0], b: [dl, dw, 0], v: w, name: 'width' },
        { a: [0, 0, 0], b: [0, 0, dh], v: h, name: 'height' },
    ];
    if (variant === 'missing') {
        const unit = pick(['cm', 'in']);
        const mi = randInt(0, 2);
        const labels = edges.map((e, i) => ({ a: e.a, b: e.b, v: i === mi ? '?' : e.v }));
        const ans = edges[mi].v;
        return finishSolid(q, {
            boxes: [box], toScale, labels, unit, given: [`Volume = ${vol} ${CUBIC(unit)}`],
            ask: [{ id: 'edge', label: '?', unit, ans }], formula: 'Volume = length × width × height', hint: lvl >= 2, traced: lvl >= 3,
        }, {
            text: `The volume is ${vol} ${CUBIC(unit)}. What is the missing edge?`, ans, printFormat: 'volume-missing',
            skillLabel: 'Volume · Find Missing Side', hint: 'Multiply the two edges you know. Divide the volume by that.',
        });
    }
    if (variant === 'word') {
        const st = pick(VOLUME_STORIES), name = pick(NAMES), unit = st.unit;
        const story = [
            `${name} ${st.verb} a ${st.obj} shaped like a box.`,
            `It is ${l} ${unit} long, ${w} ${unit} wide and ${h} ${unit} tall.`,
            `What is its volume in cubic ${UNIT_NAME[unit]}?`,
        ];
        return finishSolid(q, {
            boxes: [box], toScale, labels: edges.map((e) => ({ a: e.a, b: e.b, v: e.v })), unit, story, sketch: true,
            ask: [{ id: 'volume', label: 'Volume', unit: CUBIC(unit), ans: vol }], formula: 'Volume = length × width × height',
            hint: lvl >= 2, traced: lvl >= 3,
        }, {
            text: story.join(' ').replace(/ /g, ' '), ans: vol, printFormat: 'volume-story', skillLabel: 'Volume · Word Problem',
            hint: `Volume = length × width × height = ${l} × ${w} × ${h}.`,
        });
    }
    const unit = pick(['cm', 'm', 'in', 'ft']);
    return finishSolid(q, {
        boxes: [box], toScale, labels: edges.map((e) => ({ a: e.a, b: e.b, v: e.v })), unit,
        ask: [{ id: 'volume', label: 'Volume', unit: CUBIC(unit), ans: vol }], formula: 'Volume = length × width × height',
        hint: lvl >= 2, traced: lvl >= 3,
    }, {
        text: 'Find the volume of the rectangular prism.', ans: vol, printFormat: 'geometry-volume', skillLabel: 'Volume',
        hint: `Volume = length × width × height = ${l} × ${w} × ${h}.`,
    });
}

/**
 * Two rectangular prisms joined, not overlapping (area_perimeter:volume_composite, 5.MD.C.5c).
 * Kinds (option `shapes`, 5H): 0 side by side (one depth, two heights: an L-shaped front), 1 one
 * stacked on the other. The solid is drawn as one (no seam); the split between the two prisms is
 * the Support-level-2 hint. The volume is at most `maxVol` (the "Volume to" band).
 */
export function compositeVolume(q, maxVol) {
    geoBegin();
    const lvl = geoLevel(1);
    const ticked = geoOpt('shapes');
    const pool = Array.isArray(ticked) && ticked.length ? ticked.map(Number).filter((k) => k === 0 || k === 1) : [0, 1];
    const kind = (pool.length ? pool : [0, 1])[geoDeal('volc-kind', pool.length || 2)];
    const unit = pick(['cm', 'm', 'in', 'ft']);
    let boxes, labels, split, vol, parts;
    for (let tries = 0; tries < 60; tries++) {
        if (kind === 0) {
            const l1 = randInt(1, 4), l2 = randInt(1, 4), d = randInt(2, 4);
            let h1 = randInt(1, 5), h2 = randInt(1, 5);
            if (h1 === h2) h2 = h1 === 5 ? 3 : h1 + 1;
            const L = l1 + l2;
            boxes = [{ x: 0, y: 0, z: 0, l: l1, w: d, h: h1 }, { x: l1, y: 0, z: 0, l: l2, w: d, h: h2 }];
            // every label on an edge with open space beside it: the two lengths share the bottom
            // line (ticks mark where each one ends), the right prism's height is on its back edge
            labels = [
                { a: [0, 0, 0], b: [l1, 0, 0], v: l1, ticks: true }, { a: [l1, 0, 0], b: [L, 0, 0], v: l2, ticks: true },
                { a: [0, 0, 0], b: [0, 0, h1], v: h1 }, { a: [L, d, 0], b: [L, d, h2], v: h2 },
                { a: [L, 0, 0], b: [L, d, 0], v: d },
            ];
            split = [[[l1, 0, 0], [l1, 0, Math.min(h1, h2)]]];
            parts = [l1 * d * h1, l2 * d * h2];
        } else {
            const l1 = randInt(3, 5), d1 = randInt(2, 4), h1 = randInt(1, 3);
            // the top prism is 2 units or more each way, so its two top labels have room
            const l2 = randInt(2, l1 - 1), d2 = randInt(2, d1), h2 = randInt(1, 3);
            boxes = [{ x: 0, y: 0, z: 0, l: l1, w: d1, h: h1 }, { x: 0, y: 0, z: h1, l: l2, w: d2, h: h2 }];
            const H = h1 + h2;
            labels = [
                // every label on an edge with open space beside it: the bottom prism's height on
                // its back edge, the top prism's height on the left line (ticks mark where it
                // starts), its length on its top back edge, its width on its top left edge
                { a: [0, 0, 0], b: [l1, 0, 0], v: l1 }, { a: [l1, 0, 0], b: [l1, d1, 0], v: d1 },
                { a: [l1, d1, 0], b: [l1, d1, h1], v: h1 }, { a: [0, d2, H], b: [l2, d2, H], v: l2 },
                { a: [0, 0, h1], b: [0, 0, H], v: h2, ticks: true }, { a: [0, 0, H], b: [0, d2, H], v: d2 },
            ];
            split = [[[0, 0, h1], [l2, 0, h1]]];
            parts = [l1 * d1 * h1, l2 * d2 * h2];
        }
        vol = parts[0] + parts[1];
        if (vol <= maxVol) break;
    }
    return finishSolid(q, {
        boxes, toScale: true, cubes: false, labels, split, unit, parts,
        ask: [{ id: 'volume', label: 'Volume', unit: CUBIC(unit), ans: vol }],
        formula: 'Find the volume of each prism. Add them.', hint: lvl >= 2, traced: lvl >= 3,
    }, {
        text: 'Find the volume of the solid made of two rectangular prisms.', ans: vol, printFormat: 'volume-composite',
        skillLabel: kind === 0 ? 'Composite Volume · Side by Side' : 'Composite Volume · Stacked',
        hint: 'Split the solid into two rectangular prisms. Find each volume. Add them.',
    });
}

/* ============================================================ coordinates (coord-grid) */

const _twinCtx = { mode: 'print', size: 'M', look: 'ican', state: 'blank', options: { twin: true } };

/**
 * Read or plot points (coordinates:coordinate_q1 / coordinate_all / coordinate_graph) on the
 * coord-grid cell. The screen keeps its hosts - typed ( x , y ) boxes to read, the click-to-plot
 * widget to plot - around the same black-and-white grid (the twin draws the grid only, `noAsk`).
 */
export function coordinateItem(q, skill, range) {
    geoBegin();
    const lvl = geoLevel(1);
    const quadrantMode = skill === 'coordinate_q1' ? 'quadrant1' : skill === 'coordinate_all' ? 'all_quadrants' : pick(['quadrant1', 'all_quadrants']);
    const problemType = (typeof window !== 'undefined' && window.pickVariant)
        ? window.pickVariant(skill || 'coordinate', ['identify', 'plot']) : pick(['identify', 'plot']);
    q._variant = problemType;
    const numPoints = randInt(1, 3);
    const maxCoordQ1 = Math.min(Math.max(10, Math.floor(range / 10)), 20);
    const maxCoordAll = Math.min(Math.max(5, Math.floor(range / 20)), 10);
    const points = [];
    const used = new Set();
    for (let i = 0; i < numPoints; i++) {
        let x, y;
        do {
            if (quadrantMode === 'quadrant1') { x = randInt(1, maxCoordQ1); y = randInt(1, maxCoordQ1); }
            else { x = randInt(-maxCoordAll, maxCoordAll); y = randInt(-maxCoordAll, maxCoordAll); }
        } while (used.has(`${x},${y}`) || (x === 0 && y === 0) || points.some((p) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) < 2));
        used.add(`${x},${y}`);
        points.push({ x, y, label: String.fromCharCode(65 + i) });
    }
    const maxCoord = quadrantMode === 'quadrant1' ? maxCoordQ1 : maxCoordAll;
    const labels = labelsOpt('some');
    const lo = quadrantMode === 'quadrant1' ? 0 : -maxCoord;
    const payload = { kind: problemType === 'plot' ? 'plot' : 'read', x0: lo, x1: maxCoord, y0: lo, y1: maxCoord, labels,
        points, hint: lvl >= 2, traced: lvl >= 3 };
    q.cell = { template: 'coord-grid', v: 1, payload };
    q.ans = points.length === 1 ? { x: points[0].x, y: points[0].y } : points.map((p) => ({ label: p.label, x: p.x, y: p.y }));
    q.answerType = problemType === 'plot' ? 'coord-plot' : 'coord-input';
    q.coordinateData = { points, quadrantMode, problemType, maxCoord, ...(labels === 'all' ? { labelStep: 1 } : {}) };
    q.geometryData = { points, quadrantMode, problemType, mode: problemType, ...(labels === 'all' ? { labelStep: 1 } : {}) };
    q.options = [];
    if (problemType === 'identify') {
        q.text = numPoints === 1 ? `What are the coordinates of point ${points[0].label}?` : 'What are the coordinates of each point?';
        q.hint = 'Read the x-coordinate (along) first, then the y-coordinate (up or down).';
        const inputs = `<div class="ci-host">${points.map((p, idx) => `
            <div class="ci-row">
                <span class="ci-label" style="color:#000;">${p.label}:</span>
                <span class="ci-paren">(</span>
                <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-x" id="ciX_${idx}" data-point="${idx}" data-axis="x" maxlength="4" autocomplete="off" />
                <span class="ci-comma">,</span>
                <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-y" id="ciY_${idx}" data-point="${idx}" data-axis="y" maxlength="4" autocomplete="off" />
                <span class="ci-paren">)</span>
            </div>`).join('')}
            <button class="ci-submit primary-btn" id="ciSubmitBtn" type="button" onclick="submitAnswer()">Check</button>
        </div>`;
        // the host's own ( x , y ) boxes under the same grid (a kit twin would take the quiz's input)
        q.visual = coordPicture(payload) + inputs;
        // a host that reads the boxes as one typed answer (the quiz): "(2, 7)", "2, 7", "(2,7)"
        const one = (p, paren, sp) => (paren ? `(${p.x},${sp}${p.y})` : `${p.x},${sp}${p.y}`);
        q.acceptedAnswers = [];
        for (const paren of [true, false]) for (const sp of [' ', '']) q.acceptedAnswers.push(points.map((p) => one(p, paren, sp)).join(`,${sp}`));
        q.printFormat = 'coord-input';
    } else {
        const list = points.map((p) => `${p.label}: (${p.x}, ${p.y})`).join(', ');
        q.text = numPoints === 1 ? `Plot point ${points[0].label} at (${points[0].x}, ${points[0].y})` : `Plot these points: ${list}`;
        q.hint = 'Go along the x-axis to the first number, then up or down to the second. Put a dot there.';
        q.visual = '';
        q.printFormat = 'geometry-coordinates';
    }
    q.skillLabel = quadrantMode === 'quadrant1' ? 'Coordinates (Quadrant I)' : 'Coordinates (All Quadrants)';
    return q;
}

/**
 * Reflect, turn or slide a shape (coordinates:geo_reflect / geo_rotate / geo_translate): which of
 * four grids shows it moved as asked. A choice on screen (the four grids to tick) and on paper (the
 * four grids with a check box each), all in black and white. "Slide up to" (slide, 2H) bounds a
 * translation; the grid grows so every choice stays on it.
 */
export function transformItem(q, skill, coordGridSVG) {
    geoBegin();
    const SHAPES = [
        [[1, 1], [4, 1], [1, 3]],
        [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]],
        [[1, 1], [4, 2], [2, 4]],
        [[1, 1], [4, 1], [3, 3], [2, 3]],
    ];
    const base = SHAPES[geoDeal('gt-shape', SHAPES.length)].map((p) => p.slice());
    const reflectY = (pts) => pts.map(([x, y]) => [-x, y]);
    const reflectX = (pts) => pts.map(([x, y]) => [x, -y]);
    const rotate = (pts, deg) => { const r = (-deg) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return pts.map(([x, y]) => [Math.round(x * c - y * s), Math.round(x * s + y * c)]); };
    const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
    const keyOf = (pts) => [...pts].map((p) => `${p[0]},${p[1]}`).sort().join('|');
    let src = move(base, 1, 1), right, cands, text, hint;
    if (skill === 'geo_reflect') {
        const axis = pick(['y', 'x']);
        right = axis === 'y' ? reflectY(src) : reflectX(src);
        text = `Which figure shows this shape reflected over the ${axis}-axis?`;
        hint = axis === 'y' ? 'Reflecting over the y-axis flips the shape left and right: x becomes −x.' : 'Reflecting over the x-axis flips the shape up and down: y becomes −y.';
        cands = [axis === 'y' ? reflectX(src) : reflectY(src), rotate(src, 180), rotate(src, 90), src];
    } else if (skill === 'geo_rotate') {
        const deg = pick([90, 180, 270]);
        right = rotate(src, deg);
        const name = deg === 90 ? '90° clockwise' : deg === 180 ? '180°' : '270° clockwise';
        text = `Which figure shows this shape rotated ${name} around the origin?`;
        hint = `Turn every corner ${name} around (0, 0).`;
        cands = [...[90, 180, 270].filter((r) => r !== deg).map((r) => rotate(src, r)), reflectY(src), reflectX(src)];
    } else {
        const cap = Number(geoOpt('slide')) || 3;
        const steps = [];
        for (let v = 1; v <= cap; v++) steps.push(v, -v);
        const dx = pick(steps), dy = pick(steps);
        // the shape starts near the middle, so every choice stays on the grid
        src = move(base, -2, -2);
        right = move(src, dx, dy);
        text = `Which figure shows this shape translated ${dx > 0 ? `${dx} right` : `${-dx} left`} and ${dy > 0 ? `${dy} up` : `${-dy} down`}?`;
        hint = `Slide every corner ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}. The shape does not turn or flip.`;
        cands = [move(src, -dx, dy), move(src, dx, -dy), move(src, dy, dx), move(src, -dx, -dy), move(src, 0, 0)];
    }
    const seen = new Set([keyOf(right)]);
    const wrong = [];
    // three grids to choose from (four did not fit two to a page at a size a pupil can count)
    for (const c of cands) { const k = keyOf(c); if (!seen.has(k)) { seen.add(k); wrong.push(c); } if (wrong.length === 2) break; }
    for (let t = 0; wrong.length < 2 && t < 20; t++) {
        const c = move(right, pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2]));
        const k = keyOf(c); if (!seen.has(k)) { seen.add(k); wrong.push(c); }
    }
    const order = shuffle([0, 1, 2]);
    const all = [right, ...wrong.slice(0, 2)];
    const choices = order.map((i) => all[i]);
    const correct = order.indexOf(0);
    // the grid: -5 to 5, or as far as the farthest corner of any choice
    const far = Math.max(5, ...[src, ...choices].flat().map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
    const payload = { kind: 'transform', x0: -far, x1: far, y0: -far, y1: far, shape: src, choices, correct,
        fixChoices: choices.map((_, i) => String.fromCharCode(65 + i)),
        task: text.replace(/^Which figure shows/, 'Which grid shows') };
    q.cell = { template: 'coord-grid', v: 1, payload };
    q.visual = k2Twin('coord-grid', { ...payload, noAsk: true });
    q.text = text;
    q.hint = hint;
    q.options = choices.map((pts, i) => ({ id: `opt${i}`, correct: i === correct, label: String.fromCharCode(65 + i),
        svg: coordGridSVG(_twinCtx, { x0: -far, x1: far, y0: -far, y1: far, u: 3, numerals: false, shapes: [{ pts }], label: `grid ${String.fromCharCode(65 + i)}` }).html }));
    q.ans = [`opt${correct}`];
    q.minCorrect = 1;
    q.answerType = 'multi-select-check';
    q.printAnswer = String.fromCharCode(65 + correct);
    q.printFormat = 'geo-transform-mc';
    q.skillLabel = skill === 'geo_reflect' ? 'Reflect' : skill === 'geo_rotate' ? 'Rotate' : 'Translate';
    q.geometryData = { sourcePts: src, correctPts: right, transform: skill };
    return q;
}
