# Chromebook fit — independent critic, round 1

Branch `claude/sweet-newton-c8wrv1-wip-chromebook-fit` @ 297df87. Graded against `design/audit/RUBRIC.md`
(screen checks) and the owner's 2026-10-09 goal. Evidence: the lane's shots in `shots/`, `fit-full.log`, and my own
probes (throwaway puppeteer scripts outside the repo, seeds 3 and 5) at 1366x650, 1280x600, 1366x960 and 390x844,
plus a baseline at 625dcb2 (the commit before the lane) for one check.

## Verdict: FAIL

The compact header is a real improvement. At 1366x650 the chrome above the problem drops from about 420 px to about
170 px. Check sits in place or pinned on every typical card item, the cell is not shrunk, and teacher, home, tall
screen and phone are untouched. But four rows have a 7: boss/race on tall items (the arena scrolls away for the whole
session), the online worksheet at 1366x650 (two chrome rows cost the whole second row of cards), the quiz (the next
box is not focused after Next, and a wasted header row clips typical items at 1280x600), and the practice card at
1280x600 (a card-top row that could fold leaves typical items under the pinned bar).

## Scores

| Host | Size | C1 Ease | C2 Teach | C3 Layout | C4 Fidelity |
|---|---|---|---|---|---|
| Practice card | 1366x650 | 8 | 8 | 8 | 9 |
| Practice card | 1280x600 | 8 | 8 | **7** | 9 |
| Boss / race | 1366x650 | 8 | **7** | 8 | 9 |
| Boss / race | 1280x600 | 8 | **7** | **7** | 9 |
| Online worksheet | 1366x650 | 8 | 8 | **7** | 8 |
| Online worksheet | 1280x600 | 8 | 8 | 8 | 8 |
| Quiz | 1366x650 | **7** | 8 | **7** | 9 |
| Quiz | 1280x600 | **7** | 8 | **7** | 9 |

## Teacher / home / tall screen unchanged: YES

- `before-home-student-1366x650.png` vs `home-student-1366x650.png`: the two look the same. The pixel diff box
  (0,1)-(1366,476) is the animated background shapes. Teacher before/after: pixel-identical (no diff box).
- `tall-screen-card-1366x960.png`: the full header, the stats banner, the separate Exit, progress and timer rows. This is
  the old layout. The media query is `max-height:860px`.
- Teacher in play at 1366x650 (my probe, `toggleUserRole` then practice): the full teacher layout, with no Menu button
  and no compact rows. The compact sheet is scoped to `body.student-mode`.
- Phone 390x844 in practice and worksheet: `scrollWidth == clientWidth == 390`. The Menu button is `display:none` and
  `.nav-stats` is visible. Compact does not engage in portrait.
- Print: not touched (`@media screen` only).

## Defects

**D1 — Boss / race, both sizes: on a tall item the arena scrolls away and stays away.** (C2, and C3 at 1280)
Repro: boss, `addition:add_column_multi`, 1280x600. On load active-box scrolls to y=203 so the digit row shows. Then
I answered two items correctly and sampled every 0.5 s. `scrollY` stayed at 203, then 269. The boss arena bottom
stayed at y=4, then -62, for the whole session. The new question is not scrolled back up. The Exit, score, timer and
"Keep answering to defeat the boss!" lines are off screen too. Shots: `shots/1366x650-boss-addition-add_column_multi.png`
shows the 4th addend row half under the pinned bar at scrollY 0. The same holds for `add_wp_10` and `long_div_2digit`
(boss box 843 / 835 > fold 595 in `fit-full.log`).
Why it costs: the arena is the whole point of the mode. The pupil never sees the hit or the car move after an answer.
On long items the reward and progress feedback is lost.
Fix: on short screens, put the boss and race stage in the row-2 grid in place of the skill progress bar (it is already
68 px / 26 px lanes, so a ~52 px strip fits). Or make that slim stage sticky at the top with the Check bar pinned at the
bottom. Also scroll back to the top of the card when a new question renders (active-box then scrolls only as far as the
box needs). Gate: in boss/race, assert that the arena is in view at the moment feedback shows.

