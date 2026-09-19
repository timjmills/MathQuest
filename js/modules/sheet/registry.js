// js/modules/sheet/registry.js
// The cell-template registry (SKILL_CELL_CONTRACT.md section 2).
//
// A template draws ONE problem's inner HTML and nothing else: no border, no label, no skill
// name, no instruction, no level, no grade (SCC-T5). Ids are lower-case kebab and PERMANENT,
// because saved quizzes store them in IndexedDB (SCC-T1).
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

import { resolveCtx } from './tokens.js';
import { esc, blank } from './cell.js';

/** @type {Map<string, CellTemplate>} */
const TEMPLATES = new Map();

/**
 * @typedef {Object} CellTemplate
 * @property {(payload: Object, ctx: Object) => string} render      inner HTML only
 * @property {(payload: Object) => Object} [answerKey]
 * @property {(payload: Object, ctx: Object) => Object} [footprint]
 * @property {(payload: Object, ctx: Object) => Object[]} [inputs]
 * @property {(payload: Object) => Object} [layout]
 * @property {(payload: Object, fromV: number) => Object} [migrate]
 * @property {string[]} [states]
 */

/**
 * Register a cell template. Registering the same id twice throws (SCC-T2): registration
 * happens once, at module load of `cells/*.js`.
 */
export function register(id, template) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id)) {
        throw new Error(`registerCell: "${id}" is not a lower-case kebab template id`);
    }
    if (TEMPLATES.has(id)) throw new Error(`registerCell: "${id}" is already registered`);
    if (!template || typeof template.render !== 'function') {
        throw new Error(`registerCell: "${id}" has no render()`);
    }
    TEMPLATES.set(id, Object.assign({ id, states: ['blank', 'traced', 'answered', 'wrong'] }, template));
    return TEMPLATES.get(id);
}
export { register as registerCell };

/** SCC-T: throws on an unknown id. Callers that must not throw use renderCell(). */
export function getCell(id) {
    const t = TEMPLATES.get(id);
    if (!t) throw new Error(`getCell: unknown cell template "${id}"`);
    return t;
}
export const hasCell = (id) => TEMPLATES.has(id);
export const listCells = () => [...TEMPLATES.keys()].sort();

/**
 * The fallback. An unknown template id NEVER throws out of renderCell: a saved quiz written by
 * a newer build, or a skill whose family has not been migrated yet, still draws something
 * honest - the question text and one answer line.
 */
