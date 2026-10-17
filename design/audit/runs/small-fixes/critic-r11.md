# Small fixes lane: independent critic, round 11

Branch `claude/sleepy-pasteur-psyvgl` at `680d1bbc`. That commit puts the owner's ruling of 2026-10-17 into effect: on
`multiplication:count_by_tables`, count rows wrap on the phone at the host digit size, with no swipe and no shrink. Where I
compare against a parent, it is `7dc0742c` (critic r10's tree), extracted to the scratchpad and served through `MQ_ROOT`.

The product diff is 3 files:
- **`count-row.js`:**
  - the phone `twinGapPx` path (24 px gap cap) is removed;
  - the `twinWrap` geometry now also serves the phone;
  - a new `twinPhone` flag scales the row to `min(--mq-digit, 29px)`;
  - on the phone it also cuts the box margin of a long number from 1.6 mm to 1.0 mm and halves the lead-in pad.
- **`screen-cell.js`:**
  - `countRowTwin` always wraps, adding `twinPhone` at 480 px and under;
  - `balanceWrap` reads its pitch from the line's `column-gap`, not from item 2's offset;
  - `fitTwinRows` skips a wrapping row.
- **`question-render.js`:** the card calls `countRowTwin(q)` with no `phoneGap` option.

`node --input-type=module --check` passes on all 3 files. My scripts are in the critic scratchpad (`critic-r11/`):
- `measure`: digit px, lines, bands, box size, the room the row has and what 2 boxes need;
- `ink`: arrow clearance measured on rendered **pixels** at 3x;
- `typecheck`: right and wrong answers on touch, plus caret scroll-into-view;
- `resize` and `rotate`;
- `swipe`: the swipe's other users;
- `mixed`;
- `printeq`;
- `zoom`.

I ran one browser at a time, with `ws-screen-slots` in the background. I looked at every PNG I cite.

## Gates

| Gate | Result |
|---|---|
| `small-fixes-countrow-wide` | **OK**, 1651 PASS, 0 FAIL |
| `small-fixes-countrow-caret` | **OK**, 304 PASS, 0 FAIL |
| `wave1-c2-phone` | **OK**, 387 PASS (469 before: the retired swipe assertions) |
| `wave1-c2-sizes` | **OK** |
| `ws-boot-smoke` | **OK** |
| `ws-screen-slots` | **OK** (609 skills, 2436 host renders, 0 doubled answer areas, 0 paper verbs on screen) |
| `ws-code-snapshot` | **OK** (608 codes, 35 categories, +36 appended, nothing moved or deleted, 1870 option round trips) |

The gates rewrote the 24 `wave1-C2` phone PNGs. I restored them with `git checkout -- design/audit/runs/wave1-C2`.

## What I verified

- **Print is byte-identical to `7dc0742c`.** I compared 180 `buildSheet` outputs (pupil page plus key). There were 90
  distinct outputs, so the options did take effect.
  - Roles: Independent, Opener, More practice. Sizes S, M and L; looks A and B.
  - Rows: default; 100,000 from 1,000,000; 25,000; by 5; by 2; by 250; by 1,000 from 14,000; Lines rows; mixed rows.
- **Desktop is unchanged.** All 42 measure lines (card, worksheet and quiz × 7 rows at 1366×650 and 768×1024) are identical
  to the parent.
- **The swipe still works for its other users.** Results at 390, touch, are identical to the parent:

  | Skill | Host | Overflow | Cue at start | At the end |
  |---|---|---|---|---|
  | `composing:hundreds_chart_fill` (three rows of ten) | card | 252 px | "Swipe ➞ for more squares" | cue hidden, `data-mq-end` set |
  | `composing:hundreds_chart_fill` (three rows of ten) | worksheet | 174 px | same | same |
  | `placevalue:place_value_disks` (to 9,999, four-zone mat) | card | 135 px | "Swipe ➞ for more" | same |
  | `placevalue:place_value_disks` (to 9,999, four-zone mat) | worksheet | 153 px | same | same |

  Page scroll is 0 everywhere (`r11/critic-390-card-hundreds_chart_fill-swipe.png`,
  `r11/critic-390-worksheet-place_value_disks-swipe.png`).
- **The phone rows (seed 11).**
  - Every row I tested on every phone host:
    - digits and inputs are at 29.0 px;
    - every box holds its widest answer;
    - box height is 57 px (Boxes) or 50 px (Lines);
    - there is no cue, and page scroll is 0.
  - The 1,000,000 swipe wrapper is still 1 px wider than its client box (F2 from r10, unchanged).

  | Width | Host | by 2 / by 5 | by 250 | by 1,000 | 25,000 | 1,000,000 Boxes and Lines |
  |---|---|---|---|---|---|---|
  | 430 | card | 4+4+4 | 3+3+3+3 | 3+3+3+3 | 2 × 6 | 2 × 6, bands 13 / 11 % |
  | 430 | worksheet, quiz | 4+4+4 | 3+3+3+3 | 3+3+3+3 | 2 × 6 | 2 × 6, bands 9 / 7 % |
  | 390 | card | 4+4+4 | 3+3+3+3 | 2 × 6 | 2 × 6 | 2 × 6, bands 9 / 7 % |
  | 390 | worksheet, quiz | 4+4+4 | 3+3+3+3 | 2 × 6 | 2 × 6 | 2 × 6, bands 3.5 / 0.9 % |
  | 360 | card | 4+4+4 | 3+3+3+3 | 2 × 6 | 2 × 6 | **1 × 12**, bands **29.8 / 27.3 %**, row 840 px tall |
  | 360 | worksheet, quiz | 3+3+3+3 | 2 × 6 | 2 × 6 | 2 × 6 | **1 × 12**, bands 25–27 %, row 840 px (757 px Lines) |
  | 844 × 390 (desktop path) | card, quiz | 6+6 at 40 px | 4+4+4 | 4+4+4 | 3+3+3+3 | 3+3+3+3 at 40 px |
  | 844 × 390 (desktop path) | worksheet | 6+6 at 29 px | 6+6 | 4+4+4 | 4+4+4 | 4+4+4 |

  The regenerated phone PNGs do show the wrap. I checked:
  - `wave1-C2/phone-card-by-100-000-from-1-000-000-15-.png` (2 a line, 8 lines);
  - `phone-worksheet-by-1-000-from-14-000.png`;
  - `phone-quiz-missing-20-first-box-in-column-6-.png`;
  - the builder's `r11/screen-360-worksheet-100000.png`.

  My own shots: `r11/critic-390-card-100000.png`, `r11/critic-390-worksheet-by250.png`, `r11/critic-430-quiz-25000.png`,
  `r11/critic-360-card-100000.png`, `r11/critic-844-card-100000.png`.
- **Typing and checking on touch (caveat 3).** I ran my own probe:
  - sizes 430×932, 390×844, 360×780 and 844×390, all touch;
  - all 3 hosts;
  - rows 100,000, 25,000, by 5, by 2, by 250, by 1,000 and 100,000 + Lines;
  - each case right and wrong.

  The probe types the first box, then moves with Space as a pupil does. After each move it checks that the focused box lies
  fully inside the viewport and is not covered (`elementFromPoint` at three points).
  - **168 cases, 840 checks, 8 FAIL.**
  - All 168 verdicts are right:
    - the card scored 1 or 0;
    - the worksheet showed "Score: 1/2" or "0/2 … try again.";
    - the quiz showed 100 % or 0 %.
  - Every digit landed in its own box, and there were no page errors.
  - All 8 failures are about the caret's position on screen (G3).
- **Resize and rotation.**
  - The worksheet:
    - matches a fresh load at every width on the path 390 → 1366 → 430 → 360 → 768 → 480 → 481 → 390;
    - is 2 × 6 on the phone, 1 × 12 at 360 and 4+4+4 above;
    - shows no cue and no overflow.
  - The card and the quiz keep the drawing chosen at render time (G4).
- **The mixed-row worksheet (6 problems) on the phone.**
  - It is one column of cards, every card the same width (402 / 362 / 332 px), every row at 29 px, page scroll 0.
  - Card heights follow the rows: 461 / 697 px at 390; 555 / 1124 px at 360.
  - It is a single column with nothing stretched, so the heights do not make it uneven.
  - The gate does not run its mixed-sheet block at phone widths (`if (phone) continue`).

## The builder's caveats

**(1) At 360 a 1,000,000 row stands one a line (12 lines). Not acceptable as built.**
- **The 1.0 mm margin does not buy two a line at 360.** The builder cut the box margin to 1.0 mm on the phone "so two
  1,000,000 boxes stand on a 360 px line". They still do not:
  - two boxes plus the gap and lead-in pad need **300 px**;
  - the row's room is **292 px** on the card, and **274 px** on the worksheet and the quiz.
- **The tower is poor on screen:**
  - the row is 840 px tall, taller than the 780 px screen;
  - 53–57 % of the cell's width is empty;
  - the card's left band is 29.8 %, 0.2 % under H13's 30 % cap (the gate checks only the right band);
  - a 15-number row would be 15 lines;
  - the count reads down a list of numbers, each led by its own arrow, instead of along a row
    (`r11/critic-360-card-100000.png`, `r11/critic-360-worksheet-100000.png`).
- **The room exists.** At 360 the worksheet and quiz cells lose 86 px of the viewport to chrome (page gutters, card padding,
  cell padding). The card is 8 px short and the worksheet 26 px short.

  Let the row use that width at 480 px and under, for example by taking the count-row cell's padding and the card's side
  gutter down to the 16 px page gutter, and by dropping the lead-in pad on the first line, so that two stand.

  Only if two still cannot fit should one a line stand, and it should then go to the owner as a named exception. As it is,
  "one a line where two cannot stand" is the builder's wording inside the owner's ruling (TY-10b), not the owner's.
- Scored C3 7 at 360 for the 1,000,000 rows (G1).

**(2) Arrow clearance measured on the ink. F1 is not closed; on the phone it is worse.**

I hid the arrows, took one screenshot, then took a second with everything shown. Arrow ink is what is dark only in the
second; number and box ink is what is dark in the first. The mm are at the row's own scale (`--mq-k2`: 4.58 px/mm at 29 px
digits, 6.33 at 40 px).

