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

# Round 5 (Opus, medium)

Graded at **409d746** (round-4 fixes on top of the merge 7897b36 of sweet-newton 50dbfa6). Only the builder's own changes, 7897b36..409d746, were reviewed. The working tree is clean: evidence that the gates re-shot was restored with `git checkout -- design/audit/runs`.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 7 | The tab column now sits beside the scroller, so nothing slides under it. But on the 390 practice card, the first auto-focus still scrolls the row past its own start in 3 of 4 cases. The pupil opens "by 1,000 from 14,000" and sees "1,000 › 16,000 [ ]", and "by 100,000 from 1,000,000" opens as "100,000 › [ ] 1,300,000", with no given number before the first box. The gate's scrollLeft-0 check is masked, so it passes. |
| C2 Educational value | 8 | Rows print once each, in order. Titles name exactly what prints ("…1,000 … 6,000 from 14,000" when the 7th row is cut). The panel count equals the printed count on A4 and Letter. |
| C3 Spacing and layout | 9 | The one-page cap is now tight on both papers. 7 rows by 1,000 print 6, filling the page to the footer, and so does the 12-row mixed list (8 print). Nothing is clipped and there is no big blank. A short list keeps air round each row, as the help now says. |
| C4 Standard fidelity | 8 | Black and white, Andika, TY-10a 9 pt floor. Step-tab text is ≥ 14 pt on every one-page case (the gate asserts it). The default one-page sheet is byte-identical to 4911898 and to live 50dbfa6 (12 of 12 each). |

## Runs (one at a time, from the tree)

- `wave1-c2-phone`: OK, 40 PASS. See defect 1 for why the card's "scrollLeft 0" PASS is not real.
- `wave1-c2-onepage` with MQ_BASE_ROOT = `git archive 4911898`: OK. With MQ_BASE_ROOT = `git archive claude/sweet-newton-c8wrv1` (50dbfa6): the 12 default/blank cases are identical. The chosen-row cases are all 1 + 1 pages, each row once and in order. The 3 cut cases are tight (one more row makes 2 pages). Panel N equals printed N, and tab text is ≥ 14 pt.
- `wave1-c2-panel`: OK, 28 PASS. `ws-screen-answer --skills multiplication:count_by_tables`: OK. `ws-content-audit --skill count_by_tables`: OK, 0 failing.
- `node --input-type=module --check` on the 7 modified modules: OK. `ws-stamp-assets --check`: OK.
- **Dry-run merge onto claude/sweet-newton-c8wrv1** (local and origin, both 50dbfa6): the live tip is already an ancestor of 409d746, so the merge is a **fast-forward. No conflicts.**
- My own probes (scratchpad, `c5-phone.cjs`, `c5-roles.cjs`):
  - **Phone, 390, card and worksheet × 4 cases**, checked after load, after programmatic `scrollLeft` = 37 and = half, after focus, after 3 real Tab presses and after 3 real Shift+Tab presses. In every state the tab column's right edge equals the row's left edge, and each tab entry is level with its line (0 px). That part of round-4 defect 1 is fixed.
  - **Renders**, `ws-grade-render --opts` on A4 and Letter: 7 rows by 1,000 from 14,000, and the 12-row wide/plain mixed list. Each is 1 page, full to the footer, with nothing clipped.
  - **Roles:** independent, more-practice and test × ican/daily × A4/Letter × 4 lists all give 1 + 1 pages with the same count, so the constant ROW_MM model holds across roles and looks.

## Round-4 defects

1. **Opaque tab covering content** (sticky tab): **fixed**. The tab is a separate column (`[data-mq-tabcol]`), level with its lines, and nothing is ever under it. The row lands on column starts on focus, and the end of the row pads so its last column lands on a start too. Two problems remain: **the card's first view** (defect 1 below) and **no snapping on a finger swipe** (defect 3).
2. **One-page cap**: **fixed**. ROW_MM {1: 17.1, 2: 33.2} with a body of A4 226 / Letter 208 is calibrated rather than measured live, but the gate proves it tight on every cut case and both papers. The panel uses the same function, so its count is exact.
3. **Help text**: **fixed** ("A short list keeps extra space round each row").
4. **Tab ≥ 14 pt**: **fixed** on the one-page sheet (`tabPt`, `TAB_FLOOR_PT = 14`, asserted by the gate). "+100" is now 14 pt beside "+3" at 16.8 pt.

