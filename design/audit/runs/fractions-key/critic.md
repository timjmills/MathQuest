# Critic round 1 — "add_fractions_like answer key showed option ids" (ea72b09 + a7bef78 on 50dbfa6)

Independent critic (Opus medium), 2026-10-03. Graded from renders only, against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md,
PEDAGOGY_STANDARD.md and LESSONS_LEARNED.md.

## Verdict: FAIL

The fraction keys for the three graded skills are now correct (every tick and every number checked by hand on 12 pages).
But the fix (a) turns the odd/even sort key from an id list into a **plausible wrong key** (it ticks the screen's target
group, against the paper instruction), (b) leaves the option-id bug alive on
picture options with one correct answer and on the whole quiz host, (c) puts two contradicting instructions on every
multi-select page in the app, and (d) makes the whole-number slot give away the type of the answer. No version of the
three skills reaches 8 on all four criteria.

## What was rendered (all PNGs viewed)

Probes and PNGs: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/frac-critic/`
- `L/`, `S/`: `ws-grade-render --roles independent,more-practice` at L (with card 1280/820/390, worksheet, quiz) and S.
- `probe-add/`: buildSheet seed 11 (a whole sum and a Check-ALL item on one page), pupil and key at S and L, with DOM
  measurements (`*-measure.json`).
- `scr/`: card 390/1280, quiz 390/1280 and the quiz results page for a Check-ALL item and a whole-sum item of each skill.
- `sweep/`: key + pupil page of all 105 skills that can deal a `printFormat: 'multi-select'` item (`report.json`).
- `ws-screen-answer --skills` (the 3 skills): OK, but its seeds deal no Check-ALL item on the quiz (see D2).

Measured and right: option numerals 12 pt at S / 20 pt at L (the fraction-digit row of the type table); check boxes
5.0 mm at S / 7.0 mm at L, 0.75 pt, radius 1.0 / 1.5 mm (SL-11); every option glyph Andika; the tick sits inside the
pupil's own box (facsimile). Change 4 (S/M/L for the Check-ALL cell) is correct.

## Scores

`ms` = the page or host holds a Check-ALL item. Caps in brackets.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent L (grade seed, no ms) | 7 | 6 | 8 | 9 | no |
| add_fractions_like | independent L (seed 11, ms) | 6 | 6 | 6 | 7 | no |
| add_fractions_like | independent S (ms) + key | 6 | 6 | 8 | 7 | no |
| add_fractions_like | more-practice L (ms) + key | 6 | 5 | 8 | 7 | no |
| add_fractions_like | more-practice S (ms) + key | 6 | 5 | 7 | 7 | no |
| add_fractions_like | card 1280 / 390 (whole sum) | 7 | 6 | 8 | 7 | no |
| add_fractions_like | card 1280 / 390 (ms) | 7 | 7 | 8 | 6 | no |
| add_fractions_like | online worksheet 1280 | 7 | 6 | 7 | 6 | no |
| add_fractions_like | quiz 1280 / 390 (ms) | 4 [H2] | 3 [H1] | 7 | 6 | no |
| sub_fractions_like | independent L (ms) + key | 7 | 8 | 8 | 6 | no |
| sub_fractions_like | independent S (ms) + key | 7 | 8 | 7 | 6 | no |
| sub_fractions_like | more-practice L (no ms) + key | 9 | 8 | 8 | 9 | yes |
| sub_fractions_like | more-practice S (ms) + key | 7 | 8 | 7 | 6 | no |
| sub_fractions_like | card 1280 / 390 | 8 | 8 | 8 | 8 | yes (production item); ms item as add_fractions_like |
| sub_fractions_like | online worksheet 1280 | 7 | 7 | 7 | 6 | no |
| sub_fractions_like | quiz 1280 / 390 (ms) | 4 [H2] | 3 [H1] | 7 | 6 | no |
| add_frac_unlike | independent L (ms) + key | 7 | 6 | 8 | 7 | no |
| add_frac_unlike | independent S (ms) + key | 6 | 6 | 8 | 7 | no |
| add_frac_unlike | more-practice L (ms) + key | 7 | 7 | 8 | 7 | no |
| add_frac_unlike | more-practice S (ms) + key | 6 | 6 | 7 | 7 | no |
| add_frac_unlike | card 1280 / 390 (whole sum) | 7 | 6 | 8 | 7 | no |
| add_frac_unlike | online worksheet 1280 | 7 | 6 | 7 | 6 | no |
| add_frac_unlike | quiz 1280 / 390 (ms) | 4 [H2] | 3 [H1] | 7 | 6 | no |

Regression sweep (other skills): select_even_odd, mixed_composing, counting_all — key wrong [H1, C2 ≤ 3];
percent_visual — key prints "Answer: opt2" [H1]; every multi-select page whose section line is
`default-circle-all` (24 skills, e.g. select_equiv_frac, simplify, prime_composite, multiples, decompose_fractions) —
two contradicting instructions (C1 −2, C4 −2).

## Defects

**D1 · critical · C2 → 3 (H1) · odd/even sort key ticks the wrong numbers**
- Where: `sweep/select_even_odd-key-p1.png` item e; `sweep/counting_all-key-p1.png` item a; `mixed_composing`.
  Code: `js/modules/print-sheet.js` legacyKeyFill step 3c (lines 539-551) and `js/modules/sheet/adapters.js` `optionLabelsOf`.
- Observed: the paper item says "Circle the even numbers. Cross out the odd numbers." (`gen-algebraic.js:32`,
  `q.printText`), and its paper key is `q.printAnswer` ("Circle: …; Cross out: …"). Step 3c ignores both and ticks
  `q.ans`, the SCREEN target group. Item e (screen target ODD) is keyed with 63 and 9 checked, i.e. the odd numbers marked
  as the ones to circle; on items a-d, f the evens are checked but nothing shows the cross-outs. On the base tree this
  key was already unusable (no kit step reads `printAnswer` as a sentence, so the legacy stamp printed the id list);
  the fix turns an obviously broken key into a plausible wrong one, which a teacher will trust.
- Expected: the key shows what the paper instruction asks: every even number marked as circled, every odd as crossed out.
- Fix: in legacyKeyFill 3c, `if (q.printAnswer) skip 3c` (fall through to the stamp of `printAnswer`), or better, for
  `q.printText === ODD_EVEN_SORT_PRINT` mark evens with the tick and odds with a cross (`data-ws-crossed`) from the option
  labels. In `optionLabelsOf`/the legacy stamp, prefer `p.printAnswer` over the id lookup whenever it is set.
- Proof: sweep `select_even_odd`, `counting_all`, `mixed_composing` over seeds 1-20: on every key, each ticked label is
  even and each odd label is crossed (assert by parsing the key HTML), zero odd numbers ticked.

**D2 · critical · quiz C1 → 4 (H2), C2 → 3 (H1) · Check-ALL items cannot be answered in a quiz, and the quiz
answer lists still print option ids**
- Where: `scr/add_fractions_like-ms-quiz-390.png`, `-1280.png` (same for the other two skills); results
  `scr/*-ms-results-1280.png`. Code: `js/modules/quiz-take.js:350-380` (legacy branch), `:803`, `:822`;
  `js/modules/quiz-builder.js:699`, `:1138`, `:1183`.
- Observed: the quiz cell for "Click ALL sums that equal 1." is an empty box holding one text line; the five options
  are not drawn (DOM: cell innerText ""). After submitting, the breakdown reads "Answer: opt0", "Answer: opt0,opt3"; the
  quiz builder preview and question list print `q.ans` raw the same way. This is the bug the fix is named for, on another
  surface. `ws-screen-answer` misses it because its quiz seeds (`hash(s + ':quizans')`) deal no Check-ALL item.
- Fix: in `renderQuizQuestion`, give `answerType === 'multi-select-check'` the same widget the card and worksheet mount
  (`widgets/multi-select-check.js`), writing the chosen ids into `#qtAnswerInput`; print every `Answer:` in quiz-take /
  quiz-builder through `optionLabelsOf(q, q.ans)` (already exported from sheet/adapters.js). Add a forced Check-ALL item
  to `ws-screen-answer`'s quiz host for these skills.
- Proof: `scr/*-ms-quiz-*.png` shows all options at 390 and 1280; results and builder text contain no `/\bopt\d+\b/`;
  `ws-screen-answer` quiz line ok on a Check-ALL item.

**D3 · critical · C1 −2, C4 −2 (P-LG-2, P-LG-5) · REGRESSION · two instructions for one task on every multi-select page**
- Where: `sweep/select_equiv_frac-pupil-p1.png` ("Circle all the correct answers." above five cells that each say "Check
  the box beside ALL fractions equivalent to …"); the same on 24 swept skills (identify_angles, simplify, prime_composite,
  multiples, decompose_fractions, frac_as_division …); on the three graded skills the section line is "Add."/"Subtract."
  and the cell line "Check the box beside ALL …" repeats in every cell. Code: `js/modules/print-generate.js:5695`.
- Observed: the new wording is not a string of the instruction library (PEDAGOGY 10.1: "New strings may be added only by
  adding a key here"); the library's `default-circle-all` ("Circle all the correct answers.", `sheet/contract.js:225`)
  is still the section line, so the page tells the pupil to circle and to check. "ALL" in capitals; the instruction is
  repeated inside cells (P-LG-5). The slot table (WDS §6) keeps the check box for "a decision: check one box"; a
  choose-all field is "words to circle" (PROBLEM_TYPES RM-08 circle-all). The old "Circle ALL" + check box was already
  a verb/shape mismatch; the fix changed the verb instead of the shape and so collided with the library.
- Fix (preferred, matches RM-08 and the library): revert line 5695 to the library verb, drop the in-cell sentence's verb
  (print only the criterion as the cell stem: "Sums that equal 1"), draw the options as words to circle (no `::before`
  box; ≥ 8 mm between options, each ring area ≥ Hw + 4 tall), and have legacyKeyFill 3c draw a 0.75 pt ring around each
  correct option instead of a tick. Alternative: add a library key (e.g. `check-all` "Check the box beside each answer
  that fits.") to PEDAGOGY 10.1 and `contract.js`, make the adapter return it for `multi-select-check`, and remove the
  per-cell copy. Either way one verb per section.
- Proof: for every swept skill, the pupil HTML has exactly one instruction verb for the multi-select task (a script over
  `sweep/*-pupil` HTML: section line verb == cell stem verb or no cell verb); the string lint accepts it.

**D4 · major · C2 −2, C1 −1 (L3 answer given away; "one slot shape per section", SL-2 by analogy) · the whole-number box
tells the pupil the answer is a whole number, and leaves no place for 5/5**
- Where: `L/fraction_operations__add_fractions_like/independent-p1.png` item a (3/5 + 2/5: one box) beside b-d
  (whole box + fraction bar); `more-practice-p1.png` a, b; `S/.../add_frac_unlike/more-practice-p1.png` e
  (2/5 + 6/10: one box); online worksheet card 6 (7/11 + 4/11). Code: `gen-fractions.js:321`, `:992`.
- Observed: three slot shapes in one section (fraction bar, mixed box, single box), chosen from the answer. A pupil sees
  which items sum to a whole before adding. The skill teaches 4.NF.3a "add the numerators, keep the denominator": the
  pupil's correct first result 5/5 (11/11, 10/10) has nowhere to go, and on screen the single input only takes "1".
  Before the fix the whole sum got the mixed slot with the fraction boxes empty, which reveals nothing.
- Fix: `mixed: true` for every `add_fractions_like` and `add_frac_unlike` item (both can reach 1 or more), so every
  production cell shows the same whole box + fraction bar; the key writes the whole in the whole box and leaves the bar
  empty (or writes the unsimplified n/n in the bar, and the checker accepts 1, n/n and 1 0/n per P-LG-15). Leave
  `sub_fractions_like` on the fraction bar (its difference is always < 1; the change at :380 is a no-op and can be reverted).
- Proof: in the pupil HTML of independent and more-practice at S and L for both skills, every `frac-model` answer slot has
  the same `data-ws-shape` set; the card and quiz accept "5/5" and "1" for 3/5 + 2/5.

**D5 · major · card C4 −1, C1 −1 (paper ≠ screen) · REGRESSION · the new whole slot draws as a two-track strip on the
practice card**
- Where: `scr/add_frac_unlike-whole-card-1280.png` (crop `scr/crop-whole.png`), `add_fractions_like-whole-card-390.png`.
- Observed: the single whole box shows a vertical divider down its middle (two 34 px halves at 390), as if it held two
  digits; the input under it is one 63 x 52 px field. Paper and quiz draw one plain box.
- Fix: make the card's adoption of the `frac: 'w'` slot (frac-model.js:312 `slotBox(ctx, 'w', …)` through screen-cell's
  input adoption) hide the drawn box under the input, as it already does for the whole box of the mixed slot. Moot if D4's
  fix removes the lone `w` slot from these skills, but other skills use `frac: 'w'`.
- Proof: a 3x crop of the slot at 390 and 1280 shows no inner line; the slot's box and the input share one bounding rect.

**D6 · major · C1/C2 (H1 for that item) · option ids survive on picture options with one correct answer**
- Where: `sweep/percent_visual-key-p1.png` item d: no box ticked, and "Answer: opt2" printed under the grids.
  Code: `print-sheet.js:397` (`if (!raw && !display) return null;`) runs before step 3c; `optionLabelsOf` returns `['']`
  for an option whose `label` is `''` (picture options, `gen-fractions.js:6741`), so `display` is empty.
- Fix: run step 3c before the early return (it needs `q`, not `display`), and let `optionLabelsOf` fall back to the
  option's letter/position ("grid 3") when its label is empty, never to the id.
- Proof: sweep percent_visual, identify_angles, name_2d_shapes over seeds 1-20: ticks == correct options on every key, no
  `/\bopt\d+\b/` in key text.

**D7 · major · C4 −2 (fractions stacked, never slashed) · slashed fractions in the Check-ALL prompt and on screen**
- Where: `L/.../sub_fractions_like/independent-p1.png` c, d ("less than 1/2"); select_equiv_frac ("equivalent to 1/2");
  card and worksheet options "2/5 + 3/5", "9/10 - 2/10" (`L/*/worksheet-1280.png`, `scr/*-ms-card-390.png`), inside the cell.
- Fix: apply the label regex of print-generate.js:5683 to `promptText` too; render the widget's option labels in
  `js/modules/widgets/multi-select-check.js` with `fracStackHTML`.
- Proof: no `/\b\d+\/\d+\b/` in the visible text of any Check-ALL cell, on paper or on screen.

**D8 · minor · C4 −1 · hyphen for minus in sub_fractions_like options**
- Where: `L/.../sub_fractions_like/independent-p1.png` c, d ("4/4 - 3/4"); `gen-fractions.js:341`, and the
  forced option at `:349-352`.
- Fix: `−` (U+2212) in the label, as the production items already use.
- Proof: grep the generated labels; the printed minus matches the production cells.

**D9 · major · C3 −2 (PAGEFILL, H13) · the page under-fills when a Check-ALL row joins it**
- Where: `probe-add/L-pupil-p1.png` (seed 11, independent L): 3 items, empty band from the grid's end to the footer
  = 31 % of the page height (389 of 1263 px at 110 dpi); `S/.../sub_fractions_like/independent-key-p1.png`: item d alone
  in its row, two empty cells (≈ 13 % of the page); `S/.../add_frac_unlike/more-practice-p1.png`: one empty cell.
- Fix: in print-sheet.js's planner, when full-width rows join a grid section, fill the freed height with further items
  (re-probe the count after the full-width rows are placed), and rebalance a short production row (2 + 2 + 2, not 3 + 1).
- Proof: `ws-print-lint` PAGEFILL at S and L over seeds 1-20 for the three skills: no strip > 20 %, no lone-item row.

**D10 · major · C1 −1, C3 −1 on screen · the Check-ALL card is a different kind of card**
- Where: `L/*/worksheet-1280.png` cards 1-2 (add like), 2, 3, 5 (sub like): a grey "Submit" button and a "0 of 5 selected"
  counter inside the paper cell, a "Click" verb (the swap map gives "Tap"), and options as tall pill buttons with an
  extra "☐" glyph, beside neighbours that are kit cells checked by "CHECK ALL".
- Fix: draw the Check-ALL item as the screen twin of the paper list (options in one row of check boxes or rings, as
  printed), keep Submit and the counter outside the cell, swap "Click" for "Tap".
- Proof: worksheet-1280 cards share one structure; no button inside `.ws-cell`.

## Change 3 (ws-screen-answer quiz 2/3) — not a hidden app bug

Every `showCelebrationModal` call (gamification.js:70, 97, 128, 193, 563) passes `autoDismissMs: 800`, and a backdrop tap
closes it. The test started the quiz synchronously after `checkAllWorksheet()` and typed within 500 ms, inside the 800 ms
window; a pupil has to navigate to a quiz, which stops the session timer (navigation.js:99, 155, 206), so the time
milestones cannot fire over a quiz. The test change is legitimate. (D2 is the real quiz defect it did not reach.)

## Change 5 (wording) — rejected

See D3. The wording matches the drawn check boxes but breaks P-LG-2 and P-LG-5 on every multi-select page and contradicts
the section line the adapter prints. The fix is in the shape (words to circle) or in the library, not in a new
per-cell sentence.

## What would raise each criterion to 10

- **C1:** one instruction per section (D3); the same answer slot on every production cell (D4); Check-ALL drawn and
  answerable on every host (D2, D10); no under-filled page (D9).
- **C2:** keys follow the paper instruction for every multi-select (D1, D6); slot shapes reveal nothing (D4); no two
  items of a page with the same answer "1" (more-practice L had 1/2 + 1/2 and 1/3 + 2/3).
- **C3:** fill the page after full-width rows; no lone item in a row (D9); one card type on the worksheet (D10).
- **C4:** stacked fractions and true minus everywhere (D7, D8); instruction strings from the library only (D3);
  the card's whole slot matching paper (D5).
