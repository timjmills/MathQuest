# Lane: lessons-phase0 (work order item 5, design/IMPROVEMENT_PLAN.md "Work order from 2026-10-30")

Branch `claude/sweet-newton-c8wrv1-lessons-phase0`, from `claude/sweet-newton-c8wrv1` @ fbeaa332 (2026-10-30).
Source: `claude/sweet-newton-c8wrv1-wip-lessons` (branch point 859782bd, 2026-09-26). Mined commits: 588d053f (r5: lesson
rules + `ws-lesson-check`, phase 0's first item), 669df31a..0e40332e (phase 0.1–0.9), ebcf82e7 (LR-18), cf428e41 + ea22a97f (LR-17).
Not mined: everything the wip branch merged from sweet-newton before 2026-09-26 (main has newer versions).

## Lead decisions (2026-10-30)

**D1 — one Prerequisite Check.** Today's code already has the newer design: `sheet/roles/pre-skill-check.js` (PAGE_TYPES
2.10), which the detailed lessons use as P0 (`perQuestion`, 3–4 questions) with the routing table on the teacher key
(T6, `detailed-lesson.js`). LR-17's page builder `lesson-pages/prereq-check.js prereqPlan` is NOT ported (it would be a
second page doing the same job). What LR-17 had that today lacks is brought into the one concept:
- the lesson LIBRARY's `prereqs` data, validated (`lessons/schema.js`: 3–4, most basic first, real lesson ids or a NEEDS
  entry, live skills, not itself, no cycle) and its gate (`ws-lesson-coverage`);
- the standard (non-detailed) lesson packet's `prereq` part, drawn BY `pre-skill-check.js` (one question per
  prerequisite), replacing that packet's Warm-up only for a lesson that declares `prereqs`;
- the owner's §8b print rule: each question's small teacher tag "If missed → Lesson <id> <title>" (an optional
  `routes` input of `pre-skill-check`, marked `data-ws-teacher`) and the routing table on the key (one shared builder,
  the same table the detailed lesson's T6 prints). The detailed lessons pass no `routes`, so their pages stay
  byte-identical.

**D2 — vocabulary.** The extracted `sheet/lesson-pages/vocab.js` keeps today's vocabulary band byte-identical; lesson
pages are looked up by part id from one registry (`lesson-pages/index.js`), so the vocabulary redesign adds its pages by
registering a part, without editing `roles/lesson.js`. No new vocabulary page is built in this lane.

**D3 — byte-identical.** Every refactor step (library, `lessonId`, page extraction, parts/refresh at refresh 0) keeps the
three sample packets AND the detailed lessons byte-identical (render hashes before/after). Only LR-17 changes the
samples' sheets (Warm-up → Prerequisite Check), on purpose, and that is what the critic grades.

**D4 — coordination.** The lessons 6–7 session (`claude/sweet-newton-c8wrv1-lessons-6-7`) owns lesson CONTENT
(`js/modules/lessons/detailed/*`, `design/lesson-samples/detailed/*`). This lane keeps to library / engine files and
touches `print-sheet.js` `buildLesson` / `buildDetailedLesson` only where the part / lessonId plumbing needs it.

## Builders

| Builder | Profile | Scope | Branch |
|---|---|---|---|
| A | mq-opus-medium (first build of the library engine) | node-only: library, schema, families, seed-db, prereq-db, status-db, lesson-rules, ws-lesson-check / seed / coverage / hash, build-list NEEDS, browser-lock | worktree → merged here |
| B | mq-opus-medium (first build of the page engine) | render: hash baseline, lesson-pages extraction, parts + refresh (LR-18), lessonId, LR-17 through pre-skill-check | worktree → merged here |

## Times

### Builder A (node side), 2026-10-30, 17:28-18:05 UTC (about 37 min wall)
- 17:28-17:32 read + port `sheet/lesson-rules.js`, `tests/lib/browser-lock.cjs` (+ harness, lock tested: stale holder broken,
  waiter gets it on release, file gone) - commit e8409ccd.
- 17:32-17:42 library: `schema.js`, `library.js`, ten family files (all ten lessons of today's `prereqs.js`), `prereqs.js`
  as the view (deep-compare OK), `ws-lesson-seed` (curated links first), `ws-lesson-coverage`, `ws-lesson-hash` - e6b18f8c.
- 17:42-17:44 build-list NEEDS + `ws-lesson-unit.mjs` (79 checks) - 457bea20.
- 17:44-17:50 `LESSON_RULES.md`, plan §7/§8b notes, `ws-lesson-check` on today's engine (probe of the plan shape, 1 run) - 6ccf9938.
- 17:50-18:02 gates (browser gates one at a time; render identity 6 min, lesson-warmup 5 min, lesson-check 3 min).

### Builder A: what was ported, what was skipped
- **Ported:** 588d053f lesson-rules.js, LESSON_RULES.md, ws-lesson-check (adapted: the packet check computed in the page
  when the engine gives no `lesson.check`; LR-18 parts only where `window.lessonPartSeed` exists); 669df31a ws-lesson-hash
  (no stamps file - B takes the baseline); 28a202a5 / c5847d4a library, schema, families, prereqs.js view (with TODAY's
  data, all ten lessons, not the r5 data); 99607315 ws-lesson-seed -> seed-db.js + prereq-db.js (now from the curated
  `data/curriculum/links` `pre` lists first: 391 of 557 fallbacks); aaa67de9 ws-lesson-coverage -> LESSON_COVERAGE.md,
  status-db.js, passed-stamps.json (stamps empty until B's baseline; `--bind-stamps` fills them); 786f60a1 build-list
  NEEDS + ws-standards line; 0e40332e browser-lock + harness; cf428e41 / ea22a97f / ebcf82e7 data, library, schema,
  coverage, doc hunks (LR-17 per D1).
- **Skipped (engine, not Builder A's):** 588d053f print-sheet / stack / pv / mixed-practice / tokens / teacher-print /
  lesson.js / lesson-css / sheet/index hunks (r5: one avoid set, noNearTwin, maxUnder10, LESSON_PACKET_SIZE, stackMinSize /
  atLeastSize, `lesson.check`, third chart example for the double and the answer under 10) - not on main; listed in
  LESSON_RULES.md "Status on the main branch"; `ws-lesson-check` reports their findings against today's packets.
  cf428e41 `lesson-pages/prereq-check.js` (D1), its print-sheet / lesson-css / teacher-print hunks (B). ebcf82e7 engine
  hunks (B). The branch's ws-layout-unit lesson checks moved to `ws-lesson-unit.mjs` (no shared-file conflict with B).
- **Data decisions:** the r5 data changes to the samples (third example `double`, `underTen`, `maxAnswer` / `ansDigits` on
  partners) are NOT taken - today's records are kept byte-for-byte (D3); only the library-only `cases` / `caps` (gate data)
  come from r5. The seven SU-C no-regrouping lessons share ONE routine (`sub-column-no-regroup`) with per-lesson `teach`
  fields; they declare `prereqsPending` and `casesPending` (listed in LESSON_COVERAGE.md; `--strict` fails on them).

## Gates

## Critic rounds

## Per-round findings (automatic checks · speed-ups)
