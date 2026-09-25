// js/modules/sheet/roles/guided.js
// THE GUIDED PAGE (design/PAGE_TYPES.md 2.3): "we do" with many repetitions while the steps stay
// in view.
//
//   Steps band     the SKILL's own steps (provider `strings.steps`, else its authored
//                  `workedSteps`), in two text columns read row by row - 1 2 / 3 4 - with
//                  outlined circle markers (PT-GDP-2, BD-4). A skill with no steps of its own
//                  gets NO Steps band: generic operation steps were wrong for half the skills
//                  (regrouping steps on a basic-facts sheet, "Write the sum" on a missing-part
//                  item), and a wrong step list teaches the wrong thing.
//   Guided band    "Guided Practice:" + the skill's instruction, then rows of the skill's cell
//   Fade           PEDAGOGY_STANDARD 4.2 / PT-GDP-1, across the items: cell 1 is the worked
//                  example, its answer traced in grey (level 3); the rest of row 1 carries a
//                  PARTIAL trace (H5: the first digit written - the ones of a column sum - in
//                  grey, the rest left to write; level 2); every later row is solid, structural
//                  supports only (level 1). Structural supports never drop.
//   Labels, Score  none: Guided cells are unlabelled and unscored (PT-LBL-6, PT-FRM-4)
//   Capacity       columns Auto 4 / 3 / 3 (S / M / L, clamped by fit); rows while they fit, so
//                  the page is filled (2026-09-25 re-grade: 35-45% of the page was left empty),
//                  never above 16 / 12 / 12 cells, the spare height shared by the rows
//
// The key renders from the same plan: every cell answered, the traced first cell included.
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, stepsHtml, assemble, poolItems, answerOf, stringsOf,
} from './compose.js';
import { getProvider } from '../index.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'guided';
const CEILING = { S: 16, M: 12, L: 12 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

export function counts(pools, input) {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    const cols = bestCols(items, [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]), ctx);
    const { rows } = fitRows(items, cols, ctx, input);
    return { main: Math.min(CEILING[ctx.size], rows * cols) };
}

/** The steps as the provider writes them: an array, or one string of lines / sentences. */
function splitSteps(raw) {
    if (Array.isArray(raw)) return raw.map((s) => String(s && typeof s === 'object' ? s.text || '' : s || '').trim()).filter(Boolean);
    if (typeof raw !== 'string' || !raw.trim()) return [];
    const lines = raw.split(/\n|\s*(?:^|\s)\d+[.)]\s+/).map((s) => s.trim()).filter(Boolean);
    return lines.length > 1 ? lines : raw.split(/(?<=\.)\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}

/**
 * The Steps list of the skill (at most 6): `strings.steps` from the provider, else the
 * provider's own `workedSteps` for the worked example (item 1). The default adapter's steps
 * (split out of a hint) are not the skill's and are never used; none -> [] (no Steps band).
 */
export function stepsOf(items) {
    const it = items[0];
    if (!it) return [];
    const str = stringsOf(it);
    const own = splitSteps(str.steps);
    if (own.length) return own.slice(0, 6);
    const q = it.q || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        if (!p || !Array.isArray(p.real) || !p.real.includes('workedSteps') || typeof p.workedSteps !== 'function') return [];
        const st = p.workedSteps(q);
        return splitSteps(Array.isArray(st) ? st.map((s) => (s && typeof s === 'object' ? s.text : s)) : st).slice(0, 6);
    } catch (e) { return []; }
}

/** Rows that fit under the Steps band (PT-GDP-3 teacher strip off). */
function fitRows(items, cols, ctx, input) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const steps = stepsOf(items);
    const stepsH = steps.length ? m.strip + Math.ceil(steps.length / (steps.length > 2 ? 2 : 1)) * (m.pitch + 2.2) + 4 : 0;
    const avail = m.budget - stepsH - m.strip;
    const h = hMinAt(items, cols, ctx);
    const rows = Math.max(1, Math.min(Math.floor(CEILING[ctx.size] / cols), Math.floor(avail / Math.max(1, h))));
    return { rows, h, avail, stepsH, steps };
}

/* ======================================================================= the fade */

