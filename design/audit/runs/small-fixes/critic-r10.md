# Small fixes lane: independent critic, round 10

Branch `claude/sleepy-pasteur-psyvgl` at `40209b63`. That commit is the round-3 fix for critic r9 defects E1–E3: on-screen
`multiplication:count_by_tables` rows. Where I compare against a parent, it is `810c0894`, the tree before the screen-wrap
work, served through `MQ_ROOT`.

The diff touches 4 product files:
- **`screen-cell.js`, `balanceWrap`:**
  - it caps a line at half the row (`12 → 6 + 6`, `15 → 5 + 5 + 5`);
  - it measures the room from the count row's own block (`.k2-countrow` clientWidth), not from the window;
  - the wrapped frame is `fit-content` with auto margins, so it is centred on every host.
- **`count-row.js`:** the wrap gap is 4.2 mm (was 4.6). A number of 2.5 em or more gets a 1.6 mm box margin; shorter numbers
  keep 2.4 mm.
- **`worksheet.js`:** a count-row card also gets the class `mq-countrow-card`.
- **`css/screen-cell.css`:** one rule appended at the end of the file:
  `.online-edition .problems-grid.mq-wsgrid.mq-wsfit > .problem-card.mq-wscard.mq-span-row.mq-countrow-card { width:100%;
  max-width:760px; justify-self:center; box-sizing:border-box }`.
  **The change is additive.** It is a new rule at the end of the file, it changes no existing rule, and its selector needs a
  class that only this commit adds and only on worksheet cards. Old question HTML stored in IndexedDB never carries
  `mq-countrow-card`, so nothing already stored changes.

`node --input-type=module --check` passes on all 3 JS files.

I ran one browser at a time, with `ws-screen-slots` in the background. My scripts are in the critic scratchpad (`critic-r9/r10-*.cjs`):
- `measure`: for each host, size and row, it records:
  - digit px, box width and whether the widest answer fits;
  - how far each given number's text box sits inside its box;
  - numbers per line, the left and right empty bands, and the card size;
  - arrow length and the lead-in arrows on wrapped lines;
  - the swipe cue and swipe overflow.
- `typecheck`: right and wrong answers, typed and checked.
- `mixed`: the mixed-row sheet, a mixed-skill sheet (count rows plus `addition:add_100_regroup`, in both orders), and resizing.
- `zoom`: 3x crops, and the clearance between each arrow and the glyph ink of the neighbouring number (canvas `measureText`).
- `printeq`: print hashes.

The evidence PNGs are in `r10/critic-*.png`. I looked at every one.

## Gates and probes

| Gate | Result |
|---|---|
| `small-fixes-countrow-wide` | **OK**, 871 PASS, 0 FAIL |
| `small-fixes-countrow-caret` | **OK**, 304 PASS, 0 FAIL |
| `wave1-c2-phone` | **OK**, 469 PASS |
| `wave1-c2-sizes` | **OK** |
| `ws-boot-smoke` | **OK** |
| `ws-screen-slots` | **OK** (609 skills, 2436 host renders, 0 doubled answer areas, 0 paper verbs on screen) |
| `ws-code-snapshot` | **OK** (608 codes, 35 categories, +36 appended, nothing moved or deleted, 1870 option round trips) |

- **Print is byte-identical to `810c0894`.** I compared 180 `buildSheet` outputs (pupil page plus key). There were 90
  distinct outputs, so the options did take effect.
  - Rows: default; 100,000 from 1,000,000; 25,000; by 5; by 2; by 250; by 1,000 from 14,000; 100,000 + Lines; by 5 + Lines;
    mixed rows.
  - Roles: Independent, Opener, More practice. Sizes S, M and L; looks A and B; A4; seed 4242.
- **Typing and checking work (caveat c).** I did not rely on the caret gate; I ran my own.
  - Sizes: 1366x650, 1280x600, 820x1180, 768x1024 and 390x844 (touch), on all 3 hosts.
  - Rows: 100,000; 25,000; by 5; by 2; by 250; by 1,000 from 14,000; 25,000 + Lines; 100,000 + Lines.
  - Each case once with every answer right and once with the last answer off by 1.
  - Result: **240 cases, 912 checks, 0 FAIL.** Every number landed in its own box. On desktop and tablet, the last box was in
    view and not covered.
  - Right answers: the card scored 1, the worksheet showed "Score: 1/2" (card 2 was left blank), the quiz showed 100 %.
  - Wrong answers: the card scored 0, with the box red and the wrong digit underlined. The worksheet showed "0/2" and "try
    again.", with the right boxes ticked. The quiz showed 0 %.
  - No page errors.
  - Screenshots: `r10/critic-820-card-by250-wrong-checked.png`, `r10/critic-1280-worksheet-25000-lines-wrong-checked.png`,
    `r10/critic-768-quiz-100000-right-checked.png`, `r10/critic-1366-worksheet-by1000-wrong-checked.png`.
