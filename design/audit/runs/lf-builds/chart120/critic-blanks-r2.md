# chart_to_120 / hundreds_chart_fill — narrow independent critic r2: "chart blanks" (last round under the cap)

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `6460904ef`, which is merged with master `65c28ccdf`. The critic changed no code.
- **How it was rendered:**
  - Print: `tests/lib/ws-harness.cjs` `open()` under `mq-browser-run.sh` called `window.buildSheet` and then `sheetDocument`, and shot each `.ws-page`. Seeds were 4242 and 1, at M and L, with keys.
  - Every `table.k2-chart` was read from the HTML of the pupil page and of the key. For each window the critic read the blank count, the answers and the printed numbers.
  - Three machine checks were run on that data:
    - key arithmetic (every key cell = base + 10·row + col): 2,280 cells, **0 wrong**;
    - cross-window giveaway on every sheet and across the whole lesson packet: **0**;
    - identical pupil windows across a packet (see R2-1 below).
  - Screen: `ws-grade-render --skills composing:chart_to_120 --gate`. It returned **OK**: no overflow, and no answer box under 48 px at 820 / 1024. The critic also took its own shots of `initWorksheet` at 1366 x 768 for seeds 4242 and 1.
- **PNGs:** `blanks-r3/` (list at the end).

## Verdict: **FAIL** (one page type: the chart_to_120 lesson packet, C2)

Every other page graded passes at 8 or more.

## r1 findings: closed?

