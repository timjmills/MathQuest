// js/modules/sheet/cells/share-plates.js
// The `share-plates` template: sharing a small amount equally, and making equal groups, for
// division:share_and_group_early (build list, lane operations, entry 2; PK-1, EE 2.OA.3).
//
//     ○ ○ ○ ○ ○ ○ ○ ○            the counters to share (outlines: the pupil crosses each one off)
//   (       )   (       )        the plates (or rings) the pupil draws them on
//        [ ] on each plate       the answer
//
// Four kinds (payload.kind), one drawing:
//   share   n counters and k empty plates: draw them shared, write how many on each plate.
//   group   n counters in rows that are a whole number of groups long (never gapped into groups:
//           the pupil rings them); "Groups of 3"; write how many groups.
//   left    n counters and k plates, n not a multiple of k: how many on each, how many left over.
//   fair    k plates ALREADY holding counters (solid): is it fair? check Fair or Not fair.
//
// Groups are drawn as plates (an oval with a rim) or rings (one loop): payload.look. The plate is
// sized for the share it must hold (RUBRIC H12: room to draw every counter at the printed size,
// one counter across at the least). A hint (payload.hint, support level 2) draws one grey counter
// on each plate (share, left: "one for you, one for me") or the first group's ring (group); it
// fades at level 1. The picture never states the answer (RP-1).
//
// Key (AK-1): the same cell, the plates holding their share (or each group ringed) and the
// answers written; Fair / Not fair checked.
//
// payload: { kind, n, k, look?: 'plates'|'rings', hint?: bool, shown?: [counts] (fair), ans }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, svg, root, box, checkBox, slotValue, shapeOf, dot, textPt, inlineBoxMm, INK, GREY, SW, n2, isTwin, sizeOf, answered } from './k2kit.js';

/** Counter diameter and the room each takes on a plate (mm), by size. */
const D = { S: 5.5, M: 6.5, L: 8 };
const GAP = 3;          // between two counters in the row to share (a pencil passes)
const PLATE_PAD = { S: 3, M: 3.5, L: 4 };  // plate edge to its counters
/** The gaps down the cell (mm): between counter rows, above the plates, above the answer. */
const VGAP = { S: [3.5, 3, 2], M: [4.5, 3.5, 3], L: [5, 4, 3] };
const PLATE_GAP = 3.5;  // between two plates
/** The widest a row of plates may be: a 2-column cell's content (86 mm less its pads). */
const ROW_MAX = 82;

/** The answer parts of a payload, in reading order. */
export function shareAnswers(p) {
    const n = Number(p.n), k = Number(p.k);
    if (p.kind === 'group') return [String(n / k)];
    if (p.kind === 'left') return [String(Math.floor(n / k)), String(n % k)];
    if (p.kind === 'fair') return [p.ans === 'Fair' ? 'Fair' : 'Not fair'];
    return [String(n / k)];
}

/** How many counters each plate must hold room for. */
function plateHolds(p) {
    if (p.kind === 'fair') return Math.max(...(p.shown || [1]));
    return Math.max(1, Math.floor(Number(p.n) / Number(p.k)));
}

function geom(ctx, p) {
    const d = D[sizeOf(ctx)] || D.L;
    const cell = d + 2;
    const m = plateHolds(p);
    // a plate holds its share in a near-square block (a round plate, not a long tray): one
    // across to 2 (an upright oval, so four plates stand in one row), two to 4, three to 9, four for 10
    const cols = m <= 2 ? 1 : m <= 4 ? 2 : m <= 9 ? 3 : 4, rows = Math.max(1, Math.ceil(m / cols));
    const pad = PLATE_PAD[sizeOf(ctx)] || 4;
    const pw = cols * cell + 2 * pad, ph = rows * cell + 2 * pad;
    return { d, cell, m, cols, rows, pw, ph, vgap: VGAP[sizeOf(ctx)] || VGAP.L };
}

