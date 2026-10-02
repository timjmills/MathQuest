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

---

# Round 2

Graded commit 41cb2af (on top of 11541d7). Critic: Opus, low effort, independent. No code edited.

## Verdict: FAIL (C1 7 · C2 8 · C3 7 · C4 8)

## Runs

- `wave1-a2-perbox.cjs` (this tree): **OK**. Every line PASS at 1280 and 390, on the card, the worksheet and the quiz. That covers the 10 new types, Hint after a half-typed entry, the leading zero, clean versus helped XP (+10 / +5, streak, progress miss then hit), make-your-own tables, no quiz colour, and no console errors.
- `ws-screen-answer.cjs --skills addition:add_sub_fact_family,addition:number_families_add,multiplication:area_model_mult,placevalue:expand,area_perimeter:area_perimeter,fractions:mixed_improper_visual,integers:order_negatives,number_theory:factors_identify,coordinates:coordinate_graph,algebra:function_table_easy`. These are the ten skills from `wave1-a2-perbox.cjs` SCENARIOS. I ran it from `/home/user/MathQuest` (claude/sweet-newton-c8wrv1, 4911898) and from this tree, through `/tmp/mq-browser-run.sh`. Both runs **FAIL, and the two outputs are byte-identical** (`diff` is empty). Every failure **pre-exists**, so none of them blocks this lane. The failures are:
  - mixed_improper_visual: card, worksheet and quiz all report "no answer control (dual-fraction)".
  - order_negatives: card and worksheet report "no answer control (interactive)".
  - factors_identify: card, worksheet and quiz all report "no answer control (factor-pairs)".
  - coordinate_graph: the quiz reports "no answer control (coord-input)".
  - number_families_add: worksheet and quiz report WRONG (0/3).
  - area_perimeter: the card reports WRONG.

  The harness has no filler for these widgets, so this is a harness gap and not an A2 regression. Raise it as a separate task.
- A probe of my own, a make-your-own table on the card at 1280, rule n+4. The result is in defect 1.
- I viewed all 58 PNGs.

## Defects (ranked, §6 form)

