// js/modules/sheet/part-opts.js
// PART OPTIONS (design/partopts/DESIGN.md, lane lf-partopts step A): "how many" for each part of a lesson packet.
//
// A lesson section may carry `partOpts` - per part, only the values that differ from the standard packet:
//
//   { prereq: {on, n}, chart: {on, n}, vocab: {on, n}, remember: {on}, wedo: {on, n}, rows: {on, n}, practice: {n}, mixed: {n} }
//
//   prereq    the Prerequisite Check: the first n questions (the routing table routes only those)
//   chart     the anchor chart: n worked examples (1 .. the chart's own design)
//   vocab     the Vocabulary match: n words (0 = no Vocabulary band)
//   remember  the Remember strip: on / off
//   wedo      the We Do (Guided) band: n cells (on: false = no We Do band)
//   rows      the lesson sheet's own Independent Practice rows: n whole rows (0 = none)
//   practice  the Practice pages: n problems IN ALL (§8a), offered as P equal pages of whole rows - the pages follow from n
//   mixed     the Mixed pages: n problems in all, a whole number of Mixed pages (each fills its page shelf by shelf)
//   (the lesson sheet's parts - vocab, remember, wedo, rows - are probed by the lesson role with the others as asked: a
//   value whose sheet would not fill its page is not offered, §8b-c; roles/lesson.js sheetOffers)
//
// THE RANGES ARE NEVER HAND-TYPED: the lesson build reports each part's fit (print-sheet.js buildLesson
// `res.lesson.partFit`, measured by the part's own planner at the chosen size: the We Do cells that fit beside the
// Steps, the rows that fit under the bands, the problems a Practice page holds and the fewest whole rows whose cells,
// grown to fill the page, stay under the growth cap). `partLimits` turns a fit into {min, max, dflt, step}; the default
// is what the packet prints today, so a lesson nobody touches stores nothing (`normalizePartOpts`).
//
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

/** The parts the Parts table lists, in packet order (the lesson sheet's bands between the chart and Practice). */
export const PART_OPT_IDS = Object.freeze(['prereq', 'chart', 'vocab', 'remember', 'wedo', 'rows', 'practice', 'mixed']);

/** Teacher-facing names. */
export const PART_OPT_NAMES = Object.freeze({
    prereq: 'Prerequisite Check', chart: 'Anchor chart', vocab: 'Vocabulary', remember: 'Remember', wedo: 'We Do',
    rows: 'Lesson practice rows', practice: 'Practice', mixed: 'Mixed',
});

/** The unit a count is in (singular, plural). */
const UNIT = Object.freeze({
    prereq: ['question', 'questions'], chart: ['worked example', 'worked examples'], vocab: ['word', 'words'],
    wedo: ['problem', 'problems'], rows: ['row', 'rows'], practice: ['problem', 'problems'], mixed: ['problem', 'problems'],
});

/** The warning under the Prerequisite Check when fewer than the lesson's questions print (DESIGN §3, owner answer 1). */
export const PREREQ_FEW_WARNING = 'Only the printed prerequisites are routed.';
/** Below this many prerequisite questions the warning shows (the lesson's own 3-4, §8b). */
export const PREREQ_WARN_BELOW = 3;

/**
 * How far a Practice page's cells may grow past their measured height when the teacher prints fewer rows (RUBRIC H13 /
 * ws-empty-band EB-BAND: a cell whose empty band reaches 30 % fails, i.e. a cell grown past 1 / 0.7 = 1.43 x its content;
 * 1.35 keeps the margin a fix must clear, `--margin`). The fewest rows a page offers is the fewest whose cells stay under it.
 */
export const PRACTICE_GROW_CAP = 1.35;
/**
 * lf-partopts B: the growth cap of a Practice page whose Steps strip is OFF (its height goes to the cells too). Measured by PO-3
 * (ws-partopts-supports): add_facts M, strip off, 16 problems - planned within 1.35 x the measured needed height, printed a
 * 30.0 % band, because the ink sits 1.057 x higher than the needed height's floor (its bottom padding): 1.35 x 1.057 = 1.43,
 * past 1 / 0.7. At 1.30 the printed ratio is 1.37 (27 %). Only the strip-off page uses it; every standard range is unchanged.
 */
export const PRACTICE_GROW_CAP_BARE = 1.30;

const int = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);

/* ---------------------------------------------------- the offer gate's predicates (shared with ws-partopts-unit) */

/**
 * EB-BAND (tests/scripts/ws-empty-band.cjs `BAND`): a cell whose empty band under its lowest ink is 30 % of its height or
 * more fails; cells under 10 mm are not judged. roles/lesson.js sheetOffers refuses a value whose planned cells would fail
 * it (the band predicted from the bridge's measured `neededMm`); ws-partopts-unit checks this constant against the judge's.
 */
