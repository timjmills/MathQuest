// refline-screen.js — Wave 5.2: the number line at the top of the page: ONE resolver for print and
// screen, and the screen hosts.  (2026-10-03; critic nl-r1 D1, D2, D3, D6, D8)
//
// THE LINE OF A SKILL. `skillLine(categoryId, skillId, opts)` resolves the Auto line ONCE per skill
// and options, from what the skill declares (its "within N", its count step, its option band) and a
// FIXED seeded sample of its items, never from the page or the card in hand. Every host uses it:
// every print role, the practice card and the online worksheet, so one skill gets one scale
// everywhere. The items actually on a page or a card only WIDEN it (they never narrow it).
//
// A PAGE OF SEVERAL SKILLS. `mergedLine(requests, items)` merges the skills that asked for the line:
// the union of their ranges (their own teacher ranges included), the finest step any of them needs
// (fractions before decimals before wholes), and a note when one line cannot serve them all.
//
// THE SCREEN. The same drawing as paper (sheet/refline.js), placed once above the practice card and
// once above the online worksheet, in the black-and-white paper look. The quiz draws no supports, so
// it shows none there. The options come from where the app keeps them: the set's per-skill options
// (skill-option-store), the session's, then the ones each generated item carries.
//
// Layer 4 (imports generate-question.js, skill-options.js, the option store and the kit).

import { generateQuestionFor } from './generate-question.js';
import { normalizeOptions, numberLineFits, numberLineSkillHints, numberLineSummary } from './skill-options.js';
import { getSetOptions } from './skill-option-store.js';
import { SKILLS, isMixedMetaSkill } from './data.js';
import { setNumberLineCoverCheck } from './skill-options-ui.js';
import { nlResolveLine, nlLineNumbers, nlItemSteps, nlCommonStep, nlStepName, refLineHTML } from './sheet/index.js';

const PX_PER_MM = 3.4;     // the screen twin's scale (k2kit.js --mq-k2)
const SAMPLE = 240;  // critic nl-r3 D4: enough to reach the skill's declared range, so a page never widens it
const SAMPLE_SEED = 7001;  // fixed: the line never depends on the page's seed
const _basis = new Map();

/** The skill's options normalised, or null when the line is not on for it. */
export function lineOpts(categoryId, skillId, opts) {
    if (!categoryId || !skillId || !numberLineFits(categoryId, skillId)) return null;
    let o = null;
    try { o = normalizeOptions(categoryId, skillId, opts || {}); } catch (e) { o = null; }
    if (!o || !o.nlOn) return null;
    return numberLineBlocked(categoryId, skillId, o) ? null : o;
}

/**
 * Why a skill that offers the line draws none with these options, or '' (critic nl-r3 D1, D2).
 * The mixed add / subtract pools deal from 4 + 2 to six-digit sums, so no Auto line serves them:
 * the line is drawn only once the teacher sets both ends. number_patterns_rule draws it only for
 * count on / count back starting in the ones (doubling, × 10 and growing steps cannot be
 * read on one additive line).
 */
const _NL_MANUAL = new Set(['addition:mixed_addition', 'subtraction:mixed_subtraction']);
export function numberLineBlocked(categoryId, skillId, o) {
    const k = `${categoryId}:${skillId}`;
    const set = (v) => v === null || v === undefined || v === '' ? null : (Array.isArray(v) ? v : [v]).map(String);
    if (_NL_MANUAL.has(k) && (o.nlFrom === null || o.nlFrom === undefined || o.nlTo === null || o.nlTo === undefined)) {
        return 'This mix deals sums from single digits to hundreds of thousands, so the line needs its two ends: set Starts at and Ends at.';
    }
    if (k === 'patterns:number_patterns_rule') {
        const pat = set(o.pattern), pl = set(o.places);
        if (!pat || pat.some((v) => v !== 'add' && v !== 'sub') || !pl || pl.some((v) => v !== '1')) {
            // Lead decision (critic nl-r4 D4): a tens start runs the line to ~280 with ticks
            // thinned to 2s, so odd numbers fall between ticks; a ones start keeps every number on one.
            return 'The line is drawn for Count on / Count back with Start in the ones only, so every number lands on a tick: doubling, × 10, growing steps and a tens start cannot be read on one number line.';
        }
    }
    return '';
}

/**
 * What the line of one skill rests on: its hints (declared range, count step, kind) and the
 * numbers of a fixed seeded sample. Cached per skill and options.
 */
