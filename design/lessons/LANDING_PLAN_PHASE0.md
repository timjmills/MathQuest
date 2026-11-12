# Landing lessons phase 0 on master: plan (lf-engine, 2026-11-09)

Why: lf-vocab (and every lane whose lesson pages plug into the parts registry) needs phase 0 on master: `lessons/library.js`,
`lessons/families/*`, `lessons/schema.js`, `sheet/lesson-pages/*` (the registry), `sheet/lesson-arch/*`, the compiler
(`lessons/compile.js`, cards). Master (2fe21f2b) has none of it; lane `claude/sweet-newton-c8wrv1-lf-engine` has it all.

## Today (measured with `git merge-tree origin/master <lane>`)
- Merge base 623fdd6d; master +162 commits, lane +104.
- Conflicting files: 6 — `js/modules/lessons/prereqs.js`, `js/modules/print-sheet.js`, `js/modules/sheet/roles/lesson.js`,
  `tests/fixtures/precritic/backtests.json`, `design/audit/LESSONS_LEARNED.md`, `design/status/speed-audit.md`.
- Master-side changes to port into the lane's structure (git diff 623fdd6d..origin/master):
  - `prereqs.js`: 5 place-value lesson records in the OLD format (`placevalue:identify`, `value`, `expand`, `combine`,
    `unit_form`; lf-placevalue) → port each as a ROUTINE + LESSON into `lessons/families/placevalue.js` (skill: ids unless
    the record names a WRM step; `prereqsPending` + `casesPending` like the other ported records, so their packets keep
    the Warm-up and stay byte-identical).
  - `roles/lesson.js` (≈ 43 lines): lf-placevalue's `warmItemKey` (Warm-up heading from items' instructionKey), the vocab
    `compact` ones picture, `arrP1` (3a ruling), `pickWeDo(…, others)` + `sameSecond`, `caseRef` in sources() (lesson 2) →
    into `lesson-pages/warm-up.js`, `vocab.js`, `we-do.js`, `lesson-arch/array.js`, `lesson-pages/common.js`.
  - `print-sheet.js` (≈ 232 lines): the live lesson fixes (lane already has them in extracted form — keep the lane's,
    verify equivalence), `pack-solve.js` wiring, lf-placevalue dealer changes → take master's where the lane has none.
  - `detailed/*.js` content (lessons 1, 2, 3a, 4, 6): master's is the deployed truth — take master's, then re-apply the
    lane-only extras (repeatKey support, card rulings) only where they do not change a render.
  - backtests.json / LESSONS_LEARNED / speed-audit: union by id / append both.

## The one design decision: LR-17 off by default when landing
The lane's three sample packets (add_facts, sub_100_regroup, nearest_10) open with the Prerequisite Check (LR-17),
which has NOT passed its critic (phase 0 r2 FAIL min 6; r3 not run). Landing must not change any live packet. So the
landing commit keeps the library `prereqs` of those three lessons behind a switch (e.g. `prereqsLive: false` per
lesson, or the registry's `prereq` part `inPacket` false until the lesson's check passes) → every live packet prints
its Warm-up exactly as master does today. The switch flips per lesson when its critic passes.

## Steps (one lane, Opus medium, no parallel builder on these files)
1. Baseline FIRST on master (clean detached worktree): `ws-lesson-baseline --write` extended to every lesson master
   prints — the 7 detailed lessons, the 3 samples, the 5 place-value lessons, every `prereqs.js` key (25+), at L and S,
   seeds 4242 + 1 — plus `ws-lesson-hash --write`. (≈ 15 min.)
2. Branch `claude/sweet-newton-c8wrv1-lf-engine-land` from origin/master; merge the lane; resolve the 6 conflicts as above;
   LR-17 switch off; port the 5 pv records.
3. Fix the known lane drift first (lesson 2's P0 twin answers on the extracted engine — this round's item 1), or the
   byte-identity proof fails on lesson 2.
4. Gates: the baseline `--check` = 0 differences on every live lesson (the proof); `ws-detailed-lesson --check --repeats`
   on lessons 1-7 (same lines as master: lesson 2 E9/E35, lesson 7 E35); `ws-lesson-unit`, `ws-lesson-coverage`,
   `ws-lesson-compile-unit`, `ws-lesson-card --check`, `ws-lesson-seed --check`, `ws-layout-unit`, `ws-boot-smoke`,
   `ws-code-snapshot`, `ws-teacher-wrm`, `ws-pdf-preview`, `ws-precritic --role lesson --strict` (same reds as master),
   `ws-backtest`, `ws-lessons-first-queue --check`. The deferred-half check (ws-chromebook-perf's DEFERRED_NAMES = API):
   the lane's LESSON_API export keeps API unchanged.
5. Hand the lead a fast-forward branch; the lead stamps and deploys. No critic needed IF the hash proof shows 0
   differences (nothing a teacher prints changed).

## Cost
≈ $30-45 (≈ 1.5-2.3 % at $20 ≈ 1 %): merge + ports ≈ $15-25, baseline + gates ≈ $10-15 (browser gates ≈ 1 h serial),
one fix loop on whatever the hash proof finds ≈ $5. Risk: the lane's extracted engine has drifted from master beyond
lesson 2's P0 (found only by the hash proof); budget one extra fix loop (≈ $10) for it.

## After landing
- Every new master lesson change goes into families/*.js and lesson-pages/* (lanes stop editing prereqs.js; lf-ops,
  lf-algebra, lf-placevalue were told 2026-11-07).
- Phase 0's own pages (Prerequisite Check, routing page) go live per lesson as their critic passes (the switch).
