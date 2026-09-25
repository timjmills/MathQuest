// js/modules/sheet/cells/count-row.js
// The `count-row` template: ONE row of a count (count_by_tables: "Count by 1-12") or of a number
// pattern (number_patterns_rule), with the missing numbers as writing places IN the row.
//
// Two looks, one template (owner's examples, 2026-09-25):
//
//   'arcs'   the skip-count row:   [7>  7 ⌒ __ ⌒ 21 ⌒ __ ⌒ 35 ⌒ ... ⌒ __
//            The step sits in a bold boxed tab at the left of the row (a pentagon pointing into
//            the row). A hop arc joins every pair of neighbouring numbers along the top. Printed
//            numbers stand plain under the arcs; each missing number is an EMPTY writing box
//            (SL-11) in its own place, never a line under the row. Twelve numbers fit one row of
//            the 186 mm live width at every size (14 mm pitch at L), so a page stacks one row
//            per table, about ten rows at M.
//   'train'  the pattern track:   [ 5 ][   ][ 15 ][   ][   ]      Rule: add [   ] each time
//            Every number in a tile: printed ones in a 0.75 pt outline, missing ones in a
//            1.5 pt outline. An optional printed rule caption stands above the track ("Rule:
//            count on by 5."), or, when the pupil must find the rule, a rule frame with one box
//            stands under it.
//
// SHAPES (option `shape`): the tiles and boxes can be boxes, circles or hexagons (or circles and
// hexagons in turn), outlines only - see shapes.js. A shaped track that does not fit one row wraps
// to two even rows (the owner's "wrap to 2 rows of 6").
//
// Key (AK-1, AK-2): the same row with every missing number written in its box, and the rule's
// number in the rule box. In the screen twin every box carries `data-mq-cell` (one input each,
// joined ", " in reading order, the rule box last - which is what `q.ans` holds). The twin wraps
// to rows of at most six, so a box stays >= 44 px on a 390 px phone.
//
// payload: {
//   values: [n0 ..], blanks: [index, ...] (ascending), look: 'arcs' | 'train',
//   tab?: '7'                         the step tab of an 'arcs' row
//   shape?: 'box'|'circle'|'hex'|'mixed'
//   rule?: 'Rule: count on by 5.'     a printed rule caption (the rule is given)
//   ruleBox?: {pre: 'Rule: add', post: 'each time', value: '5'}   the pupil writes the rule
//   shown?: {index: value}            Error analysis: a value printed in the finished row
// }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, textPt, sizeOf, inkOf, isTwin, S, SW, n2 } from './k2kit.js';
import { tile, tileSize, shapeAt } from './shapes.js';

/** The widest box pitch of an 'arcs' row (mm), and the narrowest box a size may print. */
const PITCH = { S: 13.5, M: 14, L: 15.5 };
const MIN_BOX = { S: 11, M: 11.5, L: 14 };
const TAB_MM = { S: 10, M: 10.5, L: 11 };
const GAP_MM = 1.5;
/** The width a one-column cell gives its content (186 mm less the cell's pads). */
const LIVE_MM = 172;
/** Most boxes in one row of the screen twin: four (and the step tab) fit a 390 px phone at >= 44 px a box. */
const TWIN_ROW = 4;

const fmt = (v) => (Number.isFinite(Number(v)) && String(v).trim() !== '' ? Number(v).toLocaleString('en-US') : String(v));
const maxDigits = (p) => Math.max(1, ...(p.values || []).map((v) => fmt(v).length));

/**
 * The geometry of one render: box size, pitch, how many numbers stand in a row. An 'arcs' row
 * of twelve stands on ONE line when its boxes can stay at least MIN_BOX wide (S and M: a page of
 * about ten tables); otherwise (L, or a shaped track) it wraps to two even lines of six, so no box
 * is ever squeezed below the size's writing width (RUBRIC H9: 14 mm at L).
 */
