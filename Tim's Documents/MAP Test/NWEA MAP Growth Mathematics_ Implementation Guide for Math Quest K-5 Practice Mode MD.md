# NWEA MAP Growth Mathematics: Implementation Guide for Math Quest (K-5 Practice Mode)

This report synthesizes NWEA official documentation, the Learning Continuum, 2020 and 2025 Norms, and interaction-type research into an actionable build specification for Math Quest's MAP practice mode. It covers both test versions (**MAP Growth K-2 Math** and **MAP Growth Math 2-5**) with full coverage of content, RIT bands, question interactions (with React component specs), sample items, and adaptive mechanics. Source reliability is flagged throughout: **(O)** = official NWEA, **(R)** = reconstructed from public Learning Continuum descriptors and CCSS, **(3P)** = reputable third-party prep (unofficial).

---

## PART 1: MAP GROWTH K-2 MATHEMATICS

### 1A. Domain / goal structure (K-2)

The current CCSS 2010 V2 version of MAP Growth K-2 Math reports **four instructional areas (goal areas)**, identical in naming to the Math 2-5 test (O: NWEA "MAP Growth K-2 Reading & Math Content Common Core" factsheet, nwea.org/uploads/2020/12/map-growth-k-2-assessment-content-common-core_NWEA_factsheet.pdf):

| # | Instructional Area (official name) | Sub-areas |
|---|---|---|
| 1 | **Operations and Algebraic Thinking** (OA) | Represent and Solve Problems; Properties of Operations |
| 2 | **Number and Operations** (NO) | Place Value, Counting and Cardinality; Base Ten and Fractions |
| 3 | **Measurement and Data** (MD) | Solve Problems Involving Measurement; Represent and Interpret Data |
| 4 | **Geometry** (G) | Reason with Shapes and Their Attributes |

Test length is **~43 scored items plus a few field-test items**, ~6-8 items per goal area, untimed, typically 25-40 minutes split across two ~20-minute sittings. **Every K-2 item includes human-recorded audio narration** (not TTS), which is critical for pre-readers, ELLs, and SPED students. NWEA guidance: switch students to MAP Growth Math 2-5 once they score ~190+ on K-2 or are independent readers (O: teach.mapnwea.org/impl/GradelevelTestGuidance.pdf).

### 1B. Specific skills by domain (K-2)

The following skill progressions are compiled from the official **NWEA Learning Continuum** summary (RIT-to-Concepts K-2, teach.mapnwea.org/impl/maphelp/Content/Data/RIT2ConceptK2.htm) and the NWEA Khan Academy correlation PDF (cdn.nwea.org/docs/MAP+Growth+Grades+K-2+to+Khan+Academy.pdf).

**Operations and Algebraic Thinking.** Add-to, take-from, put-together, and take-apart problem types; sums and differences; addends; equations; diagrams; composing/decomposing numbers; one more and one less using a number line; unknown change and unknown start problems; symbol for unknown; multi-step word problems at the top of the range; introduction to repeated addition leading to multiplication meaning; commutative property of addition; inverse operation (subtraction as inverse of addition); identity property; beginning multiplication property of zero. Computation progresses through within-10, within-20, and within-100 bands, with and without regrouping.

**Number and Operations.** Rote counting and one-to-one correspondence 1-10, 11-20, to 100, to 120; counting by 1s, 2s, 5s, 10s, forward and backward; numeral-to-set matching; compare quantities (most, more, fewer, fewest, same, equal to); greater than and less than in words and symbols; ordering 1-20 and 1-100; one more/less; ten more/less; hundred more/less; groups of tens and hundreds; hundreds chart; tens and ones; hundreds, tens, and ones; composing and decomposing numbers; expanded form; standard form; add and subtract within 100 without regrouping, then with regrouping; round to the nearest 10 at the upper end. Fractions enter at the top of K-2: partitioned shapes, unit fraction, halves, fourths, thirds, simple equivalence.

**Measurement and Data.** Length, height, and width vocabulary; compare size; non-standard units, then inches and centimeters; ruler use; estimate and measure; indirect measurement; order by length. Time progresses through hour, half hour, five minutes, and minute, then elapsed time at the upper band. Money moves from penny/nickel/dime identification to whole dollars, collections of coins, equivalent coins, and change from a dollar. Weight/mass and capacity appear at the recognition level. Area and perimeter emerge at the top of K-2 using unit squares on a grid. Data work: category, title, picture graph (one-to-one, then multi-unit scale), bar graph, tables/charts, line plots.

**Geometry.** Identify and classify 2-D shapes (circle, triangle, square, rectangle, hexagon, polygon, quadrilateral); attributes (sides, angles, flat); 3-D shapes (cone, cube, cylinder, sphere, solid) with faces, corners, edges, vertices; positional/spatial words (behind, under, beside, above, below, next to, closest); compose and decompose shapes; equal parts, halves, thirds, fourths, quarters in a geometric context.

### 1C. K-2 RIT band breakdown

Grade-level anchors use the **NWEA 2020 Mathematics Student Achievement Norms** (O: nwea.org/uploads/MAP-Growth-Normative-Data-Overview.pdf): **K** Fall/Winter/Spring = 139.56 / 150.13 / 157.11; **Grade 1** = 160.05 / 170.18 / 176.40; **Grade 2** = 175.04 / 184.07 / 189.42; **Grade 3** Fall = 188.48. The 2025 norms reflect post-pandemic shifts but the RIT scale itself is unchanged.

