# lf-ops — independent critic, round 1 (build #4)

- **Critic:** independent (built none of this). Effort: Opus medium. **Date:** 2026-11-07.
- **Tree:** frozen worktree `crit4` at **c37053c**. Every render below was made on that commit by this critic.
- **Skills:** `multiplication:mult_properties`, `multiplication:arrays_groups`, `multiplication:count_by_tables`.
- **Read first:** RUBRIC.md (in full, §6.1 included), CLAUDE.md contract, WDS (SL-1/2/3/3a, TY-10a/b, CL-40, INK-30/31, PG-23, DN-2), the two signed cards (`ops-tables.md` §7a/§9, `count-row.md` §7a/§9).

## Verdict

| Skill | Verdict | Lowest score | Where |
|---|---|---|---|
| `multiplication:mult_properties` | **FAIL** | **2** (C3) | Reason It S/M/L: arrays spill out of the A/B boxes and off the page (H2) |
| `multiplication:arrays_groups` | **FAIL** | **4** (C1) | Error analysis S/M/L: the A/B/C tags overprint the grey made-up answers (H2); plus H13 on every practice role |
| `multiplication:count_by_tables` | **FAIL** | **2** (C1, C3) | Reason It S/M/L: the count rows overflow their A/B boxes, overprint each other, and leave the page |

No skill passes. Most of the work is sound: the count-row practice pages, the keys (spot-checked; one wrong key format, see D-MP-6), the black-and-white look, the lesson anchor charts of the default `mult_properties` and of `count_by_tables`. The failures are: (1) the arrays/arrays-turn cells are sized for the tallest picture and leave 35–55 % empty bands on almost every practice page (H13), with Size S laid out like M; (2) Reason It is broken for all three skills; (3) `mult_properties` forms 1–3 still carry the order-property title, rule and vocabulary, and the forms-1 model page overflows; (4) the multi-section and 2-/3-page sheets leave pages more than half empty (H5).

Scope note: RUBRIC's scope notes (2026-09-26) take error analysis, stand-alone Guided, Review, True or False? and Reason It out of the pass bar. Both signed cards (2026-11-07, later and specific) mark every one of these page types **offered — graded on every page type it reaches**. I grade them, and I apply the cards. **Each skill also FAILS on the RUBRIC core scope alone** (Practice, Test, Lesson, screen hosts), so this ruling does not change any verdict.

## Renders (all under `design/audit/runs/lf-ops/renders/`)

| Dir | What |
|---|---|
| `main/multiplication__mult_properties/`, `main/multiplication__arrays_groups/` | 9 roles × S/M/L, pupil + key, plus card 390/820/1280, worksheet 1280, quiz 1280 (`main.log`) |
| `cbt/multiplication__count_by_tables/` | count_by_tables: 9 roles × S/M/L + the 5 screen hosts. The first pass in `main/` was cut off by a time limit; this is the complete re-render (`cbt.log`) |
| `forms1/`, `forms23/` | mult_properties `--opts {"forms":[1]}` and `{"forms":[2,3]}`, all roles × S/M/L + hosts |
| `cbt-timeseach/`, `cbt-fillhalf/`, `cbt-onePage/`, `cbt-jumps15/`, `cbt-circle/`, `cbt-lines/` | count_by_tables options: independent, guided, test × S/M/L |
| `lint/` | `ws-print-lint --source kit` JSON: `--kind sections --pages 2` (mult_properties + arrays_groups) and `--pages 3` per skill, at S and L; `sections-p2-{S,L}-part*.png` are screenshots of the sections documents |
| `h13-main.txt`, `h13-opts.txt` | the critic's per-cell empty-band measurement of every pupil page (largest empty horizontal band ÷ cell height; tool: scratchpad `tools/h13.py`, threshold 30 % = RUBRIC H13) |

Pixel scale: page PNGs are 794 px across 210 mm (1 px = 0.264 mm).

---

## 1. multiplication:mult_properties — FAIL

### 1.1 Scores (default: forms [0], the order property; C1/C2/C3/C4)

