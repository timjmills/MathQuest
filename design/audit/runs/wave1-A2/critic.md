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

# Round 3

Graded commit b04b792 (on top of 41cb2af). Critic: Opus, low effort, independent. No code edited.
**Note:** while I graded, the tree held UNCOMMITTED builder edits to `js/modules/worksheet.js` (`wsLogProgress`) and `tests/scripts/wave1-a2-perbox.cjs`. My runs therefore exercised b04b792 plus that work in progress. The grade below is for b04b792. The work in progress is discussed under "Builder's question".

## Verdict: FAIL (C1 8 · C2 8 · C3 7 · C4 8)

## Runs

- `wave1-a2-perbox.cjs`: **OK**. Every line PASS at 1280 and 390, on the card, the worksheet and the quiz. That includes the new key-by-key make-table check, the badge geometry check (18 px, outside, no overlap with own digits), and no console errors.
- `ws-screen-answer.cjs --skills multiplication:count_by_tables,composing:hundreds_chart_fill,addition:add_facts,addition:add_100_regroup`: **OK**. Card, worksheet and quiz were all ok (3/3), and live green was ok.
- My own probe, with the rule read from `ftCheck`, at 1280, on the card (n+1) and the worksheet (n+7):
  - Row 1 Out typed digit by digit (`1`→`15`). The partial `1` is neutral, never red.
  - Row 1 In = 1, then row 2 In typed `1`→`10`. On the `1` keystroke, row 1 In and row 2 Out go neutral (a true duplicate in progress). They are never red, and they come back green on `0`.
  - Row 2 In retyped `10`→`12` while its Out held 11. The Out goes neutral, never red.
  - `data-mq-helped` stayed unset throughout, on both hosts. **Defect 1 of round 2 is fixed.**
- My badge probe: an 8-item count_by worksheet with three items filled right and wrong.
  - After a window scroll of 400, an inner-container scroll, and a resize from 1280 to 390: every visible badge stayed within 12 px of its box's top-right corner. No badge was detached, no off-screen box showed a badge, and no badge overlapped a neighbour's digits.
  - **Opening an overlay failed**: see defect 1.
- I viewed all 58 PNGs, plus my own probe shots.

## Round-2 defects

| # | Round-2 defect | Status |
|---|---|---|
| 1 | make-table false red / helped | **Fixed** (verified by hand and by the new perbox assertion) |
| 2 | mark on the digits | **Fixed for the box's own digits.** A new layering fault was introduced (defect 1 below) |
| 3 | two × on a red order box | **Fixed.** The clear × is hidden on a red box (`card-order_negatives-*`) |
| 4 | solid edge on a wrong stack digit | **Fixed.** Dashed on digit, carry and `.ab/.rg` (`card-add_100_regroup-*`, `worksheet-add_100_regroup-*`) |
| 5 | worksheet helped | **Partly fixed.** "Helped: N" and a miss then a hit work for single-box items only (defect 2) |

## Defects (ranked, §6 form)

1. **C3, major, -2. BLOCKING.** The tick/cross badge paints over overlays.
   - Where: `css/screen-cell.css` `.mq-live-badge { position: fixed; z-index: 30 }`, appended to `document.body` by `screen-cell.js` `_badgeTrack`. The code comment says "its z-index sits under headers and dialogs". That is not true.
   - Observed at 390 on the worksheet:
     - The **Advanced Settings slide-out**: a green ✓ floats on top of the white panel, near its bottom-right corner.
     - The **Hint callout** of item 1: the ✓ of a box hidden underneath shows through on top of the orange hint box.
   - A pupil sees a stray verdict mark on a dialog that has nothing to do with it.
   - Expected: a badge is covered by anything that covers its box.
   - Fix: do not portal the badge to `body`. Append it to the item host (`#questionCard` / `.problem-card`, both positioned). Give it `position:absolute`, at `r.right - host.left - pos[0] + host.scrollLeft` and `r.top - host.top - pos[1]`, and drop the z-index (or use `z-index:1` inside the host). It then scrolls, clips and stacks with its box. The rAF loop is only needed for re-layout, so a `ResizeObserver` on the host is enough. An alternative that keeps fixed positioning: in `_badgeTick`, hide the badge when `document.elementFromPoint(centre)` is not inside the box's host. This is fragile with `pointer-events`.
   - Check: in perbox, open the settings panel (`toggleSettings`) and a Hint. For each shown badge, assert that `elementFromPoint` at the badge centre (with the badge given `pointer-events:auto` for the test) is the badge only when the host also wins at that point. Simpler: assert that no badge is shown while `#settingsPanel.open` covers its rect.
   - Raises C3 to 8. Defect 3 is needed for 9.
