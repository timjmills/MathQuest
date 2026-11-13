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
    providerWorkedSteps, esc, stripExtraMm, factRows,
} from './compose.js';
import { getProvider } from '../index.js';
import { stepTemplateOf } from '../anchors.js';
import { FILL_CAP, groupByHeight, fillLimit, CELL_PAD_MM, tightRows, koMm } from '../layout.js';
import { scorePoints } from '../paginate.js';

/** The model first, then the tries grouped by height (H13: rows hold problems of one height). */
const isMixItem = (it) => !!(it && it.q && it.q.divMix);
const formOfItem = (it) => String((it && it.q && it.q.divForm) || '');
/** How many Model cells lead a div_facts Mix page: one per form dealt, in a row (else 1). */
const mixModels = (use) => {
    if (use.length < 4 || !use.every(isMixItem)) return 1;
    let n = 1;
    while (n < use.length && n < 3 && !use.slice(0, n).some((x) => formOfItem(x) === formOfItem(use[n]))) n++;
    return n;
};
const ordered = (items0, cols) => {
    // Round-4 re-grade: the Model is a problem the Steps work forwards - a start-unknown or
    // missing-part item ("[ ] - 1 = 15") is never the worked example when another item is not.
    // Regrade 5 (tally_chart: page 1 held the Model alone, a 184 mm chart): of those, the Model is
    // the SHORTEST (measured at this column count), so the Model and its tries share page 1.
    const hOf = (it) => { const m = it && it.measured && it.measured[cols]; return m && Number.isFinite(m.hMm) ? m.hMm : Infinity; };
    // Only a clearly shorter one (under 85% of the first's height) displaces the first: near
    // heights keep the deal's order, so the page counts() planned is the page printed.
    // Critic guided-r1: the Model exercises every printed step - a regrouping subtraction, not
    // one with no ten to cross out; a division with a remainder to ring. Of the forward items, the
    // one whose worked steps are the MOST (a regroup, a ring, a skip-count adds its own step)
    // is the Model; then the shortest, as above.
    const nSteps = (it) => { try { return providerWorkedSteps(it, 6).length; } catch (e) { return 0; } };
    const fwd = items0.map((it, i) => i).filter((i) => !(items0[i] && items0[i].q && items0[i].q.missing));
    const most = fwd.length ? Math.max(...fwd.map((i) => nSteps(items0[i]))) : 0;
    const full = fwd.filter((i) => nSteps(items0[i]) === most);
    const first = full.length ? full[0] : items0.findIndex((it) => !(it && it.q && it.q.missing));
    let k = first;
    full.forEach((i) => {
        const it = items0[i];
        if (hOf(it) < 0.85 * hOf(items0[first]) && hOf(it) < hOf(items0[k])) k = i;
    });
    let items = k > 0 ? [items0[k], ...items0.slice(0, k), ...items0.slice(k + 1)] : items0;
    // div_facts Mix (critic R1 D7): one item of EACH form first - each is modelled once (plan:
    // mixModels) before the tries, so no form reaches a try without a model.
    if (items.length > 2 && items.every(isMixItem)) {
        const lead = [];
        for (const it of items) if (!lead.some((x) => formOfItem(x) === formOfItem(it))) lead.push(it);
        items = [...lead, ...items.filter((it) => !lead.includes(it))];
    }
    return items.length > 2 ? [items[0], ...groupByHeight(items.slice(1), cols)] : items;
};

/**
 * The first tries (the partial stage, BD-7): the rest of the Model's row, or the whole first row
 * of tries under a spanning Model; only the first try when the page's tries are all one row
 * (the fade reaches "none" on the page). Returns the index after the last partial cell.
 */
export const partialEndOf = (cols, span, n = Infinity, span2 = 0) => {
    // The tries in the first try row: the rest of the Model's row, or the row under a spanning Model.
    // (a Model over span2 cells, GUIDED-MODEL-SPAN: the rest of its row is cols - span2 cells; over the whole row, the next row)
    const firstRow = span || span2 >= cols ? cols : Math.max(1, cols - (span2 || 1));
    // Critic guided-r1: when every try sits in that one row, hinting them all leaves no try
    // unhinted and the fade never reaches "none" - then only the FIRST try is hinted.
    const tries = Math.max(0, n - 1);
    return 1 + (tries <= firstRow ? 1 : firstRow);
};
/** The row the first tries sit in. */
// (a div_facts Mix page whose Models fill the first row - mixModels - has its first tries in row 2)
const partialRowOf = (cols, span, nModels = 1, span2 = 0) => (span || span2 >= cols || cols === 1 || nModels >= cols ? 1 : 0);
/**
 * A Mix page's hinted tries: the tries in the row after the last Model (the rest of that row when
 * the Models do not fill it), or the first try alone when the tries end in that row (the fade then
 * still reaches "none", partialEndOf). Returns the index after the last hinted try.
 */
const mixPartialEnd = (nM, cols, n) => {
    const end = (Math.floor(nM / cols) + 1) * cols;
    return n > end ? end : Math.min(n, nM + 1);
};
/** Extra height a Mix page's row r takes: the Model trace on a Model row, the hint on a hinted row. */
// (one cue under each fact: a row holding Models and hinted tries takes the taller of the two)
const mixRowAdd = (r, cols, nM, pEnd, extra, hint) => Math.max(r * cols < nM ? extra : 0,
    hint && r * cols < pEnd && (r + 1) * cols > nM ? hint : 0);
/** The page ceiling with the Models it leads with: a Mix page's extra Models are not scored tries. */
// (a cell that scores several tries - Match 3, footprint `points` 3, owner ruling Q-C - counts them against the ceiling:
// 10 / 8 / 6 scored tries hold 3 / 2 / 2 such cells plus the Model; lf-vocab r9, ws-empty-band EB-GDPCAP)
const pointsOf = (items) => { const its = (items || []).filter(Boolean); const p = its.length && its.every((it) => it.footprint && Number(it.footprint.points) > 1) ? Math.max(...its.map((it) => Number(it.footprint.points))) : 1; return p; };
const ceilFor = (ctx, items) => { const p = pointsOf(items); return (p > 1 ? Math.floor(CEILING[ctx.size] / p) + 1 : ceilOf(ctx)) + Math.max(0, mixModels(items || []) - 1); };
/**
 * The fact pages (lf-ops facts-roles task, RUBRIC H13): add / sub / mult facts, div_facts_long and div_facts. Their cells are
 * short, so the shared ceiling (10 / 8 / 6 tries) and the row stretch (up to FILL_CAP) left 31-58 % empty bands under every
 * fact. On a page of these skills only, rows grow to at most FACT_STRETCH x their content (measured less its pads), the Model row is as tall
 * as the taller of its trace and the tries' hint (not the two added), and the spare height stays under the grid (the
 * ceiling stays 10 / 8 / 6, lead ruling option b). Every other skill's Guided page is unchanged.
 */
