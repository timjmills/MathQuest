// js/modules/sheet/cells/pv-times.js
// The `pv-times` template (build list value_ten_times; 4.NBT.A.1, and 5.NBT.A.1 with decimals): the
// SAME digit in two numbers, one place apart, compared.
//
//   A place chart of TWO rows under one heads row (Th H T O ...), each number right-aligned to its
//   places so the two digits sit one column apart - the shift is the picture. The digit is
//   underlined in each row. Beside each row (`values`) "worth [box]": what that digit is worth.
//   Under the chart one sentence: "The 7 in 740 is (10 times) (one tenth of) the 7 in 372." - the
//   pupil rings one. The key fills both boxes and rings the right words (a facsimile, AK-1).
//
// Generic by design (lesson 9 reuses it with decimals): each row is a STRING with the place of its
// digit (`{n: '0.7', place: 0.1}`); the chart's columns run from the highest place of either row to
// the lowest, with a decimal-point column between ones and tenths when a row has one. The choices
// are the payload's (`choices`), so "100 times / one hundredth of" needs no new code.
//
// Slots: v0, v1 (the values, boxes) and rel (the ring). `stepState` draws the chart's steps: the
// marks of earlier steps black, the newest grey (P-LC-9). Pure module (SCC-01).

import { esc, blank } from '../cell.js';
import { register } from '../registry.js';

const pt = (v) => `${Number(v).toFixed(1)}pt`;
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 0.1: 'tth', 0.01: 'hth', 0.001: 'thth' };
const pow = (e) => Number((10 ** e).toPrecision(12));

/** The digit columns of a number string at each place (exponent) it has: {e: digit}. */
function digitsOf(s) {
    const [ip, fp = ''] = String(s).replace(/,/g, '').split('.');
    const out = {};
    ip.split('').forEach((c, i) => { out[ip.length - 1 - i] = c; });
    fp.split('').forEach((c, i) => { out[-(i + 1)] = c; });
    return out;
}

/** What a slot shows and in which ink, read from the state or the step map (`p._show`). */
function slotState(p, ctx, id) {
    if (p._show) return Object.assign({}, ctx, { state: p._show[id] || 'blank' });
    return ctx;
}

function chartHTML(p, ctx) {
    const m = ctx.metrics;
    const rows = (p.rows || []).map((r) => ({ ...r, d: digitsOf(r.n), e: Math.round(Math.log10(Number(r.place))) }));
    const es = rows.flatMap((r) => Object.keys(r.d).map(Number));
    const hiE = Math.max(0, ...es), loE = Math.min(0, ...es);
    const cols = [];
    for (let e = hiE; e >= loE; e--) { cols.push(e); if (e === 0 && loE < 0) cols.push('.'); }
    const colW = (m.digitPt * 25.4 / 72) * 0.95;
    const td = (inner, st) => `<td style="padding:0 0.6mm;text-align:center;${st || ''}">${inner}</td>`;
    const heads = cols.map((e) => (e === '.' ? td('', 'width:2mm;')
        : td(LETTER[pow(e)] || '', `min-width:${colW.toFixed(1)}mm;font-size:${pt(Math.max(9, m.zonePt || 10))};font-weight:400;border-bottom:0.75pt solid #000;`))).join('');
    const worth = (i) => {
        if (!p.values) return '';
        // (`oneValue`, the exit slip half: one worth box, the first row's - its value, then the ring; lesson 6 r2)
        if (p.oneValue && i > 0) return '';
        const id = `v${i}`;
        const c = slotState(p, ctx, id);
        // (one width for every item with numbers this long - the box never tells how long its value is)
        const digits = Math.max(2, ...(p.rows || []).map((r) => String(r.n).replace(/[^0-9]/g, '').length));
        const box = blank({ id, kind: 'number', shape: 'box', digits, graded: true, order: i, scopes: ['full', 'answer-only'] }, c, (p.keys || {})[id]);
        return `<td style="padding:0 0 0 4mm;white-space:nowrap;vertical-align:bottom;font-size:${pt(m.digitPt)};font-weight:700;line-height:1.25;">${box}</td>`;
    };
    const body = rows.map((r, i) => `<tr>${cols.map((e) => {
        if (e === '.') return td(Object.keys(r.d).some((k) => Number(k) < 0) ? '.' : '', 'width:2mm;');
        const ch = r.d[e];
        if (ch === undefined) return td('');
        const u = e === r.e ? `<span style="display:inline-block;line-height:1;border-bottom:0.09em solid #000;padding:0 0.04em 0.04em;">${esc(ch)}</span>` : esc(ch);
        return td(u, `font-size:${pt(m.digitPt)};font-weight:700;line-height:1.1;`);
    }).join('')}${worth(i)}</tr>`).join('');
    // "worth" once, over the boxes (a heads-row word, like the place letters).
    const headRow = `<tr>${heads}${p.values ? `<td style="padding:0 0 0 4mm;text-align:center;font-size:${pt(m.textPt + 1)};font-weight:400;vertical-align:bottom;">worth</td>` : ''}</tr>`;
    return `<table class="pv-times-chart" style="border-collapse:collapse;margin:0 auto;color:#000;">${headRow}${body}</table>`;
}

