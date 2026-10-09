# Wave 1 lane "Place-value disks / unit_form on phones": independent critic, round 2

Tree `worktree-agent-a5e11bcf3d1414886` @ 3c241f4 (main 80fe5c9 merged). The round-2 work is all in 3c241f4:
`active-box.js` (`advanceIfFull`), `quiz-take.js` (`'pv'` field, `isAnswered` / `partial`), `screen-cell.js`,
`gen-pv.js`, `sheet/cells/pv.js`, SP-11a and STATUS.

## Verdict: FAIL

Six of the seven round-1 defects are fixed, and the quiz "lost 0" is gone. Two problems remain:

- **New regression.** The quiz's new "partial" rule marks right word-problem answers as **unanswered**.
- **D1 is still open on the practice card.** After a wrong digit, the next digits still join the same unit-form box.

| Host | C1 Ease | C2 Teach | C3 Layout | C4 Standard | Note |
|---|---|---|---|---|---|
| Print, independent / more-practice / guided / review / test / error analysis, S and L | 9 | 8 | 8 | 9 | Lint: 12 documents per size, 0 findings, after the `frameHTML` change. |
| Practice card 390 / 1280 | **7** | 8 | 8 | 8 | N2: a unit-form box still takes 4 digits on the card. The label is fixed (D3). |
| Online worksheet 390 / 1280 | 8 | 8 | 8 | 8 | Each box takes 1 digit, and a full box hands the caret on. A wrong digit turns red when the caret leaves. |
| Quiz 390 / 1280 | **6** | 8 | 8 | 8 | N1: right word-problem answers count as unanswered (a regression; main counts them). The lane's own skills are fine. |

## Round-1 defects, re-proven

| r1 | Status | Evidence |
|---|---|---|
| D1 quiz: typing straight through joins box 1 | **Fixed (quiz, worksheet). Still open on the card (N2).** | `quiz-typing-repro.cjs`: 730, 770, 7330 and 7026 land one digit per box at 390 and 1280. Review 4 answered; score 100 %. |
| D2 quiz count task shows the read instruction | Fixed | `'pv'` is in `QUIZ_CELL_FIELDS`. The quiz shows "Count the disks in the zone. Type how many." (`r2-quiz-390-pd-count.png`). |
| D3 "hundreds disks:" at two sizes | Fixed | Both words are 25.72 px at 390 and 36.0 px at 1280, on the same baseline, on all three hosts. |
| D4 four-zone mat swipes on a phone | Recorded as provisional | SP-11a is extended to the four-zone disk mat "provisionally". The STATUS row and the owner question are present. |
| D5 "749 / = __ tens 9 ones" | Fixed for that form. **The other rename form still breaks before "=" (N3).** | "556 = [ ] tens 6 ones" is one line on the card and quiz at 390. |
| D6 "1 ones" | Fixed | 300 `unit_form` answers at 9,999: no "1 ones", "1 tens" and so on, and no "5 one". |
| D7 resize listener per render | Fixed | Code read: one `window` resize listener updates every `.mq-diskwin` that is in the page now. |

## New and remaining defects, ranked

1. **N1 — C1, major, regression (quiz, every width, app-wide).**
   - **Where:** word-problem answers whose answer row is wider than the answer. A leading box is meant to stay blank (`data-mq-expect=""`).
   - **What:** the pupil types the right answer. `recordAnswer` marks it `partial`, because one `input.mq-cellslot` is empty. The review then says "0 answered, 4 unanswered" while the score is 4/4. The question dots are not marked answered either.
   - **Skills:** `addition:add_wp_100`, `addition:add_wp_1k`, `multiplication:mult_word_problems`, `algebra:multi_step_word`, `addition:add_word_problems` and `division:div_word_problems`, at 390 and 1280.
   - **Main** (`claude/sweet-newton-c8wrv1`, 024b6d5) shows "4 answered".
   - **Why it matters:** the review pushes a pupil to "fill" a box that should stay blank, for example by typing a leading 0.
   - **Reproduce:** `node design/audit/runs/placevalue-phones/r2-quiz-partial-probe.cjs`. Run it with `MQ_TREE=/home/user/MathQuest` to see the main behaviour.
   - **Fix:** do not treat empty leading boxes of a number row as missing.
     - Option one: in a `.mq-wwans` row, the answer is partial only when an empty box sits to the right of a filled one.
     - Option two: limit the check to boxes that must all be filled (`data-mq-fixed` slots, inline blanks, cloze).