**Below 151 (early/fall Kindergarten).** Cognitive demand is almost entirely recall and one-step recognition with images. OA: add and subtract within 5; combine with pictures. NO: count to 20; compare quantities (most, more, same); teen numbers as emerging. MD: compare size; recognize weight vocabulary; read picture graph categories. G: name circle, triangle, square, rectangle, cone; positional words. *Sample stems:* "Count the apples. How many?" (image of 3 apples); "Which group has MORE stars?" (two groups shown); "Where is the dog?" (dog under table, 3 image options); "Drag 3 more dots onto the ten-frame to make 5."

**151-160 (mid-late Kindergarten, Winter-Spring K).** Procedural work begins with small numbers; visuals still dominant. OA: subtract within 10, put-together/take-apart with diagrams. NO: groups of tens (place-value foundation); fewer as a formal compare term. MD: centimeters, simple picture/bar graphs. G: fourths introduced; 3-D faces and corners; "next to" spatial word. *Sample stems:* "7 take away 3 is ___" (image of 7 cookies, 3 crossed out); "What number is 1 more than 13?" (number path); "Which shape shows 4 equal parts?" (4 geometric options); "Which pencil is longer?" (two pencils aligned).

**161-170 (end of Kindergarten / Grade 1 Fall).** Fluency with facts within 10 and 20; early reasoning about the equal sign. OA: missing addend, equal sign, relate addition and subtraction within 20. NO: add/subtract within 100 without regrouping, ten more/less, hundreds chart, skip-count by 5s and 10s, numbers to 120. MD: tell time to the hour and half hour, whole dollars, non-standard length, perimeter introduced. G: halves, polygons, sphere, compose/decompose. *Sample stems:* "8 + ___ = 13" (fill-in); "What number is shown?" (3 tens, 4 ones base-ten blocks); "What time does the clock show?" (analog 3:00); "How many paper clips long is the pencil?" (non-standard ruler image); "5 pennies = ___ cents."

**171-180 (mid-late Grade 1).** Two-step reasoning; regrouping concepts. OA: challenging word problems within 20, unknown start, estimation. NO: ten less; introduction to regrouping; rounding emerges; compare and order with symbols. MD: bills and coin collections; analog clock to five minutes. G: edges and vertices of 3-D shapes. *Sample stems:* "Maya had 15 crayons; she gave 7 away"; "23 + 14 = ___" (no regrouping); "How much money?" (2 dimes, 1 nickel, 3 pennies); "7:30 on the clock"; "Which is true: 6 + 4 ___ 10?" (choose <, >, =).

**181-190 (end of Grade 1 / early-mid Grade 2).** Two-digit regrouping; introduction of multiplication via repeated addition. OA: multiplication facts intro, inverse operation, product. NO: 3-digit place value, skip-count by 5/10/100, expanded form, compare 3-digit numbers, add 2-digit by making tens; unit fraction. MD: area via unit squares, elapsed time, bar and picture graphs, line plots. G: thirds, one-fourth, quadrilateral. *Sample stems:* "37 + 48 = ?" (regrouping); "3 groups of 4 dots: which addition matches?" (repeated addition); "300 + 40 + 6 = ___"; "How many square units?" (2x3 rectangle on grid); "What fraction is shaded?" (circle in thirds, 1 shaded).

**191-200 (end of Grade 2 / Grade 3 Fall).** Formal multiplication; multi-step problems; fractions on a number line. OA: meaning of multiplication, arrays, two-step word problems, basic multiplication facts, patterns. NO: round to nearest 10 or 100, add within 1000, unit fractions, fractions on a number line, compare fractions with same denominator. MD: tell time to the nearest minute, multi-unit graph scales, change from a dollar, area by counting unit squares. G: categorize quadrilaterals, partition shapes. *Sample stems:* "4 plates, 3 cookies each, how many in all?"; "Round 267 to the nearest 10"; "3x4 rectangle: what is the area?"; "Which is greater, 2/4 or 3/4?" (with fraction bars).

**201-210 (advanced Grade 2 or typical Grade 3).** Grade 3 rigor: division, fraction equivalence. OA: division facts, quotient, relate multiplication and division, two-step problems with missing factor. NO: subtract within 1000, multiply by tens, equivalent fraction models, equivalent fractions on a number line. MD: find area via the distributive property, decompose figures, find missing side from area/perimeter, create and read multi-unit graphs. G: one-quarter, partition shapes into equal parts. *Sample stems:* "18 ÷ 3 = ?"; "Which multiplication has the same answer as 5 × 4?"; "Area of a 5x4 rectangle?"; "Are 2/4 and 4/8 equivalent?"

**211-220 (high ceiling for K-2 test).** The K-2 item pool thins here; NWEA recommends migrating the student to the 2-5 test. Content reflects Grade 3-4 skills: elapsed time across hours, equivalent fractions in simpler form, missing factors, subtle quadrilateral attribute problems.

### 1D. K-2 band x domain skill matrix

