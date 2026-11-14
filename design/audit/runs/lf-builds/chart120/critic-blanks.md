# chart_120 / hundreds_chart_fill — narrow independent critic: "Numbers to fill in" and the cross-window deal

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `335e6cc2b`. The critic changed no code.
- **Scope (the brief):**
  - Print: Independent, Test, Guided, Error analysis and the Lesson packet, with keys, at M and L, for:
    - `composing:chart_to_120` at the default (tiles 5) and at tiles 8;
    - `composing:hundreds_chart_fill` at band 100, default.
  - Screen: the online worksheet and the quiz (through the real quiz builder) at 1366 x 768 and 820 x 1180.
  - The options panel.
- **How it was rendered:**
  - Print: a Puppeteer driver (`tests/lib/ws-harness.cjs` `open()`, run under `mq-browser-run.sh`) called `window.buildSheet` and then `sheetDocument`, and shot each `.ws-page`. Seeds were 4242 (all roles) and 777 (lesson, independent, guided).
  - Every `table.k2-chart` was read from the page HTML: blank squares (`[data-ws-slot]`), printed numbers, rows, columns and neighbours.
  - Screen: `initWorksheet` with 6 items, and `openQuizBuilder` + `addMultipleQuestions` + `saveQuiz` + take. That is 10 seeds per skill per host per width, 40 sets in all.
  - Before/after: a detached worktree at `232942dd8~1`, the commit before the change (served with `MQ_ROOT`), rendered the c120 lesson, independent, guided and test pages.
