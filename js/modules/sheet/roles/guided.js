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
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, bestCols, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, stepsHtml, assemble, poolItems, answerOf, stringsOf, labelStyleOf, opOf, operandsOf,
    providerWorkedSteps, esc,
} from './compose.js';
import { getProvider } from '../index.js';
import { stepTemplateOf } from '../anchors.js';
import { FILL_CAP, groupByHeight, rowGapFor } from '../layout.js';

/** The model first, then the tries grouped by height (H13: rows hold problems of one height). */
const ordered = (items0, cols) => {
    // Round-4 re-grade: the Model is a problem the Steps work forwards - a start-unknown or
    // missing-part item ("[ ] - 1 = 15") is never the worked example when another item is not.
    // Regrade 5 (tally_chart: page 1 held the Model alone, a 184 mm chart): of those, the Model is
    // the SHORTEST (measured at this column count), so the Model and its tries share page 1.
    const hOf = (it) => { const m = it && it.measured && it.measured[cols]; return m && Number.isFinite(m.hMm) ? m.hMm : Infinity; };
    // Only a clearly shorter one (under 85% of the first's height) displaces the first: near
    // heights keep the deal's order, so the page counts() planned is the page printed.
    const first = items0.findIndex((it) => !(it && it.q && it.q.missing));
    let k = first;
    items0.forEach((it, i) => {
        if (first < 0 || (it && it.q && it.q.missing)) return;
        if (hOf(it) < 0.85 * hOf(items0[first]) && hOf(it) < hOf(items0[k])) k = i;
    });
    const items = k > 0 ? [items0[k], ...items0.slice(0, k), ...items0.slice(k + 1)] : items0;
    return items.length > 2 ? [items[0], ...groupByHeight(items.slice(1), cols)] : items;
};

/**
 * The first tries (the partial stage, BD-7): the rest of the Model's row, or the whole first row
 * of tries under a spanning Model. The whole ROW, so the grey hint line that makes that row
 * taller is in every cell of it (regrade 5 at S: two hinted cells and a third without one left a
 * 33% band in the third, H13).
 */
export const partialEndOf = (cols, span) => (span ? cols + 1 : Math.max(2, cols));
/** The row the first tries sit in. */
const partialRowOf = (cols, span) => (span || cols === 1 ? 1 : 0);

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
/**
 * The probe the page is chosen from: wider than the page, so a mixed pool offers the Model's kind
 * of problem (pageSet) three more times, and one-column items can be left out.
 */
export const PROBE = 48;
export const ROLE_ID = 'guided';
// 12.1: a Guided page holds 8 / 6 / 3-6 (S / M / L). The continuation page (below) is what gives a
// sheet of tall cells its Model and three tries.
// pv-r1 critic: a Guided page of short problems at S left a 20-26% strip under 6 tries ("8-10
// at S"); 12.1 now allows 10 / 8 / 6 (tall problems stop sooner by height).
const CEILING = { S: 10, M: 8, L: 6 };
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

/** The Model plus at least three guided tries (round-3 re-grade: "a model and ONE practice item"). */
export const MIN_ITEMS = 4;
const MAX_PAGES = 3;

/**
 * The page's column count and the items it holds. One grid column count serves the page, so a
 * mixed skill whose pool carries a few one-column items (a three-clock choice among read-the-clock
 * items) would otherwise put EVERY cell in one full-width column - a clock pinned in a 185 mm cell,
 * the Model and one try per page (round-4 re-grade, mixed_time). When most of the pool fits more
 * columns, the Guided page keeps those items (still the Model and three tries at least) and leaves
 * the wide ones to the other roles.
 */
