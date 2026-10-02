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

---

# Round 3 (Opus, low)

Graded at **419d355** (the base was debc9c6). The working tree is clean.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 8 | Tab works at 390 on the card and the worksheet in all 8 cases, the cue shows, and the start dropdown reads "Number". |
| C2 Educational value | 7 | Titles now name the start that prints. The new one-page "fill" repeats rows the teacher did not ask for twice, and puts them out of the list's order. |
| C3 Spacing and layout | 7 | "All rows on one page" now prints **two pages on Letter**, with one orphan row on page 2 (and the same in the key). |
| C4 Standard fidelity | 8 | Black and white, Andika, facsimile keys, arcs point right on back rows. The one-page sheet with no rows chosen is byte-identical to 4911898 (12 of 12). |

## Runs (all from the tree, one at a time)

- `wave1-c2-phone`: OK. Card and worksheet at 390, 4 cases each. A real `keyboard.press('Tab')` walk (only the first box is focused by script) reaches 5, 5, 7 and 5 boxes, each fully visible. Page scroll width is 0. The cue shows at the start, hides at the end, and never covers a box.
- `wave1-c2-dupes`: OK, 7 cases × 4 roles × S/L. The probe allows one repeated first line per page and checks line 1 on page 1 only, which is lenient (see defect 4).
- `wave1-c2-onepage` (`MQ_BASE_ROOT` set to a `git archive 4911898`): OK, 12 of 12 identical.
- `wave1-c2-panel`: OK at 1280 and 390. Dropdown widths are 174/102/102/102, and the raised starts are explained.
- `ws-content-audit --skill count_by_tables`: OK, 0 failing.
- `ws-screen-answer --skills multiplication:count_by_tables`: OK (card, worksheet 3/3, quiz 3/3, live green).
- `ws-print-lint --source kit --skills multiplication:count_by_tables --roles independent,more-practice,test,guided`: 0 findings at S and at L. The same holds with `--opts` set to a 5-row mixed list (with 100,000 from 1,000,000), to one-page with typed rows, and to times-each back by 7. That is 8 runs and 32 documents, all clean. The lint runs on A4 only, so it cannot catch defect 1.

## Round-2 defects

1. Titles name the printed start: **fixed**. back-from-30 S/L reads "I Can count back by 5 from 55", and the rows start at 55. `rowsSummary` (`count-rows.js`) and `cbPage` (`providers/countby.js`) now both raise the start. `cbPage` re-implements `downStart` inline instead of calling it, so the two can drift apart. Minor.
2. Same values plus same blanks: **fixed** by the gate. On times-each-L test p1, b and d now differ. Items a and c still both open "7 14 21 [ ]", but their lines then differ. Accepted.
3. Worksheet Tab at 390: **fixed**. Real keyboard, 4 of 4.
4. Start dropdown at 390: **fixed**. It reads "Number" in `panel-open-390.png`.
5. Glossary popover: the explanation is accepted. Focus lands on a glossary word, which opens its tip, so this is live behaviour and not a fault in the screenshot. The screenshots are now taken before the Tab walk, and `phone-*` show no popover.

## The builder's unasked change (one-page sheet with rows chosen repeats the list to fill twelve lines)

**Not sensible as built. Revert to "each chosen row once".** Reasons:
- The option is called "All rows on one page". The teacher chose a list, and the label promises *that list*, on *one page*. Filling it repeats rows the teacher did not ask for twice. In `onepage-rows-A4`, +3, +7, +25 and +100 each appear twice. This also contradicts the one-page help text from round 2, which the owner saw.
- It breaks the one-page promise itself. On Letter, `onepage-rows-Letter` and `onepage-rows-wide-Letter` now have `pageCount: 2` and `keyPageCount: 2`. Page 2 holds a single row (k, +100) under a full header. In round 2 these were 1 page. `onePageRows` counts twelve lines, but at size S a Letter page holds fewer once a two-line or wide row is present (fits: 10 and 8 per page).
- If the owner wants a full sheet, the teacher can add rows. Fill could be a separate, explicit choice ("Repeat to fill the page"), off by default. Even then it must stop at what the page measurably holds, not at a fixed 12 lines.

