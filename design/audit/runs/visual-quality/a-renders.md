# Visual-quality lane, explorer (a): render survey

Date 2026-10-31. Branch `claude/sweet-newton-c8wrv1-visual-quality`. Tool:
`node tests/scripts/ws-grade-render.cjs --skills <15 ids> --roles independent --size S|L` (S with screen hosts,
L print only). Renders in the session scratchpad (`.../scratchpad/ra/{S,L}`); the telling ones are copied to
`design/status/visual-quality/before/`. Template = `q.cell.template` as recorded in the render's meta.json.

Ratings are visual quality only (1-10), not content correctness, though content bugs seen are noted.

---

## 1. subtraction:sub_100_no_regroup (redesign-passed) - template `stack`
- Answer area: 2-box digit slot under the bar, defined and sized to the answer. Good. Boxes are thin (hairline) and
  small next to the digits; slot looks lighter than the operands.
- Representation: column method with T/O headers. Fits.
- Whitespace: each cell is ~45 % empty below the answer (cells are 200 px tall for ~110 px content).
- Type: digits use a monospaced/typewriter face with wide letter-spacing ("8 0") rather than Andika - reads as code.
- Rating **7** - correct and clean, but the sparse cell bottom and the spaced-out mono digits look unfinished.

## 2. subtraction:sub_2d_1d (redesign-passed) - template `stack`
- Same as 1. The subtrahend's empty tens place leaves a gap between `-` and the digit ("-   5"); acceptable
  alignment, but the minus floats far from its number.
- Whitespace ~45 % empty per cell.
- Rating **7**.

## 3. subtraction:sub_wp_20 - template `word-work`
- Scaffolds that don't fit: `+ - x ÷` sign row on a Grade 1 subtraction-only page; 3-column digit grid plus a row
  of carry/borrow boxes for 1-digit/teen numbers (no regroup possible in most items, e.g. 9 - 8, 7 - 3).
- Answer area: digit answer boxes PLUS a separate bare underline beside them for the unit - two answer slots, the
  line unlabelled. Unit-word bank floats in a box beside the grid with distractors ("boxes", "days") that are
  nonsense for the story; singular/plural mismatch ("stamp" bank vs "stamps" story).
- Representation: no bar model / part-whole drawing at all, just an empty grid - for a "take away" story.
- Whitespace: bottom ~35 % of each cell empty (S); at L the same 4-box grids, only text grows, ~30 % empty.
- Screen (card-390): word bank drops BELOW the grid and the unit underline is stranded at far left, unattached;
  grid fills the card with 9 empty boxes for a 1-digit answer.
- Rating **4** - heavy generic scaffold that does not match the item, two answer slots, nonsense bank.

## 4. multiplication:mult_word_problems_plain - template `word-work`
- Same word-work shell: sign row (OK for a mixed-operation choice, but on a multiplication-only page it is a
  formality), 3-col grid with an extra leading box and carry row for 1-digit x 1-digit facts (6 x 8).
- Unit bank again has distractors ("days", "boxes") and the unlabelled underline answer.
- Representation: no equal-groups / array drawing.
- Whitespace ~35 % per cell.
- Rating **4**.

## 5. composing:number_bonds - template `bond`
- Answer area: missing number is a blank box in the bond; one slot, sized right. Good.
- Representation: proper part-whole bond. Connector lines are hairline (~1 px) vs 2 px boxes - weak weight hierarchy.
- Whitespace: fine (~20 %).
- Screen: card prints the equation "? + 5 = 8" in the prompt line above the bond, outside the B&W cell, in the
  game font - gives a second representation not on paper.
- Rating **7** - the best-behaved drawing; only line weight and screen prompt.

## 6. algebra:tape_diagram - template `legacy` (legacy q.visual)
- Representation: paper draws the two parts as STACKED separate rounded boxes (looks like a comparison model), not
  one tape split into parts; the whole bracket is a flat line clipped at the cell edge; "? total" floats under it.
  Screen draws ONE tape with solid BLACK filled parts and white numbers (paper is outlined) - paper != screen, and
  black fill breaks the B&W outline rule.
- Answer area: bare "Answer: ____" line with no unit; screen uses a yellow box instead. Strategy text
  ("Subtract the known part from the whole") gives the method away on every item.