export const EB_BAND_MAX = 0.30;
export const EB_MIN_CELL_MM = 10;
/** True when a cell of hMm with belowMm empty under its ink fails EB-BAND. */
export const bandFails = (belowMm, hMm) => hMm >= EB_MIN_CELL_MM && belowMm >= EB_BAND_MAX * hMm;
/**
 * The plan-to-print margin of the band prediction: a planned cell's band (its height less the bridge's measured needed height)
 * reads up to 1.0 mm narrower than the printed cell's near the 30 % line (div_facts M, Vocabulary and Remember off: 26.8 %
 * planned, 31.4 % printed), so the gate adds BAND_SLACK_MM before it judges (DESIGN §8d; ws-partopts-unit BAND-BT pins it:
 * 0 mm lets that sheet through, 3 mm refuses div_facts M We Do 1, which prints 27 %).
 */
export const BAND_SLACK_MM = 2;

/**
 * The plan-to-print margin of the row test (EB-ROWFIT), design/partopts/DESIGN.md §8d. Over 600 swept lesson sheets the printed
 * foot reads 1.5-15.9 mm (median 7.9) more than the planner's free height (the A4 body prints 239 mm where the plan budgets
 * 232 at M, and bands print a little shorter than planned), and the planner's row height (with its two-line head) is no
 * shorter than the printed one. A row fits in print on every sheet whose plan gap (row - free) is <= 10.2 mm; it does not on
 * sheets from 3.7 mm up: the overlap is resolved to the safe side (a value refused, never a blank foot), so the margin is the
 * largest must-refuse gap, 10.2, rounded up with 1.8 mm headroom - under the smallest gap seen beside it where no row fits,
 * 13.2 mm. ws-partopts-unit ROWFIT-BT pins it: 10 mm lets placevalue:expand L Remember off through, 14 mm refuses
 * placevalue:value L rows 0.
 */
export const ROWFIT_SLACK_MM = 12;
/** EB-ROWFIT: true when a foot of freeMm (+ marginMm) holds one Independent row and its band head (rowMm). */
export const rowFits = (freeMm, rowMm, marginMm = 0) => Number(rowMm) > 0 && Number.isFinite(Number(freeMm)) && Number(freeMm) + marginMm >= Number(rowMm);
/** The shortest whole row of c problems across: the c-th shortest of their heights (a row is as tall as its tallest). */
export const shortestRowMm = (hs, c) => {
    const s = (hs || []).filter((h) => Number(h) > 0).map(Number).sort((a, b) => a - b);
    return s.length >= c && c >= 1 ? s[c - 1] : null;
};

/** The rows' text where a row would fit on the standard sheet but the standard sheet prints none (A r3, routed to lf-engine). */
export const NOT_ADDED_STD = 'Not added: the standard sheet is kept';

/** The most Practice pages (and Mixed pages) a total may take. */
export const PRACTICE_MAX_PAGES = 5;
/** The fewest Vocabulary words a match prints (critic A r2 N4: one pair is not a matching task). */
export const VOCAB_MIN = 2;
export const MIXED_MAX_PAGES = 2;

/**
 * The totals a Practice part offers (DESIGN §8a): P pages (1 .. PRACTICE_MAX_PAGES) of k problems each, k whole rows from the
 * fewest whose cells, grown to fill the page, stay under PRACTICE_GROW_CAP to the page's own fit - every page the same, so no
 * page (the last included) is under half used. Sorted, unique.
 */
export function practiceTotals(f, maxPages = PRACTICE_MAX_PAGES) {
    const per = int(f.perPage), cols = Math.max(1, int(f.cols) || 1);
    if (!(per >= 1)) return [];
    const rows = Math.max(1, Math.ceil(per / cols));
    const minRows = Math.max(1, Math.min(rows, int(f.minRows) || rows));
    const ks = [];
    for (let r = minRows; r < rows; r++) ks.push(r * cols);
    ks.push(per);
    const set = new Set();
    for (let P = 1; P <= maxPages; P++) for (const k of ks) set.add(P * k);
    return [...set].sort((x, y) => x - y);
}

/** How a Practice total prints: {pages, per} - the fewest pages, then the most per page, whose product is the total. */
export function practiceSplit(total, f, maxPages = PRACTICE_MAX_PAGES) {
    const per = int(f.perPage), cols = Math.max(1, int(f.cols) || 1);
    const rows = Math.max(1, Math.ceil(per / cols));
    const minRows = Math.max(1, Math.min(rows, int(f.minRows) || rows));
    const ks = [per]; for (let r = rows - 1; r >= minRows; r--) ks.push(r * cols);
    for (let P = 1; P <= maxPages; P++) for (const k of ks) if (P * k === total) return { pages: P, per: k };
    return null;
}

/**
 * The range of one part's count. `ctx`: { fit } - the lesson build's `res.lesson.partFit` (or that object itself).
 * Returns null when the lesson has no such part (it is not listed), else
 * { min, max, dflt, step, values?, canOff?, fixed?, note?, unit, toggle?, none? } - `values` the counts the stepper offers
 * (the engine's own list where the part probed them: a count whose page would not fill is not in it), `canOff` whether its
 * Print tick may be cleared, `toggle` a part with no count (Remember), `none` a part with no room on this sheet.
 */
