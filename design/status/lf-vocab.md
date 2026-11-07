Lane: lf-vocab
Title: Vocabulary redesign (Match 3 pictures, 1 picture 3 words, lesson vocabulary page) for the CCSS BUILD lessons
Session: session_013pHDnPdbZEh2qA1Sgch4GR
Branch: claude/sweet-newton-c8wrv1-lf-vocab
Owner of files: sheet/graphics/vocab-pictures.js, sheet/cells/vocab-*.js, sheet/lesson-pages/vocab-*.js, sheet/providers/vocabulary.js, gen-vocabulary.js picture branch, design/cards/vocabulary/, design/lanes/lf-vocab/, tests/scripts/ws-vocab-unit.mjs
State: stopped (rule 5, critic r3 FAIL min 6); hand-over to the lead
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 3: r3 FAIL min 6, r2 FAIL min 7, r1 FAIL min 1 (report design/lanes/lf-vocab/critic-r3.md)

## Round 4 (2026-11-07, cap $35): critic r3 FAIL, min 6
- Done:
  - Match 3 guided overflow at S fixed with MATCH3_H / measure:false. Check first: the vocab-roles-render gate (guided,
    more-practice, error-analysis at S/M/L) is on precritic's path; it FAILed before the fix.
  - Master merged (47047a83, at 5cbe360d2 or later).
  - Precritic r6 --strict: sibling-compare FAIL (structural: first family) and one node-lint S-not-more. The node-lint
    finding is pinned because card Q2 rules Match 3 at 4 a page at every size (commit after ee2d33e7).
- Critic r3 (fresh, Opus medium; renders scratchpad critic4): FAIL, min 6.
  - At 8 or above: independent, more-practice and test on both skills at S/M/L with keys; card-390/820/1280 and quiz-1280;
    pick3 error analysis at S/M; grades 1 and 3; the pilot lesson at M/L.
  - Below 8: Match 3 guided at S/L (H13, 34-37 %); error-analysis pages (35-40 %); both worksheet-1280 hosts; the guided
    Score is not per word; the pick3 hint is ambiguous; pick3 guided rows at L; grade 4 lines too short; base-ten scales;
    grow/sequence; and the grade 1 and grade 4 lesson renders carry the pilot's frame (my render harness).
