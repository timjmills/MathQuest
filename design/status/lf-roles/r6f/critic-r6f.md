# Critic r6f - lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `39213c4b` (change `7b33c7e3`, one file:
`js/modules/sheet/roles/reason-it.js`). Before = `c5235768`. Narrow round: `patterns:number_patterns_rule` Reason It at
S, M and L, pupil and key. Graded against `design/audit/RUBRIC.md` (C1-C4, H caps), `design/PAGE_TYPES.md` PT-RSN-1 and
PT-RSN-4 (a list answer prints no answer frame, PT-TOF-4 extended), with r6e for context.

**Verdict: FAIL.** One counted defect: at S each cell leaves a 33 % empty band under its work (H13, C3 ≤ 6). M and L pass.
The change itself is a clear improvement. The overflow that made every before page unreadable is gone at every size.

## 0. Evidence pack and checks

- 12 PNGs (S/M/L × pupil/key × before/after), one A4 page each, at 3.81 px/mm.
- Before: the A / B count rows ran out of their 62 mm panels and overlapped each other and the cell edge at every size
  (H2, C1 ≤ 4). S held 4 items, M 3 and L 2, but none of them could be read.
- After: the work stacks, with A over B, both panels 137 mm wide, top-aligned. The response column holds only the letters
  "A  B". There is no answer frame (PT-RSN-4, list answer). S, M and L each hold 2 items.
- `node tests/scripts/ws-roles-unit.mjs`: OK (78 checks).
- **Key arithmetic, checked by hand:**
  - Item 1, rule "add 10" from 9: 9, 19, 29, **39**, 49, 59, 69, 79. A is right. B differs only in term 4 (30 for 39).
    The key rings **A**. Correct.
  - Item 2, rule "subtract 4" from 30: 30, 26, 22, **18**, 14, 10, 6, 2. B is right. A differs only in term 4 (26 for 18).
    The key rings **B**. Correct.
  - A and B differ in exactly one term in both items. The correct letter alternates A, B. The items and the rings are
    the same at S, M and L.
  - Both wrong terms are named errors:
    - Item 1 is `counted-by-one`: 29 + 1 = 30.
    - Item 2 is `wrong-direction`: 22 + 4 = 26 where the rule says subtract.

## 1. Score table (after; caps applied)

| Size | Items before → after (PT-RSN-1 ceiling) | C1 | C2 | C3 | C4 | vs before | Pass |
|---|---|---|---|---|---|---|---|
| S (pupil + key) | 4 (overflowing) → 2 (4) | 8 | 8 | **6** (H13) | 8 | better (readable; was C1 ≤ 4) | **FAIL** |
| M (pupil + key) | 3 (overflowing) → 2 (3) | 8 | 8 | 8 | 8 | better | PASS |
| L (pupil + key) | 2 (overflowing) → 2 (2) | 8 | 8 | 8 | 8 | better | PASS |

**Measured empty band per cell.** These are ink rows between x 70 and 745 px. Each band is shown as a share of the
numbered cell:

| Size | Cell height | Item ink rows | Largest band (under panel B) |
|---|---|---|---|
| S | 426 px | 206-470 | 142 px = 37 mm = **33 %** |
| M | 433 px | 206-500 | 119 px = 31 mm = 27 % |
| L | 431 px | 192-534 | 87 px = 23 mm = 20 % |

## 2. Counted defects

| Id | Page / place | Rule | Automatic check that would catch it |
|---|---|---|---|
| F1 | S pupil and key, both cells. A 37 mm empty band (33 % of the cell) lies under panel B. There is nothing to write there: the pupil circles a letter in the right column, so the CL-4b "writing room under a top cell" exemption does not apply. S prints the same 2 items and the same grid as M and L (LESSONS_LEARNED L1, "Size S ignored"). | H13 (C3 ≤ 6); L1 | precritic `--role reason-it --strict` should run the H13 band measure on kit Reason It pages at every size. It should not exempt the white under a top-aligned cell whose response sits beside the work (no write-under slot). Add the L1 `--sizes` assertion too: perPage(S) > perPage(L) whenever the S ceiling is higher. |

**Is 2 a page at S a real H5 or capacity defect?** It is not H5. The page is not a lone item, and its ink covers about
62 % of the page body, which is more than 50 %. The 2 is also honest for the drawing as it stands:

- One item at S needs about 77 mm. That is 20 px of tab and label above the panels, 264 px of panels, and the padding.
- The page body is 224 mm, and 3 × 77 = 230 mm, so a third item misses by about 6 mm.
- The item is taller than one 57 mm S row, so the layout gives it two rows. That gives 2 cells of 112 mm each. The block
  is top-aligned (`margin-top:0`), so all the slack falls into one band at the foot. That band is F1.

So the defect is the item's chrome, not the count rule. Another lane reports 3 a page at S (G3), but that is the
Independent preset with one train per item. It is not a like-for-like comparison, although it does show the train itself
fits.

**What would fit 3 at S without shrinking content.** Each panel spends a 10 mm band (38 px, from panel top to term top)
on its "A" or "B" tag alone.

- Set the tag inline, left of the train. The train spans x 91-553 inside a 62-583 panel, so a 30 px tag fits if the
  train starts about 10 px later.
- That saves about 8-9 mm per panel and about 17 mm per item, so one item takes about 60 mm.
- 3 × 60 = 180 mm, which fits the 224 mm body at S. A fourth does not fit (240 mm).
- The same change at M (about 65 mm per item) fits **3 at M**, which is M's ceiling.
- If the tag band stays, trimming 6 mm of padding (the 3 mm gap between the panels, the cell's top and bottom pads) would
  just reach 3 at S, with no slack.

Either way the digits, the term boxes and the rule box keep their size.

## 3. Pre-existing (not counted; same before and after)

| Id | Severity | Place | Rule | Automatic check |
|---|---|---|---|---|
| P1 | nit | The wrong term is always the first pupil-written term (term 4) on both items. `rowWrongs` and the number-pattern wrongs place `skipped-multiple`, `counted-by-one` and `wrong-direction` at blank 0. Across a page, a pupil can learn to check only the fourth box. | PEDAGOGY misconception rule (no fixed tell) | `ws-roles-unit` RI-WRONGPOS: over a seeded page, the wrong slot index is not constant when the item has more than one blank |
| P2 | nit | A single-term error that does not carry through (29, 30, 49 …) is easy to spot and less realistic than a carried slip (30, 40, 50 …). This is kept because the brief requires A and B to differ by exactly one term. Noted, not scored. | - | - |

## 4. Nits introduced or left by the change (none lowers a score below 8)

| Id | Place | Note | Check |
|---|---|---|---|
| N1 | All sizes | The panels stand A over B, but the response letters run side by side ("A  B") at the top right, level with panel A. The letter B sits beside panel A, not panel B. The panels carry their own tags, so this does not confuse, but stacking the letters (A beside panel A, B beside panel B) would match the work. It would also use the empty right column. | the proposed RI-LAYOUT check (r6e N1): each choice letter's centre is nearer its own panel |
| N2 | M | The band is 27 %, under the H13 line but close to it, with 2 of a ceiling of 3. The F1 tag fix would also bring M to 3. | same as F1 |
| N3 | L | The term boxes stay about 52 px wide at every size while the digits grow, so at L the boxes are close together (7 px apart). The right column is wide enough to give the train more width at L. This is readable, not crowded past the rule. | L1 `--sizes`: the drawing scales with `ctx.metrics` |

## 5. What is right

- The overflow is closed at every size. Every term and every rule box sits inside its panel, and every panel sits inside
  its cell. No digit is clipped.
- A list answer prints no answer frame. The cell asks only "Circle A or B", which PT-RSN-4 and PT-TOF-4 require for a list.
- The keys are facsimiles: the same page with a ring on the correct letter. Both rings are right, and they alternate A, B.
- Given terms (thin box) and written terms (heavy box) are told apart in black and white at every size.
- The change touched one file and reports no change on any passed Reason It page.

## 6. Automatic checks this round names

- F1: an H13 band measure on kit Reason It pages, with no top-cell exemption when the response is beside the work, plus
  the L1 `--sizes` perPage assertion. Neither is on precritic's path for this role today, because 2 at S passed.
- P1: `ws-roles-unit` RI-WRONGPOS.
- N1: RI-LAYOUT, still proposed from r6e.
