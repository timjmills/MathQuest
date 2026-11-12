# Critic: facts-roles, narrow round 2 (Guided S / L + Scripted Model S / M / L, five fact skills)

- Critic: independent (built none of it), Opus medium, 2026-11-12.
- Tree: frozen worktree `critfr3` at f960e549. No source edits.
- Renders: `ws-grade-render --skills <s> --roles guided,scripted-model --size S,M,L --no-screen`, one skill per run through
  `/tmp/mq-browser-run.sh`. PNGs: `scratchpad/fr2-renders/<skill>/<cat__skill>/{guided,scripted-model}-{S,M,L}[-key]-p1.png`.
  Guided M was rendered too (the tool renders all three) and looked at, but not graded.
- Measured from the ink, using the r1 script `crittools/meas.py` and a new `crittools2/gap.py`:
  - A4 at 96 dpi (3.78 px/mm).
  - Bands per cell are measured between the drawn grid lines, on the KEYS (H13-ABS). Ink is any pixel < 200.
  - `gap.py` gives the largest blank band inside a cell.
  - Page used = the last ink above the footer, over the body (y 130–1050 px).
- Read: RUBRIC (incl. §6.1, H13), PAGE_TYPES §2.2 (PT-MOD-1..4) and §2.3 / §12.1 (PT-GDP), and the r1 report.
- Lead rulings 2026-11-12 applied as given:
  - the Guided ceiling stays 10 / 8 / 6;
  - Guided rows are at most 1.42 × content;
  - Guided page fill is NOT scored;
  - one-digit div_facts_long dividends stay;
  - the Scripted Model gets a second worked example.

## VERDICT: FAIL

Lowest score **6** (C3), on mult_facts and div_facts Scripted Model **L** (S4).

The other 23 graded pages score 8 on every criterion:
- 15 Guided pages (S and L, five skills);
- 13 Scripted Model pages (S and M of all five, plus L of add_facts, sub_facts and div_facts_long).

Every r1 build defect is fixed.

## r1 defects: status

| r1 | status | evidence |
|---|---|---|
| G1 Guided S + / − edge clipping | FIXED | Guided S + / − now 3 columns. The dot tiles stay inside the cell: row 1 sides 7.7–11.6 mm, the 8-dot tile of 17 − 8 is whole. EB-EDGE: no ink within 1.5 mm of a divider on any Guided page (minimum 2.4 mm, div_facts_long S "11 ) 44"). |
| G2 / G3 Guided page fill | EXCUSED by lead ruling | Pages use 38–84 %, not scored. |
| S1 Model states identical | FIXED | Each state adds a grey mark group (table below). sub_facts Model is now 10 − 2 = 8, which is unambiguous. |
| S2 step text > 2 lines | FIXED | Longest step text is 2 lines on every page, for example "Count by 10, 8 / times.", "Think: / 9 × __ = 36.", "Read / 36 ÷ 9.". |
| S3 Scripted page fill | FIXED except S4 | 75–94 % used (r1: 23–42 %). |

New grey mark per state (PT-MOD-1):

| skill | state 1 | state 2 | state 3 | last state |
|---|---|---|---|---|
| add_facts | start jot "5" | dot tile + "5, 6, 7" | — | grey 7 |
| sub_facts | jot "10" | dot tile + "10, 9, 8" | — | grey 8 |
| mult_facts | "8 groups of 10" | skip-count list | "8 × 10 = 80" | grey 80 |
| div_facts_long and div_facts | "36 ÷ 9" | "9 × ___ = 36" | "9 × 4 = 36" | grey 4 |

## What passes (checked on every render)

- **Second example:** it is unambiguous and uses the same wording.
  - add 4 + 2;
  - sub 10 − 3;
  - mult 4 × 12;
  - div_facts_long 45 ÷ 5, plus a third example at S, 108 ÷ 12;
  - div_facts 6 ÷ 3, plus a third example at S, 70 ÷ 10.
  - The divisor is never equal to the quotient, and the subtrahend is never equal to the difference.
  - Examples read left to right, one example per row, in step order.
- **Say: band:** on all 15 Scripted pages and correct, for example "36 divided by 9 equals 4.", "10 minus 2 equals 8.".
- **Fade (PT-GDP-1), all 15 Guided pages:**
  - the Model is level 3 (grey answer and hint);
  - the rest of row 1 is level 2:
    - + and −: a dot tile;
    - ×: "a × b is a groups of b";
    - ÷: a "7 × __ = 84" frame;
  - later rows are level 1;
  - the stack rule and the quotient boxes stay on every try.
- **Nothing is given away:** no hint of a try holds its answer. div_facts_long boxes count the dividend's digits
  (4 ) 0 has 1 box, 12 ) 120 has 3).
- **Keys:** facsimiles, and every answer spot-checked is correct:
  - add_facts Guided S: 8/8;
  - div_facts Guided S: 9/9;
  - div_facts_long Guided S: 9/9.
- **Edges and CL-40:**
  - Model content clears the tab. Tries start at the tab keep-out (7.7–9.8 mm).
  - Scripted step circles sit 1.3–2.9 mm inside the dividers.
  - No collisions.