/** The counters to share (or to ring): rows of up to ten; for groups, a whole number of groups a row. */
function rowPicture(ctx, p, g) {
    const n = Number(p.n), k = Number(p.k);
    // rows of five (the five-structure); a group row is a whole number of groups (never gapped)
    const per = p.kind === 'group' ? Math.max(k, k * Math.floor(6 / k)) : Math.min(5, n);
    const pitch = g.d + GAP, rowGap = g.vgap[0];
    const cols = Math.min(per, n), rows = Math.ceil(n / per);
    const w = (cols - 1) * pitch + g.d + 1, h = (rows - 1) * (g.d + rowGap) + g.d + 1;
    const at = (i) => ({ x: 0.5 + g.d / 2 + (i % per) * pitch, y: 0.5 + g.d / 2 + Math.floor(i / per) * (g.d + rowGap) });
    let body = '';
    for (let i = 0; i < n; i++) { const c = at(i); body += shapeOf('circle').draw(c.x, c.y, g.d); }
    // a ring round a group of k: the hint rings the first in grey; the key rings every one in ink
    const ringGroups = p.kind === 'group' ? (answered(ctx) ? Math.floor(n / k) : p.hint ? 1 : 0) : 0;
    for (let r = 0; r < ringGroups; r++) {
        const a = at(r * k), b = at(r * k + k - 1);
        const x = a.x - g.d / 2 - 1.2, y = a.y - g.d / 2 - 1.2, rw = b.x - a.x + g.d + 2.4, rh = g.d + 2.4;
        const colour = answered(ctx) ? INK : GREY;
        body += `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(rw)}" height="${n2(rh)}" rx="${n2(rh / 2)}" fill="none" stroke="${colour}" stroke-width="${n2(SW.heavy)}"${answered(ctx) ? '' : ' data-ws-ink="trace"'}/>`;
    }
    return svg(ctx, w + 1, h + 1, body, { label: `${n} counters` });
}

/** One plate (or ring) with `count` counters drawn in it: solid (given, or the key), grey (hint). */
function plateSVG(ctx, p, g, count, { tone = 'ink', label = '' } = {}) {
    const W = g.pw, H = g.ph;
    let body = '';
    if (p.look === 'rings') {
        body += `<rect x="0.6" y="0.6" width="${n2(W - 1.2)}" height="${n2(H - 1.2)}" rx="${n2((H - 1.2) / 2)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    } else {
        body += `<ellipse cx="${n2(W / 2)}" cy="${n2(H / 2)}" rx="${n2(W / 2 - 0.6)}" ry="${n2(H / 2 - 0.6)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
        body += `<ellipse cx="${n2(W / 2)}" cy="${n2(H / 2)}" rx="${n2(W / 2 - 2.4)}" ry="${n2(H / 2 - 2.4)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    }
    const inW = g.cols * g.cell, inH = g.rows * g.cell;
    const ox = (W - inW) / 2, oy = (H - inH) / 2;
    const used = Math.min(count, g.cols * g.rows);
    for (let i = 0; i < used; i++) {
        const cx = ox + g.cell / 2 + (i % g.cols) * g.cell, cy = oy + g.cell / 2 + Math.floor(i / g.cols) * g.cell;
        body += tone === 'grey'
            ? `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(g.d / 2 - 0.3)}" fill="${GREY}" data-ws-ink="trace"/>`
            : dot(cx, cy, g.d - 0.6);
    }
    return svg(ctx, W, H, body, { label: label || (p.look === 'rings' ? 'a ring' : 'a plate') });
}

/** Plates to a row: all of them when they fit ROW_MAX, else half (rounded up). */
function platesAcross(g, k) {
    return k * g.pw + (k - 1) * PLATE_GAP <= ROW_MAX ? k : Math.ceil(k / 2);
}

function platesRow(ctx, p, g) {
    const k = Number(p.k);
    const plates = [];
    for (let j = 0; j < k; j++) {
        let count = 0, tone = 'ink';
        if (p.kind === 'fair') count = Number((p.shown || [])[j]) || 0;
        else if (answered(ctx)) count = Math.floor(Number(p.n) / k);
        else if (p.hint) { count = 1; tone = 'grey'; }
        plates.push(`<div style="flex:none;">${plateSVG(ctx, p, g, count, { tone })}</div>`);
    }
    // as many plates to a row as fit a 2-column cell, else the plates split into even rows
    const across = platesAcross(g, k);
    return `<div style="display:grid;grid-template-columns:repeat(${across}, auto);justify-content:center;justify-items:center;gap:${L(ctx, PLATE_GAP)};margin-top:${L(ctx, p.kind === 'fair' ? 0 : g.vgap[1])};">${plates.join('')}</div>`;
}

