// js/modules/sheet/part-opts.js
// PART OPTIONS (design/partopts/DESIGN.md, lane lf-partopts step A): "how many" for each part of a lesson packet.
//
// A lesson section may carry `partOpts` - per part, only the values that differ from the standard packet:
//
//   { prereq: {on, n}, chart: {on, n}, vocab: {n}, remember: {on}, wedo: {on, n}, rows: {n}, practice: {n} }
//
//   prereq    the Prerequisite Check: the first n questions (the routing table routes only those)
//   chart     the anchor chart: n worked examples (1 .. the chart's own design)
//   vocab     the Vocabulary match: n words (0 = no Vocabulary band)
//   remember  the Remember strip: on / off
//   wedo      the We Do (Guided) band: n cells (on: false = no We Do band)
//   rows      the lesson sheet's own Independent Practice rows: n whole rows (0 = none)
//   practice  the Practice pages: n problems a page, in whole rows (the page count stays `practicePages`)
//   mixed     fixed in step A (the Mixed page fills its page shelf by shelf: its count is the page's)
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
    wedo: ['problem', 'problems'], rows: ['row', 'rows'], practice: ['a page', 'a page'], mixed: ['problems', 'problems'],
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

const int = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);

/**
 * The range of one part's count. `ctx`: { fit } - the lesson build's `res.lesson.partFit` (or that object itself).
 * Returns null when the lesson has no such part (it is not listed), else
 * { min, max, dflt, step, fixed?, note?, unit, toggle? } - `toggle` for a part with no count (Remember).
 */
