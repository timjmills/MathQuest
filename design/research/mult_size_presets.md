# Research: the multiplication size-pair presets (lf-ops, phase 1, 2026-11-20)

Lead request 2026-11-19: add the missing size-pair PRESET skills of multiplication, each with its own lesson.
Card: `design/cards/mult-sizes/mult-sizes.md` (unsigned). Public pages only (no logins on this machine).

## 1. What the reference sites do

| Source (public) | What it shows |
|---|---|
| Math-Drills, long multiplication (`math-drills.com/multiplication2.php`) | Standard algorithm by size class: 2×1, 2×2, 3×1, 3×2, 3×3, then 4×1 … 4×4. Each class is its own page set; a grid-support version (digit grid with or without regrouping boxes) for every class from 2×1. A "distributive property" set (split by place value = the area model's partial products) in 2×1, 3×1, **4×1**, 5×1, 2×2, **3×2**. Lattice from 2×2. |
| MathWorksheets4Kids (public index; the area-model page URL 404s without login) | Area / box model by size: 2×1, 3×1, 4×1 (one row of four boxes), 2×2, 3×2 grids; partial products blank in the boxes and an "add the partial products" line; versions with the place-value split given and with it blank. |
| K5 Learning grade 4 / 5 multiplication (index pages only reachable) | Grade 4: "multiply 4-digit by 1-digit", "2-digit by 2-digit"; Grade 5: "3-digit by 2-digit", in columns; separate "partial products" pages. |
| IXL (no login: skill names only) | Grade 4 "Multiply 4-digit numbers by 1-digit numbers", "Multiply 2-digit numbers by 2-digit numbers: complete the missing steps / using area models"; Grade 5 "Multiply 3-digit numbers by 2-digit numbers", "… using area models". Response: type the product; the area-model items type each partial product, then the sum. |
| White Rose Y5 B5 (repo: `data/curriculum/wrm-steps.json`) | S1 Multiply up to a 4-digit number by a 1-digit number; S2 2-digit × 2-digit (area model); S3 2-digit × 2-digit (column); S4 3-digit × 2-digit; S5 4-digit × 2-digit. |

Every source treats each size class as its own page set and its own lesson: the size IS the lesson. That confirms the
owner rule (a distinct new difficulty is also a findable skill).

The standards outrank the sites on layout: we keep one boxed cell per problem, B&W, Andika, our densities (sites put
12–20 long-multiplication items on a page; we fit 3–6).

## 2. Per preset (CLAUDE.md research questions 6–11)

### `area_model_4by1` — Area Model: Multiply 4-Digit by 1-Digit (host `area_model_mult`)
- **One new thing** vs `area_model_3by1`: a fourth part (the thousands), so four partial products to add. Nothing else
  changes (multiplier 2–6 like the 3×1 item, same box shape).
- **Scaffolds:** structural (stay): the four part boxes, the edge labels, the work row of four partial products and the
  total box. Hint (fades): the given place-value split along the top edge (`edges` option), the traced first partial.
- **Response:** four partial products and the total, numbers in boxes. Same on screen.
- **Say:** "3,456 is 3,000 and 400 and 50 and 6. 7 times each part, then I add the parts."
- **Misconceptions:** writes 3 × 7 = 21 in the thousands box (drops the zeros: 21 not 21,000); adds the partial
  products in the wrong places (misaligns 21,000 + 2,800); splits 3,045 into three parts and forgets the zero hundreds
  (or draws an empty 0 box and writes 7 in it); forgets to add one part.
- **Fit:** measured (kit `area-model` footprint): 128 mm wide at M, 159 mm at L (3×1 is 100 / 124 mm). One column at both
  sizes, as 3×1 already is; 63 / 74 mm tall → 3 per page at M and L. Fits; no squeeze.
- **Option:** NEW value `tiles: 41` ("4-digit × 1-digit (7 × 3,456)") on `area_model_mult`. The generator branch adds a
  `4digit` type (thousands 1–9, multiplier 2–6; zero digits from the O2 ladder later). The "both sizes, dealt" default
  is unchanged (it must not start dealing 4-digit items: lesson baselines).

### `mult_4by1_column` — Multiply 4-Digit by 1-Digit Numbers (Column) (host `multiply`)
- **One new thing** vs `mult_3by1_column`: one more column, so a carry can run into the thousands and the product can
  reach five digits (a new ten-thousands place).
- **Scaffolds:** structural: digit tracks, carry boxes over the columns, the answer strip. Hint: the traced first digit.
- **Response:** the product's digits in the strip (carries in their boxes, ungraded). Same on screen.
- **Say:** "7 times 6 is 42. I write 2 and carry 4. 7 times 5 is 35, and 4 is 39 …"
- **Misconceptions:** forgets the last carry (no ten-thousands digit: 3,456 × 7 = 4,192 for 24,192); adds the carry
  before multiplying (M7); multiplies a zero digit as 1 (3,045 × 6); carries into the wrong column.
- **Fit:** stack footprint 40 mm × 31 mm at M, 49 × 38 mm at L, 6 tracks (3×1 is 29 / 35 mm). Still 3 columns (62 mm
  each) at both sizes. Fits.
- **Option:** NEW value `tiles: 41` on `multiply`. `_generateSizedMultDiv` already parses any `tiles` (da = 4, db = 1),
  so the generator needs only the value, its label, its ansDigits and the content-audit name check; it goes on the kit
  `stack` cell like 21 / 31.

### `area_model_2by2` — Area Model: Multiply 2-Digit by 2-Digit (host `area_model_mult_hard`)
- The 2 × 2 grid is drawn by `area_model_mult_hard` (`tiles: 22`, 2 × 2 grid), NOT by `area_model_mult` (one row only).
  The value exists; only the preset is new.
- **One new thing** vs `area_model_2by1`: the second factor splits too, so the model becomes a grid of four boxes
  (tens × tens appears: 30 × 20 = 600).
- **Scaffolds:** structural: the 2 × 2 grid, the edge labels, four partial-product boxes, the total. Hint: the edge
  split given, the traced tens × tens box.
- **Say:** "34 is 30 and 4. 26 is 20 and 6. Four boxes: 30 × 20, 30 × 6, 4 × 20, 4 × 6. Then I add."
- **Misconceptions:** multiplies only tens × tens and ones × ones (34 × 26 = 600 + 24); 30 × 20 = 60; adds the four
  edge numbers; forgets one box.
- **Fit:** the existing 2 × 2 grid, already measured by the kit (`maxCols: 2`). No change.
- WRM Y5.B5.S2 already lists `area_model_mult_hard {tiles: 22}` as its DIRECT skill (verdict full); the preset replaces
  that entry with its own id.

### `area_model_3by2` — Area Model: Multiply 3-Digit by 2-Digit (host `area_model_mult_hard`)
- `tiles: 23` already draws the 2 × 3 grid ("2-digit × 3-digit (24 × 135)"). It IS the 3-digit × 2-digit area model;
  but the item text writes the 2-digit number first (`24 × 135`), so a skill named "3-digit by 2-digit" would deal
  "24 × 135". Open question 2: write the 3-digit factor first for this value (recommended) or add value 32.
- **One new thing** vs `area_model_2by2`: a third column (hundreds): six partial products.
- **Say:** "135 is 100 and 30 and 5. 24 is 20 and 4. Six boxes, then I add."
- **Misconceptions:** 100 × 20 = 200; forgets a row of boxes; adds the partials out of place (misaligns 2,000 + 600).
- **Fit:** existing 2 × 3 grid, measured; 1 column at L.

### `mult_3by2_standard` — Multiply 3-Digit by 2-Digit Numbers (Standard Algorithm) (host `multiply`)
- **One new thing** vs `mult_2by2_standard`: a 3-digit top number, so each partial-product row is one digit longer.
  The placeholder zero and the two rows are already taught at 2×2.
- **Scaffolds:** structural: digit grid, two partial-product rows, the placeholder-zero box, carry boxes per row, the
  sum's carry row, the answer strip. Hint: the traced placeholder 0, the row names "(215 × 6)", "(215 × 30)" —
  exactly the `long-multiplication` kit cell's support levels 2 → 1 → 0.
- **Say:** "First 215 × 6. Then 215 × 30: I write the 0 first. Then I add the two rows."
- **Misconceptions:** leaves out the placeholder zero; multiplies only the ones by the tens digit; uses the first row's
  carries in the second row; adds the partial products in the wrong columns.
- **Fit:** 6 tracks (VA-1: m + n + 1): 44 mm at M, 56 mm at L, but four rows tall (two partials, carries, sum): 2
  columns × 3 rows recommended at M and L; the builder measures (L26).
- **Option:** NEW value `tiles: 32` on `multiply`. Today `tiles: 22` prints through the LEGACY `column-mult` format
  (`gen-operations.js`: "2-digit × 2-digit needs its partial-product rows on paper"), with no `q.cell`. Recommended
  (open question 3): 22 and 32 both move to the existing kit cell `long-multiplication`, so 3×2 is not built on the
  legacy path the contract forbids extending.

## 3. Grades and tags

| Preset | Grade | CCSS (primary first) | EE | WRM | Lesson |
|---|---|---|---|---|---|
| `area_model_4by1` | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S1 (partial: area model; column is `mult_4by1_column`) | G4-Y5.B5 "Multiply up to a 4-digit number by a 1-digit number" |
| `mult_4by1_column` | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S1 (direct) | G4-Y5.B5, the same lesson |
| `area_model_2by2` | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S2 (direct) | G4-Y5.B5 "2-digit × 2-digit (area model)" |
| `area_model_3by2` | 5 | 5.NBT.B.5, 4.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S4 (partial: area model) | G4-Y5.B5 "Multiply a 3-digit number by a 2-digit number" |
| `mult_3by2_standard` | 5 | 5.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S4 (direct) | G4-Y5.B5, the same lesson |

Note: unit G4-Y5.B5 is queue round 4 (`design/lessons-first/QUEUE.md` row 23), not the current round. The lead asked for
this lane; the round rule (FASTEST_PLAN 1) is flagged in the report, not decided here.