/** The kind of problem an item is: its template, the template's own variant (pv 'chart') ... */
const kindOf = (it) => {
    const p = (it && it.q && it.q.cell && it.q.cell.payload) || {};
    // ...and the steps its provider writes for THIS question: one payload kind can carry two
    // sub-skills of a mixed pool, or two question kinds ("How many?" / "How many more?") whose
    // steps differ (L6, figures-r6: one step list printed over every question kind).
    const own = splitSteps(stringsOf(it).steps);
    return `${(it && it.template) || ''}:${p.kind || ''}:${(own.length ? own : generalStepsOf(it)).join('|')}`;
};

export function pageSet(items0, ctx, kind = null, input = null, fixedCols = 0) {
    const wanted = AUTO_COLS[ctx.size];
    const options = [wanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= wanted);
    // Guided practice practises what the Model shows (round-4 re-grade, mixed_placevalue: a place
    // value mat modelled over an underline-the-digit try and an expanded-form try, one Steps band
    // for all three). A mixed pool keeps ONE kind of problem (the one it deals most) when it has the Model and
    // three tries of it; the other kinds are for the Independent and review pages.
    // The kind the pool offers most (a page of it, not two tries of a rarer one); ties go to the
    // kind dealt first.
    const tally = new Map();
    for (const it of items0) tally.set(kindOf(it), (tally.get(kindOf(it)) || 0) + 1);
    let top = '', best = 0;
    for (const [k, n] of tally) if (n > best) { top = k; best = n; }
    // The plan takes the kind counts() chose from the whole probe (its deal is a prefix of it).
    if (kind !== null) top = kind;
    const same = items0.filter((it) => kindOf(it) === top);
    const cut = kind !== null ? kind !== '' : same.length >= MIN_ITEMS && same.length < items0.length;
    const items = cut ? same : items0;
    let cols = bestCols(items, options, ctx);
    let use = items;
    for (const c of options) {
        if (c <= cols) break;
        const keep = items.filter((it) => fitsAt([it], c, ctx));
        if (keep.length >= MIN_ITEMS && keep.length * 2 >= items.length) { cols = c; use = keep; break; }
    }
    // The plan keeps the column count counts() chose (its deal is a prefix of the probe).
    if (fixedCols > 0 && fixedCols <= cols && fitsAt(use, fixedCols, ctx)) return { cols: fixedCols, items: use, kind: cut ? top : '' };
    // LESSONS_LEARNED L1/L2: the widest grid is not always the fullest page. More columns under a
    // spanning Model cost a whole row to the Model, and the page ceiling then trims the rest (size
    // S: a 4-column compare page held the Model and 4 tries, 45% of it blank, where 2 columns hold
    // the Model and 7). Of the column counts every item fits, take the one whose FIRST page holds
    // the most; a tie keeps the wider grid.
    if (input) {
        let bestN = -1, bestC = cols;
        // RUBRIC H13 across the cell: a static-width problem (a stack) centred in a column so wide
        // that each side band is 30% or more is not a candidate while a narrower grid avoids it.
        const ws = use.map((it) => it.footprint || {}).filter((fp) => !fp.measure && !fp.factLike && Number.isFinite(fp.wMm)).map((fp) => fp.wMm);
        const side = (c) => (ws.length === use.length && ws.length ? (1 - Math.max(...ws) / (186 / c)) / 2 : 0);
        const fitting = options.filter((x) => x <= cols && (x > 1 || cols === 1) && fitsAt(use, x, ctx));
        const calm = fitting.filter((c) => side(c) < 0.28);
        // Never down to one full-width column when two fit (a compare row alone in a 186 mm cell).
        for (const c of (calm.length ? calm : fitting)) {
            const f = sheetFit(ordered(use, c), c, ctx, input, use.length < items0.length ? use.length : Infinity);
            const n = Math.min(f.pages[0].cap, f.total);
            if (n > bestN) { bestN = n; bestC = c; }
        }
        cols = bestC;
    }
    return { cols, items: use, kind: cut ? top : '' };
}

