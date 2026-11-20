# lf-engine vocabfix: CRITIC-READY

Branch `claude/sweet-newton-c8wrv1-lf-engine-vocabfix`. It is built on the rowcap stage-2 head `7d2bdfc2f`, plus lf-placevalue's
cherry-picks `9ffe36fb1` (= fbca1a582) and `414a0e108` (= fa9500f4c). "Before" in every PNG is `414a0e108`: the tree with
lf-placevalue's pagesOf fix and without this lane.

## Combined scope for this critic round (rowcap stage 2 + vocabfix, head after merging rowcap 19666510e)

| Item | What | Where | Proof |
|---|---|---|---|
| rowcap F1 | Scripted Model count_by_tables L clipped (row 50 → 47 mm) | vocabfix item 3, `5054c8748` (MEASURED STATES) | EB-CLIP clean on count_by_tables M/L; rows 50.3 mm. RR-BOX still fires, see "Open" |
| rowcap F2 | Guided rows: tab keep-out off the cap only, rows ≥ measured ink + 1 mm | rowcap (guided.js) | rowcap CRITIC-READY-s2 "Round 2"; GUIDED-INK-FLOOR |
| rowcap F3 | Error Analysis "<Name> wrote" tag clear of the tab | rowcap (error-analysis.js) | TAB-CLEAR |
| rowcap F4 | Review fills under its ceiling | rowcap (review.js) | PAGEFILL (`print-lint-fill-M/L`), WHITE-ROW |
| rowcap F5 | Test reshape at its ceiling | rowcap (test.js) | PAGEFILL, WHITE-ROW |
| vocab 1 | Mixed packing drops a shelf that fits | `fd80e5c9d` | MIX-DROP / MIX-SHELVES; backtest `mix-drop` |
| vocab 2 | Lesson Practice under-filled | `d79fb5d7d` | LESSON-FILL; backtest `lesson-fill` |
| vocab 3 | Scripted Model state height estimated, not measured | `5054c8748` | EB-PAGE / EB-STRETCH / EB-CLIP; backtests `model-measured-states`, `vocab-model-onepage` |
| ruling A | Mixed: one full page with fewer items, not a half-empty second page (lead 2026-11-20) | `d1d74b9d2` | the table "Mixed item count changes" below |
| ruling B | FACT_MODEL_FILL: the one-example-a-page fact Model keeps its page fill; EB-STRETCH exempts only those cells (lead 2026-11-20) | `d1d74b9d2` | ws-empty-band --self-test (24 EB-STRETCH cases) |
| loosening 1 (rowcap) | TAB-CLEAR judged at CL-40's 1 mm for boxes and one-line facts (2 mm from text) | rowcap ruling b | judge it |
| loosening 2 (rowcap) | PAGEFILL 20-30 % at a role's ceiling is a note, not a finding (over 30 % stays major) | rowcap round 2 | judge it |
| loosening 3 (rowcap) | WHITE-ROW known list (div_facts_long Review M, two_step_mult_div_first Test L): reported, not failed | ws-capacity-pin WHITE_ROW_KNOWN | judge it |
| loosening 4 (lead 2026-11-20) | ROLE-CAPPED REVIEW: a Review at its ceiling (add_facts Review M / L, 12 items, 91-97 mm white) is accepted; PAGEFILL prints "PAGEFILL ROLE-CAPPED REVIEW" on the page instead of the over-30 % reshape finding, WHITE-ROW prints "role-capped ..." (both named, never silent; Test / EA / Opener unchanged) | ws-print-lint, ws-capacity-pin | judge it |
| for the critic | count_by_tables L Scripted Model: the Say band text is covered in print (not fixed, by instruction) | - | `countbytables-L-model-*` |

PNG sets: rowcap round 2 `design/audit/runs/lf-engine-rowcap/proof-s2r2/` (before 661965d43); vocabfix `design/audit/runs/lf-engine-vocabfix/` (this folder,
before 414a0e108). Rowcap's notes: `design/audit/runs/lf-engine-rowcap/CRITIC-READY-s2.md`.

