// js/modules/sheet/roles/pre-skill-check.js
// PRE-SKILL CHECK (design/PAGE_TYPES.md 2.10): a short check of the prerequisite sub-skills
// before a ladder starts. Two forms. No supports (level 0).
//
//   Quadrants   four boxed quadrants, one prerequisite skill each, each with its own strip (the
//               skill's instruction) and its own small score "__/4" (PT-PRE-1, P-25)
//   Grid        2 x 2 in a quadrant (cells about 46 mm wide) when the skill's cell fits that
//               width; otherwise the page stacks four full-width bands of up to 4 cells, and a
//               band that does not fit moves whole to the next page (PT-ENG-8)
//   Skills      the ladder's pre-skill list is not modelled yet (P-AT-1), so the prerequisites are
//               the skills just before this one in its category; a teacher-given set of 2 to 4
//               skills is used as it is (PT-PRE-3). A skill with no earlier skill checks itself.
//   Title       "Pre-skill check: <topic>" (HD-13); tab "Check A" / "Check B"; Score = all items
//   Routes      optional `input.routes` [{lesson, title}] per question (design/LESSON_LIBRARY_PLAN.md §8b, lead
//               decision D1, lessons-phase0): a small teacher tag under that question's band, "If missed ->
//               Lesson <id> <title>" (9 pt, data-ws-teacher, inside its quadrant or band, its height taken from
//               the band so no cell shrinks below its floor), and the key ends with the ROUTING TABLE page
//               (`routePlan`: question letters, what each checks, what to teach first, the rule for one / two or
//               more misses). Without `routes` the page is drawn exactly as before.
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, hMinAt, fitsAt, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, topicOf, labelStyleOf, rng, shuffle, deriveSeed,
} from './compose.js';

export const ROLE_ID = 'pre-skill-check';
const PER_QUAD = 4;

export function sources(skills, { earlier }) {
    let list;
    if (skills.length >= 2) list = skills.slice(0, 4);
    else {
        const prev = earlier(skills[0], 4);
        list = prev.length ? prev.slice().reverse() : [skills[0]];
    }
    // One quadrant per prerequisite, up to four. A skill with fewer earlier skills checks fewer
    // quadrants (a first skill checks itself once) rather than repeating one skill four times.
    return list.slice(0, 4).map((sk, i) => ({ id: `q${i}`, skills: [sk] }));
}
export const measureCols = () => [1, 2, 4];
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
/* ------------------------------------------------------------------ routing (§8b, D1) */

const PT_MM = 25.4 / 72;
/** The teacher tag's height (mm): one 9 pt line at 1.3 leading, plus its padding. */
export const ROUTE_TAG_MM = 9 * PT_MM * 1.3 + 2;
/** A question's route, or null: {lesson, title, checks?}. */
const routeOf = (input, i) => {
    const r = input && Array.isArray(input.routes) ? input.routes[i] : null;
    return r && (r.lesson || r.title) ? r : null;
};
const escT = (t) => String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** The words of a route's tag. */
export const routeText = (r) => `If missed \u2192 Lesson ${r.lesson || ''}${r.title ? ` ${r.title}` : ''}`.replace(/\s+/g, ' ').trim();
/** The teacher tag under a question (inline styles: the sheet's stylesheet is unchanged, so no other page changes). */
export const routeTagHtml = (r, lines = 1) => `<p class="mq-lpretag" data-ws-teacher style="margin:0;padding:.6mm 3mm 1.4mm;height:${routeTagMm(lines).toFixed(2)}mm;box-sizing:border-box;font-size:9pt;line-height:1.3;color:#949494;flex:none">${escT(routeText(r))}</p>`;
/** A tag's height (mm) at `lines` lines of 9 pt. */
export const routeTagMm = (lines = 1) => 9 * PT_MM * 1.3 * Math.max(1, lines) + 2;
/** The lines a route's tag wraps to in a band `wMm` wide (9 pt Andika: about 1.6 mm a character; never clipped, TY-12). */
export const routeTagLines = (r, wMm) => (r ? Math.max(1, Math.ceil((routeText(r).length * 1.6) / Math.max(20, wMm - 8))) : 1);

/**
 * THE ROUTING TABLE (one builder: the Prerequisite Check's key page here, and the standard lesson packet's key; the
 * detailed lesson's T6 prints the same three columns). `rows`: [{letters, checks, lesson, title}].
 */
