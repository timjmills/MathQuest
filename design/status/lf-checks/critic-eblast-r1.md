# Critic eblast r1 — EB-LASTPAGE + CAP-PARITY (ws-empty-band --page-fill)

Independent critic (Opus medium), 2026-11-19. Graded `git diff 448bc5e74..2225965ce` on claude/sweet-newton-c8wrv1-lf-tools-eblast.

**Verdict: FAIL** — C1 6, C2 6, C3 5, C4 7.

## Runs
- `ws-empty-band --self-test`: OK (EB-LASTPAGE 6 + CAP-PARITY 5 cases).
- `ws-backtest --row eb-lastpage-cbt-pre-skill-check,cap-parity-cbt-pre-skill-check`: 2 PASS (FAIL 3038af154 pre-skill-check, OK 3038af154 other roles).
- `ws-precritic-plan --checks-from-critics`: OK (298 pass, 82 exempt, 0 fail).
- `ws-empty-band --skill addition:add_facts,subtraction:sub_facts,placevalue:value --hosts none --page-fill --no-baseline --only EB-LASTPAGE,CAP-PARITY`:
  **FAIL (7)** on three PASSED skills:
  1. add_facts pre-skill-check M p1: 78 % empty (187.4 mm, row 42.6 mm) — EB-LASTPAGE
  2. add_facts pre-skill-check L p1: 78 % (185.4 mm) — EB-LASTPAGE
  3. sub_facts pre-skill-check M p1: 78 % — EB-LASTPAGE (**not in the status note**)
  4. sub_facts pre-skill-check L p1: 78 % — EB-LASTPAGE (**not in the status note**)
  5. placevalue:value pre-skill-check L p2: 45 % (107.2 mm, row 44.1 mm) — EB-LASTPAGE (**not in the status note**)
  6. placevalue:value pre-skill-check M/L: L 3 vs M 6 a page — CAP-PARITY (**not in the status note**)
  7. placevalue:value mixed-practice M/L: L 10 vs M 21, "L page not full" — CAP-PARITY (**likely false red**, see F1)

Reds 1-4 are real against PT-PRE-1/2 (four quadrants filling the 236 mm body; one prerequisite = one quarter of a page).
Reds 5-6 are real (a pre-skill check of at most 16 items spills to two pages at L). Red 7 is not proven.

## Findings
- **F1 (C1, C3) "another row fits" omits the row gap and uses the median cell.** `rowFits` is `whiteMm >= rowMm`; a real next
  row needs `rowMm + row gap` (and, on a new question, its instruction strip). On a mixed page the median cell is not the next
  row's height. placevalue:value mixed-practice L: white 39.8 mm, median 37.2 mm — fits only with a gap under 2.6 mm, so
  CAP-PARITY calls the page "not full" and fails a passed skill. Fix: measure the grid's computed row-gap (or the pitch between
  row tops) and judge `white >= rowMm + gap`; add a self-test case on that boundary (white between row and row + gap -> pass).
- **F2 (C1, C3) CAP-PARITY judges every role, including teacher-count / mixed-packing roles** (mixed-practice, independent,
  more-practice). The brief and the status say "counts noted per role"; the code fails them. Either restrict the verdict to
  FIXED_CAP_ROLES (note the rest) or justify mixed-practice's L packing against PT §5.2 and keep it — but decide and say so.
- **F3 (C1) EB-LASTPAGE on a MULTI-page fixed role conflicts with PG-23** (a last page holding >= 1/3 of a full page's rows is
  legal). placevalue pre-skill-check L p2 fails at 45 %; here the spill is itself the defect, but a 2-page Test at a teacher
  count would be failed for a rebalanced last page. Judge the last page only when the role prints one page, or apply the PG-23
  third-of-rows test to a later last page.
- **F4 (C2) The OK side is not a fix.** Both rows pass on OTHER roles of the same commit. That proves the rule does not fire on
  full pages; it does not prove the rule clears the failed page once fixed (a rule that fails every pre-skill-check page would
  also pass this row). Valid as an interim stand-in only. Add a fixture pair (`--html`): the cbt pre-skill-check page as
  rendered (FAIL) and the same page with its missing rows (OK), so the same role flips; re-point to the F1 fix when cbt resumes.
- **F5 (C2) No hand fixtures near the boundary.** I checked two rendered pages by hand from the tool's measures: add_facts
  pre-skill-check M (187.4 mm white of a ~240 mm body = 78 %, row 42.6 mm: fits 4 more rows — correct FAIL) and add_facts
  review M (60.4 mm white, row 60.8 mm: no row fits — correctly not judged, and Review is banded, PT-ENG-3). Neither the
  self-test nor the backtests hold a case in the row..row+gap band where F1 bites.
- **F6 (C3, C4) The status note undercounts the collateral.** It names add_facts only; sub_facts and placevalue:value
  (both PASSED, redesign-passed.js) also go red under precritic's default `--page-fill`. Every red must be listed and routed
  (or the rule must wait) before this lands on the default path, or lanes touching those skills are blocked without notice.
- **F7 (C4) Misleading note text.** Every non-fixed role is labelled "teacher-count role, measured not judged" — opener,
  scripted-model, review, lesson, stretch and fact-probe are not teacher-count roles; they are banded or fixed-layout.
  Say "not a fixed-capacity role (PT-ENG-3 banded / PG-23 teacher count)".

## Role list (question 1)
Right in substance: Guided, Opener, Scripted Model and Review are banded pages whose remainder "stays blank at the foot of
the body" (PAGE_TYPES PT-ENG-3), so judging their foot at 30 % would contradict the contract; Independent / More Practice
are teacher-count and may end short on a last page (PG-23). Gap: WORKSHEET_DESIGN_STANDARD CL-2c says the DEFAULT one-page
practice layout "still meets the 20 % page-fill rule"; a one-page default Independent is not judged by EB-LASTPAGE (nor by
EB-GRIDFOOT without `--columns`). Not this change's defect; worth a follow-up row. Test's count is a teacher option
(4 / 8 / 10 / 12 / 16 / 20, PT-TST) whose default fills one page — fine at defaults, see F3 for teacher counts.

## Parity threshold (question 3)
0.7 x M is sane against the published ceilings: Guided 8 / 6 (needs 6), fact rows 16 / 12 class F (12), Test 16 / 12 (12).
Reason It 3 / 2 and Stretch 2 / 1 and True or False 6 / 4 fall under 0.7 but pass through the "L page full" escape, which is
correct but depends on F1's fit measure being right.

## Automatic checks that would have caught these
- F1: a self-test case `white = row + gap/2` must PASS; read the grid's row-gap in the evaluate.
- F6: the lane runs the new rule over every id in `redesign-passed.js` and lists each red in its status before reporting.
- F4: commit-pair rows whose pass side changes `--roles` from the fail side should be flagged by ws-backtest as "not a fix".
