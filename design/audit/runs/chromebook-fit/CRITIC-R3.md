# Chromebook fit — independent critic, round 3

Branch `claude/sweet-newton-c8wrv1-wip-chromebook-fit` @ 29e71b7. Graded against `design/audit/RUBRIC.md` (screen
checks at Chromebook sizes) and the owner's 2026-10-09 goal. Evidence: the lane's `shots/` and `fit-full.log`, plus my
own throwaway puppeteer probes (scratchpad, outside the repo) at 1366x650, 1280x600, 1100x650, 1180x620, 700–820 x 650
and 1366x960. For "unchanged" checks I compared against the pre-lane tree 625dcb2, served with `MQ_ROOT`.

## Verdict: PASS (every cell is 8 or more)

The round-3 quiz fixes work. After typing, one click on Next moves on and the next box is focused. Tab from a box goes
to Previous, then Next. "Q1 · skill · Flag" sits in the side gutters and never overlaps the paper at 1100, 1180, 1280
or 1366 px wide. At 1280x600 the quiz now opens typical items with room to spare: `add` box bottom 360, fold 537. The
gate's quiz row is now at parity with the card: 3 tall items at 1366x650 and 7 at 1280x600, against the card's 6 and 9.
The defects that remain are small or outside the lane. The quiz bar-graph item still stacks its chart above the
question, and it still has to scroll. I do not fail the quiz host for it (see defect 1), but it is a must-fix for the
template.

## Scores

| Host | Size | C1 Ease | C2 Teach | C3 Layout | C4 Fidelity |
|---|---|---|---|---|---|
| Practice card | 1366x650 | 8 | 8 | 8 | 9 |
| Practice card | 1280x600 | 8 | 8 | 8 | 9 |
| Boss / race | 1366x650 | 8 | 8 | 8 | 9 |
| Boss / race | 1280x600 | 8 | 8 | 8 | 9 |
| Online worksheet | 1366x650 | 8 | 8 | 8 | 8 |
| Online worksheet | 1280x600 | 8 | 8 | 8 | 8 |
| Quiz | 1366x650 | 8 | 8 | 8 | 9 |
| Quiz | 1280x600 | 8 | 8 | 8 | 9 |

## Round-2 defects

| R2 | Status | Evidence |
|---|---|---|
| 1 Quiz: first Next after typing swallowed; Tab drops focus | **fixed** | Probe, `add`, `add_column_multi` (digit boxes) and `fractions:identify` at both sizes. On each: type 5, click Next once, and the page moves to Q2 with its box focused and "1/3 answered". Tab from the box goes to Previous, then Next. Going back to Q1 shows the typed 5 kept. `quiz-take.js` now calls `refreshQuizChrome()` instead of re-rendering. |
| 2 Quiz bar graph: bars and box not visible together | **not fixed** (known template matter) | `fit-full.log`: problem 740 px, box 876, fold 537/587. Probe at 1366x650: on load active-box scrolls to 234. The box (505–570) is in view and focused, but the tops of the January and April bars are cut off, and the item asks "How many books were read in all?". At scrollY 0 (`1366x650-quiz-graphs-bar_graph.png`) the question is not visible. The card draws the same skill side by side at 331 px (`1366x650-card-graphs-bar_graph.png`). The worksheet's bar_graph cards 1 and 3 still have a ~120 px empty band above the chart (`1366x650-worksheet-graphs-bar_graph.png`). |
| 3 Quiz header row | **fixed** | The row is in the gutters (`1280x600-quiz-*.png`). Probe at 1100/1180/1280: Q number, skill chip and Flag (64x44) never hit the paper. At 1280x600, `counting_all`, `name_2d_shapes`, `word_problems_mixed` and `count_objects` now fit. The quiz items still filed tall there miss by 8–12 px (`add_column_multi` 547/537, `perimeter_intro` 549, `add_wp_10` 545). active-box brings their box into view; the cost is that "Add." slides under the bar. |
| 4 Toast covers feedback and cell | **fixed**, with a small new spot | The toasts now sit at top right under the bar (1089–1267 x 70–118 at 1366). They are clear of the cell, the feedback line and Check. They now cover the right end of the Q-dot progress row (see defect 5). |
| 5 Cheer covers the new question | **partly** | The mascot and bubble have moved to the right gutter: bubble 1140–1267, paper 323–1043 at 1366, and also clear at 1280. The "+5 XP" burst (`.mq-xp-burst`, card-relative, top 30%) is still drawn over the new item's top operand for ~1.5 s (probe `boss-correct`, `race-correct`). This is pre-existing at every height. |
| 6 Tab order | **not fixed** | The order is still Hint, Read, Check, My Stats, Menu, × (the closed settings panel), Exit, q-dot, box, on the card, boss and race. |
| 7 Worksheet focus | **partly** | On load, the first box is now focused (`activeIsBox: true`, box 263–311). After a wrong answer plus Enter, focus goes to BODY and no box is active, so the pupil must tap again (probe `ws-wrong`). |
| 8 700–760 px score clip | **not fixed** | At 700 px the pill still shows "0 C" (probe `rs-700`). At 760 and 820 px it is fine. This is outside Chromebook widths. |
| 9 Dark race cars | **partly** | The lanes are now light dashed lines. The cars are 1.2rem (~19 px) and the red car is still dim on the dark track (probe `dark-race`). |

