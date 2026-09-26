// js/modules/sheet/cells/seqstrip.js
// The `seqstrip` template: a number track with missing numbers (number_seq_fill).
//
// Five tiles in one row, 15 x 15 mm at L, 1.5 mm apart: the given numbers in plain 0.75 pt tiles,
// the missing ones as EMPTY writing boxes in their own place in the track (1.5 pt, the SL-11
// corner), so the pupil writes where the number belongs — never on a line under the strip. Each
// box is at least 14 mm wide (RUBRIC H9) and holds a three-digit number at the track's digit
// size. Nothing else is printed: no "Numbers 71-80" or "10s: 3-93" caption, which named the ends
// of the track and so gave the first and last blanks away. The step is read off the numbers.
//
// Key (AK-1, AK-2): the same track with each missing number written in its box. In the screen
// twin each box carries `data-mq-cell`: one input per box, joined ", " in reading order into the
// host input (which is what `q.ans` holds). The twin is sized in `--mq-k2` px and five tiles fit a
// 390 px phone without wrapping or overlapping.
//
// A track of more than five tiles wraps to two even rows, so no item forces the page to one
// column (five tiles are 81 mm at L, inside a 2-column cell).
//
// payload: {values: [n0 .. n4], blanks: [index, ...] (ascending), shown?: [..] | {index: v}}
//   `shape` (option, 2026-09-25): 'circle' | 'hex' | 'mixed' draws the tiles as outline shapes
//     (shapes.js); absent or 'box' is the square tile below.
//   `shown` (Error analysis): a value printed in a tile of the finished track - a wrong given
//   tile to find, or the pupil's finished work in a blank - in every state.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, sizeOf, inkOf, isTwin, shownParts } from './k2kit.js';
import { tile as shapeTile, tileSize, shapeAt } from './shapes.js';

const TILE = { S: { w: 14, h: 14 }, M: { w: 14.5, h: 14.5 }, L: { w: 15, h: 15 } };
const GAP_MM = 1.5;
/** At most this many tiles in one row: five 15 mm tiles are 81 mm, inside a 2-column cell. */
export const SEQ_ROW_MAX = 5;

/** Tiles per row: the whole track up to five, else the track wraps to two even rows. */
const perRowOf = (n) => (n <= SEQ_ROW_MAX ? Math.max(1, n) : Math.ceil(n / 2));
/** Width (mm) of one row of the track at this size. */
const rowMm = (n, size, shape) => {
    const t0 = TILE[size] || TILE.L;
    // A shaped track (option `shape`, 2026-09-25): a hexagon is a little wider than a box.
    const t = shape && shape !== 'box' ? tileSize(shape === 'mixed' ? 'hex' : shape, t0.w, t0.h) : t0;
    const k = perRowOf(n);
    return k * t.w + (k - 1) * GAP_MM;
};

/**
 * `shown` (Error analysis, SKILL_CELL_CONTRACT.md): a value printed in a tile of the finished
 * track, in every state - an array aligned with `values` (null / undefined = none) or a map
 * {index: value}. On a GIVEN tile it replaces the printed number (the wrong tile a pupil must
 * find); on a blank it is the pupil's finished work written in the box (solid ink).
 */
const shownAt = (p, i) => {
    const s = p.shown;
    if (s === undefined || s === null) return undefined;
    const v = Array.isArray(s) ? s[i] : s[i] !== undefined ? s[i] : s[String(i)];
    return v === undefined || v === null || v === '' ? undefined : v;
};

