# Critic: lf-ops "sizes" presets, round 2 (narrow re-check)

- **Critic:** independent, Opus 5.5 medium. I did not build this work.
- **Branch:** `claude/sweet-newton-c8wrv1-lf-ops-sizes` at **f4df4ca58**.
- **Date:** 2026-11-21.
- **Renders:** `ws-grade-render.cjs` (A4, 96 dpi), run one at a time through `/tmp/mq-browser-run.sh`. They are in the critic's scratchpad:
  - `a/`: scripted-model, error-analysis and true-false at M (six presets, with keys).
  - `b/`: reason-it at L (three area presets).
  - `c/`: lesson at M and L (area_model_2by2, area_model_3by2).
  - `d/`: area_model_4by1 screens with `--tablet-hosts`.
  - `e-*/` and `f-*/`: the regression pairs, branch against origin/master 575a6abe3.
- **Scope:** the round-1 criticals, rendered and opened on the pages where they appeared. Pages not listed were not re-graded.

## Part 1: the round-1 findings

Scores are C1 ease · C2 teaching · C3 spacing · C4 fidelity. A 7 or below is in bold.

| finding | page (seed as rendered) | verdict | C1 | C2 | C3 | C4 | note |
|---|---|---|---|---|---|---|---|
| F1 | mult_4by1_column Model M (2 p) | **FIXED** | 9 | 8 | **7** | 8 | Each state shows its digits and regroup mark, and the states build up: grey 6 and grey 1 → 76 → 976 → 24976. C3 stays 7 because of F11, which is still open: p1 has about 60 mm blank and p2 is half empty. |
| F1 | mult_3by2_standard Model M | **FIXED** | 9 | 9 | 8 | 8 | 303 × 75. Row 1 and its carry, then the placeholder 0, then row 2 with carry 2, then the sum. Every state is correct. |
| F1 | mult_2by2_standard Model M | rendered, not opened | - | - | - | - | It is on the same long-multiplication stepState path as 3by2 (1 page, 2x4). |
| F1 | area_model_2by2 Model M | **FIXED** (states) | 9 | **7** | 8 | 8 | The parts fill row by row. The partial-sum lines stay blank in the "Add the parts" state (N1). |
| F1 | area_model_4by1 Model M (3 p) | **FIXED** (states) | 9 | **7** | **7** | 8 | The states fill part by part. N1 applies here too. The model takes 6 states over 3 pages (F11), and the page uses the host title (F15). |
| F1 | area_model_3by2 Model M (2 p) | **FIXED** (states) | 9 | **7** | 8 | 8 | Row 40, then row 5, then the total. N1 applies. |
| F2 | area_model_3by2 EA M key (115 × 14) | **FIXED** | 9 | 8 | 8 | 8 | Every part box equals row × column. The pupil's total, 1590, leaves out the 20, and the correct answer is 1610. No comma. |
| F2 | area_model_2by2 EA M key (59 × 64) | **FIXED** | 9 | 8 | 8 | 8 | The total 3740 leaves out the 36; the correct answer is 3776. The work is coherent. |
| F2 | area_model_4by1 EA M key (3 × 3,796) | **FIXED** | 9 | 8 | 8 | 8 | The total 11370 leaves out the 18; the correct answer is 11,388. See N4 on variety. |
| F12 | area_model_3by2 TF M key (284 × 87) | **FIXED** | 9 | 8 | 8 | 8 | The "dropped zeros" error now shows in the part box: 80 × 200 is written as **16**, and the shown parts sum to the shown 8724. |
| F3 | mult_3by2_standard EA M key (647 × 76) | **FIXED** | 9 | 8 | 8 | 8 | Both partial rows and their carries are right. The sum, 48072, writes the carries but does not add them (regroup-not-added); the correct answer is 49172. This is a real error, not a + b. |
| F4 | mult_4by1_column EA M key | **FIXED** (kind) | 8 | 8 | 8 | **7** | 3211 × 4 → 2,844 (last carry dropped). 8693 × 6 → 48,648 (regroup not added). The kinds vary and the digit count is plausible. C4 is 7 because of N2. |
| F4 | mult_4by1_column TF M key | **FIXED** | 9 | 8 | 8 | 8 | The false items are 63303 (regroup not added), 4064 (last carry dropped) and 24288 (regroup not added). They vary and are plausible. |
| F5 | area_model_3by2 Reason It L | **FIXED** | 9 | 8 | 8 | 8 | A is drawn over B at full width. No overprint and no run-off. 184 × 19: 3496 against 3460. |
| F5 | area_model_2by2 Reason It L | **FIXED** (measured) | - | - | - | - | meta: 1 × 1, 177 mm cell, overflow false. Not opened. |
| F5 | area_model_4by1 Reason It L (one a page, **unruled**) | **FIXED** | 9 | 8 | **7** | 8 | It is legible and does not overprint. The item is one a page, with about 30 % of the page blank under it. It still needs a lead ruling (as A9b) or a smaller A/B form. |
| F6 | area_model_4by1 quiz 820 / 1024 / 1280, card 820 | **FIXED** | 9 | 8 | 8 | 8 | The 4th column, its label and its box are fully visible at every width. At quiz 820 the grid's right border lies on the frame line, with 0 mm gutter, but nothing is cut. See N6. |
| F8 | area_model_2by2 lesson M p1 / L p1, area_model_3by2 lesson M p1 / L p1 | **FIXED** | 9 | **7** | **6** | 8 | The chart no longer runs into the footer, and grade-render reports no problems on these pages. The chart is now 3 pages: 2 panels, then 1, then 1 (N5). The add lines are blank in panel 4 (N1). The L chart is the same page as M (same hash). |

