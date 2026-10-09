# Critic R1: the long-division bracket hugs its dividend on screen (`ldiv-hug`)

Independent critic (mq-opus-medium), 2026-10-09. This round grades HEAD `6e9a0df6` ("Long-division fact bracket hugs
its dividend on screen"). It is measured against:
- RUBRIC.md, the four criteria and the 8-or-better bar;
- `div-facts-forms/CRITIC-R4.md` nit (c), the defect this lane closes;
- `ldiv-hug/INDEX.md`, the builder's claims;
- the paper references `paper-div_facts-long-independent-L.png` and `paper-long_div_2digit-independent-L.png`.

## What I did

**Read the change.** `git show 6e9a0df6 -- css/screen-cell.css` (10 added lines at the end of the file, nothing
removed) and all of `tests/scripts/ws-ldiv-hug.cjs`.

**Looked at the evidence.** I looked at every `before/` and `after/` PNG named in the brief, by eye, and pixel-diffed
each pair at 40 grey levels:
- changed: the critic set, the worksheets, `one-digit-card-*`, `divide-facts-*`;
- byte-identical apart from noise: every `long_div_2digit-*`, `divide-21-*`, `divide-31-*` and `divide-31-R-*`.

**Re-ran the gate.** `node tests/scripts/ws-ldiv-hug.cjs --shots <scratch>/critic/shots` returned **OK** with 112
brackets. The numbers match `after/ws-ldiv-hug.log`.

**Ran my own probes,** one browser at a time. Output is under the scratchpad `critic/`.
- `probe2`: fact-bracket geometry on the worksheet at 1280, 390 and 320, and on the card at 820, 390 and 320 with 1-
  and 3-digit dividends. Also Check All with wrong answers, focus, and dark theme.
- `probe3`: the 390 card with a wrong answer.
- `probe4`: the remainder bracket (`.mq-remeq`) for `divide` (tiles 31, regroup always) and `div_remainders` (bracket
  notation), at 1280 and DPR 2.

No console errors in any probe.

## Verdict: **FAIL**

The fix itself is sound. The fact bracket (`.mq-ldiv`) now hugs its dividend on every host at every digit size, and
the worked bracket is at parity with paper, as INDEX.md claims.

The lane does not pass because of two findings:
- **D-1:** a third bracket drawing is on screen in the lane's own evidence (`divide-31-R-*`) and in `div_remainders`.
  It is the remainder bracket of the ring twin. It still shows the defect this lane exists to close: a gap under the
  vinculum, and on top of that a broken vinculum.
- **D-2:** the gate measures **zero** brackets on that drawing and still reports OK, although INDEX.md says it "checks
  every bracket".

D-1 was there before this lane: the `before` and `after` images are identical. It is still a bracket that does not hug
on all three screen hosts, so the bar is not met.

## Score tables

The four RUBRIC criteria: C1 ease of use · C2 educational value · C3 spacing and layout · C4 standard fidelity.

### Practice card (390 / 820 / 1280)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket `.mq-ldiv` (div_facts Long / Mix, divide facts) | 1, 2, 3 digits | 9 | 8 | 9 | 9 | `one-digit-card-390/1280` "2)8" tight. Gap 0.33 em, over 0.12 em at 40 / 56 px. Box 48 / 58 / 67 px square, 6 px above the bar, 9–15 px clear of the divisor. Nit N-1 |
| Worked bracket `.ws-ops-division` (long_div_2digit, divide 2- / 3-digit) | 2, 3, 4 digits | 8 | 8 | 8 | 8 | `long_div_2digit-card-390/1280`. Gap 0.54, over 0.11, spacing 0.22 em, against paper's 0.53 / 0.11 / 0.22. Observation O-1 |
| Remainder bracket `.mq-remeq` (divide regroup, div_remainders) | 2, 3 digits | 8 | 8 | 8 | **7** | `divide-31-R-card-390.png` "6 )‾580", `rem-drem-card-1280.png` "4 )‾18". **D-1** |

### Online worksheet (1280 / 390)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket | 1, 2, 3 digits | 9 | 8 | 9 | 9 | `critic-set-worksheet-1280`: 11)132, 7)28, 3)21, 10)110, 6)66, 2)8 all tight. R4 nit (c) is closed. 390 and 320: cell pads ≥ 82 px, no overflow. Nit N-1 |
| Worked bracket | 3, 4 digits | 8 | 8 | 8 | 8 | `long_div_2digit-worksheet-1280/390`: same em geometry as paper. At 390, "54)2646" fills the cell with about 13 px to spare, no clipping. O-1 |
| Remainder bracket | 3 digits | 8 | 8 | 8 | **7** | `divide-31-R-worksheet-1280.png`, all six cells: "9 )‾235", with the vinculum broken at the arc. **D-1** |

### Quiz (1280)

| Bracket drawing | Dividends | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| Fact bracket | 2 digits (1 and 3 digits were seen on the other hosts with the same CSS) | 9 | 8 | 9 | 9 | `div_facts-long-quiz-1280` "11)33" tight, box 67 px. N-1 |
| Worked bracket | 3 digits | 8 | 8 | 8 | 8 | `long_div_2digit-quiz-1280` "400": the gate measured paper parity |
| Remainder bracket | 3 digits | 8 | 8 | 8 | **7** | `divide-31-R-quiz-1280.png` "8 )‾110". **D-1** |

Every fact-bracket and worked-bracket score is ≥ 8. The remainder bracket scores C4 7 on every host.

Why the 8s and 9s:
- **Fact bracket C1 9:** one obvious box over the dividend, at least 48 × 48 px on every host, with the wrong-answer
  mark and the focus fill fully visible (`ws-1280-checked.png`, `card-390-wrong.png`).
- **C2 8:** the box is sized from the dividend, never the quotient (SL-2 holds), and it is the same production task as
  on paper.
- **C3 9:** the bracket is a compact unit, centred in the cell.
- **C4 9:** the bracket reads "7)28" as on paper.

## Is the worked bracket at parity with paper?

**Yes. INDEX.md's claim holds.**
- Measured on screen on all three hosts: gap 0.54 em, over 0.11 em, digit spacing 0.22 em.
- Measured on the kit's L Independent page: 0.53 / 0.11 / 0.22.
- The `before` and `after` images are identical, so the change did not touch it. There is no screen-only gap.

The large absolute gap you see at 57 px ("36)  2304", about 31 px) is the paper ratio scaled up. It is the same on
paper ("16) 880").

## Review of the CSS change

```css
.mq-scell .mq-ldiv > .mq-ldiv-q { contain: inline-size; justify-content: center; }
.mq-scell .mq-ldiv > .mq-ldiv-q .mq-slot { min-width: max(100%, 48px, var(--ws-hw, 48px)) !important; }
```

| Concern | Finding |
|---|---|
| Additive only | **Yes.** Two rules are appended and nothing is removed. Line 179's `min-width: max(100%, 64px)` is overridden by a more specific `!important` rule (child combinator plus one more class). |
| Saved quizzes (old HTML in IndexedDB) | **Safe.** `divisionHTML()` is unchanged, so stored markup has the same classes and simply gets the new geometry. No class was renamed. |
| `contain: inline-size` side effects | The rule gives size containment on the inline axis only. It is not layout or paint containment, so it does not clip, does not create a containing block for absolute children, and does not start a stacking context. The ✗ / ✓ mark (absolutely positioned on the slot) draws outside the box as before (`ws-1280-checked.png`). |
| Overlap with the divisor or arc | **None.** The box's left edge is 11 px right of the divisor glyph at 29 px (worksheet), 12.5 px at 40 px, and 15–24 px at 56 px. It is 6 px above the vinculum at every size. For a 1-digit dividend the box overhangs the arc column and the bar's end by 3.5–9 px. That is intended and reads as centred (N-1). |
| Overflow in a narrow cell | **None.** The overhang is not counted in the inline-grid's width, but it is ≤ 12.5 px each side. Measured cell pads were ≥ 64 px on the 320 card and ≥ 81 px on the 320 worksheet. |
| Focus ring / live-correct marks | Both were checked visually (`ws-1280-checked.png`, `card-390-wrong.png`). The yellow focus fill fills the whole square box, and the wrong-answer ✗ sits on the box's top-right corner without covering the dividend. |
| Quiz re-render | The quiz builds its HTML with the same `divisionHTML()` and the CSS applies on every render: `div_facts-long-quiz-1280` gives 67 px, centred. |
| Browser support | Chrome 105, Safari 15.4 and Firefox 101 support `contain: inline-size`. An older browser ignores it and falls back to a 48–67 px column floor: the old gap, slightly smaller, never broken. That is acceptable. |

## Review of the gate `ws-ldiv-hug.cjs`

**What is sound:**
- The arc's outer edge is computed correctly for both arcs: x 6/12 for `Q11` and x 5.25/10 for `Q9`, from the
  quadratic's maximum.
- Glyph boxes come from Range client rects, not from the span boxes.
- Every result is held to the paper drawing of the same skill.
- It fails on the old CSS with 39 failures (`before/ws-ldiv-hug.log`), so it does catch this regression.

**What is not sound:** see D-2, G-1 and G-2 below.

## Defects

### D-1 · The remainder bracket does not hug and its vinculum is broken (C4 −1 → 7 on all three hosts) · major

**Where:**
- `after/divide-31-R-{card-390,card-1280,worksheet-1280,worksheet-390,quiz-1280}.png`;
- `div_remainders` with bracket notation (`rem-drem-card-1280.png` in my scratch);
- `js/modules/screen-cell.js:2620-2633` (`ringCellHTML`, the `p.notation === 'bracket'` branch).

**Observed** at 56 px, measured by `probe4`:
- The arc's top stub (`H10` inside the 0.55 em arc column) ends **8.4 px before** the dividend's `border-top` starts.
  That is the grid's `column-gap: 0.15em`.
- The bar sits **3.2 px lower** than the stub, so the vinculum reads as two pieces ("4 )‾ ‾18").
- Arc to first digit: 0.56 em ("580") and **0.76 em** ("18").
- Last digit to bar end: 0.15 and **0.34 em**.
- The fact bracket on the same hosts is now 0.33 / 0.12. Paper draws this skill with the worked bracket at 0.53 / 0.11.

**Expected:** one unbroken vinculum from the arc's top to the end of the dividend, with the gap and overhang no more
than paper's (0.53 + 0.1, 0.11 + 0.1). That is the same contract as the other two drawings. Paper draws these items with
the kit's worked bracket, so the screen drawing is also a different picture from paper.

**Fix,** in `screen-cell.js` `ringCellHTML`. Either:
- **(a)** Draw the bracket with `divisionHTML()`'s markup (`.mq-ldiv`), put "R [ ]" in a following grid column, and so
  inherit this lane's hug rules; or
- **(b)** In the existing branch:
  - set `column-gap: 0` and give the R label and the remainder slot their own `margin-left: 0.15em`;
  - draw the vinculum as one `height:0; border-top:2px solid #000; align-self:start` element spanning columns 2–3, as
  the kit's worked bracket does, instead of the stub plus the dividend's `border-top`;
  - set the dividend's horizontal padding to 0.12 em, as `.mq-ldiv-dvd`.

**Check:** extend `ws-ldiv-hug` to measure `.mq-remeq` (D-2). It must report gap ≤ 0.63 and over ≤ 0.21, plus a new
"stub-to-bar join ≤ 1 px, same y ± 1 px" assertion, on all five host runs of `divide-31-R` and of
`div_remainders {notation:['bracket']}`.

**To 10:** the same drawing as the fact bracket, joined, at 0.33 / 0.12.

### D-2 · The gate passes a skill whose brackets it never measured (gate soundness) · major

**Where:** `tests/scripts/ws-ldiv-hug.cjs`, `judge()` and `MEASURE()`. In both logs the `divide-31-R` section prints
the paper line and then **no screen line at all**: 0 of 5 host runs measured.

**Cause:**
- `MEASURE` looks only for `.mq-ldiv` and `.ws-ops-division [role="group"]`.
- `judge` loops over `res.brackets` and never fails an empty list.
- So any drawing it does not recognise, and any regression that hides or renames a bracket (`vis()` false, a class
  renamed), passes silently.
- INDEX.md's "checks every bracket … 112 brackets measured" over-claims: `divide-31-R` contributed 0.

**Fix:**
- In `judge`, fail when `res.brackets.length === 0` for any (skill, host): `FAIL <host> <tag>: no bracket measured`.
- Add a third `MEASURE` branch for `.mq-remeq[data-mq-join]` that contains an `svg`, with the arc edge at x 5.25/10 for
  its `Q9` path.
- Add `div_remainders {notation:['bracket']}` to `SKILLS`.

**Check:** on the current tree the gate must then FAIL on `divide-31-R`, from the empty list or from D-1's
measurements. After D-1 is fixed it must be OK, with every (skill, host) line showing at least 1 bracket.

### G-1 · The fact-bracket ceiling is far looser than the fix achieves · minor (gate)

**Where:** `TOL` and `ref` in `ws-ldiv-hug.cjs`. The fact bracket is held to the kit's *tracked* bracket: gap ≤ 0.63,
over ≤ 0.21. The fix achieves 0.33 / 0.12.

**Effect:** a partial regression would pass, for example a 58 px floor coming back as gap 0.55 on a 1-digit dividend
("2)  8").

**Fix:** hold `kind: 'fact'` to its own screen ceiling: gap ≤ 0.43 and over ≤ 0.22 (0.33 / 0.12 + 0.1).

**Check:** temporarily set `.mq-ldiv-q .mq-slot { min-width: max(100%, 58px) }` without `contain`. The gate must
FAIL.

### G-2 · No assertion on box position · minor (gate)

**Where:** `ws-ldiv-hug.cjs`. It checks the box's size (≥ 40 px), not its place.

**Effect:** a future change could put the box over the divisor, onto the vinculum, or outside the cell, and the gate
would stay OK. Also, the rubric asks for touch targets ≥ 44 px on tablet and phone.

**Fix:**
- assert `box.bottom ≤ bar.top`;
- assert `box.left ≥ divisor glyph right`;
- assert that the box and bar are inside `.mq-scell`'s rect;
- set `BOX_MIN = 44`.

`probe2` shows the current values that would pass: −6 px, 11–24 px, pads ≥ 64 px, and 48 px.

### N-1 · The screen fact bracket is tighter than paper's (nit, C4 9)

**Where:**
- screen: 0.33 em gap at every size;
- paper `div_facts` Long L: 0.53 em, with digits tracked "1 2 1";
- the screen worked bracket: 0.54 em.

So the screen shows two bracket spacings, one for facts and one for worked division. No pupil is slowed by this, and it
is the direction the owner asked for (hug).

**To 10:** give `.mq-ldiv-dvd` `padding-left: 0.32em` so the arc-to-digit gap matches paper's 0.53. Keep over at 0.12.

**Check:** `ws-ldiv-hug` reports fact gap 0.50–0.56.

### O-1 · Observation outside this lane: rounded input corners inside the cell

The work-row inputs and the quotient strip of the worked bracket (`long_div_2digit-card-390.png`) and the remainder
slots are drawn with `border-radius` 8.4 px (probe4). The cell contract asks for square corners
(`screen-cell.css`, `.mq-scell input { border-radius: 0 !important }`); some host style wins over it here.

This predates the lane and the R4 critic did not score it, so I have not scored it here. File it for the screen-parity
lane.

## What must change for PASS

1. **D-1:** the remainder bracket is one joined vinculum and hugs its dividend on the card, the worksheet and the quiz.
2. **D-2:** the gate fails on an empty measurement and measures `.mq-remeq`, with `div_remainders` added. It is OK only
   after D-1 is fixed.
3. **Optional:** G-1, G-2 and N-1.