export function counts(pools, input) {
    const ctx = ctxOf(input);
    const all = pools.main || [];
    const { cols, items, kind } = pageSet(all, ctx, null, input);
    // plan() cuts its (prefix) deal to the same kind of problem, on the same grid.
    input.guidedKind = kind;
    input.guidedCols = cols;
    const cut = items.length < all.length;
    let total = sheetFit(ordered(items, cols), cols, ctx, input, cut ? items.length : Infinity).total;
    // The plan sees only the items dealt (the first `total`), so it may choose another Model (the
    // shortest of THOSE) and hold fewer (teen_compose at L: Model + 3 planned on the probe, Model
    // + 2 printed). Settle on a count the dealt items themselves fill.
    for (let k = 0; k < 4; k++) {
        const sub = items.slice(0, total);
        const t2 = Math.min(total, sheetFit(ordered(sub, cols), cols, ctx, input, sub.length).total);
        if (t2 === total) break;
        total = t2;
    }
    if (items.length === all.length) return { main: total };
    // The deal is a prefix of the probe: take it up to the total-th kept item.
    const last = items[Math.min(total, items.length) - 1];
    return { main: Math.max(total, all.indexOf(last) + 1) };
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
    const own = splitSteps(stringsOf(it).steps);
    if (own.length) {
        // Round-4 re-grade: steps written for the MODEL's numbers ("Circle groups of 2.") sat over
        // tries that divide by 5 and 3. When the provider's steps differ from item to item on this
        // page, the band prints its GENERAL steps (the provider's strings without a question).
        const key = own.join('|');
        const same = items.slice(1, 12).every((x) => splitSteps(stringsOf(x).steps).join('|') === key);
        if (same) return own.slice(0, 6);
        const gen = mergedGeneralSteps(items.slice(0, 12));
        return (gen.length ? gen : own).slice(0, 6);
    }
    const q = it.q || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        if (!p || !Array.isArray(p.real) || !p.real.includes('workedSteps') || typeof p.workedSteps !== 'function') return [];
        const st = p.workedSteps(q);
        return splitSteps(Array.isArray(st) ? st.map((s) => (s && typeof s === 'object' ? s.text : s)) : st).slice(0, 6);
    } catch (e) { return []; }
}

/** The provider's steps with no question in hand: the steps that fit every item of the skill. */
function generalStepsOf(it) {
    const q = (it && it.q) || {};
    try {
        const p = getProvider(q.categoryId || '', q.skillId || '');
        const raw = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel }) : p.strings;
        return splitSteps(raw && raw.steps);
    } catch (e) { return []; }
}

/**
 * The general steps of every sub-skill on the page, merged (round-4 re-grade: a mixed time page
 * printed the o'clock steps of its Model over half-past tries). Each distinct list's own lines
 * go in before the next line that list shares with the others ("The long hand on 12 means o'clock.",
 * "The long hand on 6 means 30 minutes: half past." both sit between the hour and the write
 * step); more than six lines keeps only the lines every list shares.
 */
