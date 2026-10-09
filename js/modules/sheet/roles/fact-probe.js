// js/modules/sheet/roles/fact-probe.js
// FACT FLUENCY PROBE (design/PAGE_TYPES.md 4.2): a short probe on one fact set - 15 vertical
// facts plus 5 horizontal, with a support strip.
//
//   Who        fact-like skills only (PT-CMP-2); anything else is `unsupported` with its reason
//   Grid       5 columns x 3 rows of vertical facts (Auto is always 5, PT-FPR-1), a 6 mm gap,
//              then 2 columns x 3 rows of horizontal facts (the last position is the unruled
//              trailing area, PT-ENG-7). Vertical rows are min(1.3 x hMin, what the page leaves)
//   Strip      multiply and divide sets with one constant k: the skip-count list k to 10k (12k
//              when the set reaches 11 or 12), side form, in a rounded strip beside the grid
//              (PT-FPR-3). Add and subtract sets and mixed sets print without a strip (their
//              number-track and dot-tile cues are cue options not built yet).
//   Look       Daily by default; black tabs 1 to 20; Score /20; tab "Probe x3 A" (PT-FRM-9)
//   Forms      Form B is Form A's facts in a seeded re-order (PT-FPR-8)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, bestCols, planItem, gridPart, instructionPart, instructionKeyOf,
    assemble, poolItems, labelStyleOf, opOf, opGlyphOf, operandsOf, answerOf, writeLine, slotKey, esc, rng, shuffle, deriveSeed,
} from './compose.js';
import { isFact, factTitle, divForms as divFormSet, formGrid, formCell } from './fact-rows.js';

export const ROLE_ID = 'fact-probe';
export const DEFAULT_LOOK = 'daily';
const H_ROW = { S: 16, M: 20, L: 24 };

export const sources = (skills) => [{ id: 'main', skills }];
// 5 is the probe's grid; 4 / 3 / 2 are measured for the cells that do not fit 5 (a long-division
// bracket or a fraction at L: see plan).
export const measureCols = () => [5, 4, 3, 2];
export const counts = () => ({ main: 20 });

export function supports(items) {
    if (!items.length) return 'no items were generated';
    return items.every(isFact) ? null
        : 'The fact probe needs a fact or a one-step computation (add, subtract, multiply or divide in columns). Use the Test for this skill.';
}

/** A horizontal fact drawn from the question's operands: "7 x 3 = ____". */
function horizontal(it) {
    const q = it.q || {};
    const ops = operandsOf(q);
    const op = opOf(q);
    const ans = answerOf(it);
    if (ops.length < 2 || !op || !ans) return null;
    const key = slotKey({ answer: ans }, ans);
    const digits = Math.max(2, ans.length);
    return Object.assign({}, it, {
        render: (c) => `<div class="mq-hfact"><span>${ops.map((v) => esc(String(v))).join(` ${opGlyphOf(op)} `)} =</span>${writeLine('answer', c, key, digits)}</div>`,
        key, drawsAnswer: true, visual: false, template: 'equation', legacy: false, cellCls: 'mq-hfactcell',
    });
}

/** The skip-count strip entries, or null (PT-FPR-3). */
function stripValues(items) {
    const op = opOf((items[0] || {}).q || {});
    if (op !== 'multiply' && op !== 'divide') return null;
    const ks = [...new Set(items.map((it) => {
        const o = operandsOf(it.q || {});
        return op === 'multiply' ? o[1] : o[1];
    }).filter((v) => v !== undefined))];
    if (ks.length !== 1 || !ks[0]) return null;
    const k = ks[0];
    const top = items.some((it) => { const o = operandsOf(it.q || {}); return op === 'multiply' ? o[0] > 10 : Number(answerOf(it)) > 10; }) ? 12 : 10;
    return Array.from({ length: top }, (_, i) => k * (i + 1));
}

