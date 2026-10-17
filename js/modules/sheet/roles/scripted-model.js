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
    generalSteps, oralFrameOf, assemble, poolItems, answerOf, instructionText, esc,
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

/**
 * What each frozen state shows written (critic skip-count r1 D5): state k carries the marks of steps 1..k, so a step that
 * says "Write 25" shows 25 traced in its own drawing. Only a count row draws a partial state (its `traceSlots`); a
 * provider's mark `blankN` is the row's slot `bN`. null: the default (blank states, the last one answered).
 */
function marksFor(it, steps) {
    const q = it.q || {};
    if (!q.cell || q.cell.template !== 'count-row') return null;
    const worked = providerWorkedSteps(it, 6).filter((s) => s.text.length <= 90);
    if (worked.length !== steps.length || !worked.some((s) => s.marks.length)) return null;
    const acc = {};
    return worked.map((s) => {
        s.marks.forEach((m) => { if (m && m.slot !== undefined) acc[String(m.slot).replace(/^blank(\d+)$/, 'b$1')] = String(m.value); });
        return Object.assign({}, acc);
    });
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
    let steps = stepsFor(it);
    let marks = marksFor(it, steps);
    const cols = fitsAt([it], 2, ctx) ? 2 : 1;
    let textH = 2 * (m.pitch + 1.5) + 6;
    // A state too wide for the half-width state column (a word problem, a wide picture) takes the
    // full width, with its step text over it in the same row (PT-MOD-2 cannot hold it beside).
    let H = cols === 2 ? Math.max(hMinAt([it], 2, ctx), textH) : hMinAt([it], 1, ctx) + textH;
    // critic skip-count r1 D5: a full-width state whose steps are all short (one line across the page) gives its text one
    // line, when that is what keeps the whole model on one page (L: four count-row states and the Say band)
    const room1 = m.budget - m.strip - m.say;
    if (cols === 1 && Math.floor(room1 / H) < steps.length && steps.every((t) => t.length <= 48)) {
        const H1 = hMinAt([it], 1, ctx) + (m.pitch + 1.5) + 6;
        if (Math.floor(room1 / H1) >= steps.length) { textH = (m.pitch + 1.5) + 6; H = H1; }
    }
    // critic skip-count r2 D8: a taller drawing (a fact under each number, three lines of 5) may still leave the last state
    // alone on a page; then the two parallel middle steps ("a + n = b. Write b.") become one state, so the model stays whole.
    // critic skip-count r3 D10: ONLY a count row's steps are parallel (marks non-null = q.cell.template 'count-row' with the
    // provider's traced steps); and only when steps 2 and 3 are both the same action "a + n = b. Write b." (a rule-finding step never merges);
    // every other skill keeps one action per state (PEDAGOGY P-1) and the caps rebalance below
    const parallel = (t) => /^[\d,]+ [+\u2212-] [\d,]+ = [\d,]+\. Write [\d,]+\.$/.test(String(t).trim());
    if (marks && parallel(steps[1]) && parallel(steps[2]) && Math.floor(room1 / H) < steps.length && Math.floor(room1 / H) >= steps.length - 1 && steps.length >= 4) {
        steps = [steps[0], `${steps[1]} ${steps[2]}`, ...steps.slice(3)];
        if (marks) marks = [marks[0], marks[2], ...marks.slice(3)];
    }
    const perFirst = Math.max(1, Math.floor((m.budget - m.strip - m.say) / H));
    const perCont = Math.max(1, Math.floor((mCont.budget - m.strip - m.say) / H));
    const ans = answerOf(it);
    const stepText = (i) => `<div class="mq-steptext"><em>${i + 1}</em><span>${esc(steps[i])}</span></div>`;
    const stateItem = (i) => planItem(it, {
        cols, level: 3, nolabel: true,
        render: (c, o) => (cols === 1 ? `<div class="mq-steptop">${stepText(i)}</div>` : '')
            + it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o,
                marks ? (Object.keys(marks[i]).length ? { payload: Object.assign({}, o && o.payload, { traceSlots: marks[i] }) } : {})
                    : i === steps.length - 1 && ans ? { shown: ans, ink: 'trace' } : {})),
    });
    const textItem = (i) => ({
        render: () => stepText(i),
        drawsAnswer: true, nolabel: true, cls: 'mq-stepcell', skill: it.skill,
    });
    const pages = [];
    let i = 0;
    // never a lone state on the last page (critic r2 D8): the page before gives it one of its states
    const caps = [];
    for (let left = steps.length; left > 0;) { const c = Math.min(left, caps.length ? perCont : perFirst); caps.push(c); left -= c; }
    if (caps.length > 1 && caps[caps.length - 1] === 1 && caps[caps.length - 2] > 2) { caps[caps.length - 2]--; caps[caps.length - 1]++; }
    while (i < steps.length) {
        const cap = caps[pages.length];
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
        meta: { items: 1, scoreOutOf: 0, states: steps.length, cols,  fits: [{ cols: 2, rows: steps.length, line: `Fits: ${steps.length} states, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, supports, plan };
