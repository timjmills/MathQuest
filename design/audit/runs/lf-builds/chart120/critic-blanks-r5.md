# chart_to_120 / hundreds_chart_fill: narrow independent critic r5, "chart blanks" lesson deal redesign

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `70c218ed7`. The critic changed no code.
- **How it was rendered:**
  - `tests/lib/ws-harness.cjs` `open()` under `tests/scripts/mq-browser-run.sh`.
  - Calls: `window.buildSheet({role:'lesson', practicePages:1, mixed:false, key:true, paper:'A4'})`, then `sheetDocument` for the pupil pages and the key. Each `section.ws-page` was shot. 0 console errors.
  - `mixed:false` is the teacher-print default (`partStd`). The `mixed:true` deal gives byte-identical tables on p1–p3. Its extra page is the note at the end, which is not graded.
- **Graded:**
  - c120 lesson p2 and p3 at M, seeds 1, 4242 and 777;
  - c120 p2 at L, seed 4242;
  - hcf band 100: every page and key at M, seeds 1 and 4242.
- **Machine reads:** every `table.k2-chart` on the pupil and key pages. Squares come from the key; blanks are the pupil's empty slots.
  - key arithmetic (every square = base + 10·row + col): **0 wrong** in the pupil windows. The only "inconsistencies" are the p1 anchor's staged empty squares, which is intended.
  - cross-window giveaway: no pupil gap is printed in any other table of the packet. **0**.
  - same sorted answer set between any two pupil windows: **0**.
  - step cover: every gap has a printed left neighbour, a printed square above, or (top row) a printed square below. **0** failures.
  - re-asked answers on p3 (already answers on p2): c120 3/23, 3/23, 3/26 at M and 3/23 at L. hcf 3/27 (seed 1) and 3/26 (seed 4242). All are at most a third.
- **PNGs:** `blanks-r8/` (list at the end).

## Verdict: **FAIL** (one page: the hcf band-100 teaching sheet)

| Page | Result |
|---|---|
| c120 p2 teaching sheet, M, seeds 1/4242/777 | **passes** (r4 F1 closed) |
| c120 p3 practice (three rows of ten), M, seeds 1/4242/777 | passes |
| c120 p2 at L, seed 4242 | passes |
| hcf100 p1 anchor, p3 practice, keys, seeds 1/4242 | pass (r4 F2 closed on p3) |
| hcf100 p2 teaching sheet, M, seeds 1 and 4242 | **fails C2, C3 and C4** (G1, a regression) |

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page | Scores | Pass |
|---|---|---|
| c120 p2 M, s1 / s4242 / s777 | 8·8·8·8 | yes |
| c120 p3 M, s1 / s4242 / s777 | 9·8·9·9 | yes |
| c120 p2 L, s4242 | 8·8·8·8 | yes |
| c120 keys p2–p3 (M; L p2) | 9·9·9·9 | yes |
| hcf100 p1 anchor, s1 / s4242 | 9·8·8·9 | yes |
| hcf100 p2 teaching sheet, s1 / s4242 | 8·**6**·**6**·**7** | **no** |
| hcf100 p3 practice, s1 / s4242 | 9·8·9·9 | yes |
| hcf100 keys p1–p3 | 9·9·9·9 | yes |

## r4 findings: closed?

### F1: closed

- **Guided** (seeds 1/4242: 92–116; seed 777: 94–118) answers 95, 105, 115.
- **Independent** reviews 1–25 and 6–30 in disjoint columns. Answers:
  - seed 1: 3/15/21 and 9/17/26;
  - seed 4242: 10/18/30 and 2/14/24;
  - seed 777: 4/14/22 and 10/20/28.
- Nine different answers on every sheet, and no pair shares an answer.
- Blank counts are right: N=3 per window, Score /8 = 2 warm-up + 6.

### F2: closed on the practice page

- hcf p3 is three rows-of-ten grids (1–30, 71–100, 31–60) with 8–9 blanks each.
- The page is full; the gap above the footer is 1 % of the body.
- Only 42/53/56 (seed 4242) or 43/45/53 (seed 1) repeat the Guided window, so 3/26 and 3/27.
- No 3 × 5 near-twin windows remain.

