// js/modules/sheet/lesson-pages/index.js
// THE LESSON PAGE BUILDERS and their REGISTRY (design/LESSON_LIBRARY_PLAN.md §8c, owner ruling 2026-09-26: "merge these
// types"): one design per page job, used by the lesson packet and by any skill's Practice / Quiz paper. The archetype of
// the skill decides only how its worked example is drawn (sheet/lesson-arch/*); these builders are the same for every
// archetype.
//
//   chart.js      the anchor chart (was: Worked example / scripted Model)
//   vocab.js      the Vocabulary match and the Remember strip
//   warm-up.js    the lesson sheet's Warm-up band (the Prerequisite Check PAGE is roles/pre-skill-check.js, lead D1)
//   we-do.js      the We Do band (was: Guided)
//   practice.js   the lesson sheet's Independent rows, the step strip, the practice page's request (was: Independent)
//   mixed.js      the mixed page's request (was: Review / Mixed practice)
//   common.js     the shared pieces
//
// THE REGISTRY (lessons-phase0 lead decision D2). A lesson packet is a list of PARTS, looked up here by id, in `order`:
//   prereq (5, a lesson with `prereqs` only) · chart (10) · sheet (20) · practice (30) · mixed (40)
// and the lesson SHEET is a list of BANDS, in `order`:
//   vocab (10: Vocabulary + Remember) · warm-up (20) · guided (30)   (then the Independent rows fill the last page)
// A new page job - the planned vocabulary pages - plugs in by registering a part (`registerLessonPart`) or a sheet band
// (`registerSheetBand`) in this file: roles/lesson.js asks the registry for the bands it lays out and for the builder
// of any part that is not its own chart or sheet, and print-sheet.js buildLesson builds every registered part. Nothing
// else changes, so the existing parts render byte-identical.
//
// What a skill supplies to the builders: design/SKILL_CELL_CONTRACT.md §3.9. Pure modules (SCC-01).

import * as chart from './chart.js';
import * as vocab from './vocab.js';
import * as warmUp from './warm-up.js';
import * as weDo from './we-do.js';
import * as practice from './practice.js';
import * as mixed from './mixed.js';
import * as common from './common.js';
import { PREREQ_CHECK_TITLE } from '../roles/pre-skill-check.js';

export { chart, vocab, warmUp, weDo, practice, mixed, common };

/* ============================================================================ the parts */

const PARTS = new Map();

/**
 * Register a lesson PART (a sheet of the packet).
 *   id      'chart' | 'sheet' | 'practice' | 'mixed' | a new id ('vocab-cards', ...)
 *   order   its place in the packet (the built-ins: 10, 20, 30, 40)
 *   role    the page role that draws it: 'lesson' (roles/lesson.js: its plan calls `plan` below for a new id),
 *           'independent', 'mixed-practice'
 *   name    the teacher-facing name ('Anchor chart', 'Lesson', 'Practice', 'Mixed')
 *   sheet   its `data-ws-sheet` id (a page is only compared with the pages of its own sheet)
 *   offset  its seed offset from the packet seed (print-sheet.js lessonPartSeed: refresh 0 is packet seed + offset)
 *   size    'L' when the part is drawn at L at every packet size (the anchor chart, a wall chart)
 *   inPacket(n)   true when the default packet (no `parts` asked) prints it; absent: always
 *   plan(input, ctx)   for a NEW part drawn by the lesson role: its PagePlan pages ({header, sections}[], compose.js);
 *                      the built-in chart and sheet are planned by roles/lesson.js itself
 *   build(api)         THE PART'S OWN BUILD HOOK (critic lessons-phase0 r1 D18): how the host builds it - an async
 *                      function of the host api {part, seed, avoid, n, header, lessonInput, buildRoleSheet,
 *                      lessonRolePart} returning the part's sheet result ({pupilHtml, keyHtml, pageCount, ...}). A part
 *                      without one and with role 'lesson' is built by the lesson role (its `plan`). The five core parts
 *                      (`core: true`) are built by the host's own packet code; every other part - the vocabulary lane's
 *                      pages - registers here and needs no edit of roles/lesson.js or print-sheet.js buildLesson.
 */
export function registerLessonPart(def) {
    if (!def || !def.id) throw new Error('registerLessonPart: an id is required');
    PARTS.set(String(def.id), Object.freeze(Object.assign({ order: 100, role: 'lesson', name: String(def.id), sheet: `lesson-${def.id}`, offset: 0 }, def)));
    return PARTS.get(String(def.id));
}