**D2 — Online worksheet, 1366x650: two chrome rows cost the second row of cards.** (C3)
`shots/1366x650-worksheet-addition-add.png`: the stats-chip row (0–60) plus the worksheet bar (66–122), then cards.
Row 2 of cards ends at about y=690, so only 3 cards show in full (`cards 3` in the log). The stats chips (effort,
streak, clock, score, mood) say nothing about the worksheet that the bar does not. Dropping them into the worksheet bar,
or hiding them on the worksheet, saves about 60 px, which brings row 2 to about 630 < 650. That is 6 full cards instead
of 3. The owner asked for "as many cards as fit".
Fix: in `#worksheetView.active`, put Back · Worksheet · chips · Check All · New · Menu in one sticky row, or collapse
the chips behind My Stats. Gate: `cardsFull ≥ 6` for `addition:add` at 1366x650.

**D3 — Quiz, both sizes: after Next the focus drops to `<body>`, so the pupil's typing goes nowhere.** (C1)
Repro: quiz `addition:add` 1280x600. Type 5 in Q1, then trackpad-click Next (puppeteer `page.click`), or Tab to Next
and press Enter. On Q2 `document.activeElement` is BODY (sampled for 3 s). Typing "7" changes no input. The box pulses
but is not selected. The practice card does this right: after Next the focus is `answerInput`. The same happens on
625dcb2, so it is pre-existing. It is still in this lane's stated scope ("the next answer box pulses and is
auto-focused").
Why it costs: every quiz item needs an extra trackpad tap before typing. That is a real slowdown for this pupil group.
Fix: after the quiz renders a new question, let active-box focus the pulsing box (`preventScroll`, then its own
in-view reveal) even when the last event was a click on the Next / page-number button. Navigation buttons are not
"working there". Gate: after Next, `activeElement` is the `.mq-active-box`.