export function partLimits(part, ctx = {}) {
    const fit = (ctx && ctx.fit) || ctx || {};
    const f = fit[part];
    if (!f) return null;
    const unit = UNIT[part] || ['', ''];
    const out = (o) => Object.assign({ step: 1, unit }, o);
    // (a probed part: its own values; one value is fixed, the reason said once)
    // (critic A r2 N4: the Vocabulary task is a match - one pair is no task, so its fewest words is 2)
    const lo1 = part === 'vocab' ? Math.min(VOCAB_MIN, int(f.words) || 1) : 1;
    const listed = (vals, dflt, canOff, why, extra = {}) => {
        const v = [...new Set((vals || []).map(int).filter((x) => x >= lo1))].sort((x, y) => x - y);
        if (!v.includes(dflt)) v.push(dflt), v.sort((x, y) => x - y);
        return out(Object.assign({ min: v[0], max: v[v.length - 1], dflt, values: v, canOff: canOff !== false }, v.length === 1 ? { fixed: true, note: why } : {}, extra));
    };
    switch (part) {
        case 'prereq': {
            const t = int(f.total);
            if (!(t >= 1)) return null;
            return out({ min: 1, max: t, dflt: t, fixed: t === 1 || undefined, note: t === 1 ? 'Fixed: 1 (the lesson has one prerequisite)' : undefined });
        }
        case 'chart': {
            const d = Math.max(1, int(f.designed) || 1);
            const lo = Math.max(1, Math.min(d, int(f.min) || 1));
            return out(lo === d ? { min: d, max: d, dflt: d, fixed: true, note: `Fixed: ${d} (the chart's design)` } : { min: lo, max: d, dflt: d });
        }
        case 'vocab': {
            const w = int(f.words);
            if (!(w >= 1)) return null;
            if (!Array.isArray(f.values)) return out(w > lo1 ? { min: lo1, max: w, dflt: w, canOff: true } : { min: w, max: w, dflt: w, canOff: true, fixed: true, note: `Fixed: ${w} (the lesson's words)` });
            return listed(f.values, w, f.canOff, `Fixed: ${w} (fewer would leave the lesson sheet short)`);
        }
        case 'remember':
            return f.has ? out({ min: 0, max: 1, dflt: 1, toggle: true, fixed: true, note: '', canOff: f.canOff !== false }) : null;
        case 'wedo': {
            const k = int(f.fit);
            if (!(k >= 1)) return null;
            if (!Array.isArray(f.values)) return out({ min: 1, max: k, dflt: k, canOff: true });
            return listed(f.values, k, f.canOff, `Fixed: ${k} (fills the band)`);
        }
        case 'rows': {
            const r = Math.max(0, int(f.fit) || 0);
            const per = Math.max(1, int(f.perRow) || 1);
            // (F7: no row fits on this sheet - the part is not on it: no tick, no New numbers)
            // (critic A r2 N1: "no room" only where no row fits - the engine's own room test, roles/lesson.js sheetOffers)
            // (lf-partopts A r3: a row that fits yet is not printed happens only on the STANDARD sheet - every changed sheet that
            // does so is refused, roles/lesson.js fillOk - so the text says why truthfully: the standard sheet is kept as it is)
            if (r === 0) return out({ min: 0, max: 0, dflt: 0, fixed: true, none: true, perRow: per, canOff: false, note: f.noRoom === false ? NOT_ADDED_STD : 'Not on this lesson sheet (no room)' });
            if (!Array.isArray(f.values)) return out({ min: 1, max: r, dflt: r, perRow: per, canOff: true });
            return listed(f.values, r, f.canOff, `Fixed: ${r} (fewer would leave the lesson sheet short)`, { perRow: per });
        }
        case 'practice': {
            const per = int(f.perPage);
            if (!(per >= 1)) return null;
            const cols = Math.max(1, int(f.cols) || 1);
            const pages = Math.max(1, int(f.pages) || 1);
            const dflt = per * pages;
            const vals = practiceTotals(f);
            if (!vals.includes(dflt)) vals.push(dflt), vals.sort((x, y) => x - y);
            return out({ min: vals[0], max: vals[vals.length - 1], dflt, values: vals, step: cols, cols, perPage: per, total: true, canOff: true });
        }
        case 'mixed': {
            const c = int(f.count);
            if (!(c >= 1)) return null;
            // (a Mixed sheet that already runs onto a second page is not repeated: its count stays the sheet's)
            // (critic A r2 N3: it says its pages - and a last page under half used - wherever it prints more than one)
            if (int(f.pages) > 1) return out({ min: c, max: c, dflt: c, fixed: true, canOff: true, total: true, sheetPages: int(f.pages), lastFill: f.lastFill, note: `Fixed: ${c} (the Mixed sheet's own pages)` });
            const vals = Array.from({ length: MIXED_MAX_PAGES }, (_, i) => c * (i + 1));
            return out({ min: c, max: vals[vals.length - 1], dflt: c, values: vals, step: c, perPage: c, total: true, canOff: true });
        }
        default: return null;
    }
}

/** Every part's limits from a fit, {part: limits}; parts the lesson lacks are left out. */
export function allPartLimits(fit) {
    const o = {};
    for (const p of PART_OPT_IDS) { const l = partLimits(p, { fit }); if (l) o[p] = l; }
    return o;
}

