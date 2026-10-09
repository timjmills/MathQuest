# Bracket hug on screen (2026-10-09)

**Defect:** critic `div-facts-forms/CRITIC-R4.md` nit (c). On the online worksheet, a long-division bracket with a
narrow dividend drew a gap under the vinculum ("7)  28", "2)  8"). It also showed on the 390 card and with 1-digit
dividends on every host.

**Cause:** the fact bracket (`.mq-ldiv`, `screen-cell.js divisionHTML`) let its quotient box size the dividend's
grid column. The box had a 64 px floor (`css/screen-cell.css`, `.mq-ldiv-q .mq-slot { min-width: max(100%, 64px) }`).
Any dividend narrower than 64 px therefore left an empty stretch between the arc and the digits, and again between
the digits and the end of the bar.

**Fix:** an additive CSS rule at the end of `css/screen-cell.css` ("Bracket hug"):
- `contain: inline-size` on `.mq-ldiv-q` keeps the box out of the column's track sizing. The dividend's column is now
  as wide as its digits.
- The box is `max(dividend width, 48 px, its own height)` wide, so it is never narrower than it is tall. It is
  centred over the bar and overhangs both ends equally when the dividend is narrow.
- The box's width still follows the dividend, never the quotient (SL-2).

**The worked bracket** (`.ws-ops-division`: long_div_2digit, divide 2-/3-digit) needed no change. It is the kit's
`division` template, with tracks of 0.81 em and a gutter of 0.89 em. Paper (`sheet/cells/long-division.js`) uses the
same em ratios, so on screen it measures the same as on paper: gap 0.53, over 0.11, digit spacing 0.22. The work
tracks of at least 44 px fall out of the 57 px digit size and do not widen the bracket beyond paper's geometry.

**Gate:** `node tests/scripts/ws-ldiv-hug.cjs` checks every bracket on card 390 / 1280, worksheet 1280 / 390 and the
quiz, with 1-, 2- and 3-digit dividends. For each bracket it measures, from the digits' glyph boxes, the arc-to-digit
gap, the digit-to-bar-end overhang and the spacing between digits. Each is held to the paper drawing of the same
skill plus a tolerance, and every quotient box must be at least 40 × 40 px. Old CSS gives `FAIL (39)`
(`before/ws-ldiv-hug.log`). New CSS gives `OK`, with 112 brackets measured (`after/ws-ldiv-hug.log`).

| | fact bracket gap / over (em) at 29 px | at 40 px | at 56 px |
|---|---|---|---|
| before | 0.73 / 0.52 | 0.72 / 0.51 (1 digit) | 0.49 / 0.28 (1 digit) |
| after | 0.33 / 0.12 | 0.33 / 0.12 | 0.33 / 0.12 |
| paper (kit, L) | 0.53 / 0.11 | | |

**Evidence:** `before/` and `after/` hold the same renders: `<skill>-{card-390,card-1280,worksheet-1280,
worksheet-390,quiz-1280}.png`, `one-digit-card-{390,1280}.png` (8 ÷ 2) and `critic-set-worksheet-1280.png` (the
critic's own set: 11)132, 7)28, 3)21, 10)110, 6)66, 2)8). The paper references are `paper-*.png`.

Gates run after the fix: ws-boot-smoke OK, ws-screen-answer OK (default set, the division skills, and div_facts
Long), ws-screen-slots --category division OK, ws-div-facts-forms OK, ws-ldiv-hug OK.

## Round 2 (after CRITIC-R1: FAIL on D-1, D-2)

- **D-1, the remainder bracket** (`ringCellHTML` in `js/modules/screen-cell.js`, used by divide with remainders and div_remainders with bracket notation):
  - Fixed the same way as the fact bracket. The quotient box's span has `contain: inline-size`, and its cell box is
    `flex: none` (one additive CSS rule), so the box no longer widens the dividend's column.
  - `column-gap: 0`, so the arc's top stroke runs straight into the bar.
  - The arc drops half its stroke, and the dividend stretches to the row, so the bar no longer steps at the arc.
  - "R" is padded clear of the box's overhang.
  - The boxes are now sized from the dividend and divisor, not the answer (SL-2).
  - Result: gap 0.38 / over 0.12 em on every host, bar unbroken. Before: 0.56–1.05 / 0.15–0.64, with the bar broken
    by 4–8 px and stepped by 1–3 px.
- **D-2, G-1, G-2, the gate**:
  - The test now measures `.mq-remeq` brackets and checks the bar join, both its horizontal gap and its vertical step.
  - It fails any skill × host that measured no bracket.
  - It holds the one-line brackets to a ceiling of gap 0.43 / over 0.22.
  - It requires boxes of at least 44 px that sit above the bar, clear of the divisor and inside the cell.
  - `div_remainders` (bracket notation) is in the skill list.
  - On the R1 tree it reports `FAIL (48)` (`r2/ws-ldiv-hug-on-R1-tree.log`). After the fix it reports `OK`, with 154
    brackets measured (`r2/ws-ldiv-hug.log`).
- Evidence: `r2/*.png`, the same hosts and skills as `after/`, plus `div_remainders-bracket-*` and `divide-31-R-*`.
- N-1 (the screen fact bracket is tighter than paper) and O-1 (rounded input corners, which predate this lane) are not
  changed.
