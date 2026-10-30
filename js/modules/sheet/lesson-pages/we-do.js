// js/modules/sheet/lesson-pages/we-do.js
// LESSON PAGE BUILDER "we-do" (design/LESSON_LIBRARY_PLAN.md §8c): the WE DO band - Guided cells of the skill beside the
// chart's Steps (the same numerals, icons and names) or under the step strip, cell 1 with step 1 traced in grey, the
// others with the step's hints only (P-LC-7) (was: Guided).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { planItem, gridPart, instructionText, instructionKeyOf, answerOf, operandsOf, opOf, esc } from '../roles/compose.js';
import { resolveCtx } from '../index.js';
import { workedStepsOf, stepTemplateOf } from '../anchors.js';
import { dotTile, countCueOf, countCueRow } from '../roles/guided.js';
import { stepIcon } from '../lesson-icons.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { ringFactRow } from '../lesson-arch/fact.js';
import { roundLineSvg, roundLineMm, roundLinePad, GUIDED_BOX_MM, isRound } from '../lesson-arch/line.js';
import { isExpand } from '../lesson-arch/pv.js';
import { isWordBar, barNums } from '../lesson-arch/story.js';
import { arrTurnOf } from '../lesson-arch/array.js';
import { winShare } from '../lesson-arch/grid.js';
import { sigOf, digitsOfOps, kindOf, opKindOf, namedSteps, stepMarker, band, hAt, fitsWidth, hOf } from './common.js';
import { stripHtml } from './practice.js';