export function plan(input = {}) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    let items = poolItems(input, 'main').slice(0, 20);
    if (form === 'B') items = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B')), items);
    const op = opOf((items[0] || {}).q || {});
    const strip = stripValues(items);
    const title = factTitle(items);
    const k = strip ? strip[0] : '';
    // PT-FRM-9: "Probe x3 A" names the fact set; a mixed set has no single constant to name.
    const tabId = strip ? `Probe ${opGlyphOf(op)}${k} ${form}` : `Probe ${form}`;
    const frame = frameOf({ skills: input.skills || [], input: Object.assign({}, input, { form }), tabId, title, score: items.length,
        footerRight: [`Form ${form}`, strip ? 'strip full' : 'no strip', input.seed !== undefined ? `seed ${input.seed}` : ''].filter(Boolean).join(' · ') });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const G = m.body - m.instr - 1;
    const hH = H_ROW[ctx.size];
    // div_facts "How it is written" (`divForm`): the probe draws every fact in the form the teacher
    // chose. Standard is "36 ÷ 4 = __" - across, never stacked in the 5-column vertical grid
    // (VA-65 would stack it there, which is the Vertical form) - so a Standard probe is 20 across
    // facts in 2 columns. Vertical is 20 vertical facts (no across block: the teacher chose
    // stacked). Long division and Fraction draw their own cells in the 5-column grid (their
    // cells are taller, so the page takes the 5 x 4 layout below).
    const divForms = new Set(items.map((it) => (it.q && it.q.divForm) || ''));
    const divForm = op === 'divide' && divForms.size === 1 ? [...divForms][0] : '';
    const vert = items.slice(0, 15);
    const hor = items.slice(15).map(horizontal);
    const canH = hor.every(Boolean) && divForm !== 'vertical';
    const labels = labelStyleOf(ctx.look, input.labels);
    const hMin = hMinAt(vert, 5, ctx);
    let body;
    let extraPages = [];
    let FG = null;
    let probeCols = 0;
    let vRows = 3;
    let vH;
    if (canH) {
        vH = Math.min(1.3 * hMin, (G - 6 - 3 * hH) / 3);
    }
    const across = divForm === 'standard' ? items.map(horizontal) : null;
    if (across && across.every(Boolean)) {
        // 20 across facts, 2 columns x 10 rows: each row the across row height when the page has
        // room, never less than the across fact's own height (the digits never shrink, PG-20).
        vRows = 10;
        vH = Math.max(hH * 0.8, Math.min(hH * 1.3, G / 10));
        body = gridPart(across.map((it) => planItem(it, { cols: 2 })), { cols: 2, rows: 10, cellH: vH, labels, start: 1 });
    } else if (divFormSet(items) && (FG = formGrid(items, ctx, G, divFormSet(items), items.length, 5))) {
        // div_facts Long division / Fraction / Mix (critic R1 D6): ONE page (PT-FPR-6), each fact
        // in its own form at one size - the most columns and the largest ladder size at which the
        // widest fact fits - and the rows take the whole grid (PG-14), at S as at L.
        vRows = FG.rows;
        vH = FG.cellH;
        probeCols = FG.cols;
        body = gridPart(items.map((it) => planItem(formCell(it, FG), { cols: FG.cols })), { cols: FG.cols, rows: FG.rows, cellH: vH, labels, start: 1, cls: 'facts' });
    } else if (!fitsAt(items, 5, ctx)) {
        // A cell that does not fit the 5-column grid (div_facts Long division / Fraction / Mix at
        // M or L: the bracket and its quotient boxes are wider than a fifth of the page). The
        // digits never shrink to fit (PG-20), so the probe takes the widest column count every
        // fact fits (measured, DN-10), as many rows as their height allows, and runs on to a
        // second page when 20 facts need it - the probe stays 20 facts in the chosen form.
        const cols = bestCols(items, [4, 3, 2], ctx);
        const h = hMinAt(items, cols, ctx);
        const rowsFit = Math.max(1, Math.floor(G / (Number.isFinite(h) ? h : G)));
        // the pages share the facts evenly (a rebalanced last page, PG-21), never a short tail
        const nPages = Math.ceil(items.length / (cols * Math.min(rowsFit, Math.ceil(items.length / cols))));
        const rows = Math.ceil(Math.ceil(items.length / nPages) / cols);
        const per = cols * rows;
        vRows = rows;
        vH = Math.min(Number.isFinite(h) ? 1.3 * h : G / rows, G / rows);
        const chunks = [];
        for (let i = 0; i < items.length; i += per) chunks.push(items.slice(i, i + per));
        const grids = chunks.map((ch, k) => gridPart(ch.map((it) => planItem(it, { cols })), { cols, rows: Math.ceil(ch.length / cols), cellH: vH, labels, start: 1 + k * per, cls: 'facts' }));
        body = grids[0];
        if (grids.length > 1) extraPages = grids.slice(1).map((g) => ({ sections: [g] }));
        probeCols = cols;
    } else if (!canH || vH < hMin) {
        // No room (or no operands) for the horizontal block: 20 vertical facts, 5 x 4.
        vRows = 4;
        vH = Math.min(1.3 * hMin, G / 4);
        const grid = gridPart(items.map((it) => planItem(it, { cols: 5 })), { cols: 5, rows: 4, cellH: vH, labels, start: 1, cls: 'facts' });
        body = grid;
    } else {
        const gV = gridPart(vert.map((it) => planItem(it, { cols: 5 })), { cols: 5, rows: 3, cellH: vH, labels, start: 1, cls: 'facts' });
        const gH = gridPart(hor.map((it) => planItem(it, { cols: 2 })), { cols: 2, rows: 3, cellH: hH, labels, start: 16 });
        body = { kind: 'col', gap: '6mm', parts: [gV, gH] };
    }
    const sections = [instructionPart(instructionKeyOf(items, input.skills), items)];
    if (strip) {
        const w = strip[strip.length - 1] >= 100 ? { S: 14, M: 14, L: 16 }[ctx.size] : { S: 10, M: 10, L: 12 }[ctx.size];
        const stripHtml = `<div class="mq-skipstrip" style="height:${(vRows * vH).toFixed(2)}mm">${strip.map((v) => `<span>${v}</span>`).join('')}</div>`;
        sections.push({ kind: 'row', widths: ['1fr', `${w}mm`], gap: '4mm', cls: 'mq-proberow', parts: [body, { kind: 'html', html: stripHtml }] });
    } else {
        sections.push(body.kind === 'col' ? body : body);
    }
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }, ...extraPages], {
        defaultLook: DEFAULT_LOOK,
        meta: { items: items.length, scoreOutOf: items.length, form, strip: strip || null,
            fits: [{ cols: probeCols || (vRows === 10 ? 2 : 5), rows: vRows, line: `Fits: ${probeCols || (vRows === 10 ? 2 : 5)} columns x ${vRows} rows${vRows === 3 && !probeCols ? ' + 5 horizontal' : ''}${extraPages.length ? `, ${1 + extraPages.length} pages` : ''}, ${items.length} facts.` }],
            notes: strip ? [] : [op === 'add' || op === 'subtract' ? 'Add and subtract probes print without a cue strip (number track and dot tile not built yet).' : 'Mixed set: no skip-count strip.'] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, supports, counts, plan };
