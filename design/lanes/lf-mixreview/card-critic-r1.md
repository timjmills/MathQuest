# Card critic: Mixed review (lf-mixreview @ 935bbd26)

Independent critic, Opus medium. Card: design/cards/mixed-review/mixed-review.md + card.json.

## Scores

| Criterion | Score |
|---|---|
| K1 COMPLETE | 8 |
| K2 CORRECT | 6 |
| K3 BUILDABLE | 7 |
| K4 CHECKABLE | 7 |
| K5 TEACHER/PUPIL FIT | 7 |

**Verdict: FAIL** (minimum 6).

What I verified as true: `dealCounts` (min 2), `interleave` (a maxRun option), `mixedClass`, `DEFAULT_LOOK = 'daily'`, AUTO_N daily M 6 / L 4, `skillItemMap`, `answerListRows`, `ROLE_ALIASES`, `deriveSeed` (sheet/rng.js), `REDESIGN_PASSED` = 32, the parser's `switch` skipping unknown keys, the taken letters T N G R D A Q H W F X, weight 1 written as no digit (safe because counts are always 2 or more), `weekForDate`, `schoolWeeksOf`, `skillsForWrmStep`, `skillAnalysis`, `skillBreakdown`, `mq_teacher_skills_ui`, `printDefaults`, `offeredSize`, progress keyed by bare skillId, and master d3830882 being an ancestor. The card has no TBD, and every option, host and role is decided.

## Defects

1. **"No skill over half the sheet" contradicts the deal (K2, K4).** With N = 5 the deal is always 3 + 2, so one skill has 60 %. Any 2-skill pool at odd N (15: 8 + 7, 25: 13 + 12) also breaks it. As written, MIX-REVIEW-POOL fails on the default N = 5 case. **Fix:** say "no skill over ceil(N / 2)" in §2, PT-MXR-2 and the POOL check.

2. **Adapt weighting breaks the 2–3 items cap (K2, K4).** w ∈ 1..4 is also the `dealCounts` weight. With N = 10 and weights 4, 1, 1, 1 the deal gives about 6 items to one skill. That breaks "2–3 items each" and "none over half", which POOL asserts in the same sweep. **Fix:** let w drive only the seeded choice of the k skills. Counts stay equal (2–3 each), or are capped at 3 each and at ceil(N / 2). State this in §7a Weighting and in the POOL check.

3. **Mixed order contradicts itself (K2).** §2 says "no two items of one skill side by side (maxRun 1)", and §7a says "screen order = interleave(…maxRun 1)". But mixed size classes print GROUPED shelves, with 2–3 cells of one skill side by side. And "every screen host plays the printed number order". All three cannot hold. **Fix:** across size classes, "mixed" means no two SHELVES of one skill are adjacent, and items inside a shelf run 2–3. The screen plays the printed order, so drop the separate screen `interleave` line. The POOL and COUNT checks then measure shelf adjacency on print and item adjacency only in the M1 arrangement.

4. **The identical-mix claim skips the print dealer (K2, K3).** `buildSheet` does not take item i = `generateQuestionFor(seed: deriveSeed('mixed-review', S, day, i))`. For mixed-practice it runs its own seeding plus the RETRIES = 40 duplicate ladder and the rungs unique / answers / turn / repeat (print-sheet.js ~1029–1081, 4511–4644). A screen host that calls the card's formula directly will differ from the key whenever a retry fires. **Fix:** name ONE exported dealer (for example `dealReviewItems(req)` in print-sheet.js or mixed-review.js) that runs the dedupe ladder. Print and every screen host take the accepted item list from it. Add "make buildSheet's mixed-review seeding the §7a formula" to step 3.

5. **Week and day codes re-run the deal (K2).** A week code carries "the week union with week totals". So `K3` can rebuild Wednesday only by re-running the rotation (`weekOf`) from S. That contradicts "the counts are explicit, so decoding never re-runs the deal" and "skills, counts, order never change". **Fix:** freeze the rotation and the shelf-order algorithm under `V1` (any change bumps to V2), and pin a week fixture in MIX-REVIEW-SHARE. Or encode the per-day lists (for example a day separator in the skills part).

6. **The L all-wide column breaks 12.1 (K2, K5).** WORKSHEET_DESIGN_STANDARD 12.1 caps "Wide-visual rows" (number lines, coin rows) at 4 at M and 3 at L. The card prints 7 at M and 5 at L. **Fix:** set all-wide to 4 / 3 a page and recompute the §3 and §9a rows: L all-wide N = 10 → 4 pages, 30 → 10 pages, M 30 → 8 pages. Or cite a ruling that overrides 12.1.

7. **Skills a page exceed the Review note (K5).** The 12.1 Review row says "2–3 instruction-led sections". The card uses 12.1 Review for its 12 / 10 counts. But N = 10 puts 4 skills (4 instructions) on one page, and N = 30 puts 10 over 3 pages, sometimes 4 or more on a page. That is a lot of switching for ELL/SPED pupils. **Fix:** cap the distinct skills a page at 3 (a page-aware deal), or record it as a named lead ruling and deviation in §9 and the §9a appendix.

8. **The COUNT backtest fails trivially (K4).** On master there is no `mixed-review` role, so the check errors on an unknown role and never measures "fills the page, ignores the count". **Fix:** make the FAIL state a fixture or commit in which the alias and `input.review` exist but `input.total` is ignored (total = shelves × k).

9. **One POOL backtest mixes two faults (K4).** A single fixture combines "non-passed skill with the toggle on" and "print reads skillProgress", and FAIL states such as the old ON default and a stray ✓ have no backtest. **Fix:** give each FAIL state in the POOL row its own fixture (at least: passed filter, print reads progress, default OFF, ✓ set, toggle count).

10. **Step 1b's gate does not exist (K3).** "The lessons-browser AREA-LABELS check" is in no file on this tree (`grep` finds AREA_LABELS only in this card). **Fix:** make MIX-REVIEW-BREAKDOWN, or a node assert in ws-mix-review, compare `AREA_LABELS` to the §7a table, and name it as step 1b's gate.

11. **The wrong source name is cited (K2).** `LESSONS` is private in wrm-links.js. The public accessors are `allLessons()`, `unitLessons()` and `weekInfo()`. **Fix:** cite `allLessons()` (with `seq`, `weeks`) in §7a "Lessons pool" and §7b.

12. **N = 5 2-up vs "exactly N cells" (K4).** COUNT asks for "exactly N numbered scored cells 1..N", but the 2-up sheet has 2 × 5 cells. **Fix:** say "per half, two identical halves, each numbered 1..5", and use the same wording for the key cell-count rule.

13. **The precritic path for the new role is missing (K1, K3).** `ws-precritic --role mixed-review` takes a role sample of skills, but a mixed review is driven by filters. **Fix:** add a step-1 task that adds a pinned filter sample (grades, areas, N, seed) for `--role mixed-review` to `tests/fixtures/precritic/`.
