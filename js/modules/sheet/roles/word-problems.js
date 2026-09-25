// js/modules/sheet/roles/word-problems.js
// WORD PROBLEMS (design/PAGE_TYPES.md 3.7), version 2: two per page, faded - a rounded story box,
// an open work zone with an equation line, and an answer row of a number blank plus a label
// blank. Problems are lettered through the set; Score is one point per problem (PT-WPR-8).
//
//   Story skills   the story is the question's own text, one sentence per line (PT-WPR-3)
//   Other skills   "a non-story skill ... the role prints the skill's cell inside the band"
//                  (section 10): the skill's cell sits where the story would, with the same work
//                  zone and answer row
//   Density        1 column always (PT-WPR-1); 3 / 2 / 2 per page at S / M / L (v2 at M and L,
//                  bands at S), fewer when the story is taller than the band
//   Key            the answer row filled; the work zone left open (working varies)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems, labelStyleOf,
    resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, esc, blank, slotKey,
    slotOnly, operandsOf, opOf, opGlyphOf,
} from './compose.js';

export const ROLE_ID = 'word-problems';
// WORKSHEET_DESIGN_STANDARD 12.1: word problem v2 (faded) prints 2 per page at every size.
const PER_PAGE = { S: 2, M: 2, L: 2 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

/** Is this a story item? (a word-problem print format or the spacious size class) */
export const isStory = (it) => {
    const q = it.q || {};
    const f = String(q.printFormat || '');
    return /word/.test(f) || /_wp_|word/.test(String(q.skillId || '')) || (it.footprint && it.footprint.size === 'spacious');
};

/** One sentence per line (PT-WPR-3). */
function storyLines(text) {
    const plain = String(text || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    return plain.split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

export function prepare(it) {
    const q = it.q || {};
    const story = isStory(it);
    const ans = answerOf(it) || (it.key && it.key.display !== undefined ? String(it.key.display) : '');
    const num = (/^-?[\d,.]+/.exec(ans) || [''])[0];
    // The label word: the answer's own unit when it carries one, else the noun of the question
    // ("How many apples ...?"), which is the word a pupil is asked to write.
    const asked = /how many\s+([a-z]+)/i.exec(String(q.printText || q.text || '').replace(/<[^>]*>/g, ' '));
    const label = (num ? ans.slice(num.length).trim() : '') || (story && asked ? asked[1].toLowerCase() : '');
    // The equation frame is written too on the key when the story's numbers and operation are
    // known (a + b = c): a key shows what the pupil writes, not only the final answer (PT-KEY-1).
    const ops = operandsOf(q);
    const glyph = opGlyphOf(opOf(q));
    const eq = story && ops.length >= 2 && glyph && num ? { 'wp-a': ops[0], 'wp-op': glyph, 'wp-b': ops[1], 'wp-c': num } : {};
    const key = slotKey(Object.assign({ 'wp-num': num || ans, 'wp-label': label }, eq), ans);
    const digits = Math.max(2, Math.min(6, (num || ans).replace(/[^0-9]/g, '').length || 2));
    // 07-D mock-up: the answer row (a number line of B(n) and a long label line, each captioned)
    // sits inside the story box at its foot; under the box, an open equation frame
    // (line, sign circle, line = line) and the rest of the cell is open working room.
    const answerRow = (c) => `<div class="mq-wpanswer">`
        + `<span class="mq-ansslot">${blank({ id: 'wp-num', kind: 'number', shape: 'line', digits }, c, slotOnly(key, 'wp-num'))}<small>number</small></span>`
        + `<span class="mq-ansslot">${blank({ id: 'wp-label', kind: 'text', shape: 'line', widthMm: { S: 40, M: 46, L: 52 }[c.size] || 52 }, c, slotOnly(key, 'wp-label'))}<small>label</small></span></div>`;
    const eqFrame = (c) => `<div class="mq-frame">${blank({ id: 'wp-a', kind: 'number', shape: 'line', digits, graded: false }, c, slotOnly(key, 'wp-a'))}`
        + `${blank({ id: 'wp-op', kind: 'sign', shape: 'circle', graded: false }, c, slotOnly(key, 'wp-op'))}`
        + `${blank({ id: 'wp-b', kind: 'number', shape: 'line', digits, graded: false }, c, slotOnly(key, 'wp-b'))}<span>=</span>`
        + `${blank({ id: 'wp-c', kind: 'number', shape: 'line', digits, graded: false }, c, slotOnly(key, 'wp-c'))}</div>`;
    const render = (c, o = {}) => {
        const top = story
            ? `<div class="ws-story mq-wpstory">${storyLines(q.printText || q.text).map((l) => `<div>${esc(l)}</div>`).join('')}${answerRow(c)}</div>`
            // Section 10: a non-story skill prints its own cell inside the band, answered in its
            // own slot on the key; the number / label row belongs to stories only.
            : `<div class="mq-wpcell">${it.render(c, Object.assign({}, o, { cols: 1 }))}</div>`;
        return `<div class="mq-wp">${top}<div class="mq-wpwork">${story ? eqFrame(c) : ''}</div></div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, visual: !story && !!it.visual,
        footprint: { measure: true, hMm: null, maxCols: 1, size: 'spacious' },
        fclass: 'word', story, cellCls: [it.cellCls || '', 'mq-wpcellbox'].join(' ').trim(),
    });
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
    const stories = items.filter((it) => it.story).length;
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('story-v2'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, stories, fits: [Object.assign({}, L, { line: fitsLine(L) })],
            notes: [L.note, stories < items.length ? 'Not a story skill: the skill\'s own cell prints in the word-problem band.' : ''].filter(Boolean) },
    });
}

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, isStory };
