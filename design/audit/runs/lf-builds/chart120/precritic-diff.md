# chart_120 fix — precritic diff, branch vs clean master

Branch `claude/sweet-newton-c8wrv1-lf-builds` (HEAD 929a65d6e), merged with `origin/master` 1db0e3309. Master baseline =
a clean `origin/master` worktree (first 8a50aa9d9, then 1db0e3309) with the signed card `design/cards/chartwindow/`
copied in so its render plan matches the branch's. Logs under `logs/`.

**Lead rule applied:** a red gate on master is baseline only when the count is IDENTICAL on the branch and pinned with
evidence; any count that rises is the lane's. No sibling exemption (L23). Every finding that was NEW on the branch is
fixed at the root, with a check that FAILS on the bad commit and PASSES on the fix, a backtests.json row ws-backtest
proves, the check on precritic's path, and a row in `design/lessons-first/CHECKS_FROM_CRITICS.md`.

## Findings new on the branch, each closed

| Finding (gate) | Root cause | Fix | Check / backtest row (FAIL→PASS) | On precritic path |
|---|---|---|---|---|
| node-lint LESSON-DATA (both skills) | no authored lesson; the Count on to 120 lesson is the engine's | card §7a `role:lesson` signs the fallback warm-up; pinned in node-lint-s1.baseline.json with evidence | pinned baseline (reads `PASS (baseline)`) | yes (ws-node-lint --rules) |
| empty-band EB-FOOT 60 (chartwindow independent/more-practice M,L) | the tool read a CENTRED cell's row stretch as drawn height (`justify-content: safe center`) | ws-empty-band subtracts the centring from EB-FOOT and counts the white above+under as one EB-BAND band | eb-centred-band (fixture fail.json 42 % FAIL → pass.json 23 % OK) + --self-test | yes (ws-empty-band) |
| cell-checks OVERFLOW, lesson {band:10}/{grid:rows} | the fallback lesson drew a 170 mm row of ten in a 92 mm anchor-chart panel and beside the Steps | lesson.js `chartDataOf`: a fallback lesson whose example is wider than half the page takes `chartWide` | c120-lesson-wide (e3733905c FAIL → 032e07ec6 OK) | yes (cell-checks --variant band=10) |
| cell-checks TAGINK 4–8 (error-analysis L) | the A/B tag sat on the written number's text box | css/sheet-kit.css gives a lettered chart square its tag's height of top room | c120-tagink (e3733905c FAIL → ac88be08e OK) | yes (cell-checks --card) |
| empty-band EB-EDGE 1 / cell-checks WRONG-FITS (true-false L) | 'writes-ten-ten' distractor 1011 = 4 digits, printed "1,011" over the next square | the chart square no longer deals writes-ten-ten; WRONG-FITS judges a chartwindow payload (one value per square) | c120-wrong-fits (e3733905c FAIL → ac88be08e OK) | yes (ws-node-lint WRONG-FITS) |
| cell-checks KEYFIT / TITLE (lesson {band:120}) | band-120 title said "a hundreds chart"; the window squeezed beside the Steps so the key 101 left its square | print-sheet reads the band for the I Can; chartwindow states its true width (inkWMm) so a window past 100 never squeezes | c120-title-band (e7d3e8d8c FAIL → 72396d8a7 OK) | yes (cell-checks --variant band=120) |
| cell-checks LONE-PAGE (reason-it) | a window past 100 stacked A over B full width, one item a page | chartwindow inkWMm → reason-it UNDER layout (A|B at half the cell each, response under) | c120-ri-under (e7d3e8d8c FAIL → 72396d8a7 OK) | yes (cell-checks reason-it) |
| cell-checks PUPILTAG (error-analysis) | the "Sam wrote:" label sat 6.5 mm over the chart (PT-ERR-4 wants 2–4) | css/sheet-kit.css drops the chart's letter keep-out inside `.mq-judge-work` | c120-pupiltag (e7d3e8d8c FAIL → 72396d8a7 OK) | yes (cell-checks --card-opts) |

## Lead rulings 2026-11-13 (design/decisions/LEAD_DECISIONS.md, 7f718a827) — the five OPEN items