1. **C1, major, -2 points. BLOCKING.** A correct entry on a make-your-own table goes red, and the item then loses XP.
   - Where: `js/modules/screen-cell.js` `_liveBindFn`. The `again()` closure calls `_liveMark(o, o !== document.activeElement)`, so every other box in the group is judged as FINAL on every keystroke. The In judge in `_bindFunctionTable` (duplicate test) and the Out judge (rule applied to the row's In) then turn red when another box is only half typed.
   - Observed in my probe: row 1 In = `1` (valid). In row 2's In box I typed `1`, on the way to `10`. Row 1's In box went **RED**: `'1:R  1:-'`, and `data-mq-helped="1"` was set. After I typed `10`, both boxes were green, but `mqHelped` stayed `1`. So a pupil who made no mistake is "helped": +5 XP, no streak, and a miss is logged in progress.
   - The same thing happens to an Out box, which goes red while its row's In is being re-typed (for example 3 → 12, passing through `1`).
   - Expected: a box the pupil is not in is re-judged with `final=false`. It may clear its red or turn green, but it never newly turns red. The help flag is set only by a red that the pupil saw on a box after leaving it.
   - Fix, in `_liveBindFn`:
     - Use `group.forEach(o => { if (o !== el && String(o.value||'').trim()) _liveMark(o, o.classList.contains('mq-live-wrong')); })`. A box that is already red stays judged; nothing else newly turns red.
     - In `_liveSet`, set `mqHelped` only when `bad` comes from a `final` judgement on the box that was just left. Pass `final` through to `_liveSet`.
   - Check: add to `wave1-a2-perbox.cjs` make block: type `1` in row 0 In, then `1`,`0` key-by-key in row 1 In; assert row 0 In never has `mq-live-wrong` during the sequence and `#questionCard` / `#ws_card_0` has no `data-mq-helped`; then Check and assert `+10 XP`.
   - Raises C1 to 9 with defect 3 also fixed.
2. **C3, minor, -1 point.** The corner mark sits on top of the digits in narrow boxes.
   - Where: `css/screen-cell.css`, lines 1407–1451 (`background-position: top 2px right 2px; background-size: 17px`). These input boxes have no padding reserved for the mark.
   - Observed overlaps:
     - `card-number_families_add-…-1280.png`: the tick covers the top of the "9" in 19, and the cross covers the "0" in 10.
     - `worksheet-add_sub_fact_family-…-390.png` / `-1280`: the tick and cross overlap "20" and "21".
     - `card-count_by_tables-…-390.png`: the mark overlaps the "6" in 36 and the "5" in 55.
     - `card-function_table_easy-…-390.png`: the mark touches the second "1" in 11 and the "5" in 15.
     - `worksheet-area_model_mult-…-390.png`: the mark overlaps the "0" in 720.
     - `worksheet-expand-…-390.png`: the mark overlaps the "0" in 900.

     Wide boxes are clean: area_perimeter, factors, coordinates, mixed_improper.
   - Expected: the mark never overlaps a digit's ink. The digit is the pupil's answer and must stay fully legible (C3 crowding).
   - Fix: draw the mark as a corner badge outside the text area. Give the box's wrapper (`[data-mq-cell]`, `.mq-cellbox`, or a span added by `_liveSet` for bare inputs) a `::after` badge: 18 px circle, white fill, `position:absolute; top:-9px; right:-9px`, with the tick/cross SVG. Then drop the input background mark. An alternative where boxes have spare width: `padding-right:18px` on `input.mq-live-correct, input.mq-live-wrong`, keeping the box width.
   - Check: in perbox, for each judged box, compare `getBoundingClientRect` of the mark with the text extent from `measureText` and assert no intersection. Re-shoot, then re-view number_families_add at 1280 and fact family, count_by and function table at 390.
   - Raises C3 to 9.
3. **C1, minor.** Order boxes show two "×" glyphs in one red box.
   - Where: `card-order_negatives-…-390.png` / `-1280.png`, slot 2. The box's own clear button "×" sits about 10 px from the red cross mark. A pupil reads two crosses, and the clear control looks like a verdict.
   - Fix: when an order box is `.mq-live-wrong`, hide its clear "×" or move the clear control below the box (`.order-input-box` sibling clear button).
   - Check: the PNG shows one cross per red box.
4. **C4, minor.** A wrong digit box in the kit stack has a solid red edge.
   - Where: the stack and regroup digits, `card-add_100_regroup-…-390.png` and the worksheet equivalent. Round-2 fix 4 (dashed wrong edge, so the edge shape carries the verdict for colour-blind pupils) is applied to the "sel" boxes, the count-by row, the chart and the single box, but not to `.mq-kit input.mq-digit.mq-live-wrong`. The perbox dashed assertion is not run for `kind:'stack'`.
   - Fix: add `border-style:dashed` to the `.mq-kit … input.mq-digit.mq-live-wrong` rule at about line 1389. If the digit cell's border belongs to the `.ab`/`.rg` segment, apply it there. Extend the perbox dashed check to the stack kind.
5. **C2, minor (owner rule, partial).**
   - Where: `worksheet.js:2391`. `q._helped` is set but nothing reads it. The worksheet awards no per-item XP or progress, so the owner's "progress records like a second-try" is not applied on worksheets at all. It is also set only on the single-box `checkWorksheetAnswer` path; the multi-box widget checkers never mark it.
   - This is harmless today. Either consume it where the worksheet result is saved (session history: count a helped item as a second-try correct), or delete it and document that "helped" is practice-card only.
6. **Note: the item-level ✕ on the worksheet.** `worksheet-mixed_improper_visual-*`, `worksheet-area_perimeter-*` and `worksheet-hundreds_chart_fill-*` show the header ✕ and the "Here is how" ladder after the test filled both boxes. This is the worksheet's existing auto-check once every box is filled, and not per-box red; the perbox "no wrong try" assertion covers the partial-fill state. I am not charging it, but the owner should know that, on these widgets, filling the last box wrongly still counts as a full wrong try.

## Asked-for judgements

- **Make-your-own judging.** The live judge mirrors `ftAnswerMatches` exactly: the same `numOf` regex, `applyRule`, whole-number Ins, distinct Ins, and the check value. So a final entry is never judged differently from Check. The fault is timing (defect 1): cross-box re-judging marks other boxes red mid-typing. A side note that is not A2's: a subtraction rule with a small In gives a negative Out, which both the checker and the live judge reject. A pupil who picks In 2 for n−5 gets a green In and an Out that can never turn green. Recommend the make prompt say "use In numbers bigger than N", or that the checker accept negatives.
- **Premature red on the new types.**
  - Coordinates with negatives: no premature red. `-` alone is not numeric, `-1` toward `-10` is shorter than maxLen, and blur to Hint is exempt.
  - Dual-fraction: judged only on final (blur), with the checker's own normalisation, so `3 5/` is never red while typing. Leaving the mixed box for the improper box half typed does turn it red, which is correct ("left the box").
  - Ordering: final-only, number or text equality. No premature red found.
  - Drag-filled ordering boxes are not judged, as stated.
- **The XP change.** It is confined to `checkAnswer` when `itemWasHelped(#questionCard)`: 5 XP instead of 10, no streak++, no `checkStreakBonus`, and miss+hit logged only when no Check-press miss was already logged. The surprise bonus is unchanged, and map mode is excluded. Nothing else loses XP. The worksheet has no per-item XP (defect 5). The quiz is unaffected. The flag resets per item (`wireLiveCorrect` clears it except for the card's answer-area rewire). The only unfair loss is defect 1.
- **Marks crowding two-digit numbers in function tables.** Yes, and not only there. See defect 2 for the list.

## To pass round 3

Fix defects 1 and 2, which are required. Fix 3 and 4 as well, since they are cheap. Then re-run `wave1-a2-perbox.cjs` with the new assertions and re-shoot the PNGs.
