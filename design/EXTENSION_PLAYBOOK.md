# MathQuest Extension Playbook

This document carries the MathQuest sheet look and teaching method into every domain that the
reference workbooks cover thinly or not at all. For each of 18 domains it fixes the lesson ladder,
the representations and how they are drawn, the response modes, the best-fitting page roles, the
scaffolds, the misconceptions to seed, the MathQuest skill ids, and one exemplar page.
An implementer must be able to build a domain from this file plus the five documents below.

## Related documents

| Document | What it owns |
|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract: tokens, two looks, header, cells, labels, answer-slot shapes, line styles, grey / hatch, capacity tables |
| `PEDAGOGY_STANDARD.md` | The teaching rules: lesson cycle, one change per step, hint vs structural scaffolds, review cadence, instruction library |
| `design/PAGE_TYPES.md` | Every page role: anatomy, geometry, options |
| `design/PROBLEM_TYPES.md` | Problem catalogue, response modes print ↔ screen, representations library |
| `design/EXTENSION_PLAYBOOK.md` | This file |
| `design/SKILL_CELL_CONTRACT.md` | The data contract (`q.cell`, `renderCell`, `workedSteps`, `wrongAnswer`, `strings`, `footprint`) that lets any skill sit on any page role |

Where this file and `WORKSHEET_DESIGN_STANDARD.md` disagree on a measurement, the standard wins.
Where this file is silent, the standard and `PEDAGOGY_STANDARD.md` apply unchanged.

## Contents

0. How to read a domain section
1. Global extension rules (XP-G)
2. Shared drawing kit for extension domains (XP-D)
3. Shared page frame used by every exemplar
4. Domains
   - 4.1 Early shapes + classifying shapes (SH)
   - 4.2 Angles + lines (AN)
   - 4.3 Area + perimeter (AP)
   - 4.4 Volume (VO)
   - 4.5 Coordinates + transformations (CO)
   - 4.6 Measurement + unit conversion (ME)
   - 4.7 Temperature, capacity, mass (TC)
   - 4.8 Graphs + data analysis (GD)
   - 4.9 Probability (PR)
   - 4.10 Decimals (DE)
   - 4.11 Percents + ratios (PC)
   - 4.12 Integers (IN)
   - 4.13 Order of operations (OO)
   - 4.14 Expressions + equations (EE)
   - 4.15 Patterns + function tables (PF)
   - 4.16 Number theory (NT)
   - 4.17 Rounding + estimation (RE)
   - 4.18 Math vocabulary (VC)
5. Any skill on any page role: the extension matrix
6. Checklist: designing a page for a skill nobody has drawn yet
7. Assumptions

---

## 0. How to read a domain section

Every domain section has the same eight parts, in this order.

| Part | Content |
|---|---|
| Skill ids | The `SKILLS` ids from `js/modules/data.js`, by category. Ids are never renamed. A ladder step points at an id plus constraints |
| Ladder | 6-12 steps. Each row: step id, "I Can ..." title, the one-sentence "This time you will ...", the ONE change against the previous step, the skill id. Titles are capitalised in the tables only so they scan; the printed title is sentence case after "I Can", with no closing period (design standard HD-10) |
| Representations | What is drawn and the drawing rules (sizes in mm, line weight, grey use) |
| Response modes | Print form and its on-screen twin |
| Page roles | Which roles fit best, plus what the skill supplies so that every other role still works |
| Scaffolds | Structural (persist) vs hint (fade, in the listed order) |
| Misconceptions | Wrong answers to seed in error analysis, True or False?, Reason It, and as multiple-choice distractors where the paper item is multiple choice |
| Exemplar | One page, drawn in monospace, with a geometry note |

Terms used throughout:

- **Look**: "I Can" look or "Daily" look (owner decision 4).
- **Size**: S / M / L, digits 16 / 22 / 28 pt, writing height Hw 6 / 8 / 10 mm. All exemplars are drawn at L on A4.
- **Level N**: the pupil-facing label. Grade and CCSS code appear only in the teacher footer.
- **Delta**: the single thing that changes between two ladder steps.

---

## 1. Global extension rules (XP-G)

| Id | Rule | Test |
|---|---|---|
| XP-G-01 | A domain adds representations and cell templates. It never adds a new look, font, grey, header, label style or footer | Render lint: only tokens from the design standard appear |
| XP-G-02 | Every ladder step changes exactly one of: number range, representation, format/orientation, unknown position, operation mix, one scaffold removed, one attribute added | Ladder validator: `delta` has one key |
| XP-G-03 | Every step stores `iCan` ("I Can <verb> <object> (<constraint>)") and `whatsNew` beginning "This time you will" | String lint |
| XP-G-04 | One strategy per ladder. A second strategy (for example counters vs number line for integer addition) is a separate optional ladder | Ladder validator |
| XP-G-05 | Each ladder isolates sub-skills before combining them: a decide-only, notate-only, set-up-only or rewrite-only step appears wherever the full procedure has 3 or more actions | Manual review against the ladder table |
| XP-G-06 | Wherever two procedures collide, the ladder has a discrimination step answered with check boxes tied to a first-person rule sentence | Manual review |
| XP-G-07 | Every visual is black line on white. The only fill is the single 40% grey, or 45-degree hatching when Photocopy-safe is on. No colour, gradient, shadow or emoji in any cell, on paper or on screen | Ink lint on `.mq-mono` scope |
| XP-G-08 | No cue depends on colour. Categories are told apart by shape, by solid vs hollow, by a letter, or by a word label | Probability, graphs and sorting cells pass with a greyscale + threshold filter |
| XP-G-09 | The answer slot shows the answer type: rule = number, square box = one digit, circle = sign or symbol, a fraction bar with a writing zone above and below = fraction, `( __ , __ )` = ordered pair, `__°` = angle, rule + pre-printed unit word = measure, check box = decision | Slot lint per `answerType` |
| XP-G-10 | Unit words are pre-printed after the blank ("____ square cm"). Pupils never write a unit from memory before the step that teaches it | Cell payload has `unit` when the answer is a measure |
| XP-G-11 | Pupils never compose a sentence. Reasoning is a check box plus a sentence frame with one or two blanks (numbers, or a word from a printed bank) | Slot lint: no free-text line longer than one word bank entry |
| XP-G-12 | Content never shrinks. A visual has a minimum drawn size (section 2). If it does not fit, the item count drops or the page paginates | Overflow lint + min-size lint |
| XP-G-13 | Model and Guided cells carry no label. Independent cells carry quiet letters a. b. c. in the "I Can" look, running on across the lesson. Daily-look cells carry black number tabs | Label lint per look |
| XP-G-14 | On an Independent (level 1) page or section, only the first cell carries hint scaffolds; Model and Guided cells carry every hint their level declares. Structural scaffolds appear in every cell of the step | Scaffold lint: at level 1, `hint` marks only in cell index 0 |
| XP-G-15 | Diagrams are not drawn to a misleading scale. A side labelled 8 is longer than a side labelled 3 in the same figure. "Not to scale" figures are not used below Level 6. Only the order of size is kept, never exact proportion, so a drawn length cannot settle an unknown side. Schema diagrams for word problems stay schematic (design standard RP-72) | Generator check: label order equals drawn-length order; unknown sides snap to one of three stock lengths |
| XP-G-16 | Figures appear in non-standard orientations and sizes from the second step of a ladder onward. The first step uses the standard orientation only | Generator check |
| XP-G-17 | Every independent set contains at least one edge case and, on rule pages, at least one non-example | Content audit |
| XP-G-18 | Numbers stay small while a step is new. `state.range` raises the number size only after the procedure step; fixed-domain skills (angles, time, coordinates, probability) ignore `state.range` | Ladder `constraints.range` |
| XP-G-19 | Contexts in stories and pictures are neutral and original: classroom objects, plants, water, sport, building, travel on foot or by bus. Coins, where needed, are the generic value circles 1, 5, 10, 25 | Content audit word list |
| XP-G-20 | Screen parity: a production item on paper is a production item on screen. A multiple-choice screen item exists only where the paper item is circle-one-of-N | Parity lint against `PROBLEM_TYPES.md` |
| XP-G-21 | Screen feedback: live check mark / cross per slot in Model and Guided; on Check in independent, review and test. Wrong entries stay visible. Work boxes (regroup boxes, estimate boxes, step blanks marked "work") are never marked | Behaviour test |
| XP-G-22 | Nothing in this playbook records or charts pupil results. Score is a header field on one sheet only | No tracking page types exist |
| XP-G-23 | US conventions: "regroup", comma thousands separator, customary and metric units both offered, decimal point on the baseline | String lint |
| XP-G-24 | Every skill supplies `wrongAnswer(q)` from the misconception table of its domain, so that error analysis, True or False? and Reason It can be generated for it | `ws-content-audit`: wrong ≠ answer, wrong ∈ misconception set |

---

## 2. Shared drawing kit for extension domains (XP-D)

All values are for size L. For M multiply lengths by 0.85, for S by 0.70, then round to 0.5 mm,
except where a minimum is stated. Minimums are never crossed (XP-G-12).

| Id | Element | Drawing rule |
|---|---|---|
| XP-D-01 | Line weights | As the design standard's ink table. Heavy 1.5 pt: page frame, band dividers, axes, outline of any figure the pupil judges, counts or measures. Hairline 0.75 pt: every line that bounds a writing place (answer rule, digit box, check box, table cell), figure partitions, hop arcs. Hairline 0.5 pt: only inside a visual and never bounding a writing place (graph and unit-grid lines, minor ticks, protractor degree ticks, hidden edges of solids). In this file "heavy" means 1.5 pt and "hairline" means 0.75 pt unless the element is in the 0.5 pt list |
| XP-D-02 | Line styles | Solid = given. Dotted = trace / model / a measuring or construction guide. Dashed = cut line, with one exception: the short-dash digit box that marks the unknown digit of a missing-digit item (design standard LS-8). Nothing else is dashed. The unknown part of a diagram is a solid box or arc with a label-size `?` or its answer slot. Never decorative |
| XP-D-03 | Grey | The one 40% grey: shaded regions, trace digits, faded scaffolds, the inactive protractor scale, pre-filled bars. Photocopy-safe: regions ≥ 6 mm become 45-degree hatch (second category 135-degree); trace digits become dotted outlines |
| XP-D-04 | Unit grid | Square cells 8 mm (L), 7 mm (M), 6 mm (S). Hairline. A figure on the grid has a heavy outline |
| XP-D-05 | Labelled figure | Minimum short side 18 mm. Side labels in cell text (15 / 13 / 11 pt), centred outside the side, 1.5 mm clear. A blank for a missing side is a 14 mm rule in the same position |
| XP-D-06 | Equal-side ticks, right-angle square, parallel arrows | Tick 2.5 mm hairline across the side; corner square 3 mm; arrow 3 mm chevron on the side. One mark family per step |
| XP-D-07 | Number line | Heavy line with arrowheads where it continues; labelled ticks 5 mm at heavy weight, part ticks 3 mm at hairline weight; labels below in label size (12 / 10 / 9 pt); minimum tick pitch 8 / 7 / 6 mm at L / M / S wherever the pupil marks a tick or draws a hop. Hop arrows are hairline arcs above the line, 5 mm high, with a number above each (solid when given, dotted when modelled) |
| XP-D-08 | Vertical scale (thermometer, jug, scale bar) | Same tick rules as XP-D-07, turned 90 degrees. Labels to the left. Liquid level is a grey fill with a heavy top edge |
| XP-D-09 | Coordinate grid | Cells 8 mm (L). Axes heavy with arrowheads, every integer labelled, origin labelled 0 once. Points are solid 2.5 mm dots with a bold capital letter 1.5 mm up-right |
| XP-D-10 | Protractor | Half-disc, radius 38 mm minimum (never scaled below), hairline. Degree ticks each 1, longer each 5, numerals each 10. The active scale is bold black; the other scale is grey. Centre mark is a 2 mm cross |
| XP-D-11 | Angle | Two heavy rays of 35 mm minimum at L (30 / 25 at M / S) from a solid 1.5 mm vertex dot; hairline arc radius 8 mm. Right angle uses the 3 mm square instead of the arc |
| XP-D-12 | Solid (3-D) | Oblique projection, receding edges at 30 degrees and 0.4 of their length. Hidden edges 0.5 pt solid hairline (never dashed, never dotted: dotted means a guide to follow). Unit-cube stacks show every visible cube edge in hairline with a heavy silhouette |
| XP-D-13 | Shape tokens | Star, circle, triangle, square, each 6 mm, in two states: solid black and hollow. These are the only category markers for probability, ratio pictures and sorting |
| XP-D-14 | Bars in graphs | Bar width = 60% of category pitch. Bars are at least 8 mm wide. Fill: first series grey with a heavy outline, second series hollow (white) with a heavy outline; a graph has at most two series. A single-series graph uses grey. Hatch appears only as the Photocopy-safe form of the grey. Gridlines hairline at every scale step |
| XP-D-15 | Table | Hairline inner rules, heavy outer rule, heavy rule under the head row. Head row in bold label size. Cell height = Hw + 4 mm |
| XP-D-16 | Rule box | A rounded-corner box (3 mm radius, hairline) that holds a fact the pupil reads, such as "1 m = 100 cm". Rounded means read; square means write |
| XP-D-17 | Step columns | A cell split by a hairline vertical into "Step 1", "Step 2" (bold label size at the top-left of each column). Used for two-stage procedures |
| XP-D-18 | Funnel | An expression redrawn once per line, each line centred under the underlined part of the line above. Line pitch = Hw + 4 mm |
| XP-D-19 | Word bank | A rounded box, words in cell text separated by 6 mm, alphabetical order. Appears in the Guided band only unless the step says otherwise |
| XP-D-20 | Check box | 7 mm square at L (6 / 5 at M / S), hairline, 2 mm left of its sentence. Decision sentences are first person ("I need the space inside, so I find the area") |

---

## 3. Shared page frame used by every exemplar

Every exemplar below sits inside this frame. The exemplars draw only the body, plus the title and tab text.

```
A4 210 x 297 mm | margins 12 / 12 / 12 / 14 | live area 186 x 271 mm
+----------------------------------------------------------------------------+
| Name ______________________  Date ___________  Score ___/N   | STRAND TAB  |  header
|                 I Can <verb> <object> (<constraint>)         |  Level N    |  <= 26 mm
+----------------------------------------------------------------------------+
|                                                                            |
|   BODY  (about 236 mm on A4; bands and cells share borders)                |
|                                                                            |
+----------------------------------------------------------------------------+
  <skill id> · Grade N · CCSS code          page n/N          form · seed      teacher footer 6 mm
```

- Header fields Name, Date, Score, tab and title are each switchable and remembered. Score prints with its denominator; it is suppressed only on a sheet with no scored item (an Opener without Independent rows, a scripted Model page, a Guided page).
- The tab's three lines are "Level N", the strand word and the page id, in that order (design standard HD-5). Grade and CCSS code appear only in the teacher footer.
- The exemplar drawings shorten band labels to fit the monospace width ("What's new", "Words", "Steps", "Model", "Guided") and capitalise titles like the ladder tables. On the printed page the labels are always the fixed strings of design standard BD-1 (`What's New:`, `Vocabulary:`, `Steps:`, `Model:`, `Guided Practice:`, `Independent Practice:`) and the title is sentence case after "I Can" (HD-10).
- Opener bands, top to bottom, labelled from the fixed band vocabulary: **What's New:** (the "This time you will ..." sentence) → **Vocabulary:** (≤ 3 terms, each with a labelled mini-diagram) and / or **Rule:** → **Warm-up:** → **Steps:** beside **Model:** → **Say:** (the oral frame; an option, on by default) → **Guided Practice:**. Independent pages hold cells only.
- Default item caps: 6 per independent page (2 × 3); 4 for long procedures and full-width visuals (2 × 2 or 4 × 1); 3 for full-width rows with step blanks; 8-16 for one-mark items; tests 8, 10, 12, 16 or 20 (4 for long procedures). The design standard's density table (12.1) is the ceiling for each size.

---

## 4. Domains

### 4.1 Early shapes + classifying shapes (SH)

**Skill ids**

| Category | Ids |
|---|---|
| `shapes_early` | `name_2d_shapes`, `name_3d_shapes`, `shape_name_match_2d`, `shape_name_match_3d`, `shape_positions`, `shape_corners_count`, `count_sides_vertices_2d`, `count_edges_faces_vertices`, `compose_shapes`, `compose_hexagon`, `compose_rect_from_squares`, `partition_shapes`, `shape_attributes`, `compose_from_attributes`, `mixed_shapes_early` |
| `shapes_classify` | `classify_triangles`, `classify_quads`, `hotspot_quads`, `net_identify`, `cross_section_3d`, `mixed_shapes` |
| `comparing` (support) | `compare_objects`, `classify_count` |

(`order_objects_length` and `measure_nonstandard` sit in `shapes_early` in the data file but belong to ladder 4.6.)

**Ladder SH**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| SH-1 | I Can Find Triangles | ... find every triangle in a set and count them. | one shape, standard orientation | `name_2d_shapes` |
| SH-2 | I Can Find Triangles (turned and stretched) | ... find triangles that are turned or thin. | orientation + proportion vary | `name_2d_shapes` |
| SH-3 | I Can Count Sides and Corners | ... count the sides, then the corners, of one shape. | response becomes a number | `count_sides_vertices_2d`, `shape_corners_count` |
| SH-4 | I Can Sort Shapes Into Two Groups | ... put each shape in one of two boxes. | two shapes in one set | `shape_attributes`, `classify_count` |
| SH-5 | I Can Tell Flat Shapes From Solid Shapes | ... check the flat or solid box for each picture. | 3-D enters | `name_3d_shapes` |
| SH-6 | I Can Count Faces, Edges and Corners of a Solid | ... count one part at a time on a solid. | count on a 3-D drawing | `count_edges_faces_vertices` |
| SH-7 | I Can Tell a Polygon From Not a Polygon | ... check the yes or no box, using the rule "closed, straight sides". | non-examples enter | `compose_from_attributes` |
| SH-8 | I Can Check One Attribute (equal sides) | ... check the yes or no box: are all sides equal? | one attribute, shown by tick marks | `shape_attributes` |
| SH-9 | I Can Check One Attribute (right angle) | ... check the yes or no box: does it have a right angle? | attribute changes to corner squares | `shape_attributes` |
| SH-10 | I Can Check One Attribute (parallel sides) | ... count the pairs of parallel sides. | attribute changes to arrows | `identify_lines` |
| SH-11 | I Can Name Quadrilaterals (3 words) | ... copy the right name from a bank of three words. | naming from attributes; bank of 3 | `classify_quads`, `hotspot_quads` |
| SH-12 | I Can Name Triangles by Their Sides | ... copy scalene, isosceles or equilateral from the bank. | shape family changes; same format | `classify_triangles` |

Follow-on (Level 5-6, same cell formats): bank of 6 quadrilateral words; triangles by angle; two attributes with two stacked check-box rules; always / sometimes / never statements (Reason It page); `net_identify`; `cross_section_3d`. Composing and partitioning (`compose_shapes`, `compose_hexagon`, `compose_rect_from_squares`, `partition_shapes`) are a parallel K-2 ladder that uses the same visual-grid cell with dotted guide lines to trace.

**Representations**

