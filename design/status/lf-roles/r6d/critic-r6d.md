# Critic r6d - lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `c8bce22a` (r11 `df83248e` plus its backtest rows).
The working tree has no JS edits, so the after PNGs are HEAD. Graded against `design/audit/RUBRIC.md` (C1-C4, H-caps),
`design/PAGE_TYPES.md` PT-RSN-1 and PT-RSN-4 (with lead ruling F8: "Circle A or B. The answer is __."), PT-TOF, and
`WORKSHEET_DESIGN_STANDARD.md` CL-4b. This round re-grades critic r6c's FAIL (D1 one item a page, D2 centred stack, D3 the
stack fired on work that fits side by side).

**Verdict: FAIL.** One counted defect remains: sub_word_problems Reason It L still prints one item a page (r6c D1, H5).
Every other page set scores 8 or better on the counted criteria and is better than before. D2 and D3 are closed. F8 and the
one-width word line are clean.

## 0. Evidence pack

All 20 before/after pairs differ (md5 checked), so r6c's P1 is closed. The "before" is `b25479c5`, and it matches the true
before r6c rendered itself: the overflowing A | B panels and the doubled story.

## 1. Score table (after; caps applied)

| Page set | C1 | C2 | C3 | C4 | Before C1/C2/C3/C4 | vs before | Pass |
|---|---|---|---|---|---|---|---|
| sub_1m_no_regroup RI M (+ key) | 8 | 8 | 8 | 8 | 4/4/3/4 (digits run over the panel borders and out of the cell; doubled answer) | better | PASS |
| sub_100k_no_regroup RI L (+ key) | 8 | 8 | 8 | 8 | 4/4/3/4 (same overflow) | better | PASS |
| sub_word_problems RI S (+ key) | 8 | 7* | 6* | 8 | 3/4/3/4 (story printed twice, overlapping, cut at the page edge) | better | PASS on counted; pre-existing E1/E2 hold it under 8 |
| sub_word_problems RI L (+ key) | 8 | 7* | **5** | 8 | 3/4/3/4 (same) | better | **FAIL (D1)** |
| add_word_problems RI M (+ key) | 8 | 8 | 6* | 8 | 3/4/3/4 (same) | better | PASS on counted; pre-existing E2 caps C3 |
| add_facts RI M (control, F8) | 8 | 8 | 8 | 8 | 6/8/8/8 (circle + "__ is correct." doubled the choice, H16) | better | PASS |
| identify RI M (+ key) | 8 | 8 | 8 | 8 | 4/8/8/8 (key "hundreds" ran past its 2-digit line, over the full stop; H16 doubled answer) | better | PASS |
| identify RI L (+ key) | 8 | 8 | 8 | 8 | 6/8/8/8 (H16 doubled answer) | better | PASS |
| identify TF M (+ key) | 8 | 8 | 8 | 8 | 5/8/8/8 (key "hundreds" overprinted "is" and the line) | better | PASS |
| fact_family_sort TF M (+ key) | 8 | 8 | 8 | 8 | 7/7/8/8 ("yes" on a short line: the line was the key's width) | better | PASS |

\* Caps or deductions from pre-existing defects (section 3), the same before and after. They are not counted against this
change. Without them, sub_wp S and add_wp M are 8/8/8/8, and sub_wp L is 8/8/5/8: it fails on D1 alone.

Measured empty bands inside the first cell (ink rows, x 53-747 px at 3.81 px/mm). The largest band is 20 % of the cell
height everywhere, so no H13:
- sub_1m M: 15 % above the panels, 20 % under the response.
- sub_100k L: 10 % / 15 %.
- sub_wp S: 10 % / 12 %.
- add_wp M: 6 % / 6 %.
- sub_wp L: 20 % / 20 % (142 px each, in a 705 px lone cell).

## 2. Counted defects

| Id | Severity | Page and place | Rule | Automatic check that would catch it |
|---|---|---|---|---|
| D1 (r6c D1, still open) | counted | **sub_word_problems Reason It L: one item a page** (Score /1, pupil and key). PT-RSN-1 allows 2 at L. Before also held 2, but it overflowed, so the loss is the honest result of the current geometry and was not caused by a shrink. It is still a lone item (H5). The room is there. Each panel spends a 12 mm band (432 to 478 px) on the "A"/"B" tag alone, above the sign row, and the sign row already starts where the tag ends (x 92). The key's choice ring is about 14 mm tall. The item measures about 117 mm against the 113.5 mm L cell: drawn ink is 102 mm, plus the tab, plus the ring. If the tag shares the sign row's line (about -10 mm), 2 items fit at L with nothing shrunk. That helps every word-story and stack panel (sub_1m M spends the same 16 mm above its place-value headers). | H5 (C3 ≤ 5); PT-RSN-1 capacity | `ws-capacity-pin` reads only redesign-passed skills plus ruled pages, so it never saw this page. The fix: precritic `--role reason-it` FAILs any page whose `perPage` is 1 while the role's ceiling at that size is 2 or more, for every skill in the lane's scope, not only passed skills (r6c proposed this; it is not on the path). Second check: `ws-empty-band` EB-PANELHEAD flags a panel whose first content row starts more than 6 mm under its top border. |

## 3. Pre-existing defects (identical before and after; not counted)

| Id | Severity | Page and place | Rule | Automatic check |
|---|---|---|---|---|
| E1 | counted (pre-existing) | **A NUMBER answer's line is sized from the correct answer's digit count** (`answerPlace` `width()`: min 2, max 6, from `correct`). In Reason It the pupil sees both candidates, so the line tells which one fits. sub_wp S/L item 1: A = 141, B = 29, and the line holds 2 digits (52 px, about 14 mm; a 3-digit line would be about 20 mm), so 141 visibly does not fit. Change 3 fixed this tell for WORD answers only. LINE-TELL tests only words. | RUBRIC C2 "nothing gives the answer away"; LESSONS_LEARNED L3 ("slot widths from the widest possible answer") | `ws-roles-unit` LINE-TELL extended: for Reason It (and TF/EA), the line width = max(digits(correct), digits(wrong)), or one width for the page; a planted 29 vs 141 item must get a 3-digit line. |
| E2 | counted (pre-existing; r6c E2) | Word-story panels (sub_wp S/L, add_wp M) print the unit bank ("days / pencils / boxes") beside an answer line that already reads the unit. Empty carry/exchange boxes show on no-regroup work (add_wp item 1 A: 3 empty, B: 2 empty; sub_wp S item 2 B: 2 empty). These parts are dead in a finished solution. | H15 (C3 ≤ 6) | `ws-cell-checks` DEAD-PART on `state: answered` panels. |
| E3 | nit (pre-existing; r6c E3) | sub_1m M item 1 distractor 321,265 is a one-digit slip, not a named misconception. | PEDAGOGY misconception rule | `ws-roles-unit` RI-MISCONCEPTION. |
| E4 | nit (pre-existing) | Keys write a 5-6 digit answer without its comma ("321235", "41155", "23471"), while the panels and the place-value headers print "321,235". | Key = facsimile of the pupil's form (AK) | `ws-cell-checks` KEYFORMAT: a key value of 4+ digits is written in the item's own grouping. |
| E5 | nit (pre-existing; lane R5) | TF: True items keep an empty "The answer is ____ ." line, which the key leaves blank (identify TF items 1, 2, 5; fact_family_sort items 3, 4). | PT-TOF frame rule | Open on the lane's list as R5. |
| E6 | nit (pre-existing) | fact_family_sort TF M and identify RI L leave about 43 mm of white under the grid (page about 78 % used; not H5). | C3 "full but not crowded" | `ws-empty-band` page-foot band. |

## 4. Nits (introduced by the change; do not lower a score below 8)

| Id | Page and place | Note | Check |
|---|---|---|---|
| N1 | Every "under" page (sub_1m M, sub_100k L, sub_wp S/L, add_wp M): the response row is left-aligned, so the "B" choice letter (x 175 px) sits under panel A, and panel B starts at x 409. The row reads naturally as one sentence ("A  B  The answer is __ ."), but a pupil circling B circles a letter under panel A. Centring the row, or putting A under A and B under B, would tie each letter to its panel. | PT-RSN-4 (spatial proximity of choice and panel) | RI-LAYOUT: in the under layout, each choice letter's x lies within its own panel's span, or the row is centred. |
| N2 | sub_wp L (lone cell): the A/B block centres in the space under the story (`margin-top:auto` in the under layout), so the story sits 37 mm above its own work, with 37 mm of white under the response. This disappears once D1 is fixed (2 cells). On S the gap is 12 mm and on add_wp M it is 7 mm. | CL-4b (the work follows its problem) | RI-LAYOUT: a column story and its panels are adjacent (gap ≤ 6 mm). |
| N3 | identify RI M/L: the word line drops to its own row under "The answer is", with the full stop hanging after it. This is legible and declared in the brief. | - | - |

## 5. Answers to the brief's specific questions

- **Does any page lose an item it held before without the before overflowing?** No. sub_wp L went from 2 to 1, but its
  before overflowed (story doubled and cut off, digits out of the panels). sub_1m M went from 3 to 2, its before overflowed,
  and it is ruled in `capacity.json`. Every other page keeps its count: sub_100k L 2, sub_wp S 2, add_wp M 2, add_facts M 3,
  identify M 3 and L 2, identify TF 6, fact_family_sort TF 4. sub_wp L still breaks H5 (D1).
- **Does the response row read naturally under the panels?** Yes. "A  B  The answer is ____ ." is one row, the full width
  of the cell, 7-9 mm under the panels. The keys ring the letter and write the value in key ink on the same row. See N1 for
  the letter placement.
- **Is anything still overflowing or clipped?** No, on every after page, pupil and key. Every digit sits in its own box
  inside its panel. The story prints once, inside the cell. The keys' "hundreds" fits its line (identify RI M/L, identify TF).
- **Does any line length give away an answer?** Not for word answers any more: every word gets the same 6-digit line, and
  on fact_family_sort "yes" and "no" share one width. NUMBER answers still do (E1, pre-existing): on sub_wp S/L item 1 the
  2-digit line rules out 141.
- **D2 / D3 (r6c).** Closed. No page in scope stacks A over B. Work of 58-59 mm (7-digit and 5-digit stacks, the 2-digit
  story) now stands side by side at half the cell. F8: "__ is correct." is gone from every Reason It page and key.

## 6. What is right

- The three-layout rule (beside / under / stacked) puts every page in scope in a side-by-side layout. No digit is shrunk.
- The story prints once, over both panels, with no overlap. The keys are facsimiles: ring plus value in INK-31 key ink. All
  10 keyed Reason It answers check out (321235, 613312, 41155, 23471, 29, 46, 27, 99, 6/16/7, hundreds/ones/tens).
- The F8 frame removes the doubled answer (former H16) on every Reason It page, including the control add_facts M.
- The word-answer line is one width, and the key's "hundreds" now fits it on RI and TF.