## Ranked defects (RUBRIC §6 form)

1. **C3/C4, major. Where:** `onepage-rows-Letter` and `onepage-rows-wide-Letter`, independent p2 and key p2.
   **What:** "All rows on one page" prints 2 pages, and page 2 holds one orphan row. This regressed with the fill-to-twelve change in `onePageRows` (`count-rows.js:142`).
   **Fix:** print each chosen row once (see the judgement above). Whatever the rule, cap the rows at the count the paper actually fits (`fits.perPage` for that paper), never a fixed 12 lines. Add Letter cases with rows to `wave1-c2-onepage`, asserting `pageCount === 1`.
2. **C2, major. Where:** `onepage-rows-A4` and `onepage-rows-Letter` p1.
   **What:** rows repeat on a sheet the teacher built from a list, without being asked. The I Can reads "by 3, 7 and 5 more", but row a is +1,000. The printed order (1,000 first, then the repeats starting with +3 and not with the head of the list) does not match the order the title gives. "And 5 more" also tells the pupil nothing.
   **Fix:** print each row once, in the teacher's order. Make the title follow the printed order, or fall back to a generic title ("count on and back") when there are more than 4 steps.
3. **C1, minor. Where:** `phone-card-by-100-000-from-1-000-000-15-.png`.
   **What:** once the first box takes focus, the row scrolls so the step tab "100,000" is off-screen. Only the chevron "〉" shows, so the pupil cannot see what they are counting by. The instruction line does state it.
   **Fix:** on the first focus, keep `scrollLeft` at 0 when the box is already fully visible. Or pin the step tab, sticky on the left, as the cue is pinned.
4. **C2, minor (gate).** **Where:** `tests/scripts/wave1-c2-dupes.cjs`.
   **What:** it checks line-1 repeats on page 1 only, and tolerates one repeat per page.
   **Fix:** check every page.
5. **C4, minor. Where:** `providers/countby.js` `cbPage`.
   **What:** it duplicates `downStart` inline.
   **Fix:** import it from `count-rows.js`.

# Round 4 (Opus, medium)

Graded at **7bd1ecf** (WIP 6619966 plus the finishing commit, on 419d355). The working tree is clean.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 7 | The pinned step tab now **covers** the row on the 390 practice card when it opens: it reads "1,000 ⟩00 16,000", and the first box of lines 2 and 3 is half hidden. |
| C2 Educational value | 8 | Rows print once each, in the teacher's order. Titles name what prints, with no "and 5 more". The step is always in view. |
| C3 Spacing and layout | 7 | The one-page sheet drops chosen rows that would fit. 7 wide rows print 4, with about 50 mm blank at the foot of both A4 and Letter. A 2-row list leaves two-thirds of the page empty, though the help says "spreads". |
| C4 Standard fidelity | 8 | Black and white, Andika, TY-10a floor, facsimile keys. The default one-page sheet is byte-identical to 4911898 **and** to the current sweet-newton tip (12 of 12 each). |

## Runs (all from the tree, one at a time)