| Representation | Drawn how |
|---|---|
| 2-D shape | Heavy outline, no fill, minimum bounding box 30 / 36 / 42 mm at S / M / L (design standard 11.2). From SH-2, rotation is any multiple of 15 degrees and aspect ratio varies 1:1 to 1:3 |
| Attribute marks | XP-D-06. Only the attribute of the current step is marked; other marks are absent, not greyed |
| Solid | XP-D-12. From SH-5 each solid appears once as a wireframe and once as a plain line-art object of that form (box, can, ball, cone) |
| Sort boxes | Two square-cornered boxes 80 × 50 mm under the set, each with a bold head word. Shapes carry small letters so the pupil writes letters in the boxes |
| Non-examples | Open figures, figures with one curved side, figures with crossing sides |

**Response modes**

| Print | Screen |
|---|---|
| Circle every matching shape; write the count on a rule | Tap to ring; type the count |
| Digit in a box beside "sides" / "corners" | One-digit input |
| Write the shape's letter in a sort box | Drag the shape to a bin |
| Check the yes / no box | Tap the box |
| Copy a word from the bank onto a rule | Tap a bank chip, then tap the rule |
| Trace a dotted shape; draw on dot paper (print only) | Tap dots to join |

**Page roles.** Best fit: visual grid (3 × 3 at L for find / check-box items), opener + independent, word-bank labelling page (SH-11, SH-12), sort page, Reason It (always / sometimes / never; odd one out), True or False? ("A square is a rectangle"). Fits every other role through the standard cell: Daily 4 and spiral panels take one check-or-name cell; Stretch takes "Draw three different shapes with 4 sides and 1 right angle" on dot paper with a results table.

**Scaffolds**

| Structural (persist) | Hint (fade in this order) |
|---|---|
| Letters on shapes for sorting; labelled count boxes; yes / no check-box pairs; dot paper | 1 traced ring on the first match → 2 counting dots on each corner → 3 attribute marks pre-drawn (from SH-11 the pupil must look without them) → 4 word bank (kept in Guided, removed in Independent) |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| SH-M1 | Only the "pointing up" equilateral picture is a triangle | A turned or thin triangle left uncircled |
| SH-M2 | A turned square is a "diamond", not a square | Square at 45 degrees labelled rhombus only / not counted as a square |
| SH-M3 | A square is not a rectangle | "False" for "every square is a rectangle" |
| SH-M4 | Sides and corners counted as different numbers on a polygon | 4 sides, 5 corners (double-counting the start corner) |
| SH-M5 | Open or curved figures accepted as polygons | Non-example checked yes |
| SH-M6 | Faces counted only where visible | Cube: 3 faces |
| SH-M7 | Isosceles and equilateral swapped | Two equal sides labelled equilateral |

**Exemplar: opener page, SH-11, "I Can Name Quadrilaterals (3 words)", Level 3**

```
| Geometry / Level 3                 I Can Name Quadrilaterals (3 words)      |
+-----------------------------------------------------------------------------+
| What's new   This time you will copy the right name from a bank of 3 words. |  12 mm
+-----------------------------------------------------------------------------+
| Words   parallel  -> two lines that never meet   [mini: two sides, arrows]  |  30 mm
|         rectangle -> 4 right angles              [mini: corner squares]     |
|         trapezoid -> 1 pair of parallel sides    [mini: one arrow pair]     |
+--------------------------------------+--------------------------------------+
| Steps                                | Model                                |  62 mm
| 1. Look for right angles.            |   [rectangle, turned 30 deg,         |
| 2. Count pairs of parallel sides.    |    corner squares + arrows]          |
| 3. Copy the name from the bank.      |   r e c t a n g l e   <- grey trace  |
| 4. Say: "It is a ___ because ___."   |   [trapezoid, marks]   ___________   |
+--------------------------------------+--------------------------------------+
| Guided    Copy the name of each shape.                                      |  9 mm
+------------------+------------------+------------------+--------------------+
| [rhombus marks]  | [trapezoid]      | [rectangle]      | [rhombus, turned]  |  52 mm
| ________________ | ________________ | ________________ | ________________   |
+------------------+------------------+------------------+--------------------+
| ( rectangle     rhombus     trapezoid )   <- rounded word bank, Guided only |  14 mm
+-----------------------------------------------------------------------------+
```

Geometry: shapes at the design-standard minimum (bounding box 42 mm at L, so the Guided row holds 3 cells at L; the drawing shows the size M row of 4 at 36 mm); name rule 40 mm; Model and Guided cells unlabelled (XP-G-13). The independent page that follows is a 2 × 4 grid, no bank, cells lettered a.-h., with attribute marks present (they fade in the follow-on step).

---

### 4.2 Angles + lines (AN)

**Skill ids**

| Category | Ids |
|---|---|
| `angles_lines` | `identify_lines`, `identify_angles`, `measure_angles`, `additive_angles`, `symmetry`, `place_symmetry_lines`, `mixed_angles_lines` |

**Ladder AN**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| AN-1 | I Can Name a Point, Segment, Line and Ray | ... look at the ends: a dot stops, an arrow goes on. | four objects, bank of 4 | `identify_lines` |
| AN-2 | I Can Tell Parallel, Perpendicular and Intersecting Lines | ... copy one of three words for each pair of lines. | pairs of lines | `identify_lines` |
| AN-3 | I Can See an Angle as a Turn | ... check the box for a quarter turn, half turn or full turn on a dial. | angle enters, as a turn | `identify_angles` |
| AN-4 | I Can Test for a Right Angle | ... check the yes or no box, using the corner square. | yes / no against one benchmark | `identify_angles` |
| AN-5 | I Can Name Acute, Right and Obtuse Angles | ... copy one of three words. | three classes | `identify_angles` |
| AN-6 | I Can Choose the Protractor Scale | ... circle "inside" or "outside": which scale starts at 0 on the ray? No measuring today. | decide-only | `measure_angles` |
| AN-7 | I Can Read a Protractor (tens) | ... read an angle that lands on a ten. | read, multiples of 10 | `measure_angles` |
| AN-8 | I Can Read a Protractor (fives and ones) | ... read an angle that lands between the tens. | precision | `measure_angles` |
| AN-9 | I Can Read a Protractor (ray points left) | ... use the other scale because the ray points left. | orientation | `measure_angles` |
| AN-10 | I Can Find the Missing Angle on a Straight Line | ... use 180 − __ = __. | computation with a frame | `additive_angles` |
| AN-11 | I Can Add Two Angles | ... add two parts to find the whole angle. | unknown moves to the whole | `additive_angles` |
| AN-12 | I Can Find Lines of Symmetry | ... check the yes or no box for a dotted fold line, then draw one. | new object, same yes / no cell | `symmetry`, `place_symmetry_lines` |

Follow-on (Level 5-6): angles around a point (360), angle sum of a triangle, drawing an angle with a protractor (print only).

**Representations**

| Representation | Drawn how |
|---|---|
| Point / segment / line / ray | Heavy stroke 40 mm; end dot 2 mm solid = stops; arrowhead 3 mm = goes on. Capital letters at the ends |
| Angle | XP-D-11. Orientation varies from AN-5. Ray lengths deliberately unequal in at least two items per page (see AN-M2) |
| Turn dial | Circle 36 mm, hairline, four quarter marks, a heavy start hand and a dotted end hand with a hairline arc arrow |
| Protractor | XP-D-10. Pre-placed: centre cross on the vertex, zero line on one ray. The second ray extends 4 mm beyond the scale. Active scale bold, other scale grey (hint; it fades, see below) |
| Straight-line / whole-angle figure | Heavy base line, one or two inner rays, known angle labelled inside its arc, unknown arc solid with a `__°` slot beside it |
| Symmetry | Heavy outline figure on an 8 mm dot grid; candidate fold line dotted |

**Response modes**

| Print | Screen |
|---|---|
| Copy a word from the bank | Tap a chip |
| Check the yes / no box; check one of three turn boxes | Tap |
| Circle "inside" / "outside" | Tap a ring |
| Write a number on a rule with "°" pre-printed | Numeric input with "°" suffix |
| Frame `180 − __ = __` | Two inline inputs |
| Draw a fold line on dot paper | Tap two dots (existing `place_symmetry_lines` interaction) |

**Page roles.** Best fit: opener + independent; full-width rows for protractor items (4 per page at L, because XP-D-10 fixes the radius at 38 mm minimum); visual grid 3 × 3 for naming; decision page (AN-6); error analysis (reading the wrong scale); True or False? ("An obtuse angle is bigger than a right angle"). Spiral panel and Daily 4 take one naming cell or one `180 − __` frame; they never take a protractor cell at S because it cannot shrink — the packer substitutes a naming item and notes this in the dialog.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| `__°` slot; `180 − __ = __` frame; yes / no boxes; dot grid | 1 traced first answer → 2 bold active scale / grey inactive scale (both black from AN-9 Independent) → 3 dotted guide from the ray to the scale numeral → 4 benchmark caption "less than 90" / "more than 90" under the slot |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| AN-M1 | Reads the wrong protractor scale | 180 − true value (60 for 120) |
| AN-M2 | Longer rays mean a bigger angle | Picks the long-rayed 40 over the short-rayed 70 |
| AN-M3 | Reads from the ray end, not from 0 | Off by the offset of the first ray |
| AN-M4 | A right angle must have one horizontal ray | Turned right angle checked "no" |
| AN-M5 | Straight line sum taken as 100 or 360 | 100 − known, 360 − known |
| AN-M6 | Parallel means "same length"; perpendicular means "crossing" | Intersecting non-perpendicular pair labelled perpendicular |
| AN-M7 | Diagonal of a rectangle is a line of symmetry | "Yes" for the diagonal fold |

**Exemplar: independent page, AN-7, "I Can Read a Protractor (tens)", Level 4**

```
| Geometry / Level 4                  I Can Read a Protractor (tens)          |
+-----------------------------------------------------------------------------+
| Read the bold scale. Write the angle.                                       |  9 mm
+-----------------------------------------------------------------------------+
| a.        .-''''''''''''-.                                                  |
|        .-'  bold scale    '-.         The angle is  ______ °                |  56 mm
|       /   grey scale   /     \                                              |
|      '--------+-------/-------'       [ ] less than 90   [ ] more than 90   |
|               vertex                                                        |
+-----------------------------------------------------------------------------+
| b.   (protractor, ray at 130)         The angle is  ______ °                |  56 mm
|                                       [ ] less than 90   [ ] more than 90   |
+-----------------------------------------------------------------------------+
| c.   (protractor, ray at 90)          The angle is  ______ °                |  56 mm
|                                       [ ] less than 90   [ ] exactly 90 ... |
+-----------------------------------------------------------------------------+
| d.   (protractor, ray at 20)          The angle is  ______ °                |  56 mm
+-----------------------------------------------------------------------------+
```

Geometry: four full-width rows of 56 mm; protractor radius 38 mm at the left, answer zone 80 mm at the right; letters a.-d. quiet, top-left. Item c is the seeded edge case (exactly 90). The benchmark check-box pair is a hint scaffold: present in rows a-c on the first independent page, absent on later pages. On a test the pair is controlled by the "hints on tests" dialog option.

---

### 4.3 Area + perimeter (AP)

**Skill ids**

| Category | Ids |
|---|---|
| `area_perimeter` | `perimeter_intro`, `perimeter_grid`, `perimeter`, `area_unit_squares`, `area`, `area_perimeter`, `area_distributive_visual`, `composite_shapes`, `area_polygon_decompose`, `area_triangle`, `mixed_area_perimeter` |
| `coordinates` (link) | `coord_polygon` |

Two ladders, because perimeter and area are two procedures that collide (XP-G-06). Perimeter is taught first; AP-A4 is the discrimination step.

**Ladder AP-P (perimeter)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| AP-P1 | I Can Count Around a Shape | ... count the unit edges around a shape on a grid. | grid, count only | `perimeter_grid` |
| AP-P2 | I Can Add All the Sides | ... write each side in the frame, then add. | labels replace the grid | `perimeter_intro` |
| AP-P3 | I Can Write the Missing Sides of a Rectangle | ... write the two sides that are not labelled. No adding today. | notate-only | `perimeter` |
| AP-P4 | I Can Find the Perimeter of a Rectangle | ... write the missing sides, then add all four. | combine P2 + P3 | `perimeter` |
| AP-P5 | I Can Find the Perimeter of a Shape With Equal Sides | ... use sides × length. | regular polygons | `perimeter` |
| AP-P6 | I Can Find a Missing Side From the Perimeter | ... work back from the total. | unknown position | `perimeter` |

**Ladder AP-A (area)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| AP-A1 | I Can Count Unit Squares | ... count the squares that cover a shape. | grid, count only | `area_unit_squares` |
| AP-A2 | I Can Use Rows to Find Area | ... write "__ rows, __ in each row", then multiply. | count → multiply, grid kept | `area_unit_squares` |
| AP-A3 | I Can Find the Area of a Rectangle | ... use the side labels: __ × __ = __ square units. | grid removed | `area` |
| AP-A4 | I Can Choose Area or Perimeter | ... check the "around" or "cover" box for each story. No solving today. | decide-only | `area_perimeter` |
| AP-A5 | I Can Find Both Area and Perimeter | ... fill P = and A = for one rectangle. | both in one cell | `area_perimeter` |
| AP-A6 | I Can Split an L-Shape Into Two Rectangles | ... draw one line. No solving today. | set-up-only | `composite_shapes` |
| AP-A7 | I Can Write the Missing Sides of an L-Shape | ... find the two sides that have no label. | notate-only | `composite_shapes` |
| AP-A8 | I Can Find the Area of an L-Shape | ... find two areas, then add them. | full procedure in step columns | `composite_shapes`, `area_polygon_decompose` |

Follow-on: `area_distributive_visual` (split a rectangle, same step-column cell); `area_triangle` at Level 6 (half of a rectangle drawn dotted around the triangle); `coord_polygon`. Word problems use the rectangle schema diagram after AP-A5.

**Representations**

| Representation | Drawn how |
|---|---|
| Grid figure | XP-D-04. Heavy outline on an 8 mm grid. In AP-P1 each counted edge may carry a small tick (hint) |
| Labelled rectangle | XP-D-05. Dimensions from `Math.sqrt(state.range)`; drawn proportional (XP-G-15), clamped to a 1:4 aspect |
| L-shape | `createLShapeSVG` in mono. All six sides drawn; four labelled from AP-A7. The pupil's split line is drawn in the answer key as a solid 1.5 pt line, like any other answer mark |
| Perimeter frame | `__ + __ + __ + __ = __ cm`, one blank per side, under the figure |
| Area frame | `__ × __ = __ square cm` |
| Step columns | XP-D-17: Step 1 "Area A", Step 2 "Area B", Step 3 "Add" |

**Response modes**

| Print | Screen |
|---|---|
| Number on a rule, unit pre-printed | Numeric input with unit suffix |
| Frame blanks | Inline inputs, left to right |
| Check the "around" / "cover" box | Tap |
| Draw one line on the L-shape (dotted candidate lines at both valid positions in Model only) | Tap one of the two candidate lines |
| Write a missing side on a rule placed on the side | Input placed on the side |

**Page roles.** Best fit: independent 2 × 3 (`medium` footprint) for rectangles; 2 × 2 for L-shapes; decision page (AP-A4); set-up-only page (AP-A6); error analysis; schema word problem (rectangle diagram); Stretch ("Draw three rectangles with area 12 square units" on grid paper with a results table of length, width, perimeter). Daily-look spiral panel takes one labelled rectangle with P = and A =.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Perimeter and area frames; pre-printed units; step columns; grid paper in Stretch | 1 traced first cell → 2 edge ticks / numbered squares → 3 caption "around" / "cover" beside P = / A = → 4 grid under the labelled rectangle (grey, then gone) → 5 candidate split lines |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| AP-M1 | Adds only the two labelled sides | l + w |
| AP-M2 | Area and perimeter swapped | 2(l + w) given as area; l × w as perimeter |
| AP-M3 | Counts corner squares twice, or counts squares instead of edges, for perimeter on a grid | Perimeter + 4; area given as perimeter |
| AP-M4 | Multiplies all four sides | l × w × l × w |
| AP-M5 | L-shape: multiplies the two longest sides | Bounding-rectangle area |
| AP-M6 | L-shape: uses an overlapping split (counts the corner block twice) | True area + overlap |
| AP-M7 | Unit error | "cm" checked for area; "square cm" for perimeter |

**Exemplar: set-up-only page, AP-A6, "I Can Split an L-Shape Into Two Rectangles", Level 4**

```
| Geometry / Level 4         I Can Split an L-Shape Into Two Rectangles       |
+-----------------------------------------------------------------------------+
| What's new   This time you will draw one line. You will not solve today.    |  12 mm
+--------------------------------------+--------------------------------------+
| Steps                                | Model                                |
| 1. Find the inside corner.           |   +------+                           |  70 mm
| 2. Draw a straight line from it      |   |  A   |                           |
|    to the other side.                |   |......+--------+   <- dotted      |
| 3. Write A and B in the rectangles.  |   |  B            |      trace line  |
| 4. Check: two rectangles, no overlap.|   +---------------+                  |
+--------------------------------------+--------------------------------------+
| Guided    Draw one line. Write A and B.                                     |  9 mm
+--------------------------------------+--------------------------------------+
|   [L-shape, inside corner marked     |   [L-shape turned 90 deg,            |  66 mm
|    with a small grey dot]            |    inside corner marked]             |
+--------------------------------------+--------------------------------------+
| Draw one line. Write A and B.                                               |  9 mm
+-------------------------+-------------------------+-------------------------+
| a. [L-shape]            | b. [L-shape, turned]    | c. [L-shape, mirrored]  |  60 mm
+-------------------------+-------------------------+-------------------------+
```

Geometry: L-shapes drawn on a faint 8 mm grid so that a ruler line lands on a grid line; minimum arm width 16 mm. The grey corner dot is a hint (Guided only). No numbers appear anywhere on this page: nothing can be computed, so the pupil cannot skip the set-up. Independent items continue on the next page as d.-i.

---

### 4.4 Volume (VO)

**Skill ids**

| Category | Ids |
|---|---|
| `area_perimeter` | `volume`, `volume_composite` |
| `coordinates` (link) | `net_surface_area` |
| `shapes_classify` (link) | `net_identify` |

**Ladder VO**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| VO-1 | I Can Count the Cubes in One Layer | ... count the cubes in a flat layer using rows. | one layer | `volume` |
| VO-2 | I Can Count the Layers | ... write how many layers a stack has. No total today. | notate-only, second dimension | `volume` |
| VO-3 | I Can Find Volume by Counting Layers | ... write cubes in one layer, then layers, then multiply. | combine, three step blanks | `volume` |
| VO-4 | I Can Find the Base Area of a Box | ... use the length and width labels: __ × __ = __. | cubes removed, labels enter; base only | `volume` |
| VO-5 | I Can Find Volume From Base and Height | ... multiply the base area by the height. | height joins, step columns | `volume` |
| VO-6 | I Can Find Volume in One Line | ... write l × w × h = __ in one frame. | step columns merge | `volume` |
| VO-7 | I Can Choose Square Units or Cubic Units | ... check the "square cm" or "cubic cm" box. No solving today. | decide-only | `volume`, `area` |
| VO-8 | I Can Find a Missing Edge | ... work back from the volume. | unknown position | `volume` |
| VO-9 | I Can Find the Volume of Two Boxes Joined | ... find two volumes, then add them. | composite, step columns | `volume_composite` |

Follow-on: word problems with a box diagram; `net_surface_area` (a separate Level 6 ladder that reuses the AP-A8 step columns: one face per step).