| RIT Band | OA | NO | MD | G |
|---|---|---|---|---|
| <151 | Add/sub within 5; put-together | Count to 20; compare quantities | Length/mass vocab; category | Name basic 2-D/3-D shapes; position |
| 151-160 | Subtract within 10; equation | Groups of tens; fewer | Centimeter; picture/bar graph | Fourths; 3-D face/corner |
| 161-170 | Within 20; missing addend; equal sign | No-regroup add/sub; skip-count | Hour/half hour; whole dollars; perimeter intro | Halves; polygon; sphere |
| 171-180 | Word problems within 20; unknown start | Regroup 2-digit; rounding intro | Coin collections; five minutes | Edges/vertices 3-D |
| 181-190 | Multiplication intro (repeated addition) | 3-digit PV; expanded form; compare; unit fraction | Area via unit squares; line plots; elapsed time | Thirds; quadrilateral |
| 191-200 | Multiplication meaning; arrays; 2-step | Round; add within 1000; fractions on number line | Time to minute; multi-unit graphs | Categorize quadrilaterals |
| 201-210 | Division; quotient; × and ÷ relation | Subtract within 1000; equivalent fractions | Area via distributive; missing side | Partition shapes |
| 211-220 | Missing factor (rare on K-2) | Equivalent/compare fractions | Complex elapsed time | Ceiling; migrate to 2-5 |

---

## PART 2: MAP GROWTH MATH 2-5

### 2A. Domain / goal structure (2-5)

The MAP Growth Math 2-5 CCSS test uses the **same four official instructional areas** as K-2, but with expanded content inside Numbers and Operations to include fractions, decimals, and multi-digit operations (O: nwea.org, teach.mapnwea.org RIT-to-Concepts Math):

1. **Operations and Algebraic Thinking** (OA): multi-step word problems; numerical expressions with parentheses and brackets; order of operations; patterns and relationships; factors, multiples, prime and composite numbers; variables and algebraic expressions at the top of the range.
2. **Number and Operations** (NO): place value to millions and decimals to thousandths; multi-digit multiplication; division with 1-digit and 2-digit divisors; rounding; fractions (equivalence, compare, add/subtract with like and unlike denominators, multiply fractions, divide unit fractions by whole numbers, fractions as division); decimal computation; simplest form.
3. **Measurement and Data** (MD): length, weight/mass, capacity, conversions within customary and metric systems; perimeter, area, volume (Grade 5 with rectangular prisms); elapsed time; line plots with fractional data; bar graphs; dot plots; basic statistics (mean, median, mode, outliers, range) at the top of the band.
4. **Geometry** (G): classify 2-D figures hierarchically (e.g., all squares are rectangles); angle vocabulary (acute, right, obtuse, straight, complementary, supplementary, vertical); coordinate plane (Quadrant I in Grade 5, all four quadrants for advanced items); symmetry; transformations (reflection, rotation, translation) at the top; nets of 3-D figures; properties of polygons.

Advanced Grade 5 students (RIT ~220+) will encounter items from the **Math 6+** pool covering ratios/rates, integers, early algebra, statistics (box plots, quartiles, variability), and exponents/scientific notation. Test length is commonly cited as **43 scored items** in NWEA's own blog posts, though third-party sources report 47-53; expect ~10-12 items per goal area. Untimed; typical duration 45-60 minutes. A **basic calculator** can be made available as a designated feature for grades 3-5; Desmos appears on item-specific occasions.

### 2B. Specific skills by domain (2-5)

**Operations and Algebraic Thinking.** Multiplication and division facts fluency; multiplicative comparison ("3 times as many as"); multi-step word problems with all four operations; interpret remainders; find factors and multiples; identify prime and composite numbers; recognize and extend numeric and shape patterns; analyze two-variable patterns; write and evaluate numerical expressions including grouping symbols; follow order of operations; translate words to expressions and equations; use variables as unknowns; introductory algebraic thinking through function-table-style patterns.

**Number and Operations.** Place value to 1,000,000; read, write, and compare multi-digit numbers; round to any place. Fluency with multi-digit addition and subtraction. Multiply 2-digit by 2-digit, then multi-digit by 1-digit and 2-digit divisors; interpret quotients and remainders. Decimal place value to thousandths; read, compare, order decimals; add, subtract, multiply, divide decimals by powers of ten and by whole numbers (Grade 5). Fractions: represent on a number line; equivalent fractions; compare with like and unlike denominators; add/subtract with unlike denominators; multiply a fraction by a whole number, a fraction by a fraction; divide a unit fraction by a whole number and a whole number by a unit fraction; interpret a fraction as division; simplest form; improper fractions and mixed numbers; relate fractions and decimals.

**Measurement and Data.** Convert measurements within a system (inches-feet-yards; cm-m-km; oz-lb; mL-L; min-hr). Perimeter and area of rectangles, then composite figures. Volume of rectangular prisms and composed solids (Grade 5). Elapsed time across hours and days. Line plots with fractional measurements (halves, fourths, eighths). Read and create bar graphs, dot plots, and pictographs with multi-unit scales. Mean, median, mode, range; identify outliers; sample space introduction for advanced students.

