// js/modules/sheet/cells/compare.js
// The `compare` template: two groups to compare (compare_groups).
//
// Group A and group B each sit in the SAME fixed 2 x 5 frame (RP-10, 10 mm cells), one above the
// other with their left edges aligned, filled top row first, left to right (RP-11) — so the two
// groups line up column by column and the pupil matches them one to one. The frame never
// changes size with the count, so its size never stands in for the number. Set A is solid
// (6 mm, under INK-5's 7 mm), set B hollow (RP-11). Under the frames, two labelled check boxes
// (the box on the right of its label, P-TH-11) are the ONLY answer place: no line, no blank.
// The labels carry the question ("A has more" / "B has more"), so a page of them reads without a
// sentence in the cell.
//
// Key (AK-1): the right box checked. Error analysis checks the wrong one (state `wrong`). In the
// screen twin each row is a label span + an empty bordered box span, which screen-cell.js
// `wireTickBoxes` turns into one tap target per row.
//
// payload: {a, b, labels: [l0, l1], values: [v0, v1], correct: 0|1}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, INK, GREY, SW, n2, svg, root, checkBox, textPt, digitPt, shapeOf, pscale, k2StepCtx, workInk, ringWrap } from './k2kit.js';
import { dicePicture } from './counters.js';

/** The frame's cell (mm): 10 at L, scaled with the sheet size (critic guided-r1: S drew at L's size). */
const cellOf = (ctx) => 10 * pscale(ctx);

/** The body of one group's frame at (0, y0): the 2 x 5 grid and its n counters. */
function frameBody(ctx, n, solid, y0 = 0) {
    const C = cellOf(ctx), k = pscale(ctx);
    const m = SW.heavy / 2, w = 5 * C, h = 2 * C;
    let s = `<rect x="${n2(m)}" y="${n2(y0 + m)}" width="${n2(w)}" height="${n2(h)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    for (let j = 1; j < 5; j++) s += `<line x1="${n2(m + j * C)}" y1="${n2(y0 + m)}" x2="${n2(m + j * C)}" y2="${n2(y0 + m + h)}" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    s += `<line x1="${n2(m)}" y1="${n2(y0 + m + C)}" x2="${n2(m + w)}" y2="${n2(y0 + m + C)}" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let j = 0; j < n; j++) {
        const cx = n2(m + (j % 5 + 0.5) * C), cy = n2(y0 + m + (Math.floor(j / 5) + 0.5) * C);
        s += solid ? `<circle cx="${cx}" cy="${cy}" r="${n2(3 * k)}" fill="${INK}"/>`
            : `<circle cx="${cx}" cy="${cy}" r="${n2(3.4 * k - SW.heavy / 2)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    }
    return s;
}

/** The body of one group drawn as shapes / pictures on the frame's grid, at (0, y0). */
function shapesBody(ctx, n, p, y0 = 0) {
    const C = cellOf(ctx), m = SW.heavy / 2, d = 8 * pscale(ctx);
    let s = '';
    for (let j = 0; j < n; j++) s += `<g transform="translate(0 ${n2(y0)})">${shapeOf(p.shape).draw(m + (j % 5 + 0.5) * C, m + (Math.floor(j / 5) + 0.5) * C, d)}</g>`;
    return s;
}

function frame(ctx, n, solid) {
    const C = cellOf(ctx);
    const m = SW.heavy / 2, w = 5 * C, h = 2 * C;
    return svg(ctx, w + 2 * m, h + 2 * m, frameBody(ctx, n, solid), { label: `${n} counters` });
}
/**
 * O6 AP1 "Objects" (payload.objects): a group drawn WITHOUT the frame, on the frame's own grid of
 * two rows of five, so group A and group B still line up column by column (one-to-one matching,
 * RP-21 rows of five). `shapes` and `pictures` draw one outline object of payload.shape per place
 * (8 mm on the 10 mm pitch: 2 mm between two objects); `dice` draws the count as dice faces of up
 * to six (the count_objects dice), compared by their dot patterns.
 */