**Representations**

| Representation | Drawn how |
|---|---|
| Cube stack | XP-D-12. Cube edge 8 mm at L (7 / 6 at M / S). Heavy silhouette, hairline cube edges. In VO-1 to VO-3 the top layer is grey (hatched in Photocopy-safe) so "one layer" is visible. Maximum 5 × 4 × 4 cubes; dimensions from `Math.pow(state.range, 1/3)` |
| Labelled box | `create3DBoxSVG` in mono. Labels sit outside the front-bottom edge (length), the receding bottom edge (width) and the front-right vertical edge (height), always in that order and wording: "length", "width", "height" in the Model, letters l, w, h after VO-6 |
| Step blanks | To the right of the figure: "cubes in one layer ____", "layers ____", "volume ____ cubic units" |
| Composite | Two boxes sharing a face; each has a bold letter A, B on its front face; the join is a hairline |

**Response modes**

| Print | Screen |
|---|---|
| Number on a rule beside a pre-printed caption | Numeric input |
| Frame `__ × __ × __ = __ cubic cm` | Inline inputs |
| Check a unit box | Tap |
| Rule on the unknown edge | Input on the edge |

**Page roles.** Best fit: full-width rows, 3 per page at L (figure left, step blanks right); 2 × 2 for labelled boxes from VO-6; decision page (VO-7); error analysis; schema word problem with step columns. Stretch: "A box holds 24 cubes. Write three different sets of length, width, height" with a results table.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Captioned step blanks; step columns; unit words pre-printed; letters A / B on composite parts | 1 traced first row → 2 grey top layer → 3 row-count ticks along the front edge → 4 words length / width / height (become l, w, h) |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| VO-M1 | Counts only visible cubes | Visible-face cube count |
| VO-M2 | Adds the three dimensions | l + w + h |
| VO-M3 | Multiplies only two dimensions | l × w |
| VO-M4 | Counts faces (surface squares) instead of cubes | Number of visible squares |
| VO-M5 | Unit error | "square cm" for a volume |
| VO-M6 | Composite: multiplies the overall bounding box | Bounding-box volume |

**Exemplar: independent page, VO-3, "I Can Find Volume by Counting Layers", Level 5**

```
| Geometry / Level 5            I Can Find Volume by Counting Layers          |
+-----------------------------------------------------------------------------+
| Count one layer. Count the layers. Multiply.                                |  9 mm
+-----------------------------------------------------------------------------+
| a.    ___________                                                           |
|      /##/##/##/##/|        cubes in one layer   __12__   <- grey trace      |  72 mm
|     /##/##/##/##/ |        layers               __3___                      |
|    +--+--+--+--+  |        volume    12 x 3 =   __36__  cubic units         |
|    |  |  |  |  | /         (## = grey top layer)                            |
|    +--+--+--+--+/                                                           |
+-----------------------------------------------------------------------------+
| b.   [stack 3 x 2 x 4, top layer grey]                                      |
|                            cubes in one layer   ______                      |  72 mm
|                            layers               ______                      |
|                            volume   ___ x ___ = ______  cubic units         |
+-----------------------------------------------------------------------------+
| c.   [stack 5 x 2 x 1, top layer grey]   <- edge case: one layer            |  72 mm
|                            cubes in one layer   ______                      |
|                            layers               ______                      |
|                            volume   ___ x ___ = ______  cubic units         |
+-----------------------------------------------------------------------------+
```

Geometry: three rows of 72 mm; figure zone 86 mm wide, blanks zone 100 mm. Row a is traced because this exemplar is the first independent page of the step (XP-G-14); on the next page no row is traced and letters continue d., e., f.

---

### 4.5 Coordinates + transformations (CO)

**Skill ids**

| Category | Ids |
|---|---|
| `coordinates` | `coordinate_q1`, `coordinate_graph`, `coord_distance_q1`, `coord_polygon`, `coordinate_all`, `geo_translate`, `geo_reflect`, `geo_rotate`, `mixed_coordinates` |
| `patterns` (link) | `pattern_relationship` |

**Ladder CO**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| CO-1 | I Can Read an Across Line and an Up Line | ... read a number on a flat number line and on a standing one. | two number lines, not yet joined | `coordinate_q1` |
| CO-2 | I Can Write the First Number of a Point (across) | ... start at 0, count across, and write only the first number. | grid; x only, y pre-printed | `coordinate_q1` |
| CO-3 | I Can Write the Second Number of a Point (up) | ... count up and write only the second number. | y only, x pre-printed | `coordinate_q1` |
| CO-4 | I Can Write Both Numbers of a Point | ... write across first, then up. | both blanks | `coordinate_q1` |
| CO-5 | I Can Plot a Point | ... mark a dot for a pair you are given. | direction reversed: pair → point | `coordinate_graph` |
| CO-6 | I Can Plot Points on the Axes and Look-Alike Pairs | ... plot pairs with a 0, and tell (3, 5) from (5, 3). | edge cases + contrast pairs | `coordinate_graph` |
| CO-7 | I Can Find the Distance Between Two Points on a Line | ... count the squares between two points in the same row or column. | new question on the same grid | `coord_distance_q1` |
| CO-8 | I Can Join Points to Make a Shape | ... plot four points, join them, and name the shape. | multi-point | `coord_polygon` |
| CO-9 | I Can Turn a Rule Table Into Points | ... copy each row of a table as a pair, then plot it. | table source | `pattern_relationship` |
| CO-10 | I Can Slide a Shape | ... move every corner the same number of squares right and up. | translation | `geo_translate` |
| CO-11 | I Can Flip a Shape Over a Line | ... count squares to the mirror line and the same number past it. | reflection | `geo_reflect` |
| CO-12 | I Can Tell a Slide, a Flip and a Turn | ... circle one of three words for each picture. | discrimination; rotation recognised only | `geo_rotate`, `geo_translate`, `geo_reflect` |

Follow-on (after ladder IN): four quadrants (`coordinate_all`), quarter-turn rotation drawn about a corner.

**Representations**

| Representation | Drawn how |
|---|---|
| First-quadrant grid | XP-D-09. 0-8 on both axes at L in a 2 × 2 page; 0-10 when the cell is full width. Axis names "across" and "up" in CO-1 to CO-4, x and y after |
| Hop arrows | Dotted hairline path from 0 across, then up, with a small arrowhead at each end; a hint scaffold |
| Pair frame | `( __ , __ )` with 12 mm square digit boxes; the pre-printed coordinate is black, not grey, because it is given, not traced |
| Transformation | Original shape heavy outline with corners lettered A, B, C; image drawn by the pupil. In Model the image is dotted. Mirror line is heavy and labelled "mirror line". Slide instruction sits in a rule box: "4 right, 2 up" |
| Rule table | XP-D-15, two columns x, y, with a third column "( x , y )" to copy the pair into |

**Response modes**

| Print | Screen |
|---|---|
| Digit in a box inside the pair frame | One-digit inputs (existing `coordinate-multi`) |
| Mark a dot and write its letter | Tap a grid intersection |
| Number on a rule with "squares" pre-printed | Numeric input |
| Draw the image with a ruler | Tap image corners in order; the app joins them |
| Circle slide / flip / turn | Tap a ring |

**Page roles.** Best fit: visual grid 2 × 2 (`wide` footprint: one grid serves 3-4 lettered points, each with its own pair frame beside the grid); full-width row for transformations (2 per page); function-table page (CO-9); error analysis (reversed pair); True or False? ("(0, 4) is on the across line"). Daily 4 and spiral panels use a 0-5 grid at the 8 mm cell minimum with one point.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Pair frame with brackets and comma pre-printed; every axis integer labelled; lettered points; copy column in the rule table | 1 traced first pair → 2 hop arrows → 3 words "across" / "up" under the two boxes of the pair frame → 4 dotted drop-lines from the point to each axis |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| CO-M1 | Reverses the order | (y, x) |
| CO-M2 | Counts grid squares from 1, not from 0 | (x + 1, y + 1) |
| CO-M3 | Points on an axis written with the 0 in the wrong place | (0, 4) for (4, 0) |
| CO-M4 | Distance counted by points, not by gaps | distance + 1 |
| CO-M5 | Slide moves only one corner, or moves right / up in the wrong order of size | One vertex unmoved; (up, right) applied as (right, up) |
| CO-M6 | Flip drawn as a slide | Image same way round on the other side of the line |
| CO-M7 | Flip distance measured from the shape's far side | Image touching the mirror line |

**Exemplar: independent page, CO-2, "I Can Write the First Number of a Point (across)", Level 5**

```
| Geometry / Level 5     I Can Write the First Number of a Point (across)     |
+-----------------------------------------------------------------------------+
| Start at 0. Count across. Write the first number.                           |  9 mm
+--------------------------------------+--------------------------------------+
|  up                                  |  up                                  |
|  6 +--+--+--+--+--+--+               |  6 +--+--+--+--+--+--+               |
|  5 +--+--+--B--+--+--+               |  5 +--+--+--+--+--E--+               | 112 mm
|  4 +--+--+--+--+--+--+               |  4 +--D--+--+--+--+--+               |
|  3 +--+--+--+--+--C--+               |  3 +--+--+--+--+--+--+               |
|  2 +--A--+--+--+--+--+               |  2 +--+--+--+--+--+--+               |
|  1 +--+--+--+--+--+--+               |  1 +--+--+--F--+--+--+               |
|  0 +--1--2--3--4--5--6  across       |  0 +--1--2--3--4--5--6  across       |
|                                      |                                      |
|  a.  A ( [1], 2 )  <- grey trace     |  d.  D ( [ ], 4 )                    |
|  b.  B ( [ ], 5 )                    |  e.  E ( [ ], 5 )                    |
|  c.  C ( [ ], 3 )                    |  f.  F ( [ ], 1 )                    |
+--------------------------------------+--------------------------------------+
|  (second pair of grids: points G-L, items g.-l.; item j is on the up        | 112 mm
|   line, so its first number is 0 — the seeded edge case)                    |
+-----------------------------------------------------------------------------+
```

Geometry: each grid 8 mm cells, 0-6, about 56 mm square, centred in a 93 mm cell; three pair frames under each grid. Only the first box of each pair is empty; the second number is pre-printed in black. Hop arrows are drawn for point A only.

---

### 4.6 Measurement + unit conversion (ME)

**Skill ids**

| Category | Ids |
|---|---|
| `shapes_early` | `order_objects_length`, `measure_nonstandard` |
| `measurement` | `reading_ruler`, `reading_ruler_hard`, `estimate_length`, `length_metric`, `length_customary`, `unit_conversions`, `unit_conversion_word`, `mixed_measurement` |
| `comparing` (support) | `compare_objects` |

Time and money skills in the `measurement` category (`time_*`, `elapsed_*`, `order_clocks_*`, `money*`, `equiv_coin_sets`, `enough_money`, `make_change_least_coins`) are covered by the clock and coin rules of `WORKSHEET_DESIGN_STANDARD.md` and `PROBLEM_TYPES.md`; they follow section 6 of this file for any new page. `pictograph_intro` and `bar_graph_intro` follow ladder GD.

Two ladders. Metric runs first; the customary ladder is a parallel copy of ME-C with its own rule boxes (12 in = 1 ft, 3 ft = 1 yd).

**Ladder ME-L (measuring length)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| ME-L1 | I Can Order Objects by Length | ... write 1, 2, 3 from shortest to longest. | compare, no units | `order_objects_length` |
| ME-L2 | I Can Measure With Units Drawn for Me | ... count the units drawn under an object. | units pre-drawn | `measure_nonstandard` |
| ME-L3 | I Can Measure With a Ruler From 0 | ... read the ruler where the object ends. | ruler replaces units; object starts at 0 | `reading_ruler` |
| ME-L4 | I Can Measure When the Object Does Not Start at 0 | ... count the spaces between the two ends. | start point moves | `reading_ruler` |
| ME-L5 | I Can Measure to the Half Unit | ... read a length that ends on a half mark. | precision | `reading_ruler_hard` |
| ME-L6 | I Can Choose a Sensible Unit | ... circle cm or m for each picture. | decide-only | `estimate_length` |

**Ladder ME-C (converting units)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| ME-C1 | I Can Change Meters to Centimeters | ... use the rule box: multiply by 100. | one pair, big → small | `length_metric` |
| ME-C2 | I Can Change Centimeters to Meters | ... use the same rule the other way: divide by 100. | direction reversed | `length_metric` |
| ME-C3 | I Can Decide to Multiply or Divide | ... check the box beside the rule sentence. No computing today. | decide-only | `unit_conversions` |
| ME-C4 | I Can Fill a Conversion Table | ... complete a two-column table for one unit pair. | table format | `unit_conversions` |
| ME-C5 | I Can Change a Mixed Length (3 m 20 cm) | ... change the big unit, then add the small one. | two-part quantity, step columns | `length_metric` |
| ME-C6 | I Can Compare Lengths in Different Units | ... change one length first, then write <, > or =. | comparison circle | `unit_conversions` |
| ME-C7 | I Can Solve a Conversion Story | ... use the schema page with the rule box printed on it. | word problem | `unit_conversion_word` |

**Representations**

| Representation | Drawn how |
|---|---|
| Object to measure | Plain line art (pencil, ribbon, nail, leaf) with heavy outline, ends squared off by two dotted hairline drop-lines to the ruler |
| Ruler | True scale in print: 1 cm = 10 mm on paper (the print CSS must not scale the sheet; the dialog shows "print at 100%"). Ruler body, tick heights and the 3 mm inset of the zero tick follow the design standard's ruler rule (RP-160); this file adds nothing to them. Inch rulers show halves before quarters. On screen the ruler is not true scale and the caption "not real size" appears in the chrome, outside the cell |
| Pre-drawn units | A row of identical hollow rectangles (paper-clip outline or plain block) touching end to end under the object |
| Rule box | XP-D-16, top of the page band and repeated once per page; never inside each cell |
| Conversion frame | `4 m = ____ cm` on one line; from ME-C1 Guided the working frame `4 × 100 = ____` sits under it as a hint |
| Conversion table | XP-D-15, head row = the two unit words, 5 rows, first row traced |

**Response modes**

| Print | Screen |
|---|---|
| Write 1 / 2 / 3 in a box under each object | Tap in order |
| Number on a rule, unit pre-printed | Numeric input with suffix |
| Circle one of two units | Tap a ring |
| Check the box beside a first-person rule sentence | Tap |
| Table cell digits | Table inputs |
| Symbol in a circle | Tap to cycle <, =, >, or type |