- `wave1-c2-onepage` against `git archive 4911898`: OK. It is also OK against `git archive claude/sweet-newton-c8wrv1` (96df11b), 12 of 12 identical. The 12 new chosen-row cases (6 lists × A4/Letter) are each 1 page + 1 key page, each row once, in order.
- `wave1-c2-dupes`: OK. It now checks every line on every page, which closes round-3 defect 4.
- `wave1-c2-phone`: OK, 32 PASS. It does **not** check what the pinned column covers (see defect 1).
- `ws-content-audit --skill count_by_tables`: OK, 0 failing. `ws-screen-answer --skills multiplication:count_by_tables`: OK.
- `ws-layout-unit`: OK, 535 assertions.
- `ws-print-lint --source kit` on count_by_tables, add_20_regroup and count_objects × independent, more-practice, test and guided: 12 documents, 0 findings. One-page with a 7-row mixed list (A4 and Letter): 0 findings.
- **(a) groupByHeight:** this is a byte comparison against `git archive 4911898`, which is the merge base. I built 25 sheets, pupil and key HTML plus page count: add_20_regroup, skip_count_line and count_objects × independent, more-practice, test and guided × S/L, plus a one-page count_by section mixed with add_20_regroup. **25 of 25 are identical.** The bypass fires only when *every* item is a one-page count-by item, so mixed sections and every other skill keep the regrouping. Accepted.
- **Dry-run merge onto claude/sweet-newton-c8wrv1** (`git merge-tree`): **no conflicts**. count-row.js and screen-cell.css merge cleanly. On the merged tree, boot-smoke, ws-screen-answer for count_by, wave1-c2-phone (32 PASS) and ws-code-snapshot (608 codes, nothing moved) are all OK. `ws-stamp-assets --check` FAILS (stale). Whoever merges must re-stamp.
- Probes of my own, in the scratchpad: `sticky.cjs` lists the numbers and boxes under the pinned column after load. `ws-grade-render --opts` renders a 7-row all-wide list on A4 and Letter, and a 2-row list on A4.

## Round-3 defects

1. Letter one-page with rows ran to 2 pages: **fixed**. Every chosen-row case is now 1 + 1 on both papers, and the gate asserts it. A new problem is that the cap is too low (defect 2).
2. Repeats and out-of-order rows: **fixed**. Each row prints once, in the teacher's order, and the I Can names every printed step in that order.
3. Step tab scrolled off on the phone: the tab is now pinned, but the pin **covers content** (defect 1). Not fixed as a whole.
4. Dupes gate on page 1 only: **fixed**. It checks every line on every page.
5. `cbPage` duplicating `downStart`: **fixed** (imported).

## Judgements on the extra changes

- **(a)** Accepted. The proof is above.
- **(b) One Letter limit for both papers.** Not acceptable as built. The real fault is the height model, not the shared limit. `TWO_LINE_UNITS = 2.5` treats a two-line row as 48.8 mm, but it measures 35.9–40.5 mm. `MIXED_PAD_MM` reserves 4.4 mm a row to keep heights within 1.6×, but the `groupByHeight` bypass has already made that reserve unnecessary. Both errors cut rows the paper holds (defect 2). One shared limit is reasonable for the panel message only if it equals the true Letter capacity.
- **(c) vpad spread.** The spread looks intentional and the digits stay at working size, which is good. It is capped at 13 mm, so a 1–3 row list does not spread: `short2-A4` (25 from 100, then 4) fills the top third and leaves the rest blank. That is honest, but the help text says "A short list spreads its rows over the page". Fix the wording, not the page.
- **(d) Pinned tab plus scroll-padding.** The idea is right, but the result is wrong on the practice card (defect 1). The worksheet opens at scrollLeft 0, so the problem there only shows mid-swipe.
- **(e) No note on the sheet about rows left off.** This is acceptable on the pupil page, because a note there would be noise for the pupil. The panel note ("N of M rows fit…") is the right place. That note must be true, though, and today it understates the count (defect 2). Optionally, the key footer could name the rows left off ("Not printed: by 8, by 11"). That is not scored.

## Ranked defects (RUBRIC §6 form)

