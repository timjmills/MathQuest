# Critic: lf-ops "sizes" presets, round 1

- **Critic:** independent, Opus 5.5 medium. I did not build this work.
- **Branch:** `claude/sweet-newton-c8wrv1-lf-ops-sizes` at **87d658b44**. That head carries the A9c ruling: area_model_2by2 true-false L is one a page.
- **Date:** 2026-11-20.
- **Renders:** `node tests/scripts/ws-grade-render.cjs` (A4, at 96 dpi), run one at a time through `/tmp/mq-browser-run.sh`. They are in the scratchpad, under `r1/` (roles), `r2/` (the other multiply presets) and `r3/` (screens).
  - Roles rendered: independent, lesson, scripted-model, guided, error-analysis, true-false, reason-it, word-problems, test and pre-skill-check, at sizes M and L, for the six skills, each with its key.
  - Also rendered: scripted-model, guided and reason-it at M for mult_2by1_column, mult_3by1_column and multiply (tiles=null).
  - Screens rendered: card, worksheet and quiz at 820, 1024, 1280 and 1366, for the five presets and mult_break_apart.
- **Not seen, because of the cost cap:**
  - The roles more-practice, review, opener, mixed-practice and stretch were not rendered.
  - Some pages were rendered but not opened. They are marked n/v below.
  - `ws-print-lint --source kit` was not re-run. The sharded precritic at 744ec778a had it green on the kit pages.
  - The mult_break_apart Say line was not checked. It sits behind the Hint button, and the renderer does not press Hint.

## Verdict: **FAIL**

There are 7 or below on pages that no ruling and no known-open item covers. Each one is listed below.

- The model states are blank. This is on every column and area-model preset (F1).
- The wrong work on Error analysis is broken on all three area-model presets (F2) and on the long-multiplication presets (F3).
- Every area-model Reason It at **L** overprints itself (F5).
- The 4-part area model is clipped in the quiz, and on the 820 card (F6).
- Lesson pages are left mostly blank or overflow (F7, F8).
- The pre-skill check does not test the size below (F9).

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity; a 7 or below is in bold)