function group(ctx, n, solid, p) {
    if (p.objects === 'dice') return dicePicture(ctx, n);
    if (p.objects !== 'shapes' && p.objects !== 'pictures') return frame(ctx, n, solid);
    const C = cellOf(ctx), m = SW.heavy / 2, rows = n > 5 ? 2 : 1;
    // The drawing keeps the frame's full width (five places), so the two groups share a left edge
    // and a column pitch whatever their counts.
    return svg(ctx, 5 * C + 2 * m, rows * C + 2 * m, shapesBody(ctx, n, p), { label: `${n} ${shapeOf(p.shape).plural}` });
}

/**
 * The Model's one-to-one matching (critic guided-r1: "Step 1 is draw a line from each one in A to
 * one in B, but the Model draws no lines"): both groups in ONE drawing, A over B, and a grey
 * connector from each object of A to its partner in B, run down the free edge of the column (the
 * right edge for the top row, the left edge for the bottom row) so it never crosses an object.
 * The objects left over show which group has more. Returns {svg, hA, hB, gap} (mm) or null (dice).
 */
function matchedPicture(ctx, p, { lines = 'trace', left = '' } = {}) {
    if (p.objects === 'dice') return null;
    const C = cellOf(ctx), m = SW.heavy / 2, k = pscale(ctx);
    const shapes = p.objects === 'shapes' || p.objects === 'pictures';
    const rowsOf = (n) => (shapes ? (n > 5 ? 2 : 1) : 2);
    const hA = rowsOf(p.a) * C + 2 * m, hB = rowsOf(p.b) * C + 2 * m, gap = 3;
    const yB = hA + gap;
    let s = shapes ? shapesBody(ctx, p.a, p, 0) + shapesBody(ctx, p.b, p, yB) : frameBody(ctx, p.a, true, 0) + frameBody(ctx, p.b, false, yB);
    // the connector runs midway between the object's edge and the grid line, in 1.5 pt grey
    const r = (shapes ? 4 : 3.4) * k, off = (r + C / 2) / 2;
    for (let j = 0; j < Math.min(p.a, p.b); j++) {
        const cx = m + (j % 5 + 0.5) * C, row = Math.floor(j / 5);
        const ya = m + (row + 0.5) * C, yb = yB + m + (row + 0.5) * C;
        const side = row === 0 ? 1 : -1;
        const x0 = cx + side * r, x1 = cx + side * off;
        const col = lines === 'trace' ? GREY : INK;
        s += `<path d="M${n2(x0)} ${n2(ya)}H${n2(x1)}V${n2(yb)}H${n2(x0)}" fill="none" stroke="${col}" stroke-width="${n2(SW.heavy)}" stroke-linejoin="round"${lines === 'trace' ? ' data-ws-ink="trace"' : ''}/>`;
    }
    // the ones with no partner, ringed (a model's second step)
    if (left) {
        const col = left === 'trace' ? GREY : INK;
        const big = p.a > p.b, from = Math.min(p.a, p.b), to = Math.max(p.a, p.b), y0 = big ? 0 : yB;
        for (let j = from; j < to; j++) {
            const cx = m + (j % 5 + 0.5) * C, cy = y0 + m + (Math.floor(j / 5) + 0.5) * C;
            s += `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(C / 2 - 0.5)}" fill="none" stroke="${col}" stroke-width="${n2(SW.heavy)}"${left === 'trace' ? ' data-ws-ink="trace"' : ''}/>`;
        }
    }
    return { svg: svg(ctx, 5 * C + 2 * m, yB + hB, s, { label: `${p.a} and ${p.b}, matched one to one` }), hA, hB, gap };
}

/** Which box a state checks: the key's, the wrong work's, or none. */
function checkedIndex(p, ctx) {
    if (ctx.state === 'blank') return -1;
    if (ctx.state === 'wrong') {
        const w = String((ctx.wrong && ctx.wrong.value) || '').trim().toLowerCase();
        const i = (p.values || []).findIndex((v) => String(v).toLowerCase() === w);
        const j = (p.labels || []).findIndex((v) => String(v).toLowerCase() === w);
        return i >= 0 ? i : j >= 0 ? j : 1 - (p.correct || 0);
    }
    return p.correct || 0;
}

