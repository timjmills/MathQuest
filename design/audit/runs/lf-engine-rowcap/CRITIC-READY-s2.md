# lf-engine ROW-STRETCH CAP stage 2 (critic r1 F4): critic-ready

Branch `claude/sweet-newton-c8wrv1-lf-engine-rowcap`, merged with master 65c28ccdf. Stage 1 = 3b0fdbcbb. Lead ruling: a row stretches
only to its drawn height plus writing room, as ONE engine rule for every template (LEAD_DECISIONS 2026-11-14, staged rollout).

## The rule (js/modules/sheet/layout.js)

- **Every template is capped by default**: `ROW_ROOM_DEFAULT_MM = 3`. `ROW_ROOM_MM` names templates with their own room
  (`vocab-match3` 2, `lesson-vocab` 2, `count-row` 3). `rowCapMm` is Infinity only for a named exception.
- **Named exceptions, each with its reason:**
  - `ROW_STRETCH_EXEMPT`: `division` (LDIV-ROOM, owner 2026-11-14: the writing boxes grow into the row up to 2x),
    `long-multiplication` (the partial-product rows are the work area, PT 2.4), `word` (a story cell: the row under the story is
    the working space, PT 3.7).
  - `WORK_SPACE_CLASSES`: footprint classes `word`, `long` (their spare height IS the working space; the fill limit already
    exempted them).
  - `ROW_STRETCH_EXEMPT_LAYOUTS`: `fact-rows` - the fact-row engine (factRowsLayout) keeps the owner's FULLPAGE / ROWSAME rules
    (facts-print-fix r4-r5). **Lead decision point:** this is the one exception that is a layout engine, not a template.
- **The fill counts at the cap (F4 c):** the layout probe returns `capH`; `roomed()` (dense pass) and PAGE FILL count rows at no
  more than the cap; a static footprint is capped on its own height.
- **Self-built rows capped (F4 b):** Guided (rows held to what they draw: measure + 1 less the tab keep-out a CL-14 cell does not
  draw; the fact Model's think-cue reserve), Scripted Model (fact branches + the step layout), Error Analysis (`rowHeights`),
  Pre-skill check (quadrants, stacked bands, routed units), plus Test (`fillToCeiling`, the two-width split).

## Checks (each FAILS on 3b0fdbcbb, PASSES on 28e9e9d1f; ws-backtest OK)

| Check | Backtest row |
|---|---|
| ws-empty-band EB-STRETCH judges every template; FAIL (not a note) on guided, scripted-model, error-analysis, pre-skill-check | `eb-stretch-selfbuilt` |
| ws-rowcap-fill ROWCAP-FILL over all 53 registered templates x 6 shapes | `rowcap-fill-all` |
| ws-rowcap-fill --only UNLISTED: an unlisted template is capped (+ ws-layout-unit ROWCAP-DEFAULT / ROWCAP-EXEMPT) | `rowcap-unlisted` |

EB-STRETCH details: drawn = the larger of the cell's natural height and the bridge measure + 1 (EB-FOOT holds that measure to
the drawing); a row of static footprints (no bridge measure) is judged at 3 mm tolerance, a measured row at 1.5 mm; a Scripted
Model's states are one height (MOD-GRID); legacy cells and template-less lesson panels are noted, not judged; fact-row grids are
skipped (the named layout exception).

## Hash proof

