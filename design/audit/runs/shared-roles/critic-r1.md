# shared-roles: independent critic, round 1

Critic: independent (built none of it), Opus 5.5 medium. Branch `claude/sweet-newton-c8wrv1-shared-roles` @ 315bff4e
(already merged with `claude/sweet-newton-c8wrv1`). Date 2026-10-31. Scored before reading `design/status/shared-roles.md`.
Error analysis is not scored (RUBRIC scope note). R1-7 is out of scope (moved to the M2 lane).

## How it was graded
- `ws-grade-render --roles scripted-model,lesson,guided,opener,pre-skill-check,reason-it,review --size S,M,L --dpi 150` for
  `subtraction:sub_2d_1d`, `addition:add_facts`, `multiplication:mult_facts`, `division:div_facts`, `fractions:identify`
  (295 pages, pupil + key), with the screen hosts (practice card 390 / 820 / 1280, online worksheet 1280, quiz 1280).
- `--roles independent,test --opts '{"notation":"across"}'` S / M / L for add_facts, sub_facts, mult_facts.
- `ws-print-lint --source kit` for the same 5 skills x 7 roles x S / M / L, and the across option at S / L (`r1/lint-*.txt`).
- Base comparison on the lane start 512542af (scratch checkout) for fractions Reason It, the guided pages and the add_facts
  Review key, so that "pre-existing" and "regression" claims are measured, not assumed.
- Two more redesign-passed skills (sub_100_no_regroup, sub_1m_no_regroup): scripted model + lesson at S.
- Pixel measurements are taken from the 150 dpi PNGs (5.9 px = 1 mm).

## Verdict per defect

| Defect | Verdict | Evidence |
|---|---|---|
| R1-3 scripted model | **NOT FIXED** (part done) | Fixed: the key carries the answers and says "Answer Key" (`r1/R1-3b`), and each model fits one page. Not fixed: the panels still do not draw their steps. add_facts merges "Make 10: 8 + 2 = 10 / 5 is 2 and 3 / 10 + 3 = 13" into one panel whose drawing is the bare 8 + 5 (`r1/R1-3a`). The merge leaves 55-63 % of every scripted-model page blank, at S, M and L, on all 5 skills (H5). New: div_facts M and L have no rule between the two states and no divider above `Say:` (`r1/R1-3c`, `r1/R1-3d`). |
| R1-5 lesson steps / anchor / guided | **NOT FIXED** | Fixed: the Steps beside the guided and practice items are generic now (`r1/R1-5c`). Not fixed: the anchor is still the edge case in the operation families: mult_facts 11 x 11 with "11, 22, 33 ... 121" (`r1/R1-5a`), div_facts 110 ÷ 11 (`r1/R1-5b`). The first guided item is the hardest fact (12 x 11, 132 ÷ 12). |
| R1-8 pre-skill check | **NOT FIXED** (part done) | Fixed: the page is about 85-90 % used and its skill ids differ from the page's own. Not fixed: PT-PRE-2 (4-5 items in each of 4 quadrants) is broken everywhere: bands of 1 or 2 items (sub_2d_1d L "Draw the jumps" /1 `r1/R1-8b`; add_facts "Write the missing number" /1 `r1/R1-8a`; mult_facts "Double 7" /1 `r1/R1-8d`). Some prerequisites make no sense for the skill: fractions:identify checks "Circle groups of 4" (3.OA.2), "A has fewer" (K.CC.6), and then two quadrants of the skill itself ("Write the fraction", "Shade the fraction") (`r1/R1-8c`). add_facts' "Add" quadrant deals 8 + 6 and 7 + 5, which are add facts to 20, the page's own content. |
| R1-9 Reason It keep-out | **FIXED** | No CL40-INK on any fact Reason It at S / M / L (lint). The A box starts 2.4 mm right of the label (`r1/R1-9a`). |
| R1-10 add_facts Review M H13 | **FIXED** (H13). The same row is still red for another reason | L-DENSITY is clear at M. L-KEY AK-4 is still **critical** at S / M / L ("key has 16 answer slots, pupil page has 12"), and it is red on 512542af as well. The Mixed Review slots are 5-9 mm lines at S (`r1/R1-10a`), and the key writes "Answer: 20" under the cell rather than in the slot (`r1/R1-10b`). |
| R1-11 div Review L strip | **FIXED** | No CL40 at L. The strips count by 2 / 3 / 4 (L) and 2 / 3 / 4 / 5 (S) (`r1/R1-11`). |
| R1-12 across CL40-INK | **FIXED** (CL40) | Lint is 0 findings at S and L. The pages fail for another reason: see N4. |
| R1-13 guided > 40 % empty | **NOT FIXED** for add_facts and sub_2d_1d; fixed for mult_facts | add_facts guided S: the try rows are 360 px (61 mm) against the Model row's 282 px. The fact + answer zone ends 218 px down, so a 142 px band (39 %) is empty (`r1/R1-13a`). sub_2d_1d guided L: 170 / 480 px = 35 % (`r1/R1-13b`). sub_2d_1d guided S is byte-identical to 512542af (pixel diff `None`). Commit d3cb1f90 kept "guided pages without a think-line Model byte for byte as before", so the fix only reaches mult_facts and div_facts (`r1/R1-13c`: 14 % band). Lint reports **no** H13 on these pages, which is a blind spot. |
| R1-14 Opener "Use the dots" | **FIXED** | The Opener steps read "Count on the smaller number." (`r1/R1-14`). The Guided page keeps "Use the dots." with dot tiles in its first row, which is correct. |

