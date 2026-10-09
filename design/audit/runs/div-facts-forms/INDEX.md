# div_facts "How it is written" (`divForm`): render evidence (round 3)

Rendered 2026-10-09 after the critic R2 fixes (`CRITIC-R2.md`, D-A, D-B, D-C, D-D, R-1, R-2; the R1 fixes D1-D14 stand) by `node tests/scripts/ws-grade-render.cjs --skills division:div_facts --opts '{"divForm":"<form>"}' --roles independent,lesson,guided,test,error-analysis,fact-rows,fact-probe,true-false,reason-it --size <S|L>` (screen captures with the L runs). Every page was printed by Chrome to an A4 PDF and rasterised at 96 dpi; the renderer's overflow check reported no overflow on any page or key in this set.

File names: `<form>-<size>-<role>[-key]-p<n>.png` for paper (`-key-` is that page's answer key, a facsimile of the pupil page); `<form>-L-<host>.png` for screen. Notes in brackets name the critic defect the page shows fixed.

Not rendered here, by design (accepted by the critic): Stretch and Word problems rewrite the item, so no fact is left to draw in a form. `tests/scripts/ws-div-facts-forms.cjs` still builds both, and every other role, for every form, and checks D1-D14.

## Standard (12 ÷ 3 = __)

| Image | What it shows |
|---|---|
| [standard-L-card-1280.png](standard-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [standard-L-card-390.png](standard-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [standard-L-card-820.png](standard-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [standard-L-error-analysis-key-p1.png](standard-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-error-analysis-p1.png](standard-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [standard-L-fact-probe-key-p1.png](standard-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-fact-probe-p1.png](standard-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 across facts, 2 x 10, one page |
| [standard-L-fact-rows-key-p1.png](standard-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-fact-rows-p1.png](standard-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page |
| [standard-L-guided-key-p1.png](standard-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-guided-p1.png](standard-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [standard-L-independent-key-p1.png](standard-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-independent-p1.png](standard-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page. one-line equation cells packed at their own height: S 30 items, L 16 (D4) |
| [standard-L-lesson-key-p1.png](standard-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-lesson-key-p2.png](standard-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-lesson-key-p3.png](standard-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-lesson-p1.png](standard-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [standard-L-lesson-p2.png](standard-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [standard-L-lesson-p3.png](standard-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [standard-L-quiz-1280.png](standard-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [standard-L-reason-it-key-p1.png](standard-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-reason-it-p1.png](standard-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page. A over B when the across line is wide |
| [standard-L-test-key-p1.png](standard-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-test-p1.png](standard-L-test-p1.png) | Test, size L, page 1 - pupil page. 12 (the ceiling) in 3 x 4, page strip 0.10 (D-B) |
| [standard-L-true-false-key-p1.png](standard-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-L-true-false-p1.png](standard-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [standard-L-worksheet-1280.png](standard-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [standard-S-error-analysis-key-p1.png](standard-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-error-analysis-p1.png](standard-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [standard-S-fact-probe-key-p1.png](standard-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-fact-probe-p1.png](standard-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 across facts, 2 x 10, one page |
| [standard-S-fact-rows-key-p1.png](standard-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-fact-rows-p1.png](standard-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page |
| [standard-S-guided-key-p1.png](standard-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-guided-p1.png](standard-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [standard-S-independent-key-p1.png](standard-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-independent-p1.png](standard-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page. one-line equation cells packed at their own height: S 30 items, L 16 (D4) |
| [standard-S-lesson-key-p1.png](standard-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-lesson-key-p2.png](standard-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-lesson-key-p3.png](standard-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-lesson-p1.png](standard-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [standard-S-lesson-p2.png](standard-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [standard-S-lesson-p3.png](standard-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [standard-S-reason-it-key-p1.png](standard-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-reason-it-p1.png](standard-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page. A over B when the across line is wide |
| [standard-S-test-key-p1.png](standard-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-test-p1.png](standard-S-test-p1.png) | Test, size S, page 1 - pupil page. 20 (the ceiling) in 4 x 5, page strip 0.16 (D-B) |
| [standard-S-true-false-key-p1.png](standard-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [standard-S-true-false-p1.png](standard-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Long division (bracket)

| Image | What it shows |
|---|---|
| [long-L-card-1280.png](long-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [long-L-card-390.png](long-L-card-390.png) | Screen: practice card, 390 px wide (phone). "Divide." line, no across restatement (D9) |
| [long-L-card-820.png](long-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [long-L-error-analysis-key-p1.png](long-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-error-analysis-p1.png](long-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [long-L-fact-probe-key-p1.png](long-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-fact-probe-p1.png](long-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 bracket facts on ONE page, rows filling the grid (D6) |
| [long-L-fact-rows-key-p1.png](long-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-fact-rows-p1.png](long-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. bracket rows, every fact in its form (D5) |
| [long-L-guided-key-p1.png](long-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-guided-p1.png](long-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page. times-fact hint kept, number-free Steps (D12); boxes on every Guided cell (VA-61) |
| [long-L-independent-key-p1.png](long-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-independent-p1.png](long-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page. quotient written on the open vinculum, no boxes (D13); S labels run on aa. bb. (D11) |
| [long-L-lesson-key-p1.png](long-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-lesson-key-p2.png](long-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-lesson-key-p3.png](long-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-lesson-p1.png](long-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-L-lesson-p2.png](long-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-L-lesson-p3.png](long-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-L-quiz-1280.png](long-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [long-L-reason-it-key-p1.png](long-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-reason-it-p1.png](long-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [long-L-test-key-p1.png](long-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-test-p1.png](long-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [long-L-true-false-key-p1.png](long-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-L-true-false-p1.png](long-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [long-L-worksheet-1280.png](long-L-worksheet-1280.png) | Screen: online worksheet, 1280 px. "Divide." on every card, one digit size (D9, D10) |
| [long-S-error-analysis-key-p1.png](long-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-error-analysis-p1.png](long-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [long-S-fact-probe-key-p1.png](long-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-fact-probe-p1.png](long-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 bracket facts on ONE page, rows filling the grid (D6) |
| [long-S-fact-rows-key-p1.png](long-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-fact-rows-p1.png](long-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. bracket rows, every fact in its form (D5) |
| [long-S-guided-key-p1.png](long-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-guided-p1.png](long-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page. times-fact hint kept, number-free Steps (D12); boxes on every Guided cell (VA-61) |
| [long-S-independent-key-p1.png](long-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-independent-p1.png](long-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page. quotient written on the open vinculum, no boxes (D13); S labels run on aa. bb. (D11) |
| [long-S-lesson-key-p1.png](long-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-lesson-key-p2.png](long-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-lesson-key-p3.png](long-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-lesson-p1.png](long-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-S-lesson-p2.png](long-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-S-lesson-p3.png](long-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page. p2: two Guided cells, Independent rows fill the page (D8) |
| [long-S-reason-it-key-p1.png](long-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-reason-it-p1.png](long-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [long-S-test-key-p1.png](long-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-test-p1.png](long-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [long-S-true-false-key-p1.png](long-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [long-S-true-false-p1.png](long-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Fraction (12 over 3)

| Image | What it shows |
|---|---|
| [fraction-L-card-1280.png](fraction-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [fraction-L-card-390.png](fraction-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [fraction-L-card-820.png](fraction-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [fraction-L-error-analysis-key-p1.png](fraction-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-error-analysis-p1.png](fraction-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page. claimed answers at the digit size (D2) |
| [fraction-L-fact-probe-key-p1.png](fraction-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-fact-probe-p1.png](fraction-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 fraction facts on ONE page (D6) |
| [fraction-L-fact-rows-key-p1.png](fraction-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-fact-rows-p1.png](fraction-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. fraction rows, every fact in its form (D5) |
| [fraction-L-guided-key-p1.png](fraction-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-guided-p1.png](fraction-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page. times-fact hint kept, number-free Steps (D12) |
| [fraction-L-independent-key-p1.png](fraction-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-independent-p1.png](fraction-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page. bar 1.5 pt, "=" and the line on its axis (D3); one line width per page (D1) |
| [fraction-L-lesson-key-p1.png](fraction-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-lesson-key-p2.png](fraction-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-lesson-key-p3.png](fraction-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-lesson-p1.png](fraction-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-L-lesson-p2.png](fraction-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-L-lesson-p3.png](fraction-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-L-quiz-1280.png](fraction-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [fraction-L-reason-it-key-p1.png](fraction-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-reason-it-p1.png](fraction-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page. given answers at the digit size (D2) |
| [fraction-L-test-key-p1.png](fraction-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-test-p1.png](fraction-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [fraction-L-true-false-key-p1.png](fraction-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-L-true-false-p1.png](fraction-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [fraction-L-worksheet-1280.png](fraction-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [fraction-S-error-analysis-key-p1.png](fraction-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-error-analysis-p1.png](fraction-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page. claimed answers at the digit size (D2) |
| [fraction-S-fact-probe-key-p1.png](fraction-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-fact-probe-p1.png](fraction-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 fraction facts on ONE page (D6) |
| [fraction-S-fact-rows-key-p1.png](fraction-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-fact-rows-p1.png](fraction-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. fraction rows, every fact in its form (D5) |
| [fraction-S-guided-key-p1.png](fraction-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-guided-p1.png](fraction-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page. times-fact hint kept, number-free Steps (D12) |
| [fraction-S-independent-key-p1.png](fraction-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-independent-p1.png](fraction-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page. bar 1.5 pt, "=" and the line on its axis (D3); one line width per page (D1) |
| [fraction-S-lesson-key-p1.png](fraction-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-lesson-key-p2.png](fraction-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-lesson-key-p3.png](fraction-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-lesson-p1.png](fraction-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-S-lesson-p2.png](fraction-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-S-lesson-p3.png](fraction-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page. p2: Independent rows fill the page (D8) |
| [fraction-S-reason-it-key-p1.png](fraction-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-reason-it-p1.png](fraction-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page. given answers at the digit size (D2) |
| [fraction-S-test-key-p1.png](fraction-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-test-p1.png](fraction-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [fraction-S-true-false-key-p1.png](fraction-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [fraction-S-true-false-p1.png](fraction-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Vertical (stacked)

| Image | What it shows |
|---|---|
| [vertical-L-card-1280.png](vertical-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [vertical-L-card-390.png](vertical-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [vertical-L-card-820.png](vertical-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [vertical-L-error-analysis-key-p1.png](vertical-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-error-analysis-p1.png](vertical-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [vertical-L-fact-probe-key-p1.png](vertical-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-fact-probe-p1.png](vertical-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 vertical facts, 5 x 4 |
| [vertical-L-fact-rows-key-p1.png](vertical-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-fact-rows-p1.png](vertical-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. vertical division stacked in the fact rows |
| [vertical-L-guided-key-p1.png](vertical-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-guided-p1.png](vertical-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [vertical-L-independent-key-p1.png](vertical-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-independent-p1.png](vertical-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page |
| [vertical-L-lesson-key-p1.png](vertical-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-lesson-key-p2.png](vertical-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-lesson-key-p3.png](vertical-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-lesson-p1.png](vertical-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [vertical-L-lesson-p2.png](vertical-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [vertical-L-lesson-p3.png](vertical-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [vertical-L-quiz-1280.png](vertical-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [vertical-L-reason-it-key-p1.png](vertical-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-reason-it-p1.png](vertical-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [vertical-L-test-key-p1.png](vertical-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-test-p1.png](vertical-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [vertical-L-true-false-key-p1.png](vertical-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-L-true-false-p1.png](vertical-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [vertical-L-worksheet-1280.png](vertical-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [vertical-S-error-analysis-key-p1.png](vertical-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-error-analysis-p1.png](vertical-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [vertical-S-fact-probe-key-p1.png](vertical-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-fact-probe-p1.png](vertical-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 vertical facts, 5 x 4 |
| [vertical-S-fact-rows-key-p1.png](vertical-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-fact-rows-p1.png](vertical-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. vertical division stacked in the fact rows |
| [vertical-S-guided-key-p1.png](vertical-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-guided-p1.png](vertical-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [vertical-S-independent-key-p1.png](vertical-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-independent-p1.png](vertical-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page |
| [vertical-S-lesson-key-p1.png](vertical-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-lesson-key-p2.png](vertical-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-lesson-key-p3.png](vertical-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-lesson-p1.png](vertical-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [vertical-S-lesson-p2.png](vertical-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [vertical-S-lesson-p3.png](vertical-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [vertical-S-reason-it-key-p1.png](vertical-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-reason-it-p1.png](vertical-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [vertical-S-test-key-p1.png](vertical-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-test-p1.png](vertical-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [vertical-S-true-false-key-p1.png](vertical-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [vertical-S-true-false-p1.png](vertical-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Mix (one third each of Standard / Long division / Fraction)

| Image | What it shows |
|---|---|
| [mix-L-card-1280.png](mix-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [mix-L-card-390.png](mix-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [mix-L-card-820.png](mix-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [mix-L-error-analysis-key-p1.png](mix-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-error-analysis-p1.png](mix-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [mix-L-fact-probe-key-p1.png](mix-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-fact-probe-p1.png](mix-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 facts, one page, 20 pt rung, bottom band <= 0.27 (D-C) |
| [mix-L-fact-rows-key-p1.png](mix-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-fact-rows-p1.png](mix-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. every form at the Standard rows' 20 pt rung, one cell height, bracket tracked from its own digit ("72" reads as one number) (D-C) |
| [mix-L-guided-key-p1.png](mix-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-guided-p1.png](mix-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page. a Model of each form (3 Models, across included) in row 1, every try in its own box (D-D) |
| [mix-L-independent-key-p1.png](mix-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-independent-p1.png](mix-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page. ONE cell size in 3 columns: the across fact over its answer line, the bracket and the fraction are all two-line cells; dealt order, one third each; 15 items, rows 153 px, ink side bands <= 0.26 (D-A) |
| [mix-L-lesson-key-p1.png](mix-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-lesson-key-p2.png](mix-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-lesson-key-p3.png](mix-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-lesson-p1.png](mix-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page. p1: the example in all three forms (D7) |
| [mix-L-lesson-p2.png](mix-L-lesson-p2.png) | Lesson packet, size L, page 2 - pupil page. Guided + 12 Independent in 3 uniform columns (D-A) |
| [mix-L-lesson-p3.png](mix-L-lesson-p3.png) | Lesson packet, size L, page 3 - pupil page. practice: 15 in 3 uniform columns (D-A) |
| [mix-L-quiz-1280.png](mix-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [mix-L-reason-it-key-p1.png](mix-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-reason-it-p1.png](mix-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [mix-L-test-key-p1.png](mix-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-test-p1.png](mix-L-test-p1.png) | Test, size L, page 1 - pupil page. 12 in a uniform 3 x 4 grid, one row height (D-A) |
| [mix-L-true-false-key-p1.png](mix-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-L-true-false-p1.png](mix-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [mix-L-worksheet-1280.png](mix-L-worksheet-1280.png) | Screen: online worksheet, 1280 px. "Divide." on every card, one digit size across the forms (D9, D10) |
| [mix-S-error-analysis-key-p1.png](mix-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-error-analysis-p1.png](mix-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [mix-S-fact-probe-key-p1.png](mix-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-fact-probe-p1.png](mix-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 facts, one page, 20 pt rung (D-C) |
| [mix-S-fact-rows-key-p1.png](mix-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-fact-rows-p1.png](mix-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. 20 pt rung, 27 facts in 3 x 9 (S denser than L), bracket tracked from its digit (D-C) |
| [mix-S-guided-key-p1.png](mix-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-guided-p1.png](mix-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page. 3 Models in row 1, every try in its own box (D-D) |
| [mix-S-independent-key-p1.png](mix-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-independent-p1.png](mix-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page. one cell size in 4 columns, 28 items, dealt order (D-A) |
| [mix-S-lesson-key-p1.png](mix-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-lesson-key-p2.png](mix-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-lesson-key-p3.png](mix-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-lesson-p1.png](mix-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page. p1: the example in all three forms (D7) |
| [mix-S-lesson-p2.png](mix-S-lesson-p2.png) | Lesson packet, size S, page 2 - pupil page. uniform cells (D-A) |
| [mix-S-lesson-p3.png](mix-S-lesson-p3.png) | Lesson packet, size S, page 3 - pupil page. uniform cells (D-A) |
| [mix-S-reason-it-key-p1.png](mix-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-reason-it-p1.png](mix-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [mix-S-test-key-p1.png](mix-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-test-p1.png](mix-S-test-p1.png) | Test, size S, page 1 - pupil page. 20 in a uniform 4 x 5 grid filling the page (D-A, D-B) |
| [mix-S-true-false-key-p1.png](mix-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY (answers at the digit size, D2) |
| [mix-S-true-false-p1.png](mix-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Regression comparison (round 3)

Lesson and Independent pages of five other skills, rendered by `ws-grade-render --roles lesson,independent` at S and L from the parent `50dbfa6` (served with `MQ_ROOT`) and from this tree, then pixel-diffed (difference > 40 grey levels):

| Skill | Result |
|---|---|
| `addition:add_facts` | Pixel-identical, every page and key, S and L |
| `multiplication:mult_facts` | Pixel-identical, every page and key, S and L |
| `division:long_div_2digit` | Only the bracket arc's half-stroke drop at the vinculum (R1 lane change, accepted by critic R2): 161-768 px per page |
| `division:divide` | Lesson p2 changed on purpose (R-2): the warm-up holds 3 across facts in the one tight across look (S and L), the Independent rows hold 12 one-number division facts (12.1) instead of 6, page strip 0.31 (S) / 0.24 (L) against the parent's 0.37; p1 differs only in the Score (/9 -> /15). Independent pages identical |
| `division:div_remainders` | Lesson p2 changed: no page runs into its footer at S or L (the parent overflowed at S; critic R2's 4.5 mm at L is gone). S: 4 warm-up + 4 Independent (/8, parent /7). L: 2 warm-up + 2 Independent (/4, parent /5) - the div_facts warm-up cell is no longer the VA-70 tall cell that let the other half stack two. Independent pages identical |