- Rounded corners on bars (design standard uses square cells).
- Whitespace: L page is 4 narrow columns with ~40 % blank at the bottom - size L does not change the layout sensibly.
- Title grammar: "I Can work on tape diagrams / bar models" (activity, not a can-do; slash in title). Footer says
  Grade 4 with 2.OA.1.
- Screen adds a "Tape Diagram" caption heading inside the cell.
- Rating **3**.

## 7. fractions:identify - template `frac-model`
- Mixed task types on one page (write the fraction / circle the model A-D / "numerator =" / "denominator =") - four
  response modes in 8 cells.
- Answer area: MC cells have no slot (circle a letter); numerator/denominator cells give a box after a bold label -
  fine. Fraction slot is two stacked boxes with a double-rule vinculum on paper; on screen (card-390) the vinculum
  is missing - two boxes with a gap.
- Representation: good circles/bars, single grey. MC thumbnails are small (~45 px) next to 160 px item 2/3 circles -
  inconsistent model scale.
- Whitespace: ~20 % of page blank below the grid (only 8 items, rows short).
- Rating **6**.

## 8. composing:base10_build - template `base10`
- Answer area: tens/ones place-value mat for drawing - right slot. Legend (| = 1 ten, o = 1 one) good.
- Whitespace: ~30 % of each cell empty below the legend (S). At L the page is identical in layout (6 items), only
  the number grows - Size L barely changes.
- No written number response (e.g. "__ tens __ ones") to check the drawing; key can only show a drawing.
- Rating **6**.

## 9. addition:number_line_add - template `number-line`
- Representation: 0-20 line with start dot. No room drawn above the line for jumps (line sits ~30 px under the cell
  top), so pupils' arcs collide with the cell number badge.
- Answer area: one box after "=", fine. Box sits mid-cell; equation is below the line, so reading order is
  line -> sum, okay.
- Minor ticks and labels small at S; labels 10-20 crowd.
- Rating **6**.

## 10. measurement:time_half_hour - template `clock`
- Answer area: "[  ] : [  ]" two boxes - good, sized.
- Representation: clock faces fine; hour and minute hands similar length/weight, so hour vs minute is hard to tell
  (e.g. item 6, 12); arrowheads tiny.
- Whitespace ~25 %. Clean grid.
- Rating **7**.

## 11. measurement:money_count - template `coins`
- Representation: coins are identical circles with a number only - no size difference between 1, 5, 10, 25, no
  cent sign; not recognisable as coins. Coin rows wrap raggedly (3 + 1, 3 + 2) and cell heights vary per row.
- Answer area: "Total [   ]" with no unit (¢); fine otherwise.
- Content: items 1 and 2 identical, items 7 and 8 a single coin - weak variety.
- Screen worksheet: the grid is ragged - item 4 stacks 25-coins vertically 1-1-1, cells 1/5/6 are 50 % empty; label
  "Count Coins and Notes" but no notes.
- Rating **5**.

## 12. measurement:bar_graph_intro - template `bar-graph`
- Proportion: graph sits left, the graph TITLE ("Snacks We Like") sits to the right above the question instead of
  above the graph; ~45 % of each cell empty below.
- Answer area: item 1 a box; item 2 "Check one box" tick boxes - fine. On quiz-1280 the graph is huge and the title
  is BELOW the graph; only 2 bars (paper 3).
- Line weights: gridlines and axes similar weight; y-axis label sits above the axis as a heading - acceptable.
- Footer: Grade K with 1.MD.4.
- Rating **6**.

## 13. multiplication:arrays_groups - template `arrays`
- Answer area: "[ ] rows of [ ]  [ ] in all." - three slots, but no multiplication sentence (_ x _ = _) for a skill
  titled "to multiply"; trailing period after "in all." Slot boxes slightly above text baseline.
- Representation: arrays and circled groups fine; item 3 wraps a group of 4 onto a second line (3 + 1), which
  reads as an unequal arrangement.
- Whitespace: ~40 % per cell empty.
- Rating **6**.

## 14. shapes_classify:classify_quads - template `legacy` (legacy q.visual)
- Instruction contradiction: page says "Circle all the correct answers", cells say "Check ALL categories ...", cell 5
  says "Circle ALL the rectangles" with tick boxes.
- Content: "check 2" for a square (it is square, rectangle, rhombus, parallelogram, quadrilateral); rotated square
  "check 1" - counts wrong.
