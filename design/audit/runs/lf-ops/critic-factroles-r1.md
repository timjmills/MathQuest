# Critic: facts-roles, narrow round 1 (Guided + Scripted Model, five fact skills)

- Critic: independent (built none of it), Opus medium, 2026-11-12.
- Tree: frozen worktree `critfr2` at 343e0b78 (branch `claude/sweet-newton-c8wrv1-lf-ops-factroles`). No source edits.
- Renders: `ws-grade-render --skills <s> --roles guided,scripted-model --size S,M,L --no-screen`, one skill per run through
  `/tmp/mq-browser-run.sh`. PNGs: `scratchpad/fr-renders/<skill>/<cat__skill>/{guided,scripted-model}-{S,M,L}[-key]-p1.png` (60 pages).
- Measured from the ink (independent PIL script, `scratchpad/crittools/meas.py`): A4 at 96 dpi (3.78 px/mm); bands per cell
  between the drawn grid lines, pixels < 200 count as ink; "page used" = last ink above the footer over the body (y 130–1050 px).
  Cell bands were measured on the KEYS (answers in), so the empty answer slot counts as content (H13-ABS).
- Read: RUBRIC (incl. §6.1, H5, H13), PAGE_TYPES §2.2 / §2.3 (PT-MOD-*, PT-GDP-*), WORKSHEET_DESIGN_STANDARD §3.4 / §12.1,
  PEDAGOGY P-7 / P-FL-17, `design/status/lf-ops-factroles.md`. Lead ruling 2026-11-12 option (b) applied as given.

## VERDICT: FAIL

Lowest score **6** (C3). Only Guided **M** passes, on add_facts, sub_facts and mult_facts. Two kinds of failure:

- **Build defects (the lane fixes these):** G1, S1, S2.
- **Page fill (the lead decides):** G2, G3, S3. These are the result of ruling (b) itself: at most 10 / 8 / 6 tries, rows at
  most 1.42 × content, and the rest left under the grid. With short fact rows, that leaves 30–62 % of the Guided page blank and
  58–77 % of the Scripted Model page blank. §12.1 allows white under the grid, but I was asked whether the page still reads as a
  page. Under 50 % used, it does not (anchor 6, "half-empty page"). Between 50 and 70 % used, a teacher would notice it
  (anchor 7). The lane cannot fix this within the ruling, so the lead must decide.

## What passes (checked on every render)

- **Fade, PT-GDP-1 (all 15 Guided pages).**
  - Cell 1 (Model) is level 3: grey answer, plus a grey tile or think line.
  - The other cells of row 1 are level 2:
    - + and −: a grey dot tile;
    - ×: a grey "a × b is a groups of b" line;
    - ÷: a grey "8 × __ = 56" frame.
  - Every later row is level 1.
  - Structure stays on every try: the stack rule and the bracket's quotient boxes.
- **Nothing is given away.**
  - The hints of the tries never hold the answer.
  - The div_facts_long boxes count the dividend's digits, not the answer's: 9)81 has 2 boxes, 4)0 has 1, 12)120 has 3.
- **One answer place per page:** under the rule, in the quotient boxes, or on the write line.
- **Keys are facsimiles and every answer checked is correct:**
  - add_facts S key: 10/10;
  - div_facts_long M key: 8/8;
  - div_facts M key: 9/9.
- **Digit sizes follow TY-30:**
  - Fact stacks are 28 pt at 1–5 columns on every size, so S, M and L stacks are the same size by rule ("columns win").
  - div_facts horizontal equations step up S < M < L.
- **CL-40:** no Model content sits under the Model tab. The tries of row 1 start at the tab's keep-out (9.0 / 9.0 / 9.8 mm),
  level with the Model.
- **H13 inside cells:** every cell band is below 30 %.
  - Guided tries: 27–28 % bottom bands (the 1.42 cap shows).
  - M side bands: 15.9–17.5 mm of about 62 mm (≤ 28 %).
  - Scripted states with an empty slot: 31 % on add_facts states 1–2 at S and M. The empty slot is content, so this passes.