| # | Item | Ruling | Done (commit) |
|---|---|---|---|
| 1 | cell-checks OVERFLOW grid=whole / rows on lesson (24 / 18) and guided (8-12), LONE-PAGE grid=whole on test (3) | grid=whole / rows HIDDEN on lesson, guided, test; offered on independent, more-practice, print | **CLOSED** 25e62c6d6: card §7a role-scoped hidden decision (`roles`, rulings block `N-D-grid-roles-1`); `skill-options.js` `hiddenOnRoles` + `optsForRole`, applied in `print-sheet.js` normaliseRequest, so those roles fall back to the window. New check **ROLE-HIDDEN** `ws-role-hidden` (generic: every card's role-scoped hidden decision; the role's page with the value byte-identical to its page with the default, a control role must differ) — backtest `c120-role-hidden` (e1389d1f3 FAIL → 25e62c6d6 OK), precritic row `role-hidden`; `ws-card-rulings --check offered` holds `hiddenOnRoles` to the card; CHECKS_FROM_CRITICS row. The cell-checks OVERFLOW / LONE-PAGE rows clear (precritic r5 below) |
| 2 | empty-band EB-BAND 2 (guided M/L, the Model-row try) | shared Guided layout | **ROUTED to lf-roles** (not this lane): any skill whose tries are shorter than its Model; the window cannot grow |
| 3 | empty-band EB-SIDE 4 (review S, pre-skill-check S) | known master debt | **ROUTED to lf-roles**: the `counters` cells of the earlier skills (count_objects, 30 % of the width), line-identical on master; not chartwindow |
| 4 | sibling-compare NO-SIBLING (13 matrix rows) | the critic grades the named pages | **SKIPPED** (first family on the chartwindow template, process rule 2026-11-07): the lane lists the pages, the critic grades them; passing adds them to siblings.json |
| 5 | writes-ten-ten (110 → 1010) dropped from the chart square | RE-SCOPED, not dropped | **CLOSED** 25e62c6d6: provider `wrongText` (contract OPTIONAL_MEMBERS) — Reason It's TEXT form (the chart once above, A / B 'The missing number is 110.' / '… 1010.', answer slot as wide as four digits, `data-ws-misc`); the screen practice card names the error when 1010 is typed (`gen-counting` distractorTags); never in a chart square. Card §3 note, §6 M-C1 `textOnly`, §5.5. New check **TEXT-MISC** `ws-text-misconception` (REACH-SCREEN, REACH-TEXT within 16 seeds; SQUARE: no written number wider than its window's widest number on reason-it / error-analysis / true-false) — backtest `c120-text-misc` (e1389d1f3 FAIL → 25e62c6d6 OK), precritic row `text-misconception`, CHECKS_FROM_CRITICS row |

Card: `card.json` decisions / M-C1 / §3 note / three 2026-11-13 rulings; `ws-spec-card --template chartwindow --resign` run once (commit 25e62c6d6); `--check-coverage` OK; `--check-signed` fails only "needs owner signature". Not signed by the builder.

## Tool gaps found and fixed on the way

- **ws-card-plan** now plans a PRESET skill from its host's signed card (roles, hosts, the host's other option values over the
  preset's). Before, `composing:chart_to_120` fell back to 9 default roles and no option values, so opener / scripted-model /
  pre-skill-check / mixed-practice / stretch and grid=rows / whole at band 120 were never rendered before a critic (L25).
  Self-test case added.
- **ws-cell-checks** gained `--variant id=value` (one option value's pages on precritic's own plan, for a backtest).
- **ws-empty-band** gained `--judge-fixture` (judges measured cells with no browser, for the centred-cell backtest).

## Lesson baseline

`ws-lesson-baseline --all-lessons --check` vs a FRESH master baseline (1db0e3309): **1732 hashes identical** — no live
packet moves. (An earlier check against a stale baseline from 8a50aa9d9 showed 1184 differences; those were the master
merge's own deploy-4 reason-it/lesson rewrite, not this lane's changes. reason-it.js on the branch differs from master by a
comment only.)

## Precritic r5 / r6 on the fix (HEAD 65166e942 for chart_to_120, a90fd31ff-era code for hundreds_chart_fill)

r5 found one new item on chart_to_120 — the new Reason It TEXT form ran out of its cell at M / L (cell-checks and render-gate
OVERFLOW 8, the two statements side by side): fixed in 65166e942 (A over B, the response beside them); r6 clean, and the
hundreds_chart_fill band=120 thinking roles re-checked clean (`logs/r6-hcf-band120-thinking.log`).

