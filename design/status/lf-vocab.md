Lane: lf-vocab
Title: Vocabulary redesign (Match 3 pictures, 1 picture 3 words, lesson vocabulary page) for the CCSS BUILD lessons
Session: session_013pHDnPdbZEh2qA1Sgch4GR
Branch: claude/sweet-newton-c8wrv1-lf-vocab
Owner of files: sheet/graphics/vocab-pictures.js, sheet/cells/vocab-*.js, sheet/lesson-pages/vocab-*.js, sheet/providers/vocabulary.js, gen-vocabulary.js picture branch, design/cards/vocabulary/, design/lanes/lf-vocab/, tests/scripts/ws-vocab-unit.mjs
State: PASSED (critic r5 PASS min 8, 2026-11-09); r7 owner additions R-1 / R-2 built, awaiting the narrow critic; deploy waits for lessons-phase0 on master
Updated: 2026-11-09
Builder profile: mq-opus-medium
Critic rounds: 5: r5 PASS min 8 (design/lanes/lf-vocab/critic-r5.md); r4 FAIL 6, r3 FAIL 6, r2 FAIL 7, r1 FAIL 1

## Round 9 (2026-11-12, builder, Opus medium: rebuild after the narrow critic FAIL r7, plus the merge-induced precritic FAILs)
Brief design/lanes/lf-vocab/r9-builder-brief.md. Base 6de6aabd. One line per item, pushed after each.
- Item 1 (pre-skill-check overflow S/M/L, both skills): the check tested the four skills data.js lists before the vocab skills
  (Grade 6 definition matching, legacy cells 116 mm and clipped). New optional contract member `preSkills` (contract.js), read
  by roles/pre-skill-check.js sources; the vocabulary provider's vocabPreSkills names 1-2 picture tasks under it (Match 3 g:
  1 picture 3 words on the same words + Match 3 a grade down; 1 picture 3 words g: the same task 1 and 2 grades down; grade 1
  checks itself). ws-grade-render --roles pre-skill-check --size S,M,L --gate: 72 overflow findings -> OK (1 page each).
  Check V26 (node, ws-vocab-unit).
- Item 2 (guided S vocabSet 8 overflow): the Guided page split its rows by measured height (a flat-picture row measured 32 mm
  got 45 mm; the cell draws 47). vocab-match3 footprint `evenRows: true` (read only by guided.js): every row one share.
  ws-cell-checks --card --card-opts match3: 8 OVERFLOW -> OK (216 pages). Check: the render gate row vocab-r9-guided-s-set8.
