// js/modules/sheet/lesson-pages/warm-up.js
// LESSON PAGE BUILDER "warm-up" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson sheet's WARM-UP band - the prerequisite
// skills side by side (or a full-width row each), one or two quick items each with its library instruction.
// (Lead decision D1, lessons-phase0: the Prerequisite Check PAGE is sheet/roles/pre-skill-check.js, PAGE_TYPES 2.10 - the
// one page for that job; this module is only the standard lesson sheet's Warm-up band.)
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { ctxOf, planItem, gridPart, instructionKeyOf, instructionPart, poolItems } from '../roles/compose.js';
import { reflowsAt, CL8_MM, warmPools, band, hAt, hOf } from './common.js';

/** How many cells each prerequisite gets in its share of the width. */
export function warmShape(pools, input) {
    const ctx = ctxOf(input);
    const ids = Object.keys(pools).filter((id) => /^w\d$/.test(id) && (pools[id] || []).length);
    const out = {};
    // A cell in a half of the width is as wide as a cell of a 4-column page: the measurement at 4
    // columns says whether it fits there (a template's own column cap is for a whole page of it).
    // Two skills sharing the band (critic R3 R-3): a cell's hard column cap holds too - a division
    // fact keeps its line beside the sentence, as the other skill's across cells do, so the band
    // has one look. (One skill alone may stack its own line: every cell of the band then does.)
    const shared = ids.length > 1;
    const fitsWidth = (its, c) => its.every((it) => {
        const m = it.measured && it.measured[c];
        return (m ? m.fits !== false : true) && !(c > 1 && (it.fclass === 'word' || it.fclass === 'wide'))
            && !(shared && reflowsAt(it, c));
    });
    for (const id of ids) {
        const its = pools[id].slice(0, 3);
        // Two skills share the width half and half; one skill takes the whole width.
        const opts = ids.length > 1 ? [[2, 4], [1, 2]] : [[3, 3], [2, 2], [1, 1]];
        const pick = opts.find(([, c]) => fitsWidth(its, c)) || opts[opts.length - 1];
        out[id] = { k: pick[0], cols: pick[1] };
    }
    // `warmRows` (lesson data; pilot SU-C fix r2, critic r2 N2): two prerequisites whose cells
    // differ in width - one-digit column facts fit a quarter of the page, a place-value word bank
    // or a 5-digit column only a half - each take a full-width row of their own, the narrow one
    // four cells across, so neither is drawn in a cell sized for the other (H13, CL-3 per row).
    // Opt-in: every other lesson keeps its shared band.
    // `warmRows: true` (every size) or a list of sizes (['S']).
    const ldata = input && input.lesson && input.lesson.data;
    const rowsAsked = ldata && (ldata.warmRows === true || (Array.isArray(ldata.warmRows) && ldata.warmRows.includes(ctx.size)));
    if (ids.length > 1 && rowsAsked) {
        const w4 = ids.map((id) => fitsWidth(pools[id].slice(0, 3), 4));
        if (w4.some(Boolean) && !w4.every(Boolean)) {
            ids.forEach((id, i) => { out[id] = w4[i] ? { k: 4, cols: 4, stack: true } : fitsWidth(pools[id].slice(0, 3), 2) ? { k: 2, cols: 2, stack: true } : { k: 1, cols: 1, stack: true }; });
            return out;
        }
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
        // Rows sized per item kind (critic SU-C r2 N2, H13; every lesson): a half whose cells would
        // still leave more than WARM_BAND of the shared row empty - an across fact "7 − 3 = ___"
        // beside a column stack or a place-value item - does not share the row. Each skill then
        // takes a full-width row of its own, as tall as its own items (CL-3 holds per row), as many
        // cells across as its measurement allows. `plan` keeps the shared row when the split rows
        // would add a page (input._warmShared).
        const hRow = Math.max(...ids.map((id) => Math.max(20, hOf1(id)) * out[id].rows));
        const loose = ids.some((id) => hOf1(id) > 0 && 1 - (Math.max(20, hOf1(id)) * out[id].rows) / hRow > WARM_BAND);
        if (loose && !(input && input._warmShared)) {
            // (the cells of one row hold items of one height too: a skill whose items differ - a
            // fraction sentence and a picture - takes fewer cells across rather than mix them)
            const alike = (its, c) => { const hs = its.map((it) => Math.max(20, hOf(it, c))); return Math.min(...hs) >= Math.max(...hs) * (1 - WARM_BAND); };
            for (const id of ids) {
                const k = [4, 2].find((c) => pools[id].length >= c && fitsWidth(pools[id].slice(0, c), c) && alike(pools[id].slice(0, c), c)) || 1;
                out[id] = { k, cols: k, stack: true, split: true };
            }
        }
    }
    return out;
}

