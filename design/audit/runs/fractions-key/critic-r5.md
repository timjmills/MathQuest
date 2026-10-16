# Critic round 5: Fraction key, lane adbb61b8450078736 @ 6d3e10b6

Independent critic, 2026-10-16, Opus 5.5 (medium). I graded fresh renders, screens and runs of head 6d3e10b6
against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md, LESSONS_LEARNED.md and the owner rulings:
- Every fraction sum uses the same whole + fraction boxes, and an answer of 1 or n/n is accepted.
- Key answers are reddish orange #C2410C on black structure.
- Stretch and thinking pages are out of scope.

R4-4 (mixed_composing capacity) is not graded here; it belongs to the practice-capacity lane. Review is not a
graded page (RUBRIC scope note), so I list it only as a note. I changed no code.

## Verdict: FAIL

**What passes:**
- All four r4 defects are closed: R4-1, R4-2, R4-3 and R4-5.
- The three core skills did not regress: add_fractions_like, sub_fractions_like and add_frac_unlike. Their deal,
  renders and gates match r4.
- On paper, fraction_of_set and fraction_of_set_hard are now well made. The new `fos` kit cell is black and white,
  stacked, sized to its content, and hides the answer:
  - 6 items per page at S and M, and 4 at L.
  - The largest blank strip on a page is 1.6 %.
  - No lint findings on 60 documents at S and 60 at L.

**Why it fails.** Grading every task kind of the two fraction_of_set skills, I found three real defects that the
earlier rounds never reached:

- **R5-1 · critical.** On screen, a right answer to "Tap 2/3 of the squares" is marked wrong.
  - The shapes are identical, but the widget grades by option id. Only the first n shapes count as correct.
  - A pupil who taps any other 6 of the 9 squares gets "3 correct, 6 to fix": 3 "missed" and 3 "not this".
- **R5-2 · major.** The same request does not always print the same sheet.
  - The item kind comes from a session-global counter, not from the seed.
  - So the preview, the printed page and a key reprinted later can differ.
  - The kinds also cycle in a fixed order down the page (LESSONS L10).
- **R5-3 · real.** On all three screen hosts, the story prompt prints its fraction slashed ("1/5 of them"), against
  TY-7. Paper stacks the same fraction.

Two smaller defects sit below the bar:
- **R5-4:** the short key names the list answer "A; B; C; D; E; F", but the page has no letters.
- **R5-5:** the list prompt's stacked fraction sits low against its line.

## What was run

The probes are in `r5/probes/` and the logs in `r5/`. Every PNG I cite is in `r5/print/` or `r5/screen/`.

| Gate / probe | Result |
|---|---|
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK**: 608 codes, 35 categories, +36 appended, nothing moved, 1870 option round trips |
| `ws-content-audit --skill mixed_composing,add_fractions_like,sub_fractions_like,add_frac_unlike,fraction_of_set,fraction_of_set_hard` | **OK**: 0 failing, 4 notes. As in r4, only mixed_composing is inside the audit's category scope. |
| `ws-print-lint --source kit`, 5 lane skills, roles independent, more-practice, test, mixed-practice, `--seeds 3`, size L | **OK**: 60 documents, **0 findings** |
| The same at size S | **OK**: 60 documents, **0 findings** |
| `ws-print-lint --source kit --key-style short`, size L, roles independent, more-practice, test | **OK**: 15 documents, 0 findings |
| `ws-screen-answer --skills` (the 5 lane skills) | **OK**. The fraction_of_set skills pass card, worksheet 3/3 and quiz 3/3. The gate taps the keyed ids, so it cannot see R5-1. |
| `ws-chromebook-fit --skills` (same 5 skills; card, boss, race, worksheet and quiz; 1366x650 and 1280x600) | **OK**. fos card box at 273 of 650, quiz box at 499 of 650. |
| `node --input-type=module --check` on the 6 changed modules, plus `node --check` on ws-print-lint | All pass |
| `probes/deal2.cjs`: 30 seeds × independent, more-practice and test × S, M, L × 6 skills | `deal-instructions.log` |
| `probes/render.cjs`: 76 jobs (pupil and key, copy and short, review) | `render.log`, with the largest blank page strip per page |
| `probes/fos-screens.cjs`: card and quiz for each task kind (list, of, missing, word), plus the worksheet, at 1366x650, 1280x600 and 390x844, for both skills | `screens.log`. 0 page errors, no horizontal scroll. |
| `probes/fos-tap.cjs`: tap the **last** n of N identical shapes, then Check | `tap.log` (R5-1) |
| `probes/repro.cjs` and `probes/twice.cjs`: the same seed after one extra generation, and the same request built 4 times | `repro.log`, `twice.log` (R5-2) |

