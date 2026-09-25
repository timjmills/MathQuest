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
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, planItem, gridPart, instructionPart, instructionKeyOf,
    assemble, poolItems, labelStyleOf, opOf, opGlyphOf, operandsOf, answerOf, writeLine, slotKey, esc, rng, shuffle, deriveSeed,
} from './compose.js';
import { isFact, factTitle } from './fact-rows.js';

export const ROLE_ID = 'fact-probe';
export const DEFAULT_LOOK = 'daily';
const H_ROW = { S: 16, M: 20, L: 24 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [5];
export const counts = () => ({ main: 20 });

export function supports(items) {
    if (!items.length) return 'no items were generated';
    return items.every(isFact) ? null
        : 'The fact probe needs a fact skill (a single-step fact up to 12 x 12). Use the Test for this skill.';
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
        render: (c) => `<div class="mq-hfact"><span>${esc(String(ops[0]))} ${opGlyphOf(op)} ${esc(String(ops[1]))} =</span>${writeLine('answer', c, key, digits)}</div>`,
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
    const vert = items.slice(0, 15);
    const hor = items.slice(15).map(horizontal);
    const canH = hor.every(Boolean);
    const labels = labelStyleOf(ctx.look, input.labels);
    const hMin = hMinAt(vert, 5, ctx);
    let body;
    let vRows = 3;
    let vH;
    if (canH) {
        vH = Math.min(1.3 * hMin, (G - 6 - 3 * hH) / 3);
    }
    if (!canH || vH < hMin) {
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
    const sections = [instructionPart(instructionKeyOf(items, input.skills))];
    if (strip) {
        const w = strip[strip.length - 1] >= 100 ? { S: 14, M: 14, L: 16 }[ctx.size] : { S: 10, M: 10, L: 12 }[ctx.size];
        const stripHtml = `<div class="mq-skipstrip" style="height:${(vRows * vH).toFixed(2)}mm">${strip.map((v) => `<span>${v}</span>`).join('')}</div>`;
        sections.push({ kind: 'row', widths: ['1fr', `${w}mm`], gap: '4mm', cls: 'mq-proberow', parts: [body, { kind: 'html', html: stripHtml }] });
    } else {
        sections.push(body.kind === 'col' ? body : body);
    }
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, [{ sections }], {
        defaultLook: DEFAULT_LOOK,
        meta: { items: items.length, scoreOutOf: items.length, form, strip: strip || null,
            fits: [{ cols: 5, rows: vRows, line: `Fits: 5 columns x ${vRows} rows${vRows === 3 ? ' + 5 horizontal' : ''}, ${items.length} facts.` }],
            notes: strip ? [] : [op === 'add' || op === 'subtract' ? 'Add and subtract probes print without a cue strip (number track and dot tile not built yet).' : 'Mixed set: no skip-count strip.'] },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, supports, counts, plan };
