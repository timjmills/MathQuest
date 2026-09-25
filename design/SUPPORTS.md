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