1. **C1, major (−2). Where:** practice card at 390 on load: `phone-card-by-1-000-from-14-000.png`, `phone-card-by-100-000-from-1-000-000-15-.png`, `phone-card-times-each-back.png`, and `large-by-100000-from-1000000-15-L/.../card-390.png`.
   **What:** the first box auto-focuses and the row scrolls 42 px (1,000 from 14,000), 106 px (100,000) or 12 px (back by 12). The opaque sticky column then covers the start of every line:
   - The probe found 14,000 under the tab, with 15,000 showing as "00".
   - 1,000,000 is fully hidden and 1,100,000 shows as ",100,000".
   - On line 2 and line 3, the first item sits under the white `.k2-steptab-in` column, and on the card **an answer box is half covered** (box 96–163 px under a pin ending at 136 px, and 152–229 px under 164 px).
   - The pupil's first view shows a broken number and a partial box.

   **Fix:** in `count-row.js`, take the step tab (and the line-2 and line-3 arrow column) **out of** the `[data-mq-swiperow]` scroller, as a fixed left column beside it. Then nothing can slide under it, and `scroll-padding-left` and the pin offset in `wireSwipeRows` (`screen-cell.js:929`) go away. If the sticky approach stays: make only line 1's tab sticky, keep `.k2-steptab-in` non-sticky, and in `wireSwipeRows` reset `scrollLeft = 0` after the initial auto-focus when the focused box is fully visible clear of the tab.
   **Check:** add to `wave1-c2-phone` "after load, no number text or input in any line has `left < pin.right`, and the swipe row's `scrollLeft === 0` on the card", for all 4 cases.
2. **C3, major (−2); C2 −1 in the panel's honesty. Where:** `count-rows.js` `onePagePlan` (`TWO_LINE_UNITS`, `MIXED_PAD_MM`, the `Math.min(bodyMm, 207) + (mixed ? 0 : 30)` limit). Evidence: a render of 7 rows (by 1,000 … 7,000 from 14,000).
   **What:** A4 prints 4 rows, each 45.6 mm, and leaves about 50 mm blank above the footer. Letter prints 4 rows, each 42.1 mm, and leaves about 47 mm blank. A 5th row (measured 40.5 / 35.9 mm) fits on both papers. In the gate case "wide rows first", 6 of 8 print, but natural heights (2 × 37.5 + 6 × 22 = 207 mm) fit an A4 body of about 227 mm. The panel tells the teacher "4 of 7 rows fit", which is false.
   **Fix:** cap the plan by **measured** height rather than units. In `buildSheet`, the bridge already measures cells (`measured.hMm`). Add rows in order while Σ hMm + the row gaps ≤ the body height for that paper (`bodyHeightMm(paper) − instructionMm`). Drop `MIXED_PAD_MM`, since the `groupByHeight` bypass makes it redundant. The panel can then quote the Letter capacity computed the same way, or say "N fit on Letter, M on A4".
   **Check:** in `wave1-c2-onepage`, for each case, assert `pageCount === 1` **and** that building with the next chosen row added gives `pageCount === 2` (the cap is tight). Assert the panel's N equals the printed count on Letter.
3. **C3, minor (−1). Where:** `skill-options.js:1355` help text, and `short2-A4`.
   **What:** "A short list spreads its rows over the page." A 1–3 row list fills only the top third, because the pad is capped at 13 mm (`gen-mult-patterns.js` `pad = Math.min(13, …)`).
   **Fix:** reword it to "A short list keeps extra space round each row".
   **Check:** read the panel help.
4. **C4, minor (−1). Where:** `onepage-rows-A4` and `onepage-rows-wide-*`, rows d and a.
   **What:** on the one-line sheet the step-tab text shrinks with the digits (`stepTab`: `Math.min(g.pt * 1.05, 20)`). "+100" and "100,000" print at about 9 pt beside "+3" and "+25" at about 17 pt. The step is the one cue the pupil reads first.
   **Fix:** in `count-row.js` `stepTab`, floor the tab text at the S working size (about 14 pt) and widen the tab as needed. Use `w` from the text width rather than the digit pt.
   **Check:** in a render of `onepage-rows-A4`, every tab's text is ≥ 14 pt.

**To reach 10:**
- C1: no content ever sits under a pinned column, and the card opens at scrollLeft 0.
- C2: the panel's fit count is exact.
- C3: the cap is tight to measured height on each paper, and short lists match the help.
- C4: step-tab text has a size floor.