function mergedGeneralSteps(items) {
    const lists = [];
    const seen = new Set();
    for (const x of items) {
        const g = generalStepsOf(x);
        const k = g.join('|');
        if (g.length && !seen.has(k)) { seen.add(k); lists.push(g); }
    }
    if (lists.length < 2) return lists[0] || [];
    const out = lists[0].slice();
    for (const l of lists.slice(1)) {
        l.forEach((line, j) => {
            if (out.includes(line)) return;
            // Before the next line this list shares with the merge, so the lists keep their order.
            const next = l.slice(j + 1).find((n) => out.includes(n));
            out.splice(next ? out.indexOf(next) : out.length, 0, line);
        });
    }
    if (out.length <= 6) return out;
    const shared = lists[0].filter((line) => lists.every((l) => l.includes(line)));
    return shared.length >= 2 ? shared : lists[0];
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
function fitRows(items, cols, ctx, input, { noSpan = false, noHint = false } = {}) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const steps = stepsOf(items);
    const stepsH = steps.length ? m.strip + stepsBodyMm(steps, m) + 4 : 0;
    const avail = m.budget - stepsH - m.strip;
    // The think line under a division fact (row 1), the Model tab clearance and the model's work
    // lines are drawn by the role, so their height is added here (the rows share one height).
    const model = items[0];
    const h0 = hMinAt(items, cols, ctx);
    // RUBRIC H13: a model carrying worked lines on a page of 2+ columns takes the whole first row,
    // its lines BESIDE the drawing - under it, the lines made row 1 far taller than the tries
    // sharing that row (a 40% empty band in each). The row holds the model only.
    const lines = model && items.length > 1 && !thinkCueOf(model) ? workLinesOf(model) : [];
    const span = !noSpan && cols > 1 && lines.length > 1;
    const extra = !model || items.length < 2 ? 0
        : thinkCueOf(model) ? 17
        : span ? TAB_CLEAR_MM + Math.max(0, workLinesMm(lines, 2, m) - h0)
        : (OWN_TOP_BAND.has(model.template) ? 0 : TAB_CLEAR_MM) + workLinesMm(lines, cols, m);
    // BD-7: the first tries carry a grey hint line (hintOf); their row is that much taller.
    // Its height is the longest hint's wrapped lines at this column width (a clock's two-sentence
    // hint wraps to two lines in a third of the page), plus the line's top margin.
    // Every cell of that row carries one, or none does: a row where one try has no hint of its
    // own would leave that cell a hint-line's height of empty band (H13).
    const partial = items.slice(1, partialEndOf(cols, span));
    const hints = noHint ? [] : partial.map((x) => hintOf(x));
    const hint = hints.length && hints.every(Boolean) ? Math.max(HINT_MM, ...hints.map((t) => workLinesMm([t], cols, m) - 4 + 2)) : 0;
    const h = h0 + extra;
    const rows = Math.max(1, Math.min(Math.floor(CEILING[ctx.size] / cols), Math.floor(avail / Math.max(1, h))));
    return { rows, h, h0, avail, stepsH, steps, frame, m, span, hint };
}

/**
 * The pages of the sheet. Page 1 holds what fits under its Steps band; when that is fewer than
 * the Model and three tries (a tall clock, coin set or story holds two a page), the section
 * continues on page 2 (and 3) under the continuation header, the Steps band repeated so the steps
 * stay in view (PT-GDP-2, PG-22). A continuation page is filled, never above the ceiling.
 */
function sheetFit(items, cols, ctx, input, limit = Infinity) {
    let a = sheetFitWith(items, cols, ctx, input, false, false, limit);
    // The first tries' grey hint line never costs page 1 its only try (round-4: a page holding
    // the Model alone): tall problems drop the hint rather than the try.
    if (a.hint && a.pages[0].cap < 2) {
        const c = sheetFitWith(items, cols, ctx, input, false, true, limit);
        if (c.pages[0].cap > a.pages[0].cap) a = c;
    }
    // Round-4 re-grade: a spanning Model that pushed the tries onto a second page (Model + 2 on
    // page 1, a quarter-empty page 2) gives way to the Model in a cell of its own when that keeps
    // the Model and three tries on page 1.
    if (a.span && a.pages[0].cap < MIN_ITEMS) {
        const b = sheetFitWith(items, cols, ctx, input, true, !a.hint, limit);
        if (b.pages[0].cap >= MIN_ITEMS || b.pages.length < a.pages.length) return b;
    }
    return a;
}

