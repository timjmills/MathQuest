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
