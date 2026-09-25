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
//   Density    1 column always (PT-WPR-1); up to 3 per page while the measured story fits
//   Model      a skill with a named model (area model, number line, counters, long division)
//              draws it in the work space, blank on the pupil page and worked on the key
//   Variety    the provider rotates templates and nouns by the item's place on the page
//   K          a Kindergarten story prints its label word; the pupil writes the number only
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems, labelStyleOf,
    resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, esc, blank, slotKey,
    slotOnly, operandsOf, opOf, opGlyphOf,
} from './compose.js';
import { getProvider } from '../index.js';

export const ROLE_ID = 'word-problems';
// WORKSHEET_DESIGN_STANDARD 12.1 prints word problem v2 (faded) 2 per page; critic round 2 found
// 2 stories on a page where 3 fit (C3). Up to 3, while the MEASURED story fits a third of the page.
const PER_PAGE = { S: 3, M: 3, L: 3 };

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
export function providerStory(it, seed, index) {
    const q = it.q || {};
    let p = null;
    try { p = getProvider(q.categoryId || '', q.skillId || ''); } catch (e) { p = null; }
    if (!p || typeof p.stories !== 'function' || !Array.isArray(p.real) || !p.real.includes('stories')) return null;
    let st = null;
    try { st = p.stories(q, { seed, index }); } catch (e) { st = null; }
    if (!st || typeof st !== 'object') return null;
    const lines = Array.isArray(st.sentences) && st.sentences.length ? st.sentences
        : [...(Array.isArray(st.lines) ? st.lines : []), st.question].filter(Boolean);
    const num = st.ans !== undefined && st.ans !== null ? String(st.ans) : '';
    if (!lines.length || !/^-?[\d,.]+$/.test(num)) return null;
    return { lines: lines.map(String), num, label: String(st.label || ''), equation: String(st.equation || ''), k: !!st.k, work: String(st.work || '') };
}

/**
 * The story of an item: the provider's story first (its grammar is built in), else the
 * word-problem generator's own text; null for a non-story item.
 */
