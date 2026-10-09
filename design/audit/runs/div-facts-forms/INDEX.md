# div_facts "How it is written" (`divForm`): render evidence

Rendered 2026-10-09 by `node tests/scripts/ws-grade-render.cjs --skills division:div_facts --opts '{"divForm":"<form>"}' --roles independent,lesson,guided,test,error-analysis,fact-rows,fact-probe,true-false,reason-it --size <S|L>` (screen captures with the L runs). Every page was printed by Chrome to an A4 PDF and rasterised at 96 dpi; the renderer's overflow check reported no overflow on any page or key in this set.

File names: `<form>-<size>-<role>[-key]-p<n>.png` for paper (`-key-` is that page's answer key, a facsimile of the pupil page); `<form>-L-<host>.png` for screen.

Not rendered here, by design: Stretch and Word problems rewrite the item (an open "find the pairs" table; a story), so no fact is left to draw in a form (comment in `sheet/roles/stretch.js`). `tests/scripts/ws-div-facts-forms.cjs` still builds both, and every other role, for every form.

## Standard (12 ÷ 3 = __)

| Image | What it shows |
|---|---|
| [standard-L-card-1280.png](standard-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [standard-L-card-390.png](standard-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [standard-L-card-820.png](standard-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [standard-L-error-analysis-key-p1.png](standard-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY |
| [standard-L-error-analysis-p1.png](standard-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [standard-L-fact-probe-key-p1.png](standard-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY |
| [standard-L-fact-probe-p1.png](standard-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 across facts, 2 x 10 (fixed this round: was stacked by VA-65) |
| [standard-L-fact-rows-key-p1.png](standard-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY |
| [standard-L-fact-rows-p1.png](standard-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page |
| [standard-L-guided-key-p1.png](standard-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY |
| [standard-L-guided-p1.png](standard-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [standard-L-independent-key-p1.png](standard-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY |
| [standard-L-independent-p1.png](standard-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page |
| [standard-L-lesson-key-p1.png](standard-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY |
| [standard-L-lesson-key-p2.png](standard-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY |
| [standard-L-lesson-key-p3.png](standard-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY |
| [standard-L-lesson-p1.png](standard-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-L-lesson-p2.png](standard-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-L-lesson-p3.png](standard-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-L-quiz-1280.png](standard-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [standard-L-reason-it-key-p1.png](standard-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY |
| [standard-L-reason-it-p1.png](standard-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [standard-L-test-key-p1.png](standard-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY |
| [standard-L-test-p1.png](standard-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [standard-L-true-false-key-p1.png](standard-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY |
| [standard-L-true-false-p1.png](standard-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [standard-L-worksheet-1280.png](standard-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [standard-S-error-analysis-key-p1.png](standard-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY |
| [standard-S-error-analysis-p1.png](standard-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [standard-S-fact-probe-key-p1.png](standard-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY |
| [standard-S-fact-probe-p1.png](standard-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 across facts, 2 x 10 (fixed this round: was stacked by VA-65) |
| [standard-S-fact-rows-key-p1.png](standard-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY |
| [standard-S-fact-rows-p1.png](standard-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page |
| [standard-S-guided-key-p1.png](standard-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY |
| [standard-S-guided-p1.png](standard-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [standard-S-independent-key-p1.png](standard-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY |
| [standard-S-independent-p1.png](standard-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page |
| [standard-S-lesson-key-p1.png](standard-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY |
| [standard-S-lesson-key-p2.png](standard-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY |
| [standard-S-lesson-key-p3.png](standard-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY |
| [standard-S-lesson-p1.png](standard-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-S-lesson-p2.png](standard-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-S-lesson-p3.png](standard-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page. p2: 3-digit across facts take 2 Guided cells (fixed this round: 3 cells overran at S/M) |
| [standard-S-reason-it-key-p1.png](standard-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY |
| [standard-S-reason-it-p1.png](standard-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [standard-S-test-key-p1.png](standard-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY |
| [standard-S-test-p1.png](standard-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [standard-S-true-false-key-p1.png](standard-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY |
| [standard-S-true-false-p1.png](standard-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Long division (bracket)

| Image | What it shows |
|---|---|
| [long-L-card-1280.png](long-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [long-L-card-390.png](long-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [long-L-card-820.png](long-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [long-L-error-analysis-key-p1.png](long-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY |
| [long-L-error-analysis-p1.png](long-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [long-L-fact-probe-key-p1.png](long-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY |
| [long-L-fact-probe-key-p2.png](long-L-fact-probe-key-p2.png) | Fact fluency probe, size L, page 2 - ANSWER KEY |
| [long-L-fact-probe-p1.png](long-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. bracket cells at the widest column count they fit; at L two pages of 10 (fixed this round: 5 columns overran) |
| [long-L-fact-probe-p2.png](long-L-fact-probe-p2.png) | Fact fluency probe, size L, page 2 - pupil page. bracket cells at the widest column count they fit; at L two pages of 10 (fixed this round: 5 columns overran) |
| [long-L-fact-rows-key-p1.png](long-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY |
| [long-L-fact-rows-p1.png](long-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. documented fallback: Long division prints across on fact rows (fact-rows.js) |
| [long-L-guided-key-p1.png](long-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY |
| [long-L-guided-p1.png](long-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [long-L-independent-key-p1.png](long-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY |
| [long-L-independent-p1.png](long-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page |
| [long-L-lesson-key-p1.png](long-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY |
| [long-L-lesson-key-p2.png](long-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY |
| [long-L-lesson-key-p3.png](long-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY |
| [long-L-lesson-p1.png](long-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [long-L-lesson-p2.png](long-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [long-L-lesson-p3.png](long-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [long-L-quiz-1280.png](long-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [long-L-reason-it-key-p1.png](long-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY |
| [long-L-reason-it-p1.png](long-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [long-L-test-key-p1.png](long-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY |
| [long-L-test-p1.png](long-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [long-L-true-false-key-p1.png](long-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY |
| [long-L-true-false-p1.png](long-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [long-L-worksheet-1280.png](long-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [long-S-error-analysis-key-p1.png](long-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY |
| [long-S-error-analysis-p1.png](long-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [long-S-fact-probe-key-p1.png](long-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY |
| [long-S-fact-probe-p1.png](long-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. bracket cells at the widest column count they fit; at L two pages of 10 (fixed this round: 5 columns overran) |
| [long-S-fact-rows-key-p1.png](long-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY |
| [long-S-fact-rows-p1.png](long-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. documented fallback: Long division prints across on fact rows (fact-rows.js) |
| [long-S-guided-key-p1.png](long-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY |
| [long-S-guided-p1.png](long-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [long-S-independent-key-p1.png](long-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY |
| [long-S-independent-p1.png](long-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page |
| [long-S-lesson-key-p1.png](long-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY |
| [long-S-lesson-key-p2.png](long-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY |
| [long-S-lesson-key-p3.png](long-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY |
| [long-S-lesson-p1.png](long-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [long-S-lesson-p2.png](long-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [long-S-lesson-p3.png](long-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [long-S-reason-it-key-p1.png](long-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY |
| [long-S-reason-it-p1.png](long-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [long-S-test-key-p1.png](long-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY |
| [long-S-test-p1.png](long-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [long-S-true-false-key-p1.png](long-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY |
| [long-S-true-false-p1.png](long-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Fraction (12 over 3)

| Image | What it shows |
|---|---|
| [fraction-L-card-1280.png](fraction-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [fraction-L-card-390.png](fraction-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [fraction-L-card-820.png](fraction-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [fraction-L-error-analysis-key-p1.png](fraction-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY |
| [fraction-L-error-analysis-p1.png](fraction-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [fraction-L-fact-probe-key-p1.png](fraction-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY |
| [fraction-L-fact-probe-p1.png](fraction-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. fraction cells at the widest column count they fit (fixed this round) |
| [fraction-L-fact-rows-key-p1.png](fraction-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY |
| [fraction-L-fact-rows-p1.png](fraction-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. documented fallback: Fraction prints across on fact rows (fact-rows.js) |
| [fraction-L-guided-key-p1.png](fraction-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY |
| [fraction-L-guided-p1.png](fraction-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [fraction-L-independent-key-p1.png](fraction-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY |
| [fraction-L-independent-p1.png](fraction-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page |
| [fraction-L-lesson-key-p1.png](fraction-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY |
| [fraction-L-lesson-key-p2.png](fraction-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY |
| [fraction-L-lesson-key-p3.png](fraction-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY |
| [fraction-L-lesson-p1.png](fraction-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [fraction-L-lesson-p2.png](fraction-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [fraction-L-lesson-p3.png](fraction-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [fraction-L-quiz-1280.png](fraction-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [fraction-L-reason-it-key-p1.png](fraction-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY |
| [fraction-L-reason-it-p1.png](fraction-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [fraction-L-test-key-p1.png](fraction-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY |
| [fraction-L-test-p1.png](fraction-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [fraction-L-true-false-key-p1.png](fraction-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY |
| [fraction-L-true-false-p1.png](fraction-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [fraction-L-worksheet-1280.png](fraction-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [fraction-S-error-analysis-key-p1.png](fraction-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY |
| [fraction-S-error-analysis-p1.png](fraction-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [fraction-S-fact-probe-key-p1.png](fraction-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY |
| [fraction-S-fact-probe-p1.png](fraction-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. fraction cells at the widest column count they fit (fixed this round) |
| [fraction-S-fact-rows-key-p1.png](fraction-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY |
| [fraction-S-fact-rows-p1.png](fraction-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. documented fallback: Fraction prints across on fact rows (fact-rows.js) |
| [fraction-S-guided-key-p1.png](fraction-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY |
| [fraction-S-guided-p1.png](fraction-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [fraction-S-independent-key-p1.png](fraction-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY |
| [fraction-S-independent-p1.png](fraction-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page |
| [fraction-S-lesson-key-p1.png](fraction-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY |
| [fraction-S-lesson-key-p2.png](fraction-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY |
| [fraction-S-lesson-key-p3.png](fraction-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY |
| [fraction-S-lesson-p1.png](fraction-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [fraction-S-lesson-p2.png](fraction-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [fraction-S-lesson-p3.png](fraction-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [fraction-S-reason-it-key-p1.png](fraction-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY |
| [fraction-S-reason-it-p1.png](fraction-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [fraction-S-test-key-p1.png](fraction-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY |
| [fraction-S-test-p1.png](fraction-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [fraction-S-true-false-key-p1.png](fraction-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY |
| [fraction-S-true-false-p1.png](fraction-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Vertical (stacked)

| Image | What it shows |
|---|---|
| [vertical-L-card-1280.png](vertical-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [vertical-L-card-390.png](vertical-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [vertical-L-card-820.png](vertical-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [vertical-L-error-analysis-key-p1.png](vertical-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY |
| [vertical-L-error-analysis-p1.png](vertical-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page |
| [vertical-L-fact-probe-key-p1.png](vertical-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY |
| [vertical-L-fact-probe-p1.png](vertical-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. 20 vertical facts, 5 x 4 (no across block: the teacher chose stacked) |
| [vertical-L-fact-rows-key-p1.png](vertical-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY |
| [vertical-L-fact-rows-p1.png](vertical-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. Vertical division stacked in the fact rows (up to 10 columns; fewer when a 3-digit dividend needs a 4th track) |
| [vertical-L-guided-key-p1.png](vertical-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY |
| [vertical-L-guided-p1.png](vertical-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [vertical-L-independent-key-p1.png](vertical-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY |
| [vertical-L-independent-p1.png](vertical-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page |
| [vertical-L-lesson-key-p1.png](vertical-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY |
| [vertical-L-lesson-key-p2.png](vertical-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY |
| [vertical-L-lesson-key-p3.png](vertical-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY |
| [vertical-L-lesson-p1.png](vertical-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [vertical-L-lesson-p2.png](vertical-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [vertical-L-lesson-p3.png](vertical-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [vertical-L-quiz-1280.png](vertical-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [vertical-L-reason-it-key-p1.png](vertical-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY |
| [vertical-L-reason-it-p1.png](vertical-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [vertical-L-test-key-p1.png](vertical-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY |
| [vertical-L-test-p1.png](vertical-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [vertical-L-true-false-key-p1.png](vertical-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY |
| [vertical-L-true-false-p1.png](vertical-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [vertical-L-worksheet-1280.png](vertical-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [vertical-S-error-analysis-key-p1.png](vertical-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY |
| [vertical-S-error-analysis-p1.png](vertical-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page |
| [vertical-S-fact-probe-key-p1.png](vertical-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY |
| [vertical-S-fact-probe-p1.png](vertical-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. 20 vertical facts, 5 x 4 (no across block: the teacher chose stacked) |
| [vertical-S-fact-rows-key-p1.png](vertical-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY |
| [vertical-S-fact-rows-p1.png](vertical-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. Vertical division stacked in the fact rows (up to 10 columns; fewer when a 3-digit dividend needs a 4th track) |
| [vertical-S-guided-key-p1.png](vertical-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY |
| [vertical-S-guided-p1.png](vertical-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [vertical-S-independent-key-p1.png](vertical-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY |
| [vertical-S-independent-p1.png](vertical-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page |
| [vertical-S-lesson-key-p1.png](vertical-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY |
| [vertical-S-lesson-key-p2.png](vertical-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY |
| [vertical-S-lesson-key-p3.png](vertical-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY |
| [vertical-S-lesson-p1.png](vertical-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [vertical-S-lesson-p2.png](vertical-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [vertical-S-lesson-p3.png](vertical-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [vertical-S-reason-it-key-p1.png](vertical-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY |
| [vertical-S-reason-it-p1.png](vertical-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [vertical-S-test-key-p1.png](vertical-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY |
| [vertical-S-test-p1.png](vertical-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [vertical-S-true-false-key-p1.png](vertical-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY |
| [vertical-S-true-false-p1.png](vertical-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |

## Mix (one third each of Standard / Long division / Fraction)

| Image | What it shows |
|---|---|
| [mix-L-card-1280.png](mix-L-card-1280.png) | Screen: practice card, 1280 px wide |
| [mix-L-card-390.png](mix-L-card-390.png) | Screen: practice card, 390 px wide (phone) |
| [mix-L-card-820.png](mix-L-card-820.png) | Screen: practice card, 820 px wide (tablet) |
| [mix-L-error-analysis-key-p1.png](mix-L-error-analysis-key-p1.png) | Error analysis (Check it), size L, page 1 - ANSWER KEY |
| [mix-L-error-analysis-p1.png](mix-L-error-analysis-p1.png) | Error analysis (Check it), size L, page 1 - pupil page. all three Mix forms kept; every fix written on a line (fixed this round: the bracket items were dropped) |
| [mix-L-fact-probe-key-p1.png](mix-L-fact-probe-key-p1.png) | Fact fluency probe, size L, page 1 - ANSWER KEY |
| [mix-L-fact-probe-key-p2.png](mix-L-fact-probe-key-p2.png) | Fact fluency probe, size L, page 2 - ANSWER KEY |
| [mix-L-fact-probe-p1.png](mix-L-fact-probe-p1.png) | Fact fluency probe, size L, page 1 - pupil page. mixed cells at the widest column count they fit (fixed this round) |
| [mix-L-fact-probe-p2.png](mix-L-fact-probe-p2.png) | Fact fluency probe, size L, page 2 - pupil page. mixed cells at the widest column count they fit (fixed this round) |
| [mix-L-fact-rows-key-p1.png](mix-L-fact-rows-key-p1.png) | Fact rows, size L, page 1 - ANSWER KEY |
| [mix-L-fact-rows-p1.png](mix-L-fact-rows-p1.png) | Fact rows, size L, page 1 - pupil page. documented fallback: Mix prints across on fact rows (fact-rows.js) |
| [mix-L-guided-key-p1.png](mix-L-guided-key-p1.png) | Guided practice, size L, page 1 - ANSWER KEY |
| [mix-L-guided-p1.png](mix-L-guided-p1.png) | Guided practice, size L, page 1 - pupil page |
| [mix-L-independent-key-p1.png](mix-L-independent-key-p1.png) | Independent practice, size L, page 1 - ANSWER KEY |
| [mix-L-independent-p1.png](mix-L-independent-p1.png) | Independent practice, size L, page 1 - pupil page. one page, forms interleaved in dealt order (fixed this round: tall-first sort paged them 15 + 12) |
| [mix-L-lesson-key-p1.png](mix-L-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - ANSWER KEY |
| [mix-L-lesson-key-p2.png](mix-L-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - ANSWER KEY |
| [mix-L-lesson-key-p3.png](mix-L-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - ANSWER KEY |
| [mix-L-lesson-p1.png](mix-L-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 1 - pupil page |
| [mix-L-lesson-p2.png](mix-L-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 2 - pupil page |
| [mix-L-lesson-p3.png](mix-L-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size L, page 3 - pupil page |
| [mix-L-quiz-1280.png](mix-L-quiz-1280.png) | Screen: quiz-taking view, 1280 px |
| [mix-L-reason-it-key-p1.png](mix-L-reason-it-key-p1.png) | Reason it, size L, page 1 - ANSWER KEY |
| [mix-L-reason-it-p1.png](mix-L-reason-it-p1.png) | Reason it, size L, page 1 - pupil page |
| [mix-L-test-key-p1.png](mix-L-test-key-p1.png) | Test, size L, page 1 - ANSWER KEY |
| [mix-L-test-p1.png](mix-L-test-p1.png) | Test, size L, page 1 - pupil page |
| [mix-L-true-false-key-p1.png](mix-L-true-false-key-p1.png) | True or False, size L, page 1 - ANSWER KEY |
| [mix-L-true-false-p1.png](mix-L-true-false-p1.png) | True or False, size L, page 1 - pupil page |
| [mix-L-worksheet-1280.png](mix-L-worksheet-1280.png) | Screen: online worksheet, 1280 px |
| [mix-S-error-analysis-key-p1.png](mix-S-error-analysis-key-p1.png) | Error analysis (Check it), size S, page 1 - ANSWER KEY |
| [mix-S-error-analysis-p1.png](mix-S-error-analysis-p1.png) | Error analysis (Check it), size S, page 1 - pupil page. all three Mix forms kept; every fix written on a line (fixed this round: the bracket items were dropped) |
| [mix-S-fact-probe-key-p1.png](mix-S-fact-probe-key-p1.png) | Fact fluency probe, size S, page 1 - ANSWER KEY |
| [mix-S-fact-probe-p1.png](mix-S-fact-probe-p1.png) | Fact fluency probe, size S, page 1 - pupil page. mixed cells at the widest column count they fit (fixed this round) |
| [mix-S-fact-rows-key-p1.png](mix-S-fact-rows-key-p1.png) | Fact rows, size S, page 1 - ANSWER KEY |
| [mix-S-fact-rows-p1.png](mix-S-fact-rows-p1.png) | Fact rows, size S, page 1 - pupil page. documented fallback: Mix prints across on fact rows (fact-rows.js) |
| [mix-S-guided-key-p1.png](mix-S-guided-key-p1.png) | Guided practice, size S, page 1 - ANSWER KEY |
| [mix-S-guided-p1.png](mix-S-guided-p1.png) | Guided practice, size S, page 1 - pupil page |
| [mix-S-independent-key-p1.png](mix-S-independent-key-p1.png) | Independent practice, size S, page 1 - ANSWER KEY |
| [mix-S-independent-p1.png](mix-S-independent-p1.png) | Independent practice, size S, page 1 - pupil page. one page, forms interleaved in dealt order (fixed this round: tall-first sort paged them 15 + 12) |
| [mix-S-lesson-key-p1.png](mix-S-lesson-key-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - ANSWER KEY |
| [mix-S-lesson-key-p2.png](mix-S-lesson-key-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - ANSWER KEY |
| [mix-S-lesson-key-p3.png](mix-S-lesson-key-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - ANSWER KEY |
| [mix-S-lesson-p1.png](mix-S-lesson-p1.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 1 - pupil page |
| [mix-S-lesson-p2.png](mix-S-lesson-p2.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 2 - pupil page |
| [mix-S-lesson-p3.png](mix-S-lesson-p3.png) | Lesson packet (p1 anchor chart, p2 lesson: Guided beside the Steps + Independent, p3 practice), size S, page 3 - pupil page |
| [mix-S-reason-it-key-p1.png](mix-S-reason-it-key-p1.png) | Reason it, size S, page 1 - ANSWER KEY |
| [mix-S-reason-it-p1.png](mix-S-reason-it-p1.png) | Reason it, size S, page 1 - pupil page |
| [mix-S-test-key-p1.png](mix-S-test-key-p1.png) | Test, size S, page 1 - ANSWER KEY |
| [mix-S-test-p1.png](mix-S-test-p1.png) | Test, size S, page 1 - pupil page |
| [mix-S-true-false-key-p1.png](mix-S-true-false-key-p1.png) | True or False, size S, page 1 - ANSWER KEY |
| [mix-S-true-false-p1.png](mix-S-true-false-p1.png) | True or False, size S, page 1 - pupil page |
