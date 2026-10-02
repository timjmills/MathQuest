# Wave 1 Lane C: independent critic (Opus, low)

Tree: worktree-agent-a1a8c5315ec37d048, commits d46663a and d7d4059 on top of 8fd2a10.
Graded: count_by_tables, hundreds_chart_fill, number_chart_fill. Print pages are L, S and the opt-* runs. Screen hosts are card-390/820/1280, worksheet-1280 and quiz-1280.

## Verdict: FAIL

| Criterion | Score | Lowest version |
|---|---|---|
| C1 Ease of use | 7 | opt-whole-pattern-S independent; opt-whole-pattern card-390 |
| C2 Teaches | 7 | S count_by_tables independent (the order breaks); title "count by 1 to 15"; gaps=row/column runs that touch the edge |
| C3 Spacing / layout | 7 | opt-whole-pattern-S (whole chart about 40 % of the cell, small digits) |
| C4 Looks like the workbooks | 8 | baseline jitter in the grid cells next to empty squares |

The default L pages are 8 to 9 on all four criteria: count_by_tables independent and test, the hundreds and number chart windows, and the gaps=row/column/rows options. The defects below are in the new options and the S page.

## Gates (run from the tree through /tmp/mq-browser-run.sh, one at a time)

- `ws-options-verify --skill hundreds_chart_fill`: OK, 17/17 values pass. The only warnings are "answer not found in the key text" (the key is graphic). Those warnings are expected for grid keys.
- `ws-options-verify --skill number_chart_fill` (rerun now): OK, 13/13 pass.
- `ws-content-audit --skill a,b,c` with a comma list prints "FAIL - no skill matched". The script does not take a comma list. Run one skill at a time: hundreds_chart_fill OK (240 items, 0 failing), number_chart_fill OK (0 failing, 2 notes; "NOTHING could be checked against the name"), count_by_tables OK (0 failing, 2 notes).
- The audit samples default options only. fill=half, fill=one and jumps=15 are never audited. The PNG keys for those options were correct when checked by hand.
- **Lint spot-check: not reproduced.** The 28 findings in the opener, scripted-model, review and reason-it roles are not recorded in L/manifest.json or S/manifest.json. I could not confirm they are identical on the base, so they stay as the builder's claim. Those roles are out of the pass bar anyway (RUBRIC scope note, 2026-09-26).

## Things checked that hold up

- **Defaults unchanged for the hundreds and number charts.** With grid=window and gaps=scatter, `_chartGaps` is never called and `_kDeal(4)` is never evaluated (gen-counting.js:919). R, C and the 400-try loop are unchanged, so the defaults draw the same rng sequence and print the same items.
- **Old share codes decode the same.** The new keys 2U-2X sit in their own sub-range and the snapshot change is additive.
- **count_by_tables old printouts are not reproduced on purpose.** fill now defaults to 'two', so a pre-lane share code reprints with the second number filled and one fewer blank. This is the owner's request, but it should be noted in STATUS.
- **Answer keys** (L test-key, opt-jumps15-half-L key, whole-chart key) match the rows and charts. Answers are bold and the given numbers are regular.
- **The 15-jump row wraps to 8 + 7.** It is readable: two lines, big digits, arcs continuous. Fine for SPED pupils at L.
- **Grid gaps always have a printed neighbour.** True on every PNG checked.

## Ranked defects

### 1. S page: "walks up the tables" breaks after six rows (C2 7, C1 cost 1)
- **Where:** js/modules/gen-mult-patterns.js:95. Seen in S/multiplication__count_by_tables/independent-p1.png, rows a to k.
- **What is wrong:** the rows are 2, 3, 5, 7, 9, 11, then 2, 4, 6, 7, 10. The page holds 11 rows, but `_page` falls back to 6 because `state.itemCount` is the section's `count` (print-sheet.js:1493, `sec.count || null`), not the number of rows the page fits. The S page shows two climbs, with 2 and 7 printed twice.
- **Expected:** one climb across all 11 rows (2 to 12, each table once).
- **Fix:**
  - Pass the real page capacity as `itemCount` in `generateRun` when `sec.count` is null. Use the fitted count that buildSheet already computes for pagination.
  - Or, in genCountByTables, when `state.itemCount` is missing, fall back to `tables.length` (11), not 6. Then `idx % 11` climbs 2 to 12 on any page of 11 or fewer.
- **Check:** re-render S independent and confirm rows a to k read 2, 3, 4 … 12 with no repeats.

