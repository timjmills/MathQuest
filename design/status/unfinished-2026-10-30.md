# Unfinished work, lined up with the current plan (2026-10-30)

Verified against the code on 2026-10-30. Method: for each branch, every added source line (over 25 characters) was looked up in the same file on HEAD (`48fa04aa`), and `git merge-tree` against HEAD showed which files conflict. "x/y" below = added lines already on HEAD / added lines.

Owner request: "check all of the previous work that was unfinished to line it up with our current work if possible."

**Summary.** 21 remote branches are not merged into `origin/master` (fetched 2026-10-30, master at `433cbbd8`). Almost all are
September/October WIP saves from lanes the owner paused; master has moved on a long way since (Teacher site, sheet kit,
wave 0 process, 7 skills passed in `js/modules/redesign-passed.js`). Nothing should be merged wholesale. Two small branches
are worth taking (quiz multi-select, the four shape skills); the paused family lanes are worth *mining* when their family
comes up again, and every family lane that draws pictures should now wait for the representation-choice rule and the
graphic library that start today. Verdicts after the code check: MERGE 2 (bold-volta done as `48fa04aa`; fervent-brahmagupta), MINE 14, SUPERSEDED 4, DROP 1. Three verdicts changed: the wind-down snapshot `a3256` is the only copy of Lane D rounds 4-12 (MINE, not DROP); `af686` holds the Wave 1 Lane B answer-box option, which is not on master (MINE, not superseded: the "Lane B" that passed on master is Wave 0 lane B, a different lane); `wip-laneD` and `wip-laneB` are superseded by those two branches, not by master.

## 1. Branches not merged into master

Effort: S = under an hour, M = a lane round, L = a full lane.

