// js/modules/sheet/cells/mult-grid.js
// The multiplication chart as a table to complete, template id `mult-grid` (mult_chart,
// mult_chart_easy). One drawing for every chart task the teacher can choose:
//
//   fill      products left empty for the pupil to write (a window of the chart, a block such as
//             1-6 x 1-6, or the whole 12 x 12 - at 100% the blank chart to fill completely)
//   headers   every product printed, some ROW or COLUMN numbers (the factors) left empty
//   shade     every product printed; the pupil shades each multiple of n. The key shades them in
//             the single grey (INK-3)
//   pattern   one row of the chart with gaps, and a rule frame under the chart
//             ("Across the 7 row, add [ ] each time")
//
// Geometry. The corner holds ×; the header row and column are bold with a 1.5 pt rule after
// them. An EMPTY CELL IS THE WRITING PLACE: the whole cell, with a 1.5 pt border (SL-11 corner
// in the twin), never a box inside a box - so a 13-column chart still gives every product a
// 14 mm cell at L (RUBRIC H9: three digits need 14 mm) and fits the 186 mm live width. A whole
// 12 x 12 chart is 182 x 182 mm at L: one item per page. Smaller charts get bigger cells
// (17 mm at L up to 7 columns).
//
// Key (AK-1, AK-2): the same chart with every empty cell written in bold, every multiple shaded.
// Screen twin: each empty cell carries `data-mq-cell` (one input each, in reading order, joined
// ", " - what `q.ans` holds); the chart scrolls sideways INSIDE the cell when a phone is narrower
// than it, never the page.
//
// payload: {
//   rows: [r, ...]   the row factors (the left header), top to bottom
//   cols: [c, ...]   the column factors (the top header), left to right
//   blanks: [[i, j], ...]   empty product cells (i row, j column, zero-based)
//   hdr?: {rows: [i, ...], cols: [j, ...]}   empty header cells
//   shade?: n        shade the multiples of n (the key shades them)
//   ruleBox?: {pre, post, value}   a rule frame under the chart (pattern task)
// }
// The slots run in READING ORDER: the top header row left to right, then each row (its header,
// then its products). The rule box is last.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, textPt, sizeOf, inkOf, isTwin, S, KEY_FEATURES } from './k2kit.js';

/** Cell side (mm): big charts get the H9 minimum, small ones room to breathe. */
function cellMm(n, size) {
    // A window (6 columns with its header) keeps the 14 mm minimum so two fit side by side.
    if (n <= 6) return { S: 13, M: 13.5, L: 14 }[size];
    if (n <= 7) return { S: 15, M: 16, L: 17 }[size];
    if (n <= 11) return { S: 14, M: 15, L: 15.5 }[size];
    return { S: 13, M: 13.5, L: 14 }[size];
}
/**
 * Row height (mm). The whole 12 x 12 chart keeps its 14 mm columns (three digits, RUBRIC H9) but
 * takes 13 mm rows at L, so its 13 rows stand in the guided page's shorter cell as well.
 */
function rowMm(n, size) {
    if (n >= 12) return { S: 12, M: 12.5, L: 13 }[size];
    // R3 (critic round 3): a 4 x 5 window in 14 mm rows was a hair too tall for three charts to
    // a page, so two stood in cells with a 45% empty band. 12.5 mm rows (still taller than the
    // writing height) fit three rows of windows.
    if (n <= 6) return { S: 12, M: 12, L: 12.5 }[size];
    return cellMm(n, size);
}

