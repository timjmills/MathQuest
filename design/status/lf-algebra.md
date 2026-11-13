Lane: lf-algebra
Title: Lessons-first wave 1: the patterns and algebra skills of the CCSS BUILD lessons
Session: session_013pHDnKpNaW4JzSJ8QNo1H7
Branch: claude/sweet-newton-c8wrv1-lf-algebra
Owner of files: gen-algebraic.js (not the number_word_form blocks: lf-placevalue), gen-function-table.js, gen-patterns-notice.js, sheet/cells/{function-table,notice,growing-pattern}.js, sheet/providers/{function-table,patterns}.js, genNumberPatterns + the number_patterns_rule provider block (released by lf-ops), design/cards/{function-table,patterns}/
State: fix r9 done (merged master 8a7c5d43 + lf-ops' count-row fix); critic r2 grades the clean rows only (Precritic r9)
Updated: 2026-11-13 r9 (merge master 8a7c5d43, drop 2cfeb1d7, cherry-pick 77187c6e8, precritic r9). Before: 2026-11-13 (fix r8 after critic r1: hints off on Test / quiz, chart states progress, steps follow the preset and the lesson, growing title)
Builder profile: mq-opus-medium
Critic rounds: 1 (r1 2026-11-13: all six FAIL; fix r8)

## Now
- 2026-11-13 fix r9 (mq-opus-low): merged origin/master 8a7c5d438 (74bff0abb); dropped the interim revert (af74c6b04 = git revert
  2cfeb1d7); cherry-picked lf-ops' 77187c6e8 onto master's reason-it (a2fecb0aa); count-row.js brought to -props' logic (b859e11a6:
  the restored columns-keyed train wrap overflowed the npr / fgr lesson chart); notice ringed-word room (a6b1e8151, EB-EDGE).
  Precritic r9 (below): every red is listed by owner; ours left: none fixed-able without a ruling (growing SIZE-WIDTH, see table).
- 2026-11-13 STOP (week-2 cap): session cost_usd $179.31 (week 2 = $66.10 of the $75 cap, ~3.3 %; week 1 hand-over $113.21).
  Critic r2 not run: about $9 left, and it would fail again on rows owned elsewhere (F2 count-row train -> lf-ops; F3 / F4 /
  PT-MOD-1 marksFor / F5 npr-fgr chart -> lf-roles; F8 options panel; EB-FOOT pairing -> lf-checks; rule-check stepsBy -> lf-engine).
  Resume: merge those fixes, precritic --strict, then critic r2 on all six.
