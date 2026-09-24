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
} from './compose.js';

export const ROLE_ID = 'word-problems';
const PER_PAGE = { S: 3, M: 2, L: 2 };

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
    const label = num ? ans.slice(num.length).trim() : '';
    const key = slotKey({ 'wp-num': num || ans, 'wp-label': label }, ans);
    const render = (c, o = {}) => {
        const top = story
            ? `<div class="ws-story mq-wpstory">${storyLines(q.printText || q.text).map((l) => `<div>${esc(l)}</div>`).join('')}</div>`
            : `<div class="mq-wpcell">${it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { cols: 1 }))}</div>`;
        return `<div class="mq-wp">${top}`
            + `<div class="mq-wpwork"><span class="mq-zonelabel">Work space</span></div>`
            + `<div class="mq-wpanswer"><span class="mq-ansslot">${blank({ id: 'wp-num', kind: 'number', shape: 'line', digits: 4 }, c, key)}<small>number</small></span>`
            + `<span class="mq-ansslot">${blank({ id: 'wp-label', kind: 'text', shape: 'line', widthMm: 40 }, c, key)}<small>label</small></span></div>`
            + `</div>`;
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
