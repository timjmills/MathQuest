// js/modules/sheet/roles/reason-it.js
// REASON IT (design/PAGE_TYPES.md 6.2), format "Which is correct" - the format the default
// adapters cover for every skill (section 10): two finished solutions labelled "A" and "B"
// (never named characters, P-TH-14), side by side at the same size; one shows the right answer,
// the other the misconception behind `wrongAnswer(q)`. The pupil circles A or B and completes
// "__ is correct. The answer is __ ." (PT-RSN-4).
//
//   Grid       1 column x 4 / 3 / 2 rows (S / M / L), the ceiling of PT-RSN-1
//   Title      "Reason It" (HD-13); tab "Reason It A"; letters from a.; Score /N
//   Key        the right letter ringed (AK-2), both frame blanks written in
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

export function prepare(it, info = {}) {
    const correct = answerOf(it);
    const wrong = correct ? wrongOf(it) : null;
    if (!wrong) return null;
    // Which letter holds the right answer is a seeded half-and-half pattern over the page
    // (`wrongFlags`, handed in as `info.wrong`), so there is no A / B tell to learn.
    const aRight = info.wrong !== undefined ? !!info.wrong : rng(deriveSeed(info.seed === undefined ? 0 : info.seed, ROLE_ID, info.index || 0))() < 0.5;
    const right = aRight ? 'A' : 'B';
    // the answer frame's place (ws-roles-unit KEYJOIN-ROLE): one line, one a part of a list, none for a sentence answer
    const place0 = answerPlace('ri-ans', correct, it);
    const place = place0.kind === 'list' && !place0.words ? { kind: 'none', slots: {}, parts: null } : place0;
    const key = slotKey(Object.assign({ 'ri-a': aRight ? 'A' : '', 'ri-b': aRight ? '' : 'B', 'ri-who': right }, place.slots), `${right}: ${correct}`);
    // (a sentence-layout story - word-work `layout: 'sentence'` - is a story over a number sentence 60+ mm wide: in a
    // third of the row its frame ran over the A panel's border; critic visual-quality r2 N4. It takes the wide form
    // below, B under A, drawn as a half-page column so its unit word still sits beside the box; the story once on top)
    const pl = (it.q && it.q.cell && it.q.cell.payload) || {};
    const sentence = it.template === 'word-work' && pl.layout === 'sentence';
    // (a sentence story prints ONCE, over both panels; each panel holds its number sentence only - critic r3 N12: a
    // panel that repeated the story held one item a page at L. `noFrame` + `bar: false`: the story with no work zone)
    // the WRONG panel draws with the wrong answer's own slots (its sign, its numbers), as Error Analysis does: given only the value,
    // a word-work story printed an "added" wrong answer under the item's minus sign (11 - 2 = 13; lf-builds via the lead, SIGNMATCH)
    const wrongSlots = wrong.slots && typeof wrong.slots === 'object' ? wrong.slots : null;
    const story = (c) => (sentence ? `<div class="mq-abstory" style="margin-bottom:3mm;">${it.render(Object.assign({}, c, { state: 'blank' }), { cols: 2, prompt: false, payload: { noFrame: true, bar: false } })}</div>` : '');
    // A worked line wider than half the room beside the response (an across "72 ÷ 9 = 8" at L:
    // div_facts' Standard form, critic R1 follow-up) puts B UNDER A, so neither runs out of its
    // box; the response column stays beside both.
    // (lane lf-ops critic r1 D-MP-4 / D-CB-1: an array and its turn, or a count row, is wider than its panel too - the
    // A / B panels ran over each other and off the page. Any item wider than a panel beside the response (about 55 mm)
    // takes a form that holds it: `pair` - A and B side by side across the cell, the response under them (up to half the
    // cell, about 83 mm); `full` - A over B over the response, each the cell's width, drawn at the full-line geometry
    // (cols 1). The equation and sentence forms keep B under A with the response beside, as before.)
    const fw = Number((it.footprint || {}).wMm);
    const panelW = (LIVE_W_MM - 6 - 52 - 10) / 2 - 4, halfW = (LIVE_W_MM - 6 - 5) / 2 - 4;
    // (an equation keeps master's own wide rule below, B under A, and never takes pair / full)
    const over = !sentence && it.template !== 'equation' && Number.isFinite(fw) && fw > panelW;
    const legacyWide = sentence || (it.template === 'equation' && Number.isFinite(fw) && fw > (LIVE_W_MM - 52 - 10) / 2);
    // (lf-ops-props r3b, replaces lf-algebra's interim revert 2cfeb1d7: a count row wider than half the cell no longer takes
    // `full` - A over B, one item a page - it WRAPS to its own panel: A and B side by side, each told its live width
    // (`cellLiveMm`, read by count-row's narrowLive, the same key the lesson chart panel and the we-do Steps use). The wrap is
    // keyed on the panel's real width, never on ctx.columns, so a full-width panel keeps its line.)
    const crWrap = !legacyWide && over && it.template === 'count-row' && pl.look === 'train' && fw > halfW;   // (a train wraps; an arcs row shrinks its boxes in a narrow width, TY-21 - it keeps `full`)
    const pair = !legacyWide && over && (fw <= halfW || crWrap);
    const full = !legacyWide && over && fw > halfW && !crWrap;
    const liveC = crWrap ? { cellLiveMm: halfW - 8 } : null;
    const wide = legacyWide;
    const at = (col, row) => (full ? ` style="grid-column:1;grid-row:${row}"` : pair ? ` style="grid-column:${col};grid-row:1"` : wide ? ` style="grid-column:${col};grid-row:${row}"` : '');
    const work = (c, o, v, slots) => it.render(Object.assign({}, c, { state: 'blank' }, liveC || {}), Object.assign({}, o, { cols: sentence ? 2 : full ? 1 : pair || wide ? 2 : 3, shown: v, prompt: false }, slots ? { shownSlots: slots } : {}, sentence ? { payload: { noStory: true } } : {}));
    // pair / full: the response is a full-width row under the panels (the frames sit just under them, critic r1/r2 R10)
    const respStyle = ' style="grid-column:1 / -1;grid-row:' + (full ? 3 : 2) + ';display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;column-gap:8mm;row-gap:2mm"';
    // (lf-ops-props r3b, CL-40: the A panel's top-left corner printed at 3 mm across, 5 mm down - in the label's 7 x 7 mm
    // keep-out - at L; the panels start below it (--ws-koin, the kit's keep-out edge; 0 on screen). Taken as padding, so the
    // block still centres in its stretched cell by its auto margins (critic r1/r2 R11; owner CL-4b, 2026-11-12))
    const ko = sentence ? '' : ';padding-top:max(0mm, var(--ws-koin, 0mm))';
    const cols = full ? ';grid-template-columns:1fr;row-gap:3mm' : pair ? ';grid-template-columns:1fr 1fr;row-gap:3mm' : wide ? ';grid-template-columns:1fr minmax(52mm,auto);row-gap:3mm' : '';
    // the A / B block centres in a cell its row stretches (the cell is 57 / 76 / 113.5 mm by PT-RSN-1 whatever the problem's
    // height): the white splits above and below, never one band under short work (critic r1/r2 R11; owner CL-4b, 2026-11-12)
    const render = (c, o = {}) => story(c) + `<div class="mq-ab" style="margin-top:auto;margin-bottom:auto${cols}${ko}">`
        + `<div class="mq-abbox"${full ? at(1, 1) : pair ? at(1) : at(1, 1)}><span class="mq-abtag">A</span>${work(c, o, aRight ? correct : wrong.value, aRight ? null : wrongSlots)}</div>`
        + `<div class="mq-abbox"${full ? at(1, 2) : pair ? at(2) : at(1, 2)}><span class="mq-abtag">B</span>${work(c, o, aRight ? wrong.value : correct, aRight ? wrongSlots : null)}</div>`
        // the frames sit just under the A / B ring, not spread to the cell's foot (critic r1/r2 R10: "__ is correct." ~300 px under
        // the ring in a mostly empty column); inline, so only Reason It pages change
        + `<div class="mq-abresp"${full || pair ? respStyle : wide ? ` style="grid-column:2;grid-row:1 / 3;justify-content:flex-start"` : ' style="justify-content:flex-start"'}>`
        + `<div class="mq-abchoice">${blank({ id: 'ri-a', kind: 'choice', shape: 'choice', text: 'A' }, c, key)}${blank({ id: 'ri-b', kind: 'choice', shape: 'choice', text: 'B' }, c, key)}</div>`
        + `<div class="mq-frame">${writeLine('ri-who', c, key, 1)} is correct.</div>`
        + (place.kind !== 'one' ? '' : `<div class="${answerFrameCls(place, 56)}">The answer is ${answerPlaceHtml(place, 'ri-ans', c, key)}.</div>`)
        + `</div>`
        // a unit-form answer ("[2] hundreds [9] tens [7] ones") is wider than the response column: its frame is a full-width
        // row under A and B (in the column it wrapped to three lines and cost the page an item at S: ws-capacity-pin 4 -> 3)
        // every LIST frame too (critic r3 D1 / D5: in the 56 mm column a 5-part list wrapped a blank a line and "Rule: subtract __
        // each time" ran out of the cell, costing the page an item); the row wraps at the cell's full width
        // a unit form keeps its frame, full width under A and B; a LIST (pattern terms, table outputs) prints none: the panel the
        // pupil names in "__ is correct." already holds every part, so the frame only made them copy it (H16) and, at 5-6 parts,
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
