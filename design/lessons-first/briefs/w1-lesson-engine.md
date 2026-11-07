# Lane lf-engine — lessons phase 0 fix round, then the lesson compiler (E4), then its proof

**Model and effort: Opus 5.5, MEDIUM** (profile `mq-opus-medium`, `model: "opus"`, for the builder, every sub-agent and the
critic). Step: P1 is the rebuild of a failed round (phase 0 critic r1 FAIL min 3); P2 is the first build of a new engine.

**Read first:** `design/lessons-first/briefs/README.md` (common rules), `design/LESSONS_FIRST_PLAN.md` (§1.1, §2, §3, §6),
`design/IMPROVEMENT_PLAN.md` §1.6.1 (lesson defect classes) and §1.6.5 "Lessons" items 1–6, `design/LESSON_LIBRARY_PLAN.md`
(§1, §2, §6, §8a–8f), `design/lesson-planner/DETAILED_MAKER.md` (whole, incl. "Skill coverage rule"),
`design/status/lessons-phase0.md` on branch `origin/claude/sweet-newton-c8wrv1-lessons-phase0` (decisions D1–D4, critic r1,
hand-over), `design/audit/runs/lessons-phase0-r1/REPORT.md` on that branch, `design/status/lessons-6-7.md` (lesson 7 D1–D3),
`design/lesson-planner/lessons/g3-oa8-two-step-wp/critic-r1.md`, `design/lessons-first/QUEUE.md` unit G3-Y4.B4.

**Branch:** `claude/sweet-newton-c8wrv1-lf-engine`, made from `origin/claude/sweet-newton-c8wrv1-lessons-phase0` and then
merged with `origin/claude/sweet-newton-c8wrv1` (the integration tip). Phase 0 is 20 ahead / ≈ 215 behind: expect conflicts in
`sheet/roles/lesson.js` (master changed `chartPage` and the lesson-6/7 hooks after phase 0 extracted it into
`sheet/lesson-pages/*`). Port master's changes INTO the extracted modules; the oracle is `ws-lesson-baseline` — the three
standard samples and the six passed detailed lessons render byte-identical to master except where LR-17 changes the
samples on purpose.

**Files owned:** `js/modules/lessons/{library,schema,compile}.js` (compile new), `js/modules/lessons/shapes/*` (new),
`js/modules/lessons/units/*` (new: one compiled file per unit), `js/modules/lessons/families/*` (phase 0), `seed-db.js` /
`prereq-db.js` / `status-db.js` (generated), `js/modules/sheet/lesson-pages/*`, `js/modules/sheet/lesson-arch/*`,
`js/modules/sheet/lesson-rules.js`, `js/modules/sheet/roles/{lesson,detailed-lesson,pre-skill-check}.js`,
`js/modules/sheet/teacher-parts.js`, `js/modules/print-sheet.js` (only `buildLesson`, `buildDetailedLesson` and their
helpers), `js/modules/lessons/detailed/index.js` (registry only), `design/lessons/SHAPES.md` (new), `design/lessons/cards/`
(format + the proof cards), `tests/scripts/ws-lesson-card.mjs` (new), `ws-lesson-seed.cjs`, `ws-lesson-coverage.cjs`,
`ws-lesson-hash.cjs`, `ws-lesson-unit.mjs`, `ws-lesson-baseline.cjs`, and the queue script's lesson-grades source
(`tests/scripts/ws-lessons-first-queue.cjs`, one function). **Not yours:** `ws-detailed-lesson.cjs`, `ws-lesson-check.cjs`,
`ws-lesson-samples.cjs`, the lesson scope of `ws-precritic.cjs`, `backtests.json` rows of lesson checks — those belong to
lf-checks; ask it (through the lead) for a check you need. Lesson content of `js/modules/lessons/detailed/<id>.js` is
read-only except the proof recompiles.

## Step 1 — P1, phase 0 fix round (checks first)
1. Build the critic-r1 automatic checks listed in the phase 0 hand-over that live in your files (D13 title constant, D14
   one routing-table export, D15 no literal styles in role output, D16 unit tests of the routed plan, D17 `--bind-stamps`
   refuses a changed render) and hand lf-checks the list of the others (D1 slots-vs-key, D2/D12 route text, D3/D7 ranges,
   D5 prereq pool, D6 AK-4 on precritic, D4/D9/D11 sheetCheck blocking, D8 no scaffolds, D10 strip clip) — they build those
   in parallel. Prove each of yours fails on 8f12b0e85.
2. Fix D2 D3 D5 D8 D20 (data, `families/*.js`: deal the items before choosing), D4 D9 (one grid layout for the Prerequisite
   Check page), D12 (`checks` field + routing table), D10/D11 (sheet reflow), D18 (parts registry fully plug-in, so the
   vocabulary lane can register its part without editing `roles/lesson.js`).