### Checks on the merged head (Scripted Model, M and L: count_by_tables, add_wp_10_plain, fact_family_sort, vocab_grade_pictures, vocab_pick3_words, mult_facts)
- **ws-empty-band `--only EB-CLIP,EB-STRETCH,EB-PAGE --page-fill`:** FAIL 8.
  - EB-CLIP 5: add_wp_10_plain L p1 / p2 cells 1 and 3 (word-work), ink 0.8 mm past the rule; fact_family_sort L p1 cell 5
    (family-check), 0.1 mm above the rule.
  - EB-PAGE 3: add_wp_10_plain M p1 38 %, L p1 33 %; mult_facts L p1 34 % (ruling B keeps the fill rows; this was already 34 %).
  - EB-STRETCH clean.
- **RR-BOX (ws-grade-render `--raster-fit`):** FAIL 16. Each Model page of add_wp_10_plain M/L, fact_family_sort M/L and
  count_by_tables M/L (pupil + key) has its frame's bottom edge 0–21 % inked in print, because the Say band covers the Model
  frame's foot.
- **print-lint-fill-M:** FAIL 2, both PAGEFILL major on Error Analysis (rowcap's role): count_by_tables EA M 60 mm (26 %),
  fact_family_sort EA M 103 mm (44 %) at its ceiling 4.
- **print-lint-fill-L:** OK.
- **WHITE-ROW (ws-capacity-pin --check):** OK (785 pinned pages, 50 rises, 0 falls). Two known pages are reported, as rowcap
  ledgered them.

- **ROLE-CAPPED REVIEW proof (add_facts, Review + Test, M and L):**
  - print-lint L-DENSITY: OK, with notes "PAGEFILL ROLE-CAPPED REVIEW" (Review M 97 mm, 41 %; Review L 91 mm, 39 %; these were
    major findings before). Test keeps its own notes: M 21 %, L 23 % at its ceiling.
  - ws-capacity-pin: OK, with "role-capped addition:add_facts review M: WHITE-ROW 97 mm" and "... review L: WHITE-ROW 91 mm".
  - The rowcap backtests `pagefill-capped-roles` (Test) and `white-row-review` (a Review UNDER its ceiling) are unchanged.

### Gates on the merged head
ws-boot-smoke OK · ws-roles-unit OK (115) · ws-layout-unit FAIL (31 of 1748, the known fails, unchanged) · ws-precritic-plan OK
(422 rows on the path; checks-from-critics OK) · ws-capacity-pin --check OK (785 pinned, 50 rises, 0 falls) · ws-lesson-baseline
--check OK (2556 identical; the merge moves no lesson page, so no re-pin).

### Open (does MEASURED STATES clear the Say band covering the Model frame's foot? No)
- add_wp_10_plain and fact_family_sort lay their Model out in two columns, a state beside its step text. MEASURED STATES
  measures only the full-width (1-column) state, so these rows are still the estimate.
- The ink running past the rule (EB-CLIP) and the frame foot that is not inked (RR-BOX) are print findings. They fire at M
  too, on count_by_tables M, whose screen rows have 2.9 mm clearance. This was already in print on 3b0fdbcbb.
- So the fix belongs to the Say band and frame in print, plus the beside-state measure. It is not in this change.

## The three blockers

| # | Fix commit | Check (FAIL first) | Backtest row |
|---|---|---|---|
| 1 | `fd80e5c9d` | ws-mix-pages MIX-DROP + MIX-SHELVES (node) | `mix-drop` FAIL 414a0e108 → OK fd80e5c9d |
| 2 | `d79fb5d7d` | ws-lesson-fill LESSON-FILL (new, browser; precritic gate `lesson-fill`) | `lesson-fill` FAIL 414a0e108 → OK d79fb5d7d |
| 3 | `5054c8748` | ws-empty-band EB-PAGE / EB-STRETCH; EB-CLIP by a local assertion (scratchpad `clip.cjs`), because the rowcap branch's EB-CLIP has not landed | `model-measured-states` FAIL 414a0e108 → OK 5054c8748; `vocab-model-onepage` (lf-placevalue's pending row) armed with 5054c8748 |

