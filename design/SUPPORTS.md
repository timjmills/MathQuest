# SUPPORTS — the supports program (DRAFT)

Status: **S1 approved by the owner (2026-09-25), with the rulings in §S1.1 (9–11) applied.**
S2 (the supports model, below) wires supports into skills and options. `WORKSHEET_DESIGN_STANDARD.md`
is not amended yet; the amendments it needs are listed in §S1.12.

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
   points". The commercial program's trademarked names are never used in code, comments or UI
   strings built from code; the code says `touchdots`.
   **About-page line (owner ruling, the only place the name appears):** "not affiliated with
   TouchMath". It is recorded here only; the S3 lane adds it to the About page text.

**Approval rulings (2026-09-25, on the S1 specimen):**

9. **Open rings on double dots.** The ring is drawn over the numeral's stroke, so the stroke shows
   through and a 7 or 9 reads clearly. It must survive photocopying: the ring-line and gap floors
   hold, and a double never becomes a blob (gate: PHOTOCOPY, §S1.10). `ring: 'open'` is the
   default; the knocked-out ring stays only as an option.
10. **Keep the white keyline on single dots.**
11. **Touch dots force size L.** When touch dots are on and an item's digits would fall under
    24 pt (for example column stacks at M, 22 pt, or anything at S), **that item switches to size
    L** (28 pt). It never falls back to the dot tile. This is a rule for the allocator lane (S2):
    an item that carries touch dots is laid out at L whatever the sheet's preset.

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

| Size | Single dot | Ring (outer) | Centre dot | Centre keyline | Ring line | Gate |
|---|---|---|---|---|---|---|
| S | 0.15 em | 0.21 em | 0.07 em | 0.032 em | 0.028 em | fails PHOTOCOPY on 4 Bold doubles at 24 pt (gap white 47–49 %) |
| **M (chosen)** | **0.17 em** | **0.23 em** | **0.08 em** | **0.033 em** | **0.03 em** | **passes** |
| L | 0.19 em | 0.25 em | 0.09 em | 0.036 em | 0.032 em | **fails** the spacing rule on 3, 4, 5 and 9 |

**M is the only size that passes the whole gate** (S's smaller open rings blob in Bold at 24 pt; L's marks crowd). At 24 pt (em 8.47 mm): single dot 1.44 mm, ring 1.95 mm,
centre dot 0.68 mm, centre keyline 0.28 mm, ring gap 0.38 mm, ring line 0.25 mm; at 28 pt
(em 9.88 mm): 1.68 / 2.27 / 0.79 / 0.33 / 0.44 / 0.30 mm. The open ring (ruling 9) needed a
smaller centre dot than the first draft (0.10 → 0.08 em) so that the centre keyline could reach
the photocopy floor while the stroke still visibly runs into the ring (the keyline stops 0.012 em
short of the ring line).

**Photocopy floors** (`TOUCH_DOT_FLOOR_MM`): ring gap ≥ 0.30 mm (× 1.25 in photocopy mode), ring
line ≥ 0.25 mm, single-dot keyline ≥ 0.15 mm, centre-dot keyline ≥ 0.26 mm. Floors grow the ring
outward; the centre dot never shrinks.

### S1.5 Ink and keyline

