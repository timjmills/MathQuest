# Critic run k2-r1: the K-2 build lane (2026-09-25)

The critic worked independently and did not read the lane's reports or self-grades. It graded against `RUBRIC.md` (C1-C4, H1-H13), `OPTIONS-RUBRIC.md` (O1-O6, OC1-OC15) and `LESSONS_LEARNED.md`.

**Tree measured:** a detached checkout of `6fbea62` with a clean working tree. That commit merges `sweet-newton` into lane k2.

**Renders:**
- `ws-grade-render --roles independent,guided,test,error-analysis,stretch,review,scripted-model` at `--size S`, which includes the practice card at 1280/820/390, the online worksheet and the quiz. The run then repeated at `--size L`.
- 15 option-value renders at S and L.
- The live teacher option panel at 1280 and 420.
- `ws-options-verify --skill <id>` for each of the 10 skills.
- 30 seeded items per option value, all read.

The PNGs are in `tests/audit-runs/k2r1-{S,L,opt}/`, which is ignored and not committed.

**Measurements:**
- Empty bands came from a pixel scan of each cell: the largest run of ink-free rows or columns as a percentage of the cell. H13 applies at 30 % or more.
- Items per page came from `meta.json` and were checked against the PNG.
- Keys were checked by hand on every page viewed. None were wrong.

## Pass counts

| | Graded | Pass |
|---|---|---|
| Page and host versions, default options (10 skills × 7 page types × S/L, plus 5 screen hosts) | 190 | **31** |
| Option-value versions (bonds_in_order, count_objects) | 28 | **2** |
| Option panels | 10 | **2** (compare_size, ordinal_numbers) |
| Skills passing every version | 10 | **0** |

Default versions passing, by skill:

| Skill | Pass |
|---|---|
| ordinal_numbers | 9/19 |
| count_objects | 6/19 |
| zero_none | 4/19 |
| match_same | 4/19 |
| odd_one_out | 4/19 |
| compare_capacity | 3/19 |
| bonds_in_order | 1/19 |
| compare_size | 0/19 |
| what_can_we_measure | 0/19 |
| sort_into_groups | 0/19 |

Default versions passing, by page type or host:

| Page type or host | Pass |
|---|---|
| independent | 3/20 |
| test | 2/20 |
| guided | 1/20 |
| review | 2/20 |
| error-analysis | 0/20 |
| scripted-model | 0/20 |
| stretch | 1/20 (bonds S) |
| card 1280 | 6/10 |
| card 820 | 6/10 |
| card 390 | 4/10 |
| quiz | 6/10 |
| worksheet | 0/10 |

Caps applied:

| Cap | Versions |
|---|---|
| H13 (wasted space in a cell) | 64 |
| H3 (item contradicts the skill's name) | 21 |
| H12 (task makes no sense on paper) | 18 |
| H5 (page wasted) | 11 |
| H8 (doubled answer slot) | 1 |

Criteria below 8: C2 in 134 versions, C3 in 120, C1 in 66, C4 in 7.

Items per page on the independent page, S / L: count_objects 10/10, zero_none 8/6, match_same 10/10, ordinal 10/8, compare_size 16/12, odd_one_out 10/8, capacity 10/8, measure 10/10, sort 4/3, bonds 4/4. With `task=same` it is 4/4, with `band=5` 8/4, and with `notation=across` 2/2.

## Defects grouped by root cause

Each group names the files to change.

### 1. The answer position cycles, or never changes (L3, answer given away)

`js/modules/gen-counting.js`

Every K choice skill deals the correct position through `_kDealShuffled(n)`. That is a permutation shuffled once and then repeated in a fixed period.

| Skill | Pattern across 30 sampled items |
|---|---|
| compare_size | A/B strictly alternating |
| what_can_we_measure | long/heavy strictly alternating |
| count_objects `task=same` | Same/Not the same strictly alternating |
| match_same | 3-cycle |
| compare_capacity | 3-cycle |
| odd_one_out | 4-cycle |
| ordinal_numbers | 5-cycle |

A pupil can answer a page by pattern.

Worse cases:
- `bonds_in_order task=pattern` answers **"Goes down by 1" on 30 of 30 items**. `ask` and `down` both come from `_kDealShuffled(2)` and move in lockstep, so `goesUp` is always false.
- `sort_into_groups task=rule` answers "By kind" on 30/30 at the default "Sort by", and `odd_one_out task=rule` answers "A different kind" on 30/30. Each value only works if the teacher also changes a second control (OC6).

**Fix:** deal answer positions from independent random draws with repeats allowed, keeping at least 2 of each per page. Deal `ask` and direction independently. Make the "rule" tasks mix their attributes by themselves.

### 2. Wasted space in cells (L2, H13), and S no denser than L (L1)

`sheet/layout.js`, `sheet/roles/{error-analysis,review}.js`, `cells/{counters,bond}.js` (footprint)

- **Error analysis:** 38-45 % bands in the lower half of every cell for count_objects, match_same, compare_size, odd_one_out and what_can_we_measure.
- **Review:** each section is sized to the tallest item in the mixed-review section. Examples are compare_size S (6 items, 31-35 %), what_can_we_measure, and the mixed item in sort_into_groups. ordinal L and capacity L review drop to one column.
- **Small pictures in big cells:** what_can_we_measure (30-36 % on 9 of 10 cells), compare_size (30-35 %), and count_objects with 1-2 objects (32-37 %).
- **S is no denser than L:** count_objects, match_same, what_can_we_measure and bonds (4/4) print the same count at S and L (OC14). The bonds S cells are 106 mm tall around a 55 mm table (fill 34 %), so six would fit.
- **Lone or near-empty pages (H5):** bonds EA L holds one item per page. bonds review L holds 2 items. bonds `across` holds 2 per page at both sizes.

### 3. Scripted Model pages

`sheet/roles/scripted-model.js`, the provider's `workedSteps` marks, `bond.js stepState`

- In all 10 skills, states 1-3 are the identical blank picture (PT-MOD-1). Step marks are never drawn: the bonds "Write 2" state shows no grey 2, and in sort the rings stay empty.
- State rows are 45-83 mm where PT-MOD allows 36/45/54 mm, so step panels are 68-86 % empty (H13).
- At L the model runs to 2 pages with a lone last state (H5). bonds L runs to **4 pages, one state each**.
- zero_none models counting 2 and never models 0.
- The circle-counting model never shows "mark where you start".

### 4. Stretch uses the generic "basic" fallback on K picture skills (H3, H12)

`sheet/roles/stretch.js`, `providers/k2.js`

- Eight skills print "Here is one problem and its answer. Find more problems like it." with the instruction as the problem and "B" as the answer.
- count_objects and zero_none print "Two numbers add to 18/3".
- Only bonds_in_order has a real open task.

**Fix:** supply `open(q)` per skill, or withhold Stretch for these skills. PAGE_TYPES allows withholding.

### 5. Choice rows and ordinal lines wrap on screen (paper ≠ screen, L5)

`sheet/cells/k2kit.js` (`choiceRow`), `screen-cell.js`, `css/screen-cell.css`

- ordinal_numbers breaks the line from the flag into two rows: A-C/D-E in the worksheet and A-D/E on the 390 card. The representation then contradicts the skill (C2 5).
- match_same (2+1) and odd_one_out (3+1) wrap in every worksheet card.
- count_objects and zero_none pictures touch the left cell border in the worksheet.
- bonds `level=3` at 390: the table falls apart into per-row boxes with the dots wrapped underneath (C3 4).
- sort_into_groups on screen has no sorting action. The pupil only types the two counts.

### 6. Instructions and steps don't follow the item (L6)

`providers/k2.js`, `sheet/roles/error-analysis.js`, `gen-counting.js`

- **bonds_in_order:** direction alternates item by item (up, down, up …) with no option to control it. The Guided step strip comes from the model's direction, so it contradicts half the items ("The first part goes down by 1" over tables listed 0-first). The missing-rows step "Read the row above the gap" fails when the gap opens the second half.
- **Error analysis on check-box skills:** every item says "Sam wrote:" and the instruction says "Fix it: write the right answer", but the fix is a check box.
- **bonds Error analysis:** the pupil must rewrite all 6-8 blanks in a detached row of comma boxes.
- **count_objects `band=30`:** the skill is named "Count Objects (1-20)" and the title says "I Can count objects to 20", but the page deals 21-32 objects (H3). The rows of ten also have no five-gap.

### 7. Drawings too small, or not scaled with the size

`cells/counters.js` (kind zero), `cells/` (sort-rings, capacity)

- zero_none objects are about 4.5-5 mm at both S and L, inside a 40-50 mm plate.
- sort_into_groups ring labels are about 4 mm and the tiles 6-7 mm.
- The full-jug grey fill leaves a white wedge.
- The zero_none review mixes in a legacy count_sequence cell that has both a box and an "Answer: ____" line (H8).

### 8. Option panels

`skill-options.js`, `skill-options-ui.js`

- **count_objects:**
  - The Arrangement help reads "Stacked in columns, or written across on one line." That text was copied from operations.
  - There are two "Support" headings.
  - The checklist is drawn only in print, not on screen (OC3).
  - "Count to 30" contradicts the skill's name.
- **bonds_in_order:**
  - The panel's Sample question renders as a blank box.
  - There is no direction control.
- **sort_into_groups:** there is no count range. The counting family's essential option is missing (OC9).
- **match_same:** there is no support control.
- **what_can_we_measure:** there is no appearance choice.
- **zero_none, compare_capacity, what_can_we_measure:** support applies to the first task only.

`ws-options-verify` passed all 76 values across the 10 skills, with warnings only. The failures above come from reading the items and renders, not from the verifier.

## Top fixes, in order of pupil impact

1. `gen-counting.js`: replace the cyclic answer-position deals with random draws that allow repeats. Fix the lockstep in bonds `pattern`, where every answer is "down". Make the "rule" tasks mix their attributes.
2. `k2kit.js choiceRow` and `screen-cell.css`: never wrap an ordinal line or a choice row. Scale tiles to the card instead. Fix the bonds table at 390 with level 3.
3. Stretch: withhold it for K picture skills, or give each skill a real `open(q)`. Scripted Model: draw step marks, use the PT-MOD row heights, and keep the model to one page (bonds L is 4 pages).
4. Error analysis and review layout: remove the bottom bands in EA cells, and size each review section by its own items. Put EA fixes on check-box skills in check wording.
5. bonds_in_order:
   - Add a "Start from" option and keep one direction per page.
   - Take the guided steps per item.
   - Fit 6 tables at S and 2 columns for sentences.
   - Correct Error analysis in the table itself.
6. count_objects:
   - Rename the label and title for count to 30, and add a five-gap to the rows of ten.
   - Restore the Arrangement help text.
   - Size circle rings from n.
   - Draw the checklist on screen.
7. Scale the zero_none objects and the sort-ring labels with ctx.metrics. Let S hold more items than L for count_objects, match_same and what_can_we_measure.
