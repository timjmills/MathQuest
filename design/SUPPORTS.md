# MathQuest Supports

The supports programme: touch dots, pictures, visual supports and anchor problems for pupils who
struggle. Every support is OFF by default and teacher-controlled; every one is held to the 8/10 rubric
(`design/audit/RUBRIC.md`). The plan and the owner rulings of 2026-09-25 are summarised at the top of
each element's section. Other sections (S1 touch dots, S2 the supports model, S5 anchor problems) are
written by their own lanes.

---

## S4 · Visual support panes (PK–4)

**Status:** templates and specimen built for **owner approval**. Nothing is wired into a skill, an
option or a page role yet; the allocator lane (S2) reads this section and the registry.

| What | Where |
|---|---|
| Pane templates | `js/modules/sheet/cells/panes/` (`kit.js`, `k2.js`, `place.js`, `models.js`, `extras.js`, `index.js`) |
| Registry | `PANES` in `panes/index.js` |
| Specimen | `design/specimens/support-panes.html`, PNGs in `design/specimens/png/support-panes-*.png` (built by `node design/specimens/build-support-panes.cjs`) |
| Unit test | `node tests/scripts/ws-panes-unit.mjs` (`--matrix` prints the table in §S4.7) |

### S4.0 What a pane is

A **pane** is a picture a teacher attaches to a problem cell to help a pupil who is struggling — a ten
frame beside 7 + 5, base-ten blocks under 47 + 25, a rounding line beside "Round 47". It is:

- **our look**: black, white and the one grey (INK-1), Andika, strokes from the closed set
  {0.5, 0.75, 1, 1.5, 2.25} pt (INK-10), rounded outlines, nothing dashed (LS-4);