2. **C1/C2, minor, -1.** A helped multi-box worksheet item is never counted as helped.
   - Where: `worksheet.js:2392`. `q._helped` is set only in `checkWorksheetAnswer`, the single-input path. For area model, fact family, expanded form, order, coordinates, chart, count-by and the stack, `checkAllWorksheet` grades through its own branches and never reads `itemWasHelped(card)`.
   - So, for example, an area-model item whose box went red and was then fixed is logged as clean, with no "Helped" count. This contradicts the owner rule on exactly the boxes Wave 1 A2 added.
   - Fix: in `checkAllWorksheet`, before logging, add `if (itemWasHelped(card)) q._helped = true;`.
   - Check: in perbox worksheet progress, add an area_model_mult item (red then right) and assert `Helped: 1` and a miss then a hit.
3. **C3, minor.** In tight layouts the badge still lands on neighbouring ink: a box edge, an arc or a label. It does not land on digits.
   - `card-add_100_regroup-*-390.png` / `worksheet-add_100_regroup-*-1280.png`: the ones-digit's ✓ sits on the top-left corner and edge of the adjacent red tens box.
   - `card-count_by_tables-*`: the ✗ on 55 crosses the jump arc above it.
   - `worksheet-add_facts-red-390.png`: the ✗ sits on the sum bar.
   - `card-mixed_improper_visual-*-390.png`: the ✓ touches the colon of "Mixed Number:".
   - Fix: add a neighbour test to the `_BADGE_AT` candidate search. Reject a position that intersects any other `input` rect in the same host, and prefer the `[-1,12]` "just outside" slot when the right-hand neighbour is closer than 10 px. For a stack, put the badge on the outer corner of the answer row only for the rightmost digit, and above the box (`[w/2, 20]`) for the others.
4. **Note (not A2, pre-existing, also in 41cb2af):** `card-count_by_tables-*-390.png` cuts off the bottom row of boxes and the cell's bottom edge. The cell box clips its third row on the phone card. Lane C should file this.
5. **Note, efficiency:** `_badgeTick` runs `getComputedStyle` plus `measureText` per badge on every animation frame for as long as any badge exists, which is the whole worksheet session. This is cheap at 10 badges, but at 30+ badges on a phone it adds continuous load. Defect 1's fix (host-relative and observer-driven) removes it.

## Builder's question: worksheet progress for clean answers

**Verdict: yes, b04b792 is inconsistent, and it is worse than neutral.** At b04b792, a clean worksheet answer records nothing, while a helped one records a miss and a hit. A pupil who needed help on one item and got nine right cleanly ends up with 1/2 = 50 % for that worksheet in progress. Without that one stumble, the same pupil would have no record at all. "Records like a second-try correct" only makes sense if a first-try correct records a hit, as it does on the card. So recording only the helped items punishes them relative to nothing.

**Exact fix.** This is what the uncommitted `wsLogProgress` in the tree already does, and it is right. Call it once per item from `checkAllWorksheet` with the guards `q._progHit` / `q._progMiss`:
- clean correct: `updateSkillProgress(sk, true)`
- helped correct: `false`, then `true`
- answered but wrong: `false`
- blank or skipped: nothing
- wrong, later put right: only the hit is added

Two corrections to the work in progress before committing it:
- (a) Add `if (itemWasHelped(card)) q._helped = true;` at the top of `wsLogProgress` (defect 2). Without it, multi-box helped items log as clean.
- (b) Keep XP and streak out of it, since a worksheet awards none. The work in progress already does that.

## To pass round 4

Fix defect 1 (blocking) and defect 2. Commit the `wsLogProgress` work with correction (a). Fix defect 3 if you want C3 above 8. Re-run perbox with the overlay and multi-box helped assertions, re-shoot the PNGs, and re-view the stack, count_by and settings-open screens.

# Round 4

Graded commit a38d3d2 (on b04b792). Critic: Opus, low effort, independent. No code edited, nothing committed. (A throwaway probe was run from `tests/scripts/` and then deleted.)

## Verdict: FAIL (C1 8 · C2 7 · C3 8 · C4 8)

## Runs

