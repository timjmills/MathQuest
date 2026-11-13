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
    generalSteps, oralFrameOf, assemble, poolItems, answerOf, instructionText, esc, factRows, operandsOf,
} from './compose.js';
import { isWideRow } from '../cells/count-row.js';
import { stepTemplateOf } from '../anchors.js';
import { dotTile, countCueRow } from './guided.js';

/** Model and Guided cells draw grey supports and digit boxes (level 2-3): measure them there. */
export const MEASURE_LEVEL = 3;
export const ROLE_ID = 'scripted-model';

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2, 3, 4];
// (a fact page deals a few, so its Model can be chosen unambiguous and a second worked example found: factModel)
export const counts = (pools, input) => ({ main: factRows(input) ? FACT_DEAL : 1 });

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
// (the templates that draw a state's marks from `traceSlots`: a count row's blanks, a function table's cells - PT-MOD-1, lf-roles)
const TRACE_TEMPLATES = new Set(['count-row', 'function-table']);
export function marksFor(it, steps) {
    const q = it.q || {};
    if (!q.cell || !TRACE_TEMPLATES.has(q.cell.template)) return null;
    const worked = providerWorkedSteps(it, 6).filter((s) => s.text.length <= 90);
    if (worked.length !== steps.length || !worked.some((s) => s.marks.length)) return null;
    const acc = {};
    return worked.map((s) => {
        const fresh = [];
        s.marks.forEach((m) => { if (m && m.slot !== undefined) { const id = String(m.slot).replace(/^blank(\d+)$/, 'b$1'); if (acc[id] !== String(m.value)) fresh.push(id); acc[id] = String(m.value); } });
        // (this step's own marks: drawn grey, the earlier ones black - PT-MOD-1; not enumerable, so traceSlots stays a plain map)
        return Object.defineProperty(Object.assign({}, acc), '__new', { value: fresh, enumerable: false });
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

/**
 * A template that draws this item's step states as payload variants (`statePayload`, lf-placevalue compare r2 - the pv compare
 * item: critic r1 F2, "States 1 and 2 draw the same picture"): state k draws the marks of steps 1..k, step k's grey. null for
 * every other template (they keep the blank states and the traced last one).
 */
function statesOf(it) {
    const t = stepTemplateOf(it);
    return t && typeof t.statePayload === 'function' ? t : null;
}

export function prepare(it, info = {}) {
    // (lf-placevalue compare r2, critic r1 F4: an item its generator marks `noModel` - the compare "=" item, which decides
    // nothing - is never the worked example; the host deals the next one)
    if (it && it.q && it.q.noModel && !(info && info.index)) return null;
    // (a template that draws its step states: the cell is measured as its LAST state - every mark drawn - so each state fits
    // the row the plan sizes from that measure)
    const st = statesOf(it);
    if (st) {
        const ws = providerWorkedSteps(it, 6);
        const fin = st.statePayload(it.q.cell.payload || {}, ws, ws.length - 1).payload;
        const render = (c, o = {}) => it.render(c, Object.assign({}, o, { payload: Object.assign({}, fin, o.payload) }));
        return Object.assign({}, it, { render, measured: null });
    }
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

/* ======================================================================= the fact Model */
/**
 * THE FACT MODEL (lf-ops facts-roles round 2; critic r1 S1-S3, lead ruling 2026-11-12). On a fact page (factRows) whose
 * provider draws its steps (providers' drawStep: a short text and the grey marks each step adds):
 *  - each state carries the marks of steps 1..k in trace grey under (or, a dot tile, beside) the problem - a new grey mark
 *    every step (PT-MOD-1; ws-empty-band MOD-MARKS) - and its short text, 2 lines at most (PT-MOD-2; MOD-LINES);
 *  - the worked example is never ambiguous: its answer is none of its given numbers (10 − 5 = 5 cannot show which 5 is the
 *    answer; `modelOk`);
 *  - a SECOND worked example follows the first, the same layout with another fact of the same number of steps (lead ruling
 *    2026-11-12, so the page fills with teaching); a third when two would leave the page under FACT_FILL used (judged
 *    with 5 points to spare: the estimate is the role's, the page is measured) and three fit;
 *  - the rows grow to at most FACT_GROW x their content to fill the page, the drawing centred up and down in its state.
 * Any other page (or a fact without drawn steps) keeps the plan below unchanged.
 */
const FACT_DEAL = 16, FACT_GROW = 1.4, FACT_FILL = 0.7;
const drawnSteps = (it) => {
    const w = providerWorkedSteps(it, 6);
    return w.length >= 2 && w.slice(0, -1).every((s) => Array.isArray(s.draw) && s.draw.length) ? w : null;
};
/** A worked example whose answer is one of its given numbers is ambiguous (sub_facts 10 − 5 = 5: b = a − b). */
export function modelOk(it) {
    const a = String(answerOf(it) || '').trim();
    const o = operandsOf((it && it.q) || {});
    return a !== '' && o.length >= 2 && !o.some((v) => String(v) === a);
}
const FACT_MODEL_CSS = `<style data-mq-factmodel>
:is(.ws-page,.ws-sheet) .mq-mbody{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-mtile{position:relative}
:is(.ws-page,.ws-sheet) .mq-mtile>span{position:absolute;left:100%;margin-left:2mm}
:is(.ws-page,.ws-sheet) .mq-mtile svg{display:block}
:is(.ws-page,.ws-sheet) .mq-mjots{font-size:var(--ws-text);line-height:1.25;text-align:center;color:#949494}
:is(.ws-page,.ws-sheet) .mq-mgap{display:inline-block;width:2.4em;height:.9em;border-bottom:1pt solid #949494;vertical-align:baseline}
</style>`;
/** The grey lines and the dot tile the steps 0..k have drawn. */
function drawnUpTo(steps, k) {
    const lines = [];
    let tile = 0;
    steps.slice(0, k + 1).forEach((s) => (s.draw || []).forEach((d) => {
        if (d.jot !== undefined) lines.push(String(d.jot));
        else if (d.more !== undefined) { if (lines.length) lines[lines.length - 1] += `, ${d.more}`; else lines.push(String(d.more)); }
        if (d.tile) tile = d.tile;
    }));
    return { lines, tile };
}

function exampleCells(ex, e, across, textMm, stepsOf, rowsEx, row = false) {
    const cells = [];
    const steps = drawnSteps(ex);
    const texts = stepsOf(ex);
    const ans = answerOf(ex);
    steps.forEach((_, i) => cells.push(planItem(ex, {
        cols: across, level: 3, nolabel: true,
        render: (c, o) => {
            const last = i === steps.length - 1;
            const base = ex.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, last && ans ? { shown: ans, ink: 'trace' } : {}));
            // (every state keeps the final state's room: a mark not drawn yet is hidden in place, so the problem
            // stands in the same place in every state, AK-1)
            const d = drawnUpTo(steps, i), fin = drawnUpTo(steps, steps.length - 1);
            const hide = (on) => (on ? '' : ' style="visibility:hidden"');
            // (the tile beside the number it pictures, as on the Guided page: row 2 one digit row down, R3)
            const fd = Number((/--fd:([\d.]+)pt/.exec(base) || [])[1]) || 28;
            const top = countCueRow(ex) === 2 ? `calc(${(fd * 1.15).toFixed(1)}pt + .5mm)` : '.5mm';
            const fact = fin.tile ? `<div class="mq-mtile">${base}<span style="top:${top}${d.tile ? '' : ';visibility:hidden'}">${dotTile(fin.tile)}</span></div>` : base;
            const jots = fin.lines.length ? `<div class="mq-mjots ws-trace" data-ws-ink="trace">${fin.lines.map((l, li) => `<div${hide(li < d.lines.length)}>${esc(li < d.lines.length ? d.lines[li] : l).replace(/__/g, '<span class="mq-mgap" aria-label="gap"></span>')}</div>`).join('')}</div>` : '';
            return (e === 0 && i === 0 ? FACT_MODEL_CSS : '')
                + `<div class="mq-steptop" style="height:${textMm.toFixed(1)}mm"><div class="mq-steptext"><em>${i + 1}</em><span>${esc(texts[i])}</span></div></div>`
                + `<div class="mq-mbody" style="height:calc(100% - ${textMm.toFixed(1)}mm)${row === 'beside' ? ';flex-direction:row;gap:8mm;box-sizing:border-box;padding-top:5mm' : row ? ';box-sizing:border-box;padding-top:7mm;gap:5.5mm' : ''}">${fact}${jots}</div>`;
        },
    })));
    // (a short last row of an example is filled with empty places, so the next example starts its own row)
    for (let p = steps.length; p < rowsEx * across; p++) cells.push({ render: () => '', drawsAnswer: true, nolabel: true, cls: 'mq-stepcell', skill: ex.skill });
    return cells;
}

function factModel(input, ctx, frame, m) {
    const pool = poolItems(input, 'main');
    const cand = pool.filter((it) => drawnSteps(it) && modelOk(it));
    if (!cand.length) return null;
    const ex1 = cand[0];
    const n = drawnSteps(ex1).length;
    const sig = (it) => operandsOf(it.q || {}).join(',');
    const seen = new Set([sig(ex1)]);
    const more = [];
    // (the same strategy first - the same short steps with the numbers left out - then any fact of as many steps)
    const kind = (it) => drawnSteps(it).map((s) => String(s.short || s.text).replace(/\d+/g, '#')).join('|');
    for (const it of [...cand.filter((x) => kind(x) === kind(ex1)), ...cand]) {
        if (seen.has(sig(it)) || it.template !== ex1.template || drawnSteps(it).length !== n) continue;
        seen.add(sig(it)); more.push(it);
    }
    const charMm = 0.5 * m.textPt * (25.4 / 72), lineMm = m.textPt * 1.25 * (25.4 / 72);
    const linesIn = (t, colW) => Math.max(1, Math.ceil((String(t).length * charMm) / colW));
    const room = m.budget - m.strip - m.say;
    // the widest grid (one row an example where it can) whose state texts are 2 lines at most and whose problems fit
    // (critic r2 S4: an even state count is never laid unevenly - 4 states at 3 a row left 2 empty cells - so it takes 2 a row,
    // 2 + 2, and an example the page cannot hold goes on a continuation page, MOD-GRID)
    for (const across of [n, 4, 3, 2].filter((a, i, arr) => a <= n && arr.indexOf(a) === i && !(n % a && n % 2 === 0))) {
        const all = [ex1, ...more];
        const exs = all.filter((it) => fitsAt([it], across, ctx));
        if (exs[0] !== ex1) continue;
        const colW = 186 / across - 6 - 9.5;
        const stepsOf = (it) => drawnSteps(it).map((s) => s.short || s.text);
        if (exs.some((it) => stepsOf(it).some((t) => linesIn(t, colW * 0.92) > 2))) continue;
        const rowsEx = Math.ceil(n / across);
        const textMm = Math.max(...exs.map((it) => Math.max(...stepsOf(it).map((t) => linesIn(t, colW * 0.92))))) * m.textPt * 1.3 * (25.4 / 72) + 4;
        const jotMm = (it) => { const d = drawnUpTo(drawnSteps(it), n - 1); return d.lines.reduce((a, l) => a + linesIn(l, colW), 0) * lineMm + 3; };
        const natural = (k) => hMinAt(exs.slice(0, k), across, ctx) + textMm + Math.max(...exs.slice(0, k).map(jotMm));
        // two examples (lead ruling), a third when two leave the page under FACT_FILL and three fit
        let k = Math.min(2, exs.length);
        while (k > 1 && k * rowsEx * natural(k) > room) k--;
        // (2 + 2 states, one example a page: the second example on a continuation page; the Say band on the last page only)
        if (k === 1 && rowsEx > 1 && exs.length >= 2 && rowsEx * natural(1) <= room) {
            const mC = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
            const roomC = mC.budget - m.strip - m.say;
            // (a state half the page wide holds a narrow column fact's jots BESIDE it, so the ink spans the cell, EB-SIDE; a
            // wide equation keeps them under it. The rows fill the page to FACT_FILL; the drawing sits a little low, so the white
            // the later marks need is over it rather than under it - but not so low that the band over the problem reaches 30 %:
            // critic r3 S5, div_facts L 30.4-31.0 %, so 7 mm, not 10, and 5.5 mm, not 1.5, from the problem to its first mark, EB-GAP; the more gap also keeps state 1's
            // band under its last mark below 35 % on the pixels, PT-MOD-3)
            const H1 = Math.min(Math.min(room, roomC) / rowsEx, Math.max(natural(1), ((FACT_FILL + 0.03) * m.body - m.strip) / rowsEx));
            const pages = exs.slice(0, 2).map((ex, e) => {
                const grid = gridPart(exampleCells(ex, e, across, textMm, stepsOf, rowsEx, ex.template === 'fact' ? 'beside' : 'low'), { cols: across, rows: rowsEx, cellH: H1, labels: 'none' });
                const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'), content: grid }];
                // (the Say band closes the last page and reads the example on it)
                if (e === 1) sections.push({ kind: 'say', frame: oralFrameOf(ex, { fill: true }) });
                return { sections };
            });
            return assemble(ROLE_ID, input, frame, pages, {
                nothingToAnswer: true, scaffoldLevel: 3,
                meta: { items: 2, scoreOutOf: 0, states: 2 * n, cols: across, examples: 2, fits: [{ cols: across, rows: rowsEx, line: `Fits: 2 worked examples of ${n} states, 2 pages.` }] },
            });
        }
        if (k === 2 && exs.length >= 3 && 3 * rowsEx * natural(3) <= room
            && (m.strip + m.say + Math.min(room, 2 * rowsEx * natural(2) * FACT_GROW)) / m.body < FACT_FILL + 0.05) k = 3;
        const R = k * rowsEx;
        const H0 = natural(k);
        if (R * H0 > room) continue;
        const H = Math.min(room / R, H0 * FACT_GROW);
        const used = exs.slice(0, k);
        const cells = [];
        used.forEach((ex, e) => cells.push(...exampleCells(ex, e, across, textMm, stepsOf, rowsEx)));
        const grid = gridPart(cells, { cols: across, rows: R, cellH: H, labels: 'none' });
        const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'), content: grid }, { kind: 'say', frame: oralFrameOf(ex1, { fill: true }) }];
        return assemble(ROLE_ID, input, frame, [{ sections }], {
            nothingToAnswer: true, scaffoldLevel: 3,
            meta: { items: k, scoreOutOf: 0, states: k * n, cols: across, examples: k, fits: [{ cols: across, rows: R, line: `Fits: ${k} worked examples of ${n} states, 1 page.` }] },
        });
    }
    return null;
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
    if (factRows(input)) { const fm = factModel(input, ctx, frame, m); if (fm) return fm; }
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    let steps = stepsFor(it);
    let marks = marksFor(it, steps);
    // (a 1 picture, 3 words state is drawn full width, its picture beside its bank, the step text over it: beside a half-width
    // state the one-line step text left its cell 70-79 % empty - lf-vocab r5, ws-empty-band EB-BAND)
    const cols = it.template !== 'vocab-pick3' && fitsAt([it], 2, ctx) ? 2 : 1;
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
    // A FACT page (factRows; lf-ops facts-roles task, RUBRIC H13): the short fact beside its step text left 35 % of the state
    // cell and 48-72 % of the text cell empty. Its states stand side by side instead, one column a state, each with its
    // step text over it at one height (the facts level), so the row is as tall as one fact and the longest step's text.
    let across = 0, textMm = 0;
    // (a fact too wide for one column a state - div_facts' "42 ÷ 7 = ___" at L - takes two a row: 2 + 2)
    // A TALL state beside its step text (lf-roles, RUBRIC H13; ws-empty-band EB-BAND / EB-SIDE on the text cell): a function
    // table 74 mm tall beside a one-line step left 60-80 % of the text cell empty, and two states a page left half of page 1
    // empty. When the beside layout's text cell would be 30 % or more empty AND it needs more than one page, the states stand
    // side by side like a fact page's (each with its step text over it), if that grid fits one page; every other model -
    // every one-page model of a passed skill among them - keeps its layout.
    // (a count row re-plans itself above; a function table's traced marks draw in any layout)
    const rowMarks = !!marks && it.q && it.q.cell && it.q.cell.template === 'count-row';
    const tallBeside = !factRows(input) && !rowMarks && !story && cols === 2 && steps.length >= 2 && steps.length <= 5
        && hMinAt([it], 2, ctx) * 0.7 >= textH2 && deal.length > 1;
    const acrossOk = (a, em = 0.5) => {
        if (!tallBeside) return true;
        const colW = 186 / a - 6 - 9.5;
        const charMm = em * m.textPt * (25.4 / 72);
        const lines = Math.max(...steps.map((t) => Math.max(1, Math.ceil((String(t).length * charMm) / colW))));
        return lines <= 2 && Math.ceil(steps.length / a) * (hMinAt([it], a, ctx) + lines * m.textPt * 1.3 * (25.4 / 72) + 4) <= room1;
    };
    // (FIVE states - a provider's five worked steps, function_table_easy since its PT-MOD-1 marks: 3 + 2, a row of three over a
    // row of two, never a 2 x 3 grid with an empty state cell, MOD-GRID; lf-roles r8)
    const acrossAt = (factRows(input) || tallBeside) && !rowMarks && !story && steps.length >= 2 && steps.length <= 4
        ? [steps.length, 2].find((a) => steps.length % a === 0 && fitsAt([it], a, ctx) && acrossOk(a))
        : tallBeside && steps.length === 5 && fitsAt([it], 3, ctx) && acrossOk(3, 0.6)
            // (the state draws the SAME at three columns as at two - a word bank that wraps narrower changes the drawing from
            // state to state: identify L, lf-roles r8)
            && hMinAt([it], 3, ctx) <= hMinAt([it], 2, ctx) * 1.02 ? 3 : 0;
    if (acrossAt) {
        across = acrossAt;
        const colW = 186 / across - 6 - 9.5;
        const charMm = 0.5 * m.textPt * (25.4 / 72);
        const lines = Math.max(...steps.map((t) => Math.max(1, Math.ceil((String(t).length * charMm) / colW))));
        textMm = lines * m.textPt * 1.3 * (25.4 / 72) + 4;
        H = hMinAt([it], across, ctx) + textMm;
        deal = [steps.length];
    }
    const acrossRows = across ? Math.ceil(steps.length / across) : 0;
    const ans = answerOf(it);
    // the sentence story: the step that first writes each place (the provider's worked-step marks)
    const writtenAt = new Map();
    if (story) providerWorkedSteps(it, 6).forEach((st, g) => (st.marks || []).forEach((mk) => { if (mk && mk.slot && !writtenAt.has(mk.slot)) writtenAt.set(mk.slot, g); }));
    const stepText = (i) => `<div class="mq-steptext"><em>${i + 1}</em><span>${esc(steps[i])}</span></div>`;
    // (a template that draws its step states: state i's payload and, on the step that writes it, the traced answer)
    const stT = !marks && !story ? statesOf(it) : null;
    const stWs = stT ? providerWorkedSteps(it, 6) : [];
    const stAt = (i) => (stT && stWs.length === steps.length ? stT.statePayload(it.q.cell.payload || {}, stWs, i) : null);
    const stateItem = (i) => planItem(it, {
        cols: across || cols, level: 3, nolabel: true,
        render: (c, o) => (across ? `<div class="mq-steptop" style="height:${textMm.toFixed(1)}mm">${stepText(i)}</div>` : cols === 1 ? `<div class="mq-steptop">${stepText(i)}</div>` : '')
            + (story ? sentenceFrameAt(it.render(Object.assign({}, c, { state: 'answered' }), o), writtenAt, i) : it.render(Object.assign({}, c, { state: 'blank' }), Object.assign({}, o, it.template === 'vocab-pick3' && cols === 1 ? { payload: Object.assign({}, o && o.payload, { wideState: true }) } : {},
                marks ? (Object.keys(marks[i]).length ? { payload: Object.assign({}, o && o.payload, { traceSlots: marks[i], traceNew: marks[i].__new || [] }) } : {})
                    : stAt(i) ? Object.assign({ payload: Object.assign({}, o && o.payload, stAt(i).payload) }, stAt(i).answer && ans ? { shown: ans, ink: 'trace' } : {})
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
        for (const k of take) { cells.push(stateItem(k)); if (cols === 2 && !across) cells.push(textItem(k)); }
        const split = across && take.length % across !== 0;
        const grid = split ? null : across ? gridPart(cells, { cols: across, rows: acrossRows, cellH: H, labels: 'none' }) : gridPart(cells, { cols, rows: take.length, cellH: H, labels: 'none' });
        // (3 + 2: the full rows in `across` columns, the rest in a grid of their own count, same row height)
        const grids = split ? [gridPart(cells.slice(0, across * Math.floor(take.length / across)), { cols: across, rows: Math.floor(take.length / across), cellH: H, labels: 'none' }),
            gridPart(cells.slice(across * Math.floor(take.length / across)), { cols: take.length % across, rows: 1, cellH: H, labels: 'none' })] : null;
        const storyHtml = story ? `<div class="mq-wwstory mq-modelstory" style="padding:1.5mm 4mm 2mm;font-size:${m.textPt + 2}pt;line-height:1.3;">${story.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : '';
        const sections = [{ kind: 'band', label: 'Model:', instr: instructionText('trace-say'), ...(story ? { contents: [{ kind: 'html', html: storyHtml }, grid] } : grids ? { contents: grids } : { content: grid }) }];
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
