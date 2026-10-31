// js/modules/sheet/cells/family-check.js
// The `family-check` template (visual-quality lane 2026-10-31, design/audit/VISUAL_QUALITY.md 4.4):
// "Is it a fact family?" (addition:fact_family_sort).
//
//   the drawing   the three numbers in the library's FACT TRIANGLE, the largest number at the top
//                 (the whole), the other two at the base corners in the order shown (VQ-1: the
//                 relation is drawn - two parts make the whole - whether or not it holds)
//   the answer    the printed words "Yes" and "No" side by side, 12+ mm apart. ONE decision, so ONE
//                 slot (the pair, AK-2): on paper the pupil CIRCLES a word, the key rings the right
//                 one (1.5 pt), Error analysis rings the wrong one. No Answer line, no tick boxes, no
//                 Say frame in the graded cell (the Say line is the Model's, provider strings)
//   screen twin   the same triangle, the two words are buttons (>= 44 px, `data-mq-choice`) which
//                 screen-cell.js `wireTickBoxes` wires to the host's answer: one tap, one graded
//                 response, on the card, the online worksheet and the quiz
//
// payload: {nums: [the three, as shown], whole: the largest, parts: [the other two, as shown],
//           isFamily, labels: ['Yes', 'No'], correct: 0 | 1}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { factTriangle, factTriangleSize } from '../graphics/fact-triangle.js';
import { INK, GREY, L, P, B, isTwin, textPt, esc, FONT } from '../graphics/units.js';

export const FAMILY_CHECK = 'family-check';
const LABELS = ['Yes', 'No'];

const labelsOf = (p) => (Array.isArray(p.labels) && p.labels.length === 2 ? p.labels.map(String) : LABELS);
const correctOf = (p) => (Number(p.correct) === 1 ? 1 : 0);

/** Which word a state rings: the key's, the finished-but-wrong work's, or none. */
function ringedIndex(p, ctx) {
    if (!ctx || ctx.state === 'blank' || !ctx.state) return -1;
    if (ctx.state === 'wrong') {
        const w = String((ctx.wrong && ctx.wrong.value) || '').trim().toLowerCase();
        const i = labelsOf(p).findIndex((l) => l.toLowerCase() === w || l.charAt(0).toLowerCase() === w);
        return i >= 0 ? i : 1 - correctOf(p);
    }
    return correctOf(p);
}

register(FAMILY_CHECK, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const whole = Number(p.whole);
        const parts = Array.isArray(p.parts) && p.parts.length === 2 ? p.parts : (p.nums || []).filter((n, i, all) => i !== all.indexOf(whole));
        const tri = factTriangle(ctx, { top: whole, left: parts[0], right: parts[1] });
        const on = twin ? -1 : ringedIndex(p, ctx);
        const ink = on >= 0 ? (ctx.state === 'traced' ? 'trace' : 'solid') : null;
        const pt = textPt(ctx) + 6;
        const words = labelsOf(p).map((w, i) => {
            if (twin) {
                return `<button type="button" class="mq-choicebtn" data-mq-choice="${esc(w)}" aria-pressed="false" `
                    + `style="min-width:max(64px, ${L(ctx, 20)});min-height:max(48px, ${L(ctx, 12)});padding:0 ${L(ctx, 3)};border:${B(ctx, 1)} solid ${INK};border-radius:999px;`
                    + `background:#fff;color:${INK};${FONT}font-size:${P(ctx, pt)};font-weight:700;line-height:1;cursor:pointer;">${esc(w)}</button>`;
            }
            const ring = i === on
                ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -2.2)};top:${L(ctx, -1.6)};right:${L(ctx, -2.2)};bottom:${L(ctx, -1.6)};border:${B(ctx, 1.5)} solid ${ink === 'trace' ? GREY : INK};border-radius:50%;"></span>`
                : '';
            return `<span class="mq-fc-word" style="position:relative;display:inline-flex;align-items:center;justify-content:center;padding:${L(ctx, 1)} ${L(ctx, 2.5)};${FONT}font-size:${P(ctx, pt)};font-weight:700;line-height:1.1;color:${INK};">${esc(w)}${ring}</span>`;
        }).join('');
        // ONE decision, so ONE slot: the pair (the key rings one word, AK-2)
        const choice = twin
            ? `<div class="mq-fc-choice" role="group" aria-label="yes or no" style="display:flex;justify-content:center;gap:${L(ctx, 10)};">${words}</div>`
            : `<div class="mq-fc-choice" data-ws-slot="answer" data-ws-shape="choice"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:flex;justify-content:center;gap:${L(ctx, 12)};">${words}</div>`;
        const { wMm } = factTriangleSize(ctx);
        return `<div class="mq-fc k2-cell" data-read${twin ? ' data-mq-k2="1"' : ''} style="color:${INK};${FONT}text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 4)};padding:${L(ctx, 1)} 0;">`
            + `<div style="width:${L(ctx, wMm + 1)};max-width:100%;">${tri}</div>${choice}</div>`;
    },
    answerKey(p) {
        const lab = labelsOf(p)[correctOf(p)];
        return { value: lab, display: lab, slots: { answer: { value: lab, graded: true, accept: [lab.toLowerCase(), lab.charAt(0).toLowerCase()] } } };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 3 }; },
    inputs() { return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'choice' }; },
});