ws-backtest: mix-drop, mix-pages, lesson-fill, model-measured-states, vocab-model-onepage and vocab-pack-lesson all PASS.

### 1. Mixed packing drops a shelf that fits
- **Cause.** packing() counted every shelf at its pool's tallest UNCAPPED shelf (the probe's tallest item). plan() lays out
  each shelf at the height of its own items, capped by rowCapMm. So packing judged that a shelf which fits would spill.
- **Fix.** `shelfRow()` is now the one shelf-height function that packing and plan() both use. packing recounts
  `used` / `pagesOf` from it. `meta.packedShelves` is added beside `packedPages`.
- **Results (items):**
  - two_step_letter_equation M, seeds 1 and 4242: Mixed 5 → 6, still 2 pages.
  - add_facts L 10 → 12. div_facts L 14 → 17. two_step_add_then_div L 4 → 5. number_patterns_rule L seed 1: 9 → 10.
- **Decision for the lead.** These Mixed pages lose items, and each loses a page:
  - add_wp_10 L 4242: 2 pages / 12 → 1 page / 10. The page is full (PNG). The lesson goes 5 → 4 pages.
  - fact_family_sort L: 16 → 10.
  - function_table_easy L: 21 → 15.
  - vocab_pick3_words L: 13 → 9.

  At the heights plan() really draws, the one-shelf-per-skill start fits on page 1. So the `lessonFit` multi-page rule
  ("fill the pages the start takes") no longer gives a second page. The earlier second page existed only because of the
  over-estimate.

  I tried a hybrid: judge the page count at the old heights and the fill at the laid-out heights. It brought add_wp_10 back
  to 14 items on 2 pages, but it put vocab_grade_pictures L Mixed on 3 pages with 55.6 mm of white on p6 (LESSON-FILL
  --parts mixed). I reverted it.
- **vocab_grade_pictures L lesson.** This branch prints 7 pages: chart 1, teach 3, practice 1, Mixed 2 with 10 items. That
  is the same as 414a0e108. `7d2bdfc2f` printed 9 pages. The brief expected 8, which was lf-placevalue's count on its own
  base. V-PACK OK.

### 2. Lesson Independent (Practice) under-filled
- **Rowcap stage 2's fill-at-the-cap did not fix this.** That fill never ran here, for three reasons:
  - the [6, 2] shape clamped to 1 column took the 1-column target of 4 rows;
  - PAGE FILL skips a clamped section and a grid under the step strip;
  - the clamped shape was never "whole", so the strip was dropped.
- **Fix.**
  - layout.js tells a column clamp apart from an overflow.
  - `fillClamped` is set on the lesson practice section, so a section clamped only in its columns now fills, including
    under the strip.
  - The last practice shape, when clamped only in its columns, counts as whole.
- **Result.** follow_given_rule and number_patterns_rule, M and L, seed 4242: Practice 2 pages → 1, with all 6 items under
  the step strip. Seed 1 was already 1 page.

### 3. Scripted Model state height
- **Fix: MEASURED STATES.** prepare() has the host measure a full-width state exactly as it is drawn: its step text over
  it, its marks, the wide 1-picture-3-words state, and the traced last state. All states are stacked in one grid cell, so
  the measure is the tallest state. plan() sizes rows from this measure and deals pages at the laid-out height, with the
  row cap applied once.
- **ws-empty-band, scripted-model, 10 skills × M/L:** 47 → 31 findings. Every remaining finding was also present before.
  - vocab_grade_pictures: EB-PAGE (p1 36 % / 39 %) and EB-STRETCH cleared. It now prints 1 page at M and L.
  - vocab_pick3_words: EB-STRETCH cleared (16 mm over → 0).
  - two_step_letter_equation L: EB-PAGE 3 pages → 1.
