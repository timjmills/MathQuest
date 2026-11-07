Lane: lf-algebra
Title: Lessons-first wave 1: the patterns and algebra skills of the CCSS BUILD lessons
Session: session_013pHDnKpNaW4JzSJ8QNo1H7
Branch: claude/sweet-newton-c8wrv1-lf-algebra
Owner of files: gen-algebraic.js, gen-function-table.js, gen-patterns-notice.js (new), sheet/cells/{function-table,growing-pattern}.js, sheet/providers/{function-table,patterns}.js, design/cards/{function-table,patterns}/
State: building
Updated: 2026-11-07 (fix r3)
Builder profile: mq-opus-medium
Critic rounds: 0, none

## Now
- Re-aimed by the owner (2026-11-07, decision 1): only the 64 CCSS BUILD lessons, in the order of
  `data/curriculum/ccss-build-lessons.json`. This lane's lessons, in order: #3 Patterns on the multiplication table
  (3.OA.D.9; lf-ops owns the multiplication-chart drawing), #5 Find the rule in an input-output table (3.OA.D.9),
  #19 Find emergent features (4.OA.C.5), #20 Follow a given rule to extend a number pattern (4.OA.C.5), #21 Extend growing
  shape patterns (4.OA.C.5); then the later BUILD lessons in teach-week order (#7 two-step, #25/#26 expressions, #30/#31 …).
- Skills these lessons need: `patterns:notice_patterns` (new, build entry patterns_notice: #3, #19),
  `algebra:function_table_easy` (#5), `patterns:number_patterns_rule` (#19, #20, #21; files are lf-ops': asked),
  `patterns:growing_shape_patterns` (new, links proposal: #21).
- The brief's G3 lesson-7 two-step scope (two_step_*, multi_step_word) moves after these, by teach week.

## Owner go

## Open questions
- function-table card (design/cards/function-table/function-table.md, unsigned; 35 PROPOSED decisions, accepted by signing):
  1. Write the rule IN the machine box at S/M, under the table at L? Suggested: yes (one rule place).
  2. x 6 on a 3-row table at band 20 for lesson #5? Suggested: yes (rows are table facts; ftFactors restricts).
  3. Check rows and 5-row tables count as "adds a drawing" (capacity)? Suggested: yes.
  4. Two-step rules stay offered on easy, off by default? Suggested: yes.
- patterns card (design/cards/patterns/patterns.md, unsigned; 15 PROPOSED decisions, accepted by signing):
  1. "True or false about a times-table" (patTask truefalse) its own preset skill too? Suggested: no for now (same 3.OA.D.9
     lesson as parity); a preset only if a lesson page deals it alone.
  2. Parity items: print the product (6 x 7 = 42, "is 42 even or odd?") or keep it hidden (decide from the factors)?
     Suggested: hidden (with the product printed it is 2.OA.C.3, not 3.OA.D.9's "explain why").
  3. Growing patterns on screen: a 7 x 7 tap grid as the "draw Term 4" working space (never graded)? Suggested: yes; the
     graded answer is the number on paper and screen.
  4. WRM tags notice_patterns -> Y4.B4.S6 (partial), pattern_features -> Y5.B12.S9 (partial), growing_shape_patterns ->
     Y6.B7.S1 (partial); the build list's Y3.B3.S13 / Y4.B4.S15 were wrong. Suggested: accept.
  5. The fading hint (patShow) on by default for both skills? Suggested: on (teacher turns it off for the next page).
  6. Word answers in card rulings: extend ws-card-rulings with a payload reader so notice rulings are machine-checked?
     Suggested: yes (this lane does it).
- number_patterns_rule (goes on the patterns card): preset skill "Follow a given rule" = rule:false (lesson #20)? Suggested: yes.

## Times
Times: fix r3, start 2026-11-07T11:00Z, end 2026-11-07T12:11Z, profile mq-opus-medium
Times: fix r2, start 2026-11-07T08:36Z, end 2026-11-07T10:44Z, profile mq-opus-medium
Times: builder r1 notice_patterns + growing_shape_patterns (new), start 2026-11-07T06:53Z, end 2026-11-07T08:31Z, profile mq-opus-medium
Times: builder r1 function_table_easy + number_patterns_rule (fix), start 2026-11-07T07:16Z, end 2026-11-07T08:27Z, profile mq-opus-medium

## Baseline precritic (head 9398c3a, --skill function_table_easy,number_patterns_rule --strict): 6 FAIL
- print-lint lesson L/S: function_table_easy L-TOPSTART CL-4b, L-ANSAREA SL-6, L-DENSITY DN-2; number_patterns_rule L-OVERFLOW PG-12 (x8)
- grade-render gate: 60 overflow (number_patterns_rule lesson-S count-row train leaves its cell) + 8 small screen targets
- sibling-compare: function_table_easy DN-2 / PAGEFILL / PG-23 at S/M/L, no approved sibling
- node-lint LESSON-DATA: no prereqs.js lesson data for either skill
- options-verify --render: 22 values worse than default (ftTask values / ftTable 51-52 lose capacity, H13; ftTask=rule L CL40-INK)
- card-rulings SKIPPED / spec-card N/A: no card yet

## Precritic r2 (head after 4f887f28, 6 skills incl. the preset follow_given_rule, --strict; logs /tmp/mq-precritic/20261107-095337-25319)
| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill | 6 skills | PASS | 2 of 6 skills checked; not covered: patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns, patterns:follow_given_rule | 0 |
| ws-content-audit --skill | 6 skills | PASS | 2 skill(s) audited (4 of the 6 in scope are outside the audited families) | 8 |
| ws-options-verify --skill | 6 skills | PASS (baseline) | 189 value(s) checked; 6 failing, 6 pinned, 0 new | 111 |
| ws-presets-unit | 5 preset / host skill(s) | PASS | - | 111 (104 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 25 |
| ws-coverage-matrix --skills | 6 skills × kinds × S/M/L | PASS | 46 of 200 row(s) run × S/M/L: OK 46, RED 0, ERROR 0; PENDING 118, N/A 36 | 1696 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s)) | 83 (51 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 98 (62 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 100 (66 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 39 found in 5 of 6 doc(s); 10 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: algebra:function_table_easy, patterns:number_patterns_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns, patterns:follow_given_rule (must be clean) | 97 (51 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 41 found in 5 of 6 doc(s); 13 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: algebra:function_table_easy, patterns:number_patterns_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns, patterns:follow_given_rule (must be clean) | 109 (61 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 6 skills × lesson, test, independent × S/M/L + screen hosts | FAIL | ws-grade-render: FAIL - 102 finding(s) (102 overflow, 0 small target) in 6 unit(s) | 500 (54 waiting) |
| ws-screen-slots --skills | 6 skills | PASS | 0 found, 0 pinned, 0 new (30 host renders, --baseline design/audit/baselines/screen-slots.json) | 101 (75 waiting) |
| ws-screen-answer --skills | 6 skills | PASS | - | 181 (112 waiting) |
| ws-chromebook-fit --skills | 6 skills | PASS | - | 377 (108 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 3 |
| ws-boot-smoke | app boot | PASS | - | 67 (63 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 6 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 114 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 34 printed row(s) with findings (PENDING(no-baseline) 34; siblings per skill: function_table_easy: 0, number_patterns_rule: 0, notice_patterns: 0, pattern_features: 0, growing_shape_patterns: 0, follow_given_rule: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 6 skills × matrix rows × S/M/L + extras at S | PASS | 80 matrix row(s) × S/M/L + 12 extra document(s) (test, more-practice, supports on): 252 document(s), SLOT 0 / CLIP 0 finding(s), 7394 box segment(s) and 0 head(s) probed (SLOT-W N/A on 52, HEADS N/A on 252 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 1298 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 6 skills × 390x844, 390x664 | PASS | - | 271 (106 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 6 skills | PASS | - | 4 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 6 skills | PASS | - | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 6 skills | PASS | - | 2 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 6 skills | PASS | 6 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.2 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 6 skills | INCOMPLETE (unsigned card) | needs owner signature: design/cards/function-table/function-table.md, design/cards/patterns/patterns.md (everything else green) | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 6 skills × S/L | FAIL | 13 value page(s) worse than the default: function_table_easy ftTask="make" @S, number_patterns_rule shape="circle" @S, number_patterns_rule shape="hex" @S, number_patterns_rule shape="mixed" @S, follow_given_rule missing | 746 (78 waiting) |

ws-precritic: FAIL: 5 FAIL, 22 PASS (1 on the baseline), 0 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 28 (FAIL: print-lint-lesson-L, print-lint-lesson-S, render-gate, sibling-compare, options-render; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): spec-card-signed)

Remaining non-green rows, cause by cause:
- print-lint lesson L/S + grade-render --gate: (a) number_patterns_rule / follow_given_rule anchor chart overflows 6.5-13 mm
  (and the L-INK / L-OVERLAP SECTION findings are the same overflow running under the Say band): CAUSED BY the cherry-picked
  lf-ops count-row 3d8bca1b - the 'train' row now wraps (8 tiles -> 4 + 4) in the chart panel because the panel's ctx carries
  columns > 1 although the panel is full width (184.9 mm). Before the cherry-pick the same lesson pages were clean at S/M/L
  (render 2026-11-07 ~09:00, scratch rl2). Request to lf-ops (or lf-engine: the anchor ctx's columns). (b) Our pagination
  rows: pattern_features / growing L: Guided Practice (two full-width chartWide rows + the strip, ~122 mm) misses page 2 by a
  few mm after the L Vocabulary + Warm-up (DN-2); S: pattern_features one Independent cell alone on page 3 (LONE / DN-2);
  notice / growing / pattern_features practice page PAGEFILL 27-42 %. Two attempts made (cell geometry, warm-ups, short
  steps); root cause: lesson.js packs chartWide Guided as >= 2 full-width rows (guidedRows min 2) and Independent rows by
  whole rows; asking lf-engine for `guidedRows: 1` or a 2-across Guided for chartWide skills.
- sibling-compare: 114 NO-SIBLING counts (no approved sibling on any of these templates; L-DENSITY PAGEFILL 24, H13 21,
  DN-2 21, PG-23 19, SPREAD 11, GRID-EVEN 8, LONE 6, CL40-INK 3) across sections / mixed / pages-N matrix rows; 34 more are
  partner-skill counts (reported non-blocking by the tool). Not brought to 0 this round.
- options-render: number_patterns_rule / follow_given_rule shape=circle|hex|mixed capacity (S 5 vs 8, L 7 vs 8): lf-ops'
  shaped-tile capacity, still red after the cherry-pick; follow_given_rule missing=50|80|90 H13 (count-row, lf-ops);
  function_table_easy ftTask=make S: REPEAT (two make tables with the same rule look identical - no numbers printed) - ours,
  open.
- spec-card INCOMPLETE: both cards unsigned by design (owner answers recorded; cards ready to sign).

## Precritic r3 (head 8cb67599; ab38364f after it, 6 skills, --strict; logs /tmp/mq-precritic/20261107-112151-19552)
| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill | 6 skills | PASS | 2 of 6 skills checked; not covered: patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns | 0 |
| ws-content-audit --skill | 6 skills | PASS | 2 skill(s) audited (4 of the 6 in scope are outside the audited families) | 7 |
| ws-options-verify --skill | 6 skills | PASS (baseline) | 189 value(s) checked; 6 failing, 6 pinned, 0 new | 97 |
| ws-presets-unit | 5 preset / host skill(s) | PASS | - | 96 (89 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 23 |
| ws-coverage-matrix --skills | 6 skills × kinds × S/M/L | PASS | 50 of 200 row(s) run × S/M/L: OK 50, RED 0, ERROR 0; PENDING 114, N/A 36 | 1677 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s)) | 54 (22 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 77 (45 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 63 (31 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 7 found in 4 of 6 doc(s); 4 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: algebra:function_table_easy, patterns:number_patterns_rule, patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns (must be clean) | 79 (35 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 9 found in 4 of 6 doc(s); 7 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: algebra:function_table_easy, patterns:number_patterns_rule, patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns (must be clean) | 89 (45 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 6 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 483 (44 waiting) |
| ws-screen-slots --skills | 6 skills | PASS | 0 found, 0 pinned, 0 new (30 host renders, --baseline design/audit/baselines/screen-slots.json) | 96 (71 waiting) |
| ws-screen-answer --skills | 6 skills | PASS | - | 149 (85 waiting) |
| ws-chromebook-fit --skills | 6 skills | PASS | - | 375 (111 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 74 (70 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 6 skills: matrix rows with findings | SKIPPED (first family on template; critic grades the named pages) | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 105 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 30 printed row(s) with findings (PENDING(no-baseline) 30; siblings per skill: function_table_easy: 0, number_patterns_rule: 0, follow_given_rule: 0, notice_patterns: 0, pattern_features: 0, growing_shape_patterns: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 6 skills × matrix rows × S/M/L + extras at S | PASS | 80 matrix row(s) × S/M/L + 12 extra document(s) (test, more-practice, supports on): 252 document(s), SLOT 0 / CLIP 0 finding(s), 7257 box segment(s) and 0 head(s) probed (SLOT-W N/A on 52, HEADS N/A on 252 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 1271 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 6 skills × 390x844, 390x664 | FAIL (transient; PASS on rerun) | ws-phone-card: FAIL - 14 finding(s) (PAGE-ERROR 14) (6 skill(s) × 2 size(s) × 3 item(s): 36 of 36 renders measured; A14 siblings clean (4 approved skill(s) × 2  | 247 (93 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 6 skills | PASS | - | 4 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 6 skills | PASS | - | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 6 skills | PASS | - | 1 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 6 skills | PASS | 6 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.7 s | 2 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 6 skills | PASS | 2 card(s) signed and green: design/cards/function-table/function-table.md (also -1 other problem(s)), design/cards/patterns/patterns.md (also -1 other problem(s)) | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 6 skills × S/L | FAIL | 13 value page(s) worse than the default: function_table_easy ftTask="make" @S, number_patterns_rule pattern="add" @S, number_patterns_rule pattern="sub" @S, number_patterns_rule pattern="grow" @S, number_patterns_rule sh | 762 (105 waiting) |

ws-precritic: FAIL: 5 FAIL, 23 PASS (1 on the baseline) of 28 (print-lint-lesson-L, print-lint-lesson-S, sibling-compare,
phone-card, options-render). Settled after the run:
- phone-card: 14 PAGE-ERROR (requestfailed / ERR_ABORTED module loads under load, function_table_easy item 3); rerun
  `ws-phone-card --skills algebra:function_table_easy`: OK (6 of 6 renders, A14 siblings clean). Transient.
- options-render: function_table_easy ftTask="make" @S (capacity 9 vs 12; both columns are writing places) declared in
  addsDrawingValues (ab38364f); rerun `ws-options-verify --render --skill algebra:function_table_easy`: OK (54 value pages).
  REPEAT on make: gone (no REPEAT in the r3 run).
- sibling-compare: SKIPPED by the lead's "first family on a template" ruling (105 NO-SIBLING counts; 0 above a sibling,
  0 ERROR). The documents the critic grades by eye (matrix row: sizes):
  - algebra:function_table_easy|sections/defaults: S
  - algebra:function_table_easy|sections/ex-each: L
  - algebra:function_table_easy|sections/pages-2: L M S
  - algebra:function_table_easy|single/ex-each: L M S
  - algebra:function_table_easy|single/ex-group: L M
  - patterns:follow_given_rule|mixed/defaults: M S
  - patterns:follow_given_rule|sections/defaults: L
  - patterns:follow_given_rule|sections/ex-each: L
  - patterns:follow_given_rule|sections/pages-2: L M S
  - patterns:follow_given_rule|single/ex-group: L M S
  - patterns:follow_given_rule|single/layout-todays-number: L M S
  - patterns:growing_shape_patterns|mixed/defaults: M
  - patterns:growing_shape_patterns|sections/pages-2: L M S
  - patterns:notice_patterns|mixed/defaults: M
  - patterns:notice_patterns|sections/ex-each: L S
  - patterns:notice_patterns|sections/pages-2: L M S
  - patterns:notice_patterns|single/ex-each: L M S
  - patterns:number_patterns_rule|mixed/defaults: M S
  - patterns:number_patterns_rule|sections/defaults: L
  - patterns:number_patterns_rule|sections/ex-each: L
  - patterns:number_patterns_rule|sections/pages-2: L M S
  - patterns:number_patterns_rule|single/ex-group: S
  - patterns:number_patterns_rule|single/layout-todays-number: S
  - patterns:number_patterns_rule|single/pages-3: L
  - patterns:pattern_features|mixed/defaults: M
  - patterns:pattern_features|sections/pages-2: L M S
  - patterns:pattern_features|single/ex-each: M
  - patterns:pattern_features|single/pages-3: M

Remaining non-green rows and owners:
- print-lint lesson S / L (not overflow any more; grade-render --gate PASS, 102 -> 0 overflow):
  - follow_given_rule lesson p3,6 H13 "pinned to one side" x2 (the count-row train row left-aligned in a 185 mm practice
    cell, 59 mm band) + PAGEFILL p3 at S: count-row alignment, lf-ops (was in r2 too).
  - notice_patterns PAGEFILL p3 (S 33 %, L none), pattern_features S DN-2 / LONE / PAGEFILL p3 (one Independent cell alone)
    and L DN-2 p2,7, growing_shape_patterns S PAGEFILL p3 and L DN-2 p2,7: lesson.js chartWide Guided / Independent
    packing, lf-engine (as r2; request `guidedRows: 1` or a 2-across Guided for chartWide skills).
- options-render number_patterns_rule / follow_given_rule shape=circle|hex|mixed (S 9 vs 10, L 7 vs 8): lf-ops shaped-tile
  capacity (as r2). number_patterns_rule pattern=add|sub|grow @S (8 vs 9): new, a side effect of the authorised wrap-hunk
  revert - the DEFAULT page went 8 -> 9 items (count-row cells 16 -> 18 over 2 pages), the value pages stayed at 8
  (measured with and without the revert): lf-ops count-row, pending.
- reason-it (not on precritic's plan; ws-print-lint --roles reason-it): number_patterns_rule S/M/L 8 / 12 / 8,
  follow_given_rule 6 / 10 / 8 (PG-12 overflow 30-37 mm + CL40-INK in the narrow panels), back after the wrap-hunk
  revert: lf-ops count-row, pending.
- Open, ours (not on precritic's plan, found this round):
  - notice_patterns error-analysis S x12 / L x8 H13 (31 mm band in a 70 mm cell at S): the EA role grows a short page's rows
    up to 1.4 x (roles/error-analysis.js rowHeights) and the parity cell (39 mm) has no part that fills the cell, and its
    judge gets no mode (no mq-jbelow); passed skills (sub_2d_1d, add_wp_10, sub_100_no_regroup, add_facts) are clean on EA.
    Needs a judge mode / in-column judgement for the notice cell or an EA row rule (lf-engine); not attempted this round.
  - notice_patterns single/ex-each H13 (twin row 75 mm over a 45 mm parity problem, 41 %): the side twin's tab + Say line
    (~20 mm) over a short problem; shortened steps took it from 68 to 30.5 mm. Part of the SKIPPED list (critic grades).
  - function_table_easy single/ex-group L CL40-INK x2: the "In" of the band anchor's first state at 11.8 mm across under the
    Model tab's 14.6 mm keep-out - the band's state column (anchors.js) starts under the tab; the passed addition:add_facts
    shows the same CL40-INK x2 on sections/ex-group L (partner count, r2 sibling-compare). Engine (anchors band), not ours.

## Log
- 2026-11-07 fix r3 (Opus medium; machine checks only, after r2). Lead rulings this round: both cards signed (800dad86);
  sibling-compare NO-SIBLING rows are SKIPPED, "first family on template; critic grades the named pages" (LESSONS_LEARNED,
  first family on a template), only real layout defects of our cells fixed. Done:
  - CL40-INK (function_table_easy, single/ex-each L 4, sections/ex-group L 2): the machine's "In" stood 6.1 mm across, 5 mm
    down in the 7 mm keep-out of a side pair's narrow cell. The drawing now starts below the keep-out under a number tab
    (padding-top max(0, --ws-ko - 4.5 mm), footprint + 2.5 mm). A first try (left inset + 4 mm width) pushed the input-output
    lesson's P2 model steps past their cell (ws-detailed-lesson E40) and was replaced. ex-each L: CL40 0.
  - REPEAT (options-render, function_table_easy ftTask=make @S): the make table's rule is dealt fresh on the page
    (page-deal.js freshDeal, sig = the rule, window 11): 5 seeds x 8 items, 8 distinct rules each.
  - growing_shape_patterns S dots 1.6 mm: unit u never under the standard's smallest unit square (11.2, base-10 u 2.5 mm at
    S): UNIT S 2.0 -> 2.5, M 2.4 -> 2.5 (dots 2.0 mm), L 2.6; S fits fewer, never shrinks. Lesson / independent / test /
    error-analysis at S/M/L: no new finding (lesson S PAGEFILL p3 and L DN-2 p2,7 as in r2). Note: the signed card's
    sizes line still says u 2.0 / 2.8 / 3.3 and dots 0.72 u; the code has 2.5 / 2.5 / 2.6 and 0.8 u (card not changed, brief).
  - notice parity worked steps: one short line a step (a long step 3 wrapped and made the side pair row 113 mm over a 45 mm
    problem). ex-each L H13 band 68 -> 30.5 mm (still 41 %: see the open list).
  - count-row: "revert 3d8bca1 wrap hunk (lf-ops authorised, interim)" (2cfeb1d7): geom fitN, the narrow rule-line wrap and
    the footprint's wrapped rows reverted; >= 44 px screen tile, shaped-tile pitch, one-page CL-40 kept. Rows changed:
    number_patterns_rule lesson S / L 16 / 16 -> 0 (M 0; PG-12 x8, ILLEGIBLE x6, SECTION x2 gone: the anchor-chart overflow);
    follow_given_rule lesson S / L 19 / 18 -> 3 / 2 (M 3; left: H13 pinned-to-one-side x2 on p3,6 + PAGEFILL p3 at S/M, no overflow); reason-it number_patterns_rule
    S/M/L 0 -> 8 / 12 / 8 and follow_given_rule 0 -> 6 / 10 / 8 (PG-12 overflow 30-37 mm, CL40-INK): lf-ops count-row,
    pending.
- Evidence "engine / partner, not ours" (same document, a passed skill in our place, ws-print-lint --source kit):
  - sections/pages-2 (DN-2, PAGEFILL, PG-23, SPREAD, H13 on page 1, LONE): addition:add_100_regroup in notice_patterns'
    place at S prints the same split - page 1 holds ONE stretched row (5 stacks, 230 mm cell, H13 x10), DN-2 2, PAGEFILL 2,
    SPREAD 2; at M H13 x8, DN-2 2, PAGEFILL 2, SPREAD 2. The section engine deals a pages-2 section one row a page; our
    1-across cells (pattern_features, number_patterns_rule, follow_given_rule, growing at M) make that row ONE cell, hence
    LONE. Engine (sections pages-N count), not ours.
  - single/ex-each and sections/ex-each GRID-EVEN: the side pair is [wide twin | problem] by design (anchors.js side,
    print-sheet measureSide2); addition:add_100_regroup (50 / 134.7 mm), add_facts (35 / 57.1), sub_100_no_regroup
    (37 / 55.1), add_wp_10 (88 / 96.7) all show GRID-EVEN x2 at L. Engine, not ours.
  - sections/ex-each GRID-EVEN / WRAP-OP and sections/ex-group CL40-INK on addition:add_facts / area_perimeter:perimeter_intro
    cells: partner (ws-sibling-compare bySkill).
- 2026-11-07 fix r2 (Opus medium; precritic red after r1, machine checks only). Done:
  - Lesson anchor overflow (108 overflow): `stepState` on `notice` (sentence task drawn at S, tight rows) and `growing-pattern`
    (four terms in ONE row at S, Term 4 grey on its step, black after); chartRow on growing / features (words beside the
    drawing); feature cell puts rule + track on one line; growing geometry u 2.0 / 2.4 / 2.6 mm, pad 0.4 u; short lesson
    steps; warm-ups on kit cells (shape_pattern legacy cell gone, BD-12); odd_even warm-up at range 10. grade-render --gate
    lesson pages: no overflow on our skills.
  - options-render: addsDrawingValues on notice patTask feature / truefalse, growing patTask rule / far (each adds a drawn
    part or an answer line), function_table_easy ftTask rule (the rule's write frame); ftTask make: the range is now the In
    column's head ("In: 1–10"), the note line is gone.
  - ws-dealer-uniform: DECLARED valid set (q.dealSet, non-enumerable; growing_shape_patterns declares its (start, step)
    pairs); generator draws the pair uniformly and fresh on the page (freshDeal; a window of half the set when it is small,
    never a forced cycle). Self-test 24 cases; backtest row dealer-declared-set (FAIL e59e2bf3, OK 6e4efe2b).
  - ws-card-rulings: `of: "payload.<path>"` and `{"is": [field, word|words]}` (marked block, self-test 28); rulings for
    notice / feature / number_patterns_rule / follow_given_rule; not-offered entries for function_table_easy and
    number_patterns_rule.
  - Owner answered both cards "all as suggested" (2026-11-07, via lead): answers recorded as ownerRulings, every decision
    decided (0 PROPOSED, 0 UNDECIDED), open questions empty; number_patterns_rule and the new preset are on the patterns
    card. Cards NOT signed. New preset patterns:follow_given_rule (number_patterns_rule rule off, lesson #20, code ZZ via the
    manifest + ws-integrate), tagged 4.OA.C.5 / M.EE.4.OA.5, Y5.B12.S9 partial, Y5 lesson followagivenrule direct,
    related / pre on the growing and features lessons, lesson data in prereqs.js.
  - codec-registry: our keys 4U / 4V / 4W pinned (only ours); msChoose FAIL is red on origin/claude/sweet-newton-c8wrv1 too
    (pre-existing, not ours).
  - lf-ops count-row commit 3d8bca1b cherry-picked (4e4af534).
- 2026-11-07: owner approved both cards in the lead session, "All as suggested" (F1-F4, P1-P7 and all 50 PROPOSED
  decisions). The r2 fixer records them on the cards, adds the P7 preset "Follow a given rule" and every ruling; then the lead signs.
- 2026-11-07: r1 build merged (e59e2bf3). New: patterns:notice_patterns (patTask parity / feature / truefalse, band, patShow),
  preset patterns:pattern_features (patTask feature, lesson #19), patterns:growing_shape_patterns (patTask next / rule / far,
  growShape, band); files gen-patterns-notice.js, cells/notice.js, cells/growing-pattern.js, providers/patterns.js; card
  design/cards/patterns (unsigned); manifest design/lanes/lf-algebra/manifest.json (ws-integrate applied); share codes ZW ZX ZY
  (lead: check against other lanes). build-list patterns_notice deleted as built, new entry addition_table_patterns (3.OA.D.9
  addition-table clause); standards-audit 4.OA.C.5 -> full. Links edits: Y4 lesson G3|-|patternsonthemultiplicationtable
  (direct += notice_patterns parity, verdict direct, pre += composing:odd_even), Y4 step Y4.B4.S6 (partial += notice_patterns),
  Y4 proposals.patterns_notice deleted; Y5 lessons G4|-|findemergentfeaturesegunitsdigitcycle (direct += pattern_features) and
  G4|-|extendgrowingshapepatterns (direct += growing_shape_patterns), step Y5.B12.S9 (partial += pattern_features), Y5 proposals
  patterns_notice / growing_shape_patterns deleted. Proposal: Y6.B7.S1 should list growing_shape_patterns as partial (Y6.json not
  edited). r1 precritic still red: lesson anchor overflow (new cells taller than the ~50 mm anchor), dealer-uniform (growing read
  as op '?'), sibling-compare (new templates), options-verify --render (task values), card-rulings INCOMPLETE (word answers).
- 2026-11-07: lf-ops accepted count-row requests 1-3 (train wraps to cell, shaped tiles at box pitch, >= 44 px screen boxes);
  they land on claude/sweet-newton-c8wrv1-lf-ops, lf-ops sends the commit.
- 2026-11-07: composing:number_word_form (BUILD lesson #1) handed to lf-placevalue (session_013pHDnMCXcY6kXV15KHf4Yp): they own only
  its blocks in gen-algebraic.js (the WHICH WAY ROUND comment ~l.45-60 and the number_word_form branch ~l.2469); their precritic r0
  findings (LESSON-DATA, lesson S H13/PAGEFILL, answerSlot=hto weight 900, to_words capacity) are theirs to fix.
- 2026-11-07 r1 build (Opus medium, first redesign on uncertified pairs): function_table_easy + number_patterns_rule.
  function-table: find-the-rule frame IN the machine box (S/M), short machine arrows (CL40 at L), note tightened, top-aligned
  root (L-TOPSTART), >= 1.25 em screen boxes (44 px), provider steps 4 (lesson chart), "+ -6" step fixed, title from ftTask;
  skill-options addsDrawingValues (Check rows, 5-row tables); gen q.a / q.b for the card rulings. Lesson data for both
  skills (prereqs.js, lf-algebra block; number_patterns_rule chartWide). number_patterns_rule: find-the-rule worked steps
  no longer state the rule first; Max Number obeyed on x 10 rows; a three-term row keeps one number to write.
  Card design/cards/function-table (unsigned, 4 open questions). ws-card-rulings reads list-answer items (listAns).
  Asked lf-ops (count-row.js): train wraps to its cell; shaped tiles at box pitch; >= 44 px screen boxes.
- 2026-11-07: lf-ops agreed (session_013pHDnQ7sfFBg45rrEDgLdJ): lf-algebra owns ONLY genNumberPatterns + its dispatch line in
  gen-mult-patterns.js and the registerSkill('patterns:number_patterns_rule') block in providers/countby.js; count-row.js stays
  lf-ops' (ask for changes, its 'train' look is number_patterns_rule's track); read-only use of the mult-grid payload is fine.
- 2026-11-07: lane started; branch from origin/claude/sweet-newton-c8wrv1 @ 9398c3a; re-aim recorded; asked lf-ops about
  number_patterns_rule file ownership (gen-mult-patterns.js, providers/countby.js, cells/count-row.js).