/** The Guided ("we do") items: the example's kind first (same strategy, same digit shape). */
export function pickWeDo(items, example, data, n) {
    const re = data && data.example && data.example.match ? new RegExp(data.example.match, 'i') : null;
    const ex = sigOf(example);
    const shape = digitsOfOps(example);
    // (an array's turn draws the example's own two arrays - lesson 3a: never a Guided cell)
    const exT = arrTurnOf(example);
    const rest = items.filter((it) => sigOf(it) !== ex && !(exT && arrTurnOf(it) && arrTurnOf(it).rows === exT.cols && arrTurnOf(it).cols === exT.rows));
    const pref = data && data.example && data.example.prefer ? new RegExp(data.example.prefer) : null;
    const same = rest.filter((it) => (!re || re.test(workedStepsOf(it).map((s) => s.text).join(' '))) && digitsOfOps(it) === shape);
    // The Steps beside the cells are the example's steps: a Guided cell first works the SAME
    // steps (the same sign, the same story type) - never "Circle +. Add." beside a take-away story.
    const kind = kindOf(example);
    const opKind = opKindOf(example);
    const sameKind = kind ? rest.filter((it) => kindOf(it) === kind).concat(rest.filter((it) => kindOf(it) !== kind && opKindOf(it) === opKind)) : [];
    // The lesson's preferred kind of number first (never an end case like 99 as the first try).
    const liked = pref ? same.filter((it) => pref.test(String((it.q && it.q.text) || ''))) : [];
    let order = [...new Set([...liked.filter((it) => !kind || sameKind.includes(it)), ...same.filter((it) => sameKind.includes(it)), ...sameKind,
        ...liked, ...same, ...rest])];
    // (`guidedWants` - the detailed lesson maker, lesson 2: the Guided cells' cases, in order, first)
    if (data && Array.isArray(data.guidedWants)) {
        const lead = [];
        // (lesson 2 r4, LR-6: a later Guided case is never a near twin of an earlier one - 7 + 9 then 7 + 8 -
        // nor the same answer; a + item only, so other lessons' wants pick as before)
        const plus = (x) => { const q = (x && x.q) || {}; const st = q.cell && q.cell.payload && (q.cell.payload.steps || [])[0]; const o = operandsOf(q).map(Number); return (q.op === '+' || (st && st.op === '+')) && o.length >= 2 ? o : null; };
        const twin = (x, y) => { const a = plus(x), b = plus(y); if (!a || !b) return false; const da = Math.abs(a[0] - b[0]), db = Math.abs(a[1] - b[1]); return a[0] + a[1] === b[0] + b[1] || (da <= 2 && db <= 2); };
        // (the chart's own fact or its turn-around - LR-5, critic r3 D1)
        const sameFact = (x, y) => { const a = plus(x), b = plus(y); return !!a && !!b && (a.join() === b.join() || a.join() === [b[1], b[0]].join()); };
        // (the first set of cells, in order, that meets every want with no twins and not the chart's own fact)
        // (lesson 2 r5, critic r3 m3: no story person twice on the sheet while the deal can - "Lena has 7 cards" and "Lena has 6")
        const people = (x) => { const ls = (x && x.q && x.q.cell && x.q.cell.payload && x.q.cell.payload.lines) || []; return ls.slice(0, -1).map((l) => (String(l).match(/^([A-Z][a-z]+)\b/) || [])[1]).filter(Boolean); };
        const meets = (x, y, nm) => twin(x, y) || winShare(x, y) || (nm && people(x).some((p) => people(y).includes(p)));
        const pickLead = (k, chosen, nm) => {
            if (k === data.guidedWants.length) return chosen;
            const t = CASE_TESTS[data.guidedWants[k]];
            if (!t) return pickLead(k + 1, chosen, nm);
            for (const x of order) if (!chosen.includes(x) && t(x) && !chosen.some((y) => meets(x, y, nm)) && !sameFact(x, example) && !winShare(x, example)) { const r = pickLead(k + 1, [...chosen, x], nm); if (r) return r; }
            return null;
        };
        const fit = pickLead(0, [], true) || pickLead(0, [], false);
        if (fit) lead.push(...fit);
        else for (const w of data.guidedWants) { const t = CASE_TESTS[w]; const it = t && order.find((x) => !lead.includes(x) && t(x)); if (it) lead.push(it); }
        order = [...lead, ...order.filter((x) => !lead.includes(x))];
    }
    // div_facts Mix (critic R1 D7): the Guided set tries each written form - the forms the
    // example did not show first.
    if (order.length && order.every((it) => it.q && it.q.divMix)) {
        const f = (it) => String(it.q.divForm || '');
        const lead = [];
        for (const it of order) if (f(it) !== f(example) && !lead.some((x) => f(x) === f(it))) lead.push(it);
        order = [...lead, ...order.filter((it) => !lead.includes(it))];
    }
    // Lessons r1: a Guided set is varied - no two with the same answer, at most one "make 10"
    // (a fact whose answer is the band's top), and the big number on both sides where the pool
    // has it (the chart models both).
    const ansOf = (it) => String(answerOf(it) === undefined ? '' : answerOf(it));
    const isFact = (it) => it.template === 'fact';
    const top = Math.max(0, ...order.filter(isFact).map((it) => Number(ansOf(it)) || 0));
    const out = [];
    // Lessons r2: `guided` names the cases of the set, one cell each, in order (rounding: up,
    // down, ends in 5) - a Guided set that only rounds up leaves rounding down unsupported.
    if (data && Array.isArray(data.guided)) for (const name of data.guided) {
        const test = CASE_TESTS[name];
        if (out.length >= n || !test) continue;
        const hit = order.find((it) => !out.includes(it) && test(it) && !out.some((x) => ansOf(x) === ansOf(it) && ansOf(it) !== ''));
        if (hit) out.push(hit);
    }
    for (const it of order) {
        if (out.length >= n) break;
        if (out.includes(it)) continue;
        if (out.some((x) => ansOf(x) === ansOf(it) && ansOf(it) !== '')) continue;
        // Lessons r3: no two Guided cells add or take away the same number (8 + 2, 6 + 2).
        const second = (x) => { const o = operandsOf((x && x.q) || {}); return o.length >= 2 ? String(o[1]) : ''; };
        if (second(it) && out.some((x) => second(x) === second(it))) continue;
        if (isFact(it) && top && Number(ansOf(it)) === top && out.some((x) => Number(ansOf(x)) === top)) continue;
        out.push(it);
    }
    for (const it of order) { if (out.length >= n) break; if (!out.includes(it)) out.push(it); }
    if (out.length >= 2 && out.every(isFact) && !out.some((it) => CASE_TESTS.bigSecond(it))) {
        const swap = order.find((it) => !out.includes(it) && CASE_TESTS.bigSecond(it) && !out.some((x) => ansOf(x) === ansOf(it)));
        if (swap) out[out.length - 1] = swap;
    }
    return out;
}