export function partLimits(part, ctx = {}) {
    const fit = (ctx && ctx.fit) || ctx || {};
    const f = fit[part];
    if (!f) return null;
    const unit = UNIT[part] || ['', ''];
    const out = (o) => Object.assign({ step: 1, unit }, o);
    switch (part) {
        case 'prereq': {
            const t = int(f.total);
            if (!(t >= 1)) return null;
            return out({ min: 1, max: t, dflt: t, fixed: t === 1 || undefined, note: t === 1 ? 'One question (the lesson has one prerequisite)' : undefined });
        }
        case 'chart': {
            const d = Math.max(1, int(f.designed) || 1);
            const lo = Math.max(1, Math.min(d, int(f.min) || 1));
            return out(lo === d ? { min: d, max: d, dflt: d, fixed: true, note: `${d} worked example${d === 1 ? '' : 's'} (fixed by the chart)` } : { min: lo, max: d, dflt: d });
        }
        case 'vocab': {
            const w = int(f.words);
            if (!(w >= 1)) return null;
            return out({ min: 0, max: w, dflt: w });
        }
        case 'remember':
            return f.has ? out({ min: 0, max: 1, dflt: 1, toggle: true, fixed: true, note: '' }) : null;
        case 'wedo': {
            const k = int(f.fit);
            if (!(k >= 1)) return null;
            // (min 2, or the fit's own `min` - the fewest cells whose problems fill half their width: one We Do cell alone stands across the band with a 30 % empty side - EB-SIDE, ws-partopts-unit PO-2d - and
            // two cells let the hint fade, DESIGN §3)
            const lo = Math.max(2, Math.min(k, int(f.min) || k));
            return out(lo >= k ? { min: k, max: k, dflt: k, fixed: true, note: `${k} problem${k === 1 ? '' : 's'} (fixed: fewer would leave the cells half empty)` } : { min: lo, max: k, dflt: k });
        }
        case 'rows': {
            const r = Math.max(0, int(f.fit) || 0);
            const per = Math.max(1, int(f.perRow) || 1);
            return out(r === 0 ? { min: 0, max: 0, dflt: 0, fixed: true, perRow: per, note: 'No row fits under the bands' } : { min: 0, max: r, dflt: r, perRow: per });
        }
        case 'practice': {
            const per = int(f.perPage);
            if (!(per >= 1)) return null;
            const cols = Math.max(1, int(f.cols) || 1);
            const max = per;
            const minRows = Math.max(1, Math.min(Math.ceil(max / cols), int(f.minRows) || Math.ceil(max / cols)));
            const min = Math.min(max, minRows * cols);
            // (a page whose count is not whole rows - the engine's own page fill - steps from its max down in whole rows)
            return out(min === max ? { min, max, dflt: per, step: cols, fixed: true, cols, note: `${per} a page (the fewest rows that fill the page)` } : { min, max, dflt: per, step: cols, cols });
        }
        case 'mixed': {
            const c = int(f.count);
            if (!(c >= 1)) return null;
            return out({ min: c, max: c, dflt: c, fixed: true, note: `${c} problems (the Mixed page fills its page)` });
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

/** The values a stepper offers: min, min + step ... max (never outside [min, max]). */
export function offeredValues(lim) {
    if (!lim) return [];
    if (lim.fixed) return [lim.dflt];
    const out = [];
    for (let v = lim.max; v >= lim.min; v -= lim.step) out.unshift(v);
    if (out[0] !== lim.min) out.unshift(lim.min);
    return out;
}

/** The nearest offered value to n (clamped to [min, max], snapped to the stepper's values). */
export function snapCount(n, lim) {
    const vals = offeredValues(lim);
    if (!vals.length) return n;
    const v = int(n);
    if (!Number.isFinite(v)) return lim.dflt;
    let best = vals[0];
    for (const x of vals) if (Math.abs(x - v) < Math.abs(best - v) || (Math.abs(x - v) === Math.abs(best - v) && x < best)) best = x;
    return best;
}

/** The range text under a stepper ("2 to 4 problems", "8 to 16 a page, in rows of 4"). */
export function rangeText(part, lim) {
    if (!lim) return '';
    if (lim.fixed) return lim.note || '';
    const [one, many] = lim.unit || ['', ''];
    if (part === 'practice') return `${lim.min} to ${lim.max} ${one}, in rows of ${lim.step}`;
    if (part === 'rows') return `${lim.min} to ${lim.max} ${lim.max === 1 ? one : many} (${lim.perRow} a row)`;
    return `${lim.min} to ${lim.max} ${lim.max === 1 ? one : many}`;
}

/**
 * Clean a partOpts object: each count clamped to its limits and snapped to its stepper, every value equal to its
 * default dropped (on: true, n = dflt), empty parts dropped. `limits`: {part: partLimits(...)} (allPartLimits); a part
 * without limits keeps its values, only sanitised (the UI has not measured it yet). Returns {} for the standard packet.
 */
export function normalizePartOpts(partOpts, limits = {}) {
    const src = partOpts && typeof partOpts === 'object' ? partOpts : {};
    const out = {};
    for (const p of PART_OPT_IDS) {
        const v = src[p];
        if (!v || typeof v !== 'object') continue;
        const lim = limits ? limits[p] : null;
        const o = {};
        if (v.on === false) o.on = false;
        if (v.n !== undefined && v.n !== null && Number.isFinite(Number(v.n))) {
            let n = int(v.n);
            if (lim) {
                n = Math.max(lim.min, Math.min(lim.max, n));
                n = snapCount(n, lim);
                if (!(lim.fixed || n === lim.dflt)) o.n = n;
            } else if (n >= 0) o.n = n;
        }
        if (Object.keys(o).length) out[p] = o;
    }
    return out;
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
    if (po.vocab && po.vocab.on === false) o.vocab = 0;
    else if (po.vocab && Number.isFinite(po.vocab.n)) o.vocab = po.vocab.n;
    if (po.remember && po.remember.on === false) o.remember = false;
    if (po.wedo && po.wedo.on === false) o.wedo = 0;
    else if (po.wedo && Number.isFinite(po.wedo.n)) o.wedo = po.wedo.n;
    if (po.rows && po.rows.on === false) o.rows = 0;
    else if (po.rows && Number.isFinite(po.rows.n)) o.rows = po.rows.n;
    return Object.keys(o).length ? o : null;
}

export default { PRACTICE_GROW_CAP, PART_OPT_IDS, PART_OPT_NAMES, PREREQ_FEW_WARNING, PREREQ_WARN_BELOW, partLimits, allPartLimits, offeredValues, snapCount, rangeText, normalizePartOpts, partOptsEmpty, partOptsFromSection, partsListOf, lessonPartN };