/** The values a stepper offers: the part's own list, else min, min + step ... max (never outside [min, max]). */
export function offeredValues(lim) {
    if (!lim) return [];
    if (lim.fixed) return [lim.dflt];
    if (Array.isArray(lim.values)) return lim.values.slice();
    const out = [];
    for (let v = lim.max; v >= lim.min; v -= lim.step) out.unshift(v);
    if (out[0] !== lim.min) out.unshift(lim.min);
    return out;
}

/** The nearest offered value to n (clamped to [min, max], snapped to the stepper's values; a tie takes the smaller). */
export function snapCount(n, lim) {
    const vals = offeredValues(lim);
    if (!vals.length) return n;
    const v = int(n);
    if (!Number.isFinite(v)) return lim.dflt;
    let best = vals[0];
    for (const x of vals) if (Math.abs(x - v) < Math.abs(best - v) || (Math.abs(x - v) === Math.abs(best - v) && x < best)) best = x;
    return best;
}

/**
 * The note under a stepper whose count the new limits no longer offer (teacher-print.js runBuild, DESIGN §8a). Critic A r3
 * R2: the reason must be the true one - a count past the new MAXIMUM (a size change, or another part's change) is a clamp,
 * "Now 30: the most size L holds", one under the MINIMUM likewise; only a count BETWEEN two offered values was rounded, and
 * only for Practice / Mixed is that rounding "so no page is under half full". A sheet part between two values was refused
 * by the fill test ("would leave the lesson sheet short").
 */
export function snapNote(part, asked, got, lim, size) {
    const at = size ? `size ${size}` : 'this size';
    const vals = offeredValues(lim);
    const total = part === 'practice' || part === 'mixed';
    if (vals.length && asked > vals[vals.length - 1]) return total ? `Now ${got}: the most ${at} holds` : `Now ${got}: ${asked} no longer fit on the lesson sheet at ${at}`;
    if (vals.length && asked < vals[0]) return total ? `Now ${got}: the fewest ${at} prints` : `Now ${got}: the fewest the lesson sheet takes at ${at}`;
    return total ? `Rounded to ${got} so no page is under half full` : `Now ${got}: ${asked} would leave the lesson sheet short`;
}

/** The range text under a stepper ("2 to 4 problems", "12 to 75 problems, in rows of 3"); a fixed count says it once. */
export function rangeText(part, lim) {
    if (!lim) return '';
    if (lim.fixed) return lim.note || '';
    const [one, many] = lim.unit || ['', ''];
    if (part === 'practice') return `${lim.min} to ${lim.max} problems, in rows of ${lim.step}`;
    if (part === 'mixed') return `${lim.min} to ${lim.max} problems`;
    if (part === 'rows') return `${lim.min} to ${lim.max} ${lim.max === 1 ? one : many} (${lim.perRow} a row)`;
    return `${lim.min} to ${lim.max} ${lim.max === 1 ? one : many}`;
}

/** The pages a Practice or Mixed total prints on ({pages, per}), or null. */
export function totalPages(part, n, lim) {
    if (!lim || !lim.total) return null;
    if (part === 'mixed' && lim.sheetPages) return { pages: lim.sheetPages, per: null, lastUnderHalf: Number.isFinite(lim.lastFill) && lim.lastFill < 0.5 };
    if (part === 'mixed') return { pages: Math.max(1, Math.round(n / lim.perPage)), per: lim.perPage };
    return practiceSplit(n, { perPage: lim.perPage, cols: lim.cols, minRows: lim.values ? Math.ceil(lim.values[0] / lim.cols) : undefined });
}

/** The parts whose stepper reaches 0 - the part's tick off - where the part may be off (teacher-print.js stepperValues). */
export const ZERO_OFF_PARTS = Object.freeze(['vocab', 'wedo', 'rows', 'practice', 'mixed']);
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];
const pagesWord = (n) => (n === 1 ? 'one page' : `${WORDS[n] || n} pages`);

/**
 * The How many text of a part's row on the Print screen (critic A r2 N3, N6): one form everywhere - "a to b units" or
 * "n units", then ", or 0 to leave it off" wherever the stepper reaches 0, a fixed count once as "Fixed: n (why)", and the
 * pages a Practice / Mixed total prints on ("2 pages of 15"; a last page under half used says so). Plain spaces: the
 * screen binds the last words so none wraps alone.
 */
export function partRowText(part, lim, n) {
    if (!lim) return '';
    if (lim.none) return lim.note || '';
    if (lim.toggle) return '';
    const [one, many] = lim.unit || ['', ''];
    const zero = ZERO_OFF_PARTS.includes(part) && lim.canOff !== false;
    const vals = offeredValues(lim);
    let t;
    if (lim.fixed || vals.length <= 1) {
        const d = lim.fixed ? lim.dflt : vals[0];
        t = zero ? `${d} ${d === 1 ? one : many}${part === 'rows' ? ` (${lim.perRow} a row)` : ''}` : (lim.note || `Fixed: ${d}`);
    } else t = rangeText(part, lim);
    if (zero) t += ', or 0 to leave it off';
    const tp = n > 0 ? totalPages(part, n, lim) : null;
    if (tp) t += ` · ${tp.per ? `${tp.pages} page${tp.pages === 1 ? '' : 's'} of ${tp.per}` : pagesWord(tp.pages)}${tp.lastUnderHalf ? ', the last under half full' : ''}`;
    return t;
}

