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
//                  example, its answer AND its working (the carried tens) traced in grey
//                  (level 3); the rest of row 1 is level 2 - the whole first step of a column
//                  stack traced (the ones digit and the ten it carries, H5) and the count cue of
//                  a + / − fact (a grey dot tile, H3); every later row is blank, structural
//                  supports only (level 1). A lone grey digit or half the blanks is never traced
//                  (critic round 2). Structural supports never drop.
//   Labels, Score  critic round 2 (C4): quiet letters and Score like every other role; the
//                  worked example carries the "Model" tab and is not scored
//   Capacity       columns Auto 4 / 3 / 3 (S / M / L, clamped by fit); rows while they fit, so
//                  the page is filled (2026-09-25 re-grade: 35-45% of the page was left empty),
//                  never above 12.1's 8 / 6 / 6 cells, the spare height shared by the rows
//   Pages          round-3 re-grade ("a model and ONE practice item"): when page 1 holds fewer
//                  than the Model and three tries, the sheet continues on page 2 (and 3) under
//                  the continuation header with the Steps band repeated; each page's rows are
//                  sized by the items it holds, the model row taller by its worked trace
//   Worked trace   P-LC-9: a template that draws no step states marks its model in grey - the
//                  story's numbers ringed and its sentence in the work box, a chart's factors
//                  ringed - or prints the provider's worked lines for THIS problem under it
//
// The key renders from the same plan: every cell answered, the traced first cell included.
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, stepsHtml, assemble, poolItems, answerOf, stringsOf, labelStyleOf, opOf, operandsOf,
    providerWorkedSteps, esc,
} from './compose.js';
import { getProvider } from '../index.js';
import { stepTemplateOf } from '../anchors.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'guided';
// 12.1: a Guided page holds 8 / 6 / 3-6 (S / M / L). The continuation page (below) is what gives a
// sheet of tall cells its Model and three tries.
const CEILING = { S: 8, M: 6, L: 6 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

/** The Model plus at least three guided tries (round-3 re-grade: "a model and ONE practice item"). */
export const MIN_ITEMS = 4;
const MAX_PAGES = 3;

export function counts(pools, input) {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    const cols = bestCols(items, [AUTO_COLS[ctx.size], 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= AUTO_COLS[ctx.size]), ctx);
    return { main: sheetFit(items, cols, ctx, input).total };
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

/**
 * The height of the Steps list: rows of two steps (one column for 1-2 steps), each row as tall
 * as its longer step once wrapped (Andika about 0.5 em a character; the circle marker and the
 * band's padding come off the column width).
 */
function stepsBodyMm(steps, m) {
    const twoCols = steps.length > 2;
    const colW = twoCols ? (186 - 7 - 8) / 2 - 9.5 : 186 - 7 - 9.5;
    const charMm = 0.52 * m.textPt * (25.4 / 72);
    const lines = (t) => Math.max(1, Math.ceil((String(t).length * charMm) / colW));
    const lineMm = m.textPt * 1.3 * (25.4 / 72);
    let h = 0;
    for (let i = 0; i < steps.length; i += twoCols ? 2 : 1) {
        const n = Math.max(lines(steps[i]), twoCols && steps[i + 1] ? lines(steps[i + 1]) : 1);
        h += Math.max(m.pitch, n * lineMm) + 2.2;
    }
    return h;
}

/** Rows that fit under the Steps band (PT-GDP-3 teacher strip off). */
function fitRows(items, cols, ctx, input) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const steps = stepsOf(items);
    const stepsH = steps.length ? m.strip + stepsBodyMm(steps, m) + 4 : 0;
    const avail = m.budget - stepsH - m.strip;
    // The think line under a division fact (row 1), the Model tab clearance and the model's work
    // lines are drawn by the role, so their height is added here (the rows share one height).
    const model = items[0];
    const extra = !model || items.length < 2 ? 0
        : thinkCueOf(model) ? 17
        : (OWN_TOP_BAND.has(model.template) ? 0 : TAB_CLEAR_MM) + workLinesMm(workLinesOf(model), cols, m);
    const h0 = hMinAt(items, cols, ctx);
    const h = h0 + extra;
    const rows = Math.max(1, Math.min(Math.floor(CEILING[ctx.size] / cols), Math.floor(avail / Math.max(1, h))));
    return { rows, h, h0, avail, stepsH, steps, frame, m };
}

/**
 * The pages of the sheet. Page 1 holds what fits under its Steps band; when that is fewer than
 * the Model and three tries (a tall clock, coin set or story holds two a page), the section
 * continues on page 2 (and 3) under the continuation header, the Steps band repeated so the steps
 * stay in view (PT-GDP-2, PG-22). A continuation page is filled, never above the ceiling.
 */
function sheetFit(items, cols, ctx, input) {
    const first = fitRows(items, cols, ctx, input);
    const extra = first.h - first.h0;
    const mc = bandMetrics(ctx, layoutHeader(first.frame.contHeader), { cont: true });
    const availC = mc.budget - first.stepsH - mc.strip;
    const all = hMinAt(items, cols, ctx);
    // A page's rows are sized by the items that page holds (a tall coin set on page 2 does not
    // cost page 1 a row). Past the end of the probe the tallest probe item stands in.
    const hOf = (from, n) => {
        const slice = items.slice(from, from + n);
        const h = slice.length ? hMinAt(slice, cols, ctx) : all;
        return slice.length < n ? Math.max(h, all) : h;
    };
    const pages = [];
    let total = 0;
    while (pages.length < MAX_PAGES && total < CEILING[ctx.size] && (pages.length === 0 || total < MIN_ITEMS)) {
        const isFirst = pages.length === 0;
        const avail = isFirst ? first.avail : availC;
        const maxR = Math.max(1, Math.ceil((CEILING[ctx.size] - total) / cols));
        let r = 1;
        for (let k = maxR; k >= 1; k--) {
            // Page 1's first row is taller by the model's trace (its own row height, below).
            const h = hOf(total, k * cols);
            if (k * h + (isFirst ? extra : 0) <= avail) { r = k; break; }
        }
        pages.push({ rows: r, avail, h: hOf(total, r * cols), extra: isFirst ? extra : 0 });
        total += r * cols;
    }
    return Object.assign(first, { pages, rows: pages[0].rows, total: Math.min(CEILING[ctx.size], total) });
}

/* ================================================================== the worked trace */

/** The Model tab's clearance over a model cell's top pad (tab + 1.5 mm, less the 3 mm pad). */
const TAB_CLEAR_MM = 5;

/**
 * P-LC-9 on the Guided page: a template that cannot draw its own step states (a clock, coins, a
 * story, a chart, a place-value frame) shows its worked example WHOLE - the answer traced - and
 * under it the working of THIS problem in trace grey: the provider's worked steps that carry the
 * example's numbers ("Circle the numbers: 3 and 5." "3 + 5 = 8.", "Count: 1, 2, 3, 4, 5, 6.",
 * "Row 2, column 8: 2 × 8 = 16."). The bare "Write 8." that only repeats the traced answer is
 * left off. A stack, fact or equation traces its own working and gets none.
 */
export function workLinesOf(it) {
    if (!it || stepTemplateOf(it) || DRAWN_MARKS[it.template] || WHOLE_WORK.has(it.template)) return [];
    const steps = providerWorkedSteps(it, 6).map((s) => s.text).filter((t) => /\d/.test(t) && t.length <= 90);
    const work = steps.filter((t) => !/^Write\b/i.test(t));
    return (work.length ? work : steps).slice(0, 3);
}

/**
 * Templates whose worked example the Guided page marks IN the drawing (P-LC-9: the marks the
 * Steps ask for, in trace grey), so it needs no work lines under it.
 *   wordpic  the story's numbers ringed, the question underlined, and the number sentence
 *            written in the work box ("4 + 6 = 10") - Steps 2 and 3 of an addition story
 */
const DRAWN_MARKS = {
    wordpic(html, it) {
        const ringed = html.replace(/(<div class="k2-story"[^>]*>)((?:<div>[^<]*<\/div>)+)/, (m, open, lines) => {
            const ls = [...lines.matchAll(/<div>([^<]*)<\/div>/g)].map((x) => x[1]);
            const last = ls.length - 1;
            return open + ls.map((t, i) => {
                const withRings = t.replace(/\b\d+\b/g, (d) => `<span class="mq-ring" data-ws-ink="trace">${d}</span>`);
                return `<div>${i === last && /\?/.test(t) ? `<span class="mq-uline" data-ws-ink="trace">${withRings}</span>` : withRings}</div>`;
            }).join('');
        });
        const eq = sentenceOf(it);
        if (!eq) return ringed;
        return ringed.replace(/(aria-label="work space"[^>]*>)/, `$1<span class="mq-workeq ws-trace" data-ws-ink="trace">${esc(eq)}</span>`);
    },
    // mult-grid  Steps 1-3 ("one finger on the row number, another on the column number, slide
    //            them to where they meet"): the two factors of every empty cell ringed in grey,
    //            the product traced in the cell by the template itself
    'mult-grid'(html, it) {
        const p = (it.q && it.q.cell && it.q.cell.payload) || {};
        const rowsOn = new Set((p.blanks || []).map(([i]) => i + 1));
        const colsOn = new Set((p.blanks || []).map(([, j]) => j + 1));
        if (!rowsOn.size) return html;
        const ring = 'box-shadow:inset 0 0 0 2pt #949494;border-radius:1.5mm;';
        let r = -1;
        return html.replace(/<tr>([\s\S]*?)<\/tr>/g, (m, inner) => {
            r++;
            let c = -1;
            const out = inner.replace(/<td style="/g, (td) => {
                c++;
                const on = (r === 0 && colsOn.has(c)) || (c === 0 && r > 0 && rowsOn.has(r));
                return on ? `<td class="mq-factorring" style="${ring}` : td;
            });
            return `<tr>${out}</tr>`;
        });
    },
};

