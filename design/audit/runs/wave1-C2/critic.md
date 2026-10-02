# Wave 1 Lane C2 — independent critic (Opus, low)

Tree `worktree-agent-a9dc5434f99d8dd40` @ 5bf1aac, diff against `claude/sweet-newton-c8wrv1`.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 7 | Tabs (−7 / +5), arcs and instructions read clearly; the phone card breaks a big-number row into orphaned pairs. |
| C2 Educational value | 7 | Every key I checked is right, down and large rows included; but short rows (3 numbers, 1 blank) and identical repeated items teach little. |
| C3 Spacing and layout | 5 | H5: back-from-30 S is about 35 % used; H13: mixed-list L p2 gives 3-number rows two-line-high cells. |
| C4 Standard fidelity | 8 | Black and white, Andika, frame and facsimile keys hold; the times labels are grey on Guided and gone on Test, as the brief says. |

## What was run (all OK)

- `wave1-c2-defaults.cjs`: the default and onePage pages deal 1 to 12 as before, with the same values and blanks. It is a dump with no assertions, so I compared the output by eye.
- `wave1-c2-panel.cjs`: OK at 1280 and 390. It checks: 5 controls at rest, More closed, the rows round-trip in a share code, and the old code (tables 7, 8) decodes to two plain rows.
- `ws-content-audit --skill count_by_tables`: OK, 0 failing. One note (zero-facts), which does not matter here.
- `ws-options-verify --skill count_by_tables`: OK, 26 out of 26. Every value warns "answers not found in the key text". This is probably because the key draws the numbers in boxes, not as text. Not a C2 defect, but it means the verifier is blind to this skill's key.
- Codec in node: these inputs give `[]` and no crash: `''`, `R`, `XYZ`, `0`, `-5`, `1e9`, `12C`, `5CD`. A 20-digit step and start clamp to 100,000 and 1,000,000. 50 repeated rows cap at 12. `RRR5RR` reads as one row. Bad JSON gives `[]`.

## Ranked defects (RUBRIC §6 form)

1. **C2 / C3, major. Where:** `mixed-list-L` independent p1–p2 and `onepage-rows-S`.
   **What:** H13 grouping puts taller rows first, and this breaks the teacher's order. The list was 2, 5, 25↓, 1,000↓. Page 1 prints 2, 5, 2, 5, 25↓, so 2 and 5 repeat before 1,000 has appeared once. On the one-page sheet the I Can says "3, 7 and 3 more", but the first row is +100. The help text promises "in order … every row once before repeats", and the page does not keep that promise.
   **Fix:** deal the list in order, once each, before any repeat. Group by height only inside each round, or not at all. The I Can should list the steps in the order they print.
2. **C3, major (H13). Where:** `mixed-list-L` key p2, f/g/h.
   **What:** the 1,000↓ from 2,000 row is 2,000, 1,000, [0]: 3 numbers and 1 blank. Its cell is as tall as a two-line row, so about 60 % of it is empty. Items f and h are the same item.
   **Fix:** size each cell to its own row (or pack the short rows two to a band). Never deal the same values and blanks twice on one page.
3. **C2, major. Where:** `count-rows.js` `DOWN_MIN = 3`.
   **What:** a typed start that gives only 3 numbers (2,000↓1,000; 12↓5 gives 12, 7, 2) is kept, and it leaves one or two blanks. That is not practice.
   **Judgement on (b):** raising a too-short start is right, but say so in the panel next to the row ("starts at 703 so the row has 8 numbers"). Raise the threshold to about 6. A silent change to a number the teacher typed is surprising.
4. **C3, major (H5). Where:** `back-from-30-by-5-short-S`, `start-custom-3-by-5-S`, `large-by-1000-from-14000-S`.
   **What:** the S pages print 4 to 6 short rows and leave 40 to 65 % of the page blank. back-from-30 S is below 50 %.
   **Fix:** at S, fill the page to the row capacity (as the default page does), or rebalance to fewer, fuller pages.