export function skillLineBasis(categoryId, skillId, opts) {
    const key = `${categoryId}:${skillId}:${JSON.stringify(opts || {})}`;
    if (_basis.has(key)) return _basis.get(key);
    const hints = Object.assign({}, numberLineSkillHints(categoryId, skillId));
    let o = {};
    try { o = normalizeOptions(categoryId, skillId, opts || {}); } catch (e) { o = {}; }
    // An option that bounds the answers ("Facts to 20", a band, the Max Number) is the declared end.
    for (const k of ['band', 'range']) if (Number(o[k]) > 0) { hints.within = Number(o[k]); break; }
    const qs = [];
    for (let i = 0; i < SAMPLE; i++) {
        try { const q = generateQuestionFor({ category: categoryId, skill: skillId, opts, seed: SAMPLE_SEED + i * 7919, itemIndex: i }); if (q) qs.push(q); } catch (e) { /* skip */ }
    }
    // The step the skill's items count in: theirs when they share one, else the step every one of
    // them lands on (the gcd: 2s and 5s share a line of ones) (critic nl-r2 D1).
    if (hints.skip && !hints.step) hints.step = nlCommonStep(nlItemSteps(qs));
    const out = { hints, nums: qs.flatMap((q) => nlLineNumbers(q)) };
    if (_basis.size > 80) _basis.clear();
    _basis.set(key, out);
    return out;
}

/** One skill's line: its basis, widened by the items in hand. */
export function skillLine(categoryId, skillId, opts, items = []) {
    const o = lineOpts(categoryId, skillId, opts);
    if (!o) return null;
    const b = skillLineBasis(categoryId, skillId, opts);
    return nlResolveLine(o, b.nums.concat(items.flatMap((q) => nlLineNumbers(q))), b.hints);
}

/**
 * The ONE line of a page or screen shared by several skills (critic nl-r1 D8). `requests` =
 * [{categoryId, skillId, opts}] of the skills that asked for it; `items` = the generated items it
 * must cover. Returns the resolved spec (with `warn` / `notes`) or null.
 */
export function mergedLine(requests, items = []) {
    const reqs = (requests || []).map((r) => ({ ...r, o: lineOpts(r.categoryId, r.skillId, r.opts) })).filter((r) => r.o);
    if (!reqs.length) return null;
    if (reqs.length === 1) return skillLine(reqs[0].categoryId, reqs[0].skillId, reqs[0].opts, items);
    const bases = reqs.map((r) => skillLineBasis(r.categoryId, r.skillId, r.opts));
    const one = reqs.map((r, k) => nlResolveLine(r.o, bases[k].nums, bases[k].hints));
    const hints = {
        fraction: bases.some((b) => b.hints.fraction),
        decimal: bases.some((b) => b.hints.decimal),
        within: Math.max(0, ...bases.map((b) => Number(b.hints.within) || 0)),
        skip: bases.every((b) => b.hints.skip) && new Set(bases.map((b) => b.hints.step)).size === 1,
        step: bases[0].hints.step,
    };
    // The teacher ranges merge: the union of every skill's own Start / End.
    const froms = reqs.map((r) => r.o.nlFrom).filter((v) => v !== null && v !== undefined);
    const tos = reqs.map((r) => r.o.nlTo).filter((v) => v !== null && v !== undefined);
    const o = Object.assign({}, reqs[0].o, {
        nlFrom: froms.length === reqs.length ? Math.min(...froms) : null,
        nlTo: tos.length === reqs.length ? Math.max(...tos) : null,
        // The finest step any skill needs: a fraction step before a decimal one before a whole one.
        nlStep: (one.find((s) => s.step.kind === 'frac') || one.find((s) => s.step.kind === 'dec') || null)
            ? nlStepName((one.find((s) => s.step.kind === 'frac') || one.find((s) => s.step.kind === 'dec')).step) : reqs[0].o.nlStep,
    });
    const nums = one.flatMap((s) => [{ v: s.from, den: 1 }, { v: s.to, den: 1 }]).concat(bases.flatMap((b) => b.nums), items.flatMap((q) => nlLineNumbers(q)));
    const spec = nlResolveLine(o, nums, hints);
    const kinds = new Set(one.map((s) => s.step.kind));
    const spans = one.map((s) => Math.max(1, s.to - s.from));
    if (kinds.size > 1 || Math.max(...spans) / Math.min(...spans) > 10) {
        const note = 'The sections of this page count on different scales; one number line serves them all, so some ticks are finer or coarser than a section needs. Print the sections on their own pages for a line each.';
        spec.notes = (spec.notes || []).concat(note);
        spec.warn = [spec.warn, note].filter(Boolean).join(' ');
    }
    return spec;
}

/** Where the app keeps a skill's options: the set's per-skill store, else the session's, else the item's. */
export function optionsInUse(categoryId, skillId, fallback = null, q = null) {
    let o = null;
    try { const s = getSetOptions(categoryId, skillId); if (s && Object.keys(s).length) o = s; } catch (e) { o = null; }
    if (!o && fallback && Object.keys(fallback).length) o = fallback;
    if (!o && q && q.skillOptions && Object.keys(q.skillOptions).length) o = q.skillOptions;
    return o || {};
}

/** The band's HTML for a screen host `widthPx` wide, or ''. */
function bandHTML(spec, widthPx) {
    if (!spec) return '';
    const w = Math.max(80, Math.floor((Math.max(240, widthPx) - 24) / PX_PER_MM));
    return refLineHTML(spec, { size: 'L', twin: true, widthMm: w, pxPerMm: PX_PER_MM }).html;
}

