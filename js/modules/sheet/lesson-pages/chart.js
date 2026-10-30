// js/modules/sheet/lesson-pages/chart.js
// LESSON PAGE BUILDER "chart" (design/LESSON_LIBRARY_PLAN.md §8c; PAGE_TYPES 7.2): the ANCHOR CHART - the worked example
// picked, drawn step by step in panels, the other cases whole, the Say line and the chant (was: Worked example /
// scripted Model). The archetype draws the states (sheet/lesson-arch/*); this builder is the same for every one.
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { frameOf, layoutHeader, bandMetrics, planItem, gridPart, poolItems, answerOf, oralFrameOf, operandsOf, esc } from '../roles/compose.js';
import { resolveCtx } from '../index.js';
import { workedStepsOf, stepTemplateOf, unslot, easeScore } from '../anchors.js';
import { evenGridState } from '../cells/mult-grid.js';
import { stepIcon } from '../lesson-icons.js';
import { numberWords } from '../cells/words.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { factMarks, panelHops } from '../lesson-arch/fact.js';
import { checkStackOf } from '../lesson-arch/column.js';
import { roundState, isRound, chartLineMmOf } from '../lesson-arch/line.js';
import { pvNumberOf, isExpand, expandState } from '../lesson-arch/pv.js';
import { isWordBar, chartStepsOf, barState } from '../lesson-arch/story.js';
import { EXAMPLE_KEYS, sigOf, digitsOfOps, stateGroups, namedSteps, stepMarker, hOf } from './common.js';

/**
 * The worked example: an item of the skill whose provider steps show the strategy the lesson
 * teaches (`example.match`), with as many steps as the lesson's step list (so step n of the list
 * is state n of the Model), and ordinary numbers - the lower third of the candidates by size (the
 * research: easy numbers first, but never the trivial 1 + 1).
 */
export function pickExample(items, data) {
    const re = data && data.example && data.example.match ? new RegExp(data.example.match, 'i') : null;
    const want = data && Array.isArray(data.steps) ? data.steps.length : 0;
    const all = items.map((it, i) => ({ it, i, steps: workedStepsOf(it) })).filter((x) => x.steps.length >= 2);
    const tiers = [
        all.filter((x) => (!re || re.test(x.steps.map((s) => s.text).join(' '))) && (!want || x.steps.length === want)),
        all.filter((x) => !re || re.test(x.steps.map((s) => s.text).join(' '))),
        all,
    ];
    let pool = tiers.find((t) => t.length) || [];
    if (!pool.length) return items[0] || null;
    // `example.test`: the case the first example models (the second example models the other).
    const caseTest = data && data.example && CASE_TESTS[data.example.test];
    if (caseTest && pool.some((x) => caseTest(x.it))) pool = pool.filter((x) => caseTest(x.it));
    // Every step shows on the chart: the example whose steps make the most marks (a subtraction
    // whose tens answer is 0 leaves its tens step with nothing drawn).
    const marks = (x) => x.steps.filter((s) => (s.marks || []).length).length;
    const most = Math.max(...pool.map(marks));
    pool = pool.filter((x) => marks(x) === most);
    // `example.prefer`: the lesson's own taste in examples (rounding: a ones digit of 6-8, so the
    // move to the nearer ten is seen, not a 1-tick hop from 79).
    const pref = data && data.example && data.example.prefer ? new RegExp(data.example.prefer) : null;
    if (pref && pool.some((x) => pref.test(String((x.it.q && x.it.q.text) || '')))) pool = pool.filter((x) => pref.test(String((x.it.q && x.it.q.text) || '')));
    const sorted = pool.slice().sort((a, b) => easeScore(a.it.q) - easeScore(b.it.q) || a.i - b.i);
    // Two digits beat one for a column skill: the example has the widest operands the skill deals.
    const widest = Math.max(...sorted.map((x) => digitsOfOps(x.it).split(',').reduce((s, d) => s + Number(d || 0), 0)));
    const wide = sorted.filter((x) => digitsOfOps(x.it).split(',').reduce((s, d) => s + Number(d || 0), 0) === widest);
    const list = wide.length ? wide : sorted;
    return list[Math.min(list.length - 1, Math.floor(list.length / 3))].it;
}

