// js/modules/lesson-player/plan.js
// THE LESSON PLAYER'S PLAN (design/cards/lesson-player/lesson-player.md, lane lf-hosts). Pure: no DOM, no window, no state,
// no Math.random, so node gates (tests/scripts/ws-lesson-player.mjs --unit) read exactly what the screen plays.
//
//   PLAYER_PARTS                 the five player parts in their fixed order (P-1, P-ON-1); `built` says which parts this
//                                slice plays - the others open as a navigable "coming soon" stage (D11: never locked)
//   partOf(id)                   a part by id (null for an unknown id)
//   resolveLessonId(idOrSlug)    the library id of a lesson id or slug ('add-within-10' -> 'Y1.B2.S9'), or null
//   lessonSeedOf(id)             D2: the packet seed S of a lesson - the seed the lesson's White Rose print screen deals it
//                                with (wrm-links.js wrmLessonSeed of its step id), so the screen = the printed packet
//   lessonVariantOf(id)          the lesson's variant (wrmLessonVariant), which moves a times-table example with it
//   chartRequest(id, seed)       the buildSheet request that deals the lesson's ANCHOR CHART: the player takes its I do
//                                example from that build (res.lesson.chart.exampleQs[0]), never re-deals it (D2, P-ON-5)
//   parseLaunch(search)          ?lesson=&part=&s=&mode= -> {lesson, part, seed, mode} (D8, D11)
//   launchSearch(l)              the inverse: the query string of a launch (the part bar keeps the URL in step)
//   planIdo(exampleQ, data)      the I do part of one example: one STATE per worked step (P-LC-9), each with the routine's
//                                step name (the Steps strip), the provider's own words for THIS example (L6) and the
//                                drawing state it shows; the filled Say line (sayLineOf, P-17) and the routine's chant
//   planLesson(id, {seed, mode, example})   the whole plan: {id, slug, title, seed, variant, mode, parts:[...]} - one
//                                entry per PLAYER_PARTS id; later slices fill warmup / wedo / youdo / exit here
//                                (and D12's itemsFor(req)), never in the screen module.

import { lessonById, lessonIdOf, lessonData, practiceRef } from '../lessons/library.js';
import { workedStepsOf, sayLineOf } from '../sheet/anchors.js';
import { stateGroups, namedSteps } from '../sheet/lesson-pages/common.js';
import { fitLessonData } from '../sheet/roles/lesson.js';
import { wrmLessonSeed, wrmLessonVariant } from '../wrm-links.js';

export const PLAYER_PARTS = Object.freeze([
    Object.freeze({ id: 'warmup', name: 'Warm-up', built: false, slice: 2 }),
    Object.freeze({ id: 'ido', name: 'I do', built: true, slice: 1 }),
    Object.freeze({ id: 'wedo', name: 'We do', built: false, slice: 2 }),
    Object.freeze({ id: 'youdo', name: 'You do', built: false, slice: 3 }),
    Object.freeze({ id: 'exit', name: 'Exit ticket', built: false, slice: 3 }),
]);
export const PART_IDS = Object.freeze(PLAYER_PARTS.map((p) => p.id));
export const DEFAULT_PART = 'ido';
export const MODES = Object.freeze(['board', 'pupil']);

export const partOf = (id) => PLAYER_PARTS.find((p) => p.id === id) || null;

export const resolveLessonId = (idOrSlug) => lessonIdOf(idOrSlug);

export function lessonSeedOf(id) {
    const lid = lessonIdOf(id);
    return lid ? wrmLessonSeed({ step: lid, key: lid }) : 0;
}

export function lessonVariantOf(id) {
    const lid = lessonIdOf(id);
    return lid ? wrmLessonVariant({ step: lid, key: lid }) : 0;
}

/** The anchor chart's build request (the lesson print screen's request, chart part, at L as the chart always prints). */
export function chartRequest(id, seed) {
    const lid = lessonIdOf(id);
    const ref = lid ? practiceRef(lid) : null;
    return {
        role: 'lesson', lessonId: lid,
        sections: [{ skills: ref ? [ref] : [] }],
        practicePages: 1, mixed: false, parts: ['chart'],
        size: 'M', look: 'auto', paper: 'A4', header: { name: true, date: true, score: true, title: true }, key: false,
        seed: Number(seed) >>> 0, lessonVariant: lessonVariantOf(lid),
    };
}

