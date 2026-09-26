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
import { dealIndex } from './page-deal.js';

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
/**
 * The index (0 .. n-1) dealt to this item under `key` — page-deal.js (L10): balanced blocks in a
 * random order from the seeded rng, never a cycle and never read off the item's position.
 */
export function geoDeal(key, n, weights = null) {
    if (n <= 1) return 0;
    return dealIndex(`geo:${key}`, n, weights);
}
// One page never repeats a figure: builders ask geoFresh(key, signature) and redraw on false.
const _seen = new Map();
let _seenPage = -1;
export function geoFresh(key, sig) {
    if (_at === 0 && _seenPage !== 0) _seen.clear();   // a new page (live play keeps a rolling window)
    _seenPage = _at;
    let set = _seen.get(key);
    if (!set) { set = []; _seen.set(key, set); }
    const k = String(sig);
    if (set.includes(k)) return false;
    set.push(k);
    if (set.length > 24) set.shift();
    return true;
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
    // rectangles to two L-shapes, dealt by page-deal.js (balanced, in the seeded random order)
    const forms = geoOpt('forms');
    const kinds = ['rectangle', 'L'];
    const pool = Array.isArray(forms) && forms.length ? forms.map((i) => kinds[i]).filter(Boolean) : ['rectangle', 'L'];
    // three rectangles to two L-shapes when both are dealt, in a random order (page-deal.js, L10)
    const shape = pool[geoDeal('aus-shape', pool.length, pool.length === 2 ? [3, 2] : null)] || 'rectangle';
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
        if (areaOf(poly) <= band && geoFresh('aus-poly', JSON.stringify(poly))) break;
    }
    if (areaOf(poly) > band) poly = shape === 'rectangle' ? rectPoly(3, 3) : lPoly(4, 3, 2, 1);
    const area = areaOf(poly);
    const lvl = geoLevel(1);
    const labels = labelsOpt('none');
    const payload = {
        kind: 'figure', poly, grid: ['rows', 'ticks'].includes(geoOpt('gridLook')) ? geoOpt('gridLook') : 'squares', unit: '',
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
    // geometry-r1: "Perimeter - Grid Counting" deals the two COUNTING kinds only (a rectangle or an
    // L-shape drawn on unit squares). The labelled figures it used to mix in are Perimeter Intro /
    // Perimeter Only items: they contradicted the skill's name. The kind is dealt by page-deal.js.
    geoBegin();
    const forms = geoOpt('forms');
    const kinds = ['rectangle', 'L'];
    const pool = (Array.isArray(forms) && forms.length ? forms.map(Number) : [0, 1]).map((i) => kinds[i]).filter(Boolean);
    const kind = pool.length ? pool[geoDeal('pg-kind', pool.length)] : 'rectangle';
    q._variant = kind;
    const band = Number(geoOpt('band')) || 36;
    const lvl = geoLevel(1);
    const labels = labelsOpt('none');
    let poly;
    for (let t = 0; t < 60; t++) {
        if (kind === 'rectangle') poly = rectPoly(randInt(2, 8), randInt(2, 6));
        else if (labels !== 'none') poly = roomyL(4, 7, 4, 6);
        else { const W = randInt(4, 7), H = randInt(4, 6); poly = lPoly(W, H, randInt(1, W - 2), randInt(1, H - 2)); }
        if (perimeterOf(poly) <= band && geoFresh('pg-poly', JSON.stringify(poly))) break;
    }
    if (perimeterOf(poly) > band) poly = kind === 'rectangle' ? rectPoly(2, 2) : lPoly(3, 3, 1, 1);
    const per = perimeterOf(poly);
    return finish(q, {
        kind: 'figure', poly, grid: geoOpt('gridLook') === 'ticks' ? 'ticks' : 'squares', unit: '',
        edges: labels === 'none' ? [] : edgesFor(poly, { labels }),
        ask: [{ id: 'perimeter', label: 'Perimeter', unit: 'units', ans: per }],
        dots: 'edges', formula: 'Count every unit round the outside.', ...supportOf(lvl),
    }, {
        text: kind === 'L' ? 'Count the outside edges of this L-shape. What is the perimeter?' : 'Count the outside edges. What is the perimeter?',
        ans: per, printFormat: 'perimeter-grid', skillLabel: 'Perim Grid',
        hint: 'Count the unit edges all the way round the outside. Do not count the lines inside.',
    });
}

/* ============================================================ perimeter / area (standard + missing side) */