/**
 * The lesson sheet's caption on the Print screen (critic A r2 N3): the pages the sheet prints on, read from the build
 * (`partFit.sheet` {pages, lastFill}), and a last page under half used said so.
 */
export function sheetCaption(fit) {
    const sh = fit && fit.sheet;
    const n = sh && int(sh.pages) >= 1 ? int(sh.pages) : 1;
    return `Vocabulary, Remember, We Do and practice rows: ${pagesWord(n)}${n > 1 && Number.isFinite(sh.lastFill) && sh.lastFill < 0.5 ? ', the last under half full' : ''}`;
}

/**
 * Clean a partOpts object: each count snapped to its stepper's values, every value equal to its default dropped (on: true,
 * n = dflt), a tick cleared where its part may not be off (`canOff` false: the page would not fill), a count of 0 read as
 * the tick off, empty parts dropped. `limits`: {part: partLimits(...)} (allPartLimits); a part without limits keeps its
 * values, only sanitised (the UI has not measured it yet). Returns {} for the standard packet.
 */
export function normalizePartOpts(partOpts, limits = {}) {
    const src = partOpts && typeof partOpts === 'object' ? partOpts : {};
    const out = {};
    for (const p of PART_OPT_IDS) {
        const v = src[p];
        if (!v || typeof v !== 'object') continue;
        const lim = limits ? limits[p] : null;
        const o = {};
        let off = v.on === false || ((p === 'vocab' || p === 'rows' || p === 'wedo') && v.n !== undefined && v.n !== null && Number(v.n) === 0);
        if (off && lim && (lim.canOff === false || lim.none)) off = false;
        if (off) o.on = false;
        else if (v.n !== undefined && v.n !== null && Number.isFinite(Number(v.n))) {
            let n = int(v.n);
            if (lim) {
                if (!lim.values) n = Math.max(lim.min, Math.min(lim.max, n));
                n = snapCount(n, lim);
                if (!(lim.fixed || n === lim.dflt)) o.n = n;
            } else if (n >= 0) o.n = n;
        }
        if (Object.keys(o).length) out[p] = o;
    }
    // (step B: each part's supports delta - `opts` {off, support, cover} and `bands` - cleaned, kept beside its counts)
    for (const p of SUP_PART_IDS) {
        const d = normalizeSupDelta(src[p]);
        if (d) out[p] = Object.assign(out[p] || {}, d);
    }
    return out;
}

/**
 * Critic A r4 F2: re-limit a section's part counts from what the teacher ASKED, not from the last snapped value. `asked` is
 * {part: n} - the count each stepper was last set to by the teacher; a part that is off keeps its off. So a size round trip
 * (Practice 45 at M, then L: 30, the most L holds; then M) gives back 45, where re-snapping the clamped 30 gave 27. Returns
 * {partOpts, notes}: notes[part] = {asked, got} for every part whose count differs from its asked count (the caller words
 * it with snapNote), and a part back at its asked count has no note.
 */
export function resnapPartOpts(partOpts, asked, limits) {
    const src = JSON.parse(JSON.stringify(partOpts && typeof partOpts === 'object' ? partOpts : {}));
    const ask = asked && typeof asked === 'object' ? asked : {};
    for (const [p, n] of Object.entries(ask)) {
        if (!PART_OPT_IDS.includes(p) || !Number.isFinite(Number(n)) || Number(n) <= 0) continue;
        if (src[p] && src[p].on === false) continue;
        src[p] = Object.assign({}, src[p], { n: int(n) });
        delete src[p].on;
    }
    const out = normalizePartOpts(src, limits);
    const notes = {};
    for (const [p, v] of Object.entries(src)) {
        if (!Number.isFinite(v.n)) continue;
        const lim = limits ? limits[p] : null;
        const now = out[p];
        const got = now && Number.isFinite(now.n) ? now.n : lim ? lim.dflt : v.n;
        if (got !== v.n) notes[p] = { asked: v.n, got };
    }
    return { partOpts: out, notes };
}

/** True when the partOpts ask for the standard packet (nothing stored). */
export const partOptsEmpty = (po) => !po || !Object.keys(normalizePartOpts(po, null)).length;

/**
 * Read a saved Lesson section's older fields into partOpts (DESIGN §4: old saved sets open unchanged): `parts` (LR-18, the
 * parts printed) turns the Prerequisite Check and the anchor chart off where they are missing. `pages` and `mixed` stay
 * the section's own fields (the Practice row's pages stepper and the Mixed row's tick).
 */
export function partOptsFromSection(s) {
    const po = Object.assign({}, s && s.partOpts && typeof s.partOpts === 'object' ? JSON.parse(JSON.stringify(s.partOpts)) : {});
    if (s && Array.isArray(s.parts)) {
        for (const p of ['prereq', 'chart']) if (!s.parts.includes(p)) po[p] = Object.assign({}, po[p], { on: false });
    }
    return normalizePartOpts(po, null);
}