- **Resizing works, and E3 is fixed.** I took a 100,000 row through 1366 → 768 → 1100 → 900 → 1366 → 600 → 1366, at 800 px
  tall.
  - Worksheet: 4+4+4 at every width down to 768, and 3+3+3+3 at 600.
  - Card and quiz: 3+3+3+3 at every width from 768 up, and 2 × 6 only at 600.
  - At 768 the fresh-load measures (at 1024 tall) give the same lines as the resize, which was E3. Throughout: no swipe cue,
    no overflow, page scroll 0, no errors.

## What the fix delivers (measured, seed 11)

Every desktop and tablet case has the widest answer fitting every box, no swipe cue and page scroll 0. No line holds more
than half the row.

| Host | Row | 1366 / 1280 | 820 | 768 |
|---|---|---|---|---|
| Worksheet (card 760 px, centred) | by 5, by 2 | 29 px, **6+6**, bands 20.7 / 18.2 % | 6+6 (756 px card) | 6+6 (704 px card) |
| Worksheet | by 250 | 29 px, 6+6, 9.6 / 7.0 % | 6+6 | 6+6 |
| Worksheet | by 1,000 from 14,000; 25,000; 100,000; + Lines | 29 px, **4+4+4**, bands ≤ 19 % | 4+4+4 | 4+4+4 |
| Card | by 5, by 2 | 40 px, 6+6 | 6+6 | 6+6 |
| Card | by 250, by 1,000 | 40 px, 4+4+4 | 4+4+4 | 4+4+4 |
| Card | 25,000, 100,000, + Lines | 40 px, 3+3+3+3 | 3+3+3+3 | **3+3+3+3**, 100,000: bands 5.7 / 2.0 % |
| Quiz | as the card | 40 px, same lines | same | **3+3+3+3**, 100,000: 4.6 / 0.8 % |

- **E1 is fixed.** The by-5 row on the desktop worksheet is 6+6, as on paper and on the card (`r10/critic-1366-worksheet-by5.png`).
- **E2 is fixed.** At 768 the 100,000 row is 3+3+3+3 at 40 px on both the card and the quiz, with no band over 6 %
  (`r10/critic-768-card-100000.png`, `r10/critic-768-quiz-100000-lines.png`).
- **E3 is fixed.** A fresh load and a resize give the same lines.
- **The phone (390) is unchanged.** It swipes with the cue:
  - fitting rows (by 2, by 5, by 250) and the Lines rows: 29 px;
  - 25,000 / 100,000 Boxes: 16.1 / 18.8 px on the worksheet, 14.6 / 17.0 px on the card and the quiz;
  - by 1,000: 23.0 px on the worksheet, 20.7 px on the card and the quiz.

  This follows TY-10b (`r10/critic-390-card-100000.png`).
- **The 1.6 mm box margin is tight but fits every number tested.** For inputs I typed the row's widest digit count as "8"s:
  `scrollWidth ≤ clientWidth` on every box of every row and host. For givens, the text's advance box (side-bearings included)
  overhangs its box by at most 2.3 px (card, 1,000,000) and 1.7 px (worksheet). Measured on the glyph ink itself, every number
  stays inside its box and clear of the arrows (see caveat b). The 4-digit rows look right at 3x: "14,000", "2,250"
  (`r10/critic-1366-worksheet-by1000.png`, `r10/critic-820-card-by250.png`).

## The builder's caveats

**(a) A worksheet of count rows is a centred 760 px column, narrower than other skills' sheets.**
**Acceptable.** Within the sheet every card has the same width, and every row is at 29 px. Cards are 365 px (6+6) or 436 px
(4+4+4) tall. No card is stretched, and no band inside a card reaches 30 %: the largest is 20.7 % on a by-5 row
(`r10/critic-1366-worksheet-mixed-rows.png`). The RUBRIC asks for even cells and one layout per skill. It does not ask the
sheet to match another skill's sheet width. A 760 px column of rows reads as a column of workbook strips, which is the paper
grammar.

On a mixed-skill sheet, the add cards keep their own 3-column grid (372 px at 1366) or 2-column grid (344 px at 768). The
count cards sit as a centred column below or above them (`r10/critic-1366-worksheet-mixed-skills-add-first.png`,
`r10/critic-768-worksheet-mixed-skills-add-first.png`). At 1366 the count column's edges (x = 303 to 1063) do not line up with
the grid's edges (x = 109 to 1257). That is a nit: each block is regular in itself, and nothing overlaps or is stretched. At
768 the two line up.

A side effect: on the desktop worksheet the wide rows (25,000, 100,000, 1,000) are now 4+4+4. In round 9 they were 6+6 in the
1,148 px card. That is a different line break from paper, which shrinks the digits to keep 6+6. I rule it acceptable:
- the screen keeps the host digit size (C3) and one card width for the skill;
- the lines are balanced;
- the card and the quiz already wrap these rows 3+3+3+3.