/** A labelled rectangle or square no bigger than `maxDim`. */
function rectDims(maxDim, minL = 3) {
    // never the same rectangle twice on a page (geometry-r1: duplicate figures on a test)
    let d;
    for (let t = 0; t < 12; t++) {
        if (Math.random() < 0.3) { const s = randInt(2, Math.max(2, maxDim)); d = { w: s, h: s, square: true }; }
        else {
            const l = randInt(minL, Math.max(minL, maxDim));
            const w = randInt(2, Math.max(2, Math.min(l - 1, maxDim - 1)));
            d = { w: l, h: w, square: false };
        }
        if (geoFresh('rect-dims', `${d.w}x${d.h}`)) break;
    }
    return d;
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
 * hexagon). A page deals them from page-deal.js (balanced, random order), three four-sided shapes to two triangles to one
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
                poly = roomyL(4, Math.max(4, cap - 2), 4, Math.max(4, cap - 3));
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
        // never the same figure twice on a page (geometry-r1: a test repeated a 3 x 4 rectangle)
        if (sides.reduce((s, v) => s + v, 0) <= band && geoFresh('pintro', `${shape}:${sides.join(',')}`)) break;
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
/** A name not used before on this page (geometry-r1: two stories by one name on a page). */
function freshName() {
    let n = pick(NAMES);
    for (let t = 0; t < 12 && !geoFresh('name', n); t++) n = pick(NAMES);
    return n;
}
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
    const name = freshName();
    const st = pick(measure === 'area' ? AREA_STORIES : PERIMETER_STORIES);
    const unit = st.unit;
    const l = randInt(3, Math.max(3, Math.min(measure === 'area' ? 12 : 15, maxDim)));
    const w = randInt(2, Math.max(2, l - 1));
    const poly = rectPoly(l, w);
    const ans = measure === 'area' ? l * w : 2 * (l + w);
    // geometry-r2: three short lines (the long ones wrapped to six in a half-page cell and made
    // the story row twice the height of the others); a number keeps its unit (a no-break space)
    const story = [
        `${name}'s ${st.obj} is a rectangle.`,
        `It is ${l}\u00a0${unit} long and ${w}\u00a0${unit} wide.`,
        measure === 'area' ? `How many square ${UNIT_WORD[unit]} of ${st.need}?`
            : `How many ${UNIT_WORD[unit]} of ${st.need}?`,
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

/**
 * Perimeter and area of one rectangle (4.MD.A.3). Kinds ("What the items ask", variant key
 * `area_perimeter`): standard (both sides labelled), missing (the area given and one side: find the
 * other side, then the perimeter), word (a story: the fence round a garden and the grass inside it).
 */
const AP_STORIES = [
    { obj: 'garden', unit: 'm', edge: 'fence', cover: 'ground' },
    { obj: 'rug', unit: 'ft', edge: 'trim', cover: 'floor' },
    { obj: 'poster', unit: 'in', edge: 'frame', cover: 'wall' },
    { obj: 'patio', unit: 'ft', edge: 'border', cover: 'ground' },
];
export function areaPerimeterFigure(q, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    const variant = (typeof window !== 'undefined' && window.pickVariant)
        ? window.pickVariant('area_perimeter', ['standard', 'missing', 'word']) : ['standard', 'missing', 'word'][geoDeal('ap-kind', 3)];
    q._variant = variant;
    const d = rectDims(Math.min(20, maxDim), 3);
    const poly = rectPoly(d.w, d.h);
    const per = perimeterOf(poly), area = areaOf(poly);
    if (variant === 'missing') {
        const unit = pick(UNITS);
        // the length is written; the width is "?"; the other two sides are not written
        const edges = [{ i: 0, v: d.w, show: true }, { i: 1, v: '?', show: true }, { i: 2, v: d.w, show: false }, { i: 3, v: d.h, show: false }];
        return finish(q, {
            kind: 'figure', poly, grid: 'none', unit, edges,
            given: [`Area = ${area} ${sq(unit)}`],
            ask: [{ id: 'side', label: '?', unit, ans: d.h }, { id: 'perimeter', label: 'Perimeter', unit, ans: per }],
            formula: 'Divide the area by the side you know. Then add all four sides.', ...supportOf(lvl),
        }, {
            text: `The area is ${area} ${sq(unit)}. Find the missing side and the perimeter.`, ans: `${d.h}, ${per}`,
            printFormat: 'geometry-area-perimeter', skillLabel: 'Area & Perimeter · Missing Side',
            hint: `Area = length × width, so the missing side is ${area} ÷ ${d.w}. Then add all four sides.`,
        });
    }
    if (variant === 'word') {
        let st = pick(AP_STORIES);
        for (let t = 0; t < 6 && !geoFresh('ap-story', st.obj); t++) st = pick(AP_STORIES);
        const name = freshName(), unit = st.unit;
        const story = [
            `${name}'s ${st.obj} is ${d.w}\u00a0${unit} long and ${d.h}\u00a0${unit} wide.`,
            `How much ${st.edge} goes around it?`,
            `How much ${st.cover} does it cover?`,
        ];
        return finish(q, {
            kind: 'figure', poly, grid: 'none', unit, story, sketch: true,
            edges: edgesFor(poly, { labels: 'some', derivable: [2, 3] }),
            ask: [{ id: 'perimeter', label: 'Perimeter', unit, ans: per }, { id: 'area', label: 'Area', unit: sq(unit), ans: area }],
            formula: 'Round it: the perimeter. Covering it: the area.', ...supportOf(lvl),
        }, {
            text: story.join(' ').replace(/\u00a0/g, ' '), ans: `${per}, ${area}`, printFormat: 'area-story',
            skillLabel: 'Area & Perimeter · Word Problem',
            hint: `Perimeter = ${d.w} + ${d.h} + ${d.w} + ${d.h}. Area = ${d.w} × ${d.h}.`,
        });
    }
    const unit = pick(UNITS);
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

/**
 * A drawn figure every label fits (the one label rule, sheet/cells/shape-figure.js): every side is
 * at least `minFrac` of the figure's longer side, and the figure is at most `aspect` times as long
 * as it is tall. A short arm or a narrow notch put two labels on top of each other, or read "2 4 2".
 */
export function roomy(poly, minFrac = 0.25, aspect = 1.75) {
    const xs = poly.map((v) => v[0]), ys = poly.map((v) => v[1]);
    const W = Math.max(...xs) - Math.min(...xs), H = Math.max(...ys) - Math.min(...ys);
    if (Math.max(W, H) > aspect * Math.min(W, H)) return false;
    return poly.every((_, i) => edgeLen(poly, i) >= minFrac * Math.max(W, H) - 1e-9);
}

/** A labelled L-shape inside W x H bounds whose inner corner has room for its two labels. */
export function roomyL(wLo, wHi, hLo, hHi) {
    for (let t = 0; t < 120; t++) {
        const W = randInt(wLo, wHi), H = randInt(hLo, hHi);
        const m = Math.max(W, H);
        const cw = randInt(1, Math.max(1, W - 1)), ch = randInt(1, Math.max(1, H - 1));
        if (cw < 0.38 * m || ch < 0.38 * m || W - cw < 0.34 * m || H - ch < 0.34 * m) continue;
        const poly = lPoly(W, H, cw, ch);
        if (roomy(poly, 0.25)) return poly;
    }
    return lPoly(Math.max(wLo, 6), Math.max(hLo, 6), 3, 3);
}

/** An L-, T- or U-shape (whole-number sides), its split line and the sides the pupil can work out. */
function compositeShape(kind, maxDim) {
    const cap = Math.max(6, Math.min(maxDim, 14));
    let out = null;
    for (let tries = 0; tries < 120; tries++) {
        if (kind === 'T') {
            const tw = randInt(6, Math.max(6, cap)), th = randInt(2, Math.max(2, Math.floor(cap / 2)));
            const sw = randInt(2, Math.max(2, tw - 4));
            const off = randInt(2, Math.max(2, tw - sw - 2));
            const sh = randInt(2, Math.max(3, cap - th));
            if (off + sw > tw - 2) continue;
            // the two inner corners each hold two labels: the stem and the bar's ends are long enough
            const m = Math.max(tw, th + sh);
            if (sh < 0.4 * m || off < 0.3 * m || tw - off - sw < 0.3 * m) continue;
            // the stem's left side equals its right; the bar's left end equals its right end
            out = { poly: tPoly(tw, th, sw, sh, off), split: [[0, th], [tw, th]], derivable: [5, 7] };
        } else if (kind === 'U') {
            // the notch holds three labels (its two sides and its floor): wide and deep enough that
            // the floor's label sits clear below the sides' labels
            const w = randInt(8, Math.max(8, cap)), h = randInt(Math.ceil(0.6 * w), Math.max(Math.ceil(0.6 * w), Math.floor(0.8 * w)));
            const m = Math.max(w, h);
            const cw = randInt(Math.ceil(0.4 * m), Math.max(Math.ceil(0.4 * m), w - 2 * Math.ceil(0.25 * m)));
            const off = randInt(Math.ceil(0.25 * m), Math.max(Math.ceil(0.25 * m), w - cw - Math.ceil(0.25 * m)));
            const ch = randInt(Math.ceil(0.4 * m), Math.max(Math.ceil(0.4 * m), h - Math.ceil(0.3 * m)));
            if (off + cw > w - 2 || ch > h - 2) continue;
            if (cw < 0.4 * m || ch < 0.4 * m || off < 0.25 * m || w - off - cw < 0.25 * m) continue;
            out = { poly: uPoly(w, h, cw, ch, off), split: [[0, ch], [w, ch]], derivable: [3, 7] };
        } else {
            const W = randInt(4, Math.max(5, cap)), H = randInt(4, Math.max(5, cap));
            const cw = randInt(2, Math.max(2, W - 2)), ch = randInt(2, Math.max(2, H - 2));
            if (cw > W - 2 || ch > H - 2) continue;
            const m = Math.max(W, H);
            if (cw < 0.38 * m || ch < 0.38 * m || W - cw < 0.34 * m || H - ch < 0.34 * m) continue;
            out = { poly: lPoly(W, H, cw, ch), split: [[0, ch], [W - cw, ch]], derivable: [1, 2] };
        }
        // landscape, as the cell is (a tall figure is drawn small at S, its inner corners cramped)
        const ys = out.poly.map((v) => v[1]), xs = out.poly.map((v) => v[0]);
        if (Math.max(...ys) - Math.min(...ys) > 0.9 * (Math.max(...xs) - Math.min(...xs))) continue;
        if (roomy(out.poly)) return out;
    }
    // the fallbacks: roomy by construction
    if (kind === 'T') return { poly: tPoly(9, 3, 3, 4, 3), split: [[0, 3], [9, 3]], derivable: [5, 7] };
    if (kind === 'U') return { poly: uPoly(10, 8, 4, 4, 3), split: [[0, 4], [10, 4]], derivable: [3, 7] };
    return { poly: lPoly(8, 7, 4, 3), split: [[0, 3], [4, 3]], derivable: [1, 2] };
}

export function compositeFigure(q, form, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    // "Which shapes" (shapes: 0 L, 1 T, 2 U), dealt down the page (L10)
    const ticked = geoOpt('shapes');
    const kinds = ['L', 'T', 'U'];
    const pool = (Array.isArray(ticked) && ticked.length ? ticked.map(Number) : [0, 1, 2]).map((i) => kinds[i]).filter(Boolean);
    const kind = pool.length ? pool[geoDeal('comp-kind', pool.length)] : 'L';
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
        text: both ? `Find the perimeter and the area of this ${kind}-shape.` : `Find the perimeter of this ${kind}-shape.`,
        ans: both ? `${per}, ${area}` : per, printFormat: 'geometry-composite', skillLabel: 'Composite',
        hint: both ? 'Add every side for the perimeter. Split the shape into two rectangles and add their areas.' : 'Add every side. A side with no number: use the sides opposite it.',
    });
}

