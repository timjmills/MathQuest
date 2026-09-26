// js/modules/sheet/roles/lesson.js
// THE LESSON (design/LESSONS_VISION.md, type 1: one lesson per skill). A lesson is a PACKET of
// sheets - this module draws its first sheet and names the parts that follow:
//
//   Page 1, the ANCHOR CHART (owner ruling 2026-09-25: "the I Do example should be like an anchor
//   chart they can use for the rest of the problems"; PAGE_TYPES 7.2). Standalone: title and tab,
//   no Name, Date or Score (nothing is written on it, PT-FRM-4), its own key (PT-KEY-7).
//     panels        ONE worked problem of the skill, one panel per step (2 x 2, or full-width rows
//                   for 2-3 steps): a big step header - the numeral in its circle, the action icon
//                   (lesson-icons.js), the step's name - then the problem's own cell drawn as it is
//                   after that step (P-LC-9: the newest marks grey, earlier ones black; the
//                   template's own `stepState`, the S5 anchor renderer's approach; rounding is drawn
//                   here), then the provider's words for THIS problem. The drawing is enlarged to its
//                   panel (PT-ANC-1's poster exception), never shrunk.
//     Say:          the oral frame filled with the example's numbers (P-17, BD-8)
//     Rule:         the lesson's chant, where it has one ("Top too small? Take a ten!")
//   Page 2 on, the LESSON SHEET (full header, lettered and scored):
//     Vocabulary:   the lesson's words (at most 3, P-LG-6), each matched to its line-art picture:
//                   "Draw a line to match." The key draws the lines.
//     Remember:     the one concept the skill leans on ("1 ten is 10 ones.")
//     Warm-up:      the prerequisite SKILLS, one or two quick items each from the skill's own
//                   generator (host: generateQuestionFor), side by side (or one full-width row each
//                   when a cell is too wide for half the page), each with its library instruction
//     Guided Practice: "we do": 2-3 cells of the skill beside the chart's Steps (the same numerals,
//                   icons and step names), cell 1 with the first step traced in grey, the others
//                   with the step's hints only (P-LC-7); unlabelled, unscored
//     Independent Practice: whole rows of the skill filling the page the Guided band ends on
//   Bands are content-sized and never split (PG-21); a band that does not fit starts the next page
//   under the continuation header, and the spare height goes back into the bands' cells.
//
//   The parts that follow (the host builds them through their own roles, PT-PKT-1):
//     Independent pages x N (roles/independent.js) - massed practice with the chart's step strip
//     Mixed practice (roles/mixed-practice.js) - optional, the skill with earlier skills
//
//   INK-30 (owner ruling 2026-09-25, lesson pages only): the step numerals, their circles and the
//   icons are drawn in the lesson accent (`--mq-lesson-accent`, `data-mq-accent`); everything else,
//   every cell and every answer, stays black, white and one grey.
//
// Every sheet of the packet carries the same "I Can" title (PT-PKT-2) and the lesson's TAGS in
// the teacher footer: the skill id, its grade, its CCSS code and its Essential Elements, from
// js/modules/standards.js (the host passes them; HD-30: codes appear nowhere else).
//
// Protocol (roles/compose.js): sources, measureCols, counts, extras (the drawn blocks the host
// measures), plan. Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, instructionPart, assemble, poolItems, answerOf, oralFrameOf, operandsOf, opOf, labelStyleOf,
    esc, blank,
} from './compose.js';
import { resolveCtx, numeralTracksHTML } from '../index.js';
import { workedStepsOf, stepTemplateOf, unslot, easeScore, stepLines } from '../anchors.js';
import { dotTile, countCueOf, countCueRow } from './guided.js';
import { stepIcon, iconForText } from '../lesson-icons.js';

export const ROLE_ID = 'lesson';
/**
 * The lesson skill's cells are drawn as Guided cells (level 2-3: heads, grey boxes) as well as
 * Independent ones, so they are measured at their tallest; a Warm-up cell is drawn at level 1.
 */
export const MEASURE_LEVEL = (poolId) => (poolId === 'main' ? 3 : 1);
export const PROBE = 16;
const AUTO_COLS = { S: 4, M: 3, L: 3 };
const PT_MM = 25.4 / 72;

/* ============================================================================ the pools */

/** The lesson skill ('main') and one pool per prerequisite skill ('w0', 'w1'). */
export function sources(skills, helpers = {}) {
    const main = skills[0];
    const pre = ((helpers.lesson && helpers.lesson.warmSkills) || []).slice(0, 2);
    return [{ id: 'main', skills: [main] }, ...pre.map((s, i) => ({ id: `w${i}`, skills: [s] }))];
}

export const measureCols = () => [1, 2, 3, 4];

const warmPools = (input) => ((input.pools || []).map((p) => p.id)).filter((id) => /^w\d$/.test(id));

/** How many cells each prerequisite gets in its share of the width. */
function warmShape(pools, input) {
    const ctx = ctxOf(input);
    const ids = Object.keys(pools).filter((id) => /^w\d$/.test(id) && (pools[id] || []).length);
    const out = {};
    // A cell in a half of the width is as wide as a cell of a 4-column page: the measurement at 4
    // columns says whether it fits there (a template's own column cap is for a whole page of it).
    const fitsWidth = (its, c) => its.every((it) => {
        const m = it.measured && it.measured[c];
        return (m ? m.fits !== false : true) && !(c > 1 && (it.fclass === 'word' || it.fclass === 'wide'));
    });
    for (const id of ids) {
        const its = pools[id].slice(0, 3);
        // Two skills share the width half and half; one skill takes the whole width.
        const opts = ids.length > 1 ? [[2, 4], [1, 2]] : [[3, 3], [2, 2], [1, 1]];
        const pick = opts.find(([, c]) => fitsWidth(its, c)) || opts[opts.length - 1];
        out[id] = { k: pick[0], cols: pick[1] };
    }
    // The halves hold the same number of cells, so the Warm-up's cells are one size (CL-3).
    if (ids.length > 1 && ids.some((id) => !fitsWidth(pools[id].slice(0, 3), 2))) {
        // A cell too wide for half the page (a sentence with two boxes, a number line) never
        // shrinks (PG-20): each skill then takes a full-width row of its own (`stack`), two cells
        // where two fit.
        for (const id of ids) out[id] = fitsWidth(pools[id].slice(0, 3), 2) ? { k: 2, cols: 2, stack: true } : { k: 1, cols: 1, stack: true };
        return out;
    }
    if (ids.length > 1) {
        const k = Math.min(...ids.map((id) => out[id].k));
        for (const id of ids) out[id] = k === 2 ? { k: 2, cols: 4 } : { k: 1, cols: 2 };
        // A half whose cells are half as tall as the other half's holds two rows of them, so the
        // row is never sized for a taller item than it holds (H13).
        const hOf1 = (id) => hAt(pools[id].slice(0, 3), out[id].cols);
        const hMax = Math.max(...ids.map(hOf1));
        for (const id of ids) out[id].rows = hOf1(id) > 0 && hOf1(id) * 2 <= hMax * 1.1 ? 2 : 1;
    }
    return out;
}

