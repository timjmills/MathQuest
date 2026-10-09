# Chromebook fit — independent critic, round 2

Branch `claude/sweet-newton-c8wrv1-wip-chromebook-fit` @ 31b2af0. Graded against `design/audit/RUBRIC.md` (screen
checks) and the owner's 2026-10-09 goal. Evidence: the lane's `shots/` and `fit-full.log`, plus my own throwaway
puppeteer probes (scratchpad, outside the repo) at 1366x650, 1280x600, 1366x960 and 700–1100 x 650. I compared
against the tree before the lane (625dcb2) and the round-1 tree (297df87), served with `MQ_ROOT`.

## Verdict: FAIL (the quiz row has 7s)

The restructure works. One sticky bar per host, the arena and track inside it, and the chips moved into the Menu.
The practice card, boss/race and worksheet now reach 8 at both sizes. At 1366x650 the worksheet shows 6 full cards
and the add box bottom is at 391 (it was at 879). The arena and track sit at y=5–59 through a whole session,
including when a tall item has scrolled the page. The quiz still fails on two counts. The first Next after typing
an answer is swallowed, and Tab from the box drops focus to `<body>`. The bar-graph item still cannot show its bars
and its box together.

## Scores

| Host | Size | C1 Ease | C2 Teach | C3 Layout | C4 Fidelity |
|---|---|---|---|---|---|
| Practice card | 1366x650 | 8 | 8 | 8 | 9 |
| Practice card | 1280x600 | 8 | 8 | 8 | 9 |
| Boss / race | 1366x650 | 8 | 8 | 8 | 9 |
| Boss / race | 1280x600 | 8 | 8 | 8 | 9 |
| Online worksheet | 1366x650 | 8 | 8 | 8 | 8 |
| Online worksheet | 1280x600 | 8 | 8 | 8 | 8 |
| Quiz | 1366x650 | **7** | 8 | **7** | 9 |
| Quiz | 1280x600 | **7** | 8 | **7** | 9 |

## Round-1 defects

| R1 | Status | Evidence |
|---|---|---|
| D1 arena scrolls away | **fixed** | Probe: race `add_column_multi` 1280x600 sits at scrollY 66 (active-box scroll). The track stays at 5–59 across 4 answers. The cars move. Boss `add` 1366x650: the arena stays at 5–59 and the dino is pushed back on a hit. |
| D2 worksheet chrome rows | **fixed** | `1366x650-worksheet-addition-add.png`: one bar (0–60), 6 full cards. At 1280x600, row 2's boxes end at y=597. |
| D3 quiz focus after Next | **partly** | It works when nothing was typed (Q2 box focused). After typing an answer, the first click on Next does nothing and focus goes to BODY. See defect 1. |
| D4 quiz header row | **partly** | The chips row is gone (−60 px). The separate "Q1 · skill chip · Flag" row (y 88–132) is still there. At 1280x600, `counting_all` (box 539 / fold 537), `word_problems_mixed` 566, `name_2d_shapes` 549, `perimeter_intro` 591 and `add_column_multi` 589 still open under the Next bar. |
| D5 quiz bar charts | **not fixed** | `fit-full.log`: `graphs:bar_graph` quiz is a 740 px problem, box 876 against fold 537/587, "on load NOT in view". My probe at 1366x650: once the box is in view the bars are cut at the top, and Feb/Apr cannot be read (`quiz-bar_graph-1366-0.png` in the probe). The worksheet bar_graph cards 1 and 3 still have a ~120 px empty band above the chart (`1366x650-worksheet-graphs-bar_graph.png`). |
| D6 card at 1280x600 | **fixed** | `time_hour` 527/544, `perimeter_intro` 514, `add_column_multi` 512 are all in view at scrollY 0. |
| D7 toast over Check | **partly** | The toast now sits at bottom 84 and no longer covers a pinned Check. It now covers other things: the feedback line, Show Solution and cell content. See defect 4. |
| D8 Menu pop-ups | **fixed** | Voice open, then Escape, closes both. Reopening the Menu shows no stale picker. MAP and Voice close each other. |
| D9 Tab order | **partly** | My Stats then Menu is now right. But the play order is Hint, Read, Check, My Stats, Menu, (off-screen settings ×), **Exit**, box. Exit, at the left of the bar, comes after Menu. |
| D10 dark Menu contrast | **fixed** | `dark-card-1366x650.png`: light outlined Menu button. The focus ring is visible inside the dark Menu. |

