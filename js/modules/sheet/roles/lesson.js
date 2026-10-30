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

// Lessons-phase0 0.5 (design/LESSON_LIBRARY_PLAN.md §8c, lead decision D2): the page builders live in
// sheet/lesson-pages/* (the chart, the sheet's bands, the Independent rows, the strip) and the archetype
// drawings and cases in sheet/lesson-arch/*; this role composes them into the packet's chart and lesson
// sheet. The lesson sheet's bands and any further lesson part come from the registry
// (lesson-pages/index.js), so a new page job registers itself there without editing this file. The
// role's earlier exports are re-exported below, unchanged.

import { ctxOf, frameOf, layoutHeader, bandMetrics, assemble, poolItems, labelStyleOf } from './compose.js';
import { workedStepsOf } from '../anchors.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { hopsSvg } from '../lesson-arch/fact.js';
import { roundLineSvg, roundLineMm, roundLinePad } from '../lesson-arch/line.js';
import { isWordBar, chartStepsOf } from '../lesson-arch/story.js';
import { winShare } from '../lesson-arch/grid.js';
import { EXAMPLE_KEYS, reflowsAt, stateGroups, kindOf, generalStep, namedSteps, stepMarker } from '../lesson-pages/common.js';
import { pickExample, pickSecond, otherExamples, chartLayout, stateItems, finalItems, secondItems, sameFactForms, chartPage } from '../lesson-pages/chart.js';
import { vocabItem, vocabOrder } from '../lesson-pages/vocab.js';
import { warmShape } from '../lesson-pages/warm-up.js';
import { pickWeDo, stepsItem } from '../lesson-pages/we-do.js';
import { stripHtml, stripItem, independentBand } from '../lesson-pages/practice.js';
import { sheetBands, lessonPart } from '../lesson-pages/index.js';

// (The role's earlier exports, now homed in the builders.)
export { reflowsAt, winShare, CASE_TESTS, pickExample, pickSecond, otherExamples, pickWeDo, stateGroups, hopsSvg, roundLineSvg, roundLineMm, roundLinePad };
export { kindOf, generalStep, namedSteps, stepMarker, chartLayout, stateItems, finalItems, secondItems, stripHtml, stripItem, vocabOrder, vocabItem, stepsItem };

export const ROLE_ID = 'lesson';
/**
 * The lesson skill's cells are drawn as Guided cells (level 2-3: heads, grey boxes) as well as
 * Independent ones, so they are measured at their tallest; a Warm-up cell is drawn at level 1.
 */
export const MEASURE_LEVEL = (poolId) => (poolId === 'main' ? 3 : 1);
export const PROBE = 16;

/* ============================================================================ the pools */

/** The lesson skill ('main') and one pool per prerequisite skill ('w0', 'w1'). */
export function sources(skills, helpers = {}) {
    const main = skills[0];
    const pre = ((helpers.lesson && helpers.lesson.warmSkills) || []).slice(0, 2);
    // Lessons r3: an example case the main pool rarely deals (a 0 in the ones AND a one-place
    // bottom number; a number in the 90s) gets a pool of its own, dealt to the case's `ref`
    // floors (print-sheet.js refAccepts) - the chart's other examples come from it.
    const data = helpers.lesson && helpers.lesson.data;
    const extra = EXAMPLE_KEYS.filter((k) => data && data[k] && data[k].ref).map((k) => ({
        id: `x${k}`, skills: [Object.assign({ categoryId: main.categoryId, skillId: main.skillId }, main.opts ? { opts: main.opts } : {}, main.minTop !== undefined ? { minTop: main.minTop } : {}, main.maxTop !== undefined ? { maxTop: main.maxTop } : {}, data[k].ref)],
    }));
    return [{ id: 'main', skills: [main] }, ...pre.map((s, i) => ({ id: `w${i}`, skills: [s] })), ...extra];
}

export const measureCols = () => [1, 2, 3, 4];

