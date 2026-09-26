// js/modules/sheet/lesson-pages/prereq-check.js
// LESSON PAGE BUILDER "prereq-check" (design/LESSON_LIBRARY_PLAN.md §8b, §8c): the PREREQUISITE CHECK
// that opens every lesson packet (prereqPlan: 3-4 questions, each routed to its prerequisite lesson,
// and the key's routing table), and the older Warm-up band of a lesson sheet with no check
// (warmUpBand: one or two quick items of each prerequisite skill side by side).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

import {
    ctxOf, planItem, gridPart, instructionPart, instructionKeyOf, instructionText, poolItems, frameOf, layoutHeader,
    bandMetrics, assemble, labelStyleOf, esc,
} from '../roles/compose.js';
import { band, hAt, warmPools, plainItem } from './common.js';

/** How many cells each prerequisite gets in its share of the width. */
export function warmShape(pools, input) {
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

/**
 * The Warm-up band (moved from roles/lesson.js plan, phase 0): the prerequisite skills side by
 * side, lettered from `letter`. Pushes its band onto `groups` and the items it places onto
 * `warmPlaced`; returns the next letter and the Warm-up's item count.
 */
export function warmUpBand({ input, m, labels, warmPlaced, groups, letter = 1 }) {
    const wIds = warmPools(input);
    const wPools = Object.fromEntries(wIds.map((id) => [id, poolItems(input, id)]));
    const shape = warmShape(wPools, input);
    const halves = wIds.filter((id) => wPools[id].length && shape[id]);
    let warmCount = 0;
    if (halves.length) {
        // `stack`: a skill too wide for half the page gives each skill a full-width row of its own.
        const stacked = halves.some((id) => shape[id].stack);
        const rowsOf = (id) => shape[id].rows || 1;
        const hOwn = (id) => Math.max(20, hAt(wPools[id].slice(0, shape[id].k * rowsOf(id)), shape[id].cols)) * rowsOf(id);
        const hW = Math.max(...halves.map(hOwn));
        const parts = halves.map((id) => {
            const its = wPools[id].slice(0, shape[id].k * rowsOf(id));
            warmPlaced.push(...its);
            // Every Warm-up problem is centred in its cell (a short one, or a cell given spare height).
            const short = true;
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
            // Lessons r2: the first row's instruction sits on the band's own strip ("Warm-up:
            // Write the two tens ..."), not on an empty strip with the instruction under it.
            const t0 = String((parts[0].parts[0] && parts[0].parts[0].text) || '');
            if (t0) parts[0].parts = parts[0].parts.slice(1);
            const h = halves.reduce((a, id, i) => a + (i === 0 && t0 ? 0 : m.instr) + hOwn(id), 0);
            groups.push(band(m.strip + h, { kind: 'band', label: 'Warm-up:', instr: t0, content: { kind: 'col', cls: 'mq-lwarmstack', parts } }));
        } else {
            // A library instruction longer than half the width wraps to a second line (BD-10 lets
            // an instruction run to three short sentences); both halves then keep two lines, so
            // the cells start level.
            // Lessons r1: two halves with the SAME instruction ("Subtract." / "Subtract.") print it
            // once, on the band's own strip.
            const t0 = String((parts[0].parts[0] && parts[0].parts[0].text) || '');
            const sameInstr = parts.length > 1 && t0 && parts.every((p) => String((p.parts[0] && p.parts[0].text) || '') === t0);
            if (sameInstr) for (const p of parts) p.parts = p.parts.slice(1);
            const charMm = 0.5 * m.textPt * (25.4 / 72);
            const twoLines = !sameInstr && parts.length > 1 && parts.some((p) => String(p.parts[0].text || '').length * charMm > 93 - 8);
            if (twoLines) for (const p of parts) p.cls += ' mq-lwarm2';
            const instrH = sameInstr ? 0 : twoLines ? m.instr * 1.75 : m.instr;
            const content = parts.length > 1 ? { kind: 'row', cls: 'mq-lwarmrow', widths: parts.map(() => '1fr'), parts } : parts[0];
            groups.push(band(m.strip + instrH + hW, { kind: 'band', label: 'Warm-up:', instr: sameInstr ? t0 : '', content }, { h: hW, grid: parts.map((p) => p.parts[p.parts.length - 1]), cap: 0, capIfEmpty: 0.45 }));
        }
    }
    return { letter, warmCount };
}

/* ================================================================ the Prerequisite Check */

/**
 * THE PREREQUISITE CHECK (owner ruling 2026-09-26, plan §8b, LESSON_RULES.md LR-17): the first part
 * of every lesson packet. 3-4 questions, one per prerequisite, most basic first; each is one item of
 * that prerequisite's skill (with its options) in a boxed cell of its own, under its one-line library
 * instruction, and carries a small teacher tag "If missed → Lesson <id> <title>". Two questions a
 * row (a half of the page each, like the Warm-up it replaces), or three thirds when three fit; the
 * page's spare height goes into the cells, their problems centred (H13).
 *
 * `input.lesson.prereqs`: [{lesson, title, why}] in order; the host deals pool `p<i>` from the
 * prerequisite's skill ref (roles/lesson.js sources). Returns the pupil page's plan; its
 * `meta.routePlan` is the key's ROUTING TABLE page (the host renders it after the key).
 */
// The spare height a row may take, as a share of its own height (H13: bands under 30 %).
const GROW = 0.1;
export function prereqPlan(input, { ROLE_ID }) {
    const ctx = ctxOf(input);
    const lesson = input.lesson || {};
    const list = lesson.prereqs || [];
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const labels = labelStyleOf(ctx.look, input.labels);
    const qs = list.map((p, i) => ({ p, it: poolItems(input, `p${i}`)[0] || null })).filter((x) => x.it);
    const n = qs.length;
    const frame = frameOf({ skills: target, input, tabId: 'Check', score: n, footerLeft: lesson.tagLine });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const fitsAt = (its, c) => its.every((it) => {
        const mm = it.measured && it.measured[c];
        return (mm ? mm.fits !== false : true) && !(c > 1 && (it.fclass === 'word' || it.fclass === 'wide'));
    });
    // Rows: 2 + 2 for four; three thirds when all three fit a third, else 2 + 1.
    const all = qs.map((q) => q.it);
    let rowSizes;
    if (n === 3 && fitsAt(all, 3)) rowSizes = [3];
    else if (n <= 2) rowSizes = [n];
    else rowSizes = n === 3 ? [2, 1] : [2, 2];
    const rows = [];
    let k = 0;
    for (const r of rowSizes) {
        const its = qs.slice(k, k + r);
        // A pair that does not fit two halves takes a full-width row each (PG-20: never shrunk).
        if (r === 2 && !fitsAt(its.map((q) => q.it), 2)) its.forEach((q, j) => rows.push({ qs: [q], cols: 1, start: k + 1 + j }));
        else rows.push({ qs: its, cols: r === 3 ? 3 : r === 2 ? 2 : 1, start: k + 1 });
        k += r;
    }
    const charMm = 0.5 * m.textPt * (25.4 / 72);
    const widthMm = (r) => 186 / Math.max(1, r.qs.length);
    const tagText = (q) => `If missed → Lesson ${q.p.lesson}${q.p.title ? ` ${q.p.title}` : ''}`;
    // The teacher tag: 9 pt, one line where it fits (two at most).
    const TAG_LINE_MM = 9 * (25.4 / 72) * 1.3;
    const tagLines = (q, w) => (tagText(q).length * 1.75 > w - 6 ? 2 : 1);
    for (const r of rows) {
        const w = widthMm(r);
        r.instrH = r.qs.some((q) => String(instructionText(instructionKeyOf([q.it], input.skills), [q.it]) || '').length * charMm > w - 8) ? m.instr * 1.75 : m.instr;
        r.tagH = Math.max(...r.qs.map((q) => tagLines(q, w))) * TAG_LINE_MM + 2;
        r.cellH = Math.max(20, hAt(r.qs.map((q) => q.it), r.cols));
    }
    const used = m.strip + rows.reduce((a, r) => a + r.instrH + r.cellH + r.tagH, 0);
    // The spare height goes into the cells, a third of a cell's own height at most (a centred
    // problem keeps every empty band under 30 %, H13); a check of 3-4 questions is a fixed count,
    // so what is left stays at the foot of the page.
    const spare = Math.max(0, m.budget - used - 1);
    for (const r of rows) r.cellH += Math.min(r.cellH * GROW, spare / rows.length);
    const parts = rows.map((r) => {
        const halves = r.qs.map((q, j) => ({
            kind: 'col', cls: `mq-lwarmcol mq-lprecol${r.instrH > m.instr ? ' mq-lwarm2' : ''}`,
            parts: [
                instructionPart(instructionKeyOf([q.it], input.skills), [q.it]),
                gridPart([planItem(Object.assign({}, q.it, { cellCls: [q.it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }), { cols: r.cols })], { cols: 1, rows: 1, cellH: r.cellH, labels, start: r.start + j }),
                { kind: 'html', html: `<p class="mq-lpretag" data-ws-teacher style="min-height:${(r.tagH - 2).toFixed(2)}mm">${esc(tagText(q))}</p>` },
            ],
        }));
        return halves.length > 1 ? { kind: 'row', cls: 'mq-lwarmrow mq-lprerow', widths: halves.map(() => '1fr'), parts: halves } : halves[0];
    });
    const section = { kind: 'band', label: 'Prerequisite Check:', instr: '', content: { kind: 'col', cls: 'mq-lwarmstack mq-lprestack', parts } };
    const plan = assemble(ROLE_ID, input, frame, [{ header: frame.header, sections: [section] }], {
        scaffoldLevel: 1,
        meta: {
            items: n, scoreOutOf: n, part: 'prereq',
            usedItems: qs.map((q) => plainItem(q.it)),
            prereqs: qs.map((q, i) => ({ letter: i + 1, lesson: q.p.lesson, title: q.p.title || '', skill: q.it.skill, text: String((q.it.q && q.it.q.text) || '') })),
            routePlan: routePlan(input, qs, { ROLE_ID, labels }),
            fits: [{ cols: 2, rows: rows.length, line: `Fits: a Prerequisite Check of ${n} question${n === 1 ? '' : 's'} on 1 page.` }],
            notes: [],
        },
    });
    plan.cls = [plan.cls || '', 'mq-lesson'].filter(Boolean).join(' ');
    return plan;
}

/** The letter a question prints with (a, b, c, d: the lesson sheet's labels). */
const letterOf = (i) => String.fromCharCode(96 + i);

/**
 * The key's ROUTING TABLE (plan §8b): each question, what it checks, and the lesson to teach first
 * when it is missed; the rule for two or more misses (the earliest first, then back to this lesson).
 * A teacher page: no Name, Date or Score.
 */
function routePlan(input, qs, { ROLE_ID }) {
    const lesson = input.lesson || {};
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const f = frameOf({ skills: target, input, tabId: 'Check key', score: 0, footerLeft: lesson.tagLine });
    const header = Object.assign({}, f.header, { name: false, date: false, score: false });
    const rowsHtml = qs.map((q, i) => `<tr><td class="mq-lroute-q">${letterOf(i + 1)}</td><td>${esc(q.p.why || '')}</td>`
        + `<td><b>Lesson ${esc(q.p.lesson)}</b>${q.p.title ? ` ${esc(q.p.title)}` : ''}</td></tr>`).join('');
    const html = `<div class="mq-lroute"><table><thead><tr><th>Question</th><th>What it checks</th><th>If missed, teach first</th></tr></thead><tbody>${rowsHtml}</tbody></table>`
        + '<ul><li><b>All correct:</b> start this lesson with its anchor chart.</li>'
        + '<li><b>One missed:</b> teach that lesson first, then come back to this lesson.</li>'
        + '<li><b>Two or more missed:</b> start with the earliest one missed (the first letter), then the next, then come back to this lesson.</li></ul></div>';
    const section = { kind: 'band', label: 'Prerequisite Check: where next', instr: '', html };
    const plan = assemble(ROLE_ID, input, Object.assign({}, f, { header }), [{ header, sections: [section] }], { scaffoldLevel: 1, meta: { items: 0, part: 'prereq-route' } });
    plan.cls = [plan.cls || '', 'mq-lesson'].filter(Boolean).join(' ');
    return plan;
}

export default { warmShape, warmUpBand, prereqPlan };
