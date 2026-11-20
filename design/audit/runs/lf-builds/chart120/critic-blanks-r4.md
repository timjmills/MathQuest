# chart_to_120 / hundreds_chart_fill — narrow independent critic r4: "chart blanks" (the one round after the round-cap stop)

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `1ab2801ef`. The critic changed no code.
- **How it was rendered:**
  - `tests/lib/ws-harness.cjs` `open()` under `tests/scripts/mq-browser-run.sh` called `window.buildSheet({role:'lesson', …, key:true})`, then `sheetDocument` for the pupil pages and the key. Each `.ws-page` was shot. 0 console errors.
  - chart_to_120 lesson at M and L, seeds 1, 4242 and 777. hundreds_chart_fill (band 100) lesson at M, seed 4242.
  - Every `table.k2-chart` was read from the rendered pupil and key pages. Machine checks run on that data:
    - key arithmetic: 222 pupil-window key cells, **0 wrong**. Every printed square equals base + 10·row + col.
    - cross-window giveaway (pupil vs pupil, and the anchor's window vs every pupil gap): **0**.
    - identical pupil windows: **0**.
    - step cover: every gap has a printed left neighbour, a printed square above, or (top row) a printed square below. **0** right-only gaps.
    - answer reuse: how many answers on a page were already answered in an earlier pupil window of the packet (see F1 and F2).
  - Comparison: hcf band 100 at `09c4c80fe` (before the fix) was dealt the same way, to see what the r4 deal changed.
- **PNGs:** `blanks-r5/` (list at the end).

## Verdict: **FAIL**

| Page | Result |
|---|---|
| chart_to_120 lesson at L | passes |
| chart_to_120 p3 practice page (the new rows-of-ten page), M and L | passes |
| chart_to_120 teaching sheet (p2) at M | **fails C2** (F1) |
| hundreds_chart_fill band-100 practice page (p3), M, seed 4242 | **fails C2 and C3** (F2) |

## r2 findings: closed?

| r2 | Status | Evidence |
|---|---|---|
| R2-1: practice windows copy earlier windows; one answer set fills the packet | **closed on the c120 practice page. Open on the c120 teaching sheet at M and on hcf band 100 (in a new form).** | The c120 p3 practice page is three different rows of ten. Its share of reused answers: 3/24 at seed 4242, 3/24 at seed 777 and 6/26 at seed 1, all at M. The open parts are F1 and F2. |
| R2-1: crossing never in play | **closed** | A pupil gap among 100, 101, 110 and 111 is in every packet: seed 1 (100, 110, 111), seed 4242 (100, 110), seed 777 (100, 110 at M; 100 at L). |
| R2-2: a gap no printed step solves | **closed** | 0 gaps whose only printed neighbour is to the right, on every page with a Steps band. No blank first column on a teaching sheet. |
| n2: practice-page seed | **open** (builder note 3, below) | p3 footer: seed 12161 (4242 packet), 7920 (seed 1), 8696 (seed 777, key). |
| n1: numeral baseline | **open** (not scored) | 62/63, 37/40 and 67/69 sit about 2 px off their row-mates (`c120-lesson-M-p3-s4242.png`). |
| n3: step range wording | **open** (not scored) | At seed 1 the anchor reads "From 91 to 100" over a window that starts at 95. |

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page | M | L | Pass |
|---|---|---|---|
| c120 p1 anchor (Model), seeds 1/4242/777 | 9·8·8·9 | 9·8·8·9 | yes |
| c120 p2 teaching sheet, seed 1 | 8·7·8·8 | 8·8·8·8 | **no (M)** |
| c120 p2 teaching sheet, seeds 4242 / 777 | 8·**7**·8·8 | 8·8·8·8 | **no (M)** |
| c120 p3 practice (three rows of ten), seeds 1/4242/777 | 9·8·9·9 | 9·8·9·9 | yes |
| c120 keys p1–p3 | 9·9·9·9 | 9·9·9·9 | yes |
| hcf100 p1 anchor, seed 4242 | 9·8·8·9 | — | yes |
| hcf100 p2 teaching sheet, seed 4242 | 8·8·8·8 | — | yes |
| hcf100 p3 practice, seed 4242 | 8·**6**·**7**·8 | — | **no** |
| hcf100 keys | 9·9·9·9 | — | yes |

What is right:
- Every key value is correct, and the keys are facsimiles.
- No giveaway inside a packet, and no verbatim twin.
- Blank counts are right:
  - c120 Guided and Independent hold 3 (N=3);
  - the rows-of-ten grids hold 6–9 blanks out of 30, scattered in grids 2 and 3;
  - hcf windows hold 5.
- The c120 practice page fills the page at M and L. The Score total equals the answer places: /24 or /26 at M, /24 at L.
- The oral frame "Say: The missing numbers are …" names exactly the anchor's gaps. The steps are words a Grade 1 ELL pupil can follow.

## Findings

### F1: the c120 teaching sheet at M deals Guided and both Independent windows the same answer column (C2 7)

- **Where:**
  - `c120-lesson-M-p2-s4242.png`: Guided 92–116, Independent 3 (95–119) and Independent 4 (94–118) all answer **96, 106, 116**.
  - `c120-lesson-M-p2-s777.png`: the same three answers.
  - `c120-lesson-M-p2-s1.png`: two of the three windows answer 94, 104, 114.
- **The problem:**
  - The squares differ, so LESSON-TWIN passes. The packet-wide ANSWER-VARIETY is exactly one half (3 of 6), not more than half, so it passes too.
  - The pupil still writes the same three numbers three times running.
  - Independent Practice adds nothing the Guided window did not already answer, and the Score /8 counts copied marks. This is the r2 judgement for N=3 band-120 windows: "one column a window means a shared column is the whole item."
  - The rows-of-ten grid 1 on p3 must then blank those values again, because the no-giveaway rule forces it. So 96/106/116 is written 4 times in the packet at seeds 4242 and 777.
- **Root cause:**
  - The anchor prints columns 0–4 (91–95 …).
  - Each 3 × 5 teaching window that reaches column 5 must blank all of column 5 to stay consistent with the Guided window. With N=3, that whole column is the item.
  - The dealer places all three windows over column 5.
- **Fix, any one of these:**
  - Deal the band-120 teaching sheet's pupil windows so that no two share their whole answer set. For example, place Independent 3 and 4 so that each holds a different free column (97, 98, 99 or 100), not column 5 again.
  - If no such placement exists, print one Independent window, or reuse the p3 rows-of-ten form for Independent.
- **Automatic check:** **SHEET-ANSWER-SET**, in `ws-guided-echo` beside ANSWER-VARIETY. On any lesson sheet with 2 or more pupil windows, no two windows share the same sorted answer set.
  - Also lower the packet ANSWER-VARIETY threshold from "more than half" to "half or more".
  - Fail side: `1ab2801ef`, c120 lesson M, seeds 4242 and 777 (p2 windows 1–3) and seed 1 (p2 windows 1–2).

### F2: the hcf band-100 practice page re-asks 13 of its 15 answers, item 3 is a shifted copy of a Guided window, and a third of the page is empty (C2 6, C3 7)

- **Where:** `hcf100-lesson-M-p2-s4242.png` and `hcf100-lesson-M-p3-s4242.png`.
- **Shifted copy (a near-twin):**
  - p3 item 3 covers 1–25 with gaps **3, 13, 15, 23, 25**.
  - p2 Guided window 1 covers 2–26 with the same gaps, **3, 13, 15, 23, 25**.
  - They share 4 of 5 columns, with the same blanks in every shared square.
  - LESSON-TWIN misses it because it compares whole windows only.
- **Answer reuse:**
  - p3 item 2 (41–65) asks 43, 45, 55, 62 and 64. The pupil has already written all five: 43, 45 and 55 in p2 item 4, and 55, 62 and 64 in p2 Guided 2.
  - p3 item 1 asks 62, 64 and 75 again.
  - Only 82 and 86 on the whole page are new.
  - The cause is that overlapping windows must blank the same squares (the no-giveaway rule), and the dealer now prefers overlapping windows.
- **Density:**
  - The page prints 3 windows (/15). The bottom ~35 % of the body is empty.
  - At `09c4c80fe` this seed printed 6 windows, but with verbatim twins. The twin rule removed them and nothing replaced them.
  - Seed 1 (corroboration only, not graded) prints 6, but 3–27, 4–28 and 6–30 again share 4 of 5 answers.
- **Fix:**
  - Deal lesson practice windows on band 100 from squares that **no earlier pupil window touches**, wherever the chart has room. 100 squares hold six disjoint 3 × 5 windows beside the anchor and the 4 teaching windows only if the teaching windows are spread out too.
  - Otherwise allow an overlap of at most one column, and cap reused answers.
  - If the page still falls short of 5–6 windows, fill it with a rows-of-ten grid (the c120 r4 form) on the free decades, not with empty space.
- **Automatic checks:**
  - **ANSWER-REUSE** (`ws-guided-echo`, lesson packet): at most one third of a practice page's answers may already be answers of earlier pupil windows in the packet.
    - Fail side: `1ab2801ef` hcf M, seed 4242, p3: 13/15.
    - Pass side today: c120 p3, 3–6 out of 24–26.
  - **NEAR-TWIN**: no two pupil windows in a packet share 60 % or more of their squares while having the same gaps in the shared squares.
    - Fail side: `1ab2801ef` hcf M, seed 4242, p3 item 3 against p2 Guided 1.
  - **LESSON-EMPTY-BAND** on the practice page: windows printed must be at least the page's capacity minus 1 (here 3 of 6 fails).

## Builder's open notes: judgement

1. **No Steps strip on the c120 practice page.**
   - Acceptable for the practice page, where hint scaffolds may fade after the teaching sheet. The page is full at M, and the Steps sit on the facing teaching sheet.
   - Not scored down. Two things still stand:
     - The hcf practice page keeps the one-line strip, so the two bands differ on the same role.
     - Rows-of-ten grids blank the top-left corner (91 at seed 1, 61 at seed 4242, 31 at seed 777 L), which only Step 3 ("Top row? Look down") solves.
   - Recommend either the compact one-line Steps strip, as on hcf p3, or no blank in a grid's top-left corner.
   - Check: STEP-COVER extended to pages with no Steps band, using the lesson's steps as the reference. It warns rather than fails.
2. **91–120 first, then the other two grids in random order.**
   - 91–120 first is right: it is the lesson's crossing focus.
   - Random order for the other two is acceptable, and every grid is self-contained.
   - Chart order (31–60, then 61–90) would be calmer for SPED pupils and costs nothing. A recommendation, not a score.
3. **The practice page footer shows a different seed.**
   - Still a defect (r2 n2), not scored.
   - A teacher who types 12161 back in does not get this packet.
   - Footer the request seed, or "4242·p3".
   - Check: FOOTER-SEED. Every page of one `buildSheet` result carries the request's seed.

## What would close it

- F1 (c120 teaching sheet at M): different answer sets for the windows on one sheet, gated by SHEET-ANSWER-SET.
- F2 (hcf band 100 practice page): disjoint or barely-overlapping practice windows, a filled page, and gates ANSWER-REUSE, NEAR-TWIN and the empty-band floor.
- Then re-grade only:
  - c120 lesson p2 at M, seeds 1, 4242 and 777;
  - the hcf band-100 lesson, seeds 1 and 4242.

  Everything else here keeps its score.
- This was the one round allowed after the round-cap stop, so the lead decides how F1 and F2 proceed. Both are the same answer-repetition class as R2-1, now outside the page the r4 fix rebuilt.

## PNGs saved (`design/audit/runs/lf-builds/chart120/blanks-r5/`)

- c120, every page and key, M and L, seeds 1, 4242 and 777:
  - `c120-lesson-{M,L}-p{1,2,3}-s{1,4242,777}.png`
  - `c120-lesson-{M,L}-p{1,2,3}-key-s{1,4242,777}.png`
- hcf100, M, seed 4242:
  - `hcf100-lesson-M-p{1,2,3}-s4242.png`
  - `hcf100-lesson-M-p{1,2,3}-key-s4242.png`
- 42 files in all.