/** The lesson parts list (LR-18 `parts`) a partOpts asks for, or undefined for the default packet. */
export function partsListOf(po, practicePages, mixed) {
    const off = (p) => !!(po && po[p] && po[p].on === false);
    if (!off('prereq') && !off('chart')) return undefined;
    return ['prereq', 'chart', 'sheet', ...(practicePages > 0 ? ['practice'] : []), ...(mixed ? ['mixed'] : [])].filter((p) => !off(p));
}

/** The per-part counts the lesson ROLE reads (`lessonInput.partN`), or null when none differs. */
export function lessonPartN(po) {
    if (!po) return null;
    const o = {};
    if (po.chart && Number.isFinite(po.chart.n)) o.chart = po.chart.n;
    if (po.vocab && (po.vocab.on === false || po.vocab.n === 0)) o.vocab = 0;
    else if (po.vocab && Number.isFinite(po.vocab.n)) o.vocab = po.vocab.n;
    if (po.remember && po.remember.on === false) o.remember = false;
    if (po.wedo && (po.wedo.on === false || po.wedo.n === 0)) o.wedo = 0;
    else if (po.wedo && Number.isFinite(po.wedo.n)) o.wedo = po.wedo.n;
    if (po.rows && (po.rows.on === false || po.rows.n === 0)) o.rows = 0;
    else if (po.rows && Number.isFinite(po.rows.n)) o.rows = po.rows.n;
    return Object.keys(o).length ? o : null;
}

/* ============================================================== SUPPORTS (step B, DESIGN §2) */
//
// A part's supports are skill OPTION values, never page hacks (§2.2):
//   - the role-drawn supports a template or role draws from the level are switched off through the universal hidden
//     option `off` (skill-options.js offOption: a set of the ids below; default empty, so every code, set and quiz is
//     unchanged). The template / role reads `ctx.off` (print-sheet.js hostItem draws every item with its skill's `off`, so
//     the pupil page, the key and the measurement agree; screen-cell.js kindHTML reads the same values on screen).
//   - the hints that already have an option (the S2 `support` set: touch dots, dot tiles, ten frames ...) are switched
//     through that option (`support`, with its `cover`).
//   - page bands (Steps strip, Say band) are part settings (`bands`), not cell supports.
// The build DECLARES what each part's items really draw (print-sheet.js buildLesson `res.lesson.partSup`, read from the
// items' templates and payloads - never typed), so a panel never offers a support the page cannot draw; PO-5
// (ws-partopts-supports) renders each declared id on and off and fails when the DOM does not change.

/** The role-drawn supports `off` can switch (append-only: the codec tokens of `off` are in skill-option-keys.js). */
export const OFF_IDS = Object.freeze(['regroup', 'heads', 'firststep']);
/** Each support id: its kind and the teacher's words. */
export const SUPPORT_CATALOGUE = Object.freeze({
    regroup: Object.freeze({ kind: 'structural', label: 'Regroup boxes' }),
    heads: Object.freeze({ kind: 'structural', label: 'Place-value letters (H T O)' }),
    firststep: Object.freeze({ kind: 'hint', label: 'First problem: its first step done in grey' }),
});
/** The page bands a part may turn off (part anatomy, §2.2.4). */
export const BAND_LABELS = Object.freeze({ steps: 'Steps strip', say: 'Say band' });
/** The parts with a Supports chip on the Print screen ('sheet' = the lesson sheet's cells, We Do and rows together). */
export const SUP_PART_IDS = Object.freeze(['prereq', 'chart', 'sheet', 'wedo', 'practice', 'mixed']);
/** The PAGE_TYPES fade per part (§2.3): the scaffold level its cells are drawn at. */
export const PART_LEVEL = Object.freeze({ prereq: 0, chart: 3, sheet: 1, wedo: 2, rows: 1, practice: 1, mixed: 1, quiz: 0 });

/** The warning when a support the step teaches with is ticked off (§2.4: a warning, never a block). */
export const NEEDS_TEXT = Object.freeze({
    regroup: 'This step teaches with the regroup boxes. Without them, pupils must hold the carried ten in their head. The page still prints.',
    heads: 'This step teaches with the place-value letters. Without them, pupils must name each column themselves. The page still prints.',
});
/** A band kept at this size (its tick disabled): turning it off would grow the page's cells past the cap (PRACTICE_GROW_CAP_BARE). */
export const BAND_KEPT_TEXT = 'Kept at this size: without it the problems would stand in cells too tall for them.';
/** The warning when every structural support of a part is ticked off (§2.4). */
export const NO_STRUCTURE_TEXT = 'No structure left: the cell is the problem and the answer slot only.';
/** The quiz paper's line when a hint is ticked (owner answer 3: offered, off by default). */
export const QUIZ_HINTS_TEXT = 'Hints are on for this quiz: they print on the quiz and its key, and show on the online quiz.';

