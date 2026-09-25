# SUPPORTS — the supports program (DRAFT)

Status: **draft for owner approval.** Nothing here is wired into a skill or an option yet.
`WORKSHEET_DESIGN_STANDARD.md` is not amended until the owner approves the S1 specimen; the
amendments it will need are listed in §S1.12.

---

## S1 · Touch dots

### S1.1 Owner rulings (2026-09-25) — recorded

These supersede the standards where they differ.

1. **Design first.** The dots are designed and approved on a specimen before any skill or option
   uses them ("design the touch points first to make them perfect before putting them in skill
   options").
2. **+ and −: a fading ladder.** Dots on every number (count all) → dots only on the smaller or
   the subtracted number (count on / count back) → none. The teacher chooses the step.
   Multi-digit + and −: the same ladder, column by column.
3. **×: count by.** Dots on one factor; the pupil touches them while counting by the other.
4. **÷: a tally-dot row**, touched while counting by the divisor.
5. This **supersedes SF-32** (smaller number only) and **SF-33 / P-FL-17 / PT-FPR-10** (never for
   × and ÷).
6. **Coverage is the teacher's:** the whole sheet, all appropriate problems, or faded down the page.
7. Also on clock faces (a dot at each 5-minute mark), coins (US: 5¢ per dot; QR / plain: count by
   the printed coin values) and word problems. (Later elements; not in S1.)
8. **Name.** The teacher picks in Settings: **"Touch dots"** (default) or **"Count dots"**. The
   word is used on every teacher screen and in pupil instructions; search also finds "touch
   points". The commercial program's trademarked names are never used in code, comments, docs or
   UI; the code says `touchdots`. The About page will carry a one-line non-affiliation notice
   (wording at S3).

### S1.2 The convention

- 1–5 carry **single dots**. 6–9 carry **double dots**: a solid dot inside a ring, touched and
  counted twice. **Doubles are counted first.** 0 has none. The dots of every digit make exactly
  that digit (doubles count 2).
- The drawing is MathQuest's own, fitted to the owner's glyphs: **Andika 6.200, only cv04 (the open
  4)**. TY-4 rejects cv01 and cv06, so the positions fit the flagged 1 and the default 6, 7 and 9.

### S1.3 Positions (counting order)

Coordinates are em of the digit, from the **centre of the digit's line box** (y down). The kit's
digit span centres a line-height-1 line box, so the overlay is anchored at the span's centre and
never depends on the track width (0.72 or 0.95 em). Andika's baseline is 0.41 em below that
centre; its figures stand from −0.31 to +0.41 em. Regular (400); Bold has its own table in
`touchdots.js` (same landmarks, fitted to the heavier strokes).

| Digit | Marks, in the order touched | Regular (x, y) em |
|---|---|---|
| 1 | top of the stroke | (0.013, −0.235) |
| 2 | start of the curve · right end of the base | (−0.19, −0.195) · (0.18, 0.372) |
| 3 | start · middle join · end | (−0.175, −0.203) · (−0.03, 0.03) · (−0.215, 0.285) |
| 4 (open) | top of left stroke · foot of left stroke at the bar · top of right stroke · right stroke × bar | (−0.123, −0.25) · (−0.188, 0.165) · (0.112, −0.11) · (0.113, 0.163) |
| 5 | right end of top bar · top-left corner · foot of the down-stroke · right of the bowl · tail end | (0.13, −0.258) · (−0.152, −0.255) · (−0.17, 0.03) · (0.172, 0.2) · (−0.193, 0.335) |
| 6 | doubles down the left: top · middle · bottom of the loop | ◎(−0.06, −0.24) · ◎(−0.19, 0.06) · ◎(−0.005, 0.38) |
| 7 | doubles: bar right end · middle of diagonal · foot of diagonal; then single: bar left end | ◎(0.17, −0.258) · ◎(0.03, 0.037) · ◎(−0.10, 0.35) · (−0.21, −0.253) |
| 8 | doubles in a Z: top-loop left · top-loop right · bottom-loop left · bottom-loop right | ◎(−0.165, −0.168) · ◎(0.163, −0.165) · ◎(−0.198, 0.2) · ◎(0.193, 0.193) |
| 9 | doubles: top of loop · right of loop · middle of stem · bottom tip; then single: left of loop | ◎(−0.02, −0.268) · ◎(0.195, −0.04) · ◎(0.152, 0.26) · ◎(−0.163, 0.34) · (−0.185, −0.03) |

Placement notes (fitting decisions, from the specimen):
- A dot at a stroke **terminal** sits a little inside the end (a cut end is thin; a dot centred on
  the very tip is only ~45 % on ink).
- The 9's stem double sits a little below the stem's midpoint and the loop's left single a little
  low, so five marks fit the small loop with clear gaps.
- The 6's bottom double and the 7's foot double overhang the glyph by ≤ 0.09 em; they stay inside
  the 1.15 em span, clear of the fact rule.

### S1.4 Sizes (chosen by evidence)

Andika's stroke measures 0.085–0.095 em Regular and 0.115–0.135 em Bold. SF-30's 0.09 em dot is the
stroke itself, so it disappears. Three sizes were built and compared (specimen §2) and run through
the gate:

| Size | Single dot | Ring (outer) | Centre dot | Ring line | Gate |
|---|---|---|---|---|---|
| S | 0.15 em | 0.21 em | 0.09 em | 0.028 em | passes |
| **M (chosen)** | **0.17 em** | **0.23 em** | **0.10 em** | **0.03 em** | **passes** |
| L | 0.19 em | 0.25 em | 0.11 em | 0.032 em | **fails** the spacing rule on 3, 4, 5 and 9 |

**M is the largest size that passes.** At 24 pt (em 8.47 mm): single dot 1.44 mm, ring 1.95 mm,
centre dot 0.85 mm, ring gap 0.30 mm, ring line 0.25 mm. At 28 pt: 1.68 / 2.27 / 0.99 / 0.35 /
0.30 mm.

**Photocopy floors** (`TOUCH_DOT_FLOOR_MM`): ring gap ≥ 0.30 mm (× 1.25 in photocopy mode), ring
line ≥ 0.25 mm, keyline ≥ 0.15 mm. Floors grow the ring outward; the centre dot never shrinks.

### S1.5 Ink and keyline

- **Single dots are solid black with a thin white keyline** (0.018 em, ≥ 0.15 mm). Evidence
  (specimen §2): without the keyline a 0.17 em dot on a 0.09 em stroke reads as a slight thickening,
  and after a simulated photocopy it is gone; with it the dot reads as a separate round mark and
  survives as a clear bump. Cost: the keyline nicks the stroke round each dot (most visible on the
  open 4's crossbar). Accepted.
- **Doubles are a knocked-out ring:** a white disc with a black ring line and a solid centre dot.
  It knocks the stroke out of the gap, so the gap and the centre dot read cleanly and survive a
  copy. The alternative (an **open** ring drawn over the stroke, `ring: 'open'`) keeps the numeral a
  little more whole, but after a copy the stroke fills the gap and the double reads as one blob.
  Knocked-out is the default. Cost: three rings cover much of a 7's diagonal.
- **Trace ink** (a faded step): the marks in the sheet's one grey; with **photocopy-safe** on,
  dotted outlines instead of grey (INK rules for traces).
- Black, white and the one grey only. No colour, on paper or in the screen cell.

### S1.6 Minimum size and fallback

- Touch dots need a digit of **≥ 24 pt on paper** and **≥ 40 px on screen**
  (`touchDotsFits(size, 'pt' | 'px')`). Below that, the item **falls back to the existing cue**:
  the dot tile for + and −, the skip strip for × and ÷ (never tiny dots).
- On the kit's fact ladder that means L (5 columns, 28 pt) and M (6 columns, 24 pt) carry dots;
  S (10 columns, 16 pt) falls back. Column stacks use the preset digit (L 28 pt, M 22 pt), so a
  stack with touch dots needs L. (S2 decides whether choosing touch dots forces L or disables the
  option with its reason.)

### S1.7 Where the dots go (per operation)

| Operation | Ladder step | Dots on |
|---|---|---|
| + | count all | every number |
| + | count on | the smaller number (the pupil says the larger) |
| − | count back | the subtracted number (the pupil says the top number) |
| × | count by | one factor (the pupil touches it while counting by the other: "6, 12, 18 …") |
| ÷ | count by | a tally-dot row under the fact (`touchTallySVG`) |
| column + / − | as above | the chosen digits, column by column, ones first |

**The ÷ tally row** is always the same length on a sheet (10, or 12 for a ×12 set), two lines of
five, single-dot size. Its length never tells the quotient: the pupil touches one dot per count
("3, 6, 9, 12, 15"), then counts the dots touched.

**Neighbours.** In a fact's 0.72 em tracks, no mark reaches the next digit's ink and two dotted
neighbours keep the no-merge gap (gate). The overlay takes no space and changes no layout.

### S1.8 Screen interaction

- **The whole number is the touch target**, an invisible button at least 44 × 44 px centred on the
  number (on a multi-digit number, one target per NUMBER, not per digit, because at 40 px two 44 px
  targets would overlap). A tap counts the **nearest mark that still has a touch left**
  (`touchDotNearest`), so a tap never misses and a pupil who touches a dot gets that dot.
- **Touched marks turn the one grey**: black = still to touch, grey = counted. A double takes two
  taps: the first greys its centre dot, the second its ring. Nothing grows or moves.
- The running count is shown quietly under the cell ("Touched 5 · 30" for count-by-6), outside the
  B&W cell. **"Start again"** clears. **No timer.**
- Keyboard: Tab to a number; Space / Enter counts the next mark in counting order
  (`touchDotOrder`). The number's button has an `aria-label` ("7: 7 touch dots. Tap to count."),
  and the count is in an `aria-live` region.

### S1.9 API (`js/modules/sheet/touchdots.js`, pure, SCC-01)

| Export | What |
|---|---|
| `TOUCH_DOTS`, `TOUCH_DOTS_BOLD` | `{0..9: [{x, y, double}]}` in counting order |
| `touchDots(d, weight)` | the table for a weight |
| `touchDotCount(d)`, `touchDotOrder(d)` | counts (doubles 2) and the per-touch order `{mark, say, second}` |
| `TOUCH_DOT_BASELINE_EM`, `TOUCH_DOT_TOP_EM` | 0.41 / −0.31 em from the line-box centre |
| `TOUCH_DOT_SIZES`, `TOUCH_DOT_DEFAULT` | S / M / L, default M |
| `TOUCH_DOT_MIN`, `touchDotsFits(size, unit)` | 24 pt / 40 px |
| `touchDotGeometry(opts)` | radii in em after the photocopy floors |
| `touchDotsSVG(d, {em, unit, weight, ink, photocopy, size, halo, ring, counted, tappable})` | the overlay: absolute SVG, 1 × 1.15 em in CSS em, centred on the host span, no layout |
| `touchDotsMarks(d, opts)` | the marks alone (em coordinates) for an SVG host (clock, coin) |
| `touchDotsDigitHTML(ch, opts)` | a span's inner HTML: digit + overlay |
| `touchDotNearest(d, x, y, counted)` | the mark a tap counts |
| `touchTallySVG(n, opts)` | the ÷ tally row |

Host: the digit span takes `class="ws-td"` (`position: relative`, additive rule in
`css/sheet-kit.css`) and the overlay as its last child. Paper `fact()` / `stack()` spans and the
screen `factHTML()` / `stackHTML()` spans are one span per digit, so no template change is needed
to host it (S3 wires it).

### S1.10 Tools and gate

- `node tests/scripts/ws-touchdots-fit.cjs [--snap] [--png DIR]` — measures the glyphs in the DOM
  (puppeteer, the self-hosted Andika, cv04, screenshot at DPR 4; never canvas `fillText`), skeleton
  ends and joins, and each dot's distance to the stroke centre-line; `--snap` prints a table with
  every dot snapped onto the skeleton.
- `node tests/scripts/ws-touchdots.cjs` — **the gate** (prints `ws-touchdots: OK`). Digits 0–9,
  Regular and Bold, at 24 / 28 / 36 pt and 40 / 48 / 56 px:
  - **on ink:** every dot centre ≥ 60 % dark in a 0.03 em disc;
  - **no merge:** black-edge to black-edge gap between any two marks ≥ 0.6 × the counted-dot
    diameter (a single's dot; a double's centre dot; the smaller of the pair), and at raster the
    overlay alone splits into exactly *d* separate blobs (a double's ring and centre dot are two),
    so no gap has closed;
  - **count:** the dots make the digit, doubles first;
  - **neighbours:** every pair of digits in 0.72 em tracks, geometry at every size and pixels at the
    smallest sizes;
  - **layout:** a kit fact and stack have identical boxes with and without the overlay;
  - **screen:** the specimen card's targets are ≥ 44 × 44 px at 390 and 1280, taps count, extra
    taps do nothing, "Start again" clears, no horizontal scroll.
  - `--size S|L` runs the same gate for another size (evidence for §S1.4).
- Specimen: `design/specimens/touch-dots.html` (+ `touch-dots-card.html`), rendered by
  `node design/specimens/render-touch-dots.cjs` to `touch-dots.png`, `touch-dots-digits.png` and
  `touch-dots-facts-L.png`.

### S1.11 Open questions for the owner

1. The keyline nicks the stroke round each single dot (visible on the 4). Keep it for photocopy
   survival (recommended), or drop it for a cleaner numeral?
2. Knocked-out rings (recommended) or open rings over the stroke (the 7 stays more whole)?
3. Stacks with touch dots need the L preset (28 pt). Force L when touch dots are on, or disable the
   option below L with a reason?

### S1.12 Standard amendments needed after approval (not made yet)

- WORKSHEET_DESIGN_STANDARD SF-30 (dots on the numeral: 0.09 em → the S1 geometry; a
  new TD-* rule block for positions, sizes, minimum size, fallback, ink, keyline, screen),
  SF-31/SF-32 (the fading ladder replaces "smaller number only"), SF-33/SF-34 (touch dots allowed
  for × and ÷: count-by dots and the tally row).
- PEDAGOGY_STANDARD §4.2 / §6.3 / P-FL-17; PAGE_TYPES PT-FPR-5 / PT-FPR-10 / PT-DLG-17.

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
| Pane templates | `js/modules/sheet/cells/panes/` (`kit.js`, `k2.js`, `hand-art.js`, `place.js`, `models.js`, `extras.js`, `index.js`) |
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
| **Rounding with a place-value chart**: mark the rounding place and the digit to its right ("underline the place, circle / box the digit next door"; the *rounding digit* and the *decider digit*), then 5 or more rounds up | NCETM Y5 number and place value ("What is 4773 rounded to the nearest hundred?") — <https://www.ncetm.org.uk/in-the-classroom/national-curriculum-resource-tool/?topic=1693&year=1536>; NCETM KS3 core concept 1.1 *Place value, estimation and rounding* — <https://www.ncetm.org.uk/classroom-resources/secmm-11-place-value-estimation-and-rounding/>; classroom practice write-ups: Not So Wimpy Teacher *Tips for teaching students to round* — <https://notsowimpyteacher.com/2018/08/tips-for-teaching-students-to-round.html>, Maths Angel *Place value chart rounding* — <https://maths-angel.com/lessons/place-value-chart-rounding> | `round-pv`: the number in a place-value chart, a **ring** round the digit in the rounding place (named under its column), an **underline** under the digit to its right ("look here"), an optional **rule strip**, an **answer row** in the same columns. Owner wording: ring = the place you round to, underline = the digit you look at. `round-mark`: the same two marks on the problem's own numeral. |
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
| **Writing ≥ 14 mm** | Grid-paper squares are 14 mm; the answer rows of `pvgrid` and `round-pv` are 14 mm columns, 15 mm tall at L (owner ruling 2026-09-25: "room under the chart to write the answer"). These are WORKING places (`data-ws-support-part="unknown"`, `data-ws-graded="0"`): the problem keeps its own answer blank, which is the one graded slot (RUBRIC C1). No other pane has a writing place. The step strip's check boxes are unscored. |
| **Key** | `ctx.key` fills a pane's answer row in the key (`data-ws-key="1"`); the pupil page never carries it. |
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
| `fingers` | Tabler Icons outline hands (MIT, see Credits), rebuilt per finger: raised fingers up, folded ones knuckle bumps, the thumb out only at 5, a wrist cuff; **index first**; 6–10 = a full hand + the second hand the same way; a pair is mirrored so the thumbs point to the middle; 6 mm fingers | PK–1 | n 1–10; + a,b ≤ 5; − shows a | 3 + 2 | 78×58 | 78×57 | hint H1 |
| `rekenrek` | 2 rows × (5 solid + 5 hollow) beads, pushed left; − slides the taken beads to the right, apart from the kept ones, each with ONE diagonal stroke on a white halo (bottom row first), colours kept so 5 + 5 still shows | K–2 | n ≤ 20; + a,b ≤ 10; − a ≤ 20 | 8 + 6 | 84×36 | 84×35 | hint H1 |
| `base10` | gridded to-scale rods and ones (u = 6 mm), ones 2 wide | 1–3 | n, +, − to 99 | 47 + 25 | 84×72 | 84×71 | hint H1 |
| `base10-quick` | RP-31 quick sketch: square, stick, open dot; one number per line | 2–4 | to 999 | 368 + 257 | 83×80 | 83×79 | hint H1 |
| `disks` | pv.js disk mat, one per number | 2–4 | to 9,999 | 146 + 238 | 116×105 | 107×96 | hint H1 |
| `pvgrid` | ruled chart, bold place letters, digits in columns, sign in its own column; under a calculation an **empty answer row** below a heavy rule (the key fills it) | 2–4 | to 99,999; +, −, × | 3254 + 1618 | 66×62 | 66×58 | structural |
| `hundreds` | 1–100 chart or a window of rows; start ringed; `bottomUp` option | 1–3 | +/− with answer 1–100 | 37 + 20 | 86×54 | 81×51 | structural |
| `round-line` | two multiples, 11 ticks, midpoint tall + labelled | 3–4 | round to 10 / 100 / 1000 | 47 → 10 | 117×32 | 112×30 | hint H2 |
| `round-pv` | the number in a place-value chart (Th H T O, wider for big numbers: M HTh TTh …); ring on the rounding place + its name; underline + "look here" on the next digit; rule strip; answer row (level 4 pre-marks the zeros in grey); `level` 0–4 or the flags `ring` `look` `rule` `answerRow` `zeros` | 3–4 | round n ≤ 9,999,999 to 10 … 1,000,000 | 4,672 → 100 (level 4) | 59×68 | 55×63 | hint H2 |
| `round-mark` | the problem's own numeral (digits set 0.8 em apart) with the ring and the underline, no chart | 3–4 | as `round-pv` | 4,672 → 100 | 39×16 | 32×14 | hint H4 |
| `round-chart` | the chart from one multiple to the next, stood up, halfway boxed | 3–4 | round to 10 / 100 / 1000 | 64 → 10 | 23×94 | 22×88 | hint H2 |
| `numberline` | marked line; ones when the numbers are within 15 (5 to 15 for 7 + 5), else tens / hundreds spread to about 72 mm so hops of ten are drawable; start dot (with its own tick and label when it falls between ticks) | 1–4 | n, +, − to 1,000 | 7 + 5 | 93×31 | 83×29 | hint H3 |
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
| 3 | `numberline` | `base10-quick`, `disks`, `gridpaper`, `openline`, `bar` | `array` → `area`, `bar` | `gridpaper` | `disks`, `pvgrid` | `round-line`, `round-chart`, `round-pv` → `round-mark` |
| 4 | — | `disks`, `gridpaper`, `openline`, `bar` | `area`, `bar` | `gridpaper`, `area` | `disks`, `pvgrid` | `round-line`, `round-pv` → `round-mark` |
| any | `boxsign`, `startarrow` (stacks), `steps` | | | | | |

### S4.6 Fading

**Rounding marks** fade one at a time (`round-pv` `level`): 4 ring + look here + rule + answer row
with zeros → 3 without the zeros → 2 without the rule → 1 ring only → 0 the chart and its answer row →
then `round-mark` (marks on the numeral) → nothing. On a Guided page the marks and lines print grey
(`ink:'grey'`), the digits stay black.

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
them; grid paper already has its own start arrow. `round-pv` is a chart (group `grid`) and clashes with `pvgrid`,
`gridpaper` and `round-mark` (it already carries the marks); `round-mark` is a mark (group `extra`).

| | `objects` | `tenframe` | `dice` | `fingers` | `rekenrek` | `base10` | `base10-quick` | `disks` | `pvgrid` | `hundreds` | `round-line` | `round-chart` | `round-pv` | `round-mark` | `numberline` | `openline` | `array` | `area` | `gridpaper` | `bar` | `boxsign` | `startarrow` | `steps` | `touchdots` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `objects` | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `tenframe` | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `dice` | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `fingers` | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `rekenrek` | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `base10` | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | W | ✗ | ✗ | ✗ | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `base10-quick` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | W | ✗ | ✗ | ✗ | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `disks` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | W | ✗ | ✗ | ✗ | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✓ | ✓ | ✓ | ✗ |
| `pvgrid` | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | — | W | W | W | ✗ | ✓ | W | W | ✗ | ✗ | ✗ | W | ✓ | ✓ | ✓ | ✓ |
| `hundreds` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | — | ✗ | ✗ | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `round-line` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | — | ✗ | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `round-chart` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | — | W | ✓ | ✗ | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `round-pv` | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | ✗ | W | W | W | — | ✗ | W | W | ✗ | ✗ | ✗ | W | ✓ | ✓ | ✓ | ✓ |
| `round-mark` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `numberline` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | ✗ | W | ✓ | — | ✗ | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `openline` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | ✗ | ✗ | ✗ | W | ✓ | ✗ | — | ✗ | ✗ | W | W | ✓ | ✓ | ✓ | ✗ |
| `array` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `area` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `gridpaper` | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | ✗ | W | W | W | ✗ | ✓ | W | W | ✗ | ✗ | — | W | ✓ | ✗ | ✓ | ✓ |
| `bar` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | W | W | W | W | W | ✓ | W | W | ✗ | ✗ | W | — | ✓ | ✓ | ✓ | ✓ |
| `boxsign` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| `startarrow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | — | ✓ | ✓ |
| `steps` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `touchdots` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

(`startarrow` only applies to a stacked problem; the matrix says it would not clash.)

### S4.8 Open points for the owner

1. **Fingers**: index first, thumb at five — confirmed by the owner (2026-09-25).
2. **Base-ten to scale** needs a 60 mm rod (6 mm ones, RP-5), so it is limited to numbers to 99;
   hundreds use the quick sketch or disks.
3. **Sentence over the picture** repeats the problem when the pane sits beside it. The allocator may
   switch it off (`ctx.sentence:false`) for beside placements if you prefer; it is on in the specimen.
4. **Screen**: the step strip's check boxes are 7 mm (27 px at phone scale); the screen host must give
   each a 44 px hit area when the strip becomes tappable.
5. **Rounding panes** print only the number as their sentence (the problem already says "Round … to
   the nearest …").
6. **Rounding answer rows**: `round-pv` and `pvgrid` give the pupil a working row under the chart; the
   problem's own blank stays the graded answer. Say if the chart row should become the graded slot.

### S4.9 Credits

| Asset | Source | Licence |
|---|---|---|
| Counting hands (`panes/hand-art.js`) | Tabler Icons v3.48.0, outline `hand-finger`, `hand-two-fingers`, `hand-three-fingers`, `hand-stop` — <https://tabler.io/icons>, npm `@tabler/icons` (<https://cdn.jsdelivr.net/npm/@tabler/icons@3.48.0/icons/outline/hand-stop.svg>) | MIT, © 2020-2026 Paweł Kuna; notice reproduced in the file. Path data vendored (pages print offline); fingers taken one by one, the folded index and folded thumb bumps and the wrist cuff are ours in Tabler's proportions, strokes re-weighted to 2.25 pt. |

# Supports

The supports program (plan: touch dots, pictures, visual supports, anchor problems). Other lanes
append their own sections (S1 touch dots, S2 the supports model, S4 visual panes); this file starts
with the two anchor sections.

## S5 · Step-by-step anchor problems

**Owner rulings (2026-09-25).** A step-by-step anchor problem shows a problem worked out step by
step. Anchors are unscored and unlabelled and carry a Model tab. Research: the example comes before
the problem; examples are correct only; easy numbers first; short steps with a Say line.

**What an anchor is.** A worked example printed on a practice page. It is a *sibling* of the
pupil's problems: the same skill and structure, with different and easier numbers. It is never one
of the pupil's problems.

- **Generation.** Examples are generated under seeds of their own (`print-sheet.js anchorSet`,
  base `seed ^ 0x2545F491`), never a pupil item's seed, with `itemIndex 0`. They are sorted easy
  first (`anchors.js easeScore`: the size of the operands and the answer).
- **No clash.** `pickDistinct` drops every example whose signature (text, answer, payload) matches
  a problem on the sheet. If a skill runs out of distinct examples, the list cycles. With none, the
  skill gets no anchor.
- **Who gets one.** Only skills whose provider really implements `workedSteps`
  (`p.real.includes('workedSteps')`, the same test as `compose.js providerWorkedSteps`). Other skills
  print no anchor, and the Print screen's note says: "No worked example for <skill>: it has no
  step-by-step steps yet."

**The step renderer (P-LC-9).** Provider marks name *logical* slots (`ones`, `tens`,
`regroup:tens`, `answer`, `q0`, `part1`, …). Each template maps them onto its own geometry through
a `stepState(payload, steps, k, ctx)` member (the registry keeps extra members). It draws the cell
as it looks after step `k`:

- the marks of step `k` (the newest) are in trace grey;
- every earlier mark is in solid black;
- nothing from a later step is drawn.

`js/modules/sheet/steps.js` holds the shared helpers:

| Helper | What it does |
|---|---|
| `stepMarks` | the marks and their ink |
| `placeDigits` | digits right-aligned on a place's track. A track that already holds the same digit keeps its ink, so "The sum is 224." turns nothing grey that was already written. |
| `regroupMarks` | the regroup marks |
| `singleSlotState` | blank, then traced, then answered |
| `slotInks` | slot values with their ink |

| Template | Step state |
|---|---|
| `stack` | Place marks go in the answer boxes (or the open answer tracks). `regroup:<place>` goes in the carry box over that place. The geometry is identical to the cell's other states (SCC-T10). |
| `fact` | A vertical fact writes the answer tracks digit by digit. An across fact has one slot. A fact drawn as a stack hands over to the stack. |
| `equation` | One slot: blank, then grey, then black. |
| `division` | `q<j>` writes quotient digit j over its dividend digit, **and** that step's two work rows (the product, then the difference and bring-down), in the same ink. `answer` fills every quotient digit. `remainder` fills the R box. |
| `area-model` | `part<i>` fills part box i, and `total` fills the total. |

Number line, arrays, counters, function tables and place value have no `stepState` yet. An anchor
for those skills falls back to **the whole trace plus the numbered text steps**: one state, with the
answer traced grey, and every step listed beside it.

**The anchor cell (`js/modules/sheet/anchors.js`).**

- **Band** (full width): a strip of 2–4 step states. States come from `anchorGroups`:
  - a group ends on a step that makes a mark;
  - the steps before the first mark get a state of their own (the problem, not yet worked);
  - beyond 4 states, the shortest adjacent pair is merged.

  The states are drawn one preset smaller than the page (S on a page at L), so the example reads as
  the teacher's worked example beside the pupil's full-size problems. States are divided by a grey
  hairline.
- **Steps.** Each state's numbered steps sit under it, one sentence a line (`stepLines`). A line
  that is still over 10 words breaks after its colon, so every printed line is at most 10 words
  (P-5).
- **Say line.** The strip closes with `Say:` and the provider's frame, filled with the example's
  numbers (`strings.sayFill`).
- **Model tab, no label.** The anchor is a plan item with `model: true, nolabel: true`, so the grid
  draws the outlined `Model` tab (PT-LBL-6). It has no letter and no tab.
- **Unscored.** Every `data-ws-slot` inside it is renamed `data-ws-aslot`. The key's `fillSlots`,
  the lints and the Score cannot see it.
- **Same on the key.** It draws the same in every state (`drawsAnswer: true`, an empty key). The
  answer key shows it byte for byte as the pupil page does, with no gap reported (AK-1).
- **Side twin** (half width): one state (the worked example, its last marks grey) at M, with its
  steps beside it and the Say line under it.
- **Compact band** (Mixed practice): the side twin's one-state layout at full width, which keeps a
  skill's shelf band short.
- **Wide models.** A band whose states would not fit their columns (the width is estimated from the
  cell's footprint at the smaller preset) merges states down to 2. If even 2 do not fit, it is drawn
  as the compact band.

## S6 · Anchor layouts on practice sheets

**Request.** `buildSheet({... anchors: 'off' | 'side' | 'sections'})`. `'on'` means the role's
default, sections. `normaliseRequest` accepts it on `independent`, `more-practice` and
`mixed-practice`, and forces `'off'` on every other role. The default is `'off'`, so existing pages
and links are unchanged.

**Print screen.** `teacher-print.js` has an "Anchor problems: Off / Side by side / Sections"
segmented control in Page setup (`pr.anchors` → `requestFor` → `normaliseRequest`). A one-line
caption explains each choice.

**SIDE BY SIDE.** The section becomes rows of [worked twin | pupil problem]: the example first,
never the problem first.

- **Twins.** Each pupil item carries its own twin (`it.twin`), a distinct example.
  `practice.js withAnchors` interleaves the twins, and the section is set to 2 columns.
- **Layout.** The host measures the twins with the problems, so the layout's floor holds both.
- **One column.** When a problem is too wide for half the page, each twin sits above its problem.
  A page then holds whole pairs: an even number of rows, paginated as pairs. An example is never
  left at the foot of a page with its problem overleaf.
- **Mixed practice.** A shelf of k cells becomes k/2 pairs, if the twins fit at k. A skill whose
  pairs do not fit takes the compact band instead.

**SECTIONS.** Each section is printed as **blocks**: an anchor band, then its 3–4 problems.

- **Block size** (`anchors.js blockPlan`):
  - 1 row at 3–4 columns, 2 rows at 2 columns, 3 rows at 1 column;
  - the section's columns are capped at 4, so a block never holds 5–10 fact columns;
  - when only ONE block fits a page (tall problems), the block takes the rows that fit, up to 6
    problems, rather than leave half the page empty.
- **Pages.** `blockPages` puts whole blocks on pages, and a block is never split. PG-23 rebalances
  a lone last block. Each chunk carries its `anchorMm`, which `paginate.js placeSections` adds to
  the section's height (`heightMm = instrMm + anchorMm + rows × cellH`).
- **One example per block.** The examples are distinct and taken easy-first. A More Practice
  letter restarts at the first example.
- **Mixed practice.** One anchor per skill (the compact band), on the skill's first shelf band,
  above its problems. With anchors, a set may need more than one page. Whole shelves spill, and the
  extra shelves fill the pages the anchors already take, never adding a page
  (`mixed-practice.js packing`).

**Heights.**

- The host measures every anchor in the real stylesheet (`measureItems`). The band a page
  reserves is the tallest of the three easiest examples, plus 6 mm. The app page renders at device
  scale 2 and the printed document at 1, and a step line that wraps one way in one can wrap the
  other way in the other.
- An example taller than the reserved band is never picked into it.

**Score and labels.** Only pupil problems are labelled and counted: `pupilCount` for each page's
label starts, and the Score denominators. Anchors add neither.

**Gates.**

- `tests/scripts/ws-anchors-unit.mjs` (pure node, then 26 real builds in Chrome) checks:
  - each template's step states;
  - the strip's 2–4 states, and step lines of 10 words or fewer;
  - that anchors are unscored and carry the Model tab;
  - that the key draws the anchors the same;
  - that no anchor is orphaned (side: whole pairs per page, including one column);
  - block pagination and rebalancing;
  - Score denominators;
  - that no real anchor of add, subtract, mult_facts, add_column_multi, long_div_2digit or
    area_model_mult equals a problem on its page;
  - that a skill without real worked steps prints no anchor and gets the note.
- `ws-print-lint --source kit --anchors side|sections` adds **L-ANCHOR**: every anchor cell has
  the Model tab, no letter or tab label and no answer slot, and it draws the same on the key.
- `ws-grade-render --anchors side|sections` renders the specimens. See
  `design/specimens/anchors-*.png`.

**Known limits.**

- A GROUPED Independent section of several skills (one section, several skills, page-driven) gives
  each skill at least one block. With tall problems, one block does not share a page with another,
  so each skill takes its own page. Mixed practice (one compact anchor per skill) is the multi-skill
  sheet with anchors.
- Side by side halves the problems a page holds; that is the layout's cost.

**Not built yet.** The on-screen "Show me an example" panel (a later lane), and step states for
the number line, arrays, counters, function tables and place value.
