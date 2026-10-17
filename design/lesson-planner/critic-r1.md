# Atomisation Lesson Planner V21: independent critic, round 1

Critic: Opus, medium effort, 2026-10-16. I did not build this and graded it cold.

**Verdict: FAIL.** Seven pages score below 8 on at least one criterion, and so does the V21 document on all four of
its criteria.

## What I graded and how

- **The sample pack.** I looked at all 22 PNGs of `design/lesson-planner/sample-v21/` at full size, with 200–300 dpi
  crops from `pack.pdf` wherever detail mattered.
- **The V21 document.** `Atomisation_Lesson_Planner_V21.md`, all 6,962 lines, checked against `V20-AUDIT.md`
  (§1a, §2, §3, §3a, §4, §5, §6), `WORKSHEET_DESIGN_STANDARD.md` (§2, §3.2, §6, §7, §11.2) and `PEDAGOGY_STANDARD.md`
  (§8.5, §10.1), plus `design/PAGE_TYPES.md` (§4.4, PT-ANC, PT-FPR-9) and `design/audit/RUBRIC.md`.

**The gold standard.**
- The committed site samples in `design/lesson-samples/add-within-10/`.
- A fresh render of the same lesson on this branch: `node tests/scripts/ws-lesson-samples.cjs --sizes L --only add`.
  The script stopped at its PyMuPDF step, so I rasterised its PDFs with `pdftoppm -r 110`. That render has the
  © line, A4 and 4 pupil pages plus 4 key pages. Its anchor chart also gets a key page.

**Measurements.**
- *Cell empty bands.* I ran the site's own H13 measure (the `sheetCheck` logic in `ws-lesson-samples.cjs`, slots
  counted as content) on `pack.html` in Chromium (scratch script `meas.cjs`). On a key page the answer row counts as
  content.
- *Paints.* A saturated-pixel histogram on every PNG.
- *Page fill.* Measured off the PNGs.

---

## 1. Grades

RUBRIC criteria: C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity. Teacher pages are
read with "pupil" meaning "teacher mid-lesson", plus audit §4. A row passes only if every number is 8 or more.

| PNG | Page | C1 | C2 | C3 | C4 | Caps | Pass |
|---|---|---|---|---|---|---|---|
| page-01 | T1 Lesson at a glance | 9 | 8 | 9 | 8 | — | PASS |
| page-02 | T2 Atomisation | 8 | **6** | 8 | **7** | — | FAIL |
| page-03 | T2b Reference | 8 | 8 | **6** | 8 | — | FAIL |
| page-04 | T3 Delivery 1–4 | 8 | 9 | 9 | **7** | — | FAIL |
| page-05 | T4 Delivery 5–6 | 8 | 9 | 8 | 8 | — | PASS |
| page-06 | T5 Delivery 7–10 | 8 | 8 | 9 | **7** | — | FAIL |
| page-07 | P0 Prerequisite Check | 9 | 8 | 8 | 9 | — | PASS |
| page-08 | P1 Number sense | 8 | 8 | 9 | 8 | — | PASS |
| page-09 | P2 Anchor chart | 9 | 8 | 8 | 8 | — | PASS |
| page-10 | P3 Lesson sheet | 8 | **7** | **6** | 8 | H13 | FAIL |
| page-11 | P4 Practice 1 | 9 | 9 | 9 | 9 | — | PASS |
| page-12 | P4 Practice 2 | 9 | 9 | 9 | 9 | — | PASS |
| page-13 | P5 Word problem | **7** | 8 | 8 | 8 | — | FAIL |
| page-14 | P6 Exit slip (2-up) | 8 | **7** | **6** | 8 | H13 | FAIL |
| page-15 | Key P0 | 9 | 8 | 8 | 9 | — | PASS |
| page-16 | Key P1 | 8 | 8 | 9 | 8 | — | PASS |
| page-17 | Key P3 | 8 | **7** | **6** | 8 | H13 | FAIL |
| page-18 | Key P4 Practice 1 | 9 | 9 | 9 | 9 | — | PASS |
| page-19 | Key P4 Practice 2 | 9 | 9 | 9 | 9 | — | PASS |
| page-20 | Key P5 | **7** | 8 | 8 | 8 | — | FAIL |
| page-21 | Key P6 | 8 | **7** | **6** | 8 | H13 | FAIL |
| page-22 | T6 routing page | 9 | 8 | **7** | **7** | — | FAIL |
| (missing) | Key of P2 anchor chart | — | — | — | — | — | see R1-14 |