**Geometry.** Classify triangles by sides (scalene, isosceles, equilateral) and angles (acute, right, obtuse); classify quadrilaterals hierarchically; identify parallel and perpendicular lines; measure and classify angles; find missing angles using complementary, supplementary, and vertical angle relationships (top of range). Graph ordered pairs on the coordinate plane (Quadrant I in Grade 5; all four quadrants for advanced). Identify lines of symmetry. Recognize and draw nets of 3-D figures (cube, rectangular prism, pyramid). Recognize translations, reflections, and rotations at the top of the band.

### 2C. 2-5 RIT band breakdown

Anchors from the **NWEA 2020 Norms** and **2025 Norms Quick Reference**: **Grade 3** Fall/Winter/Spring = 188.48 / 196.23 / 201.08; **Grade 4** = 199.55 / 206.05 / 210.51; **Grade 5** = 209.13 / 214.70 / 218.75 (2020). The 2025 norms show Grade 5 means of **206 / 212 / 216** with SD 16-18; percentiles for the same RIT have shifted upward relative to the 2020 norms.

**181-190 (end of Grade 2 / Grade 3 Fall).** Procedural two- and three-digit computation; introduction of formal multiplication and fractions as numbers. *Sample stems:* "63 + 34 = ___" (fill-in, O: NWEA RIT reference chart); "Box + 7 = 13" (O); "Which shape does NOT have any corners?" (O); "The pencil is about how many centimeters long?" (O, ruler image).

**191-200 (end of Grade 3).** Multi-step word problems across four operations; fractions on a number line; multi-unit graphs; telling time to the minute. *Sample stems:* "99 − 56 = ?" (O: RIT chart); "Two children share 8 dolls equally; how many each?" (O); "Who has the most candy?" (pictograph, O); "Click on all the quadrilaterals" (multi-select, O).

**201-210 (end of Grade 4 / core Grade 5 Fall).** Multi-digit multiplication, long division with 1-digit divisors, decimal place value introduction, area/perimeter word problems, angle classification. *Sample stems:* "60 × 5 = ?" (O); pattern continuation "6, 12, 18, …, day 6?" (O); "Rectangle 10 in by 2 in, perimeter?" (O); "Click on all the obtuse angles" (multi-select, O); "Identify the letter at (5, 2)" on a coordinate plane (3P; Grade 5).

**211-220 (typical end of Grade 5).** Fractions with unlike denominators, volume of rectangular prisms, order of operations with brackets, coordinate plane operations, hierarchical geometry reasoning. *Sample stems:* "Drag 4/10, 6/10, 9/10 onto the number line" (O: drag to number line); "[6 × (9 − 4)] + [(6 + 4) ÷ 2] = ?" (O); "Which statement about rectangles is true?" (hierarchical classification, O); "Click all measurements equal to 5 hours" (multi-select with conversion, O).

**221-230 (advanced Grade 5 / Grade 6 content).** Equivalent fraction construction, decimal division, complex multi-step problems, composite area on a grid. *Sample stems:* "Drag numbers to make two different fractions equal to 1/3" (O); "0.32 ÷ 8 = ?" (O); "Shay needs 50 hot dogs, buns come 8 per pack, fewest packs?" (multi-step with remainder interpretation, O); "Area of the L-shape" on a grid (O).

**231+ (highly advanced, middle-school content).** Transformations with coordinates, ratios and rates, integer operations, early slope/rate-of-change, exponents, basic probability, measures of center and spread, systems of equations at the very top. *Sample stem:* "Triangle is reflected across the y-axis, then the x-axis; P(7,3) maps to where?" (O).

### 2D. 2-5 band x domain skill matrix

| RIT Band | OA | NO | MD | G |
|---|---|---|---|---|
| 181-190 | Repeated addition; missing addend | 3-digit PV; no-regroup 3-digit +/− | Measure cm/in; line plots | No corners; quadrilaterals |
| 191-200 | × meaning; arrays; 2-step | Round; fractions on number line; compare same-denom fractions | Time to minute; multi-unit graphs; change from a dollar | Categorize quadrilaterals |
| 201-210 | Patterns; multi-digit × basics; order of ops intro | Long division 1-digit divisor; decimal place value (tenths, hundredths) | Perimeter word problems; angles by type | Classify triangles; Quadrant I plotting |
| 211-220 | Brackets + order of ops; multi-step; variables intro | Unlike-denominator fractions; decimal operations; multiply fractions | Volume of prisms; unit conversion | Hierarchical classification; complementary/supplementary angles |
| 221-230 | Expressions with variables; multi-step reasoning | Equivalent fraction construction; decimal division; fractions as division | Composite area; line plots with fractional data | Four-quadrant coordinate; nets |
| 231+ | Systems; rate of change; exponents | Integer operations; ratios; scientific notation | Box plots; mean/median/mode/outliers; variability | Transformations with coordinates |

---

## PART 3: QUESTION TYPES AND REACT COMPONENT SPECIFICATIONS

The 2024-2025 **MAP Growth Technical Report** (Ch. 4.5) groups math items into five families: **selection, construction, generation, item sets, and composite items**. The named item types in NWEA documentation are: Multiple-Choice, Multiselect, Hot Text (Selectable Text), Drag-and-Drop (with a Click-and-Click accessible alternative), Click-and-Pop, Text Entry, Gap Match (inline dropdown), and Item Set/Composite. Manipulative-style interactions (ten-frames, base-ten blocks, fraction bars, clocks, coins, number lines) are implemented as specialized variants of Click-and-Pop and Drag-and-Drop rather than named item types.

