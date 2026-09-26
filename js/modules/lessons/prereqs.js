// js/modules/lessons/prereqs.js
// BACK-COMPAT VIEW of the lesson library (design/LESSON_LIBRARY_PLAN.md §2): the lesson data keyed
// by SKILL ('category:skill'), as the first sample lessons were. The data itself now lives in the
// library - a ROUTINE (the teaching) and a LESSON (routine + practice skill + Warm-up + Mixed
// partners) in lessons/families/*.js, merged by lessons/library.js; read lessons/schema.js for the
// shapes and design/LESSON_RULES.md (its NEW LESSON CHECKLIST) before adding one.
//
//   lessonFor(categoryId, skillId)   the record the engine reads for a skill-keyed request: the
//                                    skill's default lesson (library defaultLessonForSkill) as
//                                    lessonData - the routine's fields plus `skills` (Warm-up) and
//                                    `mixWith`
//   skillRef(entry)                  {categoryId, skillId, opts?, ...floors} of a {key, ...} entry
//   STEP_ICONS                       the action icons a step may use (sheet/lesson-icons.js)
//
// Pure data (no DOM, no state). Every standard a lesson prints comes from js/modules/standards.js.

import { LESSONS as LIBRARY_LESSONS, lessonData, lessonIdOf } from './library.js';

/** The action icons a step may use (drawn by sheet/lesson-icons.js). */
export const STEP_ICONS = Object.freeze(['look', 'start', 'count', 'write', 'regroup', 'subtract', 'subOnes', 'subTens', 'ends', 'decide', 'check', 'say']);

/** The lesson data by practice skill: each skill's default lesson (the one marked `defaultFor`). */
export const LESSONS = (() => {
    const out = {};
    const ids = Object.keys(LIBRARY_LESSONS);
    for (const id of ids.filter((i) => LIBRARY_LESSONS[i].defaultFor).concat(ids)) {
        const key = LIBRARY_LESSONS[id].practice && LIBRARY_LESSONS[id].practice.skill;
        if (key && !out[key]) out[key] = Object.freeze(lessonData(id));
    }
    return Object.freeze(out);
})();

/** The lesson data of a skill, or null (a skill with no lesson yet). */
export function lessonFor(categoryId, skillId) {
    return LESSONS[`${categoryId}:${skillId}`] || null;
}

/** The lesson data of a lesson id or slug, or null. */
export function lessonDataById(idOrSlug) {
    return lessonIdOf(idOrSlug) ? lessonData(idOrSlug) : null;
}

/** `{categoryId, skillId, opts?}` of a 'category:skill' key. */
export function skillRef(entry) {
    const [categoryId, skillId] = String(entry.key || '').split(':');
    const ref = entry.opts ? { categoryId, skillId, opts: Object.assign({}, entry.opts) } : { categoryId, skillId };
    // The packet's floors on a partner (lessons r2-r4: minOperand, maxAnswer, ansDigits ...):
    // every other field travels on the ref (print-sheet.js refAccepts reads them).
    for (const [k, v] of Object.entries(entry)) if (!['key', 'opts', 'why'].includes(k)) ref[k] = v;
    return ref;
}

export default { LESSONS, STEP_ICONS, lessonFor, lessonDataById, skillRef };