| skill | page type | host | C1 | C2 | C3 | C4 | findings |
|---|---|---|---|---|---|---|---|
| mult_4by1_column | independent | M, L (+key) | 9 | 8 | 8 | 9 | - |
| mult_4by1_column | scripted-model | M, L | **7** | **4** | **6** | 8 | F1, F11 |
| mult_4by1_column | guided | M | 9 | 8 | 8 | 9 | - |
| mult_4by1_column | lesson | M (pages 1 and 2) | 8 | 8 | 8 | 8 | L: L-TOPSTART (known open) |
| mult_4by1_column | error-analysis | M | 8 | **6** | 8 | 8 | F4, F14 |
| mult_4by1_column | true-false | L | 8 | **6** | 8 | 8 | F4 |
| mult_4by1_column | reason-it | M | 8 | **6** | 8 | 8 | F4 |
| mult_4by1_column | word-problems | L | 8 | **7** | 8 | 8 | F13 |
| mult_4by1_column | pre-skill-check | M | 9 | **5** | **7** | 8 | F9 |
| mult_4by1_column | card / worksheet / quiz | 820-1366 | 9 | 8 | 8 | 8 | not opened in full: meta shows no overflow |
| mult_3by2_standard | independent | L (+key) | 9 | 8 | 8 | 8 | - |
| mult_3by2_standard | scripted-model | M | **7** | **4** | 8 | 8 | F1 |
| mult_3by2_standard | guided | M | 9 | 8 | 8 | 9 | - |
| mult_3by2_standard | error-analysis | M | 8 | **4** | 8 | 8 | F3 |
| mult_3by2_standard | reason-it | L (1 a page, ruled A9) | 8 | **4** | 8 | 8 | F3 |
| mult_3by2_standard | lesson | M (chart p1, lesson p2) | 9 | 9 | 8 | 9 | - |
| mult_3by2_standard | lesson | M (practice p4: 2 items, 55 % blank) | 9 | 8 | **5** | 8 | F7 |
| mult_3by2_standard | card | 1280 | 9 | 8 | 8 | 8 | - |
| mult_2by2_standard | lesson | M (p2 about 1/3 blank; p5 has 2 items alone) | 9 | 8 | **5** | 8 | F7 |
| mult_2by2_standard | scripted-model / error-analysis / reason-it | M, L | - | **≤4** | - | - | rendered, not opened. Same code path as mult_3by2 (F1, F3) |
| area_model_4by1 | independent | M (+key) | 9 | 8 | 8 | 8 | F15 |
| area_model_4by1 | scripted-model | M (3 pages), L (6 pages) | **7** | **4** | **5** | 8 | F1, F11 |
| area_model_4by1 | guided | M | 9 | 8 | 8 | 8 | - |
| area_model_4by1 | error-analysis | M | **6** | **3** | 8 | 8 | F2 |
| area_model_4by1 | true-false | M | 8 | **6** | 8 | 8 | F12 |
| area_model_4by1 | reason-it | **L** (2 a page, not ruled) | **2** | **2** | **2** | **6** | F5 |
| area_model_4by1 | reason-it | M | (known open) | | | | measured OVERFLOW, both cells |
| area_model_4by1 | lesson | L p6 | | | **≤5** | | grade-render: "content overflows its cell" (not opened) |
| area_model_4by1 | quiz | 820, 1024, 1280 | **4** | 8 | **5** | 8 | F6 |
| area_model_4by1 | card | 820 | **4** | 8 | **5** | 8 | F6 |
| area_model_4by1 | card / worksheet | 1024, 1280 | 9 | 8 | 8 | 8 | - |
| area_model_2by2 | reason-it | **L** (1 a page, ruled A9b) | **1** | **2** | **2** | **6** | F5 |
| area_model_2by2 | lesson | M p1 and L p1 (chart: body overflows 22 mm) | **6** | 8 | **4** | **7** | F8 |
| area_model_2by2 | error-analysis | M | **6** | **3** | 8 | 8 | F2 |
| area_model_2by2 | true-false | M | 9 | 8 | 8 | 8 | - |
| area_model_3by2 | independent | M | 9 | 8 | 8 | 8 | F15 |
| area_model_3by2 | guided | M | 9 | 8 | 8 | 8 | - |
| area_model_3by2 | test | M | 9 | 8 | 8 | 8 | - |
| area_model_3by2 | error-analysis | M | **6** | **3** | 8 | 8 | F2 |
| area_model_3by2 | true-false | M | 8 | **6** | 8 | 8 | F12 |
| area_model_3by2 | reason-it | **L** (1 a page, ruled A9b) | **1** | **2** | **2** | **6** | F5 |
| area_model_3by2 | lesson | M (8 pages: p1 overflows 22 mm; p2 has 1 panel and is 55 % blank; p4 is 45 % blank) | **6** | 8 | **4** | 8 | F8, F7 |
| area_model_3by2 | card / worksheet | 1280 / 820 | 9 | 8 | 8 | 8 | - |
| multiply (tiles=null) | scripted-model | M | 8 | **4** | 8 | **6** | F10 |
| mult_2by1_column, mult_3by1_column | scripted-model | M | **7** | **4** | 8 | 8 | F1 |
| mult_2by1_column | guided | M | 9 | 8 | 8 | 9 | - |
| mult_3by1_column, multiply | reason-it | M | 8 | 6-7 | 8 | 8 | F4 (the default "added" distractor) |

## Findings (outside the known-open list)

Severity: **C** critical (a cap or a wrong page), **M** major (a 7 or below), **m** minor.

