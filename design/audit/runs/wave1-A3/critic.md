# Wave 1 / A3 critic: wrong digits blink red, tapping a red box clears it

Graded commits 6a20c00 and d557048 (on main 29037db). Critic: Opus, medium effort, independent. No code edited.
Probes: `scratchpad/a3-critic/probe.cjs` (P1 to P5) and `sa-instr.cjs` (ws-screen-answer with a focus, key and input log).
I viewed every PNG I cite: the 20 A3 PNGs, P1 tries 1 to 4 and P5 at 1280 and 390, and the P4 mirror-versus-plain pairs.

## Verdict: FAIL

| Host | Width | C1 Ease | C2 Teach | C3 Space | C4 Fidelity |
|---|---|---|---|---|---|
| Practice card | 1280 | **6** | 8 | 9 | **7** |
| Practice card | 390 | **6** | 8 | 9 | **7** |
| Online worksheet | 1280 | **7** | 8 | 9 | **7** |
| Online worksheet | 390 | **7** | 8 | 9 | **7** |
| Quiz | 1280 / 390 | unaffected: no marks, no clearing (gate lines PASS; `_inQuiz` guard) | | | |

No hard cap applies. H4 (colour in the cell) is overridden by the owner's ruling, as it was for A2.

## Runs

- `wave1-a3-wrongdigits.cjs`: **OK**, 206 PASS, 0 FAIL, no console errors.
- `wave1-a2-perbox.cjs`: **OK**, 644 PASS.
- `test-wrong-retry-skip.cjs`: **OVERALL: PASS**, with 0 console errors and 0 page errors. The skip-after-N count, XP and the support ladder are unchanged. Clearing a box adds no try, and the "helped" flag survives a clear (A3 gate line), so a helped item still earns +5 and no streak.
- `ws-screen-answer --skills addition:add_100_regroup`: card ok, worksheet 3/3, quiz 3/3 on every run I completed (see §Race). The browser slots were heavily contended, so the instrumented run count is given in §Race.
- Overlay geometry (P4, card and worksheet, 1280 and 390): add_facts 2-digit, add with unknown first (equation), count_by_tables, area_model_mult, coordinate (ci-x), number_families_add, a missing digit, and the stack.
  - The mirror box offset from its input is `[0,0,0,0]` px in every case.
  - The digit run is centred (left and right margins within 1 px).
  - After a resize (1280 to 820, 390 to 600) the offset is still `[0,0,0]`.
  - In the pixel pairs (mirror versus the input's own text with the mirror hidden), the digits land on the same pixels.
  - The overlay does not misalign at either width or in any box width tried.
  - Font load: the mirror copies the input's `font-family`, and the badge ResizeObserver re-places it. The harness waits for `fonts.ready`, so a late Andika load was not exercised. The risk is low because a mirror only exists after the pupil has typed.
- Blink: 1.2 s per cycle is 0.83 Hz, well under the WCAG 2.3.1 limit of 3 flashes per second. It is 3 cycles (3.6 s), so it is under the 5 s limit of 2.2.2. It stops on steady red, and `prefers-reduced-motion` gives no animation (gate lines PASS). Opacity eases from 1 to 0.25, which is calm, not alarming.

## Defects (ranked)

1. **C1 major (−2), card and worksheet stack. A red digit on the selection blue is unreadable.**
   - Where: `answer-check.js:1272` (and the select calls at :1884, :2061, :3112, :3309) selects the kept wrong entry on every support-ladder try. `screen-cell.js:471` (`wireStackEntry`) selects the box to the left after each digit.
   - What: `input.mq-wd-mirrored` / `input.mq-wrong-digit` makes the input's text transparent or red, so the browser's selection paints its blue `rgb(51,101,190)` behind the mirror digits.
   - Measured on `png/p1-card-try3-1280.png`: the red wrong digit on the blue is **1.26:1**, and the black right digit on the blue is 4.05:1. The wrong digit, which is the whole point of A3, is close to invisible for tries 1 to 3 until the pupil types.
   - Fix: in `css/screen-cell.css` add `html body input.mq-live-wrong::selection { background: rgba(0,0,0,0.12); }`. Keep the selection, which is the "typing replaces it" cue, but make it the single grey.
   - Proof: rerun P1. The sampled pixel behind the wrong digit in `p1-card-try3-*.png` must not be blue, and red on that background must be at least 4.5:1. Add the assertion to `wave1-a3-wrongdigits` by reading `getComputedStyle(el, '::selection').backgroundColor`.

2. **C1 major (−2), card. A ghost entry and a keyboard trap once the ladder is spent.**
   - Where: `answer-check.js:1268`. The non-gentle path runs `answerInput.value = ""` without an input event. The same pattern is at `:2059` (perimeter/area) and in the other per-type wrong paths.
   - What: `markBoxSubmitted` has already drawn the mirror, so P1 try 4 and P5 show the box displaying **"14" while `value === ""`**, still red, with the caret transparent (`png/p5-card-ghost-390.png`).
   - Backspace changes nothing, because an empty input fires no input event. Check changes nothing either: the attempts stay at 4 and the message is unchanged. The pupil sees an answer they cannot delete or resubmit until they happen to type or tap.
   - Fix (two options, in this order of preference):
     - (a) Keep the value on the non-gentle path as the gentle path does: replace `else answerInput.value = ""` with `markTried`/`select()`. This also obeys P-ON-11 "wrong digits stay visible".
     - (b) Export a `dropWrongDigits(el)` (that is, `_mirrorDrop`) from `screen-cell.js` and call it wherever a checker empties a box.
   - Proof: rerun P1 and P5. After the 4th wrong try, the mirror's text must equal `input.value`, and after Backspace the box must change.

3. **C1 minor (−1), card. Tab through a red box erases it.**
   - Where: `screen-cell.js` `_wireClear`, the `focusin` within 400 ms of a Tab.
   - What: P2 card count_by_tables at both widths. A keyboard pupil tabbing from box 0 to box 2 erases box 1 ("99" became ""), a box they never chose to rewrite. A Shift+Tab walk back to an earlier box erases every red box it passes.
   - Fix: on a Tab focus, `select()` the red box instead of clearing it. Typing replaces it, which is the same result for a pupil who meant to fix it and keeps it for one passing through. Keep the clear for `pointerdown`.
   - Proof: in P2, after Tab-Tab, box 1 still reads "99" and is red. Tab into it and type "7": the box reads "7".
   - Checked, no defect: Tab to Check plus an immediate Enter (P3) does not clear the refocused box.

4. **C4 minor (−1), AX-2 / INK-6. Which digit is wrong is shown by colour alone.**
   - Where: `css/screen-cell.css`, `.mq-wd-bad`.
   - What: inside a multi-digit box, the only cue that the tens digit (not the ones) is wrong is red `#B3261E` against black. That is **3.21:1** in luminance, and both read as dark to a protan or deutan pupil. After the 3.6 s blink there is nothing else, and under reduced motion there never was. The corner cross says only that the box is wrong.
   - Fix: add a shape cue on `.mq-wd-bad`: `text-decoration: underline solid var(--mq-box-bad); text-decoration-thickness: 3px; text-underline-offset: 0.12em;`.
   - Proof: assert `textDecorationLine === 'underline'` on `.mq-wd-bad` in `wave1-a3-wrongdigits`, and check a greyscale screenshot of `card-add_facts_2digit-wrong-390.png` to confirm the wrong digit is identifiable.

5. **C4 minor (−1). The standards still say the opposite.**
   - Where: `PEDAGOGY_STANDARD.md` P-ON-11 ("A wrong entry is not cleared … The pupil may overwrite it"), `WORKSHEET_DESIGN_STANDARD.md` SP-32 ("nothing is cleared automatically") and AX-9 ("Cells themselves never animate").
   - Fix: amend the three rules with the owner's 2026-10-03 ruling: a pupil's tap on a red box empties it; wrong digits blink red 3 × 1.2 s on screen and hold steady red; there is no blink under reduced motion; never in the quiz, never on paper.
   - Proof: `grep -n "2026-10-03" PEDAGOGY_STANDARD.md WORKSHEET_DESIGN_STANDARD.md` finds all three.

6. **C1 minor. A one-digit box blinks as a whole, structural edge included.**
   - Where: `css/screen-cell.css`, `input.mq-live-wrong.mq-wrong-digit` animates `opacity` on the input.
   - What: in `card-add_100_regroup-wrong-390.png` the dashed red edge and the fill fade to 25 % together with the digit, so the box itself flickers 3 times. In a stack, that box is a structural scaffold.
   - Fix: animate the digit only, with keyframes on `color` / `-webkit-text-fill-color` (from `--mq-box-bad` to `rgba(179,38,30,0.25)`), and keep the border steady.
   - Proof: a mid-blink screenshot keeps the dashed edge at full `#B3261E`.

7. **C2 minor (note). Fractions, decimals and negatives get no digit marks.**
   - Where: `_markWrongDigits` returns early unless the value matches `/^\d+$/`.
   - What: P4 mixed_improper_visual. Typing 98 gives a red box only, with no digit marked. The same applies to "4.25" and "-12".
   - Fix: split value and expected on their non-digit separators, compare the digit runs one run at a time by place value, and draw the separators as plain spans.
   - Proof: a mixed_improper_visual or decimal case in `wave1-a3-wrongdigits` shows a `b`/`.` pattern.

8. Known limit (accepted, not scored): on the worksheet, a stack with an empty box is not judged, so its missing-digit mark appears only on the card.

## Race (the add_100_regroup worksheet 2/3)

**A3 cannot be the cause, and no A3 path loses a pupil's right input or a mark:**
- `_clearIfWrong` acts only on a box that already carries `mq-live-wrong`. A box judged right never clears. On the worksheet a right single box is `disabled`.
- In ws-screen-answer, every box the test clears with `pointerdown` is the box it is about to empty itself (`value = ''`) and retype. The worksheet half presses no Tab.

**The real race is pre-existing.**
- Where: `worksheet.js` `advanceToNextProblem`. 400 ms after an item is right it scrolls (smoothly) to the next card, and 350 ms later it **programmatically focuses that card's ones box**.
- How the test hits it: by then the test is usually typing in that card, or in the one after. A digit typed in the tens box lands in the ones box. If that ones box is already right and disabled, the digit is lost. The smooth scroll also moves the cards under coordinate clicks. Either way one stack stays incomplete, which gives 2/3.
- How a pupil hits it: a fast pupil on the next card hits the same focus steal, which is a real (pre-A3) defect.
- Fix (separate task, not A3's): skip the delayed focus when `document.activeElement` is already an input inside the grid, or cancel it on any `keydown` or `pointerdown` after the item went right.

**Caught in the act.** `sa-instr.cjs` is ws-screen-answer with a focus, pointerdown, key and input log dumped on failure. Results:
- This tree: 7 of 8 runs at 3/3; **run 8 was 2/3**.
- Base 29037db: 6 of 6 at 3/3. Six runs against a rate of about 1 in 8 cannot tell the two trees apart. The code path is untouched by A3, and the log below shows the mechanism.

The run 8 log (ms from worksheet start):

```
1207 input ws_card_0:ans-0 0        <- card 1 complete and right (advance fires at +400, focuses at +350)
1932 pdown ws_card_2:ans-0          <- test clicks card 3's ones box
1937 focus ws_card_2:ans-0
1991 focus ws_card_1:ans-0          <- advanceToNextProblem(0) steals focus to card 2's ones box (already right)
1997 key 5 ws_card_1:ans-0          <- the pupil's "5" goes to the wrong card: no input on card 3
2355 focus ws_card_2:ans-0          <- advanceToNextProblem(1), too late
final: ws_card_2 ans-0="5" never judged (not green) -> Score 2/3
```

The log has **no `pointerdown` on a red box and no programmatic `input` event**, so `_clearIfWrong` never ran. A3 neither caused nor worsened this. The failure is the 750 ms focus steal in `advanceToNextProblem`, and it swallows a real pupil's digit the same way.

## What would raise each criterion to 10

- **C1:** fixes 1, 2, 3 and 6. Also make the caret visible in a mirrored box (`caret-color: #000` on `input.mq-wd-mirrored`), so a keyboard pupil sees where typing goes.
- **C2:** fix 7, so every numeric answer form marks its wrong digits. A one-line Say frame under a wrong box would also help ("The tens digit is wrong."), shown and spoken.
- **C3:** draw the missing-digit box as a single dashed slot rather than nested inside the box's own dashed edge, so it is not a dashed box inside a dashed box (`card-add_facts_2digit-missing-390.png`).
- **C4:** fixes 4 and 5, and blink the digit only (fix 6), so AX-9's "cells never animate" is broken only by the owner-ruled digit blink.

---

# Round 2

Graded fix a9e1535 (on merge c4e0a9f). Critic: Opus, medium effort, independent. No code edited.

## Verdict: PASS

| Host | Width | C1 Ease | C2 Teach | C3 Space | C4 Fidelity |
|---|---|---|---|---|---|
| Practice card | 1280 | 9 | 8 | 9 | 9 |
| Practice card | 390 | 9 | 8 | 9 | 9 |
| Online worksheet | 1280 | 9 | 8 | 9 | 9 |
| Online worksheet | 390 | 9 | 8 | 9 | 9 |
| Quiz | 1280 / 390 | unaffected: 0 marks, a tap keeps the answer (gate lines PASS) | | | |

No cap applies.

## Runs (this tree)

- `wave1-a3-wrongdigits`: **OK**, 256 PASS. It includes the new ghost, auto-advance and shapes checks, and the quiz lines.
- `wave1-a2-perbox`: **OK**, 644 PASS.
- `test-wrong-retry-skip`: **OVERALL: PASS**, so XP, skip-after-N and the ladder are unchanged.
- `ws-screen-answer --skills addition:add_100_regroup` (instrumented copy): **10/10** at card ok, worksheet 3/3, quiz 3/3. The round-1 rate was 1 failure in 8.
- `node --input-type=module --check` passes on all three changed modules. There were no console errors in any probe.
- Probes P1 to P6 were rerun at 1280 and 390, and I viewed every new PNG.

## Each round-1 defect, verified

| # | Round-1 defect | Round-2 evidence | Status |
|---|---|---|---|
| 1 | Red digit on the selection blue, 1.26:1 | `::selection` is `rgba(0,0,0,0.12)`. On `p1-card-try3-1280.png` the selection pixel is (224,213,140): red on it is **4.38:1** and black is 14.1:1. The stack's auto-select into a red box (`p6-card-stack-select-390.png`) reads clearly, with the same grey. | fixed |
| 2 | Ghost "14" over an empty box, a Backspace/Check trap | P1 try 4 and P5: `value ""`, no mirror, not red, ink black. Typing "11" turns it green. The mirror also removes itself when its value changes (200 ms watch). | fixed |
| 3 | Tab through a red box erased it | P2 card count-by: after Tab-Tab, box 1 is still "99" and red, and selected (`sel:true`). A tap still clears it (gate). | fixed |
| 4 | Wrong digit shown by colour alone | `.mq-wd-bad` has a 3 px underline at both widths on the card (add_facts, count_by_tables) and the worksheet (area model, the missing digit) (`png/r2-sheet.png`). It outlasts the blink and is present under reduced motion (gate). | fixed |
| 5 | Standards contradicted the feature | P-ON-11, SP-32 and AX-9 now carry the 2026-10-03 ruling. | fixed |
| 6 | A one-digit box faded as a whole | P6: the input's `opacity` stays 1 across 10 samples, and only `-webkit-text-fill-color` moves (#B3261E to 0.2 alpha). The dashed edge holds. | fixed |
| 7 | Fractions, decimals and signs got no marks | `wrongDigitPattern` passes 12 cases (gate, shapes). **But** see R2-1: the one live fraction host still draws nothing. | partly fixed |
| race | Worksheet auto-advance stole focus | `wsScheduleAdvance` cancels on pointerdown and Tab. Gate advance lines PASS, and there were 10/10 instrumented runs. A keyboard pupil who just keeps typing still gets the auto-advance, which is the intended behaviour. | fixed |

The overlay is unchanged: P4 offset `[0,0,0,0]` in all 22 cases, `[0,0,0]` in all 26 after a resize, and the digit runs are centred within 1 px.

## Defects (minor, none blocks the pass)

1. **R2-1 · C2 minor (it keeps C2 at 8 rather than 9). The mixed/improper fraction boxes still get no digit marks.**
   - Where: `screen-cell.js`, in `_bindOwnBoxes`, the `dualFractionAnswers` branch. It binds with `_liveBindFn`, which sets `LIVE_EXPECT` to `['']`. `_markWrongDigits(el, LIVE_EXPECT.get(el))` then has no answer to compare.
   - Measured: P6, `fractions:mixed_improper_visual`, want `14/4`, typed `14/5`. The box goes red (cross), but there is no mirror (`mirror: null`) at 1280 and 390.
   - Fix: keep the expected text beside the judge. Add a `LIVE_WANT` WeakMap filled in that branch with `[want]`. In `_liveSet` and `markBoxSubmitted`, pass `LIVE_WANT.get(el) || LIVE_EXPECT.get(el)` to `_markWrongDigits`.
   - Proof: rerun P6. The fraction case shows the mirror pattern `..|.b`. Add a `mixed_improper_visual` scenario to `wave1-a3-wrongdigits`.
2. **R2-2 · C4 nit (no points). The promised 3 px bar under a one-digit box does not render.**
   - Where: `css/screen-cell.css`, `input.mq-live-wrong.mq-wrong-digit` `box-shadow: inset 0 -3px 0 …`.
   - Measured: P6 reads `box-shadow: none` on the stack's red tens box at both widths. It is overridden, for example by the `.mq-cellslot.mq-live-wrong { box-shadow: none !important }` rule at line 1419 and by the stack digit rules.
   - Not a pupil defect: in a one-digit box, the box is the digit, and its corner cross is a non-colour cue.
   - Fix: delete the dead declaration (and its comment), or raise its specificity above line 1419.
   - Proof: computed `boxShadow` either matches the rule or the rule is gone.

## What would raise each criterion to 10

- **C1 (9):** a visible caret in a red, mirrored box while it has focus. Today it is `caret-color: transparent` app-wide (SP-22 allows this because the focus ring shows), but a keyboard pupil retyping into a kept, selected entry would see where the typing goes.
- **C2 (8):** R2-1. Also a short spoken or shown line naming the wrong place ("The tens digit is wrong."), so the feedback teaches the place value, not only marks it.
- **C3 (9):** draw a missing digit as a single dashed slot, not a dashed box inside the box's own dashed edge (`p4-worksheet-add_facts-missing-390-card.png`).
- **C4 (9):** R2-2, so every claimed cue is real.