### 2. "I Can count by 1 to 15" is mathematically wrong (C2 7)
- **Where:** js/modules/sheet/providers/countby.js:94 and js/modules/print-sheet.js:1209. Seen in opt-jumps15-half-L independent-p1 and its key.
- **What is wrong:** "count by 1 to 15" reads as tables 1 to 15 (count by 13, 14, 15). The tables are still 1 to 12; only the row length is 15.
- **Fix:** keep the title "I Can count by 1 to 12" and put the length in the band phrase: "I Can count by 1 to 12 (15 jumps)". In print-sheet.js:1209, replace the `to 12 → to 15` substitution with an append of " (15 jumps)". In countby.js:94, return the same string.
- **Check:** the opt-jumps15 header reads "count by 1 to 12 (15 jumps)" on the pupil page and the key.

### 3. gaps=row/column runs touch the grid edge; the option help says they never do (C2 7)
- **Where:** js/modules/gen-counting.js:68 (`c0 = rng(0, C - len)`), gen-counting.js:72 (`r0 = rng(0, R - len)`), and help text at skill-options.js:1128.
- **What is wrong:**
  - In opt-gaps-row-L, item d's run 84-86 starts at column 0 and item e's 65 sits in the corner. There is no printed number before the run to count on by 1 from.
  - In opt-gaps-column-L, item d's 75, 85 starts at the top row, and item e's 85 sits in the bottom-left corner.
  - The help promises "at least one printed number at each end".
- **Fix:**
  - Row runs: `c0 = rng(1, C - len - 1)` with `len = min(n, C - 2)`.
  - Column runs: `r0 = rng(1, R - len - 1)` when R - len ≥ 2. In a 3-row window that means len = 1, the middle row only, so `len = min(n, R - 2)`.
  - Or change the help text to match. The code fix is preferred.
  - Add a content-audit rule for each run: a printed number before it and after it, in the run's direction.
- **Check:** across 240 seeded items for gaps=row and gaps=column, no run starts or ends on the grid edge.

### 4. gaps=pattern deals only 2 distinct items; the online worksheet repeats them (C2, C1)
- **Where:** gen-counting.js:74 (`offset = rng(0, 1)`) with grid=whole. Seen in opt-whole-pattern/worksheet-1280.png: items 1, 3 and 5 are identical, and items 2, 4 and 6 are identical.
- **Fix:**
  - For grid=whole + pattern, de-duplicate across a page by varying more than the offset. Suggestions: a checkerboard on a random subset of rows only (e.g. 5 of 10), or a column-alternating variant.
  - Or cap the whole chart at 1 item per worksheet/quiz host (it already prints 1 per page).
- **Check:** the worksheet-1280 items are pairwise different.

### 5. Whole chart at size S: small digits and wasted space (C3 7, C1 7)
- **Where:** opt-whole-pattern-S/independent-p1.png.
- **What is wrong:** the 10×10 grid fills about 570×570 px of a 700×860 px cell, with about 150 px empty above and below. The digits are about 4 mm tall, against about 7 mm at L. This is the "Size S ignored / wasted space" class in LESSONS_LEARNED.
- **Fix:** grid=whole is one cell to a page, so size it to the cell's free height. Set the square size from `ctx.metrics` to min(cellW/10, cellH/10) at both S and L, and use the L digit size: one item per page has no density reason to shrink.
- **Check:** at S the grid fills at least 90 % of the cell height and the digits match L.

### 6. Whole chart on the 390 px screen: two stacked halves break the rows of ten (C1 7)
- **Where:** opt-whole-pattern/card-390.png.
- **What is wrong:** columns 1-5 are stacked above columns 6-10, so the pupil reads "1 _ 3 _ 5" and the row continues 400 px further down. The across-the-row count (+1) is lost. Usable, but harder for SPED pupils.
- **Fix:** at 390 px, keep the 10-column grid. With 34 px squares (390 − 2·16 gutter = 358 / 10 ≈ 35) the digits are 18 px. Each blank is a 44 px tap target that opens one large input (the pattern other keypad hosts use). Or scroll inside the grid horizontally only, never the page.
- **Check:** card-390 shows rows of ten, there is no page horizontal scroll, and tap targets are ≥ 44 px.