/** A registered part by id, or null. */
export const lessonPart = (id) => PARTS.get(String(id)) || null;

/** Every registered part, in packet order. */
export const lessonParts = () => [...PARTS.values()].sort((a, b) => a.order - b.order);

/** The registered part ids, in packet order (print-sheet.js LESSON_PARTS). */
export const lessonPartIds = () => lessonParts().map((p) => p.id);

// LR-17 (plan §8b, lead D1): a lesson whose record declares `prereqs` opens with its Prerequisite Check, drawn by
// roles/pre-skill-check.js (one question per prerequisite, each with its route; the routing table on the key).
registerLessonPart({ core: true, id: 'prereq', order: 5, role: 'pre-skill-check', name: PREREQ_CHECK_TITLE, sheet: 'lesson-prereq', offset: 31357, inPacket: (n) => !!n.prereqCheck });
registerLessonPart({ core: true, id: 'chart', order: 10, role: 'lesson', name: 'Anchor chart', sheet: 'lesson-chart', offset: 0, size: 'L' });
registerLessonPart({ core: true, id: 'sheet', order: 20, role: 'lesson', name: 'Lesson', sheet: 'lesson-sheet', offset: 0 });
registerLessonPart({ core: true, id: 'practice', order: 30, role: 'independent', name: 'Practice', sheet: 'lesson-practice', offset: 7919, inPacket: (n) => n.practicePages > 0 });
registerLessonPart({ core: true, id: 'mixed', order: 40, role: 'mixed-practice', name: 'Mixed', sheet: 'lesson-mixed', offset: 15838, inPacket: (n) => !!n.mixed });

/**
 * Build the PLUGGED parts of a packet (every registered part that is not core), in packet order (critic r1 D18): a part's
 * own `build(api)` hook, else - role 'lesson' - the lesson role through `api.lessonRolePart(id, seed)`. `api.seedOf(id)`
 * gives a part's seed; `api.avoid` (optional) its refresh avoidance. Returns [{part, role, res}]. Pure dispatch: the host
 * supplies every effect.
 */
export async function buildPluggedParts(ids, api) {
    const out = [];
    for (const x of ids) {
        const d = lessonPart(x);
        if (!d || d.core) continue;
        const seed = api.seedOf(x);
        if (typeof d.build === 'function') out.push({ part: x, role: d.role, res: await d.build(Object.assign({}, api, { part: d, seed })) });
        else if (d.role === 'lesson') out.push({ part: x, role: 'lesson', res: await api.lessonRolePart(x, seed) });
    }
    return out;
}

/** Unregister a part (tests only: a dummy part must not leak into later packets). */
export function unregisterLessonPart(id) { const d = PARTS.get(String(id)); if (d && !d.core) PARTS.delete(String(id)); return !!d; }

/* ======================================================================= the sheet bands */

const BANDS = [];

/**
 * Register a band of the lesson SHEET. `build(env)` pushes its band(s) onto `env.groups` (common.js `band`: {h,
 * sections, grow}); `env` carries the plan's state - input, ctx, m (band metrics), data, labels, main, example ...
 * example4, exSteps, extrasList, vocab, stepsZone, groups, letter, warmCount, weDo, warm - and a band may advance
 * `letter` / `warmCount` (lettered, scored items) or set `weDo`. The bands are laid out in `order`, packed onto pages
 * (PG-21: never split); the Independent rows then fill the last page.
 */
export function registerSheetBand(def) {
    if (!def || !def.id || typeof def.build !== 'function') throw new Error('registerSheetBand: an id and a build function are required');
    const at = BANDS.findIndex((b) => b.id === def.id);
    if (at >= 0) BANDS.splice(at, 1);
    BANDS.push(Object.freeze(Object.assign({ order: 100 }, def)));
    BANDS.sort((a, b) => a.order - b.order);
}

/** The sheet's bands, in order. */
export const sheetBands = () => BANDS.slice();

registerSheetBand({ id: 'vocab', order: 10, build: (env) => { env.groups.push(...vocab.vocabBands(env)); } });
registerSheetBand({ id: 'warm-up', order: 20, build: (env) => warmUp.warmUpBand(env) });
registerSheetBand({ id: 'guided', order: 30, build: (env) => weDo.weDoBand(env) });

export default { chart, vocab, warmUp, weDo, practice, mixed, common, registerLessonPart, lessonPart, lessonParts, lessonPartIds, registerSheetBand, sheetBands, buildPluggedParts, unregisterLessonPart };
