# hundreds_chart_fill band 100: narrow independent critic r7, "chart blanks"

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `5ae71ee5b` (fix `7e98cf48f`). The critic changed no code.
- **How it was rendered:**
  - `tests/lib/ws-harness.cjs` `open()` under `tests/scripts/mq-browser-run.sh`.
  - Call: `window.buildSheet({role:'lesson', sections:[{skills:[{categoryId:'composing', skillId:'hundreds_chart_fill', opts:{band:100}}]}], size:'M', paper:'A4', seed, key:true, practicePages:1, mixed:false})`, then `sheetDocument` for the pupil pages and the key, print media, each `section.ws-page` shot.
- **Graded:** p2 (the teaching sheet) and p3 (the practice page), each with its key, at M, seeds 1, 2 and 4242. p1 was read only to check for giveaways and re-asks.
- **Machine reads:** every `table.k2-chart` on the pupil and key pages. Squares come from the key; blanks are the pupil's empty slots.
  - **Key arithmetic** (+1 along a row, +10 down a column) on p2/p3: 0 wrong.
  - **Step cover** (left printed, above printed, or top row with the square below printed): 0 failures. Every gap is solvable by a printed Step.
  - **H1, p2 internal re-asks** (Independent answers also asked by a Guided window on the sheet): **0/10** at seeds 1, 2 and 4242.
  - **p3 re-asks** of p1/p2 answers: 0/19 at all three seeds. p2 gaps printed on p3 are A13 givens, and they look like every other printed number (checked on the PNGs and keys).
  - **Score totals:** p2 /12 (2 warm-up + 10 Independent) at every seed; p3 /19 at every seed (s1 5·7·7, s2 5·9·5, s4242 7·5·7). These match the blanks.
  - **H2, blanks per p3 grid:** at least 5 in every grid, and every grid has gaps in all three rows.
  - **H3, full blank columns per grid:** at most 1 in every grid on p2 and p3.
  - **Edge share on p3** (gaps in column 1 or column 10): s1 12/19, s2 11/19, s4242 13/19. Column 10 is blank in 8, 8 and 7 of the page's 9 rows.

| Seed | p3 grid 1 | p3 grid 2 | p3 grid 3 |
|---|---|---|---|
| 1 | 11–40: 20, 21, 30, 38, 40 | 41–70: 47, 50, 51, 60, 62, 64, 70 | 71–100: 71, 80, 87, 89, 91, 98, 100 |
| 2 | 1–30: 7, 10, 20, 21, 30 | 31–60: 32, 34, 40, 46, 48, 50, 56, 58, 60 | 71–100: 71, 80, 90, 91, 97 |
| 4242 | 1–30: 1, 8, 10, 18, 20, 21, 30 | 31–60: 31, 40, 50, 51, 60 | 71–100: 71, 80, 87, 89, 91, 97, 99 |

- **Teaching windows on p2** (Guided 1, Guided 2 / Independent 3, Independent 4):
  - s1: 5–29, 32–56 / 2–26, 72–96.
  - s2: 2–26, 15–39 / 65–89, 72–96.
  - s4242: 32–56, 72–96 / 2–26, 55–79.
  - Every window sits in columns 2–6 or 5–9. None touches column 1 or column 10.

## Verdict: **FAIL**

H1, H2 and H3 are closed as written:
- 0 Independent re-asks on the teaching sheet;
- every practice grid has at least 5 blanks, spread across its rows;
- no grid has more than one full blank column.

The teaching sheet and every key pass. The practice page fails C2 at all three seeds. The vertical stripe that H3 capped per grid now runs down the whole page: column 10 is blank in 7–8 of the 9 rows, and 58–68 % of the gaps sit in the two edge columns. The cause is the new pinned layout (H4).

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page | s1 | s2 | s4242 | Pass |
|---|---|---|---|---|
| p2 teaching sheet | 9·8·8·8 | 9·8·8·8 | 9·8·8·8 | yes |
| p2 key | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | yes |
| p3 practice | 9·**7**·8·8 | 9·**7**·8·8 | 9·**7**·8·**7** | **no** (H4) |
| p3 key | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | yes |

- **Density:** p2 and p3 are full at every seed. There is no empty band above the footer, which sits at the same place as in r6.
- **Words:** "Write the missing numbers.", the four Steps and "Write how many tens." / "Write the missing number." are plain and right. There are no word findings.

## Findings

### H4 (fails, C2 7 on p3 at every seed; C4 7 at s4242): the practice page is an edge-column stripe

- **Where:**
  - `hcf100-lesson-M-p3-s4242.png`:
    - Grid 2 (31–60) asks only 31, 40, 50, 51, 60. All five are edge squares, and 26 of its 30 squares are printed in full rows.
    - Grid 1 (1–30) has the same edge skeleton: 1, 10, 20, 21, 30 is grid 2's pattern moved 30 on, plus 8 and 18.
    - So two of the three items look like the same item.
  - `-p3-s1.png`:
    - Column 10 is blank in rows 20, 30, 40, 50, 60, 70, 80 and 100.
    - Grids 1 and 2 each have column 10 blank all the way down.
  - `-p3-s2.png`:
    - Column 10 is blank in rows 10–60, 80 and 90.
    - Grid 1 (7, 10, 20, 21, 30) and grid 3 (71, 80, 90, 91, 97) share the same edge skeleton.