- **Single dots are solid black with a thin white keyline** (0.018 em, ≥ 0.15 mm). Evidence
  (specimen §2): without the keyline a 0.17 em dot on a 0.09 em stroke reads as a slight thickening,
  and after a simulated photocopy it is gone; with it the dot reads as a separate round mark and
  survives as a clear bump. Cost: the keyline nicks the stroke round each dot (most visible on the
  open 4's crossbar). Accepted.
- **Doubles are an OPEN ring** (owner ruling 9): a black ring line drawn over the stroke, the
  stroke running on into the ring, and a solid centre dot with its own white keyline so it never
  fuses with the stroke. Either side of the stroke the gap between dot and ring stays white. After
  the simulated poor copy every double at 24 and 28 pt, both weights, still shows its full ring
  line, its solid centre dot and white round the gap (gate PHOTOCOPY). The knocked-out ring (a
  white-filled ring, `ring: 'knockout'`) is kept only as an option: it hid most of a 7's
  diagonal.
- **Trace ink** (a faded step): the marks in the sheet's one grey; with **photocopy-safe** on,
  dotted outlines instead of grey (INK rules for traces).
- Black, white and the one grey only. No colour, on paper or in the screen cell.

### S1.6 Minimum size and fallback

- Touch dots need a digit of **≥ 24 pt on paper** and **≥ 40 px on screen**
  (`touchDotsFits(size, 'pt' | 'px')`). Never tiny dots.
- **Owner ruling 11 — force L, never the tile.** When touch dots are on and an item's digits would
  fall under 24 pt, **that item switches to size L** (28 pt). On the kit's fact ladder, L (5
  columns, 28 pt) and M (6 columns, 24 pt) facts already qualify; a fact at 7+ columns or at the S
  preset, and a column stack at M (22 pt) or S (16 pt), are laid out at L instead. **Allocator rule
  (S2):** `allocateSupports` marks such an item `forceSize: 'L'`, and the layout places it with
  L's metrics (its own section or row), so the page stays regular; the dot tile is never
  substituted for touch dots.