- `wave1-a2-perbox.cjs`: **OK**, 59 PASS, 0 FAIL, no console errors. New assertions that pass:
  - no badge shows over the open settings panel (card and worksheet, 390);
  - no badge shows through the open hint box;
  - the area-model worksheet item that was helped logs a miss then a hit;
  - the progress matrix: clean = 1, helped = 2, wrong = 1, blank = 0; Check all again adds 0; wrong then put right adds only its hit.
- `ws-screen-answer.cjs --skills count_by_tables,hundreds_chart_fill,add_facts,add_100_regroup`:
  - **First run FAIL**: the add_100_regroup worksheet scored 2/3, with every item showing `number:?`.
  - The rerun was **OK** (card, worksheet and quiz all ok; live green ok).
  - This is intermittent, and it was not seen in round 3. Note 2.
- `test-wrong-retry-skip.cjs`: OVERALL PASS on both a38d3d2 and base `/home/user/MathQuest` (4911898). I could not reproduce the wording flake on either tree. The test drives skip and retry wording, not the per-box classes, so I accept it as test fragility unrelated to A2.
- Probe at 390, badges inside scrolled containers (hundreds chart and count_by row, card and worksheet):
  - Only the count_by worksheet cell actually scrolls horizontally (336/328 px).
  - After swiping it fully, each badge stayed at dx -7..-8, dy -10 from its box corner in the next frame and after 300 ms.
  - No badge was shown for a box scrolled out of its row.
  - At 390 the charts fit without a swipe row, so the SP-11a swipe case is not exercised by today's content. The design is right for it: badges are children of the card, get repositioned on a captured scroll, and are clipped by the card. One caveat: a badge is not clipped by an *inner* `overflow:auto` row, because it is a child of the card and not of the row. If a future row scrolls a box out of view, its badge will hang at the row's edge. This is minor (note 3).
- I viewed all 58 PNGs, as four montages, plus the probe shots. Badges sit on the outer corner in every shot and are clear of digits, arcs, sum bars and labels:
  - count_by: the ✗ on 55 now sits right of the arc, not on it;
  - add_facts: the ✗ is above the bar's end;
  - mixed number: clear of the colon.
  - Stack at 390: the ✓ for the tens digit sits in the 2 px gap at the shared corner of the next box. It touches the neighbour's corner but none of its digits. This is acceptable.

## Round-3 defects

| # | Defect | Status |
|---|---|---|
| 1 | badge paints over overlays | **Fixed.** The badge is `position:absolute` inside `#questionCard` / `.problem-card`, has no z-index, and is hidden while the item's hint is open. Verified by perbox and by the shots. |
| 2 | multi-box helped on worksheet | **Fixed.** `itemWasHelped(card)` is read in `checkAllWorksheet` for every type; the area-model assertion passes. |
| 3 | badge on neighbouring ink | **Fixed.** `_badgeSpot` searches positions around the box against obstacles: other inputs, sampled arc strokes, text and borders. |
| 5 | rAF loop every frame | **Fixed.** Placement now runs from a ResizeObserver, scroll and resize. |

## Defects (ranked, §6 form)

1. **C2, major, -1. BLOCKING.** A pupil can earn clean progress hits by retyping answers that Check all revealed.
   - Where: `worksheet.js` `wsPre` / `wsLogProgress`. Check all writes the right answer into a blank or wrong card and sets `data-mq-revealed`. Any `input` event clears that mark, so the card is no longer "stale" and the next Check all grades it as the pupil's own work.
   - Observed (probe, add_facts worksheet at 390):
     - Item 0 is left blank. Check all writes `13` into it, and progress is `null`.
     - Clear the box, type `13`, Check all again. Progress becomes `{correct:1,total:1,streak:1,mastery:100}`.
     - That is a **clean hit for a problem the pupil never solved**. Repeating it across the sheet drives mastery to 100 %, adaptive difficulty up, and the item out of spaced review.
   - The wrong-then-revealed path has the same fault. The pupil copies the shown answer back, and the item logs miss + hit, the same record as an honest helped correct.
   - Expected: once an item's answer has been revealed, nothing more is recorded for it.
   - Fix: when Check all reveals an answer, set `q._revealed = true`. At the top of `wsLogProgress`, add `if (q._revealed && !q._progHit) return;`. Set the flag before the reveal, but only for items that were not correct on that pass. The DOM `mqRevealed` mark can stay for display, but it must not be the guard.
   - Check: in perbox worksheet progress, leave one item blank, Check all, retype the revealed answer, Check all, and assert that progress is unchanged. Do the same for a wrong item: assert exactly 1 miss and no hit.
   - Raises C2 to 8.