function frameHTML(ctx, p) {
    const tp = textPt(ctx) * 1.15;
    const word = (t) => `<span style="font-size:${isTwin(ctx) ? `max(18px, ${P(ctx, tp)})` : P(ctx, tp)};white-space:nowrap;">${esc(t)}</span>`;
    const keys = shareAnswers(p);
    const bx = inlineBoxMm(ctx, 2);
    const slot = (id, v, only) => box(ctx, { id, value: slotValue(ctx, id, v), w: bx.w, h: bx.h, mark: only ? 'blank' : 'cell' });
    const each = p.look === 'rings' ? 'in each ring' : 'on each plate';
    const vg = (VGAP[sizeOf(ctx)] || VGAP.L)[2];
    const row = (inner) => `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, vg)};">${inner}</div>`;
    if (p.kind === 'group') return row(`${slot('answer', keys[0], true)}${word(`groups of ${p.k}`)}`);
    if (p.kind === 'left') return row(`${slot('each', keys[0], false)}${word(each)}`) + row(`${slot('left', keys[1], false)}${word('left over')}`);
    if (p.kind === 'fair') {
        const on = answered(ctx) ? keys[0] : '';
        const opt = (label) => `<div style="display:flex;align-items:center;gap:${L(ctx, 2.5)};"><span style="font-size:${P(ctx, tp)};">${esc(label)}</span>${checkBox(ctx, { id: label === 'Fair' ? 'fair' : 'notfair', on: on === label })}</div>`;
        return `<div style="display:flex;justify-content:center;gap:${L(ctx, 10)};margin-top:${L(ctx, 3.5)};">${opt('Fair')}${opt('Not fair')}</div>`;
    }
    return row(`${slot('answer', keys[0], true)}${word(each)}`);
}

register('share-plates', {
    render(p, ctx) {
        const g = geom(ctx, p);
        const top = p.kind === 'fair' ? '' : `<div style="display:flex;justify-content:center;">${rowPicture(ctx, p, g)}</div>`;
        const plates = p.kind === 'group' ? '' : platesRow(ctx, p, g);
        const joined = p.kind === 'left' ? ' data-mq-join=", "' : '';
        return root(ctx, 'share-plates', `${top}${plates}${frameHTML(ctx, p)}`, { attrs: ` data-share-kind="${esc(p.kind)}"${joined}` });
    },
    answerKey(p) {
        const keys = shareAnswers(p);
        const slots = {};
        if (p.kind === 'left') { slots.each = { value: keys[0], graded: true }; slots.left = { value: keys[1], graded: true }; }
        else if (p.kind === 'fair') { slots[keys[0] === 'Fair' ? 'fair' : 'notfair'] = { value: '✓', graded: true }; }
        else slots.answer = { value: keys[0], graded: true };
        return { value: keys.join(', '), display: keys.join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geom(ctx, p);
        const k = Number(p.k);
        const across = platesAcross(g, k);
        const plates = p.kind === 'group' ? 0 : across * g.pw + (across - 1) * PLATE_GAP;
        const n = Number(p.n);
        const row = p.kind === 'fair' ? 0 : (Math.min(p.kind === 'group' ? Math.max(k, k * Math.floor(6 / k)) : 5, n) - 1) * (g.d + GAP) + g.d;
        const w = Math.max(plates, row, 60) + 6;
        return { wMm: Math.ceil(w), hMm: null, measure: true, factLike: false, maxCols: w <= 88 ? 2 : 1, denseRoom: 1.05 };
    },
    inputs(p) {
        if (p.kind === 'left') return ['each', 'left'].map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
        if (p.kind === 'fair') return [{ id: 'fair', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});