function geom(p, ctx) {
    const size = sizeOf(ctx);
    const n = (p.values || []).length || 1;
    const look = p.look === 'train' ? 'train' : 'arcs';
    const shape = p.shape || 'box';
    const wide = Math.max(0, maxDigits(p) - 3) * 3;               // "1,000" needs a wider box
    const tab = look === 'arcs' && p.tab ? TAB_MM[size] + 2 : 0;
    const baseH = S(ctx).writeMm + 2.5;
    let boxW = (look === 'arcs' ? PITCH[size] - GAP_MM : 14) + wide;
    let perRow = n;
    if (look === 'arcs') {
        const fitPitch = (LIVE_MM - tab + GAP_MM) / n;
        if (shape === 'box' && fitPitch - GAP_MM >= MIN_BOX[size] + wide) boxW = Math.min(boxW, fitPitch - GAP_MM);
        else perRow = Math.ceil(n / 2);
    }
    const sz = shape === 'box' ? { w: boxW, h: baseH } : tileSize(shape === 'mixed' ? 'hex' : shape, boxW, baseH);
    const pitch = sz.w + GAP_MM;
    const fitN = Math.max(1, Math.floor((LIVE_MM - tab + GAP_MM) / pitch));
    if (fitN < perRow) perRow = Math.ceil(n / Math.ceil(n / fitN));
    if (isTwin(ctx) && perRow > TWIN_ROW) perRow = Math.ceil(n / Math.ceil(n / TWIN_ROW));
    const rows = Math.ceil(n / perRow);
    const arcH = look === 'arcs' ? 3.8 : 0;
    const pt = Math.min(digitPt(ctx) * 0.64, 18, (sz.w - 2) / (0.56 * Math.max(2, maxDigits(p))) * 72 / 25.4);
    return { size, n, look, shape, w: sz.w, h: sz.h, pitch, tab, perRow, rows, arcH, pt };
}

/** The keyed values in reading order: the missing numbers, then the rule's number. */
function keyParts(p) {
    const parts = (p.blanks || []).map((i) => String((p.values || [])[i]));
    if (p.ruleBox && p.ruleBox.value !== undefined && p.ruleBox.value !== null) parts.push(String(p.ruleBox.value));
    return parts;
}

/** What each slot shows in this state (Error analysis: the pupil's finished work). */
function shownValues(p, ctx) {
    const key = keyParts(p);
    if (ctx.state === 'blank') return key.map(() => '');
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value);
        const parts = raw.split(/\s*,\s*/).filter((s) => s !== '');
        return key.map((k, i) => {
            const id = i < (p.blanks || []).length ? `b${i}` : 'rule';
            if (w.slots && w.slots[id] !== undefined) return String(w.slots[id]);
            return parts[i] !== undefined ? parts[i] : k;
        });
    }
    return key;
}

const shownAt = (p, i) => {
    const s = p.shown;
    if (!s) return undefined;
    const v = s[i] !== undefined ? s[i] : s[String(i)];
    return v === undefined || v === null || v === '' ? undefined : v;
};

/** The step tab: a bold number in a pentagon pointing into the row ("7>"). */
function stepTab(ctx, g, text) {
    const w = TAB_MM[g.size], h = g.h;
    const sw = SW.heavy;
    const body = `<polygon points="${n2(sw)},${n2(sw)} ${n2(w - 3.2)},${n2(sw)} ${n2(w - sw)},${n2(h / 2)} ${n2(w - 3.2)},${n2(h - sw)} ${n2(sw)},${n2(h - sw)}" `
        + `fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round"/>`
        + `<text x="${n2((w - 3) / 2 + 0.3)}" y="${n2(h / 2)}" dominant-baseline="central" text-anchor="middle" font-family="Andika, sans-serif" `
        + `font-weight="700" font-size="${n2(Math.min(g.pt * 1.05, 20) * 25.4 / 72)}" fill="${INK}">${esc(text)}</text>`;
    return `<span class="k2-steptab" data-ws-steptab="${esc(text)}" style="flex:none;display:inline-block;width:${L(ctx, w)};height:${L(ctx, h)};margin-right:${L(ctx, 2)};">`
        + `<svg viewBox="0 0 ${n2(w)} ${n2(h)}" role="img" aria-label="count by ${esc(text)}" style="display:block;width:100%;height:100%;overflow:visible;">${body}</svg></span>`;
}