register('seqstrip', {
    render(p, ctx) {
        const size = sizeOf(ctx);
        const t = TILE[size] || TILE.L;
        const values = p.values || [];
        const blanks = (p.blanks || []).map(Number);
        const keyParts = blanks.map((i) => values[i]);
        const shown = shownParts(ctx, keyParts);
        const pt = Math.min(digitPt(ctx) * 0.72, 20);
        const fmt = (v) => (Number.isFinite(Number(v)) && String(v).trim() !== '' ? Number(v).toLocaleString('en-US') : String(v));
        const shaped = p.shape && p.shape !== 'box';
        const tiles = values.map((v, i) => {
            const k = blanks.indexOf(i);
            const over = shownAt(p, i);
            if (shaped) {
                // Circles / hexagons (outlines only): the given numbers in a thin outline, the
                // missing ones in a heavy one, the digits inside at the track's size.
                const sh = shapeAt(p.shape, i);
                const sz = tileSize(sh, t.w, t.h);
                if (k < 0) return shapeTile(ctx, { shape: sh, w: sz.w, h: sz.h, pt, value: fmt(over !== undefined ? over : v), shown: over !== undefined });
                const val = over !== undefined ? String(over) : shown[k];
                const ink = over !== undefined ? 'solid' : val !== '' ? inkOf(ctx) : null;
                return shapeTile(ctx, { shape: sh, w: sz.w, h: sz.h, pt, value: val === '' ? '' : fmt(val), slot: { id: `b${k}`, mark: 'cell' }, ink, heavy: true, shown: over !== undefined });
            }
            const base = `box-sizing:border-box;flex:none;width:${L(ctx, t.w)};height:${L(ctx, t.h)};display:flex;align-items:center;`
                + `justify-content:center;font-size:${P(ctx, pt)};font-weight:700;line-height:1;background:#fff;`;
            if (k < 0) {
                return `<span class="k2-tile"${over !== undefined ? ' data-ws-shown="1"' : ''} style="${base}border:${B(ctx, 0.75)} solid ${INK};color:${INK};">`
                    + `${esc(fmt(over !== undefined ? over : v))}</span>`;
            }
            const val = over !== undefined ? String(over) : shown[k];
            const ink = over !== undefined ? 'solid' : val !== '' ? inkOf(ctx) : null;
            const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
            return `<span class="k2-tile k2-tile-slot" data-ws-slot="b${k}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}`
                + `${over !== undefined ? ' data-ws-shown="1"' : ''}${hook} `
                + `style="${base}border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};color:${ink === 'trace' ? GREY : INK};">`
                + `${val === '' ? '' : esc(fmt(val))}</span>`;
        }).join('');
        // A track of more than five tiles wraps to two even rows, so the cell stays inside a
        // 2-column page (one reading order: the twin's inputs still join left to right, top row
        // first).
        const wrap = values.length > SEQ_ROW_MAX;
        // one line never wraps on screen either (critic k2-r2: the path wrapped 4 + 1 on the
        // worksheet): data-mq-nowrap makes the screen fit shrink the tiles instead
        return root(ctx, 'k2-seqstrip', `<div class="k2-track" data-mq-join=", "${wrap ? '' : ' data-mq-nowrap="1"'} style="display:flex;flex-wrap:${wrap ? 'wrap' : 'nowrap'};justify-content:center;`
            + `${wrap ? `max-width:${L(ctx, rowMm(values.length, size, p.shape) + 0.5)};margin:0 auto;` : ''}gap:${L(ctx, GAP_MM)};">${tiles}</div>`);
    },
    answerKey(p) {
        const parts = (p.blanks || []).map((i) => String((p.values || [])[i]));
        const slots = {};
        parts.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        return { value: parts.join(', '), display: parts.join(', '), slots };
    },
    footprint(p, ctx) {
        // The widest row and the side pads: 81 + 8 mm for five tiles at L, so 2 columns fit.
        const w = rowMm(((p && p.values) || []).length || SEQ_ROW_MAX, sizeOf(ctx), p && p.shape);
        return { wMm: Math.ceil(w + 8), hMm: null, measure: true, factLike: false, maxCols: w + 8 <= 93 ? 2 : 1 };
    },
    inputs(p) {
        return (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list' }; },
});