function sheetFitWith(items, cols, ctx, input, noSpan, noHint = false, limit = Infinity) {
    const first = fitRows(items, cols, ctx, input, { noSpan, noHint });
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
        // Each row is as tall as what IT holds (H13), so the rows that fit are counted by the sum
        // of their own heights, page 1's first row taller by the model's trace.
        const rowsH = (k) => {
            let idx = total, sum = 0;
            for (let rr = 0; rr < k; rr++) {
                const n = isFirst && first.span && rr === 0 ? 1 : cols;
                sum += hOf(idx, n) + (isFirst && rr === partialRowOf(cols, first.span) ? first.hint : 0);
                idx += n;
            }
            return sum;
        };
        let r = 1;
        for (let k = maxR; k >= 1; k--) {
            if (rowsH(k) + (isFirst ? extra : 0) <= avail) { r = k; break; }
        }
        const cap = r * cols - (isFirst && first.span ? cols - 1 : 0);
        pages.push({ rows: r, avail, h: hOf(total, r * cols), extra: isFirst ? extra : 0, cap });
        total += cap;
    }
    // The ceiling trims the LAST page to whole rows (round-4: a 2 x 2 continuation page with its
    // fourth cell empty); a page left with no row is dropped while the Model and 3 tries remain.
    // A continuation page keeps the whole rows it was given (the rows were counted against the
    // ceiling): trimming its last row to the ceiling left a page 2 one row tall and half blank
    // (round-4 re-grade), so the sheet may run up to one row past the ceiling there.
    // `limit`: the items there are (a pool cut to the Model's kind); never a page of empty cells.
    const slack = pages.length > 1 ? cols - 1 : 0;
    const most = () => Math.min(CEILING[ctx.size] + (pages.length > 1 ? slack : 0), limit);
    let over = total - most();
    while (over > 0 && pages.length) {
        const pg = pages[pages.length - 1];
        const keepRows = Math.floor((pg.cap - over) / cols);
        const spanCut = pages.length === 1 && first.span ? cols - 1 : 0;
        if (keepRows >= 1 || pages.length === 1) {
            const r = Math.max(1, keepRows + (spanCut ? 1 : 0));
            const cap = Math.max(1, r * cols - spanCut);
            // Page 1 at its last row: nothing more to trim (the total is clipped on return).
            if (cap >= pg.cap) break;
            total -= pg.cap - cap;
            pg.rows = r;
            pg.cap = cap;
        } else {
            total -= pg.cap;
            pages.pop();
        }
        over = total - most();
    }
    return Object.assign(first, { pages, rows: pages[0].rows, total: Math.min(most(), total) });
}

/* ================================================================== the worked trace */

/** The most a guided row stretches over its tallest problem (the H13 cap, as every role). */
const GUIDED_STRETCH = FILL_CAP;

/** The least a grey hint under a first try (BD-7) adds to its row, in mm. */
const HINT_MM = 8;

/**
 * BD-7 / SF-10, the first tries' grey scaffold for templates with no partial trace of their own:
 * the FIRST step of THIS problem's worked steps that carries its numbers but not its answer
 * ("Circle the numbers: 3 and 5.", "Row 2, column 8:", "Start at 64."), in trace grey under the
 * problem. A stack traces its first column instead; a fact carries its dot cue.
 */