export function storyOf(it, seed, index) {
    const own = providerStory(it, seed, index);
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

/**
 * The templates whose cell IS the skill's named model (the area model, the number line, the
 * counters picture, the long-division frame). Their story's work space draws that model.
 */
const MODEL_TEMPLATES = new Set(['area-model', 'number-line', 'counters', 'division']);
/** Is this item's cell the model its story is solved with? (Counters: the take-away picture only -
 *  a grouping picture of 20 counters would leave one story on the page.) */
const hasModel = (it) => MODEL_TEMPLATES.has(it.template) && typeof it.render === 'function'
    && (it.template !== 'counters' || ((((it.q || {}).cell || {}).payload || {}).kind === 'takeaway'));
/**
 * Models wider than the work space beside an answer column: the answer row goes under them.
 * R3 (critic round 3): not long division - its frame is about 60 mm wide, so the answer column
 * stands beside it; under it the story was one to a page with a 30 mm dead band (H5).
 */
const WIDE_MODELS = new Set(['number-line']);

/**
 * A model cell without its own equation row: the story's number box is the one answer place, so
 * the cell's "5 × 149 = [ ]" / "15 + 4 = [ ]" line goes. The row removed is the innermost block
 * that holds the cell's answer slot and no picture; a cell whose answer sits INSIDE the model (the
 * long-division frame's quotient) keeps everything.
 */
export function modelOnly(html, template) {
    if (template === 'division') return html;
    const at = html.search(/data-ws-slot="(?:answer|total)"/);
    if (at < 0) return html;
    const start = html.lastIndexOf('<div', at);
    const end = html.indexOf('</div>', at);
    if (start < 0 || end < 0) return html;
    const seg = html.slice(start, end + 6);
    // The row must be a leaf (no nested block, no picture): otherwise leave the cell whole.
    if (/<svg|<div[\s\S]*<div/.test(seg.slice(4))) return html;
    return html.slice(0, start) + html.slice(end + 6);
}

/** The noun of a story's label, as printed beside a Kindergarten number box. */
const nounOf = (st) => String(st.label || '').trim();

/** One sentence per line (PT-WPR-3). */
function storyLines(text) {
    return plainText(text).split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

export function prepare(it, info = {}) {
    // The K picture word problem (`wordpic` template) IS a word-problem cell: story, countable
    // picture, work box and one number box with its label word. It prints as it is - the role
    // never prints its story a second time.
    // The word-work cell (every whole-number story, owner ruling 2026-09-25) is the page's cell as
    // it is: story, sign row, column boxes and the answer with its unit bank.
    if (it.template === 'word-work') {
        return Object.assign({}, it, {
            render: (c, o = {}) => it.render(c, o),
            measured: null, footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 2 }),
            fclass: 'word', story: true, wordWork: true,
        });
    }
    if (it.template === 'wordpic') {
        return Object.assign({}, it, {
            render: (c, o = {}) => it.render(c, Object.assign({}, o, { cols: 1 })),
            measured: null, footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 1, size: 'spacious' }),
            fclass: 'word', story: true,
        });
    }
    // The page seed and the item's place on the page: the provider rotates its templates and
    // nouns by the place, so one page never repeats "rows of chairs" (critic round 2).
    const st = storyOf(it, (Number(info.seed) || 0) >>> 0, Number(info.index) || 0);
    if (!st) return null;                                    // not a story: see supports()
    const { num, label } = st;
    // A Kindergarten story (`k`): the label is printed beside the box (a word from the story),
    // so the pupil writes only the number (critic round 2: K reading and writing load).
    const kLevel = !!st.k;
    const key = kLevel ? slotKey({ 'wp-num': num }, label ? `${num} ${label}` : num)
        : slotKey({ 'wp-num': num, 'wp-label': label }, label ? `${num} ${label}` : num);
    const digits = Math.max(2, Math.min(6, num.replace(/[^0-9]/g, '').length || 2));
    const model = hasModel(it);
    const render = (c) => {
        const answered = c.state === 'answered';
        const numW = Math.max({ S: 22, M: 26, L: 30 }[c.size] || 30, digits * ({ S: 6, M: 7, L: 8 }[c.size] || 8) + 6);
        // The skill's NAMED model in the work space (critic round 2): the area-model frame, the
        // number line, the picture - drawn by the skill's own cell without its equation row, blank
        // on the pupil page and worked on the key. A story with no model keeps the open space.
        let space = '';
        if (model) {
            let m = '';
            // R3: a take-away picture is drawn uncrossed on the pupil page (the pupil crosses out).
            const mp = it.template === 'counters' ? { payload: { crossOnKey: true } } : {};
            try { m = modelOnly(it.render(c, Object.assign({ cols: 1, prompt: false }, mp)), it.template); } catch (e) { m = ''; }
            if (m) space = `<div class="mq-wpspace mq-wpmodel"><small>work space</small><div>${m}${answered && st.equation ? `<b class="mq-wpsentence" data-ws-ink="solid">${esc(st.work || st.equation)}</b>` : ''}</div></div>`;
        }
        if (!space) space = `<div class="mq-wpspace"><small>work space</small>${answered && st.equation ? `<b class="mq-wpsentence" data-ws-ink="solid">${esc(st.work || st.equation)}</b>` : ''}</div>`;
        const labelPart = kLevel
            ? `<span class="mq-ansslot"><span class="mq-klabel">${esc(nounOf(st))}</span></span>`
            : `<span class="mq-ansslot">${blank({ id: 'wp-label', kind: 'text', shape: 'line', widthMm: { S: 40, M: 46, L: 52 }[c.size] || 52 }, c, slotOnly(key, 'wp-label'))}<small>label</small></span>`;
        return `<div class="mq-wp mq-wp2${kLevel ? ' mq-wpk' : ''}${model && WIDE_MODELS.has(it.template) ? ' mq-wpunder' : ''}">`
            + `<div class="ws-story mq-wpstory">${st.lines.slice(0, 6).map((l) => `<div>${esc(l)}</div>`).join('')}</div>`
            + space
            + `<div class="mq-wpanswer">`
            + `<span class="mq-ansslot">${blank({ id: 'wp-num', kind: 'number', shape: 'box', widthMm: numW }, c, slotOnly(key, 'wp-num'))}<small>number</small></span>`
            + labelPart
            + `</div></div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, visual: false,
        footprint: { measure: true, hMm: null, maxCols: 1, size: 'spacious' },
        fclass: 'word', story: true, kStory: kLevel, legacy: false, template: 'word', cellCls: [it.cellCls || '', 'mq-wpcellbox'].join(' ').replace(/\bmq-legacy\b/g, '').trim(),
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
    // PT-WPR-1 and the 12.1 ceiling (3 / 3 / 4 at L / M / S): one column. The word-work cell reads
    // left to right in it (story and sign row | columns and answer), three stories to a page at L.
    // (On the Independent, Test and Guided pages the same cell stands in 2 columns where it fits.)
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
    const cols = Math.max(1, L.cols || 1);
    const grid = gridPart(items.map((it) => planItem(it, { cols })), { cols, rows: Math.ceil(items.length / cols), cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (Math.ceil(items.length / cols) === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
    // Kindergarten stories print their label: the pupil writes the number only.
    const instr = items.length && items.every((it) => it.wordWork) ? 'story-work'
        : items.length && items.every((it) => it.kStory) ? 'story-k2' : 'story-v2';
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart(instr), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, stories: items.length, fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, isStory, storyOf };
