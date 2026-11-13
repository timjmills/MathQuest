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
import { EXAMPLE_KEYS, reflowsAt, stateGroups, kindOf, generalStep, namedSteps, stepMarker, phase0On } from '../lesson-pages/common.js';
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
    // (lesson 2 E24b / E31, lead's order 2026-11-08: a main ref with a `hardAvoid` - lesson 2 alone - gives its case pools the
    // WHOLE main ref, its avoid keys and hard bounds too, so a case example is never a fact the pack spent; absent: as before)
    const caseRef = (k) => (Array.isArray(main.hardAvoid) ? [Object.assign({}, main, data[k].ref)] : null);
    const extra = EXAMPLE_KEYS.filter((k) => data && data[k] && data[k].ref).map((k) => caseRef(k) ? { id: `x${k}`, skills: caseRef(k) } : ({
        id: `x${k}`, skills: [Object.assign({ categoryId: main.categoryId, skillId: main.skillId }, main.opts ? { opts: main.opts } : {}, main.minTop !== undefined ? { minTop: main.minTop } : {}, main.maxTop !== undefined ? { maxTop: main.maxTop } : {},
            // (a refreshed part avoids every other part's problems, its case pools too: LR-18)
            Array.isArray(main.avoidTexts) ? { avoidTexts: main.avoidTexts } : {}, data[k].ref)],
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
    // (lf-partopts: `lesson.partN.vocab` - the teacher's word count, 0 = no Vocabulary band; absent: the lesson's own)
    const vN = lesson.partN && Number.isFinite(lesson.partN.vocab) ? lesson.partN.vocab : null;
    // (at 0 the full match is still measured, flagged off: the Parts table probes the words back - roles/lesson.js sheetOffers)
    const v = vocabItem(data && data.vocab && vN !== null && vN > 0 ? data.vocab.slice(0, vN) : data && data.vocab, input.seed);
    if (v && vN === 0) v.lessonVocabOff = true;
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
    // (lf-partopts §8: the values each lesson-sheet part may take on THIS sheet - probed first, the plan drawn last, so a
    // probe leaves nothing behind on the items the plan draws)
    const part = (input.lesson && input.lesson.part) || 'all';
    const offer = !input._probe && part !== 'chart' ? sheetOffers(input) : null;
    const p = planMain(input);
    if (offer && p.meta) p.meta.partOffer = offer;
    return p;
}

function planMain(input) {
    const p1 = planOnce(input);
    if (!p1._warmSplit || input._warmShared) return p1;
    const p0 = planOnce(Object.assign({}, input, { _warmShared: true }));
    return (p1.pages || []).length > (p0.pages || []).length ? p0 : p1;
}

/* ============================================================ lf-partopts: what each sheet part may offer */

/** The lesson-sheet parts the teacher may change (design/partopts/DESIGN.md §3, §8b). */
const SHEET_PARTS = ['vocab', 'remember', 'wedo', 'rows'];
/** True when the teacher changed a part of the lesson SHEET (the chart, Practice and Mixed are other pages). */
export const sheetChanged = (partN) => !!partN && SHEET_PARTS.some((k) => partN[k] !== undefined);
/** The fewest share of a sheet page its blocks must use (EB-PAGE: 30 % empty fails; the last of 2+ pages: H5, half used). */
export const SHEET_FILL_MIN = 0.72;
export const SHEET_LAST_FILL_MIN = 0.55;
/** The most a changed sheet's We Do band may stand over its cells' content height (EB-BAND, div_facts at M and L). */
export const WEDO_STRETCH_MAX = 1.3;
const fillOk = (pl) => {
    // (a We Do band stretched far past its cells' content - by the Steps beside it - leaves a 30 % band in its cells, H13)
    if (pl && pl.meta && pl.meta.weDoStretch > WEDO_STRETCH_MAX) return false;
    const f = (pl && pl.meta && pl.meta.sheetFill) || [];
    return f.length > 0 && f.every((v, i) => v >= (f.length > 1 && i === f.length - 1 ? SHEET_LAST_FILL_MIN : SHEET_FILL_MIN));
};

/**
 * For the teacher's counts as they stand (`lesson.partN`), the values each sheet part may take with the others held: a value
 * is offered only where the sheet it plans fills its page (every page at least SHEET_FILL_MIN used, a last page of two or
 * more at least SHEET_LAST_FILL_MIN - no near-empty foot, no stub page), prints the count asked, and - for fewer, wider
 * We Do or lesson-row cells - keeps each cell's ink at least half its width (EB-SIDE). The part's own auto value (what it
 * prints when the teacher leaves it) is always offered. Returns {vocab, remember, wedo, rows} - each {dflt, values, canOff}.
 */
function sheetOffers(input) {
    const lesson = input.lesson || {};
    const base = Object.assign({}, lesson.partN || {});
    const run = (pn) => {
        const keep = Object.fromEntries(Object.entries(pn).filter(([, v]) => v !== undefined));
        return planMain(Object.assign({}, input, { _probe: true, lesson: Object.assign({}, lesson, { partN: Object.keys(keep).length ? keep : undefined }) }));
    };
    const without = (p) => { const o = Object.assign({}, base); delete o[p]; return o; };
    const out = {};
    const data = lesson.data || null;
    // Vocabulary: 0 (the band off) .. the lesson's words
    const W = data && Array.isArray(data.vocab) ? Math.min(3, data.vocab.length) : 0;
    if (W > 0) {
        const vals = [];
        for (let v = 0; v < W; v++) { const pl = run(Object.assign(without('vocab'), { vocab: v })); if (fillOk(pl)) vals.push(v); }
        vals.push(W);
        out.vocab = { dflt: W, values: vals.filter((v) => v > 0), canOff: vals.includes(0) };
    }
    // Remember: on / off
    if (data && data.concepts && data.concepts[0]) {
        const pl = run(Object.assign(without('remember'), { remember: false }));
        out.remember = { dflt: 1, values: [1], canOff: fillOk(pl) };
    }
    // We Do: 0 (the band off), 1 .. the cells that fit
    const a = run(without('wedo'));
    const K = (a.meta && a.meta.guided) || 0;
    if (K > 0) {
        const vals = [];
        for (let k = 0; k < K; k++) {
            const pl = run(Object.assign(without('wedo'), { wedo: k }));
            if (fillOk(pl) && pl.meta.guided === k && (k === 0 || pl.meta.weDoSideOk !== false)) vals.push(k);
        }
        vals.push(K);
        out.wedo = { dflt: K, values: vals.filter((v) => v > 0), canOff: vals.includes(0) };
    }
    // Lesson practice rows: 0 (none) .. the rows that fit
    const r = run(without('rows'));
    const per = (r.meta && r.meta.partFit && r.meta.partFit.perRow) || 1;
    const R = Math.round(((r.meta && r.meta.independent) || 0) / per);
    if (R > 0) {
        const vals = [];
        for (let k = 0; k < R; k++) { const pl = run(Object.assign(without('rows'), { rows: k })); if (fillOk(pl) && Math.round((pl.meta.independent || 0) / per) === k) vals.push(k); }
        vals.push(R);
        out.rows = { dflt: R, values: vals.filter((v) => v > 0), canOff: vals.includes(0), perRow: per };
    } else out.rows = { dflt: 0, values: [], canOff: true, perRow: per, none: true };
    return out;
}

/** The parts this role plans itself ('all' draws the chart and the sheet, as before). */
const OWN_PARTS = new Set(['all', 'chart', 'sheet']);
/** How far a band may grow (a share of its height) on a sheet whose parts the teacher changed (lf-partopts §8b): not at all -
 * the cells' own measured room is their room; the page fills with whole rows or the value is not offered. */
export const SHEET_GROW_CAP = 0.1;

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
    // (lf-partopts: Vocabulary 0 - the match is measured but not drawn; a count under the measured one draws on its height)
    const vN0 = lesson.partN && Number.isFinite(lesson.partN.vocab) ? lesson.partN.vocab : null;
    const vocab = vN0 === 0 ? null : extrasList.find((x) => x.lessonVocab);
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
    const VOCAB_PAD_MM = 6, VOCAB_ZOOM_MIN = 0.75;
    pages.push(cur);
    for (const g of groups) {
        if (cur.used && cur.used + g.h > cur.budget) { cur = { sections: [], used: 0, budget: mCont.budget, grows: [] }; pages.push(cur); }
        cur.sections.push(...g.sections);
        cur.used += g.h;
        if (g.grow) cur.grows.push(g.grow);
    }

    /* ---- Independent Practice: whole rows filling the last page (PT-OPN-7, H5; lesson-pages/practice.js) */
    if (vocab) vocab.zoom = 0;   // (a plan starts at full size: N1 below)
    let indep = independentBand({ input, ctx, m, data, main, example, example2, example3, example4, weDo, extrasList, cur, labels, letter });
    // (critic r2 N1: a lesson sheet never drops its Independent Practice row - the Score and the pupil's own work - for a
    // few millimetres: the Vocabulary match on that page is drawn smaller, down to VOCAB_ZOOM_MIN, to make room for one
    // row; only when that is not enough does the row go. A sheet whose row fits is unchanged. LR-17b: only on a lesson
    // record with `vocabZoom` whose Prerequisite Check is live - phase0On; every other packet prints as master did.)
    const vocabG = vocab && phase0On(data, 'vocabZoom') ? groups.find((g) => g.sections[0] && g.sections[0].label === 'Vocabulary:' && cur.sections.includes(g.sections[0])) : null;
    if (!indep.length && cur.indepShort > 0 && vocabG && vocabG.grow) {
        const content = Math.max(1, vocabG.grow.h - VOCAB_PAD_MM);
        const z = Math.floor((1 - (cur.indepShort + 1) / content) * 20) / 20;
        if (z >= VOCAB_ZOOM_MIN) {
            const save = vocabG.grow.h - (content * z + VOCAB_PAD_MM);
            const vg = vocabG.grow.grid[0];
            vg.height = `${Math.round((vocabG.grow.h - save) * 100) / 100}mm`;
            vocab.zoom = z;
            vocabG.grow.h -= save;
            cur.used -= save;
            indep = independentBand({ input, ctx, m, data, main, example, example2, example3, example4, weDo, extrasList, cur, labels, letter });
        }
    }

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
            const cap00 = wide && g.capIfEmpty !== undefined ? g.capIfEmpty : (g.cap !== undefined ? g.cap : 0.35);
            // (lf-partopts §8b: with the teacher's counts the height a band gave up goes first to more Independent rows
            // (practice.js), not to taller bands (SHEET_GROW_CAP 0: a band grown a tenth passed a 30 % empty band in div_facts' cells, H13);
            // a value whose sheet still cannot fill its page is not offered, sheetOffers. Absent: as before.)
            const cap0 = sheetChanged(lesson.partN) ? Math.min(cap00, SHEET_GROW_CAP) : cap00;
            const cap = data && data.growAll ? Math.max(cap0, 0.5) : cap0;
            const share = data && data.growAll ? left / (grows.length - gi) : spare / grows.length + carry;
            const add0 = Math.min(share, g.h * cap);
            const add = g.maxAdd !== undefined ? Math.min(add0, g.maxAdd) : add0;
            carry = data && data.growAll ? 0 : add0 - add;
            left -= add;
            pg.grown = (pg.grown || 0) + add;
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
    let chartDesigned = 0, chartMin = 0;
    if (states.length && part !== 'sheet') {
        const chartOf = (sec, fin) => chartPage(input, ctx, data, example, states.filter((s) => s.lessonState !== undefined), draws, sec, extrasList.find((x) => x.lessonTail), fin, extrasList.find((x) => x.lessonTailPanel));
        // (lf-partopts: `lesson.partN.chart` - n worked examples, 1 .. the chart's own design; the design is the chart laid
        // out uncapped, so the Parts table's range never moves with the teacher's choice)
        const cN = lesson.partN && Number.isFinite(lesson.partN.chart) ? Math.max(1, lesson.partN.chart) : null;
        let chart = chartOf(second, finals);
        chartDesigned = 1 + (chart.second || 0);
        // (a count is offered only where the chart laid out with that many examples keeps its planned size - sizing.ok: the
        // fewer examples of a grid chart can leave its panels taller than the page holds, lesson 7 D1)
        const capped = (k) => chartOf(k >= 2 && chart.mode === 'row' ? second : [], k >= 2 ? finals.slice(0, k - 1) : []);
        chartMin = chartDesigned;
        for (let k = 1; k < chartDesigned; k++) { const c = capped(k); if (c.sizing && c.sizing.ok && 1 + (c.second || 0) === k) { chartMin = k; break; } }
        if (cN !== null && cN < chartDesigned) { const c = capped(Math.max(cN, chartMin)); if (c.sizing && c.sizing.ok) chart = c; }
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
            // (lf-partopts: each part's own fit before the teacher's counts - print-sheet.js reports it as res.lesson.partFit)
            // (lf-partopts: each sheet page's used share after the bands grew - sheetOffers reads it; We Do's ink check)
            sheetFill: part === 'chart' ? [] : pages.map((pg) => +((pg.used + (pg.grown || 0)) / pg.budget).toFixed(3)), weDoSideOk: env.weDoSideOk, weDoStretch: env.weDoStretch,
            partFit: { chart: chartDesigned, chartMin, wedo: env.weDoFit !== undefined ? env.weDoFit : weDo.length, wedoMin: env.weDoMin, rows: cur.indepFit ? cur.indepFit.rows : 0, perRow: cur.indepFit ? cur.indepFit.ic : 0, remember: lesson.partN && lesson.partN.remember === false ? !!(data && data.concepts && data.concepts[0]) : groups.some((g) => g.sections[0] && (g.sections[0].label === 'Remember:' || g.sections[0].label === 'Rule:')) },
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