- On screen the practice card draws digits at 40 / 48 / 56 px, which qualifies. A screen host
  whose digits are under 40 px (the online worksheet's 29 px cell) must draw a touch-dot item at
  ≥ 40 px, the screen form of the same rule (S3 wires it).

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
| `touchDotsSVG(d, {em, unit, weight, ink, photocopy, size, halo, ring = 'open', counted, tappable})` | the overlay: absolute SVG, 1 × 1.15 em in CSS em, centred on the host span, no layout |
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
  - **photocopy (no blob):** every double of 6–9, both weights, at 24 and 28 pt, drawn with its
    numeral and put through the simulated poor copy (Gaussian blur σ 0.12 mm, anything under 60 %
    white prints black), keeps ≥ 85 % of its ring line dark, a solid centre dot, and ≥ 50 % white
    round the middle of the gap;
  - **layout:** a kit fact and stack have identical boxes with and without the overlay;
  - **screen:** the specimen card's targets are ≥ 44 × 44 px at 390 and 1280, taps count, extra
    taps do nothing, "Start again" clears, no horizontal scroll.
  - `--size S|L` runs the same gate for another size (evidence for §S1.4).
- Specimen: `design/specimens/touch-dots.html` (+ `touch-dots-card.html`), rendered by
  `node design/specimens/render-touch-dots.cjs` to `touch-dots.png`, `touch-dots-digits.png` and
  `touch-dots-facts-L.png`.

### S1.11 Owner decisions (resolved 2026-09-25)

1. Keyline on single dots: **kept** (ruling 10).
2. Rings: **open** over the stroke, photocopy-safe (ruling 9).
3. Under 24 pt: **switch the item to L**, never the tile (ruling 11).

### S1.12 Standard amendments needed after approval (not made yet)

- WORKSHEET_DESIGN_STANDARD SF-30 (dots on the numeral: 0.09 em → the S1 geometry; a
  new TD-* rule block for positions, sizes, minimum size, fallback, ink, keyline, screen),
  SF-31/SF-32 (the fading ladder replaces "smaller number only"), SF-33/SF-34 (touch dots allowed
  for × and ÷: count-by dots and the tally row).
- PEDAGOGY_STANDARD §4.2 / §6.3 / P-FL-17; PAGE_TYPES PT-FPR-5 / PT-FPR-10 / PT-DLG-17.


## S2 · The supports model (one engine for every support)

**Status:** built (allocator, drawing, option controls, print and screen wiring, gates). The touch-dot
glyphs are S1's; the panes are S4's; this section is how a teacher's choice becomes a support on a
problem.

### S2.1 Owner rulings recorded here (2026-09-25) — they supersede the standards

| Ruling | Supersedes |
|---|---|
| **Supports may be on every cell**, not the first cell only. Coverage is the teacher's: every problem, the problems that need it, or faded down the page. | P-7 ("hint scaffolds … appear in the first cell only"), SF-12 (first-cell cues), PT-IND-2 ("cells show structural supports only") — when the teacher ticks a support. With nothing ticked (the default) those rules stand unchanged. |
| **Touch dots for × and ÷**: × dots on the factor that is not the table number (count by the table number); ÷ a tally-dot row of the section's one length (10, or 12 on a ×12 set), touched while counting by the divisor. | SF-33 / PT-FPR-10 / P-FL-17 ("never for × and ÷"), SF-32 (smaller number only: + now has count all → count on → none, − count all → count back → none). |
| **A support level fades DOWN THE PAGE**, never cycles: {3, 2, 1} on six cells is 3, 3, 2, 2, 1, 1. | The `supportLevelFor` / `_kLevel` round-robin by item index (gen-operations.js, gen-counting.js). |
| **Clashing supports** are shared by section (default) or problem by problem; compatible supports stack. | — |
| **Touch-dot digits under 24 pt force size L** for that section (a stack or sentence drawn at L inside an M / S page; a fact takes the ladder, capped at 6 columns = 24 pt). | §S1.1 ruling 11. |

The standards' own text is not rewritten in this change; these rows are the record, and the S1.12
amendment list carries them when the owner signs S1 off.

### S2.2 What a teacher ticks

`support` is **the one Support control** (skill-options.js `supportsOptions`): a SET of the supports the
skill can draw. It replaced the P11 one-cue enum on the fact skills (`~FD`, dot tiles, still decodes to
the one tick) and became a set on the rounding skills (their cut line / number line rungs stay
generation-time values of the same set). Values:

| Id | What | Token |
|---|---|---|
| `touch` | touch dots, the lighter rung: count on (+), count back (−), count by (×), the tally row (÷) | V |
| `touchall` | touch dots on every number (count all) | 3 |
| `tile` `frame` `line` `skip` `array` `think` | the P11 fact cues (fact.js `factCue`), now drawn at render time | D R L K A H |
| `boxsign` `startarrow` `steps` | S4 extras | J 4 I |
| `round-pv` `round-mark` | S4 rounding panes | 1 2 |

Two more controls appear **only once a render-time support is ticked** (`appliesTo`), so a panel stays at
≤ 5 controls at rest: `cover` (4B: whole / needed / fade; W N F) and, when two ticked supports can clash,
`mix` (4C: section / problem; S P). The print request carries sheet-level `coverage` and `mix` that
override every skill's own. Default: nothing ticked, so every existing page and link is unchanged.

**Declarations.** Each skill's provider declares `supports` (the list it can draw); a skill without a
provider takes its family default (`providers/util.js FAMILY_SUPPORTS`). `ws-supports-unit` checks every
Support control against that declaration, and every value against the codec's union table.

### S2.3 The allocator (`js/modules/sheet/supports.js`, pure)

`allocateSupports(items, chosen, {coverage, mix, compat})` → per item `{on, reserve, level, forceL}`.

- **Alternatives.** `alternativesOf(chosen)` splits the ticks into sets that stack: supports that clash
  with nothing ride on every alternative; clashing ones are coloured into as few groups as possible
  ([touch, tile, boxsign] → [touch, boxsign] | [tile, boxsign]).
- **Compatibility** `supportCompat(x, y)` is the §S4.7 matrix, with touch dots as `touchdots`, a cue as
  the pane it draws like (tile → dice, frame → tenframe, line / skip → numberline, array, think → bar),
  and the two touch rungs clashing with each other. Symmetric (unit-tested over every id).
- **Mix.** `problem`: item j of a skill takes alternative j mod k. `section`: with two or more sections on
  the page, section s takes alternative s mod k (section A touch dots, section B dot tiles, whichever
  skill each holds; the host names the order with `mixKey`); a page of one section is dealt in equal
  blocks. Balanced (±1) and deterministic. An item that cannot draw its alternative takes the next.
- **Coverage.** `whole`: every item. `needed`: only items whose numbers qualify (support-draw.js
  `needs`: a counted number of 3 or more, a column that regroups, a count of 6 or more …). `fade`: by the
  skill's page position, first third everything, middle third the light part (count all → count on, the
  rounding chart → the marks on the numeral, marks and structure kept, pictures gone), last third none.
  A fade never increases down the page.