/** H13 for the Warm-up: the most of a cell's height its own item may leave empty (RUBRIC: < 30 %). */
export const WARM_BAND = 0.25;

/** The width (mm) the page's content gives a row of cells (A4: 186 mm less the band borders). */
export const ROW_W_MM = 183;

/**
 * The Warm-up row's track widths (mm), each half as wide as its cells draw, when equal halves
 * would leave a cell more than WARM_BAND of its width empty (H13 width); null to keep halves.
 * A cell's drawn width is read from its measurement at the half's column count: the cell's
 * width less twice its least side slack (`slackMm`, CL-8).
 */
export function warmTracks(halves, wPools, shape, rowsOf) {
    if (halves.length !== 2) return null;
    const info = halves.map((id) => {
        const c = shape[id].cols;
        const its = wPools[id].slice(0, shape[id].k * rowsOf(id));
        const cw = ROW_W_MM / c;
        const sl = its.map((it) => it.measured && it.measured[c] && it.measured[c].slackMm);
        if (!its.length || sl.some((v) => !Number.isFinite(v))) return null;
        const ink = Math.max(...sl.map((v) => cw - 2 * v));
        // the narrowest cell its items are measured to fit (a 4-column cell, a 3-column one ...)
        const fitC = [4, 3].find((n) => n > c && its.every((it) => it.measured && it.measured[n] && it.measured[n].fits !== false && Number.isFinite(it.measured[n].slackMm) && it.measured[n].slackMm >= CL8_MM));
        const minCell = fitC ? ROW_W_MM / fitC : cw;
        return { k: shape[id].k, ink, minCell };
    });
    if (info.some((x) => !x || !(x.ink > 0))) return null;
    const band = (x, w) => (w / x.k - x.ink) / 2 / (w / x.k);
    const even = info.map((x) => band(x, ROW_W_MM / 2));
    if (Math.max(...even) <= WARM_BAND) return null;
    const need = info.map((x) => x.k * x.ink);
    let w = need.map((n) => ROW_W_MM * n / need.reduce((a, b) => a + b, 0));
    // never narrower than the half's items fit; the other half takes the rest
    for (let i = 0; i < 2; i++) {
        const lo = info[i].minCell * info[i].k;
        if (w[i] < lo) { w[i] = lo; w[1 - i] = ROW_W_MM - lo; }
    }
    if (w.some((x, i) => x < info[i].minCell * info[i].k - 0.1)) return null;
    const after = info.map((x, i) => band(x, w[i]));
    return Math.max(...after) < Math.max(...even) - 0.02 ? w : null;
}

/**
 * The Warm-up band (roles/lesson.js planOnce, a sheet band of the registry; the sheet's first lettered band, from a): pushes its band onto
 * `env.groups` and advances `env.letter` / `env.warmCount`; `env.warm` keeps the shape (the
 * plan reads `split` from it).
 */