## Teacher / home / tall screen / print unchanged: YES

- Home: `home-student-1366x650.png` matches `before-home-student-1366x650.png`. Probe: after Exit from play
  (confirm dialog, then home) the header is fully restored. `#navStats` is back in `.nav-bar` at index 1, `mq-play`
  is cleared, and the screenshot matches the fresh home screen.
- Teacher in play at 1366x650, against 625dcb2: the pixel diff is only the box pulse (637–757 x 423–490).
  Switching to teacher mid-game gives the teacher play layout and the Menu button is hidden. Switching back to
  student restores the compact bar.
- Tall screen: `tall-screen-card-1366x960.png` shows the full header. Probe: resizing 650 → 960 → 650 mid-game
  moves the stats in and out of the nav correctly, and the layout returns.
- MAP: setup and item views at 1366x650 are pixel-identical to 625dcb2, apart from the background shapes.
- Print: untouched (`@media screen`).

## Gate honesty (`ws-chromebook-fit`)

It is mostly honest: zero-tolerance on typical items, arena-in-view, and focus after Next. It has four holes:

1. The "tall" cut-off is `problem > fold − 150`. At 1280x600 in the quiz, items that miss by 2–54 px are filed as
   tall. `counting_all` misses by 2 px.
2. The on-load "seen" check takes `boxTop >= 0`. It should take the bottom of the sticky top bar (≈66). A box
   under the bar counts as seen.
3. A box that is NOT in view on load passes when it is not marked `.mq-active-box`. That is how quiz `bar_graph`
   and `base10_build` pass.
4. The focus-after-Next check types nothing before clicking. That hides defect 1.

## Defects

**1. Quiz, both sizes, also tall screens (pre-existing): after typing an answer, the first Next click is swallowed
and Tab loses focus.** (C1)
- Repro: quiz `addition:add`, type 5, click Next. The page is still on Q1 and focus is BODY. A second click goes
  to Q2.
- Keyboard: type 5, then Tab. Focus is BODY, and it takes 3 more Tabs (Flag, box, Next) to reach Next.
- The same happens on 625dcb2 and 297df87, so it is pre-existing. It sits on this lane's control.
- Cause: the box's `onchange="submitQuizTextAnswer(...)"` runs on blur (the mousedown on Next). It calls
  `renderQuizInterface()` (quiz-take.js:526–528), which replaces the Next button before mouseup.
- Why it costs: every quiz item needs a double tap. A pupil who taps once thinks the app is stuck.
- Fix: in `submitQuizTextAnswer` / the digit-box `change` handler, call `recordAnswer` and update only the
  answered count and the page pills. Do not rebuild the interface on change. `navigateQuizQuestion` already
  records on Enter. Gate: type into the box, then click Next once; assert Q2 and that the box is focused.

**2. Quiz, both sizes: the bar-graph item still cannot show its bars and its box together (R1 D5 not fixed).** (C3)
- The quiz cell stacks the chart above "Books We Read / question / box", so the box is ~740 px down. The practice
  card draws the same item side by side, at 331 px.
