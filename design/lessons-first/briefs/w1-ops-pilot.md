# Lane lf-ops — the pilot unit's operations skills to 8/10 (G3-Y4.B4, with count_by_tables for round 1)

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`). Step: div_facts is the rebuild of a failed round
(Lane D finish critic FAIL); the count-row drawing has no approved model on its pair; the other skills are builds on pairs
without a certificate (rule 0a) — so medium throughout.

**Read first:** `design/lessons-first/briefs/README.md`; `design/LESSONS_FIRST_PLAN.md` §1.3 (pilot), §2.2 P4, §3 stage 1;
`design/lessons-first/QUEUE.md` units **G3-Y4.B4** and **G1-Y2.B1** (every lesson, its skills and options); `design/cards/facts/facts.md`
(signed 2026-10-31); `design/status/laned-restart.md` (hand-over 4, R4-1…R4-5 at lines ~636–641) and
`design/audit/runs/laned-restart/critic-r4.md`; `design/STATUS.md:697,705,710`; the skip-count branch
`origin/claude/sweet-newton-c8wrv1-skipcount-fix` @ 3bbbed3f and its `design/status/skip-count.md`;
`data/curriculum/links/Y4.json` steps Y4.B4.S1–S13 and its site lessons; `design/catalogue/mult-div-integers.md`.

**Branch:** `claude/sweet-newton-c8wrv1-lf-ops` from `origin/claude/sweet-newton-c8wrv1`; cherry-pick the skip-count fix
commits from `skipcount-fix` (7 ahead, ≈ 162 behind: merge conflicts in count-row files are yours to resolve) and the Lane D
support-aid work from `claude/sweet-newton-c8wrv1-laneD-restart` as its hand-over names.

**Files owned (operations lane, `build-list.js` LANES.operations):** `js/modules/gen-operations.js`, `js/modules/gen-mult-patterns.js`,
`js/modules/sheet/cells/{fact,family,equation,arrays,area-model,mult-grid,count-row,…}.js` as listed in LANES.operations,
`js/modules/sheet/providers/` files of these skills, `design/cards/count-row/` (new) and the facts card's open items.
**FROZEN_LANES includes operations:** new build entries are appended, never interleaved. Shared registries append-only;
registry additions through the manifest `design/lanes/lf-ops/manifest.json`; links files as README rule 8 says.

## Scope (main skills of the pilot and round 1, from the queue)
| Skill | Lessons it is main in | Known state |
|---|---|---|
| `division:div_facts` | 9 of the pilot's 17 | critic r4 FAIL on support-aid pages R4-1…R4-5 |
| `multiplication:count_by_tables` | G3-Y4.B4 S1, S2, S4, S7, S9, S10; G1-Y2.B1 | skip-count fix SC1–SC6 built, critic r6 held: no signed count-row card, three precritic reds (STATUS:697) |
| `multiplication:mult_chart` | S1, S6 (partial), BUILD lesson 4 | not redesigned |
| `multiplication:mult_properties` | S11, S12 (partial), BUILD lesson 3a | not redesigned |
| `multiplication:arrays_groups` | BUILD lesson 3a | not redesigned |
| `multiplication:mult_word_problems_plain`, `division:div_word_problems_plain` | BUILD lesson 7 | not redesigned |
| build entries `tables_links`, `div_by_itself`, `mult_three` | S6, S12, S13 | `div_by_itself` is a links-file proposal only: add it to `build-list.js` (append) |

## Steps (checks first)
1. **Cards:** draft the count-row card (`node tests/scripts/ws-spec-card.mjs`) and the open lines for mult_chart /
   mult_properties / arrays / word problems (on the facts card or a new `ops-tables` card), every undecided line with a
   suggested answer; send them to the lead **on day 1** for the owner's one sitting. Build nothing on an unsigned card;
   meanwhile do step 2.
2. **Checks first:** for R4-1…R4-5 and SC1–SC6 confirm each check exists and FAILS on the failed head (backtest rows); turn
   every finding of critic r4 and skip-count critic r5 that a machine can measure into a check. Run
   `ws-precritic --skill <every scope skill> --strict` and list every red row with its cause before fixing.
3. **Build / fix** each skill to the signed card; providers real (`workedSteps`, `wrongAnswer`, `misconceptions`, `strings` —
   the lesson compiler reads them); every option the pilot's lessons use (QUEUE.md lists them) honoured; "Highest number"
   and fact-set options obeyed (fold the all-skills check into this family, plan §2.3).
4. **Build entries** `tables_links`, `div_by_itself`, `mult_three` as presets / options / new skills per the owner rule
   (a distinct option is also a findable preset skill), each tagged in the same change.
5. **Clean before critic** on the branch merged with the integration tip; then one independent critic for the family
   (batch: every scope skill on every page type, S / M / L, keys, the three screen hosts, the option panel). PASS → add each
   passing skill to `redesign-passed.js` with its evidence line in the same commit.

## Gates
`ws-spec-card --check-signed` (each card), `ws-precritic --skill <scope> --strict`, `ws-content-audit --skill` each,
`ws-visual-quality --skill` each, `ws-simple-print --facts-print` (if facts-print-fix merged), `ws-screen-answer`,
`ws-presets-unit`, `ws-standards`, `ws-search-terms`, `ws-code-snapshot`, `ws-wrm --report-only`, `ws-wrm-page-unit`,
`ws-lessonfit`, `ws-redesign-passed`, `ws-backtest`, `ws-boot-smoke`, `ws-lessons-first-queue --check` (regenerate after
redesign-passed changes), `node --input-type=module --check` on every touched module.

## Hand-over
`design/status/lf-ops.md`: per skill PASS / FAIL with the critic file, the precritic table, costs, the speed-reflection lists, owner
questions. Tell the lead which pilot lessons are now unblocked (QUEUE.md "Ready" column after regeneration).
**Cap: $250** (≈ 12.5 %). Stop rules: README rule 11.