/** Every slot of the chart in reading order: {id, kind, i, j, value}. */
export function gridSlots(p) {
    const rows = p.rows || [], cols = p.cols || [];
    const hr = new Set(((p.hdr && p.hdr.rows) || []).map(Number));
    const hc = new Set(((p.hdr && p.hdr.cols) || []).map(Number));
    const bl = new Set((p.blanks || []).map(([i, j]) => `${i},${j}`));
    const out = [];
    cols.forEach((c, j) => { if (hc.has(j)) out.push({ kind: 'col', j, value: c }); });
    rows.forEach((r, i) => {
        if (hr.has(i)) out.push({ kind: 'row', i, value: r });
        cols.forEach((c, j) => { if (bl.has(`${i},${j}`)) out.push({ kind: 'cell', i, j, value: r * c }); });
    });
    if (p.ruleBox && p.ruleBox.value !== undefined && p.ruleBox.value !== null) out.push({ kind: 'rule', value: p.ruleBox.value });
    return out.map((s, n) => ({ ...s, id: s.kind === 'rule' ? 'rule' : `mc${n}`, value: String(s.value) }));
}

/** The distinct products of the chart that are multiples of `p.shade`, smallest first. */
export function shadeList(p) {
    const n = Number(p.shade);
    if (!(n > 0)) return [];
    const set = new Set();
    for (const r of p.rows || []) for (const c of p.cols || []) if ((r * c) % n === 0) set.add(r * c);
    return [...set].sort((a, b) => a - b);
}

function shownValues(p, ctx, slots) {
    if (ctx.state === 'blank') return slots.map(() => '');
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const parts = String(w.value === undefined || w.value === null ? '' : w.value).split(/\s*,\s*/).filter((s) => s !== '');
        return slots.map((s, i) => (w.slots && w.slots[s.id] !== undefined ? String(w.slots[s.id]) : parts[i] !== undefined ? parts[i] : s.value));
    }
    return slots.map((s) => s.value);
}

/**
 * The anchor-chart step states of an even-products window (detailed lesson 4; marks 'even-rows',
 * 'even-cols', 'odd-odd' from the countby provider's CHART_STEPS.even): state k shades the boxes of
 * every step up to k; the NEWEST step's row / column numbers are ringed grey (P-LC-9), and the last
 * step rings each odd x odd box (left white) with a solid grey line. Only that lesson calls it.
 */
export function evenGridState(p, groups, k) {
    const rows = p.rows || [], cols = p.cols || [];
    const has = (g, id) => ((g && g.marks) || []).some((m) => m && m.slot === id);
    const upto = groups.slice(0, k + 1);
    const shade = new Set(), ring = new Set();
    const on = (id) => upto.some((g) => has(g, id));
    rows.forEach((r, i) => cols.forEach((c, j) => {
        if ((on('even-rows') && r % 2 === 0) || (on('even-cols') && c % 2 === 0)) shade.add(`${i},${j}`);
    }));
    const g = groups[k];
    if (has(g, 'even-rows')) rows.forEach((r, i) => { if (r % 2 === 0) ring.add(`r${i}`); });
    if (has(g, 'even-cols')) cols.forEach((c, j) => { if (c % 2 === 0) ring.add(`h${j}`); });
    if (has(g, 'odd-odd')) rows.forEach((r, i) => cols.forEach((c, j) => { if (r % 2 === 1 && c % 2 === 1) ring.add(`c${i},${j}`); }));
    return { shade, ring };
}

