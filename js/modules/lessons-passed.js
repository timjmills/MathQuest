// lessons-passed.js — the WHOLE LESSONS that passed the 8/10 bar (an independent critic, every criterion >= 8 on every
// page of the lesson). THE ONE PLACE (owner 2026-11-19, design/cards/lessons-browser §1, R2): a lesson is marked as
// passed only here, with its evidence (lane, critic round, file, date) and the RENDER STAMP of the render the critic
// graded. No other file records a lesson pass; every reader (Lessons rows, thumbnail cards, the opened lesson's header
// card) imports this file only. `node tests/scripts/ws-lessons-passed.mjs` is its gate: every id live, every evidence line
// names a lane, a round, a file that exists and a date, and every stamp still equals the current render (a later render
// change makes the entry STALE and the gate fails until a critic grades the new render).
//
// Id forms: a detailed lesson id ('g3-oa5-mult-properties'), a library step lesson ('Y3.B1.S2'), or a skill lesson
// 'skill:<category>:<skill>'.
//
// renderStamp:
//   { source: 'lesson-baseline', commit, digests: { <seed>: <first 16 hex of sha1 over the sorted "key=hash" lines of
//     design/audit/baselines/lesson-baseline.json keys detailed/<id>/<seed>/*> } }   (detailed lessons)
//   { source: 'render-stamps', commit, entries: { <render-stamps.json key>: <value> } }   (library lessons)
//
// PENDING_RECHECK: lessons whose earlier pass was not confirmed by the narrow re-check; they show a dotted "Pending
// re-check" chip and are NEVER marked. One moves to LESSONS_PASSED only when a narrow critic passes it again.
//
// Pure: no window, no DOM, no state.

const RECHECK = 'Narrow critic re-check (lane lf-checks, critic-lessons-recheck), PASS C1-C4 >= 8 on every page at seed 4242 with check / lp / sweep gates green; design/status/lf-checks/critic-lessons-recheck.md, 2026-11-20';
const stamp = (s4242, s1) => ({ source: 'lesson-baseline', commit: 'd38308824', digests: { 4242: s4242, 1: s1 } });

/** id -> { evidence, renderStamp } */
export const LESSONS_PASSED = new Map([
    ['g3-oa5-mult-properties', { evidence: RECHECK, renderStamp: stamp('0cda3e0c24a33489', '7c734ff89b44c1bc') }],
    ['g3-oa9-mult-table-patterns', { evidence: RECHECK, renderStamp: stamp('ff995039ee67d75a', '01212d690ea75536') }],
    ['g4-nbt1-ten-times-value', { evidence: RECHECK, renderStamp: stamp('a3df41cd05c748f5', '53d68b783f764412') }],
]);

/** id -> { evidence (the earlier pass), why (what the re-check found) } */
export const PENDING_RECHECK = new Map([
    ['g2-nbt3-read-write-1000', {
        evidence: 'Detailed lessons (lesson 1), critic r4 PASS 30/30 pages >= 8; design/lesson-planner/lessons/g2-nbt3-read-write-1000/critic-r4.md, 2026-10-16',
        why: 'Re-check 2026-11-20 (design/status/lf-checks/critic-lessons-recheck.md): sweep seed 17 does not build.',
    }],
    ['g1-oa1-bar-model-wp-20', {
        evidence: 'Detailed lessons (lesson 2), critic r4 PASS 21/21 pages >= 8; design/lesson-planner/lessons/g1-oa1-bar-model-wp-20/critic-r4.md, 2026-10-17',
        why: 'Re-check 2026-11-20 (design/status/lf-checks/critic-lessons-recheck.md): E9 P6 overflow, E35, LP-RASTER, sweep.',
    }],
    ['g3-oa9-input-output-rule', {
        evidence: 'Detailed lessons (lesson 5), critic r3 PASS; design/lesson-planner/lessons/g3-oa9-input-output-rule/critic-r3.md, 2026-10-17',
        why: 'Re-check 2026-11-20 (design/status/lf-checks/critic-lessons-recheck.md): sweep seed 25 does not build.',
    }],
]);

export const lessonPassed = (id) => LESSONS_PASSED.has(String(id || ''));
export const lessonPending = (id) => PENDING_RECHECK.has(String(id || ''));

/** The ids a Lessons-screen row answers to: its own key, its White Rose step, and the detailed lessons joined to it. */
export function rowIds(row, detailedIds = []) {
    const r = row || {};
    return [r.key, r.step, ...(detailedIds || [])].filter(Boolean).map(String);
}
/** The registry id that marks this row as passed, or '' (§1 lessonPassFor). */
export function lessonPassFor(row, detailedIds = []) {
    return rowIds(row, detailedIds).find((id) => LESSONS_PASSED.has(id)) || '';
}
/** The pending id of this row ('' when none, or when the row is passed). */
export function lessonPendingFor(row, detailedIds = []) {
    if (lessonPassFor(row, detailedIds)) return '';
    return rowIds(row, detailedIds).find((id) => PENDING_RECHECK.has(id)) || '';
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** The pass date of an entry as a teacher reads it ("20 Nov 2026"), '' when the evidence has none. */
export function passDate(id) {
    const e = LESSONS_PASSED.get(String(id || '')) || PENDING_RECHECK.get(String(id || ''));
    const m = e && /(\d{4})-(\d{2})-(\d{2})\s*$/.exec(e.evidence);
    return m ? `${+m[3]} ${MON[+m[2] - 1]} ${m[1]}` : '';
}
/** "passed the 8/10 quality check on 20 Nov 2026" for the opened lesson's header card (plain words, no file names). */
export function passLine(id) {
    if (!LESSONS_PASSED.has(String(id || ''))) return '';
    const d = passDate(id);
    return `passed the 8/10 quality check${d ? ` on ${d}` : ''}`;
}