2. **Note, C4, possible flake:** the first `ws-screen-answer` run graded the add_100_regroup worksheet 2/3. The rerun passed. Possible causes:
   - the new `setTimeout` re-placements at 150/600 ms;
   - the per-call `_obstacles` walk, which runs `getComputedStyle` on every element in the host, delaying the harness's typing.

   Run it 5x. If it fails again, record which item and why.
3. **Note, C3, minor, latent:** a badge is clipped by the card, not by an inner horizontally scrolling row. When a box is scrolled out of such a row, its badge stays at the row's edge, overlapping the next content.
   - Fix: in `_badgePlace`, hide the badge when the box's rect lies outside its nearest `overflow-x:auto|scroll` ancestor's rect.
4. **Note, efficiency:** `_obstacles` runs `querySelectorAll('*')` plus `getComputedStyle` per element for each badge placement, and placements fire per badge on every card resize or scroll frame. This is fine at 10 boxes. On the hundreds chart with many gaps on a phone, cache the obstacle list per host per rAF.

## To pass round 5

Fix defect 1 and add its two assertions. Run ws-screen-answer for add_100_regroup five times clean.

# Round 5

Graded commit d815bc3 (code: 36bb0bd + d815bc3 on a38d3d2). Critic: Opus, medium effort, independent. No code edited, nothing committed. Probes ran from the scratchpad. The gate runs re-shot the PNGs, so the tree was restored to HEAD before viewing.

## Verdict: PASS (C1 8 · C2 8 · C3 8 · C4 8). This is the merge decision: merge.

## Runs (all on d815bc3 unless marked)

- `wave1-a2-perbox.cjs`: **OK**, 0 FAIL, no console errors. This includes the two new assertions: a revealed blank or wrong answer, retyped, earns no credit, and another Check all still adds nothing.
- `wave1-a-probe.cjs`: **OK**, no problems.
- `ws-screen-answer --skills count_by_tables,hundreds_chart_fill,add_facts,add_100_regroup`: **OK**. Card, worksheet 3/3 and quiz 3/3 for each, and live green ok.
- `ws-screen-answer --skills addition:add_100_regroup`, 3 further runs: **3/3 OK**, worksheet 3/3 each time. With the 1 run above, that is 4 more clean runs. With the builder's runs, I count no flake since round 4.
- `ws-screen-slots`, same 4 skills: **OK**. 16 renders, 0 doubled answer areas, 0 paper verbs.
- **Merge dry run onto `claude/sweet-newton-c8wrv1` (93d873f):**
  - `git merge-tree` is clean, with **no conflicting files**. The only file both sides touched is `css/screen-cell.css`, and it auto-merges.
  - On a throwaway worktree of the merged tree (since removed), these all pass: `ws-boot-smoke` OK; `ws-code-snapshot` OK (608 codes / 35 categories, nothing moved); `wave1-a2-perbox` OK; `ws-screen-answer` on the 4 skills OK; `test-wrong-retry-skip` OVERALL PASS; `node --input-type=module --check` OK on `screen-cell.js`, `worksheet.js` and `answer-check.js`.

## Round-4 fixes, verified by my own probes (390 and 1280, real clicks and keys, no forced `disabled=false`)

