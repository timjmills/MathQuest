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
//   paper         centred in the cell to the right of the item tab (CL-40: nothing paints in the tab's keep-out)
//   screen twin   the same triangle, the two words are buttons (>= 44 px, `data-mq-choice`) which
//                 screen-cell.js `wireTickBoxes` wires to the host's answer: one tap, one graded
//                 response, on the card, the online worksheet and the quiz
//
//   support      option `familyChart` (skill-options.js, default off; owner 2026-10-31): payload `chart: true`
//                draws the library's BLANK number-family chart beside the triangle (graphics/family-chart.js):
//                the four sentences as empty boxes, signs printed. Working space only - every box is
//                `data-ws-graded="0"`, the Yes / No pair stays the one graded slot. The key writes the four
//                facts for a true family and leaves the chart blank for a false one (there is no family to
//                write). On paper the chart sits UNDER the triangle at S (two across, 4 a page) and BESIDE it at
//                M and L (one wide cell a row, 3 a page: under, those cells double in height and hold 2 a page);
//                the triangle never shrinks.
//
// payload: {nums: [the three, as shown], whole: the largest, parts: [the other two, as shown],
//           isFamily, labels: ['Yes', 'No'], correct: 0 | 1, chart: false | true, op: '+' | '*'}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { factTriangle, factTriangleSize } from '../graphics/fact-triangle.js';
import { familyChart, familyChartSize, familyFacts } from '../graphics/family-chart.js';
import { INK, GREY, L, P, B, isTwin, sizeOf, textPt, esc, FONT } from '../graphics/units.js';

export const FAMILY_CHECK = 'family-check';
const LABELS = ['Yes', 'No'];