const uniq = (a) => [...new Set(a)];
const asList = (v) => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);
const isOptHint = (x) => !!(x && x.from && typeof x.from === 'object' && x.from.option === 'support');

/**
 * One part's supports delta, cleaned: `opts.off` only known ids (in OFF_IDS order), `opts.support` a list (the skill's own
 * option normalises its values), `opts.cover` a string, `bands` only known bands, set false. Null when empty.
 */
export function normalizeSupDelta(v) {
    if (!v || typeof v !== 'object') return null;
    const out = {};
    const o = v.opts && typeof v.opts === 'object' ? v.opts : null;
    if (o) {
        const oo = {};
        const off = OFF_IDS.filter((id) => asList(o.off).includes(id));
        if (off.length) oo.off = off;
        if (Array.isArray(o.support)) oo.support = uniq(o.support.filter((x) => typeof x === 'string' || typeof x === 'number'));
        if (typeof o.cover === 'string' && o.cover) oo.cover = o.cover;
        if (Object.keys(oo).length) out.opts = oo;
    }
    const b = v.bands && typeof v.bands === 'object' ? v.bands : null;
    if (b) {
        const bb = {};
        for (const k of Object.keys(BAND_LABELS)) if (b[k] === false) bb[k] = false;
        if (Object.keys(bb).length) out.bands = bb;
    }
    return Object.keys(out).length ? out : null;
}

/**
 * The supports of one part, resolved (§2.2): `decl` the part's declaration (the build's `partSup[part]`: a list of
 * {id, kind: 'structural' | 'hint' | 'band', label, from: 'role' | 'band' | {option: 'support', value}, needs?}),
 * `roleLevel` the part's level (PART_LEVEL), `delta` the part's partOpts entry (a paper: {opts: the skill's opts}),
 * `base` the skill's own options (an option-backed hint's standard is the skill's own tick: off unless the skill has it).
 * Returns { level, off, opts: {support?, cover?}, bands, ticks: {id: bool}, std: {id: bool}, changed, warnings } where
 * `off` / `opts` / `bands` are what the page is built with, `ticks` the panel's boxes and `std` the standard's. It never
 * blocks: a warning is a line on the panel; the values print as asked.
 */
export function resolveSupports(decl, roleLevel, delta = null, base = {}) {
    const d = normalizeSupDelta(delta) || {};
    const o = d.opts || {};
    const list = Array.isArray(decl) ? decl : [];
    const baseSupport = asList(base && base.support);
    const ticks = {}, std = {};
    for (const x of list) {
        if (x.locked) { std[x.id] = true; ticks[x.id] = true; continue; }   // (kept at this size: the tick cannot be cleared)
        if (x.kind === 'band') { std[x.id] = true; ticks[x.id] = !(d.bands && d.bands[x.id] === false); continue; }
        if (isOptHint(x)) {
            std[x.id] = baseSupport.includes(x.from.value);
            ticks[x.id] = Array.isArray(o.support) ? o.support.includes(x.from.value) : std[x.id];
            continue;
        }
        std[x.id] = true;
        ticks[x.id] = !asList(o.off).includes(x.id);
    }
    const off = list.filter((x) => x.from === 'role' && ticks[x.id] === false).map((x) => x.id);
    const opts = {};
    const optHints = list.filter(isOptHint);
    if (optHints.length && Array.isArray(o.support)) opts.support = optHints.filter((x) => ticks[x.id]).map((x) => x.from.value);
    if (o.cover) opts.cover = o.cover;
    const bands = {};
    for (const x of list) if (x.kind === 'band' && ticks[x.id] === false) bands[x.id] = false;
    const changed = list.filter((x) => ticks[x.id] !== std[x.id]).length;
    const warnings = [];
    for (const x of list) if (x.needs && ticks[x.id] === false && NEEDS_TEXT[x.id]) warnings.push(NEEDS_TEXT[x.id]);
    const structural = list.filter((x) => x.kind === 'structural');
    if (structural.length && structural.every((x) => ticks[x.id] === false)) warnings.push(NO_STRUCTURE_TEXT);
    return { level: roleLevel, off, opts, bands, ticks, std, changed, warnings };
}

/** The Supports chip's words for a part (§1.1): "None to choose", "Standard: ..." or "Custom: n off, n on". */
export function supportsChip(decl, r) {
    const list = Array.isArray(decl) ? decl : [];
    if (!list.length) return 'None to choose';
    if (!r || !r.changed) {
        const on = list.filter((x) => (r && r.ticks ? r.ticks[x.id] : true));
        const kinds = new Set(on.map((x) => x.kind));
        const words = [kinds.has('structural') ? 'structure' : '', kinds.has('hint') ? 'hints' : '', kinds.has('band') ? 'page bands' : ''].filter(Boolean);
        return `Standard: ${words.length ? words.join(', ').replace(/, ([^,]*)$/, ' and $1') : 'no hints'}`;
    }
    const offN = list.filter((x) => r.std[x.id] && !r.ticks[x.id]).length;
    const onN = list.filter((x) => !r.std[x.id] && r.ticks[x.id]).length;
    return `Custom: ${[offN ? `${offN} off` : '', onN ? `${onN} on` : ''].filter(Boolean).join(', ')}`;
}