| ID | Sev | Page / PNG (scratchpad `r1/multiplication__<skill>/`) | What is wrong | Machine check |
|---|---|---|---|---|
| F1 | C | `mult_4by1_column/scripted-model-M-p1,p2`, `mult_3by2_standard/scripted-model-M-p1`, `area_model_4by1/scripted-model-M-p1..p3`, `r2/*/scripted-model-p1` | **The model states draw nothing.** Every state before the last shows empty answer and regroup boxes. For example, the step that says "Ones: 4 × 4 = 16. Write 6, regroup 1." shows no 6 and no 1. The step "2 × 2000 = 4000. Write it in part 1." shows part 1 empty. Only the last state is traced. This breaks PT-MOD-1. `scripted-model.js` draws state marks only for the `TRACE_TEMPLATES` (count-row, function-table, chartwindow) or templates with `statePayload`. stack, long-multiplication and area-model have neither. So the new `shortMultSteps` / `longMultSteps` marks and the `areaSteps` slots are never drawn. The lesson anchor chart DOES draw them (multdiv.js routines). | Existing: `ws-empty-band` MOD-MARKS. The precritic listed it as "new\* scripted-model" and it was not acted on. Proposed MODEL-STATE-MARKS: when the provider's steps carry marks, each state's cell HTML must differ from the previous state's. Run it on every template with workedSteps marks. |
| F2 | C | `area_model_3by2/error-analysis-M-key-p1` (Ana: 115 × 14), `area_model_2by2/error-analysis-M-key-p1` (Sam: 59 × 64), `area_model_4by1/error-analysis-M-key-p1` (Ana: 3 × 3,796) | **The pupil's wrong work is nonsense.** In the "left out a part" case, the wrong total is split on its comma into the first two part boxes:<br>• "1,590" is drawn as 10 × 100 = **1** and 10 × 10 = **590**;<br>• "3,740" is drawn as **3** and **740**;<br>• "11,370" is drawn as **11** and **370**.<br>The boxes do not add up to the total shown. The wrong total also carries a comma that no other total has, which gives it away. | Proposed EA-WORK-COHERENT: in the wrong work of an area or long-multiplication cell, every box except the misconception's own slot equals row × column, and the parts shown sum to the total shown. Proposed NO-GROUPED-SLOT: no slot value contains a thousands comma. |
| F3 | C | `mult_3by2_standard/error-analysis-M-p1` (Leo: 647 × 76), `mult_3by2_standard/reason-it-L-p1` (B: 638 × 41) | **The long-multiplication wrong answers are not a pupil's error.** The partial rows are correct (3882 / 45290; 638 / 25520), and the total line reads **723** or **679**. Those are the two factors ADDED. `multiplication:multiply` has no `wrongAnswer`, so it falls back to the default "added". The card promised wrongAnswer per size from M-S1..M-S5: M-S2 (last carry), M-S4 (placeholder 0), M-S5 (zero digit). | The same EA-WORK-COHERENT check. Proposed CARD-MISCONCEPTION: every role the card ties to "M-S1..M-S5" deals wrong answers whose `misconception` id is in that list (ws-spec-card). |
| F4 | M | `mult_4by1_column/{error-analysis-M,reason-it-M,true-false-L}` | Every false or wrong item uses the same "added instead of multiplied" error: 3211 × 4 → 3,215; 4524 × 6 → 4530; 4258 × 8 → 4266. A 4-digit number times 7 shown as 4-digit gives the answer away at a glance. None of these pages tests regrouping (M-S2, M-S5). | Proposed WRONG-PLAUSIBLE: the wrong value has the same digit count as the product. Plus CARD-MISCONCEPTION. |
| F5 | C | `area_model_{4by1,2by2,3by2}/reason-it-L-p1` | **Reason It at L overprints itself.** A and B are drawn beside each other, as at M. The grids, the part boxes and the equations run over each other and off the left edge of the page. ("7(0)3 2800", "1,8496×19" are illegible.) Ruling A9b makes this page one a page, but it still uses the BESIDE layout and overflows. area_model_4by1 L is two a page and is not ruled. Only the **M** page is on the known-open list. | Existing: `ws-grade-render` and `ws-cell-checks` OVERFLOW, which flagged all three. Proposed rule: a capacity ruling (capacity.json) may never clear an OVERFLOW on the same page, and precritic fails it. |
| F6 | C | `r3/multiplication__area_model_4by1/quiz-{820,1024,1280}.png`, `card-820.png` | **The 4-part model is clipped on screen.** At quiz 1280, the 4th column, its "5" label and its box are cut off entirely. At quiz 820 / 1024 and card 820, the 4th box loses its right side and the grid loses its right border. A pupil cannot see the last part. This is H2 and H6. | Proposed SCREEN-CLIP for grade-render: on every screen host, the scrollWidth of `.ws-ops` is no more than its clientWidth, and every `[data-ws-slot]` rect lies inside the question frame. The current measure checks only target sizes. |
| F7 | M | `mult_3by2_standard/lesson-M-p4`, `mult_2by2_standard/lesson-M-p2,p5`, `area_model_3by2/lesson-M-p2,p4` | Lesson pages are left mostly blank:<br>• Practice puts 4 items on page 1 and only 2 on page 2, which is 55 % blank, though Independent M holds 9 of the same cell.<br>• mult_2by2_standard's lesson page 1 ends a third of the way short, and Guided moves to the next page.<br>• area_model_3by2's chart prints one panel on a page (p2 is 55 % blank), and its warm-up page is 45 % blank. The 3by2 lesson is 8 pages.<br>This is H5. | Existing: print-lint LONE and PG-12/13 (precritic "new"). Proposed LESSON-PRACTICE-CAP: lesson Practice puts at least as many cells on a page as Independent does at the same size. |
| F8 | C | `area_model_2by2/lesson-M-p1`, `lesson-L-p1`, `area_model_3by2/lesson-M-p1`, `lesson-L-p1` | The anchor chart's body overflows by 22.0 mm (measured). Its frame runs through the footer. The status treats this as a "master class", but it is on these skills' own lesson pages. | Existing: `ws-grade-render --gate` (it flagged it). |
| F9 | M | `mult_4by1_column/pre-skill-check-M-p1` (also mult_2by2 / 3by2 L, 2 pages) | The pre-skill check for 4 × 1 column is counting in 10s, 11s and 12s, plus 15 × 3, 10 × 11, 5 × 9 and 0 × 15. The card says "the size below each preset" (3 × 1 column). The page also has 25 % of its foot blank. | Proposed PSC-SIZE-BELOW: when the card names the size below, that preset is among the pre-skill-check sections. |
| F10 | M | `r2/multiplication__multiply/scripted-model-p1` (tiles=null) | The step text is garbled: "Multiply 11 by each digit of 10 11 × 0 = 0 11 × 1 = 11 (then ×10 = 110)". Then "Add partial products" (there are none) and "Write the answer." These are the default hint steps, which the new `workedSteps` keeps for the tables deal. This is H17. (It is not the known-open *lesson chart* wording; this is the Model role.) | Proposed STEP-PARSE (VQ-9) on workedSteps text: each step is one sentence that ends in a full stop, with no bare "a × b = c" chains run together. |
| F11 | m | `mult_4by1_column/scripted-model-M-p1/p2`, `area_model_4by1/scripted-model-*` | Page 1 holds 3 of 5 states and leaves about 65 mm blank, though a 4th state (about 55 mm) fits. Page 2 is half empty. The area 4 × 1 model takes 3 pages at M and 6 at L. | Existing: ws-empty-band EB-PAGE. |
| F12 | m | `area_model_4by1/true-false-M-key-p1` (3 × 2714), `area_model_3by2/true-false-M-p1` (284 × 87) | The "dropped zeros" false items show the correct part (6000; 16000) in the box, with a total that dropped them (2148; 8724). The work does not show the error it claims. It still reads as a False item. | EA-WORK-COHERENT (F2). |
| F13 | m | `mult_4by1_column/word-problems-L-p1` | "Ravi plants 3,532 rows of flowers. Each row has 2 flowers." The group count and the group size are the wrong way round for the story. | Proposed STORY-ROLE: for "rows of" / "bags of" frames, the multiplier is the larger factor. |
| F14 | m | many | Number formatting is not consistent:<br>• the Say band reads "24976", while step 5 reads "24,976";<br>• keys read "18625", while the work reads "18,625";<br>• the wrong total on Error analysis is the only one with a comma. | Proposed NUM-FMT: one comma convention per page. |
| F15 | m | area_model_* independent, lesson | The area presets print the host's title, "I Can multiply two numbers with an area model". The column presets name their size. | Existing: the TITLE rule (opt-in). Make it on for presets. |