Still open, as the status logs it and not re-graded: area_model_3by2 lesson L p5. grade-render measures a Practice cell overflowing there ("content overflows its cell"). Also still open: F7, F9, F10, F11, F13, F14 and F15.

## New findings

| ID | Sev | PNG (scratchpad) | What is wrong | Machine check |
|---|---|---|---|---|
| N1 | M | `a/multiplication__area_model_{2by2,3by2}/scripted-model-p1/p2.png`, `a/.../area_model_4by1/scripted-model-p3.png`, `c/.../area_model_2by2/lesson-M-p3.png` | **The last Model state does not model the add step.** The text says "Add the parts: 2400 + 240 + 120 + 12 = 2772", but the partial-sum lines under the grid stay blank in every state. Only the total box is traced. The pupil never sees where the parts are written, and the add step has no digits of its own. This breaks PT-MOD-1 ("each state shows that step's digits"). The anchor chart has the same gap. | Extend MODEL-STATE-MARKS with MODEL-FINAL-COMPLETE: the Model's last state leaves no work slot empty that the key fills (area `sum-*` lines included). Alternatively, the "add" step's marks must name the sum-line slots. |
| N2 | M | `a/multiplication__mult_4by1_column/error-analysis-key-p1.png` | **The comma in the pupil's wrong work takes a digit column.** "2 1 , 7 6 3" is drawn under "3 1 0 9" with the comma in its own column, so the thousands digit sits one place to the left of Th. In a column-algorithm page this breaks place-value alignment. The key's own answer reads "12844", with no comma (F14). | NO-GROUPED-SLOT (r1 F2), extended to stack wrong-work rows: no ',' glyph in a digit-track row. Or: each digit of a stack answer row has x equal to its place column's x. |
| N3 | m | `a/.../mult_4by1_column/true-false-key-p1.png`, `a/.../area_model_3by2/true-false-key-p1.png` | On True items the key leaves the "Finish the sentence" line blank (for example, "5445 × 7 = ____"), though the instruction asks for it on every item. This is likely role-wide, not this lane's. | TF-KEY-COMPLETE: every pupil blank on a TF page has a key value. |
| N4 | m | EA (3 area presets), Reason It L (4by1, 3by2) | Every area-model wrong work in the sample is "left out the last part". Only TF shows the dropped-zeros error. EA-WRONG-KIND passes because it counts kinds across the deal. A pupil who sees two pages learns "check the last box". | EA-WRONG-KIND per page set: across a skill's EA, TF and RI pages at one seed, 2 or more kinds. |
| N5 | M | `c/.../area_model_{2by2,3by2}/lesson-M-p2.png`, `-p3.png` (the same at L) | The F8 fix moved the overflow into page count. The 4-step anchor chart is now 3 pages, and pages 2 and 3 each hold a single panel: p2 is about 45 % blank and p3 about 40 % blank. That is H5 wasted space on the lesson's front pages (C3 6). Panels 3 and 4 together need about 820 px against about 740 px, so a tighter panel or moving the Say/Rule band would bring the chart to 2 pages. | ws-empty-band EB-PAGE on lesson chart pages, plus a CHART-PAGES cap: a chart of 4 or fewer steps is at most 2 pages. |
| N6 | m | `d/multiplication__area_model_4by1/quiz-*.png`, `card-820.png` | The focused part box draws a vertical divider down its middle, inside the blue focus ring, so it reads as two boxes. The other part boxes have no divider. | SCREEN-SLOT-SHAPE: a focused `[data-ws-slot]` draws the same inner borders as when it is unfocused (compare screenshots or computed borders). |

