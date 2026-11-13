# Critic: division:div_facts screen hosts, round 1

- Critic: independent (built none of it), Opus medium, 2026-11-12. Frozen tree 1428a84c (live master d34311d5 + status note).
- Renders, one per support, through /tmp/mq-browser-run.sh, sequential:
  `node tests/scripts/ws-grade-render.cjs --skills division:div_facts --roles independent --size M [--supports X] --out /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/scr-renders/<X>`
  (array with `--opts '{"constant":[2,3,4]}'`). Outputs: card-1280 / card-820 / card-390, worksheet-1280, quiz-1280,
  plus the paper independent page and key for comparison. No 1366 x 768 output was written by this tool version.
- Tool measures (meta.json): hScroll 0, smallTargetCount 0 on every host and support; consoleErrors [] on all six runs.
- Marking: `ws-screen-answer --skills division:div_facts` -> card ok, worksheet ok (3/3), quiz ok (3/3), OK.
- Items seen are all exact ÷ facts with dividend <= 144 (12 x 12 band) or, for array, divisors 2 to 4; 0 ÷ n appears (0 ÷ 2, 0 ÷ 12).
- VERDICT: **FAIL** (lowest 6: array on every host).

## Scores (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| Support | card-1280 | card-820 | card-390 | worksheet-1280 | quiz-1280 |
|---|---|---|---|---|---|
| off | 9 9 9 9 | 9 9 9 9 | 9 9 9 9 | 9 9 8 9 | 9 9 9 9 |
| touch | 9 8 9 8 | 9 8 9 8 | 9 8 9 8 | 9 8 **7** 8 | 9 8 9 8 |
| skip | **7** 8 8 8 | 8 8 8 8 | 8 8 8 8 | **7** 8 8 8 | **7** 8 8 8 |
| array (2-4) | 8 **6** 8 **6** | 8 **6** 8 **6** | 8 **6** 8 **6** | 8 **6** **6** **6** | 8 **6** 8 **6** |
| think | **7** 9 8 8 | 8 9 8 8 | 8 9 8 8 | **7** 9 8 8 | **7** 9 8 8 |
| boxsign | 9 8 9 8 | 9 8 9 8 | 9 8 9 8 | 9 8 8 8 | 9 8 9 8 |

What passes everywhere: one answer place (the yellow input on the "=" line, where the across sentence puts it), first
box focused on the card and on worksheet item 1, black-and-white Andika cell inside the game chrome, nothing cut off at
390 (hScroll 0; card-390 boxsign 0 ÷ 12 input right edge 346 px inside a 357 px cell edge), inputs 47 px (worksheet) to
66 px (quiz) tall, the worksheet and the quiz deal valid facts and mark the right answer.

## Defects