/** A fact page may take one more column than AUTO_COLS where its facts fit (a narrow fact centred in a wide column, H13 across). */
const FACT_COLS = { S: 5, M: 4, L: 4 };
/**
 * Lead ruling 2026-11-12 (option b): the page keeps the §12.1 ceiling (10 / 8 / 6 tries plus the Model); a fact row grows to
 * at most FACT_STRETCH x its content (the measured height less CELL_PAD_MM), so the band under the fact stays under 30 % (H13); the rest stays under the grid.
 */
const FACT_STRETCH = 1.42;
/** A fact page's column count leaves its narrowest fact (a one-digit dividend, "8 ) 0") under this share of the column beside it. */
const FACT_SIDE = 0.29;
/**
 * The hinted row's width (lf-ops facts-roles critic r1 G1): row 1 of a + / − fact page draws a 9 mm dot tile 2 mm beside each
 * fact (withCue), so a column fits the row only where the fact's measured slack, both sides, holds the tile, its gap and
 * CUE_EDGE_MM more (the ink stays off the divider, ws-empty-band EB-EDGE's 1.5 mm). Guided S at 5 columns ran every tile onto
 * the divider and the fifth across the frame; 4 columns hold it.
 */
const CUE_W_MM = 9 + 2, CUE_EDGE_MM = 2;
const cueRowFits = (pool, c) => ordered(pool, c).slice(0, c).every((it) => {
    if (!countCueOf(it)) return true;
    const mm = it.measured && it.measured[c];
    return !(mm && Number.isFinite(mm.slackMm)) || 2 * mm.slackMm >= CUE_W_MM + CUE_EDGE_MM;
});
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
/** The page's cells: the ceiling counts the TRIES; the worked Model is not one (critic guided-r1:
 * nearest_10 at L held 4 tries and a 22% gap because the Model took a try's place). */
const ceilOf = (ctx) => CEILING[ctx.size] + 1;
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
// (S also measures 5 columns: a fact page's grid at S, FACT_COLS, judged by its measured side band - lead ruling option b,
// div_facts_long's one-digit dividends kept in a narrower column)
export const measureCols = (ctx) => (ctx && ctx.size === 'S' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]);

/** The Model plus at least three guided tries (round-3 re-grade: "a model and ONE practice item"). */
export const MIN_ITEMS = 4;
/**
 * Whether n leading items (the Model first) meet MIN_ITEMS, counted in SCORED ANSWERS (lead ruling 2026-11-12): a cell that
 * scores several answers (Match 3, footprint `points` 3) counts each of them, by the same pointsOf the EB-GDPCAP ceiling
 * uses, so the Model and ONE Match 3 try (3 answers) meets "Model + 3 tries". A single-answer cell counts 1, as before.
 */
export const minMet = (items, n) => { const p = pointsOf(items); return n >= MIN_ITEMS || (p > 1 && (n - 1) * p >= MIN_ITEMS - 1); };
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
    // ...and which number is unknown: a result-, change- and start-unknown line under one Steps
    // band that only fits the first (critic guided-r1, nl_sub).
    const q = (it && it.q) || {};
    const missing = q.missing === undefined || q.missing === null ? '' : JSON.stringify(q.missing);
    return `${(it && it.template) || ''}:${p.kind || ''}:${missing}:${(own.length ? own : generalStepsOf(it)).join('|')}`;
};