| Where | Ink clearance, smallest |
|---|---|
| Phone 430 / 390, rows of 1,000,000 (Boxes and Lines), all 3 hosts | **2.67 px = 0.58 mm** |
| Phone, 25,000 row | 3.67 px = 0.80 mm |
| Phone 430, by 1,000 (card, worksheet) | 0.87 mm |
| Phone, rows of short numbers (by 5, by 250) and every arrow beside a box | 1.02 mm |
| Desktop card and quiz (unchanged from r10) | 0.90–0.95 mm |
| Desktop worksheet, 1,000,000 | 0.87 mm |

- **The cause.** The 1.0 mm phone margin makes a given "1,000,000" wider than its own box: its text overhangs the box by 3 px.
  That overhang eats the 4.2 mm gap. At 4x zoom the arrow's tail almost touches the trailing 0 of "1,000,000"
  (`r11/critic-zoom-390-card-100000.png`). At 1x the arrow reads as joined to the number in
  `wave1-C2/phone-card-by-100-000-from-1-000-000-15-.png`.
- **Why the gate passes.** Its `clearMm` takes a given's Range rect, which is the advance box with side-bearings, not the
  glyph ink. That is why it reads exactly 1.00 mm.
- One probe line, "390 worksheet by 5: 0.00 mm", is an artefact: the focus ring changed between the two shots. The 4x crop
  shows about 1.1 mm (`r11/critic-zoom-390-worksheet-by5.png`).
