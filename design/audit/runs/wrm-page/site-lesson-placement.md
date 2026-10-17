# School-site lessons: corrected placement (WRM page round 8, 2026-10-17)

For the owner of the site-lessons extract (`data/curriculum/site-lessons.json`, `tests/scripts/ws-site-lessons.mjs`).

Critic r6 M10 found 21 school-site lessons, 20 of them Kindergarten support lessons, in the wrong White Rose unit. They were
placed by the site's `domain` field, and that field is wrong for these rows. From round 8 the White Rose screen places a
site lesson by its **own CCSS codes** (`placeDomain` in `js/modules/wrm-links.js`):

1. the first code of the lesson's own grade, then
2. the lesson's first code, then
3. the site's `domain` only when the lesson has no code.

There is one listed exception. Kindergarten "Represent numbers to 5" is tagged 2.NBT.A.1, a base-ten code from another grade. It stays in
counting (CC), the site's domain, because Kindergarten counts where Grade 2 writes place value. Its CCSS tag looks
wrong; K.CC.A.3 is the likely code.

`ws-wrm-page-unit` now fails when a site lesson with a code sits outside the unit of that code's domain.

**Please correct the `domain` field of these rows in the extract**, so the file agrees with the screen. Each row below lists the site's
domain and then the domain the codes give, which is where the lesson is now listed.

| Grade | Lesson | Site id | CCSS | Site `domain` | Placed by its code |
|---|---|---|---|---|---|
| Kindergarten | 3D shapes (cube, cuboid, sphere, cone, cylinder) | `K\|-\|3dshapescubecuboidsphereconecylinder` | 1.G.A.1 | CC | **G** (D5 Geometry) |
| Kindergarten | Bonds to 10 (explore combinations that make 10) | `K\|-\|bondsto10explorecombinationsthatmake10` | 1.OA.C.6, K.OA.A.4 | CC | **OA** (D2 Operations & Algebraic Thinking) |
| Kindergarten | Circles and triangles (properties) | `K\|-\|circlesandtrianglesproperties` | K.G.B.4 | CC | **G** (D5 Geometry) |
| Kindergarten | Combining 2 groups | `K\|-\|combining2groups` | K.OA.A.1, K.OA.A.2 | CC | **OA** (D2 Operations & Algebraic Thinking) |
| Kindergarten | Compare amounts (more, fewer, same) | `K\|-\|compareamountsmorefewersame` | K.CC.C.6 | MD | **CC** (D1 Counting & Cardinality) |
| Kindergarten | Compare capacity (1) | `K\|-\|comparecapacity1` | K.MD.A.2 | CC | **MD** (D4 Measurement & Data) |
| Kindergarten | Compare capacity (2) | `K\|-\|comparecapacity2` | K.MD.A.2 | CC | **MD** (D4 Measurement & Data) |
| Kindergarten | Compare mass (1) | `K\|-\|comparemass1` | K.MD.A.2 | CC | **MD** (D4 Measurement & Data) |
| Kindergarten | Compare mass (2) | `K\|-\|comparemass2` | K.MD.A.2 | CC | **MD** (D4 Measurement & Data) |
| Kindergarten | Composition of 1, 2, 3 (parts make the whole) | `K\|-\|compositionof123partsmakethewhole` | K.OA.A.3 | CC | **OA** (D2 Operations & Algebraic Thinking) |
| Kindergarten | Composition of 4 and 5 (bonds) | `K\|-\|compositionof4and5bonds` | K.OA.A.3 | CC | **OA** (D2 Operations & Algebraic Thinking) |
| Kindergarten | Explore 2D shapes (circle, triangle, rectangle, square) | `K\|-\|explore2dshapescircletrianglerectanglesquare` | K.G.A.2 | MD | **G** (D5 Geometry) |
| Kindergarten | Positional language | `K\|-\|positionallanguage` | K.G.A.1 | CC | **G** (D5 Geometry) |
| Kindergarten | Positional language (on, under, in, next to) | `K\|-\|positionallanguageonunderinnextto` | K.G.A.1 | MD | **G** (D5 Geometry) |
| Kindergarten | Shapes with 4 sides (squares and rectangles) | `K\|-\|shapeswith4sidessquaresandrectangles` | K.G.B.6 | CC | **G** (D5 Geometry) |
| Kindergarten | Sort objects by one attribute (colour, size, shape) | `K\|-\|sortobjectsbyoneattributecoloursizeshape` | K.G.B.4 | MD | **G** (D5 Geometry) |
| Kindergarten | Spatial reasoning (1) - match, rotate, manipulate | `K\|-\|spatialreasoning1matchrotatemanipulate` | K.G.B.5 | CC | **G** (D5 Geometry) |
| Kindergarten | Spatial reasoning (2) - compose and decompose | `K\|-\|spatialreasoning2composeanddecompose` | K.G.B.5 | OA | **G** (D5 Geometry) |
| Kindergarten | Spatial reasoning (3) - visualize, build | `K\|-\|spatialreasoning3visualizebuild` | K.G.B.5 | OA | **G** (D5 Geometry) |
| Grade 1 | Length and height (compare, order) | `G1\|-\|lengthandheightcompareorder` | 1.MD.A.1, 2.MD.A.4 | CC | **MD** (D4 Measurement & Data) |
| Grade 5 | Divide a 2-digit number by 100 | `G5\|-\|dividea2digitnumberby100` | 4.NF.C.6, 5.NBT.A.2 | NF | **NBT** (D1 Number & Operations in Base Ten) |

Notes:
- **Grade 2 "Find the total"** (1.NBT.C.4, 2.MD.C.8). The grade's own code, 2.MD.C.8, decides, so it stays in D3
  Measurement & Data, which matches its site domain.
- **Grade 5 "Divide a 2-digit number by 100"** (4.NF.C.6, 5.NBT.A.2). The grade's own code, 5.NBT.A.2, moves it to D1
  Base Ten. The site says NF.
- **No-code rows whose site domain looks wrong.** These keep the site's domain, because there is no code to place them by:
  - Grade 4 "3D shapes": MD, but geometry is likely;
  - Grade 3 "Compare amounts (more, fewer, same)": MD, but counting is likely.