- **Evidence:** `critic-blanks/deal-checks.txt` (every window's blank count, its values, the rule checks and the giveaway list) and 4 PNGs (f1–f4).

## Verdict: **FAIL**

**What the change gets right:**
- The cross-window rule holds on every page that deals: 0 giveaways on Independent, Test, Guided and Error analysis at both seeds.
- It holds on both screen hosts: 0 giveaways in 40 sets.
- Before the change the same c120 pages gave 12 values away on the Independent page and 8 on the lesson practice page.
- Every window has 5 blanks (3 on Guided). No whole row is blank, no window is more than half blank, and no two blanks sit side by side in a row.
- Every blank keeps a printed neighbour, and Score /N matches the blank count.

**Why it fails:** to meet the new rule, the dealer drops items. On band 120 (30 squares) this does four things:
- it leaves an empty pupil page in the lesson packet;
- it cuts the tiles-8 sheet to 2 windows;
- it cuts Guided from 2 tries to 1;
- the lesson's worked anchor, which is outside the rule, now prints the answers to the pupil's own practice windows.

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page / host | c120 default M | c120 default L | c120 tiles 8 M / L | hcf band 100 M / L | Pass |
|---|---|---|---|---|---|
| Independent + key | 8·8·8·9 | 8·8·8·9 | 8·**6**·**5**·8 | 8·8·8·9 | **no** (tiles 8) |
| Test + key | 8·8·8·9 | 8·8·8·9 | 8·**6**·**5**·8 | 8·8·8·9 | **no** (tiles 8) |
| Guided + key | 8·**7**·**7**·8 | 8·**7**·**7**·8 | 8·**7**·**7**·8 | 8·8·8·9 | **no** (c120) |
| Error analysis + key | 8·8·8·9 | 8·8·8·9 | 8·8·8·9 | 8·8·8·9 | yes |
| Lesson packet + key | **6**·**5**·**4**·**6** | **6**·**5**·**4**·**6** | 8·**5**·**5**·**7** | 8·**7**·8·8 | **no** |
| Online worksheet 1366 / 820 | 8·8·8·9 | — | — | 8·8·8·9 | yes |
| Quiz 1366 / 820 | 9·8·9·9 | — | — | 9·8·9·9 | yes |

## Findings

### B1 — the c120 lesson packet prints an empty pupil page, and at L it has no independent practice at all (FAIL)

- **Seed 4242, M (`f1`):**
  - `pageCount` is 3. Page 3, the practice page, holds only the header: no window, no Steps, no Score.
  - Page 2 holds 2 independent windows. The items list holds 6 windows, so 3 or 4 dealt windows never reach a page.
  - The key's page 3 is empty too.
- **Seed 4242, L:** page 2 is the Warm-up plus the Guided window only, with no independent window. Page 3 is empty.
- **Seed 777:** the same at M and L.
- **Before the change (`232942dd8~1`, seed 4242):** page 3 held 6 windows at M and at L.
- **Effect:** the lesson's practice page is gone. A pupil gets a sheet with nothing on it.
- **Proposed check:** LESSON-EMPTY-PAGE in `ws-lesson-baseline` and `ws-guided-echo`.
  - Every pupil page of a packet past page 1 holds at least one item, and the key holds the same count.
  - Dealt chart items (`r.items` with a chart window) must equal the windows drawn.
  - Run it on chart_to_120 at M and L for 4 seeds.

### B2 — the lesson anchor prints the answers to the pupil's practice windows (FAIL; the rule is "same sheet")

- **tiles 8, seed 4242 and seed 777 (`f2`):**
  - The anchor on page 1 is the window 96–120, worked through to "Write 96 and 98 … 106 and 108 … 116 and 118". Its Say band reads "The missing numbers are 96, 98, 106, 108, 116 and 118."
  - Page 3, item 1, is the **same squares with the same six gaps**. The pupil's answer is printed, in bold, two pages back in the same packet.
- **Default tiles 5:**
  - c120: 10 practice gaps (seed 4242) and 9 (seed 777) are printed on the anchor page.
  - hcf band 100: 10 (seed 4242) and 11 (seed 777), for example anchor 36–60 against p2 item 4's gaps 46, 48, 56, 58.
- **The commit does not achieve its claim:** `b74bd2d48` says "chart anchors kept off pupil gaps". The renders show it does not hold.
- **Proposed check:** CROSS-GIVEAWAY across the whole lesson packet.
  - Every number the anchor windows print or write (the bold and traced marks included) is a "printed" number for every pupil window in the packet.
  - A window with the same squares as an anchor is refused (the `same` twin rule).
  - The backtest's fail side is this tiles-8 packet at seed 4242.

### B3 — tiles 8 (an offered value) makes a two-item, two-thirds-empty sheet (FAIL)

- **Independent and Test, M and L, seeds 4242 and 777 (`f3`):** only **2 windows** are dealt where the default deals 6.
  - At M they are set one to a row, in two half-page cells. About 65 % of the body is empty.
  - Score is /12.
  - The lesson practice page at tiles 8 has the same 2 windows and the same empty two-thirds.
- **Blank count:** each window holds 6 blanks. The card's own cap (R x min(ceil(C/2), C−2), at most half) gives **7** for a 3 x 5. So "holds the most it can" is not met either.
  - Both windows are the same shape: columns 1 and 3 empty top to bottom.
- **Effect on teaching:** two items cannot serve as a practice sheet or a test.
- **Proposed checks:**
  - **OPTION-ITEMS:** an offered value of `tiles` must not cut the page below the default's item count by more than a third. `options-render.cjs` already has the "fewer items" rule for appearance values; extend it to `tiles`. Otherwise, refuse the value on band 120 (hide 8 there).
  - **BLANK-COUNT:** tighten the gate to equal min(N, cap) and not ≤ N.

### B4 — c120 Guided drops to one try and leaves half the try row empty (score 7)

- **Seed 4242 and seed 777, M and L, at tiles 5 and tiles 8 (`f4`):**
  - The Model is traced (3 marks). There is 1 try window (3 blanks), and the right try cell is empty.
  - Score is /3.
- **Before the change:** 2 tries (/5).
- **Band 100 is fine:** it keeps 2 tries (/6).
- **Effect:** half of the guided practice row is blank paper, and the fade has one item.
- **Proposed check:** GUIDED-TRY-COUNT. A Guided page deals the same number of try items as before the rule, or the empty cell is removed and the page reflowed. Run it on band 120 at M and L.

## Notes (no score below 8 on their own)

- **n1 — answers repeat across windows.** The rule forces band-120 windows to share one pool of gaps.
  - Seed 4242 Independent: 105 and 115 are blanks in all 6 windows, and 95 in 5 of them. Item 3 and item 4 have identical answer lists (95, 98, 105, 115, 117) on different squares.
  - It is still practice, but the pupil writes the same five numbers again and again.
  - Worth a lead decision: for example, fewer windows on band 120, or the 3-rows grid on Independent.
- **n2 — on a tablet the panel's cap sentence is only on hover.**
  - The panel shows "Numbers to fill in", with 2/3/4/5 (default)/6/8, and the line "How many numbers the pupil writes in each window."
  - The cap sentence ("A window too small … holds as many as it can …") is only in the control's hover `title`. The "?" tip shows the first sentence, so on a tablet it cannot be read.
  - Give the option a `tip` or `helpShort` that carries the cap.
- **n3 — a stale option name in another help line.** The "Empty squares" help still says '"Empty boxes" says how many', which is the option's old label (`skill-options.js:1263`).
- **n4 — Score on screen.** The online worksheet shows no Score /N (Check All marks each box). This is unchanged and not graded here.
- **Screen hosts:**
  - All 40 sets had 6 (worksheet) or 3 (quiz) windows of 5 blanks, 0 giveaways and 0 windows with the same squares.
  - Answer boxes were 60 x 54 px, above the 48 px touch target.
  - Three-digit numbers are legible at 820.

## What would close it

Fix B1–B4 in the dealer (the lesson anchor counted as kept windows, items not silently dropped, a minimum item count per role), then re-run:
- this narrow critic, on the lesson, Guided and the tiles-8 Independent page only;
- every page that passed above keeps its score.