/** Put the band in a host element `id` just before `anchor` (created on first use); '' hides it. */
export function mountRefLine(anchor, id, html) {
    if (!anchor || !anchor.parentNode || typeof document === 'undefined') return null;
    let el = document.getElementById(id);
    if (!html) { if (el) el.remove(); return null; }
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'mq-refline-host';
        el.setAttribute('data-mq-refline', '1');
        el.style.cssText = 'background:#fff;color:#000;border:1px solid #000;border-radius:10px;padding:6px 12px 2px;margin:0 auto 10px;max-width:100%;box-sizing:border-box;overflow:hidden;';
    }
    if (el.nextSibling !== anchor) anchor.parentNode.insertBefore(el, anchor);
    el.innerHTML = html;
    return el;
}

/**
 * The category pool (mixed_addition, mixed_subtraction ...) a host is playing, or null (critic
 * nl-r4 D3). A pool's items carry their sub-skill's id, but the teacher set the line on the POOL:
 * paper resolves it from the pool's options, so the screen does too - no line until the pool's
 * own rules allow one (both ends set), then the teacher's ONE line on every question.
 */
export function poolHost(categoryId, skillId) {
    if (!categoryId || !skillId) return null;
    const list = SKILLS[categoryId];
    if (!Array.isArray(list) || !list.some((s) => s && s.v === skillId)) return null;
    return isMixedMetaSkill(skillId) ? { categoryId, skillId } : null;
}

/** Live practice: the skill's line above the practice card (the item on it only widens it). */
export function syncPracticeRefLine(q, { categoryId = '', skillId = '', opts = null } = {}) {
    if (typeof document === 'undefined') return;
    const card = document.getElementById('questionCard');
    if (!card) return;
    const pool = poolHost(categoryId, skillId);
    const cat = pool ? pool.categoryId : (q && q.categoryId) || categoryId;
    const sk = pool ? pool.skillId : (q && (q.requestedSkillId || q.skillId)) || skillId;
    const o = pool ? optionsInUse(cat, sk, opts, null) : optionsInUse(cat, sk, opts, q);
    let html = '';
    // A pool's line is the teacher's, the same on every question: the item never widens it.
    try { html = bandHTML(skillLine(cat, sk, o, q && !pool ? [q] : []), card.clientWidth || 600); } catch (e) { html = ''; }
    const el = mountRefLine(card, 'mqRefLine', html);
    if (el) el.style.width = `${card.offsetWidth || card.clientWidth}px`;
}

/** The online worksheet: one line above the grid, for every skill on the sheet that asked for it. */
export function syncWorksheetRefLine(items, { categoryId = '', skillId = '', opts = null } = {}) {
    if (typeof document === 'undefined') return;
    const grid = document.getElementById('worksheetGrid');
    if (!grid) return;
    const qs = Array.isArray(items) ? items.filter(Boolean) : [];
    // The skills on the sheet, each with the options the app holds for it (critic nl-r1 D1: a
    // panel edit lives in the set's store, not in state.skillOptions).
    const seen = new Map();
    // A category pool's sheet: the pool's one line (its options), as on paper (critic nl-r4 D3).
    const pool = poolHost(categoryId, skillId);
    if (pool) seen.set(`${pool.categoryId}:${pool.skillId}`, { categoryId: pool.categoryId, skillId: pool.skillId, opts: optionsInUse(pool.categoryId, pool.skillId, opts, null) });
    if (!pool) for (const q of qs) {
        const cat = q.categoryId || categoryId, sk = q.requestedSkillId || q.skillId || skillId;
        const k = `${cat}:${sk}`;
        if (!seen.has(k)) seen.set(k, { categoryId: cat, skillId: sk, opts: optionsInUse(cat, sk, qs.length && seen.size === 0 ? opts : null, q) });
    }
    if (!seen.size && categoryId && skillId) seen.set(`${categoryId}:${skillId}`, { categoryId, skillId, opts: optionsInUse(categoryId, skillId, opts) });
    let html = '';
    try { html = bandHTML(mergedLine([...seen.values()], pool ? [] : qs), grid.clientWidth || 600); } catch (e) { html = ''; }
    mountRefLine(grid, 'mqWsRefLine', html);
}

/** The option panel: the warning, and the resolved line for the summary. */
export function numberLineCoverWarning(categoryId, skillId, opts) {
    const spec = skillLine(categoryId, skillId, opts);
    return spec ? (spec.warn || '') : '';
}
function numberLinePanelInfo(categoryId, skillId, opts) {
    const spec = skillLine(categoryId, skillId, opts);
    if (!spec) {
        let why = '';
        try { const o = normalizeOptions(categoryId, skillId, opts || {}); why = o && o.nlOn ? numberLineBlocked(categoryId, skillId, o) : ''; } catch (e) { why = ''; }
        return { warn: why, summary: why ? 'On · not drawn (see below)' : numberLineSummary(opts || {}) };
    }
    return { warn: spec.warn || '', summary: numberLineSummary(opts || {}, spec) };
}
setNumberLineCoverCheck(numberLinePanelInfo);
