// js/modules/sheet/roles/opener.js
// THE OPENER (design/PAGE_TYPES.md 2.1): "I do" and "We do" on one sheet.
//
//   What's New         the skill's `strings.whatsNew` (omitted when the skill has none - the
//                      default adapter leaves it empty on purpose, never placeholder text)
//   Model | Steps      left half: the model cell(s) - two side by side when both fit 46 mm
//                      (PT-OPN-2), the first `traced` (level 3), the second blank to work live;
//                      right half: 3 to 6 numbered imperatives in outlined circles (PT-OPN-3)
//   Say:               the oral frame (PT-OPN-9, on by default), unlabelled and unscored
//   Guided Practice:   one row of 2 to 4 unlabelled cells, columns Auto 4 / 3 / 3 (PT-OPN-6)
//   Independent Practice:  whole rows only while they fit the 232 mm budget, at most 2
//                      (PT-OPN-7); lettered and scored - with none, Score is omitted
//
// Heights follow PT-ENG-3: bands are content-sized, the fixed heights total no more than
// bodyH - 4, and a row gains at most 8 mm from the spare height. Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, bestCols, planItem, gridPart,
    instructionKeyOf, instructionText, generalSteps, stepsHtml, stringsOf, oralFrameOf, assemble,
    poolItems, answerOf, labelStyleOf,
} from './compose.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'opener';
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

/** Lines a list of steps takes in the 93 mm Steps zone, from an Andika width estimate. */
function stepLines(list, textPt) {
    const perLine = Math.max(12, Math.floor((93 - 16) / (0.5 * textPt * 25.4 / 72)));
    return list.reduce((a, s) => a + Math.max(1, Math.ceil(s.length / perLine)), 0);
}

/** Every height decision of the page, from the probe (or final) items. */
function geometry(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Lesson 1', score: 1 });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const first = items[0];
    const str = first ? stringsOf(first) : {};
    const whatsNew = String(str.whatsNew || '').trim();
    const steps = first ? generalSteps(first).slice(0, 6) : [];
    const twoModels = items.length >= 2 && fitsAt(items.slice(0, 2), 4, ctx);
    const mc = twoModels ? 4 : 2;
    const modelH = hMinAt(items.slice(0, twoModels ? 2 : 1), mc, ctx);
    const stepsH = stepLines(steps, m.textPt) * (m.pitch + 1.2) + steps.length * 2.2 + 4;
    const modelBand = m.strip + Math.max(modelH, stepsH);
    const gcWanted = AUTO_COLS[ctx.size];
    const gc = bestCols(items, [gcWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= gcWanted), ctx);
    const gH = hMinAt(items, gc, ctx);
    let used = (whatsNew ? m.strip + 2 : 0) + modelBand + m.say + m.strip + gH;
    let iRows = 0;
    while (iRows < 2 && used + (iRows ? 0 : m.strip) + gH <= m.budget) { used += (iRows ? 0 : m.strip) + gH; iRows++; }
    const spare = Math.max(0, m.budget - used);
    const rowsThatGrow = 1 + iRows;
    const grow = Math.min(8, spare / rowsThatGrow);
    return { ctx, m, whatsNew, steps, twoModels, mc, modelH, stepsH, modelBand, gc, gH, iRows, grow, overBudget: used > m.budget, used };
}

export function counts(pools, input) {
    const g = geometry(pools.main || [], input);
    return { main: (g.twoModels ? 2 : 1) + g.gc + g.iRows * g.gc };
}

export function plan(input = {}) {
    const items = poolItems(input, 'main');
    const g = geometry(items, input);
    const { ctx, m } = g;
    const nModel = g.twoModels ? 2 : 1;
    const models = items.slice(0, nModel);
    const guided = items.slice(nModel, nModel + g.gc);
    const indep = items.slice(nModel + g.gc, nModel + g.gc + g.iRows * g.gc);
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: indep.length });
    const key = instructionKeyOf(guided.length ? guided : items, input.skills);
    const traced = (it) => (c, o) => it.render(c, Object.assign({}, o, c.state === 'blank' && answerOf(it) ? { shown: answerOf(it), ink: 'trace' } : {}));
    const modelItems = models.map((it, i) => planItem(it, { cols: g.mc, level: i === 0 ? 3 : 2, nolabel: true, model: ctx.look === 'daily', render: i === 0 ? traced(it) : undefined }));
    const sections = [];
    if (g.whatsNew) sections.push({ kind: 'band', label: "What's New:", instr: g.whatsNew, html: '' });
    const modelContentH = g.modelBand - m.strip;
    sections.push({
        kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-modelrow',
        parts: [
            { kind: 'band', label: 'Model:', instr: '', content: gridPart(modelItems, { cols: nModel, rows: 1, cellH: modelContentH, labels: 'none' }) },
            { kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepszone" style="height:${modelContentH.toFixed(2)}mm">${stepsHtml(g.steps)}</div>` },
        ],
    });
    sections.push({ kind: 'say', frame: oralFrameOf(items[0] || {}), digits: 2 });
    sections.push({ kind: 'band', label: 'Guided Practice:', instr: instructionText(key),
        content: gridPart(guided.map((it) => planItem(it, { cols: g.gc, level: 2, nolabel: true })), { cols: g.gc, rows: 1, cellH: g.gH + g.grow, labels: 'none' }) });
    if (indep.length) {
        sections.push({ kind: 'band', label: 'Independent Practice:', instr: instructionText(key),
            content: gridPart(indep.map((it) => planItem(it, { cols: g.gc, level: 1 })), { cols: g.gc, rows: g.iRows, cellH: g.gH + g.grow, labels: labelStyleOf(ctx.look, input.labels), start: 1 }) });
    }
    const notes = [];
    if (!g.whatsNew) notes.push("What's New is omitted: the skill has no whatsNew string yet.");
    if (g.overBudget) notes.push('The Model and Guided bands are taller than the page budget at this size.');
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: models.length + guided.length + indep.length, scoreOutOf: indep.length, models: nModel, guided: guided.length, independent: indep.length,
            fits: [{ cols: g.gc, rows: 1 + g.iRows, line: `Fits: ${nModel} model${nModel > 1 ? 's' : ''}, ${guided.length} guided, ${indep.length} independent.` }], notes },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