**Crucial accessibility fact.** The **Accessible MAP Growth variant explicitly removes drag-and-drop, click-and-pop, and gap-match items**, substituting multiple-choice equivalents (O: NWEA Accessibility and Accommodations FAQ, Jan 2020). Math Quest should ship a **parallel MC fallback** for every enhanced item, toggled by a student accessibility profile. This is especially important for SPED students with motor-control IEPs and for screen-reader users.

### 3A. Multiple choice (single answer)

Student clicks exactly one radio-style option. K items often show **3 options with images**; Grade 1+ standardizes on **4 options**. Dominant item type across the full test.

```jsx
Component: MultipleChoiceSingle
Props: { stem, stemAudio, options: [{id, text?, imageUrl?, audio?, altText}],
         correctId, numOptions: 3|4, layout: 'vertical'|'grid-2x2'|'grid-1x3' }
State:  { selectedId, submitted, audioPlaying }
Validation: selectedId === correctId
A11y: role="radiogroup"; arrow-key cycling; Space/Enter select;
      min 48x48 tap targets; high-contrast focus ring; replay-audio button.
```

**ELL/SPED:** always tap-to-replay audio; pair numbers with pictures through RIT 170; avoid negative-polarity stems ("Which is NOT…"); bilingual label toggle.

### 3B. Multiple select / multi-select

Checkbox-style; 2+ correct options. **Scored all-or-nothing** on MAP. Common from RIT 185 up.

```jsx
Component: MultiSelectAnswer
Props:  { stem, stemAudio, options, correctIds, feedbackPolicy: 'all-or-nothing' }
State:  { selectedIds: Set, submitted }
Validation: set-equality(selectedIds, correctIds)
A11y: role="group"; each option aria-checked; visible "Selected: 2 of ?" counter.
```

**ELL/SPED:** show "you can pick more than one" pictogram (✓✓) and a live counter; disable Submit until ≥1 selected for SPED working-memory support.

### 3C. Numeric entry (text entry / fill-in-the-blank)

Student types a number into a response box. Fractions use two boxes (numerator/denominator). Limited use at K-2 (one-digit); common from RIT 180 up.

```jsx
Component: NumericEntry
Props: { stem, boxes:[{id, type:'integer'|'decimal'|'fraction-num'|'fraction-den',
        minValue?, maxValue?, unit?}], correctAnswers, tolerance?, showNumericKeypad }
State: { values, submitted, errors }
Validation: for each id, parseNum(values[id]) within tolerance of correctAnswers[id]
A11y: inputmode="numeric"; on-screen keypad mandatory for K-2/SPED;
      font ≥24px; clear button; "hear my answer" playback.
```

**ELL/SPED:** always show the on-screen numeric keypad for K-2 and SPED (no QWERTY distraction); accept format variants (0.5 / .5, 1/2 / "1 over 2").

### 3D. Inline dropdown cloze (gap match)

Sentences with inline dropdowns, 2-4 options per blank. Rare in K-2; present in 2-5 from RIT 185 up.

```jsx
Component: InlineDropdownCloze
Props:  { stemSegments: [{kind:'text',value} | {kind:'blank',id,options,correctValue}],
          stemAudio }
State:  { selections: Record<blankId,value|null>, submitted }
Validation: every blank selections[id] === correctValue
A11y: each dropdown aria-label "Choose for blank 1 of 3";
      render as large pill buttons (not native <select>) for SPED;
      TTS reads "blank" where the dropdown sits.
```

### 3E. Drag-and-drop (with click-and-click fallback)

The single most important enhanced interaction. NWEA implements **one unified primitive** with many modes: order a sequence, categorize into bins, drop on a number line, place on a graph, compose a shape or fraction. Also available in click-and-click mode (click source, click destination).

```jsx
Component: DragDropInteraction
Props: { mode: 'order'|'categorize'|'numberline'|'graph'|'compose-shape'|'compose-fraction',
         tokens: [{id,label?,imageUrl?,audio?,value}],
         targets: [{id,label?,position?,accepts?}],
         correctPlacement: Record<tokenId,targetId>,
         allowClickClickFallback: true,
         multipleTokensPerTarget?, backgroundImage? }
State: { placements, activeToken, draggingToken, submitted }
Interactions:
  DnD:      onDragStart/Over/Drop
  Clicks:   onTokenClick -> setActiveToken; onTargetClick -> place(activeToken,tid)
  Keyboard: Tab to token, Space pick up, arrow keys move focus, Space drop
Validation: set or mapping equality against correctPlacement
A11y: aria-live="polite" announces "Picked up 3. Move to bin Even.";
      large tokens (≥56px); snap-back on miss; parallel MC fallback item.
```

**ELL/SPED:** default to click-click mode; run an animated "tap-then-tap" tutorial on first use; put icons + labels on bins; keep free re-arrange before Submit.

### 3F. Click-and-pop (hotspot selection)

Click regions inside an image to toggle selections. Very common in K-2 (click the triangle, click all the apples to show 5) and 2-5 (click all quadrilaterals, click obtuse angles).

