# Critic R2: the long-division bracket hugs its dividend on screen (`ldiv-hug`)

Independent critic (mq-opus-medium), 2026-10-09. This round grades HEAD `6e65aea5` ("Remainder bracket hugs its
dividend; bracket gate measures it"). It is measured against:
- RUBRIC.md, the four criteria and the 8-or-better bar;
- `ldiv-hug/CRITIC-R1.md`, the defects this round must close (D-1, D-2, and the optional G-1, G-2);
- `ldiv-hug/INDEX.md` "Round 2", the builder's claims.

## What I did

**Read the change.** `git diff 6e9a0df6 HEAD -- js css tests`:
- `css/screen-cell.css`: one rule appended (`.mq-scell .mq-rembrk .mq-cellbox { flex: none; }`), nothing removed;
- `js/modules/screen-cell.js` `ringCellHTML`, bracket branch only: the class `mq-rembrk` is added, `column-gap: 0`,
  the quotient span gets `contain: inline-size`, the arc moves down 1 px, the dividend stretches to the row with
  0.12 em side padding, "R" gets `padding: 0 0.15em 0 0.6em`, and the boxes are sized from the dividend and divisor
  (`max(len, 2)`) instead of from the answer;
- `tests/scripts/ws-ldiv-hug.cjs`: a `.mq-remeq` measure branch with a join check, the `CEIL` ceiling, box placement,
  `BOX_MIN = 44`, a fail on any skill × host with no bracket, and `div_remainders` in the skill list.

**Looked at the evidence.** I looked at every `r2/` PNG for the remainder bracket by eye, plus zoomed crops at native
resolution. I pixel-diffed every `r2/` PNG against its `after/` twin from R1 at 40 grey levels:
- byte-identical apart from noise: every worksheet and quiz render of `div_facts-long`, `div_facts-mix`,
  `divide-facts`, `divide-21`, `divide-31`, `long_div_2digit`, and both `one-digit-card-*`;
- changed: every `divide-31-R-*` (the fix), plus `div_facts-long-card-1280`, `div_facts-mix-card-*`,
  `divide-31-card-*` and `long_div_2digit-card-1280`. I looked at those side by side: the only differences are the
  game background's random decoration and a 1 px card-height difference. The bracket is the same drawing;
- new: `div_remainders-bracket-*`.

The fact- and worked-bracket lines of the gate log are identical between `after/ws-ldiv-hug.log` and
`r2/ws-ldiv-hug.log`. So nothing regressed for `.mq-ldiv` or `.ws-ops-division`.

**Re-ran the gate.** `node tests/scripts/ws-ldiv-hug.cjs --shots <scratch>/critic2/shots` returned **OK**, exit 0,
154 brackets. Every PASS/FAIL line is identical to `r2/ws-ldiv-hug.log`.

**Ran my own probe** (`critic2/probe.cjs`, one browser, DPR 2 on the card), on `div_remainders {notation:['bracket']}`
(seed 12, "3)8", a 1-digit dividend) and `divide {notation:['bracket'], tiles:31, regroup:'always'}` (seed 11,
"6)580"):
- the card at 1280, 820, 390 and 320: geometry, the R label against both boxes, the box against the divisor and the
  bar, cell padding, horizontal scroll; then focus on the remainder box, and a wrong remainder submitted;
- the online worksheet at 1280, 390 and 320 (`div_remainders`, 2- and 1-digit dividends): geometry, then Check All
  with item 1 right, item 2's remainder wrong and item 3's quotient wrong, and focus on item 4's remainder box.

No console errors in the gate or the probe.

## Verdict: **PASS**

Both R1 blockers are closed, and so are G-1 and G-2.
- **D-1 is closed.** The remainder bracket is one unbroken vinculum that hugs its dividend on every host and every
  width I tried, with its boxes at least 46 px, "R" clear of both boxes, and the right / wrong marks and focus fill
  fully visible.
- **D-2 is closed.** The gate measures the remainder bracket, fails a skill × host that measured nothing, and fails
  the R1 tree with 48 failures, all of them on that bracket.

Every score below is 8 or better.

## Score tables

The four RUBRIC criteria: C1 ease of use · C2 educational value · C3 spacing and layout · C4 standard fidelity.

### Practice card (390 / 1280; probe also 820 and 320)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket `.mq-ldiv` (div_facts Long / Mix, divide facts) | 1, 2, 3 digits | 9 | 8 | 9 | 9 | Unchanged from R1, pixel-identical apart from the background. `one-digit-card-390` "2)8" tight. Gap 0.33 / over 0.12 em. R1 N-1 stands |
| Worked bracket `.ws-ops-division` (long_div_2digit, divide 21 / 31) | 2, 3, 4 digits | 8 | 8 | 8 | 8 | Unchanged from R1. `divide-31-card-1280` "6)576", gap 0.54 / over 0.11 / spacing 0.22 em, same as paper |
| Remainder bracket `.mq-remeq.mq-rembrk` (divide regroup, div_remainders) | 1, 2, 3 digits | 9 | 8 | 8 | 9 | `divide-31-R-card-390/1280` "6)580", `div_remainders-bracket-card-1280` "4)18", probe "3)8". Gap 0.38 / over 0.12 em at every width. Bar join 0 px, step 0 px. Boxes 71 / 60 / 47 / 46 px tall at 1280 / 820 / 390 / 320. O-2 |

### Online worksheet (1280 / 390; probe also 320)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket | 1, 2, 3 digits | 9 | 8 | 9 | 9 | Pixel-identical to R1 `after/` |
| Worked bracket | 3, 4 digits | 8 | 8 | 8 | 8 | Pixel-identical to R1 `after/` |
| Remainder bracket | 1, 2, 3 digits | 9 | 8 | 8 | 9 | `divide-31-R-worksheet-1280`: all six cells "9)235" … "2)251" joined and tight. `div_remainders-bracket-worksheet-1280/390`, including "2)5". Probe at 320: cell pads ≥ 41 px each side, no horizontal scroll. Checked state: `ws-1280-checked.png` |

### Quiz (1280)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket | 2 digits (1 and 3 on the other hosts, same CSS) | 9 | 8 | 9 | 9 | `div_facts-long-quiz-1280`, pixel-identical to R1 |
| Worked bracket | 3 digits | 8 | 8 | 8 | 8 | `long_div_2digit-quiz-1280` "50)400", identical to R1 |
| Remainder bracket | 2, 3 digits (1 digit on the 1280 card, same 56 px cell) | 9 | 8 | 8 | 9 | `divide-31-R-quiz-1280` "8)110", `div_remainders-bracket-quiz-1280` "6)16". Joined, gap 0.38 / over 0.12, boxes 71 px |

Why the remainder bracket's scores:
- **C1 9:** two obvious boxes, quotient over the dividend and remainder after "R". Each is at least 46 × 46 px at
  every width; the rubric asks for 44. "R" sits 5–25 px clear of the quotient box and 7–13 px clear of the remainder
  box, with no overlap at any width. A wrong remainder shows a red dashed box with ✗ on its corner. The correct
  quotient beside it shows green with ✓ (`card-390-d31R-wrong.png`, `card-1280-drem-wrong.png`). Neither mark covers
  "R", the dividend or the other box. The yellow focus fill fills the whole remainder box (`card-320-drem-focus.png`).
- **C2 8:** the boxes are now sized from the dividend and divisor, never the answer (SL-2). Before, the box width
  leaked the quotient's digit count. The task is the same production task as on paper. Feedback marks each box
  separately and opens the "Here is how" steps.
- **C3 8:** the bracket is a compact unit, centred with its R column in the cell. The quotient box is 0.13–0.4 em
  wider than a 1-digit dividend and overhangs the bar's end slightly, which reads as centred. The cap at 8 is O-2.
- **C4 9:** it now reads like the fact bracket, "6)‾580", with one stroke from the arc to the end of the dividend. Paper
  draws these items with the worked bracket at 0.53 em, so this is R1's N-1 again (screen hugs a little tighter than
  paper). That is the direction the owner asked for.

