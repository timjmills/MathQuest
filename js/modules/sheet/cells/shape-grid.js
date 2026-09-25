// js/modules/sheet/cells/shape-grid.js
// The `shape-grid` template (build lane geometry, design/BUILD_LIST.md): flat shapes drawn in
// grid units, black outlines on white. One template, switched on `payload.kind` (plain data,
// SCC-Q3). This file starts with the kind the owner's bug report of 2026-09-25 needed; the other
// shape-grid kinds of the build list (draw on a dot grid, reflect, area on squares) join it here.
//
//   compose   "Combine Shapes" (shapes_early:compose_shapes, K.G.B.6, 1.G.A.2). Two tasks:
//     name    the PIECES, drawn touching where they join (every piece its own outline, so the
//             seams show), and the names, each with a check box (P-TH-11; the one closed choice
//             every screen host can tap: practice card, online worksheet and quiz), or a word bank
//             and a box to write the name in (label-from-bank, RP-123). The shape they make is
//             NEVER drawn (RP-1): `target` rides in the payload for the key and the unit test only.
//     pieces  the shape (the given), and three sets of pieces lettered A, B, C, each set laid side
//             by side, not joined; the pupil checks the set that makes the shape. The wrong sets
//             have a different total area, so they cannot make it.
//
// Every piece is written in the payload as grid coordinates (geo-compose.js), and the pieces tile
// the target exactly; tests/scripts/ws-compose-unit.cjs proves it for every item it deals.
//
// Hints fade (PEDAGOGY 4, SKILL_CELL_CONTRACT 2.5): the grey corner dots on the joined shape's
// corners ("count the corners") show at Support level 2 (payload `dots`) and on Model / Guided
// pages; level 3 (payload `traced`) also checks the answer in grey to trace. The seams are the
// structure and stay at every level.
//
// Screen twin (ctx.options.twin): the same drawing. Every check box row ("hexagon [ ]", "A [ ]")
// is one label span + one box span, which screen-cell.js wireTickBoxes turns into a tap target
// (SP-3: a closed choice stays a closed choice); the write task's box carries `data-mq-blank`, so
// the host's input takes its place.
//
//   figure    a flat figure in grid units with its measures to find (area and perimeter family):
//             see shape-figure.js.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, SW, PT_MM, n2, isTwin, sizeOf, S, textPt, box, checkBox, svg } from './k2kit.js';
import { renderFigure, figureKey, figureInputs, figureFootprint } from './shape-figure.js';

export const COMPOSE_LETTERS = Object.freeze(['A', 'B', 'C', 'D']);

const levelOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);

/* ------------------------------------------------------------------ geometry */