- Scored C4 7 on the phone 1,000,000 rows (G2). The desktop values are r10's F1, unchanged.

**(3) No separate right/wrong typing script was run. Closed by my probe**, which found G3.

## Changed gate assertions (read line by line)

**`wave1-c2-phone.cjs`**
- The seeded first box in column 6 now must **show and take the card's focus**. It used to be "lies past the window".
  Faithful.
- Digits: **every row** must be at 28–30 px, tighter than the old 28–31 px, and the old exemption for wide rows is gone.
  Stricter.
- The box:digit ratio check is dropped. Justified, because boxes now size to the widest answer.
- **The box floor is relaxed from 48 to 44 px.** SP-10 and the RUBRIC's screen checks say digit inputs are at least 48 px
  tall, and TY-10b says "above the 48 px touch target". Every box measures 53 px, so nothing needed the relaxation. This is
  a weakening (G5).
- Cue and window checks become "no forward cue" and "no swipe, all numbers in view". Faithful.
- The gap of 13.8–24.5 px is kept, with the pitch now read from `column-gap`. Faithful.
- "Shows 3 whole columns" becomes "at least 3 to a line" for 3-digit rows. Faithful.
- The forced-hidden check and its negative control are retired and replaced by "the first box shows at load". Acceptable:
  the condition can no longer occur.