```jsx
Component: ClickAndPop
Props: { backgroundImage?, targets:[{id,x,y,width,height,imageUrl?,altText,audio?}],
         correctIds, mode:'toggle'|'select-one', counterDisplay? }
State: { selected: Set, submitted }
Validation: set-equality(selected, correctIds)
A11y: each target <button role="checkbox" aria-pressed>;
      aria-label e.g. "Apple 1 of 6, not selected";
      selection ring ≥3px in a colorblind-safe palette.
```

### 3G. Hot text / selectable text

Click words, numbers, or expression parts inside a text block. Used for "click the hundreds digit," "click the error in the equation," "click all even numbers."

```jsx
Component: HotText
Props: { segments:[{id,text,selectable,correct}], selectionStyle:'highlight'|'underline'|'circle' }
State: { selectedIds: Set, submitted }
Validation: set-equality(selected, correct segments)
A11y: each selectable segment is <button aria-pressed>;
      selection shown by both color AND underline (colorblind-safe).
```

### 3H. Click a point on a number line

Specialized Click-and-Pop along a 1-D axis. Supports discrete-tick snapping (for integers) or continuous (for fractions with tolerance).

```jsx
Component: NumberLineClick
Props: { min, max, step, majorTickEvery, labels, correctValue, tolerance,
         mode:'discrete-tick'|'continuous' }
Validation: Math.abs(selectedValue - correctValue) <= tolerance
A11y: role="slider", aria-valuenow, aria-valuetext "Point at 6";
      keyboard Left/Right arrows step by `step`, Home/End jump to ends;
      optional ± buttons mode for SPED motor support.
```

### 3I. Click to plot on coordinate plane

Grade 5+ items (RIT 210+). Student clicks the grid; cursor snaps to the nearest lattice point.

```jsx
Component: CoordinatePlaneClick
Props: { xRange, yRange, step:1, gridVisible, axisLabels,
         correctPoint | points, tolerance:0,
         mode:'single-point'|'multi-point'|'plot-and-connect' }
Validation: exact lattice match
A11y: keyboard arrow keys move a crosshair; Enter drops; Backspace removes last;
      aria-valuetext "Crosshair at 3, 4".
```

### 3J. Click to shade grid cells

Fraction models, array models, composite area. K-2 uses for arrays; 2-5 for fractions and area.

```jsx
Component: GridShade
Props: { rows, cols, cellSize, initialShaded?, correctCount? | correctPattern?,
         lockedCells? }
State: { shaded: boolean[][], submitted }
Validation: count match OR full-pattern match
A11y: role="grid"; each cell <button aria-pressed>; drag-paint optional for SPED efficiency.
```

### 3K. Manipulative primitives (K-2 emphasis)

**Ten-frame.** Grid of 10 (or 20) cells; student taps to fill, optionally dragging counters from a tray. Essential for K RIT 140-175.

```jsx
Component: TenFrame
Props: { target?, initialDots?, maxDots:10|20, interactive:true, layout:'5x2' }
State: { filledCells: boolean[] }
Validation: count === target (order-independent; default fill left-right top-bottom)
A11y: role="grid" aria-label "Ten frame, 8 of 10 filled"; voice count per click.
```

**Base-ten blocks.** +/− buttons or drag-from-tray; hundreds, tens, ones (and optional thousands for upper Grade 2 / Grade 3). Essential for place-value work in RIT 160-210.

```jsx
Component: BaseTenBlocks
Props: { allowed:{hundreds,tens,ones,thousands?}, target?, mode:'build'|'identify' }
State: { placed:{h,t,o,th?} }
Validation: 1000*th + 100*h + 10*t + o === target
A11y: +/− buttons labeled "Add a ten", "Remove a one"; live total.
```

**Fraction bar / area model.** Shade parts of a pre-partitioned bar/circle, or partition-then-shade. Core Grade 3-5 interaction.

**Interactive clock.** Drag hour/minute hands or use +/− buttons; granularity 5 or 1 minute. Grade 1-3.

**Coin builder.** Drag coins to a workspace; running cents total. Grade 2.

**Draggable ruler.** Align a ruler with an object; student then types the length in a companion NumericEntry. Grade 1-3.

**Bar graph / picture graph builder.** Per-bar up/down buttons or drag-top-edge; picture graphs add column icons. Grade 2-5.

### 3L. Universal support features (must-have context)

```jsx
UniversalFeaturesContext = {
  tts: { enabled, rate, autoplay, voice },
  highContrast: 'default'|'yellow-on-black'|'black-on-yellow'|'sepia',
  fontScale: 1.0|1.25|1.5|2.0,
  reduceMotion, lineReader, answerEliminator,
  calculator: null|'basic'|'scientific',
  language: 'en'|'es',
  scratchpadOpen,
  // Math Quest additions:
  dwellClick, largeTargets, clickClickOnly, autoReadItems, simpleBackground
}
```

Per NWEA, **K-2 has human-recorded audio on every stem**; 2-5 offers TTS as a designated feature. A **basic calculator** is available on designated items in grades 3-5 (Desmos integration); none in K-2. An **answer eliminator (strikethrough)**, **highlighter**, **line reader**, and **notepad/scratchpad** are universal tools on the real test and should appear in Math Quest's simulation mode.

### 3M. Interaction priority matrix