- **Worst-case reservation.** `reserve` = everything the section's cells *could* carry that this cell does
  not draw. It is drawn invisibly, so every cell of a section has one geometry and the answer zone never
  moves. Supports that clash share ONE row, laid over each other (a cell keeps room for the tallest, not
  the sum).
- **forceL** for a touch-dot section whose digits would print under 24 pt.

`fadeRung(at, k, total)` is the level fade the generators use (equal blocks with the page's count, else
two items a rung; live play still cycles).

### S2.4 Drawing (`js/modules/sheet/support-draw.js`)

- The supports ride in the **render payload** (`payload.supports = {on, reserve, table?, tally?}`), like
  Error analysis's `fix: 'draw'`, so the pupil page, the key and the measurement agree.
- **Touch dots** on the digit spans: `fact` (vertical and across), `stack` (column by column:
  count on = every digit but the largest in its column; count back / × = the bottom row), `equation`
  (the given numbers only). The overlay takes no space.
- **Round the problem** (every template, through the registry's render hook): the ÷ tally row, a cue, or a
  pane, placed by `placePane` (beside when the cell is wide enough, else under; the sign before, the arrow
  over the ones), joined by `attachPane`. Footprint: a support drawn round the problem makes the cell
  measured and no narrower than its widest pane; touch dots on a fact cap it at 6 columns.
- **Screen**: `screen-cell.js screenSupportsFor(q, kind, {index, total})` runs the same allocator for a
  session item; `kindHTML(k, {supports})` draws touch dots on the fact / stack / equation digits and the
  tally row, cues and extras round it (practice card and online worksheet). Rounding and counting panes
  are print-only for now (a later screen lane).
- **The generator no longer bakes a cue** (`gen-operations.js _applyOptionPost`): the old path wrote
  `payload.cue` and `q.visual` (a double draw, and a legacy cell on screen). A fact the legacy path drew
  (sub_facts) is drawn by the kit's fact template when it carries a support.

### S2.6 Density (coordinator, 2026-09-25)

Supports cost only their own room:

- **One section, clashing supports, mixed by section** → the section is split into one sub-section
  per alternative (`print-sheet.js splitBySupports`: counts shared out, or the page shared like a
  grouped section). Each lays out and reserves room for its OWN alternative only. With several
  sections, a section already reserves only the alternative it is dealt.
- **Beside when the cell allows**: every piece (cue, tally row, pane) has a footprint and stands
  beside the problem where problem + 4 mm + piece fits the column, else under it. The host's
  "reflow" veto (a narrow column much taller than one column) does not apply to a supported cell:
  beside at one column and under at three is the design. On paper a beside pair starts at the
  cell's left (2 mm in), so the answer zone stands in one place even when the pictures differ in
  width.
- **Smaller attached supports**: a pane drawn round a problem is one preset smaller than the page
  (pictures at M, keeping their touch floors; marks and the checklist at S), without its own number
  sentence (the problem is the sentence). The checklist uses short lines (`SUPPORT_STEPS`, about 13
  characters) so it fits beside a column stack in a two-column cell.
- **Subtraction cues** (dot tiles, ten frames) use the S4 panes (`dice`, `tenframe`), whose crosses
  sit on white-edged counters; addition keeps the compact P11 cue. The ÷ dot array uses the S4
  `array` pane (loose counters to ring): the old cue drew the quotient as its row count.
- **More Practice**: the letters of a set are ONE sheet for the allocator (section mixing and the
  support fade run across A, B, …). (The generator's support-LEVEL fade still restarts each letter:
  each letter is generated under its own seed.)

Measured (Independent, L, A4, one page, Max Number 1,000; items per page without → with):

| Skill · supports | without | with |
|---|---|---|
| add_facts · touch | 12 | 12 |
| add_facts · dot tiles | 12 | 9 |
| add_facts · every support | 12 | 8 |
| sub_facts · dot tiles (panes) | 12 | 6 |
| subtract · every support | 9 | 6 |
| mult_facts · every support | 12 | 12 |
| div_facts · touch (tally row) | 16 | 12 |
| div_facts · every support | 16 | 7 |
| add_column_multi · every support / steps | 6 | 6 / 4 |
| count_objects · checklist | 8 | 4 |
| nearest_100 · chart / marks | 10 | 4 / 8 |

### S2.7 Not in this pass

- **Clocks and coins.** P10's templates expose the minute ring (`ring`) and the US coin dots (`dots`)
  as payload flags. Hooking touch dots to them (the ring as the count-by-5 dots, coin dots at 5¢ a
  dot) is left for the S3 time-and-money lane: those skills' `support` sets hold the flags today as
  generation values.

### S2.5 Gates

- `node tests/scripts/ws-supports-unit.mjs` — determinism, balance, clash dealing by section (one and
  several sections, across skills) and by problem, fade monotonic and ending in none, touch forcing L,
  compat symmetric, worst-case reservation, the touch-dot plans, no answer in a drawn support, the ÷
  tally length, footprints, every Support control against its declaration and ≤ 5 controls at rest.
- `ws-options-verify`: a render-time support (and `cover` / `mix`) must leave generation UNCHANGED, change
  the printed sheet, draw on the pupil page and the key alike, and draw on the practice card.
- `ws-print-lint --source kit --supports all|ids [--cover …] [--mix …]` adds **L-SUPPORT**: no answer
  inside a drawn support; one ÷ tally length per section; geometry parity (one shape, one answer-slot
  place, supports drawn or reserved); the key draws the same supports.
- `ws-grade-render --supports all|ids [--cover …] [--mix …]` renders pages and screens with supports on.


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
- **Side twin** (half width, or full width when its problem is too wide for half the page): one
  state (the worked example, its last marks grey) at M, its steps beside or under it (below), and
  the Say line under it.
- **Compact band** (Mixed practice): the side twin's one-state layout at full width, which keeps a
  skill's shelf band short.
- **Where the steps go (owner report 2026-09-25, `anchors.js stepsPlacement`).** A count-by row's
  Model cell printed its steps one word a line in a column squeezed against the cell's right
  border, running past it and down beside the next cell. The steps of a one-state anchor go
  BESIDE the drawing only when the column left beside it holds **24 characters** a line of the
  page's step type (`stepsMinMm`, about 53 mm; `STEPS_MIN_CHARS`). Step and Say text is never under
  **11 pt** at any size (`STEP_MIN_PT`); a number sentence never breaks inside, and fractions in
  steps and Say are stacked (TY-7). Beside the drawing, the steps and the Say line stand together,
  the pair centred in the band. Otherwise they
  go UNDER the drawing, across the cell: in two text columns read row by row (1 2 / 3 4) when the
  cell is at least 164 mm wide, short sentences of one step sharing a line while it stays within
  10 words. A drawing wider than 55% of the cell (a count-by row, a number line, a long table, a bar
  model) always takes its steps under it. The drawing's width is its template's footprint AT the
  anchor's preset (a count-by row of twelve is one row at M but two at L). The stylesheet enforces
  the floor: the list beside a drawing has `flex-basis` and `min-width` of that width and wraps
  under the drawing if it would be narrower (`flex-wrap`), so a drawing wider than estimated can
  never squeeze it again. A twin is marked `restacks` (print-sheet.js measureItems): taller at two
  columns than at one on purpose, not a collapse.
- **Wide models.** A band whose states would not fit their columns (the width is the template's
  footprint at the smaller preset), or whose columns would hold fewer than 18 characters of step
  text a line (four states at L leave 36 mm, 15 characters: three stand), merges states down to 2.
  If even 2 do not fit, it is drawn as the compact band.
- **Side by side in one column** pages its [twin, problem] pairs by their OWN heights
  (`anchors.js packPairs`, `pairsPerPage`): each row is as tall as what it holds, so one tall twin
  no longer sizes every row of the page (Count by 1-12 at L: 1 pair a page before, 2 after; at S, 3).
- **Side by side, two columns:** a row is [twin | problem] by construction, so the layout never
  re-packs such a section by height (`layout.js`, the H13 packing skips a list holding twins).
- **Gate.** `tests/scripts/ws-anchor-steps.cjs` builds every skill with worked steps (independent /
  more practice, side and sections; guided; lesson; mixed practice; S and L; `--builds` narrows it)
  and fails on any steps column under 18 characters (STEPS-COL), a step printed about one word a
  line (STEPS-WORD), anything leaving an anchor, Model or chart cell (STEPS-LEAVE), and an anchor
  cell 30% empty (STEPS-H13).

## S6 · Anchor layouts on practice sheets

**Owner ruling 2026-09-26 (LESSON_LIBRARY_PLAN.md 8f): ONE form only.** Practice keeps a single
worked example on top of each block (SECTIONS). SIDE BY SIDE is dropped: `normaliseAnchors` maps an
old `'side'` request to `'sections'` so saved sets still print, and the Print screen's control is
Off / On. The rules for the example (`anchors.js pickExamples`, `print-sheet.js anchorSet`):
- **Eligible per candidate**: a choice / multi-select variant is skipped, never a Model, and never
  decides for the whole skill.
- **Different numbers from every problem on the page** (`anchorKey` / `keysClash`): not the same
  count-by table, clock time, coin total or change target, function-table rule or operands, and
  not the same answer. The candidates walk the item index too, so a skill that deals its table by
  position gives varied examples; the examples of one page differ from each other.
- **The skill's real move, easy-first** (`anchorRich`): at least 3 coins; to the minute, a minute
  past a five beyond :10; to five minutes, :10 or later; no count by 1.
- **Drawn like the problems**: the example is drawn at the page's scaffold level (1).
- **A band that cannot stand over one row of the problems is not printed** (a note says so), and a
  band is only as tall as the example it holds.
- **A lone block fills the page**: it takes the rows that fit, up to 6 problems or 3 rows.

**Request (historical).** `buildSheet({... anchors: 'off' | 'side' | 'sections'})`. `'on'` means the role's
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

**A page of several skills (2026-09-25 fix).** A grouped, page-driven section shares one page
(`print-sheet.js shareRows`). Side by side in one column needs a PAIR of rows per member, and the
height a member lacks is taken from several others' spare room, so the sheet no longer spills its
last skill overleaf (the Print screen showed "Score /6" over a page holding 5). In SECTIONS mode,
when the members' bands and one row each do not fit, every member takes the compact band; when even
that does not fit (three skills with bands at L), the sheet runs to a second page and its Score
counts the whole sheet (HD-2, HD-20). A skill with no worked steps prints its problems without
twins, so a side-by-side page of such a mix shows twins beside that skill's problems only.

**Not built yet.** The on-screen "Show me an example" panel (a later lane), and step states for
the number line, arrays, counters, function tables and place value.

## S9 · The support ladder for wrong answers (on screen)

Owner, 2026-09-25: "if an answer goes wrong, that is where to include one of our supports, and each
time they get it wrong you can either add more / different approach to supports."
`js/modules/support-ladder.js`; gate `tests/scripts/ws-support-ladder.cjs`.

**Where.** The practice card, each online worksheet card, and a quiz ONLY when its feedback is
"instant". Never a test-style quiz (feedback at the end), never boss / race / MAP.

**The ladder, per item** (keyed by the question object, so the next item starts clean):

| Wrong answer | What happens |
|---|---|
| 1st | The entry stays, marked gently (grey dashed underline, selected so typing replaces it; no red flash, no shake). The skill's FIRST support is drawn in the cell: the first id its provider declares (`supports`, S2) that this item can draw. |
| 2nd | A DIFFERENT approach: the first declared support of another kind (touch dots / picture / mark or checklist). It is added; when it clashes with the first (S4.7: two ways of counting on one problem) it takes the first's place. |
| 3rd | The worked steps for THIS item (the provider's `workedSteps`, else the generic steps), black and white, with the Say: line. A **Listen** button reads the Say: line when Voice is on. |
| 4th+ | Spent: the host's own behaviour (the card's Show Solution, the worksheet's red, the quiz's "The answer is"). |

Items the kit does not draw get their own supports: a clock face gets its minute ring (the payload
flag `ring: 'on'`) and then a clock checklist; a count gets the counting checklist and then the same
count in ten frames.

**No answer in a support (S8).** Pictures draw the given numbers only. The worked steps blank every
answer value the provider marks (`___`), and a count that runs up to the answer is cut
("Count on 2: 7, …"); the Say: line keeps the given numbers and blanks the answer.

**The teacher's setting.** Settings → "Help after a wrong answer": support ladder (default) / worked
example only / none. Saved per device (cookie `mathquest_help`); a Direct Play link carries a
non-default choice in its settings suffix (`H1` worked example only, `H0` none; the default writes
nothing, so existing links are unchanged and an old app skips the token). No option key was needed.
A set whose Support level is 0 only ("nothing given") has its supports off: its ladder is the worked
example alone.

**Session data.** `state.sessionHelp` → the session history's per-skill `h`
(`{touch: 2, tile: 1, worked: 1}`: times each was shown); a quiz answer keeps `help` (the ids shown).

**Host hooks** (kept minimal; the screen-hosts lane owns these files): `answer-check.js` checkAnswer's
wrong branch → `practiceLadderWrong`; `worksheet.js` checkWorksheetAnswer /
checkWorksheetAnswerFromColumns wrong branches → `worksheetLadderWrong` (it waits while a word or a
fraction is still shorter than its answer); `quiz-take.js` recordAnswer → `quizLadderWrong`, the
instant feedback line, and `drawLadder` after the cell mounts. `screen-cell.js` `slotsFilled` now
reads a time's two boxes (`h:mm`), so a clock item on the online worksheet is checked live.

### S9.1 Round 2 (coordinator review, 2026-09-25)

- **Placement and size.** Touch dots, the boxed sign and the start arrow are drawn IN the kit cell.
  The dot tile / ten frame is drawn as counters BESIDE the number it stands for: a vertical fact
  gets a column of frames level with its rows (the rows grow to the frame's height), a horizontal
  fact a frame under each number; a subtraction's minuend frame crosses out the ones taken away
  (white-edged crosses). Frames are at least 78 px tall (26 px counters, 6.9 mm: RP-5). When the
  cell has no room beside the fact, or a number is over 10, the frames go under the problem. Every
  other picture is its S4 pane at L (marks and checklists at M) with `--mq-k2` at least 3.8 px
  (4.4 px from 600 px wide); a pane wider than a phone's cell is drawn at a smaller millimetre,
  never cut off.
- **No competing chrome mid-ladder.** On a ladder step: no red flash, no shake, no "Keep trying"
  or "Timer paused" toast (the timer still pauses), no "Next →" under the feedback (the card's own
  Skip stays), no Solution button, no hint popup. Adaptive level changes are HELD while the ladder
  climbs and recorded when the item ends (a right answer, a skip, the next item).
- **Fonts.** The worked panel, its Say: line and the worksheet's ladder line are Andika, ink on
  paper, with the single grey.
- **Every card checker.** checkAnswer (typed, choice, word-work), the fraction boxes, box division,
  perimeter + area, the inline blanks (rounding on a number line) and the draw-the-hands clock
  (`widgetLadderWrong`; the widget unlocks for another try, its face gains the minute ring, then
  the checklist). The word-work cell's ladder is its own keyword supports: key words bold and
  underlined, then the bar model (or the key-word box on a two-step story). Rounding gets the
  skill's rounding panes; box division and coins their checklists; a skill with no support of its
  own gets the worked steps alone.
- **Count worked step.** A count from 1 up to the answer ("Count: 1, 2, 3 ... 18.") becomes
  "Count: say one number for each one."
- **Gate.** `ws-support-ladder` (the four skills on all three hosts, at 1280 and 390 with
  `--shots`) and `ws-support-ladder --wide` (15 skills, one per family and every card checker).