/**
 * The chart's SECOND worked example (lessons r1): the other case the practice pages deal - the big
 * number second, a 0 in the ones, a number that rounds down - with as many steps as the first.
 */
export function pickSecond(items, example, data, which = 'second', avoid = []) {
    const test = data && data[which] && CASE_TESTS[data[which].test];
    if (!test || !example) return null;
    items = items.filter((it) => !avoid.includes(it));
    const n = workedStepsOf(example).length;
    const re = data.example && data.example.match ? new RegExp(data.example.match, 'i') : null;
    const ex = sigOf(example);
    // Never the example's own numbers turned round (4 + 3 then 3 + 4 teaches nothing new).
    const nums = (it) => operandsOf((it && it.q) || {}).map(Number).sort((a, b) => a - b).join(',');
    const same = nums(example);
    const ok = items.filter((it) => it !== example && sigOf(it) !== ex && test(it) && workedStepsOf(it).length === n && (!same || nums(it) !== same));
    const strat = ok.filter((it) => !re || re.test(workedStepsOf(it).map((st) => st.text).join(' ')));
    const pool = strat.length ? strat : ok;
    if (!pool.length) return null;
    const sorted = pool.slice().sort((a, b) => easeScore(a.q) - easeScore(b.q));
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length / 3))];
}

/**
 * The chart's other examples (lessons r1-r3): the second, third and fourth cases of the lesson
 * data, each from the main pool or its own case pool (`x<key>`), never one another.
 */
export function otherExamples(input, example, data) {
    const cands = poolItems(input, 'main').concat(...EXAMPLE_KEYS.map((k) => poolItems(input, `x${k}`)));
    const out = [];
    for (const k of EXAMPLE_KEYS) {
        if (k !== 'second' && !out[0]) break;
        out.push(pickSecond(cands, example, data, k, out.filter(Boolean)));
    }
    return { ex2: out[0] || null, ex3: out[1] || null, ex4: out[2] || null };
}

/** The drawing of state k of the example (no slots: the Model is never scored, AK-1). */
export function stateDrawing(it, steps, groups, k, c) {
    if (isWordBar(it) && steps.length && /^bar-step-/.test((((steps[0] || {}).marks || [])[0] || {}).slot || '')) return unslot(barState(it, k, c));
    const merged = groups.map((g) => ({ marks: g.marks }));
    const ctx = resolveCtx(Object.assign({}, c, { state: 'blank', scaffoldLevel: 3, metrics: undefined }));
    if (isRound(it)) return unslot(roundState(it, k, ctx, Number(c.chartLineMm) > 0 ? Number(c.chartLineMm) : ({ S: 44, M: 52, L: 58 }[c.size] || 58)));
    if (isExpand(it)) return unslot(expandState(it, merged, k, c));
    // (an even-products window, detailed lesson 4: its own step states - the rows, then the columns, then odd x odd)
    if (it.q && it.q.cell && it.q.cell.template === 'mult-grid' && merged.some((g) => (g.marks || []).some((m) => m && m.slot === 'even-rows'))) {
        let html = '';
        try { html = it.render(Object.assign({}, ctx, { gridSteps: evenGridState(it.q.cell.payload || {}, merged, k) }), { cols: 2 }); } catch (e) { html = ''; }
        return unslot(html);
    }
    const t = stepTemplateOf(it);
    if (t) {
        const payload = Object.assign({}, it.q.cell.payload || {});
        if (it.q.cell.template === 'fact' && !payload.pt) payload.pt = ctx.metrics.digitPt;
        let html = t.stepState(payload, merged, k, Object.assign({}, ctx, { step: k }));
        if (it.q.cell.template === 'fact') html = factMarks(html, it, steps, groups, k, !!c.hops);
        return unslot(html);
    }
    // A template with no step states: the problem blank, then answered in grey on the last state.
    const ans = answerOf(it);
    const last = k === groups.length - 1;
    let html = '';
    try { html = last && ans ? it.render(ctx, { cols: 2, shown: ans, ink: 'trace' }) : it.render(ctx, { cols: 2 }); } catch (e) { html = ''; }
    return unslot(html);
}

