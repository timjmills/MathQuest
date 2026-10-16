# Small fixes lane: independent critic, round 8

Branch `claude/sleepy-pasteur-psyvgl` at `84613f3e`. That commit is the fix for critic r7 observation O9: on screen hosts, wide
`multiplication:count_by_tables` rows shrank under TY-10a. I compared it with its parent `c8299e9d` (an archive of that tree,
served through `MQ_ROOT`).

The diff touches 3 files:
- `count-row.js` `arcsGeom`: a twin with `twinWrap` whose six boxes cannot hold the widest number returns `wrap: true`, one
  line of `n` numbers. Each box is `chars × 0.56 × pt + 3` mm wide. The line becomes `flex-wrap`, and the body gets
  `--mq-k2 = min(--mq-digit, 40px) / pt`.
- `screen-cell.js`: a new `countRowTwin()` (phone: `twinGapPx: 24`; above a phone: `twinWrap`), and `wireSwipeRows` never swipes
  a `data-mq-wrap` body.
- `question-render.js`: the practice card redraws its visual through `countRowTwin(q, {phoneGap:false})`.

I ran one browser at a time. My scripts are in the critic scratchpad:
- `measure.cjs`: per host, size and row it reads the digit px, box widths, whether the widest answer fits, the items per line,
  the empty band, the swipe cue and overflow, the page scroll and the card heights.
- `typecheck.cjs`: types right and wrong answers into the rows and checks them.
- `mixed.cjs`: a worksheet that mixes rows.
- `printeq.cjs`: print hashes.

The evidence PNGs are in `r8/critic-*.png`. I looked at every one.

## Gates and probes

| Gate | Result |
|---|---|
| `small-fixes-countrow-wide` | **OK** |
| `small-fixes-countrow-caret` | **OK**, 304 PASS, 0 FAIL |
| `wave1-c2-phone` | **OK** |
| `wave1-c2-sizes` | **OK** |
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK** (608 codes, 35 categories, +36 appended, nothing moved or deleted, 1870 option round trips) |
| `ws-screen-slots` | see the end of this report |
| `node --input-type=module --check` on the 3 changed files | OK |

- **Print is byte-identical.** I compared 36 `buildSheet` outputs (pupil page and key), parent against HEAD. The rows were
  100,000 from 1,000,000; 25,000; by 5; 100,000 + Lines; by 5 + Lines; and the default. The roles were Independent and Opener,
  at S/M/L, A4, seed 4242. Every hash matched.
- **Typing and checking on the wrapped rows work.** I tested 1366x650, 1280x600 and 390 (touch), on all 3 hosts, with 100,000,
  25,000 and by 5. For each, I clicked or tapped the first box, typed every answer with Space between, then checked. I did it
  once with all answers right and once with the last one off by 1. That is 108 cases, and all were right:
  - Every number landed in its own box.
  - The focused last box scrolled into view, clear of the sticky Check bar and quiz footer (`elementFromPoint` hits the input).
  - Right answers scored: the card `hasAnswered` and score 1; the quiz 100 %; the worksheet card was not marked.
  - Wrong answers scored: the card score 0, with that box red and its wrong digit underlined; the quiz 0 %; the worksheet showed
    "try again." with its 4 right boxes ticked green.
  - No page errors.
  - Screenshots: `r8/critic-1366-card-w100k-checked-wrong.png`, `r8/critic-1366-worksheet-w100k-checked-wrong.png`,
    `r8/critic-1366-quiz-w25k-checked-right.png`.

## What the fix delivers (measured, seed 11)

In every case below, the widest answer fits every box (`scrollWidth ≤ clientWidth`), there is no swipe cue, and the page never
scrolls sideways.

| Host | Row | Parent `c8299e9d` (1366) | HEAD 1366x650 | HEAD 1280x600 |
|---|---|---|---|---|
| Worksheet | 100,000 | 11.2 px, 52 px boxes, swipe 236 px | **29 px**, 156 px boxes; **1 per line, 12 lines** | same |
| Worksheet | 25,000 | 13.0 px, 54 px boxes, swipe 243 px | **29 px**, 123 px boxes; **1 per line, 12 lines** | same |
| Card | 100,000 | 16.4 px, 78 px boxes | **40 px**, 217 px boxes, 2+2+2+2+2+2 | same |
| Card | 25,000 | 18.5 px, 79 px boxes | **40 px**, 172 px boxes, 3+3+3+3 | same |
| Quiz | 100,000 | 16.3 px, 77 px boxes | **40 px**, 217 px boxes, 2+2+2+2+2+2 | same |
| Quiz | 25,000 | 14.1 px, 59 px boxes | **40 px**, 172 px boxes, 3+3+3+3 | same |

The phone (390) is unchanged from the parent, as TY-10b says it should be:
- The worksheet shows 16.1 px (100,000) and 18.8 px (25,000) and swipes.
- The card and quiz show 14.6 px and 17.0 px and swipe.
- A by-5 row shows 29.0 px on every host.

