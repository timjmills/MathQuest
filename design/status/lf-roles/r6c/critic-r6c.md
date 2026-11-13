# Critic r6c — lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `b98b0f28`. Graded against
`design/audit/RUBRIC.md` (C1-C4, H-caps), `design/PAGE_TYPES.md` PT-RSN-1 / PT-RSN-4 and PT-GDP-*, and
`WORKSHEET_DESIGN_STANDARD.md` (CL-4 / CL-4b, INK-31, AK-*).

**Verdict: FAIL.** Change 2 (Guided `tightRows`) passes: the pages are better or the same. Change 1 (Reason It A over B)
fails. The overflow is fixed, but every page now holds one item, which is H5 (C3 ≤ 5).

## 0. The evidence pack is wrong for change 1 (process defect P1, counted)

All five Reason It "before" PNGs are **byte-identical** to their "after" PNGs. The pack's "before" commit is `c8c81172`.
That commit comes AFTER the Reason It commit `244a84b6`, so the "before" already contains the change. The compare guided
pairs are also byte-identical, although the brief lists them as changed (see 2.4).

To get a true before, I rendered the parent of the lane's r10 work (`b25479c5`, from a `git archive` into the scratchpad;
`ws-grade-render --roles reason-it --no-screen`). Those renders are the before images graded below:
- `/tmp/claude-0/-home-user-MathQuest/64423b02-0b67-53dd-b83b-b0b7a12d175e/scratchpad/preM/<skill>/reason-it-p1.png`
- `/tmp/claude-0/-home-user-MathQuest/64423b02-0b67-53dd-b83b-b0b7a12d175e/scratchpad/preS/...`
- `/tmp/claude-0/-home-user-MathQuest/64423b02-0b67-53dd-b83b-b0b7a12d175e/scratchpad/preL/...`

On those renders, `ws-grade-render` flags OVERFLOW on sub_1m M, add_wp M, sub_wp S and sub_wp L, and on sub_100k L.

The working tree also has uncommitted edits: F8 removes "__ is correct." in `reason-it.js` and `compose.js`. I graded
HEAD (`git archive HEAD`). The provided after PNGs match HEAD, not the working tree.