export function decomposeFigure(q, maxDim) {
    geoBegin();
    const lvl = geoLevel(1);
    // "Which shapes" (shapes: 0 L, 1 U, 2 T, the panel's order), dealt by page-deal.js (L10)
    const ticked = geoOpt('shapes');
    const order = ['L', 'U', 'T'];
    const pool = (Array.isArray(ticked) && ticked.length ? ticked.map(Number) : [0, 1, 2]).map((i) => order[i]).filter(Boolean);
    const kind = pool.length ? pool[geoDeal('decomp-kind', pool.length)] : 'L';
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
    // "On squared paper" (gridLook grid): the base and the height to 8, so the squares stay big enough to count
    const onPaper = geoOpt('gridLook') === 'grid';
    const cap = Math.max(4, Math.min(onPaper ? 8 : 20, maxDim));
    // a triangle its two labels fit: never a sliver (the base at least 3/4 of the height, the
    // height at least 2/5 of the base; an acute triangle's inside height needs the base wider)
    let b = 4, h = 4;
    for (let t = 0; t < 80; t++) {
        b = randInt(3, cap); h = randInt(3, cap);
        if ((b * h) % 2) continue;
        if (b < (k === 1 ? 1.1 : 0.75) * h || h < 0.4 * b) continue;
        if (!geoFresh('tri', `${k}:${b}x${h}`)) continue;
        break;
    }
    if ((b * h) % 2) b += b < cap ? 1 : -1;
    let apexX;
    if (k === 0) apexX = 0;
    else if (k === 1) apexX = Math.max(1, Math.min(b - 1, Math.round(b * (0.35 + Math.random() * 0.3))));
    else apexX = -Math.max(1, Math.round(b * 0.4));
    const x0 = Math.min(0, apexX);
    const poly = [[apexX - x0, 0], [b - x0, h], [0 - x0, h]];
    const unit = pick(UNITS);
    const area = (b * h) / 2;
    const edges = [{ i: 1, v: b, show: true }];    // the base, poly[1] -> poly[2]
    return finish(q, {
        kind: 'figure', poly, grid: onPaper ? 'paper' : 'none', unit, edges,
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
/** "How the solid is drawn" (solidLook): 'all' draws every unit cube in ink (a solid drawn to scale). */
const cubesLook = (toScale) => (geoOpt('solidLook') === 'cubes' && toScale ? 'all' : undefined);
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

// geometry-r1: "a gift box shaped like a box" read as nonsense. One plain sentence each.
const VOLUME_STORIES = [
    { first: (n) => `${n} has a fish tank shaped like a rectangular prism.`, unit: 'ft' },
    { first: (n) => `${n} packs a storage box.`, unit: 'ft' },
    { first: (n) => `${n} builds a sandbox with straight sides.`, unit: 'ft' },
    { first: (n) => `${n} wraps a gift box.`, unit: 'in' },
    { first: (n) => `${n} fills a planter shaped like a rectangular prism.`, unit: 'm' },
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
            boxes: [box], toScale, cubes: cubesLook(toScale), labels, unit, given: [`Volume = ${vol} ${CUBIC(unit)}`],
            ask: [{ id: 'edge', label: '?', unit, ans }], formula: 'Volume = length × width × height', hint: lvl >= 2, traced: lvl >= 3,
        }, {
            text: `The volume is ${vol} ${CUBIC(unit)}. What is the missing edge?`, ans, printFormat: 'volume-missing',
            skillLabel: 'Volume · Find Missing Side', hint: 'Multiply the two edges you know. Divide the volume by that.',
        });
    }
    if (variant === 'word') {
        let st = pick(VOLUME_STORIES);
        for (let t = 0; t < 8 && !geoFresh('vol-story', VOLUME_STORIES.indexOf(st)); t++) st = pick(VOLUME_STORIES);
        const name = freshName(), unit = st.unit;
        const story = [
            st.first(name),
            `It is ${l} ${unit} long, ${w} ${unit} wide and ${h} ${unit} tall.`,
            `What is its volume in cubic ${UNIT_NAME[unit]}?`,
        ];
        return finishSolid(q, {
            boxes: [box], toScale, cubes: cubesLook(toScale), labels: edges.map((e) => ({ a: e.a, b: e.b, v: e.v })), unit, story, sketch: true,
            ask: [{ id: 'volume', label: 'Volume', unit: CUBIC(unit), ans: vol }], formula: 'Volume = length × width × height',
            hint: lvl >= 2, traced: lvl >= 3,
        }, {
            text: story.join(' ').replace(/ /g, ' '), ans: vol, printFormat: 'volume-story', skillLabel: 'Volume · Word Problem',
            hint: `Volume = length × width × height = ${l} × ${w} × ${h}.`,
        });
    }
    const unit = pick(['cm', 'm', 'in', 'ft']);
    return finishSolid(q, {
        boxes: [box], toScale, cubes: cubesLook(toScale), labels: edges.map((e) => ({ a: e.a, b: e.b, v: e.v })), unit,
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
        boxes, toScale: true, cubes: cubesLook(true) || false, labels, split, unit, parts,
        ask: [{ id: 'volume', label: 'Volume', unit: CUBIC(unit), ans: vol }],
        formula: 'Find the volume of each prism. Add them.', hint: lvl >= 2, traced: lvl >= 3,
    }, {
        text: 'Find the volume of the solid made of two rectangular prisms.', ans: vol, printFormat: 'volume-composite',
        skillLabel: kind === 0 ? 'Composite Volume · Side by Side' : 'Composite Volume · Stacked',
        hint: 'Split the solid into two rectangular prisms. Find each volume. Add them.',
    });
}

