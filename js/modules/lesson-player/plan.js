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
    Object.freeze({ id: 'warmup', name: 'Warm-up', built: true, slice: 2 }),
    Object.freeze({ id: 'ido', name: 'I do', built: true, slice: 1 }),
    Object.freeze({ id: 'wedo', name: 'We do', built: true, slice: 2 }),
    Object.freeze({ id: 'youdo', name: 'You do', built: false, slice: 3 }),
    Object.freeze({ id: 'exit', name: 'Exit ticket', built: false, slice: 3 }),
]);
export const PART_IDS = Object.freeze(PLAYER_PARTS.map((p) => p.id));
export const DEFAULT_PART = 'ido';
export const MODES = Object.freeze(['board', 'pupil']);
// The modes the player plays (slice 2 builds pupil mode: self-paced, saves the part reached, D4).
export const BUILT_MODES = Object.freeze(['board', 'pupil']);
/** The most Warm-up cells (one per prerequisite skill, card §2) and the We do items (2-3, P-LC-7). */
export const WARM_MAX = 3;
export const WEDO_MIN = 2;
export const WEDO_MAX = 3;
/** D2: the seed of item i of a part dealt by the player itself: Warm-up S+100+i, We do S+200+i, You do S+300+i, Exit S+900+i. */
const PART_OFFSET = Object.freeze({ warmup: 100, wedo: 200, youdo: 300, exit: 900 });
export const partSeed = (S, part, i = 0) => ((Number(S) >>> 0) + (PART_OFFSET[part] || 0) + (Number(i) || 0)) >>> 0;
/** The words of We do rung 3 (card §2: "'What comes next?' + Steps row highlighted"). */
export const RUNG3_WORDS = 'What comes next?';

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

/** ?lesson=&part=&s=&mode= (unknown part -> I do; a mode this slice does not play (pupil) -> board, BUILT_MODES). */
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
    const mode = BUILT_MODES.includes(modeRaw) ? modeRaw : 'board';
    // (D4: a pupil link without ?part= resumes at the last part reached - `partGiven` tells the screen whether to look)
    return { raw, lesson, part, seed, mode, board: p.get('board') === '1', partGiven: p.has('part') && PART_IDS.includes(partRaw) };
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

/** A dealt question as the plan keeps it (plain data: the gates JSON-compare plans). */
const qRef = (q) => ({ text: String((q && q.text) || ''), ans: q ? q.ans : '', seed: q ? q.seed : undefined, categoryId: (q && q.categoryId) || '', skillId: (q && q.skillId) || '' });

/**
 * The Warm-up (card §2): one cell per prerequisite skill, at most WARM_MAX - the FIRST item of each skill the printed
 * lesson sheet's Warm-up band deals (`warmQs`, one list per skill; P-ON-5: screen = paper), each with its library
 * instruction and, where the lesson's Prerequisite Check routes that skill, its "If missed" lesson.
 */
export function planWarmup(warmQs = [], data = null, instr = []) {
    const pre = (data && Array.isArray(data.prereqs) ? data.prereqs : []);
    const items = [];
    (warmQs || []).forEach((list, k) => {
        const q = (list || [])[0];
        if (!q || items.length >= WARM_MAX) return;
        const key = `${q.categoryId}:${q.skillId}`;
        const keyOf = (p) => p.key || (p.ref ? `${p.ref.categoryId}:${p.ref.skillId}` : '');
        const route = pre.find((p) => p && keyOf(p) === key && p.lesson) || null;
        const why = ((data && data.skills) || []).find((s) => s && s.key === key);
        items.push(Object.assign(qRef(q), { instr: String(instr[k] || ''), why: (why && why.why) || '', ifMissed: route ? { lesson: route.lesson, title: route.title || '' } : null }));
    });
    return { part: 'warmup', items };
}

/**
 * The We do (card §2, P-LC-7, P-ON-7): the printed Guided cells (`weDoQs`), 2-3 of them, item i opening at rung i+1
 * (1 = the next step's working marks grey + its sentence, 2 = its sentence, 3 = "What comes next?" + its Steps row). The
 * next step is the item's first worked step (the pupil starts each item at the beginning); its sentence is the provider's
 * own words for THIS item (L6). A step that only writes the answer is never the hint (P-ON-8: no hint gives the answer).
 */
export function planWeDo(weDoQs = [], stepsOf = () => [], instr = '') {
    const items = (weDoQs || []).slice(0, WEDO_MAX).map((q, i) => {
        const steps = stepsOf(q) || [];
        const ansStep = (s) => (s.marks || []).some((m) => m && /^(ans|answer)/.test(String(m.slot || '')));
        let h = steps.findIndex((s) => !ansStep(s));
        if (h < 0) h = 0;
        return Object.assign(qRef(q), { rung: Math.min(3, i + 1), hintStep: h, sentence: steps[h] ? String(steps[h].text || '') : '', steps: steps.length });
    });
    return { part: 'wedo', items, instr: String(instr || '') };
}

/** The whole plan of a lesson. `example`: the anchor chart's example question (from chartRequest's build). */
export function planLesson(id, { seed, mode = 'board', example = null, title = '', warmQs = null, weDoQs = null, warmInstr = [], weDoInstr = '', stepsOf = null } = {}) {
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
            : p.id === 'warmup' ? Object.assign({ name: p.name, built: true }, planWarmup(warmQs || [], data, warmInstr))
                : p.id === 'wedo' ? Object.assign({ name: p.name, built: true }, planWeDo(weDoQs || [], stepsOf || ((q) => workedStepsOf({ q })), weDoInstr))
                    : { part: p.id, name: p.name, built: false, slice: p.slice })),
    };
}

export default { PLAYER_PARTS, PART_IDS, partSeed, planWarmup, planWeDo, partOf, resolveLessonId, lessonSeedOf, lessonVariantOf, chartRequest, parseLaunch, launchSearch, planIdo, planLesson };
