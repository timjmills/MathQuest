# Unfinished work, lined up with the current plan (2026-10-30)

Owner request: "check all of the previous work that was unfinished to line it up with our current work if possible."

**Summary.** 21 remote branches are not merged into `origin/master` (fetched 2026-10-30, master at `433cbbd8`). Almost all are
September/October WIP saves from lanes the owner paused; master has moved on a long way since (Teacher site, sheet kit,
wave 0 process, 7 skills passed in `js/modules/redesign-passed.js`). Nothing should be merged wholesale. Two small branches
are worth taking (quiz multi-select, the four shape skills); the paused family lanes are worth *mining* when their family
comes up again, and every family lane that draws pictures should now wait for the representation-choice rule and the
graphic library that start today. Verdicts: MERGE 2, MINE 12, SUPERSEDED 5, DROP 2.

## 1. Branches not merged into master

Effort: S = under an hour, M = a lane round, L = a full lane.

| Branch | What / last commit | State | Verdict | Where it goes in the plan | Effort |
|---|---|---|---|---|---|
| `bold-volta-ht8krw` | 2026-10-17 quiz answers "Click ALL ..." items with multi-select tiles; 1 commit, 6 files | `quiz-take.js` on master has no multi-select support, so the bug is still live | MERGE: cherry-pick the one commit onto a fresh branch, rerun boot smoke + a quiz browser check | Teacher site 2.0 (quiz host); before truly mixed pages, which will mix these items in | S |
| `fervent-brahmagupta-tlfbhw` | 2026-10-17 four searchable shape skills on `shape-art.js` (3 commits) | `shape-art.js` not on master; diff touches the generated catalogue (7k lines) | MERGE carefully: take `shape-art.js`, data.js, gen-geometry, skill-options, standards, wrm, search-terms, skill-codes-frozen; REGENERATE the catalogue/coverage files instead of merging them; check the code snapshot only appends | Geometry family; drawings must then be checked against the new graphic library | M |
| `sleepy-pasteur-psyvgl` | 2026-10-17 Small fixes item 8 rounds 8-11 (r11 FAIL G1-G6); 10 commits, 253 files (mostly renders) | Small fixes lane PASSED at r10; r11 findings open | MINE: the code commits for G1-G6 only, skip the render PNGs | Build-speed process "small fixes" queue | S |
| `...-wip-a3256e8dfc9684535` | 2026-10-17 "WIP at wind-down (unverified)"; 122 commits, 1968 files | Huge unverified wind-down snapshot; most of it is the other WIP branches and renders | DROP (keep the branch as an archive; mine from the named lane branches instead) | none | - |
| `...-wip-adbb61b8450078736` | 2026-10-17 Fraction key helper paused (critic r8 FAIL) | Paused, not passed | MINE: the key-rendering fixes | Fractions family lane, after the graphic library (fraction bars/circles are library drawings) | M |
| `...-wip-aea16a31534a8fe34` | 2026-10-09 Steps-box gate results note, 1 file | Steps box PASSED on master | SUPERSEDED | - | - |
| `...-wip-af686f163db04a00a` | 2026-10-09 Lane B r6 (answer strips, page fill) | Lane B passed later on master (wave 1) | SUPERSEDED (check `git log` for "Lane B r6" only if a strip bug reappears) | - | - |
| `...-wip-anchors` | 2026-09-26 worked examples anchor-r2 fixes | Anchors not passed, paused | MINE: "real-move stack examples" + key-safe generators | Lessons engine / model page role; after the vocabulary redesign | M |
| `...-wip-countby-shrink` | 2026-10-03 WIP save, 37 files, 0 line changes (PNG only) | Renders only | DROP | - | - |
| `...-wip-detailed-lessons-2` | 2026-10-17 lesson 6 fix round 3 paused | Detailed lessons 6-10 not done | MINE: lesson 6 work as the starting point | Lessons lane, after vocabulary redesign (lessons use the new word list) | M |
| `...-wip-figures` | 2026-09-26 figures-r8 fixes done, final re-render pending | Not passed (8 rounds) | MINE: graph-row width fix | Data/graphs family; depends on graphic library | L |
| `...-wip-fractions` | 2026-09-26 fractions-r1 fixes started, unverified | Not passed | MINE (low value, unverified) | Fractions family, with the Fraction key branch | M |
| `...-wip-geometry` | 2026-09-26 geometry-r2 footprints (shape-figure beside layout) | Not passed | MINE: beside-layout footprints | Geometry family, with the shape skills above; depends on graphic library | L |
| `...-wip-k2` | 2026-09-26 odd_even parity cell, compose_whole frac-wall; mixed_composing S H13 open | Not passed | MINE: parity cell + frac-wall; fix S H13 in the lane | K-2 family; truly mixed pages need mixed_composing | M |
| `...-wip-laneB` | 2026-10-02 Lane B r2 + answer-box teacher option | Lane B passed on master | SUPERSEDED | - | - |
| `...-wip-laneD` | 2026-10-03 Lane D r3: rows share the page, boxed fact answers | Lane D print backlog paused at r8 FAIL; this is older | SUPERSEDED by the later Lane D rounds; the open issue is the r8 FAIL itself (section 2) | - | - |
| `...-wip-lessons` | 2026-09-26 Prerequisite Check part (LR-17), 25-seed gate to triage | Lessons engine passed later; LR-17 status unclear | MINE: LR-17 if master has no Prerequisite Check part | Lessons lane | S |
| `...-wip-operations` | 2026-09-26 ops lint fixes: add_sub_10s/100s, missing_* and div_zero_in_quotient to kit cells | Matches the BACKLOG ops list, still open | MINE: these cell moves | Operations family lane (first of the family lanes; fact skills feed truly mixed pages) | M |
| `...-wip-placevalue` | 2026-09-26 pv-r3 fixes, renders/gates not re-run | Not passed | MINE: layout/deal/wording fixes | Place value family; base-10 blocks depend on graphic library | M |
| `...-wip-teacher-ui` | 2026-09-26 teacher home six actions, one find bar | Teacher site 2.0 replaced this home | SUPERSEDED | - | - |
| `...-wip-wave0-process` | 2026-10-23 ws-spec-card unhashed options block (7b) | master's `ws-spec-card.mjs` already has the informational block (S1 fix 2026-10-24) | SUPERSEDED (diff once to confirm the 64 backtests are on master) | - | - |

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
