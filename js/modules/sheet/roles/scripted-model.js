// js/modules/sheet/roles/scripted-model.js
// THE SCRIPTED MODEL PAGE (design/PAGE_TYPES.md 2.2): an algorithm taught as frozen states - the
// same problem redrawn once per step, the step text beside its state, closing with the `Say:`
// band read aloud.
//
//   States     a state where the DRAWING changes (shared-roles R1-3): the template's own `stepState`
//              draws each step (a stack writes the ones, then the tens); steps that change nothing
//              (a "look" step, a check, every step of a fact before its answer) ride in the state of
//              their drawing, listed there. The last state shows the answer, traced in grey. A count
//              row keeps one state per step (its `traceSlots`, PT-MOD-1).
//   Row        one cell a state: the drawing | its numbered steps (outlined circle markers, the
//              numbers running on), as tall as its content; a drawing too wide for half the page
//              takes the width with its steps over it. (A count row: state cell | step text.)
//   Pages      states beyond the page's capacity continue on a page whose band again reads
//              "Model:" (PT-MOD-3); the last page closes with the Say band filled in (PT-MOD-4)
//   Score      none; no labels. The states before the last carry no slots (frozen drawings); the
//              key is a real key (PT-KEY-3: "Answer Key" on the Name rule) with the last state
//              answered (AK-2).
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, providerWorkedSteps,
    generalSteps, oralFrameOf, assemble, poolItems, answerOf, instructionText, esc, drawingKey,
} from './compose.js';
import { isWideRow } from '../cells/count-row.js';
import { stepTemplateOf, unslot } from '../anchors.js';
import { LIVE_W_MM } from '../layout.js';

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

/**
 * critic skip-count r4 D12: "All rows on one page" is a PUPIL-SHEET layout (the compact one-line rows of the one-page sheet). The
 * Model draws one row. For an ordinary row the compact line is still one line of 12 and is kept (as on main); but a wide (6+ digit)
 * row cannot be one line: its compact form is 4 lines of 3 at the full digit size, 4 mm taller a line, with the one-page sheet's
 * short 2.2 mm jump arrows beside the full-size turn arrows - a state about 1.8 x the height of the same row without "one page"
 * (S: 88 mm vs 50 mm), which left one state alone on each page. So the Model draws a wide row exactly as the Independent page and
 * the plain Model do (same lines, boxes, digits and arrows), and the one-page option changes nothing on the Model of a wide row.
 * The item is wrapped here, before the host measures it, so the measured height and the drawing agree.
 */
export function prepare(it) {
    const q = (it && it.q) || {};
    const p = q.cell && q.cell.template === 'count-row' ? q.cell.payload || {} : null;
    if (!p || !p.compact || !isWideRow(p)) return it;
    const plain = { compact: false, vpad: 0 };
    const render = (c, o = {}) => it.render(c, Object.assign({}, o, { payload: Object.assign({}, o.payload, plain) }));
    return Object.assign({}, it, {
        render, measured: null,
        cellCls: String(it.cellCls || '').replace(/\bws-cell-compact\b/g, '').trim(),
    });
}

/**
 * How many states each page holds (critic skip-count r2 D8, r4 D12: NO page holds a lone state when the model has more than one).
 * `caps[k]` is what page k can hold; the states are dealt front-first, but never leaving a page with fewer than 2 (`spread`).
 * Returns null when no deal of `n` states over `caps.length` pages gives every page 2 or more.
 */
function spread(n, caps) {
    const P = caps.length;
    if (n < 2 * P || caps.some((c) => c < 2)) return null;
    const out = [];
    let left = n;
    for (let k = 0; k < P; k++) {
        const after = caps.slice(k + 1);
        const most = Math.min(caps[k], left - 2 * after.length);
        const least = Math.max(2, left - after.reduce((a, b) => a + b, 0));
        if (most < least) return null;
        out.push(most);
        left -= most;
    }
    return left === 0 ? out : null;
}
/** The greedy deal (each page as full as it holds), then `spread` over the same pages when that removes a lone state. */
function dealOf(n, perFirst, perCont) {
    const caps = [];
    for (let left = n; left > 0;) { const c = Math.min(left, caps.length ? perCont : perFirst); caps.push(c); left -= c; }
    if (n > 1 && caps.length > 1 && caps.some((c) => c === 1)) {
        const even = spread(n, caps.map((_, k) => (k ? perCont : perFirst)));
        if (even) return even;
    }
    return caps;
}
const hasLone = (deal, n) => n > 1 && deal.some((c) => c === 1);

/** PAGE_TYPES 2.2: the page IS the steps; a skill that supplies none cannot be modelled yet. */
export function supports(items) {
    if (!items.length) return 'no items were generated';
    return stepsFor(items[0]).length ? null
        : 'This skill has no worked steps yet (strings.steps / workedSteps), so it has no Scripted Model page.';
}

