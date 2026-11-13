# lf-partopts step A, critic round 3 (independent)

Branch `claude/sweet-newton-c8wrv1-lf-partopts` @ de47257. I rendered everything myself.

- **UI:** Puppeteer (pre-installed Chromium, device scale 1) drove the real Print screen. Library lessons opened with
  `tvOpenPrintWith([{role:'lesson', lessonId}])`; skill lessons opened with the skill, then **Change → Lesson** by clicks,
  as a teacher does. Every state was reached BY STEPS with real clicks on the steppers and ticks (1280 in the full-width
  card, 390 in the section), the screen settling after every click.
- **Packets:** the teacher's own **Open in a new tab** document (pupil + keys) was captured, rendered in print media and
  measured with `ws-empty-band` `measureCells` / `judge`, plus each page's foot, overflow, cell overlap and the sheet text.
- **Script and raw log:** `critic-A-r3/crit.cjs`, `critic-A-r3/crit.log` (every click, every row text, every page).
  Screenshots are in `design/partopts/critic-A-r3/`.

Lessons used (20 packets, 23 screen walks):
- Y4.B1.S14 `nearest_10` (library) - M and L, standard, Vocabulary 0, two combinations, size change M → L, skill swap, 390.
- `skill:addition:add_wp_10` - L standard, L Vocabulary 0, M combination, Mixed ticked on at M and at L, 390.
- `skill:placevalue:identify` - M standard, M and L combinations.
- `skill:division:div_facts` - M and L combinations.
- **`skill:addition:fact_family_sort`** (no earlier round used it) - M standard, M and L combinations, 390.
- **`skill:subtraction:sub_wp_20`** (no earlier round used it) - L combination.

No lesson has a live Prerequisite Check today (`prereqsLive: false` on both lessons that list `prereqs`), so that row
never shows and could not be walked.

## Gates (final lines)

| Gate | Result |
|---|---|
| `node tests/scripts/ws-partopts-unit.cjs` (full) | FILL-BT, ROWFIT-BT, BAND-BT PASS · PO-2w 815 settled states in 52 cases · PO-2a-d, EB-ROWFIT, PO-NOROOM, PO-REM, PO-CAP, PO-VOC PASS · PO-2e We Do 7/52, Practice 52/52 · 1835 builds, 3763 s · **`ws-partopts-unit: OK`** |
| `node tests/scripts/ws-partopts-shots.cjs --out <scratch>` (committed shots untouched) | **`ws-partopts-shots: OK`** |
| `node tests/scripts/ws-code-snapshot.mjs` | **`ws-code-snapshot: OK (732 codes, 35 categories, +160 appended since the pinned baseline of 572, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, 3203 option round trips)`** |
| `node tests/scripts/ws-boot-smoke.cjs` | **`ws-boot-smoke: OK`** |
| Default identity: d34311d worktree (scratch) `ws-lesson-baseline --all-lessons --write`, then `--check` on HEAD | `wrote 1556 hashes` · **`ws-lesson-baseline: OK (1556 hashes identical)`** (worktree removed) |
| `ws-detailed-lesson --check --repeats`, the 7 detailed lessons | OK: g2-nbt3, g3-oa5, g3-oa9-input-output-rule, g3-oa9-mult-table-patterns, g4-nbt1. FAIL as on master: g1-oa1 (E9 overflow P6 +5 mm, E35), g3-oa8 (E35). |

## Scores

| Criterion | UI 1280 | UI 390 | Packets (6 lessons × M/L, 20 packets) |
|---|---|---|---|
| Clarity (UI) / C1 Ease of use | 8 | 8 | 9 |
| Correctness (UI) / C2 Educational value | **7** | **7** | 8 |
| Layout (UI) / C3 Spacing and layout | 8 | 8 | 8 |
| Consistency with mock and tokens (UI) / C4 Standard fidelity | 8 | 8 | 8 |

**VERDICT: FAIL (2 of 12 cells at 7, both UI correctness, from one regression: R1).** The packets pass at 8 or better on
every criterion. Every r2 finding is fixed on paper. The one 7 is a false caption the N5 fix put on the default Parts
table of every lesson whose rows have no room. R2 is a smaller false note of the same kind.

## r2 findings re-checked

