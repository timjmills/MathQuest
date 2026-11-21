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
const RESTAMP = 'Narrow critic lessons-browser r1 (lane lf-checks), class-only re-stamp of the critic-lessons-recheck PASS (render d38308824 -> e7c418bd4 pixel-identical on every page at seeds 4242 and 1); design/status/lf-checks/critic-lessons-browser-r1.md, 2026-11-20';

/** id -> { evidence, renderStamp } */
export const LESSONS_PASSED = new Map([
    // Re-stamped by the narrow critic lessons-browser r1: master e7c418bd4 re-pinned its pages, and the change is class-only
    // (mq-pagecap on 12 grids, no CSS for it; engine <style> rules for classes these pages do not carry); all 54 pages at
    // seeds 4242 and 1 are pixel-identical to the d38308824 render the re-check graded.
]);

/** id -> { evidence (the earlier pass), why (what the re-check found) } */
export const PENDING_RECHECK = new Map([
    ['g4-nbt1-ten-times-value', {
        evidence: RESTAMP,
        kind: 'changed',
        why: 'Stale since the 2026-11-20/21 engine deploys (row cap, fill fix): its pages render differently from the graded e7c418bd4 render at seeds 1 and 4242 (ws-lessons-passed LP-STAMP). Moved here at the lessons-browser deploy (lead, 2026-11-21); a narrow critic re-check restores it.',
    }],
    ['g3-oa5-mult-properties', {
        evidence: RECHECK,
        kind: 'changed',
        why: 'Stale since master e7c418bd4 re-pinned its pages (design/status/lf-checks/critic-lessons-browser-r1.md, 2026-11-20): 48 of 58 pages render differently from the graded d38308824 render (instruction words, an expected answer, grid heights, dot arrays); a narrow critic must grade the new render.',
    }],
    ['g3-oa9-mult-table-patterns', {
        evidence: RECHECK,
        kind: 'changed',
        why: 'Stale since master e7c418bd4 re-pinned its pages (design/status/lf-checks/critic-lessons-browser-r1.md, 2026-11-20): 8 of 50 pages render differently from the graded d38308824 render (instruction words, dot arrays swapped); a narrow critic must grade the new render.',
    }],
    ['g2-nbt3-read-write-1000', {
        evidence: 'Detailed lessons (lesson 1), critic r4 PASS 30/30 pages >= 8; design/lesson-planner/lessons/g2-nbt3-read-write-1000/critic-r4.md, 2026-10-16',
        kind: 'fix',
        why: 'Re-check 2026-11-20 (design/status/lf-checks/critic-lessons-recheck.md): sweep seed 17 does not build.',
    }],
    ['g1-oa1-bar-model-wp-20', {
        evidence: 'Detailed lessons (lesson 2), critic r4 PASS 21/21 pages >= 8; design/lesson-planner/lessons/g1-oa1-bar-model-wp-20/critic-r4.md, 2026-10-17',
        kind: 'fix',
        why: 'Re-check 2026-11-20 (design/status/lf-checks/critic-lessons-recheck.md): E9 P6 overflow, E35, LP-RASTER, sweep.',
    }],
    ['g3-oa9-input-output-rule', {
        evidence: 'Detailed lessons (lesson 5), critic r3 PASS; design/lesson-planner/lessons/g3-oa9-input-output-rule/critic-r3.md, 2026-10-17',
        kind: 'fix',
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
/**
 * Why a lesson waits for a re-check, read from its own `why` (critic lessons-browser r1 D3: the screen never says "fix"
 * for a lesson that waits only because its pages changed): 'changed' (its render changed after the pass) or 'fix' (a
 * check found something to fix). '' when the id is not pending.
 */
export function pendingKind(id) {
    const e = PENDING_RECHECK.get(String(id || ''));
    if (!e) return '';
    if (e.kind === 'changed' || e.kind === 'fix') return e.kind;
    // fallback only (critic r2 D12: ws-lessons-passed LP-PENDING-KIND requires an explicit kind)
    return /re-?pinned|render(?:s|ed)? differently|\bstale\b|pages changed/i.test(String(e.why || '')) ? 'changed' : 'fix';
}
/** The reason in plain words, for the teacher screens. */
export function pendingWords(id) {
    const k = pendingKind(id);
    return k === 'changed' ? 'its pages changed after the reviewer passed them, so a reviewer checks the new pages'
        : k === 'fix' ? 'a new check found something to fix, so a reviewer checks it again after the fix' : '';
}
