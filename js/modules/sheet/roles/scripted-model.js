// js/modules/sheet/roles/scripted-model.js
// THE SCRIPTED MODEL PAGE (design/PAGE_TYPES.md 2.2): an algorithm taught as frozen states - the
// same problem redrawn once per step, the step text beside its state, closing with the `Say:`
// band read aloud.
//
//   States     one per `workedSteps(q)` entry (PT-MOD-1). With the default adapter (no marks
//              per step) the states before the last show the blank problem and the last shows it
//              answered in trace grey - exactly the section's stated default.
//   Row        state cell | "(n) step text" (outlined circle marker, 2 lines at most)
//   Pages      states beyond the page's capacity continue on a page whose band again reads
//              "Model:" (PT-MOD-3); the last page closes with the Say band filled in (PT-MOD-4)
//   Score      none; no labels. Nothing is answered on this page, so it is its own key (PT-KEY-7).
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, providerWorkedSteps,
    generalSteps, oralFrameOf, assemble, poolItems, answerOf, instructionText, esc, escText,
} from './compose.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'scripted-model';

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3];
export const counts = () => ({ main: 1 });

/**
 * The steps of the example (SCC 3.8): the provider's own `workedSteps(q)` for THIS problem when
 * it has at least 3, else its general `strings.steps`. A skill with neither has no scripted
 * model (see `supports`) - generic operation steps are not the skill's steps.
 */
function stepsFor(it) {
    const worked = providerWorkedSteps(it, 6).map((s) => s.text).filter((t) => t.length <= 90);
    return worked.length >= 3 ? worked : generalSteps(it);
}

/** PAGE_TYPES 2.2: the page IS the steps; a skill that supplies none cannot be modelled yet. */
export function supports(items) {
    if (!items.length) return 'no items were generated';
    return stepsFor(items[0]).length ? null
        : 'This skill has no worked steps yet (strings.steps / workedSteps), so it has no Scripted Model page.';
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const it = poolItems(input, 'main')[0];
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Model', score: 0 });
    if (!it) return assemble(ROLE_ID, input, frame, [{ sections: [] }], { nothingToAnswer: true });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const steps = stepsFor(it);
    const cols = fitsAt([it], 2, ctx) ? 2 : 1;
    const textH = 2 * (m.pitch + 1.5) + 6;
    // A state too wide for the half-width state column (a word problem, a wide picture) takes the
    // full width, with its step text over it in the same row (PT-MOD-2 cannot hold it beside).
    const H = cols === 2 ? Math.max(hMinAt([it], 2, ctx), textH) : hMinAt([it], 1, ctx) + textH;
    const perFirst = Math.max(1, Math.floor((m.budget - m.strip - m.say) / H));
    const perCont = Math.max(1, Math.floor((mCont.budget - m.strip - m.say) / H));
    const ans = answerOf(it);
    const stepText = (i) => `<div class="mq-steptext"><em>${i + 1}</em><span>${escText(steps[i])}</span></div>`;
    // A state before the last is the problem part-way through: its empty boxes are not answers yet
    // (the page is traced, not scored), so they are marked ungraded and the key leaves them empty.
    const ungraded = (html) => html.replace(/(<[^>]*\sdata-ws-slot="[^"]*")(?![^>]*data-ws-graded)/g, '$1 data-ws-graded="0"');
    const stateItem = (i) => planItem(it, {
        cols, level: 3, nolabel: true,
        render: (c, o) => {
            const cell = it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o,
                i === steps.length - 1 && ans ? { shown: ans, ink: 'trace' } : {}));
            return (cols === 1 ? `<div class="mq-steptop">${stepText(i)}</div>` : '') + (i === steps.length - 1 ? cell : ungraded(cell));
        },
    });
    const textItem = (i) => ({
        render: () => stepText(i),
        drawsAnswer: true, nolabel: true, cls: 'mq-stepcell', skill: it.skill,
    });
    const pages = [];
    let i = 0;
    while (i < steps.length) {
        const cap = pages.length ? perCont : perFirst;
        const take = steps.slice(i, i + cap).map((_, k) => i + k);
        const cells = [];
        for (const k of take) { cells.push(stateItem(k)); if (cols === 2) cells.push(textItem(k)); }
        const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'), content: gridPart(cells, { cols, rows: take.length, cellH: H, labels: 'none' }) }];
        i += take.length;
        if (i >= steps.length) sections.push({ kind: 'say', frame: oralFrameOf(it, { fill: true }) });
        pages.push({ sections });
    }
    return assemble(ROLE_ID, input, frame, pages, {
        nothingToAnswer: true, scaffoldLevel: 3,
        meta: { items: 1, scoreOutOf: 0, states: steps.length, cols, fits: [{ cols: 2, rows: steps.length, line: `Fits: ${steps.length} states, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, supports, plan };