/** The chart layout by state count: 4 -> 2 x 2 panels; 2 or 3 -> full-width rows. */
export const chartLayout = (n, data = null) => (data && data.chartWide ? { cols: 1, rows: n, variant: 'col' }
    : n >= 4 ? { cols: 2, rows: Math.ceil(n / 2), variant: 'col' } : { cols: 1, rows: n, variant: 'row' });
// `chartWide` (lesson data; the detailed lesson maker, 2026-10-16): a drawing too wide for half the
// page (expanded form, 3 boxes) - every panel is a full-width row, the step head above its drawing.

/**
 * The ANCHOR CHART's state items (owner ruling 2026-09-25: "the I Do example should be like an
 * anchor chart they can use for the rest of the problems"): each panel is one step - a big step
 * header (numeral, icon, the step's name), the problem drawn as it looks after that step (the
 * newest marks grey, earlier ones black, P-LC-9), and the provider's words for THIS problem.
 * Host-shaped so the host measures them; `drawOnly` measures the drawing alone (for its zoom).
 */
export function stateItems(example, data) {
    const ws = data && Array.isArray(data.chartSteps) && isWordBar(example) ? chartStepsOf(example, data) : workedStepsOf(example);
    // `tailLast` (lesson data; the detailed lesson maker): the closing step ("Read it with plus")
    // writes nothing new - it is the line under the panels, not a panel of its own.
    const steps = data && data.tailLast ? ws.map((st, i) => (i === ws.length - 1 ? Object.assign({}, st, { marks: [] }) : st)) : ws;
    if (!steps.length) return [];
    const groups = stateGroups(steps);
    const named = namedSteps(steps, data);
    const { variant } = chartLayout(groups.length, data);
    const drawing = (k, c) => stateDrawing(example, steps, groups, k, c);
    // Lessons r1: a closing step that draws nothing ("Check: add back") is not squeezed into the
    // last panel: it gets a line of its own under the panels, its words beside its name.
    const marked = (i) => ((steps[i] && steps[i].marks) || []).length > 0;
    const lastMark = steps.map((_, i) => i).filter(marked).pop();
    const tail = lastMark === undefined ? [] : steps.map((_, i) => i).filter((i) => i > lastMark && !marked(i));
    const headSteps = (g) => g.steps.filter((i) => !tail.includes(i));
    const base = {
        q: null, key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        footprint: { wMm: 40, hMm: null, measure: true, maxCols: 4 }, fclass: 'standard', measureLevel: 3,
        template: 'lesson-state', skill: example.skill || '', pool: 'extra',
        // A panel lays itself out per column count on purpose (its heading wraps): not a collapse.
        colsLayout: true,
    };
    const panels = groups.map((g, k) => Object.assign({}, base, {
        lessonState: k,
        cellCls: `mq-cstatecell mq-cstate-${variant}cell`,
        render: (c, o) => {
            const z = Number(c.chartZoom) > 0 ? Number(c.chartZoom) : 1;
            // Lessons r2: a 3-column chart (the panels share the grid with the other examples)
            // stacks every panel as a column, its number line as long as the narrower panel.
            const cols = (o && o.cols) || 0;
            const v = cols >= 3 ? 'col' : variant;
            // A rounding panel draws its number line across the panel (the line IS the picture).
            if (isRound(example) && !c.chartLineMm) c = Object.assign({}, c, { chartLineMm: chartLineMmOf(v, cols, c.size) });
            const iconMm = { S: 7, M: 8.5, L: 10 }[c.size] || 10;
            const heads = headSteps(g).map((i) => `<div class="mq-chead">${stepMarker(i + 1)}${stepIcon(named[i].icon, c.size, { mm: iconMm })}<b>${esc(named[i].name)}</b></div>`).join('');
            const words = headSteps(g).map((i) => named[i].words).filter(Boolean);
            const notes = headSteps(g).map((i) => named[i].note).filter(Boolean);
            const wordsHtml = words.length || notes.length ? `<div class="mq-cwords">${words.map((w) => `<div>${esc(w)}</div>`).join('')}${notes.map((w) => `<div class="mq-cnote">${esc(w)}</div>`).join('')}</div>` : '';
            // Lessons r3: a panel whose step counts on draws the hops beside its words (the side
            // column has the room; under the fact they would push the panels past the page).
            const hops = v === 'row' ? panelHops(example, steps, groups, k) : '';
            const draw = `<div class="mq-cdraw" style="zoom:${z}">${drawing(k, v === 'row' ? c : Object.assign({}, c, { hops: true }))}</div>`;
            return v === 'row'
                ? `<div class="mq-cstate mq-cstate-row">${draw}<div class="mq-cside"><div class="mq-cheads">${heads}</div>${wordsHtml}${hops}</div></div>`
                : `<div class="mq-cstate mq-cstate-col${cols >= 3 ? ' mq-cstate-n' : ''}"><div class="mq-cheads">${heads}</div>${draw}${wordsHtml}</div>`;
        },
    }));
    const draws = groups.map((g, k) => Object.assign({}, base, {
        lessonDraw: k, cellCls: 'mq-cdrawcell',
        render: (c) => `<div class="mq-cdraw">${drawing(k, c)}</div>`,
    }));
    const tails = tail.length ? [Object.assign({}, base, {
        lessonTail: true, cellCls: 'mq-ctailcell', footprint: { wMm: 186, hMm: null, measure: true, maxCols: 1 },
        render: (c) => `<div class="mq-ctail">${tail.map((i) => `<div class="mq-chead">${stepMarker(i + 1)}${stepIcon(named[i].icon, c.size, { mm: { S: 7, M: 8.5, L: 10 }[c.size] || 10 })}<b>${esc(named[i].name)}</b>`
            + `${named[i].words ? `<span class="mq-ctailw">${esc(named[i].words)}</span>` : ''}</div>`).join('')}</div>`,
    })] : [];
    // Lessons r2: the same closing step as a PANEL, for the 3-column chart (its words in the
    // panel's big type, under its name).
    // A subtraction's check ("add back") is drawn as the column addition it is, its answer grey
    // (the step's newest mark), so the panel teaches the check the practice cells ask for.
    const checkDraw = checkStackOf(example);
    const tailPanels = tail.length ? [Object.assign({}, base, {
        lessonTailPanel: true, cellCls: 'mq-cstatecell mq-ctailpcell', tailDraws: !!checkDraw,
        render: (c, o) => {
            const z = Number(c.chartZoom) > 0 ? Number(c.chartZoom) : 1;
            const narrow = ((o && o.cols) || 0) >= 3;
            const iconMm = { S: 7, M: 8.5, L: 10 }[c.size] || 10;
            const heads = tail.map((i) => `<div class="mq-chead">${stepMarker(i + 1)}${stepIcon(named[i].icon, c.size, { mm: iconMm })}<b>${esc(named[i].name)}</b></div>`).join('');
            // The drawing IS the check's words (49 + 18 = 67): a panel with it carries no line.
            const words = checkDraw ? [] : tail.map((i) => named[i].words).filter(Boolean);
            const draw = checkDraw ? `<div class="mq-cdraw" style="zoom:${z}">${checkDraw(c)}</div>` : '';
            return `<div class="mq-cstate mq-cstate-col mq-ctailp${narrow ? ' mq-cstate-n' : ''}"><div class="mq-cheads">${heads}</div>${draw}`
                + `${words.length ? `<div class="mq-cwords">${words.map((w) => `<div>${esc(w)}</div>`).join('')}</div>` : ''}</div>`;
        },
    })] : [];
    return panels.concat(draws, tails, tailPanels);
}

