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
import { L, P, INK, SW, n2, svg, root, checkBox, textPt, digitPt } from './k2kit.js';

const C = 10;

function frame(ctx, n, solid) {
    const m = SW.heavy / 2, w = 5 * C, h = 2 * C;
    let s = `<rect x="${n2(m)}" y="${n2(m)}" width="${w}" height="${h}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    for (let k = 1; k < 5; k++) s += `<line x1="${n2(m + k * C)}" y1="${n2(m)}" x2="${n2(m + k * C)}" y2="${n2(m + h)}" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    s += `<line x1="${n2(m)}" y1="${n2(m + C)}" x2="${n2(m + w)}" y2="${n2(m + C)}" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    for (let k = 0; k < n; k++) {
        const cx = n2(m + (k % 5 + 0.5) * C), cy = n2(m + (Math.floor(k / 5) + 0.5) * C);
        s += solid ? `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`
            : `<circle cx="${cx}" cy="${cy}" r="${n2(3.4 - SW.heavy / 2)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`;
    }
    return svg(ctx, w + 2 * m, h + 2 * m, s, { label: `${n} counters` });
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
            + `<b style="width:${L(ctx, 7)};text-align:right;font-size:${P(ctx, digitPt(ctx) * 0.8)};line-height:1;">${name}</b>${frame(ctx, n, solid)}</div>`;
        const ticks = (p.labels || []).map((lab, i) => `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, 1.5)} 0;">`
            + `<span style="min-width:${L(ctx, 34)};text-align:left;font-size:${P(ctx, textPt(ctx) + 2)};">${esc(lab)}</span>`
            + checkBox(ctx, { id: `c${i}`, on: on === i, slot: false }) + `</div>`).join('');
        return root(ctx, 'k2-compare', `<div style="display:inline-block;text-align:left;">${row('A', p.a, true)}${row('B', p.b, false)}</div>`
            // ONE decision, so ONE slot: the pair of boxes (the key checks one of them, AK-2).
            + `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};"><div data-ws-slot="answer" data-ws-shape="check"`
            + `${on >= 0 ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : ''} style="display:inline-block;font-weight:700;">${ticks}</div></div>`);
    },
    answerKey(p) {
        const i = p.correct || 0;
        return { value: (p.values || [])[i], display: (p.labels || [])[i], slots: { answer: { value: (p.labels || [])[i], graded: true } } };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs() { return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'choice' }; },
});