- **Scripted Model:**
  - Numbered states read left to right; div_facts L uses 2 + 2 in Z order, which is also clear.
  - The `Say:` frame is present and correct on all 15 pages (for example "56 divided by 7 equals 8.").

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

| skill | role | S | M | L |
|---|---|---|---|---|
| add_facts | guided | 7 · 8 · **6** · 7 (G1, G3) | 8 · 8 · 8 · 8 | 8 · 8 · 7 · 8 (G3) |
| add_facts | scripted-model | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 |
| sub_facts | guided | 7 · 8 · **6** · 7 (G1, G3) | 8 · 8 · 8 · 8 | 8 · 8 · 7 · 8 (G3) |
| sub_facts | scripted-model | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 |
| mult_facts | guided | 8 · 8 · 7 · 8 (G3) | 8 · 8 · 8 · 8 | 8 · 8 · 7 · 8 (G3) |
| mult_facts | scripted-model | 8 · 7 · **6** · 7 (S2) | 8 · 7 · **6** · 7 (S2) | 8 · 7 · **6** · 7 (S2) |
| div_facts_long | guided | 8 · 8 · **6** · 8 (G2) | 8 · 8 · **6** · 8 (G2) | 8 · 8 · 7 · 8 (G3) |
| div_facts_long | scripted-model | 8 · 7 · **6** · 7 (S2) | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 |
| div_facts | guided | 8 · 8 · **6** · 8 (G2) | 8 · 8 · **6** · 8 (G2) | 8 · 8 · 7 · 8 (G3) |
| div_facts | scripted-model | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 | 8 · 7 · **6** · 8 |

Every scripted-model page also carries S1 (C2 7) and S3 (C3 6).

Measured page use (last ink, % of body):

| skill | Guided S / M / L | Scripted S / M / L |
|---|---|---|
| add_facts | 56 / 78 / 59 | 28 / 28 / 30 |
| sub_facts | 56 / 78 / 59 | 30 / 31 / 36 |
| mult_facts | 62 / 84 / 69 | 34 / 36 / 42 |
| div_facts_long | 39 / 46 / 56 | 23 / 29 / 34 |
| div_facts | 38 / 44 / 56 | 23 / 29 / 39 |

## Defects

### G1 · Guided S, add_facts and sub_facts: the hinted row 1 overflows its 5 columns

Class: overlap / clipping (C1 7, C3 6, C4 7).

**Where:**
- `guided-S-p1.png` of add_facts and sub_facts, row 1, cells 1–5. The keys are the same.
- Crops: `scratchpad/crittools/addS-row1.png`, `subS-row1.png`, `subS-tile3.png`.

**Measured:**
- Row 1 ink sits **0.0 mm** from the left divider and **0.3 mm** from the right one (add S).
- Every dot tile runs onto the right divider and covers it.
- sub_facts 17 − 8: the 8-dot tile is clipped by the next cell, and its fifth dot is cut in half.
- The tile of cell 5 crosses the page frame (add and sub).
- The −/+ of each next cell touches the divider.
- The Model's sum rule starts on the frame.
- Row 2 (no tile) keeps 3.4–5.3 mm a side, so the answer lines of row 1 and row 2 are not in the same place.

**Rules:**
- RUBRIC C1 "nothing clipped, overlapped";
- CL-5 / the 2 mm white each side used for facts (PAGE_TYPES 1205);
- C1 "the same task looks the same in every cell".

**Fix:** pick Guided S columns from the hinted row's width (fact + tile + 2 mm a side), not the bare fact's. That gives 4 columns
at S for + and −. Or put the tile under the operands in row 1. Lead ruling "S may use 5 columns" holds only where the hinted
row fits.