**D1 · array on screen is not the paper array (F2, VQ-8 / RP-2, H14 spirit). class: paper≠screen. C2 6, C4 6, all hosts.**
- Where: array/*/card-1280.png (9 ÷ 3), card-820.png (6 ÷ 2), card-390.png (12 ÷ 4), worksheet-1280.png (all 6), quiz-1280.png (15 ÷ 3).
- Measured: paper (array/independent-p1.png) draws the TRUE array F2 asks for — the quotient's rows of the divisor's dots in
  the section's one tall frame (48 ÷ 4 = 12 rows of 4). Screen draws the dividend's counters loose as hollow 22-26 px circles
  in rows of 5+5 (15 ÷ 3 -> 10 + 5; 6 ÷ 3 -> 5 + 1; 6 ÷ 2 -> 5 + 1). The grouping by fives hides the divisor; nothing on
  screen can ring them, so the pupil gets a count of the dividend, not the ÷ structure.
- Root cause: `supports.arrayFrame` is set only in print-sheet.js (lines 1483, 1513); screen-cell.js never sets it, so
  support-draw.js (line 287 `af`) falls through to `paneOf('array')`, the old S4 loose-counter pane.
- Fix: screenSupportsFor (screen-cell.js ~line 467-490) computes the same `tally` and `arrayFrame` print-sheet.js does
  (divFactsMaxDividend(opts) / tally cols, tally rows) and passes them in `supports`, so the screen draws the framed true
  array from the same code. Draw the empty frame on 0 ÷ n as paper does.
- Check that would have caught it: ws-screen-slots / ws-support-ladder compare the screen cell's support markup with the
  paper cell's for the same item (same cue kind: 'framed array' vs 'pane'), per support value — a "paper = screen support
  kind" assertion (support-draw returns a kind id; assert equal on both paths).

**D2 · worksheet array: a cell 64 % empty (H13). class: wasted space. C3 6.**
- Where: array/worksheet-1280.png item 1 (0 ÷ 2). Cell box 187 px tall, content ends 67 px in: an empty band of ~120 px (64 %).
- Rule: H13 (≥ 30 %); AX-4 (same routine in every cell). Paper draws an empty frame for 0 ÷ 3 so the routine holds; screen draws nothing.
- Fix: with D1, draw the empty frame on 0 ÷ n on screen too. Check: ws-screen-slots H13 band measure on the worksheet grid.

**D3 · skip strip and think box text too small on the wide hosts. class: size / legibility. C1 7.**
- Where: skip/quiz-1280.png, skip/worksheet-1280.png, skip/card-1280.png; think/worksheet-1280.png, think/quiz-1280.png, think/card-1280.png.
- Measured: strip numbers 8 px cap height (~11 px type) beside a 41 px-cap fact (ratio 0.20); paper keeps 8 : 21 (0.38).
  think/card-390 text 9 px cap (~13 px). The numbers are what the pupil must read to use the support; RUBRIC C1 "text a pupil
  must read ≥ 11 pt" (≈ 15 px) and RP-2 (one builder, screen scales by CSS width) — here the cue does not scale with the cell.
- Fix: scale the factcue with the fact's digit size on screen (the paper ratio: strip digits ≥ 0.38 of the fact digit, never
  under 15 px; think box text the same), wrapping the 12-number strip to 2 x 6 as now.
- Check: a ws-screen-slots rule: every text node inside .ws-factcue ≥ 15 px and ≥ 0.35 x the fact digit's font size.

**D4 · worksheet touch: two layouts in one grid. class: consistency. C3 7.**
- Where: touch/worksheet-1280.png — items 1 (22 ÷ 11) and 4 (110 ÷ 10) put the 12 dots under the fact; items 2, 3, 5, 6 beside it.
- Rule: RUBRIC C3 screen "a consistent layout for every item of one skill"; AX-4.
- Fix: choose beside / under once per worksheet (from the widest item) and apply it to every card.
- Check: ws-screen-slots: the cue's placement (beside / under) is the same for every card of one skill in the grid.

Observations, not graded down:
- Off: paper at M 3 columns puts the answer line under "84 ÷ 12 =", screen beside the "=". The card §3 says screen draws the
  item's own form, never the narrowing; accepted.
- Boxsign: worksheet puts the sign box above the fact, paper and card beside it; both placements are allowed (beside / under).
- Worksheet input 47 px tall at 1280 (the 48 px digit-input line is for tablet/phone; ws-phone-card OK).
- Not tested here: skip on band=100 — screen defaults the strip to 12 (`|| 12`) while paper uses the section tally 10; same
  root as D1 (screen never receives `supports.tally`). Re-check after the D1 fix with `--opts '{"band":100}'`.

## Rule 00 lists

**Automatic checks that would have caught each finding**
1. D1/D2: a paper = screen support-kind assertion (support-draw returns a kind; ws-support-ladder renders both paths per value and asserts equal), plus "screen supports carry the same tally / arrayFrame fields as the print section".
2. D3: a screen cue-size rule in ws-screen-slots (factcue text ≥ 15 px and ≥ 0.35 x the fact digit).
3. D4: a grid-consistency rule in ws-screen-slots (cue placement identical across one skill's worksheet cards).
4. D2: H13 measured on worksheet cells, not only on paper cells.

**Speed-ups this round revealed**
1. Screen-host grading should start from a side-by-side contact sheet (paper cell next to the card / worksheet / quiz cell for the same support): D1 is visible in one glance.
2. ws-grade-render meta.json should record each screen item's text and support kind for worksheet and quiz (today only the card count) so the critic can check the deal without reading pixels.
3. The facts card should carry F1-F4 as a section of its own; today they are only cited in code comments, so a critic has to grep js/ for "facts card F2".