## Score table (C1 / C2 / C3 / C4, worst size named)

S and L were graded in full and M spot-checked. Lint ran at S, M and L.

| Role | sub_2d_1d | add_facts | mult_facts | div_facts | fractions:identify |
|---|---|---|---|---|---|
| Scripted model | 8/7/**5**/7 (all, H5) | 8/**6/5**/7 (all) | 8/**6/5**/7 (all) | **7/6/5/6** (M, L: no state rule) | 8/**6/5/6** (TY-7 slash "1/4", empty Say frame) |
| Lesson packet | 8/8/8/9 | 8/8/8/9 | 8/**6/7**/8 (S anchor 11 x 11) | 8/**6/7**/8 (S anchor 110 ÷ 11) | 8/**6/6/6** (lone guided item, TY-7 "Write 2/4", L H13) |
| Guided | 8/8/**6**/8 (S and L H13; M / L TOPSTART x16 / x10) | 8/8/**6**/9 (S H13, uneven rows) | 8/8/8/9 | 8/8/**7**/9 (S: page 45 % blank) | **7/3/7/7** (S: hint gives the answer, N2) |
| Opener | 8/8/**7**/8 (M / L TOPSTART x10 / x8) | 8/8/8/9 | 8/8/8/9 | 8/8/**7**/9 (S: 37 % blank under the grid) | 8/**7**/8/8 (Steps do not fit "denominator =" items) |
| Pre-skill check | 8/**7/6/7** (L: lone item; M CL40-INK) | 8/**6/6/7** | 8/**7/6/6** (legacy "Double" bar) | 8/**7/6/7** | 8/**4/6/7** (wrong prerequisites) |
| Reason It | 8/8/8/8 | 8/8/**6**/8 (L H13 48 %) | 8/8/**6**/8 (L H13 48 %) | 8/8/**6**/8 (S, equation boxes, band 60 %) | **4**/7/**4/6** (S, M, L overflow, N1) |
| Review | 8/**7**/8/9 (Mixed Review harder than the skill) | **5/3**/7/7 (S: 5 mm slots, AK-4) | 8/8/8/9 | 8/8/8/9 | 8/8/8/8 |
| Independent, notation=across | n/a | 8/8/**6/7** (S = M = L 4 x 4, band 59 %) | 8/8/**6**/8 | n/a | n/a |
| Test, notation=across | n/a | 8/8/**6**/8 | 8/8/**6**/8 (L band 50 %) | n/a | n/a |
| Practice card 390 / 820 / 1280 | 9/9/9/9 | 9/9/9/9 | 9/9/9/9 | 9/9/9/9 | 9/9/8/9 |
| Online worksheet 1280 | 9/9/8/9 | 9/9/8/9 | 9/9/8/9 | 9/9/8/9 | 8/8/**7**/8 (mixed card kinds, slash "2/6" in the prompt, pre-existing) |
| Quiz 1280 | 9/9/9/9 | 9/9/9/9 | 9/9/9/9 | 9/9/9/9 | 9/9/8/9 |

sub_facts was rendered on the across option only: Independent L 8/8/6/8 (cells 225 px, content to about 100 px). The screen
hosts did not regress. The lane does not touch `screen-cell.js`, and the fact-cell change in `cells/fact.js` renders the
same on the card, the worksheet and the quiz as before.