export function counts(pools, input) {
    const shape = warmShape(pools, input);
    // div_facts (one-number facts): the lesson sheet's Independent rows reach 18 at S (critic R3
    // N-3), so the main pool deals enough for the example, the Guided set and 18 more.
    const mainPool = pools.main || [];
    const divFacts = mainPool.length > 0 && mainPool.every((it) => it.q && it.q.divForm);
    const out = { main: divFacts ? PROBE + 12 : PROBE };
    for (const [id, s] of Object.entries(shape)) out[id] = s.k * (s.rows || 1);
    // (split rows per kind may fall back to the shared row in `plan`: deal enough for either)
    if (Object.values(shape).some((s) => s.split)) for (const [id, s] of Object.entries(warmShape(pools, Object.assign({}, input, { _warmShared: true })))) out[id] = Math.max(out[id] || 0, s.k * (s.rows || 1));
    for (const id of Object.keys(pools)) if (/^x/.test(id)) out[id] = 3;
    return out;
}

/* =========================================================================== the extras */

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
    // (a bar story with the lesson's own chart steps: the Steps zone and strip name those steps)
    const steps = ex ? (data && Array.isArray(data.chartSteps) && isWordBar(ex) ? chartStepsOf(ex, data) : workedStepsOf(ex)) : [];
    const out = [];
    if (ex) out.push(...stateItems(ex, data));
    const { ex2, ex3, ex4 } = otherExamples(input, ex, data);
    if (ex2) out.push(...secondItems(ex2));
    // Lessons r2-r3: the other examples whole (the chart shows them when the second example's row
    // of states does not fit), the third and fourth cases where the lesson names them (rounding:
    // ends in 5; the 90s round up to 100).
    const lab = (k) => (data && data[k] && data[k].label) || '';
    // div_facts Mix (critic R1 D7): the chart shows the example's ONE fact in the other two
    // forms it deals ("the same fact, written another way"), so every form on the practice pages
    // has been modelled.
    const mixFinals = ex && !ex2 && ex.q && ex.q.divMix ? sameFactForms(ex) : [];
    out.push(...finalItems(mixFinals.length ? mixFinals : [{ it: ex2, label: lab('second') }, { it: ex3, label: lab('third') }, { it: ex4, label: lab('fourth') }]));
    const v = vocabItem(data && data.vocab, input.seed);
    if (v) out.push(v);
    if (steps.length) { out.push(stepsItem(data, steps)); out.push(stripItem(data, steps)); }
    // The Independent rows are drawn at level 1, but the pool was measured at the Guided cells'
    // level 3 (heads, grey boxes): a level-1 twin of each item is measured for the rows' height.
    for (const it of main) if (it !== ex) out.push(Object.assign({}, it, { measured: null, measureLevel: 1, lessonIndepOf: it, pool: 'extra' }));
    return out;
}

/* ============================================================================== the plan */

export function plan(input = {}) {
    // A part the registry adds (lesson-pages/index.js registerLessonPart, role 'lesson'): its own builder.
    const asked = input.lesson && input.lesson.part;
    const own = asked && !OWN_PARTS.has(asked) ? lessonPart(asked) : null;
    if (own && typeof own.plan === 'function') return partPlan(own, input);
    // Warm-up rows per item kind (critic SU-C r2 N2): when split rows would push the sheet onto
    // another page, the shared row is kept (the page count never grows for the split).
    const p1 = planOnce(input);
    if (!p1._warmSplit || input._warmShared) return p1;
    const p0 = planOnce(Object.assign({}, input, { _warmShared: true }));
    return (p1.pages || []).length > (p0.pages || []).length ? p0 : p1;
}

/** The parts this role plans itself ('all' draws the chart and the sheet, as before). */
const OWN_PARTS = new Set(['all', 'chart', 'sheet']);