/** Templates whose traced answer IS the whole working (every fact of a family, both parts of a bond). */
const WHOLE_WORK = new Set(['family', 'bond']);

/** Templates whose drawing starts below a band of its own, clear of the Model tab. */
const OWN_TOP_BAND = new Set(['stack', 'mult-grid']);

/** The number sentence of a worked example, from its provider's marks ("3+5=8" -> "3 + 5 = 8"). */
function sentenceOf(it) {
    for (const st of providerWorkedSteps(it, 6)) {
        for (const mk of st.marks || []) {
            if (mk && mk.slot === 'equation' && mk.value !== undefined && mk.value !== null) {
                return String(mk.value).replace(/\s+/g, '').replace(/([+\-−×÷=])/g, ' $1 ').replace(/\s+/g, ' ').trim();
            }
        }
    }
    return '';
}

/** The model cell's drawn marks (trace grey), when its template has them. */
export function modelMarks(html, it) {
    const f = it && DRAWN_MARKS[it.template];
    if (!f) return html;
    try { return f(html, it); } catch (e) { return html; }
}

function workLinesMm(lines, cols, m) {
    if (!lines.length) return 0;
    const colW = 186 / Math.max(1, cols) - 8;
    const charMm = 0.5 * m.textPt * (25.4 / 72);
    const lineMm = m.textPt * 1.25 * (25.4 / 72);
    const n = lines.reduce((a, t) => a + Math.max(1, Math.ceil((t.length * charMm) / colW)), 0);
    return n * lineMm + 4;
}