**Check that would have caught it:**
- `ws-empty-band` **EB-EDGE** (new): any ink within 1.5 mm of, or crossing, a cell divider or the frame, on every row. This
  includes the hinted row 1, which EB-SIDE does not test for collisions.
- Plus `ws-print-lint` L-OVERFLOW run on the Guided role at S.

### G2 · Guided page under half used: div_facts_long S and M, div_facts S and M

Class: page fill (C3 6, anchor 6).

**Where:** `guided-{S,M}-p1.png` of div_facts_long and div_facts.

**Measured:**

| page | used | blank |
|---|---|---|
| div_facts_long S | 39 % | 61 % |
| div_facts_long M | 46 % | 54 % |
| div_facts S | 38 % | 62 % |
| div_facts M | 44 % | 56 % |

- div_facts M rows 2–3 are 15.9 mm tall, which looks cramped above an empty half page.
- div_facts_long S row 2 is 20.1 mm tall.

**Rules:**
- RUBRIC anchor 6 ("half-empty page");
- H5 in spirit. The role's ceiling stops more tries, so H5 does not apply in letter.

**Fix (the lead decides, because ruling b caps both levers):**
1. For one-symbol fact answers, give Guided the Independent page's one-symbol allowance (§12.1: up to 16 on 2 × 8 at S).
2. Or let fact rows on Guided grow past 1.42 × up to an even share of the page.
3. Or print the optional teacher-prompt strip and a second Model.

**Check:** a `ws-empty-band` **EB-PAGE** rule: a Guided or Scripted page with less than 50 % of the body used FAILS, and less
than 70 % WARNS. It is measured from the ink, like the table above.

### G3 · Guided pages 50–70 % used, blank strip of 31–44 % under the grid

Pages: add S / L, sub S / L, mult S / L, div_facts_long L, div_facts L. Class: page fill (C3 7).

**Measured:** 56–69 % used (table above).
- §12.1 allows white under the grid.
- The standard's own history treats a 20–26 % strip under the grid as a defect: that is why the ceiling was raised to 10 / 8
  (pv-r1).
- At 31–44 % the page reads as a half sheet.

**Fix:** as G2, once the lead decides. If the lead keeps ruling (b) as written, re-grade these pages with the strip excused.
They would then score 8 (and S of add / sub still fails on G1).

**Check:** EB-PAGE WARN band (as G2).

### S1 · Scripted Model, all 15 pages: earlier states have no new mark, so the frozen states do not show the steps

Class: teaching / PT-MOD-1 (C2 7).

**Where:** every `scripted-model-*-p1.png`. Examples:
- add_facts: states 1 "Start with 5." and 2 "Count on 2: 6, 7." draw the same blank 5 + 2. There are no counted dots and no grey
  6, 7, although the Guided page has the dot tile.
- sub_facts: states 1–3 are identical.
- mult_facts: states 1–3 are identical; the skip count 10…80 is only in the text.
- div_facts_long and div_facts: states 1–3 are identical; "9 × __ = 36" is never drawn.

Only the last state adds a mark (the grey answer).

**Measured:** in states 1 to n − 1, 0 new mark groups (PT-MOD-1: "exactly one new mark group per state").

Also, in sub_facts the Model problem is **10 − 5 = 5**: the answer equals the subtrahend, so "5 + 5 = 10" does not show which
5 is the answer. The Model should exclude doubles whose answer equals the subtrahend.

**Rule:** PT-MOD-1, §2.2 purpose ("the newest marks in trace grey").

**Fix:** the fact providers' `workedSteps` return `marks` per step, drawn in grey at each state:
- + / −: the dot tile, then the grey count-on or count-back numerals;
- ×: the grey skip-count row;
- ÷: the grey "9 × __ = 36" frame, then the grey factor.

In sub_facts, the Model picker skips a − b where b = a − b.

**Check:** a `ws-cell-checks` rule **MOD-MARKS**: on a Scripted Model render, each state's ink differs from the previous
state's (a pixel or DOM diff more than 0). It fails when two adjacent states are identical.

