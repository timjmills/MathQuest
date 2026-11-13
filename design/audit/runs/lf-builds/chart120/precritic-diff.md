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