const TRACE_TEXT_RE = /(<(span|b|i|div)\b[^>]*?(?:data-ws-ink="trace"|class="[^"]*\bws-trace\b[^"]*"|color:#949494)[^>]*>)([^<]+)(<\/\2>)/g;

/**
 * H5, the partial trace: of a fully traced cell keep only the first mark in grey - the ones
 * digit of a column answer (the digit written first), or the first box of several - and hide
 * the rest, keeping its geometry (AK-1: the cell is the same size in every state). A drawn model
 * or a one-character answer has no partial form: null, and the cell prints untraced.
 */
export function partialTrace(html) {
    if (/data-ws-shape="draw"[^>]*data-ws-ink="trace"|data-ws-ink="trace"[^>]*data-ws-shape="draw"/.test(html)) return null;
    const hits = [...html.matchAll(TRACE_TEXT_RE)].filter((m) => m[3].trim() && m[3].trim() !== '&nbsp;');
    if (!hits.length) return null;
    const digitsOnly = hits.every((m) => m[3].trim().length === 1);
    if (hits.length === 1 && hits[0][3].trim().length < 2) return null;
    const keep = hits.length === 1 ? -1 : digitsOnly ? hits.length - 1 : 0;
    let k = -1;
    return html.replace(TRACE_TEXT_RE, (m, open, tag, text, close) => {
        if (!text.trim() || text.trim() === '&nbsp;') return m;
        k++;
        if (hits.length === 1) {
            const t = text.trim();
            return `${open}${t[0]}<span class="mq-untraced">${t.slice(1)}</span>${close}`;
        }
        return k === keep ? m : `${open}<span class="mq-untraced">${text}</span>${close}`;
    });
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const items = poolItems(input, 'main');
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: 0 });
    const colsWanted = AUTO_COLS[ctx.size];
    const cols = bestCols(items, [colsWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= colsWanted), ctx);
    const fit = fitRows(items, cols, ctx, input);
    const use = items.slice(0, Math.min(items.length, fit.rows * cols));
    const rows = Math.max(1, Math.ceil(use.length / cols));
    // The rows share the height under the bands: the page is filled, never left 40% blank.
    const cellH = fit.avail / Math.max(rows, fit.rows);
    const key = instructionKeyOf(use, input.skills);
    const planItems = use.map((it, i) => {
        const ans = answerOf(it);
        // PT-GDP-1: cell 1 is level 3 - the worked example, its answer written in trace grey.
        if (i === 0 && ans) {
            return planItem(it, { cols, level: 3, nolabel: true, render: (c, o) => it.render(c, Object.assign({}, o, c.state === 'blank' ? { shown: ans, ink: 'trace' } : {})) });
        }
        // The rest of row 1: level 2, a partial trace (H5) where the answer has one.
        if (i < cols && ans) {
            return planItem(it, {
                cols, level: 2, nolabel: true,
                render: (c, o) => {
                    if (c.state !== 'blank') return it.render(c, o);
                    let part = null;
                    try { part = partialTrace(it.render(c, Object.assign({}, o, { shown: ans, ink: 'trace' }))); } catch (e) { part = null; }
                    return part || it.render(c, o);
                },
            });
        }
        return planItem(it, { cols, level: i < cols ? 2 : 1, nolabel: true });
    });
    const sections = [];
    if (fit.steps.length) {
        const cls = `mq-steps-rows${fit.steps.length <= 2 ? ' mq-steps-one' : ''}`;
        sections.push({ kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepsband">${stepsHtml(fit.steps, { cls })}</div>` });
    }
    sections.push({ kind: 'band', label: 'Guided Practice:', instr: instructionText(key), content: gridPart(planItems, { cols, rows, cellH, labels: 'none' }) });
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: {
            items: use.length, scoreOutOf: 0, steps: fit.steps.length,
            fits: [{ cols, rows, cellH, line: `Fits: ${cols} columns x ${rows} rows, ${use.length} guided cells.` }],
            notes: fit.steps.length ? [] : ['No Steps band: this skill supplies no steps of its own yet (strings.steps / workedSteps).'],
        },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan, stepsOf, partialTrace };