## Findings

### G1 (fails): the hcf band-100 teaching sheet lost its Independent Practice section

- **Where:**
  - `hcf100-lesson-M-p2-s4242.png` and `hcf100-lesson-M-p2-s1.png`.
  - Compare r4's `blanks-r5/hcf100-lesson-M-p2-s4242.png`: 2 Guided windows, 2 Independent windows, Score /12.
- **What the sheet prints now:**
  - Warm-up (2), then ONE Guided window (41/42–66) beside the Steps, then nothing.
  - Score reads **/2**: only the warm-up is scored.
  - The bottom **22 %** of the body (228 px of 1047) is empty.
  - The Guided cell is half white space around a single 3 × 5 window.
- **Why it fails:**
  - C2 6: the lesson goes Model, then Guided, then straight to the practice page. The "you do" on the teaching sheet is gone.
  - C3 6: a quarter of the page is blank paper.
  - C4 7: the lesson page anatomy has no Independent section, which every other lesson sheet at M carries. c120 at M carries one on the same template.
- **Root cause:**
  - `f5bfb58dc` pins every band-100 teaching window to `r0 = 4` (rows 41–70). Three rows hold only two disjoint 3 × 5 windows (columns 0–4 and 5–9).
  - Any other window there overlaps, so NEAR-TWIN and SHEET-ANSWER-SET refuse it. The deal then silently drops the Independent windows instead of failing or placing them elsewhere.
  - `ws-print-lint` PAGEFILL and `ws-guided-echo` stayed green: the status line says "print-lint lesson M/L OK".
- **Fix, any one of these:**
  - (a) Keep Guided on rows 41–70, columns 0–4 (41–65), and put Independent 3 on columns 5–9 (46–70). Put Independent 4 on row 61–85 (columns 0–4 or 5–9).
    - The practice grid 71–100 then blanks Independent 4's row-71/81 gaps consistently. That is 2–3 re-asks, so the page's reuse stays at or under a third.
  - (b) Move Guided off the 41–70 band (for example 61–85) and give both Independent windows the two disjoint halves of 41–70.
  - Either way the sheet prints Guided + 2 Independent at M, as r4 did, Score /12.
  - If no placement satisfies the checks, the deal must fail loudly, not print a section-less sheet.
- **Automatic checks:**
  - **LESSON-SECTIONS** (`ws-guided-echo` or `ws-print-lint`, lesson role): at M, a teaching sheet whose skill dealt an Independent section at the last passed commit must still print it with at least 2 items.
    - Fail side: `70c218ed7` hcf M seeds 1 and 4242, p2.
    - Pass side: c120 M p2 at the same commit.
  - **TEACH-PAGEFILL**: extend the PAGEFILL floor to the lesson teaching sheet. Empty band above the footer ≤ 15 % of the body at M.
    - Fail side: 228/1047 px (22 %) at `70c218ed7`.
    - c120 L p2 is 13 % and passes; it is the size that genuinely cannot fit Independent.
  - **SCORE-FLOOR**: a lesson teaching sheet's Score total must include chart answers, so not just the warm-up.

### Notes (not scored; each has a cheap check)

- **n1, Independent on 1–25 inside a "to 120" lesson: acceptable.**
  - It reads as review, and the lead ruling makes it necessary. But the sheet does not say so: Guided is three-digit work across 100, and "Independent Practice" then drops to 1–30 with no signal.
  - Suggest the heading "Independent Practice: Review numbers to 30."
  - Suggest always printing 1–25 before 6–30. Seed 4242 prints 6–30 as item 3 and 1–25 as item 4; seeds 1 and 777 are the other way round.
  - Check: WINDOW-ORDER, Independent windows in chart order.