| Role | S | M | L |
|---|---|---|---|
| lesson (S prints at M) | 7/8/5/7 | 7/8/5/7 | 7/8/5/7 |
| independent | 7/8/6/7 | 7/8/6/7 | 7/8/5/7 |
| more-practice | 7/8/6/7 | 7/8/8/7 | 7/7/6/7 |
| guided | 7/8/6/7 | 7/8/6/7 | 7/8/6/7 |
| test | 7/8/6/7 | 7/8/8/7 | 7/8/5/7 |
| error-analysis | 4/7/6/7 | 4/7/8/7 | 4/7/8/7 |
| review | 7/7/5/6 | 7/7/6/6 | 7/7/6/6 |
| reason-it | 3/6/2/5 | 3/6/2/5 | 3/6/2/5 |
| true-false | 7/3/8/7 | 7/3/8/7 | 7/3/8/7 |
| **forms [1]** lesson / independent / test | 3/4/3/5 · 8/7/6/6 · 8/7/6/6 | 3/4/3/5 · 8/7/6/6 · 8/7/6/6 | 3/4/3/5 · 8/7/6/6 · 8/7/8/6 |
| **forms [2,3]** lesson / independent / test | 7/6/4/5 · 8/7/8/6 · 8/7/8/6 | 7/6/4/5 · 8/7/8/6 · 8/7/8/6 | 7/6/4/5 · 8/7/8/6 · 8/7/8/6 |
| sections `--pages 2` (with arrays_groups) / `--pages 3` | 7/8/4/7 · 7/8/5/7 | — | 7/8/5/7 · 7/8/6/6 |

| Screen host | Score | Note |
|---|---|---|
| practice card 390 / 820 / 1280 | 8/8/8/9 · 8/8/8/9 · 8/8/8/9 | First item a 3 × 3 square: two identical facts (a deliberate edge case, a nit) |
| online worksheet 1280 | 8/8/7/8 | D-MP-9 |
| quiz 1280 | 8/8/8/9 | First item 4 × 4 (as above) |
| forms [2,3] online worksheet 1280 | 7/7/7/6 | D-MP-11 |

### 1.2 Defects