2. **N2 — C1, major (practice card, every width).** This is the rest of r1 D1.
   - **What:** on the card, the unit-form place boxes are the card's own `input.ib-cell`.
     - `question-render.js:83` gives them `maxlength = max(3, w + 2)` = 4.
     - `question-render.js:1654-1663` moves them into the kit slot. It ignores the slot's `data-mq-fixed` / `data-mq-w=1`.
   - **Result:** the caret moves on only after a right digit. A wrong digit swallows the next ones:

     | Item | Typed straight through | Boxes |
     |---|---|---|
     | 730 | 830 | `[830 red \| \| ]` |
     | 7026 | 7126 | `[7 \| 126 red \| \| ]` |
     | 405 | 415 | `[4 \| 15 red \| ]` |

     The quiz and the worksheet give 1 digit per box for the same typing.
   - **Reproduce:** `node design/audit/runs/placevalue-phones/r2-card-uf-repro.cjs`.
   - **Fix:** when an `ib-cell` moves into a slot with `data-mq-fixed="1"`, set its `maxlength` to the slot's `data-mq-w`. `advanceIfFull` then hands the caret on, as it does on the other two hosts.

3. **N3 — C3, minor (every host).**
   - **Where:** the second rename form, "6 hundreds 15 tens = ___".
   - **What:** the line breaks before "=" in two places:
     - at 390 on the card, worksheet and quiz;
     - in the worksheet's narrow cells at 820 and 1280.
   - **Worse:** at 390 the quiz also splits a number from its unit: "3 thousands 12 / hundreds / = [ ]" (`r2-quiz-390-uf-rename-wrap.png`).
   - **Cause:** `frameHTML` (`sheet/cells/pv.js`) keeps a label of 2 words or fewer whole. For a longer label it keeps only the last word, "=", with the slot.
   - **Fix:** never break inside "number + unit word", and keep the last pair with the slot: "12 hundreds = [ ]".

## The app-wide caret change (`advanceIfFull`): attack results

I typed straight through **32 multi-box skills** on card, worksheet and quiz, at 390 (touch) and 1280.

- **Modes:** right digits, and wrong digits (card and worksheet). After each key I recorded where the caret is, every box's value and its mark.
- **Skills:** column add and subtract with carry and regroup boxes, `multiply`, `area_model_mult`, fact families and number families, `count_by_tables`, `mult_missing_digit`, `long_div_2digit`, `div_remainders`, `box_division_easy`, fractions (`equivalent`, `improper_mixed`, `add_mixed_like`, `add_fractions_like`), `add_decimal`, `coordinate_q1`, `time_quarter`, `money_notation`, `elapsed_find_duration`, `expand`, `unit_form`, `place_value_disks`, `cloze_addition`, word-work (`add_wp_100`, `sub_wp_100`, `multi_step_word`), `function_table_easy` and `hundreds_chart_fill`.

What I found:

- **Where the caret goes.** It never jumped into a box that was already filled. It never left the problem, except for the worksheet's own move to the next card once a card is complete, which is by design. It skipped the optional carry and regroup boxes. It never moved out of a box with no `maxlength`, such as fact-family or expanded-form inputs.
- **Wrong digits.** Every wrong box turned red (A2) when the caret moved on. The one exception was when Tab went to the item's own control, where by design it is not judged. A wrong digit is never hidden by the move.
- **Lost keys.** No key was lost while an empty box remained, with two exceptions, both by design and not from this change:
  - Count-by rows are excluded from the rule. In the quiz, the 4-character box takes "7777" and the caret stays.
  - Word-work sign boxes refuse digits.
- **Backspace.** It stays in the box and removes one character. Two behaviours were already in the widgets: in long division, Backspace in an empty box moves back; in the worksheet, a red `div_remainders` box is cleared whole (A3).
- **Focus fights.** I saw none with auto-select or touch-tap. The A3 test "auto-advance: digits land in the tapped card" passes at 390.

## Gates (this tree)

- `ws-boot-smoke`: OK.
- `wave1-a-probe`: OK.
- `wave1-a2-perbox`: OK.
- `wave1-a3-wrongdigits`: OK.
- `wave1-c2-phone`: OK.
- `ws-screen-answer` (default list): OK.
- `ws-screen-answer --family pv`: OK.
- `ws-screen-slots`: OK. 609 skills, 2,436 host renders, 0 doubled answer areas.
- `ws-print-lint --source kit` (both skills, 6 roles, S and L): OK, 0 findings.
- `quiz-typing-repro.cjs`: all right.
- **`fractions:equivalent_fractions` card "no answer control (text)":** this failure is **not from this lane**. It fails exactly the same on main (`/home/user/MathQuest`, `claude/sweet-newton-c8wrv1` @ 024b6d5). The worksheet and quiz pass. `fractions:equivalent` passes on every host in both trees.

## Merge

- `claude/sweet-newton-c8wrv1` has moved to 024b6d5, so it is no longer an ancestor of HEAD.
- `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` gives a clean tree, with no conflicts.

## Housekeeping

The tree has uncommitted, changed screenshots in `design/audit/runs/wave1-A-fix/*.png`. They were already changed before this critic ran, and gate runs rewrite them. This critic did not commit them.
