// js/modules/sheet/lesson-pages/prereq-check.js
// LESSON PAGE BUILDER "prereq-check" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson sheet's opening check of the
// prerequisite skills (today the Warm-up: one or two quick items of each prerequisite skill side
// by side; the Prerequisite Check of §8b replaces it).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

import { ctxOf, planItem, gridPart, instructionPart, instructionKeyOf, poolItems } from '../roles/compose.js';
import { band, hAt, warmPools } from './common.js';

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

export default { warmShape, warmUpBand };