## Judgement: `setOnePageBodyOverride` (count-rows.js)

**Acceptable.** It is not on `window` (globals.js does not import it), and no UI path calls it. A user could reach it only with a devtools `import()`. The gate resets it in `finally`, and `spare` (the vpad) always uses the real body, so a leaked override could not distort the air round rows, only the count. Optional tidy-up: let `onePagePlan` take a `bodyMm` argument for the test instead of module state. This is not scored.

## Ranked defects (RUBRIC §6 form)

1. **C1, major (−2). Where:** `screen-cell.js:1391` (`wireSwipeRows` → `snap`) and the gate `wave1-c2-phone.cjs:76-77`. Evidence: the builder's own `phone-card-by-100-000-from-1-000-000-15-.png` and `phone-card-by-1-000-from-14-000.png`, and probe `c5-phone.cjs`.
   **What:** the card auto-focuses the first box. When that box is not fully visible at scrollLeft 0, `snap` picks the column start **nearest the browser's own focus scroll** rather than the leftmost one that shows the box. Measured on load:
   - default tables: sl 0 → 1 column, so "6" is hidden.
   - 1,000 from 14,000: sl 161, so 14,000 and 15,000 are hidden.
   - 100,000 from 1,000,000: sl 182, so both given numbers before the first box are hidden. A leftmost valid start (sl 90) exists and shows "1,100,000 [ ] 1,300,000".
   - The worksheet does the same when a pupil taps the first box of the 100,000 row: sl 182, line 1 shows "[ ] [ ] [ ]" with no given at all.

   Two things make this worse:
   - The fixed "→" turn arrows in the tab column now point at whichever column is shown ("→ 1,700,000" when line 2 starts at 1,500,000).
   - The step tab "100,000 ›" points straight into the first box. That invites the exact error a custom start exists to teach against: counting from the step, so 200,000 instead of 1,200,000.

   Nothing tells the pupil that numbers lie to the left; the cue says only "Swipe → for more boxes". The gate passes because `scrollLeft: firstNeedsScroll ? 0 : w.scrollLeft` reports 0 whenever the first box needs a scroll. That masks exactly the case it was written to catch.
   **Fix:**
   - In `snap`, on the first focus (and on any focus whose box needs a scroll from 0), use `Math.min(...ok)`: the leftmost column start that shows the whole box, so the most preceding numbers stay in view. Keep "nearest" only for later Tab moves within a line.
   - While `scrollLeft > 0`, show a left-edge cue (a "‹" fade, or "Swipe back ← to the start") and hide the in-arrows of lines 2+ (or give the tab column a "…" marker), so the column never claims a continuation it does not show.
   - Fix the gate to report the real scrollLeft and assert it equals the leftmost valid column start.

   **Check:** in `wave1-c2-phone`, after load on the card, assert that `scrollLeft === min(column starts x such that the first box is fully visible)`, and that at least one given number precedes the focused box in line 1 whenever one exists in the row. Run this for all 4 cases, and again on the worksheet after `focus()` of the first box.
2. **C1, minor (−1). Where:** `count-row.js` swipe row (`[data-mq-swiperow]`) and `css/screen-cell.css`.
   **What:** focus snaps to column starts, but a finger swipe or programmatic scroll does not. After `scrollLeft = 37`, every line shows a number cut at the row's left edge ("<cut>14,000", "<cut>1,000,000"). The tab no longer covers it, but a cut 7-digit number is still a misread risk.
   **Fix:** add `scroll-snap-type: x proximity` to the swipe row and `scroll-snap-align: start` to each line's column items (CSS additive, in `screen-cell.css` under `.mq-scell [data-mq-swiperow]`). The end padding already makes the last start reachable.
   **Check:** probe a programmatic `scrollLeft = 37` followed by `scrollend`. No `.k2-given` or `input` has `left < row.left - 1`.
