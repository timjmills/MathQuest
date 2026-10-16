// js/modules/sheet/cells/arrays-turn.js
// The `arrays-turn` template (the arrays family, kind 'turn'; its own id so `arrays` keeps drawing
// its anchors whole) (multiplication:mult_properties form 0, the order property,
// 3.OA.B.5): an array of dots and the SAME array turned, each with its fact.
//
// Payload: { kind: 'turn', rows, cols, product, type, ask }
//   type 'both'    both arrays; "r × c = [ ]" under the first, "c × r = [ ]" under the turn. The
//                  pupil counts or multiplies each array (the facts name the arrays, rows first).
//   type 'known'   both arrays; the first fact printed WITH its product (the known fact), the turned
//                  array's fact is three boxes "[ ] × [ ] = [ ]": its rows, its row length, its product.
//   type 'missing' no pictures (abstract, ★★★): the known fact "r × c = P" and its turn with one box,
//                  `ask` 'product' ("c × r = [ ]") or 'factor' ("c × [ ] = P").
// Nothing names the property (RP-1: a heading naming the rule tells the pupil what to do), and no
// product sits beside the question that asks for it, except the known fact of 'known' / 'missing',
// which is the fact the pupil is meant to use.
//
// Dots: solid, at least 4 mm, on the closed-up arrays pitch (MIN_PITCH), never shrunk to fit; at
// most 5 rows and 5 in a row (RP-21). Slot ids: a (first product), b1 b2 b3 (turned fact), m (the
// one box of 'missing'). Step states (stepState): marks `array` (draw the array), `fact` (its
// product), `turn` (draw the turned array), `b1` `b2` `b3` / `turned` (the turned fact); the newest
// mark grey, a later array not drawn yet.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList } from './ops-common.js';
import { INK } from '../tokens.js';
import { stepMarks } from '../steps.js';

const DOT = { S: 4.5, M: 5, L: 5.5 };
const PITCH = { S: 7, M: 8, L: 9 };
const GAP = 6;                      // mm between the array and its turn

const N = (v) => Number(v);
const product = (p) => (Number.isFinite(N(p.product)) ? N(p.product) : N(p.rows) * N(p.cols));

/** The right value of every slot. */
export function turnKey(p) {
    const r = N(p.rows), c = N(p.cols), P = product(p);
    if (p.type === 'both') return { a: String(P), b: String(P) };
    if (p.type === 'missing') return { m: String(p.ask === 'factor' ? r : P) };
    return { b1: String(c), b2: String(r), b3: String(P) };
}
const SLOT_ORDER = { both: ['a', 'b'], known: ['b1', 'b2', 'b3'], missing: ['m'] };
const slotIds = (p) => SLOT_ORDER[p.type] || SLOT_ORDER.known;