| r2 | Status | Evidence |
|---|---|---|
| N1 freed height not returned to rows | **Fixed.** Y4.B1.S14 L Vocabulary 0 now prints a row of 3 (sheet 12 % empty, was 26 %); the combination (Vocabulary 0, Remember off, We Do 2) prints two rows (5 %). add_wp_10 L Vocabulary 0 prints one story row (1 %). Every rows-0 sheet I printed had a foot under one row. One near miss with rows ≥ 1: R3. | `r14-L-v0-p2.png`, `r14-L-combo-p2.png` |
| N2 Remember off moves the rule | **Fixed.** No "Rule:" strip and no rule text on any lesson sheet with Remember off (Y4.B1.S14 M / L / 390, add_wp_10 M, identify M / L, fact_family_sort M / L, sub_wp_20 L); fact_family_sort's Steps chant ("Two parts make the whole.") goes too. | `r14-L-combo-p2.png`, `ffs-L-combo-p2.png` |
| N3 false caption on the standard sheet | **Fixed.** Y4.B1.S14 L standard reads "two pages"; rows read "Fixed: 2 (fewer would leave the lesson sheet short)", no "fills the page". A 2-page Mixed says "two pages, the last under half full" (add_wp_10 L Mixed on). Every caption matched the preview's lesson-sheet pages in all 23 walks. | `crit.log` |
| N4 one-pair match | **Fixed.** Vocabulary steps 3 → 2 → 0 (or 3 → 0) everywhere; no 1 was offered in any walk. | `crit.log` |
| N5 hidden lock reasons | **Fixed** for ticked parts: "Needed to fill the sheet" is visible text at 1280 and 390. But see **R1**: the same text now shows on rows that are not printed. | `r14-390-M-combo-ui.png` |
| N6 range texts | **Fixed.** One form everywhere ("a to b units" / "n units", ", or 0 to leave it off" wherever the stepper reaches 0 and the tick is free, never "n a page"). | `crit.log` |
| N7 step walk | **Fixed** in the gate (PO-2w). My own walks reached the same kinds of state; none printed a failure the gate would miss, apart from R3. | |

r1 spot-checks (my own eyes):
- **F3 settings carry over:** after Vocabulary 0, Practice 30, Mixed 42 on Y4.B1.S14, swapping the skill to "Subtract within 100" brings Vocabulary back to 3, Practice to 6, Mixed to 12, with no Reset link.
- **F4 dead steppers:** none. Every − / + moved one offered value. − is disabled at the first value, + at the last, and + from 0 ticks the part again.
- **F7:** a "no room" row has no tick and no New numbers (but R1).
- **F9:** the full-width table at 1280.
- **F10:** one New numbers for the lesson sheet.
- **Key follows the pupil page:** in all 20 packets every key page matches its pupil page by sheet and cell count, and the keys carry the pupil page's numbers (`r14-L-combo-p10.png`).
- **No overflow and no overlap:** no page overflows, no cell is split, and no two cells overlap on any of the 200 pages printed (pupil and key).
- **Last pages:** every Practice / Mixed last page is at most 21 % empty, except the known master Mixed of add_wp_10 L (below).

## Findings

**R1 · MEDIUM · UI correctness (1280 and 390): a row that is not printed says it is "Needed to fill the sheet".**
- **Where:** the default Parts table of add_wp_10 (M, L), fact_family_sort (M, L), sub_wp_20 L, placevalue:identify M, and Y4.B1.S14 L after Vocabulary 2.
- **What it says:** "Lesson practice rows / **Needed to fill the sheet** / Not on this lesson sheet (no room)". The two lines contradict each other: the part is not on the sheet at all.
- **Evidence:** `wp10-L-std-ui.png`, `r14-sizechange-ui.png`.
- **Cause:** `js/modules/teacher-print.js:703`, `const locked = on && lim && lim.canOff === false;`, does not exclude `lim.none`. The N5 reason (`:706`) is written whenever `locked` is true, though the tick itself is hidden for `none` (`:704`).
- **Fix:** `locked` excludes `none`, so a no-room row shows only its "Not on this lesson sheet" text.
- **Check that would have caught it:** in `ws-partopts-shots` `textLint` (`tests/scripts/ws-partopts-shots.cjs:73`), the converse of the N5 lint: a row with no tick (`!r.tick`) or with "Not on this lesson sheet" text has no `.tv-part-lock`. PO-CAP in `ws-partopts-unit` could also judge the lock text against the build (no lock reason on a part the build does not print).

**R2 · MINOR · UI correctness: a clamp is reported as a rounding, with a false reason.**
- **Repro:** Y4.B1.S14 M, Mixed + to 42 (2 pages of 21), then Size L.
- **What it says:** Mixed shows 30 and "Rounded to 30 so no page is under half full" (`r14-sizechange-ui.png`).
- **What happened:** 30 is simply the most Mixed holds at L (15 to 30); no page would have been under half full. The note's reason is false.
- **Cause:** `js/modules/teacher-print.js:1236` writes the same reason for every snapped Practice / Mixed count.
- **Fix:** where the snapped value is the limit's max (or min), say "30 is the most at size L"; keep "so no page is under half full" for a true rounding between offered values.
- **Check:** in the PO-2w walk, after a size change (or any re-limit) with a count over the new max, assert that the note does not say "under half full" unless the asked count lies between two offered values.

**R3 · MINOR · packets C3: freed height can still leave a row-sized foot when the rows are already 1.**
- **Repro:** fact_family_sort M, by steps: Vocabulary 2, Remember off, We Do 0.
- **What prints:** the sheet prints one Independent row (3 triangles) and a **60.7 mm (25 %)** blank foot. One row of these cells is 59.5 mm (`ffs-M-combo-p2.png`). Rows read "Fixed: 1 (fewer would leave the lesson sheet short)", so the teacher cannot add the second row that fits.
- **Severity:** under the 30 % line, so not a gate failure. It is the N1 class one row up: EB-ROWFIT judges only sheets with rows 0.
- **Fix (judgement for the builder):** let the rows offer reach the count whose printed foot no longer holds a row, or keep it and accept the 25 % foot.
- **Check:** EB-ROWFIT+ in PO-2: on a lesson sheet whose rows are FIXED by the planner (`lim.fixed`, or `max` = the printed count), fail when the measured foot ≥ one row of its own cells (no head needed: the band exists). Report-only first, to see how many states it flags.

