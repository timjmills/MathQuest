# MAP Growth K-5 math practice build: a full reference document

This reference synthesizes the NWEA MAP Growth Mathematics blueprint, the Learning Continuum skill catalog (RIT 141 to 230), IXL and Khan Academy correlations, item-type and sample-item catalogs, build recommendations for a web app, and the 2020 norms needed to calibrate difficulty. It is intentionally long and structured so Tim can work from it for months. The document is organized into 10 parts. Where the public record is incomplete (the verbatim in-product Learning Statements are behind NWEA's login), the document says so and uses NWEA's own public "RIT to Concepts Reference" (April 2025) and the "MAP Growth Grades 2-5 to Khan Academy" correlation (September 2020) as the authoritative proxies, cross-checked with IXL's published skill plans.

---

## Part 1. MAP Growth test structure (K-2 and 2-5)

**The two tests share one vertical RIT scale (100 to 350) and the same Rasch 1PL IRT model, but the item pools, interfaces, and content blueprints differ.** Both are computer-adaptive, untimed, and can be given up to four times per year. The K-2 test is shorter, lighter on text, and has built-in professional voice audio on every item. The 2-5 test is longer, text-heavier, and treats audio as an optional designated feature rather than a default.

### K-2 Mathematics Growth test
**43 scored items** plus embedded field-test items, approximately **6 to 8 items per instructional area**, **25 to 40 minutes**. All items include at least audio on the stem; most K-2 items are fully audio-narrated by a professional voice. Interface is image-rich and interaction-rich (drag and drop, click, counters, ten-frames). No calculator. No screen reader or refreshable braille support at K-2 (those features exist only for grades 2 through 12).

Four instructional areas and sub-areas on MATH K-2 CCSS 2010 V2:
1. Operations and Algebraic Thinking (Represent and Solve Problems; Properties of Operations)
2. Number and Operations (Understand Place Value, Counting, and Cardinality; Number and Operations: Base Ten and Fractions)
3. Measurement and Data (Solve Problems Involving Measurement; Represent and Interpret Data)
4. Geometry (Reason with Shapes and Their Attributes)

### K-2 Screening and Skills Checklists (separate products from Growth)
**Early Numeracy screener:** a single 34-item fixed form (about 30 minutes) covering rote counting, one-to-one correspondence (1-10, 11-20), matching and identifying numerals, identifying more or fewer, computation with manipulatives, computation with a numerical answer.

**Skills Checklists:** individual fixed-form diagnostics, not on the RIT scale. Counts in parentheses are item totals.
- Number Sense to 10: Counting, Ordering, Place Value (35); Identifying/Representing (38)
- Number Sense to 20: Counting, Place Value (27); Ordering (32); Identifying/Representing (38)
- Number Sense to 100: Place Value (22); Counting (23); Ordering (27); Identifying/Representing (38)
- Number Sense to 1000: Place Value (23); Counting (26); Identifying/Representing (34); Ordering (37)
- Computation to 10: Problem Solving (12); Using Manipulatives (22); Using Numbers (27)
- Computation to 20: Problem Solving (12); Using Manipulatives (22); Using Numbers (27)
- Computation to 100: With Regrouping Using Manipulatives (22); No Regrouping Using Manipulatives (22); No Regrouping Problem Solving (27); No Regrouping Using Numbers (37); With Regrouping Using Numbers (37); With Regrouping Problem Solving/Estimation (39)
- Computation to 1000: Using Manipulatives (22); Using Numbers (23); Problem Solving and Estimation (34)

### 2-5 Mathematics Growth test
**43 scored items** plus embedded field-test items (NWEA's NCII submission states 49 to 52 total items including field test), **45 to 55 minutes**. Four instructional areas:
1. Operations and Algebraic Thinking (Represent and Solve Problems; Analyze Patterns and Relationships)
2. Number and Operations (Understand Place Value, Counting, and Cardinality; Number and Operations in Base Ten; Number and Operations Fractions)
3. Measurement and Data (Geometric Measurement and Problem Solving; Represent and Interpret Data)
4. Geometry (Reason with Shapes, Attributes, and Coordinate Plane)

Calculator is not available by default at 2-5. The calculator icon appears only on specific items authored to permit it, and the test uses a Desmos calculator. For accommodations (IEP or 504), a basic Desmos calculator is available.

### Adaptive testing algorithm (CAT)
MAP Growth uses a **Rasch 1PL model** for item calibration. Each item has a single difficulty parameter b on the RIT scale. After every response the system updates an achievement estimate and selects the next item whose difficulty is close to that estimate, targeting roughly 50% expected probability correct. Items are drawn from a large pool (over 42,000 items across subjects in 2019, over 50,000 in later NCII filings), and selection is constrained by the blueprint so that the student hits the target number of items per instructional area.

Scoring inside the test is Bayesian (to damp early swings by combining prior information with responses), and the **final RIT is computed at completion using Maximum Likelihood Estimation** based only on the student's responses, not the prior. The stopping rule is SEM-based: the test ends when the standard error around θ drops below a target, typically hit near the 43-item mark.

Initial item difficulty is derived from (a) the student's grade on a first administration, or (b) the student's previous RIT on later administrations. Items require about 2,000 field-test responses before they become operational.

In 2024 to 2025 NWEA released an **Enhanced Item-Selection Algorithm (EISA)** that biases selection toward grade-level content. The 2025 norms (published August 2025) partly reflect EISA. Districts are transitioning from 2020 to 2025 norms across SY 25-26.

### Test versions and naming
A test's name encodes its subject, grade band, standards set, standards year, and version number. Examples: `MATH K-2 CCSS 2010 V2`, `Growth: Math 6+ NWEA 2017`, `Growth: High School Integrated Math 3 NWEA 2025 1.1`. State-specific alignments exist for TEKS, Florida, Virginia SOL, and others. The generic `NWEA 2017` and newer `NWEA 2025 1.1` builds align content to NWEA's own topic taxonomy rather than to a particular state's standards.

---

## Part 2. RIT-to-grade-level norms and practice-mode calibration

### 2020 Math Status Norms (mean RIT and SD by grade and season)

| Grade | Fall mean | Fall SD | Winter mean | Winter SD | Spring mean | Spring SD |
|-------|-----------|---------|-------------|-----------|-------------|-----------|
| K     | 139.56    | 12.45   | 150.13      | 11.94     | 157.11      | 12.03     |
| 1     | 160.05    | 12.43   | 170.18      | 12.59     | 176.40      | 13.18     |
| 2     | 175.04    | 12.98   | 184.07      | 13.01     | 189.42      | 13.44     |
| 3     | 188.48    | 13.45   | 196.23      | 13.64     | 201.08      | 14.11     |
| 4     | 199.55    | 14.40   | 206.05      | 14.90     | 210.51      | 15.56     |
| 5     | 209.13    | 15.19   | 214.70      | 15.88     | 218.75      | 16.70     |

Approximate 20th to 80th percentile range (roughly ±1 SD around the mean) for each grade, Spring:
- K: **145 to 169**
- Grade 1: **163 to 190**
- Grade 2: **176 to 203**
- Grade 3: **187 to 215**
- Grade 4: **195 to 226**
- Grade 5: **202 to 235**

These ranges are the most useful anchor for practice-mode difficulty defaults. A typical Grade 5 spring student sits near RIT 219, so the practice mode should default a Grade 5 learner's initial θ to approximately the **211 to 220** band and pull items from the 200 to 230 pool.

### Grade 2 K-2 vs 2-5 crossover rules
NWEA's 2020 grade-level test guidance uses bright-line thresholds:
- Default: K and 1 take K-2; 2 through 5 take 2-5.
- If a student previously scored **170 or lower on 2-5 Math**, switch down to K-2.
- If a student previously scored **200 or higher on K-2 Math**, switch up to 2-5.
- (For reading: 170 down, 190 up.)

The psychometric justification: the K-2 percent-correct curve inflects near RIT 190 and SEMs grow beyond 190; the 2-5 test has better measurement precision for struggling students down to roughly RIT 170. Build your practice-mode test selector to respect this rule when students span both pools.

### 2025 norms note
The 2025 MAP Growth Achievement and Growth Norms (August 2025) are the current standard for new deployments. The 2025 norms reflect EISA, post-COVID shifts, and demographic changes. Use the 2020 numbers above for initial calibration if 2025 data is not yet available to you; then swap in 2025 values when Tim's district publishes them.

---

## Part 3. NWEA Learning Continuum skill catalog by RIT band and domain

**Caveat on sourcing.** The in-product verbatim Learning Statements are behind the NWEA login at start.mapnwea.org and are restricted by Terms of Use. NWEA's public companions are the "RIT to Concepts Reference" (April 2025) for grades 2 and up, the "RIT to Concepts Reference for K-2" (April 2025), and the "MAP Growth Grades 2-5 to Khan Academy" correlation (September 2020). The lists below reconstruct each band's skills from those public sources, cross-checked with IXL's MAP skill plans. For fully verbatim Learning Statements, Tim should export the Learning Continuum PDF from his Instructor or Administrator account. **The statements below are faithful to NWEA's concept wording** but are not the exact in-product sentences.

Four-domain shorthand: **OA** = Operations and Algebraic Thinking, **NO** = Number and Operations, **MD** = Measurement and Data, **G** = Geometry.

### RIT 141 to 150 (typical K mid-year)
**OA.** Addition with objects; composes a number; one more. Commutative property of addition (informal). Represents put-together and total situations. Compares quantities; identifies a sum.
**NO.** Identifies equal quantities; identifies the fewest; identifies the largest; identifies less than; identifies the smallest. Uses a hundreds chart to locate small numbers. Counts forward, backward, rote counts to 20.
**MD.** Reads simple single-unit bar graphs; reads a table or chart. Measures length with inches using a ruler. Uses language of length, height, and width.
**G.** Identifies flat (two-dimensional) shapes, including circles, rectangles, squares, and triangles. Uses positional words (over, on top of).

### RIT 151 to 160 (typical K spring / Grade 1 fall)
**OA.** Subtracts with objects; identifies difference. Identifies addend, equation, expression. Represents take-apart and multi-step word problems. Writes or identifies number sentences.
**NO.** Identifies fewer; counts forward and backward. Groups into tens; writes tens and ones up to 20. Composes and decomposes numbers within 20.
**MD.** Represents data on a simple graph. Measures length with centimeters. Tells time to the hour.
**G.** Identifies fourths and halves (equal parts). Identifies hexagon, octagon, parallelogram, pentagon, rhombus, trapezoid. Identifies a corner (vertex) and a face on a solid. Uses positional words (next to, beside).

### RIT 161 to 170 (typical Grade 1 / Grade 2 fall)
**OA.** Addition and subtraction within 20; identifies addend, digit, difference, subtrahend. Interprets arrays as repeated addition. Writes equations and expressions. Solves start-change-end word problems with an unknown.
**NO.** Adds and subtracts two-digit numbers without regrouping; finds ten more or ten less. Fills in a missing number on a number line. Composes a three-digit number; uses a hundreds chart to 200; identifies digit, hundreds, ones, tens.
**MD.** Reads single-unit-scale bar graphs; creates a pictograph. Estimates and measures length. Identifies whole-dollar amounts, coins, and the dollar sign. Finds the perimeter (counting sides) of a rectangle. Solves one-step measurement word problems in customary units. Tells time to the hour. Introduces decimals (money), angle measurement, and area informally.
**G.** Identifies equal parts, halves, one-half, whole. Identifies polygon, side, open or closed shape. Identifies a solid; identifies a sphere. Composes and decomposes shapes.

### RIT 171 to 180 (typical Grade 2)
**OA.** Solves multi-step word problems with an unknown start; estimates to solve. Uses a symbol for the unknown; writes simple numerical expressions.
**NO.** Subtracts with regrouping; finds ten less. Uses symbols to compare. Rounds to the nearest 10 and 100; estimates sums and differences. Identifies equivalent fractions informally; uses model, numerator, denominator, fraction vocabulary. Uses identity property of addition. Identifies even and odd numbers.
**MD.** Names values of bills; counts equivalent coins and collections of coins. Measures with non-standard units. Reads analog clocks to the half hour, quarter hour, and five minutes; identifies a.m. and p.m. Introduces conversion of units, coordinate geometry, decimal word problems, and probability informally.
**G.** Identifies edge, vertex, faces on 3-D shapes. Identifies lines of symmetry; identifies solids beyond the basic six.

### RIT 181 to 190 (typical Grade 2 end / Grade 3 start)
**OA.** Multiplication facts (introductory through 10 times 10); inverse operation (multiplication and division). Identifies product. Writes equations with unknowns. Arrays to model multiplication.
**NO.** Finds 100 more and 100 less. Identifies partitioned shapes and unit fractions; identifies one-fourth, thirds. Introduces mixed numbers. Writes numbers in expanded form; identifies place value up to millions; identifies multiples.
**MD.** Finds the area of a gridded rectangle in unit squares. Measures in customary units (inch, foot, yard) and metric units (cm, m). Solves elapsed time problems; a.m. / p.m. Uses charts, tables, scatter plots, and introductory coordinates. Introduces decimal multiplication and division, bivariate data, rates, ratios, and percents informally.
**G.** Identifies quadrilaterals by attributes. Identifies acute angle, obtuse angle, right angle, parallel lines; uses a protractor; identifies degree.

### RIT 191 to 200 (typical Grade 3)
**OA.** Interprets products as equal groups and as arrays; interprets quotients; uses multiplication and division within 100 to solve one- and two-step word problems; finds unknowns in multiplication or division equations. Applies commutative, associative, and distributive properties. Fluently multiplies and divides within 100 (facts through 10). Interprets two-step problems with letters for unknowns; estimates reasonableness. Identifies arithmetic patterns in addition and multiplication tables; extends number and shape patterns; odd and even patterns.
**NO.** Rounds whole numbers to the nearest 10 and 100. Fluently adds and subtracts within 1,000 using place-value strategies. Multiplies one-digit whole numbers by multiples of 10 up to 90. Understands a fraction 1/b as 1 part of b equal parts; identifies unit fractions; identifies numerator and denominator; recognizes fractions greater than 1. Places fractions on a number line; identifies equivalent fraction models and fractions on the number line. Compares fractions with the same numerator or the same denominator; compares fractions of different wholes visually. Writes whole numbers as fractions.
**MD.** Tells and writes time to the nearest minute; solves time-interval word problems on a number line. Measures and estimates liquid volume (g, kg, L, mL). Finds area by counting unit squares, including partial squares; relates area to multiplication and addition; decomposes figures to find area; finds missing sides from area; applies the distributive property to area. Solves perimeter problems, including missing sides. Reads and creates scaled bar graphs and pictographs; solves one- and two-step comparison problems. Generates measurement data with halves and fourths of an inch and displays on a line plot. Introduces dot plots and likelihood vocabulary.
**G.** Understands that shapes in different categories (rhombus, rectangle, etc.) can share attributes that define larger categories (quadrilaterals). Partitions shapes into equal-area parts; expresses each part as a unit fraction. Identifies triangles, points, lines, line segments, and rays.

### RIT 201 to 210 (typical Grade 3 end / Grade 4)
**OA.** Interprets multiplication equations as comparisons; represents multiplicative comparison word problems with symbols for unknowns; distinguishes multiplicative from additive comparison. Solves multi-step word problems with the four operations, including remainders that must be interpreted; assesses reasonableness using estimation and rounding. Finds factor pairs within 1 to 100; distinguishes prime and composite; identifies multiples. Generates number and shape patterns from a rule; identifies non-explicit pattern features.
**NO.** Recognizes the 10-times relationship between adjacent place values. Reads, writes, and compares multi-digit whole numbers in standard, word, and expanded form. Rounds multi-digit whole numbers to any place. Fluently adds and subtracts multi-digit whole numbers using the standard algorithm. Multiplies whole numbers of up to four digits by one-digit, and two-digit by two-digit, using place-value strategies and area models. Divides up to four-digit dividends by one-digit divisors with and without remainders. Explains equivalent fractions a/b = (n×a)/(n×b). Compares fractions with unlike numerators and denominators using common denominators, common numerators, or benchmarks. Adds and subtracts fractions and mixed numbers with like denominators (with and without regrouping). Decomposes fractions into sums with the same denominator. Multiplies fractions by whole numbers. Converts fractions with denominator 10 or 100; uses decimal notation for tenths and hundredths. Compares decimals to hundredths. Introduces rate and simplify.
**MD.** Knows relative sizes of metric and customary units (km, m, cm; kg, g; lb, oz; L, mL; hr, min, sec). Converts larger to smaller units within a system. Estimates length, mass, time, and volume. Solves multi-step word problems involving distance, time, liquid volume, mass, and money, including with simple fractions or decimals. Applies area and perimeter formulas for rectangles. Recognizes angles as geometric shapes; measures angles in whole-number degrees using a protractor; sketches angles of specified measure; uses angle measure as additive. Makes line plots with data in 1/2, 1/4, 1/8 units; solves fraction operations from line plots. Introduces mean, median, mode, outliers.
**G.** Draws and identifies points, lines, line segments, rays, and angles (right, acute, obtuse). Identifies parallel and perpendicular lines. Classifies two-dimensional figures based on lines and angles; identifies triangles by angles and by side lengths (scalene, isosceles, equilateral). Classifies quadrilateral types. Recognizes and draws lines of symmetry. Introduces nets of 3-D figures and scale factor for similarity.

### RIT 211 to 220 (typical Grade 4 end / Grade 5)
**OA.** Uses parentheses, brackets, and braces in numerical expressions and evaluates them. Writes simple expressions that record calculations; interprets numerical expressions without evaluating. Generates two numerical patterns from two rules; identifies relationships between corresponding terms; forms and graphs ordered pairs on the coordinate plane. Identifies a rule for a pattern or sequence.
**NO.** Recognizes the 10-times and 1/10 relationship across place values. Explains patterns in the number of zeros when multiplying by powers of 10, and patterns in the decimal point when multiplying or dividing decimals by powers of 10; uses whole-number exponents for powers of 10. Reads, writes, and compares decimals to thousandths. Rounds decimals to any place. Fluently multiplies multi-digit whole numbers using the standard algorithm. Finds whole-number quotients with up to four-digit dividends and two-digit divisors. Adds, subtracts, multiplies, and divides decimals to hundredths. Adds and subtracts fractions with unlike denominators, including mixed numbers. Interprets a fraction as division of the numerator by the denominator. Multiplies a fraction (or whole number) by a fraction; interprets multiplication as scaling (resizing). Solves real-world problems multiplying fractions and mixed numbers. Divides unit fractions by whole numbers and whole numbers by unit fractions. Introduces improper fractions, mixed numbers, and reasonableness.
**MD.** Converts among standard units within a system; solves multi-step real-world conversion problems. Recognizes volume as an attribute of solid figures; measures volumes by counting unit cubes. Applies V = l × w × h and V = b × h for right rectangular prisms; decomposes solids to find volume. Makes line plots in fractions of a unit and uses fraction operations to solve problems from the plot. Introduces box plot, quartiles, range, outliers.
**G.** Uses perpendicular number lines as axes to define a coordinate system; identifies coordinates; graphs points in the first quadrant; interprets coordinate values in context. Finds distance between points with a shared coordinate. Classifies two-dimensional figures in an attribute hierarchy. Introduces reflection, rotation, translation; perpendicular, complementary, supplementary angles; vertical angles; diameter, radius.

### RIT 221 to 230 (typical Grade 5 end / Grade 6)
Content transitions into Math 6+ strands. Mapped to the four requested domains:
**OA (Expressions and Equations).** Writes and evaluates numerical expressions with whole-number exponents. Reads and writes expressions with letters for numbers. Applies properties to generate equivalent expressions (distributive with variables). Understands solving an equation as answering a question; uses substitution to test whether a value satisfies an equation or inequality. Models with one-step and two-step equations; translates and solves. Solves equations of the form x + p = q and px = q, including fractions and decimals. Writes inequalities of the form x > c or x < c. Interprets linear expressions. Finds mistakes in one- and two-step equations. Represents two quantities that vary together with an equation, a table, and a graph; distinguishes independent and dependent variables. Introduces slope, linear, standard form, system of equations, square root, base, power, scientific notation vocabulary.
**NO (The Real Number System; Ratios and Proportions).** Interprets and computes quotients of fractions; solves word problems dividing fractions by fractions. Fluently divides multi-digit numbers using the standard algorithm. Fluently performs all four operations with multi-digit decimals. Finds GCF of two whole numbers ≤ 100 and LCM of two whole numbers ≤ 12; uses the distributive property. Uses positive and negative numbers to describe opposing quantities. Understands rational numbers on a number line; compares and orders rational numbers. Adds, subtracts, multiplies, and divides rational numbers, including on the number line. Understands ratios and unit rates. Uses ratio and rate reasoning with tables, double number lines, and tape diagrams. Computes unit rates that include fractions. Introduces cube root and exponential form vocabulary.
**MD (Geometric Measurement; Statistics and Probability).** Finds the area of right triangles, other triangles, special quadrilaterals, and polygons by composing and decomposing. Finds the volume of a right rectangular prism with fractional edge lengths. Recognizes statistical questions. Summarizes distributions with dot plots, histograms, and box plots. Uses measures of center (median, mean) and variability (IQR, MAD). Uses random samples to draw inferences; makes and evaluates valid claims. Introduces experimental probability, theoretical probability, independent events, line of best fit, and parameters vocabulary.
**G.** Draws polygons on the coordinate plane given vertex coordinates; finds side lengths by subtracting coordinates. Represents 3-D figures using nets of rectangles and triangles and uses the nets to find surface area. Positions integers and other rational numbers on horizontal and vertical number lines; plots points on a coordinate plane. Describes cross-sections of right rectangular prisms and pyramids. Introduces exterior angle, interior angle, and transversal.

### RIT 231 to 240 (typical Grade 6 end through middle school)
Outside the primary K-5 scope but useful for high-Grade-5 ceiling items. Content extends to:
- Solve one- and two-variable linear equations, including variables on both sides; write, solve, and graph two-variable linear equations.
- Operate with exponents, square and cube roots, and scientific notation.
- Apply the Pythagorean theorem; use similarity and congruence; define transformations formally.
- Use proportional reasoning in percent problems (tax, tip, markup, discount, interest).
- Build and use scatter plots, two-way tables, and line of best fit; probabilities of compound events.

---

## Part 4. IXL skill plan alignment to MAP RIT bands

IXL publishes two overall skill plans (K-2 and 2-5) that map IXL skills to RIT bands. The 2019 published overall PDFs used bands **Less than 148 / 148-160 / 161-169 / 170-178 / 179-185 / 186-191** for K-2 and **179-185 / 186-191 / 192-197 / 198-202 / 203-207 / 208-212 / 213-216 / 216-219** for 2-5. The live interactive pages (2025 and later) have been rebinned to **Less than 145 / 145-158 / 159-167 / 168-175 / 176-182 / 183-188 / 189-194 / 195-200 / 201-205 / 206+**. The skill inventory is largely stable across both binnings; the band boundaries shift by a few RIT points. For Tim's purposes, align to the 10-point NWEA bands and use the IXL list at whichever IXL band most overlaps.

### K-2 plan, selected bands (IXL code in parentheses). Skill names are verbatim from IXL.

**Less than 148 / RIT 141-150.**
OA: Add two numbers - sums up to 5 (YAX); Add with pictures - sums up to 10 (KM7); Addition sentences up to 10: which model matches? (GBZ); Subtract - numbers up to 5 (6R6); Subtract with pictures - numbers up to 10 (5KG); Subtraction sentences up to 10: which model matches? (UFH).
NO: Count up - with numbers (BEC); Count forward - up to 10 (MFP); Complete a sequence - up to 10 (5A2); Count dots 0 to 20 (7T4); Count on ten frames - up to 20 (FTY); Represent numbers - up to 20 (HTQ); Count up - up to 20 (KYB); Count forward - up to 20 (VXC); Fewer and more - compare by counting (Y2E); Fewer and more - compare in a mixed group (7MY); Fewer, more, and same (FLW); Compare two numbers - up to 10 (Z62); Count tens and ones - up to 20 (JLP).
MD: Long and short (DGP); Tall and short (9KJ); Light and heavy (WWN); Holds more or less (9KH); Different (8U4); Same (H8J); Same and different (6XZ).
G: Inside and outside (DHH); Left, middle, and right (QC5); Top, middle, and bottom (2XE); Location in a grid (LD9); Above and below (9DZ); Beside and next to (5JY); Name the two-dimensional shape (MCW); Circles (ASA).

**148-160 / RIT 151-160.**
OA: Add two numbers - sums up to 10 (TCB); Make a number using addition - sums up to 10 (QJS); Turn words into an addition sentence - sums up to 10 (P5F); Addition word problems - sums up to 10 (KUH); Subtract - numbers up to 10 (X6Y); Make a number using subtraction - numbers up to 10 (WQ5); Turn words into a subtraction sentence - numbers up to 10 (9GF); Subtraction word problems - numbers up to 10 (QBY); Complete the addition sentence - make 10 (CB8); Complete the addition sentence - sums up to 10 (SAF); Complete the subtraction sentence - numbers up to 10 (YL7).
NO: Count to 100 (9PV); Skip-count by tens (W6M); Fewer and more - compare in a mixed group (7MY); Write tens and ones - up to 20 (FVP).
MD: Compare size, weight, and capacity (KGC); Classify and sort by shape (9UK); Classify and sort (RPB).
G: Above and below - find solid figures (5YQ); Beside and next to - find solid figures (YYL); Squares (2WP); Hexagons (ZQE); Select two-dimensional shapes (QRY); Flat and solid shapes (4X6); Name the three-dimensional shape (2FZ); Spheres (WHV); Cubes (FS7); Cones (CFP); Cylinders (HNK); Select three-dimensional shapes (QAV); Shapes of everyday objects I (ZRS); Shapes of everyday objects II (E2G).

**161-169 / RIT 161-170.**
OA: Adding zero (KZX); Adding 1 through Adding 9 (HRU, 5ZD, YJB, 5T3, ZPK, RGF, BVK, LTE, H8F); Addition facts - sums up to 10 (WUL); Make a number using addition - sums up to 10 (VSE); Addition word problems - sums up to 10 (P6D); Addition sentences for word problems - sums up to 10 (ZE8); Add doubles - with models (HRW); Add doubles (DFT); Subtract zero and all (PEQ); Subtracting 1 through 9 (HAQ, FP5, APQ, 7E7, U7E, 2S3, 62E, WMY, YYK); Subtraction facts up to 10 (EQK); Subtraction word problems up to 10 (7NL); Subtraction sentences for word problems up to 10 (R2J); Subtract doubles (LHZ); Addition and subtraction facts up to 10 (V7A); Addition sentences using number lines - sums up to 10 (UWW); Complete the addition sentence - sums up to 10 (N2N); Related addition facts (Y8Y); Complete the addition sentence - make ten (5MN); Subtraction sentences using number lines up to 10 (LRN); Related subtraction facts (XZB); Relate addition and subtraction sentences (DM2).
NO: Counting review up to 20 (QRF); Counting tens and ones up to 20 (GU6); Count on ten frames up to 40 (WTZ); Counting up to 100 (SUW); Counting tens and ones up to 99 (EAN); Counting on the hundred chart (XUD); Hundred chart (64Q); Writing numbers in words - convert words to digits (Y85); Add a one-digit number to a two-digit number - without regrouping (5VX); Regroup tens and ones - ways to make a number (FCJ); Regroup tens and ones (EWN); Add a one-digit number to a two-digit number - with regrouping (BF6).
MD: Compare objects: length and height (D7U); Match digital clocks and times (KKM); Which tally chart is correct? (XRL).
G: Select two-dimensional shapes (HV6); Count sides and corners (VUQ); Open and closed shapes (DBN); Two-dimensional and three-dimensional shapes (2NN).

**170-178 / RIT 171-180.**
OA: Ways to make a number - addition sentences up to 10 (K48); Addition sentences using number lines - sums up to 20 (LXW); Addition facts - sums up to 20 (6TM); Make a number using addition - sums up to 20 (UMX); Addition word problems - sums up to 20 (KY5); Addition sentences for word problems - sums up to 20 (N5N); Addition sentences: true or false? (AMQ); Addition sentences for word problems - one-digit plus two-digit numbers (5LZ); Add three numbers - word problems (Z7S); Make a number using subtraction up to 10 (RSR); Ways to make a number - subtraction sentences up to 10 (BTD); Ways to subtract from a number up to 10 (ZZD); Subtraction sentences using number lines up to 20 (MMS); Subtraction facts up to 20 (PV5); Make a number using subtraction up to 20 (JJS); Subtraction word problems up to 20 (9Q9); Subtraction sentences for word problems up to 20 (LJA); Subtraction sentences: true or false? (XRG); Addition and subtraction ways to make a number (Q8E); Addition and subtraction facts up to 20 (C78); Addition and subtraction word problems (VJR); Add using doubles plus one (XAY); Add using doubles minus one (FRN); Add three numbers - make ten (8B2); Add three numbers (RL2); Fact families (WD2).
NO: Compare numbers up to 100 using symbols (FU5); Place value models up to 20 (YPB); Write numbers as tens and ones up to 20 (5HL); Place value models up to 100 (5CG); Convert between tens and ones - multiples of 10 (VH7); Write numbers as tens and ones (7WF); Add three numbers - use doubles (2K8); Add two multiples of ten (EMK); Add a multiple of ten (LNL); Subtract multiples of 10 (9DD).
MD: Measure length with objects (GWG); Match analog clocks and times (5FJ); Match analog and digital clocks (7N3); Read clocks and write times (UJM).
G: Cubes and rectangular prisms (7HG); Select three-dimensional shapes (J8A); Count vertices, edges, and faces (Z42); Identify faces of three-dimensional shapes (RPX); Equal parts - halves and fourths (HVX); Halves and fourths (WVL).

**179-185 / RIT 181-185.**
OA: Addition word problems up to two digits (XAT); Write the addition sentence up to two digits (5FM); Subtraction word problems up to two digits (UFU); Write the subtraction sentence up to two digits (ZQH); Even or odd (54Z); Add doubles - complete the sentence (S46).
NO: Skip-counting by fives (VHG); Comparing numbers up to 1,000 (XF9); Writing numbers up to 100 in words - words to digits (2FT); Writing numbers up to 100 in words - digits to words (VPG); Place value models up to hundreds (PBX); Identify a digit up to the hundreds place (45U); Place value up to hundreds (BDF); Regroup tens and ones - ways to make a number (JKT); Regroup tens and ones (5LV); Convert to/from a number up to hundreds (HUX); Add zero (YEY); Add multiples of 10 (NPQ); Ways to make a number using addition (S5E); Add three or four numbers up to two digits (YTH, DP6); Subtract multiples of 10 (2Q6); Ways to make a number using subtraction (DTN).
MD: Number lines up to 100 (T6D); Number lines up to 1,000 (KFQ); Names and values of common coins (2QM); Count money up to $1 (DGK); Count money up to $5 (3R8); Equivalent amounts of money up to $1 (MGA); Exchanging money with pictures (VZD); Comparing groups of coins (FVT); Match clocks and times (36N, D9K, HKL); Read clocks and write times: hour and half hour (AQW); Read clocks and write times (K7F); A.M. or P.M. (EJV); Measure using an inch ruler (88A); Which customary unit of length is appropriate? (GKJ); Measure using a centimeter ruler (7WA); Which metric unit of length is appropriate? (SKH); Interpret tally charts (LBV); Interpret bar graphs II (8CH); Which bar graph is correct? (BMG).
G: Name the two-dimensional shape (2FK); Select two-dimensional shapes (DWL); Count sides and vertices (EAQ); Compare sides and vertices (G9N).

**186-191 / RIT 186-191.**
OA: Identify repeated addition in arrays: sums to 25 (EUS); Write addition sentences for arrays: sums to 25 (W8T); Add three or four numbers up to two digits, word problems (52T, YSX); Complete the addition sentence up to three digits (R5W); Complete the subtraction sentence up to three digits (MDY); Addition and subtraction word problems up to 100 (MEP); Related addition facts (YDX); Related subtraction facts (P6Y); Fact families (NSN).
NO: Add a two-digit and a one-digit number with and without regrouping (8BT, EZ7); Add two-digit numbers with and without regrouping (GLX, TX5); Complete the addition sentence up to two digits (CZK); Subtract a one-digit number from a two-digit number with and without regrouping (P85, L8D); Subtract two two-digit numbers with and without regrouping (TWE, R8C); Complete the subtraction sentence up to two digits (YWC); Add and subtract numbers up to 100 (JDT); Addition and subtraction - ways to make a number up to 100 (8WA); Writing numbers up to 1,000 in words (JKD, VPQ); Convert from expanded form up to hundreds (LG5); Add multiples of 100 (85Z); Add multiples of 10 or 100 (RCJ); Addition with three-digit numbers (ETW); Subtract multiples of 100 (2E2); Subtract multiples of 10 or 100 (VVM); Which sign makes the number sentence true (K7X).
MD: Add money up to $1 with word problems (6X3, ZWJ); Subtract money up to $1 with word problems (WH5, ME9); Add and subtract money up to $1 with word problems (LYC, N5Y); Purchases: do you have enough money (F62, W79); Which picture shows more up to $5 (39E); Least number of coins (QAP); How much more to make a dollar (V9L); Making change (LYP); Customary and metric units of length word problems (GSF, KJ5); Create line plots (F2U).
G: Count vertices, edges, and faces (X72); Compare vertices, edges, and faces (DPT); Identify faces of three-dimensional shapes (QSR); Identify shapes traced from solids (MRD); Equal parts (H5R); Halves, Thirds, Fourths (EZ2, EMA, V5Q).

### 2-5 plan, selected bands

**192-197 / RIT 191-200.**
OA: Add three numbers up to three digits each: word problems (NPU); Subtract numbers up to three digits word problems (K88); Count equal groups (9K7); Identify and write multiplication expressions for equal groups (9AE, V98); Relate addition and multiplication for equal groups (GGC); Identify and write multiplication expressions for arrays (HZL, 5FZ); Make arrays to model multiplication (PPR); Write multiplication sentences for number lines (NTV); Multiply by 0 through 10 (BGK, CRE, 94M, 38K, 5U6, Y9E, SX6, 9PT, SMR, SUH, 6YD); Divide by counting equal groups (UYK); Write and relate division sentences for groups and arrays (FSX, FTU, 8RW, XSK); Divide by 1 through 10 (VTL, ANU, PCL, QGT, C9M, 97S, D2F, CVD, RTB, YRG); Relate addition and multiplication (P74); Addition and subtraction patterns over increasing place values (5RG, VKD).
NO: Rounding - nearest ten or hundred only (Q65); Addition input/output tables: up to three digits (MUE); Add three numbers up to three digits each (GSY); Subtract numbers up to three digits (EHT); Subtraction input/output tables up to three digits (J9S); Rounding (KMD); Understand fractions: fraction bars (6JL); Understand fractions: area models (RTW); Show fractions: fraction bars (ZPW); Show fractions: area models (NLE); Match fractions to models: halves, thirds, fourths (Y55); Match unit fractions to models (CPK); Match fractions to models (YHL); Fractions of number lines: unit fractions and general (TBX, J8M); Identify unit fractions and fractions on number lines (JVC, AWH); Graph unit fractions and fractions on number lines (CBW, 7QM); Unit fractions: modeling and word problems (UV8, HM7); Fractions of a whole: modeling and word problems (9PU, BV7).
MD: Match clocks and times (LPT, L5U); Read clocks and write times (5ZQ); A.M. or P.M. (MUC); Write times (EQS); Measure using an inch ruler (LC2); Which metric unit of weight is appropriate (PTF); Perimeter of rectangles, rectilinear shapes, polygons (ZJT, 65Z, LLY); Perimeter: find the missing side (T2V); Perimeter word problems (CLD); Find the area of figures made of unit squares (FLQ); Select figures with a given area and two figures with the same area (XR6, 7GW); Create rectangles with a given area (V73); Find the area of rectangles with missing unit squares (KTN); Create bar graphs (RPF); Create pictographs (AVG).
G: Identify equal parts (FHY); Match unit fractions to models (CPK).

**198-202 / RIT 201-205.**
OA: Multiplication tables for 2-5 and 10; for 6-9; up to 10 with true/false, sorting, find-the-missing-factor, select-the-missing-factors (DW5, 87M, REN, ZEY, XT7, EEY, TZ7, X7N, PNV, 3K8, SUJ, FZA, WZA); Multiplication sentences up to 10: true or false (MTU); Squares up to 10 x 10 (GMM); Multiplication input/output tables (8CM); Multiplication word problems (9TA) and find the missing factor (F6C); Division facts for 2-5 and 10; for 6-9; up to 10 with true/false, sorting, find-the-missing-number, select-the-missing-numbers (2JB, YSD, XDN, U2C, DBB, KQR, M8T, MPV, CYJ, HE7, FPA); Division sentences up to 10: true or false (GMU); Division input/output tables (RK9); Division word problems (ECS); Addition, subtraction, multiplication, and division facts (7RF); Complete the four-operation sentence (N5U); Mixed facts true/false (6HS, WQT); Add, subtract, multiply, and divide (AZH); Four-operation word problems (X8W); Input/output rule discovery (D5U, 4Z8); Perform multiple operations with whole numbers (UKB); Two-step mixed operation word problems (SRL); Properties of multiplication (MPE); Distributive property: missing factor and multiply with (7VP, 6W7); Solve using properties of multiplication (YPF).
NO: Balance addition and subtraction equations up to three digits (7PE, MD8, 8VK); Multiply by a multiple of ten (MS6); Properties of addition (NY2); Solve using properties of addition (CGS); Graph smaller or larger fractions on a number line (2PH); Equivalent fractions: area models and number lines (ZJ2, HYM, JL8, WPQ); Identify and find equivalent fractions (7DA, WMX); Graph fractions equivalent to 1 (7BL); Select and find fractions equivalent to whole numbers (GKZ, KCE); Equivalent fractions with denominators of 10 and 100 (RB2); Write fractions in lowest terms (YM2); Compare fractions using models and number lines (MJ2, 38T); Graph and compare fractions with like numerators or denominators on number lines (63U, ZPD); Graph and compare fractions on number lines (6H5); Compare fractions (78D); Compare fractions in recipes (9BK).
MD: Find the area of rectangles and squares (8KJ); Area of rectangles: word problems (5HA); Area of complex figures (SGP); Relationship between area and perimeter I and II (ZWF, KNR); Use bar graphs to solve problems (BCJ); Create line plots with fractions (YUR).
G: Identify parallelograms, trapezoids, rectangles, rhombuses (V6L, 67A, 47T, ZSD); Classify quadrilaterals (CNJ).

**203-207 / RIT 206-210.**
OA: Add and subtract numbers up to five digits: word problems (ZPY, R9N); Compare numbers using multiplication (GGE); Prime and composite up to 20 (TNF); Identify factors (2S9); Make a repeating pattern (V68).
NO: Convert between standard and expanded form (M5V); Value of a digit (WLP); Place value review (B5N); Writing numbers up to 1,000 / 100,000 / 1,000,000 in words (DYA, 59H, SQQ, 2RZ, 5G4, 7WT); Rounding up to millions (E6V); Compare numbers up to 100,000 and up to 1,000,000 (DP2, 6Y2); Place value word problems (Z47); Add, subtract, and multiply multi-digit numbers including missing digits (RG2, VQH, D9R, ZMC, P5U, VP2, UXK, XEV); Multiplication facts to 12 (FW9); Multiply 1-digit by 2-, 3-, 4-digit (GDW, PPM); Distributive property in multiplication (US7, LXG); Mental add and subtract ending in zero (WEG); Equivalent fractions: area models and number lines (HYC, WQL); Compare fractions using models (7XF); Compare fractions (99U, U2K); Decompose fractions into unit fractions and multiple ways (XHG, UEW); Add, subtract, and combined like-denominator fraction work using number lines and in recipes (6QH, PDU, MJX, AVF, GAK, LYR).
MD: Which customary or metric unit is appropriate (YYA, FPM); Compare and convert customary units of length, weight, volume, mixed (A89, LJV, GAA, DRM); Customary conversion tables (LSP); Compare customary units by multiplying (8U7); Convert mixed customary units (U95); Compare and convert metric units of length, weight, volume, mixed (GZM, 7RC, FHV, UL5); Metric conversion tables (YTJ); Convert metric mixed units (YP2); Convert time units (VNU); Fractions of time units (M9F); Interpret and create line graphs (36B, QX2); Elapsed time word problems (VCC); Start and end times: multi-step problems (ZQP).
G: Lines, line segments, rays (9MK); Parallel, perpendicular, intersecting lines (8VQ); Identify parallelograms, trapezoids, rectangles, rhombuses (DJ9, 9MJ, GHH, KUU).

**208-212 / RIT 211-215.**
OA: Multiply 2-digit by 2-digit: word problems (GZG); Divide 2-digit by 1-digit: word problems and interpret remainders (QMT, 5WV); Divide larger numbers by 1-digit: word problems and remainders (DKK, J8D); Four-operation word problems and extra/missing info (QKS, X64); Multi-step word problems (EA9); Prime and composite up to 100 (L9R); Multiplication and division patterns over increasing place values (Y5K, Z5Y); Multiplication input/output tables (BEP); Use a rule to complete a number pattern (5P2).
NO: Estimate sums and differences word problems (VMD, SB9, QJY, GWS); Estimate products by 1-digit (WDG); Multiply 2-digit by 2-digit with complete-the-steps (XQ8, MLC); Divide 2-digit by 1-digit and larger by 1-digit (4T7, UFM, 5WV, GE8, 2UB, J8D); Choose numbers with a particular quotient (MYU); Add fractions with denominators of 10 and 100 (TZH); Multiply unit fractions and fractions by whole numbers using number lines, models, sorting, word problems (XKJ, 8J3, VGC, DSB, Q7B, X48, LX8); Multiply fractions and mixed numbers by whole numbers in recipes (7B3); Graph fractions as decimals on number lines (2N9); Convert fractions and mixed numbers to decimals, denominators of 10 and 100 (6P7); Convert decimals to fractions and mixed numbers (DBF); Compare decimals on number lines, general, with fractions (T2W, DY5, 8YG, TB7).
MD: Angles of 90, 180, 270, 360 degrees (UQV); Measure angles with a protractor (NCN); Estimate angle measurements (LUJ); Adjacent angles (VJY); Find area or missing side of a rectangle (9E6); Area between two rectangles (GY2); Relationship between area and perimeter (SKK); Area and perimeter word problems (LTP); Interpret and create line plots with fractions (G8K, GNT, QQB).
G: Acute, obtuse, and right triangles (7QK); Parallel sides in quadrilaterals (58M); Classify quadrilaterals (A6V); Identify, draw, and count lines of symmetry (9FD, SQF, MWS); Acute, right, obtuse, and straight angles (R5K).

**213-216 and 216-219 / RIT 216-225.**
OA: Multiply by 2-digit and three-or-more numbers: word problems (J95, 2AK); Divide 2-digit and 3-digit by 2-digit: word problems (AJW); Write numerical expressions: two operations (8ME); Add and subtract money word problems (DLC); Complete a table from a graph (2WL); Add, subtract, multiply, divide decimals in word problems (35U, 83A, Z2X); Evaluate numerical expressions (Z5N); Multiply and divide money word problems (U5L, 2RU); Complete a table for a two-variable relationship (NEK); Graph a two-variable relationship (QEH).
NO: Standard and expanded form of whole numbers and decimals (HU7, WTU, BLQ); Place value and decimal place value (83P, X8U, CTP); Round decimals (MPB); Multiply 2-digit by 2-, 3-, 4- digits and three or more numbers (9LX, LLJ, JHB, 9VQ, CKE, NSP, 7JG); Multiply by 3-digit numbers (NSP); Divide 2- and 3-digit by 2-digit (HMA); Add and subtract money (A8R); Fractions review (PCF); Fractions of a whole word problems (2VP); Add and subtract fractions with like and unlike denominators: models, word problems, 3+ fractions, mixed numbers, recipes (7YQ, 2BS, 45T, D9N, QA6, VSP, TCD, PBF, BFQ, FCA, FHD, FAA, 6BH, W9K, PSP); Decimal operations on number lines and with grids (R9T, FLL, J9Z, M9X); Multiply and divide by powers of 10 (DN2, H2N, GBS); Multiply a decimal by a power of ten and multi-digit whole number (DN2, PGM); Multiply three or more with decimal (ZNW); Multiply fractions, mixed numbers, scaling, word problems, recipes (QFQ, 69L, U2V, 2KU, HDJ, AT7, UAY, 8KV, 38Y, QH2, 9RF, S6B, 6Q4, G7W, P73, 5W6, QHN); Divide unit fractions by whole numbers, whole numbers by unit fractions, word problems (GXY, VDU, 3L9, FKT, G2N).
MD: Customary and metric compare and convert including mixed units and involving fractions (7E8, XST, 96B, 8DZ, 7HU, 8MZ, TM9, 27C, PJL, 7QS, WU8, WCM, E8E, DJC, LCG, 6LL); Area of squares and rectangles (E6B); Area and perimeter word problems (MHV); Volume of rectangular prisms made of unit cubes (WG8); Volume of irregular figures made of unit cubes (WCE); Volume of cubes and rectangular prisms (TFL); Create and interpret line plots with fractions (XBS); Interpret and create line graphs (UFX, KFZ).
G: Acute, obtuse, right triangles (N77); Scalene, isosceles, equilateral (R94); Classify triangles (C64); Parallel sides in quadrilaterals (AJV); Identify parallelograms, rectangles, rhombuses (AJB, XAE, C66); Classify quadrilaterals (6ZQ); Objects on and graph points on a coordinate plane (NTR, AST); Follow directions on a coordinate plane (XQR); Is it a polygon (ZH6).

For bands not shown here, consult the IXL plan directly; IXL structures are stable across newer printings.

---

## Part 5. Khan Academy and other platform correlations

### Khan Academy (NWEA's formal partner)
NWEA and Khan Academy co-built **MAP Accelerator**, which converts a student's MAP RIT into a personalized Khan Academy pathway aligned to Common Core. MAP Accelerator officially covers **grades 3 through 8** (Math), offering over 700 exercises, 7,500 practice problems, and over 1,125 videos and articles. NWEA also publishes a "MAP Growth Grades 2-5 to Khan Academy" PDF (Sept 2020) and a grades 6+ version. These documents list sub-goals by RIT band with CCSS codes.

The Khan correlation uses these RIT ranges for 2-5 math: **< 159, 159-175, 176-188, 189-200, 201-210, 211-217, 218-221, 222-226**. For each range, it maps sub-goals to specific Khan Academy exercise names. Representative mappings:
- **< 159 / 159-175**: early K-2 counting, addition and subtraction within 20, shape identification, simple measurement. Khan exercises: "Counting small numbers," "Compose and decompose within 10," "Add within 10," "Subtract within 10," "Identify shapes."
- **176-188 / RIT 181-190**: place value to hundreds, two-digit addition and subtraction with and without regrouping, unit fractions, simple area, equal parts. Khan: "Regrouping with hundreds, tens, and ones," "Adding 2-digit numbers with regrouping," "Unit fractions on the number line," "Count unit squares to find area."
- **189-200 / RIT 191-200**: the Grade 3 core (multiplication and division within 100, fractions on a number line, equivalent fractions, scaled bar graphs, area by tiling). Khan: "Multiply within 100," "Divide within 100," "Fractions on the number line," "Equivalent fraction models," "Area and perimeter," "Scaled bar graphs."
- **201-210 / RIT 201-210**: multi-digit arithmetic, rounding to any place, equivalent fractions a/b = n×a/n×b, tenths and hundredths as decimals, angle measurement, classify shapes by lines and angles. Khan: "Round to nearest 10 or 100," "Multi-digit multiplication," "Decimal fractions," "Compare decimals," "Classify shapes," "Measure angles with a protractor."
- **211-217 and 218-221 / RIT 211-220**: decimal operations, fraction addition and subtraction with unlike denominators, multiplication of fractions, volume, coordinate plane quadrant 1. Khan: "Add and subtract fractions with unlike denominators," "Multiply fractions and mixed numbers," "Volume of a rectangular prism," "Coordinate plane word problems."
- **222-226 / RIT 221-230**: ratios and rates, division of fractions, integer operations, signed rational numbers, area of triangles and quadrilaterals by decomposition. Khan: "Intro to ratios," "Dividing fractions word problems," "Adding negative numbers on the number line," "Area of triangles."

### Other platforms, quick-reference
- **DreamBox Learning Math Assignments: NWEA** is the second formal RIT-band integration. Teachers enter a student's MAP RIT and a domain; DreamBox assigns lessons aligned to the 10-point band for up to 10 weeks. No bulk import; per-student entry only.
- **Imagine Math (MyPath), IXL, Lexia Core5, Edmentum Exact Path, Classworks, HMH Performance Suite** are NWEA "Instructional Connections" partners that ingest RIT scores and produce personalized pathways. HMH published a formal RIT-to-Growth-Measure concordance in May 2024.
- **Prodigy Math** has no content-level RIT alignment; its 2020 to 2021 outcome study showed that higher Prodigy skill mastery was associated with marginally higher Spring MAP RIT after controlling for Fall RIT and demographics.
- **Study Island / Edmentum** has no RIT-band content crosswalk, only efficacy research (Century Analytics, 2019) showing +1.1 to +4.4 RIT reading gains among students using the platform between Fall and Winter.
- **Pear Assessment (Edulastic)** offers a large standards-aligned item bank (20,000 to 30,000+ items) useful for building MAP-style practice tests, but its alignment is to Common Core and state standards rather than RIT bands.
- **TestingMom, TestPrep-Online, GiftedReady** are test-prep vendors, not formal NWEA partners. They organize K-8 practice by grade and RIT band. Useful as a source of sample items.
- **ST Math (MIND Education)** has no publicly documented RIT-band crosswalk.

### State DOE and district documents
State Departments of Education rarely publish direct MAP-to-state-standards crosswalks. The NWEA Learning Continuum itself embeds state-standard tags when a state-specific test is provisioned. The most useful public district PDFs are those at pvusd.net, rushville.k12.in.us, and asdb.az.gov, which archive legacy copies of NWEA's RIT to Concepts Reference.

---

## Part 6. Exhaustive item type and response mode catalog

MAP Growth uses a mix of multiple-choice items and technology-enhanced items (TEIs). **Accessible MAP Growth** (grades 6+) removes drag-and-drop, click-and-pop, and gap-match items for screen-reader users; K-2 currently has no accessible variant.

| Item type | UI interaction | Common domains | RIT prevalence | K-2 vs 2-5 | Accessibility notes |
|-----------|----------------|-----------------|----------------|------------|---------------------|
| Multiple choice (single) | 4 options, radio buttons (3 options with images in K-2) | All four | 111 to 260+ | K-2 uses big picture options; 2-5 uses text and numeric options | Fully compatible with TTS, screen readers, keyboard |
| Multiple select / click and pop | Checkboxes or image tags | G, NO, OA | 181 to 230 | Rare in K-2 | Removed from accessible variant |
| Numeric entry / fill-in | Text input, sometimes with unit | NO, OA, MD | 161 to 260 | K-2 uses manipulative supports; 2-5 uses keyboard | TTS-compatible; Notepad universal tool available |
| Drag-and-drop (order, bins, match) | Drag tiles into sequences, bins, or pairs | OA, NO, MD, G | 141 to 230 | Large image targets in K-2; numeric tiles in 2-5 | Pinch-zoom recommended on iPad; removed from accessible variant |
| Hot spot / click-on-image | Click region of an image | G, NO, MD | 131 to 220 | Heavy K-2 use (lower motor demand) | Removed from accessible variant |
| Number line plot | Drag a marker onto a number line | NO, MD | 131 to 230 | Integer lines in K-2; fractions and decimals in 2-5 | Zoom helpful; TTS reads instructions only |
| Table / matrix completion | Enter or drag into cells of a grid | OA, NO, MD | 151 to 230 | Hundreds-chart in K-2; function tables in 2-5 | Keyboard navigable |
| Graph interaction | Read or build bar graph, pictograph, line plot | MD, OA | 141 to 220 | Pictographs and single-unit bar graphs in K-2; multi-unit scale in 2-5 | WGBH image description guidance |
| Equation editor | Palette-based expression composer | OA (Algebra), NO | 211+ | Not used in K-2 | Braille support limited |
| Drawing tools | Click to draw partition lines or symmetry | G, NO | 151 to 210 | Partition shapes in K-2; draw quadrilaterals in 2-5 | Removed or replaced in accessible variant |
| Audio-supported | Volume icon triggers audio | All | 100 to 200 (K-2 default); TTS at 2+ | K-2 built-in; 2-5 optional | Spanish TTS for ELA, Math, Science |
| Manipulatives (counters, ten-frame, base-ten blocks) | Drag counters, move blocks | OA, NO | 111 to 170 (K-2 heavy) | K-2 dominant; 2-5 up to RIT 180 place-value | Drag-drop a11y issues; absent from accessible variant |
| Coordinate plane plotting | Drag or click to place (x, y) points | G, OA | 171 to 230 | Not K-2 | Keyboard grid navigation possible |
| Fraction models (area, set, number line) | Hot-spot or partition tool | NO, G, MD | 151 to 230 | Area models in K-2; add set and number line in 2-5 | TTS reads fraction names |

### Accessibility toolbox
**Universal embedded features** (automatic, no assignment): Zoom, Highlighter and Eraser (not on iPad or K-2), Line Reader, Notepad, Answer Eliminator, Calculator (Desmos; only on calculator-allowed items and allowed grades), Ruler and Protractor (appear when relevant), Keyboard Navigation.
**Designated / accommodation features** (proctor-enabled): Text-to-Speech (now universal for Math and Science), Amplification, magnification software (Windows Magnifier, Mac Zoom, ZoomText), human read-aloud, screen reader (JAWS) for accessible grades-6+ variant only, refreshable braille, extended time, scratch paper.

---

## Part 7. Sample items per band per domain

These samples illustrate the types and difficulty of items at each band. **NWEA does not release live operational items.** Every example below is drawn from (a) NWEA learning-continuum concept descriptors, (b) TestPrep-Online, TestingMom, or tests.school samples labeled with RIT bands, (c) Khan Academy Mappers exercises at the corresponding difficulty, or (d) teacher-authored TPT items. Use them as authoring templates, not as copy-paste content.

### RIT 161 to 170 (K end through Grade 2 fall)
**OA.** "7 + __ = 11" (numeric entry; answer 4); "3 rows of 4 stars: how many stars?" (MC 12/7/8/11; answer 12); "Pat had 9 apples, gave some away, now has 4: which equation?" (MC 9-?=4).
**NO.** "10, 20, 30, __, 50" (numeric entry; answer 40); "Ten more than 46 is __" (numeric entry; 56); "Which is greater: 58 or 85?" (hot spot; 85).
**MD.** "Which tool measures length of a pencil?" (MC ruler / clock / scale / thermometer); "Apples got 4 votes, bananas 6: how many more?" (MC 2/4/6/10; 2); "Kim has 3 dimes and 2 pennies, how much?" (MC 32¢).
**G.** "Which shape is divided into halves?" (hot spot); "How many sides does this hexagon have?" (numeric entry; 6); "Which solid is a sphere?" (MC with images).

### RIT 171 to 180 (Grade 2)
**OA.** "Tom bought 3 packs of 8 markers. Used 5. How many left?" (MC 19); "Estimate 29 + 48 by rounding each to nearest 10" (MC 80); "Which symbol makes 7 __ 3 = 21 true?" (MC x).
**NO.** "63 - 27" (numeric entry; 36); "Round 74 to the nearest 10" (MC 70); "Show 145 in expanded form" (MC 100+40+5).
**MD.** "Clock hands at 3:30" (MC 3:30); "3 quarters, 1 dime, 2 pennies, how much?" (numeric entry; 87¢); "How many paper clips long is the crayon?" (numeric entry; 4).
**G.** "A cube has how many edges?" (numeric entry; 12); "Which shows a line of symmetry?" (MC with images); "Which shape has 4 sides and 4 right angles?" (MC rectangle).

### RIT 181 to 190 (Grade 2 end / Grade 3 start)
**OA.** "Which fact matches a 4 × 6 array?" (MC 4×6=24); "If 8 × 5 = 40, what is 40 ÷ 5?" (numeric entry; 8); "6 × __ = 42" (numeric entry; 7).
**NO.** "Which model shows 1/4?" (hot spot); "Write 307 in expanded form" (MC 300+7); "100 more than 438 is __" (numeric entry; 538).
**MD.** "Rectangle is 3 by 4 unit squares: area?" (numeric entry; 12); "Movie 4:15 to 5:45: how long?" (MC 1 hr 30 min); "Which unit to measure a car?" (MC feet).
**G.** "4 sides and 4 angles: which is NOT?" (MC triangle); "Which shape is divided into thirds?" (hot spot); "Draw a line of symmetry on H" (drawing tool).

### RIT 191 to 200 (Grade 3)
**OA.** "9 × 0 = __" (numeric; 0); "36 students in 4 equal groups: how many per group?" (numeric; 9); "25 × 4" (MC 100).
**NO.** "Order from least to greatest: 2/3, 1/2, 3/4, 1/4" (drag-to-order; 1/4, 1/2, 2/3, 3/4); "475 + 368" (numeric; 843); "Plot mixed number on number line" (number-line plot; 2 1/2).
**MD.** "Sam had $1.00, pencil cost 45¢: change?" (numeric; 55¢); "Garden 8 by 5: perimeter?" (numeric; 26); "Line plot: how many plants above 4 in?" (MC; varies).
**G.** "Select all equilateral triangles" (multi-select); "Which shows 1/3 of apples circled?" (hot spot); "Faces on a rectangular prism?" (numeric; 6).

### RIT 201 to 210 (Grade 3 end / Grade 4)
**OA.** "3 × (4 + 2) - 5" (numeric; 13); "Rule: Add 6. Inputs 3, 7, 10. Outputs: 9, __, __" (table completion; 13, 16); "324 ÷ 4" (numeric; 81).
**NO.** "Plot 0.6 on number line" (plot); "Which fraction equals 3/5?" (MC; 6/10); "2.47 + 0.6" (numeric; 3.07).
**MD.** "12 ft × 9 ft area?" (numeric; 108); "2.5 km to meters" (numeric; 2,500); "Mean of 4, 6, 8, 10" (numeric; 7).
**G.** "Which triangle is scalene?" (MC with images); "Volume of 3×4×5 prism?" (numeric; 60); "A(2,5), B(2,1): distance?" (numeric; 4).

### RIT 211 to 220 (Grade 4 end / Grade 5)
**OA.** "Simplify 3(x + 4) - 2x" (equation editor / MC; x + 12); "At most 3 cups per day" inequality (MC; c ≤ 3); "4, 8, __, __ with rule ×2" (numeric; 16, 32).
**NO.** "1/2 × 3/4" (numeric; 3/8); "Which is greater: -4 or -9?" (MC; -4); "4² + 3²" (numeric; 25).
**MD.** "Box plot median?" (MC); "P(blue) with 3 red, 5 blue, 2 green?" (MC; 1/2); "Rectangle area 85.8 sq in, length 6.5 in: width?" (MC; 13.2).
**G.** "Circumference with r=7, π≈3.14" (numeric; 43.96); "Corresponding angle to 65°?" (numeric; 65); "Triangle with 45° and 60°: third angle?" (numeric; 75).

### RIT 221 to 230 (Grade 5 end / Grade 6)
**OA.** "2x + 5 = 17" (numeric; 6); "y = 3x + 2 at x = 4" (numeric; 14); "20% off $70 total" (MC; $56).
**NO.** "-5 + 8" (numeric; 3); "3/8 to decimal" (numeric; 0.375); "√144" (numeric; 12).
**MD.** "Histogram: which interval has highest frequency?" (MC); "P(two heads in two flips)" (numeric; 1/4); "Scatter plot best fit: positive or negative?" (MC).
**G.** "Area of triangle b=10, h=6" (numeric; 30); "Interior angle of regular hexagon?" (numeric; 120); "Surface area of 4×3×2 prism?" (numeric; 52).

---

## Part 8. Build recommendations for each response mode

### Shared architecture
Build one **`<ItemRenderer>`** component that switches on `item.item_type` and dispatches to a type-specific widget. Every widget accepts `{ item, value, onChange, disabled, onSubmit }`. Store every response as a typed JSON object so scoring is data-driven. Recommended core stack: **Next.js 15 (App Router) + React 18 + TypeScript**, with **Radix UI** primitives, **dnd-kit** for drag and drop, **MathLive** for equation entry, **KaTeX** for static math rendering, and **Zustand** + **TanStack Query** for state.

### Multiple choice and multi-select
Use native `<fieldset><legend>` with `<input type="radio">` for single-answer MC and `<input type="checkbox">` for multi-select, grouped inside `<label>` wrappers. Native radios give free keyboard support (arrow keys move within a group, Space selects). Target minimum 44 by 44 pixel hit area. Store responses as `{ type: "mc", choiceId }` or `{ type: "ms", choiceIds: [] }`. Include option letters (A, B, C, D) for verbal reference and TTS.

### Numeric entry
Use `<input type="text" inputMode="numeric" pattern="[0-9./-]*">` rather than `type="number"` (which blocks slash for fractions). For K-2, render a custom on-screen numpad (10 buttons, backspace, submit) since keyboard typing is distracting. Validate against a canonical `accepted_forms` array with a numeric tolerance. Parse fractions like "1/2" and normalize commas.

### Drag and drop
Use **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/accessibility`). It is actively maintained, TypeScript-first, much smaller than react-dnd, and has a built-in `KeyboardSensor` with announcement hooks. Do not use `react-beautiful-dnd` (deprecated) or rely on `aria-grabbed` (ARIA deprecated it and it is unreliable). Provide a parallel click-to-match or Move up / Move down interaction to satisfy WCAG 2.5.7 (Dragging Movements). Use `aria-live` announcements for pickup, movement, and drop.

Four common patterns:
1. **Number ordering**: `SortableContext` with horizontal strategy. Response `{ sequence: [...] }`.
2. **Sort into bins**: multiple `useDroppable` containers plus draggable tiles. Response `{ placements: { tile1: binA } }`.
3. **Matching pairs**: two columns, drag-from-left-to-right, or click-source-then-click-target as the more accessible alternative.
4. **Sequencing**: `SortableContext` with vertical strategy.

Touch support: set `activationConstraint: { distance: 8 }` on the PointerSensor to avoid accidental drags while scrolling.

### Number line click-to-plot
Inline SVG with a logical `viewBox`. Render tick marks with `<line>` plus `<text>` labels. Capture clicks on a transparent `<rect>` overlay; compute pixel x, convert to data space, snap to nearest tick (`Math.round(x / tickSpacing) * tickSpacing`). Snap granularity is a per-item setting (whole, halves, quarters, tenths). Give the SVG `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`. Keyboard: Left/Right arrow moves by snap unit; Home/End jumps to extremes.

### Fraction bar partitioning and shading
SVG rect split into N equal `<rect>` parts with `data-index`. Click toggles `fill`. For student-drawn partitioning, capture pointer x positions and compute implied segment count. Store `{ parts: 4, shaded: [0, 1] }`. Announce totals via `aria-live`: "2 of 4 parts shaded: that is one half."

### Ten-frame counter placement
SVG 5-by-2 grid of `<rect>` cells; click toggles counter. Store `{ filled: [0..4] }` or simply `{ count: 5 }`. Enforce left-to-right fill if pedagogically important. Offer a Clear button and aria-live count announcements.

### Hot spot / click on image
Overlay an invisible SVG with explicit polygons, rects, or circles on top of the raster image. Do not rely on pixel hit testing. Each region gets `role="button"`, `tabIndex={0}`, and `aria-label`. For single vs multi select, set `item.select_mode`. Always provide an image `alt` and labeled hotspots so screen reader users can still answer.

### Coordinate plane plotting
SVG with a `viewBox` where each unit is a fixed pixel span. Draw axes, tick labels, optional gridlines. Click overlay snaps to nearest lattice point. Store `{ points: [[x, y], ...] }`. For ordered shapes (like "draw a rectangle"), preserve vertex order. Keyboard: Tab focuses the grid; arrow keys move a cursor; Space places or removes a point. Use `role="application"` with instructions via `aria-describedby`.

### Equation editor
Use **MathLive** `<math-field>` web component with a restricted "K-5 keyboard" layer exposing digits, +, -, ×, ÷, /, decimal, parentheses, and exponent ^2. MathLive includes math-to-speech and Speech Rule Engine screen reader support. Evaluate answers by comparing MathJSON canonical form or by numeric evaluation through the Compute Engine. For K-2, use a simple numpad instead to save bundle size.

### Bar graph / pictograph builder
SVG categories on the x-axis; each bar is a draggable handle at its top, or use +/- buttons per bar (better for K-2). Pictograph: click a category to add an icon. Store `{ heights: { apples: 4 } }`. Announce every change via `aria-live`.

### Drawing tools
Use SVG paths, not Canvas, when the output must be geometrically validated (symmetry lines, partitioning). Canvas is appropriate for free-draw scribbles where pixels suffice. Capture `pointerdown/move/up` events; append to a polyline; snap endpoints to shape vertices. For symmetry validation, test whether the drawn line passes within a tolerance of a known axis; for partitioning, count resulting regions and compare to target. Offer a multiple-choice fallback ("Which of these is a line of symmetry?") for students who cannot draw.

### Audio-supported items
Two strategies: **pre-recorded audio** (`<audio>` with MP3 and a VTT caption track) for K-2 stems, and **Web Speech API** for dynamic feedback and hints. Pre-recorded wins on K-2 because OS TTS voices vary wildly across devices, especially iOS and older Android WebViews. Every item has a `tts_text` field with plain-language pronunciation ("one half" instead of "1/2") separate from the visual stem. Provide a prominent "Read this to me" speaker button.

### Manipulatives
Draggable counters or base-ten blocks as game objects. Use dnd-kit with free positioning (no sort context); track `x, y` per object. For base-ten blocks, create 3 or 4 types (unit, rod, flat, cube) and snap each to its appropriate lane (units column vs tens column). A double-click on a rod converts it to 10 units (regrouping). Also offer +/- buttons per block type as the cleanest mobile and keyboard UX.

---

## Part 9. Adaptive difficulty logic (simplified CAT)

### Rasch model primer
Each item has a difficulty `b` (in logits). Each student has an ability `θ`. Probability of a correct response: **P = exp(θ - b) / (1 + exp(θ - b))**. When θ = b, P = 0.5 (maximum Fisher information). NWEA's RIT is an affine transform of logits; for a practice app, work in logits internally and display either a RIT-like scale or your own "growth points" to avoid implying official RIT equivalence.

### Calibration
Best practice: pilot each item with 100+ responses, then calibrate using the R package **mirt** (`mirt(data, 1, itemtype = "Rasch")`) or Python **catsim**. Store `b` and its standard error per item. Flag items for review if INFIT or OUTFIT falls outside **0.7 to 1.3** (NWEA's operational threshold).

Pragmatic bootstrap: start with expert-rated 1-to-5 difficulty, mapped to logits −2, −1, 0, 1, 2. Refit every N responses using a proportion-correct approximation: b ≈ mean(θ of responders) − ln(p / (1 − p)) with p = proportion correct.

### Initial θ
Use grade-level priors from NWEA 2020 norms (Part 2 above). Store the student's last-session ending θ and use it as the prior for the next session.

### Item selection
Under Rasch, maximum Fisher information equals b-matching. For a calmer K-5 experience, aim for a **70% success rate** instead of 50% (Linacre Memo 69). Select items targeting `b = θ − 0.85` logits (since ln(0.7/0.3) ≈ 0.85). Enhance with (a) content balancing by domain (penalize items in a domain already seen this session) and (b) exposure control using randomesque: pick randomly from the top 5 items nearest the target.

### θ update (Newton-Raphson MLE, ~30 lines of TS)
```
for each response: P_i = sigmoid(θ - b_i)
θ_new = θ_old + Σ(u_i - P_i) / Σ(P_i × (1 - P_i))
iterate until |Δθ| < 0.001 or 20 iterations
SE(θ) = 1 / sqrt(Σ P_i × (1 - P_i))
```

Closed-form PROX fallback: `θ ≈ mean(b_used) + ln(R / W)` using R = R + 0.5 and W = W + 0.5 to avoid infinities.

### Stopping rules
For practice sessions: fixed length of 10 to 15 items for K-2, 20 to 25 for 3-5; or SE-based stop when `SE(θ) < 0.3` logits (roughly 3 RIT); or 15-minute cap; plus a minimum of 2 items per targeted domain.

### References
Wright (1988) "Practical Adaptive Testing"; Linacre (1995, 2006) on Bayesian CAT and stopping; Magis and Barrada (2017) `catR` in JSS; NWEA MAP Growth Technical Report 2019.

---

## Part 10. Data structures and accessibility checklist

### Skill catalog schema
```ts
interface Skill {
  skill_id: string;
  domain: "OA" | "NBT" | "NF" | "MD" | "G" | "CC";
  sub_domain: string;
  grade_band: "K" | "1" | "2" | "3" | "4" | "5";
  rit_band_low: number; rit_band_high: number;
  learning_statement: string;
  ccss_codes: string[];
  prerequisites: string[]; next_skills: string[];
  representations: ("concrete" | "representational" | "abstract")[];
}
```

### Item bank schema
```ts
interface Item {
  item_id: string; version: number; skill_id: string;
  item_type: ItemType;           // one of the 15 types in Part 6
  rit: number; b: number; se_b: number;
  infit?: number; outfit?: number; n_responses: number;
  dok: 1 | 2 | 3;
  content: {
    stem_text: string;
    stem_mathml?: string; stem_latex?: string;
    stem_image_url?: string;
    tts_text: string;
    options?: Array<{ id: string; text: string; misconception?: string }>;
    correct: any;
    assets?: { audio_url?: string; image_alt?: string };
  };
  scaffolds: {
    hints: Array<{ level: 1 | 2 | 3; text: string }>;
    worked_example?: { steps: Array<{ text: string; image_url?: string }> };
  };
  calculator_allowed: boolean;
  status: "draft" | "field_test" | "operational" | "retired";
  tags: string[]; locale: string;
}
```

### Student progress and session logs
Store overall RIT and SE, plus per-domain RIT and SE, plus per-skill mastery level, and a rolling misconception frequency map. Session table records starting RIT, ending RIT, items administered, and stop reason. Response log stores item_id, item version, item b, submitted response (typed JSON), correct flag, partial credit, time taken, hints used, TTS and calculator usage, and theta_before/theta_after. Index on `(student_id, timestamp)`, `(item_id)`, `(session_id)`. Partition the response log by month if volume grows past a few million rows.

### Scaffolding design
Every skill has Concrete-Representational-Abstract variants and a learner-controlled toggle. Default K-2 to representational and Grade 3-5 to abstract. Store 2 to 3 ordered hints per item (refocus attention, strategy, partial worked example). Show worked examples after two consecutive misses on the same skill. Tag every distractor with the misconception it represents, so wrong answers trigger error-specific remediation. Practice mode uses immediate feedback; "check-up mode" defers feedback to the end.

### Accessibility checklist (WCAG 2.1 AA target)
Minimum 4.5:1 text contrast, 3:1 UI contrast, never encode meaning with color alone. Support `prefers-reduced-motion` and `prefers-contrast: more`. Offer Atkinson Hyperlegible or Lexend as default with OpenDyslexic as opt-in. Every item supports TTS (pre-recorded for K-2, Web Speech API fallback elsewhere). Every drag and drop has a parallel keyboard-accessible alternative. Focus ring is 3 pixels, high-contrast. All actions reachable by keyboard with no traps. Status messages and mastery updates go through `aria-live`. KaTeX's default `htmlAndMathml` output gives screen readers MathML; always include a redundant plain-language `tts_text`.

### Tech stack summary
Frontend: Next.js 15 + React 18 + TypeScript, Radix UI, dnd-kit, MathLive, KaTeX, Zustand, TanStack Query. Backend: Node.js with Fastify or Next.js API routes, PostgreSQL with JSONB item content, Prisma or Drizzle ORM. Auth: Clerk or Auth.js with Google Classroom SSO. PWA: Workbox service worker caches app shell and pre-fetches a ~50-item batch on login; IndexedDB queues responses for BackgroundSync. Testing: Vitest for unit (validate CAT math against catR simulations), Playwright for E2E plus axe-core in CI. Deploy on Vercel (trivial for Next.js) or Render/Fly.io if co-locating Postgres. Remember FERPA and COPPA constraints: collect minimal PII, encrypt at rest, get district-level consent.

---

## Conclusion: what to build first

**Start with three things in this order.** First, ingest the 10-point Learning Continuum skill catalog in Part 3 as your content spine and tag every skill with CCSS codes, RIT range, and prerequisites, because every later decision depends on that spine. Second, build the six highest-value response-mode widgets (multiple choice, numeric entry, number-line plot, fraction shading, drag-to-order, ten-frame) before the long tail, because Parts 6 and 7 show that these cover roughly 80% of K-5 items across all bands. Third, implement the simplified Rasch CAT in Part 9 with a 70% target success rate and a domain-balancing constraint, because the right difficulty calibration is the single biggest lever on student engagement and measurement precision.

**Two calibration anchors matter most.** The **Grade 2 K-2 vs 2-5 crossover at RIT 170 and 200** should be encoded as a hard rule in your student-routing logic. And the **Spring 2020 grade-level mean RIT** (K ≈ 157, Grade 1 ≈ 176, Grade 2 ≈ 189, Grade 3 ≈ 201, Grade 4 ≈ 211, Grade 5 ≈ 219) should seed the initial θ for every new student based on enrolled grade and current season.

**Where the public record is thin.** The in-product verbatim Learning Statements are behind NWEA login; the concept-level reconstructions in Part 3 are faithful but not copyright-safe for direct re-publication. For Tim's internal use (authoring items, tagging skills) this is fine. If the practice mode ever becomes public-facing, replace the Learning-Statement wording with Tim's own paraphrased learning objectives tied to CCSS codes, and use the IXL and Khan correlations in Parts 4 and 5 to confirm skill coverage without redistributing NWEA's proprietary sentences.

**Two quick wins worth prototyping this month.** First, a **number-line widget** that handles integers, halves and fourths, tenths and hundredths, and negatives with one configurable `snapGranularity` prop; this single widget covers a huge swath of NO and MD items from RIT 161 to 230. Second, a **domain dashboard** that shows, per student, the estimated RIT per domain with SE, color-coded against grade-level expectations, because this is the single teacher-facing artifact Tim will use most often and is straightforward to build once the response log is in place.