## Teacher / home / tall screen / print unchanged: YES

- **Home:** `home-student-1366x650.png` against `before-home-student-1366x650.png` gives 0 pixels over threshold.
  The teacher home differs only in the greeting ("Good morning" / "Good afternoon", 365–490 x 38–65).
- **Teacher in play:** I probed `addition:add` at 1366x650 in teacher mode on HEAD and on 625dcb2, with animations and
  background off. The pixel diff is empty. On HEAD, `html.mq-play` is set, but every compact rule needs
  `body.student-mode`.
- **Tall screen:** `tall-screen-card-1366x960.png` shows the full app header, the stats banner and the stacked game
  header, as before. Every rule in `css/play-compact.css` sits inside `@media screen and (max-height: 860px)`.
- **Print:** no `@media print` rule is added. The lane's CSS is all `@media screen`, and the lane touched no print
  module.

## Gate honesty (`ws-chromebook-fit`)

It is honest on the R2 holes. The budget is now 130. "Seen" means below the sticky bar. Typed boxes must be brought into
view. The quiz test types a digit, then asserts that one click on Next reaches Q+1 with the box focused. I reproduced
each of these by hand. Two smaller things remain:
- A **paper-kind** response (tap or build widgets) that is not in view on load still passes. Examples are
  `composing:base10_build` quiz 1280x600 ("NOT in view (box 586, fold 537)") and the card at both sizes.
- The gate never exits a game between hosts. Its quiz screenshots therefore carry a stale on-task timer chip from the
  card run, and at 1280x600 the chip sits over a corner of Next (`1280x600-quiz-counting-count_objects.png`,
  `1280x600-quiz-fractions-identify.png`). This is a test artefact. I checked that Exit removes the chip, a fresh quiz
  has none, and the chip is `pointer-events: none`.

## Defects (none blocks the PASS)