register('compare', {
    render(p, ctx) {
        const on = checkedIndex(p, ctx);
        const row = (name, n, solid) => `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, 1.5)} 0;">`
            + `<b style="width:${L(ctx, 7)};text-align:right;font-size:${P(ctx, digitPt(ctx) * 0.8)};line-height:1;">${name}</b>${group(ctx, n, solid, p)}`
            // P11 hint (Support level 2): how many, written beside each frame, so the pupil can
            // compare two numbers instead of matching one to one. Faded at level 1 (absent).
            + `${p.showCounts ? `<span data-k2-count="1" style="font-size:${P(ctx, digitPt(ctx) * 0.8)};font-weight:700;line-height:1;">${esc(n)}</span>` : ''}</div>`;
        // the Model (traced): the two groups matched one to one in grey; a scripted model's states
        // (ctx.work) add the lines, the leftovers and the winner's name one step at a time
        const lines = ctx.work ? workInk(ctx, 'match') : ctx.state === 'traced' ? 'trace' : '';
        const mp = lines ? matchedPicture(ctx, p, { lines, left: ctx.work ? workInk(ctx, 'left') : '' }) : null;
        const winner = p.correct === 1 ? 'B' : 'A';
        const lab = (t, h) => `<div style="height:${L(ctx, h)};display:flex;align-items:center;justify-content:flex-end;">`
            + `<b style="font-size:${P(ctx, digitPt(ctx) * 0.8)};line-height:1;">${ctx.work && t === winner ? ringWrap(ctx, t, workInk(ctx, 'win')) : t}</b></div>`;
        const cnt = (n, h) => `<div style="height:${L(ctx, h)};display:flex;align-items:center;">`
            + `<span data-k2-count="1" style="font-size:${P(ctx, digitPt(ctx) * 0.8)};font-weight:700;line-height:1;">${esc(n)}</span></div>`;
        const groups = mp
            ? `<div style="display:flex;align-items:flex-start;gap:${L(ctx, 3)};margin:${L(ctx, 1.5)} 0;">`
                + `<div style="width:${L(ctx, 7)};">${lab('A', mp.hA)}<div style="height:${L(ctx, mp.gap)};"></div>${lab('B', mp.hB)}</div>${mp.svg}`
                + `${p.showCounts ? `<div>${cnt(p.a, mp.hA)}<div style="height:${L(ctx, mp.gap)};"></div>${cnt(p.b, mp.hB)}</div>` : ''}</div>`
            : `${row('A', p.a, true)}${row('B', p.b, false)}`;
        // R3 (critic round 3): every label sits in ONE fixed width (the longest label's), so the
        // boxes stand in one column instead of staggering after "Same" and "Not the same".
        const longest = Math.max(0, ...(p.labels || []).map((l) => String(l).length));
        const labMm = Math.max(34, Math.ceil(longest * (textPt(ctx) + 2) * 0.52 * 0.3528) + 2);
        const ticks = (p.labels || []).map((lab, i) => `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, 1.5)} 0;">`
            + `<span style="flex:none;width:${L(ctx, labMm)};white-space:nowrap;text-align:left;font-size:${P(ctx, textPt(ctx) + 2)};">${esc(lab)}</span>`
            + checkBox(ctx, { id: `c${i}`, on: on === i, slot: false }) + `</div>`).join('');
        return root(ctx, 'k2-compare', `<div style="display:inline-block;text-align:left;">${groups}</div>`
            // ONE decision, so ONE slot: the pair of boxes (the key checks one of them, AK-2).
            + `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};"><div data-ws-slot="answer" data-ws-shape="check"`
            + `${on >= 0 ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : ''} style="display:inline-block;font-weight:700;">${ticks}</div></div>`);
    },
    answerKey(p) {
        const i = p.correct || 0;
        return { value: (p.values || [])[i], display: (p.labels || [])[i], slots: { answer: { value: (p.labels || [])[i], graded: true } } };
    },
    // S draws the frames at 0.8 (8 mm cells): a group and its label are 51 mm, so a third of the
    // page holds it and S prints more items than L (L1); measurement decides the rest
    footprint(p, ctx) {
        const small = ctx && ctx.size === 'S';
        return { wMm: small ? 62 : 93, hMm: null, measure: true, factLike: false, maxCols: small ? 3 : 2 };
    },
    inputs() { return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'choice' }; },
    /** PT-MOD-1: model states from the provider's work marks (match, left, win) and the answer. */
    modelStates: (p) => !!p && p.objects !== 'dice',
    stepState(p, steps, k, ctx) { return this.render(p, k2StepCtx(steps, k, ctx)); },
});
