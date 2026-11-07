# Lane lf-checks — the lesson precritic checks, backtests and gate hygiene

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`, builder and every sub-agent). Step: first build of
new checks (a tool), so medium in any case.

**Read first:** `design/lessons-first/briefs/README.md`, `design/LESSONS_FIRST_PLAN.md` §3 and §6 (the table in §6.3 is your
build list), `design/IMPROVEMENT_PLAN.md` §1.6.1 (the lesson defect-class table and its "Machine check" column),
`design/audit/LESSONS_LEARNED.md` (L16–L21, rule 9), `design/status/lessons-6-7.md` (lines 46–86: lesson 7 D1–D3, the proposed
checks, the pre-existing reds), `design/lesson-planner/lessons/g3-oa8-two-step-wp/critic-r1.md`,
`design/lesson-planner/lessons/g4-nbt1-ten-times-value/critic-r3.md`, the phase 0 critic report
`design/audit/runs/lessons-phase0-r1/REPORT.md` on `origin/claude/sweet-newton-c8wrv1-lessons-phase0`,
`tests/scripts/ws-detailed-lesson.cjs` (E-checks), `tests/scripts/ws-precritic.cjs` (header), `tests/scripts/ws-backtest.mjs`,
`tests/fixtures/precritic/backtests.json`.

**Branch:** `claude/sweet-newton-c8wrv1-lf-checks` from `origin/claude/sweet-newton-c8wrv1`. The phase 0 check scripts
(`ws-lesson-check.cjs` and friends) live on lf-engine's branch until it merges: build the checks that read the LIVE packet
and the detailed pack here (they run on master today), and give lf-engine the ones that read phase-0-only fields as a patch
it applies (through the lead).

**Files owned:** `tests/scripts/ws-detailed-lesson.cjs`, `tests/scripts/ws-lesson-samples.cjs`, `tests/scripts/ws-lesson-check.cjs`
(after lf-engine merges), the lesson scope of `tests/scripts/ws-precritic.cjs` (`--lesson <id>`, `--unit <unit-id>`: new),
`tests/scripts/ws-precritic-plan.mjs` (lesson rows), `tests/fixtures/precritic/backtests.json` (append rows only),
`tests/fixtures/precritic/*lesson*` fixtures, `design/audit/baselines/print-lint.json` (only the lesson pin rows you re-pin,
each with its reason), `tests/scripts/ws-deploy-gates.sh` (the lesson rows only), `design/lessons-first/units/_TEMPLATE.md`
(new: the per-unit speed reflection record of plan §6.2). No app code: a check that finds a real defect is reported to the
lane that owns the file.

## Step 1 — gate hygiene (so "clean before critic" is possible for every lesson lane)
1. `placevalue:more_less_10#lesson L-OVERLAP CL40-INK 0 → 2` (L and S, red on main, pin drift): find whether the 2 findings
   are real (render, measure). Real → report to the lead for the placevalue lane; drift → re-pin with a reason line.
2. Lesson 2 `ws-detailed-lesson` E9 (P6 exit slip +5 mm since the 10-25 word-work tab spacing): confirm on master; report the
   cause to the lead (an engine fix belongs to lf-engine).
3. Add `ws-detailed-lesson --lesson <id> --check` for every passed long lesson (1, 2, 3a, 4, 5, 6) to `ws-deploy-gates.sh`
   session 1 beside the existing `--repeats` rows (the gate-drift guard, lessons-6-7 hand-over); add
   `ws-lessons-first-queue --check` to session 1 (node).
4. `ws-chromebook-perf` in session 3: make the runner hold both browser slots for it and run it after every other browser
   gate of that session (a perf number measured beside another browser process is void, plan §4.2).

## Step 2 — the checks (each: FAIL on the named failed state first, then on precritic's path, then a backtest row)
| Check | What it asserts | Fails on (backtest) |
|---|---|---|
| LP-FAMILY-REPEAT | E24 keyed by the unordered × / ÷ family {a, b, ab} plus the story frame | lesson 7 critic-r1 head (D2) |
| LP-TEXT | every page / panel / step / item / answer / letter a teacher page names resolves to the pupil page's visible text; Check Question choice count = board A–D; a "no X this time" script line fails when the page prints X | lesson 7 critic-r1 head (D3); lesson 2 r3 D2 / lesson 5 r2 D7 heads |
| LP-GIVEAWAY | no Say band, hint or Steps text holds an item's key value; Guided carries a hint Independent does not | lesson 4 r1 head (D1, D2, D6) |
| LP-MODELLED | every task kind dealt on Practice / exit is on a modelled panel or script row before it (task kinds from the generator) | lesson 2 r1 head (D3), lesson 1 r1 (D1) |
| LP-NUMBERS | teacher pages: no bare 4+ digit number without its comma (lesson 6 n2 "4000"); same-page near-looks (lesson 6 n1 92,163 / 92,715) | lesson 6 critic-r3 head |
| LP-FALLBACK | a chart drawn under zoom 1 (`chartPage`'s fallback) fails (until lf-engine returns `sizing.mode`, read the zoom from the DOM) | lesson 7 critic-r1 head (D1) |
| LP-MEASURE | every rendered lesson page measured, never planned counts: fill, H13 bands, slot ≥ minimum, ≥ 8 pt text (route through `ws-print-lint --source kit` roles lesson / detailed-lesson where it applies) | lessons-phase0 r1 head (D4, D9, D11) |
| LP-RASTER | chart step icons, panel rules and the We Do grid present on the PDF rasterised at 72 and 93 dpi (reuse `tests/lib/ws-pdfium-rules.py` from the facts-print branch if merged; else pymupdf) | a seeded fixture with a 0.4 pt rule |
| LP-PREREQ | Prerequisite Check: one answer slot per key answer; no scaffold on a check cell; its items inside the step's range | phase 0 r1 head (D1, D3, D8) |
| LP-SWEEP | for each lesson: seeds 1–25 × parts × refresh 0–2 through the built path (parse HTML, no layout), invariants LP-FAMILY-REPEAT, LP-GIVEAWAY, LP-MODELLED and the card ranges (once cards exist) | lesson 7 critic-r1 head |
Then the scope: `ws-precritic --lesson <id>` = `ws-detailed-lesson --check --repeats` + the LP checks + `--role lesson` + `ws-teacher-wrm`;
`--unit <unit-id>` = every lesson of the unit from `design/lessons-first/queue.json`.

## Step 3 — if the cap allows
Teach `tests/scripts/ws-integrate.mjs` a links operation (append a `{key, opts, why}` to a step's or site lesson's `direct` /
`pre` / `related` list in `data/curriculum/links/<Y>.json`, idempotent, refusing an edit of an existing entry), with its
`--self-test` case, so skill lanes stop hand-editing the year records (plan §4.1).

## Gates before hand-over
`ws-backtest` (every new row FAIL / PASS as stated), `ws-precritic-plan` (every LP check on the path), `ws-precritic --role lesson
--strict` green (or red only on pinned rows with a reason), `ws-precritic --lesson g4-nbt1-ten-times-value --strict` green (a
passed lesson must be clean), `bash tests/scripts/ws-deploy-gates.sh --list` shows the new rows, `ws-boot-smoke`,
`node --check` on every touched .cjs, `node --input-type=module --check` on .mjs.

## Critic
Checks are tools: an independent critic (`mq-opus-medium`) grades the checks lane on its brief (does each check catch its
class, no false alarms on the six passed lessons, runtime) at ≥ 8 on every criterion (CLAUDE.md: tools pass only at ≥ 8).

## Hand-over
`design/status/lf-checks.md`; to the lead: the list of real defects found (with the owning lane), the new precritic scope
commands, the units template. **Cap: $100** (≈ 5 %). Stop rules: README rule 11.