5. **C1, major. Where:** `large-by-100000-from-1000000-15-L` `card-390` (and the `by-25` card at 390).
   **What:** at 390 px the row wraps into pairs. An arc chain runs over only two numbers, there is no arc or turn arrow between lines (1,100,000 → 1,200,000), and 2,400,000 sits alone on the last line. The pupil cannot see one count. The print version uses turn arrows; the screen version does not.
   **Fix:** use the print turn arrows and arcs across the lines in the screen cell too, or keep 3 or more numbers per line with a turn arrow.
6. **C2, minor. Where:** times labels with a custom start that is a multiple of the step.
   **What:** "by 5 from 10" labels 2 × 5, 3 × 5 … The help says "the jump number times the step", but the label is really the factor, not the jump count. That is correct maths and wrong wording. A row starting at 3 (not a multiple) shows no labels, which is correct (see `isTable`).
   **Fix:** the help should say "the multiplication fact that makes the number".
7. **C2, minor. Where:** Guided and Independent steps for custom starts.
   **What:** "Check: the last number is the last jump" is false for a typed start, a zero start or a down row (the down variant was rewritten; the up variant with a start was not).
   **Fix:** for a typed start, use "Check: each number is the jump more than the one before."
8. **C2, minor. Where:** `times-each-L` test p1 and `start-custom-3-by-5-S`.
   **What:** the items have near-identical blank patterns. All four test rows begin 7 14 21 [ ] 35 [ ].
   **Fix:** spread the first blank across positions 2 to 4 between items.
9. **C1, minor. Where:** the panel at 390.
   **What:** each row takes two lines of controls, so 4 rows push the list past the fold, and 12 rows will be very long. Acceptable, but consider a one-line summary for each row with tap to edit.

## Judgements requested

- **(a) Down rows keep their arcs pointing right.** Correct. The pupil reads left to right; the −N tab and the instruction carry the direction, and the numbers fall. Arcs pointing left against the reading direction would confuse SPED pupils more. Keep it.
- **(b) The raise to 8 numbers.** Acceptable only if the panel shows it (see defect 3). The threshold of 3 is too low.
- **(c) H13 changes the order.** Yes, it breaks "the chosen order" (defect 1). It must not override the teacher's list order.
- **(d) Max Number not used.** Fine. The rows define their own range, and the content audit agrees.

Checked correct: down keys (back-tables, back-by-12 with 15 numbers, back-from-30), large keys (14,000 by 1,000; 1,000,000 by 100,000 with 15 numbers), thousands separators in print and on screen, tab widths for −1,000, +100 and 100,000, labels 0 × 25 … 11 × 25 for a zero start, the "given" mode hiding the labels at blanks, labels off on Test, grey labels on Guided, and the share code and the old tables code.

Summary: the codec, keys and look are solid. The page dealing (the order broken by grouping, duplicate items, 3-number rows, half-empty S pages) and the phone wrap are why it does not reach 8.

---

# Round 2 (Opus, low)

Graded at **debc9c6**. The builder's follow-up commit had not landed when I finished. The working tree still holds uncommitted edits to `screen-cell.js`, `count-row.js`, `screen-cell.css` and the standard, plus the untracked `phone-*.png`. I ran the phone probe against that working tree and say so below.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 8 | Every row is two lines of 6. The phone card swipes with a cue, and Tab keeps each box visible. The panel rows each fit on one line. |
| C2 Educational value | 7 | A raised start contradicts the page's own title ("count back by 5 from 30" prints rows from 55). Test items still repeat the same blank pattern. |
| C3 Spacing and layout | 8 | S pages are full (six rows). Cells fill the width. The 1,000,000 row holds 11.9 pt, above the floor. |
| C4 Standard fidelity | 8 | Black and white, Andika, facsimile keys, arcs point right. The one-page sheet is byte-identical to 4911898 (A4 and Letter, 6 cases each). |

## Runs

