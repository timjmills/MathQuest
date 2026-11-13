# Critic r6g - lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `88e037f2` (change `87b0c18c`: stacked Reason It
panels carry their A / B tag in a left gutter at S / M). Before = `39213c4b` (what r6f graded). Narrow re-grade of r6f F1:
`patterns:number_patterns_rule` Reason It at S and M, pupil and key. L is out of scope (unchanged, passed in r6f).
Graded against `design/audit/RUBRIC.md` (C1-C4, H caps) and `design/PAGE_TYPES.md` PT-RSN-1 / PT-RSN-4.

**Verdict: PASS.** No counted defect. F1 is closed: the largest band under the work is 23 % at S (was 33 %) and 12 % at M
(was 27 %), and both sizes now print 3 items a page (was 2).

## 0. Evidence and checks

- 8 PNGs (S/M x pupil/key x before/after), one A4 page each, 800 x 1191 px (3.81 px/mm).
- `node tests/scripts/ws-roles-unit.mjs`: OK (78 checks).
- Pupil vs key pixel diff (after, S and M): the only differing rows are the header label ("Name" / "Answer Key"), the three
  rings (rows 205-259, 495-549, 785-839, all in the response column) and the footer ("Key ·"). The key is a facsimile.

## 1. Measurements (after)

Cell dividers at y 186, 476, 766, 1056 at both sizes: three cells of 290 px (76 mm).

| Size | Item ink (cell 1) | Band under the work | Share of cell | before |
|---|---|---|---|---|
| S | 206-409 | 410-475 = 66 px = 17 mm | **23 %** | 33 % (2 a page) |
| M | 187-439 | 440-475 = 36 px = 9 mm | **12 %** | 27 % (2 a page) |

Cells 2 and 3 measure the same (S 66 px, M 36 px). No band reaches 30 %.

**Tag gutter.** At every panel (6 per page, S and M, pupil and key) the tag box spans x 62-92 and the first term box
starts at x 104: a clear gap of 11-12 px (about 3 mm). The tag never touches or overlaps a term box (zoomed crops checked).
The tag sits in the panel's top-left corner, level with the train, inside the panel border.

**Clipping.** Every term box, rule box, tag and response letter sits inside its panel and cell; the last cell's work ends
at y 989 (S) / 1020 (M) above the cell foot at 1056. Nothing is clipped.

## 2. Key arithmetic (checked by hand; same items and rings at S and M)

| Item | Rule | Correct train | A | B | Differs | Key rings |
|---|---|---|---|---|---|---|
| 1 | add 10 from 9 | 9, 19, 29, 39, 49, 59, 69, 79 | correct | term 4 = 30 (counted-by-one: 29 + 1) | 1 term | **A** - right |
| 2 | subtract 4 from 30 | 30, 26, 22, 18, 14, 10, 6, 2 | correct | term 4 = 26 (wrong-direction: 22 + 4) | 1 term | **A** - right |
| 3 (new) | multiply by 2 from 1 | 1, 2, 4, 8, 16, 32 | term 4 = 4 (repeated the last term) | correct | 1 term | **B** - right |

A and B differ by exactly one term in every item. Item 2's correct letter moved from B (before) to A (after); the letter
placement is reseeded per page, which is fine (pattern A, A, B; no fixed tell).

## 3. Score table (after; caps applied)

| Size | Items before -> after (PT-RSN-1 ceiling) | C1 | C2 | C3 | C4 | vs before | Pass |
|---|---|---|---|---|---|---|---|
| S (pupil + key) | 2 -> 3 (4) | 8 | 8 | 8 | 8 | better (C3 6 -> 8, +1 item) | PASS |
| M (pupil + key) | 2 -> 3 (3) | 8 | 8 | 8 | 8 | better (at ceiling, band 27 % -> 12 %) | PASS |

## 4. Counted defects

None.

## 5. Nits (not counted; none lowers a score below 8)

| Id | Place | Note | Automatic check |
|---|---|---|---|
| N1 | S vs M | S and M now print the same 3 items with nearly the same geometry; S differs only by slightly smaller digits. A 4th S item misses by about 7 mm (4 x ~59 mm work + pads vs the 228 mm body), so 3 is honest, and perPage(S) 3 > perPage(L) 2 holds. Trimming the cell pads by ~2 mm each would reach S's ceiling of 4. | L1 `--sizes`: report when perPage(S) == perPage(M) while S's ceiling is higher, with the shortfall in mm |
| N2 | all items | (carried from r6f N1) The response letters run side by side "A  B" level with panel A; letter B is not beside panel B. | RI-LAYOUT (proposed r6e) |

## 6. Pre-existing (same before and after, not counted)

| Id | Place | Rule | Automatic check |
|---|---|---|---|
| P1 | all 3 items | The wrong term is again the first pupil-written term (term 4) in the new item 3 too: 3 of 3 on the page. A pupil can learn to check only the fourth box. | `ws-roles-unit` RI-WRONGPOS (proposed r6f): over a seeded page the wrong slot index is not constant |
| P2 | items 1-2 | A single-term slip that does not carry through is less realistic than a carried one; kept because the brief requires a one-term difference. | - |

## 7. Automatic checks this round names

- The fix is covered by `ws-empty-band` EB-BAND (reported 0 by the lane) and the L1 `--sizes` assertion; add the
  tag-gutter clearance (tag right edge < first term left edge - 2 mm) to the RI cell-checks so a later change that widens
  the train cannot push the first box under the tag.
- N1: L1 `--sizes` S == M report. P1: RI-WRONGPOS, still proposed.