/** The hop arcs over one row of `k` numbers. */
function arcsSVG(ctx, g, k) {
    const W = k * g.pitch - GAP_MM, H = g.arcH;
    let d = '';
    for (let i = 0; i < k - 1; i++) {
        const a = i * g.pitch + g.w / 2 + 1.2, b = (i + 1) * g.pitch + g.w / 2 - 1.2;
        d += `M${n2(a)} ${n2(H)} Q${n2((a + b) / 2)} ${n2(-H * 0.55)} ${n2(b)} ${n2(H)} `;
        // a small arrowhead where the hop lands
        d += `M${n2(b - 1.3)} ${n2(H - 1.1)} L${n2(b)} ${n2(H)} L${n2(b + 0.2)} ${n2(H - 1.5)} `;
    }
    return `<svg aria-hidden="true" viewBox="0 0 ${n2(W)} ${n2(H)}" style="display:block;width:${L(ctx, W)};height:${L(ctx, H)};overflow:visible;">`
        + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

register('count-row', {
    render(p, ctx) {
        const g = geom(p, ctx);
        const values = p.values || [];
        const blanks = (p.blanks || []).map(Number);
        const shown = shownValues(p, ctx);
        const ink = inkOf(ctx);
        const plainGiven = g.look === 'arcs' && g.shape === 'box';
        const cells = values.map((v, i) => {
            const k = blanks.indexOf(i);
            const over = shownAt(p, i);
            const sh = shapeAt(g.shape, i);
            if (k < 0) {
                const text = fmt(over !== undefined ? over : v);
                if (plainGiven) {
                    return `<span class="k2-given"${over !== undefined ? ' data-ws-shown="1"' : ''} style="flex:none;display:inline-flex;align-items:center;justify-content:center;`
                        + `width:${L(ctx, g.w)};height:${L(ctx, g.h)};font-size:${P(ctx, g.pt)};font-weight:700;line-height:1;">${esc(text)}</span>`;
                }
                return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: text, shown: over !== undefined });
            }
            const val = over !== undefined ? String(over) : shown[k];
            const vInk = over !== undefined ? 'solid' : val !== '' ? ink : null;
            return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: val === '' ? '' : fmt(val), slot: { id: `b${k}`, mark: 'cell' }, ink: vInk, heavy: true, shown: over !== undefined });
        });
        const rowsHtml = [];
        for (let r = 0; r < g.rows; r++) {
            const part = cells.slice(r * g.perRow, (r + 1) * g.perRow);
            const arcs = g.look === 'arcs' ? arcsSVG(ctx, g, part.length) : '';
            const tabCol = g.tab ? (r === 0 ? stepTab(ctx, g, p.tab) : `<span style="flex:none;width:${L(ctx, TAB_MM[g.size] + 2)};"></span>`) : '';
            rowsHtml.push(`<div class="k2-countrow-line" style="display:flex;align-items:flex-end;justify-content:${g.tab ? 'flex-start' : 'center'};${r ? `margin-top:${L(ctx, 2.5)};` : ''}">`
                + `${tabCol}<div style="display:flex;flex-direction:column;align-items:flex-start;">${arcs}`
                + `<div style="display:flex;gap:${L(ctx, GAP_MM)};${arcs ? `margin-top:${L(ctx, 0.6)};` : ''}">${part.join('')}</div></div></div>`);
        }
        let caption = '';
        if (p.rule) {
            caption = `<div class="k2-rule" style="font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1.3;margin-bottom:${L(ctx, 2)};">${esc(p.rule)}</div>`;
        }
        let ruleFrame = '';
        if (p.ruleBox) {
            const k = blanks.length;
            const val = shown[k];
            const vInk = val !== '' ? ink : null;
            const rb = tile(ctx, { shape: 'box', w: 14 + Math.max(0, String(p.ruleBox.value).length - 3) * 3, h: g.h, pt: g.pt, value: val === '' ? '' : fmt(val), slot: { id: 'rule', mark: 'cell' }, ink: vInk, heavy: true });
            ruleFrame = `<div class="k2-rulebox" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 3)};`
                + `font-size:${P(ctx, textPt(ctx))};font-weight:400;white-space:nowrap;">`
                + `<span>${esc(p.ruleBox.pre || 'Rule:')}</span>${rb}${p.ruleBox.post ? `<span>${esc(p.ruleBox.post)}</span>` : ''}</div>`;
        }
        const align = g.tab ? 'left' : 'center';
        return root(ctx, `k2-countrow k2-countrow-${g.look}`,
            `${caption}<div class="k2-countrow-body" data-mq-join=", " style="display:inline-block;text-align:left;">${rowsHtml.join('')}</div>${ruleFrame}`,
            { style: `text-align:${align};` });
    },
    answerKey(p) {
        const parts = keyParts(p);
        const slots = {};
        (p.blanks || []).forEach((_, i) => { slots[`b${i}`] = { value: parts[i], graded: true }; });
        if (p.ruleBox) slots.rule = { value: parts[parts.length - 1], graded: true };
        return { value: parts.join(', '), display: parts.map(fmt).join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geom(p, ctx || {});
        const w = g.tab + g.perRow * g.pitch - GAP_MM + 4;
        const h = g.rows * (g.arcH + g.h) + (g.rows - 1) * 2.5 + (p.rule ? 8 : 0) + (p.ruleBox ? g.h + 3 : 0) + 3;
        // denseRoom 1: a page of count-by rows packs one row per table, 9-12 at M (owner), each cell
        // exactly its measured height (the arcs and the pads are already in it).
        return { wMm: Math.ceil(w), hMm: Math.ceil(h), measure: true, factLike: false, maxCols: w <= 90 ? 2 : 1, denseRoom: 1 };
    },
    inputs(p) {
        const out = (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
        if (p.ruleBox) out.push({ id: 'rule', kind: 'number', shape: 'box', graded: true, order: out.length, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        return out;
    },
    layout(p) { return { card: (p && (p.values || []).length > 6) ? 'card-wide-visual' : 'card-medium-visual', checker: 'list' }; },
});