/* ============================================================ coordinates (coord-grid) */


/**
 * Read or plot points (coordinates:coordinate_q1 / coordinate_all / coordinate_graph) on the
 * coord-grid cell. geometry-r1:
 *   - "Coordinates to" (band) sizes the grid, never the Max Number: 5 / 10 (default) / 20 for the
 *     first quadrant, −5 to 5 (default) / −10 to 10 for all four.
 *   - coordinate_all deals points OFF quadrant I ("Which quadrants": I and II, I and IV, or all
 *     four): every item has at least two points off quadrant I (its only point, on a one-point item),
 *     none on an axis, none on the grid's edge (a letter there met the axis name: "yB").
 *   - coordinate_graph is first quadrant only and teaches 5.G.2: a situation (hours and miles, days
 *     and plants...) - read the value a point shows, or plot the pairs of a table.
 *   - a plot item is the kit twin on every screen host: tap the crossing (data-mq-model coord-plot);
 *     its answer is the set of points, "(2, 3), (4, 1)" in x order.
 */
const GRAPH_STORIES = [
    { x: 'Hours', y: 'Miles', ask: (x) => `How many miles after ${x} hours?` },
    { x: 'Days', y: 'Height (cm)', ask: (x) => `How tall is the plant on day ${x}?` },
    { x: 'Boxes', y: 'Pencils', ask: (x) => `How many pencils are in ${x} boxes?` },
    { x: 'Weeks', y: 'Dollars saved', ask: (x) => `How many dollars after ${x} weeks?` },
];
const canonPts = (pts) => pts.slice().sort((a, b) => a.x - b.x || a.y - b.y).map((p) => `(${p.x}, ${p.y})`).join(', ');

