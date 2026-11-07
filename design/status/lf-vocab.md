Lane: lf-vocab
Title: Vocabulary redesign (Match 3 pictures, 1 picture 3 words, lesson vocabulary page) for the CCSS BUILD lessons
Session: session_013pHDnPdbZEh2qA1Sgch4GR
Branch: claude/sweet-newton-c8wrv1-lf-vocab
Owner of files: sheet/graphics/vocab-pictures.js, sheet/cells/vocab-*.js, sheet/lesson-pages/vocab-*.js, sheet/providers/vocabulary.js, gen-vocabulary.js picture branch, design/cards/vocabulary/, design/lanes/lf-vocab/, tests/scripts/ws-vocab-unit.mjs
State: fix
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 2, FAIL min 7 (r1 FAIL min 1)

## Now
- Stopped under rule 5: five defects survived two critic rounds at medium (r1 #6, #13, #14, #17, #18). Their root causes and the checks to write are listed below. The lead decides the next builder.
- Critic r2: FAIL, min 7, no hard cap; every failed score is a 7, so a Q-S2 near-miss re-check is allowed. These groups score >= 8: Match 3 independent, more-practice, test, error analysis, card-390/820/1280, quiz-1280; picture task independent, more-practice, test, all three cards; the grade-3 page.
- Precritic r3 --strict: 1 FAIL / 23 PASS (2 on the baseline) / 3 N/A / 2 skipped of 29. The one FAIL is ws-sibling-compare: a new family has no approved sibling, so its 28 page-balance counts (mixed-section rows) read "unproven".
- Card signed by the owner on 2026-11-07 (commit 7293673d); --check-signed OK.

## Owner go

## Open questions
- Q-A. Footer grade (r1 #14, r2 #1): the footer prints the SKILL's tags (grade-3 pool: 3.OA.D.9) on grade 1, 2 and 4 pages. Suggested: the page footer reads the dealt word set's grade and CCSS (vocab-words.js VOCAB_SETS[i].ccss). This needs a hook in print-sheet's footer (shared) or per-option standards. Lead's call: which lane builds it?
- Q-B. Letter paper at L: grades 2-3 print 4 a page, not 6 (A4 gives 6 at S/M/L). Suggested: accept for Letter (the school prints A4), or let the picture shrink to 34 mm on Letter only.
- Q-C. Match 3 score "/4" on a page of 12 letter boxes (r1 #18): the score counts items. Suggested: keep items as the score unit (owner's sample pages score problems, not boxes), or have the engine score boxes for this template.

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
- 2026-11-07: critic r2 FAIL min 7 (from min 1). Stopped under rule 5 (five survivors). Hand-over to the lead.
- 2026-11-07: critic r1 fixes: error analysis on both tasks, one-word-a-line bank, fixed answer place, screen picture floor, look-alike pairs, redrawn pictures. Precritic r3: 1 FAIL (sibling-compare).
- 2026-11-07: owner signed the card (Q1, Q2 rulings); r2: per-grade picture cell (4 / 6 / 8 a page measured on A4), 3-step charts, ws-vocab-unit on precritic's path with a backtest row. Precritic r2: 1 FAIL.
- 2026-11-07: build 1; precritic r1 7 FAIL.