| Id | Where | Measured | Rule | Fix | Check that catches it |
|---|---|---|---|---|---|
| D-MP-1 (critical, C3) | `main/…mult_properties/independent-{S,M,L}-p1.png`, `test-*`, `guided-*`, `more-practice-*`, `review-*`; lesson Practice page `lesson-{S,M}-p3.png` | Largest empty band per cell: S **44 %** (cell 5, 34 mm of 78 mm), M 34 %, L 40 %; guided S 49 %; review S 56 %; lesson Practice S/M **51 %** (4 items; ws-print-lint on `--pages 3` S: SPREAD 49 %, H13-ROW 31 %) | H13, DN-2, L-DENSITY SPREAD | The arrays-turn cell reserves the 5 × 5 pair's height in every cell. Size each row to its own tallest pair (H13-ROW), and on the lesson Practice page fill the count first (6 at M, as Independent M already does) before stretching rows | `ws-print-lint` L-DENSITY H13 reads only "band under the item" against the row. It needs a **band-anywhere** measure (picture-to-slot gap included), like `tools/h13.py` here |
| D-MP-2 (major, C1/C4) | `independent-S-p1.png` items 1, 3, 5 vs 2, 4, 6 (same at M, L, and in every order-property cell) | Answer boxes **6.9 mm** (1-digit answer) and **10.6 mm** (2-digit) at S; 9.3 mm at M; 11.9 mm at L | SL-1 (≥ 14 mm), SL-2 (one width per section: a box's width gives away the answer's size) | Use `blank()` with the section's widest answer (n = 2 → 14 mm at S/M, 17 mm at L) for every arrays-turn slot | L-SLOT width ≥ 14 mm and one width per section, on arrays-turn (it is not in the lint's slot set today) |
| D-MP-3 (major, C3) | `independent-L-p1.png`, `test-L-p1.png` | 3 items: a row of 2, then 1 full-width cell (item 3, 5 × 4) | GRID-EVEN, PG-12 | Pick one column count for the section at L (1 column, every pair full width; or cap L pairs at 4 across so 2 columns hold) | GRID-EVEN on every kit grid section (LESSONS_LEARNED "A grid rule belongs to every grid") |
| D-MP-4 (critical, C1/C3) | `reason-it-{S,M,L}-p1.png` (item 2 at S; items 1–2 at L) | 4 × 5 / 5 × 4 arrays drawn 30–50 px outside the A/B boxes, over the neighbour box and off the left page edge; ws-grade-render reports OVERFLOW on reason-it S/M/L (main.log) | H2, PG-12/13, L-OVERFLOW | Reason It must lay the arrays-turn payload out at its own (narrow) cell width: shrink the pair to the A/B box (pitch from `ctx.metrics`), or stack A over B | `ws-grade-render --gate` already says OVERFLOW: precritic must run it on **every offered role**, not only lesson/test/independent |
| D-MP-5 (critical, C1) | `error-analysis-{S,M,L}-p1.png`, every item | The "A"/"B" tag letters sit inside the answer box over the grey made-up digit ("A10", "B15", the "A" through the 6 of item 3) | H2, CL-40 (tag keep-out inside a slot) | Put the A/B letters outside the slot (left of the box, or beneath it as on the Fix-it boxes) | L-OVERLAP: tag ink against slot-content ink |
| D-MP-6 (critical, C2) | `true-false-{S,M,L}-key-p1.png` | Finish-the-sentence key reads "3 × 5 = **15, 15**." and "4 × 2 = **8, 8**." for a one-number blank. The sentence also asks for the given fact, not the wrong one (item 2's false claim is 2 × 4 = 4) | H1 (key does not match the slot), C2 | The sentence takes ONE answer: the corrected turned fact ("2 × 4 = ___", key 8). Do not join `q.ans` with ", " into a single blank | A key check: the number of answers written into a slot equals the slot's answer count (L-KEY "answer per slot") |
| D-MP-7 (critical, C1/C2/C4) | `forms1/…/lesson-{S,M,L}-p1.png` | Model page: the step-2 and step-4 equations overflow their cells into the Say band and the Rule box ("6 × 2 = [ ]" printed over "Say: 6 times 2 is 6"); the Rule says "Turn it round, the same amount!" (the order property) on a break-apart lesson; the Say frame is garbled. grade-render: lesson S/M/L **OVERFLOW** (forms1.log) | H2, H17, PG-12, VQ-9 | Lesson data per property (prereqs.js): the break-apart model gets its own steps, Say ("6 times 2 is 3 times 2 plus 3 times 2"), Rule and vocabulary; size the model cells for three equations | grade-render `--gate` on lesson × every `forms` value (an options axis on precritic's role sweep) |
| D-MP-8 (major, C4) | `forms1/*`, `forms23/*` every page; title, lesson vocabulary, Rule | The title is "I Can turn an array to multiply" on break-apart, × 1 and × 0 pages; the vocabulary matches "turn"; the Rule is "Turn it round…"; the forms 2–3 steps read "Read the fact: 12 × 0" (item numbers as steps) | H17, VQ-9, P-LC-9 | Title from the property dealt ("I Can break an array apart to multiply", "I Can multiply by 1 and by 0"); a mixed page gets "I Can use the properties of multiplication" | `ws-visual-quality` VQ-9: title words ⊂ the dealt forms' vocabulary |
| D-MP-9 (minor, C3) | `main/…/worksheet-1280.png` items 1–2 | Gap between the array and its turn is 36–40 px against a 26 px dot pitch; the bottom-aligned pair reads as one L-shaped block | VQ-8 (paper keeps about 3 pitches between the pair), RP-1 | Keep the paper gap (≥ 2 × pitch) in the screen twin | sibling-compare (SKIPPED for this family) / a screen PAIR-GAP check |
| D-MP-10 (major, C1/C3) | `main/…/lesson-{S,L}-p2.png` warm-up "Multiply." item 4 | "2 × 10 =" starts inside the 4-tab: the "2" overlaps the tab square (x 238 px; the tab runs to 245 px; keep-out to 246 px). Also `--pages 3` L: ws-print-lint CL40-INK "circle at 6.8 mm across, 4.8 mm down enters the 7 × 7 mm keep-out" | CL-40 | The warm-up fact cell honours the label keep-out (start at label side + 2 mm), and arrays-turn insets its first dot from the tab | L-OVERLAP CL40-INK on the lesson warm-up (it ran on `--pages 3` L only) |
| D-MP-11 (major, C1/C4) | `forms23/…/worksheet-1280.png` | The instruction line is the item itself ("0 × 9 = ?"); the cell prints "0×9=" with no spaces and the answer line below the fact, not after "=" as on paper | VQ-8, SP-1, BD-10 | `screenInstr` "Multiply."; the screen twin uses the paper equation layout (answer slot after "=") | `ws-screen-slots` paper/screen slot position |
| D-MP-12 (major, C3) | `forms23/…/lesson-{S,M,L}-p1.png`, `lesson-*-p3.png` | Model page fills 47 % of the page (4 small cells, then empty); the Practice page holds 8 facts, then 45 % of the page is empty | H5, PAGEFILL | Size the × 0 / × 1 model to the page; Practice fills to capacity (Independent S holds 30) | L-DENSITY PAGEFILL on lesson pages (`--role lesson`) |
| D-MP-13 (major, C3) | sections `--pages 2` S: `lint/sections-p2-S-part1.png` and `-part3.png`; L: `-part2.png` | S: page 1 holds 2 items, **149 mm (64 %) empty** (ws-print-lint PAGEFILL); page 3 holds 2 items, about 55 % empty. L: page 2 holds 2 items, about 55 % empty | H5, PG-23 (rebalance), DN-2 | Rebalance a section across the requested pages (PG-23); never start a new page with one row of a two-section sheet | PAGEFILL also on the LAST page of a multi-section sheet (it is exempt today), with PG-23 |
| D-MP-14 (minor, C2/C4) | `main/…/review-S-p1.png` Mixed Review | Earlier-skill arrays use small dots (about 2.5 mm) with a 5-gap, and "9 rows × 3 columns" captions, beside this skill's 5 mm dots; cell 7 has a 56 % empty band | AX-4, H13 | Draw the review arrays with the arrays template | — |
| D-MP-15 (nit, C2) | card 390/1280, quiz, `more-practice-L-p1.png` item 1 | Square pairs (3 × 3, 4 × 4, 5 × 5) are the first screen item and half of the L More Practice page | — | Keep the edge case off item 1 and off a 2-item page | — |

What would raise mult_properties to 10: fixed-height pictures sized per row, 14 mm+ uniform slots, an even grid at L, per-property lesson data, title and rule, a working Reason It and True or False, and multi-page sheets that fill.

---

## 2. multiplication:arrays_groups — FAIL

### 2.1 Scores

| Role | S | M | L |
|---|---|---|---|
| lesson (S prints at M) | 8/8/5/8 | 8/8/5/8 | 8/8/5/8 |
| independent | 7/8/6/8 | 8/8/6/8 | 8/8/5/8 |
| more-practice | 7/8/6/8 | 8/8/7/8 | 8/8/6/8 |
| guided | 7/8/6/8 | 8/8/6/8 | 8/8/5/8 |
| test | 7/8/6/8 | 8/8/6/8 | 8/8/5/8 |
| error-analysis | 4/8/8/7 | 4/8/8/7 | 4/8/8/7 |
| review | 7/8/6/8 | 8/8/8/8 | 8/8/6/8 |
| reason-it | 8/8/6/8 | 8/8/8/8 | 8/8/5/8 |
| true-false | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| sections `--pages 2` (with mult_properties) | 7/8/4/8 | — | 8/8/5/8 |

| Screen host | Score | Note |
|---|---|---|
| practice card 390 / 820 | 8/8/8/7 · 8/8/8/7 | D-AG-4 |
| practice card 1280 | 8/8/7/7 | D-AG-4, D-AG-5 |
| online worksheet 1280 | 8/8/7/7 | D-AG-4, D-AG-6 |
| quiz 1280 | 8/8/8/7 | D-AG-4 |

### 2.2 Defects

| Id | Where | Measured | Rule | Fix | Check |
|---|---|---|---|---|---|
| D-AG-1 (critical, C3) | `main/…arrays_groups/independent-{S,M,L}`, `test-*`, `guided-*`, `more-practice-*`, `lesson-*-p2/p3`, `reason-it-L`, `review-{S,L}` | Empty band between the picture and the slots: independent S 40 %, M 41 %, **L 49 %** (item 1 of test L: picture 195–235 px, slots from 448 px in a 430 px cell); lesson Practice L **54 %**; lesson Guided L 54 % (the slots sink to the cell bottom) | H13, DN-2 | The "picture box" is sized to the page's tallest picture: size it per row (H13-ROW), and anchor the slot frame under the picture, not at the bottom | Band-anywhere H13 (see D-MP-1) |
| D-AG-2 (major, C3, L1) | `independent-S-p1.png` = `independent-M-p1.png` (also test, more-practice) | S lays out exactly as M: 6 items, 2 columns, with smaller dots, so S only adds white space | L1 "Size S ignored", DN-1a | At S use 3 columns (a 5-dot row at 9 mm pitch is 45 mm, so it fits a 62 mm column) or 4 rows | ws-precritic capacity check S > M for every template that measures smaller at S |
| D-AG-3 (critical, C1) | `error-analysis-{S,M,L}-p1.png` all items | "A", "B", "C" tags overprint the grey made-up numbers ("A2", "C10", "B4") | H2 | As D-MP-5 | L-OVERLAP tag vs slot ink |
| D-AG-4 (major, C4) | card 390 / 820 / 1280, quiz, worksheet | The screen frame is "[ ] groups of [ ] **make** [ ] in all." ABOVE the picture; paper is "[ ] groups of [ ] / [ ] in all." BELOW it | VQ-8, SP-1 | One frame on both: picture first, then the same two-line frame with the same words | screen↔paper text and order equality (`ws-screen-slots`) |
| D-AG-5 (minor, C3) | `card-1280.png` | The 4 × 3 array stretched: 60 px dots on a 128 px pitch (gap 2.1 × the diameter; paper about 1.4 ×), so the rows read as scattered dots | VQ-8 | Cap the dot pitch at the paper ratio and centre the array | — |
| D-AG-6 (minor, C1) | `worksheet-1280.png` | "in all" wraps differently cell to cell (box on line 1 in items 1, 5, 6; on line 2 in items 2–4) | AX-4 | A fixed two-line frame (as paper) | — |
| D-AG-7 (major, C1) | `independent-S-p1.png` and every S page | Slot boxes **10.6 mm** wide at S | SL-1 (≥ 14 mm) | `blank()` minimum width | L-SLOT minimum on arrays |
| D-AG-8 (major, C3) | sections `--pages 2`: see D-MP-13 (the arrays_groups section fills pages 2 and 3 at S and page 2 at L) | 55–64 % empty pages | H5, PG-23 | As D-MP-13 | As D-MP-13 |
| D-AG-9 (minor, C1/C2) | `lesson-{S,L}-p2.png` warm-up; same on mult_properties and count_by_tables lessons | The warm-up count track mixes circle and hexagon slots in one row, and the blanks take both shapes | C1 "one slot shape per section" | The warm-up track uses one shape (box) | L-SLOT one shape per section |
| D-AG-10 (minor, C1) | `lesson-L-p3.png` item 2, `independent-S-p1.png` item 3 | 4 groups wrap 3 + 1 (or 5 as 3 + 2) | RP-21 | Wrap groups into even rows (2 + 2) | — |
| D-AG-11 (major, C3) | `reason-it-L-p1.png` | One item on the page (45 % empty band) | H5 lone item | Two items at L (A and B boxes narrower) | PAGEFILL on reason-it |

---

## 3. multiplication:count_by_tables — FAIL

### 3.1 Scores

| Role | S | M | L |
|---|---|---|---|
| lesson (S prints at M) | 8/8/6/7 | 8/8/6/7 | 8/8/8/7 |
| independent | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| more-practice | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| guided | 8/8/8/7 | 8/8/8/7 | 8/8/6/7 |
| test | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| error-analysis | 8/8/6/7 | 8/8/6/7 | 8/8/8/7 |
| review | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| reason-it | 2/3/2/4 | 2/3/2/4 | 2/3/2/4 |
| true-false | 8/7/8/7 | 8/7/8/7 | 8/7/8/7 |
| option times=each: independent / guided / test | 8/8/8/7 · 8/8/8/7 · 8/8/6/7 | 8/8/8/7 · 8/8/8/7 · 8/8/6/7 | 8/8/8/7 · 8/8/6/7 · 8/8/6/7 |
| option fill=half (indep/guided/test) | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 (guided L 6) |
| option onePage=true | 7/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| option jumps=15 | 8/8/8/6 | 8/8/8/6 | 8/8/8/6 |
| option shape=circle | 7/8/8/7 | 8/8/8/7 | 8/8/8/7 (guided L 6) |
| option spaces=line | 8/8/8/7 (guided S 6) | 8/8/8/7 | 8/8/8/7 |

| Screen host | Score |
|---|---|
| practice card 390 / 820 / 1280 | 8/8/8/8 · 8/8/8/8 · 8/8/8/8 |
| online worksheet 1280 | 8/8/8/8 |
| quiz 1280 | 8/8/8/8 |

H13 on the shape and 15-number pages (lead ruling (c), count-row card §9 Q2(b)): **it holds.** `cbt-jumps15` independent/test S/M/L measure 10–20 % per cell (6 rows at S against 8 on the default page: the accepted cost). `cbt-circle` independent/test measure ≤ 21 %. The one red on those option runs is the Guided L continuation page (32 %), which is the same at the default (D-CB-5), not caused by the shape. **But the times=each Test page breaks H13** (D-CB-3).

### 3.2 Defects

| Id | Where | Measured | Rule | Fix | Check |
|---|---|---|---|---|---|
| D-CB-1 (critical, C1/C2/C3/C4) | `cbt/…count_by_tables/reason-it-{S,M,L}-p1.png` | Each A/B option is a full 12-number two-line row drawn into a 55 mm box: numbers overprint ("26", "48", "1820"), the step tab and the first numbers fall off the left page edge (x < 0), and the "is correct." line is overprinted. grade-render: **OVERFLOW** on reason-it S/M/L (cbt.log) | H2, PG-12/13, H12 | Reason It for count rows: show each option as ONE short window of the row (the jump in question, 4–5 numbers) at the size's working digits, or stack A above B full width | The OVERFLOW flag exists: put grade-render `--gate` on every offered role in precritic |
| D-CB-2 (major, C4) | every page title, every size: "I Can count by the numbers 1 to 12"; Test "counting by the numbers 1 to 12"; jumps=15 adds "(15 jumps)" | Card count-row §9 Q6, signed: the default reads "I can count by 2s to 12s" (critic r5 SC6 already flagged "1 to 12"). The page holds no count by 1s; "(15 jumps)" is an option name in the I Can title | VQ-9, H17 (for the "(15 jumps)" suffix: C4 ≤ 6) | Title from the rows: "I Can count by 2s to 12s" by default, "I Can count by 3s" for one row; never an option value in the title | `ws-visual-quality` VQ-9 + `ws-card-rulings` (title string of a decided Q) |
| D-CB-3 (major, C3) | `cbt-timeseach/…/test-{S,M,L}-p1.png` | Test drops the times labels (correct, P-7) but keeps the label rows' height: an empty band of **39 %** (S, 15 mm of 39 mm), 41 % (M), 45 % (L), and only 6 rows at S where the default Test holds 8 | H13, DN-1a | Size the row from what the role draws (no labels on Test → the plain row height) | options-verify --render: a value page with fewer rows AND an H13 band is a defect, not a pin |
| D-CB-4 (major, C3) | `error-analysis-{S,M}-p1.png` | 2 items a page; the empty band under each item is 40 % (S), 30 % (M) | H13 | Size the Fix-it row tighter, or 3 items at S | band-anywhere H13 |
| D-CB-5 (minor-major, C3) | `guided-L-p2.png` (default, fill=half, circle); `lesson-{S,M}-p2.png` warm-up and guided rows | 32 % (15 mm of 46 mm) on 4 rows; 30–33 % on the lesson warm-up and guided rows | H13 (just over) | Do not stretch Guided continuation rows past the row's content + 25 % | as above |
| D-CB-6 (major, C2) | `true-false-{S,M,L}` | "Finish the sentence: 2 × 12 = ___" asks for the row's last product whatever the claim; it does not ask the pupil to correct the wrong number (item 2: 9 was written for 12) | P-TH (True or False? finishes with the fix), C2 | The sentence names the wrong box: "After 9 comes ___." | — |
| D-CB-7 (minor, C1) | `cbt-circle/…/independent-S-p1.png` | Circles **8.2 mm** across for 2-digit answers at S (the default box is 15 mm) | SL-1, H9 (tight) | Circles at least the S box width (14 mm), or offer circle from M up | L-SLOT minimum on shaped tiles |
| D-CB-8 (minor, C1) | `cbt-onePage/…/independent-S-p1.png` rows 10–12 | Arrows touch the numbers ("→100→", "120→132→"; under 1.0 mm); the last box is 9.8 mm for a 3-digit answer (144) | SL-3a (≥ 1.0 mm arrow clearance on the one-page row), SL-1 | Narrow the row's digits under TY-10a before the arrows lose clearance | `wave1-c2-sizes.cjs` arrow clearance on onePage S |
| D-CB-9 (nit) | card 390/820/1280 | "After each number, press Space." also shows at 390 px (touch) | BD-11 | A touch wording on phones | — |

---

## 4. The by-eye items the lead ruled (2026-11-07)

**(a) arrays / arrays-turn multi-section pages (sibling-compare SKIPPED).** FAIL. `--kind sections --pages 2` at S: 3 pages for 8 items; page 1 holds 2 items with **149 mm (64 %)** empty (ws-print-lint PAGEFILL); page 3 holds 2 items, about 55 % empty. At L, page 2 holds 2 items, about 55 % empty. That breaks DN-2/PG-23 (no rebalance) and PAGEFILL. Grids: the order-property section at L is uneven (2 + 1 full width, GRID-EVEN). CL-40: the arrays-turn first dot enters the tab keep-out on `--pages 3` L (6.8 × 4.8 mm inside 7 × 7 mm), and the lesson warm-up fact "2 × 10" overlaps its tab. Even grids hold within each arrays_groups section.

**(b) mult_properties LESSON Practice at S, SPREAD 49 %.** Graded: C3 **5**. Four items on a page whose Independent sibling at the same size holds 6. Each cell measures a 35–51 % empty band (`lesson-S-p3.png`: item 2 picture and slots end at 430 px in a 237–635 px cell). The page also has unequal slot widths (SL-2) and 9.3 mm boxes (SL-1). This is a real defect, not a tolerance: fill the count before stretching.

**(c) count_by_tables shape and 15-number pages.** H13 **holds** on the shape and 15-jump pages (≤ 21 % per cell). Fewer rows a page is the accepted cost. It does **not** hold on Test with times=each (D-CB-3), and the 15-jump title carries "(15 jumps)" (D-CB-2).

## 5. §6.1 visual-quality questions

| Q | mult_properties | arrays_groups | count_by_tables |
|---|---|---|---|
| 1 Representation | Order: an array and its turn, drawn (VQ-1 met). Break apart: one array split by a gap and bracket, but no "+" or whole relation is written (the pupil writes three facts). × 0 / × 1: bare facts, no equal-groups picture, even with pictures on | Arrays and ringed equal groups, drawn | The count row with hop arrows and a step tab, drawn |
| 2 Live parts | Every part is live; the second fact on a square is a duplicate | All live | All live; times labels removed on Test as P-7 requires, but their room is kept (D-CB-3) |
| 3 One answer place | Yes, but slot widths vary within a section (SL-2) and boxes are under 14 mm | Yes; screen frame differs from paper (D-AG-4) | Yes |
| 4 Type and stroke | Andika, proportional on arrays; the forms 2/3 equation cells are letter-spaced ("1 × 2 =") | OK | OK |
| 5 Paper = screen | Order: yes. Forms 2/3 worksheet: no (D-MP-11) | No (D-AG-4) | Yes |
| 6 Title | Forms 1–3 keep the order title (D-MP-8) | "I Can use arrays and equal groups to multiply": yes | "count by the numbers 1 to 12": against card Q6 (D-CB-2) |
| 7 Own renders | Graded on its own renders here | Graded on its own renders here | Graded on its own renders here |

## 6. Keys (spot-checked, facsimile)

Facsimile layout holds on every key checked (same cells, answers in the slots, reddish-orange INK-31, "Answer Key" in the header). Every answer checked is correct: mult_properties independent S (8, 8 / 20, 20 / 6, 6 / 12, 12 / 6, 6 / 10, 10), error analysis S; arrays_groups lesson Practice S, true-false S; count_by_tables independent L (all 36 boxes). **The exception:** the mult_properties True or False? key writes "15, 15" into a one-number blank (D-MP-6, H1).

---

## Automatic checks (process rule 00: the check that would have caught each finding)

1. **Band-anywhere H13** in `ws-print-lint` L-DENSITY: the largest empty horizontal band anywhere in a cell (between the picture and the slot as well as under the item), ÷ cell height ≥ 30 %, for every non-fact template. Today H13 only measures the band under the item against its row, so a 49 % gap between the picture and the slot passed (D-MP-1, D-AG-1, D-CB-3/4/5). Backtest: `arrays_groups` test L at c37053c must FAIL.
2. **Overflow gate on every offered role**: precritic runs `ws-grade-render --gate` on lesson, test and independent only. Reason It OVERFLOW was printed on all three skills (main.log, cbt.log) and on forms-1 lessons (forms1.log), and nothing stopped. Run it on every role the signed card offers × every `forms` value (D-MP-4, D-MP-7, D-CB-1).
3. **L-SLOT minimum and uniform width** for `arrays-turn`, `arrays` and shaped count tiles: every stand-alone box ≥ 14 mm and one width per section (D-MP-2, D-AG-7, D-CB-7, D-CB-8).
4. **Capacity S > M** where the template measures smaller at S (arrays): fail when S and M place the same count with the same columns (D-AG-2, L1).
5. **PAGEFILL on the last page of a multi-section / multi-page sheet**, with the PG-23 rebalance (D-MP-13, D-AG-8). Also PAGEFILL on lesson Practice pages.
6. **GRID-EVEN on every kit grid section**, arrays-turn included (D-MP-3).
7. **VQ-9 title ⊂ dealt content**: the title, the lesson Rule and the vocabulary come from the forms actually dealt. Add a card-rulings string check for decided titles (count-row Q6) (D-MP-8, D-CB-2).
8. **Key answers-per-slot**: L-KEY fails when a single blank receives a joined multi-answer string (D-MP-6).
9. **Tag-vs-slot overlap** (L-OVERLAP): an item tag's ink may not intersect a slot's content (D-MP-5, D-AG-3).
10. **Paper/screen frame equality** (`ws-screen-slots`): the same frame words and order, the picture in the same place (D-AG-4, D-MP-11).
11. **Option-value role sweep**: options-verify `--render` should treat "fewer rows AND an H13 band" as a defect, not as a pinned capacity loss (D-CB-3).

## Speed-ups

1. **Render budget:** the full 9-role × 3-size × 3-skill render took over 10 minutes and was cut off at the background time limit (count_by_tables re-rendered alone). Brief critics to render one skill a run, or give `ws-grade-render` a `--roles-parallel 2` inside one browser slot.
2. **Per-cell band tool:** `tools/h13.py` (scratchpad) measured every page in seconds from the PNGs. Folding it into `ws-grade-render` as a per-page "max band %" in `meta.json` would let the builder see H13 before the critic, and the critic grade C3 from numbers.
3. **Most reds sit outside precritic's plan.** The reds here are in roles and option values that precritic's `--gate` render does not cover (Reason It, forms 1–3 lessons, times=each Test, sections pages-2). Generate precritic's plan from the signed card's §7a "offered" list × the option values, not from a fixed role list. (I did not re-run precritic on c37053c; the lane log's last run had 9 FAIL of 28 before the build.)
4. **The saved HTML of `ws-print-lint --save-html` points at a dead localhost port**, so it renders unstyled. Write it with relative CSS links (or inline the kit CSS) so critics can screenshot multi-section documents without re-serving.
5. **One lesson-data table per `forms` value.** Three of the four mult_properties properties have no lesson data and inherit the order-property title, rule and vocabulary. A lint that fails when a lesson renders for an option value that has no lesson entry would catch this at build time.