- **n2, the crossing of 100 is thinner than in r4.**
  - Guided always answers 95/105/115 at all three seeds: 105 and 115 are reached by "look up, add 10" across the hundred.
  - 100, 101 and 110 are printed, never asked. 111 is the only asked crossing square (p3 grid 1).
  - Enough for "crossing in play" (the pupil writes 105 from 104 or 95 and 111 from 101). A teacher printing two forms gets the same Guided answers, though.
  - Suggest letting the Guided window's free column vary, or blanking 100 or 110 on the p3 grid 1.
  - Check: CROSSING-ASKED, at least one gap in {100, 101, 110, 111} per band-120 packet. It is met at all three seeds, by 111.
- **n3, rows-of-ten overlap with Guided.**
  - c120 p3 grid 1 contains the whole Guided window with the same 3 gaps. hcf p3 grid 3 contains 10 of Guided's 15 squares with the same gaps.
  - By r4's NEAR-TWIN wording ("share 60 % or more of their squares", measured on the smaller window) these trip. The re-ask is 3 answers, at most a third, and r4 accepted the same on c120 p3.
  - Not scored. The lead should state whether NEAR-TWIN is measured on the smaller or the larger item, so the check and the critic agree.
- **Still open from r4 (not scored):**
  - r2 n2: the practice-page footer seed (12161 / 8696 at seed 4242 / 777; FOOTER-SEED).
  - r2 n1: the numeral baseline, for example 52/60, 85/87 and 53/58 sitting about 2 px low in the rows-of-ten grids (`c120-lesson-M-p3-s777.png`).
  - r2 n3: the step range wording.

## For the record: the optional Mixed practice part (not graded; out of this brief's scope)

The "+ mixed" lesson toggle (`mixed:true`) adds a Mixed practice page. At `70c218ed7` it is badly broken on both skills.

- **c120, M and L, seed 4242 (`c120-lesson-mixedopt-M-p4-s4242.png`):**
  - Items 1–6 are **six identical windows** (95–119), each blanking 95, 105 and 115: the whole left column.
  - No printed step solves 95: it has no left neighbour, and the square below it is blank. A pupil can only count back from 96, which is not a Step.
  - The same answers are already on p2 and p3, so 18 of 18 are re-asks.
- **hcf, M, seed 4242 (`hcf100-lesson-mixedopt-M-p4-s4242.png`):**
  - Item 3 (1–25) repeats p3 grid 1's gaps 3, 12, 15, 21 and 23 in the same squares.
  - 28 of the page's 30 chart answers were already asked in the packet.
- **Check:** run SHEET-ANSWER-SET, NEAR-TWIN, ANSWER-REUSE and STEP-COVER on the lesson packet with `mixed:true`. The lesson's mixed part is the `mixed-practice` role inside a packet, so it should obey the packet's rules.

## What would close it

- G1: the hcf band-100 teaching sheet at M prints Guided + 2 Independent windows again, within the r5 rules, gated by LESSON-SECTIONS and TEACH-PAGEFILL.
- Then re-grade only hcf100 lesson p2 (and its key) at M, seeds 1 and 4242.
- Every other page here keeps its r5 score.

## PNGs (`design/audit/runs/lf-builds/chart120/blanks-r8/`, 42 files)

Graded packets (`mixed:false`):
- c120:
  - `c120-lesson-M-p{1,2,3}-s{1,4242,777}.png` and `c120-lesson-M-p{1,2,3}-key-s{1,4242,777}.png`
  - `c120-lesson-L-p{1,2,3}-s4242.png` and `c120-lesson-L-p{1,2,3}-key-s4242.png`
- hcf:
  - `hcf100-lesson-M-p{1,2,3}-s{1,4242}.png` and `hcf100-lesson-M-p{1,2,3}-key-s{1,4242}.png`

Out-of-scope evidence (`mixed:true`, page 4):
- `c120-lesson-mixedopt-{M,L}-p4-s4242.png` and `c120-lesson-mixedopt-{M,L}-p4-key-s4242.png`
- `hcf100-lesson-mixedopt-M-p4-s4242.png` and `hcf100-lesson-mixedopt-M-p4-key-s4242.png`