function outline(s) {
    if (s.pts) return s.pts;
    const a = s.arc, out = a.a1 - a.a0 >= 360 ? [] : [[a.cx, a.cy]];
    for (let d = a.a0; d <= a.a1 + 1e-9; d += 15) out.push([a.cx + a.r * Math.cos(d * Math.PI / 180), a.cy + a.r * Math.sin(d * Math.PI / 180)]);
    return out;
}
function bboxOf(shapes) {
    const pts = shapes.flatMap(outline);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/** The SVG outline of one shape at `k` mm per unit, offset by (ox, oy) mm. */
function shapeEl(s, k, ox, oy, attrs) {
    const X = (x) => n2(ox + x * k), Y = (y) => n2(oy + y * k);
    const st = `fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"`;
    if (s.pts) return `<polygon points="${s.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" ${st}${attrs}/>`;
    const a = s.arc, r = n2(a.r * k);
    if (a.a1 - a.a0 >= 360) return `<circle cx="${X(a.cx)}" cy="${Y(a.cy)}" r="${r}" ${st}${attrs}/>`;
    const at = (d) => [X(a.cx + a.r * Math.cos(d * Math.PI / 180)), Y(a.cy + a.r * Math.sin(d * Math.PI / 180))];
    const [sx, sy] = at(a.a0), [ex, ey] = at(a.a1);
    const large = a.a1 - a.a0 > 180 ? 1 : 0;
    return `<path d="M${X(a.cx)},${Y(a.cy)} L${sx},${sy} A${r},${r} 0 ${large} 1 ${ex},${ey} Z" ${st}${attrs}/>`;
}

/* ------------------------------------------------------------------ sizes */

// The picture's largest box (mm) at S / M / L: the 2-D shape minimum is 30 / 36 / 42 (RP 11.2),
// a picture may grow to 1.25 x (RP-3).
const PIC = { S: { w: 42, h: 32 }, M: { w: 48, h: 36 }, L: { w: 54, h: 42 } };
// The which-pieces cell is one column wide: the shape (tw x th) over three sets of pieces (each at
// most w x h), sized so three cells fit an A4 page at L (a cell about 75 mm tall).
const PIECES = { S: { w: 46, h: 20, tw: 36, th: 24 }, M: { w: 50, h: 22, tw: 40, th: 26 }, L: { w: 54, h: 24, tw: 44, th: 28 } };
const PAD = 1.5;
// The name task's column: a half page at M and L, a third at S (RP 11.2: a 2-D shape is 30 mm at S,
// so three fit across and Size S really packs more on a page, L1). INSIDE = the room in the cell.
const NAME_COL = { S: { wMm: 62, maxCols: 3 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
const INSIDE = { S: 56, M: 84, L: 84 };

/* ------------------------------------------------------------------ pieces */

/** The pieces drawn where they join, and the grey corner dots when the hint shows. */
function joinedPicture(p, ctx, { dots, maxW = null }) {
    const parts = p.parts || [];
    const b = bboxOf(parts);
    const box0 = PIC[sizeOf(ctx)];
    const k = Math.min((maxW || box0.w) / (b.x1 - b.x0 || 1), box0.h / (b.y1 - b.y0 || 1));
    const w = (b.x1 - b.x0) * k + 2 * PAD, h = (b.y1 - b.y0) * k + 2 * PAD;
    const ox = PAD - b.x0 * k, oy = PAD - b.y0 * k;
    let body = parts.map((s, i) => shapeEl(s, k, ox, oy, ` data-ws-piece="${i}"`)).join('');
    if (dots) {
        const col = dots === 'black' ? INK : GREY;
        body += (p.corners || []).map(([x, y]) => `<circle data-ws-hint="corner" cx="${n2(ox + x * k)}" cy="${n2(oy + y * k)}" r="1.3" fill="${col}"/>`).join('');
    }
    const names = parts.map((s) => s.name);
    const label = `pieces: ${names.join(', ')}`;
    return svg(ctx, w, h, body, { cls: 'sg-pieces', label });
}

/** The corner-dot hint this cell shows: level 2 grey, level 3 black; none at 1 and 0. */
function dotsFor(p, ctx) {
    if (!(p.corners || []).length) return false;
    const lv = Math.max(levelOf(ctx), p.dots ? 2 : 0, p.traced ? 3 : 0);
    return lv >= 3 ? 'black' : lv === 2 ? 'grey' : false;
}

/** The name this cell rings or writes in the current state ('' on the pupil page). */
function shownName(p, ctx) {
    if (ctx.state === 'wrong') { const w = ctx.wrong || {}; return String(w.slots && w.slots.choice !== undefined ? w.slots.choice : w.slots && w.slots.answer !== undefined ? w.slots.answer : w.value || ''); }
    if (ctx.state === 'answered' || ctx.state === 'traced') return p.answer;
    if (p.traced) return p.answer;                     // Support level 3: the trace on the pupil page
    return '';
}

// A printed label inside a check-box group stays ink when a page role draws the group as the
// pupil's own writing (Error analysis greys every element of a written slot, and the NAMES are
// print, not writing: INK-3, text a pupil must read is never grey). text-fill-color paints the
// glyphs, so the role's grey `color` cannot reach them.
const PRINTED = `-webkit-text-fill-color:${INK};`;

/** The names, one per line, each with its check box (P-TH-11); the key checks the right one. */
function namesToCheck(p, ctx) {
    const on = shownName(p, ctx);
    const tctx = ctx.state === 'blank' && p.traced ? { ...ctx, state: 'traced' } : ctx;
    const names = p.names || [];
    const at = on ? names.indexOf(on) : -1;
    // The rows stretch to the longest name, so the boxes stand in one column. Each row is one label
    // span + one box span: the shape wireTickBoxes turns into a tap target on screen.
    const rows = names.map((nm, i) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:${L(ctx, 3)};margin:${L(ctx, 1)} 0;">`
        + `<span style="font-size:${P(ctx, namePt(ctx))};font-weight:700;line-height:1.2;text-align:left;white-space:nowrap;${PRINTED}">${esc(nm)}</span>`
        + checkBox(tctx, { id: `choice${i}`, on: i === at, slot: false }) + `</div>`).join('');
    const ink = at >= 0 ? ` data-ws-ink="${tctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    return `<div class="sg-names" data-ws-slot="choice" data-ws-shape="check"${ink} style="display:inline-flex;flex-direction:column;align-items:stretch;">${rows}</div>`;
}
const namePt = (ctx) => textPt(ctx) + 2;
/** The width (mm) a list of names takes: the longest name at the list size, the gap, the box. */
function listWidth(p, ctx) {
    const chars = Math.max(4, ...(p.names || []).map((n) => String(n).length));
    return chars * 0.55 * namePt(ctx) * PT_MM + 3 + S(ctx).checkMm + 2;
}

/** Label-from-bank: the names in a rounded bank (something to read), then the writing box. */
function bankAndBox(p, ctx) {
    const value = shownName(p, ctx);
    const bank = `<div class="sg-bank" style="display:inline-flex;flex-direction:column;align-items:center;gap:${L(ctx, 0.8)};`
        + `padding:${L(ctx, 1.5)} ${L(ctx, 3)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 3)};`
        + `font-size:${P(ctx, textPt(ctx))};line-height:1.25;">${(p.names || []).map((nm) => `<span>${esc(nm)}</span>`).join('')}</div>`;
    const bctx = ctx.state === 'blank' && p.traced ? { ...ctx, state: 'traced' } : ctx;
    const slot = box(bctx, { id: 'answer', value, w: 44, h: S(ctx).writeMm + 4, mark: 'blank', pt: textPt(ctx) + 3 });
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${bank}${slot}</div>`;
}

function composeName(p, ctx) {
    const write = p.response === 'write';
    const right = write ? bankAndBox(p, ctx) : namesToCheck(p, ctx);
    // Side by side when the picture keeps most of its size beside the names in its column (the
    // inside of a 93 mm half-page column at M and L, of a 62 mm third at S); else the names go
    // under the picture.
    const box0 = PIC[sizeOf(ctx)];
    const beside = Math.min(box0.w, INSIDE[sizeOf(ctx)] - 6 - (write ? 46 : listWidth(p, ctx)));
    const side = beside >= 0.8 * box0.w;
    const pic = joinedPicture(p, ctx, { dots: dotsFor(p, ctx), maxW: side ? beside : box0.w });
    return root(ctx, 'sg-compose', `<div style="display:flex;flex-direction:${side ? 'row' : 'column'};align-items:center;justify-content:center;`
        + `gap:${L(ctx, side ? 6 : 3)};flex-wrap:nowrap;"><div style="line-height:0;">${pic}</div><div>${right}</div></div>`);
}

/* ------------------------------------------------------------------ which pieces */

/** One choice: its pieces laid side by side, bottoms level, 3 mm apart, at `k` mm per unit. */
function pieceRow(parts, k) {
    const gapMm = 3;
    let x = 0, hMax = 0;
    const laid = parts.map((s) => {
        const b = bboxOf([s]);
        const w = (b.x1 - b.x0) * k, h = (b.y1 - b.y0) * k;
        const at = { s, b, x, w, h };
        x += w + gapMm;
        hMax = Math.max(hMax, h);
        return at;
    });
    const width = x - gapMm;
    const body = laid.map(({ s, b, x: lx, h }, i) => shapeEl(s, k, PAD + lx - b.x0 * k, PAD + (hMax - h) - b.y0 * k, ` data-ws-piece="${i}"`)).join('');
    return { width: width + 2 * PAD, height: hMax + 2 * PAD, body };
}

/** The unit scale (mm per grid unit) that fits the shape and the widest / tallest set of pieces. */
function piecesScale(p, ctx) {
    const box0 = PIECES[sizeOf(ctx)];
    const tb = bboxOf([p.target]);
    let k = Math.min(box0.tw / (tb.x1 - tb.x0 || 1), box0.th / (tb.y1 - tb.y0 || 1));
    for (const c of p.choices || []) {
        const units = c.parts.map((s) => bboxOf([s]));
        const wU = units.reduce((a, b) => a + (b.x1 - b.x0), 0), hU = Math.max(...units.map((b) => b.y1 - b.y0));
        const gaps = 3 * (c.parts.length - 1);
        k = Math.min(k, (box0.w - gaps) / (wU || 1), box0.h / (hU || 1));
    }
    return k;
}

function composePieces(p, ctx) {
    const k = piecesScale(p, ctx);
    const tb = bboxOf([p.target]);
    const tw = (tb.x1 - tb.x0) * k + 2 * PAD, th = (tb.y1 - tb.y0) * k + 2 * PAD;
    const shape = svg(ctx, tw, th, shapeEl(p.target, k, PAD - tb.x0 * k, PAD - tb.y0 * k, ' data-ws-target="1"'), { cls: 'sg-target', label: 'the shape to make' });
    const letters = (p.choices || []).map((_, i) => COMPOSE_LETTERS[i]);
    const want = COMPOSE_LETTERS[p.correct];
    let on = -1;
    if (ctx.state === 'answered' || ctx.state === 'traced' || (ctx.state === 'blank' && p.traced)) on = letters.indexOf(want);
    else if (ctx.state === 'wrong') { const w = ctx.wrong || {}; on = letters.indexOf(String(w.slots && w.slots.choice !== undefined ? w.slots.choice : w.value)); }
    const traceCtx = ctx.state === 'blank' && p.traced ? { ...ctx, state: 'traced' } : ctx;
    const cols = (p.choices || []).map((c, i) => {
        const row = pieceRow(c.parts, k);
        const pic = svg(ctx, row.width, row.height, row.body, { cls: 'sg-choice', label: `set ${letters[i]}: ${c.parts.map((s) => s.name).join(', ')}` });
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:${L(ctx, 2)};">`
            + `<div style="line-height:0;">${pic}</div>`
            // one label span + one box span: the shape wireTickBoxes turns into a tap target
            + `<div style="display:flex;align-items:center;gap:${L(ctx, 2)};"><span style="font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;${PRINTED}">${letters[i]}</span>`
            + checkBox(traceCtx, { id: `choice${i}`, on: i === on, slot: false }) + `</div></div>`;
    }).join('');
    const ink = on >= 0 ? ` data-ws-ink="${traceCtx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    return root(ctx, 'sg-which', `<div style="line-height:0;margin-bottom:${L(ctx, -1)};">${shape}</div>`
        + `<div data-ws-slot="choice" data-ws-shape="check"${ink} style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, 8)};">${cols}</div>`);
}