/**
 * The chart's OTHER EXAMPLES, whole (lessons r2): each one drawn as it looks when every step is
 * done (all black), under its case ("0 ones? Regroup a ten.", "4 or less? Round down."), so the
 * chart shows every case the practice pages deal. `list`: [{it, label}].
 */
export function finalItems(list) {
    return list.filter((x) => x && x.it).map((x, j) => ({
        q: null, key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        footprint: { wMm: 40, hMm: null, measure: true, maxCols: 4 }, fclass: 'standard', measureLevel: 3,
        template: 'lesson-final', skill: x.it.skill || '', pool: 'extra', lessonFinal: j, lessonFinalOf: x.it, colsLayout: true, scalesWithCols: true,
        cellCls: 'mq-cfinalcell',
        render: (c, o) => {
            const z = Number(c.chartZoom) > 0 ? Number(c.chartZoom) : 1;
            const cols = (o && o.cols) || 2;
            // The line as long as the column allows (two across: 70 mm; three across, lessons r3:
            // the 90s -> 100 beside the other two, 38 mm) - drawn to the width on purpose.
            const c2 = isRound(x.it) ? Object.assign({}, c, { chartLineMm: chartLineMmOf('col', cols, c.size) }) : c;
            return `<div class="mq-cfinal"><div class="mq-cfinal-h"><b>Another example:</b>${x.label ? ` <span>${esc(x.label)}</span>` : ''}</div>`
                + `<div class="mq-cdraw" style="zoom:${z}">${finalDrawing(x.it, c2)}</div></div>`;
        },
    }));
}