- 2026-11-13 05:36Z lf-ops (via lead): count-row Reason It train fix 77187c6e8 on claude/sweet-newton-c8wrv1-lf-ops-props (wraps at
  real panel width, panels clear label keep-out, number-pattern slots from the band's widest number) replaces our interim revert
  2cfeb1d7: drop 2cfeb1d7 when -props lands on master, or cherry-pick 77187c6e8 on resume. F2 screen part (wrap, caption overprint,
  digit px) still open at lf-ops.
- 2026-11-13 fix r8 (after critic r1, all six FAIL): ours fixed - F1 hints off on Test / quiz, F5 function-table chart states,
  F6 / F6b steps follow the preset and the lesson, F7 growing title, pattern_features q.options, notice "40", screen grey,
  growing screen dots. Handed: F2 / slot width -> lf-ops; F3, F4, PT-MOD-1 (marksFor), F5 npr / fgr chart -> lf-roles; F8 ->
  the options-panel owner; EB-FOOT pairing -> lf-checks. Precritic r8 (below): 32 PASS, 13 FAIL, all red by owner.
- 2026-11-13 fix r7: function_table_easy lesson anchor chart fits its 2 x 2 panels on every option value but ftTask=rule-check
  (cell-checks lesson findings 354 -> 18; skill total 371 -> 35). Precritic r7 (below, function_table_easy only): 27 PASS, 3 FAIL
  (empty-band 39 and cell-checks 35, both the r6 role-owned rows plus rule-check; sibling-compare). rule-check panels 1 and 2 stay
  2.4 / 0.8 mm over: needs lf-engine (see "Red, by owner" under Precritic r7).
- 2026-11-13 fix r6 (patterns card signed bd6c6cc6 by the lead): KEYJOIN on the feature sentences cleared (the check slot is the
  box column, not the printed sentences); lesson anchor-chart overflows cleared on notice patTask=feature / band=25,
  pattern_features patTask=truefalse / band=50 and function_table_easy ftTask=rule. Precritic r6 (below): 27 PASS, 16 FAIL;
  notice_patterns cell-checks and render-gate OK, function_table_easy render-gate OK. Every red left but one class (function-table
  lesson charts on 8 other option values, ours) is owned elsewhere: see "Red, by owner" under Precritic r6.
- 2026-11-12 fix r5: merged origin/master d34311d5 (49096d74); lesson data moved to lessons/families/algebra.js with
  guidedRows: 1 on the 4 chartWide lessons; growing unit S 2.5 / M 2.8 / L 3.3 mm (37a7f4f5, patterns card UNSIGNED: the lead
  re-signs from 37a7f4f5); parity / true-false answers capitalised. Precritic r5 (below): 25 PASS, 17 FAIL; master brought
  new gates (ws-cell-checks --card-opts, ws-empty-band, render-gate on every card role) that are red on these skills.
- HAND-OVER 2026-11-07 ~12:50 UTC (week stop at 70 % ~15:30): paused at a clean point, no critic round run. Rule 0b blocks
  the critic: precritic is red on roles these skills print, and every remaining red but one belongs to lf-ops / lf-engine.
- Six skills built or fixed for BUILD lessons #3 #5 #19 #20 #21: algebra:function_table_easy, patterns:number_patterns_rule,
  patterns:follow_given_rule (preset, new), patterns:notice_patterns (new), patterns:pattern_features (preset, new),
  patterns:growing_shape_patterns (new). Cards: function-table SIGNED (800dad86d); patterns: re-sign pending (lead 2026-11-07: NOT re-signed.
  b0ca7395 moved the growing unit 2.0/2.8/3.3 -> 2.5/2.5/2.6 mm, so M and L got SMALLER and the sizes nearly match: a design
  change. Next round: S 2.5 mm, M and L kept at >= 2.8 / 3.3 mm; if they cannot stay, an owner question with a suggested answer).
- Next, in order: (1) growing unit S 2.5 / M >= 2.8 / L >= 3.3 mm in code and card.json, then the lead re-signs patterns; (2) take lf-ops' count-row fix for the wrap root cause (we hold an interim
  revert of 3d8bca1's wrap hunk, 2cfeb1d7) and lf-engine's `guidedRows: 1|2` key, then set guidedRows: 1 in our lesson data
  (after lf-engine merges, our 6 lesson-data entries move from lessons/prereqs.js to lessons/families/algebra.js); (3) ours:
  capitalise the parity answer (gen-patterns-notice.js:72 'even'/'odd' -> 'Even'/'Odd', then check the card rulings and the
  screen check: the Error-analysis fix choices show "odd" beside "Even"), notice reason-it L H13 x4 / CL40-INK x4 (owner
  unclear, not on precritic's plan); (4) clean precritic on the branch merged with the integration tip; (5) one family critic
  of the 6 skills (every page type S/M/L, keys, 3 screen hosts, option panel; the 28 first-family pages named in "Precritic r3").
- Remaining red, by owner: lf-ops count-row (follow_given_rule lesson p3 H13 one-sided track + PAGEFILL; shape=circle|hex|mixed
  capacity; number_patterns_rule pattern=add|sub|grow S 8 vs 9 after the revert; reason-it narrow-cell overflow back after the
  revert); lf-engine lesson.js chartWide packing (notice PAGEFILL p3; pattern_features DN-2 / LONE / PAGEFILL; growing PAGEFILL /
  DN-2); section engine (pages-2, ex-each GRID-EVEN: same with a passed skill in our place); sibling-compare SKIPPED by the lead's
  first-family rule.
- COST: session cost_usd $113.21 at hand-over (≈ 5.7 % at $20 = 1 %; this session's counter includes its sub-agents), cap $200.
  Builder r1 ≈ $50 + $55-60, fix r2 ≈ $40-45, r3 ≈ $25, r4 ≈ $10 (sub-agent estimates; overlap the session total).

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
Times: fix r9 (merge master, revert + cherry-pick lf-ops 77187c6e8, precritic r9, count-row + notice fixes), start 2026-11-13T05:40Z, end 2026-11-13T09:00Z, profile mq-opus-low
Times: fix r8 (critic r1 findings F1 F5 F6 F6b F7 + lead items + minors; precritic r8), start 2026-11-13T02:25Z, end 2026-11-13T04:55Z, profile mq-opus-medium (rebuild after a failed critic)
Times: fix r7 (function-table lesson chart states + precritic), start 2026-11-13T01:36Z, end 2026-11-13T02:20Z, profile mq-opus-low
Times: fix r6 (KEYJOIN + lesson chart overflows + empty-band triage + precritic), start 2026-11-12T23:30Z, end 2026-11-13T01:35Z, profile mq-opus-low
Times: fix r5 (merge master + growing sizes + precritic), start 2026-11-12T21:55Z, end 2026-11-12T23:40Z, profile mq-opus-medium
Times: fix r4, start 2026-11-07T12:13Z, end 2026-11-07T12:50Z, profile mq-opus-medium
Times: fix r3, start 2026-11-07T11:00Z, end 2026-11-07T12:11Z, profile mq-opus-medium
Times: fix r2, start 2026-11-07T08:36Z, end 2026-11-07T10:44Z, profile mq-opus-medium
Times: builder r1 notice_patterns + growing_shape_patterns (new), start 2026-11-07T06:53Z, end 2026-11-07T08:31Z, profile mq-opus-medium
Times: builder r1 function_table_easy + number_patterns_rule (fix), start 2026-11-07T07:16Z, end 2026-11-07T08:27Z, profile mq-opus-medium

## Critic r1 (2026-11-13, mq-opus-medium, independent; HEAD 47b1f2a86): all six skills FAIL
Copied from the verdict (PNGs: /tmp/claude-0/-home-user-MathQuest/ddf8a20a-aa76-5111-8f71-96dbc22bf54b/scratchpad/critic-r1/).

### Verdict

| Skill | Result | Fails |
|---|---|---|
| algebra:function_table_easy | **FAIL** | model S/L (2 half pages), lesson anchor (states do not show the step's mark), review L (spiral cell), screen OK |
| patterns:number_patterns_rule | **FAIL** | model L (Say band clipped), all three screen hosts (row wraps, caption overprinted by boxes, tiny quiz digits), lesson anchor |
| patterns:follow_given_rule | **FAIL** | the same screen-host defects as number_patterns_rule, lesson anchor |
| patterns:notice_patterns | **FAIL** | the parity hint on Test and Quiz gives the decision away; guided H13 |
| patterns:pattern_features | **FAIL** | guided page prints the PARITY steps; model L on 2 pages; hint on test |
| patterns:growing_shape_patterns | **FAIL** | model S/L on 2 half pages; Test/Review title "drawing and count" (H17); hint counts on test; option panel sample is blank |

No skill passes. Most defects are a few shared causes (F1 to F6 below), so one fix round could clear several skills at once.

### Score tables (C1 ease · C2 teaching · C3 spacing · C4 standard; the lowest across S/M/L unless a size is named)

Not graded (see the end): true-false, reason-it, error-analysis, pre-skill-check (KEYJOIN), stretch and word-problems (unsupported for
all six: "no open problem" / "no stories"), the lesson practice pages' chartWide packing (lesson p2+ PAGEFILL / DN-2), growing review L
overflow, sections pages-2, ftTask=rule-check lesson.

#### algebra:function_table_easy
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor (p1) | 8 | 7 | 8 | 8 | F5: states 2 and 3 say "Write 1" / "Write 6" but their Out boxes stay empty; only state 4 is filled |
| Scripted model | 8 | 8 | **6** | 8 | F4: 4 states over 2 pages at S and L; p2 is half empty (S/algebra__function_table_easy/scripted-model-p1,p2.png; L same) |
| Guided | 8 | 8 | 7 | 8 | L: 2 pages, p1 holds the model + 1 item and is ~20 % empty (L/.../guided-p1.png) |
| Independent | 9 | 8 | 8 | 9 | S 12 / M 6 / L 6 tables; key correct; cells ~28 % empty at the bottom at L (just under H13) |
| More practice | 9 | 8 | 8 | 9 | |
| Review | **6** | 8 | 7 | 8 | L: the spiral's "Make both sides equal" cells have a 1 mm "Answer: _" stub under a grey box (H16) (L/.../review-p1.png) |
| Test + key | 9 | 9 | 8 | 9 | worked column correctly gone; key checked item by item (8 − 8 = 0, 9 − 9 = 0 right) |
| Mixed practice | 8 | 8 | 7 | 8 | L: 4 tables, ~20 % page empty |
| Practice card / worksheet / quiz | 8 | 8 | 8 | 8 | (screen-*/ renders; table + boxes, digits readable) |
| Option panel | 8 | 8 | 7 | 8 | Task select truncates "write each O…"; sample table tiny |

#### patterns:number_patterns_rule
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor | 8 | 7 | 8 | 8 | F5: states 1 to 3 are the same picture; "Write 4" / "Write 15" never shown |
| Scripted model | **4** | 8 | 6 | 7 | F3: at L the Say band is clipped by the frame, its text cut in half (L/patterns__number_patterns_rule/scripted-model-p1.png, crop-npr-L-say.png). S fits |
| Guided | 8 | 7 | 8 | 8 | F6b: guided steps ("Look at two numbers side by side…") differ from the lesson's four step names |
| Independent / more practice | 8 | 8 | 8 | 8 | slot width grows to 3 digits on rows that pass 100 (a small length clue) |
| Review | 8 | 8 | 8 | 8 | spiral "Half of 42" cell is another skill's legacy cell (note only) |
| Test + key | 8 | 8 | 8 | 8 | key correct |
| Mixed practice | 8 | 8 | 8 | 8 | |
| Practice card 1280 / 820 / 390 | 6 | 7 | **5** | 7 | F2: the 8-box train wraps (3 given + 1 box, then 4 boxes on a second row), "After each number, press Space." collides with the boxes |
| Online worksheet | **4** | 7 | **5** | 7 | F2: caption overprinted by the boxes in 4 of 6 cards (H2); digits ~14 px, below the 29 px floor (S/patterns__number_patterns_rule/worksheet-1280.png) |
| Quiz | **4** | 7 | **5** | 7 | F2: digits ~12 px in a 600 px box, caption overprinted (quiz-1280.png) |
| Option panel | 8 | 8 | 8 | 8 | |

#### patterns:follow_given_rule (preset)
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor | 8 | 7 | 8 | 8 | F5 (S/patterns__follow_given_rule/lesson-p1.png) |
| Scripted model | 8 | 8 | 8 | 8 | L fits, Say band whole |
| Guided / independent / more practice / review / test + key / mixed | 8 | 8 | 8 | 8 | test key checked (halve 8 → 1, 96 → 12) |
| Practice card / worksheet / quiz | **4** | 7 | **5** | 7 | F2, same as number_patterns_rule (screen-fg.png) |
| Option panel | 8 | 8 | 8 | 8 | |

#### patterns:notice_patterns
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor | 8 | 7 | 8 | 8 | models only an even × even fact (4 × 10); step 4 prints the product "40" though card P2 hides it |
| Scripted model | 9 | 8 | 7 | 8 | S: 4 states fill ~65 % of the page |
| Guided | 8 | 8 | **6** | 8 | S: guided cells ~45 % empty at the bottom (H13) (S/patterns__notice_patterns/guided-p1.png); steps differ from the lesson's |
| Independent / more practice | 9 | 8 | 8 | 9 | 15 / 15 / 8 a page; key correct |
| Review | 8 | 8 | 8 | 8 | |
| Test + key | 8 | **5** | 8 | 8 | F1: "even / odd" under each factor printed on the Test; the item reduces to "is there an 'even' word?" (S/…/test-p1.png, L/…/test-p1.png) |
| Mixed practice | 8 | 7 | 8 | 8 | |
| Practice card / worksheet | 8 | 7 | 8 | 7 | the hint words are BLACK on screen and grey on paper (paper ≠ screen); card says no "Tap one", worksheet does |
| Quiz | 8 | **5** | 8 | 7 | F1: the hint shows in the quiz |
| Option panel | 8 | 8 | 8 | 8 | |

#### patterns:pattern_features (preset)
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor | 8 | 7 | 8 | 8 | "Sentence 2: not true for every number" never names the counter-example; step 1 "Write the numbers" with the numbers printed |
| Scripted model | 8 | 7 | **6** | 8 | L: 2 pages, p1 ~35 % empty (L/patterns__pattern_features/scripted-model-p1.png) |
| Guided | 6 | **4** | **6** | 8 | F6: the Steps box is the PARITY routine ("Look at each number in the fact…") on a pattern page; cells ~45 % empty (S/…/guided-p1.png) |
| Independent / more practice | 8 | 8 | 8 | 8 | |
| Review | 8 | 8 | 8 | 8 | |
| Test + key | 8 | 7 | 8 | 8 | F1 (milder): the printed six numbers are the patShow hint and stay on the Test; key correct (checked all 8) |
| Practice card / quiz | 8 | 7 | 8 | 8 | |
| Online worksheet | 7 | 7 | 7 | 8 | the 6-number track wraps 3 + 3; sentences wrap to 3 lines |
| Option panel | 8 | 7 | 8 | 8 | "Numbers to: 100 (tables to 10 × 10)" names tables on a pattern page |

#### patterns:growing_shape_patterns
| Page / host | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| Lesson anchor | 8 | 8 | 8 | 8 | |
| Scripted model | 8 | 8 | **5** | 8 | F4: S and L on 2 pages, each ~45-55 % used (S/patterns__growing_shape_patterns/scripted-model-p1,p2.png) (H5) |
| Guided | 8 | 8 | 7 | 8 | L 2 pages of 1 × 2 |
| Independent / more practice | 8 | 8 | 7 | 8 | drawing ~45 % of a full-width row; 5 / 4 / 4 a page at S / M / L |
| Review S | 8 | 8 | 8 | **6** | F7: title "Review: drawing and count the next term…" (H17) |
| Test + key | 8 | 6 | 8 | **6** | F7 title (wraps to 2 lines at L); F1: Term 1-3 counts printed on the Test; key draws Term 4, correct |
| Practice card / quiz | 8 | 8 | 8 | 8 | 7 × 7 working grid (P3), unit grows S 2.5 / M 2.8 / L 3.3 mm (UNIT in growing-pattern.js:35; the S and L rasters agree) |
| Online worksheet | 7 | 8 | 7 | 8 | term dots ~6 px, hard to count |
| Option panel | **4** | 6 | 7 | 8 | the Sample question box is BLANK (panels/patterns-growing_shape_patterns.png) |

### Findings, each with the check that would have caught it

**F1. Fading hints print on Test and Quiz (notice, pattern_features, growing).** PT-TST-2 / P-SC-5 say "Hints on tests" is off by
default. The test role plans with `level: 0` (sheet/roles/test.js:246, 256), but the cells read only the generator's `p.show`
(`js/modules/sheet/cells/notice.js:65` `showOn`, `js/modules/sheet/cells/growing-pattern.js:158`, 196). `patShow` is declared as
"A hint that fades" (skill-options.js:3892, 3918). On parity the hint decides the item. PNG: S/patterns__notice_patterns/test-p1.png,
L/…/test-p1.png, S/screen-np.png (quiz). **Check:** new `ws-cell-checks HINT-ON-TEST`. For every option the panel groups as
`support` with a fading `help`, render Test (and quiz with hints off) and fail when the cell DOM still carries the hint part. A
backtest on this HEAD must fail.

**F2. The count-row train on screen: wrap, caption overprint, tiny digits (number_patterns_rule, follow_given_rule).** At 1280 the
8-slot train breaks into 4 + 4 rows, "After each number, press Space." is drawn under or through the second row, and the worksheet and
quiz digits are ~12-14 px (floor 29 px). Likely the interim revert of 3d8bca1's wrap hunk (2cfeb1d7) the status names. PNG:
S/patterns__number_patterns_rule/worksheet-1280.png, quiz-1280.png, S/patterns__follow_given_rule/worksheet-1280.png.
**Existing checks that missed it:** ws-screen-slots and ws-chromebook-fit (they measure slots and scroll, not text against box
overlap or digit px on the worksheet and quiz). **Check:** add a TEXT-OVERLAP probe (any text node's box intersecting a slot box in
the screen cell) and a digit-px floor per host (card 40/48/56, worksheet 29) to ws-screen-slots.

**F3. Say band clipped at L (number_patterns_rule scripted model).** The 4 states plus the Say band run 6 mm past the frame. The text
is cut in half. PNG: L/patterns__number_patterns_rule/scripted-model-p1.png. **Existing check that missed it:** ws-grade-render
`--gate` overflow (it reported no OVERFLOW for scripted-model L; precritic runs the gate on lesson, test and independent only, not on
scripted-model). **Check:** put scripted-model and guided at S/M/L on the render gate, and add a text-clip probe (scrollHeight >
clientHeight on the Say band).

**F4. Model pages split over two half-empty pages (function_table_easy S/L, growing S/L, pattern_features L).** 2 states a page with
a ~half-empty second page (H5). The model role stacks states full-width at one per row; a 2 × 2 like the anchor chart would fit.
PNG: S/algebra__function_table_easy/scripted-model-p2.png, S/patterns__growing_shape_patterns/scripted-model-p1,p2.png,
L/patterns__pattern_features/scripted-model-p1.png. **Check:** ws-print-lint PAGEFILL on `--roles scripted-model` (the precritic
plan lints the lesson and independent roles only).

**F5. The anchor chart's states never show the step they describe (number_patterns_rule, follow_given_rule, function_table_easy).**
"Write 10" sits under a picture with an empty box; the states only change at step 4, so 3 of 4 panels are the same picture. PNG:
S/patterns__number_patterns_rule/lesson-p1.png, S/patterns__follow_given_rule/lesson-p1.png,
S/algebra__function_table_easy/lesson-p1.png. (The scripted model of the same skills does progress: 39 is traced in state 3.)
**Check:** ws-detailed-lesson / cell-checks STATE-PROGRESS. A step whose sentence says "Write N" must have N in a slot of its state,
and two consecutive states must not be identical.

**F6. pattern_features guided page prints the parity steps.** `noticeStrings.def = NOTICE_STRINGS.parity.def`
(`js/modules/sheet/providers/patterns.js:99`): the page-level steps with no item fall to parity. This is the L28 class ("what the
pipeline reads with NO item must follow the options"). PNG: S/patterns__pattern_features/guided-p1.png. **Check:** ws-node-lint
STEPS-FOLLOW-PRESET. For each preset skill, call the provider's page-level strings with `{skillId, opts}` and no item, and compare
the steps to the item-level `stepsFor` task. **F6b (minor):** the guided steps of number_patterns_rule and notice_patterns use other
words than the lesson's four step names (L6). Check: guided `Steps:` text equals the routine's step names.

**F7. Growing Test / Review title "drawing and count the next term" (H17).** The role title gerundises only the first verb. PNG:
S/patterns__growing_shape_patterns/review-p1.png, L/…/test-p1.png. **Existing check that missed it:** VQ-TITLE (it checks for a
sentence, not grammar). **Check:** a VQ-TITLE rule for a role title made from an I Can with "X and Y": both verbs must take -ing.

**F8. Growing option panel: the sample question is blank.** PNG: panels/patterns-growing_shape_patterns.png. **Check:** add a
non-empty sample (cell DOM has ≥ 1 drawn part) to the option-panel gate (ws-options-shots has no assertion; make it a gate).

**F9 (minor, not by themselves fails).** Slot width grows on rows that pass 100 (number_patterns_rule, follow_given_rule: a length
clue). The notice hint is black on screen and grey on paper. Growing worksheet dots ~6 px. Notice lesson step 4 prints the product
"40" (card P2 hides it). function_table review L spiral cell "Answer: _" stub (another skill's legacy cell: file it on that skill).

### Checked and OK
- "Within N" bounds the answer: function_table_easy numbers to 20 cap every In, Out and rule number (8 items read, 0 over; test key
  0..20). Growing "Answers to 20": answers 7..20. notice "Numbers to 100": products ≤ 100.
- Parity and true/false answers read Even / Odd and True / False (q.ans and keys capitalised; truefalse sample ans "False").
- Keys are facsimiles of their pages and correct on every key read: ft test S, notice independent S + test S, pattern_features test S
  (8/8), follow test S, growing test S, number_patterns independent S.
- Size S honoured on practice pages: S holds more than L (ft 12/6/6, npr 9/7/6, notice 15/15/8, growing 5/4/4, features 8/5/4, follow
  10/9/8). The lesson anchor is the same at S and M (identical md5): engine behaviour, noted only.
- The growing unit is S 2.5 / M 2.8 / L 3.3 mm (growing-pattern.js:35; the drawings grow S → L on the rasters).
- A Say band is on every model and anchor (clipped only at npr model L, F3). The misconception-based error items are in the
  NOT GRADED roles this round.

### Not graded (with reason)
- true-false, reason-it, error-analysis, pre-skill-check: KEYJOIN, red for other lanes (brief).
- Review L overflow on growing (`review 1p+1k 1x4 OVERFLOW` in log-L.txt): known red (brief).
- true-false M overflow (pattern_features): known red. The lesson practice pages' chartWide packing (lesson p2+ of notice / features
  / growing): lf-engine. count-row reason-it train and capacity: lf-ops. sections pages-2: engine.
- ftTask=rule-check lesson: lf-engine stepsBy pending. sibling-compare: skipped (first family).
- stretch and word-problems: the role answers "unsupported" for all six skills (no open problem / no stories). Per RUBRIC scope note
  2026-09-26 Stretch is not graded as a separate page. Word problems is not a role these skills own.

### Speed reflection
1. **The most rounds were lost to defects no gate renders.** F2 (screen overlap), F3 (model clip) and F4 (model page fill) are on
   roles or hosts that precritic's plan skips: the render gate runs lesson, test and independent; print-lint runs lesson and
   independent. Rule: precritic `--strict` renders and gates EVERY role the card lists as offered (scripted-model and guided
   included), at S/M/L. This is LESSONS_LEARNED L25 again, so make the plan derive the roles from card §7b, not a fixed list.
2. **Hints on tests (F1) is a contract the cell cannot see.** Give `registerCell` a declared `hints: ['show']` payload field that the
   kit strips at `scaffoldLevel 0`, so no template has to remember it. The HINT-ON-TEST check proves it.
3. **Option-unaware page strings (F6) repeat L28.** One node-lint rule over every preset skill (no browser, about 1 s) catches it before any render.
4. **The anchor charts copy one picture into four panels (F5).** A state-diff check in ws-detailed-lesson (adjacent states must differ, and the
   number a step says to "Write" must be in its state) would have flagged three skills in seconds.
5. **Tooling cost:** `ws-grade-render --roles` already writes the screen hosts. A separate screen-only run re-renders the legacy print
   (5 pages a skill) for nothing: skip the legacy print when `--roles` ran in the same out dir. ws-options-shots writes into the repo with no
   `--out` and asserts nothing: give it `--out` and make it a gate (F8).
6. **Waits:** each S/M/L role render took ~6 min for 6 skills. Most of the wait was the three sizes running one after another; with
   `--size S,M,L` in one browser session (the flag already takes a list in golden mode), the boot happens once.

## Precritic r9 (2026-11-13; --strict --browser-jobs 1; run A 6 skills on a2fecb0aa, logs /tmp/mq-precritic/20261113-054906-3413; run B npr + fgr after b859e11a6, /tmp/mq-precritic/20261113-073410-26955; run C notice + pf, logs under /tmp/mq-precritic (third run), then the notice fix rechecked gate by gate)
Run A: 34 PASS, 13 FAIL of 47 (npr / fgr rows superseded by run B). Run B: 29 PASS, 9 FAIL, 1 N/A of 39. Run C: 28 PASS, 8 FAIL, 3 N/A of 39
(options-render notice patShow and the notice lesson L H13 x4 in run C came from a first try of the a6b1e8151 fix and are OK / gone
on a6b1e8151: ws-options-verify --render OK, lesson L only PAGEFILL 1, EB-EDGE PASS).

| Gate | ft_easy | npr | fgr | notice | pf | growing |
|---|---|---|---|---|---|---|
| node-lint, providers, roles-unit, capacity-pin, content-audit, options-verify, presets, lessonfit, coverage-matrix, card-rulings x2, dealer-uniform, visual-quality, node-lint rules, spec-card signed, code-snapshot, boot-smoke | PASS | PASS | PASS | PASS | PASS | PASS |
| print-lint kit independent S / M / L | PASS | PASS | PASS | PASS | PASS | PASS |
| grade-render --gate (lesson / test / independent S/M/L + screen) | PASS | PASS (A: 30 overflow, fixed b859e11a6) | PASS | PASS | PASS | PASS |
| grade-render --gate every card role | PASS | PASS | PASS | PASS | PASS | PASS |
| cell-checks --card --card-opts | FAIL 20 (rule-check lesson, mixed guided L) | FAIL 262 (lesson chart only) | FAIL 144 (lesson chart only) | PASS | PASS | PASS |
| print-lint lesson S | PASS | PASS | FAIL PAGEFILL 1 | FAIL PAGEFILL 1 | FAIL DN-2 2, PAGEFILL 1, LONE 1 | PASS |
| print-lint lesson L | PASS | PASS | PASS | FAIL PAGEFILL 1 | PASS | PASS |
| print-lint sections pages-2 S / L | FAIL (one sheet of all six) | FAIL | FAIL | FAIL | FAIL | FAIL |
| empty-band | FAIL (scripted-model L, guided S/M, pre-skill-check, quiz) | FAIL (lesson count-row EB-BAND, quiz) | FAIL (quiz) | FAIL (scripted-model, guided S Model 31 %, quiz) | FAIL (scripted-model, independent M EB-FOOT 5) | PASS |
| screen-ink-size | PASS | PASS | PASS | PASS | PASS | FAIL SIZE-WIDTH 9 (worksheet 1280) |
| screen-slots, screen-answer, chromebook-fit, slot-clip, phone-card | PASS | PASS | PASS | PASS | PASS | PASS |
| screen-support-eq | FAIL absent | FAIL absent | PASS | FAIL absent | FAIL absent | PASS |
| sibling-compare | FAIL (no siblings) | FAIL | FAIL | FAIL | FAIL | FAIL |
| options-verify --render | PASS | FAIL pattern / shape @S, shape @L | FAIL shape | PASS | PASS | PASS |

Clean for the critic (every gate on that page type / host green): independent, test, more-practice, error-analysis, true-or-false,
reason-it and the screen card / worksheet on function_table_easy, notice_patterns, pattern_features, growing_shape_patterns (but the
growing worksheet host); independent, test, reason-it, error-analysis, true-or-false and card / worksheet on npr and fgr at the
default options. NOT clean: every lesson page of npr / fgr / notice / pf; scripted-model of ft / notice / pf; guided of ft and notice;
the quiz host (EB-SIDE, legacy cell) of ft / npr / fgr / notice; growing worksheet host; npr / fgr shape / places>=100 option pages.

Red, by owner:
- lf-ops: npr / fgr lesson anchor-chart count-row overflow on places >= 100 and shape circle / hex / mixed (cell-checks 262 / 144,
  options-render) - needs -props 6d61ff6b7 (chart.js / we-do.js hand count rows cellLiveMm) on master; npr lesson EB-BAND (count-row
  chart cells 47 %). F2 screen train still theirs.
- lf-roles: scripted-model EB-BAND / EB-SIDE (ft L, notice S/M/L, pf S); guided we-do cell height (ft guided S/M EB-BAND 38-42 %,
  notice guided S Model 31 %); pre-skill-check word-work EB-SIDE (ft); F3 / F4 / PT-MOD-1 / F5 npr-fgr chart as in r8.
- lf-engine: lesson.js chartWide packing (notice PAGEFILL, pf DN-2 / PAGEFILL / LONE, fgr PAGEFILL); ftTask=rule-check lesson chart
  + mixed guided L (cell-checks ft 20).
- section engine: sections pages-2 L-DENSITY (PAGEFILL / PG-23 / SPREAD on one sheet of all six).
- lf-checks: EB-FOOT pairing (pf independent M: one drawn height paired with 3 footprints, unchanged with our change stashed);
  screen-support-eq scope (4 skills have no support option: absent); sibling-compare (first family: no siblings);
  ws-screen-ink-size SIZE-WIDTH on growing (each Term picture is the pattern's own shape - a 1-wide column is taller than wide by
  the maths; proposed: exempt a term drawing as numeral drawings are, or pin it; widening it would change the pattern).
- quiz host owner (lf-roles / screen-cell): EB-SIDE on the quiz 1280 legacy cell (ft, npr, fgr, notice: "[legacy]").
- ours: none left that a fix in our files clears without a ruling (growing SIZE-WIDTH above).

## Precritic r8 (796952c0 + the notice level-0 line, on our branch merged with lf-roles 83bcbf32 and lf-checks' ws-empty-band 1bcfcb72 in a scratch worktree; 6 skills, --strict --browser-jobs 1; logs /tmp/mq-precritic/20261113-030943-19618, wall ~5400 s): 32 PASS, 13 FAIL
After the run: ws-spec-card --check-signed is OK (the FAIL row ran before the rule ids came out of the new comments, see Log);
ws-empty-band EB-FOOT 15 on notice_patterns test (drawn at level 0 without the hint line, measured by the bridge at level 1)
cleared by keeping the hint's line empty at level 0 - rerun `ws-empty-band --skill patterns:notice_patterns --roles test,independent`: OK.

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill | 6 skills | PASS | 2 of 6 skills checked; not covered: patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns | 1 |
| ws-roles-unit (shared page roles) | shared roles | PASS | - | 0 |
| ws-content-audit --skill | 6 skills | PASS | 2 skill(s) audited (4 of the 6 in scope are outside the audited families) | 7 |
| ws-options-verify --skill | 6 skills | PASS (baseline) | 189 value(s) checked; 6 failing, 6 pinned, 0 new | 143 (52 waiting) |
| ws-presets-unit | 5 preset / host skill(s) | PASS | - | 39 (32 waiting) |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) | 6 skills × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (292) | 895 (41 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 26 |
| ws-coverage-matrix --skills | 6 skills × kinds × S/M/L | PASS | 50 of 200 row(s) run × S/M/L: OK 50, RED 0, ERROR 0; PENDING 114, N/A 36 | 1249 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s)) | 53 (18 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 79 (47 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s), unpinned) | 63 (31 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 3 found in 2 of 6 doc(s); 2 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: algebra:function_table_easy, patterns:number_patterns_rule, patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns (must be clean) | 75 (28 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 8 found in 3 of 6 doc(s); 6 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: algebra:function_table_easy, patterns:number_patterns_rule, patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features, patterns:growing_shape_patterns (must be clean) | 73 (23 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 6 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 461 (16 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | algebra:function_table_easy + patterns:number_patterns_rule + patterns:follow_given_rule + patterns:notice_patterns + patterns:pattern_features + patterns:growing_shape_patterns × sections × 2 pages × S | FAIL | 28 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 18 (5 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | algebra:function_table_easy + patterns:number_patterns_rule + patterns:follow_given_rule + patterns:notice_patterns + patterns:pattern_features + patterns:growing_shape_patterns × sections × 2 pages × L | FAIL | 15 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 48 (34 waiting) |
| ws-grade-render --gate on every other role the signed card offers (function-table §7a; critic lf-ops r1 check 2) | algebra:function_table_easy × 11 roles × S/M/L | PASS | - | 263 (36 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | algebra:function_table_easy × 14 roles + 33 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 20 finding(s) (OVERFLOW 20) on 534 page(s), 398s | 433 (33 waiting) |
| ws-grade-render --gate on every other role the signed card offers (patterns §7a; critic lf-ops r1 check 2) | patterns:number_patterns_rule × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 16 finding(s) (16 overflow, 0 small target) in 1 unit(s) | 235 |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | patterns:number_patterns_rule × 14 roles + 21 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 170 finding(s) (OVERFLOW 170) on 351 page(s), 357s | 361 |
| ws-grade-render --gate on every other role the signed card offers (patterns §7a; critic lf-ops r1 check 2) | patterns:follow_given_rule × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 12 finding(s) (12 overflow, 0 small target) in 1 unit(s) | 198 |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | patterns:follow_given_rule × 14 roles + 21 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 60 finding(s) (OVERFLOW 60) on 351 page(s), 339s | 342 |
| ws-grade-render --gate on every other role the signed card offers (patterns §7a; critic lf-ops r1 check 2) | patterns:notice_patterns × 11 roles × S/M/L | PASS | - | 195 |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | patterns:notice_patterns × 14 roles + 6 option values × S/M/L | PASS | - | 69 |
| ws-grade-render --gate on every other role the signed card offers (patterns §7a; critic lf-ops r1 check 2) | patterns:pattern_features × 11 roles × S/M/L | PASS | - | 194 |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | patterns:pattern_features × 14 roles + 6 option values × S/M/L | PASS | - | 62 |
| ws-grade-render --gate on every other role the signed card offers (patterns §7a; critic lf-ops r1 check 2) | patterns:growing_shape_patterns × 11 roles × S/M/L | PASS | - | 195 |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | patterns:growing_shape_patterns × 14 roles + 7 option values × S/M/L | PASS | - | 94 |
| ws-screen-slots --skills | 6 skills | PASS | 0 found, 0 pinned, 0 new (30 host renders, --baseline design/audit/baselines/screen-slots.json) | 24 |
| ws-screen-answer --skills | 6 skills | PASS | - | 60 |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | 6 skills | FAIL | 5 of 6 skill(s) in scope absent from the output (checked nothing for them): algebra:function_table_easy, patterns:number_patterns_rule, patterns:follow_given_rule, patterns:notice_patterns, patterns:pattern_features | 3 |
| ws-chromebook-fit --skills | 6 skills | PASS | - | 253 |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 4 |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 6 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 106 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 30 printed row(s) with findings (PENDING(no-baseline) 30; siblings per skill: function_table_easy: 0, number_patterns_rule: 0, follow_given_rule: 0, notice_patterns: 0, pattern_features: 0, growing_shape_patterns: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 6 skills × matrix rows × S/M/L + extras at S | PASS | 80 matrix row(s) × S/M/L + 12 extra document(s) (test, more-practice, supports on): 252 document(s), SLOT 0 / CLIP 0 finding(s), 7331 box segment(s) and 0 head(s) probed (SLOT-W N/A on 51, HEADS N/A on 252 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 1762 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 6 skills × 390x844, 390x664 | PASS | - | 144 |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 6 skills | PASS | - | 5 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 6 skills | PASS | - | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 6 skills | PASS | - | 2 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 6 skills | PASS | 6 skill(s), 0 pinned finding(s), 0 stale pin(s), 2.1 s | 2 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 6 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 6 skills | FAIL | 2 of 2 SIGNED card(s) failing: design/cards/function-table/function-table.md, design/cards/patterns/patterns.md | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 6 skills × S/L | FAIL | 12 value page(s) worse than the default: number_patterns_rule pattern="add" @S, number_patterns_rule pattern="sub" @S, number_patterns_rule pattern="grow" @S, number_patterns_rule shape="circle" @S, number_patterns_rule  | 590 |

Against r6 (same 6 skills): cell-checks pattern_features 39 -> 0, growing 34 -> 0, function_table_easy 371 -> 20 (all
ftTask=rule-check lesson + mixed guided L: lf-engine, as r7), number_patterns_rule 192 -> 170, follow_given_rule 81 -> 60
(count-row: lf-ops); render-gate notice / pf / growing / ft OK. Red, by owner:
- lf-ops (count-row.js): npr / fgr cell-checks + render-gate overflow (reason-it train, places 1000, shape circle / hex / mixed),
  options-verify --render pattern / shape @S, EB-EDGE reason-it / pre-skill-check, the screen train (F2), the slot width.
- lf-roles: scripted-model layout (F4; EB-BAND / EB-SIDE on scripted-model), the Model's marksFor for function-table (PT-MOD-1),
  chart.js generic-state progress (F5 npr / fgr), F3 L clip; EB-ROLE 33 (stretch / fact-probe "not composed": roles the
  card's §7b lists but the role answers unsupported).
- lf-engine: lesson.js chartWide packing (print-lint lesson DN-2 / LONE / PAGEFILL / H13 on pf, notice, fgr), sections
  pages-2 L-DENSITY, ftTask=rule-check chart (cell-checks ft 20).
- lf-checks: ws-screen-support-eq scope (5 of 6 skills absent: no support option to check), sibling-compare (first family:
  no siblings), EB-FOOT index pairing (Log).
- ours, left: EB-BAND function_table_easy guided 8 / lesson 2 / error-analysis 1 - the guided cell height is the we-do
  role's (2 rows a page); not changed this round.

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

## Precritic r7 (2a7e74b9 + r7 fix, algebra:function_table_easy, --strict --browser-jobs 1; logs /tmp/mq-precritic/20261113-014922-7147, wall 1400 s)
27 PASS (1 on the baseline), 3 FAIL, 1 N/A.
| Gate | r6 | r7 | Automatic check that caught it / what changed |
|---|---|---|---|
| cell-checks function_table_easy | FAIL 371 (KEYJOIN 15, OVERFLOW 356) | FAIL 35 (KEYJOIN 15, OVERFLOW 20) | ws-cell-checks OVERFLOW (--card-opts); non-lesson rows identical to r6 (true-false / reason-it KEYJOIN, guided L mixed) |
| - lesson ftTask=make S / M / L | 4 / 4 / 4 | 0 / 0 / 0 | last step name one line ("Same rule again.") |
| - lesson ftTask=outputs-check | 16 / 16 / 16 | 0 / 0 / 0 | Check row on the last state only; there the machine is left out (the worked column's head names the rule) |
| - lesson ftTask=inputs-check | 16 / 16 / 16 | 0 / 0 / 0 | Check row on the last state, beside the table |
| - lesson ftTask=mixed-check | 16 / 16 / 16 | 0 / 0 / 0 | same as inputs-check |
| - lesson ftTask=rule-check | 18 / 18 / 18 | **6 / 6 / 6** | no empty rule line before the last state, rule IN the machine on the last, Check row from the Check step on, beside the table; panels 1-2 still 2.4 / 0.8 mm over (lf-engine, below) |
| - lesson band=1000 | 16 / 16 / 16 | 0 / 0 / 0 | the worked column left out when the table is wider than the 84 mm panel ("386 − 200" ran it to 94.5 mm); the words line works the row |
| - lesson ftTable=51 / 52 | 16 / 16 / 16 each | 0 / 0 / 0 | five rows + the machine ran past the panel's 88 mm drawing room: one rule place, the worked column's head |
| ws-empty-band | FAIL 157 (6 skills; ft 36 lines) | FAIL 39 (ft only; the same 36 lines as r6) | no lesson row; role-owned rows as triaged in r6 |
| sibling-compare | FAIL | FAIL (0 worse) | lead: first family |
| ws-detailed-lesson --check (shares ftStepState) | OK | OK | |
| everything else on the plan (node-lint, providers, content-audit, print-lint lesson S/L + independent S/M/L, grade-render --gate + other roles, screen-slots/answer, chromebook-fit, phone-card, slot-clip, options-verify --render, card rulings, spec-card, boot-smoke, code-snapshot 736) | | PASS | |

Red, by owner (r7 changes only; the r6 list below stands for the rest):
- **lf-engine (was ours)**: function_table_easy lesson ftTask=rule-check, chart panels 1 and 2 at 2.4 / 0.8 mm over (S, M, L
  alike). Cause: the provider deals five worked steps (look, bigger/smaller, test, Check, write) and the routine
  'function-table-use-rule' names four, so namedSteps (lesson-pages/common.js) falls back to the provider's sentences as step
  NAMES, and the 2 x 2 chart puts steps 1 + 2 in panel 1: 32 mm of heading (30.5 in panel 2) over a 77 mm machine + table.
  Needs ONE of: (a) option-aware lesson steps - a routine's `steps` chosen by the skill's option values (e.g. `stepsBy:
  {ftTask: {'rule-check': [5 steps]}}` read by namedSteps), so each panel gets a one-line name and its words line; or (b) the
  chart's layout chosen per option (chartWide rows when the provider's step count differs from the routine's). Dropping the
  Check step from the provider would fit it in-lane but loses the Check step on every role (P-1), so it was not done.

## Precritic r6 (bd6c6cc6 + r6 fixes, 6 skills, --strict --browser-jobs 1; logs /tmp/mq-precritic/20261112-235836-14314, wall ~5400 s)
27 PASS (spec-card --check-signed now PASS: patterns card signed), 16 FAIL.
| Gate | r5 | r6 | Automatic check that caught it / what changed |
|---|---|---|---|
| cell-checks notice_patterns | FAIL 88 (KEYJOIN 26, OVERFLOW lesson feature 48 + band25 12) | **OK** (126 pages) | ws-cell-checks KEYJOIN + OVERFLOW (--card-opts) |
| cell-checks pattern_features | FAIL 437 (KEYJOIN 314, OVERFLOW 123) | FAIL 39 (KEYJOIN 12, OVERFLOW 27): error-analysis / true-false / reason-it KEYJOIN, pre-skill-check + true-false M + reason-it OVERFLOW | ws-cell-checks; the left rows are role-drawn (see owners) |
| cell-checks function_table_easy | FAIL 425 (KEYJOIN 15, OVERFLOW 410) | FAIL 371 (KEYJOIN 15, OVERFLOW 356): ftTask=rule lesson 54 -> 0; 8 other option values' lesson charts still over (ours, below); true-false / reason-it KEYJOIN | ws-cell-checks OVERFLOW |
| cell-checks number_patterns_rule / follow_given_rule | 192 / 85 | 192 / 81 | count-row lesson (places 1000, shape circle/hex/mixed) + reason-it train, true-false KEYJOIN: not ours |
| cell-checks growing_shape_patterns | 34 | 34 | review L 1.3 mm body, pre-skill-check: not ours |
| render-gate notice / function_table_easy | (notice FAIL in r3-r4 class) | OK / OK | ws-grade-render --gate other roles |
| render-gate npr / fgr / pf / growing | 18 / 14 / 27 / 20 | 18 / 14 / 27 / 20 | count-row train; pre-skill-check sheet overflow; growing review L: not ours |
| ws-empty-band | FAIL 157 | FAIL 157 | triaged below: no row is set by our cells' own drawing |
| print-lint lesson S / L | FAIL 6 / 5 rows | FAIL 6 / 5 rows (same) | lf-engine chartWide packing (fgr H13 / PAGEFILL, notice PAGEFILL, pf DN-2 / PAGEFILL / LONE) |
| print-lint sections --pages 2 S / L | FAIL | FAIL | section engine |
| options-verify --render | FAIL 12 | FAIL 12 | lf-ops count-row capacity |
| sibling-compare | FAIL | FAIL (106 unproven, 0 worse) | lead: first family, no siblings |

Fixes (all in lane files):
1. `sheet/cells/notice.js` sentenceList: the ONE answer slot (AK-2, shape check) is an empty overlay over the box column; the
   sentences are printed choices outside the slot. KEYJOIN read "The ones digits go 4, 6, ..." as two answers in one slot
   (314 + 26 findings). Caught by ws-cell-checks KEYJOIN. Screen ticks unchanged (wireTickBoxes reads the row divs):
   ws-screen-slots, ws-screen-answer, ws-phone-card, ws-chromebook-fit, ws-slot-clip PASS.
2. `notice.js` feature chart state drawn at one fixed width (64 mm at S): in a stretchy 2 x 2 panel the chart's zoom (1.6)
   rewrapped the sentences to more lines than it measured at zoom 1 (panels 12-18 mm over). Parity chart state ntTight (no tab
   pad, own width): Even / Odd and the ring left a zoomed panel (band=25). True / false in a full-width ROW panel drawn at S
   (pattern_features patTask=truefalse: 66 mm drawing in a 53 mm row). Caught by ws-cell-checks OVERFLOW (--card-opts).
3. `sheet/cells/function-table.js` ftStepState (plain find-the-rule chart): one rule place a state - the states before the last
   show the tried rule in the machine and no empty rule line; the last writes the rule IN the machine (ruleInMachine with
   `ftMerge`, a whole panel ~80 mm wide). ftTask=rule lesson 18 a size -> 0. Caught by ws-cell-checks OVERFLOW; detailed lesson
   g3-oa9-input-output-rule (same stepState) ws-detailed-lesson --check OK before and after.

Red, by owner (for the lead to route):
- **ours (next round)**: function_table_easy lesson chart on ftTask make / outputs-check / rule-check / inputs-check / mixed-check,
  band 1000, ftTable 51 / 52 (4-18 findings a size): the 2 x 2 chart falls back to zoom 1 (chart.js `fallback`), panels 4-9 mm
  over at S. Same class as fix 3 (machine + table + Check row a state); needs a compact chart state per task (Check row on the
  last state only) or the engine's option-aware chart layout. Check: ws-cell-checks --card-opts --roles lesson.
- **lf-engine**: lesson chartWide packing (print-lint lesson S/L rows above); lesson pages of count-row options (npr places 1000,
  shape circle / hex / mixed; fgr places 1000; npr pattern-all / places 1 L body 1.9 mm); pre-skill-check pages overflowing the
  sheet (pf, growing: render-gate + cell-checks).
- **lf-ops**: count-row.js reason-it train wrap (render-gate npr 18 / fgr 14; cell-checks reason-it), options-verify --render
  capacity (12 values), our interim revert 2cfeb1d7 still in.
- **section engine**: print-lint sections --pages 2 S / L (L-DENSITY).
- **role owners**: KEYJOIN on true-false (all 6 skills; the role writes its statement into the slot), reason-it, error-analysis
  (compose.js checkLine writes the sentence choices into the fix slot: pf 2), pre-skill-check KEYJOIN (npr / fgr); review L
  1.3 mm body overflow (growing 8); true-false M overflow (pf).
- **ws-empty-band 157** (no row from our cells' own drawing; the cell height is the role's): scripted-model role 44 (ft 20,
  notice 20, pf 4: EB-BAND / EB-SIDE on the role's own [] cells); guided role 23 (ft 6, notice 11, pf 2, growing 5: the Model /
  row height of the guided grid); count-row (lf-ops / lf-engine) 63 (npr / fgr lesson 36, reason-it 22 incl. EB-EDGE 18, opener 2,
  error-analysis 2); error-analysis role 6 (ft); reason-it role 6 (ft 2, notice 2, pf 1, growing 1); pre-skill-check role 7 (ft
  word-work EB-SIDE 4, pf legacy EB-EDGE 3); quiz host 3 (npr / fgr / ft legacy screen item, EB-SIDE); EB-FOOT 5 on pf independent
  M: the bridge reports fits.cols 2 while the notice footprint (maxCols 1) lays one column, so the gate pairs the 1-column cell
  with the 2-column measure (bridge / gate owner).
- **lead**: sibling-compare (first family on the template).

## Precritic r5 (37a7f4f5 + the parity fix, 6 skills, --strict; logs /tmp/mq-precritic/20261112-221334-4592, wall 4632 s)
25 PASS: node-lint, providers-unit, content-audit, options-verify (6 pinned, 0 new), presets-unit, lessonfit, coverage-matrix,
print-lint independent S/M/L, grade-render --gate (lesson/test/independent), render-gate other roles (function-table card),
screen-slots, screen-answer, chromebook-fit, code-snapshot, boot-smoke, slot-clip, phone-card, card-rulings rulings + offered,
dealer-uniform, visual-quality, and the rest of the node rows.
| Gate | Result | Findings | Owner |
|---|---|---|---|
| ws-empty-band (new on master) | FAIL | 157 (EB-BAND 107, EB-SIDE 23, EB-EDGE 22, EB-FOOT 5); ft 36, npr 21, fgr 18, pf 16, notice 11, growing 11 | triage next round: ours where the cell sets the band, lf-engine for role/page bands |
| print-lint --roles lesson L | FAIL | follow_given_rule H13 0->2; notice PAGEFILL 0->1 | lf-engine (lesson.js chartWide packing), as r3/r4 |
| print-lint --roles lesson S | FAIL | follow_given_rule H13 2, PAGEFILL 2; notice PAGEFILL 1; pattern_features DN-2 2, PAGEFILL 1, LONE 1 | lf-engine (same) |
| print-lint sections --pages 2 S / L | FAIL | 28 / 15 L-DENSITY on the 6-skill sheet | section engine (as r3) |
| cell-checks --card-opts function_table_easy | FAIL | 425 (OVERFLOW 410, KEYJOIN 15): true-false / reason-it KEYJOIN; lesson ftTask rule OVERFLOW | roles true-false / reason-it (KEYJOIN); ours to triage the lesson overflow |
| cell-checks number_patterns_rule / follow_given_rule | FAIL | 192 / 85 (reason-it OVERFLOW = count-row train wrap; true-false, pre-skill-check KEYJOIN) | lf-ops count-row (wrap fix, our 2cfeb1d7 revert still in); roles for KEYJOIN |
| cell-checks notice_patterns | FAIL | 88 (patTask feature: lesson OVERFLOW + KEYJOIN, guided / independent KEYJOIN) | ours (notice.js feature: the sentence answer reads as a joined key) |
| cell-checks pattern_features | FAIL | 437 (KEYJOIN 314, OVERFLOW 123) | ours (same feature-sentence KEYJOIN) |
| cell-checks growing_shape_patterns | FAIL | 34 OVERFLOW: review L, pre-skill-check S/M/L | review L 1.3 mm body overflow is the same with the old 2.6 mm unit (not the resize): roles review; pre-skill-check: roles / lf-engine |
| render-gate other roles npr / fgr | FAIL | 18 / 14: reason-it count-row train leaves the cell | lf-ops count-row |
| render-gate other roles pattern_features / growing | FAIL | 27 / 20: pre-skill-check overflows the sheet (+ growing review L 1.3 mm) | roles pre-skill-check / review (lf-engine) |
| sibling-compare | FAIL | 0 above siblings, 107 rows with no sibling measured | lead (first-family rule: no siblings) |
| spec-card --check-signed | INCOMPLETE | patterns card unsigned (re-sign from 37a7f4f5) | lead |
| options-verify --render | FAIL | 12 values: npr pattern add/sub/grow S 8 vs 9; shape circle/hex/mixed S 5 vs 9; fgr shape circle 8 vs 10 | lf-ops count-row (as r3) |

## Precritic r4 (head b0ca7395, 2 skills patterns:notice_patterns, patterns:pattern_features, --strict --browser-jobs 1; logs /tmp/mq-precritic/20261107-122629-29669, wall 948 s)
| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-providers-unit --skill | patterns:notice_patterns, patterns:pattern_features | N/A | no provider test for patterns:notice_patterns, patterns:pattern_features | 0 |
| ws-content-audit --skill | patterns:notice_patterns, patterns:pattern_features | N/A | outside the audited families (+ - × ÷, K-2, place value, time and money, function tables) | 4 |
| ws-options-verify --skill | patterns:notice_patterns, patterns:pattern_features | PASS | 20 value(s) checked; 0 failing, 0 pinned, 0 new | 69 (51 waiting) |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 37 (31 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 26 |
| ws-coverage-matrix --skills | patterns:notice_patterns, patterns:pattern_features × kinds × S/M/L | PASS | 17 of 66 row(s) run × S/M/L: OK 17, RED 0, ERROR 0; PENDING 37, N/A 12 | 274 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found (2 doc(s)) | 54 (39 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found (2 doc(s), unpinned) | 22 (5 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found (2 doc(s), unpinned) | 45 (28 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | patterns:notice_patterns, patterns:pattern_features | FAIL | 3 found in 2 of 2 doc(s); 2 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: patterns:notice_patterns, patterns:pattern_features (must be clean) | 48 (25 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | patterns:notice_patterns, patterns:pattern_features | FAIL | 5 found in 2 of 2 doc(s); 4 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: patterns:notice_patterns, patterns:pattern_features (must be clean) | 72 (52 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | patterns:notice_patterns, patterns:pattern_features × lesson, test, independent × S/M/L + screen hosts | PASS | - | 200 (41 waiting) |
| ws-screen-slots --skills | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found, 0 pinned, 0 new (10 host renders, --baseline design/audit/baselines/screen-slots.json) | 30 (16 waiting) |
| ws-screen-answer --skills | patterns:notice_patterns, patterns:pattern_features | PASS | - | 40 (14 waiting) |
| ws-chromebook-fit --skills | patterns:notice_patterns, patterns:pattern_features | PASS | - | 180 (12 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 4 |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | patterns:notice_patterns, patterns:pattern_features: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 34 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 9 printed row(s) with findings (PENDING(no-baseline) 9; siblings per skill: notice_patterns: 0, pattern_features: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | patterns:notice_patterns, patterns:pattern_features × matrix rows × S/M/L + extras at S | PASS | 26 matrix row(s) × S/M/L + 4 extra document(s) (test, more-practice, supports on): 82 document(s), SLOT 0 / CLIP 0 finding(s), 250 box segment(s) and 0 head(s) probed (SLOT-W N/A on 52, HEADS N/A on 82 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 536 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | patterns:notice_patterns, patterns:pattern_features × 390x844, 390x664 | PASS | - | 79 |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | patterns:notice_patterns, patterns:pattern_features | PASS | - | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | patterns:notice_patterns, patterns:pattern_features | PASS | - | 1 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | patterns:notice_patterns, patterns:pattern_features | N/A | no operand-dealt items (nothing to deal evenly): patterns:notice_patterns, patterns:pattern_features | 1 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | patterns:notice_patterns, patterns:pattern_features | PASS | 2 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.1 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | patterns:notice_patterns, patterns:pattern_features | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | patterns:notice_patterns, patterns:pattern_features | INCOMPLETE (unsigned card) | needs owner signature: design/cards/patterns/patterns.md (everything else green) | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | patterns:notice_patterns, patterns:pattern_features × S/L | PASS | 12 value page(s) (2 skill(s) x S/L) against 4 default page(s) through ws-print-lint --source kit in 63 s; 0 n/a | 64 |

ws-precritic: FAIL: 3 FAIL, 21 PASS, 3 N/A, 1 INCOMPLETE of 28. Settled:
- spec-card INCOMPLETE: expected - the patterns card was regenerated with --resign this round (b0ca7395); the lead re-signs.
- print-lint lesson S / L: the same rows as r3 (notice_patterns PAGEFILL p3; pattern_features DN-2 / LONE / PAGEFILL):
  lesson.js chartWide Guided / Independent packing, lf-engine (r4 changes only the parity cell's finished-work state,
  never drawn on a lesson page).
- sibling-compare: 34 NO-SIBLING counts, 0 above a sibling, 0 ERROR: SKIPPED by the lead's first-family ruling (as r3).
- Off plan, the r4 targets: ws-print-lint --roles error-analysis notice_patterns + pattern_features, --baseline: S OK
  (print-lint.S.json), L OK (print-lint.json); was S x12 / L x8 H13. Renders design/audit/runs/lf-algebra/r4/.
- ws-content-audit --skill: N/A (outside the audited families; --category patterns: OK). ws-detailed-lesson
  g3-oa9-mult-table-patterns --check --repeats: OK.
- Seen, not touched (not this round's items): notice_patterns reason-it L H13 x4 + CL40-INK x4 (same counts before and
  after r4); the EA fix choices print the answer's own case ("odd" beside "Even": q.ans is lowercase and the role's
  choicesOf keeps the answer's case) - ours, one line in gen-patterns-notice.js (q.ans 'Even' / 'Odd' / 'True' / 'False').

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
- 2026-11-13 08:55 fix r9 (mq-opus-low): (1) merge origin/master 8a7c5d438 -> 74bff0abb: only backtests.json conflicted (rows unioned
  by id, master's text + our dealer-declared-set row; checked: JSON parses, no duplicate id); no generated file changed on both sides.
  boot-smoke OK, code-snapshot OK (736). (2) git revert 2cfeb1d7 -> af74c6b04; cherry-pick 77187c6e8 -> a2fecb0aa, reason-it.js resolved
  on master's (answerPlace frames, wrongSlots, auto-margin centring, list row) plus lf-ops' pair / full (fix4 8586745a8, not on master),
  crWrap + cellLiveMm and the --ws-koin keep-out as padding-top (auto margins still centre); equations keep master's wide rule; count-row
  narrowLive takes the one-line cellLiveMm cap from -props 6d61ff6b7 (the wrap needs it). Not ported: fix4's wrong.frame stem (master's
  answerPlace replaces it). (3) syntax, boot-smoke, code-snapshot, card-rulings (both cards), spec-card --check-signed x2, lesson-unit
  (286), detailed-lesson --check: all OK. (4) Fixes, each with its check:
  - b859e11a6 count-row.js: the revert of 2cfeb1d7 restored 3d8bca1's columns-keyed train wrap, which -props dropped; every multi-column
    train (the lesson chart) wrapped and overflowed. CHECK: ws-grade-render --gate (npr lesson S/M 30 overflow -> 0) and ws-cell-checks
    --card-opts (npr 1226 -> 262, fgr 1056 -> 144; the rest is the chart width, lf-ops). Lesson for the brief: "drop the interim revert"
    meant "take -props' count-row", not "restore 3d8bca1" - diff the cell against the source branch after a revert-of-revert.
  - a6b1e8151 notice.js: a ringed word keeps 2.2 mm beside it. CHECK: ws-empty-band EB-EDGE (notice guided M Model 0.8 mm -> PASS);
    ws-options-verify --render and print-lint lesson L confirm the ringed-only form (an every-word margin raised H13).
- 2026-11-12/13 lead notes: guidedRows key (lf-engine); next-skill order (above); lf-roles c93de259 cleared KEYJOIN on our six; lf-checks fdf3af0f EB-FOOT tool fix; +$15 for critic r2 (cap $75).
- 2026-11-13 04:55: fix r8 (Opus medium: rebuild after critic r1 FAILED all six). Merged for precritic only: our branch + origin
  lf-roles (83bcbf32; backtests.json conflict resolved by keeping both rows) + lf-checks' ws-empty-band.cjs (1bcfcb72, EB-FOOT
  footCols), in a scratch worktree; nothing of theirs committed here. Each critic finding:
  - F1 FIXED (notice.js showOn(p, ctx), growing-pattern.js `show`): the fading hint never draws at scaffold level 0 (the Test),
    whatever patShow says; every hint part carries data-ws-hint="fade" and css/quiz-mode.css hides it in #quizTakeView (the
    quiz deals the practice twin; additive rule, the asset stamp is the deploy's). Node probe: level 0 -> 0 hint parts, level 1
    -> 2 (notice) / 3 (growing). At level 0 the parity hint's LINE stays (a no-break space, no word), because the bridge
    measures every item at level 1: without it precritic r8 found EB-FOOT 15 on the notice Test (32.6 drawn vs 38.6 mm);
    rerun OK. (Engine note for lf-roles: measure a role's items at the level it plans them.) CHECK: none exists. PROPOSED for lf-checks: ws-cell-checks HINT-ON-TEST - for every option
    the panel groups as support with a fading help, render the Test (level 0) and the quiz host and FAIL when a
    [data-ws-hint] part (or, without the mark, the item's hint text) is in the cell; backtest fail 47b1f2a86, pass this commit.
  - F2 NOT OURS: count-row train wrap / caption overprint / tiny digits on screen (count-row.js + the interim revert 2cfeb1d7):
    lf-ops. count-row.js untouched.
  - F3 HANDED to lf-roles: the npr Model at L runs 6 mm past the frame and clips the Say band. Our Say string is one line
    (crop-npr-L-say.png); the overflow is the Scripted Model's count-row re-plan (scripted-model.js marksFor / variants)
    under-measuring the L states. Proposed check (critic's): render gate + text-clip probe on scripted-model and guided S/M/L.
  - F4 HANDED to lf-roles: our footprints match the drawing (function_table_easy S hMm 63 vs ~66 drawn; growing measured),
    and the worked-step count is the standard four. The Model role lays one state a row (state + step text), so 4 states x
    ~66 mm cannot fit a page (deal [2, 2]); a 2 x 2 like the anchor chart fits. Proposed check: print-lint PAGEFILL on
    --roles scripted-model in precritic's plan.
  - F5 FIXED for function_table_easy (function-table.js ftStepState: each state before the last shows the marks of steps
    1..k traced grey, ctx.ftOnly; looked at the S lesson p1: empty / 8 / 8, 9 / all four). number_patterns_rule and
    follow_given_rule: their chart state is chart.js stateDrawing's generic path (count-row has no stepState), which draws
    blank, blank, blank, answered: HANDED to lf-roles (pass `payload.traceSlots` from the merged marks in the generic path,
    as scripted-model marksFor already does for count-row) or lf-ops (a count-row stepState). PROPOSED check: ws-detailed-lesson
    / cell-checks STATE-PROGRESS (adjacent chart states differ; a step that says "Write N" has N in a slot of its state).
  - PT-MOD-1 (lead) PARTLY: function-table now draws `payload.traceSlots` (a blank state with the marks of steps 1..k, grey),
    count-row's convention. The Model passes traceSlots only for count-row (scripted-model.js marksFor:
    `q.cell.template !== 'count-row'`): HANDED to lf-roles - accept 'function-table' there and the Model states progress.
  - F6 FIXED (providers/patterns.js): the per-item `stepsFor` is gone for every notice task and the growing tasks, so every
    item of a page has the same steps and the Steps band takes the item's (feature steps on pattern_features), never the
    item-less fallback that fell to parity (`noticeStrings.def` is read by nothing; kept). Node probe: pattern_features guided
    steps = the feature list. PROPOSED check: ws-node-lint STEPS-FOLLOW-PRESET (critic's: per preset skill, the page-level
    steps with {skillId, opts} and no item equal the item-level task's).
  - F6b FIXED: the provider steps are the lesson's step names (notice parity, pattern features, growing next, number patterns
    find / use the rule in the countby.js block, function-table outputs). PROPOSED check: guided `Steps:` text equals the
    routine's step names (ws-lesson-unit).
  - F7 FIXED: growing next iCan "I Can find the next term of a growing pattern" (one verb; the role title gerundises the first
    verb only). PROPOSED check: VQ-TITLE "X and Y" rule (both verbs -ing) - compose.js topicOf is lf-roles'.
  - F8 HANDED (skill-options-ui.js / teacher-preview.js owner): the sample mounts (42 kB, stage 400 x 963 px) and teacher-preview
    fit() puts the frame in is-cropped mode (scale 0.45, top-left); skill-options-ui _tidySample then sets
    translate(-50%, -50%) scale(k) on the same stage, which moves it out of the frame: blank. PROPOSED check (critic's):
    ws-options-shots asserts a drawn part inside the frame's box.
  - EB-FOOT 61.2 / 55.7 vs 49.2 (lead item): NOT a measure error. The independent role lays items 3 and 4 (measured 50.2 mm at
    2 across, fits) in the 2-across row and items 0-2 (2-across fits:false 'reflow', 61.2 / 55.7) full width; ws-empty-band
    pairs cell i with items[i] by index, so it compares cells 1-2 (items 3, 4: 50.2 vs 49.2 drawn, -2 %) with items 0, 1.
    HANDED to lf-checks: pair each cell with its own item (letter / sig), not the index. Backtest row
    eb-foot-gridcols-patterns NOT armed: no fix commit of ours exists for it; its fail state would need the pairing fix.
  - q.options (lead) DONE: pattern_features' three sentences in printed order (gen-patterns-notice.js noticeFeature).
  - Minors: slot width past 100 = count-row.js maxDigits of the row (lf-ops: size slots from the band's widest number);
    notice hint black on screen FIXED (mq-keep-color, so the screen ink pass keeps the one grey); growing twin dots FIXED (term
    box never under 100 px on screen: 10 px dots from ~6); notice lesson "40" FIXED (step 4 "So the product is even.").
  - Card: the first build of these edits changed both signed cards (rule ids PT-TST-2 / PT-MOD-1 cited in new comments are
    hashed into the card); the ids were taken out of the comments, cards green, no card change.
  Checks: node --check on every changed file; ws-boot-smoke OK; ws-code-snapshot OK (736); ws-card-rulings OK (6/6);
  ws-providers-unit OK; ws-lesson-unit OK; ws-node-lint 58 before and after (none ours); ws-detailed-lesson --check OK on
  g3-oa9-input-output-rule and g3-oa9-mult-table-patterns; precritic r8 above.
  Speed reflection: (1) three of the nine findings were in host or role files (chart.js generic state, scripted-model marksFor,
  skill-options-ui) - a lane that owns only cells needs a "who draws this" map before the fix round, or the round splits into
  hand-offs late; (2) the EB-FOOT row would have been diagnosed in minutes if ws-empty-band printed each cell's item letter
  beside its measure; (3) the card gate caught comment-only rule-id citations, after the change - run ws-spec-card
  --check-signed before every commit (it is 2 s).
- 2026-11-13 02:20: fix r7 (precritic r7 above). One target: the function_table_easy lesson chart on 8 option values.
  `sheet/cells/function-table.js` chartState (ftStepState's path for every table that is not the plain find-the-rule one):
  Check row on the last state only (or from the state whose step marks `chk`), beside the table when table + 5 mm + Check fit
  the 84 mm panel; the worked column left out when wider than the panel; the machine left out when the worked column's head
  names the rule and the drawing would pass the panel's 88 mm; find-the-rule-with-Check gets r6's one rule place (no empty
  rule line before the last state, rule in the machine on the last). `lessons/families/algebra.js` routine step 4 "Same rule,
  every row." -> "Same rule again." (it wrapped to two lines in every last panel: 5.2 mm). Nothing shrinks: zoom 1, metrics
  as before. Each finding was caught by ws-cell-checks OVERFLOW (--card-opts, lesson role); measured per panel with a scratch
  probe (panel 114.6 mm, padding 9.7, drawing room 88 under one-line name + words). Checks: node --check on both files,
  ws-cell-checks full card + options (371 -> 35), ws-detailed-lesson --check OK, boot-smoke OK, code-snapshot OK (736),
  precritic r7. Speed reflection: the r6 fix covered one option value of a class that spans eight; the per-option table in
  the precritic log was the map. Proposal for lf-checks: a chart-state budget unit check (render every stepState of a
  template's card option values at zoom 1 in a node DOM-less estimate via footprint(), fail when h > the 2 x 2 panel's
  drawing room) so a chart class is closed across every option value in one round, not per value.
- 2026-11-13 01:35: fix r6 (precritic r6 above). Pulled bd6c6cc6 (patterns card signed); design/cards/* untouched. Fixes 1-3 in
  notice.js and function-table.js; boot-smoke OK, code-snapshot OK (736). Speed reflection: the KEYJOIN class (a check slot that
  wraps printed choice text) and the chart-zoom reflow class (a stretchy drawing zoomed by the anchor chart) each cost a round;
  proposals for lf-checks: (a) KEYJOIN skips text outside [data-ws-ink] or a node-lint rule "a check / choice slot holds no
  printed sentence"; (b) a chart-state unit check that renders each stepState at zoom 1 and zoom z and fails when the height
  grows faster than z (catches fix 2 without a page build).
- 2026-11-12 23:40: fix r5. Merge of origin/master d34311d5 (49096d74): QUEUE.md/queue.json from master, regenerated;
  prereqs.js from master, our 6 records moved to families/algebra.js (6 ROUTINES + 6 skill: LESSONS; lessonFor equal to the old
  records except guidedRows: 1 on npr / pf / growing / fgr and fgr's match-anything example the library requires; notice and
  pattern_features carry iconsPending for their repeated icons); backtests.json both sides' rows; ws-card-rulings both readers.
  count-row.js: master has no change since b19172b4, our interim revert 2cfeb1d7 kept. Gates after the merge all OK (boot-smoke,
  code-snapshot 736 with ZW-ZZ unmoved and unique, standards, search-terms, presets-unit, redesign-passed, wrm-page-unit,
  lessons-first-queue --check, card-rulings --self-test, spec-card function-table signed; lesson-unit, lesson-coverage).
  Growing unit S 2.5 / M 2.8 / L 3.3 mm (37a7f4f5): print-lint kit S/M/L and lesson S/L 0 findings, card rulings OK; no owner
  question needed. Parity / true-false q.ans and wrong values capitalised (Even / Odd, True / False; checks fold case).
- 2026-11-07 14:32: lf-engine landed `guidedRows: 1` (commit 50c1eca6 on claude/sweet-newton-c8wrv1-lf-engine; we-do.js guidedRowsOf,
  schema validateGuidedRows). Next round: once that branch merges, set guidedRows: 1 on our chartWide lessons in families/algebra.js.
- 2026-11-07 12:45: lead: patterns card re-sign pending (M/L shrank in b0ca7395, see Now); no further work this week.
- 2026-11-07 ~12:50: hand-over. Merged the integration tip (14 commits, clean); on the merged tree ws-code-snapshot (736 codes),
  ws-standards, ws-search-terms, ws-presets-unit (126), ws-redesign-passed, ws-wrm-page-unit, ws-lessons-first-queue --check and
  ws-spec-card --check-signed (before the patterns re-sign) all OK. No skill added to redesign-passed.js (no critic yet).
  Speed reflection (rule 00) for the auditor: 4 builder/fixer runs, 0 critic rounds. Time lost to (a) a cross-lane regression
  (count-row 3d8bca1 keyed the wrap on ctx.columns, found only by our lesson-page gates: automatic check proposal = a count-row
  backtest row "full-width panel with columns > 1 must not wrap", owner lf-ops); (b) lesson-role packing of tall cells
  (guidedRows min 2) found by precritic two rounds running (proposal: lf-checks adds a lesson-page fit check per new template
  BEFORE the build, using the cell's footprint; owner lf-checks); (c) tools that read only numeric answers (dealer-uniform,
  card-rulings) cost a round each on non-arithmetic skills: both now read declared sets / payload fields (done, backtest
  dealer-declared-set); (d) parallel builders in worktrees cost one merge conflict each in prereqs.js (append-only blocks:
  harmless). Speed-up: brief builders with the other lanes' file locks and pending cross-lane commits up front.
- 2026-11-07 fix r4 (Opus medium; two machine-check reds). (1) notice_patterns error-analysis H13 S x12 / L x8 -> 0: in the
  finished-work state ('wrong') the parity cell reads "The product is [Even] Odd" as one sentence where the column is wide
  enough and marks that column data-ws-anscol, so the EA role puts Correct / Fix-it under it (intoAnswerColumn, AX-4 'incol'):
  S 2 x 3 (was 2 x 3 beside with a 31 mm band), L 1 x 4 beside (was 2 x 2, 45 mm band). Tried first: the anscol on the whole
  root (judgement under the fact: the role chose 3 x 2, 108 mm rows) and the judgement beside the choice (90 mm wide, wraps
  at 2 columns). Other states unchanged; true-false / reason-it lint counts unchanged. (2) patterns card.json growing unit
  2.5 / 2.5 / 2.6 mm, box 7.8 u (19.5 / 19.5 / 20.3 mm), dots 0.8 u (the code since r3); patterns.md regenerated --family
  patterns --resign: UNSIGNED, the lead re-signs (commit b0ca7395). Stale cell comment fixed (u 2.0 / 2.4 / 2.6).
  Speed: the EA row rule (grow 1.4 x, emptiness by ink width) decides the layout, so a cell fix is read off the measured
  modes / inkW (meta.json) before trying - one probe of the host's mode measure found the wrap in 1 run.
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
