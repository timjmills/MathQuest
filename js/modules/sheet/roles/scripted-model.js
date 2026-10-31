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
import { isWideRow } from '../cells/count-row.js';

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
/**
 * A one-step story in the word-work SENTENCE layout (visual-quality lane round 2, critic r1 F14): the story is printed
 * ONCE over the frames, and each frame draws the part-whole bar and the number sentence with what its step writes - the
 * places of steps 1..k written, the newest in trace grey (P-LC-9) - so four frames fit one page and none shows empty
 * boxes beside "Write 4 and 13 in the boxes".
 */
const isSentenceStory = (it) => { const cl = it && it.q && it.q.cell; return !!(cl && cl.template === 'word-work' && cl.payload && cl.payload.layout === 'sentence' && (cl.payload.steps || []).length === 1); };
const SENTENCE_SLOTS = /(<span[^>]*data-ws-slot="(fr0-a|fr0-b|op0|answer|bar-w|bar-a|bar-b)"[^>]*>)([^<]*)(<\/span>)/g;
function sentenceFrameAt(html, writtenAt, k) {
    return html.replace(SENTENCE_SLOTS, (m, open, id, val, close) => {
        const g = writtenAt.has(id) ? writtenAt.get(id) : Infinity;
        const bare = open.replace(/ data-ws-ink="[a-z]+"/, '').replace(/color:#(?:000000|000|949494);?/g, '');
        if (k < g) return bare + close;
        const grey = k === g;
        return bare.replace(/^<span /, `<span data-ws-ink="${grey ? 'trace' : 'solid'}" `).replace(/ style="/, ` style="color:${grey ? '#949494' : '#000'};`) + val + close;
    });
}

export function prepare(it) {
    // (a sentence story's frames draw no story: it is printed once over them - measured that way, so the rows fit)
    if (isSentenceStory(it)) {
        const render = (c, o = {}) => it.render(c, Object.assign({}, o, { payload: Object.assign({}, o.payload, { lines: [] }) }));
        return Object.assign({}, it, { render, measured: null, storyLines: it.q.cell.payload.lines.slice() });
    }
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
    const textH2 = 2 * (m.pitch + 1.5) + 6, textH1 = (m.pitch + 1.5) + 6;
    // A state too wide for the half-width state column (a word problem, a wide picture) takes the
    // full width, with its step text over it in the same row (PT-MOD-2 cannot hold it beside).
    const h1 = hMinAt([it], 1, ctx);
    let H = cols === 2 ? Math.max(hMinAt([it], 2, ctx), textH2) : h1 + textH2;
    // (a sentence story prints its story once over the frames: its lines come off the first page's room)
    const story = isSentenceStory(it) && Array.isArray(it.storyLines) ? it.storyLines : null;
    const storyMm = story ? story.length * (m.pitch + 1.6) + 5 : 0;
    const room1 = m.budget - m.strip - m.say - storyMm;
    const roomC = mCont.budget - m.strip - m.say - storyMm;
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
    // the sentence story: the step that first writes each place (the provider's worked-step marks)
    const writtenAt = new Map();
    if (story) providerWorkedSteps(it, 6).forEach((st, g) => (st.marks || []).forEach((mk) => { if (mk && mk.slot && !writtenAt.has(mk.slot)) writtenAt.set(mk.slot, g); }));
    const stepText = (i) => `<div class="mq-steptext"><em>${i + 1}</em><span>${esc(steps[i])}</span></div>`;
    const stateItem = (i) => planItem(it, {
        cols, level: 3, nolabel: true,
        render: (c, o) => (cols === 1 ? `<div class="mq-steptop">${stepText(i)}</div>` : '')
            + (story ? sentenceFrameAt(it.render(Object.assign({}, c, { state: 'answered' }), o), writtenAt, i) : it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o,
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
        const grid = gridPart(cells, { cols, rows: take.length, cellH: H, labels: 'none' });
        const storyHtml = story ? `<div class="mq-wwstory mq-modelstory" style="padding:1.5mm 4mm 2mm;font-size:${m.textPt + 2}pt;line-height:1.3;">${story.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : '';
        const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'), ...(story ? { contents: [{ kind: 'html', html: storyHtml }, grid] } : { content: grid }) }];
        i += take.length;
        if (i >= steps.length) sections.push({ kind: 'say', frame: oralFrameOf(it, { fill: true }) });
        pages.push({ sections });
    }
    return assemble(ROLE_ID, input, frame, pages, {
        nothingToAnswer: true, scaffoldLevel: 3,
        meta: { items: 1, scoreOutOf: 0, states: steps.length, cols,  fits: [{ cols: 2, rows: steps.length, line: `Fits: ${steps.length} states, ${pages.length} page${pages.length > 1 ? 's' : ''}.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, supports, prepare, plan };