export function counts(pools, input) {
    const shape = warmShape(pools, input);
    const out = { main: PROBE };
    for (const [id, s] of Object.entries(shape)) out[id] = s.k * (s.rows || 1);
    return out;
}

/* ========================================================================= the example */

const sigOf = (it) => {
    const q = (it && it.q) || {};
    return `${String(q.text || '')}|${JSON.stringify(q.ans)}|${JSON.stringify((q.cell && q.cell.payload) || {})}`;
};
const digitsOfOps = (it) => operandsOf((it && it.q) || {}).map((v) => String(Math.abs(Math.trunc(v))).length).join(',');

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

/** The Guided ("we do") items: the example's kind first (same strategy, same digit shape). */
export function pickWeDo(items, example, data, n) {
    const re = data && data.example && data.example.match ? new RegExp(data.example.match, 'i') : null;
    const ex = sigOf(example);
    const shape = digitsOfOps(example);
    const rest = items.filter((it) => sigOf(it) !== ex);
    const pref = data && data.example && data.example.prefer ? new RegExp(data.example.prefer) : null;
    const same = rest.filter((it) => (!re || re.test(workedStepsOf(it).map((s) => s.text).join(' '))) && digitsOfOps(it) === shape);
    // The lesson's preferred kind of number first (never an end case like 99 as the first try).
    const liked = pref ? same.filter((it) => pref.test(String((it.q && it.q.text) || ''))) : [];
    const out = liked.concat(same.filter((it) => !liked.includes(it))).slice(0, n);
    for (const it of rest) { if (out.length >= n) break; if (!out.includes(it)) out.push(it); }
    return out;
}

/* ===================================================================== the step states */

/**
 * The step groups of the Model: one state per worked step; a closing check (a step that marks
 * nothing, after the last mark) rides with the state before it; at most 4 states.
 */
export function stateGroups(steps) {
    const marked = (i) => ((steps[i] && steps[i].marks) || []).length > 0;
    const lastMark = steps.map((_, i) => i).filter(marked).pop();
    let groups = [];
    steps.forEach((_, i) => {
        if (groups.length && lastMark !== undefined && i > lastMark && !marked(i)) groups[groups.length - 1].push(i);
        else groups.push([i]);
    });
    while (groups.length > 4) {
        // Merge the shortest adjacent pair whose first group marks nothing (a "look" step joins
        // the step it prepares).
        let best = 0;
        for (let i = 0; i < groups.length - 1; i++) if (!groups[i].some(marked)) { best = i; break; }
        groups.splice(best, 2, groups[best].concat(groups[best + 1]));
    }
    groups = groups.filter((g) => g.length);
    return groups.map((g) => ({ steps: g, marks: g.flatMap((i) => (steps[i] && steps[i].marks) || []) }));
}

/** A ring round a number (trace grey on its own step, black after it). No layout: an outline. */
// The ring is the mark, not the digit: the digit keeps its ink (`data-ws-mark`, never `data-ws-ink`,
// which would grey the digit inside it).
const ring = (text, ink) => `<span class="mq-lring${ink === 'trace' ? ' mq-lring-t' : ''}" data-ws-mark="${ink}">${text}</span>`;

/** The ones digit of row 1 or row 2 of a vertical fact, ringed. */
function ringFactRow(html, row, ink) {
    const at = html.indexOf('<span class="op">');
    if (at < 0) return html;
    const head = html.slice(0, at);
    const tail = html.slice(at);
    const last = (s) => {
        const re = /<span>(\d)<\/span>(?![\s\S]*<span>\d<\/span>)/;
        return s.replace(re, (m, d) => `<span>${ring(d, ink)}</span>`);
    };
    if (row === 1) return last(head) + tail;
    const cut = tail.indexOf('<span class="rule">');
    return cut < 0 ? html : head + last(tail.slice(0, cut)) + tail.slice(cut);
}