## Part 2: regression on the shared scripted-model engine

`stepStatesFor` applies to every stepState template whose provider steps carry marks. That includes the default adapter, which puts the answer mark on the last step. I rendered the Model page at M on the branch and on origin/master 575a6abe3 (a temporary worktree, since removed) and compared page hashes, then opened the pairs that differ.

| skill (template) | changed? | verdict |
|---|---|---|
| addition:add_100_regroup (stack) | yes | **better.** On master, states 1 and 2 were empty. Now state 1 shows grey 5 and the regroup 1, and state 2 shows 35. One minor point: an unused H regroup box is now drawn (the anchor-chart drawing). |
| subtraction:sub_100_regroup (stack, exchange) | yes | **better.** On master, states 1–4 were empty. Now: the ring on 3 and 7, then the exchange 3 \| 13 with crossings, then the 6, then the 1. |
| division:long_div_2digit (long-division) | yes | **better.** On master, states 1–3 were empty. Now state 2 shows quotient 2, the 96 and 336, and state 3 shows 27 and the 336 and 0. The steps are correct. |
| addition:add_facts (fact) | no | equal |
| division:div_facts_long (fact) | no | equal |
| number_ops_mixed:which_sign (equation) | n/a | It has no worked steps, so it has no Model page, on master or on the branch. |

Nothing was broken: grade-render reported no problems on any of the pages. The sample is M only. L was not compared for templates outside this lane.

## Overall

- F1 closed: **yes.** The states draw step by step. N1, the blank add lines in the area model's last state, is new and keeps the area Model at C2 7.
- F2 closed: **yes.** F12 is closed too.
- F3 closed: **yes.** F4 is closed too. N2, the comma column in the 4 × 1 wrong work, is new.
- F5 closed: **yes.** area_model_4by1 Reason It L is one a page, scores C3 7, and still needs a ruling.
- F6 closed: **yes.**
- F8 closed: **yes.** N5, the 3-page chart with two half-empty pages, replaces the overflow.

The shared-engine change is safe to carry toward master: **yes.** All three changed pages outside the lane are better, and none is broken.

Not all of these pages pass at 8 yet:
- the area Model (N1);
- the area lesson chart (N5);
- mult_4by1_column EA (N2);
- mult_4by1_column Model C3 (F11);
- area_model_4by1 Reason It L (its ruling).