/** An example drawn with every step done, all in black (the chart's other examples). */
function finalDrawing(it, c) {
    const steps = workedStepsOf(it);
    const groups = stateGroups(steps);
    const ctx = resolveCtx(Object.assign({}, c, { state: 'blank', scaffoldLevel: 3, metrics: undefined }));
    if (isRound(it)) return unslot(roundState(it, 4, ctx, Number(c.chartLineMm) > 0 ? Number(c.chartLineMm) : 58));
    // An expanded-form example with a 0 place (the detailed lesson, critic r2): the newest (grey)
    // mark is its 0 part - the part the panel teaches - every other part black.
    if (isExpand(it)) {
        const parts = (it.q.cell.payload.parts || []).map(Number);
        const zeros = parts.map((v, i) => (v === 0 ? `part${i}` : null)).filter(Boolean);
        if (zeros.length) {
            const all = parts.map((v, i) => ({ slot: `part${i}`, value: String(v) }));
            const merged = [{ marks: all.filter((m) => !zeros.includes(m.slot)) }, { marks: all.filter((m) => zeros.includes(m.slot)) }];
            return unslot(expandState(it, merged, 1, c));
        }
    }
    const t = stepTemplateOf(it);
    if (t && it.q.cell.template !== 'fact') {
        const merged = groups.map((g) => ({ marks: g.marks })).concat([{ marks: [] }]);
        return unslot(t.stepState(Object.assign({}, it.q.cell.payload || {}), merged, groups.length, Object.assign({}, ctx, { step: groups.length })));
    }
    return stateDrawing(it, steps, groups, groups.length - 1, c);
}

/**
 * The SECOND example's drawings (lessons r1): each state of it, small, with its step numerals
 * over it - one row on the chart under the panels ("Another example: ...").
 */
export function secondItems(example2) {
    const steps = workedStepsOf(example2);
    if (!steps.length) return [];
    const groups = stateGroups(steps);
    return groups.map((g, k) => ({
        q: null, key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        footprint: { wMm: 40, hMm: null, measure: true, maxCols: 4 }, fclass: 'standard', measureLevel: 3,
        template: 'lesson-second', skill: example2.skill || '', pool: 'extra', lessonSecond: k, lessonSecondOf: groups.length,
        cellCls: 'mq-c2cell',
        render: (c) => `<div class="mq-c2"><div class="mq-c2nums">${g.steps.map((i) => stepMarker(i + 1)).join('')}</div>`
            + `<div class="mq-cdraw">${stateDrawing(example2, steps, groups, k, Object.assign({}, c, { hops: true }))}</div></div>`,
    }));
}

/** The example's fact in the other div_facts Mix forms, as chart examples (roles/lesson.js extras). */
export function sameFactForms(ex) {
    const [a, b] = operandsOf(ex.q || {}).map(Number);
    if (!b || a % b) return [];
    const Q = a / b;
    const cells = {
        standard: { template: 'equation', payload: { a, b, op: '/', result: Q, digits: 2, fact: true } },
        long: { template: 'division', payload: { dividend: a, divisor: b, quotient: Q, workRows: 0, fact: true } },
        fraction: { template: 'equation', payload: { a, b, op: '/', result: Q, notation: 'fraction', digits: 2, fact: true } },
    };
    const names = { standard: 'the same fact across', long: 'the same fact as long division', fraction: 'the same fact as a fraction' };
    return Object.keys(cells).filter((f) => f !== ex.q.divForm).map((f) => ({
        it: Object.assign({}, ex, { template: cells[f].template, q: Object.assign({}, ex.q, { divForm: f, cell: Object.assign({ v: 1 }, cells[f]) }) }),
        label: names[f],
    }));
}

