# Small fixes lane — independent critic, round 1

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `ca2daf6`, diff `72e05d7..HEAD`. Chromebook first (1366x650, 1280x600,
mouse + touch), phone 390 basic only (STATUS §00). Browser runs were done one at a time. Evidence is in `r1/`.

Gates and probes I re-ran: `small-fixes-countrow-caret` OK, `hint-popup-e2e` (incl. [17]) ALL PASSED, `small-fixes-equiv-frac` OK,
`ws-screen-answer --skills fractions:equivalent_fractions` OK, `small-fixes-quiz-wordrow` OK, `small-fixes-xp-burst` OK,
`small-fixes-no-start-toast` OK, `ws-boot-smoke` OK, and `node --input-type=module --check` on all 11 changed modules OK.
The probes pass. The defects below are the cases the probes do not exercise.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret hand-on | Quiz 1366/1280 | **7** | **7** | 8 | 8 | FAIL |
| 1 | | Practice card 1366/1280 | **7** | **7** | 8 | 8 | FAIL |
| 1 | | Online worksheet 1366/1280 | **7** | **7** | 8 | 8 | FAIL |
| 1 | | Phone 390 swipe row (basic) | 8 | – | 8 | – | ok |
| 2 | Word-problem hint in flow | Card, story skills (`.mq-wwstory`: add/sub/mult/multi-step word) 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 2 | | Card, other word skills (`unit_conversion_word`, `frac_word_problems`) 1366/1280 | **7** | 8 | **7** | 8 | FAIL |
| 3 | Unknown fractions id → num/den boxes | Card 1366/1280 | **7** | 8 | **7** | 8 | FAIL |
| 3 | | Worksheet 1366/1280 | **7** | 8 | **7** | 8 | FAIL |
| 3 | | Quiz 1366/1280 | **7** | 8 | **7** | 8 | FAIL |
| 4 | Quiz word rows: back / partial / dots | Quiz 1366/1280 | **7** | 8 | 8 | 8 | FAIL |
| 5 | XP burst at the score | Card / boss / race 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 6 | No start toast in play | Card / boss / race / worksheet 1366/1280 | 9 | 8 | 9 | 8 | pass |
| 7 | Count row wraps in the Model cell | Opener S/M/L, A4 + Letter (default options) | 8 | 8 | 8 | 8 | pass |
| 7 | | Opener with "All rows on one page" (S/M/L) | **4** | 7 | **3** | **5** | FAIL |
| 7 | | Scripted model S/M/L; independent / more-practice / guided / test (unchanged) | 8 | 8 | 8 | 8 | pass (byte-identical to main) |

## Defects

**D1 · High · Fix 1: an answer that is too long breaks up and pushes every later box along; the caret also shows how many digits the answer has.**
`data-mq-full` is the digit count of *that box's own answer*. Repro: quiz at 1366x650, `multiplication:count_by_tables`,
opts `{rows:[{step:3,start:'step',dir:'up'}]}`, seed 11 (blank boxes 9, 21, 24, 27, 36). Click the first box and type `12` then `15`:
the boxes read `1 | 21 | 5 | …`. The caret jumped after the `1` because the answer 9 has one digit. The `2` landed in box 2, `1` joined it as
"21", and every later box is now one place out of step. The card and the worksheet behave the same. The caret also gives the answer away at a
digit boundary. Where 9 is the answer, typing `1` jumps at once ("you are done"). Where 100 is the answer, typing `90` keeps the caret
("not finished yet"). So the caret's behaviour tells the pupil whether their number has the right length (RUBRIC C2: nothing gives the
answer away). Evidence: `r1/c1-card-lines-by25-1366x650.png` shows `50` held in a 3-digit box, then `9` spilling into the next box.
*What a fix must do:* the hand-on count must not come from the box's own answer. Use something the pupil can already see, such as the row's
widest printed number, or move on only when the numbers in the row all have the same length. At a boundary, do not auto-advance and let
Space, comma or Enter move the caret. A too-long number must stay in the box the pupil is typing in. The probe should also type one wrong
number that is too long and one that is too short across a 9→12 and a 75→100 boundary.

**D2 · Medium · Fix 2: on word skills without a `.mq-wwstory` block, the hint goes under the whole drawing and working, not under the story; the
story scrolls off screen and the pinned Check bar sits on the hint.**
Repro: practice card at 1366x650, `measurement:unit_conversion_word`, click Hint. `_wordProblemStoryAnchor` falls back to `#visualAid`
(the story, the conversion table *and* the multiply working). The hint is placed after all of it at y 477–642. The scroll puts the hint's
bottom at innerHeight−8 and ignores the pinned bottom bar (Hint/Read/CHECK, y≈599–645). The bar therefore covers the bottom 45 px of the hint
panel, and the story is above the fold (`r1/c2-hint-unit_conversion_word-1366x650.png`). `fractions:frac_word_problems` at 1280x600 is the
same: the hint lands below the selection grid, wider than the question cell (85–1195 px against 280–1000 px).
*What a fix must do:* anchor directly under the story text, using the question text block, not the whole visual. Size the hint to the
question cell's width. Take the pinned bottom bar's height off the scroll target so nothing in the hint sits under it. Extend check [17] to one
non-`mq-wwstory` word skill.