### 7. Baseline jitter next to empty squares (C4 8, cosmetic)
- **Where:** opt-rows-column independent-p1, a: "52"; b: "30". opt-gaps-row-L, a: "57". L number_chart, d: "168"; f: "167".
- **What is wrong:** printed numbers that sit next to an empty box are drawn 3-6 px lower or higher than the rest of their row. The likely cause is the gap box's thicker border shifting the text box.
- **Fix:** in the grid template, give every square the same box model (border drawn as an outline or inset, not added to the width) and centre text with a fixed line-height equal to the square height.
- **Check:** pixel-compare the text baselines in one row; the spread must be under 1 px.

### 8. Live play side effect: count_by_tables now always deals 2, 3, 4 … 12 in order (C2, minor)
- **Where:** gen-mult-patterns.js:105.
- **What is wrong:** with nothing touched, live practice now begins with ×2 every session and is fully predictable, where before it shuffled. Climbing suits a printed page, but in live play the pupil sees ×2 first every time and only reaches the ×11/×12 practice late.
- **Fix:** keep the climb for print (the `itemIndex` branch), but restore the shuffled round for live play when `state.itemIndex` is not finite. Or start live play at a random table and climb from there.
- **Check:** two live sessions open on different tables.

### 9. gaps=row in a window can deal a "run" of one box (C2, minor)
- **Where:** opt-gaps-row-L, items a and e.
- **What is wrong:** `per` is dealt 1-3, so a "run along a row" is often a single box, which is the same as scatter.
- **Fix:** in `_chartGaps`, for row/column use `n = max(2, n)` when the tiles option is null.

### 10. ws-content-audit does not take a comma list (tooling)
- **Where:** ws-content-audit.cjs, the `--skill` parser.
- **What is wrong:** the documented brief usage `--skill a,b,c` fails.
- **Fix:** split `--skill` on commas.

## What raises each criterion to 10

- **C1:** fix defects 1, 5 and 6, plus a bigger tap target per blank on the whole chart.
- **C2:** fix defects 1-4, 8 and 9. Add content-audit rules for fill=half/one, jumps=15 and the run-edge rule, so the options are gated, not only rendered.
- **C3:** fix defect 5. Also give the L count-by row's trailing arc a target: the last arc on line 1 points into empty space past the line end.
- **C4:** fix defect 7.

---

# Round 2 (critic, Opus low, head 7629238)

**Verdict: FAIL.** C1 7 · C2 8 · C3 8 · C4 7.

The paper side is fixed. The screen twin's new slot overlay (chartwindow.js:191) brought in a regression that every 10-column chart on screen shows.

## Gates run
- `ws-content-audit --skill hundreds_chart_fill,number_chart_fill,count_by_tables`: OK, 0 fails. The comma list now works (defect 10 fixed). The notes are as before: number_chart_fill is "unaudited" (no count band), and count_by_tables has "11 distinct in 240" and "zero-facts".
- `ws-print-lint --source kit` on the 3 skills (independent): 0 findings.
- `ws-print-lint --roles review` on number_chart_fill: 15 findings. **They pre-exist.** The same 15 come back on base d7d4059, extracted with `git archive` to a scratch directory, with nothing stashed. None comes from this lane:
  - 1 × AK-4 critical: key page 2 has 9 answer slots, pupil page 1 has 8.
  - 2 × TY-2: italic "Write the fractions you used…".
  - 12 × TY-7: slash fractions "1/2" and "1/4" on tiles.

  The italic and slash-fraction findings are all in cell 5, a fraction item that the review mixer pulls in. The AK-4 is the review role's key pagination. These belong to the review role or mixer and the fraction tile cell, not to Lane C.
- **Default pages are unchanged.** The independent and test answers for hundreds_chart_fill and number_chart_fill, at L and at S, match the wave1-C run item for item.

## Round-1 defects
1. **Fixed.** The S count-by page climbs 2 to 12 once, rows a to k, with no repeat.
2. **Fixed.** The title reads "I Can count by 1 to 12 (15 jumps)" on the page and the key.
3. **Fixed.** Runs stay one square in from the edge (gaps-row-L a to f), the help text matches, and the run rule in the audit is real: it checks a printed neighbour in the run's direction at both ends and a length of at least 2 along a row.
4. **Fixed.** The 6 whole charts on worksheet-1280 are all different, and the audit fails a repeat in the first 12.
5. **Partly fixed.** At S the whole chart has L-size digits and fills about 85 % of the cell height (735 of 860 px), leaving about 60 px top and bottom. **Acceptable.** That is under 1 square of slack, and 19.5 mm is the measured Letter limit. Below the LESSONS_LEARNED "wasted space" bar, so no defect.
6. **Fixed in layout.** The 390 px card shows rows of ten. See new defects A and B.
7. **Fixed on paper.** Baselines are steady on all paper PNGs checked. Regressed on screen: see defect A.
8. **Fixed.** Live play goes back to the shuffled round; the climb applies only when `itemIndex` is set.
9. **Fixed for rows.** For a column run in a 3-row window, `len = min(n, R-2)` = 1, so the "column run" is one box, the middle row only. That is a legitimate count-on-by-10 item with a number above and below, but it is the same as scatter. Not a defect, only a note: the option teaches more with grid=rows (5 rows) or whole.
10. **Fixed.**

