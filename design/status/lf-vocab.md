Lane: lf-vocab
Title: Vocabulary redesign (Match 3 pictures, 1 picture 3 words, lesson vocabulary page) for the CCSS BUILD lessons
Session: session_013pHDnPdbZEh2qA1Sgch4GR
Branch: claude/sweet-newton-c8wrv1-lf-vocab
Owner of files: sheet/graphics/vocab-pictures.js, sheet/cells/vocab-*.js, sheet/lesson-pages/vocab-*.js, sheet/providers/vocabulary.js, gen-vocabulary.js picture branch, design/cards/vocabulary/, design/lanes/lf-vocab/, tests/scripts/ws-vocab-unit.mjs
State: fix
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 0, none (precritic red: no critic run, rule 0b)

## Now
- Built: 47 library pictures, 11 lesson word sets (round 1, pilot unit G3-Y4.B4 first), cells vocab-match3 / vocab-pick3, lesson part vocab-page, host skill + 1 preset, card (all lines decided), links, lesson data.
- Precritic r1: 7 FAIL / 15 PASS of 28. After 3 fixes, ws-screen-answer is now OK. Still red: the skill's OWN lesson packet (anchor chart), grade-4 picture items (6 a page, not 8), and two gates with no sibling or with an environment-side cause (below).
- Stopped at the budget stop point (README rule 11) before any critic round. Next: fix round r2 (list below), then precritic, then the critic.

## Owner go

## Open questions
- Q1. A vocabulary skill's OWN lesson packet (anchor chart, guided, practice) fights the chart engine: a full-width picture cell in step panels. Should the two vocabulary skills take role:lesson = "out of scope" (their lesson IS the vocab-page part inside the BUILD lesson)? Suggested: yes; record it on the card and pin LESSON-DATA / lesson print-lint for these two skills only.
- Q2. ws-options-verify --render counts the owner's K-1 page (4 a page) as items lost against the default of 6 (H13 "capacity"). Suggested: a card ruling that the 4 / 6 / 8 counts are the owner's, then a rulings-aware exemption in that gate.
- Q3. The lesson part prints LAST in the packet: print-sheet.js pushes registered lesson-role parts after Mixed. The part is registered with order 7 (an opening page). Suggested: lf-engine sorts `parts` by registry order (one line in buildLesson).
- Q4. Screen Match 3: the pupil types the letter (the paper response). A tap row A / B / C under each word could come later. Suggested: keep typing.

## Times
Times: builder build 1, start 2026-11-07T06:48Z, end 2026-11-07T07:37Z, profile mq-opus-medium

## Precritic r1 (vocabulary:vocab_grade_pictures, vocabulary:vocab_pick3_words; on the branch with the manifest applied in the tree; logs /tmp/mq-precritic/20261107-071928-24670)