**Check that would catch it:** the pack builder (and precritic's before/after step) FAILs when a pair the brief names as
changed is byte-identical. It also resolves "before" as the parent of the lane's earliest commit in scope, never as a
status commit.

## 1. Score table (after; caps applied)

| Page set | C1 | C2 | C3 | C4 | Before (true) C1/C2/C3/C4 | vs before | Pass |
|---|---|---|---|---|---|---|---|
| sub_1m_no_regroup Reason It M | 6* | 7 | 5 | 7 | 4/4/3/4 (digits run over the A/B borders and past the cell, H2) | better | FAIL |
| sub_100k_no_regroup Reason It L | 6* | 8 | 5 | 7 | 4/4/3/4 (same overflow) | better | FAIL |
| sub_word_problems Reason It S (+ key) | 6* | 8 | 5 | 7 | 3/4/3/4 (story printed twice, overlapping, cut off at the left page edge) | better | FAIL |
| sub_word_problems Reason It L | 6* | 8 | 5 | 7 | 3/4/3/4 | better | FAIL |
| add_word_problems Reason It M | 6* | 8 | 5 | 7 | 3/4/3/4 | better | FAIL |
| expand Guided S (passed) | 9 | 8 | 8 | 9 | 9/8/8/9 | slightly better (try rows 61→59 px, bottom band 40→38 %) | PASS |
| unit_form Guided M (passed) | 9 | 8 | 8 | 9 | 9/8/8/9 | better (row-2 band 40→34 %, try rows 43→37 %) | PASS |
| combine Guided L (passed) | 9 | 8 | 8 | 9 | 9/8/8/9 | slightly better | PASS |
| compare Guided S | 8 | 8 | 8 | 8 | same, byte-identical | same | PASS (pre-existing) |
| compare Guided L | 8 | 8 | 7 | 8 | same, byte-identical | same | FAIL (pre-existing, not counted) |

\* C1 6 is the pre-existing H16 cap (pre-existing defect E1). Without it, C1 would be 8 on every Reason It set: legible,
one place for each answer, room to write. That does not change the verdict: C3 fails on its own.

## 2. Counted defects (introduced or left by the change)

| Id | Severity | Page and place | Rule | Automatic check that would catch it |
|---|---|---|---|---|
| D1 | counted | Every Reason It page in scope: **one item per page** (Score /1). S takes 1 of the 4 rows PT-RSN-1 allows, M 1 of 3, L 1 of 2. A Grade-2 two-digit story (sub_wp S) now prints one item per sheet. | H5, "a lone item on a page" (C3 ≤ 5); PT-RSN-1 capacity | Precritic / `ws-grade-render --gate`: FAIL when a role page's `fits.perPage` is 1 and the role's ceiling is 2 or more (meta already notes "Tall problems: 1 row per page"). `ws-capacity-pin` should treat a fall to 1 as a failure, not a ruled pin. |
| D2 | counted | Every Reason It page: the A-over-B pair is **centred vertically** in a page-tall cell. On sub_1m M the content is 52 % of the cell, with 24.5 % empty above and 23.5 % below. On sub_wp S there are 43 mm of white between the story and panel A and 41 mm under B. The response column is empty for 56 % of the cell height. Splitting the white top and bottom keeps each band under 30 %. Top-aligned, the white would be one 38-48 % band. | H13 (C3 ≤ 6); CL-4 / CL-4b (a cell starts at the top) | `ws-print-lint` L-TOPSTART extended to the reason-it cell (first ink within 3 mm of the top pad). `ws-empty-band` measuring the SUM of the empty bands in a cell, not only the largest band. |
| D3 | counted (root cause of D1) | The "work wider than half the room" trigger fires on work that fits side by side. The room is measured after the ~60 mm response column is taken out. The widest work in scope is 58-59 mm: the 7-digit stack at M is 223 px ≈ 58.5 mm, the 5-digit stack at L ≈ 59 mm, and the 2-digit story with its unit bank ≈ 59 mm. With the "A B / The answer is" frame moved to a full-width row UNDER the panels, each panel is about 91 mm wide, and A and B stay side by side as PT-RSN-4 asks. An item is then about 60-65 mm of panel plus about 15 mm of frame, so 3 fit at M and 2 at L, nothing shrinks, and nothing stacks. | PT-RSN-4 (side by side, same cell size); PT-RSN-1 capacity | A role-unit check: for each Reason It item, compute the panel width under the "frame under" layout and FAIL a stacked item whose work fits in half of 186 mm. |
| P1 | counted (process) | Evidence pack: before = after for every Reason It pair and both compare pairs (section 0). | Critic-brief integrity (Process rules) | As in section 0. |

**The large white areas.**
- **Reason It.** The white is not acceptable as built. It is the cost of the stack choice, not of the content. The lead's
  ruling ("fewer items fit; content never shrinks") is respected, since nothing shrinks. But the rubric's H5 is explicit,
  and a layout exists that keeps the content at full size and the item count at the PT-RSN-1 ceiling: A | B side by side
  across the full 186 mm, with the response frame as a full-width row under them (D3). Keep A over B only for work that
  is still wider than about 88 mm in that layout, which applies to no page in scope. When an item does stack, top-align
  it (D2) and let the next item use the freed height. A stacked item at M is about 110 mm, so 2 would fit in the 228 mm
  grid once the vertical padding the centring adds is removed (measured hMin is 119.7 mm, while the drawn content is
  about 110 mm).
- **Guided.** The white under the grid is acceptable. PAGE_TYPES's Guided anatomy says the spare height "stays under the
  grid - never as gaps between rows". unit_form M has 66 px ≈ 17 mm under the grid, which is less than one try row (72 px),
  so no item is lost. expand S has about 6 mm and combine L about 5 mm. No page drops below 50 % used, so there is no H5
  and no H13. The bottom band left in the one-line try rows (34-38 % of a 15-22 mm row) is writing room under a top-start
  cell (CL-4b), so it does not count toward H13.

## 3. Pre-existing defects (identical before and after; not counted against the change)

| Id | Severity | Page and place | Rule | Automatic check |
|---|---|---|---|---|
| E1 | counted (pre-existing) | Every Reason It page asks the pupil to circle A or B AND write "__ is correct.": a doubled answer for one choice. PT-RSN-4 currently prescribes this. Ruling F8 is pending, and an uncommitted fix is in the working tree. | H16 (C1 ≤ 6) | `ws-cell-checks` DOUBLE-SLOT: a choice ring and a write line keyed to the same answer in one cell. |
| E2 | counted (pre-existing) | Word-story Reason It (add_wp M, sub_wp S/L): each worked panel prints the unit bank ("days / pencils / boxes") beside an answer line that already reads the unit. Empty carry boxes appear on no-regroup work (add_wp A: 2 empty, B: 3 empty), and an empty hundreds box on 2-digit sums. These parts are dead in a finished solution. | H15 (C3 ≤ 6) | `ws-cell-checks` DEAD-PART on `state: answered` panels: a bank whose unit is already printed, or a regroup strip with no mark. |
| E3 | nit (pre-existing) | sub_1m M item 1: distractor B = 321,265. That is a one-digit slip, not a named misconception. The sub_100k distractor (adds instead, 87,799) is the model to follow. | PT-RSN-4 / PEDAGOGY misconception rule | `ws-roles-unit` RI-MISCONCEPTION: `wrongAnswer(q)` must carry a misconception tag. |
| E4 | counted (pre-existing) | compare Guided L, 3 columns: the 3-digit numbers sit about 3 mm from the cell borders ("924" at x 62 against a border at 50). Hints wrap mid-phrase ("Compare 924 and / 998."), and so does the Model text ("…are 6 / and 3."). 58 mm of white sits under the grid. 2 columns × 3 rows would fit the same 6 tries without the cramp and would use that white. | C3 cramped row (anchor 7); CL padding | `ws-print-lint` ink-to-border ≥ 4 mm; a hint-wrap check (a grey hint one line at its size). |
| E5 | nit (pre-existing) | unit_form Guided M Model: the grey worked steps stop at "7 tens." and never reach "9 ones." Steps item 2 wraps to two lines. | PT-GDP-1 (Model fully traced) | `ws-roles-unit` MODEL-STEPS-COMPLETE: every slot of the Model is named by a step. |
| E6 | nit (pre-existing) | expand Guided S Model: 25 % white under the grey steps (under 30 %, so no H13). | — | — |

## 4. What is right (one line each)

- **Reason It after.** No overflow. Every digit sits on its own grid inside its panel. The story prints once above both
  panels, so the double-print overlap is gone. The key is a facsimile: A ringed and "29" written in INK-31 key ink, and
  85 − 56 = 29 is correct.
- **Guided after.** Rows are held to their measured height, and the spare height has moved under the grid. On the three
  passed skills only the grid area changed (pixel diff bbox inside the grid), and every row band went down.
- **Compare.** No change on this branch. The claimed EB-BAND 46 → 22 for compare cannot be seen in these renders.
  Presumably compare's `tightRows` flag comes from the lf-placevalue branch; the lane should show that on a merged tree
  before claiming it.
