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
// payload: {values: [n0 .. n4], blanks: [index, ...] (ascending)}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, sizeOf, inkOf, isTwin, shownParts } from './k2kit.js';

const TILE = { S: { w: 14, h: 14 }, M: { w: 14.5, h: 14.5 }, L: { w: 15, h: 15 } };

register('seqstrip', {
    render(p, ctx) {
        const t = TILE[sizeOf(ctx)] || TILE.L;
        const values = p.values || [];
        const blanks = (p.blanks || []).map(Number);
        const keyParts = blanks.map((i) => values[i]);
        const shown = shownParts(ctx, keyParts);
        const pt = Math.min(digitPt(ctx) * 0.72, 20);
        const fmt = (v) => Number(v).toLocaleString('en-US');
        const tiles = values.map((v, i) => {
            const k = blanks.indexOf(i);
            const base = `box-sizing:border-box;flex:none;width:${L(ctx, t.w)};height:${L(ctx, t.h)};display:flex;align-items:center;`
                + `justify-content:center;font-size:${P(ctx, pt)};font-weight:700;line-height:1;background:#fff;`;
            if (k < 0) return `<span class="k2-tile" style="${base}border:${B(ctx, 0.75)} solid ${INK};color:${INK};">${fmt(v)}</span>`;
            const val = shown[k];
            const ink = val !== '' ? inkOf(ctx) : null;
            const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
            return `<span class="k2-tile k2-tile-slot" data-ws-slot="b${k}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
                + `style="${base}border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};color:${ink === 'trace' ? GREY : INK};">`
                + `${val === '' ? '' : esc(fmt(val))}</span>`;
        }).join('');
        return root(ctx, 'k2-seqstrip', `<div class="k2-track" data-mq-join=", " style="display:flex;flex-wrap:nowrap;justify-content:center;`
            + `gap:${L(ctx, 1.5)};">${tiles}</div>`);
    },
    answerKey(p) {
        const parts = (p.blanks || []).map((i) => String((p.values || [])[i]));
        const slots = {};
        parts.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        return { value: parts.join(', '), display: parts.join(', '), slots };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs(p) {
        return (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list' }; },
});
