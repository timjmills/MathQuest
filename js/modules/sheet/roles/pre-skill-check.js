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
    // Fewer than four prerequisites: the nearest one fills the empty quadrants.
    const out = [];
    for (let i = 0; i < 4; i++) out.push({ id: `q${i}`, skills: [list[Math.min(i, list.length - 1)]] });
    return out;
}
export const measureCols = () => [1, 2, 4];
export const counts = () => ({ q0: PER_QUAD, q1: PER_QUAD, q2: PER_QUAD, q3: PER_QUAD });

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const form = String(input.form || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    const quads = [0, 1, 2, 3].map((i) => {
        let its = poolItems(input, `q${i}`).slice(0, PER_QUAD);
        if (form === 'B') its = shuffle(rng(deriveSeed(input.seed === undefined ? 0 : input.seed, ROLE_ID, 'B', i)), its);
        return its;
    }).filter((q) => q.length);
    const all = quads.flat();
    const target = (input.targetSkill && input.targetSkill.iCan) || ((input.skills || [])[0] || {}).iCan || '';
    const skillsOn = (input.skills || []).filter((s) => all.some((it) => it.q && it.q.skillId === s.skillId && (!it.q.categoryId || it.q.categoryId === s.categoryId)));
    const frame = frameOf({ skills: skillsOn.length ? skillsOn : input.skills || [], input: Object.assign({}, input, { form }),
        tabId: `Check ${form}`, title: `Pre-skill check: ${topicOf(target)}`, score: all.length, twoLine: false });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const mCont = bandMetrics(ctx, layoutHeader(frame.header), { cont: true });
    const labels = labelStyleOf(ctx.look, input.labels);
    const scoreTag = (n) => `<span class="mq-quadscore">__/${n}</span>`;
    let start = 1;
    const band = (its, cols, rows, cellH, pageCols) => {
        const b = {
            kind: 'band', label: '', instr: instructionText(instructionKeyOf(its, input.skills)), extra: scoreTag(its.length),
            content: gridPart(its.map((it) => planItem(it, { cols: pageCols, level: 0 })), { cols, rows, cellH, labels, start }),
        };
        start += its.length;
        return b;
    };
    const pages = [];
    const quadFits = quads.length === 4 && quads.every((q) => fitsAt(q, 4, ctx));
    if (quadFits) {
        // Two rows of two quadrants; each quadrant a band over a 2 x 2 grid (PT-PRE-2 at L).
        const quadH = (m.body - 2 - 3) / 2;
        const cellH = (quadH - m.strip) / 2;
        const need = Math.max(...quads.map((q) => hMinAt(q, 4, ctx)));
        if (need <= cellH) {
            const rowPart = (a, b) => ({ kind: 'row', widths: ['1fr', '1fr'], cls: 'mq-quadrow', height: `${quadH.toFixed(2)}mm`, parts: [band(a, 2, 2, cellH, 4), band(b, 2, 2, cellH, 4)] });
            pages.push({ sections: [rowPart(quads[0], quads[1]), rowPart(quads[2], quads[3])] });
        }
    }
    if (!pages.length) {
        // Stacked full-width bands, whole bands per page.
        let cur = { sections: [], used: 0, budget: m.budget };
        for (const q of quads) {
            const cols = [4, 2, 1].find((c) => fitsAt(q, c, ctx)) || 1;
            const rows = Math.ceil(q.length / cols);
            const h = hMinAt(q, cols, ctx);
            const bandH = m.strip + rows * h;
            if (cur.sections.length && cur.used + bandH > cur.budget) { pages.push(cur); cur = { sections: [], used: 0, budget: mCont.budget }; }
            cur.sections.push(band(q, cols, rows, h, cols));
            cur.used += bandH;
        }
        if (cur.sections.length) pages.push(cur);
    }
    return assemble(ROLE_ID, Object.assign({}, input, { form }), frame, pages.map((p) => ({ sections: p.sections })), {
        scaffoldLevel: 0,
        meta: { items: all.length, scoreOutOf: all.length, form, quadrants: quadFits && pages.length === 1, fits: [{ cols: quadFits ? 2 : 4, rows: 2, line: `Fits: ${quads.length} prerequisite skills, ${all.length} items.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, counts, plan };
