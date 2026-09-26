// js/modules/lessons/library.js
// THE LESSON LIBRARY (design/LESSON_LIBRARY_PLAN.md): every routine and lesson of every family,
// one lookup for the engine (print-sheet.js buildLesson), the print screen and the gates.
//
//   lessonById(id)                   a lesson by id ('Y2.B2.S18') or by its older slug
//   lessonData(id)                   the record the lesson engine reads: its routine's teaching
//                                    plus the lesson's Warm-up (`skills`) and Mixed partners
//   practiceRef(id)                  {categoryId, skillId, opts} of the skill that practises it
//   lessonsForSkill(cat, skill)      every lesson practised by a skill
//   defaultLessonForSkill(cat, skill) the lesson a skill-keyed request prints (the Print dialog's
//                                    "Lesson" role for a skill; prereqs.js lessonFor)
//   allNeeds()                       every family's NEEDS
//   validateLibrary(known)           every structural problem ([] when the library is sound)
//
// Families own their files (families/*.js); this module only merges them. Pure (no DOM, no state).

import * as early from './families/early.js';
import * as placevalue from './families/placevalue.js';
import * as addsub from './families/addsub.js';
import * as multdiv from './families/multdiv.js';
import * as fractions from './families/fractions.js';
import * as measure from './families/measure.js';
import * as timemoney from './families/timemoney.js';
import * as geometry from './families/geometry.js';
import * as data from './families/data.js';
import * as algebra from './families/algebra.js';
import { FAMILY_IDS, validateRoutine, validateLesson, validateNeed } from './schema.js';

export const FAMILIES = Object.freeze({ early, placevalue, addsub, multdiv, fractions, measure, timemoney, geometry, data, algebra });

const merged = (field) => {
    const out = {};
    const where = {};
    const dup = [];
    for (const f of FAMILY_IDS) {
        for (const [id, v] of Object.entries((FAMILIES[f] && FAMILIES[f][field]) || {})) {
            if (out[id]) dup.push(`${field} ${id} in ${where[id]} and ${f}`);
            else { out[id] = v; where[id] = f; }
        }
    }
    return { all: Object.freeze(out), where: Object.freeze(where), dup };
};
const R = merged('ROUTINES');
const L = merged('LESSONS');

/** Every routine and every lesson of the library, by id. */
export const ROUTINES = R.all;
export const LESSONS = L.all;
/** The family each lesson / routine lives in. */
export const FAMILY_OF = Object.freeze({ lessons: L.where, routines: R.where });

const BY_SLUG = new Map(Object.entries(LESSONS).filter(([, l]) => l.slug).map(([id, l]) => [l.slug, id]));

/** The canonical id of a lesson id or slug, or null. */
export function lessonIdOf(idOrSlug) {
    const s = String(idOrSlug || '');
    if (LESSONS[s]) return s;
    return BY_SLUG.get(s) || null;
}

/** A lesson by id or slug (with its `id`), or null. */
export function lessonById(idOrSlug) {
    const id = lessonIdOf(idOrSlug);
    return id ? Object.assign({ id }, LESSONS[id]) : null;
}

/** The routine a lesson uses, or null. */
export function routineOf(lesson) {
    const l = typeof lesson === 'string' ? lessonById(lesson) : lesson;
    return l && ROUTINES[l.routine] ? ROUTINES[l.routine] : null;
}

/**
 * The record the lesson engine reads (the shape of the first sample lessons, prereqs.js): the
 * routine's teaching, the lesson's Warm-up skills as `skills` and its Mixed partners as `mixWith`.
 */
export function lessonData(idOrSlug) {
    const l = lessonById(idOrSlug);
    const r = l && routineOf(l);
    if (!l || !r) return null;
    const out = Object.assign({}, r, { skills: (l.warmup || []).slice(), mixWith: (l.mixWith || []).slice() });
    delete out.archetype;
    return out;
}

/** `{categoryId, skillId, opts?}` of the skill a lesson is practised with (a fresh object). */
export function practiceRef(idOrSlug) {
    const l = lessonById(idOrSlug);
    if (!l || !l.practice) return null;
    const [categoryId, skillId] = String(l.practice.skill).split(':');
    return l.practice.opts ? { categoryId, skillId, opts: JSON.parse(JSON.stringify(l.practice.opts)) } : { categoryId, skillId };
}

/** Every lesson (with its id) whose practice skill is category:skill. */
export function lessonsForSkill(categoryId, skillId) {
    const key = `${categoryId}:${skillId}`;
    return Object.keys(LESSONS).filter((id) => LESSONS[id].practice && LESSONS[id].practice.skill === key).map(lessonById);
}

/**
 * The lesson a skill-keyed request prints: the one marked `defaultFor` the skill, else the first
 * lesson practised by it. null when the skill has no lesson yet.
 */
export function defaultLessonForSkill(categoryId, skillId) {
    const all = lessonsForSkill(categoryId, skillId);
    return all.find((l) => l.defaultFor) || all[0] || null;
}

/** Every family's needs, each with its family. */
export function allNeeds() {
    return FAMILY_IDS.flatMap((f) => ((FAMILIES[f] && FAMILIES[f].NEEDS) || []).map((n) => Object.assign({ family: f }, n)));
}

/**
 * Every structural problem of the library: duplicate ids across families, malformed routines,
 * lessons and needs, unknown routines, a slug that shadows an id or another slug, a need of an
 * unknown lesson.
 * @param {{skillExists?: (key: string) => boolean, stepIcons?: string[], caseNames?: string[]}} [known]
 */
export function validateLibrary(known = {}) {
    const bad = [...R.dup, ...L.dup];
    for (const [id, r] of Object.entries(ROUTINES)) bad.push(...validateRoutine(id, r, known));
    for (const [id, l] of Object.entries(LESSONS)) bad.push(...validateLesson(id, l, Object.assign({ routines: ROUTINES }, known)));
    const slugs = new Set();
    for (const [id, l] of Object.entries(LESSONS)) {
        if (!l.slug) continue;
        if (LESSONS[l.slug] || slugs.has(l.slug)) bad.push(`lesson ${id}: slug "${l.slug}" is already an id or a slug`);
        slugs.add(l.slug);
    }
    for (const n of allNeeds()) {
        bad.push(...validateNeed(n));
        if (n.lesson && !LESSONS[n.lesson]) bad.push(`need "${n.name}": unknown lesson ${n.lesson}`);
    }
    return bad;
}

export default {
    FAMILIES, ROUTINES, LESSONS, FAMILY_OF, lessonIdOf, lessonById, routineOf, lessonData, practiceRef,
    lessonsForSkill, defaultLessonForSkill, allNeeds, validateLibrary,
};