3. **Nit, not scored.** In `gen-mult-patterns.js:231`, the trailing comment is duplicated ("// 6 mm kept back … // 6 mm kept back …").
4. **Observation, not scored and outside this lane's diff.** The guided role ignores "All rows on one page". A 2-row list with onePage gives 7 items over 2 + 2 pages, and the panel's "N fit on one page" does not apply there. Confirm whether guided is meant to honour onePage. If it is not, the option help should say "Independent, More practice and Test pages".

**To reach 10:**
- C1: the card opens with the row's start in view (or the leftmost possible column), says when content lies to the left, and snaps on swipe.
- C2: no first view that hides the start the teacher chose.
- C4: the test-only hook becomes a parameter.

# Round 6 (Opus, medium)

Graded at **45d509b**, the round-5 fixes on top of 409d746. Only the builder's diff, 409d746..45d509b, was reviewed. The gates' re-shot evidence was restored with `git checkout -- design/audit/runs`. My probes ran from the scratchpad and wrote nothing into the tree.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 7 | The 390 practice card still opens with the start of the row out of view in 4 of 6 cases measured. Default ×6 opens at scrollLeft 89, so "6" is hidden. By 7 from 3 opens at 89, so "3" is hidden. By 1,000 from 14,000 opens at 163, so 14,000 **and** 15,000 are hidden. By 100,000 from 1,000,000 opens at 92, so 1,000,000 is hidden. The pupil meets the step tab "1,000 ›" pointing into 16,000 and has to swipe back before seeing where the count starts. |
| C2 Educational value | 8 | A given number now precedes the first box on every opening (the leftmost-start rule works). Rows print once each, in order, and titles name what prints. The start the teacher chose is still not the first thing the pupil sees. |
| C3 Spacing and layout | 8 | Print is unchanged and tight (9 in round 5). On the phone card the two cues stack to 142–166 px against 128 px for the two lines of boxes. The back cue wraps to 2 lines (83 px) in a 192–267 px window. |
| C4 Standard fidelity | 8 | Black and white, Andika, TY-10a floor, step tab ≥ 14 pt. The default one-page sheet is byte-identical to 4911898 (12 of 12 on A4 and Letter, `wave1-c2-onepage` OK). |

## Gates run (one at a time)

- `wave1-c2-phone`: **OK**, 56 PASS. The card's scrollLeft equals "want" in every case (89/163/92/0). The gate now asserts the real value, as round 5 asked. It proves the rule is applied, not that the opening is good.
- `wave1-c2-onepage` (MQ_BASE_ROOT = 4911898): **OK**. The defaults are identical to base, and every rows case fits on 1 page plus 1 key page, tight.
- `ws-screen-answer --skills multiplication:count_by_tables`: **OK** (card, worksheet 3/3, quiz 3/3, live green).
- `ws-stamp-assets --check`: OK. `node --input-type=module --check` passes on all 4 changed modules.
- Dry-run merge onto `claude/sweet-newton-c8wrv1` (50dbfa6): 50dbfa6 is an ancestor of 45d509b, so it is a **fast-forward with no conflicts**.

## Round-5 items

1. **Leftmost valid start:** **fixed as specified** (`screen-cell.js` snap: `first ? Math.min(...ok)`). The measurement shows the rule's limit. With the step-tab column beside the row, the window is only 267 / 220 / 192 px (tab 55 / 102 / 130 px wide). The leftmost start that shows the first box is therefore 1–2 columns in. See defect 1.
2. **Gate asserts the real scrollLeft:** **fixed**. It compares against the leftmost valid start, with ±2 px tolerance. One part is vacuous: the "after scrollLeft = 37 … the back cue shows" check returns true when the row settles at 0, and it settled at 0 in all 8 runs. The back cue is really tested only at 130. This is not scored.
3. **Mandatory snap:** **accepted.** The snap points are every column start (81–92 px) under a 192–322 px window. 0 is a snap point (line 1 child 0 sits at x = 0). The end padding makes the last start reachable. Measured settles: 37 → 0, 130 → 89 / 163 / 92 / 172, with nothing cut. On a finger it behaves like a carousel. A drag of less than half a column springs back, which a pupil with weak motor control may feel as "sticky". The alternative is worse: `proximity` lets the row rest mid-column with a 7-digit number cut at the left edge (the round-4 defect). Keep `mandatory`.
4. **Help text:** **fixed and verified.** buildSheet with onePage prints 12 rows on 1 page plus 1 key page for independent, more-practice and test. Guided (7 rows) and review (8 rows) keep their own layout, as the help now says.