## Other items asked
- **Layout-unit assertion.** Not weakened. It changed only to match the new FILL style string, and it still asserts that a printed number sits in a full-square line box.
- **Turn arrows on 15-jump rows (paper, jumps15-L).** These help. The ⤵ at the end of line 1 gives the last hop a landing place, and the → into line 2 shows the count goes on. They are thin hairlines and do not compete with the digits. Keep them.
- **Content-audit sweeps.** These are real, not decorative. The 5 count-by and 14 chart option combos are each sampled with 80 items through the same rules as the defaults, and a fail fails the skill.

## Ranked defects (round 2)

### A. Screen chart: the heavy slot overlay spills into the next square and covers its number (C1 7, C4 7)
- **Where:** js/modules/sheet/cells/chartwindow.js:191. This is the overlay `<span>` with `border:B(ctx,1.5)` in the twin, inside a `width:10%` td.
- **Seen in:**
  - rows-screen/card-390.png, row 41: a bar cuts the "4" of "43".
  - whole-pattern-screen/card-390.png, row 11: "|13".
  - whole-pattern-screen/worksheet-1280.png, item 3, bottom row: "|100".
  - In the same files, the heavy boxes sit off the grid lines in every row.
- **What is wrong:**
  - The overlay is absolutely positioned against a td.
  - In `border-collapse` tables, Chrome does not reliably make a td the containing block for absolutely positioned children.
  - The input inside the slot also grows the box, so the 1.5 px frame lands on the neighbour.
  - A pupil reads "43" as "|43".
- **Fix:** put `position:relative` on a wrapper `<div style="position:relative;width:100%;height:100%">` inside the td, and put both spans inside that wrapper. Or drop the overlay and use `outline:${B(ctx,1.5)} solid ${INK};outline-offset:-${B(ctx,1.5)}` on the slot span, which draws inside the square and never changes the box. Keep the paper path as it is.
- **Check:** in card-390 and worksheet-1280, no square shows a stray vertical line, and every heavy box sits exactly on its grid lines (pixel-compare the box edges with the column rules: no more than 1 px apart).

### B. 390 px chart squares are about 32 px wide, below SP-10's 34.5 px exception (C1, minor)
- **Where:** card-390 for both the whole chart and rows. The table is about 322 px inside the card padding and the bordered visual frame.
- **What is wrong:** SP-10 and PT-SCR-3 allow only 34.5 × 44 for a 10-column chart on a phone. 32 px is a breach of the standard, by 2.5 px.
- **Fix:** when `ten && isTwin`, remove the visual frame's inner padding and border for this template, or set a negative inline margin, so the table spans the card's full inner width: 358 px at 390, which is 35.8 px per square.
- **Check:** at 390 px, the measured td width is at least 34.5 px and the height at least 44 px, with no horizontal page scroll.

### C. Paper whole chart: the empty squares still look a hair off the grid (C4, cosmetic)
- **Where:** whole-pattern-S independent-p1, rows 1 to 2 and rows 5 to 6.
- **What is wrong:** the edges of the empty squares step by about 1 to 2 px against the neighbouring rules. The likely cause is the same overlay span sitting on a collapsed-border td.
- **Fix:** the fix for defect A covers this. Use one drawing for the empty square: the td border only, with no overlay on paper, since paper uses 0.75 for both anyway.
- **Check:** pixel-compare the edges of one row's squares: no more than 1 px spread.

## What raises each criterion
- **C1 (7 → 9 or more):** fix A and B.
- **C4 (7 → 9 or more):** fix A and C.
- **C2 and C3 (8):** C2 rises with a deeper column-run option on 3-row windows, or by naming it honestly in the help text. C3 rises by tightening the slack around the S whole chart where the page allows (A4 can take 20.5 mm squares, so key the square height to the paper size).

