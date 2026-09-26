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

// Phase 0 (design/LESSON_LIBRARY_PLAN.md §8c): the page builders live in sheet/lesson-pages/* and the
// archetype drawings in sheet/lesson-arch/*; this role composes them into the packet's first
// sheets. Its old exports are re-exported below, unchanged.

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, bestCols, planItem, gridPart, instructionKeyOf,
    instructionText, assemble, poolItems, labelStyleOf,
} from './compose.js';
import { workedStepsOf } from '../anchors.js';
import { casesOf } from '../lesson-rules.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { hopsSvg } from '../lesson-arch/fact.js';
import { roundLineSvg, roundLineMm, roundLinePad, isRound } from '../lesson-arch/line.js';
import { EXAMPLE_KEYS, keyOfItem, mainPool, warmPools, plainItem, stateGroups, namedSteps, stepMarker, hAt, fitsWidth, hOf } from '../lesson-pages/common.js';
import { pickExample, pickSecond, otherExamples, chartLayout, stateItems, finalItems, secondItems, chartPage } from '../lesson-pages/chart.js';
import { vocabItem, vocabOrder, vocabBands } from '../lesson-pages/vocab.js';
import { warmShape, warmUpBand } from '../lesson-pages/prereq-check.js';
import { pickWeDo, stepsItem, weDoBand } from '../lesson-pages/we-do.js';
import { stripHtml, stripItem } from '../lesson-pages/practice.js';

// (The role's earlier exports, now homed in the builders.)
export { CASE_TESTS, hopsSvg, roundLineSvg, roundLineMm, roundLinePad, plainItem, stateGroups, namedSteps, stepMarker };
export { pickExample, pickSecond, otherExamples, chartLayout, stateItems, finalItems, secondItems };
export { vocabItem, vocabOrder, pickWeDo, stepsItem, stripHtml, stripItem };

export const ROLE_ID = 'lesson';
/**
 * The lesson skill's cells are drawn as Guided cells (level 2-3: heads, grey boxes) as well as
 * Independent ones, so they are measured at their tallest; a Warm-up cell is drawn at level 1.
 */
export const MEASURE_LEVEL = (poolId) => (poolId === 'main' ? 3 : 1);
export const PROBE = 16;
const AUTO_COLS = { S: 4, M: 3, L: 3 };

/* ============================================================================ the pools */

/** The lesson skill ('main') and one pool per prerequisite skill ('w0', 'w1'). */
export function sources(skills, helpers = {}) {
    const main = skills[0];
    const pre = ((helpers.lesson && helpers.lesson.warmSkills) || []).slice(0, 2);
    // Lessons r3: an example case the main pool rarely deals (a 0 in the ones AND a one-place
    // bottom number; a number in the 90s) gets a pool of its own, dealt to the case's `ref`
    // floors (print-sheet.js refAccepts) - the chart's other examples come from it.
    const data = helpers.lesson && helpers.lesson.data;
    const lr1Off = ((helpers.lesson && helpers.lesson.rulesOff) || []).includes('LR-1');
    const extra = lr1Off ? [] : EXAMPLE_KEYS.filter((k) => data && data[k] && data[k].ref).map((k) => ({
        id: `x${k}`, skills: [Object.assign({ categoryId: main.categoryId, skillId: main.skillId }, main.opts ? { opts: main.opts } : {}, main.minTop !== undefined ? { minTop: main.minTop } : {}, main.maxTop !== undefined ? { maxTop: main.maxTop } : {}, data[k].ref)],
    }));
    return [{ id: 'main', skills: [main] }, ...pre.map((s, i) => ({ id: `w${i}`, skills: [s] })), ...extra];
}

export const measureCols = () => [1, 2, 3, 4];