**R4 · MINOR (mostly pre-existing) · UI 390 layout: the page tabs push the screen sideways.**
- **What happens:** at 390 px the Print screen scrolls sideways by **10 px** on the standard packet. The same 10 px is on master d34311d: Y4.B1.S14 M, measured with `window.scrollTo(2000, y)` then `scrollX`.
- **How the lane makes it worse:** the scroll grows to **22 px** with Practice 30 and **31 px** with Mixed 42. The culprit is the preview's page-tab strip (`#tvPageTabs`, `.tv-seg`), which widens with each page; more pages is this lane's feature.
- **Why the gate misses it:** `ws-partopts-shots` measures only `.tv-section` descendants (`:179`).
- **Check:** after the max packet at 390, `document.documentElement.scrollWidth - innerWidth <= 0`. The tab strip wraps or scrolls inside itself.

Not findings (decided by the lead, or within the rules):
- We Do is mostly fixed.
- div_facts M freezes every lesson-sheet part (Vocabulary, Remember, We Do and rows are all "Needed to fill the sheet"). This is legal, but it leaves the teacher nothing to change on that sheet.
- Practice reads "in rows of 3" while its stepper moves a page (15) at a time in every lesson I walked. This is true (each value is whole rows) but slightly opaque.

## New master-only defects (identical on d34311d; not scored)

- **P4:** the `division:div_facts` anchor chart (Fixed: 1, "the chart's design") prints at M and L with **49 % (117 mm)** of the page empty under four worked steps (`df-M-combo-p1.png`). Its two step cells also carry EB-BAND 32.5 %. The standard packet is byte-identical to master (ws-lesson-baseline OK).
- **P5:** at 390 px the Print screen scrolls sideways by 10 px on master's standard packet (page tabs; see R4).
- Known and re-seen, not scored:
  - Y4.B1.S14 L standard sheet: 2 pages at 38 / 39 %.
  - add_wp_10 L Mixed: the last page 72 % empty. Ticked on from the skill lesson, it reads "10 problems, or 0 to leave it off · two pages, the last under half full" (`wp10-L-mixedon-p5.png`).
  - identify M standard sheet: 16 % foot.
  - Practice pv cells: EB-BAND 36-37 %.

## The three thresholds of §8d

**Soundly derived, with one caveat on the fill floor. The backtests do pin them.**

- **`SHEET_FILL_MIN` 0.76.**
  - FILL-BT pins the floor from both sides: [0.70 + the measured gap of identify M We Do off (0.052) = 0.752, the planned 0.762 of the good add_wp_10_plain L sheet]. 0.75 and 0.77 fail.
  - Its third assertion (add_facts M Vocabulary off, planned 0.712) pins nothing, since any floor above 0.712 passes it. The two-sided pin rests on the first two.
  - **Caveat:** the margin is the largest gap "within reach of the floor" (0.052), but the sweep's overall largest gap is 0.064. A sheet with that gap planned at 0.76 would print a 30.4 % foot. The derivation assumes the gap does not depend on where the sheet sits, and nothing tests that. The unit gate's EB-PAGE on every walked state is the backstop; none of my 20 packets broke it.
- **`ROWFIT_SLACK_MM` 12.**
  - ROWFIT-BT pins [10.2, 13.2) with a must-refuse sheet (expand L Remember off) and a must-keep sheet (value L rows 0). 10 and 14 fail.
  - The overlap (good sheets at gaps 3.7-10.2 mm) is resolved on the safe side: such values are refused, never offered with a blank foot.
- **`BAND_SLACK_MM` 2.**
  - BAND-BT pins [0.8, 2.6) with two div_facts M sheets. 0 and 3 fail.
  - Both sides come from one lesson. That is thin but honest: the derivation says rounding cells are not predicted at all.

I read the backtest code (`tests/scripts/ws-partopts-unit.cjs:455-510`) and saw it pass in the full run. I did not re-run the mutations (0.75 / 0.77, 10 / 14, 0 / 3).

## Checks this round adds to the ledger (one line per finding)

- R1: shots `textLint` converse: no `.tv-part-lock` on a row without a tick or with "Not on this lesson sheet".
- R2: PO-2w, after a re-limit, a "half full" note only for a count between two offered values.
- R3: EB-ROWFIT+ (report-only first): a planner-fixed rows count with a measured foot ≥ one more row of its own cells.
- R4: shots at 390 measures `documentElement.scrollWidth - innerWidth` after the max packet, not only `.tv-section`.

## Summary for the builder

Fix R1 (one condition at `teacher-print.js:703`) and R2 (the note at `:1236`), and add their two checks; then this step passes on my scores. R3 and R4 are minor: add their checks report-only and decide.