**1. Quiz, both sizes: the `graphs:bar_graph` item stacks its chart above its title, question and box, so it scrolls,
and when the box is in view the bar tops are cut.** (C3; template follow-up, not this lane's files)
- Repro: a quiz of `graphs:bar_graph` (seed 1) at 1366x650. On load, scrollY is 234. The January and April bars run
  off the top under the bar, and the item asks for the total of all four bars.
- Why it costs: the pupil must scroll up to read two values, then down to answer. The same item fits in 331 px on the
  card.
- Why I do not fail the host for it: it is one family. The box is focused and brought into view, which is what the
  owner's rule asks of a tall item. The quiz now matches the card on every typical skill.
- Fix (template lane): give the k2 bar-graph cell the card's two-column form on the quiz too. Put the chart left and
  "title / question / box" right, inside the 720 px paper, with the chart size unchanged. Then drop the
  `:not(:has(.fg-bar-graph…))` exception so the gutter header applies. Also trim the padded top of the chart viewBox
  that leaves the ~120 px empty band in worksheet bar_graph cards 1 and 3.

**2. Card, boss and race, every size: the "+5 XP" burst is drawn over the next question's digits for ~1.5 s.**
(C4/C1, small; pre-existing)
- Seen in probes `boss-correct-1366`, `race-correct-1280`: "+5 XP" sits on the top operand "5".
- Fix: in play, anchor `.mq-xp-burst` to the score in the bar (`#gameScore`) or to the right gutter next to the
  cheer. Never anchor it at `top: 30%` of the card.

**3. Card, boss and race: the Tab order still puts Exit and the box last.** (C1, nit; R2-6)
- The order is Hint → Read → Check → My Stats → Menu → × (closed settings panel) → Exit → a q-dot → box.
- Fix: in compact play, give the closed settings panel `inert`, take the q-dots out of the tab order, and order the
  bar so Exit comes first and the box comes before Hint.

**4. Online worksheet: a wrong answer drops focus to BODY.** (C1, nit; R2-7)
- Repro: worksheet `addition:add`, type 99 in card 1, press Enter. The "Not yet" scaffold redraws, the active element
  is BODY and no box pulses.
- Fix: after the wrong-answer redraw, re-arm active-box on the same card's box (`focus({preventScroll:true})` plus the
  reveal).

**5. Card, boss and race, both sizes: the top-right toasts cover the right end of the Q-dot progress row.** (C2,
small)
- `1280x600-card-fractions-identify.png`: "Starting Practice with 1 skill!" covers dots 6–20 for ~3 s. The boss and
  race "Keep trying! +2 XP" toast (1089–1267 x 70–118) covers the dots at 82–114 after every wrong answer.
- Fix: put pupil-play toasts in the right gutter below the dots (`top: 122px`), or drop the attempt-XP toast in pupil
  play.

**6. Quiz: after Previous, focus lands on BODY.** (C1, nit)
- Repro: answer Q1, go to Q2, click Previous. The Q1 box shows the answer but is not focused, so the pupil must tap it
  to change it.
- Fix: on navigation, focus the shown question's first box even when it is answered, with `preventScroll` plus the
  reveal.

**7. 700 px wide, short screen: the score is clipped to "0 C".** (C1, nit; R2-8; below Chromebook widths)
- Fix: below 760 px, drop the word "Correct" (show "0 ✓"), or start the compact layout at 760 px.

**8. Race, dark mode: the cars are small and the red car is low-contrast.** (C2, nit; R2-9)
- Fix: a light lane fill in dark mode (not only lighter dashes), and a "You" tag on the player's lane.

**9. Gate:** hold paper-kind responses to the "seen on load" rule (or list them explicitly). Call `exitGame()`, or
remove `#floatingTimer`, between hosts so the quiz shots do not carry a stale timer chip.

**10. Process: commit b04a7c7 committed 87 regenerated screenshots in other lanes' run folders.** These are
`design/audit/runs/wave1-A`, `wave1-A-fix`, `wave1-A2` and `wave1-A3`. They are earlier critics' evidence. Restore them
from 625dcb2 before the merge (`git checkout 625dcb2 -- design/audit/runs/wave1-A design/audit/runs/wave1-A-fix
design/audit/runs/wave1-A2 design/audit/runs/wave1-A3`).

### Out of lane, seen in passing (same on 625dcb2)

- Quiz `coordinates:coordinate_q1` shows "Plot point A at (7, 8)" with a text box and no grid.
- Quiz `number_theory:prime_composite` (seed 1) shows "Click ALL the prime numbers." with only a definition and a text
  box, and no numbers.

`quizQuestionData` appears to drop the interactive visual for these. That is a quiz content bug, not a fit problem.

## What passed

- Typical items show the problem, the box and Check/Next at scrollY 0 on all four hosts at both sizes.
- The worksheet shows 6 full cards for `add` at 1366x650, and its first box is focused on load.
- The arena and the track stay in the bar.
- The cheer bubble and mascot no longer touch the paper.
- Every bar control is ≥ 44 px, including the quiz Flag at 64x44.
- The question cell is the same black-and-white Andika cell, unshrunk, in light and dark mode.
- No horizontal overflow at 700–1366 px. No console errors in any probe.