export function counts(pools, input) {
    const shape = warmShape(pools, input);
    const out = { main: PROBE };
    for (const [id, s] of Object.entries(shape)) out[id] = s.k * (s.rows || 1);
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
    const main = mainPool(input);
    const ex = pickExample(main, data);
    const steps = ex ? workedStepsOf(ex) : [];
    const out = [];
    if (ex) out.push(...stateItems(ex, data));
    const { ex2, ex3, ex4 } = otherExamples(input, ex, data);
    if (ex2) out.push(...secondItems(ex2));
    // Lessons r2-r3: the other examples whole (the chart shows them when the second example's row
    // of states does not fit), the third and fourth cases where the lesson names them (rounding:
    // ends in 5; the 90s round up to 100).
    const lab = (k) => (data && data[k] && data[k].label) || '';
    out.push(...finalItems([{ it: ex2, label: lab('second') }, { it: ex3, label: lab('third') }, { it: ex4, label: lab('fourth') }]));
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
    const ctx = ctxOf(input);
    const lesson = input.lesson || {};
    const data = lesson.data || null;
    const main = mainPool(input);
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
    // LR-5 (lessons r4): one item never twice in the packet - the chart's examples leave the pool
    // (a turnaround included), and so does every repeat of an item the pool already holds.
    const rulesOff = new Set(lesson.rulesOff || []);
    const keyOf = keyOfItem;
    const examples = [example, example2, example3, example4].filter(Boolean);
    const exampleKeys = new Set(examples.map(keyOf));
    const seenK = new Set();
    const mainU = rulesOff.has('LR-5') ? main : main.filter((it) => {
        if (examples.includes(it)) return true;
        const k = keyOf(it);
        if (exampleKeys.has(k) || seenK.has(k)) return false;
        seenK.add(k);
        return true;
    });
    const warmPlaced = [];
    const vocab = extrasList.find((x) => x.lessonVocab);
    const stepsZone = extrasList.find((x) => x.lessonSteps);
    const labels = labelStyleOf(ctx.look, input.labels);
    const tabId = `Lesson ${lesson.number || 1}`;
    const probeFrame = frameOf({ skills: target, input, tabId, score: 1, footerLeft: lesson.tagLine });
    const m = bandMetrics(ctx, layoutHeader(probeFrame.header));
    const mCont = bandMetrics(ctx, layoutHeader(probeFrame.header), { cont: true });

    /* ---- Vocabulary + Remember */
    const groups = vocabBands({ vocab, data, m });

    /* ---- Warm-up: the prerequisite skills side by side */
    let { letter, warmCount } = warmUpBand({ input, m, labels, warmPlaced, groups });

    /* ---- Guided Practice ("we do") beside the Steps: the chart's names and icons */
    const weDo = weDoBand({ input, ctx, m, data, extrasList, stepsZone, mainU, example, example2, example3, example4, exSteps, groups });

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

    /* ---- Independent Practice: whole rows filling the last page (PT-OPN-7, H5) */
    const used = new Set([example, example2, example3, example4, ...weDo]);
    const indepPool = mainU.filter((it) => !used.has(it));
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
    // Lessons r1: a page with no Independent rows (they did not fit) shares its spare height more
    // widely - the vocabulary, the Warm-up and the Guided cells each up to about a third - so the
    // sheet never ends on a blank band above the footer.
    const noRows = indep.length === 0;
    for (const pg of pages) {
        const spare = pg.budget - pg.used;
        const grows = pg.grows.filter((g) => g.grid && (g.cap > 0 || (noRows && g.capIfEmpty > 0)));
        if (spare <= 2 || !grows.length) continue;
        for (const g of grows) {
            const cap = noRows && g.capIfEmpty !== undefined ? g.capIfEmpty : (g.cap !== undefined ? g.cap : 0.35);
            const add = Math.min(spare / grows.length, g.h * cap);
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
    let chartDrawn = [];
    if (states.length && part !== 'sheet') {
        const chart = chartPage(input, ctx, data, example, states.filter((s) => s.lessonState !== undefined), draws, second, extrasList.find((x) => x.lessonTail), finals, extrasList.find((x) => x.lessonTailPanel));
        zoom = chart.zoom;
        secondShown = chart.second;
        chartDrawn = chart.drawn;
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
            // The lesson rules' view of this sheet (sheet/lesson-rules.js): what the chart draws,
            // the declared cases it covers, and every item the sheet places.
            chartItems: chartDrawn.map(plainItem),
            chartCases: (data && Array.isArray(data.cases) ? data.cases : []).filter((c) => chartDrawn.some((it) => casesOf(plainItem(it)).includes(c))),
            usedItems: part === 'chart' ? [] : warmPlaced.concat(weDo, indep).map(plainItem),
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