| Gate | hundreds_chart_fill (r5) | chart_to_120 (r6) | Verdict |
|---|---|---|---|
| cell-checks --card --card-opts | PASS | PASS | OVERFLOW lesson / guided and LONE-PAGE test cleared (ruling 1) |
| role-hidden (new) | PASS (6 fall back, 2 controls) | PASS | ruling 1 |
| text-misconception (new) | PASS (N/A reach: band 100) | PASS | ruling 5 |
| card-not-offered | PASS (N-D-grid-roles-1) | SKIPPED (no block names the preset) | as before for the preset; ws-role-hidden covers its deal |
| render-gate (+ card roles) | PASS | PASS | |
| empty-band | FAIL 6: EB-BAND guided M/L (2), EB-SIDE review / pre-skill-check S (4) | FAIL 11: EB-BAND guided M/L (2) + lesson S/M/L p1 cells 1, 2, 4 (9) | guided + EB-SIDE: ROUTED to lf-roles (rulings 2, 3). The 9 lesson lines (template-less cells of the engine's Count on to 120 lesson page, 30-35 % under the ink) are line-identical on e1389d1f3 (`/tmp` precritic of that commit, pc-c120-final): not this fix's; not on the earlier OPEN list — **for the lead to route** (lesson engine page) |
| sibling-compare | FAIL (13 NO-SIBLING) | FAIL (NO-SIBLING) | SKIPPED by ruling 4: the critic grades the named pages |
| spec-card-signed | INCOMPLETE (needs owner signature) | N/A (preset not on the card's §1) | |
| every other gate | PASS | PASS | |

## Owner plan 2026-11-13 (master 3c84e320 / 76bc11c6): no phone width, no print size S

- **Size S dropped** (sizes M and L only): S-only findings no longer count and are recorded here as **out of scope**:
  EB-SIDE 4 (review S, pre-skill-check S; `counters` cells) — was routed to lf-roles as master debt, now out of scope.
  The lesson EB-BAND lines and the guided EB-BAND lines are at M/L too, so they stay as listed above.
- **390 px dropped**: `card-390.png` is replaced by the card at 820 (`card-820.png`); `independent-S.png` by `independent-M.png`.

## Diagnosis 2026-11-13: lesson EB-BAND p1 cells 1, 2, 4 (M / L): ROUTED to lf-engine

The 9 lines are the Count on to 120 lesson's **anchor-chart page** (`js/modules/sheet/lesson-pages/chart.js` `chartPage`, the
shared lesson engine): a 2 x 2 grid (`.ws-grid.mq-chartgrid`) of four state panels (`.mq-cstatecell`, no `data-ws-cell`
template: they are the engine's own panels around the chart drawing). Measured on the branch head (probe: buildSheet
`role: lesson`, seed 1; chartPage's sizing values read by a temporary log, reverted, never committed). M and L are identical
(the page sizes from its own body room; mode `one`, zoom z = zMax = 1):

| Panel | Asked (base = hOf(state) + 1) | Drawn (ink bottom + 3 mm pad) | Planned row (rowH) | Row on the page | White | Share |
|---|---|---|---|---|---|---|
| 1 "The number before is 91." | 82.3 mm | 80.3 mm | 109.75 mm | 114.5 mm | 34.5 mm | 30.1 % FAIL |
| 2 "One more is 92." | 77.1 mm | 75.0 mm | 109.75 mm | 114.5 mm | 39.7 mm | 34.7 % FAIL |
| 3 "The number below is 102 ..." | 89.9 mm | 87.9 mm | 109.75 mm | 114.5 mm | 26.6 mm | 23 % ok |
| 4 "Write 92." | 77.1 mm | 75.0 mm | 109.75 mm | 114.5 mm | 39.7 mm | 34.7 % FAIL |

- **The cell is correct:** each panel asks 2.0-2.1 mm more than it draws (the engine's own +1 mm and line rounding, 2-3 %,
  inside EB-FOOT's 10 %). The chartwindow drawing does not over-ask; no chartwindow / provider change can remove the white.
- **The page's row sizing stretches it:** `rowH = max(H(z), min(room / rows, 1.25 H(z)))` = min(219.5 / 2, 1.25 x 89.9) =
  109.75 mm, then `fill` (rows x rowH >= room - 2) hands the grid the whole body by flex, 114.5 mm a row. Every panel takes
  its row's height, so the panels 7-13 mm shorter than the tallest (panel 3) cross 30 %. Not in chartwindow's files; the
  lane does not change shared lesson code (brief).
- **Routed to lf-engine** (lesson engine page, `chartPage` grid sizing): the pages are composing:chart_to_120 lesson M p1
  cells 1, 2, 4 and lesson L p1 cells 1, 2, 4 (S out of scope). Suggested root fixes for the engine: size each row to its
  tallest panel without the 25 % growth when the panels of a row differ, or let the spare go to the chant / Say band, or
  top-align shorter panels with a shared drawing baseline so the white is not counted as one band per panel.

## r8 2026-11-13: merged origin/master e76e0815f (merge a0ca6e221), HEAD after this section

**Merge.** Conflicts kept from both sides: ws-empty-band (master's pixel read + the lane's centred-band rule, now RULE_CASES
`EB-BAND (centred)` with row eb-centred-band and `--judge-fixture`; the centred band = the row's stretch above the flow, read
in the DOM inside the padding, + the white under the ink: the pixel band above ran over the letter label's rows), ws-card-plan
self-test (both cases), backtests.json (union by id), CHECKS_FROM_CRITICS (both sides' rows). Every merged JS file passes
`node --check`; ws-conflict-markers OK.

**lf-roles critic r8b items (coordinator), fixed at the root (280161c7e):**
- D5 GUIDED-MODEL-ECHO (not on master; built here, `tests/scripts/ws-guided-echo.cjs`): the generator's `dupKey` is the chart
  window, so no page deals a window twice while another is left. Backtest c120-guided-echo (a0ca6e221 FAIL: guided L seeds 3,
  7 → 280161c7e OK).
- n5 SCORE-SLOTS (same tool): chartwindow footprint `points` = its empty squares (`slotPoints`); `error-analysis.js` keeps one
  judgement a cell for a `slotPoints` template (one additive line in a shared role: lf-roles please review). Backtest
  c120-score-slots (a0ca6e221 FAIL → 280161c7e OK). Both on precritic's path (gate `guided-echo`), ledger rows added.
- The card-plan ledger row now carries backtest c120-card-plan-preset (each tree's own planner, f80dfd9d6 FAIL → a810a6cbc
  OK) with a reasoned exemption (a planner fix: precritic always runs today's planner). ws-backtest: 12 lane rows PASS
  (`logs/backtest-r8.log`, `logs/backtest-card-plan.log`); ws-precritic-plan OK.

**Gates on the merged head:** boot-smoke OK; code-snapshot OK (735 codes, 35 categories); lesson-baseline `--all-lessons
--sizes M,L --seeds 4242,1 --per-lesson --check` against a FRESH baseline written on origin/master e76e0815f: **1732 hashes
identical** (no lesson page moves); spec-card `--check-signed` chartwindow: **FAIL** (master changed rule CL-4b at
WORKSHEET_DESIGN_STANDARD.md:368 since the card was signed, so the card must be re-generated with `--resign` and re-signed by
the owner; not done by the builder).

**Precritic r8 (`logs/pc-c120-r8.txt`, `logs/pc-hcf-r8.txt`) + empty-band re-run at M/L after the centred-band read
(`logs/empty-band-r8-ML.log`). Size S and 390 px lines are out of scope (owner plan).**

| Gate | chart_to_120 | hundreds_chart_fill | Verdict |
|---|---|---|---|
| empty-band EB-BAND independent / more-practice M,L | PASS (after 7ed8e48ac) | PASS | — |
| EB-BAND lesson p1 cells 1, 2, 4 (M, L) | 6 | — | **ROUTED lf-engine** (diagnosis above: chartPage row sizing) |
| EB-BAND lesson L p2 chart cells (28.6-30.5 %) | 2 | 3 (+1 counters 28.7 %) | **ROUTED lf-engine**: the lesson packet's practice rows stretch a centred window (84.7 mm row, window about 59 mm); 28-30 % lines fail only under precritic's `--margin 2` |
| EB-BAND guided M / L cell 2 (46 % / 41 %), hcf guided M Model 32.6 % | 2 | 2 | **ROUTED lf-roles** (ruling 2). GUIDED-MODEL-ROW is on lf-roles' branch, NOT on master e76e0815f (`git grep` finds it only on origin/...-lf-roles), so the merge does not clear it |
| EB-GDPCAP guided L: 7 scored answers > ceiling 6 | 1 | — | **ROUTED lf-roles**: new with SCORE-SLOTS - the page always held 7 answers, but the Score counted 3 windows. guided.js `ceilFor` counts answers only when EVERY item scores > 1 (`pointsOf`); a chart page mixes 1-3 squares. The ceiling in answers belongs to the Guided plan |
| EB-ROLE stretch M, L (card offers it; the app cannot compose it) | 2 | 2 | **for the lead / owner**: a card decision (stretch → out of scope), which needs the re-sign anyway (CL-4b) |
| EB-PAGE pre-skill-check p1 42-55 % empty (M, L) | 2 | 2 | **ROUTED lf-roles** (pre-skill-check page fill, `--page-fill` now on precritic's path) |
| screen-slots SCREEN-DIGIT 820 / 1280 (numerals 29-34 px, want 48 / 56) | 6 | 6 | **LANE-OWNED, OPEN** (lead 2026-11-13, 11867f3f3: on by default, "a red goes to the owning lane, never a pin"): the chart window's screen numerals are capped by `css/screen-cell.css` `min(..., 4vw)` and drawn at weight 400. Not fixed in this round: blocks the critic |
| sibling-compare NO-SIBLING | FAIL | FAIL | SKIPPED by ruling 4 |
| spec-card-signed | N/A (preset) | FAIL | owner re-sign (CL-4b changed on master) |
| checks-from-critics | FAIL → OK after the card-plan row | OK | fixed |
| guided-echo (new) | PASS | PASS | — |
| every other gate | PASS | PASS | — |