function dotsSvg(g, rows, cols, ink, label) {
    const pitch = PITCH[g.size] || PITCH.L;
    const r = Math.min(DOT[g.size] || DOT.L, pitch - 2.5) / 2;
    const W = cols * pitch, H = rows * pitch;
    const fill = ink === 'trace' ? INK.grey : INK.ink;
    let body = '';
    if (ink !== 'none') {
        for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
            body += `<circle cx="${(pitch / 2 + j * pitch).toFixed(2)}" cy="${(pitch / 2 + i * pitch).toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}"/>`;
        }
    }
    const svg = `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" data-per-row="${cols}" role="img" aria-label="${esc(label)}" `
        + `style="display:block;margin:0 auto;width:${g.em(W)};height:${g.screen ? 'auto' : g.em(H)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;
    return { svg, wMm: W, hMm: H };
}

const boxW = (g, digits) => Math.max(g.writeMm * (digits > 1 ? 1.8 : 1.2), digits * 0.62 * g.E + 3);
const SIGN_MM = (g) => 0.9 * g.E;   // a sign and its spaces

/** One fact line: parts are numbers/signs (strings) or {id, digits} slots. */
function factLine(g, parts, at) {
    const html = parts.map((part) => (typeof part === 'string'
        ? `<span>${esc(part)}</span>`
        : box(g, part.id, { wMm: boxW(g, part.digits), hMm: g.stripMm, value: at(part.id).value, ink: at(part.id).ink, mark: g.twin ? part.mark || 'cell' : null })))
        .join('');
    return `<span style="display:inline-flex;align-items:center;gap:0.22em;white-space:nowrap">${html}</span>`;
}
function factWidth(g, parts) {
    let w = 0;
    for (const part of parts) {
        if (typeof part !== 'string') w += boxW(g, part.digits);
        else if (/^[×=]$/.test(part)) w += SIGN_MM(g);
        else w += part.length * 0.62 * g.E;
        w += 0.22 * g.E;
    }
    return w;
}

/** The two facts (or the abstract pair) as parts lists. */
function facts(p) {
    const r = String(N(p.rows)), c = String(N(p.cols)), P = String(product(p)), d = P.length;
    if (p.type === 'both') return [[r, '×', c, '=', { id: 'a', digits: d }], [c, '×', r, '=', { id: 'b', digits: d }]];
    if (p.type === 'missing') {
        const turned = p.ask === 'factor' ? [c, '×', { id: 'm', digits: r.length, mark: 'blank' }, '=', P] : [c, '×', r, '=', { id: 'm', digits: d, mark: 'blank' }];
        return [[r, '×', c, '=', P], turned];
    }
    return [[r, '×', c, '=', P], [{ id: 'b1', digits: c.length }, '×', { id: 'b2', digits: r.length }, '=', { id: 'b3', digits: d }]];
}

function geometry(g, p) {
    const [f1, f2] = facts(p);
    const fw = Math.max(factWidth(g, f1), factWidth(g, f2));
    if (p.type === 'missing') return { wMm: fw, pictures: false };
    // The two arrays side by side, the two facts under them, one line each (the array first,
    // then its turn): two facts side by side are wider than a 2-column cell at M and L.
    const a = dotsSvg(g, N(p.rows), N(p.cols), 'solid', ''), b = dotsSvg(g, N(p.cols), N(p.rows), 'solid', '');
    return { wMm: Math.max(a.wMm + GAP + b.wMm, fw), pictures: true };
}

/** Render one turn cell. `sv` = {slot: {value, ink}} from a step state, else the state's ink. */
export function turnRender(p, ctx) {
    const g = geo(ctx);
    const ink = inkOf(ctx);
    const key = turnKey(p);
    const ids = slotIds(p);
    const vals = slotValues(ctx, key, (w) => { const l = splitList(w); const o = {}; ids.forEach((id, i) => { o[id] = l[i]; }); return o; });
    const sv = ctx.stepVals || null;
    const at = (id) => (sv ? { value: (sv[id] && sv[id].value) || '', ink: (sv[id] && sv[id].ink) || null } : { value: vals[id] || '', ink });
    const [f1, f2] = facts(p);
    const geom = geometry(g, p);
    let inner;
    if (!geom.pictures) {
        inner = `<div style="display:flex;flex-direction:column;align-items:center;gap:${g.em(3)}">${factLine(g, f1, at)}${factLine(g, f2, at)}</div>`;
    } else {
        // Step state: an array not drawn yet keeps its space (the cell never jumps between steps).
        const inkA = sv ? (sv.array ? sv.array.ink : 'solid') : 'solid';
        const inkB = sv ? (sv.turn ? sv.turn.ink : 'none') : 'solid';
        const A = dotsSvg(g, N(p.rows), N(p.cols), inkA, `${p.rows} rows of ${p.cols} dots`);
        const B = dotsSvg(g, N(p.cols), N(p.rows), inkB, `${p.cols} rows of ${p.rows} dots`);
        const showF2 = !sv || sv.turn;
        inner = `<div style="display:flex;justify-content:center;align-items:flex-end;gap:${g.em(GAP)}">${A.svg}${B.svg}</div>`
            + `<div style="margin-top:${g.em(3)};display:flex;flex-direction:column;align-items:center;gap:${g.em(2)}">`
            + `<div>${factLine(g, f1, at)}</div><div style="visibility:${showF2 ? 'visible' : 'hidden'}">${factLine(g, f2, at)}</div></div>`;
    }
    return root(g, 'arrays-turn', inner, 'text-align:center;width:100%;', turnFootprint(p, ctx).wMm);
}

export function turnAnswerKey(p) {
    const k = turnKey(p);
    const ids = slotIds(p);
    const slots = {};
    for (const id of ids) slots[id] = { value: k[id], graded: true };
    const display = ids.map((id) => k[id]).join(', ');
    return { value: ids.length === 1 ? Number(k[ids[0]]) : display, display, slots };
}

export function turnFootprint(p, ctx) {
    const g = geo(ctx);
    const geom = geometry(g, p);
    return { wMm: Math.ceil(geom.wMm + 6), hMm: null, measure: true, factLike: false, maxCols: geom.pictures ? 2 : 3 };
}

export function turnInputs(p) {
    return slotIds(p).map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
}

/** Step marks: `array`, `fact` (-> a / the known line), `turn`, `b1`-`b3`, `turned` (-> b or b3), `answer` (-> m). */
export function turnStepState(p, steps, k, ctx) {
    const sv = {};
    for (const m of stepMarks(steps, k)) {
        let id = m.slot;
        if (id === 'fact') id = 'a';
        else if (id === 'turned') id = p.type === 'both' ? 'b' : 'b3';
        else if (id === 'answer') id = p.type === 'missing' ? 'm' : p.type === 'both' ? 'b' : 'b3';
        sv[id] = { value: m.value, ink: m.ink };
    }
    return turnRender(p, Object.assign({}, ctx, { state: 'blank', stepVals: sv }));
}


register('arrays-turn', {
    render: turnRender,
    answerKey: turnAnswerKey,
    footprint: turnFootprint,
    inputs: turnInputs,
    layout(p) { return { card: 'card-medium-visual', checker: (p && p.type === 'missing') ? 'value' : 'list', requiresVisual: !(p && p.type === 'missing') }; },
    stepState: turnStepState,
});