- The scroll-snap and back-cue checks become "`scrollLeft` stays 0, neither cue shows". Faithful.
- The card's "first digit key with focus held back" branch can no longer run. It is dead, but harmless.

**`small-fixes-countrow-wide.cjs`**
- PHONE_PIN is replaced by the full wrap checks at 430, 390 and 360: host px, widest answer fits, balanced, at most half a
  row, band, no swipe. A 390 load-versus-resize check is added. This is **stronger** than the pin.
- Three gaps remain:
  - (a) `clearMm` measures advance boxes, not ink (G2);
  - (b) the one-a-line allowance comes from `twoFit`, computed from the build's own geometry, so the gate cannot catch G1;
  - (c) only the right-hand band is checked, and the mixed-sheet block skips the phone (G5).

## Doc amendments

- TY-10b, SL-3a and SP-11a each carry the ruling as one bold sentence: "Owner ruling 2026-10-17: count rows wrap on the phone
  at the host digit size; they no longer swipe or shrink." STATUS.md records it. Each says what it supersedes:
  - the TY-10b swipe;
  - the 24 px cap;
  - the TY-10a screen shrink;
  - the SP-11a count-row extension.

  Each also keeps the swipe for the charts and the disk mats. Nothing contradicts TY-10a, which stays a paper rule, or SL-3a.
- Two wording nits (G6):
  - TY-10b's old text ("The row keeps swiping inside its cell …") still stands before the amendment, so the rule now reads
    swipe-then-supersede. It would be clearer struck or marked "(superseded)" in place.
  - The one-a-line fallback is written inside the ruling sentence's paragraph as though it were the owner's (see caveat 1).

## Defects

**G1 · Medium (C3) · At 360 the 1,000,000 row (Boxes and Lines) stands one a line on every host.**
- Measured:
  - 12 lines, 840 px tall, on a 780 px screen;
  - bands of 25–30 % each side; the card's left band is 29.8 %.
- The room is short by 8 px (card) and 26 px (worksheet, quiz).
- The 1.0 mm margin, cut for this case, does not reach two a line.
- **To raise it:** at 480 px and under, let the count row use the cell's and the card's side padding down to the page's
  16 px gutter, and drop the first line's lead-in pad, so two stand at 360. Gate it with a fixed expectation (2 × 6 at 360),
  not with `twoFit`.

**G2 · Medium (C4) · Arrow ink clearance beside long given numbers is under the SL-3a 1.0 mm floor, and the builder reports
F1 as closed.**
- Measured on pixels:
  - 0.58 mm beside 1,000,000-row givens at 430 and 390, on all 3 hosts, Boxes and Lines;
  - 0.80 mm beside 25,000-row givens;
  - desktop 0.87–0.95 mm (F1, unchanged).
- The phone's 1.0 mm margin lets the given number overhang its box by 3 px.
- **To raise it:**
  - keep the given inside its box: a margin of at least 1.6 mm, or a given box sized from the ink width plus 1 mm;
  - widen the phone gap so the arrow keeps 1.0 mm;
  - make the gate measure ink, either from a pixel diff as in `critic-r11/ink.cjs` or from `measureText`'s
    `actualBoundingBox`.

  This must be solved together with G1, since both draw on the same width.

**G3 · Medium (C1) · On a 360 phone, the next box can stop partly below the bottom of the screen.**
- After Space on the 1,000,000 + Lines row, the focused box sits at 752–798 px in a 780 px viewport, so 18 of its 46 px are
  hidden. This happens on the card and the worksheet.
