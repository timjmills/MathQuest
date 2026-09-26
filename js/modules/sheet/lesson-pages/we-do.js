// js/modules/sheet/lesson-pages/we-do.js
// LESSON PAGE BUILDER "we-do" (design/LESSON_LIBRARY_PLAN.md §8c): the WE DO band - Guided cells of the skill beside
// the chart's Steps (the same numerals, icons and names), cell 1 with step 1 traced in grey, the
// others with the step's hints only (P-LC-7).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

import { planItem, gridPart, instructionText, instructionKeyOf, answerOf, operandsOf, opOf, esc } from '../roles/compose.js';
import { resolveCtx } from '../index.js';
import { workedStepsOf, stepTemplateOf, unslot } from '../anchors.js';
import { dotTile, countCueOf, countCueRow } from '../roles/guided.js';
import { stepIcon } from '../lesson-icons.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { ring, ringFactRow } from '../lesson-arch/fact.js';
import { roundLineSvg, roundLineMm, roundLinePad, isRound } from '../lesson-arch/line.js';
import { sigOf, digitsOfOps, namedSteps, stepMarker, band, hAt, fitsWidth, hOf } from './common.js';
import { stripHtml } from './practice.js';

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
    const order = liked.concat(same.filter((it) => !liked.includes(it)), rest.filter((it) => !same.includes(it)));
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

/** The Guided writing box height (mm): the answer strip's height at the size (lessons r2). */
export const GUIDED_BOX_MM = { S: 8, M: 9.6, L: 12 };

/** The lesson's Steps zone beside the Guided cells: the chart's numerals, icons and step names. */
export function weDoStepsHtml(data, steps, size) {
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

export const WEDO_W_MM = 62;       // the Steps zone beside the Guided cells: one third of the width (3 columns)

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
                // (Lessons r4: the key writes what the pupil writes - the two tens - never a dot
                // or a hop the cell does not ask for.)
                ? roundLineSvg(Object.assign({ lo, hi, n, r, lineMm, labPt, tens: 'solid', dot: null, arrow: null }, box))
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

/**
 * The We Do band (moved from roles/lesson.js plan, phase 0): Guided cells beside the chart's Steps,
 * or under the practice strip when the cells are much shorter than the Steps. Pushes its band onto
 * `groups` (and turns the Remember strip into the Rule line when the strip carries the chant);
 * returns the Guided items.
 */
export function weDoBand({ input, ctx, m, data, extrasList, stepsZone, mainU, example, example2, example3, example4, exSteps, groups }) {
    const rest = mainU.filter((it) => it !== example && it !== example2 && it !== example3 && it !== example4);
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
    // A rounding Guided cell carries the chart's number line under its problem (weDoRender).
    const lineExtra = (its) => (its.some(isRound) ? roundLineMm(Math.max(12, (ctx.metrics && ctx.metrics.zonePt) || 12), GUIDED_BOX_MM[ctx.size] || 12) : 0);
    const shortH = Math.max(20, hAt(rest.slice(0, 3), 2) + lineExtra(rest.slice(0, 3)));
    const stackRows = zH > 0 && rest.length >= 3 && fitsWidth(rest.slice(0, 3), 2) && shortH * 1.8 <= zH ? Math.min(3, Math.floor(zH / shortH)) : 0;
    if (stackRows) gk = stackRows;
    const weDoPool = mainU.filter((it) => it !== example2 && it !== example3 && it !== example4);
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
    if (stepsZone && stripX && weDo.length && !stackRows && (gH < 0.72 * zH || wantN > weDo.length)) {
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
        const grid = gridPart(items, { cols: weDo.length, rows: 1, cellH: top.h, labels: 'none' });
        const stripH = hOf(stripX, 1);
        // The chant: on the Remember line when the sheet has one (it becomes the Rule line - the
        // rule is what the pupil needs beside the Guided cells), else under the strip.
        const rem = groups.find((g) => g.sections[0] && g.sections[0].label === 'Remember:');
        if (rem && data && data.chant) Object.assign(rem.sections[0], { label: 'Rule:', instr: data.chant });
        const chantH = data && data.chant && !rem ? m.instr : 0;
        const chantHtml = chantH ? `<div class="mq-lstripchant" style="height:${chantH.toFixed(2)}mm"><b>Rule:</b><span>${esc(data.chant)}</span></div>` : '';
        const content = { kind: 'col', cls: 'mq-lwedotop', parts: [{ kind: 'html', html: stripHtml(data, exSteps, ctx.size) + chantHtml }, grid] };
        groups.push(band(m.strip + stripH + chantH + top.h, { kind: 'band', label: 'Guided Practice:', instr: instructionText(instructionKeyOf(weDo, input.skills), weDo), content }, { h: top.h, grid: [grid], cap: 0.1, capIfEmpty: 0.35 }));
    } else if (weDo.length) groups.push(band(m.strip + weH, weBand, { h: weH, grid: [weBand.parts[0].content], box: weBand.parts[1], cap: 0.1, capIfEmpty: 0.35 }));
    return weDo;
}

export default { pickWeDo, GUIDED_BOX_MM, weDoStepsHtml, stepsItem, WEDO_W_MM, weDoRender, weDoBand };
