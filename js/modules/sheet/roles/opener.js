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
/** Item 7: the first item is the Model; it wraps to the half-width Model cell (count-row reads ctx.wrapToCell). */
export const WRAP_TO_CELL = (index) => index === 0;
/** critic r2 N4: a one-page count row's air (vpad, spread over the one-page SHEET) is not drawn here; the cell is the row's height. */
export const TIGHT_ROWS = true;
/** critic r3 N9 (H13): a Lines count row is short (digits on a rule), so its cell takes none of the PT-ENG-3 grow - the spare
 * height stays blank at the foot - where a row with boxes grows as before. */
const isLinesRow = (it) => !!(it && it.template === 'count-row' && it.q && it.q.cell && it.q.cell.payload && it.q.cell.payload.lines);
const GROWCAP = (first) => (isLinesRow(first) ? 0 : Infinity);
const AUTO_COLS = { S: 4, M: 3, L: 3 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];

/** Lines a list of steps takes in the 93 mm Steps zone, from an Andika width estimate. */
function stepLines(list, textPt, zoneMm = 93) {
    const perLine = Math.max(12, Math.floor((zoneMm - 16) / (0.5 * textPt * 25.4 / 72)));
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
    // Item 7 (LESSONS_LEARNED L11): a count row too wide for the half-width Model cell even wrapped (1,000,000 by 100,000)
    // takes the whole width, with the Steps band underneath; every other Model keeps the Model | Steps row.
    const modelFull = !twoModels && !!first && first.template === 'count-row' && steps.length > 0 && !fitsAt([first], 2, ctx);
    const mc = twoModels ? 4 : modelFull ? 1 : 2;
    const modelH = hMinAt(items.slice(0, twoModels ? 2 : 1), mc, ctx);
    const stepsH = stepLines(steps, m.textPt, modelFull ? 186 : 93) * (m.pitch + 1.2) + steps.length * 2.2 + 4;
    const modelBand = modelFull ? m.strip + modelH + m.strip + stepsH : m.strip + Math.max(modelH, stepsH);
    const gcWanted = AUTO_COLS[ctx.size];
    const gc = bestCols(items, [gcWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= gcWanted), ctx);
    const gH = hMinAt(items, gc, ctx);
    let used = (whatsNew ? m.strip + 2 : 0) + modelBand + m.say + m.strip + gH;
    let iRows = 0;
    // Item 7: a count row's band labels wrap to two lines at L ("Independent / Practice:"), which the strip height does not
    // count; a page of count rows keeps that much in hand before it adds an Independent row (it ran 4.8 mm over at L)
    const hand = first && first.template === 'count-row' && ctx.size === 'L' ? m.strip : 0;   // the labels wrap at L only
    while (iRows < 2 && used + (iRows ? 0 : m.strip) + gH + hand <= m.budget) { used += (iRows ? 0 : m.strip) + gH; iRows++; }
    // critic r2 N4 (PT-OPN-6: one Guided column gives 2 rows): a page of count rows - each a full-width line - takes a second
    // Guided row where the page would otherwise end in a blank band; the Independent rows are fitted first, so none is lost
    let gRows = 1;
    if (first && first.template === 'count-row' && gc === 1 && used + gH + hand <= m.budget) { gRows = 2; used += gH; }
    const spare = Math.max(0, m.budget - used - hand);
    const rowsThatGrow = gRows + iRows;
    const grow = Math.min(8, spare / rowsThatGrow, GROWCAP(first));
    return { ctx, m, whatsNew, steps, twoModels, modelFull, mc, modelH, stepsH, modelBand, gc, gH, gRows, iRows, grow, overBudget: used > m.budget, used };
}

const needOf = (g) => (g.twoModels ? 2 : 1) + g.gc * g.gRows + g.iRows * g.gc;
const countRowFirst = (items) => !!(items[0] && items[0].template === 'count-row');

/**
 * critic r4 N12: count rows differ in height (a 12-row of 2-digit numbers wraps where a 5-row does not), and the page is sized
 * from its tallest row. So a count-row Opener asks for every item it could place, and the plan then takes the fullest page
 * whose rows are sized from exactly the items it places: no row it fits is left out, and no taller row it leaves out shrinks it.
 */
function bestGeometry(items, input) {
    const all = geometry(items, input);
    if (!countRowFirst(items)) return all;
    let best = null;
    for (let m = items.length; m >= 1; m--) {
        const g = geometry(items.slice(0, m), input);
        if (needOf(g) <= m && (!best || needOf(g) > needOf(best))) best = g;
    }
    return best || all;
}