register('mult-grid', {
    render(p, ctx) {
        const size = sizeOf(ctx);
        const rows = p.rows || [], cols = p.cols || [];
        const c = cellMm(cols.length + 1, size);
        const rh = rowMm(cols.length + 1, size);
        const slots = gridSlots(p);
        const vals = shownValues(p, ctx, slots);
        const ink = inkOf(ctx);
        const at = new Map(slots.map((s, n) => [s.kind === 'cell' ? `c${s.i},${s.j}` : s.kind === 'row' ? `r${s.i}` : s.kind === 'col' ? `h${s.j}` : 'rule', n]));
        const pt = Math.min(digitPt(ctx) * (cols.length >= 11 || cols.length <= 5 ? 0.55 : 0.66), cols.length >= 11 || cols.length <= 5 ? 15 : 19);
        // Every number and every writing place fills its cell exactly, so no number rides higher
        // or lower than its row-mates beside a heavy-bordered empty cell.
        const fill = `display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, c - 0.6)};height:${L(ctx, rh - 0.6)};margin:0 auto;`;
        // Shading: the key shades every multiple; Error analysis shades the pupil's own choice
        // (ctx.wrong.value: option ids 'opt<k>' into the chart's distinct products, or numbers).
        const shadeOn = Number(p.shade) > 0 && (ctx.state === 'answered' || ctx.state === 'traced');
        let shadedByPupil = null;
        if (Number(p.shade) > 0 && ctx.state === 'wrong' && ctx.wrong) {
            const distinct = [...new Set(rows.flatMap((r) => cols.map((cc) => r * cc)))].sort((a, b) => a - b);
            const raw = Array.isArray(ctx.wrong.value) ? ctx.wrong.value : String(ctx.wrong.value || '').split(/\s*,\s*/);
            shadedByPupil = new Set(raw.map((v) => (/^opt\d+$/.test(String(v)) ? distinct[Number(String(v).slice(3))] : Number(v))).filter(Number.isFinite));
        }
        const base = `box-sizing:border-box;width:${L(ctx, c)};min-width:${L(ctx, c)};height:${L(ctx, rh)};padding:0;text-align:center;vertical-align:middle;`
            + `font-size:${P(ctx, pt)};line-height:1;white-space:nowrap;`;
        const slotTd = (n, extra) => {
            const s = slots[n];
            const v = vals[n];
            const vInk = v !== '' ? ink : null;
            const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
            // The writing place is marked by a 1.5 pt outline drawn INSIDE the cell, so every
            // table border stays 0.75 pt and no row or column shifts beside an empty cell.
            const heavy = B(ctx, 1.5);
            return `<td style="${base}border:${B(ctx, 0.75)} solid ${INK};${extra || ''}"><span data-ws-slot="${s.id}" data-ws-shape="box"${vInk ? ` data-ws-ink="${vInk}"` : ''}${hook} `
                + `style="${fill}outline:${heavy} solid ${INK};outline-offset:-${heavy};font-weight:700;color:${vInk === 'trace' ? GREY : INK};${KEY_FEATURES}">${esc(v)}</span></td>`;
        };
        const printed = (v, extra, bold) => `<td style="${base}border:${B(ctx, 0.75)} solid ${INK};${extra || ''}"><span style="${fill}${bold ? 'font-weight:700;' : ''}">${esc(v)}</span></td>`;
        // (an even-products window on paper, lesson 4: every product box is a response place - shade it or leave it
        // white - so the page counts its boxes as its graded places)
        const shadeSlot = p.shadeSlots && !isTwin(ctx);
        let shN = 0;
        // (on the key a shaded box is the answer: its number carries the key mark, so the key reads its answers)
        const productTd = (v, extra) => (shadeSlot
            ? `<td style="${base}border:${B(ctx, 0.75)} solid ${INK};${extra || ''}"><span data-ws-slot="sh${shN++}" data-ws-shape="shade"${shadeOn && Number(v) % Number(p.shade) === 0 ? ' data-ws-key-ans' : ''} style="display:inline-block;">${esc(v)}</span></td>`
            : printed(v, extra, false));
        const HEAVY = B(ctx, 1.5);
        let html = `<tr>${printed('×', `border-right:${HEAVY} solid ${INK};border-bottom:${HEAVY} solid ${INK};`, true)}`;
        cols.forEach((cv, j) => {
            const n = at.get(`h${j}`);
            const ringH = ctx.gridSteps && ctx.gridSteps.ring.has(`h${j}`) ? `outline:${HEAVY} solid ${GREY};outline-offset:-${B(ctx, 3)};` : '';
            html += n !== undefined ? slotTd(n, `border-bottom:${HEAVY} solid ${INK};`) : printed(cv, `border-bottom:${HEAVY} solid ${INK};${ringH}`, true);
        });
        html += '</tr>';
        rows.forEach((rv, i) => {
            html += '<tr>';
            const nh = at.get(`r${i}`);
            const ringR = ctx.gridSteps && ctx.gridSteps.ring.has(`r${i}`) ? `outline:${HEAVY} solid ${GREY};outline-offset:-${B(ctx, 3)};` : '';
            html += nh !== undefined ? slotTd(nh, `border-right:${HEAVY} solid ${INK};`) : printed(rv, `border-right:${HEAVY} solid ${INK};${ringR}`, true);
            cols.forEach((cv, j) => {
                const n = at.get(`c${i},${j}`);
                if (n !== undefined) { html += slotTd(n); return; }
                const prod = rv * cv;
                const gs = ctx.gridSteps;
                const shade = gs ? (gs.shade.has(`${i},${j}`) ? `background:${GREY};` : '') + (gs.ring.has(`c${i},${j}`) ? `outline:${HEAVY} solid ${GREY};outline-offset:-${B(ctx, 3)};` : '')
                    : (shadeOn && prod % Number(p.shade) === 0) || (shadedByPupil && shadedByPupil.has(prod)) ? `background:${GREY};` : '';
                html += productTd(prod, shade);
            });
            html += '</tr>';
        });
        const table = `<table class="k2-multgrid" role="grid" aria-label="multiplication chart" style="border-collapse:collapse;table-layout:fixed;margin:0 auto;background:#fff;">${html}</table>`;
        let ruleFrame = '';
        if (p.ruleBox) {
            const n = at.get('rule');
            const v = vals[n];
            const vInk = v !== '' ? ink : null;
            const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
            const bw = S(ctx).writeMm + 6;
            ruleFrame = `<div class="k2-rulebox" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 3)};font-size:${P(ctx, textPt(ctx))};white-space:nowrap;">`
                + `<span>${esc(p.ruleBox.pre || '')}</span><span data-ws-slot="rule" data-ws-shape="box"${vInk ? ` data-ws-ink="${vInk}"` : ''}${hook} style="display:inline-flex;align-items:center;justify-content:center;`
                + `box-sizing:border-box;width:${L(ctx, Math.max(14, bw))};height:${L(ctx, S(ctx).writeMm + 3)};border:${B(ctx, 1.5)} solid ${INK};border-radius:${L(ctx, 1.25)};`
                + `font-size:${P(ctx, pt)};font-weight:700;color:${vInk === 'trace' ? GREY : INK};${KEY_FEATURES}">${esc(v)}</span>`
                + `${p.ruleBox.post ? `<span>${esc(p.ruleBox.post)}</span>` : ''}</div>`;
        }
        // Paper: a band above the chart keeps the cell's item letter off its corner line.
        const scroll = isTwin(ctx) ? 'overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch;' : `padding-top:${L(ctx, 4.5)};`;
        return root(ctx, 'k2-multgrid-cell', `<div data-mq-join=", " data-mq-scroll style="${scroll}">${table}${ruleFrame}</div>`);
    },
    answerKey(p) {
        const slots = gridSlots(p);
        const out = {};
        slots.forEach((s) => { out[s.id] = { value: s.value, graded: true }; });
        let list = slots.map((s) => s.value);
        // A shade task has no writing place: its key is the shaded multiples, smallest first.
        if (!list.length && Number(p.shade) > 0) list = shadeList(p).map(String);
        return { value: list.join(', '), display: list.join(', '), slots: out };
    },
    footprint(p, ctx) {
        const size = sizeOf(ctx || {});
        const nc = ((p && p.cols) || []).length + 1, nr = ((p && p.rows) || []).length + 1;
        const c = cellMm(nc, size);
        const w = nc * c + 4;
        const h = nr * rowMm(nc, size) + (p && p.ruleBox ? S(ctx || {}).writeMm + 9 : 0) + 4 + 4.5;
        return { wMm: Math.ceil(w), hMm: Math.ceil(h), measure: true, factLike: false, maxCols: w <= 90 ? 2 : 1 };
    },
    inputs(p) {
        return gridSlots(p).map((s, n) => ({ id: s.id, kind: 'number', shape: 'box', graded: true, order: n, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-wide-visual', checker: 'list', requiresVisual: true }; },
});