| Interaction | K-2 | 2-5 | Math Quest priority |
|---|---|---|---|
| MC single answer (3-option at K, 4-option from G1) | ✓ | ✓ | **P0** |
| Multi-select | rare | ✓ | P1 |
| Numeric entry | limited | ✓ | **P0** |
| Click-and-pop | ✓ | ✓ | **P0** |
| Drag-and-drop (order, categorize) with click-click fallback | ✓ | ✓ | **P0** |
| Number-line click / drag | ✓ | ✓ | **P0** |
| Ten-frame | ✓ | — | **P0** (K) |
| Hot text | rare | ✓ | P1 |
| Grid shade | ✓ | ✓ | **P1** |
| Base-ten blocks | light | ✓ | **P1** |
| Fraction bar | — | ✓ | **P1** |
| Clock, coins, ruler | ✓ | ✓ | P1-P2 |
| Inline dropdown cloze | rare | ✓ | P2 |
| Bar/picture graph builder | — | ✓ | P2 |
| Coordinate plane click | — | ✓ (Gr 5) | P2 |
| Equation editor | — | — | Skip for K-5 |

---

## PART 4: IMPLEMENTATION GUIDANCE

### 4A. Adaptive algorithm

MAP Growth is a **Rasch 1PL IRT computer-adaptive test** (O: 2019 and 2024-2025 Technical Reports). The engine maintains a provisional ability estimate after each response using **Bayesian scoring during administration**, then finalizes with maximum likelihood. Item selection is **content-balanced**: constrained by the goal-area blueprint (roughly equal representation of the four instructional areas) and, as of the 2024 **Enhanced Item-Selection Algorithm**, prioritizes on-grade items while allowing below- or above-grade items as the ability estimate requires. Among items near the target difficulty, a **randomization layer** prevents over-exposure.

Starting RIT: prior RIT if available, otherwise the grade-seasonal mean from the 2020 or 2025 norms table. Each correct response nudges difficulty upward and vice versa; magnitudes vary under Bayesian updating. The algorithm targets roughly **50% correct** overall. Tests are **fixed-length**, not fixed-precision: K-2 Math ends at ~43 scored items and Math 2-5 at ~43-53 items. Tests under 6 minutes are invalidated. Marginal reliabilities average ≥0.90 overall, with **goal-area sub-scores at 0.75-0.85** and SEM around **2.5-3.5 RIT points** overall, widening to 4-6 points on sub-scores.

### 4B. Test length, timing, student controls

K-2 Math: ~43 scored items, ~25-40 minutes, often split across two ~20-minute sittings; human-audio narration on every item; no calculator. Math 2-5: ~43-53 scored items, ~45-60 minutes; designated TTS; basic calculator on flagged items for Grades 3-5. Both are **untimed**, with **no skip and no back-navigation** (hard rules of the adaptive algorithm). Proctors can suspend and resume.

### 4C. Goal-area reporting and the Learning Continuum

Each student receives an **overall RIT**, **percentile rank**, and **four goal-area RIT sub-scores** with relative descriptors (Low, LoAvg, Avg, HiAvg, High). NWEA's **Learning Continuum** (successor to DesCartes) maps every RIT band to three skill tiers: **Reinforce** (skills in the band below), **Develop** (current band, the instructional sweet spot), and **Introduce** (band above, stretch goals). Math Quest's practice-mode report should mirror this three-tier structure because it is the report teachers already use. NWEA explicitly cautions that **sub-scores have wider SEMs** (4-6 RIT) and should be read as relative strengths, not definitive mastery; Math Quest should surface sub-scores with confidence bands and plain-language descriptors rather than raw RIT numbers for ELL and SPED families.

### 4D. RIT score mechanics and grade anchors

**RIT (Rasch Unit)** is a vertical, equal-interval scale of roughly 100-350, subject-specific and grade-independent: a 10-point gain means the same learning anywhere on the scale. **2020 K-5 Math means by season:**

| Grade | Fall | Winter | Spring | SD |
|---|---|---|---|---|
| K | 139.6 | 150.1 | 157.1 | ~12 |
| 1 | 160.1 | 170.2 | 176.4 | ~13 |
| 2 | 175.0 | 184.1 | 189.4 | ~13 |
| 3 | 188.5 | 196.2 | 201.1 | ~14 |
| 4 | 199.6 | 206.1 | 210.5 | ~15 |
| 5 | 209.1 | 214.7 | 218.8 | ~16 |

The **2025 Norms Quick Reference** (HMH/NWEA, Oct 2025, based on 2022-2024 data) shows a post-pandemic shift downward: **Grade 5 means of 206 / 212 / 216**. The same RIT now corresponds to a higher percentile than it did under 2020 norms. For Math Quest's default starting RITs and norm-referenced feedback, use the 2025 norms where available and flag the data source.

### 4E. What a practice mode must emulate vs. simplify

**Emulate faithfully:** adaptive item selection organized by RIT band and goal area; the four instructional areas; diverse interaction types including drag-and-drop, click-and-pop, number-line, and hot text; no back-navigation or skip within a simulation run; untimed experience; audio support for K-2; scratchpad and (for Grades 3-5) basic calculator on designated items; a final report with overall RIT, SEM confidence band, four goal-area sub-scores with plain-language descriptors, and a Learning-Continuum-style "Ready to Learn" panel.