export function routingTableHtml(rows) {
    const td = 'border:1pt solid #000;padding:1.6mm 2.4mm;text-align:left;vertical-align:top';
    const body = rows.map((r) => `<tr><td style="${td};font-weight:700;text-align:center;width:16mm">${escT(r.letters)}</td><td style="${td}">${escT(r.checks || '')}</td>`
        + `<td style="${td}"><b>Lesson ${escT(r.lesson || '')}</b>${r.title ? ` ${escT(r.title)}` : ''}</td></tr>`).join('');
    return `<div class="mq-lroute" style="font-size:var(--ws-text,14pt);line-height:1.35;padding:3mm 4mm">`
        + `<table style="border-collapse:collapse;width:100%;margin:0 0 4mm"><thead><tr><th style="${td};font-weight:700">Question</th><th style="${td};font-weight:700">What it checks</th><th style="${td};font-weight:700">If missed, teach first</th></tr></thead><tbody>${body}</tbody></table>`
        + '<ul style="margin:0;padding-left:5mm"><li><b>All correct:</b> start this lesson with its anchor chart.</li>'
        + '<li style="margin-top:1.5mm"><b>One missed:</b> teach that lesson first, then come back to this lesson.</li>'
        + '<li style="margin-top:1.5mm"><b>Two or more missed:</b> start with the earliest one missed (the lowest number), then the next, then come back to this lesson.</li></ul></div>';
}

/** The key's routing page (a teacher page: no Name, Date or Score), or null without routes. */
export function routePlan(input, rows) {
    if (!rows.length) return null;
    const lesson = input.lesson || {};
    // (titled by the lesson the check prepares - `checkFor` - not by its first prerequisite)
    const target = input.checkFor ? [input.checkFor] : input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const f = frameOf({ skills: target, input, tabId: 'Check key', score: 0, footerLeft: lesson.tagLine });
    const header = Object.assign({}, f.header, { name: false, date: false, score: false });
    const section = { kind: 'band', label: 'Prerequisite Check: where next', instr: '', html: routingTableHtml(rows) };
    return assemble(ROLE_ID, input, Object.assign({}, f, { header }), [{ header, sections: [section] }], { scaffoldLevel: 1, meta: { items: 0, part: 'prereq-route' } });
}

export const counts = (pools, input) => Object.fromEntries(Object.keys(pools).map((id) => [id, perQuad(input, Number(String(id).replace(/\D/g, '')) || 0)]));

export function plan(input = {}) {
    if (!(Array.isArray(input.routes) && input.routes.some(Boolean))) return planCheck(input, 1);
    // With routes, the tags never cost the check a page: a stacked check that would run onto another page
    // keeps fewer rows a band (each band still at least one row; every cell at its measured size).
    const plain = planCheck(Object.assign({}, input, { routes: undefined }), 1).pages.length;
    let p = null;
    for (const cut of [1, 0.85, 0.7, 0.55]) { p = planCheck(input, cut); if (p.pages.length <= plain) break; }
    return p;
}

