// js/modules/lessons/prereqs.js
// BACK-COMPAT VIEW of the lesson library (design/LESSON_LIBRARY_PLAN.md §2): the lesson data keyed
// by SKILL ('category:skill'), as the first sample lessons were. The data itself now lives in the
// library - a ROUTINE (the teaching) and a LESSON (routine + practice skill + Warm-up + Mixed
// partners + Prerequisite Check) in lessons/families/*.js, merged by lessons/library.js; read
// lessons/schema.js for the shapes and design/LESSON_RULES.md (its NEW LESSON CHECKLIST) before
// adding one. lessonFor() returns, for every skill, exactly the record this file held before the
// move (2026-10-30; lead decision D3: every packet byte-identical) - the library's own fields
// (archetype, cases, caps) and the Prerequisite Check (`prereqs`, read by lesson id through
// library.js lessonData) are not in it.
//
// For each lesson skill the record names what the Warm-up reviews - the prerequisite SKILLS
// (drawn from their own generators through generateQuestionFor), the CONCEPTS and the
// VOCABULARY - and how the lesson's steps are made memorable (numbered steps, one icon per
// action, and a chant only where one genuinely helps).
//
// THE SHAPE, and how it grows into the vertical-alignment map the vision asks for:
//
//   'category:skill' -> {
//     skills:   [{key: 'category:skill', opts?, why}]   prerequisite skills, nearest first
//                                                      (the "prerequisite of" edges of the map)
//     concepts: [{id, text}]                           the ideas the skill leans on (concept nodes)
//     vocab:    [{word, meaning, picture}]              <= 3 words (P-LG-6), each with a line-art
//                                                      picture the lesson draws (lesson.js VOCAB_PICTURES)
//     steps:    [{icon, text}]                          the lesson's general steps: 2-5 words each where
//                                                      that is enough (P-5: 10 at most). Their count
//                                                      equals the skill's worked steps for the
//                                                      example, so step n of the list IS state n of
//                                                      the worked example (one icon per action)
//     chant:    '...' | ''                              a short rule to say together, or none
//     format:   {kind, why}                             the memorable-step format chosen, and why
//     example:  {match}                                 the worked example: a /regex/ its provider
//                                                      steps must contain (the strategy taught)
//     mixWith:  [{key, opts?}]                          Mixed practice partners (earlier skills)
//   }
//
// Later, the full map adds `leadsTo` / `buildsOn` edges between skills and concept nodes; this
// file keeps the same keys so a lesson reads the map instead of a hand list without changing.
//
// Pure (no DOM, no state). Every skill key must be a live skill (ws-lesson-coverage checks); every
// standard a lesson prints comes from js/modules/standards.js (standardsFor), never from this file.

import { LESSONS as LIBRARY_LESSONS, engineRecord, lessonData, lessonIdOf } from './library.js';

/** The action icons a step may use (drawn by sheet/lesson-icons.js). */
export const STEP_ICONS = Object.freeze(['look', 'start', 'count', 'write', 'regroup', 'subtract', 'subOnes', 'subTens', 'ends', 'decide', 'check', 'say']);

/**
 * The lesson data by practice skill: each skill's default lesson (library defaultLessonForSkill: the
 * one marked `defaultFor`, else the first), as the engine record (library.js engineRecord).
 */
export const LESSONS = (() => {
    const out = {};
    const ids = Object.keys(LIBRARY_LESSONS);
    for (const id of ids.filter((i) => LIBRARY_LESSONS[i].defaultFor).concat(ids)) {
        const key = LIBRARY_LESSONS[id].practice && LIBRARY_LESSONS[id].practice.skill;
        if (key && !out[key]) out[key] = engineRecord(id);
    }
    return Object.freeze(out);
})();

/** The lesson data of a skill, or null (a skill with no authored lesson yet). */
export function lessonFor(categoryId, skillId) {
    return LESSONS[`${categoryId}:${skillId}`] || null;
}

/** The lesson data of a lesson id or slug (library.js lessonData: with its `prereqs`), or null. */
export function lessonDataById(idOrSlug) {
    return lessonIdOf(idOrSlug) ? lessonData(idOrSlug) : null;
}

/** `{categoryId, skillId, opts?}` of a 'category:skill' key. */
export function skillRef(entry) {
    const [categoryId, skillId] = String(entry.key || '').split(':');
    const ref = entry.opts ? { categoryId, skillId, opts: Object.assign({}, entry.opts) } : { categoryId, skillId };
    // `minOperand` (lessons r2): the packet's floor on every operand (2-digit addition only).
    if (entry.minOperand !== undefined) ref.minOperand = entry.minOperand;
    return ref;
}

export default { LESSONS, STEP_ICONS, lessonFor, lessonDataById, skillRef };