- Rule 5, survivors of 3 rounds:
  - the worksheet-1280 tile layout (r1 #10, r2 #7, r3 #4);
  - pick3 guided row equality (r1 #6, r2 #4, r3 #6).
- Root cause: the footprints are not the drawn heights per role, and no machine check measures H13 empty bands on guided,
  error-analysis or the worksheet hosts. So every critic is the first to measure them. The next builder writes those two
  checks first (LESSONS_LEARNED "lf-vocab critic r3").
- NOT added to redesign-passed.js. The manifest is restored (not applied) on the branch.
- Owner question: on Letter, Match 3 prints 3 a page (ctx.paper is not visible to footprint), against 4 on A4.

## Now
- Round 3 (fresh builder, rule 5; commits da010953 merge of master, 3d9939d8, cac85155, 43da709a): the five survivors each have
  a ws-vocab-unit check that FAILED on the r2 tree and passes now (V8 picture extent and text floor, V9 printed text / box / dot
  floors by grade and host, V10 footer tags, V11 score per word; guided rows equal on the render: 374 / 375 px), plus V12 / V13.
- Precritic r5 --strict: 3 FAIL / 21 PASS (2 baseline). coverage-matrix and slot-clip fail ONLY on single/layout-fact-rows rows:
  "Cannot access 'opEm' before initialization" - master's js/modules/sheet/roles/fact-rows.js (facts print r8, cdaa80fc) uses
  `opEm` at line 641 before its `const` at 654; every non-fact skill routed through fact-rows hits it (facts lane to fix).
  sibling-compare: first family on the template (lead's process rule: SKIPPED, critic grades the pages).
- BLOCKER found by the lane's r3 render (not on precritic's path): vocab_grade_pictures (Match 3) GUIDED at S overflows (4 rows,
  cells 3-4 a few mm over; the guided cells measure 40.4 mm but draw taller). A smaller guided picture did not fix it (reverted).
  So no critic r3 (rule 0b). The round's $60 cap is about spent.
- Still open from r2: Match 3 worksheet-1280 words wrap 2 + 1 (#7); pilot lesson Name-the-picture cells oversize (#6);
  grow / sequence look-alike (#3: set 7 needs grow redrawn or an owner call on its words).

## Owner rulings (2026-11-07, via the lead)
- Q-A additive footer hook: built (sheet/sheet-tags.js; items carry q.sheetTags; an item without it changes nothing).
- Q-B Letter at L, grades 2-3: 4 a page (A4 stays 6). Recorded; no gate measures Letter capacity, so no pin.
- Q-C score per word: Match 3 page /12 (template footprint `points`, paginate.js scorePoints).
- Q1 role:lesson out of scope for the two skills; Q2 4 / 6 / 8 a page (pinned in options-render.pins.json).

## Owner go

## Open questions
- Lead: who fixes master's fact-rows.js `opEm` order (facts lane)? Suggested: the facts lane, one line (move the `const opEm` above line 641).
- Lead: add guided / more-practice / error-analysis to precritic's render gate (LESSONS_LEARNED lf-vocab, last row)? Suggested: yes, the roles the card offers.
- Owner: set 7 (Extend growing shape patterns) keeps grow with sequence, or grow is redrawn so it cannot read as a sequence? Suggested: redraw grow.

## Round 3 (fresh builder, 2026-11-07)
| Survivor | Check (ws-vocab-unit) | Before (r2 tree) | After | Fix |
|---|---|---|---|---|
| S1 footer grade (r1 #14, r2 #1) | V10: footer meta of every set / grade page = the set's grade and CCSS; an untagged item leaves the meta alone | FAIL (no hook) | PASS | sheet/sheet-tags.js applySheetTags; gen-vocabulary q.sheetTags; print-sheet skillMeta (additive) |
| S2 grade-2 picture size (r1 #13, r2 #2) | V8: marks span >= 50 % of the drawing area both ways, text >= 7 canvas units; V9 (below) | FAIL (38 pictures) | PASS | pictures drawn CROPPED to their marks and fitted to a box as tall as before and as wide as the cell (Match 3 46-48 x 25-27 mm; pick3 76 mm wide); one, ten, number name, step, left, identity, round up redrawn |
| S3 guided rows unequal (r1 #6, r2 #4) | rendered guided S: rows 405 / 340 px before, 374 / 375 px after | FAIL | PASS (render) | footprint `evenRows` (opt-in, guided.js: every row the same share when it holds the tallest row); the pick3 cell fills a Guided row and its hint wrap |
| S4 grade-1 Match strips 11 pt (r1 #17, r2 #10) | V9: picture text at the width each cell draws it, every grade that deals the word, S/M/L: >= 16 pt K-1, >= 14 pt 2-5; boxes >= 4 mm; dots >= 2.5 mm | FAIL (241) | PASS | K-1 tracks 3 cells at 8.5 units; hundred chart 3 x 3; text 8-9 units library-wide; dots r 2 |
| S5 score /4 (r1 #18) | V11: 4 Match 3 cells score 12; 6 pick3 cells score 6 | FAIL (/4) | PASS | Q-C, above |

Other r2 defects: 1 look-alikes - round up / quotient added to notWith. grow / sequence and grow / pattern NOT added: pattern
and sequence already clash, so set 7 kept one clash-free split and printed 2 Match 3 cells a page (precritic r4); open for the
next round (redraw grow so it cannot read as a sequence, or an owner call on set 7's words). 2 dead hints - V12; step 1 now names a cue (pick3: the word's first
letter; Match 3: one word's meaning). 3 screen pills - font max(20px, ...). 5 error-analysis wrong word - V13; a misspelling of the
word (M-V4). 7 pictures below 8 - redrawn (ten, one, number name, round up, identity, step, left). NOT done: 4 (Match 3
worksheet-1280 word wrap 2 + 1: a container-query attempt collapsed the tiles, reverted; the r2 tile layout is unchanged), 6
(pilot lesson "Name the picture" cells: the pictures are larger now, the cell height is unchanged).

## Precritic r4 / r5 (round 3; manifest applied in the working tree)
- r4 (/tmp/mq-precritic/20261107-174230-8558): 4 FAIL - options-render and slot-clip (Match 3 pictures 2.4-2.6 mm out of the
  cell at grades 1-2, pick3 grade 2 a "7" 0.4-1.7 mm out, set 7 37-41 % empty) fixed in cac85155; options-render re-run OK.
- r5 (/tmp/mq-precritic/20261107-181426-9734): 3 FAIL / 21 PASS (2 baseline) / 3 N/A / 2 skipped of 29.
  - ws-coverage-matrix and ws-slot-clip: ONLY the rows single/layout-fact-rows, ERROR "Cannot access 'opEm' before
    initialization" in sheet/roles/fact-rows.js factRowsLayout (line ~641 uses opEm, declared at ~654). That is master's code
    (facts print r8, cdaa80fc), not this lane's: every non-fact skill on the fact-rows layout hits it. For the lead / facts lane.
  - ws-sibling-compare: structural (no approved sibling for a new family), as in r3.

## Rule 5 root causes (defects that survived r1 and r2) and the checks to write
| Defect | Root cause | Machine check to write |
|---|---|---|
| Footer grade wrong on grades 1, 2, 4 (r1 #14) | the footer reads SKILL_STANDARDS of the skill, not the dealt option's word set | page-lint: the footer's CCSS grade equals the dealt items' grade (q.vocabWords -> VOCAB_SETS grade) |
| Grade 2 pictures too small (r1 #13): ten rod 3.4 mm tall, "one" a lone 12 mm square, text pictures 10-12 pt | pictures are designed on a fixed 60 x 40 canvas; thin or text-only pictures use a small share of it, and grades 2-3 draw them at 38 mm | ws-vocab-unit V8: every picture's drawn extent covers >= 50 % of the canvas in BOTH directions, or the picture declares a minimum width; every text >= 7 canvas units (16 pt at 40 mm) |
| Guided rows unequal / 38 % band (r1 #6) | the guided role's grey hint line exists in one cell only, so its row is taller | role lint: rows of one section within 2 mm; hint slot reserved in every cell (role guided, shared) |
| Grade 1 lesson Match strips small (r1 #17) | Match 3 pictures are 38-40 mm at every grade; K-1 three-digit strips print at 11 pt | ws-vocab-unit V9: Match 3 picture width by grade class (K-1 >= 52 mm) and a K-1 Match 3 page of 3 a page (owner count question) |
| Score /4 vs 12 boxes (r1 #18) | the page scores items | owner question Q-C |

## Other r2 defects (one round old; for the next builder)
1. Look-alikes: grow/sequence, round up/quotient (redraw round up without the "4", or add notWith).
2. Guided hints repeat the instruction ("Look at the picture."): name the cue (provider workedSteps step 1 text).
3. Screen bank pills about 13 px on worksheet / quiz 1280: pill text >= 20 px.
4. Match 3 worksheet-1280: words wrap 2 + 1 in some cells, one a row in others: a fixed word column.
5. Picture-task error-analysis wrong words are not real mistakes ("left" for equal groups): take the wrong word from notWith look-alikes, a same-first-letter word or a misspelling.
6. Pilot lesson "Name the picture" cells about 95 x 105 mm for a 30 mm picture: size cells to content or use the grade's page-fill picture.
7. Pictures below 8 in the library: ten, one, number name, round up, grow, identity (ringed dot shared with odd / one more / remainder), step, left.

## Times
Times: builder r3 (fresh, rule 5), start 2026-11-07T17:15Z, end 2026-11-07T18:10Z (approx.), profile mq-opus-medium
Times: critic r2, start 2026-11-07T09:47Z, end 2026-11-07T09:52Z, profile mq-opus-medium
Times: builder fix r2 (critic r1 fixes), start 2026-11-07T09:10Z, end 2026-11-07T09:46Z, profile mq-opus-medium
Times: critic r1, start 2026-11-07T08:58Z, end 2026-11-07T09:04Z, profile mq-opus-medium
Times: builder r2 (precritic r1 fix list, owner rulings, Q4), start 2026-11-07T07:58Z, end 2026-11-07T08:56Z, profile mq-opus-medium
Times: builder build 1, start 2026-11-07T06:48Z, end 2026-11-07T07:37Z, profile mq-opus-medium

## Precritic r3 (final; manifest applied in the working tree; logs /tmp/mq-precritic/20261107-092904-29458)
| Gate | Result |
|---|---|
| ws-node-lint, ws-code-snapshot, ws-visual-quality, ws-vocab-unit (new, on precritic's path), ws-node-lint LESSON-DATA/OPTION-HELP/WRONG-FITS, ws-spec-card --check-signed, ws-lessonfit, ws-options-verify, ws-presets-unit, ws-print-lint kit S/M/L, ws-screen-slots, ws-grade-render --gate, ws-screen-answer, ws-coverage-matrix, ws-boot-smoke, ws-chromebook-fit, ws-phone-card, ws-options-verify --render, ws-slot-clip | PASS (21) |
| ws-print-lint --roles lesson L / S | PASS (baseline): the two skills' own lesson packets pinned, role:lesson out of scope by the owner's ruling Q1 |
| ws-sibling-compare | FAIL: 28 counts unproven (no approved sibling for a new family) |
| ws-providers-unit, ws-content-audit, ws-dealer-uniform | N/A |
| ws-card-rulings x2 | SKIPPED (no rulings) |
Also run: ws-standards, ws-search-terms, ws-redesign-passed, ws-wrm-page-unit, ws-lesson-coverage, ws-lesson-unit OK; ws-backtest --row vocab-sets-split OK.

## Registry and shared-file edits (for the lead's merge)
- Manifest design/lanes/lf-vocab/manifest.json (mergeOrder 70): vocabulary:vocab_grade_pictures (code VS, the Match 3 skill) and the preset vocabulary:vocab_pick3_words (code VZ, vocabTask pick3), CCSS 3.OA.D.9 / 3.OA.B.5 / 3.OA.D.8 + M.EE.3.OA.8, terms, provider ./vocabulary.js. NOT applied on the branch: apply it before ws-lesson-coverage (lessons/families/multdiv.js and links name the two skills).
- Append-only / small shared edits: sheet/index.js (exports + 2 template ids), graphics/index.js, contract.js (2 instruction keys + 1 screen-verb phrase), lesson-pages/index.js (registerLessonPart(VOCAB_PAGE_PART)), skill-options.js, skill-option-keys.js (6C 6D 6E), lessons/families/multdiv.js (2 routines, 2 lessons), roles/error-analysis.js (1 partLabels rule for vocab-match3), ws-precritic.cjs (the vocab-unit gate, own block), backtests.json (1 row), options-render.pins.json (owner-ruled capacity Q2), print-lint baselines L / S (the two lesson documents, Q1), GRAPHIC_LIBRARY.md (new section), speed-audit.md (per-round rows).
- data/curriculum/links: the 11 round-1 BUILD lessons get `related` vocab_grade_pictures and vocab_pick3_words with {vocabSet: n} (Y2, Y3, Y4, Y5).
- Q3 (part order: vocab-page should open the packet) is with lf-engine.

## Rule 00 lists
In design/status/speed-audit.md "Lane lf-vocab" (precritic r1, r2, critic r1). Critic r2: (1) checks: V8 picture extent and text floor, footer-grade lint, guided row-equality lint, a screen bank-text floor (>= 18 px), V-EA wrong word from notWith / misspelling; (2) speed-ups: grade every grade band on one page per round (one seed), and run the guided role in the local loop (it hid two survivors).

## Cost
The lead reported $24.95 (~1.25 %) at 07:58Z. This container shows no cost_usd. Estimated since then from the work (two fix rounds, two critics of about 200k tokens each, three precritic runs): about $70-90 in total (~3.5-4.5 % of the weekly limit). Cap $150. The lead should read the session record for the real figure.

## Log
- 2026-11-07: round 3 fresh builder (rule 5): merged master; checks V8-V13; the five survivors fixed; Q-A / Q-B / Q-C built or recorded.
- 2026-11-07: critic r2 FAIL min 7 (from min 1). Stopped under rule 5 (five survivors). Hand-over to the lead.
- 2026-11-07: critic r1 fixes: error analysis on both tasks, one-word-a-line bank, fixed answer place, screen picture floor, look-alike pairs, redrawn pictures. Precritic r3: 1 FAIL (sibling-compare).
- 2026-11-07: owner signed the card (Q1, Q2 rulings); r2: per-grade picture cell (4 / 6 / 8 a page measured on A4), 3-step charts, ws-vocab-unit on precritic's path with a backtest row. Precritic r2: 1 FAIL.
- 2026-11-07: build 1; precritic r1 7 FAIL.
