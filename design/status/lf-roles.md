Lane: lf-roles
Title: Lessons-first wave 2: the shared page roles (true-false, reason-it, error-analysis, review, pre-skill-check, scripted-model, guided, test) and their helpers
Session: session_013pHDnPLFmXnUHxE1xyq1rZ
Branch: claude/sweet-newton-c8wrv1-lf-roles
Owner of files: js/modules/sheet/roles/{true-false,reason-it,error-analysis,review,pre-skill-check,scripted-model,guided,test,compose}.js, sheet/adapters.js stamp(), tests/scripts/ws-roles-unit.mjs
State: fix (critic r1 FAIL; r2 fixes in, critic r2 waits on lead rulings)
Updated: 2026-11-13
Builder profile: lane session (no sub-agent builder)
Critic rounds: 4, r4 PASS (D6/N2/D7); 3, r3 FAIL (passed skills set a PASS, 0 worse; changes FAIL D1-D4 -> fixed 000f6eb5); 2 earlier: r2 FAIL (changes FAIL on N1 + R2; report scratchpad critic-r2.md); r1 FAIL (14 role findings, 8 caused by this lane; report scratchpad critic-r1.md, summary below)

## Now
- 5 fixes pushed, each with its check first (FAIL on master eef75f5, OK on the fix); 780 passed-skill pages (26 skills x 10 roles x
  S/M/L, pupil + key) byte-identical to master except 5 INTENDED Model L pages (fix 5, needs a lead decision + critic).
- Cleared on lf-algebra 2a7e74b9 + this branch: KEYJOIN 0 on 6 skills x true-false / reason-it / error-analysis / pre-skill-check;
  OVERFLOW 0 on review (growing L), pre-skill-check (pf, growing), true-false M (pf); EB-FOOT 5 -> 2; role empty bands 86 -> 72.
- Proofs: ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --check vs master eef75f5: 1556/1556 identical;
  ws-boot-smoke OK; ws-cell-checks --self-test OK; the 3 backtest rows OK.
- Next: guided / EA / reason-it / pre-skill-check empty bands (72 left, list below); clean precritic on 3 skills a role; critic.

## Round 9 (2026-11-13; lead order 1-5)
- Critic r5b D2 (PT-MOD-1, P-LC-9) fixed in 88032a8a: each Model state names its own new marks (`traceNew`); function-table and
  count-row draw only those in trace grey and the earlier marks black; a last "fill in every row" re-mark adds only the new answer;
  the lesson chart's F5 count-row states the same. Check ws-roles-unit MOD-MARKS-INK (FAIL on 3b324bcc, OK on 88032a8a; backtest
  row model-marks-ink PASS).
- Lead order 5 (PUPILTAG offsets on table / count-row work): function-table's inline-block wrapper is vertical-align:top (it sat
  3.6 mm under the cell top on the line strut, so the label floated 5.5 mm over the table at L); error-analysis TAG_LIFT lifts the
  label 0.5 mm over count-row / function-table work (ink flush with the box: 1.8 mm before). PUPILTAG counts a bordered box's top
  edge as ink. ws-cell-checks PUPILTAG + OVERFLOW: 0 on function_table_easy / number_patterns_rule / function_table EA S/M/L.
- Proofs: passed skills 810/810 role pages (27 skills x 10 roles x S/M/L, pupil + key) identical vs 3b324bcc; lesson baseline
  --all-lessons vs master 8a7c5d43: see below.
- R13 (lead ruling (a)): a Pre-skill Check that runs to 2 pages splits as evenly as its bands allow (2 + 2), never a page of
  one item, every prerequisite kept, the FULL header on every page; check ws-roles-unit PSC-2PG-BALANCE (b7110b89). 36 of 81
  passed PSC pages change - all 2-page checks; one-page checks byte-identical.
- Critic r5c (design/status/lf-roles/r5c/critic-r5c.md): PASS, 0 counted defects; every changed set 8+ and better than before.
  Nits N1 (fte step 5 text says "every row" while one mark is new), N2 (npr Model steps 1-2 add no mark; pre-existing).