- `wave1-c2-sizes`: OK. Every case is 6+6 (or 5+5+5). The smallest digits are 11.88 pt (100,000 L) and 12.61 pt (hexagons L), both above the 9 pt floor. Labels are at least 10 pt.
- `wave1-c2-onepage` (with `MQ_BASE_ROOT` set to 4911898): OK. All 12 cases are identical to the base.
- `wave1-c2-panel`: OK at 1280 and 390. A raised start is explained ("Starts at 275 so the row has 12 numbers."). Each row editor is 44 px high.
- `ws-content-audit --skill count_by_tables`: OK, 0 failing.
- `ws-screen-answer --skills multiplication:count_by_tables`: OK (card, worksheet 3/3, quiz 3/3).
- Tab probe at 390 (the builder's uncommitted `wave1-c2-phone.cjs`, run against the working tree):
  - Card: PASS in all 4 cases. Tab reaches every box (5, 5, 7 and 5 boxes), each fully visible and none clipped at the bottom. Page scroll width is 0. The cue "Swipe ➞ for more boxes" shows at the start and hides at the end.
  - Online worksheet: **FAIL in all 4 cases** ("focus left the boxes", 0/5). I did not settle whether this is a fault in the probe (its focus selector) or a real keyboard trap. The builder must make it pass or show it is a fault in the probe.

## Round-1 defects

1. Order follows the teacher's list: **fixed**. Mixed-list p1 prints 2, 5, 25↓, 1,000↓, 2, and the I Can lists the steps in that order.
2. Short rows and identical items: **fixed**. Every row has 12 numbers.
3. Raised starts are announced in the panel: **fixed**. The page side is not fixed (see new defect 1).
4. S pages filled: **fixed**. back-from-30 S has six full rows.
5. Phone rows with big numbers: **fixed on the card**, using the swipe and cue of SP-11a. Two reservations: this rests on uncommitted work, and the committed `card-390.png` for 100,000 is stale (clipped, no cue).
6. Label help wording: accepted.
7. Worked step text: **fixed** ("Check: the numbers go the way the sign says").
8. Near-identical rows: **not fixed** (see new defect 2).
9. Compact phone row editor: **fixed** (one line per row).

## TY-10a

The wording is tight. It names the cell, the skill and the look, and says shrink "just enough", "nothing that fits shrinks", and "no other cell". The floor is 9 pt (3.2 mm), 1 pt above TY-11, with an 8 pt floor for labels, which are a hint. The floor is sound, and the measured worst case of 11.9 pt leaves margin. Accepted.

## Ranked defects (RUBRIC §6 form)

1. **C2, major. Where:** `back-from-30-by-5-short-S` (and L), independent p1. The same applies to any raised start.
   **What:** the I Can says "count back by 5 from 30", but every row starts at 55. The raise is announced in the panel, but the page title and the pupil still read "from 30", so the page contradicts its own name.
   **Fix:** build the I Can and the instruction from the start actually printed ("from 55"). Or, for a down row, keep the typed start and extend the row below it only if it stays at or above 0. If neither works, refuse the raise.
2. **C2, minor-major. Where:** `times-each-L` test p1.
   **What:** items a and c both open "7 14 21 [ ]", and items b and d both have the same first line, "7 14 [ ] 28 [ ] 42". On a 4-item test, two pairs share a line pattern.
   **Fix:** make the first-line blank patterns distinct across the items on a page. Fall back to the second line only when the distinct patterns run out.
3. **C1, major (until shown otherwise). Where:** online worksheet at 390, every case.
   **What:** the Tab walk in `wave1-c2-phone.cjs` never lands in a count-row box.
   **Fix:** make Tab reach every box in order with each fully visible, or fix the probe's focus selector. Then commit the probe and the clipping fix, and regenerate `card-390.png`.
4. **C1, minor. Where:** `panel-open-390.png`.
   **What:** the start dropdown is cut to "Num". The teacher cannot read what it says.
   **Fix:** shorten the option labels (for example "From…"), or let the select take the width it needs.
5. **C1, minor. Where:** `phone-by-1-000-from-14-000.png`.
   **What:** a popover ("…rs in order to find how") and a focus outline overlap the instruction at the top of the card. It may be an artifact of how the screenshot was taken.
   **Fix:** confirm it does not happen in live play, and retake the screenshot.

Arcs point right on the counting-back rows, as ruled. The compact sheet is untouched. TY-10a is accepted.