## r4 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **R4-1**: "Circle all" printed over write items | **Closed** | `deal-instructions.log`: circleAllNoList is **0** for all 54 skill × role × size rows (30 seeds each). Both fraction_of_set skills print "Solve." on independent and more-practice, and "Solve. Write the answer." on test. The one list item carries its own line, "Circle 3/5 of the triangles." (`print/fraction_of_set-independent-S-s5-pupil-p1.png`, item d). In the Mixed Review band the line now follows the item ("Mixed Review: Solve.", `print/fraction_of_set-review-L-s7-pupil-p1.png`), so N-a is closed too. |
| **R4-2**: one item per page | **Closed** | 30/30 seeds hold 6 per page at S and M and 4 at L, for both skills. Exceptions: 1 page of 6 at L, and a few hard pages of 4 at S or M, where they hold tall 8-group items. Test holds 8 at S (26/30) and 4–6 at L. The largest blank strip is 1.6 % on every practice page, and 1.1–9.3 % on test pages. |
| **R4-3**: the answer is shaded; slashed fractions, faded ink and colour words | **Closed on paper** | A missing-numerator item draws d unshaded rings of `mult` outline counters; nothing is shaded on the pupil page (`print/fraction_of_set-test-S-s1-pupil-p1.png`, items a and g). Prompts and stories stack their fractions. Ink is solid black and the counters are white; the lint finds no INK, LS or TY items. Stories say "in a box", "gives away" and "takes", with no colour words. The key shades the counted groups in #C2410C (`print/fraction_of_set-test-L-s7-key-p1.png`). **On screen**, the story prompt is still slashed: see R5-3. |
| **R4-5**: the period wraps alone | **Closed** | `utils.js` keeps "½." in one nowrap run. The worksheet list prompt "Tap 3/4 of the diamonds." keeps its period (`screen/fraction_of_set-1366x650-worksheet-full.png`, card 6). |

## Core three: no regression

- **Deal:** identical to r4. Practice pages hold 6 at S and 4 at L; sub at M holds 4 on 9–10 of 30 seeds, as in
  r4. There are 0 two-list pages and 0 list-only pages. Test pages carry the operation verb.
- **Renders:** `print/sub_fractions_like-independent-S-s1-pupil-p1.png` matches the r4 key page of the same seed,
  item for item.
  - `print/add_frac_unlike-independent-L-s1-key-p1.png` keeps the whole + fraction boxes, with dashes in key ink.
  - `print/add_fractions_like-mixed-practice-S-s3-key-p1.png`: 1/5 + 4/5 is keyed "1" with dashed fraction boxes,
    per the owner ruling.
  - `print/add_fractions_like-independent-L-s1-short-key-p1.png` is the short key: stacked answers, with lists named
    by their options.
- **Gates:** lint 0 findings at S and L and on the short key; ws-screen-answer by-value ok.
- The r4 scores stand.

## Defects (R5-n)

**R5-1 · critical (C2 on every screen host) · fraction_of_set and fraction_of_set_hard · card, worksheet, quiz · a right answer is marked wrong**
- **What I saw:**
  - `probes/fos-tap.cjs`, seed 13·k, 1366x650. On "Tap 2/3 of the squares." with 9 identical squares, I tapped
    the last 6 and pressed Check.
  - Result: "3 correct, 6 to fix — try again!". Squares 1–3 were tagged "missed" and squares 7–9 "not this", and
    the score stayed 0 (`screen/fraction_of_set-tap-last-checked.png`).
  - fraction_of_set_hard, "Tap 3/5 of the squares.": tapping the last 6 of 10 gave 2 green, 4 wrong and 4 missed
    (`screen/fraction_of_set_hard-tap-last-checked.png`).
  - The task teaches that any 2/3 of the set is right. The screen teaches that only the first ones count. This is
    worse than a wrong key (RUBRIC C2: "the answer key is correct for every item"; a wrong key caps C2 at 3).
- **Where:** `js/modules/gen-fractions.js` variant 1, around line 3925. `q.ans` holds the ids of the first
  `correctCount` options. `js/modules/widgets/multi-select-check.js` grades by id. The worksheet and quiz use the same
  widget. ws-screen-answer taps the keyed ids, so it passes.
- **Fix:** grade this item by **count**.
  - Mark the item `q.selectCount = correctCount` (or `q.gradeBy = 'count'`).
  - In multi-select-check.js, quiz grading and worksheet scoring, accept any selection of exactly that size.
  - Feedback: "Tap 6. You tapped 4."; on a wrong count, no per-tile "missed" or "not this".
  - The paper key may keep ringing the first n, but should add "(any 6)" (see R5-4).
- **Proof:** re-run `probes/fos-tap.cjs`. Tapping the last n is green and scores 1. Add a "count-graded list:
  non-keyed but right selection" case to ws-screen-answer.