### S2 · Scripted Model step text over two lines

Class: PT-MOD-2 (C4 7).

**Where and measured:**
- mult_facts step 2 "Count by 10, 8 times: 10, 20 … 80.": **4 lines** at M and **5 lines** at L (S likewise).
- div_facts_long S steps 2 and 3: **3 lines** each.

**Rule:** PT-MOD-2 "Step text is cell-text size, 2 lines at most".

**Fix:**
- Move the skip-count list out of the text and into the state as the grey mark (S1). Step 2 then reads "Count by 10, 8 times."
- Shorten "Write the times fact with a gap: 9 × __ = 36." to "Write 9 × __ = 36."

**Check:** a `ws-cell-checks` **MOD-LINES** rule: count the line boxes of each step text and FAIL above 2.

### S3 · Scripted Model page 23–42 % used

All 15 pages. Class: page fill (C3 6, anchor 6).

**Measured:** table above.
- The side-by-side states (ruling, step 1 of this task) put one problem in a single row about 51–80 mm tall.
- The §2.2 anatomy stacks one state per row at Hg 36 / 45 / 54 mm, with the text column beside it. That would use about 60–75 %.

**Fix (the lead decides):**
1. Return to the §2.2 stacked anatomy, with the text column taking the width beside a 62 mm state cell (PT-MOD-2), so that
   EB-SIDE is met by the text, not by blank.
2. Or keep side-by-side and print the second example (the §2.2 teacher option, identical wording) as a second row.

**Check:** EB-PAGE (G2).

## Nits (no score effect)

- Guided pages print `Score ___ /N`. PT-FRM-4 says the Guided page omits Score, but §2.3 says its cells are scored. The two
  documents disagree, so the lead should settle it.
- div_facts answer place moves between sizes: under the equation at S and L, inline after "=" at M. It is consistent within a
  page.
- mult_facts L Model hint wraps "9, / 18, 27": the count list breaks across lines.
- sub_facts Steps item 2 offers two strategies ("count back, or think addition").

## Rule 00: speed reflection lists

**Automatic checks that would have caught each finding:**
1. **G1:** EB-EDGE in `ws-empty-band`. Ink within 1.5 mm of, or across, a divider or the frame on any row, including the
   hinted row 1. Backtest on 343e0b78: add_facts / sub_facts Guided S.
2. **G2, G3, S3:** EB-PAGE in `ws-empty-band`. Page-used ratio from the ink: below 50 % FAIL, below 70 % WARN. Backtest on
   343e0b78: div_facts S fails at 38 %, and every Scripted Model page fails.
3. **S1:** MOD-MARKS in `ws-cell-checks`. Adjacent Scripted Model states must differ in ink. Plus a provider unit test:
   `workedSteps(q)` for the five fact skills returns `marks` on every step but the last.
4. **S2:** MOD-LINES in `ws-cell-checks`. Step text must be at most 2 line boxes.
5. **S1 (Model choice):** a dealer predicate `MODEL-UNAMBIGUOUS`. The Scripted / Guided Model of − facts is not a − b with
   b = a − b.

**Speed-ups this round revealed:**
1. **Ask the lead the fill question before the build, not in the critic round.** Ruling (b) fixed the ceiling, the stretch and
   the leftover together, and the critic was the first to put page-used numbers on them.
2. **Re-render every role the ruling touches, at every size, and keep the hinted row in the fit test.** The 5-column S choice
   was measured on bare facts. One crop of row 1 at S would have shown G1 in a minute.
3. **The scripted-model check covered layout only.** The status note hashes 52 unchanged renders but never looks at what each
   state draws. The `--no-baseline` empty-band run was green while every Model state was identical.
4. **The 96 dpi PNGs are too coarse for 1 mm collisions.** `ws-grade-render` needs a `--dpi 192` option for S critic crops.
