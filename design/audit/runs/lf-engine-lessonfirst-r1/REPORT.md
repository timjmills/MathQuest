# lf-engine-lessonfirst, shared narrow critic r1: FAIL

| | |
|---|---|
| Head | a11c1bbfb |
| Graded | Files and PNGs only, under the budget stop |
| Critic | Independent, medium |
| Saved by | lf-engine (the critic could not write) |

**Verdict.** All three targeted defects are fixed (blank first page, same "11 × n" opener, two_step_letter_equation overflow), and the lane is a strict improvement. But the pages that now open the empty-first lessons score below 8. Their defects were already there; removing the blank page put them on top.

## Scores

| After pupil page (M; S3/S6 also L) | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Y4.B4.S11 | 6 | 5 | 6 | 6 |
| Y4.B5.S1 | 6 | 5 | 6 | 6 |
| Y4.B6.S3 (L) | 6 | 5 | 6 | 5 |
| Y3.B12.S4 | 4 | 5 | 5 | 6 |
| Y4.B12.S2 | 7 | 5 | 5 | 7 |
| Y4.B4.S2–S5 (chart) | 8 | 8 | 6 | 7 |
| two_step_letter_equation (accepted for now by lead ruling) | 8 | 8 | 6 | 8 |

**Keys:** they match their pupil pages, and the answers checked are correct.

## Findings

All of these were already present.

1. **No model and an empty Steps column.** Lessons with no library record open with no model ("I do") and an empty Steps column.
   - Check: LESSON-NO-MODEL, which flags 0 chart states or a Steps zone with no ink.
2. **Instructions that do not match their items.**
   - S11 says "Look at the array. Write two facts." but there is no array and only one fact.
   - S11 asks "What is 1 × 7?" but prints 7 × 1.
   - Check: the instruction's noun against the cell template, and the question text against the equation's operand order.
3. **Doubled answer slots** on S3 (Area) and S1 (factor pairs).
   - Check: H16, the number of answer slots per cell.
4. **Y4.B6.S3: a blue hint box, and a Warm-up that deals area in a perimeter lesson.**
   - Check: an H4 ink-colour scan on lesson sheets, and the content audit on the Warm-up pool.
5. **Y3.B12.S4 Guided chart:** the axis is labelled 1.8, 3.7 …; "Draw a bar…" overlaps the labels; the axis text is tiny.
   - Check: integer axis ticks, and text overlap.
6. **Times-table chart panels are about 50 % empty.**
   - Check: H13 on chart panels.

## Answers to the brief's questions

**3. Does the gate mirror the print request?**
- With `--req print`, yes: the gate uses the same wrmLessonSeed and wrmLessonVariant as printLesson.
- With `--req packet`, no screen sends a variant, so the gate's header should say so.
- In effect the gate also loosens: 10 consecutive steps send byte-identical requests and now pass only because their seeds differ.
- Add LESSON-STEP-SAME-REQ: warn when consecutive steps have the same skill and options.

**4. The six OPENER-SAME pairs.** Five are real misfires and one (Y4.B14.S4/S5) is real.
- The misfires come from openers with no numbers or an empty stack (`swaps.size === 0` counts as the same), and from "n ÷ 10", which can never pass.
- Fix for lf-checks:
  - build the signature from the numbers plus the drawing (an svg geometry hash and the stack digit spans);
  - do not apply the one-swap mask when only one number varies.
- The real pair, Y4.B14.S4/S5 (geo_rotate), is fixed in the step's links or pool, not by tuning the seed.

**5. two_step_letter_equation:** 4 pages at about 45 % blank is better than an H2 overflow. It is accepted for now by the lead's ruling, and the content fix belongs to lf-algebra.

**6. CELL-FITS** is sound for what it judges, with no false fails seen. It leaves these gaps:
- the precritic gate never passes `--key`;
- only library lessons are checked, not WRM packets;
- ink outside a `.ws-cell` (Say, Rule, headers) is not judged;
- a nested `.ws-cell` that overflows its parent is skipped;
- it runs at one seed only.
