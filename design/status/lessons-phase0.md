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

## Gates

## Critic rounds

## Per-round findings (automatic checks · speed-ups)