function ringHTML(p, ctx) {
    const c = slotState(p, ctx, 'rel');
    const key = (p.keys || {}).rel;
    const on = c.state === 'wrong' ? String(((c.wrong || {}).slots || {}).rel ?? (c.wrong || {}).value ?? '')
        : (c.state === 'answered' || c.state === 'traced') ? String(key || '') : '';
    const grey = c.state === 'traced';
    const choice = (w) => `<span class="pv-choice" data-ws-slot="rel" data-ws-shape="ring" style="display:inline-block;white-space:nowrap;padding:0.6mm 2.4mm;margin:0 1mm;border-radius:999px;`
        + `${on === w ? `border:1.5pt solid ${grey ? 'var(--ws-grey)' : '#000'};` : 'border:1.5pt solid transparent;'}">${esc(w)}</span>`;
    const text = (t) => `<span style="font-weight:400;">${esc(t)}</span>`;
    const d = esc(p.digit);
    const [a, b] = (p.rows || []).map((r) => esc(Number(r.n).toLocaleString('en-US', { maximumFractionDigits: 6 })));
    return `<div class="pv-times-say" style="font-size:${pt(ctx.metrics.textPt + (p.sayTwo ? 0 : 1))};line-height:1.3;text-align:left;">`
        + (p.sayTwo
            // (`sayTwo`, a narrow column - the exit slip half: the two choices one under the other, so the sentence
            // stands beside the chart in four short lines)
            ? `<div style="white-space:nowrap;">${text('The')} <b>${d}</b> ${text('in')} <b>${a}</b> ${text('is')}</div>`
              + (p.choices || []).map((w) => `<div style="font-weight:700;white-space:nowrap;margin-left:-2.4mm;">${choice(w)}</div>`).join('')
            : `<div>${text('The')} <b>${d}</b> ${text('in')} <b>${a}</b> ${text('is')}</div><div style="font-weight:700;white-space:nowrap;margin-left:-2.4mm;">${(p.choices || []).map(choice).join('')}</div>`)
        + `<div>${text('the')} <b>${d}</b> ${text('in')} <b>${b}</b>.</div></div>`;
}

function renderTimes(p, ctx) {
    // The chart and its sentence side by side: one full-width row (the sentence is three short lines).
    return `<div class="pv-cell pv-times" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;column-gap:${p.sayTwo ? 4 : 7}mm;row-gap:2mm;">`
        + `<div>${chartHTML(p, ctx)}</div>${ringHTML(p, ctx)}</div>`;
}

register('pv-times', {
    render(p, ctx) { return renderTimes(p, ctx); },
    answerKey(p) {
        const k = p.keys || {};
        const slots = { rel: { value: String(k.rel || ''), graded: true } };
        if (p.values) { slots.v0 = { value: String(k.v0), graded: true }; if (!p.oneValue) slots.v1 = { value: String(k.v1), graded: true }; }
        const value = p.keyValue !== undefined ? String(p.keyValue) : String(k.rel || '');
        return { value, display: value, slots };
    },
    footprint() {
        return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 };
    },
    inputs(p) {
        const out = [];
        if (p && p.values) { out.push({ id: 'v0', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }); if (!p.oneValue) out.push({ id: 'v1', kind: 'number', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] }); }
        out.push({ id: 'rel', kind: 'text', shape: 'ring', graded: true, order: out.length, scopes: ['full', 'answer-only'] });
        return out;
    },
    layout() { return { card: 'card-simple', checker: 'list' }; },
    // Guided cell 1 of a lesson sheet is drawn at step 1 (roles/lesson.js): both values traced grey.
    guidedStepOne: true,
    /**
     * The anchor chart's step states: steps[i].marks name slots (v0, v1, rel); the marks of steps
     * before k are black, step k's grey; a state past the last marked step is the whole answer.
     */
    stepState(p, steps, k, ctx) {
        const show = {};
        (steps || []).forEach((s, i) => {
            if (i > k) return;
            for (const mk of (s && s.marks) || []) show[mk.slot] = i < k ? 'answered' : 'traced';
        });
        return renderTimes(Object.assign({}, p, { _show: show }), Object.assign({}, ctx, { state: 'blank' }));
    },
});

export default { };