- **Why it fails:**
  - A teacher sees a frame of empty boxes down the right-hand side of every grid. The pupil writes 10, 20, 30, … down the page by the decade pattern.
  - Only 6–8 of the 19 answers are interior "look left, add 1" squares.
  - Decade crossing is a good thing to practise, but here it is most of the page, not a sensible mix (RUBRIC C2: "items vary sensibly"). This is one real defect, so C2 is 7.
  - At s4242 the near-twin grids also break the one-item-per-cell variety the workbooks show, so C4 is 7.
  - This is the same defect class as r6 H3 (vertical runs) for a second round. By round cap 2 it needs a root cause and a machine check before another fix round.
- **Root cause:** every pinned teaching window (`HCF100_LAYOUT`) is 5 wide in columns 2–6 or 5–9. With the Model, the five windows print most of columns 2–9 in the rows they touch. The packet bars blanking any square printed earlier, so in those rows only column 1 and column 10 are fresh. The deal then fills the floor of 5 from the edges. A13 adds givens but no fresh squares. The H3 rule caps one full column per grid, not per page, so the stripe passes it.
- **Fix (either):**
  - (a) Change the layout table so the five windows also cover columns 1 and 10. Put at least one window at columns 1–5 and one at columns 6–10. The fresh squares left for p3 then fall in the interior, mixed with edges.
    - Add a page-level deal rule: at most 2 of each grid's gaps in column 10, and at most 50 % of the page's gaps in columns 1 and 10.
  - (b) Lead ruling (r6 H2 fix b): a p3 grid may blank a square that an earlier page only printed and never asked. The dealer then has the interior again and can keep the edge share at 50 % or less.
- **Automatic check:**
  - **EDGE-SHARE** (`ws-guided-echo`, lesson packet): on a rows-of-ten practice page, gaps in columns 1 and 10 are at most 50 % of the page's gaps.
  - **PAGE-COL-RUN:** no single column is blank in more than 4 of the page's 9 rows.
  - **SKELETON-TWIN:** no two grids on a page share 4 or more gap positions (row, column) after shifting by whole rows.
  - Expected results:
    - fails on `5ae71ee5b` hcf M seeds 1 (12/19, column 10 in 8 rows), 2 (11/19, 8 rows) and 4242 (13/19, 7 rows, grids 1 and 2 twin);
    - passes on r5's practice grids (8–9 interior-mixed blanks).
  - Sweep it over seeds 1–200.

### Builder's question: pinned windows that share printed squares (s2 Guided 2–26 and 15–39 both print 15, 16, 25 and 26)

- **Ruling:** acceptable, and it reads well.
  - The shared squares are printed in both windows and are never a gap in either.
  - The same numbers in the same chart positions show the pupil that the two windows are pieces of one chart.
  - No answer is visible, and the teacher leads both Guided windows.
- The same holds for s2 Independent 65–89 and 72–96 (75, 76, 85, 86 printed in both) and s1/s4242 (5, 6, 15, 16, 25, 26; 55, 56).
- Not a finding. Keep the rule that a shared square is never a gap in either window. The SHEET-REASK check already enforces it.

### N1 (process, not scored): 3,936 console errors while building three packets

- **What happens:** the app tab logged `hundreds chart lesson: rows-of-ten grid 1-30 / 11-40 cannot hold 5 fresh blanks (critic blanks r6 H2)` 3,936 times across the three `buildSheet` calls.
  - `gen-counting.js:1210` calls `console.error` and throws on every failed candidate band.
  - The caller catches the throw and retries, and the sheet then builds.
  - r6 saw 0 console errors.
- **Why it matters:** a teacher's console fills up, and any gate that counts console errors on a print run, such as boot-smoke-style checks, will fail or hide real errors.
- **Fix:** throw quietly inside the search. `console.error` only when the final deal fails and the sheet cannot be built.
- **Check:** **BUILD-CONSOLE-CLEAN**: 0 `console.error` during `buildSheet` for hcf lesson M seeds 1, 2 and 4242. It fails on `5ae71ee5b`.

### Still open, not scored

- **r2 n1, numeral baseline:** a printed number under a heavy-bordered blank still rides about 2 px low. Examples: 61 (under 51) and 97 (under 87) in `-p3-s1.png`; 100 (under 90) in `-p3-s2.png`; 39 in `-p2-s2.png` Guided 2. Check: BASELINE.
- **r2 n2, the practice-page footer seed:** `seed 7920 / 7921 / 12161` instead of the packet seed. Check: FOOTER-SEED.
- **Note, not scored:** across seeds the pinned table repeats windows 2–26 and 72–96 at all three seeds, and gives near-identical gaps at s1 and s2 for 72–96. Form B variety is thin; a teacher reprinting with another seed gets nearly the same sheet.

## What would close it

- H4: on the hcf band-100 lesson practice page, at most 50 % of gaps in the edge columns, no column blank in more than 4 of the 9 rows, and no skeleton twins. Sweep this over seeds.
- Re-grade p3 (and p2, if the layout table changes) at M, seeds 1, 2 and 4242, plus the sweep's worst seed.

## PNGs (`design/audit/runs/lf-builds/chart120/blanks-r13/`, 12 files)

- `hcf100-lesson-M-p2-s1.png`, `hcf100-lesson-M-p2-key-s1.png`, `hcf100-lesson-M-p3-s1.png`, `hcf100-lesson-M-p3-key-s1.png`
- `hcf100-lesson-M-p2-s2.png`, `hcf100-lesson-M-p2-key-s2.png`, `hcf100-lesson-M-p3-s2.png`, `hcf100-lesson-M-p3-key-s2.png`
- `hcf100-lesson-M-p2-s4242.png`, `hcf100-lesson-M-p2-key-s4242.png`, `hcf100-lesson-M-p3-s4242.png`, `hcf100-lesson-M-p3-key-s4242.png`
