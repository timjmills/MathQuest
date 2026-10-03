// refline-screen.js — Wave 5.2: the number line at the top of the page, ON SCREEN.  (2026-10-03)
//
// The same drawing as paper (sheet/refline.js), placed ONCE above the practice card and once above
// the online worksheet, in the black-and-white paper look. It is a support option of the skill
// (skill-options.js numberLineOptions): it shows only when the skill's options tick it on. The quiz
// draws no supports (quiz-take.js renders its cells without them), so it shows none there.
//
// The line covers every number the screen uses: the online worksheet's own items; for live
// practice (one item at a time) a seeded sample of the skill with its options, cached, plus the
// item on the card.
//
// Layer 4 (imports generate-question.js, skill-options.js and the kit).

import { generateQuestionFor } from './generate-question.js';
import { normalizeOptions, numberLineFits, numberLineIsFraction } from './skill-options.js';
import { setNumberLineCoverCheck } from './skill-options-ui.js';
import { nlResolveLine, nlLineNumbers, refLineHTML } from './sheet/index.js';

const PX_PER_MM = 3.4;     // the screen twin's scale (k2kit.js --mq-k2)
const SAMPLE = 16;
const _cache = new Map();

/** The numbers a seeded sample of the skill (with these options) uses. Cached. */
export function sampleNumbers(categoryId, skillId, opts) {
    const key = `${categoryId}:${skillId}:${JSON.stringify(opts || {})}`;
    if (_cache.has(key)) return _cache.get(key);
    const out = [];
    for (let i = 0; i < SAMPLE; i++) {
        try { out.push(...nlLineNumbers(generateQuestionFor({ category: categoryId, skill: skillId, opts, seed: 9001 + i, itemIndex: i }))); } catch (e) { /* skip */ }
    }
    if (_cache.size > 60) _cache.clear();
    _cache.set(key, out);
    return out;
}

/** The skill's options normalised, or null when the line is not on for it. */
function lineOpts(categoryId, skillId, opts) {
    if (!categoryId || !skillId || !numberLineFits(categoryId, skillId)) return null;
    let o = null;
    try { o = normalizeOptions(categoryId, skillId, opts || {}); } catch (e) { o = null; }
    return o && o.nlOn ? o : null;
}

/**
 * The band's HTML for a screen host `widthPx` wide, or '' when the skill does not carry the line.
 * `items`: the generated questions the line must cover (the worksheet); otherwise a sample.
 */
export function screenRefLineHTML(categoryId, skillId, opts, { items = null, extra = [], widthPx = 600 } = {}) {
    const o = lineOpts(categoryId, skillId, opts);
    if (!o) return '';
    const nums = (Array.isArray(items) && items.length ? items.flatMap((q) => nlLineNumbers(q)) : sampleNumbers(categoryId, skillId, opts))
        .concat((extra || []).flatMap((q) => nlLineNumbers(q)));
    const spec = nlResolveLine(o, nums, { fraction: numberLineIsFraction(categoryId, skillId) });
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

/** Live practice: the line above the practice card for the item `q` on it. */
export function syncPracticeRefLine(q, { categoryId = '', skillId = '', opts = null } = {}) {
    if (typeof document === 'undefined') return;
    const card = document.getElementById('questionCard');
    if (!card) return;
    const cat = (q && q.categoryId) || categoryId;
    const sk = (q && (q.requestedSkillId || q.skillId)) || skillId;
    const o = (opts && Object.keys(opts).length ? opts : null) || (q && q.skillOptions) || {};
    let html = '';
    // The sample sets the line for the session; the item on the card is always on it too.
    try { html = screenRefLineHTML(cat, sk, o, { extra: q ? [q] : [], widthPx: card.clientWidth || 600 }); } catch (e) { html = ''; }
    const el = mountRefLine(card, 'mqRefLine', html);
    if (el) el.style.width = `${card.offsetWidth || card.clientWidth}px`;
}

/** The online worksheet: the line above the grid, covering every item of the sheet. */
export function syncWorksheetRefLine(items, { categoryId = '', skillId = '', opts = null } = {}) {
    if (typeof document === 'undefined') return;
    const grid = document.getElementById('worksheetGrid');
    if (!grid) return;
    let html = '';
    try { html = screenRefLineHTML(categoryId, skillId, opts, { items, widthPx: grid.clientWidth || 600 }); } catch (e) { html = ''; }
    mountRefLine(grid, 'mqWsRefLine', html);
}

/** The option panel's warning: the teacher's own Start / End miss numbers the skill uses. */
export function numberLineCoverWarning(categoryId, skillId, opts) {
    const o = lineOpts(categoryId, skillId, opts);
    if (!o) return '';
    if ((o.nlFrom === null || o.nlFrom === undefined) && (o.nlTo === null || o.nlTo === undefined)) return '';
    const spec = nlResolveLine(o, sampleNumbers(categoryId, skillId, opts), { fraction: numberLineIsFraction(categoryId, skillId) });
    return spec.warn || '';
}
setNumberLineCoverCheck(numberLineCoverWarning);