export function counts(pools, input) {
    const probe = pools.main || [];
    const g = geometry(probe, input);
    // a count-row page asks for the most it could hold (2 Guided rows, 2 Independent rows); the plan places what fits
    if (countRowFirst(probe)) return { main: (g.twoModels ? 2 : 1) + 4 * g.gc };
    return { main: needOf(g) };
}

export function plan(input = {}) {
    const items = poolItems(input, 'main');
    const g = bestGeometry(items, input);
    const { ctx, m } = g;
    const nModel = g.twoModels ? 2 : 1;
    const models = items.slice(0, nModel);
    // critic r4 N12: when the deal comes up short of the plan, the Independent rows are filled before the second Guided row
    // (PT-OPN-7 rows are scored; the second Guided row only fills a page that would otherwise end in a blank band)
    const rest = items.slice(nModel);
    const guided1 = rest.slice(0, g.gc);
    const indep = rest.slice(g.gc, g.gc + g.iRows * g.gc);
    const guided = guided1.concat(g.gRows > 1 ? rest.slice(g.gc + indep.length, g.gc + indep.length + g.gc) : []);
    const lesson = Math.max(1, Number(input.lesson) || 1);
    const frame = frameOf({ skills: input.skills || [], input, tabId: `Lesson ${lesson}`, score: indep.length });
    const key = instructionKeyOf(guided.length ? guided : items, input.skills);
    const traced = (it) => (c, o) => it.render(c, Object.assign({}, o, c.state === 'blank' && answerOf(it) ? { shown: answerOf(it), ink: 'trace' } : {}));
    const modelItems = models.map((it, i) => planItem(it, { cols: g.mc, level: i === 0 ? 3 : 2, nolabel: true, model: ctx.look === 'daily', render: i === 0 ? traced(it) : undefined }));
    const sections = [];
    if (g.whatsNew) sections.push({ kind: 'band', label: "What's New:", instr: g.whatsNew, html: '' });
    const modelContentH = g.modelFull ? g.modelH : g.modelBand - m.strip;
    // SCC 3.8: the Steps come from the skill's provider; a skill with none gets no Steps box
    // (generic operation steps were wrong for half the skills), and the Model takes the row.
    const modelBandPart = { kind: 'band', label: 'Model:', instr: '', content: gridPart(modelItems, { cols: nModel, rows: 1, cellH: modelContentH, labels: 'none' }) };
    if (g.steps.length && g.modelFull) {
        sections.push(modelBandPart);
        sections.push({ kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepszone" style="height:${g.stepsH.toFixed(2)}mm">${stepsHtml(g.steps)}</div>` });
    } else if (g.steps.length) {
        sections.push({
            kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-modelrow',
            parts: [
                modelBandPart,
                { kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-stepszone" style="height:${modelContentH.toFixed(2)}mm">${stepsHtml(g.steps)}</div>` },
            ],
        });
    } else sections.push(modelBandPart);
    sections.push({ kind: 'say', frame: oralFrameOf(items[0] || {}), digits: 2 });
    sections.push({ kind: 'band', label: 'Guided Practice:', instr: instructionText(key, items),
        content: gridPart(guided.map((it) => planItem(it, { cols: g.gc, level: 2, nolabel: true })), { cols: g.gc, rows: Math.max(1, Math.ceil(guided.length / g.gc)), cellH: g.gH + g.grow, labels: 'none' }) });
    if (indep.length) {
        sections.push({ kind: 'band', label: 'Independent Practice:', instr: instructionText(key, items),
            content: gridPart(indep.map((it) => planItem(it, { cols: g.gc, level: 1 })), { cols: g.gc, rows: Math.max(1, Math.ceil(indep.length / g.gc)), cellH: g.gH + g.grow, labels: labelStyleOf(ctx.look, input.labels), start: 1 }) });
    }
    const notes = [];
    if (!g.whatsNew) notes.push("What's New is omitted: the skill has no whatsNew string yet.");
    if (g.overBudget) notes.push('The Model and Guided bands are taller than the page budget at this size.');
    return assemble(ROLE_ID, input, frame, [{ sections }], {
        meta: { items: models.length + guided.length + indep.length, scoreOutOf: indep.length, models: nModel, guided: guided.length, independent: indep.length,
            fits: [{ cols: g.gc, rows: g.gRows + g.iRows, line: `Fits: ${nModel} model${nModel > 1 ? 's' : ''}, ${guided.length} guided, ${indep.length} independent.` }], notes },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