| r1 | Status | Evidence |
|---|---|---|
| B1: empty practice page in the lesson packet | **closed** | p3 holds 5 windows (/15) at M and at L, seeds 4242 and 1. The key is 3 pages. |
| B2: the anchor prints the practice answers | **closed** | Seed 4242: the anchor's gaps are 95, 98, 105, 115 and 117; the practice answers are 94/104/114 and 100/110/120. Seed 1: the anchor's gaps are 102, 111 and 114; the practice answers are 96/106/116. 0 cross-packet giveaways. |
| B3: tiles 8 leaves a two-window sheet | not re-graded (not in this brief's page list) | Band-120 cap 6 and OPTION-ITEMS are in the lane's gates. |
| B4: Guided has one try | **closed** | c120 Guided has a Model and 2 tries, Score /6, at M and L. |

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page / host | M | L | Pass |
|---|---|---|---|
| c120 lesson packet: p1 anchor, p2 teaching sheet, p3 practice (5 windows), and key | 8·**6**·8·8 | 8·**6**·8·8 | **no** |
| c120 Guided + key | 8·8·8·9 | 8·8·8·9 | yes |
| c120 Independent + key | 9·8·9·9 | 9·8·9·9 | yes |
| c120 Scripted Model | 9·8·8·9 | 9·8·8·9 | yes |
| hcf band 100 Guided | 8·8·8·9 | 8·8·8·9 | yes |
| hcf band 100 Independent | 9·9·9·9 | 9·9·9·9 | yes |
| hcf band 30 Independent (6 windows) | 9·8·9·9 | 9·8·9·9 | yes |
| c120 practice card 1280 | 9·8·9·9 | — | yes |
| c120 online worksheet 1366 | 8·8·8·9 | — | yes |
| c120 quiz 820 | 9·8·9·9 | — | yes |

What is right on every page:
- The blank count matches the option: 5 a window by default, 3 on Guided, and 3 (N=3) on band-120 lesson practice.
- The keys are facsimiles and every key value is correct.
- The pages are black and white, in Andika, with digits at 22 pt (M) and 28 pt (L).
- A short last row is centred on the lattice (lesson p3, item 5).
- Band 30 fills 6 windows.

## Findings

### R2-1: the lesson practice page reprints the teaching sheet's windows verbatim, and every window has the same answers (C2 6, FAIL)

- **Where:** `c120-lesson-M-p2-s4242.png` and `c120-lesson-M-p3-s4242.png`. The repeat holds at seed 1 and at L.
- **Verbatim copies.** At M, practice items 1, 2 and 3 on p3 are the same squares with the same gaps as items on p2:

  | Seed | p3 item | Copy of p2 item |
  |---|---|---|
  | 4242 | 1 | Independent 3 |
  | 4242 | 2 | Independent 4 |
  | 4242 | 3 | Guided |
  | 1 | 1 | Independent 4 |
  | 1 | 2 | Independent 3 |
  | 1 | 4 | Guided |

  At L, one copy per seed (the Guided window).

  A pupil copies p3 from their own p2: 9 of the 15 marks on p3 are free.
- **Same answers in every window:**
  - Seed 1: all 8 pupil windows in the packet (Guided, 2 on the teaching sheet, 5 on the practice page) answer **96, 106, 116**.
  - Seed 4242: 6 of the 8 answer 94, 104, 114, and the other 2 answer 100, 110, 120.
  - A packet where every item has one answer triple does not practise counting to 120. It also breaks RUBRIC C2 ("not six near-identical items").
- **The crossing is never filled at seed 1.** No pupil gap at 100, 101, 110 or 111 anywhere in the packet. The card (§ band 120) wants the crossing squares in play.
- **Root cause.** The packet-wide no-giveaway rule meets the anchor:
  - The anchor prints five of the ten columns (91–95 at seed 1, 95–99 at seed 4242).
  - The practice windows are 3 x 5 on a 3 x 10 band.
  - So only one consistent column of answers is left for the whole packet, and the dealer reuses windows to fill 5 cells.
  - This is the case the lead's 2026-11-14 ruling (a) named: "the rows grid is the fallback only if (a) fails the critic". (a) fails here on teaching quality, not on giveaways.
- **Fix (pick one; the lead decides):**
  1. Take the ruling's fallback: the rows grid on band-120 lesson practice.
  2. Treat the practice page as its own sheet for the cross-window rule. The anchor stays barred from giving answers, but p3 may blank values that p2 printed, because p2 is a separate page.

  Either way:
  - refuse a pupil window whose squares and gaps equal any earlier window in the packet (extend the `same` twin rule from anchor-vs-pupil to pupil-vs-pupil);
  - require at least 2 distinct answer sets on the practice page.
- **Automatic checks:**
  - **LESSON-TWIN** (in `ws-guided-echo` / the packet CROSS-GIVEAWAY pass): no two pupil windows in one packet have the same squares and the same gap mask.
    - Fail side: `6460904ef` c120 lesson M/L, seeds 1 and 4242.
  - **ANSWER-VARIETY**: on a packet or sheet with 4 or more windows, no single answer set covers more than half the windows.
  - **CROSSING-IN-PLAY per packet**: at least one pupil gap among 100, 101, 110 and 111 in a band-120 lesson packet. Today the 50-item predicate is per skill, not per packet.

### R2-2: a whole left-edge blank column has no Step that solves it (C2 7 on the lesson; a note on Independent)

- **Where:**
  - lesson p2 item 4 and p3 item 2 (seed 4242), and p3 item 1 (seed 1);
  - Independent item 3 (seed 4242: 95/105/115 all blank).
- **The problem:** the Steps band reads:
  1. Look left. Add 1.
  2. Look up. Add 10.
  3. Top row? Look down. Take away 10.

  The top square of a blank left column has no left neighbour and no number above, and the square below is blank. Only "look right, take away 1" works, and the anchor and Model never teach it.
- **Why it is new:** N=3 one-column windows deal this every seed.
- **Fix, either:**
  - add a step, "Look right. Take away 1." (the `chartSteps` provider, `js/modules/sheet/providers/k2.js:481` and `:548`), when any window holds a gap with only a right neighbour; or
  - do not deal a blank edge column whose only printed neighbour is to its right.
- **Automatic check: STEP-COVER.** Every gap on a page with a Steps band is solvable by a step printed on that page: left printed, above printed, top row with below printed, or right printed when a "look right" step is present.

## Judgement asked for: band-120 windows sharing column answers (e.g. 94/104/114)

- **On Independent, the online worksheet and the quiz (5 gaps a window): not a pedagogy problem at ≥ 8.**
  - The shared values sit in different squares and positions (edge, middle, top row against lower rows), so the pupil still reads a different neighbour each time.
  - Each window mixes 5 values, of which 2–3 are shared.
  - Worksheet seed 4242: items 1 and 6 have the same answer set on different squares. That is acceptable.
- **On band-120 lesson practice at N=3 it is a problem (R2-1).** One column a window means a shared column is the whole item. With verbatim copies on top, the page stops being practice.

## Notes (no score below 8 on their own)

- **n1: numeral baseline.** A printed numeral directly above or below a blank square sits about 2 px off its row-mates: 108 under the blank 98 on Independent item 1 (`n-baseline-crop-independent-M.png`); also 103, 108 and 102.
  - Fix: give chart cells a fixed line box (`line-height` equal to the cell, with the border width taken from the box, not added to it).
  - Check: CELL-BASELINE. In a k2-chart row, the `getBoundingClientRect().top` of the numerals agree within 0.5 px.
- **n2: the practice page shows another seed.** p3 of the packet footers "seed 12161" (4242 packet) and "seed 7920" (seed 1), while p1 and p2 say the packet's seed. Typing 12161 back in does not reproduce the packet.
  - Fix: footer the packet seed, or "4242·p3".
  - Check: FOOTER-SEED. Every page of one buildSheet result carries the request's seed.
- **n3: step range wording.** The anchor and Scripted Model write "From 91 to 100, count on by 1" over a window that starts at 95 or 96, so 91 is not visible. Better: "From 95 to 100 …", taken from the window's first printed square.
- **n4: empty space on Guided.** The c120 Guided page leaves about 25 % of the body empty below the try row, because the cells keep their measured height (r3 fix). The lesson L p2 band below Guided is master's own (empty-band pin). Neither is scored below 8.

## What would close it

- Fix R2-1 by the lead's choice: the rows-grid fallback, or a per-page rule plus LESSON-TWIN and ANSWER-VARIETY.
- Fix R2-2 with the step or the deal.
- Then re-run the lesson packet only, at M and L, seeds 1, 4242 and 777. Every other page here keeps its score.

The round cap (2) is reached on the chart-blanks giveaway class. Per process rule 4, R2-1 needs the root-cause machine checks above before one more round.

## PNGs saved (`design/audit/runs/lf-builds/chart120/blanks-r3/`)

- `c120-lesson-M-p1-s4242.png`
- `c120-lesson-M-p2-s4242.png`
- `c120-lesson-M-p3-s4242.png`
- `c120-lesson-M-p3-s1.png`
- `c120-lesson-L-p2-s4242.png`
- `c120-lesson-L-p3-s4242.png`
- `c120-guided-M-s4242.png`
- `c120-independent-M-s4242.png`
- `c120-independent-M-key-s4242.png`
- `c120-scripted-model-M-s4242.png`
- `hcf100-guided-L-s1.png`
- `hcf100-independent-M-s4242.png`
- `hcf30-independent-M-s4242.png`
- `c120-card-1280.png`
- `c120-quiz-820.png`
- `c120-worksheet-1366-s4242.png`
- `n-baseline-crop-independent-M.png`
