// js/modules/sheet/roles/reason-it.js
// REASON IT (design/PAGE_TYPES.md 6.2), format "Which is correct" - the format the default
// adapters cover for every skill (section 10): two finished solutions labelled "A" and "B"
// (never named characters, P-TH-14), side by side at the same size; one shows the right answer,
// the other the misconception behind `wrongAnswer(q)`. The pupil circles A or B and completes
// "The answer is __ ." once (PT-RSN-4, lead ruling F8 2026-11-13).
//
//   Grid       1 column x 4 / 3 / 2 rows (S / M / L), the ceiling of PT-RSN-1
//   Title      "Reason It" (HD-13); tab "Reason It A"; letters from a.; Score /N
//   Key        the right letter ringed (AK-2), the answer frame written in
//
// An item whose answer has no wrong answer cannot make an A / B pair: `prepare` returns null
// and the host deals another item. Spot the mistake, odd one out and always / sometimes / never
// need provider members (`workedSteps` with marks, property tags, `claims[]`) and are not built
// here yet.
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, blank, writeLine, slotKey, rng, deriveSeed, wrongPattern, answerPlace, answerPlaceHtml, answerFrameCls,
} from './compose.js';

export const ROLE_ID = 'reason-it';
const ROWS = { S: 4, M: 3, L: 2 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

const TRUE_W = new Set(['equation', 'stack', 'word-work']);

export function prepare(it, info = {}) {
    const correct = answerOf(it);
    const wrong = correct ? wrongOf(it) : null;
    if (!wrong) return null;
    // Which letter holds the right answer is a seeded half-and-half pattern over the page
    // (`wrongFlags`, handed in as `info.wrong`), so there is no A / B tell to learn.
    const aRight = info.wrong !== undefined ? !!info.wrong : rng(deriveSeed(info.seed === undefined ? 0 : info.seed, ROLE_ID, info.index || 0))() < 0.5;
    const right = aRight ? 'A' : 'B';
    // the answer frame's place (ws-roles-unit KEYJOIN-ROLE): one line, one a part of a list, none for a sentence answer
    const place0 = answerPlace('ri-ans', correct, it, [wrong.value]);
    const place = place0.kind === 'list' && !place0.words ? { kind: 'none', slots: {}, parts: null } : place0;
    // (lead ruling F8, 2026-11-13: the pupil circles A or B and writes the answer ONCE - "__ is correct." asked the same choice a
    // second time; PT-RSN-4 "Circle A or B. The answer is __.")
    const key = slotKey(Object.assign({ 'ri-a': aRight ? 'A' : '', 'ri-b': aRight ? '' : 'B' }, place.slots), `${right}: ${correct}`);
    // (a sentence-layout story - word-work `layout: 'sentence'` - is a story over a number sentence 60+ mm wide: in a
    // third of the row its frame ran over the A panel's border; critic visual-quality r2 N4. It takes the wide form
    // below, B under A, drawn as a half-page column so its unit word still sits beside the box; the story once on top)
    const pl = (it.q && it.q.cell && it.q.cell.payload) || {};
    const sentence = it.template === 'word-work' && pl.layout === 'sentence';
    // (a column story - word-work's default layout - prints its story once too: twice, in two half-width panels, the work
    // ran out of the cell; word-stories critic r1 F2)
    const column = it.template === 'word-work' && !pl.layout && !pl.pic;
    // (a sentence story prints ONCE, over both panels; each panel holds its number sentence only - critic r3 N12: a
    // panel that repeated the story held one item a page at L. `noFrame` + `bar: false`: the story with no work zone)
    // the WRONG panel draws with the wrong answer's own slots (its sign, its numbers), as Error Analysis does: given only the value,
    // a word-work story printed an "added" wrong answer under the item's minus sign (11 - 2 = 13; lf-builds via the lead, SIGNMATCH)
    const wrongSlots = wrong.slots && typeof wrong.slots === 'object' ? wrong.slots : null;
    const work = (c, o, v, slots) => it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, { cols: sentence || column ? 2 : 3, shown: v, prompt: false }, slots ? { shownSlots: slots } : {}, sentence || column ? { payload: { noStory: true } } : {}));
    const story = (c) => (sentence || column ? `<div class="mq-abstory" style="margin-bottom:3mm;">${it.render(Object.assign({}, c, { state: 'blank' }), { cols: 2, prompt: false, payload: column ? { storyOnly: true } : { noFrame: true, bar: false } })}</div>` : '');
    // A worked line wider than half the room beside the response (an across "72 ÷ 9 = 8" at L:
    // div_facts' Standard form, critic R1 follow-up) puts B UNDER A, so neither runs out of its
    // box; the response column stays beside both.
    // (any template, lead ruling 2026-11-13: work wider than half the room stacks A over B, never shrinks - a word story's
    // column work, 6-digit compare numbers; the skill's footprint carries its true width)
    // `footprint.inkWMm` is a template's true work width (pv supplies it); equation / stack / word-work footprints are their
    // true width already, other templates' wMm carries slack (a pv item at 70 mm fits a 62 mm panel)
    const fp = it.footprint || {};
    const workW = Number(fp.inkWMm) || (TRUE_W.has(it.template) ? Number(fp.wMm) || 0 : 0);
    // Three layouts (critic r6c D1 / D3): beside (A | B | response) when the work fits half of the room left of the response
    // column; UNDER (A | B side by side at half the cell each, the response a full-width row under them) when it fits half the
    // cell; STACKED (A over B, the response beside, top start) only when it does not. The sentence story and the across
    // equation keep their stacked layout (passed pages).
    const halfBeside = (LIVE_W_MM - 52 - 10) / 2;
    const halfCell = (LIVE_W_MM - 5) / 2 - 4;
    // (a sentence story is a story too: its number sentence fits half the cell, so it lays out like a column story - it stacked,
    // and add_wp_10's picture story printed one a page at every size: ws-cell-checks LONE-PAGE)
    const story1 = sentence || column;
    const legacy = it.template === 'equation' && workW > halfBeside;
    const under = !legacy && (story1 ? true : workW > halfBeside && workW <= halfCell);
    const wide = legacy || (!under && workW > halfBeside);
    const at = (col, row) => (wide ? ` style="grid-column:${col};grid-row:${row}"` : '');
    // the A / B block centres in a cell its row stretches (the cell is 57 / 76 / 113.5 mm by PT-RSN-1 whatever the problem's
    // height): the white splits above and below, never one band under short work (critic r1/r2 R11; owner CL-4b, 2026-11-12)
    const abStyle = under ? 'margin-top:auto;margin-bottom:auto;grid-template-columns:1fr 1fr;row-gap:4mm'
        : wide ? `${legacy ? 'margin-top:auto;margin-bottom:auto' : 'margin-top:0;margin-bottom:auto'};grid-template-columns:1fr minmax(52mm,auto);row-gap:3mm`
            : 'margin-top:auto;margin-bottom:auto';
    const respStyle = under ? 'grid-column:1 / -1;flex-direction:row;align-items:center;justify-content:center;gap:10mm'
        : wide ? 'grid-column:2;grid-row:1 / 3;justify-content:flex-start' : 'justify-content:flex-start';
    // (UNDER, the response row centres under the pair - critic r6d N1. A column STORY puts the response BESIDE the story instead:
    // the story takes two thirds of the line, and the row under the panels held a Grade 2 story to one item a page at L, critic
    // r6d D1 - the panels then follow both)
    const topResp = under && story1;
    const resp = (c) => `<div class="mq-abresp" style="${topResp ? 'flex:none;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:3mm' : respStyle}">`
        + `<div class="mq-abchoice">${blank({ id: 'ri-a', kind: 'choice', shape: 'choice', text: 'A' }, c, key)}${blank({ id: 'ri-b', kind: 'choice', shape: 'choice', text: 'B' }, c, key)}</div>`
        + (place.kind !== 'one' ? '' : `<div class="${answerFrameCls(place, 56)}">The answer is ${answerPlaceHtml(place, 'ri-ans', c, key)}.</div>`)
        + `</div>`;
    const head = (c) => (topResp ? `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6mm;margin-bottom:3mm"><div style="flex:1 1 auto;min-width:0">${story(c).replace('margin-bottom:3mm;', '')}</div>${resp(c)}</div>` : story(c));
    const render = (c, o = {}) => head(c) + `<div class="mq-ab" style="${abStyle}">`
        + `<div class="mq-abbox"${at(1, 1)}><span class="mq-abtag">A</span>${work(c, o, aRight ? correct : wrong.value, aRight ? null : wrongSlots)}</div>`
        + `<div class="mq-abbox"${at(1, 2)}><span class="mq-abtag">B</span>${work(c, o, aRight ? wrong.value : correct, aRight ? wrongSlots : null)}</div>`
        // the frames sit just under the A / B ring, not spread to the cell's foot (critic r1/r2 R10: "__ is correct." ~300 px under
        // the ring in a mostly empty column); inline, so only Reason It pages change
        + (topResp ? '' : resp(c))
        // a unit-form answer ("[2] hundreds [9] tens [7] ones") is wider than the response column: its frame is a full-width
        // row under A and B (in the column it wrapped to three lines and cost the page an item at S: ws-capacity-pin 4 -> 3)
        // every LIST frame too (critic r3 D1 / D5: in the 56 mm column a 5-part list wrapped a blank a line and "Rule: subtract __
        // each time" ran out of the cell, costing the page an item); the row wraps at the cell's full width
        // a unit form keeps its frame, full width under A and B; a LIST (pattern terms, table outputs) prints none: the panel the
        // pupil circles already holds every part, so the frame only made them copy it (H16) and, at 5-6 parts,
        // cost the page an item or ran out of the cell (critic r3 D1 / D2 / D5; PT-TOF-4 extended to Reason It lists)
        + (place.kind === 'list' && place.words ? `<div class="mq-frame" style="grid-column:1 / -1;padding-left:2mm">The answer is ${answerPlaceHtml(place, 'ri-ans', c, key)}</div>` : '')
        + `</div>`;
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true,
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: 1 }),
        fclass: 'standard', thinking: { correct, wrong: wrong.value, right },
        cellCls: [it.cellCls || '', 'mq-thinkcell'].join(' ').trim(),
    });
}

function layout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Reason It A', title: 'Reason It', score: 1 });
    return resolveSectionLayout({
        role: ROLE_ID, columns: 1, count: items.length,
        target: { cols: 1, rows: ROWS }, ceiling: ROWS, floor: (input.floors || {}).main,
    }, items, ctx.paper, LIVE_W_MM, { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) });
}

export const counts = (pools, input) => ({ main: layout(pools.main || [], input).perPage });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const L = layout(all, input);
    const items = all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Reason It A', title: 'Reason It', score: items.length });
    const rows = Math.max(1, items.length);
    const grid = gridPart(items.map((it) => planItem(it, { cols: 1 })), { cols: 1, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('which'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, format: 'which-is-correct', fits: [Object.assign({}, L, { line: fitsLine(L) })], notes: L.note ? [L.note] : [] },
    });
}

/** Items whose right answer is A: a seeded 40-60% pattern over the page. */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, wrongFlags };