**D3 · Medium · Fix 3: the new numerator/denominator inputs are 40 x 44 px with 16 px digits.**
Repro: card at 1366x650 or 390, `fractions:equivalent_fractions` (seed 5, "Simplify: 20/24"). Each `input.mq-cellslot` measures 40 x 44 and
its font-size is 16 px. The given fraction's digits are about 30 px. RUBRIC C1 asks for digit inputs ≥ 48 px tall, and C3 asks for answer
digits at the card scale (56 px desktop, 29 px worksheet). The answer is the smallest number on the card (`r1/c3-card-1280x600-wrong.png`;
worksheet and quiz are the same). The boxes come from `width:2.4em;height:1.5em` at the legacy visual's small inherited font.
*What a fix must do:* size the two boxes and their digits from the card's digit scale, at least matching the given fraction's digit size and
≥ 48 px tall, on all three hosts. Side note, not this lane: the wrong-answer "Here is how" panel shows "2. Answer: ____", a paper blank on
screen. No live skill reaches this branch; I checked every SKILLS id across 6 seeds.

**D4 · Medium · Fix 4: going back restores the answer row only; the pupil's sign, number sentence and column working are wiped.**
Repro: quiz at 1366x650, `addition:add_word_problems` (seeds 5–7). Tap `+`, fill the number-sentence and column-working boxes and the
answer row, then Next and Previous. The answer row comes back (`2|3|4`), but all 10 working boxes are empty and no sign is selected
(`r1/c4-quiz-back-add_word_problems.png`). `recordAnswer` saves `boxes` from every `input.mq-cellslot` in the card. `wireCellSlots`
uses the saved list only when its length equals that cell's slot count, so the working list never matches and is dropped. A pupil who comes
back to check their work finds it gone, which is the same class of bug this fix was meant to close.
*What a fix must do:* keep and restore every box in the item (working, number sentence, sign/unit choice) keyed by slot, not just the answer
join. Then extend `small-fixes-quiz-wordrow` to fill the working and the sign and check them after going back.

**D5 · High · Fix 7: the Opener with "All rows on one page" still runs out of its Model cell, over the Steps text and off the left of the page.**
Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables', opts:{onePage:true}}]}], size:'M'})`,
which looks the same at S and L. The model row spans x 57–571 px against the Steps column at x 421, so it runs about 150 px (about 38 mm)
over the Steps text. The jump tab and first number sit outside the cell's left border (`r1/c7-opener-M-onepage-overflow.png`). The HTML is
byte-identical to main, because `narrowCols` returns 1 whenever `p.compact`. Options travel into every role (CLAUDE.md), so a teacher who
ticks "All rows on one page" and prints the lesson opener gets this page.
*What a fix must do:* a compact row placed in a narrow Model cell must also wrap to the cell, for example by dropping `compact` for the model
cell or letting `narrowCols` apply to compact rows. The one-page **independent** sheet must stay as it is. Add opener + onePage to the render
check. The default opener renders correctly: the row wraps to 4 lines of 3 inside the cell and the digits are not shrunk
(`r1/c7-opener-L-default-wrapped.png`). Independent, more-practice, guided, test and scripted-model HTML is byte-identical to main for
{default, onePage, Lines, by 25} × S/M/L, so the claim that those sheets are unchanged holds. Scripted-model never changed: its Model cell is
full width, so it had nothing to fix.

**D6 · Low (does not fail) · Fix 6: `showMixedPlayToast` is a separate toast that the new watcher does not cover.**
`playWithLastSettings()` with no saved settings shows "Playing all skills at easy difficulty!" (fixed, bottom 80 px) for 2.8 s, then opens the
student-choice modal. If the pupil picks within about 2 s, the toast shows over the first question near the Check bar. *Fix:* send it
through `showToast`, or give it the same watcher.

**Note (fix 5, judged acceptable):** at 1280x600 in boss and race, the burst covers the start of the topic label ("Mixed …") in the play bar
for about 1.5 s (`r1/xp-boss-1280x600.png`). It never touches the question card: 0 of about 90 samples intersect it. That is chrome
covering chrome, briefly, so C1 stays at 8.

## Verdict

**FAIL.** Fixes 5 and 6 pass, and fix 7 passes on its default path. Fixes 1, 2, 3, 4 and 7 (opener + "All rows on one page") each have a
criterion below 8: D1, D2, D3, D4, D5.
