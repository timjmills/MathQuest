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

### Builder B (render side), 2026-10-30, 17:28-19:50 UTC (about 2 h 20 min wall)
- 17:28-17:50 read; `tests/scripts/ws-lesson-baseline.cjs` (260 page hashes: 3 samples x L/M x seeds 4242/1001, 5 detailed
  lessons). Two false starts: puppeteer's 180 s protocol timeout on a detailed lesson (fixed: the page reconnected with
  no timeout), and the detailed doc's css links carrying the test server's port (fixed: normalised). ~25 min lost.
- 17:35-18:20 extraction (scripted line-range moves, a missing-import check, then the hash run: 9-10 min a run) -
  a0ba0331, hashes identical.
- 18:20-18:50 parts + refresh (LR-18) - 13ebeb93, hashes identical, `--parts` OK.
- 18:50-19:05 pre-skill-check routes - aec55f46, hashes identical.
- 19:05-19:50 merge A (eab21f55, clean); lesson by id + the Prerequisite Check part (LR-17) - 847c332b, then the
  check-page fixes from print-lint (two-up rows, wrapped strips, tag flex, routing page in key mode).

### Builder B: what was built, deviations
- `sheet/lesson-arch/` has EIGHT archetypes, not three: today's CASE_TESTS also hold the detailed lessons' cases (pv,
  story, array, grid, table); `index.js` merges them and throws on a duplicate case name.
- The Warm-up band is `lesson-pages/warm-up.js` (the branch's `prereq-check.js` name is not used: D1).
- The registry (D2) holds parts (prereq 5, chart 10, sheet 20, practice 30, mixed 40) AND the lesson sheet's bands
  (vocab 10, warm-up 20, guided 30); the role lays out the registry's bands and hands an unknown lesson-role part to its
  `plan`; buildLesson builds every registered part.
- Refresh avoidance uses today's `avoidTexts` (soft) instead of the branch's `avoidHard` / `avoidSoft` (stage 3 r5 hunk).
- The routing table is a key page of its own (`ws-keyextra`): `arrangeKey` and `ws-print-lint` (AK-4 count, HD-30
  footer pick) leave it out of the pupil/key pairing. Its styles are inline, so the shared sheet stylesheet (embedded in
  every page) and every other page stay byte-identical.
- A quadrant / stacked check with routes whose cells fill the page can take a second page (the tags need ~6 mm a band);
  the lesson packet's check (perQuestion 1) fits one page.

## Gates

## Critic rounds

## Per-round findings (automatic checks · speed-ups)
