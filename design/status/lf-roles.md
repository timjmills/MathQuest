Lane: lf-roles
Title: Lessons-first wave 2: the shared page roles (true-false, reason-it, error-analysis, review, pre-skill-check, scripted-model, guided, test) and their helpers
Session: session_013pHDnPLFmXnUHxE1xyq1rZ
Branch: claude/sweet-newton-c8wrv1-lf-roles
Owner of files: js/modules/sheet/roles/{true-false,reason-it,error-analysis,review,pre-skill-check,scripted-model,guided,test,compose}.js, sheet/adapters.js stamp(), tests/scripts/ws-roles-unit.mjs
State: fix (critic r1 FAIL; r2 fixes in, critic r2 waits on lead rulings)
Updated: 2026-11-13
Builder profile: lane session (no sub-agent builder)
Critic rounds: 1, r1 FAIL (14 role findings, 8 caused by this lane; report scratchpad critic-r1.md, summary below)

## Now
- 5 fixes pushed, each with its check first (FAIL on master eef75f5, OK on the fix); 780 passed-skill pages (26 skills x 10 roles x
  S/M/L, pupil + key) byte-identical to master except 5 INTENDED Model L pages (fix 5, needs a lead decision + critic).
- Cleared on lf-algebra 2a7e74b9 + this branch: KEYJOIN 0 on 6 skills x true-false / reason-it / error-analysis / pre-skill-check;
  OVERFLOW 0 on review (growing L), pre-skill-check (pf, growing), true-false M (pf); EB-FOOT 5 -> 2; role empty bands 86 -> 72.
- Proofs: ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --check vs master eef75f5: 1556/1556 identical;
  ws-boot-smoke OK; ws-cell-checks --self-test OK; the 3 backtest rows OK.
- Next: guided / EA / reason-it / pre-skill-check empty bands (72 left, list below); clean precritic on 3 skills a role; critic.

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
| 4 | 4e8eca14 | ws-empty-band EB-FOOT pairs each cell with its own grid's column measure (gridCols / measuredAll) | lf-algebra pf independent M 5 -> 2 | tool only |
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
Times: fix r2 + r2b (critic r1 findings, precritic triage), start 2026-11-13T03:45Z, end 2026-11-13T05:20Z, profile lane session
Times: critic r1, start 2026-11-13T03:50Z, end 2026-11-13T04:00Z, profile mq-opus-medium
Times: fix 1-5 (checks first, hash proof), start 2026-11-13T01:35Z, end 2026-11-13T03:40Z, profile lane session

## Log
- 2026-11-13: fixes 1-5, 3 backtest rows, ws-roles-unit (new, node, 40 checks, ~1 s).