/**
 * The ANCHOR CHART page (PAGE_TYPES 7.2, owner ruling 2026-09-25): a standalone reference - the
 * title, the worked example step by step in big panels, the other case(s) the practice pages
 * deal, the Say line and the lesson's chant. Nothing on it is written, so it has no Name, Date or
 * Score (PT-FRM-4) and is its own key (PT-KEY-7). The host draws it at L at every packet size.
 *
 * Lessons r2: the other examples are RESERVED before the panels are enlarged (the chart that
 * shows one case is no anchor for the rest of the problems). The first layout that fits wins:
 *   row    the panels (zoom >= 1) + the second example's row of states under them;
 *   final  the panels (zoom >= 0.85) + the other examples whole, side by side under them;
 *   grid3  one 3-column grid: the panels, the closing step as a panel, the other examples whole
 *          (zoom >= 0.8);
 *   one    the panels alone (the old fallback: no other example fits at a readable size).
 * The drawing is enlarged (PT-ANC-1's poster exception: nothing is written on it) until the
 * panels fill the body left over, never above 2 x (rows) / 1.6 x (2 x 2) or the panel's width,
 * and a panel grows past its content by a quarter at most, the content centred in it (H13).
 */
export function chartPage(input, ctx, data, example, states, draws, second, tailItem, finals = [], tailPanel = null) {
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const lesson = input.lesson || {};
    const f = frameOf({ skills: target, input, tabId: 'Anchor chart', score: 0, footerLeft: lesson.tagLine });
    const header = Object.assign({}, f.header, { name: false, date: false, score: false });
    const m = bandMetrics(ctx, layoutHeader(header));
    const n = states.length;
    const lay = chartLayout(n, data);
    const chant = data && data.chant ? data.chant : '';
    const chantH = chant ? { S: 13, M: 15, L: 17 }[ctx.size] + 1.5 : 0;
    const cols = lay.cols === 2 ? 2 : 1;
    const tailH = tailItem ? Math.max(12, hOf(tailItem, 1)) : 0;
    const availAll = m.body - m.say - chantH - 2;
    const avail = availAll - tailH;
    // The second example's row: one cell per state, sized to its tallest drawing.
    const k2 = second.length;
    const h2 = k2 ? Math.max(20, ...second.map((x) => hOf(x, Math.min(4, k2)))) : 0;
    const band2 = k2 ? m.strip + h2 : 0;
    // A panel at zoom z: its measured content (header, drawing, words) plus the drawing's growth.
    const base = states.map((st) => hOf(st, cols) + 1);
    const dH = states.map((st, k) => Math.max(1, hOf(draws[k], 2) - 6));
    const dLast = dH[dH.length - 1] || 1;
    const zW = states.map((st, k) => {
        const d = draws[k];
        const fitCols = [4, 3, 2, 1].find((c) => d && d.measured && d.measured[c] && d.measured[c].fits !== false) || 1;
        const boundW = isRound(example) ? 84 : 186 / fitCols - 6;
        const panelW = lay.variant === 'row' ? 186 * 0.42 : 186 / cols - 8;
        return panelW / boundW;
    });
    const zMax = Math.max(1, Math.min(lay.variant === 'row' ? 2 : 1.6, ...zW));
    const H = (z) => Math.max(...states.map((st, k) => base[k] + (z - 1) * dH[k]));
    // The largest zoom in [lo, hi] at which `total(z)` fits `room`; 0 when not even `lo` does.
    const solve = (total, room, lo, hi) => {
        if (total(hi) <= room) return hi;
        if (total(lo) > room) return 0;
        let a = lo, b = hi;
        for (let i = 0; i < 24; i++) { const mid = (a + b) / 2; if (total(mid) <= room) a = mid; else b = mid; }
        return Math.floor(a * 100) / 100;
    };
    const fin = finals.slice(0, 2);
    const fits3 = (x) => !!(x && x.measured && x.measured[3] && x.measured[3].fits !== false);
    let mode = 'one';
    let z = 0;
    let hF = 0;
    // 1. row: the second example's states under the panels, the panels at zoom 1 or more.
    const wide = !!(data && data.chartWide);
    if (k2 && !wide && lay.rows * H(1) + band2 <= avail) { mode = 'row'; z = solve((q) => lay.rows * H(q), avail - band2, 1, zMax); }
    // 2. final: the other examples whole, side by side - three across where a third case fits
    //    (lessons r3: rounding's 90s -> 100), else two; the panels a little smaller.
    let finShown = fin;
    let finCols = 2;
    // `chartWide` (one drawing a row): the other examples whole, one under the other.
    for (const [list, c] of wide ? [[fin, 1], [fin.slice(0, 1), 1]] : [[finals.slice(0, 3), 3], [fin, 2]]) {
        if (mode !== 'one' || (!wide && (lay.cols !== 2 || list.length !== c || (c === 3 && !list.every(fits3)))) || !list.length) continue;
        const hF1 = wide ? list.reduce((a, x) => a + hOf(x, 1), 0) : Math.max(...list.map((x) => hOf(x, c)));
        const HF = (q) => hF1 - (1 - q) * dLast;
        const zb = solve((q) => lay.rows * H(q) + HF(q), avail, 0.85, 1);
        if (zb) { mode = 'final'; z = zb; hF = HF(zb); finShown = list; finCols = c; }
    }
    // 3. grid3: the panels, the closing step and the other examples share one 3-column grid.
    const cells3 = states.concat(tailPanel ? [tailPanel] : [], fin);
    const dOf = (x) => { const k = states.indexOf(x); return k >= 0 ? dH[k] : fin.includes(x) || (x && x.tailDraws) ? dLast : 0; };
    const rows3 = Math.ceil(cells3.length / 3);
    // Each row as tall as its own tallest cell (a panel whose name wraps sets only its own row).
    const rowsAt = (q) => Array.from({ length: rows3 }, (_, r) => Math.max(...cells3.slice(r * 3, r * 3 + 3).map((x) => hOf(x, 3) + 1 + (q - 1) * dOf(x))));
    const sum = (a) => a.reduce((t, v) => t + v, 0);
    if (mode === 'one' && fin.length && cells3.length <= 6 && cells3.every(fits3)) {
        const zc = solve((q) => sum(rowsAt(q)), availAll, 0.8, 1);
        if (zc) { mode = 'grid3'; z = zc; }
    }
    // (a chart with a step-n band under its panels - lesson 3a r4, critic r2 D1: the panels never overflow into the
    // band; below zoom 1 the drawing shrinks a little rather than spill past the grid's rule)
    // (the band's grid takes its own frame rule: a panel measured one-up may still wrap its name - leave it 4 mm a row)
    const availP = tailItem ? avail - 4 * lay.rows : avail;
    if (mode === 'one') z = solve((q) => lay.rows * H(q), availP, 1, zMax) || (tailItem ? solve((q) => lay.rows * H(q), availP, 0.7, 1) || 0.7 : 1);
    const withZoom = (x, c) => Object.assign(planItem(Object.assign({}, x, { render: (cc, o) => x.render(Object.assign({}, cc, { chartZoom: z }), o) }), { cols: c, nolabel: true }), { cls: x.cellCls });
    const sections = [];
    let rowH;
    let room;
    if (mode === 'grid3') {
        room = availAll;
        const hr = rowsAt(z);
        const tot = sum(hr);
        // The spare height goes to the rows in proportion (a row grows by a quarter at most).
        const k = Math.min(1.25, room / tot);
        // (`chartEqualRows`, lesson data - the detailed lesson maker, lesson 5: every row of the grid one height, PG-11)
        const rowsMm = data && data.chartEqualRows ? hr.map(() => Math.max(...hr) * Math.min(1.25, room / (Math.max(...hr) * hr.length))) : hr.map((h) => h * k);
        rowH = Math.max(...rowsMm);
        const grid = gridPart(cells3.map((x) => withZoom(x, 3)), { cols: 3, rows: rows3, labels: 'none', cls: 'mq-chartgrid' });
        grid.rowsTpl = rowsMm.map((h) => `${Math.round(h * 10) / 10}fr`).join(' ');
        grid.height = `${Math.round(sum(rowsMm) * 100) / 100}mm`;
        sections.push(sum(rowsMm) >= room - 2 ? Object.assign(grid, { cls: 'mq-chartgrid', height: '' }) : grid);
    } else {
        room = avail - (mode === 'row' ? band2 : mode === 'final' ? hF : 0);
        rowH = Math.max(H(z), Math.min(room / lay.rows, H(z) * 1.25));
        // The panels take the body left over (by flex: the header's real height is only known to
        // the page) whenever they already use all of it, or when they are rows (the side column
        // spreads).
        const fill = lay.variant === 'row' || lay.rows * rowH >= room - 2;
        const grid = gridPart(states.map((st) => withZoom(st, cols)), { cols, rows: lay.rows, cellH: rowH, labels: 'none', cls: 'mq-chartgrid' });
        sections.push(fill ? Object.assign(grid, { cls: 'mq-chartgrid', height: '' }) : grid);
        if (tailItem) sections.push(gridPart([Object.assign(planItem(tailItem, { cols: 1, nolabel: true }), { cls: tailItem.cellCls })], { cols: 1, rows: 1, cellH: tailH, labels: 'none', cls: 'mq-ctailgrid' }));
        // Height still spare after the panels: the other examples take it, up to a third more.
        const spare = Math.max(0, room - lay.rows * rowH);
        if (mode === 'row') {
            const label = data && data.second && data.second.label ? data.second.label : '';
            sections.push({
                kind: 'band', label: 'Another example:', instr: label,
                content: gridPart(second.map((x) => Object.assign(planItem(x, { cols: Math.min(4, k2), nolabel: true }), { cls: x.cellCls })), { cols: k2, rows: 1, cellH: h2 + Math.min(spare, h2 * 0.3), labels: 'none' }),
            });
        }
        if (mode === 'final') {
            const fr = Math.max(1, Math.ceil(finShown.length / finCols));
            sections.push(gridPart(finShown.map((x) => withZoom(x, finCols)), { cols: finCols, rows: fr, cellH: (hF + Math.min(spare, hF * 0.3)) / fr, labels: 'none', cls: 'mq-cfinalgrid' }));
        }
    }
    // `sayWords` (lesson data; the detailed lesson maker): the Say line reads the example's number
    // name, so the chart shows the number in all three forms (numeral, expanded, words).
    const sayN = data && data.sayWords ? pvNumberOf(example) : null;
    // (`chartSay(q)`, lesson data - the detailed lesson maker, lesson 5 r3: the chart's Say in the lesson's own words, In / Out)
    const ownSay = data && typeof data.chartSay === 'function' && example ? (() => { try { return data.chartSay(example.q); } catch (e) { return ''; } })() : '';
    sections.push({ kind: 'say', frame: ownSay || (sayN !== null ? `${sayN} is ${numberWords(sayN)}.` : oralFrameOf(example || {}, { fill: true })), digits: 2 });
    if (chant) sections.push({ kind: 'html', html: `<div class="ws-band mq-cchantband" style="height:${chantH - 1.5}mm"><div class="mq-cchant"><b>Rule:</b><span>${esc(chant)}</span></div></div>` });
    const shown = mode === 'row' ? 1 : mode === 'final' ? finShown.length : mode === 'grid3' ? fin.length : 0;
    return {
        header, sections, zoom: z, second: shown, mode,
        sizing: { mode, avail: +avail.toFixed(1), room: +room.toFixed(1), rowH: +rowH.toFixed(1), base: base.map((v) => +v.toFixed(1)), dH: dH.map((v) => +v.toFixed(1)), zMax: +zMax.toFixed(2), h2: +h2.toFixed(1), k2, hF: +hF.toFixed(1), h3: cells3.map((x) => +hOf(x, 3).toFixed(1)), fits3: cells3.map(fits3), why3: cells3.map((x) => (x.measureWhy && x.measureWhy[3]) || '') },
    };
}

export default { pickExample, pickSecond, otherExamples, stateDrawing, chartLayout, stateItems, finalItems, finalDrawing, secondItems, sameFactForms, chartPage };