/** The lesson's Steps zone beside the Guided cells: the chart's numerals, icons and step names. */
export function weDoStepsHtml(data, steps, size) {
    const named = namedSteps(steps, data, { general: true });
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

export const WEDO_W_MM = 62;       // the Steps zone beside the Guided cells: one third of the width (3 columns)

/**
 * The Guided Practice band (roles/lesson.js planOnce, a sheet band of the registry): picks the
 * Guided set and pushes its band (beside the Steps, or under the step strip) onto `env.groups`;
 * `env.weDo` is the set.
 */
export function weDoBand(env) {
    const { input, ctx, m, data, main, example, example2, example3, example4, exSteps, extrasList, stepsZone, groups } = env;
    const rest = main.filter((it) => it !== example && it !== example2 && it !== example3 && it !== example4);
    // The width left of the Steps zone is two thirds of the page: 2 cells are a 3-column page's
    // cells, 3 cells are narrower (a 4-column page's measurement, plus the fact's cue beside it).
    const colsFor = (k) => (k >= 3 ? 4 : k === 2 ? 3 : 2);
    const cue = (its) => its.some((it) => countCueOf(it));
    let gk = 3;
    // A vertical fact is about 26 mm wide. An ACROSS fact ("132 ÷ 12 =", the answer line under it:
    // fact.js's DN-22 'below' form) is as wide as its sentence at the page's digit size - it never
    // shrinks (PG-20) - so 3-digit division facts take 2 Guided cells, not 3 that they overrun.
    const acrossW = (it) => {
        const p = (it.q && it.q.cell && it.q.cell.payload) || {};
        if (!/^horiz/.test(String(p.notation || ''))) return 26;
        const pt = Number(p.pt) || (ctx.metrics && ctx.metrics.digitPt) || 28;
        return (pt * 25.4 / 72) * (0.56 * (String(p.a).length + String(p.b).length) + 2 * 0.8 + 3 * 0.18) + 3;   // + the cell pads the check below leaves out
    };
    // (the widest of the pool: the Guided set is picked from it after this count is chosen)
    const factW = Math.max(26, ...main.filter((it) => it.template === 'fact').map(acrossW));
    const drawnW = (it) => (it.template === 'fact' ? factW : ((it.footprint && it.footprint.wMm) || 99));
    while (gk > 2 && !(fitsWidth(rest.slice(0, gk), 4) && rest.slice(0, gk).every((it) => drawnW(it) + (cue([it]) ? 10 : 0) <= 124 / gk - 4))) gk--;
    if (gk === 2 && !fitsWidth(rest.slice(0, 2), 3)) gk = 1;
    const zH = hOf(stepsZone, 3);
    // Short cells beside a tall Steps list (a rounding strip beside four steps and a chant) stack
    // in ONE column, three rows, so the band is as tall as the Steps and no cell is mostly empty
    // (H13); otherwise the cells stand side by side.
    // A rounding Guided cell carries the chart's number line under its problem (weDoRender).
    const lineExtra = (its) => (its.some(isRound) ? roundLineMm(Math.max(12, (ctx.metrics && ctx.metrics.zonePt) || 12), GUIDED_BOX_MM[ctx.size] || 12) : 0);
    const shortH = Math.max(20, hAt(rest.slice(0, 3), 2) + lineExtra(rest.slice(0, 3)));
    // (one stacked row is not a stack: it left a single Guided cell beside the Steps - critic R1,
    // div_facts long-division lesson - so a stack is at least two rows)
    // (`guidedStack` k on lesson data - the detailed lesson maker, lesson 2: k cells too wide to stand side by side stack beside the Steps)
    const forceStack = data && Number(data.guidedStack) >= 2 && rest.length >= Number(data.guidedStack) ? Math.min(3, Number(data.guidedStack)) : 0;
    const stackRows = forceStack || (zH > 0 && rest.length >= 3 && fitsWidth(rest.slice(0, 3), 2) && shortH * 1.8 <= zH && Math.floor(zH / shortH) >= 2 ? Math.min(3, Math.floor(zH / shortH)) : 0);
    if (stackRows) gk = stackRows;
    const weDoPool = main.filter((it) => it !== example2 && it !== example3 && it !== example4);
    let weDo = example ? pickWeDo(weDoPool, example, data, gk) : rest.slice(0, gk);
    const gcols = stackRows ? 2 : colsFor(weDo.length || 1);
    const gH = stackRows ? Math.max(20, hAt(weDo, 2) + lineExtra(weDo)) * stackRows : Math.max(hAt(weDo, gcols) + lineExtra(weDo), 20) + (cue(weDo) ? 2 : 0);
    const weH = Math.max(gH, zH);
    // Lessons r2 (H13): cells much shorter than the Steps list beside them (the add lesson: the
    // Steps panel 37-46 % empty at its foot), or a lesson whose Guided set names more cases than
    // fit beside the list (rounding: up, down, ends in 5), put the steps in a STRIP over the
    // cells - the practice pages' strip, with the chant under it - and the cells take the width.
    const stripX = extrasList.find((x) => x.lessonStrip);
    const wantN = data && Array.isArray(data.guided) ? Math.min(3, data.guided.length) : 0;
    let top = null;
    // `chartWide` (the detailed lesson maker): a Guided problem too wide to stand beside the Steps
    // takes the strip over the cells and two full-width rows (cell 1 the Model's case).
    const wideG = !!(data && data.chartWide);
    if (wideG && stepsZone && stripX && example) {
        const gw = Math.max(2, Math.min(4, Number(data.guidedRows) || 2));
        const set = pickWeDo(weDoPool, example, data, gw).slice(0, gw);
        if (set.length) top = { set, cols: 1, rows: set.length, h: Math.max(20, hAt(set, 1)) };
    } else if (stepsZone && stripX && weDo.length && !stackRows && (gH < 0.72 * zH || wantN > weDo.length)) {
        const w3 = example ? pickWeDo(weDoPool, example, data, 3) : rest.slice(0, 3);
        const k = w3.length >= 3 && fitsWidth(w3.slice(0, 3), 3) ? 3 : Math.min(2, w3.length);
        const set = w3.slice(0, k);
        const tc = k === 3 ? 3 : 2;
        if (set.length && fitsWidth(set, tc)) top = { set, cols: tc, h: Math.max(20, hAt(set, tc) + lineExtra(set)) + (cue(set) ? 2 : 0) };
    }
    if (top) weDo = top.set;
    // Cells taller than their problem (the Steps set the band's height) centre it (H13).
    // Every Guided problem sits in the middle of its cell (the cells may take spare height, H13).
    const centre = true;
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
    if (top) {
        const items = weDo.map((it, i) => planItem(Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }), { cols: top.cols, level: 2, render: weDoRender(it, i), nolabel: true }));
        const grid = top.rows ? gridPart(items, { cols: 1, rows: top.rows, cellH: top.h, labels: 'none' }) : gridPart(items, { cols: weDo.length, rows: 1, cellH: top.h, labels: 'none' });
        const stripH = hOf(stripX, 1);
        // The chant: on the Remember line when the sheet has one (it becomes the Rule line - the
        // rule is what the pupil needs beside the Guided cells), else under the strip.
        const rem = groups.find((g) => g.sections[0] && g.sections[0].label === 'Remember:');
        if (rem && data && data.chant) Object.assign(rem.sections[0], { label: 'Rule:', instr: data.chant });
        const chantH = data && data.chant && !rem ? m.instr : 0;
        const chantHtml = chantH ? `<div class="mq-lstripchant" style="height:${chantH.toFixed(2)}mm"><b>Rule:</b><span>${esc(data.chant)}</span></div>` : '';
        const content = { kind: 'col', cls: 'mq-lwedotop', parts: [{ kind: 'html', html: stripHtml(data, exSteps, ctx.size) + chantHtml }, grid] };
        groups.push(band(m.strip + stripH + chantH + top.h * (top.rows || 1), { kind: 'band', label: 'Guided Practice:', instr: instructionText(instructionKeyOf(weDo, input.skills), weDo), content }, { h: top.h * (top.rows || 1), grid: [grid], cap: 0.1, capIfEmpty: 0.35 }));
    } else if (weDo.length) groups.push(band(m.strip + weH, weBand, { h: weH, grid: [weBand.parts[0].content], box: weBand.parts[1], cap: 0.1, capIfEmpty: 0.35 }));
    env.weDo = weDo;
    return env;
}