**D4 — Quiz, 1280x600: the Q-header row wastes about 60 px and typical items open with the box under the nav bar.**
(C3, C1)
`shots/1280x600-quiz-fractions-identify.png`: chips row, then "A Q1 of 3 … 0/3 answered", the progress bar, then a
second "Q1 Identify Fractions … Flag" row (122–166) and a gap, so the paper starts at y=221. The answer box (bottom 541)
is cut by the pinned Previous/Next bar (fold 534). `fit-full.log` lists about 13 categories in this state at 1280x600
on the quiz alone (compare_groups, number_bonds, number_line_int, fractions:identify, add_fractions_like,
name_2d_shapes, perimeter_intro, time_hour, time_quarter, tape_diagram, prime_composite, add_column_multi …). Most
miss by 5–60 px. The gate files them under "tall" only because its 190 px budget is more than 1280x600 can give.
Fix: fold the per-question header (Q number, skill chip, Flag) into the `qt-topbar` line ("A · Q1 of 3 · Identify
Fractions · 0/3 · Flag") and drop the duplicate Q1. Also give the pinned `.qt-nav` the card's paper colour or a top
rule, so a cut card does not look like it simply ends. Tighten the gate so a problem under ~400 px counts as typical
at 1280x600.

**D5 — Quiz, both sizes: `graphs:bar_graph` cannot show its graph and its answer box together.** (C3)
`shots/1280x600-quiz-graphs-bar_graph.png` and my probe: the chart is drawn about 700 px tall in the quiz cell (the
problem is 908 px, the box bottom at 1086). After the auto-scroll the box shows but every bar is above the fold
("How many more chose mangoes than grapes?" with only the axis labels visible). The same skill in the practice card is
331 px and fits. The quiz host scales the chart with the cell width, not with the screen.
Fix: on short screens give the quiz cell the same visual width cap as the practice card, so the chart is drawn at its
card size. That is not shrinking: it is the size the skill draws everywhere else. The same check applies to the
worksheet's bar_graph cards, which also misplace the chart: card 1 and card 3 have a large empty band above it
(`shots/1280x600-worksheet-graphs-bar_graph.png`).

**D6 — Practice card, 1280x600: typical items open under the pinned bar; the card-top line could fold.** (C3)
`fit-full.log` at 1280x600 card: `measurement:time_hour` and `time_quarter` (box 579 > fold 545),
`area_perimeter:perimeter_intro` (566), `decimals:add_decimal` (787), `data_analysis:mean` (602),
`addition:add_column_multi` (564), the mixed pools. The card spends 130–170 on the "Q1 · skill chip · dots" line
before the paper at about y=172. At 1100 px and wider the dots already ride in that line. The Q number and skill chip
could ride in row 2 beside "0 Correct" (the topic text there is long and ellipsised anyway).
Fix: move Q# and the skill chip into the row-2 game header on short screens, saving about 40 px. time_hour and
perimeter_intro then fit at 1280x600 with no scroll.

**D7 — Start toast covers Check at 1280x600.** (C1, small)
`shots/1280x600-card-graphs-bar_graph.png`, `…-division-long_div_2digit.png`, `…-addition-add_wp_10.png`: "Starting
Practice with 1 skill!" (fixed, `bottom:30px`) sits on the pinned Check bar for its lifetime. XP toasts, which are
still allowed in pupil play, land in the same place. This collision is new: before the lane, Check was not on the
bottom edge.
Fix: in `html.mq-play` on short screens, raise `.toast-notification` above the pinned bar (`bottom: 84px`, like the
floating timer) or place it at the top under the header.

**D8 — Menu sub-popovers: Escape leaves them open, and they stack over each other.** (C1, small)
Repro 1366x650: Menu, then Voice ▾ (the picker opens), then Escape (the Menu closes), then Menu again. The voice picker
is still open. Then MAP Test ▾: its list (MAP K-2 / 3-5 / K-5) draws *under* the voice picker, so only "MAP K-2"
shows (my probe `map.png`; compare `map-alone.png`, where all three show). In the wrapped three-row Menu the two
drop-downs overlap. In the one-row full header they did not.
Fix: Escape and close-Menu also close any open `.nav-popup` / MAP list. Opening one sub-popover closes the other.
Give sub-popovers a z-index above their siblings.

**D9 — Focus order in the compact header does not match what the pupil sees.** (C1, nit)
Tab order on the card: Hint, Read, Check, **Menu**, My Stats, full screen, `settings-panel-close` (an off-screen ×,
pre-existing), Exit, box. On screen the order is brand, chips/full screen, My Stats, Menu. Menu is inserted before
`.nav-stats` in the DOM but drawn last.
Fix: insert the button after `#myStatsBar` in the DOM, or give the row a DOM order that matches the grid.
(Separately, the hidden settings panel's × should be `inert`/`hidden` while closed. That is pre-existing and not
scored here.)

**D10 — Dark mode Menu button contrast.** (C1/C4, nit)
`dark-card-1366x650.png`: Menu text `rgb(124,92,230)` on `rgb(42,38,64)`, about 3:1, which is below AA for 15 px bold.
Fix: use the light purple (`#b9a6ff`) or white text on the dark button.

## What passed

- 1366x650 practice card, typical items (`add`, `subtract`, `mult_facts`, `count_objects`, `fractions:identify`,
  `bar_graph` …): the problem, the box and Check all show at scrollY 0 (e.g. the add box bottom 443 vs 879 before).
- The pinned Check bar holds Hint and Read. Feedback ("Not yet. Use the touch dots…", "Spot on!") shows above it. The
  2nd-try arrow scaffold grows the cell and Check stays pinned. The Hint modal works.
- Every visible control I measured is at least 44 px. Menu opens with Enter, Escape closes it and returns the focus to
  Menu, and the Menu items are tabbable.
- The cell is paper-white Andika at full size in light and dark mode. The chrome stays outside the cell.
- The worksheet's Check All bar stays at the top while scrolling (bar 0–56 at the page bottom).
- No horizontal overflow at any size tested.