export function coordinateItem(q, skill) {
    geoBegin();
    const lvl = geoLevel(1);
    const all = skill === 'coordinate_all';
    const graph = skill === 'coordinate_graph';
    const problemType = (typeof window !== 'undefined' && window.pickVariant)
        ? window.pickVariant(skill || 'coordinate', ['identify', 'plot']) : ['identify', 'plot'][geoDeal('coord-kind', 2)];
    q._variant = problemType;
    const band = Number(geoOpt('band')) || (all ? 5 : 10);
    const max = all ? Math.min(10, Math.max(3, band)) : Math.min(20, Math.max(4, band));
    // the quadrants a point may be dealt in (I = [+, +], II = [-, +], III = [-, -], IV = [+, -])
    const which = all ? (geoOpt('quadrants') || 'all') : 'one';
    const quads = which === 'left' ? [1, 2] : which === 'down' ? [1, 4] : which === 'all' ? [1, 2, 3, 4] : [1];
    // a situation graph reads one point's value, or plots a table of two or three pairs
    const numPoints = graph ? (problemType === 'identify' ? 1 : [2, 3][geoDeal('coord-n:graph', 2)]) : [1, 2, 3][geoDeal(`coord-n:${skill}`, 3)];
    const lim = all ? max - 1 : max;                      // off the grid's edge on a four-quadrant grid
    const step = max > 10 ? 2 : 1;                         // a grid to 20 counts in twos: its points too
    const points = [];
    const used = new Set();
    for (let i = 0; i < numPoints; i++) {
        let x, y, tries = 0;
        // off quadrant I: every point on a one- or two-point item, all but one on a three-point item
        const offQ1 = all && (numPoints < 3 || i < 2);
        const pool = offQ1 ? quads.filter((k) => k !== 1) : quads;
        const quad = pool[geoDeal(`coord-quad:${skill}:${i}`, pool.length)];
        do {
            const ax = randInt(1, lim), ay = randInt(1, lim);
            x = (quad === 2 || quad === 3 ? -ax : ax) * (all ? 1 : step);
            y = (quad === 3 || quad === 4 ? -ay : ay) * (all ? 1 : step);
            if (!all) { x = Math.min(max, Math.max(step, x)); y = Math.min(max, Math.max(step, y)); }
            tries++;
        } while (tries < 120 && (used.has(`${x},${y}`) || points.some((p) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) < (all ? (tries < 40 ? 3 : 2) : 2 * step))
            || (graph && points.some((p) => p.x === x))));
        used.add(`${x},${y}`);
        points.push({ x, y, label: String.fromCharCode(65 + i) });
    }
    const labels = labelsOpt('some');
    const lo = all ? -max : 0;
    const payload = { kind: problemType === 'plot' ? 'plot' : 'read', x0: lo, x1: max, y0: lo, y1: max, labels,
        points, hint: lvl >= 2, traced: lvl >= 3 };
    let story = null;
    if (graph) {
        story = GRAPH_STORIES[geoDeal('coord-story', GRAPH_STORIES.length)];
        payload.axisNames = { x: story.x, y: story.y };
    }
    q.cell = { template: 'coord-grid', v: 1, payload };
    q.coordinateData = { points, quadrantMode: all ? 'all_quadrants' : 'quadrant1', problemType, maxCoord: max, ...(labels === 'all' ? { labelStep: 1 } : {}) };
    q.geometryData = { points, quadrantMode: all ? 'all_quadrants' : 'quadrant1', problemType, mode: problemType };
    q.options = [];
    q.skillLabel = graph ? 'Graph a Situation' : all ? 'Coordinates (All Quadrants)' : 'Coordinates (Quadrant I)';
    const minusStr = (v) => (v < 0 ? `−${-v}` : String(v));
    if (problemType === 'identify') {
        if (graph && numPoints === 1) {
            // 5.G.2: read the value the point shows, in the situation's words
            payload.ask = { kind: 'value', text: story.ask(points[0].x) };
            q.text = `${story.ask(points[0].x)} Use point A on the graph.`;
            q.ans = points[0].y;
            q.answerType = 'number';
            q.visual = k2Twin('coord-grid', payload);
            q.printAnswer = String(points[0].y);
            q.printFormat = 'coord-input';
            q.hint = `Find ${points[0].x} on the ${story.x.toLowerCase()} axis. Go up to point A. Read across to the ${story.y.toLowerCase()} axis.`;
            return q;
        }
        q.text = numPoints === 1 ? `What are the coordinates of point ${points[0].label}?` : 'What are the coordinates of each point?';
        q.hint = 'Read the x-coordinate (along) first, then the y-coordinate (up or down).';
        q.ans = numPoints === 1 ? { x: points[0].x, y: points[0].y } : points.map((p) => ({ label: p.label, x: p.x, y: p.y }));
        q.answerType = 'coord-input';
        const inputs = `<div class="ci-host">${points.map((p, idx) => `
            <div class="ci-row">
                <span class="ci-label" style="color:#000;">${p.label}:</span>
                <span class="ci-paren">(</span>
                <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-x" id="ciX_${idx}" data-point="${idx}" data-axis="x" maxlength="4" autocomplete="off" />
                <span class="ci-comma">,</span>
                <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-y" id="ciY_${idx}" data-point="${idx}" data-axis="y" maxlength="4" autocomplete="off" />
                <span class="ci-paren">)</span>
            </div>`).join('')}
        </div>`;
        // the host's own ( x , y ) boxes under the same grid (a kit twin would take the quiz's input)
        q.visual = coordPicture(payload) + inputs;
        // a host that reads the boxes as one typed answer (the quiz): "(2, 7)", "2, 7", "(2,7)"
        const one = (p, paren, sp) => (paren ? `(${p.x},${sp}${p.y})` : `${p.x},${sp}${p.y}`);
        q.acceptedAnswers = [];
        for (const paren of [true, false]) for (const sp of [' ', '']) q.acceptedAnswers.push(points.map((p) => one(p, paren, sp)).join(`,${sp}`));
        q.printFormat = 'coord-input';
        return q;
    }
    // plot: the kit grid is the answer on every host (tap the crossings)
    const list = points.map((p) => `${p.label} (${minusStr(p.x)}, ${minusStr(p.y)})`).join(', ');
    if (graph) payload.ask = { kind: 'table', rows: points.map((p) => [p.x, p.y]).sort((a, b) => a[0] - b[0]) };
    q.text = graph ? 'Plot the pairs from the table on the graph.'
        : numPoints === 1 ? `Plot point ${points[0].label} at (${minusStr(points[0].x)}, ${minusStr(points[0].y)}).` : `Plot the points ${list}.`;
    q.hint = 'Go along the x-axis to the first number, then up or down to the second. Put a dot there.';
    q.ans = canonPts(points);
    q.printAnswer = list;
    q.acceptedAnswers = [canonPts(points), canonPts(points).replace(/\s/g, '')];
    q.answerType = 'text';
    q.visual = k2Twin('coord-grid', payload);
    q.screenInstr = numPoints === 1 ? 'Tap the grid where the point goes.' : 'Tap the grid where each point goes.';
    q.printFormat = 'geometry-coordinates';
    return q;
}

