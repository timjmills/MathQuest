# chart_120 — independent critic, round 3 (narrow, after the root-cause stop)

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `57bb02952` (fixes in `de7225b14`). Not changed by the critic.
- **Scope:** r2 findings N1–N3 only. Every page r2 passed at ≥ 8 keeps its r2 score and was not re-graded.
- **Skills:** `composing:chart_to_120` (band 120) and `composing:hundreds_chart_fill` (band 100, regression). Sizes M and L.
- **Renders:**
  - Print: `ws-grade-render.cjs` via `mq-browser-run.sh`, roles scripted-model, lesson and opener at M and L. Seeds are the same as r2: 429324, 404398 and 118245.
  - Screen: the renderer cannot produce a 1366 worksheet or quiz, so a Puppeteer script (harness `open()`) drove the app directly at 1366 x 768 and 820 x 1180.
    - The online worksheet went through `initWorksheet` (6 items).
    - The quiz went through the real quiz builder (`openQuizBuilder` + `addMultipleQuestions` + `saveQuiz`, then taken), with every question shot.
    - The same script dealt 20 seeds of each host for each skill and judged the windows (`critic-r3/screen-deal-stats-c120.json`).
- **Evidence:** `critic-r3/` (6 PNGs + deal stats).

## Verdict: **PASS**

N1, N2 and N3 are closed on every page and host graded. No new defect scores below 8. With r2's passed pages, chart_to_120 is at ≥ 8 on every criterion, on every in-scope page type and host.

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

| Page / host | chart_to_120 M | chart_to_120 L | band 100 (regression) | Pass |
|---|---|---|---|---|
| scripted-model + key | 8·9·8·9 | 8·9·8·9 | 8·9·8·9 (3-gap, M) | yes |
| lesson p1 anchor + key | 8·8·OOS·8 | 8·8·OOS·8 | — | yes (panel bands OOS) |
| opener + key | 8·8·8·9 | 8·8·8·9 | 8·8·8·9 (1-gap Model, singular frame) | yes |
| online worksheet 1366 | 8·8·8·9 | — | — | yes |
| online worksheet 820 | 8·8·8·9 | — | 9·8·8·9 | yes |
| quiz 1366 | 9·8·9·9 | — | 9·8·9·9 | yes |
| quiz 820 | 8·8·9·9 | — | 9·8·9·9 | yes |

(1280 and 1024 worksheet / quiz renders from `ws-grade-render --tablet-hosts` were also looked at: the same windows as 1366, six distinct, no repeat.)

## Findings

### N1 — Scripted Model and lesson anchor "Write N" states: **CLOSED**

- **Scripted Model, seed 429324 (`c120-scripted-model-M.png`, L and keys the same):**
  - The states read "Ten more than 91 is 101" (blank), "Write 101." (101 trace grey), "One more than 103 is 104" (101 now solid black), "Write 104." (101 black, 104 trace grey).
  - Each state adds exactly one new mark group, and earlier marks are solid. This is PT-MOD-1.
- **Lesson anchor p1, seed 404398 (`c120-lesson-p1-M.png`; key L p1 is the same):** "Write 94." shows 94 grey, panel 3 shows 94 black, and "Write 112." shows 94 black and 112 grey.
- **Band 100, 3-gap:** a single "Write 52, 64 and 76." state traces all three at once. That is one mark group, as the step says. No regression.
- **Note:** earlier marks are drawn **bold** black, heavier than the printed numbers. This reads as "the pupil wrote this", and it is consistent across Model, anchor and key, so it costs no point.
- **Check (already built by the lane):** `ws-guided-echo` MODEL-STATE-MARKS. The renders agree with it.

### N2 — screen hosts repeat a band-120 window: **CLOSED**

- **Deal stats, 20 seeds per host, through the app's own paths:**

  | | Online worksheet (6 items) | Quiz via the quiz builder (3 items) |
  |---|---|---|
  | Sets with a repeated window | 0 / 20 (r2: about 98 %) | 0 / 20 (r2: about 44 %) |
  | Items printing a twin window's answer | 0 | 0 |

  Band 100: 0 / 20 repeated windows on both hosts.
- **Worksheet 1366 and 820:** six distinct windows (91…96 starts). At 820, three-digit numbers sit about 2–4 px from the square border, the same as r2's card. They are legible at about 45 px, so C1 is 8 at 820. Answer squares are about 62 x 56 px, above the 48 px touch target.
- **The instruction agrees with the gap count:** "What number goes in the empty box?" for one gap, and "Type the missing numbers in the empty boxes." for more than one.
- **Quiz 1366 and 820 (`c120-quiz-820-q1-3.png`):** windows 92 / 96 / 91, all distinct, one question a screen.
- **Remaining (r2 n1, not a score below 8):** overlapping windows that are not identical still share numbers. An answer of one item is printed in a different square of another, averaging 19.5 such shares a 6-item worksheet and 3 a 3-item quiz.
  - Example: worksheet 1366, item 1's gap 117 is printed in items 2, 3 and 5.
  - Band 120 has only 30 squares, so six 3 x 5 windows must overlap.
  - On the quiz, these items sit on separate screens. On the worksheet the pupil must still locate the number by row and column.
  - This is the same class r2 left as an owner or lead decision (fewer items, or blank shared answers). It is restated here with the screen counts, not scored down.
- **Proposed check if the owner rules against it:** OVERLAP-INFO on the screen hosts, with a per-sheet cap.

### N3 — opener Say frame on multi-gap items: **CLOSED**

- **Opener seed 118245 at M and L (`c120-opener-M.png`):** the Model has two gaps (111, 115), and Say reads "The missing numbers are ____ and ____." That is plural, grammatical, with two blanks, and it matches the item.
- **Band 100 opener seed 571557 (`hcf100-opener-M.png`):** a one-gap Model (34) keeps the singular "The missing number is ____.". The agreement holds both ways.
- **Filled frames:** the Scripted Model and lesson read "The missing numbers are 101 and 104." / "… 94 and 112." / "… 52, 64 and 76.".
- **Check (built):** `ws-providers-unit` and `ws-guided-echo` SAY-AGREE on the unfilled frame.

## Notes (no score below 8)

- **r3-n1.** The opener and guided Steps still break "Take away / 10." across two lines at M (r2 n2, open). Use a non-breaking space before 10.
- **r3-n2.** The "Say:" label sits about 3 px higher than its quoted frame on the opener (baseline mismatch). This is cosmetic.
- **r3-n3.** At 820 a direct app drive shows the student header and stats banner above the worksheet and quiz. The renderer hides these as overlays. This is app chrome outside the cell, not graded.
- **Speed note for the lane's reflection:** `ws-grade-render` has no way to render the worksheet or quiz at 1366. `gridWidths` is fixed at `[1280, 820, 1024]`, and its default quiz render shoots only Q1. A `--grid-widths` flag plus a per-question quiz shot (`navigateQuizQuestion`) would have saved this round's hand-written driver.

## Out of scope (as routed in precritic-diff.md)

The lesson anchor panel bands, the guided try band, the Prerequisite Check fill, EB-GDPCAP, sibling-compare, and number_chart_fill's own Say frame.