| # | Probe | Result |
|---|---|---|
| 1a | add_facts worksheet with 4 items: item 1 wrong, item 2 clean, items 0 and 3 blank. Check all. | Progress +2 recorded / +1 correct: item 1 a miss, item 2 a hit, the blanks nothing. **Correct.** |
| 1b | Blank item 0: click it, select all, retype the revealed answer, Tab. Its single-card per-input check fires. Then Check all. | Progress unchanged. Banner `dailyTotal`, `dailyCorrect` and effort unchanged. **No credit.** |
| 1c | Wrong item 1: copy the revealed answer back, then Check all. | Progress unchanged. It stays **exactly one miss**. |
| 1d | Revealed blank item 3: type it wrong, then right, then Check all. | Progress unchanged. |
| 1e | After a reveal, press **New Worksheet** on the score overlay (`newWorksheet`). | All flags on the new items are false. Two clean answers + Check all = +2/+2. **No leak** into a new sheet. |
| 1f | Reload the page. | `worksheetQs` is empty and progress keeps only the honest records. Nothing about the old sheet comes back. |
| 2 | add_100_regroup, count_by_tables, hundreds_chart_fill, on card and worksheet, at 390 and 1280. Type a wrong digit into every box while keeping focus in the card, so both settle passes are skipped. Wait 900 ms, blur, then force a fresh placement (`resize`) and compare. | **No badge stale** in any of the 12 cases. The rAF placement (`_badgeSoon`) and the ResizeObserver still run while typing; only the delayed 150/600 ms passes skip. |
| 3 | A long count row at 390. In live content no box can scroll out: the card at ×12 with 15 jumps wraps to 4 rows with no scroller; the worksheet cell scrolls 336/328 px, an 8 px overflow. So I made a synthetic swipe row (the worksheet count_by cell held to 170 px, no wrap, 416/168 px) and scrolled it to 0, 0.5 and 1. | Every box scrolled fully out has its badge **hidden**. A partly visible box keeps its badge, inside the row. No badge is left hanging at the row edge. **Fixed.** |

## PNGs viewed

- All 58 in `wave1-A2/`: 4 montages plus individual views of the add_100_regroup, count_by and hundreds chart shots at 390.
- All 12 re-shot in `wave1-A/`.
- In every A2 shot the badges sit on the box's outer corner, clear of digits, arcs and labels. The quiz is not coloured.

## Defects (ranked, §6 form)

1. **C3, minor, pre-existing (not A2; present on base 93d873f): the count_by_tables practice card at 390 shrinks while the pupil types.**
   - Where: `card-count_by_tables-green-red-empty-390.png`, row 3. My probe at ×4 (default options) and at ×12 with 15 jumps, base and lane.
   - Observed:
     - Each typed box narrows the drawing: box width 44 → 40 px, row pitch 66 → 47 px.
     - The bottom row is cut off by the cell frame. In the committed PNG, its boxes are cut at half height.
     - Arcs then overprint boxes. The A2 badges have no ink-free corner left, so ✗ on 21/41 touches an arc.
   - The geometry trace is the same on base and lane, so A2 does not cause it.
   - Expected: the drawing keeps its size once drawn, and no row is clipped.
   - Fix: find the per-input re-fit of the count_by row and stop it rescaling on input: the screen-fit pass (`fitTwinRows`) or the count-row cell's input wiring in `screen-cell.js`. Out of A2's lane; it goes to the count_by owner (Lane C).
   - Check: type all boxes at 390, and box rects stay the same within 1 px.
   - This does not block A2.
2. **C2, minor, note for the owner: a wrong item is closed after the first Check all, even where Check all did not write the answer in.**
   - Where: `worksheet.js:2463`. `q._revealed = true` is set on every wrong or blank verdict, whether or not that answer type reveals.
   - Effect: a pupil who later self-corrects a wrong multi-box item earns no hit. This matches the ruling as written ("wrong = a miss").
   - If the owner wants a self-correction counted as helped (miss + hit) on types that do not reveal, set the flag only where the reveal writes a value.
   - No score change.
3. **Minor, dead code:** `wsPre().stale` (`worksheet.js:2438`) and the document `input` listener that clears `data-mq-revealed` (`:2441-2444`) no longer guard anything.
   - Fix: remove both, or keep the mark only for display and say so in the comment.
   - Check: perbox still OK.
4. **Note, efficiency (carried from round 4, note 4):** each placement runs the `_obstacles` walk (`getComputedStyle` on every element in the host). The clip test adds a short ancestor walk.
   - Not measurable at today's box counts, and the 4 extra add_100_regroup runs were clean.
   - Fix if a 100-gap chart lags on a phone: cache the obstacle list per host per animation frame.

## Scores

- **C1 8.** The pupil sees right/wrong per box with a shape cue on both hosts, and nothing in the quiz. To reach 10: fix defect 1 upstream, so the count row stays still while the pupil types.
- **C2 8.** Progress follows the rulings exactly (clean, helped, wrong, blank), counts each item once, and revealed answers earn nothing, by every route I tried. To reach 10: settle defect 2 with the owner and remove the dead guard.
- **C3 8.** Badges stay clear of ink and overlays, follow layout changes, and hide in swipe rows. To reach 10: fix the upstream count_by shrink, defect 1.
- **C4 8.** Black-and-white cells are unchanged, and the colour is limited to the answer place on screen hosts. To reach 10: as C3.