- (lead merged master d34311d5 at 7e09577a; resumed there.)
- Item 3 (print-lint --kind sections L-DENSITY DN-2 / LONE / PAGEFILL at S and L): on a page shared by two skills, Match 3's
  half share (99 mm at S) held one 55 mm row, drawn as one tall cell alone on page 1. print-sheet.js shareRows: a member whose
  footprint opts in (`wholeRows`, vocab-match3 only, so no other template's page changes) takes one more whole row from the
  others' spare room when they keep their rows. print-lint sections S and L: 4 findings each -> OK. Check: row vocab-r9-sections-density.
- Precritic --strict on bbd73b28 (manifest applied): 31 PASS, 4 FAIL - sibling-compare (structural, allowed), ws-empty-band and
  --slot-ink off EB-GDPCAP (master's new rule: Match 3 Guided 15 / 15 / 12 scored tries over the 10 / 8 / 6 ceiling), and
  vocab-unit-browser V23 (the 6 Guided pupil pins moved with item 2's evenRows, intended). Items 1-3's gates all PASS.
- Item 3b (EB-GDPCAP): guided.js counts a cell's `points` against the ceiling (Match 3 holds 3 / 2 / 2 tries + the Model at
  S / M / L), and a one-column points template drops a continuation page that would hold one cell alone (L-LONE). Both
  empty-band modes OK; grade-render guided S/M/L OK (1 page each); the 6 Guided pupil pins re-taken (only those changed),
  ws-vocab-unit --browser OK. Check: row vocab-r9-gdpcap.
- Items 4 + 4b (one commit: ws-next-box carries both checks). 4 (critic r7 #1): markVocabFeedback marks every wrongly
  matched Match 3 letter box wrong (markBoxSubmitted) on every host, so the quiz shows red there and R4-3 keeps the blue ring
  off it. 4b (lead default, critic r7 note 2): the pick3 answer LINE carries the O-1 next outline (same --mq-next-* switch,
  additive css/screen-cell.css) before an answer on card / worksheet / quiz, none after a tap or once judged; pills plain.
  Checks NB6 / NB7 (ws-next-box, on precritic's path): quiz-wrong C:red A:red B:red; line before = switch blue, after none.
  ws-next-box (default, 13 hosts) OK. Rows vocab-r9-nb6-quiz-red, vocab-r9-nb7-pick3-line.
- Items 5 + 6 (one commit: vocab-words.js / vocab-pictures.js / ws-vocab-unit carry both).
  5 (O-3, critic r7 #6): vocabPictureDerived(id) reads each picture's own drawing ("=" -> equation; a number run of one step
  -> pattern, sequence, multiple; a heavy outline round 2+ numbers -> column / row; a crossed or lone ringed mark -> left; a
  loop of 3+ arrow heads -> pattern); vocabPictureAlsoShows = derived + the hand list (an extra; array + row, column).
  V-AMBIG+ fails every same-grade pair compatible() allows: it found exactly the critic's table (16 pairs + array). Resolved
  by notWith: odd/left, row and column / multiple, pattern, input and output / column, array / row, column, cycle / pattern,
  term and first term / multiple, pattern, product, factor, unknown, quotient / equation. Three sets lost their two-trio
  split (V7) and changed one word in place: G4 growing shapes pattern -> total, G4 follow a rule pattern -> output, G4 times
  as many equation -> total. Odd's explanation no longer names "left" ("one dot has no partner").
  6 (minors, critic r7 #3-#5): key dot underlays that would overlap merge into one rounded underlay per group (equal groups:
  3, not 12); pick3 "Here is how" says "Tap <word>." (vocabHowSteps, the screen verb); "4 dots in each", "3 times as long as
  the other". Check V27 (node): no two key dot underlays overlap; the pick3 step uses the screen verb; a grammar list.
  Gates: ws-vocab-unit OK; --browser OK after the 36 pupil pins the new deals moved were re-taken (only V23 pins changed);
  boot-smoke OK. Rows vocab-r9-v-ambig-plus, vocab-r9-v27-minors.
- Final ws-precritic --strict on e06ba713 (manifest applied): 34 PASS (3 on the baseline), 4 N/A, 1 SKIPPED (no rulings),
  1 FAIL = sibling-compare only (structural, allowed by the brief). Every r9 backtest row PASS (fail on its failing commit,
  OK on the fix); the NB6 / NB7 rows run the default ws-next-box, which precritic runs as gate next-box (its vocab block).
  Not done: no critic run (brief). Open for the lead: Match 3 Guided at L now holds the Model + ONE try (6 scored tries
  cap / 3 a cell, and no lone continuation page) - PT "Model + three tries" and the 10 / 8 / 6 ceiling conflict for a
  three-answer cell; the G4 set edits (pattern -> total / output, equation -> total) change those lessons' vocabulary pages.

## Round 8 (2026-11-12, builder, Opus medium: rebuild after the narrow critic FAIL min 7, plus owner O-1 / O-2 / O-3)
Brief design/lanes/lf-vocab/r8-builder-brief.md. Base 3d90097d. One line per step, pushed after each.
- Step A (O-1): the next answer box is a 4 px blue ring (#1565d8) pulsing an inner ring rgba(21,101,216,.30) on white, on
  card / worksheet / quiz, every skill, behind ONE switch (css/screen-cell.css :root --mq-next-*; html.mq-next-yellow restores
  the yellow, one line in index.html). Wrong stays red (R4-3 restated), reduced motion static. Check ws-next-box (NB1-NB5,
  new, on precritic's vocab path): FAIL 32 on 3d90097d, OK after.
- Steps B + C code (one commit: the files overlap): Match 3 wrong line "<Word> is picture <L>! ...", only the wrongly matched
  pictures glow with their letters lit; the vocabulary "Here is how" (no definition / first-letter rung, names the answer) inside
  the explanation on every wrong card, the support ladder's worked box / extra / "Not yet" hidden under it; pick3 wrong line
  box-wrong; key halo = unstroked grey underlays for labels and dots (V22+); explain rewording + HARD_WORDS (V24+); step = a
  two-step worked problem (Step 1 / Step 2 underlined heavy), digit = 472 with the 7 ringed and an arrow, lesson-band 'place'
  = H T O chart with T shaded, identify 'ones' = a ten and four ringed ones; V-AMBIG (library 47 + lesson bands). Pupil hash
  pin re-taken (the redraw and the step / count on / repeat / hundred notWith change the deals; owner O-2 / O-3).
- Step C gates: ws-lesson-baseline --all-lessons (base written on 3d90097d, checked on head): 161 of 1692 differ, ONLY the
  redrawn vocab cells - placevalue:identify / value / expand / combine page 2 (the band page) pupil + key, g2-nbt3 p06/p08/p18/p29
  (its digit / place pictures), and the two vocabulary skills' own pages (step / digit drawings, deals). ws-detailed-lesson
  g2-nbt3 --check OK, --repeats OK (70 places, 0 findings). EB-VOCAB PASS on the four pv lessons. PNGs in design/status/lf-vocab/r8.
- Final gates (manifest applied): ws-vocab-unit OK, --browser OK; ws-next-box OK; ws-empty-band and --slot-ink off PASS (precritic);
  ws-phone-card sweep (screen-answer default + pv + 2 vocab, 53 live skills x 2 sizes x 3 items) 452 findings on 3d90097d and 452
  on head, verdicts line-identical; ws-screen-answer default and --family pv OK on base and head; ws-boot-smoke PASS; ws-backtest
  on the 4 r8 rows OK. ws-precritic --strict: 28 PASS, 7 FAIL - sibling-compare, print-lint sections S/L L-DENSITY, render-gate
  and cell-checks (pre-skill-check overflow S/M/L both skills; guided S vocabSet 8 overflow) - EVERY ONE also FAILs identically on
  3d90097d (the master merge's pre-skill-check role and the sections deal): pre-existing, not this round's change; needs a lead
  decision (fix in r9 or own elsewhere) before the critic. Renders: scratchpad critic8/{hosts,answered,pictures,lesson}.

## Round 7 (2026-11-09, builder, Opus medium: first build of a new screen feedback state): owner R-1 and R-2
Times (UTC): start 12:50, end 13:45. Base b7dad93a (card signed 107b64aa). Brief design/lanes/lf-vocab/r7-builder-brief.md.

| # | Finding / ruling | Check | Backtest row | On precritic's path |
|---|---|---|---|---|
| 1 | R-1: every picture has a focal part, drawn targetable (key: grey halo; screen: hidden halo + .mq-vfocal); the pupil page and a model on a pupil page draw neither; the key leaves the drawing itself as the pupil page draws it | V22 (new, node) | vocab-v22-focal (70cdbaf9 -> df31bcb3) | y (vocab-unit) |
| 2 | R-2: every word has `explain`, "<Word> means ...", names its word, no notWith word, <= 14 words | V24 (new, node) | vocab-v24-explain (70cdbaf9 -> df31bcb3) | y (vocab-unit) |
| 3 | R-1 / R-2 on screen: card-390 and worksheet-1280 highlight the focal part and the right word only after the answer; a wrong answer shows and speaks the RIGHT word's explanation once, not with sound off; a right answer shows none; pupil print pages byte-identical to 70cdbaf9 (60 sha256 pins: 2 skills x 5 roles x S/M/L x 2 seeds) | V23 + V25 (new, --browser; `--only V23,V25` runs them alone in ~45 s) | vocab-v23-v25-screen-feedback (70cdbaf9 -> df31bcb3) | y (vocab-unit-browser) |
| 4 | Own render, b4a249b6: the key painted the halo and the wrapped focal marks in the key ink (orange); the screen's yellow halo, glow and explanation edge were repainted grey by monoCell's ink pass | V23 measures PAINTED colours: key halo grey, key drawing black, screen halo marks yellow, explanation edge yellow | vocab-v23-painted (b4a249b6 -> df31bcb3) | y (vocab-unit-browser) |

Build: vocab-pictures.js F() focal marks / `focal: 'all'` / heavy marks; halo (6 px, currentColor) drawn hidden in the twin,
GREY on a key page (ctx.keyPage, set by answer-key.js renderPages and passed by tokens.js resolveCtx); additive sheet-kit.css
rule keeps the key halo grey. vocab-words.js `explain` on all 47 words and vocabExplainLine(). screen-cell.js
markVocabFeedback(root, q, ok, {speak}) - called by answer-check.js (card), worksheet.js (one card's check, the ladder's
judged wrong, Check all: speaks the first wrong card only) and quiz-take.js (instant feedback). hints-speech.js
speakExplanation(): window.speak, gated by state.ttsEnabled. css/screen-cell.css additive rules (halo 10 px yellow, glow,
explanation box).

Gates (manifest applied, not committed): ws-vocab-unit OK; --browser OK; ws-screen-answer (both skills) OK; ws-phone-card OK;
ws-chromebook-fit OK; ws-boot-smoke OK; ws-backtest --row (4 rows) OK; node --check on every changed file.

Open for the critic: on the practice card a wrong answer shows the support ladder's "Here is how" under the explanation (both
on); Match 3's lines read "The answer is <word>!" per wrongly matched word (the brief's format); 1 picture, 3 words in a
quiz never records a tap until Next (pre-existing: the quiz input saves on change), so the quiz shows the feedback for Match 3
only. Renders: scratchpad critic7/hosts (10 screen hosts + keys) and critic7/answered (right / wrong at 390 and 1280).

## r9 PAUSED (2026-11-12, weekly usage limit hit mid-round; resumes after the 22:00 UTC reset)
- Done and pushed:
  - item 1 (6e140668): the pre-skill check tests picture vocabulary tasks; V26;
  - item 2 (002e071f): Match 3 guided rows one share each; backtest rows for items 1-2.
- Next on resume (brief: design/lanes/lf-vocab/r9-builder-brief.md):
  1. Part 1 item 3: print-lint --kind sections L-DENSITY / LONE at S and L.
  2. precritic --strict: only sibling-compare may fail.
  3. Part 2: the quiz wrong-red (NB6); the pick3 answer line gets the blue next outline (lead default, NB check);
     derived ambiguity V-AMBIG+; the minors.
- Budget left in r9: about $13 minus what items 1-2 used. Then a narrow critic re-check.

## NEXT (r9, lead 2026-11-12 17:18Z; resumable from the branch): after the narrow critic r7 reports
1. Read design/lanes/lf-vocab/critic-r7-narrow.md (once copied in). Its renders are in the scratchpad critic8.
2. r9 fixes, in lf-vocab: these cells are vocab-owned now that master's plan-from-card offers pre-skill-check for the
   vocab skills.
   - the pre-skill-check overflow at S/M/L on both skills (render-gate, cell-checks);
   - guided S with vocabSet 8 overflows (cell-checks);
   - print-lint --kind sections L-DENSITY DN-2 / LONE at S and L.
   Each fix gets a check first and a backtest row that FAILs on 3d90097d. Then precritic --strict must be clean apart
   from the structural sibling-compare.
3. Cap: +$15. Deploy = the r5 print pass + R-1/R-2 + O-1..3 + r9, with the manifest (mergeOrder 70); the lead runs
   ws-stamp-assets.

## Owner rulings O-1 to O-3 (2026-11-10): in the card, awaiting the lead's signature. The lane is parked (week cap)
- O-1: the next answer box is a blue pulsing outline behind ONE switch (e.g. --mq-next-color / a body class). Yellow is
  kept only for R-1; the red wrong box (R4-3) and reduced motion are kept. Hosts: card, worksheet, quiz. NOTE: this
  touches every skill's screens, not only vocab (screen-cell.css). Graded by ws-phone-card and screen-answer.
- O-2: redraw 'digit' and 'place' so each can only mean its word, and audit every picture. NOTE: the 'place' picture
  (H T O / empty boxes) is NOT in the lf-vocab library. It is the lesson Warm-up vocabulary band
  (sheet/lesson-pages/vocab.js), whose data is the detailed lessons (g2-nbt3, g4-nbt1) and lf-placevalue's
  placevalue:* records. The library's own 'digit' (vocab-pictures.js) is a different drawing. Next round: confirm with
  the lead which pictures the owner saw, and who owns the lesson-band ones.
- O-3: 'step' is redrawn as a short worked problem labelled Step 1 / Step 2. New check V-AMBIG: each picture lists the
  words it could also show, and an item whose bank holds one of them fails. The critic answers "could a pupil defend
  another bank word?" for every picture.
- Lead, 2026-11-10: the card is SIGNED (54858274). O-1 reaching every skill is accepted: run the full ws-phone-card /
  screen-answer sweep and the siblings check on it.
- O-2 is confirmed as the lesson Warm-up vocabulary band (the placevalue:identify band: 472 / H T O / four boxes, for
  ones / digit / place). lf-vocab MAY edit sheet/lesson-pages/vocab.js and the vocab data in g2-nbt3, g4-nbt1 and
  lf-placevalue's placevalue:* records, on two conditions:
  - ws-lesson-baseline --all-lessons runs before and after, and only the redrawn vocab cells may change;
  - ws-detailed-lesson --check / --repeats runs on every touched lesson.
  V-AMBIG audits the library AND the lesson-band pictures.
- Parked until the lead says go (after the Thursday reset, unless the owner says sooner).
- Next round order: merge master; R7 (Match 3 letter line + wrong-only glow), V26, V27, the 6 minor fixes; O-1, O-2,
  O-3 with V-AMBIG; the Q-S2 re-check; one deploy.

## UPDATE (lead, 2026-11-09 16:01Z): phase 0 is on master (ec61b069), so the lesson part can register on master.
Stay parked this week. Next round:
0. Merge master. The lesson.js / prereqs.js conflict of 2026-11-09 should be gone now that phase 0 is on master.
Then 1-4 below, and ONE deploy: the r5 print pass plus R-1 / R-2, with the manifest (mergeOrder 70).

## PARKED (2026-11-09: the owner's week cap is reached). Next round = the Q-S2 re-check of R-1 / R-2, in this order:
1. The Match 3 wrong line, "<Word> is picture <L>! <Word> means ...". Glow ONLY the wrongly matched pictures, each with
   its letter.
2. Build V25+, V26, V27, V22+ and V24+ (spec: LESSONS_LEARNED "lf-vocab round 7"). Each must FAIL on 82e5007b and
   have a backtest row.
3. The 6 minor fixes from design/lanes/lf-vocab/critic-r6-narrow.md.
4. The harness gaps: full-page answered shots on every host, and a quiz answered state.
Then a narrow critic re-check of the screen hosts and the keys. Pending: the owner's answer on the yellow active-box
pulse (the lead will relay it).

## Round 7 result (2026-11-09): narrow critic FAIL, min 7 (a near-miss: a Q-S2 re-check is allowed)
- R-1 and R-2 are built (82e5007b). Gates are green: ws-vocab-unit and --browser, screen-answer, phone-card,
  chromebook-fit, boot-smoke, and 4 backtests.
- Critic scores (design/lanes/lf-vocab/critic-r6-narrow.md):
  - Match 3 screens: 8 / 7 / 8 / 8
  - pick3 screens: 8 / 8 / 8 / 9
  - keys: 9 / 9 / 9 / 8
  - explanations: 8 / 8 / 9 / 9
- The fix for the 7: the Match 3 wrong line reads "<Word> is picture <L>! <Word> means ...", and only the wrongly
  matched pictures glow, each with its letter. Six minor fixes are in LESSONS_LEARNED "lf-vocab round 7".
- Owner question: yellow now means both "the active box" (2026-10-04 pulse) and "correct" (R-1).
- The r5 PASS of the print pages is unaffected: the pupil pages are pinned byte-identical. The keys gained the grey
  focal halo, which the critic scored 9 / 9 / 9 / 8.
- Stopped at the $25 cap.

## PASS (2026-11-09): critic r5 PASS min 8
- Both skills added to js/modules/redesign-passed.js (VOC_IDS, evidence design/lanes/lf-vocab/critic-r5.md).
  ws-redesign-passed is OK with the manifest applied. On the branch without the manifest the two ids are not live yet:
  apply the manifest in the same merge.
- Screenshots (this container; critic set /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/critic6):
  - the lesson vocabulary pages: lesson/pilot-L-pupil-1.png, pilot-M-pupil-1.png, grade2-L-pupil-1.png,
    props-L-pupil-1.png, and each one's -key-1.png;
  - Match 3: skill/L/vocabulary__vocab_grade_pictures/independent-p1.png, independent-key-p1.png, card-390.png,
    card-1280.png, worksheet-1280.png, quiz-1280.png;
  - 1 picture, 3 words: skill/L/vocabulary__vocab_pick3_words/ (the same names), and grades/g1..g4.
- Deploy: waits for lessons-phase0 and the lesson-pages registry on master (lead, 2026-11-09, option b).

## Round 6 (2026-11-09, fresh builder, Opus medium, rebuild after critic r4 FAIL min 6): OQ-1 + critic r4 #1-#5
Times: start about 10:05 UTC, end 11:50 UTC. Base c7384923 (the owner re-signed the card with OQ-1; check-signed OK).

Checks first (each FAILs on 90e2eee4; backtest rows in tests/fixtures/precritic/backtests.json, pass 4cb3fd66):
| # | Finding | Check (new / extended) | Backtest row | On precritic's path | Rounds it would have saved |
|---|---|---|---|---|---|
| 1 | OQ-1: 2.5 mm "one", 25 x 2.5 mm "ten" | V16 extended: one unit WITHIN an item, unit >= 5 mm when no hundred (rendered through both cells, S/M/L) | vocab-v16-base10-per-item | y (vocab-unit) | 1 (r4) |
| 2 | Pick 3 EA at S 30.1 % empty, ws-empty-band passed | ws-empty-band --slot-ink off (new, opt-in) | eb-vocab-pick3-ea-s-critic | y (empty-band-critic, vocab skills only) | 1 (r4) |
| 3 | Pick 3 guided rows 377 / 290 px at L (4th round) | V18 extended: rendered row boxes, page by page, 6 grade/seed pairs incl. ws-grade-render's seed 143869, no exemption | vocab-v18-rendered-rows | y (vocab-unit-browser) | 3 (r2, r3, r4) |
| 4 | Match 3 EA at S drawn at L's height | V20 new: EA cell at S <= 0.9 x L when S ink < 0.95 x L ink | vocab-v20-ea-s-height | y (vocab-unit-browser) | 1 (r4) |
| 5 | "number name" with "hundred" in the bank | V17 extended: no word that may share a bank is printed in the picture's text; pair appended to LOOKALIKES | vocab-v17-printed-text | y (vocab-unit) | 1 (r4) |
| 6 | "left" reads as take away | V21 new: declared `referent` (left, repeat required); the heavy mark is on it and nowhere else | vocab-v21-referent | y (vocab-unit) | 1 (r4) |
| 7 | ws-empty-band counted empty slots as ink | --slot-ink off: empty slots not ink, text as glyph ink (no half-leading), LONGEST blank run between the cell's rules; legacy cells noted, not judged | eb-vocab-pick3-ea-s-critic | y | 1 (r4) |

Fixes: base10UnitSet (vocab-pictures.js) - the unit is per item; Match 3 gives a base-ten slot (no hundred in the item) the
row's spare width and a 52.5 mm box (unit 5.05 mm). Pick 3 EA at S: bank beside the picture (28 mm box), 6 a page (2 x 3).
Match 3 EA at S: 18 mm pictures, no vertical pad, 4 a page (57 mm cells vs L 76 mm). guided.js evenRows: the rows take one
share (page height / rows) even when the page cannot hold the tallest planned row (the planner counts a one-line hint; a
two-line meaning hint drew row 1 at 100 mm). notWith number name <-> hundred (grade 2 set still splits: V7). "left": heavy
bracket under the four that stay, crosses at part weight. Match 3 practice cell: the picture row is centred above the words,
and in a row taller than 48 mm (review, pre-skill check) the work takes a quarter of the spare (EB-FOOT stays within 10 %).

Gates (manifest applied for the run, not committed):
- ws-vocab-unit: OK; ws-vocab-unit --browser: OK
- ws-empty-band --skill both: OK; with --slot-ink off: OK (2 legacy pre-skill-check cells of grade 6 vocab skills noted, not judged)
- ws-precritic --strict: 1 FAIL (sibling-compare, structural: no approved sibling) / spec-card check-signed PASS (owner re-signed)
- ws-backtest --row (the 6 new rows): 6 PASS, `ws-backtest: OK`

For lf-checks (--slot-ink off on the pinned skills, add_facts + mult_facts, --no-baseline --report-only): default 299 findings
(EB-BAND 188, EB-SIDE 95, EB-FOOT 16) -> flag 2057 (EB-BAND 1374, EB-SIDE 127, EB-FOOT 556). The default is unchanged; a re-pin
under the flag would be lf-checks' decision.

Open for the critic: Match 3 EA at S prints its pictures 18 mm tall (4 a page); the In/Out table text is small there. Nits
from r4 (letter anchor, card-390 alignment, repeated pupil name, caption sizes) were not in this brief and are not done.

## Round 5 (2026-11-08, fresh builder, rule 5, Opus medium): critic r3 #1-#10
Times: start 12:52 UTC, end 14:39 UTC.

Checks first (each FAILed on 8c9034bb before its fix; backtest rows in tests/fixtures/precritic/backtests.json, pass 6cec18b7):
- ws-empty-band (lf-checks) FAIL 49 before: Match 3 guided S/L 30-34 %, Match 3 error analysis S/M/L 32-37 %, pick3 error analysis
  L 33 %, pick3 scripted-model 69-79 %, reason-it L, EB-FOOT on mixed practice and grade 4 pick3. After: `ws-empty-band: OK`.
- ws-vocab-unit V11R (browser) per-word Score on independent, guided, more-practice, test, error-analysis at S/M/L: FAIL (guided
  /5, EA /2) -> OK.
- V14 hint picks one bank word: FAIL ("starts with c", column + commutative) -> OK.
- V15 answer line >= 1.2 x widest bank word, grades 4-5 >= 55 mm: FAIL (36 mm) -> OK.
- V16 one base-ten unit (one / ten / hundred): FAIL (17.6 / 4.1 / 2.4 mm) -> OK.
- V17 append-only look-alike list (grow/sequence, grow/pattern ...): FAIL -> OK.
- V18 pick3 guided rows equal at S, M and L: FAIL (98.9 / 77.6 mm at L) -> OK.
- V19 worksheet-1280 tiles one layout per template: FAIL (2 + 1 words, box x varies; pills wrap, line y and picture height vary)
  -> OK. V11R/V18/V19 run as `ws-vocab-unit --browser`, on precritic as gate vocab-unit-browser.

Fixes: guided cells fill their row (Match 3) and rows equal when the page holds them (guided.js evenRows); error analysis draws
its work at natural height (3 a page at S/M/L); guided and error-analysis Score via scorePoints (Q-C); pick3 hint = meaning
when the first letter is not unique; grade 4-5 line under picture and bank (55 mm+); base-ten one unit; distributive gap;
pattern ellipsis; grow notWith sequence/pattern and set 7 words (sequence -> first term, position kept); worksheet tiles fixed
layout (scoped to .mq-wspaper), screen fit ignores box-less elements (a cell's <style> read as overflow and shrank tiles to
57 %); pick3 page min heights = page shares; pick3 repeats a picture with a new bank after the set is used (grade 4 sets now
8 a page, Q2); Reason It lays Match 3 B under A and splits its letters; Scripted Model draws pick3 states full width.

Gates (branch merged with origin/master; manifest applied for the run, not committed):
- ws-empty-band --skill both: OK (no new pins)
- ws-vocab-unit: OK; ws-vocab-unit --browser: OK
- ws-precritic --strict: 2 FAIL / 25 PASS (3 on baseline) / 3 N/A / 2 SKIPPED (no rulings): sibling-compare (structural: first
  family, no approved sibling) and chromebook-fit (Match 3 worksheet tile 654 px > 650 fold) -> fixed in c474fc1b, rerun alone OK.
- ws-backtest on the 8 new rows (eb-vocab-match3-guided, V11R, V14-V19): 8 PASS, `ws-backtest: OK`.

Open / judgement calls for the critic:
- Base-ten one unit: at a shared scale the "one" is one 2.5 mm square and the ten rod 2.5 mm tall (the hundred's unit in a 25 mm
  box). V9's box floor for these three ids is 2.3 mm (was 4 mm). A critic may find "one" too small; the alternative is an owner
  ruling to draw the hundred larger than the other pictures.
- Reason It on Match 3 is legible but plain (the answer line asks for "C, A, B").

## Owner ruling OQ-1 (2026-11-08, relayed by the lead): pending card change, to be re-signed next round
- Ruling: YES. When an item has no hundred, the one and ten blocks may be drawn with a larger unit. Each item uses one
  base-ten scale.
- The card is NOT edited yet: it is signed, and an edit would turn ws-spec-card --check-signed red on a paused branch.
  At the START of the next round, write this into design/cards/vocabulary/card.json (and regenerate vocabulary.md),
  then the lead re-signs it.
- Next round, in order:
  1. OQ-1 in vocab-pictures.js: the base-ten unit is per item; V16 means one unit within an item.
  2. Critic r4 #1-#5.
  3. Align ws-empty-band's empty-slot rule with the critic's scan (with lf-checks).
  4. Critic r5.
- The lane is paused (the week's budget is nearly used).

## Round 5 result (2026-11-08): critic r4 FAIL, min 6
- Precritic r7 --strict (manifest applied, master merged): 1 FAIL / 26 PASS (sibling-compare only, structural).
  ws-empty-band OK.
- Critic r4: 8 of the 10 r3 defects are FIXED. Everything below is 8 or above:
  - independent, more-practice and test on both skills at S/M/L;
  - Match 3 guided at S/M/L;
  - error analysis at M/L;
  - pick3 guided at S/M;
  - all 10 screen hosts;
  - grades 1, 3 and 4;
  - the four lesson pages.
- Below 8:
  - pick3 error analysis at S: H13 at 30.1 %, scored 6;
  - pick3 guided rows at L: 377/290 px (4th round);
  - Match 3 error analysis at S drawn at L's height;
  - "number name" with "hundred" in one bank;
  - the "left" picture;
  - grade 2 base-ten size (owner question OQ-1).
- Root cause: two checks PASS what the critic FAILs.
  - ws-empty-band counts an empty answer slot as ink; the critic's scan does not.
  - V18 does not measure the rendered row boxes at L.
  - These are the shared check (lf-checks) and the lane check to align first.
- Owner question OQ-1 (ANSWERED YES, 2026-11-08: see above): may the base-ten hundred be drawn larger than the picture box, or may one / ten use a larger
  unit when no hundred is on the item, so the unit can be 5 mm or more (about 2.5 mm today)?
- NOT in redesign-passed.js. The manifest is not applied on the branch.

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

## r10 builder (fresh, Opus medium, rule 5; brief design/lanes/lf-vocab/r10-builder-brief.md), 2026-11-13
Merged origin/master 88753326 first (605fa9f0). One commit per item, pushed.
| item | check | backtest row (fail -> pass) | on precritic's path |
|---|---|---|---|
| 1 rule drawn as arrow in, [+3], arrow out (no numbers) | V-AMBIG+ function-machine rule (this checkout's rules over the checked tree's drawings) | vocab-r10-rule-machine 605fa9f0 -> 0c3d4c59 | y (vocab-unit) |
| 2 cycle drawn as a loop of four shapes | V-AMBIG+ loop-of-numbers rule | vocab-r10-cycle-loop 0c3d4c59 -> 856aba09 | y |
| 3 times as many = times as many, factor, product, compare, multiple, unknown | V-FIT | vocab-r10-v-fit 6ae462d1 -> 4200e2c0 | y |
| 4 follow a rule: output -> grow; growing patterns: total -> odd (4.OA.C.5's own word) | V-FIT6 | vocab-r10-v-fit6 4200e2c0 -> 6adc77cb | y |
| 5 every picture declares ccss / op; VOCAB_STANDARD_OPS | V-FIT (core), V-FIT6 (others, 4 pinned misfits for the lead) | as 3 / 4 | y |
| 6 focused wrong vocab box keeps red dashed edge, no ring; quiz badges | ws-next-box NB8 | vocab-r10-nb8-wrong-focus-tick b502c983 -> bae5c32e | y (next-box) |
| 7 ws-lesson-render: named lesson's band pages, LR-TITLE / LR-BODY / LR-BAND | ws-lesson-render | vocab-r10-lesson-render (fixtures) | n (render tool) |
V23 re-pinned: 40 of 60 pupil pages (every one draws the redrawn rule picture). Gates: ws-vocab-unit OK, --browser OK;
ws-next-box OK; ws-empty-band both skills OK, --slot-ink off OK; ws-boot-smoke OK; precritic --strict both skills: only
sibling-compare FAIL (no approved sibling; next-box once flaked on addition:add NB1 under load, OK standalone and in run 2).
Lead decisions: V-FIT6 pins (G4 cycle set "product", growing set "equation", times-as-many "compare" - its picture is an
additive difference arrow - and "unknown" (8 + ? = 13)); set 7 took "odd" (standard's own example word).

## r11 builder (fresh, Opus medium, rule 5 root cause; brief design/lanes/lf-vocab/r11-builder-brief.md), 2026-11-13
Merged origin/master eef75f5d first (88ccd451), manifest re-applied. One commit per item (items 3 and 4 share one: the
V-REF fixes ARE the critic's explain fixes), pushed.
| item | check | backtest row (fail -> pass) | on precritic's path |
|---|---|---|---|
| 1 V-FEAT: pictures declare features (PIC_FEAT, closed list VOCAB_FEATURES, checked against the markup by vocabReadFeatures); words declare definitions (VOCAB_DEFS); old derived rules and V-AMBIG+ deleted | ws-vocab-unit V-FEAT | vocab-r11-feat-r7-row-pattern d17f8d6a -> 718740e4; vocab-r11-feat-r9-rule-cycle 6ae462d1 -> 718740e4; vocab-r11-feat-r10-term 03eddcc2 -> 718740e4 (+ the three V-AMBIG+ rows re-pointed at V-FEAT, all PASS) | y (vocab-unit) |
| 2 the escape hatch: set `noPicture`, pictureWords; dealer, lesson vocab page, V5 / V6 / V7 on picture words | V-HATCH, V7 | vocab-r11-hatch (fixtures) | y |
| 3 V-REF referent lint; NB9 Check blurs vocab slots | V-REF, ws-next-box NB9 | vocab-r11-vref 03eddcc2 -> 7c8fee58; vocab-r11-nb9-blur 03eddcc2 -> 7c8fee58 | y |
| 4 term 18, [14], 10; first term [30], 25, 20; cycle and unknown explains | V-FEAT, V-REF | as 1 / 3 | y |
| 5 ws-vocab-set-renders: every set changed since a base commit, both skills, independent at L | render tool | none (a render) | n |
Hatch drops: none. rule = step:3 (its own +3), a run with its step written (+2 hops), an arrow into a box or an op box -
the critic's falling-run redraws then pass; with "any step" rule, term, first term and rule were mutually exclusive in
sets 7 and 8 and both sets needed a drop that also broke V6 (no clash-free core trio exists).
New notWith (no set holds both, so no V7 change): rule / row, column, multiple; row, column / commutative, distributive;
grow / multiple; factor / divisor, quotient, ones digit; quotient / ones digit.

## r13 builder (Opus low, structural fix; brief design/lanes/lf-vocab/r13-builder-brief.md), 2026-11-13
After narrow critic r12 (FAIL, min 7). Items 1-5 land in one commit: each check's fix needs the set re-picks (item 5) to stay
green, so they cannot be split without a red commit.
| item | check | backtest row (fail a35dbd72 -> pass) | on precritic's path |
|---|---|---|---|
| 1 pick3 deals only vetted trios (vocab-words.js vettedTrios / dealtBanks; gen-vocabulary.js); manifest.json dealt-pairs table | V7-ALL | vocab-r13-v7all | y (vocab-unit) |
| 2 V-NUM: all-even / all-odd read from ringed or boxed numbers; row rings 3, 6, 9, 12; input / output In 2, 3 Out 5, 6 | V-NUM | vocab-r13-vnum | y |
| 3 times table implies product (VOCAB_DEFS product / multiple += table + skip-count); product notWith row, column | V-FEAT | vocab-r13-feat-product-row | y |
| 4 V-TWIN: one feature class, one notWith list; first term notWith rule | V-TWIN | vocab-r13-vtwin | y |
| 5 sets re-picked in place: 0 product -> factor; 7 term -> repeat (core {grow, first term, repeat}); 8 first term -> odd | V6, V7, V7-ALL | as above | y |
Hatch drops: none.
Commits 86c844fd (items 1-5), 098cf83c (backtest rows; repeat meaning "the part comes back" so the Guided M hint fits one line -
cell-checks OVERFLOW on pick3 guided M set 7). EB-FOOT: sets 0 and 6 have one bank a picture, so a pick3 repeat deals it in
another order (dupKey carries the bank order). V23: all 60 pupil hashes re-pinned (row and In/Out redrawn, set 0 word swap,
pick3 banks now vetted trios). Gates: vocab-unit OK (+browser OK), next-box OK, empty-band OK both skills (+self-test OK),
boot-smoke OK, 4 backtest rows PASS, precritic --strict: sibling-compare FAIL only (known). Renders: scratchpad r13/sets (9 of 11
sets; sets 4 and 5 unchanged by the tool's diff, their banks listed in manifest.json).