**Safely simplify:** full Rasch IRT calibration (use an item pool tagged with a RIT-band midpoint and a simple ±3-8 step rule); strict blueprint enforcement (rotate goal areas to keep rough 25% coverage); full 43-item length (a 15-25-item practice run is plenty for K-2 attention spans); exposure controls and proctor codes; item-parameter drift monitoring.

**Recommended dual modes.** (1) **MAP Simulation mode**: adaptive, no feedback, no hints, no retry, 15-25 items, realistic look-and-feel; the goal is **test familiarization**, especially for anxious students and ELLs who benefit from predictability. (2) **Grade-Level Practice mode**: adaptive within a narrow band at the student's grade, with immediate feedback, optional hints, worked solutions, and retries; this is where **learning** happens and where Math Quest's scaffolding (manipulatives, bilingual audio, glossary pop-ups, step-by-step reveals) pays off. NWEA research suggests that test-prep drills show no meaningful RIT gains and may harm growth by displacing instruction; Math Quest's value is in interaction-type familiarity and skill-building within the Learning Continuum "Develop" band, not in gaming the score.

### 4F. Pseudocode for Math Quest's adaptive engine

```
startRIT = priorRIT ?? gradeSeasonalMean(grade, season)  // 2025 norms
currentRIT = startRIT
history = []
while items.length < targetLength:
  band = roundTo10(currentRIT)                 // e.g., 181-190
  goal = rotateUnderrepresentedGoalArea(history) // blueprint balance
  item = samplePool(band, goal, grade, excludingSeen)
  resp = await present(item)
  history.push({item, resp})
  if resp.correct:
    currentRIT += stepUp(history.correctStreak)    // 3-8 RIT
  else:
    currentRIT -= stepDown(history.incorrectStreak) // 3-8 RIT
finalRIT = informationWeightedAverage(history)
SEM_estimate = 10 / sqrt(items.length)           // rough; MAP operational ≈ 3
report = {
  overallRIT: finalRIT, semBand: [finalRIT-SEM, finalRIT+SEM],
  goalAreas: subscoreByArea(history),
  readyToLearn: learningContinuumLookup(finalRIT, history)
}
```

### 4G. Accessibility-first design for ELL and SPED

Math Quest should ship every enhanced item with a **parallel MC fallback** (same JSON, different renderer), mirroring NWEA's Accessible MAP Growth approach. Every component must honor the `UniversalFeaturesContext`: bilingual audio (English and Spanish at minimum for ELL), high-contrast themes, font scaling, reduced motion, click-click-only toggle, dwell-click for motor-impaired users, large-targets mode (≥64 px), auto-read on item load, first-use animated tutorials per interaction type, consistent visual grammar (Submit always in the same position), immediate non-punitive feedback in practice mode, and prefers-reduced-motion compliance. For ELLs, add a glossary pop-up that shows picture + definition + audio in both languages on any math term the student taps. For SPED, add a visible "Selected: n of ?" counter on multi-select, undo on match-pairs, and a "Show me" modeled example before first attempt.

---

## Conclusion: what to build first

The fastest path to a MAP-faithful practice mode in Math Quest is a **Phase-1 MVP (4-6 weeks)** consisting of six React components plus the universal-features context: **MultipleChoiceSingle, NumericEntry, ClickAndPop, DragDropInteraction (order + categorize modes), TenFrame, NumberLineClick**. Paired with a small adaptive engine (±3-8 RIT step, goal-area rotation, 2025-norms starting RIT) and an item pool tagged by (RIT band × goal area × grade × interaction type), this gives K-5 students the two experiences they actually need: a **MAP Simulation** that builds test-day familiarity with the unfamiliar drag-and-drop and no-back-navigation reality, and a **Grade-Level Practice** mode where scaffolding, bilingual audio, and manipulatives turn each item into a learning moment. The single highest-leverage design decision is the **parallel MC fallback** on every enhanced item, because it is both the accessibility floor NWEA itself uses and the ELL/SPED safety net that makes adaptive practice feel safe rather than punishing. Ship audio on every K-5 item, not just K-2: Tim's students at Awsaj Academy will benefit from bilingual read-aloud at every grade, and the marginal engineering cost is negligible once the universal-features context is in place.

**Source reliability note.** Goal-area structure, test length, adaptive mechanics, norms tables, interaction taxonomy, and accessibility rules are all from official NWEA documentation (2019 and 2024-2025 Technical Reports, the K-2 Content Factsheet, teach.mapnwea.org RIT-to-Concepts pages, the 2020 Normative Data Overview, and the 2025 Norms Quick Reference / Technical Manual). Sample items at bands 181-230 are drawn from NWEA's public **RIT Reference Chart for Math 2-5** and are authentic sample items. K-2 items below RIT 181 and all drag/click/number-line interactions are **reconstructed** from the publicly documented Learning Continuum descriptors and third-party practice resources (Testing Mom, TestPrep-Online, Tutorified, Effortless Math); the actual NWEA item bank is secure and not public. Math Quest should create original MAP-style items rather than reproduce secure items. For pixel-accurate UI matching, the development team should log into **practice.mapnwea.org** (username `grow`, password `grow`) and capture screenshots of the live practice test as a visual reference.