- **ws-capacity-pin --check: OK, 785 pages, 0 falls, 42 rises.** Rises = pages that GAINED rows because rows now count at the cap:
  add / sub / mult facts independent + more-practice L 12 -> 15; sub_* no-regroup stacks independent + more-practice L 9 -> 12
  (sub_100k / sub_1m 6 -> 8); their Guided L 6 -> 7; placevalue expand / unit_form / combine Guided M 7 -> 9, L 6 -> 7;
  identify Test L 10 -> 12; the word-problem Reason It M / L +1; (vocab_grade_pictures guided / mixed L are stage 1's).
- **Grid roles (34 skills x 10 roles x M/L, buildSheet page hashes, stage 2 vs merged stage 1):** pages changed / total -
  error-analysis 62/66, guided 72/82, independent 29/66, mixed-practice 43/67, more-practice 29/66, opener 54/66,
  pre-skill-check 16/102, review 50/66, scripted-model 88/90, test 24/66. **0 item falls.** One page-count change:
  sub_100k_no_regroup Pre-skill check M 2 -> 1 page, same 10 items.
- **By template** (pages changed; of which gained items; largest row drop): stack 138 (15; -33 mm), word-work 123 (0; -44.8),
  pv 55 (0; -19), fact 44 (6; -31.2), chartwindow 35 (0; -24.3), family-check 21 (0; -36.9), words 15 (-11.8),
  vocab-pick3 15 (-19.7), equation 10 (-30.3), vocab-match3 10 (-16.9), count-row 8 (-10.4), legacy 7 (-12.3), pv-support 5,
  number-line 2, base10 2, counters 2, parity 2, division 2 (0: exempt, changed only by its neighbours). Every unchanged-count
  page is a row now held to its cap; every gained-items page is a page that gained a row.
- **Largest height changes:** add_wp_10_plain Guided L -44.8 mm a row; fact_family_sort Error Analysis M -36.9; sub_* Error
  Analysis L -33; add_wp_20 / sub_wp Guided L -31.8; add_facts Scripted Model L -31.2; div_facts Scripted Model L -30.3.
- **Lesson baseline RE-PINNED** (same commit as the proof): 1454 of 2590 page hashes changed across all 46 pinned lessons.
  **One count fell:** vocabulary:vocab_grade_pictures L (seeds 4242 and 1) 10 -> 9 pages (pupil + key p10 MISSING): its last part
  (mult-grid + 6 facts, with its Steps band) printed over p9 + p10 and now fits p9 - the same 7 items, the 2 cells that fell are
  the repeated Steps band. No item lost. Full list: `proof-s2/lesson-baseline-changed-s2.txt`.

## PNGs (this folder; pupil + key, before = 3b0fdbcbb, after = this branch; seed 1)

"% of page used" = the body from the header to the lowest block, against the body to the footer.

| Role | Skill | Size / page | Cells | Row mm | % of page used | White foot mm | Files |
|---|---|---|---|---|---|---|---|
| independent | subtraction:sub_100_no_regroup | M p1 | 16 → 16 | 57.3 → 50.4 | 99 % → **87 %** | 3 → 30.4 | `independent-subtraction__sub_100_no_regroup-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| independent | subtraction:sub_100_no_regroup | L p1 | 9 → 12 | 76.1 → 57 | 99 % → **99 %** | 3 → 3 | `independent-subtraction__sub_100_no_regroup-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| independent | placevalue:expand | M p1 | 12 → 12 | 18.9 → 18.9 | 99 % → **99 %** | 3 → 3 | `independent-placevalue__expand-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| independent | placevalue:expand | L p1 | 10 → 10 | 22.7 → 22.7 | 99 % → **99 %** | 3 → 3 | `independent-placevalue__expand-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| independent | vocabulary:vocab_pick3_words | L p1 | 6 → 6 | 76.1 → 76.1 | 99 % → **99 %** | 3 → 3 | `independent-vocabulary__vocab_pick3_words-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| independent | addition:fact_family_sort | M p1 | 9 → 9 | 75.1 → 62.3 | 97 % → **81 %** | 7 → 45.6 | `independent-addition__fact_family_sort-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| review | vocabulary:vocab_grade_pictures | M p1 | 4 → 4 | 52.7 → 52.7 | 91 % → **91 %** | 22 → 22 | `review-vocabulary__vocab_grade_pictures-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| review | subtraction:sub_1k_no_regroup | L p1 | 9 → 9 | 68.8 → 59.3 | 97 % → **84 %** | 8.2 → 38.1 | `review-subtraction__sub_1k_no_regroup-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| mixed-practice | placevalue:compare | M p1 | 21 → 21 | 21.5 → 21.5 | 67 % → **67 %** | 80 → 80 | `mixed-practice-placevalue__compare-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| mixed-practice | composing:number_word_form | L p1 | 10 → 10 | 39.7 → 39.1 | 87 % → **86 %** | 30.7 → 34 | `mixed-practice-composing__number_word_form-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| guided | addition:add_wp_10 | M p1 | 4 → 4 | 112.9 → 105.8 | 93 % → **87 %** | 18.1 → 30.4 | `guided-addition__add_wp_10-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| guided | multiplication:count_by_tables | L p1 | 3 → 3 | 75.5 → 62.2 | 94 % → **81 %** | 15 → 46.3 | `guided-multiplication__count_by_tables-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| scripted-model | placevalue:expand | M p1 | 4 → 4 | 39.7 → 37.7 | 69 % → **66 %** | 74 → 82 | `scripted-model-placevalue__expand-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| scripted-model | multiplication:count_by_tables | L p1 | 4 → 4 | 50 → 47 | 87 % → **82 %** | 30.8 → 42.8 | `scripted-model-multiplication__count_by_tables-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| error-analysis | multiplication:count_by_tables | M p1 | 2 → 2 | 114.8 → 86.1 | 99 % → **75 %** | 3 → 60.4 | `error-analysis-multiplication__count_by_tables-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| error-analysis | placevalue:compare | L p1 | 4 → 4 | 57 → 49.5 | 99 % → **86 %** | 3 → 33 | `error-analysis-placevalue__compare-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| pre-skill-check | subtraction:sub_100_no_regroup | M p1 | 16 → 16 | 53.8 → 52.5 | 97 % → **95 %** | 7.1 → 12.3 | `pre-skill-check-subtraction__sub_100_no_regroup-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| pre-skill-check | placevalue:identify | L p1 | 4 → 4 | 22 → 22 | 45 % → **45 %** | 133.6 → 133.6 | `pre-skill-check-placevalue__identify-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| opener | composing:number_word_form | M p1 | 10 → 10 | 31.7 → 31.7 | 75 % → **69 %** | 59.7 → 74.7 | `opener-composing__number_word_form-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| opener | placevalue:compare | L p1 | 10 → 10 | 58.7 → 58.7 | 79 % → **73 %** | 50.1 → 65.1 | `opener-placevalue__compare-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| lesson | addition:add_facts | M p2 | 8 → 8 | 40.9 → 40.9 | 91 % → **87 %** | 22.1 → 31.4 | `lesson-addition__add_facts-M-{pupil,key}-p2-{before-3b0fdbcbb,after}.png` |
| lesson | composing:chart_to_120 | L p3 | 6 → 6 | 69.8 → 65.6 | 99 % → **94 %** | 3 → 15.6 | `lesson-composing__chart_to_120-L-{pupil,key}-p3-{before-3b0fdbcbb,after}.png` |
| test | composing:chart_to_120 | M p1 | 6 → 6 | 76.5 → 62.4 | 99 % → **81 %** | 3 → 45.3 | `test-composing__chart_to_120-M-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |
| test | addition:add_facts | L p1 | 12 → 12 | 60.6 → 45.6 | 80 % → **61 %** | 49.6 → 94.7 | `test-addition__add_facts-L-{pupil,key}-p1-{before-3b0fdbcbb,after}.png` |

**For the critic - white at the foot.** The cap leaves the refused height at the foot, as ruled. Every page holds less than one
row of white unless the count is capped: Test add_facts L (12 = 12.1's L ceiling: 95 mm white), Test chart_to_120 M, Scripted Model
and Opener (their counts are their examples / steps), Pre-skill check identify L (its 4 questions). These are the pages to grade
against PAGEFILL.

## Open (not fixed this round)

1. **EB-STRETCH still fails on fact Scripted Model / Guided Model at L** (mult_facts Scripted Model L 14.4 mm, Guided L Model
   5.6 mm): not a stretch - the planner's DRAWN estimate (hMinAt + step text + jot lines, the think-cue reserve) is taller than the
   state draws. Owner of the fix: lf-roles (the Scripted Model / Guided planners' height estimates).
2. **fact-rows** is a named layout exception (owner FULLPAGE); a lead decision whether it joins the rule.
3. ws-layout-unit: the known "Guided, 110 mm cells" fail, plus 30 "owner 2026-10-31 mixed facts ... S" fails that come from
   master (factRowsLayout at size S; they crashed the script on master - a guard now lets it run). S is dropped.


## Round 2 (critic lf-engine-rowcap-s2 FAIL: F2-F5; F1 is scripted-model.js, the vocabfix builder's file - not touched)

### Checks first (each FAILS on 661965d43 and PASSES on the fix; ws-backtest unwrapped, all PASS)

| Check | Where it runs | Backtest row |
|---|---|---|
| **EB-CLIP** (ws-empty-band): every print cell's ink ends >= 0.5 mm above its row's rule; legacy and template-less cells judged too (ruling b) | precritic --skill, every card role x M/L, pupil page AND key | `eb-clip-guided` (F2) |
| **TAB-CLEAR** (ws-empty-band): the number tab >= 2 mm from text; CL-40's 1 mm from a one-line fact / equation or a box | same, pupil + key | `tab-clear-ea` (F3) |
| **GUIDED-INK-FLOOR** (ws-roles-unit): every Guided row >= its measured ink + 1 mm | precritic --role guided | `guided-ink-floor` (F2) |
| **RR-BOX** (ws-role-raster, `--raster-fit`): every dark frame edge inked over >= 70 % of its length in the printed PDF | precritic raster-fit, now on scripted-model, guided, error-analysis, pre-skill-check, review, test, independent, mixed-practice, opener x M/L | `rr-box-frame` (fixture pair: the 661965d43 count_by_tables Scripted Model L PDF fails - Model frame covered by the Say band, F1; a clean Guided L PDF passes) |
| **PAGEFILL** `--fill-roles review,test,error-analysis,opener` at M and L: major over 20 % under the role's ceiling, over 30 % at it (a reshape fills it); 20-30 % at the ceiling is a note | precritic print-lint-fill-M / -L | `pagefill-capped-roles` (F5) |
| **WHITE-ROW** (ws-capacity-pin): a one-page Review / Test / EA under its ceiling, where one more row would stay under it, leaves no room for that row (1.15 x its height + 3 mm) | precritic capacity-pin, deploy gate | `white-row-review` (F4) |

### Fixes

- **F2** (guided.js): the tab keep-out comes off the CAP only; every row stays >= its measured ink + 1 mm. add_wp_10_plain Guided L p2 rows 87.6 -> 89.6 mm; EB-CLIP clean.
- **F3** (error-analysis.js): the "<Name> wrote / chose:" tag moves ACROSS past the tab (`left: tab + 2 mm`), not the work down - a margin
  over the work cost Error Analysis L an item (add_wp_10 3 -> 2, identify / unit_form 4 -> 3), so it was replaced. TAB-CLEAR clean
  on fact_family_sort, add_wp_10, identify, unit_form, count_by_tables EA M/L, pupil + key; ws-cell-checks PUPILTAG / TAGINK / EA-PAD OK.
- **F4** (review.js): under its ceiling a Review tries one more main column, and (where the earlier rows are no taller than the main
  ones) lets the earlier share's 20 % floor give way. add_facts Review M and L 10 -> 12 (the ceiling); sub_facts L 8 -> 10,
  sub_2d_1d M 8 -> 10, fact_family_sort M 8 -> 10, div_facts_long M 8 -> 10, number_word_form L 10 -> 11.
- **F5** (test.js `reshape`): a Test at its ceiling whose capped rows leave more than a row of white takes fewer columns and more rows.
  add_facts Test L 4 x 3 -> 3 x 4: white 94.7 -> 52.6 mm (78 % of the page used). The ceiling is not raised.

### Hash proof

- **Lesson baseline:** `--check` against the round-1 pin: all 2590 hashes identical (no lesson page changes; no re-pin).
- **ws-capacity-pin --check: OK** - 0 falls, 49 rises (the Review / Test rises above + round 1's).
- **WHITE-ROW known (reported, not failed; lead calls):** div_facts_long Review M (69.5 mm: its 84-94 mm long-division earlier row and
  the Mixed Review share cap the count) and two_step_mult_div_first Test L (pre-existing on master: one story a page).

### PNGs (proof-s2r2/; pupil + key, before = 661965d43, after = this head; seed 1)

| Role | Skill | Size / page | Cells | Row mm | % of page used | White foot mm |
|---|---|---|---|---|---|---|
| guided | addition:add_wp_10_plain | M p1 | 4 → 4 | 108.8 → 108.8 | 90 % → **90 %** | 24.4 → 23.4 |
| guided | addition:add_wp_10_plain | L p1 | 2 → 2 | 125.1 → 125.1 | 70 % → **70 %** | 72.3 → 72.3 |
| guided | addition:add_wp_10_plain | L p2 | 4 → 4 | 87.6 → 89.6 | 88 % → **89 %** | 31.2 → 27.2 |
| error-analysis | addition:fact_family_sort | M p1 | 4 → 4 | 64.8 → 64.8 | 57 % → **57 %** | 103 → 103 |
| error-analysis | addition:fact_family_sort | L p1 | 4 → 4 | 92.3 → 92.3 | 81 % → **81 %** | 47 → 47 |
| review | addition:add_facts | M p1 | 10 → 12 | 45.7 → 45.7 | 60 % → **60 %** | 97 → 97 |
| review | addition:add_facts | L p1 | 10 → 12 | 45.7 → 45.7 | 62 % → **62 %** | 91 → 91 |
| test | addition:add_facts | M p1 | 16 → 16 | 45.6 → 45.6 | 79 % → **79 %** | 49.6 → 49.6 |
| test | addition:add_facts | L p1 | 12 → 12 | 45.6 → 44.6 | 61 % → **78 %** | 94.7 → 52.6 |

**For the critic:** Review add_facts M / L now print 12 (the ceiling) but keep about 91-97 mm of white: the count is at the 12.1 ceiling.
Raising it is the lead's call, as for F5.

### Open (not this lane)

- **F1** Scripted Model count_by_tables L clipped (scripted-model.js, the vocabfix builder). RR-BOX / EB-CLIP / RR-CLIP fire on it, and also
  on Scripted Model add_wp_10_plain L and fact_family_sort L (the Model frame's foot covered by the Say band).
- **TAB-CLEAR debt outside this change** (seen in the sweep, judged at CL-40's 1 mm for boxes): count-row L on the grid roles 2.0 mm from the
  hexagon, fact-probe equation 1.3-1.4 mm, legacy Pre-skill check cells 1.0-1.9 mm, a chartwindow `td` at 0.0 mm. A precritic run on those
  skills will show them.
- EB-STRETCH, from before this round (on 661965d43 too): add_wp_10_plain Guided Model row 8-15 mm over (the planner's worked-line reserve)
  and Review L 2.4-3.2 mm over.