/** The delta a panel's ticks write back: only what differs from the standard; null for the standard. */
export function supDeltaFromTicks(decl, ticks, std, cover) {
    const list = Array.isArray(decl) ? decl : [];
    const off = list.filter((x) => x.from === 'role' && ticks[x.id] === false).map((x) => x.id);
    const optHints = list.filter(isOptHint);
    const supChanged = optHints.some((x) => !!ticks[x.id] !== !!std[x.id]);
    const bands = {};
    for (const x of list) if (x.kind === 'band' && ticks[x.id] === false) bands[x.id] = false;
    const opts = {};
    if (off.length) opts.off = off;
    if (supChanged) opts.support = optHints.filter((x) => ticks[x.id]).map((x) => x.from.value);
    if (cover && optHints.some((x) => ticks[x.id])) opts.cover = cover;
    return normalizeSupDelta({ opts, bands });
}

/**
 * A skill's option values with a part's delta over them: `off`, `support` and `cover` replace; the skill's other options
 * are kept. print-sheet.js puts it on the part's skill refs; the Practice / Quiz sheets on a skill's own opts.
 */
export function withSupDelta(opts, delta) {
    const d = normalizeSupDelta(delta);
    if (!d || !d.opts) return opts;
    const out = Object.assign({}, opts || {});
    if (d.opts.off) out.off = d.opts.off.slice();
    if (d.opts.support) out.support = d.opts.support.slice();
    if (d.opts.cover) out.cover = d.opts.cover;
    return out;
}

/* ------------------------------------------------- the per-size offer gate (lead, lf-partopts B) */

/**
 * Option values offered only at some sizes: {'category:skill': {optionId: {value: {sizes, why}}}}. A value listed here is
 * not offered at the other sizes (skill-options.js offeredOptionsFor leaves it out while the screen's size is one of them)
 * and a teacher's choice of it is put back to the option's default there, with the reason (`gateBySize`). Lesson data and
 * the engine are not gated (lesson 3a deals band 36 at L by its own record).
 */
export const SIZE_OFFERS = Object.freeze({
    'multiplication:mult_properties': Object.freeze({
        band: Object.freeze({ 36: Object.freeze({ sizes: Object.freeze(['S']), why: 'Order factors to 6 is offered at size S only, pending re-measure.' }) }),
    }),
});

/** True when option `optId` = `value` of a skill is offered at `size` (no size: every value is). */
export function offeredAtSize(categoryId, skillId, optId, value, size) {
    if (!size) return true;
    const t = SIZE_OFFERS[`${categoryId}:${skillId}`];
    const e = t && t[optId] && t[optId][String(value)];
    return !e || e.sizes.includes(size);
}

/**
 * A skill's chosen options through the size gate: a value not offered at `size` goes back to `defaults[optId]` (a set
 * loses the member). Returns { opts, notes }: the reasons, empty when nothing changed (then `opts` is the same object).
 */
export function gateBySize(categoryId, skillId, opts, size, defaults = {}) {
    const t = SIZE_OFFERS[`${categoryId}:${skillId}`];
    if (!t || !opts || !size) return { opts, notes: [] };
    let out = opts;
    const notes = [];
    for (const optId of Object.keys(t)) {
        if (!(optId in opts)) continue;
        const v = opts[optId];
        if (Array.isArray(v)) {
            const drop = v.filter((x) => !offeredAtSize(categoryId, skillId, optId, x, size));
            if (drop.length) { out = Object.assign({}, out, { [optId]: v.filter((x) => !drop.includes(x)) }); drop.forEach((x) => notes.push(t[optId][String(x)].why)); }
        } else if (!offeredAtSize(categoryId, skillId, optId, v, size)) {
            notes.push(t[optId][String(v)].why);
            out = Object.assign({}, out);
            if (optId in defaults) out[optId] = defaults[optId]; else delete out[optId];
        }
    }
    return { opts: out, notes };
}

export default { OFF_IDS, SUPPORT_CATALOGUE, BAND_LABELS, SUP_PART_IDS, PART_LEVEL, NEEDS_TEXT, NO_STRUCTURE_TEXT, QUIZ_HINTS_TEXT, normalizeSupDelta, resolveSupports, supportsChip, supDeltaFromTicks, withSupDelta, SIZE_OFFERS, offeredAtSize, gateBySize, snapNote, BAND_SLACK_MM, EB_BAND_MAX, EB_MIN_CELL_MM, bandFails, ROWFIT_SLACK_MM, rowFits, shortestRowMm, NOT_ADDED_STD, VOCAB_MIN, ZERO_OFF_PARTS, partRowText, sheetCaption, PRACTICE_MAX_PAGES, MIXED_MAX_PAGES, practiceTotals, practiceSplit, totalPages, PRACTICE_GROW_CAP, PART_OPT_IDS, PART_OPT_NAMES, PREREQ_FEW_WARNING, PREREQ_WARN_BELOW, partLimits, allPartLimits, offeredValues, snapCount, rangeText, normalizePartOpts, partOptsEmpty, partOptsFromSection, partsListOf, lessonPartN };