/** A registered lesson part's plan: its pages in the lesson's frame (title, tab = the part's name, tags). */
function partPlan(def, input) {
    const ctx = ctxOf(input);
    const lesson = input.lesson || {};
    const target = input.targetSkill ? [input.targetSkill] : (input.skills || []).slice(0, 1);
    const frame = frameOf({ skills: target, input, tabId: def.name, score: 0, footerLeft: lesson.tagLine });
    const pages = def.plan(input, ctx, frame) || [];
    const p = assemble(ROLE_ID, input, frame, pages, { scaffoldLevel: 1, meta: { part: def.id, items: 0, fits: [{ cols: 1, rows: pages.length, line: `Fits: ${def.name} on ${pages.length} page${pages.length === 1 ? '' : 's'}.` }] } });
    p.cls = [p.cls || '', 'mq-lesson'].filter(Boolean).join(' ');
    return p;
}

function planOnce(input = {}) {
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
    const second = extrasList.filter((x) => x.lessonSecond !== undefined);
    // The host draws the chart and the lesson sheet as two sheets (lessons r1: the chart is L at
    // every size): `lesson.part` = 'chart' | 'sheet' ('all' draws both, as before).
    const part = lesson.part || 'all';
    const { ex2: example2, ex3: example3, ex4: example4 } = otherExamples(input, example, data);
    const finals = extrasList.filter((x) => x.lessonFinal !== undefined);
    const vocab = extrasList.find((x) => x.lessonVocab);
    const stepsZone = extrasList.find((x) => x.lessonSteps);
    const labels = labelStyleOf(ctx.look, input.labels);
    const tabId = `Lesson ${lesson.number || 1}`;
    const probeFrame = frameOf({ skills: target, input, tabId, score: 1, footerLeft: lesson.tagLine });
    const m = bandMetrics(ctx, layoutHeader(probeFrame.header));
    const mCont = bandMetrics(ctx, layoutHeader(probeFrame.header), { cont: true });

    /* ---- the sheet's bands, in the registry's order (lesson-pages/index.js): Vocabulary + Remember,
       Warm-up (the prerequisite skills side by side), Guided Practice ("we do") beside the Steps */
    const env = {
        input, ctx, m, data, labels, main, example, example2, example3, example4, exSteps, extrasList, vocab, stepsZone,
        groups: [], letter: 1, warmCount: 0, weDo: [], warm: { halves: [], shape: {} },
    };
    for (const b of sheetBands()) b.build(env);
    const { groups, letter, warmCount, weDo } = env;
    const { halves, shape } = env.warm;

    /* ---- the Remember strip gives way when it alone pushes the Guided band overleaf */
    const total = groups.reduce((a, g) => a + g.h, 0);
    const bandSizes = { budget: +m.budget.toFixed(1), bands: groups.map((g) => [String((g.sections[0] && g.sections[0].label) || (g.sections[0] && g.sections[0].parts && g.sections[0].parts[0] && g.sections[0].parts[0].label) || '?'), +g.h.toFixed(1)]) };
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

    /* ---- Independent Practice: whole rows filling the last page (PT-OPN-7, H5; lesson-pages/practice.js) */
    const indep = independentBand({ input, ctx, m, data, main, example, example2, example3, example4, weDo, extrasList, cur, labels, letter });

    /* ---- the spare height of a page goes back into its grids (at most a quarter of a cell) */
    // Lessons r1: a page with no Independent rows (they did not fit) shares its spare height more
    // widely - the vocabulary, the Warm-up and the Guided cells each up to about a third - so the
    // sheet never ends on a blank band above the footer.
    const noRows = indep.length === 0;
    for (const pg of pages) {
        const spare = pg.budget - pg.used;
        const wide = noRows || !!(data && data.growAll);
        const grows = pg.grows.filter((g) => g.grid && (g.cap > 0 || (wide && g.capIfEmpty > 0)));
        if (spare <= 2 || !grows.length) continue;
        // (`growAll`, lesson data - the detailed lesson maker, lesson 5: every band may grow as on a page with no
        // Independent rows, and a band that reaches its cap passes the rest of its share to the bands after it, so the
        // sheet does not end on a blank band; absent, as before)
        let left = spare;
        let carry = 0;   // (what a band's `maxAdd` refused, passed to the bands after it)
        for (const [gi, g] of grows.entries()) {
            const cap0 = wide && g.capIfEmpty !== undefined ? g.capIfEmpty : (g.cap !== undefined ? g.cap : 0.35);
            const cap = data && data.growAll ? Math.max(cap0, 0.5) : cap0;
            const share = data && data.growAll ? left / (grows.length - gi) : spare / grows.length + carry;
            const add0 = Math.min(share, g.h * cap);
            const add = g.maxAdd !== undefined ? Math.min(add0, g.maxAdd) : add0;
            carry = data && data.growAll ? 0 : add0 - add;
            left -= add;
            for (const part of g.grid) part.height = `${Math.round(((parseFloat(part.height) || g.h) + add) * 100) / 100}mm`;
            if (g.box) g.box.html = g.box.html.replace(/height:[\d.]+mm/, `height:${(g.h + add).toFixed(2)}mm`);
        }
    }

    const score = warmCount + indep.length;
    const frame = frameOf({ skills: target, input, tabId, score, footerLeft: lesson.tagLine });
    const out = [];
    let zoom = 0;
    let secondShown = 0;
    let chartSizing = null;
    if (states.length && part !== 'sheet') {
        const chart = chartPage(input, ctx, data, example, states.filter((s) => s.lessonState !== undefined), draws, second, extrasList.find((x) => x.lessonTail), finals, extrasList.find((x) => x.lessonTailPanel));
        zoom = chart.zoom;
        secondShown = chart.second;
        chartSizing = chart.sizing;
        out.push({ header: chart.header, sections: chart.sections });
    }
    if (part !== 'chart') pages.forEach((pg, i) => out.push({
        header: i === 0 ? frame.header : undefined,
        sections: (i > 0 ? [{ kind: 'html', html: '<i class="mq-cont" hidden></i>' }] : []).concat(pg.sections),
    }));
    const plan0 = assemble(ROLE_ID, input, frame, out, {
        scaffoldLevel: 1,
        meta: {
            items: warmCount + weDo.length + indep.length, scoreOutOf: score, warmUp: warmCount, guided: weDo.length, independent: indep.length,
            states: states.length, chartZoom: zoom, example: example ? String((example.q && example.q.text) || '') : '',
            example2: secondShown && example2 ? String((example2.q && example2.q.text) || '') : '', part, chartSizing,
            example2Found: example2 ? String((example2.q && example2.q.text) || '') : '',
            example3: example3 ? String((example3.q && example3.q.text) || '') : '', example4: example4 ? String((example4.q && example4.q.text) || '') : '', bandSizes,
            // the chart's items themselves (the detailed lesson maker reads its scripts' numbers from them)
            exampleQs: [example, example2, example3, example4].filter(Boolean).map((x) => x.q),
            fits: [{ cols: 1, rows: out.length, line: `Fits: an anchor chart of ${states.length} steps, ${warmCount} warm-up, ${weDo.length} guided and ${indep.length} independent on ${out.length} page${out.length > 1 ? 's' : ''}.` }],
            notes: data ? [] : ['No lesson data for this skill yet: the warm-up uses the skills listed before it, with no vocabulary.'],
        },
    });
    // The anchor chart page is no pupil page: the teaching sheet's first page carries the full
    // header, the pages after it the continuation header (HD-20).
    plan0.pages = plan0.pages.map((pg, i) => (i > 0 && !out[i].header && pg.header === frame.header ? Object.assign({}, pg, { header: frame.contHeader }) : pg));
    plan0.cls = [plan0.cls || '', 'mq-lesson'].filter(Boolean).join(' ');
    if (halves.some((id) => shape[id].split)) Object.defineProperty(plan0, '_warmSplit', { value: true, enumerable: false });
    return plan0;
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
    ROLE_ID, PROBE, sources, measureCols, counts, extras, plan, pickExample, pickWeDo, pickSecond, CASE_TESTS, stateGroups, stateItems, namedSteps,
    stripHtml, stripItem, vocabItem, packetParts, tagLine, chartLayout,
};