It is not the 12-on-a-line case that SL-3a forbids.

**(b) The arrows are a little shorter again.**
- **Length.** Path plus head now measure 10.1 px on the worksheet (29 px digits) and 13.9 px on the card and quiz (40 px), about
  0.35 em. In round 9 they were 11.9 / 16.5 px; on paper at M they are about 0.6 em. At 3x zoom each arrow still shows a
  visible shaft and head (`r10/critic-zoom-1366-worksheet-w100k.png`).
- **Clearance against SL-3a's narrow-gap floor (1.0 mm).** I measured to the glyph ink of the neighbouring number:
  - worksheet: 4.2 px beside a 1,000,000 given. At the row's own scale (1 mm = 4.59 px at 29 px digits) that is 0.92 mm.
  - card: 6.1 px, which is 0.96 mm.
  - boxes, and numbers that leave slack in their box: 4.6–27 px, which is 1.0 mm or more.

  So the tightest arrow, beside the longest given numbers, is **0.04–0.08 mm under the floor**: 0.4 px on the worksheet and
  0.2 px on the card. No pupil or teacher can see that. It is logged as Low F1, not as a cap.

**(c) Typing and checking rest on the caret gate only.**
Closed. I re-ran them myself: 240 cases on 5 sizes and 3 hosts, right and wrong, 0 failures (see above).

## Defects and nits

**F1 · Low (nit) · Arrow clearance beside the longest given numbers is just under SL-3a's 1.0 mm floor.**
Measured 0.92 mm (worksheet) and 0.96 mm (card) on the glyph ink of "1,000,000" and "1,100,000". It is invisible, so it
does not lower a score. A 1.7 mm margin for numbers of 7 digits or more, or a 4.4 mm gap, would restore it. The gate measures
box edges, not ink; it could measure ink with `measureText`.

**F2 · Low (nit) · The swipe wrapper of a 1,000,000 row is 1 px wider than its client box (`scrollWidth − clientWidth = 1`).**
It has `overflow-x: visible`, no cue shows and the page does not scroll, so nothing can be dragged. It is a rounding
leftover.

**F3 · Low (nit) · On a desktop mixed-skill worksheet, the centred 760 px count column does not line up with the 3-column
grid's edges.** See caveat (a).

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity), `count_by_tables` rows

| Host | Version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|
| Practice card 1366 / 1280 / 820 / 768 | Boxes, all rows | 8 | 8 | 8 | 8 | pass. 40 px; 6+6, 4+4+4 or 3+3+3+3; no band over 16 %; nits F1, F2. |
| Practice card 1366 / 1280 / 820 / 768 | Lines, 25,000 and 100,000 | 8 | 8 | 8 | 8 | pass |
| Quiz 1366 / 1280 / 820 / 768 | Boxes and Lines, all rows | 8 | 8 | 8 | 8 | pass |
| Online worksheet 1366 / 1280 / 820 / 768 | Boxes and Lines, all rows | 8 | 8 | 8 | 8 | pass. 29 px; fitting rows 6+6; one card width. |
| Online worksheet | mixed rows, 6 problems | 8 | 8 | 8 | 8 | pass. Even widths, one digit size, no stretched card. |
| Online worksheet | mixed skills (+ add_100_regroup), 1366 / 768 | 8 | 8 | 8 | 8 | pass. Add cards unaffected; nit F3. |
| Phone 390, all 3 hosts | Boxes and Lines | 8 | 8 | 8 | 8 | ok under the TY-10b exception (unchanged; the 14.6 px wide rows remain the owner's call) |
| Print | all roles, sizes, looks | n/a | n/a | n/a | n/a | byte-identical to `810c0894` |

Why each criterion is at 8:
- **C1:** every box is reachable, holds its widest answer and takes typing on every host and size, with no swipe at
  Chromebook or tablet width.
- **C2:** the items, the key and the feedback are unchanged. Wrong digits are underlined, and the "Here is how" panel shows
  the jump.
- **C3:** the digits are at the host size everywhere, no line holds more than half the row, no band reaches 30 %, and the
  worksheet cards are even.
- **C4:** fitting rows are 6+6 as on paper. Wide rows wrap evenly at the host size (caveat a). Black and white Andika inside
  the cell, and the lead-in arrow on every wrapped line.

## Verdict

**PASS.** E1, E2 and E3 are fixed:
- the desktop worksheet draws fitting rows 6+6;
- the 768 card and quiz draw the 1,000,000 row 3+3+3+3 at 40 px;
- a fresh load and a resize balance alike.

Every row I tested, including 3- and 4-digit steps (by 250; by 1,000 from 14,000), fits at the host digit size on every host
from 768 to 1366. Typing and checking work, the CSS change is additive, print is byte-identical, the phone is unchanged, and
all 7 gates pass. F1–F3 are nits that do not lower a score.
