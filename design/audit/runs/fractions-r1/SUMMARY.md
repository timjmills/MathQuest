# Fractions lane round 1 — independent critic (2026-09-26)

Tree 4914ea1. Grades: branch `critic-fractions-r1` b2bbdd0, `design/audit/runs/fractions-r1/grades.jsonl` (268 rows,
617 defects with where / what / fix / file). Full matrix on 12 skills (7 page types × S+L, 5 screen hosts); reduced set
(independent S+L, guided L, 5 hosts) on 14.

**Result: 0 of 26 skills pass. 62 / 242 versions; 4 / 26 panels** (count_in_fractions, mixed_numbers_intro,
add_fractions_like, sub_mixed_like). By version: independent 1/26, guided 1/26, test 1/12, error-analysis 0/12,
reason-it 5/12, stretch 3/12, review 1/12, each screen host 10/26. Criteria < 8: C1 34, **C2 153** (mean 7.1), C3 58,
C4 13. Caps: H13 ×14, H3 ×14, H5 ×13, H1 ×2, H2 ×1; OC14 ×8, OC4 ×4, OC8 ×2, OC9 ×2, OC15 ×1. **C2 is what fails: the
drawing is clean, what the generators deal is not.**

Per skill (versions; panel): identify 0/12 (O2 7, O3 5, O5 7) · write_fraction 10/12 (O2 7, O3 5) · shade 0/7 (O2 7,
O3 5) · compare 0/12 (OC4) · equivalent 5/7 (OC14) · equiv_frac_visual 5/12 (OC14) · equiv_frac_nv 5/7 (OC14) ·
fraction_number_line 0/12 (O3 5, OC15) · count_in_fractions 0/12 (panel pass) · mixed_numbers_intro 6/12 (panel pass) ·
percent_visual 0/12 (OC9, O3 5, O6 7) · add_fractions_like 0/7 (panel pass) · sub_fractions_like 0/7 (O2 7) ·
add_mixed_like 7/12 (O5 7) · sub_mixed_like 5/7 (panel pass) · add_frac_like_nv 1/12 (O3 5, OC14) · sub_frac_like_nv 0/7
(O2 7, O3 5) · add_mixed_like_nv 5/7 (OC14) · sub_mixed_like_nv 2/12 (OC14) · add_mixed_unlike_nv 0/7 (OC4) ·
sub_mixed_unlike_nv 0/7 (OC4) · add_frac_unlike_nv 5/7 (OC4, OC14) · sub_frac_unlike_nv 5/7 (O2 7, O3 5) ·
decompose_fractions 0/7 (OC8, OC14) · frac_as_division 0/7 (O2 7) · frac_mult_word 1/12 (O1 6, O3 5, OC8, OC9).

## options-r3 re-checked
Fixed: unshaded circles; "Pick the model" draws A–D; borrowed "I Can" titles; default model mix; add_fractions_like
result bar; multi-select and sort-bins removed; NV subtraction labels; add_mixed_like_nv mixed slot; fraction_number_line
6 at L / 8 at S; S = L on identify, write, shade, compare, add/sub mixed like; regroup control. Partly: compare "Which
pairs" ignored by compare-with-half; NV twins 10 a page but S = L. Still: identify deals sevenths with families 2, 3, 5
ticked (panel sample "denominator of 1/7"); sub_frac_like_nv missing number 1 in 17/30; no support control on identify,
write, shade, NV twins; "Work it out and simplify" still in the item-forms list; no tick-label choice on
fraction_number_line; equiv_frac_visual S = L.

## Root causes (files)
1. **Repetition and give-aways (L10, L3) — C2 on 20 skills** (`gen-fractions.js`, `providers/fractions.js`). Per 30 items:
   add_fractions_like sums to 1 in 14 (3 of 4 on the L page); sub_frac_like_nv missing number 1 in 17 (run of 7),
   sub_frac_unlike_nv 16 (run of 9); add_frac_like_nv missing 1 or 2 in 19; decompose 1/2 + 1/2 in 10; frac_as_division
   a ÷ a = 1 in 14 (fifths); shade 1 part in 18; number line 1/2 in 9 (15 with halves); count "2/3, 1" in 9–10;
   percent_visual 15-item cycle; frac_mult_word fixed 4-story cycle with exact repeats; compare no "=" at default.
   Give-aways: NV slot is a mixed frame only when the answer passes 1; percent prints the answer in the question
   ("20% = __ squares", "40% = __/100"); frac_mult_word prints the number sentence under every story; decompose prints
   every "1" numerator and one box per unit fraction.
