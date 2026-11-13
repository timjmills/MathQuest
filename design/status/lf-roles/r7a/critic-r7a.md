# Critic r7a - lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `b90990eb3` (change `cec8a53ce`: an Error Analysis
redo item stands its Correct / Fix it judgement against the cell's right padding; a widened redo work starts at the left).
Before = `244849a9c` (master's role code). Narrow round: `patterns:number_patterns_rule` Error Analysis at S, M, L, pupil and
key. Graded against `design/audit/RUBRIC.md` (C1-C4) and `design/PAGE_TYPES.md` 2.7 (PT-ERR-1 to PT-ERR-4).
Scope note: RUBRIC's 2026-09-26 scope note keeps Find the mistake out of a skill's pass bar; this round grades the role at
the lead's request, the 8 bar applied as usual.

**Verdict: PASS.** No counted defect. The judgement now starts at one x (579 px) in every cell at every size; at S it was
at two different x's before (555 px beside the 8-term trains, 321 px beside the 4-term train of item 3).

## 0. Evidence and checks

- 12 PNGs (S/M/L x pupil/key x before/after), one A4 page each, 800 x 1191 px (3.81 px/mm).
- `node tests/scripts/ws-roles-unit.mjs`: OK (80 checks).
- `node tests/scripts/ws-cell-checks.cjs --skills patterns:number_patterns_rule --roles error-analysis --size S,M,L`:
  OK (3 pages, no finding; includes EA-ROWX, EA-PAD, PUPILTAG, OVERFLOW, KEYFIT).
- Pupil pages carry no key ink (red-pixel count 0 at S, M, L before and after); key pages differ from the pupil page only
  in the header label, the ticks, the filled copies and the "Key ·" footer: a facsimile.
- Code diff `244849a9c..HEAD -- js/modules/sheet`: `roles/error-analysis.js` only, +8 / -2.

## 1. Measurements (after; pixel scan of every cell)

| Size | Judgement checkbox left x, every cell | before | Original train left x | Copy train left x |
|---|---|---|---|---|
| S | 579, 579, 579 | 555, 555, **321** | 62 | 62 |
| M | 579, 579, 579 | 555, 555, 555 | 62 | 62 |
| L | 579, 579 | 555, 555 | 62 | 62 |

- Judgement x is one value per page and the same at every size. At M and L the column moved 24 px (6 mm) right, to the cell's
  right padding; the gap from the 8-term train's last box (x 524) to the box is 55 px (14 mm): clearly its own column, still
  level with the original train (box tops 252 vs train top 249 at S).
- Original and copy trains start at x 62 in every cell (change 2 shows nothing here, as the brief said: no widened redo).
- Label "<Name> wrote:" to the top of its train: about 9 px (2.4 mm) at S, 8 px (2.1 mm) at M, 10 px (2.6 mm) at L; the
  "Fix it: write it again." label sits the same distance over its copy. Within 2-4 mm.
- Nothing clipped: every term box, rule box, label and judgement sits inside its cell; the last cell's content ends at
  y 1007 (S) / 1023 (M) / 969 (L) above the cell foot at 1056.

## 2. Key arithmetic (checked by hand)

| Size | Item | Rule | Correct terms | Pupil wrote | Errors | Key tick / copy |
|---|---|---|---|---|---|---|
| S | 1 | add 3 from 8 | 8 11 14 17 20 23 26 29 | term 4 = 20 (added 3 twice) | 1 | Fix it; copy 17 20 23 26 29, rule 3 - right |
| S | 2 | subtract 3 from 86 | 86 83 80 77 74 71 68 65 | term 4 = 83 (wrong direction, 80 + 3) | 1 | Fix it; copy 77 74 71 68 65, rule 3 - right |
| S | 3 | divide by 2 from 8 | 8 4 2 1 | 1, rule 2 | 0 | Correct; copy left empty (PT-ERR-2) - right |
| M | 1 | add 3 from 8 | as S 1 | term 4 = 20 | 1 | Fix it; copy right |
| M | 2 | subtract 3 from 86 | as S 2 | all right, rule 3 | 0 | Correct - right |
| M | 3 | add 3 from 4 | 4 7 10 13 16 19 22 25 | term 4 = 16 (added 3 twice) | 1 | Fix it; copy 13 16 19 22 25, rule 3 - right |
| L | 1 | add 3 from 8 | as S 1 | term 4 = 20 | 1 | Fix it; copy right |
| L | 2 | subtract 3 from 86 | as S 2 | all right | 0 | Correct - right |

Every wrong item has exactly one error, and every key tick and copy is right.

## 3. Score table (after)

| Size | C1 | C2 | C3 | C4 | vs before | Pass |
|---|---|---|---|---|---|---|
| S (pupil + key) | 8 | 8 | 8 | 8 | better (C3: judgement no longer jumps 61 mm left in item 3; one column per page, AX-4) | PASS |
| M (pupil + key) | 8 | 8 | 8 | 8 | same (column already aligned; moved 6 mm right to the padding) | PASS |
| L (pupil + key) | 8 | 8 | 8 | 8 | same (as M) | PASS |

## 4. Counted defects

None.

## 5. Nits (not counted)

| Id | Place | Note | Automatic check |
|---|---|---|---|
| N1 | S item 3 | Beside a 4-term train the judgement stands 76 mm away from the work (x 290 -> 579). The one-column rule wins and the row still reads as one item, but a pupil's eye travels far. | EA-ROWX already pins the x; a report-only "judgement gap > 50 mm" line in ws-cell-checks would flag it if a later lane wants it tighter |

## 6. Pre-existing (same before and after, not counted)

| Id | Place | Rule | Automatic check |
|---|---|---|---|
| P1 | S, M: 3 items a page | PT-ERR-3 offers counts 2, 4 or 6; 3 is not one of them, and with 3 items 2 wrong = 67 % breaks PT-ERR-1 (40-60 %). L (2 items, 1 wrong = 50 %) is fine. | `ws-roles-unit` EA-COUNT: plan count in {2,4,6} and wrong share in [0.4, 0.6] |
| P2 | every wrong item, S/M/L | The wrong term is always term 4 (the first pupil-written term); at M items 1 and 3 are the same rule (add 3) and the same slip (added 3 twice). A pupil can learn to look only at term 4. Same class as r6g P1. | RI-WRONGPOS (proposed r6f) extended to Error Analysis: wrong slot index not constant over a seeded page; no two items share rule and slip |
| P3 | L, both cells | About 16 mm empty above the "Sam wrote:" label and about 20 mm under the copy's rule row in each cell; the work does not sit in the top of the cell. C3 holds at 8. | `ws-empty-band` EB-BAND on the error-analysis role at L |
| P4 | all sizes | Items 1 and 2 use the same two names ("Sam", "Ana") at every size, and M repeats "Sam". Cosmetic. | - |

## 7. Automatic checks this round names

- The fix is on `ws-cell-checks` EA-ROWX (green here, backtested by the lane in `b90990eb3`).
- P1: EA-COUNT in `ws-roles-unit` (count and wrong-share against PT-ERR-1 / PT-ERR-3).
- P2: RI-WRONGPOS extended to Error Analysis.
- P3: EB-BAND on error-analysis at L.