export const FALLBACK = {
    id: 'fallback',
    render(p, ctx) {
        const text = p && (p.text || p.label) ? String(p.text || p.label) : '';
        const slot = blank({ id: 'answer', kind: 'text', shape: 'line', digits: 3, graded: true, order: 0 }, ctx,
            p && p.ans !== undefined ? p.ans : null);
        return `<div class="ws-fallback" data-ws-fallback="1">${text ? `<span class="ws-fallback-text">${esc(text)}</span>` : ''}${slot}</div>`;
    },
    answerKey(p) {
        const v = p && p.ans !== undefined ? p.ans : '';
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint() { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs() { return [{ id: 'answer', kind: 'text', shape: 'line', graded: true, order: 0, scopes: ['full', 'answer-only'] }]; },
};

/** The template for an id, or the fallback. Never throws. */
export function resolveTemplate(id) {
    return TEMPLATES.get(id) || FALLBACK;
}

/**
 * The payload a template should be handed for this question.
 *
 * Normally that is `q.cell.payload`, which is plain data (SCC-Q3). The ONE exception is the
 * `legacy` template (SCC-Q5), whose payload is the whole legacy problem object: it is resolved
 * LAZILY through the template's own `fromQuestion(q)` hook, so nothing is duplicated in the
 * question and a saved quiz never stores the object twice.
 *
 * Also handles the schema migration (SCC-Q6) and the fallback's read of `q.text` / `q.ans`.
 */
function payloadFor(tpl, q, spec) {
    let payload = spec.payload;
    if ((payload === null || payload === undefined) && typeof tpl.fromQuestion === 'function' && q) {
        try { payload = tpl.fromQuestion(q); } catch (e) { payload = null; }
    }
    if (payload === null || payload === undefined) payload = {};
    if (tpl.migrate && spec.v !== undefined && spec.v !== 1) {
        try { payload = tpl.migrate(payload, spec.v) || payload; } catch (e) { /* keep the raw payload */ }
    }
    if (tpl === FALLBACK && q && !q.cell) payload = q;
    if (tpl === FALLBACK && q && q.cell && q.text !== undefined) payload = Object.assign({ text: q.text, ans: q.ans }, payload);
    return payload;
}

/**
 * Draw one question's inner HTML.
 * Accepts either a question object (`q.cell = {template, payload, v}`) or a bare
 * `{template, payload}`. Unknown ids fall back (never throw).
 */
export function renderCell(q, ctx = {}) {
    const c = ctx && ctx.metrics ? ctx : resolveCtx(ctx);
    const spec = (q && q.cell) || q || {};
    const tpl = resolveTemplate(spec.template);
    const payload = payloadFor(tpl, q, spec);
    try {
        return tpl.render(payload, c);
    } catch (e) {
        return FALLBACK.render({ text: (q && q.text) || '' }, c);
    }
}

/** The answer key for one question, through its template. Never throws. */
export function cellAnswerKey(q) {
    const spec = (q && q.cell) || q || {};
    const tpl = resolveTemplate(spec.template);
    const payload = payloadFor(tpl, q, spec);
    try {
        return (tpl.answerKey || FALLBACK.answerKey).call(tpl, payload);
    } catch (e) {
        return FALLBACK.answerKey({ ans: q && q.ans });
    }
}

/** The footprint for one question, through its template. Never throws. */
export function cellFootprint(q, ctx = {}) {
    const c = ctx && ctx.metrics ? ctx : resolveCtx(ctx);
    const spec = (q && q.cell) || q || {};
    const tpl = resolveTemplate(spec.template);
    try {
        return (tpl.footprint || FALLBACK.footprint).call(tpl, payloadFor(tpl, q, spec), c);
    } catch (e) {
        return FALLBACK.footprint();
    }
}

/**
 * The cell class and custom properties a template asks its CELL to carry - the fact ladder's
 * point size, a cell padding. Templates that need nothing return empty strings. Never throws.
 */
export function cellGridItem(q, ctx = {}) {
    const c = ctx && ctx.metrics ? ctx : resolveCtx(ctx);
    const spec = (q && q.cell) || q || {};
    const tpl = resolveTemplate(spec.template);
    if (typeof tpl.gridItem !== 'function') return { cls: '', style: '' };
    try { return tpl.gridItem(payloadFor(tpl, q, spec), c) || { cls: '', style: '' }; } catch (e) { return { cls: '', style: '' }; }
}

/** The slots one question draws, filtered by its response scope (SCC-T13). Never throws. */
export function cellInputs(q, ctx = {}) {
    const c = ctx && ctx.metrics ? ctx : resolveCtx(ctx);
    const spec = (q && q.cell) || q || {};
    const tpl = resolveTemplate(spec.template);
    const scope = (q && q.responseScope) || 'full';
    let slots;
    try { slots = (tpl.inputs || FALLBACK.inputs).call(tpl, payloadFor(tpl, q, spec), c) || []; } catch (e) { slots = []; }
    return slots.filter((s) => !s.scopes || s.scopes.includes(scope));
}

/**
 * Which templates exist, and which skills still fall back.
 * @param {Array<string|{key?: string, template?: string}>} [skillKeys]
 *        'categoryId:skillId' strings, or rows carrying the template a skill asks for.
 * @returns {{templates: string[], skills: Object, missing: string[], covered: number, total: number}}
 */
export function coverage(skillKeys = []) {
    const templates = listCells();
    const skills = {};
    const missing = [];
    let covered = 0;
    for (const row of skillKeys) {
        const key = typeof row === 'string' ? row : (row && row.key) || '';
        const wanted = typeof row === 'string' ? undefined : row && row.template;
        const id = wanted || 'legacy';
        const known = TEMPLATES.has(id);
        skills[key] = { template: id, isLegacy: id === 'legacy', registered: known, defaults: known ? [] : ['render'] };
        if (known && id !== 'legacy') covered++; else missing.push(key);
    }
    return { templates, skills, missing, covered, total: skillKeys.length };
}

/** Test seam only: drop every registration. Never called by app code. */
export function __resetRegistry() { TEMPLATES.clear(); }