/**
 * The Guided cells (P-LC-7): the step's hints, no traced answer. Cell 1 carries the FIRST STEP of
 * the working in grey (the regrouping of a subtraction written in, the rounding's digit after the
 * cut underlined): the partial scaffold that fades across the row. A count-on fact keeps its dot
 * tile (the count cue) on every Guided cell.
 */
export function weDoRender(it, i) {
    return (c, o) => {
        const answered = c.state && c.state !== 'blank';
        if (isRound(it)) {
            // Lessons r1: the chart's number line reaches the Guided cells - a blank 10-tick line
            // with two empty tens boxes under every problem (steps 1 and 3 happen on it); cell 1
            // has step 1 done in grey (the two tens written in). The key fills the boxes, the dot
            // and the arrow. Practice pages fade the line (the pupil draws on the chart's model).
            const p = it.q.cell.payload;
            const n = Number(p.n);
            const P = Number(p.place) || 10;
            const lo = Math.floor(n / P) * P;
            const hi = lo + P;
            const r = n - lo >= P / 2 ? hi : lo;
            const cols = (o && o.cols) || 2;
            const labPt = Math.max(12, (c.metrics && c.metrics.zonePt) || 12);
            // Lessons r2: the tens boxes are writing places - as tall as the answer strip and 3
            // digits wide ("100"); the line is as long as the cell leaves between them.
            const boxHmm = GUIDED_BOX_MM[c.size] || 12;
            const pad = roundLinePad(labPt, boxHmm, 3);
            const lineMm = Math.max(28, Math.min(62, 186 / cols - 8 - 2 * pad));
            const box = { boxHmm, boxDigits: 3 };
            const line = answered
                ? roundLineSvg(Object.assign({ lo, hi, n, r, lineMm, labPt, tens: 'solid', dot: 'solid', arrow: 'solid' }, box))
                : roundLineSvg(Object.assign({ lo, hi, n, r, lineMm, labPt, tens: i === 0 ? 'trace' : null, emptyTens: i !== 0 }, box));
            return `<div class="mq-lround">${it.render(c, o)}${line}</div>`;
        }
        if (answered && it.template === 'stack') {
            // The key shows the whole working in black (PT-KEY-2): the regrouping crossed out and
            // written in, the answer digits in their boxes - the example's own states, all done.
            const t = stepTemplateOf(it);
            const steps = workedStepsOf(it);
            // The stack keeps its own answer slot (AK-4: the key has the pupil page's slots).
            // ('answered': the key's working is black, never the Guided grey.)
            if (t && steps.length) return t.stepState(Object.assign({}, it.q.cell.payload || {}), steps.concat([{ marks: [] }]), steps.length, Object.assign({}, c, { state: 'answered', scaffoldLevel: 2 }));
        }
        // An expanded-form Guided cell 1 (the detailed lesson maker): step 1 done in grey - the
        // hundreds box traced, the other boxes empty; every box keeps its slot.
        // A bar story's Guided cell 1 (the detailed lesson maker): step 1 done in grey - the two
        // story numbers ringed; the bar and the answer stay the pupil's.
        // (the key rings them too: it is the page's facsimile, so the rings are not read as answers)
        if (i === 0 && isWordBar(it)) {
            const v = barNums(it);
            let ringed = 0;
            return it.render(c, o).replace(/>([^<>]*)</g, (m, text) => (ringed >= 2 ? m : `>${text.replace(new RegExp(`\\b(${v.a}|${v.b})\\b`, 'g'), (n) => (ringed < 2 ? (ringed++, `<span class="mq-lring mq-lring-t">${n}</span>`) : n))}<`));
        }
        if (!answered && i === 0 && isExpand(it)) {
            const html = it.render(resolveCtx(Object.assign({}, c, { state: 'answered', metrics: undefined })), o);
            return html.replace(/<span class="ws-box([^"]*)"([^>]*?) data-ws-slot="(part\d+)"([^>]*)>([^<]*)<\/span>/g, (m, cls, pre, slot, post, val) => {
                const attrs = `${pre} data-ws-slot="${slot}"${post.replace(/ data-ws-ink="[a-z]+"/, '')}`;
                return slot === 'part0' ? `<span class="ws-box${cls} ws-trace"${attrs} data-ws-ink="trace">${val}</span>` : `<span class="ws-box${cls}"${attrs}></span>`;
            });
        }
        // A name-to-numeral Guided cell 1 in H T O boxes (the detailed lesson maker): step 1 done in
        // grey - the hundreds digit traced in the H box, the hundreds words underlined.
        if (i === 0 && it.q && it.q.cell && it.q.cell.template === 'words' && it.q.cell.payload && it.q.cell.payload.slot === 'hto') {
            const t = stepTemplateOf(it);
            const steps = workedStepsOf(it);
            // (the key: every box answered, the prompt drawn exactly as on the pupil page - INK-31, critic r2 R9)
            if (t && steps.length > 1) return answered ? t.render(Object.assign({}, it.q.cell.payload, { under: 0 }), c) : t.stepState(Object.assign({}, it.q.cell.payload), steps.map((s) => ({ marks: s.marks || [] })), 0, c);
        }
        // An array-and-turn Guided cell 1 (the detailed lesson maker, lesson 3a): step 2 done in grey - the
        // first product traced; the turned fact stays the pupil's (the Critical Atom).
        if (!answered && i === 0 && it.q && it.q.cell && it.q.cell.template === 'arrays-turn' && it.q.cell.payload && it.q.cell.payload.type === 'both') {
            const t = stepTemplateOf(it);
            const p = it.q.cell.payload;
            if (t) return t.render(Object.assign({}, p), Object.assign({}, c, { state: 'blank', stepVals: { array: { ink: 'solid' }, turn: { ink: 'solid' }, a: { value: String(Number(p.rows) * Number(p.cols)), ink: 'trace' } } }));
        }
        // (a known-fact Guided cell, lesson 3a r2, critic D2: the turned fact's first box traced - its rows - so the
        // three-box response is guided before Practice 1, which then changes only the fade)
        if (!answered && it.q && it.q.cell && it.q.cell.template === 'arrays-turn' && it.q.cell.payload && it.q.cell.payload.type === 'known') {
            const t = stepTemplateOf(it);
            const p = it.q.cell.payload;
            if (t) return t.render(Object.assign({}, p), Object.assign({}, c, { state: 'blank', stepVals: { array: { ink: 'solid' }, turn: { ink: 'solid' }, b1: { value: String(Number(p.cols)), ink: 'trace' } } }));
        }
        // (an even-products Guided cell, lesson 4 critic r1 D6: the even row and column numbers ringed grey - a hint the
        // Independent cells drop; cell 1 also has step 1 done in grey - its even rows shaded)
        if (!answered && it.q && it.q.cell && it.q.cell.template === 'mult-grid' && it.q.cell.payload && it.q.cell.payload.shadeSlots) {
            const p = it.q.cell.payload, ring = new Set(), shade = new Set();
            (p.rows || []).forEach((r, ri) => { if (r % 2 === 0) { ring.add(`r${ri}`); if (i === 0) (p.cols || []).forEach((cc, j) => shade.add(`${ri},${j}`)); } });
            (p.cols || []).forEach((cc, j) => { if (cc % 2 === 0) ring.add(`h${j}`); });
            return it.render(Object.assign({}, c, { gridSteps: { shade, ring } }), o);
        }
        if (!answered && i === 0) {
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
        // The key keeps the traced ring of cell 1 (a facsimile of the pupil page, lessons r1).
        if (i === 0 && it.template === 'fact' && opOf(it.q || {}) === 'add' && o2.length >= 2 && o2[0] !== o2[1]) html = ringFactRow(html, o2[0] > o2[1] ? 1 : 2, 'trace');
        const n = countCueOf(it);
        if (n) html = `<div class="mq-cuewrap">${html}<span class="mq-cue${countCueRow(it) === 2 ? ' mq-cue-b' : ''}">${dotTile(n)}</span></div>`;
        return html;
    };
}

export default { pickWeDo, weDoStepsHtml, stepsItem, WEDO_W_MM, weDoBand, weDoRender };