## D-1: closed

| R1 finding | R2 measurement (gate and probe) |
|---|---|
| Arc stub ended 8.4 px before the bar (56 px) | Bar join **0.0 px** at 1280, 820, 390 and 320, card and worksheet |
| Bar 3.2–4.2 px lower than the stub | Step **0.0 px** everywhere (the arc's `top:1px` centres its 2 px stroke on the dividend's 2 px border) |
| Gap 0.56 / 0.76 / 1.05 em, over 0.15 / 0.34 / 0.64 | Gap **0.38**, over **0.12** for 1-, 2- and 3-digit dividends at every size |
| Boxes ≥ 44 px? | 46 (worksheet, 320 card), 47 (390), 60 (820), 71 (1280) px tall |
| "R" covered by the box? | No. The quotient box's right edge is 5.1 px (1-digit, 29 px) to 24.5 px (3-digit, 56 px) left of "R". Overlap area is 0 in every case |
| Box over the divisor or the bar? | Box left is 6.6–27 px right of the divisor glyph, and its bottom is 4.5–7.7 px above the bar |

Zoomed crops (`crop-divide-31-R-card-1280.png`, `crop-div_remainders-bracket-worksheet-1280.png`) show one continuous
stroke from the arc to the bar's end.

**Change review:**
- **Additive:** yes. One CSS rule is appended. The JS change is confined to the bracket branch of `ringCellHTML`, and
  the across form is untouched.
