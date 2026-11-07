// js/modules/lessons/library.js
// THE LESSON LIBRARY (design/LESSON_LIBRARY_PLAN.md): every routine and lesson of every family,
// one lookup for the engine (print-sheet.js buildLesson), the print screen and the gates.
//
//   lessonIdOf(idOrSlug)             the canonical id of a lesson id or slug, or null
//   lessonById(id)                   a lesson by id ('Y2.B2.S18') or by its older slug, with its `id`
//   routineOf(lesson)                the routine a lesson uses (as authored), or null
//   lessonData(id)                   the record the lesson engine reads: EXACTLY what
//                                    prereqs.js lessonFor(cat, skill) returns for that lesson's
//                                    practice skill (the routine's teaching, the lesson's `teach`,
//                                    its Warm-up as `skills`, its Mixed partners as `mixWith`), plus
//                                    `prereqs` when the lesson has a Prerequisite Check (LR-17):
//                                    [{lesson, title, why, ref: {categoryId, skillId, opts?, ...floors}}]
//                                    - one question each, drawn by sheet/roles/pre-skill-check.js
//   lessonRules(id)                  the library's own fields the gates read: {archetype, cases,
//                                    casesPending, caps} (never handed to the engine)
//   practiceRef(id)                  {categoryId, skillId, opts?} of the skill that practises it
//   lessonsForSkill(cat, skill)      every lesson practised by a skill
//   defaultLessonForSkill(cat, skill) the lesson a skill-keyed request prints (prereqs.js lessonFor)
//   prerequisiteSkillsFor(cat, skill) every prerequisite skill of a skill, most basic first: its
//                                    lesson's Prerequisite Check, else its Warm-up, else the seed's
//                                    fallback (prereq-db.js: the curated WRM `pre` lists first)
//   prereqRoute(id, missed)          the routing rule of a Prerequisite Check (plan §8b)
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
import { FAMILY_IDS, LIBRARY_ONLY, validateRoutine, validateLesson, validateNeed } from './schema.js';
import { prereqFallback } from './prereq-db.js';

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
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/** The canonical id of a lesson id or slug, or null. */
export function lessonIdOf(idOrSlug) {
    const s = String(idOrSlug || '');
    if (Object.prototype.hasOwnProperty.call(LESSONS, s)) return s;
    return BY_SLUG.get(s) || null;
}

/** A lesson by id or slug (with its `id`), or null. */
export function lessonById(idOrSlug) {
    const id = lessonIdOf(idOrSlug);
    return id ? Object.assign({ id }, LESSONS[id]) : null;
}

/** The routine a lesson uses (as authored, without the lesson's `teach`), or null. */
export function routineOf(lesson) {
    const l = typeof lesson === 'string' ? lessonById(lesson) : lesson;
    return l && ROUTINES[l.routine] ? ROUTINES[l.routine] : null;
}

/** The teaching a lesson uses: its routine with the lesson's own `teach` fields over it. */
function teachingOf(l) {
    const r = routineOf(l);
    return r ? Object.assign({}, r, l.teach || {}) : null;
}

/** `{categoryId, skillId, opts?, ...floors}` of a `{key, opts?, why?, ...floors}` entry (a fresh object). */
function refOf(entry) {
    const [categoryId, skillId] = String(entry.key || '').split(':');
    const ref = { categoryId, skillId };
    if (entry.opts) ref.opts = clone(entry.opts);
    for (const [k, v] of Object.entries(entry)) if (!['key', 'opts', 'why', 'lesson', 'title', 'items'].includes(k)) ref[k] = clone(v);
    return ref;
}

/**
 * THE ENGINE RECORD of a lesson, without the Prerequisite Check: the routine's teaching (library-only
 * fields dropped), `skills` (the Warm-up), the lesson's `teach` fields, `mixWith`. Shared by
 * lessonData and prereqs.js lessonFor, so both read the same record.
 */
export function engineRecord(idOrSlug) {
    const l = lessonById(idOrSlug);
    const r = l && routineOf(l);
    if (!l || !r) return null;
    const out = Object.assign({}, r, { skills: (l.warmup || []).slice() }, l.teach || {}, { mixWith: (l.mixWith || []).slice() });
    for (const k of LIBRARY_ONLY) delete out[k];
    return out;
}

/**
 * The record the lesson engine reads (the shape of the first sample lessons, prereqs.js) plus, when
 * the lesson has a Prerequisite Check (LR-17), `prereqs`: one question per prerequisite lesson, most
 * basic first - [{lesson, title, why, ref: {categoryId, skillId, opts?, ...floors}}] (fresh objects;
 * the shape lines up with a detailed lesson's `prerequisites[i]` {lesson: {id, title}, ref}).
 */
export function lessonData(idOrSlug) {
    const out = engineRecord(idOrSlug);
    if (!out) return null;
    const l = lessonById(idOrSlug);
    if (Array.isArray(l.prereqs) && l.prereqs.length) {
        out.prereqs = l.prereqs.map((p) => Object.assign({ lesson: p.lesson, title: p.title || '', why: p.why || '', ref: refOf(p) }, p.items ? { items: p.items } : {}));
    }
    return out;
}

/** The library's own fields of a lesson's teaching (the gates read them; the engine never does). */
export function lessonRules(idOrSlug) {
    const l = lessonById(idOrSlug);
    const t = l && teachingOf(l);
    if (!t) return null;
    return { archetype: t.archetype, cases: t.cases ? t.cases.slice() : null, casesPending: t.casesPending || '', caps: t.caps ? Object.assign({}, t.caps) : {} };
}