## Known open, as logged (scored, not counted in the verdict)

| item | seen | score |
|---|---|---|
| lesson L-TOPSTART (mult_4by1_column stack write-above) | not opened at L | - |
| Area-model Reason It at M (4by1, 2by2, 3by2) | measured OVERFLOW, both cells, all three (grade-render meta) | **C1 ≤ 4, C3 ≤ 5: below 8 on all three** |
| Area-model Word problems at M | 3by2 M one a page (seen, 70 % of the work space empty); 2by2 M one a page (measured 1×1); 4by1 M two a page (not opened) | **area_model_3by2 WP M: 8/8/4/8**; **area_model_2by2 WP M: C3 ≤ 5 (H5)**; 4by1 not graded |
| area_model_2by2 true-false L, one a page | ruled A9c | not opened |
| tiles=null tables lesson chart wording; tiles=41 lesson title | not rendered | - |

**The lead's question: does every other page pass at 8 or above?** **No.** These pages are outside the known-open list and score below 8:

| skill | page type | finding |
|---|---|---|
| mult_4by1_column | Model | F1 |
| mult_4by1_column | EA, TF, RI | F4 |
| mult_4by1_column | Word problems | F13 |
| mult_4by1_column | Pre-skill check | F9 |
| mult_3by2_standard | Model | F1 |
| mult_3by2_standard | EA, RI | F3 |
| mult_3by2_standard | lesson M | F7 |
| mult_2by2_standard | Model, EA, RI (by code path) | F1, F3 |
| mult_2by2_standard | lesson M | F7 |
| area_model_4by1 | Model | F1 |
| area_model_4by1 | EA | F2 |
| area_model_4by1 | TF | F12 |
| area_model_4by1 | **RI L** | F5 |
| area_model_4by1 | lesson L | measured overflow |
| area_model_4by1 | quiz 820/1024/1280, card 820 | F6 |
| area_model_2by2 | **RI L** | F5 |
| area_model_2by2 | lesson M/L | F8 |
| area_model_2by2 | EA | F2 |
| area_model_3by2 | **RI L** | F5 |
| area_model_3by2 | lesson M/L | F8, F7 |
| area_model_3by2 | EA | F2 |
| area_model_3by2 | TF | F12 |
| multiply tiles=null | Model | F10 |
| mult_2by1_column, mult_3by1_column | Model | F1 |

None of the six skills can deploy on this head. Each would bring one of F1 (all six), F2/F3 or F5 with it.

**Pages that pass (≥ 8 on all four), as seen:**
- the Independent and Test pages of every preset;
- Guided (all presets seen);
- the anchor-chart pages of the column lessons;
- area_model_2by2 True or False M;
- the cards at 1024 / 1280 and the worksheets.

## What would have caught it earlier (round record)

- **F1, F7 and F5 were already red in the lane's own precritic.**
  - F1 was empty-band "new\*" scripted-model.
  - F7 was print-lint LONE / PG-13.
  - F5 was cell-checks OVERFLOW reason-it L/M.
  
  They were filed as "master class" or covered by a capacity ruling. Process fix: a "master class" label does not exempt a page of a NEW preset skill. And a capacity ruling never clears an OVERFLOW.
- **F2, F3 and F12 need a coherence check on wrong work.** Proposed EA-WORK-COHERENT, which a backtest can pin on seeds 406626 / 250291 / 624001 / 863128.
- **F6 needs a screen clip check in grade-render.** Proposed SCREEN-CLIP. The meta measures targets but not content clipping.