| Gate | Result | Note |
|---|---|---|
| ws-node-lint, ws-code-snapshot, ws-visual-quality, ws-node-lint LESSON-DATA/OPTION-HELP/WRONG-FITS, ws-lessonfit, ws-options-verify, ws-presets-unit, ws-print-lint kit S / M / L, ws-screen-slots, ws-coverage-matrix, ws-boot-smoke, ws-phone-card, ws-slot-clip | PASS (15) | LESSON-DATA was red in a first run; fixed by lesson data (lessons/families/multdiv.js) |
| ws-providers-unit, ws-content-audit, ws-dealer-uniform | N/A | nothing to check for these skills |
| ws-card-rulings x2, ws-spec-card --check-signed | SKIPPED / INCOMPLETE | the card is fully decided; only the owner's signature is missing (owner waived sign-off on 2026-11-07) |
| ws-screen-answer | FAIL, then OK on re-run | the Match 3 letter boxes kept digits only; fixed (data-mq-kind="word") |
| ws-print-lint --roles lesson L / S | FAIL (still red after the fix) | the skills' OWN lesson packet: the Match 3 / picture cell in anchor-chart step panels overflows (15-30 mm), text overprinted; warm-up mult_facts cells font-weight 900 (engine); page density on the lesson practice pages. See Q1 |
| ws-grade-render --gate | FAIL | the same lesson-packet overflow (60 findings) + 3 small targets |
| ws-sibling-compare | FAIL | 40 counts "unproven": a new family has no approved sibling |
| ws-chromebook-fit | FAIL | every host FITS at 1366x650 and 1280x600; the FAIL is aborted module loads on navigation (requestfailed lessons/*.js), not a fit finding |
| ws-options-verify --render | FAIL | grade 4 (vocabSet 6-10, vocabGrade 4): the bank stacks two-word phrases, cells grow, 6 a page not 8, 35 % band (H13); K-1 4 a page counted as lost capacity (Q2) |

Other gates run: ws-standards OK, ws-search-terms OK, ws-code-snapshot OK (+2 codes VS VZ), ws-redesign-passed OK, ws-wrm-page-unit OK, ws-wrm --report-only (FAIL by design), ws-lesson-coverage OK, ws-lesson-unit OK, ws-vocab-unit OK (new; it FAILED on the earlier states: 7, 5, 2 findings), ws-spec-card --check-signed (only the signature missing), ws-integrate --apply --preview OK. Not run: ws-detailed-lesson --check --repeats (budget; no passed lesson names a vocabSet, so the vocab-page part does not print in lessons 1-6), ws-precritic --role lesson, ws-backtest. ws-spec-card --index --check reads stale on the base tree: not this lane.

## Fix list for round r2 (Opus medium; a failed round's rebuild)
1. Grade 4-5 picture cell: the bank goes to two balanced lines (never three); picture 30 mm; check 8 a page at S / M / L on A4 and Letter.
2. Pick cell sizing: drop the min-height and size by content. The fixed min-heights gave H13 bands wherever the engine rows were taller.
3. Decide Q1. If role:lesson stays offered, the chart needs a single-panel mode for a full-width drawing (lf-engine).
4. Register ws-vocab-unit on precritic's path with a backtest row (ws-precritic-plan is a shared file: through the lead).
5. Then precritic --strict green, then the independent critic (brief: scratchpad design/lanes/lf-vocab/critic-brief.md).

## Registry and shared-file edits (for the lead's merge)
- Manifest design/lanes/lf-vocab/manifest.json (mergeOrder 70): vocabulary:vocab_grade_pictures (code VS) and the preset vocabulary:vocab_pick3_words (code VZ, vocabTask pick3), standards 3.OA.D.9 / 3.OA.B.5 / 3.OA.D.8 + M.EE.3.OA.8, search terms, provider ./vocabulary.js. Not applied on the branch. NOTE: lessons/families/multdiv.js and links reference these skills, so ws-lesson-coverage needs the manifest applied.
- Append-only edits: sheet/index.js (2 exports + 2 template ids), graphics/index.js (1 export), contract.js (2 instruction keys + 1 screen-verb phrase), lesson-pages/index.js (1 import + registerLessonPart(VOCAB_PAGE_PART)), skill-options.js (the picture options + 1 line in ownOptionsFor), skill-option-keys.js (6C 6D 6E, tokens), lessons/families/multdiv.js (2 routines, 2 lessons), GRAPHIC_LIBRARY.md (new section).
- data/curriculum/links: Y2 G1|-|countonto120; Y3 G2|-|readandwritenumbersto1000...; Y4 the four G3 BUILD lessons; Y5 the five G4 BUILD lessons. In each, `related` gets vocab_grade_pictures and vocab_pick3_words with {vocabSet: n}.
- Retired idea: a preset vocab_match3_pictures (code VY) was dropped before merge. ws-presets-unit fails a preset whose values equal the host default, so the host IS the Match 3 skill. VY was never applied anywhere.

## Rule 00 lists (precritic r1; no critic round)
Automatic checks that caught or would catch each finding:
- Letter boxes kept digits only: ws-screen-answer (caught).
- Words repeated on one page, look-alike words together, a set that cannot split into two trios: ws-vocab-unit V3-V7 (new, caught on build).
- Picture overlapping letters in a narrow panel: print-lint ILLEGIBLE / OVERFLOW (caught).
- Grade-dependent page counts: ws-options-verify --render (caught grade 4). A per-grade count check in ws-vocab-unit would catch it in node.
Speed-ups:
- Render the skill's OWN lesson role on the first local render, not only the practice pages. The lesson packet was the most expensive surprise.
- Run ws-options-verify --render (every option value) before precritic. The per-grade layouts are option-driven.
- For a new cell, decide role:lesson on the card BEFORE building the lesson data.

## Cost
This container does not expose session cost_usd. Estimated from the work done, ≈ $110-125 (≈ 5.5-6 % of the weekly limit at $20 ≈ 1 %). Cap $150; stopped at the 80 % point. The lead should read the real figure from the session record.

## Log
- 2026-11-07: build 1 (pictures, word sets, cells, lesson part, skills, card, links, lesson data); precritic r1 7 FAIL; fixes: screen letters (now OK), one-column chart + routine-aligned worked steps, picture scales to its host; stopped at the budget point before the critic.