**Page roles.** Best fit: visual grid 1 × 4 full-width rows for ruler items (a ruler cannot be narrowed below the object's length); equation-drill page in the Daily look for ME-C1 / ME-C2 (2 columns × 5 rows at L, rule box above the grid); function-table page (ME-C4); decision page (ME-C3); schema word problem (ME-C7, "equal groups" diagram: 1 big unit = a group of small units). Reason It: "Which is longer, 2 m or 150 cm? Check one box and complete: ___ m = ___ cm".

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Rule box; pre-printed units; drop-lines from object ends to the ruler; table head row | 1 traced first answer → 2 working frame `__ × 100` under the conversion → 3 hop arcs on the ruler for ME-L4 → 4 caption "smaller units, so more of them" |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| ME-M1 | Reads the end mark when the object does not start at 0 | End reading, not the difference |
| ME-M2 | Counts tick marks, not spaces | length + 1 |
| ME-M3 | Starts from the ruler's physical edge or from 1 | length − 1 or + margin |
| ME-M4 | Multiplies when it should divide (and the reverse) | 400 cm → 40,000 m |
| ME-M5 | Uses the wrong factor (10 for 100; 10 for 12 in customary) | 4 m = 40 cm; 3 ft = 30 in |
| ME-M6 | Mixed length written by joining digits | 3 m 20 cm = 3,020 cm or 50 cm |
| ME-M7 | Bigger number means longer, ignoring the unit | 150 cm > 2 m marked wrong way |

**Exemplar: Daily-look equation drill, ME-C1, "I Can Change Meters to Centimeters", Level 4**

```
| Measurement / Level 4          I Can Change Meters to Centimeters           |
+-----------------------------------------------------------------------------+
| Use the rule. Write the missing number.                                     |  9 mm
+-----------------------------------------------------------------------------+
|        ( 1 m = 100 cm )      <- rounded rule box, centred                   |  16 mm
+--------------------------------------+--------------------------------------+
|[1]                                   |[2]                                   |
|     4 m = __400__ cm  <- grey trace  |     7 m = ________ cm                |  40 mm
|     4 x 100 = 400     <- grey        |     __ x 100 = ____                  |
+--------------------------------------+--------------------------------------+
|[3]  2 m = ________ cm                |[4]  9 m = ________ cm                |  40 mm
+--------------------------------------+--------------------------------------+
|[5]  1 m = ________ cm   <- edge: 1   |[6]  10 m = ________ cm               |  40 mm
+--------------------------------------+--------------------------------------+
|[7]  6 m = ________ cm                |[8]  0 m = ________ cm   <- edge: 0   |  40 mm
+--------------------------------------+--------------------------------------+
|[9]  12 m = ________ cm               |[10] 5 m = ________ cm                |  40 mm
+--------------------------------------+--------------------------------------+
```

Geometry: [n] = black number tab (white Andika 700 numeral on a black square, flush top-left). Answer rule 30 mm. The working frame is a hint: traced in cell 1, blank in cell 2, absent from cell 3 on. Header Score prints "Score ___/10".

---

### 4.7 Temperature, capacity, mass (TC)

**Skill ids**

| Category | Ids |
|---|---|
| `measurement` | `heavier_lighter_visual`, `temperature`, `capacity`, `mass_volume_liquid` |
| `comparing` (support) | `compare_objects` |
| `integers` (link) | `number_line_int` (thermometer below zero) |

**Ladder TC**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| TC-1 | I Can Tell Heavier From Lighter | ... circle the heavier object on a balance. | compare, no numbers | `heavier_lighter_visual` |
| TC-2 | I Can Tell Which Holds More | ... circle the container that holds more. | attribute changes to capacity | `compare_objects` |
| TC-3 | I Can Read a Scale That Counts in Ones | ... read a level that sits on a numbered mark. | numbered scale, every tick labelled | `mass_volume_liquid` |
| TC-4 | I Can Find What One Small Mark Is Worth | ... count the gaps between two numbers and check the box for 1, 2, 5 or 10. No reading today. | decide-only: interval size | `mass_volume_liquid` |
| TC-5 | I Can Read a Scale Between the Numbers | ... count on from the number below the level. | unlabelled ticks | `mass_volume_liquid`, `capacity` |
| TC-6 | I Can Read a Thermometer | ... read a standing scale in degrees. | instrument changes; same reading skill | `temperature` |
| TC-7 | I Can Read a Thermometer Below Zero | ... count down past 0. | negative region | `temperature`, `number_line_int` |
| TC-8 | I Can Choose a Sensible Unit (g or kg, mL or L) | ... circle the unit that fits the object. | decide-only | `mass_volume_liquid` |
| TC-9 | I Can Choose a Sensible Temperature | ... circle the temperature that fits the picture. | benchmarks: 0, 20, 37, 100 °C | `temperature` |
| TC-10 | I Can Change Liters to Milliliters and Kilograms to Grams | ... use the rule box: multiply by 1,000. | conversion, reuses ME-C1 cell | `capacity`, `unit_conversions` |
| TC-11 | I Can Find a Rise or a Fall in Temperature | ... count the hops between two readings. | difference on the scale | `temperature` |

Customary capacity (cups, pints, quarts, gallons) and °F are a parallel ladder that reuses TC-3 to TC-10 with their own rule boxes. Both °C and °F are offered; the dialog picks one per sheet, never both in one cell before the comparison step of the follow-on ladder.

**Representations**

| Representation | Drawn how |
|---|---|
| Balance | Line-art beam on a triangle pivot; tilt 12 degrees; pans hold plain objects or lettered blocks. Level beam only for "same" |
| Container pair | Two outline containers with a common base line; contents grey |
| Measuring jug / cylinder | XP-D-08. Outline 30 × 60 mm minimum; scale inside the left wall; liquid grey with a heavy flat top edge (no meniscus). A dotted hairline runs from the liquid top to the scale as a hint |
| Dial scale | Circle 44 mm minimum, ticks outside the rim, heavy needle from the centre; 0 at the top |
| Thermometer | Stem 8 mm wide, 70 mm tall minimum, bulb 12 mm; column grey; scale to the left; 0 marked with a longer tick and a bold 0. Below-zero numerals carry a minus sign |
| Benchmark strip | Rule-box strip under the title: "water freezes 0 °C · room 20 °C · body 37 °C · water boils 100 °C" |

**Response modes**

| Print | Screen |
|---|---|
| Circle one of two pictures / units / temperatures | Tap a ring |
| Check the box for the interval size | Tap |
| Number on a rule with the unit pre-printed (mL, g, °C) | Numeric input with suffix |
| Shade a jug to a given level (reverse item, from TC-5 Independent) | Drag the level; snaps to ticks |
| Draw the needle on a dial (print only) | Drag the needle |

**Page roles.** Best fit: visual grid 2 × 2 at L (scales need height; 2 × 3 at M); decision pages (TC-4, TC-8); opener + independent; error analysis (misread interval); Daily 4 (one jug cell); True or False? ("A bucket holds about 10 mL"). Schema word problems after TC-10 use "change" diagrams for rise / fall.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Unit pre-printed; interval check-box row ("One small mark = [ ]1 [ ]2 [ ]5 [ ]10") kept above the answer until a dedicated fade step; benchmark strip | 1 traced first answer → 2 dotted level line to the scale → 3 every tick labelled → every second → major only → 4 small hop arcs counting on from the lower number |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| TC-M1 | Treats every small mark as 1 | lower label + number of ticks |
| TC-M2 | Reads the nearest printed number | Nearest labelled value |
| TC-M3 | Taller container holds more | Tall thin container circled |
| TC-M4 | Bigger object is heavier | Large light object circled against a small heavy one |
| TC-M5 | Below zero counted upward (−3 read as −7 on a −10..0 segment) | Mirror value within the segment |
| TC-M6 | Wrong factor or direction | 3 L = 300 mL; 3 L = 0.003 mL |
| TC-M7 | Rise or fall across zero found by subtracting the digits | From −3 to 5 given as 2 |

**Exemplar: decision page, TC-4, "I Can Find What One Small Mark Is Worth", Level 3**

```
| Measurement / Level 3       I Can Find What One Small Mark Is Worth         |
+-----------------------------------------------------------------------------+
| What's new   This time you will find the size of one small mark.            |  12 mm
|              You will not read the level today.                             |
+--------------------------------------+--------------------------------------+
| Steps                                | Model                                |
| 1. Find two numbers next to          |    - 100      Numbers:  50 and 100   |  66 mm
|    each other.                       |    -          Gaps between them: 5   |
| 2. Count the gaps between them.      |    -          One small mark =       |
| 3. Check the box for one gap.        |    -          [ ]1 [ ]2 [ ]5 [x]10   |
| 4. Check: count on in that step.     |    -          (grey trace: 5, x)     |
|                                      |    - 50                              |
+--------------------------------------+--------------------------------------+
| Count the gaps. Check the box for one small mark.                           |  9 mm
+-------------------------+-------------------------+-------------------------+
| a. [scale 0-10, by 1]   | b. [scale 20-40, by 5]  | c. [scale 0-100, by 25] |  70 mm
|  Gaps: ____             |  Gaps: ____             |  Gaps: ____             |
|  [ ]1 [ ]2 [ ]5 [ ]10   |  [ ]1 [ ]2 [ ]5 [ ]10   |  [ ]5 [ ]10 [ ]20 [ ]25 |
+-------------------------+-------------------------+-------------------------+
| d. [dial 0-500 g, by 50]| e. [thermo 10-20, by 2] | f. [jug 0-1000, by 100] |  70 mm
+-------------------------+-------------------------+-------------------------+
```

Geometry: scale segments 50 mm tall, cropped to two labelled numbers so that nothing else can be read. Item a is the seeded edge case (the interval really is 1). No liquid level is drawn on this page, so the pupil cannot jump ahead to reading.

---

### 4.8 Graphs + data analysis (GD)

**Skill ids**

| Category | Ids |
|---|---|
| `measurement` (K) | `pictograph_intro`, `bar_graph_intro` |
| `comparing` | `classify_count` |
| `graphs` | `tally_chart`, `pictograph`, `build_pictograph`, `bar_graph`, `build_bar_graph`, `line_plot_g2`, `line_plot`, `line_plot_fractions`, `pie_chart`, `mixed_graphs` |
| `data_analysis` | `range`, `mode`, `median`, `mean`, `mad`, `box_plot_intro`, `histogram_read`, `statistical_question`, `mixed_data_analysis` |

**Ladder GD-G (graphs)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| GD-G1 | I Can Sort and Tally | ... make one tally mark for each object, in bundles of five. | scene → tally | `classify_count`, `tally_chart` |
| GD-G2 | I Can Read a Picture Graph (1 picture = 1) | ... answer "how many?" for one row. | graph given; literal question | `pictograph_intro`, `pictograph` |
| GD-G3 | I Can Compare Two Rows | ... answer "how many more?" with a subtraction frame. | question type changes | `pictograph`, `bar_graph_intro` |
| GD-G4 | I Can Read a Key (1 picture = 2, 5 or 10) | ... write what one picture is worth before you answer. | scaled key | `pictograph` |
| GD-G5 | I Can Read a Half Picture | ... count a half picture as half the key. | half icons | `pictograph` |
| GD-G6 | I Can Read a Bar Graph With a Scale | ... read a bar that stops between two grid lines. | bars + scale | `bar_graph` |
| GD-G7 | I Can Build a Bar Graph | ... shade cells on axes that are already labelled. | construct | `build_bar_graph`, `build_pictograph` |
| GD-G8 | I Can Read and Build a Line Plot | ... make one X for each value. | new graph type | `line_plot_g2`, `line_plot`, `line_plot_fractions` |
| GD-G9 | I Can Read a Circle Graph | ... match each lettered sector to its fraction. | part-of-whole graph | `pie_chart` |

**Ladder GD-S (statistics)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| GD-S1 | I Can Put Data in Order | ... copy the values into boxes from least to greatest. Nothing else today. | set-up-only | `median` |
| GD-S2 | I Can Find the Range | ... circle the least and the greatest, then subtract. | first measure | `range` |
| GD-S3 | I Can Find the Mode | ... tally each value and circle the one with the most marks. | measure changes | `mode` |
| GD-S4 | I Can Find the Median (odd number of values) | ... cross out pairs from the two ends until one value is left. | measure changes | `median` |
| GD-S5 | I Can Find the Median (even number of values) | ... find the number halfway between the two middle values. | edge case gets its own step | `median` |
| GD-S6 | I Can Find the Mean | ... Step 1 add all the values, Step 2 divide by how many. | step columns | `mean` |
| GD-S7 | I Can Choose the Measure | ... check the box for range, mode, median or mean for each question. No computing today. | decide-only | `mixed_data_analysis`, `statistical_question` |

Follow-on (Level 6): `histogram_read` (reuses GD-G6 cell with touching bars), `box_plot_intro` (five lettered points on a number line, reuses GD-S1 ordering boxes), `mad` (three step columns: mean → distances → mean of distances).

**Representations**

| Representation | Drawn how |
|---|---|
| Tally chart | XP-D-15 table: category word (plus a line-art icon at K-2), tally cell 50 mm wide, number cell. Bundles of five with a diagonal fifth stroke |
| Picture graph | Rows, one category per row; icons are one repeated plain glyph (circle or square at Level 3+, in-house line art at K-2) 8 mm, in a hairline cell grid so that halves are unambiguous. Key in a rule box: "Each ● = 2" |
| Bar graph | XP-D-14. Vertical by default. Axis titles in words. Scale step and maximum chosen so that no bar is taller than 8 steps at L. Category labels are words under each bar, never a legend. Two-series graphs use grey vs hollow white, both with a heavy outline (XP-D-14; hatch is only the Photocopy-safe form of the grey, where the second series stays hollow), with the key words printed beside the first pair of bars |
| Line plot | XP-D-07 number line; X marks 4 mm, stacked at 5 mm pitch; every tick labelled |
| Circle graph | 60 mm diameter minimum, heavy rim, hairline sector lines, a bold capital letter inside each sector, table of letter → category beside it. Sectors are equal-step fractions only (halves, quarters, eighths, thirds, sixths, tenths). No fills are needed; if a sector must be singled out it is grey |
| Data strip | Values in a row of hairline boxes 12 mm square; under it an empty row of the same boxes for the ordered copy |

**Response modes**

| Print | Screen |
|---|---|
| Draw tally marks in a cell | Tap the cell to add a mark |
| Number on a rule / in a box | Numeric input |
| Frame `__ − __ = __` with the operator pre-printed | Inline inputs |
| Shade cells of a bar; draw X marks | Tap cells; tap above a tick |
| Circle a category word | Tap a ring |
| Cross out values in the ordered strip | Tap to cross out |
| Check the box for a measure | Tap |

**Page roles.** Best fit: chart page (graph in the top half at full width, 4-6 question cells below, each a full sentence with one blank); step-column page (GD-S6); set-up-only page (GD-S1); decision page (GD-S7); construct page (GD-G7, GD-G8); Reason It ("Two pupils read the bar for Tuesday. Who is correct? Check one box"). Stretch: "Write five numbers with a median of 6 and a range of 4" with a results table. A graph never goes in a cell narrower than 86 mm; spiral panels and Daily 4 use a three-bar mini graph at the 86 mm minimum.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Pre-labelled axes; key box; question frames with the operator pre-printed; ordering boxes; step columns | 1 traced first answer → 2 dotted hairline from the bar top to the scale → 3 "Each picture = __" line above the questions → 4 cross-outs shown in trace in cell a of median pages → 5 every grid line labelled → every second |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| GD-M1 | Ignores the key: counts pictures | Icon count |
| GD-M2 | Half icon counted as a whole, or as 1 | Off by half the key |
| GD-M3 | Reads the nearest grid line for a between-lines bar | Nearest labelled value |
| GD-M4 | "How many more" answered with the larger value or with the sum | Larger value; sum |
| GD-M5 | Median taken from unordered data | Middle value of the list as given |
| GD-M6 | Even count: picks one of the two middle values | Lower middle value |
| GD-M7 | Mean: divides by the wrong count or stops at the total | Total; total ÷ (n − 1) |
| GD-M8 | Mode given as the frequency, not the value | Highest tally count |
| GD-M9 | Range given as the greatest value | Maximum |

**Exemplar: independent page, GD-S4, "I Can Find the Median (odd number of values)", Level 6**

```
| Data / Level 6          I Can Find the Median (odd number of values)        |
+-----------------------------------------------------------------------------+
| Put the values in order. Cross out pairs from the ends. Circle the median.  |  9 mm
+-----------------------------------------------------------------------------+
| a.  Data     [ 7][ 3][ 9][ 4][ 6]                                           |
|     In order [ 3][ 4][ 6][ 7][ 9]   <- grey trace; 3,9 and 4,7 crossed out  |  54 mm
|                                        in grey; 6 ringed in grey            |
|     The median is  __6__ .                                                  |
+-----------------------------------------------------------------------------+
| b.  Data     [12][ 5][ 8][ 5][10]        <- repeated value                  |
|     In order [  ][  ][  ][  ][  ]                                           |  54 mm
|     The median is  ______ .                                                 |
+-----------------------------------------------------------------------------+
| c.  Data     [ 2][ 9][ 4][ 7][ 1][ 8][ 3]                                   |
|     In order [  ][  ][  ][  ][  ][  ][  ]                                   |  54 mm
|     The median is  ______ .                                                 |
+-----------------------------------------------------------------------------+
| d.  Data     [20][20][20]                <- edge case: all equal            |
|     In order [  ][  ][  ]                                                   |  54 mm
|     The median is  ______ .                                                 |
+-----------------------------------------------------------------------------+
```

Geometry: boxes 12 mm square at L, hairline, touching; the two rows are 4 mm apart so that the copy is a straight drop. Row a is the traced hint row. On screen the pupil types into the ordering boxes, taps values to cross them out, then types the median; the ordering boxes are marked on Check, the cross-outs never are.

---

### 4.9 Probability (PR)

**Skill ids**

| Category | Ids |
|---|---|
| `probability` | `probability_basic`, `mixed_probability` |
| Links | `tally_chart`, `build_bar_graph` (experiments), `fraction_number_line` (0-1 line) |

The category has one generator skill. The ladder steps are constrained slices of `probability_basic` (`variants[]` in the cell contract); new ids are added only through the alias-safe process in `SKILL_CELL_CONTRACT.md`.

**Black-and-white rule (PR-R1).** No item, on paper or on screen, names a colour as the only way to tell outcomes apart. Outcomes are shape tokens (XP-D-13: star, circle, triangle, square; solid or hollow), lettered spinner sectors, numbered cards, or dice faces. Question text names the token by its shape word and, where needed, its state: "a solid star", "a hollow circle", "sector B". **PR-R2.** Spinner sectors are never filled to distinguish them; each sector carries a bold capital letter, and equal sectors are exactly equal. **PR-R3.** The existing generator's colour-word items ("red marble") are re-skinned to tokens under `.mq-mono`; the colour word is removed, not merely greyed.

**Ladder PR**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| PR-1 | I Can Say Certain, Likely, Unlikely or Impossible | ... circle one word for a pick from a bag of tokens. | words only | `probability_basic` |
| PR-2 | I Can Tell Which Is More Likely | ... circle the token you are more likely to pick. | compare two outcomes | `probability_basic` |
| PR-3 | I Can Count All the Outcomes | ... count every token in the bag. Nothing else today. | notate-only: the total | `probability_basic` |
| PR-4 | I Can Count the Outcomes I Want | ... count only the tokens named in the question. | notate-only: the favorable count | `probability_basic` |
| PR-5 | I Can Write a Probability as a Fraction | ... write "wanted" over "all" in the fraction frame. | combine PR-3 + PR-4 | `probability_basic` |
| PR-6 | I Can Find a Probability on a Spinner | ... count lettered sectors instead of tokens. | representation changes | `probability_basic` |
| PR-7 | I Can Place a Probability on a 0-to-1 Line | ... mark the fraction on a line from impossible to certain. | number line | `probability_basic`, `fraction_number_line` |
| PR-8 | I Can Compare Two Bags | ... write both fractions, then check the box under the bag with the better chance. | two sets | `probability_basic` |
| PR-9 | I Can Run an Experiment | ... spin or roll, tally each result, and graph it. | hands-on; tally + bar graph page | `tally_chart`, `build_bar_graph` |
| PR-10 | I Can Predict From a Probability | ... complete "out of 20 spins, about __". | scaling frame | `probability_basic` |
| PR-11 | I Can List All Outcomes of Two Spinners | ... fill a table with every pair. | outcome table | `mixed_probability` |

**Representations**

| Representation | Drawn how |
|---|---|
| Bag | Rounded-bottom outline 46 × 50 mm, heavy, open top with a hairline fold. Tokens 6 mm in a loose but non-overlapping arrangement, at most 12. No token is hidden or cropped |
| Spinner | Circle 50 mm minimum, heavy rim, hairline sector lines, bold capital letter centred in each sector, heavy arrow from a 2 mm hub pointing at the middle of a sector, never at a boundary. Sector counts: 2, 3, 4, 5, 6, 8, 10, 12 |
| Dice face | 12 mm rounded square, solid pips |
| Fraction frame | Two 14 mm square boxes stacked with a heavy bar. In PR-5 the boxes carry captions in label size to the right: "wanted" (top), "all" (bottom) |
| 0-1 line | XP-D-07, 120 mm minimum, ends labelled "0 impossible" and "1 certain", midpoint "1/2"; ticks at the denominator of the item |
| Outcome table | XP-D-15; row and column heads are the sector letters; the first cell is traced ("A, 1") |

**Response modes**

| Print | Screen |
|---|---|
| Circle one of four words | Tap a ring |
| Circle a token | Tap the token |
| Digit(s) in the fraction frame | Inputs, numerator first |
| Mark a line with a small stroke | Tap a tick (`number-line-place`) |
| Check the box under the better bag | Tap |
| Tally and shade (experiment) | Tap cells; the app can simulate the spinner |
| Frame "about __" | Numeric input |

**Page roles.** Best fit: visual grid 2 × 3; notate-only pages (PR-3, PR-4); number-line rows (PR-7, 4 per page); experiment page (one spinner, a tally table, a pre-labelled bar-graph frame; the spinner is also printed on the hands-on sheet with a dashed cut line, used with a pencil and paper clip); True or False? ("Picking a triangle is impossible" beside a bag with no triangles); Reason It (which spinner is fair?). Stretch: "Draw tokens in the bag so that picking a star is likely but not certain" with a results table of stars / all.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Fraction frame; word ring list in fixed order (impossible, unlikely, likely, certain); 0-1 line end labels; table heads | 1 traced first answer → 2 captions "wanted" / "all" → 3 the wanted tokens pre-circled with a dotted ring → 4 midpoint label on the 0-1 line |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| PR-M1 | Writes wanted : not wanted (part to part) | 3/5 for 3 of 8 |
| PR-M2 | Inverts the fraction | all / wanted |
| PR-M3 | Counts kinds, not tokens ("there are 3 shapes, so 1/3") | 1 / number of kinds |
| PR-M4 | "Likely" means "will happen"; "unlikely" means "impossible" | Certain for 5 of 6; impossible for 1 of 8 |
| PR-M5 | More tokens of a kind always means a better chance, ignoring the total | Bag with 4 of 12 preferred over 3 of 6 |
| PR-M6 | After several misses, a hit is "due" | "True" for a due-outcome statement |
| PR-M7 | Unequal sectors treated as equal | 1/3 for a half-sector on a 3-sector spinner (used only in Reason It; ordinary items have equal sectors) |

**Exemplar: independent page, PR-5, "I Can Write a Probability as a Fraction", Level 6**

```
| Data / Level 6             I Can Write a Probability as a Fraction          |
+-----------------------------------------------------------------------------+
| Count the tokens you want. Count all the tokens. Write the fraction.        |  9 mm
+--------------------------------------+--------------------------------------+
| a.    .----------.                   | b.    .----------.                   |
|      /  * o * ^   \     Pick a       |      /  o o ^ ^   \     Pick a       |  72 mm
|     |   o * o ^    |    solid star.  |     |   ^ o  [] ^  |    triangle.    |
|      \  * o        /                 |      \            /                  |
|       '----------'      [3] wanted   |       '----------'      [ ] wanted   |
|                         ---          |                         ---          |
|   (* solid star, o hollow circle,    |                         [ ] all      |
|    ^ solid triangle)    [9] all      |                                      |
|         grey trace ->                |                                      |
+--------------------------------------+--------------------------------------+
| c.  [bag: 5 hollow squares only]     | d.  [bag: 2 stars, 6 circles]        |  72 mm
|     Pick a hollow square.            |     Pick a triangle.                 |
|     [ ]/[ ]   <- edge: certain       |     [ ]/[ ]   <- edge: impossible, 0 |
+--------------------------------------+--------------------------------------+
| e.  [bag: 1 solid star, 9 squares]   | f.  [bag: 4 solid, 4 hollow circles] |  72 mm
|     Pick a solid star.               |     Pick a solid circle.             |
|     [ ]/[ ]                          |     [ ]/[ ]                          |
+--------------------------------------+--------------------------------------+
```

Geometry: bag 46 × 50 mm left, prompt and fraction frame right; captions "wanted" / "all" appear in cells a and b only. Item f tells tokens apart by solid vs hollow alone, which checks PR-R1 in greyscale. Fractions are accepted unsimplified on screen and in the key; the key prints both forms.

---

### 4.10 Decimals (DE)

**Skill ids**

| Category | Ids |
|---|---|
| `decimals` | `compare_decimal`, `compare_thousandths`, `order_decimals`, `decimal_nl_drag`, `round_decimals`, `round_thousandths`, `add_decimal`, `sub_decimal`, `mult_decimal`, `div_decimal`, `mixed_decimals` |
| `conversions` | `f_to_d`, `d_to_f` |
| `placevalue` (link) | `place_value_10x` |
| `number_sense` (link) | `round_sort_tenths`, `round_sort_hundredths` |

The reference workbooks cover decimal reading, comparing and the four operations in depth; `PEDAGOGY_STANDARD.md` holds that core. This section fixes the ladder order and adds the representations they lack (hundred grid, dual-label number line, stacking grid for ordering).

**Ladder DE**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| DE-1 | I Can Read Tenths on a Grid and a Line | ... shade tenths and read them as "__ tenths". | tenths, picture + words | `f_to_d` |
| DE-2 | I Can Write Tenths as a Decimal | ... write 0.__ for a shaded strip. | symbol enters (bridging step: picture and symbol in one row) | `f_to_d`, `d_to_f` |
| DE-3 | I Can Read and Write Hundredths | ... use a hundred grid: full columns are tenths, extra squares are hundredths. | second place | `f_to_d` |
| DE-4 | I Can Write a Decimal With a Zero Placeholder | ... write 0.05 and 0.50 and tell them apart. | zero cases get their own step | `d_to_f` |
| DE-5 | I Can Tell Look-Alike Decimals Apart | ... match 0.4, 0.04, 0.40 to their grids. | discrimination | `compare_decimal` |
| DE-6 | I Can Place a Decimal on a Number Line | ... mark a decimal on a line with fraction labels above and decimal labels below. | number line, dual labels | `decimal_nl_drag` |
| DE-7 | I Can Compare Decimals by Lining Up the Points | ... write both numbers in a place grid, fill empty places with 0, then compare from the left. | compare with a stacking grid | `compare_decimal`, `compare_thousandths` |
| DE-8 | I Can Order Three Decimals | ... stack three numbers in the same grid and number them 1, 2, 3. | three numbers | `order_decimals` |
| DE-9 | I Can Round a Decimal | ... draw a cut line after the target place and look at the next digit. | rounding; reuses RE cut-line cell | `round_decimals`, `round_thousandths` |
| DE-10 | I Can Line Up Decimals to Add or Subtract | ... rewrite a side-by-side problem in the grid. No computing today. | set-up-only | `add_decimal`, `sub_decimal` |
| DE-11 | I Can Add and Subtract Decimals | ... compute in the grid with the point already printed in the answer row. | full procedure | `add_decimal`, `sub_decimal` |
| DE-12 | I Can Multiply a Decimal by a Whole Number | ... multiply as whole numbers, then count the decimal places. | new operation; "count places" box | `mult_decimal` |

Follow-on: decimal × decimal, `div_decimal` (US long-division bracket; first a rewrite-only step that moves both points), `place_value_10x` (shift table), money link using generic value circles (25 → 0.25).

**Representations**

| Representation | Drawn how |
|---|---|
| Tenths strip | 100 × 12 mm bar, 10 equal parts, heavy outline, hairline dividers, shaded parts grey |
| Hundred grid | 50 mm square at L (5 mm cells), heavy outline, hairline cells (two weights only; no third weight to mark columns). Full shaded columns are drawn as one grey block without inner rules, so a tenth reads as one strip; extra squares are single grey cells |
| Dual-label number line | XP-D-07; fractions above the ticks, decimals below; from DE-6 Independent only the end labels remain |
| Place grid | Digit boxes 12 mm (L), one row per number; column heads O . t h (th) in bold letters, full words once in the Model and the Words band ("tenths — NOT tens" contrast line); the decimal point has its own narrow column (5 mm) with the point pre-printed in every row, including the answer row |
| Cut line | A vertical line the pupil draws after the target place; in Model it is pre-drawn as a grey dotted 1 pt line (a modelled mark, XP-D-02). The steps call it the cut line, but it is never printed dashed: dashed is reserved for scissor cuts |
| Count-places box | Small rounded box right of a multiplication: "decimal places: __" |

**Response modes**

| Print | Screen |
|---|---|
| Shade parts | Tap parts |
| Digits in a place grid | One-digit inputs, right to left for computation, left to right for copying |
| Symbol in a circle | Tap to cycle or type |
| Write 1 / 2 / 3 in rank boxes | Unified ordering widget (type, tap or drag) |
| Mark a line | `number-line-place` |
| Draw the cut line | Tap the gap between two digits |
| Match a line from numeral to grid | Tap-tap matching |

**Page roles.** Best fit: opener + independent (2 × 3); visual grid for DE-1 to DE-5; rewrite page (DE-10); computation grid in the Daily look (DE-11; the digit-aware clamp counts the point column as half a digit); match page (DE-5); error analysis; True or False? ("0.50 = 0.5"); Daily 4. Stretch: "Write three decimals between 0.4 and 0.5" with a number-line strip as the entry scaffold.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Place grid with pre-printed points; column head letters; comparison circle; regroup boxes (never marked) | 1 traced first cell → 2 grey zeros filling empty places → 3 grid or strip picture beside the numeral → 4 grey cut line → 5 full place words (kept in Model only) |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| DE-M1 | Longer decimal is larger (whole-number thinking) | 0.35 > 0.4 |
| DE-M2 | Shorter decimal is larger ("tenths are bigger than hundredths") | 0.3 > 0.45 |
| DE-M3 | Tenths confused with tens; hundredths with hundreds | 0.4 read as "4 tens" |
| DE-M4 | Placeholder zero dropped or added | 0.05 written 0.5; 0.50 ≠ 0.5 |
| DE-M5 | Right-aligns when adding | 2.5 + 1.25 = 1.50 |
| DE-M6 | Rounds by changing every digit after the cut, or rounds in a chain | 3.449 → 3.5 |
| DE-M7 | Places the point in a product by lining up | 0.3 × 0.2 = 0.6 |
| DE-M8 | Number line: counts ticks, not gaps | One tick off |

**Exemplar: independent page, DE-7, "I Can Compare Decimals by Lining Up the Points", Level 4**

```
| Decimals / Level 4       I Can Compare Decimals by Lining Up the Points     |
+-----------------------------------------------------------------------------+
| Write each number in the grid. Fill empty places with 0. Write <, > or =.   |  9 mm
+--------------------------------------+--------------------------------------+
| a.   0.4  ( )  0.35                  | b.   0.6  ( )  0.60                  |
|                                      |                                      |
|        O   .   t   h                 |        O   .   t   h                 |  76 mm
|      +---+---+---+---+               |      +---+---+---+---+               |
|      | 0 | . | 4 | 0 |  <- grey      |      |   | . |   |   |               |
|      +---+---+---+---+     trace,    |      +---+---+---+---+               |
|      | 0 | . | 3 | 5 |     ">" in    |      |   | . |   |   |               |
|      +---+---+---+---+     the ring  |      +---+---+---+---+               |
+--------------------------------------+--------------------------------------+
| c.   0.08 ( )  0.8                   | d.   1.2  ( )  0.95                  |  76 mm
|      [grid, points pre-printed]      |      [grid, points pre-printed]      |
+--------------------------------------+--------------------------------------+
| e.   0.52 ( )  0.25                  | f.   3  ( )  2.99    <- edge: whole  |  76 mm
|      [grid]                          |      [grid]             number       |
+--------------------------------------+--------------------------------------+
```

Geometry: comparison ring = Hw + 2 mm; grid boxes 12 mm; the point column 5 mm wide with a printed point in both rows. Item b is the seeded "equal" case; item f has a number with no point, so the pupil must place it. On screen the ring and the grid digits are marked on Check; the grey filler zero the pupil adds is accepted but not required.

---

### 4.11 Percents + ratios (PC)

**Skill ids**

| Category | Ids |
|---|---|
| `conversions` | `ratio_intro`, `equiv_ratios`, `ratio_tables`, `double_num_line`, `unit_rate_intro`, `percent_visual`, `p_to_d`, `d_to_p`, `f_to_p`, `p_to_f`, `percent_of_number`, `find_whole_from_pct`, `order_fdp`, `mixed_conversions` |

Ratios come first because percent is taught as "a ratio out of 100".

**Ladder PC-R (ratios)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| PC-R1 | I Can Describe a Picture With "For Every" | ... complete "for every __ stars there are __ circles". | picture → sentence frame | `ratio_intro` |
| PC-R2 | I Can Write a Ratio in the Right Order | ... write a : b in the order the words ask for. | notation; order matters | `ratio_intro` |
| PC-R3 | I Can Tell Part-to-Part From Part-to-Whole | ... check the box for the ratio the question asks for. No writing today. | decide-only | `ratio_intro` |
| PC-R4 | I Can Complete a Ratio Table (×2, ×3) | ... multiply both rows by the same number. | table; first column traced | `ratio_tables`, `equiv_ratios` |
| PC-R5 | I Can Find a Missing Value in a Ratio Table | ... find the multiplier first, then the missing number. | unknown position | `ratio_tables` |
| PC-R6 | I Can Use a Double Number Line | ... read matching values on two lines. | representation changes | `double_num_line` |
| PC-R7 | I Can Find a Unit Rate | ... find the amount for 1. | divide to 1 | `unit_rate_intro` |

**Ladder PC-P (percents)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| PC-P1 | I Can Read a Percent on a Hundred Grid | ... count shaded squares out of 100. | grid → percent | `percent_visual` |
| PC-P2 | I Can Write a Percent as a Decimal and Back | ... move between __% and 0.__ using the grid. | notation change | `p_to_d`, `d_to_p` |
| PC-P3 | I Can Write a Percent as a Fraction and Back | ... write __/100, then the simplest form. | notation change | `p_to_f`, `f_to_p` |
| PC-P4 | I Can Find 50%, 25% and 10% of a Number | ... use halving and ÷ 10 on a bar. | benchmark percents only | `percent_of_number` |
| PC-P5 | I Can Find Any Percent of a Number | ... Step 1 predict (more or less than half), Step 2 convert, Step 3 multiply, Step 4 check. | general method, step columns | `percent_of_number` |
| PC-P6 | I Can Find the Whole From a Percent | ... use a bar: if 25% is 8, find 100%. | unknown position | `find_whole_from_pct` |
| PC-P7 | I Can Order Fractions, Decimals and Percents | ... change all three to one form, then order. | mixed forms | `order_fdp` |

**Representations**

| Representation | Drawn how |
|---|---|
| Token picture | XP-D-13 tokens in two rows, one kind per row, left-aligned so that one-to-one pairing is visible |
| Ratio frame | `[ ] : [ ]` with 14 mm boxes; under each box a caption in label size taken from the question's nouns ("stars", "circles") |
| Ratio table | XP-D-15, two rows (one per quantity, row head = the noun), 4-5 columns; small "× 2" arcs above the columns as a hint |
| Double number line | Two XP-D-07 lines 14 mm apart, ticks aligned, each line titled at the left with its noun and unit |
| Percent bar | 120 × 12 mm bar; percent scale above (0%, 25%, 50%, 75%, 100%), quantity scale below with blanks; parts heavy-divided |
| Hundred grid | As in DE |

**Response modes**

| Print | Screen |
|---|---|
| Sentence frame with two number blanks | Inline inputs |
| Digits in the ratio frame | Inputs |
| Check the part-to-part / part-to-whole box | Tap |
| Table digits | Table inputs |
| Number on a rule with % pre-printed | Numeric input with suffix |
| Shade a hundred grid | Tap cells (column-fill on long press is not used; tapping a column head fills 10) |

**Page roles.** Best fit: function-table page (PC-R4, PC-R5; 3 tables per page at L); visual grid; decision page (PC-R3); step-column page (PC-P5; 2 per page); schema word problem (equal-groups diagram for unit rate; part-whole bar for percent); error analysis. True or False?: "2 : 3 is the same as 3 : 2". Stretch: "Shade the grid to show a percent between 1/4 and 0.4" with a results table of percent / decimal / fraction.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Ratio frame with noun captions; table row heads; % sign pre-printed; step-column captions (Predict / Convert / Multiply / Check) | 1 traced first column or cell → 2 "× n" arcs over the table → 3 token picture beside the table → 4 percent bar under PC-P5 items |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| PC-M1 | Reverses the order of a ratio | b : a |
| PC-M2 | Part-to-part given for part-to-whole | 3 : 5 for "stars to all" in 3 stars, 5 circles |
| PC-M3 | Adds the same number instead of multiplying | 2 : 3 → 4 : 5 |
| PC-M4 | Percent → decimal by dropping the sign | 5% = 0.5; 5% = 5.0 |
| PC-M5 | Percent of a number by subtracting or dividing by the percent | 20% of 50 = 30; 50 ÷ 20 |
| PC-M6 | Unit rate divided the wrong way round | 12 pages in 4 minutes → 4 ÷ 12 instead of 12 ÷ 4 |
| PC-M7 | Finds the part when asked for the whole | 25% of 8 = 2 instead of 32 |

**Exemplar: function-table page, PC-R4, "I Can Complete a Ratio Table (×2, ×3)", Level 6**

```
| Ratios / Level 6             I Can Complete a Ratio Table (x2, x3)          |
+-----------------------------------------------------------------------------+
| Multiply both rows by the same number. Fill the table.                      |  9 mm
+-----------------------------------------------------------------------------+
| a.  For every 2 cups of rice there are 5 cups of water.                     |
|                     x2        x3        x4      <- grey arcs, row a only    |  70 mm
|              +------+------+------+------+                                  |
|      rice    |  2   |  4   |      |      |      4 and 10 = grey trace       |
|              +------+------+------+------+                                  |
|      water   |  5   | 10   |      |      |                                  |
|              +------+------+------+------+                                  |
+-----------------------------------------------------------------------------+
| b.  For every 3 pens there is 1 eraser.          <- edge case: a 1          |  70 mm
|      pens    |  3   |      |      |      |                                  |
|      erasers |  1   |      |      |      |                                  |
+-----------------------------------------------------------------------------+
| c.  For every 4 steps forward there are 6 claps.                            |  70 mm
|      steps   |  4   |      |      |      |                                  |
|      claps   |  6   |      |      |      |                                  |
+-----------------------------------------------------------------------------+
```

Geometry: table cells 24 × 14 mm; row heads are the story's own nouns, 28 mm wide; the story is one sentence on one line in cell text. The "× n" arcs are a hint (row a only on this page; absent on the next page).

---

### 4.12 Integers (IN)

**Skill ids**

| Category | Ids |
|---|---|
| `integers` | `number_line_int`, `integer_nl_drag`, `opposite_numbers`, `abs_value`, `compare_int`, `order_negatives`, `ordering_rationals`, `add_int`, `sub_int`, `mixed_integers` |
| Links | `temperature` (context), `coordinate_all` (after this ladder) |

Contexts: a freezer thermometer, floors above and below a building's ground floor, height above and below sea level. No debt or money contexts.

**Ladder IN**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| IN-1 | I Can Read a Number Below Zero | ... read a point on a standing line, then on a flat line. | negatives on a line | `number_line_int` |
| IN-2 | I Can Plot an Integer | ... mark a given number on the line. | direction reversed | `integer_nl_drag` |
| IN-3 | I Can Find the Opposite of a Number | ... hop the same distance on the other side of 0. | opposites | `opposite_numbers` |
| IN-4 | I Can Find the Distance From Zero | ... write how many hops a number is from 0. | absolute value as distance | `abs_value` |
| IN-5 | I Can Compare Two Integers | ... plot both, then write < or >: left is less. | compare, with look-alike pairs (−8 and −3; −5 and 5) | `compare_int` |
| IN-6 | I Can Order Integers | ... put four integers in order using the line. | four numbers | `order_negatives`, `ordering_rationals` |
| IN-7 | I Can Choose the Hop Direction | ... check the → box for adding a positive, the ← box for adding a negative. No answer today. | decide-only | `add_int` |
| IN-8 | I Can Add Integers on a Number Line | ... start at the first number and hop. | full addition, one strategy (line) | `add_int` |
| IN-9 | I Can Tell if the Signs Are the Same or Different | ... check the box beside the rule sentence that fits. | decide-only, toward the rule | `add_int` |
| IN-10 | I Can Rewrite Subtraction as Adding the Opposite | ... rewrite only: __ + __. No solving today. | rewrite-only | `sub_int` |
| IN-11 | I Can Subtract Integers | ... rewrite, then add on the line. | combine IN-10 + IN-8 | `sub_int` |
| IN-12 | I Can Solve Integer Stories | ... use the change diagram with a standing number line. | word problem | `mixed_integers` |

Optional second-strategy ladder (XP-G-04): two-state counters (solid = positive, hollow = negative), crossing out zero pairs. Follow-on: sign of a product (decide-only), multiply and divide, four-quadrant coordinates.

**Representations**

| Representation | Drawn how |
|---|---|
| Integer line | XP-D-07, −10 to 10, 8 mm pitch at L (needs a full-width cell: 160 mm); 0 has a taller tick and bold numeral; negative numerals carry a short minus sign set close to the digit so that it cannot be read as a dash between numbers |
| Standing line | XP-D-08, beside a context sketch (thermometer, building section with floor labels, sea-level section) |
| Hop arrows | Hairline arcs above the line, one per unit for |n| ≤ 5, one long arc labelled with the number otherwise; arrowhead shows direction |
| Signed numbers in text | Negative numbers in an expression are written in parentheses when they follow an operator: 4 + (−7) |
| Rewrite frame | The expression on the top line; under it `__ + __` with a small bold caption under the second blank: "opposite" |
| Counters (optional ladder) | XP-D-13 circles, solid and hollow, in two rows; zero pairs crossed with one stroke |

**Response modes**

| Print | Screen |
|---|---|
| Number on a rule | Numeric input; a "−" key is always visible on touch keyboards |
| Mark a point and label it | `number-line-place` |
| Symbol in a circle | Tap to cycle |
| Check the box beside an arrow / a rule sentence | Tap |
| Rewrite blanks | Inline inputs |
| Draw hops (print); hops are work, never marked | Tap the landing tick; the app draws the arc |

**Page roles.** Best fit: number-line rows, 4 per page at L; decision pages (IN-7, IN-9); rewrite page in the Daily look (IN-10, 2 × 5); 2 × 3 grid; equation drill for fluent practice after IN-11; error analysis; True or False? ("−8 is greater than −3"); Reason It (always / sometimes / never: "The sum of two negative numbers is negative"); schema word problem with a change diagram.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Number line under every item until a dedicated fade step after IN-11; parentheses around negatives; rewrite frame; comparison circle | 1 traced first item → 2 hop arcs pre-drawn → 3 start point pre-marked → 4 caption "left is less" → 5 caption "opposite" under the rewrite blank |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| IN-M1 | Larger digit means larger number | −8 > −3 |
| IN-M2 | Ignores signs when adding | −3 + 5 = 8; −3 + (−5) = 8 |
| IN-M3 | Takes the sign of the first number | −3 + 5 = −2 |
| IN-M4 | Subtraction: changes the operation but not the second sign (or the reverse) | 4 − (−3) = 1 |
| IN-M5 | "Two negatives make a positive" applied to addition | −4 + (−2) = 6 |
| IN-M6 | Opposite confused with absolute value | Opposite of 6 given as 6 |
| IN-M7 | Counts the start tick as hop 1 | Off by one toward the start |

**Exemplar: Daily-look rewrite page, IN-10, "I Can Rewrite Subtraction as Adding the Opposite", Level 6**

```
| Integers / Level 6     I Can Rewrite Subtraction as Adding the Opposite     |
+-----------------------------------------------------------------------------+
| Rewrite as adding the opposite. Do not solve.                               |  9 mm
+--------------------------------------+--------------------------------------+
|[1]      5 - 8                        |[2]      3 - (-4)                     |
|       __5__ + _(-8)_   <- grey trace |       _____ + ______                 |  44 mm
|                opposite              |                opposite              |
+--------------------------------------+--------------------------------------+
|[3]     -2 - 6                        |[4]     -7 - (-1)                     |  44 mm
|       _____ + ______                 |       _____ + ______                 |
+--------------------------------------+--------------------------------------+
|[5]      0 - 9        <- edge: 0      |[6]      6 - 6        <- edge: same   |  44 mm
|       _____ + ______                 |       _____ + ______                 |
+--------------------------------------+--------------------------------------+
|[7]     -4 - (-4)                     |[8]     10 - (-3)                     |  44 mm
|       _____ + ______                 |       _____ + ______                 |
+--------------------------------------+--------------------------------------+
|[9]     -1 - 12                       |[10]     8 - (-8)                     |  44 mm
|       _____ + ______                 |       _____ + ______                 |
+--------------------------------------+--------------------------------------+
```

Geometry: black number tabs; each blank 26 mm; the "+" is pre-printed so the only decisions are the two numbers. The caption "opposite" appears in cells 1 and 2 only. No equals sign appears anywhere, so nothing invites solving. Score prints "Score ___/10".

---

### 4.13 Order of operations (OO)

**Skill ids**

| Category | Ids |
|---|---|
| `order_of_operations` | `two_ops_no_paren`, `oop_easy`, `three_ops_no_paren`, `multi_ops_no_paren`, `paren_simple`, `oop_medium`, `paren_multi`, `nested_complex`, `exponents_simple`, `oop_hard`, `compare_expressions`, `mixed_order_ops` |

`oop_easy` / `oop_medium` / `oop_hard` overlap the seven "Level n" skills; they are candidates for alias merging under the process in `SKILL_CELL_CONTRACT.md`. The ladder points at the finer-grained ids.

**Ladder OO**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| OO-1 | I Can Underline What to Do First (+ and − only) | ... underline the left-most operation. No computing today. | decide-only; left to right | `two_ops_no_paren` |
| OO-2 | I Can Underline What to Do First (× before +) | ... underline the × or ÷ part, even when it is not first. No computing today. | decide-only; precedence | `two_ops_no_paren` |
| OO-3 | I Can Work an Expression in Two Lines | ... underline, compute that part, and rewrite the line below. | compute, funnel template | `two_ops_no_paren`, `oop_easy` |
| OO-4 | I Can Underline What to Do First (parentheses) | ... underline the part inside the parentheses. No computing today. | decide-only; grouping | `paren_simple` |
| OO-5 | I Can Work an Expression With Parentheses | ... use the funnel with parentheses. | compute | `paren_simple`, `oop_medium` |
| OO-6 | I Can See How Parentheses Change the Answer | ... work the same numbers with and without parentheses. | contrast pairs | `paren_simple`, `compare_expressions` |
| OO-7 | I Can Work an Expression With Three Operations | ... add one more line to the funnel. | length | `three_ops_no_paren`, `paren_multi` |
| OO-8 | I Can Work an Expression With an Exponent | ... work the exponent before × and ÷. | new operation | `exponents_simple` |
| OO-9 | I Can Check and Fix Worked Expressions | ... check the "correct" or "fix" box, and rework the wrong ones. | error analysis as a step | `mixed_order_ops` |
| OO-10 | I Can Place Parentheses to Make a Statement True | ... try a position, work it, and check the box when it matches. | open task | `compare_expressions` |

Follow-on: `multi_ops_no_paren`, `nested_complex`, `oop_hard` (brackets inside parentheses), reusing the funnel with more lines.

**Representations**

| Representation | Drawn how |
|---|---|
| Expression | One line at working digit size (16 / 22 / 28 pt), operators with 1 em slots so that an underline can sit under exactly one operation and its two numbers |
| Underline (pupil mark) | In the Model: grey 1 pt underline under the first part, with a small grey "1" beneath it |
| Funnel | XP-D-18. Each new line has a rule for the computed value placed under the underlined part, and the untouched parts pre-printed in black in Guided, blank rules in Independent (the pupil copies them) |
| Steps card | Opener "Words" band is replaced by a four-row order card: 1 ( ) · 2 exponents · 3 × ÷ left to right · 4 + − left to right. No mnemonic word is printed |
| Contrast pair | Two half-cells sharing a border, same numbers, the right one with parentheses |

**Response modes**

| Print | Screen |
|---|---|
| Underline one operation | Tap an operator; the app underlines its operands |
| Numbers on stepped rules | Inputs, top to bottom; intermediate lines are marked (they are not work boxes) |
| Check the correct / fix box | Tap |
| Draw parentheses | Tap two gaps |

**Page roles.** Best fit: decide-only page 3 × 3 (OO-1, OO-2, OO-4: nine one-mark items); 2 × 2 funnel grid (long procedure cap = 4); two-column contrast page (OO-6); check-and-fix error-analysis page (OO-9); True or False? ("3 + 4 × 2 = 14"); Stretch (OO-10 with a results table: position tried / value). Daily 4 takes one two-line funnel.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Funnel rules; order card on the opener and as a strip on the first independent page | 1 traced first cell → 2 pre-printed untouched parts on each funnel line → 3 small step numbers under the operators → 4 order-card strip |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| OO-M1 | Works strictly left to right | 3 + 4 × 2 = 14 |
| OO-M2 | Always multiplies before dividing, or adds before subtracting | 12 ÷ 2 × 3 = 2; 10 − 3 + 2 = 5 |
| OO-M3 | Ignores parentheses | (3 + 4) × 2 = 11 |
| OO-M4 | Exponent read as multiplication | 2³ = 6 |
| OO-M5 | Drops the untouched part when rewriting | Second line loses a term |
| OO-M6 | Works the parentheses, then restarts left to right ignoring precedence | 2 + (3 + 1) × 5 = 30 |

**Exemplar: decide-only page, OO-2, "I Can Underline What to Do First (× before +)", Level 5**

```
| Algebra / Level 5       I Can Underline What to Do First (x before +)       |
+-----------------------------------------------------------------------------+
| What's new   This time you will underline the x or ÷ part, even when it is  |  12 mm
|              not first. You will not compute today.                         |
+--------------------------------------+--------------------------------------+
| Steps                                | Model                                |
| 1. Look for x or ÷.                  |      3 + 4 x 2          6 x 2 - 5    |  48 mm
| 2. Underline it with its two numbers.|          =====          =====        |
| 3. No x or ÷? Underline the          |      (grey underline,   (blank: the  |
|    left-most part.                   |       traced)            pupil's)    |
+--------------------------------------+--------------------------------------+
| Underline the part you work first.                                          |  9 mm
+-------------------------+-------------------------+-------------------------+
| a.  5 + 3 x 4           | b.  8 x 2 + 7           | c.  20 - 12 ÷ 4         |  42 mm
+-------------------------+-------------------------+-------------------------+
| d.  9 - 4 + 2           | e.  6 + 10 ÷ 5          | f.  7 x 3 - 6           |  42 mm
|  ^ edge: no x or ÷      |                         |                         |
+-------------------------+-------------------------+-------------------------+
| g.  15 ÷ 3 + 9          | h.  2 + 8 x 1           | i.  12 ÷ 4 x 3          |  42 mm
|                         |                         |  ^ edge: both, so left  |
+-------------------------+-------------------------+-------------------------+
```

Geometry: 3 × 3 one-mark cells; expressions set at working digit size with 1 em operator slots; the top 40% of each cell holds the expression, the rest stays empty (it becomes the funnel space in OO-3, so the cell anatomy does not change between steps).

---

### 4.14 Expressions + equations (EE)

**Skill ids**

| Category | Ids |
|---|---|
| `algebra` | `balance_addsub`, `build_expr_addsub`, `build_expr_multdiv`, `solve_unknown`, `solve_eq_addsub`, `solve_eq_multdiv`, `solve_eq_twostep`, `evaluate_expression`, `evaluate_expression_hard`, `write_expression`, `write_equation`, `combine_like_terms`, `distributive_expr`, `inequalities`, `mixed_algebra` |
| `algebra` (word-problem skills) | `tape_diagram`, `tape_diagram_plain`, `multi_step_word`, `multi_step_word_plain`, `algebra_word_mixed`, `algebra_word_mixed_plain` — these use the word-problem page roles of `PAGE_TYPES.md`; the `_plain` twins are the same skill with the picture option off |
| `order_of_operations` (link) | `compare_expressions` |

**Ladder EE**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| EE-1 | I Can Make Both Sides Equal | ... find the number that balances 7 + 5 = __ + 3. | equals means "same value" | `balance_addsub` |
| EE-2 | I Can Label the Parts and the Whole | ... write p or w under each number of an equation. No solving today. | notate-only | `solve_unknown` |
| EE-3 | I Can Choose the Rule for a Missing Number | ... check the "whole missing: add" or "part missing: subtract" box. | decide-only | `solve_unknown` |
| EE-4 | I Can Solve With a Box for the Unknown | ... label, check the rule box, rewrite, solve, check your answer. | full scaffold stack | `solve_unknown` |
| EE-5 | I Can Solve With a Letter for the Unknown | ... do the same; a letter now stands where the box was. | the letter is the ONLY change | `solve_eq_addsub` |
| EE-6 | I Can Solve × and ÷ Equations | ... use the fact-family triangle to find the missing factor. | operation family | `solve_eq_multdiv` |
| EE-7 | I Can Substitute a Number for a Letter | ... write the number above the letter. No computing today. | set-up-only | `evaluate_expression` |
| EE-8 | I Can Evaluate an Expression | ... substitute, then compute with the funnel. | combine EE-7 + OO funnel | `evaluate_expression`, `evaluate_expression_hard` |
| EE-9 | I Can Solve a Two-Step Equation | ... Step 1 undo the + or −, Step 2 undo the × or ÷. | step columns | `solve_eq_twostep` |
| EE-10 | I Can Combine Like Terms | ... circle the letter terms, box the plain numbers, then add each group. | multi-mark | `combine_like_terms` |
| EE-11 | I Can Write an Expression From Words | ... fill a labelled frame [ ] ○ [ ] from a short phrase. | words → symbols | `write_expression`, `write_equation`, `build_expr_addsub`, `build_expr_multdiv` |
| EE-12 | I Can Show an Inequality on a Number Line | ... choose an open or closed circle, then draw the arrow. | new relation | `inequalities` |

Follow-on: `distributive_expr` (area-model cell from AP), rule of a function table (ladder PF).

**Representations**

| Representation | Drawn how |
|---|---|
| Balance | Level beam on a triangle pivot, two pans, each holding an expression in a rounded box. Level only; a tilted beam is used for inequalities in Reason It |
| Unknown | A 12 mm square box (EE-1 to EE-4); a lower-case italic letter from EE-5 (n first; x from EE-9, where × is written as a raised dot or by juxtaposition: 3n) |
| p / w labels | 6 mm square hairline boxes under each term, for the letters p or w |
| Rule check-box rows | XP-D-20, two first-person sentences |
| Rewrite frame | `__ ○ __ = __`: two rules, an operator circle, an answer rule |
| Check line | The original equation reprinted with a rule in place of the unknown, followed by a check box "True" |
| Fact triangle | Equilateral outline 40 mm, product at the top corner, factors at the base corners, the unknown corner holding an empty square box |
| Inequality line | XP-D-07 with a 3 mm circle (hollow = not included, solid = included) and a heavy arrow along the line |

**Response modes**

| Print | Screen |
|---|---|
| Letter p / w in a small box | Tap to toggle p / w |
| Check a rule box | Tap |
| Rewrite frame: numbers + operator in a circle | Inputs; operator by tap-to-cycle |
| Number on a rule after "n = " | Numeric input |
| Check the "True" box on the check line | Tap (the check value is marked, the check mark is not) |
| Circle / box terms | Tap once to ring, twice to box |
| Drag tiles to build an expression | Existing drag-tile interaction; print twin is the labelled frame |

**Page roles.** Best fit: 2 × 2 large scaffolded cells (EE-4, EE-5, EE-6); faded 2 × 3 bare cells with work space after the scaffold fade; set-up-only page (EE-7); notate-only page (EE-2); step-column page (EE-9); equation drill in the Daily look for fluent one-step equations; error analysis; True or False? ("8 = 3 + 5", "4 + 2 = 6 + 1"); Reason It (spot the mistake in a two-step solution).

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Rewrite frame; check line; step columns; operator circle | 1 traced first cell → 2 p / w boxes pre-filled → 3 rule check-box rows (kept through EE-6, dropped at EE-9) → 4 fact triangle beside × ÷ equations → 5 work space replaces the frame (fade endpoint: bare equation + "n = ____") |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| EE-M1 | "=" means "the answer comes next" | 7 + 5 = [12] + 3 |
| EE-M2 | Always adds the two visible numbers | n − 4 = 9 → n = 5; 12 = n + 7 → 19 |
| EE-M3 | Letter stands for its alphabet position or for an object | n = 14 |
| EE-M4 | 3n read as "thirty-something" | n = 4 → 3n = 34 |
| EE-M5 | Two-step: undoes × before + | (2n + 6 = 14) → n = 1 |
| EE-M6 | Combines unlike terms | 3n + 4 = 7n |
| EE-M7 | Inequality circle or arrow reversed | Closed for <; arrow toward smaller for > |
| EE-M8 | "5 less than n" written in reading order | 5 − n |

**Exemplar: scaffolded 2-up page, EE-5, "I Can Solve n + 7 = 12", Level 5**

```
| Algebra / Level 5         I Can Solve With a Letter for the Unknown         |
+-----------------------------------------------------------------------------+
| What's new   This time a letter stands where the box was. The steps are     |  12 mm
|              the same.                                                      |
+--------------------------------------+--------------------------------------+
| Model (unlabelled)                   | Guided (unlabelled)                  |
|      n  +  7  =  12                  |      n  +  9  =  15                  |
|     [p]   [p]   [w]   <- grey trace  |     [ ]   [ ]   [ ]                  | 104 mm
|                                      |                                      |
|  [ ] The whole is missing. I add.    |  [ ] The whole is missing. I add.    |
|  [x] A part is missing. I subtract.  |  [ ] A part is missing. I subtract.  |
|                                      |                                      |
|   _12_ (-) _7_ = _5_                 |   ____ ( ) ____ = ____               |
|                                      |                                      |
|   n = _5_                            |   n = ____                           |
|   Check:  _5_ + 7 = 12   [x] True    |   Check:  ____ + 9 = 15   [ ] True   |
+--------------------------------------+--------------------------------------+
| a.   8  +  n  =  14                  | b.   n  -  6  =  10                  |
|     [ ]   [ ]   [ ]                  |     [ ]   [ ]   [ ]                  | 104 mm
|  [ ] The whole is missing. I add.    |  [ ] The whole is missing. I add.    |
|  [ ] A part is missing. I subtract.  |  [ ] A part is missing. I subtract.  |
|   ____ ( ) ____ = ____               |   ____ ( ) ____ = ____               |
|   n = ____                           |   n = ____                           |
|   Check:  8 + ____ = 14   [ ] True   |   Check:  ____ - 6 = 10   [ ] True   |
+--------------------------------------+--------------------------------------+
```

Geometry: four cells of 93 × 104 mm (long-procedure cap = 4). Item a moves the unknown to the second position; item b has the whole missing (the first tick applies), so the two independent items need different rules. This cell is identical to the EE-4 cell except that the box has become n (XP-G-02).

---

### 4.15 Patterns + function tables (PF)

**Skill ids**

| Category | Ids |
|---|---|
| `patterns` | `shape_pattern`, `seq_2`, `seq_5`, `seq_10`, `count_by_fill`, `skip_count_line`, `skip_count_grid`, `count_by_step_up`, `count_by_step_down`, `count_by_powers_of_10`, `double`, `halve`, `number_pattern`, `pattern_relationship`, `mixed_patterns` |
| `algebra` | `function_table_easy`, `function_table_hard` |

`seq_2`, `seq_5`, `seq_10`, `double`, `halve` and `count_by_fill` are fact-like: they also get the high-column fact layouts (5-10 columns) defined in `PAGE_TYPES.md`.

**Ladder PF**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| PF-1 | I Can Find the Part That Repeats | ... draw a ring around the repeating part of a shape pattern. No extending today. | decide-only: the unit | `shape_pattern` |
| PF-2 | I Can Extend a Shape Pattern | ... draw the next two shapes. | extend | `shape_pattern` |
| PF-3 | I Can Skip Count on a Number Line | ... write the numbers the hops land on. | numbers, line representation | `skip_count_line`, `seq_2`, `seq_5`, `seq_10` |
| PF-4 | I Can Skip Count on a Grid | ... shade every landing number on a number grid. | representation changes | `skip_count_grid`, `count_by_fill` |
| PF-5 | I Can Find the Rule of a Number Pattern | ... write the jump above each gap and complete "The rule is + __". No extending today. | notate-only: the rule | `number_pattern`, `count_by_step_up` |
| PF-6 | I Can Extend a Number Pattern | ... find the rule, then write the next three numbers. | combine | `number_pattern`, `count_by_step_up` |
| PF-7 | I Can Work With Patterns That Go Down | ... find a "− __" rule. | direction | `count_by_step_down`, `halve` |
| PF-8 | I Can Count by 10s, 100s and 1,000s From Any Number | ... watch one place change. | step size is a power of 10 | `count_by_powers_of_10` |
| PF-9 | I Can Use a Rule to Fill a Table | ... apply a given rule to each "in" number. | table, rule given | `function_table_easy` |
| PF-10 | I Can Find the Rule of a Table | ... test "+ __" then "× __" on every row. | rule unknown | `function_table_easy`, `function_table_hard` |
| PF-11 | I Can Find an "In" Number From an "Out" Number | ... work the rule backward. | unknown position | `function_table_hard` |
| PF-12 | I Can Compare Two Patterns | ... fill two rows of a table and complete "B is always __ times A". | two linked patterns | `pattern_relationship` |

**Representations**

| Representation | Drawn how |
|---|---|
| Shape pattern strip | XP-D-13 tokens (shape and solid / hollow are the only attributes — never colour, never size alone), 10 mm pitch, in a row of hairline cells; empty cells at the end for the pupil. Rotation patterns use an arrow token in four orientations |
| Number pattern strip | Numbers in 16 mm hairline boxes; above each gap a small hairline arc with a 10 mm rule for the jump |
| Number grid | 10-column grid, 12 mm cells at L, a window of 3-5 rows (not always starting at 1); shaded cells grey |
| Function table | XP-D-15. Vertical by default, heads "In" / "Out"; rule box above: "Rule: × 3". When the rule is unknown the rule box contains `Rule: ( ) ____` (operator circle + number rule) |
| Two-pattern table | Rows "Pattern A (+ 2)", "Pattern B (+ 6)", 5 columns; sentence frame under it |

**Response modes**

| Print | Screen |
|---|---|
| Ring the repeating unit | Tap first and last token of the unit |
| Draw the next shapes | Tap a palette token to fill the next cell (production, not multiple choice: the palette holds every token) |
| Number in a box | Numeric input |
| Shade grid cells | Tap cells |
| Operator in a circle + number | Tap to cycle + input |
| Sentence frame with one blank | Inline input |

**Page roles.** Best fit: full-width rows (pattern strips, 5 per page at L); function-table page (3 tables per page at L, or 6 at 2 × 3 with four-row tables); notate-only page (PF-5); fact rows at 5-10 columns for the fact-like ids; Daily 4; Reason It (odd one out: four sequences, one with a different rule); True or False? ("The next number is 40"). Stretch: "Write three different patterns that contain 12 and 20" with a results table (pattern / rule).

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Jump arcs with rules; rule box; table heads; sentence frame | 1 traced first row → 2 first jump pre-filled → 3 ring around the first repeating unit → 4 hop arrows on the number line → 5 operator pre-printed in the rule box |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| PF-M1 | Uses only the first gap when the pattern is not constant, or mis-subtracts one gap | Rule from the first pair applied throughout |
| PF-M2 | Repeats the last term's digit pattern | 5, 10, 15 → 16 |
| PF-M3 | Table rule found from one row only (+ vs ×) | In 2 → Out 4 read as "+ 2" when the rule is "× 2" |
| PF-M4 | Reads down the "In" column instead of across | "Rule: + 1" |
| PF-M5 | Working backward uses the same operation | Out 12, rule × 3 → In 36 |
| PF-M6 | Shape pattern: continues with the first shape rather than from the position in the unit | Restarts the unit at the wrong place |
| PF-M7 | Crossing a hundred when counting by 10s | 290, 300, 400 |

**Exemplar: notate-only page, PF-5, "I Can Find the Rule of a Number Pattern", Level 4**

```
| Algebra / Level 4          I Can Find the Rule of a Number Pattern          |
+-----------------------------------------------------------------------------+
| Write the jump above each gap. Write the rule.                              |  9 mm
+-----------------------------------------------------------------------------+
| a.      +4      +4      __      __         <- first two jumps grey trace    |
|     [ 3 ]   [ 7 ]   [ 11 ]  [ 15 ]  [ 19 ]                                  |  44 mm
|     The rule is  ( + )  __4__ .                                             |
+-----------------------------------------------------------------------------+
| b.      __      __      __      __                                          |  44 mm
|     [ 10 ]  [ 16 ]  [ 22 ]  [ 28 ]  [ 34 ]                                  |
|     The rule is  ( + )  _____ .                                             |
+-----------------------------------------------------------------------------+
| c.  [ 25 ]  [ 50 ]  [ 75 ]  [ 100 ] [ 125 ]                                 |  44 mm
|     The rule is  ( + )  _____ .                                             |
+-----------------------------------------------------------------------------+
| d.  [ 8 ]   [ 9 ]   [ 10 ]  [ 11 ]  [ 12 ]      <- edge case: + 1           |  44 mm
|     The rule is  ( + )  _____ .                                             |
+-----------------------------------------------------------------------------+
| e.  [ 96 ]  [ 106 ] [ 116 ] [ 126 ] [ 136 ]     <- crosses a hundred        |  44 mm
|     The rule is  ( + )  _____ .                                             |
+-----------------------------------------------------------------------------+
```

Geometry: five full-width rows; number boxes 16 mm wide on a 30 mm pitch; jump rules 10 mm, centred over each gap. The operator circle is pre-printed "+" on this step (it becomes blank in PF-7). No empty boxes follow the last number, so the pupil cannot extend the pattern before naming its rule.

---

### 4.16 Number theory (NT)

**Skill ids**

| Category | Ids |
|---|---|
| `composing` | `odd_even`, `select_even_odd` |
| `number_theory` | `multiples`, `factors_identify`, `factor_tchart_easy`, `factor_tchart_medium`, `factor_tchart_hard`, `factor_links_easy`, `factor_links_medium`, `factor_links_hard`, `divisibility_sort`, `prime_composite`, `gcf_easy`, `gcf_hard`, `lcm`, `mixed_number_theory` |

The three-level twins (`factor_tchart_*`, `factor_links_*`, `gcf_*`) differ only in number size: the ladder treats each family as one skill with a range constraint.

**Ladder NT**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| NT-1 | I Can Tell Odd From Even by Making Pairs | ... ring counters in twos and check the "one left over" or "none left over" box. | pairing picture | `odd_even` |
| NT-2 | I Can Tell Odd From Even by the Ones Digit | ... underline the ones digit, then circle odd or even. | picture removed | `odd_even`, `select_even_odd` |
| NT-3 | I Can Write the Multiples of a Number | ... fill a multiples strip, with more blanks in each row. | multiples | `multiples` |
| NT-4 | I Can Find Factors From Arrays | ... write "__ rows of __" for every array of a number. | factor as array side | `factor_links_easy` |
| NT-5 | I Can List Factor Pairs in a T-Chart | ... start at 1 and work up until the pairs meet. | T-chart, no picture | `factor_tchart_easy`, `factor_tchart_medium`, `factor_tchart_hard` |
| NT-6 | I Can Check if a Number Is a Factor | ... divide, then check the yes (no remainder) or no box. | yes / no with a work box | `factors_identify` |
| NT-7 | I Can Test for 2, 5 and 10 | ... look at the ones digit and check the yes or no box in three columns. | divisibility rules | `divisibility_sort` |
| NT-8 | I Can Test for 3 | ... add the digits in a work box, then check the box. | new rule | `divisibility_sort` |
| NT-9 | I Can Tell Prime From Composite | ... list the factor pairs; exactly one pair means prime. | classification from NT-5 | `prime_composite` |
| NT-10 | I Can Find the Greatest Common Factor | ... list both sets of factors, circle the common ones, box the greatest. | two numbers, multi-mark | `gcf_easy`, `gcf_hard` |
| NT-11 | I Can Find the Least Common Multiple | ... fill two multiples strips and circle the first number in both. | two strips | `lcm` |
| NT-12 | I Can Use GCF and LCM With Fractions | ... check the box for the one the task needs: simplify (GCF) or common denominator (LCM). | decide-only, application | `mixed_number_theory` |

Follow-on: factor trees with pre-drawn branch stubs, smallest prime on the left.

**Representations**

| Representation | Drawn how |
|---|---|
| Pairing counters | Plain counters 7 mm in a loose row; the pupil rings pairs. Model shows dotted rings |
| Multiples strip | One row of 10-12 hairline boxes 14 mm wide; the head box is bold: "× 6" |
| Array | Dot array (`createDotArray`, mono), 5 mm pitch, heavy bounding outline, caption frame "__ rows of __" |
| T-chart | Heavy T, target number in a bold box on top, 5-6 hairline rows, a small "×" between the columns of each row. Rows beyond the needed count remain (so row count does not leak the answer); an optional "pairs: __" hint states the count |
| Factor rainbow (links) | `createFactorLinksSVG` in mono: factors in a row, hairline arcs joining each pair; a square number's middle factor has a loop to itself |
| Three-column yes / no | Table: number, then "by 2", "by 5", "by 10", each cell holding a Y / N check-box pair; a work box (rounded, grey outline, never marked) at the row end from NT-8 |
| Factor lists for GCF | Two labelled rows: "Factors of 12: ________________" with rule length fixed at 110 mm regardless of the number of factors |

**Response modes**

| Print | Screen |
|---|---|
| Ring pairs; check a box | Tap two counters to pair; tap |
| Numbers in strip boxes | Inputs |
| T-chart rows | Existing `tchart-drag` plus typed entry (parity: the print item is production, so typing is always available) |
| Y / N check boxes | Tap |
| Sort numbers into two boxes (`divisibility-sort`) | Drag; print twin = write each number in one of two boxes |
| Circle common factors, box the greatest | Tap once / twice |

**Page roles.** Best fit: 2 × 2 grid (T-charts, GCF, LCM: long-procedure cap 4); table-row page (NT-7, NT-8: 8-10 rows); sort page; multiples strips as full-width rows (6 per page) and, being fact-like, in fact rows at 5-10 columns; reference page (primes to 50 as an anchor chart, later family); True or False? ("9 is prime", "1 is prime"); Reason It (odd one out: 2, 9, 11, 13; always / sometimes / never: "A multiple of 6 is a multiple of 3"). Stretch: "Find three numbers that have exactly four factors" with a results table.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| T-chart frame; strip boxes; Y / N pairs; work box; fixed-length factor rules | 1 traced first row or cell → 2 first pair "1 × n" pre-filled → 3 "pairs: __" count → 4 array picture beside the T-chart → 5 rule caption ("ones digit 0, 2, 4, 6, 8") |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| NT-M1 | Factors and multiples swapped | Multiples listed for "factors of 6" |
| NT-M2 | Leaves out 1 and the number itself | Factor list missing the first pair |
| NT-M3 | 1 is prime; 2 is not prime because it is even; every odd number is prime | 1 → prime; 2 → composite; 9, 15, 21 → prime |
| NT-M4 | Odd / even judged by the first digit | 34 → odd; 21 → even |
| NT-M5 | Square number's repeated factor written twice | 16: 1, 2, 4, 4, 8, 16 |
| NT-M6 | GCF given as the smallest common factor, or LCM as the product | GCF = 1 (or 2); LCM = a × b |
| NT-M7 | Divisible by 3 judged by the ones digit | 13 → yes; 51 → no |
| NT-M8 | Near-miss multiples accepted | 54 circled as a multiple of 8 |

**Exemplar: independent page, NT-10, "I Can Find the Greatest Common Factor", Level 6**

```
| Number / Level 6           I Can Find the Greatest Common Factor            |
+-----------------------------------------------------------------------------+
| List the factors. Circle the factors in both lists. Box the greatest one.   |  9 mm
+--------------------------------------+--------------------------------------+
| a.   12 and 18                       | b.   8 and 20                        |
|                                      |                                      | 108 mm
|  Factors of 12:                      |  Factors of 8:                       |
|  _1, 2, 3, 4, 6, 12_  <- grey trace; |  ________________________________    |
|                          1 2 3 6     |                                      |
|  Factors of 18:          ringed,     |  Factors of 20:                      |
|  _1, 2, 3, 6, 9, 18_     6 boxed     |  ________________________________    |
|                                      |                                      |
|  GCF = __6__                         |  GCF = ____                          |
+--------------------------------------+--------------------------------------+
| c.   7 and 21   <- edge: one number  | d.   9 and 16   <- edge: GCF is 1    |
|                    is a factor of    |                                      | 108 mm
|  Factors of 7:     the other         |  Factors of 9:                       |
|  ________________________________    |  ________________________________    |
|  Factors of 21:                      |  Factors of 16:                      |
|  ________________________________    |  ________________________________    |
|  GCF = ____                          |  GCF = ____                          |
+--------------------------------------+--------------------------------------+
```

Geometry: 2 × 2 cells of 93 × 108 mm; factor rules 80 mm, equal length in every cell; GCF rule 16 mm. Three distinct verbs give three distinct marks (list, circle, box). On screen the lists are comma-free chip inputs (one chip per factor), order-insensitive; rings and the box are marked on Check.

---

### 4.17 Rounding + estimation (RE)

**Skill ids**

| Category | Ids |
|---|---|
| `number_sense` | `rounding_visual`, `nearest_10`, `nearest_100`, `nearest_1000`, `nearest_10000`, `nearest_100000`, `nearest_million`, `round_sort_10`, `round_sort_100`, `round_sort_1000`, `round_sort_10000`, `round_sort_100000`, `round_sort_million`, `round_sort_tenths`, `round_sort_hundredths`, `rounding_table`, `estimate_sum`, `estimate_diff`, `estimate_sums_diffs`, `estimate_products`, `estimate_quotient`, `mixed_number_sense` |
| `decimals` (link) | `round_decimals`, `round_thousandths` |

`make_a_ten`, `doubles_near_doubles` and `compensation` sit in `number_sense` in the data file but are fact strategies; they follow the fact-cue rules of `PEDAGOGY_STANDARD.md`. The `nearest_*` and `round_sort_*` families differ only in target place; the ladder treats each as one skill with a place constraint.

One rounding route (XP-G-04): number line first, then place letters with a cut line. The line builds the meaning ("which ten is it nearer to?"); the cut line is the procedure that scales to any place.

**Ladder RE-R (rounding)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| RE-R1 | I Can Find the Two Tens a Number Is Between | ... write the ten before and the ten after. No rounding today. | notate-only | `rounding_visual` |
| RE-R2 | I Can Round to the Nearest 10 on a Number Line (point given) | ... see which end a plotted point is nearer to, and circle it. | plotted lettered points | `rounding_visual`, `round_sort_10` |
| RE-R3 | I Can Round to the Nearest 10 on a Number Line | ... plot the point yourself, then circle the nearer ten. | point not given; includes the "5" case | `rounding_visual`, `nearest_10` |
| RE-R4 | I Can Round Using a Cut Line (nearest 10) | ... draw a cut line after the tens digit and look at the next digit. | line → place letters | `nearest_10` |
| RE-R5 | I Can Round to the Nearest 100 and 1,000 | ... move the cut line to a new place. | target place | `nearest_100`, `nearest_1000`, `round_sort_100`, `round_sort_1000` |
| RE-R6 | I Can Round One Number to Several Places | ... fill a rounding table. | table format | `rounding_table` |

Follow-on: larger places (`nearest_10000` … `nearest_million`), decimals (DE-9), and the regrouping edge case (397 → 400) as its own step.

**Ladder RE-E (estimation)**

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| RE-E1 | I Can Estimate a Sum by Rounding to Tens | ... round each number, then add the rounded numbers. | "about" frame | `estimate_sum` |
| RE-E2 | I Can Estimate a Difference | ... do the same with subtraction. | operation | `estimate_diff`, `estimate_sums_diffs` |
| RE-E3 | I Can Estimate Before I Compute | ... write "Estimate: __" first, then work the exact answer. | estimate + exact in one cell | `estimate_sums_diffs` |
| RE-E4 | I Can Check if an Answer Makes Sense | ... compare a given answer with your estimate and check the yes or no box. | judge-only | `estimate_sums_diffs` |
| RE-E5 | I Can Estimate a Product | ... round one factor to its greatest place. | operation | `estimate_products` |
| RE-E6 | I Can Estimate a Quotient With Friendly Numbers | ... change the dividend to a nearby multiple of the divisor. | compatible numbers, not rounding | `estimate_quotient` |

**Representations**

| Representation | Drawn how |
|---|---|
| Rounding line | XP-D-07, one decade (or hundred), 11 ticks, 12 mm pitch at L; ends in bold boxes (blank rules in RE-R1 and RE-R3); midpoint tick taller with its label. Plotted points are lettered solid dots |
| Place-letter row | Bold letters (Th) H T O above the digits (owner option: words / letters / none); the target place letter is ringed |
| Cut line | Vertical stroke after the target digit, drawn by the pupil (dotted grey in the Model, never dashed); the "look" digit gets a small hairline arc under it. Decision check-box row: "[ ] 0-4 stays  [ ] 5-9 goes up 1" |
| About frame | `about ___ + about ___ = about ___`, the word "about" pre-printed in cell text |
| Estimate row | Left: the exact problem in a digit grid. Right: the about frame. A hairline vertical separates them |
| Rounding table | XP-D-15: row head = the number; columns "nearest 10", "nearest 100", "nearest 1,000" |

**Response modes**

| Print | Screen |
|---|---|
| Numbers in the end boxes | Inputs |
| Plot a point; circle an end | `number-line-place`; tap a ring |
| Draw the cut line; check the stays / goes up box | Tap a digit gap; tap |
| About-frame blanks | Inline inputs; any sensible rounding is accepted within the rule stated in the instruction |
| Check the "makes sense" yes / no box | Tap |
| Sort numbers under two target tens (`round_sort_*`) | Drag; print twin = write each number in one of two boxes |

**Page roles.** Best fit: full-width rows with the work at the right (number line or estimate rows, 4-6 per page); table page (RE-R6); 2 × 3 cells for cut-line items; notate-only page (RE-R1); judge-only page (RE-E4); error analysis; True or False? ("350 rounds to 300"); Reason It (which is correct: three pupils' estimates). Stretch: "Which numbers round to 40? Write five. What are the least and greatest?" with a results table.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| About frame; place-letter row; stays / goes-up check-box row; end boxes on the line | 1 traced first row → 2 pre-plotted point → 3 midpoint label → 4 ringed target letter → 5 grey cut line |

**Misconceptions to seed**

| Id | Error | Seeded wrong answer |
|---|---|---|
| RE-M1 | Rounds down by truncating | 47 → 40 |
| RE-M2 | The 5 case rounds down | 35 → 30 |
| RE-M3 | Looks at the wrong digit (the last one) | 1,349 → 1,400 to the nearest 100 |
| RE-M4 | Changes the target digit but keeps the rest | 47 → 57; 263 → 363 |
| RE-M5 | Regrouping case mishandled | 397 → 3,100 or 390 |
| RE-M6 | Estimates by computing exactly, then rounding the answer | Correct number, wrong process (caught only in RE-E3 where the estimate row comes first) |
| RE-M7 | Rounds each number to a different place | 412 + 38 → 400 + 38 |
| RE-M8 | Chain rounding | 2,449 → 2,450 → 2,500 |

**Exemplar: independent page, RE-E1, "I Can Estimate a Sum by Rounding to Tens", Level 3**

```
| Number / Level 3          I Can Estimate a Sum by Rounding to Tens          |
+-----------------------------------------------------------------------------+
| Round each number to the nearest ten. Add the rounded numbers.              |  9 mm
+-----------------------------------------------------------------------------+
| a.   38 + 21      |   about _40_ + about _20_ = about _60_   <- grey trace  |  37 mm
+-------------------+---------------------------------------------------------+
| b.   52 + 27      |   about ____ + about ____ = about ____                  |  37 mm
+-------------------+---------------------------------------------------------+
| c.   19 + 64      |   about ____ + about ____ = about ____                  |  37 mm
+-------------------+---------------------------------------------------------+
| d.   45 + 33      |   about ____ + about ____ = about ____    <- the 5 case |  37 mm
+-------------------+---------------------------------------------------------+
| e.   70 + 18      |   about ____ + about ____ = about ____    <- edge: a    |  37 mm
+-------------------+---------------------------------------------------------+    number already a ten
| f.   96 + 12      |   about ____ + about ____ = about ____    <- rounds to  |  37 mm
+-------------------+---------------------------------------------------------+    100
```

Geometry: six full-width rows; problem zone 46 mm, frame zone 140 mm; blanks 20 mm. The exact sum is never asked for on this page, so there is no slot for it (XP-G-09). On screen the three blanks are marked on Check; item d accepts 50 only, because the instruction fixes the rule.

---

### 4.18 Math vocabulary (VC)

**Skill ids**

| Category | Ids |
|---|---|
| `vocabulary` | `vocab_grade_K`, `vocab_grade_1`, `vocab_grade_2`, `vocab_grade_3`, `vocab_grade_4`, `vocab_grade_5`, `vocab_grade_6`, and the strand sets `vocab_grade_{K,1}_{operations,counting,geometry,data,algebra,measurement}`, `vocab_grade_2_{operations,counting,fractions,geometry,data,algebra,measurement}`, `vocab_grade_{3,4,5,6}_{operations,fractions,geometry,data,algebra,measurement}` (50 ids in all) |

Skill labels in the data file say "Grade N"; on a pupil page the tab says "Level N" (owner decision 6). The pupils are English-language learners, so vocabulary is taught as a ladder of its own and is also embedded in every other ladder through the Words band (≤ 3 terms per step).

**Rules.** **VC-R1** A vocabulary page teaches at most 6 terms; a lesson step introduces at most 3. **VC-R2** Every term has a labelled mini-diagram or a numeric example; a definition in words alone is not allowed. **VC-R3** Definitions are one sentence of at most 12 words, present tense, with a plain gloss in parentheses where a simpler everyday word exists. **VC-R4** Look-alike and sound-alike terms get a contrast line "Remember: ___, NOT ___" (tenths / tens; factor / multiple; area / perimeter; sum / some). **VC-R5** Pupils copy or select words; they never write a definition. **VC-R6** Terms are drawn from the same set for the whole ladder step so that matching cannot be done by elimination from an unseen word.

**Ladder VC** (applied to one set of 6 terms from any `vocab_grade_*` id)

| Step | I Can ... | This time you will ... | Delta | Skill id |
|---|---|---|---|---|
| VC-1 | I Can Read and Say New Math Words | ... read each word with its picture and say it to a partner. | anchor page, oral | any `vocab_grade_*` |
| VC-2 | I Can Match a Word to Its Picture | ... draw a line from each word to its picture. | match, picture side | same id |
| VC-3 | I Can Match a Word to Its Meaning | ... draw a line from each word to its meaning. | picture → definition | same id |
| VC-4 | I Can Label a Diagram From a Word Bank | ... copy words from the bank onto the label rules. | production by copying | same id |
| VC-5 | I Can Tell Look-Alike Words Apart | ... check the box beside the right word of a pair for each picture. | discrimination | same id |
| VC-6 | I Can Finish a Math Sentence | ... copy one word from the bank into a sentence frame. | word in context | same id |
| VC-7 | I Can Sort Examples and Non-Examples | ... write each letter under "is a ___" or "is not a ___". | concept boundary | same id |
| VC-8 | I Can Use the Words Without a Bank | ... label and finish sentences from memory. | bank removed | same id |

**Representations**

| Representation | Drawn how |
|---|---|
| Term card (anchor page) | Rounded box 88 × 40 mm: the term in bold 18 pt, the definition in cell text, the mini-diagram 30 mm at the right with a hairline leader from the labelled part. 6 cards per page (2 × 3). Cards may carry a dashed cut border on the hands-on version (flashcards, later family) |
| Match columns | Words left, targets right, each with a 2 mm solid anchor dot facing the gutter; gutter 50 mm minimum; targets in shuffled order; equal counts on both sides (no spare distractor below Level 4) |
| Labelled diagram | One figure with 3-5 leader lines ending in 36 mm rules |
| Word bank | XP-D-19 |
| Sentence frame | One sentence ≤ 12 words with one 36 mm rule; the key phrase underlined, never bold-coloured |
| Example / non-example sort | Lettered mini-pictures above two square boxes with head phrases |

**Response modes**

| Print | Screen |
|---|---|
| Draw a line between anchor dots | Tap-tap matching (existing match interaction) |
| Copy a word onto a rule | Tap a chip, then the rule; from VC-8 typed entry with spelling tolerance of one letter, flagged not failed |
| Check one box of a pair | Tap |
| Write letters in a sort box | Drag to bin |
| Say it (VC-1) | TTS "say it" line from `hints-speech.js`; nothing is recorded |

**Page roles.** Best fit: anchor / opener page (VC-1); match page (VC-2, VC-3; 6 pairs at L); word-bank labelling page (VC-4); decision page (VC-5); sentence-frame page (VC-6; 6-8 one-mark items); sort page (VC-7); Daily 4 (one match-of-three or one frame); True or False? ("A product is the answer to an addition"); Reason It (odd one out among four terms, with the reason frame "___ is different because it is not a ___"). Vocabulary cells also appear as the Words band of every other domain's opener, using the same term card at reduced height (30 mm) with identical content.

**Scaffolds**

| Structural | Hint (fade order) |
|---|---|
| Anchor dots; label rules with leaders; sentence frames; sort-box heads | 1 traced first line or word → 2 mini-diagram beside the definition → 3 first letter pre-printed on the rule → 4 word bank (removed at VC-8) |

**Misconceptions to seed** (these are language confusions; each feeds VC-5, True or False? and Reason It)

| Id | Confusion | Seeded wrong choice |
|---|---|---|
| VC-M1 | Place names: tens / tenths, hundreds / hundredths | "tens" for the first decimal place |
| VC-M2 | Result names: sum / difference / product / quotient | "sum" for the answer to a multiplication |
| VC-M3 | factor / multiple | "multiple" for 3 in 3 × 4 = 12 |
| VC-M4 | area / perimeter; edge / side; face / side; vertex / corner of a page | "perimeter" for the shaded inside |
| VC-M5 | numerator / denominator | Swapped labels |
| VC-M6 | Everyday meaning overrides the maths meaning (table, odd, right, mean, volume, even, face) | "right angle" as the opposite of a "left angle" |
| VC-M7 | Sound-alikes for English learners: sum / some, whole / hole, eight / ate, fourth / forth | The everyday spelling chosen in a frame |
| VC-M8 | more than / less than read in word order | "5 less than 8" → 5 − 8 |

**Exemplar: match page, VC-3, "I Can Match a Word to Its Meaning", Level 3 (set `vocab_grade_3_geometry`)**

```
| Vocabulary / Level 3           I Can Match a Word to Its Meaning            |
+-----------------------------------------------------------------------------+
| Draw a line from each word to its meaning.                                  |  9 mm
+-----------------------------------------------------------------------------+
|                                                                             |
|   perimeter     o . . . . . . . . . . .   o  a shape with 4 sides           |
|                  (first line dotted:                                        |
|                   the traced model)                                         |  6 rows
|   area          o                         o  the distance around a shape    |  x 32 mm
|                                                                             |
|   quadrilateral o                         o  a corner where 2 sides meet    |
|                                                                             |
|   right angle   o                         o  the space inside a shape       |
|                                              (flat space you can cover)     |
|   vertex        o                         o  lines that never meet          |
|                                                                             |
|   parallel      o                         o  a square corner  [mini: 3 mm   |
|                                                                corner box]  |
+-----------------------------------------------------------------------------+
|  Remember:  perimeter is AROUND.  area is INSIDE.      <- rounded read box  |  16 mm
+-----------------------------------------------------------------------------+
```

Geometry: words in bold cell text, left column 50 mm; gutter 56 mm; meanings ≤ 12 words in a 74 mm column; anchor dots 2 mm solid; row pitch 32 mm so that ruled lines cross at readable angles. Exactly one traced line (dotted, grey). The page has no cell letters because it is one item with six marks; Score prints "Score ___/6". The contrast box follows VC-R4.

---

## 5. Any skill on any page role: the extension matrix

Owner decision 26 requires every skill above to work on every page role. The domain sections name the best fits; this table states what an extension skill must supply so that the remaining roles work without special cases. Column names refer to `SKILL_CELL_CONTRACT.md`.

| Page role | What the role needs from the skill | Extension-domain notes |
|---|---|---|
| Opener | `strings.whatsNew`, ≤ 3 `vocabulary` terms with mini-diagrams, `workedSteps` (3-6 imperatives ≤ 10 words), one traced + one blank Model cell, 2-4 Guided cells | Steps verbs come from the instruction library; add only through `PEDAGOGY_STANDARD.md` |
| Scripted Model | `workedSteps[].marks`: the figure is redrawn once per step with only the newest marks grey | Figures that exceed half the page width (protractor, integer line, graphs) stack vertically, 3 redraws per page |
| Guided / Independent / More Practice A-J | `renderCell` at `scaffoldLevel` 3..0; `footprint` | Footprints: check-box / name cells 1 × 1; labelled figures 1 × 1 (`medium`); grids, graphs, number lines, protractors full width (`wide`) |
| Sub-skill / decision | `decision(q)` or `setupOnly(q)` | Every ladder above marks its decide-only, notate-only, set-up-only and rewrite-only steps; those are the pages this role prints |
| Error analysis | `wrongAnswer(q)` drawn from the domain's misconception table; the cell shows a completed item with its given answer in black (never grey: grey means trace; pedagogy standard P-TH-4), the check boxes "Correct" / "Fix it" and a fresh blank slot | About half the items are wrong (40 to 60%); the wrong mark is in one place only |
| Review / Test A-B / pre-skill check | Seeded generation; same cell as practice; hint scaffolds off unless the dialog says otherwise; structural scaffolds per the dialog | Tests use 8, 10, 12, 16 or 20 items (4 for long procedures); a labelled cell is one scored item however many slots it holds, and the header denominator is the number of scored items (XP-A-12) |
| Daily spiral panel / Mixed practice / Daily 4 | A compact variant whose minimum size still respects section 2 | If the minimum does not fit the panel, the packer swaps in the skill's one-mark variant (name, check a box, read) and notes it in the dialog only |
| True or False? | `wrongAnswer(q)` + a statement template + a sentence frame of at most 2 blanks, each a number or a word from a printed bank (pedagogy standard P-TH-12) | Statement templates are listed per domain under Page roles |
| Reason It | One of: spot the mistake (`wrongAnswer`), odd one out (three items sharing an attribute + one non-example), always / sometimes / never (domain statement bank), which is correct (two worked cells labelled A and B) | Response is a checked box or a circle plus a frame of at most 2 blanks; one format per page unless the teacher chooses Mixed |
| Stretch | An open task with several answers + a results table as the entry scaffold | One Stretch prompt is given per domain above; the table has one traced first row, 3-6 empty rows, a check column and pre-printed column heads (pedagogy standard P-TH-18) |
| Word problem (schema v1 / v2 / K picture; keyword panel option) | A schema id (part-whole, change, compare, equal groups, rectangle, rate / conversion) and a unit word | Geometry and measurement use the rectangle, box and conversion diagrams; the figure is drawn in the diagram zone, never inside the story box |
| Fact layouts (5-10 columns) | `footprint.factLike = true` | In this playbook: `seq_2`, `seq_5`, `seq_10`, `double`, `halve`, `count_by_fill`, `multiples`, unit-conversion facts (ME-C1 / C2, TC-10), benchmark percents (PC-P4), and `nearest_10` in its one-line form. Column ladder: ≤ 5 cols 28 pt, 6: 24, 7: 20, 8: 18, 9: 16, 10: 16 |
| Hands-on (later family) | A cut-tile set: dashed borders, 3 mm clear of any ink | Shape sorts (SH-4, SH-7), spinner (PR-9), vocabulary flashcards (VC-1), rounding sorts, divisibility sorts, ordering cards (DE-8, IN-6) |

---

## 6. Checklist: designing a page for a skill nobody has drawn yet

Work top to bottom. Each line is a pass / fail check; the rule ids in brackets say where the requirement comes from.

**A. Place the skill**

1. Find the skill id in `SKILLS` and its grade in `SKILL_GRADES`. Note the Level for the tab; the grade and CCSS code go in the footer only.
2. Decide whether the skill is a whole procedure or a slice of one. If it is a whole procedure with 3 or more actions, list the actions; each action that can be isolated becomes a decide-only, notate-only, set-up-only or rewrite-only step [XP-G-05].
3. Place it in a ladder. Write the `iCan` title and the "This time you will ..." sentence. State the single delta against the step before it; if you need the word "and", split the step [XP-G-02, XP-G-03].
4. Name the procedure it could be confused with. If there is one, add a discrimination step [XP-G-06].

**B. Choose the representation**

5. Pick the representation from section 2 or from a domain table above before inventing one. A new representation needs: minimum size at L, line weights, what is grey, what is dotted, what is dashed, and a Photocopy-safe rendering [XP-D-01 to XP-D-03].
6. Remove every cue that depends on colour, and check the figure in greyscale with a hard threshold [XP-G-07, XP-G-08].
7. Check proportions: labelled lengths are drawn in the right order of size; from the second step on, orientation varies [XP-G-15, XP-G-16].
8. Strip decoration: no emoji, no clip-art, no screen-only titles inside the visual. Art appears only when it is the thing being counted, measured or read.

**C. Choose the response**

9. Choose the lowest-load response that still produces the target knowledge: circle / check a box / match / shade → digit in a box → number on a rule with the unit pre-printed → one-blank sentence frame [XP-G-11].
10. Give the answer slot the shape of the answer [XP-G-09]. Pre-print units, operators, brackets, commas, degree and percent signs [XP-G-10].
11. Define the screen twin from `PROBLEM_TYPES.md`. Do not turn production into multiple choice [XP-G-20]. Decide which slots are marked and which are work boxes [XP-G-21].

**D. Sort the scaffolds**

12. List every support in the cell. Label each one structural (it holds the layout of the work: grids, frames, step columns, pre-printed units) or hint (it tells the pupil what to do or shows part of the answer: traces, dots, captions, pre-drawn marks, pictures, word banks).
13. Put the hints in a fade order and map them to `scaffoldLevel` 3 → 0. At level 1 only the first cell of a page or section carries hints [XP-G-14]. Structural supports stay until a ladder step removes them.

**E. Size the cell and the page**

14. Compute the cell footprint at L: the visual's minimum size + the answer zone + 6 mm. Keep the problem in the top half of the cell and leave at least 40% of the cell empty for working.
15. Pick the item cap: 6 (2 × 3) by default, 4 for long procedures or full-width figures, 3 for rows with step blanks, 8-16 for one-mark items. If the items do not fit, drop the count or paginate. Never scale the content [XP-G-12].
16. Register `SKILL_PRINT_SIZE` (compact / standard / medium / wide / spacious) and the online card class in `worksheet.js`, in both places where the format arrays appear.
17. Choose the look: "I Can" look for lesson, review, test and reasoning pages; "Daily" look for drills, spiral, mixed practice and Daily 4. Apply the matching label style [XP-G-13].

**F. Write the strings**

18. Instruction: one instruction of at most 12 words in one to three short imperative sentences, taken word for word from the instruction library, one distinct verb per kind of mark. Reuse it word for word on every page of the step.
19. Steps: 3-6 numbered imperatives of at most 10 words; the last is a check or a "say" line. Vocabulary: at most 3 terms, each with a mini-diagram and, where needed, a "Remember ... NOT ..." line [VC-R2 to VC-R4].
20. Read every string as an English-language learner would: present tense, no idiom, no pronoun without a clear referent, numbers as numerals.

**G. Seed the content**

21. Write the misconception table first (5-8 rows), then implement `wrongAnswer(q)` from it [XP-G-24].
22. Add the edge cases (0, 1, equal values, already-round numbers, on-axis points, empty category) and, on rule pages, non-examples [XP-G-17].
23. Keep numbers small while the step is new; connect `state.range` and `state.decimalPlaces` unless the skill has a fixed domain [XP-G-18]. Keep contexts neutral and original; coins are generic value circles [XP-G-19].

**H. Prove "any skill, any page"**

24. Render the cell on every role in section 5. For each role that needs an optional contract member (`decision`, `setupOnly`, `variants`), either supply it or confirm the default adapter's output is acceptable.
25. Supply the compact variant for spiral panels and Daily 4, or name the one-mark variant the packer should swap in.
26. Write one True or False? statement template, one Reason It prompt and one Stretch prompt with its results table.

**I. Verify**

27. Print at S, M and L, in grey and in Photocopy-safe, on A4 and on US Letter. Photocopy the grey version once and check that shaded parts and trace digits survive.
28. Run the compliance lints: ink, emoji, font, label style for the look, slot shape, overflow, no cell split across pages, no CCSS inside cells, facsimile answer key count.
29. Check the screen card at 375, 768 and 1440 px: the same black-and-white cell inside coloured game chrome; inputs where the blanks are; feedback behaviour per XP-G-21; browser console clean.
30. Confirm that nothing on the page records, charts or gates pupil progress [XP-G-22].

---

## 7. Assumptions

Decisions made here that the owner decisions do not cover. Each can be changed without touching the rest of the document.

| Id | Assumption |
|---|---|
| XP-A-01 | Line weights are taken from the ink table of `WORKSHEET_DESIGN_STANDARD.md` (1.5 / 0.75 / 0.5 pt). Geometric figures keep the order of side lengths but not exact proportion; unknown sides snap to stock lengths so that a drawing never gives the answer away |
| XP-A-02 | Size scaling for diagrams is ×0.85 (M) and ×0.70 (S) of the L dimension, with stated minimums that are never crossed (protractor radius 38 mm, graph cell width 86 mm, integer line 160 mm) |
| XP-A-03 | A printed ruler is true scale and the sheet must print at 100%; on screen the ruler is not true scale and the app says so outside the cell |
| XP-A-04 | Spellings follow US usage ("meter", "liter", "favorable"); both metric and customary ladders exist, metric first |
| XP-A-05 | Ladders longer than 12 steps in the research notes were split into a main ladder plus a named follow-on (coordinates, integers, expressions) or into two ladders (area / perimeter, graphs / statistics, ratios / percents, rounding / estimation, measuring / converting) |
| XP-A-06 | Rounding uses one route: number line for meaning, then place letters with a cut line for procedure. The "hill" picture is not used |
| XP-A-07 | Integer addition is taught on the number line; two-state counters are an optional second ladder. Contexts are temperature, floors and sea level; no debt contexts |
| XP-A-08 | Probability has one generator id today; ladder steps are variants of `probability_basic`. Colour-word items in the current generator are re-skinned to shape tokens and sector letters on paper and on screen |
| XP-A-09 | Circle graphs use lettered sectors with a letter → category table, and only equal-step fractions |
| XP-A-10 | The order-of-operations card lists the four levels in words and symbols and prints no mnemonic |
| XP-A-11 | Time and money skills are outside this playbook because the core standards cover clocks and coins; temperature, capacity and mass have their own section |
| XP-A-12 | A labelled cell is one scored item however many slots it holds, so the header denominator is the number of scored items (design standard HD-2, CL-33). The one exception is an unlabelled whole-page item such as a matching page, where each pair is one scored item |
| XP-A-13 | Vocabulary typed entry on screen tolerates a one-letter spelling slip and flags it without failing the item |
| XP-A-14 | Skill families that differ only by number size or target place (`factor_tchart_*`, `factor_links_*`, `gcf_*`, `nearest_*`, `round_sort_*`, `oop_*` vs the "Level n" set, `*_plain` twins) are treated as one skill with a constraint; merging ids is left to the alias process in `SKILL_CELL_CONTRACT.md` |