/**
 * Reflect, turn or slide a shape (coordinates:geo_reflect / geo_rotate / geo_translate): which of
 * three grids shows it moved as asked. geometry-r1: a choice on every host through the same cell
 * (the check boxes are the answer on screen, q.ans is the letter); the grids are numbered, their
 * squares 5 mm or more, two to a row; the right grid's place is dealt by page-deal.js (balanced);
 * "Which shapes" (triangles / 4 to 6 corners); Support level 2 draws the mirror line, turn arrow
 * or slide arrow.
 */
export function transformItem(q, skill) {
    geoBegin();
    const lvl = geoLevel(1);
    const TRIS = [[[1, 1], [3, 1], [1, 3]], [[1, 1], [3, 2], [1, 3]], [[1, 1], [3, 1], [2, 3]]];
    const POLYS = [[[1, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3]], [[1, 1], [3, 1], [3, 3], [2, 3]], [[1, 1], [3, 1], [2, 3], [1, 2]]];
    const ticked = geoOpt('shapes');
    const kinds = (Array.isArray(ticked) && ticked.length ? ticked.map(Number) : [0, 1]).filter((k) => k === 0 || k === 1);
    const kind = kinds.length ? kinds[geoDeal(`gt-kind:${skill}`, kinds.length)] : 0;
    const set = kind === 0 ? TRIS : POLYS;
    const base = set[geoDeal(`gt-shape:${skill}`, set.length)].map((p) => p.slice());
    const reflectY = (pts) => pts.map(([x, y]) => [-x, y]);
    const reflectX = (pts) => pts.map(([x, y]) => [x, -y]);
    const rotate = (pts, deg) => { const r = (-deg) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return pts.map(([x, y]) => [Math.round(x * c - y * s), Math.round(x * s + y * c)]); };
    const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
    const keyOf = (pts) => [...pts].map((p) => `${p[0]},${p[1]}`).sort().join('|');
    let src = base, right, cands, text, hint, hintKind;
    const forms = geoOpt('forms');
    const pickForm = (n) => {
        const pool = Array.isArray(forms) && forms.length ? forms.map(Number).filter((v) => v >= 0 && v < n) : Array.from({ length: n }, (_, i) => i);
        return (pool.length ? pool : [0])[geoDeal(`gt-form:${skill}`, pool.length || 1)];
    };
    if (skill === 'geo_reflect') {
        const axis = ['x', 'y'][pickForm(2)];
        right = axis === 'y' ? reflectY(src) : reflectX(src);
        text = `Which grid shows this shape reflected over the ${axis}-axis?`;
        hint = axis === 'y' ? 'Reflecting over the y-axis flips the shape left and right: x becomes −x.' : 'Reflecting over the x-axis flips the shape up and down: y becomes −y.';
        cands = [axis === 'y' ? reflectX(src) : reflectY(src), rotate(src, 180), rotate(src, 90), src];
        hintKind = { kind: 'mirror', axis };
    } else if (skill === 'geo_rotate') {
        const deg = [180, 90, 270][pickForm(3)];
        right = rotate(src, deg);
        const name = deg === 90 ? '90° clockwise' : deg === 180 ? '180°' : '270° clockwise';
        text = `Which grid shows this shape rotated ${name} around the origin?`;
        hint = `Turn every corner ${name} around (0, 0).`;
        cands = [...[90, 180, 270].filter((r) => r !== deg).map((r) => rotate(src, r)), reflectY(src), reflectX(src)];
        hintKind = { kind: 'turn', deg, from: src[0] };
    } else {
        const cap = Number(geoOpt('slide')) || 3;
        const f = pickForm(4);          // 0 right-up, 1 left-up, 2 right-down, 3 left-down
        const dx = (f === 0 || f === 2 ? 1 : -1) * randInt(1, cap), dy = (f === 0 || f === 1 ? 1 : -1) * randInt(1, cap);
        // the shape starts so that it and every choice stay on the grid
        src = move(base, dx > 0 ? -3 : 0, dy > 0 ? -3 : 0);
        right = move(src, dx, dy);
        text = `Which grid shows this shape translated ${dx > 0 ? `${dx} right` : `${-dx} left`} and ${dy > 0 ? `${dy} up` : `${-dy} down`}?`;
        hint = `Slide every corner ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}. The shape does not turn or flip.`;
        cands = [move(src, -dx, dy), move(src, dx, -dy), move(src, dy, dx), move(src, -dx, -dy), move(src, 0, 0)];
        hintKind = { kind: 'slide', from: src[0], to: right[0] };
    }
    // every grid is as small as the shape and its move allow (-3 to 3 unless a long slide needs
    // more): a wrong grid never widens it, so S keeps its one row of four
    const R = Math.max(3, ...[src, right].flat().map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
    const inside = (c) => c.every(([x, y]) => Math.abs(x) <= R && Math.abs(y) <= R);
    const seen = new Set([keyOf(right)]);
    const wrong = [];
    for (const c of cands) { const k = keyOf(c); if (inside(c) && !seen.has(k)) { seen.add(k); wrong.push(c); } if (wrong.length === 2) break; }
    for (let t = 0; wrong.length < 2 && t < 60; t++) {
        const c = move(right, pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2]));
        const k = keyOf(c); if (inside(c) && !seen.has(k)) { seen.add(k); wrong.push(c); }
    }
    // the right grid's place (A, B or C) is dealt balanced down the page, never read off a shuffle
    const correct = geoDeal(`gt-answer:${skill}`, 3);
    const w2 = wrong.slice(0, 2);
    const choices = [0, 1, 2].map((i) => (i === correct ? right : w2.shift()));
    // the grid: -3 to 3, or as far as the farthest corner of any choice
    const far = Math.max(3, ...[src, ...choices].flat().map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
    const LET = ['A', 'B', 'C'];
    const payload = { kind: 'transform', x0: -far, x1: far, y0: -far, y1: far, shape: src, choices, correct,
        fixChoices: LET.slice(), task: text, hintKind, hint: lvl >= 2, labels: labelsOpt('all') };
    q.cell = { template: 'coord-grid', v: 1, payload };
    q.visual = k2Twin('coord-grid', payload);
    q.text = text;
    q.hint = hint;
    q.options = [];
    q.ans = LET[correct];
    q.printAnswer = LET[correct];
    q.selfAnswering = true;
    q.answerType = 'text';
    q.screenInstr = 'Tick the grid that shows the move.';
    q.printFormat = 'geo-transform-mc';
    q.skillLabel = skill === 'geo_reflect' ? 'Reflect' : skill === 'geo_rotate' ? 'Rotate' : 'Translate';
    q.geometryData = { sourcePts: src, correctPts: right, transform: skill };
    return q;
}

