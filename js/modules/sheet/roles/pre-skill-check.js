// js/modules/sheet/roles/pre-skill-check.js
// PRE-SKILL CHECK (design/PAGE_TYPES.md 2.10): a short check of the prerequisite sub-skills
// before a ladder starts. Two forms. No supports (level 0).
//
//   Quadrants   four boxed quadrants, one prerequisite skill each, each with its own strip (the
//               skill's instruction) and its own small score "__/4" (PT-PRE-1, P-25)
//   Grid        3 x 2 in a quadrant (cells about 31 mm wide) holding 5 items at S and M, 2 x 2
//               (about 46 mm) holding 4 at L or where a cell needs it (PT-PRE-2); otherwise the page
//               stacks four full-width bands of up to 4 cells, and a band that does not fit moves
//               whole to the next page (PT-ENG-8)
//   Skills      the skill's PREREQUISITES (R1-8, PT-PRE-3), found by the host (print-sheet.js
//               prereqSkills): the lesson data's, then the `pre` lists of its White Rose steps
//               (data/curriculum/links), then the skills before it in its category and domain; never
//               the skill itself. A teacher-given set of 2 to 4 skills is used as it is.
//   Title       "Pre-skill check: <topic>" (HD-13); tab "Check A" / "Check B"; Score = all items
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, topicOf, labelStyleOf, rng, shuffle, deriveSeed,
} from './compose.js';
import { SIZES } from '../index.js';

export const ROLE_ID = 'pre-skill-check';
const PER_QUAD = 4;

export function sources(skills, { earlier, prereqs } = {}) {
    let list;
    if (skills.length >= 2) list = skills.slice(0, 4);
    // R1-8 (shared-roles critic r1, PT-PRE-3): the skill's own prerequisites, found by the host
    // (print-sheet.js prereqSkills: the lesson data, the White Rose steps' `pre` lists, then the
    // earlier skills) - never the skill itself.
    else if (Array.isArray(prereqs) && prereqs.length) list = prereqs.slice(0, 4);
    else {
        const prev = earlier(skills[0], 4);
        list = prev.length ? prev.slice().reverse() : [skills[0]];
    }
    // One quadrant per prerequisite, up to four. A skill with fewer earlier skills checks fewer
    // quadrants (a first skill checks itself once) rather than repeating one skill four times.
    return list.slice(0, 4).map((sk, i) => ({ id: `q${i}`, skills: [sk] }));
}
// (3 and 6: a quadrant of 3 across is a sixth of the page, a full band may run 3 across - R1-8)
export const measureCols = () => [1, 2, 3, 4, 6];
// The detailed lesson's check grows its rows to fill the body (critic r3 R7: no bordered empty strip
// under the last row). Its items are centred in their cells (mq-lvcenter), so a cell keeps no empty
// band of 30 % (H13) up to about 2.5 x its content; 2 x the measured minimum stays well inside that.
const GROW_MAX = 2;
// `input.perQuestion` (the detailed lesson's Prerequisite Check, V22 §9.1: 3-4 questions, up to 8
// items): items per prerequisite when a caller asks; PER_QUAD otherwise.
// (An array gives each question its own count, in order.)
const perQuad = (input, i = 0) => {
    const v = input && Array.isArray(input.perQuestion) ? input.perQuestion[i] : input && input.perQuestion;
    return Number(v) >= 1 && Number(v) <= PER_QUAD ? Number(v) : PER_QUAD;
};
/**
 * PT-PRE-1 / PT-PRE-2 (R1-8, shared-roles critic r1): the one-page layout of a check of its
 * prerequisite skills (not the detailed lesson's check, `perQuestion`, which keeps its own).
 * Each skill whose cell fits a QUADRANT (half the width) takes one, with a grid of 2 rows: 3 across
 * (5 items) at S and M where its cell fits a sixth of the width, else 2 across (4), else 1 across
 * (2: a long item, PT-PRE-2 "long algorithms 1 x 2"). Quadrants pair up two to a row, in the
 * skills' order; a skill whose cell needs the whole width (or a quadrant left without a partner)
 * is a full-width band of up to 4 items, as many rows as the page holds. With four quadrants the
 * page is exactly PT-PRE-1's 2 x 2 of (body - 5) / 2 rows. -> {els, per} or null (no one-page fit:
 * the stacked bands below).
 */