- **one drawing, two hosts** (RP-2): one SVG in mm on paper; the screen twin (`ctx.twin`) is the same
  SVG sized `calc(var(--mq-k2) * w)` with `max-width:100%` (the K-2 kit's scale variable);
- **a hint** (PEDAGOGY_STANDARD 4.1–4.2): pictures are H1, attention marks H4. Grid paper, the
  place-value grid and the hundreds chart are **structural** (a place to work / a chart to read) and
  carry `data-ws-scaffold="structural"`;
- **answer-free** (RP-1): see §S4.2.

### S4.1 Research used, and how it became our rule

| Finding | Source | Our rule |
|---|---|---|
| Use a well-chosen set of **concrete and semi-concrete representations**, and connect them explicitly to the symbols | IES/WWC practice guide *Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades* (2021), rec. 2 — <https://ies.ed.gov/ncee/wwc/practiceguide/26> | Every pane prints the **matching number sentence** over its picture ("7 + 5"), never "= 12". |
| Use the **number line** to build understanding and prepare for later maths | same guide, rec. 4 | Marked and open number lines; the rounding line. |
| **Manipulatives and representations** have one of the strongest evidence bases, but only with a clear purpose, and pupils must move from them to the abstract (CRA) | EEF *Improving Mathematics in Key Stages 2 and 3* (2022 update), rec. 2 — <https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3>; EEF *Early Years and KS1* rec. 3 | Panes are pictorial (the "P" of CRA), are a hint that fades, and each has one job. |
| **To-scale base-ten blocks before place-value counters**: ten ones are exactly one ten long; a disk's size no longer carries its value | Nuffield *Using manipulatives in the foundations of arithmetic* (2019); NCETM / Third Space summaries of Dienes vs counters | Order: `base10` (gridded, to scale) → `base10-quick` (RP-31 sketch) → `disks`. |
| The **rekenrek** (two rows of ten, 5 + 5 in two colours) builds five- and ten-structure | NCETM *Mastering Number* (Reception–Year 2) | `rekenrek`: 5 solid + 5 hollow per row (colour as solid/hollow, LS-5), beads pushed left. |
| **Bar model** for part–whole and comparison, and later multiplicative structure | NCETM *The Bar Model* — <https://www.ncetm.org.uk/classroom-resources/ca-the-bar-model/> | `bar`: part–whole, compare, equal parts, share; schematic lengths (RP-72). |
| **Bottom-up hundred chart**: "up" means more, like a number line stood up | Bay-Williams & Fletcher, *A Bottom-Up Hundred Chart*, Teaching Children Mathematics (2017) | `hundreds` has `bottomUp: true`. |
| **Rounding**: the two multiples and the **midpoint** make "which is nearer?" visible | common intervention practice; our P9 research (`design/research/place-value-rounding.md`) | `round-line` marks the midpoint with a tall labelled tick; `round-chart` boxes the halfway row. The number itself is never plotted (pupil's work, RN-4). |
| **Grid paper** with place heads keeps columns aligned for pupils with motor / visual-spatial difficulties | standard SEN accommodation; our VA rules | `gridpaper`: H T O heads, 14 mm squares, start arrow over the ones. |
| **Arrays lead to area** | CCSS 3.MD.7; NCETM | `array` (dots) and `area` (squares edge to edge) are one family. |
| Critics of counting supports warn of **dependence on counting in ones** | ERIC EJ1166663 review (plan "Research findings") | Pictures fade by removal (H1); the "More support" preset and "Fade" (S2) step them down. |

Research says *what* to show; the look comes from WORKSHEET_DESIGN_STANDARD, and where they differ the
standard wins (the pastel colours of commercial rekenreks, dice and disks become solid / hollow / value
labels).

### S4.2 Rules every pane meets (checked by `ws-panes-unit`)

| Rule | How |
|---|---|
| **No answer** (RP-1) | The problem's answer appears in no text of a pane, except as one number of an evenly printed **reference scale** (`data-ws-ref="1"`: a hundreds-chart cell, a rounding-line multiple, a step number). A number line leaves the answer's tick unlabelled (RP-50). A part that stands for the unknown carries `data-ws-support-part="unknown"` and holds nothing but "?". A lint can check both attributes. |
| **Root marks** | `data-ws-support="<id>"`, `data-ws-answer-free="1"`, `data-ws-scaffold="hint|structural"`; grey panes add `data-ws-ink="trace"`. |
| **Ink** | Only #000, #fff, #949494; no dashes, opacity, gradients or filters; stroke widths from the closed set; grey strokes never under 1 pt (INK-4). |
| **Grey (Guided)** | `ctx.ink = 'grey'` draws a pane's LINES grey (text stays black: INK-3). Pictures ignore it: an H1 picture fades by being **removed**, not greyed. |
| **Touch / shade ≥ 6 mm** (RP-5) | Ten-frame counters 6.5–7 mm, beads 6.5 mm, dice dots 6 mm, fingers 6 mm wide, array counters 6 mm, base-ten units 6 mm, area squares ≥ 6.5 mm, hundreds-chart cells ≥ 7.5 mm. |
| **Writing ≥ 14 mm** | Grid-paper squares are 14 mm. No other pane has a writing place — a pane never adds a second answer slot (RUBRIC C1). The step strip's check boxes are unscored (`data-ws-graded="0"`). |
| **Solid fill ≤ 7 mm** (INK-5) | Counters and beads only. |
| **Text** | Sentence at cell-text + 3 pt; labels at zone-label size or more; Andika with cv04. |

### S4.3 The catalogue

Sizes are the footprint (mm, including the sentence) for the sample problem, at L and M. Panes keep
their touch floors, so M is only a little smaller than L.

| Id | Draws | Grades | Ops (accepts) | Sample | L (w×h) | M (w×h) | Class |
|---|---|---|---|---|---|---|---|
| `objects` | outline objects in rows of 5; − crosses out; × equal groups in rings | PK–2 | n ≤ 20; + a,b ≤ 10; − a ≤ 20; × a ≤ 5, b ≤ 6 | 4 + 3 cars | 58×42 | 54×39 | hint H1 |
| `tenframe` | 1–2 ten frames: first number solid, second hollow (shows make-ten); − crosses out | K–2 | n ≤ 20; +/− within 20 | 7 + 5 | 56×60 | 51×55 | hint H1 |
| `dice` | dot tiles: dice 1–6, two rows of five 7–10 | PK–1 | n 1–10; + a,b ≤ 10; − a ≤ 10 | 4 + 3 | 65×41 | 63×39 | hint H1 |
| `fingers` | our own line-art hands; index first, thumb at 5; 6–10 = full hand + hand | PK–1 | n 1–10; + a,b ≤ 5; − shows a | 3 + 2 | 78×56 | 78×55 | hint H1 |
| `rekenrek` | 2 rows × (5 solid + 5 hollow) beads, pushed left | K–2 | n ≤ 20; + a,b ≤ 10; − a ≤ 20 | 8 + 6 | 84×36 | 84×35 | hint H1 |
| `base10` | gridded to-scale rods and ones (u = 6 mm), ones 2 wide | 1–3 | n, +, − to 99 | 47 + 25 | 84×72 | 84×71 | hint H1 |
| `base10-quick` | RP-31 quick sketch: square, stick, open dot; one number per line | 2–4 | to 999 | 368 + 257 | 83×80 | 83×79 | hint H1 |
| `disks` | pv.js disk mat, one per number | 2–4 | to 9,999 | 146 + 238 | 116×105 | 107×96 | hint H1 |
| `pvgrid` | ruled chart, bold place letters, digits in columns; **no answer row** | 2–4 | to 99,999; +, −, × | 3254 + 1618 | 66×47 | 66×44 | structural |
| `hundreds` | 1–100 chart or a window of rows; start ringed; `bottomUp` option | 1–3 | +/− with answer 1–100 | 37 + 20 | 86×54 | 81×51 | structural |
| `round-line` | two multiples, 11 ticks, midpoint tall + labelled | 3–4 | round to 10 / 100 / 1000 | 47 → 10 | 117×32 | 112×30 | hint H2 |
| `round-chart` | the chart from one multiple to the next, stood up, halfway boxed | 3–4 | round to 10 / 100 / 1000 | 64 → 10 | 23×94 | 22×88 | hint H2 |
| `numberline` | marked line; ones when the numbers are within 15 (5 to 15 for 7 + 5), else tens / hundreds; start dot | 1–4 | n, +, − to 1,000 | 7 + 5 | 93×31 | 83×29 | hint H3 |
| `openline` | empty line, one tick: the start (left for +, right for −) | 2–4 | +, − | 58 + 26 | 113×31 | 105×29 | hint H3 |
| `array` | × rows of open counters (RP-81, 5-gap); ÷ loose counters in rows of 10 to ring | 2–4 | × to 10×10; ÷ dividend ≤ 60 | 3 × 6 | 63×42 | 63×41 | hint H1 |
| `area` | unit squares edge to edge (RP-94 weights) | 3–4 | × to 12×12 | 4 × 7 | 54×42 | 50×39 | hint H1 |
| `gridpaper` | 14 mm squares, H T O heads, regroup row, operands, rule, empty work row, "Start" arrow over O | 2–4 | +, − to 99,999; × to 9,999 × 99 | 47 + 25 | 57×71 | 57×70 | structural |
| `bar` | part–whole (+/−), `model:'compare'`, equal parts (×), share (÷); one "?" box | 1–4 | +, −, × a ≤ 10, ÷ b ≤ 10 | 38 + 25 | 85×44 | 81×39 | hint H2 |
| `boxsign` | the sign in a heavy rounded box, its word under it | K–4 | + − × ÷ | 15 − 8 | 22×23 | 19×22 | hint H4 |
| `startarrow` | "Start" over a down arrow | 1–4 | + − × (stacks) | 47 + 25 | 14×14 | 12×13 | hint H4 |
| `steps` | numbered steps, each with an unscored check box; `payload.steps` (a provider's `workedSteps`) or defaults | 1–4 | + − × ÷, round | 47 + 25 | 77×39 | 67×35 | hint (steps band) |

**Payload** (plain data off the problem): `{op, a, b}`, `{n}`, or `{kind:'round', n, place}`, plus a
pane's own choices — `object` (circle, square, triangle, star, ball, apple, fish, **car, flower,
turtle, block** — the four new PT-DLG-15 drawings), `bottomUp`, `chart:'full'`, `model:'compare'`,
`steps`. **ctx**: `{size, twin, ink, sentence}`.

**API** (`panes/index.js`): `PANES[id].{label, grades, ops, group, kind, scaffold, placements,
answerFree, accepts(p), draw(p, ctx), footprint(p, ctx)}`, `renderPane`, `panesFor(p, {grade})`,
`placePane`, `addedHeight`, `attachPane`, `compat`, `compatSet`, `PANE_GROUP`.

**Reuse.** `disks` nests `pv.js diskMatSVG` unchanged; `objects` draws the K-2 kit's `SHAPES` and adds
four; stroke widths, the ink, the scale variable and the twin convention are the K-2 kit's. The
existing `factCue` (fact.js), `dotTile` (guided.js), `chartwindow`, `tenframe`, `number-line` and
`pv-support-cell` drawings were read and their geometry followed, but they are either registered
templates with answer slots or small cues below RP-5 (dots of 2–3 mm, strokes outside the closed set),
so the panes redraw those pictures at pane size rather than call them. `factCue` can later become a
thin alias for `tenframe` / `dice` / `numberline` / `array` panes.

### S4.4 Placement (`placePane`)

| Placement | When | Used by |
|---|---|---|
| **before** | always, left of the problem (read first; never by the answer, SF-4) | `boxsign` |
| **over-ones** | above the problem, right-aligned over the ones column | `startarrow` |
| **beside** | problem width + 4 mm + pane width ≤ cell width, and pane height ≤ max(1.5 × problem height, 40 mm) | all others (preferred) |
| **under** | pane width ≤ cell width | all others |
| none | neither fits: the allocator gives the item a one-column cell (186 mm) | — |

- The pane never enters the answer zone (SF-4); `attachPane` builds the flex wrapper for each
  placement; `addedHeight` tells the page how much taller the cell gets, so **capacity is recomputed**
  (fewer rows, never smaller drawings — RP-3, RP-8).
- Two-column cells are 87 mm inside: tenframe, dice, objects (≤ 3 + 3 side by side, otherwise stacked),
  fingers, rekenrek, base10, base10-quick, pvgrid, hundreds, array, area, gridpaper, bar, steps fit
  **under**; numberline (ones), round-line, openline and disks need a one-column cell at L.
- Beside a 5-column fact grid there is no room: a fact with a pane takes a 2-column cell.
- In the twin a pane scales with `--mq-k2` and never exceeds its card (`max-width:100%`); `attachPane(…,
  {twin:true})` lets a beside pane wrap under on a phone.

### S4.5 Which pane for which grade and operation (defaults for "More support", S2 decides)

| | Count / + / − within 20 | + / − multi-digit | × / ÷ facts | multi-digit × | Place value | Rounding |
|---|---|---|---|---|---|---|
| PK–K | `objects`, `dice`, `fingers` | — | — | — | — | — |
| 1 | `tenframe`, `rekenrek`, `dice`, `numberline` | `base10`, `hundreds` | — | — | `base10` | — |
| 2 | `tenframe`, `rekenrek`, `numberline` | `base10` → `base10-quick`, `hundreds`, `gridpaper`, `bar` | `array` | — | `base10`, `pvgrid` | — |
| 3 | `numberline` | `base10-quick`, `disks`, `gridpaper`, `openline`, `bar` | `array` → `area`, `bar` | `gridpaper` | `disks`, `pvgrid` | `round-line`, `round-chart` |
| 4 | — | `disks`, `gridpaper`, `openline`, `bar` | `area`, `bar` | `gridpaper`, `area` | `disks`, `pvgrid` | `round-line` |
| any | `boxsign`, `startarrow` (stacks), `steps` | | | | | |

### S4.6 Fading

Pictures (H1) go **within two steps** after a representation's bridging step (PEDAGOGY 4.2); they do
not turn grey. Line panes and the boxed sign / arrow (H3–H4) may print grey on a Guided page
(`ink:'grey'`) and then go. Structural panes (grid paper, pv grid, hundreds chart) persist on every
page of the step and on tests while "Keep structural supports on tests" is on (P-SC-5); removing one
is its own step (P-SC-4).

### S4.7 Compatibility (`compat(x, y)`)

✓ = stack on one problem; **W** = stack only in a one-column (full-width) cell; ✗ = clash: never on
one problem — the page mixes them **by section** (default) or problem by problem (owner ruling
2026-09-25). `touchdots` is the S1 glyph set.

Why: RP-4 allows one kind of visual per cell, so two quantity pictures clash; two counting routes
(touch dots and a picture, a line or a chart) confuse the pupil, so they clash; the extras are marks,
not pictures, and stack with anything; grid paper and the pv grid hold digits, so touch dots sit on
them; grid paper already has its own start arrow.

| | `objects` | `tenframe` | `dice` | `fingers` | `rekenrek` | `base10` | `base10-quick` | `disks` | `pvgrid` | `hundreds` | `round-line` | `round-chart` | `numberline` | `openline` | `array` | `area` | `gridpaper` | `bar` | `boxsign` | `startarrow` | `steps` | `touchdots` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `objects` | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `tenframe` | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `dice` | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `fingers` | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `rekenrek` | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `base10` | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | W | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `base10-quick` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | W | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `disks` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | W | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `pvgrid` | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | — | W | W | W | W | W | ✗ | ✗ | ✗ | W | ✓ | ✓ | ✓ | ✓ |
| `hundreds` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `round-line` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `round-chart` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `numberline` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `openline` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `array` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `area` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `gridpaper` | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | ✗ | W | W | W | W | W | ✗ | ✗ | — | W | ✓ | ✗ | ✓ | ✓ |
| `bar` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | W | W | W | ✗ | ✗ | W | — | ✓ | ✓ | ✓ | ✓ |
| `boxsign` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| `startarrow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | — | ✓ | ✓ |
| `steps` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `touchdots` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

(`startarrow` only applies to a stacked problem; the matrix says it would not clash.)

### S4.8 Open points for the owner

1. **Fingers**: index first, thumb at five (the common classroom order). Some teachers count thumb
   first; say if you want that.
2. **Base-ten to scale** needs a 60 mm rod (6 mm ones, RP-5), so it is limited to numbers to 99;
   hundreds use the quick sketch or disks.
3. **Sentence over the picture** repeats the problem when the pane sits beside it. The allocator may
   switch it off (`ctx.sentence:false`) for beside placements if you prefer; it is on in the specimen.
4. **Screen**: the step strip's check boxes are 7 mm (27 px at phone scale); the screen host must give
   each a 44 px hit area when the strip becomes tappable.
5. **Rounding panes** print only the number as their sentence (the problem already says "Round … to
   the nearest …").
