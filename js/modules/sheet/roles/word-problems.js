// js/modules/sheet/roles/word-problems.js
// WORD PROBLEMS (design/PAGE_TYPES.md 3.7), version 2: two per page, faded. Each problem is
//
//   story      the story, one sentence per line (PT-WPR-3), in a square-cornered story box
//              (no rounded card chrome on paper - 2026-09-25 re-grade)
//   work       an open picture / work space the pupil draws or writes in, framed with a hairline
//              and captioned "work space"; on the key it shows the number sentence
//   answer     one answer row: a number box and a label line, captioned "number" and "label"
//              (the only scored place, PT-WPR-8), the label pre-filled on the key
//
//   Who        STORY skills only: a provider that supplies `stories(q, {seed})` (SCC 3.8), or a
//              word-problem generator (the item's own story text). A non-story skill is `unsupported` with its
//              reason - pasting a bare cell under "Write the number and the label" is not a word
//              problem page (PAGE_TYPES 10: the neutral story frame needs a declared unit word)
//   Density    1 column always (PT-WPR-1); 2 per page at every size (12.1, v2)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems, labelStyleOf,
    resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, esc, blank, slotKey,
    slotOnly, operandsOf, opOf, opGlyphOf,
} from './compose.js';
import { getProvider } from '../index.js';

export const ROLE_ID = 'word-problems';
// WORKSHEET_DESIGN_STANDARD 12.1: word problem v2 (faded) prints 2 per page at every size.
const PER_PAGE = { S: 2, M: 2, L: 2 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

/** Is this item a story from a word-problem generator? (its print format or its skill id) */
export const isStory = (it) => {
    const q = it.q || {};
    const f = String(q.printFormat || '');
    const text = plainText(q.printText || q.text);
    const looksLikeStory = /[a-z]{3,}.*[.!]\s+.*\?\s*$/i.test(text) || text.split(/\s+/).length >= 8;
    return (/word/.test(f) || /_wp_|_wp$|word/.test(String(q.skillId || ''))) && looksLikeStory;
};

const plainText = (text) => String(text || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/**
 * The provider's story for one item (SCC 3.8 / SCC-P19): `stories(q, {seed})` -> Story | null,
 * carrying THIS item's numbers, one sentence per line, with the answer's number and the unit word
 * that agrees with it. null when the skill has no `stories` or the item cannot carry one.
 */
export function providerStory(it, seed) {
    const q = it.q || {};
    let p = null;
    try { p = getProvider(q.categoryId || '', q.skillId || ''); } catch (e) { p = null; }
    if (!p || typeof p.stories !== 'function' || !Array.isArray(p.real) || !p.real.includes('stories')) return null;
    let st = null;
    try { st = p.stories(q, { seed }); } catch (e) { st = null; }
    if (!st || typeof st !== 'object') return null;
    const lines = Array.isArray(st.sentences) && st.sentences.length ? st.sentences
        : [...(Array.isArray(st.lines) ? st.lines : []), st.question].filter(Boolean);
    const num = st.ans !== undefined && st.ans !== null ? String(st.ans) : '';
    if (!lines.length || !/^-?[\d,.]+$/.test(num)) return null;
    return { lines: lines.map(String), num, label: String(st.label || ''), equation: String(st.equation || '') };
}

/**
 * The story of an item: the provider's story first (its grammar is built in), else the
 * word-problem generator's own text; null for a non-story item.
 */
export function storyOf(it, seed) {
    const own = providerStory(it, seed);
    if (own) return own;
    if (!isStory(it)) return null;
    const q = it.q || {};
    const text = plainText(q.printText || q.text);
    const ans = answerOf(it) || (it.key && it.key.display !== undefined ? String(it.key.display) : '');
    const num = (/^-?[\d,.]+/.exec(ans) || [''])[0];
    if (!num) return null;
    // The label word: the answer's own unit when it carries one, else the noun of the question
    // ("How many apples ...?"), which is the word a pupil is asked to write.
    const asked = /how many\s+(?:more\s+|fewer\s+|less\s+)?([a-z]+)/i.exec(text);
    const label = ans.slice(num.length).trim() || (asked ? asked[1].toLowerCase() : '');
    const ops = operandsOf(q);
    const glyph = opGlyphOf(opOf(q));
    return { lines: storyLines(text), num, label, equation: ops.length >= 2 && glyph ? `${ops[0]} ${glyph} ${ops[1]} = ${num}` : '' };
}

/** One sentence per line (PT-WPR-3). */
function storyLines(text) {
    return plainText(text).split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

export function prepare(it, info = {}) {
    const st = storyOf(it, ((Number(info.seed) || 0) + (Number(info.index) || 0) * 7919) >>> 0);
    if (!st) return null;                                    // not a story: see supports()
    const { num, label } = st;
    const key = slotKey({ 'wp-num': num, 'wp-label': label }, label ? `${num} ${label}` : num);
    const digits = Math.max(2, Math.min(6, num.replace(/[^0-9]/g, '').length || 2));
    const render = (c) => {
        const answered = c.state === 'answered';
        const numW = Math.max({ S: 22, M: 26, L: 30 }[c.size] || 30, digits * ({ S: 6, M: 7, L: 8 }[c.size] || 8) + 6);
        return `<div class="mq-wp mq-wp2">`
            + `<div class="ws-story mq-wpstory">${st.lines.slice(0, 6).map((l) => `<div>${esc(l)}</div>`).join('')}</div>`
            + `<div class="mq-wpspace"><small>work space</small>${answered && st.equation ? `<b class="mq-wpsentence" data-ws-ink="solid">${esc(st.equation)}</b>` : ''}</div>`
            + `<div class="mq-wpanswer">`
            + `<span class="mq-ansslot">${blank({ id: 'wp-num', kind: 'number', shape: 'box', widthMm: numW }, c, slotOnly(key, 'wp-num'))}<small>number</small></span>`
            + `<span class="mq-ansslot">${blank({ id: 'wp-label', kind: 'text', shape: 'line', widthMm: { S: 40, M: 46, L: 52 }[c.size] || 52 }, c, slotOnly(key, 'wp-label'))}<small>label</small></span>`
            + `</div></div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, visual: false,
        footprint: { measure: true, hMm: null, maxCols: 1, size: 'spacious' },
        fclass: 'word', story: true, legacy: false, template: 'word', cellCls: [it.cellCls || '', 'mq-wpcellbox'].join(' ').replace(/\bmq-legacy\b/g, '').trim(),
    });
}

/** Word problems need stories (PAGE_TYPES 3.7 / 10). */
export function supports(items) {
    if (!items.length) {
        return 'Word problems need a story skill (a word-problem generator or provider stories). '
            + 'This skill has no stories yet: use the Independent page, or a word-problem skill of the same operation.';
    }
    return null;
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1', score: 1 });
    return resolveSectionLayout({
        role: ROLE_ID, columns: 1, count: items.length,
        target: { cols: 1, rows: PER_PAGE }, ceiling: PER_PAGE, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: items.length });
    const grid = gridPart(items.map((it) => planItem(it, { cols: 1 })), { cols: 1, rows: items.length, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (items.length === L.rows) { grid.cls = ''; grid.height = ''; }
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('story-v2'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, stories: items.length, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, isStory, storyOf };