const PER_QUAD_WIDE = 5;
const QUAD_GRIDS = (size) => (size === 'L' ? [[4, 2], [2, 1]] : [[6, 3], [4, 2], [2, 1]]);   // [page columns, quadrant columns]
const PT_MM = 25.4 / 72;
/**
 * The strip of a band of `its` that is `wMm` wide: one line, or as many as its instruction wraps to
 * (Andika's average advance is about half the point size; the score tag and padding keep 22 mm).
 */
function stripMmOf(its, input, ctx, m, wMm) {
    const s = SIZES[ctx.size] || SIZES.L;
    const text = String(instructionText(instructionKeyOf(its, input.skills), its) || '').replace(/<[^>]*>/g, '');
    const lines = Math.max(1, Math.ceil((text.length * s.textPt * 0.5 * PT_MM) / Math.max(20, wMm - 22)));
    return m.strip + (lines - 1) * s.textPt * 1.3 * PT_MM;
}
function checkLayout(quads, ctx, m, input = {}) {
    if (!quads.length) return null;
    const quadH0 = (m.body - 2 - 3) / 2;
    const half = quads.map((q) => {
        for (const [pc, c] of QUAD_GRIDS(ctx.size)) {
            if (!fitsAt(q, pc, ctx)) continue;
            // (a little over the measured minimum, PG-12's safety in a row shared by two skills)
            const h = hMinAt(q, pc, ctx) * 1.15;
            if (Number.isFinite(h)) return { pageCols: pc, cols: c, h, strip: stripMmOf(q, input, ctx, m, 93) };
        }
        return null;
    });
    // Quadrants pair up in order. With an odd count, the one left full-width is the one that leaves
    // the page shortest (its full band against the quadrant row it would have shared).
    const fullOf = (i) => {
        const c = [4, 3, 2, 1].find((cc) => fitsAt(quads[i], cc, ctx)) || 1;
        return { cols: c, h: hMinAt(quads[i], c, ctx), strip: stripMmOf(quads[i], input, ctx, m, 186) };
    };
    const arrange = (alone) => {
        const out = [];
        let open = -1;
        quads.forEach((q, i) => {
            if (half[i] && i !== alone && open >= 0) { out[open].ids.push(i); open = -1; return; }
            if (half[i] && i !== alone) { out.push({ type: 'pair', ids: [i] }); open = out.length - 1; return; }
            out.push({ type: 'full', ids: [i] });
        });
        for (const e of out) if (e.type === 'pair' && e.ids.length === 1) e.type = 'full';
        const h = out.reduce((a, e) => {
            if (e.type === 'full') { const f = fullOf(e.ids[0]); return a + f.strip + f.h; }
            return a + Math.max(...e.ids.map((i) => half[i].strip)) + Math.max(...e.ids.map((i) => half[i].h));
        }, 0);
        return { out, h: Number.isFinite(h) ? h : Infinity };
    };
    const halves = quads.map((q, i) => i).filter((i) => half[i]);
    const tries = halves.length % 2 ? halves.map((i) => arrange(i)) : [arrange(-1)];
    const els = tries.reduce((b, t) => (t.h < b.h ? t : b), tries[0]).out;
    const fulls = els.filter((e) => e.type === 'full');
    const pairs = els.filter((e) => e.type === 'pair');
    for (const e of fulls) {
        const q = quads[e.ids[0]];
        e.cols = [4, 3, 2, 1].find((c) => fitsAt(q, c, ctx)) || 1;
        e.h = hMinAt(q, e.cols, ctx);
        // (a cell the layout will not build at one column - measured, but flagged - keeps its measured height)
        if (!Number.isFinite(e.h) && e.cols === 1) e.h = Math.max(...q.map((it) => Number(it.measured && it.measured[1] && it.measured[1].hMm))) + 1;
        e.rows = 1;
        e.strip = stripMmOf(q, input, ctx, m, 186);
        if (!Number.isFinite(e.h)) return null;
    }
    for (const e of pairs) {
        e.rows = 2;
        e.strip = Math.max(...e.ids.map((i) => half[i].strip));
        e.h = Math.max(...e.ids.map((i) => half[i].h));
    }
    // (3 mm between the page's rows and bands, as between two quadrant rows)
    const room = m.body - 2 - 3 * (els.length - 1);
    const fullH = () => fulls.reduce((a, e) => a + e.strip + e.rows * e.h, 0);
    const pairNeed = (e) => e.strip + e.rows * e.h;
    const need = () => fullH() + pairs.reduce((a, e) => a + pairNeed(e), 0);
    // A quadrant row that does not fit two rows of cells keeps one (the tallest first).
    for (const e of pairs.slice().sort((x, y) => y.h - x.h)) if (need() > room) e.rows = 1;
    if (need() > room) return null;
    // A full band takes more rows (up to 4 items) while the page holds them, one band at a time.
    for (let grew = true; grew;) {
        grew = false;
        for (const e of fulls) {
            if (e.cols * e.rows >= PER_QUAD) continue;
            e.rows++;
            if (need() > room) { e.rows--; continue; }
            grew = true;
        }
    }
    // The spare height goes to the quadrant rows, each up to PT-PRE-1's (body - 5) / 2.
    const spare = Math.max(0, room - need());
    for (const e of pairs) {
        // (H13: each quadrant's cells grow to at most its own item / 0.72 - no empty band of 30 % - and a
        // quadrant shorter than its row keeps the rest as the unruled trailing area, PT-ENG-7)
        const capH = e.strip + e.rows * (e.h / 0.72);
        e.rowH = Math.min(capH, pairNeed(e) + Math.min(spare / pairs.length, Math.max(0, quadH0 - pairNeed(e))));
        // each quadrant of the row takes as many rows as its own items fit, up to 5 items (a short
        // skill beside a tall one takes more rows, never one stretched cell - H13)
        e.rowsK = {};
        e.cellHK = {};
        for (const i of e.ids) {
            const fit = Math.floor((e.rowH - e.strip + 0.01) / half[i].h);
            e.rowsK[i] = Math.max(e.rows, Math.min(Math.ceil(PER_QUAD_WIDE / half[i].cols), fit));
            // (a cell at most its item / 0.8 - H13; the quadrant's grid keeps that height and the rest
            // of the quadrant is the unruled trailing area, PT-ENG-7)
            e.cellHK[i] = Math.min((e.rowH - e.strip) / e.rowsK[i], half[i].h / 0.8);
        }
    }
    const per = quads.map(() => 0);
    for (const e of pairs) for (const i of e.ids) per[i] = Math.min(PER_QUAD_WIDE, half[i].cols * e.rowsK[i]);
    for (const e of fulls) per[e.ids[0]] = Math.min(PER_QUAD, e.cols * e.rows, quads[e.ids[0]].length);
    return { els, per, half, quads: pairs.length * 2 };
}
const headOf = (input) => {
    const target = (input.targetSkill && input.targetSkill.iCan) || ((input.skills || [])[0] || {}).iCan || '';
    return frameOf({ skills: input.skills || [], input, tabId: 'Check A', title: `Pre-skill check: ${topicOf(target)}`, score: 1, twoLine: false });
};
export const counts = (pools, input) => {
    const ids = Object.keys(pools);
    const base = Object.fromEntries(ids.map((id) => [id, perQuad(input, Number(String(id).replace(/\D/g, '')) || 0)]));
    if (input.perQuestion) return base;
    // (the probe measured, the one-page layout decides each skill's count: 5, 4 or 2 a quadrant)
    const ctx = ctxOf(input);
    const live = ids.filter((id) => (pools[id] || []).length);
    const L = checkLayout(live.map((id) => pools[id]), ctx, bandMetrics(ctx, layoutHeader(headOf(input).header)), input);
    return L ? Object.fromEntries(ids.map((id) => [id, live.includes(id) ? L.per[live.indexOf(id)] : 0])) : base;
};

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    const quads = [0, 1, 2, 3].map((i) => {
        let its = poolItems(input, `q${i}`).slice(0, input.perQuestion ? perQuad(input, i) : PER_QUAD_WIDE);
        if (form === 'B') its = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B', i)), its);
        return its;
    }).filter((q) => q.length);
    let all = quads.flat();
    const score0 = all.length;
    const target = (input.targetSkill && input.targetSkill.iCan) || ((input.skills || [])[0] || {}).iCan || '';
    const skillsOn = (input.skills || []).filter((s) => all.some((it) => it.q && it.q.skillId === s.skillId && (!it.q.categoryId || it.q.categoryId === s.categoryId)));
    const frame = frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: `Pre-skill check: ${topicOf(target)}`, score: all.length, twoLine: false });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const labels = labelStyleOf(ctx.look, input.labels);
    const scoreTag = (n) => `<span class="mq-quadscore">__/${n}</span>`;
    let start = 1;
    const band = (its, cols, rows, cellH, pageCols, center = !!input.perQuestion, quad = false) => {
        const b = {
            kind: 'band', label: '', instr: instructionText(instructionKeyOf(its, input.skills), its), extra: input.perQuestion ? '' : scoreTag(its.length),
            // (the detailed lesson's check centres each item in its grown cell, H13)
            content: gridPart(its.map((it) => planItem(center ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }) : it, { cols: pageCols, level: 0 })), Object.assign({ cols, rows, cellH, labels, start }, quad ? { cls: 'mq-quadgrid' } : {})),
        };
        start += its.length;
        return b;
    };
    const pages = [];
    let kept = 0;
    let quadFits = false;
    let gridCols = 4;
    // R1-8: the skills on as few pages as hold them whole - one page when the four fit (PT 2.10), else
    // the skills in order, each page as many as its layout holds; a skill too tall for any page alone
    // falls back to the stacked bands below.
    const groups = [];
    if (!input.perQuestion && quads.length) {
        const all4 = checkLayout(quads, ctx, m, input);
        if (all4) groups.push({ ids: quads.map((q, i) => i), L: all4 });
        else {
            let cur = [];
            let curL = null;
            let failed = false;
            for (let i = 0; i < quads.length; i++) {
                const mm = groups.length ? mCont : m;
                const tryIds = cur.concat(i);
                const t = checkLayout(tryIds.map((j) => quads[j]), ctx, mm, input);
                if (t) { cur = tryIds; curL = t; continue; }
                if (cur.length) groups.push({ ids: cur, L: curL });
                const alone = checkLayout([quads[i]], ctx, mCont, input);
                if (!alone) { failed = true; break; }
                cur = [i];
                curL = alone;
            }
            if (failed) groups.length = 0;
            else if (cur.length && curL) groups.push({ ids: cur, L: curL });
            // (PG-23: a last page of one skill after a page of three takes the third skill too, when both pages hold theirs)
            if (groups.length === 2 && groups[1].ids.length === 1 && groups[0].ids.length >= 3) {
                const a = groups[0].ids.slice(0, -1);
                const b = [groups[0].ids[groups[0].ids.length - 1], ...groups[1].ids];
                const La = checkLayout(a.map((j) => quads[j]), ctx, m, input);
                const Lb = checkLayout(b.map((j) => quads[j]), ctx, mCont, input);
                if (La && Lb) groups.splice(0, 2, { ids: a, L: La }, { ids: b, L: Lb });
            }
        }
    }
    if (groups.length) {
        gridCols = 1;
        for (const g of groups) {
            const L = g.L;
            const at = (k) => g.ids[k];
            L.els.forEach((e) => e.ids.forEach((k) => { quads[at(k)] = quads[at(k)].slice(0, L.per[k]); }));
            const sections = L.els.map((e) => {
                if (e.type === 'full') {
                    const q = quads[at(e.ids[0])];
                    return band(q, e.cols, Math.ceil(q.length / e.cols), e.h, e.cols);
                }
                const parts = e.ids.map((k) => band(quads[at(k)], L.half[k].cols, e.rowsK[k], e.cellHK[k], L.half[k].pageCols, false, true));
                return { kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-quadrow', height: `${e.rowH.toFixed(2)}mm`, parts };
            });
            pages.push({ sections });
            gridCols = Math.max(gridCols, ...L.els.map((e) => (e.type === 'full' ? e.cols : Math.max(...e.ids.map((k) => L.half[k].cols)))));
        }
        quadFits = groups.length === 1 && groups[0].L.quads === 4;
    } else if (!input.perQuestion) for (let i = 0; i < quads.length; i++) quads[i] = quads[i].slice(0, PER_QUAD);
    if (!pages.length && input.perQuestion && quads.length === 4 && quads.every((q) => fitsAt(q, 4, ctx))) {
        // The detailed lesson's check: two rows of two quadrants, each a band over a 2 x 2 grid.
        const quadH = (m.body - 2 - 3) / 2;
        const cellH = (quadH - m.strip) / 2;
        const need = Math.max(...quads.map((q) => hMinAt(q, 4, ctx)));
        quadFits = true;
        gridCols = 2;
        if (need <= cellH) {
            const rowPart = (a, b) => ({ kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-quadrow', height: `${quadH.toFixed(2)}mm`, parts: [band(a, 2, 2, cellH, 4), band(b, 2, 2, cellH, 4)] });
            pages.push({ sections: [rowPart(quads[0], quads[1]), rowPart(quads[2], quads[3])] });
        }
    }
    if (!pages.length) {
        // Stacked full-width bands, whole bands per page. A check is short (PT 2.10): each band
        // keeps the whole rows its share of one page holds (at least one row), so four wide
        // pictures print one page of four one-row bands instead of four pages.
        let cur = { sections: [], used: 0, budget: m.budget };
        // `perQuestion` (the detailed lesson's Prerequisite Check, V22 §9.1): the bands fill the body
        // (flex weights by content), each cell growing to at most 1.45 x its content so no empty band
        // reaches 30 % (H13). Absent on every other check.
        let grow = 1;
        let whole = false;
        if (input.perQuestion) {
            const own = quads.map((q0) => { const c = [4, 2, 1].find((cc) => fitsAt(q0, cc, ctx)) || 1; return { h: hMinAt(q0, c, ctx), rows: Math.ceil(q0.length / c) }; });
            const need = own.reduce((a, o) => a + m.strip + o.rows * o.h, 0);
            const rowsH = own.reduce((a, o) => a + o.rows * o.h, 0);
            if (need < m.budget && rowsH > 0) grow = Math.min(GROW_MAX, 1 + (m.budget - need - 1) / rowsH);
            // (every item the description asks for prints when the whole check fits one page - critic D15)
            whole = need <= m.budget;
        }
        for (const q0 of quads) {
            const cols = [4, 2, 1].find((c) => fitsAt(q0, c, ctx)) || 1;
            const h = hMinAt(q0, cols, ctx) * grow;
            const share = m.budget / quads.length - m.strip;
            const q = whole ? q0 : q0.slice(0, Math.min(q0.length, cols * Math.max(1, Math.floor(share / Math.max(1, h)))));
            kept += q.length;
            const rows = Math.ceil(q.length / cols);
            const bandH = m.strip + rows * h;
            if (cur.sections.length && cur.used + bandH > cur.budget) { pages.push(cur); cur = { sections: [], used: 0, budget: mCont.budget }; }
            // (the detailed lesson's check never lays a band out in more columns than it has items: one item in a two-up
            // band left an empty bordered half - lesson 4 critic r2 D9; the item keeps its measured size, centred)
            cur.sections.push(band(q, input.perQuestion ? Math.max(1, Math.min(cols, q.length)) : cols, rows, h, cols));
            cur.used += bandH;
        }
        if (cur.sections.length) pages.push(cur);
        // The detailed lesson's check: the last band takes the page's spare height (one unruled
        // trailing area inside the frame, V22 §8.12.4), so the body is not blank at its foot.
        // (only when the rows could not grow to the body: an empty bordered strip under the last row reads
        // as a missing item - critic r2 R7)
        if (input.perQuestion && grow >= GROW_MAX) for (const pg of pages) { const last = pg.sections[pg.sections.length - 1]; if (last) last.grow = true; }
    }
    all = quads.flat();
    const n = kept || all.length;
    const finalFrame = n === score0 ? frame : frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: `Pre-skill check: ${topicOf(target)}`, score: n, twoLine: false });
    return assemble(ROLE_ID, Object.assign({}, input, { form }), finalFrame, pages.map((p) => ({ sections: p.sections })), {
        scaffoldLevel: 0,
        meta: { pages: pages.length, items: n, scoreOutOf: n, form, quadrants: quadFits && pages.length === 1, sourceSkills: [...new Set(all.map((it) => it.skill || (it.q ? `${it.q.categoryId}:${it.q.skillId}` : '')).filter(Boolean))], fits: [{ cols: gridCols, rows: 2, line: `Fits: ${quads.length} prerequisite skills, ${all.length} items.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