## Measured: the 390 card at load (probe `c6-phone.cjs`)

| Case | Tab col | Window | Pitch / item | 1st box (col) | Right edge of 1st box | Opens at | Hidden givens |
|---|---|---|---|---|---|---|---|
| default ×6 | 55 | 267 | 89 / 62 | 4th | 329 | 89 | 6 |
| by 7 from 3 | 55 | 267 | 89 / 62 | 4th | 329 | 89 | 3 |
| by 1,000 from 14,000 | 102 | 220 | 81 / 71 | 4th | 315 | 163 | 14,000, 15,000 |
| by 100,000 from 1,000,000 (15) | 130 | 192 | 92 / 81 | 3rd | 265 | 92 | 1,000,000 |
| times each, back | 74 | 248 | 86 / 62 | 3rd | 234 | 0 | none |
| by 25 | 55 | 267 | 89 / 62 | 3rd | 240 | 0 | none |

Cue heights: the back cue is 83 px (2 lines) and the forward cue 59–83 px. The two lines of boxes are 128 px (196 px for the 15-number row). Digits are 22.2 px (14.7 px for 7-digit numbers) and boxes 58–77 × 44 px.

## The alternatives, measured

- **(a) Fit the start and the first box at scrollLeft 0 by shrinking, with the tab kept beside the row:** rejected. 1,000,000 needs 265 px in a 192 px window, about 0.72× the digits (14.7 → 10.6 px ≈ 8 pt), which is under the TY-10a 9 pt floor. 14,000 needs 315 in 220, 0.70×.
- **(b) 3 lines of 4 on phones:** rejected. TY-10a ("every count-by row is exactly two lines of six") and the SP-11a extension ("two lines of six" on the phone) are written for the screen too, not only for pages, so this needs a new owner ruling. It also does not fit the wide rows: 4 × 92 − 10 = 358 px > 322 for 1,000,000.
- **(c) No auto-focus, row at 0:** not enough on its own. The start shows, but the first box is 0 % visible (default, by 7, 14,000) or 8 % visible (1,000,000), and "16,000" is cut at the right edge (163–234 against a 220 window). Use it only as the fallback in the fix below.
- **(d) Smaller cues:** needed, but they are a consequence of the narrow window (see defect 2).
- **(e) Recommended: on the phone, put the step tab ABOVE line 1, not in a side column.** I probed this live by setting `flex-direction: column` on `.k2-countrow-frame`, keeping only tab entry 0, with scrollLeft 0 and nothing focused. The window becomes **322 px** in every case. The first box right edges are then 315 for 14,000 (fits), 265 for 1,000,000 (fits), 234 for times-back (fits), 240 for by 25 (fits), and 329 for default and by 7 (**7 px short**). The forward cue drops to one line, 55 px. The card is 23–48 px shorter in the 4 cases that opened scrolled (mostly because the back cue goes); the 2 that opened at 0 grow 59–64 px for the tab line. Nothing shrinks, and the rows stay two lines of six.

## Ranked defects (RUBRIC §6 form)

