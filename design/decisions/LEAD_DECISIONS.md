# Lead decisions under delegated approval

Owner rule (2026-11-12, LESSONS_LEARNED process rule 3a): the lead approves designs and signs cards on the recommended
answers; every such decision is listed here so the owner can review it and ask for a change at any time.

| Date | What | Answers taken | Commit |
|---|---|---|---|
| 2026-11-12 | (owner-approved directly, before delegation) partopts design; cards chartwindow, partition, times-as-many, word-stories | all as recommended | lf-builds 9f2d3ea5 |
| 2026-11-12 | patterns card re-sign (growing_shape_patterns unit S 2.5 / M 2.8 / L 3.3 mm) | carries the owner's earlier ruling; no new question | lf-algebra bd6c6cc6 |
| 2026-11-12 | Match 3 Guided at L prints Model + 1 try (3 scored answers); MIN_ITEMS counts scored answers for multi-answer cells | lead ruling, lf-vocab r9 | lf-vocab 6ae462d1 |
| 2026-11-12 | ops-tables + count-row cards re-signed; mult_properties band=36 offered at S only, pending post-fix re-measure (else not offered) | lead ruling (b) | lf-ops-props 1993c15c |
| 2026-11-13 | mult_facts array support always landscape: smaller factor sets the rows; Say/caption names the drawing ("3 rows of 7. 7 × 3 = 21. Turn it: 3 × 7."); no standard fixes rows = first factor | lead ruling (C), follows owner's landscape ruling | lf-ops divarray |
| 2026-11-13 | ops-tables card re-signed: mult_properties band=36 NOT offered (failed S re-measure) | lead ruling (b) applied | lf-ops-props 9e2c301a |
| 2026-11-13 | Per-part settings: Practice/Mixed "how many" = total in whole rows with re-pagination (rounded if a page would be under half used, with a note); lesson-sheet freed height flows to the remaining bands (value not offered if the page still can't fill); We Do re-flows to fewer, wider cells | lead, delegated (meets the owner-approved goal: never overflow, never near-empty) | lf-partopts critic-A-r1 |
| 2026-11-13 | Online worksheet rows: a tile's bordered box stretches at most to the 30 % band limit; the card keeps the row height, the rest is white outside the box (owner's CL-4b centring applies inside the capped box). Screen answer slots draw at digit + underline height, 48 px touch target kept as transparent padding | lead, delegated (c3; D1 b+a) | lf-checks 0f1a0bda / 1d8cb38a |
| 2026-11-13 | Scripted Model "beside" layout: the step-text column is judged by its text, not by the empty-band rule (one-page Models); a Model that spills to a second page goes text-over-state (2 + 2). function_table_easy Model L keeps beside over 2 pages under that rule | lead, delegated | lf-roles round 3 |
| 2026-11-13 | Online worksheet: CL-4b centring branch kept (dormant inside the 30 % stretch cap); top-aligned boxes may end at different heights in a row | lead, delegated (owner told; can reverse) | lf-checks eb-r5 |
| 2026-11-13 | arrays / arrays-turn cells: CL-4b top-start wins over the lane's centring once rows stop stretching | lead, applies owner rule CL-4b | lf-ops -props |
| 2026-11-13 | -live-pm deployed as a strict improvement (carry boxes, rounding and mixed centring) though the spot critic was below 8 on pages with older defects; those defects are the next live round | lead | lf-engine -live-pm |
| 2026-11-13 | Error Analysis: another pupil's work prints in the single grey under a "<Name> wrote:" label (PT-ERR-4; PUPILTAG check) — design, not a defect | lead, delegated (owner had seen the layout) | lf-roles r4 |
| 2026-11-13 | PT-TOF-4 extended: a Reason It LIST answer prints no "The answer is" frame (the named panel already holds every part) | lead, delegated | lf-roles r5 000f6eb5 |
| 2026-11-13 | two-step card signed (Signed: owner (delegated to lead)); decision 3 amended: wpBar findable as multi_step_word '(Visual)' (decision 5), msChoose read in the code = a response mode on the same task (the pupil solves, then checks one of four answers), so a plain option, no preset | decisions 1-12 as recommended, 3 amended | lf-algebra (this commit) |