/** ?lesson=&part=&s=&mode= (unknown part -> I do; mode defaults to board, the only mode of slice 1). */
export function parseLaunch(search = '') {
    let p;
    try { p = new URLSearchParams(String(search || '')); } catch (e) { return null; }
    const raw = p.get('lesson');
    if (!raw) return null;
    const lesson = lessonIdOf(raw);
    const partRaw = String(p.get('part') || DEFAULT_PART).toLowerCase();
    const part = PART_IDS.includes(partRaw) ? partRaw : DEFAULT_PART;
    const sRaw = p.get('s');
    const seed = sRaw !== null && sRaw !== '' && Number.isFinite(Number(sRaw)) ? Number(sRaw) >>> 0 : (lesson ? lessonSeedOf(lesson) : 0);
    const modeRaw = String(p.get('mode') || 'board').toLowerCase();
    const mode = MODES.includes(modeRaw) ? modeRaw : 'board';
    return { raw, lesson, part, seed, mode, board: p.get('board') === '1' };
}

export function launchSearch({ raw, lesson, part, seed, mode, board }) {
    const p = new URLSearchParams();
    p.set('lesson', raw || lesson);
    p.set('part', part || DEFAULT_PART);
    p.set('s', String(Number(seed) >>> 0));
    p.set('mode', mode || 'board');
    if (board) p.set('board', '1');
    return `?${p.toString()}`;
}

/**
 * The I do of one example. A provider with fewer than 2 worked steps gives ONE state (the problem answered in grey):
 * the player never invents steps (M-LP1).
 */
export function planIdo(exampleQ, data0 = null) {
    if (!exampleQ) return null;
    const it = { q: exampleQ };
    const steps = workedStepsOf(it);
    const data = fitLessonData(data0, it);
    const groups = steps.length ? stateGroups(steps) : [];
    const named = steps.length ? namedSteps(steps, data) : [];
    const groupOf = (i) => Math.max(0, groups.findIndex((g) => g.steps.includes(i)));
    const say = sayLineOf(it);
    const states = steps.map((s, i) => ({
        n: i + 1,
        name: (named[i] && named[i].name) || s.text,
        icon: (named[i] && named[i].icon) || '',
        words: (named[i] && named[i].words) || s.text,
        note: (named[i] && named[i].note) || '',
        group: groupOf(i),
        marks: (s.marks || []).map((m) => ({ slot: m && m.slot, value: m && m.value !== undefined ? String(m.value) : '' })),
    }));
    return {
        part: 'ido',
        example: { text: String(exampleQ.text || ''), ans: exampleQ.ans, categoryId: exampleQ.categoryId || '', skillId: exampleQ.skillId || '', seed: exampleQ.seed },
        steps: states,
        groups: groups.map((g) => g.steps.slice()),
        say,
        chant: (data && data.chant) || '',
        worked: steps.length >= 2,
    };
}

/** The whole plan of a lesson. `example`: the anchor chart's example question (from chartRequest's build). */
export function planLesson(id, { seed, mode = 'board', example = null, title = '' } = {}) {
    const lid = lessonIdOf(id);
    if (!lid) return null;
    const l = lessonById(lid);
    const S = seed === undefined || seed === null ? lessonSeedOf(lid) : Number(seed) >>> 0;
    const data = lessonData(lid);
    return {
        id: lid, slug: l.slug || '', title: title || '',
        seed: S, variant: lessonVariantOf(lid), mode: MODES.includes(mode) ? mode : 'board',
        practice: practiceRef(lid),
        parts: PLAYER_PARTS.map((p) => (p.id === 'ido'
            ? Object.assign({ name: p.name, built: true }, planIdo(example, data) || { part: 'ido', steps: [], say: '', chant: '', worked: false })
            : { part: p.id, name: p.name, built: false, slice: p.slice })),
    };
}

export default { PLAYER_PARTS, PART_IDS, partOf, resolveLessonId, lessonSeedOf, lessonVariantOf, chartRequest, parseLaunch, launchSearch, planIdo, planLesson };
