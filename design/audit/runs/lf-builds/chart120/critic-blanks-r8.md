# hundreds_chart_fill band 100: narrow independent critic r8, "chart blanks" H4

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `4d363e7a4` (fix `f051558d8`). The critic changed no code.
- **How it was rendered:**
  - `tests/lib/ws-harness.cjs` `open()` under `tests/scripts/mq-browser-run.sh`.
  - Call: `window.buildSheet({role:'lesson', sections:[{skills:[{categoryId:'composing', skillId:'hundreds_chart_fill', opts:{band:100}}]}], size:'M', paper:'A4', seed, key:true, practicePages:1, mixed:false})`.
  - Then `sheetDocument` for the pupil pages and the key, print media, and a shot of each `section.ws-page`.
  - Console errors were counted from the app tab during each `buildSheet` call.
- **Graded:** at M, seeds 1, 2, 4242 and 5:
  - p2, the teaching sheet, with its key;
  - p3, the practice page, with its key.
  - p1 was read only for giveaways, re-asks and step cover.
- **Machine reads:**
  - every `table.k2-chart` on the pupil and key pages, at the four graded seeds;
  - the same reads over a 40-seed sweep (seeds 1–40, no shots), used only to judge variety and the H4 caps.

## Verdict: **PASS**

On every graded page, H4 is closed and H1, H2 and H3 stay closed. N1 is closed: there were 0 console errors.

There is one finding outside the graded pages (F1). The skeleton-twin check does not shift grids by rows, and seed 17 in the sweep slips through. It does not block this re-grade, but fix it before the deploy train.

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page | s1 | s2 | s4242 | s5 | Pass |
|---|---|---|---|---|---|
| p2 teaching sheet | 9·8·8·8 | 9·8·8·8 | 9·8·8·8 | 9·8·8·8 | yes |
| p2 key | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | yes |
| p3 practice | 9·8·8·8 | 9·8·8·8 | 9·8·8·8 | 9·8·8·8 | yes |
| p3 key | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | 9·9·9·9 | yes |

## H4: the practice page (p3)

| Seed | Grid 1 | Grid 2 | Grid 3 | Edge share | Worst column run (of 9 rows) | Most shared gap places (any 2 grids, no shift) |
|---|---|---|---|---|---|---|
| 1 | 1–30: 1, 4, 13, 15, 21 | 41–70: 41, 52, 54, 64, 70 | 71–100: 80, 86, 89, 98, 100 | 6/15 (40 %) | 3 | 1 |
| 2 | 1–30: 1, 4, 12, 15, 21 | 41–70: 41, 52, 54, 61, 63 | 71–100: 80, 86, 89, 96, 98 | 5/15 | 4 (column 1) | 3 (grids 1 and 2) |
| 4242 | 1–30: 6, 9, 16, 19, 30 | 41–70: 50, 58, 60, 67, 69 | 71–100: 71, 82, 84, 91, 95 | 5/15 | 3 | 1 |
| 5 | 1–30: 1, 4, 13, 15, 21 | 31–60: 38, 40, 47, 49, 60 | 71–100: 80, 86, 88, 96, 100 | 6/15 | 4 (column 10) | 2 |

**Caps:**
- **Edge share:** at most 40 % at every graded seed. It was 58–68 % in r7. In the 40-seed sweep the highest is also 40 %.
- **Edge gaps per column per grid:** at most 2 everywhere.
- **Column runs:** at most 4 page rows per column, at every graded seed and in the sweep.
- **Skeleton twins:**
  - Graded seeds: no two grids share more than 3 gap places, even with a whole-row shift. The worst case is s2 grids 1 and 2, with 3 places.
  - The sweep has one exception, described under F1.

**On the PNGs:**
- The r7 frame of empty boxes down the right-hand side is gone.
- Every grid mixes interior "look left, add 1" squares with one or two decade or edge squares:
  - at s5, grid 1 has 1, 4, 13, 15 and 21;
  - at s4242, grid 3 has 71, 82, 84, 91 and 95.
- C2 is back to 8.

## The rest

- **Answers (both keys):**
  - Across every grid the key reads +1 along a row and +10 down a column, with 0 errors.
  - Every number printed on a pupil page matches its key square.
  - The four warm-up answers are correct.
- **H1 (re-asks on p2):** 0 Independent answers are also asked by a Guided window.
- **Re-asks on p3 of p1 or p2 answers:** 0 at all four seeds.
  - p2 gaps print on p3 as A13 givens. Examples: s1 grid 2 gives 43, 45, 48, 50, 55, 60, 66 and 69; s5 grid 2 gives 32, 35, 41 and 46.
  - On the PNGs these givens look like every other printed number. There are no other giveaways.
- **H2:** every p3 grid has exactly 5 blanks, with gaps in all three rows.
- **H3:**
  - p3: no grid has a full blank column.
  - p2: at most one full blank column per window, and only at window column 5, the chart's column 10. Examples: s1 Guided 36–60 (40, 50, 60) and s2 Guided 6–30 (10, 20, 30).