/** `{categoryId, skillId, opts?}` of the skill a lesson is practised with (a fresh object). */
export function practiceRef(idOrSlug) {
    const l = lessonById(idOrSlug);
    if (!l || !l.practice) return null;
    const [categoryId, skillId] = String(l.practice.skill).split(':');
    return l.practice.opts ? { categoryId, skillId, opts: clone(l.practice.opts) } : { categoryId, skillId };
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

/** The words a derived fallback reason prints ("ccss 1.NBT.2" -> "CCSS 1.NBT.2, the grade before"). */
function fallbackWhy(why) {
    const [kind, code] = String(why || '').split(' ');
    if (kind === 'ccss') return `CCSS ${code}, the grade before`;
    if (kind === 'wrm') return `WRM ${code}, a step before`;
    return String(why || '');
}

/**
 * EVERY prerequisite skill of a skill, most basic first (owner ruling 2026-09-26, plan §8e: the
 * Practice paper's "Mix in prerequisite skills" lists them all, none ticked by default):
 * [{categoryId, skillId, opts?, why, lesson?, title?}].
 *   - A skill WITH a lesson: its lesson's Prerequisite Check (each with the lesson it routes to),
 *     else its Warm-up skills, in the lesson's order.
 *   - A skill with no lesson: the seed's default (prereq-db.js, ws-lesson-seed.cjs) - the curated
 *     `pre` list of its first WRM step (data/curriculum/links), else the skills of the CCSS standards
 *     a grade before its primary code and of the two WRM small steps before its first step.
 * Fresh objects; [] when the skill has none.
 */
export function prerequisiteSkillsFor(categoryId, skillId) {
    const lesson = defaultLessonForSkill(categoryId, skillId);
    const own = lesson ? (lesson.prereqs && lesson.prereqs.length ? lesson.prereqs : lesson.warmup) : null;
    const self = `${categoryId}:${skillId}`;
    const list = own && own.length
        ? own.map((p) => ({ key: p.key, opts: p.opts, why: p.why || '', lesson: p.lesson, title: p.title }))
        : prereqFallback(self).map((p) => ({ key: p.key, opts: p.opts, why: fallbackWhy(p.why) }));
    const seen = new Set();
    const out = [];
    for (const p of list) {
        const id = `${p.key}|${JSON.stringify(p.opts || null)}`;
        if (!p.key || p.key === self || seen.has(id)) continue;
        seen.add(id);
        const [c, s] = String(p.key).split(':');
        const ref = { categoryId: c, skillId: s };
        if (p.opts) ref.opts = clone(p.opts);
        ref.why = p.why;
        if (p.lesson) ref.lesson = p.lesson;
        if (p.title) ref.title = p.title;
        out.push(ref);
    }
    return out;
}

/**
 * THE ROUTING RULE of a Prerequisite Check (owner ruling 2026-09-26, plan §8b): the lessons a pupil
 * is sent to, in order, then back to this lesson. `missed` holds the question numbers (1-based, the
 * check's order) or the prerequisite lesson ids; two or more misses start with the EARLIEST (the
 * check runs most basic first). [] when nothing was missed (straight on to the anchor chart).
 * Each step: {lesson, title, built, skill, ref} (built: the lesson is in the library), then
 * {lesson: <this lesson>, title, back: true}.
 */
export function prereqRoute(idOrSlug, missed = []) {
    const l = lessonById(idOrSlug);
    const list = (l && l.prereqs) || [];
    const hit = new Set((missed || []).map(String));
    const go = list.filter((p, i) => hit.has(String(i + 1)) || hit.has(p.lesson));
    if (!go.length) return [];
    return go.map((p) => ({ lesson: p.lesson, title: p.title || '', built: !!lessonIdOf(p.lesson), skill: p.key, ref: refOf(p) }))
        .concat([{ lesson: l.id, title: '', back: true }]);
}

/** Every family's needs, each with its family. */
export function allNeeds() {
    return FAMILY_IDS.flatMap((f) => ((FAMILIES[f] && FAMILIES[f].NEEDS) || []).map((n) => Object.assign({ family: f }, n)));
}

/**
 * Every structural problem of the library: duplicate ids across families, malformed routines (each
 * as each lesson uses it, its `teach` merged in; a routine no lesson uses on its own), lessons and
 * needs, unknown routines, a slug that shadows an id or another slug, a need of an unknown lesson.
 * @param {{skillExists?: (key: string) => boolean, stepIcons?: string[], caseNames?: string[]}} [known]
 */
export function validateLibrary(known = {}) {
    const bad = [...R.dup, ...L.dup];
    const used = new Set();
    for (const [id, l] of Object.entries(LESSONS)) {
        const t = ROUTINES[l.routine] ? teachingOf(l) : null;
        if (t) {
            used.add(l.routine);
            bad.push(...validateRoutine(l.teach ? `${l.routine} (as lesson ${id} uses it)` : l.routine, t, known));
        }
    }
    for (const [id, r] of Object.entries(ROUTINES)) if (!used.has(id)) bad.push(...validateRoutine(id, r, known));
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
    return [...new Set(bad)];
}

export default {
    FAMILIES, ROUTINES, LESSONS, FAMILY_OF, lessonIdOf, lessonById, routineOf, engineRecord, lessonData, lessonRules, practiceRef,
    lessonsForSkill, defaultLessonForSkill, prerequisiteSkillsFor, prereqRoute, allNeeds, validateLibrary,
};