- Fix: give the quiz cell the practice card's two-column graph layout on short screens (chart left, question and
  box right). Chart size stays the same. Then remove the empty top band in the worksheet bar_graph cards (the
  chart's viewBox is padded above the plot).

**3. Quiz, 1280x600: the per-question header row is still a separate ~60 px row (R1 D4 partly).** (C3)
- `1280x600-quiz-fractions-identify.png`: "Q1 · Identify Fractions · Flag" sits at y 88–132, under a top bar that
  already says "Q1 of 3".
- Five or more categories open with the box under the Next bar, missing by 2–54 px.
- Fix: fold the Q number, skill chip and Flag into the quiz's sticky bar ("A · Q1 of 3 · Identify Fractions ·
  0/3 · Flag") and drop the duplicate.

**4. Card and boss/race, both sizes: the lifted toast now covers the feedback line and cell content.** (C2, small)
- Probe screenshots: the race at 1280x600 after a wrong answer, where "Keep trying! +2 XP" sits on "❌ Nearly
  there!". The boss at 1366x650, where it sits on Show Solution and Check. Practice `base10_build` 1366x650, where
  the start toast covers the cell's key "= 1 ten / = 1 one".
- Why it costs: the feedback sentence is the teaching moment, and it is covered for ~3 s.
- Fix: place pupil-play toasts at the top, under the sticky bar (`top: 64px; bottom: auto`), clear of the cell and
  the feedback. Or drop the attempt-XP toast in pupil play.

**5. Card and boss, short screens: the correct-answer mascot cheer covers the NEW question for ~1 s.** (C1/C4, small)
- After a correct answer, "Boom — correct!" and "+5 XP" are drawn over the next item's digits, and the penguin sits
  between Read and Check (boss shot 3 in the probe; `.mq-mascot-cheer.on` is over the cell for ~950 ms).
- On a tall screen the viewport centre is over chrome, so this collision is new with the compact layout.
- Fix: on short screens in play, anchor the cheer to the bar, or to the right gutter beside the card (there is
  ~100–300 px free at 1280–1366).

**6. Card and boss/race, Tab order (R1 D9 partly).** (C1, nit)
- Order: Hint, Read, Check, My Stats, Menu, off-screen settings ×, Exit, box. Exit and the box come after the bar's
  right-hand buttons.
- Fix: in compact play, set the DOM order (or `tabindex` group) so that the order is Exit, box, Hint, Read, Check,
  My Stats, Menu, and put `inert` on the closed settings panel.

**7. Worksheet (pre-existing): the first box pulses but is not focused, and a wrong answer drops focus.** (C1, nit)
- On load, focus is BODY, so the pupil must tap card 1 before typing.
- After a wrong answer plus Enter, focus is BODY (the scaffold redraw), so they must tap again.
- Correct answers advance and scroll well (card 7 lands at y 536–584).
- Fix: focus the active box on load and after the wrong-answer redraw, with `preventScroll` and active-box's own
  reveal.

**8. 700–760 px width, short height: the score is clipped.** (C1, nit)
- `rs-700` probe: the Exit pill shows "0 C", and the topic is hidden.
- Fix: at under 800 px, drop the topic and keep "0 ✓". Or raise the compact min-width to 800, since Chromebooks
  are ≥ 1280 anyway.

**9. Race, dark mode: the cars are small and the red car is low-contrast on the dark track.** (C2, nit)
- `dark-race` probe: ~16 px emoji in 23 px lanes, and the dashed lanes are faint.
- Fix: give the lanes a lighter fill in dark mode, and a "You" tag on the player's lane.

## What passed

- Typical items show the problem, the box and Check at scrollY 0 on the card, boss, race and worksheet at both
  sizes. The question cell is the same B&W Andika cell, unshrunk, in light and dark.
- Every bar control is at least 44 px. The Menu's roleToggle is 84x26, but it sits inside a ~46 px pill and is a
  teacher control. Menu opens with Enter, Tab walks its items with a visible ring, and Escape closes it and returns
  focus to Menu.
- Hint, Read, feedback, the Q dots, the score and the timer stay visible in play. The effort, streak and mood
  chips are one tap away in the Menu. The score and progress the pupil needs stay on the bar, so this is
  acceptable for C2.
- No horizontal overflow from 700 to 1366 px. Leaving play restores home exactly. The MAP views are untouched.