/* ------------------------------------------------------------------ the template */

const root = (ctx, cls, inner) => `<div class="sg-cell ${cls}"${isTwin(ctx) ? ' data-mq-sg="1"' : ''} style="color:${INK};`
    + `font-family:'Andika','Open Sans',sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 4)};">${inner}</div>`;

function keyOf(p) {
    if (p.kind === 'figure') return figureKey(p);
    if (p.kind === 'compose' && p.task === 'pieces') {
        const v = COMPOSE_LETTERS[p.correct];
        return { value: v, display: v, slots: { choice: { value: v, graded: true } } };
    }
    const v = String(p.answer || '');
    const id = p.response === 'write' ? 'answer' : 'choice';
    return { value: v, display: v, slots: { [id]: { value: v, graded: true, accept: [v.replace(/\s+/g, ''), v.replace(/\s+/g, '-')] } } };
}

register('shape-grid', {
    render(p, ctx) {
        if (p.kind === 'compose') return p.task === 'pieces' ? composePieces(p, ctx) : composeName(p, ctx);
        if (p.kind === 'figure') return renderFigure(p, ctx, root);
        return root(ctx, 'sg-empty', '');
    },
    answerKey: keyOf,
    footprint(p, ctx) {
        if (p.kind === 'figure') return figureFootprint(p, ctx);
        if (p.kind === 'compose' && p.task === 'pieces') return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 };
        const col = NAME_COL[sizeOf(ctx)];
        return { wMm: col.wMm, hMm: null, measure: true, factLike: false, maxCols: col.maxCols };
    },
    inputs(p) {
        if (p.kind === 'figure') return figureInputs(p);
        if (p.kind === 'compose' && p.task === 'pieces') return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'answer-only', 'decision'] }];
        if (p.response === 'write') return [{ id: 'answer', kind: 'text', shape: 'box', graded: true, order: 0, inputmode: 'text', scopes: ['full', 'answer-only'] }];
        return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'answer-only', 'decision'] }];
    },
    layout(p) {
        const wide = p && p.kind === 'compose' && p.task === 'pieces';
        return { card: wide ? 'card-wide-visual' : 'card-medium-visual', checker: 'value' };
    },
});

