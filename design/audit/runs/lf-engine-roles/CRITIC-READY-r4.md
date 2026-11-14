# lf-engine-roles — critic-ready, round 4 (the lead's one final round after critic r3)

Critic r3 report: `design/audit/runs/lf-engine-roles-r3/REPORT.md` (graded 1b7280c88). It failed on one page, add_wp_10k M
(C3 = 6): page 1 rendered at least 97 mm white, and the 89 mm Guided band went to page 2.

The branch is merged with origin/master 84f8813a1. Sizes M and L only.

## Root cause

The plan's page-1 white on add_wp_10k M was 84 mm. The render left 107.8 mm of a 239 mm body. The bands, plan estimate against render:

| Band | Plan estimate (mm) | Render (mm) |
|---|---|---|
| Model | 7.5 + 83.3 | 90.4 |
| Steps (two-column, `mq-steps-rows`) | 7.5 + **37.2** | 7.5 + **22.6** |
| Say | 12.5 | 10.5 |

The Steps estimate was the error, about 15 mm. It used 0.5 em a character in a 77 mm line, and pitch + 1.2 for every line. So it read
every step pair as two lines, where only step 3 wraps at M, and it added 4 mm padding where the zone has 1.5 mm.

The estimate is now `stepPairsMm` (`js/modules/sheet/roles/opener.js`), calibrated on the rendered zone at M and L:
- each column holds about 75 mm of text;
- Andika runs about 0.44 em a character there; 0.47 em is used, so a step near the end of the line counts as wrapping;
- a row's first line is pitch + 1, and each further line is 1.07 × the text size;
- rows are 2.2 mm apart, and the zone pads 1.5 mm.

The new estimate gives 22.6 mm at M (22.6 printed) and 31.3 mm at L (31.2 printed).

**Follow-on: an Opener with a full-width story now tries one page first.** It builds the page from the shortest stories of the deal
before it spills, and counts() deals 3 spares for every such page.
- Without this, the probe's spill choice decided the deal: two_step_letter_equation L went from one page to two.
- That page stays two pages: since master 84f8813a1, its two-step Model measures 96 mm and its Guided story 106 mm at L, and with the
  Steps and Say bands they cannot share 232 mm.

## Check (check first)

**`ws-print-lint` L-DENSITY SPILL-P1** (new, with a self-test):
- It applies to every multi-page kit Opener.
- It measures, in the RENDER, page 1's white under its last section and the height of page 2's first band.
- It applies the lead's `spillP1Ok`, after taking off the 7 mm the engine keeps in hand: the body is 239 mm and the budget 232 mm.
- It is in the OPENER-OVERFLOW ratchet's density rules: `OPENER_RATCHET_DENSITY` = DN-2, LONE, PAGEFILL, OPN-SPLIT, SPILL-P1.
- Backtest `roles-opener-spill-p1-render`: FAIL on 1b7280c88 (107.8 mm white, 90.4 mm band), OK on eac68c891.
- Ledger row: CHECKS_FROM_CRITICS 2026-11-14 (lf-engine roles, critic r3 F3).

## Gates