**R5-2 · major (C2 print, LESSONS L10) · both skills · independent and more-practice (every role that deals the list) · the same request prints a different sheet, and item kinds cycle**
- **What I saw:**
  - `twice.log`: fraction_of_set_hard independent, S and L, seed 11. Building the **identical** request 4 times in
    a row gives 2 distinct sheets. Build 1 opens "There are 66 buttons. 3/6 … = 33 | … | Click 5/5 of the circles";
    build 2 opens "Find the fraction of the set. = 33 | Click 2/3 of the circles. …".
  - `repro.log`: one unrelated `generateQuestionFor` call between two builds of seed 5 changes the sheet for
    fraction_of_set independent S and L, test L, and every hard row except one.
  - So the preview can differ from the printed sheet, and a key printed later can differ from the pupil sheet. This
    breaks CLAUDE.md: "its seed makes a page reproducible".
  - The kinds also follow a fixed 4-cycle down the page (missing, word, of, list, of, …; `repro.log`).
- **Where:** `gen-fractions.js` around line 3899: `window.__skillVariantCounter[\`${fracSkill}_typev2\`]` and
  `_fosVariant = _fosCtr % 4`. This counter is session-global and never reset. `resetPageDeals()` (page-deal.js)
  does not clear it.
- **Fix:** deal the kind from the page deck, for example
  `pageDeal('fos_kind:'+fracSkill, ['of','list','missing','word'])` or the existing `pickVariant` with
  `state.itemIndex`. Then it is seeded, reset at item 0, repeats allowed, and never `% 4` of a global count. Delete
  the global counter. Keep the list to at most one per page, as now.
- **Proof:** `probes/twice.cjs` gives 1 distinct sheet for every row. `probes/repro.cjs` reports reprint-same true.
  Over 30 items the kind sequence does not cycle.

**R5-3 · real (C4 on every screen host) · both skills · card, worksheet, quiz, at every width · the word item's prompt prints a slashed fraction**
- **What I saw:**
  - Card: "There are 55 buttons. 1/5 of them are in a box." (`screen/fraction_of_set-1280x600-card-word.png`).
  - Quiz: "She gives away 3/5 of them." (`screen/fraction_of_set-1366x650-quiz-word.png`).
  - Worksheet: card 4, "1/2 of them" (`screen/fraction_of_set-1366x650-worksheet-full.png`) and "3/4 of them" at
    390 (`screen/fraction_of_set_hard-390x844-worksheet-full.png`).
  - Paper stacks the same fraction in the same story.
  - TY-7 ("fractions stacked over a bar, never slashed") applies inside the screen cell (SP-2).
- **Where:** `js/modules/screen-cell.js` around line 277. The prompt is stacked only when it matches
  `fraction op fraction` (`/\b\d+\/\d+\s*[+−×÷]\s*\d+\/\d+\b/`). A story's "1/5 of" never matches.
- **Fix:** also stack any `n/d` in the prompt when the question draws a kit twin (`q.cell`, or the prompt sits over
  a `.k2-twin` / `[data-mq-template]`). Reuse `stackSlashFractions`, which keeps the trailing punctuation.
- **Proof:** re-run `probes/fos-screens.cjs`. The word prompts on card, quiz and worksheet show `.msc-frac`, with
  no `\d+/\d+` left in the prompt text.

**R5-4 · minor (C1/C2 on the short key) · both skills · short key, S and L · the list answer is named by letters the page does not print**
- **What I saw:** `print/fraction_of_set-independent-S-s5-short-key-p1.png` reads "d. A; B; C; D; E; F". The pupil
  item has ten unlabelled triangles (`print/fraction_of_set-independent-S-s5-pupil-p1.png`, item d), and any 6 of
  them is right (R5-1).
- **Where:** the short-key answer text for a multi-select item (`print-sheet.js` `answerText`, used by
  `renderShortKey`). It names the options by position letter.