const workHtml = (lines) => (lines.length
    ? `<ul class="mq-worklines ws-trace" data-ws-ink="trace">${lines.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');

const GUIDED_CSS = `<style data-mq-guided>
:is(.ws-page,.ws-sheet) .mq-worklines{list-style:none;margin:2mm 0 0;padding:0;width:100%;font-size:var(--ws-text);line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-worklines li{margin:0}
:is(.ws-page,.ws-sheet) .mq-workwrap{width:100%;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-ring{display:inline-block;border:1pt solid #949494;border-radius:999px;padding:0 .2em;line-height:1.1}
:is(.ws-page,.ws-sheet) .mq-uline{text-decoration:underline;text-decoration-color:#949494;text-decoration-thickness:1pt;text-underline-offset:.15em}
:is(.ws-page,.ws-sheet) .mq-workeq{position:absolute;left:0;right:0;top:45%;text-align:center;font-size:var(--ws-text);font-weight:700;line-height:1.2}
</style>`;

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

/* ================================================================ fade helpers */

/** The carries of a column addition: carries[k] is the digit carried INTO column k (0 = ones). */
function carriesOf(it) {
    const q = it.q || {};
    const p = (q.cell && q.cell.payload) || {};
    if (!/^(\+|add)$/.test(String(p.op || q.op || '')) && opOf(q) !== 'add') return [];
    const ops = operandsOf(q).filter((v) => Number.isInteger(v) && v >= 0);
    if (ops.length < 2) return [];
    const width = Math.max(...ops.map((v) => String(v).length));
    const carries = [];
    let carry = 0;
    for (let k = 0; k < width; k++) {
        const sum = ops.reduce((acc, v) => acc + (Math.floor(v / 10 ** k) % 10), 0) + carry;
        carry = Math.floor(sum / 10);
        carries[k + 1] = carry;
    }
    return carries;
}

const RG_RE = /<span class="rg([^"]*)"((?: data-ws-seg="[^"]*")?)>([\s\S]*?)<\/span>/g;

/**
 * Write the carried digits into a column stack's regroup boxes in trace grey: the regroup is part
 * of the working (critic round 2: "the carried tens is never traced in the carry box").
 * `upTo` is the highest column whose carry is written (1 = the ten carried out of the ones only).
 */
export function traceCarries(html, it, upTo = Infinity) {
    const carries = carriesOf(it);
    if (!carries.length) return html;
    const t = Number((/--t:(\d+)/.exec(html) || [])[1]) || 0;
    if (!t) return html;
    let i = -1;
    return html.replace(RG_RE, (m, cls, seg, inner) => {
        i++;
        const k = t - 1 - i;
        const c = carries[k];
        if (!seg || !c || k > upTo || !/<i\b[^>]*><\/i>/.test(inner)) return m;
        const filled = inner.replace(/<i\b([^>]*)><\/i>/, (mm, attrs) => {
            const st = /style="([^"]*)"/.exec(attrs);
            const rest = attrs.replace(/\s*style="[^"]*"/, '');
            return `<i${rest} class="ws-trace" data-ws-ink="trace" style="${st ? `${st[1]};` : ''}display:flex;align-items:center;justify-content:center;font-size:.55em;line-height:1">${c}</i>`;
        });
        return `<span class="rg${cls}"${seg}>${filled}</span>`;
    });
}

/** SF-30: a dot tile (dice patterns 1-6, two-row ten-frame patterns 7-10) in trace grey (H3). */
export function dotTile(n, sideMm = 9) {
    const s = sideMm;
    const a = 0.27, b = 0.73;
    const dice = {
        1: [[0.5, 0.5]], 2: [[a, a], [b, b]], 3: [[a, a], [0.5, 0.5], [b, b]], 4: [[a, a], [b, a], [a, b], [b, b]],
        5: [[a, a], [b, a], [0.5, 0.5], [a, b], [b, b]], 6: [[a, 0.22], [b, 0.22], [a, 0.5], [b, 0.5], [a, 0.78], [b, 0.78]],
    };
    const pts = n <= 6 ? dice[n] : [...Array.from({ length: 5 }, (_, i) => [0.14 + 0.18 * i, 0.36]), ...Array.from({ length: n - 5 }, (_, i) => [0.14 + 0.18 * i, 0.64])];
    const r = (n <= 6 ? 0.08 : 0.065) * s;
    const f = (v) => Math.round(v * 100) / 100;
    return `<svg class="mq-dottile" data-ws-ink="trace" width="${s}mm" height="${s}mm" viewBox="0 0 ${s} ${s}" aria-hidden="true">`
        + `<rect x=".2" y=".2" width="${f(s - 0.4)}" height="${f(s - 0.4)}" rx="1.2" fill="#fff" stroke="#949494" stroke-width=".3"/>`
        + (pts || []).map(([x, y]) => `<circle cx="${f(x * s)}" cy="${f(y * s)}" r="${f(r)}" fill="#949494"/>`).join('') + '</svg>';
}

/**
 * The count cue of a + or − fact (PEDAGOGY_STANDARD 4.2, H3): a dot tile of the number counted on
 * (the smaller addend) or back (the number taken away); null for any other item.
 */
export function countCueOf(it) {
    const q = it.q || {};
    if (it.template !== 'fact') return null;
    const p = (q.cell && q.cell.payload) || {};
    if (p.notation === 'horiz' || p.notation === 'horizontal') return null;
    const op = opOf(q);
    const o = operandsOf(q);
    if (o.length < 2 || !o.every((v) => Number.isInteger(v) && v >= 0)) return null;
    const n = op === 'add' ? Math.min(o[0], o[1]) : op === 'subtract' ? o[1] : NaN;
    return n >= 1 && n <= 10 ? n : null;
}

/**
 * The think line of a division fact (the Steps' missing-factor frame, PT-FPR-7's think box):
 * "6 × __ = 24" in trace grey under the fact; on the worked example the factor is filled in.
 */
export function thinkCueOf(it, filled = false) {
    const q = it.q || {};
    if (it.template !== 'fact' || opOf(q) !== 'divide') return '';
    const o = operandsOf(q);
    if (o.length < 2 || !o[1] || o[0] % o[1]) return '';
    const gap = filled ? String(o[0] / o[1]) : '__';
    return `<div class="mq-thinkcue ws-trace" data-ws-ink="trace">${o[1]} × ${gap} = ${o[0]}</div>`;
}

/** A drawn cell with its cue: the dot tile beside a + / − fact, the think line under a ÷ fact. */
function withCue(html, it, stage) {
    if (stage === 'blank') return html;
    const n = countCueOf(it);
    if (n) return `<div class="mq-cuewrap">${html}<span class="mq-cue">${dotTile(n)}</span></div>`;
    const think = thinkCueOf(it, stage === 'model');
    return think ? `<div class="mq-cuecol">${html}${think}</div>` : html;
}

/**
 * The fade of one cell (PEDAGOGY_STANDARD 4.2, PT-GDP-1), by its place on the page:
 *   'model'    cell 1, the worked example: the whole answer and its working in trace grey
 *   'partial'  the rest of row 1: the whole FIRST STEP of the working in grey - on a column stack
 *              the ones digit and the ten it carries (H5) - and the count cue (H3). A cell with no
 *              multi-step working (one fact, a count, several separate blanks, long division) is
 *              never partly traced: a lone grey digit reads as the answer ("1" of 19), and half
 *              the blanks traced reads as a half-worked item (critic round 2).
 *   'blank'    every later row: structural supports only
 */
function fadeRender(it, stage, ans) {
    const work = stage === 'model' ? workHtml(workLinesOf(it)) : '';
    const cue = (html0) => {
        const html = stage === 'model' ? modelMarks(html0, it) : html0;
        return work ? `<div class="mq-workwrap">${withCue(html, it, stage)}${work}</div>` : withCue(html, it, stage);
    };
    return (c, o) => {
        if (c.state !== 'blank') {
            const html = it.render(c, o);
            return cue(stage === 'model' && it.template === 'stack' ? traceCarries(html, it) : html);
        }
        if (stage === 'model') {
            const html = it.render(c, Object.assign({}, o, { shown: ans, ink: 'trace' }));
            return cue(it.template === 'stack' ? traceCarries(html, it) : html);
        }
        if (stage === 'partial' && it.template === 'stack') {
            let part = null;
            try { part = partialTrace(it.render(c, Object.assign({}, o, { shown: ans, ink: 'trace' }))); } catch (e) { part = null; }
            if (part) return traceCarries(part, it, 1);
        }
        return cue(it.render(c, o));
    };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const items = poolItems(input, 'main');
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const colsWanted = AUTO_COLS[ctx.size];
    const cols = bestCols(items, [colsWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= colsWanted), ctx);
    const fit = sheetFit(items, cols, ctx, input);
    const use = items.slice(0, Math.min(items.length, fit.total));
    const key = instructionKeyOf(use, input.skills);
    // Critic round 2 (C4): the Guided page is labelled and scored like every other role. The
    // worked example carries the "Model" tab and is not scored; the rest run a. b. c. ...
    const worked = use.length > 1 && !!answerOf(use[0]);
    const scored = use.length - (worked ? 1 : 0);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: scored });
    // The partial stage is the rest of row 1, never more than two cells.
    const partialEnd = Math.min(cols, 3);
    const planItems = use.map((it, i) => {
        const ans = answerOf(it);
        const stage = i === 0 && worked ? 'model' : i < partialEnd && ans ? 'partial' : 'blank';
        const level = stage === 'model' ? 3 : stage === 'partial' ? 2 : 1;
        // Round-3 re-grade: the Model tab overprinted the first line of a story, a sentence or a
        // tile row. Every model cell but a column stack (whose grid already starts below the tab)
        // steps its content down clear of the tab.
        const cell = stage === 'model' && !OWN_TOP_BAND.has(it.template)
            ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-modelcell'].join(' ').trim() }) : it;
        return planItem(cell, { cols, level, render: fadeRender(it, stage, ans), model: stage === 'model', nolabel: stage === 'model' });
    });
    const stepsBand = () => {
        const cls = `mq-steps-rows${fit.steps.length <= 2 ? ' mq-steps-one' : ''}`;
        return { kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepsband">${stepsHtml(fit.steps, { cls })}</div>` };
    };
    // One page per entry of fit.pages, the rows of each page sharing that page's height (the page
    // is filled, never left 40% blank); letters run on across the pages (CL-12).
    const pages = [];
    const fitsOut = [];
    let from = 0;
    let letter = 1;
    fit.pages.forEach((pg, pi) => {
        if (from >= planItems.length) return;
        const chunk = planItems.slice(from, from + pg.rows * cols);
        from += chunk.length;
        const rows = Math.max(1, Math.ceil(chunk.length / cols));
        const cellH = pg.avail / Math.max(rows, pg.rows);
        const sections = [];
        if (pi === 0) sections.push({ kind: 'html', html: GUIDED_CSS });
        if (fit.steps.length) sections.push(stepsBand());
        const part = gridPart(chunk, { cols, rows, cellH, labels: labelStyleOf(ctx.look, input.labels), start: letter });
        // The model row carries the worked trace: it takes its extra height, and the rows share
        // the rest in proportion (every row still fills its share of the page).
        if (pg.extra > 0 && rows > 1) part.rowsTpl = `${Math.round((pg.h + pg.extra) * 10) / 10}fr repeat(${rows - 1},${Math.round(pg.h * 10) / 10}fr)`;
        sections.push({ kind: 'band', label: 'Guided Practice:', instr: instructionText(key, use), content: part });
        letter += chunk.filter((p) => !p.nolabel).length;
        pages.push({ sections });
        fitsOut.push({ cols, rows, cellH });
    });
    const n = pages.length;
    return assemble(ROLE_ID, input, frame, pages, {
        meta: {
            items: use.length, scoreOutOf: scored, steps: fit.steps.length,
            fits: fitsOut.map((f, i) => Object.assign(f, { line: `Fits: ${cols} columns x ${f.rows} rows${n > 1 ? ` (page ${i + 1} of ${n})` : ''}, ${use.length} guided cells.` })),
            notes: fit.steps.length ? [] : ['No Steps band: this skill supplies no steps of its own yet (strings.steps / workedSteps).'],
        },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan, stepsOf, workLinesOf, modelMarks, partialTrace, traceCarries, dotTile, countCueOf, thinkCueOf };