export function hintOf(it) {
    if (!it || it.template === 'stack' || countCueOf(it) || thinkCueOf(it)) return '';
    const ans = String(answerOf(it) === null || answerOf(it) === undefined ? '' : (typeof answerOf(it) === 'object' ? (answerOf(it).display || answerOf(it).value || '') : answerOf(it))).trim();
    const tokens = ans ? ans.split(/[\s,]+/).filter((t) => /\d/.test(t) || t.length > 1) : [];
    // A step is THIS problem's when it carries its numbers or names something the problem shows
    // (figures-r6: "Find the Birds bar." - a graph's first step has no digit, and the hint was
    // missing from every try, so nothing faded from the Model).
    const q = it.q || {};
    const src = `${q.text || ''} ${JSON.stringify((q.cell && q.cell.payload) || {})}`;
    const own = (t) => /\d/.test(t) || (t.match(/\b[A-Z][a-z]{2,}\b/g) || []).slice(1).some((w) => src.includes(w));
    for (const st of providerWorkedSteps(it, 6)) {
        const t = String(st.text || '').trim();
        if (!own(t) || /^(Write|Check|Say)\b/i.test(t) || t.length > 60) continue;
        const words = t.replace(/[.,:;!?]/g, ' ').split(/\s+/);
        if (tokens.some((a) => words.includes(a))) continue;
        return t;
    }
    return '';
}

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
        const ring = 'outline:2pt solid #949494;outline-offset:-2.5pt;border-radius:1.5mm;';
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
:is(.ws-page,.ws-sheet) .mq-hintline{margin-top:1.5mm;font-size:var(--ws-text);line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-workwrap{width:100%;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-workwrap{flex-direction:row;justify-content:center;align-items:center;column-gap:8mm}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-workwrap>:first-child{flex:0 1 auto;max-width:55%}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-worklines{width:auto;max-width:45%;margin:0;text-align:left}
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

/** The fact row (1 top, 2 bottom) whose number the count cue pictures. */
export function countCueRow(it) {
    const q = it.q || {};
    const o = operandsOf(q);
    if (opOf(q) === 'subtract') return 2;
    return o.length >= 2 && o[1] <= o[0] ? 2 : 1;
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
    // R3: the tile sits beside the number it pictures - the second row when that is the smaller
    // addend or the number taken away (critic round 3: it sat beside the top number).
    if (n) return `<div class="mq-cuewrap">${html}<span class="mq-cue${countCueRow(it) === 2 ? ' mq-cue-b' : ''}">${dotTile(n)}</span></div>`;
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
function fadeRender(it, stage, ans, { hint = true } = {}) {
    const work = stage === 'model' ? workHtml(workLinesOf(it)) : '';
    const cue = (html0) => {
        const html = stage === 'model' ? modelMarks(html0, it) : html0;
        return work ? `<div class="mq-workwrap">${withCue(html, it, stage)}${work}</div>` : withCue(html, it, stage);
    };
    // The partial stage's grey hint line prints on the pupil page AND its facsimile key (AK-1):
    // the row that carries it was sized for it on both.
    const hintLine = stage === 'partial' && hint && it.template !== 'stack' ? hintOf(it) : '';
    const withHint = (html) => `<div class="mq-workwrap">${html}<div class="mq-hintline ws-trace" data-ws-ink="trace">${esc(hintLine)}</div></div>`;
    return (c, o) => {
        if (c.state !== 'blank') {
            const html = it.render(c, o);
            if (hintLine) return withHint(cue(html));
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
        if (hintLine) return withHint(cue(it.render(c, o)));
        return cue(it.render(c, o));
    };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const { cols, items } = pageSet(poolItems(input, 'main'), ctx, typeof input.guidedKind === 'string' ? input.guidedKind : null,
        Number(input.guidedCols) > 0 ? null : input, Number(input.guidedCols) || 0);
    const fit = sheetFit(ordered(items, cols), cols, ctx, input, items.length);
    const use = ordered(items, cols).slice(0, Math.min(items.length, fit.total));
    const key = instructionKeyOf(use, input.skills);
    // Critic round 2 (C4): the Guided page is labelled and scored like every other role. The
    // worked example carries the "Model" tab and is not scored; the rest run a. b. c. ...
    const worked = use.length > 1 && !!answerOf(use[0]);
    const scored = use.length - (worked ? 1 : 0);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: scored });
    // The partial stage is the rest of the Model's row (or the first row of tries), partialEndOf.
    const partialEnd = partialEndOf(cols, fit.span);
    const planItems = use.map((it, i) => {
        const ans = answerOf(it);
        const stage = i === 0 && worked ? 'model' : i < partialEnd && ans ? 'partial' : 'blank';
        // A column stack keeps its digit grid - the place-value header and the answer boxes - on
        // every guided try (structural, PEDAGOGY 4.2); at level 1 the template drops them, the
        // later rows came out 38 mm shorter than the row sized for them (H13, add_50_mixed).
        const level = stage === 'model' ? 3 : stage === 'partial' || it.template === 'stack' ? 2 : 1;
        // Round-3 re-grade: the Model tab overprinted the first line of a story, a sentence or a
        // tile row. Every model cell but a column stack (whose grid already starts below the tab)
        // steps its content down clear of the tab.
        const cell = stage === 'model' && !OWN_TOP_BAND.has(it.template)
            ? Object.assign({}, it, {
                cellCls: [it.cellCls || '', 'mq-modelcell', fit.span ? 'mq-modelspan' : ''].join(' ').trim(),
                cellStyle: fit.span ? [it.cellStyle || '', 'grid-column:1 / -1'].filter(Boolean).join(';') : it.cellStyle,
            }) : it;
        return planItem(cell, { cols, level, render: fadeRender(it, stage, ans, { hint: !!fit.hint }), model: stage === 'model', nolabel: stage === 'model' });
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
        const at = from;
        const chunk = planItems.slice(from, from + (pg.cap || pg.rows * cols));
        from += chunk.length;
        const spanHere = pi === 0 && fit.span;
        const rows = Math.max(1, spanHere ? 1 + Math.ceil((chunk.length - 1) / cols) : Math.ceil(chunk.length / cols));
        // RUBRIC H13: each row as tall as what IT holds (the model row with its trace), the rows
        // sharing the page in proportion, never stretched past FILL_CAP x their content (the
        // ceiling can stop more rows; the spare height then stays under the grid).
        const host = use.slice(at, at + chunk.length);
        const rowItems = (r) => (spanHere ? (r === 0 ? host.slice(0, 1) : host.slice(1 + (r - 1) * cols, 1 + r * cols)) : host.slice(r * cols, (r + 1) * cols));
        const hsOf = (r) => rowItems(r).map((it) => { const mm = it.measured && it.measured[cols]; return mm && Number.isFinite(mm.hMm) ? mm.hMm + 1 : pg.h; });
        const hintRow = pi === 0 && fit.hint ? partialRowOf(cols, spanHere) : -1;
        const add = (r) => (r === 0 ? pg.extra || 0 : 0) + (r === hintRow ? fit.hint : 0);
        const w = Array.from({ length: rows }, (_, r) => Math.max(1, ...hsOf(r)) + add(r));
        const mins = Array.from({ length: rows }, (_, r) => Math.max(1, Math.min(...hsOf(r))) + add(r));
        const sumW = w.reduce((x, y) => x + y, 0);
        // A row stretches no further than its shortest problem allows (layout.js rowShape).
        // Guided rows stretch at most GUIDED_STRETCH (H13); the rest of the page stays under the band.
        const kPage = Math.max(1, Math.min(GUIDED_STRETCH, (pg.avail * Math.min(1, rows / Math.max(rows, pg.rows))) / sumW));
        const Hr = w.map((x, r) => x * Math.max(1, Math.min(kPage, (FILL_CAP * mins[r]) / x)));
        const gridH = Hr.reduce((a, b) => a + b, 0);
        const cellH = gridH / rows;
        const sections = [];
        if (pi === 0) sections.push({ kind: 'html', html: GUIDED_CSS });
        if (fit.steps.length) sections.push(stepsBand());
        // CL-14: Model and Guided cells are unlabelled (the band names them); still scored.
        const part = gridPart(chunk, { cols, rows, cellH, labels: 'none', start: letter });
        if (spanHere) part.spanFirst = true;
        if (rows > 1 && Math.max(...Hr) - Math.min(...Hr) >= 1) part.rowsTpl = Hr.map((x) => `${Math.round(x * 10) / 10}fr`).join(' ');
        // L2 (regrade 5 at S: a page of short compare rows left 40% of the page blank under the
        // grid): the ceiling stops more rows and FILL_CAP more height, so the spare height goes
        // BETWEEN the rows as whitespace, never inside the cells (grid.js rowGap, as a Test).
        if (rows > 1) {
            const g = rowGapFor(rows, gridH, pg.avail);
            if (g.gap) { part.rowGap = g.gap; part.height = `${g.heightMm}mm`; }
        }
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