function planCheck(input, cut) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    const quads0 = [0, 1, 2, 3].map((i) => {
        let its = poolItems(input, `q${i}`).slice(0, perQuad(input, i));
        if (form === 'B') its = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B', i)), its);
        return its;
    });
    const quads = quads0.filter((q) => q.length);
    // (each band's question index, for its route; a route's tag takes TAG mm of its band)
    const qIndex = quads0.map((q, i) => (q.length ? i : -1)).filter((i) => i >= 0);
    const routed = !!(input.routes && quads.some((q, j) => routeOf(input, qIndex[j])));
    const TAG = routed ? ROUTE_TAG_MM : 0;
    const routeRows = [];
    const all = quads.flat();
    // (a lesson's Prerequisite Check, LR-17: titled by the lesson it prepares - `checkFor`, the lesson skill's meta)
    const target = (routed && input.checkFor && input.checkFor.iCan) || (input.targetSkill && input.targetSkill.iCan) || ((input.skills || [])[0] || {}).iCan || '';
    const skillsOn = (input.skills || []).filter((s) => all.some((it) => it.q && it.q.skillId === s.skillId && (!it.q.categoryId || it.q.categoryId === s.categoryId)));
    const frame = frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: `${routed && input.checkFor ? 'Prerequisite check' : 'Pre-skill check'}: ${topicOf(target)}`, score: all.length, twoLine: false });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const labels = labelStyleOf(ctx.look, input.labels);
    const scoreTag = (n) => `<span class="mq-quadscore">__/${n}</span>`;
    let start = 1;
    let bandNo = 0;
    // (the cell's own label: a black number tab on every look, CL-11a)
    const letterOf = (k) => String(k);
    const band = (its, cols, rows, cellH, pageCols, tagLines = 1) => {
        const qi = qIndex[bandNo++];
        const instr = instructionText(instructionKeyOf(its, input.skills), its);
        const grid = gridPart(its.map((it) => planItem(input.perQuestion ? Object.assign({}, it, { cellCls: [it.cellCls || '', 'mq-lvcenter'].join(' ').trim() }) : it, { cols: pageCols, level: 0 })), { cols, rows, cellH, labels, start });
        const r = routed ? routeOf(input, qi) : null;
        const b = {
            kind: 'band', label: '', instr, extra: input.perQuestion ? '' : scoreTag(its.length),
            // (the detailed lesson's check centres each item in its grown cell, H13)
            content: routed ? { kind: 'col', cls: 'mq-lprecol', parts: [grid, { kind: 'html', html: r ? routeTagHtml(r, tagLines) : `<p class="mq-lpretag" data-ws-teacher style="margin:0;height:${routeTagMm(tagLines).toFixed(2)}mm;flex:none"></p>` }] } : grid,
        };
        if (r) routeRows.push({ letters: its.length > 1 ? `${letterOf(start)}\u2013${letterOf(start + its.length - 1)}` : letterOf(start), checks: r.checks || instr, lesson: r.lesson, title: r.title });
        start += its.length;
        return b;
    };
    const pages = [];
    let kept = 0;
    const quadFits = quads.length === 4 && quads.every((q) => fitsAt(q, 4, ctx));
    if (quadFits) {
        // Two rows of two quadrants; each quadrant a band over a 2 x 2 grid (PT-PRE-2 at L).
        const quadH = (m.body - 2 - 3) / 2;
        const cellH = (quadH - m.strip - TAG) / 2;
        const need = Math.max(...quads.map((q) => hMinAt(q, 4, ctx)));
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
            const need = own.reduce((a, o) => a + m.strip + TAG + o.rows * o.h, 0);
            const rowsH = own.reduce((a, o) => a + o.rows * o.h, 0);
            if (need < m.budget && rowsH > 0) grow = Math.min(GROW_MAX, 1 + (m.budget - need - 1) / rowsH);
            // (every item the description asks for prints when the whole check fits one page - critic D15)
            whole = need <= m.budget;
        }
        if (routed && input.perQuestion) {
            // A lesson's Prerequisite Check (LR-17: one question per prerequisite): two questions that each fit half the
            // width share a row, so 3-4 questions fit one page; the rows grow to fill the body (at most GROW_MAX).
            const em = ((ctx.s && ctx.s.textPt) || 14) * PT_MM;
            const extraLines = (q, w) => Math.max(0, Math.ceil((String(instructionText(instructionKeyOf(q, input.skills), q) || '').length * 0.5 * em) / Math.max(30, w - 10)) - 1);
            const units = [];
            for (let j = 0; j < quads.length; j++) {
                const a = quads[j], b = quads[j + 1];
                // (two of like height only: a short item in a row sized for a tall one leaves its cell mostly empty, H13)
                const alike = () => { const ha = hMinAt(a, 2, ctx), hb = hMinAt(b, 2, ctx); return Math.min(ha, hb) >= 0.7 * Math.max(ha, hb); };
                if (b && fitsAt(a, 2, ctx) && fitsAt(b, 2, ctx) && alike()) { units.push([a, b]); j++; } else units.push([a]);
            }
            const colsOf = (q) => [4, 2, 1].find((c) => fitsAt(q, c, ctx)) || 1;
            const hOfU = (u) => Math.max(...u.map((q) => hMinAt(q, u.length === 2 ? 2 : colsOf(q), ctx)));
            const GAP = 3;   // (.mq-quadrow + .mq-quadrow: 3 mm)
            // (a half's instruction that wraps takes a second line: its strip is that much taller - stripExtraMm)
            const stripOf = (u) => m.strip + Math.max(0, ...u.map((q) => extraLines(q, u.length === 2 ? 93 : 186))) * em * 1.25;
            // (each unit's tags as tall as its longest one wraps to: a pair's two tags take the same lines)
            const unitIdx = []; { let j = 0; for (const u of units) { unitIdx.push(u.map((_, x) => qIndex[j + x])); j += u.length; } }
            const tagLinesOf = (k) => Math.max(...unitIdx[k].map((qi) => routeTagLines(routeOf(input, qi), units[k].length === 2 ? 93 : 186)));
            const tagOf = (k) => routeTagMm(tagLinesOf(k));
            const fixed = units.reduce((t, u, k) => t + stripOf(u) + tagOf(k) + (k ? GAP : 0), 0);
            // The spare height goes into the rows, each only as far as its item still fills all but a quarter of the cell
            // below it (CL-4b, owner 2026-10-23: an item starts at the top of its box, so a grown cell's empty room is at
            // its foot; H13: under 30 %) - the measured cell less ~3 mm of top pad, over 0.75; a pair takes its smaller
            // item's cap. What the rows cannot take spaces the questions apart (at most 40 mm a gap), so the check does not
            // end on a blank strip.
            const capOf = (u) => Math.max(hOfU(u), Math.min(...u.map((q) => (hMinAt(q, u.length === 2 ? 2 : colsOf(q), ctx) - 3) / 0.75)));
            const hs = units.map(hOfU);
            let spare = m.budget - fixed - hs.reduce((t, v) => t + v, 0) - 1;
            for (let pass = 0; pass < 6 && spare > 0.5; pass++) {
                const open = units.map((u, k) => k).filter((k) => hs[k] < capOf(units[k]) - 0.05);
                if (!open.length) break;
                const w = open.reduce((t, k) => t + hs[k], 0);
                let used = 0;
                for (const k of open) { const add = Math.min(capOf(units[k]) - hs[k], spare * hs[k] / w); hs[k] += add; used += add; }
                spare -= used;
            }
            const gapAdd = units.length > 1 && spare > 0.5 ? Math.min(40, spare / (units.length - 1)) : 0;
            units.forEach((u, k) => {
                const h = hs[k];
                const lead = cur.sections.length ? GAP + gapAdd : 0;
                const uh = stripOf(u) + tagOf(k) + h + lead;
                if (cur.sections.length && cur.used + uh > cur.budget) { pages.push(cur); cur = { sections: [], used: 0, budget: mCont.budget }; }
                if (cur.sections.length && gapAdd) cur.sections.push({ kind: 'html', html: `<div class="mq-lpregap" aria-hidden="true" style="height:${gapAdd.toFixed(2)}mm;flex:none"></div>` });
                if (u.length === 2) cur.sections.push({ kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-quadrow mq-lprerow', parts: u.map((q) => band(q, 1, 1, h, 2, tagLinesOf(k))) });
                else cur.sections.push(band(u[0], 1, 1, h, colsOf(u[0]), tagLinesOf(k)));
                kept += u[0].length + (u[1] ? u[1].length : 0);
                cur.used += uh;
            });
        } else for (const q0 of quads) {
            const cols = [4, 2, 1].find((c) => fitsAt(q0, c, ctx)) || 1;
            const h = hMinAt(q0, cols, ctx) * grow;
            const share = (m.budget / quads.length - m.strip - TAG) * cut;
            const q = whole ? q0 : q0.slice(0, Math.min(q0.length, cols * Math.max(1, Math.floor(share / Math.max(1, h)))));
            kept += q.length;
            const rows = Math.ceil(q.length / cols);
            const bandH = m.strip + TAG + rows * h;
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
    const n = kept || all.length;
    const finalFrame = n === all.length ? frame : frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: `${routed && input.checkFor ? 'Prerequisite check' : 'Pre-skill check'}: ${topicOf(target)}`, score: n, twoLine: false });
    const rp = routed ? routePlan(input, routeRows) : null;
    return assemble(ROLE_ID, Object.assign({}, input, { form }), finalFrame, pages.map((p) => ({ sections: p.sections })), {
        scaffoldLevel: 0,
        meta: Object.assign({ items: n, scoreOutOf: n, form, quadrants: quadFits && pages.length === 1, fits: [{ cols: quadFits ? 2 : 4, rows: 2, line: `Fits: ${quads.length} prerequisite skills, ${all.length} items.` }] },
            rp ? { routePlan: rp, routes: routeRows } : {}),
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan, routeText, routeTagHtml, routingTableHtml, routePlan, ROUTE_TAG_MM };