/** A dot tile in black ink (an earlier step's mark). */
const inkTile = (n, ink) => {
    const svg = dotTile(n);
    return ink === 'trace' ? svg : svg.replace(/#949494/g, '#000').replace(/data-ws-ink="trace"/, 'data-ws-ink="solid"').replace(/stroke-width="\.3"/, 'stroke-width=".265"');
};

/**
 * The count-on marks of an addition fact, by step: "Start with" rings the bigger number, "Count
 * on" puts the dot tile of the smaller one beside it (the Guided page's count cue, H3).
 */
function factMarks(html, it, steps, groups, k) {
    const q = it.q || {};
    const o = operandsOf(q);
    if (opOf(q) !== 'add' || o.length < 2) return html;
    let out = html;
    let tile = null;
    groups.slice(0, k + 1).forEach((g, gi) => {
        const ink = gi === k ? 'trace' : 'solid';
        for (const si of g.steps) {
            const t = (steps[si] && steps[si].text) || '';
            if (/^Start with/i.test(t)) out = ringFactRow(out, o[0] >= o[1] ? 1 : 2, ink);
            if (/^Count on/i.test(t)) tile = ink;
        }
    });
    const n = countCueOf(it);
    if (tile && n) out = `<div class="mq-cuewrap">${out}<span class="mq-cue${countCueRow(it) === 2 ? ' mq-cue-b' : ''}">${inkTile(n, tile)}</span></div>`;
    return out;
}

/**
 * The rounding states (the `pv` template draws no step states of its own): the numeral with its
 * cut line and answer line on top, a number line between the two tens under it.
 *   state 0  the two tens: the line's end labels            (step "27 is between 20 and 30.")
 *   state 1  the digit after the cut underlined, the dot    (step "The digit after the cut is 7 ...")
 *   state 2  the arrow from the dot to the nearer ten       (step "27 rounds to 30.")
 *   state 3  the answer written                             (step "Write 30.")
 */
function roundState(it, k, c, lineMm) {
    const p = (it.q && it.q.cell && it.q.cell.payload) || {};
    const n = Number(p.n);
    const P = Number(p.place) || 10;
    const lo = Math.floor(n / P) * P;
    const hi = lo + P;
    const r = n - lo >= P / 2 ? hi : lo;
    const m = c.metrics;
    const ink = (s) => (k < s ? null : k === s ? 'trace' : 'solid');
    const col = (i) => (i === 'trace' ? '#949494' : '#000');
    let num = numeralTracksHTML(n, { cut: P, arrow: true, size: `${m.digitPt}pt`, underline: ink(1) ? P / 10 >= 1 ? P / 10 : 1 : 0 });
    if (ink(1) === 'trace') num = num.replace(/border-bottom:0\.08em solid #000/, 'border-bottom:0.08em solid #949494');
    const ans = ink(3);
    const slotCtx = resolveCtx({ size: c.size, look: c.look, mode: 'print', state: ans === 'trace' ? 'traced' : ans ? 'answered' : 'blank' });
    const digits = String(hi).length;
    const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits, graded: false, order: 0 }, slotCtx, ans ? { value: String(r), display: String(r) } : null);
    const top = `<div class="mq-lround-top" style="font-size:${m.digitPt}pt">${num}<span style="font-weight:700">${slot}</span></div>`;
    // The line: 11 ticks, the halfway tick taller (RL-13), the ends labelled at step 0.
    const pad = 7;
    const L = lineMm;
    const w = L + pad * 2;
    const labPt = Math.max(12, m.zonePt);
    const axisY = 9;
    const h = axisY + 5 + labPt * PT_MM + 2;
    const X = (v) => pad + (L * (v - lo)) / (hi - lo);
    let body = `<line x1="${pad}" y1="${axisY}" x2="${pad + L}" y2="${axisY}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
    for (let i = 0; i <= 10; i++) {
        const x = pad + (L * i) / 10;
        const half = i === 5;
        body += `<line x1="${x.toFixed(2)}" y1="${axisY - (half ? 4 : 2.4)}" x2="${x.toFixed(2)}" y2="${axisY + (half ? 4 : 2.4)}" stroke="#000" stroke-width="${((half ? 1.5 : 0.75) * PT_MM).toFixed(3)}"/>`;
    }
    const e = ink(0);
    const ly = axisY + 4.6 + labPt * PT_MM * 0.8;
    for (const [x, v] of [[pad, lo], [pad + L, hi]]) {
        body += `<text x="${x.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" font-size="${(labPt * PT_MM).toFixed(3)}" font-weight="700" fill="${col(e)}" style="fill:${col(e)}"${e === 'trace' ? ' data-ws-ink="trace"' : ''}>${v}</text>`;
    }
    const d = ink(1);
    if (d) body += `<circle cx="${X(n).toFixed(2)}" cy="${axisY}" r="1.3" fill="${col(d)}"${d === 'trace' ? ' data-ws-ink="trace"' : ''}/>`;
    const a = ink(2);
    if (a && r !== n) {
        const x1 = X(n), x2 = X(r);
        const dir = x2 > x1 ? 1 : -1;
        const y = axisY - 5.2;
        const sw = a === 'trace' ? PT_MM : 1.5 * PT_MM;
        body += `<path d="M${x1.toFixed(2)} ${(axisY - 1.8).toFixed(2)} Q${((x1 + x2) / 2).toFixed(2)} ${(y - 2.4).toFixed(2)} ${(x2 - dir * 0.8).toFixed(2)} ${(axisY - 2.4).toFixed(2)}" fill="none" stroke="${col(a)}" stroke-width="${sw.toFixed(3)}"/>`
            + `<path d="M${(x2 - dir * 2.4).toFixed(2)} ${(axisY - 4.4).toFixed(2)} L${x2.toFixed(2)} ${(axisY - 2).toFixed(2)} L${(x2 - dir * 0.2).toFixed(2)} ${(axisY - 5).toFixed(2)} Z" fill="${col(a)}"/>`;
    }
    const svg = `<svg class="mq-lround-line" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm" aria-hidden="true" style="display:block;margin:0 auto;font-family:'Andika',sans-serif">${body}</svg>`;
    return `<div class="mq-lround">${top}${svg}</div>`;
}

/** Is this a rounding item (drawn by roundState)? */
const isRound = (it) => {
    const c = it && it.q && it.q.cell;
    return !!(c && c.template === 'pv' && c.payload && c.payload.kind === 'round' && Number.isFinite(Number(c.payload.n)));
};

/** The drawing of state k of the example (no slots: the Model is never scored, AK-1). */
function stateDrawing(it, steps, groups, k, c) {
    const merged = groups.map((g) => ({ marks: g.marks }));
    const ctx = resolveCtx(Object.assign({}, c, { state: 'blank', scaffoldLevel: 3, metrics: undefined }));
    if (isRound(it)) return unslot(roundState(it, k, ctx, Number(c.chartLineMm) > 0 ? Number(c.chartLineMm) : ({ S: 44, M: 52, L: 58 }[c.size] || 58)));
    const t = stepTemplateOf(it);
    if (t) {
        const payload = Object.assign({}, it.q.cell.payload || {});
        if (it.q.cell.template === 'fact' && !payload.pt) payload.pt = ctx.metrics.digitPt;
        let html = t.stepState(payload, merged, k, Object.assign({}, ctx, { step: k }));
        if (it.q.cell.template === 'fact') html = factMarks(html, it, steps, groups, k);
        return unslot(html);
    }
    // A template with no step states: the problem blank, then answered in grey on the last state.
    const ans = answerOf(it);
    const last = k === groups.length - 1;
    let html = '';
    try { html = last && ans ? it.render(ctx, { cols: 2, shown: ans, ink: 'trace' }) : it.render(ctx, { cols: 2 }); } catch (e) { html = ''; }
    return unslot(html);
}

/**
 * The lesson's own step names and icons, aligned with the example's worked steps: step n of the
 * lesson data IS worked step n (the data is written that way); a skill without lesson data takes
 * the provider's words and the icon of their first verb.
 */
export function namedSteps(steps, data) {
    const own = data && Array.isArray(data.steps) && data.steps.length === steps.length ? data.steps : null;
    return steps.map((s, i) => ({
        name: own ? own[i].text : s.text,
        icon: own ? (own[i].icon || iconForText(own[i].text)) : iconForText(s.text),
        words: own ? s.text : '',
    }));
}

/** A step marker: the outlined circle and its numeral in the lesson accent (INK-30, BD-4). */
export const stepMarker = (n) => `<em class="mq-lnum" data-mq-accent>${n}</em>`;

/** The chart layout by state count: 4 -> 2 x 2 panels; 2 or 3 -> full-width rows. */
export const chartLayout = (n) => (n >= 4 ? { cols: 2, rows: Math.ceil(n / 2), variant: 'col' } : { cols: 1, rows: n, variant: 'row' });

/**
 * The ANCHOR CHART's state items (owner ruling 2026-09-25: "the I Do example should be like an
 * anchor chart they can use for the rest of the problems"): each panel is one step - a big step
 * header (numeral, icon, the step's name), the problem drawn as it looks after that step (the
 * newest marks grey, earlier ones black, P-LC-9), and the provider's words for THIS problem.
 * Host-shaped so the host measures them; `drawOnly` measures the drawing alone (for its zoom).
 */
