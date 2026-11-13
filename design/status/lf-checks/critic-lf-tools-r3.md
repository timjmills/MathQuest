# Critic r3: lf-tools (A no phone width + B copy-light / batch), fac8e03a0..b99cf0bde, graded at b99cf0bde

Independent critic, Opus medium, 2026-11-13. This is round 3, run after the round cap. Branch claude/sweet-newton-c8wrv1-lf-tools.
Browser runs went through /tmp/mq-browser-run.sh, one at a time. The commit worktrees used for the checks are removed. No tracked
file was edited except this report.

**VERDICT: A PASS, B FAIL.** A: C1 8 · C2 8 · C3 9 · C4 8. B: C1 6 · C2 6 · C3 7 · C4 7.

The criteria are the same as in r1 and r2. C1: the verdicts are correct. C2: no false alarms and no holes. C3: the tests,
self-tests and plan are green. C4: the notes, briefs and runtime are clear.

## Evidence
| Run | Result |
|---|---|
| self-tests: ws-copy-light (52), ws-drawing-key (19), ws-no-phone-width (28), ws-precritic (includes copy-light and drawing-key), ws-grade-render --touch-self-test (9) and --sample-self-test (5), ws-screen-slots | all OK |
| ws-no-phone-width | OK (76 files, 74 derived, 8 allow-listed) |
| ws-precritic-plan | OK (160 rows on the path). `--checks-from-critics`: 79 pass / 31 exempt / 15 fail. No row was dropped: the 4 rows were added and 2 were re-pointed. No failing row is lf-tools' |
| ws-precritic --skill addition:add_sub_10s --dry-run | `ws-drawing-key` and `ws-copy-light` are both on the plan |
| ws-backtest --row (10 rows): drawing-key-complete, copy-light-stack-batch, copy-light-sample-widths-per-skill, no-phone-width-pupil-allow, no-phone-width-default, no-phone-width-derived, copy-light-eligibility, copy-light-drawing-batch, copy-light-sample-widths, copy-light-brief-names | 10 PASS (188 s) |
| ws-drawing-key --verbose | OK. 46 templates judged, 4166 mutations, 6 templates unused |
| ws-boot-smoke | OK |
| ws-copy-light over all 727 live skills | 16 ELIGIBLE. 14 of them are already in redesign-passed.js and are anchored by their siblings. The 2 new ones are add_sub_10s and add_sub_100s |

## r2 defects re-verified
- **D1: fixed as reported.** mult_2by1_column, add_column_multi, add_missing_digit, sub_missing_digit and placevalue:compare
  are NOT ELIGIBLE, and the r2 stack batch reads BATCH FAIL. The new key has defects of its own (E1-E4).
- **D2: fixed.** ws-share-options' pupil steps run at 1024 x 768 (diff read). NP-PUPIL flags the three pupil 390 lines at
  f3ae7acca and at 27545964d. Known open item: ws-simple-print still has one student-view step at `[390, false]` (line 2006),
  and NP-ARRAY does not read `[w, bool]` pairs. It is routed to the size-S builder and noted here, not counted.
- **D3: fixed.** A 3-skill copy-light run (sub_100_no_regroup, sub_1k_no_regroup, sub_2d_1d) gives every skill 1280 / 1366 /
  820 / 1024. A 2-of-3 run gives the same. A batch still deals the widths across the batch, as designed.
- **D4: fixed in form only.** The self-tests now exercise stack, pv and clock. The glyph case misses × and ÷ (E1).
- **D5: fixed.** The render-gate label names the card, worksheet and quiz.
- **The re-pointed NP rows still prove their original checks.** I ran today's ws-no-phone-width on each commit:
  - f3ae7acca still FAILs on ws-student-explorer's 390 / 360 loops and its touch viewport, which is the original A2 finding.
  - 91182e61b still FAILs with 27 findings, which are the original defaults.
  - 27545964d now FAILs only on NP-PUPIL. That is a real red, so the re-point to fdc35fb99 (OK) is honest.
- **r1's fixes hold.** B2, B4, B5 and A2 backtest PASS. A1 and A3 self-tests are OK. B1 and B6 are covered by the D1 checks.

## Defects (B; round-cap note at the end)
- **E1 (B C1, major): the skeleton masks × and ÷.** `glyphsOf` masks words with `[A-Za-zÀ-ɏ]`, and × (U+00D7) and ÷ (U+00F7)
  fall inside that range. So `glyphsOf('6 × 7')`, `glyphsOf('42 ÷ 7')` and the `&times;` / `&divide;` entities all return
  `''`. Only a lone `x` becomes ×. The file's own header says × and ÷ are kept.
  - Effect: `fact {op:'*', notation:'vertical'}` and `{op:'/', notation:'vertical'}` both key to `fact@2f11fa`. In the live
    verdicts, "anchor: division:div_facts passed on template fact@2f11fa" anchors mult_facts' × column, and mult_facts'
    horizontal × facts anchor division:mixed_mult_div's horizontal ÷ facts (`fact@d20f61`).
  - ≤, ≥, ≠, · and the fraction `/` are masked as well.
  - **Check:** add glyph self-test cases `'6 × 7' → '×'`, `'42 ÷ 7' → '÷'` and the two entities. Add a known-different pair
    fixture: fact × vs ÷ must key differently.