3. Precritic: `ws-precritic --role lesson --strict` plus lf-checks' new rows, `ws-lesson-check` 0 findings on the samples,
   `ws-lesson-coverage`, `ws-lesson-unit`, `ws-layout-unit`, `ws-lesson-baseline` (detailed lessons byte-identical).
4. Critic r2 on the three sample packets (L and S-printed-at-M, seeds 4242 and 1001, every page + keys + routing page).

## Step 2 — P2, the compiler (E4)
1. **Lesson card format** (`design/lessons/cards/<unit-id>/<lesson-id>.md` + a machine block): lesson id (step id or site
   id), unit, CCSS / EE, shape, parts → skill + option values for each part (P0 prerequisite check from links `pre`, chart,
   We Do, Practice, Mixed, P1, P5, P6, Check Question), number ranges, edge cases, rulings, misconceptions (provider ids),
   vocabulary (wrm-vocab), story / hook / teaching notes (the only hand-written fields), open questions with suggested
   answers, `Signed: owner, <date>`. `ws-lesson-card --draft --unit <id>` writes every card of a unit from
   `design/lessons-first/queue.json` + links + providers; `--check-signed` and `--check` (every field resolves: skills live,
   options valid, ranges reachable by the skill's options).
2. **`compileLesson(card)`** (`js/modules/lessons/compile.js`, pure, no DOM) → (a) the library entry the short packet prints
   (routine + practice link + prereqs, LESSON_LIBRARY_PLAN §1), (b) the detailed description the long pack prints (same
   shape as `lessons/detailed/<id>.js`), written into `js/modules/lessons/units/<unit-id>.js`. Atoms and the pre-skill check
   from prerequisites; chunks from the option ladder (one new thing per step, PEDAGOGY P-1); chart, scripts and Steps from
   providers' `workedSteps` / `strings`; Guided fade; Practice / exit from generators with the LR-5 pool; mistakes table
   and Check Question distractors from `misconceptions` / `wrongAnswer`; the **one shared Check Question response**
   ("which is right", owner Q9). Target: hand-written part < 100 lines a long lesson.
3. **`design/lessons/SHAPES.md`**: every lesson in `queue.json` gets a shape (start from the queue's proposal; the five
   passed shapes first) or "new shape"; each shape lists the templates it needs. Then make the queue script read SHAPES.md.
4. **Lesson 7 D1 in the engine**: `chartPage` returns `sizing.mode`; a fallback zoom < 1 is a failure the compiler refuses.
5. Gates (node): `ws-lesson-card --check`, `ws-lesson-unit`, `ws-lesson-coverage`, a new compile unit test (every card of
   the proof set compiles; the output passes the schema).

## Step 3 — P2b, proof before use
1. Write cards for lessons 1, 2, 3a, 4, 5 and compile them; diff every page against the passed pack (render each, compare
   with `ws-lesson-hash` / the PNGs): every difference explained in `design/lessons/proof/DIFF.md`.
2. Compile lesson 6 (hold-out: the compiler was not shaped on it) and lesson 7 (second hold-out; its D2/D3 must come out
   right from the card, not by hand).
3. Clean before critic: `ws-precritic --lesson <each id> --strict` (lf-checks' scope; until it lands, `ws-detailed-lesson
   --lesson <id> --check --repeats` + `ws-precritic --role lesson --strict` + `ws-teacher-wrm`), on the branch merged with
   the integration tip.
4. Independent critic: the five recompiled packs (spot-read against their passed renders), lesson 6 and 7 in full, short
   and long. PASS = ≥ 8 everywhere. On PASS record the grades (`design/lessons/grades.jsonl`, `--bind-stamps`) and update
   `data/curriculum/detailed-lessons.json` for 7.

## Gates before hand-over
`ws-lesson-baseline` (passed lessons unchanged or every change explained), `ws-lesson-card --check`, `ws-lesson-unit`,
`ws-lesson-coverage`, `ws-layout-unit`, `ws-precritic --role lesson --strict`, `ws-detailed-lesson --check --repeats` for
lessons 1–7, `ws-teacher-wrm`, `ws-lessonfit`, `ws-wrm-page-unit`, `ws-boot-smoke`, `ws-code-snapshot`, `ws-backtest`,
`ws-lessons-first-queue --check`, `node --input-type=module --check` on every touched module.

## Hand-over
To the lead: the compiler's state (proof verdicts), the per-step costs and times (Times lines), the speed-reflection lists,
and the ready-to-run command for the pilot: `ws-lesson-card --draft --unit G3-Y4.B4`. Status file
`design/status/lf-engine.md`.

**Cap: $470** (≈ 23.5 % of the weekly limit): P1 ≤ $110, P2 ≤ $220, P2b ≤ $140. Stop rules: README rule 11.