/* ============================================================== the grouped states (R1-3) */

/** What a drawing shows, ink-blind (compose.drawingKey, shared with the lesson's anchor chart). */
const inkBlind = drawingKey;

/**
 * shared-roles R1-3 (critic laneD-restart r1: "4-5 panels repeat the same unchanged fact while the steps describe a
 * strategy"): the states of a model whose template cannot draw a partial state for every step. A state is drawn only
 * where the drawing CHANGES: the template's own `stepState` (the stack writes the ones, then the tens) gives each step's
 * drawing, and a step whose drawing is the same as the one before it (a "look" or "say" step, a check, every step of a
 * fact before its answer) rides in the state of that drawing, its text listed there. The last state always shows the
 * answer (traced on the pupil page, filled on the key). So a fact is two panels (the problem with its strategy steps,
 * then the answer), a column subtraction one panel per place it writes.
 *
 * Returns [{steps: [index...], draw: k | null}]: `draw` is the step whose stepState the state shows (null: the blank
 * problem); the last group is drawn by the item itself (answered).
 */
export function stateGroupsOf(it, steps, c) {
    const worked = providerWorkedSteps(it, 6).filter((s) => s.text.length <= 90);
    const t = worked.length === steps.length && worked.some((s) => s.marks.length) ? stepTemplateOf(it) : null;
    const merged = worked.map((s) => ({ marks: s.marks }));
    const drawAt = (k) => {
        if (!t || !c) return 'blank';
        try { return inkBlind(t.stepState(Object.assign({}, ((it.q && it.q.cell) || {}).payload || {}), merged, k, Object.assign({}, c, { state: 'blank', step: k }))); } catch (e) { return 'blank'; }
    };
    const groups = [];
    let prev = null;
    steps.forEach((_, k) => {
        const d = drawAt(k);
        const marked = !!(worked[k] && worked[k].marks.length);
        if (groups.length && (d === prev || !marked)) groups[groups.length - 1].steps.push(k);
        else groups.push({ steps: [k], draw: marked && t ? k : null });
        prev = d;
    });
    // the answer has its own state: a model of one drawing splits its last step off (blank problem, then the answer)
    if (groups.length === 1 && steps.length > 1) {
        const g = groups[0];
        groups.splice(0, 1, { steps: g.steps.slice(0, -1), draw: g.draw }, { steps: g.steps.slice(-1), draw: null });
    }
    while (groups.length > 4) {   // at most 4 states (a 6-step model): the two earliest join
        const [a, b] = groups;
        groups.splice(0, 2, { steps: a.steps.concat(b.steps), draw: b.draw !== null ? b.draw : a.draw });
    }
    return groups;
}

/** Lines a step takes in a text column `wMm` wide (0.5 em a character, the outlined numeral and its gap kept). */
function textLines(text, wMm, textPt) {
    const em = textPt * (25.4 / 72);
    const per = Math.max(10, Math.floor((wMm - 10) / (0.5 * em)));
    return Math.max(1, Math.ceil(String(text).length / per));
}

/** The height (mm) of a state's step list in a text column `wMm` wide: each step its lines (>= its 7 mm numeral). */
function textHeight(list, wMm, m) {
    const em = m.textPt * (25.4 / 72);
    return list.reduce((h, t) => h + Math.max(7, textLines(t, wMm, m.textPt) * em * 1.3) + 1.5, 0) + 4.5;
}

/** A state's step list: the outlined numerals continue across the states (BD-4). */
const stepList = (steps, idx) => idx.map((i) => `<div class="mq-steptext" style="height:auto;padding-top:0">`
    + `<em>${i + 1}</em><span>${esc(steps[i])}</span></div>`).join('');

/**
 * The page of grouped states: ONE cell a state, its drawing and its steps side by side (the drawing in the left half when
 * it fits there, else the steps over the drawing), each row as tall as its own content (R1-3: "panels sized to content so
 * a model fits one page"; H13). The drawings of the states before the last carry no slots (a frozen state is not an
 * answer place, so the key has nothing to leave blank, AK-2); the last state is the item itself, traced on the pupil
 * page and answered on the key.
 */