## New or newly measured defects

### N1 (fractions:identify, pre-existing, worse at base) Reason It "which model shows ½" overflows its A / B box
- **Where:** reason-it S / M / L, items 1 and 3. The ½ sits left of box A, under the cell label; options B and D run out of
  box A into box B; and a second ½ overprints box A's B bar. The renderer flags OVERFLOW, and lint flags PG-12 x2 and TY-7
  ("5/8" slashed in the answer frame) (`r1/N1`). The same page at 512542af is also broken.
- **Rule:** H2 (overlapped, C1 ≤ 4), PG-12, TY-7, PT-RSN-4 (two worked solutions at the same cell size).
- **Fix:** give the "pick a model" kind its own footprint in Reason It (one box per row, 2 rows a cell, or the 2 x 2 option
  grid at its measured width), and print the answer frame's fraction stacked.
- **Check:** ws-print-lint PG-12 caught it (red), and the grade-render OVERFLOW flag also fired. It reached the critic
  because precritic's Reason It row runs on the fact family only. Add `fractions:identify` (a legacy-fraction cell) to
  precritic's Reason It sample.

### N2 (fractions:identify Guided, pre-existing) The grey hint gives the answer away or names the wrong part
- **Where:** guided S / M / L, row 1. The "5/6 numerator = □" item is hinted with "The numerator is the number on top: 5"
  (the answer). The "6/8 denominator = □" item is hinted with the numerator sentence ("... on top: 6"), which invites the
  wrong answer 6 (`r1/N2`). The page mixes three task kinds ("write the fraction", "numerator =", "denominator ="), against
  PT-GDP ("one kind of problem per page, so the Steps fit every item"). The Steps (count all parts, count shaded, write)
  do not fit the "numerator =" items.
- **Rule:** L3 (answer given away), PT-GDP hint line "holds none of its answer", L6, C2 ≤ 3 for misteaching.
- **Fix:** the hint line is the item's own first worked step with the answer as a gap ("The ___ is the number on the
  bottom."), and it is chosen per task kind. Guided keeps one task kind (the kind the pool deals most).
- **Check (new):** `L-HINT-ANSWER` in ws-print-lint, or a providers-unit check: no hint / caption text on a pupil page may
  contain the item's key value as a standalone token, and a hint's named part (numerator / denominator) must match the
  slot's label. Backtest it on 315bff4e (fails) and on a fixed tree.

### N3 (stack subtraction, pre-existing, all 7 redesign-passed skills) Merged panels lose a teaching step
- **Where:** the sub_1m_no_regroup lesson anchor, panel 3: "Each place to the left" rings 4 columns at once and writes 4
  differences in one line. Its scripted model at S does the same, and the page is 45 % used (`r1/N3`). The builder's
  "byte-identical across 105 renders" claim holds (I compared sub_2d_1d guided against base: identical), so this is
  pre-existing. It is still on a lesson / model page in scope.
- **Rule:** PEDAGOGY P-1 (one new thing per step), PT-MOD-1 (one state per `workedSteps` entry).
- **Fix:** for 4+ place values, one panel per place up to the page capacity (6 / 4 / 3 states), and continue on the next
  page (PT-MOD-3).
- **Check (new):** a providers-unit check: a scripted-model state or anchor panel may introduce marks in at most one place
  value / one strategy step.

### N4 (across notation, add / sub / mult) The across cells are 50-60 % empty, and S prints the same grid as L
- **Where:** add_facts across Independent S / M / L are all 4 x 4. The cells are 340 px (58 mm), and the fact + answer
  line end 140 px down, so 59 % is empty (`r1/R1-12`). mult Test L has a 50 % band. sub_facts prints 2 x 8 at S and 3 x 8
  at M (fewer columns at S).
- **Rule:** H13 (C3 ≤ 6), L1 (Size S ignored).
- **Fix:** size the across rows to the fact line + slot (about 20 mm at S), and fit 4-5 columns x 6-8 rows at S.
- **Check:** ws-print-lint reports **0** findings on these pages, so H13 does not see one-line cells whose answer line is
  their last ink. Extend L-DENSITY H13 to measure the band below the last ink of every cell (a slot counts as ink), and
  add `ws-columns --sizes` (items S ≥ M ≥ L) for the across option.