On the card and the quiz, the fix does what O9 asked: the digits are at the host size, the grid is regular, the step tab stands
above the row and no number is clipped (`r8/critic-1366-card-100000.png`, `r8/critic-1280-quiz-100000.png`,
`r8/critic-1366-quiz-25000.png`, `r8/critic-1280-card-25000.png`).

The online worksheet is a different matter. See D1 and D2.

## Defects

**D1 · High (cap H13) · Online worksheet: a wide row becomes a single column of 12 numbers in a 1,128 px card.**
Repro: 1366x650 or 1280x600, worksheet, `opts:{rows:[{step:100000, start:'custom', at:1000000}]}` or `{rows:[{step:25000}]}`.
The worksheet card keeps its narrow grid column (372 px card, 310 px cell). A 156 px (or 123 px) box, its arrow and the gap
leave room for only one number per line, so the row draws as 12 lines (`r8/critic-1366-worksheet-100000-full.png`).

Measured:
- The row is 840 px tall.
- Every card is **1,128 px tall** at a 650 px viewport: one item is 1.7 screens, and a 4-item worksheet is about 2,400 px.
- The numbers fill 160 px (127 px for 25,000) of the 310 px cell, which leaves an empty band of **39 % (100,000) and 49 %
  (25,000)** of the cell's width down its right side. That triggers H13 (≥ 30 %), so C3 ≤ 6.
- The count row is no longer a row: the screen shows a 1 × 12 list where the paper shows 2 × 6 (L5, paper ≠ screen).

The host already has a better layout. With Answer spaces: Lines, the same 100,000 row gets a full-width worksheet card (1,000 px
cell) and draws 6 + 6 in one view (`r8/critic-1366-worksheet-100000-lines-widecard.png`). At 29 px a 156 px box fits 6 to a
line in that cell: 6 × 156 + 5 gaps + arrows is about 1,000 px.

*What a fix must do:* give a wrapping row the worksheet's wide card (the one the Lines row gets), so it wraps 6 + 6 (or at least
3 to a line) at 29 px. The gate should then fail any screen count row with fewer than 3 numbers to a line, or with a right-hand
empty band of 30 % or more.

**D2 · High (cap H13, regression caused by this commit) · A worksheet that mixes rows stretches every fitting row's card to
1,128 px.**
Repro: 1366x650 worksheet, `opts:{rows:[{step:5},{step:100000, start:'custom', at:1000000},{step:25000}]}`, 6 problems (the
skill deals the rows in turn).

The worksheet grid gives a whole grid row the height of its tallest card. Before the fix every card was **379 px**. Now every
card is **1,128 px**, and the by-5 cards draw their 97 px row floating in the middle of a box about 1,010 px tall. That leaves an
empty band of about 40 % above the row and 40 % below it (`r8/critic-1366-worksheet-mixed-rows.png`; parent:
`r8/critic-1366-worksheet-mixed-rows-before.png`).

The same grid row also shows by-5 digits at **22.2 px** beside wide-row digits at **29 px** (this is the non-uniform size the
builder raised as issue 1). The C3 rule that the online worksheet has "even cells, a consistent layout for every item of one
skill" fails.

*What a fix must do:* D1's wide card takes the wide row out of the narrow grid, which removes most of the stretch. Also, every
count row on the worksheet should draw at the host's 29 px, wrapping when it must (see issue 1 below), so the cards of one skill
match.

**D3 · High · A wide row with Answer spaces: Lines still shrinks under TY-10a and swipes at Chromebook width on the card and the
quiz.**
Repro: 1366x650 or 1280x600, card or quiz,
`opts:{rows:[{step:100000, start:'custom', at:1000000}], spaces:'line'}`.

Measured on the card and the quiz:
- Givens and inputs are **25.3 px**, against the 40 px C3 asks for.
- Lines are 137 px, and the row is 922 px wide in a 696 px (card) or 612 px (quiz) cell.
- **The swipe cue shows, with 471 px of overflow**: half the second line is out of view
  (`r8/critic-1366-card-100000-lines-swipes.png`, `r8/critic-1366-quiz-100000-lines-swipes.png`).

On the worksheet, the same row is 26.5 px in the wide card, against the 29 px asked for.

This is identical in the parent, so it is pre-existing and is the builder's issue 4. But it is O9's own defect class (a wide
count row on a screen host drawn under the TY-10a shrink), on the same skill and hosts. It also breaks SL-3a outright: "On
SCREEN Lines wraps 6 + 6 like Boxes (no swipe at Chromebook width)".

The `twinWrap` path never applies to Lines rows. `count-row.js` lays out Lines slots on their own path, so the new guard is
never reached. The O9 repro listed only Boxes rows, but "a correct fix must wrap a wide row instead of shrinking its digits", and
this is a wide row. I count it against O9.

*What a fix must do:* apply the same wrap to the Lines slot, with each line as wide as the widest answer at the host's digit
size, and no swipe. Add `100000 + spaces:'line'` to `small-fixes-countrow-wide`'s `ROWS`.

**D4 · Low (nit) · `small-fixes-countrow-wide` misses D1 and D2.** It checks the digit px, the box fit, the cue and the page
scroll, but not the items per line, the empty band or the card heights, and it mounts only one row type per worksheet. It
passed with D1 and D2 present. Add a mixed-row worksheet case and a minimum of 3 numbers per line.

