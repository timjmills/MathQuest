# Critic: number families in any order and the touch-dot floor (commit 84f22ad)

Critic: independent, Opus medium, 2026-10-04. Tree: `claude/sweet-newton-c8wrv1` at 84f22ad. I edited no project file.
Baseline: the pre-change tree (`git archive 84f22ad^`) served through `MQ_ROOT` for side-by-side runs.

## Verdict: PASS (scoped to this change)

| Host | C1 Ease | C2 Teaching | C3 Spacing | C4 Fidelity | Caps |
|---|---|---|---|---|---|
| Practice card (number families: add, mult, mixed; levels 0/1/2) | 8 | 9 | 8 | 8 | none |
| Online worksheet (families plus the touch-dot cells at 1280 and 390) | 8 | 8 | 9 | 8 | none |
| Quiz (families, recorded correctness) | 8 | 9 | 8 | 8 | none |

These scores cover only what the commit changes: how the families are judged, and how big the touch-dot digits are.
The family drawing still uses the legacy colour look (purple title, coloured row borders, a "Check Answers" button,
non-Andika numerals). That look is unchanged here and is not counted against this commit. It is listed as P-1 under
pre-existing problems so it does not get lost.

## What was verified

### 1. The judge, unit-tested in node (`import` of `js/modules/number-family-check.js`): 33 of 33 cases right
- The owner's case, 3, 8, 24 at Hard: `24 ÷ 8 = 3` in row 3 and `24 ÷ 3 = 8` in row 4 is right. The key order is right.
  The two × rows swapped are right.
- These are scored wrong: the same × fact in two rows, the same ÷ fact in two rows, a × fact in a ÷ row, a wrong number,
  one empty box, a non-number ("24a"), all boxes empty, and another family with the same total (2 + 6 = 8 for 3, 5, 8).
- Medium (two blanks per row): printed numbers are kept. In `24 ÷ _ = _` beside `_ ÷ 8 = _`, writing `24 ÷ 8 = 3` in
  the first row forces a repeat, which is scored wrong (correct).
