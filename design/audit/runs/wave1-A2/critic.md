# Wave 1 / A2 critic: per-box green and red feedback

Graded commit 11541d7 (no newer commits at grading time). Critic: Opus, low effort, independent.

## Verdict: PASS (C1 8 · C2 8 · C3 9 · C4 8)

Runs:
- `wave1-a2-perbox.cjs`: OK. All PASS at 1280 and 390, on the card and the worksheet. The quiz shows no colour, and there were no console errors.
- `ws-screen-answer.cjs` on the four skills: OK, including the live-green row.
- My own premature-red probe on the practice card's single box. It reloads before each case and types one key at a time:

| Expected / typed | Trail | On blur |
|---|---|---|
| 1200 / `1,200` | neutral until `1,200`, then G | G |
| 1200 / `1 200` | neutral until the end, then G | G |
| 0.5 / `.5` | `.5` G | G |
| 0.5 / `0.50` | G from `0.5` | G |
| 12.5 / `12.50` | G from `12.5` | G |
| -12 / `-12` | G at the end | G |
| 3 / `3.0` | G throughout | G |
| 7 / `07` | **`0` goes RED**, then `07` G | G |
| text 3/4 / `6/8`, text 3:05 / `3:5` | never judged on fill (waits for Check) | neutral |
| 12 / `1`, then blur (pressing Read or Hint) | neutral | **RED** |

Commas, spaces, decimals, trailing zeros and negatives never go red while a correct entry is still being typed. Fraction and time answers are left to the checker, so their equivalent forms are never painted red.

I viewed all 18 PNGs.

## Defects (ranked, §6 form)

1. **C1, minor, -1 point.** Where: `js/modules/screen-cell.js` `_liveBind`, the blur listener calling `_liveMark(el, true)`. Observed: a pupil types `1` toward 12 and taps Read or Hint (the input blurs), and the box turns red with a cross although the entry is unfinished. Expected: an unfinished entry is not judged wrong. Fix: on blur, mark red only if `relatedTarget` is not the item's own Hint, Read or Check controls. Or delay the blur verdict until the focus moves to another answer box or Check is pressed.
2. **C1, minor.** Where: `screen-cell.js` `_liveMark`, the rule `v.length >= maxLen`. Observed: answer 7, the pupil types `0` (heading for `07`) and gets red at once, but the checker (`Number("07") === 7`) accepts `07`. Expected: no red on a prefix that can still become an accepted value. Fix: for a numeric box, skip the length rule while the normalised value is only zeros or still has a leading zero.
3. **C2, minor, -1 point.** Where: `answer-check.js` and `worksheet.js`. A red box adds no wrong try, and XP is awarded on the whole-item Check. Observed: a pupil can cycle digits in each box until it turns green, then press Check and get first-try XP with zero wrong tries. Live green already allowed this before A2; red makes it faster. The owner asked for the feature, so this is not a blocker. Fix: count the item as "assisted" if any of its boxes went red before Check, and award reduced XP or no streak for it, without adding a Skip try.
4. **C1/C4, minor.** Where: PNG `worksheet-add_facts-green-390.png` / `-1280.png`, item 1. Observed: the box is green with a tick and the header badge shows a tick, but the caption still reads "Not yet. Use the touch dots, then try again." The colour and the message contradict each other. This may predate A2, but the new green makes it obvious. Fix: in `checkWorksheetAnswer`, clear the support-ladder or "Not yet" line on the correct path.
5. **C1/C4, minor.** Where: `css/screen-cell.css`, the corner marks at `background-size:13px`. Observed: at 390 the tick and cross are about 13 px with a stroke of about 2.2 px (`card-count_by_tables-...-390.png`, the 55 box). The pale green and pale pink fills have nearly the same lightness, so for a pupil with red-green colour blindness the 13 px mark is the only cue. INK-6 is met, but only barely. Fix: make the marks 16 to 18 px with a stroke of about 3 px on phone widths, or make the red border dashed and the green border solid so the shape carries the verdict.
6. **Note on the rubric's H4 cap.** H4 counts colour inside the on-screen cell. The owner's ruling (green and red per box, on screen only) overrides H4 for this feature, so I have not applied the cap. Print is protected: the marks are stripped under `@media print`, and print renders through the sheet kit, not the screen DOM.

## Checks asked for

- **What changed for quiz users.** Before A2, a quiz with `showFeedback === 'instant'` turned each box green live as it was typed (the `wireLiveCorrect` call in `quiz-take.js` `_mountQuizCell`). That is now removed. In every quiz mode a box stays neutral until the quiz's own feedback runs, and the support ladder (`drawLadder`) is still drawn in instant mode. This removes an existing feature. It matches the owner's "NOT in quizzes", but the owner should confirm they meant to drop the existing live green as well as not adding red.
- **The `ws-screen-answer` assertion.** It was updated legitimately, not weakened. It now asserts no green in both `end` and `instant` mode, which is stricter and matches the ruling.
- **Contrast.** `--mq-box-ok` #1B7A43 is about 5.6:1 on white and about 4.9:1 on #E3F4EA. `--mq-box-bad` #B3261E is about 6.5:1 on white and about 5.6:1 on #FDE7E4. The digits stay black. All pass AA for the 3 px borders and the marks. The yellow focus pulse overrides the fill while the box is focused, and the corner mark still shows.
- **Reduced motion.** No animation was added.
- **Print.** Guarded.