- **E2 (B C1, major): the skeleton is too coarse. Visibly different drawings hash the same on three templates.** I rendered
  and looked at each pair, in print and on screen.
  - **clock:** `numerals: 'all'` and `'quarters'` (12 numerals vs 12 / 3 / 6 / 9 only) are both `clock@162bde`. This is a real
    skill option ("12, 3, 6 and 9 only", skill-options.js:1705), and it is a scaffold fade. Cause: a run of 12 `text` elements
    and a run of 4 are both "many".
  - **word-work bar:** `barKind 'whole'` (part-part-whole) and `'compare'` (a dashed difference segment) are both
    `word-work@ab8480`. r2 named barKind explicitly. Cause: `style` is dropped, so a dashed border is invisible, and the
    compare row's dashed span collapses into the same `span(span)*` run as the two parts.
  - **word-work column work:** subtraction:sub_wp_compare, which has a regroup row of three boxes above the top row, and
    multiplication:mult_word_problems, which has no regroup row, are both `word-work@3cd645`. Cause: the `.mq-wwcols` grid is
    flat, so the regroup boxes and the top-row boxes form one identical-sibling run once slot names are dropped.
  - The stack self-test's "a carry row is a new drawing" passes only because the stub gives the carry boxes their own class.
  - **Check:** a known-different-pairs fixture (clock numerals all / quarters, bar whole / compare, word-work with / without
    a regroup row, fact × / ÷) that must key differently. The skeleton should also keep border-style and fill presence, and
    count runs in buckets (1 / 2-4 / 5+) or by grid row, not as one-or-many.
- **E3 (B C2, major): the skeleton is too fine. Trivially equal drawings split, so whole families can never be eligible.**
  80 of the 727 live skills draw 6 or more skeletons, most of them seen on only 1-2 items. Examples:
  - count_by_2s through count_by_12s each draw about 345 skeletons (count-row). 263 of count_by_3s' 346 skeletons are never
    drawn by count_by_2s. If count_by_2s passed, its 10 siblings would still never be eligible.
  - integers:add_int draws 132 number-line skeletons and sub_int 141, with none shared. Cause: tick lines and labels
    alternate (`line,text,line,text`), so the runs never collapse and each range is a new drawing. A negative label's `−`
    also counts as an operator glyph.
  - time_fives_ring draws one skeleton per set of given numerals.
  - mult_chart_easy draws 599 skeletons; hundreds_chart_fill, place_value_disks and classify_count behave the same way.
  - The passed vocab_grade_pictures draws 236 one-off skeletons, so it anchors almost nothing.
  - This is not a safety hole, but copy-light, whose purpose is speed, cannot work for these families.
  - **Check:** DRAWING-STABLE. For each live skill and each offered option value, the keys over 24 seeds must number 4 or
    fewer. Add a same-drawing sibling fixture: count_by_2s and count_by_3s, and add_int and add_negative, must share their
    drawing set.
- **E4 (B C3): ws-drawing-key cannot fail on a key that is too coarse or too fine, and its corpus leaves out the options.**
  - The check fails when "the skeleton changes but the key does not", and the key is the skeleton's hash. At the pass state it
    compares the skeleton with itself, so it can only catch a regression back to a hand-kept list. That is what
    `drawing-key-complete` proves, and it is worth keeping.
  - It cannot find E1, E2 or E3. Its corpus is 4 seeds at the defaults only, so option-driven fields (numerals, support:bar,
    notation) never enter it.
  - The status line "every skeleton change changes the drawing key" is true, but it reads as a completeness proof (C4).
  - **Check:** build the corpus from the defaults plus every offered option value (offeredOptionsFor variants). Judge the key
    against something independent of it: the known-pairs fixture (E2) and DRAWING-STABLE (E3). Add a backtest row whose pass
    state is green only when both hold.
- **more_less_10 / more_less_100 losing eligibility is RIGHT.** Their drawings are pv kind=frame and pv-support
  hchart / strip / line, and no passed skill draws any of them. r1's pv-template BATCH OK was the hole. more_less_100's
  drawings are a subset of more_less_10's, so it becomes eligible once more_less_10 passes, as it should.

## Scores
- **A C1 8:** NP-PUPIL and the re-pointed rows give correct verdicts. **C2 8:** the 6-line pupil window is a heuristic. The one
  known gap (simple-print `[390, false]`) is noted and routed. **C3 9:** every row and self-test is green and none is weakened.
  **C4 8:** the notes are clear and the label is fixed.
- **B C1 6:** E1 and E2. Never-passed drawings (a quarters face, a compare bar, ÷ facts) share a key with passed ones. This is
  the third round of the drawing-identity class. **C2 6:** E3. **C3 7:** E4, a tautological completeness check, and a glyph
  self-test that misses × and ÷. **C4 7:** E4's overstated claim. The more_less note is correct.

**Round cap (FASTEST_PLAN item 4):** the drawing-identity class has now failed three rounds: r1 B1 (the template id), r2 D1 (a
hand list) and r3 E1-E3 (a skeleton both too coarse and too fine). This round ran after the cap. Stop the loop and take it to
the lead. The skeleton hash replaced the hand list with a heuristic that nobody checks against what a reader sees. Recommended
direction:
1. Each cell module exports its own `drawingKey(payload)`, so the template author declares the drawing.
2. A lint fails on any `p.<field>` the module reads that is declared neither drawing nor content.
3. The E2 known-pairs fixture and E3's DRAWING-STABLE run as the independent proof, over a corpus that includes the option
   values.
