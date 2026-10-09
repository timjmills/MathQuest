# Lane C2 follow-up: phone count rows at ~29 px (TY-10b). Critic (Opus, medium)

Graded at **4eb7dbd** (cb2eaba + 4eb7dbd on d22393a). I reviewed the diff d22393a..4eb7dbd in full: `screen-cell.js` (`fitTwinRows` TY-10b branch, `wireSwipeRows` `mode()` from the cell's inner box, `fitCue`, `digitKey`), the `wave1-c2-phone` and `wave1-a2-perbox` gates, and the WDS TY-10b / SP-11a text. The gates re-shoot evidence into the tree, so I restored it with `git checkout`; my probes (`p29.cjs`, `p29w.cjs`) ran from the scratchpad. For a baseline I exported d22393a with `git archive` and served it with `MQ_ROOT`.

## Verdict: FAIL

The first fail is avoidable: at 390, the worksheet and quiz show only 2 columns. They show 2 because the gap between columns was scaled up with the digits (7 mm at 4.59 px/mm, 32.1 px), not because of the owner's 29 px digits. The second is a deploy blocker: `ws-stamp-assets --check` fails.

| Criterion | Card 390 | Worksheet 390 | Quiz 390 | Card/WS/Quiz 820 | 1280 + print | One line |
|---|---|---|---|---|---|---|
| C1 Ease of use | 8 | **7** | **7** | 9 | 9 | Card: the digits are bigger and the boxes are 76 × 53. The default ×6 row now opens with focus held back (its first box is in column 4 of 3 shown); typing a digit or tapping reaches the box. Worksheet and quiz: a 196 px window shows 4 of 12 numbers, so the pupil swipes 5 times per row where 3 columns would need 3. |
| C2 Educational value | 8 | 8 | 8 | 9 | 9 | The start shows first everywhere. Default card: the first box (24) is hidden while two line-2 boxes are visible, which invites filling them out of order. Holding focus back cannot remove that. |
| C3 Spacing and layout | 8 | **7** | **7** | 9 | 9 | Worksheet and quiz: a 196 px window in a 304 px inner box leaves 108 px blank (screenshot `p29-390-worksheet-default.png`: about 65 px left and 45 px right of 2 columns). The card's 308 px window in 346 px is fine, and the cue is on one line (179–200 px, 15–17 px type). |
| C4 Standard fidelity | 8 | 8 | 8 | 9 | 9 | TY-10b is met: 29.0 px digits, boxes 76 × 53 (box:digit 2.63, unchanged), the page never scrolls sideways (page scroll width 0). The text says the box is "about 58 px" tall; it measures 53 (see defect 3). 820 and 1280 are identical to d22393a. Print is byte-identical to 4911898. |

## Gates run (one at a time, through `/tmp/mq-browser-run.sh`)
- `wave1-c2-phone`: **OK** (282 PASS).
- `wave1-c2-onepage` (MQ_BASE_ROOT = 4911898): **OK**.
- `wave1-c2-sizes`: **OK**.
- `wave1-a2-perbox`: **OK**.
- `ws-screen-answer --skills multiplication:count_by_tables`: **OK**.
- `node --input-type=module --check js/modules/screen-cell.js`: OK.
- `ws-stamp-assets --check`: **FAIL** ("index.html is stale"). d22393a passes it.

## Measured (probe `p29.cjs`, default tables unless named)

| Host @ width | Inner box | Item / gap / pitch | Window | Columns shown | Digits |
|---|---|---|---|---|---|
| card 390 | 346 | 80 / 32.1 / 112.4 | 308 | 3 | 29.0 |
| worksheet 390 | 304 | 80 / 32.1 / 112.4 | 196 | **2** | 29.0 |
| quiz 390 | 304 | 80 / 32.1 / 112.4 | 196 | **2** | 29.0 |
| card / quiz 390, 14,000 | 346 / 304 | 108 / 16.1 | 235 | 2 | 29.0 |
| worksheet 820 | 308 | 62 / 24.6 | 237 | 3 | 22.2 (unchanged) |
| card / quiz 820 | 720 / 694 | 81 / 32.2 | whole row, no scroll | 6 | 29.1, same as d22393a |
| card / quiz 1280 | | 59–60 × 44 | whole row | 6 | 22.8 / 22.9, same as d22393a |

`--mq-k2` is 4.59 px/mm at 390. That makes the kit's MIN_GAP of 3 mm equal to 13.8 px, and TWIN_GAP_MM of 7 mm equal to 32.1 px.

## Question 1: 2 columns on the worksheet and quiz, or narrow the gap to get 3 back?

Narrow the gap. Two columns are not forced by the 29 px digits. The window holds n columns when `n·item + (n−1)·gap + 3 ≤ inner box`.
- **Worksheet and quiz (304 px):** 3 columns fit whenever the gap is ≤ (304 − 3 − 240) / 2 = **30.5 px**. Today's 32.1 px misses by 3 px.
- **What the code allows:** the gap may lie between the kit's MIN_GAP of 3 mm (13.8 px at this scale) and its 7 mm twin cap. The round-6 rule capped the phone gap at **24 px**, and that rule was written in px. TY-10b scaled it in mm, which is the regression. WDS has no numeric count-row gap; TY-10a gives the gap only as "the remaining width".
- **Recommendation:** an absolute phone cap of 24 px (5.2 mm at 4.59 px/mm). The window becomes 3·80 + 2·24 + 3 = **291 px, 3 columns**, in both the worksheet and the quiz.
- **Card:** keep 3 columns. A 4th needs a gap ≤ (346 − 3 − 320) / 3 = 7.7 px, under the 13.8 px minimum, so the card cannot reach 4 at ~29 px. With the 24 px cap its window is 291 px, centred in 346, which is fine.

## Question 2: is the loosened check justified?

Yes, on the geometry. At ~29 px no gap of 3 mm or more puts 4 columns on the 390 card (above), so a default row whose first box is in column 4 cannot show it at scrollLeft 0. Of the two options, holding the focus back and keeping the start in view (round-7 rule) is the right one; scrolling to the box would hide the start, which is the round-6 defect.

The new digit-key check and the existing Tab and tap checks cover the way in.

The check is now too loose in one way. It no longer proves that a hidden first box is **forced** rather than a layout fault: a window that wrongly shows 2 columns would also pass. See defect 2.

## Ranked defects (RUBRIC §6 form)

1. **C1 / C3, major (−1 each, worksheet and quiz at 390).**
   - **Where:** `js/modules/sheet/cells/count-row.js` `arcsGeom` (the twin gap is capped at `TWIN_GAP_MM` = 7 mm). That cap is scaled by the TY-10b `--mq-k2` in `js/modules/screen-cell.js` `fitTwinRows`, so 7 mm becomes 32.1 px.
   - **What:** the 390 worksheet and quiz windows show 2 columns (196 px) in a 304 px inner box. 108 px are blank, and the pupil sees 4 of 12 numbers and swipes 5 times per row.
   - **Fix:** on phone twins (innerWidth ≤ 480, the TY-10b branch), cap the gap at **24 px absolute**, i.e. `24 / k2` mm, never under MIN_GAP (3 mm). Feed the capped gap into the geometry (pitch = item + gap) so the arcs are redrawn on the new pitch; do not restyle the flex gap afterwards. Paper, 820 and 1280 are unchanged.
   - **Proof:** in `wave1-c2-phone` assert the following on worksheet 390 and on a new quiz 390 host:
     - gap ≤ 24.5 px and ≥ 13.8 px;
     - 3 whole columns shown for every 1–3-digit row (default, by 7 from 3, by 25, times back, Missing 20 / 90);
     - window ≥ 3·item + 2·gap;
     - the arcs' pitch equals the column pitch (±1 px).
2. **Gate, minor (no score, but required before PASS).**
   - **Where:** `tests/scripts/wave1-c2-phone.cjs`, the loosened load check.
   - **What:** it now accepts a hidden first box on the card without proving the box was out of reach.
   - **Fix:** when `!t0.boxShown`, assert `firstBoxCol > shown` (the box lies past the whole columns that fit) **and** `shown === fit`.
   - **Proof:** the gate fails if the window is narrowed by one column on purpose.
3. **C4, minor, text only.**
   - **Where:** `WORKSHEET_DESIGN_STANDARD.md` TY-10b.
   - **What:** the text says "box height about 2x the digit, so about 58 px"; the box measures 53 px (1.83×), and 63 px for 5-digit rows.
   - **Fix:** write "box about 76 × 53 px (2-digit rows; the box:digit ratio of the 22 px drawing is kept)".
   - **Proof:** the gate's printed box size matches the text.
4. **Deploy blocker.**
   - **Where:** `index.html`.
   - **What:** `ws-stamp-assets --check` fails: `screen-cell.js` changed without a re-stamp, so live users would keep the cached old module.
   - **Fix:** run `node tests/scripts/ws-stamp-assets.cjs` and commit `index.html`.
   - **Proof:** `ws-stamp-assets --check` prints OK.

**To reach 10:**
- **C1:** 3 columns on the worksheet and quiz (defect 1). The card could also open with its first visible box (on line 2) not inviting out-of-order work, for example by showing line-2 boxes in a muted outline until line 1's earlier boxes are filled. This is a design question for the owner, not required.
- **C2:** an oral frame ("Say: 6, 12, 18 …") in the hint.
- **C3:** defect 1, with the card window and the worksheet window the same width (291 px) so the two hosts look alike.
- **C4:** defect 3, plus the carried owner question on the 48 px input / 40 px card digit rules versus count rows. TY-10b now answers the digit part on phones.