- Lesson baseline --all-lessons vs master 8a7c5d43: 1560/1596 identical; the 36 are g3-oa9-input-output-rule (the function
  table's vertical-align attribute) and its 23 pages are pixel-identical.
- Deploy-3: PR #43 (claude/sweet-newton-c8wrv1-lf-roles-deploy @ b25479c5), gates green on the deploy tree.
- r10 (244a84b6): Reason It A over B for any template whose true work width passes half the room; a column story prints once
  over A and B (word-work storyOnly / noStory, lf-builds' file); RI-DISTINCT; ws-precritic never pins an overflow; 3 ruled
  capacity pins. Backtest ri-overflow-stack PASS (34 OVERFLOW on b25479c5 -> 0). Passed RI pages: only the 3 that overflowed
  change. Compare at band 999999 stacks once pv supplies footprint.inkWMm (its wMm carries slack, so it is not trusted).
  F7 (an added answer under -): not reproducible on master (the sentence-layout change_unknown stories are on the
  lf-builds-stories branch; here add_wp_change_unknown deals a column sum). SIGNMATCH (RI + EA) 0 on the 5 story skills here;
  True or False? is not in SIGNMATCH's roles (a false statement may be any false sum) - lf-builds' wrongAnswer slots fix it at
  the source. F8 waits on a PT-RSN-4 ruling.
- r10 guided (8307219c): a Guided page of tightRows items keeps rows at their measured height (compare precritic r2 item 1).
  compare guided EB-BAND 46 -> 22 (rest: pv's measured height + its one-line hint row); expand / unit_form / combine guided
  EB-BAND 2 -> 0 (9 passed pages change). Backtest guided-tight-rows PASS. compare EA S: 0 now. compare Model EB-SIDE 5 = its
  beside step-text cells, which PT-MOD-5 excuses but ws-empty-band does not yet skip (lf-checks). Opener is not this lane's.

## Round 11 (2026-11-13; critic r6c FAIL -> fixes)
- Critic r6c (design/status/lf-roles/r6c/critic-r6c.md): Guided tightRows PASS; Reason It A over B FAIL - D1 one item a page
  (H5), D2 centred stack, D3 the stack fired on work that fits side by side. P1 (process): the pack's "before" (c8c81172)
  already held the change - every RI pair identical. Fix to the process: "before" is the parent of the lane's earliest commit
  in scope; a changed pair that is byte-identical stops the pack (r6d checked: 0 identical pairs).
- r11 (df83248e): A | B side by side over a full-width response row when the work fits half the cell; stacking (top start)
  only for wider work. F8 (lead ruling): "__ is correct." dropped, PT-RSN-4 amended. Word answers one 6-digit line (no
  length tell; "hundreds" fits). Checks RI-ONEANSWER, RI-LAYOUT, LINE-TELL (ws-roles-unit), KEYFIT (ws-cell-checks default);
  backtests ri-one-answer / ri-layout / line-tell / key-fit PASS. sub_1m RI M 2 (ruled; the pinned 3 overflowed), sub_100k /
  sub_1m L back to 2.
- F3 (lf-algebra r1, npr Model L 6 mm overrun): reproduced only in a PRINTED PDF at 47b1f2a86 (screen and emulated print media
  lay it out clean, so ws-cell-checks / ws-grade-render pass it); gone at this head (the Model is 2 pages, PDF checked). A
  check needs the PDF raster (as LP-RASTER does for lessons) - proposed to lf-checks via the lead.
- Critic r6d running on the r11 pages.

## Round 7 (2026-11-13, +$40; owner: keep going)
- R4 / N4: RULED capacities in capacity.json ('ruled', with reasons); ws-capacity-pin measures them when the skill is in the tree.
- N9 FIX-MINIMAL (25d7bf2f): compose.wrongOf keeps a list's FIRST error only (later parts follow the correct rule); 0 passed pages
  change; ws-roles-unit FIX-MINIMAL; backtest roles-fix-minimal.
- PUPILTAG on ink (b0efa7ee): 2-4 mm +/- 0.5 from the label's foot to the work's first ink; the work's first element loses its top
  margin and the label box sits 0.5 mm (S 1 mm) over it. 132 findings on deploy-2 -> 0 on 14 passed skills.
- R15 EA-ROWX (2d958ba1): one work width a page where planned widths differ; judgement x per column within 4 mm. FAIL 8 before ->
  0 on every passed skill. Word forms (number_word_form) still drift ~3.5 mm (text width on equal footprints) - under the 4 mm bar.
- CORRECTION to 2d958ba1's message: ws-capacity-pin is NOT 0 drops - placevalue:combine Independent / More Practice S 28 -> 27.
  The same drop is on master fb6528a9 (another lane's change since the pin on 5947159d; roles this lane does not touch) - routed
  to the lead: a regression the check caught, or an intended change to re-pin.
- Open: PUPILTAG still fires on function_table_easy EA M/L and number_patterns_rule EA (count-row / table first ink, lf-algebra
  cells); R13 Pre-skill Check; lf-algebra r8 role items (F3/F4, marksFor function-table, F5 traceSlots, level 1 vs 0, F8).

## Deploy (PR #42, claude/sweet-newton-c8wrv1-lf-roles-deploy): 8823e9a9 (critic r3) + SIGNMATCH d54d2850 + D6/N2/D7 5a46c6ee (critic r4 PASS)

## Round 6 (2026-11-13, +$35) - after the deploy branch (PR #42, claude/sweet-newton-c8wrv1-lf-roles-deploy @ 8823e9a9)
- D6: the "<Name> wrote:" label's foot 2 mm over its work at every size; PUPILTAG asks 1.5-8 mm (fired 144x on the fixed offset).
- N2: True or False? one-column S takes a 5th row (unit_form / expand S 4 -> 5); ws-capacity-pin SIZE-ORDER (S >= M >= L) added.
- D7: True / False boxes 10 mm off the statement's own tick column (pattern_features L, still 4 items).
- mult_facts Review with supports (print-lint supports S, 12 x 32 % side band on Mixed Review stacks): looks like the supports
  engine's reserved support room inside the earlier skill's stacks, not the Review grid - to verify with the S2 supports owner.
- Queued (lead 2026-11-13): PUPILTAG measured on ink, 2-4 mm (critic r4 n1); R4 / N4 capacity pins (ruled by design); FIX-MINIMAL (N9 ruled: one error an item); lf-algebra r8 role items (F3, F4, PT-MOD-1 marksFor function-table, F5 traceSlots, measure level 1 vs test level 0, teacher-preview F8).
- Open: R4 (fte TF L 2 items: tall table, likely a capacity ruling), R13 (Pre-skill Check strips / page 2), R15 (EA judgement x per
  item), N4 (Review totals < 8 on tall items: ruling), N9 (fix-minimal: design), npr TF M 4 -> 3. These pages need critic r4.

## Round 5 (2026-11-13, +$40)
- N3 (435052b9): Error Analysis item + judgement centred in a stretched cell; "<Name> wrote:" rides on its work. EB-BAND 16 -> 0 on
  the passed skills' EA; PUPILTAG extended (label <= 8 mm over its work: fires 28x on the unanchored state).
- Critic r3 (mq-opus-medium, 182 pages vs BEFORE): passed skills (set a) PASS, every role page 8/8/8/8 and BETTER than BEFORE except
  two pre-existing groups (unit_form TF S, N2; subtraction Model L, skill S1 lf-ops). changes FAIL: D1 rule span out of the Reason It
  cell, D2 items fell on npr / fgr / fte, D3 2-part answer unlabelled, D4 bare "Review" at every size; D5 RI list wrapped a blank a
  line; D6 label 1 mm over H T O (nit); D7 TF boxes beside the statement tick column (pf L).
- Fixed in 000f6eb5: D1, D2 (Reason It: S/M/L counts back to BEFORE), D3, D4, D5 - Reason It list answers print no frame (the named
  panel holds it, H16) - NEEDS LEAD RATIFICATION (PT-TOF-4 extended to Reason It lists).
- Open: npr True or False? M 4 -> 3 (6-part frame wraps); D6, D7; R4, R13, R15, N2, N4, N9; mult_facts Review supports side band.

## Round 4 (2026-11-13, lead +$40): fixes, checks first
| Finding | Fix (commit) | Check |
|---|---|---|
| N10 ruling | PT-ERR-4: grey pupil work always under "<Name> wrote:" | ws-cell-checks PUPILTAG (default rule, self-test) |
| N1 | count-row rule part named: "Answer: [ ], ... Rule: add [ ] each time." (3df2b556) | ws-roles-unit LIST-HOMOGENEOUS; backtest roles-list-rule-named |
| R2 | sentence-answer True or False? at L: True/False boxes beside the statement; pf L 3 -> 4 (S 6, M 4 kept) (3df2b556) | counts tool (alg skills are not pinned: not on master) |
| R5 | a True statement's key leaves the frame empty (PT-TOF-2); 75 passed-skill TF KEY pages change, pupil pages identical (3df2b556) | ws-roles-unit KEY-TRUE-BLANK; backtest roles-key-true-blank |
| N5 | one Review title at every size, decided at L (3df2b556); passed-skill reviews unchanged | ws-roles-unit REVIEW-MIXED (S case) |
| R10, R11 | Reason It: frames packed under the A/B ring; A/B block centred in a stretched cell; every passed skill's RI page changes (layout) | ws-empty-band EB-BAND 4 (master) -> 0; backtest roles-ri-band-passed |
- Proof: ws-lesson-baseline --all-lessons L,S seeds 4242,1 vs master: 1556/1556 identical; ws-capacity-pin 0 drops; ws-roles-unit 63 OK.
- Left for the next round: R4 (fte TF L 2 items), R13 (Pre-skill Check strips / page 2), R15 (EA judgement x), N2 (S = M capacity), N3
  (EA bands unit_form S/M), N4 (Review totals < 8), N9 (fix-minimal), mult_facts Review supports side band (0b); critic r3.

## Critic r2 (2026-11-13, mq-opus-medium, 116 pages): FAIL - 14 role findings (4 new: R2, N1, N5, N6; 10 pre-existing)
- FIXED and confirmed: R1, R3, R6-R8 (pf EA n/a by ruling), R9, R12 (closed by PT-MOD-5); unit_form Reason It S/M/L PASS 8/8/8/8 (was off
  the sheet); the 5 subtraction Model L 2 + 2 layout passes as a layout (C2 7 is the subtraction skill's missing step marks, lf-ops).
- NEW, mine, next: N1 number_patterns_rule list frame = 6 unlabelled blanks, the 6th is the rule (H16; check LIST-HOMOGENEOUS: label
  mixed parts from the item's slot ids, as EA does); R2 pf True or False? L holds 3 where 4 fit (the "Tall problems" class rule was sized
  with the frame row; re-measure without it; ws-capacity-pin to gain a RISE row); N5 Review L title bare "Review" while S/M carry the
  topic (PT-FRM-6); N6 "1 tens" (nit, unscored; plural kept on purpose: FIX-WORDS).
- PRE-EXISTING role findings, mine, next: R5 key fills the True items' frame (now visible on unit_form), R4 fte TF L 2 items, R10/R11
  Reason It frame distance and S bands, R13 Pre-skill Check strips (page 2 85 % blank), R15 EA judgement x, N2 S = M capacity on TF/EA
  S, N3 EA bands unit_form S 32 % / M 33 %, N4 Review total < 8 (growing 7/5/5), N9 list fix rewrites every term; precritic: mult_facts
  Review with supports S, Mixed Review stack cells 32 % side band (master-red, role changed: 0b).
- Lead ruling asked: N10 the pupil's work on Error Analysis prints in trace grey on every page (role convention): design or defect?
- Precritic reds on roles this lane did not touch, confirmed IDENTICAL on master 5947159d: dealer-uniform (mult_facts), spec-card
  (facts / subtraction cards), node-lint s1 (1), print-lint sections S 6 / L 4, print-lint lesson S ratchet (unit_form H13-ABS),
  coverage-matrix 6 unit_form single rows. print-lint supports S: 12, all on mult_facts Review (mine, above).

## Critic r1 (2026-11-13, mq-opus-medium, 82 pages before/after): FAIL
| Finding | What | Status | Check |
|---|---|---|---|
| R1 | pf True or False? said "Finish the sentence." with no frame | FIXED 300d0656 (true-false-judge line) | ws-roles-unit INSTR-FOLLOWS (new) |
| R2 | pf True or False? L 3 items, 20-26 % band | NOT CHANGED: 3 is the measured capacity before and after (Tall problems: 3 rows) - lead / critic to re-read | proposed CAPACITY-REPLAN |
| R3 | fgr True or False? L 4 -> 3 (list frame wrapped) | FIXED 300d0656 ("Answer:" stem; 4 again) | proposed CAPACITY-NO-DROP (counts per role x size vs the pinned BEFORE) |
| R6-R8 | EA sentence fix redrew the item (half the page, "write" verbs, copy geometry) | FIXED 300d0656: a sentence answer is fixed by checking a choice (q.options / word-choice payload); no choices -> item skipped; pf EA is "not available" until lf-algebra lists its choices | ws-roles-unit KEYJOIN-ROLE (EA cases) |
| R9 | growing Review L lost Mixed Review | FIXED 300d0656: "Review: <topic>" only when it measures one line, else "Review" (5 items with Mixed again) | ws-roles-unit REVIEW-MIXED (new) |
| R12 | fte Model L still the 2-page beside layout | OPEN: needs a lead ruling (below) | proposed MODEL-NO-HALF |
| R4, R5, R10, R11, R13, R15 | pre-existing role defects (TF L capacity, key fills True frames, RI frame distance / S bands, PSC strips, EA row x) | next round | named in critic-r1.md |
| S1-S7 | skill defects | routed by the lead | - |

## Precritic r1 (--skill sub_100_no_regroup,unit_form,mult_facts --strict; /tmp/mq-precritic/20261113-023539-22714)
- Red on a role this lane changed, FIXED: unit_form Reason It key overflow (render-gate 10, cell-checks 10; red on master too) -> 0
  (a unit-form answer a number a line, plural words; 120c00c6).
- Red on a role this lane changed, OPEN: ws-empty-band scripted-model (S 7, M 6, L 2) / guided S 7 on the passed skills: the
  beside layout's step-text column is mostly white by construction (master-red: 59 findings on sub_100 + value). Rule 0b blocks
  the critic here -> lead ruling below.
- Red on roles this lane did not touch (to be confirmed against a master run): coverage-matrix unit_form single rows, print-lint
  sections --pages 2 S/L, supports S, lesson S (unit_form H13-ABS 0 -> 2: lesson role, lf-engine), dealer-uniform, spec-card,
  node-lint LESSON-DATA, card-rulings INCOMPLETE.

## Fixes (commit: what, check)
| # | Commit | Fix | Check (backtest row) | Passed-skill pages |
|---|---|---|---|---|
| 1 | aa200514 | true-false / reason-it frame: a list answer one line a part (wraps), no frame for a sentence answer; EA: a sentence answer's fix is the item again (redo), never parts or a line | ws-roles-unit KEYJOIN-ROLE (roles-keyjoin-frame: FAIL 24 -> OK); ws-cell-checks KEYJOIN skips open zones (+ self-test) | 0 changed |
| 2 | 2a3ecb9c | review geometry budgets the printed "Review: <topic>" title, measured by the bridge (input.titleLinesOf); topicOf "draw and count" -> "drawing and counting" | ws-roles-unit REVIEW-TITLE (roles-review-title: FAIL 2 -> OK) | 0 changed |
| 3 | a55f373c | adapters.js legacy Answer line > 12 characters keeps to its cell (278 mm joined list off the sheet on Pre-skill Checks) | ws-cell-checks OVERFLOW on lf-algebra (no master fixture: needs the algebra skills) | 0 changed |
| 4 | 4e8eca14 (REVERTED: lf-checks ported it, fdf3af0f on their branch; measure with their tool until master has it) | ws-empty-band EB-FOOT pairs each cell with its own grid's column measure (gridCols / measuredAll) | lf-algebra pf independent M 5 -> 2 | tool only |
| 5 | 35c881b6 | scripted-model: a tall state whose beside layout needs 2 pages lays 2 + 2 on one page (the facts "across" layout) | ws-roles-unit MOD-ACROSS (roles-model-across: FAIL -> OK) | 5 INTENDED: sub_50/100/1k/10k no_regroup + sub_2d_1d Model L, two half-empty pages -> one 2 + 2 page |

## Red left, by owner
- **lf-roles (next)**: guided EB-BAND (notice 10, fte 6, growing 5, pf 2), error-analysis EB-BAND (fte 6, pf 3), reason-it EB-BAND
  (notice 2, fte 2, growing 1), pre-skill-check EB-SIDE (fte 4), scripted-model one-page models (notice 20, pf 4, fte 6).
- **lf-algebra**: notice cell's 2-column measure (61.2 / 55.7 mm vs 49.2 drawn: EB-FOOT 2); function-table Model states 1-3 draw
  the same blank table (no traced mark per state, PT-MOD-1 / MOD-MARKS class); the pattern_features skill's sentence choices are
  not in q.options (EA cannot offer them as a choice fix, so it redraws the item).
- **lf-ops**: count-row train in Reason It panels (npr / fgr reason-it OVERFLOW, unchanged by this lane).
- **lf-checks (tool owner)**: please review the EB-FOOT pairing change (fix 4) and the KEYJOIN open-zone rule (fix 1).

## Owner go

## Open questions
- Lead (0b): the Scripted Model BESIDE layout's text column fails EB-BAND / EB-SIDE on every passed skill (master-red). Options: (a) a
  PT-MOD-3-style ruling that the step-text cell of a beside Model is judged by its text, not by the band; (b) move every beside Model to
  text-over-state (changes every passed skill's Model page, a design change). Suggested: (a) for one-page Models, (b) only where the model
  spills to a second page (what fix 5 does).
- Lead (R12): function_table_easy Model L cannot fit 2 + 2 on one page. Options: keep beside over 2 pages (text column white), or 2 + 2
  split over 2 pages (one row a page, ~50 % fill). Suggested: keep beside and excuse under (a).
- Lead: fix 5 changes 5 passed skills' Model L pages (two half-empty pages -> one 2 + 2 page, the facts "across" layout). Suggested:
  accept as the fix (delegated approval 3a), critic on those 5 pages with the lane's critic round.
- Lead: PAGE_TYPES 6.1 / 6.2 amendment (proposed PT-TOF-4): a sentence answer prints no "The answer is ____" frame (the judgement is
  the answer; on Reason It "__ is correct" names it); a list answer writes one line a part. Suggested: accept.

## Times
Times: r6 (deploy branch, D6, N2, D7), start 2026-11-13T09:45Z, end 2026-11-13T10:50Z, profile lane session
Times: r5 (N3, critic r3, D1-D5), start 2026-11-13T08:15Z, end 2026-11-13T09:40Z, profile lane session
Times: critic r3, start 2026-11-13T09:05Z, end 2026-11-13T09:13Z, profile mq-opus-medium
Times: r4 (N10, N1, R2, R5, N5, R10, R11), start 2026-11-13T06:45Z, end 2026-11-13T08:10Z, profile lane session
Times: r3 (ws-capacity-pin, unit-form RI row, PT-MOD-5, critic r2, master comparison), start 2026-11-13T05:25Z, end 2026-11-13T06:40Z, profile lane session
Times: critic r2, start 2026-11-13T06:05Z, end 2026-11-13T06:13Z, profile mq-opus-medium
Times: fix r2 + r2b (critic r1 findings, precritic triage), start 2026-11-13T03:45Z, end 2026-11-13T05:20Z, profile lane session
Times: critic r1, start 2026-11-13T03:50Z, end 2026-11-13T04:00Z, profile mq-opus-medium
Times: fix 1-5 (checks first, hash proof), start 2026-11-13T01:35Z, end 2026-11-13T03:40Z, profile lane session

## Log
- 2026-11-13: fixes 1-5, 3 backtest rows, ws-roles-unit (new, node, 40 checks, ~1 s).