function groupedPlan(input, it, steps, frame, ctx) {
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const side = fitsAt([it], 2, ctx);
    const hDraw = hMinAt([it], side ? 2 : 1, ctx);
    const textW = side ? LIVE_W_MM / 2 - 4 : LIVE_W_MM - 8;
    const probe = Object.assign({}, ctx, { scaffoldLevel: MEASURE_LEVEL });
    const groups = stateGroupsOf(it, steps, probe);
    const ans = answerOf(it);
    const Hs = groups.map((g) => {
        const tH = textHeight(g.steps.map((i) => steps[i]), textW, m);
        return Math.round((side ? Math.max(hDraw, tH) : hDraw + tH) * 10) / 10;
    });
    const last = groups.length - 1;
    const worked = providerWorkedSteps(it, 6).filter((s) => s.text.length <= 90);
    const merged = worked.map((s) => ({ marks: s.marks }));
    const t = stepTemplateOf(it);
    const drawing = (k, c, o) => {
        const g = groups[k];
        if (k === last) return it.render(c, Object.assign({}, o, c.state === 'answered' || !ans ? {} : { shown: ans, ink: 'trace' }));
        const blankC = Object.assign({}, c, { state: 'blank' });
        if (g.draw !== null && t) {
            try { return unslot(t.stepState(Object.assign({}, ((it.q && it.q.cell) || {}).payload || {}), merged, g.draw, Object.assign({}, blankC, { step: g.draw }))); } catch (e) { /* the blank problem */ }
        }
        return unslot(it.render(blankC, o));
    };
    const stateItem = (k) => { const pi = planItem(it, {
        cols: side ? 2 : 1, level: 3, nolabel: true,
        render: (c, o) => {
            const list = `<div class="mq-mtext" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:1.5mm;padding:1mm 0 0">${stepList(steps, groups[k].steps)}</div>`;
            const draw = `<div class="mq-mdraw" style="${side ? 'flex:0 0 50%;max-width:50%;' : ''}display:flex;flex-direction:column;align-items:center">${drawing(k, c, o)}</div>`;
            return `<div class="mq-mstate" style="width:100%;display:flex;flex-direction:${side ? 'row' : 'column'};align-items:${side ? 'flex-start' : 'stretch'};gap:3mm">${side ? draw + list : list + draw}</div>`;
        },
    }); return Object.assign(pi, { cls: `${pi.cls} mq-mstatecell`.trim() }); };
    // the states dealt over pages: each page as full as its room holds (the Say band on the last page), never a lone state
    // on a page when a fairer deal of the same pages has none (critic r2 D8)
    const room = (pg, isLast) => (pg ? mCont.budget : m.budget) - m.strip - (isLast ? m.say : 0);
    const pages = [];
    let i = 0;
    while (i < groups.length) {
        let used = 0;
        const take = [];
        while (i + take.length < groups.length && used + Hs[i + take.length] <= room(pages.length, i + take.length === last)) { used += Hs[i + take.length]; take.push(i + take.length); }
        if (!take.length) take.push(i);
        // a lone last state: move one state down from this page when it has two or more
        if (take.length >= 2 && i + take.length === groups.length - 1) take.pop();
        pages.push(take);
        i += take.length;
    }
    const out = pages.map((take, p) => {
        const H = take.reduce((h, k) => h + Hs[k], 0);
        const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'),
            content: Object.assign(gridPart(take.map(stateItem), { cols: 1, rows: take.length, labels: 'none' }), {
                height: `${Math.round(H * 100) / 100}mm`,
                rowsTpl: take.map((k) => `${Hs[k]}fr`).join(' '),
            }) }];
        if (p === pages.length - 1) sections.push({ kind: 'say', frame: oralFrameOf(it, { fill: true }) });
        return { sections };
    });
    return assemble(ROLE_ID, input, frame, out, {
        scaffoldLevel: 3,
        meta: { items: 1, scoreOutOf: 0, states: groups.length, steps: steps.length, cols: side ? 2 : 1,
            fits: [{ cols: 1, rows: groups.length, line: `Fits: ${steps.length} steps in ${groups.length} states, ${out.length} page${out.length > 1 ? 's' : ''}.` }] },
    });
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
    // R1-3: a model whose template draws no per-step trace (every skill but a count row) is drawn by its grouped states
    if (!marks) return groupedPlan(input, it, steps, frame, ctx);
    const cols = fitsAt([it], 2, ctx) ? 2 : 1;
    const textH2 = 2 * (m.pitch + 1.5) + 6, textH1 = (m.pitch + 1.5) + 6;
    // A state too wide for the half-width state column (a word problem, a wide picture) takes the
    // full width, with its step text over it in the same row (PT-MOD-2 cannot hold it beside).
    const h1 = hMinAt([it], 1, ctx);
    let H = cols === 2 ? Math.max(hMinAt([it], 2, ctx), textH2) : h1 + textH2;
    const room1 = m.budget - m.strip - m.say;
    const roomC = mCont.budget - m.strip - m.say;
    // Every skill: the pages as they always were (a page holds what fits with the Say band's room kept), the states dealt so no
    // page holds a lone state where the same pages allow it ([3, 1] -> [2, 2], [3, 3, 1] -> [3, 2, 2]; critic r2 D8, r4 D12).
    let deal = dealOf(steps.length, Math.max(1, Math.floor(room1 / H)), Math.max(1, Math.floor(roomC / H)));
    if (marks && cols === 1) {
        // A COUNT ROW (marks non-null: the count-row template with the provider's traced steps) re-plans. Its candidates:
        //  - the step text on one line (critic r1 D5: every step <= 48 characters is one line across the full-width state);
        //  - steps 2 and 3 as one state, when both are the same parallel action "a + n = b. Write b." (critic r2 D8 / r3 D10:
        //    a rule-finding step never merges; every other skill keeps one action per state, PEDAGOGY P-1);
        //  - the pages measured exactly: the Say band stands on the LAST page only, so a page before it holds what fits without it.
        // The chosen plan has no lone state when any candidate has none, then the fewest pages, then the unmerged steps, then the
        // two-line text (the base layout). So the D5 / D8 one-page models are unchanged, and a model that cannot be one page
        // pairs its states (2 + 2) instead of leaving one alone (D12: 1 + 2 + 1 on A4, 1 + 1 + 1 + 1 on Letter).
        const parallel = (t) => /^[\d,]+ [+\u2212-] [\d,]+ = [\d,]+\. Write [\d,]+\.$/.test(String(t).trim());
        const variants = [{ steps, marks, merged: 0 }];
        if (steps.length >= 4 && parallel(steps[1]) && parallel(steps[2])) {
            variants.push({ steps: [steps[0], `${steps[1]} ${steps[2]}`, ...steps.slice(3)], marks: [marks[0], marks[2], ...marks.slice(3)], merged: 1 });
        }
        const texts = [{ tH: textH2, one: 0 }];
        if (steps.every((t) => t.length <= 48)) texts.push({ tH: textH1, one: 1 });
        const exactDeal = (n, Hs) => {
            // the fewest pages P whose pages hold n states with the Say band on page P only, each page >= 2 when that can be
            const capAt = (k, P) => Math.floor(((k ? mCont.budget : m.budget) - m.strip - (k === P - 1 ? m.say : 0)) / Hs);
            for (let P = 1; P <= n; P++) {
                const caps = Array.from({ length: P }, (_, k) => capAt(k, P));
                if (P === 1 && caps[0] >= n) return [n];
                const even = P > 1 ? spread(n, caps) : null;
                if (even) return even;
            }
            return null;   // no lone-free deal: the greedy deal (dealOf) stands
        };
        const better = (a, b) => { for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return a[k] < b[k]; return false; };
        let best = null;
        for (const v of variants) for (const t of texts) {
            const Hs = h1 + t.tH;
            for (const d of [dealOf(v.steps.length, Math.max(1, Math.floor(room1 / Hs)), Math.max(1, Math.floor(roomC / Hs))), exactDeal(v.steps.length, Hs)]) {
                if (!d) continue;
                // the merged text is long: two lines (textH2) even when the unmerged steps are one line each
                if (v.merged && t.one && !v.steps.every((x) => x.length <= 48)) continue;
                const score = [hasLone(d, v.steps.length) ? 1 : 0, d.length, v.merged, t.one];
                if (!best || better(score, best.score)) best = { score, v, t, d, Hs };
            }
        }
        if (best) { steps = best.v.steps; marks = best.v.marks; H = best.Hs; deal = best.d; }
    }
    const ans = answerOf(it);
    const stepText = (i) => `<div class="mq-steptext"><em>${i + 1}</em><span>${esc(steps[i])}</span></div>`;
    // R1-3: a state before the last is a frozen drawing, not an answer place (no slots, so the key leaves nothing blank, AK-2)
    const stateItem = (i) => planItem(it, {
        cols, level: 3, nolabel: true,
        render: (c, o) => (cols === 1 ? `<div class="mq-steptop">${stepText(i)}</div>` : '')
            + (i === steps.length - 1 ? (x) => x : unslot)(it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o,
                marks ? (Object.keys(marks[i]).length ? { payload: Object.assign({}, o && o.payload, { traceSlots: marks[i] }) } : {})
                    : i === steps.length - 1 && ans ? { shown: ans, ink: 'trace' } : {}))),
    });
    const textItem = (i) => ({
        render: () => stepText(i),
        drawsAnswer: true, nolabel: true, cls: 'mq-stepcell', skill: it.skill,
    });
    const pages = [];
    let i = 0;
    const caps = deal;
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
        scaffoldLevel: 3,
        meta: { items: 1, scoreOutOf: 0, states: steps.length, cols,  fits: [{ cols: 2, rows: steps.length, line: `Fits: ${steps.length} states, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, supports, prepare, plan };