export function stateItems(example, data) {
    const steps = workedStepsOf(example);
    if (!steps.length) return [];
    const groups = stateGroups(steps);
    const named = namedSteps(steps, data);
    const { variant } = chartLayout(groups.length);
    const drawing = (k, c) => stateDrawing(example, steps, groups, k, c);
    const base = {
        q: null, key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        footprint: { wMm: 40, hMm: null, measure: true, maxCols: 4 }, fclass: 'standard', measureLevel: 3,
        template: 'lesson-state', skill: example.skill || '', pool: 'extra',
    };
    const panels = groups.map((g, k) => Object.assign({}, base, {
        lessonState: k,
        cellCls: `mq-cstatecell mq-cstate-${variant}cell`,
        render: (c) => {
            const z = Number(c.chartZoom) > 0 ? Number(c.chartZoom) : 1;
            // A rounding panel draws its number line across the panel (the line IS the picture).
            if (isRound(example) && !c.chartLineMm) c = Object.assign({}, c, { chartLineMm: variant === 'row' ? 70 : ({ S: 62, M: 66, L: 70 }[c.size] || 70) });
            const heads = g.steps.map((i) => `<div class="mq-chead">${stepMarker(i + 1)}${stepIcon(named[i].icon, c.size, { mm: { S: 6, M: 7, L: 8 }[c.size] || 8 })}<b>${esc(named[i].name)}</b></div>`).join('');
            const words = g.steps.map((i) => named[i].words).filter(Boolean);
            const wordsHtml = words.length ? `<div class="mq-cwords">${words.map((w) => `<div>${esc(w)}</div>`).join('')}</div>` : '';
            const draw = `<div class="mq-cdraw" style="zoom:${z}">${drawing(k, c)}</div>`;
            return variant === 'row'
                ? `<div class="mq-cstate mq-cstate-row">${draw}<div class="mq-cside"><div class="mq-cheads">${heads}</div>${wordsHtml}</div></div>`
                : `<div class="mq-cstate mq-cstate-col"><div class="mq-cheads">${heads}</div>${draw}${wordsHtml}</div>`;
        },
    }));
    const draws = groups.map((g, k) => Object.assign({}, base, {
        lessonDraw: k, cellCls: 'mq-cdrawcell',
        render: (c) => `<div class="mq-cdraw">${drawing(k, c)}</div>`,
    }));
    return panels.concat(draws);
}

/**
 * The step reminder of a practice page: the chart's numerals, icons and step names in one strip,
 * so every later problem points back to the anchor chart. Carries its own styles (a practice page
 * does not load the lesson stylesheet).
 */
export function stripHtml(data, steps, size = 'L') {
    const named = namedSteps(steps, data);
    if (!named.length) return '';
    return `<div class="mq-lstrip" data-mq-lesson-strip><b class="mq-lstrip-l">Steps:</b><ol>${named.map((s, i) => `<li>${stepMarker(i + 1)}${stepIcon(s.icon, size)}<span>${esc(s.name)}</span></li>`).join('')}</ol></div>`;
}

/** The strip as a host-shaped item, so the host measures its height at the full width. */
export function stripItem(data, steps) {
    return {
        q: null, render: (c) => stripHtml(data, steps, c.size), key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        cellCls: 'mq-lstripcell', footprint: { wMm: 186, hMm: null, measure: true, maxCols: 1 }, fclass: 'wide', measureLevel: 1,
        template: 'lesson-strip', skill: '', pool: 'extra', lessonStrip: true,
    };
}

/* ======================================================================= the vocabulary */

/** A picture of a vocabulary word: in-house line art or plain Andika (RP-20, INK-7). */
function vocabPicture(pic, c) {
    const m = c.metrics;
    const mm = (v) => `${v.toFixed(2)}mm`;
    switch (pic && pic.kind) {
        case 'glyph': return `<span class="mq-lvpic-glyph" style="font-size:${Math.round(m.digitPt * 1.3)}pt">${esc(pic.text)}</span>`;
        case 'text': return `<span class="mq-lvpic-text" style="font-size:${m.digitPt}pt">${esc(pic.text)}</span>`;
        case 'blocks': {
            // RP: a ten is a rod of ten unit squares, a one is one square (outlined, 0.75 pt).
            const u = { S: 2, M: 2.3, L: 2.6 }[c.size] || 2.6;
            const parts = [];
            let x = 0.5;
            for (let i = 0; i < (pic.tens || 0); i++) {
                parts.push(`<rect x="${x}" y="0.5" width="${u}" height="${u * 10}"/>`);
                for (let j = 1; j < 10; j++) parts.push(`<line x1="${x}" y1="${0.5 + u * j}" x2="${x + u}" y2="${0.5 + u * j}" stroke-width="${(0.5 * PT_MM).toFixed(3)}"/>`);
                x += u + 2;
            }
            for (let i = 0; i < (pic.ones || 0); i++) { parts.push(`<rect x="${x}" y="${0.5 + u * 9}" width="${u}" height="${u}"/>`); x += u + 1.5; }
            const W = x + 0.5, H = u * 10 + 1;
            return `<svg viewBox="0 0 ${W} ${H}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}">${parts.join('')}</g></svg>`;
        }
        case 'trade': {
            // 1 ten -> 10 ones: a rod, an arrow, two rows of five squares.
            const u = { S: 2, M: 2.3, L: 2.6 }[c.size] || 2.6;
            const parts = [`<rect x="0.5" y="0.5" width="${u}" height="${u * 10}"/>`];
            for (let j = 1; j < 10; j++) parts.push(`<line x1="0.5" y1="${0.5 + u * j}" x2="${0.5 + u}" y2="${0.5 + u * j}" stroke-width="${(0.5 * PT_MM).toFixed(3)}"/>`);
            const ax = u + 2.5, ay = u * 5;
            parts.push(`<line x1="${ax}" y1="${ay}" x2="${ax + 6}" y2="${ay}" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`);
            parts.push(`<path d="M${ax + 5.2} ${ay - 1.3} L${ax + 7.6} ${ay} L${ax + 5.2} ${ay + 1.3} Z" fill="#000" stroke="none"/>`);
            const ox = ax + 9.5;
            for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) parts.push(`<rect x="${ox + i * (u + 1)}" y="${ay - u - 0.5 + r * (u + 1)}" width="${u}" height="${u}"/>`);
            const W = ox + 5 * (u + 1) + 0.5, H = u * 10 + 1;
            return `<svg viewBox="0 0 ${W} ${H}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}">${parts.join('')}</g></svg>`;
        }
        case 'line': {
            // A short number line, the two ends labelled and the marked point labelled above it.
            const L = { S: 40, M: 46, L: 52 }[c.size] || 52;
            const pad = 5;
            const labPt = Math.max(12, m.zonePt);
            const top = labPt * PT_MM + 2;
            const axisY = top + 3.5;
            const H = axisY + 4 + labPt * PT_MM + 1.5;
            const W = L + pad * 2;
            const X = (v) => pad + (L * (v - pic.lo)) / (pic.hi - pic.lo);
            let b = `<line x1="${pad}" y1="${axisY}" x2="${pad + L}" y2="${axisY}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
            for (let i = 0; i <= 10; i++) {
                const x = pad + (L * i) / 10;
                const half = i === 5;
                b += `<line x1="${x.toFixed(2)}" y1="${axisY - (half ? 3.4 : 2)}" x2="${x.toFixed(2)}" y2="${axisY + (half ? 3.4 : 2)}" stroke="#000" stroke-width="${((half ? 1.5 : 0.75) * PT_MM).toFixed(3)}"/>`;
            }
            const f = (labPt * PT_MM).toFixed(3);
            b += `<text x="${pad}" y="${(H - 1.5).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.lo}</text>`;
            b += `<text x="${pad + L}" y="${(H - 1.5).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.hi}</text>`;
            b += `<text x="${X(pic.mark).toFixed(2)}" y="${(top - 1).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.mark}</text>`;
            b += `<circle cx="${X(pic.mark).toFixed(2)}" cy="${axisY}" r="1.2" fill="#000"/>`;
            return `<svg viewBox="0 0 ${W} ${H.toFixed(2)}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true" style="font-family:'Andika',sans-serif">${b}</svg>`;
        }
        default: return `<span class="mq-lvpic-text">${esc((pic && pic.text) || '')}</span>`;
    }
}