1. **C1, major (−2). Where:** `js/modules/sheet/cells/count-row.js:295–330` (`swipeTabs`: the tab column `[data-mq-tabcol]` beside `[data-mq-swiperow]`) and `js/modules/screen-cell.js` `wireSwipeRows` → `snap`. The evidence is `phone-card-default-tables.png`, `phone-card-by-1-000-from-14-000.png` and `phone-card-by-100-000-from-1-000-000-15-.png`, plus the table above.
   **What:** the card opens 1–2 columns into the row, so the start of the count (the teacher's chosen start in 3 of the cases) is off-screen behind a "⟵ Swipe back to the start" cue. A SPED pupil has to see where counting begins without first swiping away from the box that has focus. Expected: scrollLeft 0, with the first given number and the first box both fully visible.
   **Fix:**
   - (i) When the cell is a phone twin that swipes (`swipeTabs`), render the step tab once, above line 1. It sits left-aligned in its own block before `[data-mq-swiperow]`, outside the scroller, and nothing sits under it. Drop the side tab column and the line-2+ tab entries; the in-arrow of lines 2+ may stay at the start of each line inside the row. Paper and wider hosts are unchanged. This frees 55–130 px, making the window 322 px at 390.
   - (ii) On that phone layout, cap the gap so the first four columns fit: `gap ≤ (window − 2 − 4·item) / 3`, which is ≤ 24 px for 1–2-digit rows (now 27.6 px, pitch 89 → 86). Boxes stay 58 × 44, digits unchanged. Redraw the arcs on the new pitch (they are drawn from `g.pitch`, so pass the phone pitch into the geometry; do not restyle the flex gap afterwards).
   - (iii) Make the window a whole number of columns, `floor((window + gap) / pitch) · pitch − gap`, so no number is cut at the right edge at load either. Today 1,000,000 cuts 3 items at the right at 322, so its window becomes 265 px.
   - (iv) In `snap`, on the first focus: if no valid start ≤ 0 shows the box (for example when the teacher prints 4+ numbers to start), **leave scrollLeft at 0** and do not move the row. Focus with `{ preventScroll: true }` and let the forward cue show. The next Tab or tap snaps as now. The start beats the box on the first view.
   **Check:** extend `wave1-c2-phone` for the card. At load assert `scrollLeft === 0` for all 4 cases plus "by 7 from 3". Assert that the first `.k2-given` (the start) is fully inside the window, that the first box is fully inside it for the 4 named cases, and that no `.k2-given` or `input` crosses the window's right edge (`r.left < v.right && r.right > v.right + 1`). Assert the tab does not overlap the row. Assert that a row with 4 numbers printed to start opens at 0 with focus unmoved.
2. **C3, minor (−1). Where:** `css/screen-cell.css` `.k2-swipe-back` / `.k2-swipe-cue`, and the cue markup in `count-row.js:332`.
   **What:** the back cue (83 px, 2 lines) and the forward cue (59–83 px) stack to 142–166 px, more than the 128 px of the two lines they serve.
   **Fix:** with fix 1 the window is 322 px and the forward cue is one line (55 px measured). Shorten the back cue to "⟵ Back to the start" and put both cues in one strip when the row is mid-way (back on the left, "Swipe ➜ for more boxes" on the right, wrapping only if needed). Target: the visible cue height is ≤ 60 px and ≤ 0.5 × `.k2-countrow-body` height at 390.
   **Check:** in `wave1-c2-phone`, after `scrollLeft = 130`, assert that the summed visible cue height is ≤ 60 px and ≤ 0.5 × body height.
3. **Gate nit, not scored.** In `wave1-c2-phone.cjs` the "scrollLeft = 37 … the back cue shows" message passes vacuously when the row settles at 0. Say "settles at 0 (back cue hidden)", or assert the cue hidden at 0 and shown at > 0.
4. **Observation for the owner, not scored.** RUBRIC C1 asks for screen digit inputs ≥ 48 px tall. The SP-11a extension sets count-row boxes at ≥ 44 px, and they render at 44. The card's count-row digits are 22 px against the 40 px practice-card digit size (WDS table), and TY-10a / SP-11a are silent on the screen digit size of count rows. One of the two rules should say which governs.

**To reach 10:**
- C1: the card opens at scrollLeft 0 with the start and the first box in view (fix 1), and no number is cut at either edge.
- C2: the first thing the pupil reads is the start the teacher chose, then the step.
- C3: the cues are one line and ≤ half the row's height.
- C4: the owner settles defect 4.

# Round 7 (Opus, medium)

Graded at **f756b7a** (round-6 fixes on 45d509b). Diff reviewed: 45d509b..f756b7a (`screen-cell.js` `wireSwipeRows` mode/snap, `count-row.js` twin gap cap + one cue strip, `screen-cell.css` additive rules, gate). Re-shot evidence restored with `git checkout -- design/audit/runs`; probes ran from the scratchpad.

## Verdict: FAIL

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 7 | The six named cases now open at scrollLeft 0 with the start and first box in a 322 px window (verified). But fix (iv) and its gate check were not done: with **Missing 20 %** the first box lands in column 6 in 7 of 12 default-table cards, and the card opens at scrollLeft 172 (163 for 14,000), so "6, 12" (or "14,000, 15,000") are hidden behind "Back to the start". That is the round-6 defect on the more-scaffolded option weaker pupils get. On the 1280 quiz, 1,000,000 ×15 now shows a false "Swipe ➜ for more boxes" when every number is visible. |
| C2 Educational value | 8 | Start-first on all default and named cases; rows, order, titles unchanged. The line-turn arrows (↴) are cut off on the 1280 quiz. |
| C3 Spacing and layout | 8 | The phone card is clean: tab above line 1, whole-column window, one cue line in the common case. The gap is 24.6 px on phone hosts and 25.3 / 26.9 px on 1280 / 820 cards, which reads well (arcs are drawn on the pitch). Two layout faults remain: the quiz window cuts the exit arrows, and the cues wrap to 2 lines (57 px) at 390 when both show. |
| C4 Standard fidelity | 8 | Print is untouched (`isTwin` guard): `wave1-c2-onepage` is byte-identical to 4911898 on 12 of 12, and `wave1-c2-sizes` is OK. B&W, Andika, TY-10a, two lines of six. |

## Gates run (one at a time)
- `wave1-c2-phone`: **OK** (all PASS, both hosts, 6 cases).
- `wave1-c2-onepage` (MQ_BASE_ROOT = scratch checkout of 4911898): **OK**. 12/12 defaults identical; rows cases fit on 1 + 1 key, tight.
- `wave1-c2-sizes`: **OK** (S/M/L, independent + test, lines 6+6 / 5+5+5, digit floors held).
- `ws-screen-answer --skills multiplication:count_by_tables`: **OK** (card, worksheet 3/3, quiz 3/3, live green).
- `ws-stamp-assets --check`: OK. `node --input-type=module --check`: both changed modules OK.
- Dry-run merge onto `claude/sweet-newton-c8wrv1` (origin = 50dbfa6): ancestor of f756b7a, **fast-forward, no conflicts**.

## Worksheet at 390 (my probe, 6 cases)
- At load nothing is focused (`document.activeElement` = BODY). Every row rests at 0 with the start visible. The window is 237 px (3 columns) for 1–2-digit rows, 236 px for 14,000 and 268 px for 1,000,000.
- A tap can reach only a visible box, and the row does not move (verified: tap → focus in the row, scrollLeft 0).
- Only **keyboard Tab** into a card whose first box is in column 4+ scrolls the row: default seed card 2 goes to scrollLeft 86 and hides the start. The gate's "focus() first box" runs show the same: default 86, by 7 from 3 86, by 25 259.
- Judgment: acceptable for touch, and minor for keyboard. The same rule as the card fix below closes it, so it is folded into defect 1 and not scored separately.

## Desktop
- The 1280 card (by 25, 1,000,000 ×15) is clean. 1,000,000 ×15 switches to tab-above at 1280, which is reasonable because the row then fits whole.
- The committed `large-by-100000…/worksheet-1280.png` and `card-1280.png` show two stray "→" in-arrows floating under the tab, about 90 px of dead space. A fresh `ws-grade-render` of the same case does not draw them, so the evidence is stale (it was rendered before the last CSS edits). Re-shoot it.

## Ranked defects (RUBRIC §6 form)
1. **C1, major (−2). Where:** `js/modules/screen-cell.js` `wireSwipeRows` → `snap` (the `!ok.length && firstFlag` branch). The fallback fires only when *no* position shows the box. **What:** with Missing 20 % (also 90 % first only, or any seed whose first blank is in column 5+), the auto-focused first box is in column 6. The card then opens at scrollLeft 172 and the start is hidden (probe: 7 of 12 default-table cards, 3 of 12 "by 1,000 from 14,000" cards). Keyboard Tab on the worksheet does the same. **Fix:** on the first focus, if the box is not fully inside the window at scrollLeft 0, keep scrollLeft 0 and do **not** focus a hidden box. Typing into an invisible box is worse than no focus. On the card, skip the auto-focus (or `focus({preventScroll:true})` plus `blur` on the first keystroke, so the pupil is never typing blind), and leave the forward cue on. The pupil swipes and taps. Later Tabs keep the nearest-start rule. **Check:** add the cases `missing: 20` (seeded so the first box is in column 6) and `missing: 90, fill: 'one'` to `wave1-c2-phone` (card and worksheet). Assert scrollLeft 0 at load and after the first Tab into the card, the first `.k2-given` fully inside the window, and `document.activeElement` not a box outside the window.
2. **C1/C3, minor (−1). Where:** `screen-cell.js` `mode()` (`win = n·pitch − gap + 3`) and the cue rules in `css/screen-cell.css` (`[data-mq-end]` comes from scrollWidth). **What:** on the 1280 quiz, 1,000,000 ×15 shows all 15 numbers in a 562 px window. The two ↴ exit arrows lie beyond it (scrollWidth 676), so the row scrolls and "Swipe ➜ for more boxes" shows, though no box or number is hidden, and the turn arrows that join the lines are cut. In 45d509b this case showed whole, with no cue. **Fix:** when `n ≥ perRow` (every column fits), do not narrow the window. Use the full width, so the exit arrows are inside and nothing scrolls. Also drive the forward cue from "a `.k2-given`/input lies beyond the right edge", not from scrollWidth. **Check:** quiz 1280 1,000,000 ×15: `scrollWidth ≤ clientWidth + 1`, cue hidden, every ↴ inside the window. Add this to `wave1-c2-phone` or a desktop twin of it.
3. **Evidence, not scored.** Re-run `ws-grade-render` for `large-by-100000-from-1000000-15-L` (and the rest of the wave1-C2 render dirs) after the last CSS edits. The committed 1280 card and worksheet PNGs show stray in-arrows that the current code does not draw.
4. **Nit, not scored.** At 390, when both cues show, the strip wraps to 2 lines (57 px, within the ≤ 60 px gate). "⟵ Back" alone would keep it to one line.
5. **Carried, owner observation (C4):** count-row screen boxes 44 px and digits 22 px against the C1 48 px input / 40 px card digit; one rule should govern.

**To reach 10:** no first view ever hides the start and no box takes focus off-screen (1); no cue claims boxes that are not there, and the turn arrows always show when the row fits (2); evidence matches the code (3).

# Round 8 (Opus, medium)

Graded at **a5c1834**, the round-7 fixes on f756b7a. I reviewed the diff f756b7a..a5c1834 (`screen-cell.js` `wireSwipeRows`: program focus held, `moreRight` cue, full width when every column fits, `watchTabKey`; 3 additive CSS rules; the gate). Print modules were not touched. I restored the gates' re-shot evidence with `git checkout -- design/audit/runs`, and my probes ran from the scratchpad.

## Verdict: PASS

| Criterion | Score | One line |
|---|---|---|
| C1 Ease of use | 9 | No first view hides the start. With Missing 20 % (first box in column 6) the 390 card opens at scrollLeft 0, shows the start, withholds focus and shows "Swipe ➜ for more boxes". In my probe that held for 6 of 6 cards, 4 with the box hidden and 2 with it in view and focused, and the same for 14,000. At 820 and 1280 the box is in view, so focus is kept (16 of 16). A Tab or tap is the pupil's own move: it shows the box, and typing lands in it. |
| C2 Educational value | 9 | Start first everywhere. The turn arrows (↴) now show on the 1280 quiz. Rows, order, titles and keys are unchanged. |
| C3 Spacing and layout | 8 | The card at 390 is clean, with a whole-column window, the tab above the row and a one-line cue strip (33 px when both cues show). The worksheet at 390 still uses a 237 px, 3-column window inside an about 330 px cell. |
| C4 Standard fidelity | 8 | Print is byte-identical to 4911898 (`wave1-c2-onepage` 12/12), and `wave1-c2-sizes` is OK. B&W, Andika, TY-10a, two lines of six. The carried owner question on 44 px boxes and 22 px digits is still open. |

## Gates run (one at a time)
- `wave1-c2-phone`: **OK**, 230 PASS, including the new Missing 20 % and 90 % cases on card and worksheet, the program-focus, Tab and tap typing checks, and 1280 and 820.
- `wave1-c2-onepage` (MQ_BASE_ROOT = 4911898 checkout): **OK**. Also OK: `wave1-c2-sizes`, `-defaults` (exit 0), `-dupes` and `-panel`.
- `ws-screen-answer --skills multiplication:count_by_tables`: **OK** (card, worksheet 3/3, quiz 3/3, live green).
- `ws-stamp-assets --check` OK. `node --input-type=module --check` OK on `screen-cell.js` and `count-row.js`.
- 50dbfa6 (`claude/sweet-newton-c8wrv1`) is an ancestor of a5c1834, so the merge is a **fast-forward**.

## Round-7 defects
1. **Hidden-start opening (Missing 20 %): fixed.** The card at 390 rests at 0 with the start in the 322 px window (318 px for 14,000), with no focus in the row and the forward cue on (probe `r7-sparse2`; screenshot `r7-card-20pct.png` checked). Tab from outside still scrolls to show the box. I accept that: a Tab is the pupil's own move, and a focused box out of view would mean typing blind. My round-7 check that asked for "scrollLeft 0 after the first Tab" contradicted the rule against typing blind, so I withdraw it.
2. **1280 quiz 1,000,000 ×15: fixed.** The probe gives scrollWidth 693 = clientWidth 693, no cue, 2 of 2 ↴ inside, and 0 hidden numbers (quiz-1280.png checked). At 820 the same holds for all 4 cases. At 390 the quiz swipes, and its cue shows only while numbers are hidden.
3. **Stale evidence: fixed.** The re-shot 1280 card and worksheet for `large-by-100000…-L` have no stray in-arrows.
4. **Cue strip on two lines at 390: fixed.** It reads "⟵ Back  Swipe ➞" on one 33 px line.

## Notes (not scored, nothing blocks)
1. **C3, to reach 10. Where:** the worksheet at 390 (`phone-worksheet-*.png`), `screen-cell.js` `mode()` (`avail` = frame width).
   - **What:** the window is 237 px (3 columns) in an about 330 px cell. There are about 45 px of white space on each side, and the pupil swipes more than they need to.
   - **Fix:** measure `avail` from the cell's inner box (less its padding), not the frame. Where 4 columns of pitch 86 (320 px) fit, take 4.
   - **Check:** in `wave1-c2-phone` at worksheet 390, assert window ≥ 4·pitch − gap whenever the cell's content box allows it.
2. **C1, to reach 10.** When the card withholds focus, a pupil with a hardware keyboard who types goes nowhere.
   - **Fix:** on the first printable keydown with nothing focused, move to the first box, using the Tab rule (scroll to the leftmost start that shows it).
   - **Check:** card 390 Missing 20 %. Press "7" with BODY focused. The first box holds "7" and is fully in the window.
3. **C4, carried to the owner:** count-row screen boxes are 44 px and digits 22 px, against the C1 48 px input and 40 px card digit. One rule should govern.
4. **C2, to reach 10:** an oral frame ("Say: 6, 12, 18 …") in the hint on the card. It is not part of this lane's brief.