# Round 3 (critic, Opus low, head 8ea9d8d)

**Verdict: FAIL.** C1 7 · C2 8 · C3 8 · C4 7.

## Gates run
- `ws-screen-answer --skills composing:hundreds_chart_fill,composing:number_chart_fill,multiplication:count_by_tables`: all OK (card, worksheet 3/3, quiz 3/3, live green).
- I viewed rows-screen/*, whole-pattern-screen/*, whole-pattern-S, L/ and the count-by worksheet. I measured digit heights from the PNGs and did not run a DOM probe. The digit sizes I read agree with the builder's own figures.

## Round-2 defects
- **A (overlay spill): fixed.** No bars cut into numbers on card-390, card-1280 or the worksheets. Empty squares sit on the grid lines.
- **B (390 squares): fixed.** Rows of ten span the card, every number is readable, and "100" fits. The chart sits inside the card's white frame at 8 to 362 px of 370, so it does not overhang. **Acceptable.**
- **C (paper edge steps): fixed.** The whole-pattern-S independent page has even borders and fills its cell.

## Ranked defects (round 3)

### D. The online worksheet shrinks the ten-column chart's digits to about 16 px (C1 7, C4 7). This breaks "content never shrinks to fit".
- **Where:**
  - `js/modules/sheet/cells/chartwindow.js:88`, the new cap `font-size:min(P, 4.6vw, L(ctx,5.2))`.
  - The worksheet grid, which puts a ten-column chart in a cell one third of the row wide.
- **Seen in:** whole-pattern-screen/worksheet-1280.png and rows-screen/worksheet-1280.png.
  - The squares are about 30 × 75 px.
  - The digits are about 16 px.
  - The two-digit numbers touch both side borders: "54 55" read as one run, and "99100" runs together in items 1, 2, 4 and 6.
  - The five-column window on the same host (L/…/worksheet-1280.png) draws digits at about 32 px, so the same skill drops to half size on one host.
  - The card at 1280 px also lost size: digits went from about 34 to about 28 px with no need, because its squares are 70 px wide.
- **Fix:**
  1. Remove the `L(ctx,5.2)` term from the cap.
  2. In `css/screen-cell.css`, add additive rules so that a worksheet item holding `.k2-chart` with 10 columns spans the full row, with `grid-column: 1 / -1` on the worksheet card that contains it.
- **Measured target:**
  - At 1280 px, each square is at least 60 px wide (the row is about 1100 px, so about 100 px each).
  - Digits match the card's `P(ctx,pt)`, which is at least 28 px and the same as the five-column window.
  - "100" has at least 4 px of clearance on each side.
  - At 390 px the existing ≥ 34.5 × 44 px rule stays.

### E (minor, does not block). At 390 px there is an empty strip about 10 px high above and below the chart table.
- **Seen in:** both card-390.png files.
- **What is wrong:** the strip is wasted height inside the frame.
- **Fix:** zero the chart wrapper's vertical padding inside `@media (max-width:480px)`.

## What raises each criterion
- **C1 and C4 (7 → 9):** fix D.
- **C2 and C3:** unchanged from round 2.

# Round 4 (critic, Opus low, head 697e562)

**Verdict: FAIL.** C1 6 · C2 8 · C3 8 · C4 6.

## Gates and probes run
- `ws-screen-answer --skills composing:hundreds_chart_fill,composing:number_chart_fill,multiplication:count_by_tables`: OK. Card, worksheet 3/3, quiz 3/3 and live green all passed.
- DOM probe, practice card, `grid:'whole', gaps:'pattern'`, seed 1, DPR 1:
  - **1280:** computed td font-size is **15.36 px**. Squares are 41.9 × 46.8 px and the chart is 420 px wide inside a 1160 px card. Page scroll-x is 0. There were no console errors.
  - **390:** font-size is 40 px. Squares are 79.6 × 56 px and the chart is 797 px wide inside a 370 px card. Page scroll-x is 0.
- 390 Tab probe: I tabbed through all 30 empty squares from the keyboard. All 30 were inside the visible window when they took focus. `data-mq-end` set itself on the last box. **SP-11a focus scroll: PASS.**
- I viewed every PNG under onepage-12/ (6 sets), rows-screen/, whole-pattern-screen/ (including the cue and scrolled-end shots and worksheet-390), whole-pattern-S/L, and L/ and S/.

## Owner rulings, judged
- **SP-11a wording is fine.** It is narrow (10-column charts only, 480 px and under), dated, states page scroll-x 0 and names its files. The cue is black on white and has a 2 px rule above it. It sits under the chart (card-390-cue, worksheet-390) and never over a square. It is gone at the end (card-390-scrolled-end), and it is hidden in print. **Implementation: PASS.**
  - Minor: the arrow (34 px) reads as a medium arrow, not the "large arrow" the rule names. This is not blocking.
- **onePage:**
  - All six A4/Letter sets are ×1–×12 in order, on one page plus one key page.
  - Max blanks prints only the start number. Fill-two prints two numbers.
  - Printed digits are about 16 pt and legible.
  - Key boxes holding "100", "108", "121" and "144" are filled edge to edge with almost no clearance (Letter-default and A4-fill-two keys, rows i–l). On the pupil page the same box is about 11 mm wide for three handwritten digits, which is tight for SPED hands. Acceptable as an opt-in page.
  - The forced S/12 behaviour is stated only in the option's help text. The size picker still shows the teacher's own size; see defect G.

## Ranked defects (round 4)

### F. Round-3 defect D is NOT fixed: the ten-column chart still shrinks to about 15 px digits on desktop (C1 6, C4 6). TY-10 "content never shrinks to fit".
- **Where:** the screen twin's fit pass, `js/modules/screen-cell.js` lines 2204–2216. It lowers `--mq-k2` to `K2_FLOOR_PX` because the twin is wider than its box. The CSS rule `font-size:min(calc(var(--mq-k2)*6.4),4vw)` (`css/screen-cell.css:1331`) then gives 2.4 × 6.4 = 15.36 px.
- **Seen in:**
  - The probe above.
  - whole-pattern-screen/card-1280.png: the chart is 420 px wide inside a 720 px frame.
  - whole-pattern-screen/worksheet-1280.png: the card now spans the row, but the chart is still about 470 px of about 1100 px, with squares of about 45 px.
  - rows-screen card and worksheet at 1280.
- **The builder's figures are wrong.** It reported 33.4 px (card 1280) and 33.18 px (worksheet 1280). Those are the values before the fit pass, not what renders.
- **Fix:**
  1. In the fit pass, skip any twin that contains `.k2-chart-ten`, for example `if (twin.querySelector('.k2-chart-ten')) return;` before the shrink.
  2. Give the desktop ten-column chart its width from its digits, as the phone rule does: at ≥ 481 px, `.k2-chart.k2-chart-ten{--mq-chfs:48px (card/quiz) | 29px (worksheet); width:calc(10*(var(--mq-chd)*0.58*var(--mq-chfs)+10px))}`.
  3. Let `#questionCard.mq-card:has(.k2-chart-ten)` and `#questionPaper` widen past the 720 px SP-12 cap to `min(96vw, 960px)`. Record that as SP-12a, beside SP-11a.
- **Measured target:**
  - Card at 1280: digits are at least 48 px, which is the 768 floor. 56 px cannot fit "100" in 10 columns within 960 px, so 48 px is the honest target, and the rule should say so.
  - Worksheet at 1280: digits are at least 29 px and squares at least 60 px.
  - Quiz: the same as the card.
  - "100" has at least 4 px clearance in its own square.
- **Round-4 question (33.4 vs 48/56):** even if 33.4 px had really rendered, it would still breach the 48 px card floor. The 720 px cap is the cause, so the fix is the cap exception in step 3, not smaller digits.

### G. The UI does not show that onePage overrides size, the row count, the "Line runs to" option, the ticked tables and the order (C3 8, does not block alone).
- **Where:** `normaliseRequest` in `js/modules/print-sheet.js` silently sets size S, count 12, pages 1 and columns 1. The print dialog still shows the teacher's own values.
- **Fix:** when `onePage` is on, have the print dialog (`teacher-print.js`) show size as "S (set by All 12 tables on one page)" and disable it. Do the same for count, pages, columns, `jumps`, the table ticks and `order`.

### H (minor). On the one-page sheet, the blank boxes hold three-digit answers with little room.
- **Seen in:** the A4 and Letter pupil pages. About 30 mm of the page is unused below row l.
- **Fix:** spend that height on `ws-cell-compact` box width or height, for example raising `baseH` back to `writeMm + 2.5`, as long as the page still fits.

## What raises each criterion
- **C1 and C4 (6 → 9):** fix F, then re-measure at 1280 from the DOM after the fit pass.
- **C3:** fix G.