- **Fix:** for a count-graded list (R5-1's flag), write "6 circled" (or "any 6 of 10"). On the copy key, keep the
  rings and add the same short note under the cell.
- **Proof:** the short-key PNG reads "d. 6 circled".

**R5-5 · cosmetic (C4 nit) · every list prompt (fraction_of_set and the core three) · the stacked fraction sits low**
- **What I saw:**
  - "Circle 3/5 of the triangles.": the numerator sits on the text line and the denominator hangs below it
    (`print/fraction_of_set_hard-independent-L-s7-key-p1.png`, item d).
  - The same holds for "less than ½." on sub_fractions_like, unchanged since r4
    (`print/sub_fractions_like-independent-S-s1-pupil-p1.png`, item c).
  - The builder flagged this. It does not lower any score below 8.
- **Fix:** in `utils.js` `stackSlashFractions`, centre the fraction on the line, for example `vertical-align:-0.45em`
  or a `translateY` of half the denominator. Or reuse fos.js `inlineFrac`, which centres correctly in the stories.

**Builder's second flag (choose-all shapes at S are 1.1em).** I measured about 4 mm on paper at S
(`print/fraction_of_set-independent-S-s5-pupil-p1.png`, item d), and 51 px on the card and quiz (44 px at 390).
The shapes are widely spaced and easy to ring with a pencil, so this is not a defect.

## Notes (not graded, or owned elsewhere)

- **N-a.** The Review page's Mixed Review item ("Are 2/5 and 2/20 equivalent fractions? (yes or no)" with
  "Answer:") is a legacy cell: Arial-looking text and a word answer (`print/fraction_of_set-review-L-s7-pupil-p1.png`).
  That belongs to the equivalence skill's migration. Review is not graded.
- **N-b.** Ring arrangement varies from cell to cell: long horizontal pills, 2 × 2 blocks or tall columns, chosen by
  the shortest fit (`print/fraction_of_set-test-S-s1-pupil-p1.png`, items a, b and d). Each picture is clear and
  countable. A single orientation per page would read more calmly (AX-4), but this is not a defect.
- **N-c.** Items with num = den ("6/6 of 66", "8/8 of 88") make up about 15 % of items, plus a list "Tap 6/6 of the
  circles". They are valid edge cases, but on fraction_of_set_hard the 1/N guard does not cover n/n.
- **N-d.** `hints-speech.js` (around line 139) still paints `.fos-visual` tokens. The fos twin has none, so Hint now
  shows text only. This is not wrong, but the code is dead.

## Scores

S and M were checked on independent and more-practice (M matches S: 6 items, 22 pt digits). Test means the quiz
paper. Screen hosts were checked at 1366x650, 1280x600 and 390x844.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | all print and screen versions (unchanged from r4) | 8–9 | 8 | 8–9 | 8–9 | yes |
| sub_fractions_like | all print and screen versions (unchanged; R5-5 nit) | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | all print and screen versions (unchanged) | 8–9 | 8 | 8–9 | 8–9 | yes |
| fraction_of_set | independent S / M / L + copy key | 8 | 7 (R5-2) | 9 | 8 | **no** |
| fraction_of_set | more-practice S / M / L + copy key | 8 | 7 (R5-2) | 9 | 8 | **no** |
| fraction_of_set | test S / L + copy key (no list dealt; reprints stable on S) | 9 | 7 (R5-2, test L seed 5) | 8 | 9 | **no** |
| fraction_of_set | short key S / L | 7 (R5-4) | 7 (R5-2, R5-4) | 8 | 8 | **no** |
| fraction_of_set | practice card, all widths | 8 | 3 (R5-1) | 8 | 7 (R5-3) | **no** |
| fraction_of_set | online worksheet, all widths | 8 | 3 (R5-1) | 8 | 7 (R5-3) | **no** |
| fraction_of_set | quiz, all widths | 8 | 3 (R5-1) | 8 | 7 (R5-3) | **no** |
| fraction_of_set_hard | independent S / M / L + copy key | 8 | 7 (R5-2, `twice.log` seed 11) | 9 | 8 | **no** |
| fraction_of_set_hard | more-practice S / M / L + copy key | 8 | 7 (R5-2) | 9 | 8 | **no** |
| fraction_of_set_hard | test S / L + copy key | 9 | 7 (R5-2, `repro.log`) | 8 | 9 | **no** |
| fraction_of_set_hard | short key S / L | 7 (R5-4) | 7 | 8 | 8 | **no** |
| fraction_of_set_hard | card / worksheet / quiz, all widths | 8 | 3 (R5-1) | 8 | 7 (R5-3) | **no** |

Why the paper versions would reach 8 once R5-2 and R5-4 are fixed:
- **C1:** one routine per cell, one box per item, room to ring each counter.
- **C2:** keys correct on every page I worked by hand:
  - fraction_of_set: independent S seed 5, test L seed 7.
  - fraction_of_set_hard: independent L seed 7, more-practice M seed 5.
- **C3:** 6 per page at S and 4 at L, a 1.6 % strip, even 2 × 3 or 2 × 2 grids.
- **C4:** black and white Andika, stacked fractions, key in #C2410C on black structure.

## What blocks the pass, in order

1. **R5-1**: count-graded "Tap n/d of the shapes" in the widget, worksheet and quiz.
2. **R5-2**: seed the fos item kind from the page deck; remove `window.__skillVariantCounter`.
3. **R5-3**: stack the story prompt's fraction on screen.
4. **R5-4**: the short key names a count, not letters.
5. **R5-5** (optional): centre the inline stacked fraction in list prompts.