/* ============================================================ fill a shape with blocks */
// compose_hexagon, compose_rect_from_squares (shape-grid kind `fill`, sheet/cells/shape-fill.js).
// geometry-r1: the screen draws the same cell and takes the typed count (the drag widget showed
// "0 of N slots" - the answer - and asked a different task); the hexagon deals MIXED fills (1.G.A.2)
// as well as the three one-block fills, from page-deal.js, never by position.

const FILL_PL = { triangle: 'triangles', rhombus: 'rhombuses', trapezoid: 'trapezoids', square: 'squares' };
const fillName = (b, n) => (n === 1 ? b : FILL_PL[b] || b);
const R3 = Math.sqrt(3);
// A flat-topped hexagon of side 2 units, y down, its corner V_k at 60k degrees round its centre.
// Six triangles T_k = (centre, V_k, V_k+1) fill it: a rhombus is two neighbours, a trapezoid three.
const HEX_C = [2, R3];
const hexV = (k) => { const a = Math.PI / 3 * (((k % 6) + 6) % 6); return [+(HEX_C[0] + 2 * Math.cos(a)).toFixed(4), +(HEX_C[1] + 2 * Math.sin(a)).toFixed(4)]; };
const RUN_BLOCK = { 1: 'triangle', 2: 'rhombus', 3: 'trapezoid' };
function hexRun(start, len) {
    if (len === 1) return [HEX_C.slice(), hexV(start), hexV(start + 1)];
    if (len === 2) return [HEX_C.slice(), hexV(start), hexV(start + 1), hexV(start + 2)];
    return [hexV(start), hexV(start + 1), hexV(start + 2), hexV(start + 3)];
}
// The fills: runs of triangles round the centre (each run is one block), and what the item names.
// `ask` is the kind the pupil counts; the other kinds are given ("1 trapezoid and [ ] triangles").
const HEX_MIXED = [
    { runs: [[3, 1, 1, 1]], kinds: ['trapezoid', 'triangle'] },
    { runs: [[2, 2, 1, 1], [2, 1, 2, 1]], kinds: ['rhombus', 'triangle'] },
    { runs: [[2, 1, 1, 1, 1], [1, 2, 1, 1, 1]], kinds: ['rhombus', 'triangle'] },
    { runs: [[3, 2, 1], [3, 1, 2]], kinds: ['trapezoid', 'rhombus', 'triangle'] },
];