- Easy: right and wrong cases behave as before.
- Squares (4 × 4, two rows) and doubles (4 + 4 = 8 printed twice, so it may be written twice) are right.
- The mixed family: any order is right, a + fact in a × row is wrong, and the 2, 2 square is right.
- `familyComposedRight` (the quiz's joined value): a swap is right; a repeat, a short list or an empty part is wrong.
- `isOrderFreeFamily({})` is false, so data without `numberFamilyData` falls back to the old checker.
- Lenient inputs "024" and "24.0" are accepted. That matches how `_num` normalises numbers and is acceptable.

### 2. The hosts agree (in the browser, through `/tmp/mq-browser-run.sh`)
Test matrix: 3 skills × 3 levels × {swap, key, dup, wrong sign} on the card, the worksheet and the quiz. Script:
scratchpad `nfc/adv.cjs`. No page errors.
- **Card**: in every row, a right family adds 1 to the score, records "correct" and shows no red box. A wrong family
  scores 0, records "incorrect" and puts red on the right boxes (the repeated row, or the wrong-sign row).
- **Worksheet**: the swapped and key families turn the card green with "Perfect! All answers correct!". A wrong
  family shows "n/N correct" with red boxes. **Check all** (`checkAllWorksheet`, which grades through `slotAnswerMatches`
  → `familyComposedRight`) gives mult 1/2, add 1/2, mixed 2/2 and 1/2, as expected.
  Baseline: the old tree scored **0/2 in every case**, so Check all never counted a family right before this change.
  That is fixed here, as a side effect.
- **Quiz**: `state.currentQuizResult.answers[0].correct` matched the expected value in all 27 runs, including the mixed
  family's 24-box swap. The quiz draws its boxes in row order, so the reading order `familyComposedRight` assumes holds.
- **Live marks**: on the card, `mq-live-correct` and `mq-live-wrong` (the `_bindOwnBoxes` group) and
  `box-correct` and `box-wrong` (`wireBoxValidation` judge) agree with the final verdict. A row that is half-typed in
  another valid order turns green, where the old checker turned it red. The mq-live layer shows no red until the box is
  left.
- **Old saved quizzes** (`numberFamilyData` deleted): they fall back to the old path, and the result is the same as
  before, including the old leniency (see P-2).
- **Fact families** (`add_sub_fact_family`, `mult_div_fact_family`): `answerType` is `fact-family` and they carry no
  `numberFamilyData`. Every new branch is gated on `isOrderFreeFamily` or the `number-family-input` class, so none of
  them runs. Filled with the key: `lastAnswerCorrect` is true and no box is red.

### 3. Touch-dot floor (scratchpad `nfc/touch.cjs`; add, subtract and add_facts; touchall vs none; 1280 and 390)
| Host | Touch dots on | Touch dots off |
|---|---|---|
| Worksheet 1280 | `--mq-digit` 40px, `.ws-td` 40 px, 6 cards | 29px |
| Worksheet 390 | 40 px | 29px |
| Card 1280 / 390 | 56 / 40 px (unchanged) | 56 / 40 px |
| Quiz | draws no touch dots (unchanged) | 56 / 40 px |

At both widths: nothing in any card lies outside its card, no cell scrolls, the answer input sits fully inside its
card, and the page does not scroll sideways. Touch dots at 40 px are now the same size as the phone card's
(4.9 px single dot). Before, they were 29/40 of that. This meets the SUPPORTS.md S1.6 floor (≥ 40 px on screen).
`ws-boot-smoke`: OK. `node --input-type=module --check` passes on all five changed modules.

## Defects (none blocking)

| # | Sev | Criterion | Where | What | Fix | Proof |
|---|---|---|---|---|---|---|
| D1 | minor | C1 −0 (nit) | `number-family-check.js` `judgeFamily` pass 1 | Rows claim facts in **row-index** order, not the order the pupil finished them (the comment says "first finished row claims"). Card test: the pupil completes row 2 with `a × b`, then row 1 with the same fact. Row 2, the one finished first, turns red and row 1 stays green. | When two full rows hold the same fact, mark both rows' boxes red, or claim by focus or input order. Also correct the comment. | In `adv.cjs`, the "dup typed row1 first then row0" case: red lands on the later-typed row, or on both. |
| D2 | minor | C2 −0 (nit) | same, Medium level | `24 ÷ _ = _` (row 3) and `_ ÷ 8 = _` (row 4): a pupil writes `24 ÷ 8 = 3` in row 3. Row 3 claims the fact first, so the **forced** row 4 goes red even though its printed 8 leaves it only one choice. The pupil's actual choice is in row 3. | Claim facts for the most constrained rows first (fewest facts that fit the printed numbers), then the rest. | Unit case: add Medium `[[3,5,8],[5,3,8],[8,5,3],[8,5,3]]` gives red on row 3 and not row 4. |
| D3 | minor | process | `index.html` | `ws-stamp-assets --check`: FAIL (stale). The new module and five changed files are not cache-busted, so a deploy without stamping serves the old checker from cache. | Run `node tests/scripts/ws-stamp-assets.cjs` before deploying. | `--check` prints OK. |
| D4 | minor | C3 −0 (unverified risk) | `css/screen-cell.css:1707` | The 40 px floor applies per cell. On a mixed worksheet where some items carry touch dots and others do not (e.g. "count on" with dots allocated to only some items, or a mixed review), neighbouring cards would show 40 px and 29 px digits. I did not observe this. Every touch run gave 40 px in all 6 cards. | If it happens, raise every cell of that worksheet section to 40 px when any cell has `.ws-td`. | Mixed worksheet with touch on: all `--mq-digit` values are equal. |
| D5 | nit | docs | commit message and CSS comment | They cite "SF-34". SF-34 is the × ÷ fade ladder. The 40 px screen floor is SUPPORTS.md S1.6 (`TOUCH_DOT_MIN`). | Change the comment to "SUPPORTS S1.6". | grep. |
| D6 | nit | test | `tests/scripts/wave1-number-family-order.cjs` | The probe counts a card as right when `hasAnswered === true`, which is also true after a wrong answer. Its quiz check calls `slotAnswerMatches` itself instead of reading the recorded `currentQuizResult.answers[i].correct`. It cannot catch a host that scores wrong. | Card: assert the `state.score` change and the `questionHistory` status. Quiz: assert `state.currentQuizResult.answers[0].correct`. Add a Check all assertion for the worksheet. | `adv.cjs` and `dbg2.cjs` in the critic scratchpad do this. |

## Pre-existing problems this change did not cause (for the queue, not counted here)
- **P-1** The number-family drawing (`gen-operations.js` ~3700–4010) is the legacy colour card: purple title, green and
  orange row borders, a coloured "Check Answers" button, and numerals that are not Andika in the cell. As a full skill
  grade this would hit H4 (C4 ≤ 5).
- **P-2** Old saved quizzes (no `numberFamilyData`) are graded by `recordAnswer`'s `parseFloat` fallback.
  `"5, 3, 15, 5, 3, 15, …"` against `q.ans` `"5, 3, 15"` compares 5 with 5, so **any** family whose first box is right
  is recorded correct, repeats included. This is unchanged, as the brief requires. Fixing it means grading old quizzes
  on the first number only.
- **P-3** On a wrong worksheet family, `checkWorksheetNumberFamily` sets a red card background, but something
  clears it right after. The card ends with no tint and only the "n/N correct" text. The old tree does the same.
- **P-4** `wireBoxValidation` paints `box-wrong` on the first digit of a two-digit answer while the pupil is still
  typing it ("1" of 12). The old tree does the same.
- **P-5** The touch-dot tap target in SUPPORTS.md S1.8 (an invisible 44 × 44 px button per number, `touchDotNearest`) is
  not wired on any screen host. The dots are drawn but cannot be tapped. That is the other half of "touchpoints
  might be too small".
- **P-6** The quiz draws no touch dots even when the skill's support option is on.

## What would raise each score to 10
- C1: D1 and D2 (red lands on the row the pupil actually got wrong), plus P-4.
- C2: a "this fact is already used" cue on a repeated row rather than only red digits. Today the red marks still point
  at the digits of the nearest unused fact.
- C3: D4 confirmed or ruled out on a mixed worksheet.
- C4: P-1 (move the family to a kit template: black and white, Andika, no Check button inside the cell).