### N5 (div_facts scripted model, new in this lane's merge) No state rule, no `Say:` divider
- **Where:** scripted-model M and L. The two equation states share one box without the 1 pt rule between them, and the
  `Say:` band has no 1.5 pt divider above it (`r1/R1-3c`, `r1/R1-3d`). The left frame shows breaks at both places.
- **Rule:** PT-MOD layout, PT-OPN-9 (Say divider), C4 frame.
- **Fix:** in `roles/scripted-model.js`, draw each merged state with its own row rule whatever the height of the
  equation template, and always emit the Say divider.
- **Check (new):** an L-FRAME lint: every scripted-model state row and the Say band carry a top rule ≥ 1 pt across the
  full width.

### N6 (pre-skill check, all) Stray grey rules under the quadrant grids
- A thin grey line is left at the foot of the quadrant grids (add_facts S y≈1028 / 955; sub_2d_1d L y≈885 / 918;
  mult_facts S y≈1137 / 1222). These are the unruled trailing area's border. **Rule:** C4 (one grey, used only for traces
  and fills). **Fix:** draw no border on PT-ENG-7 trailing positions. **Check:** an L-INK check for grey hairlines that bound
  no cell.

## Defect findings (rule, fix, check)

| # | Rule | Fix | Check that would have caught it |
|---|---|---|---|
| R1-3 (steps not drawn; page 55-63 % blank) | PT-MOD-1, H5, P-1 | Each state draws its step: the make-ten split for add, the skip-count strip for x, the think line for ÷. Merge only states whose marks are identical, and size states so a model fills its page or prints 2 examples. | **Existing** PAGEFILL does not run on scripted-model ("no ceiling"). Add a scripted-model floor (≥ 50 % used) and a check that state i+1's DOM differs from state i's. |
| R1-5 anchor | L6, PEDAGOGY 4 (model on a typical item) | The anchor picks from the core band (mult 3-9 x 3-9, div dividend ≤ 81). 10s, 11s and 12s are kept for practice. Guided starts easy. | **New** providers-unit: the anchor's operands lie within the band's 10th-90th percentile. The lane's "edge-case anchors only in operation families" rule was applied backwards (×/÷ are operation families). |
| R1-8 | PT-PRE-1/2/3, H5 for a quadrant | 4 prerequisites x 4-5 items. Prerequisites come from the curriculum's `pre` list filtered by grade ≤ the skill's grade, and must not share the skill's CCSS code (3.NF.1 for identify). | **Existing** ws-columns counts only "≥ 3 groups". Add: every group ≥ 4 items (or 2 at L for long items), and no prerequisite shares the page skill's primary CCSS. |
| R1-10 (AK-4) | H1 (C2 ≤ 3), H9 | Mixed Review across items get slots of ≥ 14 mm, and the key writes into the slot. | **Existing** L-KEY AK-4 is red at S / M / L. The status file listed it "outside this lane", but it is on the role this lane owns. Precritic rule 0b: a red row on an affected role blocks the critic. |
| R1-13 | H13 | Grow try rows only to the Model row's height (the even-row rule), and spend the rest on more rows up to the ceiling. Apply it to every guided page, not only think-line ones. | **Existing** H13 is blind here. Make L-DENSITY treat the stack answer zone as one digit height, not the whole cell below the rule. |
| N1-N6 | see above | see above | see above |

## Speed notes
- 4 of the 9 source defects were fully fixed (R1-9, R1-11, R1-12 CL40, R1-14). Three were half fixed (R1-3, R1-8, R1-10):
  the machine-checkable half (key, page fill, keep-out) was done, and the half that needs a teaching judgement (steps drawn,
  sensible prerequisites, items per quadrant) was not. The brief named the second half, so the builders' own pre-flight
  should list each clause of a defect and close it one by one.
- R1-13 was fixed and then reverted for non-think-line pages by d3cb1f90 ("byte for byte as before"). Keeping goldens stable
  conflicted with the defect. When a fix and a golden conflict, the golden should yield, with the change recorded.
- 3 lint blind spots let pages that fail by eye pass the gate: H13 on stack answer zones, H13 on one-line across cells, and
  scripted-model page fill. Each is cheap to add, and each would have kept this round from being needed for those findings.
- AK-4 on add_facts Review was red in precritic and was handed off as "outside this lane". A red row on an affected role
  should block the critic, whoever owns the cell.
- Rendering: 5 skills x 7 roles x 3 sizes took 13 min of browser time. The lint pass took another about 8 min. Running the
  lint first, then rendering only the roles that are clean, would have saved about a third.

VERDICT: FAIL