- Representation: shapes ~80 px, small; tick boxes ~10 px - far below big-target rule.
- Screen (card-820): tiny square in a tall empty panel, a different option set (4 options vs 7 on paper), "Tip"
  line, "0 of 4 selected" counter and a grey in-cell "Submit" button besides CHECK - two submit controls.
- Rating **3**.

## 15. composing:odd_even - template `legacy` (legacy q.visual)
- Title grammar: "I Can make odd or even?" (verb + question mark).
- Answer area: tick-less choice chips AND an "Answer: ____" line - doubled response; item 4 "Circle/cross out" then
  also an Answer line.
- Answer given away: "ends in 3 / ends in 0" captions under each choice.
- Proportion: cells 1-3 ~60 % empty; page bottom ~30 % blank; item 2 has 4 dots at 2x2 with one hollow - unclear.
- Screen: extra caption "Which is Odd?" repeats the prompt (capital O); yellow answer box instead of chip choice.
- Rating **3**.

---

## Patterns (15 skills rendered; plus the lead's 2 = 17)

| # | Weakness class | Count | Skills |
|---|---|---|---|
| P1 | Large empty band in the cell / page (>= 30 % blank) | 11 | sub_100_no_regroup, sub_2d_1d, sub_wp_20, mult_wp_plain, base10_build, bar_graph_intro, arrays_groups, tape_diagram, odd_even, money_count (screen), identify (page) |
| P2 | Doubled or unlabelled answer slot (box + bare line, chips + Answer line, unit-less line) | 6 | sub_wp_20, mult_wp_plain, odd_even, tape_diagram, money_count (no ¢), fact_family_sort (lead) |
| P3 | Generic scaffold that doesn't fit the item (sign row on single-op page, carry row / 3-col grid for 1-digit facts, distractor unit bank) | 3 + lead's add_wp_20_plain = 4 | sub_wp_20, mult_wp_plain, add_wp_20_plain |
| P4 | Relation lacks its drawing (bare text / empty grid where a bar, bond, group or equation belongs) | 5 | sub_wp_20, mult_wp_plain (no bar/groups), arrays_groups (no x sentence), odd_even, fact_family_sort (lead) |
| P5 | Paper != screen (different drawing, fill, options, extra captions/prompts) | 7 | tape_diagram (black fill, one tape vs stacked), classify_quads (4 vs 7 options), odd_even (caption, box), number_bonds (equation prompt), identify (no vinculum), bar_graph_intro (title moved, 2 vs 3 bars), sub_wp_20 (bank and line relocated) |
| P6 | Legacy `q.visual` cells (template `legacy`) still in use - carry most of the worst defects | 3 (+ lead's fact_family_sort) | tape_diagram, classify_quads, odd_even |
| P7 | Answer / method given away (strategy sentence, "ends in N" captions) | 2 | tape_diagram, odd_even |
| P8 | Title grammar / instruction contradiction | 3 (+ lead's 1) | odd_even ("I Can make odd or even?"), tape_diagram ("work on ... / ..."), classify_quads (circle vs check) |
| P9 | Weak line-weight / type hierarchy (hairline bond lines, thin slot boxes, mono spaced digits, equal clock hands, tiny tick boxes) | 5 | number_bonds, stack x2, time_half_hour, classify_quads |
| P10 | Size L does not re-layout (same item count/geometry, only text grows; more blank) | 3 checked | base10_build, tape_diagram, sub_wp_20 |
| P11 | Ragged wrap of repeated objects (coins 3+1, groups 3+1) | 2 | money_count, arrays_groups |
| P12 | Mixed response modes on one page (P-1 one new thing) | 2 | identify, odd_even |
| P13 | Grade / standard footer mismatch | 2 | tape_diagram (Gr 4, 2.OA.1), bar_graph_intro (Gr K, 1.MD.4) |

Ratings: stack 7, 7; bond 7; clock 7; frac-model 6; base10 6; number-line 6; bar-graph 6; arrays 6; coins 5;
word-work 4, 4; legacy 3, 3, 3. Kit templates average ~6.3; legacy cells 3; word-work is the weakest kit template.

Before-PNGs: `design/status/visual-quality/before/` - sub_wp_20-print-S, sub_wp_20-card-390, tape_diagram-print-S,
tape_diagram-card-820, odd_even-print-S, classify_quads-card-820, money_count-worksheet-1280, bar_graph_intro-print-S.