- **Saved quizzes:** the quiz stores the question's visual HTML. An item saved before this change has no
  `mq-rembrk` class and keeps the old inline style, so it renders exactly as before (the old gap). It is not broken.
  New items get the fix. This is acceptable under the "CSS changes must be additive" rule, and nothing worse than R1's
  state.
- **`contain: inline-size` on the quotient span:** the span is a grid item with `display:flex`. Containment takes it
  out of the column's track sizing, and `.mq-cellbox { flex: none }` keeps the box at its own width rather than
  shrinking to the now-narrow span. The absolute ✓ / ✗ marks still draw on the box's corner (checked).

## D-2: closed. The gate is sound

| R1 ask | R2 |
|---|---|
| Measure `.mq-remeq` | Yes: a third branch, arc edge at 0.525 of the arc width (the `Q9` curve's maximum, as for the worked arc) |
| Join assertion | `bar broken` when dividend.left − arc.right > 1 px, and `bar steps` when the arc's stroke centre and the border's centre differ by more than 1 px. On the R1 tree it reports "broken 8.4 px … steps −4.2 px" at 56 px, matching R1's probe |
| Fail on an empty measurement | `seen` counts brackets per host × skill, and any 0 is `FAIL <host> <tag>: no bracket measured`. The code is correct by reading. It could not be exercised on either tree, because every host now measures ≥ 1 bracket |
| `div_remainders` in `SKILLS` | Yes. Its paper reference is `divide` 21 with regroup, because `div_remainders` paper draws the same worked bracket (0.53 / 0.11) |
| On R1 tree FAIL, now OK | `r2/ws-ldiv-hug-on-R1-tree.log`: `FAIL (48)`, all on `divide-31-R` and `div_remainders-bracket`. `r2/ws-ldiv-hug.log`: OK. My re-run: OK, identical lines |
| G-1 ceiling | `CEIL` 0.43 / 0.22 for fact and remainder. The R1 tree's remainder 0.56 / 0.15 now fails on the ceiling alone |
| G-2 placement | `placeOf`: box above the bar, clear of the divisor, inside the cell. `BOX_MIN = 44` |

## Defects

None that block.

### G-3 · No assertion on the R label's clearance · nit (gate)

**Where:** `ws-ldiv-hug.cjs`, the `.mq-remeq` branch.

**Issue:** `placeOf` checks the boxes against the bar, the divisor and the cell, but not against "R". The brief's
"R is not covered by the box" holds today (probe: ≥ 5.1 px clear), but only by eye and by my probe. The tightest case
is a 1-digit dividend at 29 px.

**To 10:** in the remainder branch, push `R covered` when `.mq-rlabel`'s rect intersects either input's rect.

### G-4 · The quiz host measures only its first question · nit (gate)

**Where:** `quiz()` measures `#quizTakeView` while Q1 is shown. So each quiz run measures one bracket, and the 1- and
3-digit checks are met on other hosts.

**Effect:** none today. The quiz cell is the 56 px card cell, and the probe covered 1-digit at that size. A quiz-only
regression on a different digit count would go unseen.

**To 10:** step through Q1–Q6 with `Next` and measure each.

### N-1 (from R1, unchanged) · Both one-line brackets are a little tighter than paper

Screen gaps are 0.33 (fact) and 0.38 (remainder) em. Paper is 0.53. Not scored down (C4 9).

## Observations outside this lane

- **O-1 (R1, unchanged):** the input corners are rounded (8.4 px) inside the cell, including both remainder boxes.
  This is for the screen-parity lane.
- **O-2:** on the 390 practice card the ring-twin cell draws its digits at 37 px, below the rubric's 40 px phone size.
  The fact bracket gets 40 and the worked bracket 57. The value is the same on the R1 tree, so it predates this round.
  The bracket is still clearly legible and the boxes are 47 px, so I kept C3 at 8. It is the first thing to fix for a
  higher C3.
- **O-3:** `divide {tiles:31, regroup:'always'}` with bracket notation and no counters still says "Make groups of 8.
  Type the answer." over "8)110". This is pre-existing instruction wording for the ring twin, and is not a bracket
  defect. File it with the divide family's instruction strings.

## What must change for PASS

Nothing. G-3, G-4, N-1 and O-2 are optional improvements toward 10.