- **ws-empty-band with the rowcap branch's EB-CLIP**, after merging b5c99c91d: `--only EB-CLIP,EB-STRETCH,EB-PAGE
  --page-fill` on count_by_tables, vocab_grade_pictures, vocab_pick3_words and number_patterns_rule, scripted-model M/L: OK.
- **Local EB-CLIP** (ink at least 0.5 mm above the row rule; screen render, seed 4242), measured before the merge:
  - count_by_tables L: −1.28 mm → +2.02 mm, rows 47 → 50.3 mm.
  - number_patterns_rule L: −2.68 → +0.72 mm.
  - vocab M / L: 1.64 / 0.70 mm.
- **mult_facts Scripted Model L: ruled (lead 2026-11-20), EB-PAGE wins.** It is the fact model with ONE example a page; its
  73.4 mm rows fill the page to FACT_FILL (held to drawn + room, 59 mm, page 1 would be about 47 % empty). The rows are
  unchanged. EB-STRETCH exempts exactly these cells by name: `FACT_MODEL_FILL` (the grid carries `mq-factmodel-fill` in
  roles/scripted-model.js factModel; `STRETCH_EXEMPT` in ws-empty-band, reason in both). It is not a blanket exemption:
  - `ws-empty-band --self-test` (EB-STRETCH 24 cases): the fill-grid fact Model passes; the same fact cells outside the fill
    grid FAIL (2); a full-width count-row Model state over its cap FAILS (1).
  - Rendered, head tool: `--only EB-STRETCH` on mult_facts, count_by_tables, vocab_pick3_words Scripted Model M/L: OK. The
    same head tool on 414a0e108 (no fill grid, rows estimated): FAIL 14 - mult_facts L 8 and vocab_pick3_words M/L 6 (15.5 -
    16.4 mm over), so an over-stretched Scripted Model still fails.
- **Residual for the critic / EB-CLIP.** count_by_tables L, print PNG (grade-render seed): the top of the Say band text is
  hidden. The screen DOM has the Model band ending at 248.0 mm and the Say band at 247.4–256.7 mm. The meta overflow check
  finds no problems (before: 4 cells overflowed and there was no Say band). Suspect: a count-row layer painting below its
  cell. See `countbytables-L-model-*`.
- **Observation, not changed.** two_step_letter_equation M Mixed p6 has 57 mm of white in the DOM, and the next shelf is
  52.7 mm. The packing budget is about 12 mm more conservative than the drawn page. Seen only with `ws-lesson-fill --parts
  mixed`.

## Mixed item count changes (lead ruling 2026-11-20)
Accepted: one full Mixed page with fewer items beats a half-empty second page. Every lesson whose Mixed (or Practice) part
changed, before = 414a0e108, after = this head (buildSheet role lesson, practicePages 1, mixed).

| Lesson | Size | Seed | Mixed before → after (items, pages) | Lesson pages |
|---|---|---|---|---|
| add (sample: add_facts band 10, +1/+2/+3) | L | 1, 4242 | 10, 1 → 12, 1 | 4 → 4 |
| addition:add_facts | L | 1, 4242 | 10, 1 → 12, 1 | 4 → 4 |
| division:div_facts | L | 1, 4242 | 14, 1 → 17, 1 | 4 → 4 |
| addition:add_wp_10 | L | 4242 | 12, 2 → 10, 1 | 5 → 4 |
| addition:fact_family_sort | L | 1, 4242 | 16, 2 → 10, 1 | 5 → 4 |
| algebra:function_table_easy | L | 1, 4242 | 21, 2 → 15, 1 | 6 → 5 |
| algebra:two_step_add_then_div | L | 4242 | 4, 2 → 5, 2 | 11 → 11 |
| algebra:two_step_letter_equation | M | 1, 4242 | 5, 2 → 6, 2 | 7 → 7 |
| vocabulary:vocab_pick3_words | L | 1, 4242 | 13, 2 → 9, 1 | 7 → 6 |
| patterns:number_patterns_rule | L | 1 | 9, 1 → 10, 1 | 4 → 4 |
| patterns:number_patterns_rule | L | 4242 | 9, 1 → 10, 1 (Practice 2 → 1 page, item 2) | 5 → 4 |
| patterns:number_patterns_rule | M | 4242 | 10, 1 → 10, 1 (Practice 2 → 1 page, item 2) | 5 → 4 |
| patterns:follow_given_rule | L | 4242 | 10, 1 → 10, 1 (Practice 2 → 1 page, item 2) | 5 → 4 |
| patterns:follow_given_rule | M | 4242 | 11, 1 → 11, 1 (Practice 2 → 1 page, item 2) | 5 → 4 |
| vocabulary:vocab_grade_pictures | M / L | 1, 4242 | 10, 2 → 10, 2 (unchanged by this lane; 7d2bdfc2f printed 3 Mixed pages at L) | 7 → 7 |

## Hash proof
- I ran the lesson baseline `--check` against the 7d2bdfc2f pin: FAIL, 152 of 2590 differ. I then re-pinned in
  `edc322bf4` from a `--write` of this head.
- Attribution comes from a `--write` of 414a0e108 compared with head. The full list is in
  `lesson-baseline-changed.txt`.
  - **48 pages from the lf-placevalue cherry-pick:**
    - vocab_grade_pictures M/L p5–p9;
    - add_wp_10 L p4–p5;
    - two_step_letter_equation M p6–p7.
  - **78 pages from this lane:**
    - item 1, Mixed pages: add (sample) L p4, add_facts L p4, div_facts L p4, add_wp_10 L p4–p5, fact_family_sort L
      p4–p5, function_table_easy L p5–p6, two_step_add_then_div L p10–p11, two_step_letter_equation M p6–p7,
      vocab_pick3_words L p6–p7, number_patterns_rule L/1 p4;
    - item 2: follow_given_rule and number_patterns_rule M/L 4242 p3–p5.
  - **34 pages are no longer printed:** the shorter Mixed and Practice parts above. No page is new.
  - Item 3 changes no lesson page.
- ws-capacity-pin --check: OK (785 pinned pages, 43 rises, 0 falls).

## PNGs (pupil + key, `-before-414a0e108` / `-after`)
- `addwp10-L-mixed-*` (p4–p5 → p4)
- `twostep-M-seed1-mixed-*` (p6–p7)
- `followrule-M-lesson-*` (p3–p4)
- `vocabpics-M-model-*` and `vocabpics-L-model-*` (p1–p2 → p1)
- `vocabpics-L-lesson-mixed-*` (p6–p7)
- `countbytables-L-model-*` (p1)

## PARKED (2026-11-20, owner budget stop): resume here

**State.** Head 3744c25d5 is merged with rowcap 19666510e and master. Its gates are green: boot, roles-unit, precritic-plan, capacity-pin (0 falls) and the lesson baseline (2556 identical). layout-unit shows only its known fails. The critic has NOT run, because the machine checks below are still red. That critic is rowcap's round cap: if it fails, stop and report.

**Resume, in order:**

1. **The Scripted Model, rowcap critic F1 class.** Measure the two-column "state beside its step" layout as it is drawn, not as estimated; 5054c8748 measures only the full-width states. Then fix the print-only foot, where the Say band covers the Model frame's bottom edge. These still FAIL:
   - RR-BOX ×16: every Model page of add_wp_10_plain, fact_family_sort and count_by_tables, at M and L, pupil and key.
   - EB-CLIP ×5: add_wp_10_plain L and fact_family_sort L.
   - EB-PAGE: add_wp_10_plain M 38 %, L 33 %.

   These must all be green before the critic runs.
2. **ROLE-CAPPED ERROR-ANALYSIS (lead 2026-11-20).** Add the named PAGEFILL note in ws-print-lint, as for Review. This clears print-lint-fill-M on count_by_tables EA M and fact_family_sort EA M.
3. **One round-cap critic** on this head. Scope:
   - rowcap F1–F5;
   - vocab items 1–3;
   - rulings A and B, ROLE-CAPPED REVIEW and ROLE-CAPPED EA;
   - the three loosenings (TAB-CLEAR 1 mm, the PAGEFILL 20–30 % note, the WHITE-ROW known list);
   - the count_by_tables L Say-band clip.