## The builder's four open issues

1. **The fitting rows (by 2, 5, 10, 25) are 22–24 px, and the desktop worksheet shows a swipe cue with 345 px of overflow.** I
   confirmed this is pre-existing: the parent measures the same 22.2 / 22.8 / 24.0 px and the same 345 px overflow
   (`r8/critic-1366-worksheet-by5-swipe.png`). On its own it is a **separate defect**, not part of O9:
   - O9 was about wide rows, and these rows do not shrink under TY-10a. They are drawn at the twin's own geometry.
   - The desktop swipe breaks SP-11a (count rows swipe only at 480 px and under) and SL-3a's "no swipe at Chromebook width", and
     the 22 px digits are below C3's 29 / 40 px.
   - It should be logged as its own item: draw every screen count row at the host's digit size, wrapping only when it must.

   **It does block O9 where the fix makes it worse.** The fix sets wide rows to 29 / 40 px and leaves fitting rows at 22–24 px,
   so on one worksheet the cards are uneven (D2), and on the card the digit size jumps from 23 to 40 px between items of a
   mixed-row session. The fix created that non-uniformity; it did not exist when every row shrank alike. So the uneven sizes and
   the stretched cells count against this commit, and the plain desktop swipe on a by-5 row does not.
2. **The phone gate checks "unchanged" rather than 29 px for wide rows.** This is correct by the letter of TY-10b: "A number too
   wide for six boxes still shrinks under TY-10a." It is not a defect of this fix. I do note that on the phone card a
   100,000 row is **14.6 px**, smaller than the instruction text above it, which breaks TY-10's size order. Now that a wrap
   exists, the owner may want to revisit that TY-10b sentence; the lane should not change it alone.
3. **The first number on a wrapped line is indented by one gap.** This is not a defect. The indent stands where the arrow
   stands on the following lines, so the numbers line up in columns: each line starts at x = 376 / 378 on the card and
   170 / 172 on the worksheet at 1366. It reads as a grid.
4. **The Lines answer space is unchanged.** This is a defect: D3.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity), wide rows of `count_by_tables`

| Host | Version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|
| Practice card 1366x650 / 1280x600 | Boxes, 100,000 and 25,000 | 8 | 8 | 8 | 8 | pass. The item needs one vertical scroll at 650 px (6 lines, 570 px row), and the caret brings each box into view: a nit. |
| Practice card 1366 / 1280 | Lines, 100,000 | 7 | 8 | **6** | 7 | **FAIL (D3)** |
| Quiz 1366 / 1280 | Boxes, 100,000 and 25,000 | 8 | 8 | 8 | 8 | pass (same nit as the card) |
| Quiz 1366 / 1280 | Lines, 100,000 | 7 | 8 | **6** | 7 | **FAIL (D3)** |
| Online worksheet 1366 / 1280 | Boxes, 100,000 and 25,000 | 8 | 8 | **5** | **7** | **FAIL (D1, D2; cap H13)** |
| Online worksheet 1366 / 1280 | Lines, 100,000 | 8 | 8 | 7 | 8 | fail (26.5 px against 29 px; pre-existing) |
| Phone 390, all 3 hosts | Boxes and Lines | 8 | 8 | 8 | 8 | ok under the TY-10b exception (unchanged; see issue 2) |
| Print | all roles | n/a | n/a | n/a | n/a | byte-identical to the parent |

Reasons for the worksheet scores:
- C3 is 5 because H13 caps it at 6 (39–49 % empty band), and on top of that the cards in a mixed sheet are uneven (D2).
- C4 is 7 because the screen draws a 1 × 12 column where the paper draws 2 × 6 (L5).

Reasons for the card and quiz Lines scores:
- C3 is 6: 25 px against 40 px, and a swipe at Chromebook width.
- C1 is 7: half the row sits behind a swipe.
- C4 is 7: SL-3a is broken.

## Verdict

**FAIL.**

**What passes:**
- The practice card and the quiz now draw wide Boxes rows at 40 px, with boxes that hold the widest answer, in a regular grid
  with no swipe.
- Typing and checking work on every host, with right and wrong answers.
- The phone is unchanged, as TY-10b says, and print is byte-identical.
- Every gate I ran passed.

**What fails:**
- **D1:** the online worksheet turns the wide row into a 12-line column in a 1,128 px card with a 39–49 % empty band.
- **D2:** in a mixed worksheet, that card stretches every fitting row's card from 379 px to 1,128 px. This is a regression
  caused by this commit.
- **D3:** the wide Lines row still shrinks to 25 px and swipes at Chromebook width on the card and the quiz.

Issue 1's plain desktop swipe on fitting rows is a separate, pre-existing defect and should be logged as its own item. The
uneven sizes it now causes are part of D2.

## ws-screen-slots

The critic's rerun was lost to a container restart before it finished. The builder's run on `84613f3e` printed
`ws-screen-slots: OK` (609 skills, 2436 host renders, 0 doubled answer areas, 0 paper verbs on screen).