function finishFill(q, payload, { text, hint, skillLabel, shapeName }) {
    q.cell = { template: 'shape-grid', v: 1, payload };
    q.visual = k2Twin('shape-grid', payload);
    q.ans = payload.count;
    q.printAnswer = String(payload.count);
    q.answerType = 'number';
    q.options = [];
    q.text = text;
    q.hint = hint;
    q.skillLabel = skillLabel;
    q.printFormat = 'compose-shape-blocks';
    q.screenInstr = `How many ${FILL_PL[payload.block]} fill the ${shapeName}? Type the number.`;
    return q;
}

export function hexagonFill(q) {
    geoBegin();
    const lvl = geoLevel(1);
    // "Blocks used" (shapes): 0 triangles, 1 trapezoids, 2 rhombuses, 3 mixed blocks
    const ticked = geoOpt('shapes');
    const pool = (Array.isArray(ticked) && ticked.length ? ticked.map(Number) : [0, 1, 2, 3]).filter((v) => v >= 0 && v <= 3);
    const plan = pool.length ? pool[geoDeal('hex-plan', pool.length)] : 1;
    let runs, ask, given = [];
    if (plan === 3) {
        const mix = HEX_MIXED[geoDeal('hex-mix', HEX_MIXED.length)];
        runs = pick(mix.runs);
        // ask the triangles, or the other kind (the given blocks change with it)
        const other = mix.kinds.filter((k) => k !== 'triangle');
        ask = geoDeal('hex-ask', 2) === 0 ? 'triangle' : other[other.length - 1];
    } else {
        const len = plan === 0 ? 1 : plan === 1 ? 3 : 2;
        runs = Array(6 / len).fill(len);
        ask = RUN_BLOCK[len];
    }
    // a random turn of the whole fill (the key is one of the fills that works)
    const start = randInt(0, 5);
    const places = [], placeBlocks = [];
    let at = start;
    for (const len of runs) { places.push(hexRun(at, len)); placeBlocks.push(RUN_BLOCK[len]); at += len; }
    const counts = {};
    placeBlocks.forEach((b) => { counts[b] = (counts[b] || 0) + 1; });
    const order = ['trapezoid', 'rhombus', 'triangle'];
    given = order.filter((b) => b !== ask && counts[b]).map((b) => ({ block: b, n: counts[b] }));
    const count = counts[ask];
    const paper = geoOpt('paper') === 'dots' ? 'dots' : 'plain';
    const payload = {
        kind: 'fill', shapeName: 'hexagon', block: ask, target: [0, 1, 2, 3, 4, 5].map(hexV),
        places, placeBlocks, given, blocks: counts, count, paper, hint: lvl >= 2, traced: lvl >= 3,
    };
    const givenWords = given.map((g) => `${g.n} ${fillName(g.block, g.n)}`).join(' and ');
    return finishFill(q, payload, {
        text: given.length ? `Fill the hexagon with ${givenWords} and some ${FILL_PL[ask]}. How many ${FILL_PL[ask]}?`
            : `Fill the hexagon with ${FILL_PL[ask]}. How many ${FILL_PL[ask]}?`,
        hint: given.length ? `Draw the ${givenWords} first. Fill the rest with ${FILL_PL[ask]}: no gaps, no overlaps.`
            : 'Put a block in a corner of the hexagon first. The blocks must fill it with no gaps and no overlaps.',
        skillLabel: 'Compose Hexagon', shapeName: 'hexagon',
    });
}

export function rectSquaresFill(q) {
    geoBegin();
    const lvl = geoLevel(1);
    // "Squares up to" (band) bounds how many; 1 to 3 rows of 2 to 4, never the same rectangle twice in a row
    const band = Number(geoOpt('band')) || 12;
    let cols = 2, rows = 1;
    for (let t = 0; t < 40; t++) {
        cols = randInt(2, 4); rows = randInt(1, 3);
        if (rows * cols <= band && geoFresh('rect-sq', `${rows}x${cols}`)) break;
    }
    if (rows * cols > band) { cols = 2; rows = 1; }
    const places = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) places.push([[2 * c, 2 * r], [2 * c + 2, 2 * r], [2 * c + 2, 2 * r + 2], [2 * c, 2 * r + 2]]);
    const paper = geoOpt('paper') === 'dots' ? 'dots' : 'plain';
    const payload = {
        kind: 'fill', shapeName: 'rectangle', block: 'square', target: rectPoly(2 * cols, 2 * rows),
        places, given: [], count: places.length, paper, hint: lvl >= 2, traced: lvl >= 3,
    };
    return finishFill(q, payload, {
        text: 'Fill the rectangle with squares. How many squares?',
        hint: 'Start in a corner. Fill a row, then the next row. No gaps and no overlaps.',
        skillLabel: 'Compose Rectangle', shapeName: 'rectangle',
    });
}