- **Step cover:** checked strictly. A gap counts as covered when the square to its left is printed, or the square above it is printed, or it is in the top row and the square below is printed. 0 gaps fail on p1, p2 and p3, at the four graded seeds and over the sweep.
- **Score totals:**
  - p2 is /12: 2 warm-up items plus 10 Independent gaps (Guided gaps are not scored).
  - p3 is /15: 3 grids × 5 gaps.
  - Both match the slots at every seed.
- **Density:**
  - p2 and p3 fill the page down to the footer, and no page overflows (0 at every seed).
  - p3 asks 15 squares out of 90, against 19 in r7 and 8–9 per grid in r5. That is a light writing load, but right for this pupil, and every gap is real work.
  - It is not a finding, and C3 stays 8.
- **Words:** "Write the missing numbers.", the four Steps and the warm-up prompts are unchanged and right.
- **N1 (console errors during `buildSheet`):**
  - The graded seeds 1, 2, 4242 and 5 logged 0 errors. r7 logged 3,936.
  - The 40-seed sweep also logged 0, so the quiet retry works.

## Variety across seeds

The builder says each grid holds exactly 5 blanks and that grid 1 recurs across seeds. Judged explicitly:

- **Graded seeds:**
  - Grid 1 is almost the same at s1, s2 and s5: (1, 4, 13|12, 15, 21).
  - Grid 3 is close at those three seeds: 80, 86, 88|89, 96|98, 98|100.
  - s4242 is a different page.
- **40-seed sweep:**
  - 31 distinct grid-1 sets, and no set appears more than 3 times.
  - 32 distinct grid-3 sets, and no set appears more than 2 times.
  - The page's rows always come from two plans: 1–30 / 41–70 / 71–100 (22 seeds) or 1–30 / 31–60 / 71–100 (18 seeds).
  - The p2 Independent and Guided windows rotate among about 15 positions. The model window takes 15 distinct positions.
  - The A23 guard (at least 3 distinct Model rows) holds easily.
- **Ruling:** on a page, the items vary sensibly. Across seeds, variety is adequate but not rich.
  - The "1, 4, 1x, 1x, 21" left-half staircase is the most common grid-1 shape.
  - A teacher who reprints s1 as s2 or s5 gets a similar first and last grid but a different middle grid and teaching sheet.
  - This is not scored. It belongs to the parked NEAR-TWIN and Form B work (A23 next-week list).

## Findings

### F1: a skeleton twin under a one-row shift slips through the check (sweep seed 17; not on a graded page, does not block)

- **Where:** seed 17, p3 (practice).
  - Grid 2 (31–60) asks 37, 39, 48, 50, 60.
  - Grid 3 (71–100) asks 80, 87, 89, 98, 100.
  - Move grid 2 down one row and four of its five gaps land on grid 3's places: (row 2, col 7), (row 2, col 9), (row 3, col 8) and (row 3, col 10).
  - The pupil sees the same zig-zag of boxes twice, one row apart.
- **Cause:** `tests/scripts/ws-guided-echo.cjs` line 474 and the dealer's matching cap compare (row in grid, column) only. The r7 check spec said "after shifting by whole rows".
- **Fix:** in both the dealer's twin cap and SKELETON-TWIN:
  - compare gap places with grid B moved by −2…+2 rows;
  - take the maximum overlap;
  - refuse 4 or more.
- **Automatic check:** SKELETON-TWIN with a row shift.
  - It should fail on `4d363e7a4` seed 17, where grids 2 and 3 share 4 places after a +1 shift.
  - It should pass seeds 1, 2, 4242 and 5, where the most shared places is 3 or fewer.
  - Add seed 17 to the H4 backtest.

### Still open, not scored (carried from r2 and r7)

- **n1, numeral baseline:**
  - A printed number under a heavy-bordered blank still sits about 2 px low. Examples are 57 and 59 in row 3 of `-p3-s5.png` grid 2, and 98 in grid 3.
  - Check: BASELINE.
- **n2, practice footer seed:**
  - The p3 footer and its key show `seed 7920`, `7921`, `12161` and `7924` instead of the packet seed.
  - Check: FOOTER-SEED.

## PNGs (`design/audit/runs/lf-builds/chart120/blanks-r15/`, 16 files)

- `hcf100-lesson-M-p2-s1.png`, `hcf100-lesson-M-p2-key-s1.png`, `hcf100-lesson-M-p3-s1.png`, `hcf100-lesson-M-p3-key-s1.png`
- `hcf100-lesson-M-p2-s2.png`, `hcf100-lesson-M-p2-key-s2.png`, `hcf100-lesson-M-p3-s2.png`, `hcf100-lesson-M-p3-key-s2.png`
- `hcf100-lesson-M-p2-s4242.png`, `hcf100-lesson-M-p2-key-s4242.png`, `hcf100-lesson-M-p3-s4242.png`, `hcf100-lesson-M-p3-key-s4242.png`
- `hcf100-lesson-M-p2-s5.png`, `hcf100-lesson-M-p2-key-s5.png`, `hcf100-lesson-M-p3-s5.png`, `hcf100-lesson-M-p3-key-s5.png`