2. **Option promises broken (H3 / OC4)** — add/sub_mixed_unlike_nv deal tenths / fifteenths / thirtieths with Halves +
   Thirds; add_frac_unlike_nv with only Fifths deals 3, 4, 12 live; compare pairs ignored by compare-with-half;
   equiv_frac_visual review deals sevenths; verifier lacks default-value checks and a `pairs` predicate (`gen-fractions.js`,
   `ws-options-verify.cjs`).
3. **Answer form never decided (H1 ×2)** (`providers/fractions.js`) — keys mix simplest and unsimplified on one page
   (14/20, 10/12, 34/24 but 1 4/15); "Add." pages key simplest; unlike guided steps say "Simplify" while model and key are
   unsimplified (22/30, 9/12, 4/24) — a pupil who follows the step is marked wrong; NV "Add and simplify" items often have
   nothing to simplify.
4. **Role pages built for whole numbers** — EA fix slots slashed "[ ] / [ ]" (TY-7) on 9 skills, cells 32–46 % empty
   (H13 on 8); Reason It one item a page at L (and at S for the line), 45–60 % blank (H5 on 6); count_in_fractions Reason
   It broken (H2: line runs out of A/B boxes, values clipped, solution boxes empty); Stretch prints the "Find fractions
   equal to …" fallback on 7 skills whose task it is not, and at S two identical tasks (`roles/error-analysis.js`,
   `roles/reason-it.js`, `providers/fractions.js` fracOpen, `roles/stretch.js`).
5. **Page geometry (H5 / H13)** — S: equivalent and equiv_frac_nv print 12 on 3 one-row pages (page 3 211 mm blank);
   compare S page 2 4 items with 149.5 mm blank. S ignored: add_frac_like_nv, add_mixed_like_nv, sub_mixed_like_nv,
   add_frac_unlike_nv 2×5 at both; decompose fewer at S (4) than L (5). Half-empty first rows: percent L, count S,
   add/sub_mixed_unlike_nv L, frac_as_division L. Single full-width columns 35–42 % empty: mixed_numbers_intro test /
   review, add_frac_like_nv test / review. Overflow: frac_mult_word test 6.1 mm, review 4.5 mm; sub_mixed_like_nv review
   4.5 mm; frac_as_division guided cuts a cell. Guided spills to 2–3 pages (`layout.js`, `print-sheet.js`, `roles/guided.js`,
   `roles/review.js`, `cells/frac-model.js`).
6. **Drawing** (`cells/frac-model.js`) — count_in_fractions ticks follow printed widths (unequal "equal steps"); number line
   mixes three cell layouts per page and draws random hop arcs, including a hint on a Test; bars of 9–12 parts only
   2–2.9 mm per part; shade bars float in 31–34 % empty width.
7. **Screen** — card digits 51.6 / 44 / 34 px at 1280 / 820 / 390 vs rubric 56 / 48 / 40 on every card; prompt line repeats
   the item with slashed fractions above the stacked cell, frac_mult_word prints the story twice; shade puts a black
   "Submit" inside the paper cell; count and decompose wrap at 390 and in the worksheet; worksheet header "Mixed practice"
   for every id containing "mixed" (`screen-cell.js`, `gen-fractions.js` q.text, `worksheet.js` _wsHeaderPill). No
   horizontal scroll, small targets or console errors.
8. **Panels** (`skill-options.js`, `skill-options-ui.js`) — no support control on 15; decompose frame and frac_mult_word
   sentence are unfadeable hints (OC8); missing steps: unit vs non-unit numerators, take from a whole, denominator
   relationship (unlike), regrouping on unlike NV, share size on frac_as_division; percent no size ladder, frac_mult_word
   only denominators (OC9); number line no tick-label choice (OC15); preview empty on add_mixed_like and frac_mult_word.

## Top fixes
1. Rebuild EA and Reason It for fractions: stacked fix frames, content-sized cells, 2 a page at L, count-row overflow.
2. Deal without repeats or give-aways: de-duplicate per page, no answer more than twice, "=" pairs in compare, one slot
   shape per section, reverse the percent give-aways, blank sentence frame on word problems.
3. Keep ticked denominator families and compare pairs; default-value predicates in the verifier.
4. One answer-form rule: "in simplest form" where the key simplifies; key simplest wherever a step says Simplify.
5. S sizing and pagination: NV sentence cell from ctx.metrics; 4 × 3 S grid on one page; no half-empty first rows or
   35–42 %-blank full-width rows.
6. Each skill its own stretch task.
7. count_in_fractions number line with equal ticks.
8. Panels: fading support control and the missing difficulty steps.