- **Cell bands (H13):**
  - Guided tries: 7–28 %. div_facts Guided M row 3 is 30 % (4.8 mm of 15.9 mm). It is at the 1.42 cap, a rounding case; noted, not scored.
  - Scripted: largest interior gap 14–28 %; bottom bands of states 2..n: 11–28 %.
  - The bottom band of state 1 is 30–34 % on mult S / M and on div_facts_long and div_facts at all sizes. That band is the place where the
    later states' marks appear (the problem stands still and the row height is set by the last state). I accept it by analogy with
    H13-ABS (reserved response place). **Lead:** write this exception into H13 / PT-MOD so the next critic does not have to judge it.

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

| skill | Guided S | Guided L | Scripted S | Scripted M | Scripted L |
|---|---|---|---|---|---|
| add_facts | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 |
| sub_facts | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 |
| mult_facts | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·**7**·**6**·**7** (S4) |
| div_facts_long | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 |
| div_facts | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | 8·**7**·**6**·**7** (S4) |

Page use (last ink, % of body):

| skill | Scripted S | Scripted M | Scripted L |
|---|---|---|---|
| add_facts | 75 | 78 | 89 |
| sub_facts | 75 | 78 | 81 |
| mult_facts | 94 | 93 | 93 * |
| div_facts_long | 94 | 79 | 92 |
| div_facts | 94 | 78 | 91 * |

\* EB-PAGE passes on last ink, but 2 of the 6 state cells are empty (S4).

## Defects

### S4 · Scripted Model L, mult_facts and div_facts: 4 states in a 3-column grid, so 2 empty cells and no second example

**Where:** `fr2-renders/mult_facts/multiplication__mult_facts/scripted-model-L-p1.png` and
`fr2-renders/div_facts/division__div_facts/scripted-model-L-p1.png`, row 2.

**Measured:**
- Row 2 holds only state 4. Cells 2 and 3 are empty, each about 62 × 102 mm. That is 2 of 6 grid cells, about 1/3 of the Model area.
- Only one worked example is on the page.
- `ws-grade-render` reports the grid as 3x2 for both.

**Rules:**
- Lead ruling 2026-11-12: the Scripted Model gets a second worked example (C2 7).
- H13 / RUBRIC anchor 6, "empty cells / half-empty region" (C3 6).
- PT-MOD-1 / §2.2: a state cell holds a state (C4 7).

**Fix:**
1. Never leave an empty state cell. At L with 4 states, lay each example 2 + 2 (Z order, as r1 accepted) and put the second
   example on a continuation page (PT-MOD-3: "Model:" band again, same title, same row height).
2. Or choose the column count from the step count, so the columns divide n. Never go below the 62 mm PT-MOD-2 width.

add_facts, sub_facts (3 steps) and div_facts_long (4 columns fit at L) already do this.

**Check that would have caught it:** **MOD-GRID** in `ws-empty-band --model-states`.
- FAIL when a Scripted Model grid has an empty state cell.
- FAIL when `plan.meta` holds fewer worked examples than the ruling's 2 (counting continuation pages).
- Backtest: fail on f960e549, mult_facts L and div_facts L. EB-PAGE could not catch it, because state 4 carries the last ink to 91–93 %.

## Nits (no score effect)

- **Grey marks:** earlier marks stay grey in later states instead of turning black (PT-MOD-1 letter). I read jots, count lists and
  think lines as hint ink, which is grey by the standard. The new mark is always appended at the bottom of the list, so newness
  still reads. The lead should confirm.
- **Say: band:** it names only example 1. That is acceptable (one oral frame per page).
- **div_facts state 1 jot "56 ÷ 7":** it repeats the printed problem, so it is a weak mark for "Read".
- **div_facts answer place:** the answer sits between the equation and the short rule, 1.6 mm below the equation. It is tight, but clear.
- **sub_facts Guided Steps item 2:** it still offers two strategies ("count back, or think addition"). The Model uses count back only.
- **Guided S at 3 columns (+ / −):** it holds 8 tries, the same as M. That is within the 10 ceiling.

## Rule 00: speed reflection lists

**Automatic checks that would have caught each finding:**
1. **S4:**
   - MOD-GRID: no empty state cell in a Scripted Model grid, and worked examples ≥ 2 (ruling), counting continuation pages.
   - Backtest: fail on f960e549, mult_facts / div_facts Scripted L.
2. **S4, root cause:** a unit assertion in the scripted-model role. `columns` must divide `states.length`, or the remainder cells
   are filled by the next example. Run it at S / M / L for every fact skill without a browser.
3. **H13 state-1 band (accepted):** teach EB-BAND that a Scripted state's band below its marks is reserved when a later state of
   the same example puts ink there. Then the gate and the critic agree, and the 30–34 % reading stops being a judgment call.

**Speed-ups this round revealed:**
1. **Run the r2 gates at every size.** The lane's gates passed because EB-PAGE reads last ink. One L thumbnail per 4-step skill
   would have shown the 2 empty cells. Make `ws-grade-render --contact` a 15-thumbnail sheet that the lane looks at before
   calling the critic.
2. **Turn a lead ruling into a check the same day.** "Second worked example" was a ruling with no gate. Every ruling that sets a
   count gets an assertion on `plan.meta` in the same change.
3. **Do not re-grade unchanged pages.** The narrow re-render was right: Guided pages were unchanged except S + / −, so a hash
   diff vs 343e0b78 could skip them in round 3. Only mult / div Scripted L need re-grading after the S4 fix.
