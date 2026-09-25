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
import { k2Twin, fadeRung } from './sheet/index.js';

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