The V21 document, graded on four criteria of its own:

| Criterion | Score | Pass |
|---|---|---|
| D1 Fidelity to the site profile | **7** | FAIL |
| D2 Completeness and self-containment | **7** | FAIL |
| D3 Decision-rule clarity | **7** | FAIL |
| D4 Checkability (the self-check is measurable and matches the site's gates) | **7** | FAIL |

**What is right.**
- *Practice pages and their keys* reach the site's gold standard: 3 × 4, 28 pt, the step strip, edge cases in the
  last row, facsimile keys in #C2410C.
- *Colour.* The only colours are #000, #FFF, #949494, #5B2A86 (step marks) and #C2410C (keys, teacher answers). The
  histogram found no other saturated colour on any page.
- *Pedagogy kept.* 10 V20 sections spot-checked against V21 have text similarity 0.94–1.00: Rosenshine,
  six atom types, No Opt-Out, six planning steps, CfU category 1, misconceptions K–5, Chaining Bridge,
  Enhancement 4, how to teach each atom, Equity myths, Top Tips, Teacher Wording Reference.
- *Values.* 25 values were spot-checked against WDS. 24 match: B(1–5), Hw, circle 12, check box 7, answer square 24,
  digit strip 12 / 8, time 20 × 12, digits 28, fraction 20, clock 42, title 18, text 15, zone 12, letter 10, tab 10,
  footer 7, number tab 6 / 11 pt / 8.4, CL-8 pads 6 / 8 / 4, CL-5 40 %, dash 3 / 2, missing-digit 1.5 / 1, slot
  radius 1.5, body 236 and the Letter heights. The one miss is in R1-16.

---

## 2. Defects, by severity

Each defect is laid out the same way:
- **Where**: the page PNG and region, or the V21 lines.
- **Observed vs expected**, with the measurement.
- **Cost**: the criterion and the points it costs.
- **Fix**: the exact change.
- **Check**: what proves it is fixed.

### R1-1 (critical, H13): lesson-sheet cells leave a 41–44 % empty band

- **Where**: page-10 (P3) and page-17 (its key), the `Guided Practice:` and `Independent Practice:` bands.
  V21 §9.4, lines 2856–2885 ("The Guided and Independent bands share the spare height (equal flex)").
- **Observed**:
  - Guided cells are 39.3 × 73.8 mm and Independent cells 61.5 × 74.3 mm.
  - With the answer row counted as content (key page), the empty band below the answer is **44 %** (Guided) and
    **41 %** (Independent). On the pupil page it is 59 % / 56 %.
  - The site's Guided cells on the same lesson are about 55 mm tall, with about an 18 % empty band.
- **Expected**: no band of 30 % or more (RUBRIC H13). OR-a says "if space is still left, add a problem".
- **Cost**: C3 capped at 6.
- **Fix**:
  - Set the Guided band to the site's height: one stack plus the 12 mm answer row plus pads, about 55 mm.
  - Make `Independent Practice:` two rows of 3 (a.–f., 6 items).
  - Set Score `/6`.
  - Rewrite §9.4's last bullet: "Guided cells are sized to their content (stack + answer row + 8 mm); the
    Independent band takes the remaining height in whole rows of 3; add a row while every cell stays ≥ 45 mm."
- **Check**: the H13 measure on the key page (answer counted as content) gives a bottom band under 30 % in every P3
  cell, and the page is still 90 % or more used.

### R1-2 (critical, H13): the exit-slip half holds one fact in a cell that is 58–69 % empty

- **Where**: page-14 and page-21 (the cell of each half). V21 §9.7, lines 2937–2957, and CL-9 at line 2484.
- **Observed**:
  - The cell is 125.4 × 104.1 mm and holds one stack, 5 + 1.
  - The bottom empty band is 69 % on the pupil page and 58 % on the key; the right band is 64 %.
  - Each half is a lone item. The site's own exit-slip format (PAGE_TYPES §4.4 Practice strips) holds 10–11 facts
    per half.
- **Expected**: no band of 30 % or more (H13); no lone item on a page-equivalent (H5 spirit).
- **Cost**: C3 capped at 6.
- **Fix**:
  - Each half holds a 2 × 2 grid of 4 facts in the Practice cell format, one per case the chart teaches: big first,
    big second, same numbers, sum of 10. Example: 6 + 2, 3 + 7, 2 + 2, 1 + 8 (new facts, see R1-11).
  - Keep the `Say:` band (first item) and the two check boxes.
  - Score `/4`.
  - Rewrite §9.7: "4 items (2 × 2), one per case; cells equal; no lone item."
  - Remove the 62 mm CL-9 placement from the slip.
- **Check**:
  - The H13 measure on the slip key: every band under 30 %.
  - E20 no longer exempts the exit slip.

### R1-3 (major): the exit item does not test the lesson's critical atom

- **Where**: page-14, item a, `5 + 1`. Appendix F row 14 (line 6631).
- **Observed**: 5 + 1 is the easiest case. The big number is first and there is one count, so a pupil who counts
  from the first number still gets 6. It cannot reveal "Starting small" or "Counting the start" (the T2 mistakes).
- **Expected**: the exit question checks the critical atom (count on from the big number, start not counted). That
  means a big-second item with a count of 2–3.
- **Cost**: C2 −1 (P6 and its key).
- **Fix**:
  - Use the 4-item set of R1-2. If one item is kept, use 2 + 6 or 3 + 5.
  - Add to §9.7: "The exit items include the Critical Atom's hardest case (here: big number second, count 3)."
- **Check**: each slip item is listed on T5 Section 10 with the mistake it detects.

### R1-4 (major): T2 breaks V21's own atomisation spec

- **Where**: page-02, `What students need to know:` table. V21 lines 3657–3690 (min 5 atoms; types
  Category / Comparative / Fact / Conceptual; prerequisites first, tagged "Pre-requisite"; bold key name). The
  ALWAYS rule at line ~5383 ("Use all six atom types … never drop any type").
- **Observed**:
  - The table has **4 atoms**, typed "Concept", "Fact / property" and "Procedure detail". None of these is a V21
    atom type.
  - No Pre-requisite tag.
  - Its columns (Atom · Type · Pupil can say) differ from the spec (# · Skill or Concept · Atom Type · Teacher Notes).
  - The routine table uses ★ to mean "prerequisite", but the T2b legend says ★ means "Guided Practice".
- **Expected**: at least 5 atoms, the V21 type names, Pre-requisite rows first, bold "**Key name:** sentence".
- **Cost**: C2 −2 (the planner's core method is misapplied on its own sample), C4 −1 (a mark with two meanings).
- **Fix**:
  - Rebuild the table to lines 3676–3690. Use at least 5 atoms, e.g.:
    1. **Bigger number:** … (Comparative, Pre-requisite)
    2. **Next number:** … (Fact, Pre-requisite)
    3. **Count on:** … (Conceptual, New)
    4. **Turn-around:** … (Fact, New)
    5. **Start is said:** … (Category, New)
  - Use the tag text "Pre-requisite" instead of ★ in the routine table, and say in §8.12 that ★ is only a fade label.
- **Check**: a T2 checklist in Appendix E (new E21): count ≥ 5, every type in the set of 4, no ★ outside fade labels.

### R1-5 (major): pupil-page thumbnails are missing on T3 and T5

- **Where**: page-04 (Sections 1–2 use P0 and P1) and page-06 (Sections 8–10 use P3, P4, P5 and P6). V21 §10.9,
  line 3020: "Where a pupil page is used, a thumbnail of that pupil page … sits at the right of the first rows".
- **Observed**: only T4 has thumbnails (2 of the 8 sections that use a pupil page).
- **Expected**: one 55 × 77.8 mm thumbnail per section that uses a pupil page.
- **Cost**: C4 −1 on T3 and T5. The teacher also loses "Board = Paper" at the Prerequisite Check and in the You Do.
- **Fix**: add the thumbnails (P0 beside Section 1, P1 beside Section 2, P4 Practice 1 beside Section 8, P5 beside
  Section 9, P6 beside Section 10). Let the overflow continue on a 12 mm continuation page, or change §10.9 to "one
  thumbnail per delivery page, the page used longest". State which, and size the rule so it fits.
- **Check**: new self-check E22: every delivery section with a `data-pupil-page` attribute has a `.thumb` child.

### R1-6 (major): fade labels are missing on teacher pages and T6

- **Where**: page-04, page-05, page-06 and page-22. V21 lines 2188–2189: "Every problem in every section is labelled
  with its fade level on the teacher pages (T3–T5) and on the answer key routing page (T6)".
- **Observed**: no ★ / ★★ / ★★★ on any problem in T3–T6.
- **Cost**: C4 −1 (T5, T6).
- **Fix**: add a `Fade` column to T6 `Answers at a glance` (Guided ★, Independent and Practice rows a–i ★★, last row
  ★★★), and a ★ label after each item reference in the T4 / T5 Note lines.
- **Check**: E23: every item id on T6 carries one of ★ / ★★ / ★★★.

### R1-7 (major): stale V20 bodies contradict Part 8–10

The document relies on the line-60 precedence clause, but another AI reading the body will build the wrong page.
- **Where**: V21 lines
  - 3878–3925: Section 1a. "Both Easy and Hard versions are written on P1", TRY THIS / CHALLENGE in two columns,
    "Answer: [red]", the "NUMBER SENSE WARM-UP" capitals template.
  - 3995–4040: Section 1b. "Option A … PRINTED on student sheet (P1)", and "0–1 grade" at line 3997, which audit C-21
    said to fix.
  - 5360–5362: "Student Mastery Practice cards: 2-column grid … 'SHOW WORK BELOW:' … dashed-border boxes. 'FINAL ANS'".
    The line-5231 note says these were deleted. Audit §2 "DURING THE LESSON" required their replacement.
  - 5388–5390: "Write ★ You Do problems with BOTH scaffolds: first 1–2 steps pre-filled AND a brief text hint". This
    contradicts §8.12.5 and the C-14 fade.
  - 3681: `<span class="atom-type">FACT</span>` in capitals, against §10.4.
  - 4089 / 4103: "in red".
- **Observed**: 25 sections carry a "V21 changes to this section" note over an unedited V20 body. At least the six
  passages above still state the V20 look or the V20 fade.
- **Expected**: audit §5 deliverable 1, "written from V20 with every §2 verdict and §3 fix applied".
- **Cost**: D1 −2, D3 −1.
- **Fix**:
  - Rewrite each listed passage to the V21 rule, or delete it:
    - 1a and 1b delivery templates: bands A / B; Option A on mini whiteboards only.
    - Line 5360: "Practice pages follow §9.5".
    - Line 5388: the §8.12.5 fade table.
    - Line 3681: "Fact".
    - Lines 4089 / 4103: "in the key colour".
  - Keep the overlay notes only where the body is otherwise correct.
- **Check**: `grep -nE "TRY THIS|CHALLENGE|SHOW WORK|FINAL ANS|dashed-border|in red|steps pre-filled|PRINTED on student" Atomisation_Lesson_Planner_V21.md`
  returns only lines inside the conversion tables of the number-sense bank.

### R1-8 (major): the H13 exception in V21 makes the empty-band rule unenforceable

- **Where**: V21 §8.9 "Empty bands" (lines 2493–2494), §8.12.2 step 3 (2570–2571), E11 (line 6398). The result is
  R1-1 and R1-2.
- **Observed**: right and bottom bands are exempt whenever they are "the open answer / work zone", and nothing caps
  that zone. So the self-check passes P3 at 44 % and the slip at 64 %. The site's measure in `ws-lesson-samples.cjs`
  counts slots as content and flags the remaining open band.
- **Expected**: a decision rule that tells the builder when a work zone is full.
- **Cost**: D3 −1, D4 −2.
- **Fix**:
  - Replace the exception with: "The answer / work zone may be exempt only when the item asks the pupil to draw or
    work (Draw it, hops, a picture they mark, a work grid). For an answer written in a slot or an answer row, the zone
    is the slot plus one Hw (10 mm). Spare height beyond that means: add a row (OR-a)."
  - Make E11 measure the same way as the site (slot elements counted as content).
- **Check**: E11 run on the current sample flags P3 and P6 (it must). After R1-1 and R1-2 it passes.

### R1-9 (major): the RCDWS panel is cramped and splits two actions across one check box

- **Where**: page-13 and page-20, the right third of the top row. V21 §9.6, lines 2916–2930.
- **Observed**:
  - The panel column is about 62 mm wide at 15 pt.
  - "Read it two times." wraps to 2 lines, and "Circle the numbers. Underline the question." wraps to **4 lines**
    with one check box.
  - The rows are uneven (1, 2, 4, 1, 2 lines), so the boxes do not line up with steps.
  - PED §8.5 (P-WP-14) prints Circle and Underline as two separate boxes.
- **Cost**: C1 −1 (a pupil cannot tell which box goes with which action).
- **Fix**:
  - Six one-action lines: Read it two times · Circle the numbers · Underline the question · Draw it · Write the
    equation · Solve. Check.
  - Widen the panel to 40 % (74 mm) and the story box to 60 %. The story has three 30-character lines, so it fits.
  - Or set the panel text at 13 pt, the Steps-box exception in §8.3.
  - Keep one line per box.
- **Check**: every panel row is 1 line (measured row height ≤ 9 mm).

### R1-10 (major): T2b is 41 % empty

- **Where**: page-03, below y ≈ 760 px of 1287. The self-check reports E9 = 59 %.
- **Observed**: the lower 41 % of the body is blank inside the frame. "Print once per unit." floats mid-page.
- **Expected**: the page full but not crowded. Half-empty page = anchor 6. The site lint flags any page with more
  than 8 % of its body blank at the bottom.
- **Cost**: C3 −4 (capped at 6).
- **Fix**:
  - Add the reference tables a teacher actually needs mid-unit:
    - "Slot shapes" (line / box / circle / check box / answer row, with mini drawings);
    - "Data loop" (the three T-LOOP shapes);
    - "Icons" (the 15 icons with their meanings);
    - "Band labels".
  - Move "Print once per unit." to the footer right, as audit §4 says.
- **Check**: E9 at 85 % or more on T2b, and a new check that the body is no more than 8 % blank at the bottom (the
  site's lint).

### R1-11 (minor): turn-around rule is ambiguous, and the sample has 13 turned-round pairs

- **Where**:
  - V21 §9.5, lines 2906–2908: "no item twice in the packet (chart examples included, nor turned round)".
  - Appendix F, lines 6611–6612: "turned round included where possible".
- **Observed**: 13 turned-round pairs across the packet: 5+2 / 2+5, 3+4 / 4+3, 1+6 / 6+1, 8+1 / 1+8, 2+3 / 3+2 (P3
  and the story), 6+3 / 3+6, 1+7 / 7+1, 5+3 / 3+5, 2+6 / 6+2, 1+2 / 2+1, 4+1 / 1+4, 4+2 / 2+4, 3+7 / 7+3. Plus the slip
  5+1 against 1+5.
  - The pool holds only 21 unordered facts, and the packet deals 35, so this is unavoidable.
  - The self-check marks it PASS anyway.
- **Cost**: D3 −1.
- **Fix**: state the rule as:
  - "No exact repeat in the packet; no turn-around pair on one page."
  - "When the pool has fewer unordered facts than the packet needs, a turn-around may appear on a later page."
  - Add the pool-size test to Appendix E.
- **Check**: E24 lists exact repeats (0) and same-page turn-arounds (0).

### R1-12 (minor): every Guided cell is the same case

- **Where**: page-10, `Guided Practice:` 2 + 3, 1 + 6, 1 + 8.
- **Observed**: all three are big number second. The chart's worked example (7 + 2, big first) is not rehearsed in
  Guided. The site's Guided is 2 + 3, 8 + 2, 2 + 5 (varied).
- **Expected**: LR-4, "2–3 varied cells". Cell 1 should mirror the Model's case.
- **Cost**: C2 −1 (P3 and its key).
- **Fix**: Guided 6 + 2 (big first, step 1 grey), 2 + 7 (big second), 3 + 3 (same). Add to §9.4: "Guided cells cover
  the Model's case first, then the other cases".
- **Check**: by eye against the chart's case list (Appendix E last paragraph).

### R1-13 (minor): the anchor chart's other examples are mislabelled and drawn in the wrong ink

- **Where**: page-09, lower band. V21 §9.3, lines 2836–2848.
- **Observed**:
  - The band is labelled `Model:`, but the worked panels above it are the Model. The site chart labels this band
    `Another example:` (`roles/lesson.js` line 735).
  - The final-state answers 10 and 6 are grey. The site draws other examples "with every step done, all in black"
    (`lesson.js` line 741).
- **Cost**: C4 −1, C2 −1 (grey reads as "trace this" on a poster that has nothing to trace).
- **Fix**: label the band `Another example:` (add it to the §8.8 band vocabulary). Draw the other examples all in
  black.
- **Check**: E3 shows no #949494 inside the other-examples band.

### R1-14 (minor): the anchor chart has no key page

- **Where**: the key sequence (page-15 to page-21); V21 lines 2643 and 3021.
- **Observed**: no anchor-chart key. The site's lesson renders one, identical to the chart but with the tab
  `Answer Key` (fresh render, key-1.png). CLAUDE.md says every page of every skill prints an answer key.
- **Cost**: parity only (no score is docked: the chart has no slots).
- **Fix**: print the chart's facsimile with the tab `Answer Key`, and drop the "no separate key" line from T6.
- **Check**: E17 counts one key per pupil page.

### R1-15 (minor): a Mixed page would carry a second title

- **Where**: V21 §9.5, lines 2904–2905 ("title `Mixed practice`, tab line 2 omitted") against R5 (line 5626) and
  E19 ("1 distinct title").
- **Observed**: the two rules contradict each other. The site's Mixed band sits on the lesson's I Can page.
- **Cost**: D3 −1.
- **Fix**: "A Mixed page keeps the pack's I Can title; the band label `Mixed Review:` names it; tab line 3 `Mixed n`."
- **Check**: E19 passes with a Mixed page in the pack.

### R1-16 (minor): one geometry value is wrong and one is loose

- **Where**:
  - V21 line 2296–2297: "live area 271 × 184 mm (margins 12 / 13 / 14 mm)". WDS PG-5 gives 271 × 186.
  - §9.7, line 2940: "each about 126 mm wide". PT-FPR-9 gives 133.5 mm, 3 mm clear each side of the cut.
    The sample cell measures 125.4 mm.
- **Cost**: D1 −1.
- **Fix**: state the landscape margins exactly (12 / 13 / 12 mm, giving 271 × 186). Set the half's live width to
  (271 − 6) / 2 = 132.5 mm.
- **Check**: E1 plus a new geometry check on `.pg.land` (cell width 132.5 ± 0.5 mm).

### R1-17 (minor): small teacher-page defects

1. **"Total 60" misaligned** (page-01). The value sits 6 mm left of the Min column's right edge.
   - Fix: give the total cell class `r`.
   - Cost: C3 nit.
2. **T-LOOP label wraps** (page-04 and page-06). "Fewer than half:" breaks over 2 lines in the 30 mm label column
   (§10.6, line 3001).
   - Fix: a 36 mm column.
   - Cost: C1 nit.
3. **Underscore blank in a script line** (page-05, step 5). `Say:` "…because ____ ." is typed with underscores,
   against SL-6.
   - Fix: a 0.75 pt line B(n).
   - Cost: C1 nit.
4. **Double rule at the header** (page-02, page-03, page-04, page-05, page-06, page-22). The 2.25 pt header rule is
   followed 1 mm later by the 1.5 pt band top, which reads as a double rule. On pupil pages the gap is about 3 mm.
   - Fix: `.body > .band:first-child { margin-top: 3mm }` on teacher pages too.
   - Cost: C4 nit.

- **Check**: by eye on re-render, plus E13's underscore check extended to teacher pages.

### R1-18 (minor): P1 instruction wrap and order

- **Where**: page-08, rows 1 and 6.
- **Observed**:
  - "Write 1 more and 1 less." wraps, leaving "less." alone on line 2 of a 58 mm column.
  - The boxes read 1 less (left), 1 more (right), against the spoken order "1 more and 1 less".
- **Cost**: C1 nit.
- **Fix**: widen the instruction column to 66 mm (the item still fits; widest is "16, 17, [box] , 19" at about
  95 mm), so the string sits on one line. The zone labels under the boxes already fix the order.
- **Check**: every P1 instruction is at most 2 lines with no single-word last line.

### R1-19 (process): the sample does not exercise the hard recipes

- **Where**: audit §5 deliverable 2 recommended `subtract within 100 with regrouping` in `design/lesson-planner/v21-sample/`.
  The builder made add 1–3 in `sample-v21/`.
- **Observed**: the pack uses only `factStack`, `hopTrack`, `counters`, `numberTrack`, `numberBond` and `dotTile`.
  - `columnStack`, the digit strip, the regroup strip, `base10` and `pvChart` are untested.
  - `columnStack` handles one addition carry only and has no subtraction regroup (cross out, new tens, 1-prefixed
    ones). So the recommended topic cannot be built from V21 as written (D2).
- **Fix**:
  - Add `columnStackSub({top, bottom, regroup:true})` to Appendix D (cross-out 0.75 pt diagonal, regroup boxes over
    both columns per VA-10).
  - In round 2, build a second sample of sub_100_regroup.
- **Check**: a second pack rendered from V21 passes Appendix E, and this rubric gives 8 or more on it.

---

## 3. Self-containment test: building other lessons from V21 alone

**"Compare two 2-digit numbers"** can mostly be built. These are the places I had to guess:

| # | Gap | V21 line | What to add |
|---|---|---|---|
| G1 | Prerequisite lesson ids ("K-3 Count to 10") have no scheme or source | 2646–2656, 6633 | A rule: use the teacher's lesson list; otherwise `<Level>-<n>` from the MathQuest library; otherwise `CCSS code + title`; plus how to pick the 3–4 prerequisites (one per prerequisite atom on T2) |
| G2 | Grid for one-symbol horizontal items (`47 ○ 52`) | 2558 | WDS DN-22 horizontal fit (`eqW × em + B + inset + 3 ≤ cellW`) and the L row pitches (answer beside 18 mm), plus the permitted grids 2 × 4 / 2 × 5 / 2 × 8 of CL-2 |
| G3 | A new step icon ("compare the tens") | App. B, 5830–5862 | A recipe for drawing a new icon: 10 × 10 box, 1.5 pt, round joins, one idea, at most 6 strokes, tested at 5.8 mm |
| G4 | Score rule on the lesson sheet (Independent only) | 2859 | Already stated. Add a rule for Score when Guided is unscored and Vocabulary is unscored, for every page role |

**"Partition a shape into halves"** cannot be built faithfully:

| # | Gap | V21 line | What to add |
|---|---|---|---|
| G5 | No 2D shape recipe or minimum (WDS 11.2: 42 mm at L, max 3 columns) | 5576–5599 | Add `shape({kind:'rect'|'square'|'circle'|'triangle', w, h})`, and the WDS 11.2 rows missing from §19.3: 2D shape, angle 35, coordinate cell 8, coins, ruler, digital clock 48 × 19, tenths strip 70 × 16, area model 25 × 14, base-10 300+, clock with minute ring 65 |
| G6 | No instruction string for "Draw a line to make 2 equal parts" or "Are the parts equal? Check one box." | 5868–6002 | Add the keys `partition` and `equal-parts`, and the check-box label pair (`Equal parts` / `Not equal parts`) |
| G7 | A key for an item with many correct answers (any halving line) | 2632–2645 | "Draw one correct answer in key colour; list 'also accept' on T6 under Accepted answers" |
| G8 | Slot table rows missing from §8.10: Number + label (faded, B(n) then 52 mm), mixed-number box, money, missing-digit box size (track − 1 mm × Hw) | 2502–2515 | Copy them from WDS §6 |
| G9 | Andika is not embedded (download instructions only) | 2308–2324 | Acceptable. State the exact release (Andika 6.200) and its SHA-256, so another AI can verify `cv04` is present |
| G10 | The reference self-check and builder use machine paths (`/home/user/…`, `/opt/pw-browsers/…`) | 6421–6424, 6655 | Read `OUT` and the browser path from argv |

---

## 4. Audit coverage

| Audit item | Status |
|---|---|
| §1a D1–D20 | All restated in Part 8 with values. The one value off is PG-5 (R1-16) |
| §2 verdicts | REPLACE / REMOVE done for the CSS, colour map, typography, KaTeX and T-pages. REVISE often left as an overlay note over the old body (R1-7). "DURING THE LESSON" and "ALWAYS / NEVER" are not fully done (lines 5360–5362, 5388) |
| §3 C-01 – C-25 | Resolved in Part 8–10. C-21 contradictions remain in the bodies at 3997, 5360 and 5388 |
| §3a OR-a/b/c word for word | Yes (lines 2524–2531), with the builder notes applied |
| §4 teacher pages | Followed, except thumbnails on T3 / T5 (R1-5), "Print once per unit" in the footer (R1-10), and fade labels (R1-6) |
| §5 deliverables 1–5 | 1: partial (R1-7). 2: a different topic and folder (R1-19). 3: done, 20 / 20. 4: this report, FAIL. 5: partial (§3 gaps) |

---

## 5. Builder choices where the audit was silent

| Choice | Verdict | Reason |
|---|---|---|
| The open answer area is not counted as an empty band | **Reject as written** | OR-a sends spare height to the work zone, but also says to add a problem when space is left. The site's own H13 measure counts slots as content and flags the open band. Exempt only work the pupil draws (R1-8). |
| Practice 3 × 4 = 12 one-symbol facts | **Accept** | It is exactly what the site's passed add-within-10 lesson prints (gold standard). WDS CL-2 lists 2 × 4 – 2 × 8 for one-symbol answers, so V21 must keep the "site precedent" note and the owner-default flag (it does, line 2541). |
| Exit slip as A4 landscape halves | **Accept the format, reject the content** | WDS PG-5 allows 2-up landscape halves with a dashed cut line. One item in a 125 × 104 mm cell fails H13 (R1-2). |
| "If missed →" on the key only | **Accept** | Routing is teacher data. SC-5 / HD-30 keep codes and teacher information off the pupil face, and the site's lesson warm-up prints no routing tags. |
| No anchor-chart key | **Reject (minor)** | The site renders a key page for its chart, and CLAUDE.md says every page prints a key (R1-14). |
| Per-row number-sense instructions | **Accept** | In the Daily look each row is its own one-item section of a different type. PED's "one instruction per section" is met, and every string is from C.1. Fix the wrap (R1-18). |
| New string "Read the story. Draw it. Solve." | **Accept** | It keeps the C.1 grammar (print verbs, 3 sentences, 6 words), and the library's `story` string names a diagram this page does not have. It is logged as a V21 key (line 6002). E15 should report it as V21-added, not as "from the library". |
| Tab ids "Teacher n" / "Reference" | **Accept** | Audit §4 T-HEAD proposed them and they are owner default Q9. They need a PT-FRM-9 entry on the site side. |

---

## 6. What would raise each criterion to 10

**Pupil pages**
- *C1*: one-line panel rows on P5 (R1-9) and a one-line P1 instruction (R1-18).
- *C2*:
  - exit items that test the critical atom (R1-3);
  - varied Guided cells (R1-12);
  - other examples drawn in black (R1-13);
  - for P0, choose prerequisites from the T2 Pre-requisite atoms. Today d (number bonds) is not on T2.
- *C3*:
  - P3 and P6 cells with no band of 30 % or more (R1-1, R1-2);
  - P0 cell c reduced from 34 mm (33 % top and bottom bands) to about 26 mm, giving cell d the height;
  - Practice is already at the gold standard.
- *C4*:
  - the `Another example:` label (R1-13);
  - the answer-with-unit line inside the story box, per SF-50 (P5);
  - the operator track widened to the site's (on the site, "+" sits 85 px from the ones digit; on V21, 63 px at
    110 dpi; set the operator track to 0.95 em as the site's stack does);
  - an anchor-chart key (R1-14).

**Teacher pages**
- *C2*: T2 to its own spec (R1-4).
- *C3*:
  - T2b and T6 filled to 85 % or more. For T6, add the Fade column (R1-6) and an "Accepted answers" block for every
    page, not just the word problem.
  - Fix the "Total" alignment.
- *C4*:
  - thumbnails (R1-5), fade labels (R1-6), no ★ double meaning (R1-4);
  - "Print once per unit" in the footer;
  - single rules at the header (R1-17).

**The V21 document**
- *D1*: no stale V20 bodies (R1-7); the PG-5 values (R1-16); all of the WDS 11.2 and §6 rows (G5, G8).
- *D2*: close G1–G10; add a subtraction-regroup column-stack recipe and a 2D-shape recipe (R1-19, G5); render a
  second sample on sub_100_regroup.
- *D3*:
  - an H13 rule with a capped work zone (R1-8);
  - the turn-around rule tied to pool size (R1-11);
  - a Mixed title consistent with R5 (R1-15);
  - a realistic thumbnail rule (R1-5);
  - a one-meaning ★ (R1-4);
  - an exact half-page width (R1-16).
- *D4*:
  - E11 measured the way the site's `sheetCheck` does (slots count as content; the open band is flagged);
  - add a bottom-blank check (more than 8 % of the body blank, as the site lint does);
  - E15 checked against the whole C.1 table, not a hard-coded list of 8;
  - new checks:
    - E21: T2 atoms (≥ 5, valid types);
    - E22: thumbnails present;
    - E23: fade labels;
    - E24: exact repeats and same-page turn-arounds;
    - E25: one key per pupil page;
  - portable paths in the reference implementation (G10).
