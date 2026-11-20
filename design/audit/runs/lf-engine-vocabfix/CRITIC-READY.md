# lf-engine vocabfix: CRITIC-READY

Branch `claude/sweet-newton-c8wrv1-lf-engine-vocabfix`. It is built on the rowcap stage-2 head `7d2bdfc2f`, plus lf-placevalue's
cherry-picks `9ffe36fb1` (= fbca1a582) and `414a0e108` (= fa9500f4c). "Before" in every PNG is `414a0e108`: the tree with
lf-placevalue's pagesOf fix and without this lane.

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
- **mult_facts Scripted Model L is NOT cleared.** It is the fact model (factModel, 2 examples one a page). Its 73.4 mm rows
  are the FACT_FILL page fill. Holding them to drawn + room (59 mm) leaves page 1 about 47 % empty (EB-PAGE; 34 % today). It
  needs a page ruling, not a measurement. The ledger row is now owner lf-engine, still open.
- **Residual for the critic / EB-CLIP.** count_by_tables L, print PNG (grade-render seed): the top of the Say band text is
  hidden. The screen DOM has the Model band ending at 248.0 mm and the Say band at 247.4–256.7 mm. The meta overflow check
  finds no problems (before: 4 cells overflowed and there was no Say band). Suspect: a count-row layer painting below its
  cell. See `countbytables-L-model-*`.
- **Observation, not changed.** two_step_letter_equation M Mixed p6 has 57 mm of white in the DOM, and the next shelf is
  52.7 mm. The packing budget is about 12 mm more conservative than the drawn page. Seen only with `ws-lesson-fill --parts
  mixed`.

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