| Branch | What | Checked against code | Verdict (changed?) | Where it goes | Effort |
|---|---|---|---|---|---|
| `bold-volta-ht8krw` | quiz multi-select | cherry-picked as `48fa04aa` | DONE | - | - |
| `fervent-brahmagupta-tlfbhw` | four shape skills on `shape-art.js` | `shape-art.js` absent on HEAD; data.js 0/12, skill-options 0/27, gen-geometry 5/47 lines present. Conflicts only in generated files, `index.html` (asset stamp) and `skill-codes-frozen.js` (append both) | MERGE (same): commits `b380d217`, `af18d8f0`, `da59b430`; regenerate catalogue/coverage, restamp, keep both frozen-code appends | Geometry family | M |
| `sleepy-pasteur-psyvgl` | Small fixes item 8, count rows wrap on screen | none of it is on HEAD: count-row.js 0/63, screen-cell.js 2/97, new gate `small-fixes-countrow-wide.cjs` absent. So even the r10 PASS code never reached master. Conflicts in 5 files | MINE (wider than before): code commits `84613f3e`, `e4aae4b5`, `40209b63`, `680d1bbc` (r7-r10, passed) and `f0d4a489` (r11 G1-G6, unverified); skip render/report commits | Small fixes queue | M |
| `...-wip-a3256e8dfc9684535` | wind-down snapshot | NOT just copies: it is Lane D rounds 3 to 12d (critic r3-r8 reports, r12 area-model kit cells, pool page judge, long-multiplication/parity/frac-wall/area-model-div cells, `ws-sheet-timing`, `ws-sheet-determinism`, `ws-key-letters` gates). Almost none on HEAD (practice.js 0/229, layout.js 1/133, print-sheet.js 16/1045). 19 source files conflict | MINE (was DROP): take Lane D from here, last critic r8 FAIL (`ffbe879f`); r12 commits are unverified. Start from `235d44b4` (r12d) and re-gate | Lane D restart (section 2) | L |
| `...-wip-adbb61b8450078736` | Fraction key r9 | `cells/fos.js` absent; utils.js 0/69, multi-select-check 3/53, review.js 2/121. 11 files conflict | MINE (same): `030fb05b`, `d5fa165f`, `db3bc33b`, `d45b3e22` and the r9 WIP `296146fc` | Fractions family | M |
| `...-wip-aea16a31534a8fe34` | steps-box note | 1 doc file, merges clean | SUPERSEDED (same) | - | - |
| `...-wip-af686f163db04a00a` | Wave 1 Lane B r2-r6: answer-box teacher option, strip entry | `skill-ansbox-skills.js` absent; no `ansBox` option in skill-options.js; screen-cell 8/241. 15 files conflict | MINE (was SUPERSEDED): `755cffc3`, `28f79e60`, `81405d61`, `7c29d978`, `e7a99aa1`, `041d2047`, `d5fbf5d5` | Screen hosts (Teacher site 2.0) / fact layouts | M |
| `...-wip-anchors` | worked-example anchors r2 | anchors.js 4/325; `ws-anchor-steps.cjs` absent; 6 conflicts | MINE (same) | Lessons engine / model page | M |
| `...-wip-countby-shrink` | PNG only | no source change | DROP (same) | - | - |
| `...-wip-detailed-lessons-2` | detailed lesson 6 | `lessons/detailed/g4-nbt1-ten-times-value.js` and `cells/pv-times.js` absent; code merges clean (only CLAUDE.md and STATUS.md conflict) | MINE (same, easy): `c2a6d8b4`, `f0990693`, `88f7d2d0` + research `9051b4f8`, `1f5ec74a`, rule `c922be81` | Lessons | M |
| `...-wip-figures` | figures r8 | figures cell 11/504, providers 22/273; 6 conflicts | MINE (same) | Data/graphs, after graphic library | L |
| `...-wip-fractions` | fractions r1 | gen-fractions 245/775, frac-model 9/429; `hundred-square.js`, `frac-text.js` absent; 12 conflicts | MINE (same, low value) | Fractions family | M |
| `...-wip-geometry` | geometry r2 | `gen-geo-kit.js`, `geo-compose.js`, `shape-figure/shape-fill/shape-grid/coord-grid/solid-kit` cells and 4 unit gates absent; 4 conflicts. Drop its `tests/scripts/tmp-*` files | MINE (same) | Geometry family | L |
| `...-wip-k2` | K-2 r? | `parity.js`, `frac-wall.js`, `picture-row.js`, `sort-rings.js` absent; k2 provider 16/594; 17 conflicts | MINE (same) | K-2 family | M |
| `...-wip-laneB` | Lane B r2 | ancestor of `af686` | SUPERSEDED by `af686` (was: by master) | - | - |
| `...-wip-laneD` | Lane D r3 | ancestor of `a3256` | SUPERSEDED by `a3256` (was: by master) | - | - |
| `...-wip-lessons` | lesson library phase 0 + LR-17 | NOT on HEAD: `lessons/library.js`, `seed-db.js`, `prereq-db.js`, `sheet/lesson-pages/*` (incl. `prereq-check.js`), `lesson-rules.js`, `tests/lib/browser-lock.cjs`, 4 lesson gates all absent. HEAD's `roles/pre-skill-check.js` is a different page (PAGE_TYPES 2.10, prerequisites = earlier skills in the category); no "LR-17" anywhere on HEAD | MINE (same, bigger): `cf428e41`, `ea22a97f` (LR-17), `ebcf82e7` (LR-18), phase 0.1-0.9 `669df31a`..`0e40332e`; 8 conflicts incl. roles/lesson.js | Lessons, after vocabulary redesign | L |
| `...-wip-operations` | ops kit cells | `gen-ops-build.js`, `fact-ladder/int-line/long-multiplication/share-plates` cells, `providers/integers.js` absent; 11 conflicts | MINE (same) | Operations family | M |
| `...-wip-placevalue` | pv r3 | gen-pv 50/529, pv cell 2/467, `ws-pv-deal.cjs` absent; 15 conflicts | MINE (same) | Place value family | M |
| `...-wip-teacher-ui` | old teacher home | teacher-print 16/338; `teacher-find.js`, `sheet/papers.js`, `prerequisite-skills.js` absent | SUPERSEDED (same): Teacher site 2.0 replaced the home. `sheet/papers.js` (paper sizes) worth a look if Letter/A4 comes up | - | - |
| `...-wip-wave0-process` | ws-spec-card informational block | ported: HEAD `ws-spec-card.mjs` lines 815-839 carry the same block, citing "W0-B fix 02c5308e, ported"; HEAD is the later version (diff is HEAD's newer code) | SUPERSEDED (same, confirmed) | - | - |

## 2. Paused lanes and logged-for-later items

| Item | What | State | Verdict | Where it goes in the plan | Effort |
|---|---|---|---|---|---|
| Lane D print backlog | fact/print layouts | r8 FAIL, paused | Restart as one lane with the ÷ facts item below | Fact layouts, before truly mixed pages | M |
| ÷ facts 10 columns, all three notations | owner now wants 10 columns in ÷, long-division bracket and fraction bar | logged | DO | Same lane as Lane D | M |
| Fraction key | key for fraction skills | r8 FAIL, paused | Restart after graphic library | Fractions family | M |
| Figures / Geometry / Place value / K-2 / Fractions / Anchors | family grade runs | paused | Re-run each as a family lane, mining its branch | Family lanes, after representation rule + graphic library | L each |
| Error analysis, EA1 | error-analysis role | not passed | Rebuild with the misconception lists | After vocabulary redesign | M |
| Guided, W1, ST1 | guided / worked / stretch role items | open | Fold into the page-role pass | Page roles, after graphic library | M |
| Skip-count | merged without critic r5 | not passed | Run the missing critic round only | Build-speed process (cheap close-out) | S |
| White Rose page | merged without critic r9 | not passed | Run the missing critic round only | Teacher site 2.0 | S |
| WRM Y4 site lessons | owner accepted 7.96 | not passed | Owner decision: accept as done or one fix round | Lessons | S |
| Detailed lessons 6-10 | lesson 6 paused at fix r3 | open | Resume from the branch | Lessons, after vocabulary redesign | L |
| Teacher screens audit, Option panels | not passed | open | Fold into Teacher site 2.0 critic | Teacher site 2.0 | M |
| Whole-grade print slow | performance | logged | DO (profile `buildSheet`) | Teacher site 2.0 (grade print) | M |
| tape_diagram overflow | cell overflows | logged | Fix in the graphic library (tape is a library drawing) | Graphic library | S |
| 44 presets with the wrong instruction key | presets read the host's instruction | logged | DO, add a machine check | Build-speed process | S |
| sub_facts S H13 | size S fails H13 | logged | DO with Lane D | Fact layouts | S |
| BACKLOG ops/timemoney/pv items | div_remainders counters, nl_sub repeats, money_compare panels, pv wording, support ladder multi-slot, double edge | open | Assign to their family lanes; support ladder + double edge to Teacher site 2.0 screen hosts | Family lanes / screen hosts | M |
| ws-teacher-shell first-run flake | gate flakes on first run | logged | DO (warm-up or retry with cause) | Build-speed process | S |
| ws-backtest fixture needs full clone | fails on shallow clone | logged | DO (fetch the needed commits or skip with a message) | Build-speed process | S |
| Draft PRs #13, #14, #18 | from the branches above (wip lanes) | open drafts | Close each with a note pointing to this file once its branch is mined or superseded | Housekeeping | S |

## 3. Order against the current plan

1. **Now (no dependency on the visual work):** build-speed fixes (presets key check, teacher-shell flake, backtest fixture), the two MERGE branches, missing critic rounds for Skip-count and White Rose page.
2. **With Teacher site 2.0:** whole-grade print speed, support ladder on worksheet/quiz hosts, double edge, option panels.
3. **Before truly mixed pages:** Lane D + ÷ facts 10 columns + sub_facts H13; operations lane (mine its branch); K-2 mixed_composing.
4. **After the representation-choice rule and graphic library:** tape_diagram, Fractions + Fraction key, Geometry (+ shape skills drawings), Figures, Place value, Anchors, guided/stretch roles.
5. **After the vocabulary redesign:** error analysis, detailed lessons 6-10, Prerequisite Check.

## Do first

1. Cherry-pick the quiz multi-select fix (`bold-volta-ht8krw`): a live bug, one commit.
2. Fix the 44 presets with the wrong instruction key and add the check.
3. Fix the two gate flakes (ws-teacher-shell first run, ws-backtest shallow clone) so every lane stops losing time to them.
4. Lane D restart with ÷ facts in 10 columns in all three notations, plus sub_facts S H13.
5. Merge the four shape skills (`fervent-brahmagupta-tlfbhw`) with regenerated catalogue files.
6. Run the missing critic rounds for Skip-count and the White Rose page.
7. Profile and speed up whole-grade print.
8. Operations family lane, mining `wip-operations`, as the first family lane after the graphic library.

## Owner decisions needed

- WRM Y4 site lessons at 7.96: count as done, or one fix round?
- OK to close draft PRs #13, #14, #18 and delete the DROP branches (or keep them as archives)?
- Should the shape skills merge now, or wait for the graphic library so their drawings are made once?

## Wind-down note, 2026-10-30 23:20 UTC

- **Visual quality + graphic library** (owner ask 3) and **fast PDF previews** (owner ask 2): **not started.** Both agents
  were stopped at 16:31 by the owner's "STOP… wait" and were never restarted. The worktree `/home/user/mq-visual`
  (branch `visual-quality-wip`) has no commits beyond the base. First jobs tomorrow, after the lessons 6/7 share-link fix:
  1. the visual investigation (why answer areas look unpolished, e.g. "Addition Word Problems (within 20, No Pictures)";
     a number-family drawing for "Is It a Fact Family?"), revising the MD guidance and starting the graphic library;
  2. fast PDF previews of printouts.
- Lane D (session_013pHDnLXQQUYhTy6YS4oDjX) is still merging main and running its critic. It goes live only once the
  owner signs `design/cards/facts/facts.md`.
- **Lane D result (02:08 UTC):** critic r1 FAIL on all four fact skills. The fact rows passed: + − × at 9, ÷ sign at 9 (10 columns),
  fraction form at 8. Blocking: R1-1 (the long-division arc touches the dividend, so "4)8" reads as 48), R1-6 (the add_facts lesson
  warm-up overflows, a regression), R1-2/R1-16 (the Mix grid is uneven), R1-15 (fraction form L, "110" sits in the tab keep-out), plus
  shared-role defects. Branch `claude/sweet-newton-c8wrv1-laneD-restart` @ d608126d, draft PR #25 (do not merge). Hand-over:
  `design/status/laned-restart.md`; report: `design/audit/runs/laned-restart/critic-r1.md`. Owner decisions: the facts card Q1–5;
  the div_zero_in_quotient deal; whether the shared-role defects gate the family.
- **All lanes stopped.** Spend 2026-10-30 ≈ $606 ≈ 21.6 % of the weekly limit.