const labelsOf = (p) => (Array.isArray(p.labels) && p.labels.length === 2 ? p.labels.map(String) : LABELS);
const correctOf = (p) => (Number(p.correct) === 1 ? 1 : 0);
const chartOn = (p) => !!(p && (p.chart === true || p.chart === 'on'));
/** Size S stacks the chart under the triangle (two cells across); M and L set it beside (one wide cell a row). */
const underChart = (ctx) => sizeOf(ctx) === 'S';
const opOf = (p) => (p && p.op === '*' ? '*' : '+');
const digitsOf = (p) => Math.max(2, ...((p && p.nums) || []).map((n) => String(n).length));
/** The four facts the key writes, or null when the three numbers are not a family. */
function chartFacts(p, whole, parts) {
    if (!p.isFamily || parts.length !== 2) return null;
    return familyFacts(Number(parts[0]), Number(parts[1]), whole, opOf(p));
}

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
                    + `background:#fff;color:${INK};${FONT}font-size:${P(ctx, pt)};font-weight:700;line-height:1;cursor:pointer;"><span>${esc(w)}</span></button>`;
            }
            const ring = i === on
                ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -2.2)};top:${L(ctx, -1.6)};right:${L(ctx, -2.2)};bottom:${L(ctx, -1.6)};color:${ink === 'trace' ? GREY : INK};border:${B(ctx, 1.5)} solid currentColor;border-radius:50%;"></span>`
                : '';
            return `<span class="mq-fc-word" style="position:relative;display:inline-flex;align-items:center;justify-content:center;padding:${L(ctx, 1)} ${L(ctx, 2.5)};${FONT}font-size:${P(ctx, pt)};font-weight:700;line-height:1.1;color:${INK};">${esc(w)}${ring}</span>`;
        }).join('');
        // ONE decision, so ONE slot: the pair (the key rings one word, AK-2)
        const choice = twin
            ? `<div class="mq-fc-choice" role="group" aria-label="yes or no" style="display:flex;justify-content:center;gap:${L(ctx, 10)};">${words}</div>`
            : `<div class="mq-fc-choice" data-ws-slot="answer" data-ws-shape="choice"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:flex;justify-content:center;gap:${L(ctx, 12)};">${words}</div>`;
        const { wMm } = factTriangleSize(ctx);
        const pad = `padding:${L(ctx, 1)} 0 ${L(ctx, 1)} ${twin ? '0' : 'calc(var(--ws-tab, 5mm) + 1mm)'};box-sizing:border-box;width:100%;`;
        const triBox = `<div style="width:${L(ctx, wMm + 1)};max-width:100%;">${tri}</div>`;
        if (!chartOn(p)) {
            return `<div class="mq-fc k2-cell" data-ws-inplace data-read${twin ? ' data-mq-k2="1"' : ''} style="color:${INK};${FONT}text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 4)};${pad}">`
                + `${triBox}${choice}</div>`;
        }
        // the support: a blank family chart, working space only (never graded). At M and L it sits BESIDE the triangle
        // (the triangle and its Yes / No on the left, the four sentences on the right: look, work, decide): under it,
        // the cell is 2.2x as tall and M / L hold 2 a page with a 24-36 % empty band; beside, the cell is the chart's
        // height (3 a page). At S it fits UNDER the triangle two across (4 a page). On screen the two wrap.
        const facts = chartFacts(p, whole, parts);
        const show = !twin && !!facts && (ctx.state === 'answered' || ctx.state === 'traced');
        const chart = familyChart(ctx, { op: opOf(p), facts, show, ink: show ? (ctx.state === 'traced' ? 'trace' : 'solid') : null, digits: digitsOf(p) });
        if (!twin && underChart(ctx)) {
            // Size S: the chart UNDER the triangle, then Yes / No (the cell is 61 mm wide: two across, S 4 a page)
            return `<div class="mq-fc mq-fc--chart k2-cell" data-ws-inplace data-read data-mq-fchart="1" style="color:${INK};${FONT}text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;min-height:100%;gap:${L(ctx, 4)};${pad}">`
                + `${triBox}${chart}${choice}</div>`;
        }
        const left = `<div class="mq-fc-main" style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 4)};flex:none;">${triBox}${choice}</div>`;
        return `<div class="mq-fc mq-fc--chart k2-cell" data-ws-inplace data-read data-mq-fchart="1"${twin ? ' data-mq-k2="1"' : ''} style="color:${INK};${FONT}text-align:center;display:flex;flex-direction:row;flex-wrap:${twin ? 'wrap' : 'nowrap'};align-items:center;justify-content:space-evenly;gap:${twin ? '16px' : L(ctx, 6)};${pad}">`
            + `${left}${chart}</div>`;
    },
    answerKey(p) {
        const lab = labelsOf(p)[correctOf(p)];
        const slots = { answer: { value: lab, graded: true, accept: [lab.toLowerCase(), lab.charAt(0).toLowerCase()] } };
        if (chartOn(p)) {
            // the chart's boxes: working space, never graded; written on the key only for a true family
            const whole = Number(p.whole);
            const parts = Array.isArray(p.parts) ? p.parts : [];
            const facts = chartFacts(p, whole, parts);
            for (let i = 0; i < 4; i++) for (const k of ['a', 'b', 'c']) slots[`fc${i}-${k}`] = { value: facts ? String(facts[i][k]) : '', graded: false };
        }
        return { value: lab, display: lab, slots };
    },
    // answered in place (a ring round a printed word): rows packed to the measured height, never stretched far past
    // it (layout.js IN_PLACE_FILL; critic r1 F1: 9 triangles in 73 mm cells at S, 37.8 % empty)
    // with the family chart beside the triangle the cell is one wide row (tab + triangle + gap + chart: 101 mm at S,
    // 160 mm at L): one across, its height the chart's (measured)
    footprint(p, ctx) {
        if (!chartOn(p)) return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 3, denseRoom: 1, inPlace: true };
        if (underChart(ctx)) return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2, denseRoom: 1, inPlace: true };
        const w = 7 + factTriangleSize(ctx).wMm + 6 + familyChartSize(ctx, { digits: digitsOf(p) }).wMm;
        return { wMm: Math.ceil(w), hMm: null, measure: true, factLike: false, maxCols: 1, denseRoom: 1, inPlace: true };
    },
    // the one graded slot; the chart's boxes are working space and are not inputs (word-work's scratch boxes)
    inputs() { return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
    layout() { return { card: 'card-medium-visual', checker: 'choice' }; },
});