export function pageSet(items0, ctx, kind = null, input = null, fixedCols = 0, facts = factRows(input)) {
    const wanted = (facts ? FACT_COLS : AUTO_COLS)[ctx.size];
    const options = [wanted, 4, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= wanted);
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
    // A div_facts Mix pool keeps every form it deals (critic R2 D-D: the kind cut and the width
    // filter below left a Mix Guided page with no across fact, so 2 Models instead of 3).
    const mix = items0.length > 0 && items0.every(isMixItem);
    const cut = mix ? false : kind !== null ? kind !== '' : same.length >= MIN_ITEMS && same.length < items0.length;
    const items = cut ? same : items0;
    let cols = bestCols(items, options, ctx);
    let use = items;
    // A fact page (lead ruling option b): of the column counts, each with the pool that fits it (the whole pool at the
    // widest grid it fits; past it, the facts that fit, while the Model, 3 tries and half the pool remain), the one whose
    // first page holds the most tries under the ceiling, among those where no fact the page can hold leaves FACT_SIDE of
    // its column empty beside it (a one-digit dividend, "8 ) 0", stays on the page in a narrower column).
    // (plan() keeps the grid counts() chose, with the dealt facts that fit it)
    if (facts && !mix && fixedCols > 0) {
        const pool = items.filter((it) => fitsAt([it], fixedCols, ctx));
        if (pool.length >= MIN_ITEMS) return { cols: fixedCols, items: pool, kind: cut ? top : '' };
    }
    if (facts && input && !mix && !(fixedCols > 0)) {
        let bestF = null;
        for (const c of options) {
            if (c === 1 && cols > 1) continue;
            const pool = c <= cols ? items : items.filter((it) => fitsAt([it], c, ctx));
            if (pool.length < MIN_ITEMS || pool.length * 2 < items.length || !fitsAt(pool, c, ctx)) continue;
            const side = Math.max(0, ...ordered(pool, c).slice(0, ceilFor(ctx, pool)).map((it) => { const mm = it.measured && it.measured[c]; return mm && Number.isFinite(mm.slackMm) ? mm.slackMm / (186 / c) : 0; }));
            const f = sheetFit(ordered(pool, c), c, ctx, input, pool.length < items0.length ? pool.length : Infinity);
            const n = Math.min(f.pages[0].cap, f.total);
            const cand = { c, pool, n, ok: side < FACT_SIDE && cueRowFits(pool, c), side };
            if (!bestF || (cand.ok && !bestF.ok) || (cand.ok === bestF.ok && (cand.ok ? n > bestF.n : side < bestF.side))) bestF = cand;
        }
        if (bestF) return { cols: bestF.c, items: bestF.pool, kind: cut ? top : '' };
    }
    for (const c of mix ? [] : options) {
        if (c <= cols) break;
        const keep = items.filter((it) => fitsAt([it], c, ctx));
        if (keep.length >= MIN_ITEMS && keep.length * 2 >= items.length) { cols = c; use = keep; break; }
    }
    // The plan keeps the column count counts() chose (its deal is a prefix of the probe).
    // (r8b: or the one column more a measured stack page takes for EB-SIDE, below)
    if (fixedCols > 0 && (fixedCols <= cols || (fixedCols === wanted + 1 && !facts && !mix)) && fitsAt(use, fixedCols, ctx)) return { cols: fixedCols, items: use, kind: cut ? top : '' };
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
        let fitting = options.filter((x) => x <= cols && (x > 1 || cols === 1) && fitsAt(use, x, ctx));
        let calm = fitting.filter((c) => side(c) < 0.28);
        // (r8b, EB-SIDE on the measured page: a column stack whose MEASURED slack (side() reads its static footprint width, pads included, and passed it)
        // beside it is 30 % of the cell or more at every grid the size offers (sub_50 S 4 columns 32.4 %, M 3 columns 31.7 %)
        // takes one column more than AUTO_COLS where the bridge measured it and it fits there; a grid that passes is kept as is)
        const mSide = (c) => Math.max(0, ...use.slice(0, ceilFor(ctx, use)).map((it) => { const mm = it.measured && it.measured[c]; return mm && Number.isFinite(mm.slackMm) ? mm.slackMm / (186 / c - 0.5) : 0; }));
        if (!facts && !mix && use.every((it) => it.template === 'stack') && fitting.length && fitting.every((c) => mSide(c) >= 0.30)) {
            const more = wanted + 1;
            if (use.every((it) => it.measured && it.measured[more]) && fitsAt(use, more, ctx) && mSide(more) < 0.30) { fitting = [more]; calm = [more]; }
        }
        // A fact page (factRows): the measured slack beside each fact (its nearest side) at each column count; the grid whose
        // narrowest fact (a 0 or one-digit dividend) leaves the least side band, under 30 % of the cell where one does.
        if (facts) {
            // (judged on the cells the page can hold, the ceiling's worth in page order: a narrow fact the page never deals does not
            // cost it a column)
            const fSide = (c) => Math.max(0, ...ordered(use, c).slice(0, ceilFor(ctx, use)).map((it) => { const mm = it.measured && it.measured[c]; return mm && Number.isFinite(mm.slackMm) ? mm.slackMm / (186 / c) : 0; }));
            // (judged at FACT_SIDE, under the 30 % limit: the measure reads the nearer side, the page draws the fact centred)
            const ok = fitting.filter((c) => fSide(c) < FACT_SIDE);
            calm = ok.length ? ok : fitting.slice().sort((x, y) => fSide(x) - fSide(y)).slice(0, 1);
        }
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
function fitRows(items, cols, ctx, input, { noSpan = false, noHint = false, noLines = false, span2 = 0 } = {}) {
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const steps = stepsOf(items);
    const stepsH = steps.length ? m.strip + stepsBodyMm(steps, m) + 4 : 0;
    // A "Guided Practice:" strip whose instruction wraps takes its second line off the page.
    const wrap = stripExtraMm(ctx, 'Guided Practice:', instructionText(instructionKeyOf(items, input.skills), items));
    const avail = m.budget - stepsH - m.strip - wrap;
    // The think line under a division fact (row 1), the Model tab clearance and the model's work
    // lines are drawn by the role, so their height is added here (the rows share one height).
    const model = items[0];
    const h0 = hMinAt(items, cols, ctx);
    // RUBRIC H13: a model carrying worked lines on a page of 2+ columns takes the whole first row,
    // its lines BESIDE the drawing - under it, the lines made row 1 far taller than the tries
    // sharing that row (a 40% empty band in each). The row holds the model only.
    // (GUIDED-MODEL-SPAN, lead ruling (e): a two-cell Model writes its working BESIDE the drawing, sideLinesOf)
    const lines = model && items.length > 1 && !thinkCueOf(model) && !noLines ? (span2 ? sideLinesOf(model) : workLinesOf(model)) : [];
    const span = !span2 && !noSpan && cols > 1 && lines.length > 1;
    const extra = !model || items.length < 2 ? 0
        : thinkCueOf(model) ? 17
        : span2 ? (OWN_TOP_BAND.has(model.template) ? 0 : TAB_CLEAR_MM) + Math.max(0, sideLinesMm(lines, cols, m, span2) - h0)
        : span ? TAB_CLEAR_MM + Math.max(0, workLinesMm(lines, 2, m) - h0)
        : (OWN_TOP_BAND.has(model.template) ? 0 : TAB_CLEAR_MM) + workLinesMm(lines, cols, m);
    // BD-7: the first tries carry a grey hint line (hintOf); their row is that much taller.
    // Its height is the longest hint's wrapped lines at this column width (a clock's two-sentence
    // hint wraps to two lines in a third of the page), plus the line's top margin.
    // Every cell of that row carries one, or none does: a row where one try has no hint of its
    // own would leave that cell a hint-line's height of empty band (H13).
    const nM = mixModels(items);
    const nTot = Math.min(items.length, ceilFor(ctx, items));
    const partial = items.slice(nM, nM > 1 ? mixPartialEnd(nM, cols, nTot) : partialEndOf(cols, span, nTot, span2));
    const hints = noHint ? [] : partial.map((x) => hintOf(x));
    let hint = hints.some(Boolean) ? Math.max(HINT_MM, ...hints.filter(Boolean).map((t) => workLinesMm([t], cols, m) - 4 + 2)) : 0;
    // A Mix page's first tries carry the times-fact cue under the fact, as the Models do (the
    // Model row's 17 mm, `extra`): their row is that much taller (critic R2 D-D: the cue ran into
    // the try under it).
    if (nM > 1 && !noHint && partial.some((x) => thinkCueOf(x))) hint = Math.max(hint, 17);
    const h = h0 + extra;
    const rows = Math.max(1, Math.min(Math.floor(ceilFor(ctx, items) / cols), Math.floor(avail / Math.max(1, h))));
    return { rows, h, h0, avail, stepsH, steps, frame, m, span, span2: span2 || 0, hint, wrap, noLines: !!noLines };
}

/**
 * The pages of the sheet. Page 1 holds what fits under its Steps band; when that is fewer than
 * the Model and three tries (a tall clock, coin set or story holds two a page), the section
 * continues on page 2 (and 3) under the continuation header, the Steps band repeated so the steps
 * stay in view (PT-GDP-2, PG-22). A continuation page is filled, never above the ceiling.
 */
function sheetFit(items, cols, ctx, input, limit = Infinity) {
    const a = sheetFitPlain(items, cols, ctx, input, limit);
    // GUIDED-MODEL-SPAN (lead ruling (e), 2026-11-13; ws-capacity-pin SIZE-ORDER): the ceiling trims a grid whose Model takes one
    // cell to whole rows (S, 4 columns: Model + 10 tries is 11 cells, so the last part-row went and S printed 8 < M 9). Where
    // the Model over TWO cells of row 1 completes the last row and keeps the ceiling, the Model spans two cells - its drawing at
    // its own size, centred, its working written beside it (sideLinesOf) - and the page holds every try the ceiling allows.
    // Any template, any size; never a Mix page (a Model per form), a full-row Model, a page of several sheets, or a fact page
    // (factRows: its grid, cue row and row stretch are the lead's ruled option b, and its Model's provider steps - "Make 10" -
    // are not the count-on Steps the page prints).
    if (a.span || a.span2 || cols < 3 || items.length < 3 || mixModels(items) > 1 || a.pages.length !== 1 || factRows(input)) return a;
    const ceil = Math.min(ceilFor(ctx, items), limit);
    if (a.total >= ceil || sideLinesOf(items[0]).length < 2) return a;
    // (r8b: the Model spans the FEWEST cells, two or more, that complete the grid at the ceiling - the whole first row when only
    // that does: S 5 columns, Model + 10; M 4 columns, Model + 8. The rows under it hold whole rows of tries.)
    const n = [...Array(cols - 1).keys()].map((k) => k + 2).find((k) => (ceil + k - 1) % cols === 0);
    if (!n) return a;
    // (the first tries keep their hint, BD-7: a spanning Model never costs them it)
    const b = sheetFitWith(items, cols, ctx, input, true, false, limit, false, n);
    return b.pages.length === 1 && b.total === ceil && b.pages[0].cap === ceil ? b : a;
}

function sheetFitPlain(items, cols, ctx, input, limit = Infinity) {
    let a = sheetFitWith(items, cols, ctx, input, false, false, limit);
    // Critic guided-r1 (mixed_time at L): a spanning Model too tall to leave a row of tries under
    // it stood alone on page 1 (H5). The Model then takes a cell of its own, its lines under it,
    // with a hinted try beside it - the try keeps its hint (BD-7) rather than losing it.
    if (a.span && a.pages[0].cap < 2 && items.length > 1) {
        const b = sheetFitWith(items, cols, ctx, input, true, false, limit);
        if (b.pages[0].cap >= 2) a = b;
    }
    // The first tries' grey hint line never costs page 1 its only try (round-4: a page holding
    // the Model alone): tall problems drop the hint rather than the try.
    if (a.hint && a.pages[0].cap < 2) {
        const c = sheetFitWith(items, cols, ctx, input, !a.span, true, limit);
        if (c.pages[0].cap > a.pages[0].cap) a = c;
    }
    // Round-4 re-grade: a spanning Model that pushed the tries onto a second page (Model + 2 on
    // page 1, a quarter-empty page 2) gives way to the Model in a cell of its own when that keeps
    // the Model and three tries on page 1.
    if (a.span && !minMet(items, a.pages[0].cap)) {
        const b = sheetFitWith(items, cols, ctx, input, true, !a.hint, limit);
        if (minMet(items, b.pages[0].cap) || b.pages.length < a.pages.length) return b;
    }
    // Critic pv-r2 (a rounding table of 6 places at L): the Model still alone on page 1. Its
    // work lines give way (the traced cells of a table, a chart, a clock's boxes ARE its
    // working), so a try shares page 1 - hinted when that still fits, else plain.
    if (a.pages[0].cap < 2 && items.length > 1 && workLinesOf(items[0]).length) {
        for (const noHint of [false, true]) {
            const d = sheetFitWith(items, cols, ctx, input, true, noHint, limit, true);
            if (d.pages[0].cap >= 2) return d;
        }
    }
    return a;
}

function sheetFitWith(items, cols, ctx, input, noSpan, noHint = false, limit = Infinity, noLines = false, span2 = 0) {
    const first = fitRows(items, cols, ctx, input, { noSpan, noHint, noLines, span2 });
    // (the cells row 1 gives up to the Model: all but one under a full-row Model, one beside a two-cell Model)
    const lead = first.span ? cols - 1 : first.span2 ? first.span2 - 1 : 0;
    const extra = first.h - first.h0;
    const mc = bandMetrics(ctx, layoutHeader(first.frame.contHeader), { cont: true });
    const availC = mc.budget - first.stepsH - mc.strip - first.wrap;
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
    const ceil = ceilFor(ctx, items);
    const facts = factRows(input);
    const nM = mixModels(items);
    while (pages.length < MAX_PAGES && total < ceil && (pages.length === 0 || !minMet(items, total))) {
        const isFirst = pages.length === 0;
        const avail = isFirst ? first.avail : availC;
        const maxR = Math.max(1, Math.ceil((ceil - total) / cols));
        // Each row is as tall as what IT holds (H13), so the rows that fit are counted by the sum
        // of their own heights, page 1's first row taller by the model's trace.
        const rowsH = (k) => {
            let idx = total, sum = 0;
            for (let rr = 0; rr < k; rr++) {
                const n = isFirst && rr === 0 ? cols - lead : cols;
                sum += hOf(idx, n) + (isFirst && nM > 1
                    ? mixRowAdd(rr, cols, nM, mixPartialEnd(nM, cols, ceil), extra, first.hint) - (rr === 0 ? extra : 0)
                    : (isFirst && rr === partialRowOf(cols, first.span, nM, isFirst ? first.span2 : 0) ? (facts && rr === 0 ? Math.max(0, first.hint - extra) : first.hint) : 0));
                idx += n;
            }
            return sum;
        };
        let r = 1;
        for (let k = maxR; k >= 1; k--) {
            if (rowsH(k) + (isFirst ? extra : 0) <= avail) { r = k; break; }
        }
        const cap = r * cols - (isFirst ? lead : 0);
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
    const most = () => Math.min(ceil + (pages.length > 1 ? slack : 0), limit);
    let over = total - most();
    while (over > 0 && pages.length) {
        const pg = pages[pages.length - 1];
        const keepRows = Math.floor((pg.cap - over) / cols);
        const spanCut = pages.length === 1 ? lead : 0;
        if (keepRows >= 1 || pages.length === 1) {
            // (a two-cell Model's row holds cols - 1 items: its rows are counted with the Model's extra cell)
            const r = Math.max(1, first.span2 && spanCut ? Math.floor((pg.cap - over + lead) / cols) : keepRows + (spanCut ? 1 : 0));
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
    // (a cell scoring several tries - Match 3 - in one column: a continuation page holding ONE cell alone gives it up, as the
    // ceiling counted in tries leaves it nothing to share its page with; lf-vocab r9, L-LONE / PG-23)
    if (pointsOf(items) > 1 && cols === 1 && pages.length > 1 && pages[pages.length - 1].cap === 1) { total -= 1; pages.pop(); }
    return Object.assign(first, { pages, rows: pages[0].rows, total: Math.min(most(), total) });
}

/* ================================================================== the worked trace */

/** The most a guided row stretches over its tallest problem (the H13 cap, as every role). */
const GUIDED_STRETCH = FILL_CAP;
/**
 * The most a guided row grows over its shortest problem: layout.fillLimit, the ONE spare-height
 * rule every grid role shares (reckoned on the content: a measured height carries ~7 mm of pads,
 * so FILL_CAP x the measurement left a 20 mm problem in a 50 mm cell, critic guided-r1). The rest
 * of the page stays under the grid.
 */
const rowLimit = (m) => fillLimit(m);

/** An item's planned row height at `cols` (its measure + 1 mm, as the plan draws it). */
const rowMmOf = (it, cols) => { const mm = it && it.measured && it.measured[cols]; return mm && Number.isFinite(mm.hMm) ? mm.hMm + 1 : 0; };
/** The share of the Model's row the tries beside it fill at least (GUIDED-MODEL-ROW: under it, the band beside the try reaches 30 %). */
const MODEL_ROW_FILL = 0.8;

/** The least a grey hint under a first try (BD-7) adds to its row, in mm. */
const HINT_MM = 8;

/**
 * Every value the problem's answer holds, as numbers-in-words tokens: its printed answer, its
 * parts (keyParts, an array or object answer, the key's slot values), each split into the numbers
 * it carries ("1:00" -> 1, 00, 0; "390, 400" -> 390, 400). A hint must hold none of them.
 */
export function answerTokens(it) {
    const q = (it && it.q) || {};
    const k = (it && it.key) || {};
    const vals = [];
    const push = (v) => {
        if (v === null || v === undefined) return;
        if (Array.isArray(v)) { v.forEach(push); return; }
        if (typeof v === 'object') { ['display', 'value', 'answer'].forEach((f) => push(v[f])); return; }
        vals.push(String(v));
    };
    push(answerOf(it));
    push(q.ans);
    push(q.keyParts);
    push(q.answer);
    push(k.value);
    push(k.display);
    if (k.slots && typeof k.slots === 'object') Object.values(k.slots).forEach((sl) => push(sl && typeof sl === 'object' ? sl.value : sl));
    const out = new Set();
    for (const v of vals) {
        const t = v.replace(/,(?=\d{3}\b)/g, '').trim();
        if (!t) continue;
        for (const n of t.match(/\d+(?:\.\d+)?/g) || []) { out.add(n); out.add(String(Number(n))); }
        if (!/\d/.test(t) && t.length > 1) out.add(t.toLowerCase());
    }
    return [...out];
}

/** Does this hint text hold the problem's answer (any of answerTokens)? */
export function hintGivesAnswer(text, it) {
    const t = String(text || '').replace(/,(?=\d{3}\b)/g, '');
    const nums = new Set((t.match(/\d+(?:\.\d+)?/g) || []).flatMap((n) => [n, String(Number(n))]));
    const words = t.toLowerCase().replace(/[.,:;!?]/g, ' ').split(/\s+/);
    const given = givenNumbers(it);
    return answerTokens(it).some((a) => (/\d/.test(a) ? nums.has(a) && !given.has(a) : words.includes(a)));
}

/** The numbers the problem itself prints: naming one gives nothing away ("Circle groups of 4." on 16 ÷ 4 = 4). */
function givenNumbers(it) {
    const q = (it && it.q) || {};
    let ops = [];
    try { ops = operandsOf(q) || []; } catch (e) { ops = []; }
    return new Set([...(String(q.text || '').replace(/,(?=\d{3}\b)/g, '').match(/\d+(?:\.\d+)?/g) || []), ...ops.map(String)]
        .flatMap((n) => [n, String(Number(n))]));
}

/**
 * BD-7 / SF-10, the first tries' grey scaffold for templates with no partial trace of their own:
 * the first step of THIS problem's worked steps that holds none of its answer, in trace grey under
 * the problem - one that carries its numbers or names what it shows first ("Circle the numbers: 3
 * and 5.", "Find the Birds bar."), else its first plain step ("Draw a line from each one in A to
 * one in B."). Never a step holding the answer (critic guided-r1: "387 to the nearest 100 is 400",
 * "The hour is 1" on a 1:00 clock). A stack traces its first column instead; a fact its dot cue.
 */
export function hintOf(it) {
    if (!it || it.template === 'stack' || countCueOf(it) || thinkCueOf(it)) return '';
    const q = it.q || {};
    const src = `${q.text || ''} ${JSON.stringify((q.cell && q.cell.payload) || {})}`;
    const own = (t) => /\d/.test(t) || (t.match(/\b[A-Z][a-z]{2,}\b/g) || []).slice(1).some((w) => src.includes(w));
    const all = providerWorkedSteps(it, 6).map((st) => String(st.text || '').trim())
        .filter((t) => t && !/^(Write|Check|Say)\b/i.test(t) && t.length <= 70);
    const steps = all.filter((t) => !hintGivesAnswer(t, it));
    if (steps.length) return steps.find(own) || steps[0];
    // Every step names part of the answer (a clock's first step gives its hour): the first step
    // becomes a frame, its answer numbers left as gaps ("The short hand has passed ___."), so the
    // first try still has its grey scaffold (critic guided-r1: no hints at L) without the answer.
    if (!all.length) return '';
    const given = givenNumbers(it);
    const toks = new Set(answerTokens(it).filter((a) => /\d/.test(a) && !given.has(a)));
    const masked = all[0].replace(/,(?=\d{3}\b)/g, '')
        .replace(/\d+(?:\.\d+)?/g, (n) => (toks.has(n) || toks.has(String(Number(n))) ? '___' : n));
    // One sentence of it: the first with a gap ("The short hand has passed ___.").
    const frame = masked.split(/(?<=[.!?])\s+/).find((s) => s.includes('___')) || '';
    return frame && !hintGivesAnswer(frame, it) ? frame : '';
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
    if (!it || DRAWN_MARKS[it.template] || WHOLE_WORK.has(it.template)) return [];
    const steps = providerWorkedSteps(it, 6).map((s) => s.text).filter((t) => /\d/.test(t) && t.length <= 90);
    // A fact traces only its answer, so the skip count its Steps teach ("Count by 3, 7 times:
    // 3, 6, ... 21.") is written under the Model (critic guided-r1, mult_facts: a grey 21 alone
    // over tries hinted "10 × 9 is 10 groups of 9."). Other step templates trace their working.
    if (stepTemplateOf(it)) return it.template === 'fact' ? steps.filter((t) => /^Count by\b/i.test(t)).slice(0, 1) : [];
    const work = steps.filter((t) => !/^Write\b/i.test(t));
    return (work.length ? work : steps).slice(0, 3);
}

/**
 * The working a two-cell Model writes BESIDE its drawing (GUIDED-MODEL-SPAN, lead ruling (e)): its own work lines when the
 * template has them; else, for a template that traces its working in the drawing (a column stack, a family, a bond), the
 * provider's worked steps for THIS problem that carry its numbers, the "Write 5." each repeats left off (the traced digit says
 * it) and "The answer is 25." (the traced answer): "Ones: 8 − 3 = 5." "Tens: 4 − 2 = 2." "Check: 25 + 23 = 48.". At most 3.
 * A template that marks its Model in the drawing (DRAWN_MARKS) has none.
 */
export function sideLinesOf(it) {
    if (!it || DRAWN_MARKS[it.template]) return [];
    const own = workLinesOf(it);
    if (own.length) return own;
    // (a step whose numbers are all in its "Write 8." keeps it: "Tens: nothing to take away. Write 8.")
    const cut = (t) => { const c = t.replace(/\s*\bWrite\b[^.]*\.\s*$/, '').trim(); return /\d/.test(c) ? c : t; };
    return providerWorkedSteps(it, 6).map((st) => cut(String(st.text || '').trim()))
        .filter((t) => /\d/.test(t) && t.length <= 60 && !/^(The answer is|Write)\b/i.test(t)).slice(0, 3);
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

/** The height of a two-cell Model's side lines: the column beside the drawing is at most SIDE_SHARE of the two cells. */
const SIDE_SHARE = 0.6;
/** A Model over the whole first row: the drawing and its working each centred in one half of the row (EB-SIDE, r8b). */
const ROW_SHARE = 0.45;
function sideLinesMm(lines, cols, m, n = 2) {
    if (!lines.length) return 0;
    const colW = (n >= cols ? ROW_SHARE : SIDE_SHARE) * (n * 186 / Math.max(1, cols) - 8);
    const charMm = 0.5 * m.textPt * (25.4 / 72);
    const lineMm = m.textPt * 1.25 * (25.4 / 72);
    return lines.reduce((a, t) => a + Math.max(1, Math.ceil((t.length * charMm) / colW)), 0) * lineMm;
}

const workHtml = (lines) => (lines.length
    ? `<ul class="mq-worklines ws-trace" data-ws-ink="trace">${lines.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');

const GUIDED_CSS = `<style data-mq-guided>
:is(.ws-page,.ws-sheet) .mq-worklines{list-style:none;margin:2mm 0 0;padding:0;width:100%;font-size:var(--ws-text);line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-worklines li{margin:0}
:is(.ws-page,.ws-sheet) .mq-hintline{margin-top:1.5mm;font-size:var(--ws-text);line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-hintgap{display:inline-block;width:2.4em;height:0.9em;border-bottom:1pt solid #949494;vertical-align:baseline}
:is(.ws-page,.ws-sheet) .mq-workwrap{width:100%;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-workwrap{flex-direction:row;justify-content:center;align-items:center;column-gap:8mm}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-workwrap>:first-child{flex:0 1 auto;max-width:55%}
:is(.ws-page,.ws-sheet) .mq-modelspan .mq-worklines{width:auto;max-width:45%;margin:0;text-align:left}
:is(.ws-page,.ws-sheet) .mq-ring{display:inline-block;border:1pt solid #949494;border-radius:999px;padding:0 .2em;line-height:1.1}
:is(.ws-page,.ws-sheet) .mq-uline{text-decoration:underline;text-decoration-color:#949494;text-decoration-thickness:1pt;text-underline-offset:.15em}
:is(.ws-page,.ws-sheet) .mq-workeq{position:absolute;left:0;right:0;top:45%;text-align:center;font-size:var(--ws-text);font-weight:700;line-height:1.2}
</style>`;
/** A two-cell Model (GUIDED-MODEL-SPAN): its drawing at its own width, its working beside it - printed only on such a page. */
const SPAN2_CSS = `<style data-mq-guided-span2>
:is(.ws-page,.ws-sheet) .mq-modelspan2 .mq-workwrap{flex-direction:row;justify-content:center;align-items:center;column-gap:8mm}
:is(.ws-page,.ws-sheet) .mq-modelspan2 .mq-spandraw{flex:none;display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-modelspan2 .mq-worklines{width:auto;max-width:${SIDE_SHARE * 100}%;margin:0;text-align:left}
</style>`;
/** A Model over the whole first row (r8b): the drawing in the middle of the left half, its working in the middle of the right. */
const SPANROW_CSS = `<style data-mq-guided-spanrow>
:is(.ws-page,.ws-sheet) .mq-modelspanrow .mq-workwrap{justify-content:space-evenly;column-gap:0}
:is(.ws-page,.ws-sheet) .mq-modelspanrow .mq-worklines{max-width:${ROW_SHARE * 100}%}
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
    // every written form of a division fact (fact, equation: across / fraction, division: the
    // bracket) keeps the related times fact as its hint (critic R1 D12)
    if (!['fact', 'equation', 'division'].includes(it.template) || opOf(q) !== 'divide') return '';
    if (it.template !== 'fact' && !/div_facts/.test(String(q.skillId || ''))) return '';
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
function fadeRender(it, stage, ans, { hint = true, lines = true, side = false } = {}) {
    // (`side`: a two-cell Model, its working beside the drawing - sideLinesOf, GUIDED-MODEL-SPAN)
    const work = stage === 'model' && lines ? workHtml(side ? sideLinesOf(it) : workLinesOf(it)) : '';
    const cue = (html0) => {
        const html = stage === 'model' ? modelMarks(html0, it) : html0;
        if (work && side) return `<div class="mq-workwrap"><div class="mq-spandraw">${withCue(html, it, stage)}</div>${work}</div>`;
        return work ? `<div class="mq-workwrap">${withCue(html, it, stage)}${work}</div>` : withCue(html, it, stage);
    };
    // The partial stage's grey hint line prints on the pupil page AND its facsimile key (AK-1):
    // the row that carries it was sized for it on both.
    const hintLine = stage === 'partial' && hint && it.template !== 'stack' ? hintOf(it) : '';
    // A framed hint's gap ("The short hand has passed ___.") is a short grey rule, never
    // underscore characters (SL-6).
    const hintHtml = esc(hintLine).replace(/_{3}/g, '<span class="mq-hintgap" aria-label="gap"></span>');
    const withHint = (html) => `<div class="mq-workwrap">${html}<div class="mq-hintline ws-trace" data-ws-ink="trace">${hintHtml}</div></div>`;
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
            // The first step's working stays whole (the ten carried, or the cross-out and the new
            // numbers of the first regroup, VA-23); only the answer digits are cut to the first.
            const KEEP = /<span class="ws-trace mq-rgink" data-ws-ink="trace">/g;
            try {
                const full = it.render(c, Object.assign({}, o, { shown: ans, ink: 'trace', payload: Object.assign({}, (o && o.payload) || {}, { workUpTo: 1 }) }));
                const cut = partialTrace(full.replace(KEEP, '<span class="mq-rgkeep">'));
                part = cut && cut.replace(/<span class="mq-rgkeep">/g, '<span class="ws-trace mq-rgink" data-ws-ink="trace">');
            } catch (e) { part = null; }
            if (part) return traceCarries(part, it, 1);
        }
        if (hintLine) return withHint(cue(it.render(c, o)));
        return cue(it.render(c, o));
    };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const facts = factRows(input);
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const set = pageSet(poolItems(input, 'main'), ctx, typeof input.guidedKind === 'string' ? input.guidedKind : null,
        Number(input.guidedCols) > 0 ? null : input, Number(input.guidedCols) || 0, factRows(input));
    const { items } = set;
    let { cols } = set;
    // div_facts Mix (critic R2 D-D): one Model per written form, all in the first row - the row
    // sized for a Model's trace and hint. Three forms in two columns put the third Model in a
    // row sized for tries, where it ran into the try under it. The page takes as many columns
    // as it deals forms, where every item fits them.
    if (items.length >= 4 && items.every(isMixItem)) {
        const nForms = new Set(items.map(formOfItem)).size;
        if (nForms > cols && fitsAt(items, nForms, ctx)) cols = nForms;
    }
    const fit = sheetFit(ordered(items, cols), cols, ctx, input, items.length);
    const use = ordered(items, cols).slice(0, Math.min(items.length, fit.total));
    const key = instructionKeyOf(use, input.skills);
    // Critic round 2 (C4): the Guided page is labelled and scored like every other role. The
    // worked example carries the "Model" tab and is not scored; the rest run a. b. c. ...
    const worked = use.length > 1 && !!answerOf(use[0]);
    const nModels = worked ? mixModels(use) : 0;
    // (owner ruling Q-C, 2026-11-07: a template that scores per word - Match 3, `footprint.points` 3 - scores so here too;
    // every other template 1 a cell, as before: paginate.js scorePoints; lf-vocab r5, critic r3 #2)
    const scored = scorePoints(use.slice(nModels));
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: scored });
    // The partial stage is the rest of the Model's row (or the first row of tries), partialEndOf.
    // (a Mix page led by a Model per form: its first tries are the whole next row - every cell of
    // a hinted row carries a hint, H13 - or the first try alone when the tries fill only that row)
    const partialEnd = nModels > 1 ? mixPartialEnd(nModels, cols, use.length) : partialEndOf(cols, fit.span, use.length, fit.span2);
    const tightAll = tightRows(use);
    // (r8b, EB-BAND at L: a page of column stacks holds each stack in the middle of its row - the row stretch (rowLimit) left a
    // 34.8 % band under each top-aligned stack at L; centred, the spare height is split above and below)
    const stackPage = !facts && use.length > 1 && use.every((it) => it.template === 'stack');
    const planItems = use.map((it, i) => {
        const ans = answerOf(it);
        const stage = i < nModels ? 'model' : i < Math.max(partialEnd, nModels + 1) && ans ? 'partial' : 'blank';
        // A column stack keeps its digit grid - the place-value header and the answer boxes - on
        // every guided try (structural, PEDAGOGY 4.2); at level 1 the template drops them, the
        // later rows came out 38 mm shorter than the row sized for them (H13, add_50_mixed).
        // Critic guided-r1: at level 2 a blank stack greys its boxes, so the grid was black on the
        // Model and row 1 and grey below it - one structure in two weights on one page. A stack
        // takes level 3 on every try (the same grid, black; its hint is the partial trace).
        // A bracket keeps its quotient boxes on every Guided try (VA-61: the digit grid belongs to
        // Model and Guided; at level 1 the division template writes on the open vinculum).
        // A story in the sentence layout keeps its part-whole bar on every guided try (level 2; WDS 18.1, critic r1 F13 -
        // the bar is the teaching pages' drawing, faded on the practice pages), so every row holds what it was sized for.
        const sentence = it.template === 'word-work' && it.q && it.q.cell && it.q.cell.payload && it.q.cell.payload.layout === 'sentence';
        const level = stage === 'model' || it.template === 'stack' ? 3 : stage === 'partial' || it.template === 'division' || sentence ? 2 : 1;
        // Round-3 re-grade: the Model tab overprinted the first line of a story, a sentence or a
        // tile row. Every model cell but a column stack (whose grid already starts below the tab)
        // steps its content down clear of the tab.
        const spanIt = fit.span && i === 0;
        // (GUIDED-MODEL-SPAN: the Model over two cells of row 1, lead ruling (e))
        const span2It = fit.span2 && i === 0;
        const cell = span2It
            ? Object.assign({}, it, {
                cellCls: [it.cellCls || '', OWN_TOP_BAND.has(it.template) ? '' : 'mq-modelcell', 'mq-modelspan2', fit.span2 >= cols ? 'mq-modelspanrow' : ''].filter(Boolean).join(' '),
                cellStyle: [it.cellStyle || '', `grid-column:span ${fit.span2}`].filter(Boolean).join(';'),
            })
            : stage === 'model' && !OWN_TOP_BAND.has(it.template)
            ? Object.assign({}, it, {
                cellCls: [it.cellCls || '', 'mq-modelcell', spanIt ? 'mq-modelspan' : ''].join(' ').trim(),
                cellStyle: spanIt ? [it.cellStyle || '', 'grid-column:1 / -1'].filter(Boolean).join(';') : it.cellStyle,
            })
            // A fact page (factRows): the tries beside the Model start where the Model's fact starts, under the tab's keep-out,
            // so the facts of the Model's row line up and each try's hint ends near the Model's (H13 under the try).
            : facts && stage === 'partial' && !fit.span && i < cols
                ? Object.assign({}, it, { cellStyle: [it.cellStyle || '', 'padding-top:calc(var(--ws-tab,6mm) + 1.5mm)'].filter(Boolean).join(';') })
                : it;
        // (guided-tight-rows, lf-roles r8a: a `tightRows` try's row is its MEASURED height, which carries the label spacer and
        // stamp reserve of the measuring cell (1.7-2.9 mm a row) - drawn top-aligned with no label, that reserve fell under the
        // ink, a 31-37 % band (EB-BAND on expand / unit_form / combine Guided). The try sits in the middle of its row, so the
        // reserve is split above and below it; the Model keeps its own top band and tab.)
        // (GUIDED-MODEL-SPAN: on a page whose Model spans two cells every cell, the Model too, holds its problem in the middle of
        // its row - the row stretch (rowLimit) left a 35 % band under each top-aligned stack, the Model's included)
        const mid = (tightAll && stage !== 'model') || fit.span2 || stackPage
            ? Object.assign({}, cell, { cellStyle: [cell.cellStyle || '', 'justify-content:center'].filter(Boolean).join(';') }) : cell;
        return planItem(mid, { cols, level, render: fadeRender(it, stage, ans, { hint: !!fit.hint, lines: !fit.noLines, side: span2It }), model: stage === 'model', nolabel: stage === 'model' });
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
        const span2Here = pi === 0 && fit.span2;
        const lead2 = span2Here ? fit.span2 - 1 : 0;
        const rows = Math.max(1, spanHere ? 1 + Math.ceil((chunk.length - 1) / cols) : Math.ceil((chunk.length + lead2) / cols));
        // RUBRIC H13: each row as tall as what IT holds (the model row with its trace), the rows
        // sharing the page in proportion, never stretched past FILL_CAP x their content (the
        // ceiling can stop more rows; the spare height then stays under the grid).
        const host = use.slice(at, at + chunk.length);
        const rowItems = (r) => (spanHere ? (r === 0 ? host.slice(0, 1) : host.slice(1 + (r - 1) * cols, 1 + r * cols))
            : span2Here ? (r === 0 ? host.slice(0, cols - lead2) : host.slice(cols - lead2 + (r - 1) * cols, cols - lead2 + r * cols))
            : host.slice(r * cols, (r + 1) * cols));
        const hsOf = (r) => rowItems(r).map((it) => { const mm = it.measured && it.measured[cols]; return mm && Number.isFinite(mm.hMm) ? mm.hMm + 1 : pg.h; });
        const hintRow = pi === 0 && fit.hint ? partialRowOf(cols, spanHere, nModels, span2Here ? fit.span2 : 0) : -1;
        const add = (r) => (pi === 0 && nModels > 1 ? mixRowAdd(r, cols, nModels, partialEnd, pg.extra || 0, fit.hint)
            : (r === 0 ? pg.extra || 0 : 0) + (r === hintRow ? (facts && r === 0 ? Math.max(0, fit.hint - (pg.extra || 0)) : fit.hint) : 0));
        // (guided-tight-rows, lf-roles r8a: a `tightRows` page's plain try rows - no Model, no hint - drop the label keep-out
        // the measure reserved (layout.koMm: a Guided try has no letter), so the row is its ink and pads, centred below)
        const ko = tightAll ? koMm(ctx.size) : 0;
        const w = Array.from({ length: rows }, (_, r) => Math.max(1, ...hsOf(r)) + add(r) - (ko && !(pi === 0 && (r === 0 || r === hintRow)) ? ko : 0));
        const mins = Array.from({ length: rows }, (_, r) => Math.max(1, Math.min(...hsOf(r))) + add(r));
        const sumW = w.reduce((x, y) => x + y, 0);
        // A row stretches no further than its shortest problem allows (layout.js rowShape).
        // Guided rows stretch at most GUIDED_STRETCH (H13); the rest of the page stays under the band.
        const kPage = Math.max(1, Math.min(GUIDED_STRETCH, (pg.avail * Math.min(1, rows / Math.max(rows, pg.rows))) / sumW));
        // A fact row (lead ruling option b): at most FACT_STRETCH x its content (the shortest cell less its pads), so the band
        // under the fact stays under 30 %; the spare height stays under the grid.
        const room = pg.avail * Math.min(1, rows / Math.max(rows, pg.rows));
        // (the Model's row and the hinted row keep their measured height: the tries beside the Model's trace are shorter than it)
        const tF = w.map((x, r) => (pi === 0 && (r === 0 || r === hintRow) ? x : Math.max(x, FACT_STRETCH * Math.max(1, mins[r] - CELL_PAD_MM))));
        const sumT = tF.reduce((x, y) => x + y, 0);
        const lam = sumT > sumW ? Math.max(0, Math.min(1, (room - sumW) / (sumT - sumW))) : 0;
        // (`tightRows` - layout.tightRows, lf-placevalue pv debt via the lead: in-place rows held to their ink keep their own
        // height here too, the spare height under the grid - compare's tries were stretched 31-38 % past their ink, EB-BAND;
        // it wins over evenRows only where the host sets tightRows - lead 2026-11-13)
        const tight = tightRows(host);
        let Hr = w.map((x, r) => (tight ? x : facts ? x + (tF[r] - x) * lam : Math.max(x, Math.min(kPage * x, rowLimit(mins[r])))));
        let modelRow = null;
        // GUIDED-MODEL-ROW (lf-roles r8b (a), lead via the coordinator; lf-builds chart_to_120 Guided M / L, EB-BAND 42 % / 36 %): the
        // Model's row is as tall as the Model and its worked lines UNDER it, and the row stretch then grew it further, so the try beside
        // it sat in a row a third or more empty. That row's height is held to what the TRIES beside the Model fill to MODEL_ROW_FILL
        // (never under the Model's own height); the height it gives up stays under the grid.
        if (pi === 0 && !spanHere && !span2Here && nModels === 1 && !facts && !tight && cols > 1 && (pg.extra || 0) > 0 && rows > 1) {
            // (the row needs the taller of the Model with its lines and the try with its hint - not the two added, as w[0] counts them)
            const tryC = Math.max(0, ...rowItems(0).slice(1).map((it) => rowMmOf(it, cols))) + (hintRow === 0 ? fit.hint || 0 : 0);
            const modelC = rowMmOf(rowItems(0)[0], cols) + (pg.extra || 0);
            // (only a row whose try would fill under 70 % of it - a band EB-BAND fails - is held; every other page is unchanged)
            // (and only when the held row then passes: a Model whose own need leaves the try under 70 % is left as it was)
            const held = Math.max(modelC, tryC, Math.min(Hr[0], tryC / MODEL_ROW_FILL));
            if (tryC > 0 && tryC < 0.7 * Hr[0] && tryC >= 0.7 * held) Hr[0] = held;
            modelRow = { modelRowMm: Math.round(modelC * 10) / 10, tryRowMm: Math.round(tryC * 10) / 10 };
        }
        // (`evenRows` on a template's footprint - its cell spreads its content over its own height, so the Model's trace and the
        // first try's hint line fit in a row as tall as the others: every row takes the same share, when that share holds the
        // tallest row's content. Opt-in, so no other template's page changes - lane lf-vocab r3, critic r2 #4: 405 / 340 px)
        if (!tight && rows > 1 && host.length && host.every((it) => it.footprint && it.footprint.evenRows)) {
            // (the share is at least the tallest row's content when the page holds that many rows of it: lf-vocab r5, critic r3
            // #6 - at L the Model row's tab and the hint line made it taller than the average, so the rows stayed 99 / 78 mm)
            const even = Math.max(Hr.reduce((a, b) => a + b, 0) / rows, Math.max(...w));
            // (and when the page cannot give every row the tallest row's planned height, every row still takes ONE share - the
            // page's height over the rows: the planned hint row (a two-line meaning hint) drew 100 / 77 mm at L while its
            // content needs about 90 mm; lf-vocab r6, critic r4 #2, ws-vocab-unit V18 measures the rendered rows)
            Hr = Hr.map(() => (even * rows <= pg.avail + 0.5 ? even : Math.max(Hr.reduce((a, b) => a + b, 0), pg.avail) / rows));
        }
        const gridH = Hr.reduce((a, b) => a + b, 0);
        const cellH = gridH / rows;
        const sections = [];
        if (pi === 0) sections.push({ kind: 'html', html: GUIDED_CSS });
        if (span2Here) sections.push({ kind: 'html', html: SPAN2_CSS });
        if (span2Here && fit.span2 >= cols) sections.push({ kind: 'html', html: SPANROW_CSS });
        if (fit.steps.length) sections.push(stepsBand());
        // CL-14: Model and Guided cells are unlabelled (the band names them); still scored.
        const part = gridPart(chunk, { cols, rows, cellH, labels: 'none', start: letter });
        if (spanHere) part.spanFirst = true;
        if (rows > 1 && Math.max(...Hr) - Math.min(...Hr) >= 1) part.rowsTpl = Hr.map((x) => `${Math.round(x * 10) / 10}fr`).join(' ');
        // The one spare-height rule (layout.rowGapFor): into the cells up to rowLimit, more rows
        // up to the ceiling (sheetFit), the rest under the grid; never unruled gaps between rows.
        sections.push({ kind: 'band', label: 'Guided Practice:', instr: instructionText(key, use), content: part });
        letter += chunk.filter((p) => !p.nolabel).length;
        pages.push({ sections });
        fitsOut.push(Object.assign({ cols, rows, cellH }, modelRow || {}));
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