- On the 360 quiz, the last box of the 1,000,000 row ends partly outside the viewport.
- Screenshot: `r11/critic-360-card-100000-lines-caret-below.png`.
- This is new exposure: the tall wrapped rows replace one-line swiping rows.
- The same 3 px miss at 844×390 on the worksheet's wide rows is pre-existing; the parent fails identically. That part is Low.
- The caret gate does not test 360 or landscape.
- **To raise it:** when a box takes focus, scroll it fully into view, clear of the sticky Check bar and the quiz footer
  (`block: 'nearest'` on the box plus the bar's height). Add 360×780 and 844×390 to `small-fixes-countrow-caret`.

**G4 · Low · The card and quiz drawing is chosen once, at render, from `innerWidth`.**
- Loaded at 390 and turned to 844 × 390, the row stays at the phone's 29 px (4+4+4); a fresh load is 40 px, 3+3+3+3.
- Loaded at 844 × 390 and turned to portrait 390, the row stays at 40 px **one a line, 12 lines**; a fresh load is 29 px,
  2 × 6.
- The parent behaves the same, so the mechanism is not new, but the phone rule now depends on it.
- **To raise it:** redraw the count-row twin when the viewport crosses 480 px.
- Separately, the desktop path draws the card's 1,000,000 row at 40 px one a line at 481–~540 px. This is pre-existing and
  outside this lane's widths.

**G5 · Low (gates):**
- `wave1-c2-phone` relaxes the box floor to 44 px against SP-10's 48 px for digit inputs (measured 53 px, so restore 48);
- the `clearMm` advance-box measure (see G2);
- left bands are not checked;
- the phone mixed sheet is not gated.

**G6 · Low (docs):** see Doc amendments.

r10's F2 (1 px wrapper overflow) and F3 (desktop mixed-skill column alignment) stand unchanged.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity), `count_by_tables` rows

| Host | Width | Answer space / rows | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| Practice card | 430, 390 | Boxes: by 2, by 5, by 250, by 1,000 | 8 | 8 | 8 | 8 | pass |
| Practice card | 430, 390 | Boxes: 25,000 | 8 | 8 | 8 | 8 | pass (0.80 mm clearance, Low) |
| Practice card | 430, 390 | Boxes and Lines: 1,000,000 | 8 | 8 | 8 | **7** | fail: G2 |
| Online worksheet, quiz | 430, 390 | Boxes: fitting rows, by 1,000, 25,000 | 8 | 8 | 8 | 8 | pass |
| Online worksheet, quiz | 430, 390 | Boxes and Lines: 1,000,000 | 8 | 8 | 8 | **7** | fail: G2 |
| All 3 hosts | 360 | Boxes: by 2, by 5, by 250, by 1,000, 25,000 | 8 | 8 | 8 | 8 | pass |
| All 3 hosts | 360 | Boxes and Lines: 1,000,000 | **7** | 8 | **7** | 8 | fail: G1, G3 |
| Online worksheet | 430, 390, 360 | mixed rows, 6 problems | 8 | 8 | 8 | 7 | pass for layout; inherits G2 on its 1,000,000 cards |
| All 3 hosts | 844 × 390 landscape | Boxes and Lines, all rows | 8 | 8 | 8 | 8 | pass (desktop path; 3 px caret miss pre-existing, Low) |
| All 3 hosts | 1366, 768 | all rows | 8 | 8 | 8 | 8 | pass: identical to `7dc0742c` |
| Print | all roles, sizes, looks | — | n/a | n/a | n/a | n/a | byte-identical to `7dc0742c` |

Why the 8s hold:
- **C1:** every box is a 57 × 55+ px target, holds the widest answer, takes typing and checks right and wrong, with no swipe
  and no page scroll.
- **C2:** the items, key and feedback are unchanged.
- **C3:** 29 px digits, balanced lines of at most half the row, bands under 20 % except at 360.
- **C4:** black and white Andika in the cell, a lead-in arrow on every wrapped line, and fitting rows wrapping as on desktop.

## Verdict

**FAIL.** The ruling is built: on the phone every row wraps at 29 px with no swipe, cue or shrink, on all 3 hosts. Desktop
and print are untouched, the chart and disk swipes still work, and all 7 gates pass. Two of the builder's claims do not hold
when measured independently:
- **(G1)** At 360 the 1,000,000 row is a 12-line tower taller than the screen. The 1.0 mm margin cut meant to give two a line
  does not, and the width to fit two is there in the chrome.
- **(G2)** That same margin cut lets long given numbers overhang their boxes, so the arrow's ink stands 0.58 mm from the
  number on 430 and 390 phones. The gate reads 1.00 mm only because it measures advance boxes.
- **(G3)** The 360 caret can stop with the focused box partly under the screen's bottom edge.

Fix G1–G3 together, since they draw on the same width, and gate them on ink and on a fixed 2 × 6 at 360.