export function warmUpBand(env) {
    const { input, m, labels, groups } = env;
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
        // One digit size per band (critic R3 R-3): when a legacy-drawn skill (its own type size,
        // `data-ws-pt`) shares the band with a kit cell, the kit cell is drawn at the legacy cell's
        // size, so "8 ÷ 2 = __" and "110 ÷ 10 = __" read as one routine.
        const bandIts = halves.flatMap((id) => wPools[id].slice(0, shape[id].k * rowsOf(id)));
        const legacyIt = bandIts.find((it) => it.template === 'legacy' && typeof it.render === 'function');
        const sameSize = (it) => (!legacyIt || it.template === 'legacy' || typeof it.render !== 'function' ? it : Object.assign({}, it, {
            render: (c, o) => {
                let pt = '';
                try { pt = (/data-ws-pt="(\d+(?:\.\d+)?)"/.exec(String(legacyIt.render(c, o))) || [])[1] || ''; } catch (e) { pt = ''; }
                const h = it.render(c, o);
                return pt ? `<div style="--ws-digit:${pt}pt;display:contents">${h}</div>` : h;
            },
        }));
        const parts = halves.map((id) => {
            const its = wPools[id].slice(0, shape[id].k * rowsOf(id)).map(sameSize);
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
            // Tracks as wide as their content (critic SU-C r2 N2 follow-up, H13 width): a narrow
            // one-place column in half the page left a third of its cell's width empty on each
            // side. When either half would leave more than WARM_BAND of its cell's width empty,
            // the row's width is shared in proportion to what each half's cells draw (measured:
            // the cell width less twice the item's side slack), never below the narrowest column
            // the half's items are measured to fit, and only when that leaves every cell fuller.
            const trackMm = warmTracks(halves, wPools, shape, rowsOf);
            const instrFits = (p, w) => sameInstr || String((p.parts[0] && p.parts[0].text) || '').length * charMm <= 2 * (w - 8);
            const tracks = trackMm && parts.every((p, i) => instrFits(p, trackMm[i])) ? trackMm : null;
            const halfW = (i) => (tracks ? tracks[i] : 93);
            const twoLines = !sameInstr && parts.length > 1 && parts.some((p, i) => String(p.parts[0].text || '').length * charMm > halfW(i) - 8);
            if (twoLines) for (const p of parts) p.cls += ' mq-lwarm2';
            const instrH = sameInstr ? 0 : twoLines ? m.instr * 1.75 : m.instr;
            const content = parts.length > 1 ? { kind: 'row', cls: 'mq-lwarmrow', widths: parts.map((p, i) => (tracks ? `minmax(0, ${tracks[i].toFixed(2)}fr)` : '1fr')), parts } : parts[0];
            // The page's spare height may grow these cells only while each one's own item still
            // fills all but WARM_BAND of it (critic SU-C r2 N2: at L the grown row left a short
            // fact 39-40 % of a 65 mm cell empty); what it cannot take passes to the bands after it.
            const room = halves.map((id) => {
                const its = wPools[id].slice(0, shape[id].k * rowsOf(id));
                const hs = its.map((it) => hOf(it, shape[id].cols));
                if (!hs.length || hs.some((h) => !(h > 0))) return Infinity;
                return rowsOf(id) * Math.max(20, Math.min(...hs)) / (1 - WARM_BAND) - hW;
            });
            const maxAdd = Math.max(0, Math.min(...room));
            groups.push(band(m.strip + instrH + hW, { kind: 'band', label: 'Warm-up:', instr: sameInstr ? t0 : '', content }, Object.assign({ h: hW, grid: parts.map((p) => p.parts[p.parts.length - 1]), cap: 0, capIfEmpty: 0.45 }, Number.isFinite(maxAdd) ? { maxAdd } : {})));
        }
    }
    env.letter = letter;
    env.warmCount = warmCount;
    env.warm = { halves, shape };
    return env;
}

export default { warmShape, WARM_BAND, ROW_W_MM, warmTracks, warmUpBand };