/** The order the words print in: a rotation, so no word sits under its own picture. */
export const vocabOrder = (n, seed) => {
    const r = n <= 1 ? 0 : 1 + (Math.abs(Number(seed) || 0) % (n - 1));
    return Array.from({ length: n }, (_, i) => (i + r) % n);
};

/** The vocabulary match: pictures on top, the words below in another order; the key draws the lines. */
export function vocabItem(vocab, seed) {
    const list = (vocab || []).slice(0, 3);
    if (!list.length) return null;
    const order = vocabOrder(list.length, seed);          // word position j holds list[order[j]]
    const render = (c) => {
        const answered = c.state && c.state !== 'blank';
        const pics = list.map((v) => `<div class="mq-lvpic"><div class="mq-lvpic-in">${vocabPicture(v.picture, c)}</div><i class="mq-ldot"></i></div>`).join('');
        const words = order.map((i) => `<div class="mq-lvword"><i class="mq-ldot"></i><b>${esc(list[i].word)}</b></div>`).join('');
        const n = list.length;
        // The key: a line from each picture's dot to its word's dot (AK-2: the answer drawn where
        // the pupil draws it).
        const lines = answered ? list.map((_, i) => {
            const j = order.indexOf(i);
            return `<line x1="${((i + 0.5) * 100) / n}" y1="0" x2="${((j + 0.5) * 100) / n}" y2="100" stroke="#000" stroke-width="1pt" vector-effect="non-scaling-stroke" data-ws-ink="solid"/>`;
        }).join('') : '';
        return `<div class="mq-lvocab" style="--n:${n}"><div class="mq-lvrow">${pics}</div>`
            + `<div class="mq-lvgap" data-ws-slot="match" data-ws-shape="draw">${lines ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>` : ''}</div>`
            + `<div class="mq-lvrow">${words}</div></div>`;
    };
    return {
        q: null, render,
        key: { value: '', display: '', slots: {} },
        drawsAnswer: true, visual: false,
        cellCls: 'mq-lvocabcell',
        footprint: { wMm: 180, hMm: null, measure: true, maxCols: 1 },
        fclass: 'wide', measureLevel: 1, template: 'lesson-vocab', skill: '', pool: 'extra', lessonVocab: true,
    };
}

/* ======================================================================== the We-do steps */

/** The lesson's Steps zone beside the Guided cells: the chart's numerals, icons and step names. */
function weDoStepsHtml(data, steps, size) {
    const named = namedSteps(steps, data);
    const chant = data && data.chant ? `<p class="mq-lchant">${esc(data.chant)}</p>` : '';
    return `<div class="mq-lstepszone"><ol class="mq-lsteps">${named.map((s, i) => `<li>${stepMarker(i + 1)}${stepIcon(s.icon, size)}<span>${esc(s.name)}</span></li>`).join('')}</ol>${chant}</div>`;
}

/** The Steps zone as a host-shaped item, so its height is measured at the zone's width. */
export function stepsItem(data, steps) {
    return {
        q: null,
        render: (c) => weDoStepsHtml(data, steps, c.size),
        key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        cellCls: 'mq-lstepscell', footprint: { wMm: 60, hMm: null, measure: true, maxCols: 3 },
        fclass: 'standard', measureLevel: 1, template: 'lesson-steps', skill: '', pool: 'extra', lessonSteps: true,
    };
}

/* =========================================================================== the extras */

const WEDO_W_MM = 62;       // the Steps zone beside the Guided cells: one third of the width (3 columns)

/**
 * The blocks the host measures before the plan (compose.js protocol): the anchor chart's panels
 * and drawings, the vocabulary match, the Steps zone and the practice pages' step strip. The
 * example is chosen here and again in `plan` by the same deterministic rule.
 */
export function extras(input = {}) {
    const lesson = input.lesson || {};
    const data = lesson.data || null;
    const main = poolItems(input, 'main');
    const ex = pickExample(main, data);
    const steps = ex ? workedStepsOf(ex) : [];
    const out = [];
    if (ex) out.push(...stateItems(ex, data));
    const v = vocabItem(data && data.vocab, input.seed);
    if (v) out.push(v);
    if (steps.length) { out.push(stepsItem(data, steps)); out.push(stripItem(data, steps)); }
    // The Independent rows are drawn at level 1, but the pool was measured at the Guided cells'
    // level 3 (heads, grey boxes): a level-1 twin of each item is measured for the rows' height.
    for (const it of main) if (it !== ex) out.push(Object.assign({}, it, { measured: null, measureLevel: 1, lessonIndepOf: it, pool: 'extra' }));
    return out;
}

/* ============================================================================== the plan */

/** A band of a banded page, with its height. */
const band = (h, section, grow = null) => ({ h, sections: Array.isArray(section) ? section : [section], grow });
/** The tallest measured cell of a set at `cols` (mm, + 1 for the grid rules); 0 when unmeasured. */
const hAt = (items, cols) => Math.max(0, ...items.map((it) => (it && it.measured && it.measured[cols] && Number.isFinite(it.measured[cols].hMm) ? it.measured[cols].hMm + 1 : 0)));
/** Do these items fit a cell as wide as a `cols`-column page's (measured; a word problem never shares)? */
const fitsWidth = (items, cols) => items.every((it) => {
    const m = it.measured && it.measured[cols];
    return (m ? m.fits !== false : true) && !(cols > 1 && (it.fclass === 'word' || it.fclass === 'wide'));
});
const hOf = (x, cols) => (x && x.measured && x.measured[cols] && Number.isFinite(x.measured[cols].hMm) ? x.measured[cols].hMm + 1 : 0);

/**
 * The ANCHOR CHART page (PAGE_TYPES 7.2, owner ruling 2026-09-25): a standalone reference - the
 * title, the worked example step by step in big panels, the Say line and the lesson's chant.
 * Nothing on it is written, so it has no Name, Date or Score (PT-FRM-4) and is its own key
 * (PT-KEY-7). The panels share the whole body; each drawing is enlarged to fill its panel
 * (PT-ANC-1's poster exception: nothing is written on it), never above 1.6 x.
 */
function chartPage(input, ctx, data, example, states, draws) {
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const lesson = input.lesson || {};
    const f = frameOf({ skills: target, input, tabId: 'Anchor chart', score: 0, footerLeft: lesson.tagLine });
    const header = Object.assign({}, f.header, { name: false, date: false, score: false });
    const m = bandMetrics(ctx, layoutHeader(header));
    const n = states.length;
    const lay = chartLayout(n);
    const chant = data && data.chant ? data.chant : '';
    const chantH = chant ? { S: 13, M: 15, L: 17 }[ctx.size] + 1.5 : 0;
    // PAGE_TYPES 7.2: the chart's panels need no band label - the title names the skill and each
    // panel its step.
    // The panels take the whole body left under them (the grid fills by flex, PG-10's page-1 grid).
    const gridH = m.body - m.say - chantH - 2;
    const cellH = gridH / lay.rows;
    const cols = lay.cols === 2 ? 2 : 1;
    // The zoom: the panel's height less its words and header, over the drawing's own height; the
    // width the drawing may take (measured: the narrowest column it still fits) caps it too.
    const zooms = states.map((s, k) => {
        const d = draws[k];
        const drawH = Math.max(1, hOf(d, 2) - 6);
        const total = hOf(s, cols === 2 ? 2 : 1);
        const byH = 1 + (cellH - total - 4) / drawH;
        const fitCols = [4, 3, 2, 1].find((c) => d && d.measured && d.measured[c] && d.measured[c].fits !== false) || 1;
        const boundW = isRound(example) ? 84 : 186 / fitCols - 6;
        const panelW = lay.variant === 'row' ? 186 * 0.5 : 186 / cols - 8;
        return Math.max(1, Math.min(lay.variant === 'row' ? 2 : 1.6, byH, panelW / boundW));
    });
    const z = Math.round(Math.min(...zooms) * 100) / 100;
    const items = states.map((s) => Object.assign(planItem(Object.assign({}, s, { render: (c, o) => s.render(Object.assign({}, c, { chartZoom: z }), o) }), { cols, nolabel: true }), { cls: s.cellCls }));
    const sections = [
        Object.assign(gridPart(items, { cols, rows: lay.rows, labels: 'none' }), { cls: 'mq-chartgrid', height: '' }),
        { kind: 'say', frame: oralFrameOf(example || {}, { fill: true }), digits: 2 },
    ];
    if (chant) sections.push({ kind: 'html', html: `<div class="ws-band mq-cchantband" style="height:${chantH - 1.5}mm"><div class="mq-cchant"><b>Rule:</b><span>${esc(chant)}</span></div></div>` });
    return { header, sections, zoom: z };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const lesson = input.lesson || {};
    const data = lesson.data || null;
    const main = poolItems(input, 'main');
    const example = pickExample(main, data);
    const exSteps = example ? workedStepsOf(example) : [];
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const extrasList = input.extras || [];
    const states = extrasList.filter((x) => x.lessonState !== undefined);
    const draws = extrasList.filter((x) => x.lessonDraw !== undefined);
    const vocab = extrasList.find((x) => x.lessonVocab);
    const stepsZone = extrasList.find((x) => x.lessonSteps);
    const labels = labelStyleOf(ctx.look, input.labels);
    const tabId = `Lesson ${lesson.number || 1}`;
    const probeFrame = frameOf({ skills: target, input, tabId, score: 1, footerLeft: lesson.tagLine });
    const m = bandMetrics(ctx, layoutHeader(probeFrame.header));
    const mCont = bandMetrics(ctx, layoutHeader(probeFrame.header), { cont: true });

    /* ---- Vocabulary + Remember */
    const groups = [];
    if (vocab) {
        const vh = Math.max(20, hOf(vocab, 1));
        groups.push(band(m.strip + vh, { kind: 'band', label: 'Vocabulary:', instr: instructionText('match'), content: gridPart([planItem(vocab, { cols: 1, nolabel: true })], { cols: 1, rows: 1, cellH: vh, labels: 'none' }) }));
    }
    const concept = data && data.concepts && data.concepts[0] ? data.concepts[0].text : '';
    if (concept) groups.push(band(m.strip, { kind: 'band', label: 'Remember:', instr: concept, html: '' }));

    /* ---- Warm-up: the prerequisite skills side by side */
    const wIds = warmPools(input);
    const wPools = Object.fromEntries(wIds.map((id) => [id, poolItems(input, id)]));
    const shape = warmShape(wPools, input);
    const halves = wIds.filter((id) => wPools[id].length && shape[id]);
    let letter = 1;
    let warmCount = 0;
    if (halves.length) {
        // `stack`: a skill too wide for half the page gives each skill a full-width row of its own.
        const stacked = halves.some((id) => shape[id].stack);
        const rowsOf = (id) => shape[id].rows || 1;
        const hOwn = (id) => Math.max(20, hAt(wPools[id].slice(0, shape[id].k * rowsOf(id)), shape[id].cols)) * rowsOf(id);
        const hW = Math.max(...halves.map(hOwn));
        const parts = halves.map((id) => {
            const its = wPools[id].slice(0, shape[id].k * rowsOf(id));
            const short = !stacked && hOwn(id) < hW * 0.8;
            const part = {
                kind: 'col', cls: 'mq-lwarmcol',
                parts: [instructionPart(instructionKeyOf(its, input.skills), its),
                    gridPart(its.map((it) => planItem(short ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }) : it, { cols: shape[id].cols })), { cols: shape[id].k, rows: rowsOf(id), cellH: (stacked ? hOwn(id) : hW) / rowsOf(id), labels, start: letter })],
            };
            letter += its.length;
            warmCount += its.length;
            return part;
        });
        if (stacked) {
            const h = halves.reduce((a, id) => a + m.instr + hOwn(id), 0);
            groups.push(band(m.strip + h, { kind: 'band', label: 'Warm-up:', instr: '', content: { kind: 'col', cls: 'mq-lwarmstack', parts } }));
        } else {
            // A library instruction longer than half the width wraps to a second line (BD-10 lets
            // an instruction run to three short sentences); both halves then keep two lines, so
            // the cells start level.
            const charMm = 0.5 * m.textPt * (25.4 / 72);
            const twoLines = parts.length > 1 && parts.some((p) => String(p.parts[0].text || '').length * charMm > 93 - 8);
            if (twoLines) for (const p of parts) p.cls += ' mq-lwarm2';
            const instrH = twoLines ? m.instr * 1.75 : m.instr;
            const content = parts.length > 1 ? { kind: 'row', cls: 'mq-lwarmrow', widths: parts.map(() => '1fr'), parts } : parts[0];
            groups.push(band(m.strip + instrH + hW, { kind: 'band', label: 'Warm-up:', instr: '', content }, { h: hW, grid: parts.map((p) => p.parts[1]), cap: 0.25 }));
        }
    }

    /* ---- Guided Practice ("we do") beside the Steps: the chart's names and icons */
    const rest = main.filter((it) => it !== example);
    // The width left of the Steps zone is two thirds of the page: 2 cells are a 3-column page's
    // cells, 3 cells are narrower (a 4-column page's measurement, plus the fact's cue beside it).
    const colsFor = (k) => (k >= 3 ? 4 : k === 2 ? 3 : 2);
    const cue = (its) => its.some((it) => countCueOf(it));
    let gk = 3;
    const drawnW = (it) => (it.template === 'fact' ? 26 : ((it.footprint && it.footprint.wMm) || 99));
    while (gk > 2 && !(fitsWidth(rest.slice(0, gk), 4) && rest.slice(0, gk).every((it) => drawnW(it) + (cue([it]) ? 10 : 0) <= 124 / gk - 4))) gk--;
    if (gk === 2 && !fitsWidth(rest.slice(0, 2), 3)) gk = 1;
    const zH = hOf(stepsZone, 3);
    // Short cells beside a tall Steps list (a rounding strip beside four steps and a chant) stack
    // in ONE column, three rows, so the band is as tall as the Steps and no cell is mostly empty
    // (H13); otherwise the cells stand side by side.
    const shortH = Math.max(20, hAt(rest.slice(0, 3), 2));
    const stackRows = zH > 0 && rest.length >= 3 && fitsWidth(rest.slice(0, 3), 2) && shortH * 1.8 <= zH ? Math.min(3, Math.floor(zH / shortH)) : 0;
    if (stackRows) gk = stackRows;
    const weDo = example ? pickWeDo(main, example, data, gk) : rest.slice(0, gk);
    const gcols = stackRows ? 2 : colsFor(weDo.length || 1);
    const gH = stackRows ? Math.max(20, hAt(weDo, 2)) * stackRows : Math.max(hAt(weDo, gcols), 20) + (cue(weDo) ? 2 : 0);
    const weH = Math.max(gH, zH);
    // Cells taller than their problem (the Steps set the band's height) centre it (H13).
    const centre = weH > gH * 1.25;
    const weItems = weDo.map((it, i) => planItem(centre ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }) : it, { cols: gcols, level: 2, render: weDoRender(it, i), nolabel: true }));
    const zoneCtx = resolveCtx({ size: ctx.size, look: ctx.look, mode: 'print' });
    const weBand = {
        kind: 'row', cls: 'mq-modelrow mq-lwedorow', widths: ['1fr', `${WEDO_W_MM}mm`],
        parts: [
            { kind: 'band', label: 'Guided Practice:', instr: instructionText(instructionKeyOf(weDo, input.skills), weDo), content: gridPart(weItems, stackRows ? { cols: 1, rows: stackRows, cellH: weH / stackRows, labels: 'none' } : { cols: weDo.length || 1, rows: 1, cellH: weH, labels: 'none' }) },
            { kind: 'band', label: 'Steps:', instr: '', html: `<div class="mq-lstepsbox" style="height:${weH.toFixed(2)}mm">${stepsZone ? stepsZone.render(zoneCtx) : ''}</div>` },
        ],
    };
    // The Guided cells take little of the page's spare height: they are sized to their problems
    // (or to the Steps beside them); the Independent rows under them take the rest.
    if (weDo.length) groups.push(band(m.strip + weH, weBand, { h: weH, grid: [weBand.parts[0].content], box: weBand.parts[1], cap: 0.1 }));

    /* ---- the Remember strip gives way when it alone pushes the Guided band overleaf */
    const total = groups.reduce((a, g) => a + g.h, 0);
    const remember = groups.find((g) => g.sections[0] && g.sections[0].label === 'Remember:');
    if (remember && total > m.budget && total - remember.h <= m.budget) groups.splice(groups.indexOf(remember), 1);

    /* ---- pack the bands onto pages (PG-21: a band is never split) */
    const pages = [];
    let cur = { sections: [], used: 0, budget: m.budget, grows: [] };
    pages.push(cur);
    for (const g of groups) {
        if (cur.used && cur.used + g.h > cur.budget) { cur = { sections: [], used: 0, budget: mCont.budget, grows: [] }; pages.push(cur); }
        cur.sections.push(...g.sections);
        cur.used += g.h;
        if (g.grow) cur.grows.push(g.grow);
    }

    /* ---- Independent Practice: whole rows filling the last page (PT-OPN-7, H5) */
    const used = new Set([example, ...weDo]);
    const indepPool = main.filter((it) => !used.has(it));
    const icWanted = AUTO_COLS[ctx.size];
    const ic = bestCols(indepPool.slice(0, 6), [icWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= icWanted), ctx);
    const twins = new Map(extrasList.filter((x) => x.lessonIndepOf).map((x) => [x.lessonIndepOf, x]));
    const hI = hAt(indepPool.slice(0, ic * 3).map((it) => twins.get(it) || it), ic);
    let indep = [];
    if (Number.isFinite(hI) && hI > 0) {
        const room = cur.budget - cur.used - m.strip;
        // 12.1: an Independent page holds 6 at most; a page of rows fills its height like one.
        const rows = Math.min(Math.max(1, Math.floor(6 / ic)), Math.floor(room / hI));
        if (rows >= 1) {
            indep = indepPool.slice(0, rows * ic);
            const r = Math.ceil(indep.length / ic);
            // The rows take the page's spare height (an Independent page's cells fill the grid,
            // PG-11), never more than half a cell again (H13: no cell mostly empty).
            const cellH = Math.min(room / r, hI * 1.15);
            cur.sections.push({
                kind: 'band', label: 'Independent Practice:', instr: instructionText(instructionKeyOf(indep, input.skills), indep),
                content: gridPart(indep.map((it) => planItem(it, { cols: ic })), { cols: ic, rows: r, cellH, labels, start: letter }),
            });
            cur.used += m.strip + r * cellH;
        }
    }

    /* ---- the spare height of a page goes back into its grids (at most a quarter of a cell) */
    for (const pg of pages) {
        const spare = pg.budget - pg.used;
        const grows = pg.grows.filter((g) => g.grid);
        if (spare <= 2 || !grows.length) continue;
        for (const g of grows) {
            const add = Math.min(spare / grows.length, g.h * (g.cap !== undefined ? g.cap : 0.35));
            for (const part of g.grid) part.height = `${Math.round(((parseFloat(part.height) || g.h) + add) * 100) / 100}mm`;
            if (g.box) g.box.html = g.box.html.replace(/height:[\d.]+mm/, `height:${(g.h + add).toFixed(2)}mm`);
        }
    }

    const score = warmCount + indep.length;
    const frame = frameOf({ skills: target, input, tabId, score, footerLeft: lesson.tagLine });
    const out = [];
    let zoom = 0;
    if (states.length) {
        const chart = chartPage(input, ctx, data, example, states.filter((s) => s.lessonState !== undefined), draws);
        zoom = chart.zoom;
        out.push({ header: chart.header, sections: chart.sections });
    }
    pages.forEach((pg, i) => out.push({
        header: i === 0 ? frame.header : undefined,
        sections: (i > 0 ? [{ kind: 'html', html: '<i class="mq-cont" hidden></i>' }] : []).concat(pg.sections),
    }));
    const plan0 = assemble(ROLE_ID, input, frame, out, {
        scaffoldLevel: 1,
        meta: {
            items: warmCount + weDo.length + indep.length, scoreOutOf: score, warmUp: warmCount, guided: weDo.length, independent: indep.length,
            states: states.length, chartZoom: zoom, example: example ? String((example.q && example.q.text) || '') : '',
            fits: [{ cols: 1, rows: out.length, line: `Fits: an anchor chart of ${states.length} steps, ${warmCount} warm-up, ${weDo.length} guided and ${indep.length} independent on ${out.length} page${out.length > 1 ? 's' : ''}.` }],
            notes: data ? [] : ['No lesson data for this skill yet: the warm-up uses the skills listed before it, with no vocabulary.'],
        },
    });
    // The anchor chart page is no pupil page: the teaching sheet's first page carries the full
    // header, the pages after it the continuation header (HD-20).
    plan0.pages = plan0.pages.map((pg, i) => (i > 0 && !out[i].header && pg.header === frame.header ? Object.assign({}, pg, { header: frame.contHeader }) : pg));
    plan0.cls = [plan0.cls || '', 'mq-lesson'].filter(Boolean).join(' ');
    return plan0;
}

/**
 * The Guided cells (P-LC-7): the step's hints, no traced answer. Cell 1 carries the FIRST STEP of
 * the working in grey (the regrouping of a subtraction written in, the rounding's digit after the
 * cut underlined): the partial scaffold that fades across the row. A count-on fact keeps its dot
 * tile (the count cue) on every Guided cell.
 */
function weDoRender(it, i) {
    return (c, o) => {
        const answered = c.state && c.state !== 'blank';
        if (answered && it.template === 'stack') {
            // The key shows the whole working in black (PT-KEY-2): the regrouping crossed out and
            // written in, the answer digits in their boxes - the example's own states, all done.
            const t = stepTemplateOf(it);
            const steps = workedStepsOf(it);
            // The stack keeps its own answer slot (AK-4: the key has the pupil page's slots).
            if (t && steps.length) return t.stepState(Object.assign({}, it.q.cell.payload || {}), steps.concat([{ marks: [] }]), steps.length, Object.assign({}, c, { state: 'blank', scaffoldLevel: 2 }));
        }
        if (!answered && i === 0) {
            if (isRound(it)) {
                const html = it.render(c, o);
                // The last digit of the numeral: the ones, the digit after the cut.
                return html.replace(/(<td style="[^"]*width:0\.95em[^"]*">)(\d)(<\/td>)(?![\s\S]*width:0\.95em)/, (mm, a, d, b) => `${a}<span class="mq-luline" data-ws-ink="trace">${d}</span>${b}`);
            }
            const t = stepTemplateOf(it);
            const steps = workedStepsOf(it);
            const k = steps.findIndex((s) => (s.marks || []).some((mk) => !/^ring:/.test(mk.slot)));
            if (t && it.q.cell.template === 'stack' && k >= 0 && steps.length > k + 1) {
                const payload = Object.assign({}, it.q.cell.payload || {});
                return t.stepState(payload, [{ marks: [] }, { marks: steps[k].marks }], 1, Object.assign({}, c, { scaffoldLevel: 2 }));
            }
        }
        let html = it.render(c, o);
        // A count-on fact: cell 1 rings the bigger number (step 1, traced); every cell keeps the dot
        // tile of the number counted on (step 2's cue, H3).
        const o2 = operandsOf(it.q || {});
        if (!answered && i === 0 && it.template === 'fact' && opOf(it.q || {}) === 'add' && o2.length >= 2 && o2[0] !== o2[1]) html = ringFactRow(html, o2[0] > o2[1] ? 1 : 2, 'trace');
        const n = countCueOf(it);
        if (n) html = `<div class="mq-cuewrap">${html}<span class="mq-cue${countCueRow(it) === 2 ? ' mq-cue-b' : ''}">${dotTile(n)}</span></div>`;
        return html;
    };
}

/* ========================================================================= the packet */

/**
 * The parts of a lesson packet, in print order (the host builds each through its own role).
 * @param {{practicePages?: number, mixed?: boolean}} o
 */
export function packetParts({ practicePages = 1, mixed = false } = {}) {
    const n = Math.max(0, Math.min(10, Math.floor(Number(practicePages) || 0)));
    return [
        { part: 'teach', role: ROLE_ID },
        ...(n ? [{ part: 'practice', role: 'independent', pages: n }] : []),
        ...(mixed ? [{ part: 'mixed', role: 'mixed-practice' }] : []),
    ];
}

/**
 * The lesson's tag line for the teacher footer (HD-30): skill id, grade, CCSS, EE - the codes
 * from standards.js, never invented; a Pre-K skill has no CCSS and prints none.
 */
export function tagLine({ skillId, grade, ccss = [], ee = [] } = {}) {
    const g = grade === undefined || grade === null || grade === '' ? '' : `Grade ${String(grade).toUpperCase()}`;
    return [skillId, g, ccss.length ? ccss.join(', ') : '', ee.length ? `EE ${ee.join(', ')}` : ''].filter(Boolean).join(' · ');
}

/* =========================================================================== the styles */

export default {
    ROLE_ID, PROBE, sources, measureCols, counts, extras, plan, pickExample, pickWeDo, stateGroups, stateItems, namedSteps,
    stripHtml, stripItem, vocabItem, packetParts, tagLine, chartLayout,
};