| Gate | Result |
|---|---|
| `ws-backtest --row roles-opener-spill-p1-render,roles-opener-split-fill,roles-opener-ratchet-pages` | 3 PASS |
| `ws-print-lint --self-test` | OK (116 assertions, 99 planted defects) |
| OPENER-OVERFLOW ratchet (`--ratchet-pages --ratchet-density DN-2,LONE,PAGEFILL,OPN-SPLIT,SPILL-P1`) | 156 documents, nothing rose: 78 changed skills (every Opener master spills plus every word-problem Opener) × M, L |
| `ws-print-lint`, all lints, the 18-Opener sample, M and L | no new finding against 1b7280c88 (table below) |
| `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check` | OK, 2590 hashes identical |
| `ws-boot-smoke` | OK |
| `ws-roles-unit` | OK (109) |
| `ws-layout-unit` | FAIL 1 of 1766: the known "Guided, 110 mm cells" only |
| `ws-precritic-plan` | ws-precritic-plan: OK (402 rows on the lane's path, 246 not applicable; checks-from-critics OK) (checks-from-critics 345 pass, 92 exempt, 0 fail) |

## Sample: 18 Openers, M and L (36 pages), % of the body used (ink)

The sample is:
- the 10 r3 pages: coordinate_q1, shape_name_match_3d, round_sort_10, add_wp_10k and multi_step_word, at M and L;
- 13 more Openers from the 263-skill sweep list, across templates: fact family, place value (expand, combine), fractions, time
  (elapsed, analog clocks), data (bar graph), area model, vocabulary, word problem (sub_wp_10k), two-step equation, number line
  (add_int) and legacy geometry (coordinates_plot_q1).

| Opener | Size | Before 1b7280c88: pages, % used | After: pages, % used | New findings |
|---|---|---|---|---|
| coordinates:coordinate_q1 | M | 1, 58 | 1, 58 | none |
| shapes_early:shape_name_match_3d | M | 1, 61 | 1, 61 | none |
| number_sense:round_sort_10 | M | 1, 90 | 1, 90 | none |
| addition:add_wp_10k | M | 2, 55 / 74 | 1, 90 | none |
| algebra:multi_step_word | M | 2, 60 / 84 | 2, 75 / 57 | none |
| addition:add_sub_fact_family | M | 1, 79 | 1, 79 | none |
| placevalue:expand | M | 1, 67 | 1, 67 | none |
| placevalue:combine | M | 1, 69 | 1, 69 | none |
| fractions:fraction_of_set | M | 1, 72 | 1, 72 | none |
| measurement:elapsed_visual_easy | M | 2, 66 / 88 | 2, 66 / 88 | none |
| measurement:order_clocks_analog_asc | M | 1, 75 | 1, 75 | none |
| graphs:bar_graph | M | 2, 60 / 83 | 2, 60 / 83 | none |
| multiplication:area_model_3by1 | M | 1, 83 | 1, 83 | none |
| vocabulary:vocab_grade_pictures | M | 1, 77 | 1, 77 | none |
| subtraction:sub_wp_10k | M | 1, 80 | 1, 80 | none |
| algebra:two_step_letter_equation | M | 1, 88 | 1, 90 | none |
| integers:add_int | M | 1, 94 | 1, 94 | none |
| coordinates:coordinates_plot_q1 | M | 1, 89 | 1, 89 | none |
| coordinates:coordinate_q1 | L | 1, 61 | 1, 61 | none |
| shapes_early:shape_name_match_3d | L | 1, 69 | 1, 69 | none |
| number_sense:round_sort_10 | L | 2, 57 / 54 | 2, 57 / 54 | none |
| addition:add_wp_10k | L | 2, 66 / 87 | 2, 66 / 87 | none |
| algebra:multi_step_word | L | 2, 71 / 46 | 2, 85 / 66 | none |
| addition:add_sub_fact_family | L | 2, 57 / 91 | 2, 57 / 91 | none |
| placevalue:expand | L | 1, 88 | 1, 88 | none |
| placevalue:combine | L | 1, 83 | 1, 83 | none |
| fractions:fraction_of_set | L | 1, 76 | 1, 76 | none |
| measurement:elapsed_visual_easy | L | 2, 71 / 92 | 2, 71 / 92 | none |
| measurement:order_clocks_analog_asc | L | 1, 81 | 1, 81 | none |
| graphs:bar_graph | L | 2, 68 / 94 | 2, 68 / 94 | none |
| multiplication:area_model_3by1 | L | 2, 64 / 70 | 2, 64 / 70 | none |
| vocabulary:vocab_grade_pictures | L | 1, 83 | 1, 83 | none |
| subtraction:sub_wp_10k | L | 2, 66 / 87 | 2, 66 / 87 | none |
| algebra:two_step_letter_equation | L | 1, 78 | 2, 61 / 72 | none |
| integers:add_int | L | 1, 93 | 1, 93 | none |
| coordinates:coordinates_plot_q1 | L | 1, 54 | 1, 54 | none |

**Changes:**
- add_wp_10k M is now one page, 90 % used: Model, Steps, Say and Guided.
- multi_step_word improved:
  - M: 60 / 84 → 75 / 57;
  - L: 71 / 46 → 85 / 66.
- two_step_letter_equation:
  - M is 88 → 90;
  - L is two pages because of master's taller two-step drawing; SPILL-P1 passes (86.7 mm usable white against a 105.3 mm band).

## PNGs

`design/audit/runs/lf-engine-roles/proof-r4/opener-<cat>.<skill>-<M|L>-<before|after>-<pupil|key>-p<n>.png`: 192 files, before
1b7280c88 and after, pupil and key.
